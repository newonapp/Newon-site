/**
 * Intro splash: white background, Newon logo, floating app icons for a few
 * seconds, then reveals the page. Runs once per browser session and respects
 * prefers-reduced-motion (handled by the early inline script in <body>).
 */
(function () {
  var splash = document.getElementById("newon-splash");
  if (!splash) return;

  var root = document.documentElement;

  function remove() {
    if (splash.parentNode) splash.parentNode.removeChild(splash);
    root.classList.remove("splash-on", "splash-done");
  }

  // Already skipped by the early inline script (reduced motion or seen).
  if (root.classList.contains("splash-off")) {
    remove();
    return;
  }

  try {
    sessionStorage.setItem("newon-splash-seen", "1");
  } catch (e) {}

  var HOLD_MS = 2900; // logo + icons + progress bar on screen
  var FADE_MS = 700; // fade-out duration (keep in sync with CSS)

  function finish() {
    root.classList.add("splash-done");
    window.setTimeout(remove, FADE_MS + 60);
  }

  var start = window.setTimeout(finish, HOLD_MS);

  // Let users skip by tapping/clicking or pressing a key.
  function skip() {
    window.clearTimeout(start);
    finish();
    cleanup();
  }
  function cleanup() {
    splash.removeEventListener("click", skip);
    window.removeEventListener("keydown", onKey);
  }
  function onKey() {
    skip();
  }
  splash.addEventListener("click", skip);
  window.addEventListener("keydown", onKey, { once: true });
})();
