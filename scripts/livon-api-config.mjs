/**
 * LIVON API base (build time) → livon/livon-api-config.js (committed default) / _publish/livon/livon-api-config.js.
 *
 *   LIVON_API_ORIGIN  (PUBLIC, build-time) — the https origin that serves /api/health, /api/livon/data and /api/livon/chat,
 *                     e.g. the Vercel API project's production domain. Empty → same origin (relative "/api/...").
 *
 * Only an https origin (scheme + host [+ port], no path, query, credentials or "*") is accepted. Anything else is ignored and
 * the same-origin default is kept, so a typo can never point the site at an arbitrary URL. It is not a secret: the browser
 * has to know where the API is.
 */
const ORIGIN_RE = /^https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:\d{1,5})?$/;

export function livonApiOriginFromEnv(env = {}) {
  const v = String(env.LIVON_API_ORIGIN || '').trim().replace(/\/+$/, '').toLowerCase();
  return ORIGIN_RE.test(v) ? v : '';
}

export function livonApiConfigScript(origin = '') {
  const o = ORIGIN_RE.test(origin) ? origin : '';
  return `/*
 * LIVON API base — the ONE place the browser learns where the LIVON API lives.
 *   "" (default) → same origin: /api/health, /api/livon/data, /api/livon/chat
 *   "https://…"  → a separate API origin (GitHub Pages frontend + Vercel API). The API allows this site's origin via CORS.
 * Written at build time from LIVON_API_ORIGIN (scripts/livon-api-config.mjs). Never put a key or token here.
 */
(function (root) {
  "use strict";
  var configured = ${JSON.stringify(o)};
  var ok = /^https:\\/\\/[a-z0-9.-]+(:\\d{1,5})?$/.test(configured) ? configured : "";
  root.LivonApi = Object.freeze({
    base: ok,
    url: function (path) { return ok + (String(path).charAt(0) === "/" ? path : "/" + path); }
  });
})(typeof window !== "undefined" ? window : globalThis);
`;
}
