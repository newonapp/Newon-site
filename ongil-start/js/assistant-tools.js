/*
 * ONGIL 도우미 — the tool layer (Phase 10): what may be done, with which data, and only after whose confirmation.
 *
 *   USER INPUT → matchIntent (assistant-intents.js) → TOOL REGISTRY → READ / PREPARE → 확인 → EXECUTE → RESULT
 *
 * The matcher (today) or a server model (later) only PROPOSES a tool and arguments. This file decides:
 *   · the tool must be in the registry (no other function can be reached),
 *   · its arguments must pass the tool's schema (unknown fields, wrong types, long text, bad dates are refused),
 *   · a WRITE tool runs only for a pending action this assistant prepared and the person confirmed, once.
 *
 * Tool        { id, description, mode, privacy, requiresConfirmation, schema, execute }
 *   mode      READ · NAVIGATE · PREPARE · WRITE
 *   privacy   PUBLIC · STANDARD_LOCAL · PRIVATE · HEALTH_ADJACENT  (what the tool touches or opens)
 * ToolResult  { status, title, message, items?, route?, routeLabel?, pending? }
 *   status    SUCCESS · EMPTY · UNAVAILABLE · ERROR · NEEDS_CONFIRMATION
 *
 * Data access is an allowlist: the registry is handed the calendar, task, routine and saved stores, the public
 * search and the family-connection state — nothing else. It cannot read storage, the profile, check-ins,
 * medication, symptoms, health notes, the journal, expenses, family settings or community writing, and has no
 * WRITE tool for any of them. Health and family requests open the screen where the person does it themselves.
 *
 * Nothing is stored by this layer: pending actions and the conversation live in memory and end with the page.
 */
import { safeText, savedSyncPolicy, SAVED_TYPE_LABELS, isPlainObject } from './contracts.js';
import { dateKey, isDateKey, isTime, formatDateKey, formatTime } from './dates.js';
import { LIFE_LIMITS, isHealthEvent, eventKind, eventKindLabel } from './life-contracts.js';
import { safeRoute, PUBLIC_CONTENT_TYPES, CONTENT_TYPES } from './routes.js';
import { hashFor } from './router.js';
import { CARE_CATEGORY_IDS, careCategoryById } from './care-contracts.js';
import { ENJOY_CATEGORY_IDS, enjoyCategoryById } from './enjoy-contracts.js';
import { matchIntent, INTENT_IDS, MODEL, INPUT_MAX } from './assistant-intents.js';

export const TOOL_MODES = Object.freeze(['READ', 'NAVIGATE', 'PREPARE', 'WRITE']);
export const TOOL_PRIVACY = Object.freeze(['PUBLIC', 'STANDARD_LOCAL', 'PRIVATE', 'HEALTH_ADJACENT']);
export const RESULT_STATUSES = Object.freeze(['SUCCESS', 'EMPTY', 'UNAVAILABLE', 'ERROR', 'NEEDS_CONFIRMATION']);
export const RESULT_ITEMS_MAX = 8;
export const PENDING_TTL_MS = 5 * 60 * 1000;
export const HISTORY_MAX = 6;
/* what ONGIL 도우미 never changes: these are done by the person, on their own screen */
export const NO_WRITE_AREAS = Object.freeze(['checkins', 'medications', 'medicationLogs', 'symptoms', 'healthNotes', 'familySharing', 'helpRequests', 'expenses', 'journal', 'communityPosts', 'groupDrafts', 'meetupDrafts', 'routines', 'profile']);

/* fixed sentences: a tool never shows a technical message */
export const MESSAGES = Object.freeze({
  UNSUPPORTED: '지금은 이 요청을 바로 처리할 수 없어요.',
  ERROR: '지금은 처리하지 못했어요. 잠시 뒤 다시 해 주세요.',
  NOT_FOUND_LOADED: '현재 불러온 정보에서는 찾지 못했어요.',
  NO_FAMILY: '지금은 가족과 연결되어 있지 않아서 보낼 수 없어요. 무엇을 보여 줄지 미리 볼 수만 있어요.',
  HEALTH: 'ONGIL은 건강 상태를 판단하거나 약을 권하지 않아요. 몸이 걱정되면 의사나 약사와 상의해 주세요.',
  EMERGENCY: 'ONGIL은 급한 상황인지 판단하거나 대신 신고하지 않아요. 급하다고 느끼면 119에 직접 전화해 주세요.',
  EXPIRED: '시간이 지나서 취소했어요. 다시 요청해 주세요.',
  NO_PENDING: '확인할 것이 없어요.',
});

