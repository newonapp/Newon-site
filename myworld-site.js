/* MY WORLD business site — accessible tabs (journey, service areas, partner groups) — progressive enhancement. */
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
    root._mwsSelect = select;
    root.classList.add("is-ready");
  }
  /* A jump link or URL hash that points inside a hidden panel opens that panel first. */
  function reveal(id) {
    var el = id && document.getElementById(id);
    if (!el) return;
    var panel = el.closest('[role="tabpanel"]');
    var root = panel && panel.closest("[data-mws-tabs]");
    if (!root || !root._mwsSelect || !panel.hasAttribute("data-hidden")) return;
    var tab = root.querySelector('[role="tab"][aria-controls="' + panel.id + '"]');
    if (tab) root._mwsSelect(tab, false);
  }
  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-mws-tabs]"), init);
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('#myworld-site a[href^="#"]');
      if (a) reveal(decodeURIComponent(a.getAttribute("href").slice(1)));
    });
    if (location.hash) {
      reveal(decodeURIComponent(location.hash.slice(1)));
      var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) t.scrollIntoView();
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
