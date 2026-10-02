/*
 * Home — the day at a glance (V1 in Phase 2A, joined with My Life in Phase 2C).
 *
 *   hero        greeting for the time of day (+ nickname when the user gave one) and today's date
 *   summary     what is left today, counted from the user's own records (shown only when there is something)
 *   today       level 1   오늘의 안부 · 오늘 일정
 *   plan        level 2   오늘 할 일 · 오늘 루틴        ← My Life's tasks and routines, same stores
 *   care        level 2   복약 · 오늘의 생활
 *   connection  level 3   가족 · 오늘 뭐 하지?
 *   discovery   level 4   내 주변 · 빠른 실행
 *
 * Local content renders at once. The only external source (내 주변) is asked when the user presses its button,
 * so nothing outside this device can delay or break Home.
 */
import { el, clear } from './dom.js';
import { greeting, formatDay, dateKey } from './dates.js';
import { createCheckInCard, createScheduleCard, createHomeTasksCard, createHomeRoutinesCard, createMedicationCard, createDailyLifeCard } from './home-today.js';
import { createFamilyCard, createEnjoyCard, createNearbyCard, createQuickActionsCard } from './home-explore.js';

export const HOME_LEVELS = Object.freeze([
  Object.freeze({ group: 'today', level: 1, slots: ['check-in', 'schedule'] }),
  Object.freeze({ group: 'plan', level: 2, slots: ['tasks', 'routines'] }),
  Object.freeze({ group: 'care', level: 2, slots: ['medication', 'life-check'] }),
  Object.freeze({ group: 'connection', level: 3, slots: ['family-update', 'today'] }),
  Object.freeze({ group: 'discovery', level: 4, slots: ['nearby', 'quick-actions'] }),
]);

/*
 * buildHomeSummary(stores, now) → what is left today. Pure (no DOM) and made only of counts of the user's own
 * records: no score, no rating, no "good day". A kind with nothing written is left out; with nothing at all
 * the summary is not shown.
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

export function createHomeView({ host, doc, stores, source, now = () => Date.now(), onAddTask }) {
  const { profile, checkIn, schedule, medication, dailyLife, saved, familyConnection, tasks, routines } = stores;
  let summaryHost = null;
  let renderedDay = null;
  let cards = null;

  function reveal(card, after) {
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    card.root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    after();
  }

  /* the summary follows every change made on the cards below it */
  function renderSummary() {
    if (!summaryHost) return;
    const s = buildHomeSummary(stores, now);
    clear(summaryHost);
    summaryHost.hidden = s.empty;
    summaryHost.dataset.ogState = s.empty ? 'empty' : 'filled';
    if (s.empty) return;
    summaryHost.append(el('ul', { class: 'og-home-summary__list', 'aria-label': '오늘 남은 것' }, s.items.map((i) => el('li', { class: 'og-home-summary__item', 'data-og-home-summary': i.id, 'data-og-left': String(i.left) }, el('span', { class: 'og-home-summary__label', text: i.label }), el('strong', { class: 'og-home-summary__value', text: i.text })))));
  }

  function build() {
    clear(host);
    const scheduleCard = createScheduleCard({ schedule, onChange: renderSummary });
    const medicationCard = createMedicationCard({ medication, onChange: renderSummary });
    summaryHost = el('div', { class: 'og-home-summary', 'data-og-slot': 'home.summary', hidden: true });
    cards = {
      'check-in': createCheckInCard({ checkIn, onChange: renderSummary }),
      schedule: scheduleCard,
      tasks: createHomeTasksCard({ tasks, now, onChange: renderSummary, onAdd: onAddTask }),
      routines: createHomeRoutinesCard({ routines, onChange: renderSummary }),
      medication: medicationCard,
      'life-check': createDailyLifeCard({ dailyLife }),
      'family-update': createFamilyCard({ familyConnection }),
      today: createEnjoyCard(),
      nearby: createNearbyCard({ profile, source, saved }),
      'quick-actions': createQuickActionsCard({
        actions: {
          'add-event': () => reveal(scheduleCard.card, scheduleCard.openAdd),
          'add-task': () => onAddTask && onAddTask(),
          'add-medication': () => reveal(medicationCard.card, medicationCard.openAdd),
        },
      }),
    };
    const wrap = el(
      'div',
      { class: 'og-wrap og-home' },
      el('p', { class: 'og-label', lang: 'en', text: 'TODAY' }),
      el('h2', { class: 'og-h', id: 'og-home-section-title', tabindex: '-1', text: '오늘' }),
      el('p', { class: 'og-lead', 'data-og-home-date': true, text: formatDay(now()) }),
      summaryHost,
      el('div', { class: 'og-extra', 'data-og-extra': 'home' }),
      HOME_LEVELS.map((row) => el('div', { class: `og-home-row og-home-row--l${row.level}`, 'data-og-home-level': String(row.level), 'data-og-home-group': row.group }, row.slots.map((slot) => cards[slot].card.root)))
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
    clear(node);
    node.append(el('span', { class: 'og-greeting__hello', text: greeting(hour, profile.getProfile().nickname) }), el('span', { class: 'og-greeting__date', text: formatDay(now()) }));
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
    for (const key of Object.keys(cards)) {
      /* a status line describes the last action on this screen; after a visit elsewhere it may no longer be true */
      cards[key].card.status.textContent = '';
      cards[key].render();
    }
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
