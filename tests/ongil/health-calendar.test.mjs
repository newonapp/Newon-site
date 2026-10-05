// ONGIL Completion V2 — 건강·안부 병원 일정 · 건강검진 on the one calendar, and 내 생활 캘린더 월 · 주 · 일.
// Contract compatibility, CRUD, Health ↔ Calendar consistency, reload, privacy, date boundaries, views, 320px targets,
// keyboard and accessibility. No browser, no dependencies:  node --test tests/ongil/*.test.mjs
// The browser QA (320 / 390 / 768 / 1440: real clicks, reload, measured 44px targets) is recorded in
// docs/ongil/COMPLETION_V2.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS } from '../../ongil-start/js/storage.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { normalizeEvent, EVENT_KINDS, HEALTH_EVENT_KINDS, eventKind, isHealthEvent, eventKindLabel, LIFE_LIMITS } from '../../ongil-start/js/life-contracts.js';
import { classOf, maySync, maySearchGlobally, eventClass, eventShareableWithFamily, familySharingAllowed } from '../../ongil-start/js/privacy.js';
import { dateKey, addDays, weekOf, weekdayOf, monthGrid, shiftMonth, formatMonthDay, formatWeekRange, isDateKey } from '../../ongil-start/js/dates.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { CALENDAR_VIEWS } from '../../ongil-start/js/life-plan.js';
import { HEALTH_SCHEDULE_NOTE } from '../../ongil-start/js/health-appointments.js';
import { createToolRegistry } from '../../ongil-start/js/assistant-tools.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const code = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const JS_DIR = path.join(ROOT, 'ongil-start', 'js');
const JS = Object.fromEntries(fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).map((f) => [f, read('js', f)]));
const LIFE_CSS = read('styles', 'ongil-life.css');
const INDEX = read('index.html');

function world(seed, start = new Date(2026, 9, 4, 9, 0, 0)) {
  let t = start.getTime();
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend });
  let n = 0;
  const make = () => createScheduleStore(storage, { now: () => t, makeId: () => `ev_test${String(++n).padStart(4, '0')}` });
  return { backend, storage, schedule: make(), reopen: make, today: () => dateKey(t), set: (d) => { t = d.getTime(); } };
}

test('OG-HC-1 CalendarEvent compatibility: an old event keeps exactly its shape; a kind is optional and unknown kinds read as GENERAL', () => {
  const old = { id: 'ev_old0001', title: '친구 약속', date: '2026-10-05', time: '14:00', completed: false, createdAt: 1, updatedAt: 1 };
  const n = normalizeEvent(old, 5);
  assert.deepEqual(Object.keys(n), ['schemaVersion', 'id', 'title', 'date', 'time', 'completed', 'createdAt', 'updatedAt'], 'no new field on a GENERAL event');
  assert.equal(eventKind(n), 'GENERAL');
  assert.equal(isHealthEvent(n), false);
  /* an unknown or hostile kind never invents a health record, and its extra fields are dropped */
  for (const kind of ['', 'MEDICAL', 'general', 'HEALTH_SCREENINGX', 7, null]) {
    const x = normalizeEvent({ ...old, kind, memo: '메모', screeningType: '위내시경' }, 5);
    assert.equal('kind' in x || 'memo' in x || 'screeningType' in x, false, String(kind));
  }
  assert.deepEqual(EVENT_KINDS.map((k) => [k.id, k.label]), [['GENERAL', '일정'], ['MEDICAL_APPOINTMENT', '병원 일정'], ['HEALTH_SCREENING', '건강검진']]);
  assert.deepEqual([...HEALTH_EVENT_KINDS], ['MEDICAL_APPOINTMENT', 'HEALTH_SCREENING']);
  assert.equal(eventKindLabel('NOPE'), '일정');
  /* a health kind keeps a bounded memo; screeningType only on a screening */
  const med = normalizeEvent({ ...old, kind: 'MEDICAL_APPOINTMENT', memo: ` ${'가'.repeat(400)} `, screeningType: '무시' }, 5);
  assert.equal(med.kind, 'MEDICAL_APPOINTMENT');
  assert.equal(med.memo.length, LIFE_LIMITS.eventMemo);
  assert.equal('screeningType' in med, false);
  const scr = normalizeEvent({ ...old, kind: 'HEALTH_SCREENING', screeningType: '국가건강검진', memo: '' }, 5);
  assert.equal(scr.screeningType, '국가건강검진');
  assert.equal('memo' in scr, false, 'an empty memo is not stored');
  /* the same store and collection: no second schedule */
  assert.equal(COLLECTIONS.filter((c) => /appoint|screen|hospital|checkup|medical/i.test(c)).length, 0);
  assert.equal(/storage\.(get|set)\('(?!events')/.test(code(JS['health-appointments.js'])), false, 'the health screen never touches storage itself');
});

