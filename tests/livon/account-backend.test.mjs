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

test('AB-19 first sign-in: nothing uploads before consent; counts offered; sensitive unchecked; approve uploads only the ticked collections', async () => {
  const srv = server();
  const A = device(srv, { local: { [ML]: { v: 2, todos: [{ id: 'todo_a', title: '이력서', createdAt: T0, updatedAt: T0 }], journal: [{ id: 'j_1', title: '일기', body: '개인', createdAt: T0 }], health: [{ id: 'h_1', title: '혈압', createdAt: T0 }] },
    [PF]: { saves: [{ id: 'ext:kr-job-training:program:AIG1', title: '웹 개발 과정', savedAt: T0, data: { snapshot: { provenance: { provider: 'kr-job-training', sourceKind: 'public', attribution: '출처: 고용24' } } } }] }, 'livon.aiStore.v1': { threads: [{ id: 'th', messages: [{ role: 'user', content: '비밀 상담' }] }] } } });
  const st = await A.signIn(SUB_A);
  assert.equal(st.status, 'waiting-consent');
  assert.deepEqual(J(st.pending.counts), { tasks: 1, saved_items: 1 });
  assert.deepEqual(J(st.pending.sensitiveCounts), { journal: 1, health_records: 1 });
  assert.equal(posts(A).length, 0, 'signing in uploads nothing');
  assert.equal(A.S.activeProfile().kind, 'anon', 'no profile swap before a decision');
  const r = await A.S.approveImport({ collections: ['tasks', 'saved_items', 'journal'], includeSensitive: false });
  assert.equal(r.status, 'IMPORTED'); assert.equal(r.sync, 'synced');
  const server_ = (await pull(srv, SUB_A)).json.records;
  assert.deepEqual(server_.map(x => x.collection).sort(), ['saved_items', 'tasks'], 'journal was ticked but sensitive consent was not given → not uploaded');
  assert.ok(!JSON.stringify(server_).includes('비밀 상담'), 'AI conversations never sync');
  assert.equal(A.S.activeProfile().kind, 'account');
  assert.ok(A.read('livon.vault.anon.v1').ml.journal.length === 1, 'this device\'s own data waits untouched in the anonymous vault');
  assert.deepEqual(A.reloads, ['signed-in']);
  for (const k of A.ls._m.keys()) if (k.startsWith('livon.')) assert.notEqual(A.U.classify(k), 'UNKNOWN', 'unclassified key ' + k);
});

test('AB-20 multi-device: B receives A\'s data (provenance intact); edits, saves, folders and deletions propagate both ways without resurrection', async () => {
  const srv = server();
  const A = device(srv), B = device(srv);
  await A.signIn(SUB_A);
  const t1 = A.addTask('A가 만든 할 일');
  A.save({ id: 'ext:kr-job-training:program:X1', title: '과정', folder: '취업', data: { snapshot: { provenance: { provider: 'kr-job-training', sourceKind: 'public', livonFetchedAt: '2026-09-29T00:00:00.000Z' } } } });
  await A.S.syncNow();
  const st = await B.signIn(SUB_A);
  assert.equal(st.status, 'synced', 'empty device: no consent needed, account data downloaded');
  assert.deepEqual(B.titles(), ['A가 만든 할 일']);
  assert.deepEqual(B.read(PF).saves[0].data.snapshot.provenance, { provider: 'kr-job-training', sourceKind: 'public', livonFetchedAt: '2026-09-29T00:00:00.000Z' });
  B.editTask(t1, { title: 'B가 고친 제목' }); await B.S.syncNow();
  await A.S.syncNow(); assert.deepEqual(A.titles(), ['B가 고친 제목']);
  assert.ok(A.S.status().changedSinceLoad > 0, 'UI is told to refresh');
  B.save({ id: 'ext:x:2', title: 'B 저장' }); A.save({ id: 'ext:x:3', title: 'A 저장' });
  const pa = A.read(PF); pa.folders = ['취업']; A.U.write(PF, pa);
  const pb = B.read(PF); pb.folders = ['주거']; B.U.write(PF, pb);
  await B.S.syncNow(); await A.S.syncNow(); await B.S.syncNow();
  for (const D of [A, B]) {
    assert.deepEqual(D.read(PF).saves.map(s => s.id).sort(), ['ext:kr-job-training:program:X1', 'ext:x:2', 'ext:x:3'], 'saves union');
    assert.deepEqual([...D.read(PF).folders].sort(), ['주거', '취업'], 'folders union');
  }
  A.deleteTask(t1); await A.S.syncNow();
  await B.S.syncNow(); assert.deepEqual(B.titles(), [], 'deletion reached B');
  await B.S.syncNow(); await A.S.syncNow(); await B.S.syncNow();
  assert.deepEqual(A.titles(), []); assert.deepEqual(B.titles(), [], 'no resurrection');
  const srvRec = (await pull(srv, SUB_A)).json.records.find(r => r.id === t1);
  assert.ok(srvRec.deletedAt && srvRec.data === null, 'server keeps a tombstone, not a hard delete');
});

