// ONGIL Phase 11 — Release Hardening V1: an audit of the whole of ONGIL V1, with the fixes it led to.
//   RH-01 … 05  data integrity   (medication history, old storage, erase, privacy leaks)
//   RH-06 … 10  security         (URLs, dynamic HTML, secrets, provider data, routes)
//   RH-11 … 15  accessibility    (keyboard, focus, ARIA, contrast, reduced motion)
//   RH-16 … 20  responsive       (320 · 360 · 430 · 200% reflow · long text)
//   RH-21 … 25  states           (loading, error, null leaks, offline)
//   RH-26 … 30  scale            (large data, 1,500 results, storage quota, analytics and assistant bounds)
//   RH-31 … 35  dates and destructive actions
//   RH-36 … 40  truthful copy
//   RH-41 … 45  SEO, cache, dependencies, regression
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
// What only a browser can show (measured sizes, contrast of rendered text, real key presses, offline) was run from a
// harness outside the repository at 320 – 1440; the numbers are in docs/ongil/PHASE_11_RELEASE_HARDENING_V1.md and the
// rules that produce them are asserted here. Everything built below is a TEST FIXTURE.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import * as C from '../../ongil-start/js/contracts.js';
import * as L from '../../ongil-start/js/life-contracts.js';
import * as R from '../../ongil-start/js/routes.js';
import * as A from '../../ongil-start/js/analytics.js';
import * as T from '../../ongil-start/js/assistant-tools.js';
import { matchIntent } from '../../ongil-start/js/assistant-intents.js';
import { VIEWS, INTERNAL_VIEWS, ROUTE_ALIASES, resolveView, hashFor } from '../../ongil-start/js/router.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { CLASSIFICATION, DATA_CLASSES, maySync, maySearchGlobally, familySharingAllowed, unclassified } from '../../ongil-start/js/privacy.js';
import { isSyncable, syncChange } from '../../ongil-start/js/account.js';
import { createSearch, createAreaProvider, createSavedProvider, createCareProvider, createEnjoyProvider, createStoreProvider, SEARCH_GROUP_LIMIT } from '../../ongil-start/js/search.js';
import { createProfileStore } from '../../ongil-start/js/profile.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createNotificationCenter } from '../../ongil-start/js/notifications.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createDailyLifeStore } from '../../ongil-start/js/daily-life.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createExpenseStore } from '../../ongil-start/js/expenses.js';
import { createJournalStore } from '../../ongil-start/js/journal.js';
import { createSymptomStore } from '../../ongil-start/js/symptoms.js';
import { createHealthNoteStore } from '../../ongil-start/js/health-notes.js';
import { createFamilySharingStore, createHelpRequestStore } from '../../ongil-start/js/family.js';
import { createPostStore, createGroupStore, createMeetupStore } from '../../ongil-start/js/community.js';
import { familyConnection } from '../../ongil-start/js/onboarding.js';
import { sanitizeCareItems } from '../../ongil-start/js/care-contracts.js';
import { sanitizeEnjoyItems } from '../../ongil-start/js/enjoy-contracts.js';
import { sanitizeProducts } from '../../ongil-start/js/store-contracts.js';
import { createInstrumentation } from '../../ongil-start/js/instrument.js';
import { buildContentStatus, buildSystemStatus, buildPrivacyMatrix } from '../../ongil-start/js/admin.js';
import { LIST_PAGE } from '../../ongil-start/js/home-list.js';
import { dateKey, addDays, isDateKey } from '../../ongil-start/js/dates.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const JS_DIR = path.join(ROOT, 'ongil-start/js');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const JS_FILES = fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).sort();
const JS = Object.fromEntries(JS_FILES.map((f) => [f, read(`ongil-start/js/${f}`)]));
const CSS_FILES = fs.readdirSync(path.join(ROOT, 'ongil-start/styles')).filter((f) => f.endsWith('.css')).sort();
const CSS = Object.fromEntries(CSS_FILES.map((f) => [f, read(`ongil-start/styles/${f}`)]));
const HTML = read('ongil-start/index.html');
const APP = JS['app.js'];
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const ALL_CODE = JS_FILES.map((f) => code(JS[f])).join('\n');
/* every string literal in the ONGIL modules + the page: what a person can be shown */
const COPY = `${ALL_CODE}\n${HTML}`;

const TODAY = '2026-10-03';
const NOW = new Date(2026, 9, 3, 9, 0, 0).getTime();
const DAY = 86_400_000;
function world(seed) {
  const clock = { t: NOW };
  const now = () => clock.t;
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  const o = { now };
  const meetups = createMeetupStore(storage, o);
  return {
    clock, now, backend, storage,
    profile: createProfileStore(storage, o), saved: createSavedStore(storage, o), notifications: createNotificationCenter({ storage, profile: createProfileStore(storage, o), now }),
    checkIn: createCheckInStore(storage, o), schedule: createScheduleStore(storage, o), medication: createMedicationStore(storage, o), dailyLife: createDailyLifeStore(storage, o),
    tasks: createTaskStore(storage, o), routines: createRoutineStore(storage, o), expenses: createExpenseStore(storage, o), journal: createJournalStore(storage, o),
    symptoms: createSymptomStore(storage, o), healthNotes: createHealthNoteStore(storage, o), sharing: createFamilySharingStore(storage, o), help: createHelpRequestStore(storage, o),
    posts: createPostStore(storage, o), groups: createGroupStore(storage, { ...o, meetups }), meetups,
    analytics: A.createAnalytics({ storage, now }),
  };
}
const snapshot = (w, except = []) => JSON.stringify(w.backend.keys().filter((k) => !except.includes(k)).sort().map((k) => [k, w.backend.getItem(k)]));
const must = (r, what) => { assert.equal(r && r.ok, true, `${what}: ${JSON.stringify(r)}`); return r; };
/* one of everything personal, each carrying a marker that must never appear outside its own screen */
function fillPrivate(w) {
  must(w.journal.add({ text: '비밀일기JRN' }), 'journal');
  must(w.expenses.add({ amount: 73197, category: 'food', memo: '비밀지출EXP' }), 'expense');
  must(w.healthNotes.add({ text: '비밀건강메모HNT' }), 'health note');
  must(w.symptoms.save({ symptoms: ['headache'], note: '비밀증상SYM' }), 'symptom');
  const med = must(w.medication.add({ name: '비밀약MED', memo: '비밀약메모MEM' }), 'medication').medication;
  must(w.medication.setTaken(med.id, true), 'mark');
  must(w.checkIn.save({ status: 'hard', memo: '비밀안부CHK' }), 'check-in');
  must(w.help.add({ category: 'shopping', message: '비밀도움요청HLP' }), 'help request');
  must(w.sharing.set('SCHEDULE', 'SUMMARY'), 'sharing');
  must(w.posts.add({ type: 'QUESTION', category: 'LOCAL', title: '비밀글제목PST', body: '비밀글본문BDY' }), 'post');
  const g = must(w.groups.add({ name: '비밀모임GRP', category: 'WALKING', meetingStyle: 'OFFLINE', description: '비밀모임설명DSC' }), 'group').group;
  must(w.meetups.add(g.id, { title: '비밀모임일정MTP', date: TODAY, time: '08:30', placeText: '비밀장소PLC' }), 'meetup');
  must(w.schedule.add({ title: '일정제목EVT', date: TODAY }), 'event');
  must(w.tasks.add({ title: '할일제목TSK', dueDate: TODAY }), 'task');
  return med;
}
const MARKERS = ['JRN', '73197', 'EXP', 'HNT', 'SYM', 'MED', 'MEM', 'CHK', 'HLP', 'PST', 'BDY', 'GRP', 'DSC', 'MTP', 'PLC'];

/* ═════════ data integrity ═════════ */

