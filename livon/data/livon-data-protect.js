/*
 * LIVON data protection (Anonymous Free Mode) — LIVON Next V1.
 *
 * LIVON keeps everything in this browser. This module lets the person protect that data without any server:
 *   A. backup   — every LIVON-owned key ("livon." prefix) in localStorage → one JSON file (format, version, createdAt)
 *   B. restore  — a backup file is checked (JSON, format, version, keys, values) before anything is written; by default
 *                 only keys this device does not have yet are added; replacing needs an explicit choice + confirmation;
 *                 a failed write rolls every key back to what it was before
 *   C. delete   — removes LIVON-owned keys only (localStorage + sessionStorage "livon."); ONGIL ("ongil."), Newon
 *                 ("newon-") and anything else on the same site are never touched; needs a separate confirmation
 *   D. quota    — a localStorage write that fails for a LIVON key (QuotaExceededError) is noticed, the same error is
 *                 re-thrown to the caller (behaviour unchanged), and a dismissible notice offers a backup
 *
 * Not included in a backup: provider caches (livon.data.v1:*), account-sync machinery (vault, cursors, active profile,
 * device meta) and sessionStorage drafts. Nothing is uploaded, logged or sent anywhere: files are made and read in the
 * browser (Blob / FileReader). No account, Firebase or server sync is used or switched on here.
 */
