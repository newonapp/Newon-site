// 온통청년 청년정책 provider (kr-youth-policy): server route, adapter, normalization and LIVON integration.
// No real API key is used; upstream responses are fixtures built from the documented field names.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as youth from '../../server/livon/data/providers/youthcenter.mjs';
import { createDataHandler, PROVIDERS, LIMITS } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const KEY = 'test-key-DO-NOT-LEAK-1234';
const ymdOf = n => { const d = new Date(Date.now() + n * 864e5 + 9 * 3600e3); return d.toISOString().slice(0, 10).replace(/-/g, ''); };

/* documented fields only (oaiDoc › 청년정책 출력결과) */
const row = (o = {}) => Object.assign({
  plcyNo: 'R2026010100001', plcyNm: '청년 월세 한시 특별지원', plcyKywdNm: '월세,주거지원',
  plcyExplnCn: '무주택 청년에게 월세를 지원합니다.', lclsfNm: '주거', mclsfNm: '주거비 지원', plcySprtCn: '월 최대 20만원, 최대 12개월',
  sprvsnInstCdNm: '국토교통부', operInstCdNm: '주택도시보증공사', aplyUrlAddr: 'https://www.bokjiro.go.kr/', refUrlAddr1: 'https://www.molit.go.kr/',
  sprtTrgtMinAge: '19', sprtTrgtMaxAge: '34', sprtTrgtAgeLmtYn: 'Y', earnEtcCn: '기준 중위소득 60% 이하', addAplyQlfcCndCn: '무주택자',
  aplyYmd: `${ymdOf(-30)} ~ ${ymdOf(60)}`, zipCd: '11000,26000,27000,28000,29000,30000,31000,36110,41000,51000,43000,44000,52000,46000,47000,48000,50000',
  frstRegDt: '2026-01-02 09:00:00', lastMdfcnDt: '2026-09-20 10:30:00', inqCnt: '99999', sprvsnInstCd: 'B551234'
}, o);
const jsonBody = (rows, extra = {}) => JSON.stringify({ resultCode: 200, result: Object.assign({ pagging: { totCount: rows.length, pageNum: 1, pageSize: 100 }, youthPolicyList: rows }, extra) });
const xmlBody = rows => '<?xml version="1.0" encoding="UTF-8"?><result><totCount>' + rows.length + '</totCount><youthPolicyList>' +
  rows.map(r => '<youthPolicy>' + Object.entries(r).map(([k, v]) => `<${k}><![CDATA[${v}]]></${k}>`).join('') + '</youthPolicy>').join('') + '</youthPolicyList></result>';

function upstream(handler) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    calls.push(String(url));
    if (!String(url).startsWith(youth.UPSTREAM + '?')) throw new Error('unexpected host ' + url);
    return handler(new URL(url), init);
  };
  return { fetcher, calls };
}
const reply = (body, { status = 200, type = 'application/json' } = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => type }, text: async () => body });
function res() {
  const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; this.done = true; } };
  r.json = () => JSON.parse(r.body);
  return r;
}
async function call(handler, url, method = 'GET') { const r = res(); await handler({ method, url, headers: {} }, r); return r; }

test('official contract: fixed upstream URL, documented parameters, key only server-side', () => {
  assert.equal(youth.UPSTREAM, 'https://www.youthcenter.go.kr/go/ythip/getPlcy');
  assert.equal(youth.ENV_KEY, 'YOUTHCENTER_API_KEY');
  const u = new URL(youth.requestUrl('K', { pageNum: 3, pageSize: 50 }));
  assert.deepEqual([...u.searchParams.keys()], ['apiKeyNm', 'pageNum', 'pageSize', 'pageType', 'rtnType']);
  assert.equal(u.searchParams.get('rtnType'), 'json');
  for (const f of ['livon-data-config.js', 'livon-data-core.js', 'livon-data-providers.js', 'livon-data-schema.js']) {
    const src = read('data/' + f);
    assert.doesNotMatch(src, /apiKeyNm|getPlcy|YOUTHCENTER_API_KEY/, f + ' (browser) never touches the key or the upstream URL');
  }
});

