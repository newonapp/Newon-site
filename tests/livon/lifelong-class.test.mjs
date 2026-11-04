// 전국평생학습강좌표준데이터 (kr-lifelong-class): adapter, route, normalization and LIVON integration.
// No real key is used. Fixtures ([QA 픽스처]) use only the output fields listed on the 공공데이터포털 OpenAPI tab.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as lc from '../../server/livon/data/providers/lifelong-class.mjs';
import { createDataHandler, PROVIDERS } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const root = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const KEY = 'pd-test-key+DO/NOT=LEAK-7171';
const ENV = { PUBLIC_DATA_SERVICE_KEY: KEY };
const day = n => new Date(Date.now() + n * 864e5 + 9 * 3600e3).toISOString().slice(0, 10);
const Q = s => '/api/livon/data?provider=kr-lifelong-class' + (s ? '&' + s : '');

const row = (o = {}) => Object.assign({
  lctreNm: '[QA 픽스처] 성인 요가 A', instrctrNm: '김수미', edcStartDay: day(10), edcEndDay: day(70), edcStartTime: '10:10', edcColseTime: '10:50',
  lctreCo: '성인을 위한 요가 과정 A', edcTrgetType: '시민', edcMthType: '오프라인', operDay: '월+화+목', edcPlace: '3층 풍물연습실', psncpa: '15', lctreCost: '90000',
  edcRdnmadr: '경상남도 거제시 계룡로 175', operInstitutionNm: '거제시청소년수련관', operPhoneNumber: '055-639-8162',
  rceptStartDate: day(-3), rceptEndDate: day(5), rceptMthType: '온라인', slctnMthType: '선착순', homepageUrl: 'https://www.gmdc.co.kr/_gjyc/',
  oadtCtLctreYn: 'N', pntBankAckestYn: 'N', lrnAcnutAckestYn: 'N', referenceDate: '2026-07-14', instt_code: '5310000'
}, o);
const ok = (rows, total = rows.length) => JSON.stringify({ response: { header: { resultCode: '00', resultMsg: 'NORMAL SERVICE.' }, body: { items: rows, totalCount: total, numOfRows: 1000, pageNo: 1 } } });
const gwError = (name, code) => `<OpenAPI_ServiceResponse><cmmMsgHeader><errMsg>SERVICE ERROR</errMsg><returnAuthMsg>${name}</returnAuthMsg><returnReasonCode>${code}</returnReasonCode></cmmMsgHeader></OpenAPI_ServiceResponse>`;

function upstream(handler) {
  const calls = [];
  const fetcher = async (url, init = {}) => { const u = new URL(url); calls.push({ url: u, init }); if (u.origin !== 'https://api.data.go.kr' && u.origin !== 'https://www.bizinfo.go.kr') throw new Error('unexpected host'); return handler(u, init); };
  return { fetcher, calls };
}
const reply = (text, { status = 200 } = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => 'application/json' }, text: async () => text });
function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } }; r.json = () => JSON.parse(r.body); return r; }
async function call(h, url, method = 'GET', init = {}) { const r = res(); await h({ method, url, headers: init.headers || {}, body: init.body }, r); return r; }
const handler = (env, up, extra = {}) => createDataHandler({ env, fetcher: up.fetcher, cache: extra.cache || memoryCache(), log: extra.log || (() => {}) });
const S = () => globalThis.LivonDataSchema;
const E = (o, at = new Date().toISOString()) => S().validateEntity(lc.toEntity(row(o), at)).entity;

/* ───────── server ───────── */
test('2 auth / no key: configured=false, NOT_CONFIGURED, zero upstream calls', async () => {
  const up = upstream(() => reply(ok([row()])));
  const h = handler({}, up);
  assert.deepEqual((await call(h, '/api/livon/data?action=status')).json().providers['kr-lifelong-class'], { configured: false, entityTypes: ['program'] });
  assert.equal((await call(h, Q())).json().code, 'NOT_CONFIGURED');
  assert.equal((await call(h, Q('region=' + encodeURIComponent('서울시')))).statusCode, 400, 'bad params still 400');
  assert.equal(up.calls.length, 0);
});

