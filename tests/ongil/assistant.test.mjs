// ONGIL Phase 10 — ONGIL AI V1 ("ONGIL 도우미"): an ACTION layer, not a chat. No language model is connected.
//   OG-AI-1 … 15   core: entry, panel, truthfulness, matcher, intents, tool registry and contracts
//   OG-AI-16 … 25  read: today, saved, care / enjoy / store search, nothing invented
//   OG-AI-26 … 35  write: prepare → preview → confirm, once; cancel; no silent change
//   OG-AI-36 … 50  privacy: health, family, nothing stored, analytics without words, minimal data access
//   OG-AI-51 … 65  dates, routes, security
//   OG-AI-66 … 78  keyboard, focus, responsive, performance, regression
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
// Browser QA (390 / 820 / 1440) runs from a harness outside the repository — see docs/ongil/PHASE_10_ONGIL_AI_V1.md.
// Everything built below is a TEST FIXTURE; none of it is shipped.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import * as I from '../../ongil-start/js/assistant-intents.js';
import * as T from '../../ongil-start/js/assistant-tools.js';
import * as A from '../../ongil-start/js/analytics.js';
import * as R from '../../ongil-start/js/routes.js';
import { VIEWS, OVERLAYS, hashFor } from '../../ongil-start/js/router.js';
import { GLOBAL_ENTRIES, AREAS } from '../../ongil-start/js/areas.js';
import { createInstrumentation } from '../../ongil-start/js/instrument.js';
import { createSearch, createCareProvider, createEnjoyProvider, createStoreProvider, createSavedProvider, createAreaProvider } from '../../ongil-start/js/search.js';
import * as C from '../../ongil-start/js/contracts.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createJournalStore } from '../../ongil-start/js/journal.js';
import { createExpenseStore } from '../../ongil-start/js/expenses.js';
import { familyConnection } from '../../ongil-start/js/onboarding.js';
import { sanitizeProducts } from '../../ongil-start/js/store-contracts.js';
import { buildSystemStatus } from '../../ongil-start/js/admin.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const JS_DIR = path.join(ROOT, 'ongil-start/js');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const js = (f) => read(`ongil-start/js/${f}`);
const HTML = read('ongil-start/index.html');
const APP = js('app.js');
const VIEW = js('assistant-view.js');
const TOOLS_SRC = js('assistant-tools.js');
const INTENTS_SRC = js('assistant-intents.js');
const SHELL_CSS = read('ongil-start/styles/ongil-shell.css');
const P10 = ['assistant-intents.js', 'assistant-tools.js', 'assistant-view.js'];
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const PANEL = HTML.slice(HTML.indexOf('id="og-panel-assistant"'), HTML.indexOf('id="og-panel-notifications"'));
/* every sentence ONGIL 도우미 can show */
const COPY = [VIEW, TOOLS_SRC, INTENTS_SRC].map(code).join('\n') + PANEL;

const TODAY = '2026-10-03';
const NOW = new Date(2026, 9, 3, 9, 0, 0).getTime();
/* TEST FIXTURES — public items "loaded this visit" */
const CARE = [
  { type: 'CARE_SERVICE', id: 'c1', title: '검증 병원 동행 서비스', summary: '병원에 함께 가요', category: 'hospital-escort', sourceName: '검증 출처' },
  { type: 'FACILITY', id: 'c2', title: '검증 복지관', address: '서울 검증로 1', category: 'facility', sourceName: '검증 출처' },
];
const ENJOY = [
  { type: 'CLASS', id: 'e1', title: '검증 요가 강좌', organization: '검증 기관', category: 'EXERCISE', sourceName: '검증 출처' },
  { type: 'PLACE', id: 'e2', title: '검증 공원', address: '서울 검증로 2', category: 'OUTING', sourceName: '검증 출처' },
];
const PRODUCTS = sanitizeProducts(Array.from({ length: 30 }, (_, i) => ({ id: `p${i}`, name: `검증 지팡이 ${i}`, category: 'MOBILITY', summary: '걷기 도움', brand: '검증브랜드', sellerName: '검증판매처', sellerUrl: `https://seller.example.test/${i}`, sourceName: '검증 출처', sourceUrl: 'https://source.example.test/' })));

function world({ seed, care = CARE, enjoy = ENJOY, store = PRODUCTS, providers = null } = {}) {
  const clock = { t: NOW };
  const now = () => clock.t;
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  const schedule = createScheduleStore(storage, { now });
  const tasks = createTaskStore(storage, { now });
  const routines = createRoutineStore(storage, { now });
  const saved = createSavedStore(storage, { now });
  const calls = { care: 0, enjoy: 0, store: 0 };
  const search = createSearch();
  search.registerProvider(createAreaProvider(AREAS));
  search.registerProvider(createSavedProvider(saved, C.SAVED_TYPE_LABELS));
  search.registerProvider(createCareProvider(() => { calls.care += 1; return care; }));
  search.registerProvider(createEnjoyProvider(() => { calls.enjoy += 1; return enjoy; }));
  search.registerProvider(createStoreProvider(() => { calls.store += 1; return store; }));
  for (const p of providers || []) search.registerProvider(p);
  const assistant = T.createAssistant({ now, schedule, tasks, routines, saved, search, familyConnection });
  return { clock, now, backend, storage, schedule, tasks, routines, saved, search, calls, assistant };
}
const snapshot = (w) => JSON.stringify(w.backend.keys().sort().map((k) => [k, w.backend.getItem(k)]));
const ask = (w, text) => w.assistant.handle(text);
const match = (text) => I.matchIntent(text, { today: TODAY });

/* ═════════ core ═════════ */