(function (root) {
  "use strict";
  if (!root || typeof root !== "object") return;

  var FORMAT = "livon-backup";
  var VERSION = 1;
  var PREFIX = "livon.";
  var MAX_FILE_BYTES = 10 * 1024 * 1024;
  var MAX_KEYS = 400;
  var MAX_VALUE = 5 * 1024 * 1024;
  /* never exported / imported: caches and account-sync machinery (device- or account-specific, not the person's content) */
  var EXCLUDED_PREFIXES = ["livon.data.v1", "livon.vault.", "livon.sync.v1:"];
  var EXCLUDED_KEYS = ["livon.activeProfile.v1", "livon.userData.meta.v1"];

  function ls() { try { return root.localStorage || null; } catch (e) { return null; } }
  function ss() { try { return root.sessionStorage || null; } catch (e) { return null; } }
  function isOwned(k) { return typeof k === "string" && k.indexOf(PREFIX) === 0; }
  function isExcluded(k) {
    if (EXCLUDED_KEYS.indexOf(k) >= 0) return true;
    for (var i = 0; i < EXCLUDED_PREFIXES.length; i++) if (k.indexOf(EXCLUDED_PREFIXES[i]) === 0) return true;
    return false;
  }
  function isBadName(k) { return k === "__proto__" || k === "constructor" || k === "prototype"; }
  function keysOf(store) {
    var out = [];
    if (!store) return out;
    try { for (var i = 0; i < store.length; i++) { var k = store.key(i); if (k != null) out.push(k); } } catch (e) {}
    return out;
  }
  function inventoryEntry(k) { var U = root.LivonUserData; try { return U && U.entryFor ? U.entryFor(k) : null; } catch (e) { return null; } }
  /* a key LIVON knows (inventory), stored in localStorage, that a backup may carry */
  function backupable(k) {
    if (!isOwned(k) || isExcluded(k) || isBadName(k)) return false;
    var e = inventoryEntry(k);
    if (!root.LivonUserData) return true;            /* inventory not loaded: fall back to the prefix rule */
    return !!e && e.storage === "local" && e.cls !== "SERVER_SOURCE_CACHE" && e.cls !== "SESSION_ONLY";
  }
  function bytes(s) { return String(s || "").length * 2; }   /* UTF-16 code units, as browsers count localStorage */

  /* ───────── A. backup ───────── */
  function collect() {
    var store = ls(), out = {}, size = 0, n = 0;
    keysOf(store).sort().forEach(function (k) {
      if (!backupable(k)) return;
      var v = null;
      try { v = store.getItem(k); } catch (e) { v = null; }
      if (typeof v !== "string") return;
      out[k] = v; size += bytes(k) + bytes(v); n++;
    });
    return { keys: out, count: n, bytes: size };
  }
  function buildBackup(now) {
    var c = collect();
    return {
      format: FORMAT, version: VERSION, app: "LIVON",
      createdAt: new Date(now == null ? Date.now() : now).toISOString(),
      notice: "이 파일에는 일정·기록·건강·생활비 같은 개인 정보가 들어 있을 수 있어요. 안전한 곳에 보관하고 다른 사람과 공유하지 마세요.",
      keyCount: c.count,
      keys: c.keys
    };
  }
  function fileName(now) {
    var d = new Date(now == null ? Date.now() : now);
    var p = function (x) { return String(x).padStart(2, "0"); };
    return "livon-backup-" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes()) + ".json";
  }
  /* browser download only: a Blob URL clicked locally and revoked — nothing is uploaded */
  function download() {
    try {
      var payload = buildBackup();
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = fileName(); a.rel = "noopener"; a.style.display = "none";
      document.body.appendChild(a); a.click();
      setTimeout(function () { try { URL.revokeObjectURL(url); a.remove(); } catch (e) {} }, 0);
      return { ok: true, count: payload.keyCount };
    } catch (e) { return { ok: false }; }
  }

  /* ───────── B. restore ───────── */
  /* returns { ok:true, keys, createdAt, count, add:[], replace:[], same:[] } or { ok:false, reason, message } — writes nothing */
  function validate(text) {
    function no(reason, message) { return { ok: false, reason: reason, message: message }; }
    if (typeof text !== "string" || !text.trim()) return no("EMPTY", "빈 파일이에요. LIVON 백업 파일을 골라 주세요.");
    if (text.length > MAX_FILE_BYTES) return no("TOO_LARGE", "파일이 너무 커요(10MB 초과). LIVON 백업 파일이 맞는지 확인해 주세요.");
    var obj;
    try { obj = JSON.parse(text); } catch (e) { return no("NOT_JSON", "JSON 형식이 아니거나 파일이 손상됐어요. 다른 백업 파일을 골라 주세요."); }
    if (!obj || typeof obj !== "object" || Array.isArray(obj) || obj.format !== FORMAT) return no("NOT_LIVON", "LIVON 백업 파일이 아니에요.");
    if (typeof obj.version !== "number" || obj.version % 1 !== 0 || obj.version < 1) return no("BAD_VERSION", "백업 파일의 버전 정보가 올바르지 않아요.");
    if (obj.version > VERSION) return no("NEWER_VERSION", "더 새로운 LIVON에서 만든 백업이에요(버전 " + obj.version + "). 페이지를 새로 고친 뒤 다시 시도해 주세요.");
    if (typeof obj.createdAt !== "string" || isNaN(Date.parse(obj.createdAt))) return no("BAD_DATE", "백업 파일의 생성 시각이 올바르지 않아요.");
    var keys = obj.keys;
    if (!keys || typeof keys !== "object" || Array.isArray(keys)) return no("BAD_KEYS", "백업 파일의 데이터 부분이 손상됐어요.");
    var names = Object.keys(keys);
    if (!names.length) return no("NO_DATA", "백업 파일에 가져올 데이터가 없어요.");
    if (names.length > MAX_KEYS) return no("TOO_MANY", "백업 파일에 항목이 너무 많아요.");
    for (var i = 0; i < names.length; i++) {
      var k = names[i], v = keys[k];
      if (!backupable(k)) return no("FOREIGN_KEY", "LIVON이 아닌 데이터나 가져올 수 없는 항목이 들어 있어요. 파일을 확인해 주세요.");
      if (typeof v !== "string" || v.length > MAX_VALUE) return no("BAD_VALUE", "백업 파일의 일부 값이 손상됐어요.");
      /* LIVON writes JSON; only the few flag keys documented as raw strings ('paused'|'playing') are exempt —
         a truncated or edited value is refused here, before anything is written */
      var e = inventoryEntry(k);
      if (!(e && /'/.test(String(e.schema || "")))) {
        try { JSON.parse(v); } catch (er) { return no("BAD_VALUE", "백업 파일의 일부 데이터가 손상됐어요(" + k + ")."); }
      }
    }
    var store = ls(), add = [], replace = [], same = [];
    names.forEach(function (k2) {
      var cur = null; try { cur = store ? store.getItem(k2) : null; } catch (e) { cur = null; }
      if (cur == null) add.push(k2); else if (cur === keys[k2]) same.push(k2); else replace.push(k2);
    });
    return { ok: true, keys: keys, createdAt: obj.createdAt, count: names.length, add: add, replace: replace, same: same };
  }
  /* mode "keep" (default): only keys missing on this device are written. mode "replace": every key in the file is written.
     All-or-nothing: on any write failure every touched key is put back as it was. */
  function restore(checked, mode) {
    var store = ls();
    if (!store || !checked || !checked.ok) return { ok: false, reason: "INVALID" };
    var list = mode === "replace" ? checked.add.concat(checked.replace) : checked.add.slice();
    if (!list.length) return { ok: true, written: 0 };
    var before = {};
    list.forEach(function (k) { try { before[k] = store.getItem(k); } catch (e) { before[k] = null; } });
    var done = [];
    try {
      list.forEach(function (k) { store.setItem(k, checked.keys[k]); done.push(k); });
    } catch (err) {
      /* roll back: drop what was new first (frees space), then put the old values back */
      done.slice().reverse().forEach(function (k) {
        try { if (before[k] == null) store.removeItem(k); } catch (e) {}
      });
      done.forEach(function (k) {
        try { if (before[k] != null) store.setItem(k, before[k]); } catch (e) {}
      });
      return { ok: false, reason: isQuota(err) ? "QUOTA" : "WRITE_FAILED", written: 0 };
    }
    return { ok: true, written: done.length };
  }

  /* ───────── C. delete ───────── */
  function deletionPlan() {
    var local = keysOf(ls()).filter(isOwned), session = keysOf(ss()).filter(isOwned), size = 0;
    local.forEach(function (k) { try { size += bytes(k) + bytes(ls().getItem(k)); } catch (e) {} });
    var others = keysOf(ls()).filter(function (k) { return !isOwned(k); });
    return { local: local, session: session, bytes: size, otherKeys: others.length };
  }
  function accountActive() { var U = root.LivonUserData; try { return !!(U && U.mode && U.mode() === "account"); } catch (e) { return false; } }
  function deleteAll() {
    if (accountActive()) return { ok: false, reason: "ACCOUNT_ACTIVE" };
    var plan = deletionPlan(), removed = 0, failed = 0;
    [[ls(), plan.local], [ss(), plan.session]].forEach(function (pair) {
      pair[1].forEach(function (k) { try { pair[0].removeItem(k); removed++; } catch (e) { failed++; } });
    });
    var left = keysOf(ls()).filter(isOwned).length + keysOf(ss()).filter(isOwned).length;
    return { ok: failed === 0 && left === 0, removed: removed, left: left };
  }

  /* ───────── D. storage full ───────── */
  function isQuota(err) {
    if (!err) return false;
    var n = String(err.name || ""), c = err.code;
    return n === "QuotaExceededError" || n === "NS_ERROR_DOM_QUOTA_REACHED" || c === 22 || c === 1014;
  }
  var quota = { count: 0, lastAt: 0, lastKey: null };
  function noteQuota(key) {
    quota.count++; quota.lastAt = Date.now(); quota.lastKey = key;
    try { root.dispatchEvent(new CustomEvent("livon:storage-full", { detail: { count: quota.count } })); } catch (e) {}
    showNotice();
  }
  /* observe Storage.setItem for LIVON keys in localStorage; the original error is always re-thrown */
  (function hook() {
    var S = root.Storage, store = ls();
    if (!S || !S.prototype || typeof S.prototype.setItem !== "function" || !store || !(store instanceof S) || S.prototype.setItem.__livonProtect) return;
    var orig = S.prototype.setItem;
    var wrapped = function (k, v) {
      try { return orig.call(this, k, v); }
      catch (err) {
        try { if (this === ls() && isOwned(String(k)) && isQuota(err)) noteQuota(String(k)); } catch (e) {}
        throw err;
      }
    };
    wrapped.__livonProtect = true;
    try { S.prototype.setItem = wrapped; } catch (e) {}
  })();
  function usage() {
    var c = collect(), all = 0;
    keysOf(ls()).filter(isOwned).forEach(function (k) { try { all += bytes(k) + bytes(ls().getItem(k)); } catch (e) {} });
    return { backupKeys: c.count, backupBytes: c.bytes, livonBytes: all, fallback: Array.isArray(root.LIVON_STORAGE_FALLBACK) && root.LIVON_STORAGE_FALLBACK.indexOf("localStorage") >= 0 };
  }

  /* ───────── UI ───────── */
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function kb(b) { return b < 1024 ? b + " B" : b < 1048576 ? Math.round(b / 102.4) / 10 + " KB" : Math.round(b / 104857.6) / 10 + " MB"; }
  function fmtDate(iso) { var d = new Date(iso); if (isNaN(d)) return ""; var p = function (x) { return String(x).padStart(2, "0"); }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()); }

  var noticeEl = null, noticeShownAt = 0;
  function showNotice() {
    try {
      if (!root.document || !document.body) return;
      if (noticeEl && document.body.contains(noticeEl)) return;
      if (Date.now() - noticeShownAt < 60000 && noticeShownAt) return;
      noticeShownAt = Date.now();
      noticeEl = document.createElement("div");
      noticeEl.className = "lv-dp-notice";
      noticeEl.setAttribute("role", "alert");
      noticeEl.setAttribute("style", "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:1200;width:min(560px,calc(100vw - 32px));box-sizing:border-box;background:#fff;color:#171717;border:2px solid #b3261e;border-radius:4px;padding:14px 16px;box-shadow:0 8px 24px rgba(0,0,0,.18);font-family:inherit;font-size:15px;line-height:1.55");
      noticeEl.innerHTML = "<strong>이 기기의 저장 공간이 부족해요.</strong><p style=\"margin:6px 0 10px\">방금 바꾼 내용 일부가 저장되지 않았을 수 있어요. 데이터를 잃지 않도록 지금 백업 파일을 받아 두세요. 백업은 이 브라우저에서 파일로만 만들어지고 어디에도 올라가지 않아요.</p>" +
        "<div style=\"display:flex;flex-wrap:wrap;gap:8px\"><button type=\"button\" class=\"lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm\" data-lv-dp-notice-backup style=\"min-height:44px\">백업 받기</button>" +
        "<a class=\"lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm\" href=\"#ml-settings\" data-lv-dp-notice-close style=\"min-height:44px;display:inline-flex;align-items:center\">데이터 관리로 이동</a>" +
        "<button type=\"button\" class=\"lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm\" data-lv-dp-notice-close style=\"min-height:44px\">닫기</button></div>";
      document.body.appendChild(noticeEl);
    } catch (e) {}
  }
  function closeNotice() { try { if (noticeEl) noticeEl.remove(); } catch (e) {} noticeEl = null; }

  var ui = { pending: null, fileName: "", message: "", messageKind: "", deleteOpen: false };
  function panelHtml() {
    var u = usage(), plan = deletionPlan(), checked = ui.pending;
    var msg = ui.message ? '<p class="lv-ml-note" role="' + (ui.messageKind === "error" ? "alert" : "status") + '" data-lv-dp-msg style="' + (ui.messageKind === "error" ? "color:#b3261e;font-weight:600" : "font-weight:600") + '">' + esc(ui.message) + "</p>" : '<p class="lv-ml-note" role="status" data-lv-dp-msg></p>';
    var restoreBox = "";
    if (checked && checked.ok) {
      restoreBox = '<div class="lv-dp-box" data-lv-dp-review style="border:1px solid #d8d8d8;padding:12px 14px;margin-top:10px">' +
        '<p style="margin:0 0 6px"><strong>' + esc(ui.fileName || "백업 파일") + "</strong> · 만든 시각 " + esc(fmtDate(checked.createdAt)) + " · 항목 " + checked.count + "개</p>" +
        '<p class="lv-ml-note" style="margin:0 0 8px">이 기기에 없는 항목 ' + checked.add.length + "개 · 이 기기와 내용이 다른 항목 " + checked.replace.length + "개 · 같은 항목 " + checked.same.length + "개</p>" +
        '<fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:700;margin-bottom:4px">가져오는 방법</legend>' +
          '<label style="display:flex;gap:8px;align-items:flex-start;min-height:44px;padding:6px 0"><input type="radio" name="lv-dp-mode" value="keep" checked data-lv-dp-mode /> <span><strong>기존 데이터 보존 (권장)</strong><br>이 기기에 없는 항목만 가져와요. 지금 있는 데이터는 바뀌지 않아요.</span></label>' +
          '<label style="display:flex;gap:8px;align-items:flex-start;min-height:44px;padding:6px 0"><input type="radio" name="lv-dp-mode" value="replace" data-lv-dp-mode /> <span><strong>백업 내용으로 덮어쓰기</strong><br>내용이 다른 ' + checked.replace.length + "개 항목이 백업 파일 내용으로 바뀌어요. 지금 기기에 있는 그 항목의 내용은 사라져요.</span></label>" +
        "</fieldset>" +
        '<label data-lv-dp-replace-ack hidden style="min-height:44px;padding:6px 0"><input type="checkbox" data-lv-dp-replace-confirm /> <span>덮어쓰면 지금 기기의 해당 데이터를 되돌릴 수 없다는 것을 확인했어요. (먼저 ‘백업 받기’로 현재 데이터를 저장해 둘 수 있어요.)</span></label>' +
        '<p class="lv-ml-inline-acts"><button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-dp-restore>복원하기</button> <button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-dp-cancel>취소</button></p></div>';
    }
    var del = ui.deleteOpen
      ? '<div class="lv-dp-box" data-lv-dp-delete-box style="border:2px solid #b3261e;padding:12px 14px;margin-top:10px">' +
          '<p style="margin:0 0 6px"><strong>지워지는 것</strong> — 이 브라우저에 있는 LIVON 데이터 전부 (' + (plan.local.length + plan.session.length) + "개 항목, 약 " + kb(plan.bytes) + "): 내 생활 기록(일정·할 일·목표·일기·생활비·건강), 저장한 항목, 커뮤니티에서 이 기기에 쓴 글, 맞춤 설정·관심사, LIVON AI 대화, 최근 본 항목, 화면 설정.</p>" +
          '<p style="margin:0 0 6px"><strong>남는 것</strong> — ONGIL 데이터, Newon 다른 서비스 설정' + (plan.otherKeys ? " (" + plan.otherKeys + "개 항목)" : "") + ", Newon+ 계정. 서버에 있는 데이터는 없어서 지울 것이 없어요.</p>" +
          '<p class="lv-ml-note" style="margin:0 0 8px">되돌릴 수 없어요. 지우기 전에 ‘백업 받기’로 파일을 받아 두면 나중에 복원할 수 있어요.</p>' +
          '<label style="display:flex;gap:8px;align-items:flex-start;min-height:44px;padding:6px 0"><input type="checkbox" data-lv-dp-delete-confirm /> <span>LIVON 데이터를 이 기기에서 모두 지우고 되돌릴 수 없다는 것을 확인했어요.</span></label>' +
          '<p class="lv-ml-inline-acts"><button type="button" class="lv-ml-btn lv-ml-btn--sm lv-ml-btn--danger" data-lv-dp-delete-run style="background:#b3261e;border-color:#b3261e;color:#fff" disabled>LIVON 데이터 모두 삭제</button> <button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-dp-delete-cancel>취소</button></p></div>'
      : "";
    return '<div class="lv-ml-block-label" style="margin-top:1.5rem"><p class="lv-ml-kicker" lang="en">Backup</p><h3 class="lv-ml-title lv-ml-title--md" id="lv-dp-title" tabindex="-1">LIVON 데이터 백업 · 복원 · 삭제</h3></div>' +
      '<p class="lv-ml-note">LIVON은 회원가입 없이 이 브라우저에만 저장해요. 브라우저 데이터를 지우거나 기기를 바꾸면 사라질 수 있으니 가끔 백업 파일을 받아 두세요. 백업·복원은 이 브라우저 안에서만 처리되고 서버로 보내지지 않아요.</p>' +
      (u.fallback ? '<p class="lv-ml-note" role="status" style="color:#b3261e;font-weight:600">이 브라우저는 저장을 막고 있어서 지금 데이터는 창을 닫으면 사라져요. 필요하면 백업 파일을 받아 두세요.</p>' : "") +
      '<ul class="lv-ml-manage-list" aria-labelledby="lv-dp-title">' +
        "<li><div><strong>이 기기의 LIVON 데이터</strong><p>백업할 수 있는 항목 " + u.backupKeys + "개 · 약 " + kb(u.backupBytes) + (quota.count ? " · 최근 저장 실패 " + quota.count + "회" : "") + "</p></div></li>" +
      "</ul>" + msg +
      '<p class="lv-ml-inline-acts"><button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-dp-backup' + (u.backupKeys ? "" : " disabled") + ">백업 받기 (JSON)</button> " +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-dp-pick>백업 파일로 복원…</button>' +
        '<input type="file" accept="application/json,.json" data-lv-dp-file hidden aria-label="복원할 LIVON 백업 파일" /></p>' +
      '<p class="lv-ml-note">백업 파일에는 일기·건강·생활비 같은 개인 정보가 들어 있을 수 있어요. 다른 사람과 공유하지 말고 안전한 곳에 보관하세요.</p>' +
      restoreBox +
      '<div class="lv-ml-block-label" style="margin-top:1.25rem"><p class="lv-ml-kicker" lang="en" style="color:#b3261e">Danger zone</p><h3 class="lv-ml-title lv-ml-title--md" id="lv-dp-del-title">LIVON 데이터 전체 삭제</h3></div>' +
      '<p class="lv-ml-note">이 브라우저의 LIVON 데이터를 모두 지우고 처음 상태로 돌아가요. ONGIL과 다른 Newon 서비스 데이터는 지우지 않아요.</p>' +
      (ui.deleteOpen ? "" : '<p class="lv-ml-inline-acts"><button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm lv-ml-btn--danger-outline" data-lv-dp-delete-open style="color:#b3261e;border-color:#b3261e">LIVON 데이터 전체 삭제…</button></p>') +
      del;
  }
  var hosts = [];
  function render(host, focusSel) {
    if (!host) return;
    host.innerHTML = panelHtml();
    if (focusSel) { var f = host.querySelector(focusSel); if (f) f.focus({ preventScroll: false }); }
  }
  function say(host, text, kind, focusSel) { ui.message = text; ui.messageKind = kind || "ok"; render(host, focusSel); }
  function bind(host) {
    if (host.__lvdp) return; host.__lvdp = true;
    host.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest("[data-lv-dp-backup]")) {
        var r = download();
        say(host, r.ok ? "백업 파일(" + r.count + "개 항목)을 내려받았어요. 파일은 이 기기에만 저장돼요." : "이 브라우저에서는 파일을 내려받을 수 없어요.", r.ok ? "ok" : "error", "[data-lv-dp-backup]");
        return;
      }
      if (t.closest("[data-lv-dp-pick]")) { var fi = host.querySelector("[data-lv-dp-file]"); if (fi) fi.click(); return; }
      if (t.closest("[data-lv-dp-cancel]")) { ui.pending = null; ui.fileName = ""; say(host, "복원을 취소했어요. 아무것도 바뀌지 않았어요.", "ok", "[data-lv-dp-pick]"); return; }
      if (t.closest("[data-lv-dp-restore]")) {
        var modeEl = host.querySelector("[data-lv-dp-mode]:checked"), mode = modeEl ? modeEl.value : "keep";
        if (mode === "replace") {
          var ack = host.querySelector("[data-lv-dp-replace-confirm]");
          if (!ack || !ack.checked) { var lab = host.querySelector("[data-lv-dp-replace-ack]"); if (lab) lab.hidden = false; if (ack) ack.focus(); return; }
        }
        var fresh = ui.pendingText ? validate(ui.pendingText) : ui.pending;   /* re-check against the device as it is now */
        if (!fresh.ok) { ui.pending = null; say(host, fresh.message, "error", "[data-lv-dp-pick]"); return; }
        var res = restore(fresh, mode);
        ui.pending = null; ui.pendingText = null;
        if (res.ok) {
          say(host, res.written ? "백업에서 " + res.written + "개 항목을 복원했어요. 화면을 새로 고치면 모든 메뉴에 반영돼요." : "가져올 새 항목이 없어요. 기존 데이터는 그대로예요.", "ok", "#lv-dp-title");
          if (res.written) { var again = host.querySelector("[data-lv-dp-msg]"); if (again) again.insertAdjacentHTML("afterend", '<p class="lv-ml-inline-acts"><button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-dp-reload>지금 새로 고치기</button></p>'); }
        } else {
          say(host, res.reason === "QUOTA" ? "저장 공간이 부족해 복원하지 못했어요. 기존 데이터는 그대로 되돌려 두었어요." : "복원 중 문제가 생겨 멈췄어요. 기존 데이터는 그대로 되돌려 두었어요.", "error", "[data-lv-dp-pick]");
        }
        return;
      }
      if (t.closest("[data-lv-dp-reload]")) { try { root.location.reload(); } catch (er) {} return; }
      if (t.closest("[data-lv-dp-delete-open]")) { ui.deleteOpen = true; ui.message = ""; render(host, "[data-lv-dp-delete-confirm]"); return; }
      if (t.closest("[data-lv-dp-delete-cancel]")) { ui.deleteOpen = false; say(host, "삭제를 취소했어요. 아무것도 지우지 않았어요.", "ok", "[data-lv-dp-delete-open]"); return; }
      if (t.closest("[data-lv-dp-delete-run]")) {
        var cb = host.querySelector("[data-lv-dp-delete-confirm]");
        if (!cb || !cb.checked) { if (cb) cb.focus(); return; }
        var d = deleteAll();
        if (d.reason === "ACCOUNT_ACTIVE") { ui.deleteOpen = false; say(host, "계정에 연결된 상태에서는 여기서 지울 수 없어요.", "error"); return; }
        ui.deleteOpen = false;
        if (d.ok) {
          host.innerHTML = '<p class="lv-ml-note" role="status" style="font-weight:600" tabindex="-1" data-lv-dp-done>LIVON 데이터 ' + d.removed + "개 항목을 지웠어요. 처음 상태로 다시 불러올게요.</p>";
          var done = host.querySelector("[data-lv-dp-done]"); if (done) done.focus();
          setTimeout(function () { try { root.location.hash = "#livon-home"; root.location.reload(); } catch (er) {} }, 1200);
        } else say(host, "일부 항목을 지우지 못했어요(" + d.left + "개 남음). 다시 시도해 주세요.", "error");
        return;
      }
    });
    host.addEventListener("change", function (e) {
      var t = e.target;
      if (t.matches("[data-lv-dp-delete-confirm]")) { var run = host.querySelector("[data-lv-dp-delete-run]"); if (run) run.disabled = !t.checked; return; }
      if (t.matches("[data-lv-dp-mode]")) { var lab = host.querySelector("[data-lv-dp-replace-ack]"); if (lab) lab.hidden = t.value !== "replace"; return; }
      if (t.matches("[data-lv-dp-file]")) {
        var file = t.files && t.files[0];
        t.value = "";
        if (!file) return;
        if (file.size > MAX_FILE_BYTES) { ui.pending = null; say(host, "파일이 너무 커요(10MB 초과). LIVON 백업 파일이 맞는지 확인해 주세요.", "error", "[data-lv-dp-pick]"); return; }
        var reader = new FileReader();
        reader.onload = function () {
          var text = String(reader.result || "");
          var v = validate(text);
          if (!v.ok) { ui.pending = null; ui.pendingText = null; say(host, v.message + " 기존 데이터는 바뀌지 않았어요.", "error", "[data-lv-dp-pick]"); return; }
          ui.pending = v; ui.pendingText = text; ui.fileName = String(file.name || "").slice(0, 80);
          say(host, "백업 파일을 확인했어요. 아래에서 가져오는 방법을 고른 뒤 ‘복원하기’를 눌러 주세요. 아직 아무것도 바뀌지 않았어요.", "ok", "[data-lv-dp-mode]");
        };
        reader.onerror = function () { say(host, "파일을 읽지 못했어요. 다시 골라 주세요.", "error", "[data-lv-dp-pick]"); };
        reader.readAsText(file);
      }
    });
  }
  function mount(host) {
    if (!host) return;
    if (hosts.indexOf(host) < 0) hosts.push(host);
    bind(host); render(host);
  }
  /* My Life › 설정: the section is added under "내 생활 데이터" whenever that panel is (re)rendered — no My Life file changes */
  function autoMount() {
    if (!root.document || typeof MutationObserver !== "function") return;
    var ensure = function () {
      try {
        var anchor = document.getElementById("ml-data-title");
        if (!anchor) return;
        var panel = anchor.closest("[data-lv-ml-panel], .lv-ml-panel, section, div") || anchor.parentNode;
        var scope = document.getElementById("life-now") || document.body;
        if (scope.querySelector("[data-livon-data-protect]")) return;
        var host = document.createElement("div");
        host.setAttribute("data-livon-data-protect", "");
        /* after the "내 생활 데이터" block: its last note paragraph */
        var block = anchor.closest(".lv-ml-block-label"), after = block, n = block;
        for (var i = 0; i < 4 && n && n.nextElementSibling; i++) { n = n.nextElementSibling; after = n; if (n.matches && n.matches("p.lv-ml-note") && i > 0) break; }
        (after && after.parentNode ? after.parentNode : panel).insertBefore(host, after ? after.nextSibling : null);
        mount(host);
      } catch (e) {}
    };
    var start = function () {
      ensure();
      var scope = document.getElementById("life-now") || document.body;
      try { new MutationObserver(function () { ensure(); }).observe(scope, { childList: true, subtree: true }); } catch (e) {}
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  }
  if (root.document) {
    root.document.addEventListener("click", function (e) {
      if (!noticeEl) return;
      if (e.target.closest("[data-lv-dp-notice-backup]")) { download(); closeNotice(); return; }
      if (e.target.closest("[data-lv-dp-notice-close]")) closeNotice();
    });
    root.document.addEventListener("keydown", function (e) { if (e.key === "Escape" && noticeEl) closeNotice(); });
    autoMount();
  }

  root.LivonDataProtect = {
    FORMAT: FORMAT, VERSION: VERSION, PREFIX: PREFIX,
    buildBackup: buildBackup, download: download, fileName: fileName,
    validate: validate, restore: restore,
    deletionPlan: deletionPlan, deleteAll: deleteAll,
    isQuota: isQuota, quota: function () { return { count: quota.count, lastAt: quota.lastAt }; }, usage: usage,
    backupable: backupable, mount: mount, showNotice: showNotice
  };
})(typeof window !== "undefined" ? window : globalThis);
