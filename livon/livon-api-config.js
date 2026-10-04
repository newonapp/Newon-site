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
    /* A separate API origin is a Vercel deployment of this repository: vercel.json has "trailingSlash": true, so it answers
       /api/x with a 308 redirect to /api/x/. A cross-origin fetch cannot pass that redirect (it carries no CORS headers, and a
       preflight never follows a redirect), so URLs for a separate origin carry the slash: /api/health/, /api/livon/data/?...  */
    url: function (path) {
      var p = String(path).charAt(0) === "/" ? String(path) : "/" + path;
      if (!ok) return p;
      var i = p.search(/[?#]/), head = i < 0 ? p : p.slice(0, i), tail = i < 0 ? "" : p.slice(i);
      return ok + (head.charAt(head.length - 1) === "/" ? head : head + "/") + tail;
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
