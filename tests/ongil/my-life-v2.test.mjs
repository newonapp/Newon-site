// ONGIL My Life V2 — 내 생활 as the daily-life hub: 요약 (오늘 할 것 · 오늘의 건강·안부 · 다가오는 일정 · 메모 · 관심 활동),
// 할 일 (+ 시간 · 메모), 루틴 (examples are words only), 캘린더 (one store, 병원 일정 included), 기록 (+ 어떤 기록), 메모 (new,
// PRIVATE) and the boundaries: Health stays canonical, Family / Community / ONGIL AI read nothing new, nothing leaves the device.
// OML2-01 … OML2-50. The browser part (5 widths · keyboard · focus · 200% · reload · network) runs only with a local Chromium,
// like the Community V2 and Health · Safety V2 suites.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createJournalStore } from '../../ongil-start/js/journal.js';
import { createMemoStore, memoMatches } from '../../ongil-start/js/memos.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createDailyLifeStore } from '../../ongil-start/js/daily-life.js';
import { createSleepStore } from '../../ongil-start/js/sleep.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { normalizeTask, normalizeJournal, normalizeMemo, JOURNAL_KINDS, LIFE_LIMITS } from '../../ongil-start/js/life-contracts.js';
import * as LT from '../../ongil-start/js/life-today.js';
import { LIFE_SECTIONS, LIFE_GROUPS, resolveSection, lifeHash, LIFE_LOCAL_NOTE } from '../../ongil-start/js/life-view.js';
import { ROUTINE_EXAMPLES } from '../../ongil-start/js/life-plan.js';
import { CLASSIFICATION, CONTRACT_CLASSES, classOf, maySync, maySearchGlobally, familySharingAllowed } from '../../ongil-start/js/privacy.js';
import { isSyncable } from '../../ongil-start/js/account.js';
import { createSearch, createAreaProvider, createSavedProvider } from '../../ongil-start/js/search.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { createLocalFamilyRepository } from '../../ongil-start/js/family-repository.js';
import { createFamilyService } from '../../ongil-start/js/family-service.js';
import { SHARE_CATEGORIES, NEVER_SHARED } from '../../ongil-start/js/family-contracts.js';
import { NO_WRITE_AREAS } from '../../ongil-start/js/assistant-tools.js';
import { COMMUNITY_REMOTE_CONTRACT } from '../../ongil-start/js/community-contracts.js';
import { CHECKIN_DELIVERY } from '../../ongil-start/js/checkin.js';
import { addDays } from '../../ongil-start/js/dates.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const code = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const JS_DIR = path.join(ROOT, 'ongil-start', 'js');
const JS = Object.fromEntries(fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).map((f) => [f, fs.readFileSync(path.join(JS_DIR, f), 'utf8')]));
const NEW_MODULES = ['memos.js', 'life-today.js'];
/* the modules My Life V2 wrote or changed */
const V2_MODULES = [...NEW_MODULES, 'life-view.js', 'life-records.js', 'life-plan.js', 'tasks.js', 'journal.js', 'life-contracts.js', 'home-ui.js'];
const shown = (src) => [...code(src).matchAll(/'([^'\n]*[가-힣][^'\n]*)'|`([^`\n]*[가-힣][^`\n]*)`/g)].map((m) => m[1] || m[2]).join('\n');
const COPY = ['life-today.js', 'life-view.js', 'life-records.js', 'memos.js'].map((f) => shown(JS[f])).join('\n') + '\n' + LIFE_LOCAL_NOTE;
const APP = JS['app.js'];
const INDEX = read('ongil-start/index.html');

const FORBIDDEN_SAFETY = /안전합니다|안전해요|안전을 확인했|안전 확인 완료|이상 없|정상입니다|정상이에요|보호자가 확인|확인 완료|위험 없|보호됩니다/;
const FORBIDDEN_FAKE = /전송되었습니다|전달되었습니다|보냈어요|예약 완료|예약되었습니다|접수되었습니다|신청 완료|참여 예정|알림 설정 완료|동기화했|동기화되었|백업했|백업되었|클라우드에 저장|가족이 확인했/;
const FORBIDDEN_JUDGE = /점수|등급|건강해(졌|집니다|요)|건강에 좋|치매|낙상|위험한 상태|이상이 감지|잘하고 있어요|부족해요|게을/;

/* a fixed local day: 2026-10-06 09:00 (the tests never depend on the day they run) */
const TODAY = '2026-10-06';
function world(seed, backend = createMemoryBackend(seed), start = new Date(2026, 9, 6, 9, 0, 0).getTime()) {
  const clock = { t: start };
  const now = () => (clock.t += 1000);
  const today = () => {
    const d = new Date(clock.t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const storage = createStorage({ backend, now });
  let n = 0;
  const id = (p) => () => `${p}_t${String(++n).padStart(6, '0')}`;
  const opts = { now, today };
  const w = {
    backend, storage, clock, now, today,
    tasks: createTaskStore(storage, { now, makeId: id('tk') }),
    routines: createRoutineStore(storage, { ...opts, makeId: id('rt') }),
    schedule: createScheduleStore(storage, { ...opts, makeId: id('ev') }),
    journal: createJournalStore(storage, { ...opts, makeId: id('jn') }),
    memos: createMemoStore(storage, { now, makeId: id('mm') }),
    checkIn: createCheckInStore(storage, opts),
    medication: createMedicationStore(storage, { ...opts, makeId: id('md') }),
    dailyLife: createDailyLifeStore(storage, opts),
    sleep: createSleepStore(storage, opts),
    saved: createSavedStore(storage, { now }),
  };
  w.reopen = () => world(null, backend, clock.t);
  return w;
}
const ok = (r) => { assert.equal(r && r.ok, true, JSON.stringify(r)); return r; };
const snapshot = (w) => JSON.stringify(Object.fromEntries(w.backend.keys().sort().map((k) => [k, w.backend.getItem(k)])));

/* ═════════════ 1. 요약: 오늘 · 다가오는 일정 · 건강·안부 · 관심 활동 ═════════════ */

test('OML2-01 honest empty state: with nothing written every builder is empty or zero — nothing is invented', () => {
  const w = world();
  const t = LT.buildToday(w, w.now);
  assert.deepEqual([t.date, t.items, t.overdue, t.counts], [TODAY, [], [], { total: 0, done: 0, overdue: 0 }]);
  const u = LT.buildUpcoming(w, w.now);
  assert.deepEqual([u.days, u.total, u.shown, u.from, u.to], [[], 0, 0, '2026-10-07', '2026-10-20']);
  assert.deepEqual(LT.buildHealthGlance(w, w.now), { date: TODAY, checkInWritten: false, doses: { planned: 0, taken: 0, skipped: 0 }, healthEvents: 0 });
  assert.deepEqual(LT.healthGlanceLines(LT.buildHealthGlance(w, w.now)), ['오늘 안부는 아직 남기지 않았어요.', '오늘 먹을 약으로 적어 둔 것이 없어요.']);
  assert.deepEqual(LT.buildActivities(w.saved), { total: 0, items: [] });
  assert.deepEqual(LT.buildActivities(null), { total: 0, items: [] });
  assert.equal(w.backend.keys().length, 0, 'reading wrote nothing');
  const view = JS['life-view.js'];
  for (const t of ['오늘 적어 둔 일정, 루틴, 할 일이 없어요.', '동안 적어 둔 일정이나 할 일이 없어요.', '아직 적어 둔 메모가 없어요.', '저장한 프로그램이나 장소가 없어요.']) assert.ok(view.includes(t), t);
});

test('OML2-02 오늘 할 것: today\'s events, routines and tasks in time order (untimed last); 병원 일정 named by kind; overdue tasks kept apart', () => {
  const w = world();
  ok(w.schedule.add({ title: '오후 모임', time: '15:00' }));
  ok(w.schedule.add({ title: '정형외과', time: '10:00', kind: 'MEDICAL_APPOINTMENT' }));
  ok(w.schedule.add({ title: '시간 없는 일정' }));
  ok(w.routines.add({ title: '물 마시기', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], time: '08:00' }));
  ok(w.routines.add({ title: '주말 산책', daysOfWeek: [0, 6] }));
  ok(w.tasks.add({ title: '전기요금', dueDate: TODAY, time: '09:30', priority: 'important' }));
  ok(w.tasks.add({ title: '언젠가 할 일' }));
  ok(w.tasks.add({ title: '지난 할 일', dueDate: '2026-10-02' }));
  const done = ok(w.tasks.add({ title: '지난 끝낸 일', dueDate: '2026-10-01' }));
  ok(w.tasks.update(done.task.id, { completed: true }));
  ok(w.schedule.add({ title: '내일 일정', date: '2026-10-07' }));
  const t = LT.buildToday(w, w.now);
  assert.deepEqual(t.items.map((i) => [i.kind, i.title, i.time, i.label]), [
    ['routine', '물 마시기', '08:00', '루틴'],
    ['task', '전기요금', '09:30', '할 일'],
    ['event', '정형외과', '10:00', '병원 일정'],
    ['event', '오후 모임', '15:00', '일정'],
    ['event', '시간 없는 일정', '', '일정'],
  ]);
  assert.equal(t.items.find((i) => i.title === '전기요금').important, true);
  assert.deepEqual(t.overdue.map((i) => [i.title, i.dueDate]), [['지난 할 일', '2026-10-02']], 'a finished overdue task and an undated one are not listed');
  assert.deepEqual(t.counts, { total: 5, done: 0, overdue: 1 });
  assert.equal(new Set([...t.items, ...t.overdue].map((i) => i.key)).size, 6, 'every row has its own key');
});

test('OML2-03 completion actions are the stores\' own marks: done and undone, read back the same everywhere', () => {
  const w = world();
  const ev = ok(w.schedule.add({ title: '일정', time: '10:00' })).event;
  const rt = ok(w.routines.add({ title: '루틴', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] })).routine;
  const tk = ok(w.tasks.add({ title: '할 일', dueDate: TODAY })).task;
  ok(w.schedule.update(ev.id, { completed: true }));
  ok(w.routines.setCompleted(rt.id, true));
  ok(w.tasks.update(tk.id, { completed: true }));
  let t = LT.buildToday(w, w.now);
  assert.deepEqual(t.items.map((i) => i.done), [true, true, true]);
  assert.equal(w.schedule.get(ev.id).completed, true, 'the calendar reads the same mark');
  assert.equal(w.routines.isCompleted(rt.id, TODAY), true);
  ok(w.routines.setCompleted(rt.id, false));
  ok(w.tasks.update(tk.id, { completed: false }));
  t = LT.buildToday(w.reopen(), w.now);
  assert.deepEqual(t.items.map((i) => [i.kind, i.done]), [['event', true], ['routine', false], ['task', false]], 'undo, and a reload, read the same');
  /* the list on 요약 marks through exactly these calls */
  const view = code(JS['life-view.js']);
  assert.match(view, /stores\.schedule\.update\(item\.storeId, \{ completed: checked \}\)/);
  assert.match(view, /stores\.routines\.setCompleted\(item\.storeId, checked\)/);
  assert.match(view, /stores\.tasks\.update\(item\.storeId, \{ completed: checked \}\)/);
});

