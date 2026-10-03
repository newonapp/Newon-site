// NEWON backend pre-deployment hardening — Vercel region, /api/livon/data rate limits, Upstash env names, the deployment
// verification script and the runbook. No real keys and no network: upstreams and Redis are fakes. Nothing here is "live".
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { redisRestConfig, redisSource, REDIS_ENV_PAIRS } from '../../server/livon/redis-env.mjs';
import { createDataHandler } from '../../server/livon/data/http.mjs';
import { createServerCache, upstashCache } from '../../server/livon/data/cache.mjs';
import { createDataLimiter, dataLimitMode, dataLimitPolicy, DATA_LIMIT_DEFAULTS, DATA_LIMIT_SCRIPT, clientAddress } from '../../server/livon/data/limit.mjs';
import { protectionConfigured, checkRateLimit } from '../../server/livon/chat.mjs';
import { limitBuckets } from '../../server/livon/ratelimit.mjs';
import { createHealthHandler } from '../../server/livon/health.mjs';
import { verifyDeployment, formatReport, parseOrigin, classifyProvider, STATUS, PROVIDER_CHECKS } from '../../scripts/verify-api-deployment.mjs';

const ROOT = new URL('../../', import.meta.url);
const src = p => readFileSync(new URL(p, ROOT), 'utf8');
const MARK = 'SECRET-MARK-7f3a';
const KEYS = { KAKAO_REST_API_KEY: 'kk-' + MARK, TOURAPI_SERVICE_KEY: 'tr-' + MARK, PUBLIC_DATA_SERVICE_KEY: 'pd-' + MARK };
const SECRET = 'r'.repeat(16) + MARK;                                     /* ≥ 32 chars */
const UP = { UPSTASH_REDIS_REST_URL: 'https://up-' + MARK + '.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'uptok-' + MARK };
const KV = { KV_REST_API_URL: 'https://kv-' + MARK + '.upstash.io', KV_REST_API_TOKEN: 'kvtok-' + MARK };
const PROD = { NODE_ENV: 'production' };

/* ── fake upstreams (shapes from the provider adapters' own tests) ── */
const day = n => new Date(Date.now() + n * 864e5 + 9 * 3600e3).toISOString().slice(0, 10);
const kakaoDoc = i => ({ id: String(26338954 + i), place_name: `[QA] 장소 ${i}`, category_name: '문화,예술 > 문화시설 > 도서관', category_group_code: 'CT1', category_group_name: '문화시설', phone: '02-3153-5800', address_name: '서울 마포구 성산동 370-1', road_address_name: '서울 마포구 성산로 128', x: '126.9084', y: '37.5636', place_url: `http://place.map.kakao.com/${26338954 + i}`, distance: '' });
const kakaoBody = () => JSON.stringify({ meta: { same_name: null, total_count: 2, pageable_count: 2, is_end: true }, documents: [kakaoDoc(0), kakaoDoc(1)] });
const tourItem = i => ({ contentid: String(126508 + i), contenttypeid: '12', title: `[QA] 관광지 ${i}`, addr1: '서울특별시 종로구 사직로 161', addr2: '', zipcode: '03045', mapx: '126.97', mapy: '37.57', mlevel: '6', tel: '02-3700-3900', firstimage: '', firstimage2: '', cpyrhtDivCd: 'Type3', lDongRegnCd: '11', lDongSignguCd: '110', lclsSystm1: 'HS', lclsSystm2: 'HS01', lclsSystm3: 'HS010100', createdtime: '20031105090000', modifiedtime: '20250909101010' });
const tourBody = () => JSON.stringify({ response: { header: { resultCode: '0000', resultMsg: 'OK' }, body: { items: { item: [tourItem(0), tourItem(1)] }, numOfRows: 20, pageNo: 1, totalCount: 2 } } });
const lifeRow = i => ({ lctreNm: `[QA] 강좌 ${i}`, instrctrNm: '김강사', edcStartDay: day(10), edcEndDay: day(70), edcStartTime: '10:00', edcColseTime: '12:00', lctreCo: '강좌 소개', edcTrgetType: '시민', edcMthType: '오프라인', operDay: '화', edcPlace: '2층', psncpa: '20', lctreCost: '0', edcRdnmadr: '서울특별시 종로구 종로 1', operInstitutionNm: '종로구립도서관', operPhoneNumber: '02-000-0000', rceptStartDate: day(-3), rceptEndDate: day(5), rceptMthType: '온라인', slctnMthType: '선착순', homepageUrl: 'https://lib.example.kr/', oadtCtLctreYn: 'N', pntBankAckestYn: 'N', lrnAcnutAckestYn: 'N', referenceDate: '2026-07-14', instt_code: '3000000' });
const lifeBody = () => JSON.stringify({ response: { header: { resultCode: '00', resultMsg: 'NORMAL SERVICE.' }, body: { items: [lifeRow(0), lifeRow(1)], totalCount: 2, numOfRows: 1000, pageNo: 1 } } });
const reply = (text, status = 200) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => 'application/json' }, text: async () => text, json: async () => JSON.parse(text) });

