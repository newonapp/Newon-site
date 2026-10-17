/* MY WORLD business site — accessible tabs for the travel journey (progressive enhancement). */
(function () {
  function init(root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) {
          if (on) panel.removeAttribute("data-hidden");
          else panel.setAttribute("data-hidden", "");
        }
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t, false); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = null;
        if (k === "ArrowRight" || k === "ArrowDown") n = tabs[(i + 1) % tabs.length];
        else if (k === "ArrowLeft" || k === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === "Home") n = tabs[0];
        else if (k === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    root.classList.add("is-ready");
  }
  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-mws-tabs]"), init);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
