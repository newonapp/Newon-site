// ONGIL Family Connection V2 — cross-device family on Newon+ accounts: server/ongil/family (route + store), the migration,
// api/ongil/family.mjs, the client (family-remote.js) and the account card (family-remote-view.js).
// What is real here: the production handler, the production verifier (RS256 through the real certificate store with a
// throwaway key), the V1 permission engine, the production SQL (on a REAL PostgreSQL server when LIVON_TEST_PG is set).
// What is NOT here: a Firebase project, a production database, Upstash. Nothing in this file is LIVE: two accounts are two
// signed test tokens against one handler — CODE READY, never "cross-device live".
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createFamilyHandler, familyStatus, invitationHash, FAMILY_RATE, OPS, BODY_MAX, ACTION_LABELS } from '../../server/ongil/family/http.mjs';
import { createFamilyMemoryStore, createFamilyPostgresStore, ACTIVITY_KEEP } from '../../server/ongil/family/store.mjs';
import { createMemoryStore, createPostgresStore } from '../../server/livon/userdata/store.mjs';
import { LimitError, limitBuckets } from '../../server/livon/ratelimit.mjs';
import { createFamilyRemote, snapshotItems, FAMILY_REMOTE_MODES, FAMILY_API_PATH } from '../../ongil-start/js/family-remote.js';
import { createSnapshotReaders, createFamilyService } from '../../ongil-start/js/family-service.js';
import { createLocalFamilyRepository, selectFamilyRepository, FAMILY_REMOTE_CONTRACT } from '../../ongil-start/js/family-repository.js';
import { createStorage, createMemoryBackend } from '../../ongil-start/js/storage.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { dateKey } from '../../ongil-start/js/dates.js';
import { SHARING_CATEGORIES, INVITE_ALPHABET } from '../../ongil-start/js/family-domain.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ───────── signed test tokens (throwaway key, served as the certificate Google would publish) ───────── */
const PROJECT = 'newon-plus-test';
const ISS = 'https://securetoken.google.com/' + PROJECT;
const KID = 'kid-family';
function makeKey() {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'ongil-cert-'));
  try {
    const r = spawnSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', path.join(dir, 'k.pem'), '-out', path.join(dir, 'c.pem'), '-subj', '/CN=ongil-test', '-days', '1'], { encoding: 'utf8' });
    if (r.status === 0) return { privateKey: crypto.createPrivateKey(fs.readFileSync(path.join(dir, 'k.pem'))), pem: fs.readFileSync(path.join(dir, 'c.pem'), 'utf8') };
  } catch { /* openssl missing → SPKI */ } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  const kp = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  return { privateKey: kp.privateKey, pem: kp.publicKey.export({ type: 'spki', format: 'pem' }) };
}
const KEY = makeKey();
const OTHER_KEY = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
function jwt(claims, key = KEY.privateKey) {
  const input = enc({ alg: 'RS256', kid: KID, typ: 'JWT' }) + '.' + enc(claims);
  return input + '.' + crypto.sign('RSA-SHA256', Buffer.from(input), key).toString('base64url');
}
function claims(sub, over = {}) {
  const t = Math.floor(Date.now() / 1000);
  return { iss: ISS, aud: PROJECT, sub, iat: t - 10, auth_time: t - 20, exp: t + 3600, firebase: { sign_in_provider: 'google.com' }, ...over };
}
const tokenFor = (sub, over, key) => jwt(claims(sub, over), key);
const certFetcher = async () => ({ ok: true, headers: { get: () => 'public, max-age=3600' }, json: async () => ({ [KID]: KEY.pem }) });

const BASE_ENV = Object.freeze({ ONGIL_FAMILY_REMOTE_ENABLED: 'true', LIVON_DATABASE_URL: 'postgres://db.invalid/ongil', NEWON_AUTH_VERIFY_ENABLED: 'true', NEWON_PLUS_FIREBASE_PROJECT_ID: PROJECT });
function server({ env = {}, store = createFamilyMemoryStore(), accounts = createMemoryStore(), limiter = async () => {}, clock } = {}) {
  const c = clock || { t: Date.now() };
  const logs = [];
  const fullEnv = { ...BASE_ENV, ...env };
  const handler = createFamilyHandler({ env: fullEnv, store, accounts, fetcher: certFetcher, limiter, now: () => c.t, log: (e) => logs.push(e) });
  return { handler, store, accounts, logs, clock: c, env: fullEnv };
}
async function call(handler, { method = 'GET', url = '/api/ongil/family', headers = {}, body, rawHeaders } = {}) {
  const res = { statusCode: 200, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } };
  const h = {}; for (const [k, v] of Object.entries(headers)) h[k.toLowerCase()] = v;
  const req = { method, url, headers: { host: 'api.newon.app', ...h }, rawHeaders, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body) };
  await handler(req, res);
  let json = null; try { json = JSON.parse(res.body); } catch { /* 204 */ }
  return { status: res.statusCode, headers: res.headers, json, raw: res.body };
}
const auth = (sub) => ({ authorization: 'Bearer ' + tokenFor(sub) });
const op = (srv, sub, name, payload) => call(srv.handler, { method: 'POST', headers: { ...auth(sub), 'content-type': 'application/json' }, body: payload === undefined ? { op: name } : { op: name, payload } });
const overview = (srv, sub) => call(srv.handler, { headers: auth(sub) });
const A = 'ownerAlpha01', B = 'memberBravo02', C = 'strangerCharlie03', D = 'memberDelta04';
const INVITE = Object.freeze({ displayName: '큰딸', relationship: 'child', role: 'FAMILY', expiry: '7d' });

/* A invites, B accepts: one membership with nothing shared */
async function connect(srv, owner = A, member = B, invite = INVITE, ownerLabel = '엄마') {
  const made = await op(srv, owner, 'createInvitation', invite);
  assert.equal(made.status, 200, JSON.stringify(made.json));
  const got = await op(srv, member, 'acceptInvitation', { code: made.json.code, ownerLabel });
  assert.equal(got.status, 200, JSON.stringify(got.json));
  return { code: made.json.code, invitation: made.json.invitation, memberId: got.json.membership.memberId };
}
const share = (srv, memberId, levels, consents) => op(srv, A, 'setPermissions', consents ? { memberId, levels, consents } : { memberId, levels });
const LINES = Object.freeze({
  CHECK_IN: { SUMMARY: ['오늘 안부를 남겼어요.'], DETAIL: ['오늘 안부를 남겼어요.', '오늘 고른 기분: 좋아요'] },
  SCHEDULE: { SUMMARY: ['오늘 일정 2개'], DETAIL: ['10:00 복지관 수업', '15:00 산책'] },
  MEDICATION: { SUMMARY: ['오늘 먹을 약 3개 가운데 2개를 먹었다고 표시했어요.'] },
  HEALTH: { SUMMARY: ['오늘 몸 상태를 적었어요.'] },
  SLEEP: { SUMMARY: ['어젯밤 잠을 적었어요.'], DETAIL: ['잠든 시각 오후 10:30 · 일어난 시각 오전 6:10'] },
  MEAL: { SUMMARY: ['오늘 식사를 적었어요.'], DETAIL: ['오늘 식사 3끼를 적었어요.'] },
});
const item = (category, level) => ({ category, level, lines: LINES[category][level] });

/* ═════════════ 1. switches · fail closed · identity ═════════════ */
test('FV2-01 status: booleans only, answered before any switch, no setting value ever returned', async () => {
  assert.deepEqual(familyStatus({}), { enabled: false, database: false, auth: false, protection: true, ready: false });
  assert.deepEqual(familyStatus({ VERCEL: '1' }), { enabled: false, database: false, auth: false, protection: false, ready: false }, 'production without Upstash + secret is not protected');
  const off = await call(createFamilyHandler({ env: {}, log: () => {} }), { url: '/api/ongil/family?op=status' });
  assert.equal(off.status, 200);
  assert.deepEqual(off.json, { ok: true, enabled: false, database: false, auth: false, protection: true, ready: false });
  const srv = server();
  const on = await call(srv.handler, { url: '/api/ongil/family?op=status' });
  assert.deepEqual(on.json, { ok: true, enabled: true, database: true, auth: true, protection: true, ready: true });
  assert.doesNotMatch(on.raw, /postgres|db\.invalid|newon-plus-test|securetoken/);
  assert.equal(on.headers['cache-control'], 'no-store');
});

test('FV2-02 fail closed in order: flag → database → verifier, before any token or store work', async () => {
  let r = await call(createFamilyHandler({ env: {}, log: () => {} }), { headers: auth(A) });
  assert.deepEqual([r.status, r.json.code], [503, 'FAMILY_NOT_AVAILABLE']);
  r = await call(createFamilyHandler({ env: { ONGIL_FAMILY_REMOTE_ENABLED: 'true' }, log: () => {} }), { headers: auth(A) });
  assert.deepEqual([r.status, r.json.code], [503, 'SERVER_NOT_CONFIGURED'], 'no LIVON_DATABASE_URL → no fake store');
  r = await call(createFamilyHandler({ env: { ONGIL_FAMILY_REMOTE_ENABLED: 'true', LIVON_DATABASE_URL: 'postgres://db.invalid/x' }, store: createFamilyMemoryStore(), accounts: createMemoryStore(), log: () => {} }), { headers: auth(A) });
  assert.deepEqual([r.status, r.json.code], [503, 'AUTH_NOT_CONFIGURED']);
  r = await call(createFamilyHandler({ env: BASE_ENV, store: null, accounts: createMemoryStore(), log: () => {} }), { headers: auth(A) });
  assert.deepEqual([r.status, r.json.code], [503, 'SERVER_NOT_CONFIGURED']);
  for (const flag of ['1', 'TRUE', 'yes', '']) assert.equal(familyStatus({ ...BASE_ENV, ONGIL_FAMILY_REMOTE_ENABLED: flag }).enabled, false, flag);
});

test('FV2-03 tokens: none → 401, token in the URL → refused, two Authorization headers → refused, forged → 401', async () => {
  const srv = server();
  let r = await call(srv.handler, {});
  assert.deepEqual([r.status, r.json.code], [401, 'NO_TOKEN']);
  assert.equal(r.headers['www-authenticate'], 'Bearer');
  r = await call(srv.handler, { url: '/api/ongil/family?token=' + tokenFor(A), headers: auth(A) });
  assert.equal(r.status === 400 || r.status === 401, true);
  assert.equal(['TOKEN_IN_URL', 'BAD_REQUEST'].includes(r.json.code), true, r.json.code);
  r = await call(srv.handler, { headers: auth(A), rawHeaders: ['Authorization', 'Bearer x', 'authorization', 'Bearer y'] });
  assert.deepEqual([r.status, r.json.code], [400, 'MALFORMED_TOKEN']);
  r = await call(srv.handler, { headers: { authorization: 'Bearer ' + tokenFor(A, {}, OTHER_KEY) } });
  assert.equal(r.status, 401);
  r = await call(srv.handler, { headers: { authorization: 'Bearer ' + tokenFor(A, { exp: Math.floor(Date.now() / 1000) - 10 }) } });
  assert.equal(r.status, 401);
});