test('disabled without key: status reports false, list is NOT_CONFIGURED, no upstream call, app unaffected', async () => {
  const up = upstream(() => reply(jsonBody([row()])));
  const h = createDataHandler({ env: {}, fetcher: up.fetcher, cache: memoryCache(), log: () => {} });
  const s = await call(h, '/api/livon/data?action=status');
  assert.equal(s.statusCode, 200);
  assert.deepEqual(s.json().providers['kr-youth-policy'].configured, false);
  const l = await call(h, '/api/livon/data?provider=kr-youth-policy');
  assert.equal(l.statusCode, 503); assert.equal(l.json().code, 'NOT_CONFIGURED');
  assert.equal(up.calls.length, 0);
  assert.equal(PROVIDERS['kr-youth-policy'].configured({ YOUTHCENTER_API_KEY: '  ' }), false);
});

test('security: allowlist, GET only, strict params, page/limit bounds, no arbitrary URL', async () => {
  const up = upstream(() => reply(jsonBody([row()])));
  const h = createDataHandler({ env: { YOUTHCENTER_API_KEY: KEY }, fetcher: up.fetcher, cache: memoryCache(), log: () => {} });
  assert.equal((await call(h, '/api/livon/data?provider=kr-youth-policy', 'POST')).statusCode, 405);
  assert.equal((await call(h, '/api/livon/data?provider=evil')).json().code, 'UNKNOWN_PROVIDER');
  assert.equal((await call(h, '/api/livon/data?provider=__proto__')).json().code, 'UNKNOWN_PROVIDER');
  assert.equal((await call(h, '/api/livon/data?provider=kr-youth-policy&url=https://evil.example')).json().code, 'BAD_REQUEST');
  assert.equal((await call(h, '/api/livon/data?action=proxy&provider=kr-youth-policy')).json().code, 'BAD_REQUEST');
  assert.equal((await call(h, '/api/livon/data?provider=kr-youth-policy&page=-1')).statusCode, 400);
  assert.equal((await call(h, '/api/livon/data?provider=kr-youth-policy&limit=abc')).statusCode, 400);
  const big = await call(h, '/api/livon/data?provider=kr-youth-policy&page=9999&limit=9999');
  assert.equal(big.statusCode, 200); assert.equal(big.json().limit, LIMITS.maxLimit); assert.equal(big.json().page, LIMITS.maxPage);
  up.calls.forEach(u => assert.ok(u.startsWith('https://www.youthcenter.go.kr/go/ythip/getPlcy?'), 'only the documented upstream'));
});

test('API key never appears in responses or logs, even on upstream errors', async () => {
  const logs = [];
  for (const failing of [
    () => reply('<html>error for ' + KEY + '</html>', { status: 500, type: 'text/html' }),
    () => { throw new Error('connect failed ' + KEY); },
    () => reply('not json ' + KEY, { type: 'text/plain' })
  ]) {
    const up = upstream(failing);
    const h = createDataHandler({ env: { YOUTHCENTER_API_KEY: KEY }, fetcher: up.fetcher, cache: memoryCache(), log: (...a) => logs.push(a.join(' ')) });
    const r = await call(h, '/api/livon/data?provider=kr-youth-policy');
    assert.equal(r.statusCode, 502); assert.equal(r.json().code, 'UPSTREAM_ERROR');
    assert.doesNotMatch(r.body, new RegExp(KEY + '|html|youthcenter'), 'no key, upstream body or URL in the response');
  }
  assert.ok(logs.length);
  logs.forEach(l => assert.doesNotMatch(l, new RegExp(KEY + '|youthcenter|apiKeyNm')));
});

test('timeout: a hanging upstream becomes TIMEOUT (504) and the next request can try again', async () => {
  const keepAlive = setTimeout(() => {}, 2000); /* AbortSignal.timeout timers are unref'd */
  await assert.rejects(youth.fetchAll({ key: KEY, fetcher: (u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(Object.assign(new Error('t'), { name: 'TimeoutError' })))), timeoutMs: 30 }), e => e.code === 'TIMEOUT');
  clearTimeout(keepAlive);
  let n = 0;
  const up = upstream(() => { n++; if (n === 1) throw Object.assign(new Error('slow'), { name: 'TimeoutError' }); return reply(jsonBody([row()])); });
  const h = createDataHandler({ env: { YOUTHCENTER_API_KEY: KEY }, fetcher: up.fetcher, cache: memoryCache(), log: () => {} });
  assert.equal((await call(h, '/api/livon/data?provider=kr-youth-policy')).statusCode, 504);
  const ok = await call(h, '/api/livon/data?provider=kr-youth-policy');
  assert.equal(ok.statusCode, 200, 'failure was not cached');
});