test('3 secret non-exposure on every path', async () => {
  const logs = [];
  for (const p of [() => { throw new Error('x ' + KEY); }, () => reply(gwError('SERVICE_KEY_IS_NOT_REGISTERED_ERROR', '30') + KEY), () => reply('<html>' + KEY, { status: 500 }), () => reply(ok([row()]))]) {
    const r = await call(handler(ENV, upstream(p), { log: (...a) => logs.push(a.join(' ')) }), Q());
    assert.doesNotMatch(r.body, /DO\/NOT|DO%2FNOT|serviceKey|NOT_REGISTERED|OpenAPI_ServiceResponse/);
  }
  assert.ok(logs.every(l => !/DO\/NOT|serviceKey/.test(l)));
});

test('4 pagination: bounded window (≤3 pages × 1000), stops at totalCount/empty page; LIVON page/limit over the window', async () => {
  const up = upstream(u => { const p = +u.searchParams.get('pageNo'); return reply(ok(p <= 5 ? [row({ lctreNm: '[QA 픽스처] 강좌 ' + p, edcPlace: 'R' + p })] : [], 99999)); });
  const all = await lc.fetchAll({ key: KEY, fetcher: up.fetcher });
  assert.equal(up.calls.length, 3, 'never more than MAX_PAGES upstream pages'); assert.equal(all.length, 3);
  const two = upstream(u => reply(ok(+u.searchParams.get('pageNo') === 1 ? [row()] : [], 1)));
  await lc.fetchAll({ key: KEY, fetcher: two.fetcher });
  assert.equal(two.calls.length, 1, 'totalCount reached');
  const h = handler(ENV, upstream(() => reply(ok(Array.from({ length: 30 }, (_, i) => row({ lctreNm: '[QA 픽스처] 강좌' + i, edcPlace: 'P' + i }))))));
  const p1 = (await call(h, Q('page=1&limit=20'))).json(); const p2 = (await call(h, Q('page=2&limit=20'))).json();
  assert.equal(p1.items.length, 20); assert.equal(p1.hasMore, true); assert.equal(p2.items.length, 10); assert.equal(p2.cached, true);
  assert.equal((await call(h, Q('page=0'))).statusCode, 400); assert.equal((await call(h, Q('limit=abc'))).statusCode, 400);
});

test('5-8 keyword, region, method and "모집중" filters run on the cached window (one upstream load)', async () => {
  const rows = [row(), row({ lctreNm: '[QA 픽스처] 일본어 회화', lctreCo: '회화', edcRdnmadr: '서울특별시 종로구 1', edcMthType: '온라인', edcPlace: 'A' }),
    row({ lctreNm: '[QA 픽스처] 스마트폰 교실', lctreCo: '스마트폰 기초', edcRdnmadr: '서울특별시 중구 2', rceptStartDate: '', rceptEndDate: '', edcPlace: 'B', edcMthType: '혼합' }),
    row({ lctreNm: '[QA 픽스처] 마감된 요가', rceptStartDate: day(-20), rceptEndDate: day(-2), edcPlace: 'C' })];
  const up = upstream(() => reply(ok(rows)));
  const h = handler(ENV, up);
  const t = q => (call(h, Q(q))).then(r => r.json().items.map(e => e.title));
  assert.deepEqual(await t('query=' + encodeURIComponent('요가')), ['[QA 픽스처] 성인 요가 A', '[QA 픽스처] 마감된 요가']);
  assert.deepEqual(await t('region=' + encodeURIComponent('서울')), ['[QA 픽스처] 일본어 회화', '[QA 픽스처] 스마트폰 교실']);
  assert.deepEqual(await t('method=online'), ['[QA 픽스처] 일본어 회화', '[QA 픽스처] 스마트폰 교실'], 'online + 혼합(both)');
  assert.deepEqual(await t('method=offline&query=' + encodeURIComponent('요가')), ['[QA 픽스처] 성인 요가 A', '[QA 픽스처] 마감된 요가']);
  assert.deepEqual(await t('status=open'), ['[QA 픽스처] 성인 요가 A', '[QA 픽스처] 일본어 회화'], 'no dates → never 모집중; closed excluded');
  assert.equal(up.calls.length, 1, 'filters never trigger new upstream calls');
  for (const q of ['query=' + 'a'.repeat(51), 'query=' + encodeURIComponent('<x>'), 'region=Seoul', 'method=mobile', 'status=closed', 'lat=1', 'category=01', 'url=https://evil.example']) {
    assert.equal((await call(h, Q(q))).statusCode, 400, q);
  }
});

