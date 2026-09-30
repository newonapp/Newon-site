/*
 * LIVON API base — the ONE place the browser learns where the LIVON API lives.
 *   "" (default) → same origin: /api/health, /api/livon/data, /api/livon/chat
 *   "https://…"  → a separate API origin (GitHub Pages frontend + Vercel API). The API allows this site's origin via CORS.
 * Environments: production (www.newon.app · newon.app) · preview (other hosts) · local (localhost → always same origin).
 * Written at build time from LIVON_API_ORIGIN / LIVON_API_ORIGIN_PREVIEW (scripts/livon-api-config.mjs). Never put a key or token here.
 */
(function (root) {
  "use strict";
  var configured = "";
  var preview = "";
  var re = /^https:\/\/[a-z0-9.-]+(:\d{1,5})?$/;
  var host = root.location && typeof root.location.hostname === "string" ? root.location.hostname.toLowerCase() : "";
  var env = !host || ["www.newon.app","newon.app"].indexOf(host) >= 0 ? "production"
    : /^(localhost|127\.0\.0\.1|\[::1\])$/.test(host) ? "local" : "preview";
  var pick = env === "production" ? configured : env === "preview" ? preview : "";
  var ok = re.test(pick) ? pick : "";
  root.LivonApi = Object.freeze({
    env: env,
    base: ok,
    url: function (path) { return ok + (String(path).charAt(0) === "/" ? path : "/" + path); }
  });
})(typeof window !== "undefined" ? window : globalThis);