test('JSON and XML responses normalize to the same LIVON policy entity (raw codes/popularity dropped)', async () => {
  const r = row();
  const fromJson = youth.parseBody(jsonBody([r]), 'application/json');
  const fromXml = youth.parseBody(xmlBody([r]), 'application/xml');
  assert.equal(fromJson.rows.length, 1); assert.equal(fromXml.rows.length, 1); assert.equal(fromJson.total, 1); assert.equal(fromXml.total, 1);
  const at = new Date().toISOString();
  const a = youth.toEntity(fromJson.rows[0], at), b = youth.toEntity(fromXml.rows[0], at);
  assert.deepEqual(a, b);
  assert.equal(a.provider, 'kr-youth-policy'); assert.equal(a.providerId, 'R2026010100001');
  assert.equal(a.agency, '국토교통부'); assert.equal(a.benefits, '월 최대 20만원, 최대 12개월');
  assert.equal(a.applicationUrl, 'https://www.bokjiro.go.kr/'); assert.equal(a.officialSource, 'https://www.molit.go.kr/');
  assert.equal(a.jurisdiction, '전국');
  assert.match(a.eligibility, /만 19~34세 · 기준 중위소득 60% 이하 · 무주택자/);
  assert.equal(a.source.providerName, '온통청년'); assert.equal(a.source.license, '온통청년 오픈API (한국고용정보원)');
  assert.equal(a.source.updatedAt, '2026-09-20T01:30:00.000Z');
  const flat = JSON.stringify(a);
  assert.doesNotMatch(flat, /99999|inqCnt|B551234|sprvsnInstCd"/, 'view counts and raw codes are not carried');
  // wrapper variants the parser tolerates
  assert.equal(youth.parseBody(JSON.stringify({ youthPolicyList: [r] })).rows.length, 1);
  assert.equal(youth.parseBody(JSON.stringify({ result: { youthPolicyList: { youthPolicy: [r, row({ plcyNo: 'X2' })] } } })).rows.length, 2);
  assert.throws(() => youth.parseBody('<!doctype html><p>점검 중</p>x', 'text/html'), e => e.code === 'PARSE');
  assert.throws(() => youth.parseBody(JSON.stringify({ resultCode: 401, message: 'invalid key' })), e => e.code === 'PARSE', 'unexpected shape is an error, not zero results');
  assert.equal(youth.parseBody(JSON.stringify({ result: { youthPolicyList: [] } })).rows.length, 0, 'documented list, empty → real zero');
  assert.throws(() => youth.parseBody('{broken', 'application/json'), e => e.code === 'PARSE');
});

test('category mapping: API category names → LIVON category + interests (unknown → nothing)', () => {
  const m = x => youth.mapCategory(x);
  assert.deepEqual(m({ lclsfNm: '일자리', mclsfNm: '창업' }), { category: '창업', interests: ['창업', '사업', '커리어', '취업', '일자리', '이직'] });
  assert.equal(m({ lclsfNm: '주거' }).category, '주거');
  assert.equal(m({ lclsfNm: '교육', mclsfNm: '미래역량강화' }).category, '교육');
  assert.equal(m({ lclsfNm: '복지문화' }).category, '문화');
  assert.equal(m({ lclsfNm: '참여권리' }).category, '참여');
  assert.deepEqual(m({ lclsfNm: '알수없는분류' }), { category: null, interests: [] });
});

test('age → life stages: real age range only; no limit or unreadable → no stage', () => {
  const st = o => youth.lifeStagesForAge(row(o));
  assert.deepEqual(st({}), ['10', '20', '30']);
  assert.deepEqual(st({ sprtTrgtMinAge: '20', sprtTrgtMaxAge: '29' }), ['20']);
  assert.deepEqual(st({ sprtTrgtMinAge: '18', sprtTrgtMaxAge: '39' }), ['10', '20', '30']);
  assert.deepEqual(st({ sprtTrgtAgeLmtYn: 'N' }), []);
  assert.deepEqual(st({ sprtTrgtMinAge: '0', sprtTrgtMaxAge: '0' }), []);
  assert.deepEqual(st({ sprtTrgtMinAge: '', sprtTrgtMaxAge: '34' }), []);
  assert.deepEqual(st({ sprtTrgtMinAge: '40', sprtTrgtMaxAge: '20' }), []);
  assert.deepEqual(st({ sprtTrgtMinAge: '1', sprtTrgtMaxAge: '120' }), [], 'everyone → not a stage signal');
});

/* browser side: data layer + fake server responses */
function browser({ server }) {
  const mem = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; } }; };
  const ctx = { console, URL, setTimeout, clearTimeout, Promise, AbortController, localStorage: mem(), sessionStorage: mem(), location: { protocol: 'https:', hash: '' } };
  ctx.window = ctx;
  ctx.fetch = async url => {
    const r = await server(String(url));
    return { ok: r.statusCode === 200, status: r.statusCode, json: async () => JSON.parse(r.body) };
  };
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
async function loaded(rows, env = { YOUTHCENTER_API_KEY: KEY }) {
  const up = upstream(() => reply(jsonBody(rows)));
  const h = createDataHandler({ env, fetcher: up.fetcher, cache: memoryCache(), log: () => {} });
  const ctx = browser({ server: url => call(h, url) });
  await new Promise(r => setTimeout(r, 30)); /* start(): builtin refresh + server probe + provider refresh */
  await ctx.LivonData.repository.refresh({ force: true });
  return { ctx, D: ctx.LivonData, up };
}
const policies = () => [
  row(),
  row({ plcyNo: 'S1', plcyNm: '청년 창업 사업화 지원', lclsfNm: '일자리', mclsfNm: '창업', plcyKywdNm: '창업,사업화', sprtTrgtMinAge: '20', sprtTrgtMaxAge: '39', refUrlAddr1: 'https://www.k-startup.go.kr/', aplyUrlAddr: '' }),
  row({ plcyNo: 'OLD', plcyNm: '지난 청년 면접정장 대여', lclsfNm: '일자리', mclsfNm: '취업', aplyYmd: `${ymdOf(-90)} ~ ${ymdOf(-3)}` }),
  row({ plcyNo: 'NOAGE', plcyNm: '주민 누구나 주거 상담', sprtTrgtAgeLmtYn: 'N', sprtTrgtMinAge: '0', sprtTrgtMaxAge: '0' })
];

