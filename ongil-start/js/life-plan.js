/*
 * My Life — 일정 group: 캘린더 · 할 일 · 루틴.
 *
 * The calendar reads and writes the same CalendarEvent store as Home's "오늘 일정": there is one schedule.
 * Tasks are their own records; a task with a due date is only pointed at from the calendar, never turned into an event.
 */
import { el } from './dom.js';
import { createCard, choiceButton } from './home-ui.js';
import { createListCard } from './home-list.js';
import { LIFE_LIMITS, TASK_PRIORITIES, isHealthEvent, eventKind, eventKindLabel } from './life-contracts.js';
import { dateKey, formatTime, formatDateKey, monthKey, monthGrid, formatMonth, shiftMonth, addDays, weekdayOf, parseDateKey, weekOf, formatWeekRange, WEEKDAY_LABELS } from './dates.js';

const WEEKDAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const today = (now) => dateKey(now());

/* ───────── 캘린더 ───────── */

/* Completion V2: the same calendar shown three ways. Month is the Phase 2B grid; Week and Day read the same stores.
   Nothing new is stored: 월 · 주 · 일 is a way of looking, kept for this visit only. */
export const CALENDAR_VIEWS = Object.freeze([Object.freeze({ id: 'month', label: '월' }), Object.freeze({ id: 'week', label: '주' }), Object.freeze({ id: 'day', label: '일' })]);
const VIEW_WORDS = Object.freeze({ month: '월 보기', week: '주 보기', day: '일 보기' });
const STEP_WORDS = Object.freeze({ month: ['이전 달', '다음 달'], week: ['이전 주', '다음 주'], day: ['이전 날', '다음 날'] });

/* a health event says what it is (병원 일정 · 건강검진) next to its time — a word, not a colour */
const eventMeta = (e) => [e.time ? formatTime(e.time) : '', isHealthEvent(e) ? eventKindLabel(eventKind(e)) : '', e.screeningType || ''].filter(Boolean);