/* ───────── argument schemas ───────── */

const f = (type, extra = {}) => Object.freeze({ type, required: false, ...extra });
const checkField = (spec, value) => {
  if (value === undefined || value === null || value === '') return spec.required ? null : { value: spec.type === 'text' ? '' : value === undefined || value === null ? '' : value };
  if (typeof value !== 'string') return null;
  if (spec.type === 'date') return isDateKey(value) ? { value } : null;
  if (spec.type === 'time') return isTime(value) ? { value } : null;
  if (spec.type === 'enum') return spec.values.includes(value) ? { value } : null;
  if (spec.type === 'text') {
    if (value.length > spec.max) return null;
    const clean = safeText(value, spec.max);
    /* markup and address characters have no place in a title or a search word */
    if (/[<>]/.test(clean) || /^(javascript|data|vbscript):/i.test(clean)) return null;
    return clean || !spec.required ? { value: clean } : null;
  }
  return null;
};
/* → { ok: true, args } with exactly the schema's fields, or { ok: false, reason } */
export function validateArgs(schema, input) {
  const src = input === undefined ? {} : input;
  if (!isPlainObject(src)) return { ok: false, reason: 'INVALID_ARGS' };
  for (const key of Object.keys(src)) if (!Object.prototype.hasOwnProperty.call(schema, key)) return { ok: false, reason: 'UNKNOWN_FIELD' };
  const args = {};
  for (const [key, spec] of Object.entries(schema)) {
    const checked = checkField(spec, src[key]);
    if (!checked) return { ok: false, reason: 'INVALID_ARGS' };
    args[key] = checked.value;
  }
  return { ok: true, args };
}

/* ───────── results ───────── */

const item = (title, detail = '', route = '') => ({ title, detail, route });
/* whatever a tool answers is rebuilt here: enum status, bounded text, routes inside ONGIL only */
export function cleanResult(raw) {
  if (!isPlainObject(raw) || !RESULT_STATUSES.includes(raw.status)) return { status: 'ERROR', title: '', message: MESSAGES.ERROR, items: [], route: '', routeLabel: '' };
  const items = (Array.isArray(raw.items) ? raw.items : [])
    .filter((it) => isPlainObject(it) && safeText(it.title, 120))
    .slice(0, RESULT_ITEMS_MAX)
    .map((it) => ({ title: safeText(it.title, 120), detail: safeText(it.detail, 160), route: safeRoute(it.route) }));
  const out = { status: raw.status, title: safeText(raw.title, 80), message: safeText(raw.message, 240), items, route: safeRoute(raw.route), routeLabel: safeText(raw.routeLabel, 40) };
  if (Number.isSafeInteger(raw.more) && raw.more > 0) out.more = raw.more;
  if (raw.navigate === true && out.route) out.navigate = true;
  return out;
}
const dayWord = (date, today) => (date === today ? '오늘' : formatDateKey(date));

/* ───────── the registry ───────── */

const VIEW_LABELS = Object.freeze({ home: '홈', life: '내 생활', health: '건강·안부', family: '가족', care: '돌봄·서비스', enjoy: '즐길거리', community: '커뮤니티', store: '스토어', saved: '저장' });
const NAV_PRIVACY = Object.freeze({ home: 'PUBLIC', life: 'STANDARD_LOCAL', health: 'HEALTH_ADJACENT', family: 'PRIVATE', care: 'PUBLIC', enjoy: 'PUBLIC', community: 'PRIVATE', store: 'PUBLIC', saved: 'PUBLIC' });
/* sections a navigation tool may open — each is checked again by routes.js before it is used */
const NAV_SECTIONS = Object.freeze({
  life: Object.freeze({ calendar: '#life/calendar', tasks: '#life/tasks', routines: '#life/routines', journal: '#life/journal', expenses: '#life/expenses' }),
  health: Object.freeze({ checkin: '#life/checkin', medication: '#life/medication', symptoms: '#life/symptoms', 'health-notes': '#life/health-notes' }),
  community: Object.freeze({ write: '#community/write', groups: '#community/groups' }),
});
const SECTION_LABELS = Object.freeze({ calendar: '캘린더', tasks: '할 일', routines: '루틴', journal: '기록', expenses: '생활비', checkin: '안부 기록', medication: '복약 기록', symptoms: '증상 기록', 'health-notes': '건강 메모', write: '글쓰기', groups: '모임' });

