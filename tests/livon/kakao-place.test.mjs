// Kakao Local place provider (kr-kakao-place): adapter, server route, privacy, normalization and LIVON integration.
// No real key is used; upstream responses are fixtures built from the documented response fields ([QA 픽스처]).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as kakao from '../../server/livon/data/providers/kakao-local.mjs';
import * as ev from '../../server/livon/data/providers/bizinfo-event.mjs';
import { createDataHandler, PROVIDERS } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const root = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const KEY = 'kakao-test-key-DO-NOT-LEAK-7777';
const Q = s => '/api/livon/data?provider=kr-kakao-place&' + s;
const enc = encodeURIComponent;

/* documented Document fields only (keyword/category search › 응답 › Document) */
const doc = (o = {}) => Object.assign({
  id: '26338954', place_name: '[QA 픽스처] 마포 중앙도서관', category_name: '문화,예술 > 문화시설 > 도서관',
  category_group_code: 'CT1', category_group_name: '문화시설', phone: '02-3153-5800',
  address_name: '서울 마포구 성산동 370-1', road_address_name: '서울 마포구 성산로 128',
  x: '126.9084', y: '37.5636', place_url: 'http://place.map.kakao.com/26338954', distance: ''
}, o);
const body = (docs, meta = {}) => JSON.stringify({ meta: Object.assign({ same_name: null, total_count: docs.length, pageable_count: docs.length, is_end: true }, meta), documents: docs });

function upstream(handler) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    const u = new URL(url);
    calls.push({ url: u, init });
    if (u.origin !== 'https://dapi.kakao.com' && !String(url).startsWith(ev.UPSTREAM)) throw new Error('unexpected host');
    return handler(u, init);
  };
  return { fetcher, calls };
}
const reply = (text, { status = 200 } = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => 'application/json' }, text: async () => text });
function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } }; r.json = () => JSON.parse(r.body); return r; }
async function call(h, url, method = 'GET', init = {}) { const r = res(); await h({ method, url, headers: init.headers || {}, body: init.body }, r); return r; }
const handler = (env, up, extra = {}) => createDataHandler({ env, fetcher: up.fetcher, cache: extra.cache || memoryCache(), log: extra.log || (() => {}) });
const ENV = { KAKAO_REST_API_KEY: KEY };

/* ───────── server ───────── */
test('official contract: fixed endpoints, KakaoAK header, documented params, key server-only, .env.example empty', async () => {
  assert.equal(kakao.ENDPOINTS.keyword, 'https://dapi.kakao.com/v2/local/search/keyword.json');
  assert.equal(kakao.ENDPOINTS.category, 'https://dapi.kakao.com/v2/local/search/category.json');
  assert.equal(kakao.PROVIDER_ID, 'kr-kakao-place'); assert.equal(kakao.ENV_KEY, 'KAKAO_REST_API_KEY');
  assert.deepEqual(Object.keys(kakao.CATEGORY_CODES), ['MT1', 'CS2', 'PS3', 'SC4', 'AC5', 'PK6', 'OL7', 'SW8', 'BK9', 'CT1', 'AG2', 'PO3', 'AT4', 'AD5', 'FD6', 'CE7', 'HP8', 'PM9']);
  const up = upstream(() => reply(body([doc()])));
  await call(handler(ENV, up), Q('query=' + enc('도서관')));
  const c = up.calls[0];
  assert.equal(c.url.origin + c.url.pathname, kakao.ENDPOINTS.keyword);
  assert.equal(c.init.headers.Authorization, 'KakaoAK ' + KEY);
  assert.equal(c.url.search.includes(KEY), false, 'key only in the header, never in the URL');
  assert.deepEqual([...c.url.searchParams.keys()], ['query', 'page', 'size', 'sort']);
  assert.match(root('.env.example'), /\nKAKAO_REST_API_KEY=\n/);
  for (const f of ['data/livon-data-config.js', 'data/livon-data-core.js', 'data/livon-data-providers.js', 'data/livon-data-schema.js', 'explore-page.js', 'index.html']) {
    assert.doesNotMatch(read(f), /KAKAO_REST_API_KEY|KakaoAK|dapi\.kakao\.com/, f + ' never touches the key or the endpoint');
  }
});

