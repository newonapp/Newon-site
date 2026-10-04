// ONGIL Phase 3 — Health + Check-in V1: data, sync between Home and 내 생활 › 건강, dates, privacy, storage safety.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import { createCheckInStore, writableDay, CHECKIN_DELIVERY } from '../../ongil-start/js/checkin.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createSymptomStore } from '../../ongil-start/js/symptoms.js';
import { createHealthNoteStore } from '../../ongil-start/js/health-notes.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createDailyLifeStore } from '../../ongil-start/js/daily-life.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createProfileStore } from '../../ongil-start/js/profile.js';
import { createAccount, SYNCABLE_COLLECTIONS, isSyncable } from '../../ongil-start/js/account.js';
import { createSearch, createAreaProvider, createSavedProvider } from '../../ongil-start/js/search.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { CONTRACT_CLASSES, classOf, maySync, maySearchGlobally, familySharingAllowed } from '../../ongil-start/js/privacy.js';
import { buildHomeSummary } from '../../ongil-start/js/home-view.js';
import { createSleepStore } from '../../ongil-start/js/sleep.js';
import { createExpenseStore } from '../../ongil-start/js/expenses.js';
import { createJournalStore } from '../../ongil-start/js/journal.js';
import { clampDay, DAILY_BACK_DAYS } from '../../ongil-start/js/life-daily.js';
import { describeHealthDay, daysText } from '../../ongil-start/js/life-health.js';
import { dateKey, addDays, weekdayOf } from '../../ongil-start/js/dates.js';
import * as LC from '../../ongil-start/js/life-contracts.js';

/* Friday 2 October 2026, 09:00 local. "home" and "life" are two sets of store objects over ONE storage — how the two screens run. */
function world(seed, start = new Date(2026, 9, 2, 9, 0, 0)) {
  const clock = { t: start.getTime() };
  const now = () => (clock.t += 1000);
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  const make = () => ({
    checkIn: createCheckInStore(storage, { now }),
    medication: createMedicationStore(storage, { now }),
    symptoms: createSymptomStore(storage, { now }),
    healthNotes: createHealthNoteStore(storage, { now }),
    schedule: createScheduleStore(storage, { now }),
    tasks: createTaskStore(storage, { now }),
    routines: createRoutineStore(storage, { now }),
    dailyLife: createDailyLifeStore(storage, { now }),
    sleep: createSleepStore(storage, { now }),
    expenses: createExpenseStore(storage, { now }),
    journal: createJournalStore(storage, { now }),
  });
  return { clock, now, backend, storage, home: make(), life: make(), saved: createSavedStore(storage, { now }), profile: createProfileStore(storage, { now }) };
}
const TODAY = '2026-10-02';
const YESTERDAY = '2026-10-01';
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

/* ───────── model ───────── */

test('OG-HL-1 health model: two new collections, all health data HEALTH_ADJACENT, small self-reported shapes', () => {
  assert.deepEqual(COLLECTIONS.filter((c) => ['symptoms', 'healthNotes'].includes(c)), ['symptoms', 'healthNotes']);
  for (const c of ['checkins', 'medications', 'medicationLogs', 'symptoms', 'healthNotes']) assert.equal(classOf(c), 'HEALTH_ADJACENT', c);
  assert.equal(CONTRACT_CLASSES.SymptomRecord, 'HEALTH_ADJACENT');
  assert.equal(CONTRACT_CLASSES.HealthNote, 'HEALTH_ADJACENT');
  /* options are plain words, nothing numeric */
  assert.deepEqual(LC.CHECKIN_BODY.map((o) => o.label), ['좋아요', '보통이에요', '피곤해요', '컨디션이 떨어져요']);
  assert.deepEqual(LC.CHECKIN_ENERGY.map((o) => o.label), ['충분해요', '보통이에요', '부족해요']);
  assert.deepEqual(LC.SYMPTOM_TYPES.map((o) => o.label), ['두통', '어지러움', '기침', '콧물', '목 불편', '복통', '소화 불편', '근육통', '피로', '기타']);
  assert.deepEqual(LC.SYMPTOM_FEELINGS.map((o) => o.label), ['약하게', '보통', '강하게']);
  const s = LC.normalizeSymptoms({ date: TODAY, symptoms: ['cough', 'nope', 'cough'], intensity: 'severe', severity: 9, diagnosis: 'x', note: ' 목이 칼칼 ' }, 1);
  assert.deepEqual(Object.keys(s).sort(), ['createdAt', 'date', 'id', 'intensity', 'note', 'other', 'schemaVersion', 'symptoms', 'updatedAt']);
  assert.deepEqual([s.symptoms, s.intensity, s.note], [['cough'], '', '목이 칼칼'], 'unknown values are dropped, nothing medical is kept');
  assert.throws(() => LC.normalizeSymptoms({ date: TODAY }), /EMPTY_RECORD/);
  assert.throws(() => LC.normalizeHealthNote({ id: 'hn_abcdef12', date: TODAY, text: '  ' }), /INVALID_TEXT/);
  /* Phase 2A shapes still read unchanged: check-in with status only, medication without days, log without a snapshot */
  assert.deepEqual(Object.keys(LC.normalizeCheckIn({ date: TODAY, status: 'good' }, 1)).sort(), ['createdAt', 'date', 'id', 'schemaVersion', 'status', 'updatedAt']);
  assert.deepEqual(LC.normalizeMedication({ id: 'md_abcdef12', name: '약' }, 1).daysOfWeek, [0, 1, 2, 3, 4, 5, 6]);
  assert.deepEqual(LC.normalizeMedicationLog({ medicationId: 'md_abcdef12', date: TODAY, taken: true }, 1), { medicationId: 'md_abcdef12', date: TODAY, taken: true, updatedAt: 1 });
});

