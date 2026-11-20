/*
 * Newon+ Auth — consumer authentication foundation shared by Newon web services (LIVON first; ONGIL and others later).
 *
 *   window.NEWON_PLUS_AUTH_CONFIG  (newon-auth-config.js — public Firebase WEB config only; empty until a Newon+ project exists)
 *        ↓ validated here (HQ / app-specific projects are refused)
 *   NewonAuth (this file)          state · events · session normalization · token access (memory only)
 *        ↓ adapter contract: initialize · onAuthStateChanged · getIdToken · signOut  (+ signIn: provider-independent, V1 none)
 *   NewonFirebaseAuthAdapter       (newon-auth-firebase.js — loads the Firebase JS SDK only when a valid config exists)
 *
 * Security domains
 *   - Newon+ consumer identity is separate from Newon HQ (newon-hq, admin allowlist) and from per-app projects
 *     (newon-oxmonth). Those project ids are rejected as Newon+ config, so admin/app sessions can never become consumer ones.
 *   - No config → status "anonymous", no SDK is loaded, no network request is made. Nothing is ever faked as authenticated.
 *   - Tokens: never stored by this code (no localStorage/sessionStorage/cookie/URL/log). getIdToken() asks the SDK each time;
 *     the SDK's own persistence is chosen explicitly (default: session = this tab only).
 *   - Signing in never uploads data. Import of local data is a separate, user-approved step owned by each service (LIVON:
 *     livon/data/livon-auth-bridge.js).
 */
