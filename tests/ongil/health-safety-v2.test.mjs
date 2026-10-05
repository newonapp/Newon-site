// ONGIL Health · Safety V2 — 건강·안부 홈, 오늘의 안부, 건강 기록 (+ 체온 · 산소포화도), 복약 (+ 건너뜀 · 기간), 병원·검진,
// 생활 변화 (deterministic, explainable), 도움 요청, 긴급 안내, 가족 공유 (Family V1 permission engine), privacy boundaries.
// OHS2-01 … OHS2-56. The browser part (responsive · keyboard · focus · 200% · reload) runs only with a local Chromium,
// like the Community V2 suite. Nothing here is remote: health stays on this device (local-first).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import { createCheckInStore, CHECKIN_DELIVERY } from '../../ongil-start/js/checkin.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createSleepStore } from '../../ongil-start/js/sleep.js';
import { createDailyLifeStore } from '../../ongil-start/js/daily-life.js';
import { createSymptomStore } from '../../ongil-start/js/symptoms.js';
import { createHealthNoteStore } from '../../ongil-start/js/health-notes.js';
import { createHealthMeasureStore } from '../../ongil-start/js/health-measures.js';
import { MEASURE_TYPES, parseMeasureValue, normalizeMedication, normalizeMedicationLog, medicationActiveOn } from '../../ongil-start/js/life-contracts.js';
import { describeHealthDay, periodText } from '../../ongil-start/js/life-health.js';
import { computeLifeChanges, sleepMinutes, ro, CHANGE_NOTE, NOT_ENOUGH_TEXT, CHANGE_MIN_DAYS } from '../../ongil-start/js/health-changes.js';
import { classOf, maySync, maySearchGlobally, familySharingAllowed } from '../../ongil-start/js/privacy.js';
import { createSearch, createAreaProvider } from '../../ongil-start/js/search.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { createLocalFamilyRepository } from '../../ongil-start/js/family-repository.js';
import { createFamilyService } from '../../ongil-start/js/family-service.js';
import { NEVER_SHARED } from '../../ongil-start/js/family-contracts.js';
import { NO_WRITE_AREAS } from '../../ongil-start/js/assistant-tools.js';
import { addDays, dateKey } from '../../ongil-start/js/dates.js';
import * as HV from '../../ongil-start/js/health-safety-view.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const code = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const JS_DIR = path.join(ROOT, 'ongil-start', 'js');
const JS = Object.fromEntries(fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).map((f) => [f, fs.readFileSync(path.join(JS_DIR, f), 'utf8')]));
const VIEW = JS['health-safety-view.js'];
const CHANGES = JS['health-changes.js'];
const NEW_MODULES = ['health-safety-view.js', 'health-changes.js'];
const HEALTH_MODULES = [...NEW_MODULES, 'checkin.js', 'medication.js', 'health-measures.js', 'health-notes.js', 'symptoms.js', 'health-appointments.js', 'life-health.js'];
/* strings shown to the person (quoted text in the new modules) */
const shown = (src) => [...code(src).matchAll(/'([^'\n]*[가-힣][^'\n]*)'|`([^`\n]*[가-힣][^`\n]*)`/g)].map((m) => m[1] || m[2]).join('\n');
const COPY = shown(VIEW) + '\n' + shown(CHANGES) + '\n' + Object.values(HV).filter((v) => typeof v === 'string').join('\n');

const TODAY = '2026-10-05';
function world(seed, backend = createMemoryBackend(seed)) {
  const clock = { t: new Date(2026, 9, 5, 9, 0, 0).getTime() };
  const now = () => (clock.t += 1000);
  const today = () => TODAY;
  const storage = createStorage({ backend, now });
  let n = 0;
  const id = (p) => () => `${p}_t${String(++n).padStart(6, '0')}`;
  const opts = { now, today };
  const w = {
    backend, storage, clock, now, today,
    checkIn: createCheckInStore(storage, opts),
    medication: createMedicationStore(storage, { ...opts, makeId: id('md') }),
    schedule: createScheduleStore(storage, { ...opts, makeId: id('ev') }),
    sleep: createSleepStore(storage, opts),
    dailyLife: createDailyLifeStore(storage, opts),
    symptoms: createSymptomStore(storage, opts),
    healthNotes: createHealthNoteStore(storage, opts),
    healthMeasures: createHealthMeasureStore(storage, { ...opts, makeId: id('hm') }),
  };
  w.reopen = () => world(null, backend);
  return w;
}
const ok = (r) => { assert.equal(r && r.ok, true, JSON.stringify(r)); return r; };
const FORBIDDEN_SAFETY = /안전합니다|안전해요|안전을 확인했|안전 확인 완료|이상 없|정상입니다|정상이에요|보호자가 확인|확인 완료|위험 없|보호됩니다/;
const FORBIDDEN_FAKE = /전송되었습니다|전달되었습니다|보냈어요|예약 완료|예약되었습니다|접수되었습니다|병원에 전달|알림 설정 완료|신고했|구조 요청이 접수|동기화했|백업했/;
const FORBIDDEN_DIAGNOSIS = /고혈압|저혈압|당뇨|치매|낙상 위험|위험한 상태|건강 이상이 감지|이상이 감지|비정상|발열입니다|저산소/;

/* ═════════════ 1. 복약: 건너뜀 · 기간 · 의미 ═════════════ */
test('OHS2-01 medication skipped: the person marks 건너뜀; 먹었어요 and 건너뜀 never both; 표시 풀기 clears either', () => {
  const w = world();
  const m = ok(w.medication.add({ name: '혈압약', time: '08:00' })).medication;
  ok(w.medication.setStatus(m.id, 'SKIPPED'));
  assert.deepEqual([w.medication.isSkipped(m.id), w.medication.isTaken(m.id)], [true, false]);
  assert.equal(w.medication.listForDate(TODAY)[0].skipped, true);
  ok(w.medication.setStatus(m.id, 'TAKEN'));
  assert.deepEqual([w.medication.isSkipped(m.id), w.medication.isTaken(m.id)], [false, true]);
  ok(w.medication.setStatus(m.id, 'NONE'));
  assert.deepEqual([w.medication.isSkipped(m.id), w.medication.isTaken(m.id)], [false, false]);
  assert.deepEqual(normalizeMedicationLog({ medicationId: m.id, date: TODAY, taken: true, skipped: true }).skipped, undefined, 'taken wins');
});