/* ───────── check-in ───────── */

test('OG-HL-2 check-in create: 기분 · 몸 상태 · 에너지 · 통증 · 메모 for today, any one is enough', () => {
  const w = world();
  assert.equal(w.life.checkIn.get(), null);
  const r = w.life.checkIn.save({ body: 'tired' });
  assert.equal(r.ok, true);
  assert.deepEqual([r.checkIn.body, 'status' in r.checkIn], ['tired', false], 'a check-in without 기분 is allowed');
  w.life.checkIn.save({ energy: 'low', pain: 'yes', memo: '  허리가 조금  ', status: 'okay' });
  const c = w.life.checkIn.get();
  assert.deepEqual([c.status, c.body, c.energy, c.pain, c.memo], ['okay', 'tired', 'low', 'yes', '허리가 조금']);
  assert.equal(w.life.checkIn.save({ body: 'great' }).ok, true, 'an unknown value is ignored');
  assert.equal(w.life.checkIn.get().body, 'tired', 'and the earlier choice stays');
  assert.equal(w.life.checkIn.save({ status: 'fine' }).reason, 'INVALID_STATUS');
  assert.equal(w.life.checkIn.save({ memo: 'x'.repeat(500) }).checkIn.memo.length, LC.LIFE_LIMITS.checkinMemo);
  assert.deepEqual({ ...CHECKIN_DELIVERY }, { sharedWithFamily: false, notifiesAnyone: false, confirmsSafety: false });
});

test('OG-HL-3 check-in update: the same day is one record — saving again edits it; Home\'s 기분 keeps the rest', () => {
  const w = world();
  w.life.checkIn.save({ status: 'good', body: 'okay', energy: 'enough' });
  const created = w.life.checkIn.get().createdAt;
  w.life.checkIn.save({ energy: 'low' });
  w.home.checkIn.set('hard');
  const c = w.life.checkIn.get();
  assert.deepEqual([c.status, c.body, c.energy, c.createdAt], ['hard', 'okay', 'low', created]);
  assert.deepEqual(w.life.checkIn.recordedDates(), [TODAY], 'one record for the day');
  w.life.checkIn.save({ energy: '' });
  assert.equal('energy' in w.life.checkIn.get(), false, 'a choice can be taken back');
  assert.equal(w.life.checkIn.save({ body: 'good' }, YESTERDAY).ok, true, 'a past day can be corrected');
  assert.deepEqual([w.life.checkIn.get(YESTERDAY).body, w.life.checkIn.get().body], ['good', 'okay'], 'today is unchanged');
});

test('OG-HL-4 check-in delete: one day goes, other days and collections stay; Home\'s clear removes 기분 only', () => {
  const w = world();
  w.life.checkIn.save({ status: 'good', body: 'okay' });
  w.life.checkIn.save({ status: 'okay' }, YESTERDAY);
  w.life.symptoms.save({ symptoms: ['cough'] });
  assert.equal(w.home.checkIn.clear(), true);
  assert.deepEqual([w.life.checkIn.get().status, w.life.checkIn.get().body], [undefined, 'okay'], 'Home clears its own choice; the rest written in 내 생활 stays');
  assert.equal(w.life.checkIn.remove(TODAY), true);
  assert.equal(w.life.checkIn.get(), null);
  assert.equal(w.life.checkIn.get(YESTERDAY).status, 'okay');
  assert.notEqual(w.life.symptoms.get(), null);
  assert.equal(w.life.checkIn.remove(TODAY), false);
  w.life.checkIn.save({ pain: 'no' });
  assert.equal(w.life.checkIn.save({ pain: '' }).removed, true, 'clearing every field removes the day');
  assert.equal(w.life.checkIn.get(), null);
});

/* ───────── symptoms ───────── */

test('OG-HL-5 symptom create: chosen symptoms, 기타, own-word intensity and a note for one day', () => {
  const w = world();
  assert.equal(w.life.symptoms.get(), null);
  const r = w.life.symptoms.save({ symptoms: ['headache', 'other'], other: '눈이 뻑뻑함', intensity: 'mild', note: '오후에 심했음' });
  assert.equal(r.ok, true);
  assert.deepEqual([r.record.symptoms, r.record.other, r.record.intensity, r.record.note], [['headache', 'other'], '눈이 뻑뻑함', 'mild', '오후에 심했음']);
  assert.equal(w.life.symptoms.save({ symptoms: ['cough'] }, '2026-10-05').reason, 'FUTURE_DATE');
  assert.equal(w.life.symptoms.save({ note: '메모만' }, YESTERDAY).ok, true, 'a note alone is a record');
  assert.deepEqual(w.life.symptoms.recordedDates(), [YESTERDAY, TODAY]);
});

