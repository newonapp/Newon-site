// ONGIL Phase 2B — My Life screen and integration: route, summary, Home ↔ My Life shared records.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend } from '../../ongil-start/js/storage.js';
import { resolveView, sectionOf, hashFor } from '../../ongil-start/js/router.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { LIFE_SECTIONS, LIFE_GROUPS, groupOf, lifeHash, buildOverview } from '../../ongil-start/js/life-view.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createDailyLifeStore } from '../../ongil-start/js/daily-life.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createSleepStore } from '../../ongil-start/js/sleep.js';
import { createExpenseStore } from '../../ongil-start/js/expenses.js';
import { createJournalStore } from '../../ongil-start/js/journal.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { normalizeDailyLife } from '../../ongil-start/js/life-contracts.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const INDEX = read('index.html');
const LIFE_FILES = ['life-view.js', 'life-plan.js', 'life-daily.js', 'life-records.js'];
const SRC = Object.fromEntries(LIFE_FILES.map((f) => [f, read('js', f)]));
const CODE = LIFE_FILES.map((f) => SRC[f]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

function world(seed) {
  const clock = { t: new Date(2026, 9, 2, 9, 0, 0).getTime() };
  const now = () => (clock.t += 1000);
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  /* "home" and "life" are two sets of store objects over the same storage — exactly how the two screens run */
  const make = () => ({
    schedule: createScheduleStore(storage, { now }),
    dailyLife: createDailyLifeStore(storage, { now }),
    tasks: createTaskStore(storage, { now }),
    routines: createRoutineStore(storage, { now }),
    sleep: createSleepStore(storage, { now }),
    expenses: createExpenseStore(storage, { now }),
    journal: createJournalStore(storage, { now }),
  });
  return { clock, now, backend, storage, home: make(), life: make(), saved: createSavedStore(storage, { now }) };
}

/* ───────── route ───────── */

test('OG-LF-1 My Life route: #life and #life/<section>; nine sections in four tabs', () => {
  assert.equal(resolveView('#life'), 'life');
  for (const s of LIFE_SECTIONS) assert.equal(resolveView(`#life/${s}`), 'life', s);
  assert.deepEqual([sectionOf('#life'), sectionOf('#life/calendar'), sectionOf('#life/journal'), sectionOf('#life/a/b'), sectionOf('#life/<x>'), sectionOf('')], ['', 'calendar', 'journal', '', '', '']);
  assert.equal(hashFor('life'), '#life');
  assert.deepEqual([...LIFE_SECTIONS], ['overview', 'calendar', 'tasks', 'routines', 'meals', 'exercise', 'sleep', 'expenses', 'journal']);
  assert.deepEqual(LIFE_GROUPS.map((g) => [g.label, [...g.sections]]), [['요약', ['overview']], ['일정', ['calendar', 'tasks', 'routines']], ['생활', ['meals', 'exercise', 'sleep']], ['기록', ['expenses', 'journal']]]);
  assert.deepEqual(LIFE_GROUPS.flatMap((g) => g.sections), [...LIFE_SECTIONS], 'every section belongs to exactly one tab');
  assert.deepEqual([groupOf('tasks').id, groupOf('sleep').id, groupOf('journal').id, groupOf('nope').id], ['plan', 'daily', 'records', 'overview']);
  assert.deepEqual([lifeHash('overview'), lifeHash('calendar'), lifeHash('nope'), lifeHash('')], ['#life', '#life/calendar', '#life', '#life']);
  assert.equal(resolveView('#nope/calendar'), null);
  assert.match(INDEX, /slice\(1\)\.split\("\/"\)\[0\]/, 'the pre-paint script understands sections');
  assert.match(INDEX, /<section class="og-band" data-og-modules="life" aria-labelledby="og-life-section-title">/);
  assert.match(SRC['life-view.js'], /id: 'og-life-section-title'/);
  const life = AREAS.find((a) => a.id === 'life');
  assert.ok(life.modules.every((m) => m.available === true));
  assert.match(read('js', 'app.js'), /if \(area\.id === 'home' \|\| area\.id === 'life'\) continue;/);
});

/* ───────── overview ───────── */

test('OG-LF-2 overview with nothing written: zeros and "none", no invented figure', () => {
  const w = world();
  const o = buildOverview(w.life, w.now);
  assert.equal(o.today, '2026-10-02');
  assert.deepEqual(o.events, { total: 0, done: 0, next: [] });
  assert.deepEqual(o.tasks, { open: 0, dueToday: 0 });
  assert.deepEqual(o.routines, { total: 0, done: 0 });
  assert.deepEqual([o.meals.count, o.exercise.done, o.sleep.recorded], [0, false, false]);
  assert.deepEqual(o.private, { expenseEntriesThisMonth: 0, journalToday: false });
  assert.deepEqual(o.week, { events: 0, exerciseDays: 0, sleepDays: 0, routinesDone: 0, empty: true });
  assert.deepEqual(w.storage.list(), [], 'reading the summary writes nothing');
});

test('OG-LF-3 overview reflects what was written; private records give a yes/no and a count only', () => {
  const w = world();
  const e1 = w.life.schedule.add({ title: '병원', time: '14:00' }).event;
  w.life.schedule.add({ title: '산책' });
  w.life.schedule.add({ title: '지난 일요일 모임', date: '2026-09-27' });
  w.life.schedule.add({ title: '다음 주 일정', date: '2026-10-05' });
  w.life.schedule.toggle(e1.id);
  w.life.tasks.add({ title: '오늘까지', dueDate: '2026-10-02' });
  w.life.tasks.add({ title: '언젠가' });
  const done = w.life.tasks.add({ title: '끝낸 일' }).task;
  w.life.tasks.toggle(done.id);
  const r = w.life.routines.add({ title: '스트레칭', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }).routine;
  w.life.routines.add({ title: '주말 등산', daysOfWeek: [6] });
  w.life.routines.setCompleted(r.id, true);
  w.life.routines.setCompleted(r.id, true, '2026-10-01');
  w.life.dailyLife.update({ mealSlots: { breakfast: true, lunch: true }, exercise: true });
  w.life.dailyLife.update({ exercise: true }, '2026-09-30');
  w.life.sleep.save({ bedTime: '23:00', wakeTime: '06:30' });
  w.life.expenses.add({ category: 'food', amount: 987654, memo: '비밀스러운지출메모' });
  w.life.journal.add({ text: '비밀스러운일기본문' });
  const o = buildOverview(w.life, w.now);
  assert.deepEqual([o.events.total, o.events.done, o.events.next.map((e) => e.title)], [2, 1, ['산책']]);
  assert.deepEqual(o.tasks, { open: 2, dueToday: 1 });
  assert.deepEqual(o.routines, { total: 1, done: 1 });
  assert.deepEqual([o.meals.count, o.exercise.done], [2, true]);
  assert.deepEqual(o.sleep, { recorded: true, bedTime: '23:00', wakeTime: '06:30' });
  assert.deepEqual(o.week, { events: 3, exerciseDays: 2, sleepDays: 1, routinesDone: 2, empty: false }, 'Sunday 9/27 … Saturday 10/3');
  assert.deepEqual(o.private, { expenseEntriesThisMonth: 1, journalToday: true });
  const dump = JSON.stringify(o);
  for (const secret of ['987654', '비밀스러운지출메모', '비밀스러운일기본문']) assert.equal(dump.includes(secret), false, secret);
});

/* ───────── Home ↔ My Life ───────── */

test('OG-LF-4 calendar and Home share one schedule: create, update, complete, delete, in both directions', () => {
  const w = world();
  /* Home → My Life */
  const fromHome = w.home.schedule.add({ title: '홈에서 만든 일정', time: '10:00' }).event;
  assert.deepEqual(w.life.schedule.listForDate('2026-10-02').map((e) => e.title), ['홈에서 만든 일정']);
  assert.deepEqual(w.life.schedule.countsForMonth('2026-10'), { '2026-10-02': 1 });
  /* My Life → Home: update, complete */
  w.life.schedule.update(fromHome.id, { title: '내 생활에서 고친 일정', time: '11:30' });
  w.life.schedule.toggle(fromHome.id);
  assert.deepEqual(w.home.schedule.listForDate().map((e) => [e.title, e.time, e.completed]), [['내 생활에서 고친 일정', '11:30', true]]);
  /* My Life: another day is in the calendar, not in Home's "today" */
  const other = w.life.schedule.add({ title: '다음 주 약속', date: '2026-10-09' }).event;
  assert.deepEqual(w.life.schedule.listForDate('2026-10-09').map((e) => e.id), [other.id]);
  assert.equal(w.home.schedule.listForDate().length, 1);
  assert.deepEqual(w.life.schedule.countsForMonth('2026-10'), { '2026-10-02': 1, '2026-10-09': 1 });
  /* moving it to today makes Home show it */
  w.life.schedule.update(other.id, { date: '2026-10-02' });
  assert.equal(w.home.schedule.listForDate().length, 2);
  /* delete from My Life → gone from Home */
  w.life.schedule.remove(fromHome.id);
  assert.deepEqual(w.home.schedule.listForDate().map((e) => e.id), [other.id]);
  assert.deepEqual(w.backend.keys(), ['ongil.v1.events'], 'one collection — there is no second calendar');
  assert.match(SRC['life-plan.js'], /getItems: \(\) => schedule\.listForDate\(selected\)/);
  assert.match(read('js', 'app.js'), /stores: \{ schedule, tasks, routines, dailyLife, sleep, expenses, journal \}/);
});

test('OG-LF-5 meals and exercise are one record for Home and My Life, and Phase 2A records still read', () => {
  const w = world();
  /* Home count → My Life sees the count, without slots */
  w.home.dailyLife.update({ meals: 2 });
  assert.deepEqual([w.life.dailyLife.get().meals, w.life.dailyLife.get().mealSlots], [2, null]);
  /* My Life slots → Home count follows */
  w.life.dailyLife.update({ mealSlots: { breakfast: true } });
  assert.deepEqual([w.home.dailyLife.get().meals, w.home.dailyLife.get().mealSlots], [1, { breakfast: true, lunch: false, dinner: false }]);
  w.life.dailyLife.update({ mealSlots: { dinner: true } });
  assert.equal(w.home.dailyLife.get().meals, 2, 'slots add up');
  /* Home sets the same count → slots are kept; a different count → slots are cleared (the count was said last) */
  w.home.dailyLife.update({ meals: 2 });
  assert.equal(w.life.dailyLife.get().mealSlots.dinner, true);
  w.home.dailyLife.update({ meals: 3 });
  assert.deepEqual([w.life.dailyLife.get().meals, w.life.dailyLife.get().mealSlots], [3, null]);
  /* exercise: Home yes/no ↔ My Life detail */
  w.home.dailyLife.update({ exercise: true });
  assert.equal(w.life.dailyLife.get().exercise, true);
  w.life.dailyLife.update({ exerciseType: 'walk', exerciseMinutes: 30, exerciseMemo: '공원 한 바퀴' });
  assert.deepEqual([w.home.dailyLife.get().exercise, w.home.dailyLife.get().exerciseType, w.home.dailyLife.get().exerciseMinutes], [true, 'walk', 30]);
  w.home.dailyLife.update({ exercise: false });
  const off = w.life.dailyLife.get();
  assert.deepEqual([off.exercise, off.exerciseType, off.exerciseMinutes, off.exerciseMemo], [false, '', null, ''], 'turning exercise off clears its detail');
  w.life.dailyLife.update({ exerciseType: 'yoga' });
  assert.equal(w.home.dailyLife.get().exercise, true, 'naming a type means the user exercised');
  for (const bad of [{ exerciseMinutes: 0 }, { exerciseMinutes: 601 }, { exerciseMinutes: 1.5 }, { exerciseType: 'fly' }, { mealSlots: 'x' }]) assert.equal(w.life.dailyLife.update(bad).ok, false, JSON.stringify(bad));
  assert.equal(w.home.dailyLife.get().water, 0);
  assert.deepEqual(w.backend.keys(), ['ongil.v1.dailyLife']);
  /* a record exactly as Phase 2A wrote it */
  const legacy = normalizeDailyLife({ schemaVersion: 1, date: '2026-09-30', meals: 3, water: 4, exercise: true, updatedAt: 5 });
  assert.deepEqual([legacy.meals, legacy.water, legacy.exercise, legacy.mealSlots, legacy.exerciseType], [3, 4, true, null, '']);
  assert.match(SRC['life-daily.js'], /data-og-meal-legacy/);
});

test('OG-LF-6 tasks are not calendar events and personal records are not saved items', () => {
  const w = world();
  w.life.tasks.add({ title: '기한 있는 할 일', dueDate: '2026-10-02' });
  assert.deepEqual(w.life.schedule.listForDate('2026-10-02'), [], 'a due date does not create an event');
  assert.equal(w.storage.get('events'), null);
  w.life.journal.add({ text: 'x' });
  w.life.expenses.add({ category: 'food', amount: 1 });
  w.life.routines.add({ title: 'r', daysOfWeek: [1] });
  assert.equal(w.saved.count(), 0);
  assert.equal(w.storage.get('saved'), null);
  assert.equal(/saved\.(save|toggle)\(|createSavedStore/.test(CODE), false, 'My Life never writes to Saved');
  assert.match(SRC['life-plan.js'], /이 날까지 할 일: /);
});
