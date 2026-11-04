// 공공기관 공개 마을세무사 정보 (kr-public-tax-expert): sources, route, trust model, privacy and LIVON integration.
// No real key is used. Fixtures use only the official column names and obviously fake names/numbers ([QA 픽스처]).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as tx from '../../server/livon/data/providers/public-tax-expert.mjs';
import { createDataHandler } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const root = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const KEY = 'pd-test-key+DO/NOT=LEAK-8282';
const ENV = { PUBLIC_DATA_SERVICE_KEY: KEY };
const Q = s => '/api/livon/data?provider=kr-public-tax-expert' + (s ? '&' + s : '');

const dg = (o = {}) => Object.assign({ EMD_NM: '신암1동', LNDCTN_NM: '[QA 픽스처] 가세무', TELNO: '053-000-0001' }, o);
const ic = (o = {}) => Object.assign({ 구분: '연수구', 세무사명: '[QA 픽스처] 나세무', 활동마을: '송도1동, 송도2동' }, o);
const gwOk = rows => JSON.stringify({ response: { header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' }, body: { items: { item: rows }, numOfRows: 100, pageNo: 1, totalCount: rows.length } } });
const odOk = rows => JSON.stringify({ page: 1, perPage: 100, totalCount: rows.length, currentCount: rows.length, matchCount: rows.length, data: rows });

function upstream({ daegu = () => reply(gwOk([dg(), dg({ EMD_NM: '효목1동', LNDCTN_NM: '[QA 픽스처] 다세무', TELNO: '053-000-0002' })])), incheon = () => reply(odOk([ic()])), other } = {}) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    const u = new URL(url); calls.push({ url: u, init });
    if (u.href.startsWith(tx.SOURCES['daegu-donggu'].endpoint)) return daegu(u);
    if (u.href.startsWith(tx.SOURCES.incheon.endpoint)) return incheon(u);
    if (other) return other(u);
    throw new Error('unexpected host ' + u.host);
  };
  return { fetcher, calls };
}
const reply = (text, { status = 200 } = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => 'application/json' }, text: async () => text });
function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } }; r.json = () => JSON.parse(r.body); return r; }
async function call(h, url, method = 'GET', init = {}) { const r = res(); await h({ method, url, headers: init.headers || {}, body: init.body }, r); return r; }
const handler = (env, up, extra = {}) => createDataHandler({ env, fetcher: up.fetcher, cache: extra.cache || memoryCache(), log: extra.log || (() => {}) });
const S = () => globalThis.LivonDataSchema;
const ent = (srcId, row, o = {}) => S().validateEntity(Object.assign(tx.toEntity(tx.SOURCES[srcId], tx.readRow(tx.SOURCES[srcId], row), 'txTEST' + (o.idSuffix || ''), '2026-09-29T00:00:00.000Z'), o.patch || {})).entity;

/* ───────── contract / server ───────── */
test('3-4 no key: configured=false, zero calls; secret never exposed', async () => {
  const up = upstream();
  const h = handler({}, up);
  assert.deepEqual((await call(h, '/api/livon/data?action=status')).json().providers['kr-public-tax-expert'], { configured: false, entityTypes: ['expert'] });
  assert.equal((await call(h, Q())).json().code, 'NOT_CONFIGURED'); assert.equal(up.calls.length, 0);
  const logs = [];
  const bad = upstream({ daegu: () => reply('<OpenAPI_ServiceResponse><returnAuthMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</returnAuthMsg>' + KEY + '</OpenAPI_ServiceResponse>'), incheon: () => { throw new Error('x ' + KEY); } });
  const r = await call(handler(ENV, bad, { log: (...a) => logs.push(a.join(' ')) }), Q());
  assert.equal(r.statusCode, 502); assert.doesNotMatch(r.body, /DO\/NOT|serviceKey|NOT_REGISTERED/); assert.ok(logs.every(l => !/DO\/NOT|serviceKey/.test(l)));
});

test('5 source allowlist + strict params: no arbitrary URL, no unknown source, no phone-number lookups', async () => {
  const h = handler(ENV, upstream());
  for (const q of ['source=evil', 'url=https://evil.example', 'region=' + encodeURIComponent('서울'), 'query=053', 'query=0530000001', 'query=' + encodeURIComponent('<b>'), 'category=01', 'lat=1', 'page=0']) {
    assert.equal((await call(h, Q(q))).statusCode, 400, q);
  }
  assert.equal((await call(h, Q('region=' + encodeURIComponent('인천')))).json().items.length, 1);
  assert.deepEqual([...tx.REGIONS], ['대구', '인천']);
});

