// ONGIL Phase 2C — Home + My Life as one set of records: tasks, routines, water, past-day meals and exercise,
// the local-date model, damaged storage, erase-all.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createDailyLifeStore } from '../../ongil-start/js/daily-life.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createSleepStore } from '../../ongil-start/js/sleep.js';
import { createExpenseStore } from '../../ongil-start/js/expenses.js';
import { createJournalStore } from '../../ongil-start/js/journal.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createProfileStore } from '../../ongil-start/js/profile.js';
import { createOnboarding } from '../../ongil-start/js/onboarding.js';
import { createNotificationCenter } from '../../ongil-start/js/notifications.js';
import { buildHomeSummary } from '../../ongil-start/js/home-view.js';
import { buildOverview } from '../../ongil-start/js/life-view.js';
import { dayState, clampDay, dayWord, describeDay, DAILY_BACK_DAYS } from '../../ongil-start/js/life-daily.js';
import { dateKey, isDateKey, addDays, weekdayOf, weekOf, monthGrid, shiftMonth, monthKey, formatDateKey } from '../../ongil-start/js/dates.js';

/* Friday 2 October 2026, 09:00 local. "home" and "life" are two sets of store objects over ONE storage — how the two screens run. */
function world(seed, start = new Date(2026, 9, 2, 9, 0, 0)) {
  const clock = { t: start.getTime() };
  const now = () => (clock.t += 1000);
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  const make = () => ({
    schedule: createScheduleStore(storage, { now }),
    dailyLife: createDailyLifeStore(storage, { now }),
    medication: createMedicationStore(storage, { now }),
    checkIn: createCheckInStore(storage, { now }),
    tasks: createTaskStore(storage, { now }),
    routines: createRoutineStore(storage, { now }),
    sleep: createSleepStore(storage, { now }),
    expenses: createExpenseStore(storage, { now }),
    journal: createJournalStore(storage, { now }),
  });
  return { clock, now, backend, storage, home: make(), life: make(), saved: createSavedStore(storage, { now }), profile: createProfileStore(storage, { now }) };
}
const TODAY = '2026-10-02';
const titles = (items) => items.map((i) => i.title);

/* ───────── tasks ───────── */

test('OG-IN-1 Home task display: tasks due today come from My Life\'s task store; other tasks are only counted', () => {
  const w = world();
  assert.deepEqual(w.home.tasks.dueOn(TODAY), [], 'no task is invented');
  w.life.tasks.add({ title: '오늘 은행', dueDate: TODAY });
  w.life.tasks.add({ title: '오늘 중요한 일', dueDate: TODAY, priority: 'important' });
  w.life.tasks.add({ title: '내일 할 일', dueDate: '2026-10-03' });
  w.life.tasks.add({ title: '어제까지였던 일', dueDate: '2026-10-01' });
  w.life.tasks.add({ title: '기한 없는 일' });
  assert.deepEqual(titles(w.home.tasks.dueOn(TODAY)), ['오늘 중요한 일', '오늘 은행'], 'only today, important first');
  const others = w.home.tasks.list({ filter: 'open' }).filter((t) => t.dueDate !== TODAY);
  assert.equal(others.length, 3, 'the rest is a number on Home, not a second task list');
  assert.deepEqual(buildHomeSummary(w.home, w.now).tasks, { total: 2, left: 2 });
  assert.equal(w.storage.list().join(), 'tasks', 'Home keeps no task storage of its own');
});

