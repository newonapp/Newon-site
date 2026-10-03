// NEWON API canonical routing + CORS (production blocker found by the live verification on 2026-10-04).
//
// What happened in production (https://newon-api.vercel.app, observed from https://www.newon.app):
//   vercel.json had "trailingSlash": true. Vercel applies that rule in its routing layer, BEFORE a function runs:
//   /api/health, /api/livon/data, /api/livon/chat and /api/livon/userdata were answered with a redirect to the same path
//   plus "/". That redirect is written by the platform, so it carries none of the headers server/livon/cors.mjs sets.
//   A browser on www.newon.app therefore refused the redirect ("No 'Access-Control-Allow-Origin' header") and every
//   client call failed, while the slash form (/api/livon/data/?…) reached the function and was allowed.
//
// These tests keep the fix in place. `platform()` below is a small MODEL of the documented Vercel trailingSlash rule
// (https://vercel.com/docs/project-configuration#trailingslash) in front of the real handlers; it is not Vercel itself.
// The real platform is checked after a deployment with scripts/verify-api-deployment.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { createHealthHandler } from '../../server/livon/health.mjs';
import { createDataHandler } from '../../server/livon/data/http.mjs';
import { createChatHandler } from '../../server/livon/http.mjs';
import { createUserDataHandler } from '../../server/livon/userdata/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';
import { DEFAULT_PRODUCTION_ORIGINS } from '../../server/livon/cors.mjs';
import { apiOnlyFiles } from '../../scripts/vercel-build.mjs';

const src = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const VERCEL = JSON.parse(src('vercel.json'));
const PROD = { NODE_ENV: 'production' };
const WWW = 'https://www.newon.app';
const APEX = 'https://newon.app';
const FOREIGN = 'https://evil.example';
const ROUTES = ['/api/health', '/api/livon/data', '/api/livon/chat', '/api/livon/userdata'];

/* documented rule: true → a path without a trailing slash and without a file extension is redirected (308) to path + "/";
   false → a path with a trailing slash is redirected to the path without it; unset → no redirect either way */
