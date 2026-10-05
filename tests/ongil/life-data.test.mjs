// ONGIL Phase 2B — My Life data: calendar dates, tasks, routines, sleep, expenses, journal.
// Pure ES modules, no DOM and no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, createMemoryBackend } from '../../ongil-start/js/storage.js';
import { dateKey, addDays, weekdayOf, monthKey, isMonthKey, shiftMonth, monthGrid, weekOf, formatMonth, formatDateKey, parseDateKey } from '../../ongil-start/js/dates.js';
import { createTaskStore, TASK_FILTERS } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createSleepStore } from '../../ongil-start/js/sleep.js';
import { createExpenseStore, formatWon } from '../../ongil-start/js/expenses.js';
import { createJournalStore } from '../../ongil-start/js/journal.js';
import { LIFE_LIMITS, parseAmount, journalText } from '../../ongil-start/js/life-contracts.js';

function world(seed, start = new Date(2026, 9, 2, 9, 0, 0)) { // Friday 2026-10-02 09:00 local
  const clock = { t: start.getTime() };
  const now = () => (clock.t += 1000);
  const storage = createStorage({ backend: createMemoryBackend(seed), now });
  let n = 0;
  const ids = (p) => () => `${p}_test${String(++n).padStart(4, '0')}`;
  return {
    clock,
    storage,
    nextDay: (days = 1) => { clock.t += days * 24 * 3600 * 1000; },
    tasks: createTaskStore(storage, { now, makeId: ids('tk') }),
    routines: createRoutineStore(storage, { now, makeId: ids('rt') }),
    sleep: createSleepStore(storage, { now }),
    expenses: createExpenseStore(storage, { now, makeId: ids('ex') }),
    journal: createJournalStore(storage, { now, makeId: ids('jn') }),
  };
}

/* ───────── local dates ───────── */

test('OG-LD-1 month grid, weeks and day arithmetic stay on the local calendar', () => {
  assert.equal(monthKey('2026-10-02'), '2026-10');
  assert.deepEqual([isMonthKey('2026-10'), isMonthKey('2026-13'), isMonthKey('2026-1')], [true, false, false]);
  assert.deepEqual([shiftMonth('2026-10', 1), shiftMonth('2026-12', 1), shiftMonth('2026-01', -1), shiftMonth('2026-10', -12)], ['2026-11', '2027-01', '2025-12', '2025-10']);
  const oct = monthGrid('2026-10');
  assert.equal(oct.every((w) => w.length === 7), true);
  assert.deepEqual(oct[0], [null, null, null, null, '2026-10-01', '2026-10-02', '2026-10-03'], 'October 2026 starts on a Thursday');
  assert.equal(oct.flat().filter(Boolean).length, 31);
  assert.equal(monthGrid('2024-02').flat().filter(Boolean).length, 29);
  assert.equal(monthGrid('2026-02').flat().filter(Boolean).length, 28);
  assert.deepEqual([weekdayOf('2026-10-02'), weekdayOf('2026-10-04')], [5, 0]);
  assert.deepEqual(weekOf('2026-10-02'), ['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03']);
  assert.deepEqual([addDays('2026-10-31', 1), addDays('2026-01-01', -1), addDays('2024-02-28', 1), addDays('2026-10-02', 7)], ['2026-11-01', '2025-12-31', '2024-02-29', '2026-10-09']);
  assert.equal(formatMonth('2026-10'), '2026년 10월');
  assert.match(formatDateKey('2026-10-02'), /10월 2일 금요일/);
  assert.deepEqual(parseDateKey('2026-10-02'), { year: 2026, month: 10, day: 2 });
  assert.equal(parseDateKey('2026-02-30'), null);
});

