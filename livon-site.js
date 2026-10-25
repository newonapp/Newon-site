/* LIVON site — progressive enhancement only. Nothing is stored; no network requests.
   1. Life Event Explorer: without JS every event is listed. With JS one event shows at a time and the 40-cell map highlights it.
   2. Tabs (21 areas, 40 categories): without JS the tab row is a jump menu and every group is listed.
      With JS one group shows at a time (ARIA tabs, arrow keys); a link to a card in another group opens that group.
   3. A link to an accordion item (#lvs-biz-NN) opens it. */
(function () {
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* 1 ─ explorer */
  each(document.querySelectorAll("[data-lvs-explorer]"), function (root) {
    var tabs = root.querySelector(".lvs-ex__tabs");
    if (!tabs) return;
    var buttons = tabs.querySelectorAll("[data-lvs-event]");
    var panels = root.querySelectorAll("[data-lvs-event-panel]");
    var cells = root.querySelectorAll(".lvs-map__cell");
    function show(id) {
      var cats = [];
      each(panels, function (p) {
        var on = p.getAttribute("data-lvs-event-panel") === id;
        p.classList.toggle("is-on", on);
        if (on) cats = (p.getAttribute("data-cats") || "").split(" ");
      });
      each(buttons, function (b) {
        var on = b.getAttribute("data-lvs-event") === id;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      each(cells, function (c) {
        c.classList.toggle("is-hit", cats.indexOf(c.getAttribute("data-n")) !== -1);
      });
    }
    each(buttons, function (b) {
      b.addEventListener("click", function () { show(b.getAttribute("data-lvs-event")); });
    });
    tabs.hidden = false;
    root.classList.add("is-ready");
    if (buttons[0]) show(buttons[0].getAttribute("data-lvs-event"));
  });

  /* 2 ─ tabs */
  var tabSets = [];
  each(document.querySelectorAll("[data-lvs-tabs]"), function (root) {
    var list = root.querySelector("[data-lvs-tablist] ul");
    if (!list) return;
    var tabs = list.querySelectorAll("[data-lvs-tab]");
    var panels = [];
    each(tabs, function (t, i) {
      var panel = document.getElementById(t.getAttribute("data-lvs-tab"));
      if (!panel) return;
      t.id = t.id || panel.id + "-tab";
      t.setAttribute("role", "tab");
      t.setAttribute("aria-controls", panel.id);
      t.parentNode.setAttribute("role", "presentation");
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", t.id);
      panels.push(panel);
    });
    list.setAttribute("role", "tablist");
    function select(i, focus) {
      each(tabs, function (t, j) {
        var on = i === j;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.setAttribute("tabindex", on ? "0" : "-1");
        t.classList.toggle("is-on", on);
        if (panels[j]) panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    each(tabs, function (t, i) {
      t.addEventListener("click", function (ev) { ev.preventDefault(); select(i, false); });
      t.addEventListener("keydown", function (ev) {
        var n = tabs.length, k = ev.key, to = -1;
        if (k === "ArrowRight" || k === "ArrowDown") to = (i + 1) % n;
        else if (k === "ArrowLeft" || k === "ArrowUp") to = (i - 1 + n) % n;
        else if (k === "Home") to = 0;
        else if (k === "End") to = n - 1;
        else if (k === " " || k === "Spacebar") { ev.preventDefault(); select(i, false); return; }
        if (to < 0) return;
        ev.preventDefault();
        select(to, true);
      });
    });
    root.classList.add("is-ready");
    select(0, false);
    tabSets.push({ panels: panels, select: select });
  });

  /* 3 ─ deep links into a hidden tab panel or a closed accordion item */
  function reveal() {
    var id = decodeURIComponent((location.hash || "").slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    var moved = false;
    tabSets.forEach(function (s) {
      s.panels.forEach(function (p, i) {
        if (p.hidden && (p === el || p.contains(el))) { s.select(i, false); moved = true; }
      });
    });
    var d = el.closest ? el.closest("details") : null;
    if (d && !d.open) { d.open = true; moved = true; }
    if (moved) el.scrollIntoView({ block: "start" });
  }
  window.addEventListener("hashchange", reveal);
  /* the same link clicked twice does not fire hashchange */
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href*="#"]') : null;
    if (!a || a.hasAttribute("data-lvs-tab") || a.pathname !== location.pathname) return;
    if (a.hash === location.hash) setTimeout(reveal, 0);
  });
  reveal();
})();
