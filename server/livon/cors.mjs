/*
 * LIVON API — cross-origin policy (shared by /api/health, /api/livon/data, /api/livon/chat).
 *
 * Production layout (docs/livon/live-backend.md):
 *   https://www.newon.app (GitHub Pages, static)  ──HTTPS──▶  LIVON API (Vercel functions, separate origin)
 *
 * Rules
 *   - Same-origin requests (Origin host == Host) are always allowed (a deployment that serves site + API together).
 *   - A cross-origin browser request is allowed only from an exact allowlisted origin. Never "*".
 *     Production allowlist: LIVON_ALLOWED_ORIGINS (comma-separated https origins) or, if unset,
 *     https://www.newon.app and https://newon.app.
 *   - http://localhost:<port> / http://127.0.0.1:<port> are added only outside production.
 *   - No credentials (no cookies are used). Allowed request headers: Content-Type by default; the authenticated user-data
 *     route (/api/livon/userdata) additionally allows Authorization (Bearer ID token — never a cookie, so no CSRF surface).
 *   - Requests without an Origin header (server-to-server, curl) are not browser CORS requests; they are handled normally
 *     and remain subject to the endpoint's own limits (AI rate limiting, data caching).
 */
export const DEFAULT_PRODUCTION_ORIGINS = Object.freeze(['https://www.newon.app', 'https://newon.app']);
export const ALLOWED_REQUEST_HEADERS = 'Content-Type';
export const PREFLIGHT_MAX_AGE = 600;
const DEV_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;
const HTTPS_ORIGIN = /^https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:\d{1,5})?$/;

export class CorsError extends Error {
  constructor() { super('ORIGIN_NOT_ALLOWED'); this.status = 403; this.code = 'ORIGIN_NOT_ALLOWED'; }
}
export function isProductionEnv(env = {}) { return env.NODE_ENV === 'production' || !!env.VERCEL; }

/* exact https origins only; anything else in the variable (paths, "*", http) is ignored */
export function allowedOrigins(env = {}) {
  const configured = String(env.LIVON_ALLOWED_ORIGINS || '').split(',').map(s => s.trim().toLowerCase()).filter(s => HTTPS_ORIGIN.test(s));
  return configured.length ? configured : [...DEFAULT_PRODUCTION_ORIGINS];
}
export function originAllowed(origin, env = {}) {
  if (typeof origin !== 'string' || !origin || origin === 'null') return false;
  const o = origin.toLowerCase();
  if (allowedOrigins(env).includes(o)) return true;
  return !isProductionEnv(env) && DEV_ORIGIN.test(o);
}
function sameOrigin(origin, host) {
  try { return !!host && new URL(origin).host === String(host).toLowerCase(); } catch { return false; }
}

/*
 * applyCors(req, res, env, { methods }) → { preflight: boolean }
 *   throws CorsError for a disallowed browser origin (the caller answers 403 with its own JSON shape).
 *   For an allowed preflight (OPTIONS) the caller should end the response with 204.
 */
export function applyCors(req, res, env = {}, { methods = ['GET'], allowHeaders = ['content-type'] } = {}) {
  const h = req.headers || {};
  const origin = h.origin;
  const preflight = req.method === 'OPTIONS';
  res.setHeader('Vary', 'Origin');
  if (!origin) {
    /* a browser always sends Origin on a cross-site fetch; a cross-site signal without one is refused */
    if (h['sec-fetch-site'] === 'cross-site') throw new CorsError();
    return { preflight };
  }
  if (sameOrigin(origin, h.host)) return { preflight };
  if (!originAllowed(origin, env)) throw new CorsError();
  res.setHeader('Access-Control-Allow-Origin', origin);
  if (preflight) {
    const wanted = String(h['access-control-request-method'] || '').toUpperCase();
    if (wanted && !methods.includes(wanted)) throw new CorsError();
    const reqHeaders = String(h['access-control-request-headers'] || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    if (reqHeaders.some(x => !allowHeaders.includes(x))) throw new CorsError();
    res.setHeader('Access-Control-Allow-Methods', methods.concat('OPTIONS').join(', '));
    res.setHeader('Access-Control-Allow-Headers', allowHeaders.map(h => h.replace(/(^|-)([a-z])/g, (m, a, b) => a + b.toUpperCase())).join(', '));
    res.setHeader('Access-Control-Max-Age', String(PREFLIGHT_MAX_AGE));
  }
  return { preflight };
}
