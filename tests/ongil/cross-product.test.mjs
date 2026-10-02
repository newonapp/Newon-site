// ONGIL Phase 8 — Search + Saved + Notifications integration: one registry, one result contract, canonical routes,
// privacy boundaries, truthful notifications. The Phase 8 brief numbers these OG-IN-1 … 65; that prefix was already
// used by Phase 2C (integration-data), so they are OG-IN8-1 … 65 here, in the same order.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
// Browser QA (390 / 820 / 1440; 1,100 search items, 500 saved, 500 notifications) runs from a harness outside the
// repository — see docs/ongil/PHASE_8_SEARCH_SAVED_NOTIFICATIONS_INTEGRATION_V1.md. Everything built below is a TEST FIXTURE.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import * as C from '../../ongil-start/js/contracts.js';
import * as R from '../../ongil-start/js/routes.js';
import { createSearch, createAreaProvider, createSavedProvider, createCareProvider, createEnjoyProvider, createStoreProvider, SEARCH_GROUP_LIMIT, SEARCH_STATES } from '../../ongil-start/js/search.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { savedActions, SAVED_PAGE, SNAPSHOT_NOTE } from '../../ongil-start/js/saved-view.js';
import { createNotificationCenter, DELIVERY, PRODUCERS, MAX_ITEMS } from '../../ongil-start/js/notifications.js';
import { NOTIFICATION_PAGE, SEARCH_SCOPE_NOTE, NO_PUSH_NOTE } from '../../ongil-start/js/panels.js';
import { createProfileStore } from '../../ongil-start/js/profile.js';
import { createAccount, syncChange, SYNCABLE_COLLECTIONS, isSyncable } from '../../ongil-start/js/account.js';
import { CLASSIFICATION, classOf, maySync, maySearchGlobally, familySharingAllowed } from '../../ongil-start/js/privacy.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { VIEWS, resolveView, sectionOf, hashFor } from '../../ongil-start/js/router.js';
import { sanitizeProducts, productSavedInput } from '../../ongil-start/js/store-contracts.js';
import { savedInputFor as careSavedInput } from '../../ongil-start/js/care-contracts.js';
import { savedInputFor as enjoySavedInput } from '../../ongil-start/js/enjoy-contracts.js';
import { createPostStore, createGroupStore, createMeetupStore } from '../../ongil-start/js/community.js';
import { createJournalStore } from '../../ongil-start/js/journal.js';
import { createExpenseStore } from '../../ongil-start/js/expenses.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createSymptomStore } from '../../ongil-start/js/symptoms.js';
import { createHealthNoteStore } from '../../ongil-start/js/health-notes.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createFamilySharingStore, createHelpRequestStore } from '../../ongil-start/js/family.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const JS_DIR = path.join(ROOT, 'ongil-start', 'js');
const JS = Object.fromEntries(fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).map((f) => [f, read('js', f)]));
const CODE = Object.fromEntries(Object.entries(JS).map(([f, s]) => [f, strip(s)]));
const APP = CODE['app.js'];
const INDEX = read('index.html');
const CSS = ['ongil-tokens.css', 'ongil-shell.css', 'ongil-app.css', 'ongil-home.css', 'ongil-life.css', 'ongil-care.css'].map((f) => read('styles', f)).join('\n');

function world(seed) {
  const clock = { t: new Date(2026, 9, 3, 9, 0, 0).getTime() };
  const now = () => (clock.t += 1000);
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  const profile = createProfileStore(storage, { now });
  return { clock, now, backend, storage, profile, saved: createSavedStore(storage, { now }), notifications: createNotificationCenter({ storage, profile, now }) };
}

/* TEST FIXTURES ONLY — public items as the screens hold them after loading */
const CATS = ['HOBBY', 'LEARNING', 'EXERCISE', 'CULTURE', 'OUTING', 'TRAVEL'];
const PCATS = ['SAFETY_LIVING', 'HEALTH_LIVING', 'MEAL_KITCHEN', 'BATH_HOME', 'MOBILITY', 'EXERCISE', 'HOBBY', 'DIGITAL', 'SMART_DEVICE', 'GIFT'];
const careItems = (n) => Array.from({ length: n }, (_, i) => ({ type: i % 5 === 0 ? 'CARE_SERVICE' : i % 5 === 1 ? 'PUBLIC_BENEFIT' : 'FACILITY', id: `c${i}`, title: `검증 기관 ${i}`, summary: '돌봄 안내', address: `서울 검증로 ${i}`, category: i % 5 === 0 ? 'care' : i % 5 === 1 ? 'welfare' : 'facility', sourceName: '검증 출처', phone: '02-000-0000', secret: 'raw-payload' }));
const enjoyItems = (n) => Array.from({ length: n }, (_, i) => ({ type: i % 4 === 0 ? 'CLASS' : i % 4 === 1 ? 'EVENT' : i % 4 === 2 ? 'PROGRAM' : 'PLACE', id: `e${i}`, title: `검증 강좌 ${i}`, summary: '배움 안내', organization: '검증 기관', address: '부산 검증길', category: CATS[i % 6], sourceName: '검증 출처' }));
const products = (n) => sanitizeProducts(Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `검증 상품 ${i}`, category: PCATS[i % 10], summary: '생활 물건', brand: '검증브랜드', sellerName: '검증판매처', sellerUrl: `https://seller.example.test/${i}`, features: ['가벼움'] })));
function fullSearch(w, { care = [], enjoy = [], store = [] } = {}) {
  const s = createSearch();
  s.registerProvider(createAreaProvider(AREAS));
  s.registerProvider(createSavedProvider(w.saved, C.SAVED_TYPE_LABELS));
  s.registerProvider(createCareProvider(() => care));
  s.registerProvider(createEnjoyProvider(() => enjoy));
  s.registerProvider(createStoreProvider(() => store));
  return s;
}
const RESULT_KEYS = ['contentType', 'description', 'href', 'id', 'providerId', 'route', 'scope', 'source', 'title', 'type', 'typeLabel'];

/* ───────── SEARCH ───────── */

