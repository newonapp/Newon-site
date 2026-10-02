// ONGIL Phase 7 — Store + Products V1: product contract, source boundary, search / filter / sort, detail, saved +
// item-level saved sync policy, family preview, global search, comparison, safety, privacy and quality checks.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
// Browser QA (390 / 820 / 1440, 500-product fixture) runs from a harness outside the repository; see
// docs/ongil/PHASE_7_STORE_PRODUCTS_V1.md › RESPONSIVE / PERFORMANCE. Fixtures below are TEST FIXTURES ONLY.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import * as S from '../../ongil-start/js/store-contracts.js';
import { STORE_SECTIONS, resolveStoreSection, STORE_PAGE } from '../../ongil-start/js/store-view.js';
import { createProductSource, PRODUCT_SOURCE_ID } from '../../ongil-start/js/store-source.js';
import { createSearch, createAreaProvider, createSavedProvider, createStoreProvider } from '../../ongil-start/js/search.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { SAVED_TYPES, SAVED_SYNC_POLICY, SAVED_SYNC_POLICIES, savedSyncPolicy, syncableSavedItems, normalizeSavedItem, NOTIFICATION_TYPES } from '../../ongil-start/js/contracts.js';
import { createAccount, syncChange, SYNCABLE_COLLECTIONS } from '../../ongil-start/js/account.js';
import { classOf } from '../../ongil-start/js/privacy.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { resolveView, sectionOf } from '../../ongil-start/js/router.js';
import { createPostStore } from '../../ongil-start/js/community.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const VIEW = strip(read('js', 'store-view.js'));
const CONTRACTS = strip(read('js', 'store-contracts.js'));
const SOURCE = strip(read('js', 'store-source.js'));
const STORE_SRC = [VIEW, CONTRACTS, SOURCE].join('\n');
const APP = read('js', 'app.js');
const APP_CODE = strip(APP);
const SEARCH = strip(read('js', 'search.js'));
const CSS = read('styles', 'ongil-care.css');
const INDEX = read('index.html');
const JS_DIR = path.join(ROOT, 'ongil-start', 'js');

/* TEST FIXTURE ONLY — a raw source item with every optional field and some fields the contract must drop */
const raw = (i = 1, over = {}) => ({
  id: `p-${i}`,
  name: `테스트 상품 ${i}`,
  category: 'SAFETY_LIVING',
  summary: '집 안에서 쓰는 물건',
  brand: '브랜드A',
  priceText: '12,000원',
  imageUrl: 'https://img.example.test/a.png',
  sellerName: '판매처A',
  sellerUrl: 'https://seller.example.test/p/1',
  sourceName: '자료A',
  sourceUrl: 'https://source.example.test/1',
  features: ['가벼움', '접이식'],
  updatedAt: '2026-09-30',
  rating: 4.9,
  reviewCount: 1200,
  stock: 3,
  inventory: 10,
  discountRate: 30,
  originalPrice: '20,000원',
  salesCount: 5000,
  ...over,
});
function env() {
  const backend = createMemoryBackend();
  const storage = createStorage({ backend });
  return { backend, storage, saved: createSavedStore(storage, { now: () => 1_790_000_000_000 }) };
}

/* ───────── PRODUCT MODEL ───────── */

test('OG-STO-1 product model: required id · name · category · summary; optional fields kept when given', () => {
  const p = S.normalizeProduct(raw());
  assert.deepEqual(Object.keys(p).sort(), ['brand', 'category', 'features', 'id', 'imageUrl', 'name', 'priceText', 'sellerName', 'sellerUrl', 'sourceName', 'sourceUrl', 'summary', 'updatedAt'].sort());
  assert.equal(p.name, '테스트 상품 1');
  assert.deepEqual(p.features, ['가벼움', '접이식']);
  assert.equal(p.updatedAt, '2026-09-30');
});

test('OG-STO-2 category taxonomy: ten categories with Korean labels and route slugs', () => {
  assert.deepEqual([...S.PRODUCT_CATEGORY_IDS], ['SAFETY_LIVING', 'HEALTH_LIVING', 'MEAL_KITCHEN', 'BATH_HOME', 'MOBILITY', 'EXERCISE', 'HOBBY', 'DIGITAL', 'SMART_DEVICE', 'GIFT']);
  assert.deepEqual(S.PRODUCT_CATEGORIES.map((c) => c.label), ['생활·안전', '건강 생활', '식사·주방', '욕실·주거', '이동', '운동', '취미', '디지털', '스마트기기', '선물']);
  assert.deepEqual([...STORE_SECTIONS], ['safety', 'health-living', 'kitchen', 'bath-home', 'mobility', 'exercise', 'hobby', 'digital', 'smart-device', 'gift']);
  for (const slug of STORE_SECTIONS) assert.equal(sectionOf(`#store/${slug}`), slug, slug);
  /* HEALTH_LIVING is everyday goods, not medicine */
  assert.match(S.productCategoryById('HEALTH_LIVING').description, /의약품이나 치료 제품은 다루지 않아요/);
  assert.doesNotMatch(JSON.stringify(S.PRODUCT_CATEGORIES), /처방|의약품 판매|치료제|영양제|보조제/);
});

