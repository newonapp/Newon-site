/*
 * ONGIL Family Connection V2 — /api/ongil/family (cross-device family, Newon+ accounts).
 *
 *   GET  /api/ongil/family?op=status            no sign-in: { enabled, database, auth, protection, ready } (booleans only)
 *   GET  /api/ongil/family                      signed in: what this account owns (its family group) and where it is a member
 *   POST /api/ongil/family  { op, payload }     one of OPS below
 *   OPTIONS                                     CORS preflight (allowlisted origins only, Authorization allowed, no wildcard)
 *
 * Order of checks (fail closed at every step, before any database work) — the same as /api/livon/userdata:
 *   CORS/origin → method → ONGIL_FAMILY_REMOTE_ENABLED → database configured → verifier configured → duplicate
 *   Authorization refused → declared size → Bearer <Firebase ID token> verified (token in the URL refused) → issuer is the
 *   Newon+ project (admin issuers refused) → (issuer, subject) → internal accountId (the same user_accounts row LIVON uses)
 *   → per-account rate limit → strict payload validation → the V1 permission engine → store.
 *
 * Who is who: the signed-in account is the only identity. A client never sends its own account id, owner id or group id:
 * the owner's group is found from the account; a member id given by a client is used only after the server checked that
 * the membership belongs to the caller (as member) or lives in the caller's own group (as owner). Anything else answers
 * the same "not found" as an id that does not exist (no IDOR, no enumeration).
 *
 * Sharing rules are NOT re-written here: the server builds the V1 state shape from database rows and asks
 * ongil-start/js/family-permissions.js (default deny, consent for sensitive categories, help transitions). What a member
 * reads is re-filtered by the permissions in force at the moment of reading: a category that is not shared is absent.
 *
 * Logs: request id, route, op, status, fixed code, latency — never tokens, codes, names, messages or shared lines.
 */
import { randomBytes, createHash } from 'node:crypto';
import { json } from '../../livon/http.mjs';
import { applyCors, CorsError, isProductionEnv } from '../../livon/cors.mjs';
import { limitBuckets, LimitError } from '../../livon/ratelimit.mjs';
import { protectionConfigured } from '../../livon/chat.mjs';
import { createTokenVerifier, configFromEnv as authConfigFromEnv, issuerFor, AuthError } from '../../newon/auth/verify.mjs';
import { createFirebaseSignatureVerifier, createCertStore } from '../../newon/auth/firebase-verifier.mjs';
import { ADMIN_ISSUERS } from '../../newon/auth/accounts.mjs';
import { createPostgresStore, postgresQueryFromEnv, databaseConfig } from '../../livon/userdata/store.mjs';
import { createFamilyPostgresStore } from './store.mjs';
import { safeText, isPlainObject } from '../../../ongil-start/js/contracts.js';
import { RELATIONSHIPS } from '../../../ongil-start/js/family-contracts.js';
import {
  SHARING_CATEGORIES, sharingCategory, levelAllowed, levelRank, makeId, makeInvitationCode, parseInvitationCode, formatInvitationCode,
  FAMILY_LIMITS, FAMILY_HELP_KINDS, HELP_STATE_LABELS, INVITE_EXPIRY, MEMBER_ROLES, ACTIVITY_ACTIONS, LEVEL_LABELS, normalizeRequest,
} from '../../../ongil-start/js/family-domain.js';
import { activeMember, effectiveLevel, canShare, canRespondHelpRequest, canOwnerMoveHelpRequest, grantedConsent, levelsFor } from '../../../ongil-start/js/family-permissions.js';

export const BODY_MAX = 16 * 1024;
export const OPS = Object.freeze(['createInvitation', 'revokeInvitation', 'inspectInvitation', 'acceptInvitation', 'declineInvitation', 'setPermissions', 'stopSharing', 'stopAllSharing', 'disconnect', 'leave', 'publishSnapshot', 'viewShared', 'requestHelp', 'moveHelp', 'activity']);
/* [[max, windowSeconds], …] per account. Codes are 100 bits: these caps make guessing pointless, not merely slow. */
export const FAMILY_RATE = Object.freeze({
  general: Object.freeze([[60, 60], [3000, 86400]]),
  invite: Object.freeze([[5, 600], [20, 86400]]),
  code: Object.freeze([[10, 600], [30, 86400]]),
  help: Object.freeze([[10, 600], [50, 86400]]),
});
export const HELP_OPEN_LIMIT = 50;
const SNAPSHOT_LINE_MAX = 200;
const SNAPSHOT_BYTES_MAX = 4096;
const SUBJECT_RE = /^[A-Za-z0-9_-]{6,128}$/;
const MEMBER_ID_RE = /^fm_[a-z0-9]{12,32}$/;
const INVITE_ID_RE = /^fi_[a-z0-9]{12,32}$/;
const REQUEST_ID_RE = /^fr_[a-z0-9]{12,32}$/;
const SENSITIVE = SHARING_CATEGORIES.filter((c) => c.sensitive).map((c) => c.id);
const ids = (list) => list.map((o) => (typeof o === 'string' ? o : o.id));
export const ACTION_LABELS = Object.freeze({ ...ACTIVITY_ACTIONS, MEMBER_LEFT: '가족이 연결을 끝냈어요' });

