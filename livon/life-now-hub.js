/* LIVON My Life V2 — Personal Life Hub (routines, 전체 기록, 내 생활 검색, 다가오는 7일, 주간 리뷰, 생활비, 내보내기, 전체 삭제).
   Installed by life-now-page.js with its helpers and store functions (one store: livon.mlStore.v1). Data functions take a
   store and return plain values; renderers return HTML strings. Nothing here makes a request or logs content. */
(function () {
  window.LivonMyLifeHub = { install: function (core) {
  var $ = core.$, esc = core.esc, todayStr = core.todayStr, parseDate = core.parseDate, fmtDay = core.fmtDay, fmtMoney = core.fmtMoney, idPart = core.idPart;
  var isObj = core.isObj, normTitle = core.normTitle, prio = core.prio, PRIO_RANK = core.PRIO_RANK, emptyBox = core.emptyBox, chipGroup = core.chipGroup;
  var loadStore = core.loadStore, saveStore = core.saveStore, emptyStore = core.emptyStore, STORE_VERSION = core.STORE_VERSION, readJSON = core.readJSON;
  var state = core.state, todoItemHtml = core.todoItemHtml, habitDays = core.habitDays, habitScheduledOn = core.habitScheduledOn, WEEKDAYS = core.WEEKDAYS;
  var RECORD_TYPES = core.RECORD_TYPES, RECORD_RANGES = core.RECORD_RANGES, ML_COLLECTIONS = core.ML_COLLECTIONS, ymOf = core.ymOf, moneySummary = core.moneySummary;

  function habitScheduleText(h) {
    var days = habitDays(h);
    if (days) return days.length === 7 ? "매일" : days.map(function (n) { return WEEKDAYS[n]; }).join("·");
    return h && h.freq === "weekly" ? "매주" : "매일";
  }

  function startOfWeek(d, weekStartsOn) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var diff = (x.getDay() - (Number(weekStartsOn) || 0) + 7) % 7;
    x.setDate(x.getDate() - diff);
    return x;
  }

  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }

  /* Consecutive scheduled days (weekly habit: weeks) that were checked. Today not checked yet does not break it;
     days before the habit existed and days it is not scheduled are skipped. */
  function habitStreak(h, logs, now, weekStartsOn) {
    now = now || new Date();
    var log = (logs && isObj(logs[h.id])) ? logs[h.id] : {};
    var created = h.createdAt ? todayStr(new Date(h.createdAt)) : "";
    var n = 0, i, d;
    if (h.freq === "weekly") {
      var ws = startOfWeek(now, weekStartsOn);
      for (i = 0; i < 104; i++) {
        var hit = false;
        for (var k = 0; k < 7; k++) if (log[todayStr(addDays(ws, k))]) { hit = true; break; }
        if (hit) n++;
        else if (i > 0) break;
        ws = addDays(ws, -7);
        if (created && todayStr(addDays(ws, 6)) < created) break;
      }
      return { count: n, unit: "주" };
    }
    d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (i = 0; i < 400; i++) {
      var key = todayStr(d);
      if (created && key < created) break;
      if (habitScheduledOn(h, d)) {
        if (log[key]) n++;
        else if (i > 0) break;
      }
      d = addDays(d, -1);
    }
    return { count: n, unit: "일" };
  }

  /* checks and scheduled days inside one week (weekStart … +6) */
  function habitWeek(h, logs, weekStart) {
    var log = (logs && isObj(logs[h.id])) ? logs[h.id] : {};
    var done = 0, planned = 0;
    for (var k = 0; k < 7; k++) {
      var d = addDays(weekStart, k);
      var sched = h.freq === "weekly" || habitScheduledOn(h, d);
      if (log[todayStr(d)] && sched) done++;
      if (h.freq !== "weekly" && sched) planned++;
    }
    return { done: done, planned: h.freq === "weekly" ? 1 : planned };
  }

  /* ——— One day / the next days / one week (real records only) ——— */
  function dayItems(store, ds) {
    var byTime = function (a, b) { return (a.allDay ? 0 : 1) - (b.allDay ? 0 : 1) || String(a.start || "99:99").localeCompare(String(b.start || "99:99")); };
    return {
      events: store.events.filter(function (e) { return e.date === ds; }).sort(byTime),
      todos: store.todos.filter(function (t) { return t.due === ds; }).sort(function (a, b) { return (a.done - b.done) || (PRIO_RANK[prio(a)] - PRIO_RANK[prio(b)]); }),
      journal: store.journal.filter(function (j) { return j.date === ds; }),
      tx: store.transactions.filter(function (x) { return x.date === ds; }),
      health: store.health.filter(function (h) { return h.date === ds; })
    };
  }

  /* tomorrow … +days: dated schedule, open task deadlines and goal target dates — nothing else */
  function upcomingItems(store, now, days) {
    now = now || new Date();
    days = days || 7;
    var from = todayStr(addDays(now, 1)), to = todayStr(addDays(now, days));
    var out = [];
    store.events.forEach(function (e) { if (e.date >= from && e.date <= to && !e.done) out.push({ kind: "event", date: e.date, time: e.allDay ? "" : (e.start || ""), item: e }); });
    store.todos.forEach(function (t) { if (!t.done && t.due >= from && t.due <= to) out.push({ kind: "todo", date: t.due, time: "", item: t }); });
    store.goals.forEach(function (g) { if (g.status === "진행 중" && g.due >= from && g.due <= to) out.push({ kind: "goal", date: g.due, time: "", item: g }); });
    var rank = { event: 0, todo: 1, goal: 2 };
    out.sort(function (a, b) { return a.date.localeCompare(b.date) || rank[a.kind] - rank[b.kind] || String(a.time || "99").localeCompare(String(b.time || "99")); });
    return out;
  }

  function inRange(ms, a, b) { return typeof ms === "number" && ms >= a.getTime() && ms < b.getTime(); }

  /* Counts for one week. Completion dates exist only where the app records them (to-do doneAt, goal doneAt, habit log). */
  function weeklyReview(store, now, offset) {
    now = now || new Date();
    var ws = addDays(startOfWeek(now, store.settings && store.settings.weekStartsOn), 7 * (Number(offset) || 0));
    var we = addDays(ws, 7);
    var from = todayStr(ws), to = todayStr(addDays(ws, 6));
    var inWeek = function (ds) { return typeof ds === "string" && ds >= from && ds <= to; };
    var habitDone = 0, habitPlanned = 0;
    store.habits.forEach(function (h) { var w = habitWeek(h, store.habitLogs, ws); habitDone += h.freq === "weekly" ? Math.min(w.done, 1) : w.done; habitPlanned += w.planned; });
    var expense = 0, income = 0;
    store.transactions.forEach(function (x) { if (!inWeek(x.date)) return; var n = Number(x.amount); n = isFinite(n) && n > 0 ? n : 0; if (x.kind === "income") income += n; else expense += n; });
    var due = store.todos.filter(function (t) { return inWeek(t.due); });
    return {
      from: from, to: to,
      events: store.events.filter(function (e) { return inWeek(e.date); }).length,
      todosDone: store.todos.filter(function (t) { return t.done && inRange(t.doneAt, ws, we); }).length,
      todosDue: due.length, todosDueOpen: due.filter(function (t) { return !t.done; }).length,
      todosAdded: store.todos.filter(function (t) { return inRange(t.createdAt, ws, we); }).length,
      goalsDone: store.goals.filter(function (g) { return g.status === "완료" && inRange(g.doneAt, ws, we); }).length,
      habitDone: habitDone, habitPlanned: habitPlanned,
      journal: store.journal.filter(function (j) { return inWeek(j.date); }).length,
      health: store.health.filter(function (h) { return inWeek(h.date); }).length,
      expense: expense, income: income
    };
  }

  /* ——— 전체 기록 (records hub) and the private My Life search ——— */
  function recordRow(type, x) {
    if (type === "journal") return { type: type, id: x.id, date: x.date || "", title: x.title || "기록", meta: [x.category, x.mood].filter(Boolean).join(" · "), text: x.body || "" };
    if (type === "tx") return { type: type, id: x.id, date: x.date || "", title: (x.kind === "income" ? "+" : "-") + fmtMoney(x.amount), meta: [x.kind === "income" ? "수입" : "지출", x.category].filter(Boolean).join(" · "), text: x.note || "" };
    if (type === "health") return { type: type, id: x.id, date: x.date || "", title: x.kind || "건강 기록", meta: "건강", text: x.value || "" };
    return { type: type, id: x.id, date: x.date || "", title: x.title || "경험", meta: [x.status, x.place].filter(Boolean).join(" · "), text: x.note || "" };
  }

  function recordsList(store, opts, now) {
    opts = opts || {};
    now = now || new Date();
    var type = opts.type || "all", range = opts.range || "all";
    var q = normTitle(opts.q);
    var src = { journal: store.journal, tx: store.transactions, health: store.health, experience: store.experiences };
    var rows = [];
    Object.keys(src).forEach(function (k) { if (type === "all" || type === k) src[k].forEach(function (x) { rows.push(recordRow(k, x)); }); });
    var t = todayStr(now);
    if (range === "7d") { var f = todayStr(addDays(now, -6)); rows = rows.filter(function (r) { return r.date >= f && r.date <= t; }); }
    else if (range === "month") { var ym = ymOf(now); rows = rows.filter(function (r) { return r.date.indexOf(ym) === 0; }); }
    if (q) rows = rows.filter(function (r) { return normTitle(r.title + " " + r.meta + " " + r.text).indexOf(q) >= 0; });
    rows.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    return rows;
  }

  var SEARCH_AREAS = [
    { key: "events", type: "event", label: "일정", view: "calendar", fields: ["title", "place", "note", "category"], date: "date" },
    { key: "todos", type: "todo", label: "할 일", view: "todos", fields: ["title", "note", "category"], date: "due" },
    { key: "goals", type: "goal", label: "목표", view: "goals", fields: ["title", "note", "category"], date: "due" },
    { key: "habits", type: "habit", label: "루틴", view: "routines", fields: ["title"], date: "" },
    { key: "journal", type: "journal", label: "기록", view: "journal", fields: ["title", "body", "category"], date: "date" },
    { key: "transactions", type: "tx", label: "수입·지출", view: "money", fields: ["note", "category"], date: "date" },
    { key: "health", type: "health", label: "건강", view: "health", fields: ["kind", "value"], date: "date" },
    { key: "experiences", type: "experience", label: "경험", view: "experiences", fields: ["title", "place", "note", "status"], date: "date" },
    { key: "checklists", type: "checklist", label: "체크리스트", view: "todos", fields: ["title", "desc"], date: "" },
    { key: "projects", type: "project", label: "전환 준비", view: "projects", fields: ["title", "purpose"], date: "due" }
  ];

  /* Searches only this device's My Life store, in memory. It is not part of the LIVON search index and sends nothing. */
  function searchMyLife(store, q, limit) {
    var n = normTitle(q);
    if (!n) return { q: "", total: 0, items: [] };
    var out = [];
    SEARCH_AREAS.forEach(function (a) {
      (store[a.key] || []).forEach(function (x) {
        var hay = a.fields.map(function (f) { return String(x[f] == null ? "" : x[f]); }).join(" ");
        if (a.key === "checklists") hay += " " + (x.items || []).map(function (i) { return i && i.text; }).join(" ");
        if (a.key === "projects") hay += " " + (x.steps || []).map(function (i) { return i && i.text; }).join(" ");
        if (normTitle(hay).indexOf(n) < 0) return;
        out.push({ area: a.key, type: a.type, label: a.label, view: a.view, id: x.id, date: a.date ? String(x[a.date] || "") : "",
          title: a.key === "transactions" ? (x.kind === "income" ? "+" : "-") + fmtMoney(x.amount) + (x.note ? " · " + x.note : "") : String(x.title || x.kind || "항목") });
      });
    });
    out.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    return { q: String(q).trim(), total: out.length, items: out.slice(0, limit || 50) };
  }

  /* ——— Export / delete-all: My Life store only (livon.mlStore.v1) ——— */
  function exportPayload(store, now) {
    var c = {};
    ML_COLLECTIONS.forEach(function (k) { c[k] = JSON.parse(JSON.stringify(store[k] == null ? (k === "habitLogs" ? {} : k === "budgets" ? { monthly: 0, categories: {} } : []) : store[k])); });
    return { app: "LIVON", kind: "my-life-export", version: 1, storeVersion: Number(store.v) || STORE_VERSION, exportedAt: new Date(now || Date.now()).toISOString(), collections: c };
  }

  function exportCounts(store) {
    var c = {};
    ML_COLLECTIONS.forEach(function (k) {
      if (k === "habitLogs") { var n = 0; Object.keys(store.habitLogs || {}).forEach(function (h) { n += Object.keys(store.habitLogs[h] || {}).length; }); c[k] = n; }
      else if (k === "budgets") c[k] = Number(store.budgets && store.budgets.monthly) ? 1 : 0;
      else c[k] = (store[k] || []).length;
    });
    return c;
  }

  /* Clears the My Life collections and keeps the store's own settings. Saved items (LivonPlatform), Community, interests,
     personalization, recent views, LIVON AI, ONGIL and the Newon+ account live under other keys and are not touched. */
  function clearMyLifeData() {
    var store = loadStore(), base = emptyStore();
    /* only the My Life collections are emptied; settings, folders and any legacy key in the store stay as they are */
    ML_COLLECTIONS.forEach(function (k) { store[k] = base[k]; });
    store.v = STORE_VERSION;
    saveStore(store);
    return true;
  }

  /* one markup for a routine row (home and 루틴): real checkbox for today, schedule, streak from the log */
  function habitRowHtml(h, store, opts) {
    opts = opts || {};
    var now = new Date(), t = todayStr(now);
    var on = !!(store.habitLogs[h.id] || {})[t];
    var sched = habitScheduledOn(h, now);
    var st = habitStreak(h, store.habitLogs, now, store.settings && store.settings.weekStartsOn);
    var w = habitWeek(h, store.habitLogs, startOfWeek(now, store.settings && store.settings.weekStartsOn));
    var cid = (opts.prefix || "ml-hb-") + idPart(h.id);
    return '<li class="lv-ml-task' + (on ? " is-done" : "") + '"><div class="lv-ml-task__main">' +
      (sched
        ? '<input type="checkbox" id="' + cid + '" data-lv-ml-habit="' + esc(h.id) + '"' + (on ? " checked" : "") + " />"
        : '<span class="lv-ml-task__dot" aria-hidden="true"></span>') +
      '<div class="lv-ml-task__body">' +
        (sched ? '<label for="' + cid + '" class="lv-ml-task__title">' + esc(h.title) + '<span class="visually-hidden">, 오늘 ' + (on ? "완료" : "미완료") + "</span></label>"
               : '<p class="lv-ml-task__title">' + esc(h.title) + "</p>") +
        '<p class="lv-ml-task__meta">' + esc([habitScheduleText(h), sched ? (on ? "오늘 완료" : "오늘 할 차례") : "오늘은 쉬는 날",
          st.count ? "연속 " + st.count + st.unit : "연속 기록 없음", "이번 주 " + (h.freq === "weekly" ? w.done + "회" : w.done + "/" + w.planned)].join(" · ")) + "</p>" +
      "</div></div>" +
      (opts.noActions ? "" : '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="habit" data-id="' + esc(h.id) + '" aria-label="' + esc(h.title) + ' 수정">수정</button><button type="button" data-lv-ml-del="habit" data-id="' + esc(h.id) + '" aria-label="' + esc(h.title) + ' 삭제">삭제</button></div>') +
    "</li>";
  }

  function renderTodayHabits() {
    var host = $("[data-lv-ml-today-habits]");
    if (!host) return;
    var store = loadStore(), now = new Date();
    var list = store.habits.filter(function (h) { return habitScheduledOn(h, now); });
    if (!store.habits.length) {
      host.innerHTML = emptyBox("등록한 루틴이 없어요.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="habit">루틴 추가</button>');
      return;
    }
    if (!list.length) {
      host.innerHTML = emptyBox("오늘 할 루틴이 없어요. 오늘은 쉬는 날이에요.", '<a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ml-routines">루틴 전체</a>');
      return;
    }
    var done = list.filter(function (h) { return (store.habitLogs[h.id] || {})[todayStr(now)]; }).length;
    host.innerHTML = '<p class="lv-ml-note">오늘 완료 ' + done + " / " + list.length + "</p>" +
      '<ul class="lv-ml-manage-list lv-ml-tasks">' + list.map(function (h) { return habitRowHtml(h, store, { prefix: "ml-th-", noActions: true }); }).join("") + "</ul>" +
      '<p class="lv-ml-inline-acts"><a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ml-routines">루틴 전체</a></p>';
  }

  var UPCOMING_KIND = { event: "일정", todo: "할 일 마감", goal: "목표일" };

  function upcomingRowHtml(x) {
    var it = x.item;
    var act = x.kind === "goal" ? '<a href="#ml-goals">목표 보기<span class="visually-hidden">: ' + esc(it.title) + "</span></a>"
      : '<button type="button" data-lv-ml-edit="' + x.kind + '" data-id="' + esc(it.id) + '" aria-label="' + esc(it.title) + ' 열기">열기</button>';
    return "<li><div><strong>" + esc(it.title) + "</strong><p>" + esc([fmtDay(x.date), UPCOMING_KIND[x.kind], x.time, x.kind === "todo" ? "우선순위 " + prio(it) : "", it.place].filter(Boolean).join(" · ")) + "</p></div>" +
      '<div class="lv-ml-row-acts">' + act + "</div></li>";
  }

  function renderUpcoming() {
    var host = $("[data-lv-ml-upcoming]");
    if (!host) return;
    var list = upcomingItems(loadStore(), new Date(), 7);
    if (!list.length) {
      host.innerHTML = emptyBox("앞으로 7일 동안 예정된 일정·마감·목표일이 없어요.", '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-add="event">일정 추가</button>');
      return;
    }
    var shown = list.slice(0, 10);
    host.innerHTML = '<ul class="lv-ml-manage-list">' + shown.map(upcomingRowHtml).join("") + "</ul>" +
      (list.length > shown.length ? '<p class="lv-ml-note">외 ' + (list.length - shown.length) + "개는 일정·할 일·목표에서 볼 수 있어요.</p>" : "") +
      '<p class="lv-ml-inline-acts"><a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#ml-calendar">일정 보기</a></p>';
  }

  /* the selected day's task deadlines and records, from the same store (nothing copied into the calendar) */
  function dayExtrasHtml(store, ds) {
    var it = dayItems(store, ds);
    var recs = it.journal.map(function (j) { return recordRow("journal", j); })
      .concat(it.tx.map(function (x) { return recordRow("tx", x); }), it.health.map(function (h) { return recordRow("health", h); }));
    return '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">이 날 마감인 할 일 <small>' + it.todos.length + "</small></h3></div>" +
      (it.todos.length ? '<ul class="lv-ml-manage-list lv-ml-tasks">' + it.todos.map(function (x) { return todoItemHtml(x, store, { prefix: "ml-cd-" }); }).join("") + "</ul>"
        : emptyBox("이 날짜가 마감인 할 일이 없어요.", '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-add="todo" data-date="' + esc(ds) + '">이 날짜로 할 일 추가</button>')) +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">이 날의 기록 <small>' + recs.length + "</small></h3></div>" +
      (recs.length ? '<ul class="lv-ml-manage-list">' + recs.map(function (r) {
          return "<li><div><strong>" + esc(r.title) + "</strong><p>" + esc(r.meta) + "</p></div>" +
            '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="' + r.type + '" data-id="' + esc(r.id) + '" aria-label="' + esc(r.title) + ' 수정">수정</button></div></li>';
        }).join("") + "</ul>"
        : emptyBox("이 날짜에 남긴 기록이 없어요.", '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-add="journal" data-date="' + esc(ds) + '">이 날짜에 기록 작성</button>'));
  }

  function viewRoutines(store) {
    var now = new Date();
    var today = store.habits.filter(function (h) { return habitScheduledOn(h, now); });
    var rest = store.habits.filter(function (h) { return !habitScheduledOn(h, now); });
    return '<p class="lv-ml-note">오늘 할 차례인 루틴만 체크할 수 있어요. 연속 기록과 이번 주 횟수는 실제로 체크한 기록으로만 계산하고, 하루 빠져도 다른 기록은 지워지지 않습니다.</p>' +
      (store.habits.length
        ? '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">오늘 · ' + esc(fmtDay(todayStr(now))) + " <small>" + today.length + "</small></h3></div>" +
          (today.length ? '<ul class="lv-ml-manage-list lv-ml-tasks">' + today.map(function (h) { return habitRowHtml(h, store); }).join("") + "</ul>" : emptyBox("오늘 할 루틴이 없어요.")) +
          (rest.length ? '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">오늘은 쉬는 루틴 <small>' + rest.length + "</small></h3></div>" +
            '<ul class="lv-ml-manage-list lv-ml-tasks">' + rest.map(function (h) { return habitRowHtml(h, store); }).join("") + "</ul>" : "")
        : emptyBox("루틴이 없습니다. 운동·독서처럼 반복할 일을 요일과 함께 등록해 보세요.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="habit">루틴 추가</button>'));
  }

  function viewRecords(store) {
    var all = recordsList(store, { type: "all", range: "all" });
    var rows = recordsList(store, { type: state.recordType, range: state.recordRange, q: state.recordQ });
    var counts = { all: all.length };
    all.forEach(function (r) { counts[r.type] = (counts[r.type] || 0) + 1; });
    var shown = rows.slice(0, state.recordLimit || 30);
    var addBtns = '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="journal">기록 작성</button> ' +
      '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-add="tx">지출 기록</button> ' +
      '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-add="health">건강 기록</button>';
    return '<p class="lv-ml-note">일기·수입·지출·건강·경험 기록을 날짜순으로 모아 봅니다. 모두 이 기기에만 비공개로 저장되며 커뮤니티나 LIVON AI로 보내지지 않습니다.</p>' +
      '<div class="lv-ml-filterbar">' +
        chipGroup("기록 종류", RECORD_TYPES.map(function (x) { return { id: x.id, label: x.label, count: counts[x.id] || 0 }; }), "data-lv-ml-record-type", state.recordType) +
        '<label class="lv-ml-field lv-ml-field--inline"><span>기간</span><select data-lv-ml-record-range>' + RECORD_RANGES.map(function (o) {
          return '<option value="' + o.id + '"' + (o.id === state.recordRange ? " selected" : "") + ">" + o.label + "</option>";
        }).join("") + "</select></label>" +
      "</div>" +
      '<form class="lv-ml-inline-form" data-lv-ml-record-search role="search"><label class="lv-ml-field"><span>기록에서 찾기</span><input name="q" type="search" maxlength="60" autocomplete="off" value="' + esc(state.recordQ) + '" /></label>' +
        '<button type="submit" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm">찾기</button>' +
        (state.recordQ ? '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-record-reset>지우기</button>' : "") + "</form>" +
      '<p class="lv-ml-note" data-lv-ml-record-count>' + rows.length + "개" + (rows.length > shown.length ? " 중 " + shown.length + "개 표시" : "") + "</p>" +
      (shown.length
        ? '<ul class="lv-ml-manage-list">' + shown.map(function (r) {
            return "<li><div><strong>" + esc(r.title) + "</strong><p>" + esc([fmtDay(r.date) || r.date || "날짜 없음", (RECORD_TYPES.find(function (x) { return x.id === r.type; }) || {}).label, r.meta].filter(Boolean).join(" · ")) + "</p>" +
              (r.text ? '<p class="lv-ml-journal-body">' + esc(String(r.text).slice(0, 160)) + "</p>" : "") + "</div>" +
              '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="' + r.type + '" data-id="' + esc(r.id) + '" aria-label="' + esc(r.title) + ' 수정">수정</button>' +
              '<button type="button" data-lv-ml-del="' + r.type + '" data-id="' + esc(r.id) + '" aria-label="' + esc(r.title) + ' 삭제">삭제</button></div></li>';
          }).join("") + "</ul>" +
          (rows.length > shown.length ? '<p class="lv-ml-inline-acts"><button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-record-more>더 보기</button></p>' : "")
        : all.length
          ? emptyBox("조건에 맞는 기록이 없어요.", '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-record-reset>조건 초기화</button>')
          : emptyBox("아직 기록이 없어요. 오늘 있었던 일이나 지출을 짧게 남겨 보세요.", addBtns)) +
      (all.length ? '<div class="lv-ml-inline-acts">' + addBtns + "</div>" : "");
  }

  function viewSearch(store) {
    var r = searchMyLife(store, state.searchQ, 50);
    return '<p class="lv-ml-note">내 생활 검색은 이 기기에 저장된 일정·할 일·목표·루틴·기록만 찾습니다. LIVON 통합 검색에는 포함되지 않고, 검색어도 저장하거나 보내지 않습니다.</p>' +
      searchFormHtml("ml-search-q-panel") +
      (!r.q ? emptyBox("찾을 단어를 입력해 주세요.")
        : r.total
          ? '<p class="lv-ml-note">‘' + esc(r.q) + "’ 검색 결과 " + r.total + "개" + (r.total > r.items.length ? " · 최근 " + r.items.length + "개 표시" : "") + "</p>" +
            '<ul class="lv-ml-manage-list">' + r.items.map(function (x) {
              var editable = x.type !== "checklist" && x.type !== "project";
              return "<li><div><strong>" + esc(x.title) + "</strong><p>" + esc([x.label, x.date ? fmtDay(x.date) || x.date : ""].filter(Boolean).join(" · ")) + "</p></div>" +
                '<div class="lv-ml-row-acts">' + (editable ? '<button type="button" data-lv-ml-edit="' + x.type + '" data-id="' + esc(x.id) + '" aria-label="' + esc(x.title) + ' 열기">열기</button>' : "") +
                '<a href="#ml-' + x.view + '">' + esc(x.label) + ' 화면<span class="visually-hidden">: ' + esc(x.title) + "</span></a></div></li>";
            }).join("") + "</ul>"
          : emptyBox("‘" + r.q + "’와(과) 일치하는 내 생활 항목이 없어요."));
  }

  function searchFormHtml(id) {
    return '<form class="lv-ml-inline-form" data-lv-ml-search-form role="search" aria-label="내 생활 검색"><label class="lv-ml-field" for="' + id + '"><span>내 생활에서 찾기</span>' +
      '<input id="' + id + '" name="q" type="search" maxlength="60" autocomplete="off" value="' + esc(state.searchQ) + '" placeholder="예: 병원, 이력서" /></label>' +
      '<button type="submit" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm">검색</button></form>';
  }

  var COLLECTION_LABELS = { events: "일정", todos: "할 일", goals: "목표", habits: "루틴", habitLogs: "루틴 체크", checklists: "체크리스트", projects: "전환 준비",
    journal: "기록", transactions: "수입·지출", budgets: "월 예산", health: "건강 기록", experiences: "경험" };

  function aiUsesMyLife() {
    var ai = readJSON("livon.aiStore.v1", null);
    return !!(ai && isObj(ai.settings) && ai.settings.shareMyLife === true);
  }

  function myLifeDataHtml(store) {
    var c = exportCounts(store);
    var total = 0;
    var parts = ML_COLLECTIONS.filter(function (k) { total += c[k]; return c[k]; }).map(function (k) { return COLLECTION_LABELS[k] + " " + c[k]; });
    return '<div class="lv-ml-block-label" style="margin-top:1.5rem"><p class="lv-ml-kicker" lang="en">Data</p><h3 class="lv-ml-title lv-ml-title--md" id="ml-data-title">내 생활 데이터</h3></div>' +
      '<p class="lv-ml-note">일정·할 일·목표·루틴·기록·생활비·건강 기록은 이 기기에만 비공개로 저장돼요. 커뮤니티에 자동으로 올라가지 않아요.</p>' +
      '<ul class="lv-ml-manage-list" aria-labelledby="ml-data-title">' +
        "<li><div><strong>저장된 항목</strong><p>" + esc(parts.join(" · ") || "없음") + "</p></div></li>" +
        "<li><div><strong>LIVON AI가 내 생활 사용</strong><p>" + (aiUsesMyLife()
          ? "켜짐 · 내 생활을 묻는 질문에만 열린 할 일·목표·2주 일정의 제목과 날짜를 보내요. 기록·건강·돈은 보내지 않아요."
          : "꺼짐 (기본) · LIVON AI에 내 생활 내용을 보내지 않아요.") + '</p></div><div class="lv-ml-row-acts"><a href="#ai-settings">AI 설정</a></div></li>' +
      "</ul>" +
      '<p class="lv-ml-inline-acts">' +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-export' + (total ? "" : " disabled") + ">내 생활 데이터 내보내기 (JSON)</button> " +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm lv-ml-btn--danger-outline" data-lv-ml-clear' + (total ? "" : " disabled") + ">내 생활 데이터 전체 삭제</button></p>" +
      '<p class="lv-ml-note">내보내기는 이 브라우저에서 파일로 내려받기만 하고 어디에도 올리지 않아요. 전체 삭제는 내 생활 기록만 지우고 저장한 항목·커뮤니티·맞춤 설정·관심사·LIVON AI 대화·ONGIL·Newon+ 계정은 그대로 둬요.' +
        (total ? "" : " 지울 내 생활 데이터가 없어요.") + "</p>";
  }

  /* browser download only: a Blob URL clicked locally, revoked right after — nothing is uploaded */
  function downloadExport() {
    try {
      var payload = exportPayload(loadStore());
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "livon-my-life-" + todayStr() + ".json";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 1000);
      return true;
    } catch (e) { return false; }
  }

  function viewMoney(store) {
    var now = new Date();
    var md = new Date(now.getFullYear(), now.getMonth() + (Number(state.moneyOffset) || 0), 1);
    var ym = ymOf(md), isNow = !(Number(state.moneyOffset) || 0);
    var m = moneySummary(store, ym);
    var monthLabel = md.getFullYear() + "년 " + (md.getMonth() + 1) + "월";
    var cats = Object.keys(m.byCat).sort(function (a, b) { return m.byCat[b] - m.byCat[a]; });
    var monthTx = store.transactions.filter(function (x) { return String(x.date || "").indexOf(ym) === 0; })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)) || ((b.createdAt || 0) - (a.createdAt || 0)); });
    return '<div class="lv-ml-cal-head">' +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-money-nav="-1" aria-label="이전 달">이전</button>' +
        '<strong aria-live="polite">' + esc(monthLabel) + "</strong>" +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-money-nav="1" aria-label="다음 달">다음</button>' +
        (isNow ? "" : '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-money-nav="0">이번 달</button>') +
      "</div>" +
      '<div class="lv-ml-stats">' +
      '<div class="lv-ml-stat"><p>' + (isNow ? "이번 달" : esc(monthLabel)) + " 수입</p><strong>" + fmtMoney(m.income) + "</strong></div>" +
      '<div class="lv-ml-stat"><p>' + (isNow ? "이번 달" : esc(monthLabel)) + " 지출</p><strong>" + fmtMoney(m.expense) + "</strong></div>" +
      '<div class="lv-ml-stat"><p>월 예산</p><strong>' + (m.budget ? fmtMoney(m.budget) : "미설정") + "</strong>" + (m.budget ? "<span>사용 " + m.usedPct + "%</span>" : "") + "</div>" +
      '<div class="lv-ml-stat"><p>남은 예산</p><strong>' + (m.remain == null ? "—" : fmtMoney(Math.abs(m.remain))) + "</strong>" +
        (m.remain != null && m.remain < 0 ? "<span>예산보다 " + fmtMoney(-m.remain) + " 더 썼어요</span>" : "") + "</div>" +
    "</div>" +
    '<form class="lv-ml-inline-form" data-lv-ml-budget-form><label class="lv-ml-field"><span>월 예산 (매달 같은 금액)</span><input type="number" min="0" step="1000" name="monthly" value="' + esc(m.budget || "") + '" /></label><button type="submit" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm">예산 저장</button></form>' +
    '<p class="lv-ml-note">계좌·카드 자동 수집은 연결되어 있지 않습니다. 직접 기록한 금액만 집계하며, 투자·대출 판단은 하지 않습니다.</p>' +
    '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">카테고리별 지출</h3></div>' +
    (cats.length
      ? '<ul class="lv-ml-bar-list">' + cats.map(function (k) {
          var pct = m.expense ? Math.round(m.byCat[k] / m.expense * 100) : 0;
          return "<li><span>" + esc(k) + '</span><div class="lv-ml-progress" role="img" aria-label="' + esc(k) + " 지출 비중 " + pct + '%"><span style="width:' + pct + '%"></span></div><em>' + fmtMoney(m.byCat[k]) + " · " + pct + "%</em></li>";
        }).join("") + "</ul>"
      : emptyBox((isNow ? "이번 달" : monthLabel) + " 지출 기록이 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="tx">지출 기록</button>')) +
    '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">' + esc(monthLabel) + " 거래 <small>" + monthTx.length + "</small></h3></div>" +
    (monthTx.length ? '<ul class="lv-ml-manage-list">' + monthTx.slice(0, 60).map(function (x) {
      var label = (x.kind === "income" ? "+" : "-") + fmtMoney(x.amount);
      return "<li><div><strong>" + esc(label) + "</strong><p>" + esc([fmtDay(x.date) || x.date, x.kind === "income" ? "수입" : "지출", x.category, x.note].filter(Boolean).join(" · ")) + "</p></div>" +
        '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="tx" data-id="' + esc(x.id) + '" aria-label="' + esc(label) + ' 거래 수정">수정</button><button type="button" data-lv-ml-del="tx" data-id="' + esc(x.id) + '" aria-label="' + esc(label) + ' 거래 삭제">삭제</button></div></li>';
    }).join("") + "</ul>" + (monthTx.length > 60 ? '<p class="lv-ml-note">최근 60개만 표시합니다. 전체 기록에서 모두 볼 수 있어요.</p>' : "") : emptyBox("이 달에 기록한 거래가 없습니다."));
  }

  /* 주간 리뷰: counts of one week (weeklyReview), with week navigation; no score */
  function weeklyReviewHtml(store) {
    var off = Number(state.reviewOffset) || 0;
    var w = weeklyReview(store, new Date(), off);
    var nothing = !(w.events || w.todosDone || w.todosDue || w.todosAdded || w.goalsDone || w.habitDone || w.journal || w.health || w.expense || w.income);
    var weekLabel = fmtDay(w.from) + " ~ " + fmtDay(w.to);
    return '<div class="lv-ml-block-label"><p class="lv-ml-kicker" lang="en">Weekly review</p><h3 class="lv-ml-title lv-ml-title--md">주간 리뷰</h3></div>' +
      '<div class="lv-ml-cal-head">' +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-review-nav="-1" aria-label="이전 주">이전</button>' +
        '<strong aria-live="polite">' + esc((off === 0 ? "이번 주 · " : off === -1 ? "지난주 · " : "") + weekLabel) + "</strong>" +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-review-nav="1" aria-label="다음 주"' + (off >= 0 ? " disabled" : "") + ">다음</button>" +
        (off ? '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-review-nav="0">이번 주</button>' : "") +
      "</div>" +
      '<p class="lv-ml-note">이 주에 실제로 기록된 것만 셉니다. 점수나 평가는 매기지 않아요.</p>' +
      (nothing ? emptyBox("이 주에는 기록된 일정·할 일·루틴·기록이 없어요.") :
      '<div class="lv-ml-stats">' +
        '<div class="lv-ml-stat"><p>일정</p><strong>' + w.events + "</strong><span>이 주 날짜</span></div>" +
        '<div class="lv-ml-stat"><p>완료한 할 일</p><strong>' + w.todosDone + "</strong><span>이 주에 완료</span></div>" +
        '<div class="lv-ml-stat"><p>이 주 마감</p><strong>' + w.todosDue + "</strong><span>남음 " + w.todosDueOpen + "</span></div>" +
        '<div class="lv-ml-stat"><p>새 할 일</p><strong>' + w.todosAdded + "</strong><span>이 주에 추가</span></div>" +
        '<div class="lv-ml-stat"><p>루틴 체크</p><strong>' + w.habitDone + "</strong><span>예정 " + w.habitPlanned + "</span></div>" +
        '<div class="lv-ml-stat"><p>완료한 목표</p><strong>' + w.goalsDone + "</strong></div>" +
        '<div class="lv-ml-stat"><p>기록</p><strong>' + w.journal + "</strong><span>건강 " + w.health + "</span></div>" +
        '<div class="lv-ml-stat"><p>지출</p><strong>' + fmtMoney(w.expense) + "</strong><span>수입 " + fmtMoney(w.income) + "</span></div>" +
      "</div>");
  }

  return {
    views: { routines: viewRoutines, records: viewRecords, search: viewSearch, money: viewMoney },
    renderTodayHabits: renderTodayHabits, renderUpcoming: renderUpcoming, dayExtrasHtml: dayExtrasHtml, weeklyReviewHtml: weeklyReviewHtml,
    myLifeDataHtml: myLifeDataHtml, downloadExport: downloadExport, exportCounts: exportCounts, clearMyLifeData: clearMyLifeData,
    searchMyLife: searchMyLife, recordsList: recordsList,
    fns: { habitStreak: habitStreak, habitWeek: habitWeek, startOfWeek: startOfWeek, dayItems: dayItems, upcomingItems: upcomingItems, weeklyReview: weeklyReview,
      recordsList: recordsList, searchMyLife: searchMyLife, exportPayload: exportPayload, exportCounts: exportCounts, clearMyLifeData: clearMyLifeData }
  };
  } };
})();
