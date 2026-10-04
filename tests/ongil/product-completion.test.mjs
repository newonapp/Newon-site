// ONGIL Product Completion & Release Audit V1 — regression tests for the defects that audit found and fixed.
//   PC-01 … 04  onboarding never overwrites what is already in 내 정보
//   PC-05 … 07  marks and lists: medication log size, journal reachability, no printed "null"
//   PC-08 … 09  checkboxes: one box per label, and no success message for a write that failed
//   PC-10 … 14  health screen wording, erase wording, emergency contact order, check-in memo, routine history
//   PC-15       assistant: urgent wording gets the fixed "call 119 yourself" line; 약속 is not a medicine
//   PC-16 … 18  page shell (mobile menu, hidden fields, dialogs), truthful copy, saved card refresh
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
// Rendered behaviour (the tap on a label, the menu close button, the dialog closing on Back, 320 – 1440 overflow) was
// run in a browser harness outside the repository; the results are in docs/ongil/ONGIL_PRODUCT_COMPLETION_AUDIT_V1.md.
// Everything built below is a TEST FIXTURE.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, MAX_VALUE_CHARS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import { createProfileStore } from '../../ongil-start/js/profile.js';
import { createOnboarding } from '../../ongil-start/js/onboarding.js';
import { createMedicationStore, LOG_KEEP_MIN_DAYS } from '../../ongil-start/js/medication.js';
import { createEmergencyContactStore } from '../../ongil-start/js/emergency-contacts.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { LIFE_LIMITS } from '../../ongil-start/js/life-contracts.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { matchIntent } from '../../ongil-start/js/assistant-intents.js';
import * as T from '../../ongil-start/js/assistant-tools.js';
import { FEATURE_CAPABILITIES } from '../../ongil-start/js/admin.js';
import { dateKey, addDays } from '../../ongil-start/js/dates.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const JS_DIR = path.join(ROOT, 'ongil-start/js');
const JS = Object.fromEntries(fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).map((f) => [f, read(`ongil-start/js/${f}`)]));
const HTML = read('ongil-start/index.html');
const CSS = ['ongil-app.css', 'ongil-shell.css'].map((f) => read(`ongil-start/styles/${f}`)).join('\n');

function clock(start = Date.UTC(2026, 9, 4, 3, 0, 0)) { let t = start; const now = () => t; now.tick = (ms = 1000) => { t += ms; return t; }; now.set = (v) => { t = v; }; return now; }
function world() {
  const now = clock();
  const backend = createMemoryBackend();
  const storage = createStorage({ backend, now });
  const profile = createProfileStore(storage, { now });
  const onboarding = createOnboarding({ storage, profile, now });
  return { now, backend, storage, profile, onboarding };
}
/* a backend that refuses every write, the way a full or disabled browser storage does */
function refusing(seedBackend) { return { kind: 'memory', getItem: (k) => seedBackend.getItem(k), setItem: () => { throw Object.assign(new Error('full'), { name: 'QuotaExceededError' }); }, removeItem: (k) => seedBackend.removeItem(k), key: (i) => seedBackend.key(i), get length() { return seedBackend.length; } }; }
const finish = (o) => { for (let i = 0; i < 12 && o.state().status !== 'completed'; i++) o.next(); return o.state(); };

/* ───────── onboarding ───────── */
test('PC-01 a draft left with "나중에 하기" and resumed later never blanks what was saved in 내 정보 in between', () => {
  const w = world();
  w.onboarding.start(); w.now.tick(); w.onboarding.skip();                              /* opened once, left without answering */
  w.now.tick(); w.profile.updateProfile({ nickname: '영자', usageMode: 'self', ageRange: '70s', region: '부산', interests: ['health', 'hobby'], needs: ['medication'] });
  w.now.tick(); const resumed = w.onboarding.start();
  assert.deepEqual([resumed.answers.usage, resumed.answers.age, resumed.answers.region], ['self', '70s', '부산'], 'the dialog shows what 내 정보 already has');
  assert.deepEqual([resumed.answers.interests, resumed.answers.needs], [['health', 'hobby'], ['medication']]);
  assert.equal(finish(w.onboarding).status, 'completed');
  const p = w.profile.getProfile();
  assert.deepEqual([p.nickname, p.usageMode, p.ageRange, p.region, p.interests, p.needs], ['영자', 'self', '70s', '부산', ['health', 'hobby'], ['medication']]);
});

