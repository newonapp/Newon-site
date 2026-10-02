/*
 * My Life — 일정 group: 캘린더 · 할 일 · 루틴.
 *
 * The calendar reads and writes the same CalendarEvent store as Home's "오늘 일정": there is one schedule.
 * Tasks are their own records; a task with a due date is only pointed at from the calendar, never turned into an event.
 */
import { el } from './dom.js';
import { createCard, choiceButton } from './home-ui.js';
import { createListCard } from './home-list.js';
import { LIFE_LIMITS, TASK_PRIORITIES } from './life-contracts.js';
import { dateKey, formatTime, formatDateKey, monthKey, monthGrid, formatMonth, shiftMonth, addDays, weekdayOf, parseDateKey, WEEKDAY_LABELS } from './dates.js';

const WEEKDAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const today = (now) => dateKey(now());

/* ───────── 캘린더 ───────── */

export function createCalendarSection({ schedule, tasks, now = () => Date.now() }) {
  const card = createCard({ area: 'life', slot: 'calendar', title: '캘린더', level: 1, lead: '날짜를 고르면 그날 일정이 보입니다.' });
  let selected = today(now);
  let month = monthKey(selected);
  const errors = { INVALID_TITLE: '일정 이름을 적어 주세요.', INVALID_TIME: '시간을 다시 골라 주세요.', INVALID_DATE: '날짜를 다시 골라 주세요.', LIMIT: '일정이 너무 많습니다. 지난 일정을 지워 주세요.' };

  function select(key, { focus = false } = {}) {
    selected = key;
    month = monthKey(key);
    list.reset();
    if (focus) {
      const button = card.body.querySelector(`[data-og-day="${key}"]`);
      if (button) button.focus();
    }
    card.say(`${formatDateKey(key)}을 골랐습니다.`);
  }

  function dayLabel(key, events, due) {
    const parts = [formatDateKey(key)];
    if (key === today(now)) parts.push('오늘');
    if (events) parts.push(`일정 ${events}개`);
    if (due) parts.push(`할 일 ${due}개`);
    return parts.join(', ');
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
              const isSelected = key === selected;
              const has = !!(counts[key] || due[key]);
              return el(
                'td',
                { class: 'og-cal__cell', role: 'gridcell' },
                el(
                  'button',
                  { type: 'button', class: 'og-cal__day', 'data-og-day': key, tabindex: isSelected ? '0' : '-1', 'aria-pressed': isSelected ? 'true' : 'false', 'aria-current': key === today(now) ? 'date' : null, 'aria-label': dayLabel(key, counts[key] || 0, due[key] || 0), onclick: () => select(key, { focus: true }) },
                  el('span', { class: 'og-cal__num', text: String(parseDateKey(key).day) }),
                  el('span', { class: 'og-cal__mark', 'aria-hidden': 'true', text: has ? '•' : '' })
                )
              );
            })
          )
        )
      )
    );
    /* arrow keys move day by day and week by week; Page Up / Page Down change the month */
    table.addEventListener('keydown', (event) => {
      const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      let target = null;
      if (event.key in steps) target = addDays(selected, steps[event.key]);
      else if (event.key === 'Home') target = addDays(selected, -weekdayOf(selected));
      else if (event.key === 'End') target = addDays(selected, 6 - weekdayOf(selected));
      else if (event.key === 'PageUp' || event.key === 'PageDown') {
        const next = shiftMonth(month, event.key === 'PageUp' ? -1 : 1);
        const day = Math.min(parseDateKey(selected).day, monthGrid(next).flat().filter(Boolean).length);
        target = `${next}-${String(day).padStart(2, '0')}`;
      }
      if (!target) return;
      event.preventDefault();
      select(target, { focus: true });
    });
    return table;
  }

  function header() {
    const move = (delta) => {
      month = shiftMonth(month, delta);
      const days = monthGrid(month).flat().filter(Boolean);
      selected = month === monthKey(today(now)) ? today(now) : days[0];
      list.reset();
      card.say(`${formatMonth(month)}을 보고 있습니다.`);
    };
    const dueToday = tasks.dueOn(selected).filter((t) => !t.completed);
    return el(
      'div',
      { class: 'og-cal' },
      el(
        'div',
        { class: 'og-cal__nav' },
        el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-cal': 'prev', text: '이전 달', onclick: () => { move(-1); card.body.querySelector('[data-og-cal="prev"]').focus(); } }),
        el('p', { class: 'og-cal__month', text: formatMonth(month) }),
        el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-cal': 'next', text: '다음 달', onclick: () => { move(1); card.body.querySelector('[data-og-cal="next"]').focus(); } })
      ),
      month === monthKey(today(now)) && selected === today(now) ? null : el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--text', text: '오늘로 가기', onclick: () => select(today(now), { focus: true }) })),
      grid(),
      el('h4', { class: 'og-cal__selected', 'data-og-cal-selected': selected, text: selected === today(now) ? `${formatDateKey(selected)} (오늘)` : formatDateKey(selected) }),
      dueToday.length ? el('p', { class: 'og-home-note', 'data-og-cal-due': String(dueToday.length), text: `이 날까지 할 일: ${dueToday.map((t) => t.title).join(', ')}` }) : null
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
      describe: (item) => ({ title: item.title, meta: item.time ? [formatTime(item.time)] : [] }),
      toggleText: (item, checked) => (checked ? `‘${item.title}’을(를) 끝낸 일정으로 표시했습니다.` : `‘${item.title}’ 표시를 풀었습니다.`),
      onToggle: (item, checked) => schedule.update(item.id, { completed: checked }),
      onAdd: (values) => schedule.add({ title: values.title, date: values.date, time: values.time }),
      onUpdate: (id, values) => schedule.update(id, { title: values.title, date: values.date, time: values.time }),
      onRemove: (id) => schedule.remove(id),
      errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
    },
  });
  list.render();
  return { card, render: list.reset, select, selected: () => selected, month: () => month };
}

/* ───────── 할 일 ───────── */

export function createTasksSection({ tasks, onChange }) {
  const card = createCard({ area: 'life', slot: 'tasks', title: '할 일', level: 2 });
  let filter = 'all';
  const errors = { INVALID_TITLE: '할 일을 적어 주세요.', INVALID_DATE: '날짜를 다시 골라 주세요.', LIMIT: '할 일이 너무 많습니다. 끝낸 일을 지워 주세요.' };
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
        { name: 'dueDate', label: '언제까지', type: 'date', required: false, errors: ['INVALID_DATE'] },
        { name: 'priority', label: '중요도', type: 'select', required: true, options: TASK_PRIORITIES, initial: 'normal' },
      ],
      getItems: () => tasks.list({ filter }),
      isDone: (item) => item.completed,
      describe: (item) => ({ title: item.title, meta: [item.priority === 'important' ? '중요' : '', item.dueDate ? `${formatDateKey(item.dueDate)}까지` : ''].filter(Boolean) }),
      toggleText: (item, checked) => (checked ? `‘${item.title}’을(를) 끝낸 일로 표시했습니다.` : `‘${item.title}’ 표시를 풀었습니다.`),
      onToggle: (item, checked) => tasks.update(item.id, { completed: checked }),
      onAdd: (values) => tasks.add(values),
      onUpdate: (id, values) => tasks.update(id, { title: values.title, dueDate: values.dueDate, priority: values.priority }),
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
        { name: 'title', label: '루틴 이름', type: 'text', required: true, maxlength: LIFE_LIMITS.routineTitle, errors: ['INVALID_TITLE'] },
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
