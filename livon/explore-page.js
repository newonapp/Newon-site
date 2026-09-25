(function () {
  var DATA = window.LivonExploreData || { items: [], categories: [], suggest: [], regions: [] };
  var KEY_RECENT = "livon.exRecent";
  var KEY_SAVED = "livon.exSaved";
  var KEY_VIEWED = "livon.exViewed";
  var KEY_COMPARE = "livon.exCompare";
  var KEY_TRACK = "livon.exTrackHistory";
  var KEY_INTERESTS = "livon.mlInterests";
  var KEY_LIFE_INTERESTS = "livon.lifeInterests";
  var KEY_STAGE = "livon.lifeStage";
  var KEY_REGION = "livon.exPrefRegion";
  var KEY_ML_SAVED = "livon.mlStore.v1";

  var TYPE_LABEL = {
    expert: "전문가",
    service: "생활 서비스",
    program: "교육·클래스",
    place: "지역·장소",
    product: "생활 상품",
    guide: "가이드",
    benefit: "혜택·지원"
  };

  var state = {
    q: "",
    categoryId: "",
    type: "all",
    region: "",
    mode: "",
    visit: "",
    sort: "relevance",
    detailId: "",
    viewMode: "list",
    filtersOpen: true
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
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
  function items() { return Array.isArray(DATA.items) ? DATA.items : []; }
  function findItem(id) { return items().find(function (x) { return x.id === id; }); }

  function recentQueries() {
    var list = readJSON(KEY_RECENT, []);
    return Array.isArray(list) ? list.slice(0, 8) : [];
  }
  function pushRecent(q) {
    var clean = String(q || "").trim();
    if (!clean) return;
    writeJSON(KEY_RECENT, [clean].concat(recentQueries().filter(function (x) { return x !== clean; })).slice(0, 8));
  }
  function viewedList() {
    var list = readJSON(KEY_VIEWED, []);
    return Array.isArray(list) ? list.slice(0, 12) : [];
  }
  function pushViewed(id) {
    if (!id) return;
    writeJSON(KEY_VIEWED, [id].concat(viewedList().filter(function (x) { return x !== id; })).slice(0, 12));
  }
  function savedList() {
    var list = readJSON(KEY_SAVED, []);
    return Array.isArray(list) ? list : [];
  }
  function isSaved(id) {
    return savedList().some(function (x) { return x.id === id; });
  }
  function toggleSaveItem(item) {
    if (!item) return false;
    var list = savedList();
    var exists = list.some(function (x) { return x.id === item.id; });
    var next = exists
      ? list.filter(function (x) { return x.id !== item.id; })
      : list.concat([{
          id: item.id,
          title: item.title,
          type: item.type,
          provider: item.provider,
          at: Date.now(),
          source: "explore"
        }]).slice(0, 60);
    writeJSON(KEY_SAVED, next);
    syncToMyLife(item, !exists);
    return !exists;
  }
  function syncToMyLife(item, adding) {
    try {
      if (window.LivonPlatform) {
        if (adding && window.LivonPlatform.saveItem) {
          window.LivonPlatform.saveItem({
            id: "ex:" + item.id,
            label: item.title,
            type: item.type || "service",
            href: "#ex-item-" + item.id,
            source: "탐색",
            folder: "나중에 보기"
          });
        } else if (!adding && window.LivonPlatform.removeSave) {
          window.LivonPlatform.removeSave("ex:" + item.id);
        }
      }
      var store = readJSON(KEY_ML_SAVED, null);
      if (!store || typeof store !== "object") {
        store = { events: [], todos: [], goals: [], habits: [], habitLogs: {}, transactions: [],
          health: [], experiences: [], journal: [], projects: [], checklists: [], budget: {}, settings: {} };
      }
      if (!Array.isArray(store.savedExplore)) store.savedExplore = [];
      if (adding) {
        if (!store.savedExplore.some(function (x) { return x.id === item.id; })) {
          store.savedExplore.unshift({
            id: item.id, title: item.title, type: item.type, provider: item.provider,
            at: Date.now(), href: "#ex-item-" + item.id
          });
        }
      } else {
        store.savedExplore = store.savedExplore.filter(function (x) { return x.id !== item.id; });
      }
      writeJSON(KEY_ML_SAVED, store);
      var interests = readJSON(KEY_INTERESTS, []);
      if (!Array.isArray(interests)) interests = [];
      if (adding && interests.indexOf(item.title) < 0) {
        writeJSON(KEY_INTERESTS, interests.concat([item.title]).slice(0, 40));
      }
    } catch (e) {}
  }
  function compareIds() {
    var list = readJSON(KEY_COMPARE, []);
    return Array.isArray(list) ? list.slice(0, 4) : [];
  }
  function setCompare(ids) { writeJSON(KEY_COMPARE, ids.slice(0, 4)); }
  function trackingOn() {
    var v = localStorage.getItem(KEY_TRACK);
    return v !== "0";
  }

  function scoreItem(item, q) {
    if (!q) return 1;
    var hay = [item.title, item.provider, item.blurb, item.subfield, (item.tags || []).join(" "), item.region]
      .join(" ").toLowerCase();
    var tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    var score = 0;
    tokens.forEach(function (t) {
      if (hay.indexOf(t) >= 0) score += 2;
      if (String(item.title || "").toLowerCase().indexOf(t) >= 0) score += 3;
      if ((item.tags || []).some(function (tag) { return String(tag).toLowerCase().indexOf(t) >= 0; })) score += 2;
    });
    return score;
  }

  function filterItems() {
    var q = String(state.q || "").trim();
    var list = items().filter(function (item) {
      if (state.categoryId && (item.categoryIds || []).indexOf(state.categoryId) < 0) return false;
      if (state.type && state.type !== "all" && item.type !== state.type) return false;
      if (state.region && item.region !== state.region && item.region !== "전국" && item.region !== "온라인") return false;
      if (state.mode === "online" && item.mode !== "online" && item.mode !== "both") return false;
      if (state.mode === "offline" && item.mode !== "offline" && item.mode !== "both") return false;
      if (state.visit === "1" && !item.visit) return false;
      if (state.visit === "0" && item.visit) return false;
      if (q && scoreItem(item, q) <= 0) return false;
      return true;
    });
    list.sort(function (a, b) {
      if (state.sort === "newest") return String(b.checkedAt || "").localeCompare(String(a.checkedAt || ""));
      if (state.sort === "region") return String(a.region || "").localeCompare(String(b.region || ""));
      if (state.sort === "price") return String(a.priceLabel || "").localeCompare(String(b.priceLabel || ""));
      return scoreItem(b, q) - scoreItem(a, q);
    });
    return list;
  }

  function relatedCats(q) {
    var tokens = String(q || "").toLowerCase();
    return (DATA.categories || []).filter(function (c) {
      return c.title.indexOf(q) >= 0 || tokens.indexOf(c.id) >= 0 ||
        (c.desc || "").indexOf(q) >= 0;
    }).slice(0, 4);
  }

  function renderSuggest() {
    var host = $("[data-lv-ex-suggest]");
    var ac = $("[data-lv-ex-ac]");
    var list = DATA.suggest || [];
    if (host) {
      host.innerHTML = list.map(function (q) {
        return "<li><button type=\"button\" data-lv-ex-chip=\"" + esc(q) + "\">" + esc(q) + "</button></li>";
      }).join("");
    }
    if (ac) {
      var opts = {};
      list.forEach(function (q) { opts[q] = 1; });
      items().forEach(function (it) {
        opts[it.title] = 1;
        (it.tags || []).forEach(function (t) { opts[t] = 1; });
        if (it.subfield) opts[it.subfield] = 1;
      });
      (DATA.categories || []).forEach(function (c) { opts[c.title] = 1; });
      ac.innerHTML = Object.keys(opts).slice(0, 80).map(function (v) {
        return "<option value=\"" + esc(v) + "\"></option>";
      }).join("");
    }
  }

  function renderRecentLine() {
    var host = $("[data-lv-ex-recent]");
    if (!host) return;
    var list = recentQueries();
    if (!list.length || !trackingOn()) {
      host.hidden = true;
      host.innerHTML = "";
      return;
    }
    host.hidden = false;
    host.innerHTML = "최근 검색 · " + list.map(function (q) {
      return "<button type=\"button\" data-lv-ex-chip=\"" + esc(q) + "\">" + esc(q) + "</button>";
    }).join(" ") +
      " <button type=\"button\" class=\"lv-ex-text-btn\" data-lv-ex-clear-history>기록 삭제</button>";
  }

  function renderCats() {
    var host = $("[data-lv-ex-cats]");
    if (!host) return;
    host.innerHTML = (DATA.categories || []).map(function (c) {
      var count = items().filter(function (it) { return (it.categoryIds || []).indexOf(c.id) >= 0; }).length;
      return "<button type=\"button\" class=\"lv-ex-cat\" data-lv-ex-open-cat=\"" + esc(c.id) + "\">" +
        "<em>" + esc(c.num) + "</em>" +
        "<strong>" + esc(c.title) + "</strong>" +
        "<span>" + esc(c.desc) + "</span>" +
        "<b>" + count + "개 확인됨</b>" +
      "</button>";
    }).join("");
  }

  function userInterests() {
    var a = readJSON(KEY_INTERESTS, []);
    var b = readJSON(KEY_LIFE_INTERESTS, []);
    var out = [];
    [].concat(Array.isArray(a) ? a : [], Array.isArray(b) ? b : []).forEach(function (x) {
      if (out.indexOf(x) < 0) out.push(x);
    });
    return out;
  }

  function recommendItems() {
    var interests = userInterests();
    var stage = localStorage.getItem(KEY_STAGE) || "";
    var prefRegion = localStorage.getItem(KEY_REGION) || "";
    var recent = viewedList();
    var scored = items().map(function (it) {
      var s = 0;
      var reasons = [];
      interests.forEach(function (interest) {
        if (scoreItem(it, interest) > 0) {
          s += 3;
          reasons.push("관심 · " + interest);
        }
      });
      if (stage && scoreItem(it, stage) > 0) {
        s += 2;
        reasons.push("스테이지 연결");
      }
      if (prefRegion && (it.region === prefRegion || it.region === "전국")) {
        s += 1;
        reasons.push("선호 지역");
      }
      if (recent.indexOf(it.id) >= 0) {
        s += 1;
        reasons.push("최근 본 서비스와 관련");
      }
      if (!s && it.credentials && it.credentials.status === "verified") s = 0.5;
      return { item: it, score: s, reason: reasons[0] || "확인된 대표 서비스" };
    }).filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 6);
    if (!scored.length) {
      scored = items().filter(function (it) { return it.credentials && it.credentials.status === "verified"; })
        .slice(0, 6)
        .map(function (it) { return { item: it, score: 1, reason: "확인된 대표 서비스" }; });
    }
    return scored;
  }

  function renderForYou() {
    var host = $("[data-lv-ex-foryou]");
    if (!host) return;
    var interests = userInterests();
    var prefRegion = localStorage.getItem(KEY_REGION) || "";
    var rec = recommendItems();
    host.innerHTML =
      "<div class=\"lv-ex-block-label\"><p class=\"lv-ex-eyebrow\">For you</p><h3 class=\"lv-ex-title lv-ex-title--sm\">맞춤 탐색</h3></div>" +
      "<div class=\"lv-ex-pref\">" +
        "<label>선호 지역 <select data-lv-ex-pref-region>" +
          "<option value=\"\">전체</option>" +
          (DATA.regions || []).map(function (r) {
            return "<option value=\"" + esc(r) + "\"" + (prefRegion === r ? " selected" : "") + ">" + esc(r) + "</option>";
          }).join("") +
        "</select></label>" +
        "<a class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" href=\"#life-now\">관심사·스테이지 수정</a>" +
        (interests.length ? "<p class=\"lv-ex-note\">관심: " + esc(interests.slice(0, 6).join(" · ")) + "</p>" : "<p class=\"lv-ex-note\">관심사가 없으면 확인된 대표 서비스를 보여 드립니다.</p>") +
      "</div>" +
      "<div class=\"lv-ex-card-grid\">" + rec.map(function (row) {
        return cardHtml(row.item, row.reason);
      }).join("") + "</div>";
  }

  function renderActivity() {
    var host = $("[data-lv-ex-activity]");
    if (!host) return;
    var viewed = viewedList().map(findItem).filter(Boolean);
    var saved = savedList().map(function (s) { return findItem(s.id) || s; });
    var compared = compareIds().map(findItem).filter(Boolean);
    host.innerHTML =
      "<div class=\"lv-ex-block-label\"><p class=\"lv-ex-eyebrow\">Recent</p><h3 class=\"lv-ex-title lv-ex-title--sm\">최근 · 관심 · 비교</h3></div>" +
      "<div class=\"lv-ex-activity-grid\">" +
        sectionMini("최근 본 서비스", viewed, "아직 본 서비스가 없어요.") +
        sectionMini("관심 저장", saved, "저장한 항목이 없어요.", true) +
        sectionMini("비교 목록", compared, "비교할 항목을 결과에서 추가하세요.") +
      "</div>" +
      "<div class=\"lv-ex-actions\" style=\"margin-top:1rem\">" +
        "<a class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" href=\"#life-now\">내 생활 저장함</a>" +
        "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" data-lv-ex-toggle-track>" +
          (trackingOn() ? "최근 기록 끄기" : "최근 기록 켜기") +
        "</button>" +
      "</div>";
  }

  function sectionMini(title, list, empty, isSavedList) {
    return "<div class=\"lv-ex-mini\">" +
      "<h4>" + esc(title) + "</h4>" +
      (list.length
        ? "<ul>" + list.slice(0, 5).map(function (x) {
            var id = x.id;
            var label = x.title || id;
            return "<li><button type=\"button\" data-lv-ex-open=\"" + esc(id) + "\">" + esc(label) + "</button></li>";
          }).join("") + "</ul>"
        : "<p class=\"lv-ex-note\">" + esc(empty) + "</p>") +
    "</div>";
  }

  function credBadge(item) {
    var c = item.credentials || {};
    if (c.status === "verified") return "<span class=\"lv-ex-badge\">확인됨</span>";
    if (c.status === "n/a") return "<span class=\"lv-ex-badge lv-ex-badge--soon\">안내</span>";
    return "<span class=\"lv-ex-badge lv-ex-badge--soon\">미확인</span>";
  }

  function cardHtml(item, reason) {
    var layout = item.layout || item.type || "service";
    var saved = isSaved(item.id);
    var inCompare = compareIds().indexOf(item.id) >= 0;
    return "<article class=\"lv-ex-card lv-ex-card--" + esc(layout) + "\">" +
      "<button type=\"button\" class=\"lv-ex-card__media\" data-lv-ex-open=\"" + esc(item.id) + "\" aria-label=\"" + esc(item.title) + " 상세\">" +
        (item.img ? "<img src=\"" + esc(item.img) + "\" alt=\"\" loading=\"lazy\" width=\"640\" height=\"400\" />" : "") +
      "</button>" +
      "<div class=\"lv-ex-card__body\">" +
        "<div class=\"lv-ex-card__meta\">" + credBadge(item) +
          "<span>" + esc(TYPE_LABEL[item.type] || item.type) + "</span>" +
          "<span>" + esc(item.region || "") + "</span>" +
        "</div>" +
        "<h3><button type=\"button\" data-lv-ex-open=\"" + esc(item.id) + "\">" + esc(item.title) + "</button></h3>" +
        "<p class=\"lv-ex-card__provider\">" + esc(item.provider || "") + "</p>" +
        "<p>" + esc(item.blurb || "") + "</p>" +
        (reason ? "<p class=\"lv-ex-card__reason\">" + esc(reason) + "</p>" : "") +
        "<p class=\"lv-ex-card__price\">" + esc(item.priceLabel || "가격 정보 확인 필요") + "</p>" +
        "<div class=\"lv-ex-card__acts\">" +
          "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--dark lv-ex-btn--sm\" data-lv-ex-open=\"" + esc(item.id) + "\">상세 보기</button>" +
          "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-lv-ex-save-id=\"" + esc(item.id) + "\">" + (saved ? "저장됨" : "관심 저장") + "</button>" +
          "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" data-lv-ex-compare-id=\"" + esc(item.id) + "\">" + (inCompare ? "비교 중" : "비교하기") + "</button>" +
        "</div>" +
      "</div>" +
    "</article>";
  }

  function renderFilters() {
    var host = $("[data-lv-ex-filters]");
    if (!host) return;
    var types = [
      { id: "all", label: "전체" },
      { id: "expert", label: "전문가" },
      { id: "service", label: "생활 서비스" },
      { id: "program", label: "교육" },
      { id: "place", label: "지역" },
      { id: "product", label: "상품" },
      { id: "guide", label: "가이드" }
    ];
    host.innerHTML =
      "<div class=\"lv-ex-filter-group\"><p>유형</p><div class=\"lv-ex-chips\">" +
        types.map(function (t) {
          return "<button type=\"button\" data-lv-ex-filter-type=\"" + t.id + "\"" + (state.type === t.id ? " class=\"is-on\"" : "") + ">" + t.label + "</button>";
        }).join("") +
      "</div></div>" +
      "<div class=\"lv-ex-filter-group\"><p>지역</p><div class=\"lv-ex-chips\">" +
        "<button type=\"button\" data-lv-ex-filter-region=\"\"" + (!state.region ? " class=\"is-on\"" : "") + ">전체</button>" +
        (DATA.regions || []).map(function (r) {
          return "<button type=\"button\" data-lv-ex-filter-region=\"" + esc(r) + "\"" + (state.region === r ? " class=\"is-on\"" : "") + ">" + esc(r) + "</button>";
        }).join("") +
      "</div></div>" +
      "<div class=\"lv-ex-filter-group\"><p>방식</p><div class=\"lv-ex-chips\">" +
        "<button type=\"button\" data-lv-ex-filter-mode=\"\"" + (!state.mode ? " class=\"is-on\"" : "") + ">전체</button>" +
        "<button type=\"button\" data-lv-ex-filter-mode=\"online\"" + (state.mode === "online" ? " class=\"is-on\"" : "") + ">온라인</button>" +
        "<button type=\"button\" data-lv-ex-filter-mode=\"offline\"" + (state.mode === "offline" ? " class=\"is-on\"" : "") + ">오프라인</button>" +
        "<button type=\"button\" data-lv-ex-filter-visit=\"1\"" + (state.visit === "1" ? " class=\"is-on\"" : "") + ">방문 서비스</button>" +
      "</div></div>" +
      "<p class=\"lv-ex-note\">평점순은 검증된 후기 데이터가 없어 제공하지 않습니다.</p>";
  }

  function renderTabs(list) {
    var host = $("[data-lv-ex-tabs]");
    if (!host) return;
    var counts = { all: list.length };
    list.forEach(function (it) {
      counts[it.type] = (counts[it.type] || 0) + 1;
    });
    var tabs = [
      { id: "all", label: "전체" },
      { id: "expert", label: "전문가" },
      { id: "service", label: "서비스" },
      { id: "program", label: "교육" },
      { id: "place", label: "지역" },
      { id: "product", label: "상품" }
    ];
    host.innerHTML = tabs.map(function (t) {
      var n = counts[t.id] || 0;
      if (t.id !== "all" && !n) return "";
      return "<button type=\"button\" role=\"tab\" data-lv-ex-filter-type=\"" + t.id + "\"" +
        (state.type === t.id ? " class=\"is-on\" aria-selected=\"true\"" : " aria-selected=\"false\"") + ">" +
        t.label + " (" + n + ")</button>";
    }).join("");
  }

  function renderResults() {
    var panel = $("#ex-results");
    var listHost = $("[data-lv-ex-list]");
    var qEl = $("[data-lv-ex-q]");
    var countEl = $("[data-lv-ex-count]");
    var sortEl = $("[data-lv-ex-sort]");
    if (!panel || !listHost) return;
    panel.hidden = false;
    panel.classList.add("is-open");
    var list = filterItems();
    var cat = (DATA.categories || []).find(function (c) { return c.id === state.categoryId; });
    var title = state.q
      ? ("“" + state.q + "” 검색 결과")
      : (cat ? cat.title + " 탐색" : "탐색 결과");
    if (qEl) qEl.textContent = title;
    if (countEl) countEl.textContent = list.length + "개 · 확인일 " + (DATA.checkedAt || "") + (state.categoryId ? " · " + (cat ? cat.title : "") : "");
    if (sortEl) sortEl.value = state.sort;
    renderFilters();
    renderTabs(list);
    var viewBar = '<div class="lv-ex-actions" style="margin-bottom:0.75rem">' +
      '<button type="button" class="lv-ex-btn lv-ex-btn--sm' + (state.viewMode !== "map" ? "" : " lv-ex-btn--ghost") + '" data-lv-ex-view="list">목록</button>' +
      '<button type="button" class="lv-ex-btn lv-ex-btn--sm' + (state.viewMode === "map" ? "" : " lv-ex-btn--ghost") + '" data-lv-ex-view="map">지도</button>' +
      '<span class="lv-ex-note">위치 데이터가 확인된 항목만 지도에 연결합니다.</span></div>';
    if (!list.length) {
      var alts = relatedCats(state.q);
      listHost.innerHTML = viewBar + "<div class=\"lv-ex-empty\">" +
        "<span class=\"lv-ex-badge lv-ex-badge--soon\">결과 없음</span>" +
        "<h3>일치하는 등록 서비스가 없습니다</h3>" +
        "<p>가짜 결과를 만들지 않습니다. 검색어를 바꾸거나 아래 카테고리를 확인해 보세요.</p>" +
        (alts.length
          ? "<div class=\"lv-ex-actions\">" + alts.map(function (c) {
              return "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-lv-ex-open-cat=\"" + esc(c.id) + "\">" + esc(c.title) + "</button>";
            }).join("") + "</div>"
          : "<div class=\"lv-ex-actions\"><button type=\"button\" class=\"lv-ex-btn\" data-lv-ex-open-cat=\"local\">지역 생활</button>" +
            "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost\" data-lv-ex-open-cat=\"education\">교육·클래스</button></div>") +
      "</div>";
      return;
    }
    if (state.viewMode === "map") {
      var mappable = list.filter(function (it) { return !!(it.mapQuery || it.address); });
      listHost.innerHTML = viewBar +
        '<div class="lv-ex-empty">' +
          '<span class="lv-ex-badge lv-ex-badge--soon">지도 보기 · 구조 준비</span>' +
          "<h3>List / Map 전환</h3>" +
          "<p>실제 지도 SDK·핀 데이터 연동 전입니다. 위치가 확인된 항목만 외부 지도로 엽니다. 임의 좌표는 표시하지 않습니다.</p>" +
          "<p class=\"lv-ex-note\">위치 확인 " + mappable.length + " / 결과 " + list.length + "</p>" +
          (mappable.length
            ? "<ul class=\"lv-ex-manage-list\" style=\"text-align:left\">" + mappable.slice(0, 12).map(function (it) {
                var link = "https://map.kakao.com/?q=" + encodeURIComponent(it.mapQuery || it.address);
                return "<li><div><strong>" + esc(it.title) + "</strong><p>" + esc(it.address || it.mapQuery) + "</p></div>" +
                  '<div class="lv-ex-actions"><a class="lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">지도</a>' +
                  '<button type="button" class="lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm" data-lv-ex-open="' + esc(it.id) + '">상세</button></div></li>';
              }).join("") + "</ul>"
            : "<p>이 결과에는 주소·지도 쿼리가 있는 항목이 없습니다.</p>") +
        "</div>";
      return;
    }
    listHost.innerHTML = viewBar + "<div class=\"lv-ex-card-grid\">" + list.map(function (it) { return cardHtml(it); }).join("") + "</div>";
  }

  function openResults(query, opts) {
    opts = opts || {};
    state.q = String(query || "").trim();
    if (opts.categoryId != null) state.categoryId = opts.categoryId;
    if (opts.type) state.type = opts.type;
    if (opts.region != null) state.region = opts.region;
    var input = $("[data-lv-ex-input]");
    var clear = $("[data-lv-ex-clear]");
    if (input) input.value = state.q;
    if (clear) clear.hidden = !state.q;
    if (state.q && trackingOn()) pushRecent(state.q);
    renderRecentLine();
    renderResults();
    location.hash = "ex-results";
    scrollToId("ex-results");
  }

  function closeResults() {
    var panel = $("#ex-results");
    if (panel) {
      panel.classList.remove("is-open");
      panel.hidden = true;
    }
  }

  function modeLabel(m) {
    if (m === "online") return "온라인";
    if (m === "offline") return "오프라인";
    if (m === "both") return "온라인 · 오프라인";
    return "정보 확인 필요";
  }


  function isBenefitDetail(item) {
    if (!item) return false;
    if (item.type === "benefit" || item.layout === "benefit") return true;
    var hay = [item.title, item.subfield, item.blurb, (item.tags || []).join(" ")].join(" ");
    return /복지|지원|혜택|급여|청년정책/.test(hay);
  }
  function benefitBlocks(item) {
    return "<h3>지원 상세</h3>" +
      "<dl class=\"lv-ex-dl\">" +
        "<div><dt>지원 내용</dt><dd>" + esc(item.supportDetail || item.body || item.blurb || "공식에서 확인") + "</dd></div>" +
        "<div><dt>지원 대상</dt><dd>" + esc(item.audience || "조건은 공식에서 확인") + "</dd></div>" +
        "<div><dt>조건</dt><dd>" + esc(item.eligibility || "개인 상황에 따라 다름 · 신청 가능을 확정하지 않음") + "</dd></div>" +
        "<div><dt>지원 금액·혜택</dt><dd>" + esc(item.benefitAmount || item.priceLabel || "공식 안내 기준") + "</dd></div>" +
        "<div><dt>신청 기간</dt><dd>" + esc(item.applyPeriod || "상시·회차별 · 공식 확인") + "</dd></div>" +
        "<div><dt>필요 서류</dt><dd>" + esc(item.documents || "공식 안내 기준") + "</dd></div>" +
        "<div><dt>신청 방법</dt><dd>" + esc(item.applyHow || "공식 페이지에서 조회·신청") + "</dd></div>" +
        "<div><dt>제공 기관</dt><dd>" + esc(item.provider || "") + "</dd></div>" +
        "<div><dt>공식 출처</dt><dd>" + esc(item.source || "") + "</dd></div>" +
      "</dl>" +
      "<p class=\"lv-ex-note\">확인해볼 만한 지원으로 안내합니다. 자동으로 신청·선정 가능하다고 표시하지 않습니다.</p>" +
      "<div class=\"lv-ex-actions\">" +
        (item.officialUrl ? "<a class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" href=\"" + esc(item.officialUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">공식 신청·조회</a>" : "") +
        "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" data-lv-ex-deadline-soon>마감 알림 · 준비 중</button>" +
        "<a class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" href=\"#life-now\">일정에 메모</a>" +
      "</div>";
  }
  function expertBlocks(item) {
    return "<h3>전문가 프로필 · Marketplace 구조</h3>" +
      "<p class=\"lv-ex-note\">검색 → 비교 → 상세 → 상담 선택 → 일정 → 결제 → 후기 흐름으로 확장할 수 있습니다. 결제·예약은 아직 연결되지 않았습니다.</p>" +
      "<ul>" +
        "<li>전문 분야 · " + esc(item.subfield || (item.compare && item.compare.field) || "안내") + "</li>" +
        "<li>경력·자격 · " + esc((item.credentials && item.credentials.note) || "확인 정보 준비") + "</li>" +
        "<li>상담 방식 · " + esc(modeLabel(item.mode)) + "</li>" +
        "<li>가격 · " + esc(item.priceLabel || "서비스별") + "</li>" +
        "<li>일정·문의 · 준비 중</li>" +
      "</ul>";
  }
  function serviceBlocks(item) {
    return "<h3>서비스 Marketplace</h3>" +
      "<p>제공 범위 · 지역 · 가격 · 이용 방법 · 후기 · 문의 · 저장 · 비교를 한 상세에서 이어갑니다.</p>" +
      "<ul>" +
        "<li>제공 범위 · " + esc(item.blurb || (item.body ? String(item.body).slice(0, 80) : "") || "상세 참고") + "</li>" +
        "<li>지역 · " + esc(item.region || "확인 필요") + "</li>" +
        "<li>이용 방법 · " + esc(item.applyHow || "공식·업체 안내에 따름") + "</li>" +
      "</ul>";
  }

  function renderDetail(id) {
    var sec = $("[data-lv-ex-detail-sec]") || $("#ex-detail");
    var host = $("[data-lv-ex-detail]");
    var item = findItem(id);
    if (!sec || !host) return;
    if (!item) {
      sec.hidden = true;
      return;
    }
    state.detailId = id;
    if (trackingOn()) pushViewed(id);
    sec.hidden = false;
    var saved = isSaved(id);
    var inCompare = compareIds().indexOf(id) >= 0;
    var mapLink = item.mapQuery || item.address
      ? ("https://map.kakao.com/?q=" + encodeURIComponent(item.mapQuery || item.address))
      : "";
    var related = items().filter(function (x) {
      return x.id !== id && (x.categoryIds || []).some(function (c) { return (item.categoryIds || []).indexOf(c) >= 0; });
    }).slice(0, 3);

    host.innerHTML =
      "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-lv-ex-back-results>← 결과로</button>" +
      "<article class=\"lv-ex-detail lv-ex-detail--" + esc(item.layout || item.type) + "\">" +
        "<div class=\"lv-ex-detail__hero\">" +
          (item.img ? "<img src=\"" + esc(item.img) + "\" alt=\"\" width=\"1200\" height=\"700\" />" : "") +
          "<div class=\"lv-ex-detail__hero-copy\">" +
            credBadge(item) +
            "<p class=\"lv-ex-eyebrow\">" + esc(TYPE_LABEL[item.type] || "") + " · " + esc(item.subfield || "") + "</p>" +
            "<h2 class=\"lv-ex-title lv-ex-title--md\">" + esc(item.title) + "</h2>" +
            "<p class=\"lv-ex-lead\">" + esc(item.provider || "") + "</p>" +
          "</div>" +
        "</div>" +
        "<div class=\"lv-ex-detail__grid\">" +
          "<div class=\"lv-ex-detail__main\">" +
            "<h3>소개</h3><p>" + esc(item.body || item.blurb || "") + "</p>" +
            (item.audience ? "<h3>이용 대상</h3><p>" + esc(item.audience) + "</p>" : "") +
            (isBenefitDetail(item) ? benefitBlocks(item) : "") +
            (item.type === "expert" ? expertBlocks(item) : "") +
            (item.type === "service" && !isBenefitDetail(item) ? serviceBlocks(item) : "") +
            (item.hours ? "<h3>운영 · 이용 시간</h3><p>" + esc(item.hours) + "</p>" : "") +
            "<h3>가격 · 이용 조건</h3><p>" + esc(item.priceLabel || "정보 확인 필요") +
              (item.priceType === "quote" ? " <em>(견적 방식 — 확정 가격 아님)</em>" : "") + "</p>" +
            (item.credentials && item.credentials.note ? "<h3>자격 · 인증</h3><p>" + esc(item.credentials.note) + "</p>" : "") +
            "<h3>후기</h3><p class=\"lv-ex-note\">등록된 이용 후기가 없습니다. 허위 평점을 표시하지 않습니다.</p>" +
          "</div>" +
          "<aside class=\"lv-ex-detail__side\">" +
            "<dl>" +
              "<div><dt>지역</dt><dd>" + esc(item.region || "정보 확인 필요") + "</dd></div>" +
              "<div><dt>방식</dt><dd>" + esc(modeLabel(item.mode)) + "</dd></div>" +
              "<div><dt>방문</dt><dd>" + (item.visit ? "방문 가능" : "해당 없음/정보 확인 필요") + "</dd></div>" +
              (item.address ? "<div><dt>주소</dt><dd>" + esc(item.address) + "</dd></div>" : "") +
              "<div><dt>출처</dt><dd>" + esc(item.source || "") + "</dd></div>" +
              "<div><dt>확인일</dt><dd>" + esc(item.checkedAt || "") + "</dd></div>" +
            "</dl>" +
            "<div class=\"lv-ex-actions lv-ex-actions--stack\">" +
              (item.officialUrl
                ? "<a class=\"lv-ex-btn\" href=\"" + esc(item.officialUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">공식 페이지 · 신청</a>"
                : "<span class=\"lv-ex-badge lv-ex-badge--soon\">공식 링크 준비 중</span>") +
              (mapLink ? "<a class=\"lv-ex-btn lv-ex-btn--outline\" href=\"" + esc(mapLink) + "\" target=\"_blank\" rel=\"noopener noreferrer\">지도 · 길찾기</a>" : "") +
              "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline\" data-lv-ex-save-id=\"" + esc(id) + "\">" + (saved ? "저장됨" : "관심 저장") + "</button>" +
              "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost\" data-lv-ex-compare-id=\"" + esc(id) + "\">" + (inCompare ? "비교 목록에서 제거" : "비교하기") + "</button>" +
              "<a class=\"lv-ex-btn lv-ex-btn--ghost\" href=\"#community\">커뮤니티 경험담</a>" +
              "<a class=\"lv-ex-btn lv-ex-btn--ghost\" href=\"#livon-ai\">LIVON AI로 조건 정리</a>" +
              "<a class=\"lv-ex-btn lv-ex-btn--ghost\" href=\"#life-now\">내 생활에 저장</a>" +
            "</div>" +
            "<p class=\"lv-ex-note\">내부 문의·예약·결제는 파트너 수신 시스템이 없어 접수 완료로 표시하지 않습니다.</p>" +
          "</aside>" +
        "</div>" +
        (related.length
          ? "<div class=\"lv-ex-block-label\"><h3 class=\"lv-ex-title lv-ex-title--sm\">관련 서비스</h3></div>" +
            "<div class=\"lv-ex-card-grid\">" + related.map(function (x) { return cardHtml(x); }).join("") + "</div>"
          : "") +
      "</article>";
    location.hash = "ex-item-" + id;
    scrollToId("ex-detail");
    renderActivity();
  }

  function renderCompare() {
    var host = $("[data-lv-ex-compare]");
    if (!host) return;
    var ids = compareIds();
    var list = ids.map(findItem).filter(Boolean);
    if (!list.length) {
      host.innerHTML = "<div class=\"lv-ex-empty\"><h3>비교할 항목이 없습니다</h3><p>결과 카드에서 ‘비교하기’로 2~4개를 담아 보세요. 서로 다른 유형은 공통 기준이 있을 때만 비교합니다.</p></div>";
      return;
    }
    var types = {};
    list.forEach(function (x) { types[x.type] = 1; });
    var mixed = Object.keys(types).length > 1;
    if (mixed) {
      host.innerHTML = "<div class=\"lv-ex-empty\"><h3>유형이 다른 항목입니다</h3><p>같은 유형끼리만 비교할 수 있습니다. 목록을 정리해 주세요.</p>" +
        "<ul class=\"lv-ex-compare-picks\">" + list.map(function (x) {
          return "<li>" + esc(x.title) + " <button type=\"button\" data-lv-ex-compare-id=\"" + esc(x.id) + "\">제거</button></li>";
        }).join("") + "</ul></div>";
      return;
    }
    var rows = [
      { key: "field", label: "분야·범위" },
      { key: "range", label: "지역·위치" },
      { key: "mode", label: "방식·예약" },
      { key: "price", label: "가격" },
      { key: "cred", label: "평점·출처" },
      { key: "hours", label: "운영 시간" },
      { key: "feature", label: "특징" }
    ];
    host.innerHTML =
      "<div class=\"lv-ex-compare-picks\">" + list.map(function (x) {
        return "<span>" + esc(x.title) + " <button type=\"button\" data-lv-ex-compare-id=\"" + esc(x.id) + "\" aria-label=\"비교에서 제거\">×</button></span>";
      }).join("") + "</div>" +
      "<div style=\"overflow:auto\"><table class=\"lv-ex-compare\"><thead><tr><th>비교 항목</th>" +
        list.map(function (x) { return "<th><button type=\"button\" data-lv-ex-open=\"" + esc(x.id) + "\">" + esc(x.title) + "</button></th>"; }).join("") +
      "</tr></thead><tbody>" +
        rows.map(function (row) {
          return "<tr><td><strong>" + row.label + "</strong></td>" + list.map(function (x) {
            var val = (x.compare && x.compare[row.key]) || (row.key === "hours" ? (x.hours || "") : "") || (row.key === "feature" ? (x.blurb || x.subfield || "") : "") || "정보 확인 필요";
            return "<td>" + esc(val) + "</td>";
          }).join("") + "</tr>";
        }).join("") +
      "</tbody></table></div>" +
      "<div class=\"lv-ex-actions\" style=\"margin-top:1rem\">" +
        list.map(function (x) {
          return "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-lv-ex-save-id=\"" + esc(x.id) + "\">" + esc(x.title) + " 저장</button>";
        }).join("") +
      "</div>";
  }

  function renderRecommendSection() {
    var host = $("[data-lv-ex-recommend]");
    if (!host) return;
    var rec = recommendItems();
    host.innerHTML = "<div class=\"lv-ex-card-grid\">" + rec.map(function (row) {
      return cardHtml(row.item, row.reason);
    }).join("") + "</div>" +
      "<div class=\"lv-ex-actions\" style=\"margin-top:1.25rem\">" +
        "<a class=\"lv-ex-btn\" href=\"#life-now\">관심사 수정</a>" +
        "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost\" data-lv-ex-open-cat=\"experts\">전문가 더 보기</button>" +
      "</div>";
  }

  function toggleCompare(id) {
    var item = findItem(id);
    if (!item) return;
    var ids = compareIds();
    var idx = ids.indexOf(id);
    if (idx >= 0) {
      ids.splice(idx, 1);
    } else {
      if (ids.length) {
        var first = findItem(ids[0]);
        if (first && first.type !== item.type) {
          alert("같은 유형의 항목만 비교할 수 있습니다.");
          return;
        }
      }
      if (ids.length >= 4) {
        alert("비교는 최대 4개까지입니다.");
        return;
      }
      ids.push(id);
    }
    setCompare(ids);
    renderCompare();
    renderActivity();
    if ($("#ex-results") && !$("#ex-results").hidden) renderResults();
    if (state.detailId) renderDetail(state.detailId);
  }

  function bindEvents() {
    var form = $("[data-lv-ex-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = $("[data-lv-ex-input]");
        state.categoryId = "";
        state.type = "all";
        openResults(input ? input.value : "");
      });
    }
    var input = $("[data-lv-ex-input]");
    if (input) {
      input.addEventListener("input", function () {
        var clear = $("[data-lv-ex-clear]");
        if (clear) clear.hidden = !input.value;
      });
    }

    document.addEventListener("click", function (e) {
      var scroll = e.target.closest("[data-lv-ex-scroll]");
      if (scroll) {
        e.preventDefault();
        var href = scroll.getAttribute("href") || "#ex-home";
        scrollToId(href.replace("#", ""));
        return;
      }
      var clearBtn = e.target.closest("[data-lv-ex-clear]");
      if (clearBtn) {
        e.preventDefault();
        if (input) input.value = "";
        clearBtn.hidden = true;
        input && input.focus();
        return;
      }
      var chip = e.target.closest("[data-lv-ex-chip]");
      if (chip) {
        e.preventDefault();
        state.categoryId = "";
        state.type = "all";
        openResults(chip.getAttribute("data-lv-ex-chip") || chip.textContent);
        return;
      }
      var openCat = e.target.closest("[data-lv-ex-open-cat]");
      if (openCat) {
        e.preventDefault();
        var catId = openCat.getAttribute("data-lv-ex-open-cat");
        var cat = (DATA.categories || []).find(function (c) { return c.id === catId; });
        state.categoryId = catId;
        state.type = "all";
        openResults("", { categoryId: catId });
        return;
      }
      var legacyCat = e.target.closest("[data-lv-ex-cat]");
      if (legacyCat && !e.target.closest("[data-lv-ex-open-cat]")) {
        e.preventDefault();
        var q = legacyCat.getAttribute("data-lv-ex-cat") || "";
        var t = legacyCat.getAttribute("data-lv-ex-type") || "all";
        state.categoryId = "";
        state.type = t === "guide" ? "all" : t;
        openResults(q, { type: state.type });
        return;
      }
      var open = e.target.closest("[data-lv-ex-open]");
      if (open) {
        e.preventDefault();
        renderDetail(open.getAttribute("data-lv-ex-open"));
        return;
      }
      var saveId = e.target.closest("[data-lv-ex-save-id]");
      if (saveId) {
        e.preventDefault();
        var sid = saveId.getAttribute("data-lv-ex-save-id");
        var on = toggleSaveItem(findItem(sid));
        saveId.textContent = on ? "저장됨" : "관심 저장";
        renderActivity();
        return;
      }
      var legacySave = e.target.closest("[data-lv-ex-save]");
      if (legacySave && !saveId) {
        e.preventDefault();
        var title = legacySave.getAttribute("data-lv-ex-save") || "탐색 관심";
        var fake = { id: "label:" + title, title: title, type: "guide", provider: "LIVON" };
        var on2 = toggleSaveItem(fake);
        legacySave.textContent = on2 ? "저장됨" : "관심 저장";
        renderActivity();
        return;
      }
      var viewBtn = e.target.closest("[data-lv-ex-view]");
      if (viewBtn) {
        state.viewMode = viewBtn.getAttribute("data-lv-ex-view") === "map" ? "map" : "list";
        renderResults();
        return;
      }
      if (e.target.closest("[data-lv-ex-deadline-soon]")) {
        alert("마감 알림은 알림 센터 연동 후 제공됩니다.");
        return;
      }
      var cmp = e.target.closest("[data-lv-ex-compare-id]");
      if (cmp) {
        e.preventDefault();
        toggleCompare(cmp.getAttribute("data-lv-ex-compare-id"));
        return;
      }
      var ft = e.target.closest("[data-lv-ex-filter-type]");
      if (ft) {
        e.preventDefault();
        state.type = ft.getAttribute("data-lv-ex-filter-type") || "all";
        renderResults();
        return;
      }
      var fr = e.target.closest("[data-lv-ex-filter-region]");
      if (fr) {
        e.preventDefault();
        state.region = fr.getAttribute("data-lv-ex-filter-region") || "";
        renderResults();
        return;
      }
      var fm = e.target.closest("[data-lv-ex-filter-mode]");
      if (fm) {
        e.preventDefault();
        state.mode = fm.getAttribute("data-lv-ex-filter-mode") || "";
        state.visit = "";
        renderResults();
        return;
      }
      var fv = e.target.closest("[data-lv-ex-filter-visit]");
      if (fv) {
        e.preventDefault();
        state.visit = state.visit === "1" ? "" : "1";
        renderResults();
        return;
      }
      var close = e.target.closest("[data-lv-ex-close-results]");
      if (close) {
        e.preventDefault();
        closeResults();
        scrollToId("ex-home");
        location.hash = "ex-home";
        return;
      }
      var back = e.target.closest("[data-lv-ex-back-results]");
      if (back) {
        e.preventDefault();
        if ($("#ex-results") && $("#ex-results").hidden) openResults(state.q, { categoryId: state.categoryId, type: state.type });
        else scrollToId("ex-results");
        location.hash = "ex-results";
        return;
      }
      var clearHist = e.target.closest("[data-lv-ex-clear-history]");
      if (clearHist) {
        e.preventDefault();
        writeJSON(KEY_RECENT, []);
        writeJSON(KEY_VIEWED, []);
        renderRecentLine();
        renderActivity();
        return;
      }
      var track = e.target.closest("[data-lv-ex-toggle-track]");
      if (track) {
        e.preventDefault();
        localStorage.setItem(KEY_TRACK, trackingOn() ? "0" : "1");
        renderRecentLine();
        renderActivity();
        return;
      }
      var toggleF = e.target.closest("[data-lv-ex-toggle-filters]");
      if (toggleF) {
        e.preventDefault();
        var side = $("[data-lv-ex-side]");
        if (side) side.classList.toggle("is-collapsed");
        toggleF.textContent = side && side.classList.contains("is-collapsed") ? "펼치기" : "접기";
        return;
      }
    });

    document.addEventListener("change", function (e) {
      if (e.target.matches("[data-lv-ex-sort]")) {
        state.sort = e.target.value || "relevance";
        renderResults();
      }
      if (e.target.matches("[data-lv-ex-pref-region]")) {
        localStorage.setItem(KEY_REGION, e.target.value || "");
        renderForYou();
        renderRecommendSection();
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
        links.forEach(function (a) { a.classList.remove("is-on"); });
        if (map[entry.target.id]) map[entry.target.id].classList.add("is-on");
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  function bindReveal() {
    $$("[data-lv-ex-reveal]").forEach(function (el) { el.classList.add("is-in"); });
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
    } else reveal();
  }

  function onShow(hash) {
    renderRecentLine();
    renderActivity();
    renderForYou();
    renderRecommendSection();
    renderCompare();
    if (!hash || hash === "explore" || hash === "ex-hero") {
      window.scrollTo(0, 0);
      return;
    }
    if (hash.indexOf("ex-item-") === 0) {
      renderDetail(hash.replace("ex-item-", ""));
      return;
    }
    if (hash === "ex-results") {
      if ($("#ex-results") && $("#ex-results").hidden) openResults(state.q, { categoryId: state.categoryId, type: state.type });
      else scrollToId("ex-results");
      return;
    }
    if (hash === "ex-detail" && state.detailId) {
      renderDetail(state.detailId);
      return;
    }
    if (hash.indexOf("ex-") === 0) {
      setTimeout(function () { scrollToId(hash); }, 40);
    }
  }

  function init() {
    if (!$("#explore")) return;
    renderSuggest();
    renderCats();
    renderForYou();
    renderActivity();
    renderCompare();
    renderRecommendSection();
    bindEvents();
    bindNavHighlight();
    bindReveal();
    bindFilmHero();
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "explore") onShow(hash || "explore");
  }

  window.LivonExplore = {
    onShow: onShow,
    openResults: openResults,
    openItem: renderDetail
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
