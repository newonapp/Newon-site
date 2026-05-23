/**
 * Shared language URL builder for newon.app (root host, optional /repo/… prefix).
 * Loads early in <head>: exposes newonBuildLangHref(nextDir), applies newon-lang-dir from localStorage
 * when it differs from the URL locale (privacy root /privacy/ is treated as Korean content).
 */
(function (g) {
  var LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

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

  function build(nextDir) {
    if (LANGS.indexOf(nextDir) === -1) nextDir = "en";
    var h = g.location.hash || "";
    var q = g.location.search || "";
    var tail = q + h;
    var segs = pathnameSegments();
    var i;
    for (i = 0; i < segs.length; i++) {
      if (LANGS.indexOf(segs[i]) !== -1) {
        segs[i] = nextDir;
        return "/" + segs.join("/") + "/" + tail;
      }
    }
    if (segs.length === 1 && segs[0] === "privacy") return "/" + nextDir + "/privacy/" + tail;
    if (segs.length === 1 && segs[0] === "terms") return "/" + nextDir + "/terms/" + tail;
    if (segs.length >= 2 && segs[0] === "oxmonth" && segs[1] === "delete-account") {
      return "/" + nextDir + "/oxmonth/delete-account/" + tail;
    }
    if (segs.length >= 2 && segs[0] === "subping" && segs[1] === "delete-account") {
      return "/" + nextDir + "/subping/delete-account/" + tail;
    }
    return "/" + nextDir + "/" + tail;
  }

  function applyLangChoice(nextDir) {
    if (LANGS.indexOf(nextDir) === -1) nextDir = "en";
    try {
      g.localStorage.setItem("newon-lang-dir", nextDir);
    } catch (e) {}
    g.location.href = build(nextDir);
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
    var normCur =
      g.location.pathname + (g.location.search || "") + (g.location.hash || "");
    if (normCur === next || normCur.replace(/\/+$/, "/") === next.replace(/\/+$/, "/")) return;
    g.location.replace(next);
  }

  g.newonBuildLangHref = build;
  g.newonApplyLangChoice = applyLangChoice;
  g.newonResolveCurrentLangDir = resolveCurrentLangDir;
  g.newonRedirectStoredLangPreferred = redirectStoredLangPreferred;
  redirectStoredLangPreferred();
})(typeof globalThis !== "undefined" ? globalThis : this);