test('no key: status configured=false, NOT_CONFIGURED, no upstream call; bad params still 400 first', async () => {
  const up = upstream(() => reply(body([doc()])));
  const h = handler({}, up);
  const st = (await call(h, '/api/livon/data?action=status')).json().providers['kr-kakao-place'];
  assert.deepEqual(st, { configured: false, entityTypes: ['place'], mode: 'search' });
  const r = await call(h, Q('query=' + enc('도서관')));
  assert.equal(r.statusCode, 503); assert.equal(r.json().code, 'NOT_CONFIGURED');
  assert.equal((await call(h, Q('lat=37.5&lng=127'))).statusCode, 400, 'no query/category → 400 even without key');
  assert.equal(up.calls.length, 0);
  assert.equal((await call(handler({ KAKAO_REST_API_KEY: ' short ' }, up), Q('query=a'))).statusCode, 503);
});

test('secret + location non-exposure: key and coordinates never in responses or logs', async () => {
  const logs = [];
  const paths = [() => { throw new Error('net ' + KEY); }, () => reply('{"errorType":"AccessDeniedError","message":"' + KEY + '"}', { status: 401 }), () => reply('<html>' + KEY), () => reply(body([doc()]))];
  for (const p of paths) {
    const h = handler(ENV, upstream(p), { log: (...a) => logs.push(a.join(' ')) });
    const r = await call(h, Q('query=' + enc('카페') + '&lat=37.566535&lng=126.977969&radius=1000&sort=distance'));
    assert.doesNotMatch(r.body, new RegExp(KEY)); assert.doesNotMatch(r.body, /KakaoAK|AccessDenied|37\.566535|126\.977969/);
  }
  assert.ok(logs.length >= 3 && logs.every(l => !l.includes(KEY) && !/37\.56|126\.97/.test(l)));
});

test('keyword query: trimmed, ≤50 chars, no control/markup chars; unknown keys and other providers’ params rejected', async () => {
  const up = upstream(() => reply(body([doc()])));
  const h = handler(ENV, up);
  assert.equal((await call(h, Q('query=' + enc('  마포   도서관 ')))).statusCode, 200);
  assert.equal(up.calls[0].url.searchParams.get('query'), '마포 도서관');
  for (const q of ['query=' + 'a'.repeat(51), 'query=' + enc('<script>'), 'query=' + enc('a\u0001b'), 'query=a&url=https://evil.example', 'query=a&region=' + enc('서울'), 'query=a&query=b', 'query=a&x=127', '']) {
    assert.equal((await call(h, Q(q))).statusCode, 400, q);
  }
  assert.equal((await call(h, '/api/livon/data?provider=kr-business-event&query=a')).statusCode, 400, 'query param is Kakao-only');
});

test('coordinate search: x = longitude, y = latitude; rounded to ≈100 m; radius/sort sent; distance kept', async () => {
  const up = upstream(() => reply(body([doc({ distance: '418' })])));
  const h = handler(ENV, up);
  const r = await call(h, Q('query=' + enc('도서관') + '&lat=37.566535&lng=126.977969&radius=3000&sort=distance'));
  assert.equal(r.statusCode, 200);
  const u = up.calls[0].url;
  assert.equal(u.searchParams.get('x'), '126.978'); assert.equal(u.searchParams.get('y'), '37.567');
  assert.equal(u.searchParams.get('radius'), '3000'); assert.equal(u.searchParams.get('sort'), 'distance');
  assert.equal(r.json().items[0].distanceMeters, 418);
  const cat = upstream(() => reply(body([doc({ distance: '90' })])));
  await call(handler(ENV, cat), Q('category=HP8&lat=37.5&lng=127.0'));
  assert.equal(cat.calls[0].url.pathname, '/v2/local/search/category.json');
  assert.equal(cat.calls[0].url.searchParams.get('category_group_code'), 'HP8');
  assert.equal(cat.calls[0].url.searchParams.get('radius'), String(kakao.DEFAULT_RADIUS), 'default radius within the official limit');
});

