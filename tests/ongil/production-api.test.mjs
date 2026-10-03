// ONGIL Production API Connection V1: ONGIL's own browser clients (data-source.js) against the REAL existing server
// route (server/livon/data/http.mjs, the Vercel function behind /api/livon/data) — no mocked route answers.
//   ONGIL client → fetch bridge (Origin https://www.newon.app, a separate API origin) → createDataHandler (CORS,
//   allowlist, validation, cache, normalisation) → fake UPSTREAM provider → normalised entities → ONGIL contracts → UI items
// Upstream answers are TEST FIXTURES shaped like the documented provider responses (same shapes the LIVON provider
// tests use). Nothing here is live: LIVE VERIFIED needs the deployed API with real keys.   node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDataHandler, PROVIDERS } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';
import { createHealthHandler } from '../../server/livon/health.mjs';
import { allowedOrigins } from '../../server/livon/cors.mjs';
import { livonApiOriginFromEnv, livonApiConfigScript } from '../../scripts/livon-api-config.mjs';
import { createLifelongClassSource, createFacilitySource, createEnjoyPlaceSource, createTourPlaceSource, LIFELONG_PROVIDER, KAKAO_PLACE_PROVIDER, TOUR_PROVIDER } from '../../ongil-start/js/data-source.js';
import { fromKakaoPlace, fromTourPlace, sanitizeEnjoyItems, savedInputFor as enjoySaved } from '../../ongil-start/js/enjoy-contracts.js';
import { sanitizeCareItems, savedInputFor as careSaved } from '../../ongil-start/js/care-contracts.js';
import { createSearch, createEnjoyProvider, createCareProvider } from '../../ongil-start/js/search.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createStorage, createMemoryBackend } from '../../ongil-start/js/storage.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const KEYS = { KAKAO_REST_API_KEY: 'kakao-test-key-DO-NOT-LEAK-7777', TOURAPI_SERVICE_KEY: 'tour-test-key-DO-NOT-LEAK-5555', PUBLIC_DATA_SERVICE_KEY: 'pd-test-key-DO-NOT-LEAK-7171' };
const API_ORIGIN = 'https://api.example.test';
const SITE = 'https://www.newon.app';
const day = (n) => new Date(Date.now() + n * 864e5 + 9 * 3600e3).toISOString().slice(0, 10);

/* ───────── fake upstream providers (documented response shapes) ───────── */
const kakaoDoc = (o = {}) => ({ id: '26338954', place_name: '[QA] 마포 중앙도서관', category_name: '문화,예술 > 문화시설 > 도서관', category_group_code: 'CT1', category_group_name: '문화시설', phone: '02-3153-5800', address_name: '서울 마포구 성산동 370-1', road_address_name: '서울 마포구 성산로 128', x: '126.9084', y: '37.5636', place_url: 'http://place.map.kakao.com/26338954', distance: '', ...o });
const kakaoBody = (docs) => JSON.stringify({ meta: { same_name: null, total_count: docs.length, pageable_count: docs.length, is_end: true }, documents: docs });
const tourItem = (o = {}) => ({ contentid: '126508', contenttypeid: '12', title: '[QA] 경복궁', addr1: '서울특별시 종로구 사직로 161', addr2: '', zipcode: '03045', mapx: '126.9769930325', mapy: '37.5788222356', mlevel: '6', tel: '02-3700-3900', firstimage: '', firstimage2: '', cpyrhtDivCd: 'Type3', lDongRegnCd: '11', lDongSignguCd: '110', lclsSystm1: 'HS', lclsSystm2: 'HS01', lclsSystm3: 'HS010100', createdtime: '20031105090000', modifiedtime: '20250909101010', ...o });
const tourBody = (items) => JSON.stringify({ response: { header: { resultCode: '0000', resultMsg: 'OK' }, body: { items: items.length ? { item: items } : '', numOfRows: 20, pageNo: 1, totalCount: items.length } } });
const lifelongRow = (o = {}) => ({ lctreNm: '[QA] 스마트폰 기초', instrctrNm: '김강사', edcStartDay: day(10), edcEndDay: day(70), edcStartTime: '10:00', edcColseTime: '12:00', lctreCo: '스마트폰을 처음 쓰는 분을 위한 강좌', edcTrgetType: '시민', edcMthType: '오프라인', operDay: '화', edcPlace: '2층 강의실', psncpa: '20', lctreCost: '0', edcRdnmadr: '서울특별시 종로구 종로 1', operInstitutionNm: '종로구립도서관', operPhoneNumber: '02-000-0000', rceptStartDate: day(-3), rceptEndDate: day(5), rceptMthType: '온라인', slctnMthType: '선착순', homepageUrl: 'https://lib.example.kr/', oadtCtLctreYn: 'N', pntBankAckestYn: 'N', lrnAcnutAckestYn: 'N', referenceDate: '2026-07-14', instt_code: '3000000', ...o });
const lifelongBody = (rows) => JSON.stringify({ response: { header: { resultCode: '00', resultMsg: 'NORMAL SERVICE.' }, body: { items: rows, totalCount: rows.length, numOfRows: 1000, pageNo: 1 } } });
const reply = (text, status = 200) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => 'application/json' }, text: async () => text });