test('OG-HC-2 병원 일정 CRUD: add (date, time, 병원명, 진료 목적), edit, detail fields, delete, today/upcoming order', () => {
  const w = world();
  const a = w.schedule.add({ kind: 'MEDICAL_APPOINTMENT', title: '동네 내과의원', date: w.today(), time: '10:30', memo: '정기 진료' });
  assert.equal(a.ok, true);
  assert.deepEqual({ kind: a.event.kind, title: a.event.title, date: a.event.date, time: a.event.time, memo: a.event.memo }, { kind: 'MEDICAL_APPOINTMENT', title: '동네 내과의원', date: '2026-10-04', time: '10:30', memo: '정기 진료' });
  const later = w.schedule.add({ kind: 'MEDICAL_APPOINTMENT', title: '치과', date: '2026-10-20', time: '' });
  const earlier = w.schedule.add({ kind: 'MEDICAL_APPOINTMENT', title: '안과', date: '2026-10-06', time: '09:00' });
  w.schedule.add({ title: '일반 약속', date: '2026-10-05' });
  w.schedule.add({ kind: 'MEDICAL_APPOINTMENT', title: '지난 진료', date: '2026-09-01' });
  assert.deepEqual(w.schedule.listUpcoming('MEDICAL_APPOINTMENT', w.today()).map((e) => e.title), ['동네 내과의원', '안과', '치과'], 'today first, then soonest; past and general left out');
  assert.equal(w.schedule.countPast('MEDICAL_APPOINTMENT', w.today()), 1);
  /* edit keeps the kind; memo can be changed and cleared */
  const u = w.schedule.update(earlier.event.id, { title: '밝은안과', date: '2026-10-07', time: '11:00', memo: '시력 검사 결과 듣기' });
  assert.equal(u.ok, true);
  assert.equal(u.event.kind, 'MEDICAL_APPOINTMENT');
  assert.equal(w.schedule.get(earlier.event.id).memo, '시력 검사 결과 듣기');
  assert.equal('memo' in w.schedule.update(earlier.event.id, { memo: '' }).event, false);
  /* kind can not be changed by an edit */
  assert.equal(w.schedule.update(later.event.id, { kind: 'GENERAL', title: '치과' }).event.kind, 'MEDICAL_APPOINTMENT');
  /* errors */
  assert.deepEqual(w.schedule.add({ kind: 'MEDICAL_APPOINTMENT', title: ' ', date: w.today() }), { ok: false, reason: 'INVALID_TITLE' });
  assert.deepEqual(w.schedule.add({ kind: 'MEDICAL_APPOINTMENT', title: '병원', date: '2026-02-30' }), { ok: false, reason: 'INVALID_DATE' });
  assert.deepEqual(w.schedule.add({ kind: 'MEDICAL_APPOINTMENT', title: '병원', date: w.today(), time: '25:00' }), { ok: false, reason: 'INVALID_TIME' });
  /* delete */
  assert.equal(w.schedule.remove(later.event.id).ok, true);
  assert.equal(w.schedule.get(later.event.id), null);
  assert.deepEqual(w.schedule.listUpcoming('MEDICAL_APPOINTMENT', w.today()).map((e) => e.title), ['동네 내과의원', '밝은안과']);
});

