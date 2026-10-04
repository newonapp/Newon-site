// LIVON Live Backend V1 — separate API origin (GitHub Pages frontend → Vercel API): CORS, health, API base config,
// configurable AI rate limits, fail-closed secrets, API-only Vercel build. No real keys; upstreams are fakes.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { allowedOrigins, originAllowed, applyCors, DEFAULT_PRODUCTION_ORIGINS } from '../../server/livon/cors.mjs';
import { createChatHandler } from '../../server/livon/http.mjs';
import { createHealthHandler } from '../../server/livon/health.mjs';
import { createDataHandler, PROVIDERS } from '../../server/livon/data/http.mjs';
import { memoryCache, createServerCache } from '../../server/livon/data/cache.mjs';
import { checkRateLimit, rateCaps, RATE_DEFAULTS } from '../../server/livon/chat.mjs';
import { livonApiOriginFromEnv, livonApiConfigScript } from '../../scripts/livon-api-config.mjs';
import { apiOnlyFiles } from '../../scripts/vercel-build.mjs';

const src = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const PROD = { NODE_ENV: 'production' };
const WWW = 'https://www.newon.app';
const MARK = 'SECRET-MARK-9c1e';
const SECRET_ENV = {
  OPENAI_API_KEY: 'sk-' + MARK, UPSTASH_REDIS_REST_URL: 'https://' + MARK + '.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'tok-' + MARK, LIVON_RATE_LIMIT_SECRET: MARK.repeat(4),
  YOUTHCENTER_API_KEY: 'yc-' + MARK, BIZINFO_API_KEY: 'bz-' + MARK, KAKAO_REST_API_KEY: 'kk-' + MARK, TOURAPI_SERVICE_KEY: 'tr-' + MARK,
  PUBLIC_DATA_SERVICE_KEY: 'pd-' + MARK, WORK24_TRAINING_API_KEY: 'w24-' + MARK
};

async function serve(t, handler) {
  const server = createServer(handler);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  t.after(() => { server.closeAllConnections(); server.close(); });
  return `http://127.0.0.1:${server.address().port}`;
}
function fakeRes() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } }; return r; }
const okReply = () => new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: '[QA] 답변' }] }] }));

/* ───────── CORS policy ───────── */
test('LB-1 origin allowlist: exact https origins only, never "*", localhost only outside production', () => {
  assert.deepEqual(allowedOrigins({}), [...DEFAULT_PRODUCTION_ORIGINS]);
  assert.deepEqual(DEFAULT_PRODUCTION_ORIGINS, ['https://www.newon.app', 'https://newon.app']);
  assert.deepEqual(allowedOrigins({ LIVON_ALLOWED_ORIGINS: 'https://www.newon.app, *, http://evil.example, https://x.example/path, https://preview.newon.app' }), ['https://www.newon.app', 'https://preview.newon.app']);
  assert.deepEqual(allowedOrigins({ LIVON_ALLOWED_ORIGINS: '*' }), [...DEFAULT_PRODUCTION_ORIGINS], 'a wildcard never widens the list');
  assert.equal(originAllowed(WWW, PROD), true); assert.equal(originAllowed('https://newon.app', PROD), true);
  for (const o of ['https://evil.example', 'https://www.newon.app.evil.example', 'http://www.newon.app', 'null', '', 'https://www.newon.app/']) assert.equal(originAllowed(o, PROD), false, o);
  assert.equal(originAllowed('http://localhost:8899', PROD), false, 'no localhost in production');
  assert.equal(originAllowed('http://localhost:8899', { VERCEL: '1' }), false, 'Vercel counts as production');
  assert.equal(originAllowed('http://localhost:8899', {}), true); assert.equal(originAllowed('http://127.0.0.1:3000', {}), true);
});