test('OG-IN-2 Home task complete and cross-view sync: complete, edit, delete — both directions', () => {
  const w = world();
  const t = w.life.tasks.add({ title: '약국 들르기', dueDate: TODAY }).task;
  assert.equal(w.home.tasks.update(t.id, { completed: true }).ok, true, 'Home marks it done');
  assert.equal(w.life.tasks.get(t.id).completed, true, 'My Life shows it done');
  assert.deepEqual(titles(w.life.tasks.list({ filter: 'done' })), ['약국 들르기']);
  assert.deepEqual(buildHomeSummary(w.home, w.now).tasks, { total: 1, left: 0 });
  w.life.tasks.update(t.id, { completed: false, title: '약국과 우체국' });
  assert.deepEqual([w.home.tasks.dueOn(TODAY)[0].title, w.home.tasks.dueOn(TODAY)[0].completed], ['약국과 우체국', false], 'an edit in My Life is what Home shows');
  w.life.tasks.update(t.id, { dueDate: '2026-10-05' });
  assert.deepEqual(w.home.tasks.dueOn(TODAY), [], 'moved to another day: gone from today');
  w.life.tasks.update(t.id, { dueDate: TODAY });
  w.life.tasks.remove(t.id);
  assert.deepEqual(w.home.tasks.dueOn(TODAY), [], 'deleted in My Life: gone from Home');
  const again = world(Object.fromEntries(w.backend.keys().map((k) => [k, w.backend.getItem(k)])));
  assert.equal(again.home.tasks.count(), 0, 'and it stays gone after a reload');
});

/* ───────── routines ───────── */

test('OG-IN-3 Home routine display: active routines of today\'s weekday only', () => {
  const w = world();
  assert.equal(weekdayOf(TODAY), 5, 'Friday');
  w.life.routines.add({ title: '매일 스트레칭', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], time: '07:30' });
  w.life.routines.add({ title: '금요일 장보기', daysOfWeek: [5] });
  w.life.routines.add({ title: '월요일 수영', daysOfWeek: [1] });
  w.life.routines.add({ title: '쉬는 중인 루틴', daysOfWeek: [5], active: false });
  assert.deepEqual(titles(w.home.routines.listForDate()), ['매일 스트레칭', '금요일 장보기'], 'timed first, other weekday and paused routines left out');
  assert.deepEqual(titles(w.home.routines.listForDate('2026-10-05')), ['매일 스트레칭', '월요일 수영']);
  assert.deepEqual(buildHomeSummary(w.home, w.now).routines, { total: 2, left: 2 });
});

test('OG-IN-4 Home routine complete and cross-view sync: the same log, per day', () => {
  const w = world();
  const r = w.life.routines.add({ title: '산책', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }).routine;
  w.life.routines.setCompleted(r.id, true, '2026-10-01');
  assert.equal(w.home.routines.listForDate()[0].completed, false, 'yesterday\'s mark is not today\'s');
  assert.equal(w.home.routines.setCompleted(r.id, true).ok, true, 'Home marks today');
  assert.equal(w.life.routines.listForDate()[0].completed, true, 'My Life shows it at once');
  assert.deepEqual(buildHomeSummary(w.home, w.now).routines, { total: 1, left: 0 });
  w.life.routines.setCompleted(r.id, false);
  assert.equal(w.home.routines.listForDate()[0].completed, false, 'unmarked in My Life: unmarked on Home');
  assert.equal(w.home.routines.isCompleted(r.id, '2026-10-01'), true, 'other days are untouched');
  w.life.routines.update(r.id, { active: false });
  assert.deepEqual(w.home.routines.listForDate(), [], 'a paused routine leaves Home');
  assert.deepEqual(w.storage.list().sort(), ['routineLogs', 'routines']);
});

/* ───────── water ───────── */

test('OG-IN-5 water: one count per day in dailyLife, read and changed from either screen', () => {
  const w = world();
  assert.equal(w.life.dailyLife.get().water, 0);
  w.home.dailyLife.update({ water: 3 });
  assert.equal(w.life.dailyLife.get(TODAY).water, 3, 'My Life reads Home\'s count');
  w.life.dailyLife.update({ water: 5 }, TODAY);
  assert.equal(w.home.dailyLife.get().water, 5, 'Home reads My Life\'s count');
  w.life.dailyLife.update({ water: 2 }, '2026-09-30');
  assert.deepEqual([w.home.dailyLife.get().water, w.life.dailyLife.get('2026-09-30').water], [5, 2], 'a past day has its own count');
  for (const bad of [-1, 21, 1.5, '3', null]) assert.equal(w.life.dailyLife.update({ water: bad }, TODAY).ok, false, String(bad));
  assert.equal(w.home.dailyLife.get().water, 5, 'a refused value changes nothing');
  assert.equal(buildOverview(w.life, w.now).water.count, 5);
  assert.deepEqual(w.storage.list(), ['dailyLife'], 'no separate water collection');
  assert.equal(COLLECTIONS.some((c) => /water/i.test(c)), false);
});

