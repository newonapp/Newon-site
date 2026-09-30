/*
 * LIVON API base — the ONE place the browser learns where the LIVON API lives.
 *   "" (default) → same origin: /api/health, /api/livon/data, /api/livon/chat
 *   "https://…"  → a separate API origin (GitHub Pages frontend + Vercel API). The API allows this site's origin via CORS.
 * Written at build time from LIVON_API_ORIGIN (scripts/livon-api-config.mjs). Never put a key or token here.
 */
(function (root) {
  "use strict";
  var configured = "";
  var ok = /^https:\/\/[a-z0-9.-]+(:\d{1,5})?$/.test(configured) ? configured : "";
  root.LivonApi = Object.freeze({
    base: ok,
    url: function (path) { return ok + (String(path).charAt(0) === "/" ? path : "/" + path); }
  });
})(typeof window !== "undefined" ? window : globalThis);
