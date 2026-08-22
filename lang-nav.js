/**
 * Shared language URL builder for newon.app.
 * Language switch always keeps the current screen: same path with locale swapped,
 * same query, and the best-effort hash / scroll position.
 */
(function (g) {
  var LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

  /** App shells on the home page (id → hash to restore). */
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
  ];

  /** Home section ids used for in-page restore when no app shell is open. */
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
    "home-explore",
    "explore",
    "home-ideas",
    "home-final",
  ];

  /**
   * Paths without /{lang}/ that still have localized twins under /{lang}/…
   * First segment → keep full remainder after injecting nextDir.
   */
  var LOCALIZED_ROOT_SEGS = {
    privacy: 1,
    terms: 1,
    about: 1,
    news: 1,
    ideas: 1,
    business: 1,
    portfolio: 1,
    babylog: 1,
    petlog: 1,
    pillmate: 1,
    savy: 1,
    piggyup: 1,
    goalup: 1,
    countup: 1,
    myworld: 1,
    subping: 1,
    oxmonth: 1,
    newon: 1,
    "404-human": 1,
  };

  /** Single-locale pages: never bounce to home on lang change. */
  var STAY_PUT_ROOTS = {
    "card-n7x4k9": 1,
  };

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
    var out = String(href).replace(/\/{2,}/g, "/");
    if (out.length > 1 && out.endsWith("/") && out.indexOf("#") === -1 && out.indexOf("?") === -1) {
      return out;
    }
    return out;
  }

  function joinPath(segs) {
    if (!segs || !segs.length) return "/";
    return normalizeHref("/" + segs.join("/") + "/");
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

  function withTail(path, q, h) {
    var base = path || "/";
    if (base.length > 1 && !base.endsWith("/") && q.indexOf("?") !== 0 && !h) {
      base += "/";
    }
    if (!base.endsWith("/") && (q || h)) {
      // "/en/news" + "?x" → "/en/news/?x" is nicer; ensure slash before query/hash
      if (!/[?#]/.test(base)) base += "/";
    }
    return normalizeHref(base + (q || "") + (h || ""));
  }

  function build(nextDir) {
    if (LANGS.indexOf(nextDir) === -1) nextDir = "en";
    var h = captureViewHash();
    var q = g.location.search || "";
    var segs = pathnameSegments();
    var i;

    // 1) Already under /{lang}/… → swap language only
    for (i = 0; i < segs.length; i++) {
      if (LANGS.indexOf(segs[i]) !== -1) {
        segs[i] = nextDir;
        return withTail(joinPath(segs), q, h);
      }
    }

    // 2) Single-locale / special pages → stay on the same URL (do not jump home)
    if (segs[0] && STAY_PUT_ROOTS[segs[0]]) {
      try {
        g.localStorage.setItem("newon-lang-dir", nextDir);
      } catch (e) {}
      return withTail(joinPath(segs), q, h);
    }

    // 3) Unprefixed but localized sections: /news/x → /{lang}/news/x
    if (segs[0] && LOCALIZED_ROOT_SEGS[segs[0]]) {
      return withTail(joinPath([nextDir].concat(segs)), q, h);
    }

    // 4) Fallback: language home, still keep query/hash when possible
    return withTail(joinPath([nextDir]), q, h);
  }

  function currentHref() {
    return g.location.pathname + (g.location.search || "") + (g.location.hash || "");
  }

  function rememberScroll() {
    try {
      g.sessionStorage.setItem("newon-lang-scroll", String(g.scrollY || g.pageYOffset || 0));
      g.sessionStorage.setItem(
        "newon-lang-scroll-key",
        pathnameSegments()
          .filter(function (s) {
            return LANGS.indexOf(s) === -1;
          })
          .join("/")
      );
    } catch (e) {}
  }

  function restoreScrollIfNeeded() {
    try {
      var y = g.sessionStorage.getItem("newon-lang-scroll");
      var key = g.sessionStorage.getItem("newon-lang-scroll-key");
      g.sessionStorage.removeItem("newon-lang-scroll");
      g.sessionStorage.removeItem("newon-lang-scroll-key");
      if (y == null || y === "") return;
      var here = pathnameSegments()
        .filter(function (s) {
          return LANGS.indexOf(s) === -1;
        })
        .join("/");
      if (key != null && key !== here) return;
      var n = parseInt(y, 10);
      if (!isFinite(n) || n < 1) return;
      // After hash scroll / layout
      var run = function () {
        g.scrollTo(0, n);
      };
      if (g.requestAnimationFrame) g.requestAnimationFrame(run);
      else setTimeout(run, 0);
      setTimeout(run, 50);
      setTimeout(run, 200);
    } catch (e) {}
  }

  function applyLangChoice(nextDir) {
    if (LANGS.indexOf(nextDir) === -1) nextDir = "en";
    try {
      g.localStorage.setItem("newon-lang-dir", nextDir);
    } catch (e) {}
    var next = build(nextDir);
    var cur = currentHref();
    if (normalizeHref(cur) === normalizeHref(next)) {
      // Same URL (e.g. 404-human stay-put): still sync any selects and stop
      return;
    }
    rememberScroll();
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
    var segs = pathnameSegments();
    // Never auto-bounce off stay-put pages
    if (segs[0] && STAY_PUT_ROOTS[segs[0]]) return;
    // URL already has an explicit locale (/ko/…, /en/…) — respect it.
    // Only auto-apply preference on unprefixed entry URLs (/news/, /business/, …).
    var cur = resolveCurrentLangDir();
    if (cur) return;
    var next = build(pref);
    if (normalizeHref(currentHref()) === normalizeHref(next)) return;
    rememberScroll();
    g.location.replace(next);
  }

  g.newonBuildLangHref = build;
  g.newonApplyLangChoice = applyLangChoice;
  g.newonResolveCurrentLangDir = resolveCurrentLangDir;
  g.newonRedirectStoredLangPreferred = redirectStoredLangPreferred;

  redirectStoredLangPreferred();

  if (g.document && g.document.readyState === "loading") {
    g.document.addEventListener("DOMContentLoaded", restoreScrollIfNeeded);
  } else {
    restoreScrollIfNeeded();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