test('OG-LD-2 the day changes at local midnight: 23:59 and 00:01 are different days, whatever UTC says', () => {
  assert.equal(dateKey(new Date(2026, 9, 2, 23, 59, 59).getTime()), '2026-10-02');
  assert.equal(dateKey(new Date(2026, 9, 3, 0, 0, 1).getTime()), '2026-10-03');
  const late = world(undefined, new Date(2026, 9, 2, 23, 59, 0));
  late.journal.add({ text: '밤에 쓴 글' });
  late.sleep.save({ quality: 'good' });
  assert.equal(late.journal.recent()[0].date, '2026-10-02', 'a late-night entry belongs to the day it was written');
  assert.equal(late.sleep.get('2026-10-02').quality, 'good');
  late.clock.t = new Date(2026, 9, 3, 0, 1, 0).getTime();
  late.journal.add({ text: '자정이 지나고 쓴 글' });
  assert.deepEqual(late.journal.recent().map((e) => e.date), ['2026-10-03', '2026-10-02']);
  assert.equal(late.sleep.get(), null, 'a new day has no sleep record yet');
  const early = world(undefined, new Date(2026, 0, 1, 0, 30, 0));
  early.expenses.add({ category: 'food', amount: 1000 });
  assert.equal(early.expenses.listForMonth('2026-01').length, 1);
  assert.equal(early.expenses.listForMonth('2025-12').length, 0);
});

/* ───────── tasks ───────── */

test('OG-TK-1 task: create, update, complete, delete', () => {
  const { tasks } = world();
  const a = tasks.add({ title: '  약국 들르기 ', dueDate: '2026-10-05', priority: 'important' });
  assert.equal(a.ok, true);
  /* My Life V2: + time, memo (optional, '' when not written) */
  assert.deepEqual(Object.keys(a.task).sort(), ['completed', 'createdAt', 'dueDate', 'id', 'memo', 'priority', 'schemaVersion', 'time', 'title', 'updatedAt']);
  assert.deepEqual([a.task.title, a.task.dueDate, a.task.priority, a.task.completed], ['약국 들르기', '2026-10-05', 'important', false]);
  const plain = tasks.add({ title: '전화하기' }).task;
  assert.deepEqual([plain.dueDate, plain.priority], ['', 'normal']);
  assert.equal(tasks.add({ title: 'x', priority: 'urgent' }).task.priority, 'normal');
  assert.equal(tasks.add({ title: '   ' }).reason, 'INVALID_TITLE');
  assert.equal(tasks.add({ title: 'x', dueDate: '2026-02-30' }).reason, 'INVALID_DATE');
  assert.equal(tasks.add(null).reason, 'INVALID_TITLE');
  const u = tasks.update(a.task.id, { title: '약국 들르기 (처방전)', dueDate: '', id: 'tk_hacked0001', createdAt: 5 });
  assert.deepEqual([u.task.title, u.task.dueDate, u.task.id, u.task.createdAt], ['약국 들르기 (처방전)', '', a.task.id, a.task.createdAt]);
  assert.equal(tasks.toggle(a.task.id).task.completed, true);
  assert.equal(tasks.toggle(a.task.id).task.completed, false);
  assert.equal(tasks.update('tk_missing0001', { title: 'x' }).reason, 'NOT_FOUND');
  assert.equal(tasks.remove(a.task.id).ok, true);
  assert.equal(tasks.remove(a.task.id).reason, 'NOT_FOUND');
  assert.equal(tasks.count(), 2);
});

test('OG-TK-2 task filter (all / open / done), order and due dates', () => {
  const { tasks } = world();
  const a = tasks.add({ title: '보통 일' }).task;
  const b = tasks.add({ title: '중요한 일', priority: 'important' }).task;
  const c = tasks.add({ title: '기한 있는 일', dueDate: '2026-10-03' }).task;
  const d = tasks.add({ title: '끝낸 일' }).task;
  tasks.toggle(d.id);
  assert.deepEqual([...TASK_FILTERS], ['all', 'open', 'done']);
  assert.deepEqual(tasks.list().map((t) => t.title), ['중요한 일', '기한 있는 일', '보통 일', '끝낸 일'], 'open first, important first, dated before undated');
  assert.deepEqual(tasks.list({ filter: 'open' }).map((t) => t.id), [b.id, c.id, a.id]);
  assert.deepEqual(tasks.list({ filter: 'done' }).map((t) => t.id), [d.id]);
  assert.deepEqual(tasks.list({ filter: 'nope' }), []);
  assert.equal(tasks.openCount(), 3);
  assert.deepEqual(tasks.dueOn('2026-10-03').map((t) => t.id), [c.id]);
  assert.deepEqual(tasks.dueCountsForMonth('2026-10'), { '2026-10-03': 1 });
  tasks.toggle(c.id);
  assert.deepEqual(tasks.dueCountsForMonth('2026-10'), {}, 'a finished task no longer marks its day');
});