test('radius, lat, lng, sort and category validation (official limits; no invented centre)', async () => {
  const h = handler(ENV, upstream(() => reply(body([]))));
  const bad = ['query=a&lat=37.5&lng=127&radius=20001', 'query=a&lat=37.5&lng=127&radius=250', 'query=a&radius=1000', 'query=a&lat=91&lng=127', 'query=a&lat=-90.5&lng=127',
    'query=a&lat=37&lng=181', 'query=a&lat=37&lng=-180.1', 'query=a&lat=37.5', 'query=a&lng=127', 'query=a&lat=abc&lng=127', 'query=a&lat=1e2&lng=127',
    'query=a&sort=distance', 'query=a&sort=popular', 'category=HP8', 'category=ZZ9&lat=37&lng=127', 'query=a&page=46', 'query=a&page=0', 'query=a&limit=-1'];
  for (const q of bad) assert.equal((await call(h, Q(q))).statusCode, 400, q);
  for (const q of ['query=a&lat=-90&lng=-180&radius=500', 'query=a&lat=90&lng=180&radius=20000', 'query=a&lat=-33.86&lng=151.2']) assert.equal((await call(h, Q(q))).statusCode, 200, q + ' (valid world coordinates are not discarded)');
  assert.deepEqual(kakao.RADII.filter(r => r > kakao.LIMITS.maxRadius), []);
});

test('pagination: LIVON page/limit → official page/size (≤15); is_end and the 45-result window stop paging; no crawling', async () => {
  const up = upstream(u => reply(body([doc({ id: '1' + u.searchParams.get('page') })], { is_end: u.searchParams.get('page') === '2', pageable_count: 30, total_count: 1234 })));
  const h = handler(ENV, up);
  const p1 = (await call(h, Q('query=a&page=1&limit=99'))).json();
  assert.equal(p1.limit, 15); assert.equal(p1.hasMore, true); assert.equal(p1.total, 30);
  assert.equal(up.calls[0].url.searchParams.get('size'), '15');
  const p2 = (await call(h, Q('query=a&page=2'))).json();
  assert.equal(p2.hasMore, false, 'is_end=true');
  assert.equal(up.calls.length, 2, 'exactly one upstream call per request');
  const far = (await call(h, Q('query=a&page=4&limit=15'))).json();
  assert.deepEqual(far.items, []); assert.equal(far.hasMore, false); assert.equal(up.calls.length, 2, 'beyond the 45 pageable documents → no call');
  const win = upstream(() => reply(body([doc()], { is_end: false, pageable_count: 45 })));
  assert.equal((await call(handler(ENV, win), Q('query=a&page=3'))).json().hasMore, false, 'page 3 × 15 = 45 → end of window');
});