const TEXT = {
  FAMILY_NOT_AVAILABLE: '계정으로 가족을 연결하는 기능이 아직 켜져 있지 않아요.', SERVER_NOT_CONFIGURED: '가족 연결 저장소가 아직 연결되지 않았어요.',
  AUTH_NOT_CONFIGURED: '계정 인증이 아직 연결되지 않았어요.', NO_TOKEN: '로그인이 필요해요.', MALFORMED_TOKEN: '로그인 정보가 올바르지 않아요.',
  INVALID_TOKEN: '로그인이 만료되었거나 올바르지 않아요.', TOKEN_EXPIRED: '로그인이 만료되었어요. 다시 로그인해 주세요.', TOKEN_IN_URL: '요청 형식이 올바르지 않아요.',
  ISSUER_NOT_ALLOWED: '이 계정으로는 사용할 수 없어요.', ADMIN_IDENTITY_NOT_ALLOWED: '이 계정으로는 사용할 수 없어요.', ACCOUNT_DISABLED: '사용할 수 없는 계정이에요.',
  ORIGIN_NOT_ALLOWED: '허용되지 않은 요청이에요.', METHOD_NOT_ALLOWED: '허용되지 않은 요청이에요.', UNSUPPORTED_MEDIA_TYPE: '요청 형식이 올바르지 않아요.',
  BAD_REQUEST: '요청 형식이 올바르지 않아요.', PAYLOAD_TOO_LARGE: '한 번에 보낼 수 있는 양을 넘었어요.', UNSUPPORTED_OP: '지원하지 않는 요청이에요.',
  RATE_LIMIT: '요청이 많아요. 잠시 후 다시 해 주세요.', PROTECTION_NOT_CONFIGURED: '서버 보호 설정이 끝나지 않았어요.', PROTECTION_UNAVAILABLE: '잠시 후 다시 해 주세요.',
  INVALID_SERVER_CONFIG: '서버 설정을 확인해야 해요.', STORE_UNAVAILABLE: '가족 연결 저장소에 닿지 못했어요. 잠시 후 다시 해 주세요.', SERVER_ERROR: '요청을 처리하지 못했어요.',
  CONFLICT: '방금 다른 곳에서 바뀌었어요. 화면을 새로 연 뒤 다시 해 주세요.',
  INVALID_NAME: '가족을 부르는 이름을 적어 주세요.', INVALID_CODE: '초대 코드를 다시 확인해 주세요. 글자 20개예요.',
  INVITATION_NOT_FOUND: '이 코드로 찾을 수 있는 초대가 없어요. 코드를 다시 확인해 주세요.', INVITATION_EXPIRED: '초대 기간이 끝났어요. 새 초대를 받아 주세요.',
  INVITATION_REVOKED: '취소된 초대예요.', INVITATION_DECLINED: '받지 않기로 한 초대예요.', INVITATION_USED: '이미 연결에 쓴 초대예요.',
  SELF_INVITATION: '내가 만든 초대는 내가 받을 수 없어요.', ALREADY_CONNECTED: '이미 연결된 가족이에요.',
  LIMIT_MEMBERS: `가족은 ${FAMILY_LIMITS.members}명까지 연결할 수 있어요.`, LIMIT_INVITATIONS: `기다리는 초대는 ${FAMILY_LIMITS.pendingInvitations}개까지 둘 수 있어요. 쓰지 않는 초대를 취소해 주세요.`,
  NO_FAMILY: '아직 만든 가족 연결이 없어요.', MEMBER_NOT_CONNECTED: '연결된 가족이 아니에요.', ACCESS_DENIED: '볼 수 있는 내용이 없어요.',
  CONSENT_REQUIRED: '건강 관련 정보는 한 번 더 동의해야 공유돼요.', INVALID_CATEGORY: '공유할 수 없는 항목이에요.', INVALID_LEVEL: '그 항목에서 고를 수 없는 공유 정도예요.',
  SHARING_OFF: '이 가족에게 ‘도움 요청’ 공유를 먼저 켜 주세요.', INVALID_KIND: '도움 종류를 골라 주세요.', INVALID_MESSAGE: '부탁할 내용을 적어 주세요.',
  LIMIT_HELP: '진행 중인 도움 요청이 많아요. 끝난 요청을 정리한 뒤 다시 해 주세요.', NOT_FOUND: '찾을 수 없어요.', NOT_ALLOWED: '지금 상태에서는 바꿀 수 없어요.',
};
export class FamilyError extends Error {
  constructor(status, code, extra) { super(code); this.status = status; this.code = code; this.extra = extra || null; this.retryAfter = extra && extra.retryAfter; }
}
const fail = (status, code, extra) => { throw new FamilyError(status, code, extra); };

/* ───────── configuration (booleans only: no value of any setting is ever returned) ───────── */
export function familyStatus(env = {}) {
  const production = isProductionEnv(env);
  const enabled = env.ONGIL_FAMILY_REMOTE_ENABLED === 'true';
  const database = databaseConfig(env).ok;
  const auth = authConfigFromEnv(env).enabled;
  /* outside production the in-process limiter protects the route; production needs the shared limiter (Upstash + secret) */
  const protection = production ? protectionConfigured(env) : true;
  return { enabled, database, auth, protection, ready: enabled && database && auth && protection };
}

