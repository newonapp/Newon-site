/**
 * Newon home hero — app ecosystem marquee.
 * Single source of truth for hero logo cards (hrefs match hash SPA routes).
 */
(function (global) {
  "use strict";

  var HERO_APPS = [
    {
      name: "BabyLog",
      slug: "babylog",
      category: "Family",
      descriptionKey: "babylog",
      icon: "/babylog-logo.png",
      color: "#FAD4E0",
      colorEnd: "#F7E6EC",
      href: "#babylog-app",
    },
    {
      name: "PetLog",
      slug: "petlog",
      category: "Pets",
      descriptionKey: "petlog",
      icon: "/petlog-logo.png",
      color: "#D8EFE6",
      colorEnd: "#E8F5F0",
      href: "#petlog-app",
    },
    {
      name: "GoalUp",
      slug: "goalup",
      category: "Goals",
      descriptionKey: "goalup",
      icon: "/goalup-logo.png",
      color: "#E4D4F5",
      colorEnd: "#F0E8FA",
      href: "#goalup-app",
    },
    {
      name: "CountUp",
      slug: "countup",
      category: "Tracking",
      descriptionKey: "countup",
      icon: "/countup-logo.png",
      color: "#D4E4F8",
      colorEnd: "#E8F0FA",
      href: "#countup-app",
    },
    {
      name: "Savy",
      slug: "savy",
      category: "Finance",
      descriptionKey: "savy",
      icon: "/savy-logo.png",
      color: "#D5EED9",
      colorEnd: "#E8F5EA",
      href: "#savy-app",
    },
    {
      name: "SubPing",
      slug: "subping",
      category: "Finance",
      descriptionKey: "subping",
      icon: "/subping-logo.png",
      color: "#F8D9C8",
      colorEnd: "#FAEBE3",
      href: "#subping-app",
    },
    {
      name: "Pillmate",
      slug: "pillmate",
      category: "Health",
      descriptionKey: "pillmate",
      icon: "/pillmate-logo.png",
      color: "#D4EBEF",
      colorEnd: "#E6F4F6",
      href: "#pillmate-app",
    },
    {
      name: "PiggyUp",
      slug: "piggyup",
      category: "Finance",
      descriptionKey: "piggyup",
      icon: "/piggyup-logo.png",
      color: "#F8E6B8",
      colorEnd: "#FBF1D8",
      href: "#piggyup-app",
    },
    {
      name: "OX MONTH",
      slug: "ox-month",
      category: "Habits",
      descriptionKey: "ox",
      icon: "/ox-month-logo.png",
      color: "#E8E8E8",
      colorEnd: "#F4F4F4",
      href: "#ox-month",
    },
    {
      name: "Newon+",
      slug: "newon-plus",
      category: "Membership",
      descriptionKey: "newonPlus",
      icon: "/newon-plus-logo.png",
      color: "#E0E4F0",
      colorEnd: "#ECEFF6",
      href: "#newon-plus-app",
    },
    {
      name: "My World",
      slug: "myworld",
      category: "Travel",
      descriptionKey: "myworld",
      icon: "/myworld-logo.png",
      color: "#DCE8F5",
      colorEnd: "#EBF2F9",
      href: "#myworld-app",
    },
  ];

  var ROW_LAYOUTS = [
    {
      apps: ["babylog", "goalup", "savy", "pillmate", "ox-month", "petlog", "countup", "subping", "piggyup", "newon-plus", "myworld"],
      direction: "ltr",
      duration: 40,
    },
    {
      apps: ["myworld", "newon-plus", "piggyup", "subping", "countup", "petlog", "ox-month", "pillmate", "savy", "goalup", "babylog"],
      direction: "rtl",
      duration: 48,
    },
  ];

  function bySlug(slug) {
    for (var i = 0; i < HERO_APPS.length; i++) {
      if (HERO_APPS[i].slug === slug) return HERO_APPS[i];
    }
    return null;
  }

  function readLabels() {
    var el = document.getElementById("newon-hero-apps-labels");
    if (!el) return {};
    try {
      return JSON.parse(el.textContent || "{}");
    } catch (e) {
      return {};
    }
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function cardHtml(app, labels, index) {
    var label = labels[app.descriptionKey] || {};
    var desc = label.description || app.category;
    var cat = label.category || app.category;
    var aria = app.name + (desc ? " — " + desc : "");
    return (
      '<a class="hero-app-card" href="' +
      escapeAttr(app.href) +
      '" aria-label="' +
      escapeAttr(aria) +
      '" data-app="' +
      escapeAttr(app.slug) +
      '" style="--hero-app-from:' +
      escapeAttr(app.color) +
      ";--hero-app-to:" +
      escapeAttr(app.colorEnd) +
      ";--hero-card-i:" +
      index +
      '">' +
      '<span class="hero-app-card__glow" aria-hidden="true"></span>' +
      '<img class="hero-app-card__icon" src="' +
      escapeAttr(app.icon) +
      '" alt="' +
      escapeAttr(app.name) +
      '" width="96" height="96" loading="lazy" decoding="async" />' +
      '<span class="hero-app-card__meta">' +
      '<span class="hero-app-card__name">' +
      escapeAttr(app.name) +
      "</span>" +
      '<span class="hero-app-card__desc">' +
      escapeAttr(desc) +
      "</span>" +
      '<span class="hero-app-card__cat">' +
      escapeAttr(cat) +
      "</span>" +
      "</span>" +
      "</a>"
    );
  }

  function buildCards(slugs, labels, startIndex) {
    var parts = [];
    var i;
    for (i = 0; i < slugs.length; i++) {
      var app = bySlug(slugs[i]);
      if (app) parts.push(cardHtml(app, labels, startIndex + i));
    }
    return parts.join("");
  }

  function prefersReducedMotion() {
    return global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isMobile() {
    return global.matchMedia && global.matchMedia("(max-width: 720px)").matches;
  }

  function fillGroup(group, minWidth) {
    if (!group) return;
    var base = group.innerHTML;
    if (!base) return;
    var cardCount = group.querySelectorAll(".hero-app-card").length || 1;
    var sample = group.querySelector(".hero-app-card");
    var cardWidth = sample ? sample.getBoundingClientRect().width : 110;
    var gap = 18;
    var unit = Math.max(cardWidth + gap, 72) * cardCount;
    var copiesNeeded = Math.max(2, Math.ceil(minWidth / unit) + 1);
    if (copiesNeeded > 8) copiesNeeded = 8;
    var html = "";
    var i;
    for (i = 0; i < copiesNeeded; i++) html += base;
    group.innerHTML = html;
  }

  function prepareSeamlessTracks(root) {
    var rows = root.querySelectorAll(".hero-marquee__row");
    var viewport = Math.max(global.innerWidth || 0, root.clientWidth || 0, 1280);
    var minGroupWidth = Math.ceil(viewport * 1.25);
    var i;
    for (i = 0; i < rows.length; i++) {
      var groups = rows[i].querySelectorAll(".hero-marquee__group");
      if (!groups.length) continue;
      fillGroup(groups[0], minGroupWidth);
      var filled = groups[0].innerHTML;
      var j;
      for (j = 1; j < groups.length; j++) {
        groups[j].innerHTML = filled;
      }
    }
  }

  function renderMarquee(root) {
    if (!root) return;
    var labels = readLabels();
    var layouts = ROW_LAYOUTS.map(function (row) {
      return {
        apps: row.apps.slice(),
        direction: row.direction,
        duration: isMobile() ? row.duration + 10 : row.duration,
      };
    });

    var html = '<div class="hero-marquee__rows">';
    var r;
    for (r = 0; r < layouts.length; r++) {
      var row = layouts[r];
      var cards = buildCards(row.apps, labels, r * 12);
      var dur = prefersReducedMotion() ? row.duration * 4 : row.duration;
      html +=
        '<div class="hero-marquee__row hero-marquee__row--' +
        row.direction +
        '" style="--marquee-duration:' +
        dur +
        's">' +
        '<div class="hero-marquee__track">' +
        '<div class="hero-marquee__group">' +
        cards +
        "</div>" +
        '<div class="hero-marquee__group" aria-hidden="true">' +
        cards +
        "</div>" +
        "</div>" +
        "</div>";
    }
    html += "</div>";
    root.innerHTML = html;

    function finish() {
      prepareSeamlessTracks(root);
      root.setAttribute("data-ready", "1");
    }

    if (global.requestAnimationFrame) {
      global.requestAnimationFrame(function () {
        global.requestAnimationFrame(finish);
      });
    } else {
      finish();
    }
  }

  function setupMarqueeResize(root) {
    if (!root || root.getAttribute("data-resize-bound") === "1") return;
    root.setAttribute("data-resize-bound", "1");
    var resizeTimer;
    global.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        renderMarquee(root);
      }, 200);
    });
  }

  function setupParallax(hero) {
    if (!hero || prefersReducedMotion()) return;
    var copy = hero.querySelector(".hero-copy--centered");
    var marquee = hero.querySelector(".hero-marquee");
    var ticking = false;

    function update() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > global.innerHeight) return;
      var progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
      if (copy) {
        copy.style.transform = "translate3d(0," + progress * -28 + "px,0)";
      }
      if (marquee) {
        marquee.style.transform = "translate3d(0," + progress * 16 + "px,0)";
      }
    }

    global.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          global.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  function init() {
    var hero = document.querySelector("#home .hero--ecosystem");
    var root = document.querySelector("[data-hero-marquee]");
    if (root) {
      renderMarquee(root);
      setupMarqueeResize(root);
    }
    if (hero) {
      hero.classList.add("hero--entered");
      setupParallax(hero);
    }
  }

  global.NEWON_HERO_APPS = HERO_APPS;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : globalThis);
