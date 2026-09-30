// Newon+ Auth Foundation V1 — client auth core, Firebase adapter contract, LIVON bridge + consent boundary, server token
// verification, (issuer, subject) → account_refs mapping, account-linking contract, build config, security headers.
// NOTHING here talks to Firebase or Google: the SDK is a fake, signatures use a throwaway RSA key generated per run.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parseBearer, rejectTokenInUrl, createTokenVerifier, configFromEnv, firebaseAdminVerifier, issuerFor, AuthError, FORBIDDEN_PROJECTS as SERVER_FORBIDDEN } from '../../server/newon/auth/verify.mjs';
import { resolveAccount, planAccountLink, createMemoryAccountRefs, ADMIN_ISSUERS, REAUTH_MAX_AGE_SEC } from '../../server/newon/auth/accounts.mjs';
import { newonAuthConfigFromEnv, newonAuthConfigScript, PUBLIC_ENV } from '../../scripts/newon-auth-config.mjs';
import { ENDPOINT_ENABLED } from '../../server/livon/userdata/contract.mjs';

const src = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const J = x => JSON.parse(JSON.stringify(x));
const tick = () => new Promise(r => setTimeout(r, 0));
const PROJECT = 'newon-plus-test';
const ISS = issuerFor(PROJECT);
const CFG = { apiKey: 'AIzaTESTTESTTESTTESTTESTTEST123', authDomain: 'newon-plus-test.firebaseapp.com', projectId: PROJECT, appId: '1:123456789:web:abcdef0123' };

function mem() {
  const m = new Map(); const writes = [];
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { writes.push(k); m.set(k, String(v)); }, removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; }, writes, _m: m };
}
/* vm browser-ish context; `document` only when a boot is wanted */
function ctxWith({ doc = false, extra = {} } = {}) {
  const ls = mem(), ss = mem(); const net = [];
  const cookies = [];
  const ctx = { localStorage: ls, sessionStorage: ss, location: { origin: 'https://www.newon.app', protocol: 'https:', hash: '', pathname: '/livon/' }, URL, setTimeout, clearTimeout, Promise, console: { log() { net.push('log'); }, warn() { net.push('log'); }, error() { net.push('log'); }, info() { net.push('log'); } },
    fetch: (...a) => { net.push(a); return Promise.reject(new Error('no network')); }, ...extra };
  if (doc) ctx.document = { readyState: 'complete', addEventListener() {}, set cookie(v) { cookies.push(v); }, get cookie() { return ''; } };
  ctx.window = ctx; vm.createContext(ctx);
  return { ctx, ls, ss, net, cookies, run: f => vm.runInContext(src(f), ctx, { filename: f }) };
}
/* fake SDK-level adapter (NewonAuth contract) */
function fakeAdapter({ failInit = false, user = null, signOutFails = false, token = 'aaa.bbb.ccc' } = {}) {
  let cb = null; const calls = [];
  return {
    calls,
    emit(u) { cb && cb(u); },
    adapter: {
      initialize: () => { calls.push('init'); return failInit ? Promise.reject(Object.assign(new Error('x'), { code: 'SDK_LOAD_FAILED' })) : Promise.resolve(); },
      onAuthStateChanged: (f) => { cb = f; setTimeout(() => f(user), 0); return () => {}; },
      getIdToken: (force) => { calls.push('token:' + force); return Promise.resolve(token); },
      signOut: () => { calls.push('signOut'); return signOutFails ? Promise.reject(new Error('net')) : Promise.resolve(); }
    }
  };
}
const USER = { uid: 'Uid_ABCdef123456', email: 'someone@example.com', displayName: '홍길동', photoURL: 'https://x/y.png', phoneNumber: '+8210', providerData: [{ providerId: 'google.com', email: 'someone@example.com' }], stsTokenManager: { accessToken: 'secret' } };

/* ───────── client core ───────── */
test('NA-1 no config → anonymous; no SDK, no network, no storage; LIVON config file is empty by default', async () => {
  const w = ctxWith({ doc: true });
  let sdkLoads = 0;
  w.run('newon-auth/newon-auth-config.js');
  w.run('newon-auth/newon-auth-firebase.js');
  const orig = w.ctx.NewonFirebaseAuthAdapter.create;
  w.ctx.NewonFirebaseAuthAdapter.create = (c, o) => orig(c, { loadSdk: () => { sdkLoads++; return Promise.reject(new Error('no')); } });
  w.run('newon-auth/newon-auth.js');
  assert.equal(w.ctx.NEWON_PLUS_AUTH_CONFIG, null);
  assert.equal(w.ctx.NewonAuth.getState().status, 'loading');
  await tick(); await tick();
  const s = J(w.ctx.NewonAuth.getState());
  assert.deepEqual(s, { status: 'anonymous', configured: false, session: null, errorCode: null });
  assert.equal(w.ctx.NewonAuth.getSession(), null);
  assert.equal(await w.ctx.NewonAuth.getIdToken(), null);
  assert.equal(sdkLoads, 0); assert.equal(w.net.length, 0); assert.equal(w.ls.writes.length + w.ss.writes.length + w.cookies.length, 0);
  await assert.rejects(w.ctx.NewonAuth.signIn({ method: 'x' }), e => e.code === 'SIGN_IN_NOT_CONFIGURED');
});