test('AB-21 conflicts: both edit → conflict copy kept on every device; edit after delete survives; preference newer value + report', async () => {
  const srv = server();
  const A = device(srv), B = device(srv);
  await A.signIn(SUB_A); const t = A.addTask('원래'); await A.S.syncNow();
  await B.signIn(SUB_A);
  A.editTask(t, { title: 'A 버전' }); B.editTask(t, { title: 'B 버전' });
  await B.S.syncNow(); await A.S.syncNow(); await B.S.syncNow();
  for (const D of [A, B]) {
    assert.deepEqual(D.titles(), ['A 버전', 'B 버전'], 'neither edit is lost');
    const copy = D.tasks().find(x => x.conflictOf);
    assert.equal(copy.conflictOf, t); assert.equal(copy.title, 'A 버전');
  }
  const t2 = A.addTask('지울 것'); await A.S.syncNow(); await B.S.syncNow();
  A.deleteTask(t2); await A.S.syncNow();
  B.editTask(t2, { title: '삭제 뒤에 고친 것' }); await B.S.syncNow();
  await A.S.syncNow();
  for (const D of [A, B]) assert.ok(D.titles().includes('삭제 뒤에 고친 것'), 'the later edit survives the earlier deletion');
  const pa = A.read(PF) || {}; pa.alertPrefs = { todo: false }; A.U.write(PF, pa);
  const pb = B.read(PF) || {}; pb.alertPrefs = { todo: true, event: false }; B.U.write(PF, pb);
  await A.S.syncNow(); await B.S.syncNow(); await A.S.syncNow();
  assert.deepEqual(A.read(PF).alertPrefs, B.read(PF).alertPrefs, 'devices converge on one preference value');
  assert.ok(srv.store._debug.devices.size >= 2, 'per-device sync metadata recorded (conflict counts)');
  assert.ok([...srv.store._debug.devices.values()].some(v => v.conflicts > 0));
});

test('AB-22 calendar duplicates and repeated LIVON AI approvals from two devices collapse to one (same survivor everywhere)', async () => {
  const srv = server();
  const A = device(srv), B = device(srv);
  await A.signIn(SUB_A); await B.signIn(SUB_A);
  A.addEvent({ id: 'event_a', title: '면접', date: '2026-10-05', start: '10:00', end: '11:00', category: '예약' });
  B.addEvent({ id: 'event_b', title: '면접', date: '2026-10-05', start: '10:00', end: '11:00', category: '예약' });
  A.addTask('포트폴리오 정리', { id: 'todo_ai_a', source: 'livon-ai', sourceHref: '#livon-ai' });
  B.addTask('포트폴리오 정리', { id: 'todo_ai_b', source: 'livon-ai', sourceHref: '#livon-ai' });
  await A.S.syncNow(); await B.S.syncNow(); await A.S.syncNow(); await B.S.syncNow();
  for (const D of [A, B]) {
    assert.deepEqual(D.ml().events.map(e => e.id), ['event_a'], 'one calendar entry');
    assert.deepEqual(D.ml().events[0].mergedIds, ['event_b']);
    assert.deepEqual(D.tasks().map(x => x.id), ['todo_ai_a'], 'AI approval idempotent across devices');
  }
  const recs = (await pull(srv, SUB_A)).json.records;
  assert.ok(recs.find(r => r.id === 'event_b').deletedAt); assert.ok(recs.find(r => r.id === 'todo_ai_b').deletedAt);
  B.addEvent({ id: 'event_c', title: '면접', date: '2026-10-06', start: '10:00' });
  await B.S.syncNow(); await A.S.syncNow();
  assert.equal(A.ml().events.length, 2, 'different dates are not duplicates');
});

test('AB-23 sensitive data stays on the device until the user turns sensitive sync on', async () => {
  const srv = server();
  const A = device(srv);
  await A.signIn(SUB_A);
  const m = A.ml(); m.journal = [{ id: 'j_9', title: '일기', body: '개인', createdAt: T0 }]; m.transactions = [{ id: 'tx_9', title: '월세', amount: 1, createdAt: T0 }]; A.setMl(m);
  await A.S.syncNow();
  let recs = (await pull(srv, SUB_A)).json.records;
  assert.equal(recs.filter(r => ['journal', 'transactions'].includes(r.collection)).length, 0);
  assert.ok(!posts(A).some(c => c.body.includes('개인')), 'sensitive content never left the device');
  A.S.setSensitive(true); await A.S.syncNow();
  recs = (await pull(srv, SUB_A)).json.records;
  assert.deepEqual(recs.filter(r => ['journal', 'transactions'].includes(r.collection)).map(r => r.id).sort(), ['j_9', 'tx_9']);
});

test('AB-24 offline / server errors never lose local data; reconnect resumes and uploads the pending change', async () => {
  const srv = server();
  const A = device(srv);
  await A.signIn(SUB_A); const t = A.addTask('오프라인 전'); await A.S.syncNow();
  A.net.down = true; A.editTask(t, { title: '오프라인에서 고침' });
  let st = await A.S.syncNow();
  assert.equal(st.status, 'offline'); assert.deepEqual(A.titles(), ['오프라인에서 고침']);
  A.net.down = false; A.net.status = 503;
  st = await A.S.syncNow(); assert.equal(st.status, 'error'); assert.equal(st.errorCode, 'STORE_UNAVAILABLE'); assert.deepEqual(A.titles(), ['오프라인에서 고침']);
  A.net.status = null;
  st = await A.S.syncNow(); assert.equal(st.status, 'synced');
  assert.equal((await pull(srv, SUB_A)).json.records.find(r => r.id === t).data.title, '오프라인에서 고침');
  const B = device(srv, { ready: false });
  B.addTask('서버 준비 전');
  st = await B.signIn(SUB_A);
  assert.equal(st.status, 'unavailable'); assert.equal(B.S.activeProfile().kind, 'anon'); assert.deepEqual(B.titles(), ['서버 준비 전']); assert.equal(posts(B).length, 0);
});