function upstream({ kakao = () => reply(kakaoBody([kakaoDoc()])), tour = () => reply(tourBody([tourItem()])), lifelong = () => reply(lifelongBody([lifelongRow()])) } = {}) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    const u = new URL(url);
    calls.push(u);
    if (u.origin === 'https://dapi.kakao.com') return kakao(u, init);
    if (u.origin === 'https://apis.data.go.kr' && u.pathname.includes('KorService2')) return tour(u, init);
    if (u.origin === 'https://api.data.go.kr') return lifelong(u, init);
    throw new Error('unexpected upstream host ' + u.origin);
  };
  return { fetcher, calls };
}

/* ───────── ONGIL fetch → real route (what a browser on www.newon.app does against the API origin) ───────── */
function bridge(handler, { origin = SITE, seen = [] } = {}) {
  return async (url, init = {}) => {
    const u = new URL(url);
    assert.equal(u.origin, API_ORIGIN, 'ONGIL asks only the configured API origin');
    seen.push({ url: u, init });
    const res = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } };
    await handler({ method: init.method || 'GET', url: u.pathname + u.search, headers: { origin, host: u.host, accept: 'application/json' } }, res);
    return { ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, headers: res.headers, json: async () => JSON.parse(res.body), _raw: res.body };
  };
}
function stack({ env = { ...KEYS }, up = upstream(), origin = SITE } = {}) {
  const handler = createDataHandler({ env, fetcher: up.fetcher, cache: memoryCache(), log: () => {} });
  const seen = [];
  const fetcher = bridge(handler, { origin, seen });
  const apiUrl = (p) => API_ORIGIN + p;
  return { handler, fetcher, apiUrl, seen, up, raw: (q) => fetcher(API_ORIGIN + '/api/livon/data' + q) };
}

/* ───────── route security ───────── */

test('API-01 provider allowlist: ONGIL\'s three providers exist on the route, with server-only key names', () => {
  for (const id of [LIFELONG_PROVIDER, KAKAO_PLACE_PROVIDER, TOUR_PROVIDER]) assert.ok(PROVIDERS[id], id);
  assert.deepEqual([PROVIDERS[LIFELONG_PROVIDER].envKey, PROVIDERS[KAKAO_PLACE_PROVIDER].envKey, PROVIDERS[TOUR_PROVIDER].envKey], ['PUBLIC_DATA_SERVICE_KEY', 'KAKAO_REST_API_KEY', 'TOURAPI_SERVICE_KEY']);
});

test('API-02 unknown provider is refused before any upstream call', async () => {
  const s = stack();
  const r = await s.raw('?provider=evil-provider&query=x');
  assert.equal(r.status, 404);
  assert.equal((await r.json()).code, 'UNKNOWN_PROVIDER');
  assert.equal(s.up.calls.length, 0);
});

