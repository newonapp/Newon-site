/*
 * Home V2 — the senior's day at a glance, then the rest of ONGIL (Home V1 in Phase 2A, joined with My Life in Phase 2C).
 *
 *   hero        greeting for the time of day (+ nickname when the user gave one) and today's date
 *   1 오늘       h2 오늘 · date · what is left today (counts of the user's own records, shown only when there is something)
 *   2 plan      오늘 할 것    오늘 일정 · 오늘 할 일 · 오늘 루틴 · 기한 지난 할 일 (one buildToday result) · 다가오는 일정
 *   3 health    건강·안부     오늘의 안부 · 복약 (먹었어요 · 건너뜀) · 식사·물·운동
 *   4 family    가족          connection facts only (this device), never a record
 *   5 enjoy     즐길거리      categories · 내가 저장한 관심 활동 · 찾아 본 것 · 내 주변 강좌 (on a button)
 *   6 care      돌봄·서비스   kinds of help, what has no data yet
 *   7 community 커뮤니티      the person's own posts and drafts on this device (no remote community)
 *   8 helper    ONGIL 도우미  the rule-based helper, opened on a button
 *   9 guide     서비스 안내
 *
 * Every section is built and redrawn inside its own guard: one section that fails shows a short, plain notice and the
 * rest of Home keeps working. Drawing Home only reads: it writes nothing, sends nothing and never changes the address.
 * Local content renders at once. The only external source (내 주변) is asked when the user presses its button.
 */
import { el, clear } from './dom.js';
import { greeting, formatDay, dateKey } from './dates.js';
import { createCard } from './home-ui.js';
import { createCheckInCard, createPlanCards, createUpcomingCard, createMedicationCard, createDailyLifeCard } from './home-today.js';
import { createFamilyCard, createEnjoyCard, createCareCard, createCommunityCard, createHelperCard, createGuideCard } from './home-explore.js';

/* the section order of Home V2. `cards` are the slots drawn in that section, in order. */
export const HOME_SECTIONS = Object.freeze([
  Object.freeze({ id: 'plan', title: '오늘 할 것', lead: '내 생활에 적어 둔 오늘의 일정, 할 일, 루틴이에요. 끝낸 것에 표시하세요.', cards: Object.freeze(['plan-events', 'plan-tasks', 'plan-routines', 'plan-overdue', 'plan-upcoming']) }),
  Object.freeze({ id: 'health', title: '건강·안부', lead: '내가 직접 남기는 기록이에요. ONGIL이 몸 상태를 판단하거나 누군가에게 알리지 않아요.', cards: Object.freeze(['check-in', 'medication', 'life-check']) }),
  Object.freeze({ id: 'family', title: '가족', cards: Object.freeze(['family']) }),
  Object.freeze({ id: 'enjoy', title: '즐길거리', cards: Object.freeze(['enjoy']) }),
  Object.freeze({ id: 'care', title: '돌봄·서비스', cards: Object.freeze(['care']) }),
  Object.freeze({ id: 'community', title: '커뮤니티', cards: Object.freeze(['community']) }),
  Object.freeze({ id: 'helper', title: 'ONGIL 도우미', cards: Object.freeze(['helper']) }),
  Object.freeze({ id: 'guide', title: '서비스 안내', cards: Object.freeze(['guide']) }),
]);
/* a section with one card is that card (its own h3); a section with several cards gets an h3 and the cards are h4 */
const GROUPED = Object.freeze(['plan', 'health']);

export const SECTION_ERROR_TEXT = '이 부분을 지금 보여 드리지 못했어요. 화면을 다시 열면 나아질 수 있어요. 다른 부분은 그대로 쓸 수 있어요.';

/*
 * buildHomeSummary(stores, now) → what is left today. Pure (no DOM) and made only of counts of the user's own
 * records: no score, no rating, no "good day". A kind with nothing written is left out; with nothing at all
 * the summary is not shown. Tasks are those due today (the same as buildToday); overdue tasks are not "today".
 */
