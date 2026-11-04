// LIVON account backend & sync V1 — production code paths:
//   server/livon/userdata/http.mjs (route) · store.mjs (PostgreSQL store + in-memory twin) · server/newon/auth/firebase-verifier.mjs
//   (RS256 signature via node:crypto) · verify.mjs (claims) · ratelimit.mjs · livon/data/livon-sync.js (client engine, run in a vm
//   with the real livon-user-data.js) · livon/livon-account-ui.js.
// Tokens are signed with a throwaway RSA key generated here and served through the real certificate store (no Firebase project
// exists yet). Nothing here is LIVE: the Firebase project, database and Upstash are LIVE CONFIG/VERIFICATION items.
// The PostgreSQL suite runs only when LIVON_TEST_PG is set (real server via psql); otherwise it is reported as skipped.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { readFileSync, mkdtempSync, rmSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createUserDataHandler, userdataStatus, userdataCaps, BODY_MAX } from '../../server/livon/userdata/http.mjs';
import { createMemoryStore, createPostgresStore, TABLE_FOR } from '../../server/livon/userdata/store.mjs';
import { createCertStore, createFirebaseSignatureVerifier, maxAgeMs } from '../../server/newon/auth/firebase-verifier.mjs';
import { createTokenVerifier } from '../../server/newon/auth/verify.mjs';
import { createHealthHandler } from '../../server/livon/health.mjs';
import { pgConfig, createTestDatabase } from './pg-harness.mjs';

const ROOT = new URL('../../', import.meta.url);
const src = p => readFileSync(new URL(p, ROOT), 'utf8');
const livon = p => src('livon/' + p);

/* ───────── signing key served as an X.509 certificate (the format Google publishes) ───────── */
const PROJECT = 'newon-plus-test';
const ISS = 'https://securetoken.google.com/' + PROJECT;
const KID = 'kid-main';
function makeKey() {
  const dir = mkdtempSync(join(tmpdir(), 'livon-cert-'));
  try {
    const r = spawnSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', join(dir, 'k.pem'), '-out', join(dir, 'c.pem'), '-subj', '/CN=livon-test', '-days', '1'], { encoding: 'utf8' });
    if (r.status === 0) return { privateKey: crypto.createPrivateKey(readFileSync(join(dir, 'k.pem'))), pem: readFileSync(join(dir, 'c.pem'), 'utf8'), x509: true };
  } catch { /* openssl missing → SPKI below */ } finally { rmSync(dir, { recursive: true, force: true }); }
  const kp = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  return { privateKey: kp.privateKey, pem: kp.publicKey.export({ type: 'spki', format: 'pem' }), x509: false };
}
const MAIN = makeKey();
const OTHER = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const enc = o => Buffer.from(JSON.stringify(o)).toString('base64url');
function jwt(claims, { kid = KID, key = MAIN.privateKey, header } = {}) {
  const input = enc(header || { alg: 'RS256', kid, typ: 'JWT' }) + '.' + enc(claims);
  return input + '.' + crypto.sign('RSA-SHA256', Buffer.from(input), key).toString('base64url');
}
function claims(sub, over = {}) {
  const t = Math.floor(Date.now() / 1000);
  return { iss: ISS, aud: PROJECT, sub, iat: t - 10, auth_time: t - 20, exp: t + 3600, firebase: { sign_in_provider: 'google.com' }, ...over };
}
const bearer = (sub, over, opt) => ({ authorization: 'Bearer ' + jwt(claims(sub, over), opt) });

/* ───────── server under test (real handler + real verifier; injected store) ───────── */
function certFetcher(state) {
  return async () => { state.fetches++; if (state.down) throw new Error('offline'); return { ok: true, headers: { get: () => state.cacheControl || 'public, max-age=3600' }, json: async () => state.certs }; };
}
function server({ store = createMemoryStore(), env = {}, limiter = async () => {}, certs } = {}) {
  const certState = { fetches: 0, certs: certs || { [KID]: MAIN.pem } };
  const fullEnv = { NEWON_AUTH_VERIFY_ENABLED: 'true', NEWON_PLUS_FIREBASE_PROJECT_ID: PROJECT, LIVON_USERDATA_ENABLED: 'true', LIVON_DATABASE_URL: 'postgres://db.invalid/livon', ...env };
  const logs = [];
  const handler = createUserDataHandler({ env: fullEnv, store, fetcher: certFetcher(certState), limiter, log: e => logs.push(e) });
  return { handler, store, logs, certState, env: fullEnv };
}
async function call(handler, { method = 'GET', url = '/api/livon/userdata', headers = {}, body } = {}) {
  const res = { statusCode: 200, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } };
  const h = {}; for (const [k, v] of Object.entries(headers || {})) h[k.toLowerCase()] = v;
  const req = { method, url, headers: { host: 'api.newon.app', ...h }, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body) };
  await handler(req, res);
  let json = null; try { json = JSON.parse(res.body); } catch { /* 204 */ }
  return { status: res.statusCode, headers: res.headers, json, raw: res.body };
}
const post = (srv, sub, body, extra = {}) => call(srv.handler, { method: 'POST', headers: { ...bearer(sub), 'content-type': 'application/json', ...extra }, body });
const pull = (srv, sub, q = '') => call(srv.handler, { headers: bearer(sub), url: '/api/livon/userdata' + q });
const T0 = Date.now() - 60_000;
const rec = (collection, id, data, over = {}) => ({ id, collection, schemaVersion: 1, createdAt: T0, updatedAt: T0, deletedAt: null, localRev: 1, serverRev: null, data, ...over });
const SUB_A = 'userAlpha01', SUB_B = 'userBravo02';

/* ═════════════ 1. route switch · fail-closed · production wiring ═════════════ */
test('AB-1 disabled by default: SYNC_NOT_AVAILABLE; no DB → SERVER_NOT_CONFIGURED; no verifier → AUTH_NOT_CONFIGURED (before any token work)', async () => {
  let r = await call(createUserDataHandler({ env: {}, log: () => {} }), { headers: bearer(SUB_A) });
  assert.equal(r.status, 503); assert.equal(r.json.code, 'SYNC_NOT_AVAILABLE');
  r = await call(createUserDataHandler({ env: { LIVON_USERDATA_ENABLED: 'true' }, log: () => {} }), { headers: bearer(SUB_A) });
  assert.equal(r.status, 503); assert.equal(r.json.code, 'SERVER_NOT_CONFIGURED', 'no LIVON_DATABASE_URL → no fake store');
  r = await call(createUserDataHandler({ env: { LIVON_USERDATA_ENABLED: 'true', LIVON_DATABASE_URL: 'postgres://db.invalid/x' }, store: createMemoryStore(), log: () => {} }), { headers: bearer(SUB_A) });
  assert.equal(r.status, 503); assert.equal(r.json.code, 'AUTH_NOT_CONFIGURED');
  for (const hq of ['newon-hq', 'newon-oxmonth']) {
    r = await call(server({ env: { NEWON_PLUS_FIREBASE_PROJECT_ID: hq } }).handler, { headers: bearer(SUB_A) });
    assert.equal(r.json.code, 'AUTH_NOT_CONFIGURED', hq + ' can never be the consumer project');
  }
  assert.deepEqual(userdataStatus({}), { enabled: false, database: false, auth: false });
});

