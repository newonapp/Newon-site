/*
 * 건강·안부 홈 (Health · Safety V2) — the person's own day at a glance, on the 건강·안부 screen, above 긴급 연락망 and the
 * 병원 일정 · 건강검진 lists. Built from the existing ONGIL parts (card, choice buttons, item list, confirm box): no new look.
 *
 *   오늘의 안부        today's check-in, chosen by the person (the SAME record as Home and 내 생활 › 건강)
 *   오늘 복약          today's planned medications with the person's own mark: 먹었어요 · 건너뜀 · 표시 풀기
 *   다가오는 병원·검진 the next dates from the one calendar store (no booking)
 *   최근 건강 기록      the last 7 days, one line per day (counts and the person's own choices)
 *   생활 변화          health-changes.js: counts compared week to week, with the numbers, never a judgement
 *   도움이 필요할 때    family (what is really possible), 돌봄·서비스, and the emergency card (119: 직접 전화, by the person)
 *   가족 공유          what each connected family member may see of the health-related categories (default: nothing)
 *   연결된 기기         none — ONGIL connects to no wearable, sensor, camera or microphone
 *
 * Nothing here is fake: an empty store is an empty card. A check-in is a note, not a safety confirmation. Nothing is sent,
 * searched, counted or shown to anyone; nothing calls an AI. Every store read is guarded so one damaged record cannot
 * stop the screen.
 */
import { el, clear, append } from './dom.js';
import { createCard, choiceButton } from './home-ui.js';
import { CHECKIN_STATUSES, HEALTH_EVENT_KINDS, eventKind, eventKindLabel } from './life-contracts.js';
import { dateKey, addDays, formatDateKey, formatTime } from './dates.js';
import { describeHealthDay } from './life-health.js';
import { computeLifeChanges, CHANGE_NOTE } from './health-changes.js';
import { SHARING_CATEGORIES, LEVEL_LABELS } from './family-domain.js';

const put = (node, ...kids) => append(node, kids);
const labelOf = (options, id) => (options.find((o) => o.id === id) || { label: '' }).label;
const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
/* family categories that carry health-related information (the ones this screen reports on) */
export const HEALTH_SHARE_CATEGORIES = Object.freeze(['CHECK_IN', 'MEDICATION', 'HEALTH', 'CHECKUP', 'HELP_REQUEST']);
export const CHECKIN_IS_NOT_SAFETY = '안부 기록은 내가 남기는 메모예요. 안전을 확인하거나 누군가에게 알리는 기능은 아니에요.';
export const MEDICATION_MARK_NOTE = '먹었어요·건너뜀은 내가 직접 표시한 것만 기록돼요. 화면에 시간이 보이거나 가족이 요약을 보는 것으로는 표시되지 않아요. 휴대폰 알림은 설정하지 않아요.';
export const MEDICATION_ADVICE_NOTE = 'ONGIL은 약이나 복용량을 정하거나 바꾸라고 권하지 않아요. 약에 대해 궁금하면 의사나 약사와 상의하세요.';
export const EMERGENCY_HONEST_NOTE = '위급하면 119에 직접 전화하세요. ONGIL은 대신 신고하거나, 가족에게 알리거나, 위치를 보내지 않아요.';
export const DEVICES_NOTE = '연결된 기기 없음. ONGIL은 지금 웨어러블·센서·카메라·마이크와 연결하지 않아요.';

