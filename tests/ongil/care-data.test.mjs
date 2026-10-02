// ONGIL Phase 4 — Care V1: contracts, the facility source (fixture fetcher, no network), filter/search/detail,
// links, saved, family preview, help → care, search privacy; plus the Phase 4 quality checks (OG-FC-*).
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import * as C from '../../ongil-start/js/care-contracts.js';
import { createFacilitySource, createUnconnectedSource, KAKAO_PLACE_PROVIDER } from '../../ongil-start/js/data-source.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { SAVED_TYPES, normalizeSavedItem } from '../../ongil-start/js/contracts.js';
import { createSearch, createAreaProvider, createSavedProvider, createCareProvider } from '../../ongil-start/js/search.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { HELP_CATEGORIES } from '../../ongil-start/js/family-contracts.js';
import { resolveCareSection, CARE_SECTIONS } from '../../ongil-start/js/care-view.js';
import { createJournalStore } from '../../ongil-start/js/journal.js';
import { createHealthNoteStore } from '../../ongil-start/js/health-notes.js';
import { createSymptomStore } from '../../ongil-start/js/symptoms.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createExpenseStore } from '../../ongil-start/js/expenses.js';
import { createFamilySharingStore, createHelpRequestStore } from '../../ongil-start/js/family.js';
import { resolveView, sectionOf } from '../../ongil-start/js/router.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const VIEW = strip(read('js', 'care-view.js'));
const FVIEW = strip(read('js', 'family-view.js'));
const CSS = ['ongil-tokens.css', 'ongil-app.css', 'ongil-home.css', 'ongil-life.css', 'ongil-care.css'].map((f) => read('styles', f)).join('\n');
const INDEX = read('index.html');
const APP = read('js', 'app.js');

/* the place entity shape the existing route returns (server/livon/data/providers/kakao-local.mjs toEntity) — test fixture only */
const place = (i, over = {}) => ({ type: 'place', provider: 'kr-kakao-place', providerId: String(100 + i), title: `테스트 보건소 ${i}`, placeType: '공공기관 › 보건소', mapUrl: `https://place.map.kakao.com/${100 + i}`, location: { region: '서울', address: '서울 테스트동 1', roadAddress: `서울특별시 테스트로 ${i}` }, contact: { phone: '02-000-000' + i }, source: {}, ...over });
function fixtureFetcher({ configured = true, items = [place(1), place(2)], fail = false } = {}) {
  const calls = [];
  const fetcher = async (url) => {
    calls.push(url);
    if (fail) throw new Error('offline');
    const body = /action=status/.test(url) ? { ok: true, providers: { [KAKAO_PLACE_PROVIDER]: { configured } } } : { ok: true, items };
    return { ok: true, json: async () => body };
  };
  return { fetcher, calls };
}
const KIND = C.facilityKindById('health-center');
const load = (opts, params = { region: '서울', kind: KIND }) => {
  const f = fixtureFetcher(opts);
  return createFacilitySource({ apiUrl: (p) => p, fetcher: f.fetcher }).load(params).then((r) => ({ ...r, calls: f.calls }));
};

/* ───────── models ───────── */

test('OG-CR-1 care model: CareService keeps its own shape; booking is never assumed', () => {
  const s = C.normalizeCareService({ id: 'svc-1', title: ' 방문 목욕 ', category: 'care', summary: '집으로 와서', costText: '무료', bookingAvailable: true, price: 1000 });
  assert.deepEqual(Object.keys(s).sort(), ['bookingAvailable', 'category', 'costText', 'hoursText', 'id', 'phone', 'region', 'sourceName', 'sourceUrl', 'summary', 'title', 'type', 'updatedAt']);
  assert.deepEqual([s.type, s.title, s.bookingAvailable], ['CARE_SERVICE', '방문 목욕', false]);
  assert.throws(() => C.normalizeCareService({ id: 'svc-1', title: 'x', category: 'facility' }), /INVALID_CATEGORY/);
  assert.throws(() => C.normalizeCareService({ id: '<b>', title: 'x', category: 'care' }), /INVALID_ID/);
});