test('AB-25 logout keeps this device\'s data; re-login restores the account offline; explicit "forget" removes only the local account copy', async () => {
  const srv = server();
  const A = device(srv, { local: { [ML]: { v: 2, todos: [{ id: 'todo_mine', title: '내 기기 할 일', createdAt: T0, updatedAt: T0 }] } } });
  await A.signIn(SUB_A); await A.S.declineImport();
  assert.equal((await pull(srv, SUB_A)).json.records.length, 0, 'declined → nothing uploaded');
  assert.deepEqual(A.titles(), [], 'account profile starts empty (device data waits in the vault)');
  A.addTask('계정 할 일'); await A.S.syncNow();
  await A.signOut();
  assert.deepEqual(A.titles(), ['내 기기 할 일'], 'sign-out restores this device\'s own data');
  assert.equal(A.S.activeProfile().kind, 'anon');
  const vaults = [...A.ls._m.keys()].filter(k => k.startsWith('livon.vault.acct.'));
  assert.equal(vaults.length, 1, 'account copy cached for offline use');
  A.net.down = true;
  const st = await A.signIn(SUB_A);
  assert.equal(st.status, 'unavailable', 'server unreachable → stays on device data');
  A.net.down = false;
  const st2 = await A.signIn(SUB_A);
  assert.equal(st2.status, 'synced', 'consent is not asked again for an account already decided on this device');
  assert.deepEqual(A.titles(), ['계정 할 일']);
  await A.signOut({ forgetAccountOnDevice: true });
  assert.equal([...A.ls._m.keys()].filter(k => k.startsWith('livon.vault.acct.') || k.startsWith('livon.sync.v1:')).length, 0);
  assert.deepEqual(A.titles(), ['내 기기 할 일'], 'forget never touches this device\'s own data');
  assert.equal((await pull(srv, SUB_A)).json.records.filter(r => !r.deletedAt).length, 1, 'server data stays');
});

test('AB-26 account switch A → B on one device: B never sees A\'s data, A\'s data never reaches B\'s account', async () => {
  const srv = server();
  const D = device(srv);
  await D.signIn(SUB_A); D.addTask('A 전용'); D.save({ id: 'ext:a:1', title: 'A 저장' }); await D.S.syncNow();
  const st = await D.signIn(SUB_B);
  assert.equal(st.status, 'synced');
  assert.deepEqual(D.titles(), [], 'no A task in B\'s profile');
  assert.deepEqual((D.read(PF) || {}).saves || [], []);
  D.addTask('B 전용'); await D.S.syncNow();
  const bRecs = (await pull(srv, SUB_B)).json.records;
  assert.deepEqual(bRecs.map(r => r.data && r.data.title), ['B 전용']);
  assert.ok(!(await pull(srv, SUB_A)).json.records.some(r => r.data && r.data.title === 'B 전용'));
  assert.ok(D.reloads.includes('switched'));
  const sA = D.S.accountKey({ issuer: ISS, subject: SUB_A }), sB = D.S.accountKey({ issuer: ISS, subject: SUB_B });
  assert.notEqual(sA, sB); assert.ok(!sA.includes(SUB_A), 'local scope key is a hash, not the uid');
  await D.signOut();
  const E = device(srv, { local: Object.fromEntries(D.ls._m) });
  const st2 = await E.signIn(SUB_A);
  assert.deepEqual(E.titles(), ['A 전용'], 'A gets exactly A\'s data back');
  assert.equal(st2.status, 'synced');
});

test('AB-27 tombstones stay capped; sync state and vault keys are classified DEVICE_LOCAL (never uploaded)', () => {
  const U = device(server()).U;
  for (const k of ['livon.activeProfile.v1', 'livon.vault.anon.v1', 'livon.vault.acct.k1.v1', 'livon.sync.v1:k1']) assert.equal(U.classify(k), 'DEVICE_LOCAL', k);
  assert.match(livon('data/livon-user-data.js'), /MAX_TOMBSTONES = 1000/);
  assert.match(livon('data/livon-user-data.js'), /snap\.tombstones\.slice\(-MAX_TOMBSTONES\)/);
});