test('OG-HL-6 symptom edit: the day\'s record changes in place; 기타 text goes when 기타 is unpicked', () => {
  const w = world();
  w.life.symptoms.save({ symptoms: ['cough', 'other'], other: '가래', intensity: 'strong' });
  const created = w.life.symptoms.get().createdAt;
  w.life.symptoms.save({ symptoms: ['cough'] });
  const s = w.life.symptoms.get();
  assert.deepEqual([s.symptoms, s.other, s.intensity, s.createdAt], [['cough'], '', 'strong', created]);
  w.life.symptoms.save({ note: '저녁엔 나아짐' }, TODAY);
  assert.equal(w.life.symptoms.get().note, '저녁엔 나아짐');
  w.life.symptoms.save({ symptoms: ['fatigue'] }, YESTERDAY);
  w.life.symptoms.save({ symptoms: ['fatigue', 'muscle'] }, YESTERDAY);
  assert.deepEqual(w.life.symptoms.get(YESTERDAY).symptoms, ['muscle', 'fatigue'], 'a past day can be edited (kept in list order)');
  assert.deepEqual(w.life.symptoms.recordedDates(), [YESTERDAY, TODAY], 'still one record per day');
});

test('OG-HL-7 symptom delete: the day goes, nothing else changes; emptying the record also removes it', () => {
  const w = world();
  w.life.symptoms.save({ symptoms: ['cough'] });
  w.life.symptoms.save({ symptoms: ['fatigue'] }, YESTERDAY);
  w.life.checkIn.save({ status: 'good' });
  assert.equal(w.life.symptoms.remove(TODAY), true);
  assert.equal(w.life.symptoms.get(), null);
  assert.deepEqual(w.life.symptoms.get(YESTERDAY).symptoms, ['fatigue']);
  assert.equal(w.life.checkIn.get().status, 'good');
  assert.equal(w.life.symptoms.save({ symptoms: [], note: '' }, YESTERDAY).removed, true);
  assert.deepEqual(w.life.symptoms.recordedDates(), []);
});

/* ───────── medication ───────── */

test('OG-HL-8 medication plan: name · time · days · memo; the existing medication store, no second store', () => {
  const w = world();
  const a = w.life.medication.add({ name: '혈압약', time: '08:00', daysOfWeek: [1, 3, 5], memo: '식후', dose: '10mg' }).medication;
  assert.deepEqual([a.daysOfWeek, 'dose' in a], [[1, 3, 5], false]);
  const b = w.life.medication.add({ name: '비타민', daysOfWeek: [] }).medication;
  assert.deepEqual(b.daysOfWeek, [0, 1, 2, 3, 4, 5, 6], 'no day picked = every day');
  assert.deepEqual(w.life.medication.update(a.id, { daysOfWeek: [5] }).medication.daysOfWeek, [5]);
  assert.deepEqual(w.home.medication.update(a.id, { name: '혈압약 (아침)' }).medication.daysOfWeek, [5], 'a Home edit keeps the days');
  assert.deepEqual([daysText([0, 1, 2, 3, 4, 5, 6]), daysText([1, 3, 5]), daysText([])], ['매일', '월 · 수 · 금', '매일']);
  assert.deepEqual(COLLECTIONS.filter((c) => /medic/i.test(c)), ['medications', 'medicationLogs'], 'no new medication collection');
});

test('OG-HL-9 medication today: only the medications for today\'s weekday — the same list on Home and in 건강', () => {
  const w = world();
  assert.equal(weekdayOf(TODAY), 5);
  w.life.medication.add({ name: '금요일 약', daysOfWeek: [5] });
  w.life.medication.add({ name: '월요일 약', daysOfWeek: [1] });
  w.life.medication.add({ name: '매일 약', time: '09:00' });
  assert.deepEqual(w.home.medication.listForDate().map((m) => m.name), ['매일 약', '금요일 약']);
  assert.deepEqual(w.life.medication.historyForDate(TODAY).map((m) => m.name), ['매일 약', '금요일 약']);
  assert.deepEqual(buildHomeSummary(w.home, w.now).medication, { total: 2, left: 2 });
});

test('OG-HL-10 medication completion: the user marks it; Home and 건강 write the same log', () => {
  const w = world();
  const m = w.life.medication.add({ name: '아침 약' }).medication;
  assert.equal(w.home.medication.setTaken(m.id, true).ok, true);
  assert.equal(w.life.medication.historyForDate(TODAY)[0].taken, true);
  assert.equal(w.life.medication.setTaken(m.id, false, TODAY).ok, true);
  assert.equal(w.home.medication.listForDate()[0].taken, false);
  assert.equal(w.life.medication.setTaken(m.id, true, '2026-10-03').reason, 'FUTURE_DATE');
  assert.equal(w.life.medication.setTaken('md_missing0001', true).reason, 'NOT_FOUND');
});