export function buildHomeSummary(stores, now = () => Date.now()) {
  const today = dateKey(now());
  const count = (items, isDone) => ({ total: items.length, left: items.filter((i) => !isDone(i)).length });
  const parts = {
    events: count(stores.schedule.listForDate(today), (e) => e.completed),
    tasks: count(stores.tasks.dueOn(today), (t) => t.completed),
    routines: count(stores.routines.listForDate(today), (r) => r.completed),
    medication: count(stores.medication.listForDate(today), (m) => m.taken),
  };
  const words = { events: ['일정', '모두 끝냈어요'], tasks: ['오늘 할 일', '모두 끝냈어요'], routines: ['루틴', '모두 했어요'], medication: ['약', '모두 먹었어요'] };
  const items = Object.keys(parts)
    .filter((k) => parts[k].total > 0)
    .map((k) => ({ id: k, label: words[k][0], text: parts[k].left ? `${parts[k].left}개 남음` : words[k][1], left: parts[k].left, total: parts[k].total }));
  /*
   * Phase 3: whether today's check-in was written — a fact, never how the user is. It joins the summary once
   * anything for today has been written (a check-in itself included), so an untouched Home still shows no summary.
   */
  const record = stores.checkIn ? stores.checkIn.get(today) : null;
  const checkin = { recorded: !!record };
  if (record || items.length) items.push({ id: 'checkin', label: '오늘 안부', text: record ? '남겼어요' : '아직 남기지 않았어요', left: record ? 0 : 1, total: 1 });
  return { today, ...parts, checkin, items, empty: items.length === 0 };
}

/*
 * family: { sharing, help, connect } · community: { posts, groups } · enjoyLoaded: () → 즐길거리 items found this visit
 * onAdd(section): opens the exact add form in 내 생활 (calendar · tasks · medication) · onHelper(): opens the helper panel
 */