test('OG-HC-3 건강검진 CRUD: 검진 종류, 기관, 준비 메모, edit, delete — kept apart from 병원 일정', () => {
  const w = world();
  const s = w.schedule.add({ kind: 'HEALTH_SCREENING', title: '○○건강검진센터', screeningType: '국가건강검진', date: '2026-10-15', time: '08:00', memo: '전날 저녁 9시부터 금식 안내를 받음' });
  assert.equal(s.ok, true);
  assert.deepEqual([s.event.kind, s.event.screeningType, s.event.memo], ['HEALTH_SCREENING', '국가건강검진', '전날 저녁 9시부터 금식 안내를 받음']);
  w.schedule.add({ kind: 'MEDICAL_APPOINTMENT', title: '내과', date: '2026-10-15' });
  assert.deepEqual(w.schedule.listUpcoming('HEALTH_SCREENING').map((e) => e.title), ['○○건강검진센터']);
  assert.deepEqual(w.schedule.listUpcoming('MEDICAL_APPOINTMENT').map((e) => e.title), ['내과']);
  const u = w.schedule.update(s.event.id, { screeningType: '위내시경', time: '07:30' });
  assert.deepEqual([u.event.screeningType, u.event.time, u.event.memo], ['위내시경', '07:30', '전날 저녁 9시부터 금식 안내를 받음']);
  assert.equal(w.schedule.remove(s.event.id).ok, true);
  assert.deepEqual(w.schedule.listUpcoming('HEALTH_SCREENING'), []);
});

