(function () {
  var STORE_KEY = "livon.mlStore.v1";
  var KEY_STAGE = "livon.lifeStage";
  var KEY_ML_INTERESTS = "livon.mlInterests";
  var KEY_LIFE_INTERESTS = "livon.lifeInterests";
  var KEY_SITUATIONS = "livon.lifeSituations";
  var KEY_TD_SAVED = "livon.tdSaved";
  var KEY_LIFE_SAVED = "livon.lifeSavedLocal";
  var KEY_EX_SAVED = "livon.exSaved";
  var KEY_TD_PREFS = "livon.tdPrefs";
  var KEY_RECENT = "livon.today.recent.v1"; /* 오늘의 발견·라이프 스테이지·탐색이 함께 쓰는 최근 본 항목 */
  var STORE_VERSION = 2;
  var DATA = window.LivonMyLifeData || { modules: [], checklistTemplates: [], projectTemplates: [], stages: {} };
  var GOAL_STATUSES = ["진행 중", "완료", "보류"];
  var JOURNAL_CATS = DATA.journalCategories || ["생활", "건강", "돈", "커리어", "관계", "여행", "기타"];
  var TODO_FILTERS = [{ id: "all", label: "전체" }, { id: "today", label: "오늘" }, { id: "upcoming", label: "예정" }, { id: "done", label: "완료" }];
  var TODO_SOURCES = { manual: "직접 추가", "life-stage": "라이프 스테이지", today: "오늘의 발견", "livon-ai": "LIVON AI", saved: "저장함" };
  var SAVED_TYPES = [
    { id: "all", label: "전체" }, { id: "topic", label: "라이프 스테이지" }, { id: "content", label: "콘텐츠" },
    { id: "policy", label: "정책·지원" }, { id: "service", label: "서비스" }, { id: "place", label: "장소" },
    { id: "class", label: "클래스" }, { id: "community", label: "커뮤니티" }, { id: "other", label: "기타" }
  ];
  var PRIO_RANK = { "높음": 0, "보통": 1, "낮음": 2 };

  var state = {
    savedFolder: "all",
    savedType: "all",
    todoFilter: "all",
    todoSource: "all",
    journalCat: "all",
    view: "home",
    calMonth: null,
    calMode: "month",
    calSelected: null,
    editing: null,
    formType: null,
    formPreset: null,
    formOpener: null
  };
  var bound = false;

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
  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }
  function todayStr(d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  function parseDate(s) {
    if (!s) return null;
    var p = String(s).split("-");
    if (p.length < 3) return null;
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function weekdayKo(d) {
    return ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  }
  function gnavOffset() {
    return (window.LivonStickyOffset ? window.LivonStickyOffset() : (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h"), 10) || 74) + 52) + 8;
  }
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function scrollToId(id, instant) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: instant || reducedMotion() ? "auto" : "smooth" });
  }
  function fmtMoney(n) {
    n = Number(n) || 0;
    return n.toLocaleString("ko-KR") + "원";
  }
  function uniq(list) {
    var seen = {};
    return list.filter(function (x) { if (typeof x !== "string" || !x || seen[x]) return false; seen[x] = 1; return true; });
  }
  function normTitle(s) { return String(s || "").replace(/\s+/g, " ").trim().toLowerCase(); }
  /* Internal routes only (#life/…, #today/…, #ex-…) or https links — never javascript: or bare "#". */
  function safeHref(h) {
    h = String(h || "");
    if (/^#[A-Za-z0-9][\w\-\/.?=&%:]*$/.test(h)) return h;
    if (/^https:\/\/[a-z0-9.-]+(\/|$)/i.test(h)) return h;
    return "";
  }
  function prio(t) {
    var p = t && t.priority;
    if (p === "high") return "높음";
    if (p === "medium") return "보통";
    if (p === "low") return "낮음";
    return PRIO_RANK[p] != null ? p : "보통";
  }
  function fmtDay(ds) {
    var d = parseDate(ds);
    return d ? (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + weekdayKo(d) + ")" : "";
  }
  function fmtWhen(ms) {
    if (!ms) return "";
    var d = new Date(ms);
    if (isNaN(d)) return "";
    var hh = d.getHours(), mm = d.getMinutes();
    return (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
  }
  function announce(msg) {
    var n = $("[data-lv-ml-status]");
    if (!n) return;
    n.textContent = "";
    setTimeout(function () { n.textContent = msg; }, 30);
  }

  /* ——— LIVON confirm dialog (replaces window.confirm / alert) ——— */
  var confirmState = null;
  function confirmDialog(o) {
    o = o || {};
    return new Promise(function (resolve) {
      if (confirmState) closeConfirm(false);
      var m = document.createElement("div");
      m.className = "lv-ml-modal lv-ml-modal--confirm";
      m.id = "lv-ml-confirm-modal";
      m.innerHTML =
        '<div class="lv-ml-modal__backdrop" data-lv-ml-confirm="0" aria-hidden="true"></div>' +
        '<div class="lv-ml-modal__panel" role="alertdialog" aria-modal="true" aria-labelledby="lv-ml-confirm-title" aria-describedby="lv-ml-confirm-desc">' +
          '<h2 id="lv-ml-confirm-title">' + esc(o.title || "확인") + "</h2>" +
          '<p id="lv-ml-confirm-desc">' + esc(o.body || "") + "</p>" +
          '<div class="lv-ml-form__acts">' +
            '<button type="button" class="lv-ml-btn lv-ml-btn--outline" data-lv-ml-confirm="0">' + esc(o.cancel || "취소") + "</button>" +
            '<button type="button" class="lv-ml-btn lv-ml-btn--dark' + (o.danger ? " lv-ml-btn--danger" : "") + '" data-lv-ml-confirm="1">' + esc(o.ok || "확인") + "</button>" +
          "</div>" +
        "</div>";
      confirmState = { el: m, resolve: resolve, opener: document.activeElement };
      document.body.appendChild(m);
      document.body.style.overflow = "hidden";
      var cancel = m.querySelector('button[data-lv-ml-confirm="0"]');
      if (cancel) cancel.focus();
    });
  }
  function closeConfirm(result) {
    if (!confirmState) return;
    var c = confirmState;
    confirmState = null;
    if (c.el.parentNode) c.el.parentNode.removeChild(c.el);
    if (!formIsOpen()) document.body.style.overflow = "";
    if (!result || formIsOpen()) restoreFocus(c.opener);
    c.resolve(!!result);
  }
  function restoreFocus(el) {
    if (el && document.contains(el) && typeof el.focus === "function") { el.focus(); return; }
    var head = $("[data-lv-ml-panel-title]");
    if (state.view === "home") head = $("[data-lv-ml-today-label]");
    if (head) { head.setAttribute("tabindex", "-1"); head.focus({ preventScroll: true }); }
  }
  function formIsOpen() {
    var m = $("#lv-ml-form-modal");
    return !!(m && !m.hidden);
  }
  function topModalPanel() {
    if (confirmState) return confirmState.el.querySelector(".lv-ml-modal__panel");
    if (formIsOpen()) return $("#lv-ml-form-modal .lv-ml-modal__panel");
    var age = $("#lv-ml-age-modal"); if (age && !age.hidden) return age;
    var login = $("#lv-ml-login-modal"); if (login && !login.hidden) return login;
    return null;
  }
  function trapFocus(e) {
    var panel = topModalPanel();
    if (!panel) return;
    var f = $$("button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex='-1'])", panel)
      .filter(function (x) { return x.offsetParent !== null || x.getClientRects().length; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function emptyStore() {
    return {
      events: [],
      todos: [],
      checklists: [],
      goals: [],
      habits: [],
      habitLogs: {},
      transactions: [],
      budgets: { monthly: 0, categories: {} },
      health: [],
      experiences: [],
      journal: [],
      projects: [],
      folders: [],
      settings: { weekStartsOn: 0, currency: "KRW", fontScale: "md" }
    };
  }
  function loadStore() {
    var raw = readJSON(STORE_KEY, null);
    var s = raw && typeof raw === "object" ? raw : emptyStore();
    var base = emptyStore();
    Object.keys(base).forEach(function (k) {
      if (s[k] == null) s[k] = base[k];
    });
    ["events", "todos", "checklists", "goals", "habits", "transactions", "health", "experiences", "journal", "projects"].forEach(function (k) {
      if (!Array.isArray(s[k])) s[k] = [];
    });
    if (raw && migrate(s)) saveStore(s);
    return s;
  }
  function saveStore(s) { writeJSON(STORE_KEY, s); }

  /* One-time, additive migration (v1 → v2). Nothing is deleted:
     - goal.status outside 진행 중/완료/보류 → 진행 중 (old manual `progress` is kept but no longer shown)
     - LIVON AI todo priority high/medium/low → 높음/보통/낮음, AI drafts get source "livon-ai"
     - journal entries without a category → 기타 */
  function migrate(s) {
    if ((Number(s.v) || 1) >= STORE_VERSION) return false;
    s.goals.forEach(function (g) { if (g && GOAL_STATUSES.indexOf(g.status) < 0) g.status = "진행 중"; });
    s.todos.forEach(function (t) {
      if (!t) return;
      if (t.priority && PRIO_RANK[t.priority] == null) t.priority = prio(t);
      if (!t.source && /^LIVON AI 초안/.test(String(t.note || ""))) { t.source = "livon-ai"; t.sourceHref = "#livon-ai"; }
    });
    s.journal.forEach(function (j) { if (j && JOURNAL_CATS.indexOf(j.category) < 0) j.category = "기타"; });
    /* checklist items saved by LIVON AI had no id, so they could not be checked */
    s.checklists.forEach(function (c) { (c && Array.isArray(c.items) ? c.items : []).forEach(function (it, i) { if (it && typeof it === "object" && !it.id) it.id = "ci_m" + i + "_" + Math.random().toString(36).slice(2, 7); }); });
    s.v = STORE_VERSION;
    return true;
  }

  /* ——— Data layer (UI and tests use the same functions) ——— */
  function todoBucket(t, today) {
    if (t.done) return "done";
    if (t.due && t.due <= today) return "today";
    return "upcoming";
  }
  function todoSource(t) {
    if (!t.source) return "manual";
    return TODO_SOURCES[t.source] ? t.source : "manual";
  }
  function findDuplicateTodo(store, title, exceptId) {
    var n = normTitle(title);
    if (!n) return null;
    return store.todos.find(function (t) { return !t.done && t.id !== exceptId && normTitle(t.title) === n; }) || null;
  }
  function goalLinks(store, goalId) {
    return store.todos.filter(function (t) { return t.goalId === goalId; });
  }
  /* Progress exists only when real tasks are linked — never a typed-in percentage. */
  function goalProgress(store, goal) {
    var l = goalLinks(store, goal.id);
    if (!l.length) return null;
    var d = l.filter(function (t) { return t.done; }).length;
    return { done: d, total: l.length, pct: Math.round(d / l.length * 100) };
  }
  function invalid(field, msg) { return { status: "invalid", field: field, msg: msg }; }

  function saveTodo(input, opts) {
    opts = opts || {};
    var store = loadStore();
    var title = String(input.title || "").trim();
    if (!title) return invalid("title", "할 일을 입력해 주세요.");
    if (input.due && !parseDate(input.due)) return invalid("due", "마감일을 확인해 주세요.");
    var prev = input.id ? store.todos.find(function (t) { return t.id === input.id; }) : null;
    var id = prev ? prev.id : (input.id || uid("todo"));
    if (!opts.force && (!prev || normTitle(prev.title) !== normTitle(title))) {
      var dup = findDuplicateTodo(store, title, id);
      if (dup) return { status: "duplicate", dup: dup };
    }
    var now = Date.now();
    var next = Object.assign({}, prev || {}, {
      id: id, title: title, due: input.due || "", priority: PRIO_RANK[input.priority] != null ? input.priority : "보통",
      category: input.category || (prev && prev.category) || "일상", note: input.note != null ? input.note : ((prev && prev.note) || ""),
      done: prev ? !!prev.done : false, updatedAt: now, createdAt: (prev && prev.createdAt) || now
    });
    /* source / sourceHref / sourceId from Life Stage · Today · AI are preserved on edit */
    if (!prev) ["source", "sourceHref", "sourceId"].forEach(function (k) { if (input[k]) next[k] = String(input[k]); });
    if (input.goalId && store.goals.some(function (g) { return g.id === input.goalId; })) next.goalId = input.goalId;
    else if ("goalId" in input) delete next.goalId;
    upsert(store.todos, next);
    saveStore(store);
    return { status: "ok", item: next, created: !prev };
  }
  function setTodoDone(id, done) {
    var store = loadStore();
    var t = store.todos.find(function (x) { return x.id === id; });
    if (!t) return null;
    t.done = !!done;
    t.updatedAt = Date.now();
    if (done) t.doneAt = t.updatedAt; else delete t.doneAt;
    saveStore(store);
    return t;
  }
  function saveEvent(input, opts) {
    opts = opts || {};
    var store = loadStore();
    var title = String(input.title || "").trim();
    if (!title) return invalid("title", "일정 제목을 입력해 주세요.");
    if (!parseDate(input.date)) return invalid("date", "날짜를 입력해 주세요.");
    if (!input.allDay && input.start && input.end && input.end < input.start) return invalid("end", "종료 시간은 시작 시간 이후여야 합니다.");
    var prev = input.id ? store.events.find(function (e) { return e.id === input.id; }) : null;
    var id = prev ? prev.id : (input.id || uid("event"));
    if (!opts.force && !input.allDay && input.start) {
      var clash = store.events.find(function (e) { return e.id !== id && e.date === input.date && !e.allDay && e.start === input.start; });
      if (clash) return { status: "conflict", with: clash };
    }
    var now = Date.now();
    var next = Object.assign({}, prev || {}, {
      id: id, title: title, date: input.date, start: input.allDay ? "" : (input.start || ""), end: input.allDay ? "" : (input.end || ""),
      allDay: !!input.allDay, place: input.place || "", category: input.category || "개인", note: input.note || "",
      done: prev ? !!prev.done : false, updatedAt: now, createdAt: (prev && prev.createdAt) || now
    });
    if (!prev) ["source", "sourceHref"].forEach(function (k) { if (input[k]) next[k] = String(input[k]); });
    upsert(store.events, next);
    saveStore(store);
    return { status: "ok", item: next, created: !prev };
  }
  function saveGoal(input) {
    var store = loadStore();
    var title = String(input.title || "").trim();
    if (!title) return invalid("title", "목표를 입력해 주세요.");
    if (input.start && input.due && input.due < input.start) return invalid("due", "목표일은 시작일 이후여야 합니다.");
    var prev = input.id ? store.goals.find(function (g) { return g.id === input.id; }) : null;
    var now = Date.now();
    var next = Object.assign({}, prev || {}, {
      id: prev ? prev.id : (input.id || uid("goal")), title: title, note: input.note || "", category: input.category || (prev && prev.category) || "기타",
      start: input.start || (prev && prev.start) || todayStr(), due: input.due || "",
      status: GOAL_STATUSES.indexOf(input.status) >= 0 ? input.status : ((prev && prev.status) || "진행 중"),
      updatedAt: now, createdAt: (prev && prev.createdAt) || now
    });
    upsert(store.goals, next);
    saveStore(store);
    return { status: "ok", item: next, created: !prev };
  }
  /* Set exactly which todos belong to a goal (preview → approve in the UI). */
  function setGoalTodos(goalId, ids) {
    var store = loadStore();
    if (!store.goals.some(function (g) { return g.id === goalId; })) return null;
    var now = Date.now(), changed = 0;
    store.todos.forEach(function (t) {
      var want = ids.indexOf(t.id) >= 0;
      if (want && t.goalId !== goalId) { t.goalId = goalId; t.updatedAt = now; changed++; }
      else if (!want && t.goalId === goalId) { delete t.goalId; t.updatedAt = now; changed++; }
    });
    saveStore(store);
    return changed;
  }
  function saveJournal(input) {
    var store = loadStore();
    var body = String(input.body || "").trim();
    if (!body) return invalid("body", "내용을 입력해 주세요.");
    if (!parseDate(input.date)) return invalid("date", "날짜를 입력해 주세요.");
    var prev = input.id ? store.journal.find(function (j) { return j.id === input.id; }) : null;
    var now = Date.now();
    var next = Object.assign({}, prev || {}, {
      id: prev ? prev.id : (input.id || uid("journal")), title: String(input.title || "").trim() || "기록", date: input.date,
      category: JOURNAL_CATS.indexOf(input.category) >= 0 ? input.category : "기타", mood: input.mood || (prev && prev.mood) || "보통",
      body: body, private: true, updatedAt: now, createdAt: (prev && prev.createdAt) || now
    });
    upsert(store.journal, next);
    saveStore(store);
    return { status: "ok", item: next, created: !prev };
  }
  var LIST_KEY = {
    event: "events", todo: "todos", goal: "goals", habit: "habits",
    tx: "transactions", journal: "journal", experience: "experiences",
    checklist: "checklists", project: "projects", health: "health"
  };
  /* Deleting a goal only unlinks its todos — the todos themselves are kept. */
  function removeItem(type, id) {
    var key = LIST_KEY[type];
    if (!key) return false;
    var store = loadStore();
    var before = store[key].length;
    store[key] = store[key].filter(function (x) { return x.id !== id; });
    if (store[key].length === before) return false;
    if (type === "habit" && store.habitLogs) delete store.habitLogs[id];
    if (type === "goal") store.todos.forEach(function (t) { if (t.goalId === id) { delete t.goalId; t.updatedAt = Date.now(); } });
    saveStore(store);
    return true;
  }

  /* ——— Today dashboard: priority from real deadlines, times and user-set priority only ——— */
  function priorityItems(store, now) {
    now = now || new Date();
    var t = todayStr(now);
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var out = [];
    store.todos.forEach(function (x) {
      if (!x || x.done) return;
      var p = prio(x);
      if (x.due && x.due < t) out.push({ kind: "todo", item: x, rank: 0, key: x.due, reason: "기한 지남 · " + fmtDay(x.due) });
      else if (x.due === t) out.push({ kind: "todo", item: x, rank: 2, key: String(PRIO_RANK[p]), reason: "오늘 마감" + (p === "높음" ? " · 우선순위 높음" : "") });
      else if (p === "높음") out.push({ kind: "todo", item: x, rank: 3, key: x.due || "9999", reason: "우선순위 높음" + (x.due ? " · " + fmtDay(x.due) + " 마감" : "") });
    });
    store.events.forEach(function (e) {
      if (!e || e.done || e.date !== t) return;
      if (e.allDay) { out.push({ kind: "event", item: e, rank: 1, key: "00:00", reason: "오늘 · 종일" }); return; }
      if (!e.start) { out.push({ kind: "event", item: e, rank: 1, key: "99:99", reason: "오늘 · 시간 미정" }); return; }
      var endTxt = e.end || e.start;
      var ep = endTxt.split(":");
      if ((+ep[0] * 60 + (+ep[1] || 0)) < nowMin) return; /* already over */
      out.push({ kind: "event", item: e, rank: 1, key: e.start, reason: "오늘 " + e.start + (e.end ? "–" + e.end : "") });
    });
    out.sort(function (a, b) { return a.rank - b.rank || String(a.key).localeCompare(String(b.key)); });
    return out;
  }

  /* ——— Shared saves (single LivonPlatform store) ——— */
  function savedRefKey(id) {
    id = String(id || "");
    var m = /^life-hub:(\w+):(.+)$/.exec(id);
    return m ? m[2] : id;
  }
  function savedType(x) {
    var m = /^life-hub:(\w+):/.exec(String(x.id || ""));
    var t = m ? m[1] : (x.data && x.data.kind) || "";
    if (t === "topic" || t === "guide" || t === "checklist") return "topic";
    if (t === "content" || /^td:/.test(x.id)) return "content";
    if (t === "policy" || t === "service" || t === "place" || t === "class" || t === "community") return t;
    if (/^life:/.test(x.id)) return "topic";
    return "other";
  }
  function savedTypeLabel(id) {
    var t = SAVED_TYPES.find(function (x) { return x.id === id; });
    return t ? t.label : "기타";
  }
  function unsave(id) {
    var P = window.LivonPlatform;
    if (!P || !P.removeSave) return false;
    id = String(id || "");
    /* prune legacy lists first: LivonPlatform re-imports them whenever its saved panel refreshes */
    var ref = savedRefKey(id);
    if (/^td:/.test(ref)) {
      var td = readJSON(KEY_TD_SAVED, []);
      if (Array.isArray(td)) writeJSON(KEY_TD_SAVED, td.filter(function (x) { return (x && (x.id || x)) !== ref.slice(3); }));
    } else if (/^ex:/.test(ref)) {
      var ex = readJSON(KEY_EX_SAVED, []);
      if (Array.isArray(ex)) writeJSON(KEY_EX_SAVED, ex.filter(function (x) { return (x && x.id) !== ref.slice(3); }));
    } else if (/^life:/.test(id)) {
      var life = readJSON(KEY_LIFE_SAVED, []);
      if (Array.isArray(life)) writeJSON(KEY_LIFE_SAVED, life.filter(function (x) { return (typeof x === "string" ? x : x && x.name) !== id.slice(5); }));
    }
    /* the same item may exist under its legacy id and its shared id */
    P.listSaves("all").forEach(function (x) { if (x.id === id || savedRefKey(x.id) === ref) P.removeSave(x.id); });
    if (window.LivonLifeHub && window.LivonLifeHub.saves && window.LivonLifeHub.saves.refresh) window.LivonLifeHub.saves.refresh();
    return true;
  }

  function collectedSaved() {
    var out = [];
    if (window.LivonPlatform && window.LivonPlatform.listSaves) {
      var seen = {};
      window.LivonPlatform.listSaves("all").forEach(function (x) {
        var ref = savedRefKey(x.id);
        if (seen[ref]) return;
        seen[ref] = 1;
        out.push({
          id: x.id, label: x.title || x.label || "저장 항목", source: x.source || "저장", type: savedType(x),
          href: safeHref(x.href) || "#ml-saved", at: x.savedAt || x.at || 0, folder: x.folder || ""
        });
      });
      if (out.length) return out.sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    }
    var td = readJSON(KEY_TD_SAVED, []);
    if (Array.isArray(td)) {
      td.forEach(function (x) {
        out.push({
          id: "td:" + (x.id || x.label),
          label: x.label || x.id || "저장 항목",
          source: "오늘의 발견", type: "content",
          href: x.id ? "#td-item-" + x.id : "#today",
          at: x.at || 0
        });
      });
    }
    var life = readJSON(KEY_LIFE_SAVED, []);
    if (Array.isArray(life)) {
      life.forEach(function (name) {
        if (typeof name === "string") {
          out.push({ id: "life:" + name, label: name, source: "라이프 스테이지", type: "topic", href: "#life", at: 0 });
        } else if (name && name.name) {
          out.push({ id: "life:" + name.name, label: name.name, source: "라이프 스테이지", type: "topic", href: "#life", at: name.at || 0 });
        }
      });
    }
    out.sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    return out;
  }

  function ensureModal() {
    var m = $("#lv-ml-form-modal");
    if (m) return m;
    m = document.createElement("div");
    m.className = "lv-ml-modal";
    m.id = "lv-ml-form-modal";
    m.hidden = true;
    m.innerHTML =
      '<div class="lv-ml-modal__backdrop" data-lv-ml-form-close aria-hidden="true"></div>' +
      '<div class="lv-ml-modal__panel" role="dialog" aria-modal="true" aria-labelledby="lv-ml-form-title">' +
        '<button type="button" class="lv-ml-modal__close" data-lv-ml-form-close aria-label="닫기">×</button>' +
        '<h2 id="lv-ml-form-title" data-lv-ml-form-title>추가</h2>' +
        '<form data-lv-ml-form class="lv-ml-form" novalidate></form>' +
      "</div>";
    document.body.appendChild(m);
    return m;
  }
  var FORM_LABELS = {
    event: "일정", todo: "할 일", goal: "목표", habit: "습관", tx: "거래",
    journal: "기록", experience: "경험", checklist: "체크리스트", project: "프로젝트", health: "건강 기록", link: "할 일 연결"
  };
  /* item = existing record being edited (has id); preset = defaults for a new record */
  function openForm(type, item, preset) {
    state.formType = type;
    state.editing = item && item.id ? item : null;
    state.formPreset = preset || (item && !item.id ? item : null);
    if (!formIsOpen()) state.formOpener = document.activeElement;
    var modal = ensureModal();
    var title = $("[data-lv-ml-form-title]", modal);
    var form = $("[data-lv-ml-form]", modal);
    if (title) title.textContent = type === "link" ? "목표에 할 일 연결" : (state.editing ? "수정 · " : "추가 · ") + (FORM_LABELS[type] || type);
    form.innerHTML = buildFormFields(type, state.editing || state.formPreset || {}) +
      '<p class="lv-ml-form__err" data-lv-ml-form-err role="alert"></p>' +
      '<div class="lv-ml-form__acts">' +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline" data-lv-ml-form-close>취소</button>' +
        '<button type="submit" class="lv-ml-btn lv-ml-btn--dark">' + (type === "link" ? "승인하고 연결" : "저장") + "</button>" +
      "</div>";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var first = form.querySelector("input:not([type=hidden]),textarea,select");
    if (first) first.focus();
  }
  function closeForm() {
    var modal = $("#lv-ml-form-modal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    state.formType = null;
    state.editing = null;
    state.formPreset = null;
    var opener = state.formOpener;
    state.formOpener = null;
    restoreFocus(opener);
  }
  function formError(form, name, msg) {
    var box = form.querySelector("[data-lv-ml-form-err]");
    $$("[aria-invalid]", form).forEach(function (x) { x.removeAttribute("aria-invalid"); });
    if (box) box.textContent = msg;
    var f = name ? form.querySelector('[name="' + name + '"]') : null;
    if (f) { f.setAttribute("aria-invalid", "true"); f.setAttribute("aria-describedby", "lv-ml-form-err-msg"); f.focus(); }
    if (box) box.id = "lv-ml-form-err-msg";
  }

  function field(label, html) {
    return '<label class="lv-ml-field"><span>' + esc(label) + "</span>" + html + "</label>";
  }
  function options(list, current) {
    return list.map(function (c) { return "<option" + (current === c ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("");
  }
  function buildFormFields(type, item) {
    item = item || {};
    var t = todayStr();
    if (type === "link") {
      var st = loadStore();
      var goal = st.goals.find(function (g) { return g.id === item.goalId; });
      var cands = st.todos.filter(function (x) { return x.goalId === item.goalId || (!x.goalId && !x.done); });
      return '<input type="hidden" name="goalId" value="' + esc(item.goalId || "") + '" />' +
        "<p>‘" + esc(goal ? goal.title : "") + "’ 목표에 연결할 할 일을 선택하고 승인해 주세요. 선택을 해제하면 연결만 풀리고 할 일은 그대로 남습니다.</p>" +
        (cands.length
          ? '<fieldset class="lv-ml-fieldset"><legend>할 일 선택</legend>' + cands.map(function (x) {
              return '<label class="lv-ml-check-row"><input type="checkbox" name="todo" value="' + esc(x.id) + '"' + (x.goalId === item.goalId ? " checked" : "") + " /> <span>" + esc(x.title) + (x.done ? " <small>(완료)</small>" : "") + "</span></label>";
            }).join("") + "</fieldset>"
          : '<p class="lv-ml-note">연결할 수 있는 미완료 할 일이 없습니다. 목표 카드의 ‘할 일 추가’로 새로 만들 수 있습니다.</p>');
    }
    if (type === "todo") {
      var goals = loadStore().goals.filter(function (g) { return g.status !== "완료" || g.id === item.goalId; });
      var src = item.source && TODO_SOURCES[item.source] && item.source !== "manual"
        ? '<p class="lv-ml-note">출처 · ' + esc(TODO_SOURCES[item.source]) + (safeHref(item.sourceHref) ? ' — <a href="' + esc(safeHref(item.sourceHref)) + '">원본 보기</a>' : "") + " (수정해도 출처는 유지됩니다)</p>"
        : "";
      return src + field("할 일", '<input name="title" required maxlength="120" autocomplete="off" value="' + esc(item.title || "") + '" />') +
        field("마감일 (선택)", '<input type="date" name="due" value="' + esc(item.due != null ? item.due : "") + '" />') +
        field("우선순위", '<select name="priority">' + options(DATA.todoPriorities || ["높음", "보통", "낮음"], prio(item)) + "</select>") +
        field("카테고리", '<select name="category">' + options(uniq((DATA.todoCategories || []).concat(item.category ? [item.category] : [])), item.category || "일상") + "</select>") +
        field("목표 연결 (선택)", '<select name="goalId"><option value="">연결 안 함</option>' + goals.map(function (g) {
          return '<option value="' + esc(g.id) + '"' + (g.id === item.goalId ? " selected" : "") + ">" + esc(g.title) + "</option>";
        }).join("") + "</select>") +
        field("메모", '<textarea name="note" rows="3">' + esc(item.note || "") + "</textarea>");
    }
    if (type === "goal") {
      return field("목표", '<input name="title" required maxlength="120" value="' + esc(item.title || "") + '" />') +
        field("설명", '<textarea name="note" rows="2">' + esc(item.note || "") + "</textarea>") +
        field("카테고리", '<select name="category">' + options(DATA.goalCategories || [], item.category) + "</select>") +
        field("시작일", '<input type="date" name="start" value="' + esc(item.start || t) + '" />') +
        field("목표일 (선택)", '<input type="date" name="due" value="' + esc(item.due || "") + '" />') +
        field("상태", '<select name="status">' + options(GOAL_STATUSES, item.status || "진행 중") + "</select>") +
        '<p class="lv-ml-note">진행률은 직접 입력하지 않습니다. 목표에 연결한 할 일의 완료 수로만 계산됩니다.</p>';
    }
    if (type === "journal") {
      return field("제목", '<input name="title" maxlength="80" value="' + esc(item.title || "") + '" />') +
        field("날짜", '<input type="date" name="date" required value="' + esc(item.date || t) + '" />') +
        field("분류", '<select name="category">' + options(JOURNAL_CATS, item.category || "생활") + "</select>") +
        field("기분", '<select name="mood">' + options(DATA.journalMoods || [], item.mood) + "</select>") +
        field("내용", '<textarea name="body" rows="5" required>' + esc(item.body || "") + "</textarea>") +
        '<p class="lv-ml-note">기록은 이 기기에만 비공개로 저장됩니다. LIVON은 건강·재무 기록을 진단하거나 투자 판단을 하지 않습니다.</p>';
    }
    if (type === "event") {
      return field("제목", '<input name="title" required value="' + esc(item.title || "") + '" />') +
        field("날짜", '<input type="date" name="date" required value="' + esc(item.date || t) + '" />') +
        field("시작 시간", '<input type="time" name="start" value="' + esc(item.start || "") + '" />') +
        field("종료 시간", '<input type="time" name="end" value="' + esc(item.end || "") + '" />') +
        field("종일", '<input type="checkbox" name="allDay" ' + (item.allDay ? "checked" : "") + ' />') +
        field("장소", '<input name="place" value="' + esc(item.place || "") + '" />') +
        field("카테고리", '<select name="category">' + (DATA.eventCategories || []).map(function (c) {
          return '<option' + (item.category === c ? " selected" : "") + ">" + esc(c) + "</option>";
        }).join("") + "</select>") +
        field("메모", '<textarea name="note" rows="3">' + esc(item.note || "") + "</textarea>");
    }
    if (type === "habit") {
      return field("습관", '<input name="title" required list="lv-ml-habit-list" value="' + esc(item.title || "") + '" />' +
        '<datalist id="lv-ml-habit-list">' + (DATA.habitPresets || []).map(function (h) { return "<option value=\"" + esc(h) + "\">"; }).join("") + "</datalist>") +
        field("주기", '<select name="freq"><option value="daily"' + (item.freq !== "weekly" ? " selected" : "") + '>매일</option><option value="weekly"' + (item.freq === "weekly" ? " selected" : "") + '>매주</option></select>');
    }
    if (type === "tx") {
      return field("유형", '<select name="kind"><option value="expense"' + (item.kind !== "income" ? " selected" : "") + '>지출</option><option value="income"' + (item.kind === "income" ? " selected" : "") + '>수입</option></select>') +
        field("금액", '<input type="number" min="0" name="amount" required value="' + esc(item.amount != null ? item.amount : "") + '" />') +
        field("날짜", '<input type="date" name="date" required value="' + esc(item.date || t) + '" />') +
        field("카테고리", '<select name="category">' + (DATA.moneyCategories || []).map(function (c) {
          return '<option' + (item.category === c ? " selected" : "") + ">" + esc(c) + "</option>";
        }).join("") + "</select>") +
        field("메모", '<input name="note" value="' + esc(item.note || "") + '" />');
    }
    if (type === "experience") {
      return field("활동", '<input name="title" required value="' + esc(item.title || "") + '" />') +
        field("상태", '<select name="status">' + (DATA.experienceStatuses || []).map(function (c) {
          return '<option' + (item.status === c ? " selected" : "") + ">" + esc(c) + "</option>";
        }).join("") + "</select>") +
        field("예정일", '<input type="date" name="date" value="' + esc(item.date || "") + '" />') +
        field("장소", '<input name="place" value="' + esc(item.place || "") + '" />') +
        field("예상 비용", '<input type="number" min="0" name="cost" value="' + esc(item.cost != null ? item.cost : "") + '" />') +
        field("메모", '<textarea name="note" rows="3">' + esc(item.note || "") + "</textarea>");
    }
    if (type === "checklist") {
      return field("제목", '<input name="title" required value="' + esc(item.title || "") + '" />') +
        field("설명", '<textarea name="desc" rows="2">' + esc(item.desc || "") + "</textarea>") +
        field("항목 (줄바꿈으로 구분)", '<textarea name="items" rows="5">' + esc((item.items || []).map(function (i) { return i.text || i; }).join("\n")) + "</textarea>");
    }
    if (type === "project") {
      return field("프로젝트", '<input name="title" required value="' + esc(item.title || "") + '" />') +
        field("목적", '<textarea name="purpose" rows="2">' + esc(item.purpose || "") + "</textarea>") +
        field("시작일", '<input type="date" name="start" value="' + esc(item.start || t) + '" />') +
        field("목표일", '<input type="date" name="due" value="' + esc(item.due || "") + '" />') +
        field("단계 (줄바꿈)", '<textarea name="steps" rows="5">' + esc((item.steps || []).map(function (s) { return s.text || s; }).join("\n")) + "</textarea>");
    }
    if (type === "health") {
      return field("항목", '<select name="kind">' + (DATA.healthKinds || []).map(function (c) {
        return '<option' + (item.kind === c ? " selected" : "") + ">" + esc(c) + "</option>";
      }).join("") + "</select>") +
        field("날짜", '<input type="date" name="date" required value="' + esc(item.date || t) + '" />') +
        field("값/메모", '<input name="value" value="' + esc(item.value || "") + '" placeholder="예: 30분, 7시간, 8잔" />');
    }
    return field("제목", '<input name="title" required />');
  }

  function formData(form) {
    var fd = new FormData(form);
    var o = {};
    fd.forEach(function (v, k) { o[k] = typeof v === "string" ? v.trim() : v; });
    var allDay = form.querySelector('[name="allDay"]');
    if (allDay) o.allDay = !!allDay.checked;
    return o;
  }

  function upsert(list, item) {
    var i = list.findIndex(function (x) { return x.id === item.id; });
    if (i >= 0) list[i] = item; else list.unshift(item);
    return list;
  }

  function handleResult(form, res, type, retry) {
    if (!res) return false;
    if (res.status === "invalid") { formError(form, res.field, res.msg); return false; }
    if (res.status === "duplicate") {
      confirmDialog({ title: "같은 할 일이 이미 있어요", body: "‘" + res.dup.title + "’이(가) 미완료 할 일에 있습니다. 그래도 추가할까요?", ok: "그래도 추가" })
        .then(function (ok) { if (ok) retry(); });
      return false;
    }
    if (res.status === "conflict") {
      confirmDialog({ title: "같은 시간에 일정이 있어요", body: "‘" + res.with.title + "’ 일정이 같은 날짜·시작 시간에 있습니다. 그래도 저장할까요?", ok: "그래도 저장" })
        .then(function (ok) { if (ok) retry(); });
      return false;
    }
    closeForm();
    refreshAll();
    announce((FORM_LABELS[type] || "항목") + (res.created ? "을(를) 추가했습니다." : "을(를) 저장했습니다."));
    return true;
  }

  function saveFromForm(form, opts) {
    opts = opts || {};
    var type = state.formType;
    var data = formData(form);
    var editId = state.editing && state.editing.id ? state.editing.id : "";
    var preset = state.formPreset || {};
    var retry = function () { saveFromForm(form, { force: true }); };
    if (type === "todo") {
      return handleResult(form, saveTodo({
        id: editId, title: data.title, due: data.due, priority: data.priority, category: data.category, note: data.note,
        goalId: data.goalId || "", source: preset.source, sourceHref: preset.sourceHref
      }, opts), type, retry);
    }
    if (type === "event") {
      return handleResult(form, saveEvent({
        id: editId, title: data.title, date: data.date, start: data.start, end: data.end, allDay: !!data.allDay,
        place: data.place, category: data.category, note: data.note, source: preset.source, sourceHref: preset.sourceHref
      }, opts), type, retry);
    }
    if (type === "goal") {
      return handleResult(form, saveGoal({ id: editId, title: data.title, note: data.note, category: data.category, start: data.start, due: data.due, status: data.status }), type, retry);
    }
    if (type === "journal") {
      return handleResult(form, saveJournal({ id: editId, title: data.title, date: data.date, category: data.category, mood: data.mood, body: data.body }), type, retry);
    }
    if (type === "link") {
      var ids = $$('input[name="todo"]:checked', form).map(function (x) { return x.value; });
      var changed = setGoalTodos(data.goalId, ids);
      closeForm();
      refreshAll();
      announce(changed == null ? "목표를 찾지 못했습니다." : "목표에 연결된 할 일을 저장했습니다. (" + ids.length + "개 연결)");
      return true;
    }
    var store = loadStore();
    var now = Date.now();
    var id = editId || uid(type);
    if (type === "habit") {
      if (!data.title) return formError(form, "title", "습관을 입력해 주세요.");
      upsert(store.habits, {
        id: id, title: data.title, freq: data.freq || "daily",
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "tx") {
      var amount = Number(data.amount);
      if (!data.date || !(amount >= 0)) return formError(form, "amount", "금액과 날짜를 확인해 주세요.");
      upsert(store.transactions, {
        id: id, kind: data.kind || "expense", amount: amount, date: data.date,
        category: data.category || "기타", note: data.note || "",
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "experience") {
      if (!data.title) return formError(form, "title", "활동명을 입력해 주세요.");
      upsert(store.experiences, {
        id: id, title: data.title, status: data.status || "관심 있음", date: data.date || "",
        place: data.place || "", cost: data.cost === "" ? null : Number(data.cost),
        note: data.note || "", private: true,
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "checklist") {
      if (!data.title) return formError(form, "title", "제목을 입력해 주세요.");
      var items = String(data.items || "").split("\n").map(function (line) { return line.trim(); }).filter(Boolean)
        .map(function (text, idx) {
          var prev = state.editing && state.editing.items && state.editing.items[idx];
          return Object.assign({}, prev || {}, { id: (prev && prev.id) || uid("ci"), text: text, done: prev ? !!prev.done : false });
        });
      upsert(store.checklists, Object.assign({}, state.editing || {}, {
        id: id, title: data.title, desc: data.desc || "", items: items,
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      }));
    } else if (type === "project") {
      if (!data.title) return formError(form, "title", "프로젝트 제목을 입력해 주세요.");
      var steps = String(data.steps || "").split("\n").map(function (line) { return line.trim(); }).filter(Boolean)
        .map(function (text, idx) {
          var prev = state.editing && state.editing.steps && state.editing.steps[idx];
          return { id: (prev && prev.id) || uid("ps"), text: text, done: prev ? !!prev.done : false };
        });
      upsert(store.projects, {
        id: id, title: data.title, purpose: data.purpose || "", start: data.start || todayStr(),
        due: data.due || "", steps: steps, status: "진행 중",
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "health") {
      upsert(store.health, {
        id: id, kind: data.kind || "운동", date: data.date || todayStr(), value: data.value || "",
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    }
    saveStore(store);
    closeForm();
    refreshAll();
    announce((FORM_LABELS[type] || "항목") + "을(를) 저장했습니다.");
  }

  function emptyBox(msg, actionHtml) {
    return '<div class="lv-ml-empty"><p>' + esc(msg) + "</p>" +
      (actionHtml ? '<div class="lv-ml-empty__acts">' + actionHtml + "</div>" : "") +
      "</div>";
  }

  function renderStats() {
    var host = $("[data-lv-ml-stats]");
    var label = $("[data-lv-ml-today-label]");
    if (!host) return;
    var store = loadStore();
    var t = todayStr();
    var d = new Date();
    if (label) label.textContent = d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + weekdayKo(d) + ") · 오늘의 나";
    var events = store.events.filter(function (e) { return e.date === t; });
    var todosOpen = store.todos.filter(function (x) { return !x.done && x.due && x.due <= t; });
    var goals = store.goals.filter(function (g) { return g.status === "진행 중"; });
    var habits = store.habits || [];
    var pendingHabits = habits.filter(function (h) { return !(store.habitLogs[h.id] || {})[t]; }).length;
    var reservations = events.filter(function (e) { return e.category === "예약"; }).length +
      (store.experiences || []).filter(function (x) { return x.date === t && (x.status === "참여 예정" || x.status === "계획 중"); }).length;
    var anniversaries = store.events.filter(function (e) { return e.category === "기념일" && e.date === t; }).length;
    var overdue = store.todos.filter(function (x) { return !x.done && x.due && x.due < t; }).length;
    var alerts = overdue + pendingHabits;
    host.innerHTML =
      '<div class="lv-ml-stat lv-ml-stat--hero"><p>일정</p><strong>' + events.length + "</strong><span>오늘</span></div>" +
      '<div class="lv-ml-stat"><p>할 일</p><strong>' + todosOpen.length + "</strong><span>오늘까지 마감</span></div>" +
      '<div class="lv-ml-stat"><p>목표</p><strong>' + goals.length + "</strong><span>진행 중</span></div>" +
      '<div class="lv-ml-stat"><p>습관</p><strong>' + pendingHabits + "</strong><span>오늘 실천</span></div>" +
      '<div class="lv-ml-stat"><p>예약·활동</p><strong>' + reservations + "</strong><span>오늘</span></div>" +
      '<div class="lv-ml-stat"><p>기념일</p><strong>' + anniversaries + "</strong><span>오늘</span></div>" +
      '<div class="lv-ml-stat' + (alerts ? " lv-ml-stat--alert" : "") + '"><p>확인 필요</p><strong>' + alerts + "</strong><span>기한·습관</span></div>";
  }

  function idPart(id) { return String(id || "").replace(/[^\w-]/g, "_"); }
  function sourceLine(x) {
    var src = todoSource(x);
    if (src === "manual") return "";
    var href = safeHref(x.sourceHref);
    return '<p class="lv-ml-src"><span class="lv-ml-src__k">출처</span> ' + esc(TODO_SOURCES[src]) +
      (x.note && src !== "livon-ai" ? " · " + esc(String(x.note).replace(TODO_SOURCES[src] + " · ", "").slice(0, 60)) : "") +
      (href && (src !== "livon-ai" || /^#ai-chat\//.test(href)) ? ' <a href="' + esc(href) + '">' + (src === "livon-ai" ? "대화 보기" : "원본 보기") + '<span class="visually-hidden">: ' + esc(x.title) + "</span></a>" : "") + "</p>";
  }
  function todoMeta(x, today) {
    var parts = [];
    if (x.due) parts.push((x.due < today && !x.done ? "기한 지남 · " : "") + fmtDay(x.due) + " 마감");
    else parts.push("날짜 미정");
    parts.push("우선순위 " + prio(x));
    if (x.category) parts.push(x.category);
    return parts.join(" · ");
  }
  /* One markup for a task everywhere in My Life: real checkbox + label, source link, goal, actions. */
  function todoItemHtml(x, store, opts) {
    opts = opts || {};
    var today = todayStr();
    var cid = (opts.prefix || "ml-td-") + idPart(x.id);
    var goal = x.goalId ? store.goals.find(function (g) { return g.id === x.goalId; }) : null;
    var overdue = !x.done && x.due && x.due < today;
    return '<li class="lv-ml-task' + (x.done ? " is-done" : "") + (overdue ? " is-overdue" : "") + '">' +
      '<div class="lv-ml-task__main">' +
        '<input type="checkbox" id="' + cid + '" data-lv-ml-toggle="todo" data-id="' + esc(x.id) + '"' + (x.done ? " checked" : "") + " />" +
        '<div class="lv-ml-task__body">' +
          '<label for="' + cid + '" class="lv-ml-task__title">' + esc(x.title) + (x.done ? '<span class="visually-hidden"> (완료)</span>' : "") + "</label>" +
          '<p class="lv-ml-task__meta">' + esc(opts.reason || todoMeta(x, today)) + "</p>" +
          sourceLine(x) +
          (goal && !opts.hideGoal ? '<p class="lv-ml-src"><span class="lv-ml-src__k">목표</span> <a href="#ml-goals">' + esc(goal.title) + "</a></p>" : "") +
        "</div>" +
      "</div>" +
      (opts.noActions ? "" :
        '<div class="lv-ml-row-acts">' +
          (opts.unlink ? '<button type="button" data-lv-ml-unlink="' + esc(x.id) + '" aria-label="' + esc(x.title) + ' 목표 연결 해제">연결 해제</button>' : "") +
          '<button type="button" data-lv-ml-edit="todo" data-id="' + esc(x.id) + '" aria-label="' + esc(x.title) + ' 수정">수정</button>' +
          '<button type="button" data-lv-ml-del="todo" data-id="' + esc(x.id) + '" aria-label="' + esc(x.title) + ' 삭제">삭제</button>' +
        "</div>") +
    "</li>";
  }
  /* LIVON AI hand-off: draft only, nothing is sent or saved automatically (handled by life-hub.js). */
  function aiButton(payload, text) {
    var p = Object.assign({ source: "mylife", stage: "", stageLabel: "" }, payload);
    return '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lh-ai="' + esc(JSON.stringify(p)) + '">' + esc(text || "LIVON AI에게 초안 요청") + "</button>";
  }
  function todoAiPayload(list) {
    var lines = list.slice(0, 5).map(function (t) { return "- " + t.title + (t.due ? " (" + t.due + " 마감)" : ""); });
    return {
      topicId: "todos", topicTitle: "할 일 정리", category: "내 생활 · 할 일", url: "#ml-todos",
      q: "아래 할 일의 처리 순서를 정하는 방법을 제안해 줘. 저장·변경은 하지 말고 제안만 해 줘.\n" + lines.join("\n")
    };
  }

  function renderPriority() {
    var host = $("[data-lv-ml-priority]");
    if (!host) return;
    var store = loadStore();
    var list = priorityItems(store).slice(0, 6);
    if (!list.length) {
      host.innerHTML = emptyBox("지금 먼저 볼 항목이 없어요. 기한이 지났거나 오늘 마감·오늘 일정·우선순위 ‘높음’인 항목이 생기면 여기에 표시됩니다.",
        '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="todo">할 일 추가</button> <button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-add="event">일정 추가</button>');
      return;
    }
    var todos = list.filter(function (x) { return x.kind === "todo"; }).map(function (x) { return x.item; });
    host.innerHTML = '<ul class="lv-ml-manage-list lv-ml-tasks">' + list.map(function (x) {
      if (x.kind === "todo") return todoItemHtml(x.item, store, { prefix: "ml-pr-", reason: x.reason, noActions: true });
      var e = x.item;
      return '<li class="lv-ml-task"><div class="lv-ml-task__main"><span class="lv-ml-task__dot" aria-hidden="true"></span><div class="lv-ml-task__body">' +
        '<button type="button" class="lv-ml-task__link" data-lv-ml-edit="event" data-id="' + esc(e.id) + '">' + esc(e.title) + '<span class="visually-hidden"> 일정 열기</span></button>' +
        '<p class="lv-ml-task__meta">' + esc(x.reason + (e.place ? " · " + e.place : "")) + "</p></div></div></li>";
    }).join("") + "</ul>" +
    '<div class="lv-ml-inline-acts"><button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-goto="todos">할 일 전체</button>' +
      (todos.length ? aiButton(todoAiPayload(todos), "LIVON AI에게 순서 정리 초안 요청") : "") + "</div>";
  }

  function renderTimeline() {
    var host = $("[data-lv-ml-timeline]");
    if (!host) return;
    var store = loadStore();
    var t = todayStr();
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var list = store.events.filter(function (e) { return e.date === t; })
      .sort(function (a, b) { return String(a.start || "").localeCompare(String(b.start || "")); });
    if (!list.length) {
      host.innerHTML = emptyBox("오늘 예정된 일정이 없어요.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="event">일정 추가</button>');
      return;
    }
    host.innerHTML = '<ol class="lv-ml-timeline">' + list.map(function (e) {
      var past = false;
      if (e.start && !e.allDay) {
        var parts = (e.end || e.start).split(":");
        past = (+parts[0] * 60 + (+parts[1] || 0)) < nowMin;
      }
      return '<li class="' + (past ? "is-past" : "is-soon") + (e.done ? " is-done" : "") + '">' +
        '<button type="button" data-lv-ml-edit="event" data-id="' + esc(e.id) + '">' +
          "<em>" + esc(e.allDay ? "종일" : (e.start || "시간 미정")) + "</em>" +
          "<strong>" + esc(e.title) + "</strong>" +
          "<span>" + esc([e.category, e.place].filter(Boolean).join(" · ")) + "</span>" +
        "</button>" +
        '<label class="lv-ml-check-inline"><input type="checkbox" data-lv-ml-toggle="event" data-id="' + esc(e.id) + '"' + (e.done ? " checked" : "") + ' /><span>완료<span class="visually-hidden">: ' + esc(e.title) + "</span></span></label>" +
      "</li>";
    }).join("") + "</ol>";
  }

  function renderTodayTodos() {
    var host = $("[data-lv-ml-today-todos]");
    if (!host) return;
    var store = loadStore();
    var t = todayStr();
    var due = store.todos.filter(function (x) { return x.due && x.due <= t && (!x.done || x.due === t); });
    var list = due.sort(function (a, b) { return (a.done - b.done) || String(a.due).localeCompare(String(b.due)) || (PRIO_RANK[prio(a)] - PRIO_RANK[prio(b)]); }).slice(0, 8);
    var undated = store.todos.filter(function (x) { return !x.done && !x.due; }).length;
    if (!list.length) {
      host.innerHTML = emptyBox("오늘 마감인 할 일이 없어요." + (undated ? " 날짜 미정 할 일 " + undated + "개는 할 일 탭에서 볼 수 있어요." : ""),
        '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="todo">할 일 추가</button>' +
        (undated ? ' <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ml-todos?filter=upcoming">예정 할 일 보기</a>' : ""));
      return;
    }
    var open = list.filter(function (x) { return !x.done; }).length;
    host.innerHTML = '<p class="lv-ml-note">오늘까지 마감 · 남음 ' + open + " / " + list.length + "</p>" +
      '<ul class="lv-ml-manage-list lv-ml-tasks">' + list.map(function (x) { return todoItemHtml(x, store, { prefix: "ml-tt-", noActions: true }); }).join("") + "</ul>" +
      '<p class="lv-ml-inline-acts"><a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ml-todos?filter=today">오늘 할 일 전체</a></p>';
  }

  function goalProgressHtml(store, g) {
    var p = goalProgress(store, g);
    var money = g.target > 0 ? '<p class="lv-ml-note">저축 기록 ' + esc(fmtMoney(g.current || 0)) + " / " + esc(fmtMoney(g.target)) + "</p>" : "";
    if (!p) return '<p class="lv-ml-note">연결된 할 일이 없어 진행률을 표시하지 않습니다.</p>' + money;
    return '<div class="lv-ml-progress" role="img" aria-label="연결된 할 일 ' + p.total + "개 중 " + p.done + '개 완료"><span style="width:' + p.pct + '%"></span></div>' +
      "<p>연결된 할 일 " + p.done + "/" + p.total + " 완료 · " + p.pct + "%</p>" + money;
  }

  function renderActiveGoals() {
    var host = $("[data-lv-ml-active-goals]");
    if (!host) return;
    var store = loadStore();
    var goals = store.goals.filter(function (g) { return g.status === "진행 중"; }).slice(0, 4);
    var projects = store.projects.filter(function (p) { return p.status !== "완료"; }).slice(0, 2);
    if (!goals.length && !projects.length) {
      host.innerHTML = emptyBox("진행 중인 목표·프로젝트가 없어요.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="goal">목표 만들기</button>');
      return;
    }
    host.innerHTML = '<div class="lv-ml-goal-grid">' + goals.map(function (g) {
      return '<article class="lv-ml-goal-card">' +
        "<h4>" + esc(g.title) + "</h4>" +
        goalProgressHtml(store, g) +
        '<p class="lv-ml-note">목표일 ' + esc(g.due ? fmtDay(g.due) : "미정") + "</p>" +
        '<a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ml-goals">목표 보기<span class="visually-hidden">: ' + esc(g.title) + "</span></a>" +
      "</article>";
    }).join("") + projects.map(function (p) {
      var done = (p.steps || []).filter(function (s) { return s.done; }).length;
      var total = (p.steps || []).length;
      var pct = total ? Math.round(done / total * 100) : 0;
      return '<article class="lv-ml-goal-card">' +
        "<h4>" + esc(p.title) + "</h4>" +
        (total ? '<div class="lv-ml-progress" role="img" aria-label="단계 ' + total + "개 중 " + done + '개 완료"><span style="width:' + pct + '%"></span></div><p>프로젝트 단계 ' + done + "/" + total + "</p>" : '<p class="lv-ml-note">단계가 없습니다.</p>') +
        '<a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ml-projects">프로젝트 보기<span class="visually-hidden">: ' + esc(p.title) + "</span></a>" +
      "</article>";
    }).join("") + "</div>";
  }

  function savedRowHtml(x, withActions) {
    return "<li><div><strong>" + esc(x.label) + "</strong><p>" + esc(uniq([savedTypeLabel(x.type), x.source, x.at ? fmtWhen(x.at) + " 저장" : "", x.folder]).join(" · ")) + "</p></div>" +
      '<div class="lv-ml-row-acts"><a href="' + esc(x.href) + '"' + (/^https:/.test(x.href) ? ' target="_blank" rel="noopener noreferrer"' : "") + ">원본 보기<span class=\"visually-hidden\">: " + esc(x.label) + "</span></a>" +
      (withActions
        ? '<button type="button" data-lv-ml-add-event-from-saved="' + esc(x.id) + '" aria-label="' + esc(x.label) + ' 일정에 추가">일정에 추가</button>' +
          '<button type="button" data-lv-ml-unsave="' + esc(x.id) + '" aria-label="' + esc(x.label) + ' 저장 해제">저장 해제</button>'
        : "") +
      "</div></li>";
  }

  function renderRecentSaved() {
    var host = $("[data-lv-ml-recent-saved]");
    if (!host) return;
    var list = collectedSaved().slice(0, 4);
    if (!list.length) {
      host.innerHTML = emptyBox("저장한 항목이 없어요. 라이프 스테이지·오늘의 발견·탐색에서 저장하면 여기에 모입니다.",
        '<a class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" href="#today">오늘의 발견</a> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#life">라이프 스테이지</a> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#explore">탐색</a>');
      return;
    }
    host.innerHTML = '<ul class="lv-ml-manage-list">' + list.map(function (x) { return savedRowHtml(x, false); }).join("") +
      '</ul><p class="lv-ml-inline-acts"><a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ml-saved">저장 전체</a></p>';
  }

  /* ——— Recently viewed: the shared Today/Life Stage/Explore list, resolved through the unified search index ——— */
  function recentViewed() {
    var raw = window.LivonTodayFeed && window.LivonTodayFeed.recent ? window.LivonTodayFeed.recent() : readJSON(KEY_RECENT, []);
    if (!Array.isArray(raw)) raw = [];
    var S = window.LivonSearch;
    var map = {};
    if (S && S.index) S.index().forEach(function (it) { map[it.key] = it; });
    var pending = 0;
    var out = [];
    raw.forEach(function (r) {
      if (!r || !r.key) return;
      var it = map[r.key];
      if (!it) { if (/^(lt|pol|svc):/.test(r.key)) pending++; return; }
      out.push({ key: r.key, at: r.at || 0, title: it.title, href: it.href, external: !!it.external, typeLabel: it.typeLabel || (S.typeLabel ? S.typeLabel(it.type) : "") });
    });
    if (pending && window.LivonLifeHub && window.LivonLifeHub.repo && window.LivonLifeHub.repo.status !== "ready" && !recentViewed.loading) {
      recentViewed.loading = true;
      window.LivonLifeHub.repo.load().then(function () {
        recentViewed.loading = false;
        if (document.documentElement.dataset.lvView !== "life-now") return;
        renderRecentViewed();
        if (state.view === "recent") renderPanel("recent");
      }, function () { recentViewed.loading = false; });
    }
    return { items: out, pending: pending };
  }
  function recentRowHtml(x) {
    return "<li><div><strong>" + esc(x.title) + "</strong><p>" + esc([x.typeLabel, fmtWhen(x.at) + " 봄"].filter(Boolean).join(" · ")) + "</p></div>" +
      '<div class="lv-ml-row-acts"><a href="' + esc(x.href) + '"' + (x.external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">다시 보기<span class=\"visually-hidden\">: " + esc(x.title) + (x.external ? " (새 창)" : "") + "</span></a></div></li>";
  }
  function renderRecentViewed() {
    var host = $("[data-lv-ml-recent-viewed]");
    if (!host) return;
    var r = recentViewed();
    if (!r.items.length) {
      host.innerHTML = emptyBox(r.pending ? "최근 본 항목을 불러오는 중입니다." : "최근 본 항목이 없어요. 오늘의 발견·라이프 스테이지·탐색에서 본 항목이 이 기기에 기록됩니다.",
        r.pending ? "" : '<a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#today">오늘의 발견</a>');
      return;
    }
    host.innerHTML = '<ul class="lv-ml-manage-list">' + r.items.slice(0, 4).map(recentRowHtml).join("") +
      '</ul><p class="lv-ml-inline-acts"><a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ml-recent">최근 본 항목 전체</a></p>';
  }

  function renderModules() {
    var host = $("[data-lv-ml-modules]");
    if (!host) return;
    host.innerHTML = (DATA.modules || []).map(function (m) {
      return '<a class="lv-ml-module" href="#ml-' + esc(m.id) + '">' +
        '<em aria-hidden="true">' + esc(m.kicker) + "</em><strong>" + esc(m.title) + "</strong><span>" + esc(m.desc) + "</span>" +
      "</a>";
    }).join("");
  }

  function setNav(view) {
    $$("#life-now .lv-ml-nav [data-lv-ml-goto]").forEach(function (a) {
      var on = a.getAttribute("data-lv-ml-goto") === view;
      a.classList.toggle("is-on", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  /* ——— URL state: #ml-{view}[?filter=…&source=…|cat=…|type=…|mode=…&date=…] ——— */
  function knownView(v) {
    return (DATA.modules || []).some(function (m) { return m.id === v; });
  }
  function parseMlHash(hash) {
    var h = String(hash || "").replace(/^#/, "");
    var q = "", i = h.indexOf("?");
    if (i >= 0) { q = h.slice(i + 1); h = h.slice(0, i); }
    var params = {};
    q.split("&").forEach(function (part) {
      if (!part) return;
      var kv = part.split("=");
      try { params[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || "").replace(/\+/g, " ")); } catch (e) {}
    });
    return { id: h, view: h.indexOf("ml-") === 0 ? h.slice(3) : "", params: params };
  }
  function applyParams(view, p) {
    p = p || {};
    if (view === "todos") {
      state.todoFilter = TODO_FILTERS.some(function (f) { return f.id === p.filter; }) ? p.filter : "all";
      state.todoSource = TODO_SOURCES[p.source] ? p.source : "all";
    } else if (view === "journal") {
      state.journalCat = JOURNAL_CATS.indexOf(p.cat) >= 0 ? p.cat : "all";
    } else if (view === "saved") {
      state.savedType = SAVED_TYPES.some(function (t) { return t.id === p.type; }) ? p.type : "all";
      state.savedFolder = p.folder || "all";
    } else if (view === "calendar") {
      state.calMode = p.mode === "week" || p.mode === "day" ? p.mode : "month";
      var d = parseDate(p.date);
      state.calSelected = d ? todayStr(d) : todayStr();
      state.calMonth = new Date((d || new Date()).getFullYear(), (d || new Date()).getMonth(), 1);
    }
  }
  function viewHash(view) {
    if (!view || view === "home") return "#ml-home";
    var p = [];
    function add(k, v) { p.push(k + "=" + encodeURIComponent(v)); }
    if (view === "todos") {
      if (state.todoFilter && state.todoFilter !== "all") add("filter", state.todoFilter);
      if (state.todoSource && state.todoSource !== "all") add("source", state.todoSource);
    } else if (view === "journal") {
      if (state.journalCat && state.journalCat !== "all") add("cat", state.journalCat);
    } else if (view === "saved") {
      if (state.savedType && state.savedType !== "all") add("type", state.savedType);
      if (state.savedFolder && state.savedFolder !== "all") add("folder", state.savedFolder);
    } else if (view === "calendar") {
      if (state.calMode && state.calMode !== "month") add("mode", state.calMode);
      if (state.calSelected && state.calSelected !== todayStr()) add("date", state.calSelected);
    }
    return "#ml-" + view + (p.length ? "?" + p.join("&") : "");
  }
  /* Filter changes inside a view replace the entry; switching views pushes one (back/forward work). */
  function syncUrl(view) {
    var h = viewHash(view);
    if (location.hash !== h) history.replaceState(history.state, "", h);
  }

  function gotoView(view) {
    view = view || "home";
    if (view !== "home" && !knownView(view)) view = "home";
    var h = viewHash(view);
    if (location.hash === h) { showView(view, { scroll: true }); return; }
    location.hash = h.slice(1); /* hashchange → LivonMyLife.onShow → showView */
  }
  function showView(view, opts) {
    opts = opts || {};
    state.view = view;
    setNav(view);
    refreshDashboard();
    if (view === "home") {
      if (opts.scroll) setTimeout(function () { scrollToId("ml-home", opts.instant); }, 30);
      return;
    }
    renderPanel(view);
    if (opts.scroll) setTimeout(function () { scrollToId("ml-panel", opts.instant); }, 30);
  }

  function panelTitle(view) {
    var m = (DATA.modules || []).find(function (x) { return x.id === view; });
    return m ? m.title : "관리";
  }

  function renderPanel(view) {
    var title = $("[data-lv-ml-panel-title]");
    var actions = $("[data-lv-ml-panel-actions]");
    var panel = $("[data-lv-ml-panel]");
    var sec = $("#ml-panel");
    if (!panel) return;
    if (sec) sec.hidden = false;
    if (title) title.textContent = panelTitle(view);
    if (actions) {
      var addMap = { calendar: "event", todos: "todo", goals: "goal", money: "tx", health: "health", experiences: "experience", journal: "journal", projects: "project" };
      var addLabel = { calendar: "일정 추가", todos: "할 일 추가", goals: "목표 추가", money: "거래 추가", health: "기록 추가", experiences: "경험 추가", journal: "기록 추가", projects: "프로젝트 추가" };
      actions.innerHTML = addMap[view]
        ? '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="' + addMap[view] + '">' + addLabel[view] + "</button>"
        : "";
    }
    var store = loadStore();
    if (view === "calendar") panel.innerHTML = viewCalendar(store);
    else if (view === "todos") panel.innerHTML = viewTodos(store);
    else if (view === "goals") panel.innerHTML = viewGoals(store);
    else if (view === "money") panel.innerHTML = viewMoney(store);
    else if (view === "health") panel.innerHTML = viewHealth(store);
    else if (view === "saved") panel.innerHTML = viewSaved();
    else if (view === "bookings") panel.innerHTML = viewBookings(store);
    else if (view === "interests") panel.innerHTML = viewInterests();
    else if (view === "recent") panel.innerHTML = viewRecent();
    else if (view === "experiences") panel.innerHTML = viewExperiences(store);
    else if (view === "family") panel.innerHTML = viewFamily();
    else if (view === "journal") panel.innerHTML = viewJournal(store);
    else if (view === "projects") panel.innerHTML = viewProjects(store);
    else if (view === "report") panel.innerHTML = viewReport(store);
    else if (view === "settings") panel.innerHTML = viewSettings(store);
    else panel.innerHTML = emptyBox("알 수 없는 화면입니다.", '<a class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" href="#ml-home">오늘로 이동</a>');
  }

  function chipGroup(label, items, attr, current) {
    return '<div class="lv-ml-quick__row lv-ml-filter" role="group" aria-label="' + esc(label) + '">' + items.map(function (it) {
      var on = it.id === current;
      return '<button type="button" class="lv-ml-chip-btn' + (on ? " is-on" : "") + '" ' + attr + '="' + esc(it.id) + '" aria-pressed="' + on + '">' + esc(it.label) +
        (it.count != null ? ' <span class="lv-ml-count">' + it.count + "</span>" : "") + "</button>";
    }).join("") + "</div>";
  }

  function viewCalendar(store) {
    if (!state.calMonth) state.calMonth = new Date();
    if (!state.calMode) state.calMode = "month";
    var y = state.calMonth.getFullYear(), m = state.calMonth.getMonth();
    var t = todayStr();
    var selected = state.calSelected || t;
    var mode = state.calMode;
    var modeBtns = ["month", "week", "day"].map(function (modeId) {
      var label = modeId === "month" ? "월간" : modeId === "week" ? "주간" : "일간";
      return '<button type="button" class="lv-ml-chip-btn' + (mode === modeId ? " is-on" : "") + '" data-lv-ml-cal-mode="' + modeId + '" aria-pressed="' + (mode === modeId) + '">' + label + "</button>";
    }).join("");

    function eventListHtml(dayEvents) {
      return dayEvents.length
        ? '<ul class="lv-ml-manage-list">' + dayEvents.map(function (e) {
            var eh = safeHref(e.sourceHref);
            return "<li><div><strong>" + esc(e.title) + "</strong><p>" + esc([e.allDay ? "종일" : (e.start ? e.start + (e.end ? "–" + e.end : "") : "시간 미정"), e.place, e.category].filter(Boolean).join(" · ")) + "</p>" +
              (e.note ? "<p>" + esc(String(e.note).slice(0, 120)) + "</p>" : "") + "</div>" +
              '<div class="lv-ml-row-acts">' +
                (eh ? '<a href="' + esc(eh) + '">원본 보기<span class="visually-hidden">: ' + esc(e.title) + "</span></a>" : "") +
                '<button type="button" data-lv-ml-edit="event" data-id="' + esc(e.id) + '" aria-label="' + esc(e.title) + ' 수정">수정</button>' +
                '<button type="button" data-lv-ml-del="event" data-id="' + esc(e.id) + '" aria-label="' + esc(e.title) + ' 삭제">삭제</button>' +
              "</div></li>";
          }).join("") + "</ul>"
        : emptyBox("이 날짜에 일정이 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="event" data-date="' + esc(selected) + '">이 날짜에 일정 추가</button>');
    }

    var body = "";
    if (mode === "month") {
      var first = new Date(y, m, 1);
      var startPad = first.getDay();
      var daysInMonth = new Date(y, m + 1, 0).getDate();
      var cells = ["일", "월", "화", "수", "목", "금", "토"].map(function (w) { return '<div class="lv-ml-cal__dow" aria-hidden="true">' + w + "</div>"; });
      for (var i = 0; i < startPad; i++) cells.push('<div class="lv-ml-cal__cell is-empty"></div>');
      for (var d = 1; d <= daysInMonth; d++) {
        var ds = y + "-" + (m + 1 < 10 ? "0" : "") + (m + 1) + "-" + (d < 10 ? "0" : "") + d;
        var count = store.events.filter(function (e) { return e.date === ds; }).length;
        cells.push('<button type="button" class="lv-ml-cal__cell' + (ds === t ? " is-today" : "") + (ds === selected ? " is-selected" : "") + '" data-lv-ml-cal-day="' + ds + '" aria-pressed="' + (ds === selected) + '" aria-label="' + esc(fmtDay(ds) + (ds === t ? ", 오늘" : "") + (count ? ", 일정 " + count + "개" : ", 일정 없음")) + '"><strong aria-hidden="true">' + d + "</strong>" +
          (count ? '<span aria-hidden="true">' + count + "</span>" : "") + "</button>");
      }
      body = '<div class="lv-ml-cal">' + cells.join("") + "</div>";
    } else if (mode === "week") {
      var base = new Date((selected || t) + "T12:00:00");
      var weekStart = new Date(base);
      weekStart.setDate(base.getDate() - base.getDay());
      var weekCells = [];
      for (var w = 0; w < 7; w++) {
        var wd = new Date(weekStart);
        wd.setDate(weekStart.getDate() + w);
        var wds = todayStr(wd);
        var wEvents = store.events.filter(function (e) { return e.date === wds; });
        weekCells.push('<button type="button" class="lv-ml-week__day' + (wds === t ? " is-today" : "") + (wds === selected ? " is-selected" : "") + '" data-lv-ml-cal-day="' + wds + '" aria-pressed="' + (wds === selected) + '" aria-label="' + esc(fmtDay(wds) + ", 일정 " + wEvents.length + "개") + '">' +
          "<em>" + weekdayKo(wd) + "</em><strong>" + wd.getDate() + "</strong>" +
          '<ul>' + (wEvents.slice(0, 3).map(function (e) { return "<li>" + esc(e.start ? e.start + " " : "") + esc(e.title) + "</li>"; }).join("") || "<li class=\"is-empty\">없음</li>") + "</ul></button>");
      }
      body = '<div class="lv-ml-week">' + weekCells.join("") + "</div>";
    } else {
      var dayOnly = store.events.filter(function (e) { return e.date === selected; })
        .sort(function (a, b) { return String(a.start || "").localeCompare(String(b.start || "")); });
      body = '<div class="lv-ml-dayboard">' +
        '<p class="lv-ml-dayboard__date">' + esc(fmtDay(selected)) + "</p>" +
        eventListHtml(dayOnly) +
      "</div>";
    }

    var dayEvents = store.events.filter(function (e) { return e.date === selected; })
      .sort(function (a, b) { return String(a.start || "").localeCompare(String(b.start || "")); });
    var headLabel = mode === "week"
      ? "주간 · " + selected
      : (y + "년 " + (m + 1) + "월");

    return '<div class="lv-ml-cal-toolbar">' +
      '<div class="lv-ml-cal-head">' +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-cal-nav="-1" aria-label="이전 ' + (mode === "month" ? "달" : mode === "week" ? "주" : "날") + '">이전</button>' +
        '<strong aria-live="polite">' + headLabel + "</strong>" +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-cal-nav="1" aria-label="다음 ' + (mode === "month" ? "달" : mode === "week" ? "주" : "날") + '">다음</button>' +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-cal-nav="0">오늘</button>' +
      "</div>" +
      '<div class="lv-ml-cal-modes" role="group" aria-label="보기 방식">' + modeBtns + "</div>" +
    "</div>" +
    body +
    (mode === "day" ? "" : (
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">' + esc(fmtDay(selected)) + " 일정</h3></div>" +
      eventListHtml(dayEvents)
    ));
  }

  function viewTodos(store) {
    var today = todayStr();
    var f = state.todoFilter || "all", src = state.todoSource || "all";
    var bySrc = store.todos.filter(function (t) { return src === "all" || todoSource(t) === src; });
    var counts = { all: bySrc.length, today: 0, upcoming: 0, done: 0 };
    bySrc.forEach(function (t) { counts[todoBucket(t, today)]++; });
    var list = bySrc.filter(function (t) { return f === "all" || todoBucket(t, today) === f; });
    list.sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.done) return (b.updatedAt || 0) - (a.updatedAt || 0);
      var ad = a.due || "9999-99-99", bd = b.due || "9999-99-99";
      return ad.localeCompare(bd) || (PRIO_RANK[prio(a)] - PRIO_RANK[prio(b)]) || ((b.createdAt || 0) - (a.createdAt || 0));
    });
    var srcCounts = {};
    store.todos.forEach(function (t) { var k = todoSource(t); srcCounts[k] = (srcCounts[k] || 0) + 1; });
    var srcOpts = [{ id: "all", label: "모든 출처 (" + store.todos.length + ")" }].concat(Object.keys(TODO_SOURCES).filter(function (k) { return srcCounts[k] || k === src; }).map(function (k) {
      return { id: k, label: TODO_SOURCES[k] + " (" + (srcCounts[k] || 0) + ")" };
    }));
    var filterLabel = (TODO_FILTERS.find(function (x) { return x.id === f; }) || {}).label;
    var empty;
    if (!store.todos.length) {
      empty = emptyBox("아직 할 일이 없어요. 직접 추가하거나, 라이프 스테이지·오늘의 발견의 체크리스트를 확인 후 가져올 수 있어요.",
        '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="todo">할 일 추가</button> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#life">라이프 스테이지</a> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#today">오늘의 발견</a>');
    } else {
      empty = emptyBox(f === "done" ? "완료한 할 일이 없어요." : f === "today" ? "오늘까지 마감인 할 일이 없어요." : f === "upcoming" ? "예정된 할 일이 없어요." : "조건에 맞는 할 일이 없어요.",
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-todo-reset>필터 초기화</button>');
    }
    var openList = store.todos.filter(function (t) { return !t.done; });
    var templates = (DATA.checklistTemplates || []).map(function (tpl) {
      return '<button type="button" class="lv-ml-chip-btn" data-lv-ml-import-checklist="' + esc(tpl.id) + '">' + esc(tpl.title) + "</button>";
    }).join("");
    return '<div class="lv-ml-filterbar">' +
        chipGroup("할 일 상태", TODO_FILTERS.map(function (x) { return { id: x.id, label: x.label, count: counts[x.id] }; }), "data-lv-ml-todo-filter", f) +
        '<label class="lv-ml-field lv-ml-field--inline"><span>출처</span><select data-lv-ml-todo-source>' + srcOpts.map(function (o) {
          return '<option value="' + esc(o.id) + '"' + (o.id === src ? " selected" : "") + ">" + esc(o.label) + "</option>";
        }).join("") + "</select></label>" +
      "</div>" +
      '<p class="lv-ml-note">' + esc(filterLabel) + " " + list.length + "개 표시 · ‘오늘’은 오늘까지 마감(기한 지남 포함), ‘예정’은 이후 마감 또는 날짜 미정입니다.</p>" +
      (list.length ? '<ul class="lv-ml-manage-list lv-ml-tasks">' + list.map(function (t) { return todoItemHtml(t, store); }).join("") + "</ul>" : empty) +
      (openList.length ? '<div class="lv-ml-inline-acts">' + aiButton(todoAiPayload(openList), "LIVON AI에게 순서 정리 초안 요청") +
        '<span class="lv-ml-note">AI 답변은 초안이며 할 일을 자동으로 바꾸지 않습니다.</span></div>' : "") +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">체크리스트</h3></div>' +
      '<p class="lv-ml-note">템플릿을 가져와도 기존 데이터는 덮어쓰지 않습니다.</p>' +
      '<div class="lv-ml-quick__row" role="group" aria-label="체크리스트 템플릿 가져오기">' + templates + '<button type="button" class="lv-ml-chip-btn" data-lv-ml-add="checklist">직접 만들기</button></div>' +
      '<ul class="lv-ml-manage-list" style="margin-top:1rem">' + store.checklists.map(function (c) {
        var doneN = (c.items || []).filter(function (i) { return i.done; }).length;
        var tot = (c.items || []).length || 1;
        return "<li><div><strong>" + esc(c.title) + "</strong><p>" + doneN + "/" + tot + " · " + Math.round(doneN / tot * 100) + "%</p>" +
          '<ul class="lv-ml-mini-check">' + (c.items || []).map(function (i) {
            return "<li><label><input type=\"checkbox\" data-lv-ml-check-item=\"" + esc(c.id) + "\" data-item=\"" + esc(i.id) + "\"" + (i.done ? " checked" : "") + " /> " + esc(i.text) + "</label></li>";
          }).join("") + "</ul></div>" +
          '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="checklist" data-id="' + esc(c.id) + '" aria-label="' + esc(c.title) + ' 수정">수정</button><button type="button" data-lv-ml-del="checklist" data-id="' + esc(c.id) + '" aria-label="' + esc(c.title) + ' 삭제">삭제</button></div></li>';
      }).join("") + "</ul>";
  }

  function streakFor(habitId, logs) {
    var n = 0;
    var d = new Date();
    for (var i = 0; i < 60; i++) {
      var key = todayStr(d);
      if ((logs[habitId] || {})[key]) n += 1;
      else break;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function goalCardHtml(store, g) {
    var links = goalLinks(store, g.id);
    var hid = "ml-goal-" + idPart(g.id);
    var ai = {
      topicId: "goal", topicTitle: g.title, category: "내 생활 · 목표", url: "#ml-goals",
      q: "목표 ‘" + g.title + "’" + (g.due ? " (목표일 " + g.due + ")" : "") + "를 이루기 위한 단계별 할 일 초안을 제안해 줘. 저장·변경은 하지 말고 제안만 해 줘." +
        (links.length ? "\n이미 정한 할 일:\n" + links.slice(0, 5).map(function (t) { return "- " + t.title; }).join("\n") : "")
    };
    return '<article class="lv-ml-goal-card lv-ml-goal-card--full" aria-labelledby="' + hid + '">' +
      '<div class="lv-ml-goal-card__head"><h4 id="' + hid + '">' + esc(g.title) + '</h4><span class="lv-ml-badge lv-ml-badge--' + (g.status === "완료" ? "done" : g.status === "보류" ? "hold" : "on") + '">' + esc(g.status) + "</span></div>" +
      '<p class="lv-ml-note">' + esc([g.category, (g.start ? fmtDay(g.start) : "") + " ~ " + (g.due ? fmtDay(g.due) : "목표일 미정")].filter(Boolean).join(" · ")) + "</p>" +
      (g.note ? "<p>" + esc(g.note) + "</p>" : "") +
      goalProgressHtml(store, g) +
      (links.length
        ? '<h5 class="lv-ml-subhead">연결된 할 일</h5><ul class="lv-ml-manage-list lv-ml-tasks lv-ml-tasks--compact">' + links.map(function (t) { return todoItemHtml(t, store, { prefix: "ml-gl-", hideGoal: true, unlink: true }); }).join("") + "</ul>"
        : "") +
      '<div class="lv-ml-row-acts lv-ml-row-acts--wrap">' +
        '<button type="button" data-lv-ml-add="todo" data-goal="' + esc(g.id) + '" aria-label="' + esc(g.title) + '에 새 할 일 추가">할 일 추가</button>' +
        '<button type="button" data-lv-ml-link-goal="' + esc(g.id) + '" aria-label="' + esc(g.title) + '에 기존 할 일 연결">기존 할 일 연결</button>' +
        '<button type="button" data-lv-ml-edit="goal" data-id="' + esc(g.id) + '" aria-label="' + esc(g.title) + ' 수정">수정</button>' +
        '<button type="button" data-lv-ml-del="goal" data-id="' + esc(g.id) + '" aria-label="' + esc(g.title) + ' 삭제">삭제</button>' +
      "</div>" +
      '<div class="lv-ml-inline-acts">' + aiButton(ai, "LIVON AI에게 할 일 초안 요청") + "</div>" +
    "</article>";
  }

  function viewGoals(store) {
    var t = todayStr();
    var groups = GOAL_STATUSES.map(function (st) { return { status: st, list: store.goals.filter(function (g) { return g.status === st; }) }; });
    return '<p class="lv-ml-note">진행률은 목표에 연결한 할 일의 완료 수로만 계산합니다. 목표를 삭제해도 연결된 할 일은 남습니다.</p>' +
      (store.goals.length
        ? groups.filter(function (x) { return x.list.length; }).map(function (x) {
            return '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">' + esc(x.status) + " <small>" + x.list.length + "</small></h3></div>" +
              '<div class="lv-ml-goal-grid lv-ml-goal-grid--full">' + x.list.map(function (g) { return goalCardHtml(store, g); }).join("") + "</div>";
          }).join("")
        : emptyBox("목표가 없습니다. 목표를 만들고 할 일을 연결하면 실제 완료 수로 진행 상황을 볼 수 있어요.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="goal">목표 만들기</button>')) +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">습관</h3></div>' +
      '<p class="lv-ml-note">하루 미실천이 전체 목표를 초기화하지 않습니다.</p>' +
      (store.habits.length ? '<ul class="lv-ml-manage-list">' + store.habits.map(function (h) {
        var on = !!(store.habitLogs[h.id] || {})[t];
        return "<li><label><input type=\"checkbox\" data-lv-ml-habit=\"" + esc(h.id) + "\"" + (on ? " checked" : "") + " /> <strong>" + esc(h.title) + "</strong></label>" +
          "<p>연속 " + streakFor(h.id, store.habitLogs) + "일 · " + esc(h.freq === "weekly" ? "매주" : "매일") + "</p>" +
          '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="habit" data-id="' + esc(h.id) + '" aria-label="' + esc(h.title) + ' 수정">수정</button><button type="button" data-lv-ml-del="habit" data-id="' + esc(h.id) + '" aria-label="' + esc(h.title) + ' 삭제">삭제</button></div></li>';
      }).join("") + "</ul>" : emptyBox("습관이 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="habit">습관 추가</button>'));
  }

  function viewMoney(store) {
    var now = new Date();
    var ym = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1);
    var monthTx = store.transactions.filter(function (x) { return String(x.date || "").indexOf(ym) === 0; });
    var income = monthTx.filter(function (x) { return x.kind === "income"; }).reduce(function (a, b) { return a + (b.amount || 0); }, 0);
    var expense = monthTx.filter(function (x) { return x.kind !== "income"; }).reduce(function (a, b) { return a + (b.amount || 0); }, 0);
    var budget = Number(store.budgets.monthly) || 0;
    var remain = budget ? budget - expense : null;
    var byCat = {};
    monthTx.filter(function (x) { return x.kind !== "income"; }).forEach(function (x) {
      byCat[x.category || "기타"] = (byCat[x.category || "기타"] || 0) + (x.amount || 0);
    });
    return '<div class="lv-ml-stats">' +
      '<div class="lv-ml-stat"><p>이번 달 수입</p><strong>' + fmtMoney(income) + "</strong></div>" +
      '<div class="lv-ml-stat"><p>이번 달 지출</p><strong>' + fmtMoney(expense) + "</strong></div>" +
      '<div class="lv-ml-stat"><p>예산</p><strong>' + (budget ? fmtMoney(budget) : "미설정") + "</strong></div>" +
      '<div class="lv-ml-stat"><p>남은 예산</p><strong>' + (remain == null ? "—" : fmtMoney(remain)) + "</strong>" +
        (remain != null && remain < 0 ? "<span>초과</span>" : "") + "</div>" +
    "</div>" +
    '<form class="lv-ml-inline-form" data-lv-ml-budget-form><label>월 예산 <input type="number" min="0" name="monthly" value="' + esc(budget || "") + '" /></label><button type="submit" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm">예산 저장</button></form>' +
    '<p class="lv-ml-note">계좌·카드 자동 수집은 연결되어 있지 않습니다. 직접 기록한 금액만 집계합니다.</p>' +
    '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">카테고리별 지출</h3></div>' +
    (Object.keys(byCat).length
      ? '<ul class="lv-ml-bar-list">' + Object.keys(byCat).map(function (k) {
          var pct = expense ? Math.round(byCat[k] / expense * 100) : 0;
          return "<li><span>" + esc(k) + "</span><div class=\"lv-ml-progress\"><span style=\"width:" + pct + '%"></span></div><em>' + fmtMoney(byCat[k]) + "</em></li>";
        }).join("") + "</ul>"
      : emptyBox("이번 달 지출 기록이 없습니다.")) +
    '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">최근 거래</h3></div>' +
    '<ul class="lv-ml-manage-list">' + store.transactions.slice(0, 30).map(function (x) {
      return "<li><div><strong>" + esc((x.kind === "income" ? "+" : "-") + fmtMoney(x.amount)) + "</strong><p>" + esc([x.date, x.category, x.note].filter(Boolean).join(" · ")) + "</p></div>" +
        '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="tx" data-id="' + esc(x.id) + '">수정</button><button type="button" data-lv-ml-del="tx" data-id="' + esc(x.id) + '">삭제</button></div></li>';
    }).join("") + "</ul>";
  }

  function viewHealth(store) {
    return '<p class="lv-ml-note">건강 기록은 이 기기에만 저장되며 기본 비공개입니다. 의료 진단·예측을 제공하지 않습니다. FitOn 등 외부 연동은 준비되지 않았습니다.</p>' +
      (store.health.length
        ? '<ul class="lv-ml-manage-list">' + store.health.slice(0, 40).map(function (h) {
            return "<li><div><strong>" + esc(h.kind) + "</strong><p>" + esc([h.date, h.value].filter(Boolean).join(" · ")) + "</p></div>" +
              '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="health" data-id="' + esc(h.id) + '">수정</button><button type="button" data-lv-ml-del="health" data-id="' + esc(h.id) + '">삭제</button></div></li>';
          }).join("") + "</ul>"
        : emptyBox("건강 기록이 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="health">기록 추가</button>')) +
      '<p style="margin-top:1rem"><a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#explore">관련 생활 서비스 탐색</a></p>';
  }

  function viewSaved() {
    var folders = (window.LivonPlatform && window.LivonPlatform.folders) ? window.LivonPlatform.folders() : ["나중에 보기"];
    var folder = state.savedFolder || "all";
    var type = state.savedType || "all";
    var all = collectedSaved();
    var inFolder = folder === "all" ? all : all.filter(function (x) { return x.folder === folder || (folder === "나중에 보기" && !x.folder); });
    var counts = { all: inFolder.length };
    inFolder.forEach(function (x) { counts[x.type] = (counts[x.type] || 0) + 1; });
    var list = type === "all" ? inFolder : inFolder.filter(function (x) { return x.type === type; });
    var types = SAVED_TYPES.filter(function (t) { return t.id === "all" || counts[t.id] || t.id === type; }).map(function (t) { return { id: t.id, label: t.label, count: counts[t.id] || 0 }; });
    return '<p class="lv-ml-note">라이프 스테이지·오늘의 발견·탐색에서 저장한 항목이 한 저장소에 모입니다. 여기서 저장을 해제하면 원래 화면에도 바로 반영됩니다.</p>' +
      '<div class="lv-ml-filterbar">' +
        chipGroup("저장 종류", types, "data-lv-ml-saved-type", type) +
        '<label class="lv-ml-field lv-ml-field--inline"><span>폴더</span><select data-lv-ml-saved-folder-select><option value="all"' + (folder === "all" ? " selected" : "") + ">모든 폴더</option>" +
          folders.map(function (f) { return '<option value="' + esc(f) + '"' + (folder === f ? " selected" : "") + ">" + esc(f) + "</option>"; }).join("") + "</select></label>" +
      "</div>" +
      (list.length
        ? '<ul class="lv-ml-manage-list">' + list.map(function (x) { return savedRowHtml(x, true); }).join("") + "</ul>"
        : all.length
          ? emptyBox("이 조건에 맞는 저장 항목이 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-saved-reset>필터 초기화</button>')
          : emptyBox("저장한 항목이 없습니다. 관심 있는 주제·콘텐츠·장소를 저장하면 여기에서 모아 볼 수 있어요.", '<a class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" href="#life">라이프 스테이지</a> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#today">오늘의 발견</a> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#explore">탐색</a>'));
  }

  /* 예약: LIVON has no booking backend — honest empty state plus the user's own "예약" events. */
  function viewBookings(store) {
    var t = todayStr();
    var mine = store.events.filter(function (e) { return e.category === "예약"; })
      .sort(function (a, b) { return String(a.date + (a.start || "")).localeCompare(String(b.date + (b.start || ""))); });
    var upcoming = mine.filter(function (e) { return e.date >= t; });
    var past = mine.filter(function (e) { return e.date < t; });
    function rows(list) {
      return '<ul class="lv-ml-manage-list">' + list.map(function (e) {
        return "<li><div><strong>" + esc(e.title) + "</strong><p>" + esc([fmtDay(e.date), e.allDay ? "종일" : e.start, e.place].filter(Boolean).join(" · ")) + "</p></div>" +
          '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="event" data-id="' + esc(e.id) + '" aria-label="' + esc(e.title) + ' 수정">수정</button>' +
          '<button type="button" data-lv-ml-del="event" data-id="' + esc(e.id) + '" aria-label="' + esc(e.title) + ' 삭제">삭제</button></div></li>';
      }).join("") + "</ul>";
    }
    return '<div class="lv-ml-empty lv-ml-empty--info">' +
        '<span class="lv-ml-badge">연결 전</span>' +
        "<h3>LIVON 예약은 아직 연결되지 않았어요</h3>" +
        "<p>LIVON에서 직접 예약·결제한 내역은 없습니다. 기관·장소·클래스 예약은 각 공식 사이트에서 진행해 주세요. 공식 사이트에서 예약한 일정은 ‘예약’ 일정으로 직접 기록해 둘 수 있습니다.</p>" +
        '<div class="lv-ml-empty__acts"><a class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" href="#explore">탐색에서 찾기</a>' +
          '<a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ex-results?type=place">장소 둘러보기</a>' +
          '<a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ex-results?type=class">클래스 둘러보기</a>' +
          '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-add="event" data-category="예약">예약 일정 직접 기록</button></div>' +
      "</div>" +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">직접 기록한 예약 일정</h3></div>' +
      (upcoming.length ? rows(upcoming) : emptyBox("다가오는 예약 일정이 없습니다.")) +
      (past.length ? '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">지난 예약 일정</h3></div>' + rows(past.reverse().slice(0, 20)) : "");
  }

  /* 관심사: livon.lifeInterests is what Today For You, Home and Life Stage read (Today also merges tdPrefs.interests). */
  function readInterests() {
    var life = readJSON(KEY_LIFE_INTERESTS, []);
    var td = readJSON(KEY_TD_PREFS, null);
    return uniq([].concat(Array.isArray(life) ? life : [], td && Array.isArray(td.interests) ? td.interests : []));
  }
  function addInterest(name) {
    name = String(name || "").replace(/\s+/g, " ").trim().slice(0, 20);
    if (!name) return { status: "invalid", msg: "관심사를 입력해 주세요." };
    var cur = readInterests();
    if (cur.indexOf(name) >= 0) return { status: "exists" };
    if (cur.length >= 20) return { status: "invalid", msg: "관심사는 20개까지 저장할 수 있어요." };
    var life = readJSON(KEY_LIFE_INTERESTS, []);
    writeJSON(KEY_LIFE_INTERESTS, uniq((Array.isArray(life) ? life : []).concat([name])));
    var ml = readJSON(KEY_ML_INTERESTS, []);
    if (Array.isArray(ml) && ml.indexOf(name) < 0) writeJSON(KEY_ML_INTERESTS, ml.concat([name]).slice(-40));
    return { status: "ok" };
  }
  function removeInterest(name) {
    var life = readJSON(KEY_LIFE_INTERESTS, []);
    if (Array.isArray(life)) writeJSON(KEY_LIFE_INTERESTS, life.filter(function (x) { return x !== name; }));
    var ml = readJSON(KEY_ML_INTERESTS, []);
    if (Array.isArray(ml)) writeJSON(KEY_ML_INTERESTS, ml.filter(function (x) { return x !== name; }));
    var td = readJSON(KEY_TD_PREFS, null);
    if (td && Array.isArray(td.interests) && td.interests.indexOf(name) >= 0) {
      td.interests = td.interests.filter(function (x) { return x !== name; });
      writeJSON(KEY_TD_PREFS, td);
    }
    return { status: "ok" };
  }
  function viewInterests() {
    var cur = readInterests();
    var tdOpts = window.LivonTodayData && Array.isArray(window.LivonTodayData.interests) ? window.LivonTodayData.interests : [];
    var opts = uniq((DATA.interestOptions || []).concat(tdOpts)).filter(function (x) { return cur.indexOf(x) < 0; });
    return '<p class="lv-ml-note">관심사는 이 기기에 저장되며 오늘의 발견 ‘나를 위한 추천’, 홈, 라이프 스테이지가 같은 값을 사용합니다.</p>' +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">내 관심사 <small>' + cur.length + "</small></h3></div>" +
      (cur.length
        ? '<ul class="lv-ml-tags" aria-label="내 관심사">' + cur.map(function (x) {
            return '<li><span>' + esc(x) + '</span><button type="button" data-lv-ml-interest-remove="' + esc(x) + '" aria-label="' + esc(x) + ' 관심사 삭제">×</button></li>';
          }).join("") + "</ul>"
        : emptyBox("아직 관심사가 없어요. 아래에서 고르거나 직접 입력해 주세요.")) +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">관심사 추가</h3></div>' +
      (opts.length ? '<div class="lv-ml-quick__row" role="group" aria-label="추천 관심사">' + opts.map(function (x) {
        return '<button type="button" class="lv-ml-chip-btn" data-lv-ml-interest-add="' + esc(x) + '"><span aria-hidden="true">+ </span>' + esc(x) + '<span class="visually-hidden"> 관심사 추가</span></button>';
      }).join("") + "</div>" : "") +
      '<form class="lv-ml-inline-form" data-lv-ml-interest-form><label class="lv-ml-field"><span>직접 입력</span><input name="interest" maxlength="20" autocomplete="off" placeholder="예: 캠핑, 재테크 공부" /></label>' +
        '<button type="submit" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm">추가</button></form>' +
      '<p class="lv-ml-inline-acts"><a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#today">오늘의 발견에서 추천 보기</a> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ml-settings">라이프 스테이지·상황 설정</a></p>';
  }

  function viewRecent() {
    var r = recentViewed();
    return '<p class="lv-ml-note">오늘의 발견·라이프 스테이지·탐색에서 연 항목이 이 기기에 최대 12개까지 기록됩니다.</p>' +
      (r.items.length
        ? '<ul class="lv-ml-manage-list">' + r.items.map(recentRowHtml).join("") + "</ul>" +
          '<p class="lv-ml-inline-acts"><button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-recent-clear>최근 본 기록 지우기</button></p>'
        : emptyBox(r.pending ? "최근 본 항목을 불러오는 중입니다." : "최근 본 항목이 없어요.", '<a class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" href="#today">오늘의 발견</a> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#life">라이프 스테이지</a> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#explore">탐색</a>'));
  }

  function viewExperiences(store) {
    return store.experiences.length
      ? '<ul class="lv-ml-manage-list">' + store.experiences.map(function (x) {
          return "<li><div><strong>" + esc(x.title) + "</strong><p>" + esc([x.status, x.date, x.place].filter(Boolean).join(" · ")) + "</p></div>" +
            '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="experience" data-id="' + esc(x.id) + '">수정</button><button type="button" data-lv-ml-del="experience" data-id="' + esc(x.id) + '">삭제</button></div></li>';
        }).join("") + "</ul>"
      : emptyBox("경험·활동이 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="experience">경험 계획 추가</button> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#today">오늘의 발견</a>');
  }

  function viewFamily() {
    return '<div class="lv-ml-empty">' +
      '<span class="lv-ml-badge">준비 중</span>' +
      "<h3>Family Space</h3>" +
      "<p>나와 가족(예: 엄마·아빠·배우자·자녀)을 초대하고, 동의한 일정·할 일·돌봄 정보만 공유하는 구조를 준비 중입니다. 초대·권한·결제는 아직 연결되지 않았습니다.</p>" +
      '<ul class="lv-ml-manage-list" style="text-align:left;margin:1rem 0">' +
        "<li><div><strong>나</strong><p>기본 프로필 · 이 기기</p></div></li>" +
        "<li><div><strong>가족 초대</strong><p>확장 예정 · 인증 후 제공</p></div></li>" +
        "<li><div><strong>공유 범위</strong><p>선택한 항목만 · 동의 없이 수집하지 않음</p></div></li>" +
      "</ul>" +
      '<div class="lv-ml-actions"><a class="lv-ml-btn lv-ml-btn--dark" href="/ongil-start/#care">Ongil 돌봄</a>' +
      '<a class="lv-ml-btn lv-ml-btn--outline" href="#life-family">생애 단계로 가족 탐색</a>' +
      '<button type="button" class="lv-ml-btn lv-ml-btn--outline" data-lv-ml-goto="calendar">개인 일정</button></div>' +
    "</div>";
  }

  function viewJournal(store) {
    var cat = state.journalCat || "all";
    var counts = { all: store.journal.length };
    store.journal.forEach(function (j) { var c = j.category || "기타"; counts[c] = (counts[c] || 0) + 1; });
    var list = store.journal.filter(function (j) { return cat === "all" || (j.category || "기타") === cat; })
      .sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")) || ((b.createdAt || 0) - (a.createdAt || 0)); });
    var chips = [{ id: "all", label: "전체", count: counts.all }].concat(JOURNAL_CATS.map(function (c) { return { id: c, label: c, count: counts[c] || 0 }; }));
    return '<p class="lv-ml-note">기록은 기본 비공개이며 커뮤니티에 자동 게시되지 않습니다. 건강·돈 기록은 직접 남긴 메모이며 LIVON은 의료·투자 판단을 하지 않습니다.</p>' +
      chipGroup("기록 분류", chips, "data-lv-ml-journal-cat", cat) +
      (list.length
        ? '<ul class="lv-ml-manage-list">' + list.map(function (j) {
            return "<li><div><strong>" + esc(j.title || "기록") + "</strong><p>" + esc([fmtDay(j.date) || j.date, j.category || "기타", j.mood].filter(Boolean).join(" · ")) + '</p><p class="lv-ml-journal-body">' + esc((j.body || "").slice(0, 240)) + "</p></div>" +
              '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="journal" data-id="' + esc(j.id) + '" aria-label="' + esc(j.title || "기록") + ' 수정">수정</button><button type="button" data-lv-ml-del="journal" data-id="' + esc(j.id) + '" aria-label="' + esc(j.title || "기록") + ' 삭제">삭제</button></div></li>';
          }).join("") + "</ul>"
        : store.journal.length
          ? emptyBox("‘" + cat + "’ 분류의 기록이 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-journal-cat="all">전체 보기</button>')
          : emptyBox("기록이 없습니다. 오늘 있었던 일이나 생각을 짧게 남겨 보세요.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="journal">기록 작성</button>'));
  }

  function viewProjects(store) {
    var tpls = (DATA.projectTemplates || []).map(function (p) {
      return '<button type="button" class="lv-ml-chip-btn" data-lv-ml-import-project="' + esc(p.id) + '">' + esc(p.title) + "</button>";
    }).join("");
    return '<p class="lv-ml-note">라이프 스테이지 가이드를 프로젝트로 가져올 수 있습니다. 선택하지 않은 항목은 자동 생성하지 않습니다.</p>' +
      '<div class="lv-ml-quick__row">' + tpls + '<button type="button" class="lv-ml-chip-btn" data-lv-ml-add="project">직접 만들기</button></div>' +
      (store.projects.length
        ? '<ul class="lv-ml-manage-list" style="margin-top:1rem">' + store.projects.map(function (p) {
            var done = (p.steps || []).filter(function (s) { return s.done; }).length;
            var tot = (p.steps || []).length || 1;
            return "<li><div><strong>" + esc(p.title) + "</strong><p>" + done + "/" + tot + " · " + Math.round(done / tot * 100) + "%</p>" +
              '<ul class="lv-ml-mini-check">' + (p.steps || []).map(function (s) {
                return "<li><label><input type=\"checkbox\" data-lv-ml-project-step=\"" + esc(p.id) + "\" data-item=\"" + esc(s.id) + "\"" + (s.done ? " checked" : "") + " /> " + esc(s.text) + "</label></li>";
              }).join("") + "</ul></div>" +
              '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="project" data-id="' + esc(p.id) + '">수정</button><button type="button" data-lv-ml-del="project" data-id="' + esc(p.id) + '">삭제</button></div></li>';
          }).join("") + "</ul>"
        : emptyBox("프로젝트가 없습니다."));
  }

  function viewReport(store) {
    var t = todayStr();
    var weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    var weekStart = todayStr(weekAgo);
    var weekEvents = store.events.filter(function (e) { return e.date >= weekStart; }).length;
    var todos = store.todos;
    var todoDone = todos.filter(function (x) { return x.done; }).length;
    var todoRate = todos.length ? Math.round(todoDone / todos.length * 100) : null;
    var goals = store.goals;
    var linkedGoals = goals.map(function (g) { return goalProgress(store, g); }).filter(Boolean);
    var avgGoal = linkedGoals.length ? Math.round(linkedGoals.reduce(function (a, p) { return a + p.pct; }, 0) / linkedGoals.length) : null;
    var habitsDone = store.habits.filter(function (h) { return (store.habitLogs[h.id] || {})[t]; }).length;
    var now = new Date();
    var ym = now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1);
    var monthTx = store.transactions.filter(function (x) { return String(x.date || "").indexOf(ym) === 0; });
    var income = monthTx.filter(function (x) { return x.kind === "income"; }).reduce(function (a, b) { return a + b.amount; }, 0);
    var expense = monthTx.filter(function (x) { return x.kind !== "income"; }).reduce(function (a, b) { return a + b.amount; }, 0);
    return '<p class="lv-ml-note">통계는 이 기기에 저장된 실제 데이터만 사용합니다.</p>' +
      '<div class="lv-ml-stats">' +
        '<div class="lv-ml-stat"><p>최근 7일 일정</p><strong>' + weekEvents + "</strong></div>" +
        '<div class="lv-ml-stat"><p>할 일 완료율</p><strong>' + (todoRate == null ? "—" : todoRate + "%") + "</strong></div>" +
        '<div class="lv-ml-stat"><p>목표 진행 (연결된 할 일 기준)</p><strong>' + (avgGoal == null ? "—" : avgGoal + "%") + "</strong></div>" +
        '<div class="lv-ml-stat"><p>오늘 습관</p><strong>' + habitsDone + "/" + store.habits.length + "</strong></div>" +
        '<div class="lv-ml-stat"><p>이번 달 수입</p><strong>' + fmtMoney(income) + "</strong></div>" +
        '<div class="lv-ml-stat"><p>이번 달 지출</p><strong>' + fmtMoney(expense) + "</strong></div>" +
        '<div class="lv-ml-stat"><p>경험</p><strong>' + store.experiences.length + "</strong></div>" +
        '<div class="lv-ml-stat"><p>기록</p><strong>' + store.journal.length + "</strong></div>" +
      "</div>";
  }

  function viewSettings() {
    var store = loadStore();
    var snap = (window.LivonPlatform && window.LivonPlatform.profileSnapshot) ? window.LivonPlatform.profileSnapshot() : {};
    var prefs = (window.LivonPlatform && window.LivonPlatform.alertPrefs) ? window.LivonPlatform.alertPrefs() : {};
    var types = (window.LivonPlatform && window.LivonPlatform.alertTypes) ? window.LivonPlatform.alertTypes : [];
    var region = snap.region || {};
    var stageTxt = snap.stage ? String(snap.stage) : "미설정";
    var sitTxt = (snap.situations || []).join(" · ") || "없음";
    var evTxt = (snap.events || []).join(", ") || "없음";
    return '<p class="lv-ml-note">민감한 정보는 필수 입력이 아닙니다. 값은 이 기기에만 저장됩니다.</p>' +
      '<div class="lv-ml-block-label"><p class="lv-ml-kicker">Profile</p><h3 class="lv-ml-title lv-ml-title--md">기본 · Life Stage</h3></div>' +
      '<ul class="lv-ml-manage-list">' +
        "<li><div><strong>Life Stage</strong><p>" + esc(stageTxt) + '</p></div><div class="lv-ml-row-acts"><a href="#life-setup">변경</a></div></li>' +
        "<li><div><strong>생활 상황</strong><p>" + esc(sitTxt) + "</p></div></li>" +
        "<li><div><strong>관심사</strong><p>" + esc(readInterests().join(" · ") || "없음") + '</p></div><div class="lv-ml-row-acts"><a href="#ml-interests">관리</a></div></li>' +
        "<li><div><strong>진행 중 Life Event</strong><p>" + esc(evTxt) + '</p></div><div class="lv-ml-row-acts"><a href="#life-events">관리</a></div></li>' +
        "<li><div><strong>저장</strong><p>" + esc(String(snap.savesCount || 0)) + '개</p></div><div class="lv-ml-row-acts"><a href="#ml-saved">저장 보기</a></div></li>' +
      "</ul>" +
      '<div class="lv-ml-block-label" style="margin-top:1.5rem"><p class="lv-ml-kicker">Region</p><h3 class="lv-ml-title lv-ml-title--md">지역 설정</h3></div>' +
      '<p class="lv-ml-note">시/도 → 시/군/구. 위치 데이터가 없는 항목을 지도에 임의 표시하지 않습니다.</p>' +
      '<label class="lv-ml-field">시/도<input data-lv-ml-region-sido value="' + esc(region.sido || "") + '" placeholder="예: 서울" maxlength="20" /></label>' +
      '<label class="lv-ml-field">시/군/구<input data-lv-ml-region-sgg value="' + esc(region.sgg || "") + '" placeholder="예: 마포구" maxlength="20" /></label>' +
      '<p style="margin-top:0.75rem"><button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-region-save>지역 저장</button></p>' +
      '<div class="lv-ml-block-label" style="margin-top:1.5rem"><p class="lv-ml-kicker">Alerts</p><h3 class="lv-ml-title lv-ml-title--md">알림 종류 ON/OFF</h3></div>' +
      '<ul class="lv-ml-manage-list">' + types.map(function (a) {
        return "<li><div><strong>" + esc(a.label) + "</strong><p>" + ((a.id === "booking" || a.id === "family") ? "준비 중" : "선호 설정") + "</p></div>" +
          '<div class="lv-ml-row-acts"><label><input type="checkbox" data-lv-ml-alert="' + esc(a.id) + '"' + (prefs[a.id] !== false ? " checked" : "") + " /> 받기</label></div></li>";
      }).join("") + "</ul>" +
      '<p class="lv-ml-note" style="margin-top:1rem">앱 설정 · 주 시작 ' + esc(String((store.settings && store.settings.weekStartsOn) || 0)) + " · " + esc((store.settings && store.settings.currency) || "KRW") + "</p>" +
      '<p><button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-onboard-reopen>온보딩 다시 보기</button></p>';
  }


  function refreshDashboard() {
    renderStats();
    renderPriority();
    renderTimeline();
    renderTodayTodos();
    renderActiveGoals();
    renderRecentSaved();
    renderRecentViewed();
    renderModules();
  }

  function refreshAll() {
    refreshDashboard();
    if (state.view && state.view !== "home") renderPanel(state.view);
  }

  function findItem(type, id) {
    var store = loadStore();
    var map = {
      event: store.events, todo: store.todos, goal: store.goals, habit: store.habits,
      tx: store.transactions, journal: store.journal, experience: store.experiences,
      checklist: store.checklists, project: store.projects, health: store.health
    };
    var list = map[type] || [];
    return list.find(function (x) { return x.id === id; }) || null;
  }

  function itemLabel(type, item) {
    if (!item) return "";
    return item.title || item.kind || (type === "tx" ? fmtMoney(item.amount) : "") || "항목";
  }
  function deleteItem(type, id) {
    var item = findItem(type, id);
    if (!item) return;
    var name = FORM_LABELS[type] || "항목";
    var extra = "";
    if (type === "goal") {
      var n = goalLinks(loadStore(), id).length;
      extra = n ? " 연결된 할 일 " + n + "개는 삭제되지 않고 목표 연결만 해제됩니다." : "";
    }
    confirmDialog({
      title: name + " 삭제",
      body: "‘" + itemLabel(type, item) + "’을(를) 삭제할까요? 삭제하면 되돌릴 수 없습니다." + extra,
      ok: "삭제", danger: true
    }).then(function (ok) {
      if (!ok) return;
      if (removeItem(type, id)) {
        refreshAll();
        announce(name + "을(를) 삭제했습니다.");
        restoreFocus(null);
      }
    });
  }

  function initHero() {
    var hero = $("[data-lv-ml-hero]");
    if (!hero) return;
    requestAnimationFrame(function () { hero.classList.add("is-ready"); });
  }

  function initReveal() {
    var nodes = $$("#life-now [data-lv-reveal]");
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function openAgeModal() {
    var modal = $("#lv-ml-age-modal");
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeAgeModal() {
    var modal = $("#lv-ml-age-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  function openLogin() {
    var modal = $("#lv-ml-login-modal");
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLogin() {
    var modal = $("#lv-ml-login-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function focusAfterRender(sel) {
    var el = sel ? $(sel) : null;
    if (el) el.focus(); else restoreFocus(null);
  }
  function rerenderView(view, focusSel) {
    renderPanel(view);
    syncUrl(view);
    if (focusSel) focusAfterRender(focusSel);
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener("click", function (e) {
      if (!e.target.closest) return;
      var cf = e.target.closest("[data-lv-ml-confirm]");
      if (cf) { e.preventDefault(); closeConfirm(cf.getAttribute("data-lv-ml-confirm") === "1"); return; }
      if (!e.target.closest("#life-now, #lv-ml-form-modal, #lv-ml-age-modal, #lv-ml-login-modal")) return;

      var st = e.target.closest("[data-lv-ml-saved-type]");
      if (st) {
        state.savedType = st.getAttribute("data-lv-ml-saved-type") || "all";
        rerenderView("saved", '[data-lv-ml-saved-type="' + state.savedType + '"]');
        return;
      }
      if (e.target.closest("[data-lv-ml-saved-reset]")) {
        state.savedType = "all"; state.savedFolder = "all";
        rerenderView("saved", '[data-lv-ml-saved-type="all"]');
        return;
      }
      var un = e.target.closest("[data-lv-ml-unsave]");
      if (un) {
        var sid = un.getAttribute("data-lv-ml-unsave");
        var sItem = collectedSaved().find(function (x) { return x.id === sid; });
        if (unsave(sid)) {
          refreshDashboard();
          rerenderView("saved");
          announce("‘" + (sItem ? sItem.label : "항목") + "’ 저장을 해제했습니다.");
          restoreFocus(null);
        }
        return;
      }
      var tf = e.target.closest("[data-lv-ml-todo-filter]");
      if (tf) {
        state.todoFilter = tf.getAttribute("data-lv-ml-todo-filter") || "all";
        rerenderView("todos", '[data-lv-ml-todo-filter="' + state.todoFilter + '"]');
        return;
      }
      if (e.target.closest("[data-lv-ml-todo-reset]")) {
        state.todoFilter = "all"; state.todoSource = "all";
        rerenderView("todos", '[data-lv-ml-todo-filter="all"]');
        return;
      }
      var jc = e.target.closest("[data-lv-ml-journal-cat]");
      if (jc) {
        state.journalCat = jc.getAttribute("data-lv-ml-journal-cat") || "all";
        rerenderView("journal", '.lv-ml-filter [data-lv-ml-journal-cat="' + state.journalCat + '"]');
        return;
      }
      var ia = e.target.closest("[data-lv-ml-interest-add]");
      if (ia) {
        var iname = ia.getAttribute("data-lv-ml-interest-add");
        var r = addInterest(iname);
        rerenderView("interests", "[data-lv-ml-interest-form] input");
        announce(r.status === "ok" ? "‘" + iname + "’ 관심사를 추가했습니다." : r.msg || "이미 있는 관심사입니다.");
        return;
      }
      var ir = e.target.closest("[data-lv-ml-interest-remove]");
      if (ir) {
        var rname = ir.getAttribute("data-lv-ml-interest-remove");
        removeInterest(rname);
        rerenderView("interests", ".lv-ml-tags button, [data-lv-ml-interest-form] input");
        announce("‘" + rname + "’ 관심사를 삭제했습니다.");
        return;
      }
      var lg = e.target.closest("[data-lv-ml-link-goal]");
      if (lg) { e.preventDefault(); openForm("link", null, { goalId: lg.getAttribute("data-lv-ml-link-goal") }); return; }
      var ul = e.target.closest("[data-lv-ml-unlink]");
      if (ul) {
        var uid2 = ul.getAttribute("data-lv-ml-unlink");
        var s0 = loadStore();
        var tItem = s0.todos.find(function (x) { return x.id === uid2; });
        if (tItem && tItem.goalId) {
          var r2 = saveTodo({ id: tItem.id, title: tItem.title, due: tItem.due, priority: prio(tItem), category: tItem.category, note: tItem.note, goalId: "" }, { force: true });
          if (r2.status === "ok") { refreshAll(); announce("‘" + tItem.title + "’의 목표 연결을 해제했습니다. 할 일은 그대로 남아 있습니다."); restoreFocus(null); }
        }
        return;
      }
      if (e.target.closest("[data-lv-ml-recent-clear]")) {
        confirmDialog({ title: "최근 본 기록 지우기", body: "이 기기에 저장된 최근 본 항목 기록을 지울까요? 저장한 항목과 할 일은 바뀌지 않습니다.", ok: "지우기", danger: true })
          .then(function (ok) {
            if (!ok) return;
            writeJSON(KEY_RECENT, []);
            refreshDashboard();
            rerenderView("recent");
            announce("최근 본 기록을 지웠습니다.");
            restoreFocus(null);
          });
        return;
      }
      var al = e.target.closest("input[data-lv-ml-alert]");
      if (al && window.LivonPlatform && window.LivonPlatform.setAlertPref) {
        window.LivonPlatform.setAlertPref(al.getAttribute("data-lv-ml-alert"), !!al.checked);
        return;
      }
      if (e.target.closest("[data-lv-ml-region-save]") && window.LivonPlatform && window.LivonPlatform.setRegion) {
        e.preventDefault();
        var sidoEl = $("[data-lv-ml-region-sido]");
        var sggEl = $("[data-lv-ml-region-sgg]");
        window.LivonPlatform.setRegion({
          sido: String((sidoEl && sidoEl.value) || "").trim(),
          sgg: String((sggEl && sggEl.value) || "").trim()
        });
        announce("지역이 이 기기에 저장되었습니다.");
        return;
      }
      if (e.target.closest("[data-lv-onboard-reopen]") && window.LivonPlatform && window.LivonPlatform.openOnboarding) {
        e.preventDefault();
        window.LivonPlatform.openOnboarding();
        return;
      }

      var goto = e.target.closest("[data-lv-ml-goto]");
      if (goto) {
        var gv = goto.getAttribute("data-lv-ml-goto");
        var gh = goto.tagName === "A" ? (goto.getAttribute("href") || "") : "";
        /* real links (#ml-todos …) navigate natively so back/forward and new tabs work */
        if (gh.indexOf("#ml-") === 0 && gh !== "#ml-panel") {
          if (location.hash === gh) { e.preventDefault(); showView(gv, { scroll: true }); }
          return;
        }
        e.preventDefault();
        gotoView(gv);
        return;
      }
      var add = e.target.closest("[data-lv-ml-add]");
      if (add) {
        e.preventDefault();
        var preset = {};
        if (add.getAttribute("data-goal")) preset.goalId = add.getAttribute("data-goal");
        if (add.getAttribute("data-date")) preset.date = add.getAttribute("data-date");
        if (add.getAttribute("data-category")) preset.category = add.getAttribute("data-category");
        openForm(add.getAttribute("data-lv-ml-add"), null, preset);
        return;
      }
      var edit = e.target.closest("[data-lv-ml-edit]");
      if (edit) {
        e.preventDefault();
        var type = edit.getAttribute("data-lv-ml-edit");
        var item = findItem(type, edit.getAttribute("data-id"));
        if (item) openForm(type, item);
        return;
      }
      var del = e.target.closest("[data-lv-ml-del]");
      if (del) {
        e.preventDefault();
        deleteItem(del.getAttribute("data-lv-ml-del"), del.getAttribute("data-id"));
        return;
      }
      var scroll = e.target.closest("[data-lv-ml-scroll]");
      if (scroll) {
        var href = scroll.getAttribute("href") || "";
        if (href.charAt(0) === "#") {
          e.preventDefault();
          if (location.hash !== href) history.pushState(null, "", href);
          state.view = "home";
          setNav("home");
          scrollToId(href.slice(1));
        }
        return;
      }
      var find = e.target.closest("[data-lv-ml-find]");
      if (find) {
        e.preventDefault();
        openAgeModal();
        return;
      }
      var login = e.target.closest("[data-lv-ml-login]");
      if (login) {
        e.preventDefault();
        openLogin();
        return;
      }
      var formClose = e.target.closest("[data-lv-ml-form-close]");
      if (formClose) {
        e.preventDefault();
        closeForm();
        return;
      }
      var calNav = e.target.closest("[data-lv-ml-cal-nav]");
      if (calNav) {
        var dir = calNav.getAttribute("data-lv-ml-cal-nav");
        var mode = state.calMode || "month";
        if (dir === "0") {
          state.calMonth = new Date();
          state.calSelected = todayStr();
        } else {
          var step = Number(dir);
          if (mode === "month") {
            if (!state.calMonth) state.calMonth = new Date();
            state.calMonth = new Date(state.calMonth.getFullYear(), state.calMonth.getMonth() + step, 1);
            var sel = parseDate(state.calSelected);
            if (!sel || sel.getMonth() !== state.calMonth.getMonth() || sel.getFullYear() !== state.calMonth.getFullYear()) state.calSelected = todayStr(state.calMonth);
          } else {
            var base = parseDate(state.calSelected || todayStr()) || new Date();
            base.setDate(base.getDate() + step * (mode === "week" ? 7 : 1));
            state.calSelected = todayStr(base);
            state.calMonth = new Date(base.getFullYear(), base.getMonth(), 1);
          }
        }
        rerenderView("calendar", '[data-lv-ml-cal-nav="' + dir + '"]');
        return;
      }
      var calMode = e.target.closest("[data-lv-ml-cal-mode]");
      if (calMode) {
        state.calMode = calMode.getAttribute("data-lv-ml-cal-mode") || "month";
        rerenderView("calendar", '[data-lv-ml-cal-mode="' + state.calMode + '"]');
        return;
      }
      var calDay = e.target.closest("[data-lv-ml-cal-day]");
      if (calDay) {
        state.calSelected = calDay.getAttribute("data-lv-ml-cal-day");
        var picked = parseDate(state.calSelected);
        if (picked) state.calMonth = new Date(picked.getFullYear(), picked.getMonth(), 1);
        rerenderView("calendar", '[data-lv-ml-cal-day="' + state.calSelected + '"]');
        return;
      }
      var impC = e.target.closest("[data-lv-ml-import-checklist]");
      if (impC) {
        var tpl = (DATA.checklistTemplates || []).find(function (x) { return x.id === impC.getAttribute("data-lv-ml-import-checklist"); });
        if (tpl) {
          var store = loadStore();
          store.checklists.unshift({
            id: uid("checklist"), title: tpl.title, desc: tpl.desc || "",
            items: (tpl.items || []).map(function (text) { return { id: uid("ci"), text: text, done: false }; }),
            createdAt: Date.now(), updatedAt: Date.now()
          });
          saveStore(store);
          refreshAll();
          announce("‘" + tpl.title + "’ 체크리스트를 가져왔습니다.");
        }
        return;
      }
      var impP = e.target.closest("[data-lv-ml-import-project]");
      if (impP) {
        var pt = (DATA.projectTemplates || []).find(function (x) { return x.id === impP.getAttribute("data-lv-ml-import-project"); });
        if (pt) {
          var st2 = loadStore();
          st2.projects.unshift({
            id: uid("project"), title: pt.title, purpose: "", start: todayStr(), due: "",
            steps: (pt.steps || []).map(function (text) { return { id: uid("ps"), text: text, done: false }; }),
            status: "진행 중", createdAt: Date.now(), updatedAt: Date.now()
          });
          saveStore(st2);
          refreshAll();
          announce("‘" + pt.title + "’ 프로젝트를 가져왔습니다.");
        }
        return;
      }
      var addEv = e.target.closest("[data-lv-ml-add-event-from-saved]");
      if (addEv) {
        /* preview → confirm → save: the form opens pre-filled and nothing is stored until 저장 */
        var sv = collectedSaved().find(function (x) { return x.id === addEv.getAttribute("data-lv-ml-add-event-from-saved"); });
        if (sv) openForm("event", null, { title: sv.label, date: todayStr(), category: "여가", note: "저장한 항목: " + sv.label, source: "saved", sourceHref: sv.href });
        return;
      }
      var setSit = e.target.closest("[data-lv-ml-set-situation]");
      if (setSit) {
        var sv2 = setSit.getAttribute("data-lv-ml-set-situation");
        var sl = readJSON(KEY_SITUATIONS, []);
        if (!Array.isArray(sl)) sl = [];
        var j = sl.indexOf(sv2);
        if (j >= 0) sl.splice(j, 1); else sl.push(sv2);
        writeJSON(KEY_SITUATIONS, sl);
        renderPanel("settings");
        return;
      }
      var exp = e.target.closest("[data-lv-ml-export]");
      if (exp) {
        var blob = new Blob([JSON.stringify(loadStore(), null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "livon-my-life-" + todayStr() + ".json";
        a.click();
        return;
      }
      var clear = e.target.closest("[data-lv-ml-clear]");
      if (clear) {
        confirmDialog({ title: "내 생활 데이터 전체 삭제", body: "이 기기에 저장된 내 생활 일정·할 일·목표·기록을 모두 삭제할까요? 되돌릴 수 없습니다.", ok: "모두 삭제", danger: true })
          .then(function (ok) { if (!ok) return; saveStore(emptyStore()); refreshAll(); announce("내 생활 데이터를 삭제했습니다."); });
        return;
      }
    });

    document.addEventListener("change", function (e) {
      var t = e.target;
      if (!t.closest || !t.closest("#life-now, #lv-ml-form-modal")) return;
      if (t.matches("[data-lv-ml-todo-source]")) {
        state.todoSource = TODO_SOURCES[t.value] ? t.value : "all";
        rerenderView("todos", "[data-lv-ml-todo-source]");
        return;
      }
      if (t.matches("[data-lv-ml-saved-folder-select]")) {
        state.savedFolder = t.value || "all";
        rerenderView("saved", "[data-lv-ml-saved-folder-select]");
        return;
      }
      if (t.matches("[data-lv-ml-toggle]")) {
        var type = t.getAttribute("data-lv-ml-toggle");
        var id = t.getAttribute("data-id");
        var keepId = t.id;
        if (type === "todo") {
          var td = setTodoDone(id, t.checked);
          if (td) announce("‘" + td.title + "’ " + (td.done ? "완료로 표시했습니다." : "미완료로 되돌렸습니다."));
        } else if (type === "event") {
          var store = loadStore();
          store.events.forEach(function (x) { if (x.id === id) { x.done = !!t.checked; x.updatedAt = Date.now(); } });
          saveStore(store);
        }
        refreshAll();
        var again = keepId ? document.getElementById(keepId) : null;
        if (again) again.focus(); else restoreFocus(null);
        return;
      }
      if (t.matches("[data-lv-ml-habit]")) {
        var hid = t.getAttribute("data-lv-ml-habit");
        var st = loadStore();
        if (!st.habitLogs[hid]) st.habitLogs[hid] = {};
        var day = todayStr();
        if (t.checked) st.habitLogs[hid][day] = true; else delete st.habitLogs[hid][day];
        saveStore(st);
        refreshAll();
      }
      if (t.matches("[data-lv-ml-check-item]")) {
        var cid = t.getAttribute("data-lv-ml-check-item");
        var iid = t.getAttribute("data-item");
        var s2 = loadStore();
        s2.checklists.forEach(function (c) {
          if (c.id !== cid) return;
          (c.items || []).forEach(function (it) { if (it.id === iid) it.done = !!t.checked; });
        });
        saveStore(s2);
        refreshAll();
      }
      if (t.matches("[data-lv-ml-project-step]")) {
        var pid = t.getAttribute("data-lv-ml-project-step");
        var sid = t.getAttribute("data-item");
        var s3 = loadStore();
        s3.projects.forEach(function (p) {
          if (p.id !== pid) return;
          (p.steps || []).forEach(function (it) { if (it.id === sid) it.done = !!t.checked; });
        });
        saveStore(s3);
        refreshAll();
      }
    });

    document.addEventListener("submit", function (e) {
      var form = e.target.closest("[data-lv-ml-form]");
      if (form) {
        e.preventDefault();
        saveFromForm(form);
        return;
      }
      var inf = e.target.closest("[data-lv-ml-interest-form]");
      if (inf) {
        e.preventDefault();
        var inp = inf.querySelector('[name="interest"]');
        var val = inp ? inp.value : "";
        var r = addInterest(val);
        if (r.status === "invalid") { if (inp) { inp.setAttribute("aria-invalid", "true"); inp.focus(); } announce(r.msg); return; }
        rerenderView("interests", "[data-lv-ml-interest-form] input");
        announce(r.status === "ok" ? "‘" + String(val).trim() + "’ 관심사를 추가했습니다." : "이미 있는 관심사입니다.");
        return;
      }
      var budget = e.target.closest("[data-lv-ml-budget-form]");
      if (budget) {
        e.preventDefault();
        var store = loadStore();
        store.budgets.monthly = Number(new FormData(budget).get("monthly")) || 0;
        saveStore(store);
        renderPanel("money");
        announce("월 예산을 저장했습니다.");
      }
    });

    var ageModal = $("#lv-ml-age-modal");
    if (ageModal) {
      ageModal.querySelectorAll("[data-age]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          writeJSON(KEY_STAGE, btn.getAttribute("data-age"));
          closeAgeModal();
          if (state.view === "settings") renderPanel("settings");
          refreshDashboard();
        });
      });
      ageModal.querySelectorAll("[data-lv-ml-modal-close]").forEach(function (btn) {
        btn.addEventListener("click", closeAgeModal);
      });
    }
    var loginModal = $("#lv-ml-login-modal");
    if (loginModal) {
      loginModal.querySelectorAll("[data-lv-ml-modal-close]").forEach(function (btn) {
        btn.addEventListener("click", closeLogin);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Tab") { trapFocus(e); return; }
      if (e.key !== "Escape") return;
      if (confirmState) { e.preventDefault(); closeConfirm(false); return; }
      if (formIsOpen()) { e.preventDefault(); closeForm(); return; }
      closeAgeModal(); closeLogin();
    });
  }

  var inited = false;
  function init() {
    if (inited || !$("#life-now")) return;
    inited = true;
    initHero();
    initReveal();
    bind();
    /* Life Stage / Today / Explore write to the shared stores; re-render when this screen is visible again */
    window.addEventListener("storage", function (e) {
      if (document.documentElement.dataset.lvView !== "life-now") return;
      if ([STORE_KEY, "livon.platform.v1", KEY_LIFE_INTERESTS, KEY_TD_PREFS, KEY_RECENT].indexOf(e.key) >= 0) refreshAll();
    });
  }

  /* Public data API for other LIVON screens (LIVON AI approved saves). Same rules as the My Life UI:
     validation, duplicate detection (status "duplicate" — nothing is written) and source preservation. */
  var api = { saveTodo: saveTodo, saveGoal: saveGoal, findDuplicateTodo: function (title) { return findDuplicateTodo(loadStore(), title, ""); },
    /* read-only snapshots for the LIVON home preview (no separate task/calendar logic there) */
    snapshot: function () { return JSON.parse(JSON.stringify(loadStore())); },
    saved: function () { return collectedSaved(); },
    recentViewed: function () { return recentViewed(); } };

  window.LivonMyLife = {
    api: api,
    onShow: function (hash) {
      init();
      initHero();
      var r = parseMlHash(hash);
      var id = r.id;
      if (confirmState) closeConfirm(false);
      if (formIsOpen()) closeForm();
      if (!id || id === "life-now") { showView("home"); return; }
      if (id === "ml-home") { showView("home", { scroll: true }); return; }
      if (id === "ml-cta") {
        showView("home");
        setTimeout(function () { scrollToId("ml-cta"); }, 30);
        return;
      }
      if (id === "ml-panel") {
        /* legacy entry point: open the last panel (or 할 일) under its real URL */
        var last = state.view && state.view !== "home" ? state.view : "todos";
        history.replaceState(history.state, "", viewHash(last));
        showView(last, { scroll: true });
        return;
      }
      if (r.view && knownView(r.view)) {
        applyParams(r.view, r.params);
        showView(r.view, { scroll: true });
        syncUrl(r.view);
        return;
      }
      showView("home");
      if (document.getElementById(id)) setTimeout(function () { scrollToId(id); }, 30);
    },
    _test: {
      migrate: migrate, loadStore: loadStore, saveTodo: saveTodo, setTodoDone: setTodoDone, saveEvent: saveEvent, saveGoal: saveGoal,
      setGoalTodos: setGoalTodos, goalProgress: goalProgress, saveJournal: saveJournal, removeItem: removeItem, todoBucket: todoBucket,
      todoSource: todoSource, priorityItems: priorityItems, collectedSaved: collectedSaved, unsave: unsave, savedType: savedType,
      readInterests: readInterests, addInterest: addInterest, removeInterest: removeInterest, parseMlHash: parseMlHash,
      applyParams: applyParams, viewHash: viewHash, state: state, safeHref: safeHref, recentViewed: recentViewed
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
      if (!inited) return;
      refreshDashboard();
      if (document.documentElement.dataset.lvView === "life-now") window.LivonMyLife.onShow((location.hash || "").slice(1) || "life-now");
    });
  } else {
    init();
  }
  window.LivonLifeNow = { goto: function (v) { gotoView(v); } };
})();