test('OG-AI-1 entry: one global header button on every screen, also on a phone — not a new area in the menu', () => {
  assert.match(HTML, /<button type="button" class="og-tool" data-og-tool="assistant" aria-expanded="false" aria-controls="og-panel-assistant" aria-label="ONGIL 도우미">/);
  assert.equal((HTML.match(/data-og-tool="assistant"/g) || []).length, 1);
  assert.equal(/og-tool--wide" data-og-tool="assistant"/.test(HTML), false, 'not hidden on small screens');
  assert.deepEqual([...OVERLAYS], ['search', 'notifications', 'assistant']);
  assert.deepEqual(GLOBAL_ENTRIES.find((e) => e.id === 'assistant'), { id: 'assistant', label: 'ONGIL 도우미', kind: 'overlay', enabled: true });
  assert.equal(VIEWS.includes('assistant'), false, 'not a screen');
  assert.equal(/href="#(assistant|ai)"/.test(HTML), false);
  assert.equal(AREAS.some((a) => /assistant|도우미/.test(a.id + a.label)), false, 'no new area in the primary navigation');
  assert.equal(/data-og-modules="home"[\s\S]{0,400}도우미/.test(HTML), false, 'Home keeps its structure: the entry is the header button');
  assert.match(SHELL_CSS, /@media \(max-width: 430px\) \{\n {2}\.gnav--ongil \.gnav__wordmark \{ display: none; \}\n\}/, 'room for three 44px tools on a phone');
});

test('OG-AI-2 panel: title, short explanation, labelled input, examples, result area, close', () => {
  assert.match(PANEL, /role="region" aria-label="ONGIL 도우미" hidden>/);
  assert.match(PANEL, /<p class="og-panel__title">ONGIL 도우미<\/p>/);
  assert.match(PANEL, /<label class="visually-hidden" for="og-assistant-input">ONGIL에서 찾거나 할 일<\/label>/);
  assert.match(PANEL, /<input id="og-assistant-input" type="text" name="request" placeholder="예: 오늘 일정 알려줘" autocomplete="off" maxlength="120" enterkeyhint="go" \/>/);
  assert.match(PANEL, /<button type="submit">요청<\/button>/);
  assert.match(PANEL, /<p class="visually-hidden" role="status" aria-live="polite" data-og-assistant-status><\/p>/);
  assert.match(PANEL, /<div data-og-assistant aria-busy="false"><\/div>/);
  assert.match(PANEL, /data-og-assistant-close>닫기<\/button>/);
  assert.equal(I.INPUT_MAX, 120);
  assert.deepEqual(T.SUGGESTIONS.map((s) => s.label), ['오늘 일정 보기', '오늘 할 일 보기', '저장한 것 보기', '돌봄 서비스 찾기', '즐길거리 찾기', '상품 찾기', '일정 추가', '할 일 추가']);
  assert.match(VIEW, /'data-og-assistant-example': s\.id/);
});

test('OG-AI-3 model not connected: stated in code and on screen; no claim of a free conversation or an AI that answers', () => {
  assert.deepEqual({ ...I.MODEL }, { connected: false, provider: null, freeChat: false, medicalAdvice: false });
  assert.equal(world().assistant.model.connected, false);
  assert.match(PANEL, /data-og-assistant-mode="NOT_CONNECTED">ONGIL에서 할 일을 찾아드려요\. 정해진 요청만 알아듣고, 자유로운 대화는 아직 하지 않아요\.</);
  assert.equal(/무엇이든|뭐든지 물어|AI가 답변|인공지능이|챗봇|똑똑한|GPT|ChatGPT|생각하고 있어요|입력 중/.test(COPY), false);
  for (const f of P10) assert.equal(/fetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|openai|anthropic|api\/|https?:\/\//i.test(code(js(f))), false, `${f} makes no request`);
  const s = buildSystemStatus({ storage: world().storage, search: null });
  assert.deepEqual(s.assistant, { model: 'NOT_CONNECTED', intents: I.INTENT_IDS.length, writeTools: 2 });
  assert.match(js('admin-view.js'), /언어 모델 연결 없음 \(NOT CONNECTED\)/);
});

test('OG-AI-4 matcher: the requests of the brief map to the intended intents, deterministically', () => {
  const cases = {
    '오늘 일정 알려줘': 'VIEW_SCHEDULE', '오늘 해야 할 일 뭐 있어?': 'VIEW_TASKS', '오늘 뭐 해야 해': 'VIEW_TASKS', '루틴 보여줘': 'VIEW_ROUTINES', '오늘': 'VIEW_TODAY',
    '내가 저장한 프로그램 보여줘': 'VIEW_SAVED', '저장한 것 보여줘': 'VIEW_SAVED',
    '근처에서 배울 만한 거 찾아줘': 'SEARCH_ENJOY', '병원 갈 때 도움받을 서비스 찾아줘': 'SEARCH_CARE', '병원 동행 서비스 찾아줘': 'SEARCH_CARE', '상품 찾아줘': 'SEARCH_STORE',
    '엄마한테 이 프로그램 보여주고 싶어': 'PREPARE_FAMILY_SHARE', '가족에게 보여줘': 'PREPARE_FAMILY_SHARE',
    '내일 병원 일정 추가해줘': 'ADD_CALENDAR', '내일 장보기 할 일 추가해줘': 'ADD_TASK',
    '건강 화면 열어줘': 'OPEN_HEALTH', '가족': 'OPEN_FAMILY', '커뮤니티 열어줘': 'OPEN_COMMUNITY', '홈으로': 'OPEN_HOME', '캘린더 열어줘': 'OPEN_LIFE',
    '뭘 할 수 있어?': 'HELP',
  };
  for (const [text, intent] of Object.entries(cases)) assert.equal(match(text).intent, intent, text);
  for (const text of Object.keys(cases)) assert.deepEqual(match(text), match(text), `${text} — same answer every time`);
  assert.deepEqual(match('내일 오후 2시에 병원 일정 추가해줘'), { intent: 'ADD_CALENDAR', args: { title: '병원', date: '2026-10-04', time: '14:00' }, reason: '' });
  assert.deepEqual(match('내일 장보기 할 일 추가해줘'), { intent: 'ADD_TASK', args: { title: '장보기', dueDate: '2026-10-04' }, reason: '' });
  assert.deepEqual(match('병원 동행 서비스 찾아줘').args, { query: '병원 동행', category: 'hospital-escort' });
  assert.deepEqual(match('내가 저장한 프로그램 보여줘').args, { type: 'PROGRAM' });
  assert.equal(/Math\.random|Date\.now\(\)/.test(code(INTENTS_SRC).replace(/dateKey\(\)/g, '')), false, 'no randomness in the matcher');
});

test('OG-AI-5 unsupported: no forced answer — the fixed sentence and the list of what is possible', async () => {
  for (const text of ['오늘 날씨 어때', '농담 하나 해줘', '대통령이 누구야', '1+1은?', 'hello', '사랑이 뭘까', 'ㅋㅋㅋ']) assert.deepEqual(match(text), { intent: 'UNSUPPORTED', args: {}, reason: 'NO_MATCH' }, text);
  const w = world();
  const r = await ask(w, '오늘 날씨 어때');
  assert.equal(r.result.status, 'UNAVAILABLE');
  assert.equal(r.result.message, '지금은 이 요청을 바로 처리할 수 없어요.');
  assert.equal(r.result.suggest, true, 'the panel shows the supported actions again');
  assert.deepEqual(r.result.items, []);
  assert.equal(T.MESSAGES.UNSUPPORTED, '지금은 이 요청을 바로 처리할 수 없어요.');
  assert.match(VIEW, /if \(!latest \|\| latest\.result\.suggest \|\| latest\.result\.status === 'ERROR'\) put\(host, suggestions\(\)\);/);
  for (const [text, reason, word] of [['결제해줘', 'PURCHASE', '결제나 주문'], ['예약해줘', 'BOOKING', '예약'], ['아들한테 문자', 'MESSAGE', '문자나 메시지'], ['병원에 전화 걸어줘', 'CALL', '전화']]) {
    assert.deepEqual([match(text).intent, match(text).reason], ['NOT_AVAILABLE', reason], text);
    assert.ok((await ask(w, text)).result.message.includes(word), text);
  }
  assert.equal(snapshot(w), '[]');
});

test('OG-AI-6 intent contract: a closed list of intents, each with a tool or a fixed answer; reasons are a closed list', () => {
  assert.deepEqual([...I.INTENT_IDS], ['VIEW_TODAY', 'VIEW_SCHEDULE', 'VIEW_TASKS', 'VIEW_ROUTINES', 'VIEW_SAVED', 'SEARCH_CARE', 'SEARCH_ENJOY', 'SEARCH_STORE', 'ADD_CALENDAR', 'ADD_TASK', 'OPEN_HOME', 'OPEN_LIFE', 'OPEN_HEALTH', 'OPEN_FAMILY', 'OPEN_CARE', 'OPEN_ENJOY', 'OPEN_COMMUNITY', 'OPEN_STORE', 'OPEN_SAVED', 'PREPARE_FAMILY_SHARE', 'HEALTH_SAFETY', 'NOT_AVAILABLE', 'HELP', 'UNSUPPORTED']);
  assert.deepEqual(Object.keys(T.INTENT_TOOLS), [...I.INTENT_IDS]);
  const ids = world().assistant.tools.ids();
  for (const [intent, tool] of Object.entries(T.INTENT_TOOLS)) assert.ok(tool === '' ? ['HEALTH_SAFETY', 'NOT_AVAILABLE', 'HELP', 'UNSUPPORTED'].includes(intent) : ids.includes(tool), `${intent} → ${tool}`);
  for (const text of ['오늘 일정', '내일 병원 일정 추가', '날씨', '', '결제', '머리가 아파', '<b>']) {
    const m = match(text);
    assert.deepEqual(Object.keys(m), ['intent', 'args', 'reason'], text);
    assert.ok(I.INTENT_IDS.includes(m.intent), text);
    assert.ok(I.REASONS.includes(m.reason), `${text}: ${m.reason}`);
    assert.equal(C.isPlainObject(m.args), true);
  }
  assert.deepEqual([...A.PROPERTIES.intent], [...I.INTENT_IDS], 'analytics counts exactly these names');
});

test('OG-AI-7 tool registry: one central list; every tool has id, description, mode, privacy, requiresConfirmation, execute', () => {
  const reg = world().assistant.tools;
  assert.deepEqual(reg.ids(), ['get_today_schedule', 'get_today_tasks', 'get_today_routines', 'get_today_overview', 'get_saved_items', 'search_care', 'search_enjoy', 'search_store', 'open_home', 'open_life', 'open_health', 'open_family', 'open_care', 'open_enjoy', 'open_community', 'open_store', 'open_saved', 'prepare_calendar_event', 'prepare_task', 'prepare_family_share', 'create_calendar_event', 'create_task']);
  assert.deepEqual([...T.TOOL_MODES], ['READ', 'NAVIGATE', 'PREPARE', 'WRITE']);
  assert.deepEqual([...T.TOOL_PRIVACY], ['PUBLIC', 'STANDARD_LOCAL', 'PRIVATE', 'HEALTH_ADJACENT']);
  for (const t of reg.list()) {
    assert.deepEqual(Object.keys(t), ['id', 'description', 'mode', 'privacy', 'requiresConfirmation', 'fields'], t.id);
    assert.match(t.id, /^[a-z][a-z_]{2,40}$/);
    assert.ok(t.description.length > 4, t.id);
    assert.ok(T.TOOL_MODES.includes(t.mode) && T.TOOL_PRIVACY.includes(t.privacy), t.id);
    assert.equal(t.requiresConfirmation, t.mode === 'WRITE', t.id);
    assert.equal(reg.has(t.id), true);
    assert.deepEqual(reg.get(t.id), t);
  }
  assert.equal((code(TOOLS_SRC).match(/\bdefine\(\{/g) || []).length, 12, 'eleven definitions + one loop of nine screens + one search factory');
  assert.match(TOOLS_SRC, /const tools = new Map\(\);/, 'lookup by id is a map lookup');
  assert.equal(Object.isFrozen(reg), true);
});

test('OG-AI-8 read tools: seven, never needing confirmation, reusing the existing stores and search', async () => {
  const w = world();
  const reads = w.assistant.tools.list().filter((t) => t.mode === 'READ');
  assert.deepEqual(reads.map((t) => t.id), ['get_today_schedule', 'get_today_tasks', 'get_today_routines', 'get_today_overview', 'get_saved_items', 'search_care', 'search_enjoy', 'search_store']);
  assert.equal(reads.every((t) => t.requiresConfirmation === false), true);
  w.schedule.add({ title: '검증 일정', date: TODAY });
  const before = snapshot(w);
  for (const t of reads) assert.ok(T.RESULT_STATUSES.includes((await w.assistant.tools.run(t.id, {})).status), t.id);
  assert.equal(snapshot(w), before, 'reading changes nothing');
  const src = code(TOOLS_SRC);
  for (const call of ['schedule.listForDate(', 'tasks.dueOn(', 'routines.listForDate(', 'saved.list()', 'search.query(']) assert.ok(src.includes(call), `reuses ${call}`);
  assert.equal(/storage\.|localStorage|normalizeEvent|normalizeTask|JSON\.parse/.test(src), false, 'no second copy of the data logic');
});

test('OG-AI-9 navigate tools: nine known screens, addresses from router.js / routes.js only', async () => {
  const w = world();
  const navs = w.assistant.tools.list().filter((t) => t.mode === 'NAVIGATE');
  assert.deepEqual(navs.map((t) => t.id), ['open_home', 'open_life', 'open_health', 'open_family', 'open_care', 'open_enjoy', 'open_community', 'open_store', 'open_saved']);
  for (const t of navs) {
    const view = t.id.replace('open_', '');
    const r = await w.assistant.tools.run(t.id, {});
    assert.deepEqual([r.status, r.route, r.navigate], ['SUCCESS', hashFor(view), true], t.id);
    assert.equal(R.safeRoute(r.route), r.route);
  }
  assert.equal((await w.assistant.tools.run('open_health', { section: 'checkin' })).route, '#life/checkin');
  assert.equal((await w.assistant.tools.run('open_life', { section: 'calendar' })).route, '#life/calendar');
  assert.equal((await w.assistant.tools.run('open_community', { section: 'groups' })).route, '#community/groups');
  assert.equal(navs.some((t) => /admin|account/.test(t.id)), false, 'the operations view and the account screen are not opened from here');
  assert.match(code(TOOLS_SRC), /const route = safeRoute\(section \? sections\[section\] : hashFor\(view\)\);/);
  assert.equal(snapshot(w), '[]');
});

test('OG-AI-10 write tools: exactly two (calendar entry, task), each behind a prepare tool and a confirmation', async () => {
  const w = world();
  const list = w.assistant.tools.list();
  assert.deepEqual(list.filter((t) => t.mode === 'WRITE').map((t) => `${t.id}:${t.requiresConfirmation}:${t.privacy}`), ['create_calendar_event:true:STANDARD_LOCAL', 'create_task:true:STANDARD_LOCAL']);
  assert.deepEqual(list.filter((t) => t.mode === 'PREPARE').map((t) => t.id), ['prepare_calendar_event', 'prepare_task', 'prepare_family_share']);
  assert.deepEqual([...A.PROPERTIES.tool], ['create_calendar_event', 'create_task']);
  for (const [id, args] of [['create_calendar_event', { title: '병원', date: TODAY, time: '14:00' }], ['create_task', { title: '장보기' }]]) {
    const r = await w.assistant.tools.run(id, args);
    assert.deepEqual([r.status, r.reason], ['ERROR', 'CONFIRMATION_REQUIRED'], `${id} cannot be run directly`);
  }
  assert.equal(snapshot(w), '[]');
  assert.equal('_execute' in w.assistant.tools || 'execute' in w.assistant.tools || 'execute' in w.assistant, false, 'the confirmed path is not reachable from outside');
  assert.match(code(TOOLS_SRC), /if \(tool\.mode === 'WRITE' && confirmed !== true\) return \{ result: cleanResult\(null\), reason: 'CONFIRMATION_REQUIRED' \};/);
  assert.equal((code(TOOLS_SRC).match(/execute\([^)]*, true\)/g) || []).length, 1, 'only confirm() passes confirmed = true');
});

test('OG-AI-11 privacy class: each tool is classified by what it touches or opens; nothing HEALTH_ADJACENT is read or written', () => {
  const by = Object.fromEntries(world().assistant.tools.list().map((t) => [t.id, t]));
  for (const id of ['get_today_schedule', 'get_today_tasks', 'get_today_routines', 'get_today_overview', 'prepare_calendar_event', 'prepare_task', 'create_calendar_event', 'create_task', 'open_life']) assert.equal(by[id].privacy, 'STANDARD_LOCAL', id);
  for (const id of ['get_saved_items', 'search_care', 'search_enjoy', 'search_store', 'open_home', 'open_care', 'open_enjoy', 'open_store', 'open_saved']) assert.equal(by[id].privacy, 'PUBLIC', id);
  for (const id of ['open_family', 'open_community', 'prepare_family_share']) assert.equal(by[id].privacy, 'PRIVATE', id);
  assert.deepEqual(Object.values(by).filter((t) => t.privacy === 'HEALTH_ADJACENT').map((t) => `${t.id}:${t.mode}`), ['open_health:NAVIGATE'], 'health is only ever OPENED');
  assert.deepEqual(Object.values(by).filter((t) => t.privacy === 'PRIVATE' && (t.mode === 'READ' || t.mode === 'WRITE')), []);
});

test('OG-AI-12 argument validation: schema, enum, length and date checks; unknown fields and wrong types are refused', async () => {
  const text = { type: 'text', max: 10, required: true };
  const schema = { title: text, date: { type: 'date', required: true }, time: { type: 'time', required: false }, kind: { type: 'enum', values: ['a', 'b'], required: false } };
  assert.deepEqual(T.validateArgs(schema, { title: ' 병원 ', date: TODAY }), { ok: true, args: { title: '병원', date: TODAY, time: '', kind: '' } });
  assert.deepEqual(T.validateArgs(schema, { title: '병원', date: TODAY, time: '14:00', kind: 'b' }).args, { title: '병원', date: TODAY, time: '14:00', kind: 'b' });
  for (const bad of [{ title: '병원', date: TODAY, extra: 1 }, { title: '병원', date: TODAY, __proto__x: 1 }, { title: '병원', date: TODAY, route: '#admin' }]) assert.equal(T.validateArgs(schema, bad).reason, 'UNKNOWN_FIELD');
  for (const bad of [{ date: TODAY }, { title: '', date: TODAY }, { title: '   ', date: TODAY }, { title: 5, date: TODAY }, { title: ['a'], date: TODAY }, { title: '가'.repeat(11), date: TODAY }, { title: '<b>x</b>', date: TODAY }, { title: 'javascript:x', date: TODAY }, { title: '병원', date: '2026-02-30' }, { title: '병원', date: '내일' }, { title: '병원', date: 20261003 }, { title: '병원', date: TODAY, time: '25:00' }, { title: '병원', date: TODAY, time: '2시' }, { title: '병원', date: TODAY, kind: 'c' }, { title: '병원', date: TODAY, kind: {} }]) assert.equal(T.validateArgs(schema, bad).reason, 'INVALID_ARGS', JSON.stringify(bad));
  for (const bad of [null, 'text', 5, [], [1], new Date()]) assert.equal(T.validateArgs(schema, bad).ok, false, String(bad));
  const w = world();
  for (const [id, args] of [['get_today_schedule', { date: 'tomorrow' }], ['get_saved_items', { type: 'POST' }], ['get_saved_items', { type: 'JOURNAL' }], ['search_care', { query: '가'.repeat(31) }], ['search_care', { category: 'nope' }], ['open_health', { section: 'admin' }], ['open_home', { section: 'x' }], ['prepare_calendar_event', { title: '병원' }], ['prepare_task', { title: '가'.repeat(500) }]]) {
    assert.equal((await w.assistant.tools.run(id, args)).status, 'ERROR', `${id} ${JSON.stringify(args)}`);
  }
  assert.equal(snapshot(w), '[]');
});

test('OG-AI-13 result contract: { status, title, message, items, route } — enum status, bounded text, routes inside ONGIL', () => {
  assert.deepEqual([...T.RESULT_STATUSES], ['SUCCESS', 'EMPTY', 'UNAVAILABLE', 'ERROR', 'NEEDS_CONFIRMATION']);
  assert.deepEqual([...A.PROPERTIES.result], [...T.RESULT_STATUSES]);
  const r = T.cleanResult({ status: 'SUCCESS', title: '가'.repeat(200), message: `줄\n바꿈\u0000${'나'.repeat(400)}`, items: [{ title: '항목', detail: '설명', route: '#life/calendar', html: '<b>', id: 7 }, { title: '', detail: 'x' }, null, 'text', ...Array.from({ length: 20 }, (_, i) => ({ title: `t${i}`, route: 'https://evil.example.test/' }))], route: 'javascript:alert(1)', routeLabel: '열기', secret: 'x', stack: 'at x', more: 3, navigate: true });
  assert.deepEqual(Object.keys(r), ['status', 'title', 'message', 'items', 'route', 'routeLabel', 'more']);
  assert.deepEqual([r.title.length, r.message.length, r.items.length, r.route], [80, 240, T.RESULT_ITEMS_MAX, '']);
  assert.equal(r.message.includes('\n') || r.message.includes('\u0000'), false);
  assert.deepEqual(r.items[0], { title: '항목', detail: '설명', route: '#life/calendar' });
  assert.equal(r.items.slice(1).every((it) => it.route === ''), true, 'an outside address never becomes a link');
  assert.equal('navigate' in r, false, 'no route, so nothing to open');
  assert.equal(T.cleanResult({ status: 'SUCCESS', route: '#health', navigate: true }).navigate, true);
});

test('OG-AI-14 tool error: a tool that throws or answers nonsense gives the fixed error sentence — the assistant keeps working', async () => {
  const boom = { listForDate() { throw new Error('TypeError: cannot read properties of undefined (reading secretField) at schedule.js:42'); }, add() { throw new Error('QuotaExceededError'); } };
  const base = world();
  const a = T.createAssistant({ now: base.now, schedule: boom, tasks: base.tasks, routines: base.routines, saved: base.saved, search: base.search, familyConnection });
  const r = await a.handle('오늘 일정 알려줘');
  assert.deepEqual([r.result.status, r.result.message], ['ERROR', T.MESSAGES.ERROR]);
  for (const leak of ['TypeError', 'secretField', 'schedule.js', 'undefined', 'at ']) assert.equal(JSON.stringify(r).includes(leak), false, leak);
  assert.equal((await a.handle('오늘 할 일')).result.status, 'EMPTY', 'the next request is served');
  assert.equal((await a.handle('내일 병원 일정 추가')).result.status, 'ERROR', 'prepare reads the calendar too');
  for (const bad of [null, undefined, 'SUCCESS', 5, [], { status: 'DONE' }, { status: 'success' }, { title: 'x' }]) assert.deepEqual([T.cleanResult(bad).status, T.cleanResult(bad).message], ['ERROR', T.MESSAGES.ERROR], JSON.stringify(bad));
  await assert.doesNotReject(() => a.handle(null));
  await assert.doesNotReject(() => a.handle({ toString() { throw new Error('x'); } }));
});

test('OG-AI-15 no arbitrary tool: only registered ids run — not a method name, a prototype key or a store function', async () => {
  const w = world();
  for (const id of ['delete_everything', 'storage.clear', 'schedule.remove', 'tasks.remove', 'create_post', 'send_message', 'constructor', '__proto__', 'toString', 'hasOwnProperty', '', null, undefined, 5, {}, ['get_today_schedule'], 'GET_TODAY_SCHEDULE', 'get_today_schedule ']) {
    const r = await w.assistant.tools.run(id, {});
    assert.deepEqual([r.status, r.reason], ['ERROR', 'UNKNOWN_TOOL'], String(id));
    assert.equal(w.assistant.tools.has(id), false);
    assert.equal(w.assistant.tools.get(id), null);
  }
  assert.deepEqual(Object.keys(w.assistant.tools).sort(), ['get', 'has', 'ids', 'list', 'run']);
  assert.equal(w.assistant.tools.list().some((t) => 'execute' in t || 'schema' in t), false, 'descriptions only: no function is handed out');
  assert.equal(/\beval\(|new Function|\[toolId\]\(|\[id\]\(|window\[|globalThis\[/.test(P10.map((f) => code(js(f))).join('\n')), false);
});

/* ═════════ read ═════════ */

test('OG-AI-16 today schedule: what is in the calendar for the day, in time order — nothing added', async () => {
  const w = world();
  w.schedule.add({ title: '검증 산책', date: TODAY });
  w.schedule.add({ title: '검증 병원', date: TODAY, time: '14:00' });
  w.schedule.add({ title: '검증 내일 약속', date: '2026-10-04', time: '09:00' });
  const r = (await ask(w, '오늘 일정 알려줘')).result;
  assert.deepEqual([r.status, r.title, r.route], ['SUCCESS', '오늘 일정 2개', '#life/calendar']);
  assert.deepEqual(r.items, [{ title: '검증 병원', detail: '오후 2:00', route: '#life/calendar' }, { title: '검증 산책', detail: '시간 없음', route: '#life/calendar' }]);
  const t = (await ask(w, '내일 일정')).result;
  assert.deepEqual([t.title, t.items.map((i) => i.title)], ['10월 4일 일요일 일정 1개', ['검증 내일 약속']]);
  assert.equal((await ask(w, '2026-10-04 일정 알려줘')).result.items.length, 1);
});

test('OG-AI-17 today tasks: tasks due that day, with how many are still open', async () => {
  const w = world();
  w.tasks.add({ title: '검증 은행', dueDate: TODAY });
  const done = w.tasks.add({ title: '검증 우체국', dueDate: TODAY }).task;
  w.tasks.toggle(done.id);
  w.tasks.add({ title: '검증 다음 주 일', dueDate: '2026-10-09' });
  const r = (await ask(w, '오늘 해야 할 일 뭐 있어?')).result;
  assert.deepEqual([r.status, r.title, r.message], ['SUCCESS', '오늘 할 일 2개', '아직 하지 않은 할 일은 모두 2개예요.']);
  assert.deepEqual(r.items.map((i) => `${i.title}:${i.detail}`), ['검증 은행:아직 안 함', '검증 우체국:마침']);
  assert.equal(r.items.every((i) => i.route === '#life/tasks'), true);
});

test('OG-AI-18 today routines: routines scheduled for that weekday, with today\'s completion', async () => {
  const w = world();
  const r1 = w.routines.add({ title: '검증 스트레칭', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], time: '07:30' }).routine;
  w.routines.add({ title: '검증 월요일만', daysOfWeek: [1] });
  w.routines.setCompleted(r1.id, true, TODAY);
  const r = (await ask(w, '루틴 보여줘')).result;
  assert.deepEqual([r.status, r.title], ['SUCCESS', '오늘 루틴 1개']);
  assert.deepEqual(r.items, [{ title: '검증 스트레칭', detail: '오전 7:30 · 마침', route: '#life/routines' }]);
  const all = (await ask(w, '오늘')).result;
  assert.deepEqual([all.status, all.message], ['SUCCESS', '일정 0개 · 할 일 0개 · 루틴 1개']);
  assert.deepEqual(all.items.map((i) => i.title), ['루틴 · 검증 스트레칭']);
});

test('OG-AI-19 today empty: says there is nothing — no invented entry, and the screen to add one', async () => {
  const w = world();
  const s = (await ask(w, '오늘 일정 알려줘')).result;
  assert.deepEqual([s.status, s.message, s.items, s.route, s.routeLabel], ['EMPTY', '오늘 등록된 일정이 없어요.', [], '#life/calendar', '캘린더 열기']);
  assert.equal((await ask(w, '오늘 할 일')).result.message, '오늘까지 하기로 한 일이 없어요.');
  assert.equal((await ask(w, '루틴 보여줘')).result.message, '오늘 하기로 한 루틴이 없어요.');
  assert.deepEqual([(await ask(w, '오늘')).result.status, (await ask(w, '오늘')).result.message], ['EMPTY', '오늘 등록된 일정, 할 일, 루틴이 없어요.']);
  assert.equal(snapshot(w), '[]', 'asking writes nothing');
});

test('OG-AI-20 saved: the saved public items, newest first, optionally by type', async () => {
  const w = world();
  w.saved.save({ type: 'PLACE', id: 's1', title: '검증 공원', href: '#enjoy' });
  w.clock.t += 1000;
  w.saved.save({ type: 'PROGRAM', id: 's2', title: '검증 요가 강좌', href: '#enjoy' });
  const all = (await ask(w, '저장한 것 보여줘')).result;
  assert.deepEqual([all.status, all.title, all.route], ['SUCCESS', '저장한 것 2개', '#saved']);
  assert.deepEqual(all.items, [{ title: '검증 요가 강좌', detail: '프로그램', route: '#saved' }, { title: '검증 공원', detail: '장소', route: '#saved' }]);
  const one = (await ask(w, '내가 저장한 프로그램 보여줘')).result;
  assert.deepEqual([one.title, one.items.length], ['저장한 프로그램 1개', 1]);
  const none = (await ask(w, '저장한 상품 보여줘')).result;
  assert.deepEqual([none.status, none.message], ['EMPTY', '아직 저장한 상품 목록이 비어 있어요.']);
});

test('OG-AI-21 POST excluded: a saved community post is LOCAL_ONLY — never listed, never counted, not even on request', async () => {
  const w = world();
  w.saved.save({ type: 'POST', id: 'po1', title: '비밀 저장 글 제목', href: '#community' });
  const r = (await ask(w, '저장한 것 보여줘')).result;
  assert.deepEqual([r.status, r.items], ['EMPTY', []]);
  w.saved.save({ type: 'PLACE', id: 's1', title: '검증 공원', href: '#enjoy' });
  const mixed = (await ask(w, '저장한 글 보여줘')).result;
  assert.equal(JSON.stringify(mixed).includes('비밀 저장 글'), false);
  assert.equal(mixed.title, '저장한 것 1개');
  assert.equal((await w.assistant.tools.run('get_saved_items', { type: 'POST' })).status, 'ERROR', 'POST is not an accepted type');
  assert.equal(JSON.stringify((await ask(w, '가족에게 보여줘')).result).includes('비밀 저장 글'), false, 'nor in the family preview');
  assert.match(code(TOOLS_SRC), /savedSyncPolicy\(it\) === 'SYNCABLE' && PUBLIC_CONTENT_TYPES\.includes\(it\.type\)/, 'a future private saved type is not shown by default either');
});

test('OG-AI-22 care search: found in what 돌봄·서비스 loaded this visit, through the existing provider', async () => {
  const w = world();
  const r = (await ask(w, '병원 동행 서비스 찾아줘')).result;
  assert.deepEqual([r.status, r.title, r.message], ['SUCCESS', '‘병원 동행’ 1개', '이번 방문에 불러온 정보에서 찾았어요.']);
  assert.deepEqual(r.items.map((i) => [i.title, i.route]), [['검증 병원 동행 서비스', '#care/hospital-escort']]);
  assert.equal(r.route, '#care/hospital-escort');
  assert.deepEqual((await ask(w, '복지관 찾아줘')).result.items.map((i) => [i.title, i.route]), [['검증 복지관', '#care/facility']]);
  assert.deepEqual(w.calls, { care: 2, enjoy: 0, store: 0 }, 'only the care provider was asked');
});

test('OG-AI-23 enjoy search: found in what 즐길거리 loaded this visit; a category opens its own section', async () => {
  const w = world();
  const r = (await ask(w, '요가 강좌 찾아줘')).result;
  assert.deepEqual([r.status, r.items.map((i) => i.title)], ['SUCCESS', ['검증 요가 강좌']]);
  assert.equal(r.items[0].route, '#enjoy/exercise');
  const browse = (await ask(w, '근처에서 배울 만한 거 찾아줘')).result;
  assert.deepEqual([browse.status, browse.items, browse.route, browse.routeLabel], ['SUCCESS', [], '#enjoy/learning', '즐길거리 열기']);
  assert.ok(browse.message.includes('즐길거리 화면에서 직접 찾아볼 수 있어요'));
  assert.deepEqual(w.calls, { care: 0, enjoy: 1, store: 0 });
});

test('OG-AI-24 store search: found in the products the 스토어 loaded; long lists are cut and say so', async () => {
  const w = world();
  const r = (await ask(w, '지팡이 상품 찾아줘')).result;
  assert.deepEqual([r.status, r.title, r.items.length, r.more], ['SUCCESS', '‘지팡이’ 30개', T.RESULT_ITEMS_MAX, 22], '30 found, 8 shown, and the rest is counted');
  assert.equal(r.items.every((i) => i.route === '#store/mobility'), true);
  assert.equal(JSON.stringify(r).includes('seller.example.test'), false, 'no outside address in a result');
  assert.deepEqual(w.calls, { care: 0, enjoy: 0, store: 1 });
});

test('OG-AI-25 no fake result: nothing loaded means "not found in what was loaded" — never a made-up service, programme or product', async () => {
  const w = world({ care: [], enjoy: [], store: [] });
  for (const [text, label] of [['병원 동행 서비스 찾아줘', '돌봄·서비스'], ['요가 강좌 찾아줘', '즐길거리'], ['지팡이 상품 찾아줘', '스토어']]) {
    const r = (await ask(w, text)).result;
    assert.deepEqual([r.status, r.items], ['EMPTY', []], text);
    assert.equal(r.message, `현재 불러온 정보에서는 찾지 못했어요. ${label} 화면에서 직접 찾아볼 수 있어요.`);
  }
  assert.equal(T.MESSAGES.NOT_FOUND_LOADED, '현재 불러온 정보에서는 찾지 못했어요.');
  const full = world();
  assert.equal((await ask(full, '우주선 상품 찾아줘')).result.status, 'EMPTY');
  const src = code(TOOLS_SRC) + code(INTENTS_SRC);
  assert.equal(/추천 (서비스|프로그램|상품)|인기|베스트|평점|별점|원\b|\d+,\d{3}/.test(src), false, 'no recommendation, popularity, rating or price is produced');
  assert.equal(/title: '[^'`$]*(센터|복지관|병원|강좌|교실)'/.test(src), false, 'no item title is written in the source');
});

/* ═════════ write: prepare → preview → confirm ═════════ */

test('OG-AI-26 calendar prepare: title, date and time are parsed and shown — nothing is saved yet', async () => {
  const w = world();
  const a = await ask(w, '내일 오후 2시에 병원 일정 추가해줘');
  assert.deepEqual([a.intent, a.toolId, a.result.status, a.result.title, a.result.message], ['ADD_CALENDAR', 'prepare_calendar_event', 'NEEDS_CONFIRMATION', '일정 추가', '이 일정으로 추가할까요?']);
  assert.deepEqual(a.result.pending, { id: 'pa-1', toolId: 'create_calendar_event', summary: [['제목', '병원'], ['날짜', '10월 4일 일요일'], ['시간', '오후 2:00']] });
  assert.deepEqual(w.assistant.pending(), { id: 'pa-1', toolId: 'create_calendar_event', summary: [['제목', '병원'], ['날짜', '10월 4일 일요일'], ['시간', '오후 2:00']], createdAt: NOW });
  assert.equal(snapshot(w), '[]');
  assert.equal(w.schedule.count(), 0);
  assert.deepEqual((await ask(w, '모레 가족 모임 약속 잡아줘')).result.pending.summary, [['제목', '가족 모임'], ['날짜', '10월 5일 월요일'], ['시간', '시간 없음']]);
});

test('OG-AI-27 calendar confirm: saved once through the calendar store\'s own add(), exactly as previewed', async () => {
  const w = world();
  const a = await ask(w, '내일 오후 2시에 병원 일정 추가해줘');
  const c = await w.assistant.confirm(a.result.pending.id);
  assert.deepEqual([c.toolId, c.result.status, c.result.title, c.result.route], ['create_calendar_event', 'SUCCESS', '일정을 추가했어요', '#life/calendar']);
  assert.deepEqual(c.result.items, [{ title: '병원', detail: '10월 4일 일요일 · 오후 2:00', route: '#life/calendar' }]);
  const stored = w.schedule.listForDate('2026-10-04');
  assert.deepEqual(stored.map((e) => [e.title, e.date, e.time, e.completed]), [['병원', '2026-10-04', '14:00', false]]);
  assert.deepEqual(w.backend.keys(), [`${KEY_PREFIX}events`], 'one collection, the calendar\'s');
  assert.equal(w.assistant.pending(), null);
  assert.match(code(TOOLS_SRC), /const r = schedule\.add\(\{ title, date, time: time \|\| '' \}\);/);
});

test('OG-AI-28 calendar cancel: the draft is dropped and storage is untouched', async () => {
  const w = world();
  const a = await ask(w, '내일 오후 2시에 병원 일정 추가해줘');
  const c = w.assistant.cancel(a.result.pending.id);
  assert.deepEqual([c.toolId, c.result.status, c.result.title, c.result.message], ['create_calendar_event', 'SUCCESS', '취소했어요', '아무것도 바꾸지 않았어요.']);
  assert.equal(snapshot(w), '[]');
  assert.equal(w.assistant.pending(), null);
  assert.equal((await w.assistant.confirm(a.result.pending.id)).result.status, 'ERROR', 'a cancelled draft cannot be confirmed afterwards');
  assert.equal(w.schedule.count(), 0);
});

test('OG-AI-29 calendar duplicate: the same entry on the same day is pointed out before it is added again', async () => {
  const w = world();
  w.schedule.add({ title: '병원', date: '2026-10-04', time: '14:00' });
  const a = await ask(w, '내일 오후 2시에 병원 일정 추가해줘');
  assert.deepEqual([a.result.status, a.result.message], ['NEEDS_CONFIRMATION', '같은 날 같은 일정이 이미 있어요. 그래도 하나 더 추가할까요?']);
  assert.equal(w.schedule.count(), 1, 'still a question, not a change');
  assert.equal((await ask(w, '내일 오후 3시에 병원 일정 추가해줘')).result.message, '이 일정으로 추가할까요?', 'another time is another entry');
  w.tasks.add({ title: '장보기', dueDate: '2026-10-04' });
  assert.equal((await ask(w, '내일 장보기 할 일 추가해줘')).result.message, '같은 할 일이 이미 있어요. 그래도 하나 더 추가할까요?');
});

test('OG-AI-30 task prepare: title and due date are parsed and shown; a task needs no date', async () => {
  const w = world();
  const a = await ask(w, '내일 장보기 할 일 추가해줘');
  assert.deepEqual([a.intent, a.toolId, a.result.status, a.result.message], ['ADD_TASK', 'prepare_task', 'NEEDS_CONFIRMATION', '이 할 일로 추가할까요?']);
  assert.deepEqual(a.result.pending.summary, [['할 일', '장보기'], ['마감', '10월 4일 일요일']]);
  assert.deepEqual((await ask(w, '우유 사기 할 일 추가해줘')).result.pending.summary, [['할 일', '우유 사기'], ['마감', '날짜 없음']]);
  assert.equal(snapshot(w), '[]');
});

test('OG-AI-31 task confirm: saved once through the task store\'s own add()', async () => {
  const w = world();
  const a = await ask(w, '내일 장보기 할 일 추가해줘');
  const c = await w.assistant.confirm(a.result.pending.id);
  assert.deepEqual([c.toolId, c.result.status, c.result.title], ['create_task', 'SUCCESS', '할 일을 추가했어요']);
  assert.deepEqual(w.tasks.list().map((t) => [t.title, t.dueDate, t.completed, t.priority]), [['장보기', '2026-10-04', false, 'normal']]);
  assert.deepEqual(w.backend.keys(), [`${KEY_PREFIX}tasks`]);
  assert.match(code(TOOLS_SRC), /const r = tasks\.add\(\{ title, dueDate: dueDate \|\| '' \}\);/);
});

test('OG-AI-32 task cancel: nothing is saved', async () => {
  const w = world();
  const a = await ask(w, '내일 장보기 할 일 추가해줘');
  assert.equal(w.assistant.cancel(a.result.pending.id).result.title, '취소했어요');
  assert.equal(snapshot(w), '[]');
  assert.equal(w.assistant.cancel(a.result.pending.id).result.status, 'ERROR', 'there is nothing left to cancel');
});

test('OG-AI-33 no silent mutation: no request on its own changes storage — a hundred different requests, zero writes', async () => {
  const w = world();
  w.schedule.add({ title: '기존 일정', date: TODAY });
  w.tasks.add({ title: '기존 할 일', dueDate: TODAY });
  const before = snapshot(w);
  const texts = ['오늘 일정 알려줘', '내일 오후 2시에 병원 일정 추가해줘', '내일 장보기 할 일 추가해줘', '오늘 안부 기록해줘', '안부 좋아요로 기록해줘', '혈압약 먹었다고 기록해줘', '두통 증상 기록해줘', '가족 공유 설정 바꿔줘', '가족에게 일정 보여줘', '커뮤니티에 글 써줘', '걷기 모임 만들어줘', '일기 써줘', '생활비 5000원 기록해줘', '저장한 것 보여줘', '저장한 것 다 지워줘', '기존 일정 지워줘', '기존 할 일 완료해줘', '루틴 추가해줘', '내 이름 바꿔줘', '결제해줘'];
  for (let i = 0; i < 5; i++) for (const t of texts) await ask(w, t);
  assert.equal(snapshot(w), before);
  assert.equal(w.assistant.pending() !== null, true, 'at most a draft is waiting');
  const writes = [...code(TOOLS_SRC).matchAll(/\b(schedule|tasks|routines|saved|search)\.(add|update|toggle|remove|save|unsave|setCompleted|registerProvider)\(/g)].map((m) => m[0]);
  assert.deepEqual(writes, ['schedule.add(', 'tasks.add('], 'the only two writing calls in the tool layer');
});

test('OG-AI-34 double confirm: a second 확인 — double click, repeated Enter, a replay — adds nothing', async () => {
  const w = world();
  const a = await ask(w, '내일 오후 2시에 병원 일정 추가해줘');
  const id = a.result.pending.id;
  const answers = await Promise.all([w.assistant.confirm(id), w.assistant.confirm(id), w.assistant.confirm(id)]);
  assert.deepEqual(answers.map((r) => r.result.status), ['SUCCESS', 'ERROR', 'ERROR']);
  assert.equal(answers[1].result.message, T.MESSAGES.NO_PENDING);
  await w.assistant.confirm(id);
  assert.equal(w.schedule.count(), 1);
  assert.match(code(TOOLS_SRC), /pending = null;\n\s+if \(now\(\) - p\.createdAt > PENDING_TTL_MS\)/, 'the draft is taken out before it runs');
  assert.match(VIEW, /if \(entry\.settled\) return;\n\s+entry\.settled = true;\n\s+for \(const b of host\.querySelectorAll\(`\[data-og-assistant-pending="\$\{p\.id\}"\] button`\)\) b\.disabled = true;/, 'and the buttons are disabled at the first press');
  /* a newer draft replaces the older one: the old id can no longer be confirmed */
  const first = await ask(w, '모레 치과 일정 추가');
  const second = await ask(w, '내일 은행 가기 할 일 추가');
  assert.equal((await w.assistant.confirm(first.result.pending.id)).result.status, 'ERROR');
  assert.equal(w.schedule.count(), 1);
  assert.equal((await w.assistant.confirm(second.result.pending.id)).result.status, 'SUCCESS');
});

test('OG-AI-35 invalid args and stale drafts: a draft is validated again when it runs, and expires', async () => {
  const w = world();
  const a = await ask(w, '내일 오후 2시에 병원 일정 추가해줘');
  w.clock.t += T.PENDING_TTL_MS + 1;
  const late = await w.assistant.confirm(a.result.pending.id);
  assert.deepEqual([late.result.status, late.result.message], ['UNAVAILABLE', T.MESSAGES.EXPIRED]);
  assert.equal(snapshot(w), '[]');
  for (const id of ['pa-999', '', null, undefined, {}, 'pa-1']) assert.equal((await w.assistant.confirm(id)).result.status, 'ERROR', String(id));
  assert.equal(T.PENDING_TTL_MS, 300000);
  for (const [id, args] of [['prepare_calendar_event', { title: '', date: TODAY }], ['prepare_calendar_event', { title: '병원', date: '2026-13-01' }], ['prepare_calendar_event', { title: '병원', date: TODAY, time: '오후' }], ['prepare_calendar_event', { title: '병원', date: TODAY, completed: true }], ['prepare_task', { title: '할 일', dueDate: 'soon' }], ['prepare_task', { title: '할 일', priority: 'important' }]]) {
    assert.equal((await w.assistant.tools.run(id, args)).status, 'ERROR', JSON.stringify(args));
  }
  assert.equal((await w.assistant.tools.run('prepare_task', { title: '할 일' })).status, 'NEEDS_CONFIRMATION', 'a direct prepare only describes a draft');
  assert.equal(w.assistant.pending(), null, '— it does not create one that could be confirmed');
  assert.equal(snapshot(w), '[]');
});

/* ═════════ privacy · health · family ═════════ */

const SENSITIVE_STORES = ['checkIn', 'medication', 'symptoms', 'healthNotes', 'journal', 'expenses', 'familySharing', 'helpRequests', 'communityPosts', 'groupDrafts', 'meetupDrafts', 'dailyLife', 'sleep', 'profile', 'storage', 'account', 'notifications'];

test('OG-AI-36 no health write: there is no tool that records a check-in — the request opens the screen and says why', async () => {
  const w = world();
  const checkIn = createCheckInStore(w.storage, { now: w.now });
  for (const text of ['오늘 안부 기록해줘', '안부 좋아요로 기록해줘', '나 오늘 힘들다고 체크인 해줘', '컨디션 기록 남겨줘']) {
    const a = await ask(w, text);
    assert.deepEqual([a.intent, a.toolId, a.reason, a.result.status, a.result.route], ['OPEN_HEALTH', 'open_health', 'SENSITIVE_RECORD', 'SUCCESS', '#life/checkin'], text);
    assert.equal(a.result.message, '이 기록은 직접 남겨 주세요. 도우미가 대신 적거나 고르지 않아요.');
    assert.equal('navigate' in a.result, false, 'offered, not opened: the person reads why first');
  }
  assert.equal(checkIn.get ? checkIn.get() : null, null);
  assert.equal(snapshot(w), '[]', 'no check-in value was chosen for the person');
  assert.equal(w.assistant.tools.list().some((t) => /check|checkin|mood|status/.test(t.id)), false);
  assert.equal(/good|okay|hard|help/.test(code(INTENTS_SRC).replace(/helpRequests/g, '')), false, 'the matcher does not even know the check-in values');
});

test('OG-AI-37 no medication write, and no medication detail in an answer: only "복약 기록 열기"', async () => {
  const w = world({ seed: { [`${KEY_PREFIX}medications`]: JSON.stringify({ items: [{ id: 'md-1', name: '비밀약이름', memo: '비밀 복용 메모' }] }) } });
  const before = snapshot(w);
  for (const text of ['혈압약 먹었다고 기록해줘', '복약 기록해줘', '내가 먹는 약 알려줘', '약 이름 뭐였지', '오늘 약 챙겼는지 알려줘']) {
    const a = await ask(w, text);
    assert.deepEqual([a.intent, a.result.route, a.result.routeLabel], ['OPEN_HEALTH', '#life/medication', '복약 기록 열기'], text);
    assert.equal(JSON.stringify(a).includes('비밀'), false, text);
  }
  assert.equal(snapshot(w), before);
  for (const text of ['혈압약 추천해줘', '이 약 먹어도 돼?', '약 용량 늘려도 될까', '감기약 부작용 알려줘']) assert.equal(match(text).intent, 'HEALTH_SAFETY', text);
  assert.equal(w.assistant.tools.list().some((t) => /medic|pill|dose|drug/.test(t.id)), false);
});

test('OG-AI-38 no symptom or health-note write; a medical question gets the fixed boundary, not an answer', async () => {
  const w = world();
  for (const [text, route] of [['두통 증상 기록해줘', '#life/symptoms'], ['증상 적어줘', '#life/symptoms'], ['혈압 기록해줘', '#life/health-notes'], ['건강 메모 남겨줘', '#life/health-notes']]) assert.equal((await ask(w, text)).result.route, route, text);
  for (const text of ['머리가 아파', '가슴 통증이 있는데 무슨 병일까', '어지러워', '기침이 계속 나는데 왜 이래']) {
    const a = await ask(w, text);
    assert.deepEqual([a.intent, a.toolId, a.result.status, a.result.message, a.result.route], ['HEALTH_SAFETY', '', 'UNAVAILABLE', T.MESSAGES.HEALTH, '#health'], text);
  }
  assert.equal(T.MESSAGES.HEALTH, 'ONGIL은 건강 상태를 판단하거나 약을 권하지 않아요. 몸이 걱정되면 의사나 약사와 상의해 주세요.');
  for (const text of ['이거 응급 상황이야?', '119에 전화 걸어줘', '구급차 불러줘']) {
    const a = await ask(w, text);
    assert.deepEqual([a.intent, a.reason, a.result.status, a.result.message], ['HEALTH_SAFETY', 'EMERGENCY', 'UNAVAILABLE', T.MESSAGES.EMERGENCY], text);
  }
  assert.equal(T.MESSAGES.EMERGENCY, 'ONGIL은 급한 상황인지 판단하거나 대신 신고하지 않아요. 급하다고 느끼면 119에 직접 전화해 주세요.', 'whether it is an emergency is not decided here');
  assert.equal(I.MODEL.medicalAdvice, false);
  assert.equal(/진단 결과|가능성이 높|의심됩니다|드세요|복용하세요|mg|응급입니다|괜찮습니다/.test(COPY), false, 'no medical statement exists to be shown');
  assert.equal(snapshot(w), '[]');
});

test('OG-AI-39 no journal: not read, not written — the screen is offered', async () => {
  const w = world();
  const journal = createJournalStore(w.storage, { now: w.now });
  for (const text of ['일기 써줘', '오늘 일기에 좋은 하루였다고 적어줘', '내 일기 보여줘']) {
    const a = await ask(w, text);
    assert.deepEqual([a.intent, a.result.route, a.reason], ['OPEN_LIFE', '#life/journal', 'SENSITIVE_RECORD'], text);
  }
  assert.equal(journal.count ? journal.count() : 0, 0);
  assert.equal(snapshot(w), '[]');
});

test('OG-AI-40 no expenses: amounts are never parsed, read or written', async () => {
  const w = world();
  const expenses = createExpenseStore(w.storage, { now: w.now });
  for (const text of ['생활비 5000원 기록해줘', '가계부에 점심 8000원 적어줘', '이번 달 지출 알려줘']) {
    const a = await ask(w, text);
    assert.deepEqual([a.intent, a.result.route], ['OPEN_LIFE', '#life/expenses'], text);
    assert.equal(/5000|8000/.test(JSON.stringify(a.result)), false);
  }
  assert.equal(expenses.count ? expenses.count() : 0, 0);
  assert.equal(snapshot(w), '[]');
  assert.deepEqual([...T.NO_WRITE_AREAS], ['checkins', 'medications', 'medicationLogs', 'symptoms', 'healthNotes', 'familySharing', 'helpRequests', 'expenses', 'journal', 'communityPosts', 'groupDrafts', 'meetupDrafts', 'routines', 'profile']);
  for (const c of T.NO_WRITE_AREAS.filter((c) => c !== 'profile' && c !== 'routines')) assert.ok(COLLECTIONS.includes(c), c);
});

test('OG-AI-41 family preview: what could be shown (saved public items) and the true state — no family is connected', async () => {
  const w = world();
  w.saved.save({ type: 'PROGRAM', id: 's2', title: '검증 요가 강좌', href: '#enjoy' });
  const a = await ask(w, '엄마한테 이 프로그램 보여주고 싶어');
  assert.deepEqual([a.intent, a.toolId, a.result.status, a.result.title, a.result.route], ['PREPARE_FAMILY_SHARE', 'prepare_family_share', 'UNAVAILABLE', '가족에게 보여주기 (미리보기)', '#family']);
  assert.ok(a.result.message.startsWith('지금은 가족과 연결되어 있지 않아서 보낼 수 없어요. 무엇을 보여 줄지 미리 볼 수만 있어요.'));
  assert.ok(a.result.message.includes('건강 기록이나 일기는 들어가지 않아요'));
  assert.deepEqual(a.result.items, [{ title: '검증 요가 강좌', detail: '프로그램', route: '#saved' }]);
  assert.equal('pending' in a.result, false, 'a preview has nothing to confirm');
  assert.equal(w.assistant.pending(), null);
  assert.deepEqual(familyConnection(), { available: false, status: 'NOT_AVAILABLE' });
  assert.ok((await ask(world(), '가족에게 보여줘')).result.message.includes('먼저 저장해 두세요'));
});

test('OG-AI-42 no family send: no tool sends, shares or changes a family setting; nothing is written', async () => {
  const w = world();
  w.saved.save({ type: 'PLACE', id: 's1', title: '검증 공원', href: '#enjoy' });
  const before = snapshot(w);
  for (const text of ['가족에게 보내줘', '딸한테 공원 공유해줘', '아들에게 일정 알려 줘', '엄마한테 전달해줘']) {
    const a = await ask(w, text);
    assert.deepEqual([a.intent, a.result.status], ['PREPARE_FAMILY_SHARE', 'UNAVAILABLE'], text);
    assert.equal(/보냈|전달했|공유했|알렸/.test(a.result.message), false);
  }
  assert.equal(snapshot(w), before);
  assert.equal(w.assistant.tools.list().some((t) => /send|share_|invite|message|notify|consent|permission/.test(t.id)), false);
  assert.equal(/familySharing|helpRequests|createFamilySharingStore|createHelpRequestStore/.test(code(TOOLS_SRC).replace(/NO_WRITE_AREAS = Object\.freeze\(\[[^\]]*\]\);/, '')), false, 'the tool layer has no handle on family settings');
  /* even if a connection existed one day, this layer still has nothing that sends */
  const connected = T.createAssistant({ now: w.now, schedule: w.schedule, tasks: w.tasks, routines: w.routines, saved: w.saved, search: w.search, familyConnection: () => ({ available: true }) });
  const r = (await connected.handle('가족에게 보여줘')).result;
  assert.deepEqual([r.status, r.message.startsWith('도우미는 가족에게 보내지 않아요.')], ['UNAVAILABLE', true]);
});

test('OG-AI-43 no remote invite: inviting or connecting family is not something the assistant does', async () => {
  const w = world();
  for (const text of ['가족 초대해줘', '아들 연결해줘', '가족 추가해줘']) {
    const a = await ask(w, text);
    assert.ok(['OPEN_FAMILY', 'UNSUPPORTED'].includes(a.intent), `${text} → ${a.intent}`);
    assert.equal(/초대했|연결했|연결되었|초대장을/.test(JSON.stringify(a.result)), false, text);
  }
  assert.equal(/초대했|연결되었습니다|연결 완료|invite/i.test(COPY), false);
  assert.equal(snapshot(w), '[]');
});

test('OG-AI-44 no message: no text, e-mail, call or push leaves ONGIL', async () => {
  const w = world();
  for (const [text, reason] of [['딸에게 문자 해줘', 'MESSAGE'], ['카톡으로 알려', 'MESSAGE'], ['이메일 써줘', 'MESSAGE'], ['아들에게 전화 걸어줘', 'CALL']]) assert.deepEqual([(await ask(w, text)).intent, match(text).reason], ['NOT_AVAILABLE', reason], text);
  for (const f of P10) assert.equal(/sms:|tel:|mailto:|Notification\(|navigator\.share|postMessage|notifications\.add/.test(code(js(f))), false, f);
  assert.equal(snapshot(w), '[]');
});

test('OG-AI-45 no prompt storage: what is typed is never written to any storage', async () => {
  const w = world();
  w.schedule.add({ title: '기존', date: TODAY });
  const before = snapshot(w);
  for (const text of ['아주사적인요청XYZ 알려줘', '머리가 아파 XYZ', '엄마한테 XYZ 보여줘', '오늘 일정 XYZ 알려줘', '내일 XYZ병원 일정 추가해줘']) await ask(w, text);
  assert.equal(snapshot(w), before);
  assert.equal(snapshot(w).includes('XYZ'), false);
  for (const f of P10) assert.equal(/localStorage|sessionStorage|indexedDB|document\.cookie|storage\.(set|get|remove)|caches\./.test(code(js(f))), false, f);
  assert.equal(COLLECTIONS.some((c) => /assist|prompt|convers|chat|ai/i.test(c) && c !== 'dailyLife'), false, 'no collection for requests exists');
  assert.equal(COLLECTIONS.length, 25, 'Phase 10 added no collection; Completion V1 added healthMeasures');
});

test('OG-AI-46 no conversation storage: requests and results live in the panel\'s memory, bounded, and end with the page', () => {
  assert.equal(T.HISTORY_MAX, 6);
  assert.match(VIEW, /entries = \[entry, \.\.\.entries\]\.slice\(0, HISTORY_MAX\);/);
  assert.match(VIEW, /let entries = \[\];/);
  assert.equal(/transcript|download|clipboard|Blob\(/i.test(code(VIEW)), false, 'no transcript feature');
  assert.match(code(TOOLS_SRC), /let pending = null;\n\s+let seq = 0;/, 'the one waiting draft is a variable, not a record');
  assert.equal(/pa-\$\{seq\}/.test(TOOLS_SRC), true, 'its id is a counter — not random, not an identifier of a person');
  const fresh = world();
  assert.equal(fresh.assistant.pending(), null, 'a new page starts with nothing waiting: a reload can never run an old draft');
});

test('OG-AI-47 analytics no raw prompt: only the kind of request and how it ended are counted', async () => {
  assert.deepEqual([[...A.EVENTS.ai_open], [...A.EVENTS.ai_intent_matched], [...A.EVENTS.ai_action_confirmed], [...A.EVENTS.ai_action_cancelled]], [[], ['intent', 'result'], ['tool', 'result'], ['tool']]);
  assert.match(APP, /if \(name === 'open'\) instrument\.track\('ai_open'\);\n\s+if \(name === 'intent'\) instrument\.track\('ai_intent_matched', \{ intent: detail\.intent, result: detail\.status \}\);\n\s+if \(name === 'confirmed'\) instrument\.track\('ai_action_confirmed', \{ tool: detail\.tool, result: detail\.status \}\);\n\s+if \(name === 'cancelled'\) instrument\.track\('ai_action_cancelled', \{ tool: detail\.tool \}\);/);
  assert.match(VIEW, /tell\('intent', \{ intent: answer\.intent, status: answer\.result\.status \}\);/, 'the view hands over two enum values, never the text');
  assert.equal(/tell\([^)]*(text|shown|input\.value|title|message)/.test(code(VIEW)), false);
  const w = world();
  const analytics = A.createAnalytics({ storage: w.storage, now: w.now });
  const text = '머리가 아픈데 김영희 010-1234-5678';
  const a = await ask(w, text);
  analytics.track('ai_intent_matched', { intent: a.intent, result: a.result.status, text, prompt: text, query: text, message: a.result.message });
  analytics.track('ai_intent_matched', { intent: text, result: text });
  const stored = w.backend.getItem(`${KEY_PREFIX}analytics`);
  assert.deepEqual(JSON.parse(stored).days[TODAY], { ai_intent_matched: 2, 'ai_intent_matched|intent=HEALTH_SAFETY': 1, 'ai_intent_matched|result=UNAVAILABLE': 1 });
  for (const leak of ['머리', '아픈', '김영희', '010', '1234', '판단']) assert.equal(stored.includes(leak), false, leak);
});

test('OG-AI-48 analytics no title: a confirmed or cancelled draft is counted by tool name only', async () => {
  const w = world();
  const analytics = A.createAnalytics({ storage: w.storage, now: w.now });
  const a = await ask(w, '내일 오후 2시에 비밀병원XYZ 일정 추가해줘');
  const c = await w.assistant.confirm(a.result.pending.id);
  analytics.track('ai_action_confirmed', { tool: c.toolId, result: c.result.status, title: '비밀병원XYZ', date: '2026-10-04', time: '14:00', payload: a.result.pending });
  const b = await ask(w, '내일 비밀장보기XYZ 할 일 추가해줘');
  analytics.track('ai_action_cancelled', { tool: w.assistant.cancel(b.result.pending.id).toolId, title: '비밀장보기XYZ' });
  const stored = w.backend.getItem(`${KEY_PREFIX}analytics`);
  assert.deepEqual(JSON.parse(stored).days[TODAY], { ai_action_confirmed: 1, 'ai_action_confirmed|result=SUCCESS': 1, 'ai_action_confirmed|tool=create_calendar_event': 1, ai_action_cancelled: 1, 'ai_action_cancelled|tool=create_task': 1 });
  for (const leak of ['XYZ', '비밀', '14:00', '2026-10-04']) assert.equal(stored.includes(leak), false, leak);
  assert.equal(/tell\(kind === 'confirm' \? 'confirmed' : 'cancelled', \{ tool: p\.toolId, status: answer\.result\.status \}\);/.test(VIEW), true);
});

test('OG-AI-49 no identifiers: no user, device or session id, nothing random, nothing read from the browser', () => {
  for (const f of P10) assert.equal(/randomUUID|getRandomValues|Math\.random|navigator\.|userAgent|document\.cookie|fingerprint|deviceId|sessionId|userId|clientId/i.test(code(js(f))), false, f);
  assert.deepEqual({ ...A.IDENTIFIERS }, { userId: false, deviceId: false, advertisingId: false, sessionId: false, fingerprint: false });
  const a = world().assistant;
  assert.deepEqual(Object.keys(a).sort(), ['cancel', 'confirm', 'handle', 'model', 'pending', 'suggestions', 'tools']);
});

test('OG-AI-50 minimal data access: the tools are handed six things — and no storage, profile or health store', () => {
  assert.match(APP, /const assistant = createAssistant\(\{ schedule, tasks, routines, saved, search, familyConnection: onboarding\.familyConnection \}\);/);
  assert.match(code(TOOLS_SRC), /function buildRegistry\(\{ schedule, tasks, routines, saved, search, familyConnection, today = \(\) => dateKey\(\) \}\) \{/);
  const src = code(TOOLS_SRC).replace(/NO_WRITE_AREAS = Object\.freeze\(\[[^\]]*\]\);/, '') + code(INTENTS_SRC) + code(VIEW);
  for (const name of SENSITIVE_STORES) assert.equal(new RegExp(`\\b${name}\\b\\s*[.,(]`).test(src), false, `${name} is not reachable`);
  const imports = P10.flatMap((f) => [...js(f).matchAll(/from '\.\/([a-z-]+)\.js'/g)].map((m) => m[1]));
  for (const forbidden of ['storage', 'profile', 'checkin', 'medication', 'symptoms', 'health-notes', 'journal', 'expenses', 'family', 'community', 'account', 'notifications', 'analytics', 'instrument', 'admin', 'data-source', 'sleep', 'daily-life']) assert.equal(imports.includes(forbidden), false, `no import of ${forbidden}.js`);
  assert.deepEqual([...new Set(imports)].sort(), ['assistant-intents', 'assistant-tools', 'care-contracts', 'contracts', 'dates', 'dom', 'enjoy-contracts', 'life-contracts', 'router', 'routes']);
  /* a registry built without the extra stores still works: it never needed them */
  const w = world();
  assert.equal(T.createToolRegistry({ schedule: w.schedule, tasks: w.tasks, routines: w.routines, saved: w.saved, search: w.search, familyConnection }).ids().length, 22);
});

/* ═════════ dates · routes · security ═════════ */

test('OG-AI-51 today local date: "오늘" is the LOCAL calendar day, also just after midnight — never the UTC day', async () => {
  for (const [y, mo, d, h, mi] of [[2026, 9, 3, 0, 5], [2026, 9, 3, 8, 0], [2026, 9, 3, 23, 55], [2026, 0, 1, 0, 0]]) {
    const t = new Date(y, mo, d, h, mi).getTime();
    const key = `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const backend = createMemoryBackend();
    const storage = createStorage({ backend, now: () => t });
    const schedule = createScheduleStore(storage, { now: () => t });
    schedule.add({ title: '검증 오늘 일정', date: key });
    const a = T.createAssistant({ now: () => t, schedule, tasks: createTaskStore(storage), routines: createRoutineStore(storage), saved: createSavedStore(storage), search: createSearch(), familyConnection });
    const r = (await a.handle('오늘 일정 알려줘')).result;
    assert.deepEqual([r.status, r.title], ['SUCCESS', '오늘 일정 1개'], `${key} ${h}:${mi}`);
  }
  assert.deepEqual(I.parseDate('오늘 일정', TODAY), { state: 'OK', date: TODAY, matched: ['오늘'] });
  assert.equal(/toISOString|getUTC|Date\.UTC|T00:00/.test(P10.map((f) => code(js(f))).join('\n')), false, 'no UTC conversion anywhere');
  assert.match(INTENTS_SRC, /import \{ dateKey, isDateKey, addDays, parseDateKey \} from '\.\/dates\.js';/, 'the existing date helpers are reused');
});

test('OG-AI-52 tomorrow local date: 내일 and 모레 step by calendar days, across a month end', () => {
  assert.equal(I.parseDate('내일 병원', TODAY).date, '2026-10-04');
  assert.equal(I.parseDate('모레 병원', TODAY).date, '2026-10-05');
  assert.equal(I.parseDate('내일', '2026-10-31').date, '2026-11-01');
  assert.equal(I.parseDate('모레', '2026-04-29').date, '2026-05-01');
  assert.deepEqual(match('내일 일정').args, { date: '2026-10-04' });
  assert.deepEqual(I.matchIntent('내일 장보기 할 일 추가', { today: '2026-10-31' }).args, { title: '장보기', dueDate: '2026-11-01' });
});

test('OG-AI-53 leap: 29 February exists only in a leap year', () => {
  assert.equal(I.parseDate('내일', '2028-02-28').date, '2028-02-29');
  assert.equal(I.parseDate('내일', '2027-02-28').date, '2027-03-01');
  assert.equal(I.parseDate('모레', '2028-02-28').date, '2028-03-01');
  assert.deepEqual(I.parseDate('2028-02-29 검진', TODAY), { state: 'OK', date: '2028-02-29', matched: ['2028-02-29'] });
  assert.equal(I.parseDate('2027-02-29 검진', TODAY).state, 'INVALID');
  assert.equal(I.parseDate('2월 29일', '2028-01-10').date, '2028-02-29');
  assert.equal(I.parseDate('2월 29일', '2027-01-10').state, 'INVALID');
  assert.deepEqual(match('2028-02-29 14:30 검진 일정 등록해줘').args, { title: '검진', date: '2028-02-29', time: '14:30' });
});

test('OG-AI-54 year boundary: 31 December → 1 January, and a month-day already past is asked, not moved to next year', () => {
  assert.equal(I.parseDate('내일', '2026-12-31').date, '2027-01-01');
  assert.equal(I.parseDate('모레', '2026-12-30').date, '2027-01-01');
  assert.equal(I.parseDate('모레', '2026-12-31').date, '2027-01-02');
  assert.equal(I.parseDate('12월 31일', TODAY).date, '2026-12-31');
  assert.deepEqual(I.parseDate('1월 5일', TODAY), { state: 'UNCLEAR', date: '', matched: ['1월 5일'] }, 'this year it has passed; next year would be a guess');
  assert.equal(match('1월 5일 병원 일정 추가').reason, 'DATE_UNCLEAR');
  assert.deepEqual(I.matchIntent('내일 해맞이 일정 추가', { today: '2026-12-31' }).args, { title: '해맞이', date: '2027-01-01', time: '' });
});

test('OG-AI-55 invalid date: an impossible date is refused with a plain sentence — nothing is prepared', async () => {
  for (const text of ['2026-02-30 병원 일정 추가', '2026-13-01 병원 일정 추가', '2026-00-10 병원 일정 추가', '4월 31일 병원 일정 추가', '13월 1일 병원 일정 추가']) assert.deepEqual([match(text).intent, match(text).reason, match(text).args], ['ADD_CALENDAR', 'DATE_INVALID', {}], text);
  const w = world();
  const a = await ask(w, '2026-02-30 병원 일정 추가');
  assert.deepEqual([a.result.status, a.result.message], ['UNAVAILABLE', '달력에 없는 날짜예요. 날짜를 다시 확인해 주세요.']);
  assert.equal(w.assistant.pending(), null);
  assert.equal(I.parseDate('오늘', 'not-a-day').state, 'INVALID');
  assert.equal(snapshot(w), '[]');
});

test('OG-AI-56 ambiguous date and time: not guessed — the person is asked to say it plainly', async () => {
  for (const text of ['다다음 주 수요일 저녁쯤 병원 일정 추가해줘', '다음 주 병원 일정 추가', '수요일 병원 일정 추가', '주말에 등산 일정 추가', '오늘 내일 병원 일정 추가', '조만간 병원 일정 추가']) assert.equal(match(text).reason, 'DATE_UNCLEAR', text);
  assert.equal(match('병원 일정 추가해줘').reason, 'DATE_MISSING', 'no date is not "today"');
  for (const text of ['내일 2시 병원 일정 추가', '내일 저녁쯤 병원 일정 추가', '내일 오후에 병원 일정 추가', '내일 2시 3시 병원 일정 추가', '내일 25시 병원 일정 추가', '내일 오후 13시 병원 일정 추가', '내일 14:75 병원 일정 추가']) assert.equal(match(text).reason, 'TIME_UNCLEAR', text);
  assert.deepEqual(['오후 2시', '오전 9시 30분', '저녁 7시 반', '14:00', '14시', '오전 12시', '오후 12시', '0시'].map((t) => I.parseTime(t).time), ['14:00', '09:30', '19:30', '14:00', '14:00', '00:00', '12:00', '00:00']);
  assert.deepEqual(I.parseTime('병원'), { state: 'NONE', time: '', matched: [] });
  const w = world();
  for (const [text, hint] of [['다음 주 병원 일정 추가', '날짜를 알아듣지 못했어요'], ['병원 일정 추가해줘', '날짜를 함께 적어 주세요'], ['내일 2시 병원 일정 추가', '시간을 알아듣지 못했어요'], ['내일 일정 추가', '무엇을 추가할지']]) {
    const a = await ask(w, text);
    assert.equal(a.result.status, 'UNAVAILABLE', text);
    assert.ok(a.result.message.startsWith(hint), `${text} → ${a.result.message}`);
  }
  assert.equal(w.assistant.pending(), null);
  assert.equal(snapshot(w), '[]');
});

test('OG-AI-57 known route: every route a result carries is a canonical ONGIL address', async () => {
  const w = world();
  w.schedule.add({ title: '일정', date: TODAY });
  w.saved.save({ type: 'PLACE', id: 's1', title: '검증 공원', href: 'https://outside.example.test/park' });
  const routes = new Set();
  for (const text of ['오늘 일정 알려줘', '오늘 할 일', '루틴 보여줘', '오늘', '저장한 것 보여줘', '병원 동행 서비스 찾아줘', '요가 강좌 찾아줘', '지팡이 상품 찾아줘', '상품 찾아줘', '가족에게 보여줘', '머리가 아파', '오늘 안부 기록해줘', '일기 써줘', '건강 화면 열어줘', '커뮤니티', '홈으로', '캘린더 열어줘', '모임 만들어줘']) {
    const r = (await ask(w, text)).result;
    for (const route of [r.route, ...r.items.map((i) => i.route)].filter(Boolean)) routes.add(route);
  }
  assert.ok(routes.size >= 12, [...routes].join(' '));
  for (const route of routes) {
    assert.equal(R.canonicalHash(route), route, route);
    assert.match(route, /^#[a-z-]+(\/[a-z-]+)?$/);
  }
  assert.equal([...routes].some((r) => r.includes('outside') || r.startsWith('#admin') || r.startsWith('#account')), false);
});

test('OG-AI-58 unknown route rejected: a tool cannot point at a screen that does not exist', () => {
  for (const route of ['#unknown', '#nope/x', '#life/secret-section', '#admin/users', '#store/a/b', '#', '', '#__proto__']) {
    const r = T.cleanResult({ status: 'SUCCESS', title: 't', route, navigate: true, items: [{ title: 'i', route }] });
    const fixed = R.safeRoute(route);
    assert.equal(r.route, fixed, route);
    assert.equal(r.items[0].route, fixed);
    if (!fixed) assert.equal('navigate' in r, false, route);
  }
  assert.equal(T.cleanResult({ status: 'SUCCESS', route: '#life/secret-section' }).route, '#life', 'an unknown section falls back to its screen');
  assert.equal(T.cleanResult({ status: 'SUCCESS', route: '#unknown', navigate: true }).route, '');
});

test('OG-AI-59 external route rejected: no outside address, script address or path can be opened', async () => {
  for (const route of ['https://evil.example.test/', 'http://evil.example.test/', '//evil.example.test/x', 'javascript:alert(1)', 'JAVASCRIPT:alert(1)', 'data:text/html,x', 'vbscript:x', '/livon/', '../admin', 'mailto:a@b.c', 'tel:119', '#health"onclick="x']) {
    const r = T.cleanResult({ status: 'SUCCESS', title: 't', route, navigate: true, items: [{ title: 'i', route }] });
    assert.deepEqual([r.route, r.items[0].route, 'navigate' in r], ['', '', false], route);
  }
  assert.match(APP, /onNavigate: \(route\) => \{\n\s+const safe = safeRoute\(route\);\n\s+if \(safe\) win\.location\.hash = safe;\n\s+\},/, 'and the address is checked once more where it is used');
  assert.equal(/window\.open|location\.href|location\.assign|location\.replace|target: '_blank'/.test(P10.map((f) => code(js(f))).join('\n')), false);
  const w = world();
  for (const text of ['https://evil.example.test 열어줘', 'javascript:alert(1)', '#admin 열어줘', '구글 열어줘']) {
    const r = (await ask(w, text)).result;
    assert.equal([r.route, ...r.items.map((i) => i.route)].some((x) => /evil|javascript|admin|google/.test(x)), false, text);
  }
});

test('OG-AI-60 hash safety: the request text never becomes an address — routes come from tables, not from words', async () => {
  const src = code(TOOLS_SRC);
  assert.equal(/`#\$\{(?!view\b)[a-zA-Z.]*(text|query|title|input)/.test(src), false, 'no route is built from request text');
  assert.deepEqual([...src.matchAll(/`#([a-z]+)\/\$\{([a-zA-Z.()]+)\}`/g)].map((m) => `${m[1]}:${m[2]}`), ['care:c', 'enjoy:c.toLowerCase()'], 'only a validated category id is ever placed in an address');
  const w = world();
  const a = await ask(w, '#life/journal/../../admin 일정 추가 내일');
  assert.equal([a.result.route, ...a.result.items.map((i) => i.route)].some((x) => x.includes('admin')), false, 'whatever the words were, they stay words (a title), never an address');
  const b = (await ask(w, '건강/../admin 화면 열어줘')).result;
  assert.equal(b.route, '#health');
  assert.equal((await w.assistant.tools.run('search_care', { category: 'facility/../../admin' })).status, 'ERROR');
});

test('OG-AI-61 text rendering: the panel is built with el() and textContent — typed markup stays text', async () => {
  for (const f of P10) assert.equal(/\.innerHTML|\.outerHTML|insertAdjacentHTML|document\.write|DOMParser|createContextualFragment|createElement/.test(code(js(f))), false, f);
  assert.match(VIEW, /import \{ el, clear, announce \} from '\.\/dom\.js';/);
  assert.match(VIEW, /el\('p', \{ class: 'og-panel__result-desc', 'data-og-assistant-asked': 'true', text: `요청: \$\{entry\.text\}` \}\)/, 'the request is echoed as text');
  assert.deepEqual(match('<img src=x onerror=alert(1)> 일정 추가 내일'), { intent: 'UNSUPPORTED', args: {}, reason: 'NO_MATCH' });
  const w = world();
  const r = await ask(w, '<script>alert(1)</script> 오늘 일정');
  assert.deepEqual([r.intent, r.result.status], ['UNSUPPORTED', 'UNAVAILABLE']);
  w.schedule.add({ title: '<b>굵게</b> & "따옴표"', date: TODAY });
  assert.equal((await ask(w, '오늘 일정 알려줘')).result.items[0].title, '<b>굵게</b> & "따옴표"', 'stored text is passed on as text, unchanged and unescaped');
});

test('OG-AI-62 no eval: nothing evaluates text as code', () => {
  for (const f of fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js'))) assert.equal(/\beval\(|new Function\(|Function\(['"`]|setTimeout\(['"`]|setInterval\(['"`]/.test(code(js(f))), false, f);
});

test('OG-AI-63 no dynamic script: no script element, dynamic import, worker or remote module', () => {
  for (const f of P10) assert.equal(/import\(|importScripts|new Worker|createElement\('script'|\.src\s*=|<script/i.test(code(js(f))), false, f);
  for (const m of HTML.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) assert.match(m[1], /^\/[a-z]/, `${m[1]} is a same-site file`);
  assert.equal(/<script[^>]+src="https?:/.test(HTML), false);
  assert.equal(/assistant/.test((HTML.match(/<script[^>]*>/g) || []).join(' ')), false, 'the assistant modules are loaded by app.js only');
});

test('OG-AI-64 corrupted tool result: whatever a tool hands back is rebuilt — wrong shapes, huge lists and extra fields do no harm', async () => {
  const many = T.cleanResult({ status: 'SUCCESS', title: 5, message: { a: 1 }, items: Array.from({ length: 5000 }, (_, i) => ({ title: `항목 ${i}`, detail: ['x'], route: 7 })), route: {}, routeLabel: [] });
  assert.deepEqual([many.title, many.message, many.items.length, many.items[0], many.route, many.routeLabel], ['', '', T.RESULT_ITEMS_MAX, { title: '항목 0', detail: '', route: '' }, '', '']);
  assert.deepEqual(T.cleanResult({ status: 'SUCCESS', items: 'not a list' }).items, []);
  assert.deepEqual(T.cleanResult({ status: 'SUCCESS', items: [{ title: {} }, { detail: 'no title' }, 5, null] }).items, []);
  assert.equal('pending' in T.cleanResult({ status: 'NEEDS_CONFIRMATION', pending: { id: 'pa-9', toolId: 'create_task' } }), false, 'a tool cannot hand itself a confirmation');
  /* a damaged collection: the stores skip what they cannot read, and the assistant answers */
  const w = world({ seed: { [`${KEY_PREFIX}events`]: '{"items":[{"id":"bad"},null,5,{"title":"<x>"}]}', [`${KEY_PREFIX}tasks`]: '{not json', [`${KEY_PREFIX}saved`]: '[1,2]' } });
  for (const text of ['오늘 일정 알려줘', '오늘 할 일', '저장한 것 보여줘', '오늘']) assert.equal((await ask(w, text)).result.status, 'EMPTY', text);
  /* a search provider that answers rubbish */
  const odd = world({ providers: [{ id: 'care', label: '돌봄·서비스', scope: 'PUBLIC', supportedTypes: [], search: () => [null, 5, { title: '' }, { id: 'x' }, { id: 'ok', title: '검증 항목', route: 'https://evil.example.test/', type: 'CARE_SERVICE' }] }] });
  const r = (await ask(odd, '검증 서비스 찾아줘')).result;
  assert.deepEqual(r.items, [{ title: '검증 항목', detail: '', route: '#care' }]);
});

test('OG-AI-65 provider error sanitize: a failing source gives "지금은 … 정보를 불러오지 못했어요" — never its error', async () => {
  const failing = (id, label) => ({ id, label, scope: 'PUBLIC', supportedTypes: [], search: () => { throw new Error(`HTTP 500 https://api.example.test/v1?serviceKey=SECRETKEY123 Bearer abc.def token=${id}`); } });
  const w = world({ providers: [failing('care', '돌봄·서비스'), failing('enjoy', '즐길거리'), failing('store', '상품')] });
  for (const [text, label] of [['병원 동행 서비스 찾아줘', '돌봄·서비스'], ['요가 강좌 찾아줘', '즐길거리'], ['지팡이 상품 찾아줘', '스토어']]) {
    const a = await ask(w, text);
    assert.deepEqual([a.result.status, a.result.message, a.result.items], ['UNAVAILABLE', `지금은 ${label} 정보를 불러오지 못했어요.`, []], text);
    for (const leak of ['HTTP', '500', 'SECRETKEY', 'serviceKey', 'Bearer', 'token', 'api.example', 'Error']) assert.equal(JSON.stringify(a).includes(leak), false, leak);
  }
  assert.equal((await ask(w, '오늘 일정 알려줘')).result.status, 'EMPTY', 'the rest still works');
  const rejecting = world();
  const a = T.createAssistant({ now: rejecting.now, schedule: rejecting.schedule, tasks: rejecting.tasks, routines: rejecting.routines, saved: rejecting.saved, search: { query: () => Promise.reject(new Error('network down: secret')) }, familyConnection });
  assert.deepEqual([(await a.handle('지팡이 상품 찾아줘')).result.status, (await a.handle('지팡이 상품 찾아줘')).result.message], ['UNAVAILABLE', '지금은 스토어 정보를 불러오지 못했어요.']);
});

/* ═════════ UX · quality ═════════ */

test('OG-AI-66 keyboard: Enter sends, every action is a real button or link, Escape closes like the other header panels', () => {
  assert.match(VIEW, /form\.addEventListener\('submit', \(event\) => \{\n\s+event\.preventDefault\(\);\n\s+submit\(input\.value\);\n\s+\}\);/);
  const buttons = (VIEW.match(/el\('button', \{/g) || []).length;
  assert.equal(buttons, 3, 'example, 확인, 취소');
  assert.equal((VIEW.match(/el\('button', \{ type: 'button', class: 'og-panel__btn/g) || []).length, buttons);
  assert.equal(/el\('(div|span|p|li)', \{[^}]*onclick/.test(VIEW), false, 'nothing clickable that is not a control');
  assert.equal(/tabindex: '0'|tabIndex = [1-9]|accesskey/i.test(VIEW), false, 'the natural order: box, 요청, examples or result, 닫기');
  assert.match(js('panels.js'), /if \(event\.key === 'Escape' && buttons\.some\(\(b\) => b\.getAttribute\('aria-expanded'\) === 'true'\)\) closeAll\(\{ restoreFocus: true \}\);/);
  assert.match(js('panels.js'), /const buttons = \[\.\.\.root\.querySelectorAll\('\[data-og-tool\]'\)\];/, 'the assistant button is handled by the same panel code');
  assert.match(VIEW, /if \(closeBtn\) closeBtn\.addEventListener\('click', \(\) => button\.click\(\)\);/);
});

test('OG-AI-67 focus: opening focuses the box, a result focuses its title, closing returns to the button', () => {
  assert.match(js('panels.js'), /const first = panel\.querySelector\('input, a\[href\], button'\);\n\s+if \(first\) first\.focus\(\);/);
  assert.match(js('panels.js'), /if \(wasOpen && restoreFocus\) btn\.focus\(\);/);
  assert.match(VIEW, /'data-og-assistant-title': 'true'/);
  assert.match(VIEW, /el\('p', \{ class: 'og-panel__result-title', tabindex: '-1', 'data-og-assistant-title': 'true'/, 'the result title can take focus without joining the tab order');
  assert.match(VIEW, /render\(\);\n\s+say\(entry\.result\);\n\s+focusEntry\(entry\);/, 'after 확인 or 취소 focus lands on the outcome, not on a removed button');
  assert.match(VIEW, /note\(answer\.result\.message\);\n\s+input\.focus\(\);/, 'an empty request keeps focus in the box');
  assert.match(SHELL_CSS, /\.og-panel a:focus-visible, \.og-panel button:focus-visible, \.og-panel input:focus-visible \{ outline: 3px solid var\(--og-panel-ink\); outline-offset: 2px; \}/);
});

test('OG-AI-68 screen reader (static): labelled region and input, a polite status, results as lists, states in words', () => {
  assert.match(PANEL, /role="region" aria-label="ONGIL 도우미"/);
  assert.match(PANEL, /<label class="visually-hidden" for="og-assistant-input">/);
  assert.match(PANEL, /role="status" aria-live="polite" data-og-assistant-status/);
  assert.match(VIEW, /const say = \(r\) => announce\(status, \[STATUS_WORDS\[r\.status\], r\.title, r\.message\]\.filter\(Boolean\)\.join\('\. '\)\);/);
  assert.match(VIEW, /export const STATUS_WORDS = Object\.freeze\(\{ SUCCESS: '', EMPTY: '없음', UNAVAILABLE: '할 수 없음', ERROR: '문제가 생김', NEEDS_CONFIRMATION: '확인 필요' \}\);/, 'a result says in words how it ended');
  assert.match(VIEW, /el\('ol', \{ class: 'og-assist__entries', 'aria-label': '요청과 결과' \}/);
  assert.match(VIEW, /\{ class: 'og-panel__actions', role: 'group', 'aria-label': '추가 확인', 'data-og-assistant-pending': p\.id \}/);
  assert.match(VIEW, /el\('ul', \{ class: 'og-assist__summary', 'aria-label': '추가할 내용' \}/);
  assert.match(VIEW, /host\.setAttribute\('aria-busy', 'true'\);/);
  assert.match(HTML, /data-og-tool="assistant"[^>]*aria-label="ONGIL 도우미">\s*<svg[^>]*aria-hidden="true"/, 'the icon is decorative; the button has a name');
  assert.equal(/intent|tool|model|모델|인텐트|프롬프트|토큰/i.test(PANEL.replace(/data-og-[a-z-]+(="[^"]*")?|og-tool[a-z-]*/g, '') + T.SUGGESTIONS.map((s) => s.label + s.text).join('') + Object.values(T.MESSAGES).join('')), false, 'no technical word is shown to the person');
});

const P10_END = '.gnav--ongil .gnav__wordmark { display: none; }\n}';
const P10_CSS = SHELL_CSS.slice(SHELL_CSS.indexOf('/* [P10]'), SHELL_CSS.indexOf(P10_END) + P10_END.length);

test('OG-AI-69 390 responsive: the panel is the full-width header sheet; the header keeps three 44px tools', () => {
  assert.match(read('ongil-start/styles/ongil-app.css'), /\.og-panel \{ position: fixed; top: calc\(var\(--gnav-h, 74px\) \+ 0\.4rem\); right: 1rem; left: 1rem; width: auto; \}/);
  assert.match(P10_CSS, /@media \(max-width: 430px\) \{\n {2}\.gnav--ongil \.gnav__wordmark \{ display: none; \}/);
  assert.match(SHELL_CSS, /\.og-tool \{[^}]*width: var\(--og-control\); height: var\(--og-control\)/);
  assert.match(read('ongil-start/styles/ongil-tokens.css'), /--og-control: 2\.75rem;/);
  assert.match(P10_CSS, /\.og-assist__chips \{ display: flex; flex-wrap: wrap;/);
});

test('OG-AI-70 820 responsive: the panel never exceeds the screen and scrolls inside itself', () => {
  assert.match(P10_CSS, /\.og-panel--assistant \{ width: min\(26rem, calc\(100vw - 2rem\)\); max-height: min\(78vh, 40rem\); \}/);
  assert.match(SHELL_CSS, /\.og-panel \{[^}]*overflow: auto;/);
});

test('OG-AI-71 1440 responsive: the same anchored panel as 통합검색 — no new layout, colour, font or motion', () => {
  assert.match(PANEL.slice(0, 80) + HTML, /<div class="og-panel og-panel--assistant" id="og-panel-assistant"/);
  assert.equal(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|font-family|animation|transition|@keyframes|box-shadow|background-image/.test(P10_CSS), false, 'existing panel tokens only');
  for (const cls of ['og-panel__btn', 'og-panel__note', 'og-panel__list', 'og-panel__result-title', 'og-panel__result-desc', 'og-panel__group', 'og-panel__actions']) assert.ok(VIEW.includes(cls), `reuses ${cls}`);
  assert.ok(P10_CSS.split('\n').length < 22);
});

test('OG-AI-72 no overflow: long text wraps, nothing is fixed-width, text is 16px or more, controls 44px or more', () => {
  assert.equal(/white-space: nowrap|overflow-x: (auto|scroll)|[\s;{]width: \d{3,}px|min-width: \d{3,}px/.test(P10_CSS), false);
  assert.match(SHELL_CSS, /\.og-panel__result-title, \.og-panel__result-desc \{ overflow-wrap: anywhere; \}/);
  assert.match(P10_CSS, /\.og-assist__summary li \{ display: flex; flex-wrap: wrap;/);
  assert.equal(/font-size: (0\.\d+rem|1[0-5]px)/.test(P10_CSS), false, 'no type under 16px is introduced');
  assert.match(SHELL_CSS, /\.og-panel__btn \{[^}]*min-height: var\(--og-control\)/);
  assert.match(SHELL_CSS, /\.og-search input \{[^}]*height: var\(--og-control\)[^}]*font-size: 1rem/);
  assert.match(SHELL_CSS, /\.og-panel__note \{[^}]*font-size: 1rem/);
});

test('OG-AI-73 matcher 1000 fixture: a thousand phrases are matched in well under a second, each to a valid intent', () => {
  const heads = ['오늘', '내일', '모레', '2026-12-25', '12월 31일', '', '이번 주', '다음 주 수요일', '지금', '혹시'];
  const bodies = ['일정 알려줘', '할 일 뭐 있어', '루틴 보여줘', '저장한 것 보여줘', '병원 동행 서비스 찾아줘', '요가 강좌 찾아줘', '지팡이 상품 찾아줘', '오후 2시 병원 일정 추가해줘', '장보기 할 일 추가해줘', '안부 기록해줘', '엄마한테 보여줘', '머리가 아파', '날씨 어때', '결제해줘', '건강 화면 열어줘', '커뮤니티', '뭘 할 수 있어', '일기 써줘', '약 추천해줘', '저녁쯤 치과 약속 잡아줘'];
  const tails = ['', '요', ' 부탁해', '?', '!!'];
  const phrases = [];
  for (const h of heads) for (const b of bodies) for (const t of tails) phrases.push(`${h} ${b}${t}`.trim());
  assert.equal(phrases.length, 1000);
  const t0 = process.hrtime.bigint();
  const results = phrases.map((p) => I.matchIntent(p, { today: TODAY }));
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  assert.ok(ms < 500, `1,000 phrases took ${ms.toFixed(1)} ms`);
  for (const [i, r] of results.entries()) {
    assert.ok(I.INTENT_IDS.includes(r.intent), phrases[i]);
    assert.ok(I.REASONS.includes(r.reason), `${phrases[i]} → ${r.reason}`);
  }
  assert.ok(new Set(results.map((r) => r.intent)).size >= 14, 'the fixture reaches most intents');
  assert.deepEqual(results.map((r) => r.intent), phrases.map((p) => I.matchIntent(p, { today: TODAY }).intent), 'and gives the same answers again');
  const huge = '가'.repeat(100000);
  const t1 = process.hrtime.bigint();
  assert.equal(I.matchIntent(huge, { today: TODAY }).reason, 'TOO_LONG');
  assert.ok(Number(process.hrtime.bigint() - t1) / 1e6 < 50, 'a very long input is refused before any matching');
});

test('OG-AI-74 lazy provider: creating or opening the assistant asks no source; a request asks only the one it needs', async () => {
  const w = world();
  assert.deepEqual(w.calls, { care: 0, enjoy: 0, store: 0 }, 'nothing is asked when the assistant is created');
  for (const text of ['오늘 일정 알려줘', '오늘', '저장한 것 보여줘', '내일 병원 일정 추가', '가족에게 보여줘', '날씨', '건강 화면 열어줘', '상품 찾아줘', '즐길거리 찾아줘', '돌봄 서비스 찾아줘']) await ask(w, text);
  assert.deepEqual(w.calls, { care: 0, enjoy: 0, store: 0 }, 'reading, preparing, opening and browsing ask no source');
  await ask(w, '지팡이 상품 찾아줘');
  assert.deepEqual(w.calls, { care: 0, enjoy: 0, store: 1 });
  assert.match(code(TOOLS_SRC), /outcome = await search\.query\(query, \{ only: \[providerId\] \}\);/);
  assert.match(js('search.js'), /if \(Array\.isArray\(only\) && !only\.includes\(p\.id\)\) continue;/);
  const viewCode = code(VIEW);
  assert.equal(/assistant\.handle\(/.test(viewCode.slice(viewCode.indexOf("button.addEventListener('click'"))), false, 'opening the panel renders what is in memory and runs nothing');
  for (const f of P10) assert.equal(/fetch\(|data-source|createLifelongClassSource|\.load\(/.test(code(js(f))), false, `${f} loads nothing from outside`);
});

test('OG-AI-75 bounded DOM: at most six requests on screen, eight rows per result, five in a family preview', async () => {
  assert.deepEqual([T.HISTORY_MAX, T.RESULT_ITEMS_MAX], [6, 8]);
  const w = world();
  for (let i = 0; i < 200; i++) w.schedule.add({ title: `검증 일정 ${i}`, date: TODAY });
  for (let i = 0; i < 60; i++) w.saved.save({ type: 'PLACE', id: `s${i}`, title: `검증 장소 ${i}`, href: '#enjoy' });
  const r = (await ask(w, '오늘 일정 알려줘')).result;
  assert.deepEqual([r.title, r.items.length, r.more], ['오늘 일정 200개', 8, 192]);
  const s = (await ask(w, '저장한 것 보여줘')).result;
  assert.deepEqual([s.items.length, s.more], [8, 52]);
  assert.equal((await ask(w, '가족에게 보여줘')).result.items.length, 5);
  assert.match(VIEW, /r\.more \? el\('p', \{ class: 'og-panel__note', 'data-og-assistant-more': String\(r\.more\), text: `이 밖에 \$\{r\.more\}개가 더 있어요\.` \}\) : null/, 'what is left out is said');
  assert.ok(P10.reduce((n, f) => n + fs.statSync(path.join(JS_DIR, f)).size, 0) < 70_000, 'three modules, under 70 KB unminified');
});

test('OG-AI-76 no console error: nothing logs, and every outside call from the panel is guarded', () => {
  for (const f of P10) assert.equal(/console\.(log|error|warn|info|debug)|debugger/.test(code(js(f))), false, f);
  const v = code(VIEW);
  assert.match(v, /try \{\n\s+answer = await assistant\.handle\(text\);\n\s+\} catch \{/);
  assert.match(v, /try \{\n\s+answer = kind === 'confirm' \? await assistant\.confirm\(p\.id\) : assistant\.cancel\(p\.id\);\n\s+\} catch \{/);
  assert.match(v, /try \{\n\s+onNavigate\(entry\.result\.route\);\n\s+\} catch \{/);
  assert.match(v, /try \{\n\s+onEvent\(name, detail\);\n\s+\} catch \{/);
});

test('OG-AI-77 no page error: handle(), confirm() and cancel() never throw or reject, whatever they are given', async () => {
  const w = world();
  for (const input of [undefined, null, 5, {}, [], '', '   ', '\u0000\u0001', '가'.repeat(5000), '<>', '오늘 일정', Symbol.iterator.toString(), '🙂🙂🙂', '2026-99-99 일정 추가', '99월 99일 99시 일정 추가']) {
    const a = await w.assistant.handle(input);
    assert.ok(T.RESULT_STATUSES.includes(a.result.status), String(input).slice(0, 20));
    assert.ok(I.INTENT_IDS.includes(a.intent));
  }
  for (const id of [undefined, null, 5, {}, 'pa-0']) {
    await assert.doesNotReject(() => w.assistant.confirm(id));
    assert.doesNotThrow(() => w.assistant.cancel(id));
  }
  const broken = T.createAssistant({ now: () => NOW, schedule: null, tasks: undefined, routines: {}, saved: null, search: null, familyConnection: null });
  for (const text of ['오늘 일정 알려줘', '오늘 할 일', '저장한 것 보여줘', '지팡이 상품 찾아줘', '가족에게 보여줘', '내일 병원 일정 추가']) assert.equal((await broken.handle(text)).result.status === 'ERROR' || (await broken.handle(text)).result.status === 'UNAVAILABLE', true, text);
  assert.equal((await broken.handle('건강 화면 열어줘')).result.status, 'SUCCESS', 'what needs no store still works');
  assert.equal(snapshot(w), '[]');
});

test('OG-AI-78 regression and documentation: areas, routes, collections and earlier suites are unchanged; the Phase 10 document is complete', () => {
  assert.deepEqual([...VIEWS], ['home', 'life', 'health', 'family', 'care', 'enjoy', 'community', 'store', 'saved', 'account']);
  assert.equal(COLLECTIONS.length, 25);
  assert.equal(fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).length, 70); // Completion V2: + health-appointments
  assert.deepEqual(createSearch().providerIds(), []);
  // Phase 11: the version moved on (BEFORE assistant-v1, AFTER hardening-v1) and one test file was added (BEFORE 20, AFTER 21).
  assert.match(APP, /const APP_VERSION = 'hardening-v1';/);
  for (const tool of ['search', 'notifications', 'assistant']) assert.match(HTML, new RegExp(`data-og-tool="${tool}" aria-expanded="false" aria-controls="og-panel-${tool}"`));
  assert.equal(fs.existsSync(path.join(ROOT, 'server/ongil')), false, 'no ONGIL backend or server route was added');
  const tests = fs.readdirSync(path.join(ROOT, 'tests/ongil')).filter((f) => f.endsWith('.test.mjs'));
  // Phase 12: production-release.test.mjs was added (BEFORE 21, AFTER 22). API connection: production-api.test.mjs (BEFORE 22, AFTER 23). Completion V1: health-measures.test.mjs (AFTER 24). Completion V2: health-calendar.test.mjs (AFTER 25).
  assert.equal(tests.length, 25);
  const doc = read('docs/ongil/PHASE_10_ONGIL_AI_V1.md');
  for (const h of ['OBJECTIVE', 'POSITIONING', 'CURRENT MODE', 'ARCHITECTURE', 'INTENTS', 'MATCHER', 'TOOL REGISTRY', 'TOOL CONTRACT', 'READ TOOLS', 'NAVIGATION TOOLS', 'WRITE TOOLS', 'CONFIRMATION', 'DATE PARSING', 'RESULT CONTRACT', 'HEALTH SAFETY', 'FAMILY BOUNDARY', 'PRIVACY', 'ANALYTICS', 'ROUTE SAFETY', 'SECURITY', 'ACCESSIBILITY', 'RESPONSIVE', 'PERFORMANCE', 'TESTS', 'KNOWN LIMITATIONS', 'MODEL MIGRATION', 'BACKEND REQUIREMENTS', 'PHASE 11 HANDOFF']) assert.match(doc, new RegExp(`^## (\\d+\\. )?${h}$`, 'm'), h);
  for (const id of I.INTENT_IDS) assert.ok(doc.includes(`\`${id}\``), `${id} is documented`);
  for (const id of world().assistant.tools.ids()) assert.ok(doc.includes(`\`${id}\``), `${id} is documented`);
  for (const name of A.EVENT_NAMES.filter((n) => n.startsWith('ai_'))) assert.ok(doc.includes(`\`${name}\``), `${name} is documented`);
  assert.match(doc, /model output is not a trusted instruction/i);
  assert.match(doc, /AI MODEL = NOT CONNECTED/);
});