/* ───────── routines ───────── */

test('OG-RO-1 routine: create, schedule by weekday, update, delete — none exists until the user makes one', () => {
  const { routines } = world();
  assert.deepEqual(routines.list(), []);
  assert.deepEqual(routines.listForDate(), []);
  const walk = routines.add({ title: '아침 산책', daysOfWeek: [1, 3, 5], time: '07:00' });
  assert.equal(walk.ok, true);
  assert.deepEqual(Object.keys(walk.routine).sort(), ['active', 'createdAt', 'daysOfWeek', 'id', 'schemaVersion', 'time', 'title', 'updatedAt']);
  assert.deepEqual([walk.routine.daysOfWeek, walk.routine.active], [[1, 3, 5], true]);
  assert.equal(routines.add({ title: '독서', daysOfWeek: [] }).reason, 'INVALID_DAYS');
  assert.equal(routines.add({ title: '독서', daysOfWeek: [7, 9, 'x'] }).reason, 'INVALID_DAYS');
  assert.equal(routines.add({ title: '', daysOfWeek: [1] }).reason, 'INVALID_TITLE');
  assert.equal(routines.add({ title: '독서', daysOfWeek: [1], time: '25:00' }).reason, 'INVALID_TIME');
  const read = routines.add({ title: '독서', daysOfWeek: [6, 0, 6] }).routine;
  assert.deepEqual(read.daysOfWeek, [0, 6], 'sorted, no duplicates');
  /* 2026-10-02 is a Friday (5) */
  assert.deepEqual(routines.listForDate('2026-10-02').map((r) => r.title), ['아침 산책']);
  assert.deepEqual(routines.listForDate('2026-10-03').map((r) => r.title), ['독서']);
  assert.deepEqual(routines.listForDate('2026-10-06').map((r) => r.title), []);
  routines.update(walk.routine.id, { active: false });
  assert.deepEqual(routines.listForDate('2026-10-02'), [], 'a resting routine is not listed for the day');
  assert.equal(routines.list().length, 2);
  routines.update(walk.routine.id, { active: true, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], title: '산책' });
  assert.deepEqual(routines.listForDate('2026-10-06').map((r) => r.title), ['산책']);
  assert.equal(routines.remove(read.id).ok, true);
  assert.equal(routines.remove(read.id).reason, 'NOT_FOUND');
});

test('OG-RO-2 routine completion is per day and is removed with the routine', () => {
  const w = world();
  const a = w.routines.add({ title: '스트레칭', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }).routine;
  const b = w.routines.add({ title: '물 마시기', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }).routine;
  assert.equal(w.routines.setCompleted(a.id, true).ok, true);
  assert.deepEqual(w.routines.listForDate().map((r) => [r.title, r.completed]), [['스트레칭', true], ['물 마시기', false]]);
  assert.equal(w.routines.setCompleted(a.id, false).ok, true);
  w.routines.setCompleted(a.id, true);
  w.routines.setCompleted(b.id, true);
  assert.equal(w.routines.setCompleted('rt_missing0001', true).reason, 'NOT_FOUND');
  assert.equal(w.routines.setCompleted(a.id, true, 'bad').reason, 'INVALID_DATE');
  w.nextDay();
  assert.deepEqual(w.routines.listForDate().map((r) => r.completed), [false, false], 'a new day starts unmarked');
  assert.equal(w.routines.isCompleted(a.id, '2026-10-02'), true);
  w.routines.remove(a.id);
  assert.deepEqual(Object.keys(w.storage.get('routineLogs').items['2026-10-02']), [b.id]);
});

/* ───────── sleep ───────── */

