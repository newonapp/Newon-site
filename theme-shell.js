/**
 * Shell-level light/dark theme (localStorage: newon-app-theme).
 * Used on legal/delete-account pages; index.html uses the same key via its router script.
 */
(function (global) {
  var KEY = "newon-app-theme";

  function getTheme() {
    try {
      var q = new URLSearchParams(global.location.search).get("theme");
      if (q === "light" || q === "dark") return q;
    } catch (e) {}
    try {
      var t = global.localStorage.getItem(KEY);
      if (t === "light" || t === "dark") return t;
    } catch (e) {}
    return "light";
  }

  function applyShellTheme(theme) {
    if (theme !== "light" && theme !== "dark") return;
    try {
      global.localStorage.setItem(KEY, theme);
    } catch (e) {}
    document.documentElement.setAttribute("data-newon-shell-theme", theme);
    /* Keep legacy app-landing selectors (ox-month etc.) in sync */
    document.documentElement.setAttribute("data-theme", theme);
    var appRoots = document.querySelectorAll(
      "#ox-month,#subping-app,#pillmate-app,#savy-app,#babylog-app,#petlog-app,#piggyup-app,#goalup-app,#countup-app,#myworld-app,#newon-plus-app,#human404-app"
    );
    appRoots.forEach(function (el) {
      el.setAttribute("data-theme", theme);
    });
  }

  var MOON_SVG =
    '<svg class="gnav__theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SUN_SVG =
    '<svg class="gnav__theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';

  function syncToggleButtons() {
    var dark = getTheme() === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      if (btn.querySelector(".gnav__theme-icon")) {
        btn.innerHTML = dark ? SUN_SVG : MOON_SVG;
      } else {
        btn.textContent = dark ? "\u2600" : "\u263E";
      }
      var labelLight = btn.getAttribute("data-label-light") || "Light mode";
      var labelDark = btn.getAttribute("data-label-dark") || "Dark mode";
      btn.setAttribute("aria-label", dark ? labelLight : labelDark);
      btn.setAttribute("title", dark ? labelLight : labelDark);
    });
  }

  function toggleTheme() {
    applyShellTheme(getTheme() === "dark" ? "light" : "dark");
    syncToggleButtons();
  }

  function bindToggles() {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      if (btn.__newonThemeBound) return;
      btn.__newonThemeBound = true;
      btn.addEventListener("click", toggleTheme);
    });
    syncToggleButtons();
  }

  function init() {
    applyShellTheme(getTheme());
    bindToggles();
  }

  applyShellTheme(getTheme());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindToggles);
  } else {
    bindToggles();
  }

  global.newonTheme = {
    KEY: KEY,
    getTheme: getTheme,
    applyShellTheme: applyShellTheme,
    toggleTheme: toggleTheme,
    init: init,
  };
})(window);
