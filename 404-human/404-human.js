(function () {
  var root = document.getElementById("human404-app");
  if (!root) return;

  var cfg = window.NEWON_404_HUMAN_PLAY || {};

  function applyStatus() {
    var el = document.querySelector("[data-fh-status]");
    if (!el) return;
    var status = (cfg.STATUS || "IN DEVELOPMENT").trim();
    el.textContent = status;
    var key = status.toUpperCase().replace(/\s+/g, "_");
    el.setAttribute("data-status", key === "RELEASED" ? "released" : "development");
    el.classList.toggle("is-released", key === "RELEASED");
  }

  function applyPlayButtons() {
    var url = (cfg.PLAY_GAME_URL || "").trim();
    var btns = document.querySelectorAll("[data-fh-play]");
    btns.forEach(function (btn) {
      if (url) {
        btn.setAttribute("href", url);
        btn.classList.remove("is-disabled");
        if (/^https?:/i.test(url)) {
          btn.setAttribute("target", "_blank");
          btn.setAttribute("rel", "noopener noreferrer");
        } else {
          btn.removeAttribute("target");
          btn.removeAttribute("rel");
        }
      } else {
        btn.setAttribute("href", "#fh-cta");
        btn.classList.add("is-disabled");
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          var cta = document.getElementById("fh-cta");
          if (cta) cta.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    });
  }

  function applyShowcase() {
    var section = document.querySelector("[data-fh-showcase]");
    var grid = document.querySelector("[data-fh-showcase-grid]");
    if (!section || !grid) return;
    var shots = Array.isArray(cfg.SHOWCASE) ? cfg.SHOWCASE : [];
    var ready = shots.filter(function (s) {
      return s && String(s.src || "").trim();
    });
    if (ready.length < 3) {
      section.hidden = true;
      section.setAttribute("aria-hidden", "true");
      return;
    }
    grid.innerHTML = "";
    ready.slice(0, 3).forEach(function (s) {
      var fig = document.createElement("figure");
      fig.className = "fh-showcase-card";
      var img = document.createElement("img");
      img.src = s.src;
      img.alt = s.alt || "";
      img.loading = "lazy";
      img.decoding = "async";
      var cap = document.createElement("figcaption");
      cap.textContent = s.caption || "";
      fig.appendChild(img);
      fig.appendChild(cap);
      grid.appendChild(fig);
    });
    section.hidden = false;
    section.removeAttribute("aria-hidden");
  }

  function syncThemeButton() {
    var btn = document.getElementById("fh-theme");
    if (!btn) return;
    var dark = root.getAttribute("data-theme") === "dark";
    btn.textContent = dark ? "☀" : "☾";
    btn.setAttribute("aria-label", dark ? "라이트 모드로 전환" : "다크 모드로 전환");
    document.documentElement.setAttribute("data-newon-shell-theme", dark ? "dark" : "light");
  }

  function persistTheme(next) {
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("newon-shell-theme", next);
    } catch (e) {}
    syncThemeButton();
  }

  try {
    var saved = localStorage.getItem("newon-shell-theme");
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  } catch (e) {}
  syncThemeButton();

  var themeBtn = document.getElementById("fh-theme");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      persistTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  var navToggle = document.getElementById("fh-nav-toggle");
  var mobile = document.getElementById("fh-mobile");
  if (navToggle && mobile) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      mobile.hidden = open;
    });
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        mobile.hidden = true;
      });
    });
  }

  function closeAllAppFlyouts() {
    document.querySelectorAll("[data-apps-flyout] .apps-flyout__trigger").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll("[data-apps-flyout] .apps-flyout__panel").forEach(function (p) {
      p.hidden = true;
    });
  }

  document.querySelectorAll("[data-apps-flyout]").forEach(function (wrap) {
    var btn = wrap.querySelector(".apps-flyout__trigger");
    var panel = wrap.querySelector(".apps-flyout__panel");
    if (!btn || !panel) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var wasOpen = btn.getAttribute("aria-expanded") === "true";
      closeAllAppFlyouts();
      if (!wasOpen) {
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        closeAllAppFlyouts();
      });
    });
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-apps-flyout]")) return;
    closeAllAppFlyouts();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllAppFlyouts();
  });

  // Preview choices: hover only — no reveal of outcomes
  document.querySelectorAll(".fh-choice").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    var nodes = document.querySelectorAll(".ox-reveal-on-scroll");
    if (nodes.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) en.target.classList.add("is-visible");
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -48px 0px" }
      );
      nodes.forEach(function (el) {
        if (!el.classList.contains("is-visible")) io.observe(el);
      });
    }
  } else {
    document.querySelectorAll(".ox-reveal-on-scroll").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  applyStatus();
  applyPlayButtons();
  applyShowcase();
})();
