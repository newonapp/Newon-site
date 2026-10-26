/**
 * Enterprise AI page — reveal, solution tabs, department tabs, industry accordion.
 * Isolated to [data-nea-page]. Does not run on Personal AI.
 */
(function () {
  "use strict";

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initReveal(root) {
    var nodes = Array.prototype.slice.call(root.querySelectorAll("[data-nea-reveal]"));
    if (!nodes.length) return;
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    nodes.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add("is-in");
      else io.observe(el);
    });
  }

  function bindTabs(root, tabSel, getPanel) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll(tabSel));
    if (!tabs.length) return;

    function activate(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        var panel = getPanel(t);
        if (!panel) return;
        panel.hidden = !on;
        panel.classList.toggle("is-on", on);
      });
      if (focus) tab.focus();
    }

    root.addEventListener("click", function (e) {
      var tab = e.target.closest(tabSel);
      if (!tab || !root.contains(tab)) return;
      activate(tab, false);
    });

    root.addEventListener("keydown", function (e) {
      var tab = e.target.closest(tabSel);
      if (!tab || !root.contains(tab)) return;
      var i = tabs.indexOf(tab);
      if (i < 0) return;
      var next = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      if (next < 0) return;
      e.preventDefault();
      activate(tabs[next], true);
    });
  }

  function initIndustries(root) {
    var wrap = root.querySelector("[data-nea-inds]");
    if (!wrap) return;
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".nea-ind__hit");
      if (!btn || !wrap.contains(btn)) return;
      var card = btn.closest(".nea-ind");
      Array.prototype.forEach.call(wrap.querySelectorAll(".nea-ind"), function (el) {
        var on = el === card;
        el.classList.toggle("is-on", on);
        var hit = el.querySelector(".nea-ind__hit");
        if (hit) hit.setAttribute("aria-expanded", on ? "true" : "false");
      });
    });
  }

  function boot() {
    var root = document.querySelector("[data-nea-page]");
    if (!root) return;
    initReveal(root);
    var sols = root.querySelector("[data-nea-solutions]");
    if (sols) {
      bindTabs(sols, "[data-nea-sol]", function (tab) {
        return sols.querySelector("#nea-sol-p-" + tab.getAttribute("data-nea-sol"));
      });
    }
    var depts = root.querySelector("[data-nea-depts]");
    if (depts) {
      bindTabs(depts, "[data-nea-dept]", function (tab) {
        return depts.querySelector("#nea-dept-p-" + tab.getAttribute("data-nea-dept"));
      });
    }
    initIndustries(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