test('OG-HL-11 medication history: planned vs marked per day; editing the plan does not rewrite marked days', () => {
  const w = world(undefined, new Date(2026, 8, 25, 9, 0, 0));
  const m = w.life.medication.add({ name: '아침 약', time: '08:00' }).medication;
  w.clock.t = new Date(2026, 9, 2, 9, 0, 0).getTime();
  w.life.medication.setTaken(m.id, true, '2026-09-30');
  w.life.medication.setTaken(m.id, false, YESTERDAY);
  w.life.medication.update(m.id, { name: '아침 약 (새 이름)', time: '07:30' });
  const h30 = w.life.medication.historyForDate('2026-09-30');
  assert.deepEqual([h30[0].name, h30[0].time, h30[0].taken, h30[0].marked], ['아침 약', '08:00', true, true], 'a marked day keeps the name and time it had');
  const h29 = w.life.medication.historyForDate('2026-09-29');
  assert.deepEqual([h29[0].name, h29[0].taken, h29[0].marked], ['아침 약 (새 이름)', false, false], 'a planned day without a mark is simply not marked');
  assert.deepEqual(w.life.medication.historyForDate('2026-09-20'), [], 'before it was written down there was no plan');
  w.life.medication.setTaken(m.id, false, '2026-09-30');
  assert.deepEqual([w.life.medication.historyForDate('2026-09-30')[0].name, w.life.medication.historyForDate('2026-09-30')[0].taken], ['아침 약', false], 'a corrected day keeps its snapshot');
  assert.deepEqual(w.life.medication.loggedDates(), ['2026-09-30', YESTERDAY]);
});

/* ───────── notes and history ───────── */

test('OG-HL-12 health note: several per day, edit and delete one at a time, line breaks kept, bounded', () => {
  const w = world();
  const a = w.life.healthNotes.add({ text: '병원 다녀옴\n혈압 재고 옴' }).note;
  const b = w.life.healthNotes.add({ text: '몸이 피곤했음' }).note;
  w.life.healthNotes.add({ text: '두통 있었음', date: YESTERDAY });
  assert.deepEqual(w.life.healthNotes.listForDate().map((n) => n.text), ['병원 다녀옴\n혈압 재고 옴', '몸이 피곤했음']);
  assert.equal(w.life.healthNotes.update(a.id, { text: '병원 다녀옴 (내과)' }).ok, true);
  assert.equal(w.life.healthNotes.remove(b.id).ok, true);
  assert.deepEqual(w.life.healthNotes.listForDate().map((n) => n.text), ['병원 다녀옴 (내과)']);
  assert.equal(w.life.healthNotes.countForDate(YESTERDAY), 1, 'other days untouched');
  assert.equal(w.life.healthNotes.add({ text: 'x'.repeat(900) }).note.text.length, LC.LIFE_LIMITS.healthNoteText);
  assert.equal(w.life.healthNotes.add({ text: '' }).reason, 'INVALID_TEXT');
  assert.equal(w.life.healthNotes.update('hn_missing0001', { text: 'x' }).reason, 'NOT_FOUND');
  for (let i = 0; i < 20; i++) w.life.healthNotes.add({ text: `n${i}`, date: '2026-09-01' });
  assert.equal(w.life.healthNotes.countForDate('2026-09-01'), LC.LIFE_LIMITS.healthNotesPerDay, 'a day holds a bounded number');
});

test('OG-HL-13 health history: one date gathers check-in, symptoms, medication and notes — as written, no score', () => {
  const w = world();
  const m = w.life.medication.add({ name: '약' }).medication;
  w.life.checkIn.save({ status: 'good', body: 'tired' });
  w.life.symptoms.save({ symptoms: ['cough', 'headache'] });
  w.home.medication.setTaken(m.id, true);
  w.life.healthNotes.add({ text: '병원' });
  const parts = describeHealthDay(w.life, TODAY);
  assert.deepEqual(parts, ['안부 (기분 좋아요, 몸 피곤해요)', '증상 2가지', '약 1개 중 1개 먹음', '메모 1건']);
  assert.deepEqual(describeHealthDay(w.life, YESTERDAY), [], 'an empty day says nothing (the screen shows "적은 내용 없음")');
  assert.equal(/점|%|위험|진단|질병|score|risk/i.test(parts.join(' ')), false);
  assert.equal(JSON.stringify(parts).includes('병원'), false, 'a note is counted, not quoted');
});

/* ───────── dates ───────── */

test('OG-HL-14 date navigation: the 건강 cards follow the shared date bar rules (today and back 365 days)', () => {
  assert.equal(DAILY_BACK_DAYS, 365);
  assert.equal(clampDay(YESTERDAY, TODAY), YESTERDAY);
  assert.equal(clampDay(addDays(TODAY, -365), TODAY), addDays(TODAY, -365));
  assert.equal(clampDay(addDays(TODAY, -400), TODAY), addDays(TODAY, -365));
  const w = world();
  for (const d of [TODAY, YESTERDAY, addDays(TODAY, -365)]) {
    assert.equal(w.life.checkIn.save({ status: 'okay' }, d).ok, true, d);
    assert.equal(w.life.symptoms.save({ symptoms: ['cough'] }, d).ok, true, d);
    assert.equal(w.life.healthNotes.add({ text: 'n', date: d }).ok, true, d);
  }
  assert.deepEqual(w.life.checkIn.recordedDates(), [addDays(TODAY, -365), YESTERDAY, TODAY]);
});

test('OG-HL-15 future date blocked: no check-in, symptom, note or medication mark for a day that has not come', () => {
  const w = world();
  const m = w.life.medication.add({ name: '약' }).medication;
  const tomorrow = '2026-10-03';
  assert.equal(clampDay(tomorrow, TODAY), TODAY);
  assert.equal(writableDay(tomorrow, TODAY), 'FUTURE_DATE');
  assert.equal(w.life.checkIn.save({ status: 'good' }, tomorrow).reason, 'FUTURE_DATE');
  assert.equal(w.life.symptoms.save({ symptoms: ['cough'] }, tomorrow).reason, 'FUTURE_DATE');
  assert.equal(w.life.healthNotes.add({ text: 'x', date: tomorrow }).reason, 'FUTURE_DATE');
  assert.equal(w.life.medication.setTaken(m.id, true, tomorrow).reason, 'FUTURE_DATE');
  assert.deepEqual([w.storage.get('checkins'), w.storage.get('symptoms'), w.storage.get('healthNotes'), w.storage.get('medicationLogs')], [null, null, null, null], 'nothing was written');
});

