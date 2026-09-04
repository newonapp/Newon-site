/**
 * Newon HQ — Firebase Auth bootstrap (Phase 1A).
 * Google Sign-In only. No Firestore reads/writes. No tokens in DOM/console.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

(function () {
  "use strict";

  var views = {
    loading: document.getElementById("hq-view-loading"),
    config: document.getElementById("hq-view-config"),
    signedOut: document.getElementById("hq-view-signed-out"),
    setup: document.getElementById("hq-view-setup"),
    error: document.getElementById("hq-view-error"),
  };

  var els = {
    status: document.getElementById("hq-live-status"),
    errorMsg: document.getElementById("hq-error-msg"),
    configMissing: document.getElementById("hq-config-missing"),
    displayName: document.getElementById("hq-display-name"),
    email: document.getElementById("hq-email"),
    uid: document.getElementById("hq-uid"),
    copyUid: document.getElementById("hq-copy-uid"),
    loginBtn: document.getElementById("hq-login"),
    logoutBtn: document.getElementById("hq-logout"),
    retryBtn: document.getElementById("hq-retry"),
  };

  var auth = null;
  var provider = null;
  var busy = false;

  function setStatus(text, kind) {
    if (!els.status) return;
    els.status.textContent = text || "";
    els.status.className = "hq-status" + (kind ? " hq-status--" + kind : "");
  }

  function showView(name) {
    Object.keys(views).forEach(function (key) {
      var el = views[key];
      if (!el) return;
      if (key === name) el.hidden = false;
      else el.hidden = true;
    });
  }

  function setBusy(on) {
    busy = !!on;
    if (els.loginBtn) els.loginBtn.disabled = busy;
    if (els.logoutBtn) els.logoutBtn.disabled = busy;
    if (els.retryBtn) els.retryBtn.disabled = busy;
  }

  function showError(message) {
    if (els.errorMsg) els.errorMsg.textContent = message || "Something went wrong.";
    setStatus(message || "Error", "err");
    showView("error");
  }

  function fillSetup(user) {
    if (els.displayName) els.displayName.textContent = user.displayName || "—";
    if (els.email) els.email.textContent = user.email || "—";
    if (els.uid) els.uid.textContent = user.uid || "—";
  }

  function bootAuth() {
    var bridge = window.NEWON_HQ_FIREBASE;
    if (!bridge || !bridge.isConfigured()) {
      var missing = (bridge && bridge.missingKeys && bridge.missingKeys()) || [
        "apiKey",
        "appId",
      ];
      if (els.configMissing) {
        els.configMissing.textContent = missing.join(", ");
      }
      setStatus("Firebase config incomplete", "err");
      showView("config");
      return;
    }

    try {
      var app = initializeApp(bridge.config);
      auth = getAuth(app);
      provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
    } catch (err) {
      showError("Could not initialize Firebase Auth.");
      return;
    }

    onAuthStateChanged(auth, function (user) {
      setBusy(false);
      if (!user) {
        fillSetup({ displayName: "", email: "", uid: "" });
        setStatus("Signed out");
        showView("signedOut");
        return;
      }
      fillSetup(user);
      setStatus("Authentication successful", "ok");
      showView("setup");
    });
  }

  async function login() {
    if (!auth || busy) return;
    setBusy(true);
    setStatus("Opening Google sign-in…");
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged handles UI
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

  function copyUid() {
    var uid = els.uid && els.uid.textContent ? els.uid.textContent.trim() : "";
    if (!uid || uid === "—") return;
    function done() {
      setStatus("UID copied", "ok");
      if (els.copyUid) {
        var prev = els.copyUid.textContent;
        els.copyUid.textContent = "Copied";
        window.setTimeout(function () {
          els.copyUid.textContent = prev;
        }, 1200);
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(uid).then(done).catch(function () {
        setStatus("Could not copy UID", "err");
      });
      return;
    }
    setStatus("Could not copy UID", "err");
  }

  if (els.loginBtn) els.loginBtn.addEventListener("click", login);
  if (els.logoutBtn) els.logoutBtn.addEventListener("click", logout);
  if (els.copyUid) els.copyUid.addEventListener("click", copyUid);
  if (els.retryBtn) {
    els.retryBtn.addEventListener("click", function () {
      setStatus("");
      if (!auth) {
        showView("loading");
        bootAuth();
        return;
      }
      showView(auth.currentUser ? "setup" : "signedOut");
    });
  }

  showView("loading");
  setStatus("Loading…");
  bootAuth();
})();