test('FV2-04 issuers: another Firebase project and admin identities are refused; an account is the LIVON account row', async () => {
  const srv = server();
  const r = await call(srv.handler, { headers: { authorization: 'Bearer ' + jwt({ ...claims(A), iss: 'https://securetoken.google.com/newon-hq', aud: 'newon-hq' }) } });
  assert.equal(r.status === 401 || r.status === 403, true);
  const ok = await overview(srv, A);
  assert.equal(ok.status, 200);
  const acct = await srv.accounts.findAccount({ issuer: ISS, subject: A });
  assert.match(acct.accountId, /^acct_[0-9a-f]{32}$/, 'the same Newon+ account table as LIVON (one person across products)');
});

test('FV2-05 CORS: www.newon.app may send Authorization, other origins are refused, never a wildcard', async () => {
  const srv = server({ env: { VERCEL: '1', LIVON_RATE_LIMIT_SECRET: 's', UPSTASH_REDIS_REST_URL: 'https://x.upstash.io', UPSTASH_REDIS_REST_TOKEN: 't' } });
  const pre = await call(srv.handler, { method: 'OPTIONS', headers: { origin: 'https://www.newon.app', 'access-control-request-method': 'POST', 'access-control-request-headers': 'authorization,content-type' } });
  assert.equal(pre.status, 204);
  assert.equal(pre.headers['access-control-allow-origin'], 'https://www.newon.app');
  assert.match(pre.headers['access-control-allow-headers'], /Authorization/);
  assert.match(pre.headers['access-control-allow-methods'], /POST/);
  const evil = await call(srv.handler, { method: 'OPTIONS', headers: { origin: 'https://evil.example', 'access-control-request-method': 'POST' } });
  assert.deepEqual([evil.status, evil.json.code], [403, 'ORIGIN_NOT_ALLOWED']);
  assert.notEqual(pre.headers['access-control-allow-origin'], '*');
  const dev = await call(srv.handler, { method: 'OPTIONS', headers: { origin: 'http://localhost:8080', 'access-control-request-method': 'POST' } });
  assert.equal(dev.status, 403, 'production refuses local development origins');
});

test('FV2-06 production without the shared limiter: 503 PROTECTION_NOT_CONFIGURED (fails closed, no in-memory fallback)', async () => {
  const srv = server({ env: { VERCEL: '1' }, limiter: limitBuckets });
  assert.equal(familyStatus(srv.env).ready, false);
  const r = await overview(srv, A);
  assert.deepEqual([r.status, r.json.code], [503, 'PROTECTION_NOT_CONFIGURED']);
});

/* ═════════════ 2. invitations ═════════════ */
test('FV2-07 create: the code is in that one answer; the store keeps only its SHA-256 hash; overview and logs never carry it', async () => {
  const srv = server();
  const made = await op(srv, A, 'createInvitation', INVITE);
  assert.equal(made.status, 200);
  const { code, formattedCode, invitation } = made.json;
  assert.equal(code.length, 20);
  assert.equal(formattedCode.replace(/-/g, ''), code);
  const stored = [...srv.store._debug.invitations.values()][0];
  assert.equal(stored.token_hash, invitationHash(code));
  assert.equal(JSON.stringify(stored).includes(code), false, 'no plaintext code in the store');
  const o = await overview(srv, A);
  assert.equal(o.raw.includes(code), false);
  assert.equal(o.json.owner.invitations[0].id, invitation.id);
  assert.equal(o.json.owner.invitations[0].status, 'PENDING');
  assert.equal(JSON.stringify(srv.logs).includes(code), false);
  assert.equal(made.headers['cache-control'], 'no-store');
});

test('FV2-08 code and id shapes: 20 characters from the unambiguous alphabet (100 bits), ids random, hash 64 hex', async () => {
  const srv = server();
  const codes = new Set();
  for (let i = 0; i < 5; i++) {
    const made = await op(srv, A, 'createInvitation', INVITE);
    codes.add(made.json.code);
    assert.equal([...made.json.code].every((ch) => INVITE_ALPHABET.includes(ch)), true);
    assert.match(made.json.invitation.id, /^fi_[a-z0-9]{16}$/);
  }
  assert.equal(codes.size, 5);
  assert.match(invitationHash('ABCDEFGHJKLMNPQRSTUV'), /^[0-9a-f]{64}$/);
  assert.notEqual(invitationHash('ABCDEFGHJKLMNPQRSTUV'), crypto.createHash('sha256').update('ABCDEFGHJKLMNPQRSTUV').digest('hex'), 'domain-separated digest');
});

test('FV2-09 inspect: an unknown code gets one generic answer; a malformed one is refused; a code is never read from a URL', async () => {
  const srv = server();
  let r = await op(srv, B, 'inspectInvitation', { code: '23456789ABCDEFGHJKLM' });
  assert.deepEqual([r.status, r.json.code], [404, 'INVITATION_NOT_FOUND']);
  r = await op(srv, B, 'inspectInvitation', { code: 'nope' });
  assert.deepEqual([r.status, r.json.code], [400, 'INVALID_CODE']);
  r = await call(srv.handler, { url: '/api/ongil/family?code=23456789ABCDEFGHJKLM', headers: auth(B) });
  assert.deepEqual([r.status, r.json.code], [400, 'BAD_REQUEST']);
  r = await call(srv.handler, { method: 'POST', url: '/api/ongil/family?op=inspectInvitation', headers: { ...auth(B), 'content-type': 'application/json' }, body: { op: 'inspectInvitation', payload: { code: '23456789ABCDEFGHJKLM' } } });
  assert.deepEqual([r.status, r.json.code], [400, 'BAD_REQUEST']);
});

test('FV2-10 inspect a real code: what a connection means, nothing shared, no account or group id of the inviter', async () => {
  const srv = server();
  const made = await op(srv, A, 'createInvitation', INVITE);
  const r = await op(srv, B, 'inspectInvitation', { code: made.json.formattedCode.toLowerCase() });
  assert.equal(r.status, 200);
  assert.equal(r.json.invitation.status, 'PENDING');
  assert.equal(r.json.invitation.relationship, 'child');
  assert.equal(r.json.sharesNothingYet, true);
  assert.doesNotMatch(r.raw, /acct_|newon_|fg_|token_hash|[0-9a-f]{64}/);
});

test('FV2-11 accept: account B joins A\'s family on its own token; nothing is shared until A chooses (default deny)', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  assert.match(memberId, /^fm_[a-z0-9]{16}$/);
  const mine = await overview(srv, B);
  assert.deepEqual(mine.json.memberships.map((m) => [m.memberId, m.ownerLabel]), [[memberId, '엄마']]);
  const owner = await overview(srv, A);
  assert.equal(owner.json.owner.members.length, 1);
  assert.equal(Object.values(owner.json.owner.members[0].levels).every((l) => l === 'NONE'), true);
  const view = await op(srv, B, 'viewShared', { memberId });
  assert.deepEqual([view.json.shared.items, view.json.shared.requests, view.json.shared.empty], [[], [], true]);
});

test('FV2-12 self-invitation: the account that made a code cannot accept, decline or inspect it', async () => {
  const srv = server();
  const made = await op(srv, A, 'createInvitation', INVITE);
  for (const name of ['inspectInvitation', 'declineInvitation']) {
    const r = await op(srv, A, name, { code: made.json.code });
    assert.deepEqual([r.status, r.json.code], [409, 'SELF_INVITATION'], name);
  }
  const r = await op(srv, A, 'acceptInvitation', { code: made.json.code, ownerLabel: '나' });
  assert.deepEqual([r.status, r.json.code], [409, 'SELF_INVITATION']);
});

test('FV2-13 one use: a used code connects nobody else', async () => {
  const srv = server();
  const { code } = await connect(srv);
  const r = await op(srv, C, 'acceptInvitation', { code, ownerLabel: '이웃' });
  assert.deepEqual([r.status, r.json.code], [409, 'INVITATION_USED']);
  assert.equal((await overview(srv, C)).json.memberships.length, 0);
});

test('FV2-14 expiry: a code past its time is EXPIRED for inspect and accept, and shows EXPIRED to its owner', async () => {
  const srv = server();
  const made = await op(srv, A, 'createInvitation', { ...INVITE, expiry: '1d' });
  srv.clock.t += 24 * 3600e3 + 1;
  /* tokens are checked against the same server clock, so they are signed for the later moment */
  const at = (sub) => { const t = Math.floor(srv.clock.t / 1000); return { authorization: 'Bearer ' + tokenFor(sub, { iat: t - 10, auth_time: t - 20, exp: t + 3600 }) }; };
  const later = (sub, name, payload) => call(srv.handler, { method: 'POST', headers: { ...at(sub), 'content-type': 'application/json' }, body: { op: name, payload } });
  const r = await later(B, 'acceptInvitation', { code: made.json.code, ownerLabel: '엄마' });
  assert.deepEqual([r.status, r.json.code], [409, 'INVITATION_EXPIRED']);
  assert.equal((await later(B, 'inspectInvitation', { code: made.json.code })).json.code, 'INVITATION_EXPIRED');
  assert.equal((await call(srv.handler, { headers: at(A) })).json.owner.invitations[0].status, 'EXPIRED');
});

test('FV2-15 revoke an invitation: the code stops working; nobody else can revoke it', async () => {
  const srv = server();
  const made = await op(srv, A, 'createInvitation', INVITE);
  let r = await op(srv, C, 'revokeInvitation', { invitationId: made.json.invitation.id });
  assert.deepEqual([r.status, r.json.code], [404, 'INVITATION_NOT_FOUND'], 'another account gets "not found", not "forbidden"');
  r = await op(srv, A, 'revokeInvitation', { invitationId: made.json.invitation.id });
  assert.equal(r.status, 200);
  r = await op(srv, B, 'acceptInvitation', { code: made.json.code, ownerLabel: '엄마' });
  assert.deepEqual([r.status, r.json.code], [409, 'INVITATION_REVOKED']);
  r = await op(srv, A, 'revokeInvitation', { invitationId: made.json.invitation.id });
  assert.equal(r.status, 404, 'a revoked invitation cannot be revoked again');
});