test('OG-HL-16 365-day bound: older days are refused and pruned; the window matches 생활', () => {
  const w = world();
  const old = addDays(TODAY, -366);
  assert.equal(writableDay(old, TODAY), 'TOO_OLD');
  assert.equal(w.life.checkIn.save({ status: 'good' }, old).reason, 'TOO_OLD');
  assert.equal(w.life.symptoms.save({ symptoms: ['cough'] }, old).reason, 'TOO_OLD');
  assert.equal(w.life.healthNotes.add({ text: 'x', date: old }).reason, 'TOO_OLD');
  const items = {};
  for (let i = 0; i < 400; i++) items[addDays(TODAY, -i)] = { symptoms: ['cough'], createdAt: 1, updatedAt: 1 };
  w.backend.setItem(`${KEY_PREFIX}symptoms`, JSON.stringify({ schemaVersion: 1, items }));
  w.life.symptoms.save({ note: 'n' });
  assert.equal(w.life.symptoms.recordedDates().length, LC.LIFE_LIMITS.days, 'older days are dropped on the next write');
  w.backend.setItem(`${KEY_PREFIX}healthNotes`, JSON.stringify({ schemaVersion: 1, items: [{ id: 'hn_old0000001', date: addDays(TODAY, -500), text: '오래됨', createdAt: 1, updatedAt: 1 }] }));
  w.life.healthNotes.add({ text: '새 메모' });
  assert.deepEqual(w.life.healthNotes.recordedDates(), [TODAY]);
  assert.equal(LC.LIFE_LIMITS.medicationLogDays, 366, 'medication history is kept as long as the other health records');
});

/* ───────── Home ↔ 건강 sync ───────── */

test('OG-HL-17 Home check-in sync: Home 기분 shows in 건강 and back; the Home summary says written / not yet', () => {
  const w = world();
  assert.equal(buildHomeSummary(w.home, w.now).empty, true, 'untouched Home: no summary');
  w.home.checkIn.set('okay');
  assert.equal(w.life.checkIn.get().status, 'okay');
  assert.deepEqual(buildHomeSummary(w.home, w.now).items.map((i) => [i.id, i.text]), [['checkin', '남겼어요']]);
  w.life.checkIn.save({ status: 'hard', body: 'low' });
  assert.equal(w.home.checkIn.get().status, 'hard');
  w.life.checkIn.remove(TODAY);
  w.life.schedule.add({ title: '산책' });
  const s = buildHomeSummary(w.home, w.now);
  assert.equal(s.items.find((i) => i.id === 'checkin').text, '아직 남기지 않았어요');
  assert.equal(/좋|나쁨|건강|양호|위험|점수/.test(JSON.stringify(s.items)), false, 'Home does not judge how the user is');
});

test('OG-HL-18 Home medication sync: marks, edits and deletes are the same data in both screens', () => {
  const w = world();
  const a = w.home.medication.add({ name: '아침 약' }).medication;
  const b = w.life.medication.add({ name: '저녁 약', time: '19:00' }).medication;
  assert.deepEqual(w.home.medication.listForDate().map((m) => m.name).sort(), ['아침 약', '저녁 약']);
  w.home.medication.setTaken(a.id, true);
  w.life.medication.setTaken(b.id, true, TODAY);
  assert.deepEqual(w.life.medication.historyForDate(TODAY).map((m) => m.taken), [true, true]);
  assert.equal(buildHomeSummary(w.home, w.now).items.find((i) => i.id === 'medication').text, '모두 먹었어요');
  w.life.medication.update(b.id, { daysOfWeek: [1] });
  assert.deepEqual(w.home.medication.listForDate().map((m) => m.name), ['아침 약'], 'a weekday change in 건강 shows on Home');
  w.life.medication.remove(a.id);
  assert.deepEqual(w.home.medication.listForDate(), []);
});

test('OG-HL-19 SPA sync: no store keeps its own copy — a change through one object is seen by another at once', () => {
  const w = world();
  const reads = [];
  const spy = { ...w.storage, get: (c, f) => { reads.push(c); return w.storage.get(c, f); } };
  const c = createCheckInStore(spy, { now: w.now });
  const s = createSymptomStore(spy, { now: w.now });
  const n = createHealthNoteStore(spy, { now: w.now });
  w.home.checkIn.set('good');
  w.home.symptoms.save({ symptoms: ['cough'] });
  w.home.healthNotes.add({ text: 'a' });
  assert.equal(c.get().status, 'good');
  assert.deepEqual(s.get().symptoms, ['cough']);
  assert.equal(n.countForDate(TODAY), 1);
  w.home.checkIn.set('okay');
  assert.equal(c.get().status, 'okay');
  assert.ok(['checkins', 'symptoms', 'healthNotes'].every((k) => reads.includes(k)));
});