test('PC-02 resume: an answered draft is kept when 내 정보 is empty; 내 정보 wins when it was saved after the draft', () => {
  const a = world();
  a.onboarding.start(); a.onboarding.answer('region', '서울'); a.onboarding.answer('age', '60s'); a.now.tick(); a.onboarding.skip();
  a.now.tick(); const r1 = a.onboarding.start();
  assert.deepEqual([r1.answers.region, r1.answers.age], ['서울', '60s'], 'nothing in 내 정보: the draft stands');
  finish(a.onboarding);
  assert.deepEqual([a.profile.getProfile().region, a.profile.getProfile().ageRange], ['서울', '60s']);

  const b = world();
  b.onboarding.start(); b.onboarding.answer('region', '서울'); b.now.tick(); b.onboarding.skip();
  b.now.tick(); b.profile.updateProfile({ region: '부산' });                               /* changed later, on purpose */
  b.now.tick(); assert.equal(b.onboarding.start().answers.region, '부산');
  finish(b.onboarding);
  assert.equal(b.profile.getProfile().region, '부산', 'the newer choice is not replaced by the old draft');
  /* an answer can still be taken back inside the flow */
  const c = world();
  c.profile.updateProfile({ region: '부산' }); c.now.tick(); c.onboarding.start(); c.onboarding.answer('region', ''); finish(c.onboarding);
  assert.equal(c.profile.getProfile().region, '', 'clearing an answer in the dialog is the user\'s own choice and is applied');
});

test('PC-03 going through the flow again without touching the notification step keeps the choices made in 알림 설정', () => {
  const w = world();
  w.onboarding.start(); w.onboarding.answer('notifications', 'none'); finish(w.onboarding);
  assert.equal(w.profile.getPreferences().notifications.CHECK_IN, false);
  w.now.tick(); w.profile.updatePreferences({ notifications: { CHECK_IN: true, SCHEDULE: true, MEDICATION: true } });
  w.now.tick(); const again = w.onboarding.start();
  assert.equal(again.answers.notifications, 'none', 'the earlier answer is shown');
  finish(w.onboarding);
  const n = w.profile.getPreferences().notifications;
  assert.deepEqual([n.CHECK_IN, n.SCHEDULE, n.MEDICATION], [true, true, true], 'per-kind choices survive an untouched step');
  /* a new answer is applied */
  w.now.tick(); w.onboarding.start(); w.onboarding.answer('notifications', 'none'); finish(w.onboarding);
  assert.deepEqual(Object.values(w.profile.getPreferences().notifications).some(Boolean), true, 'the same answer again is still "untouched"');
  w.now.tick(); w.onboarding.start(); const preset = ['all', 'important', 'essential', 'none'].find((id) => w.onboarding.answer('notifications', id).ok && id !== 'none'); finish(w.onboarding);
  assert.ok(preset, 'a different preset exists');
  assert.equal(w.onboarding.state().appliedNotifications, preset);
  /* a state stored before this field existed and already completed counts its answer as applied */
  const old = world();
  old.backend.setItem(`${KEY_PREFIX}onboarding`, JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 8, answers: { notifications: 'none' }, completedAt: 5, updatedAt: 5 }));
  assert.equal(old.onboarding.state().appliedNotifications, 'none');
});

test('PC-04 a completed flow that is reopened and left stays completed', () => {
  const w = world();
  w.onboarding.start(); finish(w.onboarding);
  w.now.tick(); assert.equal(w.onboarding.start().status, 'in_progress');
  assert.equal(w.onboarding.skip().status, 'completed', 'Home does not say "처음 설정을 마치지 않았습니다" again');
  /* a first run that is left is still "skipped" */
  const n = world(); n.onboarding.start(); assert.equal(n.onboarding.skip().status, 'skipped');
});