test('FV2-16 decline: the invitee says no; the code is finished', async () => {
  const srv = server();
  const made = await op(srv, A, 'createInvitation', INVITE);
  assert.equal((await op(srv, B, 'declineInvitation', { code: made.json.code })).status, 200);
  const r = await op(srv, D, 'acceptInvitation', { code: made.json.code, ownerLabel: '엄마' });
  assert.deepEqual([r.status, r.json.code], [409, 'INVITATION_DECLINED']);
  assert.equal((await overview(srv, A)).json.owner.invitations[0].status, 'DECLINED');
});

test('FV2-17 limits: five pending invitations at a time', async () => {
  const srv = server();
  for (let i = 0; i < 5; i++) assert.equal((await op(srv, A, 'createInvitation', INVITE)).status, 200);
  const r = await op(srv, A, 'createInvitation', INVITE);
  assert.deepEqual([r.status, r.json.code], [409, 'LIMIT_INVITATIONS']);
});

test('FV2-18 limits: ten connected members; the eleventh code cannot be used', async () => {
  const srv = server();
  for (let i = 0; i < 10; i++) await connect(srv, A, `member${String(i).padStart(4, '0')}x`);
  let r = await op(srv, A, 'createInvitation', INVITE);
  assert.deepEqual([r.status, r.json.code], [409, 'LIMIT_MEMBERS']);
  /* a code made before the tenth joined still cannot push the group past ten */
  const srv2 = server();
  const codes = [];
  for (let i = 0; i < 5; i++) codes.push((await op(srv2, A, 'createInvitation', INVITE)).json.code);
  for (let i = 0; i < 4; i++) await op(srv2, 'early' + i + 'member', 'acceptInvitation', { code: codes[i], ownerLabel: '엄마' });
  for (let i = 0; i < 6; i++) await connect(srv2, A, `later${i}member`);
  r = await op(srv2, 'lastMember01', 'acceptInvitation', { code: codes[4], ownerLabel: '엄마' });
  assert.deepEqual([r.status, r.json.code], [409, 'LIMIT_MEMBERS']);
});

test('FV2-19 one connection per family: a second code from the same family is ALREADY_CONNECTED', async () => {
  const srv = server();
  await connect(srv);
  const again = await op(srv, A, 'createInvitation', INVITE);
  const r = await op(srv, B, 'acceptInvitation', { code: again.json.code, ownerLabel: '엄마' });
  assert.deepEqual([r.status, r.json.code], [409, 'ALREADY_CONNECTED']);
});

test('FV2-20 identity comes from the token only: a payload naming a user, owner, account or group is refused whole', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  for (const key of ['userId', 'ownerId', 'accountId', 'groupId', 'ownerUserId', 'memberUserId']) {
    const r = await op(srv, A, 'setPermissions', { memberId, levels: { CHECK_IN: 'SUMMARY' }, [key]: 'acct_' + 'a'.repeat(32) });
    assert.deepEqual([r.status, r.json.code], [400, 'BAD_REQUEST'], key);
    const v = await op(srv, B, 'viewShared', { memberId, [key]: 'x' });
    assert.equal(v.status, 400, key);
  }
  const r = await call(srv.handler, { method: 'POST', headers: { ...auth(A), 'content-type': 'application/json' }, body: { op: 'activity', payload: {}, accountId: 'acct_x' } });
  assert.equal(r.status, 400);
});

/* ═════════════ 3. permissions · consent · server-side filtering ═════════════ */
test('FV2-21 setPermissions: per member and category; unnamed categories keep their level', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  let r = await share(srv, memberId, { CHECK_IN: 'SUMMARY', SCHEDULE: 'DETAIL' });
  assert.equal(r.status, 200);
  assert.equal(r.json.changed, 2);
  assert.deepEqual([r.json.levels.CHECK_IN, r.json.levels.SCHEDULE, r.json.levels.MEDICATION], ['SUMMARY', 'DETAIL', 'NONE']);
  r = await share(srv, memberId, { SLEEP: 'SUMMARY' });
  assert.deepEqual([r.json.levels.CHECK_IN, r.json.levels.SCHEDULE, r.json.levels.SLEEP], ['SUMMARY', 'DETAIL', 'SUMMARY']);
  r = await share(srv, memberId, { SLEEP: 'SUMMARY' });
  assert.equal(r.json.changed, 0, 'the same level again changes nothing');
});

test('FV2-22 sensitive categories need consent in the request; one refusal changes nothing at all', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  const r = await share(srv, memberId, { CHECK_IN: 'SUMMARY', MEDICATION: 'SUMMARY', HEALTH: 'SUMMARY' });
  assert.deepEqual([r.status, r.json.code], [409, 'CONSENT_REQUIRED']);
  assert.deepEqual(r.json.categories.sort(), ['HEALTH', 'MEDICATION']);
  const o = await overview(srv, A);
  assert.equal(o.json.owner.members[0].levels.CHECK_IN, 'NONE', 'CHECK_IN was not applied either');
  assert.equal(srv.store._debug.consents.size, 0);
});

test('FV2-23 consent given → shared; levels a category does not offer are refused', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  let r = await share(srv, memberId, { MEDICATION: 'SUMMARY' }, ['MEDICATION']);
  assert.equal(r.status, 200);
  assert.equal(r.json.levels.MEDICATION, 'SUMMARY');
  r = await share(srv, memberId, { MEDICATION: 'DETAIL' }, ['MEDICATION']);
  assert.deepEqual([r.status, r.json.code], [400, 'INVALID_LEVEL']);
  r = await share(srv, memberId, { HELP_REQUEST: 'SUMMARY' });
  assert.deepEqual([r.status, r.json.code], [400, 'INVALID_LEVEL']);
  r = await share(srv, memberId, { JOURNAL: 'SUMMARY' });
  assert.deepEqual([r.status, r.json.code], [400, 'INVALID_CATEGORY']);
  r = await share(srv, memberId, { CHECK_IN: 'SUMMARY' }, ['CHECK_IN']);
  assert.equal(r.status, 400, 'consent is only for sensitive categories');
});

test('FV2-24 turning a sensitive category off withdraws its consent; turning it on again needs a new one', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { HEALTH: 'SUMMARY' }, ['HEALTH']);
  assert.equal((await share(srv, memberId, { HEALTH: 'NONE' })).json.levels.HEALTH, 'NONE');
  assert.equal([...srv.store._debug.consents.values()][0].status, 'WITHDRAWN');
  const r = await share(srv, memberId, { HEALTH: 'SUMMARY' });
  assert.deepEqual([r.status, r.json.code], [409, 'CONSENT_REQUIRED']);
  const acts = (await op(srv, A, 'activity')).json.activity.map((a) => a.action);
  assert.ok(acts.includes('CONSENT_GIVEN') && acts.includes('CONSENT_WITHDRAWN'));
});

test('FV2-25 IDOR: no account can set sharing for a member outside its own family', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  const other = await connect(srv, C, D, INVITE, '아빠');
  let r = await share(srv, other.memberId, { CHECK_IN: 'DETAIL' });
  assert.deepEqual([r.status, r.json.code], [404, 'MEMBER_NOT_CONNECTED'], 'A cannot touch C\'s member');
  r = await op(srv, B, 'setPermissions', { memberId, levels: { CHECK_IN: 'DETAIL' } });
  assert.deepEqual([r.status, r.json.code], [404, 'NO_FAMILY'], 'a member never manages the owner\'s sharing');
  for (const name of ['stopSharing', 'disconnect']) {
    r = await op(srv, A, name, { memberId: other.memberId });
    assert.equal(r.status, 404, name);
  }
  r = await op(srv, A, 'publishSnapshot', { memberId: other.memberId, items: [] });
  assert.equal(r.status, 404);
  assert.equal((await overview(srv, D)).json.memberships.length, 1, 'C\'s member untouched');
});

test('FV2-26 publish: the server keeps an item only at the exact level the member may see now; HELP_REQUEST is never a snapshot', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { CHECK_IN: 'SUMMARY', SCHEDULE: 'DETAIL', HELP_REQUEST: 'DETAIL' });
  const r = await op(srv, A, 'publishSnapshot', { memberId, items: [item('CHECK_IN', 'DETAIL'), item('SCHEDULE', 'DETAIL'), item('MEDICATION', 'SUMMARY'), item('SLEEP', 'SUMMARY'), { category: 'HELP_REQUEST', level: 'DETAIL', lines: ['x'] }] });
  assert.equal(r.status, 200);
  assert.deepEqual([r.json.published, r.json.dropped], [1, 4], 'CHECK_IN at DETAIL (only SUMMARY allowed), MEDICATION, SLEEP and HELP_REQUEST dropped');
  const stored = [...srv.store._debug.snaps.values()];
  assert.deepEqual(stored.map((s) => s.category), ['SCHEDULE']);
  const dup = await op(srv, A, 'publishSnapshot', { memberId, items: [item('SCHEDULE', 'DETAIL'), item('SCHEDULE', 'DETAIL')] });
  assert.equal(dup.status, 400);
  const big = await op(srv, A, 'publishSnapshot', { memberId, items: [{ category: 'SCHEDULE', level: 'DETAIL', lines: Array(11).fill('x') }] });
  assert.equal(big.status, 400);
});

test('FV2-27 viewShared: only what is allowed; a forbidden category is absent from the answer (not hidden, not counted)', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { CHECK_IN: 'DETAIL', MEAL: 'SUMMARY' });
  await op(srv, A, 'publishSnapshot', { memberId, items: [item('CHECK_IN', 'DETAIL'), item('MEAL', 'SUMMARY'), item('SCHEDULE', 'DETAIL')] });
  const v = await op(srv, B, 'viewShared', { memberId });
  assert.deepEqual(v.json.shared.items.map((i) => [i.category, i.level]), [['CHECK_IN', 'DETAIL'], ['MEAL', 'SUMMARY']]);
  assert.doesNotMatch(v.raw, /SCHEDULE|복지관|일정|MEDICATION|HEALTH|EMERGENCY|levels/);
  assert.equal(v.json.shared.ownerLabel, '엄마');
});

test('FV2-28 lowering a level hides the richer lines at once, before the owner publishes again', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { SLEEP: 'DETAIL' });
  await op(srv, A, 'publishSnapshot', { memberId, items: [item('SLEEP', 'DETAIL')] });
  assert.equal((await op(srv, B, 'viewShared', { memberId })).json.shared.items.length, 1);
  await share(srv, memberId, { SLEEP: 'SUMMARY' });
  const v = await op(srv, B, 'viewShared', { memberId });
  assert.equal(v.json.shared.items.length, 0);
  assert.doesNotMatch(v.raw, /잠든 시각/);
});

