(function () {
  var KEY_SAVED = "livon.tdSaved";
  var KEY_PREFS = "livon.tdPrefs";
  var KEY_HIDDEN = "livon.tdHidden";
  var KEY_AIQ = "livon.aiPrompt";
  var DATA = window.LivonTodayData || { contents: [], interests: [], regions: [], budgets: [], companions: [], activityTypes: [], placePrefs: [], modePrefs: [], statusLabel: {} };

  var state = {
    tab: "interest",
    weekFilter: "all",
    libCat: "all",
    libQuery: "",
    detailId: null
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function readJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function gnavOffset() {
    return (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h"), 10) || 74) + 52;
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function contents() { return DATA.contents || []; }
  function byId(id) { return contents().find(function (c) { return c.id === id; }) || null; }
  function statusLabel(k) { return (DATA.statusLabel && DATA.statusLabel[k]) || k || "안내"; }
  var IMG_FALLBACK = "/livon/assets/topics/daytrip.jpg";
  function imgHtml(src, alt) {
    var url = src || IMG_FALLBACK;
    return '<img src="' + esc(url) + '" alt="' + esc(alt || "") + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + IMG_FALLBACK + '\'" />';
  }
  function seasonKey(d) {
    d = d || new Date();
    var m = d.getMonth() + 1;
    if (m >= 3 && m <= 5) return "spring";
    if (m >= 6 && m <= 8) return "summer";
    if (m >= 9 && m <= 11) return "autumn";
    return "winter";
  }
  function seasonName(k) {
    return { spring: "봄", summer: "여름", autumn: "가을", winter: "겨울" }[k] || k;
  }

  function defaultPrefs() {
    return { interests: [], regions: [], budgets: [], companions: [], types: [], place: [], mode: [] };
  }
  function prefs() {
    var p = readJSON(KEY_PREFS, null);
    if (!p || typeof p !== "object") p = defaultPrefs();
    ["interests", "regions", "budgets", "companions", "types", "place", "mode"].forEach(function (k) {
      if (!Array.isArray(p[k])) p[k] = [];
    });
    // Import life-stage interests once if empty
    if (!p.interests.length) {
      try {
        var life = readJSON("livon.lifeInterests", []);
        if (Array.isArray(life) && life.length) p.interests = life.slice(0, 8);
      } catch (e) {}
    }
    return p;
  }
  function savePrefs(p) { writeJSON(KEY_PREFS, p); }

  function saved() {
    var list = readJSON(KEY_SAVED, []);
    return Array.isArray(list) ? list : [];
  }
  function isSaved(id) { return saved().some(function (x) { return x.id === id; }); }
  function toggleSave(id, label) {
    var list = saved();
    var exists = list.some(function (x) { return x.id === id; });
    var next = exists
      ? list.filter(function (x) { return x.id !== id; })
      : list.concat([{ id: id, label: label, at: Date.now() }]).slice(0, 60);
    writeJSON(KEY_SAVED, next);
    try {
      var ml = readJSON("livon.mlInterests", []);
      if (!Array.isArray(ml)) ml = [];
      if (!exists && label && ml.indexOf(label) === -1) writeJSON("livon.mlInterests", ml.concat([label]).slice(0, 40));
    } catch (e) {}
    return !exists;
  }
  function hidden() {
    var list = readJSON(KEY_HIDDEN, []);
    return Array.isArray(list) ? list : [];
  }
  function hideItem(id) {
    var list = hidden();
    if (list.indexOf(id) === -1) writeJSON(KEY_HIDDEN, list.concat([id]).slice(0, 80));
  }

  function isActiveEvent(c) {
    if (c.type !== "event") return true;
    if (!c.endDate) return true; // evergreen guides
    return new Date(c.endDate + "T23:59:59") >= new Date();
  }

  function visibleContents() {
    var hid = hidden();
    return contents().filter(function (c) {
      return hid.indexOf(c.id) === -1 && isActiveEvent(c);
    });
  }

  function inSection(c, key) {
    return (c.sections || []).indexOf(key) >= 0;
  }


  function lifeBoost(c, score, reasons) {
    var stage = "";
    try { stage = JSON.parse(localStorage.getItem("livon.lifeStage") || "\"\""); } catch (e) { stage = ""; }
    var interests = [];
    try { interests = JSON.parse(localStorage.getItem("livon.lifeInterests") || "[]"); } catch (e) { interests = []; }
    if (!Array.isArray(interests)) interests = [];
    var events = [];
    try { events = JSON.parse(localStorage.getItem("livon.lifeEvents") || "[]"); } catch (e) { events = []; }
    if (!Array.isArray(events)) events = [];
    var catalog = (window.LivonLifeEvents && window.LivonLifeEvents.events) || [];
    var blob = [c.title, c.blurb, c.category].concat(c.tags || []).join(" ").toLowerCase();
    interests.forEach(function (it) {
      if (blob.indexOf(String(it).toLowerCase()) >= 0) { score += 2; reasons.push("Life Stage 관심: " + it); }
    });
    events.forEach(function (id) {
      var ev = catalog.find(function (e) { return e.id === id; });
      if (!ev) return;
      if (blob.indexOf(String(ev.title).toLowerCase()) >= 0) { score += 2; reasons.push("Life Event: " + ev.title); }
      (ev.needs || []).forEach(function (n) {
        if (blob.indexOf(String(n).toLowerCase().slice(0, 2)) >= 0) score += 1;
      });
    });
    return { score: score, reasons: reasons };
  }

  function scoreItem(c, p) {
    var score = 0;
    var reasons = [];
    var blob = [c.title, c.blurb, c.category].concat(c.tags || []).join(" ").toLowerCase();
    (p.interests || []).forEach(function (it) {
      if (blob.indexOf(String(it).toLowerCase()) >= 0) { score += 3; reasons.push("관심: " + it); }
    });
    (p.regions || []).forEach(function (r) {
      if ((c.region || "") === r || r === "전국" || r === "온라인") { score += 2; reasons.push("지역: " + r); }
    });
    (p.budgets || []).forEach(function (b) {
      if ((c.budget || "") === b) { score += 2; reasons.push("예산: " + b); }
    });
    (p.companions || []).forEach(function (co) {
      if ((c.companion || []).indexOf(co) >= 0) { score += 2; reasons.push("동행: " + co); }
    });
    (p.types || []).forEach(function (t) {
      if (blob.indexOf(String(t).toLowerCase()) >= 0) { score += 1; reasons.push("유형: " + t); }
    });
    (p.place || []).forEach(function (pl) {
      if (pl === "상관없음" || (c.indoorOutdoor || "") === pl) { score += 1; }
    });
    (p.mode || []).forEach(function (m) {
      if (m === "상관없음" || (c.onlineOffline || "") === m) { score += 1; }
    });
    if (c.featured) score += 1;
    if (c.evergreen) score += 0.5;
    var boosted = lifeBoost(c, score, reasons);
    return { score: boosted.score, reasons: boosted.reasons.slice(0, 2) };
  }

  function daySeed() {
    var d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }
  function pickHero(list) {
    var featured = list.filter(function (c) { return c.featured; });
    var pool = featured.length ? featured : list.filter(function (c) { return c.evergreen; });
    if (!pool.length) pool = list.slice();
    var seed = daySeed();
    var sorted = pool.slice().sort(function (a, b) {
      return ((a.id.charCodeAt(0) * seed) % 97) - ((b.id.charCodeAt(0) * seed) % 97);
    });
    return sorted.slice(0, 3);
  }

  function linkActs(c) {
    var links = c.links || {};
    var html = "";
    if (links.explore) html += '<a class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" href="' + esc(links.explore) + '">탐색</a>';
    if (links.lifeNow) html += '<a class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" href="' + esc(links.lifeNow) + '">내 생활</a>';
    if (links.community) html += '<a class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" href="' + esc(links.community) + '">커뮤니티</a>';
    if (links.life) html += '<a class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" href="' + esc(links.life) + '">라이프 스테이지</a>';
    if (links.ongil) html += '<a class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" href="' + esc(links.ongil) + '">Ongil</a>';
    if (links.ai) html += '<a class="lv-td-btn lv-td-btn--sm" href="#livon-ai" data-lv-td-aiq="' + esc(links.ai) + '">LIVON AI</a>';
    if (c.officialUrl) html += '<a class="lv-td-btn lv-td-btn--sm" href="' + esc(c.officialUrl) + '" target="_blank" rel="noopener noreferrer">공식 페이지</a>';
    return html;
  }

  function card(c, variant, opts) {
    opts = opts || {};
    variant = variant || "grid";
    var savedOn = isSaved(c.id);
    var meta = [];
    if (c.category) meta.push(c.category);
    if (c.region) meta.push(c.region);
    if (c.duration) meta.push(c.duration);
    if (c.difficulty) meta.push(c.difficulty);
    if (c.budget) meta.push(c.budget);
    if (variant === "feature") {
      return (
        '<article class="lv-td-feature is-cover" data-lv-td-open="' + esc(c.id) + '">' +
          '<div class="lv-td-feature__media">' + imgHtml(c.img, c.alt) + "</div>" +
          '<div class="lv-td-feature__body">' +
            '<span class="lv-td-badge">' + esc(statusLabel(c.status)) + (c.featured ? " · 대표" : "") + "</span>" +
            '<p class="lv-td-eyebrow">' + esc(c.category || "") + "</p>" +
            "<h3>" + esc(c.title) + "</h3>" +
            "<p>" + esc(c.blurb) + "</p>" +
            (c.reason ? '<p class="lv-td-note">추천 이유 · ' + esc(c.reason) + "</p>" : "") +
            '<div class="lv-td-actions">' +
              '<button type="button" class="lv-td-btn" data-lv-td-open="' + esc(c.id) + '">상세 보기</button>' +
              '<button type="button" class="lv-td-btn lv-td-btn--ghost' + (savedOn ? " is-on" : "") + '" data-lv-td-save="' + esc(c.id) + '" data-lv-td-label="' + esc(c.title) + '">' + (savedOn ? "저장됨" : "관심 저장") + "</button>" +
              '<button type="button" class="lv-td-btn lv-td-btn--ghost" data-lv-td-share="' + esc(c.id) + '">공유</button>' +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }
    if (variant === "rail") {
      return (
        '<button type="button" class="lv-td-rail-card" data-lv-td-open="' + esc(c.id) + '">' +
          '<span class="lv-td-rail-card__media">' + imgHtml(c.img, "") + "</span>" +
          '<span class="lv-td-rail-card__body">' +
            '<em>' + esc(c.category || "") + "</em>" +
            "<strong>" + esc(c.title) + "</strong>" +
            "<span>" + esc(c.blurb) + "</span>" +
          "</span>" +
        "</button>"
      );
    }
    if (variant === "editorial") {
      return (
        '<article class="lv-td-story" data-lv-td-open="' + esc(c.id) + '">' +
          '<div class="lv-td-story__media">' + imgHtml(c.img, c.alt) + "</div>" +
          '<div class="lv-td-story__body">' +
            '<em>' + esc(c.category || "Editorial") + "</em>" +
            "<h3>" + esc(c.title) + "</h3>" +
            "<p>" + esc(c.blurb) + "</p>" +
            '<span class="lv-td-story__go">읽어보기 →</span>' +
          "</div>" +
        "</article>"
      );
    }
    if (variant === "event") {
      return (
        '<article class="lv-td-event" data-lv-td-open="' + esc(c.id) + '">' +
          '<div class="lv-td-event__media">' + imgHtml(c.img, c.alt) + "</div>" +
          '<div class="lv-td-event__body">' +
            '<p class="lv-td-eyebrow">' + esc(c.category || "행사") + "</p>" +
            "<h3>" + esc(c.title) + "</h3>" +
            "<p>" + esc(c.blurb) + "</p>" +
            '<p class="lv-td-note">' + esc(statusLabel(c.status)) + (c.source ? " · " + esc(c.source) : "") + (c.checkedAt || DATA.checkedAt ? " · 확인 " + esc(c.checkedAt || DATA.checkedAt) : "") + "</p>" +
            '<div class="lv-td-actions">' +
              '<button type="button" class="lv-td-btn lv-td-btn--sm" data-lv-td-open="' + esc(c.id) + '">자세히</button>' +
              '<button type="button" class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" data-lv-td-save="' + esc(c.id) + '" data-lv-td-label="' + esc(c.title) + '">' + (savedOn ? "저장됨" : "저장") + "</button>" +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }
    return (
      '<article class="lv-td-card" data-lv-td-open="' + esc(c.id) + '">' +
        '<div class="lv-td-card__media">' + imgHtml(c.img, c.alt) + "</div>" +
        '<div class="lv-td-card__body">' +
          '<p class="lv-td-card__meta">' + esc(meta.join(" · ")) + "</p>" +
          "<h3>" + esc(c.title) + "</h3>" +
          "<p>" + esc(c.blurb) + "</p>" +
          (opts.why ? '<p class="lv-td-card__why">' + esc(opts.why) + "</p>" : "") +
          '<div class="lv-td-actions">' +
            '<button type="button" class="lv-td-btn lv-td-btn--sm" data-lv-td-open="' + esc(c.id) + '">상세</button>' +
            '<button type="button" class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm' + (savedOn ? " is-on" : "") + '" data-lv-td-save="' + esc(c.id) + '" data-lv-td-label="' + esc(c.title) + '">' + (savedOn ? "저장됨" : "저장") + "</button>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function emptyHtml(msg) {
    return '<div class="lv-td-empty"><span class="lv-td-badge">안내</span><p>' + esc(msg) + "</p></div>";
  }

  function renderHero() {
    var host = $("[data-lv-td-hero-picks]");
    if (!host) return;
    var picks = pickHero(visibleContents());
    if (!picks.length) {
      host.innerHTML = emptyHtml("오늘 표시할 대표 콘텐츠가 없습니다. 상시 추천이 등록되면 이곳에 나타납니다.");
      return;
    }
    host.innerHTML = '<div class="lv-td-hero-picks">' + picks.map(function (c, i) {
      return card(c, i === 0 ? "feature" : "grid");
    }).join("") + "</div>";
  }

  function setupOptions(tab) {
    if (tab === "interest") return DATA.interests || [];
    if (tab === "region") return DATA.regions || [];
    if (tab === "budget") return DATA.budgets || [];
    if (tab === "companion") return DATA.companions || [];
    if (tab === "type") return DATA.activityTypes || [];
    if (tab === "place") return DATA.placePrefs || [];
    if (tab === "mode") return DATA.modePrefs || [];
    return [];
  }
  function setupKey(tab) {
    return { interest: "interests", region: "regions", budget: "budgets", companion: "companions", type: "types", place: "place", mode: "mode" }[tab];
  }

  function renderSetup() {
    var panel = $("[data-lv-td-setup-panel]");
    if (!panel) return;
    var p = prefs();
    var key = setupKey(state.tab);
    var selected = p[key] || [];
    panel.innerHTML = '<div class="lv-td-chips" role="group">' +
      setupOptions(state.tab).map(function (v) {
        return '<button type="button" data-lv-td-pref="' + esc(key) + '" data-val="' + esc(v) + '"' + (selected.indexOf(v) >= 0 ? ' class="is-on"' : "") + ">" + esc(v) + "</button>";
      }).join("") +
    '</div><p class="lv-td-note">복수 선택 · 기기 저장 · 불필요한 개인정보는 요구하지 않습니다. 라이프 스테이지 관심사가 있으면 초기값으로 불러올 수 있습니다.</p>';
  }

  function renderPriority() {
    var host = $("[data-lv-td-priority]");
    var why = $("[data-lv-td-why]");
    if (!host) return;
    var p = prefs();
    var scored = visibleContents().map(function (c) {
      var r = scoreItem(c, p);
      return { c: c, score: r.score, reasons: r.reasons };
    }).filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 6);
    if (!scored.length) {
      var fallback = visibleContents().filter(function (c) { return c.featured || c.evergreen; }).slice(0, 6);
      if (!fallback.length) {
        host.innerHTML = emptyHtml("맞춤 조건을 선택하면 관련 발견이 여기에 표시됩니다. 아래 카테고리에서도 자유롭게 살펴볼 수 있습니다.");
        if (why) why.textContent = "맞춤 조건을 선택하면 추천 이유가 표시됩니다.";
        return;
      }
      if (why) why.textContent = "아직 맞춤 조건이 없어 대표·상시 발견을 보여 드립니다.";
      host.innerHTML = '<div class="lv-td-grid">' + fallback.map(function (c) {
        return card(c, "grid", { why: "상시 · " + (c.category || "발견") });
      }).join("") + "</div>";
      return;
    }
    if (why) {
      var bits = [].concat(p.interests, p.budgets, p.companions).filter(Boolean).slice(0, 4);
      why.textContent = "우선 기준: " + (bits.join(" · ") || "선택값") + " (규칙 기반)";
    }
    host.innerHTML = '<div class="lv-td-grid">' + scored.map(function (x) {
      return card(x.c, "grid", {
        why: x.reasons.length ? ("이유 · " + x.reasons.join(" · ")) : ""
      });
    }).join("") + "</div>";
  }

  function renderWeek() {
    var host = $("[data-lv-td-week]");
    if (!host) return;
    var list = visibleContents().filter(function (c) { return inSection(c, "week") || c.type === "event"; });
    if (state.weekFilter === "free") list = list.filter(function (c) { return c.budget === "무료" || c.free === true; });
    // today/weekend without fake dated events: keep evergreen week guides
    if (state.weekFilter === "today" || state.weekFilter === "weekend") {
      list = list.filter(function (c) { return c.evergreen || c.type === "event"; });
    }
    if (!list.length) {
      list = visibleContents().filter(function (c) { return c.evergreen && (inSection(c, "week") || c.type === "place" || c.type === "experience"); }).slice(0, 6);
    }
    if (!list.length) {
      host.innerHTML = emptyHtml("이번 주 표시할 확인된 행사가 없습니다. 공식 문화 캘린더 가이드를 확인해 보세요.");
      return;
    }
    host.innerHTML = '<div class="lv-td-event-grid">' + list.slice(0, 6).map(function (c) { return card(c, "event"); }).join("") + "</div>";
  }

  function renderSection(sel, sectionKey, variant, limit) {
    var host = $(sel);
    if (!host) return;
    var list = visibleContents().filter(function (c) { return inSection(c, sectionKey) || c.type === sectionKey; });
    if (sectionKey === "season") {
      var sk = seasonKey();
      list = visibleContents().filter(function (c) {
        return c.type === "season" && (!c.seasons || c.seasons.indexOf(sk) >= 0 || c.seasons.length === 0);
      });
      // also include current season items; if none, show all season guides
      if (!list.length) list = visibleContents().filter(function (c) { return c.type === "season"; });
      var label = $("[data-lv-td-season-label]");
      if (label) label.textContent = "지금 계절: " + seasonName(sk) + ". 현재 계절 콘텐츠를 우선 표시합니다.";
    }
    if (sectionKey === "place") list = visibleContents().filter(function (c) { return c.type === "place"; });
    if (sectionKey === "hobby") list = visibleContents().filter(function (c) { return c.type === "experience"; });
    if (sectionKey === "learn") list = visibleContents().filter(function (c) { return c.type === "learn"; });
    if (sectionKey === "together") list = visibleContents().filter(function (c) { return c.type === "together"; });
    if (sectionKey === "everyday") list = visibleContents().filter(function (c) { return c.type === "life"; });
    if (sectionKey === "editorial") list = visibleContents().filter(function (c) { return c.type === "editorial"; });

    list = list.slice(0, limit || 4);
    if (!list.length) {
      list = visibleContents().filter(function (c) { return c.evergreen || c.featured; }).slice(0, limit || 4);
    }
    if (!list.length) {
      host.innerHTML = emptyHtml("이 영역의 콘텐츠가 아직 없습니다. 검색에서 다른 카테고리를 살펴보세요.");
      return;
    }
    if (variant === "rail") {
      host.innerHTML = '<div class="lv-td-rail">' + list.map(function (c) { return card(c, "rail"); }).join("") + "</div>";
    } else if (variant === "editorial") {
      var lead = list[0];
      var rest = list.slice(1);
      host.innerHTML =
        '<div class="lv-td-story-board">' +
          (lead ? card(lead, "editorial").replace('class="lv-td-story"', 'class="lv-td-story is-lead"') : "") +
          (rest.length
            ? '<div class="lv-td-story-grid">' + rest.map(function (c) { return card(c, "editorial"); }).join("") + "</div>"
            : "") +
        "</div>";
    } else if (variant === "feature-first") {
      host.innerHTML = card(list[0], "feature") + (list.length > 1 ? '<div class="lv-td-grid" style="margin-top:1rem">' + list.slice(1).map(function (c) { return card(c, "grid"); }).join("") + "</div>" : "");
    } else {
      host.innerHTML = '<div class="lv-td-grid">' + list.map(function (c) { return card(c, "grid"); }).join("") + "</div>";
    }
  }

  function matchesLib(c) {
    if (state.libCat !== "all" && c.type !== state.libCat) return false;
    if (!state.libQuery) return true;
    var q = state.libQuery.toLowerCase();
    var blob = [c.title, c.blurb, c.category, c.region].concat(c.tags || []).join(" ").toLowerCase();
    return blob.indexOf(q) >= 0;
  }

  function renderLibrary() {
    var host = $("[data-lv-td-library]");
    var count = $("[data-lv-td-count]");
    if (!host) return;
    var list = visibleContents().filter(matchesLib);
    if (count) count.textContent = list.length ? ("검색 결과 " + list.length + "건") : "검색 결과가 없습니다";
    if (!list.length) {
      var suggest = visibleContents().filter(function (c) { return c.evergreen; }).slice(0, 3);
      host.innerHTML = emptyHtml("조건에 맞는 콘텐츠가 없습니다. 필터를 초기화하거나 아래 상시 추천을 보세요.") +
        (suggest.length ? '<div class="lv-td-grid" style="margin-top:1rem">' + suggest.map(function (c) { return card(c, "grid"); }).join("") + "</div>" : "");
      return;
    }
    host.innerHTML = '<div class="lv-td-grid">' + list.map(function (c) { return card(c, "grid"); }).join("") + "</div>";
  }

  function showDetail(id) {
    var c = byId(id);
    var sec = $("#td-detail");
    var host = $("[data-lv-td-detail]");
    if (!c || !sec || !host) return;
    state.detailId = id;
    sec.hidden = false;
    sec.classList.add("is-in");
    var savedOn = isSaved(c.id);
    var facts = [];
    if (c.address) facts.push(["주소", c.address]);
    if (c.hours) facts.push(["운영 시간", c.hours]);
    if (c.price) facts.push(["가격", c.price]);
    if (c.difficulty) facts.push(["난이도", c.difficulty]);
    if (c.duration) facts.push(["소요 시간", c.duration]);
    if (c.region) facts.push(["지역", c.region]);
    if (c.indoorOutdoor) facts.push(["실내·야외", c.indoorOutdoor]);
    if (c.onlineOffline) facts.push(["온·오프라인", c.onlineOffline]);
    if (c.companion && c.companion.length) facts.push(["동행", c.companion.join(", ")]);
    if (c.source) facts.push(["출처", c.source]);
    facts.push(["확인", c.checkedAt || DATA.checkedAt || "—"]);
    facts.push(["상태", statusLabel(c.status)]);

    var related = visibleContents().filter(function (x) {
      return x.id !== c.id && ((x.type === c.type) || (c.tags || []).some(function (t) { return (x.tags || []).indexOf(t) >= 0; }));
    }).slice(0, 3);

    host.innerHTML =
      '<button type="button" class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" data-lv-td-close>← 이전</button>' +
      '<div class="lv-td-detail__hero">' + imgHtml(c.img, c.alt) + "</div>" +
      '<p class="lv-td-eyebrow">' + esc(c.category || "") + " · " + esc(c.type) + "</p>" +
      '<h2 class="lv-td-title lv-td-title--md">' + esc(c.title) + "</h2>" +
      (c.reason ? '<p class="lv-td-note">추천 이유 · ' + esc(c.reason) + "</p>" : "") +
      '<p class="lv-td-lead">' + esc(c.body || c.blurb) + "</p>" +
      '<dl class="lv-td-facts">' + facts.map(function (f) {
        return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>";
      }).join("") + "</dl>" +
      '<div class="lv-td-actions">' +
        '<button type="button" class="lv-td-btn' + (savedOn ? " is-on" : "") + '" data-lv-td-save="' + esc(c.id) + '" data-lv-td-label="' + esc(c.title) + '">' + (savedOn ? "저장됨" : "관심 저장") + "</button>" +
        '<button type="button" class="lv-td-btn lv-td-btn--ghost" data-lv-td-share="' + esc(c.id) + '">공유하기</button>' +
        '<button type="button" class="lv-td-btn lv-td-btn--ghost" data-lv-td-hide="' + esc(c.id) + '">관심 없음</button>' +
        '<a class="lv-td-btn lv-td-btn--ghost" href="#life-now">내 생활에 일정 추가</a>' +
        linkActs(c) +
      "</div>" +
      (related.length
        ? '<div class="lv-td-block"><p class="lv-td-eyebrow">Related</p><h3 class="lv-td-title lv-td-title--sm">관련 발견</h3><div class="lv-td-grid">' +
          related.map(function (r) { return card(r, "grid"); }).join("") + "</div></div>"
        : "");

    history.replaceState(null, "", "#td-item-" + id);
    document.documentElement.dataset.lvView = "today";
    requestAnimationFrame(function () { scrollToId("td-detail"); });
  }

  function hideDetail() {
    var sec = $("#td-detail");
    if (sec) sec.hidden = true;
    state.detailId = null;
  }

  function renderSavedBox() {
    var host = $("[data-lv-td-saved]");
    if (!host) return;
    var s = saved();
    var p = prefs();
    if (!s.length && !p.interests.length) {
      host.innerHTML = '<div class="lv-td-empty"><span class="lv-td-badge">이 기기</span><h3>아직 저장한 발견이 없습니다</h3><p>관심 분야를 고르거나 콘텐츠를 저장하면 이곳에 모입니다. 계정 동기화 전에는 이 기기에만 저장됩니다.</p></div>';
      return;
    }
    var parts = [];
    if (p.interests.length) parts.push("<p><strong>관심 분야</strong> · " + esc(p.interests.join(", ")) + "</p>");
    if (s.length) parts.push("<p><strong>저장</strong> · " + s.map(function (x) { return esc(x.label); }).join(", ") + "</p>");
    host.innerHTML = '<div class="lv-td-empty"><span class="lv-td-badge">이 기기</span><h3>나의 발견 요약</h3>' + parts.join("") +
      '<div class="lv-td-actions" style="margin-top:1rem"><a class="lv-td-btn" href="#life-now">내 생활에서 보기</a></div></div>';
  }

  function renderAll() {
    renderHero();
    renderSetup();
    renderPriority();
    renderWeek();
    renderSection("[data-lv-td-places]", "place", "feature-first", 4);
    renderSection("[data-lv-td-hobby]", "hobby", "rail", 6);
    renderSection("[data-lv-td-learn]", "learn", "grid", 4);
    renderSection("[data-lv-td-together]", "together", "grid", 3);
    renderSection("[data-lv-td-season]", "season", "feature-first", 3);
    renderSection("[data-lv-td-everyday]", "everyday", "editorial", 4);
    renderSection("[data-lv-td-editorial]", "editorial", "editorial", 4);
    renderLibrary();
    renderSavedBox();
  }

  function bindFilm() {
    var hero = $("#td-hero");
    if (!hero) return;
    var reveal = function () { hero.classList.add("is-ready"); };
    var video = hero.querySelector("video");
    if (video) {
      if (video.readyState >= 2) reveal();
      else video.addEventListener("loadeddata", reveal, { once: true });
      setTimeout(reveal, 600);
    } else reveal();
  }

  function bindReveal() {
    $$("[data-lv-td-reveal]").forEach(function (el) { el.classList.add("is-in"); });
  }

  function bindNav() {
    var links = $$(".lv-td-nav__track a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = (a.getAttribute("href") || "").replace("#", "");
      if (id) map[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-on"); });
        if (map[entry.target.id]) map[entry.target.id].classList.add("is-on");
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  function bind() {
    document.addEventListener("click", function (e) {
      var open = e.target.closest("[data-lv-td-open]");
      if (open) {
        e.preventDefault();
        showDetail(open.getAttribute("data-lv-td-open"));
        return;
      }
      var close = e.target.closest("[data-lv-td-close]");
      if (close) {
        e.preventDefault();
        hideDetail();
        scrollToId("td-pick");
        return;
      }
      var save = e.target.closest("[data-lv-td-save]");
      if (save) {
        e.preventDefault();
        var sid = save.getAttribute("data-lv-td-save");
        var slabel = save.getAttribute("data-lv-td-label") || sid;
        var son = toggleSave(sid, slabel);
        save.classList.toggle("is-on", son);
        if (save.tagName === "BUTTON") save.textContent = son ? "저장됨" : "관심 저장";
        renderSavedBox();
        return;
      }
      var share = e.target.closest("[data-lv-td-share]");
      if (share) {
        e.preventDefault();
        var item = byId(share.getAttribute("data-lv-td-share"));
        var url = location.origin + location.pathname + "#td-item-" + (item ? item.id : "");
        var title = item ? item.title : "LIVON 오늘의 발견";
        if (navigator.share) navigator.share({ title: title, url: url }).catch(function () {});
        else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url);
        return;
      }
      var hide = e.target.closest("[data-lv-td-hide]");
      if (hide) {
        e.preventDefault();
        hideItem(hide.getAttribute("data-lv-td-hide"));
        hideDetail();
        renderAll();
        return;
      }
      var tab = e.target.closest("[data-lv-td-tab]");
      if (tab) {
        state.tab = tab.getAttribute("data-lv-td-tab");
        $$("[data-lv-td-tab]").forEach(function (b) {
          var on = b === tab;
          b.classList.toggle("is-on", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        renderSetup();
        return;
      }
      var pref = e.target.closest("[data-lv-td-pref]");
      if (pref) {
        var key = pref.getAttribute("data-lv-td-pref");
        var val = pref.getAttribute("data-val");
        var p = prefs();
        var list = p[key] || [];
        var i = list.indexOf(val);
        if (i >= 0) list.splice(i, 1); else list.push(val);
        p[key] = list;
        savePrefs(p);
        renderSetup();
        return;
      }
      var apply = e.target.closest("[data-lv-td-apply]");
      if (apply) {
        renderPriority();
        scrollToId("td-foryou");
        return;
      }
      var reset = e.target.closest("[data-lv-td-reset]");
      if (reset) {
        savePrefs(defaultPrefs());
        renderSetup();
        renderPriority();
        return;
      }
      var week = e.target.closest("[data-lv-td-week]");
      if (week) {
        state.weekFilter = week.getAttribute("data-lv-td-week");
        $$("[data-lv-td-week]").forEach(function (b) { b.classList.toggle("is-on", b === week); });
        renderWeek();
        return;
      }
      var cat = e.target.closest("[data-lv-td-cat]");
      if (cat) {
        state.libCat = cat.getAttribute("data-lv-td-cat");
        $$("[data-lv-td-cat]").forEach(function (b) { b.classList.toggle("is-on", b === cat); });
        renderLibrary();
        scrollToId("td-library");
        return;
      }
      var viewall = e.target.closest("[data-lv-td-viewall]");
      if (viewall) {
        e.preventDefault();
        state.libCat = viewall.getAttribute("data-lv-td-viewall") || "all";
        if (state.libCat === "week") state.libCat = "event";
        $$("[data-lv-td-cat]").forEach(function (b) {
          b.classList.toggle("is-on", b.getAttribute("data-lv-td-cat") === state.libCat);
        });
        renderLibrary();
        scrollToId("td-library");
        return;
      }
      var scroll = e.target.closest("[data-lv-td-scroll]");
      if (scroll) {
        var href = scroll.getAttribute("href") || "";
        if (href.charAt(0) === "#") {
          e.preventDefault();
          document.documentElement.dataset.lvView = "today";
          scrollToId(href.slice(1));
        }
        return;
      }
      var aiq = e.target.closest("[data-lv-td-aiq]");
      if (aiq) {
        try {
          sessionStorage.setItem(KEY_AIQ, JSON.stringify({ q: aiq.getAttribute("data-lv-td-aiq") || "", stage: "", at: Date.now(), source: "today" }));
        } catch (err) {}
      }
    });

    var form = $("[data-lv-td-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = $("[data-lv-td-q]");
        state.libQuery = input ? input.value.trim() : "";
        renderLibrary();
        scrollToId("td-library");
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hideDetail();
    });
  }

  function onShow(hash) {
    renderSavedBox();
    if (!hash || hash === "today" || hash === "td-hero") {
      window.scrollTo(0, 0);
      return;
    }
    if (hash.indexOf("td-item-") === 0) {
      showDetail(hash.replace("td-item-", ""));
      return;
    }
    if (hash.indexOf("td-") === 0) setTimeout(function () { scrollToId(hash); }, 40);
  }

  function init() {
    if (!$("#today")) return;
    renderAll();
    bindFilm();
    bindReveal();
    bindNav();
    bind();
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "today") onShow(hash || "today");
  }

  window.LivonToday = {
    onShow: onShow,
    isTodayHash: function (hash) {
      return hash === "today" || hash.indexOf("td-") === 0;
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