test('6-12 person normalization: name, role, region, contact (purpose-checked), designation, source date — only official values', () => {
  const d = ent('daegu-donggu', dg());
  assert.equal(d.type, 'expert'); assert.equal(d.title, '[QA 픽스처] 가세무'); assert.equal(d.name, '[QA 픽스처] 가세무');
  assert.equal(d.role, '마을세무사'); assert.equal(d.trustLevel, 'public_designated'); assert.equal(d.verifiedByLivon, false);
  assert.equal(d.serviceArea, '신암1동'); assert.deepEqual([d.location.region, d.location.city, d.location.district], ['대구', '대구광역시 동구', '신암1동']);
  assert.equal(d.contact.phone, '053-000-0001'); assert.equal(d.metadata.phonePurpose, 'consultation');
  assert.equal(d.designationStart, null); assert.equal(d.designationEnd, null);
  assert.equal(d.metadata.referenceDate, '2025-08-28'); assert.equal(d.metadata.referenceKind, 'modified');
  assert.equal(d.sourceOrganization, '대구광역시 동구'); assert.equal(d.sourceDataset, '대구광역시 동구_마을세무사 현황'); assert.equal(d.source.sourceUrl, 'https://www.data.go.kr/data/15110587/openapi.do');
  const i = ent('incheon', ic());
  assert.equal(i.serviceArea, '연수구 송도1동, 송도2동'); assert.equal(i.location.city, '인천광역시 연수구'); assert.equal(i.location.district, null);
  assert.equal(i.contact, null, 'the 20260228 Incheon file has no phone column'); assert.equal(i.metadata.referenceDate, '2026-02-28');
  assert.equal(ent('daegu-donggu', dg({ TELNO: '문의 바람' })).contact, null, 'non-phone text dropped');
});

test('13-18 nothing invented: no qualification, career, rating, review, price, availability, photo, gender, age', () => {
  for (const e of [ent('daegu-donggu', dg()), ent('incheon', ic())]) {
    assert.deepEqual([...e.credentials], []); assert.deepEqual([...e.specialties], []); assert.deepEqual([...e.serviceTypes], []); assert.deepEqual([...e.consultationMethods], []);
    assert.equal(e.externalBookingUrl, null); assert.equal(e.pricing, null); assert.equal(e.media, null); assert.equal(e.availability, null); assert.equal(e.organization, null);
    assert.doesNotMatch(JSON.stringify(e, (k, v) => (v === null ? undefined : v)), /rating|review|career|자격|경력|평점|후기|상담료|예약|gender|age"|photo/i);
    assert.equal(e.category, '세무');
  }
  const forged = S().validateEntity({ type: 'expert', provider: 'x', providerId: '1', title: 't', source: { providerName: 'x' }, trustLevel: 'partner_verified' }).entity;
  assert.equal(forged.trustLevel, null, 'a data feed can never claim partner verification');
});

test('34 + 38-39: source failure isolation, timeout, zero results; partial results cached briefly', async () => {
  const ttls = [];
  const cache = memoryCache(); const set = cache.set.bind(cache); cache.set = (k, v, t) => { ttls.push(t); return set(k, v, t); };
  const partial = await call(handler(ENV, upstream({ incheon: () => reply('', { status: 500 }) }), { cache }), Q());
  assert.equal(partial.statusCode, 200); assert.equal(partial.json().items.length, 2, '대구 동구 still shown when 인천 fails');
  assert.deepEqual(ttls, [3600e3], 'a partial result is cached for 1 hour only');
  const full = memoryCache(); const t2 = []; const s2 = full.set.bind(full); full.set = (k, v, t) => { t2.push(t); return s2(k, v, t); };
  await call(handler(ENV, upstream(), { cache: full }), Q()); assert.deepEqual(t2, [7 * 24 * 3600e3], 'expert TTL from config');
  const t = await call(handler(ENV, upstream({ daegu: () => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }); }, incheon: () => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }); } })), Q());
  assert.equal(t.statusCode, 504);
  const quota = await call(handler(ENV, upstream({ daegu: () => reply('<x><returnAuthMsg>LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR</returnAuthMsg><returnReasonCode>22</returnReasonCode></x>'), incheon: () => reply('{"bad":1}') })), Q());
  assert.equal(quota.statusCode, 503); assert.equal(quota.json().code, 'UPSTREAM_LIMIT');
  const zero = await call(handler(ENV, upstream({ daegu: () => reply(JSON.stringify({ response: { header: { resultCode: '03' } } })), incheon: () => reply(odOk([])) })), Q());
  assert.equal(zero.statusCode, 200); assert.deepEqual(zero.json().items, []);
});

