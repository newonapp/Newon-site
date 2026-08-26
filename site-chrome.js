/**
 * Global navigation — mega menus, mobile drawer, sticky bar.
 */
(function () {
  "use strict";

  var COMPACT_LANG = { ko: "KO", en: "EN", ja: "JA", es: "ES", "pt-br": "PT", fr: "FR", de: "DE", hi: "HI", id: "ID" };
  var CLOSE_DELAY = 280;
  var closeTimer = null;
  var desktopMq = window.matchMedia("(min-width: 901px)");

  var MOON =
    '<svg class="gnav__theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SUN =
    '<svg class="gnav__theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';

  function isDesktop() {
    return desktopMq.matches;
  }

  function cancelClose() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function closeDropdowns(except) {
    cancelClose();
    document.querySelectorAll("[data-gnav-dd]").forEach(function (dd) {
      if (except && dd === except) return;
      var trigger = dd.querySelector(".gnav-dd__trigger");
      var panel = dd.querySelector(".gnav-mega");
      dd.classList.remove("gnav-dd--open");
      if (panel) panel.hidden = true;
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
    document.documentElement.classList.remove("gnav-mega-open");
    document.body.classList.remove("gnav-mega-open");
  }

  function openDropdown(dd) {
    cancelClose();
    closeDropdowns(dd);
    var trigger = dd.querySelector(".gnav-dd__trigger");
    var panel = dd.querySelector(".gnav-mega");
    if (!trigger || !panel) return;
    dd.classList.add("gnav-dd--open");
    trigger.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    document.documentElement.classList.add("gnav-mega-open");
    document.body.classList.add("gnav-mega-open");
  }

  function scheduleClose() {
    cancelClose();
    closeTimer = setTimeout(function () {
      closeDropdowns();
    }, CLOSE_DELAY);
  }

  function closeMobile() {
    document.querySelectorAll(".gnav-mobile:not([hidden])").forEach(function (drawer) {
      drawer.hidden = true;
      drawer.setAttribute("aria-hidden", "true");
    });
    document.querySelectorAll("[data-gnav-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
      btn.classList.remove("gnav__menu-btn--open");
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
    btn.classList.add("gnav__menu-btn--open");
    document.documentElement.classList.add("gnav-open");
    document.body.classList.add("gnav-open");
    var first = drawer.querySelector(".gnav-mobile__acc-trigger, a, button");
    if (first) first.focus();
  }

  function bindDropdowns() {
    document.querySelectorAll("[data-gnav-dd]").forEach(function (dd) {
      var trigger = dd.querySelector(".gnav-dd__trigger");
      var panel = dd.querySelector(".gnav-mega");
      if (!trigger || !panel) return;

      dd.addEventListener("mouseenter", function () {
        if (!isDesktop()) return;
        openDropdown(dd);
      });

      dd.addEventListener("mouseleave", function (e) {
        if (!isDesktop()) return;
        var to = e.relatedTarget;
        if (to && (dd.contains(to) || (panel && panel.contains(to)))) return;
        scheduleClose();
      });

      panel.addEventListener("mouseenter", function () {
        if (!isDesktop()) return;
        cancelClose();
      });

      panel.addEventListener("mouseleave", function (e) {
        if (!isDesktop()) return;
        var to = e.relatedTarget;
        if (to && dd.contains(to)) return;
        scheduleClose();
      });

      /* Ensure company / mega cells always navigate even if the panel is closing */
      panel.querySelectorAll("a.gnav-mega__cell[href], a.gnav-mega__row[href], a.gnav-mega__cta[href]").forEach(function (link) {
        link.addEventListener("mousedown", function () {
          cancelClose();
        });
        link.addEventListener("click", function () {
          cancelClose();
        });
      });

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!isDesktop()) return;
        var open = trigger.getAttribute("aria-expanded") === "true";
        if (open) closeDropdowns();
        else openDropdown(dd);
      });

      trigger.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDropdown(dd);
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

  function bindMobileAccordion() {
    document.querySelectorAll("[data-gnav-acc]").forEach(function (acc) {
      var trigger = acc.querySelector(".gnav-mobile__acc-trigger");
      var panel = acc.querySelector(".gnav-mobile__acc-panel");
      if (!trigger || !panel) return;
      trigger.addEventListener("click", function () {
        var open = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", open ? "false" : "true");
        panel.hidden = open;
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
    document.querySelectorAll(".gnav-mobile__sublink[href], .gnav-mobile__cta").forEach(function (a) {
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
      if (COMPACT_LANG[cur]) sel.dataset.compactLabel = COMPACT_LANG[cur];
      sel.addEventListener("change", function () {
        if (COMPACT_LANG[sel.value]) sel.dataset.compactLabel = COMPACT_LANG[sel.value];
      });
    });
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-gnav-dd]") || e.target.closest(".gnav-mega")) return;
    closeDropdowns();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeDropdowns();
      closeMobile();
    }
  });

  desktopMq.addEventListener("change", function () {
    closeDropdowns();
    closeMobile();
  });

  document.addEventListener("DOMContentLoaded", function () {
    bindDropdowns();
    bindMobileAccordion();
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
