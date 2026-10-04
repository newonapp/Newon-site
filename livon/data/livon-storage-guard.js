/*
 * LIVON storage guard — runs before every other LIVON script.
 *
 * Some browsers throw on any access to window.localStorage / window.sessionStorage (storage blocked by
 * privacy settings, some in-app webviews, sandboxed frames). LIVON is local-first and anonymous, so a
 * blocked storage must never break a page: when access throws, this installs an in-memory Storage for the
 * current tab only. Nothing is persisted and nothing is sent anywhere; the page works and data is simply
 * not kept after the tab closes (the on-page notice already says data may not be kept).
 * When storage works, this file does nothing.
 */
(function (root) {
  "use strict";
  if (!root || typeof root !== "object") return;
  function MemoryStorage() {
    var m = Object.create(null);
    var api = {
      key: function (i) { var k = Object.keys(m); return i >= 0 && i < k.length ? k[i] : null; },
      getItem: function (k) { k = String(k); return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
      setItem: function (k, v) { m[String(k)] = String(v); },
      removeItem: function (k) { delete m[String(k)]; },
      clear: function () { m = Object.create(null); }
    };
    Object.defineProperty(api, "length", { get: function () { return Object.keys(m).length; } });
    return api;
  }
  var fallback = [];
  ["localStorage", "sessionStorage"].forEach(function (name) {
    var ok = false;
    try { var s = root[name]; ok = !!s && typeof s.getItem === "function"; if (ok) void s.length; } catch (e) { ok = false; }
    if (ok) return;
    try { Object.defineProperty(root, name, { configurable: true, enumerable: true, writable: false, value: MemoryStorage() }); fallback.push(name); } catch (e) {}
  });
  root.LIVON_STORAGE_FALLBACK = fallback;
})(typeof window !== "undefined" ? window : undefined);