test('FV2-29 stop sharing (one member): nothing is visible any more; the connection stays', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { CHECK_IN: 'SUMMARY', MEDICATION: 'SUMMARY' }, ['MEDICATION']);
  await op(srv, A, 'publishSnapshot', { memberId, items: [item('CHECK_IN', 'SUMMARY'), item('MEDICATION', 'SUMMARY')] });
  assert.equal((await op(srv, A, 'stopSharing', { memberId })).status, 200);
  const v = await op(srv, B, 'viewShared', { memberId });
  assert.equal(v.json.shared.empty, true);
  assert.equal((await overview(srv, B)).json.memberships.length, 1);
  assert.equal(srv.store._debug.snaps.size, 0, 'snapshots deleted, not merely hidden');
  assert.equal([...srv.store._debug.consents.values()].every((c) => c.status === 'WITHDRAWN'), true);
});

test('FV2-30 stop all sharing: every member at once; connections stay', async () => {
  const srv = server();
  const one = await connect(srv);
  const two = await connect(srv, A, D, { ...INVITE, displayName: '작은딸' });
  await share(srv, one.memberId, { CHECK_IN: 'SUMMARY' });
  await share(srv, two.memberId, { MEAL: 'DETAIL' });
  assert.equal((await op(srv, A, 'stopAllSharing', {})).status, 200);
  for (const m of (await overview(srv, A)).json.owner.members) assert.equal(Object.values(m.levels).every((l) => l === 'NONE'), true);
  assert.equal((await overview(srv, A)).json.owner.members.length, 2);
  assert.equal((await op(srv, C, 'stopAllSharing', {})).json.code, 'NO_FAMILY');
});

test('FV2-31 disconnect: access ends immediately; open requests are cancelled; the member\'s view is refused', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { CHECK_IN: 'SUMMARY', HELP_REQUEST: 'DETAIL' });
  await op(srv, A, 'publishSnapshot', { memberId, items: [item('CHECK_IN', 'SUMMARY')] });
  const h = await op(srv, A, 'requestHelp', { memberId, kind: 'call', message: '저녁에 전화 부탁해요' });
  assert.equal((await op(srv, A, 'disconnect', { memberId })).status, 200);
  const v = await op(srv, B, 'viewShared', { memberId });
  assert.deepEqual([v.status, v.json.code], [403, 'ACCESS_DENIED']);
  assert.equal((await overview(srv, B)).json.memberships.length, 0);
  assert.equal((await overview(srv, A)).json.owner.requests[0].status, 'CANCELLED');
  const move = await op(srv, B, 'moveHelp', { requestId: h.json.request.id, to: 'SEEN' });
  assert.equal(move.status, 404);
  assert.equal((await op(srv, A, 'disconnect', { memberId })).status, 404, 'disconnecting twice is "not connected"');
});

test('FV2-32 leave: the member ends the connection from their own account; the owner sees MEMBER_LEFT', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { CHECK_IN: 'SUMMARY' });
  assert.equal((await op(srv, C, 'leave', { memberId })).status, 403, 'nobody else can end it');
  assert.equal((await op(srv, B, 'leave', { memberId })).status, 200);
  assert.equal((await overview(srv, A)).json.owner.members.length, 0);
  assert.equal(srv.store._debug.permissions.size, 0);
  const acts = (await op(srv, A, 'activity')).json.activity;
  assert.equal(acts[0].action, 'MEMBER_LEFT');
  assert.equal(acts[0].label, ACTION_LABELS.MEMBER_LEFT);
  /* after leaving, a new invitation can connect the same two accounts again */
  await connect(srv);
});

test('FV2-33 viewShared IDOR: another account gets the same answer as for an id that does not exist', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { CHECK_IN: 'SUMMARY' });
  const stranger = await op(srv, C, 'viewShared', { memberId });
  const missing = await op(srv, C, 'viewShared', { memberId: 'fm_' + 'z'.repeat(16) });
  assert.deepEqual([stranger.status, stranger.json], [missing.status, missing.json]);
  assert.equal(stranger.status, 403);
  const owner = await op(srv, A, 'viewShared', { memberId });
  assert.equal(owner.status, 403, 'the owner reads their own data in ONGIL, not through the member view');
});

/* ═════════════ 4. help requests across accounts ═════════════ */
test('FV2-34 a help request needs 도움 요청 shared with that member', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  const r = await op(srv, A, 'requestHelp', { memberId, kind: 'shopping' });
  assert.deepEqual([r.status, r.json.code], [409, 'SHARING_OFF']);
  assert.equal((await op(srv, B, 'requestHelp', { memberId, kind: 'shopping' })).json.code, 'NO_FAMILY');
});

test('FV2-35 help flow: A asks, B sees it on B\'s account and answers SEEN → ACCEPTED → COMPLETED; A sees each state', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { HELP_REQUEST: 'DETAIL' });
  const made = await op(srv, A, 'requestHelp', { memberId, kind: 'hospital-escort', message: '화요일 병원 같이 가 줄래요?' });
  assert.equal(made.status, 200);
  assert.equal(made.json.request.status, 'REQUESTED');
  let v = await op(srv, B, 'viewShared', { memberId });
  assert.deepEqual(v.json.shared.requests.map((r) => [r.kind, r.status]), [['hospital-escort', 'REQUESTED']]);
  for (const to of ['SEEN', 'ACCEPTED', 'COMPLETED']) {
    const r = await op(srv, B, 'moveHelp', { requestId: made.json.request.id, to });
    assert.equal(r.status, 200, to);
    assert.equal((await overview(srv, A)).json.owner.requests[0].status, to);
  }
  v = await op(srv, B, 'viewShared', { memberId });
  assert.equal(v.json.shared.requests[0].statusLabel, '끝남');
});

test('FV2-36 help transitions follow V1: a member cannot cancel, the owner cannot mark SEEN, a stranger is "not found"', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { HELP_REQUEST: 'DETAIL' });
  const id = (await op(srv, A, 'requestHelp', { memberId, kind: 'call' })).json.request.id;
  assert.deepEqual([(await op(srv, B, 'moveHelp', { requestId: id, to: 'CANCELLED' })).json.code], ['NOT_ALLOWED']);
  assert.deepEqual([(await op(srv, A, 'moveHelp', { requestId: id, to: 'SEEN' })).json.code], ['NOT_ALLOWED']);
  assert.deepEqual([(await op(srv, C, 'moveHelp', { requestId: id, to: 'SEEN' })).status], [404]);
  assert.equal((await op(srv, A, 'moveHelp', { requestId: id, to: 'CANCELLED' })).status, 200);
  assert.equal((await op(srv, B, 'moveHelp', { requestId: id, to: 'SEEN' })).json.code, 'NOT_ALLOWED');
  assert.equal((await op(srv, B, 'moveHelp', { requestId: id, to: 'BOGUS' })).json.code, 'NOT_ALLOWED');
});

test('FV2-37 help input: kinds from the V1 list, "직접 작성" needs a message, messages are plain text up to 300', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { HELP_REQUEST: 'DETAIL' });
  assert.equal((await op(srv, A, 'requestHelp', { memberId, kind: 'fly' })).json.code, 'INVALID_KIND');
  assert.equal((await op(srv, A, 'requestHelp', { memberId, kind: 'other' })).json.code, 'INVALID_MESSAGE');
  const r = await op(srv, A, 'requestHelp', { memberId, kind: 'other', message: '<b>' + '가'.repeat(400) + '\n\t' });
  assert.equal(r.status, 200);
  assert.equal(r.json.request.message.length, 300);
  assert.equal(r.json.request.message.startsWith('<b>'), true, 'kept as text; the screen renders text only');
  /* retention: finished requests beyond the newest 50 of a family are removed; the owner's list is newest first */
  for (let i = 0; i < 55; i++) {
    const id = (await op(srv, A, 'requestHelp', { memberId, kind: 'call' })).json.request.id;
    await op(srv, A, 'moveHelp', { requestId: id, to: 'CANCELLED' });
  }
  const last = await op(srv, A, 'requestHelp', { memberId, kind: 'shopping' });
  const all = [...srv.store._debug.helps.values()];
  assert.ok(all.filter((h) => h.status === 'CANCELLED').length <= 50);
  assert.equal((await overview(srv, A)).json.owner.requests[0].id, last.json.request.id);
});

test('FV2-38 help after 도움 요청 is turned off: the member no longer sees or answers it', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { HELP_REQUEST: 'DETAIL' });
  const id = (await op(srv, A, 'requestHelp', { memberId, kind: 'housework' })).json.request.id;
  await share(srv, memberId, { HELP_REQUEST: 'NONE' });
  assert.equal((await op(srv, B, 'viewShared', { memberId })).json.shared.requests.length, 0);
  assert.equal((await op(srv, B, 'moveHelp', { requestId: id, to: 'SEEN' })).status, 404);
});

/* ═════════════ 5. audit · limits · logs · failures ═════════════ */
test('FV2-39 activity: metadata only (no code, name of the account holder, message or shared line) and capped at 200', async () => {
  const srv = server();
  const { memberId, code } = await connect(srv);
  await share(srv, memberId, { CHECK_IN: 'SUMMARY', HELP_REQUEST: 'DETAIL' });
  await op(srv, A, 'publishSnapshot', { memberId, items: [item('CHECK_IN', 'SUMMARY')] });
  await op(srv, A, 'requestHelp', { memberId, kind: 'call', message: '비밀메시지XYZ' });
  const r = await op(srv, A, 'activity');
  assert.ok(r.json.activity.length >= 4);
  assert.doesNotMatch(r.raw, new RegExp(code + '|비밀메시지XYZ|오늘 안부를 남겼어요|acct_|newon_'));
  assert.equal(r.json.activity.every((a) => ACTION_LABELS[a.action] === a.label), true);
  assert.equal((await op(srv, B, 'activity')).json.activity.length, 0, 'a member reads no owner audit');
  for (let i = 0; i < ACTIVITY_KEEP + 20; i++) await share(srv, memberId, { MEAL: i % 2 ? 'SUMMARY' : 'NONE' });
  assert.ok([...srv.store._debug.activityRows].length <= ACTIVITY_KEEP);
});