test('OG-HC-4 Health ↔ Calendar: one store — added on 건강·안부, on the calendar day; edited on the calendar, the health list shows it; deleted anywhere, gone everywhere; same after reload', () => {
  const w = world();
  /* 건강·안부 → 병원 일정 추가 */
  const a = w.schedule.add({ kind: 'MEDICAL_APPOINTMENT', title: '동네 내과의원', date: '2026-10-08', time: '10:30', memo: '정기 진료' });
  assert.deepEqual(w.schedule.listForDate('2026-10-08').map((e) => e.id), [a.event.id], 'the calendar day shows it');
  assert.equal(w.schedule.countsForMonth('2026-10')['2026-10-08'], 1, 'the month grid counts it');
  /* 내 생활 캘린더 → 수정 (the calendar form sends title, date and time only) */
  w.schedule.update(a.event.id, { title: '동네 내과', date: '2026-10-09', time: '11:00' });
  const h = w.schedule.listUpcoming('MEDICAL_APPOINTMENT');
  assert.deepEqual(h.map((e) => [e.title, e.date, e.time, e.memo, e.kind]), [['동네 내과', '2026-10-09', '11:00', '정기 진료', 'MEDICAL_APPOINTMENT']], 'health shows the change, memo and kind kept');
  /* reload: a new store over the same storage reads the same records */
  const again = w.reopen();
  assert.deepEqual(again.listUpcoming('MEDICAL_APPOINTMENT'), h);
  assert.deepEqual(again.listForDate('2026-10-09').map((e) => e.id), [a.event.id]);
  /* 건강·안부 → 삭제 → the calendar no longer has it (also after reload) */
  again.remove(a.event.id);
  assert.deepEqual(w.schedule.listForDate('2026-10-09'), []);
  assert.deepEqual(w.reopen().listForDate('2026-10-09'), []);
  /* 건강검진: same round trip, deleted from the calendar side */
  const s = w.schedule.add({ kind: 'HEALTH_SCREENING', title: '검진센터', screeningType: '국가건강검진', date: '2026-10-10' });
  w.schedule.update(s.event.id, { time: '08:30' });
  assert.equal(w.reopen().listUpcoming('HEALTH_SCREENING')[0].time, '08:30');
  w.reopen().remove(s.event.id);
  assert.deepEqual(w.schedule.listUpcoming('HEALTH_SCREENING'), []);
  /* the raw stored record is the one events collection */
  const raw = w.storage.get('events', null);
  assert.ok(raw && Array.isArray(raw.items));
  /* the screens: health uses the store's own methods; the calendar edit never sends kind */
  assert.match(JS['health-appointments.js'], /getItems: \(\) => schedule\.listUpcoming\(kind, today\(\)\)/);
  assert.match(JS['health-appointments.js'], /onAdd: \(values\) => schedule\.add\(\{ kind, \.\.\.pick\(values\) \}\)/);
  assert.match(JS['life-plan.js'], /onUpdate: \(id, values\) => schedule\.update\(id, \{ title: values\.title, date: values\.date, time: values\.time \}\)/);
  assert.match(JS['app.js'], /if \(view === 'health'\) \{\s*healthSchedule\.render\(\);/, 'drawn again every time 건강·안부 opens'); // Completion V3: the same branch also redraws 긴급 연락망
  assert.match(JS['app.js'], /createHealthSchedule\(\{ host: doc\.querySelector\('\[data-og-extra="health"\]'\), schedule \}\)/, 'the same (instrumented) schedule store Home and the calendar use');
});

test('OG-HC-5 privacy: health events are HEALTH_ADJACENT records — never synced, searched, shared, indexed, counted by content, or read in detail by the assistant', async () => {
  const med = normalizeEvent({ id: 'ev_med00001', title: '비밀병원', date: '2026-10-08', kind: 'MEDICAL_APPOINTMENT', memo: '민감한 진료 내용' }, 1);
  const gen = normalizeEvent({ id: 'ev_gen00001', title: '산책', date: '2026-10-08' }, 1);
  assert.equal(eventClass(med), 'HEALTH_ADJACENT');
  assert.equal(eventClass(gen), 'STANDARD');
  assert.equal(eventShareableWithFamily(med), false);
  assert.equal(familySharingAllowed(), false);
  assert.equal(classOf('events'), 'STANDARD');
  assert.equal(maySync('events'), false);
  assert.equal(maySearchGlobally('events'), false);
  /* no search provider, family, community, notification or analytics code reads them */
  for (const f of ['search.js', 'family.js', 'family-view.js', 'community.js', 'community-view.js', 'notifications.js', 'analytics.js', 'instrument.js', 'store-view.js']) assert.equal(/listUpcoming|HEALTH_SCREENING|MEDICAL_APPOINTMENT|screeningType/.test(code(JS[f])), false, f);
  assert.equal(/track\(/.test(code(JS['health-appointments.js'])), false, 'the screen counts nothing itself');
  assert.equal(/fetch\(|XMLHttpRequest|sendBeacon|localStorage/.test(code(JS['health-appointments.js'])), false);
  /* the assistant: a health event reads as its kind only */
  const w = world();
  w.schedule.add({ kind: 'MEDICAL_APPOINTMENT', title: '비밀병원', date: w.today(), time: '10:00', memo: '민감한 진료 내용' });
  w.schedule.add({ kind: 'HEALTH_SCREENING', title: '검진기관X', screeningType: '위내시경', date: w.today() });
  w.schedule.add({ title: '산책', date: w.today(), time: '18:00' });
  const tools = createToolRegistry({ schedule: w.schedule, tasks: { dueOn: () => [], list: () => [] }, routines: { listForDate: () => [] }, saved: { list: () => [] }, search: { query: async () => ({ results: [] }) }, familyConnection: () => ({ status: 'NOT_CONNECTED' }), today: w.today });
  const out = JSON.stringify(await tools.run('get_today_schedule', {}));
  assert.match(out, /병원 일정/);
  assert.match(out, /건강검진/);
  assert.match(out, /산책/);
  for (const secret of ['비밀병원', '민감한 진료 내용', '검진기관X', '위내시경']) assert.equal(out.includes(secret), false, secret);
  /* the copy: dates only — no booking, result, judgement or advice is claimed */
  assert.match(HEALTH_SCHEDULE_NOTE, /예약을 대신하거나 확정하지 않고, 검진 결과를 판단하거나 의료 조언을 하지 않습니다\./);
  const copy = code(JS['health-appointments.js']);
  for (const word of ['예약 완료', '예약되었습니다', '정상', '비정상', '이상 소견', '위험', '진단 결과', '판정']) assert.equal(copy.includes(word), false, word);
});

test('OG-HC-6 date boundaries: local days only — after midnight, month end, year end, 29 February, Sunday/Monday week edge, far past and future', () => {
  /* 00:05 local is that local day (UTC would still be the day before in Seoul) */
  const w = world(undefined, new Date(2026, 9, 5, 0, 5, 0));
  assert.equal(w.today(), '2026-10-05');
  const a = w.schedule.add({ kind: 'MEDICAL_APPOINTMENT', title: '자정 직후 병원', time: '09:00' });
  assert.equal(a.event.date, '2026-10-05');
  assert.deepEqual(w.schedule.listUpcoming('MEDICAL_APPOINTMENT', '2026-10-05').map((e) => e.date), ['2026-10-05']);
  /* month end, year end, leap day */
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2027-01-01', -1), '2026-12-31');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addDays('2028-02-29', 1), '2028-03-01');
  assert.equal(isDateKey('2027-02-29'), false);
  assert.equal(w.schedule.add({ kind: 'HEALTH_SCREENING', title: '윤년 검진', date: '2028-02-29' }).ok, true);
  assert.equal(w.schedule.add({ kind: 'HEALTH_SCREENING', title: '없는 날', date: '2027-02-29' }).reason, 'INVALID_DATE');
  /* weeks run Sunday → Saturday: a Sunday starts its week, a Monday belongs to the Sunday before */
  assert.deepEqual(weekOf('2026-10-04'), ['2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10']);
  assert.deepEqual(weekOf('2026-10-05')[0], '2026-10-04');
  assert.deepEqual(weekOf('2026-10-03'), ['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03']);
  assert.equal(weekdayOf('2026-10-04'), 0);
  /* a week across a year */
  assert.deepEqual(weekOf('2027-01-01'), ['2026-12-27', '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02']);
  assert.equal(formatWeekRange(weekOf('2027-01-01')), '2026년 12월 27일 – 2027년 1월 2일');
  assert.equal(formatWeekRange(weekOf('2026-10-04')), '10월 4일 – 10월 10일');
  assert.equal(formatMonthDay('2028-02-29'), '2월 29일');
  /* far moves keep a real date */
  let d = '2026-10-04';
  for (let i = 0; i < 520; i++) d = addDays(d, 7);
  assert.equal(isDateKey(d), true);
  assert.equal(weekdayOf(d), 0, 'stepping by weeks stays on the same weekday');
  for (let i = 0; i < 1040; i++) d = addDays(d, -7);
  assert.equal(weekdayOf(d), 0);
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(monthGrid('2028-02').flat().filter(Boolean).length, 29);
  /* no UTC anywhere in the new code */
  for (const f of ['health-appointments.js', 'life-plan.js', 'schedule.js', 'dates.js']) assert.equal(/toISOString|getUTC|Date\.UTC/.test(code(JS[f])), false, f);
});

test('OG-HC-7 calendar 월 · 주 · 일: three views on the same data, each with previous / next / today, and nothing new stored', () => {
  assert.deepEqual(CALENDAR_VIEWS.map((v) => [v.id, v.label]), [['month', '월'], ['week', '주'], ['day', '일']]);
  const P = code(JS['life-plan.js']);
  assert.match(P, /STEP_WORDS = Object\.freeze\(\{ month: \['이전 달', '다음 달'\], week: \['이전 주', '다음 주'\], day: \['이전 날', '다음 날'\] \}\)/);
  assert.match(P, /selected = addDays\(selected, view === 'week' \? delta \* 7 : delta\);/, 'week moves by seven days, day by one');
  assert.match(P, /'data-og-cal': 'today', text: '오늘로 가기'/);
  /* week: each day's events and tasks due (and how many routines), from the existing stores */
  assert.match(P, /const days = weekOf\(selected\);/);
  assert.match(P, /const events = schedule\.listForDate\(key\);\s*const due = tasks\.dueOn\(key\);\s*const routineCount = routines \? routines\.listForDate\(key\)\.length : 0;/);
  /* day: events (the list below, in time order), tasks due, that weekday's routines */
  assert.match(P, /block\('이 날까지 할 일'/);
  assert.match(P, /block\('이 날 루틴'/);
  assert.match(JS['schedule.js'], /timed events first in time order/);
  assert.match(JS['life-view.js'], /createCalendarSection\(\{ schedule: stores\.schedule, tasks: stores\.tasks, routines: stores\.routines, now \}\)/);
  /* the view is a way of looking: not written to storage */
  assert.equal(/storage|localStorage|sessionStorage/.test(P.slice(P.indexOf('export function createCalendarSection'), P.indexOf('export function createTasksSection'))), false);
  /* the month grid and its keys are kept */
  assert.match(P, /role: 'grid', 'aria-label': `\$\{formatMonth\(month\)\} 달력`/);
  assert.match(P, /event\.key === 'PageUp' \|\| event\.key === 'PageDown'\) && view === 'month'/);
  /* health events are labelled in words on the calendar */
  assert.match(P, /isHealthEvent\(e\) \? eventKindLabel\(eventKind\(e\)\) : ''/);
});

test('OG-HC-8 accessibility: view switch is pressed buttons with a tick in a named group; days say date, today and counts; Escape closes forms; deletes are confirmed', () => {
  const P = code(JS['life-plan.js']);
  /* the switch: choiceButton → aria-pressed + ✓ (not colour alone), in a group named by a (visually hidden) label */
  assert.match(P, /el\('p', \{ class: 'visually-hidden', id: viewId, text: '보기 방식' \}\)/);
  assert.match(P, /role: 'group', 'aria-labelledby': viewId/);
  assert.match(P, /choiceButton\(\{ label: v\.label, ariaLabel: VIEW_WORDS\[v\.id\], pressed: view === v\.id, onChoose: \(\) => setView\(v\.id\) \}\)/);
  assert.match(JS['home-ui.js'], /'aria-pressed': pressed \? 'true' : 'false'[\s\S]*text: pressed \? '✓' : ''/);
  /* every day button (month and week): pressed + aria-current="date" for today + a label with the full date and counts; roving tabindex */
  assert.match(P, /'aria-pressed': isSelected \? 'true' : 'false', 'aria-current': key === today\(now\) \? 'date' : null, 'aria-label': dayLabel\(key, counts, due\)/);
  assert.match(P, /'aria-pressed': key === selected \? 'true' : 'false', 'aria-current': key === today\(now\) \? 'date' : null, 'aria-label': dayLabel\(key, events\.length, due\.length\)/);
  assert.match(P, /if \(events\) parts\.push\(`일정 \$\{events\}개`\);\s*if \(due\) parts\.push\(`할 일 \$\{due\}개`\);\s*if \(!events && !due\) parts\.push\('일정 없음'\);/);
  assert.match(P, /tabindex: isSelected \? '0' : '-1'/);
  /* the week's chosen day also shows a ✓ and the word 오늘 — not colour alone */
  assert.match(P, /key === today\(now\) \? el\('span', \{ class: 'og-cal-week__today', text: '오늘' \}\)/);
  assert.match(P, /key === selected \? el\('span', \{ class: 'og-cal-week__pick', 'aria-hidden': 'true', text: '✓' \}\)/);
  /* changes are announced; the visible title is a polite live region */
  assert.match(P, /card\.say\(`\$\{VIEW_WORDS\[next\]\}로 바꿨습니다\. \$\{title\(\)\}`\)/);
  assert.match(P, /el\('p', \{ class: 'og-cal__month', 'aria-live': 'polite', text: title\(\) \}\)/);
  /* forms: labelled fields from makeField, alert errors, Escape = 취소 with focus back to the opener, confirmed deletes */
  const L = code(JS['home-list.js']);
  assert.match(L, /if \(event\.key !== 'Escape'\) return;\s*event\.preventDefault\(\);\s*setMode\(\{ type: 'idle', id: null \}, item \? `edit:\$\{item\.id\}` : 'add'\);/);
  assert.match(L, /'aria-label': '지우기 확인', onkeydown: \(event\) => \{ if \(event\.key === 'Escape'\) \{ event\.preventDefault\(\); setMode\(\{ type: 'idle', id: null \}, `delete:\$\{item\.id\}`\); \} \}/);
  assert.match(L, /el\('p', \{ class: 'og-form-error', role: 'alert' \}\)/);
  assert.match(L, /을\(를\) 지울까요\? 되돌릴 수 없습니다\./);
  const H = code(JS['health-appointments.js']);
  assert.equal(/el\('input'|el\('textarea'/.test(H), false, 'every field comes from makeField (label for=)');
  for (const label of ['병원 이름', '진료 목적·메모', '검진 기관', '검진 종류', '준비 메모', '날짜', '시간']) assert.ok(H.includes(`label: '${label}'`), label);
  /* the 건강·안부 area now lists them as built */
  const health = AREAS.find((a) => a.id === 'health');
  assert.deepEqual(health.modules.filter((m) => ['hospital', 'checkup'].includes(m.id)).map((m) => [m.id, m.available]), [['hospital', true], ['checkup', true]]);
});

test('OG-HC-9 320px: calendar targets are 44 × 44 CSS px without widening the page; focus ring and today / chosen states are not colour only', () => {
  /* month grid at 380px and below: page gutter + card padding are given back, 2px kept, cells edge to edge */
  assert.match(LIFE_CSS, /@media \(max-width: 380px\) \{\n {2}\.og-home-card\[data-og-slot="life\.calendar"\] \{ margin-inline: calc\(-1rem \+ 4px\); \}\n {2}\.og-cal__grid \{ width: calc\(100% \+ 2\.2rem\); margin-inline: -1\.1rem; border-spacing: 0; \}\n {2}\.og-cal__day \{ min-height: 2\.9rem; \}\n\}/);
  /* card = screen − 2 × 4px; grid = card width (its padding is given back); seven equal cells */
  for (const w of [320, 360, 380]) assert.ok((w - 8) / 7 >= 44, `${w}px day width ${(w - 8) / 7}`);
  assert.ok(2.9 * 16 >= 44, 'day height');
  /* week day buttons and the view switch */
  assert.match(LIFE_CSS, /\.og-cal-week__head \{[^}]*min-width: 2\.75rem; min-height: 3\.4rem;/);
  assert.match(LIFE_CSS, /\.og-cal__view-picks \.og-pick \{ flex: 1 1 0; min-width: 2\.75rem;/, 'the three view buttons share the width and never push the card wider');
  assert.match(read('styles', 'ongil-home.css'), /\.og-pick \{[^}]*min-height: 3rem;/);
  /* today = dashed ring, chosen = filled (with ✓ in the week) */
  assert.match(LIFE_CSS, /\.og-cal-week__head\[aria-current="date"\] \{ border-color: var\(--og-ink\); border-style: dashed; \}/);
  assert.match(LIFE_CSS, /\.og-cal-week__head\[aria-pressed="true"\] \{ background: var\(--og-ink\);/);
  /* the shared focus ring applies to every button */
  assert.match(read('styles', 'ongil-app.css'), /\.og a:focus-visible, \.og button:focus-visible/);
  /* long titles wrap instead of widening the week */
  assert.match(LIFE_CSS, /\.og-cal-week__lines \{[^}]*overflow-wrap: anywhere; min-width: 0; \}/);
  assert.match(LIFE_CSS, /\.og-cal-week__day \{ display: grid; grid-template-columns: 3\.6rem minmax\(0, 1fr\);/);
});

test('OG-HC-10 Store hero: the film and the copy match the other screens (same classes, lazy video, no autoplay)', () => {
  const block = INDEX.slice(INDEX.indexOf('<section class="og-screen" id="store"'), INDEX.indexOf('<section class="og-band" data-og-modules="store"'));
  assert.match(block, /<div class="og-film" data-og-film>/);
  assert.equal(block.includes('og-film--still'), false);
  assert.match(block, /<video class="og-film__bg" muted loop playsinline preload="none" data-og-src="https:\/\/d8j0ntlcm91z4\.cloudfront\.net\/user_38xzZboKViGWJOttwIXH07lWA1P\/hf_20260815_075403_f5e02d94-0311-4ff3-bedb-81dc78803882\.mp4" aria-hidden="true" tabindex="-1"><\/video>/);
  assert.match(block, /<p class="og-film__wordmark" lang="en">STORE<\/p>/);
  assert.match(block, /<h1 class="og-film__slogan" id="og-store-title" tabindex="-1">일상에 필요한 물건을<br>한곳에서 만나보세요\.<\/h1>/);
  assert.match(block, /<p class="og-film__lead">생활의 편리함부터 건강·안전, 취미와 스마트 기기까지\.<br>시니어의 더 나은 일상을 위한 제품을 살펴보세요\.<\/p>/);
  assert.match(block, /data-og-scroll-to="store">스토어 살펴보기<\/button>/);
});

test('OG-HC-11 cache: the files this change touched have a new address, the others keep theirs', () => {
  assert.match(INDEX, /ongil-start\/js\/app\.js\?v=20261006m15/); /* Health · Safety V2: app.js moved on again (v13 → 20261005h14); ongil-life.css did not change */ /* My Life V2: app.js changed → entry moved on (BEFORE 20261005h14, AFTER 20261006m15) */
  assert.match(INDEX, /ongil-start\/styles\/ongil-life\.css\?v=20261004v13/);
  for (const f of ['ongil-tokens.css', 'ongil-shell.css', 'ongil-app.css', 'ongil-home.css']) assert.match(INDEX, new RegExp(`ongil-start/styles/${f.replace('.', '\\.')}\\?v=20261003r11`), f);
  assert.equal((INDEX.match(/\?v=20261004v13/g) || []).length, 1, 'moved once per change, only where something changed (V3: v12 → v13; Health · Safety V2: only app.js moved on)');
});
