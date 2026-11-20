/* SHAREON pages — progressive enhancement only (revenue-model tabs, one-rental calculator). No network calls. */
(function () {
  "use strict";
  var root = document.getElementById("shareon-detail");
  if (!root) return;

  /* Tabs: without JS every panel stays visible; with JS they become an ARIA tab set (arrow keys, Home/End). */
  Array.prototype.forEach.call(root.querySelectorAll("[data-nsh-tabs]"), function (box) {
    var list = box.querySelector("[data-nsh-tablist]");
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    list.hidden = false;
    box.classList.add("is-enhanced");
    panels.forEach(function (p, i) {
      if (!p) return;
      p.setAttribute("role", "tabpanel");
      p.setAttribute("aria-labelledby", tabs[i].id);
      p.setAttribute("tabindex", "0");
    });
    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (panels[j]) panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i, false); });
      t.addEventListener("keydown", function (ev) {
        var k = ev.key, n = tabs.length, to = -1;
        if (k === "ArrowRight" || k === "ArrowDown") to = (i + 1) % n;
        else if (k === "ArrowLeft" || k === "ArrowUp") to = (i - 1 + n) % n;
        else if (k === "Home") to = 0;
        else if (k === "End") to = n - 1;
        if (to < 0) return;
        ev.preventDefault();
        select(to, true);
      });
    });
    select(0, false);
  });

  /* One-rental calculator: fee = rental fee × rate (deposit excluded); lender share = rental fee − fee; deposit shown apart.
     Purely illustrative, values stay in the page. */
  Array.prototype.forEach.call(root.querySelectorAll("[data-nsh-calc]"), function (box) {
    var locale = box.getAttribute("data-lang") || "en-US";
    var fmt;
    try { fmt = new Intl.NumberFormat(locale); } catch (err) { fmt = { format: String }; }
    function val(name, max) {
      var el = box.querySelector('[data-nsh-calc-in="' + name + '"]');
      var v = parseFloat(el && el.value);
      if (!isFinite(v) || v < 0) v = 0;
      return Math.min(v, max);
    }
    function out(name, v) {
      var el = box.querySelector('[data-nsh-calc-out="' + name + '"]');
      if (el) el.textContent = fmt.format(Math.round(v));
    }
    function update() {
      var rent = val("rent", 1e8);
      var fee = (rent * val("rate", 100)) / 100;
      out("fee", fee);
      out("payout", rent - fee);
      out("deposit", val("deposit", 1e8));
    }
    box.addEventListener("input", update);
    var form = box.querySelector("form");
    if (form) form.addEventListener("submit", function (ev) { ev.preventDefault(); update(); });
    update();
  });
})();
