/*
 * Home V1 — the day at a glance.
 *
 *   hero        greeting for the time of day (+ nickname when the user gave one) and today's date
 *   level 1     오늘의 안부 · 오늘 일정
 *   level 2     복약 · 오늘의 생활
 *   level 3     가족 · 오늘 뭐 하지?
 *   level 4     내 주변 · 빠른 실행
 *
 * Local content renders at once. The only external source (내 주변) is asked when the user presses its button,
 * so nothing outside this device can delay or break Home.
 */
import { el, clear } from './dom.js';
import { greeting, formatDay, dateKey } from './dates.js';
import { createCheckInCard, createScheduleCard, createMedicationCard, createDailyLifeCard } from './home-today.js';
import { createFamilyCard, createEnjoyCard, createNearbyCard, createQuickActionsCard } from './home-explore.js';

export const HOME_LEVELS = Object.freeze([
  Object.freeze({ level: 1, slots: ['check-in', 'schedule'] }),
  Object.freeze({ level: 2, slots: ['medication', 'life-check'] }),
  Object.freeze({ level: 3, slots: ['family-update', 'today'] }),
  Object.freeze({ level: 4, slots: ['nearby', 'quick-actions'] }),
]);

export function createHomeView({ host, doc, stores, source, now = () => Date.now() }) {
  const { profile, checkIn, schedule, medication, dailyLife, saved, familyConnection } = stores;
  let renderedDay = null;
  let cards = null;

  function reveal(card, after) {
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    card.root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    after();
  }

  function build() {
    clear(host);
    const scheduleCard = createScheduleCard({ schedule });
    const medicationCard = createMedicationCard({ medication });
    cards = {
      'check-in': createCheckInCard({ checkIn }),
      schedule: scheduleCard,
      medication: medicationCard,
      'life-check': createDailyLifeCard({ dailyLife }),
      'family-update': createFamilyCard({ familyConnection }),
      today: createEnjoyCard(),
      nearby: createNearbyCard({ profile, source, saved }),
      'quick-actions': createQuickActionsCard({
        actions: {
          'add-event': () => reveal(scheduleCard.card, scheduleCard.openAdd),
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
      el('div', { class: 'og-extra', 'data-og-extra': 'home' }),
      HOME_LEVELS.map((row) => el('div', { class: `og-home-row og-home-row--l${row.level}`, 'data-og-home-level': String(row.level) }, row.slots.map((slot) => cards[slot].card.root)))
    );
    host.append(wrap);
    host.dataset.ogRendered = 'true';
    renderedDay = dateKey(now());
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
    for (const key of Object.keys(cards)) cards[key].render();
    return false;
  }

  function dayChanged() {
    return renderedDay !== null && renderedDay !== dateKey(now());
  }

  build();
  greet();
  return Object.freeze({ refresh, greet, dayChanged, extraHost: () => host.querySelector('[data-og-extra="home"]') });
}