/* ───────── past days ───────── */

test('OG-IN-6 a past day\'s meals can be corrected, and today is not changed by it', () => {
  const w = world();
  w.home.dailyLife.update({ meals: 2, water: 4, exercise: true });
  const before = w.home.dailyLife.get();
  assert.equal(w.life.dailyLife.update({ mealSlots: { breakfast: true, dinner: true } }, '2026-09-29').ok, true);
  assert.deepEqual([w.life.dailyLife.get('2026-09-29').meals, w.life.dailyLife.get('2026-09-29').mealSlots], [2, { breakfast: true, lunch: false, dinner: true }]);
  w.life.dailyLife.update({ mealSlots: { dinner: false } }, '2026-09-29');
  assert.equal(w.life.dailyLife.get('2026-09-29').meals, 1);
  const after = w.home.dailyLife.get();
  assert.deepEqual([after.meals, after.mealSlots, after.water, after.exercise], [before.meals, before.mealSlots, before.water, before.exercise], 'today is exactly as it was');
  assert.equal(w.home.dailyLife.get('2026-09-28').meals, 0, 'neighbouring days are untouched');
  /* a Phase 2A record (count only) on a past day still reads, and choosing slots replaces the count */
  const old = world({ [`${KEY_PREFIX}dailyLife`]: JSON.stringify({ schemaVersion: 1, items: { '2026-09-20': { date: '2026-09-20', meals: 3, water: 1, exercise: false, updatedAt: 5 } } }) });
  assert.deepEqual([old.life.dailyLife.get('2026-09-20').meals, old.life.dailyLife.get('2026-09-20').mealSlots], [3, null]);
  old.life.dailyLife.update({ mealSlots: { lunch: true } }, '2026-09-20');
  assert.deepEqual([old.life.dailyLife.get('2026-09-20').meals, old.life.dailyLife.get('2026-09-20').water], [1, 1]);
  assert.equal(w.life.dailyLife.update({ meals: 1 }, '2026-13-01').ok, false, 'an impossible date is refused');
});

test('OG-IN-7 a past day\'s exercise can be corrected, and today is not changed by it', () => {
  const w = world();
  w.home.dailyLife.update({ exercise: false });
  assert.equal(w.life.dailyLife.update({ exercise: true, exerciseType: 'walk', exerciseMinutes: 40, exerciseMemo: '공원' }, '2026-09-30').ok, true);
  const past = w.life.dailyLife.get('2026-09-30');
  assert.deepEqual([past.exercise, past.exerciseType, past.exerciseMinutes, past.exerciseMemo], [true, 'walk', 40, '공원']);
  const today = w.home.dailyLife.get();
  assert.deepEqual([today.exercise, today.exerciseType, today.exerciseMinutes, today.exerciseMemo], [false, '', null, ''], 'Home (today) is unchanged');
  w.life.dailyLife.update({ exercise: false }, '2026-09-30');
  const off = w.life.dailyLife.get('2026-09-30');
  assert.deepEqual([off.exercise, off.exerciseType, off.exerciseMinutes, off.exerciseMemo], [false, '', null, ''], 'turning it off clears that day\'s detail');
  assert.equal(w.life.dailyLife.update({ exerciseMinutes: 601 }, '2026-09-30').ok, false);
  assert.equal(buildOverview(w.life, w.now).exercise.done, false, 'the summary speaks of today only');
});

test('OG-IN-8 the "recent days" line says what was written and nothing else', () => {
  const w = world();
  w.life.dailyLife.update({ mealSlots: { breakfast: true, lunch: true }, water: 3, exercise: true }, '2026-10-01');
  w.life.sleep.save({ date: '2026-10-01', quality: 'good' });
  w.life.dailyLife.update({ water: 0 }, '2026-09-30');
  const recorded = new Set(w.life.dailyLife.recordedDates());
  assert.deepEqual(describeDay(w.life, '2026-10-01', recorded), ['식사 2끼 (아침 · 점심)', '물 3잔', '운동 했어요', '수면 적음']);
  assert.deepEqual(describeDay(w.life, '2026-09-30', recorded), [], 'a day with only zeros has nothing to say');
  assert.deepEqual(describeDay(w.life, '2026-09-29', recorded), []);
});

