/*
 * LIVON accessibility layer — loaded after every other LIVON script.
 *
 * The page's inline router is pinned by CSP hashes and is not edited. Everything here works from the outside:
 *
 *   skip link     "본문으로 건너뛰기" moves focus to the screen that is showing (its href would route to Home).
 *   titles        every view gets its own document title; a title left behind by another view is replaced.
 *   route status  a polite status line names the new screen after a view change.
 *   dialogs       Tab stays inside the open modal dialog when the dialog's own script does not already do it, and
 *                 focus returns to the control that opened it when the dialog closes and leaves focus nowhere.
 *   disclosure    focus returns to the control that opened a panel when the panel closes from the keyboard.
 *   tabs          arrow keys / Home / End move between tabs in tab lists that do not manage it themselves.
 *   chips         buttons whose selection is shown with the .is-on class expose it as aria-pressed.
 *   headings      in sub-views whose title is level 1, the section headings below it follow without a gap.
 *   language      short English labels rendered by scripts are marked lang="en" (static ones are marked in the HTML).
 *   motion        a control on each film header pauses every background video; "reduce motion" starts paused.
 *
 * Nothing is sent anywhere. One local preference is kept: livon.a11y.motion.v1 ("paused" | "playing").
 */
(function (root) {
  "use strict";
  var doc = root.document;
  if (!doc || !doc.documentElement) return;
  var html = doc.documentElement;
  var BASE_TITLE = doc.title || "LIVON";
  var VIEW_NAME = { home: "", life: "라이프 스테이지", today: "오늘의 발견", "life-now": "내 생활", explore: "탐색", community: "커뮤니티", "livon-ai": "LIVON AI", help: "도움말" };
  var MOTION_KEY = "livon.a11y.motion.v1";

  function view() { return html.getAttribute("data-lv-view") || "home"; }
  function screen() { return doc.querySelector('main > [data-lv-screen="' + view() + '"]'); }
  function $$(sel, base) { return Array.prototype.slice.call((base || doc).querySelectorAll(sel)); }
  function shown(el) {
    if (!el || !el.getClientRects || !el.getClientRects().length) return false;
    var cs = root.getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none";
  }
  function focusables(box) {
    return $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]', box).filter(function (el) {
      return el.tabIndex >= 0 && shown(el) && !el.closest("[inert]") && !el.closest('[aria-hidden="true"]');
    });
  }

  /* ---------- keyboard / pointer modality ---------- */
  var keyboard = false;
  doc.addEventListener("keydown", function (e) { if (!e.metaKey && !e.ctrlKey && !e.altKey) keyboard = true; }, true);
  doc.addEventListener("pointerdown", function () { keyboard = false; }, true);

  /* ---------- skip link ---------- */
  function initSkip() {
    var skip = doc.querySelector("a.skip-link");
    if (!skip) return;
    skip.addEventListener("click", function (e) {
      var s = screen();
      if (!s) return;
      e.preventDefault();
      if (!s.hasAttribute("tabindex")) s.setAttribute("tabindex", "-1");
      try { s.focus({ preventScroll: true }); } catch (err) { s.focus(); }
      root.scrollTo(0, 0);
    });
  }

  /* ---------- document title + route status ---------- */
  var lastView = null, lastTitle = null, mine = {}, statusEl = null, statusTimer = 0;
  function subLabel(v) {
    if (v !== "life-now") return "";
    var h = (root.location.hash || "").slice(1);
    if (!h || h === "life-now" || h === "ml-home") return "";
    var a = $$("#life-now [data-lv-ml-goto]").filter(function (x) { return x.getAttribute("href") === "#" + h; })[0];
    return a ? (a.textContent || "").replace(/\s+/g, " ").trim() : "";
  }
  function defaultTitle(v) {
    var name = VIEW_NAME[v];
    if (!name) return BASE_TITLE;
    var sub = subLabel(v);
    return (sub ? sub + " · " : "") + name + (name === "LIVON AI" ? "" : " · LIVON");
  }
  function syncTitle() {
    var v = view(), t = doc.title, want = defaultTitle(v);
    if (v !== "help") {   /* help-page.js owns the Help titles */
      var stale = !t || t === BASE_TITLE || t === "LIVON" || mine[t] === true || (lastView !== null && v !== lastView && t === lastTitle) || / · 도움말 · LIVON$|^도움말 · LIVON$/.test(t);
      if (stale && t !== want) { doc.title = want; }
      mine[want] = true;
    }
    var changed = lastView !== null && v !== lastView;
    lastView = v; lastTitle = doc.title;
    if (changed) announce();
  }
  function announce() {
    if (!statusEl) return;
    root.clearTimeout(statusTimer);
    statusEl.textContent = "";
    statusTimer = root.setTimeout(function () {
      var name = VIEW_NAME[view()] || "홈";
      statusEl.textContent = name + " 화면으로 이동했습니다.";
    }, 250);
  }
  /* a short, polite message for changes that have no status region of their own */
  function say(msg) {
    if (!statusEl) return;
    root.clearTimeout(statusTimer);
    statusEl.textContent = "";
    statusTimer = root.setTimeout(function () { statusEl.textContent = String(msg || ""); }, 300);
  }
  function initTitles() {
    var main = doc.querySelector("main");
    if (main && !doc.querySelector("[data-lv-a11y-route]")) {
      statusEl = doc.createElement("p");
      statusEl.className = "visually-hidden";
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("data-lv-a11y-route", "");
      main.parentNode.insertBefore(statusEl, main);
    }
    root.addEventListener("hashchange", function () { syncTitle(); root.setTimeout(syncTitle, 60); });
    syncTitle();
    root.setTimeout(syncTitle, 60);
  }

  /* ---------- modal dialogs: keep Tab inside ---------- */
  function topModal() {
    var list = $$('[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]').filter(function (d) {
      if (!shown(d) || d.closest("[hidden]") || d.closest('[aria-hidden="true"]')) return false;
      var r = d.getBoundingClientRect();
      return r.right > 0 && r.bottom > 0 && r.left < (root.innerWidth || html.clientWidth) && r.top < (root.innerHeight || html.clientHeight);
    });
    return list.length ? list[list.length - 1] : null;
  }
  function initDialogs() {
    /* window + bubble: runs after the dialogs' own handlers, and only when they left the key alone */
    root.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || e.defaultPrevented) return;
      var m = topModal();
      if (!m) return;
      var f = focusables(m);
      if (!f.length) { e.preventDefault(); if (!m.hasAttribute("tabindex")) m.setAttribute("tabindex", "-1"); m.focus(); return; }
      var a = doc.activeElement, first = f[0], last = f[f.length - 1];
      if (!m.contains(a)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && (a === first || a === m)) { e.preventDefault(); last.focus(); }
    });
  }

  /* ---------- modal dialogs: focus goes back to the opener when a dialog closes and leaves focus nowhere ---------- */
  var MODAL = '[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]';
  var prevFocus = null, modalStack = [];
  function settleModals() {
    while (modalStack.length) {
      var top = modalStack[modalStack.length - 1];
      if (top.m.isConnected && shown(top.m) && !top.m.closest("[hidden]")) return;   /* still open */
      modalStack.pop();
      var a = doc.activeElement;
      if (a && a !== doc.body && a !== html && shown(a)) continue;                      /* its own script already placed focus */
      var o = top.opener;
      if (!(o && o.isConnected && shown(o))) { o = screen(); if (o && !o.hasAttribute("tabindex")) o.setAttribute("tabindex", "-1"); }   /* the opener was re-rendered: stay on the screen */
      if (o) { try { o.focus({ preventScroll: true }); } catch (e) { o.focus(); } }
    }
  }
  function initDialogReturn() {
    doc.addEventListener("focusin", function (e) {
      var t = e.target, m = t && t.closest ? t.closest(MODAL) : null;
      if (m && !modalStack.some(function (x) { return x.m === m; })) modalStack.push({ m: m, opener: prevFocus && !m.contains(prevFocus) ? prevFocus : null });
      prevFocus = t;
    }, true);
    var later = function () { if (modalStack.length) root.setTimeout(settleModals, 80); };
    doc.addEventListener("focusout", later, true);
    doc.addEventListener("keyup", function (e) { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") later(); }, true);
    doc.addEventListener("click", later, true);
  }

  /* ---------- disclosure: focus goes back to the trigger ---------- */
  function initDisclosure() {
    if (!root.MutationObserver) return;
    new root.MutationObserver(function (muts) {
      muts.forEach(function (m) {
        var el = m.target;
        if (m.oldValue !== "true" || el.getAttribute("aria-expanded") !== "false" || !keyboard) return;
        root.setTimeout(function () {
          var a = doc.activeElement;
          if (a && a !== doc.body && a !== html && shown(a)) return;   /* focus is somewhere sensible already */
          if (topModal()) return;
          if (shown(el)) { try { el.focus({ preventScroll: true }); } catch (err) { el.focus(); } }
        }, 30);
      });
    }).observe(doc.body, { subtree: true, attributes: true, attributeFilter: ["aria-expanded"], attributeOldValue: true });
  }

  /* ---------- tab lists without their own arrow-key handling ---------- */
  function initTabs() {
    doc.addEventListener("keydown", function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key;
      if (k !== "ArrowRight" && k !== "ArrowLeft" && k !== "Home" && k !== "End") return;
      var tab = e.target && e.target.closest ? e.target.closest('[role="tab"]') : null;
      if (!tab) return;
      var list = tab.closest('[role="tablist"]');
      if (!list) return;
      var tabs = $$('[role="tab"]', list).filter(shown);
      if (tabs.length < 2) return;
      if (tabs.some(function (t) { return t.getAttribute("tabindex") === "-1"; })) return;   /* roving tabindex: managed by its own script */
      var i = tabs.indexOf(tab), n = i;
      if (k === "ArrowRight") n = (i + 1) % tabs.length;
      else if (k === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      else if (k === "Home") n = 0;
      else n = tabs.length - 1;
      if (n === i) return;
      e.preventDefault();
      var key = tabs[n].getAttribute("id") || "";
      tabs[n].click();
      /* the list may have been rendered again by the click: find the same tab and focus it */
      root.setTimeout(function () {
        var again = $$('[role="tab"]', list).filter(shown);
        var t = (key && doc.getElementById(key)) || again[n];
        if (t) t.focus();
      }, 0);
    });
  }

  /* ---------- chips: .is-on → aria-pressed ---------- */
  var chipTimer = 0;
  function hasOwnState(b) {
    return b.hasAttribute("role") || b.hasAttribute("aria-selected") || b.hasAttribute("aria-expanded") || b.hasAttribute("aria-current") || b.hasAttribute("aria-checked");
  }
  function syncChips() {
    chipTimer = 0;
    var scope = doc.querySelector("main");
    if (!scope) return;
    /* class-only groups: a plain button marked .is-on and its sibling buttons become chips */
    $$("button.is-on:not([data-lv-chip])", scope).forEach(function (on) {
      if (hasOwnState(on) || on.hasAttribute("aria-pressed") || !on.parentElement) return;
      Array.prototype.forEach.call(on.parentElement.children, function (b) {
        if (b.tagName === "BUTTON" && !hasOwnState(b) && !b.hasAttribute("aria-pressed")) b.setAttribute("data-lv-chip", "");
      });
    });
    $$("button[data-lv-chip]", scope).forEach(function (b) {
      var want = b.classList.contains("is-on") ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== want) b.setAttribute("aria-pressed", want);
    });
  }
  /* short English labels (kickers, eyebrows, wordmarks) are marked lang="en" so a Korean voice does not spell them out */
  var LATIN = /^[A-Za-z][A-Za-z0-9 ,.&·'’!?+\/-]*$/;
  function syncLang() {
    $$('[class*="kicker"]:not([lang]), [class*="eyebrow"]:not([lang]), [class*="wordmark"]:not([lang])').forEach(function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      if (t.length > 1 && LATIN.test(t)) el.setAttribute("lang", "en");
    });
  }
  /* sub-views whose title is exposed as level 1 (an <h2 aria-level="1">): the headings under it move up one level too */
  function syncHeadings() {
    $$('h2[aria-level="1"]').forEach(function (title) {
      var box = title.closest("#life-hub-view, #td-detail") || title.closest("section");
      if (!box) return;
      $$("h3:not([aria-level]), h4:not([aria-level]), h5:not([aria-level])", box).forEach(function (h) { h.setAttribute("aria-level", String(Number(h.tagName.charAt(1)) - 1)); });
    });
  }
  function initChips() {
    syncChips(); syncLang(); syncHeadings();
    if (!root.MutationObserver) return;
    var scope = doc.querySelector("main");
    if (!scope) return;
    new root.MutationObserver(function () {
      if (!chipTimer) chipTimer = root.setTimeout(function () { syncChips(); syncLang(); syncHeadings(); }, 60);
    }).observe(scope, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
  }

  /* ---------- motion: pause background videos ---------- */
  var paused = false;
  function readMotion() {
    var v = null;
    try { v = root.localStorage.getItem(MOTION_KEY); } catch (e) {}
    if (v === "paused") return true;
    if (v === "playing") return false;
    return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function freeze(video) {
    /* a rate of 0 holds the frame without a "pause" event, so the film keeper does not restart the video */
    try { video.defaultPlaybackRate = paused ? 0 : 1; video.playbackRate = paused ? 0 : 1; } catch (e) {}
  }
  function freezeCanvas() {
    /* Home: the film replays from captured frames on a canvas; cover it with one still frame while paused */
    var canvas = doc.querySelector("[data-livon-canvas]");
    if (!canvas || !canvas.parentNode) return;
    var still = canvas.parentNode.querySelector("[data-lv-a11y-still]");
    if (!paused) { if (still) still.parentNode.removeChild(still); canvas.style.visibility = ""; return; }
    if (still || !canvas.width || canvas.style.display !== "block") return;
    still = doc.createElement("canvas");
    still.setAttribute("data-lv-a11y-still", "");
    still.setAttribute("aria-hidden", "true");
    still.width = canvas.width; still.height = canvas.height;
    still.className = canvas.className;
    still.style.cssText = canvas.style.cssText;
    try { still.getContext("2d").drawImage(canvas, 0, 0); } catch (e) { return; }
    canvas.parentNode.insertBefore(still, canvas.nextSibling);
    canvas.style.visibility = "hidden";
  }
  function applyMotion() {
    if (paused) html.setAttribute("data-lv-motion", "paused"); else html.removeAttribute("data-lv-motion");
    $$("video").forEach(freeze);
    freezeCanvas();
    $$("[data-lv-motion-toggle]").forEach(function (b) { b.setAttribute("aria-pressed", paused ? "true" : "false"); });
  }
  function setMotion(p) {
    paused = !!p;
    try { root.localStorage.setItem(MOTION_KEY, paused ? "paused" : "playing"); } catch (e) {}
    applyMotion();
  }
  function initMotion() {
    paused = readMotion();
    var HOSTS = ".livon-hero, [data-lv-life-hero], [data-lv-ml-hero], [data-lv-ex-hero], [data-lv-cm-hero], [data-lv-td-hero], [data-lv-ai-hero]";
    $$(HOSTS).forEach(function (host) {
      if (!host.querySelector("video") || host.querySelector("[data-lv-motion-toggle]")) return;
      var b = doc.createElement("button");
      b.type = "button";
      b.className = "lv-motion-toggle";
      b.setAttribute("data-lv-motion-toggle", "");
      b.setAttribute("aria-pressed", "false");
      b.innerHTML = '<span class="lv-motion-toggle__icon" aria-hidden="true"></span><span class="visually-hidden">배경 영상 일시 정지</span>';
      host.insertBefore(b, host.firstChild);   /* first in the header: it sits at the top, so it is reached before the header's buttons */
    });
    doc.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest("[data-lv-motion-toggle]") : null;
      if (b) setMotion(!paused);
    });
    /* videos that start (or are added) later follow the same setting */
    doc.addEventListener("play", function (e) { if (paused && e.target && e.target.tagName === "VIDEO") freeze(e.target); }, true);
    doc.addEventListener("ratechange", function (e) {
      var v = e.target;
      if (paused && v && v.tagName === "VIDEO" && v.playbackRate !== 0) freeze(v);
    }, true);
    doc.addEventListener("ended", function (e) { if (paused && e.target && e.target.tagName === "VIDEO") root.setTimeout(freezeCanvas, 400); }, true);
    applyMotion();
  }

  function init() {
    var steps = [initSkip, initTitles, initDialogs, initDialogReturn, initDisclosure, initTabs, initChips, initMotion];
    for (var i = 0; i < steps.length; i++) { try { steps[i](); } catch (e) { /* one helper failing must not stop the others */ } }
  }
  root.LivonA11y = { say: say, syncTitle: syncTitle, defaultTitle: defaultTitle, viewNames: VIEW_NAME, motionKey: MOTION_KEY, isPaused: function () { return paused; }, setMotion: setMotion };
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})(typeof window !== "undefined" ? window : this);
