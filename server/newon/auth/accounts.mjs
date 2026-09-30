/*
 * Newon+ account mapping and account-linking CONTRACT (no database, no endpoint in V1).
 *
 * Identity model
 *   verified identity (issuer, subject)  →  account_refs row  →  internal accountId (opaque, never the Firebase uid)
 *   - A Firebase uid is unique only inside its own project. Newon+ (consumer project), OX MONTH (newon-oxmonth) and any other
 *     app project can issue the same uid for different people, so (issuer, subject) is the only safe key.
 *   - Email is NOT an identity: an equal email never merges or links accounts.
 *   - HQ admin identities (newon-hq) are a separate security domain and are never mapped to consumer accounts.
 *
 * Linking (future): a user proves BOTH identities in the same flow (fresh sign-in / re-authentication on each side), then
 * explicitly confirms. Collisions (the other identity already belongs to a different account) are refused, not merged.
 * App data is linked separately, per app, after the account link — nothing is copied automatically.
 */
import { randomUUID } from 'node:crypto';

export const ADMIN_ISSUERS = Object.freeze(['https://securetoken.google.com/newon-hq']);
export const REAUTH_MAX_AGE_SEC = 5 * 60;          /* both proofs must come from a sign-in within the last 5 minutes */

export class AccountError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
function assertIdentity(id) {
  if (!id || id.verified !== true || typeof id.issuer !== 'string' || typeof id.subject !== 'string' || !id.issuer || !id.subject) throw new AccountError(401, 'NOT_VERIFIED');
  if (ADMIN_ISSUERS.includes(id.issuer)) throw new AccountError(403, 'ADMIN_IDENTITY_NOT_ALLOWED');
  for (const k of ['email', 'emailVerified', 'userId', 'accountId']) if (k in id) throw new AccountError(400, 'UNEXPECTED_IDENTITY_FIELD');
}
export function refKey(id) { return id.issuer + '|' + id.subject; }

/*
 * Repository contract (a DB implementation replaces this; the in-memory one exists for tests only and is never exported
 * to a route): find(issuer, subject) · create(issuer, subject) · linkedTo(issuer, subject) · addLink(accountId, issuer, subject)
 */
export function createMemoryAccountRefs() {
  const refs = new Map();   /* refKey → { accountId, issuer, subject, createdAt, primary } */
  return {
    kind: 'memory',
    find(issuer, subject) { return refs.get(issuer + '|' + subject) || null; },
    create(issuer, subject, now = Date.now()) {
      const k = issuer + '|' + subject;
      if (refs.has(k)) return refs.get(k);
      const row = { accountId: 'acct_' + randomUUID().replace(/-/g, ''), issuer, subject, createdAt: now, primary: true };
      refs.set(k, row); return row;
    },
    addLink(accountId, issuer, subject, now = Date.now()) {
      const k = issuer + '|' + subject;
      if (refs.has(k)) throw new AccountError(409, 'LINK_COLLISION');
      const row = { accountId, issuer, subject, createdAt: now, primary: false };
      refs.set(k, row); return row;
    },
    count() { return refs.size; }
  };
}

/* verified identity → internal accountId. Creates a ref only for the primary Newon+ issuer (allowedPrimaryIssuers). */
export function resolveAccount(identity, repo, { allowedPrimaryIssuers = [], create = false } = {}) {
  assertIdentity(identity);
  const found = repo.find(identity.issuer, identity.subject);
  if (found) return { accountId: found.accountId, created: false };
  if (!create) throw new AccountError(403, 'ACCOUNT_NOT_LINKED');
  if (!allowedPrimaryIssuers.includes(identity.issuer)) throw new AccountError(403, 'ISSUER_NOT_PRIMARY');   /* e.g. an OX uid cannot start a Newon+ account by itself */
  return { accountId: repo.create(identity.issuer, identity.subject).accountId, created: true };
}

/*
 * planAccountLink({ primary, secondary, userConfirmed }, repo, { nowSec, allowedPrimaryIssuers, linkableIssuers })
 *   primary   = verified Newon+ identity (fresh)          secondary = verified app identity, e.g. newon-oxmonth (fresh)
 * Returns the link to write (the caller persists it in a transaction). Never merges by email; refuses collisions.
 */
export function planAccountLink({ primary, secondary, userConfirmed } = {}, repo, { nowSec = Math.floor(Date.now() / 1000), allowedPrimaryIssuers = [], linkableIssuers = [] } = {}) {
  assertIdentity(primary); assertIdentity(secondary);
  if (userConfirmed !== true) throw new AccountError(400, 'CONFIRMATION_REQUIRED');
  if (!allowedPrimaryIssuers.includes(primary.issuer)) throw new AccountError(403, 'ISSUER_NOT_PRIMARY');
  if (!linkableIssuers.includes(secondary.issuer)) throw new AccountError(403, 'ISSUER_NOT_LINKABLE');
  if (primary.issuer === secondary.issuer) throw new AccountError(400, 'SAME_ISSUER');
  for (const id of [primary, secondary]) {
    if (!(typeof id.authTime === 'number' && nowSec - id.authTime <= REAUTH_MAX_AGE_SEC && id.authTime <= nowSec + 60)) throw new AccountError(401, 'REAUTH_REQUIRED');
  }
  const p = repo.find(primary.issuer, primary.subject);
  if (!p) throw new AccountError(403, 'ACCOUNT_NOT_LINKED');
  const s = repo.find(secondary.issuer, secondary.subject);
  if (s && s.accountId === p.accountId) return { action: 'none', accountId: p.accountId };
  if (s) throw new AccountError(409, 'LINK_COLLISION');          /* belongs to another account — never auto-merged */
  return { action: 'link', accountId: p.accountId, issuer: secondary.issuer, subject: secondary.subject, dataLinked: false };
}
