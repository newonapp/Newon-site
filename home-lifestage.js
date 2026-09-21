(function () {
  var root = document.getElementById("lifestage-detail") || document.getElementById("story-lifestage");
  if (!root) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function syncEmpty(group) {
    var empty = root.querySelector('[data-nls-empty="' + group + '"]');
    if (!empty) return;
    var any = root.querySelector('[data-nls-panel][data-nls-group="' + group + '"]:not([hidden])');
    if (group === "sit") {
      var catOn = root.querySelector('[data-nls-filter="sitcat"].is-active');
      empty.hidden = !!any || !catOn;
      return;
    }
    empty.hidden = !!any;
  }

  function catOf(group, key) {
    var tab = root.querySelector('[data-nls-tab][data-nls-group="' + group + '"][data-nls-key="' + key + '"]');
    return tab ? tab.getAttribute("data-nls-cat") || "" : "";
  }

  function openFirst(key, scrollSection) {
    var tab = root.querySelector('[data-nls-tab][data-nls-group="first"][data-nls-key="' + key + '"]');
    if (!tab) return;
    var cat = tab.getAttribute("data-nls-cat");
    if (cat) applyFilter("firstg", cat);
    tab.hidden = false;
    activate("first", key);
    if (scrollSection) {
      var box = document.getElementById("nls-first");
      if (box) box.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  function jumpTo(spec, fromFirst) {
    var parts = (spec || "").split(":");
    var kind = parts[0];
    var key = parts.slice(1).join(":");
    if (!kind || !key) return;
    if (kind === "first") {
      openFirst(key, !fromFirst);
      return;
    }
    if (kind === "plan" || kind === "ai") {
      activate(kind, key);
      var core = document.getElementById("nls-core");
      if (core) core.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      return;
    }
    if (kind === "sit") {
      var scat = catOf("sit", key);
      if (scat) applyFilter("sitcat", scat);
      activate("sit", key);
      var sits = document.getElementById("nls-sits");
      if (sits) sits.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      return;
    }
    if (kind === "know") {
      var kcat = catOf("know", key);
      if (kcat) applyFilter("knowg", kcat);
      activate("know", key);
      var kn = document.getElementById("nls-knowledge");
      if (kn) kn.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      return;
    }
    if (kind === "learn") {
      activate("learn", key);
      var ln = document.getElementById("nls-learn");
      if (ln) ln.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  function hay(el) {
    return fold((el.getAttribute("data-nls-keys") || "") + " " + (el.textContent || ""));
  }

  function fold(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/했어요|해요|하는|하고|입니다|인가요|할까요|주세요|았어요|어요|예요/g, " ")
      .replace(/[“”"'.,!?]/g, " ")
      .replace(/[을를이가은는의와과도만요]\s/g, " ")
      .replace(/[을를이가은는의와과도만요]$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchesQuery(el, q) {
    var h = hay(el);
    var nq = fold(q);
    if (!nq) return false;
    if (h.indexOf(nq) !== -1) return true;
    var stop = {
      지금: 1, 어떤: 1, 처음: 1, 겪고: 1, 있나요: 1, 받았: 1, 해요: 1, 하고: 1,
      있어요: 1, 앞두고: 1, 준비하고: 1, 찾고: 1, 준비: 1, 하는: 1, 합니다: 1,
      just: 1, got: 1, a: 1, the: 1, my: 1, i: 1, im: 1, "i'm": 1, first: 1, for: 1
    };
    var toks = nq.split(" ").filter(function (t) {
      return t.length >= 2 && !stop[t];
    });
    if (!toks.length) {
      toks = nq.split(" ").filter(function (t) {
        return t.length >= 2;
      });
    }
    if (!toks.length) return false;
    return toks.every(function (t) {
      return h.indexOf(t) !== -1;
    });
  }

  function showFeatured() {
    root.querySelectorAll('[data-nls-filter="firstg"]').forEach(function (el) {
      el.classList.remove("is-active");
      el.setAttribute("aria-pressed", "false");
    });
    var featBtn = root.querySelector("[data-nls-first-featured]");
    if (featBtn) {
      featBtn.classList.add("is-active");
      featBtn.setAttribute("aria-pressed", "true");
    }
    var inp = root.querySelector('[data-nls-search="first"]');
    if (inp) inp.value = "";
    var out = root.querySelector("[data-nls-search-out]");
    if (out) {
      out.hidden = true;
      out.innerHTML = "";
    }
    var miss = root.querySelector("[data-nls-search-empty]");
    if (miss) miss.hidden = true;
    root.querySelectorAll('[data-nls-filter-item="firstg"]').forEach(function (el) {
      el.hidden = el.getAttribute("data-nls-featured") !== "1";
      el.classList.remove("is-active");
      if (el.getAttribute("role") === "tab") {
        el.setAttribute("aria-selected", "false");
        el.tabIndex = -1;
      }
    });
    root.querySelectorAll('[data-nls-panel][data-nls-group="first"]').forEach(function (el) {
      el.hidden = true;
      el.classList.remove("is-active");
    });
    syncEmpty("first");
  }

  function runFirstSearch() {
    var input = root.querySelector('[data-nls-search="first"]');
    var q = fold((input && input.value) || "");
    var items = root.querySelectorAll('[data-nls-filter-item="firstg"]');
    var out = root.querySelector("[data-nls-search-out]");
    var miss = root.querySelector("[data-nls-search-empty]");
    var groupOn = root.querySelector('[data-nls-filter="firstg"].is-active');
    if (!q) {
      if (out) {
        out.hidden = true;
        out.innerHTML = "";
      }
      if (miss) miss.hidden = true;
      if (groupOn) {
        items.forEach(function (el) {
          el.hidden = el.getAttribute("data-nls-cat") !== groupOn.getAttribute("data-nls-key");
        });
      } else {
        items.forEach(function (el) {
          el.hidden = el.getAttribute("data-nls-featured") !== "1";
        });
      }
      return;
    }
    root.querySelectorAll('[data-nls-filter="firstg"]').forEach(function (el) {
      el.classList.remove("is-active");
      el.setAttribute("aria-pressed", "false");
    });
    var featBtn = root.querySelector("[data-nls-first-featured]");
    if (featBtn) {
      featBtn.classList.remove("is-active");
      featBtn.setAttribute("aria-pressed", "false");
    }
    var hits = [];
    items.forEach(function (el) {
      var on = matchesQuery(el, q);
      el.hidden = !on;
      if (on) hits.push(el);
    });
    if (out) {
      out.hidden = hits.length === 0;
      out.innerHTML = hits
        .map(function (el) {
          var id = el.getAttribute("data-nls-key") || "";
          var nameEl = el.querySelector("strong");
          var name = nameEl ? nameEl.textContent : el.textContent;
          return '<li><button type="button" class="nls-first-hit" data-nls-jump="first:' + id + '">' + name + "</button></li>";
        })
        .join("");
    }
    if (miss) miss.hidden = hits.length > 0;
  }

  function updateHeroNow(key) {
    var now = root.querySelector("[data-nls-now]");
    if (!now) return;
    var title = now.querySelector("[data-nls-now-title]");
    var age = now.querySelector("[data-nls-now-age]");
    var node = key ? root.querySelector('.nls-node[data-nls-key="' + key + '"]') : null;
    if (!node) {
      now.classList.remove("is-on");
      if (title) title.textContent = now.getAttribute("data-default-title") || "";
      if (age) age.textContent = now.getAttribute("data-default-age") || "";
      return;
    }
    now.classList.add("is-on");
    if (title) title.textContent = node.getAttribute("data-name") || "";
    if (age) age.textContent = node.getAttribute("data-age") || "";
  }

  function activate(group, key) {
    root.querySelectorAll('[data-nls-group="' + group + '"]').forEach(function (el) {
      var on = el.getAttribute("data-nls-key") === key;
      if (el.hasAttribute("data-nls-tab")) {
        el.classList.toggle("is-active", on);
        if (el.getAttribute("role") === "tab") {
          el.setAttribute("aria-selected", on ? "true" : "false");
          el.tabIndex = on ? 0 : -1;
        } else {
          el.setAttribute("aria-pressed", on ? "true" : "false");
        }
      }
      if (el.hasAttribute("data-nls-panel")) {
        el.hidden = !on;
        el.classList.toggle("is-active", on);
      }
    });
    syncEmpty(group);
    if (group === "age") updateHeroNow(key);
    if (group === "plan") updateProgress();
    if (group === "first") {
      var panel = root.querySelector('[data-nls-panel][data-nls-group="first"][data-nls-key="' + key + '"]');
      if (panel) panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    }
  }

  function applyFilter(kind, key) {
    if (kind === "firstg") {
      var inp = root.querySelector('[data-nls-search="first"]');
      if (inp) inp.value = "";
      var out = root.querySelector("[data-nls-search-out]");
      if (out) {
        out.hidden = true;
        out.innerHTML = "";
      }
      var miss = root.querySelector("[data-nls-search-empty]");
      if (miss) miss.hidden = true;
      var featBtn = root.querySelector("[data-nls-first-featured]");
      if (featBtn) {
        featBtn.classList.remove("is-active");
        featBtn.setAttribute("aria-pressed", "false");
      }
    }
    root.querySelectorAll('[data-nls-filter="' + kind + '"]').forEach(function (el) {
      var on = el.getAttribute("data-nls-key") === key;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });
    root.querySelectorAll('[data-nls-filter-item="' + kind + '"]').forEach(function (el) {
      el.hidden = el.getAttribute("data-nls-cat") !== key;
    });
    var panelGroup = kind === "sitcat" ? "sit" : kind === "knowg" ? "know" : kind === "firstg" ? "first" : "";
    if (panelGroup) {
      root.querySelectorAll('[data-nls-panel][data-nls-group="' + panelGroup + '"]').forEach(function (el) {
        el.hidden = true;
        el.classList.remove("is-active");
      });
      root.querySelectorAll('[data-nls-tab][data-nls-group="' + panelGroup + '"]').forEach(function (el) {
        el.classList.remove("is-active");
        if (el.getAttribute("role") === "tab") {
          el.setAttribute("aria-selected", "false");
          el.tabIndex = -1;
        } else {
          el.setAttribute("aria-pressed", "false");
        }
      });
      syncEmpty(panelGroup);
    }
    var hint = root.querySelector('[data-nls-empty="' + kind + '"]');
    if (hint) hint.hidden = true;
  }

  function moveTab(current, dir) {
    var group = current.getAttribute("data-nls-group");
    var tabs = Array.prototype.slice.call(
      root.querySelectorAll('[data-nls-tab][data-nls-group="' + group + '"][role="tab"]:not([hidden])')
    );
    if (!tabs.length) return;
    var i = tabs.indexOf(current);
    var next = tabs[(i + dir + tabs.length) % tabs.length];
    next.focus();
    activate(group, next.getAttribute("data-nls-key"));
  }

  root.addEventListener("click", function (e) {
    var jump = e.target.closest("[data-nls-jump]");
    if (jump && root.contains(jump)) {
      e.preventDefault();
      jumpTo(jump.getAttribute("data-nls-jump"), !!jump.closest("#nls-first"));
      return;
    }

    var ex = e.target.closest("[data-nls-search-ex]");
    if (ex && root.contains(ex)) {
      var box = root.querySelector('[data-nls-search="first"]');
      if (box) {
        box.value = ex.getAttribute("data-nls-search-ex") || ex.textContent || "";
        runFirstSearch();
        box.focus();
      }
      return;
    }

    var feat = e.target.closest("[data-nls-first-featured]");
    if (feat && root.contains(feat)) {
      showFeatured();
      return;
    }

    var filter = e.target.closest("[data-nls-filter]");
    if (filter && root.contains(filter)) {
      applyFilter(filter.getAttribute("data-nls-filter"), filter.getAttribute("data-nls-key"));
      return;
    }

    var tab = e.target.closest("[data-nls-tab]");
    if (tab && root.contains(tab)) {
      activate(tab.getAttribute("data-nls-group"), tab.getAttribute("data-nls-key"));
      return;
    }

    var learn = e.target.closest("[data-nls-learn]");
    if (learn && root.contains(learn)) {
      var step = learn.closest(".nls-learn__step");
      var list = learn.closest(".nls-learn__list");
      if (step && list) {
        list.querySelectorAll(".nls-learn__step").forEach(function (s) {
          var open = s === step ? !s.classList.contains("is-open") : false;
          s.classList.toggle("is-open", open);
          var btn = s.querySelector("[data-nls-learn]");
          if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
        });
        if (!list.querySelector(".nls-learn__step.is-open")) {
          step.classList.add("is-open");
          learn.setAttribute("aria-expanded", "true");
        }
      }
      return;
    }

    var scroll = e.target.closest("[data-nls-scroll]");
    if (scroll && root.contains(scroll)) {
      var href = scroll.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", href);
    }
  });

  root.addEventListener("keydown", function (e) {
    var tab = e.target.closest("[data-nls-tab]");
    if (!tab || !root.contains(tab) || tab.getAttribute("role") !== "tab") return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      moveTab(tab, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      moveTab(tab, -1);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      var group = tab.getAttribute("data-nls-group");
      var tabs = Array.prototype.slice.call(
        root.querySelectorAll('[data-nls-tab][data-nls-group="' + group + '"][role="tab"]:not([hidden])')
      );
      var pick = e.key === "Home" ? tabs[0] : tabs[tabs.length - 1];
      if (pick) {
        pick.focus();
        activate(group, pick.getAttribute("data-nls-key"));
      }
    }
  });

  function updateProgress() {
    var pane = root.querySelector('[data-nls-group="plan"][data-nls-panel]:not([hidden])') || root;
    var boxes = pane.querySelectorAll("[data-nls-check]");
    if (!boxes.length) return;
    var done = 0;
    boxes.forEach(function (box) {
      if (box.checked) done += 1;
    });
    var total = boxes.length;
    var label = pane.querySelector("[data-nls-progress] strong");
    if (label) label.textContent = done + " / " + total;
    var bar = pane.querySelector("[data-nls-bar]");
    if (bar) bar.style.width = Math.round((done / total) * 100) + "%";
  }

  root.addEventListener("change", function (e) {
    if (e.target && e.target.hasAttribute("data-nls-check")) updateProgress();
  });
  updateProgress();
  ["age", "sit", "know", "venture", "first"].forEach(syncEmpty);
  updateHeroNow("");
  showFeatured();

  var search = root.querySelector('[data-nls-search="first"]');
  if (search) {
    search.addEventListener("input", runFirstSearch);
    search.addEventListener("search", runFirstSearch);
  }

  function goHash() {
    var id = (location.hash || "").replace(/^#/, "");
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    if (id === "story-lifestage" || root.contains(el)) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }
  if (document.readyState === "complete") goHash();
  else window.addEventListener("load", goHash);
})();