test('9 normalization: documented fields only → existing program entity', () => {
  const e = E();
  assert.equal(e.type, 'program'); assert.equal(e.provider, 'kr-lifelong-class');
  assert.equal(e.title, '[QA 픽스처] 성인 요가 A'); assert.equal(e.summary, '성인을 위한 요가 과정 A');
  assert.equal(e.organizer, '거제시청소년수련관'); assert.equal(e.instructor, '김수미'); assert.equal(e.eligibility, '시민'); assert.equal(e.format, '오프라인');
  assert.equal(e.venue, '3층 풍물연습실'); assert.equal(e.days, '월+화+목'); assert.equal(e.timeText, '10:10~10:50');
  assert.equal(e.capacity, 15); assert.equal(e.pricing.amount, 90000); assert.equal(e.pricing.type, 'unknown');
  assert.equal(e.applyMethod, '온라인'); assert.equal(e.selectionMethod, '선착순');
  assert.equal(e.metadata.referenceDate, '2026-07-14'); assert.equal(e.metadata.insttCode, '5310000'); assert.equal(e.metadata.methodMode, 'offline');
  assert.equal(e.category, null, 'the dataset has no 분류 field'); assert.deepEqual([...e.lifeStages], []);
});

test('10 id: composite hash of official fields; stable across refreshes; no instructor name inside; distinct courses differ', () => {
  const a = lc.toEntity(row(), 'x'), b = lc.toEntity(row({ referenceDate: '2026-09-01', lctreCo: '설명 수정' }), 'y');
  assert.match(a.providerId, /^lc[0-9a-f]{24}$/); assert.equal(a.providerId, b.providerId, 'same course after a data update → same id');
  assert.equal(lc.toEntity(row({ instrctrNm: '다른 강사' }), 'x').providerId, a.providerId, 'instructor not part of the key');
  assert.notEqual(lc.toEntity(row({ edcStartTime: '11:00' }), 'x').providerId, a.providerId);
  assert.equal(lc.toEntity(row({ lctreNm: '' }), 'x'), null); assert.equal(lc.toEntity(row({ operInstitutionNm: '' }), 'x'), null);
});

test('20-21 unsafe URL and unsafe text', () => {
  for (const u of ['javascript:alert(1)', 'https://user:pw@evil.example', 'data:text/html,x', 'https://localhost']) assert.equal(lc.webUrl(u), '', u);
  const e = E({ lctreNm: '<b>[QA 픽스처] 요가</b><script>alert(1)</script>', lctreCo: '<img src=x onerror=alert(1)>설명' });
  assert.equal(e.title, '[QA 픽스처] 요가'); assert.equal(e.summary, '설명'); assert.doesNotMatch(JSON.stringify(e), /alert|onerror|[<>]/);
});

test('22 category mapping: none invented (no 분류 field); Explore mode from 교육방법구분 only', () => {
  assert.deepEqual(['오프라인', '온라인', '혼합', '우편통신', '모바일'].map(m => E({ edcMthType: m }).metadata.methodMode || ''), ['offline', 'online', 'both', '', '']);
  assert.equal(E().category, null);
});