test('FV2-40 rate limits: general on every signed-in call; invite, code and help scopes on their own operations', async () => {
  const calls = [];
  const srv = server({ limiter: async (o) => { calls.push(o.scope); } });
  const { memberId, code } = await connect(srv);
  await op(srv, C, 'inspectInvitation', { code });
  await share(srv, memberId, { HELP_REQUEST: 'DETAIL' });
  await op(srv, A, 'requestHelp', { memberId, kind: 'call' });
  assert.deepEqual(calls, ['ongil-family', 'ongil-family-invite', 'ongil-family', 'ongil-family-code', 'ongil-family', 'ongil-family-code', 'ongil-family', 'ongil-family', 'ongil-family-help']);
  assert.deepEqual(FAMILY_RATE.code, [[10, 600], [30, 86400]]);
  /* the status answer is not limited per account (it reads no account and no database) */
  calls.length = 0;
  await call(srv.handler, { url: '/api/ongil/family?op=status' });
  assert.deepEqual(calls, []);
});

test('FV2-41 a limit reached answers 429 with Retry-After; the real limiter counts per account outside production', async () => {
  const srv = server({ limiter: async ({ scope }) => { if (scope === 'ongil-family-code') throw new LimitError(429, 'RATE_LIMIT', 42); } });
  const r = await op(srv, B, 'inspectInvitation', { code: '23456789ABCDEFGHJKLM' });
  assert.deepEqual([r.status, r.json.code, r.headers['retry-after']], [429, 'RATE_LIMIT', '42']);
  const real = server({ limiter: limitBuckets });
  let last;
  for (let i = 0; i < 11; i++) last = await op(real, 'guesser' + Date.now() % 1000 + 'x', 'inspectInvitation', { code: '23456789ABCDEFGHJKLM' });
  /* each call above is a new account id only if the subject changes; use one subject to reach the cap */
  const sub = 'guesserOne01';
  for (let i = 0; i < 10; i++) last = await op(real, sub, 'inspectInvitation', { code: '23456789ABCDEFGHJKLM' });
  assert.equal(last.json.code, 'INVITATION_NOT_FOUND');
  last = await op(real, sub, 'inspectInvitation', { code: '23456789ABCDEFGHJKLM' });
  assert.deepEqual([last.status, last.json.code], [429, 'RATE_LIMIT'], 'the eleventh guess in ten minutes is refused');
});

test('FV2-42 request shape: size cap, JSON only, known operations only, strict top level', async () => {
  const srv = server();
  let r = await call(srv.handler, { method: 'POST', headers: { ...auth(A), 'content-type': 'application/json', 'content-length': String(BODY_MAX + 1) }, body: { op: 'activity' } });
  assert.deepEqual([r.status, r.json.code], [413, 'PAYLOAD_TOO_LARGE']);
  r = await call(srv.handler, { method: 'POST', headers: { ...auth(A), 'content-type': 'application/json' }, body: JSON.stringify({ op: 'activity', payload: { pad: 'x'.repeat(BODY_MAX) } }) });
  assert.equal(r.status, 413);
  r = await call(srv.handler, { method: 'POST', headers: { ...auth(A), 'content-type': 'text/plain' }, body: '{}' });
  assert.equal(r.status, 415);
  r = await op(srv, A, 'dropTables', {});
  assert.deepEqual([r.status, r.json.code], [400, 'UNSUPPORTED_OP']);
  r = await call(srv.handler, { method: 'POST', headers: { ...auth(A), 'content-type': 'application/json' }, body: '{not json' });
  assert.equal(r.status, 400);
  r = await call(srv.handler, { method: 'DELETE', headers: auth(A) });
  assert.equal(r.status, 405);
  assert.equal(OPS.length, 15);
});

test('FV2-43 logs: request id, route, method, op, status, code, latency — nothing else', async () => {
  const srv = server();
  const { code, memberId } = await connect(srv);
  await op(srv, B, 'inspectInvitation', { code });
  await op(srv, B, 'viewShared', { memberId });
  for (const e of srv.logs) {
    assert.deepEqual(Object.keys(e).sort(), ['code', 'method', 'ms', 'op', 'rid', 'route', 'status']);
    assert.equal(e.route, 'ongil-family');
  }
  const all = JSON.stringify(srv.logs);
  assert.doesNotMatch(all, new RegExp(code + '|Bearer|eyJ|큰딸|엄마|acct_|' + A + '|' + B));
});

test('FV2-44 store failures: 503 without any database text; a unique-index race is 409 CONFLICT', async () => {
  const broken = createFamilyMemoryStore();
  broken.ownedGroup = async () => { const e = new Error('relation "ongil_family_groups" does not exist at 10.0.0.5'); throw e; };
  const srv = server({ store: broken });
  const r = await overview(srv, A);
  assert.deepEqual([r.status, r.json.code], [503, 'STORE_UNAVAILABLE']);
  assert.doesNotMatch(r.raw, /relation|10\.0\.0\.5|ongil_family/);
  const racy = createFamilyMemoryStore();
  racy.acceptInvitation = async () => { const e = new Error('STORE_UNAVAILABLE'); e.code = 'STORE_UNAVAILABLE'; e.sqlState = '23505'; throw e; };
  const srv2 = server({ store: racy });
  const made = await op(srv2, A, 'createInvitation', INVITE);
  const r2 = await op(srv2, B, 'acceptInvitation', { code: made.json.code, ownerLabel: '엄마' });
  assert.deepEqual([r2.status, r2.json.code], [409, 'ALREADY_CONNECTED']);
});

test('FV2-45 no response ever carries an account id, an internal user id, a token hash or another person\'s membership', async () => {
  const srv = server();
  const { memberId } = await connect(srv);
  await share(srv, memberId, { CHECK_IN: 'SUMMARY', HELP_REQUEST: 'DETAIL' });
  await op(srv, A, 'requestHelp', { memberId, kind: 'call' });
  const bodies = [(await overview(srv, A)).raw, (await overview(srv, B)).raw, (await op(srv, B, 'viewShared', { memberId })).raw, (await op(srv, A, 'activity')).raw];
  for (const b of bodies) assert.doesNotMatch(b, /acct_[0-9a-f]|newon_[0-9a-f]|member_account_id|owner_account_id|token_hash|[0-9a-f]{64}/);
  assert.equal(JSON.parse(bodies[1]).owner.members.length, 0, 'B owns nothing: B sees no member list of A');
});

/* ═════════════ 6. wiring · migration · client · V1 untouched ═════════════ */
test('FV2-46 production wiring: one Vercel function, the PostgreSQL store and the Google verifier; the memory twin is never used', () => {
  const api = strip(read('api/ongil/family.mjs'));
  assert.match(api, /import \{ createFamilyHandler \} from '\.\.\/\.\.\/server\/ongil\/family\/http\.mjs';/);
  assert.match(api, /export default createFamilyHandler\(\);/);
  assert.doesNotMatch(api, /Memory/);
  const http = strip(read('server/ongil/family/http.mjs'));
  assert.match(http, /createFamilyPostgresStore\(\{ query: q \}\)/);
  assert.match(http, /createFirebaseSignatureVerifier\(\{ certs: createCertStore\(\{ fetcher, now \}\) \}\)/);
  assert.doesNotMatch(http, /createFamilyMemoryStore|createMemoryStore/);
  /* Vercel picks up every .mjs under api/ by itself (as it does api/health.mjs): vercel.json is NOT changed. The V1 files are static
     relative imports, so the function bundle traces them; the package.json marks them as ES modules for Node. */
  assert.equal(JSON.parse(read('vercel.json')).functions['api/ongil/family.mjs'], undefined);
  for (const f of ['contracts.js', 'family-contracts.js', 'family-domain.js', 'family-permissions.js']) assert.match(read('server/ongil/family/http.mjs'), new RegExp(`from '\\.\\./\\.\\./\\.\\./ongil-start/js/${f.replace('.', '\\.')}'`), f);
  assert.equal(JSON.parse(read('ongil-start/js/package.json')).type, 'module', 'server-side import of the V1 engine is ESM on every Node version');
});