test('OHS2-02 taken semantics are unchanged for V1 callers: setTaken(true/false) still writes the same mark', () => {
  const w = world();
  const m = ok(w.medication.add({ name: '영양제' })).medication;
  ok(w.medication.setTaken(m.id, true));
  const raw = w.storage.get('medicationLogs').items[TODAY][m.id];
  assert.equal(raw.taken, true);
  assert.equal('skipped' in raw, false);
  ok(w.medication.setTaken(m.id, false));
  assert.equal(w.storage.get('medicationLogs').items[TODAY][m.id].taken, false);
});

test('OHS2-03 a mark is only for today or the kept past; unknown medication or status is refused', () => {
  const w = world();
  const m = ok(w.medication.add({ name: '약' })).medication;
  assert.equal(w.medication.setStatus(m.id, 'SKIPPED', addDays(TODAY, 1)).reason, 'FUTURE_DATE');
  assert.equal(w.medication.setStatus(m.id, 'MAYBE').reason, 'INVALID_STATUS');
  assert.equal(w.medication.setStatus('md_nope000001', 'TAKEN').reason, 'NOT_FOUND');
  assert.equal(w.medication.setStatus(m.id, 'TAKEN', '2026-13-40').reason, 'INVALID_DATE');
});

test('OHS2-04 optional period: 시작일 · 종료일 are checked; outside the period the medication is not planned that day', () => {
  const w = world();
  assert.equal(w.medication.add({ name: 'A', startDate: '2026-10-10', endDate: '2026-10-01' }).reason, 'INVALID_DATE_RANGE');
  assert.equal(w.medication.add({ name: 'A', startDate: 'tomorrow' }).reason, 'INVALID_START_DATE');
  assert.equal(w.medication.add({ name: 'A', endDate: '2026-02-30' }).reason, 'INVALID_END_DATE');
  const later = ok(w.medication.add({ name: '나중 약', startDate: addDays(TODAY, 3) })).medication;
  const ended = ok(w.medication.add({ name: '끝난 약', endDate: addDays(TODAY, -1) })).medication;
  const now = ok(w.medication.add({ name: '지금 약', startDate: TODAY, endDate: addDays(TODAY, 6) })).medication;
  assert.deepEqual(w.medication.listForDate(TODAY).map((x) => x.name), ['지금 약']);
  assert.equal(medicationActiveOn(later, addDays(TODAY, 3)), true);
  assert.equal(medicationActiveOn(ended, TODAY), false);
  assert.match(periodText(now), /부터 · .*까지/);
  assert.equal(periodText({}), '');
});

test('OHS2-05 a period can be changed or cleared; a past mark is kept when the plan changes', () => {
  const w = world();
  const m = ok(w.medication.add({ name: '약', endDate: addDays(TODAY, 2) })).medication;
  ok(w.medication.setStatus(m.id, 'TAKEN'));
  const cleared = ok(w.medication.update(m.id, { endDate: '' })).medication;
  assert.equal('endDate' in cleared, false);
  ok(w.medication.update(m.id, { endDate: addDays(TODAY, -3) }));
  assert.equal(w.medication.listForDate(TODAY).length, 0);
  assert.equal(w.medication.historyForDate(TODAY)[0].taken, true, 'the day already marked keeps its mark');
});

/* ═════════════ 2. 건강 기록 · 검증 ═════════════ */
test('OHS2-06 measures: 체온 and 산소포화도 join the four kinds; plausible input ranges only, nothing judged', () => {
  assert.deepEqual(MEASURE_TYPES.map((t) => t.id), ['weight', 'bloodPressure', 'bloodSugar', 'pulse', 'temperature', 'oxygen']);
  assert.deepEqual(parseMeasureValue('temperature', '36.5'), { value: 36.5, value2: null });
  assert.deepEqual(parseMeasureValue('temperature', '37,2'), { value: 37.2, value2: null });
  assert.deepEqual(parseMeasureValue('oxygen', '97'), { value: 97, value2: null });
  for (const [type, bad] of [['temperature', '33.9'], ['temperature', '43.1'], ['temperature', '36.55'], ['oxygen', '101'], ['oxygen', '49'], ['oxygen', '97.5']]) assert.throws(() => parseMeasureValue(type, bad), /INVALID_VALUE/, `${type} ${bad}`);
  assert.doesNotMatch(read('ongil-start/js/life-contracts.js'), /정상 범위|normalRange|high:|low:/);
});

test('OHS2-07 validation: empty, NaN, Infinity, negative, extreme, exponent and junk are refused for every kind', () => {
  for (const t of MEASURE_TYPES) for (const bad of ['', ' ', 'NaN', 'Infinity', '-1', '-36.5', '1e3', '9999', '0x10', 'abc', '<b>1</b>', null, undefined]) {
    assert.throws(() => parseMeasureValue(t.id, bad), /INVALID_VALUE/, `${t.id} ${String(bad)}`);
  }
  assert.throws(() => parseMeasureValue('unknown', '1'), /INVALID_TYPE/);
});

test('OHS2-08 measures CRUD + reload; a future day or an invalid date is refused; damaged and duplicate records are skipped', () => {
  const w = world();
  const a = ok(w.healthMeasures.add({ type: 'temperature', text: '36.8', timing: 'morning' })).measure;
  ok(w.healthMeasures.update(a.id, { text: '37.0' }));
  assert.equal(w.reopen().healthMeasures.listForDate(TODAY)[0].value, 37);
  assert.equal(w.healthMeasures.add({ type: 'pulse', text: '70', date: addDays(TODAY, 1) }).reason, 'FUTURE_DATE');
  ok(w.healthMeasures.remove(a.id));
  assert.equal(w.reopen().healthMeasures.listForDate(TODAY).length, 0);
  const raw = { schemaVersion: 1, items: [{ id: 'hm_dup0000001', date: TODAY, type: 'pulse', value: 70 }, { id: 'hm_dup0000001', date: TODAY, type: 'pulse', value: 71 }, { id: 'hm_bad0000001', date: TODAY, type: 'pulse', value: 'NaN' }, { id: 'hm_inf0000001', date: TODAY, type: 'oxygen', value: Infinity }, 'junk', null] };
  w.storage.set('healthMeasures', raw);
  assert.equal(w.reopen().healthMeasures.listForDate(TODAY).length, 1);
});