test('browser: provider switches on only when the server reports it configured; without key nothing loads', async () => {
  const off = await loaded(policies(), {});
  const p = off.D.registry.get('kr-youth-policy');
  assert.equal(p.enabled, false); assert.equal(p.status, 'planned');
  assert.equal(off.D.external(off.D.repository.list()).length, 0);
  assert.equal(off.up.calls.length, 0);
  const on = await loaded(policies());
  const q = on.D.registry.get('kr-youth-policy');
  assert.equal(q.enabled, true); assert.equal(q.status, 'active');
  assert.equal(on.D.external(on.D.repository.list({ includeExpired: true })).length, 4);
});

test('freshness + attribution: deadline passed → expired; update date is not a verification; official links kept', async () => {
  const { D } = await loaded(policies());
  const all = D.repository.list({ includeExpired: true }).filter(e => e.provider === 'kr-youth-policy');
  const old = all.find(e => e.providerId === 'OLD'), cur = all.find(e => e.providerId === 'R2026010100001');
  assert.equal(D.freshness(old), 'expired'); assert.equal(D.action(old).label, '공식 안내 보기', 'no apply button after the deadline');
  assert.equal(D.freshness(cur), 'unknown', 'fetched/updated dates never make a policy "verified"');
  assert.equal(cur.lastVerifiedAt, null);
  assert.equal(D.action(cur).label, '공식 신청 페이지로 이동'); assert.equal(D.action(cur).url, 'https://www.bokjiro.go.kr/');
  const att = D.attribution(cur);
  assert.equal(att.text, '출처: 온통청년(한국고용정보원)');
  assert.equal(att.sourceUrl, 'https://www.molit.go.kr/');
  const html = D.ui.list([cur], D.ui.note('policy'), 'life');
  assert.match(html, /정책·지원 · 온통청년/); assert.match(html, /출처 업데이트 2026\.09\.20/); assert.match(html, /원문 보기/);
  assert.doesNotMatch(html, /LIVON 정책|LIVON 인증/);
  assert.equal(D.repository.search('면접정장').length, 0, 'expired policies hidden from default lists');
});