test('NA-2 config validation: forbidden HQ/OX projects, server credentials and malformed values are refused', () => {
  const w = ctxWith(); w.run('newon-auth/newon-auth.js');
  const V = w.ctx.NewonAuth.validateConfig;
  assert.equal(V(null).reason, 'NOT_CONFIGURED'); assert.equal(V({}).reason, 'NOT_CONFIGURED');
  assert.equal(V({ ...CFG, projectId: 'newon-hq' }).reason, 'CONFIG_FORBIDDEN_PROJECT');
  assert.equal(V({ ...CFG, projectId: 'newon-oxmonth' }).reason, 'CONFIG_FORBIDDEN_PROJECT');
  for (const k of ['private_key', 'client_email', 'serviceAccount', 'clientSecret', 'credentials', 'password']) assert.equal(V({ ...CFG, [k]: 'x' }).reason, 'CONFIG_INVALID', k);
  assert.equal(V({ ...CFG, apiKey: 'short' }).reason, 'CONFIG_INVALID');
  assert.equal(V({ ...CFG, authDomain: 'https://x.firebaseapp.com' }).reason, 'CONFIG_INVALID');
  assert.equal(V({ ...CFG, appId: 'abc' }).reason, 'CONFIG_INVALID');
  assert.equal(V({ ...CFG, persistence: 'cookie' }).reason, 'CONFIG_INVALID');
  const ok = V(CFG); assert.equal(ok.ok, true); assert.equal(ok.config.persistence, 'session'); assert.equal(ok.config.issuer, ISS);
  assert.deepEqual([...w.ctx.NewonAuth.FORBIDDEN_PROJECTS], [...SERVER_FORBIDDEN]);
});

test('NA-3 states + events: loading → authenticated (signed-in) → signOut (signed-out); late subscriber gets ready once', async () => {
  const w = ctxWith(); w.run('newon-auth/newon-auth.js');
  const A = w.ctx.NewonAuth.create(); const f = fakeAdapter({ user: USER }); const evs = [];
  A.subscribe(e => evs.push(e.type));
  assert.equal(A.getState().status, 'loading');
  const first = await A.initialize({ config: CFG, adapterFactory: () => f.adapter });
  assert.equal(first.status, 'authenticated');
  assert.deepEqual(evs, ['ready', 'signed-in']);
  const late = []; A.subscribe(e => late.push(e.type)); assert.deepEqual(late, ['ready']);
  await A.initialize({ config: CFG, adapterFactory: () => f.adapter }); assert.equal(f.calls.filter(c => c === 'init').length, 1, 'initialize is once-only');
  await A.signOut();
  assert.equal(A.getState().status, 'anonymous'); assert.equal(A.getSession(), null);
  assert.deepEqual(evs, ['ready', 'signed-in', 'signed-out']);
  assert.deepEqual([...A.STATES], ['loading', 'anonymous', 'authenticated', 'error']);
  assert.deepEqual([...A.EVENT_TYPES], ['ready', 'signed-in', 'signed-out', 'error']);
  /* external sign-out (other tab / token revoked) arrives via the SDK */
  const B = w.ctx.NewonAuth.create(); const g = fakeAdapter({ user: USER }); const bev = [];
  B.subscribe(e => bev.push(e.type)); await B.initialize({ config: CFG, adapterFactory: () => g.adapter }); g.emit(null);
  assert.equal(B.getState().status, 'anonymous'); assert.deepEqual(bev, ['ready', 'signed-in', 'signed-out']);
});

test('NA-4 error states are real errors, never fake-authenticated (SDK load failure, invalid user, missing adapter)', async () => {
  const w = ctxWith(); w.run('newon-auth/newon-auth.js');
  const A = w.ctx.NewonAuth.create(); const evs = [];
  A.subscribe(e => evs.push(e.type));
  const s = await A.initialize({ config: CFG, adapterFactory: () => fakeAdapter({ failInit: true }).adapter });
  assert.equal(s.status, 'error'); assert.equal(s.errorCode, 'SDK_LOAD_FAILED'); assert.equal(s.session, null); assert.deepEqual(evs, ['ready', 'error']);
  const B = w.ctx.NewonAuth.create();
  const b = await B.initialize({ config: CFG, adapterFactory: () => fakeAdapter({ user: { uid: 'x' } }).adapter });
  assert.equal(b.status, 'error'); assert.equal(b.errorCode, 'INVALID_USER');
  const C = w.ctx.NewonAuth.create();
  const c = await C.initialize({ config: CFG, adapterFactory: () => ({ initialize() {} }) });
  assert.equal(c.status, 'anonymous'); assert.equal(c.errorCode, 'ADAPTER_MISSING'); assert.equal(c.configured, false);
  const D = w.ctx.NewonAuth.create();
  const d = await D.initialize({ config: { ...CFG, projectId: 'newon-hq' }, adapterFactory: () => { throw new Error('must not be called'); } });
  assert.equal(d.status, 'anonymous'); assert.equal(d.errorCode, 'CONFIG_FORBIDDEN_PROJECT');
});

test('NA-5 session normalization: only issuer + subject + signInProvider; no email/name/photo/phone/token', async () => {
  const w = ctxWith(); w.run('newon-auth/newon-auth.js');
  const A = w.ctx.NewonAuth.create();
  await A.initialize({ config: CFG, adapterFactory: () => fakeAdapter({ user: USER }).adapter });
  const s = J(A.getSession());
  assert.deepEqual(s, { issuer: ISS, subject: USER.uid, signInProvider: 'google.com' });
  const all = JSON.stringify(A.getState());
  for (const bad of ['someone@example.com', '홍길동', 'photo', 'secret', '+8210']) assert.ok(!all.includes(bad), bad);
});