test('normalization: documented fields only; road address first; region only 시/도; nothing invented', () => {
  const S = globalThis.LivonDataSchema;
  const e = S.validateEntity(kakao.toEntity(doc(), '2026-09-29T00:00:00.000Z')).entity;
  assert.equal(e.id, 'kr-kakao-place:place:26338954'); assert.equal(e.type, 'place'); assert.equal(e.provider, 'kr-kakao-place');
  assert.equal(e.title, '[QA 픽스처] 마포 중앙도서관'); assert.equal(e.placeType, '문화,예술 › 문화시설 › 도서관');
  assert.equal(e.metadata.categoryGroupCode, 'CT1'); assert.equal(e.metadata.categoryName, '문화,예술 › 문화시설 › 도서관');
  assert.equal(e.contact.phone, '02-3153-5800');
  assert.equal(e.location.roadAddress, '서울 마포구 성산로 128'); assert.equal(e.location.address, '서울 마포구 성산동 370-1');
  assert.equal(e.location.region, '서울'); assert.equal(e.location.latitude, 37.5636); assert.equal(e.location.longitude, 126.9084);
  assert.equal(e.mapUrl, 'http://place.map.kakao.com/26338954'); assert.equal(e.officialUrl, null, 'Kakao Map is not an official homepage');
  assert.equal(e.distanceMeters, null, 'no centre point → no distance');
  assert.equal(e.source.updatedAt, null); assert.equal(e.source.sourceUrl, null);
  assert.equal(e.pricing, null); assert.equal(e.media, null); assert.equal(e.openingHours, null); assert.equal(e.summary, null);
  assert.doesNotMatch(JSON.stringify(e, (k, v) => (v === null ? undefined : v)), /rating|review|popular|price|hours/i);
  assert.deepEqual([...e.tags], ['문화시설', '문화,예술', '도서관']);
  const noRoad = kakao.toEntity(doc({ road_address_name: '' }), 'x');
  assert.equal(noRoad.location.roadAddress, null); assert.equal(noRoad.location.address, '서울 마포구 성산동 370-1');
  assert.equal(kakao.regionOf('세종특별자치시 한누리대로 2130'), '세종특별자치시');
  assert.equal(kakao.regionOf('어딘가 이상한 주소'), null);
  assert.equal(kakao.toEntity(doc({ id: 'abc' }), 'x'), null); assert.equal(kakao.toEntity(doc({ place_name: '' }), 'x'), null);
});

test('coordinates: x/y orientation, numeric range checks; invalid pairs dropped, not guessed', () => {
  const e = kakao.toEntity(doc({ x: '127.05902969025047', y: '37.51207412593136' }), 'x');
  assert.equal(e.location.longitude, 127.05902969025047); assert.equal(e.location.latitude, 37.51207412593136);
  for (const [x, y] of [['200', '37'], ['127', '95'], ['abc', '37'], ['', '']]) {
    const b = kakao.toEntity(doc({ x, y }), 'x');
    assert.equal(b.location.latitude, null); assert.equal(b.location.longitude, null);
  }
});

test('category mapping: only unambiguous groups map to existing LIVON categories; phone missing is null', () => {
  const cat = code => kakao.toEntity(doc({ category_group_code: code }), 'x').category;
  assert.equal(cat('CT1'), '취미'); assert.equal(cat('AT4'), '여행'); assert.equal(cat('HP8'), '건강'); assert.equal(cat('PM9'), '건강'); assert.equal(cat('AC5'), '배움');
  for (const c of ['FD6', 'CE7', 'MT1', 'PK6', 'BK9', 'PO3', 'AD5', '']) assert.equal(cat(c), null, c + ' keeps only the Kakao category');
  const explore = read('explore-search.js');
  for (const label of new Set(Object.values(kakao.LIVON_CATEGORY))) assert.match(explore, new RegExp('label: "' + label + '"'), label + ' exists in the LIVON taxonomy');
  assert.equal(kakao.toEntity(doc({ phone: '' }), 'x').contact, null);
});

test('distance and Kakao Map URL: distance only when a centre was sent; place_url only on kakao.com', () => {
  assert.equal(kakao.toEntity(doc({ distance: '418' }), 'x', { nearby: true }).distanceMeters, 418);
  assert.equal(kakao.toEntity(doc({ distance: '418' }), 'x', { nearby: false }).distanceMeters, null);
  assert.equal(kakao.toEntity(doc({ distance: '' }), 'x', { nearby: true }).distanceMeters, null);
  assert.equal(kakao.toEntity(doc({ place_url: 'https://evil.example/26338954' }), 'x').mapUrl, null);
  assert.equal(kakao.toEntity(doc({ place_url: 'javascript:alert(1)' }), 'x').mapUrl, null);
});

