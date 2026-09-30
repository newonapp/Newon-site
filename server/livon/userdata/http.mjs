/*
 * LIVON user data API V1 — /api/livon/userdata (Newon+ account sync).
 *
 *   GET  /api/livon/userdata?since=<serverRev>&limit=<n>[&collection=<c>]   pull changes (records with serverRev > since)
 *   POST /api/livon/userdata  {op:"batch",   payload:{records:[…≤500], sensitive?:true}}   optimistic per-record writes
 *   POST /api/livon/userdata  {op:"syncMeta", payload:{}}                                  → {serverRev}
 *   POST /api/livon/userdata  {op:"device",   payload:{deviceId,lastServerRev,conflicts,importDecided}}
 *   OPTIONS                                                                                CORS preflight (allowlisted origins)
 *   Deletion = a tombstone record (deletedAt set, data null) in a batch — rows are never hard-deleted by sync.
 *
 * Order of checks (fail closed at every step, before any database work):
 *   CORS/origin → method → LIVON_USERDATA_ENABLED → database configured → verifier configured → token in URL rejected →
 *   Authorization: Bearer <Firebase ID token> verified (signature, iss, aud, exp, iat, auth_time, sub) → issuer is the Newon+
 *   project (HQ / OX / any other project refused) → (issuer, subject) → account_refs → internal accountId (created on first use
 *   for the primary Newon+ issuer only) → per-account rate limit → payload validation (same rules as the browser) → store.
 *
 * The owner of every read/write is the server-resolved accountId. A client-sent userId/ownerId/accountId is rejected.
 * Logs: request id, route, status, latency, fixed code — never tokens, headers, bodies or user content.
 */
import { randomBytes } from 'node:crypto';
import { json } from '../http.mjs';
import { applyCors, CorsError, isProductionEnv } from '../cors.mjs';
import { limitBuckets, LimitError } from '../ratelimit.mjs';
import { createTokenVerifier, configFromEnv as authConfigFromEnv, issuerFor, AuthError } from '../../newon/auth/verify.mjs';
import { createFirebaseSignatureVerifier, createCertStore } from '../../newon/auth/firebase-verifier.mjs';
import { ADMIN_ISSUERS } from '../../newon/auth/accounts.mjs';
import { createPostgresStore, postgresQueryFromEnv, databaseConfig, PULL_MAX } from './store.mjs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
require('../../../livon/data/livon-user-data.js');
const UD = globalThis.LivonUserData;

export const BODY_MAX = UD.LIMITS.maxBatchBytes + 4096;
export const USERDATA_RATE_DEFAULTS = Object.freeze({ minute: [60, 60], day: [3000, 86400] });
const SUBJECT_RE = /^[A-Za-z0-9_-]{6,128}$/;
const TEXT = {
  SYNC_NOT_AVAILABLE: '계정 동기화가 아직 켜져 있지 않습니다.', SERVER_NOT_CONFIGURED: '계정 저장소가 아직 연결되지 않았습니다.',
  AUTH_NOT_CONFIGURED: '계정 인증이 아직 연결되지 않았습니다.', NO_TOKEN: '로그인이 필요합니다.', MALFORMED_TOKEN: '로그인 정보가 올바르지 않습니다.',
  INVALID_TOKEN: '로그인이 만료되었거나 올바르지 않습니다.', TOKEN_EXPIRED: '로그인이 만료되었습니다. 다시 로그인해 주세요.', TOKEN_IN_URL: '요청 형식이 올바르지 않습니다.',
  ISSUER_NOT_ALLOWED: '이 계정으로는 사용할 수 없습니다.', ADMIN_IDENTITY_NOT_ALLOWED: '이 계정으로는 사용할 수 없습니다.', ACCOUNT_DISABLED: '사용할 수 없는 계정입니다.',
  ORIGIN_NOT_ALLOWED: '허용되지 않은 요청입니다.', METHOD_NOT_ALLOWED: '허용되지 않은 요청입니다.', UNSUPPORTED_MEDIA_TYPE: '요청 형식이 올바르지 않습니다.',
  BAD_REQUEST: '요청 형식이 올바르지 않습니다.', INVALID_PAYLOAD: '저장할 수 없는 데이터가 포함되어 있습니다.', PAYLOAD_TOO_LARGE: '한 번에 보낼 수 있는 양을 넘었습니다.',
  UNSUPPORTED_OP: '지원하지 않는 요청입니다.', RATE_LIMIT: '요청이 많습니다. 잠시 후 다시 시도해 주세요.', PROTECTION_NOT_CONFIGURED: '서버 보호 설정이 완료되지 않았습니다.',
  PROTECTION_UNAVAILABLE: '잠시 후 다시 시도해 주세요.', INVALID_SERVER_CONFIG: '서버 설정을 확인해야 합니다.', STORE_UNAVAILABLE: '계정 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  SERVER_ERROR: '요청을 처리하지 못했습니다.'
};
export class UserDataError extends Error {
  constructor(status, code, retryAfter) { super(code); this.status = status; this.code = code; this.retryAfter = retryAfter; }
}

