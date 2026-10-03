/*
 * My Life V1 — the user's own life in one place.
 *
 *   요약   today and this week, from what the user actually wrote
 *   일정   캘린더 · 할 일 · 루틴
 *   생활   식사 · 물 · 운동 · 수면       ← one date bar for all four; past days can be corrected (Phase 2C)
 *   기록   생활비 · 기록(일기)            ← private; the summary shows only whether something was written
 *   건강   안부와 몸 상태 · 증상 · 복약 · 건강 메모   ← Phase 3; the same date bar as 생활 (moved between the two tabs)
 *
 * Fourteen areas, five tabs: on a phone the user sees five large choices, not a wall of fourteen.
 * Addresses: #life (요약) and #life/<section> — e.g. #life/calendar, #life/journal; a tab's own name works too
 * (#life/plan, #life/daily, #life/records, #life/health). An unknown section falls back to 요약.
 * Everything is local. No statistic is invented: where nothing was written the summary says so.
 */
import { el, clear } from './dom.js';
import { createCard } from './home-ui.js';
import { createCalendarSection, createTasksSection, createRoutinesSection } from './life-plan.js';
import { createDailyGroup } from './life-daily.js';
import { createExpensesSection, createJournalSection } from './life-records.js';
import { createHealthGroup } from './life-health.js';
import { dateKey, formatDay, formatTime, weekOf, monthKey } from './dates.js';

export const LIFE_SECTIONS = Object.freeze(['overview', 'calendar', 'tasks', 'routines', 'meals', 'water', 'exercise', 'sleep', 'expenses', 'journal', 'checkin', 'symptoms', 'medication', 'health-notes', 'measures']);
export const LIFE_GROUPS = Object.freeze([
  Object.freeze({ id: 'overview', label: '요약', sections: Object.freeze(['overview']) }),
  Object.freeze({ id: 'plan', label: '일정', sections: Object.freeze(['calendar', 'tasks', 'routines']) }),
  Object.freeze({ id: 'daily', label: '생활', sections: Object.freeze(['meals', 'water', 'exercise', 'sleep']) }),
  Object.freeze({ id: 'records', label: '기록', sections: Object.freeze(['expenses', 'journal']) }),
  Object.freeze({ id: 'health', label: '건강', sections: Object.freeze(['checkin', 'symptoms', 'medication', 'health-notes', 'measures']) }),
]);
/* the tabs whose cards follow the shared date bar */
export const DATED_GROUPS = Object.freeze(['daily', 'health']);
/* a tab's own name is also an address: it opens the tab at its first section */
export const SECTION_ALIASES = Object.freeze({ plan: 'calendar', daily: 'meals', records: 'expenses', health: 'checkin' });
/* the section an address names, or '' when it names none (the caller then falls back to 요약) */
export function resolveSection(name) {
  if (typeof name !== 'string' || name === '') return '';
  if (LIFE_SECTIONS.includes(name)) return name;
  return Object.prototype.hasOwnProperty.call(SECTION_ALIASES, name) ? SECTION_ALIASES[name] : '';
}
export const groupOf = (section) => LIFE_GROUPS.find((g) => g.sections.includes(section)) || LIFE_GROUPS[0];
export const lifeHash = (section) => (section && section !== 'overview' && LIFE_SECTIONS.includes(section) ? `#life/${section}` : '#life');

/*
 * buildOverview(stores, now) → plain data for the summary. Pure: no DOM, so tests can check that
 * private records contribute a yes/no and a count only — never an amount or a sentence of the journal.
 */