test('zero results, timeout and upstream errors map to fixed codes; failures not cached', async () => {
  const zero = await call(handler(ENV, upstream(() => reply(body([])))), Q('query=zzz'));
  assert.equal(zero.statusCode, 200); assert.deepEqual(zero.json().items, []); assert.equal(zero.json().hasMore, false);
  const keep = setTimeout(() => {}, 2000);
  await assert.rejects(kakao.search({ key: KEY, params: kakao.parseParams({ query: 'a' }), timeoutMs: 30, fetcher: (u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(Object.assign(new Error('t'), { name: 'TimeoutError' })))) }), e => e.code === 'TIMEOUT');
  clearTimeout(keep);
  const t = await call(handler(ENV, upstream(() => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }); })), Q('query=a'));
  assert.equal(t.statusCode, 504); assert.equal(t.json().code, 'TIMEOUT');
  for (const [status, text] of [[401, '{"errorType":"x"}'], [429, '{}'], [500, 'oops'], [200, '<html>'], [200, '{"documents":"x"}']]) {
    const r = await call(handler(ENV, upstream(() => reply(text, { status }))), Q('query=a'));
    assert.equal(r.statusCode, 502, status + ' ' + text); assert.equal(r.json().code, 'UPSTREAM_ERROR');
  }
  let n = 0;
  const h = handler(ENV, upstream(() => (++n === 1 ? reply('', { status: 500 }) : reply(body([doc()])))));
  assert.equal((await call(h, Q('query=a'))).statusCode, 502);
  assert.equal((await call(h, Q('query=a'))).json().cached, false);
  assert.equal((await call(h, Q('query=a'))).json().cached, true);
});

test('cache privacy: nearby results never reach the shared cache; keys hold no plaintext query or coordinates', async () => {
  const shared = memoryCache(); const keys = [];
  const set = shared.set.bind(shared); shared.set = (k, v, t) => { keys.push([k, t]); return set(k, v, t); };
  const up = upstream(() => reply(body([doc({ distance: '10' })])));
  const h = handler(ENV, up, { cache: shared });
  await call(h, Q('query=' + enc('코워킹스페이스')));
  await call(h, Q('query=' + enc('코워킹스페이스') + '&lat=37.566535&lng=126.977969'));
  await call(h, Q('query=' + enc('코워킹스페이스') + '&lat=37.566535&lng=126.977969'));
  assert.equal(keys.length, 1, 'only the keyword search went to the shared cache');
  assert.match(keys[0][0], /^livon:data:v1:kr-kakao-place:kw:[0-9a-f]{40}$/); assert.doesNotMatch(keys[0][0], /코워킹|37\.|126\./);
  assert.ok(keys[0][1] <= 3600e3, 'short keyword TTL');
  assert.equal(up.calls.length, 2, 'nearby repeat served from the private in-instance cache');
  const p = kakao.parseParams({ query: 'x', lat: '37.566535', lng: '126.977969' });
  assert.doesNotMatch(kakao.cacheKey(p), /37\.|126\.|x\|/);
  assert.equal(p.lat, 37.567); assert.equal(p.lng, 126.978);
});

test('concurrent identical searches share one upstream call (abuse protection)', async () => {
  let n = 0;
  const up = upstream(async () => { n++; await new Promise(r => setTimeout(r, 20)); return reply(body([doc()])); });
  const h = handler(ENV, up);
  await Promise.all([1, 2, 3].map(() => call(h, Q('query=' + enc('헬스장')))));
  assert.equal(n, 1);
});

/* ───────── browser ───────── */
function browser(server) {
  const mem = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m }; };
  const requested = [];
  const ctx = { console, URL, setTimeout, clearTimeout, Promise, AbortController, localStorage: mem(), sessionStorage: mem(), location: { protocol: 'https:', hash: '' } };
  ctx.window = ctx;
  ctx.fetch = async (url, init = {}) => { requested.push(String(url) + (init.body ? ' BODY ' + init.body : '')); const r = await server(String(url), init); return { ok: r.statusCode === 200, status: r.statusCode, json: async () => JSON.parse(r.body) }; };
  vm.createContext(ctx);
  for (const f of ['explore-data.js', 'today-data.js']) vm.runInContext(read(f), ctx);
  ctx.document = { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
  vm.runInContext(read('life-hub.js'), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  const saves = new Map();
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, x), removeSave: id => saves.delete(id), _saves: saves };
  for (const f of ['data/livon-data-config.js', 'data/livon-data-schema.js', 'data/livon-data-core.js', 'data/livon-data-providers.js', 'explore-search.js']) vm.runInContext(read(f), ctx);
  ctx._requested = requested;
  return ctx;
}
async function loaded({ env = ENV, docs = [doc(), doc({ id: '777', place_name: '[QA 픽스처] 성산 약국', category_group_code: 'PM9', category_group_name: '약국', category_name: '의료,건강 > 약국', phone: '', distance: '350' })] } = {}) {
  const up = upstream(u => reply(u.origin === 'https://dapi.kakao.com' ? body(docs) : JSON.stringify({ jsonArray: { item: [] } })));
  const h = handler(env, up);
  const ctx = browser((url, init = {}) => call(h, url, init.method || 'GET', init));
  await new Promise(r => setTimeout(r, 30));
  await ctx.LivonData.repository.refresh({ force: true });
  return { ctx, D: ctx.LivonData, up };
}

