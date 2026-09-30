/**
 * LIVON API base (build time) → livon/livon-api-config.js (committed default) / _publish/livon/livon-api-config.js.
 *
 *   LIVON_API_ORIGIN          (PUBLIC, build-time) — the https origin that serves /api/health, /api/livon/data and
 *                             /api/livon/chat for PRODUCTION (www.newon.app / newon.app), e.g. the Vercel API project's
 *                             production domain. Empty → same origin (relative "/api/...").
 *   LIVON_API_ORIGIN_PREVIEW  (PUBLIC, optional) — API origin used when the site runs on any other host (a preview build).
 *                             Empty → same origin (a Vercel full-site preview serves its own /api).
 *
 * Environment is chosen in the browser from location.hostname:
 *   www.newon.app, newon.app, or no location (tests/Node) → production
 *   localhost, 127.0.0.1, [::1]                            → local  (always same origin: npm run dev:livon serves /api)
 *   anything else                                           → preview
 *
 * Only an https origin (scheme + host [+ port], no path, query, credentials or "*") is accepted. Anything else is ignored and
 * the same-origin default is kept, so a typo can never point the site at an arbitrary URL. These values are not secrets:
 * the browser has to know where the API is. No key or token ever belongs here.
 */
const ORIGIN_RE = /^https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:\d{1,5})?$/;
export const PRODUCTION_HOSTS = Object.freeze(['www.newon.app', 'newon.app']);

function clean(v) {
  const s = String(v || '').trim().replace(/\/+$/, '').toLowerCase();
  return ORIGIN_RE.test(s) ? s : '';
}
export function livonApiOriginFromEnv(env = {}) { return clean(env.LIVON_API_ORIGIN); }
export function livonApiOriginsFromEnv(env = {}) {
  return { production: clean(env.LIVON_API_ORIGIN), preview: clean(env.LIVON_API_ORIGIN_PREVIEW) };
}

export function livonApiConfigScript(origin = '', preview = '') {
  const o = ORIGIN_RE.test(origin) ? origin : '';
  const p = ORIGIN_RE.test(preview) ? preview : '';
  return `/*
 * LIVON API base — the ONE place the browser learns where the LIVON API lives.
 *   "" (default) → same origin: /api/health, /api/livon/data, /api/livon/chat
 *   "https://…"  → a separate API origin (GitHub Pages frontend + Vercel API). The API allows this site's origin via CORS.
 * Environments: production (www.newon.app · newon.app) · preview (other hosts) · local (localhost → always same origin).
 * Written at build time from LIVON_API_ORIGIN / LIVON_API_ORIGIN_PREVIEW (scripts/livon-api-config.mjs). Never put a key or token here.
 */
(function (root) {
  "use strict";
  var configured = ${JSON.stringify(o)};
  var preview = ${JSON.stringify(p)};
  var re = /^https:\\/\\/[a-z0-9.-]+(:\\d{1,5})?$/;
  var host = root.location && typeof root.location.hostname === "string" ? root.location.hostname.toLowerCase() : "";
  var env = !host || ${JSON.stringify(PRODUCTION_HOSTS)}.indexOf(host) >= 0 ? "production"
    : /^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(host) ? "local" : "preview";
  var pick = env === "production" ? configured : env === "preview" ? preview : "";
  var ok = re.test(pick) ? pick : "";
  root.LivonApi = Object.freeze({
    env: env,
    base: ok,
    url: function (path) { return ok + (String(path).charAt(0) === "/" ? path : "/" + path); }
  });
})(typeof window !== "undefined" ? window : globalThis);
`;
}