test('36-37 safe text + no HTML; phone normalization only', () => {
  const e = ent('incheon', ic({ 세무사명: '<b>[QA 픽스처] 라세무</b><script>alert(1)</script>', 활동마을: '<img src=x onerror=alert(1)>송도1동' }));
  assert.equal(e.title, '[QA 픽스처] 라세무'); assert.equal(e.serviceArea, '연수구 송도1동'); assert.doesNotMatch(JSON.stringify(e), /alert|onerror|[<>]/);
  assert.equal(tx.phone('053 000 0001'), '053-000-0001'); assert.equal(tx.phone('javascript:1'), ''); assert.equal(tx.phone('12345'), '');
});

/* ───────── browser ───────── */
function browser(server) {
  const mem = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; } }; };
  const ctx = { console, URL, setTimeout, clearTimeout, Promise, AbortController, localStorage: mem(), sessionStorage: mem(), location: { protocol: 'https:', hash: '' } };
  ctx.window = ctx;
  ctx.fetch = async (url, init = {}) => { const r = await server(String(url), init); return { ok: r.statusCode === 200, status: r.statusCode, json: async () => JSON.parse(r.body) }; };
  vm.createContext(ctx);
  for (const f of ['explore-data.js', 'today-data.js']) vm.runInContext(read(f), ctx);
  ctx.document = { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
  vm.runInContext(read('life-hub.js'), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  const saves = new Map();
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, x), removeSave: id => saves.delete(id), _saves: saves };
  for (const f of ['data/livon-data-config.js', 'data/livon-data-schema.js', 'data/livon-data-core.js', 'data/livon-data-providers.js', 'explore-search.js']) vm.runInContext(read(f), ctx);
  return ctx;
}
async function loaded({ env = ENV, up = upstream() } = {}) {
  const h = handler(env, up);
  const ctx = browser((url, init = {}) => call(h, url, init.method || 'GET', init));
  await new Promise(r => setTimeout(r, 30));
  await ctx.LivonData.repository.refresh({ force: true });
  return { ctx, D: ctx.LivonData, up };
}
const ours = D => D.repository.list({ includeExpired: true }).filter(e => e.provider === 'kr-public-tax-expert');

test('35 partial coverage wording + docs (trust model, readiness, partner architecture)', () => {
  const docs = root('docs/livon/real-data-providers.md');
  for (const re of [/kr-public-tax-expert/, /전국 통합 인물 API 없음/, /public_designated/, /partner_verified/, /Realtor/, /Village lawyer/, /mojmabyun/, /tn_pubr_public_med_office_api/, /LIVON Expert Partner/, /B553077/]) assert.match(docs, re);
});

test('40 existing providers regression: status lists all seven; other providers’ params untouched', async () => {
  const h = handler({ ...ENV, KAKAO_REST_API_KEY: 'kakao-key-123', TOURAPI_SERVICE_KEY: 'tour-key-1234' }, upstream({ other: () => reply('{}') }));
  const st = (await call(h, '/api/livon/data?action=status')).json().providers;
  assert.deepEqual(Object.keys(st), ['kr-youth-policy', 'kr-business-support', 'kr-business-event', 'kr-kakao-place', 'kr-tourapi', 'kr-lifelong-class', 'kr-public-tax-expert', 'kr-job-training']);
  assert.equal(st['kr-lifelong-class'].configured, true); assert.equal(st['kr-public-tax-expert'].configured, true);
  assert.equal((await call(h, '/api/livon/data?provider=kr-lifelong-class&query=' + encodeURIComponent('요가') + '&method=online')).statusCode !== 400, true);
  assert.equal((await call(h, '/api/livon/data?provider=kr-kakao-place&region=' + encodeURIComponent('대구') + '&query=a')).statusCode, 400);
});