test('browser no-key: provider stays planned, no search, no calls, curated data unaffected', async () => {
  const { D, up, ctx } = await loaded({ env: {} });
  const p = D.registry.get('kr-kakao-place');
  assert.equal(p.enabled, false); assert.equal(D.places.configured(), false);
  await assert.rejects(D.places.search({ query: '도서관' }), e => e.code === 'NOT_CONFIGURED');
  assert.equal(up.calls.length, 0); assert.ok(!ctx._requested.some(u => u.includes('kr-kakao-place')));
  assert.match(read('life-hub.js'), /P\.configured\(\) && P\.planForTopic/, 'Life link only when connected');
  assert.match(read('today-feed.js'), /P\.configured\(\) && P\.planForContent/, 'Today link only when connected');
  assert.ok(D.repository.size() > 30);
});

test('configured: never bulk-loaded; Explore index unchanged; keyword search returns validated place entities', async () => {
  const { D, up, ctx } = await loaded();
  assert.equal(D.places.configured(), true);
  assert.equal(up.calls.length, 0, 'status check + refresh make no Kakao call');
  assert.equal(D.repository.list({ includeExpired: true }).filter(e => e.provider === 'kr-kakao-place').length, 0);
  const r = await D.places.search({ query: '도서관' });
  assert.equal(r.items.length, 2); assert.equal(r.nearby, false);
  assert.equal(up.calls.length, 1); assert.equal(up.calls[0].url.searchParams.get('x'), null, 'no position → no coordinates sent');
  const e = r.items[0];
  assert.equal(D.action(e).label, '카카오맵에서 보기'); assert.equal(D.action(e).url, 'http://place.map.kakao.com/26338954');
  assert.equal(D.attribution(e).text, '장소 정보 출처: Kakao Local');
  assert.equal(D.freshness(e), 'unknown', 'fetch time is not a verification date');
  assert.ok(!ctx.LivonSearch.search('마포 중앙도서관').items.some(x => String(x.item.key).includes('kr-kakao-place')), 'results do not leak into the static index');
  const html = D.ui.list(r.items, D.ui.note('place'), 'life');
  assert.match(html, /장소 · Kakao Local/); assert.match(html, /서울 마포구 성산로 128/); assert.match(html, /02-3153-5800/); assert.match(html, /카카오맵에서 보기/);
  assert.doesNotMatch(html, /공식 페이지|공식 홈페이지|원문 보기|최근 확인|평점|리뷰|영업시간/);
  assert.doesNotMatch(html, /거리 /, 'no distance without a position');
});