export function buildOverview(stores, now = () => Date.now()) {
  const today = dateKey(now());
  const { schedule, tasks, routines, dailyLife, sleep, expenses, journal } = stores;
  const events = schedule.listForDate(today);
  const todayRoutines = routines.listForDate(today);
  const day = dailyLife.get(today);
  const night = sleep.get(today);
  const week = weekOf(today);
  const recorded = new Set(dailyLife.recordedDates());
  const weekEvents = week.reduce((n, d) => n + schedule.listForDate(d).length, 0);
  const weekExercise = week.filter((d) => recorded.has(d) && dailyLife.get(d).exercise).length;
  const weekSleep = week.filter((d) => sleep.get(d)).length;
  const weekRoutineDone = week.reduce((n, d) => n + routines.listForDate(d).filter((r) => r.completed).length, 0);
  return {
    today,
    events: { total: events.length, done: events.filter((e) => e.completed).length, next: events.filter((e) => !e.completed).slice(0, 3).map((e) => ({ title: e.title, time: e.time })) },
    tasks: { open: tasks.openCount(), dueToday: tasks.dueOn(today).filter((t) => !t.completed).length },
    routines: { total: todayRoutines.length, done: todayRoutines.filter((r) => r.completed).length },
    meals: { count: day.meals },
    water: { count: day.water },
    exercise: { done: day.exercise },
    sleep: night ? { recorded: true, bedTime: night.bedTime, wakeTime: night.wakeTime } : { recorded: false },
    private: { expenseEntriesThisMonth: expenses.countForMonth(monthKey(today)), journalToday: journal.hasEntry(today) },
    week: { events: weekEvents, exerciseDays: weekExercise, sleepDays: weekSleep, routinesDone: weekRoutineDone, empty: weekEvents + weekExercise + weekSleep + weekRoutineDone === 0 },
  };
}

/*
 * health (Phase 3): { checkIn, symptoms, medication, healthNotes, healthMeasures? } — the same store objects Home uses. Kept apart
 * from `stores` because they are HEALTH_ADJACENT: the summary (buildOverview) never reads them.
 */