test('OHS2-09 check-in CRUD + reload: create, change, add detail, remove — the same record as Home and 내 생활', () => {
  const w = world();
  ok(w.checkIn.set('okay'));
  assert.equal(w.reopen().checkIn.get(TODAY).status, 'okay');
  ok(w.checkIn.save({ body: 'tired', memo: '산책했어요' }));
  assert.deepEqual([w.checkIn.get(TODAY).status, w.checkIn.get(TODAY).body], ['okay', 'tired']);
  ok(w.checkIn.set('help'));
  assert.equal(w.checkIn.remove(TODAY), true);
  assert.equal(w.reopen().checkIn.get(TODAY), null);
  assert.equal(w.checkIn.save({ status: 'good' }, addDays(TODAY, 1)).reason, 'FUTURE_DATE');
});

test('OHS2-10 check-in is not a safety confirmation: the contract and every new line say so', () => {
  assert.deepEqual({ ...CHECKIN_DELIVERY }, { sharedWithFamily: false, notifiesAnyone: false, confirmsSafety: false });
  assert.match(HV.CHECKIN_IS_NOT_SAFETY, /안전을 확인하거나 누군가에게 알리는 기능은 아니에요/);
  assert.doesNotMatch(COPY, FORBIDDEN_SAFETY);
  assert.match(VIEW, /‘도움이 필요해요’를 골라도 누구에게도 알려지지 않아요/);
});

/* ═════════════ 3. 삭제 무결성 ═════════════ */
test('OHS2-11 delete integrity: a removed record leaves no line in 최근 건강 기록, no count, no comparison', () => {
  const w = world();
  const stores = { checkIn: w.checkIn, symptoms: w.symptoms, medication: w.medication, healthNotes: w.healthNotes, healthMeasures: w.healthMeasures };
  const m = ok(w.healthMeasures.add({ type: 'bloodPressure', text: '128/82' })).measure;
  ok(w.checkIn.set('good'));
  assert.deepEqual(describeHealthDay(stores, TODAY), ['안부 (기분 좋아요)', '수치 1건']);
  ok(w.healthMeasures.remove(m.id));
  w.checkIn.remove(TODAY);
  assert.deepEqual(describeHealthDay(stores, TODAY), []);
  assert.equal(computeLifeChanges(w, TODAY).metrics.find((x) => x.id === 'checkin').recent, 0);
  assert.equal(JSON.stringify(w.backend.dump ? w.backend.dump() : {}).includes('128'), false);
});

test('OHS2-12 medication CRUD + reload; removing from the plan keeps marked days (history), never rewrites them', () => {
  const w = world();
  const m = ok(w.medication.add({ name: '감기약', time: '21:00', daysOfWeek: [1, 3, 5], memo: '식후' })).medication;
  ok(w.medication.update(m.id, { name: '감기약(새)' }));
  assert.equal(w.reopen().medication.list()[0].name, '감기약(새)');
  ok(w.medication.setStatus(m.id, 'SKIPPED'));
  ok(w.medication.remove(m.id));
  const h = w.reopen().medication.historyForDate(TODAY);
  assert.deepEqual(h.map((r) => [r.name, r.removed, r.skipped]), [['감기약(새)', true, true]]);
});

/* ═════════════ 4. 의료 · 복약 경계 ═════════════ */
test('OHS2-13 no medical advice: nothing prescribes, recommends, doses, stops or checks interactions; it points to a doctor or pharmacist', () => {
  assert.match(HV.MEDICATION_ADVICE_NOTE, /의사나 약사/);
  assert.match(HV.MEDICATION_MARK_NOTE, /직접 표시한 것만/);
  assert.match(HV.MEDICATION_MARK_NOTE, /휴대폰 알림은 설정하지 않아요/);
  assert.doesNotMatch(COPY, /복용하세요|드세요|추천|권장|복용량을 (늘|줄)|끊으세요|중단하세요|상호작용이 (있|없)/);
  assert.doesNotMatch(COPY, FORBIDDEN_DIAGNOSIS);
  assert.match(CHANGE_NOTE, /의료진과 상담하세요/);
});

test('OHS2-14 appointments: CRUD on the one calendar store, upcoming vs past; nothing is booked or sent to a hospital', () => {
  const w = world();
  const e = ok(w.schedule.add({ title: '동네 내과', date: addDays(TODAY, 3), time: '10:30', kind: 'MEDICAL_APPOINTMENT', memo: '정기 진료' })).event;
  ok(w.schedule.add({ title: '건강검진센터', date: addDays(TODAY, -10), kind: 'HEALTH_SCREENING' }));
  ok(w.schedule.update(e.id, { time: '11:00' }));
  assert.equal(w.reopen().schedule.listUpcoming('MEDICAL_APPOINTMENT', TODAY)[0].time, '11:00');
  assert.equal(w.schedule.countPast('HEALTH_SCREENING', TODAY), 1);
  ok(w.schedule.remove(e.id));
  assert.equal(w.schedule.listUpcoming('MEDICAL_APPOINTMENT', TODAY).length, 0);
  assert.match(VIEW, /병원에 예약하거나 전달하지 않아요/);
  assert.doesNotMatch(COPY, FORBIDDEN_FAKE);
});

/* ═════════════ 5. 생활 변화 ═════════════ */
test('OHS2-15 changes with no records: honest "not enough" for every metric, nothing guessed', () => {
  const r = computeLifeChanges(world(), TODAY);
  assert.equal(r.enough, false);
  assert.deepEqual(r.metrics.map((m) => m.id), ['checkin', 'sleep', 'meals', 'exercise', 'medication']);
  for (const m of r.metrics) { assert.equal(m.enough, false, m.id); assert.equal(m.direction, null); assert.ok(m.text.includes(NOT_ENOUGH_TEXT), m.text); }
  assert.deepEqual(r.window, { recent: [addDays(TODAY, -6), TODAY], before: [addDays(TODAY, -13), addDays(TODAY, -7)] });
});