/* ───────── Home summary ───────── */

// Phase 3: once anything for today is written, the summary also says whether today's check-in was written ("오늘 안부").
// It is a fact (written / not yet), never a judgement of how the user is. An untouched Home still has no summary (first assert, unchanged).
test('OG-IN-9 Home summary: counts of what is left, only for what exists — no score, no rating', () => {
  const w = world();
  const empty = buildHomeSummary(w.home, w.now);
  assert.deepEqual([empty.empty, empty.items], [true, []], 'nothing written: no summary at all');
  w.life.schedule.add({ title: '병원', time: '14:00' });
  const partial = buildHomeSummary(w.home, w.now);
  assert.deepEqual(partial.items.map((i) => [i.id, i.label, i.text]), [['events', '일정', '1개 남음'], ['checkin', '오늘 안부', '아직 남기지 않았어요']], 'a kind with nothing written is left out');
  const t = w.life.tasks.add({ title: '세탁', dueDate: TODAY }).task;
  const r = w.life.routines.add({ title: '산책', daysOfWeek: [5] }).routine;
  const m = w.home.medication.add({ name: '아침 약' }).medication;
  w.home.tasks.update(t.id, { completed: true });
  w.home.routines.setCompleted(r.id, true);
  w.home.medication.setTaken(m.id, true);
  const full = buildHomeSummary(w.home, w.now);
  assert.deepEqual(full.items.map((i) => [i.id, i.text]), [['events', '1개 남음'], ['tasks', '모두 끝냈어요'], ['routines', '모두 했어요'], ['medication', '모두 먹었어요'], ['checkin', '아직 남기지 않았어요']]);
  assert.equal(/score|grade|percent|점|%|좋음|양호/i.test(JSON.stringify(full)), false, 'counts only');
  assert.equal(JSON.stringify(full).includes('병원'), false, 'the summary carries numbers, not what the user wrote');
});

/* ───────── local date model ───────── */

const ZONES = ['Asia/Seoul', 'America/Los_Angeles', 'Pacific/Kiritimati', 'Pacific/Pago_Pago', 'Europe/London', 'UTC'];
function inZone(zone, fn) {
  const before = process.env.TZ;
  process.env.TZ = zone;
  try {
    fn();
  } finally {
    if (before === undefined) delete process.env.TZ;
    else process.env.TZ = before;
  }
}

test('OG-IN-10 local date at midnight: 23:59:59 and 00:00:00 are different days in every time zone', () => {
  for (const zone of ZONES) {
    inZone(zone, () => {
      const late = new Date(2026, 9, 2, 23, 59, 59);
      assert.equal(dateKey(late.getTime()), '2026-10-02', zone);
      assert.equal(dateKey(late.getTime() + 1000), '2026-10-03', `${zone} — one second later is the next day`);
      assert.equal(dateKey(new Date(2026, 9, 3, 0, 0, 0).getTime()), '2026-10-03', zone);
      /* a day-only value never passes through UTC: the key read back is the key written */
      /* the test clock moves a second on every read, so the store part starts a few minutes before midnight */
      const w = world(undefined, new Date(2026, 9, 2, 23, 50, 0));
      w.home.dailyLife.update({ water: 1 });
      assert.deepEqual(w.home.dailyLife.recordedDates(), ['2026-10-02'], zone);
      w.clock.t = new Date(2026, 9, 3, 0, 0, 0).getTime();
      assert.equal(w.home.dailyLife.get().water, 0, `${zone} — the new day starts empty`);
      assert.equal(w.home.dailyLife.get('2026-10-02').water, 1, `${zone} — yesterday keeps its record`);
      const t = w.life.tasks.add({ title: '자정 뒤 할 일', dueDate: '2026-10-03' }).task;
      assert.deepEqual(titles(w.home.tasks.dueOn(dateKey(w.now()))), [t.title], zone);
      assert.equal(formatDateKey('2026-10-03').includes('3일'), true, `${zone} — a day key is shown as that day`);
    });
  }
});

