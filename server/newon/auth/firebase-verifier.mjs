/*
 * Newon+ ID token signature verifier — Firebase "Verify ID tokens using a third-party JWT library" procedure
 * (https://firebase.google.com/docs/auth/admin/verify-id-tokens), implemented with Node's built-in crypto (OpenSSL):
 *
 *   1. header.alg must be RS256 and header.kid must name one of Google's current public certificates at
 *      https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com
 *   2. the certificate set is cached for its Cache-Control max-age (refetched after expiry; one refetch on an unknown kid)
 *   3. the RS256 signature is checked with crypto.verify against that certificate's public key
 *   4. claims (iss, aud, exp, iat, auth_time, sub) are re-checked by server/newon/auth/verify.mjs (checkClaims)
 *
 * No cryptographic algorithm is implemented here: parsing the X.509 certificate and verifying RSASSA-PKCS1-v1_5/SHA-256 are
 * done by node:crypto. No npm dependency is needed (the Firebase Admin SDK path, firebaseAdminVerifier(), stays supported).
 * Nothing about a token is logged; failures are thrown as bare codes so no token text reaches callers or logs.
 */
import crypto from 'node:crypto';

export const GOOGLE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const MAX_CERTS = 10;
const MIN_TTL_MS = 60e3, MAX_TTL_MS = 24 * 3600e3, DEFAULT_TTL_MS = 3600e3;

function fail(code) { const e = new Error(code); e.code = code; return e; }
function b64urlJson(part) {
  try { return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')); } catch { return null; }
}
export function maxAgeMs(cacheControl) {
  const m = /max-age=(\d+)/i.exec(String(cacheControl || ''));
  const ms = m ? Number(m[1]) * 1000 : DEFAULT_TTL_MS;
  return Math.min(MAX_TTL_MS, Math.max(MIN_TTL_MS, ms));
}

/*
 * createCertStore({ fetcher, now, url }) → { keyFor(kid) → KeyObject }
 * fetcher(url, init) must return a fetch-like Response with a JSON body { kid: "-----BEGIN CERTIFICATE-----…" }.
 * Any PEM that crypto.createPublicKey accepts works (X.509 certificate or SPKI public key).
 */
export function createCertStore({ fetcher = fetch, now = () => Date.now(), url = GOOGLE_CERTS_URL } = {}) {
  let keys = null, expires = 0, inflight = null;
  async function load() {
    if (inflight) return inflight;
    inflight = (async () => {
      let r;
      try { r = await fetcher(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(4000) }); }
      catch { throw fail('CERTS_UNAVAILABLE'); }
      if (!r || !r.ok) throw fail('CERTS_UNAVAILABLE');
      let body; try { body = await r.json(); } catch { throw fail('CERTS_UNAVAILABLE'); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail('CERTS_UNAVAILABLE');
      const next = new Map();
      for (const [kid, pem] of Object.entries(body).slice(0, MAX_CERTS)) {
        if (!/^[A-Za-z0-9_-]{1,128}$/.test(kid) || typeof pem !== 'string') continue;
        try { next.set(kid, crypto.createPublicKey(pem)); } catch { /* skip an unreadable entry */ }
      }
      if (!next.size) throw fail('CERTS_UNAVAILABLE');
      keys = next;
      expires = now() + maxAgeMs(r.headers && typeof r.headers.get === 'function' ? r.headers.get('cache-control') : '');
      return keys;
    })().finally(() => { inflight = null; });
    return inflight;
  }
  return {
    async keyFor(kid) {
      if (!keys || now() >= expires) await load();
      if (!keys.has(kid)) await load();            /* Google rotated keys since the last fetch */
      const k = keys.get(kid);
      if (!k) throw fail('UNKNOWN_KID');
      return k;
    }
  };
}

/*
 * createFirebaseSignatureVerifier({ certs }) → async (token) → decoded payload
 * Plug into createTokenVerifier({ verifySignature }) — claim rules are enforced there before AND after this call.
 */
export function createFirebaseSignatureVerifier({ certs = createCertStore() } = {}) {
  return async function verifySignature(token) {
    const parts = typeof token === 'string' ? token.split('.') : [];
    if (parts.length !== 3) throw fail('MALFORMED');
    const header = b64urlJson(parts[0]), payload = b64urlJson(parts[1]);
    if (!header || !payload) throw fail('MALFORMED');
    if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw fail('BAD_ALG');
    const key = await certs.keyFor(header.kid);
    let ok = false;
    try { ok = crypto.verify('RSA-SHA256', Buffer.from(parts[0] + '.' + parts[1]), key, Buffer.from(parts[2], 'base64url')); }
    catch { ok = false; }
    if (!ok) throw fail('BAD_SIGNATURE');
    return payload;
  };
}