test('NA-6 tokens: fresh from SDK, shape-checked, never stored/logged; Bearer only for HTTPS allowed origins', async () => {
  const w = ctxWith({ doc: true }); w.run('newon-auth/newon-auth.js');
  const A = w.ctx.NewonAuth.create(); const f = fakeAdapter({ user: USER, token: 'hdr.payload.sig' });
  await A.initialize({ config: CFG, adapterFactory: () => f.adapter });
  assert.equal(await A.getIdToken(), 'hdr.payload.sig'); assert.equal(await A.getIdToken({ forceRefresh: true }), 'hdr.payload.sig');
  assert.deepEqual(f.calls.filter(c => c.startsWith('token')), ['token:false', 'token:true'], 'asks the SDK every time');
  assert.deepEqual(J(await A.authHeaders('/api/livon/data')), { Authorization: 'Bearer hdr.payload.sig' });
  assert.equal(await A.authHeaders('http://www.newon.app/api'), null, 'no bearer over http');
  assert.equal(await A.authHeaders('https://evil.example/api'), null, 'no bearer to foreign origins');
  assert.deepEqual(J(await A.authHeaders('https://api.newon.app/x', { allowedOrigins: ['https://api.newon.app'] })), { Authorization: 'Bearer hdr.payload.sig' });
  assert.equal(await A.authHeaders('https://user:pw@www.newon.app/api'), null);
  assert.equal(w.ls.writes.length + w.ss.writes.length + w.cookies.length, 0, 'no storage writes by Newon code');
  assert.equal(w.net.filter(x => x === 'log').length, 0, 'nothing logged');
  const bad = w.ctx.NewonAuth.create(); await bad.initialize({ config: CFG, adapterFactory: () => fakeAdapter({ user: USER, token: 'not a jwt' }).adapter });
  assert.equal(await bad.getIdToken(), null);
  for (const f2 of ['newon-auth/newon-auth.js', 'newon-auth/newon-auth-firebase.js', 'newon-auth/newon-auth-ui.js', 'livon/data/livon-auth-bridge.js']) {
    const code = src(f2).replace(/\/\*[\s\S]*?\*\//g, '');
    assert.ok(!/localStorage|sessionStorage|document\.cookie|console\.|indexedDB/.test(code), f2 + ' touches storage/log');
  }
});

test('NA-7 logout clears state even if the SDK call fails', async () => {
  const w = ctxWith(); w.run('newon-auth/newon-auth.js');
  const A = w.ctx.NewonAuth.create(); const evs = [];
  await A.initialize({ config: CFG, adapterFactory: () => fakeAdapter({ user: USER, signOutFails: true }).adapter });
  A.subscribe(e => evs.push(e.type));
  const s = await A.signOut();
  assert.equal(s.status, 'anonymous'); assert.equal(s.session, null); assert.equal(s.errorCode, 'SIGN_OUT_FAILED');
  assert.equal(await A.getIdToken(), null); assert.deepEqual(evs, ['ready', 'signed-out']);
});

test('NA-8 Firebase adapter contract with a fake SDK: named app, public config only, explicit persistence, sign-in only for configured providers', async () => {
  const w = ctxWith(); w.run('newon-auth/newon-auth-firebase.js');
  const F = w.ctx.NewonFirebaseAuthAdapter;
  assert.equal(F.APP_NAME, 'newon-plus'); assert.match(F.SDK_VERSION, /^\d+\.\d+\.\d+$/);
  const seen = {};
  const sdk = () => ({
    app: { initializeApp: (c, name) => { seen.config = c; seen.name = name; return { name }; } },
    auth: { getAuth: app => ({ app, currentUser: { getIdToken: f => Promise.resolve('t.' + (f ? 'fresh' : 'cached') + '.x') } }),
      browserSessionPersistence: 'S', browserLocalPersistence: 'L', inMemoryPersistence: 'M',
      setPersistence: (a, p) => { seen.persistence = p; return Promise.resolve(); },
      onAuthStateChanged: (a, cb) => { cb(null); return () => {}; }, signOut: () => { seen.signOut = true; return Promise.resolve(); } }
  });
  for (const [p, want] of [[undefined, 'S'], ['session', 'S'], ['local', 'L'], ['memory', 'M']]) {
    const a = F.create({ ...CFG, persistence: p, issuer: ISS }, { loadSdk: () => Promise.resolve(sdk()) });
    await a.initialize(); assert.equal(seen.persistence, want);
  }
  assert.equal(seen.name, 'newon-plus');
  assert.deepEqual(Object.keys(seen.config).sort(), ['apiKey', 'appId', 'authDomain', 'projectId']);
  const a = F.create({ ...CFG, issuer: ISS }, { loadSdk: () => Promise.resolve(sdk()) }); await a.initialize();
  assert.equal(await a.getIdToken(true), 't.fresh.x'); await a.signOut(); assert.equal(seen.signOut, true);
  /* Account backend V1: sign-in exists but only for providers the Newon+ config enables (none by default) */
  await assert.rejects(a.signIn({ provider: 'google.com' }), e => e.code === 'SIGN_IN_NOT_CONFIGURED', 'no provider without config');
  const popups = [];
  const sdk2 = () => { const x = sdk(); x.auth.GoogleAuthProvider = function () { this.kind = 'google'; }; x.auth.OAuthProvider = function (id) { this.kind = id; };
    x.auth.signInWithPopup = (au, prov) => { popups.push(prov.kind); return Promise.resolve({ user: {} }); }; return x; };
  const b = F.create({ ...CFG, providers: ['google.com'], issuer: ISS }, { loadSdk: () => Promise.resolve(sdk2()) }); await b.initialize();
  await b.signIn({ provider: 'google.com' }); assert.deepEqual(popups, ['google']);
  await assert.rejects(b.signIn({ provider: 'apple.com' }), e => e.code === 'SIGN_IN_NOT_CONFIGURED', 'a provider not enabled in config is refused');
  await assert.rejects(b.signIn({ provider: 'password' }), e => e.code === 'SIGN_IN_NOT_CONFIGURED');
  const code = src('newon-auth/newon-auth-firebase.js').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/signInWithEmail|createUserWith|EmailAuthProvider|signInAnonymously/i.test(code), 'no email/password or anonymous-account flows');
  assert.match(code, /cfg\.providers\.indexOf\(id\) < 0/, 'providers come only from config');
  const failing = F.create({ ...CFG, issuer: ISS }, { loadSdk: () => Promise.reject(Object.assign(new Error(), { code: 'SDK_LOAD_FAILED' })) });
  await assert.rejects(failing.initialize(), e => e.code === 'SDK_LOAD_FAILED');
});