test('OG-STO-3 optional fields are absent (not empty, not invented) when the source did not give them', () => {
  const p = S.normalizeProduct({ id: 'p-2', name: '이름만', category: 'GIFT', summary: '소개' });
  assert.deepEqual(Object.keys(p).sort(), ['category', 'features', 'id', 'name', 'summary']);
  assert.deepEqual(p.features, []);
  assert.deepEqual(S.productDetailRows(p).map((r) => r.label), ['분류', '자료에 적힌 소개']);
});

test('OG-STO-4 invalid products are refused with a reason', () => {
  assert.throws(() => S.normalizeProduct(null), /INVALID_PRODUCT/);
  assert.throws(() => S.normalizeProduct(raw(1, { id: 'bad id!' })), /INVALID_ID/);
  assert.throws(() => S.normalizeProduct(raw(1, { name: '  ' })), /INVALID_NAME/);
  assert.throws(() => S.normalizeProduct(raw(1, { category: 'MEDICINE' })), /INVALID_CATEGORY/);
  assert.throws(() => S.normalizeProduct(raw(1, { summary: '' })), /INVALID_SUMMARY/);
});

test('OG-STO-5 unsafe URLs are dropped: only https for seller, source and image', () => {
  for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'http://seller.test', '//seller.test', '#store', '/store', 'https://user:pw@seller.test/', 'https://seller.test/a b']) {
    const p = S.normalizeProduct(raw(1, { sellerUrl: bad, sourceUrl: bad, imageUrl: bad }));
    assert.ok(!('sellerUrl' in p) && !('sourceUrl' in p) && !('imageUrl' in p), bad);
  }
  assert.equal(S.safeImageUrl('https://img.test/logo.svg'), '', 'no SVG images');
  assert.equal(S.safeExternalUrl('https://seller.test/p?id=1'), 'https://seller.test/p?id=1');
});

test('OG-STO-6 long text is bounded, control characters removed, features capped at 8', () => {
  const p = S.normalizeProduct(raw(1, { name: '가'.repeat(500), summary: '나\u0007'.repeat(900), brand: 'b'.repeat(200), priceText: '1'.repeat(200), sellerName: 's'.repeat(200), features: Array.from({ length: 20 }, (_, i) => `특징${i}`.repeat(30)) }));
  assert.equal(p.name.length, S.PRODUCT_LIMITS.name);
  assert.ok(p.summary.length <= S.PRODUCT_LIMITS.summary && !/\u0007/.test(p.summary));
  assert.equal(p.brand.length, S.PRODUCT_LIMITS.brand);
  assert.equal(p.priceText.length, S.PRODUCT_LIMITS.priceText);
  assert.equal(p.sellerName.length, S.PRODUCT_LIMITS.sellerName);
  assert.equal(p.features.length, 8);
  assert.ok(p.features.every((f) => f.length <= S.PRODUCT_LIMITS.feature));
});

