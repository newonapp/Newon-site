/**
 * NEWON IR — render + i18n (studio bs-* design system)
 */
(function () {
  "use strict";

  var LANG_KEY = "newon-ir-lang";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DATA = window.NEWON_IR_DATA;
  var I18N = window.NEWON_IR_I18N || { ko: {}, en: {} };

  function t(lang, key) {
    var pack = I18N[lang] || I18N.ko || {};
    if (Object.prototype.hasOwnProperty.call(pack, key)) return pack[key];
    if (I18N.ko && Object.prototype.hasOwnProperty.call(I18N.ko, key)) return I18N.ko[key];
    return key;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function statusBadge(lang, status) {
    return '<span class="ir-badge ir-badge--' + esc(status) + '">' + t(lang, "status." + status) + "</span>";
  }

  function iconForApp(name) {
    if (!DATA || !name) return "";
    var found = "";
    (DATA.categories || []).forEach(function (cat) {
      (cat.products || []).forEach(function (p) {
        if (!found && p.name === name) found = p.icon || "";
      });
    });
    if (found) return found;
    (DATA.nextProducts || []).forEach(function (p) {
      if (!found && p.name === name) found = p.icon || "";
    });
    if (found) return found;
    (DATA.logoRail || DATA.growthMap || []).forEach(function (p) {
      if (!found && p.name === name) found = p.icon || "";
    });
    return found;
  }

  function appLogoHtml(name, size) {
    var src = iconForApp(name);
    if (!src) return "";
    var s = size || 36;
    return (
      '<img class="ir-app-logo" src="' +
      esc(src) +
      '" alt="" width="' +
      s +
      '" height="' +
      s +
      '" loading="lazy" decoding="async" />'
    );
  }

  function listHtml(lang, keys) {
    if (!keys || !keys.length) return "";
    return (
      "<ul class=\"ir-mini-list\">" +
      keys
        .map(function (k) {
          return "<li>" + t(lang, k) + "</li>";
        })
        .join("") +
      "</ul>"
    );
  }

  var DESC = {
    "ox-month": "ox.desc",
    subping: "sub.desc",
    savy: "savy.desc",
    piggyup: "pig.desc",
    pillmate: "pill.desc",
    babylog: "baby.desc",
    petlog: "pet.desc",
    goalup: "goal.desc",
    countup: "count.desc",
    "my-world": "world.desc",
    fiton: "fit.desc",
    eaton: "eat.desc",
    "newon-plus": "plus.desc",
  };

  function productCard(lang, catLabel, p, n) {
    var href = (p.href || "#").replace("/ko/", lang === "en" ? "/en/" : "/ko/");
    var num = String(n).padStart(2, "0");
    return (
      '<article class="bs-get__item ir-app' +
      (p.featured ? " ir-app--featured" : "") +
      '">' +
      '<a class="ir-app__hit" href="' +
      esc(href) +
      '">' +
      '<span class="bs-get__n" aria-hidden="true">' +
      num +
      "</span>" +
      '<div class="bs-get__copy">' +
      '<div class="ir-app__head">' +
      '<img src="' +
      esc(p.icon) +
      '" alt="" width="40" height="40" loading="lazy" />' +
      "<div>" +
      '<p class="ir-app__cat">' +
      esc(catLabel) +
      "</p>" +
      "<h3>" +
      esc(p.name) +
      "</h3>" +
      "</div>" +
      statusBadge(lang, p.status) +
      "</div>" +
      "<p>" +
      t(lang, DESC[p.id] || "ox.desc") +
      "</p>" +
      (p.taglineKey ? "<p><strong>" + t(lang, p.taglineKey) + "</strong></p>" : "") +
      (p.growthKey ? '<p class="ir-growth-line">' + t(lang, p.growthKey) + "</p>" : "") +
      '<div class="ir-app__cols">' +
      "<div><p class=\"ir-col-label\">" +
      t(lang, "port.current") +
      "</p>" +
      listHtml(lang, p.currentKeys) +
      "</div>" +
      "<div><p class=\"ir-col-label\">" +
      t(lang, "port.next") +
      "</p>" +
      listHtml(lang, p.nextKeys) +
      "</div></div>" +
      (p.longKey ? "<p class=\"ir-muted\">" + t(lang, "port.long") + " · " + t(lang, p.longKey) + "</p>" : "") +
      (p.cautionKey ? "<p class=\"ir-muted\">" + t(lang, p.cautionKey) + "</p>" : "") +
      (p.plannedNoteKey ? "<p class=\"ir-muted\">" + t(lang, p.plannedNoteKey) + "</p>" : "") +
      "</div></a></article>"
    );
  }

  function renderPortfolio(lang) {
    var el = document.getElementById("ir-portfolio");
    if (!el || !DATA) return;
    var n = 0;
    el.innerHTML = DATA.categories
      .map(function (cat) {
        var label = t(lang, cat.labelKey);
        var cards = cat.products
          .map(function (p) {
            n += 1;
            return productCard(lang, label, p, n);
          })
          .join("");
        return (
          '<div class="ir-cat">' +
          '<p class="bs-eyebrow">' +
          esc(label) +
          "</p>" +
          '<div class="bs-get bs-get--board ir-fill-grid" data-count="' +
          cat.products.length +
          '" data-variant="board">' +
          cards +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderNext(lang) {
    var el = document.getElementById("ir-next");
    if (!el || !DATA) return;
    el.innerHTML = DATA.nextProducts
      .map(function (p, idx) {
        var pillars = (p.pillars || [])
          .map(function (col, i) {
            return (
              '<article class="bs-get__item"><span class="bs-get__n">' +
              String(i + 1).padStart(2, "0") +
              '</span><div class="bs-get__copy"><h3>' +
              t(lang, col.titleKey) +
              "</h3>" +
              listHtml(lang, col.itemsKey) +
              "</div></article>"
            );
          })
          .join("");
        return (
          '<article class="ir-next-block">' +
          '<div class="ir-next-head">' +
          '<img src="' +
          esc(p.icon) +
          '" alt="" width="52" height="52" loading="lazy" />' +
          "<div>" +
          '<p class="bs-eyebrow">' +
          t(lang, p.categoryKey) +
          "</p>" +
          "<h3 class=\"bs-title\" style=\"font-size:1.5rem;max-width:none\">" +
          esc(p.name) +
          "</h3>" +
          "</div>" +
          statusBadge(lang, p.status) +
          "</div>" +
          "<p class=\"bs-lead\">" +
          t(lang, p.headlineKey) +
          "</p>" +
          "<p>" +
          t(lang, p.bodyKey) +
          "</p>" +
          '<p class="ir-growth-line">' +
          t(lang, p.growthKey) +
          "</p>" +
          '<div class="bs-get bs-get--what" data-variant="what">' +
          pillars +
          "</div>" +
          (p.laterKeys
            ? '<p class="bs-note" style="margin-top:1rem">' +
              t(lang, "port.long") +
              ": " +
              p.laterKeys.map(function (k) {
                return t(lang, k);
              }).join(" · ") +
              "</p>"
            : "") +
          "</article>"
        );
      })
      .join("");
  }

  function renderGrowth(lang) {
    var el = document.getElementById("ir-growth");
    if (!el || !DATA) return;
    el.innerHTML = DATA.growthMap
      .map(function (row, i) {
        var parts = t(lang, row.flowKey).split(/\s*→\s*/);
        var flow = parts
          .map(function (part, idx) {
            return (
              (idx ? '<span class="ir-flow-arrow" aria-hidden="true">→</span>' : "") +
              '<span class="ir-flow-step">' +
              esc(part) +
              "</span>"
            );
          })
          .join("");
        return (
          '<article class="bs-get__item' +
          (row.featured ? " is-featured" : "") +
          (row.next ? " is-next" : "") +
          '"><span class="bs-get__n">' +
          String(i + 1).padStart(2, "0") +
          '</span><div class="bs-get__copy"><h3><img src="' +
          esc(row.icon) +
          '" alt="" width="22" height="22" loading="lazy" /> ' +
          esc(row.name) +
          (row.next ? " " + statusBadge(lang, "in-development") : "") +
          '</h3><div class="ir-flow-track">' +
          flow +
          "</div></div></article>"
        );
      })
      .join("");
  }

  function renderSnapshot(lang) {
    var el = document.getElementById("ir-snapshot");
    if (!el || !DATA) return;
    el.innerHTML = DATA.snapshot
      .map(function (s, i) {
        return (
          '<article class="ir-glance__card">' +
          '<span class="ir-glance__n">' +
          String(i + 1).padStart(2, "0") +
          "</span>" +
          '<p class="ir-glance__value">' +
          esc(s.value) +
          "</p>" +
          '<p class="ir-glance__label">' +
          t(lang, s.labelKey) +
          "</p>" +
          (s.noteKey ? '<p class="ir-glance__note">' + t(lang, s.noteKey) + "</p>" : "") +
          "</article>"
        );
      })
      .join("");
  }

  function renderStrategy(lang) {
    var el = document.getElementById("ir-strategy");
    if (!el || !DATA) return;
    el.innerHTML = DATA.strategySteps
      .map(function (s) {
        return (
          '<article class="ir-strat-card">' +
          '<span class="ir-strat-card__n" aria-hidden="true">' +
          esc(s.n) +
          "</span>" +
          "<h3>" +
          t(lang, "strat." + s.key + ".t") +
          "</h3>" +
          "<p>" +
          t(lang, "strat." + s.key + ".p") +
          "</p></article>"
        );
      })
      .join("");
  }

  function renderPlus(lang) {
    var feats = document.getElementById("ir-plus-feats");
    var orbit = document.getElementById("ir-plus-orbit");
    if (feats) {
      feats.innerHTML = DATA.plusFeatures
        .map(function (f, i) {
          var n = i + 1;
          return (
            '<article class="bs-get__item"><span class="bs-get__n">' +
            String(n).padStart(2, "0") +
            '</span><div class="bs-get__copy"><h3>' +
            t(lang, "plus.f" + n + ".t") +
            "</h3><p>" +
            t(lang, "plus.f" + n + ".p") +
            "</p></div></article>"
          );
        })
        .join("");
    }
    if (orbit) {
      orbit.innerHTML =
        '<div class="bs-sv"><div class="bs-sv__head"><span class="bs-sv__live"><i></i> NEWON+</span><span class="bs-sv__meta">HUB</span></div><div class="bs-sv__body"><div class="bs-sv-product__comps ir-orbit-comps">' +
        DATA.plusOrbit
          .map(function (p) {
            return (
              "<span" +
              (p.next ? ' class="is-next"' : "") +
              '><img src="' +
              esc(p.icon) +
              '" alt="" width="18" height="18" loading="lazy" /> ' +
              esc(p.name) +
              "</span>"
            );
          })
          .join("") +
        "</div></div></div>";
    }
  }

  function renderIntel(lang) {
    var flow = document.getElementById("ir-intel-flow");
    var ex = document.getElementById("ir-intel-ex");
    if (flow) {
      flow.innerHTML = DATA.intelligenceFlow
        .map(function (k) {
          return "<li>" + t(lang, "intel." + k) + "</li>";
        })
        .join("");
    }
    if (ex) {
      ex.innerHTML = DATA.intelligenceExamples
        .map(function (e, i) {
          return (
            '<article class="bs-get__item' +
            (e.next ? " is-next" : "") +
            '"><span class="bs-get__n">' +
            String(i + 1).padStart(2, "0") +
            '</span><div class="bs-get__copy"><h3>' +
            esc(e.name) +
            "</h3><p>" +
            t(lang, e.flowKey) +
            "</p></div></article>"
          );
        })
        .join("");
    }
  }

  function renderRevenue(lang) {
    var el = document.getElementById("ir-revenue");
    if (!el || !DATA) return;
    el.className = "ir-rev";
    el.setAttribute("data-count", String(DATA.revenueLayers.length));
    el.innerHTML = DATA.revenueLayers
      .map(function (r) {
        var chips = (r.items || [])
          .map(function (k) {
            return '<span class="ir-rev__chip">' + t(lang, k) + "</span>";
          })
          .join("");
        return (
          '<article class="ir-rev__card is-' +
          esc(r.timing) +
          '">' +
          '<header class="ir-rev__head">' +
          '<span class="ir-rev__n">' +
          esc(r.n) +
          "</span>" +
          '<em class="ir-rev__timing">' +
          t(lang, "timing." + r.timing) +
          "</em></header>" +
          "<h3>" +
          t(lang, r.key) +
          "</h3>" +
          '<div class="ir-rev__chips">' +
          chips +
          "</div></article>"
        );
      })
      .join("");
  }

  function renderCommerce(lang) {
    var el = document.getElementById("ir-commerce");
    if (!el || !DATA) return;

    function storeMatrix(rows) {
      return rows
        .map(function (r, i) {
          var long = r.status === "long-term";
          return (
            '<article class="ir-store-cell' +
            (long ? " is-long" : "") +
            '">' +
            '<header class="ir-store-cell__head">' +
            '<span class="ir-store-cell__n">' +
            String(i + 1).padStart(2, "0") +
            "</span>" +
            statusBadge(lang, r.status) +
            "</header>" +
            '<div class="ir-store-cell__brand">' +
            appLogoHtml(r.name, 40) +
            "<h3>" +
            esc(r.name) +
            "</h3></div>" +
            '<div class="ir-store-cell__tags">' +
            (r.itemsKey || [])
              .map(function (k) {
                return "<span>" + t(lang, k) + "</span>";
              })
              .join("") +
            "</div></article>"
          );
        })
        .join("");
    }

    function bookStrip(rows) {
      return rows
        .map(function (r, i) {
          return (
            (i ? '<span class="ir-book-strip__join" aria-hidden="true"></span>' : "") +
            '<article class="ir-book-item">' +
            '<span class="ir-book-item__n">' +
            String(i + 1).padStart(2, "0") +
            "</span>" +
            '<div class="ir-book-item__brand">' +
            appLogoHtml(r.name, 36) +
            "<h3>" +
            esc(r.name) +
            "</h3></div>" +
            "<p>" +
            (r.itemsKey || [])
              .map(function (k) {
                return t(lang, k);
              })
              .join(" · ") +
            "</p>" +
            statusBadge(lang, r.status) +
            "</article>"
          );
        })
        .join("");
    }

    el.innerHTML =
      '<div class="ir-com-block">' +
      '<div class="ir-com-block__head">' +
      "<div><p class=\"bs-eyebrow\">" +
      t(lang, "com.store") +
      '</p><p class="ir-com-block__sub" data-i18n-skip>' +
      t(lang, "com.storeHint") +
      "</p></div>" +
      '<span class="ir-com-count">' +
      String(DATA.commerce.store.length).padStart(2, "0") +
      "</span></div>" +
      '<div class="ir-store-grid">' +
      storeMatrix(DATA.commerce.store) +
      "</div></div>" +
      '<div class="ir-com-block">' +
      '<div class="ir-com-block__head">' +
      "<div><p class=\"bs-eyebrow\">" +
      t(lang, "com.market") +
      '</p><p class="ir-com-block__sub">' +
      t(lang, "com.marketHint") +
      "</p></div></div>" +
      '<div class="ir-book-strip ir-book-strip--' +
      DATA.commerce.marketplace.length +
      '">' +
      bookStrip(DATA.commerce.marketplace) +
      "</div></div>" +
      '<div class="ir-com-block">' +
      '<div class="ir-com-block__head">' +
      "<div><p class=\"bs-eyebrow\">" +
      t(lang, "com.book") +
      '</p><p class="ir-com-block__sub">' +
      t(lang, "com.bookHint") +
      "</p></div></div>" +
      '<div class="ir-book-strip ir-book-strip--' +
      DATA.commerce.booking.length +
      '">' +
      bookStrip(DATA.commerce.booking) +
      "</div></div>";
  }

  function renderRoadmap(lang) {
    var el = document.getElementById("ir-roadmap");
    if (!el || !DATA) return;
    el.className = "ir-road";
    el.removeAttribute("data-count");
    el.innerHTML =
      '<div class="ir-road__rail" aria-hidden="true"></div>' +
      DATA.roadmap
        .map(function (p) {
          return (
            '<article class="ir-road__phase is-' +
            esc(p.state) +
            '">' +
            '<div class="ir-road__head">' +
            '<span class="ir-road__dot">' +
            esc(p.phase) +
            "</span>" +
            '<p class="ir-road__state">' +
            t(lang, p.key + ".state") +
            "</p></div>" +
            "<h3>" +
            t(lang, p.key) +
            "</h3>" +
            '<ul class="ir-road__list">' +
            (p.items || [])
              .map(function (k) {
                return "<li>" + t(lang, k) + "</li>";
              })
              .join("") +
            "</ul></article>"
          );
        })
        .join("");
  }

  function renderInvest(lang) {
    var el = document.getElementById("ir-invest-focus");
    if (!el || !DATA) return;
    el.innerHTML = DATA.investment.fundUse
      .map(function (k, i) {
        return (
          '<article class="bs-get__item"><span class="bs-get__n">' +
          String(i + 1).padStart(2, "0") +
          '</span><div class="bs-get__copy"><h3>' +
          t(lang, "inv." + k) +
          "</h3><p>" +
          t(lang, "inv." + k + ".p") +
          "</p></div></article>"
        );
      })
      .join("");
    var metrics = document.getElementById("ir-invest-metrics");
    if (metrics) metrics.hidden = !(DATA.investment.investmentTarget || DATA.investment.tractionMetrics);
  }

  function renderProblemAxes(lang) {
    var el = document.getElementById("ir-problem-axes");
    if (!el || !DATA) return;
    el.innerHTML = DATA.lifeAxes
      .map(function (a) {
        var label = typeof a === "string" ? a : t(lang, a.key);
        return "<li>" + esc(label) + "</li>";
      })
      .join("");
  }

  function renderLogoRail() {
    var el = document.getElementById("ir-logo-rail");
    if (!el || !DATA) return;
    var icons = [];
    DATA.categories.forEach(function (cat) {
      cat.products.forEach(function (p) {
        icons.push({ icon: p.icon, name: p.name });
      });
    });
    DATA.nextProducts.forEach(function (p) {
      icons.push({ icon: p.icon, name: p.name, next: true });
    });
    el.innerHTML = icons
      .map(function (p) {
        return (
          '<span class="ir-logo-rail__item' +
          (p.next ? " is-next" : "") +
          '" title="' +
          esc(p.name) +
          '"><img src="' +
          esc(p.icon) +
          '" alt="" width="36" height="36" loading="lazy" /></span>'
        );
      })
      .join("");
  }

  function renderHeroNodes(lang) {
    var el = document.getElementById("ir-hero-nodes");
    if (!el || !DATA) return;
    el.innerHTML = DATA.lifeAxes
      .map(function (a, i) {
        var label = typeof a === "string" ? a : t(lang, a.key);
        return (
          (i ? "<span>·</span>" : "") +
          "<span" +
          (i === 0 ? ' class="is-on"' : "") +
          ">" +
          esc(label) +
          "</span>"
        );
      })
      .join("");
  }

  function applyStatic(lang) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.innerHTML = t(lang, el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(lang, el.getAttribute("data-i18n-aria")));
    });
    var title = document.querySelector("title");
    if (title) title.textContent = t(lang, "title");
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t(lang, "desc"));
    var ogt = document.querySelector('meta[property="og:title"]');
    if (ogt) ogt.setAttribute("content", t(lang, "title"));
    var ogd = document.querySelector('meta[property="og:description"]');
    if (ogd) ogd.setAttribute("content", t(lang, "desc"));
    document.querySelectorAll("[data-ir-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-ir-lang") === lang;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var explore = document.querySelector('a[data-i18n="hero.ctaExplore"]');
    if (explore) explore.setAttribute("href", lang === "en" ? "https://www.newon.app/en/" : "https://www.newon.app/ko/");
  }

  function renderAll(lang) {
    lang = lang === "en" ? "en" : "ko";
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-ir-lang", lang);
    applyStatic(lang);
    renderHeroNodes(lang);
    renderLogoRail();
    renderSnapshot(lang);
    renderProblemAxes(lang);
    renderStrategy(lang);
    renderPortfolio(lang);
    renderNext(lang);
    renderPlus(lang);
    renderRevenue(lang);
    renderCommerce(lang);
    renderRoadmap(lang);
    renderInvest(lang);
  }

  function currentLang() {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q === "en" || q === "ko") return q;
    } catch (_) {}
    try {
      var stored = window.localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "ko") return stored;
    } catch (_) {}
    return "ko";
  }

  function persistLang(lang) {
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch (_) {}
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (_) {}
  }

  function bindLang() {
    document.querySelectorAll("[data-ir-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-ir-lang") === "en" ? "en" : "ko";
        persistLang(lang);
        renderAll(lang);
      });
    });
  }

  function reveal() {
    var nodes = document.querySelectorAll("[data-bs-reveal], [data-ir-reveal]");
    if (!nodes.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  function navSpy() {
    var links = document.querySelectorAll(".ir-nav .bs-nav__link");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = (a.getAttribute("href") || "").slice(1);
      if (id) map[id] = a;
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var link = map[entry.target.id];
          if (!link) return;
          links.forEach(function (el) {
            el.classList.toggle("is-active", el === link);
          });
        });
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: 0.01 }
    );
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  function boot() {
    renderAll(currentLang());
    bindLang();
    reveal();
    navSpy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