test('OG-CR-2 benefit model: eligibility is the source\'s text; ONGIL never decides or applies', () => {
  const b = C.normalizePublicBenefit({ id: 'bn-1', title: '기초연금', category: 'welfare', eligibilityText: '만 65세 이상 …', sourceName: '보건복지부', sourceUrl: 'https://www.mohw.go.kr/x', eligible: true, applicationAvailable: true });
  assert.deepEqual([b.type, b.eligibilityText, b.applicationAvailable, 'eligible' in b, b.sourceUrl], ['PUBLIC_BENEFIT', '만 65세 이상 …', false, false, 'https://www.mohw.go.kr/x']);
  assert.throws(() => C.normalizePublicBenefit({ id: 'bn-1', title: 'x', category: 'welfare' }), /INVALID_SOURCE/, 'a benefit always names its source');
});

test('OG-CR-3 facility model: name, kind, address, region, phone, source; a map link is not an official source', () => {
  const f = C.normalizeFacility({ id: 'kakao-1', name: '종로구 보건소', kind: 'health-center', address: '서울 종로구', region: '서울', phone: '02-2148-3500', sourceName: '카카오 (Kakao Local)', mapUrl: 'https://place.map.kakao.com/1', sourceUrl: 'https://place.map.kakao.com/1' });
  assert.deepEqual([f.type, f.title, f.kind, f.region, f.phone, f.mapUrl, f.sourceUrl], ['FACILITY', '종로구 보건소', 'health-center', '서울', '02-2148-3500', 'https://place.map.kakao.com/1', '']);
  assert.equal(C.normalizeFacility({ id: 'k-2', name: 'x', region: '화성', sourceName: 's' }).region, '', 'unknown regions are dropped');
  assert.deepEqual(C.FACILITY_KINDS.map((k) => k.label), ['노인복지관', '행정복지센터 (주민센터)', '보건소', '치매안심센터', '장기요양기관']);
  assert.equal(C.FACILITY_KINDS.some((k) => /병원/.test(k.label)), false, 'no hospital search was added');
});

test('OG-CR-4 care categories: eleven, each with a plain sentence; three types kept apart', () => {
  assert.deepEqual(C.CARE_CATEGORIES.map((c) => c.label), ['돌봄', '생활지원', '병원 동행', '이동', '식사', '청소·세탁', '장보기', '주거·안전', '디지털 도움', '복지·공공지원', '기관·시설']);
  for (const c of C.CARE_CATEGORIES) assert.ok(c.description.length >= 8, c.id);
  assert.deepEqual(C.CARE_TYPE_IDS, ['CARE_SERVICE', 'PUBLIC_BENEFIT', 'FACILITY']);
  assert.deepEqual([...CARE_SECTIONS], C.CARE_CATEGORY_IDS);
});

/* ───────── states ───────── */

test('OG-CR-5 care empty: no source → unavailable; services and benefits are not connected; nothing invented', async () => {
  assert.equal((await createFacilitySource({}).load({ region: '서울', kind: KIND })).state, 'unavailable');
  const off = await load({ configured: false });
  assert.deepEqual([off.state, off.reason, off.items, off.calls.length], ['unavailable', 'NOT_CONFIGURED', [], 1], 'status first; no search without a configured key');
  const down = await load({ fail: true });
  assert.deepEqual([down.state, down.items], ['unavailable', []]);
  const empty = await load({ items: [] });
  assert.equal(empty.state, 'empty');
  const svc = createUnconnectedSource('services', '돌봄 서비스');
  assert.deepEqual(await svc.load(), { state: 'unavailable', reason: 'NOT_CONNECTED', items: [], attribution: '' });
  assert.equal((await load({}, { region: '', kind: KIND })).reason, 'REGION_REQUIRED');
  assert.match(VIEW, /서비스·혜택 정보는 아직 연결되지 않았어요/);
});

test('OG-CR-6 care results: the existing place route, region + kind only, sanitised into Facility items', async () => {
  const r = await load({ items: [place(1), place(2), { type: 'program', title: 'x' }, place(3, { providerId: 'abc' }), place(4, { title: '' })] });
  assert.equal(r.state, 'ready');
  assert.deepEqual(r.calls, ['/api/livon/data?action=status', `/api/livon/data?provider=kr-kakao-place&query=${encodeURIComponent('서울 보건소')}&page=1&limit=15`]);
  const items = C.sanitizeCareItems(r.items);
  assert.deepEqual(items.map((i) => [i.id, i.type, i.kind]), [['kakao-101', 'FACILITY', 'health-center'], ['kakao-102', 'FACILITY', 'health-center']]);
  assert.match(r.attribution, /공식 기관 자료 아님/);
  assert.equal(C.sanitizeCareItems([...items, ...items]).length, 2, 'duplicates dropped');
});

