/**
 * Newon Resources — filters, scroll reveal, optional search, TOC.
 */
(function () {
  "use strict";

  var root = document.querySelector(".rs-page");
  if (!root) return;

  var hub = root.getAttribute("data-rs-hub") || "";
  var analyticsId = root.getAttribute("data-rs-analytics") || hub;

  if (window.newonTrack && window.newonAnalyticsEvents) {
    window.newonTrack(window.newonAnalyticsEvents.PAGE_VIEW || "page_view", {
      resources: analyticsId,
    });
  }

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) root.classList.add("rs-reduced-motion");

  var revealNodes = document.querySelectorAll("[data-rs-reveal]");
  revealNodes.forEach(function (el) {
    el.classList.add("rs-reveal");
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    revealNodes.forEach(function (el) {
      io.observe(el);
    });
  }

  /* Category filters — store / blog / media / etc. */
  document.querySelectorAll("[data-rs-filters]").forEach(function (bar) {
    var scope =
      bar.closest("[data-rs-filter-scope]") ||
      bar.closest(".rs-section, .rs-inner, section, .mh-page, .nb-page") ||
      root;
    var grid =
      (scope && scope.querySelector("[data-rs-filter-grid]")) ||
      bar.parentElement.querySelector("[data-rs-filter-grid]") ||
      root.querySelector("[data-rs-filter-grid]");
    var empty =
      (scope && scope.querySelector("[data-rs-filter-empty]")) ||
      (bar.parentElement && bar.parentElement.querySelector("[data-rs-filter-empty]")) ||
      root.querySelector("[data-rs-filter-empty]");
    if (!grid) return;

    function setEmptyVisible(show, filtered) {
      if (!empty) return;
      var on = show && filtered;
      empty.hidden = !on;
      if (on) {
        empty.removeAttribute("hidden");
        empty.setAttribute("aria-hidden", "false");
      } else {
        empty.setAttribute("hidden", "");
        empty.setAttribute("aria-hidden", "true");
      }
    }

    function applyFilter(cat, pushUrl) {
      var key = String(cat || "all").toLowerCase();
      bar.querySelectorAll("[data-rs-filter]").forEach(function (b) {
        var on = String(b.getAttribute("data-rs-filter") || "").toLowerCase() === key;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });

      var visible = 0;
      grid.querySelectorAll("[data-category]").forEach(function (item) {
        var itemCat = String(item.getAttribute("data-category") || "").toLowerCase();
        var collection = String(item.getAttribute("data-collection") || "").toLowerCase();
        var tokens = itemCat.split(/[\s,]+/).filter(Boolean);
        if (collection) tokens.push(collection);
        var match =
          key === "all" ||
          tokens.indexOf(key) !== -1 ||
          itemCat === key ||
          (key === "publishing" && collection === "publishing") ||
          (key === "free" && tokens.indexOf("free") !== -1);
        item.hidden = !match;
        item.classList.toggle("is-filtered-out", !match);
        if (match) {
          visible += 1;
          item.classList.add("is-in");
        }
      });

      /* Featured (and other items) outside the grid but inside filter scope */
      if (scope) {
        scope.querySelectorAll("[data-category]").forEach(function (item) {
          if (grid.contains(item)) return;
          var itemCat = String(item.getAttribute("data-category") || "").toLowerCase();
          var collection = String(item.getAttribute("data-collection") || "").toLowerCase();
          var tokens = itemCat.split(/[\s,]+/).filter(Boolean);
          if (collection) tokens.push(collection);
          var match =
            key === "all" ||
            tokens.indexOf(key) !== -1 ||
            itemCat === key;
          item.hidden = !match;
          item.classList.toggle("is-filtered-out", !match);
          if (match) visible += 1;
        });
      }

      setEmptyVisible(visible === 0, key !== "all");

      if (pushUrl && window.history && window.history.replaceState) {
        try {
          var url = new URL(window.location.href);
          if (key === "all") {
            url.searchParams.delete("filter");
            url.searchParams.delete("cat");
          } else {
            url.searchParams.set("filter", key);
            url.searchParams.set("cat", key);
          }
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        } catch (e) {}
      }
    }

    bar.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-rs-filter]");
      if (!btn || !bar.contains(btn)) return;
      applyFilter(btn.getAttribute("data-rs-filter") || "all", true);
    });

    var initial = "all";
    try {
      var params = new URL(window.location.href).searchParams;
      initial = params.get("cat") || params.get("filter") || "all";
    } catch (e) {}
    var valid = false;
    bar.querySelectorAll("[data-rs-filter]").forEach(function (b) {
      if (String(b.getAttribute("data-rs-filter") || "").toLowerCase() === String(initial).toLowerCase()) {
        valid = true;
      }
    });
    if (!valid) initial = "all";
    applyFilter(initial, false);
  });

  /* Labs status filter — URL ?status= + archive items */
  document.querySelectorAll("[data-rs-lab-archive]").forEach(function (archive) {
    var bar = archive.querySelector(".lx-filter") || archive.querySelector(".rs-lab-filter");
    var grid = archive.querySelector("[data-rs-lab-grid]") || archive.querySelector(".rs-lab-grid");
    var empty = archive.querySelector("[data-rs-lab-empty]");
    if (!bar || !grid) return;

    function setLabEmptyVisible(show, filtered) {
      if (!empty) return;
      var on = show && filtered;
      empty.hidden = !on;
      if (on) {
        empty.removeAttribute("hidden");
        empty.setAttribute("aria-hidden", "false");
      } else {
        empty.setAttribute("hidden", "");
        empty.setAttribute("aria-hidden", "true");
      }
    }

    function applyFilter(status, push) {
      var key = status || "all";
      bar.querySelectorAll("[data-rs-lab-filter]").forEach(function (b) {
        var on = (b.getAttribute("data-rs-lab-filter") || "all") === key;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var visible = 0;
      grid.querySelectorAll("[data-rs-lab-item]").forEach(function (item) {
        var st = item.getAttribute("data-rs-lab-status") || "";
        var match = key === "all" || st === key;
        item.hidden = !match;
        if (match) visible += 1;
      });
      setLabEmptyVisible(visible === 0, key !== "all");
      if (push && window.history && window.history.replaceState) {
        try {
          var url = new URL(window.location.href);
          if (key === "all") url.searchParams.delete("status");
          else url.searchParams.set("status", key);
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        } catch (e) {}
      }
    }

    bar.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-rs-lab-filter]");
      if (!btn) return;
      applyFilter(btn.getAttribute("data-rs-lab-filter") || "all", true);
    });

    var initial = "all";
    try {
      initial = new URL(window.location.href).searchParams.get("status") || "all";
    } catch (e) {}
    if (["all", "TESTING", "RESEARCH", "PROTOTYPE", "VALIDATED", "ARCHIVED"].indexOf(initial) === -1) {
      initial = "all";
    }
    applyFilter(initial, false);
  });

  /* Legacy labs filter (safety) */
  document.querySelectorAll(".rs-lab-filter").forEach(function (bar) {
    if (bar.closest("[data-rs-lab-archive]")) return;
    var grid = root.querySelector(".rs-lab-grid");
    var empty = root.querySelector("[data-rs-lab-empty]");
    if (!grid) return;
    bar.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-rs-lab-filter]");
      if (!btn) return;
      var status = btn.getAttribute("data-rs-lab-filter") || "all";
      bar.querySelectorAll("[data-rs-lab-filter]").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      var visible = 0;
      grid.querySelectorAll("[data-rs-lab-item]").forEach(function (item) {
        var match = status === "all" || item.getAttribute("data-rs-lab-status") === status;
        item.hidden = !match;
        if (match) visible += 1;
      });
      if (empty) {
        empty.hidden = !(visible === 0 && status !== "all");
        empty.setAttribute("aria-hidden", empty.hidden ? "true" : "false");
      }
    });
  });

  /* FAQ */
  document.querySelectorAll(".rs-faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".rs-faq-item");
      if (!item) return;
      var open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* Blog TOC active */
  var tocLinks = document.querySelectorAll("[data-rs-toc] a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (el) map[id] = a;
    });
    var tocIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          tocLinks.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) tocIo.observe(el);
    });
  }

  /* Resources INDEX search (rx) */
  var searchRoot = document.querySelector("[data-rx-find][data-rs-search]");
  var indexEl = document.getElementById("rs-search-index");
  if (searchRoot && indexEl && searchRoot.hasAttribute("data-rs-search-ready")) {
    var items = [];
    try {
      items = JSON.parse(indexEl.textContent || "[]");
    } catch (e) {
      items = [];
    }
    var input = searchRoot.querySelector("[data-rs-search-input]");
    var results = searchRoot.querySelector("[data-rs-search-results]");
    var emptyEl = searchRoot.querySelector("[data-rx-empty]");
    var suggestEl = searchRoot.querySelector("[data-rx-suggest]");
    var filterBar = searchRoot.querySelector("[data-rx-filters]");
    var activeType = "all";

    function renderHits(hits, q) {
      if (!results) return;
      var hasQuery = Boolean(String(q || "").trim());
      var typeFiltered = activeType !== "all";
      var filtered = hasQuery || typeFiltered;
      if (!filtered) {
        results.hidden = true;
        results.innerHTML = "";
        if (emptyEl) {
          emptyEl.hidden = true;
          emptyEl.setAttribute("hidden", "");
          emptyEl.setAttribute("aria-hidden", "true");
        }
        if (suggestEl) suggestEl.hidden = false;
        return;
      }
      if (suggestEl) suggestEl.hidden = true;
      if (hits.length === 0) {
        results.hidden = true;
        results.innerHTML = "";
        if (emptyEl) {
          emptyEl.hidden = false;
          emptyEl.removeAttribute("hidden");
          emptyEl.setAttribute("aria-hidden", "false");
        }
        return;
      }
      if (emptyEl) {
        emptyEl.hidden = true;
        emptyEl.setAttribute("hidden", "");
        emptyEl.setAttribute("aria-hidden", "true");
      }
      results.hidden = false;
      results.innerHTML = hits
        .map(function (it) {
          return (
            '<a class="rx-hit" href="' +
            it.url +
            '"><span>' +
            String(it.type || "").toUpperCase() +
            "</span><strong>" +
            (it.title || "") +
            "</strong></a>"
          );
        })
        .join("");
    }

    function runSearch() {
      if (!input) return;
      var q = String(input.value || "")
        .trim()
        .toLowerCase();
      var typeFiltered = activeType !== "all";
      var hits = items.filter(function (it) {
        var typeOk = activeType === "all" || String(it.type || "") === activeType;
        if (!typeOk) return false;
        if (!q) return typeFiltered;
        return (
          String(it.title || "")
            .toLowerCase()
            .indexOf(q) !== -1 ||
          String(it.description || "")
            .toLowerCase()
            .indexOf(q) !== -1 ||
          String(it.type || "")
            .toLowerCase()
            .indexOf(q) !== -1 ||
          String(it.category || "")
            .toLowerCase()
            .indexOf(q) !== -1 ||
          (Array.isArray(it.tags) && it.tags.some(function (t) {
            return String(t).toLowerCase().indexOf(q) !== -1;
          }))
        );
      });
      renderHits(hits.slice(0, 10), q);
    }

    if (input && results) input.addEventListener("input", runSearch);
    if (filterBar) {
      filterBar.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-rx-type]");
        if (!btn) return;
        activeType = btn.getAttribute("data-rx-type") || "all";
        filterBar.querySelectorAll("[data-rx-type]").forEach(function (b) {
          b.classList.toggle("is-on", b === btn);
        });
        runSearch();
      });
    }
    runSearch();

    document.addEventListener("keydown", function (ev) {
      var meta = ev.metaKey || ev.ctrlKey;
      if (!meta || (ev.key !== "k" && ev.key !== "K")) return;
      if (!input) return;
      var tag = (ev.target && ev.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || (ev.target && ev.target.isContentEditable)) {
        if (ev.target !== input) return;
      }
      ev.preventDefault();
      input.focus();
      var find = document.getElementById("rs-content");
      if (find && find.scrollIntoView) {
        find.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
    });
  }

  /* Topic chips → latest (index only) */
  var topicsRoot = document.querySelector("[data-rx-topics]");
  var latestRoot = document.querySelector("[data-rx-latest]");
  if (topicsRoot && latestRoot) {
    topicsRoot.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-rx-topic]");
      if (!btn) return;
      var topic = (btn.getAttribute("data-rx-topic") || "").toLowerCase();
      var wasOn = btn.classList.contains("is-on");
      topicsRoot.querySelectorAll("[data-rx-topic]").forEach(function (b) {
        b.classList.remove("is-on");
      });
      if (wasOn) {
        latestRoot.querySelectorAll("[data-rx-row]").forEach(function (li) {
          li.classList.remove("is-dim");
        });
        return;
      }
      btn.classList.add("is-on");
      latestRoot.querySelectorAll("[data-rx-row]").forEach(function (li) {
        var hay = (li.getAttribute("data-rx-topics") || "").toLowerCase();
        li.classList.toggle("is-dim", hay.indexOf(topic) === -1);
      });
      var latestSec = document.getElementById("rx-latest");
      if (latestSec && latestSec.scrollIntoView) {
        latestSec.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
  }
})();