test('OG-IN-11 month end, year end and leap day: day arithmetic never slips, in every time zone', () => {
  for (const zone of ZONES) {
    inZone(zone, () => {
      assert.equal(addDays('2026-10-31', 1), '2026-11-01', `${zone} month end`);
      assert.equal(addDays('2026-11-01', -1), '2026-10-31', zone);
      assert.equal(addDays('2026-04-30', 1), '2026-05-01', zone);
      assert.equal(addDays('2026-12-31', 1), '2027-01-01', `${zone} year end`);
      assert.equal(addDays('2027-01-01', -1), '2026-12-31', zone);
      assert.equal(shiftMonth('2026-12', 1), '2027-01', zone);
      assert.equal(shiftMonth('2027-01', -1), '2026-12', zone);
      assert.deepEqual(weekOf('2026-12-31'), ['2026-12-27', '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02'], `${zone} a week across the year end`);
      assert.equal(addDays('2028-02-28', 1), '2028-02-29', `${zone} leap day`);
      assert.equal(addDays('2028-02-29', 1), '2028-03-01', zone);
      assert.equal(addDays('2028-03-01', -1), '2028-02-29', zone);
      assert.equal(addDays('2026-02-28', 1), '2026-03-01', `${zone} not a leap year`);
      assert.deepEqual([isDateKey('2028-02-29'), isDateKey('2026-02-29'), isDateKey('2026-02-30'), isDateKey('2026-04-31'), isDateKey('2026-12-32'), isDateKey('2026-00-10')], [true, false, false, false, false, false], zone);
      assert.equal(monthGrid('2028-02').flat().filter(Boolean).length, 29, zone);
      assert.equal(monthGrid('2026-02').flat().filter(Boolean).length, 28, zone);
      assert.equal(monthKey('2028-02-29'), '2028-02', zone);
      /* daylight-saving changes (US: 8 March and 1 November 2026) must not repeat or skip a day */
      assert.equal(addDays('2026-03-07', 1), '2026-03-08', zone);
      assert.equal(addDays('2026-03-08', 1), '2026-03-09', zone);
      assert.equal(addDays('2026-11-01', 1), '2026-11-02', zone);
      let k = '2026-01-01';
      const seen = new Set();
      for (let i = 0; i < 800; i++) {
        seen.add(k);
        const next = addDays(k, 1);
        assert.ok(next > k && isDateKey(next), `${zone} ${k} → ${next}`);
        assert.equal(addDays(next, -1), k, `${zone} back from ${next}`);
        k = next;
      }
      assert.equal(seen.size, 800, `${zone} — 800 different days in a row`);
      assert.equal(k, '2028-03-11', zone);
      /* records on those days */
      const w = world(undefined, new Date(2028, 1, 29, 12, 0, 0));
      w.life.dailyLife.update({ meals: 2 });
      w.life.dailyLife.update({ meals: 1 }, '2028-02-28');
      w.life.schedule.add({ title: '윤일 일정' });
      assert.deepEqual(w.home.dailyLife.recordedDates(), ['2028-02-29', '2028-02-28'], zone);
      assert.equal(w.home.schedule.listForDate('2028-02-29').length, 1, zone);
      assert.equal(w.life.dailyLife.update({ meals: 1 }, '2027-02-29').ok, false, `${zone} — 29 February of a common year is refused`);
    });
  }
});