test('OG-SL-1 sleep: create, update (same date replaces), delete; "how it felt" is a word, not a score', () => {
  const { sleep } = world();
  assert.equal(sleep.get(), null);
  const a = sleep.save({ bedTime: '23:00', wakeTime: '06:30', quality: 'good', memo: '푹 잤다' });
  assert.deepEqual([a.ok, a.replaced, a.sleep.date], [true, false, '2026-10-02']);
  assert.deepEqual(Object.keys(a.sleep).sort(), ['bedTime', 'date', 'memo', 'quality', 'schemaVersion', 'updatedAt', 'wakeTime']);
  const b = sleep.save({ date: '2026-10-02', wakeTime: '07:00', quality: 'okay' });
  assert.deepEqual([b.replaced, sleep.get().bedTime, sleep.get().wakeTime, sleep.get().quality], [true, '', '07:00', 'okay']);
  assert.equal(sleep.save({}).reason, 'EMPTY_RECORD');
  assert.equal(sleep.save({ bedTime: '25:00' }).reason, 'INVALID_BED_TIME');
  assert.equal(sleep.save({ wakeTime: '7시' }).reason, 'INVALID_WAKE_TIME');
  assert.equal(sleep.save({ date: '2026-02-30', quality: 'good' }).reason, 'INVALID_DATE');
  assert.equal(sleep.save({ quality: 'excellent', memo: '' }).reason, 'EMPTY_RECORD', 'an unknown quality is not kept');
  sleep.save({ date: '2026-10-01', quality: 'poor' });
  assert.deepEqual(sleep.recent().map((r) => r.date), ['2026-10-02', '2026-10-01']);
  assert.equal(sleep.remove('2026-10-02').ok, true);
  assert.equal(sleep.remove('2026-10-02').reason, 'NOT_FOUND');
  assert.equal(sleep.get(), null);
  for (const k of ['score', 'hours', 'efficiency', 'stage']) assert.equal(k in a.sleep, false, k);
});

/* ───────── expenses ───────── */

test('OG-EX-1 expense: create, update, delete; amounts are whole won within range', () => {
  const { expenses } = world();
  const a = expenses.add({ category: 'food', amount: '12,000', memo: '시장' });
  assert.equal(a.ok, true);
  assert.deepEqual(Object.keys(a.expense).sort(), ['amount', 'category', 'createdAt', 'date', 'id', 'memo', 'schemaVersion', 'updatedAt']);
  assert.deepEqual([a.expense.amount, a.expense.date, a.expense.category], [12000, '2026-10-02', 'food']);
  for (const bad of ['', '0', '-5', '1.5', '12e3', 'abc', '100000001', '１２３', null, 12.5, NaN]) assert.equal(expenses.add({ category: 'food', amount: bad }).reason, 'INVALID_AMOUNT', String(bad));
  assert.equal(expenses.add({ category: 'gift', amount: 1000 }).reason, 'INVALID_CATEGORY');
  assert.equal(expenses.add({ category: 'food', amount: 1000, date: '2026-13-01' }).reason, 'INVALID_DATE');
  assert.equal(expenses.add({ category: 'living', amount: 100000000 }).ok, true, 'the upper bound itself is allowed');
  const u = expenses.update(a.expense.id, { amount: '15000원', category: 'transport', memo: '' });
  assert.deepEqual([u.expense.amount, u.expense.category, u.expense.memo, u.expense.createdAt], [15000, 'transport', '', a.expense.createdAt]);
  assert.equal(expenses.update(a.expense.id, { amount: 'x' }).reason, 'INVALID_AMOUNT');
  assert.equal(expenses.get(a.expense.id).amount, 15000, 'a refused update changes nothing');
  assert.equal(expenses.remove(a.expense.id).ok, true);
  assert.equal(expenses.remove(a.expense.id).reason, 'NOT_FOUND');
  assert.deepEqual([parseAmount('1,234,567'), parseAmount(' 500 원 '), Number.isNaN(parseAmount('1e5'))], [1234567, 500, true]);
  assert.equal(formatWon(1234567), '1,234,567원');
});

test('OG-EX-2 expense month filter and monthly total', () => {
  const { expenses } = world();
  expenses.add({ category: 'food', amount: 10000, date: '2026-10-01' });
  expenses.add({ category: 'transport', amount: 2500, date: '2026-10-31' });
  expenses.add({ category: 'hobby', amount: 30000, date: '2026-09-30' });
  expenses.add({ category: 'health', amount: 7000, date: '2026-11-01' });
  assert.deepEqual(expenses.listForMonth('2026-10').map((e) => e.amount), [2500, 10000], 'newest first');
  assert.equal(expenses.monthTotal('2026-10'), 12500);
  assert.equal(expenses.monthTotal('2026-09'), 30000);
  assert.equal(expenses.monthTotal('2026-12'), 0);
  assert.equal(expenses.countForMonth('2026-10'), 2);
  assert.deepEqual(expenses.listForMonth('2026-1'), []);
  assert.equal(expenses.monthTotal('nope'), 0);
});

