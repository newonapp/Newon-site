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
    pcat: "",
    tt: "",
    /* 직업훈련 (고용24) search inside 클래스: jobs=1 opens it, jf=org searches 기관명, jt 훈련유형, jm 훈련구분, jp 훈련시작일 범위 */
    jobs: "", jf: "", jt: "", jm: "", jp: "",
    detailId: "",
    viewMode: "list",
    filtersOpen: true,
    /* Explore V1 unified search */
    cat: "",
    age: "",
    shown: 0
  };
  var PAGE = 12, GROUP = 4;
  /* 기존 탐색 화면의 분야·연령 버튼(문장형 검색어)을 통합 필터로 연결 */
  var LEGACY_Q = {
    "교육과 진로": { cat: "learn" }, "커리어와 일": { cat: "career" }, "주거와 생활": { cat: "housing" }, "금융과 생활비": { cat: "money" },
    "가족과 관계": { cat: "relation" }, "건강과 웰니스": { cat: "health" }, "여행과 여가": { cat: "travel" }, "지역 생활": { type: "place", keepType: true },
    "시니어와 돌봄": { cat: "care" }, "생활 상품과 쇼핑": { categoryId: "products" }, "전문가": { type: "expert", keepType: true }
  };
  var prevHash = "";
  var KEY_SCROLL = "livon.exScroll";
  var S = function () { return window.LivonSearch || null; };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  /* stored value must keep the shape the caller expects (old schema / corrupted data → fallback, null entries dropped) */
  function fitShape(v, fb) { if (Array.isArray(fb)) return Array.isArray(v) ? v.filter(function (x) { return x != null; }) : fb; if (fb && typeof fb === "object") return v && typeof v === "object" && !Array.isArray(v) ? v : fb; return v; }
  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return fitShape(raw ? JSON.parse(raw) : fallback, fallback);
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function gnavOffset() {
    return (window.LivonStickyOffset ? window.LivonStickyOffset() : (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h"), 10) || 74) + 52) + 8;
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ? "auto" : "smooth" });
  }
  /* list served by the LIVON Data Platform (visible rows only); the file's own array if the platform is unavailable */
  function items() { return window.LivonScreenData ? window.LivonScreenData.exploreItems() : (Array.isArray(DATA.items) ? DATA.items : []); }
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
  function saveTypeOf(item) { return item && item.type === "place" ? "place" : item && item.type === "program" ? "class" : "content"; }
  function hubSaves() { var h = window.LivonLifeHub; return h && h.saves ? h.saves : null; }
  /* 저장 상태: 라이프 스테이지·오늘의 발견과 같은 공용 id (life-hub:{type}:ex:{id}) */
  function isSaved(id) {
    var it = findItem(id), hs = hubSaves();
    return !!(it && hs && hs.isSaved(saveTypeOf(it), "ex:" + id));
  }
  function saveBtn(item, cls, label) {
    if (!item) return "";
    var on = isSaved(item.id);
    return '<button type="button" class="' + cls + '" data-lh-save="' + saveTypeOf(item) + '" data-lh-id="ex:' + esc(item.id) + '" data-lh-title="' + esc(item.title) +
      '" data-lh-href="#ex-item-' + esc(item.id) + '" data-lh-label="' + esc(label || "저장") + '" aria-pressed="' + on + '" aria-label="' + esc(item.title) + ' 저장">' + (on ? "저장됨" : esc(label || "저장")) + "</button>";
  }
  function sharedSaved() {
    var P = window.LivonPlatform;
    return (P && P.listSaves ? P.listSaves("all") : []).map(function (x) {
      var m = /^life-hub:\w+:ex:(.+)$/.exec(x.id); return m ? { id: m[1], title: x.title || x.label } : null;
    }).filter(Boolean);
  }
  /* 예전 탐색 전용 저장(livon.exSaved · 플랫폼 "ex:{id}")을 공용 id로 한 번 옮깁니다. 키워드 관심 저장(label:)은 그대로 둡니다. */
  function migrateLegacySaves() {
    var P = window.LivonPlatform;
    if (!P || !P.saveItem || !P.listSaves || !P.removeSave || !hubSaves()) return;
    var legacy = savedList(), keep = legacy.filter(function (x) { return !findItem(x.id); });
    if (keep.length !== legacy.length) writeJSON(KEY_SAVED, keep);
    var ids = legacy.map(function (x) { return x.id; }).concat(P.listSaves("all").filter(function (x) { return /^ex:/.test(x.id); }).map(function (x) { return x.id.slice(3); }));
    ids.forEach(function (id) {
      var it = findItem(id); if (!it) return;
      var old = P.listSaves("all").find(function (x) { return x.id === "ex:" + id; });
      if (!isSaved(id)) P.saveItem({ id: "life-hub:" + saveTypeOf(it) + ":ex:" + id, title: it.title, label: it.title, type: "life-" + saveTypeOf(it), href: "#ex-item-" + id, source: "탐색", lifeStage: "", folder: old && old.folder, data: { kind: saveTypeOf(it), refId: "ex:" + id } });
      if (old) P.removeSave(old.id);
    });
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
  var toastTimer = null;
  function toast(text) {
    var n = $("[data-lv-ex-toast]");
    if (!n) {
      n = document.createElement("p");
      n.className = "lv-ex-toast"; n.setAttribute("data-lv-ex-toast", ""); n.setAttribute("role", "status"); n.setAttribute("aria-live", "polite");
      ($("#explore") || document.body).appendChild(n);
    }
    n.textContent = ""; n.hidden = false;
    setTimeout(function () { n.textContent = text; }, 30);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { n.hidden = true; }, 4200);
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
    q = String(q);
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
    var list = (S() && S().RECOMMENDED) || DATA.suggest || [];
    var quick = $("[data-lv-ex-quick]");
    if (quick && S()) {
      var qc = ["housing", "money", "career", "health", "relation", "travel", "startup", "parenting", "care", "hobby"];
      quick.innerHTML = qc.map(function (id) { return "<li><button type=\"button\" data-lv-ex-quick-cat=\"" + id + "\">" + esc(S().catLabel(id)) + "</button></li>"; }).join("") +
        [["policy", "정책·지원"], ["class", "클래스"], ["place", "장소"]].map(function (t) { return "<li><button type=\"button\" data-lv-ex-quick-type=\"" + t[0] + "\">" + t[1] + "</button></li>"; }).join("");
    }
    ac = null; /* 자동완성은 아래 listbox(콤보박스)로 제공합니다 */
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

  /* ───────── autocomplete (current data only) ───────── */
  var acIndex = -1;
  function acList() { return $("#lv-ex-ac-list"); }
  function closeSuggest() {
    var l = acList(), input = $("[data-lv-ex-input]");
    if (l) { l.hidden = true; l.innerHTML = ""; }
    if (input) { input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); }
    acIndex = -1;
  }
  function openSuggest() {
    var l = acList(), input = $("[data-lv-ex-input]");
    if (!l || !input || !S()) return;
    var v = input.value.trim();
    var rows = v ? S().suggest(v, 8) : (trackingOn() ? recentQueries().slice(0, 6).map(function (q) { return { label: q, kind: "최근 검색" }; }) : []);
    if (!v && !rows.length) rows = S().RECOMMENDED.slice(0, 6).map(function (q) { return { label: q, kind: "추천 검색어" }; });
    if (!rows.length) { closeSuggest(); return; }
    acIndex = -1;
    l.innerHTML = rows.map(function (r, i) {
      return "<li role=\"option\" id=\"lv-ex-ac-" + i + "\" aria-selected=\"false\" data-lv-ex-sugg=\"" + esc(r.label) + "\"><span>" + esc(r.label) + "</span><small>" + esc(r.kind) + "</small></li>";
    }).join("");
    l.hidden = false;
    input.setAttribute("aria-expanded", "true");
    input.removeAttribute("aria-activedescendant");
  }
  function moveSuggest(dir) {
    var l = acList(); if (!l || l.hidden) { openSuggest(); return; }
    var opts = $$("[role=option]", l); if (!opts.length) return;
    acIndex = (acIndex + dir + opts.length) % opts.length;
    opts.forEach(function (o, i) { o.setAttribute("aria-selected", i === acIndex ? "true" : "false"); });
    var input = $("[data-lv-ex-input]"); if (input) input.setAttribute("aria-activedescendant", opts[acIndex].id);
    opts[acIndex].scrollIntoView({ block: "nearest" });
  }
  function bindAutocomplete() {
    var input = $("[data-lv-ex-input]");
    if (!input) return;
    input.removeAttribute("list");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", "lv-ex-ac-list");
    input.addEventListener("input", openSuggest);
    input.addEventListener("focus", openSuggest);
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); moveSuggest(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); moveSuggest(-1); }
      else if (e.key === "Escape") { if (acList() && !acList().hidden) { e.preventDefault(); e.stopPropagation(); closeSuggest(); } }
    });
    input.addEventListener("blur", function () { setTimeout(closeSuggest, 150); });
    var l = acList();
    if (l) l.addEventListener("mousedown", function (e) { e.preventDefault(); });
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
    host.innerHTML = "<span class=\"lv-ex-recent__label\">최근 검색</span>" + list.map(function (q) {
      return "<span class=\"lv-ex-rchip\"><button type=\"button\" data-lv-ex-chip=\"" + esc(q) + "\">" + esc(q) + "</button>" +
        "<button type=\"button\" class=\"lv-ex-rchip__del\" data-lv-ex-recent-del=\"" + esc(q) + "\" aria-label=\"최근 검색어 " + esc(q) + " 삭제\">×</button></span>";
    }).join("") +
      " <button type=\"button\" class=\"lv-ex-text-btn\" data-lv-ex-recent-clear>전체 삭제</button>";
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
    /* onboarding profile: Life Event reasons, and no cross-age recommendation (browsing every category stays as it is) */
    var PZ = window.LivonPersonalization, prof = PZ ? PZ.getProfile() : null, recById = {}, allowed = null;
    if (PZ && PZ.hasSignals(prof)) {
      PZ.recommend(prof, { limit: 400 }).items.forEach(function (x) { recById[x.id] = x; });
      allowed = prof.lifeStage ? PZ.allowedIds(prof.lifeStage) : null;
      if (prof.lifeStage) stage = prof.lifeStage;
    }
    var scored = items().map(function (it) {
      var s = 0;
      var reasons = [];
      var fits = !allowed || !!allowed["ex:" + it.id];
      var rec = recById["ex:" + it.id];
      if (rec && rec.reasons[0] && rec.reasons[0].type === "event") { s += 3; reasons.push(rec.why); }
      if (fits) interests.forEach(function (interest) {
        if (scoreItem(it, interest) > 0) {
          s += 3;
          reasons.push("관심 · " + interest);
        }
      });
      if (fits && stage && scoreItem(it, stage) > 0) {
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
    var saved = sharedSaved().map(function (s) { return findItem(s.id) || s; });
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
          saveBtn(item, "lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm") +
          "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" data-lv-ex-compare-id=\"" + esc(item.id) + "\">" + (inCompare ? "비교 중" : "비교하기") + "</button>" +
        "</div>" +
      "</div>" +
    "</article>";
  }

  /* ───────── Explore V1 · unified results (LivonSearch) ───────── */
  var AGES = [["10", "10대"], ["20", "20대"], ["30", "30대"], ["40", "40대"], ["50", "50대"], ["60", "60대"], ["70", "70대+"]];
  var GROUP_ORDER = ["life", "content", "service", "policy", "class", "place", "event", "community", "expert"];
  var GROUP_TITLE = { life: "라이프 스테이지", content: "오늘의 발견 · 콘텐츠", service: "서비스", policy: "정책·지원 · 공식 기관", class: "클래스·교육", place: "장소", event: "행사", community: "커뮤니티", expert: "전문가" };
  function typeValid(t) { var L = S(); return !!(L && L.TYPES.some(function (x) { return x.id === t; })); }
  function ageLabel(id) { var a = AGES.find(function (x) { return x[0] === id; }); return a ? a[1] : ""; }
  function exCatTitle(id) { var c = (DATA.categories || []).find(function (x) { return x.id === id; }); return c ? c.title : ""; }

  /* URL state: #ex-results?q=창업&type=life&cat=startup&age=20&ex=career&region=서울&mode=online&sort=newest */
  function serialize() {
    var parts = [];
    if (state.q) parts.push("q=" + encodeURIComponent(state.q));
    if (state.type && state.type !== "all") parts.push("type=" + encodeURIComponent(state.type));
    if (state.cat) parts.push("cat=" + encodeURIComponent(state.cat));
    if (state.age) parts.push("age=" + encodeURIComponent(state.age));
    if (state.categoryId) parts.push("ex=" + encodeURIComponent(state.categoryId));
    if (state.region) parts.push("region=" + encodeURIComponent(state.region));
    if (state.mode) parts.push("mode=" + encodeURIComponent(state.mode));
    if (state.visit) parts.push("visit=" + encodeURIComponent(state.visit));
    if (state.sort && state.sort !== "relevance") parts.push("sort=" + encodeURIComponent(state.sort));
    if (state.pcat) parts.push("pcat=" + encodeURIComponent(state.pcat));
    if (state.tt) parts.push("tt=" + encodeURIComponent(state.tt));
    if (state.jobs) parts.push("jobs=1");
    if (state.jf) parts.push("jf=org");
    if (state.jt) parts.push("jt=" + encodeURIComponent(state.jt));
    if (state.jm) parts.push("jm=" + encodeURIComponent(state.jm));
    if (state.jp) parts.push("jp=" + encodeURIComponent(state.jp));
    return "ex-results" + (parts.length ? "?" + parts.join("&") : "");
  }
  function parseState(hash) {
    var i = hash.indexOf("?"), qs = i >= 0 ? hash.slice(i + 1) : "", o = {};
    qs.split("&").forEach(function (kv) {
      if (!kv) return;
      var j = kv.indexOf("="), k = j >= 0 ? kv.slice(0, j) : kv, v = j >= 0 ? kv.slice(j + 1) : "";
      try { o[k] = decodeURIComponent(v.replace(/\+/g, " ")); } catch (e) { o[k] = v; }
    });
    if (i < 0 && !qs) return null;
    var L = S();
    state.q = String(o.q || "").slice(0, 80);
    state.type = typeValid(o.type) ? o.type : "all";
    state.cat = L && L.CATS.some(function (c) { return c.id === o.cat; }) ? o.cat : "";
    state.age = /^[1-7]0$/.test(o.age || "") ? o.age : "";
    state.categoryId = L && L.EXCAT[o.ex] ? o.ex : "";
    state.region = (DATA.regions || []).indexOf(o.region) >= 0 ? o.region : "";
    state.mode = o.mode === "online" || o.mode === "offline" ? o.mode : "";
    state.visit = o.visit === "1" ? "1" : "";
    state.sort = o.sort === "newest" ? "newest" : "relevance";
    var PL = window.LivonData && window.LivonData.places;
    state.pcat = PL && PL.CATEGORIES[o.pcat] ? o.pcat : "";
    var TR = window.LivonData && window.LivonData.tour;
    state.tt = TR && TR.TYPES[o.tt] ? o.tt : "";
    var JB = window.LivonData && window.LivonData.jobs;
    state.jobs = o.jobs === "1" ? "1" : "";
    state.jf = o.jf === "org" ? "org" : "";
    state.jt = JB && JB.TYPES[o.jt] ? o.jt : "";
    state.jm = JB && JB.METHODS[o.jm] ? o.jm : "";
    state.jp = JB && JB.PERIODS.indexOf(Number(o.jp)) >= 0 ? String(Number(o.jp)) : "";
    return state;
  }
  function filters() { return { type: state.type, cat: state.cat, age: state.age, exCat: state.categoryId, region: state.region, mode: state.mode, visit: state.visit, sort: state.sort }; }
  function activeFilterCount() { return [state.cat, state.age, state.categoryId, state.region, state.mode, state.visit].filter(Boolean).length; }

  function runSearch() {
    var L = S(); if (!L) return { items: [], counts: { all: 0 }, total: 0, lifeStatus: "error", partial: false };
    var f = filters();
    var res = L.search(state.q, f);
    if (state.visit === "1") res.items = res.items.filter(function (x) { var it = x.item.exploreItem && findItem(x.item.key.slice(3)); return !!(it && it.visit); });
    res.partial = false;
    // multi-word queries from older Explore buttons: fall back to "any word" when every-word matching finds nothing
    var words = String(state.q || "").trim().split(/\s+/).filter(Boolean);
    if (!res.items.length && words.length > 1) {
      var merged = {}, counts = { all: 0 };
      words.forEach(function (w) { L.search(w, f).items.forEach(function (x) { if (!merged[x.item.key] || merged[x.item.key].score < x.score) merged[x.item.key] = x; }); });
      var list = Object.keys(merged).map(function (k) { return merged[k]; }).sort(function (a, b) { return b.score - a.score; });
      words.forEach(function (w) { var c = L.search(w, f).counts; Object.keys(c).forEach(function (k) { counts[k] = Math.max(counts[k] || 0, c[k]); }); });
      if (list.length) { res.items = list; res.total = list.length; res.counts = counts; res.partial = true; }
    }
    return res;
  }

  function renderFilters() {
    var host = $("[data-lv-ex-filters]");
    if (!host) return;
    var L = S(); var cats = L ? L.CATS : [];
    function chip(attr, val, label, on) { return "<button type=\"button\" " + attr + "=\"" + esc(val) + "\" aria-pressed=\"" + (on ? "true" : "false") + "\"" + (on ? " class=\"is-on\"" : "") + ">" + esc(label) + "</button>"; }
    host.innerHTML =
      (state.categoryId ? "<div class=\"lv-ex-filter-group\"><p>탐색 카테고리</p><div class=\"lv-ex-chips\">" + chip("data-lv-ex-filter-ex", "", exCatTitle(state.categoryId) + " ×", true) + "</div></div>" : "") +
      "<div class=\"lv-ex-filter-group\" role=\"group\" aria-label=\"분야\"><p>분야</p><div class=\"lv-ex-chips\">" + chip("data-lv-ex-filter-cat", "", "전체", !state.cat) +
        cats.map(function (c) { return chip("data-lv-ex-filter-cat", c.id, c.label, state.cat === c.id); }).join("") + "</div></div>" +
      "<div class=\"lv-ex-filter-group\" role=\"group\" aria-label=\"연령대\"><p>연령대</p><div class=\"lv-ex-chips\">" + chip("data-lv-ex-filter-age", "", "전체", !state.age) +
        AGES.map(function (a) { return chip("data-lv-ex-filter-age", a[0], a[1], state.age === a[0]); }).join("") + "</div>" +
        "<p class=\"lv-ex-hint\">연령대를 고르면 연령 정보가 있는 라이프 스테이지 주제와 관련 콘텐츠만 표시합니다.</p></div>" +
      "<div class=\"lv-ex-filter-group\" role=\"group\" aria-label=\"지역\"><p>지역</p><div class=\"lv-ex-chips\">" + chip("data-lv-ex-filter-region", "", "전체", !state.region) +
        (DATA.regions || []).map(function (r) { return chip("data-lv-ex-filter-region", r, r, state.region === r); }).join("") + "</div>" +
        "<p class=\"lv-ex-hint\">지역 정보가 있는 장소·기관만 거릅니다.</p></div>" +
      "<div class=\"lv-ex-filter-group\" role=\"group\" aria-label=\"방식\"><p>방식</p><div class=\"lv-ex-chips\">" + chip("data-lv-ex-filter-mode", "", "전체", !state.mode) +
        chip("data-lv-ex-filter-mode", "online", "온라인", state.mode === "online") + chip("data-lv-ex-filter-mode", "offline", "오프라인", state.mode === "offline") +
        chip("data-lv-ex-filter-visit", "1", "방문 서비스", state.visit === "1") + "</div></div>" +
      "<div class=\"lv-ex-actions\"><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-lv-ex-reset" + (activeFilterCount() ? "" : " disabled") + ">필터 초기화</button></div>" +
      "<p class=\"lv-ex-hint\">가격·평점·인기순은 확인된 데이터가 없어 제공하지 않습니다.</p>";
    var tgl = $("[data-lv-ex-toggle-filters]");
    if (tgl) tgl.setAttribute("data-count", String(activeFilterCount()));
  }

  function renderTabs(counts) {
    var host = $("[data-lv-ex-tabs]");
    var L = S();
    if (!host || !L) return;
    host.innerHTML = L.TYPES.map(function (t) {
      var n = counts[t.id] || 0, on = state.type === t.id;
      return "<button type=\"button\" role=\"tab\" id=\"lv-ex-tab-" + t.id + "\" aria-controls=\"lv-ex-panel\" aria-selected=\"" + on + "\" tabindex=\"" + (on ? "0" : "-1") + "\" data-lv-ex-filter-type=\"" + t.id + "\"" +
        (on ? " class=\"is-on\"" : "") + (n || t.id === "all" ? "" : " data-empty=\"1\"") + ">" + esc(t.label) + " <span>" + n + "</span></button>";
    }).join("");
  }

  function aiPayload() {
    var parts = [state.type !== "all" ? S().typeLabel(state.type) : "", state.cat ? S().catLabel(state.cat) : "", state.categoryId ? exCatTitle(state.categoryId) : ""].filter(Boolean).join(" · ");
    return { source: "explore", q: state.q ? "‘" + state.q + "’에 대해 찾고 있어요. 어디서부터 알아보면 좋을지 정리해 줘." : "지금 필요한 생활 정보를 찾고 있어요. 어떤 것부터 보면 좋을지 알려 줘.",
      stage: state.age, stageLabel: ageLabel(state.age), topicId: "search", topicTitle: state.q || "", category: parts, url: "#" + serialize() };
  }
  function aiBtn(cls, text) { return "<button type=\"button\" class=\"" + cls + "\" data-lh-ai=\"" + esc(JSON.stringify(aiPayload())) + "\">" + esc(text || "LIVON AI에게 물어보기") + "</button>"; }

  function unifiedCard(hit) {
    var x = hit.item;
    if (x.exploreItem) { var it = findItem(x.key.slice(3)); if (it) return cardHtml(it, hit.via ? "‘" + hit.via + "’ 관련" : "").replace("<h3>", "<h4>").replace("</h3>", "</h4>"); }
    var save = x.save ? "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-lh-save=\"" + esc(x.save.type) + "\" data-lh-id=\"" + esc(x.save.id) + "\" data-lh-title=\"" + esc(x.save.title) +
      "\" data-lh-href=\"" + esc(x.save.href) + "\" data-lh-stage=\"" + esc(x.save.stage || "") + "\" data-lh-label=\"저장\" aria-pressed=\"false\" aria-label=\"" + esc(x.title) + " 저장\">저장</button>" : "";
    /* real-data entries: the button says what the link is; no URL → no button (never a fake apply/booking) */
    var goLabel = x.realData && x.actionLabel ? x.actionLabel : "공식 사이트";
    var go = x.external
      ? (x.href ? "<a class=\"lv-ex-btn " + (x.tel ? "lv-ex-btn--outline" : "lv-ex-btn--dark") + " lv-ex-btn--sm\" href=\"" + esc(x.href) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + esc(goLabel) + " <span aria-hidden=\"true\">↗</span><span class=\"visually-hidden\"> (새 창)</span></a>" : "")
      : "<a class=\"lv-ex-btn lv-ex-btn--dark lv-ex-btn--sm\" href=\"" + esc(x.href) + "\">자세히 보기<span class=\"visually-hidden\">: " + esc(x.title) + "</span></a>";
    if (x.realData && x.entityId && !save) {
      var LPs = window.LivonPlatform, sv = !!(LPs && LPs.listSaves && LPs.listSaves("all").some(function (y) { return y.id === "ext:" + x.entityId; }));
      save = "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-livon-entity-save=\"" + esc(x.entityId) + "\" aria-pressed=\"" + sv + "\">" + (sv ? "저장됨" : "저장") + "</button>";
    }
    var facts = x.facts && x.facts.length ? "<details class=\"lv-ex-card__more\"><summary>상세 정보</summary>" + x.facts.map(function (f) { return "<p class=\"lv-ex-card__reason\">" + esc(f) + "</p>"; }).join("") +
      (x.todo && (x.todo.deadline || x.todo.start) ? "<div class=\"lv-ex-actions\">" +
        (x.todo.deadline ? "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" data-livon-entity-todo=\"" + esc(x.entityId) + "\" data-kind=\"deadline\">접수 마감일을 할 일에 추가</button>" : "") +
        (x.todo.start ? "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" data-livon-entity-todo=\"" + esc(x.entityId) + "\" data-kind=\"start\">교육 시작일을 할 일에 추가</button>" : "") + "</div>" : "") +
      "<p class=\"lv-ex-hint\">" + esc(x.attribution || "") + "</p></details>" : "";
    var stages = (x.stageIds || []).slice(0, 3).map(function (id) { return "<span class=\"lv-ex-tag\">" + esc(ageLabel(id)) + "</span>"; }).join("");
    return "<article class=\"lv-ex-card lv-ex-card--text lv-ex-card--" + esc(x.type) + "\"" + (x.external ? "" : " data-lv-ex-go=\"" + esc(x.href) + "\"") + (x.eventId ? " data-lv-le-open=\"" + esc(x.eventId) + "\"" : "") + ">" +
      (x.img ? "<a class=\"lv-ex-card__media\" href=\"" + esc(x.external ? x.href : x.href) + "\" tabindex=\"-1\" aria-hidden=\"true\"" + (x.external ? " target=\"_blank\" rel=\"noopener noreferrer\"" : "") + "><img src=\"" + esc(x.img) + "\" alt=\"\" loading=\"lazy\" width=\"640\" height=\"400\" /></a>" : "") +
      "<div class=\"lv-ex-card__body\"><div class=\"lv-ex-card__meta\">" + (x.official ? "<span class=\"lv-ex-badge\">공식 출처</span>" : "") + (x.trustLabel ? "<span class=\"lv-ex-badge\">" + esc(x.trustLabel) + "</span>" : "") + "<span>" + esc(x.typeLabel) + "</span><span>" + esc(x.meta || "") + "</span>" + (x.status ? "<span>" + esc(x.status) + "</span>" : "") + "</div>" +
      "<h4>" + (x.external ? esc(x.title) : "<a href=\"" + esc(x.href) + "\">" + esc(x.title) + "</a>") + "</h4>" +
      "<p>" + esc(x.desc || "") + "</p>" + (stages ? "<p class=\"lv-ex-tags\">" + stages + "</p>" : "") +
      (hit.via ? "<p class=\"lv-ex-card__reason\">‘" + esc(hit.via) + "’ 관련</p>" : "") + facts +
      "<div class=\"lv-ex-card__acts\">" + (x.tel ? "<a class=\"lv-ex-btn lv-ex-btn--dark lv-ex-btn--sm\" href=\"tel:" + esc(String(x.tel).replace(/[^0-9+]/g, "")) + "\">전화 문의</a>" : "") + go + save + "</div></div></article>";
  }

  function typeEmpty(type) {
    if (type === "expert") return "<div class=\"lv-ex-empty\"><span class=\"lv-ex-badge lv-ex-badge--soon\">준비 중</span><h3>현재 등록된 전문가가 없습니다.</h3><p>전문가 프로필·상담 연결은 검증 기준과 함께 순차적으로 준비하고 있습니다. 가짜 프로필이나 평점을 만들지 않습니다.</p>" +
      "<div class=\"lv-ex-actions\"><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--sm\" data-lv-ex-filter-type=\"policy\">공식 상담 기관 보기</button>" + aiBtn("lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm") + "</div></div>";
    if (type === "event") return "<div class=\"lv-ex-empty\"><span class=\"lv-ex-badge lv-ex-badge--soon\">준비 중</span><h3>행사 데이터를 준비하고 있습니다.</h3><p>LIVON은 행사 일정을 자동으로 만들지 않습니다. 공식 캘린더에서 최신 행사를 확인하는 방법을 안내합니다.</p>" +
      "<div class=\"lv-ex-actions\"><a class=\"lv-ex-btn lv-ex-btn--sm\" href=\"#today/event-howto\">행사 찾는 법 보기</a><a class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" href=\"#ex-item-ex-culture\">문화포털 안내</a></div></div>";
    if (type === "community") return "<div class=\"lv-ex-empty\"><span class=\"lv-ex-badge lv-ex-badge--soon\">결과 없음</span><h3>이 검색어와 관련된 커뮤니티 글이 없습니다.</h3><p>커뮤니티 글은 현재 이 기기에 저장된 글만 검색됩니다.</p>" +
      "<div class=\"lv-ex-actions\"><a class=\"lv-ex-btn lv-ex-btn--sm\" href=\"#community\">커뮤니티 둘러보기</a><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" data-lh-compose=\"question\">질문 남기기</button></div></div>";
    return "";
  }
  function noResults() {
    var L = S();
    return "<div class=\"lv-ex-empty lv-ex-noresult\" role=\"status\"><span class=\"lv-ex-badge lv-ex-badge--soon\">결과 없음</span>" +
      "<h3>" + (state.q ? "‘" + esc(state.q) + "’ 검색 결과가 없습니다." : "조건에 맞는 결과가 없습니다.") + "</h3>" +
      "<ul class=\"lv-ex-tips\"><li>맞춤법이나 띄어쓰기를 확인하거나 더 짧은 단어로 검색해 보세요.</li>" + (activeFilterCount() || state.type !== "all" ? "<li>선택한 필터를 줄이면 더 많은 결과를 볼 수 있습니다.</li>" : "") + "</ul>" +
      "<div class=\"lv-ex-actions\">" + (activeFilterCount() || state.type !== "all" ? "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--sm\" data-lv-ex-reset-all>필터 초기화</button>" : "") + aiBtn("lv-ex-btn lv-ex-btn--dark lv-ex-btn--sm") + "</div>" +
      "<p class=\"lv-ex-note\">이런 주제는 어때요</p><div class=\"lv-ex-chips\">" + (L ? L.RECOMMENDED : []).map(function (q) { return "<button type=\"button\" data-lv-ex-chip=\"" + esc(q) + "\">" + esc(q) + "</button>"; }).join("") + "</div>" +
      "<p class=\"lv-ex-note\">다른 분야 둘러보기</p><div class=\"lv-ex-chips\">" + (L ? L.CATS : []).slice(0, 8).map(function (c) { return "<button type=\"button\" data-lv-ex-quick-cat=\"" + c.id + "\">" + esc(c.label) + "</button>"; }).join("") + "</div></div>";
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
    var res = runSearch();
    var titleBits = state.q ? "“" + state.q + "” 검색 결과" : (state.cat ? S().catLabel(state.cat) + " 탐색" : state.categoryId ? exCatTitle(state.categoryId) + " 탐색" : state.age ? ageLabel(state.age) + " 탐색" : state.type !== "all" ? S().typeLabel(state.type) + " 탐색" : "탐색 결과");
    if (qEl) qEl.textContent = titleBits;
    var cond = [state.type !== "all" ? S().typeLabel(state.type) : "", state.cat ? S().catLabel(state.cat) : "", state.categoryId ? exCatTitle(state.categoryId) : "", ageLabel(state.age), state.region, state.mode === "online" ? "온라인" : state.mode === "offline" ? "오프라인" : "", state.visit ? "방문 서비스" : ""].filter(Boolean);
    if (countEl) countEl.textContent = res.total + "개 결과" + (cond.length ? " · " + cond.join(" · ") : "") + (res.partial ? " · 일부 단어가 일치하는 결과" : "");
    if (sortEl) sortEl.value = state.sort;
    renderFilters();
    renderTabs(res.counts);
    var status = res.lifeStatus === "ready" ? "" : res.lifeStatus === "error"
      ? "<div class=\"lv-ex-empty lv-ex-error\" role=\"alert\"><span class=\"lv-ex-badge\">불러오기 실패</span><h3>라이프 스테이지 주제를 불러오지 못했습니다.</h3><p>지금은 오늘의 발견·탐색 항목만 검색됩니다. 네트워크를 확인한 뒤 다시 시도해 주세요.</p><div class=\"lv-ex-actions\"><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--sm\" data-lv-ex-retry>다시 시도</button></div></div>"
      : "<p class=\"lv-ex-note lv-ex-loading\" role=\"status\"><span class=\"lv-ex-spinner\" aria-hidden=\"true\"></span>라이프 스테이지 주제를 불러오는 중입니다. 잠시 후 결과가 더해집니다.</p>";
    var viewBar = "<div class=\"lv-ex-actions lv-ex-viewbar\">" +
      "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--sm" + (state.viewMode !== "map" ? "" : " lv-ex-btn--ghost") + "\" data-lv-ex-view=\"list\" aria-pressed=\"" + (state.viewMode !== "map") + "\">목록</button>" +
      "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--sm" + (state.viewMode === "map" ? "" : " lv-ex-btn--ghost") + "\" data-lv-ex-view=\"map\" aria-pressed=\"" + (state.viewMode === "map") + "\">지도</button>" +
      "<span class=\"lv-ex-note\">위치 데이터가 확인된 항목만 지도에 연결합니다.</span></div>";
    var body = "";
    if (state.viewMode === "map") {
      var mappable = res.items.map(function (x) { return x.item.exploreItem ? findItem(x.item.key.slice(3)) : null; }).filter(function (it) { return it && (it.mapQuery || it.address); });
      body = "<div class=\"lv-ex-empty\"><span class=\"lv-ex-badge lv-ex-badge--soon\">지도 보기 · 외부 지도 연결</span><h3>위치가 확인된 결과</h3>" +
        "<p>지도 SDK는 연결하지 않았습니다. 주소가 확인된 항목만 외부 지도로 엽니다. 임의 좌표는 표시하지 않습니다.</p><p class=\"lv-ex-note\">위치 확인 " + mappable.length + " / 결과 " + res.total + "</p>" +
        (mappable.length ? "<ul class=\"lv-ex-manage-list\">" + mappable.slice(0, 12).map(function (it) {
          var link = "https://map.kakao.com/?q=" + encodeURIComponent(it.mapQuery || it.address);
          return "<li><div><strong>" + esc(it.title) + "</strong><p>" + esc(it.address || it.mapQuery) + "</p></div><div class=\"lv-ex-actions\"><a class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" href=\"" + esc(link) + "\" target=\"_blank\" rel=\"noopener noreferrer\">지도</a>" +
            "<a class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" href=\"#ex-item-" + esc(it.id) + "\">상세</a></div></li>";
        }).join("") + "</ul>" : "<p>이 결과에는 주소가 확인된 항목이 없습니다.</p>") + "</div>";
    } else if (!res.items.length) {
      body = placeSearchOn() || tourSearchOn() || jobSearchOn() ? "" : typeEmpty(state.type) || noResults();
    } else if (state.type === "all") {
      var groups = {};
      res.items.forEach(function (x) { (groups[x.item.type] = groups[x.item.type] || []).push(x); });
      body = GROUP_ORDER.filter(function (t) { return groups[t]; }).map(function (t) {
        var list = groups[t];
        return "<section class=\"lv-ex-group\" aria-labelledby=\"lv-ex-g-" + t + "\"><div class=\"lv-ex-group__head\"><h3 id=\"lv-ex-g-" + t + "\">" + esc(GROUP_TITLE[t]) + " <span>" + list.length + "</span></h3>" +
          (list.length > GROUP ? "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" data-lv-ex-filter-type=\"" + t + "\">" + esc(GROUP_TITLE[t]) + " 더 보기 (" + list.length + ")</button>" : "") + "</div>" +
          "<div class=\"lv-ex-card-grid\">" + list.slice(0, GROUP).map(unifiedCard).join("") + "</div></section>";
      }).join("");
    } else {
      var shown = res.items.slice(0, state.shown || PAGE);
      var XP = window.LivonData && window.LivonData.experts, cov = state.type === "expert" && XP ? XP.coverage() : [];
      if (cov.length) body = "<p class=\"lv-ex-hint\">공공기관에서 공개한 상담 정보를 순차적으로 연결하고 있습니다. 현재 연결: " + esc(cov.join(", ")) + " · LIVON이 자격·경력을 검증한 전문가 목록이 아닙니다.</p>";
      body = (body || "") + "<div class=\"lv-ex-card-grid\">" + shown.map(unifiedCard).join("") + "</div>" +
        (res.items.length > shown.length ? "<div class=\"lv-ex-more\"><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline\" data-lv-ex-more>더 보기 (" + shown.length + " / " + res.items.length + ")</button></div>" : "");
    }
    var help = res.items.length ? "<div class=\"lv-ex-aihelp\"><p><strong>원하는 정보를 찾지 못했나요?</strong> 검색어와 조건을 LIVON AI에 초안으로 옮겨 드립니다. 보내기 전까지 전송되지 않습니다.</p>" + aiBtn("lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm") + "</div>" : "";
    listHost.innerHTML = status + viewBar + "<div id=\"lv-ex-panel\" role=\"tabpanel\" aria-labelledby=\"lv-ex-tab-" + esc(state.type) + "\">" + (placeSearchOn() ? placeSearchShell() : "") + (tourSearchOn() ? tourShell() : "") + (jobSearchOn() ? jobShell() : "") + body + "</div>" + help;
    if (placeSearchOn()) runPlaceSearch(null, 1);
    if (tourSearchOn()) runTour(null, 1);
    if (jobSearchOn()) runJobs(1);
    var hs = hubSaves(); if (hs) hs.refresh();
  }

  /* ───────── Kakao Local place search (server route; shown only when the provider is connected) ─────────
     A position is asked for only when the user presses the button, used for that one request (rounded to ≈100 m
     by LivonData.places), and never stored. Without it LIVON shows no "near me" results. */
  var placeRun = 0, placeMemo = {};
  function PLC() { var D = window.LivonData; return D && D.places && D.places.configured() ? D.places : null; }
  function placeSearchOn() { return state.viewMode !== "map" && state.type === "place" && !!PLC() && !!(state.q || state.pcat); }
  function placeSearchShell() {
    var P = PLC();
    var what = state.pcat ? P.CATEGORIES[state.pcat] : "‘" + state.q + "’";
    return "<section class=\"lv-ex-group\" data-lv-ex-kakao aria-labelledby=\"lv-ex-g-kakao\"><div class=\"lv-ex-group__head\"><h3 id=\"lv-ex-g-kakao\">" + esc(what) + " 장소 검색</h3></div>" +
      "<p class=\"lv-ex-hint\">장소 정보 출처: Kakao Local (민간 지도 플랫폼) · 공공기관 공식 데이터가 아닙니다 · 영업시간·평점·가격은 제공되지 않습니다.</p>" +
      "<div class=\"lv-ex-actions\" role=\"group\" aria-label=\"위치 기준 검색\"><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-lv-ex-near>내 위치 기준으로 찾기</button>" +
      "<label class=\"lv-ex-hint\">반경 <select data-lv-ex-radius>" + P.RADII.map(function (r) { return "<option value=\"" + r + "\"" + (r === 5000 ? " selected" : "") + ">" + (r < 1000 ? r + "m" : r / 1000 + "km") + "</option>"; }).join("") + "</select></label></div>" +
      "<p class=\"lv-ex-hint\">위치는 이 검색에만 쓰이고 저장되지 않습니다. 약 100m 단위로 줄여서 보냅니다.</p>" +
      "<div data-lv-ex-kakao-list></div></section>";
  }
  function placeCard(e) {
    var D = window.LivonData, a = D.action(e), loc = e.location || {};
    var LP = window.LivonPlatform, saved = !!(LP && LP.listSaves && LP.listSaves("all").some(function (x) { return x.id === "ext:" + e.id; }));
    return "<article class=\"lv-ex-card lv-ex-card--text lv-ex-card--place lv-data-card\" data-livon-entity=\"" + esc(e.id) + "\"><div class=\"lv-ex-card__body\">" +
      "<div class=\"lv-ex-card__meta\"><span>장소</span><span>" + esc(e.placeType || "") + "</span></div>" +
      "<h4>" + esc(e.title) + "</h4>" +
      "<p>" + esc(loc.roadAddress || loc.address || "") + "</p>" +
      ((e.contact && e.contact.phone) || e.distanceMeters != null ? "<p class=\"lv-ex-card__reason\">" + esc([e.contact && e.contact.phone, e.distanceMeters != null ? "거리 " + D.ui.distance(e.distanceMeters) : ""].filter(Boolean).join(" · ")) + "</p>" : "") +
      "<div class=\"lv-ex-card__acts\">" + (a ? "<a class=\"lv-ex-btn lv-ex-btn--dark lv-ex-btn--sm\" href=\"" + esc(a.url) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + esc(a.label) + " <span aria-hidden=\"true\">↗</span><span class=\"visually-hidden\"> (새 창)</span></a>" : "") +
      "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-livon-entity-save=\"" + esc(e.id) + "\" aria-pressed=\"" + saved + "\">" + (saved ? "저장됨" : "저장") + "</button></div></div></article>";
  }
  function placeMsg(host, text, append) {
    var html = "<p class=\"lv-ex-note\" role=\"status\">" + esc(text) + "</p>";
    if (append) host.insertAdjacentHTML("beforeend", html); else host.innerHTML = html;
  }
  /* coords: only from the button below (never stored); page: 1..3 (Kakao exposes at most 45 results) */
  function runPlaceSearch(coords, page, radius) {
    var P = PLC(), host = $("[data-lv-ex-kakao-list]");
    if (!P || !host) return;
    if (!state.q && !coords) { placeMsg(host, "가까운 " + P.CATEGORIES[state.pcat] + " 찾기: ‘내 위치 기준으로 찾기’를 누르거나, 지역명과 함께 검색해 주세요 (예: ‘마포 " + P.CATEGORIES[state.pcat] + "’). 위치 없이 ‘내 주변’ 결과를 만들지 않습니다."); return; }
    var run = ++placeRun;
    if (page === 1) placeMsg(host, "장소를 찾는 중입니다…");
    /* keyword pages are reused within this page view (re-renders); position-based results are never kept */
    var memoKey = coords ? "" : [state.q, state.pcat, page].join("|");
    var job = memoKey && placeMemo[memoKey] ? placeMemo[memoKey] : P.search({ query: state.q, category: state.pcat, coords: coords, radius: radius, page: page });
    if (memoKey) { placeMemo[memoKey] = job; job.catch(function () { delete placeMemo[memoKey]; }); }
    job.then(function (r) {
      if (run !== placeRun) return;
      var more = host.querySelector("[data-lv-ex-kakao-more]"); if (more) more.parentNode.removeChild(more);
      if (page === 1) host.innerHTML = r.items.length ? "<p class=\"lv-ex-hint\">" + (r.nearby ? "거리순 · 반경 " + ((radius || 5000) < 1000 ? (radius || 5000) + "m" : (radius || 5000) / 1000 + "km") : "검색어 기준") + "</p><div class=\"lv-ex-card-grid\" data-lv-ex-kakao-grid></div>" : "";
      if (!r.items.length && page === 1) { placeMsg(host, "검색된 장소가 없습니다. 다른 검색어나 지역명을 넣어 보세요."); return; }
      var grid = host.querySelector("[data-lv-ex-kakao-grid]");
      if (grid) grid.insertAdjacentHTML("beforeend", r.items.map(placeCard).join(""));
      if (r.hasMore) host.insertAdjacentHTML("beforeend", "<div class=\"lv-ex-more\" data-lv-ex-kakao-more><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline\" data-lv-ex-kakao-next=\"" + (page + 1) + "\"" + (r.nearby ? " data-near=\"1\"" : "") + ">장소 더 보기</button></div>");
    }).catch(function () {
      if (run !== placeRun) return;
      placeMsg(host, "지금 장소 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    });
  }
  function withPosition(done, hostSel) {
    var host = $(hostSel || "[data-lv-ex-kakao-list]");
    if (!navigator.geolocation) { if (host) placeMsg(host, "이 브라우저에서는 위치를 사용할 수 없습니다. 지역명과 함께 검색해 주세요."); return; }
    navigator.geolocation.getCurrentPosition(function (pos) {
      done({ lat: pos.coords.latitude, lng: pos.coords.longitude });           /* passed on, not kept */
    }, function () {
      if (host) placeMsg(host, "위치를 사용할 수 없어 주변 검색을 하지 않았습니다. 지역명과 함께 검색해 주세요 (예: ‘성수동 카페’).");
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  }
  document.addEventListener("click", function (ev) {
    var near = ev.target.closest && ev.target.closest("[data-lv-ex-near]");
    var next = ev.target.closest && ev.target.closest("[data-lv-ex-kakao-next]");
    if (!near && !next) return;
    ev.preventDefault();
    var sel = $("[data-lv-ex-radius]"), radius = sel ? Number(sel.value) : 5000;
    if (near) { withPosition(function (c) { runPlaceSearch(c, 1, radius); }); return; }
    var pg = Number(next.getAttribute("data-lv-ex-kakao-next")) || 2;
    if (next.getAttribute("data-near")) withPosition(function (c) { runPlaceSearch(c, pg, radius); });
    else runPlaceSearch(null, pg);
  });

  /* ───────── 한국관광공사 TourAPI 관광정보 (shown next to the Kakao block, never merged with it) ─────────
     Kakao = 어디에 있는지·거리 / TourAPI = 무엇인지(개요·이용 정보·공공누리 사진). Detail and photos load only when opened. */
  var tourRun = 0, tourMemo = {};
  function TRC() { var D = window.LivonData; return D && D.tour && D.tour.configured() ? D.tour : null; }
  function tourRegion() { var T = TRC(); return T && T.REGIONS.indexOf(state.region) >= 0 ? state.region : ""; }
  function tourSearchOn() { return state.viewMode !== "map" && state.type === "place" && !!TRC() && !!(state.q || state.tt || tourRegion()); }
  function tourShell() {
    var T = TRC();
    var what = state.q ? "‘" + state.q + "’" : state.tt ? T.TYPES[state.tt] : tourRegion();
    return "<section class=\"lv-ex-group\" data-lv-ex-tour aria-labelledby=\"lv-ex-g-tour\"><div class=\"lv-ex-group__head\"><h3 id=\"lv-ex-g-tour\">" + esc(what) + " 관광정보</h3></div>" +
      "<p class=\"lv-ex-hint\">관광지·문화시설·레포츠·숙박의 소개와 이용 정보 · 출처: ⓒ한국관광공사 · 가격·예약 가능 여부·평점은 제공되지 않습니다.</p>" +
      "<div class=\"lv-ex-actions\" role=\"group\" aria-label=\"관광정보 위치 기준 검색\"><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-lv-ex-tour-near>내 위치 기준 관광정보</button></div>" +
      "<p class=\"lv-ex-hint\">위치는 이 검색에만 쓰이고 저장되지 않습니다. 약 100m 단위로 줄여서 주소창이 아닌 요청 본문으로 보냅니다.</p>" +
      "<div data-lv-ex-tour-list></div></section>";
  }
  function tourCard(e) {
    var loc = e.location || {};
    var LP = window.LivonPlatform, saved = !!(LP && LP.listSaves && LP.listSaves("all").some(function (x) { return x.id === "ext:" + e.id; }));
    var D = window.LivonData;
    return "<article class=\"lv-ex-card lv-ex-card--text lv-ex-card--place lv-data-card\" data-livon-entity=\"" + esc(e.id) + "\"><div class=\"lv-ex-card__body\">" +
      "<div class=\"lv-ex-card__meta\"><span>관광정보</span><span>" + esc(e.placeType || "") + "</span></div>" +
      "<h4>" + esc(e.title) + "</h4>" +
      "<p>" + esc([loc.address, loc.detailAddress].filter(Boolean).join(" ")) + "</p>" +
      ((e.contact && e.contact.phone) || e.distanceMeters != null ? "<p class=\"lv-ex-card__reason\">" + esc([e.contact && e.contact.phone, e.distanceMeters != null ? "거리 " + D.ui.distance(e.distanceMeters) : ""].filter(Boolean).join(" · ")) + "</p>" : "") +
      "<div class=\"lv-ex-card__acts\"><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--dark lv-ex-btn--sm\" data-lv-ex-tour-open=\"" + esc(e.providerId) + "\" aria-expanded=\"false\">상세 정보</button>" +
      "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-livon-entity-save=\"" + esc(e.id) + "\" aria-pressed=\"" + saved + "\">" + (saved ? "저장됨" : "저장") + "</button></div>" +
      "<div data-lv-ex-tour-detail hidden></div></div></article>";
  }
  function photoFigure(ph, T) {
    return "<figure class=\"lv-ex-tour-photo\" style=\"margin:0 0 12px\"><img src=\"" + esc(ph.url) + "\" alt=\"" + esc(ph.name || "") + "\" loading=\"lazy\" style=\"width:100%;height:auto;object-fit:contain;display:block\" />" +
      "<figcaption class=\"lv-ex-hint\">" + esc([ph.credit, ph.licenseLabel].filter(Boolean).join(" · ")) + " · <a href=\"" + esc(T.POLICY_URL) + "\" target=\"_blank\" rel=\"noopener noreferrer\">저작권 정책<span class=\"visually-hidden\"> (새 창)</span></a></figcaption></figure>";
  }
  /* only rows that have a value — no "정보 없음" placeholders */
  function tourDetailHtml(e) {
    var T = TRC(), loc = e.location || {}, rows = [];
    function row(label, value) { if (value) rows.push("<p class=\"lv-ex-card__reason\"><strong>" + esc(label) + "</strong> " + esc(value) + "</p>"); }
    row("분류", e.placeType);
    row("주소", [loc.address, loc.detailAddress].filter(Boolean).join(" "));
    row("전화", e.contact && e.contact.phone);
    (e.info || []).forEach(function (r) { row(r.label, r.value); });
    var links = [e.homepageUrl ? "<a class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" href=\"" + esc(e.homepageUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">관광정보에 기재된 홈페이지 <span aria-hidden=\"true\">↗</span><span class=\"visually-hidden\"> (새 창)</span></a>" : "",
      e.reservationUrl ? "<a class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" href=\"" + esc(e.reservationUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">예약 안내 페이지 <span aria-hidden=\"true\">↗</span><span class=\"visually-hidden\"> (새 창)</span></a>" : ""].join("");
    return (e.photos && e.photos[0] ? photoFigure(e.photos[0], T) : "") +
      (e.description ? "<p>" + esc(e.description) + "</p>" : "") +
      (rows.length ? "<div class=\"lv-ex-tour-rows\">" + rows.join("") + "</div>" : "") +
      (links ? "<div class=\"lv-ex-actions\">" + links + "</div>" : "") +
      "<div class=\"lv-ex-actions\"><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" data-lv-ex-tour-photos=\"" + esc(e.providerId) + "\">사진 더 보기</button></div><div data-lv-ex-tour-photo-list></div>" +
      "<p class=\"lv-ex-hint\">" + esc(e.source && e.source.attribution || "출처: ⓒ한국관광공사") + (e.source && e.source.updatedAt ? " · 출처 수정일 " + esc(window.LivonData.ui.day(e.source.updatedAt)) : "") +
        " · 이용 시간·요금 등은 방문 전 해당 기관에 확인하세요. · <a href=\"" + esc(T.POLICY_URL) + "\" target=\"_blank\" rel=\"noopener noreferrer\">저작권 정책<span class=\"visually-hidden\"> (새 창)</span></a></p>";
  }
  function runTour(coords, page, radius) {
    var T = TRC(), host = $("[data-lv-ex-tour-list]");
    if (!T || !host) return;
    var run = ++tourRun;
    if (!state.q && !tourRegion() && !coords) { placeMsg(host, T.TYPES[state.tt] + " 관광정보는 지역 필터를 고르거나 ‘내 위치 기준 관광정보’를 누르면 보입니다. 위치 없이 ‘내 주변’ 결과를 만들지 않습니다."); return; }
    if (page === 1) placeMsg(host, "관광정보를 불러오는 중입니다…");
    var memoKey = coords ? "" : [state.q, tourRegion(), state.tt, page].join("|");
    var job = memoKey && tourMemo[memoKey] ? tourMemo[memoKey] : T.search({ query: state.q, region: state.q ? "" : tourRegion(), type: state.tt, coords: coords, radius: radius, page: page });
    if (memoKey) { tourMemo[memoKey] = job; job.catch(function () { delete tourMemo[memoKey]; }); }
    job.then(function (r) {
      if (run !== tourRun) return;
      var more = host.querySelector("[data-lv-ex-tour-more]"); if (more) more.parentNode.removeChild(more);
      if (page === 1) host.innerHTML = r.items.length ? "<p class=\"lv-ex-hint\">" + (r.nearby ? "거리순" : state.q ? "검색어 기준" : "지역 기준") + (typeof r.total === "number" ? " · 전체 " + r.total + "건" : "") + "</p><div class=\"lv-ex-card-grid\" data-lv-ex-tour-grid></div>" : "";
      if (!r.items.length && page === 1) { placeMsg(host, "관광정보가 없습니다. 다른 검색어나 지역을 골라 보세요."); return; }
      var grid = host.querySelector("[data-lv-ex-tour-grid]");
      if (grid) grid.insertAdjacentHTML("beforeend", r.items.map(tourCard).join(""));
      if (r.hasMore) host.insertAdjacentHTML("beforeend", "<div class=\"lv-ex-more\" data-lv-ex-tour-more><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline\" data-lv-ex-tour-next=\"" + (page + 1) + "\"" + (r.nearby ? " data-near=\"1\"" : "") + ">관광정보 더 보기</button></div>");
    }).catch(function (err) {
      if (run !== tourRun) return;
      placeMsg(host, err && err.status === 503 ? "관광정보 호출 한도를 넘었거나 아직 연결되지 않았습니다. 잠시 후 다시 시도해 주세요." : "지금 관광정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    });
  }
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    var near = t.closest && t.closest("[data-lv-ex-tour-near]"), next = t.closest && t.closest("[data-lv-ex-tour-next]");
    var open = t.closest && t.closest("[data-lv-ex-tour-open]"), photos = t.closest && t.closest("[data-lv-ex-tour-photos]");
    if (!near && !next && !open && !photos) return;
    ev.preventDefault();
    var T = TRC(); if (!T) return;
    if (near) { withPosition(function (c) { runTour(c, 1, 5000); }, "[data-lv-ex-tour-list]"); return; }
    if (next) {
      var pg = Number(next.getAttribute("data-lv-ex-tour-next")) || 2;
      if (next.getAttribute("data-near")) withPosition(function (c) { runTour(c, pg, 5000); }, "[data-lv-ex-tour-list]"); else runTour(null, pg);
      return;
    }
    var card = t.closest("[data-livon-entity]");
    if (open) {
      var box = card && card.querySelector("[data-lv-ex-tour-detail]");
      if (!box) return;
      var expanded = open.getAttribute("aria-expanded") === "true";
      open.setAttribute("aria-expanded", String(!expanded));
      if (expanded) { box.hidden = true; return; }
      box.hidden = false;
      if (box.getAttribute("data-loaded")) return;
      box.innerHTML = "<p class=\"lv-ex-hint\" role=\"status\">상세 정보를 불러오는 중입니다…</p>";
      T.detail(open.getAttribute("data-lv-ex-tour-open")).then(function (e) {
        if (!e) { box.innerHTML = "<p class=\"lv-ex-hint\" role=\"status\">상세 정보를 찾지 못했습니다.</p>"; return; }
        box.innerHTML = tourDetailHtml(e); box.setAttribute("data-loaded", "1");
      }).catch(function () { box.innerHTML = "<p class=\"lv-ex-hint\" role=\"status\">지금 상세 정보를 불러오지 못했습니다.</p>"; });
      return;
    }
    if (photos) {
      var list = card && card.querySelector("[data-lv-ex-tour-photo-list]");
      if (!list || list.getAttribute("data-loaded")) return;
      list.innerHTML = "<p class=\"lv-ex-hint\" role=\"status\">사진을 불러오는 중입니다…</p>";
      T.images(photos.getAttribute("data-lv-ex-tour-photos")).then(function (ps) {
        list.setAttribute("data-loaded", "1");
        list.innerHTML = ps.length ? ps.slice(0, 6).map(function (ph) { return photoFigure(ph, T); }).join("") : "<p class=\"lv-ex-hint\" role=\"status\">이용 조건(공공누리 유형)이 표시된 사진이 없습니다.</p>";
      }).catch(function () { list.innerHTML = "<p class=\"lv-ex-hint\" role=\"status\">지금 사진을 불러오지 못했습니다.</p>"; });
    }
  });

  /* ───────── 고용24 국민내일배움카드 훈련과정 (직업훈련) — inside 클래스, never mixed with 평생학습강좌 ─────────
     One documented upstream search per request (과정명/기관명, 지역, 훈련유형, 훈련구분, 훈련시작일 범위). No 모집·신청 기간,
     취업률, 만족도, 평점 or 잔여석 exist in LIVON's output; the course link is "고용24 과정 상세 보기", never "신청하기". */
  var jobRun = 0, jobMemo = {};
  function JBC() { var D = window.LivonData; return D && D.jobs && D.jobs.configured() ? D.jobs : null; }
  function jobRegion() { var J = JBC(); return J && J.REGIONS[state.region] ? state.region : ""; }
  function jobMethod() { var J = JBC(); return state.jm && J && J.METHODS[state.jm] ? state.jm : state.mode === "online" ? "online" : state.mode === "offline" ? "offline" : ""; }
  function jobSearchOn() { return state.viewMode !== "map" && state.type === "class" && !!JBC() && !!(state.q || state.jobs || jobRegion() || state.jt || state.jm); }
  function jobShell() {
    var J = JBC();
    function opt(v, label, on) { return "<option value=\"" + esc(v) + "\"" + (on ? " selected" : "") + ">" + esc(label) + "</option>"; }
    var what = state.q ? "‘" + state.q + "’ " : "";
    return "<section class=\"lv-ex-group\" data-lv-ex-jobs aria-labelledby=\"lv-ex-g-jobs\"><div class=\"lv-ex-group__head\"><h3 id=\"lv-ex-g-jobs\">" + esc(what) + "직업훈련 과정 · 국민내일배움카드</h3></div>" +
      "<p class=\"lv-ex-hint\">고용24(한국고용정보원) 훈련과정 목록입니다. 평생학습 강좌와는 다른 공식 직업훈련 데이터입니다. 모집·신청 기간은 이 데이터에 없어 표시하지 않습니다.</p>" +
      "<div class=\"lv-ex-actions lv-ex-jobs-filters\" role=\"group\" aria-label=\"직업훈련 검색 조건\">" +
        "<label class=\"lv-ex-hint\">검색 대상 <select data-lv-ex-job=\"jf\">" + opt("", "과정명", !state.jf) + opt("org", "훈련기관명", state.jf === "org") + "</select></label>" +
        "<label class=\"lv-ex-hint\">훈련유형 <select data-lv-ex-job=\"jt\">" + opt("", "전체", !state.jt) + Object.keys(J.TYPES).map(function (k) { return opt(k, J.TYPES[k], state.jt === k); }).join("") + "</select></label>" +
        "<label class=\"lv-ex-hint\">훈련구분 <select data-lv-ex-job=\"jm\">" + opt("", "전체", !jobMethod()) + Object.keys(J.METHODS).map(function (k) { return opt(k, J.METHODS[k], jobMethod() === k); }).join("") + "</select></label>" +
        "<label class=\"lv-ex-hint\">훈련 시작일 <select data-lv-ex-job=\"jp\">" + J.PERIODS.map(function (d) { return opt(String(d), "오늘부터 " + d + "일 이내", (state.jp || "90") === String(d)); }).join("") + "</select></label>" +
      "</div>" +
      (state.region && !jobRegion() ? "<p class=\"lv-ex-hint\">‘" + esc(state.region) + "’ 지역은 직업훈련 검색 조건으로 쓰지 않고 전국 과정을 보여 줍니다.</p>" : "") +
      (jobRegion() === "광주" ? "<p class=\"lv-ex-hint\">고용24 지역 구분상 광주는 ‘전남광주’로 조회됩니다.</p>" : "") +
      "<div data-lv-ex-jobs-list></div></section>";
  }
  function jobCard(e) {
    var D = window.LivonData, J = JBC(), m = e.metadata || {}, a = D.action(e);
    var LP = window.LivonPlatform, saved = !!(LP && LP.listSaves && LP.listSaves("all").some(function (x) { return x.id === "ext:" + e.id; }));
    var st = J ? J.status(e) : "";
    var period = e.schedule && e.schedule.startAt ? D.ui.day(e.schedule.startAt) + (e.schedule.endAt ? " – " + D.ui.day(e.schedule.endAt) : "") : "";
    var line = [period ? "훈련기간 " + period : "", e.location && (e.location.region || e.location.address), e.format, m.weekend].filter(Boolean).join(" · ");
    var future = e.schedule && e.schedule.startAt && Date.parse(e.schedule.startAt) > Date.now();
    return "<article class=\"lv-ex-card lv-ex-card--text lv-ex-card--class lv-data-card\" data-livon-entity=\"" + esc(e.id) + "\"><div class=\"lv-ex-card__body\">" +
      "<div class=\"lv-ex-card__meta\"><span>직업훈련</span>" + (m.trainTarget ? "<span>" + esc(m.trainTarget) + "</span>" : "") + (st ? "<span>" + esc(st) + "</span>" : "") + "</div>" +
      "<h4>" + esc(e.title) + "</h4>" +
      (m.subTitle ? "<p>" + esc(m.subTitle) + "</p>" : "") +
      (line ? "<p class=\"lv-ex-card__reason\">" + esc(line) + "</p>" : "") +
      "<div class=\"lv-ex-card__acts\"><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-lv-ex-job-open=\"" + esc(e.id) + "\" aria-expanded=\"false\">상세 정보</button>" +
      (a ? "<a class=\"lv-ex-btn lv-ex-btn--dark lv-ex-btn--sm\" href=\"" + esc(a.url) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + esc(a.label) + " <span aria-hidden=\"true\">↗</span><span class=\"visually-hidden\"> (새 창)</span></a>" : "") +
      "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-livon-entity-save=\"" + esc(e.id) + "\" aria-pressed=\"" + saved + "\">" + (saved ? "저장됨" : "저장") + "</button>" +
      (future ? "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" data-livon-entity-todo=\"" + esc(e.id) + "\" data-kind=\"start\">훈련 시작일을 할 일에 추가</button>" : "") +
      "</div><div data-lv-ex-job-detail hidden></div></div></article>";
  }
  /* rows only when the official field has a value; costs keep their official names */
  function jobDetailHtml(e) {
    var D = window.LivonData;
    var facts = D.ui.jobFacts(e);
    var rows = facts.map(function (r) { return "<p class=\"lv-ex-card__reason\"><strong>" + esc(r[0]) + "</strong> " + esc(r[1]) + "</p>"; }).join("");
    var home = e.contact && e.contact.website;
    var money = facts.some(function (r) { return ["수강비", "실제 훈련비", "정부지원금", "본인부담액"].indexOf(r[0]) >= 0; });
    return (rows ? "<div class=\"lv-ex-job-rows\">" + rows + "</div>" : "") +
      (money ? "<p class=\"lv-ex-hint\">비용은 고용24 필드 값 그대로입니다. 개인별 실제 부담액·지원 여부는 LIVON이 계산하지 않으니 고용24에서 확인하세요.</p>" : "") +
      "<p class=\"lv-ex-hint\">모집·신청 기간은 이 데이터에 없습니다. 신청 가능 여부는 고용24 과정 상세에서 확인하세요.</p>" +
      (home ? "<div class=\"lv-ex-actions\"><a class=\"lv-ex-btn lv-ex-btn--ghost lv-ex-btn--sm\" href=\"" + esc(home) + "\" target=\"_blank\" rel=\"noopener noreferrer\">훈련기관 홈페이지 <span aria-hidden=\"true\">↗</span><span class=\"visually-hidden\"> (새 창)</span></a></div>" : "") +
      "<p class=\"lv-ex-hint\">" + esc((e.source && e.source.attribution) || "출처: 고용24") + " · 출처 기준일 정보 없음 · LIVON 조회 " + esc(D.ui.day(e.source && e.source.fetchedAt)) + "</p>";
  }
  function runJobs(page) {
    var J = JBC(), host = $("[data-lv-ex-jobs-list]");
    if (!J || !host) return;
    var run = ++jobRun;
    if (page === 1) placeMsg(host, "직업훈련 과정을 불러오는 중입니다…");
    var opts = { query: state.q, field: state.jf, region: jobRegion(), method: jobMethod(), type: state.jt, period: state.jp || 90, page: page };
    var memoKey = [opts.query, opts.field, opts.region, opts.method, opts.type, opts.period, page].join("|");
    var job = jobMemo[memoKey] || J.search(opts);
    jobMemo[memoKey] = job; job.catch(function () { delete jobMemo[memoKey]; });
    job.then(function (r) {
      if (run !== jobRun) return;
      var more = host.querySelector("[data-lv-ex-jobs-more]"); if (more) more.parentNode.removeChild(more);
      if (page === 1) host.innerHTML = r.items.length ? "<p class=\"lv-ex-hint\">훈련 시작일 순" + (typeof r.total === "number" ? " · 전체 " + r.total + "건" : "") + "</p><div class=\"lv-ex-card-grid\" data-lv-ex-jobs-grid></div>" : "";
      if (!r.items.length && page === 1) { placeMsg(host, "조건에 맞는 직업훈련 과정이 없습니다. 검색어를 줄이거나 훈련 시작일 범위를 넓혀 보세요."); return; }
      var grid = host.querySelector("[data-lv-ex-jobs-grid]");
      if (grid) grid.insertAdjacentHTML("beforeend", r.items.map(jobCard).join(""));
      if (r.hasMore) host.insertAdjacentHTML("beforeend", "<div class=\"lv-ex-more\" data-lv-ex-jobs-more><button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline\" data-lv-ex-jobs-next=\"" + (page + 1) + "\">직업훈련 과정 더 보기</button></div>");
    }).catch(function (err) {
      if (run !== jobRun) return;
      placeMsg(host, err && err.status === 503 ? "직업훈련 데이터 호출 한도를 넘었거나 아직 연결되지 않았습니다. 잠시 후 다시 시도해 주세요." : "지금 직업훈련 과정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    });
  }
  document.addEventListener("change", function (ev) {
    var sel = ev.target && ev.target.closest && ev.target.closest("[data-lv-ex-job]");
    if (!sel) return;
    var J = JBC(), k = sel.getAttribute("data-lv-ex-job"), v = sel.value;
    if (!J) return;
    if (k === "jf") state.jf = v === "org" ? "org" : "";
    if (k === "jt") state.jt = J.TYPES[v] ? v : "";
    if (k === "jm") { state.jm = J.METHODS[v] ? v : ""; if (!state.jm) state.mode = ""; }
    if (k === "jp") state.jp = J.PERIODS.indexOf(Number(v)) >= 0 && Number(v) !== 90 ? String(Number(v)) : "";
    state.jobs = "1";
    navigateResults(true);
  });
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    var next = t.closest && t.closest("[data-lv-ex-jobs-next]"), open = t.closest && t.closest("[data-lv-ex-job-open]");
    if (!next && !open) return;
    ev.preventDefault();
    var J = JBC(); if (!J) return;
    if (next) { runJobs(Number(next.getAttribute("data-lv-ex-jobs-next")) || 2); return; }
    var card = t.closest("[data-livon-entity]"), box = card && card.querySelector("[data-lv-ex-job-detail]");
    if (!box) return;
    var expanded = open.getAttribute("aria-expanded") === "true";
    open.setAttribute("aria-expanded", String(!expanded));
    if (expanded) { box.hidden = true; return; }
    box.hidden = false;
    if (box.getAttribute("data-loaded")) return;
    var id = open.getAttribute("data-lv-ex-job-open"), D = window.LivonData, base = D.repository.getById(id);
    if (base) box.innerHTML = jobDetailHtml(base);
    box.insertAdjacentHTML("beforeend", "<p class=\"lv-ex-hint\" role=\"status\" data-lv-ex-job-loading>훈련기관·비용 정보를 불러오는 중입니다…</p>");
    J.detail(id).then(function (e) {
      box.innerHTML = jobDetailHtml(e || base); box.setAttribute("data-loaded", "1");
    }).catch(function () {
      var l = box.querySelector("[data-lv-ex-job-loading]"); if (l) l.textContent = "지금 훈련기관·비용 상세 정보를 불러오지 못했습니다. 목록 정보만 표시합니다.";
    });
  });

  function navigateResults(replace) {
    var h = serialize();
    if (location.hash === "#" + h) { renderResults(); return; }
    if (replace) { history.replaceState(null, "", "#" + h); renderResults(); }
    else location.hash = h;
  }
  function openResults(query, opts) {
    opts = opts || {};
    var L = S();
    state.q = String(query == null ? "" : query).trim().slice(0, 80);
    /* A new search starts from clean filters; callers pass only what they want set (Today/Life Stage pass categoryId/type). */
    state.categoryId = opts.categoryId && L && L.EXCAT[opts.categoryId] ? opts.categoryId : "";
    state.type = !opts.type ? "all" : opts.keepType && typeValid(opts.type) ? opts.type : (L && L.LEGACY_TYPE[opts.type]) || (typeValid(opts.type) ? opts.type : "all");
    state.region = opts.region && (DATA.regions || []).indexOf(opts.region) >= 0 ? opts.region : "";
    state.cat = opts.cat && L && L.CATS.some(function (c) { return c.id === opts.cat; }) ? opts.cat : "";
    state.age = /^[1-7]0$/.test(opts.age || "") ? opts.age : "";
    state.mode = opts.mode === "online" || opts.mode === "offline" ? opts.mode : "";
    state.visit = "";
    state.pcat = "";
    state.tt = "";
    state.jobs = opts.jobs ? "1" : ""; state.jf = ""; state.jt = ""; state.jm = ""; state.jp = "";
    state.shown = PAGE;
    var input = $("[data-lv-ex-input]");
    var clear = $("[data-lv-ex-clear]");
    if (input) input.value = state.q;
    if (clear) clear.hidden = !state.q;
    if (state.q && trackingOn()) pushRecent(state.q);
    renderRecentLine();
    closeSuggest();
    navigateResults(false);
    requestAnimationFrame(function () { scrollToId("ex-results"); });
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

    var titleHadFocus = !!document.activeElement && document.activeElement.id === "lv-ex-detail-title";
    host.innerHTML =
      "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm\" data-lv-ex-back-results>← 결과로</button>" +
      "<article class=\"lv-ex-detail lv-ex-detail--" + esc(item.layout || item.type) + "\">" +
        "<div class=\"lv-ex-detail__hero\">" +
          (item.img ? "<img src=\"" + esc(item.img) + "\" alt=\"\" width=\"1200\" height=\"700\" />" : "") +
          "<div class=\"lv-ex-detail__hero-copy\">" +
            credBadge(item) +
            "<p class=\"lv-ex-eyebrow\">" + esc(TYPE_LABEL[item.type] || "") + " · " + esc(item.subfield || "") + "</p>" +
            "<h2 class=\"lv-ex-title lv-ex-title--md\" id=\"lv-ex-detail-title\" tabindex=\"-1\">" + esc(item.title) + "</h2>" +
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
              saveBtn(item, "lv-ex-btn lv-ex-btn--outline", "관심 저장") +
              "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost\" data-lv-ex-compare-id=\"" + esc(id) + "\">" + (inCompare ? "비교 목록에서 제거" : "비교하기") + "</button>" +
              "<a class=\"lv-ex-btn lv-ex-btn--ghost\" href=\"#community\">커뮤니티 경험담</a>" +
              "<button type=\"button\" class=\"lv-ex-btn lv-ex-btn--ghost\" data-lh-ai=\"" + esc(JSON.stringify({ source: "explore", q: "‘" + item.title + "’ 이용 조건과 준비할 것을 정리해 줘.", topicId: "explore:" + item.id, topicTitle: item.title, category: TYPE_LABEL[item.type] || "", url: "#ex-item-" + item.id, summary: item.blurb || "" })) + "\">LIVON AI로 조건 정리</button>" +
              "<a class=\"lv-ex-btn lv-ex-btn--ghost\" href=\"#ml-saved\">내 생활 저장함</a>" +
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
    /* a newly opened detail: the tab title names it and focus moves to its heading (keyboard and screen-reader users land on the content) */
    setTitle(item.title);
    if (state.focusedDetail !== id || titleHadFocus) {
      state.focusedDetail = id;
      var dh = document.getElementById("lv-ex-detail-title");
      if (dh) { try { dh.focus({ preventScroll: true }); } catch (e) { dh.focus(); } }
    }
  }

  var EX_TITLE = "탐색 · LIVON";
  function setTitle(name) {
    var t = document.title;
    if (name) { document.title = name + " · " + EX_TITLE; return; }
    if (t !== EX_TITLE && t.slice(-(EX_TITLE.length + 3)) === " · " + EX_TITLE) document.title = EX_TITLE;
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
          return saveBtn(x, "lv-ex-btn lv-ex-btn--outline lv-ex-btn--sm", x.title + " 저장");
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
          toast("같은 유형의 항목만 비교할 수 있습니다.");
          return;
        }
      }
      if (ids.length >= 4) {
        toast("비교는 최대 4개까지입니다.");
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
        var active = $("#lv-ex-ac-list [aria-selected=\"true\"]");
        openResults(active ? active.getAttribute("data-lv-ex-sugg") : (input ? input.value : ""));
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
        openResults(chip.getAttribute("data-lv-ex-chip") || chip.textContent);
        return;
      }
      var sugg = e.target.closest("[data-lv-ex-sugg]");
      if (sugg) { e.preventDefault(); openResults(sugg.getAttribute("data-lv-ex-sugg")); return; }
      var rdel = e.target.closest("[data-lv-ex-recent-del]");
      if (rdel) {
        e.preventDefault();
        var dq = rdel.getAttribute("data-lv-ex-recent-del");
        writeJSON(KEY_RECENT, recentQueries().filter(function (x) { return x !== dq; }));
        renderRecentLine();
        var next = $("[data-lv-ex-recent] [data-lv-ex-chip]"); if (next) next.focus(); else { var inp = $("[data-lv-ex-input]"); if (inp) inp.focus(); }
        return;
      }
      if (e.target.closest("[data-lv-ex-recent-clear]")) { e.preventDefault(); writeJSON(KEY_RECENT, []); renderRecentLine(); toast("최근 검색어를 모두 지웠습니다."); return; }
      var quickCat = e.target.closest("[data-lv-ex-quick-cat]");
      if (quickCat) { e.preventDefault(); openResults("", { cat: quickCat.getAttribute("data-lv-ex-quick-cat") }); return; }
      var quickType = e.target.closest("[data-lv-ex-quick-type]");
      if (quickType) { e.preventDefault(); openResults("", { type: quickType.getAttribute("data-lv-ex-quick-type"), keepType: true }); return; }
      var fc = e.target.closest("[data-lv-ex-filter-cat]");
      if (fc) { e.preventDefault(); state.cat = fc.getAttribute("data-lv-ex-filter-cat") || ""; state.shown = PAGE; navigateResults(true); return; }
      var fa = e.target.closest("[data-lv-ex-filter-age]");
      if (fa) { e.preventDefault(); state.age = fa.getAttribute("data-lv-ex-filter-age") || ""; state.shown = PAGE; navigateResults(true); return; }
      if (e.target.closest("[data-lv-ex-filter-ex]")) { e.preventDefault(); state.categoryId = ""; state.shown = PAGE; navigateResults(true); return; }
      var resetAll = e.target.closest("[data-lv-ex-reset],[data-lv-ex-reset-all]");
      if (resetAll) {
        e.preventDefault();
        state.cat = ""; state.age = ""; state.categoryId = ""; state.region = ""; state.mode = ""; state.visit = ""; state.shown = PAGE;
        if (resetAll.hasAttribute("data-lv-ex-reset-all")) state.type = "all";
        navigateResults(true); toast("필터를 초기화했습니다.");
        return;
      }
      if (e.target.closest("[data-lv-ex-more]")) { e.preventDefault(); state.shown = (state.shown || PAGE) + PAGE; renderResults(); return; }
      if (e.target.closest("[data-lv-ex-retry]")) {
        e.preventDefault();
        var hb = window.LivonLifeHub;
        if (hb && hb.repo) hb.repo.load(true).then(function () { if (S()) S().rebuild(); renderResults(); }, renderResults);
        renderResults();
        return;
      }
      /* a Life Event search result opens that event in the Life Event guide (same session key as the platform search) */
      var leOpen = e.target.closest("[data-lv-le-open]");
      if (leOpen) { try { sessionStorage.setItem("livon.openLifeEvent", leOpen.getAttribute("data-lv-le-open")); } catch (err) {} }
      var goCard = e.target.closest("[data-lv-ex-go]");
      if (goCard && !e.target.closest("a,button,input,label")) { location.hash = goCard.getAttribute("data-lv-ex-go").replace(/^#/, ""); return; }
      var openCat = e.target.closest("[data-lv-ex-open-cat]");
      if (openCat) {
        e.preventDefault();
        openResults("", { categoryId: openCat.getAttribute("data-lv-ex-open-cat") });
        return;
      }
      var legacyCat = e.target.closest("[data-lv-ex-cat]");
      if (legacyCat && !e.target.closest("[data-lv-ex-open-cat]")) {
        e.preventDefault();
        var q = legacyCat.getAttribute("data-lv-ex-cat") || "";
        var t = legacyCat.getAttribute("data-lv-ex-type") || "all";
        var mapped = LEGACY_Q[q];
        var ageM = /^([1-7]0)대/.exec(q);
        if (mapped) openResults("", mapped);
        else if (ageM) openResults("", { age: ageM[1] });
        else openResults(q, { type: t, keepType: t === "expert" });
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
        toast("마감 알림은 알림 센터 연동 후 제공됩니다. 지금은 공식 페이지에서 신청 기간을 확인해 주세요.");
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
        state.shown = PAGE;
        navigateResults(true);
        var tabBtn = $("#lv-ex-tab-" + state.type); if (tabBtn && ft.getAttribute("role") === "tab") tabBtn.focus();
        return;
      }
      var fr = e.target.closest("[data-lv-ex-filter-region]");
      if (fr) {
        e.preventDefault();
        state.region = fr.getAttribute("data-lv-ex-filter-region") || "";
        state.shown = PAGE;
        navigateResults(true);
        return;
      }
      var fm = e.target.closest("[data-lv-ex-filter-mode]");
      if (fm) {
        e.preventDefault();
        state.mode = fm.getAttribute("data-lv-ex-filter-mode") || "";
        state.visit = "";
        state.shown = PAGE;
        navigateResults(true);
        return;
      }
      var fv = e.target.closest("[data-lv-ex-filter-visit]");
      if (fv) {
        e.preventDefault();
        state.visit = state.visit === "1" ? "" : "1";
        state.shown = PAGE;
        navigateResults(true);
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
        if (/^#ex-results/.test(prevHash)) history.back();
        else location.hash = serialize();
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
        var closed = side && side.classList.contains("is-collapsed");
        var cnt = activeFilterCount();
        toggleF.textContent = closed ? "필터 열기" + (cnt ? " (" + cnt + ")" : "") : "접기";
        toggleF.setAttribute("aria-expanded", closed ? "false" : "true");
        return;
      }
    });

    document.addEventListener("change", function (e) {
      if (e.target.matches("[data-lv-ex-sort]")) {
        state.sort = e.target.value === "newest" ? "newest" : "relevance";
        navigateResults(true);
      }
      if (e.target.matches("[data-lv-ex-pref-region]")) {
        localStorage.setItem(KEY_REGION, e.target.value || "");
        renderForYou();
        renderRecommendSection();
      }
    });
  }

  function bindTabsKeyboard() {
    document.addEventListener("keydown", function (e) {
      var tab = e.target.closest && e.target.closest("[data-lv-ex-tabs] [role=tab]");
      if (!tab || ["ArrowRight", "ArrowLeft", "Home", "End"].indexOf(e.key) < 0) return;
      e.preventDefault();
      var tabs = $$("[data-lv-ex-tabs] [role=tab]"), i = tabs.indexOf(tab);
      var n = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[n].click();
      var nb = $("#" + tabs[n].id); if (nb) nb.focus();
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
        links.forEach(function (a) { a.classList.remove("is-on"); a.removeAttribute("aria-current"); });
        if (map[entry.target.id]) { map[entry.target.id].classList.add("is-on"); map[entry.target.id].setAttribute("aria-current", "location"); }
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
    if (String(hash || "").indexOf("ex-item-") !== 0) { state.focusedDetail = null; setTitle(""); }
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
    if (hash === "ex-results" || hash.indexOf("ex-results?") === 0) {
      parseState(hash);
      var input = $("[data-lv-ex-input]"); if (input) input.value = state.q;
      var clear = $("[data-lv-ex-clear]"); if (clear) clear.hidden = !state.q;
      renderResults();
      var saved = readJSON(KEY_SCROLL, {}) || {};
      var y = saved["#" + hash];
      setTimeout(function () { if (typeof y === "number" && y > 0) window.scrollTo(0, y); else scrollToId("ex-results"); }, 40);
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
    migrateLegacySaves();
    bindEvents();
    bindAutocomplete();
    bindTabsKeyboard();
    var side = $("[data-lv-ex-side]"), tg = $("[data-lv-ex-toggle-filters]");
    if (side && window.matchMedia && window.matchMedia("(max-width: 959px)").matches) { side.classList.add("is-collapsed"); if (tg) { tg.textContent = "필터 열기"; tg.setAttribute("aria-expanded", "false"); } }
    window.addEventListener("hashchange", function (e) { try { prevHash = new URL(e.oldURL).hash; } catch (err) { prevHash = ""; } });
    var scrollT = null;
    window.addEventListener("scroll", function () {
      if (!/^#ex-results/.test(location.hash)) return;
      clearTimeout(scrollT);
      scrollT = setTimeout(function () { var m = readJSON(KEY_SCROLL, {}) || {}; m[location.hash] = window.pageYOffset; var keys = Object.keys(m); if (keys.length > 10) delete m[keys[0]]; writeJSON(KEY_SCROLL, m); }, 120);
    }, { passive: true });
    var hub = window.LivonLifeHub;
    if (hub && hub.onChange) hub.onChange(function (st) {
      if (st !== "ready" && st !== "error") return;
      if (S()) S().rebuild();
      if ($("#ex-results") && !$("#ex-results").hidden && /^#ex-results/.test(location.hash)) renderResults();
    });
    /* a data provider was switched on by the server status check (e.g. Kakao Local): show its search block */
    document.addEventListener("livon:data-status", function () {
      if ($("#ex-results") && !$("#ex-results").hidden && /^#ex-results/.test(location.hash) && ((placeSearchOn() && !$("[data-lv-ex-kakao]")) || (tourSearchOn() && !$("[data-lv-ex-tour]")))) renderResults();
    });
    bindNavHighlight();
    bindReveal();
    bindFilmHero();
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "explore") onShow(hash || "explore");
  }

  document.addEventListener("livon:personalization", function () { try { renderForYou(); } catch (e) {} });
  window.LivonExplore = {
    onShow: onShow,
    /* re-render an open result list in place (no scroll) — used when real data arrives after the page opened */
    refreshResults: function () { if ($("#ex-results") && !$("#ex-results").hidden && /^#ex-results/.test(location.hash)) renderResults(); },
    openResults: openResults,
    openItem: renderDetail,
    state: function () { return JSON.parse(JSON.stringify(state)); },
    serialize: function () { return serialize(); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