test('OG-IN-12 the date bar: today, past, never the future, never older than what is kept', () => {
  assert.deepEqual([dayState(TODAY, TODAY), dayState('2026-10-01', TODAY), dayState('2026-10-03', TODAY), dayState('2025-12-31', TODAY), dayState('2027-01-01', TODAY)], ['today', 'past', 'future', 'past', 'future']);
  assert.equal(DAILY_BACK_DAYS, 365);
  assert.equal(clampDay('2026-10-03', TODAY), TODAY, 'tomorrow is not a day to record');
  assert.equal(clampDay('2030-01-01', TODAY), TODAY);
  assert.equal(clampDay('2026-09-01', TODAY), '2026-09-01');
  assert.equal(clampDay('2025-10-02', TODAY), '2025-10-02', 'the oldest day that is still kept');
  assert.equal(clampDay('2025-10-01', TODAY), '2025-10-02', 'older than the kept window: the oldest kept day');
  for (const junk of ['', 'today', '2026-02-30', null, undefined, 20261002, '2026-10-2']) assert.equal(clampDay(junk, TODAY), TODAY, String(junk));
  assert.deepEqual([dayWord(TODAY, TODAY), dayWord('2026-10-01', TODAY)], ['오늘', formatDateKey('2026-10-01')]);
  /* a record written on the oldest reachable day survives the pruning that keeps a year of days */
  const w = world();
  for (let i = 0; i < 366; i++) w.life.dailyLife.update({ water: 1 }, addDays(TODAY, -i));
  assert.equal(w.life.dailyLife.get(addDays(TODAY, -DAILY_BACK_DAYS)).water, 1);
  assert.equal(w.life.dailyLife.recordedDates().length, 366);
});

/* ───────── damaged storage ───────── */

test('OG-IN-13 corrupted storage: every collection, every kind of damage — nothing throws, nothing else is erased', () => {
  const damage = ['{not json', '', 'null', '42', '"text"', '[]', '[1,2,3]', '{}', '{"items":null}', '{"items":"x"}', '{"items":[null,1,"a",{},{"id":5},{"id":"tk_abcdef1","title":"","dueDate":"2026-02-30","amount":-5,"date":"nope","time":"99:99","daysOfWeek":"x"}]}', '{"items":{"2026-13-45":{"meals":99,"water":-3,"exercise":"yes"},"bad":7,"2026-10-02":"x"}}', '{"schemaVersion":999,"items":{"__proto__":{"polluted":true}},"extra":{"deep":[1,{"a":null}]}}'];
  for (const bad of damage) {
    const w = world(Object.fromEntries(COLLECTIONS.map((c) => [`${KEY_PREFIX}${c}`, bad])));
    const onboarding = createOnboarding({ storage: w.storage, profile: w.profile });
    const notifications = createNotificationCenter({ storage: w.storage, profile: w.profile });
    assert.doesNotThrow(() => {
      for (const s of [w.home, w.life]) {
        s.schedule.listForDate();
        s.schedule.countsForMonth('2026-10');
        s.tasks.list();
        s.tasks.dueOn(TODAY);
        s.tasks.openCount();
        s.routines.list();
        s.routines.listForDate();
        s.dailyLife.get();
        s.dailyLife.get('2026-09-30');
        s.dailyLife.recordedDates();
        s.sleep.get();
        s.sleep.recent();
        s.expenses.listForMonth('2026-10');
        s.expenses.monthTotal('2026-10');
        s.journal.recent();
        s.medication.listForDate();
        s.checkIn.get();
      }
      w.saved.list();
      w.profile.getProfile();
      w.profile.getPreferences();
      onboarding.state();
      notifications.list();
      buildHomeSummary(w.home, w.now);
      buildOverview(w.life, w.now);
      describeDay(w.life, TODAY, new Set(w.life.dailyLife.recordedDates()));
    }, bad);
    assert.equal({}.polluted, undefined, 'a damaged value cannot reach Object.prototype');
    const o = buildOverview(w.life, w.now);
    assert.deepEqual([o.events.total, o.tasks.open, o.routines.total, o.meals.count, o.water.count], [0, 0, 0, 0, 0], `${bad} reads as "nothing written"`);
    assert.equal(buildHomeSummary(w.home, w.now).empty, true, bad);
    /* reading never repairs by deleting: the other fifteen values are still exactly what they were */
    assert.equal(w.life.tasks.add({ title: '다시 적은 할 일', dueDate: TODAY }).ok, true, `${bad} — the store works again on the next write`);
    assert.deepEqual(titles(w.home.tasks.dueOn(TODAY)), ['다시 적은 할 일']);
    for (const c of COLLECTIONS) if (c !== 'tasks') assert.equal(w.backend.getItem(`${KEY_PREFIX}${c}`), bad, `${c} was left as it was`);
  }
  /* one bad entry among good ones is skipped; the good ones stay */
  const mixed = world({ [`${KEY_PREFIX}tasks`]: JSON.stringify({ schemaVersion: 1, items: [{ id: 'tk_good0001', title: '남는 일', dueDate: TODAY, priority: 'normal', completed: false, createdAt: 1, updatedAt: 1, unknownField: 'x' }, { id: 'tk_bad00001', title: '날짜가 틀린 일', dueDate: '2026-02-31' }, 'junk'] }) });
  assert.deepEqual(titles(mixed.home.tasks.dueOn(TODAY)), ['남는 일']);
  assert.equal('unknownField' in mixed.home.tasks.dueOn(TODAY)[0], false, 'unknown fields are not carried along');
});

