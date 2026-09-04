/**
 * Newon HQ — Auth + admin UID authorization (Phase 1B).
 * Google Sign-In. Client UID guard + Firestore SDK init.
 * No CRUD, no token logging, no Admin SDK.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

(function () {
  "use strict";

  var views = {
    loading: document.getElementById("hq-view-loading"),
    config: document.getElementById("hq-view-config"),
    signedOut: document.getElementById("hq-view-signed-out"),
    denied: document.getElementById("hq-view-denied"),
    authorized: document.getElementById("hq-view-authorized"),
    error: document.getElementById("hq-view-error"),
  };

  var els = {
    status: document.getElementById("hq-live-status"),
    errorMsg: document.getElementById("hq-error-msg"),
    configMissing: document.getElementById("hq-config-missing"),
    deniedEmail: document.getElementById("hq-denied-email"),
    authEmail: document.getElementById("hq-auth-email"),
    loginBtn: document.getElementById("hq-login"),
    retryBtn: document.getElementById("hq-retry"),
  };

  var logoutBtns = document.querySelectorAll("[data-hq-logout]");

  var auth = null;
  var db = null;
  var provider = null;
  var busy = false;
  var bridge = null;

  function setStatus(text, kind) {
    if (!els.status) return;
    els.status.textContent = text || "";
    els.status.className = "hq-status" + (kind ? " hq-status--" + kind : "");
  }

  function showView(name) {
    Object.keys(views).forEach(function (key) {
      var el = views[key];
      if (!el) return;
      el.hidden = key !== name;
    });
  }

  function setBusy(on) {
    busy = !!on;
    if (els.loginBtn) els.loginBtn.disabled = busy;
    if (els.retryBtn) els.retryBtn.disabled = busy;
    logoutBtns.forEach(function (btn) {
      btn.disabled = busy;
    });
  }

  function showError(message) {
    if (els.errorMsg) els.errorMsg.textContent = message || "Something went wrong.";
    setStatus(message || "Error", "err");
    showView("error");
  }

  function applyUser(user) {
    if (!user) {
      if (els.deniedEmail) els.deniedEmail.textContent = "—";
      if (els.authEmail) els.authEmail.textContent = "—";
      setStatus("Signed out");
      showView("signedOut");
      return;
    }

    var email = user.email || "—";
    if (!bridge || !bridge.isAdminUid(user.uid)) {
      if (els.deniedEmail) els.deniedEmail.textContent = email;
      setStatus("Access denied", "err");
      showView("denied");
      return;
    }

    if (els.authEmail) els.authEmail.textContent = email;
    setStatus("관리자 인증 완료", "ok");
    showView("authorized");
  }

  function bootAuth() {
    bridge = window.NEWON_HQ_FIREBASE;
    if (!bridge || !bridge.isConfigured()) {
      var missing = (bridge && bridge.missingKeys && bridge.missingKeys()) || ["apiKey", "appId"];
      if (!bridge || !bridge.ADMIN_UID) missing = missing.concat(["ADMIN_UID"]);
      if (els.configMissing) els.configMissing.textContent = missing.join(", ");
      setStatus("Firebase config incomplete", "err");
      showView("config");
      return;
    }

    try {
      var app = initializeApp(bridge.config);
      auth = getAuth(app);
      db = getFirestore(app);
      provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      // db is initialized for Phase 1C+; no reads/writes in 1B.
      void db;
    } catch (err) {
      showError("Could not initialize Firebase.");
      return;
    }

    onAuthStateChanged(auth, function (user) {
      setBusy(false);
      applyUser(user);
    });
  }

  async function login() {
    if (!auth || busy) return;
    setBusy(true);
    setStatus("Opening Google sign-in…");
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setBusy(false);
      var code = err && err.code ? String(err.code) : "";
      var msg = "Google sign-in failed.";
      if (code === "auth/popup-blocked") msg = "Popup was blocked. Allow popups and try again.";
      else if (code === "auth/popup-closed-by-user") msg = "Sign-in was cancelled.";
      else if (code === "auth/unauthorized-domain")
        msg = "This domain is not authorized in Firebase Authentication.";
      showError(msg);
    }
  }

  async function logout() {
    if (!auth || busy) return;
    setBusy(true);
    try {
      await signOut(auth);
    } catch (err) {
      setBusy(false);
      showError("Sign-out failed.");
    }
  }

  if (els.loginBtn) els.loginBtn.addEventListener("click", login);
  logoutBtns.forEach(function (btn) {
    btn.addEventListener("click", logout);
  });
  if (els.retryBtn) {
    els.retryBtn.addEventListener("click", function () {
      setStatus("");
      if (!auth) {
        showView("loading");
        bootAuth();
        return;
      }
      applyUser(auth.currentUser);
    });
  }

  showView("loading");
  setStatus("Loading…");
  bootAuth();
})();