/* ═════════════ 2. 할 일 ═════════════ */

test('OML2-04 할 일 CRUD with the new optional time and memo: create, read, edit, complete, undo, delete, reload', () => {
  const w = world();
  const a = ok(w.tasks.add({ title: '  약국 들르기  ', dueDate: TODAY, time: '15:00', memo: '처방전 챙기기' })).task;
  assert.deepEqual([a.title, a.dueDate, a.time, a.memo, a.completed], ['약국 들르기', TODAY, '15:00', '처방전 챙기기', false]);
  ok(w.tasks.update(a.id, { title: '약국', time: '16:30', memo: '' }));
  assert.deepEqual([w.tasks.get(a.id).title, w.tasks.get(a.id).time, w.tasks.get(a.id).memo], ['약국', '16:30', '']);
  ok(w.tasks.toggle(a.id));
  assert.equal(w.reopen().tasks.get(a.id).completed, true);
  ok(w.tasks.toggle(a.id));
  assert.equal(w.reopen().tasks.get(a.id).completed, false);
  ok(w.tasks.remove(a.id));
  assert.equal(w.reopen().tasks.get(a.id), null);
  assert.deepEqual(w.tasks.remove(a.id), { ok: false, reason: 'NOT_FOUND' });
});

test('OML2-05 할 일 validation: a time needs a day; bad time and markup handled; a task written before V2 reads unchanged', () => {
  const w = world();
  assert.deepEqual(w.tasks.add({ title: '시간만', time: '10:00' }), { ok: false, reason: 'INVALID_TIME_WITHOUT_DATE' });
  assert.deepEqual(w.tasks.add({ title: '나쁜 시간', dueDate: TODAY, time: '25:99' }), { ok: false, reason: 'INVALID_TIME' });
  assert.deepEqual(w.tasks.add({ title: '   ' }), { ok: false, reason: 'INVALID_TITLE' });
  const m = ok(w.tasks.add({ title: '<b>굵게</b>', dueDate: TODAY, memo: 'x'.repeat(500) })).task;
  assert.equal(m.title, '<b>굵게</b>', 'markup is kept as text (drawn with textContent)');
  assert.equal(m.memo.length, LIFE_LIMITS.memo);
  const old = normalizeTask({ id: 'tk_old0001', title: '옛 할 일', dueDate: '2026-10-01', priority: 'normal', completed: false, createdAt: 1, updatedAt: 1 });
  assert.deepEqual([old.time, old.memo], ['', '']);
  const w2 = world({ [`${KEY_PREFIX}tasks`]: JSON.stringify({ schemaVersion: 1, items: [{ id: 'tk_old0001', title: '옛 할 일', dueDate: '2026-10-01', priority: 'normal', completed: false, createdAt: 1, updatedAt: 1 }] }) });
  assert.equal(w2.tasks.list()[0].title, '옛 할 일');
  ok(w2.tasks.update('tk_old0001', { time: '09:00' }));
  assert.equal(w2.tasks.get('tk_old0001').time, '09:00');
});

test('OML2-06 할 일 order: on the same day a task with a time comes first, in time order; the form offers 시간 and 메모', () => {
  const w = world();
  ok(w.tasks.add({ title: 'C', dueDate: TODAY }));
  ok(w.tasks.add({ title: 'B', dueDate: TODAY, time: '14:00' }));
  ok(w.tasks.add({ title: 'A', dueDate: TODAY, time: '09:00' }));
  assert.deepEqual(w.tasks.dueOn(TODAY).map((t) => t.title), ['A', 'B', 'C']);
  const plan = JS['life-plan.js'];
  assert.match(plan, /\{ name: 'time', label: '시간', type: 'time', required: false, errors: \['INVALID_TIME'\] \}/);
  assert.match(plan, /\{ name: 'memo', label: '메모', type: 'text', required: false, maxlength: LIFE_LIMITS\.memo \}/);
  assert.match(plan, /INVALID_TIME_WITHOUT_DATE: '시간을 정하려면 ‘언제까지’ 날짜도 골라 주세요\.'/);
});

/* ═════════════ 3. 루틴 ═════════════ */

test('OML2-07 루틴: create, edit, schedule by weekday, complete, undo, delete (its marks go too)', () => {
  const w = world();
  const r = ok(w.routines.add({ title: '산책', daysOfWeek: [2], time: '07:00' })).routine; /* 2026-10-06 is a Tuesday */
  assert.equal(w.routines.listForDate(TODAY).length, 1);
  assert.equal(w.routines.listForDate('2026-10-07').length, 0, 'a Wednesday has no Tuesday routine');
  ok(w.routines.update(r.id, { daysOfWeek: [2, 3] }));
  assert.equal(w.routines.listForDate('2026-10-07').length, 1);
  ok(w.routines.setCompleted(r.id, true));
  assert.equal(w.reopen().routines.isCompleted(r.id, TODAY), true);
  ok(w.routines.setCompleted(r.id, false));
  assert.equal(w.routines.isCompleted(r.id, TODAY), false);
  ok(w.routines.setCompleted(r.id, true));
  ok(w.routines.remove(r.id));
  assert.equal(JSON.stringify(w.storage.get('routineLogs', null)).includes(r.id), false);
});