test('API-03 query validation: oversized or markup queries and unknown parameters are 400', async () => {
  const s = stack();
  for (const q of [`?provider=${KAKAO_PLACE_PROVIDER}&query=${'가'.repeat(80)}`, `?provider=${KAKAO_PLACE_PROVIDER}&query=%3Cscript%3E`, `?provider=${KAKAO_PLACE_PROVIDER}&query=a&foo=1`, `?provider=${KAKAO_PLACE_PROVIDER}&query=a&query=b`]) {
    const r = await s.raw(q);
    assert.equal(r.status, 400, q);
  }
  assert.equal(s.up.calls.length, 0);
});

test('API-04 region validation: TourAPI accepts only its seven regions, lifelong only real 시·도 names', async () => {
  const s = stack();
  assert.equal((await s.raw(`?provider=${TOUR_PROVIDER}&region=${encodeURIComponent('제주')}&type=12`)).status, 400);
  assert.equal((await s.raw(`?provider=${LIFELONG_PROVIDER}&region=${encodeURIComponent('화성시청')}`)).status, 400);
  assert.equal((await s.raw(`?provider=${TOUR_PROVIDER}&region=${encodeURIComponent('서울')}&type=32`)).status, 200, 'lodging is a valid route type …');
  assert.doesNotMatch(read('ongil-start/js/data-source.js'), /TOUR_TYPE_IDS = Object\.freeze\(\[[^\]]*'32'/, '… but ONGIL never asks for lodging (12, 14, 28 only)');
});

test('API-05 pagination bounds: page and limit are bounded (Kakao 15 per page, TourAPI 20, list 100)', async () => {
  const s = stack();
  assert.equal((await s.raw(`?provider=${KAKAO_PLACE_PROVIDER}&query=a&page=999`)).status, 400);
  assert.equal((await s.raw(`?provider=${LIFELONG_PROVIDER}&page=0`)).status, 400);
  const k = await (await s.raw(`?provider=${KAKAO_PLACE_PROVIDER}&query=a&limit=500`)).json();
  assert.equal(k.limit, 15);
  const t = await (await s.raw(`?provider=${TOUR_PROVIDER}&region=${encodeURIComponent('서울')}&limit=500`)).json();
  assert.equal(t.limit, 20);
});

test('API-06 no arbitrary URL: a url/endpoint parameter is refused; upstream hosts are fixed in the adapters', async () => {
  const s = stack();
  for (const q of [`?provider=${KAKAO_PLACE_PROVIDER}&query=a&url=https://evil.test`, `?provider=${LIFELONG_PROVIDER}&endpoint=http://169.254.169.254/`, '?url=https://evil.test']) assert.equal((await s.raw(q)).status, 400, q);
  await s.raw(`?provider=${KAKAO_PLACE_PROVIDER}&query=${encodeURIComponent('서울 공원')}`);
  assert.deepEqual([...new Set(s.up.calls.map((u) => u.origin))], ['https://dapi.kakao.com']);
});

test('API-07 secrets: no key value in any response, status or health answer', async () => {
  const s = stack();
  const bodies = [];
  for (const q of ['?action=status', `?provider=${KAKAO_PLACE_PROVIDER}&query=a`, `?provider=${TOUR_PROVIDER}&region=${encodeURIComponent('서울')}&type=12`, `?provider=${LIFELONG_PROVIDER}&region=${encodeURIComponent('서울')}`, '?provider=nope']) bodies.push((await s.raw(q))._raw);
  const res = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; } };
  createHealthHandler({ env: { ...KEYS } })({ method: 'GET', url: '/api/health', headers: {} }, res);
  bodies.push(res.body);
  const all = bodies.join('\n');
  for (const v of Object.values(KEYS)) assert.equal(all.includes(v), false);
  const h = JSON.parse(res.body);
  for (const id of [LIFELONG_PROVIDER, KAKAO_PLACE_PROVIDER, TOUR_PROVIDER]) assert.deepEqual(h.data.providers[id], { configured: true });
});