test('OG-HL-20 reload persistence: a new set of stores over the same backend reads everything back', () => {
  const w = world();
  const m = w.home.medication.add({ name: '약', daysOfWeek: [5] }).medication;
  w.home.medication.setTaken(m.id, true);
  w.life.checkIn.save({ status: 'good', body: 'tired', energy: 'low', pain: 'no', memo: '메모' });
  w.life.symptoms.save({ symptoms: ['muscle'], intensity: 'mild' }, YESTERDAY);
  w.life.healthNotes.add({ text: '병원' });
  const storage2 = createStorage({ backend: w.backend, now: w.now });
  const r = { checkIn: createCheckInStore(storage2, { now: w.now }), medication: createMedicationStore(storage2, { now: w.now }), symptoms: createSymptomStore(storage2, { now: w.now }), healthNotes: createHealthNoteStore(storage2, { now: w.now }) };
  assert.deepEqual(r.checkIn.get(), w.life.checkIn.get());
  assert.deepEqual(r.symptoms.get(YESTERDAY), w.life.symptoms.get(YESTERDAY));
  assert.deepEqual(r.healthNotes.listForDate(), w.life.healthNotes.listForDate());
  assert.deepEqual(r.medication.listForDate(), w.home.medication.listForDate());
  assert.equal(r.medication.listForDate()[0].taken, true);
});

/* ───────── storage safety ───────── */

const DAMAGE = ['{not json', '"a string"', 'null', '42', '[]', '{"items":"x"}', '{"items":[1,null,"x"]}', '{"items":{"2026-10-02":"x","bad-key":{"status":"good"}}}', '{"items":{"2026-10-02":{"status":"zzz","body":7,"energy":"low"}}}', '{"items":[{"id":"hn_abcdef12","date":"2026-10-02","text":5}]}', '{"items":{"2026-10-02":{"md_abcdef12":"yes"}}}', '{"schemaVersion":99,"items":{}}', '{"items":{"2026-10-02":{"symptoms":"cough"}}}'];
test('OG-HL-21 corrupted storage: every health collection survives every damage — no throw, safe defaults, others untouched', () => {
  for (const c of ['checkins', 'symptoms', 'healthNotes', 'medications', 'medicationLogs']) {
    for (const bad of DAMAGE) {
      const w = world({ [`${KEY_PREFIX}${c}`]: bad, [`${KEY_PREFIX}journal`]: '{"schemaVersion":1,"items":[]}', 'livon.keep': '1' });
      assert.doesNotThrow(() => {
        w.life.checkIn.get();
        w.life.symptoms.get();
        w.life.healthNotes.listForDate();
        w.life.medication.listForDate();
        w.life.medication.historyForDate(TODAY);
        describeHealthDay(w.life, TODAY);
        buildHomeSummary(w.home, w.now);
      }, `${c} ${bad}`);
      assert.equal(w.backend.getItem('livon.keep'), '1');
      assert.equal(w.backend.getItem(`${KEY_PREFIX}journal`), '{"schemaVersion":1,"items":[]}', 'another ONGIL collection is not touched');
      assert.equal(w.life.checkIn.save({ energy: 'okay' }).ok, true, `${c} ${bad} — writable again`);
      assert.equal(w.life.symptoms.save({ symptoms: ['cough'] }).ok, true);
      assert.equal(w.life.healthNotes.add({ text: 'n' }).ok, true);
      assert.equal(w.life.medication.add({ name: '약' }).ok, true);
    }
  }
  const w = world({ [`${KEY_PREFIX}checkins`]: JSON.stringify({ items: { [TODAY]: { status: 'zzz' }, [YESTERDAY]: { status: 'good' } } }) });
  assert.deepEqual([w.life.checkIn.get(), w.life.checkIn.get(YESTERDAY).status], [null, 'good'], 'a damaged day is skipped, a good day reads');
});

test('OG-HL-22 delete ONGIL data: all health collections are erased with the rest', () => {
  const w = world();
  const m = w.life.medication.add({ name: '약' }).medication;
  w.life.medication.setTaken(m.id, true);
  w.life.checkIn.save({ status: 'good', body: 'okay' });
  w.life.symptoms.save({ symptoms: ['cough'] });
  w.life.healthNotes.add({ text: '메모' });
  assert.deepEqual(w.storage.list().sort(), ['checkins', 'healthNotes', 'medicationLogs', 'medications', 'symptoms']);
  assert.equal(w.storage.clear(), true);
  assert.deepEqual(w.storage.list(), []);
  assert.deepEqual([w.life.checkIn.get(), w.life.symptoms.get(), w.life.healthNotes.count(), w.life.medication.count()], [null, null, 0, 0]);
});

test('OG-HL-23 non-ONGIL data preserved: erasing keeps LIVON, site and look-alike keys', () => {
  const foreign = { 'livon.mlStore.v1': '{"keep":true}', 'newon-app-theme': 'dark', 'ongil-unrelated': 'x', 'ongil.v2.symptoms': 'y', 'newon.ongil.v1.healthNotes': 'w', healthNotes: 'z' };
  const w = world(foreign);
  w.life.symptoms.save({ symptoms: ['cough'] });
  w.life.healthNotes.add({ text: 'n' });
  w.storage.clear();
  for (const [k, v] of Object.entries(foreign)) assert.equal(w.backend.getItem(k), v, k);
  assert.deepEqual(w.backend.keys().filter((k) => k.startsWith(KEY_PREFIX)), []);
});

/* ───────── privacy ───────── */

