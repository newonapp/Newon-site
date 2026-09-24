(function () {
  var KEY_RECENT = "livon.exRecent";
  var KEY_SAVED = "livon.exSaved";
  var SUGGEST = [
    "자취 준비", "이사 전문가", "진로 상담", "육아 전문가", "가족 여행",
    "취미 클래스", "경력 전환", "평생교육", "부모님 돌봄", "지역 생활 서비스"
  ];
  var FILTERS = [
    { id: "all", label: "전체" },
    { id: "guide", label: "생활 정보" },
    { id: "expert", label: "전문가" },
    { id: "service", label: "생활 서비스" },
    { id: "program", label: "교육·프로그램" },
    { id: "place", label: "지역·장소" },
    { id: "product", label: "상품" }
  ];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function gnavOffset() {
    return (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h"), 10) || 74) + 8;
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function recentList() {
    var list = readJSON(KEY_RECENT, []);
    return Array.isArray(list) ? list.slice(0, 8) : [];
  }
  function pushRecent(q) {
    var clean = String(q || "").trim();
    if (!clean) return;
    var next = [clean].concat(recentList().filter(function (x) { return x !== clean; })).slice(0, 8);
    writeJSON(KEY_RECENT, next);
    renderRecent();
  }
  function renderRecent() {
    var host = $("[data-lv-ex-recent]");
    if (!host) return;
    var list = recentList();
    if (!list.length) {
      host.hidden = true;
      host.innerHTML = "";
      return;
    }
    host.hidden = false;
    host.innerHTML = "최근 검색 · " + list.map(function (q) {
      return '<button type="button" data-lv-ex-chip="' + q.replace(/"/g, "&quot;") + '">' + q + "</button>";
    }).join(" ");
  }

  function savedList() {
    var list = readJSON(KEY_SAVED, []);
    return Array.isArray(list) ? list : [];
  }
  function toggleSave(item) {
    var list = savedList();
    var key = item.id;
    var exists = list.some(function (x) { return x.id === key; });
    var next = exists ? list.filter(function (x) { return x.id !== key; }) : list.concat([item]).slice(0, 40);
    writeJSON(KEY_SAVED, next);
    try {
      var ml = readJSON("livon.mlInterests", []);
      if (!Array.isArray(ml)) ml = [];
      if (!exists) {
        var label = item.title || item.query || "탐색 저장";
        if (ml.indexOf(label) === -1) writeJSON("livon.mlInterests", ml.concat([label]).slice(0, 40));
      }
    } catch (e) {}
    return !exists;
  }

  function openResults(query, filter) {
    var panel = $("#ex-results");
    var qEl = $("[data-lv-ex-q]");
    var emptyTitle = $("[data-lv-ex-empty-title]");
    var emptyBody = $("[data-lv-ex-empty-body]");
    var input = $("[data-lv-ex-input]");
    var q = String(query || "").trim();
    if (input) input.value = q;
    if (panel) panel.classList.add("is-open");
    if (qEl) qEl.textContent = q ? ("“" + q + "” 검색 결과") : "탐색 결과";
    $$("[data-lv-ex-filter]").forEach(function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-lv-ex-filter") === (filter || "all"));
    });
    if (emptyTitle) emptyTitle.textContent = q ? "아직 연결된 결과가 없습니다" : "검색어를 입력해 주세요";
    if (emptyBody) {
      emptyBody.innerHTML = q
        ? ("“" + q + "”에 대한 전문가·서비스·프로그램 데이터는 아직 연결되어 있지 않습니다. " +
          "카테고리로 관심 분야를 살펴보거나, 관심 항목을 저장해 내 생활에서 모아볼 수 있습니다. " +
          "<br><br>관련 카테고리: 생활 분야 탐색 · 전문가 찾기 · 생활 서비스 · 교육 프로그램")
        : "통합 검색은 생활 정보, 전문가, 서비스, 프로그램, 지역 활동, 상품을 한곳에서 찾도록 설계되어 있습니다. 실제 목록은 데이터 연동 후 표시됩니다.";
    }
    if (q) pushRecent(q);
    scrollToId("ex-results");
    location.hash = "ex-results";
  }

  function closeResults() {
    var panel = $("#ex-results");
    if (panel) panel.classList.remove("is-open");
  }

  function bindSearch() {
    var form = $("[data-lv-ex-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = $("[data-lv-ex-input]");
        openResults(input ? input.value : "", "all");
      });
    }
    document.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-lv-ex-chip]");
      if (chip) {
        e.preventDefault();
        openResults(chip.getAttribute("data-lv-ex-chip") || chip.textContent, "all");
        return;
      }
      var cat = e.target.closest("[data-lv-ex-cat]");
      if (cat) {
        e.preventDefault();
        openResults(cat.getAttribute("data-lv-ex-cat"), cat.getAttribute("data-lv-ex-type") || "all");
        return;
      }
      var filter = e.target.closest("[data-lv-ex-filter]");
      if (filter) {
        e.preventDefault();
        var input = $("[data-lv-ex-input]");
        openResults(input ? input.value : "", filter.getAttribute("data-lv-ex-filter") || "all");
        return;
      }
      var save = e.target.closest("[data-lv-ex-save]");
      if (save) {
        e.preventDefault();
        var title = save.getAttribute("data-lv-ex-save") || "탐색 관심";
        var on = toggleSave({ id: "save:" + title, title: title, at: Date.now() });
        save.textContent = on ? "저장됨" : "관심 저장";
        return;
      }
      var close = e.target.closest("[data-lv-ex-close-results]");
      if (close) {
        e.preventDefault();
        closeResults();
        scrollToId("ex-hero");
      }
    });
  }

  function bindNavHighlight() {
    var links = $$(".lv-ex-nav__track a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = (a.getAttribute("href") || "").replace("#", "");
      if (id) map[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (a) { a.classList.remove("is-on"); });
        if (map[id]) map[id].classList.add("is-on");
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  function bindReveal() {
    var nodes = $$("[data-lv-ex-reveal]");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    nodes.forEach(function (el) { io.observe(el); });
  }

  function bindFilmHero() {
    var hero = $("#ex-hero");
    if (!hero) return;
    var reveal = function () { hero.classList.add("is-ready"); };
    var video = hero.querySelector("video");
    if (video) {
      if (video.readyState >= 2) reveal();
      else video.addEventListener("loadeddata", reveal, { once: true });
      setTimeout(reveal, 600);
    } else {
      reveal();
    }
  }

  function onShow(hash) {
    renderRecent();
    if (!hash || hash === "explore" || hash === "ex-hero") {
      window.scrollTo(0, 0);
      return;
    }
    if (hash === "ex-results") {
      var panel = $("#ex-results");
      if (panel && !panel.classList.contains("is-open")) {
        panel.classList.add("is-open");
      }
      setTimeout(function () { scrollToId("ex-results"); }, 40);
      return;
    }
    if (hash.indexOf("ex-") === 0) {
      setTimeout(function () { scrollToId(hash); }, 40);
    }
  }

  function init() {
    var root = $("#explore");
    if (!root) return;
    var chipHost = $("[data-lv-ex-suggest]");
    if (chipHost && !chipHost.children.length) {
      chipHost.innerHTML = SUGGEST.map(function (q) {
        return '<li><button type="button" data-lv-ex-chip="' + q + '">' + q + "</button></li>";
      }).join("");
    }
    var filterHost = $("[data-lv-ex-filters]");
    if (filterHost && !filterHost.children.length) {
      filterHost.innerHTML = FILTERS.map(function (f, i) {
        return '<button type="button" data-lv-ex-filter="' + f.id + '"' + (i === 0 ? ' class="is-on"' : "") + ">" + f.label + "</button>";
      }).join("");
    }
    bindSearch();
    bindNavHighlight();
    bindReveal();
    bindFilmHero();
    renderRecent();
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "explore") onShow(hash || "explore");
  }

  window.LivonExplore = {
    onShow: onShow,
    openResults: openResults
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