test('API-08 sanitized errors: upstream failure bodies never reach the client — fixed code and Korean sentence only', async () => {
  const s = stack({ up: upstream({ kakao: () => reply('{"errorType":"AccessDeniedError","message":"internal secret path /var/task"}', 401) }) });
  const r = await s.raw(`?provider=${KAKAO_PLACE_PROVIDER}&query=a`);
  const body = await r.json();
  assert.equal(r.status, 502);
  assert.deepEqual(Object.keys(body).sort(), ['code', 'error', 'ok']);
  assert.equal(body.code, 'UPSTREAM_ERROR');
  assert.doesNotMatch(r._raw, /AccessDenied|\/var\/task|stack|Error:/);
});

test('API-09 timeout isolation: a stalled API answer ends in "unavailable" by ONGIL\'s own timer; another source still works', async () => {
  const s = stack();
  const stalled = (url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))));
  const slow = createEnjoyPlaceSource({ apiUrl: s.apiUrl, fetcher: stalled, timeoutMs: 30 });
  const t0 = Date.now();
  assert.equal((await slow.load({ region: '서울', word: '공원' })).state, 'unavailable');
  assert.ok(Date.now() - t0 < 1000);
  const ok = createTourPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher });
  assert.equal((await ok.load({ region: '서울', contentType: '12' })).state, 'ready');
});

test('API-10 malformed upstream (HTML, wrong shape, not JSON) → 502 at the route → "unavailable" in ONGIL; rows without id/name → nothing shown', async () => {
  for (const kakao of [() => reply('<html>maintenance</html>'), () => reply('{"documents":"x"}'), () => reply('not json')]) {
    const s = stack({ up: upstream({ kakao }) });
    const r = await createEnjoyPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', word: '공원' });
    assert.equal(r.state, 'unavailable');
  }
  /* documents without an id or a name are dropped by the route's adapter: an honest "nothing found", never a broken row */
  const s = stack({ up: upstream({ kakao: () => reply(kakaoBody([{ id: '', place_name: '' }])) }) });
  const r = await createEnjoyPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', word: '공원' });
  assert.ok(['empty', 'unavailable'].includes(r.state));
  assert.deepEqual(r.items, []);
});

/* ───────── normalisation through the real route ───────── */

