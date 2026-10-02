/*
 * LIVON background video loading — runs right after film-keep.js, before the page modules.
 *
 * Every screen of LIVON lives in one document, and each screen has a film header. Left alone, the browser
 * fetches all of them on every visit, whichever screen is shown. Here a video keeps its address in data-src
 * and receives src only when it is needed:
 *
 *   header films   when their screen is the one showing (the Home film keeps a plain src: it is the usual entry)
 *   other films    when they scroll near the viewport (cards, the Home AI section)
 *
 * Card photos that a template draws as a CSS background cannot use loading="lazy", so the template writes
 * data-lv-bg="…" instead of the style and the photo is applied here when the card comes near the viewport.
 *
 * A video host that cannot be reached is not retried in a loop: after two errors the video is detached and it is
 * tried again only when the browser comes back online or the screen is opened again.
 *
 * The pause control (livon-a11y.js) and "reduce motion" work as before: a paused film still shows its first frame.
 * Nothing is stored and nothing is sent anywhere.
 */
(function (root) {
  "use strict";
  var doc = root.document;
  if (!doc || !doc.documentElement) return;
  var html = doc.documentElement;
  var FAIL_LIMIT = 2;
  var HEADER = "video[data-livon-video], video.lv-lum__bg, video[class*='film__bg']";

  function view() { return html.getAttribute("data-lv-view") || "home"; }
  function all(sel, base) { return Array.prototype.slice.call((base || doc).querySelectorAll(sel)); }
  function screenOf(video) { return video.closest ? video.closest("main > [data-lv-screen]") : null; }
  function isHeader(video) { return video.matches(HEADER); }

  function attach(video) {
    var src = video.getAttribute("data-src");
    if (!src || video.__lvOff || video.getAttribute("src") === src) return;
    video.setAttribute("src", src);
    try { video.load(); } catch (e) {}
    if (video.autoplay || video.hasAttribute("autoplay")) { try { var p = video.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
  }
  function detach(video) {
    var src = video.getAttribute("src");
    if (!src) return;
    if (!video.getAttribute("data-src")) video.setAttribute("data-src", src);
    video.removeAttribute("src");
    try { video.load(); } catch (e) {}
  }

  /* header films: only the screen that is showing */
  function syncHeaders() {
    var v = view();
    all(HEADER).forEach(function (video) {
      var s = screenOf(video);
      if (!s) return;
      if (s.getAttribute("data-lv-screen") === v) attach(video);
      else if (!video.__lvStarted && video.getAttribute("src") && video.readyState < 2) detach(video);   /* entered on another screen: do not fetch this one yet */
    });
  }

  /* other films: when they come near the viewport (never while their screen is hidden) */
  var io = null;
  function watch(video) {
    if (video.__lvWatched || isHeader(video)) return;
    video.__lvWatched = true;
    if (!io) { attach(video); return; }
    io.observe(video);
  }
  function watchAll(base) { all("video[data-src]", base).forEach(watch); }

  /* background photos: applied when the card is near the viewport; a photo already shown once is applied at once */
  var bgIo = null, bgShown = {};
  function showBg(el) {
    var url = el.getAttribute("data-lv-bg");
    if (!url) return;
    el.removeAttribute("data-lv-bg");
    bgShown[url] = true;
    el.style.backgroundImage = 'url("' + String(url).replace(/[\\"\n\r]/g, function (c) { return "\\" + c.charCodeAt(0).toString(16) + " "; }) + '")';
  }
  function watchBg(el) {
    if (el.__lvBg) return;
    el.__lvBg = true;
    if (!bgIo || bgShown[el.getAttribute("data-lv-bg")]) showBg(el); else bgIo.observe(el);
  }
  function watchAllBg(base) { all("[data-lv-bg]", base).forEach(watchBg); }

  /* an unreachable host: stop after two errors instead of asking again several times a second */
  function onError(e) {
    var video = e.target;
    if (!video || video.tagName !== "VIDEO") return;
    video.__lvFails = (video.__lvFails || 0) + 1;
    if (video.__lvFails < FAIL_LIMIT) return;
    video.__lvOff = true;
    detach(video);
  }
  function retry() {
    all("video").forEach(function (video) { if (video.__lvOff) { video.__lvOff = false; video.__lvFails = 0; } });
    syncHeaders();
    all("video[data-src]").forEach(function (video) { if (!isHeader(video) && video.__lvSeen) attach(video); });
  }

  function init() {
    if ("IntersectionObserver" in root) {
      io = new root.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.__lvSeen = true; attach(entry.target); } });
      }, { rootMargin: "300px 0px" });
      bgIo = new root.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (entry.isIntersecting) { bgIo.unobserve(entry.target); showBg(entry.target); } });
      }, { rootMargin: "600px 0px" });
    }
    doc.addEventListener("error", onError, true);
    doc.addEventListener("playing", function (e) { if (e.target && e.target.tagName === "VIDEO") { e.target.__lvStarted = true; e.target.__lvFails = 0; } }, true);
    root.addEventListener("hashchange", function () {
      all(HEADER).forEach(function (video) { if (video.__lvOff) { video.__lvOff = false; video.__lvFails = 0; } });
      root.setTimeout(syncHeaders, 0);   /* after the router has set the new view */
    });
    root.addEventListener("online", retry);
    syncHeaders();
    watchAll(doc);
    watchAllBg(doc);
    if ("MutationObserver" in root) {
      var main = doc.querySelector("main") || doc.body;
      new root.MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType !== 1) continue;
            if (n.tagName === "VIDEO") { if (n.hasAttribute("data-src")) watch(n); }
            else if (n.querySelector && n.querySelector("video[data-src]")) watchAll(n);
            if (n.hasAttribute && n.hasAttribute("data-lv-bg")) watchBg(n);
            if (n.querySelector && n.querySelector("[data-lv-bg]")) watchAllBg(n);
          }
        }
      }).observe(main, { childList: true, subtree: true });
    }
  }
  /* for templates: the attribute that draws a background photo (lazy when this loader is running) */
  function bgAttr(url, esc) {
    url = String(url || "");
    if (!url) return "";
    var safe = typeof esc === "function" ? esc(url) : url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    return ' data-lv-bg="' + safe + '"';
  }
  root.LivonMedia = { sync: syncHeaders, failLimit: FAIL_LIMIT, bgAttr: bgAttr };
  /* the script sits after <main>, so the films already exist; DOMContentLoaded covers an earlier placement */
  if (doc.querySelector("main")) init(); else doc.addEventListener("DOMContentLoaded", init);
})(typeof window !== "undefined" ? window : this);