function capFrom(env, name, fallback, max) {
  if (env[name] === undefined || env[name] === '') return fallback;
  const n = Number(env[name]);
  if (!Number.isInteger(n) || n < 1 || n > max) throw new UserDataError(503, 'INVALID_SERVER_CONFIG');
  return n;
}
export function userdataCaps(env = {}) {
  return [[capFrom(env, 'LIVON_USERDATA_MINUTE_LIMIT', USERDATA_RATE_DEFAULTS.minute[0], 600), 60], [capFrom(env, 'LIVON_USERDATA_DAILY_LIMIT', USERDATA_RATE_DEFAULTS.day[0], 100000), 86400]];
}
/* runtime switch: the route answers only when explicitly enabled AND a database AND a token verifier are configured */
export function userdataStatus(env = {}) {
  const auth = authConfigFromEnv(env);
  return { enabled: env.LIVON_USERDATA_ENABLED === 'true', database: databaseConfig(env).ok, auth: auth.enabled };
}

function readBody(req) {
  if (req.body != null) {
    if (typeof req.body === 'object' && !(req.body instanceof Uint8Array)) return Promise.resolve(req.body);
    const s = String(req.body);
    if (s.length > BODY_MAX) return Promise.reject(new UserDataError(413, 'PAYLOAD_TOO_LARGE'));
    try { return Promise.resolve(JSON.parse(s)); } catch { return Promise.reject(new UserDataError(400, 'BAD_REQUEST')); }
  }
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    const timer = setTimeout(() => reject(new UserDataError(400, 'BAD_REQUEST')), 5000);
    req.on('data', c => { size += c.length; if (size > BODY_MAX) { clearTimeout(timer); reject(new UserDataError(413, 'PAYLOAD_TOO_LARGE')); if (req.destroy) req.destroy(); } else chunks.push(c); });
    req.on('end', () => { clearTimeout(timer); try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null')); } catch { reject(new UserDataError(400, 'BAD_REQUEST')); } });
    req.on('error', () => { clearTimeout(timer); reject(new UserDataError(400, 'BAD_REQUEST')); });
  });
}

/*
 * createUserDataHandler({ env, store, verifier, fetcher, now, log })
 *   store     defaults to the PostgreSQL store from LIVON_DATABASE_URL (null → 503 SERVER_NOT_CONFIGURED)
 *   verifier  defaults to createTokenVerifier + Google-certificate signature check (disabled → 503 AUTH_NOT_CONFIGURED)
 *   Tests inject an in-memory store and a verifier with a throwaway signing key; the checks and the flow are the same.
 */
