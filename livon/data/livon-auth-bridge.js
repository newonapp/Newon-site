/*
 * LIVON ⇄ Newon+ Auth bridge — the ONE place LIVON receives auth state.
 *
 *   NewonAuth.subscribe ─→ LivonUserData.setAuthProvider(...)   (session only; the id never reaches UI code)
 *                       ─→ LivonSync.onSignedIn / onSignedOut    (account sync engine, livon/data/livon-sync.js)
 *
 * Consent boundary: signing in ≠ uploading. After a sign-in LIVON only OFFERS an import (counts from
 * LivonUserData.planLoginImport()); nothing is sent until the user approves in the consent dialog (LivonSync.approveImport).
 * Sensitive collections (건강·돈·일기) need their own opt-in. Local data is never deleted.
 * When the sync engine is not loaded or the server has no account storage, approval returns SYNC_NOT_AVAILABLE (uploaded 0).
 */
(function (root) {
  "use strict";

  var consent = { state: "none" };           /* none → offered → approved | declined (per page session; never stored) */
  var last = null, lastSubject = null;

  function UD() { return root.LivonUserData; }
  /* Public anonymous mode (2026-09-30): Newon+ sign-in and cloud sync are NOT offered to users yet. Even if a Newon+ web
     config appears (Newon+ becomes the shared identity for every Newon service), LIVON does not start account sync or show
     account UI until this switch is deliberately turned on at launch (a build-time decision; default off). */
  function syncPublic() { return root.LIVON_ACCOUNT_SYNC_PUBLIC === true; }
  function S() { return root.LivonSync; }
  function apply(state) {
    var prev = last;
    last = state;
    var U = UD();
    if (!U) return;
    if (state && state.status === "authenticated" && state.session) {
      var s = state.session;
      /* userId here = the SDK-verified subject, used ONLY as a client-side "who is signed in on this tab" marker. It is never
         sent as an owner: the server derives the owner from the Bearer token → (issuer, subject) → account_refs → accountId. */
      U.setAuthProvider({ getSession: function () { return { userId: s.subject, issuer: s.issuer, verified: true }; } });
      if (S() && syncPublic() && lastSubject !== s.issuer + "|" + s.subject) { lastSubject = s.issuer + "|" + s.subject; S().onSignedIn({ issuer: s.issuer, subject: s.subject }); }
    } else {
      U.setAuthProvider(null);
      consent = { state: "none" };
      /* a finished auth check that says "anonymous" (sign-out, expiry, or a reload without a session) restores this device's data */
      if (S() && state && state.status !== "loading" && (lastSubject || (prev && prev.status === "authenticated") || S().activeProfile().kind === "account")) {
        lastSubject = null;
        S().onSignedOut({ finalSync: false });
      }
    }
  }

  var bridge = {
    get SYNC_ENDPOINT_ENABLED() { var x = S() && S().status(); return !!(x && x.signedIn && x.status !== "unavailable"); },
    status: function () { return { auth: last ? last.status : "loading", accountMode: UD() ? UD().mode() : "anonymous", consent: consent.state }; },
    /* what a first import WOULD contain — counts only; offered only to a signed-in user */
    offerImport: function () {
      var U = UD();
      if (!last || last.status !== "authenticated" || !U) return { status: "NOT_SIGNED_IN" };
      consent = { state: "offered" };
      var plan = U.planLoginImport();
      return { status: "OFFERED", plan: plan, requiresUserChoice: true, autoUpload: false };
    },
    declineImport: function () {
      if (consent.state === "offered") consent = { state: "declined" };
      if (S() && S().status().status === "waiting-consent") S().declineImport();
      return { status: consent.state.toUpperCase() };
    },
    /* explicit user approval; sensitive data only with includeSensitive:true */
    approveImport: function (choice) {
      if (!last || last.status !== "authenticated") return { status: "NOT_SIGNED_IN" };
      if (consent.state !== "offered") return { status: "NOT_OFFERED" };
      consent = { state: "approved", includeSensitive: !!(choice && choice.includeSensitive === true) };
      var sync = S();
      if (sync && sync.status().status === "waiting-consent") {
        return { status: "IMPORT_STARTED", uploaded: null, pending: sync.approveImport({ collections: (choice && choice.collections) || [], includeSensitive: consent.includeSensitive }) };
      }
      return { status: "SYNC_NOT_AVAILABLE", uploaded: 0 };
    }
  };
  root.LivonAuthBridge = bridge;

  var A = root.NewonAuth;
  if (A && typeof A.subscribe === "function") A.subscribe(function (ev) { apply(ev.state); });
})(typeof window !== "undefined" ? window : globalThis);