export function createHomeView({ host, doc, stores, source, family = null, community = null, enjoyLoaded = null, now = () => Date.now(), onAdd = null, onHelper = null }) {
  const { profile, checkIn, schedule, medication, dailyLife, saved, tasks, routines } = stores;
  let summaryHost = null;
  let renderedDay = null;
  let cards = null;

  /* a card that could not be made or drawn: a plain notice in its place — no error code, no record */
  function failed(slot, title) {
    const card = createCard({ slot, title, level: 3, heading: GROUPED.some((g) => HOME_SECTIONS.find((s) => s.id === g).cards.includes(slot)) ? 'h4' : 'h3' });
    card.root.dataset.ogState = 'error';
    card.body.append(el('p', { class: 'og-home-empty', 'data-og-home-error': slot, text: SECTION_ERROR_TEXT }));
    return { card, render: () => {} };
  }
  function guard(slot, title, make) {
    try {
      return make();
    } catch {
      return failed(slot, title);
    }
  }
  function draw(slot) {
    const c = cards[slot];
    try {
      c.card.status.textContent = '';
      c.render();
    } catch {
      const f = failed(slot, c.card.titleNode.textContent);
      c.card.root.replaceWith(f.card.root);
      cards[slot] = f;
    }
  }

  /* the summary follows every change made on the cards below it */
  function renderSummary() {
    if (!summaryHost) return;
    let s;
    try {
      s = buildHomeSummary(stores, now);
    } catch {
      s = { empty: true, items: [] };
    }
    clear(summaryHost);
    summaryHost.hidden = s.empty;
    summaryHost.dataset.ogState = s.empty ? 'empty' : 'filled';
    if (s.empty) return;
    summaryHost.append(el('ul', { class: 'og-home-summary__list', 'aria-label': '오늘 남은 것' }, s.items.map((i) => el('li', { class: 'og-home-summary__item', 'data-og-home-summary': i.id, 'data-og-left': String(i.left) }, el('span', { class: 'og-home-summary__label', text: i.label }), el('strong', { class: 'og-home-summary__value', text: i.text })))));
  }
  /* a mark changes only its own list (which redraws itself and keeps its status line) and the summary above */
  const changed = () => renderSummary();

  function makeCards() {
    const made = {};
    const plan = guard('plan-events', '오늘 일정', () => createPlanCards({ stores: { schedule, tasks, routines }, now, onChange: changed, onAdd }));
    if (plan.card) made['plan-events'] = plan;
    else {
      made['plan-events'] = plan.events;
      made['plan-tasks'] = plan.tasks;
      made['plan-routines'] = plan.routines;
      made['plan-overdue'] = plan.overdue;
    }
    for (const [slot, title] of [['plan-tasks', '오늘 할 일'], ['plan-routines', '오늘 루틴'], ['plan-overdue', '기한 지난 할 일']]) if (!made[slot]) made[slot] = failed(slot, title);
    made['plan-upcoming'] = guard('plan-upcoming', '다가오는 일정', () => createUpcomingCard({ stores: { schedule, tasks }, now }));
    made['check-in'] = guard('check-in', '오늘의 안부', () => createCheckInCard({ checkIn, onChange: renderSummary }));
    made.medication = guard('medication', '복약', () => createMedicationCard({ medication, now, onChange: renderSummary, onAdd }));
    made['life-check'] = guard('life-check', '식사·물·운동', () => createDailyLifeCard({ dailyLife }));
    made.family = guard('family', '가족', () => createFamilyCard({ family }));
    made.enjoy = guard('enjoy', '즐길거리', () => createEnjoyCard({ loaded: enjoyLoaded, saved, profile, source }));
    made.care = guard('care', '돌봄·서비스', () => createCareCard());
    made.community = guard('community', '커뮤니티', () => createCommunityCard({ community }));
    made.helper = guard('helper', 'ONGIL 도우미', () => createHelperCard({ onOpen: onHelper }));
    made.guide = guard('guide', '서비스 안내', () => createGuideCard());
    return made;
  }

  function section(s) {
    if (!GROUPED.includes(s.id)) return el('div', { class: 'og-home-section og-home-section--single', 'data-og-home-section': s.id }, s.cards.map((slot) => cards[slot].card.root));
    const titleId = `og-home-section-${s.id}`;
    return el(
      'section',
      { class: 'og-home-section og-home-section--group', 'data-og-home-section': s.id, 'aria-labelledby': titleId },
      el('h3', { class: 'og-home-section__title', id: titleId, tabindex: '-1', text: s.title }),
      s.lead ? el('p', { class: 'og-home-section__lead', text: s.lead }) : null,
      el('div', { class: 'og-home-row og-home-grid' }, s.cards.map((slot) => cards[slot].card.root))
    );
  }

  /* grouped sections take the full width; the single-card sections that follow sit two to a row, in the same order */
  function sectionNodes() {
    const nodes = [];
    let row = null;
    for (const s of HOME_SECTIONS) {
      if (GROUPED.includes(s.id)) {
        row = null;
        nodes.push(section(s));
        continue;
      }
      if (!row) {
        row = el('div', { class: 'og-home-row og-home-row--sections' });
        nodes.push(row);
      }
      row.append(section(s));
    }
    return nodes;
  }

  function build() {
    clear(host);
    summaryHost = el('div', { class: 'og-home-summary', 'data-og-slot': 'home.summary', hidden: true });
    cards = makeCards();
    const wrap = el(
      'div',
      { class: 'og-wrap og-home og-home--v2' },
      el('p', { class: 'og-label', lang: 'en', text: 'TODAY' }),
      el('h2', { class: 'og-h', id: 'og-home-section-title', tabindex: '-1', text: '오늘' }),
      el('p', { class: 'og-lead', 'data-og-home-date': true, text: formatDay(now()) }),
      summaryHost,
      el('div', { class: 'og-extra', 'data-og-extra': 'home' }),
      sectionNodes()
    );
    host.append(wrap);
    host.dataset.ogRendered = 'true';
    renderedDay = dateKey(now());
    renderSummary();
  }

  /* hero: greeting and date. The static sentence in index.html stays as the no-script fallback. */
  function greet() {
    const node = doc.querySelector('[data-og-greeting]');
    if (!node) return;
    const hour = new Date(now()).getHours();
    let nickname = '';
    try {
      nickname = profile.getProfile().nickname;
    } catch {
      nickname = '';
    }
    clear(node);
    node.append(el('span', { class: 'og-greeting__hello', text: greeting(hour, nickname) }), el('span', { class: 'og-greeting__date', text: formatDay(now()) }));
  }

  /* re-read everything; called when Home is entered and when the calendar day changes while the page is open */
  function refresh() {
    greet();
    if (!cards || renderedDay !== dateKey(now())) {
      build();
      return true;
    }
    const date = host.querySelector('[data-og-home-date]');
    if (date) date.textContent = formatDay(now());
    /* a status line describes the last action on this screen; after a visit elsewhere it may no longer be true */
    for (const slot of Object.keys(cards)) draw(slot);
    renderSummary();
    return false;
  }

  function dayChanged() {
    return renderedDay !== null && renderedDay !== dateKey(now());
  }

  build();
  greet();
  return Object.freeze({ refresh, greet, dayChanged, extraHost: () => host.querySelector('[data-og-extra="home"]') });
}