test('nearby: only with explicit coordinates; rounded before leaving the page; distance formatted from Kakao meters', async () => {
  const { D, up, ctx } = await loaded();
  await assert.rejects(D.places.search({ category: 'HP8' }), e => e.code === 'NEEDS_INPUT', 'no location → no "near me" results');
  assert.equal(up.calls.length, 0);
  const r = await D.places.search({ query: '약국', coords: { lat: 37.5665351234, lng: 126.9779692345 }, radius: 1000 });
  assert.equal(r.nearby, true);
  const sent = ctx._requested.find(u => u.includes('kr-kakao-place'));
  assert.match(sent, /^\/api\/livon\/data BODY /, 'position goes in a POST body, not the URL');
  const sentBody = JSON.parse(sent.split(' BODY ')[1]);
  assert.deepEqual([sentBody.lat, sentBody.lng, sentBody.radius, sentBody.sort, sentBody.action], [37.567, 126.978, 1000, 'distance', 'nearby']);
  assert.doesNotMatch(sent, /5351234|9692345/);
  assert.equal(up.calls[0].url.searchParams.get('y'), '37.567', 'server receives the rounded position');
  assert.equal(D.ui.distance(350), '350m'); assert.equal(D.ui.distance(1234), '1.2km'); assert.equal(D.ui.distance(null), '');
  const html = D.ui.list(r.items, '', 'life');
  assert.match(html, /거리 350m/);
  await D.places.search({ query: '약국', coords: { lat: 37.5, lng: 127 }, radius: 777 });
  assert.match(ctx._requested.at(-1), /"radius":5000/, 'radius outside the LIVON list → default');
});

test('user origin is never persisted: not in entities, saves, localStorage or sessionStorage', async () => {
  const { D, ctx } = await loaded();
  const r = await D.places.search({ query: '약국', coords: { lat: 37.5665351, lng: 126.9779692 } });
  const e = r.items.find(x => x.providerId === '777');
  assert.equal(D.save(e.id), 'saved');
  const blob = JSON.stringify([...ctx.localStorage._m.entries(), ...ctx.sessionStorage._m.entries(), [...ctx.LivonPlatform._saves.values()], r.items]);
  assert.doesNotMatch(blob, /37\.566|37\.567|126\.977|126\.978/);
  assert.doesNotMatch(JSON.stringify([...ctx.localStorage._m.keys()]), /kakao/i, 'search results are not written to browser storage');
});

