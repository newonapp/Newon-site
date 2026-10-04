/*
 * LIVON account panel + first-sign-in consent dialog (minimal UI in the existing LIVON style; no redesign).
 *
 *   [data-livon-account-panel]  placed by My Life › 설정. Renders NOTHING until a Newon+ project is configured
 *                                (NewonAuth.getState().configured) — anonymous LIVON looks exactly as before.
 *   consent dialog               shown when LivonSync reports "consent-needed": per-collection counts with checkboxes.
 *                                Non-sensitive collections start checked; 건강·가계부·일기·예산 start UNCHECKED.
 *                                "이 기기에만 두기" uploads nothing. Closing the dialog decides nothing.
 * Nothing here shows an email, name, uid, account id or token.
 */
(function (root) {
  "use strict";
  var doc = root.document;
  if (!doc) return;

  var LABELS = {
    saved_items: "저장한 항목", save_folders: "저장 폴더", tasks: "할 일", goals: "목표", calendar_items: "일정", checklists: "체크리스트",
    habits: "습관", projects: "프로젝트", experiences: "경험 기록", preferences: "관심사·설정", life_progress: "라이프 이벤트 진행",
    journal: "일기", transactions: "가계부", health_records: "건강 기록", budgets: "예산"
  };
  var PROVIDER_LABELS = { "google.com": "Google로 로그인", "apple.com": "Apple로 로그인" };
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function A() { return root.NewonAuth; }
  function S() { return root.LivonSync; }
  /* today → 14:05, another day → 10월 3일 14:05 */
  function time(t) {
    if (!t) return "";
    var d = new Date(t), n = new Date(), hm = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    var same = d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
    return same ? hm : (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + hm;
  }
  function lastLine(st) { return st && st.lastSyncAt ? " 마지막 동기화 " + time(st.lastSyncAt) + "." : ""; }

  function syncLine(st) {
    if (!st) return "";
    var r = st.retry || {};
    switch (st.status) {
      case "syncing": return "동기화 중…";
      case "synced": return "동기화됨" + (st.lastSyncAt ? " · 마지막 " + time(st.lastSyncAt) : "");
      case "offline": return "오프라인입니다. 연결되면 다시 동기화합니다. 이 기기의 기록은 그대로 사용할 수 있습니다." + lastLine(st);
      case "error":
        if (st.needsSignIn) return "로그인이 만료되었습니다. 다시 로그인하면 이어서 동기화합니다. 기록은 이 기기에 안전하게 저장되어 있습니다.";
        return "지금은 동기화하지 못했습니다. 기록은 이 기기에 안전하게 저장되어 있습니다." +
          (r.exhausted ? " 자동으로 다시 시도하지 않으니 ‘다시 동기화’를 눌러 주세요." : r.nextAt ? " 잠시 후 자동으로 다시 시도합니다." : "") + lastLine(st);
      case "unavailable": return "계정 동기화를 아직 사용할 수 없습니다. 데이터는 이 기기에 그대로 있습니다.";
      case "waiting-consent": return "이 기기의 데이터를 계정에 저장할지 아직 선택하지 않았습니다.";
      default: return "";
    }
  }
  /* what is still waiting and what was kept twice — counts only, in plain words */
  function detailLine(st, q) {
    if (!st || !q || st.status === "syncing" || st.status === "waiting-consent" || st.status === "unavailable") return "";
    var out = [], waiting = (q.PENDING || 0) + (q.FAILED || 0);
    if (waiting) out.push("아직 계정에 저장되지 않은 변경 " + waiting + "개가 이 기기에 있습니다.");
    if (q.CONFLICT) out.push("두 기기에서 함께 고친 항목 " + q.CONFLICT + "개는 두 버전을 모두 남겼습니다. 내 생활에서 확인해 주세요.");
    return out.join(" ");
  }
  /* public anonymous mode: account UI stays hidden until Newon+ account sync is launched (see livon-auth-bridge.js) */
  function syncPublic() { return root.LIVON_ACCOUNT_SYNC_PUBLIC === true; }
  function panelHtml() {
    if (!syncPublic()) return "";
    var a = A(), s = a && a.getState();
    if (!s || !s.configured || s.status === "loading") return "";
    var h = '<div class="lv-ml-block-label"><p class="lv-ml-kicker">Account</p><h3 class="lv-ml-title lv-ml-title--md">Newon+ 계정</h3></div>';
    if (s.status === "authenticated") {
      var st = S() ? S().status() : null, q = null;
      try { q = S() && typeof S().queue === "function" ? S().queue() : null; } catch (e) { q = null; }
      var detail = detailLine(st, q);
      h += '<ul class="lv-ml-manage-list"><li><div><strong>Newon+ 계정으로 로그인됨</strong><p role="status" data-livon-sync-line>' + esc(syncLine(st)) + "</p>" +
        (detail ? '<p data-livon-sync-detail>' + esc(detail) + "</p>" : "") + "</div>" +
        '<div class="lv-ml-row-acts">' +
          (st && (st.status === "error" || st.status === "offline" || st.status === "synced") ? '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-livon-sync-now>다시 동기화</button>' : "") +
          (st && st.status === "waiting-consent" ? '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-livon-consent-open>가져오기 선택</button>' : "") +
        "</div></li>" +
        (st && st.changedSinceLoad ? '<li><div><strong>다른 기기의 변경 사항을 받았습니다</strong><p>새로고침하면 화면에 반영됩니다.</p></div><div class="lv-ml-row-acts"><button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-livon-reload>새로고침</button></div></li>' : "") +
        '<li><div><strong>민감한 기록 동기화</strong><p>건강·가계부·일기·예산은 직접 켜야만 계정에 저장됩니다.</p></div><div class="lv-ml-row-acts"><label><input type="checkbox" data-livon-sensitive /> 동기화</label></div></li>' +
        '<li><div><strong>로그아웃</strong><p>로그아웃해도 이 기기의 데이터는 지워지지 않습니다.</p><label><input type="checkbox" data-livon-forget /> 이 기기에 남은 계정 사본도 지우기</label></div>' +
        '<div class="lv-ml-row-acts"><button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-livon-signout>로그아웃</button></div></li></ul>';
      return h;
    }
    var providers = a.providers ? a.providers() : [];
    if (!providers.length) return "";                         /* no enabled sign-in method → no button */
    h += '<p class="lv-ml-note">로그인하면 할 일·목표·일정·저장한 항목을 여러 기기에서 이어서 쓸 수 있습니다. 로그인만으로는 아무것도 업로드되지 않습니다.</p>';
    if (s.status === "error") h += '<p class="lv-ml-note" role="status">로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.</p>';
    h += '<p class="lv-ml-inline-acts">' + providers.map(function (p) { return '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-livon-signin="' + esc(p) + '">' + esc(PROVIDER_LABELS[p] || "Newon+ 로그인") + "</button>"; }).join(" ") + "</p>";
    return h;
  }
  function renderPanels() {
    var html = panelHtml();
    Array.prototype.forEach.call(doc.querySelectorAll("[data-livon-account-panel]"), function (el) {
      if (el.__lvHtml === html) return;
      el.__lvHtml = html; el.innerHTML = html; el.hidden = !html;
      var sens = el.querySelector("[data-livon-sensitive]");
      if (sens && S()) { try { var raw = root.localStorage.getItem("livon.sync.v1:" + (S().activeProfile().key || "")); sens.checked = !!(raw && JSON.parse(raw).sensitive); } catch (e) {} }
    });
  }

  /* ───────── consent dialog ───────── */
  var dialog = null, lastFocus = null;
  function closeDialog() { if (!dialog) return; dialog.remove(); dialog = null; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function openDialog() {
    var st = S() && S().status();
    if (!syncPublic() || !st || !st.pending || dialog) return;
    lastFocus = doc.activeElement;
    var rows = [], U = root.LivonUserData;
    function row(c, n, sensitive) { rows.push('<li><label><input type="checkbox" data-livon-import-col="' + esc(c) + '"' + (sensitive ? "" : " checked") + " /> " + esc(LABELS[c] || c) + " " + n + "개" + (sensitive ? " <small>(민감 정보)</small>" : "") + "</label></li>"); }
    Object.keys(st.pending.counts || {}).forEach(function (c) { row(c, st.pending.counts[c], false); });
    Object.keys(st.pending.sensitiveCounts || {}).forEach(function (c) { row(c, st.pending.sensitiveCounts[c], true); });
    dialog = doc.createElement("div");
    dialog.className = "lv-life-modal";
    dialog.innerHTML = '<button type="button" class="lv-life-modal__backdrop" data-livon-consent-close aria-label="닫기" tabindex="-1"></button>' +
      '<div class="lv-life-modal__panel" role="dialog" aria-modal="true" aria-labelledby="livon-consent-title">' +
      '<button type="button" class="lv-life-modal__close" data-livon-consent-close aria-label="닫기">×</button>' +
      '<h2 id="livon-consent-title">이 기기의 데이터를 계정에 저장할까요?</h2>' +
      "<p>선택한 항목만 Newon+ 계정에 저장되고 다른 기기에서도 보입니다. 선택하지 않으면 이 기기에만 남습니다. AI 대화·최근 활동·커뮤니티 글·위치는 저장하지 않습니다.</p>" +
      '<ul class="lv-ml-manage-list" style="list-style:none;padding:0;margin:0">' + rows.join("") + "</ul>" +
      '<div style="margin-top:1.25rem;display:flex;gap:.5rem;flex-wrap:wrap">' +
      '<button type="button" class="lv-life-btn lv-life-btn--dark" data-livon-consent-approve>선택한 항목 계정에 저장</button>' +
      '<button type="button" class="lv-life-btn lv-life-btn--dark" data-livon-consent-decline>이 기기에만 두기</button></div>' +
      '<p class="lv-life-modal__foot">닫으면 아무것도 저장하지 않고, 나중에 My Life › 설정에서 다시 선택할 수 있습니다.</p></div>';
    doc.body.appendChild(dialog);
    var first = dialog.querySelector("input, button[data-livon-consent-approve]");
    if (first) first.focus();
    void U;
  }

  doc.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    var si = t.closest("[data-livon-signin]");
    if (si && A()) { e.preventDefault(); A().signIn({ provider: si.getAttribute("data-livon-signin") }).catch(function () { renderPanels(); }); return; }
    if (t.closest("[data-livon-sync-now]") && S()) { e.preventDefault(); S().syncNow(); return; }
    if (t.closest("[data-livon-reload]")) { e.preventDefault(); root.location.reload(); return; }
    if (t.closest("[data-livon-consent-open]")) { e.preventDefault(); openDialog(); return; }
    if (t.closest("[data-livon-consent-close]")) { e.preventDefault(); closeDialog(); return; }
    if (t.closest("[data-livon-consent-approve]") && dialog && S()) {
      e.preventDefault();
      var cols = Array.prototype.filter.call(dialog.querySelectorAll("[data-livon-import-col]"), function (x) { return x.checked; }).map(function (x) { return x.getAttribute("data-livon-import-col"); });
      var sens = cols.some(function (c) { return root.LivonUserData && root.LivonUserData.SENSITIVE_COLLECTIONS.indexOf(c) >= 0; });
      closeDialog(); S().approveImport({ collections: cols, includeSensitive: sens }); return;
    }
    if (t.closest("[data-livon-consent-decline]") && S()) { e.preventDefault(); closeDialog(); S().declineImport(); return; }
    if (t.closest("[data-livon-signout]") && A()) {
      e.preventDefault();
      var panel = t.closest("[data-livon-account-panel]");
      var forget = !!(panel && panel.querySelector("[data-livon-forget]") && panel.querySelector("[data-livon-forget]").checked);
      var done = function () { A().signOut().then(function () { root.location.reload(); }); };
      if (S()) S().onSignedOut({ finalSync: true, forgetAccountOnDevice: forget, reload: false }).then(done, done); else done();
    }
  });
  doc.addEventListener("change", function (e) {
    var t = e.target;
    if (t && t.matches && t.matches("[data-livon-sensitive]") && S()) S().setSensitive(!!t.checked);
  });
  doc.addEventListener("keydown", function (e) { if (dialog && e.key === "Escape") closeDialog(); });

  function boot() {
    if (A()) A().subscribe(function () { renderPanels(); });
    if (S()) S().subscribe(function (ev) { renderPanels(); if (ev.type === "consent-needed") openDialog(); });
    if (root.MutationObserver) new root.MutationObserver(function () { var el = doc.querySelector("[data-livon-account-panel]"); if (el && el.__lvHtml === undefined) renderPanels(); }).observe(doc.body, { childList: true, subtree: true });
    renderPanels();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot); else boot();
  root.LivonAccountUI = { render: renderPanels, openConsent: openDialog, panelHtml: panelHtml };
})(typeof window !== "undefined" ? window : globalThis);