test('Explore: youth policies are searchable by title/summary/agency/category/region/tags under 정책·지원', async () => {
  const { ctx } = await loaded(policies());
  const S = ctx.LivonSearch;
  const keysFor = q => S.search(q).items.filter(x => String(x.item.key).startsWith('ext:kr-youth-policy')).map(x => x.item.key);
  assert.ok(keysFor('월세').length, 'title');
  assert.ok(keysFor('무주택').length, 'summary');
  assert.ok(keysFor('국토교통부').length, 'agency');
  assert.ok(keysFor('사업화').length, 'tags');
  const r = S.search('월세', { type: 'policy' });
  assert.ok(r.items.every(x => x.item.type === 'policy'));
  assert.ok(r.items.some(x => x.item.key === 'ext:kr-youth-policy:policy:R2026010100001'));
  // existing ranking kept: LIVON topics still lead a generic query
  const first = S.search('주거').items[0].item;
  assert.notEqual(String(first.key).slice(0, 4), 'ext:', 'real data does not jump ahead of LIVON topics');
});

test('Life Stage: attaches only where life stage AND topic category match', async () => {
  const { D } = await loaded(policies());
  const topic = id => LIFE.topics.find(t => t.id === id);
  const ids = (t) => D.forTopic(t, 'policy').map(e => e.providerId);
  const housing20 = LIFE.topics.find(t => t.lifeStageId === '20' && t.category === '주거');
  const startup20 = LIFE.topics.find(t => t.lifeStageId === '20' && t.category === '창업');
  const housing60 = LIFE.topics.find(t => t.lifeStageId === '60' && /주거/.test(t.category)) || LIFE.topics.find(t => t.lifeStageId === '60');
  const health20 = LIFE.topics.find(t => t.lifeStageId === '20' && t.category === '건강');
  assert.deepEqual([...ids(housing20)], ['R2026010100001']);
  assert.deepEqual([...ids(startup20)], ['S1']);
  assert.deepEqual([...ids(housing60)], [], 'age 19–34 policy is not attached to 60대');
  assert.deepEqual([...ids(health20)], [], 'different category → not attached');
  assert.ok(!ids(housing20).includes('NOAGE'), 'no age information → never attached by guesswork');
  assert.ok(topic('20s.first-independence'));
});

test('Home: related policies only for a matching stage/interest; nothing otherwise', async () => {
  const { D } = await loaded(policies());
  assert.ok(D.forHome({ stage: '20', interests: [] }).policies.length >= 1);
  assert.deepEqual([...D.forHome({ stage: '60', interests: [] }).policies], []);
  assert.deepEqual([...D.forHome({ stage: '', interests: [] }).policies], []);
  assert.equal(D.forHome({ stage: '', interests: ['창업'] }).policies[0].providerId, 'S1');
});

test('My Life: saved youth policy keeps agency, sources, application info and dates in its snapshot', async () => {
  const { ctx, D } = await loaded(policies());
  const id = 'kr-youth-policy:policy:R2026010100001';
  assert.equal(D.save(id), 'saved');
  const snap = ctx.LivonPlatform._saves.get('ext:' + id).data.snapshot;
  assert.equal(snap.title, '청년 월세 한시 특별지원'); assert.equal(snap.agency, '국토교통부');
  assert.equal(snap.officialSource, 'https://www.molit.go.kr/'); assert.equal(snap.applicationUrl, 'https://www.bokjiro.go.kr/');
  assert.ok(snap.applicationPeriod && snap.applicationPeriod.end); assert.equal(snap.updatedAt, '2026-09-20T01:30:00.000Z');
  assert.equal(snap.providerName, '온통청년');
});

