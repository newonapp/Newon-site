// ONGIL Phase 2A — Home V1 data: day keys, check-in, schedule, medication, daily life, nearby source.
// Pure ES modules, no DOM and no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, createMemoryBackend } from '../../ongil-start/js/storage.js';
import { dateKey, isDateKey, isTime, partOfDay, greeting, formatTime } from '../../ongil-start/js/dates.js';
import { createCheckInStore, CHECKIN_DELIVERY } from '../../ongil-start/js/checkin.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createDailyLifeStore } from '../../ongil-start/js/daily-life.js';
import { CHECKIN_STATUSES, LIFE_LIMITS, newId, isId } from '../../ongil-start/js/life-contracts.js';
import { createLifelongClassSource, LIFELONG_PROVIDER } from '../../ongil-start/js/data-source.js';
import { createAccount, SYNCABLE_COLLECTIONS } from '../../ongil-start/js/account.js';

function world(seed) {
  const clock = { t: new Date(2026, 9, 2, 9, 0, 0).getTime() }; // 2026-10-02 09:00 local
  const now = () => (clock.t += 1000);
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  let n = 0;
  const ids = (p) => () => `${p}_test${String(++n).padStart(4, '0')}`;
  return {
    clock,
    backend,
    storage,
    nextDay: () => { clock.t += 24 * 3600 * 1000; },
    checkIn: createCheckInStore(storage, { now }),
    schedule: createScheduleStore(storage, { now, makeId: ids('ev') }),
    medication: createMedicationStore(storage, { now, makeId: ids('md') }),
    dailyLife: createDailyLifeStore(storage, { now }),
  };
}

/* ───────── dates ───────── */

test('OG-DT-1 day keys follow the local calendar, not UTC', () => {
  assert.equal(dateKey(new Date(2026, 9, 2, 0, 5).getTime()), '2026-10-02');
  assert.equal(dateKey(new Date(2026, 9, 2, 23, 55).getTime()), '2026-10-02');
  assert.equal(dateKey(new Date(2026, 0, 1, 0, 0).getTime()), '2026-01-01');
  for (const ok of ['2026-10-02', '2024-02-29']) assert.equal(isDateKey(ok), true, ok);
  for (const bad of ['2026-02-30', '2026-13-01', '26-10-02', '2026-10-2', '', null, 20261002]) assert.equal(isDateKey(bad), false, String(bad));
  for (const ok of ['00:00', '09:30', '23:59']) assert.equal(isTime(ok), true, ok);
  for (const bad of ['24:00', '9:30', '12:60', 'noon', '']) assert.equal(isTime(bad), false, bad);
  assert.equal(formatTime('14:30'), '오후 2:30');
  assert.equal(formatTime('00:05'), '오전 12:05');
});

test('OG-DT-2 greeting follows the time of day and uses a nickname only when there is one', () => {
  assert.deepEqual([5, 10, 11, 16, 17, 23, 2].map(partOfDay), ['morning', 'morning', 'day', 'day', 'evening', 'evening', 'evening']);
  assert.equal(greeting(8), '좋은 아침이에요');
  assert.equal(greeting(13), '오늘도 반가워요');
  assert.equal(greeting(20), '오늘 하루는 어떠셨나요?');
  assert.equal(greeting(8, '영희'), '영희님, 좋은 아침이에요');
  assert.equal(greeting(8, '   '), '좋은 아침이에요');
});

/* ───────── check-in ───────── */

