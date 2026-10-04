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
    /* The API's canonical routes have no trailing slash: /api/health, /api/livon/data, /api/livon/chat. The API project
       (Vercel) sets no "trailingSlash" rule, so those routes reach the function directly and answer with its CORS headers.
       A slash form is not a route a browser may rely on, so for a separate API origin a trailing slash on the path is removed. */
    url: function (path) {
      var p = String(path).charAt(0) === "/" ? String(path) : "/" + path;
      if (!ok) return p;
      var i = p.search(/[?#]/), head = i < 0 ? p : p.slice(0, i), tail = i < 0 ? "" : p.slice(i);
      return ok + (head.replace(/\/+$/, "") || "/") + tail;
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