export function createLifeView({ host, stores, health, now = () => Date.now() }) {
  let current = 'overview';
  const panels = {};
  const tabs = {};
  let sections = null;
  let overviewCards = null;
  let daily = null;
  let healthGroup = null;

  function tile(section, title, value, detail) {
    return el('li', { class: 'og-life-tile', 'data-og-life-tile': section }, el('h4', { class: 'og-life-tile__title', text: title }), el('p', { class: 'og-life-tile__value', text: value }), detail ? el('p', { class: 'og-life-tile__detail', text: detail }) : null, el('a', { class: 'og-btn og-btn--ghost og-btn--small', href: lifeHash(section), 'aria-label': `${title} 보기`, text: '보기' }));
  }

  function renderOverview() {
    const o = buildOverview(stores, now);
    const todayCard = overviewCards.today;
    const weekCard = overviewCards.week;
    clear(todayCard.body);
    const sleepText = o.sleep.recorded ? ['적었어요', [o.sleep.bedTime ? `잠든 시간 ${formatTime(o.sleep.bedTime)}` : '', o.sleep.wakeTime ? `일어난 시간 ${formatTime(o.sleep.wakeTime)}` : ''].filter(Boolean).join(' · ')] : ['적지 않았어요', ''];
    todayCard.body.append(
      el('p', { class: 'og-home-card__lead', 'data-og-life-date': o.today, text: formatDay(now()) }),
      el(
        'ul',
        { class: 'og-life-tiles', 'aria-label': '오늘 요약' },
        tile('calendar', '오늘 일정', o.events.total ? `${o.events.total}개 (끝냄 ${o.events.done}개)` : '없어요', o.events.next.map((e) => (e.time ? `${formatTime(e.time)} ${e.title}` : e.title)).join(' · ')),
        tile('tasks', '남은 할 일', o.tasks.open ? `${o.tasks.open}개` : '없어요', o.tasks.dueToday ? `오늘까지 ${o.tasks.dueToday}개` : ''),
        tile('routines', '오늘 루틴', o.routines.total ? `${o.routines.total}개 가운데 ${o.routines.done}개 했어요` : '없어요', ''),
        tile('meals', '식사', `${o.meals.count}끼`, ''),
        tile('water', '물', `${o.water.count}잔`, ''),
        tile('exercise', '운동', o.exercise.done ? '했어요' : '아직이에요', ''),
        tile('sleep', '지난밤 수면', sleepText[0], sleepText[1]),
        /* private areas: whether something was written, never what */
        tile('expenses', '생활비', o.private.expenseEntriesThisMonth ? `이번 달 ${o.private.expenseEntriesThisMonth}건 적었어요` : '이번 달 적은 내용 없음', ''),
        tile('journal', '기록', o.private.journalToday ? '오늘 남겼어요' : '오늘 남긴 기록 없음', '')
      )
    );
    clear(weekCard.body);
    if (o.week.empty) weekCard.body.append(el('p', { class: 'og-home-empty', text: '이번 주에 적은 내용이 아직 없어요.' }));
    else {
      weekCard.body.append(
        el(
          'ul',
          { class: 'og-life-days', 'aria-label': '이번 주 요약' },
          [['일정', `${o.week.events}개`], ['루틴을 한 횟수', `${o.week.routinesDone}번`], ['운동한 날', `${o.week.exerciseDays}일`], ['수면을 적은 날', `${o.week.sleepDays}일`]].map(([k, v]) => el('li', {}, el('span', { class: 'og-life-days__date', text: k }), el('span', { text: v })))
        )
      );
    }
    weekCard.body.append(el('p', { class: 'og-home-note', text: '일요일부터 토요일까지, 직접 적은 내용만 셉니다.' }));
  }

  function build() {
    clear(host);
    overviewCards = { today: createCard({ area: 'life', slot: 'overview', title: '오늘', level: 1 }), week: createCard({ area: 'life', slot: 'overview-week', title: '이번 주', level: 3 }) };
    const calendar = createCalendarSection({ schedule: stores.schedule, tasks: stores.tasks, now });
    const tasks = createTasksSection({ tasks: stores.tasks, onChange: () => calendar.render() });
    const routines = createRoutinesSection({ routines: stores.routines });
    daily = createDailyGroup({ dailyLife: stores.dailyLife, sleep: stores.sleep, now, onDateChange: () => healthGroup && healthGroup.render() });
    healthGroup = createHealthGroup({
      ...health,
      now,
      getDate: daily.nav.date,
      onPick: (d) => {
        daily.nav.set(d);
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        daily.nav.node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        const label = daily.nav.node.querySelector('[data-og-daynav="date"]');
        if (label) label.focus();
      },
    });
    sections = {
      overview: { cards: [overviewCards.today, overviewCards.week], render: renderOverview },
      calendar: { cards: [calendar.card], render: calendar.render, api: calendar },
      tasks: { cards: [tasks.card], render: tasks.render, openAdd: tasks.openAdd },
      routines: { cards: routines.cards, render: routines.render },
      /* the four 생활 cards share one date bar, so the group renders as a whole (once, from its first section) */
      meals: { cards: [daily.meals.card], render: daily.render },
      water: { cards: [daily.water.card], render: () => {} },
      exercise: { cards: [daily.exercise.card], render: () => {} },
      sleep: { cards: [daily.sleep.card], render: () => {} },
      expenses: (({ card, render }) => ({ cards: [card], render }))(createExpensesSection({ expenses: stores.expenses, now })),
      journal: (({ card, render }) => ({ cards: [card], render }))(createJournalSection({ journal: stores.journal, now })),
      /* the 건강 cards share the date bar too, so the group renders as a whole from its first section */
      checkin: { cards: [healthGroup.checkin.card], render: healthGroup.render },
      symptoms: { cards: [healthGroup.symptoms.card], render: () => {} },
      medication: { cards: [healthGroup.medication.card, healthGroup.plan.card], render: () => {}, openAdd: healthGroup.plan.openAdd },
      'health-notes': { cards: [healthGroup.notes.card], render: () => {}, openAdd: healthGroup.notes.openAdd },
      /* Completion V1: 건강 수치 — the numbers the user wrote down (present when the app passes the store) */
      measures: healthGroup.measures ? { cards: [healthGroup.measures.card], render: () => {}, openAdd: healthGroup.measures.openAdd } : { cards: [], render: () => {} },
    };
    for (const id of LIFE_SECTIONS) for (const card of sections[id].cards) card.root.dataset.ogLifeSection = id;

    const tablist = el('div', { class: 'og-tabs', role: 'tablist', 'aria-label': '내 생활 영역' });
    for (const group of LIFE_GROUPS) {
      const tab = el('button', { type: 'button', class: 'og-tab', role: 'tab', id: `og-life-tab-${group.id}`, 'aria-controls': `og-life-panel-${group.id}`, 'aria-selected': 'false', tabindex: '-1', 'data-og-life-tab': group.id, text: group.label, onclick: () => { window.location.hash = lifeHash(group.sections[0]); } });
      tabs[group.id] = tab;
      tablist.append(tab);
      const cards = group.sections.flatMap((s) => sections[s].cards.map((c) => c.root));
      panels[group.id] = el('div', { class: 'og-life-panel', role: 'tabpanel', id: `og-life-panel-${group.id}`, 'aria-labelledby': tab.id, tabindex: '-1', hidden: true }, group.id === 'daily' ? [daily.nav.node, ...cards, daily.recent.card.root] : group.id === 'health' ? [healthGroup.intro, el('div', { class: 'og-daynav-slot', 'data-og-daynav-slot': 'health' }), ...cards, healthGroup.history.card.root] : cards);
    }
    /* left / right move between tabs, as tab lists do */
    tablist.addEventListener('keydown', (event) => {
      const order = LIFE_GROUPS.map((g) => g.id);
      const index = order.indexOf(groupOf(current).id);
      let next = -1;
      if (event.key === 'ArrowRight') next = (index + 1) % order.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + order.length) % order.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = order.length - 1;
      if (next < 0) return;
      event.preventDefault();
      window.location.hash = lifeHash(LIFE_GROUPS[next].sections[0]);
      tabs[order[next]].focus();
    });

    host.append(
      el(
        'div',
        { class: 'og-wrap og-life' },
        el('p', { class: 'og-label', lang: 'en', text: 'MY LIFE' }),
        el('h2', { class: 'og-h', id: 'og-life-section-title', tabindex: '-1', text: '내 생활' }),
        el('p', { class: 'og-lead', text: '일정, 할 일, 생활 습관을 스스로 적고 돌아보는 곳입니다.' }),
        tablist,
        LIFE_GROUPS.map((g) => panels[g.id])
      )
    );
    host.dataset.ogRendered = 'true';
  }

  /*
   * show(section): select the tab that holds the section, re-read its data, and (optionally) move to the section.
   * Called on entering 내 생활 and whenever the address changes within it — so anything changed on Home is current here.
   */
  function show(section, { focus = false, entered = false } = {}) {
    current = resolveSection(section) || 'overview';
    /* arriving from another screen starts the 생활 cards on today; moving between tabs keeps the chosen day */
    if (entered) daily.resetDate();
    const group = groupOf(current);
    /* one date bar, shown in whichever dated tab is open */
    if (group.id === 'daily' && daily.nav.node.parentNode !== panels.daily) panels.daily.prepend(daily.nav.node);
    if (group.id === 'health') panels.health.querySelector('[data-og-daynav-slot]').append(daily.nav.node);
    if (DATED_GROUPS.includes(group.id)) daily.nav.render();
    for (const g of LIFE_GROUPS) {
      const on = g.id === group.id;
      tabs[g.id].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[g.id].tabIndex = on ? 0 : -1;
      panels[g.id].hidden = !on;
    }
    /* a status line describes the last action here; after a visit elsewhere it may no longer be true */
    for (const s of group.sections) for (const card of sections[s].cards) card.status.textContent = '';
    for (const s of group.sections) sections[s].render();
    host.dataset.ogLifeSection = current;
    /* a person moving along the tab bar keeps their place on it; anyone arriving another way is taken to the section */
    const active = document.activeElement;
    const onTabs = !!(active && typeof active.closest === 'function' && active.closest('.og-tabs'));
    if (focus && !onTabs) {
      const card = sections[current].cards[0];
      const first = group.sections[0] === current;
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const target = first ? host.querySelector('.og-tabs') : card.root;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      card.focusTitle();
    }
  }

  build();
  show('overview');
  /* open the "add" form of a section that has one (used by Home's "할 일 추가") */
  function openAdd(section) {
    const target = sections[resolveSection(section)];
    if (!target || typeof target.openAdd !== 'function') return false;
    target.openAdd();
    return true;
  }

  return Object.freeze({ show, openAdd, current: () => current, refresh: () => show(current), day: () => daily.date() });
}