(function (root) {
  "use strict";

  var STATES = ["loading", "anonymous", "authenticated", "error"];
  /* never a Newon+ consumer identity: HQ admin project and per-app consumer projects (see docs/newon/auth-architecture.md) */
  var FORBIDDEN_PROJECTS = ["newon-hq", "newon-oxmonth"];
  var PERSISTENCE = ["session", "local", "memory"];
  /* sign-in methods a service may offer — only those listed in the Newon+ config (the project enabled them) are shown */
  var SIGN_IN_PROVIDERS = ["google.com", "apple.com"];
  var SUBJECT_RE = /^[A-Za-z0-9_-]{6,128}$/;
  var EVENT_TYPES = ["ready", "signed-in", "signed-out", "error"];
  var ERROR_CODES = ["CONFIG_INVALID", "CONFIG_FORBIDDEN_PROJECT", "ADAPTER_MISSING", "SDK_LOAD_FAILED", "INIT_FAILED", "INVALID_USER", "SIGN_IN_NOT_CONFIGURED", "SIGN_OUT_FAILED", "TOKEN_UNAVAILABLE", "UNKNOWN"];

  function isStr(v) { return typeof v === "string" && v.trim() === v && v.length > 0; }
  function code(c) { return ERROR_CODES.indexOf(c) >= 0 ? c : "UNKNOWN"; }

  /* Public Firebase WEB config only. Anything that looks like a server credential is refused outright. */
  function validateConfig(c) {
    if (c == null || c === "" || (typeof c === "object" && !Object.keys(c).length)) return { ok: false, reason: "NOT_CONFIGURED" };
    if (typeof c !== "object" || Array.isArray(c)) return { ok: false, reason: "CONFIG_INVALID" };
    var bad = Object.keys(c).filter(function (k) { return /private|secret|service|credential|client_email|password/i.test(k); });
    if (bad.length) return { ok: false, reason: "CONFIG_INVALID" };
    if (!isStr(c.apiKey) || !/^[A-Za-z0-9_-]{20,64}$/.test(c.apiKey)) return { ok: false, reason: "CONFIG_INVALID" };
    if (!isStr(c.projectId) || !/^[a-z][a-z0-9-]{4,38}[a-z0-9]$/.test(c.projectId)) return { ok: false, reason: "CONFIG_INVALID" };
    if (FORBIDDEN_PROJECTS.indexOf(c.projectId) >= 0) return { ok: false, reason: "CONFIG_FORBIDDEN_PROJECT" };
    if (!isStr(c.authDomain) || !/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(c.authDomain)) return { ok: false, reason: "CONFIG_INVALID" };
    if (!isStr(c.appId) || !/^\d+:\d+:web:[a-f0-9]+$/.test(c.appId)) return { ok: false, reason: "CONFIG_INVALID" };
    var persistence = c.persistence == null || c.persistence === "" ? "session" : c.persistence;
    if (PERSISTENCE.indexOf(persistence) < 0) return { ok: false, reason: "CONFIG_INVALID" };
    var providers = c.providers == null ? [] : c.providers;
    if (!Array.isArray(providers) || providers.length > SIGN_IN_PROVIDERS.length || providers.some(function (x) { return SIGN_IN_PROVIDERS.indexOf(x) < 0; })) return { ok: false, reason: "CONFIG_INVALID" };
    return { ok: true, config: { apiKey: c.apiKey, authDomain: c.authDomain, projectId: c.projectId, appId: c.appId, persistence: persistence, providers: providers.slice(), issuer: "https://securetoken.google.com/" + c.projectId } };
  }

  /* SDK user → the only session fields services may see (no email, name, photo, phone or token) */
  function normalizeUser(user, cfg) {
    if (!user || typeof user !== "object" || !SUBJECT_RE.test(String(user.uid || ""))) return null;
    var provider = null;
    var pd = Array.isArray(user.providerData) ? user.providerData : [];
    for (var i = 0; i < pd.length; i++) { var p = pd[i] && pd[i].providerId; if (typeof p === "string" && /^[a-z0-9.]{3,40}$/.test(p)) { provider = p; break; } }
    return { issuer: cfg.issuer, subject: String(user.uid), signInProvider: provider };
  }

  function createAuth() {
    var state = { status: "loading", configured: false, session: null, errorCode: null };
    var cfg = null, adapter = null, listeners = [], ready = false, generation = 0;

    function snapshot() { return { status: state.status, configured: state.configured, session: state.session ? { issuer: state.session.issuer, subject: state.session.subject, signInProvider: state.session.signInProvider } : null, errorCode: state.errorCode }; }
    function emit(type) {
      if (EVENT_TYPES.indexOf(type) < 0) return;
      var ev = { type: type, state: snapshot() };
      listeners.slice().forEach(function (fn) { try { fn(ev); } catch (e) {} });
    }
    function set(next, type) {
      state = { status: next.status, configured: next.configured != null ? next.configured : state.configured, session: next.session || null, errorCode: next.errorCode || null };
      if (!ready && state.status !== "loading") { ready = true; emit("ready"); }
      if (type) emit(type);
    }
    function fail(c) { set({ status: "error", session: null, errorCode: code(c) }, "error"); }

    var api = {
      STATES: STATES, EVENT_TYPES: EVENT_TYPES, FORBIDDEN_PROJECTS: FORBIDDEN_PROJECTS,
      validateConfig: validateConfig,
      /* opts: { config, adapterFactory(config) → adapter } — safe to call once; later calls are ignored */
      initialize: function (opts) {
        opts = opts || {};
        if (state.status !== "loading" || generation) return Promise.resolve(snapshot());
        generation = 1;
        var v = validateConfig(opts.config);
        if (!v.ok) {
          /* no Newon+ project configured (V1) — LIVON and other services keep working anonymously */
          set({ status: "anonymous", configured: false, errorCode: v.reason === "NOT_CONFIGURED" ? null : code(v.reason) });
          return Promise.resolve(snapshot());
        }
        cfg = v.config;
        if (typeof opts.adapterFactory !== "function") { set({ status: "anonymous", configured: false, errorCode: "ADAPTER_MISSING" }); return Promise.resolve(snapshot()); }
        try { adapter = opts.adapterFactory(cfg); } catch (e) { adapter = null; }
        if (!adapter || typeof adapter.initialize !== "function" || typeof adapter.onAuthStateChanged !== "function" || typeof adapter.getIdToken !== "function" || typeof adapter.signOut !== "function") {
          set({ status: "anonymous", configured: false, errorCode: "ADAPTER_MISSING" }); return Promise.resolve(snapshot());
        }
        state.configured = true;
        return Promise.resolve().then(function () { return adapter.initialize(); }).then(function () {
          return new Promise(function (resolve) {
            var first = true;
            adapter.onAuthStateChanged(function (user) {
              if (!user) { var was = state.status === "authenticated"; set({ status: "anonymous", session: null }, was ? "signed-out" : null); }
              else {
                var s = normalizeUser(user, cfg);
                if (!s) fail("INVALID_USER");
                else set({ status: "authenticated", session: s }, "signed-in");
              }
              if (first) { first = false; resolve(snapshot()); }
            }, function () { fail("INIT_FAILED"); if (first) { first = false; resolve(snapshot()); } });
          });
        }).catch(function (e) { fail(e && e.code === "SDK_LOAD_FAILED" ? "SDK_LOAD_FAILED" : "INIT_FAILED"); return snapshot(); });
      },
      getState: snapshot,
      /* sign-in methods enabled by config (empty until a Newon+ project exists) */
      providers: function () { return cfg && state.configured ? cfg.providers.slice() : []; },
      getSession: function () { return state.status === "authenticated" ? snapshot().session : null; },
      /* fresh from the SDK every time; never cached or stored here */
      getIdToken: function (o) {
        if (state.status !== "authenticated" || !adapter) return Promise.resolve(null);
        return Promise.resolve().then(function () { return adapter.getIdToken(!!(o && o.forceRefresh)); })
          .then(function (t) { return typeof t === "string" && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(t) ? t : null; })
          .catch(function () { return null; });
      },
      /* Authorization header for an HTTPS request to an allowed origin (same origin by default). Never a URL parameter. */
      authHeaders: function (url, o) {
        o = o || {};
        var loc = root.location && root.location.origin;
        var u; try { u = new URL(String(url), loc || undefined); } catch (e) { return Promise.resolve(null); }
        var allowed = [loc].concat(Array.isArray(o.allowedOrigins) ? o.allowedOrigins : []).filter(Boolean);
        if (u.protocol !== "https:" || allowed.indexOf(u.origin) < 0 || u.username || u.password) return Promise.resolve(null);
        return api.getIdToken().then(function (t) { return t ? { Authorization: "Bearer " + t } : null; });
      },
      /* provider-independent: a service passes a method id that the Newon+ project enables (none in V1) */
      signIn: function (request) {
        if (!adapter || typeof adapter.signIn !== "function") return Promise.reject(Object.assign(new Error("sign-in not configured"), { code: "SIGN_IN_NOT_CONFIGURED" }));
        return Promise.resolve().then(function () { return adapter.signIn(request); });
      },
      signOut: function () {
        if (!adapter || state.status !== "authenticated") { if (state.status === "authenticated") set({ status: "anonymous", session: null }, "signed-out"); return Promise.resolve(snapshot()); }
        return Promise.resolve().then(function () { return adapter.signOut(); }).then(function () {
          if (state.status === "authenticated") set({ status: "anonymous", session: null }, "signed-out");
          return snapshot();
        }, function () {
          /* local auth state is cleared even if the SDK call failed; the SDK retries on next load */
          set({ status: "anonymous", session: null, errorCode: "SIGN_OUT_FAILED" }, "signed-out");
          return snapshot();
        });
      },
      /* one subscription point (no window-wide event bus): fn({type: ready|signed-in|signed-out|error, state}) */
      subscribe: function (fn) {
        if (typeof fn !== "function") return function () {};
        listeners.push(fn);
        if (ready) { try { fn({ type: "ready", state: snapshot() }); } catch (e) {} }
        return function () { listeners = listeners.filter(function (x) { return x !== fn; }); };
      }
    };
    return api;
  }

  var NewonAuth = createAuth();
  NewonAuth.create = createAuth;              /* isolated instances for tests / embedded apps */
  root.NewonAuth = NewonAuth;

  /* boot: after the config + adapter scripts ran (same page, next tick). No config → anonymous immediately. */
  if (root.document) {
    var boot = function () {
      var F = root.NewonFirebaseAuthAdapter;
      NewonAuth.initialize({ config: root.NEWON_PLUS_AUTH_CONFIG, adapterFactory: F && F.create });
    };
    if (root.document.readyState === "loading" && root.document.addEventListener) root.document.addEventListener("DOMContentLoaded", boot);
    else setTimeout(boot, 0);
  }
})(typeof window !== "undefined" ? window : globalThis);
