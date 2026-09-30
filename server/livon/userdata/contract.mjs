/*
 * LIVON account data — server-side validation contract (pure; no I/O).
 *
 * The routed API is server/livon/userdata/http.mjs (/api/livon/userdata, Account Backend & Sync V1). Its runtime switch is the
 * environment (LIVON_USERDATA_ENABLED=true + LIVON_DATABASE_URL + Newon+ token verification); ENDPOINT_ENABLED below stays the
 * code default (false) for callers of prepareSyncRequest that do not pass `enabled`. The rules here and in http.mjs are the same
 * browser rules (LivonUserData.validateSyncRequest):
 *
 *   identity      from the server's own verified token only: (issuer, subject) → account_refs → accountId.
 *                 A client-supplied userId/ownerId is rejected; tokens from issuers outside allowedIssuers are rejected.
 *   authorization every stored row is keyed by (accountId, collection, id); a request can never name another owner
 *   validation    the same rules as the browser (livon/data/livon-user-data.js): known collections, safe ids, bounded sizes,
 *                 no prototype-polluting keys, no unknown record fields (mass assignment), plain JSON only, safe text
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
require('../../../livon/data/livon-user-data.js');
const UD = globalThis.LivonUserData;

export const ENDPOINT_ENABLED = false;             /* code default; the live route is switched by env (docs/newon/newon-plus-account-backend.md) */
export const LIMITS = UD.LIMITS;
export const COLLECTIONS = UD.COLLECTIONS;

export class SyncError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}

/*
 * Verified session — produced ONLY by the server's token verifier (never from the request body, query or client headers):
 *   { verified: true, issuer, subject, accountId }
 *     issuer    token issuer, e.g. "https://securetoken.google.com/<firebase-project-id>" for a Firebase ID token
 *     subject   token subject (Firebase uid). Unique only WITHIN one issuer — two Firebase projects can issue the same uid
 *     accountId LIVON's own account_refs.id, resolved by the server from (issuer, subject); rows are owned by this id
 * allowedIssuers: the issuers LIVON accepts (the Newon+ identity project[s]). A token minted for another app's project
 * is rejected even though its signature is valid (cross-app token misuse).
 */
const ISSUER_RE = /^https:\/\/[a-z0-9.-]+(\/[A-Za-z0-9._-]+)*$/;
const SUBJECT_RE = /^[A-Za-z0-9_-]{6,128}$/;
export function accountRefKey(session) { return session.issuer + '|' + session.subject; }
export function resolveOwner(session, { allowedIssuers = [] } = {}) {
  if (!session || session.verified !== true) throw new SyncError(401, 'NO_SESSION');
  if (typeof session.issuer !== 'string' || !ISSUER_RE.test(session.issuer) || typeof session.subject !== 'string' || !SUBJECT_RE.test(session.subject)) throw new SyncError(401, 'NO_SESSION');
  if (!allowedIssuers.includes(session.issuer)) throw new SyncError(403, 'ISSUER_NOT_ALLOWED');
  if (typeof session.accountId !== 'string' || !SUBJECT_RE.test(session.accountId.replace(/-/g, '_'))) throw new SyncError(403, 'ACCOUNT_NOT_LINKED');
  return session.accountId;
}
export function authorize(session, opts = {}) {
  if (!(opts.enabled ?? ENDPOINT_ENABLED)) throw new SyncError(503, 'SYNC_NOT_AVAILABLE');
  return resolveOwner(session, opts);
}

/* body → normalized rows owned by the resolved account (throws SyncError on any violation) */
export function prepareSyncRequest(body, session, { enabled = ENDPOINT_ENABLED, allowedIssuers = [] } = {}) {
  if (!enabled) throw new SyncError(503, 'SYNC_NOT_AVAILABLE');
  const owner = resolveOwner(session, { allowedIssuers });
  const check = UD.validateSyncRequest(body);
  if (!check.ok) throw new SyncError(400, 'INVALID_PAYLOAD');
  const v = check.value;
  if (v.op !== 'batch') return { owner, op: v.op, payload: v.payload };
  return {
    owner,
    op: 'batch',
    rows: v.payload.records.map(r => ({
      owner_id: owner, collection: r.collection, record_id: r.id, schema_version: r.schemaVersion,
      created_at: new Date(r.createdAt).toISOString(), updated_at: new Date(r.updatedAt).toISOString(),
      deleted_at: r.deletedAt ? new Date(r.deletedAt).toISOString() : null, device_rev: Number(r.localRev) || 0,
      data: r.deletedAt ? null : r.data
    }))
  };
}
