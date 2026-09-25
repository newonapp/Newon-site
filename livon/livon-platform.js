/* LIVON shared platform layer — search, save, alerts, onboarding, profile.
   Uses existing gnav panels / life-now / life-event UI. No new design system. */
(function () {
  var KEY_PLATFORM = "livon.platform.v1";
  var KEY_STAGE = "livon.lifeStage";
  var KEY_SITUATIONS = "livon.lifeSituations";
  var KEY_INTERESTS = "livon.lifeInterests";
  var KEY_GOALS = "livon.lifeGoals";
  var KEY_EVENTS = "livon.lifeEvents";
  var KEY_REGION = "livon.hmRegion";
  var KEY_EVENT_PROGRESS = "livon.lifeEventProgress.v1";
  var KEY_TD_SAVED = "livon.tdSaved";
  var KEY_ML = "livon.mlStore.v1";

  var FOLDER_PRESETS = ["취업 준비", "여행", "독립 준비", "부모님", "나중에 보기"];
  var ALERT_TYPES = [
    { id: "schedule", label: "일정" },
    { id: "todo", label: "할 일" },
    { id: "lifeEvent", label: "Life Event" },
    { id: "saved", label: "저장 콘텐츠 업데이트" },
    { id: "deadline", label: "신청 마감" },
    { id: "booking", label: "예약" },
    { id: "community", label: "커뮤니티" },
    { id: "family", label: "가족" },
    { id: "service", label: "서비스" },
    { id: "system", label: "LIVON 안내" }
  ];
  var ONBOARD_GOALS = ["공부", "취업", "커리어", "돈", "주거", "건강", "가족", "여행", "취미", "인간관계", "육아", "부모 돌봄"];
  var POPULAR_QUERIES = ["첫 취업", "독립", "이사", "자격증", "육아", "주거", "시니어", "건강", "취미", "커뮤니티"];
  var SEARCH_TABS = [
    { id: "all", label: "전체" },
    { id: "content", label: "콘텐츠" },
    { id: "place", label: "장소" },
    { id: "expert", label: "전문가" },
    { id: "service", label: "서비스" },
    { id: "benefit", label: "혜택" },
    { id: "community", label: "커뮤니티" }
  ];

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function defaultPlatform() {
    var prefs = {};
    ALERT_TYPES.forEach(function (t) { prefs[t.id] = true; });
    prefs.booking = false;
    prefs.family = false;
    return {
      onboarded: false,
      onboardSkipped: false,
      recentSearches: [],
      alertPrefs: prefs,
      alerts: [],
      saves: [],
      folders: FOLDER_PRESETS.slice(),
      region: { sido: "", sgg: "", dong: "" },
      family: { members: [], invites: [], status: "soon" },
      profile: { displayName: "", note: "" }
    };
  }

  function load() {
    var s = readJSON(KEY_PLATFORM, null);
    var base = defaultPlatform();
    if (!s || typeof s !== "object") return base;
    Object.keys(base).forEach(function (k) {
      if (s[k] == null) s[k] = base[k];
    });
    if (!s.alertPrefs || typeof s.alertPrefs !== "object") s.alertPrefs = base.alertPrefs;
    if (!Array.isArray(s.saves)) s.saves = [];
    if (!Array.isArray(s.folders) || !s.folders.length) s.folders = base.folders.slice();
    if (!Array.isArray(s.alerts)) s.alerts = [];
    if (!Array.isArray(s.recentSearches)) s.recentSearches = [];
    if (!s.region || typeof s.region !== "object") s.region = base.region;
    if (!s.family || typeof s.family !== "object") s.family = base.family;
    return s;
  }
  function save(s) { writeJSON(KEY_PLATFORM, s); return s; }

  function stageLabel() {
    var id = readJSON(KEY_STAGE, "");
    if (typeof id !== "string") id = "";
    var map = { "10": "10대", "20": "20대", "30": "30대", "40": "40대", "50": "50대", "60": "60대", "70": "70대 이상" };
    return map[id] || "";
  }

  function pushRecent(q) {
    var s = load();
    q = String(q || "").trim();
    if (!q) return;
    s.recentSearches = [q].concat(s.recentSearches.filter(function (x) { return x !== q; })).slice(0, 8);
    save(s);
  }

  function suggestedQueries() {
    var out = [];
    var stage = stageLabel();
    var sits = readJSON(KEY_SITUATIONS, []);
    var interests = readJSON(KEY_INTERESTS, []);
    var events = readJSON(KEY_EVENTS, []);
    var catalog = (window.LivonLifeEvents && window.LivonLifeEvents.events) || [];
    if (stage) out.push(stage + " 생활");
    (sits || []).slice(0, 2).forEach(function (x) { out.push(x); });
    (interests || []).slice(0, 2).forEach(function (x) { out.push(x); });
    (events || []).slice(0, 2).forEach(function (id) {
      var ev = catalog.find(function (e) { return e.id === id; });
      if (ev) out.push(ev.title);
    });
    POPULAR_QUERIES.forEach(function (q) { if (out.indexOf(q) < 0) out.push(q); });
    return out.slice(0, 10);
  }

  function classifyExplore(item) {
    var t = item.type || "";
    if (t === "expert") return "expert";
    if (t === "benefit" || t === "support" || item.layout === "benefit" || /복지|지원|혜택/.test(item.title || "")) return "benefit";
    if (t === "place" || item.mapQuery) return "place";
    if (t === "service" || t === "program" || t === "class" || t === "product") return "service";
    return "service";
  }

  function searchAll(q, tab) {
    q = String(q || "").trim();
    tab = tab || "all";
    var ql = q.toLowerCase();
    var tokens = ql.split(/\s+/).filter(function (t) { return t.length > 1; });
    function hit(hay) {
      hay = String(hay || "").toLowerCase();
      if (!ql) return false;
      if (hay.indexOf(ql) >= 0) return true;
      return tokens.some(function (t) { return hay.indexOf(t) >= 0; });
    }
    var results = [];

    ((window.LivonTodayData && window.LivonTodayData.contents) || []).forEach(function (c) {
      var hay = [c.title, c.blurb, c.category, (c.tags || []).join(" ")].join(" ");
      if (!hit(hay)) return;
      var kind = c.type === "place" ? "place" : "content";
      results.push({ kind: kind, kindLabel: kind === "place" ? "장소" : "콘텐츠", title: c.title, href: "#td-item-" + c.id, blurb: c.blurb || c.category || "" });
    });

    ((window.LivonExploreData && window.LivonExploreData.items) || []).forEach(function (c) {
      var hay = [c.title, c.blurb, c.provider, c.category, (c.tags || []).join(" ")].join(" ");
      if (!hit(hay)) return;
      var kind = classifyExplore(c);
      var labels = { expert: "전문가", service: "서비스", benefit: "혜택", place: "장소" };
      results.push({ kind: kind, kindLabel: labels[kind] || "서비스", title: c.title, href: "#ex-item-" + c.id, blurb: c.provider || c.blurb || "" });
    });

    ((window.LivonLifeData && window.LivonLifeData.stages) || []).forEach(function (s) {
      var hay = [s.label, s.title, s.desc, s.focus, s.community].join(" ");
      if (!hit(hay)) return;
      results.push({ kind: "content", kindLabel: "Life Stage", title: s.label + " · " + s.title, href: "#stage-" + s.id, blurb: s.focus || "" });
    });

    ((window.LivonLifeEvents && window.LivonLifeEvents.events) || []).forEach(function (ev) {
      var hay = [ev.title, ev.blurb, (ev.needs || []).join(" "), (ev.checklist || []).join(" ")].join(" ");
      if (!hit(hay)) return;
      results.push({ kind: "content", kindLabel: "Life Event", title: ev.title, href: "#life-events", blurb: ev.blurb || "", eventId: ev.id });
    });

    var cm = readJSON("livon.cmStore.v1", null);
    if (cm && Array.isArray(cm.posts)) {
      cm.posts.filter(function (p) { return !p.deleted && !p.draft && p.visibility !== "private"; }).forEach(function (p) {
        var hay = [p.title, p.body, (p.tags || []).join(" ")].join(" ");
        if (!hit(hay)) return;
        results.push({ kind: "community", kindLabel: p.type === "question" ? "질문" : "커뮤니티", title: p.title, href: "#cm-post-" + p.id, blurb: (p.body || "").slice(0, 80) });
      });
    }

    if (tab !== "all") results = results.filter(function (r) { return r.kind === tab; });
    return results;
  }

  function renderSearchIdle(host) {
    var s = load();
    var recent = s.recentSearches || [];
    var popular = POPULAR_QUERIES.slice(0, 6);
    var suggested = suggestedQueries().slice(0, 6);
    host.innerHTML =
      (recent.length
        ? "<p class=\"livon-panel__note\"><strong>최근 검색</strong></p><ul class=\"livon-panel__list\">" +
          recent.map(function (q) { return "<li><button type=\"button\" data-lv-plat-q=\"" + esc(q) + "\">" + esc(q) + "</button></li>"; }).join("") + "</ul>"
        : "") +
      "<p class=\"livon-panel__note\"><strong>인기 · 추천 검색</strong></p><ul class=\"livon-panel__list\">" +
        popular.map(function (q) { return "<li><button type=\"button\" data-lv-plat-q=\"" + esc(q) + "\">" + esc(q) + "</button></li>"; }).join("") + "</ul>" +
      "<p class=\"livon-panel__note\"><strong>내 Life Stage 관련</strong></p><ul class=\"livon-panel__list\">" +
        suggested.map(function (q) { return "<li><button type=\"button\" data-lv-plat-q=\"" + esc(q) + "\">" + esc(q) + "</button></li>"; }).join("") + "</ul>";
  }

  function renderSearchResults(host, q, tab) {
    var results = searchAll(q, tab);
    var tabs = SEARCH_TABS.map(function (t) {
      return "<button type=\"button\" data-lv-plat-tab=\"" + t.id + "\"" + (tab === t.id ? " class=\"is-on\"" : "") + ">" + esc(t.label) + "</button>";
    }).join("");
    var body = "";
    if (!results.length) {
      var alts = suggestedQueries().filter(function (x) { return x !== q; }).slice(0, 5);
      body =
        "<p class=\"livon-panel__note\">‘" + esc(q) + "’ 결과가 없습니다. 관련 검색을 시도해 보세요.</p>" +
        "<ul class=\"livon-panel__list\">" +
          alts.map(function (a) { return "<li><button type=\"button\" data-lv-plat-q=\"" + esc(a) + "\">" + esc(a) + "</button></li>"; }).join("") +
          "<li><a href=\"#explore\">탐색에서 찾아보기</a></li>" +
          "<li><a href=\"#today\">오늘의 발견 둘러보기</a></li>" +
          "<li><a href=\"#life-events\">Life Event 선택</a></li>" +
        "</ul>";
    } else {
      var groups = {};
      results.forEach(function (r) {
        if (!groups[r.kindLabel]) groups[r.kindLabel] = [];
        groups[r.kindLabel].push(r);
      });
      body = Object.keys(groups).map(function (label) {
        return "<p class=\"livon-panel__note\"><strong>" + esc(label) + "</strong> · " + groups[label].length + "</p>" +
          "<ul class=\"livon-panel__list\">" + groups[label].slice(0, 6).map(function (r) {
            return "<li><a href=\"" + esc(r.href) + "\" data-lv-plat-result=\"" + esc(r.eventId || "") + "\">" + esc(r.title) + "</a></li>";
          }).join("") + "</ul>";
      }).join("");
    }
    host.innerHTML =
      "<div class=\"livon-search-tabs\" data-lv-plat-tabs>" + tabs + "</div>" +
      "<p class=\"livon-panel__note\">‘" + esc(q) + "’ · " + results.length + "건</p>" + body;
  }

  function runSearch(q, tab) {
    q = String(q || "").trim();
    tab = tab || "all";
    var panel = document.querySelector("[data-livon-panel='search']");
    if (!panel) return "";
    var host = panel.querySelector("[data-livon-search-body]");
    var note = panel.querySelector("[data-livon-search-note]");
    var input = panel.querySelector("#livon-search-input");
    if (input && q) input.value = q;
    if (!host) return "";
    if (!q) {
      if (note) note.textContent = "콘텐츠 · Life Stage · Life Event · 전문가 · 서비스 · 혜택 · 커뮤니티를 함께 찾습니다.";
      renderSearchIdle(host);
      return note ? note.textContent : "";
    }
    pushRecent(q);
    renderSearchResults(host, q, tab);
    if (note) note.textContent = "종류별 결과 · 예약·결제는 연결하지 않습니다.";
    return "‘" + q + "’ · 결과 " + searchAll(q, tab).length + "건";
  }

  /* ——— Unified saves ——— */
  function saveItem(item) {
    var s = load();
    if (!item || !item.id) return s;
    var id = String(item.id);
    s.saves = s.saves.filter(function (x) { return x.id !== id; });
    s.saves.unshift({
      id: id,
      label: item.label || item.title || "저장 항목",
      type: item.type || "content",
      href: item.href || "#life-now",
      folder: item.folder || "나중에 보기",
      source: item.source || "",
      at: Date.now()
    });
    s.saves = s.saves.slice(0, 200);
    save(s);
    syncLegacySave(item);
    refreshSavedPanel();
    return s;
  }
  function removeSave(id) {
    var s = load();
    s.saves = s.saves.filter(function (x) { return x.id !== id; });
    save(s);
    refreshSavedPanel();
    return s;
  }
  function setSaveFolder(id, folder) {
    var s = load();
    s.saves.forEach(function (x) { if (x.id === id) x.folder = folder; });
    if (s.folders.indexOf(folder) < 0) s.folders.push(folder);
    save(s);
    return s;
  }
  function listSaves(folder) {
    var s = load();
    var list = s.saves.slice();
    if (folder && folder !== "all") list = list.filter(function (x) { return x.folder === folder; });
    return list;
  }
  function syncLegacySave(item) {
    if (!item) return;
    if (item.type === "today" || (item.id && String(item.id).indexOf("td:") === 0)) {
      var td = readJSON(KEY_TD_SAVED, []);
      if (!Array.isArray(td)) td = [];
      var tid = String(item.id).replace(/^td:/, "");
      if (!td.some(function (x) { return (x.id || x) === tid || x.label === item.label; })) {
        td.unshift({ id: tid, label: item.label, at: Date.now() });
        writeJSON(KEY_TD_SAVED, td.slice(0, 100));
      }
    }
  }
  function migrateLegacySaves() {
    var s = load();
    var known = {};
    s.saves.forEach(function (x) { known[x.id] = 1; });
    var td = readJSON(KEY_TD_SAVED, []);
    if (Array.isArray(td)) {
      td.forEach(function (x) {
        var id = "td:" + (x.id || x.label || Math.random());
        if (known[id]) return;
        s.saves.push({ id: id, label: x.label || x.id || "발견", type: "content", href: x.id ? "#td-item-" + x.id : "#today", folder: "나중에 보기", source: "오늘의 발견", at: x.at || 0 });
      });
    }
    var life = readJSON("livon.lifeSavedLocal", []);
    if (Array.isArray(life)) {
      life.forEach(function (name) {
        var id = "life:" + name;
        if (known[id]) return;
        s.saves.push({ id: id, label: name, type: "life", href: "#life", folder: "나중에 보기", source: "라이프 스테이지", at: 0 });
      });
    }
    s.saves = s.saves.slice(0, 200);
    save(s);
  }

  function refreshSavedPanel() {
    var panel = document.querySelector("[data-livon-panel='saved']");
    if (!panel) return;
    var host = panel.querySelector("[data-livon-saved-body]");
    if (!host) return;
    migrateLegacySaves();
    var list = listSaves("all").slice(0, 8);
    if (!list.length) {
      host.innerHTML = "<ul class=\"livon-panel__list\"><li>저장된 항목이 없습니다</li><li><a href=\"#today\">오늘의 발견</a></li><li><a href=\"#explore\">탐색</a></li><li><a href=\"#ml-panel\">내 생활 저장함</a></li></ul>";
      return;
    }
    host.innerHTML = "<ul class=\"livon-panel__list\">" + list.map(function (x) {
      return "<li><a href=\"" + esc(x.href) + "\">" + esc(x.label) + "</a></li>";
    }).join("") + "<li><a href=\"#ml-panel\" data-lv-plat-goto-saved>저장함 전체</a></li></ul>";
  }

  /* ——— Alerts ——— */
  function ensureSeedAlerts() {
    var s = load();
    if (s.alerts.length) return s;
    var ml = readJSON(KEY_ML, null);
    var todos = (ml && ml.todos) || [];
    var open = todos.filter(function (t) { return !t.done; }).slice(0, 2);
    open.forEach(function (t) {
      s.alerts.push({ id: "todo-" + t.id, type: "todo", title: "할 일 · " + (t.title || ""), href: "#life-now", at: Date.now(), read: false });
    });
    var evs = readJSON(KEY_EVENTS, []);
    if (evs.length) {
      s.alerts.push({ id: "le-" + evs[0], type: "lifeEvent", title: "진행 중 Life Event를 이어서 준비해 보세요", href: "#life-events", at: Date.now(), read: false });
    }
    s.alerts.push({ id: "sys-1", type: "system", title: "LIVON 안내 · 예약·결제는 아직 연결되지 않았습니다", href: "#explore", at: Date.now(), read: false });
    save(s);
    return s;
  }
  function refreshAlertsPanel() {
    var panel = document.querySelector("[data-livon-panel='alerts']");
    if (!panel) return;
    var host = panel.querySelector("[data-livon-alerts-body]");
    if (!host) return;
    var s = ensureSeedAlerts();
    var prefs = s.alertPrefs || {};
    var list = s.alerts.filter(function (a) { return prefs[a.type] !== false; }).slice(0, 10);
    host.innerHTML =
      "<ul class=\"livon-panel__list\">" +
        (list.length
          ? list.map(function (a) {
              return "<li><a href=\"" + esc(a.href || "#life-now") + "\">" + esc(a.title) + "</a></li>";
            }).join("")
          : "<li>표시할 알림이 없습니다</li>") +
        "<li><a href=\"#ml-panel\" data-lv-plat-goto-settings>알림 설정</a></li>" +
      "</ul>";
  }
  function setAlertPref(type, on) {
    var s = load();
    s.alertPrefs[type] = !!on;
    save(s);
    refreshAlertsPanel();
  }

  /* ——— Life Event progress (project) ——— */
  function defaultAreasFor(ev) {
    if (ev && Array.isArray(ev.areas) && ev.areas.length) return ev.areas.map(function (a) {
      return { id: a.id, title: a.title, items: (a.items || []).map(function (t) { return { text: t, done: false }; }) };
    });
    var checks = (ev && ev.checklist) || ["준비 항목 정리", "관련 정보 탐색", "일정 잡기", "필요 시 전문가·서비스 확인"];
    return [
      { id: "prep", title: "준비", items: checks.slice(0, 3).map(function (t) { return { text: t, done: false }; }) },
      { id: "info", title: "정보·콘텐츠", items: [{ text: "관련 콘텐츠 살펴보기", done: false }, { text: "저장함에 담기", done: false }] },
      { id: "service", title: "서비스·전문가", items: [{ text: "탐색에서 관련 안내 확인", done: false }] },
      { id: "admin", title: "행정·일정", items: [{ text: "내 생활에 일정·할 일 등록", done: false }] }
    ];
  }
  function getEventProgress(eventId) {
    var all = readJSON(KEY_EVENT_PROGRESS, {}) || {};
    if (all[eventId]) return all[eventId];
    var catalog = (window.LivonLifeEvents && window.LivonLifeEvents.events) || [];
    var ev = catalog.find(function (e) { return e.id === eventId; });
    var areas = defaultAreasFor(ev);
    var proj = { eventId: eventId, areas: areas, updatedAt: Date.now() };
    all[eventId] = proj;
    writeJSON(KEY_EVENT_PROGRESS, all);
    return proj;
  }
  function progressPercent(proj) {
    var total = 0, done = 0;
    (proj.areas || []).forEach(function (a) {
      (a.items || []).forEach(function (it) { total += 1; if (it.done) done += 1; });
    });
    return total ? Math.round(done / total * 100) : 0;
  }
  function toggleEventItem(eventId, areaId, index) {
    var all = readJSON(KEY_EVENT_PROGRESS, {}) || {};
    var proj = getEventProgress(eventId);
    (proj.areas || []).forEach(function (a) {
      if (a.id !== areaId) return;
      if (a.items[index]) a.items[index].done = !a.items[index].done;
    });
    proj.updatedAt = Date.now();
    all[eventId] = proj;
    writeJSON(KEY_EVENT_PROGRESS, all);
    return proj;
  }

  /* ——— Onboarding ——— */
  function needsOnboarding() {
    var s = load();
    if (s.onboarded || s.onboardSkipped) return false;
    var stage = readJSON(KEY_STAGE, null);
    return !stage;
  }
  function completeOnboarding(data) {
    if (data.stage) writeJSON(KEY_STAGE, data.stage);
    if (data.situations) writeJSON(KEY_SITUATIONS, data.situations.slice(0, 4));
    if (data.interests) writeJSON(KEY_INTERESTS, data.interests.slice(0, 8));
    if (data.goals) writeJSON(KEY_GOALS, data.goals.slice(0, 6));
    var s = load();
    s.onboarded = true;
    s.onboardSkipped = false;
    save(s);
    closeOnboarding();
    if (window.LivonHome && window.LivonHome.render) window.LivonHome.render();
  }
  function skipOnboarding() {
    var s = load();
    s.onboardSkipped = true;
    save(s);
    closeOnboarding();
  }
  function closeOnboarding() {
    var m = document.getElementById("livon-onboard-modal");
    if (m) m.hidden = true;
  }
  function openOnboarding() {
    var m = document.getElementById("livon-onboard-modal");
    if (!m) return;
    m.hidden = false;
    var stageHost = m.querySelector("[data-lv-onboard-stages]");
    var sitHost = m.querySelector("[data-lv-onboard-sits]");
    var goalHost = m.querySelector("[data-lv-onboard-goals]");
    var stages = (window.LivonLifeData && window.LivonLifeData.stages) || [];
    var sits = (window.LivonLifeData && window.LivonLifeData.situations) || Object.keys((window.LivonLifeEvents && window.LivonLifeEvents.situationLabels) || {});
    if (stageHost) {
      stageHost.innerHTML = stages.map(function (s) {
        return "<button type=\"button\" data-onboard-stage=\"" + esc(s.id) + "\">" + esc(s.label) + "</button>";
      }).join("");
    }
    if (sitHost) {
      sitHost.innerHTML = (Array.isArray(sits) ? sits : []).slice(0, 10).map(function (v) {
        var label = (window.LivonLifeEvents && window.LivonLifeEvents.situationLabels && window.LivonLifeEvents.situationLabels[v]) || v;
        return "<button type=\"button\" data-onboard-sit=\"" + esc(v) + "\">" + esc(label) + "</button>";
      }).join("");
    }
    if (goalHost) {
      goalHost.innerHTML = ONBOARD_GOALS.map(function (g) {
        return "<button type=\"button\" data-onboard-goal=\"" + esc(g) + "\">" + esc(g) + "</button>";
      }).join("");
    }
  }

  function profileSnapshot() {
    return {
      stage: readJSON(KEY_STAGE, ""),
      situations: readJSON(KEY_SITUATIONS, []) || [],
      interests: readJSON(KEY_INTERESTS, []) || [],
      goals: readJSON(KEY_GOALS, []) || [],
      events: readJSON(KEY_EVENTS, []) || [],
      region: load().region,
      family: load().family,
      alertPrefs: load().alertPrefs,
      folders: load().folders,
      savesCount: load().saves.length
    };
  }

  function bindPanels() {
    var root = document.querySelector("[data-livon-tools]");
    if (!root || root._platBound) return;
    root._platBound = true;

    root.addEventListener("click", function (e) {
      var qbtn = e.target.closest("[data-lv-plat-q]");
      if (qbtn) {
        e.preventDefault();
        runSearch(qbtn.getAttribute("data-lv-plat-q"), "all");
        return;
      }
      var tab = e.target.closest("[data-lv-plat-tab]");
      if (tab) {
        e.preventDefault();
        var input = document.getElementById("livon-search-input");
        runSearch(input ? input.value : "", tab.getAttribute("data-lv-plat-tab") || "all");
        return;
      }
      var res = e.target.closest("[data-lv-plat-result]");
      if (res && res.getAttribute("data-lv-plat-result")) {
        try { sessionStorage.setItem("livon.openLifeEvent", res.getAttribute("data-lv-plat-result")); } catch (err) {}
      }
      if (e.target.closest("[data-lv-plat-goto-saved]")) {
        location.hash = "ml-panel";
        try { sessionStorage.setItem("livon.mlGoto", "saved"); } catch (err) {}
      }
      if (e.target.closest("[data-lv-plat-goto-settings]")) {
        location.hash = "ml-panel";
        try { sessionStorage.setItem("livon.mlGoto", "settings"); } catch (err) {}
      }
    });

    var form = root.querySelector("[data-livon-search]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var q = new FormData(form).get("q");
        runSearch(q, "all");
      });
      var input = form.querySelector("input");
      if (input) {
        input.addEventListener("focus", function () {
          if (!String(input.value || "").trim()) runSearch("", "all");
        });
      }
    }

    var buttons = root.querySelectorAll("[data-livon-tool]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-livon-tool");
        if (id === "search") setTimeout(function () { runSearch((document.getElementById("livon-search-input") || {}).value || "", "all"); }, 0);
        if (id === "saved") refreshSavedPanel();
        if (id === "alerts") refreshAlertsPanel();
      });
    });
  }

  function bindOnboarding() {
    var m = document.getElementById("livon-onboard-modal");
    if (!m || m._bound) return;
    m._bound = true;
    var state = { stage: "", situations: [], goals: [] };
    m.addEventListener("click", function (e) {
      if (e.target.matches("[data-lv-onboard-close]") || e.target.closest("[data-lv-onboard-skip]")) {
        skipOnboarding();
        return;
      }
      var st = e.target.closest("[data-onboard-stage]");
      if (st) {
        state.stage = st.getAttribute("data-onboard-stage");
        m.querySelectorAll("[data-onboard-stage]").forEach(function (b) { b.classList.toggle("is-on", b === st); });
        return;
      }
      var sit = e.target.closest("[data-onboard-sit]");
      if (sit) {
        var v = sit.getAttribute("data-onboard-sit");
        var i = state.situations.indexOf(v);
        if (i >= 0) state.situations.splice(i, 1); else state.situations.push(v);
        sit.classList.toggle("is-on");
        return;
      }
      var g = e.target.closest("[data-onboard-goal]");
      if (g) {
        var gv = g.getAttribute("data-onboard-goal");
        var gi = state.goals.indexOf(gv);
        if (gi >= 0) state.goals.splice(gi, 1); else state.goals.push(gv);
        g.classList.toggle("is-on");
        return;
      }
      if (e.target.closest("[data-lv-onboard-apply]")) {
        completeOnboarding({
          stage: state.stage,
          situations: state.situations,
          interests: state.goals.slice(0, 8),
          goals: state.goals
        });
      }
    });
  }

  function init() {
    migrateLegacySaves();
    bindPanels();
    bindOnboarding();
    refreshSavedPanel();
    refreshAlertsPanel();
    if (needsOnboarding()) {
      setTimeout(openOnboarding, 600);
    }
    try {
      var goto = sessionStorage.getItem("livon.mlGoto");
      if (goto) {
        sessionStorage.removeItem("livon.mlGoto");
        setTimeout(function () {
          location.hash = "ml-panel";
          if (window.LivonLifeNow && window.LivonLifeNow.goto) window.LivonLifeNow.goto(goto);
        }, 400);
      }
    } catch (e) {}
  }

  window.LivonPlatform = {
    load: load,
    save: save,
    search: runSearch,
    searchAll: searchAll,
    saveItem: saveItem,
    removeSave: removeSave,
    setSaveFolder: setSaveFolder,
    listSaves: listSaves,
    folders: function () { return load().folders.slice(); },
    alertTypes: ALERT_TYPES,
    setAlertPref: setAlertPref,
    alertPrefs: function () { return load().alertPrefs; },
    getEventProgress: getEventProgress,
    progressPercent: progressPercent,
    toggleEventItem: toggleEventItem,
    profileSnapshot: profileSnapshot,
    openOnboarding: openOnboarding,
    setRegion: function (region) {
      var s = load();
      s.region = Object.assign({}, s.region, region || {});
      writeJSON(KEY_REGION, [s.region.sido, s.region.sgg].filter(Boolean).join(" ") || "");
      save(s);
      return s.region;
    },
    family: function () { return load().family; },
    init: init
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