/* a fake Upstash that runs DATA_LIMIT_SCRIPT / BUCKET_SCRIPT-style EVALs and GET/SET, and records what it was sent */
function fakeRedis({ broken = null } = {}) {
  const counters = new Map(), store = new Map(), seen = [];
  const fetcher = async (url, init = {}) => {
    const cmd = JSON.parse(init.body);
    seen.push({ url, auth: init.headers && init.headers.Authorization, cmd });
    if (broken === 'throw') throw new Error('redis down');
    if (broken === '500') return reply('oops', 500);
    if (broken === 'malformed') return reply(JSON.stringify({ result: 'nope' }));
    if (cmd[0] === 'EVAL') {
      const n = Number(cmd[2]); const keys = cmd.slice(3, 3 + n); const argv = cmd.slice(3 + n).map(Number);
      for (let i = 0; i < n; i++) if ((counters.get(keys[i]) || 0) >= argv[i * 2]) return reply(JSON.stringify({ result: [0, argv[i * 2 + 1], i + 1] }));
      keys.forEach(k => counters.set(k, (counters.get(k) || 0) + 1));
      return reply(JSON.stringify({ result: [1, 0, 0] }));
    }
    if (cmd[0] === 'GET') return reply(JSON.stringify({ result: store.has(cmd[1]) ? store.get(cmd[1]) : null }));
    if (cmd[0] === 'SET') { store.set(cmd[1], cmd[2]); return reply(JSON.stringify({ result: 'OK' })); }
    return reply(JSON.stringify({ result: null }));
  };
  return { fetcher, counters, seen };
}
/* upstream router: provider hosts → fake bodies; anything else (Redis) → the given redis fetcher */
function router(redis, calls) {
  return async (url, init) => {
    const u = new URL(url);
    if (u.hostname.endsWith('upstash.io')) return redis ? redis.fetcher(url, init) : reply('no redis', 500);
    calls.push(u.hostname + u.pathname);
    if (u.hostname === 'dapi.kakao.com') return reply(kakaoBody());
    if (u.pathname.includes('KorService2')) return reply(tourBody());
    return reply(lifeBody());
  };
}
function fakeRes() { return { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = String(v); }, end(b) { this.body = b || ''; } }; }
async function get(handler, path, ip = '203.0.113.7', extra = {}) {
  const res = fakeRes();
  await handler({ method: 'GET', url: path, headers: { host: 'api.example.test', 'x-vercel-forwarded-for': ip, ...extra }, socket: { remoteAddress: ip } }, res);
  return { status: res.statusCode, headers: res.headers, body: JSON.parse(res.body || 'null'), raw: res.body };
}
const kq = q => '/api/livon/data?provider=kr-kakao-place&query=' + encodeURIComponent(q) + '&limit=1';
const tq = q => '/api/livon/data?provider=kr-tourapi&query=' + encodeURIComponent(q) + '&limit=1';