/*
 * deps is the whole of what the tools can touch (see the header). `today` gives the local calendar day.
 */
function buildRegistry({ schedule, tasks, routines, saved, search, familyConnection, today = () => dateKey() }) {
  const tools = new Map();
  const define = (t) => {
    if (!/^[a-z][a-z_]{2,40}$/.test(t.id) || !TOOL_MODES.includes(t.mode) || !TOOL_PRIVACY.includes(t.privacy) || typeof t.execute !== 'function') throw new Error('INVALID_TOOL');
    tools.set(t.id, Object.freeze({ id: t.id, description: t.description, mode: t.mode, privacy: t.privacy, requiresConfirmation: t.mode === 'WRITE', schema: Object.freeze({ ...(t.schema || {}) }), execute: t.execute }));
  };
  const dayOf = (date) => date || today();
  const publicSaved = (type) => saved.list().filter((it) => savedSyncPolicy(it) === 'SYNCABLE' && PUBLIC_CONTENT_TYPES.includes(it.type) && (!type || it.type === type));
  const cut = (rows) => ({ items: rows.slice(0, RESULT_ITEMS_MAX), more: Math.max(0, rows.length - RESULT_ITEMS_MAX) });

  /* Completion V2: a 병원 일정 / 건강검진 is read as its kind only — never its hospital, memo or 검진 종류 */
  const scheduleRows = (date) => schedule.listForDate(date).map((e) => item(isHealthEvent(e) ? eventKindLabel(eventKind(e)) : e.title, [e.time ? formatTime(e.time) : '시간 없음', e.completed ? '마침' : ''].filter(Boolean).join(' · '), '#life/calendar'));
  const taskRows = (date) => tasks.dueOn(date).map((t) => item(t.title, t.completed ? '마침' : '아직 안 함', '#life/tasks'));
  const routineRows = (date) => routines.listForDate(date).map((r) => item(r.title, [r.time ? formatTime(r.time) : '', r.completed ? '마침' : '아직 안 함'].filter(Boolean).join(' · '), '#life/routines'));

  /* READ — the person's own plan for one day (calendar, tasks, routines). Nothing else personal is readable. */
  define({
    id: 'get_today_schedule', description: '하루의 일정을 읽는다', mode: 'READ', privacy: 'STANDARD_LOCAL', schema: { date: f('date') },
    execute({ date }) {
      const d = dayOf(date);
      const rows = scheduleRows(d);
      if (!rows.length) return { status: 'EMPTY', title: `${dayWord(d, today())} 일정`, message: `${dayWord(d, today())} 등록된 일정이 없어요.`, route: '#life/calendar', routeLabel: '캘린더 열기' };
      return { status: 'SUCCESS', title: `${dayWord(d, today())} 일정 ${rows.length}개`, message: '', ...cut(rows), route: '#life/calendar', routeLabel: '캘린더 열기' };
    },
  });
  define({
    id: 'get_today_tasks', description: '하루에 마감인 할 일을 읽는다', mode: 'READ', privacy: 'STANDARD_LOCAL', schema: { date: f('date') },
    execute({ date }) {
      const d = dayOf(date);
      const rows = taskRows(d);
      const open = tasks.openCount();
      const note = open ? `아직 하지 않은 할 일은 모두 ${open}개예요.` : '';
      if (!rows.length) return { status: 'EMPTY', title: `${dayWord(d, today())} 할 일`, message: `${dayWord(d, today())}까지 하기로 한 일이 없어요. ${note}`.trim(), route: '#life/tasks', routeLabel: '할 일 열기' };
      return { status: 'SUCCESS', title: `${dayWord(d, today())} 할 일 ${rows.length}개`, message: note, ...cut(rows), route: '#life/tasks', routeLabel: '할 일 열기' };
    },
  });
  define({
    id: 'get_today_routines', description: '하루의 루틴을 읽는다', mode: 'READ', privacy: 'STANDARD_LOCAL', schema: { date: f('date') },
    execute({ date }) {
      const d = dayOf(date);
      const rows = routineRows(d);
      if (!rows.length) return { status: 'EMPTY', title: `${dayWord(d, today())} 루틴`, message: `${dayWord(d, today())} 하기로 한 루틴이 없어요.`, route: '#life/routines', routeLabel: '루틴 열기' };
      return { status: 'SUCCESS', title: `${dayWord(d, today())} 루틴 ${rows.length}개`, message: '', ...cut(rows), route: '#life/routines', routeLabel: '루틴 열기' };
    },
  });
  define({
    id: 'get_today_overview', description: '오늘의 일정, 할 일, 루틴을 함께 읽는다', mode: 'READ', privacy: 'STANDARD_LOCAL', schema: {},
    execute() {
      const d = today();
      const tag = (label, rows) => rows.map((r) => item(`${label} · ${r.title}`, r.detail, r.route));
      const s = scheduleRows(d);
      const t = taskRows(d);
      const r = routineRows(d);
      const rows = [...tag('일정', s), ...tag('할 일', t), ...tag('루틴', r)];
      if (!rows.length) return { status: 'EMPTY', title: '오늘', message: '오늘 등록된 일정, 할 일, 루틴이 없어요.', route: '#life', routeLabel: '내 생활 열기' };
      return { status: 'SUCCESS', title: '오늘', message: `일정 ${s.length}개 · 할 일 ${t.length}개 · 루틴 ${r.length}개`, ...cut(rows), route: '#life', routeLabel: '내 생활 열기' };
    },
  });

  /* READ — saved PUBLIC items only. A saved post is the person's own writing (LOCAL_ONLY) and is left out. */
  define({
    id: 'get_saved_items', description: '저장한 공개 항목을 읽는다 (저장한 글 제외)', mode: 'READ', privacy: 'PUBLIC', schema: { type: f('enum', { values: PUBLIC_CONTENT_TYPES }) },
    execute({ type }) {
      const rows = publicSaved(type).map((it) => item(it.title, SAVED_TYPE_LABELS[it.type] || '', '#saved'));
      const what = type ? `저장한 ${CONTENT_TYPES[type].label}` : '저장한 것';
      if (!rows.length) return { status: 'EMPTY', title: what, message: `아직 ${what} 목록이 비어 있어요.`, route: '#saved', routeLabel: '저장함 열기' };
      return { status: 'SUCCESS', title: `${what} ${rows.length}개`, message: '', ...cut(rows), route: '#saved', routeLabel: '저장함 열기' };
    },
  });

  /* READ — public information the screens loaded during this visit, through the existing search providers */
  const searchTool = (id, providerId, label, baseRoute, categories, routeFor) =>
    define({
      id, description: `이번 방문에 불러온 ${label} 정보에서 찾는다`, mode: 'READ', privacy: 'PUBLIC', schema: { query: f('text', { max: 30 }), category: f('enum', { values: categories }) },
      async execute({ query, category }) {
        const route = category ? routeFor(category) : baseRoute;
        const open = { route, routeLabel: `${label} 열기` };
        if (!query) return { status: 'SUCCESS', title: `${label}에서 찾아보기`, message: `${label} 화면에서 직접 찾아볼 수 있어요. 찾을 말을 함께 적으면 이번 방문에 불러온 정보에서 찾아 드려요.`, ...open };
        let outcome;
        try {
          outcome = await search.query(query, { only: [providerId] });
        } catch {
          outcome = null;
        }
        if (!outcome || outcome.failed.length) return { status: 'UNAVAILABLE', title: label, message: `지금은 ${label} 정보를 불러오지 못했어요.`, ...open };
        const rows = outcome.results.map((r) => item(r.title, r.description, r.route));
        if (!rows.length) return { status: 'EMPTY', title: `‘${query}’`, message: `${MESSAGES.NOT_FOUND_LOADED} ${label} 화면에서 직접 찾아볼 수 있어요.`, ...open };
        return { status: 'SUCCESS', title: `‘${query}’ ${outcome.total}개`, message: '이번 방문에 불러온 정보에서 찾았어요.', items: rows.slice(0, RESULT_ITEMS_MAX), more: Math.max(0, outcome.total - Math.min(rows.length, RESULT_ITEMS_MAX)), ...open };
      },
    });
  searchTool('search_care', 'care', '돌봄·서비스', '#care', CARE_CATEGORY_IDS, (c) => (careCategoryById(c) ? `#care/${c}` : '#care'));
  searchTool('search_enjoy', 'enjoy', '즐길거리', '#enjoy', ENJOY_CATEGORY_IDS, (c) => (enjoyCategoryById(c) ? `#enjoy/${c.toLowerCase()}` : '#enjoy'));
  searchTool('search_store', 'store', '스토어', '#store', [], () => '#store');

  /* NAVIGATE — known screens only; the address comes from router.js / routes.js, never from the request text */
  for (const view of Object.keys(VIEW_LABELS)) {
    const sections = NAV_SECTIONS[view] || null;
    define({
      id: `open_${view}`, description: `${VIEW_LABELS[view]} 화면을 연다`, mode: 'NAVIGATE', privacy: NAV_PRIVACY[view], schema: sections ? { section: f('enum', { values: Object.keys(sections) }) } : {},
      execute({ section }) {
        const route = safeRoute(section ? sections[section] : hashFor(view));
        if (!route) return { status: 'ERROR' };
        const label = section ? SECTION_LABELS[section] : VIEW_LABELS[view];
        return { status: 'SUCCESS', title: `${label} 화면`, message: `${label} 화면을 열 수 있어요.`, route, routeLabel: `${label} 열기`, navigate: true };
      },
    });
  }

  /* PREPARE — nothing is saved: the draft is shown and waits for 확인 */
  const eventSchema = { title: f('text', { max: LIFE_LIMITS.eventTitle, required: true }), date: f('date', { required: true }), time: f('time') };
  const taskSchema = { title: f('text', { max: LIFE_LIMITS.taskTitle, required: true }), dueDate: f('date') };
  define({
    id: 'prepare_calendar_event', description: '일정 초안을 만들어 보여 준다 (저장하지 않음)', mode: 'PREPARE', privacy: 'STANDARD_LOCAL', schema: eventSchema,
    execute({ title, date, time }) {
      const same = schedule.listForDate(date).some((e) => e.title === title && e.time === (time || ''));
      return { status: 'NEEDS_CONFIRMATION', title: '일정 추가', message: same ? '같은 날 같은 일정이 이미 있어요. 그래도 하나 더 추가할까요?' : '이 일정으로 추가할까요?', draft: { toolId: 'create_calendar_event', payload: { title, date, time: time || '' }, summary: [['제목', title], ['날짜', formatDateKey(date)], ['시간', time ? formatTime(time) : '시간 없음']], duplicate: same } };
    },
  });
  define({
    id: 'prepare_task', description: '할 일 초안을 만들어 보여 준다 (저장하지 않음)', mode: 'PREPARE', privacy: 'STANDARD_LOCAL', schema: taskSchema,
    execute({ title, dueDate }) {
      const same = tasks.list({ filter: 'open' }).some((t) => t.title === title && t.dueDate === (dueDate || ''));
      return { status: 'NEEDS_CONFIRMATION', title: '할 일 추가', message: same ? '같은 할 일이 이미 있어요. 그래도 하나 더 추가할까요?' : '이 할 일로 추가할까요?', draft: { toolId: 'create_task', payload: { title, dueDate: dueDate || '' }, summary: [['할 일', title], ['마감', dueDate ? formatDateKey(dueDate) : '날짜 없음']], duplicate: same } };
    },
  });
  /* PREPARE — a preview of what could be shown to family. There is no send, invite or message tool. */
  define({
    id: 'prepare_family_share', description: '가족에게 보여 줄 수 있는 것을 미리 본다 (보내지 않음)', mode: 'PREPARE', privacy: 'PRIVATE', schema: {},
    execute() {
      const connection = typeof familyConnection === 'function' ? familyConnection() : null;
      const connected = !!connection && connection.available === true;
      const rows = publicSaved('').slice(0, 5).map((it) => item(it.title, SAVED_TYPE_LABELS[it.type] || '', '#saved'));
      const tail = rows.length ? '보여 줄 수 있는 것은 저장해 둔 공개 정보예요. 건강 기록이나 일기는 들어가지 않아요.' : '보여 주고 싶은 프로그램이나 장소를 먼저 저장해 두세요.';
      return { status: 'UNAVAILABLE', title: '가족에게 보여주기 (미리보기)', message: `${connected ? '도우미는 가족에게 보내지 않아요. 가족 화면에서 직접 해 주세요.' : MESSAGES.NO_FAMILY} ${tail}`, items: rows, route: '#family', routeLabel: '가족 화면 열기' };
    },
  });

  /* WRITE — the two things ONGIL 도우미 may save, through the stores' own add(), only after confirmation */
  define({
    id: 'create_calendar_event', description: '확인한 일정을 캘린더에 추가한다', mode: 'WRITE', privacy: 'STANDARD_LOCAL', schema: eventSchema,
    execute({ title, date, time }) {
      const r = schedule.add({ title, date, time: time || '' });
      if (!r || r.ok !== true) return { status: 'ERROR' };
      return { status: 'SUCCESS', title: '일정을 추가했어요', message: '', items: [item(r.event.title, [formatDateKey(r.event.date), r.event.time ? formatTime(r.event.time) : '시간 없음'].join(' · '), '#life/calendar')], route: '#life/calendar', routeLabel: '캘린더 열기' };
    },
  });
  define({
    id: 'create_task', description: '확인한 할 일을 추가한다', mode: 'WRITE', privacy: 'STANDARD_LOCAL', schema: taskSchema,
    execute({ title, dueDate }) {
      const r = tasks.add({ title, dueDate: dueDate || '' });
      if (!r || r.ok !== true) return { status: 'ERROR' };
      return { status: 'SUCCESS', title: '할 일을 추가했어요', message: '', items: [item(r.task.title, r.task.dueDate ? formatDateKey(r.task.dueDate) : '날짜 없음', '#life/tasks')], route: '#life/tasks', routeLabel: '할 일 열기' };
    },
  });

  const meta = (t) => ({ id: t.id, description: t.description, mode: t.mode, privacy: t.privacy, requiresConfirmation: t.requiresConfirmation, fields: Object.keys(t.schema) });
  /* the only way a tool runs. `confirmed` is true solely inside createAssistant().confirm(). */
  async function execute(id, args, confirmed) {
    const tool = typeof id === 'string' && tools.has(id) ? tools.get(id) : null;
    if (!tool) return { result: cleanResult(null), reason: 'UNKNOWN_TOOL' };
    if (tool.mode === 'WRITE' && confirmed !== true) return { result: cleanResult(null), reason: 'CONFIRMATION_REQUIRED' };
    const checked = validateArgs(tool.schema, args);
    if (!checked.ok) return { result: cleanResult(null), reason: checked.reason };
    let raw;
    try {
      raw = await tool.execute(checked.args);
    } catch {
      return { result: cleanResult(null), reason: 'TOOL_FAILED' };
    }
    const result = cleanResult(raw);
    const draft = result.status === 'NEEDS_CONFIRMATION' && isPlainObject(raw.draft) && tools.has(raw.draft.toolId) && tools.get(raw.draft.toolId).mode === 'WRITE' ? raw.draft : null;
    if (result.status === 'NEEDS_CONFIRMATION' && !draft) return { result: cleanResult(null), reason: 'TOOL_FAILED' };
    return { result, draft, reason: '' };
  }
  const api = Object.freeze({
    ids: () => [...tools.keys()],
    has: (id) => typeof id === 'string' && tools.has(id),
    get: (id) => (typeof id === 'string' && tools.has(id) ? meta(tools.get(id)) : null),
    list: () => [...tools.values()].map(meta),
    /* READ, NAVIGATE and PREPARE only — a WRITE tool cannot be run from outside */
    run: (id, args) => execute(id, args, false).then((r) => ({ ...r.result, ...(r.reason ? { reason: r.reason } : {}) })),
  });
  return { api, execute };
}
/* the registry as others may use it: descriptions and run() without WRITE */
export const createToolRegistry = (deps) => buildRegistry(deps).api;

