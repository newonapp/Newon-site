/**
 * Shared language URL builder for newon.app (root host, optional /repo/… prefix).
 * Loads early in <head>: exposes newonBuildLangHref(nextDir), applies newon-lang-dir from localStorage
 * when it differs from the URL locale (privacy root /privacy/ is treated as Korean content).
 */
(function (g) {
  var LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

  var APP_SHELLS = [
    ["ox-month", "#ox-month"],
    ["subping-app", "#subping-app"],
    ["pillmate-app", "#pillmate-app"],
    ["savy-app", "#savy-app"],
    ["babylog-app", "#babylog-app"],
    ["petlog-app", "#petlog-app"],
    ["piggyup-app", "#piggyup-app"],
    ["goalup-app", "#goalup-app"],
    ["countup-app", "#countup-app"],
    ["newon-plus-app", "#newon-plus-app"],
    ["myworld-app", "#myworld-app"],
    ["noting-app", "#noting-app"],
  ];

  var HOME_SECTIONS = [
    "top",
    "intro",
    "meaning",
    "about",
    "work",
    "build",
    "goal",
    "why",
    "numbers",
  ];

  function pathnameSegments() {
    return g.location.pathname
      .replace(/\/index\.html$/i, "")
      .replace(/\/$/, "")
      .split("/")
      .filter(Boolean);
  }

  function resolveCurrentLangDir() {
    var segs = pathnameSegments();
    var i;
    for (i = 0; i < segs.length; i++) {
      if (LANGS.indexOf(segs[i]) !== -1) return segs[i];
    }
    if (segs.length === 1 && segs[0] === "privacy") return "ko";
    return null;
  }

  function normalizeHref(href) {
    if (!href) return "/";
    var out = href.replace(/\/{2,}/g, "/");
    if (out.length > 1 && out.endsWith("/") && out.indexOf("#") === -1 && out.indexOf("?") === -1) {
      return out;
    }
    return out;
  }

  /** Keep the screen the user is looking at when switching language. */
  function captureViewHash() {
    var doc = g.document;
    if (!doc || !doc.body) return g.location.hash || "";

    var i;
    var el;
    for (i = 0; i < APP_SHELLS.length; i++) {
      el = doc.getElementById(APP_SHELLS[i][0]);
      if (el && !el.hidden) return APP_SHELLS[i][1];
    }

    var home = doc.getElementById("home");
    if (home && !home.hidden) {
      var vh = g.innerHeight || doc.documentElement.clientHeight || 0;
      var bestId = null;
      var bestScore = -1;
      for (i = 0; i < HOME_SECTIONS.length; i++) {
        el = doc.getElementById(HOME_SECTIONS[i]);
        if (!el) continue;
        var r = el.getBoundingClientRect();
        var visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        if (visible > bestScore) {
          bestScore = visible;
          bestId = HOME_SECTIONS[i];
        }
      }
      if (bestId && bestScore > 48) return "#" + bestId;
    }

    var h = g.location.hash || "";
    return h === "#" ? "" : h;
  }

  function build(nextDir) {
    if (LANGS.indexOf(nextDir) === -1) nextDir = "en";
    var h = captureViewHash();
    var q = g.location.search || "";
    var tail = q + h;
    var segs = pathnameSegments();
    var i;
    for (i = 0; i < segs.length; i++) {
      if (LANGS.indexOf(segs[i]) !== -1) {
        segs[i] = nextDir;
        return normalizeHref("/" + segs.join("/") + "/" + tail);
      }
    }
    if (segs.length === 1 && segs[0] === "privacy") {
      return normalizeHref("/" + nextDir + "/privacy/" + tail);
    }
    if (segs.length === 1 && segs[0] === "terms") {
      return normalizeHref("/" + nextDir + "/terms/" + tail);
    }
    if (segs[0] === "portfolio") {
      var restPort = segs.slice(1);
      var portSuffix = restPort.length ? restPort.join("/") + "/" : "";
      return normalizeHref("/" + nextDir + "/portfolio/" + portSuffix + tail);
    }
    if (segs.length >= 2 && segs[0] === "oxmonth" && segs[1] === "delete-account") {
      return normalizeHref("/" + nextDir + "/oxmonth/delete-account/" + tail);
    }
    if (segs.length >= 2 && segs[0] === "subping" && segs[1] === "delete-account") {
      return normalizeHref("/" + nextDir + "/subping/delete-account/" + tail);
    }
    return normalizeHref("/" + nextDir + "/" + tail);
  }

  function currentHref() {
    return g.location.pathname + (g.location.search || "") + (g.location.hash || "");
  }

  function applyLangChoice(nextDir) {
    if (LANGS.indexOf(nextDir) === -1) nextDir = "en";
    try {
      g.localStorage.setItem("newon-lang-dir", nextDir);
    } catch (e) {}
    var next = build(nextDir);
    var cur = currentHref();
    if (normalizeHref(cur) === normalizeHref(next)) return;
    g.location.assign(next);
  }

  function redirectStoredLangPreferred() {
    var pref;
    try {
      pref = g.localStorage.getItem("newon-lang-dir");
    } catch (e) {
      return;
    }
    if (!pref || LANGS.indexOf(pref) === -1) return;
    var cur = resolveCurrentLangDir();
    if (!cur || cur === pref) return;
    var next = build(pref);
    if (normalizeHref(currentHref()) === normalizeHref(next)) return;
    g.location.replace(next);
  }

  g.newonBuildLangHref = build;
  g.newonApplyLangChoice = applyLangChoice;
  g.newonResolveCurrentLangDir = resolveCurrentLangDir;
  g.newonRedirectStoredLangPreferred = redirectStoredLangPreferred;
  redirectStoredLangPreferred();
})(typeof globalThis !== "undefined" ? globalThis : this);