function platformRedirect(config, pathname) {
  if (config.trailingSlash === true && !pathname.endsWith('/') && !/\.[^/]+$/.test(pathname)) return pathname + '/';
  if (config.trailingSlash === false && pathname.length > 1 && pathname.endsWith('/')) return pathname.replace(/\/+$/, '');
  return null;
}
/* the platform in front of the functions: redirect first (no CORS headers — the function never ran), then the function */
async function platform(t, config, { env = PROD, fetcher = async () => { throw new Error('no upstream in this test'); }, log = () => {} } = {}) {
  const handlers = {
    '/api/health': createHealthHandler({ env }),
    '/api/livon/data': createDataHandler({ env, fetcher, cache: memoryCache(), log }),
    '/api/livon/chat': createChatHandler({ env, fetcher }),
    '/api/livon/userdata': createUserDataHandler({ env, log: () => {} })
  };
  const server = createServer((req, res) => {
    const u = new URL(req.url, 'http://local');
    const to = platformRedirect(config, u.pathname);
    if (to) { res.statusCode = 308; res.setHeader('Location', to + u.search); return res.end(); }
    const h = handlers[u.pathname.replace(/\/+$/, '')];
    if (!h) { res.statusCode = 404; return res.end(); }
    return h(req, res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  return (path, init = {}) => fetch(base + path, { redirect: 'manual', ...init });
}
const acao = r => r.headers.get('access-control-allow-origin');
const preflight = (method, headers) => ({ method: 'OPTIONS', headers: { Origin: WWW, 'Access-Control-Request-Method': method, ...(headers ? { 'Access-Control-Request-Headers': headers } : {}) } });

test('CORS-0 reproduction: with trailingSlash:true every API route without a slash is redirected before the function, without CORS headers', async t => {
  const call = await platform(t, { trailingSlash: true });
  for (const p of ROUTES) {
    for (const init of [{ headers: { Origin: WWW } }, preflight('GET')]) {
      const r = await call(p + '?action=status', init);
      assert.equal(r.status, 308, p + ' is redirected');
      assert.equal(r.headers.get('location'), p + '/?action=status', 'to the slash form, query kept');
      assert.equal(acao(r), null, p + ' redirect has no Access-Control-Allow-Origin → a browser blocks it');
      assert.equal(r.headers.get('access-control-allow-methods'), null);
    }
    const slash = await call(p + '/', { headers: { Origin: WWW } });
    assert.notEqual(slash.status, 308); assert.equal(acao(slash), WWW, p + '/ reaches the function (what production showed)');
  }
});

test('CORS-1 canonical API path does not require a redirect: vercel.json sets no trailingSlash and no redirect touches /api', async t => {
  assert.equal('trailingSlash' in VERCEL, false, 'no global trailing-slash rule on the API project');
  assert.equal(VERCEL.cleanUrls, undefined);
  for (const r of VERCEL.redirects || []) assert.doesNotMatch(String(r.source), /api/, 'no redirect rule for /api');
  for (const r of VERCEL.rewrites || []) assert.doesNotMatch(String(r.source), /api/, 'no rewrite rule for /api');
  for (const p of ROUTES) assert.equal(platformRedirect(VERCEL, p), null, p);
  const call = await platform(t, VERCEL);
  for (const p of ROUTES) { const r = await call(p, { headers: { Origin: WWW } }); assert.ok(r.status !== 301 && r.status !== 302 && r.status !== 307 && r.status !== 308, p + ' → ' + r.status); assert.equal(r.headers.get('location'), null); }
});

test('CORS-1b the paths browsers really call are the canonical ones (no trailing slash) in ONGIL, LIVON and the verification script', () => {
  assert.match(src('ongil-start/js/data-source.js'), /const DATA_PATH = '\/api\/livon\/data';/);
  assert.match(src('livon/data/livon-data-config.js'), /LivonApi\.url\("\/api\/livon\/data"\)/);
  assert.match(src('livon/data/livon-sync.js'), /api\.url\("\/api\/health"\)/); assert.match(src('livon/data/livon-sync.js'), /api\.url\("\/api\/livon\/userdata"\)/);
  assert.match(src('livon/ai-page.js'), /API\.url\("\/api\/livon"\)/); assert.match(src('livon/ai-page.js'), /API\.url\("\/api\/health"\)/);
  const v = src('scripts/verify-api-deployment.mjs');
  assert.match(v, /base \+ '\/api\/health'/); assert.match(v, /base \+ '\/api\/livon\/data'/); assert.match(v, /redirect: 'manual'/, 'the script never follows a redirect, so a platform redirect fails the check');
  for (const p of ROUTES) assert.ok(existsSync(new URL('../../' + p.slice(1) + '.mjs', import.meta.url)), p + ' has a function file');
});

test('CORS-2 www.newon.app (and newon.app) are allowed on every route, with the exact origin', async t => {
  assert.deepEqual(DEFAULT_PRODUCTION_ORIGINS, [WWW, APEX]);
  const call = await platform(t, VERCEL);
  for (const origin of [WWW, APEX]) for (const p of ROUTES) {
    const r = await call(p, { headers: { Origin: origin } });
    assert.equal(acao(r), origin, p + ' ' + origin); assert.equal(r.headers.get('vary'), 'Origin');
  }
});

test('CORS-3 GET /api/livon/data answers with the correct Access-Control-Allow-Origin', async t => {
  const call = await platform(t, VERCEL);
  const r = await call('/api/livon/data?action=status', { headers: { Origin: WWW } });
  assert.equal(r.status, 200); assert.equal(acao(r), WWW);
  const body = await r.json(); assert.equal(body.ok, true); assert.ok(body.providers['kr-tourapi']);
  const list = await call('/api/livon/data?provider=kr-tourapi&region=' + encodeURIComponent('서울') + '&type=12&page=1&limit=20', { headers: { Origin: WWW } });
  assert.equal(list.status, 503, 'no key in this test → NOT_CONFIGURED, still a function answer'); assert.equal(acao(list), WWW, 'error answers carry the header too');
});

test('CORS-4 OPTIONS /api/livon/data answers 204 with the correct origin, methods and headers', async t => {
  const call = await platform(t, VERCEL);
  const r = await call('/api/livon/data', preflight('GET'));
  assert.equal(r.status, 204); assert.equal(acao(r), WWW);
  assert.equal(r.headers.get('access-control-allow-methods'), 'GET, POST, OPTIONS');
  assert.equal(r.headers.get('access-control-allow-headers'), 'Content-Type'); assert.equal(r.headers.get('access-control-max-age'), '600');
  const post = await call('/api/livon/data', preflight('POST', 'content-type'));
  assert.equal(post.status, 204); assert.equal(acao(post), WWW);
});

test('CORS-5 /api/health works without a slash', async t => {
  const call = await platform(t, VERCEL);
  const r = await call('/api/health', { headers: { Origin: WWW } });
  assert.equal(r.status, 200); assert.equal(acao(r), WWW); assert.equal((await r.json()).status, 'ok');
  const pre = await call('/api/health', preflight('GET'));
  assert.equal(pre.status, 204); assert.equal(acao(pre), WWW); assert.equal(pre.headers.get('access-control-allow-methods'), 'GET, OPTIONS');
});

test('CORS-6 /api/livon/chat does not rely on a slash redirect (preflight and POST reach the function)', async t => {
  const call = await platform(t, VERCEL);
  const pre = await call('/api/livon/chat', preflight('POST', 'content-type'));
  assert.equal(pre.status, 204); assert.equal(acao(pre), WWW); assert.equal(pre.headers.get('access-control-allow-methods'), 'POST, OPTIONS');
  const r = await call('/api/livon/chat', { method: 'POST', headers: { Origin: WWW, 'Content-Type': 'text/plain' }, body: 'x' });
  assert.equal(r.status, 415); assert.equal(acao(r), WWW); assert.equal((await r.json()).code, 'UNSUPPORTED_MEDIA_TYPE');
});

test('CORS-7 /api/livon/userdata does not rely on a slash redirect (preflight with Authorization and GET reach the function)', async t => {
  const call = await platform(t, VERCEL);
  const pre = await call('/api/livon/userdata', preflight('GET', 'authorization, content-type'));
  assert.equal(pre.status, 204); assert.equal(acao(pre), WWW);
  assert.equal(pre.headers.get('access-control-allow-headers'), 'Content-Type, Authorization');
  const r = await call('/api/livon/userdata', { headers: { Origin: WWW } });
  assert.equal(r.status, 503); assert.equal(acao(r), WWW); assert.equal((await r.json()).code, 'SYNC_NOT_AVAILABLE');
});

test('CORS-8 an unknown origin is refused on every route and never answered with a wildcard', async t => {
  const call = await platform(t, VERCEL);
  for (const p of ROUTES) for (const origin of [FOREIGN, 'https://www.newon.app.evil.example', 'http://www.newon.app', 'http://localhost:8799']) {
    for (const init of [{ headers: { Origin: origin } }, { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'GET' } }]) {
      const r = await call(p, init);
      assert.equal(r.status, 403, p + ' ' + origin); assert.equal(acao(r), null); assert.notEqual(acao(r), '*');
      if (init.method !== 'OPTIONS') assert.equal((await r.json()).code, 'ORIGIN_NOT_ALLOWED');
    }
  }
});

test('CORS-9 the security policy is not weakened: no credentials, no wildcard, no CORS header written by vercel.json', async t => {
  const call = await platform(t, VERCEL);
  for (const p of ROUTES) for (const init of [{ headers: { Origin: WWW } }, preflight(p === '/api/livon/chat' ? 'POST' : 'GET')]) {
    const r = await call(p, init);
    assert.equal(r.headers.get('access-control-allow-credentials'), null, p); assert.notEqual(acao(r), '*');
  }
  for (const rule of VERCEL.headers) for (const h of rule.headers) assert.doesNotMatch(h.key, /^access-control-/i, 'CORS stays in server/livon/cors.mjs (exact allowlist), not in a static header rule');
  const cors = src('server/livon/cors.mjs');
  assert.doesNotMatch(cors, /setHeader\('Access-Control-Allow-Origin', '\*'\)/); assert.doesNotMatch(cors, /Access-Control-Allow-Credentials/);
  const api = VERCEL.headers.find(r => r.source === '/api/(.*)');
  assert.deepEqual(api.headers, [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }], 'the /api header rule is unchanged');
});

test('CORS-10 the API-only Vercel build still passes: valid config, function files load, and its static output has no path that needs a slash rule', async () => {
  assert.equal(VERCEL.buildCommand, 'node scripts/vercel-build.mjs'); assert.equal(VERCEL.outputDirectory, '_publish'); assert.deepEqual(VERCEL.regions, ['icn1']);
  const known = ['rewrites', 'headers', 'buildCommand', 'outputDirectory', 'functions', 'regions'];
  assert.deepEqual(Object.keys(VERCEL).filter(k => !known.includes(k)), []);
  const files = Object.keys(apiOnlyFiles()).sort();
  assert.deepEqual(files, ['index.html', 'robots.txt'], 'API-only output: the root placeholder and robots.txt only — no directory page');
  for (const f of files) assert.doesNotMatch(f, /\//, f + ' is at the root');
  for (const f of ['api/health.mjs', 'api/livon/data.mjs', 'api/livon/chat.mjs', 'api/livon/userdata.mjs']) {
    const m = await import('../../' + f);
    assert.equal(typeof m.default, 'function', f + ' exports a handler');
  }
  for (const f of Object.keys(VERCEL.functions)) assert.ok(existsSync(new URL('../../' + f, import.meta.url)), f);
  assert.match(src('scripts/vercel-build.mjs'), /LIVON_API_ONLY === "1"/);
});

/* ───────── upstream failure diagnostics (Kakao / lifelong 502 in production could not be diagnosed from the logs) ───────── */
const KEYS = { KAKAO_REST_API_KEY: 'kk-SECRET-MARK-7a1', PUBLIC_DATA_SERVICE_KEY: 'pd-SECRET-MARK-7a1', TOURAPI_SERVICE_KEY: 'tr-SECRET-MARK-7a1' };
const upstreamBody = '{"errorType":"NotAuthorizedError","message":"App(SECRET-APP) disabled OPEN_MAP_AND_LOCAL service."}';
function leakFree(text) { for (const s of ['SECRET-MARK', 'SECRET-APP', 'KakaoAK', 'dapi.kakao.com', 'api.data.go.kr', 'serviceKey', '보건소', '198.51.100']) assert.ok(!text.includes(s), 'log/answer leaks ' + s); }

test('DIAG-1 Kakao upstream 401/403/500 → public 502 UPSTREAM_ERROR unchanged; the log names provider, category and upstream status only', async t => {
  for (const [status, category] of [[401, 'HTTP_4XX'], [403, 'HTTP_4XX'], [500, 'HTTP_5XX']]) {
    const logs = [];
    const call = await platform(t, VERCEL, { env: { ...PROD, ...KEYS }, fetcher: async () => new Response(upstreamBody, { status }), log: (...a) => logs.push(a.join(' ')) });
    const r = await call('/api/livon/data?provider=kr-kakao-place&query=' + encodeURIComponent('서울 보건소') + '&page=1&limit=15', { headers: { Origin: WWW, 'x-forwarded-for': '198.51.100.7' } });
    const text = await r.text();
    assert.equal(r.status, 502); assert.deepEqual(JSON.parse(text), { ok: false, code: 'UPSTREAM_ERROR', error: '제공처 데이터를 지금 불러올 수 없습니다.' });
    const line = logs.find(l => l.startsWith('[LIVON DATA] upstream '));
    assert.ok(line, 'one diagnostic line');
    assert.deepEqual(JSON.parse(line.slice('[LIVON DATA] upstream '.length)), { provider: 'kr-kakao-place', stage: 'search', category, upstreamStatus: status, resultCode: null, errorClass: null, timeout: false });
    leakFree(text); leakFree(logs.join('\n'));
  }
});

test('DIAG-2 lifelong: an official error code in a 200 answer, an HTTP error and a network failure are told apart in the log', async t => {
  const cases = [
    [async () => new Response('{"response":{"header":{"resultCode":"30","resultMsg":"SERVICE_KEY_IS_NOT_REGISTERED_ERROR"}}}'), { category: 'HTTP_4XX', upstreamStatus: null, resultCode: '30' }],
    [async () => new Response('<OpenAPI_ServiceResponse><cmmMsgHeader><returnReasonCode>32</returnReasonCode></cmmMsgHeader></OpenAPI_ServiceResponse>'), { category: 'HTTP_4XX', upstreamStatus: null, resultCode: '32' }],
    [async () => new Response('Unauthorized', { status: 401 }), { category: 'HTTP_4XX', upstreamStatus: 401, resultCode: null }],
    [async () => new Response('<html>gateway</html>', { status: 502 }), { category: 'HTTP_5XX', upstreamStatus: 502, resultCode: null }],
    [async () => { throw new TypeError('fetch failed https://api.data.go.kr/?serviceKey=pd-SECRET-MARK-7a1'); }, { category: 'NETWORK', upstreamStatus: null, resultCode: null }],
    [async () => new Response('<html>not json</html>'), { category: 'PARSE', upstreamStatus: null, resultCode: null }]
  ];
  for (const [fetcher, want] of cases) {
    const logs = [];
    const call = await platform(t, VERCEL, { env: { ...PROD, ...KEYS }, fetcher, log: (...a) => logs.push(a.join(' ')) });
    const r = await call('/api/livon/data?provider=kr-lifelong-class&region=' + encodeURIComponent('서울') + '&status=open&limit=6', { headers: { Origin: WWW } });
    const text = await r.text();
    assert.equal(r.status, 502); assert.equal(JSON.parse(text).code, 'UPSTREAM_ERROR');
    const line = logs.find(l => l.startsWith('[LIVON DATA] upstream '));
    assert.deepEqual(JSON.parse(line.slice('[LIVON DATA] upstream '.length)), { provider: 'kr-lifelong-class', stage: 'list', errorClass: null, timeout: false, ...want });
    leakFree(text); leakFree(logs.join('\n'));
  }
});

test('DIAG-3 the diagnostic line is written in production (Vercel) too, and a timeout is marked', async t => {
  const seen = []; const original = console.warn; console.warn = (...a) => seen.push(a.join(' ')); t.after(() => { console.warn = original; });
  const env = { VERCEL: '1', VERCEL_ENV: 'production', ...KEYS };
  const h = createDataHandler({ env, fetcher: async () => { throw Object.assign(new Error('x'), { name: 'TimeoutError' }); }, cache: memoryCache(), limiter: null });
  const res = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } };
  await h({ method: 'GET', url: '/api/livon/data?provider=kr-kakao-place&query=' + encodeURIComponent('도서관'), headers: { origin: WWW, host: 'newon-api.vercel.app' } }, res);
  assert.equal(res.statusCode, 504); assert.equal(JSON.parse(res.body).code, 'TIMEOUT'); assert.equal(res.headers['access-control-allow-origin'], WWW);
  const lines = seen.filter(l => l.startsWith('[LIVON DATA] upstream '));
  assert.equal(lines.length, 1);
  assert.deepEqual(JSON.parse(lines[0].slice('[LIVON DATA] upstream '.length)), { provider: 'kr-kakao-place', stage: 'search', category: 'TIMEOUT', upstreamStatus: null, resultCode: null, errorClass: null, timeout: true });
  assert.equal(seen.length, 1, 'nothing else is logged in production (the fixed-code line stays development only)');
  leakFree(seen.join('\n'));
});