test('RH-01 medication delete preserves history: a removed medication leaves the plan, never the days already marked', () => {
  const w = world();
  const a = w.medication.add({ name: '혈압약', time: '08:00' }).medication;
  const b = w.medication.add({ name: '비타민' }).medication;
  for (const d of [0, 1, 2, 5]) w.medication.setTaken(a.id, d !== 2, addDays(TODAY, -d));
  w.medication.setTaken(b.id, true, TODAY);
  const logsBefore = w.backend.getItem(`${KEY_PREFIX}medicationLogs`);
  assert.deepEqual(w.medication.remove(a.id), { ok: true });
  assert.deepEqual(w.medication.list().map((m) => m.name), ['비타민'], 'gone from the plan');
  assert.equal(w.backend.getItem(`${KEY_PREFIX}medicationLogs`), logsBefore, 'the marks are byte-for-byte what they were');
  assert.deepEqual(w.medication.loggedDates(), [addDays(TODAY, -5), addDays(TODAY, -2), addDays(TODAY, -1), TODAY]);
  const today = w.medication.historyForDate(TODAY);
  assert.deepEqual(today.map((r) => [r.name, r.time, r.taken, r.marked, r.removed]), [['혈압약', '08:00', true, true, true], ['비타민', '', true, true, false]]);
  assert.deepEqual(w.medication.historyForDate(addDays(TODAY, -2)).filter((r) => r.removed).map((r) => [r.name, r.taken]), [['혈압약', false]], 'a day marked "not taken" is kept as that');
  assert.deepEqual(w.medication.historyForDate(addDays(TODAY, -3)).filter((r) => r.removed), [], 'a day never marked shows nothing for it');
  assert.deepEqual(w.medication.listForDate(TODAY).map((m) => m.name), ['비타민'], 'today\'s list is the plan only');
  assert.deepEqual(w.medication.setTaken(a.id, false, TODAY), { ok: false, reason: 'NOT_FOUND' }, 'history is read-only');
  assert.equal(w.medication.remove(a.id).reason, 'NOT_FOUND');
  /* a mark from before names were saved with it gets the name at removal — never an unnamed or lost row */
  const old = world({ [`${KEY_PREFIX}medications`]: JSON.stringify({ items: [{ id: 'md_mg1abc000001', name: '옛 약' }] }), [`${KEY_PREFIX}medicationLogs`]: JSON.stringify({ items: { '2026-10-02': { md_mg1abc000001: { taken: true } } } }) });
  assert.equal(old.medication.remove('md_mg1abc000001').ok, true);
  assert.deepEqual(old.medication.historyForDate('2026-10-02').map((r) => [r.name, r.taken, r.removed]), [['옛 약', true, true]]);
  /* storage refusing the write leaves everything as it was */
  const full = world();
  const m = full.medication.add({ name: '검증약' }).medication;
  full.storage.set('medicationLogs', { items: { [TODAY]: { [m.id]: { taken: true } } } });
  const failing = createMedicationStore({ get: full.storage.get, set: () => false }, { now: full.now });
  assert.equal(failing.remove(m.id).ok, false);
  assert.equal(full.medication.count(), 1);
  /* the screens say so, and show the row without a control */
  assert.match(JS['life-health.js'], /isLocked: \(item\) => item\.removed === true,/);
  assert.match(JS['life-health.js'], /목록에서 지운 약 · 기록만 남아 있어요/);
  assert.match(JS['life-health.js'], /약을 목록에서 지워도 표시해 둔 날의 기록은 남습니다\./);
  assert.match(JS['home-list.js'], /if \(!checkable \|\| locked\) return el\('div', \{ class: 'og-home-item__main og-home-item__main--plain' \}/);
});

test('RH-02 medication historical snapshot: changing the days does not rewrite how a past day reads', () => {
  const w = world();
  w.clock.t = NOW - 20 * DAY;
  const m = w.medication.add({ name: '검증약', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }).medication;
  w.clock.t = NOW;
  const pastDay = addDays(TODAY, -6); /* a Sunday: 2026-09-27 */
  assert.equal(new Date(2026, 8, 27).getDay(), 0);
  assert.equal(w.medication.historyForDate(pastDay).length, 1, 'planned every day back then');
  w.medication.setTaken(m.id, true, addDays(TODAY, -4));
  /* from today: weekdays only */
  const u = must(w.medication.update(m.id, { daysOfWeek: [1, 2, 3, 4, 5] }), 'update').medication;
  assert.deepEqual(u.schedule, [{ from: addDays(TODAY, -20), daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }, { from: TODAY, daysOfWeek: [1, 2, 3, 4, 5] }]);
  assert.deepEqual(w.medication.historyForDate(pastDay).map((r) => [r.name, r.taken, r.marked]), [['검증약', false, false]], 'that past Sunday was a planned day and still reads as one');
  assert.deepEqual(w.medication.historyForDate(addDays(TODAY, -4)).map((r) => [r.taken, r.marked]), [[true, true]], 'a marked day is untouched');
  assert.equal(w.medication.listForDate(addDays(TODAY, 1)).length, 0, 'tomorrow is a Sunday: no longer planned');
  assert.equal(w.medication.listForDate(addDays(TODAY, 2)).length, 1);
  /* a second change the same day replaces today's step; a later one is appended; the list is bounded */
  w.medication.update(m.id, { daysOfWeek: [1, 3, 5] });
  assert.equal(w.medication.list()[0].schedule.length, 2);
  for (let i = 1; i <= 40; i++) { w.clock.t = NOW + i * DAY; w.medication.update(m.id, { daysOfWeek: i % 2 ? [1] : [2] }); }
  assert.equal(w.medication.list()[0].schedule.length, L.MEDICATION_SCHEDULE_MAX);
  /* name, time or memo changes add no step; entries written before Phase 11 read as before */
  const plain = world();
  const p = plain.medication.add({ name: '약' }).medication;
  assert.equal('schedule' in plain.medication.update(p.id, { name: '새 이름', time: '09:00' }).medication, false);
  assert.deepEqual(L.medicationDaysOn({ daysOfWeek: [1, 2] }, TODAY), [1, 2]);
  assert.deepEqual(L.normalizeMedicationSchedule([{ from: 'x', daysOfWeek: [1] }, { from: TODAY, daysOfWeek: [9] }, null, { from: TODAY, daysOfWeek: [6, 0] }]), [{ from: TODAY, daysOfWeek: [0, 6] }], 'damaged steps are dropped');
});

test('RH-03 old storage migration: data written by earlier phases is read without loss, defaults fill what is missing', () => {
  const id = (p) => `${p}_mg1abc000001`;
  const eras = {
    /* Phase 1: profile, preferences, onboarding, saved, notifications — no schemaVersion on some, unknown fields on others */
    phase1: { profile: { nickname: '옛이름', region: '서울', legacyField: 1 }, preferences: { textSize: 'large', unknownPref: true }, onboarding: { status: 'completed' }, saved: { items: [{ type: 'PLACE', id: 'old1', title: '옛 장소', href: 'https://example.org/old' }] }, notifications: { items: [] } },
    /* Phase 2A/2B: one-field records, medication without days, daily life without meal slots, marks without a name */
    phase2: { checkins: { items: { '2026-10-02': { status: 'good' } } }, events: { items: [{ id: id('ev'), title: '옛 일정', date: TODAY }] }, medications: { items: [{ id: id('md'), name: '옛 약' }] }, medicationLogs: { items: { '2026-10-02': { [id('md')]: { taken: true } } } }, dailyLife: { items: { '2026-10-02': { meals: 2, water: 3, exercise: true } } }, tasks: { items: [{ id: id('tk'), title: '옛 할 일' }] }, routines: { items: [{ id: id('rt'), title: '옛 루틴', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }] }, journal: { items: [{ id: id('jn'), date: '2026-10-01', text: '옛 기록' }] }, expenses: { items: [{ id: id('ex'), date: '2026-10-01', category: 'food', amount: 5000 }] } },
    /* Phase 3: health detail */
    phase3: { symptoms: { items: { '2026-10-02': { symptoms: ['headache'] } } }, healthNotes: { items: [{ id: id('hn'), date: '2026-10-02', text: '옛 건강 메모' }] } },
    /* Phase 6: community drafts */
    phase6: { communityPosts: { items: [{ id: id('cp'), type: 'QUESTION', category: 'LOCAL', title: '옛 글', body: '옛 본문' }] }, groupDrafts: { items: [{ id: id('gd'), name: '옛 모임', category: 'WALKING', meetingStyle: 'OFFLINE' }] } },
    /* Phase 7: a saved product next to an older saved place, plus an entry of a type that no longer exists */
    phase7: { saved: { items: [{ type: 'PRODUCT', id: 'p1', title: '옛 상품', href: '#store' }, { type: 'PLACE', id: 'old1', title: '옛 장소', href: 'https://example.org/old' }, { type: 'TASK', id: 'x', title: '없는 종류' }, null, 'text'] } },
  };
  for (const [era, collections] of Object.entries(eras)) {
    const seed = Object.fromEntries(Object.entries(collections).map(([c, v]) => [KEY_PREFIX + c, JSON.stringify(v)]));
    const before = JSON.stringify(seed);
    let w;
    assert.doesNotThrow(() => { w = world(seed); }, era);
    assert.doesNotThrow(() => { w.schedule.listForDate(TODAY); w.tasks.list(); w.routines.listForDate(TODAY); w.medication.historyForDate('2026-10-02'); w.checkIn.get('2026-10-02'); w.dailyLife.get('2026-10-02'); w.journal.recent(); w.symptoms.get('2026-10-02'); w.healthNotes.listForDate('2026-10-02'); w.saved.list(); w.posts.list(); w.groups.list(); w.profile.getProfile(); w.profile.getPreferences(); w.notifications.list(); }, era);
    assert.equal(JSON.stringify(Object.fromEntries(w.backend.keys().map((k) => [k, w.backend.getItem(k)]))), before, `${era}: reading rewrites nothing`);
  }
  const p1 = world(Object.fromEntries(Object.entries(eras.phase1).map(([c, v]) => [KEY_PREFIX + c, JSON.stringify(v)])));
  assert.deepEqual([p1.profile.getProfile().nickname, p1.profile.getProfile().region, 'legacyField' in p1.profile.getProfile()], ['옛이름', '서울', false]);
  assert.deepEqual(p1.saved.list().map((s) => [s.type, s.title, s.href]), [['PLACE', '옛 장소', 'https://example.org/old']]);
  const p2 = world(Object.fromEntries(Object.entries(eras.phase2).map(([c, v]) => [KEY_PREFIX + c, JSON.stringify(v)])));
  assert.deepEqual(p2.schedule.listForDate(TODAY).map((e) => [e.title, e.time, e.completed]), [['옛 일정', '', false]]);
  assert.deepEqual(p2.medication.list().map((m) => [m.name, m.daysOfWeek.length, m.time]), [['옛 약', 7, '']], 'no days = every day');
  assert.deepEqual(p2.medication.historyForDate('2026-10-02').map((r) => [r.name, r.taken]), [['옛 약', true]], 'a mark without a snapshot still shows');
  assert.deepEqual([p2.dailyLife.get('2026-10-02').meals, p2.dailyLife.get('2026-10-02').mealSlots, p2.dailyLife.get('2026-10-02').water], [2, null, 3]);
  assert.deepEqual([p2.checkIn.get('2026-10-02').status, p2.tasks.list()[0].priority, p2.tasks.list()[0].dueDate], ['good', 'normal', '']);
  assert.equal(p2.journal.recent()[0].text, '옛 기록');
  const p3 = world(Object.fromEntries(Object.entries(eras.phase3).map(([c, v]) => [KEY_PREFIX + c, JSON.stringify(v)])));
  assert.deepEqual([p3.symptoms.get('2026-10-02').symptoms, p3.healthNotes.listForDate('2026-10-02')[0].text], [['headache'], '옛 건강 메모']);
  const p6 = world(Object.fromEntries(Object.entries(eras.phase6).map(([c, v]) => [KEY_PREFIX + c, JSON.stringify(v)])));
  assert.deepEqual([p6.posts.list()[0].title, p6.groups.list()[0].name, p6.meetups.countsByGroup()], ['옛 글', '옛 모임', {}]);
  const p7 = world(Object.fromEntries(Object.entries(eras.phase7).map(([c, v]) => [KEY_PREFIX + c, JSON.stringify(v)])));
  assert.deepEqual(p7.saved.list().map((s) => s.type).sort(), ['PLACE', 'PRODUCT'], 'unknown and damaged entries are skipped, the rest stay');
  /* writing after an old read keeps the old entries */
  must(p2.tasks.add({ title: '새 할 일' }), 'add');
  assert.deepEqual(p2.tasks.list().map((t) => t.title).sort(), ['새 할 일', '옛 할 일']);
});

test('RH-04 account erase inventory: every ONGIL key goes — known collections and stray ones — and nothing else', () => {
  /* Family Connection V1: + family (BEFORE 26, AFTER 27) */ /* My Life V2: + memos (BEFORE 27, AFTER 28) */ assert.equal(COLLECTIONS.length, 28); // Completion V3: + emergencyContacts
  assert.deepEqual(Object.keys(CLASSIFICATION).sort(), [...COLLECTIONS].sort(), 'every collection is classified');
  assert.deepEqual(unclassified(), []);
  /* every collection a module reads or writes is a declared collection */
  const used = new Set();
  for (const f of JS_FILES) for (const m of code(JS[f]).matchAll(/storage\.(?:get|set|remove)\('([A-Za-z]+)'/g)) used.add(m[1]);
  for (const m of ALL_CODE.matchAll(/collection: '([A-Za-z]+)'/g)) used.add(m[1]);
  for (const m of ALL_CODE.matchAll(/listStore\(storage, '([A-Za-z]+)'/g)) used.add(m[1]);
  for (const c of used) assert.ok(COLLECTIONS.includes(c), `${c} is written but not declared`);
  assert.ok(used.size >= 20, [...used].join());
  assert.equal(/localStorage\.|sessionStorage\.|indexedDB|document\.cookie/.test(code(JS_FILES.filter((f) => f !== 'storage.js').map((f) => JS[f]).join('\n'))), false, 'no module stores anything outside the storage layer');
  const w = world({ 'livon.keep': 'L', 'newon-app-theme': 'dark', 'ongil': 'not-ours', 'ongilx.v1.tasks': 'not-ours', [`${KEY_PREFIX}unknownFuture`]: '{"x":1}', [`${KEY_PREFIX}`]: 'edge' });
  for (const c of COLLECTIONS) w.storage.set(c, { items: [] });
  fillPrivate(w);
  w.analytics.track('app_open');
  /* Family Connection V1: + family (BEFORE 26, AFTER 27) */
  assert.equal(w.storage.list().length, 28); // Completion V3: + emergencyContacts · My Life V2: + memos (BEFORE 27, AFTER 28)
  assert.equal(w.storage.clear(), true);
  assert.deepEqual(w.backend.keys().sort(), ['livon.keep', 'newon-app-theme', 'ongil', 'ongilx.v1.tasks'], 'Phase 11: a stray key under ONGIL\'s prefix is erased too; other products are untouched');
  assert.equal(w.storage.clear(), true, 'erasing twice is harmless');
  assert.equal(w.tasks.count() + w.journal.count() + w.posts.count() + w.medication.count(), 0);
  assert.equal(w.analytics.summary().empty, true);
  assert.match(JS['account-view.js'], /const ok = storage\.clear\(\);/);
  /* a backend that fails half-way reports it instead of pretending */
  const flaky = createMemoryBackend({ [`${KEY_PREFIX}tasks`]: '{}', [`${KEY_PREFIX}zzz`]: '{}' });
  const remove = flaky.removeItem;
  flaky.removeItem = (k) => { if (k.endsWith('zzz')) throw new Error('x'); remove(k); };
  assert.equal(createStorage({ backend: flaky }).clear(), false);
});

test('RH-05 privacy leak matrix: no personal text reaches search, saved, sync, family, community, analytics, the assistant or the operations view', async () => {
  const w = world();
  const synced = [];
  w.storage.subscribe((change) => { const out = syncChange(change); if (out) synced.push(JSON.stringify(out)); });
  fillPrivate(w);
  w.saved.save({ type: 'POST', id: 'sp1', title: '비밀저장글SVP', href: '#community' });
  w.saved.save({ type: 'PLACE', id: 'pl1', title: '공개 장소', href: '#enjoy' });
  const markers = [...MARKERS, 'SVP'];
  /* class → what it may do (the matrix), derived for every collection */
  for (const c of COLLECTIONS) {
    const cls = CLASSIFICATION[c];
    assert.ok(DATA_CLASSES.includes(cls), c);
    if (cls !== 'APP') assert.deepEqual([maySync(c), isSyncable(c), maySearchGlobally(c)], [false, false, false], c);
  }
  assert.equal(familySharingAllowed(), false);
  /* GLOBAL SEARCH */
  const search = createSearch();
  search.registerProvider(createAreaProvider(AREAS));
  search.registerProvider(createSavedProvider(w.saved, C.SAVED_TYPE_LABELS));
  search.registerProvider(createCareProvider(() => []));
  search.registerProvider(createEnjoyProvider(() => []));
  search.registerProvider(createStoreProvider(() => []));
  for (const q of [...markers, '비밀', 'hard', '일정제목', '할일제목']) assert.deepEqual((await search.query(q)).results, [], `search: ${q}`);
  assert.equal((await search.query('공개 장소')).results.length, 1);
  /* SYNC: only profile / preferences / onboarding / saved public items could ever leave */
  const out = synced.join('\n');
  for (const m of markers) assert.equal(out.includes(m), false, `sync: ${m}`);
  assert.ok(out.includes('공개 장소'));
  /* ANALYTICS */
  const inst = createInstrumentation((n, p, s) => w.analytics.track(n, p, s));
  inst.posts(w.posts).add({ type: 'QUESTION', category: 'LOCAL', title: '비밀글제목PST', body: '비밀글본문BDY' });
  inst.checkIn(w.checkIn).set('help');
  const counters = w.backend.getItem(`${KEY_PREFIX}analytics`);
  for (const m of [...markers, 'hard', 'help', 'shopping', 'SUMMARY']) assert.equal(counters.includes(m), false, `analytics: ${m}`);
  /* ASSISTANT: it holds the calendar, tasks, routines, saved, search and the connection state — nothing else */
  const assistant = T.createAssistant({ now: w.now, schedule: w.schedule, tasks: w.tasks, routines: w.routines, saved: w.saved, search, familyConnection });
  let heard = '';
  for (const text of ['오늘', '오늘 일정 알려줘', '저장한 것 보여줘', '가족에게 보여줘', '내 일기 보여줘', '내가 먹는 약 알려줘', '오늘 안부 뭐였지', '이번 달 지출 알려줘', '증상 기록 보여줘', '커뮤니티 글 보여줘', '모임 보여줘', '비밀 찾아줘 서비스', '뭘 할 수 있어']) heard += JSON.stringify((await assistant.handle(text)).result);
  for (const m of markers) assert.equal(heard.includes(m), false, `assistant: ${m}`);
  assert.ok(heard.includes('일정제목EVT') && heard.includes('할일제목TSK'), 'the day\'s own plan is the one personal thing it reads');
  /* OPERATIONS VIEW */
  const ops = JSON.stringify([buildContentStatus({ storage: w.storage, savedCounts: w.saved.counts() }), buildSystemStatus({ storage: w.storage, search }), buildPrivacyMatrix()]);
  for (const m of [...markers, 'EVT', 'TSK']) assert.equal(ops.includes(m), false, `admin: ${m}`);
  /* FAMILY and COMMUNITY: nothing is delivered anywhere */
  for (const flags of [w.help.delivery, w.posts.delivery, w.checkIn.delivery]) assert.equal(Object.values(flags).every((v) => v === false || v === 0), true, JSON.stringify(flags));
  assert.equal(/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(code(['family.js', 'family-view.js', 'community.js', 'community-view.js', 'checkin.js', 'medication.js', 'symptoms.js', 'health-notes.js', 'journal.js', 'expenses.js', 'assistant-tools.js', 'analytics.js'].map((f) => JS[f]).join('\n'))), false, 'the modules that hold personal records have no network code');
  /* the only modules that can make a request are the public-data source and nothing personal is passed to it */
  /* Family Connection V2: + family-remote.js (BEFORE ['app.js', 'data-source.js']). It sends only what the owner chose for a member, never a record. */
  assert.deepEqual(JS_FILES.filter((f) => /\bfetch\(|fetcher\(/.test(code(JS[f]))), ['app.js', 'data-source.js', 'family-remote.js'], 'app.js hands the browser\'s fetch to the data source and to the family account client');
  assert.equal(/journal|expense|symptom|healthNote|storage\./i.test(code(JS['family-remote.js'])), false, 'the family client reads no record store');
  assert.equal(/journal|expense|symptom|medication|checkin|healthNote|helpRequest|nickname/i.test(code(JS['data-source.js'])), false);
});

/* ═════════ security ═════════ */

test('RH-06 unsafe URL inventory: every link is https, an ONGIL hash or a same-site path; outside links open safely', () => {
  for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', ' javascript:x', 'data:text/html,x', 'vbscript:x', 'file:///etc/passwd', 'http://insecure.example.test/', '//evil.example.test/x', 'https://user:pw@evil.example.test/', 'ftp://x.test/', 'blob:https://x', 'about:blank', 'https://ok.example.test/"onmouseover=x', 'https://ok.example.test/<script>', '\u0000https://x.test/']) assert.equal(C.safeHref(bad), '', bad);
  for (const ok of ['https://example.org/a?b=1', '#life/calendar', '/ko/ongil/']) assert.equal(C.safeHref(ok), ok, ok);
  /* every anchor in the modules is built by el(): its href passes through safeHref */
  assert.match(JS['dom.js'], /else if \(key === 'href'\) \{\n\s+const safe = safeHref\(String\(value\)\);\n\s+if \(safe\) node\.setAttribute\('href', safe\);/);
  for (const f of JS_FILES) {
    const src = code(JS[f]);
    assert.equal(/setAttribute\('(href|src|action|formaction|srcdoc)'/.test(src) && f !== 'dom.js' && f !== 'film.js', false, `${f} sets no address by hand`);
    assert.equal(/window\.open|location\.(href|assign|replace)\s*[=(]|\.action\s*=|srcdoc|document\.domain/.test(src), false, f);
  }
  /* film.js sets a video address from the page's own data attribute, nothing else */
  assert.match(JS['film.js'], /if \(!video\.getAttribute\('src'\) && video\.dataset\.ogSrc\) video\.setAttribute\('src', video\.dataset\.ogSrc\);/);
  /* a link that leaves ONGIL: new window, no opener, no referrer — every one of them */
  const outside = [...ALL_CODE.matchAll(/target: '_blank'[^}]*/g)].map((m) => m[0]);
  assert.ok(outside.length >= 6);
  for (const o of outside) assert.match(o, /rel: 'noopener noreferrer'/, o.slice(0, 60));
  assert.equal((HTML.match(/target="_blank"/g) || []).length, 0);
  /* addresses written in the page and the modules: fonts and the films, nothing else */
  const hosts = [...new Set([...`${ALL_CODE}\n${HTML}\n${Object.values(CSS).join('\n')}`.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1]))].sort();
  assert.deepEqual(hosts, ['d8j0ntlcm91z4.cloudfront.net', 'fonts.googleapis.com', 'fonts.gstatic.com']);
  assert.equal(/http:\/\//.test(`${ALL_CODE}\n${HTML}`), false, 'no plain-http address');
  /* the only place the address bar is written: a hash from routes.js / router.js */
  const writes = [...ALL_CODE.matchAll(/location\.hash = ([^;]+);/g)].map((m) => m[1].trim());
  for (const wr of writes) assert.match(wr, /^(lifeHash\(.+\)|careHash\(.+\)|enjoyHash\(.+\)|storeHash\(.+\)|communityHash\(.+\)|adminHash\(.+\)|'#[a-z]+(\/[a-z-]+)?'|safe|target|`#(care|enjoy|store|community)\/\$\{[a-zA-Z.()]+\}`)$/, wr);
});

test('RH-07 dynamic HTML inventory: no markup, script or style is ever built from text', () => {
  const BANNED = /\.innerHTML|\.outerHTML|insertAdjacentHTML|document\.write|DOMParser|createContextualFragment|\beval\(|new Function\(|Function\(['"`]|setTimeout\(\s*['"`]|setInterval\(\s*['"`]|createElement\('script'\)|createElement\('style'\)|createElement\('iframe'\)|\.cssText|insertRule|importScripts|import\(/;
  for (const f of JS_FILES) assert.equal(BANNED.test(code(JS[f])), false, f);
  /* one place creates elements; text goes in as text */
  assert.deepEqual(JS_FILES.filter((f) => /document\.createElement\(/.test(code(JS[f]))), ['dom.js']);
  assert.match(JS['dom.js'], /else if \(key === 'text'\) node\.textContent = String\(value\);/);
  assert.match(JS['dom.js'], /node\.append\(child instanceof Node \? child : document\.createTextNode\(String\(child\)\)\);/);
  /* inline handlers and inline script are not written by the modules; the page has one inline script (the pre-paint route map) */
  assert.equal(/setAttribute\('on[a-z]+'|\bon[a-z]+=["']/.test(ALL_CODE), false);
  assert.equal((HTML.match(/<script>/g) || []).length, 1);
  assert.equal(/\son[a-z]+="/.test(HTML), false, 'no inline event handler in the page');
  assert.equal(/<iframe|<object|<embed|<base\b/i.test(HTML), false);
});

test('RH-08 secret scan: nothing that looks like a key, token, credential or private key in the shipped source', () => {
  const SHAPES = [/sk-[A-Za-z0-9_-]{20,}/, /AIza[0-9A-Za-z_-]{30,}/, /KakaoAK\s+[0-9a-f]{20,}/i, /Bearer\s+[A-Za-z0-9._-]{24,}/, /gh[pousr]_[A-Za-z0-9]{30,}/, /xox[baprs]-[A-Za-z0-9-]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /serviceKey=[A-Za-z0-9%+/=]{16,}/i, /(api[_-]?key|secret|token|password|passwd|authorization)["']?\s*[:=]\s*["'][A-Za-z0-9+/=_-]{12,}["']/i, /\b(?![0-9a-f]{40}\b)[0-9a-f]{32,}\b/, /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}\./, /AKIA[0-9A-Z]{16}/];
  /* the film addresses contain long ids of public video files on the media host; they are checked on their own line below */
  const strip = (text) => text.replace(/https:\/\/d8j0ntlcm91z4\.cloudfront\.net\/[A-Za-z0-9_./-]+\.mp4/g, '');
  const files = { ...Object.fromEntries(JS_FILES.map((f) => [`js/${f}`, JS[f]])), ...Object.fromEntries(CSS_FILES.map((f) => [`styles/${f}`, CSS[f]])), 'index.html': HTML };
  for (const [name, text] of Object.entries(files)) for (const shape of SHAPES) assert.equal(shape.test(strip(text)), false, `${name} matches ${shape}`);
  assert.equal((HTML.match(/https:\/\/d8j0ntlcm91z4\.cloudfront\.net\/[A-Za-z0-9_./-]+\.mp4/g) || []).length, 8, 'eight public film files, one per screen with a film (Completion V2: + Store)');
  /* names of server settings do not appear in the client either; the API location comes from the site's public config object */
  assert.equal(/OPENAI|UPSTASH|FIREBASE_|_API_KEY|_SECRET|_TOKEN|process\.env|import\.meta\.env/.test(`${ALL_CODE}\n${HTML}`), false);
  assert.match(APP, /const apiConfig = win\.LivonApi && typeof win\.LivonApi\.url === 'function' \? win\.LivonApi : null;/);
  assert.equal(/headers:\s*\{[^}]*(authorization|x-api-key)/i.test(ALL_CODE), false, 'no credential header is sent');
});

test('RH-09 provider malformed data: untrusted answers are cleaned item by item — one bad item never spoils the rest', () => {
  const good = { type: 'FACILITY', id: 'f1', name: '검증 복지관', address: '서울 검증로 1', sourceName: '검증 출처', sourceUrl: 'https://source.example.test/f1' };
  const junk = [null, undefined, 5, 'text', [], {}, { type: 'FACILITY' }, { id: 'x' }, { type: 'NOPE', id: 'n', title: '모르는 종류' }, { ...good, id: 'f2', name: '' }, { ...good, id: '' }, { ...good, id: 'f4', sourceName: '' }];
  for (const sanitize of [sanitizeCareItems, sanitizeEnjoyItems, sanitizeProducts]) for (const bad of [null, undefined, 5, 'text', {}, { items: [] }, () => 1]) assert.deepEqual(sanitize(bad), [], String(bad));
  const care = sanitizeCareItems([...junk, good, { ...good, id: 'f1', name: '같은 id' }, { ...good, id: 'f3', name: '가'.repeat(5000), address: '나'.repeat(5000), sourceUrl: 'javascript:alert(1)', mapUrl: 'http://insecure.example.test/', phone: '02-000-0000<script>', html: '<b>x</b>', ...JSON.parse('{"__proto__":{"polluted":true},"constructor":"x"}') }]);
  assert.deepEqual(care.map((c) => c.id), ['f1', 'f3'], 'bad items dropped, duplicate id dropped, the rest kept');
  assert.deepEqual([care[1].title.length, care[1].address.length], [120, 160], 'oversized text is cut');
  assert.deepEqual([care[1].sourceUrl || '', care[1].mapUrl || ''], ['', ''], 'unsafe addresses are removed');
  assert.equal('html' in care[1] || 'polluted' in care[1] || care[1].phone !== '', false, 'unknown fields do not pass; a phone with markup is dropped');
  assert.equal(({}).polluted, undefined);
  const enjoyGood = { type: 'CLASS', id: 'e1', title: '검증 강좌', category: 'LEARNING', organization: '검증 기관', sourceName: '검증 출처' };
  const enjoy = sanitizeEnjoyItems([...junk, enjoyGood, { ...enjoyGood, id: 'e2', category: 'UNKNOWN' }, { ...enjoyGood, id: 'e3', type: 'WEBINAR' }, { ...enjoyGood, id: 'e4', sourceUrl: 'data:text/html,x', startDate: 'not-a-date' }]);
  assert.ok(enjoy.some((e) => e.id === 'e1'));
  assert.equal(enjoy.some((e) => e.id === 'e2' || e.id === 'e3'), false, 'unknown enum values are refused');
  for (const e of enjoy) assert.equal(/^(javascript|data|http:)/.test(e.sourceUrl || ''), false);
  const product = { id: 'p1', name: '검증 상품', category: 'MOBILITY', summary: '걷기 도움', sellerName: '검증판매처', sellerUrl: 'https://seller.example.test/p1', sourceName: '검증 출처' };
  const products = sanitizeProducts([...junk, product, { ...product, id: 'p1' }, { ...product, id: 'p2', sellerUrl: 'javascript:alert(1)', imageUrl: 'http://x.test/a.png', price: 1000, rating: 5, reviews: 200, stock: 3 }, { ...product, id: 'p3', category: 'WEAPONS' }]);
  assert.deepEqual(products.map((p) => p.id).sort(), products.map((p) => p.id).sort().filter((v, i, a) => a.indexOf(v) === i), 'no duplicate ids');
  assert.ok(products.some((p) => p.id === 'p1'));
  for (const p of products) {
    assert.equal(/^(javascript|data|http:)/.test(`${p.sellerUrl || ''}${p.imageUrl || ''}`), false, p.id);
    assert.equal('rating' in p || 'reviews' in p || 'stock' in p, false, 'no rating, review count or stock is taken from a source');
  }
  assert.equal(products.some((p) => p.id === 'p3'), false);
  /* the search layer cleans whatever a provider hands back */
  const s = createSearch();
  s.registerProvider({ id: 'care', label: '돌봄', scope: 'PUBLIC', supportedTypes: [], search: () => ({ not: 'a list' }) });
  s.registerProvider({ id: 'enjoy', label: '즐길거리', scope: 'PUBLIC', supportedTypes: [], search: () => [null, 5, { title: 'no id' }, { id: 'ok', title: '검증', route: 'https://evil.example.test/', type: 'CLASS', description: '설'.repeat(5000) }] });
  return s.query('검증').then((o) => {
    assert.deepEqual(o.results.map((r) => [r.id, r.route]), [['ok', '#enjoy']]);
    assert.ok(o.results[0].description.length <= C.LIMITS.description);
  });
});

test('RH-10 invalid route inventory: every address ONGIL accepts is listed; everything else is corrected or ignored', () => {
  const accepted = Object.keys(ROUTE_ALIASES).filter(Boolean).sort();
  assert.deepEqual(accepted, ['account', 'admin', 'care', 'community', 'enjoy', 'family', 'health', 'home', 'learn', 'life', 'ongil-home', 'profile', 'saved', 'settings', 'share', 'store', 'support'].sort());
  for (const a of accepted) assert.ok([...VIEWS, ...INTERNAL_VIEWS].includes(resolveView(`#${a}`)), a);
  /* the page's pre-paint map agrees with the router, so a deep link never flashes another screen */
  const pre = Object.fromEntries([...HTML.matchAll(/"([a-z-]+)": "([a-z]+)"/g)].map((m) => [m[1], m[2]]));
  assert.deepEqual(Object.keys(pre).sort(), accepted);
  for (const a of accepted) assert.equal(pre[a], resolveView(`#${a}`), a);
  /* one screen per view, and each view's canonical address resolves back to it */
  for (const v of [...VIEWS, ...INTERNAL_VIEWS]) {
    assert.equal((HTML.match(new RegExp(`data-og-screen="${v}"`, 'g')) || []).length, 1, v);
    assert.equal(resolveView(hashFor(v)), v);
    assert.equal(R.canonicalHash(hashFor(v)), hashFor(v));
  }
  /* every menu entry leads to an address that exists (no orphan route) */
  for (const area of AREAS) for (const m of area.modules || []) {
    const route = R.moduleRoute(area, m.id);
    assert.equal(R.canonicalHash(route), route, `${area.id}.${m.id} → ${route}`);
  }
  assert.equal(R.moduleRoute(AREAS.find((a) => a.id === 'health'), 'records'), '#life/symptoms', 'Phase 11: 증상·건강 메모 opens where the records are');
  /* malformed, unknown and hostile addresses */
  const cases = { '#life/nope': '#life', '#health/x': '#health', '#store/a/b': '#store', '#care/FACILITY': '#care', '#admin/users': '#admin', '#life/': '#life', '#saved/1': '#saved', '#life/calendar/2026': '#life' };
  for (const [bad, fixed] of Object.entries(cases)) assert.equal(R.canonicalHash(bad), fixed, bad);
  assert.deepEqual([resolveView('#'), resolveView('')], ['home', 'home'], 'no address is Home');
  for (const junk of ['#nope', '#__proto__', '#constructor', '#toString/x', '#<script>', '#%3Cscript%3E', '#life"x', 'javascript:alert(1)', 'https://evil.example.test/#life', '#ADMIN', '#Life']) {
    assert.equal(resolveView(junk), null, junk);
    assert.equal(R.safeRoute(junk), '', junk);
  }
  /* Phase 11: an address that names no screen no longer stays in the address bar — unless it is a place on the page (#og-main) */
  assert.match(APP, /if \(hash && !resolveView\(hash\) && !inPageTarget\(hash\)\) win\.history\.replaceState\(null, '', hashFor\(router\.current\(\)\)\);/);
  assert.match(APP, /function inPageTarget\(hash\) \{\n\s+const id = typeof hash === 'string' \? hash\.slice\(1\) : '';\n\s+return \/\^\[A-Za-z\]\[\\w-\]\{0,60\}\$\/\.test\(id\) && !!doc\.getElementById\(id\);/);
  /* corrections use replaceState, which raises no hashchange: no loop, and Back does not return to the bad address */
  assert.equal((code(APP).match(/history\.replaceState\(/g) || []).length >= 9, true);
  assert.equal(/history\.pushState|location\.reload|location\.hash = win\.location\.hash/.test(ALL_CODE), false);
});

/* ═════════ accessibility ═════════ */

const VIEW_FILES = JS_FILES.filter((f) => /view|panels|home-|life-|saved-view|onboarding-view|account-view|views\.js|film\.js|navigation\.js/.test(f));

test('RH-11 keyboard full flow: everything that can be pressed is a real control, in the natural order, with no trap', () => {
  for (const f of VIEW_FILES) {
    const src = code(JS[f]);
    assert.equal(/el\('(div|span|p|li|h[1-6]|section|article|ul|ol|td|tr)', \{[^}]*\bonclick:/.test(src), false, `${f}: a click on something that is not a control`);
    assert.equal(/tabindex: '[1-9]|tabIndex = [1-9]/.test(src), false, `${f}: no forced tab order`);
    /* a keyboard trap would be a handler that cancels Tab */
    assert.equal(/key === 'Tab'/.test(src), false, `${f}: Tab is never intercepted`);
  }
  assert.equal(/tabindex="[1-9]/.test(HTML), false);
  /* tabs: arrows, Home and End, in both tab sets */
  for (const f of ['life-view.js', 'admin-view.js']) for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) assert.ok(JS[f].includes(`event.key === '${key}'`), `${f} ${key}`);
  /* header panels: Escape closes and gives focus back; a click outside closes */
  assert.match(JS['panels.js'], /if \(event\.key === 'Escape' && buttons\.some\(\(b\) => b\.getAttribute\('aria-expanded'\) === 'true'\)\) closeAll\(\{ restoreFocus: true \}\);/);
  /* detail screens are native modal dialogs: the browser keeps Tab inside and Escape closes */
  for (const f of ['care-view.js', 'enjoy-view.js', 'store-view.js', 'community-view.js', 'onboarding-view.js']) assert.match(JS[f], /showModal\(\)/, f);
  assert.ok((HTML.match(/<dialog /g) || []).length >= 1);
  /* forms submit with Enter: each form has a submit button */
  for (const f of ['home-list.js', 'panels.js', 'assistant-view.js']) assert.match(JS[f], /addEventListener\('submit'/, f);
  for (const form of HTML.match(/<form[\s\S]*?<\/form>/g) || []) assert.match(form, /<button type="submit">/);
  /* the calendar's days, filters and choices are buttons with a pressed state */
  assert.match(JS['life-plan.js'], /'aria-pressed'/);
  /* Phase 11: the first Tab reaches "본문으로 건너뛰기" although the shared header scripts move the starting point */
  assert.match(HTML, /<body>\s*<span class="visually-hidden" tabindex="-1" data-og-tab-start><\/span>\s*<a class="skip-link" href="#og-main" data-og-skip>본문으로 건너뛰기<\/a>/);
  assert.match(JS['accessibility.js'], /if \(!marker \|\| \(doc\.activeElement && doc\.activeElement !== doc\.body\)\) return false;\n\s+marker\.focus\(\{ preventScroll: true \}\);\n\s+marker\.blur\(\);/, 'only when nothing has focus — it never takes focus away from the person');
  assert.match(APP, /resetTabStart\(doc\);\nwin\.addEventListener\('load', \(\) => win\.setTimeout\(\(\) => resetTabStart\(doc\), 0\)\);/);
});

test('RH-12 focus full flow: focus is visible, moves with the screen, and is never left on something that was removed', () => {
  /* visible focus on every kind of control, on the dark page and on the white panels */
  assert.match(CSS['ongil-tokens.css'], /--og-focus: 3px solid var\(--og-white\);/);
  assert.match(CSS['ongil-app.css'], /\.og a:focus-visible, \.og button:focus-visible, \.og input:focus-visible, \.og select:focus-visible,/);
  assert.match(CSS['ongil-shell.css'], /\.og-panel a:focus-visible, \.og-panel button:focus-visible, \.og-panel input:focus-visible \{ outline: 3px solid var\(--og-panel-ink\); outline-offset: 2px; \}/);
  assert.match(CSS['ongil-shell.css'], /\.og-tool:focus-visible \{ outline: 3px solid currentColor; outline-offset: 2px; \}/);
  /* "outline: none" exists only for headings and containers that receive programmatic focus — and each has a :focus-visible ring */
  const none = [...Object.values(CSS).join('\n').matchAll(/([^{}\n]+)\{ outline: none; \}/g)].map((m) => m[1].trim());
  assert.deepEqual(none, ['.og h1:focus, .og h2:focus, .og-dialog h2:focus, #og-main:focus', '.og-life-panel:focus', '.og-daynav__date:focus']);
  assert.match(CSS['ongil-app.css'], /\.og h1:focus-visible, \.og h2:focus-visible, \.og-dialog h2:focus-visible \{ outline: var\(--og-focus\); outline-offset: 6px; \}/);
  /* a new screen: focus goes to its heading; the skip link moves focus into main */
  assert.match(APP, /if \(userInitiated && !\(view === 'life' && section\)\) focusView\(doc, view\);/);
  assert.match(JS['accessibility.js'], /if \(screen\) focusNode\(screen\.querySelector\('h1'\)\);/);
  assert.match(JS['accessibility.js'], /event\.preventDefault\(\);\n\s+focusNode\(main\);/);
  /* lists: the form gets focus when opened; 취소 returns to the button; after a delete focus goes to the card title */
  assert.match(JS['home-list.js'], /if \(pendingFocus === 'confirm'\) queueMicrotask\(\(\) => cancel\.focus\(\)\);/, 'a delete question focuses 취소');
  assert.match(JS['home-list.js'], /if \(target\) target\.focus\(\);\n\s+else card\.focusTitle\(\);/);
  /* panels and dialogs give focus back to what opened them */
  assert.match(JS['panels.js'], /if \(wasOpen && restoreFocus\) btn\.focus\(\);/);
  for (const f of ['care-view.js', 'enjoy-view.js', 'store-view.js']) assert.match(JS[f], /\.focus\(\)/, `${f} restores focus after its dialog`);
  assert.match(APP, /focusNode\(doc\.getElementById\('og-home-section-title'\)\);/, 'onboarding closing on a rebuilt Home keeps focus on the page');
  /* the long-list "더 보기" keeps focus on itself, so the next press continues */
  assert.match(JS['home-list.js'], /onclick: \(\) => \{ shown \+= LIST_PAGE; pendingFocus = 'more'; render\(\); \}/);
});

test('RH-13 static ARIA audit: landmarks, names, references and live regions in the page are complete and consistent', () => {
  assert.match(HTML, /<html lang="ko">/);
  assert.equal((HTML.match(/<main /g) || []).length, 1);
  assert.match(HTML, /<main class="og" id="og-main" tabindex="-1">/);
  assert.match(HTML, /<nav class="gnav__nav" aria-label="Ongil 메뉴">/);
  /* a region's heading is drawn by its view: the id is then written in that module (건강·안부 uses the shared template in views.js) */
  const madeByScript = (ref) => ALL_CODE.includes(`id: '${ref}'`) || (ref === 'og-health-section-title' && JS['views.js'].includes('const headingId = `og-${area.id}-section-title`;'));
  /* ids are unique; every aria-controls / aria-labelledby / for points at an id that exists */
  const ids = [...HTML.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `duplicate id: ${ids.filter((v, i) => ids.indexOf(v) !== i)}`);
  for (const attr of ['aria-controls', 'aria-labelledby', 'aria-describedby', 'for']) for (const m of HTML.matchAll(new RegExp(`\\s${attr}="([^"]+)"`, 'g'))) for (const ref of m[1].split(' ')) assert.ok(ids.includes(ref) || madeByScript(ref), `${attr}="${ref}" has a target`);
  /* one h1 per screen, each labelling its screen */
  const screens = [...HTML.matchAll(/<section class="og-screen" id="([a-z]+)" data-og-screen="[a-z]+" aria-labelledby="([a-z-]+)">/g)];
  assert.equal(screens.length, 11);
  for (const [, id, label] of screens) {
    const body = HTML.slice(HTML.indexOf(`id="${id}" data-og-screen`), HTML.indexOf('</section>', HTML.indexOf(`id="${id}" data-og-screen`)));
    assert.equal((body.match(/<h1/g) || []).length, 1, id);
    assert.ok(body.includes(`id="${label}"`), `${id} is labelled by its own heading`);
  }
  /* every button and field in the page has a name */
  for (const m of HTML.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)) assert.ok(/aria-label="[^"]+"/.test(m[1]) || m[2].replace(/<[^>]+>/g, '').trim().length > 0, m[0].slice(0, 80));
  for (const m of HTML.matchAll(/<(input|select)([^>]*)>/g)) { const id = (/\sid="([^"]+)"/.exec(m[2]) || [])[1]; assert.ok(/aria-label="[^"]+"/.test(m[2]) || (id && HTML.includes(`for="${id}"`)), m[0].slice(0, 80)); }
  for (const m of HTML.matchAll(/<img([^>]*)>/g)) assert.match(m[1], /\salt="[^"]*"/, 'every image says what it is, or that it is decorative');
  for (const m of HTML.matchAll(/<svg([^>]*)>/g)) assert.match(m[1], /aria-hidden="true"/, 'icons are decorative; their buttons carry the name');
  for (const m of HTML.matchAll(/<video([^>]*)>/g)) assert.match(m[1], /aria-hidden="true"|tabindex="-1"/, 'background films are not announced or focusable');
  /* states are attributes with words behind them */
  for (const tool of ['search', 'notifications', 'assistant']) assert.match(HTML, new RegExp(`data-og-tool="${tool}" aria-expanded="false" aria-controls="og-panel-${tool}" aria-label="[^"]+"`));
  assert.match(HTML, /aria-current="page"/);
  assert.equal((HTML.match(/role="status" aria-live="polite"/g) || []).length, 2, 'search and assistant status lines');
  const live = VIEW_FILES.concat(['home-ui.js', 'dom.js']).filter((f) => /role: '(status|alert)'|aria-live/.test(JS[f]));
  assert.ok(live.length >= 4, live.join());
  assert.match(JS['home-list.js'], /bad\.input\.setAttribute\('aria-invalid', 'true'\);/);
  assert.match(JS['home-list.js'], /const error = el\('p', \{ class: 'og-form-error', role: 'alert' \}\);/);
  for (const [f, attr] of [['life-view.js', "'aria-selected'"], ['admin-view.js', "'aria-selected'"], ['life-plan.js', "'aria-current'"], ['panels.js', "'data-og-note-read'"], ['navigation.js', 'aria-current']]) assert.ok(JS[f].includes(attr), `${f} ${attr}`);
  assert.match(JS['panels.js'], /n\.read \? '읽음' : '읽지 않음'/, 'read and unread are words');
  assert.equal(/aria-hidden="true"[^>]*tabindex="0"|role="presentation"[^>]*onclick/.test(HTML), false);
});

/* WCAG relative luminance and contrast, computed from the design tokens themselves */
const hex = (h) => { const v = h.replace('#', ''); const f = v.length === 3 ? v.split('').map((c) => c + c).join('') : v; return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16)); };
const lum = ([r, g, b]) => { const f = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (top, alpha, under) => top.map((c, i) => c * alpha + under[i] * (1 - alpha));

test('RH-14 contrast: every text colour on every surface is 4.5:1 or more; field and focus edges are 3:1 or more', () => {
  const token = (name) => (new RegExp(`--og-${name}: ([^;]+);`).exec(CSS['ongil-tokens.css']) || [])[1];
  const T = { bg: hex(token('bg')), surface: hex(token('surface')), deep: hex(token('surface-deep')), ink: hex(token('ink')), soft: hex(token('ink-soft')), muted: hex(token('muted')), white: hex(token('white')), accent: hex(token('accent')), accentInk: hex(token('accent-ink')), panel: hex(token('panel-bg')), panelInk: hex(token('panel-ink')) };
  const pairs = [['ink on bg', T.ink, T.bg], ['ink on surface', T.ink, T.surface], ['ink on deep', T.ink, T.deep], ['ink-soft on bg', T.soft, T.bg], ['ink-soft on surface', T.soft, T.surface], ['muted on bg', T.muted, T.bg], ['muted on surface', T.muted, T.surface], ['muted on deep', T.muted, T.deep], ['accent-ink on accent', T.accentInk, T.accent], ['chosen day (accent-ink on ink)', T.accentInk, T.ink], ['panel ink on panel', T.panelInk, T.panel], ['panel secondary #555 on panel', hex('#555'), T.panel]];
  for (const [name, fg, bg] of pairs) assert.ok(ratio(fg, bg) >= 4.5, `${name}: ${ratio(fg, bg).toFixed(2)}`);
  assert.ok(Math.abs(ratio(T.muted, T.surface) - 6.34) < 0.05, 'the lowest text contrast in the design is muted text on a card: 6.3:1 (also measured in the browser over 2,170 rendered text nodes)');
  /* literal greys used for text in the stylesheets all pass on the white panel */
  for (const m of CSS['ongil-shell.css'].matchAll(/\.og-panel__[a-z-]+ \{[^}]*color: (#[0-9a-f]{3,6})/g)) assert.ok(ratio(hex(m[1]), T.panel) >= 4.5, `${m[1]} on the panel`);
  /* non-text: the focus ring, a field's edge on the dark page, and (Phase 11) a field's edge on the white panel */
  assert.ok(ratio(T.white, T.bg) >= 3 && ratio(T.white, T.surface) >= 3, 'focus ring on dark');
  assert.ok(ratio(T.panelInk, T.panel) >= 3, 'focus ring on the panel');
  const strong = /--og-line-strong: rgba\(225, 224, 204, ([\d.]+)\);/.exec(CSS['ongil-tokens.css']);
  assert.ok(ratio(mix(T.ink, Number(strong[1]), T.bg), T.bg) >= 3, 'input edge on the page');
  assert.ok(ratio(mix(T.ink, Number(strong[1]), T.surface), T.surface) >= 3, 'input edge on a card');
  const panelEdge = /--og-panel-input-border: rgba\(0, 0, 0, ([\d.]+)\);/.exec(CSS['ongil-tokens.css']);
  assert.equal(panelEdge[1], '0.5');
  assert.ok(ratio(mix([0, 0, 0], Number(panelEdge[1]), T.panel), T.panel) >= 3, `panel field edge: ${ratio(mix([0, 0, 0], 0.5, T.panel), T.panel).toFixed(2)}`);
  assert.ok(ratio(mix([0, 0, 0], 0.14, T.panel), T.panel) < 1.5, 'BEFORE: 0.14 gave about 1.4:1');
  /* state is never colour alone: done, chosen, today, unread and current each have a word, a mark or a shape */
  assert.match(CSS['ongil-life.css'], /\.og-cal__day\[aria-current="date"\] \{ border-color: var\(--og-ink\); border-style: dashed; \}/);
  assert.match(CSS['ongil-home.css'], /\.og-home-item\.is-done \.og-home-item__title \{ text-decoration: line-through;/);
  assert.match(CSS['ongil-shell.css'], /\.og-panel__item\.is-unread \.og-panel__result-title::before \{ content: "● "; \}/);
  assert.match(CSS['ongil-shell.css'], /\.og-tool\[aria-current="page"\]::after/);
});

test('RH-15 reduced motion: films start still, reveals and transitions are off, and the person can always pause', async () => {
  const { motionAllowed } = await import('../../ongil-start/js/film.js').catch(() => ({ motionAllowed: null }));
  /* film.js imports the DOM helpers, which need no document at import time */
  assert.equal(typeof motionAllowed, 'function');
  assert.deepEqual([motionAllowed('system', true), motionAllowed('system', false), motionAllowed('off', false), motionAllowed('on', true)], [false, true, false, true], 'the device setting is followed unless the person chose otherwise');
  assert.match(JS['film.js'], /const reduceQuery = win\.matchMedia \? win\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(JS['film.js'], /playing \? '영상 멈춤' : '영상 재생'/, 'a visible, named pause control on every film (WCAG 2.2.2)');
  assert.match(CSS['ongil-app.css'], /\.og-motion \{[^}]*min-height: var\(--og-control\)/);
  const reduce = [...Object.entries(CSS)].filter(([, css]) => css.includes('@media (prefers-reduced-motion: reduce)')).map(([f]) => f);
  assert.deepEqual(reduce, ['ongil-app.css', 'ongil-shell.css']);
  assert.match(CSS['ongil-shell.css'], /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?opacity: 1 !important; transform: none !important; transition: none !important; \}/);
  assert.match(CSS['ongil-app.css'], /@media \(prefers-reduced-motion: reduce\) \{\n\s+\.og-btn \{ transition: none; \}\n\s+html \{ scroll-behavior: auto; \}/);
  /* scripted scrolling asks the same question */
  for (const f of ['app.js', 'accessibility.js', 'home-view.js']) for (const m of JS[f].matchAll(/behavior: ([^,}]+)/g)) assert.match(m[1], /reduce \? 'auto' : 'smooth'/, f);
  /* no animation runs on its own in ONGIL's stylesheets: no keyframes, no autoplaying carousel, no parallax */
  assert.equal(/@keyframes|animation:|animation-name/.test(Object.values(CSS).join('\n')), false);
  assert.equal(/setInterval\(/.test(ALL_CODE.replace(/win\.setInterval\(checkDay, 60000\);/, '')), false, 'the only timer is the once-a-minute day check');
  /* only the film of the screen being shown is loaded; the other six are never downloaded */
  assert.equal((HTML.match(/<video[^>]*\ssrc="/g) || []).length <= 1, true);
  assert.equal((HTML.match(/data-og-src="https:\/\/d8j0ntlcm91z4/g) || []).length >= 6, true);
});

/* ═════════ responsive ═════════ */

const ALL_CSS = Object.values(CSS).join('\n');

test('RH-16 320 responsive: the narrowest phone keeps the mark and three 44px tools apart, and the page inside its width', () => {
  assert.match(CSS['ongil-shell.css'], /@media \(max-width: 359px\) \{\n {2}\.gnav--ongil \.gnav__inner \{ padding-inline: 10px; gap: 6px; \}\n {2}\.gnav--ongil \.gnav__util \{ gap: 2px; \}\n {2}\.gnav--ongil \.og-tools \{ gap: 0; margin-right: 0; \}\n {2}\.gnav--ongil \.gnav__lang-select \{ padding-left: 6px; \}\n\}/);
  assert.match(CSS['ongil-shell.css'], /\.og-tool \{[^}]*width: var\(--og-control\); height: var\(--og-control\)/, 'the tools stay 44px: only the spacing gives way');
  assert.match(CSS['ongil-tokens.css'], /--og-control: 2\.75rem;/);
  assert.match(CSS['ongil-tokens.css'], /--og-wrap: min\(1180px, calc\(100% - 2rem\)\);/, 'content is the screen minus 16px each side at any width');
  assert.match(CSS['ongil-app.css'], /\.og-panel \{ position: fixed; top: calc\(var\(--gnav-h, 74px\) \+ 0\.4rem\); right: 1rem; left: 1rem; width: auto; \}/, 'header panels become a sheet as wide as the screen');
  /* Completion V2 closed the one measured exception at 320px (seven calendar days were 40px wide): see RH-17 */
  assert.match(CSS['ongil-life.css'], /every day is at least 44 × 44 px at 320px/);
  assert.equal(/at 320px seven days leave 40px each/.test(CSS['ongil-life.css']), false);
});

test('RH-17 320–380 responsive: the month grid uses the card\'s padding and the page gutter so a day is 44px wide from 320px up', () => {
  /* Completion V2. BEFORE: width calc(100% + 2rem), 2px spacing → 40px days at 320px. AFTER: the calendar card takes 12px
     of the 16px page gutter on each side, the grid takes the card's padding and its cells sit edge to edge, so 320px
     gives (320 − 8) / 7 = 44.6px days, inside the card. */
  assert.match(CSS['ongil-life.css'], /@media \(max-width: 380px\) \{\n {2}\.og-home-card\[data-og-slot="life\.calendar"\] \{ margin-inline: calc\(-1rem \+ 4px\); \}\n {2}\.og-cal__grid \{ width: calc\(100% \+ 2\.2rem\); margin-inline: -1\.1rem; border-spacing: 0; \}\n {2}\.og-cal__day \{ min-height: 2\.9rem; \}\n\}/);
  assert.match(CSS['ongil-life.css'], /\.og-cal__grid \{ width: 100%; border-collapse: separate; border-spacing: 2px; table-layout: fixed; \}/);
  assert.match(CSS['ongil-life.css'], /\.og-cal__day \{[^}]*min-height: 3rem;/);
  /* 360 − 2×16 (page) − 2×17.6 (card) + 32 (this rule) = 324.8 → seven columns of 46px. Measured in the browser: 46 × 46. */
  const available = 360 - 32 - 35.2 + 32;
  assert.ok((available - 8) / 7 >= 44, String((available - 8) / 7));
  /* at 380px and below: 12px of each page gutter go to the card, the card's padding (2×17.6) to the grid, no spacing */
  for (const w of [320, 340, 360, 380]) assert.ok((w - 32 + 24 - 35.2 + 35.2) / 7 >= 44, `${w}px → ${(w - 8) / 7}`);
  assert.ok(320 - 32 + 24 <= 320 - 8, 'the card (and the grid in it) is never wider than the screen');
});

test('RH-18 430 responsive: the wordmark gives way at 430px and below — one rule, no jump in the tools', () => {
  assert.match(CSS['ongil-shell.css'], /@media \(max-width: 430px\) \{\n {2}\.gnav--ongil \.gnav__wordmark \{ display: none; \}\n\}/);
  assert.equal((ALL_CSS.match(/\.gnav__wordmark/g) || []).length, 1, 'the only rule that touches it');
  assert.match(HTML, /<a class="gnav__brand" href="\/ko\/ongil\/" aria-label="Ongil 소개">/, 'the link keeps its name when the word is hidden');
  assert.match(HTML, /<img class="gnav__logo" src="\/assets\/ongil-mark\.svg" alt="" width="40" height="40"/, 'the mark stays');
  /* breakpoints used by ONGIL's own sheets: a small, known set */
  const points = [...new Set([...ALL_CSS.matchAll(/@media \(max-width: (\d+)px\)/g)].map((m) => Number(m[1])))].sort((a, b) => a - b);
  assert.deepEqual(points, [359, 380, 430, 480, 520, 600, 640, 700, 860, 1100].filter((p) => points.includes(p)));
  assert.ok(points.includes(359) && points.includes(380) && points.includes(430));
});

test('RH-19 200% reflow: nothing in ONGIL\'s sheets fixes a width wider than a small phone, so zoom reflows instead of scrolling sideways', () => {
  for (const [f, css] of Object.entries(CSS)) {
    for (const m of css.matchAll(/(?:^|[\s;{])(min-width|width): (\d+)px/g)) assert.ok(Number(m[2]) <= 320, `${f}: ${m[0].trim()}`);
    for (const m of css.matchAll(/(?:^|[\s;{])(min-width|width): ([\d.]+)rem/g)) assert.ok(Number(m[2]) <= 20, `${f}: ${m[0].trim()}`);
    assert.equal(/overflow-x: (scroll|auto)/.test(css.replace(/\.gnav__nav-scroller[^}]*\}/g, '')), false, `${f}: no sideways scrolling region`);
    assert.equal(/user-scalable=no|maximum-scale=1/.test(HTML), false);
  }
  assert.match(HTML, /<meta name="viewport" content="width=device-width, initial-scale=1\.0" \/>/, 'zoom is not limited');
  /* text is sized in rem, so the browser's text-size setting applies */
  /* Phase 11: the panel caption, the panel group caption and the tick glyph were raised to 1rem. What stays under 1rem is
     two fixed labels only: the capital eyebrow label above a heading (0.9rem) and the shared site menu (0.92rem). */
  const under = [...ALL_CSS.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{[^{}]*font-size: (0\.\d+)rem/g)].map((m) => `${m[1].trim()} ${m[2]}`);
  assert.deepEqual(under, ['.og-band .og-label, .og-page .og-label 0.9', '.gnav--ongil .gnav__link 0.92', '.og-chip p, .og-card li, .og-card__lead 0.86']);
  const px = [...ALL_CSS.matchAll(/font-size: (\d+)px/g)].map((m) => Number(m[1]));
  assert.ok(px.every((v) => v >= 16), `font sizes in px: ${px}`);
});

test('RH-20 long unbroken content: text is bounded when stored and wraps when shown', () => {
  const long = 'Supercalifragilisticexpialidocious'.repeat(400);
  const w = world();
  assert.equal(must(w.schedule.add({ title: long, date: TODAY }), 'event').event.title.length, L.LIFE_LIMITS.eventTitle);
  assert.equal(must(w.tasks.add({ title: long }), 'task').task.title.length, L.LIFE_LIMITS.taskTitle);
  assert.equal(must(w.medication.add({ name: long }), 'med').medication.name.length, L.LIFE_LIMITS.medicationName);
  assert.equal(must(w.journal.add({ text: long }), 'journal').entry.text.length, L.LIFE_LIMITS.journalText);
  assert.equal(must(w.healthNotes.add({ text: long }), 'note').note.text.length, L.LIFE_LIMITS.healthNoteText);
  const saved = must(w.saved.save({ type: 'PLACE', id: 'x1', title: long, description: long, source: long, href: '#enjoy' }), 'saved').item;
  assert.deepEqual([saved.title.length, saved.description.length, saved.source.length], [C.LIMITS.title, C.LIMITS.description, C.LIMITS.source]);
  const post = must(w.posts.add({ type: 'QUESTION', category: 'LOCAL', title: long.slice(0, 5000), body: long.slice(0, 5000) }), 'post').post;
  assert.ok(post.title.length <= 120 && post.body.length <= 5000);
  assert.equal(T.cleanResult({ status: 'SUCCESS', title: long, message: long, items: [{ title: long, detail: long }] }).items[0].title.length, 120);
  /* every place a person's or a source's text is shown wraps anywhere */
  for (const cls of ['.og-band .og-home-item__title', '.og-band .og-home-item__meta', '.og-band .og-home-note', '.og-item__title', '.og-panel__result-title, .og-panel__result-desc', '.og-community-body', '.og-community-name', '.og-store-name, .og-store-text', '.og-care-rows dd', '.og-care-dialog .og-dialog__title', '.og-admin-value', '.og-band .og-life-tile__value']) {
    const rule = new RegExp(`${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{[^}]*overflow-wrap: anywhere;`);
    assert.match(ALL_CSS, rule, cls);
  }
  assert.equal(/text-overflow: ellipsis|-webkit-line-clamp/.test(ALL_CSS), false, 'nothing is cut off with an ellipsis');
  const oneLine = [...ALL_CSS.matchAll(/([^{}\n]+)\{[^}]*white-space: nowrap/g)].map((m) => m[1].trim());
  assert.deepEqual(oneLine, ['.gnav--ongil .gnav__link', '.og-film__wordmark', '.og-hero__primary, .og-hero__secondary, .og-film__more'], 'one line only for fixed, short labels (menu names, the wordmark, the two film buttons) — never for a person\'s or a source\'s text');
});

/* ═════════ states ═════════ */

test('RH-21 loading states: a wait is said in words and marked busy — never a blank area', () => {
  assert.match(JS['panels.js'], /setState\('loading'\);\n\s+put\(results, el\('p', \{ class: 'og-panel__note', text: '찾고 있어요…' \}\)\);/);
  assert.match(JS['panels.js'], /results\.setAttribute\('aria-busy', state === 'loading' \? 'true' : 'false'\);/);
  assert.match(JS['enjoy-view.js'], /state: 'loading', text: '찾고 있어요…'/);
  assert.match(JS['views.js'], /state === 'loading' \? '불러오는 중입니다\.'/);
  assert.match(JS['assistant-view.js'], /host\.setAttribute\('aria-busy', 'true'\);/);
  for (const f of ['care-view.js', 'store-view.js', 'home-explore.js']) assert.match(JS[f], /loading|찾고 있어요|불러오는 중/, `${f} has a waiting state`);
  /* every list has words for "nothing yet" */
  const empties = ALL_CODE.split('\n').filter((line) => /^\s*emptyText: /.test(line));
  assert.ok(empties.length >= 10, String(empties.length));
  for (const line of empties) assert.match(line, /[가-힣]|EMPTY\[/, line.trim());
  for (const m of ALL_CODE.matchAll(/const EMPTY = \{([^}]*)\}/g)) assert.match(m[1], /[가-힣]/);
  /* requests that take too long stop by themselves */
  assert.match(JS['data-source.js'], /const TIMEOUT_MS = 8000;/);
  assert.match(JS['data-source.js'], /const timer = controller \? setTimeout\(\(\) => controller\.abort\(\), timeoutMs\) : null;/);
});

test('RH-22 error states: short, plain, and what to do next — never a stack, an exception name or a server answer', () => {
  /* no caught error is shown or logged */
  for (const f of JS_FILES) {
    const src = code(JS[f]);
    assert.equal(/catch \((e|err|error)\) \{[^}]*(textContent|text:|announce|say\()[^}]*\b\1\b/.test(src), false, `${f}: a caught error is not put on screen`);
    assert.equal(/\.stack\b|\b(e|err|error)\.message\b|String\((e|err|error)\)|console\.(log|error|warn)/.test(src), false, `${f}`);
  }
  /* the sentences people can see when something fails */
  const errors = [...new Set([...ALL_CODE.matchAll(/'([^'\n]*(?:못했|없어요\.|다시 (?:시도|해|골라|확인)|가득 찼)[^'\n]*)'/g)].map((m) => m[1]))];
  assert.ok(errors.length >= 25, String(errors.length));
  for (const e of errors) {
    assert.equal(/Error|Exception|undefined|null|NaN|HTTP|status|\b[45]\d\d\b|stack|JSON|fetch|TypeError|Quota/.test(e), false, e);
    assert.ok(e.length <= 140, `${e.length}: ${e}`);
  }
  assert.match(JS['home-list.js'], /result\.reason === 'STORAGE_UNAVAILABLE' \|\| result\.reason === 'STORAGE_FULL' \? STORAGE_ERROR_TEXT : config\.errorText\(result\.reason\)/);
  assert.ok(JS['home-list.js'].includes('브라우저의 저장 공간이 가득 찼거나 꺼져 있을 수 있어요. 오래된 기록을 지운 뒤 다시 해 주세요.'), 'Phase 11: a refused write says why and what to do');
  assert.match(JS['community-view.js'], /STORAGE_FULL: '이 기기의 저장 공간이 부족해요\. 오래된 글을 지우거나 내용을 줄여 주세요\.'/);
  assert.equal(T.MESSAGES.ERROR, '지금은 처리하지 못했어요. 잠시 뒤 다시 해 주세요.');
  /* a failing field is marked and focused, and its message is an alert */
  assert.match(JS['home-list.js'], /bad\.input\.setAttribute\('aria-invalid', 'true'\);\n\s+\/\*[^\n]*\n\s+error\.textContent = [^\n]*\n\s+bad\.input\.focus\(\);/);
});

test('RH-23 null / undefined leak: missing optional values are left out, never printed', async () => {
  /* the DOM helpers skip what is absent */
  assert.match(JS['dom.js'], /if \(value === null \|\| value === undefined \|\| value === false\) continue;/);
  assert.match(JS['dom.js'], /if \(child === null \|\| child === undefined \|\| child === false\) continue;/);
  for (const f of JS_FILES) for (const m of code(JS[f]).matchAll(/([A-Za-z.]+)\.append\(([^)]*)\)/g)) assert.equal(/\? [^:]+ : null|\|\| null|&& el\(/.test(m[2]), false, `${f}: Element.append would print "null" — ${m[0].slice(0, 70)}`);
  /* records with nothing optional: every text built from them is clean */
  const w = world();
  w.schedule.add({ title: '일정', date: TODAY });
  w.tasks.add({ title: '할 일' });
  w.routines.add({ title: '루틴', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] });
  w.saved.save({ type: 'PLACE', id: 'p', title: '장소', href: '#enjoy' });
  const m = w.medication.add({ name: '약' }).medication;
  w.medication.setTaken(m.id, true);
  w.medication.remove(m.id);
  const search = createSearch();
  search.registerProvider(createAreaProvider(AREAS));
  search.registerProvider(createSavedProvider(w.saved, C.SAVED_TYPE_LABELS));
  search.registerProvider(createCareProvider(() => sanitizeCareItems([{ type: 'FACILITY', id: 'f1', name: '기관', sourceName: '출처' }])));
  search.registerProvider(createEnjoyProvider(() => sanitizeEnjoyItems([{ type: 'CLASS', id: 'e1', title: '강좌', category: 'LEARNING' }])));
  search.registerProvider(createStoreProvider(() => sanitizeProducts([{ id: 'p1', name: '상품', category: 'MOBILITY', summary: '요약' }])));
  const assistant = T.createAssistant({ now: w.now, schedule: w.schedule, tasks: w.tasks, routines: w.routines, saved: w.saved, search, familyConnection });
  let text = JSON.stringify(w.medication.historyForDate(TODAY));
  for (const q of ['오늘', '오늘 일정 알려줘', '오늘 할 일', '루틴 보여줘', '저장한 것 보여줘', '기관 서비스 찾아줘', '강좌 찾아줘', '상품 찾아줘', '가족에게 보여줘', '내일 병원 일정 추가', '뭘 할 수 있어', '날씨']) text += JSON.stringify((await assistant.handle(q)).result);
  for (const q of ['기관', '강좌', '상품', '장소', '건강']) text += JSON.stringify((await search.query(q)).results);
  text += JSON.stringify([buildSystemStatus({ storage: w.storage, search }), buildContentStatus({ storage: w.storage }), w.analytics.summary()]);
  const shown = [...text.matchAll(/"(?:title|message|detail|description|typeLabel|label|routeLabel|name|source)":"([^"]*)"/g)].map((x) => x[1]);
  assert.ok(shown.length > 60);
  for (const s of shown) assert.equal(/undefined|\bnull\b|NaN|\[object Object\]/.test(s), false, s);
});

test('RH-24 offline local flows: every personal feature works with no network at all', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('offline'); };
  try {
    const w = world();
    const med = fillPrivate(w);
    must(w.routines.add({ title: '루틴', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }), 'routine');
    must(w.dailyLife.update({ water: 3, meals: 2, exercise: true }), 'daily life');
    must(w.saved.save({ type: 'PLACE', id: 'p', title: '장소', href: '#enjoy' }), 'saved');
    must(w.profile.updateProfile({ nickname: '검증' }), 'profile');
    assert.equal(w.analytics.track('app_open').ok, true);
    assert.equal(w.medication.isTaken(med.id), true);
    const search = createSearch();
    search.registerProvider(createAreaProvider(AREAS));
    search.registerProvider(createSavedProvider(w.saved, C.SAVED_TYPE_LABELS));
    assert.equal((await search.query('건강')).state, 'results');
    const assistant = T.createAssistant({ now: w.now, schedule: w.schedule, tasks: w.tasks, routines: w.routines, saved: w.saved, search, familyConnection });
    assert.equal((await assistant.handle('오늘 일정 알려줘')).result.status, 'SUCCESS');
    const p = await assistant.handle('내일 병원 일정 추가');
    assert.equal((await assistant.confirm(p.result.pending.id)).result.status, 'SUCCESS');
    assert.ok(buildSystemStatus({ storage: w.storage, search }).storage.collectionsInUse >= 15);
  } finally {
    globalThis.fetch = realFetch;
  }
  /* the page needs no service worker, manifest or remote script to start; fonts and the film are the only outside files and both are optional */
  assert.equal(/serviceWorker|navigator\.onLine|manifest\.json/.test(`${ALL_CODE}\n${HTML}`), false);
  assert.match(HTML, /<noscript><p class="og-noscript">ONGIL을 사용하려면 브라우저에서 자바스크립트를 켜 주세요\.<\/p><\/noscript>/);
});

test('RH-25 provider offline: a source that cannot be reached answers "unavailable" with a category — and never throws', async () => {
  const { createLifelongClassSource, createFacilitySource, createTourPlaceSource, createEnjoyPlaceSource, createUnconnectedSource } = await import('../../ongil-start/js/data-source.js');
  const apiUrl = (p) => p;
  const fetchers = {
    'network down': () => Promise.reject(new TypeError('Failed to fetch')),
    'throws at once': () => { throw new Error('boom'); },
    'server error page': async () => ({ ok: false, status: 500, json: async () => { throw new SyntaxError('Unexpected token <'); } }),
    'bad json': async () => ({ ok: true, json: async () => { throw new SyntaxError('Unexpected token'); } }),
    'not ok body': async () => ({ ok: true, json: async () => ({ ok: false, error: 'SECRET detail token=abc' }) }),
    'null': async () => null,
    'wrong shape': async (url) => ({ ok: true, json: async () => (url.includes('action=status') ? { ok: true, providers: { 'kr-lifelong-class': { configured: true }, 'kr-kakao-place': { configured: true }, 'kr-tourapi': { configured: true } } } : { ok: true, items: { not: 'a list' } }) }),
  };
  for (const [name, fetcher] of Object.entries(fetchers)) {
    for (const [make, args] of [[createLifelongClassSource, { region: '서울' }], [createFacilitySource, { region: '서울', kind: 'welfare-center' }], [createTourPlaceSource, { region: '서울', category: 'OUTING' }], [createEnjoyPlaceSource, { region: '서울', category: 'OUTING' }]]) {
      const source = make({ apiUrl, fetcher, timeoutMs: 50 });
      let r;
      await assert.doesNotReject(async () => { r = await source.load(args); }, name);
      assert.equal(r.state, 'unavailable', `${name}: ${JSON.stringify(r).slice(0, 80)}`);
      assert.deepEqual(r.items, []);
      assert.match(String(r.reason), /^[A-Z_]{3,30}$/, 'a reason category, not a message');
      assert.equal(/SECRET|token|Failed|Unexpected|boom/.test(JSON.stringify(r)), false, name);
    }
  }
  assert.equal((await createLifelongClassSource({}).load({ region: '서울' })).reason, 'NOT_CONNECTED', 'no fetch at all');
  assert.equal((await createUnconnectedSource('services', '돌봄 서비스').load()).state, 'unavailable');
  /* a request that never answers is given up after the timeout */
  const hanging = createLifelongClassSource({ apiUrl, fetcher: (url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted')))), timeoutMs: 20 });
  const t0 = Date.now();
  assert.equal((await hanging.load({ region: '서울' })).state, 'unavailable');
  assert.ok(Date.now() - t0 < 2000);
  /* requests are GET, without credentials, and only to the site's own data route */
  assert.match(JS['data-source.js'], /\{ method: 'GET', headers: \{ accept: 'application\/json' \}, credentials: 'omit', signal:/);
});

/* ═════════ scale ═════════ */

test('RH-26 large local dataset: collections are capped, lists are paged, and reading a full collection stays quick', () => {
  const w = world();
  /* written through the stores up to their limits (the last add is refused, never silently dropped) */
  const ev = w.schedule.add({ title: '검증 일정', date: TODAY }).event;
  w.storage.set('events', { items: Array.from({ length: L.LIFE_LIMITS.events }, (_, i) => ({ ...ev, id: `ev_big${String(i).padStart(6, '0')}`, title: `검증 일정 ${i}`, date: addDays(TODAY, -(i % 40)) })) });
  assert.deepEqual(w.schedule.add({ title: '하나 더' }), { ok: false, reason: 'LIMIT' });
  const tk = w.tasks.add({ title: '검증 할 일' }).task;
  w.storage.set('tasks', { items: Array.from({ length: L.LIFE_LIMITS.tasks }, (_, i) => ({ ...tk, id: `tk_big${String(i).padStart(6, '0')}`, title: `검증 할 일 ${i}`, dueDate: TODAY })) });
  assert.equal(w.tasks.add({ title: '하나 더' }).reason, 'LIMIT');
  for (let i = 0; i < L.LIFE_LIMITS.routines; i++) must(w.routines.add({ title: `루틴 ${i}`, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }), 'routine');
  assert.equal(w.routines.add({ title: '하나 더', daysOfWeek: [1] }).reason, 'LIMIT');
  const med = w.medication.add({ name: '검증 약' }).medication;
  const logs = {};
  const checks = {};
  for (let i = 0; i < 365; i++) { logs[addDays(TODAY, -i)] = { [med.id]: { taken: i % 2 === 0, name: '검증 약', time: '' } }; checks[addDays(TODAY, -i)] = { status: 'good' }; }
  w.storage.set('medicationLogs', { items: logs });
  w.storage.set('checkins', { items: checks });
  for (let i = 0; i < 500; i++) w.saved.save({ type: 'PLACE', id: `s${i}`, title: `검증 장소 ${i}`, href: '#enjoy' });
  assert.equal(w.saved.save({ type: 'PLACE', id: 'over', title: '하나 더', href: '#enjoy' }).reason, 'LIMIT');
  const t0 = process.hrtime.bigint();
  assert.equal(w.schedule.listForDate(TODAY).length, 25);
  assert.equal(w.tasks.dueOn(TODAY).length, 500);
  assert.equal(w.routines.listForDate(TODAY).length, 30);
  assert.equal(w.medication.loggedDates().length, 365);
  assert.equal(w.medication.historyForDate(addDays(TODAY, -200)).length, 1);
  assert.equal(w.checkIn.get(addDays(TODAY, -364)).status, 'good');
  assert.equal(w.saved.list().length, 500);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  assert.ok(ms < 400, `reading every full collection once took ${ms.toFixed(0)} ms`);
  /* what a screen puts in the page is a page of it */
  assert.equal(LIST_PAGE, 50);
  assert.match(JS['home-list.js'], /const page = items\.slice\(0, shown\);/);
  assert.match(JS['home-list.js'], /text: `더 보기 \(\$\{items\.length - page\.length\}개 남음\)`/);
  assert.match(JS['home-list.js'], /if \(at >= shown\) shown = at \+ 1;/, 'a row being edited, or just added, is never hidden behind the page');
  for (const [f, name, n] of [['community-view.js', 'POST_PAGE', 20], ['saved-view.js', 'SAVED_PAGE', 30], ['panels.js', 'NOTIFICATION_PAGE', 20], ['store-view.js', 'STORE_PAGE', 24], ['life-records.js', 'JOURNAL_PAGE', 20]]) assert.match(JS[f], new RegExp(`export const ${name} = ${n};`), f);
  /* Phase 11: the group list counts meetup drafts from one read, not one read per group */
  assert.match(JS['community-view.js'], /const meetupCounts = meetups\.countsByGroup\(\);/);
  assert.equal(/meetups\.listFor\(g\.id\)\.length/.test(JS['community-view.js']), false);
  const g = must(w.groups.add({ name: '모임', category: 'WALKING', meetingStyle: 'OFFLINE' }), 'group').group;
  for (let i = 0; i < 3; i++) must(w.meetups.add(g.id, { title: `일정 ${i}`, date: TODAY }), 'meetup');
  assert.deepEqual(w.meetups.countsByGroup(), { [g.id]: 3 });
});

test('RH-27 1500 search fixture: every match is counted, twenty per source are shown, and the cut is said', async () => {
  const items = Array.from({ length: 1500 }, (_, i) => ({ type: i % 2 ? 'CLASS' : 'PLACE', id: `e${i}`, title: `검증 강좌 ${i}`, name: `검증 강좌 ${i}`, category: 'LEARNING', organization: '검증 기관' }));
  const search = createSearch();
  search.registerProvider(createAreaProvider(AREAS));
  search.registerProvider(createEnjoyProvider(() => items));
  search.registerProvider(createStoreProvider(() => sanitizeProducts(Array.from({ length: 500 }, (_, i) => ({ id: `p${i}`, name: `검증 강좌 상품 ${i}`, category: 'MOBILITY', summary: '요약' })))));
  const t0 = process.hrtime.bigint();
  const o = await search.query('강좌');
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  assert.ok(ms < 300, `${ms.toFixed(0)} ms`);
  const enjoy = o.groups.find((g) => g.providerId === 'enjoy');
  const store = o.groups.find((g) => g.providerId === 'store');
  assert.deepEqual([enjoy.found, enjoy.results.length, enjoy.truncated], [1500, SEARCH_GROUP_LIMIT, true]);
  assert.deepEqual([store.found, store.results.length, store.truncated], [500, SEARCH_GROUP_LIMIT, true]);
  assert.ok(o.total >= 2000 && o.results.length <= SEARCH_GROUP_LIMIT * o.groups.length);
  assert.match(JS['panels.js'], /개 가운데 앞의 \$\{group\.results\.length\}개만 보여 드려요\. 찾을 말을 더 자세히 적어 보세요\./);
  /* the assistant shows eight and counts the rest */
  const w = world();
  const assistant = T.createAssistant({ now: w.now, schedule: w.schedule, tasks: w.tasks, routines: w.routines, saved: w.saved, search, familyConnection });
  const r = (await assistant.handle('검증 강좌 찾아줘')).result;
  assert.deepEqual([r.items.length, r.more, r.title], [8, 1492, '‘검증 강좌’ 1500개']);
});

test('RH-28 localStorage quota: a refused write is reported, nothing already stored is damaged, and the app keeps working', () => {
  const backend = createMemoryBackend();
  const real = backend.setItem;
  let full = false;
  backend.setItem = (k, v) => { if (full) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; } real(k, v); };
  const storage = createStorage({ backend, now: () => NOW });
  const o = { now: () => NOW };
  const meetups = createMeetupStore(storage, o);
  const s = { tasks: createTaskStore(storage, o), schedule: createScheduleStore(storage, o), journal: createJournalStore(storage, o), expenses: createExpenseStore(storage, o), notes: createHealthNoteStore(storage, o), symptoms: createSymptomStore(storage, o), checkIn: createCheckInStore(storage, o), medication: createMedicationStore(storage, o), daily: createDailyLifeStore(storage, o), routines: createRoutineStore(storage, o), saved: createSavedStore(storage, o), posts: createPostStore(storage, o), groups: createGroupStore(storage, { ...o, meetups }), help: createHelpRequestStore(storage, o), sharing: createFamilySharingStore(storage, o), profile: createProfileStore(storage, o), analytics: A.createAnalytics({ storage, now: () => NOW }) };
  const task = must(s.tasks.add({ title: '기존 할 일' }), 'task').task;
  const med = must(s.medication.add({ name: '기존 약' }), 'med').medication;
  must(s.journal.add({ text: '기존 기록' }), 'journal');
  must(s.saved.save({ type: 'PLACE', id: 'p', title: '기존 장소', href: '#enjoy' }), 'saved');
  const before = JSON.stringify(backend.keys().sort().map((k) => [k, backend.getItem(k)]));
  full = true;
  const attempts = { task: () => s.tasks.add({ title: '새 할 일' }), taskToggle: () => s.tasks.toggle(task.id), taskRemove: () => s.tasks.update(task.id, { title: '바꿈' }), event: () => s.schedule.add({ title: '새 일정' }), journal: () => s.journal.add({ text: '긴 글 '.repeat(200) }), expense: () => s.expenses.add({ amount: 1000, category: 'food' }), note: () => s.notes.add({ text: '메모' }), symptom: () => s.symptoms.save({ symptoms: ['headache'] }), checkIn: () => s.checkIn.set('good'), medAdd: () => s.medication.add({ name: '새 약' }), medMark: () => s.medication.setTaken(med.id, true), daily: () => s.daily.update({ water: 2 }), routine: () => s.routines.add({ title: '루틴', daysOfWeek: [1] }), saved: () => s.saved.save({ type: 'PLACE', id: 'q', title: '새 장소', href: '#enjoy' }), post: () => s.posts.add({ type: 'QUESTION', category: 'LOCAL', title: '글', body: '본문 '.repeat(900) }), group: () => s.groups.add({ name: '모임', category: 'WALKING', meetingStyle: 'OFFLINE' }), help: () => s.help.add({ category: 'shopping' }), sharing: () => s.sharing.set('SCHEDULE', 'SUMMARY'), profile: () => s.profile.updateProfile({ nickname: '새이름' }), analytics: () => s.analytics.track('app_open') };
  for (const [name, attempt] of Object.entries(attempts)) {
    let r;
    assert.doesNotThrow(() => { r = attempt(); }, name);
    assert.equal(r === false || (r && r.ok === false), true, `${name} is refused: ${JSON.stringify(r)}`);
  }
  assert.equal(JSON.stringify(backend.keys().sort().map((k) => [k, backend.getItem(k)])), before, 'what was stored is exactly what it was');
  assert.deepEqual([s.tasks.list()[0].title, s.journal.recent()[0].text, s.saved.list()[0].title, s.medication.list()[0].name], ['기존 할 일', '기존 기록', '기존 장소', '기존 약'], 'and it can still be read');
  full = false;
  assert.equal(s.tasks.add({ title: '다시 저장' }).ok, true, 'writing works again when there is room');
  /* one value can not grow without limit either: the storage layer refuses a value over its size cap */
  assert.match(JS['storage.js'], /const MAX_VALUE_CHARS = 400000;/);
  assert.equal(storage.set('journal', { items: ['가'.repeat(400001)] }), false);
  assert.equal(s.journal.recent()[0].text, '기존 기록', 'the refused value replaced nothing');
});

test('RH-29 analytics bounded: counters are a closed set, fourteen days, no text and no identifier — with the assistant events included', () => {
  const w = world();
  assert.equal(A.EVENT_NAMES.length, 22);
  assert.ok(A.ALL_COUNTERS.length < 160);
  assert.equal(A.RETENTION_DAYS, 14);
  const raw = '아주 사적인 문장 김영희 010-1234-5678 hard';
  for (let d = 0; d < 30; d++) {
    for (const name of A.EVENT_NAMES) for (let i = 0; i < 20; i++) w.analytics.track(name, { view: A.PROPERTIES.view[i % 11], hasSection: 'yes', queryLength: '11+', resultCount: '0', providerCount: '0', outcome: 'error', contentType: A.PROPERTIES.contentType[i % 8], intent: A.PROPERTIES.intent[i % 24], tool: A.PROPERTIES.tool[i % 2], result: A.PROPERTIES.result[i % 5], text: raw, query: raw, title: raw, prompt: raw, userId: 'u-1', deviceId: 'd-1' });
    w.clock.t += DAY;
  }
  const stored = w.backend.getItem(`${KEY_PREFIX}analytics`);
  const days = JSON.parse(stored).days;
  assert.equal(Object.keys(days).length, 14);
  assert.ok(stored.length < 14 * 8000, `${stored.length} chars for 13,200 events`);
  for (const day of Object.values(days)) for (const k of Object.keys(day)) assert.ok(A.ALL_COUNTERS.includes(k), k);
  for (const leak of ['사적인', '김영희', '010', 'hard', 'u-1', 'd-1', 'userId', 'deviceId', 'prompt']) assert.equal(stored.includes(leak), false, leak);
  assert.deepEqual({ ...A.TRANSMISSION }, { remote: false, endpoint: null, batch: false, beacon: false });
  assert.equal(Object.values(A.IDENTIFIERS).every((v) => v === false), true);
  /* failure never blocks a feature */
  const broken = createInstrumentation(() => { throw new Error('down'); });
  assert.equal(broken.tasks(w.tasks).add({ title: '할 일' }).ok, true);
  assert.equal(A.createAnalytics({ storage: { get() { throw new Error('x'); }, set() { throw new Error('y'); } }, now: () => NOW }).track('app_open').ok, false);
});

test('RH-30 AI bounded: input, history, rows, drafts and what the tools may touch all have fixed limits', async () => {
  const w = world();
  for (let i = 0; i < 300; i++) w.schedule.add({ title: `일정 ${i}`, date: TODAY });
  const search = createSearch();
  const assistant = T.createAssistant({ now: w.now, schedule: w.schedule, tasks: w.tasks, routines: w.routines, saved: w.saved, search, familyConnection });
  assert.equal(matchIntent('가'.repeat(121)).reason, 'TOO_LONG');
  assert.equal(matchIntent('가'.repeat(1_000_000)).reason, 'TOO_LONG');
  const r = (await assistant.handle('오늘 일정 알려줘')).result;
  assert.deepEqual([r.items.length, r.more], [T.RESULT_ITEMS_MAX, 292]);
  assert.deepEqual([T.RESULT_ITEMS_MAX, T.HISTORY_MAX, T.PENDING_TTL_MS], [8, 6, 300000]);
  /* one draft at a time; an older one can no longer run */
  const a = await assistant.handle('내일 병원 일정 추가');
  const b = await assistant.handle('모레 치과 일정 추가');
  assert.equal((await assistant.confirm(a.result.pending.id)).result.status, 'ERROR');
  assert.equal((await assistant.confirm(b.result.pending.id)).result.status, 'SUCCESS');
  assert.equal(w.schedule.count(), 301);
  /* the tool matrix: required data · privacy class · mutation · confirmation */
  const matrix = assistant.tools.list().map((t) => `${t.id}|${t.mode}|${t.privacy}|${t.requiresConfirmation}`);
  assert.equal(matrix.length, 22);
  assert.deepEqual(matrix.filter((m) => /\|WRITE\|/.test(m)), ['create_calendar_event|WRITE|STANDARD_LOCAL|true', 'create_task|WRITE|STANDARD_LOCAL|true']);
  assert.deepEqual(matrix.filter((m) => /HEALTH_ADJACENT/.test(m)), ['open_health|NAVIGATE|HEALTH_ADJACENT|false']);
  assert.equal(matrix.some((m) => /\|(READ|WRITE)\|PRIVATE\|/.test(m)), false);
  assert.match(APP, /const assistant = createAssistant\(\{ schedule, tasks, routines, saved, search, familyConnection: onboarding\.familyConnection \}\);/, 'six handles — no storage, profile, health, journal, expense, family or community store');
  for (const id of ['constructor', '__proto__', 'storage.clear', 'create_post', 'record_checkin', 'send_family']) assert.equal((await assistant.tools.run(id, {})).reason, 'UNKNOWN_TOOL', id);
  assert.equal((await assistant.tools.run('create_task', { title: '몰래' })).reason, 'CONFIRMATION_REQUIRED');
  assert.equal(w.tasks.count(), 0);
});

/* ═════════ dates · destructive actions ═════════ */

const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min, 0).getTime();
function worldAt(ms) {
  const w = world();
  w.clock.t = ms;
  return w;
}

test('RH-31 midnight: a record belongs to the LOCAL day it was made on, one minute either side of midnight', () => {
  const late = worldAt(at(2026, 10, 3, 23, 59));
  const m = late.medication.add({ name: '약' }).medication;
  late.medication.setTaken(m.id, true);
  late.checkIn.set('good');
  late.schedule.add({ title: '밤 일정' });
  late.dailyLife.update({ water: 1 });
  assert.equal(late.schedule.listForDate('2026-10-03').length, 1);
  assert.equal(late.medication.isTaken(m.id, '2026-10-03'), true);
  late.clock.t = at(2026, 10, 4, 0, 1);
  assert.deepEqual([late.medication.isTaken(m.id), late.checkIn.get(), late.schedule.listForDate().length, late.dailyLife.get().water], [false, null, 0, 0], 'a new day starts clean');
  assert.deepEqual([late.medication.isTaken(m.id, '2026-10-03'), late.checkIn.get('2026-10-03').status], [true, 'good'], 'and yesterday is still yesterday');
  late.analytics.track('app_open');
  assert.deepEqual(Object.keys(JSON.parse(late.backend.getItem(`${KEY_PREFIX}analytics`)).days), ['2026-10-04']);
  for (const [h, min] of [[0, 0], [0, 1], [8, 59], [9, 0], [23, 59]]) assert.equal(dateKey(at(2026, 10, 3, h, min)), '2026-10-03', `${h}:${min}`);
  /* no module derives a day from UTC */
  assert.equal(/toISOString\(\)|getUTC(Date|Day|Month|FullYear|Hours)|Date\.UTC\(/.test(ALL_CODE), false);
  /* a page left open overnight notices the new day */
  assert.match(APP, /win\.setInterval\(checkDay, 60000\);/);
  assert.match(APP, /if \(doc\.visibilityState === 'visible'\) checkDay\(\);/);
});

test('RH-32 year boundary: 31 December and 1 January are neighbours everywhere', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2027-01-01', -1), '2026-12-31');
  const w = worldAt(at(2026, 12, 31, 23, 30));
  const m = w.medication.add({ name: '약' }).medication;
  w.medication.setTaken(m.id, true);
  w.routines.add({ title: '루틴', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] });
  w.schedule.add({ title: '해맞이', date: '2027-01-01', time: '07:30' });
  w.tasks.add({ title: '새해 계획', dueDate: '2027-01-01' });
  w.analytics.track('app_open');
  w.clock.t = at(2027, 1, 1, 0, 10);
  assert.deepEqual([w.schedule.listForDate().map((e) => e.title), w.tasks.dueOn(dateKey(w.clock.t)).length, w.routines.listForDate().length], [['해맞이'], 1, 1]);
  assert.deepEqual(w.medication.historyForDate('2026-12-31').map((r) => r.taken), [true]);
  assert.deepEqual(w.medication.historyForDate('2027-01-01').map((r) => [r.taken, r.marked]), [[false, false]]);
  assert.deepEqual(w.schedule.countsForMonth('2027-01'), { '2027-01-01': 1 });
  w.analytics.track('app_open');
  assert.deepEqual(Object.keys(JSON.parse(w.backend.getItem(`${KEY_PREFIX}analytics`)).days), ['2026-12-31', '2027-01-01'], 'retention counts days across the year');
  assert.equal(matchIntent('내일 일정', { today: '2026-12-31' }).args.date, '2027-01-01');
});

test('RH-33 leap date: 29 February is a day in 2028 and not in 2027', () => {
  assert.deepEqual([isDateKey('2028-02-29'), isDateKey('2027-02-29'), isDateKey('2100-02-29'), isDateKey('2000-02-29')], [true, false, false, true]);
  assert.deepEqual([addDays('2028-02-28', 1), addDays('2028-02-29', 1), addDays('2027-02-28', 1), addDays('2028-03-01', -1)], ['2028-02-29', '2028-03-01', '2027-03-01', '2028-02-29']);
  const w = worldAt(at(2028, 2, 29, 9));
  assert.equal(must(w.schedule.add({ title: '윤일 일정' }), 'event').event.date, '2028-02-29');
  assert.equal(w.schedule.add({ title: '없는 날', date: '2027-02-29' }).reason, 'INVALID_DATE');
  assert.equal(w.tasks.add({ title: '없는 날', dueDate: '2027-02-30' }).reason, 'INVALID_DATE');
  w.checkIn.set('good');
  w.clock.t = at(2028, 3, 1, 9);
  assert.equal(w.checkIn.get('2028-02-29').status, 'good');
  assert.deepEqual(w.schedule.countsForMonth('2028-02'), { '2028-02-29': 1 });
});

test('RH-34 duplicate destructive action: deleting, clearing, resetting or erasing twice does it once', () => {
  const w = world();
  const keep = must(w.tasks.add({ title: '남는 할 일' }), 'task').task;
  const t = must(w.tasks.add({ title: '지울 할 일' }), 'task').task;
  assert.equal(w.tasks.remove(t.id).ok, true);
  assert.equal(w.tasks.remove(t.id).ok, false, 'the second press finds nothing');
  assert.deepEqual(w.tasks.list().map((x) => x.id), [keep.id]);
  const e = w.schedule.add({ title: '일정', date: TODAY }).event;
  assert.deepEqual([w.schedule.remove(e.id).ok, w.schedule.remove(e.id).reason], [true, 'NOT_FOUND']);
  const p = w.posts.add({ type: 'QUESTION', category: 'LOCAL', title: '글', body: '본문' }).post;
  assert.deepEqual([w.posts.remove(p.id).ok, w.posts.remove(p.id).ok], [true, false]);
  const m = w.medication.add({ name: '약' }).medication;
  assert.deepEqual([w.medication.remove(m.id).ok, w.medication.remove(m.id).reason], [true, 'NOT_FOUND']);
  w.saved.save({ type: 'PLACE', id: 'p', title: '장소', href: '#enjoy' });
  assert.deepEqual([w.saved.unsave('PLACE', 'p'), w.saved.unsave('PLACE', 'p')], [true, false]);
  w.analytics.track('app_open');
  assert.deepEqual([w.analytics.reset(), w.analytics.reset()], [true, true]);
  assert.deepEqual([w.storage.clear(), w.storage.clear(), w.backend.keys()], [true, true, []]);
  /* in the page: every delete asks first; the answer redraws the row, so a second click has no button to land on */
  assert.match(JS['home-list.js'], /onclick: \(\) => setMode\(\{ type: 'delete', id: item\.id \}, 'confirm'\)/);
  /* Completion V3: the delete is announced only when the store wrote it (BEFORE: announced unconditionally) */
  assert.match(JS['home-list.js'], /const removed = config\.onRemove\(item\.id\); if \(removed && removed\.ok === false\) \{ card\.say\(removeFailText\(removed, d\.title\)\); setMode\(\{ type: 'idle', id: null \}, `delete:\$\{item\.id\}`\); return; \} card\.say\(`‘\$\{d\.title\}’을\(를\) 지웠습니다\.`\); changed\(\);/);
  for (const f of ['community-view.js', 'life-health.js', 'account-view.js', 'admin-view.js', 'home-list.js']) assert.match(JS[f], /og-confirm|confirmBox|confirmReset|question:/, `${f} asks before it deletes`);
  assert.match(JS['account-view.js'], /confirmBox\.hidden = true;/);
  assert.match(JS['assistant-view.js'], /if \(entry\.settled\) return;\n\s+entry\.settled = true;/);
  /* no delete, erase or reset runs without a press: nothing destructive is wired to load, focus or a timer */
  assert.equal(/addEventListener\('(load|focus|blur|visibilitychange|pagehide|beforeunload)'[^)]*\)[^;]*\.(remove|clear|reset)\(/.test(ALL_CODE), false);
});

test('RH-35 corrupted storage isolation: one damaged collection reads as empty — it cannot take another one down', () => {
  const garbage = ['{not json', '[1,2,3]', '"text"', '12', 'null', '{"items":"x"}', '{"items":[null,5,"x",{"id":"bad"}]}', '{"items":{"2026-13-45":{}}}', ''];
  for (const bad of garbage) {
    for (const victim of COLLECTIONS) {
      const w = world({ [KEY_PREFIX + victim]: bad });
      const read = () => [w.schedule.listForDate(TODAY), w.tasks.list(), w.routines.listForDate(TODAY), w.medication.list(), w.medication.historyForDate(TODAY), w.checkIn.get(TODAY), w.dailyLife.get(TODAY), w.journal.recent(), w.expenses.listForMonth('2026-10'), w.symptoms.get(TODAY), w.healthNotes.listForDate(TODAY), w.saved.list(), w.notifications.list(), w.posts.list(), w.groups.list(), w.meetups.countsByGroup(), w.sharing.levels(), w.help.list(), w.profile.getProfile(), w.profile.getPreferences(), w.analytics.summary()];
      assert.doesNotThrow(read, `${victim} = ${bad}`);
    }
  }
  /* a damaged neighbour does not stop a healthy collection from being read or written */
  const w = world({ [`${KEY_PREFIX}tasks`]: '{not json', [`${KEY_PREFIX}medicationLogs`]: '[1]', [`${KEY_PREFIX}analytics`]: '"x"', [`${KEY_PREFIX}saved`]: '{"items":[{"type":"PLACE","id":"ok","title":"남은 장소","href":"#enjoy"},{"type":"PLACE"},null]}' });
  assert.deepEqual(w.saved.list().map((s) => s.title), ['남은 장소'], 'good entries next to bad ones survive');
  assert.equal(must(w.schedule.add({ title: '일정', date: TODAY }), 'event').event.title, '일정');
  assert.equal(must(w.tasks.add({ title: '다시 시작' }), 'task').task.title, '다시 시작', 'the damaged collection works again on the next write');
  const m = must(w.medication.add({ name: '약' }), 'med').medication;
  assert.equal(must(w.medication.setTaken(m.id, true), 'mark').log.taken, true);
  assert.equal(w.analytics.track('app_open').ok, true);
  /* a storage that throws on every read: every store still answers "nothing" */
  const throwing = { get() { throw new Error('SecurityError'); }, set() { throw new Error('x'); }, remove() { throw new Error('x'); }, list() { throw new Error('x'); }, persistent: false, backendKind: 'memory' };
  assert.doesNotThrow(() => A.createAnalytics({ storage: throwing, now: () => NOW }).summary());
  const blocked = createMemoryBackend();
  blocked.getItem = () => { throw new Error('SecurityError'); };
  const s = createStorage({ backend: blocked });
  assert.deepEqual([createTaskStore(s).list(), createSavedStore(s).list(), createCheckInStore(s).get(TODAY)], [[], [], null]);
});

/* ═════════ truthful copy ═════════ */

const never = (phrases, where = COPY) => { for (const p of phrases) assert.equal(where.includes(p), false, p); };

test('RH-36 truthful family copy: nothing says something was sent, shared, or that family is connected', () => {
  never(['가족에게 보냈', '가족에게 전달했', '가족에게 알렸', '가족과 공유했', '공유되었습니다', '전송되었습니다', '전송했습니다', '가족 연결 완료', '가족과 연결되었', '연결되었습니다', '초대를 보냈', '초대장을 보냈', '가족이 확인했', '가족이 볼 수 있습니다', '안부를 전했']);
  assert.deepEqual(familyConnection(), { available: false, status: 'NOT_AVAILABLE' });
  for (const sentence of ['가족 연결 기능은 준비 중이에요. 연결하기 전에는 어떤 내용도 가족에게 가지 않아요.', '가족 연결은 준비 중입니다. 연결하기 전에는 어떤 내용도 가족에게 전달되지 않습니다.', '지금은 가족과 연결되어 있지 않아서 보낼 수 없어요.']) assert.ok(COPY.includes(sentence), sentence);
  assert.match(JS['family-view.js'], /연결된 가족이 없어 지금은 아/);
  assert.match(JS['areas.js'], /가족에게 부탁하고 싶은 일을 적어 둡니다\. 아직 보내지는 않습니다\./);
  assert.equal(/sendsAnything: true|connected: true|recipients: [1-9]/.test(code(JS['family.js']) + code(JS['family-view.js']) + code(JS['onboarding.js'])), false);
});

test('RH-37 truthful commerce copy: no order, payment, booking, application, price promise, stock or review of ONGIL\'s own', () => {
  never(['결제 완료', '결제되었습니다', '결제했습니다', '주문 완료', '주문했습니다', '주문되었습니다', '예약 완료', '예약되었습니다', '예약했습니다', '신청 완료', '신청되었습니다', '신청했습니다', '구매하기', '바로 구매', '장바구니', '배송 조회', '배송 중', '재고 있음', '품절', '최저가', '할인', '쿠폰', '무료 배송', '리뷰 ', '별점', '평점', '베스트', '인기 상품', '추천 상품']);
  for (const sentence of ['ONGIL은 상품을 직접 팔지 않아요. 결제, 주문, 배송을 하지 않아요.', 'ONGIL에서 사거나 결제하는 것이 아니에요. 판매처 페이지로 이동해 직접 확인하세요.', '예약, 신청, 결제는 ONGIL에서 할 수 없어요.', '아직 연결된 상품이 없어요.']) assert.ok(COPY.includes(sentence), sentence);
  assert.match(JS['store-contracts.js'], /export const STORE_COMMERCE = Object\.freeze\(\{ mode: 'EXTERNAL_LINK', cart: false, checkout: false, payment: false, order: false, shipping: false, inventory: false, reviews: false, alerts: false \}\);/);
  assert.match(JS['care-contracts.js'], /bookingAvailable: false,/);
  assert.match(JS['care-contracts.js'], /applicationAvailable: false,/);
});

test('RH-38 truthful community copy: posts and groups are drafts on this device — never "published", "joined" or "members"', () => {
  never(['게시되었습니다', '게시했습니다', '공개되었습니다', '공개했습니다', '등록되었습니다', '이웃에게 보입니다', '모임에 가입했', '가입되었습니다', '가입했습니다', '회원 ', '명이 참여', '명 참여 중', '댓글 ', '좋아요 ', '공감 ', '조회수', '신고가 접수', '팔로우']
    .filter((p) => !['댓글 ', '좋아요 ', '공감 ', '회원 '].includes(p)));
  for (const flags of ['published: false', 'visibleToOthers: false', 'server: false']) assert.ok(JS['community.js'].includes(flags), flags);
  assert.ok(COPY.includes('아직 공개하거나 가입할 수 없습니다.'));
  assert.ok(COPY.includes('이 기기에만 저장됩니다.'));
  assert.match(JS['community-view.js'], /status: 'DRAFT'|초안/);
  assert.equal(/status: 'PUBLIC'|status: 'PUBLISHED'|memberCount|likeCount|commentCount|viewCount/.test(ALL_CODE), false, 'no public state or social counter exists');
  /* where "댓글 / 공감 / 회원" are mentioned at all, it is to say they do not exist */
  for (const line of COPY.split('\n').filter((l) => /(댓글|공감|신고|회원)/.test(l) && /['`]/.test(l))) assert.match(line, /없|아직|않|서버|준비|BACKEND|초안|이웃 글/, line.trim().slice(0, 120));
});

test('RH-39 truthful AI copy: a helper for fixed requests — no model, no free conversation, no medical answer', () => {
  never(['무엇이든 물어', '뭐든지 물어', 'AI가 답변', 'AI가 알려', '인공지능이', '챗봇', 'ChatGPT', 'GPT', '생각하고 있어요', '답변을 생성', '학습했', '똑똑한']);
  assert.ok(HTML.includes('ONGIL에서 할 일을 찾아드려요. 정해진 요청만 알아듣고, 자유로운 대화는 아직 하지 않아요.'));
  assert.match(JS['assistant-intents.js'], /export const MODEL = Object\.freeze\(\{ connected: false, provider: null, freeChat: false, medicalAdvice: false \}\);/);
  /* Product Completion Audit V1 — WHY: a person who types "어지러워" got only "의사나 약사와 상의" with no word about urgent help.
     BEFORE: the sentence ended at "상의해 주세요."  AFTER: the same sentence plus the fixed 119 line. Still no judgement. */
  assert.equal(T.MESSAGES.HEALTH, 'ONGIL은 건강 상태를 판단하거나 약을 권하지 않아요. 몸이 걱정되면 의사나 약사와 상의해 주세요. 급하다고 느끼면 119에 직접 전화해 주세요.');
  never(['진단 결과', '진단해 드', '가능성이 높습니다', '의심됩니다', '복용하세요', '드세요.', '응급입니다', '안전을 확인했', '건강 점수', '위험도']);
  /* every sentence that mentions 119 tells the person to call themselves */
  for (const s of COPY.split(/[.\n]/).filter((x) => /119/.test(x) && /[가-힣]/.test(x))) assert.match(s, /직접 전화/, s.trim());
});

test('RH-40 truthful admin and provider copy: a local view without sign-in; sources are never called verified, secure or live', () => {
  never(['LIVE VERIFIED', '실시간 확인됨', '서버 정상', '연결 정상', '정상 작동', '보안 인증', '규정 준수', '안전합니다', '보호됩니다', '관리자 전용', '관리자 로그인', 'WCAG CERTIFIED', 'SECURITY CERTIFIED', 'HIPAA', 'PRODUCTION SECURE', 'MEDICAL DEVICE']);
  assert.equal(/\bSECURE\b|\bSECURED\b|\bPROTECTED\b|\bCOMPLIANT\b|\bCERTIFIED\b/.test(COPY), false);
  for (const sentence of ['보안된 관리자 페이지가 아닙니다', '운영 서버 확인: 하지 않음', '없음 (NOT IMPLEMENTED)', '언어 모델 연결 없음 (NOT CONNECTED)', '알림을 보내는 기능은 아직 연결되지 않았습니다.', '휴대폰 알림(푸시), 문자, 이메일은 보내지 않아요.', '연결된 자료에서 찾은 것만 보여 드려요.']) assert.ok(COPY.includes(sentence), sentence);
  never(['푸시를 보냈', '알림을 보냈', '발송 완료', '발송했습니다', '문자를 보냈']);
  /* "준비 중" is said only about things that really are not there */
  const preparing = COPY.split('\n').filter((l) => l.includes('준비 중') && /['`"<]/.test(l));
  assert.ok(preparing.length >= 5 && preparing.length <= 9, String(preparing.length));
  for (const l of preparing) assert.match(l, /가족 연결|available \?|준비 중인 (분류|기능)|\(준비 중\)|m\.available/, l.trim().slice(0, 120));
  /* every menu entry that says it works has somewhere to go; every one that does not is labelled */
  for (const area of AREAS) for (const m of area.modules || []) assert.equal(typeof m.available, 'boolean', `${area.id}.${m.id}`);
  assert.deepEqual(AREAS.find((a) => a.id === 'store').modules.filter((m) => m.available).length, 0, 'no product source is connected, so no store category claims to work');
});

/* ═════════ SEO · cache · dependencies · regression ═════════ */

test('RH-41 SEO metadata: the app page states its language and title and asks not to be indexed — it claims nothing more', () => {
  assert.match(HTML, /<html lang="ko">/);
  assert.match(HTML, /<meta charset="UTF-8" \/>/);
  assert.match(HTML, /<title>Ongil<\/title>/);
  assert.match(HTML, /<meta name="robots" content="noindex, nofollow" \/>/, 'ongil-start is a personal tool, not a page for search results');
  assert.match(APP, /doc\.title = view === 'admin' \? '운영 보기 \| Ongil' : viewTitle\(areaById\(view\)\);/, 'each screen names itself in the tab title');
  /* nothing invites indexing of the app: no canonical, Open Graph, structured data or sitemap entry */
  assert.equal(/rel="canonical"|property="og:|name="twitter:|application\/ld\+json|rel="alternate" hreflang/.test(HTML), false);
  assert.equal(read('sitemap.xml').includes('ongil-start'), false);
  assert.ok(read('sitemap.xml').includes('https://www.newon.app/ko/ongil/'), 'the public introduction page is the one that is listed');
  assert.match(HTML, /<a class="gnav__brand" href="\/ko\/ongil\/" aria-label="Ongil 소개">/);
});

test('RH-42 private SEO boundary: personal screens are hash routes of one unindexed page — no address of theirs is published', () => {
  for (const v of ['life', 'health', 'family', 'saved', 'account', 'admin']) {
    assert.equal(read('sitemap.xml').includes(`ongil-start/#${v}`) || read('sitemap.xml').includes(`/ongil-start/${v}`), false, v);
    assert.equal(new RegExp(`<link[^>]+href="[^"]*#${v}`).test(HTML), false);
  }
  /* a fragment is not sent to a server and is not a separate document: there is no per-screen metadata to get wrong */
  assert.equal(/setAttribute\('content'|querySelector\('meta\[|rel = 'canonical'/.test(ALL_CODE), false, 'no script rewrites meta tags to imitate per-screen SEO');
  /* public items (care, enjoy, store) exist only in memory during a visit: there is nothing static to index */
  for (const f of ['care-view.js', 'enjoy-view.js', 'store-view.js']) assert.equal(/storage\.set\(|localStorage/.test(code(JS[f])), false, `${f} keeps loaded public items in memory only`);
  /* outside links tell the other site nothing about where the person came from */
  for (const m of ALL_CODE.matchAll(/target: '_blank'[^}]*/g)) assert.match(m[0], /noreferrer/);
});

test('RH-43 cache / version consistency: every local file the page loads carries a version, and this release changed them together', () => {
  const local = [...HTML.matchAll(/<(?:link rel="stylesheet" href|script[^>]* src)="(\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(local.length >= 16);
  /* the one unversioned file is the site's shared API config (a LIVON file ONGIL does not own) */
  assert.deepEqual(local.filter((u) => !/\?v=[0-9a-z]+$/.test(u)), ['/livon/livon-api-config.js']);
  const ongil = Object.fromEntries(local.filter((u) => u.startsWith('/ongil-start/')).map((u) => [u.replace(/^\/ongil-start\/(styles|js)\//, '').replace(/\?v=.*/, ''), u.split('?v=')[1]]));
  assert.deepEqual(Object.keys(ongil).sort(), ['app.js', 'ongil-app.css', 'ongil-care.css', 'ongil-home.css', 'ongil-life.css', 'ongil-shell.css', 'ongil-tokens.css']);
  for (const f of ['ongil-shell.css', 'ongil-app.css', 'ongil-tokens.css', 'ongil-home.css']) assert.equal(ongil[f], '20261003r11', `${f} changed in Phase 11 and has the release's version`);
  /* Completion V2 changed app.js (and the modules it imports) and ongil-life.css: those two, and only those, moved on */
  /* Responsive Hardening V1: ongil-life.css changed (layout-only [RH1] block) → its address moved on (BEFORE ?v=20261004v13, AFTER ?v=20261007r14) */
  assert.equal(ongil['ongil-life.css'], '20261007r14', 'ongil-life.css changed in Completion V2 (v12) and again in V3 (v13)');
  assert.equal(ongil['app.js'], '20261006m15', 'app.js changed in Completion V2 (v12), V3 (v13) Health · Safety V2 (20261005h14) and My Life V2 (20261006m15)'); /* My Life V2: app.js changed → entry moved on (BEFORE 20261005h14, AFTER 20261006m15) */
  assert.match(APP, /const APP_VERSION = 'hardening-v1';/);
  /* modules are imported by relative path with no version of their own: they are revalidated by the host's default
     caching (no immutable / long max-age rule exists for /ongil-start in the deployment config) */
  for (const f of JS_FILES) for (const m of JS[f].matchAll(/from '([^']+)'/g)) assert.match(m[1], /^\.\/[a-z-]+\.js$/, `${f} → ${m[1]}`);
  const vercel = read('vercel.json');
  assert.equal(/ongil-start[^}]*Cache-Control|immutable/i.test(vercel), false, 'no long-lived caching is configured that could pin an old module');
  assert.equal(/serviceWorker|caches\.open|workbox/.test(`${ALL_CODE}\n${HTML}`), false, 'no service worker exists (none is pretended)');
});

test('RH-44 external dependencies: fonts and seven film files — no package, CDN script, tracker or embed', () => {
  for (const f of JS_FILES) assert.equal(/from '(?!\.\/)[^']+'|require\(/.test(JS[f]), false, `${f} imports only ONGIL modules`);
  const scripts = [...HTML.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1].replace(/\?v=.*/, ''));
  assert.deepEqual(scripts, ['/theme-shell.js', '/lang-nav.js', '/site-chrome.js', '/lang-dropdown.js', '/livon/livon-api-config.js', '/ongil-start/js/app.js'], 'four shared site scripts, the shared API config, and ONGIL');
  assert.equal(scripts.some((s) => /^https?:|^\/\//.test(s)), false, 'no script from another host');
  const outside = [...new Set([...HTML.matchAll(/(?:href|src|data-og-src)="(https:\/\/[^"/]+)/g)].map((m) => m[1]))].sort();
  assert.deepEqual(outside, ['https://d8j0ntlcm91z4.cloudfront.net', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com']);
  assert.equal(/googletagmanager|google-analytics|gtag\(|hotjar|clarity|mixpanel|amplitude|segment|facebook\.net|doubleclick|adsbygoogle/i.test(HTML + ALL_CODE), false);
  assert.equal(/<iframe|youtube|vimeo/i.test(HTML), false);
  /* the site's deployment config already sends nosniff, a referrer policy and a permissions policy for every path, and a
     report-only content security policy; ONGIL adds no meta policy of its own (it could break the shared header scripts) */
  const vercel = read('vercel.json');
  for (const header of ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Content-Security-Policy-Report-Only']) assert.ok(vercel.includes(header), header);
  assert.equal(/http-equiv="Content-Security-Policy"/.test(HTML), false);
});

test('RH-45 regression: the shape of ONGIL V1 — and the Phase 11 document', () => {
  assert.deepEqual([...VIEWS], ['home', 'life', 'health', 'family', 'care', 'enjoy', 'community', 'store', 'saved', 'account']);
  assert.deepEqual([...INTERNAL_VIEWS], ['admin']);
  /* Family Connection V1: + family (BEFORE 26, AFTER 27) */ /* My Life V2: + memos (BEFORE 27, AFTER 28) */ assert.equal(COLLECTIONS.length, 28); // Completion V3: + emergencyContacts
  /* My Life V2: + memos, life-today (BEFORE 80, AFTER 82) */  /* Family Connection V1: + 5 family modules (BEFORE 71, AFTER 76) */ /* Family Connection V2: + family-remote, family-remote-view (BEFORE 76, AFTER 78) */ /* Health · Safety V2: + health-changes, health-safety-view (BEFORE 78, AFTER 80) */ assert.equal(JS_FILES.length, 82, 'no module was added or removed in Phase 11; Completion V1 added health-measures; Completion V2 added health-appointments; Completion V3 added emergency-contacts');
  assert.equal(CSS_FILES.length, 6);
  assert.deepEqual([A.EVENT_NAMES.length, C.SAVED_TYPES.length, C.NOTIFICATION_TYPES.length, R.CONTENT_TYPE_IDS.length], [22, 7, 9, 7]);
  const w = world();
  const search = createSearch();
  const assistant = T.createAssistant({ now: w.now, schedule: w.schedule, tasks: w.tasks, routines: w.routines, saved: w.saved, search, familyConnection });
  assert.equal(assistant.tools.ids().length, 22);
  const tests = fs.readdirSync(path.join(ROOT, 'tests/ongil')).filter((f) => f.endsWith('.test.mjs'));
  // Phase 12: production-release.test.mjs was added (BEFORE 21, AFTER 22). API connection: production-api.test.mjs (BEFORE 22, AFTER 23). Completion V1: health-measures.test.mjs (AFTER 24).
  /* Family Connection V1: + family-connection.test.mjs (BEFORE 27, AFTER 28). WHY: the new feature brought its own test file. */
  /* Family Connection V2: + family-v2.test.mjs (BEFORE 28, AFTER 29) */
  /* Community V2: + community-v2.test.mjs (BEFORE 29, AFTER 30) */
  /* My Life V2: + my-life-v2.test.mjs (BEFORE 31, AFTER 32) */ /* Responsive Hardening V1: + responsive-hardening.test.mjs (BEFORE 32, AFTER 33). WHY: the hardening brought its own test file. */ assert.equal(tests.length, 33); // Health · Safety V2: + health-safety-v2.test.mjs (BEFORE 30, AFTER 31) · Completion V2: + health-calendar.test.mjs · Completion V3: + emergency-contacts.test.mjs · Product Completion Audit V1: + product-completion.test.mjs (BEFORE 26, AFTER 27)
  for (const f of ['livon', 'server/livon', 'tests/livon']) assert.ok(fs.existsSync(path.join(ROOT, f)), `${f} is still there, untouched by ONGIL`);
  /* Family Connection V2: server/ongil/family is the one ONGIL backend (BEFORE: no server/ongil) */
  assert.deepEqual(fs.readdirSync(path.join(ROOT, 'server/ongil')), ['family']);
  const doc = read('docs/ongil/PHASE_11_RELEASE_HARDENING_V1.md');
  for (const h of ['OBJECTIVE', 'BASELINE', 'INVENTORY', 'ISSUES FOUND', 'ISSUES FIXED', 'REMAINING ISSUES', 'DATA INTEGRITY', 'MEDICATION HISTORY', 'STORAGE MIGRATION', 'PRIVACY MATRIX', 'SECURITY', 'URL SAFETY', 'SECRETS', 'ACCESSIBILITY', 'CONTRAST', 'KEYBOARD', 'SCREEN READER', 'RESPONSIVE', 'PERFORMANCE', 'STORAGE LIMIT', 'OFFLINE', 'ROUTING', 'SEO', 'COPY AUDIT', 'DATES', 'ANALYTICS', 'AI', 'ADMIN', 'RELEASE CONFIG', 'CACHE', 'DEPENDENCIES', 'TEST COVERAGE', 'BROWSER QA', 'KNOWN LIMITATIONS', 'RELEASE BLOCKERS', 'PHASE 12 HANDOFF']) assert.match(doc, new RegExp(`^## (\\d+\\. )?${h}$`, 'm'), h);
  assert.equal(/WCAG CERTIFIED|SECURITY CERTIFIED|HIPAA COMPLIANT|MEDICAL DEVICE COMPLIANT|PRODUCTION SECURE/.test(doc.replace(/(no|not|never|금지)[^\n]*/gi, '')), false, 'no certification is claimed');
  assert.match(doc, /ACTUAL SCREEN READER[^\n]*NOT VERIFIED/);
});

/* Existing-work review (Phase 11): the shared language button was 34px high in the ONGIL header at every width */
test('RH-46 header touch height: the language button in the ONGIL header gets the 44px floor from an ONGIL sheet (shared files untouched)', () => {
  const shell = read('ongil-start/styles/ongil-shell.css');
  assert.match(shell, /\.gnav--ongil \.lang-menu\.lang-menu--chrome \.lang-menu__btn \{ min-height: 44px; \}/);
  assert.match(read('ongil-start/index.html'), /<header[^>]*class="[^"]*gnav--ongil/);
});

test('RH-47 storage blocked: every screen — not only 내 정보 — says once that nothing typed here survives the window, and no content sits under that note', () => {
  /* the start-up block in app.js, run against a minimal page: once when storage is memory-only, never when it is local */
  const src = APP.slice(APP.indexOf('if (!storage.persistent) {'), APP.indexOf('const profile = createProfileStore(storage);'));
  assert.ok(src.length > 0 && src.length < 1500, 'one small block right after createStorage');
  const page = () => {
    const kids = [];
    const node = (tag) => ({ tag, className: '', dataset: {}, attrs: {}, textContent: '', offsetHeight: 73, setAttribute(k, v) { this.attrs[k] = v; } });
    const main = { style: {}, kids, prepend: (n) => kids.unshift(n), querySelector: (sel) => (sel === '[data-og-storage="memory"]' ? kids.find((k) => k.dataset.ogStorage === 'memory') || null : null) };
    const html = { style: {} };
    const observed = [];
    const win = { ResizeObserver: class { constructor(fn) { this.fn = fn; } observe(n) { observed.push([n, this.fn]); } }, addEventListener() {} };
    const doc = { getElementById: (id) => (id === 'og-main' ? main : null), createElement: node };
    return { main, html, win, doc, observed };
  };
  const run = (persistent, p) => new Function('storage', 'doc', 'win', 'html', src)({ persistent }, p.doc, p.win, p.html);
  const blocked = page();
  run(false, blocked);
  run(false, blocked);
  assert.equal(blocked.main.kids.length, 1, 'exactly one note, even if the block runs twice');
  const [note] = blocked.main.kids;
  assert.equal(note.tag, 'p');
  assert.equal(note.className, 'og-notice');
  assert.equal(note.attrs.role, 'note');
  assert.equal(note.textContent, '이 브라우저에서는 저장이 막혀 있습니다. 창을 닫으면 입력한 내용이 사라집니다.');
  assert.ok(JS['account-view.js'].includes(note.textContent), 'same words as 내 정보');
  assert.equal(blocked.main.style.paddingTop, '73px');
  assert.equal(blocked.html.style.scrollPaddingTop, '73px');
  note.offsetHeight = 99; blocked.observed[0][1]();
  assert.equal(blocked.main.style.paddingTop, '99px', 'a narrower screen with a taller note still covers nothing');
  const local = page();
  run(true, local);
  assert.equal(local.main.kids.length, 0);
  assert.equal(local.main.style.paddingTop, undefined);
  /* the note is pinned under the ONGIL header, inside an ONGIL sheet, and never styled into a success message */
  const shell = read('ongil-start/styles/ongil-shell.css');
  assert.match(shell, /main > \.og-notice\[data-og-storage="memory"\] \{ position: fixed; top: var\(--gnav-h, 74px\);[^}]*z-index: 20;/);
  assert.equal(/저장(했|되었|됨)/.test(src), false);
});

/* ───────── Production integration (ONGIL Community V2): module cache versions (MC-1 … MC-7) ─────────
   An import map in index.html gives every ES module a URL that changes exactly when its content changes
   (scripts/ongil-module-versions.mjs). Kept in this file so the ONGIL test-file inventory stays as it is. */
{
  const http = (await import('node:http')).default;
  const crypto = (await import('node:crypto')).default;
  const { expectedMap, block, currentBlock, modules, moduleVersion, START, END } = await import('../../scripts/ongil-module-versions.mjs');
  const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const JS = path.join(ROOT, 'ongil-start', 'js');
  const INDEX = fs.readFileSync(path.join(ROOT, 'ongil-start', 'index.html'), 'utf8');
  const mapJson = () => JSON.parse(/<script type="importmap">([\s\S]*?)<\/script>/.exec(INDEX)[1]);

  test('MC-1 the import map in index.html is current (node scripts/ongil-module-versions.mjs --write after any module change)', () => {
    assert.equal(currentBlock(INDEX), block(), 'run: node scripts/ongil-module-versions.mjs --write');
  });

  test('MC-2 every module except the entry is mapped to its own file with a version taken from its content', () => {
    const map = mapJson().imports;
    const files = fs.readdirSync(JS).filter(f => f.endsWith('.js'));
    assert.ok(files.length > 50);
    assert.deepEqual(Object.keys(map).sort(), files.filter(f => f !== 'app.js').map(f => '/ongil-start/js/' + f).sort());
    for (const [k, v] of Object.entries(map)) {
      const f = k.slice('/ongil-start/js/'.length);
      assert.match(v, /^\/ongil-start\/js\/[a-z0-9-]+\.js\?v=[0-9a-f]{12}$/, k);
      assert.equal(v.split('?')[0], k, 'a module is mapped only to itself');
      const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(JS, f))).digest('hex').slice(0, 12);
      assert.equal(v, k + '?v=' + hash, k + ' carries its content version');
    }
    assert.deepEqual(expectedMap(), { imports: map });
  });

  test('MC-3 one import map, placed before the module entry; the entry keeps its own ?v=; no other inline script is added', () => {
    assert.equal((INDEX.match(/<script type="importmap">/g) || []).length, 1);
    const mapAt = INDEX.indexOf('<script type="importmap">'), entryAt = INDEX.indexOf('<script type="module" src="/ongil-start/js/app.js?v=');
    assert.ok(mapAt > 0 && entryAt > mapAt, 'the map must precede the first module script');
    assert.equal((INDEX.match(/<script type="module"/g) || []).length, 1);
    assert.equal([...INDEX.matchAll(/<script>([\s\S]*?)<\/script>/g)].length, 1, 'still one plain inline script (OG-SEC-5)');
    assert.ok(INDEX.indexOf(START) < mapAt && INDEX.indexOf(END) > mapAt);
  });

  test('MC-4 a content change moves exactly that module\'s URL; identical content keeps it (unchanged modules stay cached)', () => {
    const v = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);
    const src = fs.readFileSync(path.join(JS, 'community.js'));
    assert.equal(v(src), moduleVersion('community.js'));
    assert.notEqual(v(Buffer.concat([src, Buffer.from('\n')])), moduleVersion('community.js'), 'one changed byte → a new URL');
    const versions = modules().map(moduleVersion);
    assert.equal(new Set(versions).size, versions.length, 'distinct files have distinct versions');
  });

  test('MC-5 every import between modules is a relative "./x.js" that the map covers; no dynamic or absolute imports bypass it', () => {
    const map = mapJson().imports;
    for (const f of fs.readdirSync(JS).filter(n => n.endsWith('.js'))) {
      const s = fs.readFileSync(path.join(JS, f), 'utf8');
      assert.doesNotMatch(s, /\bimport\s*\(/, f + ' dynamic import');
      for (const m of s.matchAll(/^\s*(?:import|export)\b[^;'"]*?from\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm)) {
        const spec = m[1] || m[2];
        assert.match(spec, /^\.\/[a-z0-9-]+\.js$/, f + ' imports ' + spec);
        assert.ok(map['/ongil-start/js/' + spec.slice(2)], f + ' → ' + spec + ' is mapped');
      }
    }
  });

  test('MC-6 the map holds same-origin module paths only (no hosts, no secrets)', () => {
    const raw = /<script type="importmap">([\s\S]*?)<\/script>/.exec(INDEX)[1];
    assert.doesNotMatch(raw, /https?:|\/\/[a-z]|key|token|secret/i);
    assert.deepEqual(Object.keys(mapJson()), ['imports']);
  });

  /* ───────── browser: the real module graph loads through versioned URLs, once each ───────── */
  const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
  const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const skip = !(fs.existsSync(PW) && fs.existsSync(CHROME)) && 'no local Chromium';
  const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml' };
  test('MC-7 Chromium: every ONGIL module is fetched with its content version, exactly once, and the app runs without errors', { skip }, async () => {
    const { chromium } = await import(PW);
    const server = http.createServer((req, res) => {
      let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f)); }
      else { res.writeHead(404); res.end(); }
    });
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = 'http://127.0.0.1:' + server.address().port;
    const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
    try {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
      await ctx.route('**/*', r => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
      const p = await ctx.newPage();
      const errors = [], reqs = [];
      p.on('pageerror', e => errors.push(e.message));
      p.on('request', r => { const u = r.url(); if (u.includes('/ongil-start/js/')) reqs.push(u.slice(base.length)); });
      await p.goto(base + '/ongil-start/#community'); await p.waitForTimeout(2000);
      const map = mapJson().imports;
      assert.deepEqual(reqs.filter(u => !/\?v=/.test(u)), [], 'no module is fetched without a version');
      assert.equal(new Set(reqs).size, reqs.length, 'no module is fetched twice');
      for (const u of reqs) if (!u.startsWith('/ongil-start/js/app.js?')) assert.equal(map[u.split('?')[0]], u, u + ' uses the mapped URL');
      assert.ok(reqs.length >= Object.keys(map).length * 0.5, 'the module graph was loaded');
      assert.deepEqual(errors, []);
      assert.match(await p.evaluate(() => document.querySelector('main').innerText), /커뮤니티/);
    } finally { await browser.close(); server.close(); }
  });
}