test('OG-IN8-1 search registry: every provider declares id, label, scope and supported types', () => {
  const s = fullSearch(world());
  assert.deepEqual(s.providers(), [
    { id: 'areas', label: '메뉴', scope: 'PUBLIC', supportedTypes: ['AREA', 'SECTION'] },
    { id: 'saved', label: '저장한 항목', scope: 'PUBLIC', supportedTypes: ['SERVICE', 'BENEFIT', 'FACILITY', 'PROGRAM', 'PLACE', 'PRODUCT'] },
    { id: 'care', label: '돌봄·서비스', scope: 'PUBLIC', supportedTypes: ['SERVICE', 'BENEFIT', 'FACILITY'] },
    { id: 'enjoy', label: '즐길거리', scope: 'PUBLIC', supportedTypes: ['PROGRAM', 'PLACE'] },
    { id: 'store', label: '상품', scope: 'PUBLIC', supportedTypes: ['PRODUCT'] },
  ]);
  assert.deepEqual([...R.SCOPES], ['PUBLIC', 'LOCAL_PRIVATE']);
  for (const bad of [{ id: 'x1', search: () => [] }, { id: 'x2', scope: 'ALL', search: () => [] }, { id: 'x3', scope: 'public', search: () => [] }, { id: 'x4', scope: 'PUBLIC' }, null]) assert.throws(() => s.registerProvider(bad), /INVALID_PROVIDER/);
  assert.equal((APP.match(/search\.registerProvider\(/g) || []).length, 5, 'the app registers exactly these five');
  assert.equal(/registerProvider\(/.test(Object.entries(CODE).filter(([f]) => f !== 'app.js' && f !== 'search.js').map(([, c]) => c).join('\n')), false, 'no screen registers a provider of its own');
});

test('OG-IN8-2 public providers only: a LOCAL_PRIVATE provider can be registered but is never run', async () => {
  const s = fullSearch(world());
  let ran = 0;
  s.registerProvider({ id: 'my-records', label: '내 기록', scope: 'LOCAL_PRIVATE', supportedTypes: ['JOURNAL'], search: () => { ran += 1; return [{ id: 'j1', title: '검증 일기', type: 'JOURNAL' }]; } });
  assert.equal(s.providers().find((p) => p.id === 'my-records').scope, 'LOCAL_PRIVATE');
  const o = await s.query('검증 일기');
  assert.deepEqual([ran, o.results.length, o.state], [0, 0, 'no-results']);
  for (const p of s.providers().filter((x) => x.id !== 'my-records')) assert.equal(p.scope, 'PUBLIC', p.id);
  assert.equal(/scope: 'LOCAL_PRIVATE'/.test(CODE['search.js'] + APP), false, 'no private provider exists in the app');
});

const must = (r, what) => { assert.equal(r && r.ok, true, `${what} was stored (fixture)`); return r; };

test('OG-IN8-3 private records are never found: journal, expenses, help requests, posts, drafts', async () => {
  const w = world();
  must(createJournalStore(w.storage, { now: w.now }).add({ text: '비밀일기본문XYZ' }), 'journal');
  must(createExpenseStore(w.storage, { now: w.now }).add({ category: 'food', amount: 73197, memo: '비밀지출메모XYZ' }), 'expense');
  must(createHelpRequestStore(w.storage, { now: w.now }).add({ category: 'shopping', message: '비밀도움요청XYZ' }), 'help request');
  const meetups = createMeetupStore(w.storage, { now: w.now });
  must(createPostStore(w.storage, { now: w.now }).add({ type: 'QUESTION', category: 'LOCAL', title: '비밀글제목XYZ', body: '비밀글본문XYZ' }), 'post');
  must(createGroupStore(w.storage, { now: w.now, meetups }).add({ name: '비밀모임XYZ', category: 'WALKING', meetingStyle: 'OFFLINE', description: '비밀모임설명XYZ' }), 'group draft');
  const s = fullSearch(w, { care: careItems(10), enjoy: enjoyItems(10), store: products(10) });
  for (const q of ['비밀일기본문XYZ', '비밀지출메모XYZ', '73197', '비밀도움요청XYZ', '비밀글제목XYZ', '비밀글본문XYZ', '비밀모임XYZ', '비밀모임설명XYZ', 'XYZ']) assert.deepEqual((await s.query(q)).results, [], q);
  for (const c of COLLECTIONS.filter((x) => classOf(x) === 'PRIVATE')) assert.equal(maySearchGlobally(c), false, c);
});

test('OG-IN8-4 health-adjacent records are never found: check-ins, symptoms, medication, health notes', async () => {
  const w = world();
  must(createCheckInStore(w.storage, { now: w.now }).set('hard'), 'check-in');
  must(createMedicationStore(w.storage, { now: w.now }).add({ name: '비밀약이름HLT', memo: '비밀약메모HLT' }), 'medication');
  must(createSymptomStore(w.storage, { now: w.now }).save({ symptoms: ['dizzy'], note: '비밀증상메모HLT' }), 'symptom');
  must(createHealthNoteStore(w.storage, { now: w.now }).add({ text: '비밀건강메모HLT' }), 'health note');
  const s = fullSearch(w, { care: careItems(10), enjoy: enjoyItems(10), store: products(10) });
  for (const q of ['비밀약이름HLT', '비밀약메모HLT', '비밀증상메모HLT', '비밀건강메모HLT', 'HLT']) assert.deepEqual((await s.query(q)).results, [], q);
  /* a common word may match a MENU entry (its own title or description) — never a record */
  for (const q of ['어지러움', '복약', '안부']) for (const r of (await s.query(q)).results) assert.equal(r.typeLabel, '메뉴', `${q} → ${r.id}`);
  for (const c of COLLECTIONS.filter((x) => classOf(x) === 'HEALTH_ADJACENT')) assert.equal(maySearchGlobally(c), false, c);
});

test('OG-IN8-5 standard local records are never found: calendar, tasks, routines', async () => {
  const w = world();
  must(createScheduleStore(w.storage, { now: w.now }).add({ title: '비밀일정STD' }), 'event');
  must(createTaskStore(w.storage, { now: w.now }).add({ title: '비밀할일STD' }), 'task');
  must(createRoutineStore(w.storage, { now: w.now }).add({ title: '비밀루틴STD', daysOfWeek: [1] }), 'routine');
  const s = fullSearch(w, { care: careItems(10), enjoy: enjoyItems(10), store: products(10) });
  for (const q of ['비밀일정STD', '비밀할일STD', '비밀루틴STD', 'STD']) assert.deepEqual((await s.query(q)).results, [], q);
  for (const c of COLLECTIONS.filter((x) => classOf(x) === 'STANDARD')) assert.equal(maySearchGlobally(c), false, c);
  assert.deepEqual(COLLECTIONS.filter(maySearchGlobally), ['saved'], 'the only stored collection search may read is saved — and only its public items');
});

test('OG-IN8-6 result contract: fixed fields, bounded text, never the raw provider payload', async () => {
  const s = fullSearch(world(), { care: careItems(3), enjoy: enjoyItems(3), store: products(3) });
  const o = await s.query('검증');
  assert.ok(o.results.length >= 9);
  for (const r of o.results) {
    assert.deepEqual(Object.keys(r).sort(), RESULT_KEYS, r.id);
    assert.equal(r.scope, 'PUBLIC');
    assert.ok(r.title.length <= C.LIMITS.title && r.description.length <= C.LIMITS.description && r.source.length <= C.LIMITS.source);
    assert.equal(r.route, r.href);
    assert.match(r.route, /^#[a-z-]+(\/[a-z-]+)?$/);
  }
  assert.equal(JSON.stringify(o).includes('raw-payload'), false, 'a field the contract does not name is dropped');
  assert.equal(JSON.stringify(o).includes('02-000-0000'), false);
  assert.deepEqual([...SEARCH_STATES], ['empty-query', 'results', 'partial', 'no-results', 'error']);
});

test('OG-IN8-7 type labels: a person reads 메뉴 · 서비스 · 혜택·복지 · 기관·시설 · 프로그램 · 장소 · 상품 — never an enum', async () => {
  const s = fullSearch(world(), { care: careItems(5), enjoy: enjoyItems(4), store: products(1) });
  const o = await s.query('검증');
  const labels = Object.fromEntries(o.results.map((r) => [r.type, r.typeLabel]));
  assert.deepEqual(labels, { CARE_SERVICE: '서비스', PUBLIC_BENEFIT: '혜택·복지', FACILITY: '기관·시설', CLASS: '프로그램', EVENT: '프로그램', PROGRAM: '프로그램', PLACE: '장소', PRODUCT: '상품' });
  assert.equal((await s.query('스토어')).results[0].typeLabel, '메뉴');
  assert.deepEqual([R.typeLabel('NOPE'), R.typeLabel(''), R.typeLabel(null)], ['', '', '']);
  for (const r of o.results) assert.equal(/[A-Z]{3,}/.test(r.typeLabel), false, r.typeLabel);
  /* the panel prints the label, not the enum */
  assert.ok(JS['panels.js'].includes("const describe = (r) => (!r.typeLabel || (r.description || '').startsWith(r.typeLabel) ? r.description : [r.typeLabel, r.description].filter(Boolean).join(' · '));"));
  assert.equal(/text: r\.type\b|text: n\.type\b|text: item\.type\b/.test(CODE['panels.js'] + CODE['saved-view.js']), false);
});

test('OG-IN8-8 canonical route: a result opens the screen that owns its type, whatever the provider says', async () => {
  const s = createSearch();
  s.registerProvider({ id: 'rogue', label: '검증', scope: 'PUBLIC', search: () => [
    { type: 'PRODUCT', id: 'a', title: '검증 a', route: '#care/facility' },
    { type: 'FACILITY', id: 'b', title: '검증 b', route: '#store/gift' },
    { type: 'PLACE', id: 'c', title: '검증 c', href: 'https://evil.example.test/' },
    { type: 'CLASS', id: 'd', title: '검증 d', route: '#enjoy/hobby' },
    { type: 'POST', id: 'e', title: '검증 e', route: '#account' },
    { type: 'UNKNOWN', id: 'f', title: '검증 f', route: 'javascript:alert(1)' },
    { type: 'PUBLIC_BENEFIT', id: 'g', title: '검증 g', route: '#care/welfare' },
  ] });
  const o = await s.query('검증');
  assert.deepEqual(o.results.map((r) => [r.id, r.route]), [['a', '#store'], ['b', '#care/facility'], ['c', '#enjoy'], ['d', '#enjoy/hobby'], ['e', '#community'], ['f', ''], ['g', '#care/welfare']]);
  const real = fullSearch(world(), { care: careItems(5), enjoy: enjoyItems(4), store: products(2) });
  for (const r of (await real.query('검증')).results) assert.equal(resolveView(r.route), R.ownerOf(r.type), `${r.type} → ${r.route}`);
});

test('OG-IN8-9 provider isolation: one provider throwing, rejecting or answering nonsense never fails the search', async () => {
  const s = fullSearch(world(), { store: products(2) });
  s.registerProvider({ id: 'throws', label: '던지는 곳', scope: 'PUBLIC', search: () => { throw new Error('down'); } });
  s.registerProvider({ id: 'rejects', label: '거절하는 곳', scope: 'PUBLIC', search: () => Promise.reject(new Error('down')) });
  s.registerProvider({ id: 'nonsense', label: '엉뚱한 곳', scope: 'PUBLIC', search: () => 'not-a-list' });
  const o = await s.query('검증 상품');
  assert.deepEqual([o.failed, o.failedLabels], [['throws', 'rejects'], ['던지는 곳', '거절하는 곳']]);
  assert.deepEqual(o.results.map((r) => r.id), ['PRODUCT:p0', 'PRODUCT:p1']);
});

test('OG-IN8-10 partial results are a state of their own; every provider failing is an error', async () => {
  const s = fullSearch(world(), { store: products(1) });
  s.registerProvider({ id: 'down', label: '멈춘 곳', scope: 'PUBLIC', search: () => { throw new Error('x'); } });
  assert.equal((await s.query('검증 상품')).state, 'partial');
  assert.equal((await s.query('없는말없는말')).state, 'partial', 'nothing found AND a source did not answer: say so, not "no results"');
  const all = createSearch();
  all.registerProvider({ id: 'down', label: '멈춘 곳', scope: 'PUBLIC', search: () => { throw new Error('x'); } });
  assert.equal((await all.query('무엇')).state, 'error');
  assert.equal((await fullSearch(world(), { store: products(1) }).query('검증 상품')).state, 'results');
  assert.match(JS['panels.js'], /에서는 지금 찾지 못했어요\./);
  assert.match(JS['panels.js'], /지금은 찾지 못했어요\. 잠시 뒤 다시 찾아 주세요\./);
  assert.match(JS['panels.js'], /setState\('loading'\);\s*put\(results, el\('p', \{ class: 'og-panel__note', text: '찾고 있어요…' \}\)\);/, 'loading is a state too');
});

test('OG-IN8-11 no results and empty query are honest: no suggested, popular or trending searches', async () => {
  const s = fullSearch(world());
  const none = await s.query('없는말없는말');
  assert.deepEqual([none.state, none.results, none.groups, none.total], ['no-results', [], [], 0]);
  for (const q of ['', '   ', null, undefined, 5]) assert.equal((await s.query(q)).state, 'empty-query', String(q));
  assert.equal(/인기 검색|추천 검색|실시간 검색|많이 찾는|급상승|trending|popular|suggest/i.test(CODE['panels.js'] + CODE['search.js'] + INDEX), false);
  assert.match(SEARCH_SCOPE_NOTE, /내 기록은 찾지 않아요\./);
  assert.match(SEARCH_SCOPE_NOTE, /이번 방문에서 화면에 불러온/);
});

test('OG-IN8-12 invalid provider data is skipped or cleaned, never shown raw', async () => {
  const s = createSearch();
  s.registerProvider({ id: 'bad', label: '검증', scope: 'PUBLIC', search: () => [null, 5, 'x', {}, { id: 'a' }, { title: 'no id' }, { id: 'ok', title: '  검증 \u0000결과  ', description: 'x'.repeat(1000), type: 'PRODUCT', extra: { deep: 1 }, source: 'y'.repeat(200) }, { id: 'o'.repeat(500), title: '검증 긴 id' }] });
  const o = await s.query('검증');
  assert.deepEqual(o.results.map((r) => r.title), ['검증 결과', '검증 긴 id']);
  assert.ok(o.results[0].description.length <= C.LIMITS.description && o.results[0].source.length <= C.LIMITS.source && o.results[1].id.length <= C.LIMITS.id);
  assert.equal('extra' in o.results[0], false);
});

test('OG-IN8-13 deep links: results carry a refreshable address — the owner screen and, when known, the category', async () => {
  const s = fullSearch(world(), { care: careItems(5), enjoy: enjoyItems(8), store: products(10) });
  const o = await s.query('검증');
  const routes = new Set(o.results.map((r) => r.route));
  for (const expected of ['#care/care', '#care/welfare', '#care/facility', '#enjoy/hobby', '#enjoy/travel', '#store/safety', '#store/gift']) assert.ok(routes.has(expected), expected);
  for (const route of routes) assert.equal(R.safeRoute(route), route, `${route} is a valid address after a refresh`);
  /* menu entries open their section when it has an address */
  const menu = Object.fromEntries([...(await s.query('캘린더')).results, ...(await s.query('가까운 기관')).results, ...(await s.query('루틴')).results].map((r) => [r.id, r.route]));
  assert.equal(menu['life.calendar'], '#life/calendar');
  assert.equal(menu['care.nearby'], '#care/facility');
  assert.equal(menu['life.routine'], '#life/routines');
  /* no detail-by-id address is invented */
  assert.equal([...routes].some((r) => /\d/.test(r) || r.split('/').length > 2), false);
});

test('OG-IN8-14 invalid route in a result falls back to the owner screen or to nothing — never outside ONGIL', async () => {
  const s = createSearch();
  const junk = ['https://evil.example.test/', 'http://x.test', 'javascript:alert(1)', 'data:text/html,x', '//evil.test', '/path', '#nope', '#store/<script>', '#store/a/b', '#', '', null, 42, '#life/"onload'];
  s.registerProvider({ id: 'junk', label: '검증', scope: 'PUBLIC', search: () => junk.flatMap((route, i) => [{ type: 'PRODUCT', id: `p${i}`, title: '검증 상품', route }, { type: 'OTHER', id: `o${i}`, title: '검증 기타', route }]) });
  const o = await s.query('검증');
  assert.ok(o.results.filter((r) => r.type === 'PRODUCT').every((r) => r.route === '#store'));
  assert.deepEqual([...new Set(o.results.filter((r) => r.type === 'OTHER').map((r) => r.route))].sort(), ['', '#store'], 'an unknown type keeps only a route that is really inside ONGIL');
  assert.equal(JSON.stringify(o).includes('evil'), false);
});

test('OG-IN8-15 1,100 public items: search stays correct, fast and bounded', async () => {
  const data = { care: careItems(200), enjoy: enjoyItems(400), store: products(500) };
  assert.equal(data.store.length, 500);
  const s = fullSearch(world(), data);
  const t0 = Date.now();
  const o = await s.query('검증');
  const ms = Date.now() - t0;
  assert.equal(o.total, 1100, 'the count is of what was really found');
  assert.equal(o.results.length, 3 * SEARCH_GROUP_LIMIT, 'at most 20 a provider reach the screen');
  assert.deepEqual(o.groups.map((g) => [g.providerId, g.found, g.results.length, g.truncated]), [['care', 200, 20, true], ['enjoy', 400, 20, true], ['store', 500, 20, true]]);
  const one = await s.query('검증 상품 499');
  assert.deepEqual([one.total, one.results[0].id, one.groups[0].truncated], [1, 'PRODUCT:p499', false]);
  assert.ok(ms < 500, `1,100 items searched in ${ms}ms`);
  assert.ok(JS['panels.js'].includes("group.truncated ? el('p', { class: 'og-panel__note', 'data-og-search-truncated': group.providerId"), 'a cut list says it was cut');
});

/* ───────── SAVED ───────── */

const SAVED_FIXTURE = [
  { type: 'SERVICE', id: 's1', title: '검증 서비스', href: 'https://source.example.test/s1', source: '검증 출처' },
  { type: 'BENEFIT', id: 'b1', title: '검증 혜택', href: '#care' },
  { type: 'FACILITY', id: 'f1', title: '검증 기관', href: 'https://map.example.test/f1', source: '검증 지도' },
  { type: 'PROGRAM', id: 'g1', title: '검증 프로그램', href: 'https://source.example.test/g1' },
  { type: 'PLACE', id: 'l1', title: '검증 장소', href: '#enjoy' },
  { type: 'PRODUCT', id: 'p1', title: '검증 상품', href: '#store/safety' },
  { type: 'POST', id: 'post1', title: '검증 내 글', description: '내 글 · 질문 · 이 기기에만 있어요', href: '#community' },
];

test('OG-IN8-16 saved registry: one definition per type — label, owner, route, scope, sync policy, external link', () => {
  assert.deepEqual(R.CONTENT_TYPE_IDS, [...C.SAVED_TYPES], 'the registry is built from the Saved contract: one list');
  const rows = R.CONTENT_TYPE_IDS.map((t) => { const d = R.CONTENT_TYPES[t]; return [t, d.label, d.owner, d.route, d.scope, d.syncPolicy, d.external]; });
  assert.deepEqual(rows, [
    ['SERVICE', '서비스', 'care', '#care', 'PUBLIC', 'SYNCABLE', true],
    ['BENEFIT', '혜택·복지', 'care', '#care', 'PUBLIC', 'SYNCABLE', true],
    ['FACILITY', '기관·시설', 'care', '#care/facility', 'PUBLIC', 'SYNCABLE', true],
    ['PROGRAM', '프로그램', 'enjoy', '#enjoy', 'PUBLIC', 'SYNCABLE', true],
    ['PLACE', '장소', 'enjoy', '#enjoy', 'PUBLIC', 'SYNCABLE', true],
    ['POST', '글', 'community', '#community', 'LOCAL_PRIVATE', 'LOCAL_ONLY', false],
    ['PRODUCT', '상품', 'store', '#store', 'PUBLIC', 'SYNCABLE', true],
  ]);
  for (const t of R.CONTENT_TYPE_IDS) {
    assert.equal(R.CONTENT_TYPES[t].label, C.SAVED_TYPE_LABELS[t]);
    assert.equal(R.CONTENT_TYPES[t].syncPolicy, C.savedSyncPolicy(t));
    assert.equal(R.safeRoute(R.CONTENT_TYPES[t].route), R.CONTENT_TYPES[t].route, `${t} owner route exists`);
    assert.ok(Object.isFrozen(R.CONTENT_TYPES[t]));
  }
  /* the screens save through these types only */
  assert.deepEqual([careSavedInput({ type: 'CARE_SERVICE', id: 'a', title: 't' }).type, careSavedInput({ type: 'PUBLIC_BENEFIT', id: 'a', title: 't' }).type, careSavedInput({ type: 'FACILITY', id: 'a', title: 't' }).type, enjoySavedInput({ type: 'CLASS', id: 'a', title: 't' }).type, enjoySavedInput({ type: 'EVENT', id: 'a', title: 't' }).type, enjoySavedInput({ type: 'PLACE', id: 'a', title: 't' }).type], ['SERVICE', 'BENEFIT', 'FACILITY', 'PROGRAM', 'PROGRAM', 'PLACE']);
  assert.deepEqual({ ...R.SOURCE_TYPE_ALIASES }, { CARE_SERVICE: 'SERVICE', PUBLIC_BENEFIT: 'BENEFIT', CLASS: 'PROGRAM', EVENT: 'PROGRAM' });
});

test('OG-IN8-17 saved filters: only the kinds that are actually saved get a filter', () => {
  const w = world();
  w.saved.save(SAVED_FIXTURE[5]);
  w.saved.save(SAVED_FIXTURE[4]);
  const counts = w.saved.counts();
  assert.deepEqual(C.SAVED_TYPES.filter((t) => counts[t] > 0), ['PLACE', 'PRODUCT']);
  assert.ok(JS['saved-view.js'].includes("SAVED_TYPES.filter((t) => counts[t] > 0).map((t) => button(t, SAVED_TYPE_LABELS[t], counts[t]))"), 'no empty tab');
  assert.ok(JS['saved-view.js'].includes("if (filter && !counts[filter]) filter = '';"), 'a filter whose last item was removed falls back to 전체');
  assert.deepEqual(w.saved.list({ type: 'PRODUCT' }).map((i) => i.id), ['p1']);
  assert.deepEqual(w.saved.list({ type: 'NOPE' }), []);
  assert.match(JS['saved-view.js'], /'aria-pressed': filter === value \? 'true' : 'false'/);
});

test('OG-IN8-18 saved snapshot: the same nine fields for every type — never a provider payload, health data or markup', () => {
  const w = world();
  w.saved.save(careSavedInput({ type: 'FACILITY', id: 'f9', title: '검증 복지관', address: '서울 검증로 1', phone: '02-000-0000', sourceUrl: 'https://source.example.test/f9', sourceName: '검증 출처', latitude: 37.5, raw: { secret: 'provider-payload' } }));
  w.saved.save(enjoySavedInput({ type: 'CLASS', id: 'e9', title: '검증 강좌', organization: '검증 기관', startDate: '2026-10-10', sourceUrl: 'https://source.example.test/e9', sourceName: '검증 출처', raw: { secret: 'provider-payload' } }));
  w.saved.save(productSavedInput(products(1)[0]));
  w.saved.save({ ...SAVED_FIXTURE[6], body: '글 본문은 저장하지 않는다', checkIn: 'hard', permissions: { family: 'ALL' }, html: '<b>x</b>' });
  const stored = JSON.parse(w.backend.getItem(`${KEY_PREFIX}saved`)).items;
  assert.equal(stored.length, 4);
  for (const it of stored) assert.deepEqual(Object.keys(it).sort(), ['description', 'href', 'id', 'key', 'savedAt', 'schemaVersion', 'source', 'title', 'type'], it.type);
  const dump = JSON.stringify(stored);
  for (const leak of ['provider-payload', '글 본문은 저장하지 않는다', 'hard', 'permissions', '<b>', '37.5']) assert.equal(dump.includes(leak), false, leak);
  assert.equal(/syncPolicy/.test(dump), false, 'the policy is derived from the type, not written — so old and new items are the same shape');
});

test('OG-IN8-19 backward compatibility: items saved by earlier phases read unchanged and get their policy from the type', () => {
  const old = [
    { schemaVersion: 1, key: 'PROGRAM:old1', type: 'PROGRAM', id: 'old1', title: '예전 프로그램', description: '', href: 'https://source.example.test/old1', source: '예전 출처', savedAt: 1_780_000_000_000 },
    { key: 'POST:old2', type: 'POST', id: 'old2', title: '예전 글', href: '#community', savedAt: 1_780_000_000_001 },
    { type: 'PLACE', id: 'old3', title: '예전 장소' },
  ];
  const w = world({ [`${KEY_PREFIX}saved`]: JSON.stringify({ schemaVersion: 1, items: old }) });
  const list = w.saved.list();
  assert.deepEqual(list.map((i) => [i.key, i.title, i.href]).sort(), [['PLACE:old3', '예전 장소', ''], ['POST:old2', '예전 글', '#community'], ['PROGRAM:old1', '예전 프로그램', 'https://source.example.test/old1']]);
  assert.deepEqual(Object.fromEntries(list.map((i) => [i.id, C.savedSyncPolicy(i)])), { old1: 'SYNCABLE', old2: 'LOCAL_ONLY', old3: 'SYNCABLE' });
  assert.equal(w.backend.getItem(`${KEY_PREFIX}saved`), JSON.stringify({ schemaVersion: 1, items: old }), 'reading does not rewrite what is stored');
  assert.equal(savedActions(list.find((i) => i.id === 'old3')).ownerRoute, '#enjoy', 'an old item without an address still opens its owner screen');
});

test('OG-IN8-20 a saved post is LOCAL_ONLY everywhere: no search, no sync, no sharing, no outside link', async () => {
  const w = world();
  w.saved.save({ ...SAVED_FIXTURE[6], href: 'https://evil.example.test/steal' });
  w.saved.save(SAVED_FIXTURE[5]);
  const post = w.saved.list({ type: 'POST' })[0];
  assert.equal(C.savedSyncPolicy(post), 'LOCAL_ONLY');
  const s = fullSearch(w);
  assert.deepEqual((await s.query('검증 내 글')).results, [], 'not found by global search');
  assert.deepEqual((await s.query('검증 상품')).results.map((r) => r.id), ['PRODUCT:p1'], 'while a saved public item is');
  const a = savedActions(post);
  assert.deepEqual([a.localOnly, a.externalUrl, a.ownerRoute, a.typeLabel], [true, '', '#community', '글']);
  assert.deepEqual(C.syncableSavedItems(w.saved.list()).map((i) => i.type), ['PRODUCT']);
  assert.equal(familySharingAllowed(), false);
  assert.ok(JS['saved-view.js'].includes("a.localOnly ? `${a.typeLabel} · 이 기기에만` : a.typeLabel"), 'the row says so in words');
});

test('OG-IN8-21 public saved types are SYNCABLE by policy — and nothing syncs in this phase', () => {
  for (const t of R.PUBLIC_CONTENT_TYPES) assert.equal(C.savedSyncPolicy(t), 'SYNCABLE', t);
  assert.deepEqual(R.PUBLIC_CONTENT_TYPES, ['SERVICE', 'BENEFIT', 'FACILITY', 'PROGRAM', 'PLACE', 'PRODUCT']);
  const w = world();
  const account = createAccount({ storage: w.storage });
  assert.deepEqual([account.state().mode, account.state().syncAvailable, account.state().adapterId], ['local', false, null], 'no adapter is connected');
  assert.equal(/connectSyncAdapter\(/.test(APP), false, 'the app connects none');
  assert.equal(/\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(CODE['saved.js'] + CODE['saved-view.js'] + CODE['routes.js'] + CODE['search.js'] + CODE['notifications.js'] + CODE['panels.js']), false);
});

test('OG-IN8-22 unknown or damaged types fail closed: LOCAL_ONLY, no owner, no label, never saved', () => {
  for (const t of ['NOTE', 'JOURNAL', 'post', '', null, undefined, 7, {}, 'constructor', '__proto__', 'toString']) {
    assert.equal(C.savedSyncPolicy(t), 'LOCAL_ONLY', String(t));
    assert.equal(R.ownerRoute(t), '', String(t));
    assert.equal(R.typeLabel(t), '', String(t));
    assert.equal(R.contentType(t), '', String(t));
  }
  assert.equal(C.savedSyncPolicy({ type: 'JOURNAL' }), 'LOCAL_ONLY');
  assert.deepEqual(C.syncableSavedItems([{ type: 'PRODUCT' }, { type: 'JOURNAL' }, null, 'x', { type: 'POST' }]), [{ type: 'PRODUCT' }]);
  const w = world();
  assert.equal(w.saved.save({ type: 'JOURNAL', id: 'j', title: '일기' }).reason, 'INVALID_TYPE');
  assert.equal(w.saved.save({ type: 'TASK', id: 't', title: '할 일' }).ok, false);
  assert.equal(w.saved.count(), 0);
});

test('OG-IN8-23 owner route: every saved item opens the screen that owns its type; a category is kept only inside that screen', () => {
  const routes = Object.fromEntries(SAVED_FIXTURE.map((i) => [i.type, savedActions(i).ownerRoute]));
  assert.deepEqual(routes, { SERVICE: '#care', BENEFIT: '#care', FACILITY: '#care/facility', PROGRAM: '#enjoy', PLACE: '#enjoy', PRODUCT: '#store/safety', POST: '#community' });
  assert.equal(savedActions({ type: 'PRODUCT', id: 'x', title: 't', href: '#care/facility' }).ownerRoute, '#store', 'a product can never be made to open another area');
  assert.equal(savedActions({ type: 'PLACE', id: 'x', title: 't', href: '#enjoy/outing' }).ownerRoute, '#enjoy/outing');
  assert.equal(savedActions({ type: 'PLACE', id: 'x', title: 't', href: '#enjoy/nope' }).ownerRoute, '#enjoy');
  for (const i of SAVED_FIXTURE) assert.match(savedActions(i).ownerLabel, /^(돌봄·서비스|즐길거리|스토어|커뮤니티) 화면에서 보기$/);
});

test('OG-IN8-24 broken source: the snapshot still shows; a deleted original is said to be gone, never rebuilt', () => {
  const w = world();
  const posts = createPostStore(w.storage, { now: w.now });
  const p = must(posts.add({ type: 'QUESTION', category: 'LOCAL', title: '지워질 글', body: '본문' }), 'post').post;
  w.saved.save({ type: 'POST', id: p.id, title: p.title, href: '#community' });
  const origin = (id) => !!posts.get(id);
  assert.equal(origin(p.id), true);
  posts.remove(p.id);
  assert.equal(origin(p.id), false, 'the original is gone');
  assert.deepEqual(w.saved.list().map((i) => i.title), ['지워질 글'], 'the saved snapshot is still listed');
  const view = JS['saved-view.js'];
  assert.ok(view.includes("const gone = check ? check(item.id) === false : false;"));
  assert.match(view, /현재 원본 정보를 불러올 수 없어요\./);
  assert.match(SNAPSHOT_NOTE, /저장할 때의 내용을 보여 드려요\./);
  assert.match(APP, /origins: \{ POST: \(id\) => !!communityPosts\.get\(id\) \}/);
  assert.equal(/posts\.add\(|communityPosts\.add\(|\.restore\(/.test(CODE['saved-view.js']), false, 'nothing is recreated from a snapshot');
});

test('OG-IN8-25 unsave removes exactly one item and nothing else', () => {
  const w = world();
  for (const i of SAVED_FIXTURE) w.saved.save(i);
  assert.equal(w.saved.count(), 7);
  assert.equal(w.saved.unsave('PLACE', 'l1'), true);
  assert.equal(w.saved.unsave('PLACE', 'l1'), false, 'already gone');
  assert.equal(w.saved.unsave('PLACE', 'p1'), false, 'the type is part of the key');
  assert.deepEqual(w.saved.list().map((i) => i.key).sort(), ['BENEFIT:b1', 'FACILITY:f1', 'POST:post1', 'PRODUCT:p1', 'PROGRAM:g1', 'SERVICE:s1']);
  assert.deepEqual(w.storage.list(), ['saved'], 'no other collection is touched');
  assert.match(JS['saved-view.js'], /'aria-label': `‘\$\{item\.title\}’ 저장 취소`/);
});

test('OG-IN8-26 saved URL safety: an outside link only for https, only for public types, in a new window with noopener', () => {
  const ext = (item) => savedActions(item).externalUrl;
  assert.equal(ext(SAVED_FIXTURE[0]), 'https://source.example.test/s1');
  assert.equal(ext(SAVED_FIXTURE[5]), '', 'an in-app address is not an outside link');
  assert.equal(ext({ type: 'POST', id: 'x', title: 't', href: 'https://x.example.test/' }), '', 'never for a LOCAL_ONLY type');
  const w = world();
  for (const [i, href] of ['javascript:alert(1)', 'data:text/html,x', 'http://insecure.example.test/', '//evil.test/x', 'https://user:pw@evil.test/', 'vbscript:x', ' https://ok.example.test/ ', 'https://ok.example.test/"onmouseover=x'].entries()) w.saved.save({ type: 'PLACE', id: `u${i}`, title: `t${i}`, href });
  assert.deepEqual(w.saved.list().map((i) => i.href).filter(Boolean), ['https://ok.example.test/'], 'only a clean https address survives saving');
  assert.ok(JS['saved-view.js'].includes("href: a.externalUrl, target: '_blank', rel: 'noopener noreferrer', 'data-og-saved-open': 'external'"));
  assert.equal(savedActions(SAVED_FIXTURE[5]).externalLabel, '판매처·출처 보기 (새 창)');
  assert.equal(savedActions(SAVED_FIXTURE[0]).externalLabel, '출처 보기 (새 창)');
});

test('OG-IN8-27 personal records can never become saved items', () => {
  const w = world();
  for (const type of ['TASK', 'ROUTINE', 'EVENT', 'JOURNAL', 'EXPENSE', 'CHECK_IN', 'SYMPTOM', 'MEDICATION', 'HEALTH_NOTE', 'HELP_REQUEST', 'GROUP', 'MEETUP']) assert.equal(w.saved.save({ type, id: 'x1', title: '개인 기록' }).reason, 'INVALID_TYPE', type);
  const savers = Object.entries(CODE).filter(([, c]) => /saved\.(save|toggle)\(/.test(c)).map(([f]) => f).sort();
  assert.deepEqual(savers, ['care-view.js', 'community-view.js', 'enjoy-view.js', 'home-explore.js', 'store-view.js'], 'only the public-content screens and the user\'s own posts save');
  for (const f of ['life-view.js', 'life-plan.js', 'life-daily.js', 'life-records.js', 'life-health.js', 'family-view.js', 'home-today.js']) assert.equal(/saved\./.test(CODE[f]), false, f);
});

test('OG-IN8-28 saving shares nothing: no family, no community, no notification', () => {
  assert.equal(familySharingAllowed(), false);
  for (const f of ['saved.js', 'saved-view.js', 'routes.js']) assert.equal(/familySharing|helpRequests|notifications\.add\(|communityPosts\.add\(|posts\.add\(|navigator\.share/.test(CODE[f]), false, f);
  const w = world();
  for (const i of SAVED_FIXTURE) w.saved.save(i);
  assert.deepEqual(w.storage.list(), ['saved']);
  assert.equal(w.notifications.count(), 0, 'saving raises no notification');
  assert.equal(createFamilySharingStore(w.storage).count(), 0, 'saving changes no sharing choice');
});

test('OG-IN8-29 500 saved items: listing, filtering and counting stay correct and fast', () => {
  const w = world();
  const types = R.CONTENT_TYPE_IDS;
  const items = Array.from({ length: 500 }, (_, i) => ({ schemaVersion: 1, key: `${types[i % 7]}:q${i}`, type: types[i % 7], id: `q${i}`, title: `검증 저장 ${i}`, description: '', href: '', source: '', savedAt: 1_790_000_000_000 + i }));
  w.backend.setItem(`${KEY_PREFIX}saved`, JSON.stringify({ schemaVersion: 1, items }));
  const t0 = Date.now();
  const all = w.saved.list();
  const posts = w.saved.list({ type: 'POST' });
  const counts = w.saved.counts();
  const ms = Date.now() - t0;
  assert.deepEqual([all.length, posts.length, counts.POST, counts.PRODUCT, all[0].id], [500, 71, 71, 71, 'q499']);
  assert.equal(C.syncableSavedItems(all).length, 429);
  assert.ok(ms < 300, `${ms}ms`);
  assert.equal(w.saved.save({ type: 'PLACE', id: 'over', title: '501번째' }).reason, 'LIMIT', 'the collection is bounded');
});

test('OG-IN8-30 saved DOM bound: 30 rows at a time + 더 보기', () => {
  assert.equal(SAVED_PAGE, 30);
  const view = JS['saved-view.js'];
  assert.ok(view.includes('const page = items.slice(0, shown);'));
  assert.ok(view.includes("el('ul', { class: 'og-items', 'aria-label': '저장한 항목' }, page.map(itemRow))"), 'only the page is rendered');
  assert.ok(view.includes('shown += SAVED_PAGE;'));
  assert.match(view, /더 보기 \(\$\{items\.length - page\.length\}개 남음\)/);
  assert.ok(view.includes('shown = SAVED_PAGE;'), 'changing the filter starts again from the first page');
  assert.equal(/items\.map\(itemRow\)/.test(view), false);
});

/* ───────── NOTIFICATIONS ───────── */

/* TEST FIXTURE ONLY — nothing in ONGIL produces notifications; these are written straight to storage or through add() */
function withNotes(n, { enable = true } = {}) {
  const w = world();
  if (enable) for (const t of C.NOTIFICATION_TYPES) w.notifications.setPreference(t.id, true);
  const types = C.NOTIFICATION_TYPES.map((t) => t.id);
  const items = Array.from({ length: n }, (_, i) => ({ schemaVersion: 1, id: `n${i}`, type: types[i % types.length], title: `검증 알림 ${i}`, body: '검증 내용', href: '', createdAt: 1_790_000_000_000 + i, readAt: i % 2 ? 1_790_000_500_000 : 0 }));
  w.backend.setItem(`${KEY_PREFIX}notifications`, JSON.stringify({ schemaVersion: 1, items }));
  return w;
}

test('OG-IN8-31 notification contract: id, type, title, body, in-app address, created, read — plus label, state and route when listed', () => {
  const w = withNotes(0);
  assert.equal(w.notifications.add({ id: 'a1', type: 'SCHEDULE', title: '  검증 일정 \u0000알림 ', body: 'x'.repeat(900), href: '#life/calendar', extra: 'drop', pushToken: 'no' }).ok, true);
  const n = w.notifications.list()[0];
  assert.deepEqual(Object.keys(n).sort(), ['body', 'createdAt', 'href', 'id', 'read', 'readAt', 'route', 'schemaVersion', 'title', 'type', 'typeLabel']);
  assert.deepEqual([n.title, n.typeLabel, n.read, n.route, n.body.length <= C.LIMITS.description], ['검증 일정 알림', '일정', false, '#life/calendar', true]);
  const stored = JSON.parse(w.backend.getItem(`${KEY_PREFIX}notifications`)).items[0];
  assert.deepEqual(Object.keys(stored).sort(), ['body', 'createdAt', 'href', 'id', 'readAt', 'schemaVersion', 'title', 'type']);
  for (const bad of [{ id: 'b', type: 'ORDER', title: 't' }, { id: 'b', type: 'SCHEDULE', title: '' }, { id: 'bad id', type: 'SCHEDULE', title: 't' }, { type: 'SCHEDULE', title: 't' }, null]) assert.equal(w.notifications.add(bad).ok, false);
  assert.deepEqual(C.NOTIFICATION_TYPES.map((t) => [t.id, t.label]), [['CHECK_IN', '안부'], ['SCHEDULE', '일정'], ['MEDICATION', '복약'], ['FAMILY', '가족'], ['SERVICE', '돌봄·서비스'], ['PROGRAM', '프로그램'], ['COMMUNITY', '커뮤니티'], ['STORE', '스토어'], ['SYSTEM', 'ONGIL 안내']]);
});

test('OG-IN8-32 empty: a new device has no notification, and the panel says so', () => {
  const w = world();
  assert.deepEqual([w.notifications.list(), w.notifications.unreadCount(), w.notifications.count()], [[], 0, 0]);
  assert.deepEqual(w.storage.list(), [], 'reading creates nothing');
  assert.match(JS['panels.js'], /'받은 알림이 없습니다\.'/);
  assert.ok(JS['panels.js'].includes("noteHost.dataset.ogNotificationsState = items.length ? 'filled' : 'empty';"));
});

test('OG-IN8-33 read: one notification can be marked read; opening one marks it read', () => {
  const w = withNotes(4);
  assert.equal(w.notifications.unreadCount(), 2);
  assert.equal(w.notifications.markRead('n0').ok, true);
  assert.deepEqual([w.notifications.unreadCount(), w.notifications.list().find((n) => n.id === 'n0').read], [1, true]);
  assert.equal(w.notifications.markRead('n0').already, true);
  assert.equal(w.notifications.markRead('nope').reason, 'NOT_FOUND');
  assert.equal(w.notifications.remove('n1').ok, true);
  assert.equal(w.notifications.remove('n1').reason, 'NOT_FOUND');
  assert.deepEqual(w.notifications.list().map((n) => n.id), ['n3', 'n2', 'n0'], 'newest first; the removed one is gone');
  assert.ok(JS['panels.js'].includes("'aria-label': `‘${n.title}’ 열기`, text: '열기', onclick: () => { notifications.markRead(n.id); updateBadge(); }"));
});

test('OG-IN8-34 unread is said in words and counted — and opening the panel no longer marks everything read', () => {
  const w = withNotes(6);
  assert.equal(w.notifications.unreadCount(), 3);
  w.notifications.list();
  w.notifications.list();
  assert.equal(w.notifications.unreadCount(), 3, 'listing is read-only');
  const panel = JS['panels.js'];
  assert.ok(panel.includes("`${n.typeLabel} · ${n.read ? '읽음' : '읽지 않음'} · ${formatDate(n.createdAt)}`"), 'state in words');
  assert.ok(panel.includes("'data-og-note-read': n.read ? 'true' : 'false'"));
  assert.ok(panel.includes("badge.textContent = n > 0 ? `읽지 않은 알림 ${n}개` : '';"));
  const render = panel.slice(panel.indexOf('function renderNotifications('), panel.indexOf('function updateBadge('));
  assert.equal((render.match(/notifications\.markAllRead\(\)/g) || []).length, 1, 'only the button marks all read');
  assert.ok(render.includes("'data-og-note-all': 'true', text: '모두 읽음으로 표시', onclick: () => { notifications.markAllRead();"));
});

test('OG-IN8-35 mark all read', () => {
  const w = withNotes(9);
  assert.equal(w.notifications.unreadCount(), 5);
  assert.equal(w.notifications.markAllRead(), true);
  assert.deepEqual([w.notifications.unreadCount(), w.notifications.count(), w.notifications.list().every((n) => n.read)], [0, 9, true]);
  const before = w.notifications.list().map((n) => n.readAt);
  w.notifications.markAllRead();
  assert.deepEqual(w.notifications.list().map((n) => n.readAt), before, 'already-read items keep their time');
});

test('OG-IN8-36 type label: every notification names its kind in words', () => {
  const w = withNotes(9);
  assert.deepEqual(w.notifications.list().map((n) => n.typeLabel).reverse(), ['안부', '일정', '복약', '가족', '돌봄·서비스', '프로그램', '커뮤니티', '스토어', 'ONGIL 안내']);
  assert.equal(/text: n\.type\b/.test(CODE['panels.js']), false, 'the enum is never printed');
});

test('OG-IN8-37 deep link: a notification opens the screen that owns its kind', () => {
  assert.deepEqual({ ...R.NOTIFICATION_ROUTES }, { CHECK_IN: '#life/checkin', SCHEDULE: '#life/calendar', MEDICATION: '#life/medication', FAMILY: '#family', SERVICE: '#care', PROGRAM: '#enjoy', COMMUNITY: '#community', STORE: '#store', SYSTEM: '#account' });
  assert.deepEqual(Object.keys(R.NOTIFICATION_ROUTES), C.NOTIFICATION_TYPES.map((t) => t.id), 'one route per type');
  for (const [type, route] of Object.entries(R.NOTIFICATION_ROUTES)) assert.equal(R.safeRoute(route), route, `${type} → ${route} exists`);
  const w = withNotes(9);
  for (const n of w.notifications.list()) assert.equal(n.route, R.NOTIFICATION_ROUTES[n.type], n.type);
  assert.equal(R.notificationRoute('STORE', '#store/gift'), '#store/gift', 'a category inside the owner screen is kept');
  assert.equal(R.notificationRoute('PROGRAM', '#enjoy/culture'), '#enjoy/culture');
  assert.equal(R.notificationRoute('SCHEDULE', '#life/tasks'), '#life/tasks');
});

test('OG-IN8-38 invalid deep link: never outside ONGIL, never another screen, never a made-up detail', () => {
  for (const hint of ['https://evil.example.test/', 'javascript:alert(1)', 'data:x', '//evil.test', '/x', '#nope', '#account', '#store/nope', '#life/calendar/123', '', null, 9, {}]) assert.equal(R.notificationRoute('STORE', hint), '#store', String(hint));
  assert.equal(R.notificationRoute('ORDER', '#store'), '');
  assert.equal(R.notificationRoute(undefined, '#store'), '');
  const w = withNotes(0);
  w.notifications.add({ id: 'x1', type: 'FAMILY', title: '검증', href: 'https://evil.example.test/phish' });
  w.notifications.add({ id: 'x2', type: 'FAMILY', title: '검증', href: '#store/gift' });
  assert.deepEqual(w.notifications.list().map((n) => [n.id, n.href, n.route]), [['x2', '#store/gift', '#family'], ['x1', '', '#family']]);
  assert.equal(JSON.stringify(JSON.parse(w.backend.getItem(`${KEY_PREFIX}notifications`))).includes('evil'), false, 'an outside address is not even stored');
  /* a stored address that was tampered with is cleaned when read */
  const t = world({ [`${KEY_PREFIX}notifications`]: JSON.stringify({ items: [{ id: 't1', type: 'STORE', title: '검증', href: 'https://evil.example.test/', createdAt: 5 }] }) });
  assert.deepEqual(t.notifications.list().map((n) => [n.href, n.route]), [['', '#store']]);
});

test('OG-IN8-39 settings truthfulness: a preference chooses what ONGIL may list, it switches on no delivery', () => {
  const w = world();
  const prefs = w.notifications.preferences();
  assert.equal(prefs.length, 9);
  assert.ok(prefs.every((p) => p.enabled === false && p.delivers === false && p.producer === 'NONE'));
  w.notifications.setPreference('MEDICATION', true);
  const med = w.notifications.preferences().find((p) => p.id === 'MEDICATION');
  assert.deepEqual([med.enabled, med.delivers, med.producer], [true, false, 'NONE'], 'on, and still nothing is sent or produced');
  assert.equal(w.notifications.count(), 0);
  const view = JS['account-view.js'];
  assert.match(view, /text: 'ONGIL 안에서 보고 싶은 알림 종류'/);
  assert.match(view, /아직 ONGIL이 만드는 알림은 없어요\. 고른 종류는 나중에 ONGIL 안의 알림 목록에 쓰여요\. 휴대폰 알림\(푸시\), 문자, 이메일은 보내지 않아요\./);
  assert.match(view, /알림을 ONGIL 안에서 \$\{event\.target\.checked \? '보도록' : '보지 않도록'\} 골라 두었습니다\./);
  assert.match(JS['onboarding-view.js'], /휴대폰 알림\(푸시\), 문자, 이메일은 보내지 않아요\./);
});

const PRODUCTION = Object.entries(CODE).map(([, c]) => c).join('\n') + INDEX;

test('OG-IN8-40 no fake family notification', () => {
  for (const phrase of ['가족이 확인했', '가족이 봤', '가족에게 알렸', '가족이 답', '가족이 보냈', '님이 확인']) assert.equal(PRODUCTION.includes(phrase), false, phrase);
  assert.equal(PRODUCERS.FAMILY, 'NONE');
  for (const f of ['family.js', 'family-view.js', 'family-contracts.js']) assert.equal(/notifications\./.test(CODE[f]), false, f);
});

test('OG-IN8-41 no fake community notification', () => {
  for (const phrase of ['댓글을 남겼', '댓글이 달렸', '공감했', '좋아요를 눌렀', '새 참가자', '참가 신청이', '님이 가입']) assert.equal(PRODUCTION.includes(phrase), false, phrase);
  assert.equal(PRODUCERS.COMMUNITY, 'NONE');
  for (const f of ['community.js', 'community-view.js', 'community-contracts.js']) assert.equal(/notifications\./.test(CODE[f]), false, f);
});

test('OG-IN8-42 no fake commerce notification', () => {
  for (const phrase of ['가격이 내려', '가격 인하', '재입고', '배송이 시작', '주문이 접수', '품절 임박', '할인 알림']) assert.equal(PRODUCTION.includes(phrase), false, phrase);
  assert.deepEqual([PRODUCERS.STORE, PRODUCERS.SERVICE, PRODUCERS.PROGRAM], ['NONE', 'NONE', 'NONE']);
  for (const f of ['store-view.js', 'store-contracts.js', 'store-source.js', 'care-view.js', 'enjoy-view.js']) assert.equal(/notifications\./.test(CODE[f]), false, f);
});

test('OG-IN8-43 no push claim: nothing is delivered outside the app, nothing produces a notification, and the screens say so', () => {
  assert.deepEqual({ ...DELIVERY }, { push: false, server: false, email: false, sms: false, inApp: true });
  assert.ok(Object.values(PRODUCERS).every((v) => v === 'NONE'));
  assert.deepEqual(Object.keys(PRODUCERS), C.NOTIFICATION_TYPES.map((t) => t.id));
  assert.equal(/notifications\.add\(/.test(PRODUCTION), false, 'no production code creates a notification');
  assert.equal(/Notification\.requestPermission|new Notification\(|serviceWorker|PushManager|pushManager|showNotification\(|navigator\.vibrate/.test(PRODUCTION), false, 'no OS notification API is used');
  for (const phrase of ['알림을 보내드려요', '알림을 보내 드려요', '알림을 보내드립니다', '알려 드릴게요', '푸시 알림을 받', '문자로 알려', '알림이 울려요']) assert.equal(PRODUCTION.includes(phrase), false, phrase);
  assert.match(NO_PUSH_NOTE, /알림은 ONGIL 안에서만 보여요\. 휴대폰 알림\(푸시\), 문자, 이메일은 보내지 않아요\./);
  assert.match(JS['panels.js'], /'알림을 보내는 기능은 아직 연결되지 않았습니다\.'/);
});

test('OG-IN8-44 corrupted notification storage: damaged entries are skipped, the rest stay, nothing else is erased', () => {
  for (const bad of ['{not json', '', 'null', '42', '[]', '{}', '{"items":"x"}', '{"items":[null,5,"a",{},{"id":"ok1","type":"NOPE","title":"t"},{"id":"bad id","type":"SYSTEM","title":"t"}]}']) {
    const w = world({ [`${KEY_PREFIX}notifications`]: bad, [`${KEY_PREFIX}saved`]: '{"items":[{"type":"PLACE","id":"keep","title":"남는 것"}]}' });
    assert.doesNotThrow(() => { w.notifications.list(); w.notifications.unreadCount(); w.notifications.count(); w.notifications.markRead('x'); w.notifications.remove('x'); }, bad);
    assert.deepEqual(w.notifications.list(), [], bad);
    assert.equal(w.saved.count(), 1, 'another collection is untouched');
    assert.equal(w.backend.getItem(`${KEY_PREFIX}notifications`), bad, 'reading does not rewrite or erase');
  }
  const mixed = world({ [`${KEY_PREFIX}notifications`]: JSON.stringify({ items: [{ id: 'g1', type: 'SYSTEM', title: '남는 알림', createdAt: 9 }, { id: 'g1', type: 'SYSTEM', title: '중복' }, { id: 'b', type: 'SYSTEM' }, 'junk', { id: 'g2', type: 'STORE', title: '둘째', createdAt: 8, readAt: 'x', unknown: 1 }] }) });
  assert.deepEqual(mixed.notifications.list().map((n) => [n.id, n.title, n.read]), [['g1', '남는 알림', false], ['g2', '둘째', false]]);
});

test('OG-IN8-45 500 notifications: bounded read, bounded DOM, mark-all stays fast', () => {
  const w = withNotes(500);
  const t0 = Date.now();
  const list = w.notifications.list();
  assert.equal(list.length, MAX_ITEMS, 'at most 200 are ever read');
  assert.equal(MAX_ITEMS, 200);
  w.notifications.markAllRead();
  assert.equal(w.notifications.unreadCount(), 0);
  assert.equal(JSON.parse(w.backend.getItem(`${KEY_PREFIX}notifications`)).items.length, 200, 'and at most 200 are kept');
  assert.ok(Date.now() - t0 < 500);
  assert.equal(NOTIFICATION_PAGE, 20);
  const panel = JS['panels.js'];
  assert.ok(panel.includes('const page = items.slice(0, shown);'));
  assert.ok(panel.includes("el('ul', { class: 'og-panel__list', 'aria-label': '알림 목록' }, page.map(noteRow))"));
  assert.equal(/items\.map\(noteRow\)/.test(panel), false, 'never the whole list');
});

/* ───────── ROUTING ───────── */

test('OG-IN8-46 route ownership: one owner per content type, and the owner screens exist', () => {
  const owners = Object.fromEntries(R.CONTENT_TYPE_IDS.map((t) => [t, R.ownerOf(t)]));
  assert.deepEqual(owners, { SERVICE: 'care', BENEFIT: 'care', FACILITY: 'care', PROGRAM: 'enjoy', PLACE: 'enjoy', POST: 'community', PRODUCT: 'store' });
  for (const view of new Set(Object.values(owners))) {
    assert.ok(VIEWS.includes(view), view);
    assert.match(INDEX, new RegExp(`data-og-screen="${view}"`));
  }
  assert.deepEqual([R.ownerOf('CLASS'), R.ownerOf('EVENT'), R.ownerOf('CARE_SERVICE'), R.ownerOf('PUBLIC_BENEFIT'), R.ownerOf('NOPE')], ['enjoy', 'enjoy', 'care', 'care', '']);
  // Phase 9: the internal operations view has sections too (#admin/data …). BEFORE: five sectioned views. AFTER: + admin.
  assert.deepEqual([...R.SECTIONED_VIEWS], ['life', 'care', 'enjoy', 'community', 'store', 'admin']);
});

test('OG-IN8-47 search and saved agree: the same item opens the same owner screen from either', async () => {
  const care = careItems(5);
  const enjoy = enjoyItems(4);
  const store = products(3);
  const s = fullSearch(world(), { care, enjoy, store });
  const found = Object.fromEntries((await s.query('검증')).results.map((r) => [r.id, r.route]));
  for (const it of care) assert.equal(resolveView(found[`${it.type}:${it.id}`]), resolveView(savedActions(careSavedInput(it)).ownerRoute), it.id);
  for (const it of enjoy) assert.equal(resolveView(found[`${it.type}:${it.id}`]), resolveView(savedActions(enjoySavedInput(it)).ownerRoute), it.id);
  for (const p of store) assert.equal(resolveView(found[`PRODUCT:${p.id}`]), resolveView(savedActions(productSavedInput(p)).ownerRoute), p.id);
  assert.ok(JS['search.js'].includes("import { SCOPES, PUBLIC_CONTENT_TYPES, contentType, typeLabel, ownerRoute, safeRoute, moduleRoute } from './routes.js';"));
  assert.ok(JS['saved-view.js'].includes("import { CONTENT_TYPES, ownerRoute } from './routes.js';"));
  assert.ok(JS['notifications.js'].includes("import { notificationRoute, safeRoute } from './routes.js';"));
});


test('OG-IN8-48 back navigation: every state that matters lives in the address, so Back restores it', () => {
  /* a route is a pure function of the hash: going back to an address gives the same view and section */
  for (const hash of ['#ongil-home', '#life/calendar', '#care/facility', '#enjoy/hobby', '#community/write', '#store/gift', '#saved', '#account']) {
    assert.equal(R.safeRoute(hash), hash);
    assert.equal(R.canonicalHash(hash), hash);
  }
  assert.equal((CODE['router.js'].match(/addEventListener\('hashchange'/g) || []).length, 1, 'one listener handles Back and Forward');
  /* panels are overlays, not history entries: a route change closes them */
  assert.ok(APP.includes('navigation.setCurrent(view);\n    panels.closeAll();'));
  /* corrections replace the entry instead of adding one, so Back never bounces */
  assert.equal(/history\.pushState\(/.test(PRODUCTION), false);
  assert.ok((APP.match(/history\.replaceState\(/g) || []).length >= 6);
});

test('OG-IN8-49 forward navigation: links are plain addresses; nothing hijacks history', () => {
  assert.equal(/history\.(back|forward|go)\(/.test(PRODUCTION), false);
  assert.equal(/onpopstate|addEventListener\('popstate'/.test(PRODUCTION), false);
  /* search results, saved rows and notifications are real <a href="#…"> links */
  // Phase 9: the result link also tells an optional observer that it was opened (counting only). Still a plain <a href>.
  assert.ok(JS['panels.js'].includes("r.route ? el('a', { href: r.route, onclick: () => tell(onResultOpen, r) }, inner) : el('span', {}, inner)"));
  assert.ok(JS['panels.js'].includes("el('a', { class: 'og-panel__btn', href: n.route, 'data-og-note-open': n.id"));
  assert.ok(JS['saved-view.js'].includes("el('a', { class: 'og-btn og-btn--ghost', href: a.ownerRoute, 'data-og-saved-open': 'owner'"));
  assert.equal(/location\.(assign|replace)\(|location\.href\s*=|window\.open\(/.test(PRODUCTION), false, 'no script-driven navigation to an arbitrary address');
});

test('OG-IN8-50 invalid hashes: every screen has a safe fallback, and the address is corrected', () => {
  const cases = { '#care/unknown': '#care', '#enjoy/unknown': '#enjoy', '#community/unknown': '#community', '#store/unknown': '#store', '#life/unknown': '#life', '#health/anything': '#health', '#family/x': '#family', '#saved/x': '#saved', '#account/x': '#account', '#ongil-home/x': '#ongil-home', '#store/a/b': '#store', '#store/': '#store', '#care/FACILITY': '#care', '#enjoy/hobby/123': '#enjoy' };
  for (const [hash, fixed] of Object.entries(cases)) assert.equal(R.canonicalHash(hash), fixed, hash);
  for (const junk of ['#nope', '#', '', '#<script>', '#store"x', 'javascript:alert(1)', '#__proto__', '#constructor/x']) assert.equal(R.canonicalHash(junk) === '' || R.canonicalHash(junk) === '#ongil-home', true, junk);
  assert.equal(resolveView('#nope'), null, 'not a route: the current screen stays');
  for (const view of ['life', 'care', 'enjoy', 'community', 'store']) assert.match(APP, new RegExp(`if \\(view === '${view}' && section && !resolve\\w*Section\\(section\\)\\) win\\.history\\.replaceState\\(null, '', '#${view}'\\);`));
  assert.ok(APP.includes("const fixed = canonicalHash(win.location.hash) || hashFor(view);\n      if (fixed && !fixed.includes('/') && fixed !== win.location.hash) win.history.replaceState(null, '', fixed);"), 'even an address the validator refuses is corrected to its screen');
  assert.ok(APP.includes("if (view === 'enjoy' && !section && enjoyView.category()) win.history.replaceState(null, '', `#enjoy/${enjoyView.category().toLowerCase()}`);"), '즐길거리 keeps its category and the address says so');
  for (const s of ['x', 'unknown', 'a/b']) assert.equal(R.sectionValid('health', s), false);
  assert.equal(R.sectionValid('health', ''), true);
});

/* ───────── PRIVACY ───────── */

test('OG-IN8-51 privacy matrix: what each class of data may do — search, saved, sync, family, community', () => {
  const allowed = (c) => ({ search: maySearchGlobally(c), sync: isSyncable(c), family: familySharingAllowed(), community: false });
  const by = (cls) => COLLECTIONS.filter((c) => classOf(c) === cls).sort();
  assert.deepEqual(by('PRIVATE'), ['communityPosts', 'expenses', 'familySharing', 'groupDrafts', 'helpRequests', 'journal', 'meetupDrafts']);
  assert.deepEqual(by('HEALTH_ADJACENT'), ['checkins', 'healthNotes', 'medicationLogs', 'medications', 'symptoms']);
  assert.deepEqual(by('STANDARD'), ['dailyLife', 'events', 'routineLogs', 'routines', 'sleepRecords', 'tasks']);
  assert.deepEqual(by('APP'), ['notifications', 'onboarding', 'preferences', 'profile', 'saved']);
  for (const cls of ['PRIVATE', 'HEALTH_ADJACENT', 'STANDARD']) for (const c of by(cls)) assert.deepEqual(allowed(c), { search: false, sync: false, family: false, community: false }, c);
  assert.deepEqual(allowed('saved'), { search: true, sync: true, family: false, community: false }, 'saved: public items only, item by item');
  assert.deepEqual(allowed('notifications'), { search: false, sync: false, family: false, community: false });
  // Phase 9: one collection was added — "analytics" (daily usage counters, numbers only; class OPERATIONAL). BEFORE: 23. AFTER: 24.
  assert.equal(COLLECTIONS.length, 24, 'Phase 8 added no collection; Phase 9 added analytics');
  assert.deepEqual(by('OPERATIONAL'), ['analytics']);
  assert.deepEqual(allowed('analytics'), { search: false, sync: false, family: false, community: false });
  assert.deepEqual(Object.keys(CLASSIFICATION).sort(), [...COLLECTIONS].sort(), 'every collection is classified');
  /* PUBLIC content (care, enjoy, store) is never stored: it lives in memory for the visit */
  assert.equal(COLLECTIONS.some((c) => /care|enjoy|product|store|search/i.test(c)), false);
});

test('OG-IN8-52 sync boundary: a syncable collection never carries its LOCAL_ONLY items out', () => {
  const w = world();
  const account = createAccount({ storage: w.storage });
  const pushed = [];
  assert.equal(account.connectSyncAdapter({ id: 'test-adapter', isConfigured: () => true, push: (c) => pushed.push(JSON.parse(JSON.stringify(c))) }).connected, true);
  for (const i of SAVED_FIXTURE) w.saved.save(i);
  assert.ok(pushed.length >= 1 && pushed.every((c) => c.collection === 'saved'));
  for (const c of pushed) assert.equal(c.value.items.some((i) => i.type === 'POST'), false, 'the post never leaves');
  assert.deepEqual(pushed[pushed.length - 1].value.items.map((i) => i.type).sort(), ['BENEFIT', 'FACILITY', 'PLACE', 'PRODUCT', 'PROGRAM', 'SERVICE']);
  assert.equal(JSON.parse(w.backend.getItem(`${KEY_PREFIX}saved`)).items.length, 7, 'and it is still here');
  for (const t of C.NOTIFICATION_TYPES) w.notifications.setPreference(t.id, true);
  w.notifications.add({ id: 'n1', type: 'SYSTEM', title: '검증' });
  assert.equal(pushed.filter((c) => c.collection === 'notifications').length, 0, 'notifications are device-only');
  assert.deepEqual([...SYNCABLE_COLLECTIONS], ['profile', 'preferences', 'saved', 'onboarding']);
  assert.equal(syncChange({ collection: 'journal', value: {} }), null);
  assert.equal(syncChange({ collection: 'notifications', value: {} }), null);
  assert.equal(maySync('notifications') && isSyncable('notifications'), false);
});

test('OG-IN8-53 erase removes saved items and notifications with everything else; search keeps no stored state', () => {
  const w = world();
  for (const i of SAVED_FIXTURE) w.saved.save(i);
  for (const t of C.NOTIFICATION_TYPES) w.notifications.setPreference(t.id, true);
  w.notifications.add({ id: 'n1', type: 'SYSTEM', title: '검증' });
  assert.deepEqual(w.storage.list().sort(), ['notifications', 'preferences', 'saved']);
  assert.equal(w.storage.clear(), true);
  assert.deepEqual([w.storage.list(), w.saved.count(), w.notifications.count(), w.notifications.unreadCount(), w.notifications.preferences().some((p) => p.enabled)], [[], 0, 0, 0, false]);
  assert.equal(/storage\.|localStorage|sessionStorage/.test(CODE['search.js'] + CODE['routes.js']), false, 'search and routing store nothing');
  assert.equal(/localStorage|sessionStorage/.test(CODE['panels.js'] + CODE['saved-view.js']), false, 'no search history, no recent queries');
});

test('OG-IN8-54 erase leaves everything that is not ONGIL', () => {
  const foreign = { 'livon.mlStore.v1': '{"keep":true}', 'newon-app-theme': 'dark', 'ongil-unrelated': 'x', 'ongil.v2.saved': 'y', 'newon.ongil.v1.notifications': 'z' };
  const w = world(foreign);
  for (const i of SAVED_FIXTURE) w.saved.save(i);
  w.storage.clear();
  assert.deepEqual(w.backend.keys().sort(), Object.keys(foreign).sort());
  for (const [k, v] of Object.entries(foreign)) assert.equal(w.backend.getItem(k), v, k);
});

/* ───────── SECURITY ───────── */

test('OG-IN8-55 text rendering: every screen builds DOM with el() and textContent — no markup strings anywhere', () => {
  for (const [f, c] of Object.entries(CODE)) assert.equal(/innerHTML|insertAdjacentHTML|outerHTML|document\.write|DOMParser|createContextualFragment/.test(c), false, f);
  for (const f of ['panels.js', 'saved-view.js']) assert.match(JS[f], /import \{ el, clear, announce, formatDate \} from '\.\/dom\.js';/);
  /* markup inside a title stays text all the way through */
  const w = world();
  w.saved.save({ type: 'PLACE', id: 'x', title: '<img src=x onerror=alert(1)>검증', description: '<script>alert(1)</script>' });
  assert.equal(w.saved.list()[0].title, '<img src=x onerror=alert(1)>검증');
  assert.equal(/eval\(|new Function\(|setTimeout\(\s*['"`]/.test(PRODUCTION), false);
});

test('OG-IN8-56 URL safety: one validator; routes are in-app only; outside links are https, new window, noopener', () => {
  for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,x', 'vbscript:x', 'http://x.test', '//x.test', 'https://u:p@x.test', 'https://x.test/"x', ' ', 'file:///etc/passwd', 'blob:x', 'ftp://x']) {
    assert.equal(C.safeHref(bad), '', bad);
    assert.equal(R.safeRoute(bad), '', bad);
  }
  assert.equal(R.safeRoute('https://ok.example.test/'), '', 'a valid outside address is still not a route');
  const blanks = [...PRODUCTION.matchAll(/target: '_blank'[^}]{0,80}/g)].map((m) => m[0]);
  assert.ok(blanks.length >= 3);
  for (const b of blanks) assert.match(b, /rel: 'noopener noreferrer'/, b);
  for (const f of ['routes.js', 'search.js', 'notifications.js']) assert.equal(/new URL\(|location\./.test(CODE[f]), false, `${f} uses the shared validator only`);
});

/* ───────── QUALITY ───────── */

const SHELL_CSS = read('styles', 'ongil-shell.css');
const APP_CSS = read('styles', 'ongil-app.css');

test('OG-IN8-57 accessibility: labelled search, announced states, named lists, read state in words', () => {
  assert.match(INDEX, /<form class="og-search" role="search" data-og-search>/);
  assert.match(INDEX, /<label class="visually-hidden" for="og-search-input">찾을 말<\/label>/);
  assert.match(INDEX, /<p class="og-panel__note" role="status" aria-live="polite" data-og-search-status><\/p>/);
  assert.match(INDEX, /<div data-og-search-results role="region" aria-label="검색 결과" aria-busy="false"><\/div>/);
  assert.ok(JS['panels.js'].includes("results.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');"));
  for (const label of ['`${group.label} 검색 결과`', "'알림 목록'"]) assert.ok(JS['panels.js'].includes(`'aria-label': ${label}`), label);
  for (const label of ["'종류별로 보기'", "'저장한 항목'"]) assert.ok(JS['saved-view.js'].includes(`'aria-label': ${label}`), label);
  assert.match(JS['saved-view.js'], /role: 'status', 'aria-live': 'polite'/);
  assert.match(SHELL_CSS, /\.og-panel__item\.is-unread \.og-panel__result-title::before \{ content: "● "; \}/, 'a mark as well as the words');
  assert.match(APP_CSS, /\.og-filter\[aria-pressed="true"\]::before \{ content: "✓ "; \}/);
  for (const sel of ['.og-panel__note', '.og-panel__result-desc', '.og-panel__btn', '.og-panel__more']) assert.match(SHELL_CSS, new RegExp(`\\${sel} \\{[^}]*font-size: 1rem`), `${sel} is 16px`);
});

test('OG-IN8-58 keyboard: panels open, close with Escape and return focus; every action is a button or a link', () => {
  const p = JS['panels.js'];
  assert.ok(p.includes("if (event.key === 'Escape' && buttons.some((b) => b.getAttribute('aria-expanded') === 'true')) closeAll({ restoreFocus: true });"));
  assert.ok(p.includes('if (wasOpen && restoreFocus) btn.focus();'));
  assert.ok(p.includes("const first = panel.querySelector('input, a[href], button');"));
  assert.equal(/el\('(div|span|li|p)', \{[^}]*onclick:/.test(CODE['panels.js'] + CODE['saved-view.js']), false, 'no click handler on a non-interactive element');
  assert.equal(/tabindex: '[1-9]/.test(CODE['panels.js'] + CODE['saved-view.js']), false, 'no positive tabindex');
  /* focus is kept after an action removes or re-renders its own row */
  assert.ok(p.includes('renderNotifications(`[data-og-note-remove="${n.id}"]`)'));
  assert.ok(p.includes("notifications.remove(n.id); renderNotifications('title');"));
  assert.ok(JS['saved-view.js'].includes("const next = host.querySelector('[data-og-saved-filter]') || document.getElementById('og-saved-title');"));
  /* a control that re-renders its own row must not be mistaken for a click outside the panel */
  assert.ok(p.includes('if (!path.includes(root) && !root.contains(event.target)) closeAll();'));
  for (const sel of ['.og-panel__btn', '.og-search input', '.og-search button', '.og-panel__more']) assert.match(SHELL_CSS, new RegExp(`\\${sel} \\{[^}]*(min-height|height): var\\(--og-control\\)`), `${sel} is a 44px target`);
  assert.match(APP_CSS, /\.og-btn \{[^}]*min-height: var\(--og-control\)/);
});

test('OG-IN8-59 responsive 390: panels fit the screen, saved rows stack, actions wrap', () => {
  assert.match(SHELL_CSS, /\.og-panel \{[^}]*width: min\(22rem, calc\(100vw - 2rem\)\);[^}]*max-height: min\(70vh, 32rem\); overflow: auto;/);
  assert.match(APP_CSS, /\.og-item \{ flex-direction: column; align-items: flex-start; \}/);
  assert.match(APP_CSS, /\.og-item__actions \{ display: flex; flex-wrap: wrap;/);
  assert.match(SHELL_CSS, /\.og-panel__actions \{ display: flex; flex-wrap: wrap;/);
});

test('OG-IN8-60 responsive 820: saved rows keep a readable measure', () => {
  assert.match(APP_CSS, /\.og-items \{[^}]*max-width: 46rem;/);
  assert.match(APP_CSS, /\.og-saved-count \{ max-width: 46rem;/);
  assert.match(APP_CSS, /\.og-filters \{ display: flex; flex-wrap: wrap;/);
});

test('OG-IN8-61 responsive 1440: the panel is anchored to the header tools and scrolls inside itself', () => {
  assert.match(SHELL_CSS, /\.og-panel \{ position: absolute; top: calc\(100% \+ 0\.65rem\); right: 0;/);
  assert.match(APP_CSS, /\.og-item--saved \{ align-items: flex-start; \}/);
});

test('OG-IN8-62 no overflow: long titles, descriptions and addresses wrap', () => {
  assert.match(SHELL_CSS, /\.og-panel__result-title, \.og-panel__result-desc \{ overflow-wrap: anywhere; \}/);
  assert.match(APP_CSS, /\.og-item__title \{[^}]*overflow-wrap: anywhere;/);
  assert.match(APP_CSS, /\.og-item__desc, \.og-item__meta \{[^}]*overflow-wrap: anywhere;/);
  assert.match(APP_CSS, /\.og-item__body \{ min-width: 0; \}/);
  assert.match(APP_CSS, /\.og-item__actions \{[^}]*max-width: 100%;/);
});

test('OG-IN8-63 no console error sources: a failing search or a late answer is handled', () => {
  const p = JS['panels.js'];
  assert.ok(p.includes("outcome = { query: input.value, state: 'error', results: [], groups: [], failed: [], failedLabels: [], total: 0 };"), 'even a search that throws is shown as a state');
  assert.ok(p.includes('if (mine !== ticket) return;'), 'a late answer never overwrites a newer one');
  assert.equal(/console\.(log|error|warn|debug)\(/.test(PRODUCTION), false);
});

test('OG-IN8-64 no page error sources: missing nodes, empty lists and unknown types are tolerated', () => {
  const p = JS['panels.js'];
  for (const guard of ['if (!noteHost) return;', 'if (!badge) return;', 'if (!panel) return;', 'if (form) {']) assert.ok(p.includes(guard), guard);
  /* an absent node is skipped, never printed as the word "null" (found in browser QA, fixed in this phase) */
  assert.equal(/(results|noteHost)\.append\(/.test(p), false);
  assert.ok(p.includes('const put = (node, ...kids) => node.append(...kids.filter((k) => k !== null && k !== undefined && k !== false));'));
  assert.doesNotThrow(() => { savedActions({ type: 'NOPE', id: 'x', title: 't' }); savedActions({}); R.moduleRoute(null, 'x'); R.moduleRoute({ hash: 'javascript:x' }, 'x'); R.ownerRoute(); R.notificationRoute(); R.safeRoute(); R.canonicalHash(); });
  assert.deepEqual([savedActions({ type: 'NOPE', id: 'x', title: 't' }).ownerRoute, R.moduleRoute(null, 'x')], ['', '']);
});

test('OG-IN8-65 regression: no new collection, backend, network, dependency or fixture in production; version moved on', () => {
  // Phase 9: one collection was added — "analytics" (daily usage counters, numbers only; class OPERATIONAL). BEFORE: 23. AFTER: 24.
  assert.equal(COLLECTIONS.length, 24);
  /* Phase 9 moved the version on: admin-v1 / ?v=20261003a9 (BEFORE: integration-v2 / 20261003i8). The version now lives in APP_VERSION. */
  assert.match(JS['app.js'], /const APP_VERSION = 'admin-v1';/);
  assert.match(INDEX, /app\.js\?v=20261003a9/);
  assert.equal(/firebase|supabase|openai|anthropic|api[_-]?key|Bearer /i.test(PRODUCTION), false);
  assert.equal(/\bfetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/.test(CODE['routes.js'] + CODE['search.js'] + CODE['saved.js'] + CODE['saved-view.js'] + CODE['notifications.js'] + CODE['panels.js']), false);
  assert.equal(/TEST FIXTURE|example\.test|fixture/i.test(PRODUCTION), false, 'no QA data in production source');
  for (const f of ['routes.js', 'search.js', 'saved-view.js', 'notifications.js', 'panels.js']) for (const m of JS[f].matchAll(/from '([^']+)'/g)) assert.ok(fs.existsSync(path.join(JS_DIR, m[1])), `${f} → ${m[1]}`);
  // Phase 9: + analytics.js, instrument.js, source-status.js, admin.js, admin-view.js
  assert.equal(fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).length, 65, '60 modules + the five Phase 9 modules');
});