export function createUserDataHandler({ env = process.env, store, verifier, fetcher = fetch, now = () => Date.now(), log = null, limiter = limitBuckets } = {}) {
  const emit = log || ((entry) => { if (!isProductionEnv(env)) console.warn('[LIVON USERDATA]', JSON.stringify(entry)); });
  const cfg = userdataStatus(env);
  const authCfg = authConfigFromEnv(env);
  const primaryIssuer = authCfg.projectId ? issuerFor(authCfg.projectId) : '';
  const tokenVerifier = verifier || createTokenVerifier({ env, verifySignature: createFirebaseSignatureVerifier({ certs: createCertStore({ fetcher, now }) }), now });
  let storePromise = null;
  const getStore = () => {
    if (store !== undefined) return Promise.resolve(store);
    if (!storePromise) storePromise = postgresQueryFromEnv(env).then(q => (q ? createPostgresStore({ query: q }) : null));
    return storePromise;
  };

  async function account(session) {
    if (!session || session.verified !== true || typeof session.issuer !== 'string' || !SUBJECT_RE.test(String(session.subject || ''))) throw new UserDataError(401, 'INVALID_TOKEN');
    if (ADMIN_ISSUERS.includes(session.issuer)) throw new UserDataError(403, 'ADMIN_IDENTITY_NOT_ALLOWED');
    if (!authCfg.allowedIssuers.includes(session.issuer)) throw new UserDataError(403, 'ISSUER_NOT_ALLOWED');
    const s = await getStore();
    let acct = await s.findAccount({ issuer: session.issuer, subject: session.subject });
    if (!acct) {
      /* only the primary Newon+ issuer may open a new account; other app identities need explicit linking first */
      if (session.issuer !== primaryIssuer) throw new UserDataError(403, 'ISSUER_NOT_ALLOWED');
      const c = await s.createAccount({ issuer: session.issuer, subject: session.subject }, { now: now() });
      acct = { accountId: c.accountId, status: 'active' };
    }
    if (acct.status !== 'active') throw new UserDataError(403, 'ACCOUNT_DISABLED');
    return acct.accountId;
  }

  async function handle(req, res, rid) {
    let cors;
    try { cors = applyCors(req, res, env, { methods: ['GET', 'POST'], allowHeaders: ['content-type', 'authorization'] }); }
    catch (e) { if (e instanceof CorsError) throw new UserDataError(403, 'ORIGIN_NOT_ALLOWED'); throw e; }
    if (cors.preflight) { res.statusCode = 204; res.setHeader('Cache-Control', 'no-store'); res.end(); return { status: 204, code: 'PREFLIGHT' }; }
    if (req.method !== 'GET' && req.method !== 'POST') { res.setHeader('Allow', 'GET, POST, OPTIONS'); throw new UserDataError(405, 'METHOD_NOT_ALLOWED'); }
    if (!cfg.enabled) throw new UserDataError(503, 'SYNC_NOT_AVAILABLE');
    const s = await getStore();
    if (!s) throw new UserDataError(503, 'SERVER_NOT_CONFIGURED');
    if (!tokenVerifier.enabled) throw new UserDataError(503, 'AUTH_NOT_CONFIGURED');
    /* Node keeps only the first of repeated Authorization headers: an ambiguous request is refused, not guessed */
    const raw = Array.isArray(req.rawHeaders) ? req.rawHeaders : [];
    if (raw.filter((h, i) => i % 2 === 0 && String(h).toLowerCase() === 'authorization').length > 1) throw new UserDataError(400, 'MALFORMED_TOKEN');
    /* declared size over the limit → 413 before any token or body work */
    const declared = Number(req.headers && req.headers['content-length']);
    if (req.method === 'POST' && Number.isFinite(declared) && declared > BODY_MAX) throw new UserDataError(413, 'PAYLOAD_TOO_LARGE');
    let session;
    try { session = await tokenVerifier.verify(req.headers || {}, { url: req.url || '/' }); }
    catch (e) { if (e instanceof AuthError) throw new UserDataError(e.status, e.code); throw new UserDataError(401, 'INVALID_TOKEN'); }
    const accountId = await account(session);
    try { await limiter({ scope: 'userdata', identity: accountId, caps: userdataCaps(env), env, fetcher, now }); }
    catch (e) { if (e instanceof LimitError || e instanceof UserDataError) throw new UserDataError(e.status, e.code, e.retryAfter); throw e; }

    if (req.method === 'GET') {
      const url = new URL(req.url || '/', 'http://local');
      const keys = [...url.searchParams.keys()];
      if (keys.some(k => !['since', 'limit', 'collection'].includes(k)) || new Set(keys).size !== keys.length) throw new UserDataError(400, 'BAD_REQUEST');
      const since = url.searchParams.get('since'), limit = url.searchParams.get('limit'), collection = url.searchParams.get('collection');
      if (since != null && !/^\d{1,15}$/.test(since)) throw new UserDataError(400, 'BAD_REQUEST');
      if (limit != null && !/^\d{1,4}$/.test(limit)) throw new UserDataError(400, 'BAD_REQUEST');
      if (collection != null && !UD.isCollection(collection)) throw new UserDataError(400, 'BAD_REQUEST');
      const out = await s.pull(accountId, { since: Number(since || 0), limit: Math.min(Number(limit || PULL_MAX), PULL_MAX) || PULL_MAX, collection: collection || null });
      json(res, 200, { ok: true, ...out });
      return { status: 200, code: 'PULL' };
    }

    if (!String((req.headers && req.headers['content-type']) || '').toLowerCase().startsWith('application/json')) throw new UserDataError(415, 'UNSUPPORTED_MEDIA_TYPE');
    const body = await readBody(req);
    const check = UD.validateSyncRequest(body);
    if (!check.ok) throw new UserDataError(check.reason === 'payload:too-large' ? 413 : 400, check.reason === 'payload:too-large' ? 'PAYLOAD_TOO_LARGE' : 'INVALID_PAYLOAD');
    const { op, payload } = check.value;
    if (op === 'syncMeta') { json(res, 200, { ok: true, serverRev: await s.serverRev(accountId) }); return { status: 200, code: 'META' }; }
    if (op === 'device') {
      await s.touchDevice(accountId, payload.deviceId, { lastServerRev: payload.lastServerRev, conflicts: payload.conflicts || 0, importDecided: payload.importDecided === true, now: now() });
      json(res, 200, { ok: true }); return { status: 200, code: 'DEVICE' };
    }
    if (op !== 'batch') throw new UserDataError(400, 'UNSUPPORTED_OP');
    const results = [];
    for (const r of payload.records) {
      const sensitive = UD.SENSITIVE_COLLECTIONS.indexOf(r.collection) >= 0;
      if (sensitive && payload.sensitive !== true) { results.push({ id: r.id, collection: r.collection, status: 'rejected', code: 'SENSITIVE_CONSENT_REQUIRED' }); continue; }
      const w = await s.write(accountId, r, { sensitive });
      results.push(w.status === 'applied' ? { id: r.id, collection: r.collection, status: 'applied', serverRev: w.serverRev }
        : { id: r.id, collection: r.collection, status: 'conflict', current: w.current });
    }
    json(res, 200, { ok: true, serverRev: await s.serverRev(accountId), results });
    return { status: 200, code: 'BATCH' };
  }

  const handler = async (req, res) => {
    const t0 = now(), rid = randomBytes(6).toString('hex');
    res.setHeader('X-Request-Id', rid);
    let outcome;
    try { outcome = await handle(req, res, rid); }
    catch (error) {
      const safe = error instanceof UserDataError ? error : (error && error.code === 'UNKNOWN_COLLECTION' ? new UserDataError(400, 'INVALID_PAYLOAD') : new UserDataError(503, 'STORE_UNAVAILABLE'));
      if (safe.retryAfter) res.setHeader('Retry-After', String(safe.retryAfter));
      if (safe.status === 401) res.setHeader('WWW-Authenticate', 'Bearer');
      json(res, safe.status, { ok: false, code: safe.code, error: TEXT[safe.code] || TEXT.SERVER_ERROR });
      outcome = { status: safe.status, code: safe.code };
    }
    emit({ rid, route: 'userdata', method: req.method, status: outcome.status, code: outcome.code, ms: Math.max(0, now() - t0) });
  };
  handler.status = () => ({ ...cfg });
  return handler;
}