/* ───────── LIVON bridge + consent ───────── */
function livon() {
  const w = ctxWith(); w.run('livon/data/livon-user-data.js'); w.run('newon-auth/newon-auth.js'); w.run('livon/data/livon-auth-bridge.js');
  return w;
}
test('NA-9 LIVON bridge: one subscription point; sign-in ≠ upload; import is offered with counts and needs a choice', async () => {
  const w = livon(); const { ctx } = w; const U = ctx.LivonUserData, B = ctx.LivonAuthBridge;
  w.ls.setItem('livon.mlStore.v1', JSON.stringify({ v: 2, todos: [{ id: 'todo_1', title: 'a', createdAt: 1, updatedAt: 1 }], health: [{ id: 'h1', title: 'b' }] }));
  const before = new Map(w.ls._m); w.ls.writes.length = 0;
  assert.equal(B.SYNC_ENDPOINT_ENABLED, false); assert.equal(ENDPOINT_ENABLED, false);
  assert.equal(B.offerImport().status, 'NOT_SIGNED_IN');
  const f = fakeAdapter({ user: USER });
  await ctx.NewonAuth.initialize({ config: CFG, adapterFactory: () => f.adapter });
  assert.equal(U.auth().status, 'authenticated'); assert.equal(U.mode(), 'anonymous', 'no remote adapter → still local mode');
  assert.equal(B.status().auth, 'authenticated'); assert.equal(B.status().consent, 'none');
  assert.equal(B.approveImport({}).status, 'NOT_OFFERED', 'approval without an offer is refused');
  const o = B.offerImport();
  assert.equal(o.status, 'OFFERED'); assert.equal(o.requiresUserChoice, true); assert.equal(o.autoUpload, false);
  assert.equal(o.plan.counts.tasks, 1); assert.equal(o.plan.sensitiveDefault, 'excluded'); assert.ok(o.plan.sensitiveCounts.health_records >= 1);
  const r = B.approveImport({});
  assert.deepEqual(J(r), { status: 'SYNC_NOT_AVAILABLE', uploaded: 0 });
  assert.equal(w.net.filter(x => x !== 'log').length, 0, 'no network request at all');
  assert.equal(w.ls.writes.filter(k => !/^livon\.userData\.meta/.test(k)).length, 0, 'no data rewritten');
  for (const [k, v] of before) if (k !== 'livon.userData.meta.v1') assert.equal(w.ls._m.get(k), v, 'local data kept: ' + k);
  await ctx.NewonAuth.signOut();
  assert.equal(U.auth().status, 'anonymous'); assert.equal(B.status().consent, 'none');
  for (const [k, v] of before) if (k !== 'livon.userData.meta.v1') assert.equal(w.ls._m.get(k), v, 'logout never deletes local data: ' + k);
});

test('NA-10 sensitive import boundary: sensitive data needs its own opt-in; consent is per page session, never stored', async () => {
  const w = livon(); const B = w.ctx.LivonAuthBridge;
  await w.ctx.NewonAuth.initialize({ config: CFG, adapterFactory: () => fakeAdapter({ user: USER }).adapter });
  B.offerImport(); B.approveImport({});
  assert.equal(B.status().consent, 'approved');
  const code = src('livon/data/livon-auth-bridge.js');
  assert.match(code, /includeSensitive: !!\(choice && choice\.includeSensitive === true\)/, 'sensitive only with explicit true');
  B.offerImport(); assert.equal(B.declineImport().status, 'DECLINED');
  assert.equal(w.ls.writes.filter(k => /consent/i.test(k)).length, 0);
  assert.equal(w.ctx.LivonUserData.planLoginImport().sensitiveDefault, 'excluded');
});

test('NA-11 LIVON loads auth scripts in the right order, synchronously, without a static SDK or a mounted login UI', () => {
  const html = src('livon/index.html');
  const order = ['/livon/data/livon-user-data.js', '/newon-auth/newon-auth-config.js', '/newon-auth/newon-auth-firebase.js', '/newon-auth/newon-auth.js', '/livon/data/livon-auth-bridge.js'];
  const pos = order.map(p => html.indexOf(p)); pos.forEach((p, i) => assert.ok(p > 0, order[i]));
  assert.deepEqual([...pos].sort((a, b) => a - b), pos, 'script order');
  for (const p of order.slice(1)) { const tag = html.slice(html.lastIndexOf('<script', html.indexOf(p)), html.indexOf('</script>', html.indexOf(p))); assert.ok(!/\b(async|defer|type="module")/.test(tag), p); }
  assert.ok(!/gstatic\.com\/firebasejs/.test(html)); assert.ok(!/newon-auth-ui\.js/.test(html));
  const pages = []; (function walk(d) { for (const e of readdirSync(new URL('../../' + d, import.meta.url), { withFileTypes: true })) { if (['node_modules', '_publish', '.git'].includes(e.name)) continue; const p = d + e.name; if (e.isDirectory()) walk(p + '/'); else if (p.endsWith('.html')) pages.push(p); } })('');
  assert.deepEqual(pages.filter(p => src(p).includes('newon-auth-ui.js')), [], 'login UI is not mounted anywhere in V1');
});