export function createCalendarSection({ schedule, tasks, routines = null, now = () => Date.now() }) {
  const card = createCard({ area: 'life', slot: 'calendar', title: '캘린더', level: 1, lead: '날짜를 고르면 그날 일정이 보입니다. 월 · 주 · 일로 바꿔 볼 수 있어요.' });
  let selected = today(now);
  let month = monthKey(selected);
  let view = 'month';
  const errors = { INVALID_TITLE: '일정 이름을 적어 주세요.', INVALID_TIME: '시간을 다시 골라 주세요.', INVALID_DATE: '날짜를 다시 골라 주세요.', LIMIT: '일정이 너무 많습니다. 지난 일정을 지워 주세요.' };

  const focusIn = (selector) => {
    const node = card.body.querySelector(selector);
    if (node) node.focus();
  };

  function select(key, { focus = false } = {}) {
    selected = key;
    month = monthKey(key);
    list.reset();
    if (focus) focusIn(`[data-og-day="${key}"]`);
    card.say(`${formatDateKey(key)}을 골랐습니다.`);
  }

  function setView(next) {
    if (!VIEW_WORDS[next]) return;
    view = next;
    month = monthKey(selected);
    list.reset();
    focusIn(`[data-og-cal-view="${next}"]`);
    card.say(`${VIEW_WORDS[next]}로 바꿨습니다. ${title()}`);
  }

  function dayLabel(key, events, due) {
    const parts = [formatDateKey(key)];
    if (key === today(now)) parts.push('오늘');
    if (events) parts.push(`일정 ${events}개`);
    if (due) parts.push(`할 일 ${due}개`);
    if (!events && !due) parts.push('일정 없음');
    return parts.join(', ');
  }

  /* arrow keys move day by day and week by week; Page Up / Page Down change the month (week / day: the week) */
  function keys(node) {
    node.addEventListener('keydown', (event) => {
      const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: view === 'week' ? -1 : -7, ArrowDown: view === 'week' ? 1 : 7 };
      let target = null;
      if (event.key in steps) target = addDays(selected, steps[event.key]);
      else if (event.key === 'Home') target = addDays(selected, -weekdayOf(selected));
      else if (event.key === 'End') target = addDays(selected, 6 - weekdayOf(selected));
      else if ((event.key === 'PageUp' || event.key === 'PageDown') && view === 'month') {
        const next = shiftMonth(month, event.key === 'PageUp' ? -1 : 1);
        const day = Math.min(parseDateKey(selected).day, monthGrid(next).flat().filter(Boolean).length);
        target = `${next}-${String(day).padStart(2, '0')}`;
      } else if (event.key === 'PageUp' || event.key === 'PageDown') target = addDays(selected, event.key === 'PageUp' ? -7 : 7);
      if (!target) return;
      event.preventDefault();
      select(target, { focus: true });
    });
    return node;
  }

  function dayButton(key, counts, due, extraClass = '') {
    const isSelected = key === selected;
    return el(
      'button',
      { type: 'button', class: `og-cal__day${extraClass}`, 'data-og-day': key, tabindex: isSelected ? '0' : '-1', 'aria-pressed': isSelected ? 'true' : 'false', 'aria-current': key === today(now) ? 'date' : null, 'aria-label': dayLabel(key, counts, due), onclick: () => select(key, { focus: true }) },
      el('span', { class: 'og-cal__num', text: String(parseDateKey(key).day) }),
      el('span', { class: 'og-cal__mark', 'aria-hidden': 'true', text: counts || due ? '•' : '' })
    );
  }

  function grid() {
    const counts = schedule.countsForMonth(month);
    const due = tasks.dueCountsForMonth(month);
    const table = el(
      'table',
      { class: 'og-cal__grid', role: 'grid', 'aria-label': `${formatMonth(month)} 달력` },
      el('thead', {}, el('tr', {}, WEEKDAY_LABELS.map((w, i) => el('th', { scope: 'col', abbr: WEEKDAY_NAMES[i], text: w })))),
      el(
        'tbody',
        {},
        monthGrid(month).map((week) =>
          el(
            'tr',
            {},
            week.map((key) => {
              if (!key) return el('td', { class: 'og-cal__cell og-cal__cell--empty' });
              return el('td', { class: 'og-cal__cell', role: 'gridcell' }, dayButton(key, counts[key] || 0, due[key] || 0));
            })
          )
        )
      )
    );
    return keys(table);
  }

  /* 주: the seven days of the selected day's week, each with its events and the tasks due that day */
  function week() {
    const days = weekOf(selected);
    return keys(
      el(
        'ol',
        { class: 'og-cal-week', 'aria-label': `${formatWeekRange(days)} 한 주` },
        days.map((key) => {
          const events = schedule.listForDate(key);
          const due = tasks.dueOn(key);
          const routineCount = routines ? routines.listForDate(key).length : 0;
          const lines = [
            ...events.map((e) => el('li', { class: 'og-cal-week__line', 'data-og-cal-kind': eventKind(e) }, [eventMeta(e).join(' · '), e.title].filter(Boolean).join(' '))),
            ...due.map((t) => el('li', { class: 'og-cal-week__line og-cal-week__line--task' }, `할 일 · ${t.time ? `${formatTime(t.time)} ` : ''}${t.title}${t.completed ? ' (끝냄)' : ''}`)),
          ];
          return el(
            'li',
            { class: key === selected ? 'og-cal-week__day is-selected' : 'og-cal-week__day', 'data-og-cal-week-day': key },
            el(
              'button',
              { type: 'button', class: 'og-cal-week__head', 'data-og-day': key, tabindex: key === selected ? '0' : '-1', 'aria-pressed': key === selected ? 'true' : 'false', 'aria-current': key === today(now) ? 'date' : null, 'aria-label': dayLabel(key, events.length, due.length), onclick: () => select(key, { focus: true }) },
              el('span', { class: 'og-cal-week__wd', text: WEEKDAY_LABELS[weekdayOf(key)] }),
              el('span', { class: 'og-cal-week__num', text: String(parseDateKey(key).day) }),
              key === today(now) ? el('span', { class: 'og-cal-week__today', text: '오늘' }) : null,
              key === selected ? el('span', { class: 'og-cal-week__pick', 'aria-hidden': 'true', text: '✓' }) : null
            ),
            lines.length || routineCount
              ? el('ul', { class: 'og-cal-week__lines' }, lines, routineCount ? el('li', { class: 'og-cal-week__line og-cal-week__line--routine' }, `루틴 ${routineCount}개`) : null)
              : el('p', { class: 'og-cal-week__empty', text: '일정 없음' })
          );
        })
      )
    );
  }

  /* 일: what else that day holds — tasks due and the routines set for its weekday (the events are the list below) */
  function day() {
    const due = tasks.dueOn(selected);
    const routineRows = routines ? routines.listForDate(selected) : [];
    const block = (heading, rows, empty) =>
      el('section', { class: 'og-cal-day__block', 'aria-label': heading }, el('h5', { class: 'og-cal-day__title', text: heading }), rows.length ? el('ul', { class: 'og-cal-day__list' }, rows) : el('p', { class: 'og-cal-day__empty', text: empty }));
    return el(
      'div',
      { class: 'og-cal-day', 'data-og-cal-day': selected },
      block('이 날까지 할 일', due.map((t) => el('li', { text: `${t.time ? `${formatTime(t.time)} ` : ''}${t.title}${t.completed ? ' (끝냄)' : ''}` })), '이 날까지 할 일이 없어요.'),
      routines ? block('이 날 루틴', routineRows.map((r) => el('li', { text: [r.time ? formatTime(r.time) : '', r.title, r.completed ? '(했어요)' : ''].filter(Boolean).join(' ') })), '이 날 요일에 해당하는 루틴이 없어요.') : null
    );
  }

  const title = () => (view === 'month' ? formatMonth(month) : view === 'week' ? formatWeekRange(weekOf(selected)) : selected === today(now) ? `${formatDateKey(selected)} (오늘)` : formatDateKey(selected));
  const showsToday = () => (view === 'month' ? month === monthKey(today(now)) && selected === today(now) : view === 'week' ? weekOf(selected).includes(today(now)) && selected === today(now) : selected === today(now));

  function header() {
    const move = (delta) => {
      if (view === 'month') {
        month = shiftMonth(month, delta);
        const days = monthGrid(month).flat().filter(Boolean);
        selected = month === monthKey(today(now)) ? today(now) : days[0];
      } else {
        selected = addDays(selected, view === 'week' ? delta * 7 : delta);
        month = monthKey(selected);
      }
      list.reset();
      card.say(`${title()}을 보고 있습니다.`);
    };
    const [prevWord, nextWord] = STEP_WORDS[view];
    const dueToday = tasks.dueOn(selected).filter((t) => !t.completed);
    const viewId = `og-cal-views-${card.titleId}`;
    return el(
      'div',
      { class: 'og-cal', 'data-og-cal-mode': view },
      el(
        'div',
        { class: 'og-cal__views' },
        el('p', { class: 'visually-hidden', id: viewId, text: '보기 방식' }),
        el(
          'div',
          { class: 'og-picks og-cal__view-picks', role: 'group', 'aria-labelledby': viewId },
          CALENDAR_VIEWS.map((v) => {
            const b = choiceButton({ label: v.label, ariaLabel: VIEW_WORDS[v.id], pressed: view === v.id, onChoose: () => setView(v.id) });
            b.dataset.ogCalView = v.id;
            return b;
          })
        )
      ),
      el(
        'div',
        { class: 'og-cal__nav' },
        el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-cal': 'prev', text: prevWord, onclick: () => { move(-1); focusIn('[data-og-cal="prev"]'); } }),
        el('p', { class: 'og-cal__month', 'aria-live': 'polite', text: title() }),
        el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-cal': 'next', text: nextWord, onclick: () => { move(1); focusIn('[data-og-cal="next"]'); } })
      ),
      showsToday() ? null : el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--text', 'data-og-cal': 'today', text: '오늘로 가기', onclick: () => select(today(now), { focus: true }) })),
      view === 'month' ? grid() : view === 'week' ? week() : null,
      el('h4', { class: 'og-cal__selected', 'data-og-cal-selected': selected, text: selected === today(now) ? `${formatDateKey(selected)} (오늘)` : formatDateKey(selected) }),
      view === 'day' ? day() : dueToday.length ? el('p', { class: 'og-home-note', 'data-og-cal-due': String(dueToday.length), text: `이 날까지 할 일: ${dueToday.map((t) => t.title).join(', ')}` }) : null
    );
  }

  const list = createListCard({
    card,
    config: {
      itemName: '일정',
      listLabel: () => `${formatDateKey(selected)} 일정`,
      emptyText: () => (selected === today(now) ? '오늘 적어 둔 일정이 없어요.' : '이 날 적어 둔 일정이 없어요.'),
      addLabel: '이 날 일정 추가',
      doneWord: '끝냄',
      checkWord: '끝낸 일정으로 표시',
      before: header,
      fields: [
        { name: 'title', label: '일정 이름', type: 'text', required: true, maxlength: LIFE_LIMITS.eventTitle, errors: ['INVALID_TITLE'] },
        { name: 'date', label: '날짜', type: 'date', required: true, initial: () => selected, errors: ['INVALID_DATE'] },
        { name: 'time', label: '시간', type: 'time', required: false, errors: ['INVALID_TIME'] },
      ],
      getItems: () => schedule.listForDate(selected),
      isDone: (item) => item.completed,
      describe: (item) => ({ title: item.title, meta: eventMeta(item) }),
      toggleText: (item, checked) => (checked ? `‘${item.title}’을(를) 끝낸 일정으로 표시했습니다.` : `‘${item.title}’ 표시를 풀었습니다.`),
      onToggle: (item, checked) => schedule.update(item.id, { completed: checked }),
      onAdd: (values) => schedule.add({ title: values.title, date: values.date, time: values.time }),
      /* an edit here changes title, date and time only: a 병원 일정 stays a 병원 일정 and keeps its memo */
      onUpdate: (id, values) => schedule.update(id, { title: values.title, date: values.date, time: values.time }),
      onRemove: (id) => schedule.remove(id),
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  /* Home V2: "일정 추가" on Home opens this very form, for today (the one place events are written) */
  const openAdd = () => {
    select(today(now));
    list.openAdd();
  };
  return { card, render: list.reset, select, selected: () => selected, month: () => month, view: () => view, setView, openAdd };
}

/* ───────── 할 일 ───────── */

export function createTasksSection({ tasks, onChange }) {
  const card = createCard({ area: 'life', slot: 'tasks', title: '할 일', level: 2 });
  let filter = 'all';
  const errors = { INVALID_TITLE: '할 일을 적어 주세요.', INVALID_DATE: '날짜를 다시 골라 주세요.', INVALID_TIME: '시간을 다시 골라 주세요.', INVALID_TIME_WITHOUT_DATE: '시간을 정하려면 ‘언제까지’ 날짜도 골라 주세요.', LIMIT: '할 일이 너무 많습니다. 끝낸 일을 지워 주세요.' };
  const FILTERS = [['all', '전체'], ['open', '할 일'], ['done', '완료']];
  const EMPTY = { all: '적어 둔 할 일이 없어요.', open: '남은 할 일이 없어요.', done: '끝낸 할 일이 없어요.' };

  const list = createListCard({
    card,
    config: {
      itemName: '할 일',
      listLabel: '할 일 목록',
      emptyText: () => EMPTY[filter],
      addLabel: '할 일 추가',
      doneWord: '끝냄',
      checkWord: '끝낸 일로 표시',
      afterChange: onChange,
      before: () => {
        const all = tasks.list();
        const counts = { all: all.length, open: all.filter((t) => !t.completed).length, done: all.filter((t) => t.completed).length };
        return el(
          'div',
          { class: 'og-picks', role: 'group', 'aria-label': '할 일 골라 보기' },
          FILTERS.map(([id, label]) => {
            const b = choiceButton({ label: `${label} ${counts[id]}`, pressed: filter === id, onChoose: () => { filter = id; list.reset(); card.body.querySelector(`[data-og-task-filter="${id}"]`).focus(); } });
            b.dataset.ogTaskFilter = id;
            return b;
          })
        );
      },
      fields: [
        { name: 'title', label: '할 일', type: 'text', required: true, maxlength: LIFE_LIMITS.taskTitle, errors: ['INVALID_TITLE'] },
        { name: 'dueDate', label: '언제까지', type: 'date', required: false, errors: ['INVALID_DATE', 'INVALID_TIME_WITHOUT_DATE'] },
        /* My Life V2: an optional time on that day and a short memo */
        { name: 'time', label: '시간', type: 'time', required: false, errors: ['INVALID_TIME'] },
        { name: 'priority', label: '중요도', type: 'select', required: true, options: TASK_PRIORITIES, initial: 'normal' },
        { name: 'memo', label: '메모', type: 'text', required: false, maxlength: LIFE_LIMITS.memo },
      ],
      getItems: () => tasks.list({ filter }),
      isDone: (item) => item.completed,
      describe: (item) => ({ title: item.title, meta: [item.priority === 'important' ? '중요' : '', item.dueDate ? `${formatDateKey(item.dueDate)}까지` : '', item.time ? formatTime(item.time) : ''].filter(Boolean), text: item.memo }),
      toggleText: (item, checked) => (checked ? `‘${item.title}’을(를) 끝낸 일로 표시했습니다.` : `‘${item.title}’ 표시를 풀었습니다.`),
      onToggle: (item, checked) => tasks.update(item.id, { completed: checked }),
      onAdd: (values) => tasks.add(values),
      onUpdate: (id, values) => tasks.update(id, { title: values.title, dueDate: values.dueDate, time: values.time, memo: values.memo, priority: values.priority }),
      onRemove: (id) => tasks.remove(id),
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  return { card, render: list.reset, openAdd: list.openAdd };
}

/* ───────── 루틴 ───────── */

const DAY_OPTIONS = WEEKDAY_LABELS.map((label, id) => ({ id, label }));
const ACTIVE_OPTIONS = [{ id: 'on', label: '하는 중' }, { id: 'off', label: '쉬는 중' }];
/* My Life V2: example names offered under 루틴 이름. Words only — never created, never counted, nothing is claimed about them. */
export const ROUTINE_EXAMPLES = Object.freeze(['산책', '독서', '물 마시기', '취미', '운동', '전화하기']);
export const describeDays = (days) => (days.length === 7 ? '매일' : days.map((d) => WEEKDAY_LABELS[d]).join(' · '));

export function createRoutinesSection({ routines }) {
  const todayCard = createCard({ area: 'life', slot: 'routine', title: '오늘 루틴', level: 2, lead: '오늘 한 루틴에 표시하세요.' });
  const manageCard = createCard({ area: 'life', slot: 'routine-manage', title: '내 루틴', level: 3, heading: 'h3' });
  const errors = { INVALID_TITLE: '루틴 이름을 적어 주세요.', INVALID_DAYS: '요일을 하나 이상 골라 주세요.', INVALID_TIME: '시간을 다시 골라 주세요.', LIMIT: '루틴이 너무 많습니다.' };

  const todayList = createListCard({
    card: todayCard,
    config: {
      itemName: '루틴',
      listLabel: '오늘 루틴',
      emptyText: () => (routines.count() ? '오늘 요일에 해당하는 루틴이 없어요.' : '만들어 둔 루틴이 없어요. 아래 ‘내 루틴’에서 만들 수 있습니다.'),
      canAdd: false,
      canEdit: false,
      fields: [],
      doneWord: '했어요',
      checkWord: '오늘 한 루틴으로 표시',
      getItems: () => routines.listForDate(),
      isDone: (item) => item.completed,
      describe: (item) => ({ title: item.title, meta: item.time ? [formatTime(item.time)] : [] }),
      toggleText: (item, checked) => (checked ? `‘${item.title}’을(를) 오늘 한 루틴으로 표시했습니다.` : `‘${item.title}’ 표시를 풀었습니다.`),
      onToggle: (item, checked) => routines.setCompleted(item.id, checked),
    },
  });
  const toValues = (v) => ({ title: v.title, daysOfWeek: v.daysOfWeek, time: v.time, active: v.active !== 'off' });
  const manageList = createListCard({
    card: manageCard,
    config: {
      itemName: '루틴',
      listLabel: '내 루틴 목록',
      emptyText: '만들어 둔 루틴이 없어요.',
      addLabel: '루틴 만들기',
      checkable: false,
      afterChange: () => todayList.reset(),
      fields: [
        /* My Life V2: examples are words to tap, not routines — nothing is made until 저장 */
        { name: 'title', label: '루틴 이름', type: 'text', required: true, maxlength: LIFE_LIMITS.routineTitle, errors: ['INVALID_TITLE'], suggestions: ROUTINE_EXAMPLES },
        { name: 'daysOfWeek', label: '요일', type: 'days', required: true, options: DAY_OPTIONS, initial: () => [0, 1, 2, 3, 4, 5, 6], errors: ['INVALID_DAYS'] },
        { name: 'time', label: '시간', type: 'time', required: false, errors: ['INVALID_TIME'] },
        { name: 'active', label: '상태', type: 'select', required: true, options: ACTIVE_OPTIONS, initial: 'on', read: (item) => (item.active ? 'on' : 'off') },
      ],
      getItems: () => routines.list(),
      describe: (item) => ({ title: item.title, meta: [describeDays(item.daysOfWeek), item.time ? formatTime(item.time) : '', item.active ? '' : '쉬는 중'].filter(Boolean) }),
      onAdd: (values) => routines.add(toValues(values)),
      onUpdate: (id, values) => routines.update(id, toValues(values)),
      onRemove: (id) => routines.remove(id),
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  todayList.render();
  manageList.render();
  return { cards: [todayCard, manageCard], render: () => { todayList.reset(); manageList.reset(); } };
}