/* the invitation code is never stored: only this digest of it (100-bit code → a lookup key, not a password) */
export const invitationHash = (code) => createHash('sha256').update('ongil-family-invite:v1:' + code).digest('hex');
/* V1 user ids are "<letters>_<base36>": a Newon+ account acct_<32 hex> becomes newon_<32 hex> inside the permission engine */
const userIdOf = (accountId) => 'newon_' + String(accountId).slice(5);

function readBody(req) {
  if (req.body != null) {
    if (typeof req.body === 'object' && !(req.body instanceof Uint8Array)) {
      if (Buffer.byteLength(JSON.stringify(req.body)) > BODY_MAX) return Promise.reject(new FamilyError(413, 'PAYLOAD_TOO_LARGE'));
      return Promise.resolve(req.body);
    }
    const s = String(req.body);
    if (Buffer.byteLength(s) > BODY_MAX) return Promise.reject(new FamilyError(413, 'PAYLOAD_TOO_LARGE'));
    try { return Promise.resolve(JSON.parse(s)); } catch { return Promise.reject(new FamilyError(400, 'BAD_REQUEST')); }
  }
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    const timer = setTimeout(() => reject(new FamilyError(400, 'BAD_REQUEST')), 5000);
    req.on('data', (c) => { size += c.length; if (size > BODY_MAX) { clearTimeout(timer); reject(new FamilyError(413, 'PAYLOAD_TOO_LARGE')); if (req.destroy) req.destroy(); } else chunks.push(c); });
    req.on('end', () => { clearTimeout(timer); try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null')); } catch { reject(new FamilyError(400, 'BAD_REQUEST')); } });
    req.on('error', () => { clearTimeout(timer); reject(new FamilyError(400, 'BAD_REQUEST')); });
  });
}

/* strict shapes: a payload with a key that is not expected (userId, ownerId, accountId, groupId …) is refused whole */
function shape(value, allowed, required = allowed) {
  if (!isPlainObject(value)) fail(400, 'BAD_REQUEST');
  for (const k of Object.keys(value)) if (!allowed.includes(k)) fail(400, 'BAD_REQUEST');
  for (const k of required) if (!(k in value)) fail(400, 'BAD_REQUEST');
  return value;
}
const idParam = (v, re) => (typeof v === 'string' && re.test(v) ? v : fail(400, 'BAD_REQUEST'));
const nameParam = (v) => { const s = typeof v === 'string' ? safeText(v, FAMILY_LIMITS.name) : ''; if (!s || (typeof v === 'string' && v.length > 200)) fail(400, 'INVALID_NAME'); return s; };
function codeParam(v) {
  const code = parseInvitationCode(v);
  if (!code) fail(400, 'INVALID_CODE');
  return code;
}

/* database rows → the V1 state the permission engine reads (account ids never leave this function's output unhashed) */
function v1State(raw) {
  const members = raw.members.map((m) => ({ id: m.id, memberUserId: userIdOf(m.member_account_id), status: m.status, displayName: m.display_name, relationship: m.relationship, role: m.role, joinedAt: m.joined_at, endedAt: m.ended_at }));
  return {
    group: { id: raw.group.id, ownerUserId: userIdOf(raw.group.owner_account_id) },
    members,
    connections: members.filter((m) => m.status === 'ACTIVE').map((m) => ({ memberId: m.id, memberUserId: m.memberUserId, status: 'ACTIVE' })),
    permissions: raw.permissions.map((p) => ({ memberId: p.member_id, category: p.category, level: p.level })),
    consents: raw.consents.map((c) => ({ memberId: c.member_id, category: c.category, level: c.level, status: c.status })),
    requests: raw.requests.map((r) => ({ id: r.id, memberId: r.member_id, kind: r.kind, message: r.message, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at })),
  };
}
const ownerActor = (state) => ({ role: 'OWNER', userId: state.group.ownerUserId });
const labelOf = (list, id) => (list.find((o) => o.id === id) || { label: '' }).label;
const publicRequest = (r) => ({ id: r.id, memberId: r.memberId, kind: r.kind, kindLabel: labelOf(FAMILY_HELP_KINDS, r.kind), message: r.message, status: r.status, statusLabel: HELP_STATE_LABELS[r.status] || '', createdAt: r.createdAt, updatedAt: r.updatedAt });
const OPEN_HELP = ['REQUESTED', 'SEEN', 'ACCEPTED'];

/*
 * createFamilyHandler({ env, store, accounts, verifier, fetcher, now, log, limiter })
 *   store     the family store (defaults to PostgreSQL from LIVON_DATABASE_URL; null → 503 SERVER_NOT_CONFIGURED)
 *   accounts  the Newon+ account store shared with LIVON (findAccount / createAccount), same database
 *   verifier  createTokenVerifier + Google-certificate signature check (disabled → 503 AUTH_NOT_CONFIGURED)
 *   Tests inject the in-memory twins and a verifier with a throwaway key; checks and flow are the same.
 */