/* ───────── marks and lists ───────── */
test('PC-05 medication marks keep saving when a year of marks no longer fits: the oldest days go, never the last month', () => {
  const now = clock();
  const backend = createMemoryBackend();
  const storage = createStorage({ backend, now });
  const meds = createMedicationStore(storage, { now });
  const ids = [];
  for (let i = 0; i < 14; i++) { now.tick(); ids.push(meds.add({ name: `약 ${i + 1} ${'가'.repeat(20)}`, time: '08:00' }).medication.id); }
  /* a log as large as a year of daily marks, written the way the store writes it */
  const today = dateKey(now());
  const items = {};
  for (let d = LIFE_LIMITS.medicationLogDays - 1; d >= 1; d--) { const day = {}; for (const id of ids) day[id] = { taken: true, updatedAt: now(), name: `약 ${'가'.repeat(24)}`, time: '08:00' }; items[addDays(today, -d)] = day; }
  const raw = JSON.stringify({ schemaVersion: 1, items });
  assert.ok(raw.length > MAX_VALUE_CHARS, 'the fixture is larger than one collection may hold');
  backend.setItem(`${KEY_PREFIX}medicationLogs`, raw);
  const r = meds.setTaken(ids[0], true);
  assert.equal(r.ok, true, 'today\'s mark is written');
  assert.equal(meds.isTaken(ids[0]), true);
  const stored = backend.getItem(`${KEY_PREFIX}medicationLogs`);
  assert.ok(stored.length <= MAX_VALUE_CHARS);
  const days = Object.keys(JSON.parse(stored).items).sort();
  assert.ok(days.length >= LOG_KEEP_MIN_DAYS && days.length < LIFE_LIMITS.medicationLogDays, `kept ${days.length} days`);
  assert.equal(days[days.length - 1], today);
  for (let d = 1; d < LOG_KEEP_MIN_DAYS; d++) assert.ok(days.includes(addDays(today, -d)), `day -${d} is kept`);
  assert.equal(LOG_KEEP_MIN_DAYS, 31);
  /* a write the browser refuses says why */
  const blocked = createMedicationStore(createStorage({ backend: refusing(backend), now }), { now });
  assert.deepEqual([blocked.setTaken(ids[1], true).ok, blocked.setTaken(ids[1], true).reason], [false, 'STORAGE_UNAVAILABLE']);
});

test('PC-06 every journal entry can be reached: the list is not cut at 20', () => {
  const s = JS['life-records.js'];
  assert.match(s, /getItems: \(\) => journal\.recent\(LIFE_LIMITS\.journalEntries\),/);
  assert.doesNotMatch(s, /journal\.recent\(JOURNAL_PAGE\)/);
  assert.doesNotMatch(s, /개만 보입니다/);
  assert.match(JS['home-list.js'], /export const LIST_PAGE = 50;/, 'the list card pages with 더 보기');
});