/* ═════════════ 9. auth bridge + minimal UI ═════════════ */
test('AB-28 bridge (account sync launched): sign-in → LivonSync.onSignedIn once per subject; a finished anonymous state → onSignedOut; approve without a pending consent = SYNC_NOT_AVAILABLE', () => {
  const calls = [];
  let sub = null;
  const ctx = { console, localStorage: mem(), LIVON_ACCOUNT_SYNC_PUBLIC: true };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(livon('data/livon-user-data.js'), ctx);
  ctx.LivonSync = { onSignedIn: s => calls.push(['in', s.subject]), onSignedOut: o => calls.push(['out', o.finalSync]), status: () => ({ status: 'idle', signedIn: false }), activeProfile: () => ({ kind: 'anon' }) };
  ctx.NewonAuth = { subscribe: fn => { sub = fn; } };
  vm.runInContext(livon('data/livon-auth-bridge.js'), ctx);
  sub({ state: { status: 'loading' } });
  sub({ state: { status: 'authenticated', session: { issuer: ISS, subject: SUB_A } } });
  sub({ state: { status: 'authenticated', session: { issuer: ISS, subject: SUB_A } } });
  sub({ state: { status: 'anonymous' } });
  assert.deepEqual(calls, [['in', SUB_A], ['out', false]]);
  assert.equal(ctx.LivonAuthBridge.SYNC_ENDPOINT_ENABLED, false);
  const html = src('livon/index.html');
  assert.ok(html.indexOf('/livon/data/livon-sync.js') > 0 && html.indexOf('/livon/data/livon-sync.js') < html.indexOf('/livon/data/livon-auth-bridge.js'), 'engine loads before the bridge');
  assert.ok(html.indexOf('/livon/livon-account-ui.js') > html.indexOf('/livon/life-now-page.js'));
});

test('AB-29 account panel: hidden without a Newon+ project; buttons only for enabled providers; no email/uid/token in the UI; consent defaults', () => {
  const el = { innerHTML: '', hidden: true, querySelector: () => null };
  const body = { appendChild(x) { body.child = x; } };
  const doc = { readyState: 'complete', body, addEventListener() {}, querySelectorAll: () => [el], querySelector: () => el, createElement: () => ({ remove() {}, querySelector: () => null, set innerHTML(v) { this.html = v; } }), activeElement: null };
  const load = (auth, sync, launched = true) => {
    const ctx = { document: doc, console, localStorage: mem(), NewonAuth: auth, LivonSync: sync, LivonUserData: { SENSITIVE_COLLECTIONS: ['journal', 'transactions', 'health_records', 'budgets'] }, LIVON_ACCOUNT_SYNC_PUBLIC: launched };
    ctx.window = ctx; vm.createContext(ctx); vm.runInContext(livon('livon-account-ui.js'), ctx); return ctx.LivonAccountUI;
  };
  const auth = (state, providers = []) => ({ getState: () => state, providers: () => providers, subscribe() {}, signIn: async () => {}, signOut: async () => {} });
  assert.equal(load(undefined, undefined).panelHtml(), '');
  assert.equal(load(auth({ configured: false, status: 'anonymous' }), undefined).panelHtml(), '', 'no Newon+ project → nothing rendered');
  assert.equal(load(auth({ configured: true, status: 'anonymous' }, []), undefined).panelHtml(), '', 'no enabled provider → no button');
  const out = load(auth({ configured: true, status: 'anonymous' }, ['google.com']), undefined).panelHtml();
  assert.match(out, /data-livon-signin="google.com"/); assert.doesNotMatch(out, /apple\.com/);
  const sync = { status: () => ({ status: 'waiting-consent', signedIn: true, pending: { counts: { tasks: 2 }, sensitiveCounts: { journal: 1 } } }), subscribe() {}, activeProfile: () => ({ kind: 'anon' }) };
  const ui = load(auth({ configured: true, status: 'authenticated', session: { subject: SUB_A, email: 'me@example.com', issuer: ISS } }, ['google.com']), sync);
  const signed = ui.panelHtml();
  assert.match(signed, /로그아웃/); assert.match(signed, /가져오기 선택/);
  assert.ok(!signed.includes(SUB_A) && !signed.includes('me@example.com'), 'no identity shown');
  ui.openConsent();
  const dlg = body.child.html;
  assert.match(dlg, /이 기기의 데이터를 계정에 저장할까요\?/);
  assert.match(dlg, /data-livon-import-col="tasks" checked/, 'non-sensitive starts checked');
  assert.match(dlg, /data-livon-import-col="journal" \/>/, 'sensitive starts unchecked');
  assert.match(dlg, /이 기기에만 두기/);
  assert.match(livon('life-now-page.js'), /<div data-livon-account-panel hidden><\/div>/);
});