test('zero results and upstream failure: honest empty state, never sample policies', async () => {
  const zero = await loaded([]);
  assert.equal(zero.D.external(zero.D.repository.list({ includeExpired: true })).length, 0);
  assert.equal(zero.D.ui.list(zero.D.forHome({ stage: '20' }).policies, '', 'life'), '');
  const up = upstream(() => reply('', { status: 503, type: 'text/plain' }));
  const h = createDataHandler({ env: { YOUTHCENTER_API_KEY: KEY }, fetcher: up.fetcher, cache: memoryCache(), log: () => {} });
  const ctx = browser({ server: url => call(h, url) });
  await new Promise(r => setTimeout(r, 30));
  await ctx.LivonData.repository.refresh({ force: true });
  assert.equal(ctx.LivonData.external(ctx.LivonData.repository.list()).length, 0);
  const st = ctx.LivonData.status().monitor.find(m => m.provider === 'kr-youth-policy');
  assert.equal(st.errorCode, 'HTTP_5XX'); assert.equal(ctx.LivonData.registry.get('kr-youth-policy').status, 'configured');
  assert.ok(ctx.LivonData.repository.size() > 0, 'LIVON curated data still works');
});

test('server cache: one upstream fetch serves later pages; pagination stops on empty page or total', async () => {
  let pages = 0;
  const up = upstream(u => { pages++; const n = Number(u.searchParams.get('pageNum')); return reply(n === 1 ? JSON.stringify({ result: { youthPolicyList: [row(), row({ plcyNo: 'B' })] } }) : n === 2 ? JSON.stringify({ result: { youthPolicyList: [row({ plcyNo: 'C' })] } }) : JSON.stringify({ result: { youthPolicyList: [] } })); });
  const h = createDataHandler({ env: { YOUTHCENTER_API_KEY: KEY }, fetcher: up.fetcher, cache: memoryCache(), log: () => {} });
  const a = (await call(h, '/api/livon/data?provider=kr-youth-policy&page=1&limit=2')).json();
  const b = (await call(h, '/api/livon/data?provider=kr-youth-policy&page=2&limit=2')).json();
  assert.equal(pages, 3, 'pages 1,2 then an empty page 3');
  assert.equal(a.total, 3); assert.equal(a.hasMore, true); assert.equal(a.cached, false);
  assert.equal(b.items.length, 1); assert.equal(b.cached, true); assert.equal(b.hasMore, false);
  let totalCalls = 0;
  const up2 = upstream(() => { totalCalls++; return reply(jsonBody([row()])); });
  const h2 = createDataHandler({ env: { YOUTHCENTER_API_KEY: KEY }, fetcher: up2.fetcher, cache: memoryCache(), log: () => {} });
  await Promise.all([call(h2, '/api/livon/data?provider=kr-youth-policy'), call(h2, '/api/livon/data?provider=kr-youth-policy')]);
  assert.equal(totalCalls, 1, 'concurrent requests share one upstream refresh (total reached → stop)');
});

test('server output passes the shared schema: unsafe text and links from upstream are removed', async () => {
  const up = upstream(() => reply(jsonBody([row({ plcyNm: '<script>alert(1)</script>청년 지원', aplyUrlAddr: 'javascript:alert(1)', refUrlAddr1: 'http://127.0.0.1/admin' })])));
  const h = createDataHandler({ env: { YOUTHCENTER_API_KEY: KEY }, fetcher: up.fetcher, cache: memoryCache(), log: () => {} });
  const out = (await call(h, '/api/livon/data?provider=kr-youth-policy')).json().items[0];
  assert.equal(out.title, '청년 지원');
  assert.equal(out.applicationUrl, null);
  assert.equal(out.officialSource, 'https://www.youthcenter.go.kr/youthPolicy/ythPlcyTotalSearch', 'unsafe official link → 온통청년 official search page, never the raw value');
});
