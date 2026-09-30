/*
 * Newon+ server-side ID token verification. Used by /api/livon/userdata (server/livon/userdata/http.mjs); disabled until
 * NEWON_AUTH_VERIFY_ENABLED=true and a valid Newon+ project id are configured.
 *
 * Contract:  Authorization: Bearer <Firebase ID token>   (never a query parameter, cookie or body field)
 * Steps:     1 parse Bearer · 2 issuer allowlist · 3 signature (delegated) · 4 aud · 5 iss · 6 exp/iat/auth_time · 7 sub → 8 identity
 *
 * Signature verification is NOT hand-written here. It is delegated to `verifySignature(token, {projectId})`, which must be
 * an official/safe implementation, per Firebase "Verify ID tokens" (checked 2026-09-29):
 *   - Firebase Admin SDK:   getAuth().verifyIdToken(token[, checkRevoked])  (needs only the project ID for verification)
 *   - or a maintained JWT library: header alg "RS256", kid ∈ the public keys at
 *     https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com (cache per Cache-Control max-age)
 * The route uses server/newon/auth/firebase-verifier.mjs (the third-party-library procedure with node:crypto, no npm dependency);
 * firebaseAdminVerifier() below stays available if firebase-admin is installed later.
 * The claim rules below run BEFORE and AFTER the delegated signature check (defence in depth); an unverified decode is
 * never returned as an identity.
 *
 * Output identity: { verified: true, issuer, subject, authTime, signInProvider } — the uid is NOT an account id; callers map
 * (issuer, subject) through account_refs (server/newon/auth/accounts.mjs).
 */

export const ENV = Object.freeze({
  enabled: 'NEWON_AUTH_VERIFY_ENABLED',              /* "true" only after a Newon+ project + verifier dependency exist */
  projectId: 'NEWON_PLUS_FIREBASE_PROJECT_ID',       /* public value; also used by the web config */
  allowedIssuers: 'NEWON_AUTH_ALLOWED_ISSUERS'       /* optional, comma-separated; defaults to the project's issuer */
});
export const FORBIDDEN_PROJECTS = Object.freeze(['newon-hq', 'newon-oxmonth']);   /* admin + per-app projects are separate security domains */
export const MAX_TOKEN_LENGTH = 4096;
export const CLOCK_SKEW_SEC = 60;
const PROJECT_RE = /^[a-z][a-z0-9-]{4,38}[a-z0-9]$/;
const SUBJECT_RE = /^[A-Za-z0-9_-]{6,128}$/;
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export class AuthError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
export function issuerFor(projectId) { return 'https://securetoken.google.com/' + projectId; }

/* 1. Bearer parsing — exactly one Authorization header, exactly "Bearer <jwt>" */
export function parseBearer(headers) {
  if (!headers || typeof headers !== 'object') throw new AuthError(401, 'NO_TOKEN');
  const keys = Object.keys(headers).filter(k => k.toLowerCase() === 'authorization');
  if (!keys.length) throw new AuthError(401, 'NO_TOKEN');
  if (keys.length > 1) throw new AuthError(400, 'MALFORMED_TOKEN');
  const v = headers[keys[0]];
  if (typeof v !== 'string' || v.length > MAX_TOKEN_LENGTH + 7) throw new AuthError(400, 'MALFORMED_TOKEN');
  const m = /^Bearer ([^\s]+)$/.exec(v);
  if (!m || !JWT_RE.test(m[1])) throw new AuthError(400, 'MALFORMED_TOKEN');
  return m[1];
}
/* tokens must never travel in URLs (they end up in logs / history / referrers) */
export function rejectTokenInUrl(url) {
  let u; try { u = new URL(String(url || '/'), 'http://local'); } catch { throw new AuthError(400, 'BAD_REQUEST'); }
  for (const k of u.searchParams.keys()) if (/^(access_token|id_token|token|auth|authorization|bearer|jwt)$/i.test(k)) throw new AuthError(400, 'TOKEN_IN_URL');
  return true;
}