/* ───────── intent → tool ───────── */

export const INTENT_TOOLS = Object.freeze({
  VIEW_TODAY: 'get_today_overview',
  VIEW_SCHEDULE: 'get_today_schedule',
  VIEW_TASKS: 'get_today_tasks',
  VIEW_ROUTINES: 'get_today_routines',
  VIEW_SAVED: 'get_saved_items',
  SEARCH_CARE: 'search_care',
  SEARCH_ENJOY: 'search_enjoy',
  SEARCH_STORE: 'search_store',
  ADD_CALENDAR: 'prepare_calendar_event',
  ADD_TASK: 'prepare_task',
  OPEN_HOME: 'open_home',
  OPEN_LIFE: 'open_life',
  OPEN_HEALTH: 'open_health',
  OPEN_FAMILY: 'open_family',
  OPEN_CARE: 'open_care',
  OPEN_ENJOY: 'open_enjoy',
  OPEN_COMMUNITY: 'open_community',
  OPEN_STORE: 'open_store',
  OPEN_SAVED: 'open_saved',
  PREPARE_FAMILY_SHARE: 'prepare_family_share',
  HEALTH_SAFETY: '',
  NOT_AVAILABLE: '',
  HELP: '',
  UNSUPPORTED: '',
});

/* what the panel offers as examples — each is something that really works. `run` examples run as they are;
   `fill` examples are put in the box for the person to change (a date and a title are theirs to give). */
