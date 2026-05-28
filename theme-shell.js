/**
 * Shell-level light/dark theme (localStorage: newon-app-theme).
 * Used on legal/delete-account pages; index.html uses the same key via its router script.
 */
(function (global) {
  var KEY = "newon-app-theme";

  function systemTheme() {
    return global.matchMedia && global.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function getTheme() {
    try {
      var t = global.localStorage.getItem(KEY);
      if (t === "light" || t === "dark") return t;
    } catch (e) {}
    return systemTheme();
  }

  function applyShellTheme(theme) {
    if (theme !== "light" && theme !== "dark") return;
    try {
      global.localStorage.setItem(KEY, theme);
    } catch (e) {}
    document.documentElement.setAttribute("data-newon-shell-theme", theme);
  }

  function syncToggleButtons() {
    var dark = getTheme() === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.textContent = dark ? "\u2600" : "\u263E";
      var labelLight = btn.getAttribute("data-label-light") || "Light mode";
      var labelDark = btn.getAttribute("data-label-dark") || "Dark mode";
      btn.setAttribute("aria-label", dark ? labelLight : labelDark);
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
