/**
 * Global navigation — dropdowns, mobile drawer, sticky bar, compact lang labels.
 */
(function () {
  "use strict";

  var COMPACT_LANG = { ko: "KO", en: "EN", ja: "JA", es: "ES", "pt-br": "PT", fr: "FR", de: "DE", hi: "HI", id: "ID" };

  function closeDropdowns(except) {
    document.querySelectorAll("[data-gnav-dd]").forEach(function (dd) {
      if (except && dd === except) return;
      var trigger = dd.querySelector(".gnav-dd__trigger");
      var panel = dd.querySelector(".gnav-dd__panel");
      if (panel) panel.hidden = true;
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  function closeMobile() {
    document.querySelectorAll(".gnav-mobile:not([hidden])").forEach(function (drawer) {
      drawer.hidden = true;
      drawer.setAttribute("aria-hidden", "true");
    });
    document.querySelectorAll("[data-gnav-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
    });
    document.documentElement.classList.remove("gnav-open");
    document.body.classList.remove("gnav-open");
  }

  function openMobile(btn) {
    var id = btn.getAttribute("aria-controls");
    if (!id) return;
    var drawer = document.getElementById(id);
    if (!drawer) return;
    closeDropdowns();
    drawer.hidden = false;
    drawer.removeAttribute("aria-hidden");
    btn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("gnav-open");
    document.body.classList.add("gnav-open");
    var panel = drawer.querySelector(".gnav-mobile__panel");
    if (panel) {
      var first = panel.querySelector("a, button");
      if (first) first.focus();
    }
  }

  function bindDropdowns() {
    document.querySelectorAll("[data-gnav-dd]").forEach(function (dd) {
      var trigger = dd.querySelector(".gnav-dd__trigger");
      var panel = dd.querySelector(".gnav-dd__panel");
      if (!trigger || !panel) return;

      dd.addEventListener("mouseenter", function () {
        if (window.matchMedia("(min-width: 901px)").matches) {
          closeDropdowns(dd);
          trigger.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
      dd.addEventListener("mouseleave", function () {
        if (window.matchMedia("(min-width: 901px)").matches) {
          trigger.setAttribute("aria-expanded", "false");
          panel.hidden = true;
        }
      });

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = trigger.getAttribute("aria-expanded") === "true";
        closeDropdowns(dd);
        trigger.setAttribute("aria-expanded", open ? "false" : "true");
        panel.hidden = open;
        if (!open) {
          var first = panel.querySelector("a");
          if (first) first.focus();
        }
      });

      trigger.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          closeDropdowns(dd);
          trigger.setAttribute("aria-expanded", "true");
          panel.hidden = false;
          var first = panel.querySelector("a");
          if (first) first.focus();
        }
        if (e.key === "Escape") {
          closeDropdowns();
          trigger.focus();
        }
      });

      panel.addEventListener("keydown", function (e) {
        var links = Array.prototype.slice.call(panel.querySelectorAll("a"));
        if (!links.length) return;
        var idx = links.indexOf(document.activeElement);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          links[(idx + 1) % links.length].focus();
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          links[(idx - 1 + links.length) % links.length].focus();
        }
        if (e.key === "Escape") {
          closeDropdowns();
          trigger.focus();
        }
      });
    });
  }

  function bindLegacyDropdowns() {
    document.querySelectorAll("[data-snav-dd]").forEach(function (dd) {
      var trigger = dd.querySelector(".snav-dd__trigger");
      var panel = dd.querySelector(".snav-dd__panel");
      if (!trigger || !panel) return;
      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = trigger.getAttribute("aria-expanded") === "true";
        document.querySelectorAll("[data-snav-dd] .snav-dd__panel:not([hidden])").forEach(function (p) {
          p.hidden = true;
          var t = p.closest("[data-snav-dd]").querySelector(".snav-dd__trigger");
          if (t) t.setAttribute("aria-expanded", "false");
        });
        trigger.setAttribute("aria-expanded", open ? "false" : "true");
        panel.hidden = open;
      });
    });
  }

  function bindMobile() {
    document.querySelectorAll("[data-gnav-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.getAttribute("aria-expanded") === "true") closeMobile();
        else openMobile(btn);
      });
    });
    document.querySelectorAll("[data-gnav-close]").forEach(function (el) {
      el.addEventListener("click", closeMobile);
    });
    document.querySelectorAll(".gnav-mobile__link, .gnav-mobile__cta").forEach(function (a) {
      a.addEventListener("click", closeMobile);
    });
  }

  function bindSticky() {
    var headers = document.querySelectorAll("[data-gnav]");
    if (!headers.length) return;
    var onScroll = function () {
      var scrolled = window.scrollY > 8;
      headers.forEach(function (h) {
        h.classList.toggle("gnav--scrolled", scrolled);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function syncLangCompact() {
    document.querySelectorAll("[data-lang-compact]").forEach(function (sel) {
      var cur = sel.value;
      if (COMPACT_LANG[cur]) {
        sel.dataset.compactLabel = COMPACT_LANG[cur];
      }
      sel.addEventListener("change", function () {
        if (COMPACT_LANG[sel.value]) sel.dataset.compactLabel = COMPACT_LANG[sel.value];
      });
    });
  }

  document.addEventListener("click", function () {
    closeDropdowns();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeDropdowns();
      closeMobile();
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    bindDropdowns();
    bindLegacyDropdowns();
    bindMobile();
    bindSticky();
    syncLangCompact();
    document.querySelectorAll("[data-snav-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var nav = document.getElementById("snav-mobile-nav");
        if (!nav) return;
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        nav.hidden = open;
      });
    });
  });
})();