export const SUGGESTIONS = Object.freeze([
  Object.freeze({ id: 'today', label: '오늘 일정 보기', text: '오늘 일정 알려줘', kind: 'run' }),
  Object.freeze({ id: 'tasks', label: '오늘 할 일 보기', text: '오늘 할 일 알려줘', kind: 'run' }),
  Object.freeze({ id: 'saved', label: '저장한 것 보기', text: '저장한 것 보여줘', kind: 'run' }),
  Object.freeze({ id: 'care', label: '돌봄 서비스 찾기', text: '돌봄 서비스 찾아줘', kind: 'run' }),
  Object.freeze({ id: 'enjoy', label: '즐길거리 찾기', text: '즐길거리 찾아줘', kind: 'run' }),
  Object.freeze({ id: 'store', label: '상품 찾기', text: '상품 찾아줘', kind: 'run' }),
  Object.freeze({ id: 'add-event', label: '일정 추가', text: '내일 오후 2시 병원 일정 추가', kind: 'fill' }),
  Object.freeze({ id: 'add-task', label: '할 일 추가', text: '내일 장보기 할 일 추가', kind: 'fill' }),
]);

const REASON_MESSAGES = Object.freeze({
  EMPTY: '찾거나 할 일을 적어 주세요.',
  TOO_LONG: `${INPUT_MAX}자 안으로 짧게 적어 주세요.`,
  NO_MATCH: MESSAGES.UNSUPPORTED,
  DATE_MISSING: '날짜를 함께 적어 주세요. 예: 내일 오후 2시 병원 일정 추가',
  DATE_UNCLEAR: '날짜를 알아듣지 못했어요. 오늘, 내일, 모레처럼 적거나 2026-01-05 같은 모양으로 적어 주세요.',
  DATE_INVALID: '달력에 없는 날짜예요. 날짜를 다시 확인해 주세요.',
  TIME_UNCLEAR: '시간을 알아듣지 못했어요. 오후 2시, 오전 9시 30분, 14:00처럼 적어 주세요.',
  TITLE_MISSING: '무엇을 추가할지 함께 적어 주세요. 예: 내일 장보기 할 일 추가',
  PURCHASE: 'ONGIL에서는 결제나 주문을 하지 않아요.',
  BOOKING: '예약은 ONGIL에서 할 수 없어요. 일정으로 적어 둘 수는 있어요.',
  MESSAGE: '문자나 메시지는 보내지 않아요.',
  CALL: '전화는 걸지 않아요.',
  EDIT: '이미 적어 둔 것을 고치거나 지우는 일은 도우미가 하지 않아요. 그 화면에서 직접 해 주세요.',
});
const SENSITIVE_NOTE = '이 기록은 직접 남겨 주세요. 도우미가 대신 적거나 고르지 않아요.';