export function createHealthSafetyHome({ host, checkIn, medication, schedule, symptoms, healthNotes, healthMeasures, sleep, dailyLife, familyConnect = null, emergencyCard = null, now = () => Date.now(), onChange = null }) {
  const today = () => dateKey(now());
  const cards = {
    today: createCard({ area: 'health', slot: 'today', title: '오늘의 안부', level: 1, lead: '오늘 어떤지 직접 골라 두세요. 고르지 않아도 괜찮아요.' }),
    medication: createCard({ area: 'health', slot: 'medication-today', title: '오늘 복약', level: 2 }),
    upcoming: createCard({ area: 'health', slot: 'upcoming', title: '다가오는 병원·검진 일정', level: 2 }),
    recent: createCard({ area: 'health', slot: 'recent', title: '최근 건강 기록', level: 2 }),
    changes: createCard({ area: 'health', slot: 'changes', title: '생활 변화', level: 2, lead: '최근 7일과 그 전 7일의 내 기록을 비교해요.' }),
    help: createCard({ area: 'health', slot: 'help', title: '도움이 필요할 때', level: 2 }),
    sharing: createCard({ area: 'health', slot: 'family-sharing', title: '가족 공유', level: 3 }),
    devices: createCard({ area: 'health', slot: 'devices', title: '연결된 기기', level: 3 }),
  };
  const ui = { confirmClear: false };
  const root = el('div', { class: 'og-family-grid og-health-home', 'data-og-health-home': 'true' }, Object.values(cards).map((c) => c.root));
  if (host) host.prepend(root);
  const changed = () => { render(); if (typeof onChange === 'function') onChange(); };
  const link = (href, text, attrs = {}) => el('a', { class: 'og-btn og-btn--ghost og-btn--small', href, ...attrs, text });

  /* ───────── 오늘의 안부 ───────── */
  function renderToday() {
    const c = cards.today;
    const t = today();
    const record = safe(() => checkIn.get(t), null);
    clear(c.body);
    c.root.dataset.ogState = record && record.status ? 'recorded' : 'empty';
    const choose = (status) => {
      const r = safe(() => checkIn.set(status), { ok: false });
      c.say(r && r.ok !== false ? `오늘 안부를 ‘${labelOf(CHECKIN_STATUSES, status)}’(으)로 적었어요.` : '이 기기에 저장하지 못했어요. 잠시 후 다시 해 주세요.');
      changed();
    };
    put(c.body, 
      el('p', { class: 'og-home-item__meta', 'data-og-health-date': t, text: `${formatDateKey(t)} (오늘)` }),
      el('div', { class: 'og-choices__list', role: 'group', 'aria-label': '오늘의 안부 고르기' }, CHECKIN_STATUSES.map((s) => choiceButton({ label: s.label, pressed: !!record && record.status === s.id, onChoose: () => choose(s.id) }))),
      el('p', { 'data-og-health-checkin': record && record.status ? record.status : 'none', text: record && record.status ? `오늘 안부: ${labelOf(CHECKIN_STATUSES, record.status)}` : '오늘은 아직 안부를 적지 않았어요.' }),
      record && record.status === 'help' ? el('p', { class: 'og-home-note', text: '‘도움이 필요해요’를 골라도 누구에게도 알려지지 않아요. 아래 ‘도움이 필요할 때’에서 직접 연락할 수 있어요.' }) : null,
      el('p', { class: 'og-home-note', text: CHECKIN_IS_NOT_SAFETY }),
      ui.confirmClear
        ? el('div', { class: 'og-confirm', role: 'group', 'aria-label': '오늘 안부 지우기 확인', onkeydown: (event) => { if (event.key === 'Escape') { event.preventDefault(); ui.confirmClear = false; render(); } } },
            el('p', { text: '오늘 적은 안부를 지울까요? 몸 상태·메모도 함께 지워져요.' }),
            el('div', { class: 'og-form__actions' },
              el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-focus': 'checkin-keep', text: '그대로 두기', onclick: () => { ui.confirmClear = false; render(); } }),
              el('button', { type: 'button', class: 'og-btn og-btn--danger', text: '지우기', onclick: () => { const r = safe(() => checkIn.remove(t), { ok: false }); ui.confirmClear = false; c.say(r && r.ok !== false ? '오늘 안부를 지웠어요.' : '지우지 못했어요. 잠시 후 다시 해 주세요.'); changed(); } })))
        : el('div', { class: 'og-form__actions' },
            link('#life/checkin', '몸 상태·메모까지 적기'),
            record ? el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', text: '오늘 안부 지우기', onclick: () => { ui.confirmClear = true; render(); queueMicrotask(() => { const k = c.body.querySelector('[data-og-focus="checkin-keep"]'); if (k) k.focus(); }); } }) : null)
    );
  }

  /* ───────── 오늘 복약 ───────── */
  function renderMedication() {
    const c = cards.medication;
    const t = today();
    const meds = safe(() => medication.listForDate(t), []);
    clear(c.body);
    c.root.dataset.ogState = meds.length ? 'filled' : 'empty';
    if (!meds.length) {
      put(c.body, el('p', { class: 'og-home-empty', text: safe(() => medication.count(), 0) ? '오늘 먹을 약으로 적어 둔 것이 없어요.' : '적어 둔 약이 없어요.' }), el('div', { class: 'og-form__actions' }, link('#life/checkin', '내 약 목록 열기')), el('p', { class: 'og-home-note', text: MEDICATION_ADVICE_NOTE }));
      return;
    }
    const mark = (m, status, text) => {
      const r = safe(() => medication.setStatus(m.id, status, t), { ok: false });
      c.say(r && r.ok ? text : '이 기기에 저장하지 못했어요. 잠시 후 다시 해 주세요.');
      changed();
    };
    put(c.body, 
      el('ul', { class: 'og-home-items', 'aria-label': '오늘 먹을 약' }, meds.map((m) => {
        const state = m.taken ? '먹었어요로 표시' : m.skipped ? '건너뜀으로 표시' : '아직 표시하지 않았어요';
        return el('li', { class: m.taken ? 'og-home-item is-done' : 'og-home-item', 'data-og-health-med': m.id },
          el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: m.name }), el('p', { class: 'og-home-item__meta', text: [m.time ? formatTime(m.time) : '', state].filter(Boolean).join(' · ') })),
          el('div', { class: 'og-home-item__actions' },
            !m.taken ? el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'aria-label': `‘${m.name}’ 먹었어요로 표시`, text: '먹었어요', onclick: () => mark(m, 'TAKEN', `‘${m.name}’을(를) 먹었어요로 표시했어요.`) }) : null,
            !m.taken && !m.skipped ? el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'aria-label': `‘${m.name}’ 건너뜀으로 표시`, text: '건너뜀', onclick: () => mark(m, 'SKIPPED', `‘${m.name}’을(를) 건너뜀으로 표시했어요.`) }) : null,
            m.taken || m.skipped ? el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'aria-label': `‘${m.name}’ 표시 풀기`, text: '표시 풀기', onclick: () => mark(m, 'NONE', `‘${m.name}’ 표시를 풀었어요.`) }) : null));
      })),
      el('div', { class: 'og-form__actions' }, link('#life/checkin', '내 약 목록 고치기')),
      el('p', { class: 'og-home-note', text: MEDICATION_MARK_NOTE }),
      el('p', { class: 'og-home-note', text: MEDICATION_ADVICE_NOTE })
    );
  }

  /* ───────── 다가오는 병원·검진 ───────── */
  function renderUpcoming() {
    const c = cards.upcoming;
    const list = HEALTH_EVENT_KINDS.flatMap((k) => safe(() => schedule.listUpcoming(k, today()), [])).sort((a, b) => a.date.localeCompare(b.date) || String(a.time).localeCompare(String(b.time))).slice(0, 3);
    clear(c.body);
    c.root.dataset.ogState = list.length ? 'filled' : 'empty';
    put(c.body, 
      list.length
        ? el('ul', { class: 'og-family-points', 'aria-label': '다가오는 병원·검진 일정' }, list.map((e) => el('li', { text: `${formatDateKey(e.date)}${e.time ? ` ${formatTime(e.time)}` : ''} · ${eventKindLabel(eventKind(e))} · ${e.title}` })))
        : el('p', { class: 'og-home-empty', text: '다가오는 병원·검진 일정이 없어요.' }),
      el('p', { class: 'og-home-note', text: '이 화면 아래 ‘병원 일정’·‘건강검진’에서 추가하고 고칠 수 있어요. 내 기기에만 적어 두는 일정이며, 병원에 예약하거나 전달하지 않아요.' })
    );
  }

  /* ───────── 최근 건강 기록 ───────── */
  function renderRecent() {
    const c = cards.recent;
    const t = today();
    const stores = { checkIn, symptoms, medication, healthNotes, healthMeasures };
    const lines = Array.from({ length: 7 }, (_, i) => addDays(t, -i)).map((d) => ({ d, parts: safe(() => describeHealthDay(stores, d), []) })).filter((x) => x.parts.length);
    clear(c.body);
    c.root.dataset.ogState = lines.length ? 'filled' : 'empty';
    put(c.body, 
      lines.length
        ? el('ul', { class: 'og-family-points', 'aria-label': '최근 7일 건강 기록' }, lines.map((x) => el('li', {}, el('strong', { text: `${formatDateKey(x.d)} ` }), x.parts.join(' · '))))
        : el('p', { class: 'og-home-empty', text: '최근 7일 동안 적은 건강 기록이 없어요.' }),
      el('div', { class: 'og-form__actions' }, link('#life/checkin', '내 생활 › 건강에서 보기'))
    );
  }

  /* ───────── 생활 변화 ───────── */
  function renderChanges() {
    const c = cards.changes;
    const result = safe(() => computeLifeChanges({ checkIn, sleep, dailyLife, medication }, today()), { enough: false, metrics: [] });
    clear(c.body);
    c.root.dataset.ogState = result.enough ? 'filled' : 'not-enough';
    put(c.body, 
      result.enough ? null : el('p', { class: 'og-home-empty', 'data-og-health-changes': 'not-enough', text: '아직 비교할 기록이 충분하지 않아요. 며칠 더 적으면 지난주와 비교해 볼 수 있어요.' }),
      el('ul', { class: 'og-family-points', 'aria-label': '생활 변화' }, result.metrics.map((m) => el('li', { 'data-og-change': m.id, 'data-og-change-enough': m.enough ? 'true' : 'false', text: m.text }))),
      el('p', { class: 'og-home-note', text: CHANGE_NOTE })
    );
  }

  /* ───────── 도움이 필요할 때 ───────── */
  function familyState() {
    const o = familyConnect ? safe(() => familyConnect.overview(), null) : null;
    const connected = o && Array.isArray(o.connected) ? o.connected : [];
    const levels = (id) => safe(() => familyConnect.levels(id), {}) || {};
    return { connected, helpReady: connected.filter((m) => levels(m.id).HELP_REQUEST === 'DETAIL'), levels };
  }
  function renderHelp() {
    const c = cards.help;
    const f = familyState();
    clear(c.body);
    const familyLine = !f.connected.length
      ? '연결된 가족이 없어요. 가족 화면에서 먼저 연결해야 도움을 부탁할 수 있어요.'
      : !f.helpReady.length
        ? '연결된 가족에게 도움을 부탁하려면 가족 화면에서 그 가족에게 ‘도움 요청’ 공유를 먼저 켜야 해요.'
        : `${f.helpReady.map((m) => `${m.displayName}님`).join(', ')}에게 도움을 부탁할 수 있어요. 지금은 이 기기 안에서만 남겨지고, 다른 휴대폰으로 보내지지 않아요.`;
    put(c.body, 
      el('ul', { class: 'og-home-items', 'aria-label': '도움 받는 방법' },
        el('li', { class: 'og-home-item', 'data-og-help-option': 'family' },
          el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: '가족에게 도움 요청' }), el('p', { class: 'og-home-item__meta', text: familyLine })),
          el('div', { class: 'og-home-item__actions' }, link('#family', f.helpReady.length ? '가족에게 부탁하기' : '가족 화면 열기'))),
        el('li', { class: 'og-home-item', 'data-og-help-option': 'care' },
          el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: '돌봄 도움 알아보기' }), el('p', { class: 'og-home-item__meta', text: '가까운 복지관·보건소 같은 기관을 찾아봐요. 신청이나 예약은 하지 않아요.' })),
          el('div', { class: 'og-home-item__actions' }, link('#care', '돌봄·서비스 열기'))),
        el('li', { class: 'og-home-item', 'data-og-help-option': 'emergency' },
          el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: '긴급 상황 안내' }), el('p', { class: 'og-home-item__meta', text: EMERGENCY_HONEST_NOTE })),
          el('div', { class: 'og-home-item__actions' }, emergencyCard ? el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', text: '긴급 연락망 보기', onclick: () => { emergencyCard.root.scrollIntoView({ block: 'start' }); emergencyCard.focusTitle(); } }) : null)))
    );
  }

  /* ───────── 가족 공유 (what is shared, decided on the 가족 screen — the Family V1 permission engine) ───────── */
  function renderSharing() {
    const c = cards.sharing;
    const f = familyState();
    const rows = f.connected.map((m) => {
      const lv = f.levels(m.id);
      const shown = SHARING_CATEGORIES.filter((cat) => HEALTH_SHARE_CATEGORIES.includes(cat.id) && lv[cat.id] && lv[cat.id] !== 'NONE').map((cat) => `${cat.label}(${LEVEL_LABELS[lv[cat.id]]})`);
      return { m, shown };
    });
    const any = rows.some((r) => r.shown.length);
    clear(c.body);
    c.root.dataset.ogState = any ? 'sharing' : 'off';
    put(c.body, 
      el('p', { 'data-og-health-sharing': any ? 'on' : 'off', text: any ? '건강 관련 정보 가운데 일부를 가족에게 보여 주고 있어요.' : '건강 관련 정보는 어떤 가족에게도 보여 주지 않고 있어요. (기본값: 꺼짐)' }),
      rows.length ? el('ul', { class: 'og-family-points', 'aria-label': '가족별 건강 관련 공유' }, rows.map((r) => el('li', { text: `${r.m.displayName}님: ${r.shown.length ? r.shown.join(', ') : '건강 관련 공유 없음'}` }))) : null,
      el('p', { class: 'og-home-note', text: '안부·복약·병원 일정·건강 기록은 항목마다, 가족마다 따로 켜고 끌 수 있어요. 건강 관련 항목은 한 번 더 동의해야 켜지고, 끄면 그 뒤로는 보이지 않아요. 건강 수치·증상·건강 메모 내용은 공유 항목이 아니에요.' }),
      el('div', { class: 'og-form__actions' }, link('#family', '가족 화면에서 바꾸기'))
    );
  }

  function renderDevices() {
    const c = cards.devices;
    clear(c.body);
    c.root.dataset.ogState = 'none';
    put(c.body, el('p', { class: 'og-home-empty', 'data-og-health-devices': 'none', text: DEVICES_NOTE }));
  }

  function render() {
    for (const fn of [renderToday, renderMedication, renderUpcoming, renderRecent, renderChanges, renderHelp, renderSharing, renderDevices]) {
      try { fn(); } catch { /* one card that cannot be drawn never stops the others */ }
    }
  }
  render();
  return Object.freeze({ root, cards, render });
}