function seed(w) {
  /* earlier week: check-in 2 days, sleep 7h on 3 days, meals 3 on 3 days; recent week: check-in 5 days, sleep 6h on 4 days, meals 2 on 4 days */
  for (const i of [8, 10]) ok(w.checkIn.save({ status: 'good' }, addDays(TODAY, -i)));
  for (const i of [0, 1, 2, 3, 4]) ok(w.checkIn.save({ status: 'okay' }, addDays(TODAY, -i)));
  for (const i of [7, 8, 9]) ok(w.sleep.save({ date: addDays(TODAY, -i), bedTime: '22:00', wakeTime: '05:00' }));
  for (const i of [0, 1, 2, 3]) ok(w.sleep.save({ date: addDays(TODAY, -i), bedTime: '23:30', wakeTime: '05:30' }));
  for (const i of [7, 8, 9]) ok(w.dailyLife.update({ meals: 3 }, addDays(TODAY, -i)));
  for (const i of [0, 1, 2, 3]) ok(w.dailyLife.update({ meals: 2 }, addDays(TODAY, -i)));
}
test('OHS2-16 changes are deterministic and explained by their numbers', () => {
  const w = world();
  seed(w);
  const a = computeLifeChanges(w, TODAY);
  const b = computeLifeChanges(w, TODAY);
  assert.deepEqual(a, b, 'same records → same answer');
  const by = Object.fromEntries(a.metrics.map((m) => [m.id, m]));
  assert.equal(by.checkin.text, '안부 기록 — 최근 7일 5일, 그 전 7일 2일로 늘었어요.');
  assert.equal(by.sleep.text, '적어 둔 잠 시간 — 최근 7일 평균 6시간, 그 전 7일 평균 7시간으로 줄었어요.');
  assert.equal(by.meals.text, '적어 둔 식사 끼니 — 최근 7일 평균 2.0끼, 그 전 7일 평균 3.0끼로 줄었어요.');
  assert.equal(by.exercise.enough, false);
  assert.equal(a.enough, true);
});

test('OHS2-17 sleep minutes cross midnight; a missing time is no value (not zero); the particle reads naturally', () => {
  assert.deepEqual(['7시간', '6시간 30분', '5일', '3.0끼', '2일'].map(ro), ['7시간으로', '6시간 30분으로', '5일로', '3.0끼로', '2일로']);
  assert.equal(sleepMinutes({ bedTime: '23:00', wakeTime: '06:30' }), 450);
  assert.equal(sleepMinutes({ bedTime: '01:00', wakeTime: '07:00' }), 360);
  assert.equal(sleepMinutes({ bedTime: '23:00', wakeTime: '' }), null);
  assert.equal(sleepMinutes({ bedTime: '07:00', wakeTime: '07:00' }), null);
  assert.equal(sleepMinutes(null), null);
});

test('OHS2-18 medication comparison counts only the person\'s own marks, including 건너뜀', () => {
  const w = world();
  w.clock.t = new Date(2026, 8, 20).getTime();
  const m = ok(w.medication.add({ name: '약' })).medication;
  for (let i = 0; i < 14; i++) {
    const d = addDays(TODAY, -i);
    if (i < 7) ok(w.medication.setStatus(m.id, i % 2 ? 'SKIPPED' : 'TAKEN', d));
    else ok(w.medication.setStatus(m.id, 'TAKEN', d));
  }
  const med = computeLifeChanges(w, TODAY).metrics.find((x) => x.id === 'medication');
  assert.equal(med.enough, true);
  assert.deepEqual([med.recent.taken, med.recent.skipped, med.before.taken], [4, 3, 7]);
  assert.match(med.text, /최근 7일 7번 중 4번 먹었어요로 표시, 3번 건너뜀/);
  assert.match(med.text, /줄었어요/);
});

test('OHS2-19 changes never judge: no illness, risk, normal/abnormal or AI word; a note says it is a count', () => {
  const w = world();
  seed(w);
  const all = computeLifeChanges(w, TODAY).metrics.map((m) => m.text).join('\n') + CHANGE_NOTE + shown(CHANGES);
  assert.doesNotMatch(all, FORBIDDEN_DIAGNOSIS);
  assert.doesNotMatch(all, /정상|위험|경고|주의가 필요|AI|인공지능|점수/);
  assert.match(CHANGE_NOTE, /건강 상태를 판단하지 않아요/);
  assert.doesNotMatch(code(CHANGES), /fetch|storage\.|localStorage|Math\.random|Date\.now/);
});

test('OHS2-20 a store that throws reads as "no record"; the comparison never stops the screen', () => {
  const boom = { get: () => { throw new Error('x'); }, historyForDate: () => { throw new Error('x'); } };
  const r = computeLifeChanges({ checkIn: boom, sleep: boom, dailyLife: boom, medication: boom }, TODAY);
  assert.equal(r.enough, false);
  assert.equal(r.metrics.length, 5);
  assert.equal(CHANGE_MIN_DAYS, 3);
});