test('37-39 zero results, timeout, upstream failure, quota → fixed codes', async () => {
  const zero = (await call(handler(ENV, upstream(() => reply(JSON.stringify({ response: { header: { resultCode: '03', resultMsg: 'NODATA_ERROR' } } })))), Q())).json();
  assert.deepEqual(zero.items, []); assert.equal(zero.total, 0);
  const t = await call(handler(ENV, upstream(() => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }); })), Q());
  assert.equal(t.statusCode, 504);
  for (const [text, st, want, code] of [[gwError('LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR', '22'), 200, 503, 'UPSTREAM_LIMIT'], [gwError('SERVICETIMEOUT_ERROR', '05'), 200, 504, 'TIMEOUT'],
    [gwError('UNREGISTERED_IP_ERROR', '32'), 200, 502, 'UPSTREAM_ERROR'], ['<html></html>', 500, 502, 'UPSTREAM_ERROR'], ['{"x":1}', 200, 502, 'UPSTREAM_ERROR'], ['', 200, 502, 'UPSTREAM_ERROR']]) {
    const r = await call(handler(ENV, upstream(() => reply(text, { status: st }))), Q());
    assert.equal(r.statusCode, want, text.slice(0, 40)); assert.equal(r.json().code, code);
  }
});

test('cache: one load per window within the TTL (program TTL from config); failures not cached', async () => {
  let n = 0; const ttls = [];
  const cache = memoryCache(); const set = cache.set.bind(cache); cache.set = (k, v, t) => { ttls.push(t); return set(k, v, t); };
  const h = handler(ENV, upstream(() => (++n === 1 ? reply('', { status: 500 }) : reply(ok([row()])))), { cache });
  assert.equal((await call(h, Q())).statusCode, 502);
  await call(h, Q()); await call(h, Q('query=' + encodeURIComponent('요가')));
  assert.equal(n, 2); assert.deepEqual(ttls, [24 * 3600e3]);
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
  const saves = new Map(), todos = [];
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, x), removeSave: id => saves.delete(id), _saves: saves };
  ctx.LivonMyLife = { api: { saveTodo: t => { const dup = todos.find(x => x.title === t.title && !x.done); if (dup) return { status: 'duplicate', dup }; todos.push(t); return { status: 'ok', item: t }; } }, _todos: todos };
  for (const f of ['data/livon-data-config.js', 'data/livon-data-schema.js', 'data/livon-data-core.js', 'data/livon-data-providers.js', 'explore-search.js']) vm.runInContext(read(f), ctx);
  return ctx;
}
const rowsDefault = () => [row(), row({ lctreNm: '[QA 픽스처] 쉽게 배우는 스마트폰', lctreCo: '스마트폰 활용법', edcRdnmadr: '서울특별시 중구 2', edcPlace: 'B', homepageUrl: 'http://sjlib.gne.go.kr', lctreCost: '0' }),
  row({ lctreNm: '[QA 픽스처] 창업 교육', lctreCo: '창업 기초', edcPlace: 'C', homepageUrl: '' })];
async function loaded({ env = ENV, rows = rowsDefault(), extra = {} } = {}) {
  const up = upstream(u => reply(u.origin === 'https://api.data.go.kr' ? ok(rows) : JSON.stringify({ jsonArray: { item: extra.bizRows || [] } })));
  const h = handler(env, up);
  const ctx = browser((url, init = {}) => call(h, url, init.method || 'GET', init));
  await new Promise(r => setTimeout(r, 30));
  await ctx.LivonData.repository.refresh({ force: true });
  return { ctx, D: ctx.LivonData, up };
}
const ours = D => D.repository.list({ includeExpired: true }).filter(e => e.provider === 'kr-lifelong-class');

test('35-36 no fake availability / popularity / rating / reviews anywhere in the adapter output or UI copy', () => {
  const e = E();
  assert.doesNotMatch(JSON.stringify(e, (k, v) => (v === null ? undefined : v)), /rating|review|popular|seats|remaining|availability|applicants/i);
  const docs = root('docs/livon/real-data-providers.md');
  assert.match(docs, /kr-lifelong-class/); assert.match(docs, /tn_pubr_public_lftm_lrn_lctre_api/);
});