test('FV2-47 migration: only a hash of the code, default-deny tables, cascades from the account, idempotent; no secret in new files', () => {
  const sql = read('server/ongil/family/migrations/001_family.sql');
  assert.match(sql, /token_hash\s+text not null unique check \(token_hash ~ '\^\[0-9a-f\]\{64\}\$'\)/);
  assert.doesNotMatch(sql.replace(/--.*$/gm, ''), /\bcode\b\s+text/, 'no column for the code itself');
  assert.match(sql, /references user_accounts\(account_id\) on delete cascade/);
  assert.match(sql, /create unique index if not exists ongil_family_members_active_uq on ongil_family_members \(group_id, member_account_id\) where status = 'ACTIVE'/);
  assert.equal((sql.match(/create table if not exists/g) || []).length, 8);
  assert.match(sql, /^begin;$/m);
  assert.match(sql, /^commit;$/m);
  const files = ['server/ongil/family/http.mjs', 'server/ongil/family/store.mjs', 'server/ongil/family/migrations/001_family.sql', 'api/ongil/family.mjs', 'ongil-start/js/family-remote.js', 'ongil-start/js/family-remote-view.js', 'docs/ongil/ONGIL_FAMILY_CONNECTION_V2.md'];
  for (const f of files) assert.doesNotMatch(read(f), /AIza[0-9A-Za-z_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9]{20,}|postgres(ql)?:\/\/[^\s'"`]*:[^\s'"`@]+@|UPSTASH_REDIS_REST_TOKEN\s*=\s*\S/, f);
});

function fakeFetch(handler, log) {
  return async (url, init) => {
    log.push({ url, init });
    const u = new URL(url, 'https://www.newon.app');
    const r = await call(handler, { method: init.method, url: u.pathname + u.search, headers: { ...init.headers, origin: 'https://www.newon.app' }, body: init.body });
    return { ok: r.status >= 200 && r.status < 300, status: r.status, json: async () => r.json };
  };
}
const fakeAuth = (sub, status = 'authenticated') => ({ getState: () => ({ status }), getIdToken: async () => tokenFor(sub) });

test('FV2-48 client modes and transport: LOCAL without sign-in, UNAVAILABLE when the server is off, READY only when it says so', async () => {
  const log = [];
  const on = server();
  assert.equal(await createFamilyRemote({ auth: null, apiUrl: (p) => p, fetcher: fakeFetch(on.handler, log) }).resolveMode(), FAMILY_REMOTE_MODES.ANONYMOUS_LOCAL);
  assert.equal(await createFamilyRemote({ auth: fakeAuth(A, 'anonymous'), apiUrl: (p) => p, fetcher: fakeFetch(on.handler, log) }).resolveMode(), FAMILY_REMOTE_MODES.ANONYMOUS_LOCAL);
  assert.equal(log.length, 0, 'nothing is sent for a page without sign-in');
  const off = createFamilyHandler({ env: {}, log: () => {} });
  assert.equal(await createFamilyRemote({ auth: fakeAuth(A), apiUrl: (p) => p, fetcher: fakeFetch(off, log) }).resolveMode(), FAMILY_REMOTE_MODES.REMOTE_UNAVAILABLE);
  assert.equal(await createFamilyRemote({ auth: fakeAuth(A), apiUrl: (p) => p, fetcher: async () => { throw new TypeError('offline'); } }).resolveMode(), FAMILY_REMOTE_MODES.REMOTE_UNAVAILABLE);
  const remoteA = createFamilyRemote({ auth: fakeAuth(A), apiUrl: (p) => p, fetcher: fakeFetch(on.handler, log) });
  assert.equal(await remoteA.resolveMode(), FAMILY_REMOTE_MODES.REMOTE_READY);
  const made = await remoteA.createInvitation(INVITE);
  assert.equal(made.ok, true);
  const remoteB = createFamilyRemote({ auth: fakeAuth(B), apiUrl: (p) => p, fetcher: fakeFetch(on.handler, log) });
  const got = await remoteB.acceptInvitation(made.formattedCode, '엄마');
  assert.equal(got.ok, true);
  const refused = await remoteB.acceptInvitation(made.code, '엄마');
  assert.deepEqual([refused.ok, refused.reason], [false, 'INVITATION_USED']);
  assert.equal(typeof refused.message, 'string');
  for (const { url, init } of log) {
    assert.equal(url.startsWith(FAMILY_API_PATH), true);
    assert.doesNotMatch(url, /token|code|eyJ|[A-Z2-9]{20}/, 'nothing secret in a URL');
    assert.equal(init.credentials, 'omit');
  }
  assert.equal(log.filter((l) => l.init.headers.authorization).every((l) => /^Bearer /.test(l.init.headers.authorization)), true);
  assert.equal(log.some((l) => String(l.init.body || '').includes(made.code)), true, 'the code travels in a body');
  assert.equal(log.find((l) => l.url.endsWith('?op=status')).init.headers.authorization, undefined, 'status is asked without a token');
});

function ownerWorld() {
  const clock = { t: new Date(2026, 9, 4, 9, 0, 0).getTime() };
  const now = () => (clock.t += 1000);
  const storage = createStorage({ backend: createMemoryBackend(), now });
  const checkIn = createCheckInStore(storage, { now });
  const schedule = createScheduleStore(storage, { now });
  const medication = createMedicationStore(storage, { now });
  const sources = { checkIn, schedule, medication, dailyLife: { get: () => ({ meals: 2, exercise: true, exerciseMinutes: 30 }) }, sleep: { get: () => null }, emergencyContacts: { count: () => 2 } };
  return { clock, now, storage, checkIn, schedule, medication, sources, today: () => dateKey(clock.t) };
}

test('FV2-49 snapshot lines come from the SAME V1 readers; only levels the server granted are built; the server re-filters', async () => {
  const w = ownerWorld();
  w.checkIn.save({ status: 'good' }, w.today());
  w.schedule.add({ title: '복지관 수업', date: w.today(), time: '10:00' });
  const readers = createSnapshotReaders(w.sources);
  /* V1 parity: the local family view shows exactly these lines for the same level */
  const repo = createLocalFamilyRepository(w.storage, { now: w.now });
  const svc = createFamilyService({ repository: repo, sources: w.sources, now: w.now });
  const inv = svc.createInvitation({ displayName: '큰딸', relationship: 'child' });
  const member = svc.acceptInvitation(inv.code).member;
  svc.applySharing(member.id, { CHECK_IN: 'DETAIL', SCHEDULE: 'SUMMARY' });
  const local = svc.familyView(member.id, w.today()).snapshot.items;
  const items = snapshotItems(readers, { CHECK_IN: 'DETAIL', SCHEDULE: 'SUMMARY', MEDICATION: 'NONE', HELP_REQUEST: 'DETAIL' }, w.today());
  assert.deepEqual(items.map((i) => [i.category, i.level, i.lines]), local.map((i) => [i.category, i.level, i.lines]));
  assert.equal(items.some((i) => i.category === 'HELP_REQUEST' || i.category === 'MEDICATION'), false);
  /* end to end: A publishes what the readers built; B sees exactly that, on B's account */
  const srv = server();
  const { memberId } = await connect(srv);
  const levels = (await share(srv, memberId, { CHECK_IN: 'DETAIL', SCHEDULE: 'SUMMARY' })).json.levels;
  const pub = await op(srv, A, 'publishSnapshot', { memberId, items: snapshotItems(readers, { ...levels, SCHEDULE: 'DETAIL' }, w.today()) });
  assert.deepEqual([pub.json.published, pub.json.dropped], [1, 1], 'a richer level than granted is dropped by the server');
  const v = await op(srv, B, 'viewShared', { memberId });
  assert.deepEqual(v.json.shared.items[0].lines, ['오늘 안부를 남겼어요.', '오늘 고른 기분: 좋아요']);
});

test('FV2-50 V1 LOCAL is unchanged: the screen still chooses the local repository; nothing is migrated; docs state the truth', () => {
  const w = ownerWorld();
  const chosen = selectFamilyRepository({ storage: w.storage, now: w.now });
  assert.deepEqual([chosen.kind, chosen.mode], ['local', 'LOCAL']);
  assert.equal(FAMILY_REMOTE_CONTRACT.status, 'CODE_READY');
  assert.deepEqual(FAMILY_REMOTE_CONTRACT.routes.map((r) => r.op).filter((o) => o !== 'status' && o !== 'overview').sort(), [...OPS].sort());
  const remote = strip(read('ongil-start/js/family-remote.js'));
  assert.doesNotMatch(remote, /storage\.|localStorage|sessionStorage|\.load\(\)|FAMILY_COLLECTION|migrat/i, 'the client never reads or uploads the local family document');
  assert.doesNotMatch(remote, /console\.|location\.|URLSearchParams|document\.cookie/);
  const app = strip(read('ongil-start/js/app.js'));
  assert.match(app, /const familyConnect = createFamilyService\(\{ repository: selectFamilyRepository\(\{ storage \}\)/);
  assert.match(app, /createFamilyRemote\(\{ auth: win\.NewonAuth \|\| null, apiUrl: dataApi\.apiUrl, fetcher: dataApi\.fetcher \}\)/);
  const doc = read('docs/ongil/ONGIL_FAMILY_CONNECTION_V2.md');
  for (const h of ['AUDIT', 'ARCHITECTURE', 'MODES', 'DATABASE', 'INVITATIONS', 'PERMISSIONS', 'SHARED DATA AUDIT', 'HELP REQUESTS', 'REVOCATION', 'SECURITY', 'RATE LIMITS', 'DELETION', 'TESTS', 'STATUS', 'ACTIVATION PLAN', 'KNOWN LIMITATIONS']) assert.match(doc, new RegExp(`^## (\\d+\\. )?${h}$`, 'm'), h);
  for (const s of ['LIVE', 'LOCAL', 'CODE READY', 'CONFIG REQUIRED', 'ACCOUNT REQUIRED', 'DATABASE REQUIRED', 'FUTURE']) assert.ok(doc.includes(s), s);
  assert.match(doc, /CROSS DEVICE LIVE = NO/);
  assert.doesNotMatch(doc, /CROSS DEVICE LIVE = YES|가족이 연결되었습니다|초대가 전송되었습니다/);
  for (const s of SHARING_CATEGORIES) assert.ok(doc.includes(s.id), s.id);
});

/* ═════════════ 7. REAL PostgreSQL (production SQL through psql; skipped when LIVON_TEST_PG is not set) ═════════════ */
const PG = (() => {
  const raw = String(process.env.LIVON_TEST_PG || '').trim();
  if (!raw) return null;
  const o = Object.fromEntries(raw.split(/\s+/).map((kv) => kv.split('=')));
  return o.host && o.port && o.user ? o : null;
})();
const PG_SKIP = PG ? false : 'LIVON_TEST_PG not set — PostgreSQL suite not run in this environment';
function lit(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') { if (!Number.isFinite(v)) throw new Error('bad number'); return String(v); }
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return "'" + String(v).replace(/'/g, "''") + "'";
}
function parseCsv(out) {
  const rows = []; let row = [], field = '', q = false, quoted = false;
  const push = () => { row.push(quoted ? field : field === '__NULL__' ? null : field); field = ''; quoted = false; };
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (q) { if (c === '"') { if (out[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; continue; }
    if (c === '"') { q = true; quoted = true; continue; }
    if (c === ',') { push(); continue; }
    if (c === '\n') { push(); rows.push(row); row = []; continue; }
    field += c;
  }
  if (field || row.length) { push(); rows.push(row); }
  if (!rows.length) return [];
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] === undefined ? null : r[i]])));
}
/* asynchronous psql: every call is its own session, so two calls really run at the same time; SQLSTATE is kept */
function psqlAsync(db, args, input) {
  return new Promise((resolve, reject) => {
    const p = spawn('psql', ['-h', PG.host, '-p', PG.port, '-U', PG.user, '-d', db, '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose', ...args]);
    let out = '', err = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', (code) => {
      if (code === 0) return resolve(out);
      const e = new Error('STORE_UNAVAILABLE');
      const m = /ERROR:\s+([0-9A-Z]{5}):/.exec(err);
      e.code = 'STORE_UNAVAILABLE'; e.sqlState = m ? m[1] : null; e.stderr = err;
      reject(e);
    });
    if (input) p.stdin.end(input); else p.stdin.end();
  });
}
async function pgDatabase(name) {
  await psqlAsync('postgres', ['-c', `DROP DATABASE IF EXISTS ${name}`]);
  await psqlAsync('postgres', ['-c', `CREATE DATABASE ${name}`]);
  await psqlAsync(name, ['-f', '-'], read('server/livon/userdata/migrations/001_account_backend.sql'));
  await psqlAsync(name, ['-f', '-'], read('server/ongil/family/migrations/001_family.sql'));
  await psqlAsync(name, ['-f', '-'], read('server/ongil/family/migrations/002_family_limits.sql'));
  const query = async (text, params = []) => parseCsv(await psqlAsync(name, ['--csv', '-P', 'null=__NULL__', '-c', text.replace(/\$(\d+)/g, (_, n) => lit(params[Number(n) - 1]))]));
  return { name, query, drop: () => psqlAsync('postgres', ['-c', `DROP DATABASE IF EXISTS ${name}`]) };
}
function pgServer(db, clock) {
  return server({ store: createFamilyPostgresStore({ query: db.query }), accounts: createPostgresStore({ query: db.query }), clock });
}