test('OG-CI-1 check-in saves, updates and can be cleared', () => {
  const { checkIn, backend } = world();
  assert.deepEqual(CHECKIN_STATUSES.map((s) => s.label), ['좋아요', '괜찮아요', '조금 힘들어요', '도움이 필요해요']);
  assert.equal(checkIn.get(), null);
  const first = checkIn.set('good');
  assert.deepEqual([first.ok, first.changed, first.checkIn.date, first.checkIn.id], [true, false, '2026-10-02', 'checkin:2026-10-02']);
  const second = checkIn.set('hard');
  assert.deepEqual([second.ok, second.changed, checkIn.get().status], [true, true, 'hard']);
  assert.equal(second.checkIn.createdAt, first.checkIn.createdAt, 'the first time is kept when the answer changes');
  assert.ok(second.checkIn.updatedAt > first.checkIn.updatedAt);
  assert.equal(checkIn.set('fine').ok, false);
  assert.equal(checkIn.get().status, 'hard');
  assert.deepEqual(backend.keys(), ['ongil.v1.checkins']);
  assert.equal(checkIn.clear(), true);
  assert.equal(checkIn.get(), null);
  assert.equal(checkIn.clear(), false);
});

test('OG-CI-2 a check-in belongs to its day: a new day starts empty and yesterday stays readable', () => {
  const w = world();
  w.checkIn.set('okay');
  w.nextDay();
  assert.equal(w.checkIn.get(), null);
  assert.equal(w.checkIn.get('2026-10-02').status, 'okay');
  w.checkIn.set('good');
  assert.equal(w.checkIn.get().date, '2026-10-03');
  assert.equal(w.checkIn.get('2026-10-02').status, 'okay');
  assert.equal(w.checkIn.get('not-a-date'), null);
});

test('OG-CI-3 "help" is only a recorded choice: nothing is shared, sent or confirmed', () => {
  const w = world();
  assert.deepEqual({ ...CHECKIN_DELIVERY }, { sharedWithFamily: false, notifiesAnyone: false, confirmsSafety: false });
  const seen = [];
  w.storage.subscribe((c) => seen.push(c.collection));
  assert.equal(w.checkIn.set('help').ok, true);
  assert.deepEqual(seen, ['checkins'], 'one local write and nothing else');
  assert.deepEqual(w.storage.list(), ['checkins']);
  assert.deepEqual(Object.keys(w.checkIn.get()).sort(), ['createdAt', 'date', 'id', 'schemaVersion', 'status', 'updatedAt']);
});

/* ───────── schedule ───────── */

test('OG-SC-1 schedule: create, complete, update, delete', () => {
  const { schedule } = world();
  const a = schedule.add({ title: '  병원 가기 ', time: '14:30' });
  assert.equal(a.ok, true);
  assert.deepEqual([a.event.title, a.event.date, a.event.time, a.event.completed], ['병원 가기', '2026-10-02', '14:30', false]);
  assert.deepEqual(Object.keys(a.event).sort(), ['completed', 'createdAt', 'date', 'id', 'schemaVersion', 'time', 'title', 'updatedAt']);
  assert.equal(schedule.toggle(a.event.id).event.completed, true);
  assert.equal(schedule.toggle(a.event.id).event.completed, false);
  const u = schedule.update(a.event.id, { title: '병원 가기 (내과)', time: '', id: 'ev_hacked0001', createdAt: 1 });
  assert.deepEqual([u.ok, u.event.title, u.event.time, u.event.id, u.event.createdAt], [true, '병원 가기 (내과)', '', a.event.id, a.event.createdAt]);
  assert.equal(schedule.update('ev_missing0001', { title: 'x' }).reason, 'NOT_FOUND');
  assert.equal(schedule.remove(a.event.id).ok, true);
  assert.equal(schedule.remove(a.event.id).reason, 'NOT_FOUND');
  assert.equal(schedule.count(), 0);
});

test('OG-SC-2 schedule validation: title, time and date', () => {
  const { schedule } = world();
  assert.equal(schedule.add({ title: '   ' }).reason, 'INVALID_TITLE');
  assert.equal(schedule.add({ title: 't', time: '25:00' }).reason, 'INVALID_TIME');
  assert.equal(schedule.add({ title: 't', date: '2026-02-30' }).reason, 'INVALID_DATE');
  assert.equal(schedule.add(null).reason, 'INVALID_TITLE');
  const long = schedule.add({ title: 'x'.repeat(200) });
  assert.equal(long.event.title.length, LIFE_LIMITS.eventTitle);
  const html = schedule.add({ title: '<img src=x onerror=alert(1)>' });
  assert.equal(html.event.title, '<img src=x onerror=alert(1)>', 'kept as text; rendered with textContent');
});