test('OG-CR-7 care search: text search over loaded items only (name, summary, address, source)', () => {
  const items = C.sanitizeCareItems([{ type: 'FACILITY', id: 'a', name: '종로 노인복지관', region: '서울', address: '종로구 1', sourceName: 's' }, { type: 'FACILITY', id: 'b', name: '중구 보건소', region: '서울', address: '중구 2', sourceName: 's' }, { type: 'CARE_SERVICE', id: 'c', title: '식사 배달', category: 'meals', summary: '도시락을 집으로' }]);
  assert.deepEqual(C.filterCare(items, { query: '도시락' }).map((i) => i.id), ['c']);
  assert.deepEqual(C.filterCare(items, { query: '중 구' }).map((i) => i.id), ['b'], 'spaces ignored');
  assert.deepEqual(C.filterCare(items, { query: '없는말' }), []);
  assert.deepEqual(C.filterCare([], { query: '보건소' }), [], 'nothing to search when nothing was loaded');
});

test('OG-CR-8 care filter: type / category / region; only choices that match loaded data are offered', () => {
  const items = C.sanitizeCareItems([{ type: 'FACILITY', id: 'a', name: 'A', region: '서울', sourceName: 's' }, { type: 'FACILITY', id: 'b', name: 'B', region: '부산', sourceName: 's' }]);
  assert.deepEqual(C.availableFilters(items), { types: ['FACILITY'], regions: ['서울', '부산'] });
  assert.deepEqual(C.availableFilters([]), { types: [], regions: [] });
  assert.deepEqual(C.filterCare(items, { region: '부산' }).map((i) => i.id), ['b']);
  assert.deepEqual(C.filterCare(items, { type: 'PUBLIC_BENEFIT' }), []);
  assert.deepEqual(C.filterCare(items, { category: 'facility' }).length, 2);
  assert.match(VIEW, /if \(t\.id && !avail\.types\.includes\(t\.id\)\) \{\s*b\.disabled = true;/, 'a type with nothing loaded is disabled, not counted');
});

test('OG-CR-9 care detail: one dialog, built for the chosen item; label/value rows', () => {
  const f = C.normalizeFacility({ id: 'k-1', name: '보건소', kind: 'health-center', address: '서울 1', region: '서울', phone: '02-111-2222', sourceName: '카카오 (Kakao Local)' });
  assert.deepEqual(C.detailRows(f).map((r) => r.label), ['종류', '분류', '지역', '주소', '전화', '자료 출처']);
  assert.match(VIEW, /dialog = el\('dialog', \{ class: 'og-dialog og-care-dialog', id: 'og-care-detail', 'aria-labelledby': 'og-care-detail-title' \}\)/);
  assert.match(VIEW, /if \(dialog\) return dialog;/, 'one dialog, reused');
  assert.match(VIEW, /dialog\.addEventListener\('close', \(\) => \{\s*clear\(dialog\);/, 'its content is removed on close (no hidden detail DOM)');
});

test('OG-CR-10 missing field hidden: empty fields produce no row, nothing is filled in', () => {
  const f = C.normalizeFacility({ id: 'k-1', name: '이름만', sourceName: '출처' });
  assert.deepEqual(C.detailRows(f), [{ label: '종류', value: '기관·시설' }, { label: '자료 출처', value: '출처' }]);
  const s = C.normalizeCareService({ id: 's-1', title: '서비스', category: 'meals' });
  assert.deepEqual(C.detailRows(s).map((r) => r.label), ['종류', '분류']);
  assert.equal(C.cleanPhone('call me<b>'), '');
  assert.equal(C.cleanPhone('12'), '');
});

test('OG-CR-11 official URL validation: https public-sector domains only; maps are maps', () => {
  assert.equal(C.officialUrl('https://www.bokjiro.go.kr/ssis-tbu/index.do'), 'https://www.bokjiro.go.kr/ssis-tbu/index.do');
  assert.equal(C.officialUrl('https://www.nhis.or.kr/'), 'https://www.nhis.or.kr/');
  for (const bad of ['http://www.bokjiro.go.kr/', 'javascript:alert(1)', 'https://go.kr.evil.com/', 'https://user:pw@www.go.kr/', 'https://.go.kr/', 'https://www.example.com/', 'https://www.go.kr:8443/', '//www.go.kr', 'data:text/html,x']) assert.equal(C.officialUrl(bad), '', bad);
  assert.equal(C.mapUrl('https://place.map.kakao.com/1'), 'https://place.map.kakao.com/1');
  for (const bad of ['javascript:alert(1)', 'http://place.map.kakao.com/1', 'https://kakao.com.evil.io/']) assert.equal(C.mapUrl(bad), '', bad);
  assert.match(VIEW, /if \(item\.sourceUrl\) links\.push/, '"공식 안내 보기" only when a validated official URL exists');
  assert.match(VIEW, /rel: 'noopener noreferrer'/);
});

test('OG-CR-12 no fake booking: no booking, reservation or payment button or flag', () => {
  assert.equal(/예약하기|결제하기|바로 예약|booking: true|bookingAvailable: true|checkout|payment/i.test(VIEW + strip(read('js', 'care-contracts.js'))), false);
  assert.match(VIEW, /예약, 신청, 결제는 ONGIL에서 할 수 없어요/);
  assert.equal(C.normalizeCareService({ id: 'a', title: 'a', category: 'care', bookingAvailable: true }).bookingAvailable, false);
});

test('OG-CR-13 no fake application: no "신청" action, no completed state, eligibility left to the official notice', () => {
  assert.equal(/신청하기|신청 완료|신청되었|대상입니다|대상이 아닙니다|받을 수 있어요/.test(VIEW), false);
  assert.match(VIEW, /대상 여부는 공식 안내에서 확인하세요\. ONGIL은 대상인지 판단하지 않습니다\./);
  assert.equal(C.normalizePublicBenefit({ id: 'b', title: 'b', category: 'welfare', sourceName: 's', applicationAvailable: true }).applicationAvailable, false);
});

test('OG-CR-14 saved integration: care items save into the existing Saved types (서비스 · 혜택 · 기관)', () => {
  const storage = createStorage({ backend: createMemoryBackend() });
  const saved = createSavedStore(storage);
  const f = C.normalizeFacility({ id: 'kakao-1', name: '보건소', address: '서울 1', phone: '02-111-2222', sourceName: '카카오 (Kakao Local)', mapUrl: 'https://place.map.kakao.com/1' });
  const b = C.normalizePublicBenefit({ id: 'bn-1', title: '기초연금', category: 'welfare', sourceName: '보건복지부', sourceUrl: 'https://www.mohw.go.kr/' });
  const s = C.normalizeCareService({ id: 'svc-1', title: '식사 배달', category: 'meals' });
  for (const it of [f, b, s]) assert.equal(saved.toggle(C.savedInputFor(it)).saved, true, it.type);
  assert.deepEqual(saved.list().map((x) => x.type).sort(), ['BENEFIT', 'FACILITY', 'SERVICE']);
  assert.equal(saved.list({ type: 'FACILITY' })[0].href, 'https://place.map.kakao.com/1');
  assert.equal(saved.list({ type: 'SERVICE' })[0].href, '#care');
  assert.equal(saved.toggle(C.savedInputFor(f)).saved, false, 'toggle removes');
});

test('OG-CR-15 saved backward compatibility: no new saved type; Phase 1–3 saved items still read', () => {
  assert.deepEqual([...SAVED_TYPES], ['SERVICE', 'BENEFIT', 'FACILITY', 'PROGRAM', 'PLACE', 'POST', 'PRODUCT']);
  assert.deepEqual({ ...C.SAVED_TYPE_OF }, { CARE_SERVICE: 'SERVICE', PUBLIC_BENEFIT: 'BENEFIT', FACILITY: 'FACILITY' });
  const old = [{ type: 'PROGRAM', id: 'p1', title: '강좌', savedAt: 1 }, { type: 'PLACE', id: 'pl', title: '공원', savedAt: 2 }];
  const storage = createStorage({ backend: createMemoryBackend({ [`${KEY_PREFIX}saved`]: JSON.stringify({ schemaVersion: 1, items: old.map((o) => normalizeSavedItem(o, 1)) }) }) });
  const saved = createSavedStore(storage);
  saved.save(C.savedInputFor(C.normalizeFacility({ id: 'kakao-1', name: '보건소', sourceName: 's' })));
  assert.deepEqual(saved.list().map((x) => x.type).sort(), ['FACILITY', 'PLACE', 'PROGRAM']);
});

test('OG-CR-16 family send preview: public facts about the item only, marked not sendable', () => {
  const f = C.normalizeFacility({ id: 'kakao-1', name: '보건소', address: '서울 1', phone: '02-111-2222', sourceName: '카카오 (Kakao Local)' });
  const p = C.familySendPreview(f);
  assert.deepEqual(p.fields.map((x) => x.label), ['이름', '종류', '주소', '전화', '자료 출처']);
  assert.deepEqual([p.sendable, p.reason, p.personalDataIncluded], [false, 'NO_FAMILY_CONNECTION', false]);
  assert.match(VIEW, /가족 연결이 필요해요\./);
  assert.match(VIEW, /아직 연결된 가족이 없어서 보내지 않았어요\./);
});

test('OG-CR-17 family send not executed: the preview writes nothing and calls nothing', () => {
  const body = VIEW.slice(VIEW.indexOf("if (mode === 'family') {"), VIEW.indexOf('} else {', VIEW.indexOf("if (mode === 'family') {")));
  assert.ok(body.length > 100);
  assert.equal(/saved\.|storage|fetch|sources\.|\.load\(|\.add\(|\.set\(/.test(body), false, 'the family branch only renders');
  assert.equal(/보냈습니다|전송 완료|전달했/.test(VIEW), false);
});

test('OG-CR-18 help → care route: each help category maps to a real care category, opened by address only', () => {
  for (const h of HELP_CATEGORIES) if (h.careCategory) assert.ok(C.CARE_CATEGORY_IDS.includes(h.careCategory), h.id);
  assert.deepEqual(HELP_CATEGORIES.map((h) => h.careCategory), ['hospital-escort', 'shopping', 'mobility', 'housekeeping', 'digital', '']);
  assert.equal(resolveView('#care/hospital-escort'), 'care');
  assert.equal(sectionOf('#care/hospital-escort'), 'hospital-escort');
  assert.equal(resolveCareSection('hospital-escort'), 'hospital-escort');
  assert.equal(resolveCareSection('apply-now'), '');
  assert.match(FVIEW, /href: `#care\/\$\{c\.careCategory\}`/);
  assert.match(APP, /if \(view === 'care'\) care\.show\(section\);/);
  assert.match(APP, /if \(view === 'care' && section && !resolveCareSection\(section\)\) win\.history\.replaceState\(null, '', '#care'\);/);
});

test('OG-CR-19 public search eligibility: loaded public care items are findable; nothing before loading', async () => {
  let loaded = [];
  const search = createSearch();
  search.registerProvider(createCareProvider(() => loaded));
  assert.deepEqual((await search.query('보건소')).results, []);
  loaded = C.sanitizeCareItems([{ type: 'FACILITY', id: 'kakao-1', name: '종로구 보건소', address: '서울 종로구', region: '서울', sourceName: '카카오 (Kakao Local)' }]);
  const r = await search.query('종로');
  assert.deepEqual(r.results.map((x) => [x.providerId, x.type, x.title, x.href]), [['care', 'FACILITY', '종로구 보건소', '#care/facility']]);
  assert.match(APP, /search\.registerProvider\(createCareProvider\(\(\) => care\.items\(\)\)\);/);
});

test('OG-CR-20 private search exclusion: journal, expenses, health, check-in, medication, family and help never appear', async () => {
  const storage = createStorage({ backend: createMemoryBackend() });
  createJournalStore(storage).add({ text: '비밀일기X' });
  createExpenseStore(storage).add({ category: 'food', amount: 4321, memo: '비밀지출X' });
  createHealthNoteStore(storage).add({ text: '비밀건강메모X' });
  createSymptomStore(storage).save({ symptoms: ['other'], other: '비밀증상X' });
  createCheckInStore(storage).save({ status: 'good', memo: '비밀안부X' });
  createMedicationStore(storage).add({ name: '비밀약X' });
  createFamilySharingStore(storage).set('SCHEDULE', 'DETAIL');
  createHelpRequestStore(storage).add({ category: 'shopping', message: '비밀도움X' });
  const search = createSearch();
  search.registerProvider(createAreaProvider(AREAS));
  search.registerProvider(createSavedProvider(createSavedStore(storage)));
  search.registerProvider(createCareProvider(() => []));
  for (const q of ['비밀일기X', '비밀지출X', '4321', '비밀건강메모X', '비밀증상X', '비밀안부X', '비밀약X', '비밀도움X']) assert.deepEqual((await search.query(q)).results, [], q);
  const prov = strip(read('js', 'search.js'));
  assert.equal(/storage|journal|expenses|healthNotes|symptoms|helpRequests|familySharing/.test(prov), false, 'no search provider touches personal stores');
});

/* ───────── quality (OG-FC) ───────── */

test('OG-FC-1 delete ONGIL data: the two new collections are erased with everything else', () => {
  const backend = createMemoryBackend();
  const storage = createStorage({ backend });
  createFamilySharingStore(storage).set('TASK', 'SUMMARY');
  createHelpRequestStore(storage).add({ category: 'device' });
  assert.deepEqual(storage.list().sort(), ['familySharing', 'helpRequests']);
  assert.equal(storage.clear(), true);
  assert.deepEqual(storage.list(), []);
  assert.equal(COLLECTIONS.length, 20);
  assert.match(read('js', 'account-view.js'), /가족 공유 설정과 도움 요청도 함께 지웁니다/);
});

test('OG-FC-2 non-ONGIL preserved: LIVON, site and look-alike keys survive the erase', () => {
  const foreign = { 'livon.keep': '1', 'newon-app-theme': 'dark', 'ongil.v2.helpRequests': 'x', helpRequests: 'y', 'newon.ongil.v1.familySharing': 'z' };
  const backend = createMemoryBackend(foreign);
  const storage = createStorage({ backend });
  createHelpRequestStore(storage).add({ category: 'device' });
  storage.clear();
  for (const [k, v] of Object.entries(foreign)) assert.equal(backend.getItem(k), v, k);
});

test('OG-FC-3 accessibility: fieldset/legend radios, confirm before health sharing, dialog focus trap, Escape, focus return', () => {
  assert.match(FVIEW, /'fieldset',\s*\{ class: 'og-choices og-share'/);
  assert.match(FVIEW, /el\('legend', \{ class: 'og-field__label', id: legendId \}/);
  assert.match(FVIEW, /type: 'radio',/);
  assert.match(FVIEW, /el\('label', \{ class: 'og-choice og-share__opt' \}, input,/, 'the whole row is the label');
  assert.match(FVIEW, /if \(c\.sensitive && level !== 'NONE' && current === 'NONE'\)/);
  assert.match(FVIEW, /role: 'group', 'aria-label': `\$\{c\.label\} 공유 확인`/);
  assert.match(FVIEW, /지금: \$\{levelLabel\(levels\[c\.id\]\)\}/, 'the current choice is said in words, not only by the dot');
  assert.match(VIEW, /if \(event\.key !== 'Tab'\) return;/);
  assert.match(VIEW, /dialog\.addEventListener\('close'/);
  assert.match(VIEW, /if \(back\) back\.focus\(\);/);
  assert.match(VIEW, /'aria-haspopup': 'dialog'/);
  assert.match(VIEW, /'aria-pressed': isSaved \? 'true' : 'false'/);
  assert.match(CSS, /\.og-share__opt \{[^}]*min-height: var\(--og-control\)/);
  assert.match(CSS, /\.og-share__opt:has\(input:checked\) \{[^}]*font-weight: 700/);
});

test('OG-FC-4 390 responsive rules: detail rows stack, long names wrap', () => {
  assert.match(CSS, /@media \(max-width: 480px\) \{\s*\.og-care-rows \{ grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(CSS, /\.og-care-dialog \.og-dialog__title \{ overflow-wrap: anywhere; \}/);
  assert.match(CSS, /\.og-care-rows dd \{[^}]*overflow-wrap: anywhere/);
  assert.match(CSS, /\.og-share__opt \{[^}]*overflow-wrap: anywhere/);
});

test('OG-FC-5 820 responsive rules: both screens use one card column with a readable width', () => {
  assert.match(CSS, /\.og-family-grid, \.og-care-grid \{ display: grid; gap: 1rem; max-width: 60rem; \}/);
  assert.equal(/[^-(]width:\s*\d{3,}px/.test(read('styles', 'ongil-care.css')), false, 'no fixed pixel width (media-query breakpoints aside)');
});

test('OG-FC-6 1440 responsive rules: the dialog keeps its bounded width; the stylesheet is linked once', () => {
  assert.match(CSS, /\.og-dialog \{ width: min\(34rem, calc\(100vw - 2rem\)\)/);
  assert.equal((INDEX.match(/ongil-care\.css/g) || []).length, 1);
  assert.equal(/#[0-9a-f]{3,6}\b/i.test(read('styles', 'ongil-care.css').replace(/\/\*[\s\S]*?\*\//g, '')), false, 'colours come from tokens');
});

test('OG-FC-7 no console error sources: no console calls or throws on the new screens\' render paths', () => {
  for (const f of ['family-view.js', 'care-view.js', 'family.js', 'care-contracts.js']) assert.equal(/console\.(error|warn|log)/.test(strip(read('js', f))), false, f);
  assert.match(VIEW, /try \{\s*result = await sources\.facility\.load/, 'a failing source becomes a state, not an error');
});

test('OG-FC-8 no page error sources: null children are skipped; markup is never built from strings', () => {
  for (const f of ['family-view.js', 'care-view.js']) {
    const code = strip(read('js', f));
    assert.match(code, /const put = \(node, \.\.\.kids\) => append\(node, kids\);/, f);
    assert.equal(/card\.body\.append\(/.test(code), false, `${f}: a plain append would print "null"`);
    assert.equal(/innerHTML|outerHTML|insertAdjacentHTML/.test(code), false, f);
  }
});

test('OG-FC-9 no horizontal overflow sources: grid children may shrink and long text wraps', () => {
  assert.match(CSS, /\.og-care-dialog \.og-dialog__body > \* \{ min-width: 0; \}/);
  assert.match(CSS, /\.og-share \{[^}]*min-width: 0/);
  assert.match(CSS, /\.og-care-about p, \.og-care-unconnected p \{[^}]*overflow-wrap: anywhere/);
});

test('OG-FC-10 regression: shells, routes, Home layout, sync list, network boundary', () => {
  assert.match(APP, /if \(area\.id === 'home' \|\| area\.id === 'life' \|\| area\.id === 'family' \|\| area\.id === 'care' \|\| area\.id === 'enjoy'\) continue;/);
  assert.equal((APP.match(/\bfetch\(/g) || []).length, 1, 'fetch injected once');
  assert.match(APP, /const nearbySource = createLifelongClassSource\(dataApi\);/);
  assert.match(APP, /facility: createFacilitySource\(dataApi\),/);
  for (const f of fs.readdirSync(path.join(ROOT, 'ongil-start', 'js')).filter((x) => x.endsWith('.js') && x !== 'data-source.js')) assert.equal(/fetcher\(/.test(strip(read('js', f))), false, f);
  assert.match(INDEX, /<section class="og-band" data-og-modules="family"/);
  assert.match(INDEX, /<section class="og-band" data-og-modules="care"/);
  assert.match(AREAS.find((a) => a.id === 'family').notice, /가족 연결은 아직 할 수 없습니다/);
  assert.match(AREAS.find((a) => a.id === 'care').notice, /신청, 예약, 결제 기능은 없습니다/);
  assert.equal(/server\/|livon\/data\/providers|LIVON_|PUBLIC_DATA_SERVICE_KEY|KAKAO_REST_API_KEY/.test(strip(read('js', 'data-source.js'))), false, 'no server code or key name in the browser');
});
