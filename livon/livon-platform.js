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

  /* stored value must keep the shape the caller expects (old schema / corrupted data → fallback, null entries dropped) */
  function fitShape(v, fb) { if (Array.isArray(fb)) return Array.isArray(v) ? v.filter(function (x) { return x != null; }) : fb; if (fb && typeof fb === "object") return v && typeof v === "object" && !Array.isArray(v) ? v : fb; return v; }
  function readJSON(key, fallback) {
    var UD = window.LivonUserData; if (UD) return UD.read(key, fallback);   /* repository → local adapter (same key, same JSON) */
    try {
      var raw = localStorage.getItem(key);
      return fitShape(raw ? JSON.parse(raw) : fallback, fallback);
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    var UD = window.LivonUserData; if (UD) return UD.write(key, value);
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

  /* Header search and Explore answer from the SAME index (LivonSearch: Life Stage topics, Today, Explore, policies,
     Life Events, public community posts). The older list below is kept only as a fallback when that index is missing. */
  var INDEX_KIND = {
    life: ["content", "Life Stage"], content: ["content", "콘텐츠"], event: ["content", "콘텐츠"], place: ["place", "장소"],
    service: ["service", "서비스"], class: ["service", "서비스"], policy: ["benefit", "정책·지원"], expert: ["expert", "전문가"],
    community: ["community", "커뮤니티"]
  };
  function searchIndexed(q) {
    var L = window.LivonSearch;
    if (!L || typeof L.search !== "function") return null;
    var res;
    try { res = L.search(q, {}); } catch (e) { return null; }
    if (!res || !Array.isArray(res.items)) return null;
    return res.items.map(function (x) {
      var it = x.item || {};
      var k = INDEX_KIND[it.type] || ["content", "콘텐츠"];
      var label = it.type === "life" && it.typeLabel === "Life Event" ? "Life Event" : k[1];
      return { kind: k[0], kindLabel: label, title: it.title, href: it.href, external: !!it.external, blurb: it.meta || "", eventId: it.eventId || "" };
    }).filter(function (r) { return r.title && r.href; });
  }

  function searchAll(q, tab) {
    q = String(q || "").trim();
    tab = tab || "all";
    var indexed = q ? searchIndexed(q) : [];
    if (indexed) return tab !== "all" ? indexed.filter(function (r) { return r.kind === tab; }) : indexed;
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
      cm.posts.filter(function (p) { return !p.deleted && !p.draft && (!p.visibility || p.visibility === "public"); }).forEach(function (p) {
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
      "<p class=\"livon-panel__note\"><strong>검색어 예시</strong></p><ul class=\"livon-panel__list\">" +
        popular.map(function (q) { return "<li><button type=\"button\" data-lv-plat-q=\"" + esc(q) + "\">" + esc(q) + "</button></li>"; }).join("") + "</ul>" +
      "<p class=\"livon-panel__note\"><strong>내 Life Stage 관련</strong></p><ul class=\"livon-panel__list\">" +
        suggested.map(function (q) { return "<li><button type=\"button\" data-lv-plat-q=\"" + esc(q) + "\">" + esc(q) + "</button></li>"; }).join("") + "</ul>";
  }

  function renderSearchResults(host, q, tab) {
    var results = searchAll(q, tab);
    var tabs = SEARCH_TABS.map(function (t) {
      return "<button type=\"button\" data-lv-plat-tab=\"" + t.id + "\"" + (tab === t.id ? " class=\"is-on\" data-lv-chip aria-pressed=\"true\"" : " data-lv-chip aria-pressed=\"false\"") + ">" + esc(t.label) + "</button>";
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
            return "<li><a href=\"" + esc(r.href) + "\" data-lv-plat-result=\"" + esc(r.eventId || "") + "\"" +
              (r.external ? " target=\"_blank\" rel=\"noopener noreferrer\"" : "") + ">" + esc(r.title) + (r.external ? "<span class=\"visually-hidden\"> (새 창, 공식 사이트)</span>" : "") + "</a></li>";
          }).join("") + "</ul>";
      }).join("");
    }
    host.innerHTML =
      "<div class=\"livon-search-tabs\" data-lv-plat-tabs>" + tabs + "</div>" +
      "<p class=\"livon-panel__note\">‘" + esc(q) + "’ · " + results.length + "건</p>" + body +
      (results.length ? "<p class=\"livon-panel__note\"><a href=\"#ex-results?q=" + esc(encodeURIComponent(q)) + "\" data-lv-plat-all-results>탐색에서 전체 결과 보기</a></p>" : "");
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
      title: item.title || item.label || "저장 항목",
      lifeStage: item.lifeStage || "",
      data: item.data || null,
      savedAt: Date.now(),
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
    id = String(id);
    s.saves = s.saves.filter(function (x) { return x.id !== id; });
    save(s);
    /* the legacy lists are re-imported by migrateLegacySaves (every saved-panel refresh): prune them too, or the item comes back */
    if (id.indexOf("td:") === 0) {
      var td = readJSON(KEY_TD_SAVED, []);
      if (Array.isArray(td)) {
        var tid = id.slice(3);
        var keep = td.filter(function (x) { return (x && typeof x === "object" ? (x.id || x.label) : x) !== tid; });
        if (keep.length !== td.length) writeJSON(KEY_TD_SAVED, keep);
      }
    } else if (id.indexOf("life:") === 0) {
      var life = readJSON("livon.lifeSavedLocal", []);
      if (Array.isArray(life)) {
        var name = id.slice(5);
        var rest = life.filter(function (x) { return (typeof x === "string" ? x : x && x.name) !== name; });
        if (rest.length !== life.length) writeJSON("livon.lifeSavedLocal", rest);
      }
    }
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
  /* "is this saved?" is asked once per card on a screen. The answer comes from an index of ids that is rebuilt only when
     the stored text changes, so a screen with many cards does not parse the whole store once per card. */
  var saveIndexMemo = { raw: null, ids: [], set: {} };
  function saveIndex() {
    var raw = null;
    try { raw = localStorage.getItem(KEY_PLATFORM); } catch (e) {}
    if (raw == null || raw !== saveIndexMemo.raw) {
      var ids = load().saves.map(function (x) { return String(x && x.id); }), set = {};
      ids.forEach(function (id) { set[id] = true; });
      saveIndexMemo = { raw: raw, ids: ids, set: set };
    }
    return saveIndexMemo;
  }
  function hasSave(id) { return Object.prototype.hasOwnProperty.call(saveIndex().set, String(id)); }
  function saveIds() { return saveIndex().ids.slice(); }
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
        /* old entries may be plain strings; an entry without any id is skipped (a random id would be re-added on every refresh) */
        var o = x && typeof x === "object" ? x : { id: typeof x === "string" ? x : "" };
        var key = String(o.id || o.label || "");
        if (!key) return;
        var id = "td:" + key;
        if (known[id]) return;
        known[id] = 1;
        s.saves.push({ id: id, label: o.label || o.id || "발견", type: "content", href: o.id ? "#td-item-" + o.id : "#today", folder: "나중에 보기", source: "오늘의 발견", at: o.at || 0 });
      });
    }
    var life = readJSON("livon.lifeSavedLocal", []);
    if (Array.isArray(life)) {
      life.forEach(function (x) {
        var name = typeof x === "string" ? x : x && typeof x.name === "string" ? x.name : "";
        if (!name) return;
        var id = "life:" + name;
        if (known[id]) return;
        known[id] = 1;
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
      host.innerHTML = "<ul class=\"livon-panel__list\"><li>저장된 항목이 없습니다</li><li><a href=\"#today\">오늘의 발견</a></li><li><a href=\"#explore\">탐색</a></li><li><a href=\"#ml-saved\">내 생활 저장함</a></li></ul>";
      return;
    }
    host.innerHTML = "<ul class=\"livon-panel__list\">" + list.map(function (x) {
      return "<li><a href=\"" + esc(x.href) + "\">" + esc(x.label) + "</a></li>";
    }).join("") + "<li><a href=\"#ml-saved\" data-lv-plat-goto-saved>저장함 전체</a></li></ul>";
  }

  /* ——— Alerts ——— */
  /* Alerts are derived from what is stored NOW (today's schedule, open to-dos, active Life Events) every time the panel
     refreshes, so a finished or deleted to-do disappears and a new one appears. Nothing is pushed or sent anywhere.
     Stored platform alerts of other types (none are written in V1) are kept after the derived ones. */
  var DERIVED_ALERT = /^(todo|le|sched)-|^sys-1$/;
  function localDay(d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  function currentAlerts(s) {
    var out = [];
    var today = localDay();
    var ml = readJSON(KEY_ML, null);
    var events = ml && Array.isArray(ml.events) ? ml.events : [];
    events.filter(function (e) { return e && e.date === today && e.title; })
      .sort(function (a, b) { return String(a.start || "").localeCompare(String(b.start || "")); })
      .slice(0, 3).forEach(function (e) {
        out.push({ id: "sched-" + e.id, type: "schedule", title: "오늘 일정 · " + (e.start && !e.allDay ? e.start + " " : "") + e.title, href: "#ml-calendar" });
      });
    var todos = ml && Array.isArray(ml.todos) ? ml.todos : [];
    todos.filter(function (t) { return t && !t.done && t.title; })
      .sort(function (a, b) { return String(a.due || "9999").localeCompare(String(b.due || "9999")); })
      .slice(0, 3).forEach(function (t) {
        var late = t.due && t.due < today, due = t.due && t.due === today;
        out.push({ id: "todo-" + t.id, type: "todo", title: "할 일 · " + t.title + (late ? " · 기한 지남" : due ? " · 오늘 마감" : ""), href: "#ml-todos" });
      });
    var evs = readJSON(KEY_EVENTS, []);
    var catalog = (window.LivonLifeEvents && window.LivonLifeEvents.events) || [];
    (Array.isArray(evs) ? evs : []).slice(0, 2).forEach(function (id) {
      var ev = catalog.find(function (e) { return e.id === id; });
      out.push({ id: "le-" + id, type: "lifeEvent", title: ev ? "Life Event · " + ev.title + " 준비 이어 하기" : "진행 중 Life Event를 이어서 준비해 보세요", href: "#life-events", eventId: ev ? id : "" });
    });
    out.push({ id: "sys-1", type: "system", title: "LIVON 안내 · 예약·결제는 아직 연결되지 않았습니다", href: "#explore" });
    return out.concat((s.alerts || []).filter(function (a) { return a && !DERIVED_ALERT.test(String(a.id || "")); }));
  }
  function refreshAlertsPanel() {
    var panel = document.querySelector("[data-livon-panel='alerts']");
    if (!panel) return;
    var host = panel.querySelector("[data-livon-alerts-body]");
    if (!host) return;
    var s = load();
    var prefs = s.alertPrefs || {};
    var list = currentAlerts(s).filter(function (a) { return prefs[a.type] !== false; }).slice(0, 10);
    host.innerHTML =
      "<ul class=\"livon-panel__list\">" +
        (list.length
          ? list.map(function (a) {
              return "<li><a href=\"" + esc(a.href || "#life-now") + "\"" + (a.eventId ? " data-lv-plat-result=\"" + esc(a.eventId) + "\"" : "") + ">" + esc(a.title) + "</a></li>";
            }).join("")
          : "<li>표시할 알림이 없습니다</li>") +
        "<li><a href=\"#ml-settings\" data-lv-plat-goto-settings>알림 설정</a></li>" +
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

  /* ——— Onboarding ———
     The flow lives in livon-onboarding.js (UI) and livon-personalization.js (profile, first-run state, rules).
     It is never opened automatically: this is only the shared entry point other screens call. */
  function openOnboarding(opts) {
    if (window.LivonOnboarding && typeof window.LivonOnboarding.open === "function") window.LivonOnboarding.open(opts);
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

    /* A link inside a header panel (search result, saved item, alert, profile menu) changes the route: close the panel so it
       does not stay open over the screen that was just opened. Focus is left to the router (it moves to the new screen). */
    window.addEventListener("hashchange", function () {
      Array.prototype.forEach.call(root.querySelectorAll('[data-livon-tool][aria-expanded="true"]'), function (btn) {
        btn.setAttribute("aria-expanded", "false");
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (panel) panel.hidden = true;
      });
    });

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
      /* #ml-saved / #ml-settings are real My Life routes (direct URL, refresh, back/forward) */
      if (e.target.closest("[data-lv-plat-goto-saved]")) {
        e.preventDefault();
        location.hash = "ml-saved";
      }
      if (e.target.closest("[data-lv-plat-goto-settings]")) {
        e.preventDefault();
        location.hash = "ml-settings";
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

  /* The site menu drawer (site-chrome.js, shared) closes itself only for links to other pages; LIVON's menu links are routes
     inside this page (#today, #explore …), so after one of them the drawer stayed open over the screen just opened. Close it
     through its own close control; focus then continues on the screen that was opened (not on the menu button). */
  var drawerBound = false;
  function bindDrawerClose() {
    if (drawerBound || typeof window.addEventListener !== "function") return;
    drawerBound = true;
    window.addEventListener("hashchange", function () {
      var drawer = document.getElementById("gnav-mobile-livon");
      if (!drawer || drawer.hidden) return;
      var closer = drawer.querySelector("[data-gnav-close]");
      if (!closer) return;
      var keep = document.activeElement;
      setTimeout(function () {
        if (drawer.hidden) return;
        closer.click();
        var target = keep && keep !== document.body && !drawer.contains(keep) && document.contains(keep) ? keep : null;
        if (!target) {
          /* the link was inside the drawer: continue on the screen that was opened, as the skip link does */
          var v = document.documentElement.getAttribute("data-lv-view") || "home";
          var scr = document.querySelector('main > [data-lv-screen="' + v + '"]');
          target = scr && scr.querySelector("h1") || scr;
          if (target && !target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        }
        if (target && typeof target.focus === "function") { try { target.focus({ preventScroll: true }); } catch (e) {} }
      }, 0);
    });
  }

  function init() {
    migrateLegacySaves();
    bindPanels();
    bindDrawerClose();
    refreshSavedPanel();
    refreshAlertsPanel();
    try {
      var goto = sessionStorage.getItem("livon.mlGoto");
      if (goto) {
        sessionStorage.removeItem("livon.mlGoto");
        setTimeout(function () { location.hash = "ml-" + String(goto).replace(/[^a-z-]/g, ""); }, 400);
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
    hasSave: hasSave,
    saveIds: saveIds,
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