function b64json(part) {
  try { return JSON.parse(Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')); } catch { return null; }
}
/* header + payload WITHOUT verification — used only for pre-checks, never as an identity */
export function decodeUnverified(token) {
  if (typeof token !== 'string' || !JWT_RE.test(token)) throw new AuthError(400, 'MALFORMED_TOKEN');
  const [h, p] = token.split('.');
  const header = b64json(h), payload = b64json(p);
  if (!header || !payload || typeof header !== 'object' || typeof payload !== 'object' || Array.isArray(payload)) throw new AuthError(400, 'MALFORMED_TOKEN');
  return { header, payload };
}

/* 2 + 4–7. Claim rules (Firebase: aud = project id, iss = https://securetoken.google.com/<projectId>, exp future, iat/auth_time past, sub = uid) */
export function checkClaims({ header, payload }, { projectId, allowedIssuers, nowSec }) {
  if (header && (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid)) throw new AuthError(401, 'INVALID_TOKEN');
  const iss = issuerFor(projectId);
  if (payload.iss !== iss) throw new AuthError(401, 'INVALID_TOKEN');
  if (!allowedIssuers.includes(payload.iss)) throw new AuthError(403, 'ISSUER_NOT_ALLOWED');
  if (payload.aud !== projectId) throw new AuthError(401, 'INVALID_TOKEN');
  const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);
  const exp = num(payload.exp), iat = num(payload.iat), at = num(payload.auth_time);
  if (!(exp > nowSec - CLOCK_SKEW_SEC)) throw new AuthError(401, 'TOKEN_EXPIRED');
  if (!(iat <= nowSec + CLOCK_SKEW_SEC) || !(at <= nowSec + CLOCK_SKEW_SEC)) throw new AuthError(401, 'INVALID_TOKEN');
  /* consistency: positive times, issued before it expires, signed in no later than issued (Firebase ID token invariants) */
  if (!(iat > 0 && at > 0 && exp > iat && at <= iat)) throw new AuthError(401, 'INVALID_TOKEN');
  if (typeof payload.sub !== 'string' || !SUBJECT_RE.test(payload.sub)) throw new AuthError(401, 'INVALID_TOKEN');
  return true;
}

export function configFromEnv(env = {}) {
  const projectId = String(env[ENV.projectId] || '').trim();
  const validProject = PROJECT_RE.test(projectId) && !FORBIDDEN_PROJECTS.includes(projectId);
  const issuers = String(env[ENV.allowedIssuers] || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowedIssuers = validProject ? (issuers.length ? issuers : [issuerFor(projectId)]) : [];
  return { enabled: env[ENV.enabled] === 'true' && validProject, projectId: validProject ? projectId : '', allowedIssuers };
}

/*
 * createTokenVerifier({ env, verifySignature, now }) → { enabled, verify(headers, {url}) → identity }
 * Fail-closed: disabled / no project / no official verifier → 503 AUTH_NOT_CONFIGURED before touching the token.
 */
export function createTokenVerifier({ env = {}, verifySignature = null, now = () => Date.now() } = {}) {
  const cfg = configFromEnv(env);
  const enabled = cfg.enabled && typeof verifySignature === 'function';
  return {
    enabled,
    async verify(headers, { url } = {}) {
      if (!enabled) throw new AuthError(503, 'AUTH_NOT_CONFIGURED');
      if (url != null) rejectTokenInUrl(url);
      const token = parseBearer(headers);
      if (token.length > MAX_TOKEN_LENGTH) throw new AuthError(400, 'MALFORMED_TOKEN');
      const nowSec = Math.floor(now() / 1000);
      checkClaims(decodeUnverified(token), { projectId: cfg.projectId, allowedIssuers: cfg.allowedIssuers, nowSec });
      let decoded;
      try { decoded = await verifySignature(token, { projectId: cfg.projectId }); }
      catch { throw new AuthError(401, 'INVALID_TOKEN'); }                 /* no library error text leaves this function */
      if (!decoded || typeof decoded !== 'object') throw new AuthError(401, 'INVALID_TOKEN');
      checkClaims({ header: null, payload: decoded }, { projectId: cfg.projectId, allowedIssuers: cfg.allowedIssuers, nowSec });
      const fb = decoded.firebase && typeof decoded.firebase === 'object' ? decoded.firebase : {};
      return Object.freeze({
        verified: true, issuer: decoded.iss, subject: decoded.sub, authTime: decoded.auth_time,
        signInProvider: typeof fb.sign_in_provider === 'string' && /^[a-z0-9.]{3,40}$/.test(fb.sign_in_provider) ? fb.sign_in_provider : null
      });
    }
  };
}

/* Future: official verifier. Loads firebase-admin only if it is installed (it is not in V1 — the dependency decision is documented). */
export async function firebaseAdminVerifier() {
  let admin;
  try { admin = await import('firebase-admin/auth'); } catch { throw new AuthError(503, 'VERIFIER_NOT_INSTALLED'); }
  return async (token, { checkRevoked = false } = {}) => admin.getAuth().verifyIdToken(token, checkRevoked);
}
