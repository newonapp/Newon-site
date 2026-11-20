/**
 * News hub: category + product + search filters, pagination, timeline, history type filters.
 * URL: ?category=update&product=petlog (also accepts legacy ?cat=)
 */
(function () {
  var root = document.getElementById("nw-main");
  if (!root) return;

  var PAGE = parseInt(root.getAttribute("data-page-size") || "9", 10);
  var TL_PREVIEW = parseInt(root.getAttribute("data-tl-preview") || "12", 10);
  var CATS = ["all", "launch", "update", "feature", "company", "notice"];
  var tabs = root.querySelectorAll("[data-nw-filter]");
  var histTabs = root.querySelectorAll("[data-nw-hist-filter]");
  var productSelect = document.getElementById("nw-product");
  var searchInput = document.getElementById("nw-search");
  var rows = Array.prototype.slice.call(root.querySelectorAll("[data-nw-row]"));
  var tlItems = Array.prototype.slice.call(root.querySelectorAll("[data-nw-tl]"));
  var tlGroups = Array.prototype.slice.call(root.querySelectorAll("[data-nw-tl-group]"));
  var moreBtn = document.getElementById("nw-more");
  var tlMoreBtn = document.getElementById("nw-tl-more");
  var empty = document.getElementById("nw-empty");
  var searchEmpty = document.getElementById("nw-search-empty");
  var tlEmpty = document.getElementById("nw-timeline-empty");
  var list = document.getElementById("nw-list");
  var latestSection = document.getElementById("nw-latest") || root.querySelector("[data-nw-latest]");
  var feed = document.getElementById("nw-feed");
  var featured = root.querySelector("[data-nw-featured]");
  var resetBtn = document.getElementById("nw-empty-reset");
  var viewbar = document.getElementById("nw-viewbar");
  var viewbarTitle = document.getElementById("nw-viewbar-title");
  var viewbarHint = document.getElementById("nw-viewbar-hint");
  var viewbarJump = document.getElementById("nw-viewbar-jump");
  var emptyTitleEl = document.getElementById("nw-empty-title");
  var emptyBodyEl = document.getElementById("nw-empty-body");
  var historySection = document.getElementById("nw-history");
  var currentCat = "all";
  var currentProduct = "all";
  var currentQuery = "";
  var currentHist = "all";
  var shown = PAGE;
  var tlExpanded = false;

  function tpl(str, map) {
    var out = str || "";
    Object.keys(map || {}).forEach(function (k) {
      out = out.split("{" + k + "}").join(String(map[k]));
    });
    return out;
  }

  function activeFilterLabel() {
    var tab = root.querySelector('[data-nw-filter="' + currentCat + '"].is-active') ||
      root.querySelector('[data-nw-filter="' + currentCat + '"]');
    if (tab) return (tab.textContent || "").trim();
    return (viewbar && viewbar.getAttribute("data-label-all")) || "All";
  }

  function emptyCopyForCat(cat) {
    if (!viewbar) return { title: "", body: "" };
    var key = cat || "all";
    var title =
      viewbar.getAttribute("data-empty-" + key + "-title") ||
      viewbar.getAttribute("data-empty-default-title") ||
      "";
    var body =
      viewbar.getAttribute("data-empty-" + key + "-body") ||
      viewbar.getAttribute("data-empty-default-body") ||
      "";
    return { title: title, body: body };
  }

  function updateViewbar(articleCount, tlCount, featuredVisible) {
    if (!viewbar) return;
    var filtering = !!currentQuery || currentCat !== "all" || currentProduct !== "all";
    if (!filtering) {
      viewbar.hidden = true;
      return;
    }
    viewbar.hidden = false;
    var label = activeFilterLabel();
    var productLabel = "";
    if (productSelect && currentProduct !== "all") {
      var opt = productSelect.options[productSelect.selectedIndex];
      productLabel = opt ? (opt.textContent || "").trim() : currentProduct;
    }
    var titleBits = [label];
    if (productLabel) titleBits.push(productLabel);
    if (currentQuery) titleBits.push('“' + currentQuery + '”');
    if (viewbarTitle) viewbarTitle.textContent = titleBits.join(" · ");

    var totalStories = articleCount + (featuredVisible ? 1 : 0);
    var hint = "";
    if (totalStories > 0 && tlCount > 0) {
      hint = tpl(viewbar.getAttribute("data-hint-both") || "", { a: totalStories, h: tlCount });
    } else if (totalStories === 0 && tlCount > 0) {
      hint = tpl(viewbar.getAttribute("data-hint-history") || "", { n: tlCount });
    } else if (totalStories > 0) {
      hint = tpl(viewbar.getAttribute("data-hint-both") || "", { a: totalStories, h: 0 });
    } else {
      hint = viewbar.getAttribute("data-hint-empty") || "";
    }
    if (viewbarHint) viewbarHint.textContent = hint;
    if (viewbarJump) viewbarJump.hidden = tlCount === 0;
  }

  function applyEmptyCopy(cat, hasTimelineOnly) {
    if (!emptyTitleEl && !emptyBodyEl) return;
    var copy = emptyCopyForCat(cat);
    if (hasTimelineOnly && (cat === "launch" || cat === "company")) {
      // Keep category-specific bodies that point to history.
    }
    if (emptyTitleEl && copy.title) emptyTitleEl.textContent = copy.title;
    if (emptyBodyEl && copy.body) emptyBodyEl.textContent = copy.body;
  }

  function paramsState() {
    var cat = "all";
    var product = "all";
    try {
      var q = new URLSearchParams(location.search);
      var c = q.get("category") || q.get("cat");
      if (c && CATS.indexOf(c) !== -1) cat = c;
      var p = q.get("product");
      if (p) product = p;
    } catch (e) {}
    return { cat: cat, product: product };
  }

  function setUrl(replace) {
    try {
      var u = new URL(location.href);
      if (currentCat === "all") {
        u.searchParams.delete("category");
        u.searchParams.delete("cat");
      } else {
        u.searchParams.set("category", currentCat);
        u.searchParams.delete("cat");
      }
      if (currentProduct === "all") u.searchParams.delete("product");
      else u.searchParams.set("product", currentProduct);
      var next = u.pathname + u.search + u.hash;
      if (replace) history.replaceState({}, "", next);
      else history.pushState({}, "", next);
    } catch (e) {}
  }

  function matchEl(el) {
    var catOk = currentCat === "all" || el.getAttribute("data-category") === currentCat;
    var prod = el.getAttribute("data-product") || "";
    var prodOk = currentProduct === "all" || prod === currentProduct;
    var q = currentQuery;
    var searchOk = !q || (el.getAttribute("data-search") || "").indexOf(q) !== -1;
    return catOk && prodOk && searchOk;
  }

  function matchTl(el) {
    if (!matchEl(el)) return false;
    if (currentHist === "all") return true;
    return el.getAttribute("data-hist-type") === currentHist;
  }

  function applyTimelinePreview() {
    var matched = tlItems.filter(function (el) {
      return !el.hidden;
    });
    var limit = tlExpanded ? matched.length : TL_PREVIEW;
    matched.forEach(function (el, i) {
      if (tlExpanded || i < limit) el.removeAttribute("data-tl-hidden");
      else el.setAttribute("data-tl-hidden", "true");
    });
    tlGroups.forEach(function (group) {
      var months = group.querySelectorAll("[data-nw-tl-month]");
      months.forEach(function (month) {
        var visible = month.querySelectorAll("[data-nw-tl]:not([hidden]):not([data-tl-hidden='true'])");
        month.hidden = visible.length === 0;
      });
      var any = group.querySelectorAll("[data-nw-tl]:not([hidden]):not([data-tl-hidden='true'])");
      group.hidden = any.length === 0;
    });
    if (tlMoreBtn) tlMoreBtn.hidden = tlExpanded || matched.length <= TL_PREVIEW;
  }

  function render() {
    var matched = rows.filter(matchEl);
    var visible = 0;
    rows.forEach(function (row) {
      var ok = matchEl(row);
      if (!ok) {
        row.hidden = true;
        return;
      }
      visible += 1;
      row.hidden = visible > shown;
    });

    var hasQuery = !!currentQuery;
    var hasListRows = matched.length > 0;
    var featuredVisible = !!(featured && matchEl(featured));
    var filtering = hasQuery || currentCat !== "all" || currentProduct !== "all";

    // Expand timeline while filtering so category views aren't truncated.
    if (filtering) tlExpanded = true;

    tlItems.forEach(function (el) {
      el.hidden = !matchTl(el);
    });
    var tlMatched = tlItems.filter(function (el) {
      return !el.hidden;
    });
    var tlCount = tlMatched.length;
    var hasTimelineOnly = !hasListRows && !featuredVisible && tlCount > 0;

    // Empty list message only when articles AND timeline are both empty.
    var showSearchEmpty = hasQuery && !hasListRows && !featuredVisible && tlCount === 0;
    var showCatEmpty = filtering && !hasQuery && !hasListRows && !featuredVisible && tlCount === 0;

    if (searchEmpty) searchEmpty.hidden = !showSearchEmpty;
    if (empty) {
      empty.hidden = !showCatEmpty;
      if (showCatEmpty) applyEmptyCopy(currentCat, false);
    }
    if (list) list.hidden = !hasListRows;
    if (moreBtn) moreBtn.hidden = !hasListRows || matched.length <= shown;

    if (featured) {
      featured.hidden = !featuredVisible;
    }

    // Soft note when stories are empty but history has matches.
    if (latestSection) {
      if (!filtering && !hasListRows) {
        latestSection.hidden = true;
        latestSection.classList.remove("nw-latest--note");
      } else if (filtering && hasTimelineOnly) {
        latestSection.hidden = false;
        latestSection.classList.add("nw-latest--note");
        if (empty) {
          empty.hidden = false;
          applyEmptyCopy(currentCat, true);
        }
        if (list) list.hidden = true;
      } else if (filtering && showCatEmpty) {
        latestSection.hidden = false;
        latestSection.classList.add("nw-latest--note");
      } else {
        latestSection.hidden = false;
        latestSection.classList.remove("nw-latest--note");
        if (empty && hasListRows) empty.hidden = true;
      }
    }

    if (tlEmpty) tlEmpty.hidden = tlCount !== 0;
    applyTimelinePreview();
    updateViewbar(matched.length, tlCount, featuredVisible);

    if (historySection) {
      historySection.classList.toggle("nw-history--focus", filtering && tlCount > 0);
    }

    tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-nw-filter") === currentCat;
      tab.classList.toggle("is-active", on);
      if (on) tab.setAttribute("aria-current", "true");
      else tab.removeAttribute("aria-current");
    });

    histTabs.forEach(function (tab) {
      var on = tab.getAttribute("data-nw-hist-filter") === currentHist;
      tab.classList.toggle("is-active", on);
      if (on) tab.setAttribute("aria-current", "true");
      else tab.removeAttribute("aria-current");
    });

    if (productSelect && productSelect.value !== currentProduct) {
      productSelect.value = currentProduct;
    }
  }

  function fadeRender(fn) {
    if (!feed) {
      fn();
      return;
    }
    feed.classList.add("is-fading");
    window.setTimeout(function () {
      fn();
      feed.classList.remove("is-fading");
    }, 120);
  }

  var state = paramsState();
  currentCat = state.cat;
  currentProduct = state.product;
  shown = PAGE;
  render();

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function (e) {
      e.preventDefault();
      var next = tab.getAttribute("data-nw-filter") || "all";
      if (next === currentCat) return;
      fadeRender(function () {
        currentCat = next;
        shown = PAGE;
        tlExpanded = false;
        setUrl(false);
        render();
      });
    });
  });

  histTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var next = tab.getAttribute("data-nw-hist-filter") || "all";
      if (next === currentHist) return;
      currentHist = next;
      tlExpanded = false;
      applyTimelinePreview();
      tlItems.forEach(function (el) {
        el.hidden = !matchTl(el);
      });
      var tlMatched = tlItems.filter(function (el) {
        return !el.hidden;
      });
      if (tlEmpty) tlEmpty.hidden = tlMatched.length !== 0;
      applyTimelinePreview();
      histTabs.forEach(function (t) {
        var on = t.getAttribute("data-nw-hist-filter") === currentHist;
        t.classList.toggle("is-active", on);
        if (on) t.setAttribute("aria-current", "true");
        else t.removeAttribute("aria-current");
      });
    });
  });

  if (productSelect) {
    productSelect.addEventListener("change", function () {
      fadeRender(function () {
        currentProduct = productSelect.value || "all";
        shown = PAGE;
        tlExpanded = false;
        setUrl(false);
        render();
      });
    });
  }

  if (searchInput) {
    var searchTimer = null;
    searchInput.addEventListener("input", function () {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(function () {
        currentQuery = (searchInput.value || "").trim().toLowerCase();
        shown = PAGE;
        render();
      }, 120);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      fadeRender(function () {
        currentCat = "all";
        currentProduct = "all";
        currentQuery = "";
        currentHist = "all";
        if (searchInput) searchInput.value = "";
        shown = PAGE;
        tlExpanded = false;
        setUrl(false);
        render();
      });
    });
  }

  window.addEventListener("popstate", function () {
    fadeRender(function () {
      var s = paramsState();
      currentCat = s.cat;
      currentProduct = s.product;
      shown = PAGE;
      tlExpanded = false;
      render();
    });
  });

  if (moreBtn) {
    moreBtn.addEventListener("click", function () {
      shown += PAGE;
      render();
    });
  }

  if (tlMoreBtn) {
    tlMoreBtn.addEventListener("click", function () {
      tlExpanded = true;
      applyTimelinePreview();
      tlMoreBtn.hidden = true;
    });
  }

  var navLinks = document.querySelectorAll("[data-nw-nav]");
  var sections = [
    { key: "featured", el: document.getElementById("nw-featured") },
    { key: "timeline", el: document.getElementById("nw-history-title") },
  ].filter(function (s) {
    return s.el;
  });

  function setActiveSection(key) {
    navLinks.forEach(function (link) {
      link.classList.toggle("is-section-active", link.getAttribute("data-nw-nav") === key);
    });
  }

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var ratios = {};
    var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h") || "64", 10) + 24;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var key = entry.target.getAttribute("data-nw-section-key");
          if (key) ratios[key] = entry.intersectionRatio;
        });
        var best = null;
        var bestRatio = 0;
        sections.forEach(function (s) {
          var r = ratios[s.key] || 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = s.key;
          }
        });
        if (best) setActiveSection(best);
      },
      { rootMargin: "-" + headerH + "px 0px -55% 0px", threshold: [0, 0.15, 0.35, 0.55] }
    );
    sections.forEach(function (s) {
      s.el.setAttribute("data-nw-section-key", s.key);
      io.observe(s.el);
    });
  }
})();
