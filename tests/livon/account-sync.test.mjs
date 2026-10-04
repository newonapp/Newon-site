// LIVON Account + Sync V1 (AS-01 … AS-32) — the account/sync contract from the person's side:
// anonymous use, sign-in, local-first writes, the sync queue and its states, bounded retry, conflicts, deletions,
// first-sign-in import, privacy boundaries, failure wording, and what production really has switched on.
//
// Production code under test: livon/data/livon-sync.js + livon/data/livon-user-data.js (run in a vm), livon/livon-account-ui.js,
// livon/data/livon-auth-bridge.js, server/livon/userdata/http.mjs with the in-memory store twin and the real token verifier.
// Tokens are signed with a throwaway key made here. Nothing in this file is LIVE: no Firebase project, database or deployment
// is contacted. The lower-level contract (SQL, certificates, CORS, rate limits) is in account-backend.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createUserDataHandler } from '../../server/livon/userdata/http.mjs';
import { createMemoryStore } from '../../server/livon/userdata/store.mjs';
import { createHealthHandler } from '../../server/livon/health.mjs';

const ROOT = new URL('../../', import.meta.url);
const src = p => readFileSync(new URL(p, ROOT), 'utf8');
const livon = p => src('livon/' + p);

/* ───────── identity: throwaway signing key served through the real certificate store ───────── */
const PROJECT = 'newon-plus-test', ISS = 'https://securetoken.google.com/' + PROJECT, KID = 'kid-as';
const KEY = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const PEM = KEY.publicKey.export({ type: 'spki', format: 'pem' });
const enc = o => Buffer.from(JSON.stringify(o)).toString('base64url');
function jwt(claims) { const i = enc({ alg: 'RS256', kid: KID, typ: 'JWT' }) + '.' + enc(claims); return i + '.' + crypto.sign('RSA-SHA256', Buffer.from(i), KEY.privateKey).toString('base64url'); }
function claims(sub, over = {}) { const t = Math.floor(Date.now() / 1000); return { iss: ISS, aud: PROJECT, sub, iat: t - 10, auth_time: t - 20, exp: t + 3600, firebase: { sign_in_provider: 'google.com' }, ...over }; }
const SUB_A = 'userAlpha01', SUB_B = 'userBravo02';

function server({ env = {} } = {}) {
  const store = createMemoryStore(), logs = [];
  const fullEnv = { NEWON_AUTH_VERIFY_ENABLED: 'true', NEWON_PLUS_FIREBASE_PROJECT_ID: PROJECT, LIVON_USERDATA_ENABLED: 'true', LIVON_DATABASE_URL: 'postgres://db.invalid/livon', ...env };
  const fetcher = async () => ({ ok: true, headers: { get: () => 'public, max-age=3600' }, json: async () => ({ [KID]: PEM }) });
  return { handler: createUserDataHandler({ env: fullEnv, store, fetcher, limiter: async () => {}, log: e => logs.push(e) }), store, logs };
}
async function call(handler, { method = 'GET', url = '/api/livon/userdata', headers = {}, body } = {}) {
  const res = { statusCode: 200, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } };
  const h = {}; for (const [k, v] of Object.entries(headers || {})) h[k.toLowerCase()] = v;
  await handler({ method, url, headers: { host: 'api.newon.app', ...h }, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body) }, res);
  let json = null; try { json = JSON.parse(res.body); } catch { /* empty */ }
  return { status: res.statusCode, json, raw: res.body, headers: res.headers };
}
const serverRecords = async (srv, sub) => (await call(srv.handler, { headers: { authorization: 'Bearer ' + jwt(claims(sub)) } })).json.records;