/* ───────── 1. Upstash env names ───────── */
test('BD-1 Upstash REST config: UPSTASH_* or KV_REST_API_*, complete pairs only, UPSTASH first, never mixed', () => {
  assert.deepEqual(REDIS_ENV_PAIRS.map(p => [p.url, p.token]), [['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'], ['KV_REST_API_URL', 'KV_REST_API_TOKEN']]);
  assert.equal(redisRestConfig({}), null);
  assert.deepEqual(redisRestConfig(UP), { url: UP.UPSTASH_REDIS_REST_URL, token: UP.UPSTASH_REDIS_REST_TOKEN, source: 'upstash' });
  assert.deepEqual(redisRestConfig(KV), { url: KV.KV_REST_API_URL, token: KV.KV_REST_API_TOKEN, source: 'kv' });
  assert.equal(redisRestConfig({ ...KV, ...UP }).source, 'upstash', 'both present → UPSTASH_* wins, deterministically');
  /* an incomplete or non-https UPSTASH pair is skipped as a whole; its URL is never paired with the KV token */
  for (const half of [{ UPSTASH_REDIS_REST_URL: UP.UPSTASH_REDIS_REST_URL }, { UPSTASH_REDIS_REST_TOKEN: 'x' }, { UPSTASH_REDIS_REST_URL: 'http://plain.example', UPSTASH_REDIS_REST_TOKEN: 'x' }]) {
    assert.deepEqual(redisRestConfig({ ...half, ...KV }), { url: KV.KV_REST_API_URL, token: KV.KV_REST_API_TOKEN, source: 'kv' });
  }
  assert.equal(redisRestConfig({ KV_REST_API_URL: KV.KV_REST_API_URL, KV_REST_API_READ_ONLY_TOKEN: 'ro' }), null, 'the read-only token is never used');
  assert.equal(redisSource({ ...KV }), 'kv'); assert.equal(redisSource({}), null);
  /* no consumer reads the variables directly any more */
  for (const f of ['server/livon/chat.mjs', 'server/livon/ratelimit.mjs', 'server/livon/data/cache.mjs', 'server/livon/data/limit.mjs', 'server/livon/data/http.mjs', 'server/livon/health.mjs'])
    assert.doesNotMatch(src(f).replace(/\/\*[\s\S]*?\*\//g, ''), /env\.(UPSTASH_REDIS_REST|KV_REST_API)/, f);
});

test('BD-2 every Redis consumer follows the normalized config: AI limits, userdata limits, data cache (KV names work alone)', async () => {
  assert.equal(protectionConfigured({ ...KV, LIVON_RATE_LIMIT_SECRET: SECRET }), true);
  assert.equal(protectionConfigured({ ...KV }), false, 'still needs the limit secret');
  const r1 = fakeRedis();
  await checkRateLimit('198.51.100.1', { ...PROD, ...KV, LIVON_RATE_LIMIT_SECRET: SECRET }, r1.fetcher);
  assert.equal(r1.seen[0].url, KV.KV_REST_API_URL); assert.equal(r1.seen[0].auth, 'Bearer ' + KV.KV_REST_API_TOKEN);
  const r2 = fakeRedis();
  await checkRateLimit('198.51.100.1', { ...PROD, ...KV, ...UP, LIVON_RATE_LIMIT_SECRET: SECRET }, r2.fetcher);
  assert.equal(r2.seen[0].url, UP.UPSTASH_REDIS_REST_URL, 'precedence holds for the AI limiter');
  const r3 = fakeRedis();
  await limitBuckets({ scope: 'userdata', identity: 'acct-1', caps: [[5, 60]], env: { ...PROD, ...KV, LIVON_RATE_LIMIT_SECRET: SECRET }, fetcher: r3.fetcher });
  assert.equal(r3.seen[0].url, KV.KV_REST_API_URL);
  const r4 = fakeRedis();
  const cache = upstashCache({ ...KV }, r4.fetcher);
  assert.equal(cache.kind, 'upstash');
  await cache.set('k', { items: [] }, 1000);
  assert.deepEqual(await cache.get('k'), { items: [] });
  assert.ok(r4.seen.every(s => s.url === KV.KV_REST_API_URL && s.auth === 'Bearer ' + KV.KV_REST_API_TOKEN));
  assert.equal(createServerCache({ ...KV }, r4.fetcher).kind, 'memory+upstash');
  assert.equal(createServerCache({}, r4.fetcher).kind, 'memory');
});

/* ───────── 2. Vercel ───────── */
test('BD-3 vercel.json: valid JSON, functions run in Seoul (icn1), existing settings kept, only known keys', () => {
  const v = JSON.parse(src('vercel.json'));
  assert.deepEqual(v.regions, ['icn1']);
  const known = ['rewrites', 'trailingSlash', 'headers', 'buildCommand', 'outputDirectory', 'functions', 'regions'];
  assert.deepEqual(Object.keys(v).filter(k => !known.includes(k)), []);
  /* the LIVON V1 line adds the AI route (with the data files its tools read) and the data status route */
  const inc = '{livon/*.js,livon/life-topics.json,livon/data/*.js}';
  assert.deepEqual(v.functions, { 'api/livon/chat.mjs': { maxDuration: 40, includeFiles: inc }, 'api/livon/ai/chat.mjs': { maxDuration: 40, includeFiles: inc }, 'api/livon/data.mjs': { maxDuration: 40 }, 'api/livon/data/status.mjs': { maxDuration: 10 }, 'api/livon/userdata.mjs': { maxDuration: 30 } });
  assert.equal(v.buildCommand, 'node scripts/vercel-build.mjs'); assert.equal(v.outputDirectory, '_publish');
  for (const f of Object.keys(v.functions)) assert.ok(src(f).length > 0, f + ' exists');
});

/* ───────── 3. data rate limit ───────── */
test('BD-4 data limit policy: documented defaults, bounded integer overrides, an invalid override keeps the default', () => {
  const d = dataLimitPolicy({});
  assert.deepEqual(d.client, [[30, 60], [600, 86400]]);
  assert.equal(d.siteDay('kr-tourapi'), 900); assert.equal(d.siteDay('kr-kakao-place'), 90000); assert.equal(d.siteDay('kr-lifelong-class'), 9000);
  assert.equal(d.siteDay('kr-youth-policy'), DATA_LIMIT_DEFAULTS.siteDayDefault); assert.equal(d.valid, true);
  const o = dataLimitPolicy({ LIVON_DATA_CLIENT_MINUTE_LIMIT: '45', LIVON_DATA_TOURAPI_DAILY_LIMIT: '9000' });
  assert.equal(o.client[0][0], 45); assert.equal(o.siteDay('kr-tourapi'), 9000); assert.equal(o.valid, true);
  for (const bad of ['0', '-1', '1.5', 'abc', '999999999']) {
    const b = dataLimitPolicy({ LIVON_DATA_CLIENT_MINUTE_LIMIT: bad });
    assert.equal(b.client[0][0], 30, bad); assert.equal(b.valid, false, bad);
  }
  assert.equal(dataLimitMode({}), 'off');
  assert.equal(dataLimitMode(PROD), 'instance'); assert.equal(dataLimitMode({ VERCEL: '1' }), 'instance', 'previews hold real keys too');
  assert.equal(dataLimitMode({ ...PROD, ...UP }), 'instance', 'Upstash without the secret is not shared mode');
  assert.equal(dataLimitMode({ ...PROD, ...KV, LIVON_RATE_LIMIT_SECRET: SECRET }), 'shared');
  assert.equal(clientAddress({ headers: { 'x-vercel-forwarded-for': '203.0.113.9, 10.0.0.1', 'x-forwarded-for': '6.6.6.6' } }, { VERCEL: '1' }), '203.0.113.9');
  assert.equal(clientAddress({ headers: { 'x-forwarded-for': '6.6.6.6' }, socket: { remoteAddress: '127.0.0.1' } }, {}), '127.0.0.1', 'a client X-Forwarded-For is never trusted');
});

test('BD-5 per-client limit: provider calls only, 429 RATE_LIMIT + Retry-After, other clients unaffected, cache hits always served', async () => {
  const calls = [];
  const env = { ...PROD, ...KEYS, LIVON_DATA_CLIENT_MINUTE_LIMIT: '2' };
  const h = createDataHandler({ env, fetcher: router(null, calls), log: () => {} });
  assert.equal(h.limitMode, 'instance');
  assert.equal((await get(h, kq('도서관'))).status, 200);
  for (let i = 0; i < 5; i++) assert.equal((await get(h, kq('도서관'))).status, 200, 'the same (cached) query is never counted');
  assert.equal((await get(h, kq('공원'))).status, 200);
  assert.equal(calls.length, 2, 'two provider calls so far');
  const limited = await get(h, kq('미술관'));
  assert.equal(limited.status, 429);
  assert.equal(limited.body.ok, false); assert.equal(limited.body.code, 'RATE_LIMIT'); assert.ok(limited.body.error);
  assert.ok(Number(limited.headers['retry-after']) >= 1 && Number(limited.headers['retry-after']) <= 60);
  assert.equal(limited.body.retryAfter, Number(limited.headers['retry-after']));
  assert.equal(limited.headers['cache-control'], 'no-store');
  assert.equal(calls.length, 2, 'a refused request never reaches the provider');
  assert.equal(limited.body.items, undefined, 'no rows, no fake result');
  /* cached answers keep flowing for the limited client */
  assert.equal((await get(h, kq('도서관'))).status, 200);
  /* isolation: another client and status checks are untouched */
  assert.equal((await get(h, kq('미술관'), '198.51.100.20')).status, 200);
  assert.equal((await get(h, '/api/livon/data?action=status')).status, 200);
  /* a limited client is not an error of the provider: status of the provider stays available */
  assert.equal(h.diagnostics()['kr-kakao-place'].status, 'available');
});

test('BD-6 per-provider site ceiling: 503 UPSTREAM_LIMIT for that provider only (TourAPI ceiling does not touch Kakao)', async () => {
  const calls = [];
  const h = createDataHandler({ env: { ...PROD, ...KEYS, LIVON_DATA_TOURAPI_DAILY_LIMIT: '1' }, fetcher: router(null, calls), log: () => {} });
  assert.equal((await get(h, tq('경복궁'), '203.0.113.1')).status, 200);
  const over = await get(h, tq('창덕궁'), '203.0.113.2');
  assert.equal(over.status, 503); assert.equal(over.body.code, 'UPSTREAM_LIMIT');
  assert.ok(Number(over.headers['retry-after']) > 3600, 'retry when the daily window ends');
  assert.equal((await get(h, tq('경복궁'), '203.0.113.3')).status, 503, 'TourAPI is never cached (copyright policy), so even a repeat query needs a provider call');
  assert.equal((await get(h, kq('도서관'), '203.0.113.2')).status, 200, 'Kakao has its own ceiling');
  assert.equal(calls.filter(c => c.includes('KorService2')).length, 1);
});

test('BD-7 shared mode (Upstash + secret): one atomic EVAL per provider call, hashed keys only, UPSTASH or KV names', async () => {
  for (const names of [UP, KV]) {
    const redis = fakeRedis(); const calls = [];
    const env = { ...PROD, ...KEYS, ...names, LIVON_RATE_LIMIT_SECRET: SECRET, LIVON_DATA_CLIENT_MINUTE_LIMIT: '1' };
    const h = createDataHandler({ env, fetcher: router(redis, calls), log: () => {} });
    assert.equal(h.limitMode, 'shared');
    assert.equal((await get(h, kq('도서관'), '192.0.2.44')).status, 200);
    assert.equal((await get(h, kq('도서관'), '192.0.2.44')).status, 200, 'cache hit: no EVAL needed');
    const limited = await get(h, kq('공원'), '192.0.2.44');
    assert.equal(limited.status, 429); assert.equal(limited.body.code, 'RATE_LIMIT');
    const evals = redis.seen.filter(s => s.cmd[0] === 'EVAL');
    assert.equal(evals.length, 2, 'exactly one EVAL per would-be provider call');
    for (const e of evals) {
      assert.equal(e.cmd[1], DATA_LIMIT_SCRIPT); assert.equal(e.cmd[2], '3');
      const keys = e.cmd.slice(3, 6);
      assert.match(keys[0], /^livon:data:client:[0-9a-f]{40}:minute$/); assert.match(keys[2], /^livon:data:site:kr-kakao-place:day$/);
      assert.ok(!JSON.stringify(e.cmd).includes('192.0.2.44'), 'the raw IP never reaches Redis');
      assert.ok(!keys.some(k => k.startsWith('livon:ai:')), 'data limits never share keys with the AI limits');
    }
    assert.equal(redis.seen[0].url, names.UPSTASH_REDIS_REST_URL || names.KV_REST_API_URL);
  }
});

test('BD-8 Redis unavailable: same limits counted in the instance — data keeps working, nothing faked, deterministic', async () => {
  for (const broken of ['throw', '500', 'malformed']) {
    const redis = fakeRedis({ broken }); const calls = [];
    const env = { ...PROD, ...KEYS, ...UP, LIVON_RATE_LIMIT_SECRET: SECRET, LIVON_DATA_CLIENT_MINUTE_LIMIT: '2' };
    const h = createDataHandler({ env, fetcher: router(redis, calls), log: () => {} });
    assert.equal((await get(h, kq('도서관'))).status, 200, broken);
    assert.equal((await get(h, kq('공원'))).status, 200, broken);
    const third = await get(h, kq('미술관'));
    assert.equal(third.status, 429, broken + ': the instance fallback still enforces the client limit');
    assert.equal(calls.length, 2, broken);
  }
  /* the limiter on its own: same answers twice for the same sequence */
  const run = async () => { const l = createDataLimiter({ env: { ...PROD, LIVON_DATA_CLIENT_MINUTE_LIMIT: '1' } }); const out = []; for (let i = 0; i < 3; i++) { try { out.push(await l.check('kr-tourapi', '1.2.3.4')); } catch (e) { out.push(e.code); } } return out; };
  assert.deepEqual(await run(), ['instance', 'RATE_LIMIT', 'RATE_LIMIT']);
  assert.deepEqual(await run(), ['instance', 'RATE_LIMIT', 'RATE_LIMIT']);
});

test('BD-9 development/test (no production, no Upstash): limiter off — local work and existing suites unaffected', async () => {
  const calls = [];
  const h = createDataHandler({ env: { ...KEYS }, fetcher: router(null, calls), log: () => {} });
  assert.equal(h.limitMode, 'off');
  for (let i = 0; i < 40; i++) assert.equal((await get(h, kq('q' + i))).status, 200);
  assert.equal(calls.length, 40);
});

test('BD-10 no client address, key or Redis detail in logs, responses or health', async () => {
  const logged = [];
  const orig = console.warn; console.warn = (...a) => logged.push(a.join(' '));
  try {
    const env = { ...KEYS, ...UP, LIVON_RATE_LIMIT_SECRET: SECRET, LIVON_DATA_CLIENT_MINUTE_LIMIT: '1' };   /* dev: logs on */
    const redis = fakeRedis();
    const h = createDataHandler({ env, fetcher: router(redis, []) });
    const a = await get(h, kq('도서관'), '192.0.2.99');
    const b = await get(h, kq('공원'), '192.0.2.99');
    assert.equal(b.status, 429);
    for (const s of [a.raw, b.raw, JSON.stringify(b.headers), ...logged]) {
      assert.ok(!s.includes('192.0.2.99'), 'no IP'); assert.ok(!s.includes(MARK), 'no key/token/secret');
    }
    assert.ok(logged.some(l => /RATE_LIMIT 429/.test(l)), 'fixed code + status only');
  } finally { console.warn = orig; }
  const res = fakeRes();
  createHealthHandler({ env: { ...PROD, ...KEYS, ...KV, LIVON_RATE_LIMIT_SECRET: SECRET, LIVON_DATA_KAKAO_DAILY_LIMIT: 'oops' } })({ method: 'GET', url: '/api/health', headers: { host: 'x' } }, res);
  const body = JSON.parse(res.body);
  assert.deepEqual(body.data.rateLimit, { mode: 'shared', limitsValid: false });
  assert.equal(body.data.sharedCache, true);
  assert.ok(!res.body.includes(MARK) && !/upstash\.io|KV_REST|UPSTASH/.test(res.body), 'health names no variable and no value');
});

/* ───────── 4. verification script ───────── */
async function serveApi(t, env, fetcher) {
  const { createHealthHandler: mk } = await import('../../server/livon/health.mjs');
  const health = mk({ env }); const data = createDataHandler({ env, fetcher, log: () => {} });
  const server = createServer((req, res) => { const p = (req.url || '').split('?')[0]; if (p === '/api/health') return health(req, res); if (p === '/api/livon/data') return data(req, res); res.statusCode = 404; res.end(); });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  t.after(() => { server.closeAllConnections(); server.close(); });
  return `http://127.0.0.1:${server.address().port}`;
}

test('BD-11 verify script: health, exact CORS, one request per ONGIL provider; a local run is never LIVE VERIFIED', async (t) => {
  assert.deepEqual(PROVIDER_CHECKS.map(p => p.id), ['kr-lifelong-class', 'kr-kakao-place', 'kr-tourapi']);
  const env = { ...KEYS, LIVON_ALLOWED_ORIGINS: 'https://www.newon.app' };
  const base = await serveApi(t, env, router(null, []));
  const report = await verifyDeployment({ apiOrigin: base });
  assert.equal(report.local, true); assert.equal(report.ok, true);
  assert.equal(report.checks.health.pass, true); assert.equal(report.checks.cors.pass, true);
  assert.equal(report.checks.cors.foreign, 403); assert.equal(report.checks.cors.wildcard, false);
  for (const p of Object.values(report.providers)) assert.equal(p.status, STATUS.LOCAL);
  const text = formatReport(report);
  assert.doesNotMatch(text, /LIVE VERIFIED/); assert.match(text, /LOCAL DRY RUN/);
  assert.ok(!text.includes(MARK) && !JSON.stringify(report).includes(MARK));
  assert.ok(!JSON.stringify(report).includes('[QA]'), 'no response rows are echoed');
  /* keys missing → NOT CONFIGURED per provider, overall FAIL */
  const bare = await serveApi(t, { LIVON_ALLOWED_ORIGINS: 'https://www.newon.app' }, router(null, []));
  const r2 = await verifyDeployment({ apiOrigin: bare });
  assert.equal(r2.ok, false);
  for (const p of Object.values(r2.providers)) assert.equal(p.status, STATUS.NOT_CONFIGURED);
});

test('BD-12 verify script classification and safety: LIVE only for an https origin with real rows; refusals are distinct', () => {
  const okBody = { status: 200, body: { ok: true, cached: false, items: [{ title: 'x', source: { providerName: 'p' } }] } };
  assert.equal(classifyProvider(okBody, { local: false }).status, STATUS.LIVE);
  assert.equal(classifyProvider(okBody, { local: true }).status, STATUS.LOCAL);
  assert.equal(classifyProvider({ status: 200, body: { ok: true, items: [] } }, { local: false }).status, STATUS.FAILED, 'zero rows is not a verification');
  assert.equal(classifyProvider({ status: 200, body: { ok: true, items: [{ title: 'x' }] } }, { local: false }).status, STATUS.FAILED, 'rows without a source are not real');
  assert.equal(classifyProvider({ status: 503, body: { code: 'NOT_CONFIGURED' } }, { local: false }).status, STATUS.NOT_CONFIGURED);
  assert.equal(classifyProvider({ status: 429, body: { code: 'RATE_LIMIT' } }, { local: false }).status, STATUS.RATE_LIMITED);
  assert.equal(classifyProvider({ status: 503, body: { code: 'UPSTREAM_LIMIT' } }, { local: false }).status, STATUS.RATE_LIMITED);
  assert.equal(classifyProvider({ status: 502, body: { code: 'UPSTREAM_ERROR' } }, { local: false }).status, STATUS.FAILED);
  assert.equal(classifyProvider({ status: 0, body: null, network: 'TIMEOUT' }, { local: false }).code, 'TIMEOUT');
  /* origin only: no credentials, path, query; https, or http for localhost dry runs */
  assert.deepEqual(parseOrigin('https://newon-api.vercel.app/'), { origin: 'https://newon-api.vercel.app', local: false });
  for (const bad of ['https://user:pw@x.vercel.app', 'https://x.vercel.app/api', 'https://x.vercel.app?k=1', 'http://x.vercel.app', 'ftp://x', '', 'https://*.vercel.app']) assert.equal(parseOrigin(bad), null, bad);
  const s = src('scripts/verify-api-deployment.mjs').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(s, /process\.env/, 'reads no environment variable');
  assert.doesNotMatch(s, /Authorization|_API_KEY|SERVICE_KEY|UPSTASH|KV_REST|RATE_LIMIT_SECRET/, 'sends and prints no credential');
  assert.doesNotMatch(s, /api\.newon\.app/);
  /* CLI: bad usage → exit 2; nothing listening → exit 1 with FAIL, still no secret */
  const script = fileURLToPath(new URL('scripts/verify-api-deployment.mjs', ROOT));
  assert.equal(spawnSync(process.execPath, [script], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync(process.execPath, [script, 'https://user:pw@x.vercel.app'], { encoding: 'utf8' }).status, 2);
  const down = spawnSync(process.execPath, [script, 'http://127.0.0.1:9'], { encoding: 'utf8', env: { ...process.env, ...KEYS } });
  assert.equal(down.status, 1); assert.match(down.stdout, /RESULT   FAIL/); assert.ok(!down.stdout.includes(MARK) && !down.stderr.includes(MARK));
});

/* ───────── 5. runbook ───────── */
test('BD-13 runbook: all operational sections, env NAMES only, api.newon.app ruled out, no secret-looking value', () => {
  const r = src('docs/newon/BACKEND_DEPLOYMENT_RUNBOOK.md');
  for (const h of ['A. Architecture', 'B. Create the Vercel project', 'C. Environment variable names', 'D. Connect Upstash', 'E. Deploy', 'F. Verify', 'G. GitHub LIVON_API_ORIGIN', 'H. Redeploy GitHub Pages', 'I. Rollback', 'J. Common failures', 'K. Secret rotation'])
    assert.ok(r.includes('## ' + h), h);
  for (const name of ['LIVON_API_ONLY', 'KAKAO_REST_API_KEY', 'TOURAPI_SERVICE_KEY', 'PUBLIC_DATA_SERVICE_KEY', 'LIVON_RATE_LIMIT_SECRET', 'UPSTASH_REDIS_REST_URL', 'KV_REST_API_URL', 'LIVON_API_ORIGIN', 'OPENAI_API_KEY'])
    assert.ok(r.includes(name), name);
  assert.match(r, /api\.newon\.app[^\n]*(NOT|not)[^\n]*/); assert.match(r, /https:\/\/<project>\.vercel\.app/); assert.match(r, /svc\.newon\.app/);
  assert.match(r, /node scripts\/verify-api-deployment\.mjs/);
  assert.doesNotMatch(r, /sk-[A-Za-z0-9_-]{16,}|KakaoAK [0-9a-f]{32}|[0-9a-f]{32,}|[A-Za-z0-9+/]{40,}={0,2}/, 'placeholders only');
});