test('AB-30 no secrets or live claims: no private keys, service accounts, connection strings or LIVE labels in the shipped account code', () => {
  const files = ['api/livon/userdata.mjs', 'server/livon/userdata/http.mjs', 'server/livon/userdata/store.mjs', 'server/newon/auth/firebase-verifier.mjs', 'server/livon/ratelimit.mjs', 'livon/data/livon-sync.js', 'livon/livon-account-ui.js', 'server/livon/userdata/migrations/001_account_backend.sql'];
  for (const f of files) {
    const s = src(f);
    assert.doesNotMatch(s, /-----BEGIN (RSA |EC )?PRIVATE KEY-----|private_key_id|"type":\s*"service_account"|postgres(ql)?:\/\/[^'"\s]*:[^'"\s]*@|AIza[0-9A-Za-z_-]{20,}/, f);
    assert.doesNotMatch(s, /\bLIVE AUTH\b|\bLIVE SYNC\b/, f);
    assert.doesNotMatch(s, /console\.(log|info)\(/, f + ' logs nothing to the console');
  }
  for (const f of readdirSync(new URL('livon/', ROOT))) { const p = new URL('livon/' + f, ROOT); if (statSync(p).isFile() && f.endsWith('.js')) assert.doesNotMatch(readFileSync(p, 'utf8'), /LIVON_DATABASE_URL|UPSTASH_REDIS_REST_TOKEN/, f); }
});

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

test('D3 delete → re-create (same id) → sync keeps the item on every device; an old tombstone never deletes it again', async () => {
  const srv = server();
  const A = device(srv), B = device(srv);
  await A.signIn(SUB_A);
  A.save({ id: 'ext:kr-job-training:program:R1', title: '다시 저장할 과정' }); await A.S.syncNow();
  await B.signIn(SUB_A);
  const setSaves = (D, saves) => { const p = D.read(PF) || {}; p.saves = saves; D.U.write(PF, p); };
  /* variant 1: delete and re-save before any sync */
  setSaves(A, []); A.save({ id: 'ext:kr-job-training:program:R1', title: '다시 저장할 과정' });
  await A.S.syncNow(); await B.S.syncNow(); await A.S.syncNow();
  for (const D of [A, B]) assert.deepEqual(D.read(PF).saves.map(x => x.id), ['ext:kr-job-training:program:R1'], 're-saved item survives');
  /* variant 2: delete, sync the deletion everywhere, then re-save */
  setSaves(A, []); await A.S.syncNow(); await B.S.syncNow();
  assert.deepEqual(B.read(PF).saves, [], 'deletion propagated');
  A.save({ id: 'ext:kr-job-training:program:R1', title: '다시 저장할 과정' }); await A.S.syncNow(); await B.S.syncNow(); await A.S.syncNow();
  for (const D of [A, B]) assert.deepEqual(D.read(PF).saves.map(x => x.id), ['ext:kr-job-training:program:R1']);
  const rec = (await pull(srv, SUB_A)).json.records.find(r => r.id === 'ext:kr-job-training:program:R1');
  assert.ok(rec && !rec.deletedAt && rec.data, 'server holds the live record');
  /* a task undone with its OLD timestamps (older than the deletion) also stays */
  const t = A.addTask('되돌릴 할 일'); await A.S.syncNow();
  const before = A.tasks().find(x => x.id === t);
  A.deleteTask(t); const m = A.ml(); m.todos = m.todos.concat([before]); A.setMl(m);
  await A.S.syncNow(); await B.S.syncNow();
  assert.ok(B.titles().includes('되돌릴 할 일'));
  assert.equal(A.read('livon.userData.meta.v1').tombstones.filter(x => x.id === t).length, 0, 'tombstone pruned on re-creation');
});

test('D4 long ids: the conflict copy never collapses onto the original (both versions kept on every device)', async () => {
  const srv = server();
  const A = device(srv), B = device(srv);
  const longId = 'todo_' + 'x'.repeat(155);
  assert.equal(longId.length, 160);
  await A.signIn(SUB_A); A.addTask('원래', { id: longId }); await A.S.syncNow();
  await B.signIn(SUB_A);
  A.editTask(longId, { title: 'A 버전' }); B.editTask(longId, { title: 'B 버전' });
  await B.S.syncNow(); await A.S.syncNow(); await B.S.syncNow();
  for (const D of [A, B]) {
    assert.deepEqual(D.titles(), ['A 버전', 'B 버전']);
    const ids = D.tasks().map(x => x.id);
    assert.equal(new Set(ids).size, 2); assert.ok(ids.every(x => x.length <= 160));
    assert.equal(D.tasks().find(x => x.conflictOf).conflictOf, longId);
  }
  const U = bare();
  const a = U.mergeCollection([good({ id: 'y'.repeat(160), data: { v: 1 } })], [good({ id: 'y'.repeat(160), data: { v: 2 } })], { lastSyncedAt: 0 }).records.map(r => r.id);
  const b = U.mergeCollection([good({ id: 'y'.repeat(159) + 'z', data: { v: 1 } })], [good({ id: 'y'.repeat(159) + 'z', data: { v: 2 } })], { lastSyncedAt: 0 }).records.map(r => r.id);
  assert.notEqual(a[1], b[1], 'two long ids sharing a prefix get different copy ids');
});

test('D5 sign-out during an in-flight sync of A, then B signs in: A\'s late response never reaches B\'s profile or B\'s account', async () => {
  const srv = server();
  const S0 = device(srv);
  await S0.signIn(SUB_A); S0.addTask('A 첫 번째'); await S0.S.syncNow();
  const D = device(srv);
  await D.signIn(SUB_A);
  assert.deepEqual(D.titles(), ['A 첫 번째']);
  S0.addTask('A 비밀 두 번째'); await S0.S.syncNow();
  D.addTask('A 기기에서 추가');
  D.net.hold = (url, init) => (init.method || 'GET') === 'GET' && url.startsWith('/api/livon/userdata');
  const inflight = D.S.syncNow(); await flush();                    /* A's pull is held (A's token already attached) */
  const out = D.signOut(); await flush();
  D.fireTimers(); await out;                                          /* the 4 s cap ends the final sync; A leaves */
  assert.equal(D.S.activeProfile().kind, 'anon');
  D.net.hold = null;
  const signingB = D.signIn(SUB_B); await flush();
  D.net.release(); await flush(); await signingB; await inflight; await flush();
  await D.S.syncNow();
  assert.equal(D.S.activeProfile().kind, 'account');
  assert.deepEqual(D.titles(), [], 'B\'s profile holds none of A\'s records');
  const bRecs = (await pull(srv, SUB_B)).json.records;
  assert.equal(bRecs.length, 0, 'nothing of A was written into B\'s account');
  const aTitles = (await pull(srv, SUB_A)).json.records.filter(r => !r.deletedAt).map(r => r.data.title).sort();
  assert.ok(!aTitles.includes(undefined));
  await D.signOut();
  const E = device(srv, { local: Object.fromEntries(D.ls._m) });
  await E.signIn(SUB_A);
  assert.ok(E.titles().includes('A 기기에서 추가') && E.titles().includes('A 비밀 두 번째'), 'A\'s own data is intact for A');
});

test('D5b a remote bound to A never sends another identity\'s token (auth switched underneath → SESSION_CHANGED, nothing sent)', async () => {
  const srv = server();
  const D = device(srv);
  await D.signIn(SUB_A); D.addTask('A 전용');
  D.setToken(jwt(claims(SUB_B)));                                   /* the auth SDK now holds B; the engine was not told */
  const before = D.net.calls.length;
  const st = await D.S.syncNow();
  assert.equal(D.net.calls.length, before, 'no request left the device');
  assert.equal(st.status, 'error'); assert.equal(st.errorCode, 'SESSION_CHANGED');
  assert.equal((await pull(srv, SUB_B)).json.records.length, 0);
  assert.deepEqual(D.titles(), ['A 전용'], 'local data untouched');
  D.setToken(jwt(claims(SUB_A)));
  assert.equal((await D.S.syncNow()).status, 'synced', 'recovers once the token matches again');
});

test('D6 a local edit made while the upload is in flight is never overwritten by the conflict merge', async () => {
  const srv = server();
  const A = device(srv), B = device(srv);
  await A.signIn(SUB_A); const t = A.addTask('원본'); await A.S.syncNow();
  await B.signIn(SUB_A);
  A.editTask(t, { title: 'A 수정 1' });
  A.net.hold = (url, init) => init.method === 'POST' && String(init.body).includes('"op":"batch"');
  const pass = A.S.syncNow(); await flush();
  B.editTask(t, { title: 'B 수정' }); await B.S.syncNow();              /* the server moves on meanwhile */
  A.editTask(t, { title: 'A 수정 2 (전송 중 편집)' });                  /* the user keeps typing on A */
  A.net.hold = null; A.net.release(); await pass;
  assert.ok(A.titles().includes('A 수정 2 (전송 중 편집)'), 'in-flight edit kept');
  await A.S.syncNow(); await B.S.syncNow(); await A.S.syncNow();
  for (const D of [A, B]) {
    assert.ok(D.titles().includes('A 수정 2 (전송 중 편집)'), 'A\'s latest edit reached every device');
    assert.ok(D.titles().includes('B 수정'), 'B\'s edit kept too (conflict copy)');
  }
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

test('I14 periodic pull every 60 s only while signed in, visible and online', async () => {
  const srv = server();
  const D = device(srv);
  assert.equal(D.S._tick(), false, 'signed out → no request');
  await D.signIn(SUB_A);
  const n0 = D.net.calls.length;
  assert.equal(D.S._tick(), true); await flush();
  assert.ok(D.net.calls.length > n0);
  D.ctx.document = { visibilityState: 'hidden' }; assert.equal(D.S._tick(), false);
  D.ctx.document = { visibilityState: 'visible' }; D.ctx.navigator.onLine = false; assert.equal(D.S._tick(), false);
  assert.match(livon('data/livon-sync.js'), /PERIODIC_MS = 60000/);
  assert.match(livon('data/livon-sync.js'), /setInterval\(function \(\) \{ engine\._tick\(\); \}, PERIODIC_MS\)/);
});

test('I15 settings carry the time their store really changed (newer-wins compares real edits, not "now")', async () => {
  const U = bare();
  U.write(PF, { alertPrefs: { todo: true } });
  const changedAt = U.meta().stores[PF].changedAt;
  await new Promise(r => setTimeout(r, 15));
  const rec2 = U.collectAccountRecords({}).records.find(r => r.id === 'platform.alertPrefs');
  assert.equal(rec2.updatedAt, changedAt);
});

test('I16 session drafts are parked per profile: B never sees A\'s drafts, the device\'s own drafts come back after sign-out', async () => {
  const srv = server();
  const D = device(srv);
  D.ss.setItem('livon.aiPrompt', JSON.stringify({ q: '기기 초안' }));
  D.ss.setItem('livon.serviceDraft.x', '서비스 초안');
  await D.signIn(SUB_A);
  assert.equal(D.ss.getItem('livon.aiPrompt'), null, 'the device draft is not shown inside the account');
  D.ss.setItem('livon.aiPrompt', JSON.stringify({ q: 'A의 민감한 초안' }));
  await D.signIn(SUB_B);
  assert.equal(D.ss.getItem('livon.aiPrompt'), null, 'B does not see A\'s draft');
  await D.signOut();
  assert.equal(JSON.parse(D.ss.getItem('livon.aiPrompt')).q, '기기 초안');
  assert.equal(D.ss.getItem('livon.serviceDraft.x'), '서비스 초안');
  for (const k of D.ss._m.keys()) assert.notEqual(D.U.classify(k), 'UNKNOWN', k);
  await D.signIn(SUB_A);
  assert.equal(JSON.parse(D.ss.getItem('livon.aiPrompt')).q, 'A의 민감한 초안', 'A gets its own draft back');
});

test('I17 storage full at sign-in: nothing is swapped, status reports the error, this device\'s data is untouched', async () => {
  const srv = server();
  const D = device(srv, { local: { [ML]: { v: 2, todos: [{ id: 'todo_local', title: '내 할 일', createdAt: T0, updatedAt: T0 }] } } });
  D.ls.fail = k => k === 'livon.vault.anon.v1';
  const st = await D.signIn(SUB_A);
  assert.equal(st.status, 'waiting-consent');
  const r = await D.S.declineImport();
  assert.equal(D.S.status().status, 'error'); assert.equal(D.S.status().errorCode, 'STORAGE_WRITE_FAILED');
  assert.equal(D.S.activeProfile().kind, 'anon'); assert.deepEqual(D.titles(), ['내 할 일']);
  void r;
  D.ls.fail = null;
  const again = await D.signIn(SUB_A);
  assert.ok(['synced', 'waiting-consent'].includes(again.status));
});

test('I17 import collision: the account\'s newer task and this device\'s version are both kept (never overwritten)', async () => {
  const srv = server();
  const A = device(srv);
  await A.signIn(SUB_A); A.addTask('계정의 최신 버전', { id: 'todo_same' }); await A.S.syncNow();
  const D = device(srv, { local: { [ML]: { v: 2, todos: [{ id: 'todo_same', title: '이 기기의 옛 버전', createdAt: T0, updatedAt: T0 }] } } });
  const st = await D.signIn(SUB_A);
  assert.equal(st.status, 'waiting-consent');
  await D.S.approveImport({ collections: ['tasks'], includeSensitive: false });
  assert.deepEqual(D.titles(), ['계정의 최신 버전', '이 기기의 옛 버전']);
  await A.S.syncNow();
  assert.deepEqual(A.titles(), ['계정의 최신 버전', '이 기기의 옛 버전']);
});

/* ═════════════ 11. public anonymous mode (2026-09-30): Newon+ sign-in and sync not offered yet ═════════════ */
test('AN-1 public anonymous mode: even with a Newon+ session the bridge never starts account sync and the account UI stays hidden', () => {
  const calls = [];
  let sub = null;
  const ctx = { console, localStorage: mem() };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(livon('data/livon-user-data.js'), ctx);
  ctx.LivonSync = { onSignedIn: s => calls.push(['in', s.subject]), onSignedOut: o => calls.push(['out', o.finalSync]), status: () => ({ status: 'idle', signedIn: false }), activeProfile: () => ({ kind: 'anon' }) };
  ctx.NewonAuth = { subscribe: fn => { sub = fn; } };
  vm.runInContext(livon('data/livon-auth-bridge.js'), ctx);
  sub({ state: { status: 'authenticated', session: { issuer: ISS, subject: SUB_A } } });
  assert.deepEqual(calls, [], 'no account sync starts without the launch switch');
  const el = { innerHTML: '', hidden: true, querySelector: () => null };
  const doc = { readyState: 'complete', body: { appendChild() {} }, addEventListener() {}, querySelectorAll: () => [el], querySelector: () => el, createElement: () => ({}), activeElement: null };
  const uctx = { document: doc, console, localStorage: mem(), NewonAuth: { getState: () => ({ configured: true, status: 'anonymous' }), providers: () => ['google.com'], subscribe() {} }, LivonSync: { status: () => ({ status: 'waiting-consent', pending: { counts: { tasks: 1 }, sensitiveCounts: {} } }), subscribe() {}, activeProfile: () => ({ kind: 'anon' }) } };
  uctx.window = uctx; vm.createContext(uctx); vm.runInContext(livon('livon-account-ui.js'), uctx);
  assert.equal(uctx.LivonAccountUI.panelHtml(), '', 'no sign-in button even when a Newon+ web config exists');
  uctx.LivonAccountUI.openConsent(); assert.equal(el.innerHTML, '', 'no consent dialog');
  assert.doesNotMatch(src('livon/data/livon-auth-bridge.js') + src('livon/livon-account-ui.js'), /LIVON_ACCOUNT_SYNC_PUBLIC\s*=\s*true/, 'the switch is never turned on in code');
});

test('AN-2 no login wall / no paywall: storage notices are local-only, no Newon+ sign-in prompt anywhere in the anonymous UI', () => {
  const NOTICE = '현재 이 기기에 저장됩니다. 브라우저 데이터를 삭제하거나 다른 기기에서 이용하면 저장 내용이 유지되지 않을 수 있습니다.';
  const html = src('livon/index.html'), hub = src('livon/life-hub.js'), page = src('livon/life-page.js');
  const visible = (html + hub + page + src('livon/life-now-page.js')).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(visible, /로그인이 필요|로그인 후 이용|Newon\+ 로그인|회원가입이 필요|Newon\+ 알아보기/, 'no login or sign-up prompt');
  assert.doesNotMatch(visible, /결제가 필요|구독이 필요|유료 회원|프리미엄 전용|paywall/i, 'no paywall');
  assert.ok(hub.includes(NOTICE) && page.includes(NOTICE) && html.includes(NOTICE), 'the local-storage notice text');
  assert.match(page, /sessionStorage\.getItem\("livon\.lifeHub\.saveAck"\)/, 'shown once per session, not on every save');
});

test('AN-3 blocked browser storage never breaks LIVON: the guard swaps in tab-only memory storage, and leaves working storage alone', () => {
  const guard = livon('data/livon-storage-guard.js');
  const blocked = {}; for (const k of ['localStorage', 'sessionStorage']) Object.defineProperty(blocked, k, { configurable: true, get() { const e = new Error('The operation is insecure.'); e.name = 'SecurityError'; throw e; } });
  blocked.window = blocked; vm.createContext(blocked); vm.runInContext(guard, blocked);
  assert.deepEqual([...blocked.LIVON_STORAGE_FALLBACK], ['localStorage', 'sessionStorage']);
  const ls = blocked.localStorage; ls.setItem('livon.lifeStage', '"20s"'); ls.setItem('b', 1);
  assert.equal(ls.getItem('livon.lifeStage'), '"20s"'); assert.equal(ls.getItem('b'), '1'); assert.equal(ls.getItem('none'), null);
  assert.equal(ls.length, 2); assert.equal(ls.key(0), 'livon.lifeStage'); ls.removeItem('b'); assert.equal(ls.length, 1); ls.clear(); assert.equal(ls.length, 0);
  /* the repository (loaded after the guard) works on the memory storage instead of throwing at load */
  vm.runInContext(livon('data/livon-user-data.js'), blocked);
  assert.ok(blocked.LivonUserData.write('livon.lifeInterests', ['주거']));
  assert.deepEqual([...blocked.LivonUserData.read('livon.lifeInterests', [])], ['주거']);
  /* working storage: untouched, no fallback */
  const real = mem(), ok = { localStorage: real, sessionStorage: mem() }; ok.window = ok; vm.createContext(ok); vm.runInContext(guard, ok);
  assert.equal(ok.localStorage, real); assert.deepEqual([...ok.LIVON_STORAGE_FALLBACK], []);
  const html = livon('index.html');
  assert.ok(html.indexOf('/livon/data/livon-storage-guard.js') > 0 && html.indexOf('/livon/data/livon-storage-guard.js') < html.indexOf('<script src="/livon/life-data.js'), 'guard loads before every other LIVON script');
  assert.doesNotMatch(guard, /fetch\(|XMLHttpRequest|sendBeacon|livon\./, 'guard sends nothing and invents no storage key');
});

test('AN-4 old schema / corrupted local data: every LIVON reader falls back to the expected shape instead of throwing', () => {
  const files = ['ai-page.js', 'community-page.js', 'explore-page.js', 'explore-search.js', 'home-page.js', 'life-hub.js', 'life-now-page.js', 'life-page.js', 'livon-platform.js', 'today-feed.js', 'today-page.js', 'data/livon-user-data.js'];
  for (const f of files) {
    const s = livon(f);
    assert.match(s, /function fitShape\(v, fb\)/, f + ' has fitShape');
    assert.match(s, /return fitShape\(raw \? JSON\.parse\(raw\) : fallback, fallback\);/, f + ' reader uses fitShape');
    assert.doesNotMatch(s, /return raw \? JSON\.parse\(raw\) : fallback;/, f + ' no unchecked reader left');
  }
  const m = /function fitShape\(v, fb\) \{[^\n]*\}/.exec(livon('life-hub.js'))[0];
  const fitShape = vm.runInNewContext('(' + m.replace('function fitShape', 'function') + ')');
  assert.deepEqual(fitShape({ a: 1 }, []), []); assert.deepEqual(fitShape('x', []), []); assert.deepEqual(fitShape(42, {}), {});
  assert.deepEqual(fitShape([1, 2], {}), {}); assert.deepEqual(fitShape(null, {}), {});
  assert.deepEqual([...fitShape(['a', null, 'b', undefined], [])], ['a', 'b']);
  assert.deepEqual(fitShape({ k: 1 }, {}), { k: 1 }); assert.equal(fitShape('20s', null), '20s'); assert.equal(fitShape(null, null), null);
  /* repository read: stored object where a list is expected → the list fallback */
  const ls = mem(); ls.setItem('livon.lifeInterests', '{"old":true}'); ls.setItem('livon.mlStore.v1', '[1,2]');
  const ctx = { console, localStorage: ls, sessionStorage: mem() }; ctx.window = ctx; vm.createContext(ctx); vm.runInContext(livon('data/livon-user-data.js'), ctx);
  assert.deepEqual([...ctx.LivonUserData.read('livon.lifeInterests', [])], []);
  assert.deepEqual({ ...ctx.LivonUserData.read('livon.mlStore.v1', {}) }, {});
  assert.match(livon('livon-platform.js'), /var todos = ml && Array\.isArray\(ml\.todos\) \? ml\.todos : \[\];/);
});

test('AN-5 anonymous UI copy: no account-link or login-linkage promise in visible text; future features read "준비 중"', () => {
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const visible = strip(livon('index.html') + livon('life-hub.js') + livon('community-page.js') + livon('life-page.js') + livon('life-now-page.js'));
  assert.doesNotMatch(visible, /Newon\+ 계정 연결 후|Newon\+ 계정이 연결된 뒤|Newon\+ 계정 동기화는|로그인 연동 후/, 'no account-link promises');
  assert.match(livon('community-page.js'), /다른 사용자 프로필과 팔로우는 준비 중입니다\./);
  assert.match(livon('community-page.js'), /프로필 사진·팔로워 기능은 준비 중입니다\./);
});