/* ───────── one browser: real user-data repository + real sync engine in a vm ───────── */
const ML = 'livon.mlStore.v1', PF = 'livon.platform.v1', T0 = Date.now() - 60_000;
function mem(init = {}) {
  const m = new Map(Object.entries(init).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  const s = { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m };
  return s;
}
let skew = 0;
function device(srv, { local = {}, ready = true } = {}) {
  const ls = mem(local), ss = mem(), timers = new Map(), out = []; let tid = 0;
  const log = (...a) => out.push(a.map(String).join(' '));
  const ctx = { localStorage: ls, sessionStorage: ss, navigator: { onLine: true }, console: { log, warn: log, error: log, info: log, debug: log }, URL,
    setTimeout: (fn, ms) => { timers.set(++tid, { fn, ms }); return tid; }, clearTimeout: id => timers.delete(id), addEventListener() {} };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(livon('data/livon-user-data.js'), ctx);
  vm.runInContext(livon('data/livon-sync.js'), ctx);
  const net = { down: false, status: null, calls: [], hold: null, release: null, mangle: null };
  const resp = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
  const fetchImpl = async (url, init = {}) => {
    net.calls.push({ url, method: init.method || 'GET', body: init.body || '', headers: init.headers || {} });
    if (net.down) throw new TypeError('Failed to fetch');
    if (url === '/api/health') return resp(200, { ok: true, userdata: { ready } });
    if (net.status) return resp(net.status, { ok: false, code: 'STORE_UNAVAILABLE' });
    if (net.mangle) { const x = net.mangle(url, init); if (x) return x; }
    if (net.hold && net.hold(url, init)) await new Promise(r => { net.release = r; });
    const r = await call(srv.handler, { method: init.method, url, headers: init.headers, body: init.body });
    return resp(r.status, r.json);
  };
  let token = null; const reloads = [];
  const S = ctx.LivonSync.create({ fetchImpl, getToken: () => Promise.resolve(token), api: { url: p => p }, onProfileChanged: w => reloads.push(w) });
  const U = ctx.LivonUserData, read = k => { try { return JSON.parse(ls.getItem(k) || 'null'); } catch { return null; } }, stamp = () => Date.now() + (skew += 1000);
  const d = {
    ls, ss, U, S, net, reloads, ctx, read, out, timers,
    delays() { return [...timers.values()].map(t => t.ms); },
    fireTimers() { const fns = [...timers.values()].map(t => t.fn); timers.clear(); fns.forEach(f => f()); },
    signIn(sub, over) { token = jwt(claims(sub, over)); return S.onSignedIn({ issuer: ISS, subject: sub }); },
    token: () => token, setToken(t) { token = t; },
    async signOut(o = {}) { const r = await S.onSignedOut({ finalSync: true, ...o }); token = null; return r; },
    ml() { return read(ML) || { v: 2 }; }, setMl(m) { U.write(ML, m); },
    addTask(title, extra = {}) { const m = d.ml(), t = stamp(); m.todos = (m.todos || []).concat([{ id: extra.id || 'todo_' + crypto.randomUUID().slice(0, 8), title, done: false, createdAt: t, updatedAt: t, ...extra }]); d.setMl(m); return m.todos.at(-1).id; },
    editTask(id, patch) { const m = d.ml(); m.todos = m.todos.map(x => (x.id === id ? { ...x, ...patch, updatedAt: stamp() } : x)); d.setMl(m); },
    deleteTask(id) { const m = d.ml(); m.todos = m.todos.filter(x => x.id !== id); d.setMl(m); },
    save(item) { const p = read(PF) || {}; p.saves = (p.saves || []).concat([{ savedAt: stamp(), ...item }]); U.write(PF, p); },
    unsave(id) { const p = read(PF) || {}; p.saves = (p.saves || []).filter(s => s.id !== id); U.write(PF, p); },
    titles() { return (d.ml().todos || []).map(x => x.title).sort(); },
    states() { const q = S.queue(); return Object.fromEntries(S.SYNC_STATES.map(k => [k, q[k]])); }
  };
  return d;
}
const flush = async (n = 30) => { for (let i = 0; i < n; i++) await new Promise(r => setImmediate(r)); };
const J = x => JSON.parse(JSON.stringify(x));
const posts = d => d.net.calls.filter(c => c.method === 'POST');
const pulls = d => d.net.calls.filter(c => c.method === 'GET' && c.url.startsWith('/api/livon/userdata'));

/* ───────── account panel in a minimal DOM ───────── */
function panel({ auth, sync, launched = true }) {
  const el = { innerHTML: '', hidden: true, querySelector: () => null };
  const body = { appendChild(x) { body.child = x; } };
  const doc = { readyState: 'complete', body, addEventListener() {}, querySelectorAll: () => [el], querySelector: () => el, activeElement: null,
    createElement: () => ({ remove() {}, querySelector: () => null, set innerHTML(v) { this.html = v; } }) };
  const ctx = { document: doc, console, localStorage: mem(), NewonAuth: auth, LivonSync: sync, LivonUserData: { SENSITIVE_COLLECTIONS: ['journal', 'transactions', 'health_records', 'budgets'] }, LIVON_ACCOUNT_SYNC_PUBLIC: launched };
  ctx.window = ctx; vm.createContext(ctx); vm.runInContext(livon('livon-account-ui.js'), ctx);
  return { ui: ctx.LivonAccountUI, body };
}
const authOf = (state, providers = ['google.com']) => ({ getState: () => state, providers: () => providers, subscribe() {}, signIn: async () => {}, signOut: async () => {} });
const SIGNED = { configured: true, status: 'authenticated', session: { subject: SUB_A, issuer: ISS, email: 'me@example.com' } };
const syncOf = (status, queue = {}) => ({ status: () => ({ signedIn: true, retry: { attempt: 0, nextAt: null, exhausted: false }, needsSignIn: false, conflicts: 0, ...status }), queue: () => ({ LOCAL: 0, PENDING: 0, SYNCING: 0, SYNCED: 0, FAILED: 0, CONFLICT: 0, items: [], ...queue }), subscribe() {}, activeProfile: () => ({ kind: 'account', key: 'k1' }) });
const text = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/* ═════════════ anonymous first ═════════════ */
test('AS-01 anonymous local use: My Life and saves work with no account, no request, every item LOCAL', async () => {
  const D = device(server());
  const t = D.addTask('장보기'); D.save({ id: 'ext:x:1', title: '저장한 곳' }); D.editTask(t, { done: true });
  assert.deepEqual(D.titles(), ['장보기']); assert.equal(D.read(PF).saves.length, 1);
  assert.equal(D.net.calls.length, 0, 'no network at all'); assert.equal(D.timers.size, 0, 'no sync scheduled');
  assert.equal(D.U.mode(), 'anonymous'); assert.equal(D.S.status().signedIn, false); assert.equal(D.S.activeProfile().kind, 'anon');
  const q = D.S.queue();
  assert.equal(q.LOCAL, 2); assert.equal(q.PENDING + q.SYNCING + q.SYNCED + q.FAILED + q.CONFLICT, 0);
  assert.equal(await D.S.syncNow().then(s => s.status), 'idle', 'asking to sync while anonymous does nothing');
  assert.equal(D.net.calls.length, 0);
});

test('AS-02 login unavailable: no launch switch → no account UI and no sync; server without account storage → "unavailable", data stays', async () => {
  /* the launch switch is off: even a verified session never reaches the engine and the panel renders nothing */
  const calls = []; let sub = null;
  const ctx = { console, localStorage: mem() }; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(livon('data/livon-user-data.js'), ctx);
  ctx.LivonSync = { onSignedIn: () => calls.push('in'), onSignedOut: () => calls.push('out'), status: () => ({ status: 'idle', signedIn: false }), activeProfile: () => ({ kind: 'anon' }) };
  ctx.NewonAuth = { subscribe: fn => { sub = fn; } };
  vm.runInContext(livon('data/livon-auth-bridge.js'), ctx);
  sub({ state: { status: 'authenticated', session: { issuer: ISS, subject: SUB_A } } });
  assert.deepEqual(calls, [], 'no sync without the launch switch');
  assert.equal(panel({ auth: authOf(SIGNED), sync: syncOf({ status: 'synced' }), launched: false }).ui.panelHtml(), '');
  assert.equal(panel({ auth: authOf({ configured: false, status: 'anonymous' }), sync: undefined }).ui.panelHtml(), '', 'no Newon+ project → nothing');
  assert.equal(panel({ auth: authOf({ configured: true, status: 'anonymous' }, []), sync: undefined }).ui.panelHtml(), '', 'no sign-in method → no button');
  /* launched but the API says account storage is not ready */
  const D = device(server(), { ready: false }); D.addTask('그대로');
  const st = await D.signIn(SUB_A);
  assert.equal(st.status, 'unavailable'); assert.equal(st.errorCode, 'SYNC_NOT_AVAILABLE');
  assert.equal(D.S.activeProfile().kind, 'anon'); assert.deepEqual(D.titles(), ['그대로']); assert.equal(posts(D).length, 0);
  assert.match(text(panel({ auth: authOf(SIGNED), sync: syncOf({ status: 'unavailable' }) }).ui.panelHtml()), /계정 동기화를 아직 사용할 수 없습니다\. 데이터는 이 기기에 그대로 있습니다\./);
});

test('AS-03 authenticated state: signed in → account profile, synced, last sync time; the panel says so without showing who', async () => {
  const D = device(server());
  const st = await D.signIn(SUB_A);
  assert.equal(st.status, 'synced'); assert.equal(st.signedIn, true); assert.equal(st.active, 'account');
  assert.ok(st.lastSyncAt > 0); assert.equal(st.needsSignIn, false); assert.deepEqual(J(st.retry), { attempt: 0, nextAt: null, exhausted: false, max: 5 });
  const html = panel({ auth: authOf(SIGNED), sync: syncOf({ status: 'synced', lastSyncAt: Date.now() }) }).ui.panelHtml();
  assert.match(html, /Newon\+ 계정으로 로그인됨/); assert.match(html, /동기화됨 · 마지막 \d\d:\d\d/); assert.match(html, /data-livon-sync-now/); assert.match(html, /data-livon-signout/);
  assert.ok(!html.includes(SUB_A) && !html.includes('me@example.com') && !html.includes(ISS), 'no identity in the UI');
  const older = panel({ auth: authOf(SIGNED), sync: syncOf({ status: 'synced', lastSyncAt: Date.now() - 3 * 864e5 }) }).ui.panelHtml();
  assert.match(older, /마지막 \d{1,2}월 \d{1,2}일 \d\d:\d\d/, 'another day shows the date');
});

test('AS-04 logout: engine goes idle, timers stop, this device\'s own data is back, nothing more is sent', async () => {
  const srv = server();
  const D = device(srv, { local: { [ML]: { v: 2, todos: [{ id: 'todo_dev', title: '기기 할 일', createdAt: T0, updatedAt: T0 }] } } });
  await D.signIn(SUB_A); await D.S.declineImport();
  D.addTask('계정 할 일'); await D.S.syncNow();
  const r = await D.signOut();
  assert.equal(r.status, 'SIGNED_OUT');
  const st = D.S.status();
  assert.equal(st.status, 'idle'); assert.equal(st.signedIn, false); assert.equal(st.active, 'anon');
  assert.deepEqual(D.titles(), ['기기 할 일']);
  const n = D.net.calls.length; D.addTask('로그아웃 뒤'); D.fireTimers(); await flush();
  assert.equal(D.net.calls.length, n, 'a write after logout is local only'); assert.equal(D.S._tick(), false);
});

/* ═════════════ local-first, queue, success ═════════════ */
test('AS-05 local write: readable at once, marked waiting, sent later by one debounced pass (never per keystroke)', async () => {
  const srv = server(); const D = device(srv);
  await D.signIn(SUB_A);
  const n = D.net.calls.length;
  D.addTask('첫 줄'); D.addTask('둘째 줄'); D.addTask('셋째 줄');
  assert.deepEqual(D.titles(), ['둘째 줄', '셋째 줄', '첫 줄'], 'local first');
  assert.equal(D.net.calls.length, n, 'nothing sent yet'); assert.deepEqual(D.delays(), [4000], 'one debounce timer for three writes');
  assert.equal(D.states().PENDING, 3);
  D.fireTimers(); await flush(60);
  assert.equal(posts(D).filter(c => c.body.includes('"op":"batch"')).length, 1, 'one batch');
  assert.equal(D.states().SYNCED, 3); assert.equal((await serverRecords(srv, SUB_A)).length, 3);
});

test('AS-06 sync queue: LOCAL → PENDING → SYNCING → SYNCED; sensitive stays LOCAL; the queue carries ids and states, never content', async () => {
  const srv = server(); const D = device(srv);
  assert.deepEqual([...D.S.SYNC_STATES], ['LOCAL', 'PENDING', 'SYNCING', 'SYNCED', 'FAILED', 'CONFLICT']);
  D.addTask('비밀스러운 제목'); assert.equal(D.states().LOCAL, 1);
  await D.signIn(SUB_A); await D.S.approveImport({ collections: ['tasks'], includeSensitive: false });
  assert.equal(D.states().SYNCED, 1);
  const m = D.ml(); m.journal = [{ id: 'j_1', title: '일기', body: '속마음', createdAt: T0 }]; D.setMl(m);
  D.addTask('두 번째');
  assert.deepEqual(D.states(), { LOCAL: 1, PENDING: 1, SYNCING: 0, SYNCED: 1, FAILED: 0, CONFLICT: 0 });
  D.net.hold = (u, i) => i.method === 'POST' && String(i.body).includes('"op":"batch"');
  const p = D.S.syncNow(); await flush(40);
  assert.equal(D.S.status().status, 'syncing'); assert.equal(D.states().SYNCING, 1);
  D.net.hold = null; D.net.release(); await p;
  assert.deepEqual(D.states(), { LOCAL: 1, PENDING: 0, SYNCING: 0, SYNCED: 2, FAILED: 0, CONFLICT: 0 });
  const q = D.S.queue(), raw = JSON.stringify(q);
  assert.ok(!raw.includes('비밀스러운') && !raw.includes('속마음') && !raw.includes('일기'), 'no content in the queue');
  for (const it of q.items) assert.deepEqual(Object.keys(it).sort(), ['collection', 'deleted', 'id', 'localUpdatedAt', 'serverRev', 'state']);
  assert.ok(q.items.find(i => i.state === 'SYNCED').serverRev > 0); assert.ok(q.lastSyncedAt > 0);
});

test('AS-07 sync success: the server holds the same record under this account; status synced; nothing left waiting', async () => {
  const srv = server(); const D = device(srv);
  await D.signIn(SUB_A); const id = D.addTask('서류 내기', { note: '월말까지' });
  const st = await D.S.syncNow();
  assert.equal(st.status, 'synced'); assert.equal(st.errorCode, null); assert.ok(st.lastSyncAt >= T0);
  const rec = (await serverRecords(srv, SUB_A)).find(r => r.id === id);
  assert.equal(rec.collection, 'tasks'); assert.equal(rec.data.title, '서류 내기'); assert.equal(rec.data.note, '월말까지'); assert.equal(rec.deletedAt, null);
  assert.equal(D.states().PENDING + D.states().FAILED, 0);
});

/* ═════════════ failure, retry, duplicates ═════════════ */
test('AS-08 sync failure: local data untouched, change marked FAILED, the panel says it is safe on this device', async () => {
  const srv = server(); const D = device(srv);
  await D.signIn(SUB_A); D.addTask('서버 장애 중에 쓴 것'); D.save({ id: 'ext:x:9', title: '저장' });
  D.net.status = 503;
  const st = await D.S.syncNow();
  assert.equal(st.status, 'error'); assert.equal(st.errorCode, 'STORE_UNAVAILABLE'); assert.equal(st.needsSignIn, false);
  assert.deepEqual(D.titles(), ['서버 장애 중에 쓴 것']); assert.equal(D.read(PF).saves.length, 1);
  assert.equal(D.states().FAILED, 2); assert.equal((await serverRecords(srv, SUB_A)).length, 0);
  const html = panel({ auth: authOf(SIGNED), sync: syncOf({ status: 'error', errorCode: 'STORE_UNAVAILABLE', retry: { attempt: 1, nextAt: Date.now() + 5000, exhausted: false } }, { FAILED: 2 }) }).ui.panelHtml();
  const t = text(html);
  assert.match(t, /지금은 동기화하지 못했습니다\. 기록은 이 기기에 안전하게 저장되어 있습니다\. 잠시 후 자동으로 다시 시도합니다\./);
  assert.match(t, /아직 계정에 저장되지 않은 변경 2개가 이 기기에 있습니다\./); assert.match(html, /data-livon-sync-now[^>]*>다시 동기화</);
  assert.ok(!t.includes('STORE_UNAVAILABLE') && !/50\d/.test(t), 'no error code in front of the person');
});

test('AS-09 retry: growing waits, five automatic attempts, then none — typing, the 60 s tick and time never restart it; asking does', async () => {
  const srv = server(); const D = device(srv);
  assert.deepEqual([...D.S.RETRY_DELAYS_MS], [5000, 30000, 120000, 600000, 1800000]);
  await D.signIn(SUB_A); D.addTask('기다리는 변경');
  D.net.status = 503;
  const before = pulls(D).length, waits = [];
  let st = await D.S.syncNow();
  for (let i = 0; i < 8; i++) {
    st = D.S.status();
    if (st.retry.exhausted) break;
    assert.equal(D.delays().length, 1, 'exactly one retry timer'); waits.push(D.delays()[0]);
    assert.equal(st.retry.attempt, i + 1); assert.ok(st.retry.nextAt > Date.now() - 1000);
    D.fireTimers(); await flush(40);
  }
  assert.deepEqual(waits, [5000, 30000, 120000, 600000, 1800000]);
  st = D.S.status();
  assert.equal(st.status, 'error'); assert.equal(st.retry.exhausted, true); assert.equal(st.retry.nextAt, null);
  assert.equal(pulls(D).length - before, 6, 'the first pass + five retries, no more');
  const n = D.net.calls.length;
  assert.equal(D.timers.size, 0, 'no timer left'); D.fireTimers(); await flush();
  assert.equal(D.S._tick(), false, 'the periodic pull does not retry a failed pass');
  D.addTask('장애 중에 또 쓴 것'); D.editTask(D.ml().todos[0].id, { done: true }); await flush();
  assert.equal(D.timers.size, 0, 'a local write does not restart the series'); assert.equal(D.net.calls.length, n, 'no request after the series ended');
  assert.deepEqual(D.titles(), ['기다리는 변경', '장애 중에 또 쓴 것']);
  assert.match(text(panel({ auth: authOf(SIGNED), sync: syncOf({ status: 'error', retry: { attempt: 5, nextAt: null, exhausted: true } }) }).ui.panelHtml()), /자동으로 다시 시도하지 않으니 ‘다시 동기화’를 눌러 주세요\./);
  /* during a pending wait a write does not shorten it either */
  const E = device(srv); await E.signIn(SUB_A); E.net.status = 503; E.addTask('x'); await E.S.syncNow();
  assert.deepEqual(E.delays(), [5000]); E.addTask('y'); assert.deepEqual(E.delays(), [5000], 'still the 5 s wait, not a 4 s debounce');
  /* the person asks: a fresh series, and with the server back everything waiting is uploaded */
  D.net.status = null;
  st = await D.S.syncNow();
  assert.equal(st.status, 'synced'); assert.deepEqual(J(st.retry), { attempt: 0, nextAt: null, exhausted: false, max: 5 });
  assert.equal((await serverRecords(srv, SUB_A)).filter(r => r.collection === 'tasks' && !r.deletedAt).length >= 2, true);
  assert.equal(D.states().FAILED, 0);
});

test('AS-10 duplicate prevention: an unchanged record is never sent twice, concurrent requests share one pass, a replay creates nothing', async () => {
  const srv = server(); const D = device(srv);
  await D.signIn(SUB_A); const id = D.addTask('한 번만'); await D.S.syncNow();
  const batches = () => posts(D).filter(c => c.body.includes('"op":"batch"')).length, b0 = batches();
  await D.S.syncNow(); await D.S.syncNow();
  assert.equal(batches(), b0, 'nothing changed → nothing uploaded');
  const p0 = pulls(D).length;
  D.editTask(id, { done: true });
  const [a, b] = await Promise.all([D.S.syncNow(), D.S.syncNow()]);
  assert.equal(a.status, 'synced'); assert.equal(b.status, 'synced'); assert.equal(pulls(D).length - p0, 1, 'one pass for two requests');
  const sent = JSON.parse(posts(D).filter(c => c.body.includes('"op":"batch"')).at(-1).body).payload.records;
  const replay = await call(srv.handler, { method: 'POST', headers: { authorization: 'Bearer ' + D.token(), 'content-type': 'application/json' }, body: { op: 'batch', payload: { records: sent } } });
  assert.equal(replay.status, 200);
  const recs = (await serverRecords(srv, SUB_A)).filter(r => r.collection === 'tasks');
  assert.equal(recs.length, 1, 'still one record'); assert.equal(recs[0].id, id);
  const B = device(srv); await B.signIn(SUB_A); await B.S.syncNow(); await D.S.syncNow();
  assert.deepEqual(B.titles(), ['한 번만']); assert.deepEqual(D.titles(), ['한 번만'], 'no copy appears on either device');
});

/* ═════════════ conflicts and deletions ═════════════ */
test('AS-11 conflict: two devices change the same record → both versions kept on both devices, marked CONFLICT and counted', async () => {
  const srv = server(); const A = device(srv), B = device(srv);
  await A.signIn(SUB_A); const t = A.addTask('원래 제목'); await A.S.syncNow(); await B.signIn(SUB_A);
  A.editTask(t, { title: 'A가 고친 제목' }); B.editTask(t, { title: 'B가 고친 제목' });
  await B.S.syncNow(); const stA = await A.S.syncNow(); await B.S.syncNow();
  for (const D of [A, B]) {
    assert.deepEqual(D.titles(), ['A가 고친 제목', 'B가 고친 제목'], 'neither edit disappears');
    assert.equal(D.states().CONFLICT, 1); assert.equal(D.S.queue().items.filter(i => i.state === 'CONFLICT').length, 1);
  }
  assert.ok(stA.conflicts >= 1, 'the pass reports the conflict');
  const t2 = text(panel({ auth: authOf(SIGNED), sync: syncOf({ status: 'synced', lastSyncAt: Date.now() }, { CONFLICT: 1 }) }).ui.panelHtml());
  assert.match(t2, /두 기기에서 함께 고친 항목 1개는 두 버전을 모두 남겼습니다\. 내 생활에서 확인해 주세요\./);
  /* a newer clock alone never deletes: an edit made after another device's delete survives */
  const d = A.addTask('지웠다가 고친 것'); await A.S.syncNow(); await B.S.syncNow();
  A.deleteTask(d); await A.S.syncNow(); B.editTask(d, { title: '삭제 뒤에 고침' }); await B.S.syncNow(); await A.S.syncNow();
  for (const D of [A, B]) assert.ok(D.titles().includes('삭제 뒤에 고침'));
});

test('AS-12 delete/tombstone: a deletion reaches the other device and a stale or offline device never brings the record back', async () => {
  const srv = server(); const A = device(srv), B = device(srv), C = device(srv);
  await A.signIn(SUB_A); const t = A.addTask('지울 할 일'); A.save({ id: 'ext:x:del', title: '지울 저장' }); await A.S.syncNow();
  await B.signIn(SUB_A); await C.signIn(SUB_A);
  assert.deepEqual(C.titles(), ['지울 할 일']);
  C.net.down = true;                                             /* C keeps an old copy while it is offline */
  A.deleteTask(t); A.unsave('ext:x:del');
  assert.equal(A.states().PENDING, 2, 'the two deletions wait as items');
  await A.S.syncNow();
  const recs = await serverRecords(srv, SUB_A);
  for (const id of [t, 'ext:x:del']) { const r = recs.find(x => x.id === id); assert.ok(r.deletedAt > 0); assert.equal(r.data, null, 'tombstone, no content kept'); }
  await B.S.syncNow(); assert.deepEqual(B.titles(), []); assert.equal((B.read(PF).saves || []).length, 0);
  C.addTask('오프라인에서 추가'); await C.S.syncNow(); assert.equal(C.S.status().status, 'offline');
  C.net.down = false; await C.S.syncNow(); await A.S.syncNow(); await B.S.syncNow(); await C.S.syncNow();
  for (const D of [A, B, C]) { assert.deepEqual(D.titles(), ['오프라인에서 추가'], 'deleted record stays deleted everywhere'); assert.equal((D.read(PF).saves || []).length, 0); }
  assert.ok((await serverRecords(srv, SUB_A)).find(x => x.id === t).deletedAt > 0);
});

/* ═════════════ existing data and first sign-in ═════════════ */
const LOCAL = () => ({ [ML]: { v: 2, todos: [{ id: 'todo_old', title: '예전부터 있던 할 일', createdAt: T0, updatedAt: T0 }], goals: [{ id: 'goal_old', title: '예전 목표', createdAt: T0, updatedAt: T0 }], journal: [{ id: 'j_old', title: '일기', body: '개인적인 글', createdAt: T0 }] },
  [PF]: { saves: [{ id: 'ext:x:old', title: '예전 저장', savedAt: T0 }], recentSearches: ['청약'] }, 'livon.aiStore.v1': { threads: [{ id: 'th', messages: [{ role: 'user', content: 'AI에게 한 말' }] }] } });

test('AS-13 existing local data preserved: signing in, declining, syncing and signing out never clears or changes this device\'s data', async () => {
  const srv = server(); const D = device(srv, { local: LOCAL() });
  const before = { ml: D.ls.getItem(ML), pf: D.ls.getItem(PF), ai: D.ls.getItem('livon.aiStore.v1') };
  const st = await D.signIn(SUB_A);
  assert.equal(st.status, 'waiting-consent');
  assert.equal(D.ls.getItem(ML), before.ml, 'sign-in alone changes nothing'); assert.equal(D.ls.getItem(PF), before.pf);
  await D.S.declineImport();
  assert.equal((await serverRecords(srv, SUB_A)).length, 0, 'declined → nothing uploaded');
  const vault = D.read('livon.vault.anon.v1');
  assert.equal(vault.ml.todos[0].title, '예전부터 있던 할 일'); assert.equal(vault.ml.journal[0].body, '개인적인 글');
  assert.equal(D.ls.getItem('livon.aiStore.v1'), before.ai, 'AI conversations stay where they are');
  D.addTask('계정에서 쓴 것'); await D.S.syncNow(); await D.signOut();
  assert.deepEqual(J(D.read(ML)), JSON.parse(before.ml), 'this device\'s My Life is back exactly'); assert.deepEqual(J(D.read(PF)), JSON.parse(before.pf));
  assert.doesNotMatch(livon('data/livon-sync.js') + livon('data/livon-auth-bridge.js') + livon('livon-account-ui.js'), /localStorage\.clear\(|sessionStorage\.clear\(/);
});

test('AS-14 first-login migration: explained with counts, nothing sent before a choice, only ticked items uploaded, device data kept', async () => {
  const srv = server(); const D = device(srv, { local: LOCAL() });
  const st = await D.signIn(SUB_A);
  assert.equal(st.status, 'waiting-consent');
  assert.deepEqual(J(st.pending.counts), { tasks: 1, goals: 1, saved_items: 1 }); assert.deepEqual(J(st.pending.sensitiveCounts), { journal: 1 });
  assert.equal(posts(D).length, 0); assert.equal(D.S.activeProfile().kind, 'anon');
  const P = panel({ auth: authOf(SIGNED), sync: syncOf({ status: 'waiting-consent', pending: J(st.pending) }) });
  assert.match(P.ui.panelHtml(), /가져오기 선택/); P.ui.openConsent();
  const dlg = P.body.child.html;
  assert.match(dlg, /이 기기의 데이터를 계정에 저장할까요\?/); assert.match(dlg, /할 일 1개/); assert.match(dlg, /목표 1개/); assert.match(dlg, /저장한 항목 1개/);
  assert.match(dlg, /data-livon-import-col="journal" \/>/, 'sensitive starts unticked'); assert.match(dlg, /이 기기에만 두기/);
  assert.match(dlg, /닫으면 아무것도 저장하지 않고/);
  const r = await D.S.approveImport({ collections: ['tasks', 'saved_items'], includeSensitive: false });
  assert.equal(r.status, 'IMPORTED'); assert.equal(r.selected, 2);
  const recs = await serverRecords(srv, SUB_A);
  assert.deepEqual(recs.map(x => x.collection).sort(), ['saved_items', 'tasks'], 'the goal was not ticked, the journal is sensitive');
  assert.deepEqual(D.titles(), ['예전부터 있던 할 일'], 'imported items are in the account profile');
  assert.equal(D.read('livon.vault.anon.v1').ml.goals[0].title, '예전 목표', 'what was not imported waits untouched on this device');
  await D.signOut(); const again = await D.signIn(SUB_A);
  assert.notEqual(again.status, 'waiting-consent', 'asked once per account on this device');
});

/* ═════════════ offline, server down, session ═════════════ */
test('AS-15 offline use: everything keeps working, the change waits, and it is uploaded when the connection returns', async () => {
  const srv = server(); const D = device(srv);
  await D.signIn(SUB_A); D.net.down = true; D.ctx.navigator.onLine = false;
  const t = D.addTask('지하철에서 쓴 것'); D.save({ id: 'ext:x:off', title: '오프라인 저장' }); D.editTask(t, { done: true });
  assert.deepEqual(D.titles(), ['지하철에서 쓴 것']); assert.equal(D.read(PF).saves.length, 1);
  const st = await D.S.syncNow();
  assert.equal(st.status, 'offline'); assert.equal(D.states().FAILED, 2); assert.equal(D.S._tick(), false);
  assert.match(text(panel({ auth: authOf(SIGNED), sync: syncOf({ status: 'offline' }) }).ui.panelHtml()), /오프라인입니다\. 연결되면 다시 동기화합니다\. 이 기기의 기록은 그대로 사용할 수 있습니다\./);
  D.net.down = false; D.ctx.navigator.onLine = true;
  D.S._resume(500);                                              /* what the browser "online" event does */
  assert.deepEqual(D.delays(), [500]); D.fireTimers(); await flush(60);
  assert.equal(D.S.status().status, 'synced');
  assert.equal((await serverRecords(srv, SUB_A)).find(r => r.id === t).data.done, true);
  assert.match(livon('data/livon-sync.js'), /addEventListener\("online", function \(\) \{ if \(engine\.status\(\)\.signedIn\) engine\._resume\(500\); \}\)/);
});

test('AS-16 server unavailable: My Life, saves and local reads work during the outage; nothing is lost; the next successful pass catches up', async () => {
  const srv = server(); const A = device(srv), B = device(srv);
  await A.signIn(SUB_A); A.addTask('장애 전'); await A.S.syncNow(); await B.signIn(SUB_A);
  for (const code of [500, 502, 503, 429]) {
    A.net.status = code; A.addTask('장애 ' + code); const st = await A.S.syncNow();
    assert.equal(st.status, 'error', String(code)); assert.ok(A.titles().includes('장애 ' + code));
    assert.ok(st.retry.attempt >= 1 && st.retry.nextAt, code + ' is retried later');
  }
  assert.equal(A.titles().length, 5);
  B.net.status = 503; assert.equal((await B.S.syncNow()).status, 'error'); assert.deepEqual(B.titles(), ['장애 전'], 'B keeps what it had');
  A.net.status = null; B.net.status = null;
  assert.equal((await A.S.syncNow()).status, 'synced'); assert.equal((await B.S.syncNow()).status, 'synced');
  assert.equal(B.titles().length, 5);
});

test('AS-17 expired session: 401 → "sign in again", no automatic retry, local data and the waiting change are kept', async () => {
  const srv = server(); const D = device(srv);
  await D.signIn(SUB_A); D.addTask('만료 전에 쓴 것');
  const t = Math.floor(Date.now() / 1000);
  D.setToken(jwt(claims(SUB_A, { iat: t - 7200, auth_time: t - 7300, exp: t - 3600 })));
  let st = await D.S.syncNow();
  assert.equal(st.status, 'error'); assert.equal(st.needsSignIn, true); assert.equal(st.retry.nextAt, null); assert.equal(st.retry.exhausted, false);
  assert.equal(D.timers.size, 0, 'an ended session is not retried'); assert.equal(D.S._tick(), false);
  assert.deepEqual(D.titles(), ['만료 전에 쓴 것']); assert.equal(D.states().FAILED, 1);
  D.setToken(null); st = await D.S.syncNow();
  assert.equal(st.needsSignIn, true, 'no token at all is the same state'); assert.equal(D.timers.size, 0);
  const tx = text(panel({ auth: authOf(SIGNED), sync: syncOf({ status: 'error', errorCode: 'NO_SESSION', needsSignIn: true }) }).ui.panelHtml());
  assert.match(tx, /로그인이 만료되었습니다\. 다시 로그인하면 이어서 동기화합니다\. 기록은 이 기기에 안전하게 저장되어 있습니다\./);
  D.setToken(jwt(claims(SUB_A)));                                 /* signed in again */
  st = await D.S.syncNow();
  assert.equal(st.status, 'synced'); assert.equal(st.needsSignIn, false);
  assert.equal((await serverRecords(srv, SUB_A)).filter(r => r.data && r.data.title === '만료 전에 쓴 것').length, 1);
});

test('AS-18 unauthorized request: no token, a forged token or a token for another project stores and returns nothing', async () => {
  const srv = server(); const body = { op: 'batch', payload: { records: [{ id: 'todo_x', collection: 'tasks', schemaVersion: 1, createdAt: T0, updatedAt: T0, deletedAt: null, localRev: 1, serverRev: null, data: { id: 'todo_x', title: '몰래' } }] } };
  const forged = (() => { const k = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }); const i = enc({ alg: 'RS256', kid: KID, typ: 'JWT' }) + '.' + enc(claims(SUB_A)); return i + '.' + crypto.sign('RSA-SHA256', Buffer.from(i), k.privateKey).toString('base64url'); })();
  const cases = { none: {}, forged: { authorization: 'Bearer ' + forged }, otherProject: { authorization: 'Bearer ' + jwt(claims(SUB_A, { aud: 'other-project', iss: 'https://securetoken.google.com/other-project' })) }, notBearer: { authorization: 'Basic abc' }, algNone: { authorization: 'Bearer ' + enc({ alg: 'none' }) + '.' + enc(claims(SUB_A)) + '.' } };
  for (const [name, h] of Object.entries(cases)) {
    const w = await call(srv.handler, { method: 'POST', headers: { ...h, 'content-type': 'application/json' }, body });
    const r = await call(srv.handler, { headers: h });
    /* a header that is not a well-formed signed Bearer token is a malformed request (400); everything else is 401 */
    const want = name === 'notBearer' || name === 'algNone' ? [400, 401] : [401];
    assert.ok(want.includes(w.status), name + ' write ' + w.status); assert.ok(want.includes(r.status), name + ' read ' + r.status);
    assert.ok(!w.raw.includes('몰래') && !/stack|at .+:\d+:\d+/.test(w.raw), name + ' answer carries no content or trace');
  }
  assert.equal((await call(srv.handler, { url: '/api/livon/userdata?token=' + jwt(claims(SUB_A)) })).status, 400, 'a token in the URL is refused');
  assert.equal((await serverRecords(srv, SUB_A)).length, 0);
});

test('AS-19 user A cannot access user B: separate accounts on the server and on one shared device', async () => {
  const srv = server(); const A = device(srv), B = device(srv);
  await A.signIn(SUB_A); const ta = A.addTask('A의 할 일'); A.save({ id: 'ext:x:a', title: 'A의 저장' }); await A.S.syncNow();
  await B.signIn(SUB_B); assert.deepEqual(B.titles(), []); assert.equal(((B.read(PF) || {}).saves || []).length, 0);
  B.addTask('B의 할 일', { id: ta }); await B.S.syncNow();        /* the same record id in another account is another record */
  assert.deepEqual((await serverRecords(srv, SUB_A)).filter(r => r.collection === 'tasks').map(r => r.data.title), ['A의 할 일']);
  assert.deepEqual((await serverRecords(srv, SUB_B)).map(r => r.data.title), ['B의 할 일']);
  for (const owner of [{ userId: SUB_A }, { ownerId: 'acct_x' }, { user: SUB_A }]) {
    const r = await call(srv.handler, { method: 'POST', headers: { authorization: 'Bearer ' + B.token(), 'content-type': 'application/json' }, body: { op: 'list', payload: { collection: 'tasks', ...owner } } });
    assert.equal(r.status, 400, 'a client-sent owner is refused: ' + Object.keys(owner)[0]);
  }
  /* one device, two people: sign out A, sign in B */
  await A.signOut(); const st = await A.signIn(SUB_B);
  assert.equal(st.status, 'synced'); assert.deepEqual(A.titles(), ['B의 할 일'], 'B sees only B');
  assert.ok(!JSON.stringify(A.read(PF) || {}).includes('A의 저장'));
  A.addTask('B가 이 기기에서 쓴 것'); await A.S.syncNow();
  assert.ok(!(await serverRecords(srv, SUB_A)).some(r => r.data && r.data.title === 'B가 이 기기에서 쓴 것'), 'never written into A\'s account');
});

/* ═════════════ what syncs ═════════════ */
test('AS-20 saved sync: a save (with its source record) and an unsave travel to the other device', async () => {
  const srv = server(); const A = device(srv), B = device(srv);
  await A.signIn(SUB_A); await B.signIn(SUB_A);
  A.save({ id: 'ext:kr-tourapi:place:1', title: '서울숲', folder: '나들이', data: { snapshot: { provenance: { provider: 'kr-tourapi', sourceKind: 'public' } } } });
  B.save({ id: 'topic:housing', title: '주거 가이드' });
  await A.S.syncNow(); await B.S.syncNow(); await A.S.syncNow();
  for (const D of [A, B]) assert.deepEqual(D.read(PF).saves.map(s => s.id).sort(), ['ext:kr-tourapi:place:1', 'topic:housing']);
  assert.equal(B.read(PF).saves.find(s => s.id === 'ext:kr-tourapi:place:1').data.snapshot.provenance.provider, 'kr-tourapi');
  B.unsave('topic:housing'); await B.S.syncNow(); await A.S.syncNow();
  assert.deepEqual(A.read(PF).saves.map(s => s.id), ['ext:kr-tourapi:place:1']);
});

test('AS-21 My Life sync: tasks, goals, schedule, checklists and habits arrive on the other device and edits follow', async () => {
  const srv = server(); const A = device(srv), B = device(srv);
  await A.signIn(SUB_A);
  const m = A.ml(), t = Date.now();
  m.todos = [{ id: 'todo_1', title: '이력서 고치기', done: false, createdAt: t, updatedAt: t }];
  m.goals = [{ id: 'goal_1', title: '자격증 따기', status: 'active', createdAt: t, updatedAt: t }];
  m.events = [{ id: 'ev_1', title: '면접', date: '2026-10-20', allDay: true, createdAt: t, updatedAt: t }];
  m.checklists = [{ id: 'cl_1', title: '이사 준비', items: [{ id: 'i1', text: '전입신고', done: false }], createdAt: t, updatedAt: t }];
  m.habits = [{ id: 'hb_1', title: '걷기', createdAt: t, updatedAt: t }];
  A.setMl(m); await A.S.syncNow();
  await B.signIn(SUB_A);
  const b = B.ml();
  assert.equal(b.todos[0].title, '이력서 고치기'); assert.equal(b.goals[0].title, '자격증 따기'); assert.equal(b.events[0].date, '2026-10-20');
  assert.equal(b.checklists[0].items[0].text, '전입신고'); assert.equal(b.habits[0].title, '걷기');
  B.editTask('todo_1', { done: true }); await B.S.syncNow(); await A.S.syncNow();
  assert.equal(A.ml().todos[0].done, true);
  assert.deepEqual([...new Set((await serverRecords(srv, SUB_A)).map(r => r.collection))].sort(), ['calendar_items', 'checklists', 'goals', 'habits', 'tasks']);
});

test('AS-22 preferences sync: alert choices, region (시/도·시군구) and My Life settings converge; 동 and the profile stay on the device', async () => {
  const srv = server(); const A = device(srv), B = device(srv);
  await A.signIn(SUB_A); await B.signIn(SUB_A);
  const p = A.read(PF) || {}; p.alertPrefs = { todo: false, event: true }; p.region = { sido: '서울', sgg: '성동구', dong: '성수동' }; p.profile = { name: '나원' }; A.U.write(PF, p);
  const m = A.ml(); m.settings = { weekStart: 'mon' }; A.setMl(m);
  await A.S.syncNow(); await B.S.syncNow();
  assert.deepEqual(J(B.read(PF).alertPrefs), { todo: false, event: true }); assert.equal(B.read(PF).region.sido, '서울'); assert.equal(B.read(PF).region.sgg, '성동구'); assert.ok(!B.read(PF).region.dong, '동 did not arrive on the other device'); assert.deepEqual(J(B.ml().settings), { weekStart: 'mon' });
  const raw = JSON.stringify(await serverRecords(srv, SUB_A));
  assert.ok(!raw.includes('성수동'), '동 never leaves the device'); assert.ok(!raw.includes('나원'), 'the profile name never leaves the device');
  assert.ok((await serverRecords(srv, SUB_A)).every(r => r.collection === 'preferences'));
});

/* ═════════════ privacy ═════════════ */
test('AS-23 private-local exclusion: AI talk, community writing, recent activity, onboarding drafts and caches never sync; sensitive only when turned on', async () => {
  const srv = server();
  const D = device(srv, { local: { 'livon.aiStore.v1': { threads: [{ id: 'th', messages: [{ role: 'user', content: 'AI비밀' }] }] }, 'livon.cmStore.v1': { v: 2, posts: [{ id: 'p1', title: '커뮤니티글', body: '본문' }], nickname: '별명' },
    'livon.today.recent.v1': ['최근본것'], 'livon.exRecent': ['최근검색'], 'livon.personalization.v1': { version: 1, state: 'IN_PROGRESS', draft: { note: '온보딩초안' } }, 'livon.data.v1:kr-tourapi': { items: ['캐시'] } } });
  for (const [k, cls] of Object.entries({ 'livon.aiStore.v1': 'DEVICE_LOCAL', 'livon.cmStore.v1': 'COMMUNITY_LOCAL', 'livon.today.recent.v1': 'DEVICE_LOCAL', 'livon.exRecent': 'DEVICE_LOCAL', 'livon.personalization.v1': 'DEVICE_LOCAL', 'livon.data.v1:kr-tourapi': 'SERVER_SOURCE_CACHE', 'livon.sync.v1:k1': 'DEVICE_LOCAL', 'livon.vault.anon.v1': 'DEVICE_LOCAL' })) assert.equal(D.U.classify(k), cls, k);
  await D.signIn(SUB_A);
  const p = D.read(PF) || {}; p.recentSearches = ['검색어기록']; p.family = [{ name: '가족이름' }]; D.U.write(PF, p);
  const m = D.ml(); m.todos = [{ id: 'todo_ok', title: '올라가도 되는 것', createdAt: T0, updatedAt: T0 }]; m.journal = [{ id: 'j_1', title: '일기제목', body: '일기본문', createdAt: T0 }];
  m.health = [{ id: 'h_1', title: '혈압기록', createdAt: T0 }]; m.transactions = [{ id: 'tx_1', title: '월세지출', amount: 500000, createdAt: T0 }]; D.setMl(m);
  await D.S.syncNow();
  let raw = JSON.stringify(await serverRecords(srv, SUB_A)) + posts(D).map(c => c.body).join('');
  for (const secret of ['AI비밀', '커뮤니티글', '별명', '최근본것', '최근검색', '온보딩초안', '캐시', '검색어기록', '가족이름', '일기본문', '혈압기록', '월세지출']) assert.ok(!raw.includes(secret), secret + ' stayed on the device');
  assert.ok(raw.includes('올라가도 되는 것'));
  assert.deepEqual(D.states(), { LOCAL: 3, PENDING: 0, SYNCING: 0, SYNCED: 1, FAILED: 0, CONFLICT: 0 }, 'sensitive records are LOCAL, not "waiting"');
  D.S.setSensitive(true); await D.S.syncNow();
  raw = JSON.stringify(await serverRecords(srv, SUB_A));
  assert.ok(raw.includes('일기본문') && raw.includes('혈압기록'), 'sent only after the person turned it on');
  assert.ok(!raw.includes('AI비밀') && !raw.includes('커뮤니티글'), 'still never the AI talk or community writing');
  assert.match(panel({ auth: authOf(SIGNED), sync: syncOf({ status: 'synced' }) }).ui.panelHtml(), /건강·가계부·일기·예산은 직접 켜야만 계정에 저장됩니다\./);
});

test('AS-24 no sensitive log: neither the server log nor the browser console carries record content, the subject, the account id or a token', async () => {
  const srv = server(); const D = device(srv);
  await D.signIn(SUB_A); D.S.setSensitive(true);
  const m = D.ml(); m.todos = [{ id: 'todo_log', title: '로그에없어야할제목', createdAt: T0, updatedAt: T0 }]; m.journal = [{ id: 'j_log', title: '일기', body: '로그에없어야할일기', createdAt: T0 }]; D.setMl(m);
  await D.S.syncNow(); D.net.status = 503; D.addTask('실패중제목'); await D.S.syncNow(); D.net.status = null;
  D.setToken('not-a-token'); await D.S.syncNow();
  const logs = JSON.stringify(srv.logs) + D.out.join('\n');
  assert.ok(srv.logs.length > 0, 'the server does log requests');
  for (const s of ['로그에없어야할제목', '로그에없어야할일기', '실패중제목', SUB_A, 'eyJ', 'Bearer', 'acct_']) assert.ok(!logs.includes(s), 'not logged: ' + s);
  assert.doesNotMatch(livon('data/livon-sync.js').replace(/\/\*[\s\S]*?\*\//g, ''), /console\.(log|info|debug|warn|error)\(/, 'the engine logs nothing');
  assert.doesNotMatch(livon('livon-account-ui.js').replace(/\/\*[\s\S]*?\*\//g, ''), /console\.(log|info|debug|warn|error)\(/, 'the panel logs nothing');
});

test('AS-25 no token exposure: Authorization header only — never a URL, storage, status, queue, the panel or an error', async () => {
  const srv = server(); const D = device(srv);
  await D.signIn(SUB_A); D.addTask('t'); await D.S.syncNow(); D.net.status = 503; await D.S.syncNow(); D.net.status = null; await D.S.syncNow();
  const tok = D.token();
  for (const c of D.net.calls) { assert.ok(!c.url.includes(tok) && !/token|authorization|bearer/i.test(c.url), 'url ' + c.url); assert.ok(!String(c.body).includes(tok), 'body'); }
  const withAuth = D.net.calls.filter(c => c.headers && (c.headers.authorization || c.headers.Authorization));
  assert.ok(withAuth.length > 0); assert.ok(withAuth.every(c => c.url.startsWith('/api/livon/userdata')), 'the token goes to the account route only (never /api/health)');
  const stored = [...D.ls._m.entries(), ...D.ss._m.entries()].map(([k, v]) => k + v).join('\n');
  assert.ok(!stored.includes(tok) && !stored.includes(SUB_A) && !/eyJ[A-Za-z0-9_-]{10,}\./.test(stored), 'nothing token-like or the subject in storage');
  assert.ok(!(JSON.stringify(D.S.status()) + JSON.stringify(D.S.queue())).includes(tok));
  const ui = livon('livon-account-ui.js');
  assert.doesNotMatch(ui, /getIdToken|authorization|Bearer/i);
  assert.match(livon('data/livon-user-data.js'), /credentials: "omit", redirect: "error"/);
});

/* ═════════════ robustness ═════════════ */
test('AS-26 corrupted local state: broken sync state, profile marker, vault or store never throws and never blocks LIVON', async () => {
  const srv = server();
  const key = device(srv).S.accountKey({ issuer: ISS, subject: SUB_A });
  for (const bad of ['{', 'null', '[]', '"x"', '{"index":7,"lastServerRev":"NaN"}', '']) {
    const D = device(srv, { local: { ['livon.sync.v1:' + key]: bad, 'livon.activeProfile.v1': bad, 'livon.vault.anon.v1': bad, [ML]: bad === '{' ? '{' : { v: 2, todos: [{ id: 'todo_k', title: '남아있는 것', createdAt: T0, updatedAt: T0 }] } } });
    assert.doesNotThrow(() => { D.S.status(); D.S.queue(); D.S.activeProfile(); }, bad);
    assert.equal(D.S.activeProfile().kind, 'anon', 'a broken marker means this device\'s own data');
    let st; await assert.doesNotReject(async () => { st = await D.signIn(SUB_A); if (st.status === 'waiting-consent') st = (await D.S.declineImport(), D.S.status()); }, bad);
    assert.ok(['synced', 'error'].includes(st.status), bad + ' → ' + st.status);
    assert.doesNotThrow(() => D.addTask('깨진 상태에서도 쓰기'));
    assert.ok(D.titles().includes('깨진 상태에서도 쓰기'));
  }
  const E = device(srv, { local: { 'livon.activeProfile.v1': { kind: 'account', key: '../../etc' } } });
  assert.doesNotThrow(() => E.S.queue()); assert.equal(E.S.status().signedIn, false);
});

test('AS-27 malformed remote response: not JSON, wrong shape, hostile records or a redirect → a failed pass, local data unchanged, nothing applied', async () => {
  const srv = server(); const D = device(srv);
  await D.signIn(SUB_A); D.addTask('로컬에 있는 것'); await D.S.syncNow();
  const snapshot = D.ls.getItem(ML);
  const R = (status, body, extra = {}) => ({ ok: status >= 200 && status < 300, status, json: body === undefined ? async () => { throw new SyntaxError('Unexpected token <'); } : async () => body, ...extra });
  const cases = {
    html: () => R(200, undefined), nullBody: () => R(200, null), notOk: () => R(200, { ok: false }), text: () => R(200, 'ok'),
    redirected: () => R(200, { ok: true, records: [] }, { redirected: true }),
    recordsNotArray: () => R(200, { ok: true, records: 'x', nextSince: 0 })
  };
  for (const [name, make] of Object.entries(cases)) {
    D.net.mangle = url => (url.startsWith('/api/livon/userdata') ? make() : null);
    let st; await assert.doesNotReject(async () => { st = await D.S.syncNow(); }, name);
    if (name !== 'recordsNotArray') assert.equal(st.status, 'error', name);
    assert.equal(D.ls.getItem(ML), snapshot, name + ': local data unchanged');
  }
  /* records that are not LIVON records are never written into My Life */
  D.net.mangle = (url, init) => (init.method === 'GET' && url.startsWith('/api/livon/userdata') ? R(200, { ok: true, hasMore: false, nextSince: 999, records: [
    { id: '__proto__', collection: 'tasks', schemaVersion: 1, createdAt: T0, updatedAt: T0, deletedAt: null, serverRev: 900, data: { title: '오염' } },
    { id: 'x1', collection: 'not_a_collection', schemaVersion: 1, createdAt: T0, updatedAt: T0, deletedAt: null, serverRev: 901, data: { title: '모르는 종류' } },
    { id: 'x2', collection: 'tasks', schemaVersion: 1, createdAt: T0, updatedAt: T0, deletedAt: null, serverRev: 902, data: 'string' }, null, 7] }) : null);
  await assert.doesNotReject(() => D.S.syncNow());
  assert.deepEqual(D.titles(), ['로컬에 있는 것'], 'hostile or unknown records are not applied');
  assert.equal(({}).title, undefined, 'no prototype pollution');
  D.net.mangle = null; assert.equal((await D.S.syncNow()).status, 'synced');
});

/* ═════════════ UI ═════════════ */
const STATES = {
  synced: [{ status: 'synced', lastSyncAt: Date.now() }, {}], syncing: [{ status: 'syncing' }, { SYNCING: 2 }], offline: [{ status: 'offline', lastSyncAt: Date.now() }, { FAILED: 1 }],
  error: [{ status: 'error', errorCode: 'STORE_UNAVAILABLE', retry: { attempt: 2, nextAt: Date.now() + 1, exhausted: false } }, { FAILED: 3 }], exhausted: [{ status: 'error', retry: { attempt: 5, nextAt: null, exhausted: true } }, { FAILED: 1 }],
  expired: [{ status: 'error', errorCode: 'NO_SESSION', needsSignIn: true }, { FAILED: 1 }], unavailable: [{ status: 'unavailable', errorCode: 'SYNC_NOT_AVAILABLE' }, {}],
  consent: [{ status: 'waiting-consent', pending: { counts: { tasks: 2 }, sensitiveCounts: { journal: 1 } } }, {}], conflict: [{ status: 'synced', lastSyncAt: Date.now(), conflicts: 1 }, { CONFLICT: 1, PENDING: 1 }]
};
const htmlOf = name => panel({ auth: authOf(SIGNED), sync: syncOf(...STATES[name]) }).ui.panelHtml();
const signedOutHtml = () => panel({ auth: authOf({ configured: true, status: 'anonymous' }), sync: undefined }).ui.panelHtml();

test('AS-28 accessibility + wording: live status region, real buttons, labelled choices, a proper dialog, and no developer words', () => {
  for (const name of Object.keys(STATES)) {
    const h = htmlOf(name), t = text(h);
    assert.match(h, /<p role="status" data-livon-sync-line>[^<]+<\/p>/, name + ': status is announced');
    for (const b of h.match(/<button[^>]*>/g) || []) assert.match(b, /type="button"/, name + ' ' + b);
    assert.equal((h.match(/<input/g) || []).length, (h.match(/<label><input type="checkbox"/g) || []).length, name + ': every input sits inside its label');
    assert.doesNotMatch(t, /repository|queue|token|payload|endpoint|sync|tombstone|conflict|pending|failed|retry|401|503|null|undefined|NaN|토큰|리포지토리|엔드포인트|페이로드|대기열/i, name + ': ' + t);
    assert.match(t, /로그아웃해도 이 기기의 데이터는 지워지지 않습니다\./);
  }
  const so = signedOutHtml();
  assert.match(text(so), /로그인하면 할 일·목표·일정·저장한 항목을 여러 기기에서 이어서 쓸 수 있습니다\. 로그인만으로는 아무것도 업로드되지 않습니다\./);
  assert.match(so, /<button type="button"[^>]*data-livon-signin="google\.com">Google로 로그인<\/button>/);
  const P = panel({ auth: authOf(SIGNED), sync: syncOf(...STATES.consent) }); P.ui.openConsent();
  const dlg = P.body.child.html;
  assert.match(dlg, /role="dialog" aria-modal="true" aria-labelledby="livon-consent-title"/); assert.match(dlg, /<h2 id="livon-consent-title">/);
  assert.match(dlg, /data-livon-consent-close aria-label="닫기"/);
  assert.equal((dlg.match(/<li><label><input type="checkbox"/g) || []).length, 2, 'every choice is a labelled checkbox');
  assert.match(livon('livon-account-ui.js'), /e\.key === "Escape"\) closeDialog\(\)/); assert.match(livon('livon-account-ui.js'), /lastFocus\.focus\(\)/, 'focus returns to where it was');
  /* each state has its own sentence, and a failure always says the records are safe here */
  assert.equal(new Set(Object.keys(STATES).filter(n => n !== 'conflict').map(n => (htmlOf(n).match(/data-livon-sync-line>([^<]+)</) || [])[1])).size, 8);
  for (const n of ['error', 'exhausted', 'expired']) assert.match(text(htmlOf(n)), /기록은 이 기기에 안전하게 저장되어 있습니다\./, n);
});

test('AS-29 responsive: the panel is built only from existing My Life components — no fixed widths, wrapping actions, no new layout', () => {
  const all = Object.keys(STATES).map(htmlOf).join('') + signedOutHtml();
  const classes = new Set((all.match(/class="([^"]+)"/g) || []).flatMap(c => c.slice(7, -1).split(/\s+/)));
  const css = src('livon/life-now-page.css');
  assert.ok(classes.size >= 5);
  for (const c of classes) { assert.match(c, /^lv-ml-/, 'only My Life component classes: ' + c); assert.ok(css.includes('.' + c), c + ' exists in life-now-page.css'); }
  assert.doesNotMatch(all, /style="/, 'no inline style in the panel'); assert.doesNotMatch(all, /\d+px|white-space:\s*nowrap|min-width/);
  const ui = livon('livon-account-ui.js');
  assert.match(ui, /display:flex;gap:\.5rem;flex-wrap:wrap/, 'dialog actions wrap on a narrow screen');
  assert.doesNotMatch(ui, /width:\s*\d+px|position:\s*fixed/);
  assert.equal((src('livon/index.html').match(/data-livon-account-panel/g) || []).length, 0, 'no new region in the page shell');
  assert.match(livon('life-now-page.js'), /<div data-livon-account-panel hidden><\/div>/, 'one place: My Life › 설정');
});

test('AS-30 logout preserves intended local behavior: device data back, account copy kept for offline (or removed on request), server data untouched', async () => {
  const srv = server(); const D = device(srv, { local: { [ML]: { v: 2, todos: [{ id: 'todo_dev', title: '기기 것', createdAt: T0, updatedAt: T0 }] } } });
  await D.signIn(SUB_A); await D.S.declineImport(); D.addTask('계정 것'); await D.S.syncNow();
  D.net.down = true; D.addTask('로그아웃 직전 오프라인 변경');
  await D.signOut();
  D.net.down = false;
  assert.deepEqual(D.titles(), ['기기 것']); assert.equal(D.S.activeProfile().kind, 'anon');
  const vaults = [...D.ls._m.keys()].filter(k => k.startsWith('livon.vault.acct.'));
  assert.equal(vaults.length, 1); assert.ok(D.ls.getItem(vaults[0]).includes('로그아웃 직전 오프라인 변경'), 'the unsent change waits in the account copy, not lost');
  D.addTask('로그아웃 뒤 기기 것'); assert.equal(D.S.queue().LOCAL, 2);
  const st = await D.signIn(SUB_A);
  assert.equal(st.status, 'synced'); assert.deepEqual(D.titles(), ['계정 것', '로그아웃 직전 오프라인 변경']);
  assert.ok((await serverRecords(srv, SUB_A)).some(r => r.data && r.data.title === '로그아웃 직전 오프라인 변경'), 'uploaded after signing in again');
  assert.ok(!(await serverRecords(srv, SUB_A)).some(r => r.data && /기기 것/.test(r.data.title)), 'this device\'s own items never joined the account');
  await D.signOut({ forgetAccountOnDevice: true });
  assert.equal([...D.ls._m.keys()].filter(k => k.startsWith('livon.vault.acct.') || k.startsWith('livon.sync.v1:')).length, 0);
  assert.deepEqual(D.titles(), ['기기 것', '로그아웃 뒤 기기 것']);
  assert.equal((await serverRecords(srv, SUB_A)).filter(r => !r.deletedAt).length, 2, 'the account on the server is unchanged by logout');
});

/* ═════════════ what is really switched on ═════════════ */
test('AS-31 production honesty: account sync is not launched — the switch is set nowhere, the Newon+ config is empty, the server is off by default', async () => {
  const shipped = [src('livon/index.html'), ...['data/livon-sync.js', 'data/livon-auth-bridge.js', 'livon-account-ui.js', 'data/livon-user-data.js', 'life-now-page.js'].map(livon), src('scripts/publish-site.mjs'), src('.github/workflows/github-pages.yml')].join('\n');
  assert.doesNotMatch(shipped, /LIVON_ACCOUNT_SYNC_PUBLIC\s*=\s*(true|!0|1)/, 'the launch switch is never set');
  assert.match(livon('data/livon-auth-bridge.js'), /function syncPublic\(\) \{ return root\.LIVON_ACCOUNT_SYNC_PUBLIC === true; \}/);
  assert.match(livon('livon-account-ui.js'), /if \(!syncPublic\(\)\) return "";/);
  for (const env of [{}, { LIVON_USERDATA_ENABLED: 'true' }, { LIVON_USERDATA_ENABLED: 'true', LIVON_DATABASE_URL: 'postgres://db.invalid/x' }]) {
    const res = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; } };
    await createHealthHandler({ env })({ method: 'GET', url: '/api/health', headers: { host: 'api.newon.app' } }, res);
    assert.equal(JSON.parse(res.body).userdata.ready, false, 'not ready without every part configured: ' + Object.keys(env).length);
  }
  const off = await call(createUserDataHandler({ env: {}, store: createMemoryStore(), log() {} }), { headers: { authorization: 'Bearer ' + jwt(claims(SUB_A)) } });
  assert.equal(off.status, 503); assert.equal(off.json.code, 'SYNC_NOT_AVAILABLE');
  const doc = src('docs/livon/LIVON_ACCOUNT_SYNC_V1.md');
  for (const h of ['현재 상태', '데이터 분류', '동기화 상태', '재시도', '충돌', '삭제', '첫 로그인', '개인정보', '화면', '켜는 데 필요한 것', '알려진 한계']) assert.match(doc, new RegExp('^## .*' + h, 'm'), 'doc section ' + h);
  assert.doesNotMatch(doc, /LIVE VERIFIED|운영 중입니다/);
});

test('AS-32 cache keys: the changed engine and panel are requested under a new version; load order unchanged', () => {
  const html = src('livon/index.html'), i = n => html.indexOf(n);
  assert.match(html, /\/livon\/data\/livon-sync\.js\?v=20261004as1"/); assert.match(html, /\/livon\/livon-account-ui\.js\?v=20261004as1"/);
  assert.equal((html.match(/\?v=20261004as1/g) || []).length, 2);
  assert.ok(i('/livon/data/livon-user-data.js') < i('/livon/data/livon-sync.js') && i('/livon/data/livon-sync.js') < i('/livon/data/livon-auth-bridge.js') && i('/livon/data/livon-auth-bridge.js') < i('/livon/livon-account-ui.js'));
});