test('OG-STO-7 no fake price: priceText only from the source, never computed; no numeric price field or price sort', () => {
  assert.ok(!('priceText' in S.normalizeProduct(raw(1, { priceText: undefined }))));
  assert.equal(S.normalizeProduct(raw(1, { priceText: '12,000원' })).priceText, '12,000원');
  assert.deepEqual(S.PRODUCT_SORTS.map((s) => s.id), ['name']);
  assert.doesNotMatch(STORE_SRC, /parseInt\(|parseFloat\(|Number\([^)]*price|price(Min|Max|Range|Number)|최저가|가격순/);
  assert.match(S.PRICE_NOTE, /판매처에서 확인하세요/);
});

test('OG-STO-8 no fake rating or review counts', () => {
  const p = S.normalizeProduct(raw());
  assert.ok(!('rating' in p) && !('reviewCount' in p));
  assert.doesNotMatch(STORE_SRC, /rating|reviewCount|평점|별점|★|리뷰 수|후기 \d/);
});

test('OG-STO-9 no fake inventory, sales or delivery dates', () => {
  const p = S.normalizeProduct(raw());
  for (const k of ['stock', 'inventory', 'salesCount']) assert.ok(!(k in p), k);
  assert.doesNotMatch(STORE_SRC, /재고|판매량|품절|배송일|도착 예정|inStock|salesCount/);
  assert.equal(S.STORE_COMMERCE.inventory, false);
});

test('OG-STO-10 no fake discount or list price', () => {
  const p = S.normalizeProduct(raw());
  assert.ok(!('discountRate' in p) && !('originalPrice' in p));
  assert.doesNotMatch(STORE_SRC, /할인|정가|특가|세일|discount|originalPrice|countdown|flash/i);
});

/* ───────── STORE UX ───────── */

test('OG-STO-11 store screen: own view at #store and #store/<slug>; five cards; the shell loop skips it', () => {
  assert.match(APP_CODE, /const storeView = createStoreView\(\{/);
  assert.match(APP_CODE, /area\.id === 'community' \|\| area\.id === 'store'\) continue;/);
  assert.equal(resolveView('#store/gift'), 'store');
  assert.deepEqual([resolveStoreSection('gift'), resolveStoreSection('smart-device'), resolveStoreSection('cart')], ['GIFT', 'SMART_DEVICE', '']);
  for (const t of ['어떤 물건을 찾으세요?', '상품', '비교하기', '가족과 함께 보기', '저장한 상품']) assert.ok(VIEW.includes(`'${t}'`), t);
  assert.match(APP_CODE, /if \(view === 'store' && section && !resolveStoreSection\(section\)\) win\.history\.replaceState\(null, '', '#store'\)/);
  assert.equal((APP_CODE.match(/if \(view === 'store'\) storeView\.show\(section\);/g) || []).length, 2);
  assert.match(INDEX, /<section class="og-band" data-og-modules="store"/);
});

test('OG-STO-12 production source: no product provider is connected; the screen says so honestly', async () => {
  const src = createProductSource();
  assert.equal(src.id, PRODUCT_SOURCE_ID);
  assert.equal(src.connected, false);
  const r = await src.load();
  assert.equal(r.state, 'unavailable');
  assert.equal(r.reason, 'NOT_CONNECTED');
  assert.deepEqual(r.items, []);
  assert.match(VIEW, /NOT_CONNECTED: '아직 연결된 상품이 없어요\.'/);
  assert.match(VIEW, /ONGIL은 상품을 지어내지 않아요/);
  assert.doesNotMatch(SOURCE, /fetch|https?:|items:\s*\[\s*\{/);
});

test('OG-STO-13 loading state: aria-busy region with a loading message while the source answers', () => {
  assert.match(VIEW, /setRegionState\(zone, 'loading', '상품 정보를 불러오고 있어요…'\)/);
  assert.match(VIEW, /zone\.dataset\.ogStoreState = 'loading'/);
  assert.match(VIEW, /if \(mine !== ticket\) return;/, 'a late answer never overwrites a newer one');
});

test('OG-STO-14 unavailable and empty states are distinct; a failed answer can be retried', () => {
  assert.match(VIEW, /zone\.dataset\.ogStoreState = 'unavailable'/);
  assert.match(VIEW, /zone\.dataset\.ogStoreState = 'empty'/);
  assert.match(VIEW, /연결된 자료에 지금 보여 드릴 상품이 없어요/);
  assert.match(VIEW, /state\.reason === 'NO_ANSWER' \? el\('div'/);
  assert.match(VIEW, /result = \{ state: 'unavailable', reason: 'NO_ANSWER', items: \[\] \}/);
});

test('OG-STO-15 results: every item passes the contract before the view sees it', () => {
  assert.match(VIEW, /sanitizeProducts\(result\.items\)/);
  const list = S.sanitizeProducts([raw(1), raw(2), raw(1), { nope: true }]);
  assert.deepEqual(list.map((p) => p.id), ['p-1', 'p-2']);
  assert.equal(S.sanitizeProducts(Array.from({ length: 1200 }, (_, i) => raw(i))).length, S.PRODUCT_LIMITS.products);
});

test('OG-STO-16 category filter', () => {
  const items = S.sanitizeProducts([raw(1), raw(2, { category: 'GIFT' }), raw(3, { category: 'GIFT' })]);
  assert.equal(S.filterProducts(items, { category: 'GIFT' }).length, 2);
  assert.deepEqual(S.availableProductFilters(items).categories, ['SAFETY_LIVING', 'GIFT']);
  assert.match(VIEW, /choiceButton\(\{ label: c\.label, pressed: state\.category === c\.id/, 'state by aria-pressed and ✓, not colour alone');
});

test('OG-STO-17 search over name, summary, brand, category label and features; loaded products only', () => {
  const items = S.sanitizeProducts([raw(1, { name: 'Kiosk 거치대', features: ['각도 조절'] }), raw(2, { brand: '온길상회', category: 'DIGITAL' })]);
  assert.equal(S.filterProducts(items, { query: 'kiosk' }).length, 1);
  assert.equal(S.filterProducts(items, { query: '각도조절' }).length, 1);
  assert.equal(S.filterProducts(items, { query: '온길' }).length, 1);
  assert.equal(S.filterProducts(items, { query: '디지털' }).length, 1);
  assert.equal(S.filterProducts(items, { query: '집 안에서' }).length, 2);
  assert.equal(S.filterProducts(items, { query: '없는 말' }).length, 0);
  assert.equal(S.filterProducts(null, {}).length, 0);
});

test('OG-STO-18 brand and seller filters exist only when the data has more than one of them', () => {
  const one = S.sanitizeProducts([raw(1), raw(2)]);
  assert.deepEqual(S.availableProductFilters(one), { categories: ['SAFETY_LIVING'], brands: [], sellers: [] });
  const many = S.sanitizeProducts([raw(1), raw(2, { brand: '브랜드B', sellerName: '판매처B' }), raw(3, { brand: undefined, sellerName: undefined })]);
  assert.deepEqual(S.availableProductFilters(many).brands, ['브랜드A', '브랜드B']);
  assert.equal(S.filterProducts(many, { brand: '브랜드B' }).length, 1);
  assert.equal(S.filterProducts(many, { seller: '판매처A' }).length, 1);
  assert.match(VIEW, /if \(avail\.brands\.length\)/);
  assert.match(VIEW, /if \(avail\.sellers\.length\)/);
});

test('OG-STO-19 sort: 가나다순 only (no 인기·추천·판매·베스트 order)', () => {
  const items = S.sanitizeProducts([raw(1, { name: '하늘' }), raw(2, { name: '가방' }), raw(3, { name: '나무' })]);
  assert.deepEqual(S.sortProducts(items).map((p) => p.name), ['가방', '나무', '하늘']);
  assert.deepEqual(S.PRODUCT_SORTS.map((s) => s.label), ['가나다순']);
  assert.doesNotMatch(STORE_SRC, /인기순|추천순|판매순|베스트|popular|bestseller|trending/i);
});

test('OG-STO-20 detail: one dialog, labelled source wording, hidden missing fields, price note, real image only', () => {
  const rows = S.productDetailRows(S.normalizeProduct(raw()));
  assert.deepEqual(rows.map((r) => r.label), ['분류', '브랜드', '자료에 적힌 소개', '판매처가 알린 가격', '판매처', '자료 출처', '정보 갱신일']);
  assert.match(VIEW, /id: 'og-store-detail', 'aria-labelledby': 'og-store-detail-title'/);
  assert.match(VIEW, /if \(!p\.imageUrl\) return null;/);
  assert.match(VIEW, /img\.addEventListener\('error'/);
  assert.match(VIEW, /if \(p\.priceText\) put\(body, el\('p'/);
  assert.match(S.CLAIM_NOTE, /ONGIL이 평가하거나 보증하지 않아요/);
});

/* ───────── INTEGRATION ───────── */

test('OG-STO-21 saving a product uses the existing Saved PRODUCT type — no new collection', () => {
  const { saved } = env();
  assert.ok(SAVED_TYPES.includes('PRODUCT'));
  const r = saved.toggle(S.productSavedInput(S.normalizeProduct(raw())));
  assert.equal(r.ok, true);
  assert.equal(saved.isSaved('PRODUCT', 'p-1'), true);
  assert.ok(!COLLECTIONS.some((c) => /product|store|cart|order|wish/i.test(c)));
  assert.match(VIEW, /saved\.toggle\(productSavedInput\(p\)\)/);
});

test('OG-STO-22 unsave', () => {
  const { saved } = env();
  const input = S.productSavedInput(S.normalizeProduct(raw()));
  saved.toggle(input);
  const r = saved.toggle(input);
  assert.equal(r.saved, false);
  assert.equal(saved.count(), 0);
});

test('OG-STO-23 saved snapshot is minimal: type, id, name, category/brand/seller line, url, source — never the raw payload', () => {
  const { saved } = env();
  saved.save(S.productSavedInput(S.normalizeProduct(raw())));
  const item = saved.list()[0];
  assert.deepEqual(Object.keys(item).sort(), ['description', 'href', 'id', 'key', 'savedAt', 'schemaVersion', 'source', 'title', 'type']);
  assert.equal(item.description, '생활·안전 · 브랜드A · 판매처A');
  assert.equal(item.href, 'https://seller.example.test/p/1');
  assert.equal(item.source, '자료A');
  assert.doesNotMatch(JSON.stringify(item), /12,000|가벼움|4\.9|rating|stock|img\.example/);
  /* without a seller or source link the snapshot points back to the category */
  assert.equal(S.productSavedInput(S.normalizeProduct({ id: 'p-9', name: 'n', category: 'GIFT', summary: 's' })).href, '#store/gift');
});

test('OG-STO-24 saved backward compatibility: items written before Phase 7 read unchanged', () => {
  const { storage, saved } = env();
  const old = [{ key: 'PLACE:kakao-1', type: 'PLACE', id: 'kakao-1', title: '옛 장소', description: '', href: '#enjoy', source: '', savedAt: 5, schemaVersion: 1 }, { key: 'POST:cp_abcdef', type: 'POST', id: 'cp_abcdef', title: '옛 글', description: '', href: '#community', source: '', savedAt: 6, schemaVersion: 1 }];
  storage.set('saved', { schemaVersion: 1, items: old });
  assert.deepEqual(saved.list().map((x) => x.key), ['POST:cp_abcdef', 'PLACE:kakao-1']);
  assert.ok(!('syncPolicy' in normalizeSavedItem(old[0])), 'policy is derived from the type, never written into items');
});

test('OG-STO-25 POST saved items are LOCAL_ONLY (machine-readable) and never reach a sync adapter', () => {
  assert.deepEqual([...SAVED_SYNC_POLICIES], ['SYNCABLE', 'LOCAL_ONLY']);
  assert.equal(SAVED_SYNC_POLICY.POST, 'LOCAL_ONLY');
  assert.equal(savedSyncPolicy('POST'), 'LOCAL_ONLY');
  assert.equal(savedSyncPolicy({ type: 'POST' }), 'LOCAL_ONLY');
  assert.equal(savedSyncPolicy('SOMETHING_NEW'), 'LOCAL_ONLY', 'unknown types fail closed');
  const { storage, saved } = env();
  const pushed = [];
  const account = createAccount({ storage });
  assert.equal(account.connectSyncAdapter({ id: 'test', isConfigured: () => true, push: (c) => pushed.push(c) }).connected, true);
  saved.save({ type: 'POST', id: 'cp_abcdef', title: '내 글', href: '#community' });
  saved.save(S.productSavedInput(S.normalizeProduct(raw())));
  account.disconnectSyncAdapter();
  assert.equal(pushed.length, 2);
  for (const c of pushed) assert.ok(c.value.items.every((it) => it.type !== 'POST'), 'no POST in any outgoing change');
  assert.deepEqual(pushed[1].value.items.map((it) => it.key), ['PRODUCT:p-1']);
  /* the local copy still has both */
  assert.equal(saved.count(), 2);
});

test('OG-STO-26 public saved types are SYNCABLE by policy; no sync is connected in Phase 7', () => {
  for (const t of ['SERVICE', 'BENEFIT', 'FACILITY', 'PROGRAM', 'PLACE', 'PRODUCT']) assert.equal(savedSyncPolicy(t), 'SYNCABLE', t);
  assert.deepEqual(Object.keys(SAVED_SYNC_POLICY).sort(), [...SAVED_TYPES].sort(), 'every saved type has a policy');
  assert.deepEqual(syncableSavedItems([{ type: 'POST' }, { type: 'PRODUCT' }, null, { type: 'X' }]), [{ type: 'PRODUCT' }]);
  assert.equal(syncChange({ collection: 'symptoms', op: 'set', value: {} }), null);
  assert.deepEqual([...SYNCABLE_COLLECTIONS], ['profile', 'preferences', 'saved', 'onboarding']);
  assert.doesNotMatch(APP_CODE, /connectSyncAdapter\(/, 'the app connects no adapter');
});

test('OG-STO-27 family preview: what would be shown (name, category, brand, seller, link, source) — nothing personal', () => {
  const f = S.productFamilyPreview(S.normalizeProduct(raw()));
  assert.deepEqual(f.fields.map((x) => x.label), ['상품 이름', '분류', '브랜드', '판매처', '판매처 주소', '자료 출처']);
  assert.equal(f.personalDataIncluded, false);
  assert.equal(f.addressIncluded, false);
  assert.equal(f.billingIncluded, false);
  assert.match(VIEW, /'data-og-store-family': 'not-connected'/);
  assert.match(VIEW, /text: '가족에게 보여주기'/);
});

test('OG-STO-28 no family send: never sendable, no success message, no family store touched', () => {
  assert.equal(S.productFamilyPreview(S.normalizeProduct(raw())).sendable, false);
  assert.doesNotMatch(VIEW, /보냈어요|전송했|공유했어요|보내졌|familySharing|helpRequests|sharedItems/);
  assert.match(VIEW, /아직 연결된 가족이 없어서 보내지 않았어요/);
});

test('OG-STO-29 global search: loaded public products are searchable as 상품', async () => {
  const items = S.sanitizeProducts([raw(1, { name: '미끄럼 방지 매트' }), raw(2, { name: '스마트 조명', features: ['밝기 조절'] })]);
  const s = createSearch();
  s.registerProvider(createStoreProvider(() => items));
  const o = await s.query('밝기');
  assert.equal(o.results.length, 1);
  assert.equal(o.results[0].type, 'PRODUCT');
  assert.equal(o.results[0].description.split(' · ')[0], '상품');
  assert.equal(o.results[0].href, '#store/safety', 'a result opens the Store at the product\'s category');
  assert.equal(resolveStoreSection(sectionOf(o.results[0].href)), 'SAFETY_LIVING');
  assert.equal((await s.query('없는말')).results.length, 0);
  const none = createSearch();
  none.registerProvider(createStoreProvider(() => []));
  assert.equal((await none.query('매트')).results.length, 0, 'no product connected → no result');
  assert.match(APP_CODE, /search\.registerProvider\(createStoreProvider\(\(\) => storeView\.items\(\)\)\);/);
  assert.equal((APP_CODE.match(/search\.registerProvider\(/g) || []).length, 5);
});

test('OG-STO-30 private data stays out of global search: community posts and personal records', async () => {
  const { storage, saved } = env();
  createPostStore(storage, { now: () => 1 }).add({ type: 'TIP', category: 'LIFE', title: '비밀 상품 글', body: '내용' });
  const s = createSearch();
  s.registerProvider(createAreaProvider(AREAS));
  s.registerProvider(createSavedProvider(saved));
  s.registerProvider(createStoreProvider(() => []));
  assert.equal((await s.query('비밀 상품')).results.length, 0);
  assert.doesNotMatch(APP_CODE, /registerProvider\([^)]*(communit|symptom|medication|journal|healthNote|checkIn)/i);
  assert.equal(classOf('communityPosts'), 'PRIVATE');
});

test('OG-STO-31 Care stays services; Store stays physical products (no product in care code, no care data in store)', () => {
  const CARE = strip(read('js', 'care-view.js')) + strip(read('js', 'care-contracts.js'));
  assert.doesNotMatch(CARE, /store-|PRODUCT_CATEGORIES|productSavedInput|#store/);
  assert.doesNotMatch(STORE_SRC, /care-contracts|care-view|CARE_SERVICE|PUBLIC_BENEFIT/);
});

test('OG-STO-32 health boundary: no product recommendation from symptoms, medication, check-ins or health notes', () => {
  /* FUTURE_DEVICE_TYPES names a MEDICATION_DEVICE category for a later IoT phase; it reads nothing */
  assert.doesNotMatch(STORE_SRC.replace(/export const FUTURE_DEVICE_TYPES = [^\n]*/, ''), /symptom|medication|checkIn|healthNote|health-notes|checkin|recommend|추천/i);
  assert.doesNotMatch(APP_CODE.slice(APP_CODE.indexOf('const storeView = createStoreView'), APP_CODE.indexOf('const showCommunity')), /symptoms|medication|checkIn|healthNotes|profile/);
  assert.match(VIEW, /내 건강 기록을 보고 상품을 고르지 않아요/);
});

test('OG-STO-33 community boundary: no product review is created or linked; reviews accept no PRODUCT source', async () => {
  assert.doesNotMatch(STORE_SRC, /community|communityPosts|reviewPrefill|onReview|후기 쓰기/);
  const C = await import('../../ongil-start/js/community-contracts.js');
  assert.ok(!C.SOURCE_TYPES.includes('PRODUCT'));
  assert.equal(S.STORE_COMMERCE.reviews, false);
});

test('OG-STO-34 no notifications: no price, restock, delivery or order alerts are raised', () => {
  assert.doesNotMatch(STORE_SRC, /notifications?\.|notify\(|가격 알림|재입고|배송 알림|주문 알림/);
  assert.equal(S.STORE_COMMERCE.alerts, false);
  assert.ok(NOTIFICATION_TYPES.some((t) => t.id === 'STORE'), 'the STORE notification type exists for later, unused');
});

test('OG-STO-35 external seller link: https only, new window, noopener, labelled as leaving ONGIL; hidden without a URL', () => {
  assert.match(VIEW, /if \(p\.sellerUrl\) links\.push\(el\('a', \{ class: 'og-btn og-btn--ghost', href: p\.sellerUrl, target: '_blank', rel: 'noopener noreferrer'/);
  assert.match(VIEW, /판매처에서 보기 \(새 창\)/);
  assert.match(VIEW, /ONGIL에서 사거나 결제하는 것이 아니에요/);
  assert.match(VIEW, /if \(p\.sourceUrl && p\.sourceUrl !== p\.sellerUrl\)/, 'seller and source links are separate');
  assert.doesNotMatch(STORE_SRC, /구매하기|결제하기|주문하기|바로 구매|장바구니/);
  assert.deepEqual({ ...S.STORE_COMMERCE }, { mode: 'EXTERNAL_LINK', cart: false, checkout: false, payment: false, order: false, shipping: false, inventory: false, reviews: false, alerts: false });
});

/* ───────── COMPARISON / SAFETY ───────── */

test('OG-STO-36 compare select / unselect', () => {
  let r = S.toggleCompare([], 'p-1');
  assert.deepEqual(r, { ok: true, selected: ['p-1'], added: true });
  r = S.toggleCompare(r.selected, 'p-1');
  assert.deepEqual(r.selected, []);
  assert.equal(r.added, false);
});

test('OG-STO-37 compare max is three', () => {
  assert.equal(S.COMPARE_MAX, 3);
  const r = S.toggleCompare(['a', 'b', 'c'], 'd');
  assert.deepEqual(r, { ok: false, selected: ['a', 'b', 'c'], reason: 'MAX' });
  assert.match(VIEW, /비교는 \$\{COMPARE_MAX\}개까지 할 수 있어요/);
});

test('OG-STO-38 compare fields: name, brand, category, price text, features, seller', () => {
  const rows = S.compareRows(S.sanitizeProducts([raw(1), raw(2, { brand: '브랜드B' })]));
  assert.deepEqual(rows.map((r) => r.key), ['name', 'brand', 'category', 'priceText', 'features', 'sellerName']);
  assert.deepEqual(rows[1].values.map((v) => v.value), ['브랜드A', '브랜드B']);
  assert.equal(rows[4].values[0].value, '가벼움, 접이식');
});

test('OG-STO-39 compare missing data says 정보 없음 (never a fake "-" or invented value)', () => {
  const rows = S.compareRows(S.sanitizeProducts([raw(1), { id: 'p-2', name: '최소', category: 'GIFT', summary: 's' }]));
  const brand = rows.find((r) => r.key === 'brand').values[1];
  assert.deepEqual([brand.value, brand.missing], ['정보 없음', true]);
  assert.equal(rows.find((r) => r.key === 'features').values[1].value, '정보 없음');
  assert.ok(!rows.flatMap((r) => r.values).some((v) => v.value === '-'));
});

test('OG-STO-40 comparison is screen state only — not persisted', () => {
  assert.match(VIEW, /compare: \[\]/);
  assert.doesNotMatch(VIEW, /storage\.|localStorage|sessionStorage|saved\.save\([^)]*compare/);
  assert.ok(!COLLECTIONS.some((c) => /compare/i.test(c)));
});

test('OG-STO-41 text rendering: DOM built with el() and textContent only', () => {
  assert.doesNotMatch(VIEW, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/);
  const p = S.normalizeProduct(raw(1, { name: '<img src=x onerror=alert(1)>' }));
  assert.equal(p.name, '<img src=x onerror=alert(1)>', 'kept as plain text, rendered by textContent');
});

test('OG-STO-42 URL validation is shared with the app (safeHref) and https-only for external links', () => {
  assert.match(CONTRACTS, /import \{ isPlainObject, safeText, safeHref, ContractError \} from '\.\/contracts\.js';/);
  assert.equal(S.safeExternalUrl('JAVASCRIPT:alert(1)'), '');
  assert.equal(S.safeExternalUrl(' https://seller.test/x '), 'https://seller.test/x');
  assert.equal(S.safeExternalUrl(42), '');
});

test('OG-STO-43 corrupted source answers never crash: invalid, wrong type, missing, unsafe and oversized entries', () => {
  const list = S.sanitizeProducts([null, 42, 'x', [], { id: 'bad id!' }, { id: 'ok-1', name: '', category: 'GIFT', summary: 's' }, { id: 'ok-2', name: 'n', category: 'WEAPON', summary: 's' }, { id: 'ok-3', name: '정상', category: 'GIFT', summary: '정상', sellerUrl: 'http://x.test', imageUrl: 'javascript:1', features: 'notarray', updatedAt: '2026-02-31' }, { id: 'ok-3', name: '중복', category: 'GIFT', summary: 's' }, { id: 'ok-4', name: 'n'.repeat(9000), category: 'GIFT', summary: 's'.repeat(9000) }]);
  assert.deepEqual(list.map((p) => p.id), ['ok-3', 'ok-4']);
  assert.deepEqual(list[0], { id: 'ok-3', name: '정상', category: 'GIFT', summary: '정상', features: [] });
  assert.equal(list[1].name.length, 120);
  assert.deepEqual(S.sanitizeProducts('garbage'), []);
  assert.deepEqual(S.sanitizeProducts(undefined), []);
});

test('OG-STO-44 account delete: Store adds no collection; saved products go with the existing erase', () => {
  const { storage, saved } = env();
  saved.save(S.productSavedInput(S.normalizeProduct(raw())));
  storage.clear();
  assert.equal(saved.count(), 0);
  // Phase 9: one collection was added — "analytics" (daily usage counters, numbers only; class OPERATIONAL). BEFORE: 23. AFTER: 24.
  assert.equal(COLLECTIONS.length, 24, 'no new collection in Phase 7; Phase 9 added analytics');
  assert.match(APP_CODE, /storeView\.render\(\);/);
});

test('OG-STO-45 erase keeps non-ONGIL data', () => {
  const { backend, storage, saved } = env();
  backend.setItem('livon.keep', '1');
  backend.setItem('other-app', 'x');
  saved.save(S.productSavedInput(S.normalizeProduct(raw())));
  storage.clear();
  assert.equal(backend.getItem('livon.keep'), '1');
  assert.equal(backend.getItem('other-app'), 'x');
  assert.equal(backend.getItem(`${KEY_PREFIX}saved`), null);
});

/* ───────── QUALITY ───────── */

test('OG-STO-46 500-item fixture: normalise, search, filter and sort stay correct and fast (data level)', () => {
  const t0 = Date.now();
  const items = S.sanitizeProducts(Array.from({ length: 500 }, (_, i) => raw(i, { name: `상품 ${String(i).padStart(3, '0')}`, category: S.PRODUCT_CATEGORY_IDS[i % 10] })));
  assert.equal(items.length, 500);
  assert.equal(S.filterProducts(items, { category: 'GIFT' }).length, 50);
  assert.equal(S.filterProducts(items, { query: '상품 49' }).length, 10, '상품 490 … 상품 499');
  const sorted = S.sortProducts(items);
  assert.equal(sorted[0].name, '상품 000');
  assert.equal(S.compareRows(sorted.slice(0, 3)).length, 6);
  assert.ok(Date.now() - t0 < 1000);
});

test('OG-STO-47 DOM bound: 24 rows at a time + 더 보기; only the chosen product has a detail', () => {
  assert.equal(STORE_PAGE, 24);
  assert.match(VIEW, /const page = items\.slice\(0, state\.shown\);/);
  assert.match(VIEW, /state\.shown \+= STORE_PAGE;/);
  assert.match(VIEW, /if \(dialog\) return dialog;/, 'one dialog, rebuilt per product');
  assert.doesNotMatch(VIEW, /IntersectionObserver|addEventListener\('scroll'/);
});

test('OG-STO-48 accessibility: labelled controls, live counts, image alt, notes as role=note', () => {
  assert.match(VIEW, /alt: `\$\{p\.name\} 상품 사진`/);
  assert.match(VIEW, /'aria-live': 'polite'/);
  assert.match(VIEW, /role: 'group', 'aria-label': '상품 분류'/);
  assert.match(VIEW, /'aria-label': `‘\$\{p\.name\}’ 자세히 보기`/);
  assert.match(VIEW, /'aria-pressed': on \? 'true' : 'false'/);
  assert.match(VIEW, /role: 'note'/);
});

test('OG-STO-49 keyboard: dialog traps Tab, Escape closes natively, focus returns to the opener', () => {
  assert.match(VIEW, /event\.key !== 'Tab'/);
  assert.match(VIEW, /dialog\.addEventListener\('close'/);
  assert.match(VIEW, /if \(back\) back\.focus\(\);/);
  assert.match(VIEW, /showModal/);
  assert.match(VIEW, /const focusRow = next\.querySelectorAll\('\[data-og-store-open\]'\)\[first\];/, '더 보기 moves focus to the first new row');
});

test('OG-STO-50 responsive 390: phone layout rules (stacked comparison, wrapping rows)', () => {
  assert.match(CSS, /@media \(max-width: 640px\) \{\s*\.og-store-compare__values \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(CSS, /\.og-store-actions \{ flex-wrap: wrap; \}/);
});

test('OG-STO-51 responsive 820: comparison columns fit by content width', () => {
  assert.match(CSS, /\.og-store-compare__values \{[^}]*grid-template-columns: repeat\(auto-fit, minmax\(11rem, 1fr\)\)/);
});

test('OG-STO-52 responsive 1440: the image never exceeds its frame', () => {
  assert.match(CSS, /\.og-store-image \{[^}]*width: 100%;[^}]*max-height: 16rem;[^}]*object-fit: contain/);
});

test('OG-STO-53 no overflow from long names, brands, sellers, features or URL labels', () => {
  assert.match(CSS, /\.og-store-name, \.og-store-text \{ overflow-wrap: anywhere; min-width: 0; \}/);
  for (const cls of ['og-store-name', 'og-store-text']) assert.ok(VIEW.includes(cls), cls);
  assert.match(CSS, /\.og-care-rows dd \{[^}]*overflow-wrap: anywhere/);
});

test('OG-STO-54 no console error sources: the view guards every async answer', () => {
  assert.match(VIEW, /try \{\s*result = await source\.load\(\);\s*\} catch \{/);
  assert.doesNotMatch(STORE_SRC, /console\.(error|warn|log)/);
});

test('OG-STO-55 no page error sources: missing source, empty arrays and nulls are tolerated', async () => {
  const src = createProductSource();
  await assert.doesNotReject(() => src.load());
  assert.deepEqual(S.availableProductFilters(undefined), { categories: [], brands: [], sellers: [] });
  assert.deepEqual(S.sortProducts(null), []);
  assert.deepEqual(S.compareRows(null).map((r) => r.values.length), [0, 0, 0, 0, 0, 0]);
});

test('OG-STO-56 regression: no new network, backend, key, commerce API or fixture in production; version moved on', () => {
  for (const f of fs.readdirSync(JS_DIR).filter((x) => x.startsWith('store-'))) {
    const code = strip(fs.readFileSync(path.join(JS_DIR, f), 'utf8'));
    assert.doesNotMatch(code, /fetch\(|XMLHttpRequest|WebSocket|sendBeacon|firebase|openai|affiliate|\/api\/|API_KEY|apiKey/i, f);
    assert.doesNotMatch(code, /QA 상품|qa-\d|fixture|example\.test|lorem/i, f);
  }
  assert.equal((APP.match(/\bfetch\(/g) || []).length, 1, 'fetch is still injected once');
  /* Phase 8 moved the version on again: integration-v2 / ?v=20261003i8 (BEFORE: store-v1 / 20261003s7) */
  /* Phase 9 moved the version on: admin-v1 / ?v=20261003a9 (BEFORE: integration-v2 / 20261003i8). The version now lives in APP_VERSION. */
  /* Phase 10 moved the version on: assistant-v1 / ?v=20261003b10 (BEFORE: admin-v1 / 20261003a9) — ONGIL 도우미 was added. */
  /* Phase 11 moved the version on: hardening-v1 / ?v=20261003r11 (BEFORE: assistant-v1 / 20261003b10) — release hardening changed app.js and two stylesheets. */
  assert.match(APP, /const APP_VERSION = 'hardening-v1';/);
  assert.match(INDEX, /app\.js\?v=20261003r11/);
  assert.match(INDEX, /ongil-care\.css\?v=20261003s7/);
  assert.match(SEARCH, /export function createStoreProvider\(getItems\)/);
  assert.match(AREAS.find((a) => a.id === 'store').notice, /결제, 주문, 배송 기능은 없습니다/);
});

test('OG-STO-57 the menu, the hero and the screen describe the same Store: ten categories, honest about what is not there', () => {
  const area = AREAS.find((a) => a.id === 'store');
  assert.deepEqual(area.modules.map((m) => [m.id, m.title]), S.PRODUCT_CATEGORIES.map((c) => [c.slug, c.label]), 'menu entries are the category slugs and labels');
  assert.ok(area.modules.every((m) => m.available === false), 'no product source is connected, so no category claims to have products');
  assert.match(area.notice, /결제, 주문, 배송 기능은 없습니다\. 아직 연결된 상품 정보가 없어/);
  assert.match(INDEX, /id="og-store-title" tabindex="-1">일상에 필요한 물건을<br>한곳에서 만나보세요\.<\/h1>/);
  assert.match(INDEX, /ONGIL은 직접 팔지 않고, 결제와 주문 기능은 없습니다\./);
  assert.equal(/장바구니|구매하기|결제하기|주문하기|바로 구매|최저가|할인|베스트|인기 상품|추천 상품/.test(INDEX + VIEW + JSON.stringify(area)), false, 'no shop wording anywhere');
});

test('OG-STO-58 a saved product opens its seller page safely from the Saved screen: 44px link, new window, noopener', () => {
  const view = read('js', 'saved-view.js');
  // Phase 8: the Saved row no longer makes its title a link. It has two named actions instead — the owner screen and,
  // for a safe https address, "출처 보기 (새 창)". BEFORE: title link with target/rel when external. AFTER: a separate
  // external button, still https-only, new window, noopener — and never for a LOCAL_ONLY type.
  assert.match(view, /const external = def && def\.external && \/\^https:\\\/\\\/\/\.test\(item\.href \|\| ''\) \? item\.href : '';/);
  assert.match(view, /href: a\.externalUrl, target: '_blank', rel: 'noopener noreferrer', 'data-og-saved-open': 'external'/);
  assert.match(read('styles', 'ongil-app.css'), /a\.og-item__title \{ display: inline-flex; align-items: center; min-height: var\(--og-control\);/);
  const { saved } = env();
  saved.save(S.productSavedInput(S.normalizeProduct(raw(1))));
  saved.save(S.productSavedInput(S.normalizeProduct(raw(2, { sellerUrl: 'javascript:alert(1)', sourceUrl: '' }))));
  assert.deepEqual(saved.list({ type: 'PRODUCT' }).map((i) => i.href).sort(), ['#store/safety', 'https://seller.example.test/p/1'], 'an unsafe seller URL never becomes a saved link');
});