export function createFamilyHandler({ env = process.env, store, accounts, verifier, fetcher = fetch, now = () => Date.now(), log = null, limiter = limitBuckets } = {}) {
  const emit = log || ((entry) => { if (!isProductionEnv(env)) console.warn('[ONGIL FAMILY]', JSON.stringify(entry)); });
  const cfg = familyStatus(env);
  const authCfg = authConfigFromEnv(env);
  const primaryIssuer = authCfg.projectId ? issuerFor(authCfg.projectId) : '';
  const tokenVerifier = verifier || createTokenVerifier({ env, verifySignature: createFirebaseSignatureVerifier({ certs: createCertStore({ fetcher, now }) }), now });
  let storesPromise = null;
  const getStores = () => {
    if (store === null || accounts === null) return Promise.resolve(null);
    if (store !== undefined && accounts !== undefined) return Promise.resolve({ fam: store, acc: accounts });
    if (!storesPromise) {
      storesPromise = postgresQueryFromEnv(env).then((q) => (q ? { fam: store || createFamilyPostgresStore({ query: q }), acc: accounts || createPostgresStore({ query: q }) } : null));
      storesPromise.then((s) => { if (!s) storesPromise = null; }, () => { storesPromise = null; });
    }
    return storesPromise;
  };

  async function account(session, acc) {
    if (!session || session.verified !== true || typeof session.issuer !== 'string' || !SUBJECT_RE.test(String(session.subject || ''))) fail(401, 'INVALID_TOKEN');
    if (ADMIN_ISSUERS.includes(session.issuer)) fail(403, 'ADMIN_IDENTITY_NOT_ALLOWED');
    if (!authCfg.allowedIssuers.includes(session.issuer)) fail(403, 'ISSUER_NOT_ALLOWED');
    let row = await acc.findAccount({ issuer: session.issuer, subject: session.subject });
    if (!row) {
      if (session.issuer !== primaryIssuer) fail(403, 'ISSUER_NOT_ALLOWED');
      const c = await acc.createAccount({ issuer: session.issuer, subject: session.subject }, { now: now() });
      row = { accountId: c.accountId, status: 'active' };
    }
    if (row.status !== 'active') fail(403, 'ACCOUNT_DISABLED');
    if (!/^acct_[0-9a-f]{32}$/.test(row.accountId)) fail(503, 'INVALID_SERVER_CONFIG');
    return row.accountId;
  }
  const limit = async (scope, identity, caps) => {
    try { await limiter({ scope, identity, caps, env, fetcher, now }); }
    catch (e) { if (e instanceof LimitError) fail(e.status, e.code, e.retryAfter ? { retryAfter: e.retryAfter } : null); throw e; }
  };

  /* ───────── reading helpers ───────── */
  async function ownerState(fam, acct, { required = true } = {}) {
    const g = await fam.ownedGroup(acct);
    if (!g) { if (required) fail(404, 'NO_FAMILY'); return null; }
    const raw = await fam.groupState(g.id);
    return { groupId: g.id, raw, state: v1State(raw) };
  }
  /* the caller's own ACTIVE membership, or the same answer as for an id that does not exist */
  async function myMembership(fam, acct, memberId) {
    const m = await fam.membership(memberId);
    if (!m || m.member_account_id !== acct || m.status !== 'ACTIVE') fail(403, 'ACCESS_DENIED');
    const raw = await fam.groupState(m.group_id);
    const state = v1State(raw);
    if (!activeMember(state, memberId)) fail(403, 'ACCESS_DENIED');
    return { membership: m, raw, state };
  }
  const invitationStatus = (inv, t) => (inv.status === 'PENDING' && !(inv.expires_at > t) ? 'EXPIRED' : inv.status);
  const INVITE_REFUSAL = { EXPIRED: 'INVITATION_EXPIRED', REVOKED: 'INVITATION_REVOKED', DECLINED: 'INVITATION_DECLINED', ACCEPTED: 'INVITATION_USED' };
  /* a code nobody holds gives one generic answer; a real code may say what happened to it (its holder knows it exists) */
  async function invitationFor(fam, acct, code) {
    const inv = await fam.invitationByHash(invitationHash(code));
    if (!inv) fail(404, 'INVITATION_NOT_FOUND');
    if (inv.owner_account_id === acct || inv.created_by === acct) fail(409, 'SELF_INVITATION');
    const status = invitationStatus(inv, now());
    if (status !== 'PENDING') fail(409, INVITE_REFUSAL[status] || 'INVITATION_NOT_FOUND');
    return inv;
  }
  const publicMember = (state, m) => ({ id: m.id, displayName: m.displayName, relationship: m.relationship, relationshipLabel: labelOf(RELATIONSHIPS, m.relationship), role: m.role, roleLabel: labelOf(MEMBER_ROLES, m.role), joinedAt: m.joinedAt, levels: levelsFor(state, m.id) });
  const publicInvitation = (i, t) => ({ id: i.id, displayName: i.display_name, relationship: i.relationship, role: i.role, status: invitationStatus(i, t), createdAt: i.created_at, expiresAt: i.expires_at });

  async function overview(fam, acct) {
    const t = now();
    const own = await ownerState(fam, acct, { required: false });
    const owner = own
      ? {
        members: own.state.members.filter((m) => m.status === 'ACTIVE').map((m) => publicMember(own.state, m)),
        invitations: (await fam.listInvitations(own.groupId)).map((i) => publicInvitation(i, t)),
        requests: own.state.requests.map(publicRequest).reverse(), /* newest first */
      }
      : { members: [], invitations: [], requests: [] };
    const memberships = (await fam.memberships(acct)).map((m) => ({ memberId: m.id, ownerLabel: m.owner_label, relationship: m.relationship, role: m.role, joinedAt: m.joined_at }));
    return { ok: true, mode: 'AUTHENTICATED_REMOTE_READY', owner, memberships };
  }

  /* ───────── operations ───────── */
  const OPS_IMPL = {
    async createInvitation(fam, acct, p) {
      shape(p, ['displayName', 'relationship', 'role', 'expiry']);
      const displayName = nameParam(p.displayName);
      if (!ids(RELATIONSHIPS).includes(p.relationship) || !ids(MEMBER_ROLES).includes(p.role)) fail(400, 'BAD_REQUEST');
      const expiry = INVITE_EXPIRY.find((e) => e.id === p.expiry) || fail(400, 'BAD_REQUEST');
      await limit('ongil-family-invite', acct, FAMILY_RATE.invite);
      const t = now();
      const g = await fam.ensureGroup(acct, { id: makeId('fg'), now: t });
      const raw = await fam.groupState(g.id);
      if (raw.members.filter((m) => m.status === 'ACTIVE').length >= FAMILY_LIMITS.members) fail(409, 'LIMIT_MEMBERS');
      const code = makeInvitationCode();
      const id = makeId('fi');
      const r = await fam.createInvitation({ id, groupId: g.id, createdBy: acct, tokenHash: invitationHash(code), displayName, relationship: p.relationship, role: p.role, expiresAt: t + expiry.ms, pendingLimit: FAMILY_LIMITS.pendingInvitations, now: t });
      if (!r.ok) fail(409, 'LIMIT_INVITATIONS');
      /* the code is in this one answer and nowhere else: not stored, not logged, not readable again */
      return { invitation: { id, displayName, relationship: p.relationship, role: p.role, status: 'PENDING', createdAt: t, expiresAt: t + expiry.ms }, code, formattedCode: formatInvitationCode(code) };
    },
    async revokeInvitation(fam, acct, p) {
      shape(p, ['invitationId']);
      const invitationId = idParam(p.invitationId, INVITE_ID_RE);
      const g = await fam.ownedGroup(acct);
      if (!g || !(await fam.revokeInvitation(g.id, invitationId, now()))) fail(404, 'INVITATION_NOT_FOUND');
      return {};
    },
    async inspectInvitation(fam, acct, p) {
      shape(p, ['code']);
      const code = codeParam(p.code);
      await limit('ongil-family-code', acct, FAMILY_RATE.code);
      const inv = await invitationFor(fam, acct, code);
      /* who invites is not named: the account holder's name is not stored anywhere. Shared data: none. */
      return { invitation: { status: 'PENDING', displayName: inv.display_name, relationship: inv.relationship, relationshipLabel: labelOf(RELATIONSHIPS, inv.relationship), role: inv.role, roleLabel: labelOf(MEMBER_ROLES, inv.role), expiresAt: inv.expires_at }, sharesNothingYet: true };
    },
    async acceptInvitation(fam, acct, p) {
      shape(p, ['code', 'ownerLabel']);
      const code = codeParam(p.code);
      const ownerLabel = nameParam(p.ownerLabel);
      await limit('ongil-family-code', acct, FAMILY_RATE.code);
      const inv = await invitationFor(fam, acct, code);
      if ((await fam.memberships(acct)).some((m) => m.group_id === inv.group_id)) fail(409, 'ALREADY_CONNECTED');
      const raw = await fam.groupState(inv.group_id);
      if (raw.members.filter((m) => m.status === 'ACTIVE').length >= FAMILY_LIMITS.members) fail(409, 'LIMIT_MEMBERS');
      let m;
      try { m = await fam.acceptInvitation({ hash: invitationHash(code), accountId: acct, memberId: makeId('fm'), ownerLabel, now: now(), memberLimit: FAMILY_LIMITS.members }); }
      catch (e) { if (e && e.sqlState === '23505') fail(409, 'ALREADY_CONNECTED'); throw e; }
      if (!m) {
        /* lost a race: say what the invitation is now (used by someone else, revoked, expired), never guess */
        await invitationFor(fam, acct, code);
        fail(409, 'CONFLICT');
      }
      return { membership: { memberId: m.id, ownerLabel: m.owner_label, relationship: m.relationship, role: m.role, joinedAt: m.joined_at }, sharesNothingYet: true };
    },
    async declineInvitation(fam, acct, p) {
      shape(p, ['code']);
      const code = codeParam(p.code);
      await limit('ongil-family-code', acct, FAMILY_RATE.code);
      await invitationFor(fam, acct, code);
      if (!(await fam.declineInvitation({ hash: invitationHash(code), accountId: acct, now: now() }))) { await invitationFor(fam, acct, code); fail(409, 'CONFLICT'); }
      return {};
    },
    /*
     * setPermissions { memberId, levels: { CATEGORY: 'NONE'|'SUMMARY'|'DETAIL' }, consents: [SENSITIVE_CATEGORY] }
     * V1 semantics: unnamed categories keep their level; everything is checked first and one refusal changes nothing;
     * a sensitive category needs the owner's consent in this very request unless a standing consent covers the level;
     * turning a sensitive category off withdraws its consent (it is never switched back on by itself).
     */
    async setPermissions(fam, acct, p) {
      shape(p, ['memberId', 'levels', 'consents'], ['memberId', 'levels']);
      const memberId = idParam(p.memberId, MEMBER_ID_RE);
      if (!isPlainObject(p.levels) || Object.keys(p.levels).length > SHARING_CATEGORIES.length) fail(400, 'BAD_REQUEST');
      const agreed = p.consents === undefined ? [] : p.consents;
      if (!Array.isArray(agreed) || agreed.length > SENSITIVE.length || agreed.some((c) => !SENSITIVE.includes(c))) fail(400, 'BAD_REQUEST');
      const own = await ownerState(fam, acct);
      const { state } = own;
      if (!activeMember(state, memberId)) fail(404, 'MEMBER_NOT_CONNECTED');
      const set = [], remove = [], grant = [], withdraw = [], needConsent = [];
      for (const [category, level] of Object.entries(p.levels)) {
        const verdict = canShare(state, ownerActor(state), memberId, category, level, { consent: agreed.includes(category) });
        if (!verdict.ok && verdict.reason === 'CONSENT_REQUIRED') { needConsent.push(category); continue; }
        if (!verdict.ok) fail(verdict.reason === 'MEMBER_NOT_CONNECTED' ? 404 : 400, ['INVALID_CATEGORY', 'INVALID_LEVEL', 'MEMBER_NOT_CONNECTED'].includes(verdict.reason) ? verdict.reason : 'NOT_ALLOWED', { category });
        if (effectiveLevel(state, memberId, category) === level) continue;
        const sensitive = sharingCategory(category).sensitive;
        if (level === 'NONE') { remove.push(category); if (sensitive) withdraw.push(category); continue; }
        set.push({ category, level });
        if (sensitive) {
          const standing = grantedConsent(state, memberId, category);
          if (!standing || levelRank(standing.level) < levelRank(level)) grant.push({ category, level });
        }
      }
      if (needConsent.length) fail(409, 'CONSENT_REQUIRED', { categories: needConsent });
      const changed = set.length + remove.length;
      if (changed && !(await fam.applySharing(own.groupId, memberId, { set, remove, grant, withdraw }, now()))) fail(404, 'MEMBER_NOT_CONNECTED');
      const after = v1State(await fam.groupState(own.groupId));
      return { changed, levels: levelsFor(after, memberId) };
    },
    async stopSharing(fam, acct, p) {
      shape(p, ['memberId']);
      const memberId = idParam(p.memberId, MEMBER_ID_RE);
      const g = await fam.ownedGroup(acct);
      if (!g || !(await fam.stopSharing(g.id, memberId, now()))) fail(404, 'MEMBER_NOT_CONNECTED');
      return {};
    },
    async stopAllSharing(fam, acct, p) {
      shape(p, []);
      const g = await fam.ownedGroup(acct);
      if (!g) fail(404, 'NO_FAMILY');
      await fam.stopAllSharing(g.id, now());
      return {};
    },
    /* 연결 해제 (owner): membership ends, permissions/consents/snapshots go, open requests are cancelled — one statement */
    async disconnect(fam, acct, p) {
      shape(p, ['memberId']);
      const memberId = idParam(p.memberId, MEMBER_ID_RE);
      const g = await fam.ownedGroup(acct);
      if (!g || !(await fam.endMembership(g.id, memberId, { status: 'DISCONNECTED', actor: 'OWNER', now: now() }))) fail(404, 'MEMBER_NOT_CONNECTED');
      return {};
    },
    /* 연결 끝내기 (member): the same cut, started by the member */
    async leave(fam, acct, p) {
      shape(p, ['memberId']);
      const memberId = idParam(p.memberId, MEMBER_ID_RE);
      const { membership } = await myMembership(fam, acct, memberId);
      if (!(await fam.endMembership(membership.group_id, memberId, { status: 'LEFT', actor: 'MEMBER', now: now() }))) fail(403, 'ACCESS_DENIED');
      return {};
    },
    /*
     * publishSnapshot { memberId, items: [{ category, level, lines: [text] }] } — the owner's device sends the short lines it
     * built for one member (V1 readers). The server keeps an item only if that member may see that category at exactly
     * that level right now; everything else is dropped, and the member's earlier lines are replaced as a whole.
     */
    async publishSnapshot(fam, acct, p) {
      shape(p, ['memberId', 'items']);
      const memberId = idParam(p.memberId, MEMBER_ID_RE);
      if (!Array.isArray(p.items) || p.items.length > SHARING_CATEGORIES.length) fail(400, 'BAD_REQUEST');
      const own = await ownerState(fam, acct);
      if (!activeMember(own.state, memberId)) fail(404, 'MEMBER_NOT_CONNECTED');
      const seen = new Set(), keep = [];
      let dropped = 0;
      for (const it of p.items) {
        shape(it, ['category', 'level', 'lines']);
        if (typeof it.category !== 'string' || seen.has(it.category)) fail(400, 'BAD_REQUEST');
        seen.add(it.category);
        if (!Array.isArray(it.lines) || it.lines.length < 1 || it.lines.length > 10 || it.lines.some((l) => typeof l !== 'string' || l.length > 1000)) fail(400, 'BAD_REQUEST');
        const lines = it.lines.map((l) => safeText(l, SNAPSHOT_LINE_MAX)).filter(Boolean);
        const allowed = it.category !== 'HELP_REQUEST' && levelAllowed(it.category, it.level) && it.level !== 'NONE' && effectiveLevel(own.state, memberId, it.category) === it.level;
        if (!allowed || !lines.length || Buffer.byteLength(JSON.stringify(lines)) > SNAPSHOT_BYTES_MAX) { dropped += 1; continue; }
        keep.push({ category: it.category, level: it.level, lines });
      }
      if (!(await fam.publishSnapshot(own.groupId, memberId, keep, now()))) fail(404, 'MEMBER_NOT_CONNECTED');
      return { published: keep.length, dropped };
    },
    /* viewShared { memberId } — what the owner lets THIS member see, re-filtered by the permissions in force now */
    async viewShared(fam, acct, p) {
      shape(p, ['memberId']);
      const memberId = idParam(p.memberId, MEMBER_ID_RE);
      const { membership, state } = await myMembership(fam, acct, memberId);
      const levels = levelsFor(state, memberId);
      const items = [];
      for (const s of await fam.snapshots(memberId)) {
        const c = sharingCategory(s.category);
        if (!c || s.category === 'HELP_REQUEST' || levels[s.category] === 'NONE' || levels[s.category] !== s.level) continue;
        items.push({ category: s.category, label: c.label, level: s.level, levelLabel: LEVEL_LABELS[s.level], lines: s.lines.map((l) => safeText(String(l), SNAPSHOT_LINE_MAX)).filter(Boolean), publishedAt: s.published_at });
      }
      items.sort((a, b) => SHARING_CATEGORIES.findIndex((c) => c.id === a.category) - SHARING_CATEGORIES.findIndex((c) => c.id === b.category));
      const requests = levels.HELP_REQUEST === 'DETAIL' ? state.requests.filter((r) => r.memberId === memberId && r.status !== 'CANCELLED').map(publicRequest) : [];
      return { shared: { memberId, ownerLabel: membership.owner_label, items, requests, empty: !items.length && !requests.length } };
    },
    async requestHelp(fam, acct, p) {
      shape(p, ['memberId', 'kind', 'message'], ['memberId', 'kind']);
      const memberId = idParam(p.memberId, MEMBER_ID_RE);
      if (p.message !== undefined && (typeof p.message !== 'string' || p.message.length > 2000)) fail(400, 'BAD_REQUEST');
      await limit('ongil-family-help', acct, FAMILY_RATE.help);
      const own = await ownerState(fam, acct);
      const { state } = own;
      const m = activeMember(state, memberId);
      if (!m) fail(404, 'MEMBER_NOT_CONNECTED');
      if (effectiveLevel(state, memberId, 'HELP_REQUEST') !== 'DETAIL') fail(409, 'SHARING_OFF');
      if (state.requests.filter((r) => OPEN_HELP.includes(r.status)).length >= HELP_OPEN_LIMIT) fail(409, 'LIMIT_HELP');
      const t = now();
      let request;
      try {
        request = normalizeRequest({ id: makeId('fr'), familyGroupId: state.group.id, ownerUserId: state.group.ownerUserId, memberId, memberUserId: m.memberUserId, kind: p.kind, message: p.message || '', status: 'REQUESTED', createdAt: t, updatedAt: t }, t);
      } catch (e) { fail(400, e && e.code === 'INVALID_MESSAGE' ? 'INVALID_MESSAGE' : 'INVALID_KIND'); }
      if (!(await fam.createHelp({ id: request.id, groupId: own.groupId, memberId, kind: request.kind, message: request.message, now: t }))) fail(404, 'MEMBER_NOT_CONNECTED');
      return { request: publicRequest({ id: request.id, memberId, kind: request.kind, message: request.message, status: 'REQUESTED', createdAt: t, updatedAt: t }) };
    },
    /* moveHelp { requestId, to } — the owner (cancel / complete) or the member it was sent to (seen / accept / complete) */
    async moveHelp(fam, acct, p) {
      shape(p, ['requestId', 'to']);
      const requestId = idParam(p.requestId, REQUEST_ID_RE);
      if (typeof p.to !== 'string') fail(400, 'BAD_REQUEST');
      const h = await fam.help(requestId);
      if (!h) fail(404, 'NOT_FOUND');
      const owned = await fam.ownedGroup(acct);
      let who = null, state = null;
      if (owned && owned.id === h.group_id) { who = 'OWNER'; state = v1State(await fam.groupState(h.group_id)); }
      else {
        const m = await fam.membership(h.member_id);
        if (m && m.member_account_id === acct && m.status === 'ACTIVE') { who = 'MEMBER'; state = v1State(await fam.groupState(h.group_id)); }
      }
      if (!who) fail(404, 'NOT_FOUND');
      const r = state.requests.find((x) => x.id === requestId);
      if (!r) fail(404, 'NOT_FOUND');
      const allowed = who === 'OWNER' ? canOwnerMoveHelpRequest(state, ownerActor(state), r, p.to) : canRespondHelpRequest(state, h.member_id, r, p.to);
      if (!allowed) fail(who === 'MEMBER' && effectiveLevel(state, h.member_id, 'HELP_REQUEST') !== 'DETAIL' ? 404 : 409, who === 'MEMBER' && effectiveLevel(state, h.member_id, 'HELP_REQUEST') !== 'DETAIL' ? 'NOT_FOUND' : 'NOT_ALLOWED');
      const t = now();
      if (!(await fam.moveHelp(requestId, r.status, p.to, who, t))) fail(409, 'CONFLICT');
      return { request: publicRequest({ ...r, status: p.to, updatedAt: t }) };
    },
    async activity(fam, acct, p) {
      shape(p, ['limit'], []);
      if (p.limit !== undefined && (!Number.isInteger(p.limit) || p.limit < 1 || p.limit > 200)) fail(400, 'BAD_REQUEST');
      const own = await ownerState(fam, acct, { required: false });
      if (!own) return { activity: [] };
      const names = new Map(own.state.members.map((m) => [m.id, m.displayName]));
      const rows = await fam.activity(own.groupId, p.limit || 50);
      return { activity: rows.map((a) => ({ at: a.created_at, action: a.action, label: ACTION_LABELS[a.action] || '', actor: a.actor, memberId: a.member_id || '', memberName: names.get(a.member_id) || '', category: a.category || '', categoryLabel: a.category && sharingCategory(a.category) ? sharingCategory(a.category).label : '', status: a.status || '' })) };
    },
  };

  async function handle(req, res, ctx) {
    let cors;
    try { cors = applyCors(req, res, env, { methods: ['GET', 'POST'], allowHeaders: ['content-type', 'authorization'] }); }
    catch (e) { if (e instanceof CorsError) fail(403, 'ORIGIN_NOT_ALLOWED'); throw e; }
    if (cors.preflight) { res.statusCode = 204; res.setHeader('Cache-Control', 'no-store'); res.end(); return { status: 204, code: 'PREFLIGHT' }; }
    if (req.method !== 'GET' && req.method !== 'POST') { res.setHeader('Allow', 'GET, POST, OPTIONS'); fail(405, 'METHOD_NOT_ALLOWED'); }
    const url = new URL(req.url || '/', 'http://local');
    const keys = [...url.searchParams.keys()];
    if (req.method === 'GET' && keys.length === 1 && url.searchParams.get('op') === 'status') {
      /* answers before any switch: it says which switches are on, as booleans, and nothing else */
      ctx.op = 'status';
      json(res, 200, { ok: true, ...familyStatus(env) });
      return { status: 200, code: 'STATUS' };
    }
    if (!cfg.enabled) fail(503, 'FAMILY_NOT_AVAILABLE');
    const stores = await getStores();
    if (!stores) fail(503, 'SERVER_NOT_CONFIGURED');
    if (!tokenVerifier.enabled) fail(503, 'AUTH_NOT_CONFIGURED');
    const raw = Array.isArray(req.rawHeaders) ? req.rawHeaders : [];
    if (raw.filter((h, i) => i % 2 === 0 && String(h).toLowerCase() === 'authorization').length > 1) fail(400, 'MALFORMED_TOKEN');
    const declared = Number(req.headers && req.headers['content-length']);
    if (req.method === 'POST' && Number.isFinite(declared) && declared > BODY_MAX) fail(413, 'PAYLOAD_TOO_LARGE');
    let session;
    try { session = await tokenVerifier.verify(req.headers || {}, { url: req.url || '/' }); }
    catch (e) { if (e instanceof AuthError) fail(e.status, e.code); fail(401, 'INVALID_TOKEN'); }
    const acct = await account(session, stores.acc);
    await limit('ongil-family', acct, FAMILY_RATE.general);
    if (req.method === 'GET') {
      if (keys.length) fail(400, 'BAD_REQUEST');
      json(res, 200, await overview(stores.fam, acct));
      return { status: 200, code: 'OVERVIEW' };
    }
    if (keys.length) fail(400, 'BAD_REQUEST');
    if (!String((req.headers && req.headers['content-type']) || '').toLowerCase().startsWith('application/json')) fail(415, 'UNSUPPORTED_MEDIA_TYPE');
    const body = await readBody(req);
    if (!isPlainObject(body) || Object.keys(body).some((k) => k !== 'op' && k !== 'payload') || typeof body.op !== 'string') fail(400, 'BAD_REQUEST');
    if (!OPS.includes(body.op)) fail(400, 'UNSUPPORTED_OP');
    ctx.op = body.op;
    const out = await OPS_IMPL[body.op](stores.fam, acct, body.payload === undefined ? {} : body.payload);
    json(res, 200, { ok: true, ...out });
    return { status: 200, code: body.op.replace(/[A-Z]/g, (c) => '_' + c).toUpperCase() };
  }

  const handler = async (req, res) => {
    const t0 = now(), rid = randomBytes(6).toString('hex');
    const ctx = { op: '' };
    res.setHeader('X-Request-Id', rid);
    let outcome;
    try { outcome = await handle(req, res, ctx); }
    catch (error) {
      const safe = error instanceof FamilyError ? error : (error && error.sqlState === '23505' ? new FamilyError(409, 'CONFLICT') : new FamilyError(503, 'STORE_UNAVAILABLE'));
      if (safe.retryAfter) res.setHeader('Retry-After', String(safe.retryAfter));
      if (safe.status === 401) res.setHeader('WWW-Authenticate', 'Bearer');
      const extra = safe.extra && Array.isArray(safe.extra.categories) ? { categories: safe.extra.categories } : safe.extra && safe.extra.category ? { category: safe.extra.category } : {};
      json(res, safe.status, { ok: false, code: safe.code, error: TEXT[safe.code] || TEXT.SERVER_ERROR, ...extra });
      outcome = { status: safe.status, code: safe.code };
    }
    emit({ rid, route: 'ongil-family', method: req.method, op: OPS.includes(ctx.op) || ctx.op === 'status' ? ctx.op : '', status: outcome.status, code: outcome.code, ms: Math.max(0, now() - t0) });
  };
  handler.status = () => familyStatus(env);
  return handler;
}