test('OML2-08 routine examples are words to tap, never routines: nothing is made for the person, nothing is claimed about health', () => {
  assert.deepEqual([...ROUTINE_EXAMPLES], ['산책', '독서', '물 마시기', '취미', '운동', '전화하기']);
  const ui = code(JS['home-ui.js']);
  /* pressing an example only writes the word into the field */
  assert.match(ui, /onclick: \(\) => \{ input\.value = word; input\.focus\(\); \}/);
  assert.equal(/routines\.add|\.add\(/.test(ui), false);
  for (const f of ['life-plan.js', 'life-view.js', 'life-today.js', 'app.js']) assert.equal(/ROUTINE_EXAMPLES[^;]*\.(map|forEach)\([^)]*add/.test(code(JS[f])), false, f);
  const w = world();
  assert.equal(w.routines.count(), 0);
  assert.doesNotMatch(COPY + shown(JS['life-plan.js']), FORBIDDEN_JUDGE);
});

/* ═════════════ 4. 캘린더 · 다가오는 일정 ═════════════ */

test('OML2-09 calendar and 다가오는 일정 read one store: a 병원 일정 is the Health record itself, never a copy', () => {
  const w = world();
  const appt = ok(w.schedule.add({ title: '정형외과 진료', date: '2026-10-08', time: '14:00', kind: 'MEDICAL_APPOINTMENT' })).event;
  ok(w.schedule.add({ title: '손주 생일', date: '2026-10-08' }));
  ok(w.tasks.add({ title: '책 반납', dueDate: '2026-10-07' }));
  const before = snapshot(w);
  const u = LT.buildUpcoming(w, w.now);
  assert.equal(snapshot(w), before, 'building the list writes nothing');
  assert.deepEqual(u.days.map((d) => [d.date, d.lines.map((l) => [l.kind, l.title, l.label])]), [
    ['2026-10-07', [['task', '책 반납', '할 일']]],
    ['2026-10-08', [['event', '정형외과 진료', '병원 일정'], ['event', '손주 생일', '일정']]],
  ]);
  ok(w.schedule.update(appt.id, { title: '정형외과 재진', time: '15:00' }));
  assert.equal(LT.buildUpcoming(w, w.now).days[1].lines[0].title, '정형외과 재진', 'an edit anywhere is seen here at once');
  ok(w.schedule.remove(appt.id));
  assert.equal(LT.buildUpcoming(w, w.now).days[1].lines.length, 1, 'deleted in one place, gone everywhere');
  assert.equal(w.schedule.count(), 1);
  assert.equal(/storage\.(set|get)|createRecordList|createScheduleStore/.test(code(JS['life-today.js'])), false, 'life-today keeps no store of its own');
});

test('OML2-10 다가오는 일정 bounds: tomorrow … day 14 only, finished items left out, at most 20 lines with an honest remainder', () => {
  const w = world();
  ok(w.schedule.add({ title: '오늘', date: TODAY }));
  ok(w.schedule.add({ title: '14일째', date: addDays(TODAY, 14) }));
  ok(w.schedule.add({ title: '15일째', date: addDays(TODAY, 15) }));
  const fin = ok(w.schedule.add({ title: '끝낸 일정', date: addDays(TODAY, 2) })).event;
  ok(w.schedule.update(fin.id, { completed: true }));
  let u = LT.buildUpcoming(w, w.now);
  assert.deepEqual(u.days.flatMap((d) => d.lines.map((l) => l.title)), ['14일째']);
  for (let i = 0; i < 25; i++) ok(w.schedule.add({ title: `모임 ${i}`, date: addDays(TODAY, 3) }));
  u = LT.buildUpcoming(w, w.now);
  assert.deepEqual([u.total, u.shown], [26, LT.UPCOMING_MAX_LINES]);
  assert.match(JS['life-view.js'], /이 밖에 \$\{u\.total - u\.shown\}개가 더 있어요\./);
  assert.equal(LT.dayTitle('2026-10-07', TODAY).startsWith('내일 · '), true);
});

test('OML2-11 dates and time zones: "today" is the local day; a year boundary and the minute after midnight move every list', () => {
  const late = world(undefined, undefined, new Date(2026, 11, 31, 23, 59, 0).getTime());
  ok(late.tasks.add({ title: '해 넘기기 전', dueDate: '2026-12-31' }));
  ok(late.schedule.add({ title: '새해 첫날', date: '2027-01-01' }));
  assert.equal(LT.buildToday(late, () => new Date(2026, 11, 31, 23, 59, 30).getTime()).items.length, 1);
  assert.deepEqual(LT.buildUpcoming(late, () => new Date(2026, 11, 31, 23, 59, 30).getTime()).days.map((d) => d.date), ['2027-01-01']);
  const next = () => new Date(2027, 0, 1, 0, 1, 0).getTime();
  const t = LT.buildToday(late, next);
  assert.deepEqual([t.date, t.items.map((i) => i.title), t.overdue.map((i) => i.title)], ['2027-01-01', ['새해 첫날'], ['해 넘기기 전']]);
  assert.equal(/toISOString|getUTC|Date\.UTC/.test(code(JS['life-today.js'])), false, 'no UTC day');
});

/* ═════════════ 5. 건강 연결 (Health canonical) ═════════════ */

test('OML2-12 오늘의 건강·안부 on 요약: counts read from the Health stores — no copy, no write, no new collection', () => {
  const w = world();
  const m1 = ok(w.medication.add({ name: '아침약이름비밀', time: '08:00' })).medication;
  const m2 = ok(w.medication.add({ name: '저녁약이름비밀', time: '20:00' })).medication;
  ok(w.medication.setStatus(m1.id, 'TAKEN'));
  ok(w.medication.setStatus(m2.id, 'SKIPPED'));
  ok(w.checkIn.save({ status: 'hard', memo: '안부메모비밀' }));
  ok(w.schedule.add({ title: '내과', time: '11:00', kind: 'MEDICAL_APPOINTMENT' }));
  const before = snapshot(w);
  const g = LT.buildHealthGlance(w, w.now);
  assert.equal(snapshot(w), before, 'the glance writes nothing');
  assert.deepEqual(g, { date: TODAY, checkInWritten: true, doses: { planned: 2, taken: 1, skipped: 1 }, healthEvents: 1 });
  const text = JSON.stringify(g) + LT.healthGlanceLines(g).join('\n');
  for (const secret of ['아침약이름비밀', '저녁약이름비밀', '안부메모비밀', 'hard', '조금 힘들어요']) assert.equal(text.includes(secret), false, secret);
  assert.deepEqual(LT.healthGlanceLines(g), ['오늘 안부를 남겼어요.', '오늘 복약 2번 가운데 1번 먹었다고 표시했어요, 1번은 건너뜀으로 표시했어요.', '오늘 병원 일정·건강검진 1개가 있어요.']);
  assert.equal(COLLECTIONS.filter((c) => classOf(c) === 'HEALTH_ADJACENT').length, 6, 'no health collection was added');
  /* the summary builder of Phase 2B still reads no health store */
  const view = code(JS['life-view.js']);
  assert.equal(/checkIn|symptoms|healthNotes|medication/.test(view.slice(view.indexOf('export function buildOverview'), view.indexOf('export function createLifeView'))), false);
});

test('OML2-13 a dose is taken only when the person marked it; a check-in is a note, not a safety confirmation', () => {
  const w = world();
  ok(w.medication.add({ name: '약', time: '08:00' }));
  w.clock.t = new Date(2026, 9, 6, 21, 0).getTime();
  assert.deepEqual(LT.buildHealthGlance(w, w.now).doses, { planned: 1, taken: 0, skipped: 0 }, 'the time passing marks nothing');
  ok(w.checkIn.save({ status: 'help' }));
  const lines = LT.healthGlanceLines(LT.buildHealthGlance(w, w.now)).join('\n');
  assert.doesNotMatch(lines, FORBIDDEN_SAFETY);
  assert.equal(CHECKIN_DELIVERY.confirmsSafety, false);
  assert.match(JS['life-view.js'], /안부 기록은 내가 남기는 메모예요\. 안전을 확인하거나 누군가에게 알리는 기능은 아니에요\./);
});

/* ═════════════ 6. 기록 · 메모 ═════════════ */

test('OML2-14 기록 (life records): an optional kind — 오늘 한 일 · 다녀온 곳 · 만난 사람 · 취미 활동 · 기억하고 싶은 일 — in the one journal store', () => {
  assert.deepEqual(JOURNAL_KINDS.map((k) => k.label), ['오늘 한 일', '다녀온 곳', '만난 사람', '취미 활동', '기억하고 싶은 일']);
  const w = world();
  const e = ok(w.journal.add({ text: '시장에 다녀왔어요\n두부를 샀어요', kind: 'place', mood: 'good' })).entry;
  assert.deepEqual([e.kind, e.text], ['place', '시장에 다녀왔어요\n두부를 샀어요']);
  ok(w.journal.update(e.id, { kind: 'remember' }));
  assert.equal(w.reopen().journal.get(e.id).kind, 'remember');
  ok(w.journal.update(e.id, { kind: 'nope' }));
  assert.equal(w.journal.get(e.id).kind, '', 'an unknown kind reads as none');
  assert.equal(normalizeJournal({ id: 'jn_old00001', date: TODAY, text: '옛 기록', mood: 'okay', createdAt: 1, updatedAt: 1 }).kind, '');
  ok(w.journal.remove(e.id));
  assert.equal(w.journal.count(), 0);
  assert.equal(classOf('journal'), 'PRIVATE');
  assert.match(JS['life-records.js'], /\{ name: 'kind', label: '어떤 기록', type: 'select', required: false, options: JOURNAL_KINDS \}/);
});

test('OML2-15 메모 CRUD: create, read, edit, pin, delete — and every step survives a reload', () => {
  const w = world();
  const a = ok(w.memos.add({ text: '은행 들르기' })).memo;
  const b = ok(w.memos.add({ text: '손주 생일 선물\n동화책' })).memo;
  assert.deepEqual(w.memos.list().map((m) => m.id), [b.id, a.id], 'the most recently changed first');
  ok(w.memos.update(a.id, { pinned: true }));
  assert.deepEqual(w.reopen().memos.list().map((m) => m.id), [a.id, b.id], 'a pinned memo stays on top');
  ok(w.memos.update(b.id, { text: '손주 생일 선물\n그림책' }));
  assert.equal(w.reopen().memos.get(b.id).text, '손주 생일 선물\n그림책');
  ok(w.memos.remove(a.id));
  assert.deepEqual(w.reopen().memos.list().map((m) => m.id), [b.id]);
  assert.deepEqual(w.memos.remove(a.id), { ok: false, reason: 'NOT_FOUND' });
  assert.deepEqual(Object.keys(w.memos.get(b.id)).sort(), ['createdAt', 'id', 'pinned', 'schemaVersion', 'text', 'updatedAt']);
});

test('OML2-16 메모 validation: empty refused, markup stays text, long text clipped, line breaks kept, a limit with a clear reason', () => {
  const w = world();
  assert.deepEqual(w.memos.add({ text: '  \n ' }), { ok: false, reason: 'INVALID_TEXT' });
  assert.deepEqual(w.memos.add(null), { ok: false, reason: 'INVALID_TEXT' });
  assert.equal(ok(w.memos.add({ text: '<img src=x onerror=alert(1)>' })).memo.text, '<img src=x onerror=alert(1)>');
  assert.equal(ok(w.memos.add({ text: '가'.repeat(5000) })).memo.text.length, LIFE_LIMITS.memoText);
  assert.equal(ok(w.memos.add({ text: '첫 줄\r\n\n\n\n둘째 줄' })).memo.text, '첫 줄\n\n둘째 줄');
  assert.throws(() => normalizeMemo({ id: 'bad id', text: 'x' }), /INVALID_ID/);
  const full = world();
  for (let i = 0; i < LIFE_LIMITS.memos; i++) ok(full.memos.add({ text: `메모 ${i}` }));
  assert.deepEqual(full.memos.add({ text: '하나 더' }), { ok: false, reason: 'LIMIT' });
  assert.match(JS['life-records.js'], /LIMIT: '메모가 가득 찼습니다\. 지난 메모를 지워 주세요\.'/);
});

test('OML2-17 메모에서 찾기: the notes on this device only — every word must appear, case ignored; the words are kept nowhere', () => {
  const w = world();
  ok(w.memos.add({ text: 'Bank 비밀번호 바꾸기' }));
  ok(w.memos.add({ text: '손주 선물 동화책' }));
  const before = snapshot(w);
  assert.deepEqual(w.memos.filter('bank 바꾸기').map((m) => m.text), ['Bank 비밀번호 바꾸기']);
  assert.deepEqual(w.memos.filter('동화책 없는말').length, 0);
  assert.equal(w.memos.filter('').length, 2);
  assert.equal(w.memos.filter('   ').length, 2);
  assert.equal(memoMatches({ text: 'abc' }, null), true);
  assert.equal(snapshot(w), before, 'a search writes nothing');
  const rec = code(JS['life-records.js']);
  assert.equal(/location|history\.|storage\.|track\(|analytics/.test(rec.slice(rec.indexOf('export function createMemosSection'))), false, 'the words go into no address, storage or counter');
  assert.match(JS['life-records.js'], /이 기기의 메모 안에서만 찾아요\./);
});

/* ═════════════ 7. 저장 손상 · 중복 · 긴 글 ═════════════ */

test('OML2-18 corrupt storage: invalid JSON, wrong shapes, broken and duplicate records — the rest still reads and the screen still works', () => {
  for (const raw of ['{not json', '"x"', '[]', '{"items":"nope"}', 'null']) {
    const w = world({ [`${KEY_PREFIX}memos`]: raw, [`${KEY_PREFIX}tasks`]: raw, [`${KEY_PREFIX}journal`]: raw });
    assert.deepEqual([w.memos.list(), w.tasks.list(), w.journal.recent()], [[], [], []], raw);
    ok(w.memos.add({ text: '다시 적기' }));
    assert.equal(w.memos.count(), 1);
    assert.doesNotThrow(() => LT.buildToday(w, w.now));
  }
  const items = [{ id: 'mm_good0001', text: '좋은 메모', createdAt: 5, updatedAt: 5 }, { id: 'mm_good0001', text: '같은 id', createdAt: 6, updatedAt: 6 }, { id: 'bad', text: 'x' }, { id: 'mm_empty001', text: '' }, 7, null, { id: 'mm_pin00001', text: '고정', pinned: 'yes', createdAt: 1, updatedAt: 1 }];
  const w = world({ [`${KEY_PREFIX}memos`]: JSON.stringify({ schemaVersion: 1, items }) });
  assert.deepEqual(w.memos.list().map((m) => [m.id, m.text, m.pinned]), [['mm_good0001', '좋은 메모', false], ['mm_pin00001', '고정', false]], 'one copy of a duplicated id; "yes" is not true');
});

test('OML2-19 one broken task or journal entry (bad time, bad kind, bad date) never takes the others down', () => {
  const tasks = [{ id: 'tk_aaaa0001', title: '좋은 할 일', dueDate: TODAY, time: '09:00', createdAt: 1, updatedAt: 1 }, { id: 'tk_aaaa0002', title: '나쁜 시간', dueDate: TODAY, time: '9시', createdAt: 1, updatedAt: 1 }, { id: 'tk_aaaa0003', title: '날짜 없는 시간', time: '10:00', createdAt: 1, updatedAt: 1 }, { id: 'tk_aaaa0001', title: '중복', createdAt: 1, updatedAt: 1 }];
  const journal = [{ id: 'jn_aaaa0001', date: TODAY, text: '좋은 기록', kind: 'hobby', createdAt: 1, updatedAt: 1 }, { id: 'jn_aaaa0002', date: '2026-13-40', text: '나쁜 날짜', createdAt: 1, updatedAt: 1 }, { id: 'jn_aaaa0003', date: TODAY, text: '모르는 종류', kind: '<x>', createdAt: 1, updatedAt: 1 }];
  const w = world({ [`${KEY_PREFIX}tasks`]: JSON.stringify({ items: tasks }), [`${KEY_PREFIX}journal`]: JSON.stringify({ items: journal }) });
  assert.deepEqual(w.tasks.list().map((t) => t.title), ['좋은 할 일']);
  assert.deepEqual(w.journal.recent().map((e) => [e.text, e.kind]).sort(), [['모르는 종류', ''], ['좋은 기록', 'hobby']]);
  assert.equal(LT.buildToday(w, w.now).items.length, 1);
});

test('OML2-20 long Korean text: titles and memos are clipped to their limits, the memo row title to its first line', () => {
  const w = world();
  const t = ok(w.tasks.add({ title: '가'.repeat(300), dueDate: TODAY })).task;
  assert.equal(t.title.length, LIFE_LIMITS.taskTitle);
  assert.match(JS['life-records.js'], /title: item\.text\.split\('\\n'\)\[0\]\.slice\(0, 40\)/);
  assert.match(JS['life-records.js'], /maxlength: LIFE_LIMITS\.memoText/);
  assert.equal(LT.formatDateTimeShort(new Date(2026, 9, 6, 14, 5).getTime()), '10월 6일 오후 2:05');
  assert.equal(LT.formatDateTimeShort(-1), '');
});

/* ═════════════ 8. 개인정보 · 경계 ═════════════ */

test('OML2-21 privacy class: 메모 is PRIVATE — never synced, searched, shared with family; erase removes it with everything else', () => {
  assert.equal(CLASSIFICATION.memos, 'PRIVATE');
  assert.equal(CONTRACT_CLASSES.Memo, 'PRIVATE');
  assert.deepEqual([maySync('memos'), maySearchGlobally('memos'), familySharingAllowed('memos'), isSyncable('memos')], [false, false, false, false]);
  assert.equal(COLLECTIONS.includes('memos'), true);
  assert.equal(COLLECTIONS[COLLECTIONS.length - 1], 'analytics');
  const w = world({ 'livon.keep': 'L' });
  ok(w.memos.add({ text: '지울 메모' }));
  ok(w.tasks.add({ title: '지울 할 일' }));
  assert.equal(w.storage.clear(), true);
  assert.deepEqual([w.memos.count(), w.tasks.count(), w.backend.getItem('livon.keep')], [0, 0, 'L']);
});

test('OML2-22 search privacy: memos, records, tasks, routines and events never reach the global search', async () => {
  const w = world();
  ok(w.memos.add({ text: '검색비밀메모QQ' }));
  ok(w.journal.add({ text: '검색비밀기록QQ', kind: 'people' }));
  ok(w.tasks.add({ title: '검색비밀할일QQ', memo: '검색비밀할일메모QQ', dueDate: TODAY, time: '10:00' }));
  ok(w.schedule.add({ title: '검색비밀일정QQ' }));
  ok(w.routines.add({ title: '검색비밀루틴QQ', daysOfWeek: [2] }));
  const s = createSearch();
  s.registerProvider(createAreaProvider(AREAS));
  s.registerProvider(createSavedProvider(w.saved));
  for (const q of ['검색비밀메모QQ', '검색비밀기록QQ', '검색비밀할일QQ', '검색비밀할일메모QQ', '검색비밀일정QQ', '검색비밀루틴QQ']) assert.deepEqual((await s.query(q)).results, [], q);
  assert.equal(/memos|createMemoStore/.test(code(JS['search.js'])), false);
  assert.equal((APP.match(/search\.registerProvider\(/g) || []).length, 5, 'no provider was added');
});

test('OML2-23 family boundary: no My Life V2 record is a sharing category; 일정·할 일·루틴·생활 stay off until the person turns them on', () => {
  const w = world();
  ok(w.memos.add({ text: '가족비밀메모QQ' }));
  ok(w.journal.add({ text: '가족비밀기록QQ' }));
  ok(w.tasks.add({ title: '가족비밀할일QQ', memo: '가족비밀할일메모QQ', dueDate: TODAY }));
  const repository = createLocalFamilyRepository(w.storage, { now: w.now });
  const service = createFamilyService({ repository, sources: { checkIn: w.checkIn, schedule: w.schedule, medication: w.medication, dailyLife: w.dailyLife, sleep: w.sleep }, now: w.now });
  const inv = service.createInvitation({ displayName: '큰딸', relationship: 'child' });
  const member = service.acceptInvitation(inv.code).member;
  const levels = service.levels(member.id);
  /* the Family V1 engine: every category is off until the person turns it on, per member */
  assert.ok(service.categoryIds.length >= 10);
  for (const c of service.categoryIds) assert.equal(levels[c], 'NONE', `${c} is off by default`);
  /* 메모, 기록, 할 일 and 루틴 are no category of the engine; 메모 and 기록 none of the Phase 4 list either */
  assert.equal(service.categoryIds.some((c) => /MEMO|JOURNAL|RECORD|TASK|ROUTINE/.test(c)), false);
  assert.equal(SHARE_CATEGORIES.some((c) => /MEMO|JOURNAL|RECORD/.test(c.id)), false);
  assert.ok(NEVER_SHARED.includes('기록(일기)'));
  const preview = JSON.stringify(service.previewFor(member.id));
  for (const secret of ['가족비밀메모QQ', '가족비밀기록QQ', '가족비밀할일QQ', '가족비밀할일메모QQ']) assert.equal(preview.includes(secret), false, secret);
  for (const [f, src] of Object.entries(JS)) if (f.startsWith('family')) assert.equal(/memos|life-today|createMemoStore/.test(code(src)), false, f);
});

test('OML2-24 community boundary: no private record becomes a post; community and My Life import nothing from each other', () => {
  for (const f of ['community.js', 'community-view.js', 'community-contracts.js']) assert.equal(/memos|journal|tasks|routines|life-today|life-view|life-records|life-plan|schedule/.test([...code(JS[f]).matchAll(/from '([^']+)'/g)].map((m) => m[1]).join(' ')), false, f);
  for (const f of [...NEW_MODULES, 'life-view.js', 'life-records.js', 'life-plan.js']) assert.equal(/community/.test([...code(JS[f]).matchAll(/from '([^']+)'/g)].map((m) => m[1]).join(' ')), false, f);
  assert.equal(COMMUNITY_REMOTE_CONTRACT.status, 'CONTRACT_ONLY', 'Community V2 is unchanged: remote is a contract only');
  assert.equal(/communityPosts|createPostStore/.test(code(JS['life-view.js'] + JS['life-today.js'] + JS['memos.js'])), false);
});

test('OML2-25 ONGIL AI boundary: the assistant is given no memo, record or expense; it calls nothing in My Life V2; no provider is switched on', () => {
  const call = APP.slice(APP.indexOf('const assistant = createAssistant('), APP.indexOf(');', APP.indexOf('const assistant = createAssistant(')));
  assert.equal(/memos|journal|expenses|checkIn|medication/.test(call), false, call);
  for (const f of ['assistant-tools.js', 'assistant-intents.js', 'assistant-view.js']) assert.equal(/memos|createMemoStore|life-today/.test(code(JS[f])), false, f);
  for (const c of ['journal', 'expenses']) assert.ok(NO_WRITE_AREAS.includes(c), c);
  for (const f of V2_MODULES) assert.equal(/assistant/.test([...code(JS[f]).matchAll(/from '([^']+)'/g)].map((m) => m[1]).join(' ')), false, f);
  assert.equal(/OPENAI|openai|anthropic|api\.openai/i.test(V2_MODULES.map((f) => code(JS[f])).join('\n')), false);
});

test('OML2-26 analytics: My Life V2 counts nothing by content — no event name, no text, no search words', () => {
  for (const f of NEW_MODULES.concat(['life-records.js', 'life-view.js'])) assert.equal(/track\(|analytics|instrument/.test(code(JS[f])), false, f);
  assert.equal(/memos/.test(code(JS['analytics.js'] + JS['instrument.js'])), false);
});

test('OML2-27 no network and no device sensors: no request, beacon, socket, dynamic import, location, camera or microphone', () => {
  const src = V2_MODULES.map((f) => code(JS[f])).join('\n');
  assert.equal(/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|import\(|navigator\.geolocation|getUserMedia|mediaDevices|Notification\.|serviceWorker|PushManager/.test(src), false);
});

test('OML2-28 no My Life data in an address: 내 생활 addresses name a section only; memo search and records never touch location', () => {
  for (const s of LIFE_SECTIONS) assert.match(lifeHash(s), /^#life(\/[a-z-]+)?$/);
  assert.equal(lifeHash('memos'), '#life/memos');
  assert.equal(resolveSection('memos'), 'memos');
  assert.equal(resolveSection('<memo>'), '');
  for (const f of NEW_MODULES.concat(['life-records.js'])) assert.equal(/location\.|history\.(push|replace)State/.test(code(JS[f])), false, f);
  assert.deepEqual([...LIFE_GROUPS.find((g) => g.id === 'records').sections], ['expenses', 'journal', 'memos']);
});

test('OML2-29 local-first, said plainly: the records stay on this device; no sync, backup or cloud is claimed anywhere', () => {
  assert.match(LIFE_LOCAL_NOTE, /이 기기에만 저장돼요\. 다른 기기와 맞추거나 백업하지 않아요\./);
  assert.match(LIFE_LOCAL_NOTE, /메모·기록·생활비는 가족, 커뮤니티, ONGIL 도우미에게 보이지 않아요\./);
  assert.match(LIFE_LOCAL_NOTE, /가족 화면에서 내가 직접 켠 것만/);
  assert.doesNotMatch(COPY, FORBIDDEN_FAKE);
  assert.equal(COLLECTIONS.filter(isSyncable).includes('memos'), false);
});

test('OML2-30 copy audit: no false safety, fake success, booking, participation, score or judgement in any My Life V2 line', () => {
  assert.doesNotMatch(COPY, FORBIDDEN_SAFETY);
  assert.doesNotMatch(COPY, FORBIDDEN_FAKE);
  assert.doesNotMatch(COPY, FORBIDDEN_JUDGE);
  assert.doesNotMatch(COPY, /고혈압|당뇨|진단|처방|복용량/);
  assert.match(JS['life-view.js'], /저장만 해 둔 것이에요\. 신청이나 예약은 ONGIL이 하지 않아요\./);
});

test('OML2-31 관심 활동: only programmes and places the person saved, newest first, at most three — a bookmark, not a booking', () => {
  const w = world();
  ok(w.saved.save({ type: 'PROGRAM', id: 'p1', title: '복지관 노래 교실' }));
  ok(w.saved.save({ type: 'PLACE', id: 'pl1', title: '동네 공원' }));
  ok(w.saved.save({ type: 'PRODUCT', id: 'x1', title: '상품은 아님' }));
  ok(w.saved.save({ type: 'PROGRAM', id: 'p2', title: '서예 교실' }));
  ok(w.saved.save({ type: 'PROGRAM', id: 'p3', title: '스마트폰 교실' }));
  const a = LT.buildActivities(w.saved);
  assert.equal(a.total, 4);
  assert.deepEqual(a.items.map((i) => i.title), ['스마트폰 교실', '서예 교실', '동네 공원']);
  assert.deepEqual(Object.keys(a.items[0]).sort(), ['label', 'title']);
  assert.equal(/saved\.(save|toggle|unsave)/.test(code(JS['life-today.js'] + JS['life-view.js'])), false, 'My Life only reads 저장');
});

/* ═════════════ 9. 보존 (Health V2 · Family V2 · Community V2 · LIVON) ═════════════ */

test('OML2-32 Health · Safety V2 preserved: its modules import nothing of My Life V2 and its fixed words are unchanged', async () => {
  const HV = await import('../../ongil-start/js/health-safety-view.js');
  assert.equal(HV.CHECKIN_IS_NOT_SAFETY, '안부 기록은 내가 남기는 메모예요. 안전을 확인하거나 누군가에게 알리는 기능은 아니에요.');
  assert.deepEqual([...HV.HEALTH_SHARE_CATEGORIES], ['CHECK_IN', 'MEDICATION', 'HEALTH', 'CHECKUP', 'HELP_REQUEST']);
  for (const [f, src] of Object.entries(JS)) if (/^health-|^checkin|^medication|^symptoms/.test(f)) assert.equal(/memos|life-today/.test(code(src)), false, f);
  assert.equal(/health-safety-view/.test(code(JS['life-today.js'] + JS['life-view.js'])), false);
  assert.deepEqual(COLLECTIONS.filter((c) => classOf(c) === 'HEALTH_ADJACENT').sort(), ['checkins', 'healthMeasures', 'healthNotes', 'medicationLogs', 'medications', 'symptoms']);
});

test('OML2-33 Family V2 preserved: server, API and migrations in place, race protection and limit codes unchanged', () => {
  const http = read('server/ongil/family/http.mjs');
  assert.match(http, /export const LIMIT_SQLSTATE = Object\.freeze\(\{ members: 'OGF01', invitations: 'OGF02' \}\);/);
  const m2 = read('server/ongil/family/migrations/002_family_limits.sql');
  assert.equal((m2.match(/pg_advisory_xact_lock/g) || []).length, 2);
  assert.match(m2, /errcode = 'OGF01'/);
  assert.match(m2, /errcode = 'OGF02'/);
  assert.ok(fs.existsSync(path.join(ROOT, 'server/ongil/family/migrations/001_family.sql')));
  assert.ok(fs.existsSync(path.join(ROOT, 'api/ongil/family.mjs')));
  assert.equal(/memos|life-today/.test(read('server/ongil/family/store.mjs') + read('api/ongil/family.mjs')), false);
});

test('OML2-34 Community V2 and LIVON preserved: the new modules reach only ONGIL\'s own files; no LIVON or shared code is used', () => {
  for (const f of NEW_MODULES) for (const m of code(JS[f]).matchAll(/from '([^']+)'/g)) assert.match(m[1], /^\.\/[a-z-]+\.js$/, `${f} → ${m[1]}`);
  assert.equal(/livon|newon-auth|firebase/i.test(V2_MODULES.map((f) => code(JS[f])).join('\n')), false);
  assert.ok(fs.existsSync(path.join(ROOT, 'tests/ongil/community-v2.test.mjs')));
});

/* ═════════════ 10. 캐시 · 보안 · 문서 ═════════════ */

test('OML2-35 cache: the official generator reports the import map current, the two new modules are in it, the entry moved on', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/ongil-module-versions.mjs')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const f of NEW_MODULES) assert.match(INDEX, new RegExp(`"/ongil-start/js/${f.replace('.', '\\.')}": "/ongil-start/js/${f.replace('.', '\\.')}\\?v=[0-9a-f]{12}"`), f);
  assert.match(INDEX, /<script type="module" src="\/ongil-start\/js\/app\.js\?v=20261006m15"><\/script>/, 'app.js changed: BEFORE 20261005h14, AFTER 20261006m15');
  assert.equal(/serviceWorker|caches\.open/.test(V2_MODULES.map((f) => code(JS[f])).join('\n') + INDEX), false, 'no service worker');
});

test('OML2-36 security: no eval, Function, innerHTML, javascript: URL, console or dynamic HTML in the modules My Life V2 changed', () => {
  for (const f of V2_MODULES) {
    const c = code(JS[f]);
    assert.equal(/\beval\(|new Function|Function\(|innerHTML|outerHTML|insertAdjacentHTML|document\.write|javascript:|console\./.test(c), false, f);
  }
  /* the only links the new cards add are in-app addresses */
  for (const m of code(JS['life-view.js']).matchAll(/href: '([^']+)'/g)) assert.match(m[1], /^#[a-z]+(\/[a-z-]+)?$/, m[1]);
});

test('OML2-37 documentation: the My Life V2 document records the architecture and every boundary', () => {
  const doc = read('docs/ongil/ONGIL_MY_LIFE_V2.md');
  for (const h of ['AUDIT', 'ARCHITECTURE', 'CANONICAL DATA', 'TODAY', 'TASKS', 'ROUTINES', 'CALENDAR', 'LIFE RECORDS', 'MEMO', 'ACTIVITIES', 'HEALTH CONNECTION', 'FAMILY', 'COMMUNITY', 'AI', 'LOCAL-FIRST', 'PRIVACY', 'SENIOR UX', 'CACHE', 'TESTS', 'KNOWN LIMITATIONS']) assert.match(doc, new RegExp(`^## \\d+\\. ${h}`, 'm'), h);
  assert.match(doc, /REMOTE SYNC = NOT IMPLEMENTED/);
  assert.match(doc, /AI ACCESS TO MY LIFE V2 RECORDS = NONE/);
});

test('OML2-38 cleanup: no QA data, fixture or person\'s record in the published source', () => {
  for (const f of NEW_MODULES) assert.doesNotMatch(JS[f], /QA|테스트용|fixture|example\.test/i, f);
  assert.doesNotMatch(INDEX, /"memos"|검색비밀|가족비밀/);
});

/* ═════════════ 11. 브라우저 (Chromium) ═════════════ */

const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const skip = !(fs.existsSync(PW) && fs.existsSync(CHROME)) && 'no local Chromium';
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
async function page(width, hash = '#life', { ctx: given, height = 900 } = {}) {
  await boot();
  const ctx = given || (await B.newContext({ viewport: { width, height }, reducedMotion: 'reduce' }));
  await ctx.route('**/*', (r) => (r.request().url().startsWith(BASE) ? r.continue() : r.abort()));
  const pg = await ctx.newPage();
  pg._errors = []; pg.on('pageerror', (e) => pg._errors.push(e.message));
  await pg.goto(`${BASE}/ongil-start/${hash}`, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  return pg;
}
const go = async (pg, hash) => { await pg.evaluate((h) => { location.hash = h; }, hash); await pg.waitForTimeout(300); };
/* a checkbox is reached through its label, which carries the 44px row height (the existing Home and My Life lists) */
const layout = (pg, scope) => pg.evaluate((scope) => {
  const vis = (e) => { const s = getComputedStyle(e); const b = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && !e.closest('[hidden]'); };
  const root = document.querySelector(scope);
  const inter = [...root.querySelectorAll('a[href],button,input,select,textarea')].filter(vis);
  const small = inter.filter((e) => {
    const b = e.getBoundingClientRect();
    if (e.type === 'checkbox') { const l = (e.id && document.querySelector(`label[for="${e.id}"]`)) || e.closest('label'); return !l || l.getBoundingClientRect().height < 44 || l.getBoundingClientRect().width < 44; }
    return b.height < 44 || b.width < 44;
  }).map((e) => e.outerHTML.slice(0, 80));
  const clipped = [...root.querySelectorAll('p,li,h3,h4,button,a')].filter(vis).filter((e) => !e.closest('.visually-hidden')).filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'hidden').map((e) => e.textContent.slice(0, 30));
  return { over: document.documentElement.scrollWidth - document.documentElement.clientWidth, small, clipped, text: root.innerText };
}, scope);
const LIFE = '[data-og-modules="life"]';
async function fill(pg) {
  await pg.evaluate(() => {
    const O = window.Ongil;
    const d = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
    O.schedule.add({ title: '동네 복지관 노래 교실 가는 날이에요'.repeat(2), time: '10:00' });
    O.schedule.add({ title: '정형외과 정기 진료', date: d(2), time: '14:00', kind: 'MEDICAL_APPOINTMENT' });
    O.tasks.add({ title: '전기요금 내기아주긴할일제목입니다아주긴할일제목입니다', dueDate: d(0), time: '09:30', memo: '은행 앱으로' });
    O.tasks.add({ title: '지난주 할 일', dueDate: d(-3) });
    O.tasks.add({ title: '도서관 책 반납', dueDate: d(3) });
    O.routines.add({ title: '물 마시기', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], time: '08:00' });
    O.medication.add({ name: '브라우저비밀약이름', time: '08:00' });
    O.memos.add({ text: '브라우저비밀메모\n둘째 줄'.repeat(3) });
    O.journal.add({ text: '시장에 다녀왔어요', kind: 'place' });
    O.saved.save({ type: 'PROGRAM', id: 'qa-p1', title: '복지관 서예 교실' });
  });
  await go(pg, '#ongil-home');
  await go(pg, '#life');
}

for (const [id, w] of [['OML2-39', 320], ['OML2-40', 390], ['OML2-41', 768], ['OML2-42', 1024], ['OML2-43', 1440]]) {
  test(`${id} browser ${w}px: 요약 empty and filled, 할 일 and 메모 forms, a delete confirmation, the calendar — no overflow, targets ≥ 44px`, { skip }, async () => {
    const pg = await page(w);
    const steps = [
      ['empty', '#life', null],
      ['filled', '#life', () => fill(pg)],
      ['task form', '#life/tasks', async () => { await pg.locator(`${LIFE} [data-og-slot="life.tasks"] [data-og-focus="add"]`).click(); await pg.waitForTimeout(150); }],
      ['memo form', '#life/memos', async () => { await pg.locator(`${LIFE} [data-og-slot="life.memos"] [data-og-focus="add"]`).click(); await pg.waitForTimeout(150); }],
      ['memo confirm', '#life/memos', async () => { await pg.locator(`${LIFE} [data-og-slot="life.memos"] [data-og-focus^="delete:"]`).first().click(); await pg.waitForTimeout(150); }],
      ['routine form', '#life/routines', async () => { await pg.locator(`${LIFE} [data-og-slot="life.routine-manage"] [data-og-focus="add"]`).click(); await pg.waitForTimeout(150); }],
      ['calendar', '#life/calendar', null],
    ];
    for (const [step, hash, act] of steps) {
      if (step !== 'filled') await go(pg, hash);
      if (act) await act();
      const r = await layout(pg, LIFE);
      assert.equal(r.over, 0, `${w} ${step}: page overflow ${r.over}px`);
      assert.deepEqual(r.small, [], `${w} ${step}: small targets`);
      assert.deepEqual(r.clipped, [], `${w} ${step}: clipped text`);
      assert.doesNotMatch(r.text, FORBIDDEN_SAFETY);
      assert.doesNotMatch(r.text, FORBIDDEN_FAKE);
      if (step === 'empty') for (const t of ['오늘 적어 둔 일정, 루틴, 할 일이 없어요.', '동안 적어 둔 일정이나 할 일이 없어요.', '아직 적어 둔 메모가 없어요.', '저장한 프로그램이나 장소가 없어요.', '오늘 안부는 아직 남기지 않았어요.', '이 기기에만 저장돼요.']) assert.ok(r.text.includes(t), `${w} empty: ${t}`);
      if (step === 'filled') {
        for (const t of ['전기요금 내기', '지난주 할 일', '물 마시기', '정형외과 정기 진료', '병원 일정', '도서관 책 반납', '적어 둔 메모 1개', '복지관 서예 교실', '오늘 복약 1번 가운데 0번']) assert.ok(r.text.includes(t), `${w} filled: ${t}`);
        const overview = await pg.locator('#og-life-panel-overview').innerText();
        for (const secret of ['브라우저비밀약이름', '브라우저비밀메모', '시장에 다녀왔어요']) assert.equal(overview.includes(secret), false, `요약 never shows ${secret}`);
      }
      if (step === 'routine form') assert.ok(r.text.includes('산책') && r.text.includes('전화하기'), 'examples are offered');
    }
    assert.deepEqual(pg._errors, []);
    await pg.context().close();
  });
}

test('OML2-44 browser keyboard: mark a row of 오늘 할 것 with Space, write a memo, leave a form with Escape — focus returns each time', { skip }, async () => {
  const pg = await page(390);
  await pg.evaluate(() => window.Ongil.routines.add({ title: '키보드 루틴', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }));
  await go(pg, '#ongil-home'); await go(pg, '#life');
  const box = pg.locator(`${LIFE} [data-og-slot="life.today"] .og-home-item__check`).first();
  await box.focus(); await pg.keyboard.press('Space'); await pg.waitForTimeout(200);
  assert.equal(await pg.evaluate(() => window.Ongil.routines.listForDate()[0].completed), true);
  assert.equal(await pg.evaluate(() => document.activeElement.classList.contains('og-home-item__check')), true, 'focus stays on the row');
  assert.match(await pg.locator(`${LIFE} [data-og-slot="life.today"] .og-home-card__status, ${LIFE} [data-og-slot="life.today"] [role="status"]`).first().innerText(), /오늘 한 루틴으로 표시했습니다/);
  await go(pg, '#life/memos');
  const add = pg.locator(`${LIFE} [data-og-slot="life.memos"] [data-og-focus="add"]`);
  await add.focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(150);
  assert.equal(await pg.evaluate(() => document.activeElement.name), 'text', 'the form opens on its first field');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  assert.equal(await pg.evaluate(() => document.activeElement.dataset.ogFocus), 'add', 'Escape returns to the button that opened the form');
  await pg.keyboard.press('Enter'); await pg.waitForTimeout(150);
  await pg.keyboard.type('키보드 메모');
  await pg.keyboard.press('Tab'); await pg.keyboard.press('Tab'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(200);
  assert.equal(await pg.evaluate(() => window.Ongil.memos.count()), 1);
  await pg.locator(`${LIFE} [data-og-slot="life.memos"] [data-og-focus^="delete:"]`).first().focus();
  await pg.keyboard.press('Enter'); await pg.waitForTimeout(150);
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  assert.match(await pg.evaluate(() => document.activeElement.dataset.ogFocus || ''), /^delete:/, 'the delete confirmation answers Escape and returns focus');
  assert.equal(await pg.evaluate(() => window.Ongil.memos.count()), 1, 'nothing was deleted');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('OML2-45 browser forms: an error is tied to its field and announced; a status line is polite; a visible focus ring', { skip }, async () => {
  const pg = await page(390, '#life/tasks');
  const card = `${LIFE} [data-og-slot="life.tasks"]`;
  await pg.locator(`${card} [data-og-focus="add"]`).click(); await pg.waitForTimeout(150);
  await pg.fill(`${card} input[name=title]`, '시간만 있는 할 일');
  await pg.fill(`${card} input[name=time]`, '10:00');
  await pg.locator(`${card} button[type=submit]`).click(); await pg.waitForTimeout(150);
  const err = await pg.evaluate((card) => {
    const date = document.querySelector(`${card} input[name=dueDate]`);
    const e = document.querySelector(`${card} .og-form-error`);
    return { invalid: date.getAttribute('aria-invalid'), described: (date.getAttribute('aria-describedby') || '').includes(e.id), role: e.getAttribute('role'), text: e.textContent, focused: document.activeElement === date };
  }, card);
  assert.deepEqual(err, { invalid: 'true', described: true, role: 'alert', text: '시간을 정하려면 ‘언제까지’ 날짜도 골라 주세요.', focused: true });
  const ring = await pg.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' || s.boxShadow !== 'none'; });
  assert.equal(ring, true, 'the focused field shows a ring');
  assert.equal(await pg.evaluate(() => window.Ongil.tasks.count()), 0, 'nothing was saved');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('OML2-46 browser 200% text at 320px: 요약, 메모 and 할 일 still fit — nothing overflows or is clipped', { skip }, async () => {
  const pg = await page(320);
  await fill(pg);
  await pg.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  for (const hash of ['#life', '#life/memos', '#life/tasks']) {
    await go(pg, hash);
    const r = await layout(pg, LIFE);
    assert.equal(r.over, 0, `${hash}: overflow ${r.over}px`);
    assert.deepEqual(r.clipped, [], hash);
  }
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('OML2-47 browser reload: a memo, a timed task with its memo, a record\'s kind and today\'s marks survive a reload', { skip }, async () => {
  await boot();
  const ctx = await B.newContext({ viewport: { width: 390, height: 900 } });
  const pg = await page(390, '#life', { ctx });
  await pg.evaluate(() => {
    const O = window.Ongil;
    const d = new Date(); const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    O.memos.add({ text: '다시 열어도 있는 메모', pinned: true });
    const t = O.tasks.add({ title: '다시 열어도 있는 할 일', dueDate: today, time: '18:00', memo: '메모도' });
    O.tasks.update(t.task.id, { completed: true });
    O.journal.add({ text: '친구를 만났어요', kind: 'people' });
  });
  await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  const back = await pg.evaluate(() => { const O = window.Ongil; const t = O.tasks.list()[0]; return [O.memos.list()[0].text, O.memos.list()[0].pinned, t.time, t.memo, t.completed, O.journal.recent()[0].kind]; });
  assert.deepEqual(back, ['다시 열어도 있는 메모', true, '18:00', '메모도', true, 'people']);
  await go(pg, '#ongil-home'); await go(pg, '#life');
  assert.match(await pg.locator(`${LIFE} [data-og-slot="life.today"]`).innerText(), /다시 열어도 있는 할 일\s*\(했어요\)/);
  assert.deepEqual(pg._errors, []);
  await ctx.close();
});

test('OML2-48 browser privacy: nothing leaves the page while 내 생활 is used; the address holds no record or search words', { skip }, async () => {
  await boot();
  const ctx = await B.newContext({ viewport: { width: 390, height: 900 } });
  const outside = [];
  const api = [];
  ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:')) outside.push(u); else if (/\/api\/|\/server\//.test(u)) api.push(u); });
  const pg = await page(390, '#life', { ctx });
  await fill(pg);
  await pg.locator(`${LIFE} [data-og-slot="life.today"] .og-home-item__check`).first().check(); await pg.waitForTimeout(150);
  await go(pg, '#life/memos');
  await pg.locator('[data-og-memo-search]').fill('브라우저비밀'); await pg.waitForTimeout(150);
  assert.equal(await pg.evaluate(() => location.hash), '#life/memos');
  assert.equal(await pg.evaluate(() => location.href.includes('브라우저') || location.href.includes('%EB')), false);
  assert.deepEqual(api, [], 'no API call');
  assert.deepEqual(outside.filter((u) => !/fonts\.g|cloudfront|film/.test(u)), [], 'no outside host besides the page fonts/film already used');
  const stored = await pg.evaluate(() => Object.keys(localStorage).filter((k) => /search|query/i.test(k)));
  assert.deepEqual(stored, [], 'the memo search words are not stored');
  await ctx.close();
});

test('OML2-49 browser Health connection: a dose marked on 건강·안부 is counted on 요약 — the name never is; the Health home is unchanged', { skip }, async () => {
  const pg = await page(390, '#health');
  await pg.evaluate(() => window.Ongil.medication.add({ name: '연결비밀약', time: '08:00' }));
  await go(pg, '#ongil-home'); await go(pg, '#health');
  await pg.locator('[data-og-health-home] button:has-text("먹었어요")').first().click(); await pg.waitForTimeout(200);
  await go(pg, '#life');
  const text = await pg.locator('#og-life-panel-overview').innerText();
  assert.ok(text.includes('오늘 복약 1번 가운데 1번 먹었다고 표시했어요.'), text.slice(0, 400));
  assert.equal(text.includes('연결비밀약'), false);
  await go(pg, '#health');
  assert.ok((await pg.locator('[data-og-health-home]').innerText()).includes('연결된 기기 없음.'), 'Health V2 home still renders');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('OML2-50 browser examples: tapping 산책 fills the field only; nothing exists until 저장', { skip }, async () => {
  const pg = await page(390, '#life/routines');
  await pg.locator(`${LIFE} [data-og-slot="life.routine-manage"] [data-og-focus="add"]`).click(); await pg.waitForTimeout(150);
  await pg.locator('[data-og-example="산책"]').click();
  assert.equal(await pg.locator(`${LIFE} [data-og-slot="life.routine-manage"] input[name=title]`).inputValue(), '산책');
  assert.equal(await pg.evaluate(() => window.Ongil.routines.count()), 0);
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  assert.equal(await pg.evaluate(() => window.Ongil.routines.count()), 0, 'leaving the form makes nothing');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});