test('NA-12 UI boundary: nothing when unconfigured; one neutral button; no provider buttons, no personal data', () => {
  const w = ctxWith(); w.run('newon-auth/newon-auth-ui.js');
  const R = w.ctx.NewonAuthUI.render, L = w.ctx.NewonAuthUI.LABELS;
  assert.equal(R({ status: 'anonymous', configured: false }, L), '');
  assert.equal(R({ status: 'loading', configured: true }, L), '');
  const anon = R({ status: 'anonymous', configured: true }, L);
  assert.equal((anon.match(/<button/g) || []).length, 1); assert.match(anon, /data-newon-auth-signin/);
  const signed = R({ status: 'authenticated', configured: true, session: { issuer: ISS, subject: USER.uid } }, L);
  assert.match(signed, /data-newon-auth-signout/); assert.ok(!signed.includes(USER.uid));
  const err = R({ status: 'error', configured: true, errorCode: 'INIT_FAILED' }, L); assert.ok(!err.includes('INIT_FAILED'));
  const code = src('newon-auth/newon-auth-ui.js');
  assert.ok(!/Google|Apple|Kakao|카카오|구글|애플|네이버|email|이메일/i.test(code.replace(/\/\*[\s\S]*?\*\//g, '')), 'no fake provider buttons');
});

/* ───────── server verification (real RS256 signatures with a throwaway key) ───────── */
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const other = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const b64u = o => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
function jwt(payload, { header = { alg: 'RS256', kid: 'test-kid', typ: 'JWT' }, key = privateKey } = {}) {
  const data = b64u(header) + '.' + b64u(payload);
  return data + '.' + crypto.sign('RSA-SHA256', Buffer.from(data), key).toString('base64url');
}
/* test double for the official verifier: RS256 with the test public key (production uses firebase-admin / JWKS) */
async function testVerify(token) {
  const [h, p, s] = token.split('.');
  const header = JSON.parse(Buffer.from(h, 'base64url'));
  if (header.alg !== 'RS256') throw new Error('alg');
  if (!crypto.verify('RSA-SHA256', Buffer.from(h + '.' + p), publicKey, Buffer.from(s, 'base64url'))) throw new Error('sig');
  return JSON.parse(Buffer.from(p, 'base64url'));
}
const NOW = 1790000000;
const claims = (o = {}) => ({ iss: ISS, aud: PROJECT, sub: 'Uid_ABCdef123456', iat: NOW - 10, auth_time: NOW - 20, exp: NOW + 3000, email: 'someone@example.com', firebase: { sign_in_provider: 'google.com' }, ...o });
const ENV_ON = { NEWON_AUTH_VERIFY_ENABLED: 'true', NEWON_PLUS_FIREBASE_PROJECT_ID: PROJECT };
const verifier = (env = ENV_ON) => createTokenVerifier({ env, verifySignature: testVerify, now: () => NOW * 1000 });
const code = async p => { try { await p; return 'OK'; } catch (e) { assert.ok(e instanceof AuthError, String(e)); return e.status + ' ' + e.code; } };

test('NA-13 Bearer parsing + token-in-URL rejection', () => {
  const t = jwt(claims());
  assert.equal(parseBearer({ Authorization: 'Bearer ' + t }), t);
  assert.equal(parseBearer({ authorization: 'Bearer ' + t }), t);
  for (const [h, c] of [[{}, 'NO_TOKEN'], [null, 'NO_TOKEN'], [{ authorization: 'bearer ' + t }, 'MALFORMED_TOKEN'], [{ authorization: 'Basic abc' }, 'MALFORMED_TOKEN'],
    [{ authorization: 'Bearer  ' + t }, 'MALFORMED_TOKEN'], [{ authorization: 'Bearer abc' }, 'MALFORMED_TOKEN'], [{ authorization: 'Bearer ' + t, Authorization: 'Bearer ' + t }, 'MALFORMED_TOKEN'],
    [{ authorization: 'Bearer ' + 'a'.repeat(5000) + '.b.c' }, 'MALFORMED_TOKEN'], [{ authorization: ['Bearer ' + t] }, 'MALFORMED_TOKEN']]) {
    assert.throws(() => parseBearer(h), e => e.code === c, JSON.stringify(h).slice(0, 40));
  }
  for (const q of ['id_token', 'access_token', 'token', 'TOKEN', 'jwt', 'bearer', 'auth']) assert.throws(() => rejectTokenInUrl('/api/x?' + q + '=a.b.c'), e => e.code === 'TOKEN_IN_URL', q);
  assert.equal(rejectTokenInUrl('/api/x?q=1'), true);
});

test('NA-14 verifier is disabled (fail closed) unless explicitly enabled with a valid non-HQ/non-OX project and a verifier', async () => {
  const t = jwt(claims());
  assert.equal(await code(createTokenVerifier({ env: {} }).verify({ authorization: 'Bearer ' + t })), '503 AUTH_NOT_CONFIGURED');
  assert.equal(await code(createTokenVerifier({ env: ENV_ON }).verify({ authorization: 'Bearer ' + t })), '503 AUTH_NOT_CONFIGURED', 'no verifier → disabled');
  assert.equal(await code(verifier({ ...ENV_ON, NEWON_AUTH_VERIFY_ENABLED: 'false' }).verify({ authorization: 'Bearer ' + t })), '503 AUTH_NOT_CONFIGURED');
  for (const p of ['newon-hq', 'newon-oxmonth']) assert.equal(configFromEnv({ ...ENV_ON, NEWON_PLUS_FIREBASE_PROJECT_ID: p }).enabled, false, p);
  assert.equal(await code(firebaseAdminVerifier()), '503 VERIFIER_NOT_INSTALLED', 'firebase-admin is not a dependency in V1');
  const pkg = JSON.parse(src('package.json'));
  assert.ok(!('firebase-admin' in { ...pkg.dependencies, ...pkg.devDependencies }) && !('jose' in { ...pkg.dependencies, ...pkg.devDependencies }), 'no new dependency');
});

test('NA-15 verified identity: signature, iss, allowlist, aud, exp/iat/auth_time, sub, alg — and nothing else is trusted', async () => {
  const v = verifier();
  const id = await v.verify({ authorization: 'Bearer ' + jwt(claims()) }, { url: '/api/livon/data?action=sync' });
  assert.deepEqual({ ...id }, { verified: true, issuer: ISS, subject: 'Uid_ABCdef123456', authTime: NOW - 20, signInProvider: 'google.com' });
  assert.ok(Object.isFrozen(id)); assert.ok(!('email' in id), 'email is never part of the identity');
  const bad = async (tok, o) => code(v.verify({ authorization: 'Bearer ' + tok }, o));
  assert.equal(await bad(jwt(claims()), { url: '/x?id_token=1' }), '400 TOKEN_IN_URL');
  assert.equal(await bad(jwt(claims(), { key: other.privateKey })), '401 INVALID_TOKEN', 'wrong key');
  const t = jwt(claims()); const [h, , s] = t.split('.');
  assert.equal(await bad(h + '.' + b64u(claims({ sub: 'Attacker_000001' })) + '.' + s), '401 INVALID_TOKEN', 'tampered payload');
  assert.equal(await bad(jwt(claims({ iss: issuerFor('newon-hq'), aud: 'newon-hq' }))), '401 INVALID_TOKEN', 'HQ token');
  assert.equal(await bad(jwt(claims({ iss: issuerFor('newon-oxmonth'), aud: 'newon-oxmonth' }))), '401 INVALID_TOKEN', 'OX token');
  assert.equal(await bad(jwt(claims({ iss: 'https://accounts.google.com' }))), '401 INVALID_TOKEN');
  assert.equal(await bad(jwt(claims({ aud: 'other-project' }))), '401 INVALID_TOKEN');
  assert.equal(await bad(jwt(claims({ exp: NOW - 120 }))), '401 TOKEN_EXPIRED');
  assert.equal(await bad(jwt(claims({ iat: NOW + 3600 }))), '401 INVALID_TOKEN');
  assert.equal(await bad(jwt(claims({ auth_time: NOW + 3600 }))), '401 INVALID_TOKEN');
  assert.equal(await bad(jwt(claims({ sub: '' }))), '401 INVALID_TOKEN');
  assert.equal(await bad(jwt(claims({ sub: 'a/b' }))), '401 INVALID_TOKEN');
  assert.equal(await bad(jwt(claims(), { header: { alg: 'none', kid: 'k' } })), '401 INVALID_TOKEN');
  assert.equal(await bad(jwt(claims(), { header: { alg: 'HS256', kid: 'k' } })), '401 INVALID_TOKEN');
  assert.equal(await bad(jwt(claims(), { header: { alg: 'RS256' } })), '401 INVALID_TOKEN', 'kid required');
  assert.equal(await bad('a.b.c'), '400 MALFORMED_TOKEN');
  const restricted = verifier({ ...ENV_ON, NEWON_AUTH_ALLOWED_ISSUERS: 'https://securetoken.google.com/some-other' });
  assert.equal(await code(restricted.verify({ authorization: 'Bearer ' + jwt(claims()) })), '403 ISSUER_NOT_ALLOWED');
  /* a claimed userId in body/query/header is irrelevant: identity comes from the token only */
  const id2 = await v.verify({ authorization: 'Bearer ' + jwt(claims()), 'x-user-id': 'someone-else' }, { url: '/api?userId=someone-else' });
  assert.equal(id2.subject, 'Uid_ABCdef123456');
  /* signature library errors never leak */
  const leaky = createTokenVerifier({ env: ENV_ON, verifySignature: () => { throw new Error('kid abc not found at https://…'); }, now: () => NOW * 1000 });
  try { await leaky.verify({ authorization: 'Bearer ' + jwt(claims()) }); assert.fail(); } catch (e) { assert.equal(e.message, 'INVALID_TOKEN'); }
  /* post-signature re-check: a verifier returning different claims is still rejected */
  const lying = createTokenVerifier({ env: ENV_ON, verifySignature: async () => claims({ aud: 'x' }), now: () => NOW * 1000 });
  assert.equal(await code(lying.verify({ authorization: 'Bearer ' + jwt(claims()) })), '401 INVALID_TOKEN');
  const src2 = src('server/newon/auth/verify.mjs');
  assert.ok(!/createVerify|crypto\.verify|subtle\.verify|RSA-SHA256/.test(src2), 'no hand-written signature crypto in production code');
});

/* ───────── account_refs + linking ───────── */
const idOf = (issuer, subject, o = {}) => ({ verified: true, issuer, subject, authTime: NOW - 30, ...o });
const OX = issuerFor('newon-oxmonth');
test('NA-16 (issuer, subject) → account_refs → opaque accountId (never the uid); OX/HQ cannot create a Newon+ account', () => {
  const repo = createMemoryAccountRefs(); const opt = { allowedPrimaryIssuers: [ISS], create: true };
  const a = resolveAccount(idOf(ISS, 'Uid_ABCdef123456'), repo, opt);
  assert.equal(a.created, true); assert.match(a.accountId, /^acct_[0-9a-f]{32}$/); assert.ok(!a.accountId.includes('Uid_ABCdef123456'));
  assert.deepEqual(resolveAccount(idOf(ISS, 'Uid_ABCdef123456'), repo, opt), { accountId: a.accountId, created: false });
  assert.throws(() => resolveAccount(idOf(OX, 'Uid_ABCdef123456'), repo, opt), e => e.code === 'ISSUER_NOT_PRIMARY', 'same uid in another project is a different identity');
  assert.throws(() => resolveAccount(idOf(ISS, 'Other_user_0001'), repo, { allowedPrimaryIssuers: [ISS] }), e => e.code === 'ACCOUNT_NOT_LINKED');
  assert.throws(() => resolveAccount(idOf(ADMIN_ISSUERS[0], 'Admin_uid_0001'), repo, { allowedPrimaryIssuers: [...ADMIN_ISSUERS], create: true }), e => e.code === 'ADMIN_IDENTITY_NOT_ALLOWED');
  assert.throws(() => resolveAccount({ issuer: ISS, subject: 'Uid_ABCdef123456' }, repo, opt), e => e.code === 'NOT_VERIFIED');
  for (const k of ['email', 'emailVerified', 'userId', 'accountId']) assert.throws(() => resolveAccount(idOf(ISS, 'Uid_ABCdef123456', { [k]: 'x' }), repo, opt), e => e.code === 'UNEXPECTED_IDENTITY_FIELD', k);
});

test('NA-17 account linking: explicit confirmation + fresh re-auth on BOTH sides; collision refused; no email auto-merge', () => {
  const repo = createMemoryAccountRefs(); const opt = { nowSec: NOW, allowedPrimaryIssuers: [ISS], linkableIssuers: [OX] };
  const acct = resolveAccount(idOf(ISS, 'Newon_user_001'), repo, { allowedPrimaryIssuers: [ISS], create: true }).accountId;
  const P = idOf(ISS, 'Newon_user_001'), S = idOf(OX, 'Ox_user_000001');
  assert.throws(() => planAccountLink({ primary: P, secondary: S }, repo, opt), e => e.code === 'CONFIRMATION_REQUIRED');
  assert.throws(() => planAccountLink({ primary: P, secondary: { ...S, authTime: NOW - REAUTH_MAX_AGE_SEC - 1 }, userConfirmed: true }, repo, opt), e => e.code === 'REAUTH_REQUIRED');
  assert.throws(() => planAccountLink({ primary: { ...P, authTime: undefined }, secondary: S, userConfirmed: true }, repo, opt), e => e.code === 'REAUTH_REQUIRED');
  assert.throws(() => planAccountLink({ primary: P, secondary: idOf(ISS, 'Newon_user_002'), userConfirmed: true }, repo, { ...opt, linkableIssuers: [ISS, OX] }), e => e.code === 'SAME_ISSUER');
  assert.throws(() => planAccountLink({ primary: P, secondary: idOf(ADMIN_ISSUERS[0], 'Admin_0000001'), userConfirmed: true }, repo, opt), e => e.code === 'ADMIN_IDENTITY_NOT_ALLOWED');
  const plan = planAccountLink({ primary: P, secondary: S, userConfirmed: true }, repo, opt);
  assert.deepEqual(plan, { action: 'link', accountId: acct, issuer: OX, subject: 'Ox_user_000001', dataLinked: false });
  repo.addLink(plan.accountId, plan.issuer, plan.subject);
  assert.equal(planAccountLink({ primary: P, secondary: S, userConfirmed: true }, repo, opt).action, 'none');
  resolveAccount(idOf(ISS, 'Newon_user_002'), repo, { allowedPrimaryIssuers: [ISS], create: true });
  assert.throws(() => planAccountLink({ primary: idOf(ISS, 'Newon_user_002'), secondary: S, userConfirmed: true }, repo, opt), e => e.status === 409 && e.code === 'LINK_COLLISION');
  assert.throws(() => repo.addLink(acct, OX, 'Ox_user_000001'), e => e.code === 'LINK_COLLISION');
  /* the same email on two identities never links them: email is not accepted as an identity field at all */
  assert.throws(() => planAccountLink({ primary: { ...P, email: 'a@b.c' }, secondary: { ...idOf(OX, 'Ox_user_000009'), email: 'a@b.c' }, userConfirmed: true }, repo, opt), e => e.code === 'UNEXPECTED_IDENTITY_FIELD');
  assert.ok(!/email/.test(src('server/newon/auth/accounts.mjs').replace(/\/\*[\s\S]*?\*\//g, '').replace(/'email', 'emailVerified'/, '')), 'no email lookup anywhere');
});

/* ───────── separation from HQ / OX ───────── */
test('NA-18 HQ admin + OX MONTH code is untouched and never referenced by Newon+ auth', () => {
  let git = true; try { execFileSync('git', ['--version'], { stdio: 'ignore' }); } catch { git = false; }
  if (git) {
    let inRepo = true; try { execFileSync('git', ['rev-parse', '--git-dir'], { stdio: 'ignore', cwd: new URL('../../', import.meta.url) }); } catch { inRepo = false; }
    if (inRepo) {
      const out = execFileSync('git', ['status', '--porcelain', '--', 'admin', 'firestore.rules', 'apps/ox-month', 'ox-month', 'firebase.json'], { cwd: new URL('../../', import.meta.url), encoding: 'utf8' });
      assert.equal(out.trim(), '', 'HQ / OX files changed');
    }
  }
  for (const f of ['newon-auth/newon-auth.js', 'newon-auth/newon-auth-firebase.js', 'newon-auth/newon-auth-ui.js', 'livon/data/livon-auth-bridge.js', 'server/newon/auth/verify.mjs', 'server/newon/auth/accounts.mjs']) {
    const c = src(f);
    assert.ok(!/hq-auth|firebase-config\.js|ox-month\//.test(c), f);
  }
  assert.ok(!/newon-auth/.test(src('admin/hq-auth.js')));
});

/* ───────── build config ───────── */
test('NA-19 build-time public config: only complete, valid, non-HQ/OX values; server values never reach the bundle', () => {
  const env = { NEWON_PLUS_FIREBASE_API_KEY: CFG.apiKey, NEWON_PLUS_FIREBASE_AUTH_DOMAIN: CFG.authDomain, NEWON_PLUS_FIREBASE_PROJECT_ID: PROJECT, NEWON_PLUS_FIREBASE_APP_ID: CFG.appId,
    NEWON_AUTH_VERIFY_ENABLED: 'true', FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----x', GOOGLE_APPLICATION_CREDENTIALS: '/x.json' };
  const cfg = newonAuthConfigFromEnv(env);
  assert.deepEqual(cfg, CFG);
  const js = newonAuthConfigScript(cfg);
  for (const bad of ['PRIVATE', 'CREDENTIALS', 'VERIFY', '/x.json']) assert.ok(!js.includes(bad), bad);
  assert.equal(newonAuthConfigFromEnv({}), null);
  assert.equal(newonAuthConfigFromEnv({ ...env, NEWON_PLUS_FIREBASE_APP_ID: '' }), null, 'partial');
  assert.equal(newonAuthConfigFromEnv({ ...env, NEWON_PLUS_FIREBASE_PROJECT_ID: 'newon-hq' }), null);
  assert.equal(newonAuthConfigFromEnv({ ...env, NEWON_PLUS_FIREBASE_PROJECT_ID: 'newon-oxmonth' }), null);
  assert.equal(newonAuthConfigFromEnv({ ...env, NEWON_PLUS_FIREBASE_AUTH_DOMAIN: 'x</script>' }), null);
  assert.equal(newonAuthConfigFromEnv({ ...env, NEWON_PLUS_AUTH_PERSISTENCE: 'local' }).persistence, 'local');
  assert.ok(newonAuthConfigScript({ a: '</script>' }).includes('\\u003c/script>'));
  /* generated script evaluates to the same config and passes client validation */
  const w = ctxWith(); vm.runInContext(js, w.ctx); w.run('newon-auth/newon-auth.js');
  assert.equal(w.ctx.NewonAuth.validateConfig(w.ctx.NEWON_PLUS_AUTH_CONFIG).ok, true);
  assert.deepEqual(Object.values(PUBLIC_ENV).sort(), ['NEWON_PLUS_AUTH_PERSISTENCE', 'NEWON_PLUS_AUTH_PROVIDERS', 'NEWON_PLUS_FIREBASE_API_KEY', 'NEWON_PLUS_FIREBASE_APP_ID', 'NEWON_PLUS_FIREBASE_AUTH_DOMAIN', 'NEWON_PLUS_FIREBASE_PROJECT_ID']);
  assert.deepEqual(newonAuthConfigFromEnv({ ...env, NEWON_PLUS_AUTH_PROVIDERS: 'google.com, password, apple.com, google.com' }).providers, ['google.com', 'apple.com'], 'only known sign-in providers, deduplicated');
  assert.equal(newonAuthConfigFromEnv(env).providers, undefined, 'no provider unless configured');
  const pub = src('scripts/publish-site.mjs');
  assert.match(pub, /from: "newon-auth", to: "newon-auth"/); assert.match(pub, /if \(cfg\) fs\.writeFileSync/);
});

test('NA-20 .env.example: placeholders only; public vs server separated; no service account for the client', () => {
  const e = src('.env.example');
  const lines = e.split('\n').filter(l => /^(NEWON_PLUS_|NEWON_AUTH_)/.test(l));
  assert.deepEqual(lines.map(l => l.split('=')[0]), ['NEWON_PLUS_FIREBASE_API_KEY', 'NEWON_PLUS_FIREBASE_AUTH_DOMAIN', 'NEWON_PLUS_FIREBASE_PROJECT_ID', 'NEWON_PLUS_FIREBASE_APP_ID', 'NEWON_PLUS_AUTH_PERSISTENCE', 'NEWON_PLUS_AUTH_PROVIDERS', 'NEWON_AUTH_VERIFY_ENABLED', 'NEWON_AUTH_ALLOWED_ISSUERS']);
  for (const l of lines) assert.ok(/=(false)?$/.test(l), 'no values: ' + l.split('=')[0]);
  assert.match(e, /\[PUBLIC · BUILD-TIME\]/); assert.match(e, /\[SERVER ONLY\]/);
  assert.ok(!/^[A-Z_]*(PRIVATE_KEY|SERVICE_ACCOUNT|CLIENT_EMAIL)[A-Z_]*=/m.test(e), 'no service-account variable');
});

/* ───────── security headers (Vercel) ───────── */
function inlineHashes(html) {
  const out = []; const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m;
  while ((m = re.exec(html))) { if (/\bsrc\s*=/.test(m[1]) || /type\s*=\s*["']?application\/(ld\+)?json/i.test(m[1])) continue; out.push("'sha256-" + crypto.createHash('sha256').update(m[2]).digest('base64') + "'"); }
  return out;
}
const hdr = (rule, key) => (rule.headers.find(h => h.key.toLowerCase() === key.toLowerCase()) || {}).value;
test('NA-21 security headers: safe enforced headers + CSP report-only matching the inventoried dependencies', () => {
  const v = JSON.parse(src('vercel.json'));
  assert.ok(v.headers.find(r => r.source === '/app-ads.txt'), 'existing header kept');
  const all = v.headers.find(r => r.source === '/(.*)');
  assert.equal(hdr(all, 'X-Content-Type-Options'), 'nosniff');
  assert.equal(hdr(all, 'Referrer-Policy'), 'strict-origin-when-cross-origin');
  assert.match(hdr(all, 'Permissions-Policy'), /geolocation=\(self\)/); assert.match(hdr(all, 'Permissions-Policy'), /camera=\(\)/);
  for (const r of v.headers) for (const h of r.headers) assert.notEqual(h.key.toLowerCase(), 'content-security-policy', 'CSP is report-only in V1');
  const site = v.headers.find(r => r.source === '/((?!livon/?$).*)'); const siteCsp = hdr(site, 'Content-Security-Policy-Report-Only');
  for (const host of ['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://www.gstatic.com', 'https://cdn.jsdelivr.net', 'https://d8j0ntlcm91z4.cloudfront.net', 'https://www.youtube.com', 'https://formsubmit.co', 'https://api.newon.app', 'https://db.onlinewebfonts.com', 'https://fonts.cdnfonts.com'])
    assert.ok(siteCsp.includes(host), host);
  for (const d of ["object-src 'none'", "base-uri 'self'", "frame-ancestors 'self'"]) assert.ok(siteCsp.includes(d), d);
  /* LIVON index: hashes must equal the page's current inline scripts */
  const livonRules = v.headers.filter(r => r.source === '/livon' || r.source === '/livon/');
  assert.equal(livonRules.length, 2);
  const want = inlineHashes(src('livon/index.html')); assert.equal(want.length, 4);
  for (const r of livonRules) {
    const csp = hdr(r, 'Content-Security-Policy-Report-Only'); const scriptSrc = csp.split(';').find(d => d.trim().startsWith('script-src'));
    for (const h of want) assert.ok(scriptSrc.includes(h), 'missing hash ' + h + ' — recompute after editing inline scripts in livon/index.html');
    assert.ok(!scriptSrc.includes("'unsafe-inline'")); assert.ok(!scriptSrc.includes("'unsafe-eval'"));
    for (const host of ['https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com', 'https://*.firebaseapp.com', 'https://www.gstatic.com']) assert.ok(csp.includes(host), host);
  }
  /* path matching (JS approximation of the Vercel source patterns): LIVON index gets exactly one CSP, others the site policy */
  const re = new RegExp('^/((?!livon/?$).*)$');
  for (const p of ['/', '/livon/life/10s/friends/', '/livon/livon-platform.js', '/admin/', '/apps/ox-month/']) assert.ok(re.test(p), p);
  for (const p of ['/livon', '/livon/']) assert.ok(!re.test(p), p);
});