test('LB-2 applyCors: allowed origin echoed (no "*", no credentials), preflight limited to Content-Type, others refused', () => {
  const r1 = fakeRes(); applyCors({ method: 'GET', headers: { origin: WWW, host: 'api.example.app' } }, r1, PROD);
  assert.equal(r1.headers['access-control-allow-origin'], WWW); assert.equal(r1.headers.vary, 'Origin');
  assert.equal(r1.headers['access-control-allow-credentials'], undefined);
  const r2 = fakeRes();
  const p = applyCors({ method: 'OPTIONS', headers: { origin: WWW, host: 'api.example.app', 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' } }, r2, PROD, { methods: ['POST'] });
  assert.equal(p.preflight, true); assert.equal(r2.headers['access-control-allow-methods'], 'POST, OPTIONS');
  assert.equal(r2.headers['access-control-allow-headers'], 'Content-Type'); assert.equal(r2.headers['access-control-max-age'], '600');
  for (const h of [{ 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type, authorization' }, { 'access-control-request-method': 'DELETE' }, { 'access-control-request-method': 'POST', 'access-control-request-headers': 'x-user-id' }])
    assert.throws(() => applyCors({ method: 'OPTIONS', headers: { origin: WWW, host: 'a.example', ...h } }, fakeRes(), PROD, { methods: ['POST'] }), { code: 'ORIGIN_NOT_ALLOWED' }, JSON.stringify(h));
  assert.throws(() => applyCors({ method: 'GET', headers: { origin: 'https://evil.example', host: 'a.example' } }, fakeRes(), PROD), { code: 'ORIGIN_NOT_ALLOWED' });
  assert.throws(() => applyCors({ method: 'POST', headers: { 'sec-fetch-site': 'cross-site', host: 'a.example' } }, fakeRes(), PROD), { code: 'ORIGIN_NOT_ALLOWED' });
  const same = fakeRes(); applyCors({ method: 'POST', headers: { origin: 'https://a.example', host: 'a.example' } }, same, PROD);
  assert.equal(same.headers['access-control-allow-origin'], undefined, 'same origin needs no CORS header');
  const noOrigin = fakeRes(); assert.equal(applyCors({ method: 'GET', headers: { host: 'a.example' } }, noOrigin, PROD).preflight, false);
});

/* ───────── AI endpoint over HTTP ───────── */
test('LB-3 AI over CORS: allowlisted origin reaches the limiter + OpenAI; evil origin, bad preflight and GET never do', async t => {
  let upstream = 0, limited = 0;
  const env = { ...PROD, OPENAI_API_KEY: 'test-placeholder-not-a-real-key' };
  const url = await serve(t, createChatHandler({ env, limiter: async () => { limited++; }, fetcher: async () => { upstream++; return okReply(); } }));
  const post = (headers = {}) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ message: '안녕' }) });
  const ok = await post({ Origin: WWW });
  assert.equal(ok.status, 200); assert.equal(ok.headers.get('access-control-allow-origin'), WWW); assert.equal((await ok.json()).message, '[QA] 답변');
  assert.equal(upstream, 1); assert.equal(limited, 1);
  const evil = await post({ Origin: 'https://evil.example' });
  assert.equal(evil.status, 403); assert.equal((await evil.json()).code, 'ORIGIN_NOT_ALLOWED'); assert.equal(evil.headers.get('access-control-allow-origin'), null);
  const local = await post({ Origin: 'http://localhost:8899' });
  assert.equal(local.status, 403, 'localhost is refused in production');
  const pre = await fetch(url, { method: 'OPTIONS', headers: { Origin: WWW, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
  assert.equal(pre.status, 204); assert.equal(pre.headers.get('access-control-allow-origin'), WWW); assert.match(pre.headers.get('access-control-allow-methods'), /POST/);
  const preAuth = await fetch(url, { method: 'OPTIONS', headers: { Origin: WWW, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type,authorization' } });
  assert.equal(preAuth.status, 403, 'no Authorization header in V1 (no live auth)');
  const get = await fetch(url, { headers: { Origin: WWW } });
  assert.equal(get.status, 405);
  const text = await post({ Origin: WWW, 'Content-Type': 'text/plain' });
  assert.equal(text.status, 415);
  assert.equal(upstream, 1, 'only the allowed request reached OpenAI'); assert.equal(limited, 1);
});

test('LB-4 AI secrets fail closed: no key → AI_NOT_CONFIGURED; production without Upstash → PROTECTION_NOT_CONFIGURED; Upstash down → PROTECTION_UNAVAILABLE; OpenAI never called', async t => {
  let openai = 0;
  const fetcher = async url => { if (String(url).includes('openai')) { openai++; return okReply(); } return new Response('down', { status: 500 }); };
  const noKey = await serve(t, createChatHandler({ env: PROD, fetcher }));
  const r1 = await fetch(noKey, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: WWW }, body: '{"message":"x"}' });
  assert.equal((await r1.json()).code, 'AI_NOT_CONFIGURED');
  const noProt = await serve(t, createChatHandler({ env: { ...PROD, OPENAI_API_KEY: 'test-placeholder' }, fetcher }));
  const r2 = await fetch(noProt, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: WWW }, body: '{"message":"x"}' });
  assert.equal(r2.status, 503); assert.equal((await r2.json()).code, 'PROTECTION_NOT_CONFIGURED');
  const down = await serve(t, createChatHandler({ env: { ...PROD, OPENAI_API_KEY: 'test-placeholder', UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 't', LIVON_RATE_LIMIT_SECRET: 'a'.repeat(32) }, fetcher }));
  const r3 = await fetch(down, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: WWW }, body: '{"message":"x"}' });
  assert.equal(r3.status, 503); assert.equal((await r3.json()).code, 'PROTECTION_UNAVAILABLE');
  assert.equal(openai, 0, 'no OpenAI call without working rate limiting');
});

test('LB-5 rate limits live in one config: defaults, validated env overrides, fail closed on bad values; IP only as HMAC', async () => {
  assert.deepEqual(rateCaps({}), [[1, 3], [6, 60], [50, 86400], [500, 86400]]);
  assert.deepEqual(RATE_DEFAULTS.siteDay, [500, 86400]);
  assert.deepEqual(rateCaps({ LIVON_AI_MINUTE_LIMIT: '3', LIVON_AI_CLIENT_DAILY_LIMIT: '20', LIVON_DAILY_REQUEST_LIMIT: '200' }), [[1, 3], [3, 60], [20, 86400], [200, 86400]]);
  for (const bad of [{ LIVON_AI_MINUTE_LIMIT: '0' }, { LIVON_AI_MINUTE_LIMIT: '1000' }, { LIVON_AI_CLIENT_DAILY_LIMIT: 'abc' }, { LIVON_DAILY_REQUEST_LIMIT: '99999' }, { LIVON_AI_CLIENT_DAILY_LIMIT: '1.5' }])
    assert.throws(() => rateCaps(bad), { code: 'INVALID_SERVER_CONFIG' }, JSON.stringify(bad));
  const env = { UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 't', LIVON_RATE_LIMIT_SECRET: 'b'.repeat(32), LIVON_AI_MINUTE_LIMIT: '3' };
  await checkRateLimit('198.51.100.7', env, async (_, o) => {
    const cmd = JSON.parse(o.body);
    assert.deepEqual(cmd.slice(-8), ['1', '3', '3', '60', '50', '86400', '500', '86400']);
    assert.ok(!o.body.includes('198.51.100.7')); assert.ok(cmd.slice(3, 6).every(k => /^livon:ai:[0-9a-f]{64}:(burst|minute|day)$/.test(k)));
    return new Response(JSON.stringify({ result: [1, 0] }));
  });
  await assert.rejects(checkRateLimit('ip', { ...env, LIVON_AI_MINUTE_LIMIT: '-1' }, async () => assert.fail('no store call with a bad config')), { code: 'INVALID_SERVER_CONFIG' });
});

/* ───────── health ───────── */
test('LB-6 /api/health: status, time, AI + provider booleans only — never a key, token, URL or secret; CORS + method rules', async t => {
  const env = { ...PROD, ...SECRET_ENV };
  const url = await serve(t, createHealthHandler({ env, now: () => Date.UTC(2026, 8, 29) }));
  const r = await fetch(url + '/api/health', { headers: { Origin: WWW } });
  assert.equal(r.status, 200); assert.equal(r.headers.get('access-control-allow-origin'), WWW); assert.equal(r.headers.get('cache-control'), 'no-store');
  const text = await r.text(); const b = JSON.parse(text);
  assert.ok(!text.includes(MARK) && !/upstash|sk-|https?:\/\//i.test(text.replace(/"time":"[^"]+"/, '')), 'no secret/URL in health');
  assert.equal(b.status, 'ok'); assert.equal(b.service, 'livon-api'); assert.equal(b.time, '2026-09-29T00:00:00.000Z');
  assert.equal(b.aiConfigured, true); assert.equal(b.protectionConfigured, true, 'fields the AI page reads');
  assert.deepEqual(b.ai, { configured: true, protectionConfigured: true, limitsValid: true, ready: true });
  assert.equal(b.data.total, 8); assert.equal(b.data.configuredCount, 8);
  assert.deepEqual(Object.keys(b.data.providers).sort(), Object.keys(PROVIDERS).sort());
  for (const v of Object.values(b.data.providers)) assert.deepEqual(Object.keys(v), ['configured']);
  const bare = await serve(t, createHealthHandler({ env: PROD }));
  const e = await (await fetch(bare)).json();
  assert.deepEqual(e.ai, { configured: false, protectionConfigured: false, limitsValid: true, ready: false }); assert.equal(e.data.configuredCount, 0);
  const badLimits = await serve(t, createHealthHandler({ env: { ...env, LIVON_DAILY_REQUEST_LIMIT: 'x' } }));
  assert.equal((await (await fetch(badLimits)).json()).ai.ready, false);
  assert.equal((await fetch(url, { headers: { Origin: 'https://evil.example' } })).status, 403);
  assert.equal((await fetch(url, { method: 'POST', headers: { Origin: WWW } })).status, 405);
  assert.equal((await fetch(url, { method: 'OPTIONS', headers: { Origin: WWW, 'Access-Control-Request-Method': 'GET' } })).status, 204);
  assert.match(src('api/health.mjs'), /server\/livon\/health\.mjs/);
});

/* ───────── data route over CORS ───────── */
test('LB-7 data route: allowlisted origin can read status/list, evil origin refused before any upstream call, nearby POST preflight works', async t => {
  let calls = 0;
  const h = createDataHandler({ env: PROD, fetcher: async () => { calls++; throw new Error('no upstream in this test'); }, cache: memoryCache(), log: () => {} });
  const url = await serve(t, h);
  const st = await fetch(url + '/api/livon/data?action=status', { headers: { Origin: WWW } });
  assert.equal(st.status, 200); assert.equal(st.headers.get('access-control-allow-origin'), WWW);
  const body = await st.json(); assert.equal(Object.keys(body.providers).length, 8);
  const nk = await fetch(url + '/api/livon/data?provider=kr-youth-policy', { headers: { Origin: WWW } });
  assert.equal(nk.status, 503); assert.equal((await nk.json()).code, 'NOT_CONFIGURED'); assert.equal(nk.headers.get('access-control-allow-origin'), WWW, 'errors are readable by the allowed frontend');
  const evil = await fetch(url + '/api/livon/data?action=status', { headers: { Origin: 'https://evil.example' } });
  assert.equal(evil.status, 403); assert.deepEqual(await evil.json(), { ok: false, code: 'ORIGIN_NOT_ALLOWED', error: '허용되지 않은 요청입니다.' });
  const pre = await fetch(url + '/api/livon/data', { method: 'OPTIONS', headers: { Origin: WWW, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
  assert.equal(pre.status, 204); assert.match(pre.headers.get('access-control-allow-methods'), /GET, POST/);
  const put = await fetch(url + '/api/livon/data', { method: 'OPTIONS', headers: { Origin: WWW, 'Access-Control-Request-Method': 'PUT' } });
  assert.equal(put.status, 403, 'a PUT preflight is refused');
  assert.equal((await fetch(url + '/api/livon/data', { method: 'PUT', headers: { Origin: WWW } })).status, 405);
  assert.equal((await fetch(url + '/api/livon/data', { method: 'DELETE' })).status, 405);
  assert.equal(calls, 0);
});

test('LB-8 server cache: shared Upstash cache failures fall back (never fail a request); values keep TTL; memory cache refuses ttl 0', async () => {
  const broken = createServerCache({ UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 't' }, async () => { throw new TypeError('down'); });
  assert.equal(broken.kind, 'memory+upstash');
  assert.equal(await broken.get('k'), null);
  await broken.set('k', { items: [1] }, 60_000);
  assert.deepEqual(await broken.get('k'), { items: [1] }, 'memory layer still serves');
  const m = memoryCache(); assert.equal(await m.set('x', 1, 0), false);
  assert.equal(createServerCache({}).kind, 'memory', 'no Upstash → per-instance memory cache');
  /* on-demand search providers: Kakao + 고용24 answers are cached; TourAPI is deliberately not cached (copyright policy, documented) */
  assert.ok(PROVIDERS['kr-kakao-place'].ttl({ page: 1 }) > 0);
  assert.ok(PROVIDERS['kr-job-training'].ttl({ page: 1 }) > 0);
  assert.equal(PROVIDERS['kr-tourapi'].ttl({}), 0);
});

/* ───────── API base URL (frontend) ───────── */
test('LB-9 API base: one config file, https origin only, default same-origin; AI page + data layer use it; build writes it from LIVON_API_ORIGIN', () => {
  assert.equal(livonApiOriginFromEnv({}), '');
  assert.equal(livonApiOriginFromEnv({ LIVON_API_ORIGIN: 'https://livon-api.example.app/' }), 'https://livon-api.example.app');
  for (const bad of ['http://api.example.app', 'https://api.example.app/api', 'https://*.example.app', 'javascript:alert(1)', 'https://user:pw@api.example.app', 'api.example.app'])
    assert.equal(livonApiOriginFromEnv({ LIVON_API_ORIGIN: bad }), '', bad);
  assert.equal(src('livon/livon-api-config.js'), livonApiConfigScript(''), 'committed file = generated default');
  const run = code => { const ctx = { window: {} }; ctx.window = ctx; vm.createContext(ctx); vm.runInContext(code, ctx); return ctx; };
  const d = run(livonApiConfigScript(''));
  assert.equal(d.LivonApi.base, ''); assert.equal(d.LivonApi.url('/api/livon/data'), '/api/livon/data');
  const g = run(livonApiConfigScript('https://livon-api.example.app'));
  /* Production routing: the API project has no trailing-slash rule, so a separate-origin URL is the canonical route without
     a slash, and a slash form is normalised to it (completion.test LC-16, api-routing-cors.test CORS-1) */
  assert.equal(g.LivonApi.url('/api/health'), 'https://livon-api.example.app/api/health');
  assert.equal(g.LivonApi.url('/api/health/'), 'https://livon-api.example.app/api/health');
  assert.equal(run(livonApiConfigScript('http://x.example')).LivonApi.base, '', 'generator refuses http');
  vm.runInContext(src('livon/data/livon-data-config.js'), g);
  assert.equal(g.LivonDataConfig.serverEndpoint, 'https://livon-api.example.app/api/livon/data');
  const plain = run(''); vm.runInContext(src('livon/data/livon-data-config.js'), plain);
  assert.equal(plain.LivonDataConfig.serverEndpoint, '/api/livon/data', 'no config → same origin as before');
  const ai = src('livon/ai-page.js');
  assert.match(ai, /API\.url\("\/api\/livon\/chat"\)/); assert.match(ai, /fetch\(API\.url\("\/api\/health"\)/);
  assert.doesNotMatch(ai.replace(/\/\*[\s\S]*?\*\//g, ''), /fetch\("\/api\//, 'no hardcoded /api fetch left');
  const html = src('livon/index.html');
  const i = n => html.indexOf(n);
  assert.ok(i('/livon/livon-api-config.js') > 0 && i('/livon/livon-api-config.js') < i('/livon/data/livon-data-config.js') && i('/livon/data/livon-data-config.js') < i('/livon/ai-page.js'));
  const pub = src('scripts/publish-site.mjs');
  assert.match(pub, /livonApiOriginFromEnv\(process\.env\)/); assert.match(pub, /"livon", "livon-api-config\.js"/);
  const wf = src('.github/workflows/github-pages.yml');
  assert.match(wf, /LIVON_API_ORIGIN: \$\{\{ vars\.LIVON_API_ORIGIN \}\}/, 'Pages build reads a public repository variable, not a secret');
  /* the one *_API_KEY allowed is the public Firebase WEB key, read from a repository variable (Account Backend V1) */
  const wfRest = wf.replace(/^ {10}NEWON_PLUS_FIREBASE_API_KEY: \$\{\{ vars\.NEWON_PLUS_FIREBASE_API_KEY \}\}$/m, '');
  assert.doesNotMatch(wfRest, /OPENAI|UPSTASH|_API_KEY|SERVICE_KEY|RATE_LIMIT_SECRET/, 'no server secret in the Pages workflow');
});

/* ───────── Vercel API-only deployment ───────── */
test('LB-10 Vercel: API-only build publishes no site copy (noindex + robots disallow); full build unchanged by default; /api noindex', () => {
  const v = JSON.parse(src('vercel.json'));
  assert.equal(v.buildCommand, 'node scripts/vercel-build.mjs'); assert.equal(v.outputDirectory, '_publish');
  assert.ok(v.functions['api/livon/chat.mjs'] && v.functions['api/livon/data.mjs']);
  const api = v.headers.find(r => r.source === '/api/(.*)');
  assert.deepEqual(api.headers, [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]);
  const f = apiOnlyFiles();
  assert.deepEqual(Object.keys(f).sort(), ['index.html', 'robots.txt']);
  assert.match(f['index.html'], /noindex, nofollow/); assert.equal(f['robots.txt'], 'User-agent: *\nDisallow: /\n');
  const b = src('scripts/vercel-build.mjs');
  assert.match(b, /LIVON_API_ONLY === "1"/); assert.match(b, /publish-site\.mjs/);
});

test('LB-11 no browser → OpenAI path; no secret names in browser code', () => {
  const files = ['livon/ai-page.js', 'livon/livon-api-config.js', 'livon/data/livon-data-config.js', 'livon/data/livon-data-providers.js', 'livon/data/livon-data-core.js', 'livon/index.html'];
  for (const f of files) {
    const c = src(f);
    assert.doesNotMatch(c, /api\.openai\.com|OPENAI_API_KEY|UPSTASH|RATE_LIMIT_SECRET|_API_KEY|SERVICE_KEY|dapi\.kakao\.com/, f);
  }
  assert.match(src('server/livon/chat.mjs'), /store: false/, 'OpenAI requests are not stored by the API');
});