/* ───────── journal ───────── */

test('OG-JN-1 journal: create, update, delete, by date; line breaks are kept, markup stays text', () => {
  const { journal } = world();
  assert.equal(journal.hasEntry(), false);
  const a = journal.add({ text: '  오늘은 날이 좋았다.\r\n\r\n\r\n\r\n오래 걸었다.\u0000 ', mood: 'good' });
  assert.equal(a.ok, true);
  /* My Life V2: + kind (optional, '' when not chosen) */
  assert.deepEqual(Object.keys(a.entry).sort(), ['createdAt', 'date', 'id', 'kind', 'mood', 'schemaVersion', 'text', 'updatedAt']);
  assert.equal(a.entry.text, '오늘은 날이 좋았다.\n\n오래 걸었다.');
  assert.equal(journal.add({ text: '   \n ' }).reason, 'INVALID_TEXT');
  assert.equal(journal.add({ text: 'x', date: 'yesterday' }).reason, 'INVALID_DATE');
  assert.equal(journal.add({ text: 'x', mood: 'ecstatic' }).entry.mood, '');
  const html = journal.add({ text: '<script>alert(1)</script>', date: '2026-10-01' }).entry;
  assert.equal(html.text, '<script>alert(1)</script>', 'kept as text; rendered with textContent');
  assert.equal(journalText('가'.repeat(5000)).length, LIFE_LIMITS.journalText);
  const u = journal.update(a.entry.id, { text: '고친 글', mood: '' });
  assert.deepEqual([u.entry.text, u.entry.mood, u.entry.date, u.entry.createdAt], ['고친 글', '', '2026-10-02', a.entry.createdAt]);
  assert.equal(journal.update(a.entry.id, { text: '' }).reason, 'INVALID_TEXT');
  assert.equal(journal.hasEntry('2026-10-02'), true);
  assert.deepEqual(journal.listForDate('2026-10-01').map((e) => e.id), [html.id]);
  assert.equal(journal.recent()[0].date, '2026-10-02');
  assert.equal(journal.remove(html.id).ok, true);
  assert.equal(journal.remove(html.id).reason, 'NOT_FOUND');
  assert.equal(journal.hasEntry('2026-10-01'), false);
});

/* ───────── damaged storage ───────── */

test('OG-LS-1 damaged values in any My Life collection are skipped; the stores keep working', () => {
  const w = world({ 'ongil.v1.tasks': '{broken', 'ongil.v1.routines': '{"items":[{"id":"x"},7,null,{"id":"rt_ok0000001","title":"남은 루틴","daysOfWeek":[1]}]}', 'ongil.v1.routineLogs': '"x"', 'ongil.v1.sleepRecords': '{"items":{"2026-10-02":{"bedTime":"99:99"},"nope":{}}}', 'ongil.v1.expenses': '{"items":[{"id":"ex_ok0000001","date":"2026-10-02","category":"food","amount":"lots"}]}', 'ongil.v1.journal': '[]' });
  assert.deepEqual(w.tasks.list(), []);
  assert.deepEqual(w.routines.list().map((r) => r.title), ['남은 루틴']);
  assert.equal(w.sleep.get(), null);
  assert.deepEqual(w.sleep.recent(), []);
  assert.deepEqual(w.expenses.listForMonth('2026-10'), []);
  assert.equal(w.expenses.monthTotal('2026-10'), 0);
  assert.deepEqual(w.journal.recent(), []);
  assert.equal(w.tasks.add({ title: '새 할 일' }).ok, true);
  assert.equal(w.expenses.add({ category: 'food', amount: 100 }).ok, true);
  assert.equal(w.journal.add({ text: '새 글' }).ok, true);
  assert.equal(w.sleep.save({ quality: 'good' }).ok, true);
});
