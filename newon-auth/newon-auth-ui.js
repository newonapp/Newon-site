/*
 * Newon+ Auth — shared account-status UI boundary (V1: available, NOT mounted by any page).
 *
 * NewonAuthUI.mount(hostElement, { auth, onSignInRequested, labels }) → unmount()
 *   not configured / loading → renders nothing (host hidden). No login UI appears while no Newon+ project exists.
 *   anonymous (configured)   → one neutral "Newon+ 로그인" button → onSignInRequested() (the service opens its sign-in flow;
 *                              provider buttons are rendered by that flow from the methods the project enables — none are faked here)
 *   authenticated            → "Newon+ 계정으로 로그인됨" + 로그아웃 (NewonAuth.signOut). No email / name / photo is shown.
 *   error                    → a short Korean notice; never the raw error code.
 */
(function (root) {
  "use strict";
  var LABELS = { signIn: "Newon+ 로그인", signedIn: "Newon+ 계정으로 로그인됨", signOut: "로그아웃", error: "로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function render(state, L) {
    if (!state || !state.configured || state.status === "loading") return "";
    if (state.status === "authenticated") return '<span class="newon-auth__status" role="status">' + esc(L.signedIn) + '</span> <button type="button" class="newon-auth__btn" data-newon-auth-signout>' + esc(L.signOut) + "</button>";
    if (state.status === "error") return '<span class="newon-auth__status" role="status">' + esc(L.error) + "</span>";
    return '<button type="button" class="newon-auth__btn" data-newon-auth-signin>' + esc(L.signIn) + "</button>";
  }

  function mount(host, opts) {
    opts = opts || {};
    var auth = opts.auth || root.NewonAuth;
    if (!host || !auth || typeof auth.subscribe !== "function") return function () {};
    var L = Object.assign({}, LABELS, opts.labels || {});
    function paint(state) { var html = render(state, L); host.innerHTML = html; host.hidden = !html; }
    function onClick(e) {
      var t = e && e.target && e.target.closest ? e.target : null;
      if (t && t.closest("[data-newon-auth-signout]")) { e.preventDefault(); auth.signOut(); return; }
      if (t && t.closest("[data-newon-auth-signin]")) { e.preventDefault(); if (typeof opts.onSignInRequested === "function") opts.onSignInRequested(); }
    }
    paint(auth.getState());
    var off = auth.subscribe(function (ev) { paint(ev.state); });
    if (host.addEventListener) host.addEventListener("click", onClick);
    return function () { off(); if (host.removeEventListener) host.removeEventListener("click", onClick); host.innerHTML = ""; host.hidden = true; };
  }

  root.NewonAuthUI = { mount: mount, render: render, LABELS: LABELS };
})(typeof window !== "undefined" ? window : globalThis);