test('My Life snapshot: place facts (place coordinates, not the user’s) + Kakao Map URL; no distance', async () => {
  const { D, ctx } = await loaded();
  const r = await D.places.search({ query: '도서관', coords: { lat: 37.5, lng: 127.0 } });
  const id = r.items[0].id;
  assert.equal(D.save(id), 'saved');
  const rec = ctx.LivonPlatform._saves.get('ext:' + id), s = rec.data.snapshot;
  assert.equal(rec.type, 'place'); assert.equal(rec.source, 'Kakao Local');
  assert.equal(s.title, '[QA 픽스처] 마포 중앙도서관'); assert.equal(s.provider, 'kr-kakao-place'); assert.equal(s.category, '취미');
  assert.equal(s.address, '서울 마포구 성산동 370-1'); assert.equal(s.roadAddress, '서울 마포구 성산로 128'); assert.equal(s.phone, '02-3153-5800');
  assert.equal(s.latitude, 37.5636); assert.equal(s.longitude, 126.9084); assert.equal(s.mapUrl, 'http://place.map.kakao.com/26338954');
  assert.equal(s.actionLabel, '카카오맵에서 보기'); assert.equal('distanceMeters' in s, false); assert.doesNotMatch(JSON.stringify(rec), /"distance/);
  const back = D.fromSave(rec); assert.equal(back.entity.title, s.title);
});

test('Life Stage / Today relevance: explicit category relations only, never by age', async () => {
  const { D } = await loaded();
  const byCat = c => LIFE.topics.filter(t => t.category === c);
  for (const t of byCat('창업')) assert.equal(D.places.planForTopic(t).query, '창업지원센터', t.id);
  for (const t of byCat('건강')) { const p = D.places.planForTopic(t); assert.equal(p.category, 'HP8'); assert.equal(p.needsLocation, true); }
  for (const c of ['돈/재테크', '주거', '취업', '연금', '자기계발', '관계', '운동']) for (const t of byCat(c)) assert.equal(D.places.planForTopic(t), null, t.id);
  assert.ok(LIFE.topics.filter(t => t.lifeStageId === '20').some(t => D.places.planForTopic(t) === null), 'a life stage alone never adds places');
  assert.equal(D.places.planForContent({ category: '문화 행사', tags: [] }).category, 'CT1');
  assert.equal(D.places.planForContent({ category: '창업' }).query, '창업지원센터');
  for (const c of ['커플 데이트', '베이킹', '돈 관리', '가을']) assert.equal(D.places.planForContent({ category: c }), null, c);
  assert.equal(D.forTopic(byCat('창업')[0], 'place').filter(e => e.provider === 'kr-kakao-place').length, 0, 'no automatic Kakao calls from topics');
});

test('Home: Kakao places never appear as "내 주변" or by interest alone (no place column, no automatic calls)', async () => {
  const { D, up } = await loaded();
  await D.places.search({ query: '도서관' });
  const r = D.forHome({ stage: '20', interests: ['여행', '건강', '취미'] });
  assert.equal(Object.keys(r).includes('places'), false);
  assert.ok([...r.events, ...r.policies, ...r.programs].every(e => e.provider !== 'kr-kakao-place'));
  assert.doesNotMatch(read('home-page.js'), /내 주변|가까운 장소|kr-kakao-place/);
  assert.equal(up.calls.length, 1);
});

test('dedupe: same Kakao id → one; cross-provider only with title + address + phone/coordinates, never title alone', async () => {
  const { D } = await loaded();
  const S = D.schema;
  const k = S.validateEntity(kakao.toEntity(doc(), new Date().toISOString())).entity;
  const kNewer = Object.assign({}, k, { source: Object.assign({}, k.source, { fetchedAt: new Date(Date.now() + 1000).toISOString() }) });
  assert.equal(D.dedupe([k, kNewer]).length, 1);
  const other = over => Object.assign({}, k, { id: 'kr-public-places:place:T1', provider: 'kr-public-places', providerId: 'T1', source: Object.assign({}, k.source, { providerName: '공공 장소' }) }, over);
  assert.equal(D.dedupe([k, other({})]).length, 1, 'title + address + phone + coordinates');
  assert.equal(D.dedupe([k, other({ location: Object.assign({}, k.location, { roadAddress: '다른 주소', address: '다른 주소', latitude: 35, longitude: 129 }), contact: null })]).length, 2, 'title only');
  assert.equal(D.dedupe([k, other({ contact: null, location: Object.assign({}, k.location, { latitude: 35, longitude: 129 }) })]).length, 2, 'title + address only');
});

test('existing providers unaffected: business event list route and bulk refresh still work next to Kakao', async () => {
  const h = handler({ ...ENV, BIZINFO_API_KEY: 'biz-test-key-123456' }, upstream(u => reply(u.origin === 'https://dapi.kakao.com' ? body([]) : JSON.stringify({ jsonArray: { item: [] } }))));
  const st = (await call(h, '/api/livon/data?action=status')).json().providers;
  assert.equal(st['kr-business-event'].configured, true); assert.equal(st['kr-kakao-place'].configured, true); assert.equal(st['kr-youth-policy'].configured, false);
  assert.equal((await call(h, '/api/livon/data?provider=kr-business-event&category=06')).statusCode, 200);
  assert.equal((await call(h, '/api/livon/data?provider=kr-youth-policy&query=a')).statusCode, 400);
  assert.deepEqual(PROVIDERS['kr-kakao-place'].entityTypes, ['place']);
});

test('docs + Explore wiring: provider documented; Explore search block, consent button and honest wording present', () => {
  const docs = root('docs/livon/real-data-providers.md');
  assert.match(docs, /kr-kakao-place/); assert.match(docs, /KAKAO_REST_API_KEY/);
  const ex = read('explore-page.js');
  assert.match(ex, /내 위치 기준으로 찾기/); assert.match(ex, /장소 정보 출처: Kakao Local/); assert.match(ex, /저장되지 않습니다/);
  assert.doesNotMatch(ex, /localStorage\.setItem\([^)]*(lat|coords)/);
  assert.doesNotMatch(ex.slice(ex.indexOf('Kakao Local place search')), /공식 홈페이지|리뷰 수|★/);
  assert.match(ex, /영업시간·평점·가격은 제공되지 않습니다/);
});