test('API-11 lifelong (Home 내 주변 + 즐길거리): route entity → ONGIL CLASS item with an https official link', async () => {
  const s = stack();
  const r = await createLifelongClassSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', limit: 6 });
  assert.equal(r.state, 'ready');
  const it = r.items[0];
  assert.equal(it.type, 'CLASS');
  assert.match(it.title, /스마트폰 기초/);
  assert.equal(it.region, '서울');
  assert.match(it.sourceUrl, /^https:\/\/lib\.example\.kr\//);
  assert.ok(s.seen.every((x) => x.init.credentials === 'omit' && (x.init.method || 'GET') === 'GET'));
});

test('API-12 Kakao (즐길거리 장소 and 돌봄 기관): route entity → ONGIL PLACE / FACILITY with a map link, phone, address', async () => {
  const s = stack();
  const raw = await createEnjoyPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', word: '도서관' });
  assert.equal(raw.state, 'ready');
  const places = sanitizeEnjoyItems(raw.items.map((x) => fromKakaoPlace(x, 'LEARNING')).filter(Boolean));
  assert.equal(places.length, 1);
  assert.equal(places[0].type, 'PLACE');
  assert.match(places[0].title, /마포 중앙도서관/);
  /* the live route gives Kakao's page as http://…; ONGIL shows it as an https map link */
  assert.equal(places[0].sourceUrl, 'https://place.map.kakao.com/26338954');
  assert.equal(places[0].linkKind, 'map');
  assert.equal(places[0].region, '서울');
  const fac = await createFacilitySource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', kind: { id: 'health-center', query: '보건소' } });
  assert.equal(fac.state, 'ready');
  const items = sanitizeCareItems(fac.items);
  assert.equal(items[0].type, 'FACILITY');
  assert.equal(items[0].mapUrl, 'https://place.map.kakao.com/26338954');
  assert.equal(items[0].sourceName, '카카오 (Kakao Local)');
});

test('API-13 TourAPI (즐길거리 관광지·문화시설·레포츠): route entity → ONGIL PLACE with region and an https source', async () => {
  const s = stack();
  const raw = await createTourPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', contentType: '12' });
  assert.equal(raw.state, 'ready');
  const places = sanitizeEnjoyItems(raw.items.map((x) => fromTourPlace(x, 'OUTING')).filter(Boolean));
  assert.equal(places.length, 1);
  assert.match(places[0].title, /경복궁/);
  assert.equal(places[0].region, '서울');
  const call = s.up.calls.find((u) => u.pathname.endsWith('areaBasedList2'));
  assert.equal(call.searchParams.get('contentTypeId'), '12');
});

test('API-14 duplicates are dropped end to end', async () => {
  const s = stack({ up: upstream({ kakao: () => reply(kakaoBody([kakaoDoc(), kakaoDoc(), kakaoDoc({ id: '26338955', place_name: '[QA] 다른 도서관' })])) }) });
  const raw = await createEnjoyPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', word: '도서관' });
  const places = sanitizeEnjoyItems(raw.items.map((x) => fromKakaoPlace(x, 'LEARNING')).filter(Boolean));
  assert.equal(places.length, 2);
});

test('API-15 unsafe links never reach a screen: javascript:/data:/http homepage links are dropped', async () => {
  const s = stack({ up: upstream({ lifelong: () => reply(lifelongBody([lifelongRow({ homepageUrl: 'javascript:alert(1)' }), lifelongRow({ lctreNm: '[QA] 두 번째', homepageUrl: 'data:text/html,x' })])) }) });
  const r = await createLifelongClassSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', limit: 6 });
  for (const it of r.items) assert.ok(!it.sourceUrl || /^https:\/\//.test(it.sourceUrl), it.sourceUrl);
  assert.equal(JSON.stringify(r.items).includes('javascript:'), false);
});

/* ───────── API origin + failures as ONGIL sees them ───────── */

test('API-16 missing API origin: the page uses the same origin; on GitHub Pages that is 404 → "unavailable", no crash', async () => {
  assert.equal(livonApiOriginFromEnv({}), '');
  assert.match(livonApiConfigScript(''), /var configured = "";/);
  assert.match(read('ongil-start/js/app.js'), /apiUrl: \(path\) => \(apiConfig \? apiConfig\.url\(path\) : path\)/);
  const notFound = async () => ({ ok: false, status: 404, json: async () => ({}) });
  assert.equal((await createLifelongClassSource({ apiUrl: (p) => p, fetcher: notFound }).load({ region: '서울' })).state, 'unavailable');
});

test('API-17 invalid API origin: http, paths, credentials, wildcards and script URLs are ignored at build time', () => {
  for (const bad of ['http://api.example.test', 'https://api.example.test/path', 'https://user:pw@api.example.test', 'https://*.example.test', 'javascript:alert(1)', 'data:text/plain,x', 'file:///etc', 'ftp://x.test']) assert.equal(livonApiOriginFromEnv({ LIVON_API_ORIGIN: bad }), '', bad);
  assert.equal(livonApiOriginFromEnv({ LIVON_API_ORIGIN: 'https://ongil-api.vercel.app/' }), 'https://ongil-api.vercel.app');
});

test('API-18 / API-19 / API-20 route not configured (503), upstream 500 (502) and offline → "unavailable" for every ONGIL source', async () => {
  const unconfigured = stack({ env: {} });
  const failing = stack({ up: upstream({ kakao: () => reply('oops', 500), tour: () => reply('oops', 500), lifelong: () => reply('oops', 500) }) });
  const offline = async () => { throw new TypeError('Failed to fetch'); };
  for (const s of [unconfigured, failing, { apiUrl: unconfigured.apiUrl, fetcher: offline }]) {
    const results = await Promise.all([
      createLifelongClassSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울' }),
      createFacilitySource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', kind: { id: 'health-center', query: '보건소' } }),
      createEnjoyPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', word: '공원' }),
      createTourPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', contentType: '12' }),
    ]);
    assert.deepEqual(results.map((r) => r.state), ['unavailable', 'unavailable', 'unavailable', 'unavailable']);
  }
  assert.equal((await (await unconfigured.raw(`?provider=${KAKAO_PLACE_PROVIDER}&query=a`)).json()).code, 'NOT_CONFIGURED');
});

test('API-21 … API-25 one provider failing never affects another (partial failure)', async () => {
  const s = stack({ up: upstream({ tour: () => reply('oops', 500) }) });
  const [life, place, tour] = await Promise.all([
    createLifelongClassSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울' }),
    createEnjoyPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', word: '공원' }),
    createTourPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', contentType: '14' }),
  ]);
  assert.deepEqual([life.state, place.state, tour.state], ['ready', 'ready', 'unavailable']);
});

test('API-CORS the route answers www.newon.app with that exact origin (never *), and refuses any other site before calling upstream', async () => {
  const s = stack();
  const ok = await s.raw('?action=status');
  assert.equal(ok.headers['access-control-allow-origin'], SITE);
  const evil = stack({ origin: 'https://evil.example' });
  const r = await evil.raw(`?provider=${KAKAO_PLACE_PROVIDER}&query=a`);
  assert.equal(r.status, 403);
  assert.equal(evil.up.calls.length, 0);
  assert.deepEqual(allowedOrigins({}), ['https://www.newon.app', 'https://newon.app']);
});

/* ───────── saved, search, privacy ───────── */

test('API-26 saved: a live item is saved as the minimal snapshot (no phone, coordinates or raw payload)', async () => {
  const s = stack();
  const raw = await createEnjoyPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', word: '도서관' });
  const place = sanitizeEnjoyItems(raw.items.map((x) => fromKakaoPlace(x, 'LEARNING')).filter(Boolean))[0];
  const saved = createSavedStore(createStorage({ backend: createMemoryBackend() }));
  saved.save(enjoySaved(place));
  const fac = sanitizeCareItems((await createFacilitySource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', kind: { id: 'health-center', query: '보건소' } })).items)[0];
  saved.save(careSaved(fac));
  const stored = JSON.stringify(saved.list());
  assert.equal(saved.count(), 2);
  /* coordinates and raw provider fields never; a public facility's published phone is part of the 돌봄 snapshot (Phase 4) */
  assert.doesNotMatch(stored, /126\.9084|37\.5636|category_group_code|documents|place_url|latitude/);
  assert.doesNotMatch(JSON.stringify(saved.list({ type: 'PLACE' })), /02-3153-5800/);
});

test('API-27 search covers only what a screen loaded; typing in search never calls the API', async () => {
  const s = stack();
  const raw = await createEnjoyPlaceSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', word: '도서관' });
  const loaded = sanitizeEnjoyItems(raw.items.map((x) => fromKakaoPlace(x, 'LEARNING')).filter(Boolean));
  const before = s.seen.length;
  const search = createSearch();
  search.registerProvider(createEnjoyProvider(() => loaded));
  search.registerProvider(createCareProvider(() => []));
  assert.equal((await search.query('중앙도서관')).results.length, 1);
  assert.equal((await search.query('보건소')).results.length, 0);
  assert.equal(s.seen.length, before, 'no request from search');
  assert.doesNotMatch(strip(read('ongil-start/js/search.js')), /fetch|data-source/);
});

test('API-28 / API-29 / API-30 only region names, public search words and fixed codes are sent — never family, health, journal, community or assistant text', async () => {
  const DS = strip(read('ongil-start/js/data-source.js'));
  const queries = [...DS.matchAll(/getJson\(`([^`]+)`\)|getJson\('([^']+)'\)/g)].map((m) => m[1] || m[2]);
  assert.ok(queries.length >= 3);
  for (const q of queries) for (const name of [...q.matchAll(/[?&]([a-z]+)=/g)].map((m) => m[1])) assert.ok(['action', 'provider', 'region', 'query', 'status', 'limit', 'page', 'type'].includes(name), `${name} in ${q}`);
  const importers = fs.readdirSync(path.join(ROOT, 'ongil-start/js')).filter((f) => f.endsWith('.js') && /from '\.\/data-source\.js'/.test(read(`ongil-start/js/${f}`)));
  assert.ok(importers.length >= 1);
  for (const f of importers) assert.doesNotMatch(f, /family|health|symptom|medication|journal|expense|community|assistant|checkin/, f);
  const s = stack();
  await createLifelongClassSource({ apiUrl: s.apiUrl, fetcher: s.fetcher }).load({ region: '서울', query: '스마트폰' });
  for (const { url } of s.seen) assert.deepEqual([...url.searchParams.keys()].filter((k) => !['action', 'provider', 'region', 'query', 'status', 'limit', 'page', 'type'].includes(k)), []);
  assert.equal(s.seen.every((x) => !x.init.body), true, 'no request body');
});

test('API-31 the API deploys as its own Vercel project (API only, noindex); the frontend learns its origin from a public build variable', () => {
  const vb = read('scripts/vercel-build.mjs');
  assert.match(vb, /process\.env\.LIVON_API_ONLY === "1"/);
  assert.match(read('.github/workflows/github-pages.yml'), /LIVON_API_ORIGIN: \$\{\{ vars\.LIVON_API_ORIGIN \}\}/);
  assert.ok(fs.existsSync(path.join(ROOT, 'api/livon/data.mjs')) && fs.existsSync(path.join(ROOT, 'api/health.mjs')));
  assert.match(read('.env.example'), /\nKAKAO_REST_API_KEY=\n/);
  assert.match(read('.env.example'), /\nTOURAPI_SERVICE_KEY=\n/);
  assert.match(read('.env.example'), /\nPUBLIC_DATA_SERVICE_KEY=\n/);
  for (const f of fs.readdirSync(path.join(ROOT, 'ongil-start/js'))) assert.doesNotMatch(read(`ongil-start/js/${f}`), /KAKAO_REST_API_KEY|TOURAPI_SERVICE_KEY|PUBLIC_DATA_SERVICE_KEY|KakaoAK|serviceKey|vercel\.app|api\.newon\.app/, f);
});

test('API-32 "not connected" and "could not load" are told apart: no route (404) or no key → NOT_CONFIGURED; offline, 5xx or not JSON → NO_ANSWER', async () => {
  const make = (fetcher) => [
    createLifelongClassSource({ apiUrl: (p) => p, fetcher }).load({ region: '서울' }),
    createFacilitySource({ apiUrl: (p) => p, fetcher }).load({ region: '서울', kind: { id: 'health-center', query: '보건소' } }),
    createEnjoyPlaceSource({ apiUrl: (p) => p, fetcher }).load({ region: '서울', word: '공원' }),
    createTourPlaceSource({ apiUrl: (p) => p, fetcher }).load({ region: '서울', contentType: '12' }),
  ];
  const cases = [
    ['404 (GitHub Pages, no API origin)', async () => ({ ok: false, status: 404, json: async () => ({}) }), 'NOT_CONFIGURED'],
    ['route says no key', async () => ({ ok: true, status: 200, json: async () => ({ ok: true, providers: {} }) }), 'NOT_CONFIGURED'],
    ['offline', async () => { throw new TypeError('Failed to fetch'); }, 'NO_ANSWER'],
    ['502', async () => ({ ok: false, status: 502, json: async () => ({ ok: false }) }), 'NO_ANSWER'],
    ['not JSON', async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('x'); } }), 'NO_ANSWER'],
  ];
  for (const [label, fetcher, reason] of cases) {
    const results = await Promise.all(make(fetcher));
    assert.deepEqual(results.map((r) => [r.state, r.reason]), Array(4).fill(['unavailable', reason]), label);
  }
  const home = strip(read('ongil-start/js/home-explore.js'));
  assert.match(home, /result\.reason === 'NO_ANSWER'/);
  assert.match(home, /지금은 강좌 정보를 받아오지 못했어요/);
  assert.match(home, /주변 정보는 아직 연결되지 않았어요/);
});