test('AB-2 production route: default PostgreSQL store + Google-certificate verifier; the in-memory store is never wired into production', () => {
  const route = src('api/livon/userdata.mjs');
  assert.match(route, /export default createUserDataHandler\(\);/);
  for (const f of ['api/livon/userdata.mjs', 'server/livon/userdata/http.mjs', 'scripts/serve-publish.mjs', 'server/livon/health.mjs']) assert.doesNotMatch(src(f).replace(/\/\*[\s\S]*?\*\//g, ''), /createMemoryStore/, f);
  const http = src('server/livon/userdata/http.mjs');
  assert.match(http, /postgresQueryFromEnv\(env\)/); assert.match(http, /createFirebaseSignatureVerifier\(\{ certs: createCertStore/);
  assert.match(JSON.parse(src('package.json')).dependencies.pg, /^\^8\./, 'pg driver declared for the serverless function');
  assert.equal(JSON.parse(src('vercel.json')).functions['api/livon/userdata.mjs'].maxDuration, 30);
  assert.match(src('.env.example'), /^LIVON_USERDATA_ENABLED=false$/m);
  assert.match(src('.env.example'), /^LIVON_DATABASE_URL=$/m);
});

test('AB-3 /api/health userdata.ready only when enabled + database + verifier + abuse protection are all configured (booleans only)', async () => {
  const get = async env => { const r = await call(createHealthHandler({ env }), { url: '/api/health' }); return r.json.userdata; };
  assert.deepEqual(await get({}), { enabled: false, database: false, auth: false, ready: false });
  const base = { LIVON_USERDATA_ENABLED: 'true', LIVON_DATABASE_URL: 'postgres://qa:not-a-real-password@db.example.invalid/x', NEWON_AUTH_VERIFY_ENABLED: 'true', NEWON_PLUS_FIREBASE_PROJECT_ID: PROJECT };
  assert.equal((await get({ ...base, NODE_ENV: 'production' })).ready, false, 'production without Upstash → not ready');
  assert.equal((await get(base)).ready, true, 'outside production the in-process limiter protects the route');
  const up = { ...base, NODE_ENV: 'production', UPSTASH_REDIS_REST_URL: 'https://x.upstash.io', UPSTASH_REDIS_REST_TOKEN: 't', LIVON_RATE_LIMIT_SECRET: 'x'.repeat(32) };
  const r = await call(createHealthHandler({ env: up }), { url: '/api/health' });
  assert.equal(r.json.userdata.ready, true);
  assert.doesNotMatch(r.raw, /not-a-real-password|db\.example|upstash\.io/, 'no connection string or host leaks');
});

/* ═════════════ 2. token verification (signature · claims · issuers) ═════════════ */
test('AB-4 Bearer only: missing → 401 + WWW-Authenticate; token in URL → 400; cookie/body tokens are not read', async () => {
  const srv = server();
  let r = await call(srv.handler, {});
  assert.equal(r.status, 401); assert.equal(r.json.code, 'NO_TOKEN'); assert.equal(r.headers['www-authenticate'], 'Bearer');
  const t = jwt(claims(SUB_A));
  for (const q of ['id_token', 'token', 'access_token', 'auth']) {
    r = await call(srv.handler, { url: '/api/livon/userdata?' + q + '=' + t, headers: { authorization: 'Bearer ' + t } });
    assert.equal(r.status, 400); assert.equal(r.json.code, 'TOKEN_IN_URL');
  }
  r = await call(srv.handler, { headers: { cookie: 'token=' + t } }); assert.equal(r.json.code, 'NO_TOKEN');
  r = await call(srv.handler, { method: 'POST', headers: { 'content-type': 'application/json' }, body: { op: 'syncMeta', payload: {}, token: t } });
  assert.equal(r.json.code, 'NO_TOKEN');
  r = await call(srv.handler, { headers: { authorization: 'Basic abc' } }); assert.equal(r.json.code, 'MALFORMED_TOKEN');
});

test('AB-5 signature and claims: forged key, unknown kid, alg none/HS256, expired, future iat, wrong aud/iss, bad sub are all refused', async () => {
  const srv = server();
  const ok = await pull(srv, SUB_A); assert.equal(ok.status, 200, 'a correctly signed Newon+ token is accepted' + (MAIN.x509 ? ' (X.509 certificate path)' : ''));
  const t = Math.floor(Date.now() / 1000);
  const cases = [
    [{ authorization: 'Bearer ' + jwt(claims(SUB_A), { key: OTHER.privateKey }) }, 401, 'INVALID_TOKEN', 'forged signature'],
    [bearer(SUB_A, {}, { kid: 'kid-unknown' }), 401, 'INVALID_TOKEN', 'unknown kid'],
    [{ authorization: 'Bearer ' + jwt(claims(SUB_A), { header: { alg: 'none', kid: KID } }) }, 401, 'INVALID_TOKEN', 'alg none'],
    [{ authorization: 'Bearer ' + jwt(claims(SUB_A), { header: { alg: 'HS256', kid: KID } }) }, 401, 'INVALID_TOKEN', 'alg HS256'],
    [bearer(SUB_A, { exp: t - 3600 }), 401, 'TOKEN_EXPIRED', 'expired'],
    [bearer(SUB_A, { iat: t + 3600 }), 401, 'INVALID_TOKEN', 'issued in the future'],
    [bearer(SUB_A, { auth_time: undefined }), 401, 'INVALID_TOKEN', 'no auth_time'],
    [bearer(SUB_A, { aud: 'other-project' }), 401, 'INVALID_TOKEN', 'wrong audience'],
    [bearer(SUB_A, { iss: 'https://securetoken.google.com/newon-hq', aud: 'newon-hq' }), 401, 'INVALID_TOKEN', 'HQ admin token'],
    [bearer(SUB_A, { iss: 'https://securetoken.google.com/newon-oxmonth', aud: 'newon-oxmonth' }), 401, 'INVALID_TOKEN', 'OX app token'],
    [bearer('x'), 401, 'INVALID_TOKEN', 'bad subject'],
    [{ authorization: 'Bearer ' + jwt(claims(SUB_A)).slice(0, -4) + 'AAAA' }, 401, 'INVALID_TOKEN', 'tampered signature']
  ];
  for (const [h, st, code, why] of cases) { const r = await call(srv.handler, { headers: h }); assert.equal(r.status, st, why); assert.equal(r.json.code, code, why); }
  /* tampered payload: re-encode claims with another subject but keep the original signature */
  const good = jwt(claims(SUB_A)).split('.');
  const r = await call(srv.handler, { headers: { authorization: 'Bearer ' + [good[0], enc(claims(SUB_B)), good[2]].join('.') } });
  assert.equal(r.json.code, 'INVALID_TOKEN');
  assert.equal(srv.store._debug.refs.size, 1, 'no refused token ever created an account');
});

test('AB-6 HQ / other-app identities never map to a Newon+ account even if a verifier accepted them (defence in depth)', async () => {
  const mk = issuer => ({ enabled: true, verify: async () => ({ verified: true, issuer, subject: SUB_A }) });
  const base = { NEWON_AUTH_VERIFY_ENABLED: 'true', NEWON_PLUS_FIREBASE_PROJECT_ID: PROJECT, LIVON_USERDATA_ENABLED: 'true', LIVON_DATABASE_URL: 'postgres://x/y', NEWON_AUTH_ALLOWED_ISSUERS: ISS + ',https://securetoken.google.com/newon-oxmonth' };
  const run = async issuer => call(createUserDataHandler({ env: base, store: createMemoryStore(), verifier: mk(issuer), limiter: async () => {}, log: () => {} }), { headers: bearer(SUB_A) });
  assert.equal((await run('https://securetoken.google.com/newon-hq')).json.code, 'ADMIN_IDENTITY_NOT_ALLOWED');
  assert.equal((await run('https://securetoken.google.com/some-other-app')).json.code, 'ISSUER_NOT_ALLOWED');
  assert.equal((await run('https://securetoken.google.com/newon-oxmonth')).json.code, 'ISSUER_NOT_ALLOWED', 'an allowlisted secondary issuer cannot open an account without explicit linking');
});

test('AB-7 certificate store: cached per Cache-Control, rotated keys picked up with one refetch, outage → 401 (never 500, never accepted)', async () => {
  const srv = server();
  await pull(srv, SUB_A); await pull(srv, SUB_A); await pull(srv, SUB_B);
  assert.equal(srv.certState.fetches, 1, 'one certificate fetch for many requests');
  const K2 = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  srv.certState.certs = { [KID]: MAIN.pem, 'kid-new': K2.publicKey.export({ type: 'spki', format: 'pem' }) };
  const r = await call(srv.handler, { headers: bearer(SUB_A, {}, { kid: 'kid-new', key: K2.privateKey }) });
  assert.equal(r.status, 200, 'rotated key accepted'); assert.equal(srv.certState.fetches, 2);
  let clock = 0; const st = { fetches: 0, certs: { [KID]: MAIN.pem }, cacheControl: 'max-age=120' };
  const store = createCertStore({ fetcher: certFetcher(st), now: () => clock });
  await store.keyFor(KID); clock = 119_000; await store.keyFor(KID); assert.equal(st.fetches, 1);
  clock = 121_000; await store.keyFor(KID); assert.equal(st.fetches, 2, 'refetched after max-age');
  st.down = true; clock = 999_000;
  const v = createFirebaseSignatureVerifier({ certs: store });
  await assert.rejects(v(jwt(claims(SUB_A))), e => e.code === 'CERTS_UNAVAILABLE');
  assert.equal(maxAgeMs('max-age=5'), 60_000); assert.equal(maxAgeMs('max-age=999999'), 86_400_000); assert.equal(maxAgeMs(''), 3_600_000);
  const down = server(); down.certState.certs = {};
  const r2 = await pull(down, SUB_A); assert.equal(r2.status, 401); assert.equal(r2.json.code, 'INVALID_TOKEN');
  const tv = createTokenVerifier({ env: { NEWON_AUTH_VERIFY_ENABLED: 'true', NEWON_PLUS_FIREBASE_PROJECT_ID: PROJECT }, verifySignature: createFirebaseSignatureVerifier({ certs: createCertStore({ fetcher: certFetcher({ fetches: 0, certs: { [KID]: MAIN.pem } }) }) }) });
  const id = await tv.verify({ authorization: 'Bearer ' + jwt(claims(SUB_A, { email: 'a@example.com' })) });
  assert.deepEqual(Object.keys(id).sort(), ['authTime', 'issuer', 'signInProvider', 'subject', 'verified'], 'email is never part of the identity');
});

/* ═════════════ 3. account mapping · isolation ═════════════ */
test('AB-8 (issuer, subject) → one opaque acct_ id; same email on two subjects stays two accounts; uid is not the account id', async () => {
  const srv = server();
  await call(srv.handler, { headers: bearer(SUB_A, { email: 'same@example.com' }) });
  await call(srv.handler, { headers: bearer(SUB_A, { email: 'same@example.com' }) });
  await call(srv.handler, { headers: bearer(SUB_B, { email: 'same@example.com' }) });
  const { refs, accounts } = srv.store._debug;
  assert.equal(refs.size, 2); assert.equal(accounts.size, 2, 'no email auto-merge');
  for (const [k, id] of refs) { assert.match(id, /^acct_[0-9a-f]{32}$/); assert.ok(!id.includes(k.split('|')[1])); assert.equal(k.split('|')[0], ISS); }
});

test('AB-9 IDOR: every read/write is scoped to the token\'s account; client-sent owner fields are refused', async () => {
  const srv = server();
  let r = await post(srv, SUB_A, { op: 'batch', payload: { records: [rec('tasks', 'todo_1', { id: 'todo_1', title: 'A의 할 일' })] } });
  assert.equal(r.json.results[0].status, 'applied');
  r = await pull(srv, SUB_B); assert.equal(r.json.records.length, 0, 'B sees nothing of A');
  r = await post(srv, SUB_B, { op: 'batch', payload: { records: [rec('tasks', 'todo_1', { id: 'todo_1', title: 'B가 덮어쓰기 시도' })] } });
  assert.equal(r.json.results[0].status, 'applied', 'same record id lands in B\'s own space');
  r = await pull(srv, SUB_A); assert.equal(r.json.records[0].data.title, 'A의 할 일');
  for (const body of [
    { op: 'batch', payload: { records: [rec('tasks', 'x1', { t: 1 })], userId: 'someone' } },
    { op: 'batch', payload: { records: [rec('tasks', 'x1', { t: 1 })], ownerId: 'someone' } },
    { op: 'batch', payload: { records: [rec('tasks', 'x1', { t: 1 })] }, accountId: 'acct_0' },
    { op: 'batch', payload: { records: [{ ...rec('tasks', 'x1', { t: 1 }), accountId: 'acct_0' }] } },
    { op: 'batch', payload: { records: [{ ...rec('tasks', 'x1', { t: 1 }), ownerId: 'x' }] } }
  ]) { r = await post(srv, SUB_B, body); assert.equal(r.status, 400, JSON.stringify(body).slice(0, 80)); assert.equal(r.json.code, 'INVALID_PAYLOAD'); }
  for (const q of ['?accountId=acct_0', '?userId=x', '?since=1&since=2', '?since=-1', '?collection=ai_threads', '?limit=abc']) {
    r = await pull(srv, SUB_B, q); assert.equal(r.status, 400, q); assert.equal(r.json.code, 'BAD_REQUEST');
  }
});

/* ═════════════ 4. payload rules ═════════════ */
test('AB-10 allowlists and limits: unknown collection/field, pollution, oversize, too many, duplicates, bad JSON, wrong media type', async () => {
  const srv = server();
  const bad = async (body, code = 'INVALID_PAYLOAD', status = 400) => { const r = await post(srv, SUB_A, body); assert.equal(r.status, status, JSON.stringify(body).slice(0, 90)); assert.equal(r.json.code, code); };
  for (const c of ['ai_threads', 'recent', 'drafts', 'location', 'tokens', 'cache']) await bad({ op: 'batch', payload: { records: [rec(c, 'r1', { v: 1 })] } });
  await bad({ op: 'batch', payload: { records: [{ ...rec('tasks', 'r1', { v: 1 }), extra: 1 }] } });
  await bad({ op: 'batch', payload: { records: [rec('tasks', 'r1', { v: 1 }), rec('tasks', 'r1', { v: 2 })] } });
  await bad({ op: 'batch', payload: { records: Array.from({ length: 501 }, (_, i) => rec('tasks', 'r' + i, { v: i })) } });
  await bad({ op: 'batch', payload: { records: [rec('tasks', 'r1', { v: 'x'.repeat(70 * 1024) })] } });
  await bad({ op: 'batch', payload: { records: [rec('tasks', 'r1', { v: 1 }, { serverRev: 1.5 })] } });
  await bad({ op: 'batch', payload: { records: [rec('tasks', 'r1', { v: 1 }, { schemaVersion: 2 })] } });
  await bad({ op: 'batch', payload: { records: [rec('tasks', 'r1', null)] } });
  await bad({ op: 'drop', payload: {} });
  await bad({ op: 'device', payload: { deviceId: 'nope', lastServerRev: 0 } });
  const polluted = '{"op":"batch","payload":{"records":[{"id":"p1","collection":"tasks","schemaVersion":1,"createdAt":1,"updatedAt":1,"deletedAt":null,"localRev":0,"serverRev":null,"data":{"__proto__":{"polluted":true},"t":1}}]}}';
  let r = await post(srv, SUB_A, polluted);
  assert.equal(({}).polluted, undefined, 'Object.prototype untouched');
  if (r.status === 200) { const p = await pull(srv, SUB_A); assert.ok(!Object.prototype.hasOwnProperty.call(p.json.records.find(x => x.id === 'p1').data, '__proto__')); }
  else assert.equal(r.json.code, 'INVALID_PAYLOAD');
  r = await post(srv, SUB_A, '{"op":"batch","payload":{"records":[{"id":"p2","collection":"tasks","schemaVersion":1,"createdAt":1,"updatedAt":1,"localRev":0,"data":{"t":1},"__proto__":{"x":1}}]}}');
  assert.equal(r.status, 400); assert.equal(({}).x, undefined);
  r = await post(srv, SUB_A, 'x'.repeat(BODY_MAX + 10)); assert.equal(r.status, 413); assert.equal(r.json.code, 'PAYLOAD_TOO_LARGE');
  r = await post(srv, SUB_A, '{not json'); assert.equal(r.status, 400); assert.equal(r.json.code, 'BAD_REQUEST');
  r = await post(srv, SUB_A, { op: 'syncMeta', payload: {} }, { 'content-type': 'text/plain' }); assert.equal(r.status, 415);
  r = await call(srv.handler, { method: 'DELETE', headers: bearer(SUB_A) }); assert.equal(r.status, 405); assert.equal(r.headers.allow, 'GET, POST, OPTIONS');
});

test('AB-11 sensitive collections (건강·가계부·일기·예산) need the explicit sensitive flag per batch', async () => {
  const srv = server();
  let r = await post(srv, SUB_A, { op: 'batch', payload: { records: [rec('journal', 'j1', { body: '개인 기록' }), rec('tasks', 't1', { title: 'x' })] } });
  assert.deepEqual(r.json.results.map(x => x.status), ['rejected', 'applied']);
  assert.equal(r.json.results[0].code, 'SENSITIVE_CONSENT_REQUIRED');
  assert.equal((await pull(srv, SUB_A)).json.records.filter(x => x.collection === 'journal').length, 0);
  r = await post(srv, SUB_A, { op: 'batch', payload: { sensitive: true, records: [rec('journal', 'j1', { body: '개인 기록' }), rec('health_records', 'h1', { v: 1 }), rec('transactions', 'x1', { v: 1 }), rec('budgets', 'ml.budgets', { monthly: 1 })] } });
  assert.ok(r.json.results.every(x => x.status === 'applied'));
});

/* ═════════════ 5. optimistic revisions · tombstones · pull ═════════════ */
test('AB-12 optimistic concurrency, tombstones without resurrection, replay-safe, paginated pull', async () => {
  const srv = server();
  const w = async (r) => (await post(srv, SUB_A, { op: 'batch', payload: { records: [r] } })).json.results[0];
  const a = await w(rec('tasks', 't1', { title: 'v1' })); assert.equal(a.status, 'applied');
  const stale = await w(rec('tasks', 't1', { title: 'stale' })); assert.equal(stale.status, 'conflict'); assert.equal(stale.current.data.title, 'v1');
  const b = await w(rec('tasks', 't1', { title: 'v2' }, { serverRev: a.serverRev, updatedAt: T0 + 1 })); assert.equal(b.status, 'applied');
  const replay = await w(rec('tasks', 't1', { title: 'v2' }, { serverRev: a.serverRev, updatedAt: T0 + 1 })); assert.equal(replay.status, 'conflict', 'a replayed write cannot apply twice');
  const del = await w(rec('tasks', 't1', null, { serverRev: b.serverRev, deletedAt: T0 + 2, updatedAt: T0 + 2 })); assert.equal(del.status, 'applied');
  const res = await w(rec('tasks', 't1', { title: 'zombie' }, { serverRev: b.serverRev, updatedAt: T0 + 3 })); assert.equal(res.status, 'conflict', 'no resurrection from an old base');
  assert.equal(res.current.deletedAt, T0 + 2); assert.equal(res.current.data, null);
  for (let i = 0; i < 5; i++) await w(rec('saved_items', 's' + i, { id: 's' + i, title: 'S' + i }));
  let p = await pull(srv, SUB_A, '?since=0&limit=2'); assert.equal(p.json.records.length, 2); assert.equal(p.json.hasMore, true);
  const seen = [...p.json.records];
  while (p.json.hasMore) { p = await pull(srv, SUB_A, '?since=' + p.json.nextSince + '&limit=2'); seen.push(...p.json.records); }
  assert.equal(seen.length, 6); assert.deepEqual(seen.map(x => x.serverRev), [...seen.map(x => x.serverRev)].sort((x, y) => x - y));
  assert.equal(seen.find(x => x.id === 't1').deletedAt, T0 + 2, 'tombstone is pulled (other devices remove it)');
  p = await pull(srv, SUB_A, '?collection=saved_items'); assert.equal(p.json.records.length, 5);
  const m = await post(srv, SUB_A, { op: 'syncMeta', payload: {} }); assert.equal(m.json.serverRev, seen.at(-1).serverRev);
  const d = await post(srv, SUB_A, { op: 'device', payload: { deviceId: 'dv_abc12345', lastServerRev: 3, conflicts: 1, importDecided: true } }); assert.equal(d.status, 200);
});

/* ═════════════ 6. CORS · rate limit · logs ═════════════ */
test('AB-13 CORS: exact newon.app origins, Authorization allowed only here, localhost only outside production, never "*"', async () => {
  const srv = server();
  const pre = (origin, env) => call((env ? server({ env }) : srv).handler, { method: 'OPTIONS', headers: { origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type,authorization' } });
  for (const o of ['https://www.newon.app', 'https://newon.app']) {
    const r = await pre(o); assert.equal(r.status, 204); assert.equal(r.headers['access-control-allow-origin'], o);
    assert.equal(r.headers['access-control-allow-headers'], 'Content-Type, Authorization'); assert.equal(r.headers['access-control-allow-credentials'], undefined);
  }
  assert.equal((await pre('http://localhost:4173')).status, 204);
  assert.equal((await pre('http://localhost:4173', { NODE_ENV: 'production', UPSTASH_REDIS_REST_URL: 'https://x', UPSTASH_REDIS_REST_TOKEN: 't', LIVON_RATE_LIMIT_SECRET: 'x'.repeat(32) })).json.code, 'ORIGIN_NOT_ALLOWED');
  for (const o of ['https://evil.example', 'https://newon.app.evil.example', 'null']) { const r = await pre(o); assert.equal(r.status, 403); assert.equal(r.headers['access-control-allow-origin'], undefined); }
  const r = await call(srv.handler, { headers: { ...bearer(SUB_A), origin: 'https://evil.example' } }); assert.equal(r.status, 403);
  assert.doesNotMatch(src('server/livon/cors.mjs') + src('server/livon/userdata/http.mjs'), /Allow-Origin', '\*'/);
});

test('AB-14 rate limit per account (real limiter, local mode) → 429 + Retry-After; production without Upstash fails closed', async () => {
  const srv = createUserDataHandler({ env: { NEWON_AUTH_VERIFY_ENABLED: 'true', NEWON_PLUS_FIREBASE_PROJECT_ID: PROJECT, LIVON_USERDATA_ENABLED: 'true', LIVON_DATABASE_URL: 'postgres://x/y', LIVON_USERDATA_MINUTE_LIMIT: '2' }, store: createMemoryStore(), fetcher: certFetcher({ fetches: 0, certs: { [KID]: MAIN.pem } }), log: () => {} });
  const sub = 'rateUser' + Date.now();
  assert.equal((await call(srv, { headers: bearer(sub) })).status, 200);
  assert.equal((await call(srv, { headers: bearer(sub) })).status, 200);
  const r = await call(srv, { headers: bearer(sub) }); assert.equal(r.status, 429); assert.equal(r.json.code, 'RATE_LIMIT'); assert.ok(Number(r.headers['retry-after']) >= 1);
  assert.equal((await call(srv, { headers: bearer(sub + 'x') })).status, 200, 'another account is not affected');
  const prod = createUserDataHandler({ env: { NODE_ENV: 'production', NEWON_AUTH_VERIFY_ENABLED: 'true', NEWON_PLUS_FIREBASE_PROJECT_ID: PROJECT, LIVON_USERDATA_ENABLED: 'true', LIVON_DATABASE_URL: 'postgres://x/y' }, store: createMemoryStore(), fetcher: certFetcher({ fetches: 0, certs: { [KID]: MAIN.pem } }), log: () => {} });
  const p = await call(prod, { headers: bearer(SUB_A) }); assert.equal(p.status, 503); assert.equal(p.json.code, 'PROTECTION_NOT_CONFIGURED');
  assert.deepEqual(userdataCaps({}), [[60, 60], [3000, 86400]], 'defaults leave room for normal sync (pull + batch + device per pass)');
  assert.throws(() => userdataCaps({ LIVON_USERDATA_MINUTE_LIMIT: '0' }));
});

test('AB-15 logs carry request id, route, method, status, code and latency only — no token, subject, account id or content', async () => {
  const srv = server();
  await post(srv, SUB_A, { op: 'batch', payload: { records: [rec('tasks', 'secret_task', { title: '비밀 제목' })] } });
  await call(srv.handler, { headers: bearer(SUB_A, { exp: 1 }) });
  const text = JSON.stringify(srv.logs);
  for (const l of srv.logs) assert.deepEqual(Object.keys(l).sort(), ['code', 'method', 'ms', 'rid', 'route', 'status']);
  const acct = [...srv.store._debug.accounts.keys()][0];
  for (const s of [SUB_A, acct, '비밀', 'secret_task', 'eyJ', PROJECT]) assert.ok(!text.includes(s), 'log leaks ' + s);
  const r = await pull(srv, SUB_A); assert.match(r.headers['x-request-id'], /^[0-9a-f]{12}$/);
});

/* ═════════════ 7. store contract (memory twin + real PostgreSQL) ═════════════ */
async function storeContract(store) {
  const A = await store.createAccount({ issuer: ISS, subject: SUB_A }, { now: T0 });
  const again = await store.createAccount({ issuer: ISS, subject: SUB_A }, { now: T0 });
  assert.equal(again.accountId, A.accountId); assert.equal(again.created, false);
  const B = await store.createAccount({ issuer: ISS, subject: SUB_B }, { now: T0 });
  assert.notEqual(A.accountId, B.accountId);
  assert.deepEqual(await store.findAccount({ issuer: ISS, subject: SUB_A }), { accountId: A.accountId, status: 'active' });
  assert.equal(await store.findAccount({ issuer: 'https://securetoken.google.com/newon-hq', subject: SUB_A }), null);
  const save = rec('saved_items', 'ext:kr-job-training:program:1', { id: 'ext:kr-job-training:program:1', title: '과정', folder: '취업', data: { snapshot: { provenance: { provider: 'kr-job-training', sourceKind: 'public' } } } });
  const w1 = await store.write(A.accountId, save, {}); assert.equal(w1.status, 'applied');
  const w2 = await store.write(A.accountId, save, {}); assert.equal(w2.status, 'conflict'); assert.deepEqual(w2.current.data, save.data);
  const w3 = await store.write(A.accountId, { ...save, data: { ...save.data, folder: '다른' }, serverRev: w1.serverRev, updatedAt: T0 + 5 }, {}); assert.equal(w3.status, 'applied'); assert.ok(w3.serverRev > w1.serverRev);
  await store.write(A.accountId, rec('calendar_items', 'e1', { title: '면접', date: '2026-10-05', start: '10:00' }), {});
  await store.write(A.accountId, rec('preferences', 'platform.alertPrefs', { value: { todo: true } }), {});
  await store.write(A.accountId, rec('journal', 'j1', { body: '기록' }), { sensitive: true });
  const t = await store.write(A.accountId, rec('calendar_items', 'e1', null, { deletedAt: T0 + 9, updatedAt: T0 + 9, serverRev: (await store.pull(A.accountId, { collection: 'calendar_items' })).records[0].serverRev }), {});
  assert.equal(t.status, 'applied');
  const all = await store.pull(A.accountId, { since: 0 });
  assert.deepEqual(all.records.map(r => r.collection).sort(), ['calendar_items', 'journal', 'preferences', 'saved_items']);
  assert.equal(all.records.find(r => r.id === 'e1').data, null);
  assert.equal(all.records.find(r => r.id === save.id).data.folder, '다른');
  assert.equal(all.serverRev, await store.serverRev(A.accountId));
  assert.ok(all.records.every(r => !('_sensitive' in r) && !('account_id' in r) && !('accountId' in r)));
  assert.equal((await store.pull(B.accountId, { since: 0 })).records.length, 0, 'account isolation');
  const page = await store.pull(A.accountId, { since: 0, limit: 2 }); assert.equal(page.records.length, 2); assert.equal(page.hasMore, true);
  const rest = await store.pull(A.accountId, { since: page.nextSince }); assert.equal(rest.records.length, 2); assert.equal(rest.hasMore, false);
  await store.touchDevice(A.accountId, 'dv_abc12345', { lastServerRev: 5, conflicts: 2, importDecided: true, now: T0 });
  await store.touchDevice(A.accountId, 'dv_abc12345', { lastServerRev: 3, conflicts: 1, importDecided: false, now: T0 + 1 });
  await assert.rejects(store.write(A.accountId, rec('ai_threads', 'x', { v: 1 }), {}), e => e.code === 'UNKNOWN_COLLECTION');
  return { A, B };
}
test('AB-16 store contract — in-memory twin (tests only)', async () => { await storeContract(createMemoryStore()); });

const PG = pgConfig();
test('AB-17 store contract + route end-to-end on a REAL PostgreSQL server (production SQL, migration applied twice)', { skip: PG ? false : 'LIVON_TEST_PG not set — PostgreSQL suite not run in this environment' }, async () => {
  const db = createTestDatabase(PG, 'livon_ab_' + process.pid);
  try {
    const store = createPostgresStore({ query: db.query });
    const { A } = await storeContract(store);
    await db.query(readFileSync(new URL('server/livon/userdata/migrations/001_account_backend.sql', ROOT), 'utf8').replace(/--.*$/gm, ''), []);
    const dev = await db.query('SELECT last_server_rev, conflict_count, import_decided_at FROM sync_metadata WHERE account_id = $1', [A.accountId]);
    assert.deepEqual(dev[0], { last_server_rev: '5', conflict_count: '3', import_decided_at: String(T0) }, 'GREATEST / sum / first decision kept');
    const gen = await db.query("SELECT item_type, folder, provider FROM saved_items WHERE account_id = $1", [A.accountId]);
    assert.equal(gen[0].provider, 'kr-job-training'); assert.equal(gen[0].folder, '다른');
    const sens = await db.query("SELECT sensitive FROM user_records WHERE account_id = $1 AND collection = 'journal'", [A.accountId]);
    assert.equal(sens[0].sensitive, 't');
    /* one identity → one account even when a second creation loses the race (ref exists → existing account returned) */
    const again = await store.createAccount({ issuer: ISS, subject: SUB_A }, { accountId: 'acct_' + 'f'.repeat(32) });
    assert.equal(again.accountId, A.accountId);
    assert.equal((await db.query("SELECT count(*) AS n FROM user_accounts WHERE account_id = $1", ['acct_' + 'f'.repeat(32)]))[0].n, '0', 'no orphan account row');
    await assert.rejects(db.query("INSERT INTO account_refs (issuer, subject, account_id, is_primary, created_at) VALUES ($1, 'userAlpha01', $2, false, 1)", [ISS, A.accountId]), /duplicate key|unique|already exists/i);
    await assert.rejects(db.query("INSERT INTO user_accounts (account_id, created_at) VALUES ('uid-not-opaque', 1)", []), /check|Failing row/i);
    /* the route with the PostgreSQL store */
    const srv = server({ store });
    const w = await post(srv, 'pgRouteUser1', { op: 'batch', payload: { records: [rec('tasks', 'todo_pg', { id: 'todo_pg', title: 'PG' })] } });
    assert.equal(w.json.results[0].status, 'applied');
    const p = await pull(srv, 'pgRouteUser1'); assert.equal(p.json.records[0].data.title, 'PG');
    assert.equal((await pull(srv, SUB_A)).json.records.some(r => r.id === 'todo_pg'), false);
    /* two devices syncing through the route + PostgreSQL */
    const d1 = device(srv), d2 = device(srv);
    d1.addTask('PG 동기화 할 일');
    await d1.signIn('pgSyncUser01'); await d1.S.approveImport({ collections: ['tasks'], includeSensitive: false });
    await d2.signIn('pgSyncUser01');
    assert.deepEqual(d2.titles(), ['PG 동기화 할 일']);
    /* DB-level backstops (migration CHECKs), independent of the application checks */
    const ins = (table, collection, id, data, deleted) => db.query(`INSERT INTO ${table} (account_id, collection, record_id, schema_version, data, created_at, updated_at, deleted_at, server_rev) VALUES ($1, $2, $3, 1, $4::jsonb, 1, 1, $5, 999)`, [A.accountId, collection, id, data, deleted]);
    await assert.rejects(ins('user_records', 'tasks', 'bad_tomb', '{"a":1}', 5), /check|Failing row/i, 'tombstone with data');
    await assert.rejects(ins('user_records', 'tasks', 'bad_live', null, null), /check|Failing row/i, 'live row without data');
    await assert.rejects(ins('user_records', 'tasks', 'bad_arr', '[1,2]', null), /check|Failing row/i, 'array data');
    await assert.rejects(ins('user_records', 'tasks', '__proto__', '{"a":1}', null), /check|Failing row/i, 'reserved id');
    await assert.rejects(ins('user_records', 'saved_items', 'x1', '{"a":1}', null), /check|Failing row/i, 'wrong table');
    await assert.rejects(ins('preferences', 'toString', 'x1', '{"a":1}', null), /check|Failing row/i, 'unknown collection');
    await assert.rejects(db.query("INSERT INTO user_records (account_id, collection, record_id, schema_version, data, created_at, updated_at, server_rev) VALUES ($1, 'tasks', 'big', 1, jsonb_build_object('v', repeat('x', 270000)), 1, 1, 999)", [A.accountId]), /check|Failing row/i, 'oversize data');
    /* D3 and D6 regressions through the PostgreSQL store */
    const p1 = device(srv), p2 = device(srv);
    await p1.signIn('pgRegress01'); p1.save({ id: 'ext:pg:1', title: '저장' }); await p1.S.syncNow();
    await p2.signIn('pgRegress01');
    const pf = p1.read(PF); pf.saves = []; p1.U.write(PF, pf); p1.save({ id: 'ext:pg:1', title: '저장' });
    await p1.S.syncNow(); await p2.S.syncNow();
    assert.deepEqual(p2.read(PF).saves.map(x => x.id), ['ext:pg:1'], 'D3 on PostgreSQL');
    const t = p1.addTask('PG 원본'); await p1.S.syncNow(); await p2.S.syncNow();
    p1.editTask(t, { title: 'PG A1' });
    p1.net.hold = (url, init) => init.method === 'POST' && String(init.body).includes('"op":"batch"');
    const pass = p1.S.syncNow(); await flush();
    p2.editTask(t, { title: 'PG B' }); await p2.S.syncNow();
    p1.editTask(t, { title: 'PG A2 전송 중' });
    p1.net.hold = null; p1.net.release(); await pass;
    await p1.S.syncNow(); await p2.S.syncNow();
    for (const D of [p1, p2]) assert.ok(D.titles().includes('PG A2 전송 중') && D.titles().includes('PG B'), 'D6 on PostgreSQL');
  } finally { db.drop(); }
});

test('AB-18 schema: every syncable collection has a table; no table or column for AI chats, recents, drafts, locations, tokens', () => {
  const sql = src('server/livon/userdata/migrations/001_account_backend.sql');
  const UDsrc = livon('data/livon-user-data.js');
  const policy = Object.keys(JSON.parse(/var POLICY = (\{[\s\S]*?\});/.exec(UDsrc)[1].replace(/(\w+):/g, '"$1":')));
  assert.deepEqual(Object.keys(TABLE_FOR).sort(), policy.sort());
  for (const t of ['user_accounts', 'account_refs', 'user_records', 'saved_items', 'calendar_items', 'preferences', 'sync_metadata']) assert.match(sql, new RegExp('CREATE TABLE IF NOT EXISTS ' + t + '\\b', 'i'));
  assert.match(sql, /PRIMARY KEY \(issuer, subject\)/i);
  assert.doesNotMatch(sql.replace(/--.*$/gm, ''), /\b(email|password|token|ai_thread|recent|draft|latitude|longitude)\b/i);
});

/* ═════════════ 8. client sync engine: two devices, real handler, real livon-user-data.js ═════════════ */
const ML = 'livon.mlStore.v1', PF = 'livon.platform.v1';
function mem(init = {}) {
  const m = new Map(Object.entries(init).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  const store = { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { if (store.fail && store.fail(k)) throw new Error('QuotaExceededError'); m.set(k, String(v)); }, removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m, fail: null };
  return store;
}
let clockSkew = 0;
function device(srv, { local = {}, ready = true } = {}) {
  const ls = mem(local), ss = mem();
  /* timers never run by themselves: a test fires them explicitly (e.g. the 4 s sign-out cap) */
  const timers = new Map(); let tid = 0;
  const ctx = { localStorage: ls, sessionStorage: ss, navigator: { onLine: true }, console, setTimeout: fn => { timers.set(++tid, fn); return tid; }, clearTimeout: id => timers.delete(id), addEventListener() {}, URL };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(livon('data/livon-user-data.js'), ctx);
  vm.runInContext(livon('data/livon-sync.js'), ctx);
  const net = { down: false, status: null, calls: [], hold: null, release: null };
  const resp = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
  const fetchImpl = async (url, init = {}) => {
    net.calls.push({ url, method: init.method || 'GET', body: init.body || '' });
    if (net.down) throw new TypeError('Failed to fetch');
    if (url === '/api/health') return resp(200, { ok: true, userdata: { ready } });
    if (net.status) return resp(net.status, { ok: false, code: 'STORE_UNAVAILABLE' });
    /* hold a request BEFORE it reaches the server (the token is already in its headers) until the test releases it */
    if (net.hold && net.hold(url, init)) await new Promise(r => { net.release = r; });
    const r = await call(srv.handler, { method: init.method, url, headers: init.headers, body: init.body });
    return resp(r.status, r.json);
  };
  let token = null;
  const reloads = [];
  const S = ctx.LivonSync.create({ fetchImpl, getToken: () => Promise.resolve(token), api: { url: p => p }, onProfileChanged: w => reloads.push(w) });
  const U = ctx.LivonUserData;
  const read = k => JSON.parse(ls.getItem(k) || 'null');
  const stamp = () => Date.now() + (clockSkew += 1000);
  const d = {
    ls, ss, U, S, net, reloads, ctx, read,
    fireTimers() { const fns = [...timers.values()]; timers.clear(); fns.forEach(f => f()); },
    signIn(sub) { token = jwt(claims(sub)); return S.onSignedIn({ issuer: ISS, subject: sub }); },
    setToken(t) { token = t; },
    async signOut(o = {}) { const r = await S.onSignedOut({ finalSync: true, ...o }); token = null; return r; },
    ml() { return read(ML) || { v: 2 }; },
    setMl(m) { U.write(ML, m); },
    addTask(title, extra = {}) { const m = d.ml(), t = stamp(); m.todos = (m.todos || []).concat([{ id: extra.id || 'todo_' + crypto.randomUUID().slice(0, 8), title, done: false, createdAt: t, updatedAt: t, ...extra }]); d.setMl(m); return m.todos.at(-1).id; },
    editTask(id, patch) { const m = d.ml(); m.todos = m.todos.map(x => (x.id === id ? { ...x, ...patch, updatedAt: stamp() } : x)); d.setMl(m); },
    deleteTask(id) { const m = d.ml(); m.todos = m.todos.filter(x => x.id !== id); d.setMl(m); },
    addEvent(ev) { const m = d.ml(), t = stamp(); m.events = (m.events || []).concat([{ allDay: false, createdAt: t, updatedAt: t, ...ev }]); d.setMl(m); },
    save(item) { const p = read(PF) || {}; p.saves = (p.saves || []).concat([{ savedAt: stamp(), ...item }]); U.write(PF, p); },
    titles() { return (d.ml().todos || []).map(x => x.title).sort(); },
    tasks() { return d.ml().todos || []; }
  };
  return d;
}
const J = x => JSON.parse(JSON.stringify(x));
const posts = d => d.net.calls.filter(c => c.method === 'POST');

/* ═════════════ 9. auth bridge + minimal UI ═════════════ */
/* ═════════════ 10. hardening V1.1 — regression tests for D1–D6 and imported items I1–I17 ═════════════ */
const flush = async (n = 30) => { for (let i = 0; i < n; i++) await new Promise(r => setImmediate(r)); };
const bare = () => { const ctx = { console, localStorage: mem() }; ctx.window = ctx; vm.createContext(ctx); vm.runInContext(livon('data/livon-user-data.js'), ctx); return ctx.LivonUserData; };
const good = (over = {}) => ({ id: 'todo_ok', collection: 'tasks', schemaVersion: 1, createdAt: T0, updatedAt: T0, deletedAt: null, localRev: 0, serverRev: null, data: { id: 'todo_ok', title: 'x' }, ...over });

test('D1 prototype-named collections and ids are refused everywhere (browser contract, route, store, merge)', async () => {
  const U = bare();
  for (const c of ['toString', 'constructor', '__proto__', 'prototype', 'hasOwnProperty', 'valueOf']) assert.equal(U.validateRecord(good({ collection: c })), 'record:collection', c);
  for (const id of ['__proto__', 'constructor', 'prototype', 'toString', 'hasOwnProperty', 'valueOf']) assert.equal(U.validateRecord(good({ id, data: { title: 'x' } })), 'record:id', id);
  const srv = server();
  for (const c of ['toString', 'constructor']) { const r = await post(srv, SUB_A, { op: 'batch', payload: { records: [good({ collection: c })] } }); assert.equal(r.status, 400); assert.equal(r.json.code, 'INVALID_PAYLOAD'); }
  for (const id of ['constructor', 'toString', 'prototype']) { const r = await post(srv, SUB_A, { op: 'batch', payload: { records: [good({ id, data: { title: 'x' } })] } }); assert.equal(r.status, 400, id); }
  const raw = '{"op":"batch","payload":{"records":[{"id":"__proto__","collection":"tasks","schemaVersion":1,"createdAt":1,"updatedAt":1,"deletedAt":null,"localRev":0,"serverRev":null,"data":{"t":1}}]}}';
  assert.equal((await post(srv, SUB_A, raw)).status, 400);
  assert.equal((await pull(srv, SUB_A, '?collection=toString')).status, 400);
  const store = createMemoryStore(); const a = await store.createAccount({ issuer: ISS, subject: SUB_A });
  await assert.rejects(store.write(a.accountId, good({ collection: 'toString' }), {}), e => e.code === 'UNKNOWN_COLLECTION');
  await assert.rejects(store.pull(a.accountId, { collection: 'constructor' }), e => e.code === 'UNKNOWN_COLLECTION');
  const m = U.mergeCollection([good({ id: 'toString', data: { a: 1 } })], [good({ id: 'toString', data: { a: 2 }, updatedAt: T0 + 5 })], { lastSyncedAt: 0 });
  assert.equal(m.records.length, 2, 'merge map has no inherited keys');
  assert.equal(({}).t, undefined); assert.equal(Object.prototype.polluted, undefined);
});

test('D2 excessive nesting and deeply hidden prototype keys are refused (fail closed, not skipped)', async () => {
  const U = bare();
  const nest = (depth, leaf) => { let o = leaf; for (let i = 0; i < depth; i++) o = { n: o }; return o; };
  assert.equal(U.validateRecord(good({ data: nest(20, { v: 1 }) })), 'record:forbidden-key', 'deep plain nesting');
  const hidden = JSON.parse('{"a":' + '{"b":'.repeat(14) + '{"__proto__":{"x":1}}' + '}'.repeat(14) + '}');
  assert.equal(U.validateRecord(good({ data: hidden })), 'record:forbidden-key', 'deep __proto__');
  assert.equal(U.validateRecord(good({ data: JSON.parse('{"a":{"constructor":{"prototype":{"x":1}}}}') })), 'record:forbidden-key');
  assert.equal(U.validateRecord(good({ data: nest(8, { v: 1 }) })), '', 'normal LIVON depth still accepted');
  const srv = server();
  const r = await post(srv, SUB_A, JSON.stringify({ op: 'batch', payload: { records: [good({ data: nest(30, { v: 1 }) })] } }));
  assert.equal(r.status, 400);
  const r2 = await post(srv, SUB_A, '{"op":"batch","payload":{"records":[{"id":"p","collection":"tasks","schemaVersion":1,"createdAt":1,"updatedAt":1,"deletedAt":null,"localRev":0,"serverRev":null,"data":' + '{"a":'.repeat(16) + '{"__proto__":{"polluted":1}}' + '}'.repeat(16) + '}]}}');
  assert.equal(r2.status, 400); assert.equal(({}).polluted, undefined);
});

test('I3 secrets, tokens, raw payloads and user location are refused by the shared contract and the route (and stripped on collect)', async () => {
  const U = bare();
  for (const k of ['token', 'idToken', 'id_token', 'refreshToken', 'refresh_token', 'accessToken', 'access_token', 'authorization', 'cookie', 'apiKey', 'api_key', 'privateKey', 'private_key', 'clientSecret', 'password', 'secret', 'rawResponse', 'rawServerResponse', 'coords', 'myLocation', 'nearbySearchOrigin'])
    assert.equal(U.validateRecord(good({ data: { id: 'todo_ok', title: 'x', [k]: 'v' } })), 'record:private-field', k);
  assert.equal(U.validateRecord(good({ data: { id: 'todo_ok', snapshot: { provenance: { authorization: 'Bearer abc' } } } })), 'record:private-field', 'nested');
  assert.equal(U.validateRecord(good({ data: { id: 'todo_ok', items: [{ idToken: 'x' }] } })), 'record:private-field', 'inside arrays');
  const srv = server();
  const r = await post(srv, SUB_A, { op: 'batch', payload: { records: [good({ data: { id: 'todo_ok', title: 'x', idToken: 'eyJ.fake.token' } })] } });
  assert.equal(r.status, 400); assert.equal(r.json.code, 'INVALID_PAYLOAD');
  assert.equal(srv.store._debug.rows.size, 0, 'nothing stored');
  const ctx = { console, localStorage: mem({ [ML]: { v: 2, todos: [{ id: 'todo_s', title: '할 일', accessToken: 'secret-value', note: { coords: [37, 127] }, createdAt: T0 }] } }) };
  ctx.window = ctx; vm.createContext(ctx); vm.runInContext(livon('data/livon-user-data.js'), ctx);
  const recs = ctx.LivonUserData.collectAccountRecords({}).records;
  assert.equal(recs.length, 1); assert.ok(!JSON.stringify(recs).includes('secret-value') && !JSON.stringify(recs).includes('coords'), 'collect strips them before anything is sent');
});

test('I12 singleton records: only LIVON\'s own settings / folder / progress ids; data.id must equal the record id', async () => {
  const U = bare();
  const pref = (collection, id, data = { value: 1 }) => good({ collection, id, data });
  for (const id of ['ml.folders', 'ml.settings', 'platform.alertPrefs', 'platform.region', 'livon.lifeStage', 'livon.tdPrefs']) assert.equal(U.validateRecord(pref('preferences', id)), '', id);
  assert.equal(U.validateRecord(pref('save_folders', 'platform.folders', { values: ['a'] })), '');
  assert.equal(U.validateRecord(pref('life_progress', 'livon.lifeHub.checklist.v1')), '');
  assert.equal(U.validateRecord(pref('budgets', 'ml.budgets', { monthly: 1 })), '');
  for (const [c, id] of [['preferences', 'evil.setting'], ['preferences', 'livon.aiStore.v1'], ['save_folders', 'other.folders'], ['life_progress', 'livon.lifeStage'], ['budgets', 'budget2']])
    assert.equal(U.validateRecord(pref(c, id)), 'record:id-not-allowed', c + ' ' + id);
  assert.equal(U.validateRecord(good({ id: 'todo_a', data: { id: 'todo_b', title: 'x' } })), 'record:data-id');
  assert.equal(U.validateRecord(good({ id: '5', data: { id: 5, title: 'x' } })), '', 'numeric item ids match as strings');
  assert.equal(U.validateRecord(good({ deletedAt: T0 + 1, data: { id: 'todo_ok' } })), 'record:tombstone-data');
  assert.equal(U.validateRecord(good({ data: [1, 2] })), 'record:data');
  const srv = server();
  for (const rec2 of [pref('preferences', 'evil.setting'), good({ id: 'todo_a', data: { id: 'todo_b' } })]) {
    const r = await post(srv, SUB_A, { op: 'batch', payload: { records: [rec2] } }); assert.equal(r.status, 400);
  }
});

test('I8 claim consistency: auth_time after iat, exp not after iat, zero times are refused', async () => {
  const srv = server();
  const t = Math.floor(Date.now() / 1000);
  for (const [over, why] of [[{ auth_time: t - 5, iat: t - 10 }, 'auth_time after iat'], [{ iat: t - 10, exp: t - 10 }, 'exp == iat'], [{ iat: 0 }, 'iat 0'], [{ auth_time: 0 }, 'auth_time 0'], [{ iat: 'x' }, 'non-numeric']]) {
    const r = await call(srv.handler, { headers: bearer(SUB_A, over) });
    assert.equal(r.status, 401, why);
  }
  assert.equal((await call(srv.handler, { headers: bearer(SUB_A) })).status, 200);
});

test('I9 duplicate Authorization headers → 400; declared oversize body → 413 before any token or body work', async () => {
  const srv = server();
  const res = { statusCode: 200, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } };
  const t = jwt(claims(SUB_A));
  await srv.handler({ method: 'GET', url: '/api/livon/userdata', headers: { host: 'api.newon.app', authorization: 'Bearer ' + t }, rawHeaders: ['Host', 'api.newon.app', 'Authorization', 'Bearer ' + t, 'authorization', 'Bearer ' + jwt(claims(SUB_B))] }, res);
  assert.equal(res.statusCode, 400); assert.equal(JSON.parse(res.body).code, 'MALFORMED_TOKEN');
  assert.equal(srv.store._debug.refs.size, 0);
  const fresh = server();
  const r = await call(fresh.handler, { method: 'POST', headers: { ...bearer(SUB_A), 'content-type': 'application/json', 'content-length': String(BODY_MAX + 1) }, body: '{}' });
  assert.equal(r.status, 413); assert.equal(r.json.code, 'PAYLOAD_TOO_LARGE');
  assert.equal(fresh.certState.fetches, 0, 'rejected before token verification');
});

test('I10 PostgreSQL: production refuses weak TLS (503, health not ready), sslmode never weakens verification, timeouts set, errors never leak', async () => {
  const { databaseConfig, createPoolQuery, POOL_OPTIONS, postgresQueryFromEnv } = await import('../../server/livon/userdata/store.mjs');
  const base = 'postgres://qa:not-a-real-password@db.example.invalid/livon';
  for (const mode of ['disable', 'allow', 'prefer', 'no-verify']) {
    assert.deepEqual(databaseConfig({ NODE_ENV: 'production', LIVON_DATABASE_URL: base + '?sslmode=' + mode }), { ok: false, reason: 'TLS_REQUIRED' }, mode);
    assert.deepEqual(databaseConfig({ VERCEL: '1', LIVON_DATABASE_URL: base + '?sslmode=' + mode }).reason, 'TLS_REQUIRED');
  }
  const prod = databaseConfig({ NODE_ENV: 'production', LIVON_DATABASE_URL: base + '?sslmode=require&application_name=livon' });
  assert.equal(prod.ok, true); assert.deepEqual(prod.ssl, { rejectUnauthorized: true }); assert.doesNotMatch(prod.connectionString, /sslmode/); assert.match(prod.connectionString, /application_name=livon/);
  assert.equal(databaseConfig({ LIVON_DATABASE_URL: base + '?sslmode=disable' }).ssl, false, 'plain only for a local development database');
  assert.deepEqual(databaseConfig({ LIVON_DATABASE_URL: base }).ssl, { rejectUnauthorized: true });
  assert.equal(await postgresQueryFromEnv({ NODE_ENV: 'production', LIVON_DATABASE_URL: base + '?sslmode=disable' }), null);
  const env = { NODE_ENV: 'production', NEWON_AUTH_VERIFY_ENABLED: 'true', NEWON_PLUS_FIREBASE_PROJECT_ID: PROJECT, LIVON_USERDATA_ENABLED: 'true', LIVON_DATABASE_URL: base + '?sslmode=disable', UPSTASH_REDIS_REST_URL: 'https://x', UPSTASH_REDIS_REST_TOKEN: 't', LIVON_RATE_LIMIT_SECRET: 'x'.repeat(32) };
  const r = await call(createUserDataHandler({ env, log: () => {} }), { headers: bearer(SUB_A) });
  assert.equal(r.status, 503); assert.equal(r.json.code, 'SERVER_NOT_CONFIGURED');
  assert.equal(userdataStatus(env).database, false);
  const hr = await call(createHealthHandler({ env }), { url: '/api/health' }); assert.equal(hr.json.userdata.ready, false);
  /* pool: timeouts, idle-error listener, sanitized errors */
  let made = null;
  class FakePool { constructor(o) { made = o; this.listeners = {}; } on(ev, fn) { this.listeners[ev] = fn; } async query() { const e = new Error('canceling statement due to statement timeout: SELECT secret_column FROM x'); e.code = '57014'; throw e; } }
  const q = createPoolQuery(FakePool, prod);
  assert.equal(made.query_timeout, 8000); assert.equal(made.connectionTimeoutMillis, 5000); assert.equal(made.max, 3); assert.deepEqual(made.ssl, { rejectUnauthorized: true });
  assert.equal(POOL_OPTIONS.query_timeout, 8000);
  await assert.rejects(q('SELECT 1', []), e => e.code === 'STORE_UNAVAILABLE' && e.sqlState === '57014' && !/secret_column/.test(e.message));
  /* the route turns a slow / failing database into 503 STORE_UNAVAILABLE without detail */
  const slow = createMemoryStore(); slow.findAccount = async () => { const e = new Error('Query read timeout host=db.internal password=x'); e.code = 'STORE_UNAVAILABLE'; throw e; };
  const s2 = server({ store: slow });
  const r2 = await call(s2.handler, { headers: bearer(SUB_A) });
  assert.equal(r2.status, 503); assert.equal(r2.json.code, 'STORE_UNAVAILABLE'); assert.doesNotMatch(r2.raw, /db\.internal|password|timeout/i);
});

test('I13 remote adapter: no cookies, no redirects (a redirected response is refused), bounded by a 25 s timeout', async () => {
  const timers = []; const aborted = [];
  class AC { constructor() { this.signal = { aborted: false }; } abort() { this.signal.aborted = true; aborted.push(1); } }
  const ctx = { console, localStorage: mem(), AbortController: AC, setTimeout: (fn, ms) => { timers.push([fn, ms]); return timers.length; }, clearTimeout() {} };
  ctx.window = ctx; vm.createContext(ctx); vm.runInContext(livon('data/livon-user-data.js'), ctx);
  const seen = [];
  let reply = { ok: true, status: 200, json: async () => ({ ok: true, records: [] }) };
  const adapter = ctx.LivonUserData.createRemoteAdapter({ endpoint: '/api/livon/userdata', getAccessToken: () => Promise.resolve('h.p.s'), fetchImpl: async (u, init) => { seen.push(init); return reply; } });
  await adapter.pull(0, 10); await adapter.syncMeta();
  for (const init of seen) { assert.equal(init.credentials, 'omit'); assert.equal(init.redirect, 'error'); assert.ok(init.signal); }
  assert.ok(timers.every(([, ms]) => ms === 25000) && timers.length === 2);
  timers[0][0](); assert.equal(aborted.length, 1, 'the timer aborts the request');
  reply = { ok: true, status: 200, redirected: true, json: async () => ({ ok: true }) };
  await assert.rejects(adapter.syncMeta(), e => e.code === 'REMOTE_REJECTED');
  const cross = ctx.LivonUserData.createRemoteAdapter({ endpoint: 'https://evil.example/api/livon/userdata', getAccessToken: () => 'x', fetchImpl: async () => reply });
  assert.equal(cross.configured, false, 'only the configured LIVON API origin');
});

test('I15 settings carry the time their store really changed (newer-wins compares real edits, not "now")', async () => {
  const U = bare();
  U.write(PF, { alertPrefs: { todo: true } });
  const changedAt = U.meta().stores[PF].changedAt;
  await new Promise(r => setTimeout(r, 15));
  const rec2 = U.collectAccountRecords({}).records.find(r => r.id === 'platform.alertPrefs');
  assert.equal(rec2.updatedAt, changedAt);
});

/* ═════════════ 11. public anonymous mode (2026-09-30): Newon+ sign-in and sync not offered yet ═════════════ */