test('FV2-PG-01 migration applies twice (idempotent) after the LIVON account migration; constraints hold', { skip: PG_SKIP }, async () => {
  const db = await pgDatabase('ongil_family_pg1');
  try {
    await psqlAsync(db.name, ['-f', '-'], read('server/ongil/family/migrations/001_family.sql'));
    await psqlAsync(db.name, ['-f', '-'], read('server/ongil/family/migrations/002_family_limits.sql'));
    const trg = await db.query("SELECT count(*)::int AS n FROM pg_trigger WHERE tgname IN ('ongil_family_member_limit','ongil_family_invitation_limit')");
    assert.equal(Number(trg[0].n), 2, 'migration 002 applied twice leaves exactly two triggers');
    const t = await db.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_name LIKE 'ongil_family_%'");
    assert.equal(Number(t[0].n), 8);
    await assert.rejects(db.query("INSERT INTO ongil_family_groups (id, owner_account_id, created_at, updated_at) VALUES ('fg_abcdefabcdef12', 'acct_missing', 1, 1)"), (e) => e.sqlState === '23503');
    await assert.rejects(db.query("INSERT INTO ongil_family_invitations (id, group_id, created_by, token_hash, display_name, relationship, role, status, expires_at, created_at, updated_at) VALUES ('fi_abcdefabcdef12','fg_x','a','NOT-A-HASH','x','child','FAMILY','PENDING',2,1,1)"), (e) => /^23/.test(e.sqlState));
  } finally { await db.drop(); }
});

test('FV2-PG-02 full cross-account flow on PostgreSQL: invite → accept → share → publish → view → help → disconnect', { skip: PG_SKIP }, async () => {
  const db = await pgDatabase('ongil_family_pg2');
  try {
    const srv = pgServer(db);
    const { memberId, code } = await connect(srv);
    const stored = await db.query('SELECT token_hash, status FROM ongil_family_invitations');
    assert.equal(stored[0].token_hash, invitationHash(code));
    assert.equal(stored[0].status, 'ACCEPTED');
    const dump = JSON.stringify(await db.query('SELECT * FROM ongil_family_invitations')) + JSON.stringify(await db.query('SELECT * FROM ongil_family_activity'));
    assert.equal(dump.includes(code), false, 'the code is nowhere in the database');
    assert.equal((await share(srv, memberId, { CHECK_IN: 'DETAIL', MEDICATION: 'SUMMARY' }, ['MEDICATION'])).status, 200);
    assert.equal((await share(srv, memberId, { HELP_REQUEST: 'DETAIL' })).status, 200);
    const pub = await op(srv, A, 'publishSnapshot', { memberId, items: [item('CHECK_IN', 'DETAIL'), item('MEDICATION', 'SUMMARY'), item('SLEEP', 'SUMMARY')] });
    assert.deepEqual([pub.json.published, pub.json.dropped], [2, 1]);
    let v = await op(srv, B, 'viewShared', { memberId });
    assert.deepEqual(v.json.shared.items.map((i) => i.category), ['CHECK_IN', 'MEDICATION']);
    assert.deepEqual(v.json.shared.items[0].lines, LINES.CHECK_IN.DETAIL);
    const h = await op(srv, A, 'requestHelp', { memberId, kind: 'call', message: '전화 부탁해요' });
    assert.equal((await op(srv, B, 'moveHelp', { requestId: h.json.request.id, to: 'ACCEPTED' })).status, 200);
    assert.equal((await overview(srv, A)).json.owner.requests[0].status, 'ACCEPTED');
    assert.equal((await share(srv, memberId, { MEDICATION: 'NONE' })).status, 200);
    v = await op(srv, B, 'viewShared', { memberId });
    assert.deepEqual(v.json.shared.items.map((i) => i.category), ['CHECK_IN']);
    assert.equal((await op(srv, A, 'disconnect', { memberId })).status, 200);
    assert.equal((await op(srv, B, 'viewShared', { memberId })).status, 403);
    const left = await db.query("SELECT (SELECT count(*) FROM ongil_family_permissions)::int AS p, (SELECT count(*) FROM ongil_family_snapshots)::int AS s, (SELECT count(*) FROM ongil_family_consents WHERE status = 'GRANTED')::int AS c, (SELECT status FROM ongil_family_help_requests LIMIT 1) AS h");
    assert.deepEqual([Number(left[0].p), Number(left[0].s), Number(left[0].c), left[0].h], [0, 0, 0, 'CANCELLED'], 'one statement removed every access');
    const acts = (await op(srv, A, 'activity')).json.activity.map((a) => a.action);
    assert.equal(acts[0], 'DISCONNECTED');
    assert.ok(acts.includes('CONSENT_WITHDRAWN') && acts.includes('CONSENT_GIVEN') && acts.includes('INVITE_ACCEPTED'));
  } finally { await db.drop(); }
});

test('FV2-PG-03 concurrency: two accounts accept the same code at the same moment → exactly one membership', { skip: PG_SKIP }, async () => {
  const db = await pgDatabase('ongil_family_pg3');
  try {
    const srv = pgServer(db);
    for (const s of [B, C, D]) await overview(srv, s); /* accounts exist first, so the race is only the accept */
    const made = await op(srv, A, 'createInvitation', INVITE);
    const results = await Promise.all([B, C, D].map((s) => op(srv, s, 'acceptInvitation', { code: made.json.code, ownerLabel: '엄마' })));
    assert.equal(results.filter((r) => r.status === 200).length, 1, JSON.stringify(results.map((r) => r.json.code)));
    assert.equal(results.filter((r) => r.status === 409).length, 2);
    for (const r of results.filter((x) => x.status === 409)) assert.equal(['INVITATION_USED', 'CONFLICT'].includes(r.json.code), true, r.json.code);
    const n = await db.query("SELECT count(*)::int AS n FROM ongil_family_members WHERE status = 'ACTIVE'");
    assert.equal(Number(n[0].n), 1);
  } finally { await db.drop(); }
});

test('FV2-PG-04 concurrency: one account accepts two codes of the same family at once → one ACTIVE membership, the other code unused', { skip: PG_SKIP }, async () => {
  const db = await pgDatabase('ongil_family_pg4');
  try {
    const srv = pgServer(db);
    await overview(srv, B);
    const one = await op(srv, A, 'createInvitation', INVITE);
    const two = await op(srv, A, 'createInvitation', { ...INVITE, displayName: '작은딸' });
    const results = await Promise.all([one, two].map((m) => op(srv, B, 'acceptInvitation', { code: m.json.code, ownerLabel: '엄마' })));
    assert.equal(results.filter((r) => r.status === 200).length, 1, JSON.stringify(results.map((r) => r.json)));
    assert.equal(['ALREADY_CONNECTED', 'CONFLICT'].includes(results.find((r) => r.status !== 200).json.code), true);
    const rows = await db.query('SELECT status FROM ongil_family_invitations ORDER BY status');
    assert.deepEqual(rows.map((r) => r.status), ['ACCEPTED', 'PENDING'], 'the losing statement rolled back as a whole');
    const n = await db.query("SELECT count(*)::int AS n FROM ongil_family_members WHERE status = 'ACTIVE'");
    assert.equal(Number(n[0].n), 1);
  } finally { await db.drop(); }
});

test('FV2-PG-05 racing invitation creates: every code is unique and valid, and exactly five stay pending', { skip: PG_SKIP }, async () => {
  const db = await pgDatabase('ongil_family_pg5');
  try {
    const srv = pgServer(db);
    await overview(srv, A);
    await op(srv, A, 'createInvitation', INVITE); /* the group exists before the race */
    const results = await Promise.all(Array.from({ length: 8 }, () => op(srv, A, 'createInvitation', INVITE)));
    const made = results.filter((r) => r.status === 200);
    assert.equal(results.every((r) => r.status === 200 || r.json.code === 'LIMIT_INVITATIONS'), true);
    assert.equal(new Set(made.map((r) => r.json.code)).size, made.length, 'no two invitations share a code');
    const rows = await db.query("SELECT token_hash FROM ongil_family_invitations WHERE status = 'PENDING'");
    assert.equal(new Set(rows.map((r) => r.token_hash)).size, rows.length);
    /* migration 002 serialises creates per family (advisory lock + fresh count in a trigger): the limit is exact under a burst */
    assert.equal(rows.length, 5, `pending ${rows.length}`);
    const next = await op(srv, A, 'createInvitation', INVITE);
    assert.deepEqual([next.status, next.json.code], [409, 'LIMIT_INVITATIONS']);
  } finally { await db.drop(); }
});

test('FV2-PG-06 deletion: removing a Newon+ account removes its family group, memberships, shared lines and requests (cascade)', { skip: PG_SKIP }, async () => {
  const db = await pgDatabase('ongil_family_pg6');
  try {
    const srv = pgServer(db);
    const { memberId } = await connect(srv);
    await share(srv, memberId, { CHECK_IN: 'SUMMARY', HELP_REQUEST: 'DETAIL' });
    await op(srv, A, 'publishSnapshot', { memberId, items: [item('CHECK_IN', 'SUMMARY')] });
    await op(srv, A, 'requestHelp', { memberId, kind: 'call' });
    const owner = await srv.accounts.findAccount({ issuer: ISS, subject: A });
    await db.query('DELETE FROM user_accounts WHERE account_id = $1', [owner.accountId]);
    const left = await db.query("SELECT (SELECT count(*) FROM ongil_family_groups)::int AS g, (SELECT count(*) FROM ongil_family_members)::int AS m, (SELECT count(*) FROM ongil_family_snapshots)::int AS s, (SELECT count(*) FROM ongil_family_help_requests)::int AS h, (SELECT count(*) FROM ongil_family_activity)::int AS a");
    assert.deepEqual(Object.values(left[0]).map(Number), [0, 0, 0, 0, 0]);
    assert.equal((await overview(srv, B)).json.memberships.length, 0);
  } finally { await db.drop(); }
});

/* ═════════════ 8. production integration: limits hold under concurrency (migration 002) ═════════════ */
const PG_SUBJECTS = Array.from({ length: 16 }, (_, i) => 'raceMember' + String(i).padStart(2, '0'));
async function connectMany(srv, n) {
  for (let i = 0; i < n; i++) await connect(srv, A, PG_SUBJECTS[i], { ...INVITE, displayName: '가족' + i });
}

