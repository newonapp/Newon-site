/*
 * Newon+ Auth — Firebase adapter (web). Implements the NewonAuth adapter contract:
 *   initialize() · onAuthStateChanged(cb, errCb) · getIdToken(forceRefresh) · signOut() · [signIn(request)]
 *
 * - Loaded on every page that includes it, but the Firebase JS SDK is imported ONLY when NewonAuth passes a valid
 *   Newon+ config (so with no config: zero SDK download, zero network).
 * - Uses its own named Firebase app ("newon-plus") so it can never share state with HQ (newon-hq) or OX MONTH (newon-oxmonth).
 * - Persistence is explicit: "session" (default, this tab) · "local" · "memory". Tokens stay inside the SDK.
 * - Sign-in: only the methods named in the Newon+ config (NEWON_PLUS_AUTH_PROVIDERS → cfg.providers) can be used. With no
 *   config nothing is offered and signIn() reports SIGN_IN_NOT_CONFIGURED.
 */
(function (root) {
  "use strict";

  var SDK_VERSION = "11.0.2";   /* same major/minor as the existing HQ and OX MONTH pages */
  var SDK_BASE = "https://www.gstatic.com/firebasejs/" + SDK_VERSION + "/";
  var APP_NAME = "newon-plus";

  function defaultLoadSdk() {
    return Promise.all([import(SDK_BASE + "firebase-app.js"), import(SDK_BASE + "firebase-auth.js")])
      .then(function (m) { return { app: m[0], auth: m[1] }; })
      .catch(function () { var e = new Error("sdk"); e.code = "SDK_LOAD_FAILED"; throw e; });
  }

  /* cfg: already validated by NewonAuth.validateConfig; opts.loadSdk: injectable for tests */
  function create(cfg, opts) {
    opts = opts || {};
    var loadSdk = typeof opts.loadSdk === "function" ? opts.loadSdk : defaultLoadSdk;
    var sdk = null, auth = null;
    return {
      kind: "firebase",
      initialize: function () {
        return loadSdk().then(function (s) {
          sdk = s;
          var app = s.app.initializeApp({ apiKey: cfg.apiKey, authDomain: cfg.authDomain, projectId: cfg.projectId, appId: cfg.appId }, APP_NAME);
          auth = s.auth.getAuth(app);
          var p = cfg.persistence === "local" ? s.auth.browserLocalPersistence : cfg.persistence === "memory" ? s.auth.inMemoryPersistence : s.auth.browserSessionPersistence;
          return s.auth.setPersistence(auth, p);
        });
      },
      onAuthStateChanged: function (cb, errCb) { return sdk.auth.onAuthStateChanged(auth, cb, errCb); },
      getIdToken: function (forceRefresh) { var u = auth && auth.currentUser; return u ? u.getIdToken(!!forceRefresh) : Promise.resolve(null); },
      signOut: function () { return sdk.auth.signOut(auth); },
      /*
       * signIn({ provider }) — only a provider listed in the Newon+ config (cfg.providers, i.e. enabled in that Firebase
       * project) is accepted; the SDK opens its own consent window (popup, redirect if the popup is blocked).
       * No provider is built in: without config this throws SIGN_IN_NOT_CONFIGURED.
       */
      signIn: function (request) {
        var id = request && typeof request.provider === "string" ? request.provider : "";
        if (!sdk || !auth || !cfg.providers || cfg.providers.indexOf(id) < 0) return Promise.reject(Object.assign(new Error("sign-in not configured"), { code: "SIGN_IN_NOT_CONFIGURED" }));
        var A = sdk.auth;
        var provider = id === "google.com" && typeof A.GoogleAuthProvider === "function" ? new A.GoogleAuthProvider() : new A.OAuthProvider(id);
        return A.signInWithPopup(auth, provider).catch(function (e) {
          if (e && e.code === "auth/popup-blocked" && typeof A.signInWithRedirect === "function") return A.signInWithRedirect(auth, provider);
          throw Object.assign(new Error("sign-in failed"), { code: e && e.code === "auth/popup-closed-by-user" ? "SIGN_IN_CANCELLED" : "SIGN_IN_FAILED" });
        });
      }
    };
  }

  root.NewonFirebaseAuthAdapter = { create: create, SDK_VERSION: SDK_VERSION, APP_NAME: APP_NAME };
})(typeof window !== "undefined" ? window : globalThis);