test('OG-SC-3 Home lists today only, timed first in order, then untimed', () => {
  const w = world();
  w.schedule.add({ title: '저녁 산책' });
  w.schedule.add({ title: '점심 약속', time: '12:00' });
  w.schedule.add({ title: '아침 체조', time: '07:30' });
  w.schedule.add({ title: '내일 모임', date: '2026-10-03', time: '10:00' });
  w.schedule.add({ title: '어제 일', date: '2026-10-01' });
  assert.deepEqual(w.schedule.listForDate().map((e) => e.title), ['아침 체조', '점심 약속', '저녁 산책']);
  assert.deepEqual(w.schedule.listForDate('2026-10-03').map((e) => e.title), ['내일 모임']);
  w.nextDay();
  assert.deepEqual(w.schedule.listForDate().map((e) => e.title), ['내일 모임']);
  assert.equal(w.schedule.count(), 5);
});

/* ───────── medication ───────── */

test('OG-MD-1 medication: create, update, delete — only name, time and memo are kept', () => {
  const { medication } = world();
  const a = medication.add({ name: '혈압약', time: '08:00', memo: '아침 식후', dose: '10mg', interactions: ['x'] });
  assert.equal(a.ok, true);
  assert.deepEqual(Object.keys(a.medication).sort(), ['createdAt', 'id', 'memo', 'name', 'schemaVersion', 'time', 'updatedAt']);
  assert.equal(medication.add({ name: '' }).reason, 'INVALID_NAME');
  assert.equal(medication.add({ name: '약', time: '8시' }).reason, 'INVALID_TIME');
  const u = medication.update(a.medication.id, { name: '혈압약 (아침)', memo: '' });
  assert.deepEqual([u.ok, u.medication.name, u.medication.memo, u.medication.time], [true, '혈압약 (아침)', '', '08:00']);
  assert.equal(medication.update('md_missing0001', { name: 'x' }).reason, 'NOT_FOUND');
  medication.add({ name: '비타민' });
  medication.add({ name: '저녁 약', time: '19:00' });
  assert.deepEqual(medication.list().map((m) => m.name), ['혈압약 (아침)', '저녁 약', '비타민'], 'timed first, then untimed');
  assert.equal(medication.remove(a.medication.id).ok, true);
  assert.equal(medication.remove(a.medication.id).reason, 'NOT_FOUND');
  assert.equal(medication.count(), 2);
});

test('OG-MD-2 "taken" is per day: today can be marked and unmarked, tomorrow starts clear', () => {
  const w = world();
  const a = w.medication.add({ name: '혈압약', time: '08:00' }).medication;
  const b = w.medication.add({ name: '비타민' }).medication;
  assert.deepEqual(w.medication.listForDate().map((m) => m.taken), [false, false]);
  assert.equal(w.medication.setTaken(a.id, true).ok, true);
  assert.deepEqual(w.medication.listForDate().map((m) => [m.name, m.taken]), [['혈압약', true], ['비타민', false]]);
  assert.equal(w.medication.setTaken(a.id, false).ok, true);
  assert.equal(w.medication.isTaken(a.id), false);
  w.medication.setTaken(a.id, true);
  assert.equal(w.medication.setTaken('md_missing0001', true).reason, 'NOT_FOUND');
  assert.equal(w.medication.setTaken(b.id, true, 'bad').reason, 'INVALID_DATE');
  w.nextDay();
  assert.deepEqual(w.medication.listForDate().map((m) => m.taken), [false, false]);
  assert.equal(w.medication.isTaken(a.id, '2026-10-02'), true);
});

test('OG-MD-3 deleting a medication removes its marks too', () => {
  const w = world();
  const a = w.medication.add({ name: '혈압약' }).medication;
  const b = w.medication.add({ name: '비타민' }).medication;
  w.medication.setTaken(a.id, true);
  w.medication.setTaken(b.id, true);
  w.medication.remove(a.id);
  const logs = w.storage.get('medicationLogs').items;
  assert.deepEqual(Object.keys(logs['2026-10-02']), [b.id]);
});