/* ───────── erase ───────── */

// Phase 3: two health collections were added (symptoms, healthNotes), so "all sixteen" became "all eighteen".
// Phase 4: two more (familySharing, helpRequests) → "all twenty". The check is unchanged:
// every ONGIL collection holds something before, nothing after, and every foreign key survives.
test('OG-IN-14 erase: all twenty ONGIL collections go, everything else on the device stays, and both screens read empty', () => {
  const foreign = { 'livon.mlStore.v1': '{"keep":true}', 'newon-app-theme': 'dark', 'ongil-unrelated': 'x', 'ongil.v2.future': 'y', 'ongil.v1': 'z', 'newon.ongil.v1.tasks': 'w' };
  const w = world(foreign);
  const onboarding = createOnboarding({ storage: w.storage, profile: w.profile });
  const notifications = createNotificationCenter({ storage: w.storage, profile: w.profile });
  for (const c of COLLECTIONS) w.backend.setItem(`${KEY_PREFIX}${c}`, '{"items":[]}');
  w.life.tasks.add({ title: '할 일', dueDate: TODAY });
  const r = w.life.routines.add({ title: '루틴', daysOfWeek: [5] }).routine;
  w.home.routines.setCompleted(r.id, true);
  w.home.dailyLife.update({ meals: 2, water: 3, exercise: true });
  w.life.dailyLife.update({ water: 1 }, '2026-09-30');
  w.home.schedule.add({ title: '일정' });
  w.home.checkIn.set('good');
  w.life.journal.add({ text: '기록' });
  w.life.expenses.add({ category: 'food', amount: 1000 });
  w.life.sleep.save({ quality: 'good' });
  w.profile.updateProfile({ nickname: '온길' });
  assert.equal(COLLECTIONS.length, 20);
  assert.deepEqual(w.storage.list().sort(), [...COLLECTIONS].sort(), 'all twenty hold something');
  assert.equal(w.storage.clear(), true);
  assert.deepEqual(w.storage.list(), []);
  assert.deepEqual(w.backend.keys().filter((k) => k.startsWith(KEY_PREFIX)), []);
  for (const [k, v] of Object.entries(foreign)) assert.equal(w.backend.getItem(k), v, `${k} is not ONGIL's to delete`);
  assert.equal(buildHomeSummary(w.home, w.now).empty, true, 'Home is empty');
  const o = buildOverview(w.life, w.now);
  assert.deepEqual([o.events.total, o.tasks.open, o.routines.total, o.meals.count, o.water.count, o.exercise.done, o.sleep.recorded, o.week.empty], [0, 0, 0, 0, 0, false, false, true], 'My Life is empty');
  assert.deepEqual(o.private, { expenseEntriesThisMonth: 0, journalToday: false });
  assert.equal(w.home.checkIn.get(), null);
  assert.equal(w.life.dailyLife.get('2026-09-30').water, 0);
  assert.deepEqual([w.saved.list().length, w.profile.getProfile().nickname, onboarding.state().status, notifications.list().length], [0, '', 'new', 0], 'Saved, profile and onboarding are back to their defaults');
});
