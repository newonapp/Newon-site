/*
 * LIVON screen start-up — loaded before the page modules.
 *
 * LIVON keeps eight screens in one document. Each screen module used to build its whole screen at
 * DOMContentLoaded, so a visitor paid for all eight before using one. With LivonBoot.view(name, start):
 *
 *   the screen that is showing     starts at DOMContentLoaded, exactly as before
 *   every other screen             starts when it is opened (before the router shows it), or when another
 *                                  module asks for it with LivonBoot.ensure(name), or a little later while the
 *                                  browser is idle — one screen per idle period — so everything is ready soon
 *                                  after the first paint without one long task. The warm-up waits while the
 *                                  visitor is typing, clicking, scrolling or changing screens.
 *
 * The order inside a screen and the code of each module are unchanged. If this file is missing, every module
 * falls back to starting at DOMContentLoaded.
 */
(function (root) {
  "use strict";
  var doc = root.document;
  if (!doc || !doc.documentElement) return;
  var html = doc.documentElement;
  var pending = {};          /* view → [start functions], in registration order */
  var order = [];            /* views in registration order */
  var started = {};
  var stats = { atLoad: [], onDemand: [], idle: [] };

  /* the same hash → screen mapping as the page router (index.html), plus Help */
  function viewOf(hash) {
    hash = String(hash || "").replace(/^#/, "");
    if (hash === "help" || hash.indexOf("help/") === 0 || hash.indexOf("help?") === 0) return "help";
    if (hash === "life" || hash === "life-stages" || hash.indexOf("stage-") === 0 || hash.indexOf("life/") === 0 || (hash.indexOf("life-") === 0 && hash !== "life-now")) return "life";
    if (hash === "today" || hash.indexOf("today/") === 0 || hash.indexOf("td-") === 0) return "today";
    if (hash === "life-now" || hash.indexOf("ml-") === 0 || hash.indexOf("profile-") === 0) return "life-now";
    if (hash === "explore" || hash.indexOf("ex-") === 0) return "explore";
    if (hash === "community" || hash.indexOf("cm-") === 0) return "community";
    if (hash === "livon-ai" || hash.indexOf("ai-") === 0) return "livon-ai";
    return "home";
  }
  function current() { return viewOf(root.location.hash); }

  function run(name, how) {
    var list = pending[name];
    if (!list || !list.length) return false;
    pending[name] = [];
    started[name] = true;
    stats[how].push(name);
    for (var i = 0; i < list.length; i++) {
      try { list[i](); } catch (e) { if (root.console && root.console.error) root.console.error("[LivonBoot] " + name, e); }
    }
    return true;
  }
  function ensure(name) { return run(name, "onDemand"); }
  function ensureAll() { for (var i = 0; i < order.length; i++) ensure(order[i]); }
  function queue(name, start) {
    if (!pending[name]) { pending[name] = []; order.push(name); }
    pending[name].push(start);
  }
  function startNow(name, start) { started[name] = true; if (stats.atLoad.indexOf(name) < 0) stats.atLoad.push(name); start(); }

  /* Each module keeps its own place in the DOMContentLoaded order; only the decision "now or later" is made here. */
  function view(name, start) {
    if (typeof start !== "function") return;
    var decide = function () { if (name === current() || started[name]) startNow(name, start); else queue(name, start); };
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", decide);
    else decide();
  }

  /* the warm-up stays out of the way of someone who is using the page */
  var QUIET_MS = 1500, lastActivity = 0;
  function active() { lastActivity = Date.now(); }
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (type) {
    root.addEventListener(type, active, { capture: true, passive: true });
  });

  function idleWarmUp() {
    var next = function () {
      if (Date.now() - lastActivity < QUIET_MS) { root.setTimeout(schedule, QUIET_MS); return; }
      for (var i = 0; i < order.length; i++) {
        if (pending[order[i]] && pending[order[i]].length) {
          run(order[i], "idle");
          schedule();
          return;
        }
      }
    };
    var schedule = function () {
      if (typeof root.requestIdleCallback === "function") root.requestIdleCallback(next, { timeout: 4000 });
      else root.setTimeout(next, 250);
    };
    schedule();
  }

  /* registered before the router's own listener, so a screen is started before the router shows it */
  root.addEventListener("hashchange", function () { active(); ensure(current()); });
  var later = function () { root.setTimeout(idleWarmUp, 1200); };
  if (doc.readyState === "complete") later(); else root.addEventListener("load", later);

  root.LivonBoot = { view: view, ensure: ensure, ensureAll: ensureAll, viewOf: viewOf, isStarted: function (name) { return !!started[name]; }, stats: stats };
})(typeof window !== "undefined" ? window : this);