/* ───────── daily life ───────── */

test('OG-DL-1 daily life saves plain counts and refuses out-of-range values', () => {
  const { dailyLife } = world();
  assert.deepEqual([dailyLife.get().meals, dailyLife.get().water, dailyLife.get().exercise], [0, 0, false]);
  assert.equal(dailyLife.update({ meals: 2 }).ok, true);
  assert.equal(dailyLife.update({ water: 3 }).ok, true);
  assert.equal(dailyLife.update({ exercise: true }).ok, true);
  const d = dailyLife.get();
  assert.deepEqual([d.meals, d.water, d.exercise, d.date], [2, 3, true, '2026-10-02']);
  /* Phase 2B extended DailyLife with optional detail (which meals, exercise type / minutes / memo). The Phase 2A fields are
     unchanged and a record written by Home alone carries the new fields as "not said". */
  assert.deepEqual(Object.keys(d).sort(), ['date', 'exercise', 'exerciseMemo', 'exerciseMinutes', 'exerciseType', 'mealSlots', 'meals', 'schemaVersion', 'updatedAt', 'water']);
  assert.deepEqual([d.mealSlots, d.exerciseType, d.exerciseMinutes, d.exerciseMemo], [null, '', null, '']);
  for (const bad of [{ meals: 4 }, { meals: -1 }, { meals: 1.5 }, { water: 21 }, { water: -1 }, { exercise: 'yes' }]) assert.equal(dailyLife.update(bad).ok, false, JSON.stringify(bad));
  assert.deepEqual([dailyLife.get().meals, dailyLife.get().water], [2, 3]);
  for (const k of ['score', 'grade', 'target', 'goal']) assert.equal(k in d, false, k);
});

test('OG-DL-2 daily life is per day', () => {
  const w = world();
  w.dailyLife.update({ meals: 3, water: 5, exercise: true });
  w.nextDay();
  assert.deepEqual([w.dailyLife.get().meals, w.dailyLife.get().water, w.dailyLife.get().exercise], [0, 0, false]);
  assert.equal(w.dailyLife.get('2026-10-02').meals, 3);
  w.dailyLife.update({ meals: 1 });
  assert.equal(w.dailyLife.get('2026-10-02').meals, 3);
});

/* ───────── storage, damage, sync boundary ───────── */

test('OG-HS-1 Home data uses the ongil namespace, survives damaged values, and is not synced', () => {
  const w = world({ 'ongil.v1.events': '{broken', 'ongil.v1.medications': '{"items":[{"id":"x"},42,null]}', 'ongil.v1.checkins': '{"items":{"2026-10-02":{"status":"nope"}}}', 'ongil.v1.dailyLife': '[]', 'ongil.v1.medicationLogs': '"x"' });
  assert.deepEqual(w.schedule.listForDate(), []);
  assert.deepEqual(w.medication.listForDate(), []);
  assert.equal(w.checkIn.get(), null);
  assert.equal(w.dailyLife.get().meals, 0);
  assert.equal(w.schedule.add({ title: '새 일정' }).ok, true);
  const m = w.medication.add({ name: '약' }).medication;
  assert.equal(w.medication.setTaken(m.id, true).ok, true);
  w.checkIn.set('good');
  w.dailyLife.update({ water: 1 });
  for (const k of w.backend.keys()) assert.ok(k.startsWith('ongil.v1.'), k);
  const account = createAccount({ storage: w.storage });
  const pushed = [];
  account.connectSyncAdapter({ id: 't', isConfigured: () => true, push: (c) => pushed.push(c.collection) });
  w.checkIn.set('okay');
  w.schedule.add({ title: 'x' });
  w.medication.add({ name: 'y' });
  w.dailyLife.update({ meals: 1 });
  assert.deepEqual(pushed, [], 'check-in, schedule, medication and daily life wait for a consent design before any sync');
  for (const c of ['checkins', 'events', 'medications', 'medicationLogs', 'dailyLife']) assert.equal(SYNCABLE_COLLECTIONS.includes(c), false, c);
  assert.equal(isId(newId('ev')), true);
});