test('OG-HL-24 private search exclusion: no health record is ever a search result', async () => {
  const w = world();
  const m = w.life.medication.add({ name: '찾으면안되는약이름', memo: '찾으면안되는약메모' }).medication;
  w.life.medication.setTaken(m.id, true);
  w.life.checkIn.save({ status: 'good', memo: '찾으면안되는안부메모' });
  w.life.symptoms.save({ symptoms: ['other'], other: '찾으면안되는증상', note: '찾으면안되는증상메모' });
  w.life.healthNotes.add({ text: '찾으면안되는건강메모' });
  const search = createSearch();
  search.registerProvider(createAreaProvider(AREAS));
  search.registerProvider(createSavedProvider(w.saved));
  assert.deepEqual(search.providerIds(), ['areas', 'saved'], 'no health provider');
  let total = 0;
  for (const q of ['찾으면안되는약이름', '찾으면안되는약메모', '찾으면안되는안부메모', '찾으면안되는증상', '찾으면안되는증상메모', '찾으면안되는건강메모']) total += (await search.query(q)).results.length;
  assert.equal(total, 0, 'PRIVATE DATA SEARCH RESULTS = 0');
  for (const c of ['checkins', 'symptoms', 'healthNotes', 'medications', 'medicationLogs']) assert.equal(maySearchGlobally(c), false, c);
  const menu = await search.query('증상');
  assert.ok(menu.results.length >= 1 && menu.results.every((r) => r.providerId === 'areas'), 'the menu entry is found, never a record');
});

test('OG-HL-25 Community exclusion: no health record reaches Community or Saved', () => {
  const w = world();
  w.life.symptoms.save({ symptoms: ['cough'], note: '비밀' });
  w.life.healthNotes.add({ text: '비밀 메모' });
  w.life.checkIn.save({ status: 'hard' });
  assert.deepEqual(w.saved.list(), [], 'nothing is saved or recommended from health records');
  const community = AREAS.find((a) => a.id === 'community');
  // Phase 6: 커뮤니티 now has two working parts (내가 쓴 글, 모임 준비) — both hold only what the user types. No health
  // record is attached, offered or read there (checked in OG-CM-19); the neighbours' feed still does not exist.
  assert.deepEqual(community.modules.filter((m) => m.available).map((m) => m.id), ['groups', 'mine']);
  assert.equal(/checkIn|symptoms|healthNotes|medication/.test(fs.readFileSync(new URL('../../ongil-start/js/community-view.js', import.meta.url), 'utf8')), false);
});

test('OG-HL-26 Family exclusion: nothing about health is shared; the family switch stays off', () => {
  assert.equal(familySharingAllowed(), false);
  const w = world();
  const seen = [];
  w.storage.subscribe((c) => seen.push(c.collection));
  w.life.checkIn.save({ status: 'help', body: 'low', pain: 'yes' });
  w.life.symptoms.save({ symptoms: ['dizzy'], intensity: 'strong' });
  assert.deepEqual(seen, ['checkins', 'symptoms'], 'one local write each and nothing else — no alert, no family record');
  // Phase 4: 'familySharing' holds only the user's OWN choices (default none). There is still no collection for family
  // members, connections, permissions or anything received from family.
  /* Family Connection V1 — WHY: family connection now exists on this device, in ONE private document. BEFORE: ['familySharing'].
     AFTER: + 'family'. There is still no separate collection per member, permission or consent, and no health record in it. */
  assert.deepEqual(COLLECTIONS.filter((c) => /family/i.test(c)), ['familySharing', 'family']);
  assert.equal(COLLECTIONS.some((c) => /familyConnections|familyPermissions|familyMembers|sharedItems|consents/i.test(c)), false);
});

test('OG-HL-27 sync exclusion: a connected adapter never receives health records; the sync list is unchanged', () => {
  assert.deepEqual([...SYNCABLE_COLLECTIONS], ['profile', 'preferences', 'saved', 'onboarding']);
  for (const c of ['checkins', 'symptoms', 'healthNotes', 'medications', 'medicationLogs']) {
    assert.equal(isSyncable(c), false, c);
    assert.equal(maySync(c), false, c);
  }
  const w = world();
  const account = createAccount({ storage: w.storage });
  const pushed = [];
  account.connectSyncAdapter({ id: 't', isConfigured: () => true, push: (c) => pushed.push(c.collection) });
  const m = w.life.medication.add({ name: '약' }).medication;
  w.life.medication.setTaken(m.id, true);
  w.life.checkIn.save({ status: 'good', body: 'okay' });
  w.life.symptoms.save({ symptoms: ['cough'] });
  w.life.healthNotes.add({ text: 'n' });
  assert.deepEqual(pushed, []);
});

/* ───────── local date ───────── */

test('OG-HL-28 local date: health records are filed under the local day in every time zone, never the UTC day', () => {
  for (const zone of ZONES) {
    inZone(zone, () => {
      const w = world(undefined, new Date(2026, 9, 2, 0, 30, 0));
      w.life.checkIn.save({ status: 'good' });
      w.life.symptoms.save({ symptoms: ['cough'] });
      w.life.healthNotes.add({ text: 'n' });
      const m = w.life.medication.add({ name: '약' }).medication;
      w.life.medication.setTaken(m.id, true);
      assert.deepEqual([w.life.checkIn.recordedDates(), w.life.symptoms.recordedDates(), w.life.healthNotes.recordedDates(), w.life.medication.loggedDates()], [[TODAY], [TODAY], [TODAY], [TODAY]], zone);
      assert.equal(dateKey(w.clock.t), TODAY, zone);
    });
  }
});