/* the arguments of a native Node.append()/prepend() call, top level only (strings and nested calls removed) */
function nativeAppendCalls(source) {
  const out = []; const re = /\.(append|prepend|replaceChildren|before|after)\(/g; let m;
  while ((m = re.exec(source))) {
    let i = m.index + m[0].length, depth = 1, quote = null, top = '';
    for (; i < source.length && depth > 0; i++) {
      const c = source[i];
      if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
      if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
      if ('([{'.includes(c)) { depth++; continue; }
      if (')]}'.includes(c)) { depth--; continue; }
      if (depth === 1) top += c;
    }
    out.push({ line: source.slice(0, m.index).split('\n').length, top });
  }
  return out;
}
test('PC-07 no screen prints the word "null": a native append() never receives an optional child', () => {
  assert.deepEqual(nativeAppendCalls("x.append(a, b ? c : null)").map((c) => /\bnull\b/.test(c.top)), [true], 'the scan sees an optional argument');
  assert.deepEqual(nativeAppendCalls("x.append(el('p', { text: 'null' }), fn(a ? b : null))").map((c) => /\bnull\b|&&/.test(c.top)), [false]);
  for (const [file, source] of Object.entries(JS)) {
    for (const call of nativeAppendCalls(source)) assert.equal(/\bnull\b|&&/.test(call.top), false, `${file}:${call.line} passes an optional child to a native append`);
  }
  const home = JS['home-explore.js'];
  assert.match(home, /import \{ el, clear, append \} from '\.\/dom\.js';/);
  assert.match(home, /append\(card\.body, \[\n\s+el\('p', \{ class: 'og-home-empty', 'data-og-family-status'/, 'the Home 가족 card skips its two optional lines');
  assert.match(JS['dom.js'], /if \(child === null \|\| child === undefined \|\| child === false\) continue;/);
});

/* ───────── checkboxes ───────── */
test('PC-08 a checkbox id is unique per card, so a label ticks the box it sits next to (Home and 내 생활 draw the same record)', () => {
  const s = JS['home-list.js'];
  assert.match(s, /let CARD_SEQ = 0;/);
  assert.match(s, /const uid = \+\+CARD_SEQ;/);
  assert.match(s, /const checkId = `og-check-\$\{uid\}-\$\{item\.id\}`;/);
  assert.doesNotMatch(s, /`og-check-\$\{item\.id\}`/, 'the record id alone repeats across cards');
  assert.match(s, /el\('label', \{ for: checkId, class: 'og-home-item__label' \}/);
  /* the error of a list form is tied to its field */
  assert.match(s, /error\.id = errorId;/);
  assert.match(s, /bad\.input\.setAttribute\('aria-describedby', bad\.described \? `\$\{bad\.described\} \$\{errorId\}` : errorId\);/);
});

test('PC-09 a write that failed is never announced as done: checkboxes, clears, deletes, unsave', () => {
  const list = JS['home-list.js'];
  assert.match(list, /const r = config\.onToggle\(item, event\.target\.checked\);\n\s+const failed = r === false \|\| \(!!r && r\.ok === false\);/);
  assert.match(list, /if \(failed\) card\.say\(r && r\.reason && r\.reason !== 'STORAGE_UNAVAILABLE' && r\.reason !== 'STORAGE_FULL' \? TOGGLE_FAIL_TEXT : STORAGE_ERROR_TEXT\);\n\s+else card\.say\(config\.toggleText\(item, event\.target\.checked\)\);/);
  assert.doesNotMatch(list, /\n\s+config\.onToggle\(item, event\.target\.checked\);\n/, 'the result is not thrown away');
  assert.match(JS['home-today.js'], /const cleared = checkIn\.clear\(\);\n\s+card\.say\(cleared \? '오늘의 안부를 지웠습니다\.' : STORAGE_ERROR_TEXT\);/);
  assert.match(JS['life-health.js'], /const removed = checkIn\.remove\(date\);\n\s+card\.say\(removed \? `\$\{word\} 상태 기록을 지웠습니다\.` : STORAGE_ERROR_TEXT\);/);
  assert.match(JS['life-health.js'], /const removed = symptoms\.remove\(date\);\n\s+card\.say\(removed \? `\$\{word\} 증상 기록을 지웠습니다\.` : STORAGE_ERROR_TEXT\);/);
  assert.match(JS['saved-view.js'], /const removed = saved\.unsave\(item\.type, item\.id\);\n\s+announce\(status, removed \? /);
  assert.match(JS['community-view.js'], /const removed = posts\.remove\(id\);\n\s+if \(removed && removed\.ok === false\) \{/);
  /* the stores do report the failure those screens now read */
  const now = clock(); const backend = createMemoryBackend(); const ok = createStorage({ backend, now });
  const tasks = createTaskStore(ok, { now }); const task = tasks.add({ title: '은행 가기' }).task;
  const checkIn = createCheckInStore(ok, { now }); checkIn.save({ status: 'good' });
  const saved = createSavedStore(ok, { now }); saved.save({ type: 'PLACE', id: 'p1', title: '공원', href: 'https://example.org/p1' });
  const full = createStorage({ backend: refusing(backend), now });
  assert.equal(createTaskStore(full, { now }).update(task.id, { completed: true }).ok, false);
  assert.equal(createCheckInStore(full, { now }).clear(), false);
  assert.equal(createCheckInStore(full, { now }).remove(dateKey(now())), false);
  assert.equal(createSavedStore(full, { now }).unsave('PLACE', 'p1'), false);
  assert.equal(createMedicationStore(full, { now }).setTaken('md_missing', true).ok, false);
  assert.equal(tasks.list().find((t) => t.id === task.id).completed, false, 'nothing was changed');
});

/* ───────── health, erase, contacts, check-in, routines ───────── */
test('PC-10 건강·안부 lists what works apart from what does not — a working feature is never under "아직 사용할 수 없습니다"', () => {
  const v = JS['views.js'];
  assert.match(v, /const ready = area\.modules\.filter\(\(m\) => m\.available\);\n\s+const pending = area\.modules\.filter\(\(m\) => !m\.available\);/);
  assert.match(v, /text: '지금 쓸 수 있는 기능'/);
  assert.match(v, /'data-og-modules-group': 'ready' \}, ready\.map\(chip\)/);
  assert.match(v, /if \(pending\.length\) \{[\s\S]{0,400}'아래 항목은 아직 사용할 수 없습니다\.'[\s\S]{0,200}pending\.map\(chip\)/);
  assert.doesNotMatch(v, /area\.modules\.map\(/, 'the two kinds are never drawn as one list');
  const health = AREAS.find((a) => a.id === 'health');
  assert.deepEqual(health.modules.filter((m) => !m.available).map((m) => m.id), ['help']);
  for (const id of ['contacts', 'medication', 'hospital', 'checkup', 'measures']) assert.equal(health.modules.find((m) => m.id === id).available, true, id);
  assert.doesNotMatch(health.empty, /이 화면에 따로 저장된 기록은 없습니다/, 'the screen that keeps 긴급 연락망 and 병원 일정 does not say it stores nothing');
  assert.match(health.empty, /긴급 연락망·병원 일정·건강검진/);
  assert.match(health.readyLead, /내 생활 › 건강/);
  /* the operations view agrees */
  const caps = FEATURE_CAPABILITIES.health.map((c) => `${c.label}:${c.mode}`);
  assert.ok(caps.includes('긴급 연락망·병원 일정·건강검진:LOCAL_READY'));
  assert.equal(caps.some((c) => /병원·검진:FUTURE/.test(c)), false);
});

test('PC-11 the erase confirmation names everything it erases, and erase removes it', () => {
  const s = JS['account-view.js'];
  for (const word of ['긴급 연락망', '건강 수치', '병원 일정과 건강검진', '가족 공유 설정과 도움 요청', '커뮤니티 글과 모임 초안', '알림과 이용 횟수', '되돌릴 수 없습니다']) assert.ok(s.includes(word), word);
  assert.match(s, /const title = document\.getElementById\('og-account-title'\);\n\s+if \(title\) title\.focus\(\);/, 'focus stays on the screen after the redraw');
  const now = clock(); const backend = createMemoryBackend(); const storage = createStorage({ backend, now });
  createEmergencyContactStore(storage, { now }).add({ name: '첫째', relation: 'child', phone: '010-1234-5678' });
  backend.setItem('livon.v1.profile', '{}');
  assert.ok(backend.getItem(`${KEY_PREFIX}emergencyContacts`));
  assert.equal(storage.clear(), true);
  assert.equal(backend.getItem(`${KEY_PREFIX}emergencyContacts`), null);
  assert.equal(backend.getItem('livon.v1.profile'), '{}', 'another product\'s data is not touched');
});

test('PC-12 a contact added as 주 연락처 is first in the list, the same as 주 연락처로', () => {
  const now = clock(); const store = createEmergencyContactStore(createStorage({ backend: createMemoryBackend(), now }), { now });
  now.tick(); store.add({ name: '첫째', relation: 'child', phone: '010-1111-2222', primary: true });
  now.tick(); store.add({ name: '둘째', relation: 'child', phone: '010-3333-4444' });
  now.tick(); const r = store.add({ name: '막내', relation: 'child', phone: '010-5555-6666', primary: true });
  assert.deepEqual([r.ok, r.contact.order, r.contact.primary], [true, 1, true]);
  assert.deepEqual(store.list().map((c) => `${c.order}.${c.name}${c.primary ? '(주)' : ''}`), ['1.막내(주)', '2.첫째', '3.둘째']);
  now.tick(); store.add({ name: '이웃', relation: 'neighbor', phone: '02-123-4567' });
  assert.equal(store.list()[3].name, '이웃', 'an ordinary contact still goes last');
  assert.equal(store.list().filter((c) => c.primary).length, 1);
});

test('PC-13 emptying the only field of a check-in with spaces removes the record instead of failing', () => {
  const now = clock(); const store = createCheckInStore(createStorage({ backend: createMemoryBackend(), now }), { now });
  const day = dateKey(now());
  assert.equal(store.save({ memo: '어지러웠음' }, day).ok, true);
  const r = store.save({ memo: '   ' }, day);
  assert.deepEqual([r.ok, r.removed], [true, true]);
  assert.equal(store.get(day), null);
  /* with another field set, the memo alone is cleared */
  store.save({ status: 'good', memo: '메모' }, day);
  assert.equal(store.save({ memo: ' ' }, day).ok, true);
  assert.deepEqual([store.get(day).status, store.get(day).memo || ''], ['good', '']);
});

test('PC-14 a day that was marked keeps its routine after the routine\'s days change or it is paused', () => {
  const now = clock(Date.UTC(2026, 9, 4, 3, 0, 0)); /* a Sunday (KST and UTC) */
  const store = createRoutineStore(createStorage({ backend: createMemoryBackend(), now }), { now });
  const day = dateKey(now());
  const id = store.add({ title: '아침 산책', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }).routine.id;
  assert.equal(store.setCompleted(id, true, day).ok, true);
  now.tick(); assert.equal(store.update(id, { daysOfWeek: [1] }).ok, true);
  assert.deepEqual(store.listForDate(day).map((r) => [r.title, r.completed]), [['아침 산책', true]], 'the mark is still counted for the day it was made');
  now.tick(); assert.equal(store.update(id, { active: false }).ok, true);
  assert.equal(store.listForDate(day).length, 1);
  /* a day that was not marked follows the plan as it is now */
  assert.equal(store.listForDate(addDays(day, -1)).length, 0);
  assert.equal(store.listForDate(addDays(day, 1)).length, 0, 'paused: not planned for tomorrow');
});

/* ───────── assistant ───────── */
test('PC-15 urgent wording gets the fixed "call 119 yourself" line — no judgement; 약속 is not a medicine', () => {
  for (const text of ['살려줘', '도와줘 쓰러졌어', '112에 신고해줘', '가슴이 아파', '숨이 안 쉬어져', '의식이 없어', '119 불러줘']) {
    const m = matchIntent(text);
    assert.deepEqual([m.intent, m.reason], ['HEALTH_SAFETY', 'EMERGENCY'], text);
  }
  assert.match(T.MESSAGES.EMERGENCY, /판단하거나 대신 신고하지 않아요\. 급하다고 느끼면 119에 직접 전화해 주세요\./);
  assert.match(T.MESSAGES.HEALTH, /판단하거나 약을 권하지 않아요\..*급하다고 느끼면 119에 직접 전화해 주세요\.$/);
  for (const text of ['머리가 아파', '어지러워']) assert.deepEqual([matchIntent(text).intent, matchIntent(text).reason || ''], ['HEALTH_SAFETY', ''], text);
  for (const m of [T.MESSAGES.EMERGENCY, T.MESSAGES.HEALTH]) assert.equal(/신고했|전화했|불렀|연결했|위험합니다|응급입니다|괜찮습니다/.test(m), false, 'nothing is claimed or judged');
  assert.notEqual(matchIntent('내일 약속 추천해줘').intent, 'HEALTH_SAFETY');
  assert.equal(matchIntent('이 약 먹어도 될까').intent, 'HEALTH_SAFETY', 'a question about a medicine is still not answered');
  assert.equal(matchIntent('내일 오후 2시 병원 일정 추가').intent, 'ADD_CALENDAR', 'ordinary requests are unchanged');
});

/* ───────── page shell, copy, saved card ───────── */
test('PC-16 page shell: the mobile menu can be closed and shows where you are; a hidden field is hidden; a dialog locks the page and closes when the screen changes', () => {
  const sheet = HTML.slice(HTML.indexOf('id="gnav-mobile-ongil"'), HTML.indexOf('</header>'));
  assert.match(sheet, /<div class="gnav-mobile__scroll">\s*<button type="button" class="og-menu-close" data-gnav-close data-og-menu-close>메뉴 닫기<\/button>\s*<a class="gnav-mobile__sublink" href="#ongil-home"/, 'a visible close button is the first thing in the sheet');
  assert.equal((sheet.match(/class="gnav-mobile__sublink"/g) || []).length, 10, 'the ten destinations are unchanged');
  assert.match(CSS, /\.gnav--ongil \.og-menu-close \{[^}]*min-height: 44px;[^}]*min-width: 44px;[^}]*font-size: 1rem;/);
  assert.match(CSS, /\.gnav--ongil \.gnav-mobile__sublink \{ font-size: 1rem; \}/);
  assert.match(CSS, /\.gnav--ongil \.gnav-mobile__sublink\[aria-current="page"\] \{ font-weight: 700;/);
  assert.match(CSS, /\.gnav--ongil \.gnav-mobile__sublink\[aria-current="page"\]::after \{ content: "✓";/, 'not by colour alone');
  assert.match(CSS, /\.og-field\[hidden\] \{ display: none; \}/);
  assert.match(CSS, /html\[data-og-view\]:has\(dialog\[open\]\), html\[data-og-view\]:has\(dialog\[open\]\) body \{ overflow: hidden; \}/);
  assert.match(JS['app.js'], /win\.addEventListener\('hashchange', \(\) => \{\n\s+if \(!resolveView\(win\.location\.hash\)\) return;\n\s+for \(const d of doc\.querySelectorAll\('dialog\[open\]'\)\) if \(typeof d\.close === 'function'\) d\.close\(\);\n\}\);/);
});

test('PC-17 truthful copy: promises about family sharing are promises, a preview is not called sending, onboarding says what it uses', () => {
  const fam = JS['family-view.js'];
  assert.ok(fam.includes('공유를 켤 때는 가족마다, 항목마다 한 번 더 확인하도록 만들 거예요.'));
  assert.ok(fam.includes('고른 내용은 지금도 언제든 끌 수 있어요. 연결한 뒤에는 끄면 바로 보이지 않게 만들 거예요.'));
  assert.equal(fam.includes('공유를 켜면 가족마다, 항목마다 한 번 더 확인해요.'), false, 'not stated as something that already happens');
  for (const f of ['care-view.js', 'enjoy-view.js', 'store-view.js']) {
    assert.equal(/text: '가족에게 보내기'/.test(JS[f]), false, `${f}: a preview button is not labelled "보내기"`);
    assert.match(JS[f], /text: '가족에게 보여주기'/);
    assert.ok(JS[f].includes('아직 연결된 가족이 없어서 보내지 않았어요.'));
  }
  for (const f of ['onboarding-view.js', 'account-view.js']) assert.equal(JS[f].includes('나에게 맞게 준비'), false, `${f}: no personalisation is promised`);
  assert.ok(JS['onboarding-view.js'].includes('지역은 주변 찾기의 기본값으로, 알림 선택은 알림 설정으로 쓰고, 나머지는 내 정보에 적어 둡니다.'));
  assert.ok(JS['admin-view.js'].includes('안부를 남긴 횟수처럼 몇 번 했는지만 세요.'));
  /* nothing in the whole app claims a delivery, a call or a judgement */
  const all = Object.values(JS).join('\n') + HTML;
  for (const claim of ['가족에게 전송했', '가족에게 보냈습니다', '보호자가 확인', '실시간으로 전송', '통화가 연결되었', '119에 신고했', '안전이 확인', '건강이 정상', '결제가 완료', '주문이 완료']) assert.equal(all.includes(claim), false, claim);
});

test('PC-18 saving from a 즐길거리 detail refreshes the "저장한 즐길거리" card as well as the results', () => {
  assert.match(JS['enjoy-view.js'], /saveBtn\.textContent = r\.saved \? '✓ 저장됨 \(누르면 취소\)' : '저장';\n\s+renderResults\(\);\n\s+renderSaved\(\);/);
  assert.match(JS['store-view.js'], /renderSaved\(\)/);
});