test('DIAG-4 a successful TourAPI answer logs no diagnostic line and keeps its contract (provider, total, hasMore, source without an invented URL)', async t => {
  const logs = [];
  const item = { contentid: '2733967', contenttypeid: '12', title: '가회동성당', addr1: '서울특별시 종로구 북촌로 57', mapx: '126.9846467509', mapy: '37.5820334711', modifiedtime: '20260713163148', lDongRegnCd: '11' };
  const body = JSON.stringify({ response: { header: { resultCode: '0000', resultMsg: 'OK' }, body: { items: { item: [item] }, numOfRows: 20, pageNo: 1, totalCount: 773 } } });
  const call = await platform(t, VERCEL, { env: { ...PROD, ...KEYS }, fetcher: async () => new Response(body), log: (...a) => logs.push(a.join(' ')) });
  const r = await call('/api/livon/data?provider=kr-tourapi&region=' + encodeURIComponent('서울') + '&type=12&page=1&limit=20', { headers: { Origin: WWW } });
  const out = await r.json();
  assert.equal(r.status, 200); assert.equal(acao(r), WWW);
  assert.equal(out.provider, 'kr-tourapi'); assert.equal(out.page, 1); assert.equal(out.limit, 20); assert.equal(out.total, 773); assert.equal(out.hasMore, true); assert.equal(out.cached, false);
  assert.equal(out.items.length, 1); assert.equal(out.items[0].title, '가회동성당'); assert.equal(out.items[0].type, 'place'); assert.equal(out.items[0].providerId, '2733967');
  assert.equal(out.items[0].source.providerName, '한국관광공사 TourAPI'); assert.equal(out.items[0].source.sourceUrl, null, 'a list row has no source document URL upstream; none is made up');
  assert.deepEqual(logs.filter(l => l.includes('upstream')), []);
});