/*
 * createAssistant(deps) — one request in, one result out.
 *   handle(text)  → { intent, toolId, reason, result }      never throws
 *   confirm(id)   → { toolId, result }   runs the pending WRITE once; a second call finds nothing to run
 *   cancel(id)    → { toolId, result }   drops it; storage is untouched
 *   pending()     → { id, toolId, summary, createdAt } | null     (memory only)
 */
export function createAssistant({ now = () => Date.now(), today = () => dateKey(now()), ...deps }) {
  const { api, execute } = buildRegistry({ ...deps, today });
  let pending = null;
  let seq = 0;
  const plain = (status, message, extra = {}) => cleanResult({ status, title: '', message, ...extra });
  const notServed = (reason, extra) => plain('UNAVAILABLE', REASON_MESSAGES[reason] || MESSAGES.UNSUPPORTED, extra);

  async function handle(text) {
    let m;
    try {
      m = matchIntent(text, { today: today() });
    } catch {
      return { intent: 'UNSUPPORTED', toolId: '', reason: 'NO_MATCH', result: plain('ERROR', MESSAGES.ERROR) };
    }
    const intent = INTENT_IDS.includes(m.intent) ? m.intent : 'UNSUPPORTED';
    const out = (result, toolId = '', reason = m.reason) => ({ intent, toolId, reason, result });
    if (intent === 'UNSUPPORTED') return out({ ...notServed(m.reason || 'NO_MATCH'), suggest: true });
    if (intent === 'NOT_AVAILABLE') return out({ ...notServed(m.reason), suggest: true });
    if (intent === 'HEALTH_SAFETY') return out(plain('UNAVAILABLE', m.reason === 'EMERGENCY' ? MESSAGES.EMERGENCY : MESSAGES.HEALTH, { title: '건강에 대한 판단', route: '#health', routeLabel: '건강·안부 화면 열기' }));
    if (intent === 'HELP') return out(cleanResult({ status: 'SUCCESS', title: 'ONGIL 도우미가 할 수 있는 것', message: '정해진 요청만 알아들어요. 아래에서 고르거나 비슷하게 적어 주세요.', items: SUGGESTIONS.map((s) => ({ title: s.label, detail: `예: ${s.text}` })) }));
    /* a request the matcher understood but could not complete (no date, unclear time, no title) is asked again, never guessed */
    if (m.reason && m.reason !== 'SENSITIVE_RECORD') return out(notServed(m.reason));
    const toolId = INTENT_TOOLS[intent];
    const ran = await execute(toolId, m.args, false);
    if (ran.reason) return out(plain('ERROR', MESSAGES.ERROR), toolId, m.reason);
    const result = ran.result;
    if (m.reason === 'SENSITIVE_RECORD') {
      /* the screen is offered, not opened: the person reads why first */
      delete result.navigate;
      result.message = SENSITIVE_NOTE;
    }
    if (result.status === 'NEEDS_CONFIRMATION') {
      seq += 1;
      pending = { id: `pa-${seq}`, toolId: ran.draft.toolId, payload: { ...ran.draft.payload }, summary: ran.draft.summary.map(([k, v]) => [safeText(k, 20), safeText(v, 120)]), createdAt: now() };
      result.pending = { id: pending.id, toolId: pending.toolId, summary: pending.summary.map((row) => [...row]) };
    }
    return out(result, toolId);
  }

  async function confirm(id) {
    const p = pending;
    if (!p || p.id !== id) return { toolId: '', result: plain('ERROR', MESSAGES.NO_PENDING) };
    /* taken out BEFORE it runs: a second 확인 (double click, repeated Enter) finds nothing */
    pending = null;
    if (now() - p.createdAt > PENDING_TTL_MS) return { toolId: p.toolId, result: plain('UNAVAILABLE', MESSAGES.EXPIRED) };
    const ran = await execute(p.toolId, p.payload, true);
    return { toolId: p.toolId, result: ran.reason ? plain('ERROR', MESSAGES.ERROR) : ran.result };
  }
  function cancel(id) {
    const p = pending;
    if (!p || p.id !== id) return { toolId: '', result: plain('ERROR', MESSAGES.NO_PENDING) };
    pending = null;
    return { toolId: p.toolId, result: cleanResult({ status: 'SUCCESS', title: '취소했어요', message: '아무것도 바꾸지 않았어요.' }) };
  }

  return Object.freeze({
    model: MODEL,
    tools: api,
    suggestions: SUGGESTIONS,
    handle,
    confirm,
    cancel,
    pending: () => (pending ? { id: pending.id, toolId: pending.toolId, summary: pending.summary.map((row) => [...row]), createdAt: pending.createdAt } : null),
  });
}