test('OG-HL-29 midnight: just after midnight is a new, empty day; the day before keeps its records', () => {
  for (const zone of ZONES) {
    inZone(zone, () => {
      const w = world(undefined, new Date(2026, 9, 2, 23, 50, 0));
      const m = w.home.medication.add({ name: '약' }).medication;
      w.home.medication.setTaken(m.id, true);
      w.home.checkIn.set('good');
      w.life.symptoms.save({ symptoms: ['cough'] });
      w.clock.t = new Date(2026, 9, 3, 0, 0, 0).getTime();
      assert.equal(w.home.checkIn.get(), null, zone);
      assert.equal(w.life.symptoms.get(), null, zone);
      assert.equal(w.home.medication.listForDate()[0].taken, false, `${zone} — a new day starts unmarked`);
      assert.equal(w.life.checkIn.get(TODAY).status, 'good', zone);
      assert.equal(w.life.medication.historyForDate(TODAY)[0].taken, true, zone);
    });
  }
});

test('OG-HL-30 leap date, month end and year end: health records land on and read back from the right day', () => {
  for (const zone of ZONES) {
    inZone(zone, () => {
      for (const [start, key, prev] of [[new Date(2028, 1, 29, 10), '2028-02-29', '2028-02-28'], [new Date(2026, 9, 31, 22), '2026-10-31', '2026-10-30'], [new Date(2027, 0, 1, 0, 5), '2027-01-01', '2026-12-31'], [new Date(2028, 2, 1, 9), '2028-03-01', '2028-02-29']]) {
        const w = world(undefined, start);
        w.life.checkIn.save({ status: 'okay' });
        w.life.symptoms.save({ symptoms: ['cough'] }, prev);
        w.life.healthNotes.add({ text: 'n', date: prev });
        assert.deepEqual([w.life.checkIn.recordedDates(), w.life.symptoms.recordedDates(), w.life.healthNotes.recordedDates()], [[key], [prev], [prev]], `${zone} ${key}`);
        assert.equal(addDays(prev, 1), key, `${zone} ${key}`);
      }
    });
  }
});

/* ───────── performance ───────── */

test('OG-HL-31 365-day fixture: a year of records fits storage, stays writable, and one screen\'s reads stay fast', () => {
  const w = world();
  const meds = [w.life.medication.add({ name: '아침 약', time: '08:00' }).medication, w.life.medication.add({ name: '저녁 약', time: '19:00' }).medication, w.life.medication.add({ name: '비타민' }).medication];
  const ci = {};
  const sy = {};
  const logs = {};
  const notes = [];
  for (let i = 0; i < 365; i++) {
    const d = addDays(TODAY, -i);
    ci[d] = { status: 'okay', body: 'tired', energy: 'okay', pain: 'no', memo: '메모 '.repeat(20), createdAt: 1, updatedAt: 1 };
    sy[d] = { symptoms: ['headache', 'fatigue', 'other'], other: '기타 증상', intensity: 'mild', note: '증상 '.repeat(30), createdAt: 1, updatedAt: 1 };
    logs[d] = Object.fromEntries(meds.map((m, j) => [m.id, { taken: (i + j) % 2 === 0, updatedAt: 1, name: m.name, time: m.time }]));
    notes.push({ id: `hn_fixture${String(i).padStart(4, '0')}`, date: d, text: '가'.repeat(300), createdAt: i + 1, updatedAt: i + 1 });
  }
  w.backend.setItem(`${KEY_PREFIX}checkins`, JSON.stringify({ schemaVersion: 1, items: ci }));
  w.backend.setItem(`${KEY_PREFIX}symptoms`, JSON.stringify({ schemaVersion: 1, items: sy }));
  w.backend.setItem(`${KEY_PREFIX}medicationLogs`, JSON.stringify({ schemaVersion: 1, items: logs }));
  w.backend.setItem(`${KEY_PREFIX}healthNotes`, JSON.stringify({ schemaVersion: 1, items: notes }));
  for (const c of ['checkins', 'symptoms', 'medicationLogs', 'healthNotes']) assert.ok(w.backend.getItem(`${KEY_PREFIX}${c}`).length < 400000, `${c} fits the storage value limit`);
  assert.equal(w.life.checkIn.save({ memo: '오늘' }).ok, true, 'full-size collections still accept writes');
  assert.equal(w.life.symptoms.save({ note: '오늘' }).ok, true);
  assert.equal(w.life.medication.setTaken(meds[0].id, true).ok, true);
  assert.equal(w.life.healthNotes.add({ text: '오늘 두 번째' }).ok, true);
  const t = performance.now();
  for (let i = 0; i < 7; i++) describeHealthDay(w.life, addDays(TODAY, -i));
  const far = addDays(TODAY, -300);
  w.life.checkIn.get(far);
  w.life.symptoms.get(far);
  w.life.medication.historyForDate(far);
  w.life.healthNotes.listForDate(far);
  const ms = performance.now() - t;
  assert.ok(ms < 250, `one screen's reads took ${ms.toFixed(1)}ms`);
  assert.equal(w.life.healthNotes.listForDate(far).length, 1);
  assert.equal(w.life.medication.historyForDate(far).length, 3);
});