test('FV2-PG-07 concurrency: five different accounts race for the 11th place → the family never exceeds 10 connected members', { skip: PG_SKIP }, async () => {
  const db = await pgDatabase('ongil_family_pg7');
  try {
    const srv = pgServer(db);
    await connectMany(srv, 9);
    const racers = PG_SUBJECTS.slice(9, 14);
    for (const s of racers) await overview(srv, s);
    const codes = [];
    for (let i = 0; i < racers.length; i++) codes.push((await op(srv, A, 'createInvitation', { ...INVITE, displayName: '대기' + i })).json.code);
    const results = await Promise.all(racers.map((s, i) => op(srv, s, 'acceptInvitation', { code: codes[i], ownerLabel: '엄마' })));
    assert.equal(results.filter((r) => r.status === 200).length, 1, JSON.stringify(results.map((r) => r.json.code)));
    for (const r of results.filter((x) => x.status !== 200)) assert.deepEqual([r.status, r.json.code], [409, 'LIMIT_MEMBERS']);
    const n = await db.query("SELECT count(*)::int AS n FROM ongil_family_members WHERE status = 'ACTIVE'");
    assert.equal(Number(n[0].n), 10);
    const inv = await db.query("SELECT status, count(*)::int AS n FROM ongil_family_invitations GROUP BY status ORDER BY status");
    assert.deepEqual(inv.map((r) => [r.status, Number(r.n)]), [['ACCEPTED', 10], ['PENDING', 4]], 'a refused accept leaves its invitation unused (the statement rolled back whole)');
  } finally { await db.drop(); }
});

test('FV2-PG-08 concurrency: with four invitations waiting, six creates at once → exactly five pending (the 6th is refused)', { skip: PG_SKIP }, async () => {
  const db = await pgDatabase('ongil_family_pg8');
  try {
    const srv = pgServer(db);
    for (let i = 0; i < 4; i++) assert.equal((await op(srv, A, 'createInvitation', { ...INVITE, displayName: '대기' + i })).status, 200);
    const results = await Promise.all(Array.from({ length: 6 }, (_, i) => op(srv, A, 'createInvitation', { ...INVITE, displayName: '동시' + i })));
    assert.equal(results.filter((r) => r.status === 200).length, 1, JSON.stringify(results.map((r) => r.json.code)));
    for (const r of results.filter((x) => x.status !== 200)) assert.deepEqual([r.status, r.json.code], [409, 'LIMIT_INVITATIONS']);
    const rows = await db.query("SELECT count(*)::int AS n FROM ongil_family_invitations WHERE status = 'PENDING'");
    assert.equal(Number(rows[0].n), 5);
    const acts = await db.query("SELECT count(*)::int AS n FROM ongil_family_activity WHERE action = 'INVITE_CREATED'");
    assert.equal(Number(acts[0].n), 5, 'a refused create writes no audit row either');
  } finally { await db.drop(); }
});

/* The same statements the store sends, each held open in its own transaction for a moment: a deterministic race. Before
   migration 002 every racer counted before the others committed and all of them were written; now they wait for each other. */
async function heldStatement(build) {
  const cap = [];
  const st = createFamilyPostgresStore({ query: async (text, params) => { cap.push([text, params]); return [{ id: 'x', group_id: 'g', ok: 1 }]; } });
  await build(st);
  const [text, params] = cap[0];
  return 'BEGIN;\n' + text.replace(/\$(\d+)/g, (_, n) => lit(params[Number(n) - 1])) + ';\nSELECT pg_sleep(0.6);\nCOMMIT;\n';
}
const pgId = (p) => p + '_' + crypto.randomBytes(8).toString('hex');

test('FV2-PG-09 held transactions: six invitation creates that overlap in time leave exactly five pending (limit errors are OGF02)', { skip: PG_SKIP }, async () => {
  const db = await pgDatabase('ongil_family_pg9');
  try {
    const srv = pgServer(db);
    await op(srv, A, 'createInvitation', INVITE);
    await db.query("UPDATE ongil_family_invitations SET status = 'REVOKED'");
    const g = (await db.query('SELECT id, owner_account_id FROM ongil_family_groups'))[0];
    const t = Date.now();
    const scripts = await Promise.all(Array.from({ length: 6 }, (_, i) => heldStatement((st) => st.createInvitation({ id: pgId('fi'), groupId: g.id, createdBy: g.owner_account_id, tokenHash: crypto.randomBytes(32).toString('hex'), displayName: '동시' + i, relationship: 'child', role: 'FAMILY', expiresAt: t + 864e5, pendingLimit: 5, now: t }))));
    const results = await Promise.allSettled(scripts.map((s) => psqlAsync(db.name, ['-f', '-'], s)));
    const refused = results.filter((r) => r.status === 'rejected');
    for (const r of refused) assert.equal(r.reason.sqlState, 'OGF02', r.reason.stderr);
    const n = await db.query("SELECT count(*)::int AS n FROM ongil_family_invitations WHERE status = 'PENDING'");
    assert.equal(Number(n[0].n), 5, 'pending invitations after the overlapping creates');
  } finally { await db.drop(); }
});

test('FV2-PG-10 held transactions: five accepts of different codes that overlap in time never pass 10 members (limit errors are OGF01)', { skip: PG_SKIP }, async () => {
  const db = await pgDatabase('ongil_family_pg10');
  try {
    const srv = pgServer(db);
    await connectMany(srv, 9);
    const racers = PG_SUBJECTS.slice(9, 14);
    const accts = [];
    for (const s of racers) { await overview(srv, s); accts.push((await srv.accounts.findAccount({ issuer: ISS, subject: s })).accountId); }
    const codes = [];
    for (let i = 0; i < racers.length; i++) codes.push((await op(srv, A, 'createInvitation', { ...INVITE, displayName: '대기' + i })).json.code);
    const t = Date.now();
    const scripts = await Promise.all(racers.map((_, i) => heldStatement((st) => st.acceptInvitation({ hash: invitationHash(codes[i]), accountId: accts[i], memberId: pgId('fm'), ownerLabel: '엄마', now: t, memberLimit: 10 }))));
    const results = await Promise.allSettled(scripts.map((s) => psqlAsync(db.name, ['-f', '-'], s)));
    for (const r of results.filter((x) => x.status === 'rejected')) assert.equal(r.reason.sqlState, 'OGF01', r.reason.stderr);
    const n = await db.query("SELECT count(*)::int AS n FROM ongil_family_members WHERE status = 'ACTIVE'");
    assert.equal(Number(n[0].n), 10, 'connected members after the overlapping accepts');
    const pend = await db.query("SELECT count(*)::int AS n FROM ongil_family_invitations WHERE status = 'PENDING'");
    assert.equal(Number(pend[0].n), 4, 'refused accepts consumed no invitation');
  } finally { await db.drop(); }
});

test('FV2-51 migration 002: limits in the database equal FAMILY_LIMITS; per-family advisory lock; fixed SQLSTATEs; idempotent; nothing stored', async () => {
  const { FAMILY_LIMITS } = await import('../../ongil-start/js/family-domain.js');
  const sql = read('server/ongil/family/migrations/002_family_limits.sql');
  assert.match(sql, new RegExp("status = 'ACTIVE';\\s*if n >= " + FAMILY_LIMITS.members + " then\\s*raise exception 'family member limit' using errcode = 'OGF01'"));
  assert.match(sql, new RegExp("expires_at > new\\.created_at;\\s*if n >= " + FAMILY_LIMITS.pendingInvitations + " then\\s*raise exception 'family invitation limit' using errcode = 'OGF02'"));
  assert.equal((sql.match(/pg_advisory_xact_lock\(hashtextextended\('ongil_family_group:' \|\| new\.group_id, 0\)\)/g) || []).length, 2, 'one lock key per family, shared by both limits');
  assert.match(sql, /^begin;$/m); assert.match(sql, /^commit;$/m);
  for (const t of ['ongil_family_member_limit', 'ongil_family_invitation_limit']) {
    assert.match(sql, new RegExp('create or replace function ' + t + '\\(\\)'));
    assert.match(sql, new RegExp('drop trigger if exists ' + t + ' on '));
  }
  assert.doesNotMatch(sql, /alter table|create table|drop table|truncate|delete from|update /i, 'no schema or data change beyond the two triggers');
  assert.match(sql, /Apply AFTER 001_family\.sql/);
  const { LIMIT_SQLSTATE } = await import('../../server/ongil/family/http.mjs');
  assert.deepEqual({ ...LIMIT_SQLSTATE }, { members: 'OGF01', invitations: 'OGF02' });
});

test('FV2-52 a limit refused by the database (OGF01 / OGF02) answers 409 with the limit message, never 503 or a generic conflict', async () => {
  const store = createFamilyMemoryStore();
  const raced = (code) => Object.assign(new Error('STORE_UNAVAILABLE'), { code: 'STORE_UNAVAILABLE', sqlState: code });
  const real = { createInvitation: store.createInvitation, acceptInvitation: store.acceptInvitation };
  const srv = server({ store });
  const made = await op(srv, A, 'createInvitation', INVITE);
  store.createInvitation = async () => { throw raced('OGF02'); };
  let r = await op(srv, A, 'createInvitation', INVITE);
  assert.deepEqual([r.status, r.json.code], [409, 'LIMIT_INVITATIONS']);
  assert.equal(r.json.code in { LIMIT_INVITATIONS: 1 } && !('code' in (r.json.invitation || {})), true, 'no code is returned for a refused invitation');
  store.createInvitation = real.createInvitation;
  store.acceptInvitation = async () => { throw raced('OGF01'); };
  r = await op(srv, B, 'acceptInvitation', { code: made.json.code, ownerLabel: '엄마' });
  assert.deepEqual([r.status, r.json.code], [409, 'LIMIT_MEMBERS']);
  store.acceptInvitation = real.acceptInvitation;
  assert.equal((await op(srv, B, 'acceptInvitation', { code: made.json.code, ownerLabel: '엄마' })).status, 200, 'the refused accept left the invitation usable');
  /* any other operation that meets these SQLSTATEs still answers the limit, not "store unavailable" */
  store.publishSnapshot = async () => { throw raced('OGF01'); };
  const memberId = (await overview(srv, A)).json.owner.members[0].id;
  r = await op(srv, A, 'publishSnapshot', { memberId, items: [] });
  assert.deepEqual([r.status, r.json.code], [409, 'LIMIT_MEMBERS']);
});

test('FV2-53 account card focus: the one-time invitation code receives focus; after any server action focus is never left on the page body', () => {
  const v = read('ongil-start/js/family-remote-view.js');
  assert.match(v, /const shown = card && card\.body\.querySelector\('\.og-family-code'\);\s*if \(shown\) shown\.focus\(\); else keepFocus\(\);/);
  assert.match(v, /card\.say\(okText\);\s*await load\(\);\s*keepFocus\(\);/);
  assert.match(v, /function keepFocus\(\) \{[\s\S]*?a === document\.body \|\| !a\.isConnected\)\) card\.focusTitle\(\);/);
  assert.match(v, /el\('p', \{ class: 'og-family-code', tabindex: '-1'/, 'the code element can take focus');
  assert.match(read('ongil-start/js/home-ui.js'), /focusTitle: \(\) => titleNode\.focus\(\)/);
});