/* ───────── nearby source ───────── */

const program = (over = {}) => ({ type: 'program', providerId: 'p-1', title: '스마트폰 교실', organizer: '구립도서관', venue: '2층', days: '화', timeText: '10:00~12:00', location: { address: '부산광역시 …' }, schedule: { startAt: '2026-10-10', endAt: '2026-11-10' }, contact: { website: 'https://lib.example.kr/' }, source: { attribution: '교육부 · 공공데이터포털' }, ...over });
function fakeApi(routes) {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    const hit = routes.find((r) => url.includes(r.match));
    if (!hit) return { ok: false, status: 404, json: async () => ({}) };
    if (hit.throw) throw new Error('network');
    return { ok: hit.ok !== false, status: 200, json: async () => hit.body };
  };
  return { calls, source: createLifelongClassSource({ apiUrl: (p) => 'https://api.example' + p, fetcher }) };
}
const configured = { match: 'action=status', body: { ok: true, providers: { [LIFELONG_PROVIDER]: { configured: true } } } };

test('OG-NB-1 without a usable route the source is "unavailable" — quietly, with no items', async () => {
  assert.equal((await createLifelongClassSource({}).load({ region: '부산' })).state, 'unavailable');
  const noRegion = fakeApi([configured]);
  assert.deepEqual([(await noRegion.source.load({})).reason, noRegion.calls.length], ['REGION_REQUIRED', 0]);
  assert.equal((await noRegion.source.load({ region: '평양' })).reason, 'REGION_REQUIRED');
  for (const routes of [[], [{ match: 'action=status', throw: true }], [{ match: 'action=status', body: { ok: true, providers: { [LIFELONG_PROVIDER]: { configured: false } } } }], [{ match: 'action=status', body: '<html>' }], [{ match: 'action=status', ok: false, body: {} }]]) {
    const api = fakeApi(routes);
    const r = await api.source.load({ region: '부산' });
    assert.deepEqual([r.state, r.items], ['unavailable', []]);
    assert.equal(api.calls.length, 1, 'the list is not requested when the status check fails');
  }
  const broken = fakeApi([configured, { match: 'provider=', body: { ok: true, items: 'nope' } }]);
  assert.equal((await broken.source.load({ region: '부산' })).state, 'unavailable');
});

test('OG-NB-2 a real answer is cleaned and shown with its source; an empty answer is "empty"', async () => {
  const api = fakeApi([configured, { match: 'provider=', body: { ok: true, items: [program(), program({ providerId: 'p-2', title: '', organizer: 'x' }), { type: 'place', title: 'x', providerId: 'z' }, null, program({ providerId: 'p-3', title: '<b>서예</b>', contact: { website: 'javascript:alert(1)' } })] } }]);
  const r = await api.source.load({ region: '부산' });
  assert.equal(r.state, 'ready');
  assert.deepEqual(r.items.map((i) => i.id), ['p-1', 'p-3']);
  assert.deepEqual([r.items[0].href, r.items[1].href, r.items[1].title], ['https://lib.example.kr/', '', '<b>서예</b>']);
  assert.equal(r.attribution, '교육부 · 공공데이터포털');
  assert.equal(api.calls.length, 2);
  assert.match(api.calls[1].url, /^https:\/\/api\.example\/api\/livon\/data\?provider=kr-lifelong-class&region=%EB%B6%80%EC%82%B0&status=open&limit=6$/);
  assert.equal(api.calls[1].init.credentials, 'omit');
  assert.equal(api.calls[1].init.method, 'GET');
  const none = fakeApi([configured, { match: 'provider=', body: { ok: true, items: [] } }]);
  assert.deepEqual([(await none.source.load({ region: '제주' })).state, (await none.source.load({ region: '제주' })).items], ['empty', []]);
});