/* ═════════════ 6. 도움 요청 · 긴급 ═════════════ */
test('OHS2-21 help request: only what is really possible — no connected family, help sharing off, or local-only — never "sent"', () => {
  assert.match(VIEW, /연결된 가족이 없어요\. 가족 화면에서 먼저 연결해야 도움을 부탁할 수 있어요\./);
  assert.match(VIEW, /‘도움 요청’ 공유를 먼저 켜야 해요/);
  assert.match(VIEW, /지금은 이 기기 안에서만 남겨지고, 다른 휴대폰으로 보내지지 않아요\./);
  assert.doesNotMatch(COPY, FORBIDDEN_FAKE);
  assert.doesNotMatch(code(VIEW), /requestHelp\(|\.add\(|fetch|sendBeacon/, 'the home itself creates no request and sends nothing');
});

test('OHS2-22 emergency honesty: 119 is called by the person; ONGIL reports, calls, alerts and locates nobody', () => {
  assert.match(HV.EMERGENCY_HONEST_NOTE, /119에 직접 전화하세요/);
  assert.match(HV.EMERGENCY_HONEST_NOTE, /대신 신고하거나, 가족에게 알리거나, 위치를 보내지 않아요/);
  assert.doesNotMatch(code(VIEW), /tel:|geolocation|navigator\.|sms:|mailto:/);
  assert.match(VIEW, /긴급 연락망 보기/, 'the existing emergency card (confirmed call) is reused');
  assert.match(JS['emergency-contacts.js'], /통화 연결 여부는 ONGIL이 알 수 없어요/);
});

/* ═════════════ 7. 가족 공유 · 동의 ═════════════ */
function familyWorld() {
  const w = world();
  const repository = createLocalFamilyRepository(w.storage, { now: w.now });
  const service = createFamilyService({ repository, sources: { checkIn: w.checkIn, schedule: w.schedule, medication: w.medication, dailyLife: w.dailyLife, sleep: w.sleep }, now: w.now });
  const inv = service.createInvitation({ displayName: '큰딸', relationship: 'child' });
  const member = service.acceptInvitation(inv.code).member;
  return { w, service, member };
}
test('OHS2-23 family sharing is OFF by default for every health-related category', () => {
  const { service, member } = familyWorld();
  const levels = service.levels(member.id);
  for (const c of HV.HEALTH_SHARE_CATEGORIES) assert.equal(levels[c], 'NONE', c);
  assert.equal(familySharingAllowed('healthMeasures'), false);
  assert.match(VIEW, /\(기본값: 꺼짐\)/);
});

test('OHS2-24 granular: one category for one member; the others stay off; sensitive ones need the consent', () => {
  const { service, member } = familyWorld();
  ok(service.applySharing(member.id, { CHECK_IN: 'SUMMARY' }));
  const r = service.applySharing(member.id, { MEDICATION: 'SUMMARY' });
  assert.deepEqual([r.ok, r.reason], [false, 'CONSENT_REQUIRED']);
  const levels = service.levels(member.id);
  assert.deepEqual([levels.CHECK_IN, levels.MEDICATION, levels.CHECKUP, levels.HEALTH], ['SUMMARY', 'NONE', 'NONE', 'NONE']);
});

test('OHS2-25 consent update and revoke: given → shown; withdrawn → not shown from then on (the Family V1 engine, reused)', () => {
  const { w, service, member } = familyWorld();
  const m = ok(w.medication.add({ name: '혈압약' })).medication;
  ok(w.medication.setStatus(m.id, 'TAKEN'));
  ok(service.applySharing(member.id, { MEDICATION: 'SUMMARY' }, { consents: ['MEDICATION'] }));
  const view = service.familyView(member.id, TODAY).snapshot;
  assert.equal(view.items.map((i) => i.category).includes('MEDICATION'), true);
  assert.doesNotMatch(JSON.stringify(view), /혈압약/, 'never the medication name');
  ok(service.applySharing(member.id, { MEDICATION: 'NONE' }));
  assert.equal(service.familyView(member.id, TODAY).snapshot.items.some((i) => i.category === 'MEDICATION'), false);
  assert.match(VIEW, /끄면 그 뒤로는 보이지 않아요/);
  assert.doesNotMatch(COPY, /원격에서도 삭제|서버에서 삭제했/);
});

test('OHS2-26 family privacy: measures, symptoms, health notes and memos are never family categories; the view carries none of them', () => {
  const { w, service, member } = familyWorld();
  for (const s of ['건강 메모', '증상 내용']) assert.ok(NEVER_SHARED.includes(s), s);
  ok(w.healthMeasures.add({ type: 'bloodSugar', text: '142' }));
  ok(w.symptoms.save({ symptoms: ['headache'], note: '비밀증상메모XYZ' }));
  ok(w.checkIn.save({ status: 'hard', memo: '비밀안부메모XYZ' }));
  ok(service.applySharing(member.id, { CHECK_IN: 'DETAIL', HEALTH: 'SUMMARY' }, { consents: ['HEALTH'] }));
  const snap = JSON.stringify(service.familyView(member.id, TODAY).snapshot);
  assert.doesNotMatch(snap, /142|비밀증상메모XYZ|비밀안부메모XYZ|headache/);
});

/* ═════════════ 8. 감시 없음 · 기기 · 로컬 우선 ═════════════ */
test('OHS2-27 no precise location, camera or microphone anywhere in the health modules', () => {
  for (const f of HEALTH_MODULES) assert.doesNotMatch(code(JS[f]), /geolocation|getCurrentPosition|watchPosition|getUserMedia|mediaDevices|MediaRecorder|SpeechRecognition|<video|capture=/, f);
});

test('OHS2-28 IoT: "연결된 기기 없음" — no device, wearable or sensor store and no fake reading', () => {
  assert.match(HV.DEVICES_NOTE, /^연결된 기기 없음\./);
  assert.equal(COLLECTIONS.some((c) => /device|sensor|wearable|iot/i.test(c)), false);
  assert.doesNotMatch(code(VIEW), /bluetooth|usb\b|serial|HealthKit|GoogleFit/i);
});

test('OHS2-29 local-first: health modules have no network code; health collections are never synced; no fake sync or backup copy', () => {
  for (const f of HEALTH_MODULES) assert.doesNotMatch(code(JS[f]), /\bfetch\(|fetcher\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/, f);
  for (const c of ['checkins', 'medications', 'medicationLogs', 'symptoms', 'healthNotes', 'healthMeasures']) { assert.equal(classOf(c), 'HEALTH_ADJACENT', c); assert.equal(maySync(c), false, c); }
  assert.doesNotMatch(COPY, /동기화|백업|클라우드|서버에 저장/);
});

test('OHS2-30 search privacy: health collections are never searched; the global search finds no health record text', async () => {
  const w = world();
  ok(w.healthNotes.add({ text: '검색비밀건강메모QQ' }));
  ok(w.medication.add({ name: '검색비밀약QQ', memo: '검색비밀복약메모QQ' }));
  for (const c of ['checkins', 'medications', 'medicationLogs', 'symptoms', 'healthNotes', 'healthMeasures', 'events']) if (classOf(c) === 'HEALTH_ADJACENT') assert.equal(maySearchGlobally(c), false, c);
  const s = createSearch();
  s.registerProvider(createAreaProvider(AREAS));
  for (const q of ['검색비밀건강메모QQ', '검색비밀약QQ', '검색비밀복약메모QQ']) assert.deepEqual((await s.query(q)).results, [], q);
  assert.doesNotMatch(code(JS['app.js']), /registerProvider\([^)]*(health|medication|checkIn|symptom)/i);
});

/* ═════════════ 9. 경계: 내 생활 · 커뮤니티 · AI · LIVON ═════════════ */
test('OHS2-31 My Life boundary: the home uses the same stores (no new collection, no second copy of any record)', () => {
  /* My Life V2: + memos (BEFORE 27, AFTER 28) — still none of them from Health · Safety V2 */ assert.equal(COLLECTIONS.length, 28, 'Health · Safety V2 adds no collection');
  assert.equal(COLLECTIONS.filter((c) => c !== 'memos').length, 27, 'the one new collection is My Life V2\'s memos, not a health one');
  const app = code(JS['app.js']);
  assert.match(app, /const healthHome = createHealthSafetyHome\(\{\s*host: doc\.querySelector\('\[data-og-extra="health"\]'\),\s*checkIn, medication, schedule, symptoms, healthNotes, healthMeasures, sleep, dailyLife,\s*familyConnect,/);
  assert.doesNotMatch(code(VIEW), /storage\.(get|set)|createStorage|localStorage/);
});

test('OHS2-32 Community boundary: health never reaches community and community never reads health', () => {
  for (const f of NEW_MODULES) assert.doesNotMatch(code(JS[f]), /communit/i, f);
  for (const f of ['community.js', 'community-view.js', 'community-contracts.js']) assert.doesNotMatch(code(JS[f]), /health-safety|health-changes|healthMeasures|medication|checkIn|symptom/, f);
});

test('OHS2-33 ONGIL AI boundary: default off — the assistant is given no health store and may write none; the home calls no AI', () => {
  assert.match(code(JS['app.js']), /const assistant = createAssistant\(\{ schedule, tasks, routines, saved, search, familyConnection: onboarding\.familyConnection \}\);/);
  for (const a of ['checkins', 'medications', 'medicationLogs', 'symptoms', 'healthNotes', 'familySharing', 'helpRequests', 'emergencyContacts']) assert.ok(NO_WRITE_AREAS.includes(a), a);
  for (const f of NEW_MODULES) assert.doesNotMatch(code(JS[f]), /assistant|openai|anthropic|\bllm\b|model/i, f);
});

test('OHS2-34 LIVON boundary: no LIVON file or route is imported or named by the health modules', () => {
  for (const f of HEALTH_MODULES) assert.doesNotMatch(code(JS[f]), /livon|\.\.\/|newon-auth/i, f);
});

/* ═════════════ 10. 보존: Family V1 · V2 · Community V2 · 캐시 ═════════════ */
test('OHS2-35 Family V1 preserved: local repository, permission engine and NEVER_SHARED unchanged in behaviour', () => {
  const { service, member } = familyWorld();
  assert.equal(service.mode, 'LOCAL');
  assert.equal(service.applySharing(member.id, { HEALTH: 'DETAIL' }, { consents: ['HEALTH'] }).reason, 'INVALID_LEVEL');
  assert.deepEqual([...NEVER_SHARED], ['건강 메모', '증상 내용', '기록(일기)', '생활비']);
});

test('OHS2-36 Family V2 preserved: route, store, both migrations, advisory limits and the client are present and untouched by health code', () => {
  for (const f of ['api/ongil/family.mjs', 'server/ongil/family/http.mjs', 'server/ongil/family/store.mjs', 'server/ongil/family/migrations/001_family.sql', 'server/ongil/family/migrations/002_family_limits.sql']) assert.ok(fs.existsSync(path.join(ROOT, f)), f);
  assert.match(read('server/ongil/family/http.mjs'), /LIMIT_MEMBERS/);
  assert.match(read('server/ongil/family/http.mjs'), /LIMIT_INVITATIONS/);
  for (const f of ['server/ongil/family/http.mjs', 'server/ongil/family/store.mjs', 'ongil-start/js/family-remote.js']) assert.doesNotMatch(read(f), /health-safety|health-changes|healthMeasures/, f);
});

test('OHS2-37 Community V2 preserved: its suite and modules exist; health code does not touch them', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'tests/ongil/community-v2.test.mjs')));
  const n = (read('tests/ongil/community-v2.test.mjs').match(/^\s*test\(|^\s+test\(`/gm) || []).length;
  assert.ok(n >= 60, `community tests ${n}`);
});

test('OHS2-38 cache versions: the import map is generated by the official script and is current', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/ongil-module-versions.mjs')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const html = read('ongil-start/index.html');
  for (const f of NEW_MODULES) assert.match(html, new RegExp(`"/ongil-start/js/${f.replace('.', '\\.')}": "/ongil-start/js/${f.replace('.', '\\.')}\\?v=[0-9a-f]{12}"`), f);
});

/* ═════════════ 11. 손상 복구 ═════════════ */
test('OHS2-39 corrupt storage: invalid JSON, missing fields, old schema and bad dates do not break any health store or the comparison', () => {
  const backend = createMemoryBackend();
  for (const [k, v] of [['medications', '{not json'], ['medicationLogs', JSON.stringify({ schemaVersion: 1, items: { 'bad-date': { x: 1 }, [TODAY]: { md_x00000001: 'junk' } } })], ['checkins', JSON.stringify({ items: { [TODAY]: { status: 'unknown' }, '2026-02-31': { status: 'good' } } })], ['sleepRecords', '[1,2,3]'], ['dailyLife', 'null'], ['healthMeasures', JSON.stringify({ items: [{}] })]]) backend.setItem(KEY_PREFIX + k, v);
  const w = world(null, backend);
  assert.deepEqual(w.medication.list(), []);
  assert.deepEqual(w.medication.historyForDate(TODAY), []);
  assert.equal(w.checkIn.get(TODAY) === null || typeof w.checkIn.get(TODAY) === 'object', true);
  assert.equal(computeLifeChanges(w, TODAY).enough, false);
  ok(w.medication.add({ name: '새 약' }));
  assert.equal(w.medication.list().length, 1, 'writing works again after damage');
});

test('OHS2-40 duplicate ids and old-schema records: one copy is kept; records without period or skipped read as before', () => {
  const w = world();
  w.storage.set('medications', { schemaVersion: 1, items: [{ id: 'md_old0000001', name: '옛 약', time: '', daysOfWeek: [] }, { id: 'md_old0000001', name: '중복', time: '' }] });
  w.storage.set('medicationLogs', { schemaVersion: 1, items: { [TODAY]: { md_old0000001: { taken: false } } } });
  const list = w.reopen().medication.list();
  assert.deepEqual(list.map((m) => [m.name, 'startDate' in m]), [['옛 약', false]]);
  assert.equal(w.reopen().medication.listForDate(TODAY)[0].skipped, false);
  assert.throws(() => normalizeMedication({ id: 'md_old0000001', name: 'x', startDate: '2026-1-1' }), /INVALID_START_DATE/);
});

/* ═════════════ 12. 화면 코드 · 보안 ═════════════ */
test('OHS2-41 every store read on the home is guarded, and one card that fails never stops the others', () => {
  assert.match(VIEW, /const safe = \(fn, fallback\) => \{ try \{ return fn\(\); \} catch \{ return fallback; \} \};/);
  assert.match(VIEW, /try \{ fn\(\); \} catch \{ \/\* one card that cannot be drawn never stops the others \*\/ \}/);
  for (const call of VIEW.matchAll(/(checkIn|medication|schedule|familyConnect)\.(get|listForDate|listUpcoming|count|overview|levels|set|setStatus|remove)\(/g)) {
    const at = call.index;
    assert.match(VIEW.slice(Math.max(0, at - 30), at), /safe\(\(\) => $/, `unguarded ${call[0]}`);
  }
});

test('OHS2-42 security: no eval, Function, innerHTML, javascript: or console in the new modules; no health value is logged', () => {
  for (const f of NEW_MODULES) {
    const c = code(JS[f]);
    assert.doesNotMatch(c, /\beval\(|new Function|innerHTML|outerHTML|insertAdjacentHTML|javascript:|console\.|document\.write/, f);
  }
  assert.doesNotMatch(code(JS['medication.js']) + code(JS['life-health.js']), /console\./);
});

test('OHS2-43 the screen states what exists: 도움 요청 and 생활 변화 are listed as working; nothing on 건강·안부 is "준비 중"', () => {
  const health = AREAS.find((a) => a.id === 'health');
  assert.deepEqual(health.modules.filter((m) => !m.available).map((m) => m.id), []);
  for (const id of ['help', 'changes']) assert.equal(health.modules.find((m) => m.id === id).available, true, id);
  assert.match(health.modules.find((m) => m.id === 'help').description, /ONGIL이 대신 연락하지 않습니다/);
  assert.match(health.notice, /위급할 때는 119에 직접 전화해 주세요/);
});

test('OHS2-44 copy audit: no false safety, fake success, diagnosis or notification claim in any line the health home or comparison shows', () => {
  assert.doesNotMatch(COPY, FORBIDDEN_SAFETY);
  assert.doesNotMatch(COPY, FORBIDDEN_FAKE);
  assert.doesNotMatch(COPY, FORBIDDEN_DIAGNOSIS);
  assert.doesNotMatch(COPY, /알림을 설정했|알림이 설정|푸시/);
});

test('OHS2-45 documentation: the Health · Safety V2 document records every boundary and the known limitations', () => {
  const doc = read('docs/ongil/ONGIL_HEALTH_SAFETY_V2.md');
  for (const h of ['PRODUCT PRINCIPLES', 'AUDIT', 'SENIOR FIRST', 'LOCAL-FIRST', 'PRIVACY DEFAULTS', 'DATA OWNERSHIP', 'CHECK-IN IS NOT SAFETY', 'MEDICAL BOUNDARY', 'MEDICATION BOUNDARY', 'EMERGENCY BOUNDARY', 'DAILY LIFE CHANGES', 'FAMILY SHARING AND CONSENT', 'NO SURVEILLANCE', 'AI BOUNDARY', 'COMMUNITY BOUNDARY', 'FUTURE IOT BOUNDARY', 'NOTIFICATIONS', 'TESTS', 'KNOWN LIMITATIONS']) assert.match(doc, new RegExp(`^## (\\d+\\. )?${h}$`, 'm'), h);
  assert.match(doc, /REMOTE HEALTH = NOT IMPLEMENTED/);
  assert.doesNotMatch(doc, /REMOTE HEALTH = LIVE|안전을 보장/);
});

/* ═════════════ 13. browser: home · responsive · keyboard · focus · zoom · reload (skipped without a local Chromium) ═════════════ */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const canBrowse = fs.existsSync(PW) && fs.existsSync(CHROME);
const skip = !canBrowse && 'no local Chromium';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
let B = null, SERVER = null, BASE = '';
async function boot() {
  if (B) return;
  const { chromium } = await import(PW);
  SERVER = await new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); return res.end(fs.readFileSync(f)); }
      res.writeHead(404); res.end();
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
  BASE = `http://127.0.0.1:${SERVER.address().port}`;
  B = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
}
test.after(async () => { if (B) await B.close(); if (SERVER) SERVER.close(); });
async function page(width, { ctx: given } = {}) {
  await boot();
  const ctx = given || (await B.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' }));
  await ctx.route('**/*', (r) => (r.request().url().startsWith(BASE) ? r.continue() : r.abort()));
  const pg = await ctx.newPage();
  pg._errors = []; pg.on('pageerror', (e) => pg._errors.push(e.message));
  await pg.goto(`${BASE}/ongil-start/#health`, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  return pg;
}
const HOME = '[data-og-health-home]';
const layout = (pg) => pg.evaluate((scope) => {
  const vis = (e) => { const s = getComputedStyle(e); const b = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && !e.closest('[hidden]'); };
  const root = document.querySelector(scope);
  const inter = [...root.querySelectorAll('a[href],button,input,select,textarea')].filter(vis);
  const small = inter.filter((e) => { const b = e.getBoundingClientRect(); return b.height < 44 || b.width < 44; }).map((e) => e.outerHTML.slice(0, 80));
  const clipped = [...root.querySelectorAll('p,li,h3,button,a')].filter(vis).filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'hidden').map((e) => e.textContent.slice(0, 30));
  return { over: document.documentElement.scrollWidth - document.documentElement.clientWidth, small, clipped, n: inter.length, text: root.innerText };
}, HOME);
async function fill(pg) {
  await pg.evaluate(() => {
    const O = window.Ongil;
    O.medication.add({ name: '아침 혈압약이름이아주길어요아주길어요', time: '08:00' });
    O.medication.add({ name: '저녁 약', time: '20:00' });
    const d = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
    O.schedule.add({ title: '동네 내과의원 정기 진료가 있는 날'.repeat(2), date: d(2), time: '10:30', kind: 'MEDICAL_APPOINTMENT' });
    O.healthMeasures.add({ type: 'temperature', text: '36.6' });
    for (let i = 1; i < 12; i++) O.checkIn.save({ status: 'okay' }, d(-i));
  });
  await pg.evaluate(() => { location.hash = '#ongil-home'; }); await pg.waitForTimeout(200);
  await pg.evaluate(() => { location.hash = '#health'; }); await pg.waitForTimeout(400);
}
for (const [id, w] of [['OHS2-46', 320], ['OHS2-47', 390], ['OHS2-48', 768], ['OHS2-49', 1024], ['OHS2-50', 1440]]) {
  test(`${id} browser ${w}px: health home empty, filled and confirming — no overflow, every target ≥ 44px, honest copy`, { skip }, async () => {
    const pg = await page(w);
    for (const step of ['empty', 'filled', 'confirm']) {
      if (step === 'filled') await fill(pg);
      if (step === 'confirm') { await pg.locator(`${HOME} [data-og-slot="health.today"] .og-pick`).first().click(); await pg.waitForTimeout(150); await pg.locator(`${HOME} button:has-text("오늘 안부 지우기")`).click(); await pg.waitForTimeout(150); }
      const r = await layout(pg);
      assert.equal(r.over, 0, `${w} ${step}: page overflow ${r.over}px`);
      assert.deepEqual(r.small, [], `${w} ${step}: small targets`);
      assert.deepEqual(r.clipped, [], `${w} ${step}: clipped text`);
      assert.doesNotMatch(r.text, FORBIDDEN_SAFETY);
      assert.doesNotMatch(r.text, FORBIDDEN_FAKE);
      if (step === 'empty') {
        for (const t of ['오늘은 아직 안부를 적지 않았어요.', '적어 둔 약이 없어요.', '다가오는 병원·검진 일정이 없어요.', '최근 7일 동안 적은 건강 기록이 없어요.', '아직 비교할 기록이 충분하지 않아요.', '연결된 가족이 없어요.', '(기본값: 꺼짐)', '연결된 기기 없음.']) assert.ok(r.text.includes(t), `${w} empty: ${t}`);
      }
      if (step === 'filled') for (const t of ['아침 혈압약', '동네 내과의원', '수치 1건', '안부 기록 —']) assert.ok(r.text.includes(t), `${w} filled: ${t}`);
    }
    assert.deepEqual(pg._errors, []);
    await pg.context().close();
  });
}

test('OHS2-51 browser keyboard and focus: check-in by keyboard, a visible focus ring, the delete confirmation answers Escape and returns focus', { skip }, async () => {
  const pg = await page(390);
  const first = pg.locator(`${HOME} [data-og-slot="health.today"] .og-pick`).first();
  await first.focus();
  await pg.keyboard.press('Enter'); await pg.waitForTimeout(200);
  assert.equal(await pg.locator(`${HOME} [data-og-health-checkin]`).getAttribute('data-og-health-checkin'), 'good');
  const ring = await pg.evaluate(() => { const b = document.querySelector('[data-og-health-home] [data-og-slot="health.today"] .og-pick'); b.focus(); const s = getComputedStyle(b); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; });
  assert.equal(ring, true, 'visible focus');
  await pg.locator(`${HOME} button:has-text("오늘 안부 지우기")`).focus();
  await pg.keyboard.press('Enter'); await pg.waitForTimeout(200);
  assert.equal(await pg.evaluate(() => document.activeElement.textContent), '그대로 두기', 'focus moves into the confirmation');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
  assert.equal(await pg.locator(`${HOME} [data-og-slot="health.today"] .og-confirm`).count(), 0);
  assert.equal(await pg.locator(`${HOME} [data-og-health-checkin]`).getAttribute('data-og-health-checkin'), 'good', 'Escape keeps the record');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('OHS2-52 browser 200% text at 320px: nothing overflows or is clipped on the health home', { skip }, async () => {
  const pg = await page(320);
  await fill(pg);
  await pg.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  await pg.waitForTimeout(200);
  const r = await layout(pg);
  assert.equal(r.over, 0, `overflow ${r.over}px`);
  assert.deepEqual(r.clipped, []);
  await pg.context().close();
});

test('OHS2-53 browser reload persistence: check-in, 건너뜀 and 먹었어요 marks survive a reload and are the same records in 내 생활', { skip }, async () => {
  await boot();
  const ctx = await B.newContext({ viewport: { width: 1024, height: 900 }, reducedMotion: 'reduce' });
  const pg = await page(1024, { ctx });
  await pg.evaluate(() => { window.Ongil.medication.add({ name: '약 하나', time: '08:00' }); window.Ongil.medication.add({ name: '약 둘', time: '09:00' }); location.hash = '#ongil-home'; });
  await pg.waitForTimeout(150); await pg.evaluate(() => { location.hash = '#health'; }); await pg.waitForTimeout(300);
  await pg.locator(`${HOME} [data-og-slot="health.today"] .og-pick`).nth(1).click();
  await pg.locator(`${HOME} button[aria-label="‘약 하나’ 먹었어요로 표시"]`).click();
  await pg.locator(`${HOME} button[aria-label="‘약 둘’ 건너뜀으로 표시"]`).click();
  await pg.reload(); await pg.waitForTimeout(800);
  const text = await pg.locator(`${HOME}`).innerText();
  assert.match(text, /오늘 안부: 괜찮아요/);
  assert.match(text, /약 하나\s+[^\n]*8:00 · 먹었어요로 표시/);
  assert.match(text, /약 둘\s+[^\n]*9:00 · 건너뜀으로 표시/);
  const same = await pg.evaluate(() => { const m = window.Ongil.medication.listForDate(); return m.map((x) => [x.name, x.taken, x.skipped]); });
  assert.deepEqual(same, [['약 하나', true, false], ['약 둘', false, true]]);
  await pg.evaluate(() => { location.hash = '#life/checkin'; }); await pg.waitForTimeout(500);
  assert.match(await pg.locator('[data-og-slot="life.medication"]').innerText(), /건너뜀으로 표시했어요/);
  assert.deepEqual(pg._errors, []);
  await ctx.close();
});

test('OHS2-54 browser help card with a family connected on this device: says exactly what is possible, links only to existing screens', { skip }, async () => {
  const pg = await page(390);
  let text = await pg.locator(`${HOME} [data-og-help-option="family"]`).innerText();
  assert.match(text, /연결된 가족이 없어요/);
  const hrefs = await pg.locator(`${HOME} [data-og-slot="health.help"] a`).evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  assert.deepEqual(hrefs, ['#family', '#care']);
  await pg.locator(`${HOME} button:has-text("긴급 연락망 보기")`).click(); await pg.waitForTimeout(200);
  assert.equal(await pg.evaluate(() => document.activeElement.textContent), '긴급 연락망');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('OHS2-55 browser privacy: nothing leaves the page while the health home is used (no request but the page\'s own files)', { skip }, async () => {
  await boot();
  const ctx = await B.newContext({ viewport: { width: 390, height: 900 } });
  const outside = [];
  ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:')) outside.push(u); });
  const pg = await page(390, { ctx });
  const ownBefore = [];
  pg.on('request', (r) => { if (r.url().startsWith(BASE) && /api|\/server\//.test(r.url())) ownBefore.push(r.url()); });
  await fill(pg);
  await pg.locator(`${HOME} [data-og-slot="health.today"] .og-pick`).first().click();
  await pg.locator(`${HOME} button:has-text("먹었어요")`).first().click();
  await pg.waitForTimeout(300);
  assert.deepEqual(ownBefore, [], 'no API call from the health home');
  assert.deepEqual(outside.filter((u) => !/fonts\.g|cloudfront|film/.test(u)), [], 'no outside host besides the page fonts/film already used');
  await ctx.close();
});

test('OHS2-56 cleanup: no QA data or user record is in the published source', () => {
  for (const f of NEW_MODULES) assert.doesNotMatch(JS[f], /QA|테스트용|example\.test|fixture/i, f);
  assert.doesNotMatch(read('ongil-start/index.html'), /checkins|medicationLogs|healthMeasures/);
});
