(function () {
  var STORE_KEY = "livon.mlStore.v1";
  var KEY_STAGE = "livon.lifeStage";
  var KEY_ML_INTERESTS = "livon.mlInterests";
  var KEY_LIFE_INTERESTS = "livon.lifeInterests";
  var KEY_SITUATIONS = "livon.lifeSituations";
  var KEY_TD_SAVED = "livon.tdSaved";
  var KEY_LIFE_SAVED = "livon.lifeSavedLocal";
  var DATA = window.LivonMyLifeData || { modules: [], checklistTemplates: [], projectTemplates: [], stages: {} };

  var state = {
    view: "home",
    calMonth: null,
    calMode: "month",
    editing: null,
    formType: null
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
    return (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h"), 10) || 74) + 52;
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }
  function fmtMoney(n) {
    n = Number(n) || 0;
    return n.toLocaleString("ko-KR") + "원";
  }
  function confirmDelete(msg) {
    return window.confirm(msg || "삭제할까요? 이 작업은 되돌릴 수 없습니다.");
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
    var s = readJSON(STORE_KEY, null);
    if (!s || typeof s !== "object") s = emptyStore();
    var base = emptyStore();
    Object.keys(base).forEach(function (k) {
      if (s[k] == null) s[k] = base[k];
    });
    return s;
  }
  function saveStore(s) { writeJSON(STORE_KEY, s); }

  function collectedSaved() {
    var out = [];
    var td = readJSON(KEY_TD_SAVED, []);
    if (Array.isArray(td)) {
      td.forEach(function (x) {
        out.push({
          id: "td:" + (x.id || x.label),
          label: x.label || x.id || "저장 항목",
          source: "오늘의 발견",
          href: x.id ? "#td-item-" + x.id : "#today",
          at: x.at || 0
        });
      });
    }
    var life = readJSON(KEY_LIFE_SAVED, []);
    if (Array.isArray(life)) {
      life.forEach(function (name) {
        if (typeof name === "string") {
          out.push({ id: "life:" + name, label: name, source: "라이프 스테이지", href: "#life", at: 0 });
        } else if (name && name.name) {
          out.push({ id: "life:" + name.name, label: name.name, source: "라이프 스테이지", href: "#life", at: name.at || 0 });
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
      '<button type="button" class="lv-ml-modal__backdrop" data-lv-ml-form-close aria-label="닫기"></button>' +
      '<div class="lv-ml-modal__panel" role="dialog" aria-modal="true" aria-labelledby="lv-ml-form-title">' +
        '<button type="button" class="lv-ml-modal__close" data-lv-ml-form-close aria-label="닫기">×</button>' +
        '<h2 id="lv-ml-form-title" data-lv-ml-form-title>추가</h2>' +
        '<form data-lv-ml-form class="lv-ml-form"></form>' +
      "</div>";
    document.body.appendChild(m);
    return m;
  }
  function openForm(type, item) {
    state.formType = type;
    state.editing = item || null;
    var modal = ensureModal();
    var title = $("[data-lv-ml-form-title]", modal);
    var form = $("[data-lv-ml-form]", modal);
    var labels = {
      event: "일정", todo: "할 일", goal: "목표", habit: "습관", tx: "거래",
      journal: "기록", experience: "경험", checklist: "체크리스트", project: "프로젝트", health: "건강 기록"
    };
    if (title) title.textContent = (item ? "수정 · " : "추가 · ") + (labels[type] || type);
    form.innerHTML = buildFormFields(type, item) +
      '<div class="lv-ml-form__acts">' +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline" data-lv-ml-form-close>취소</button>' +
        '<button type="submit" class="lv-ml-btn lv-ml-btn--dark">저장</button>' +
      "</div>";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var first = form.querySelector("input,textarea,select");
    if (first) first.focus();
  }
  function closeForm() {
    var modal = $("#lv-ml-form-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    state.formType = null;
    state.editing = null;
  }

  function field(label, html) {
    return '<label class="lv-ml-field"><span>' + esc(label) + "</span>" + html + "</label>";
  }
  function buildFormFields(type, item) {
    item = item || {};
    var t = todayStr();
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
    if (type === "todo") {
      return field("할 일", '<input name="title" required value="' + esc(item.title || "") + '" />') +
        field("마감일", '<input type="date" name="due" value="' + esc(item.due || t) + '" />') +
        field("우선순위", '<select name="priority">' + (DATA.todoPriorities || []).map(function (c) {
          return '<option' + (item.priority === c ? " selected" : "") + ">" + esc(c) + "</option>";
        }).join("") + "</select>") +
        field("카테고리", '<select name="category">' + (DATA.todoCategories || []).map(function (c) {
          return '<option' + (item.category === c ? " selected" : "") + ">" + esc(c) + "</option>";
        }).join("") + "</select>") +
        field("메모", '<textarea name="note" rows="3">' + esc(item.note || "") + "</textarea>");
    }
    if (type === "goal") {
      return field("목표", '<input name="title" required value="' + esc(item.title || "") + '" />') +
        field("설명", '<textarea name="note" rows="2">' + esc(item.note || "") + "</textarea>") +
        field("카테고리", '<select name="category">' + (DATA.goalCategories || []).map(function (c) {
          return '<option' + (item.category === c ? " selected" : "") + ">" + esc(c) + "</option>";
        }).join("") + "</select>") +
        field("시작일", '<input type="date" name="start" value="' + esc(item.start || t) + '" />') +
        field("목표일", '<input type="date" name="due" value="' + esc(item.due || "") + '" />') +
        field("진행률(%)", '<input type="number" min="0" max="100" name="progress" value="' + esc(item.progress != null ? item.progress : 0) + '" />') +
        field("다음 할 일", '<input name="next" value="' + esc(item.next || "") + '" />');
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
    if (type === "journal") {
      return field("제목", '<input name="title" value="' + esc(item.title || "") + '" />') +
        field("날짜", '<input type="date" name="date" required value="' + esc(item.date || t) + '" />') +
        field("기분", '<select name="mood">' + (DATA.journalMoods || []).map(function (c) {
          return '<option' + (item.mood === c ? " selected" : "") + ">" + esc(c) + "</option>";
        }).join("") + "</select>") +
        field("내용", '<textarea name="body" rows="5" required>' + esc(item.body || "") + "</textarea>");
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

  function saveFromForm(form) {
    var type = state.formType;
    var data = formData(form);
    var store = loadStore();
    var now = Date.now();
    var id = state.editing && state.editing.id ? state.editing.id : uid(type);

    if (type === "event") {
      if (!data.title || !data.date) return alert("제목과 날짜를 입력해 주세요.");
      // simple conflict note
      var conflicts = store.events.filter(function (e) {
        return e.id !== id && e.date === data.date && !e.allDay && data.start && e.start === data.start;
      });
      if (conflicts.length) {
        if (!window.confirm("같은 날짜·시작 시간에 다른 일정이 있습니다. 그래도 저장할까요?")) return;
      }
      upsert(store.events, {
        id: id, title: data.title, date: data.date, start: data.start || "", end: data.end || "",
        allDay: !!data.allDay, place: data.place || "", category: data.category || "개인",
        note: data.note || "", done: state.editing && state.editing.done, updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "todo") {
      if (!data.title) return alert("할 일을 입력해 주세요.");
      upsert(store.todos, {
        id: id, title: data.title, due: data.due || "", priority: data.priority || "보통",
        category: data.category || "일상", note: data.note || "",
        done: state.editing ? !!state.editing.done : false,
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "goal") {
      if (!data.title) return alert("목표를 입력해 주세요.");
      upsert(store.goals, {
        id: id, title: data.title, note: data.note || "", category: data.category || "기타",
        start: data.start || todayStr(), due: data.due || "", next: data.next || "",
        progress: Math.max(0, Math.min(100, Number(data.progress) || 0)),
        status: Number(data.progress) >= 100 ? "완료" : "진행 중",
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "habit") {
      if (!data.title) return alert("습관을 입력해 주세요.");
      upsert(store.habits, {
        id: id, title: data.title, freq: data.freq || "daily",
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "tx") {
      var amount = Number(data.amount);
      if (!data.date || !(amount >= 0)) return alert("금액과 날짜를 확인해 주세요.");
      upsert(store.transactions, {
        id: id, kind: data.kind || "expense", amount: amount, date: data.date,
        category: data.category || "기타", note: data.note || "",
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "journal") {
      if (!data.body) return alert("내용을 입력해 주세요.");
      upsert(store.journal, {
        id: id, title: data.title || "기록", date: data.date || todayStr(), mood: data.mood || "보통",
        body: data.body, private: true,
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "experience") {
      if (!data.title) return alert("활동명을 입력해 주세요.");
      upsert(store.experiences, {
        id: id, title: data.title, status: data.status || "관심 있음", date: data.date || "",
        place: data.place || "", cost: data.cost === "" ? null : Number(data.cost),
        note: data.note || "", private: true,
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "checklist") {
      if (!data.title) return alert("제목을 입력해 주세요.");
      var items = String(data.items || "").split("\n").map(function (line) { return line.trim(); }).filter(Boolean)
        .map(function (text, idx) {
          var prev = state.editing && state.editing.items && state.editing.items[idx];
          return { id: (prev && prev.id) || uid("ci"), text: text, done: prev ? !!prev.done : false };
        });
      upsert(store.checklists, {
        id: id, title: data.title, desc: data.desc || "", items: items,
        updatedAt: now, createdAt: (state.editing && state.editing.createdAt) || now
      });
    } else if (type === "project") {
      if (!data.title) return alert("프로젝트 제목을 입력해 주세요.");
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
    var todos = store.todos.filter(function (x) { return x.due === t || (!x.due && !x.done); });
    var todosOpen = todos.filter(function (x) { return !x.done; });
    var goals = store.goals.filter(function (g) { return g.status !== "완료"; });
    var habits = store.habits || [];
    var pendingHabits = habits.filter(function (h) { return !(store.habitLogs[h.id] || {})[t]; }).length;
    var reservations = events.filter(function (e) { return e.category === "예약"; }).length +
      (store.experiences || []).filter(function (x) { return x.date === t && (x.status === "참여 예정" || x.status === "계획 중"); }).length;
    var anniversaries = store.events.filter(function (e) { return e.category === "기념일" && e.date === t; }).length;
    var overdue = store.todos.filter(function (x) { return !x.done && x.due && x.due < t; }).length;
    var alerts = overdue + pendingHabits;
    host.innerHTML =
      '<div class="lv-ml-stat lv-ml-stat--hero"><p>일정</p><strong>' + events.length + "</strong><span>오늘</span></div>" +
      '<div class="lv-ml-stat"><p>할 일</p><strong>' + todosOpen.length + "</strong><span>남음</span></div>" +
      '<div class="lv-ml-stat"><p>목표</p><strong>' + goals.length + "</strong><span>진행 중</span></div>" +
      '<div class="lv-ml-stat"><p>습관</p><strong>' + pendingHabits + "</strong><span>오늘 실천</span></div>" +
      '<div class="lv-ml-stat"><p>예약·활동</p><strong>' + reservations + "</strong><span>오늘</span></div>" +
      '<div class="lv-ml-stat"><p>기념일</p><strong>' + anniversaries + "</strong><span>오늘</span></div>" +
      '<div class="lv-ml-stat' + (alerts ? " lv-ml-stat--alert" : "") + '"><p>확인 필요</p><strong>' + alerts + "</strong><span>기한·습관</span></div>";
  }

  function renderTimeline() {
    var host = $("[data-lv-ml-timeline]");
    if (!host) return;
    var store = loadStore();
    var t = todayStr();
    var now = new Date();
    var hh = now.getHours(), mm = now.getMinutes();
    var nowMin = hh * 60 + mm;
    var list = store.events.filter(function (e) { return e.date === t; })
      .sort(function (a, b) { return String(a.start || "").localeCompare(String(b.start || "")); });
    if (!list.length) {
      host.innerHTML = emptyBox("오늘 예정된 일정이 없어요.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="event">일정 추가</button>');
      return;
    }
    host.innerHTML = '<ol class="lv-ml-timeline">' + list.map(function (e) {
      var past = false;
      if (e.start && !e.allDay) {
        var parts = e.start.split(":");
        past = (+parts[0] * 60 + (+parts[1] || 0)) < nowMin;
      }
      return '<li class="' + (past ? "is-past" : "is-soon") + (e.done ? " is-done" : "") + '">' +
        '<button type="button" data-lv-ml-edit="event" data-id="' + esc(e.id) + '">' +
          "<em>" + esc(e.allDay ? "종일" : (e.start || "시간 미정")) + "</em>" +
          "<strong>" + esc(e.title) + "</strong>" +
          "<span>" + esc([e.category, e.place].filter(Boolean).join(" · ")) + "</span>" +
        "</button>" +
        '<label class="lv-ml-check-inline"><input type="checkbox" data-lv-ml-toggle="event" data-id="' + esc(e.id) + '"' + (e.done ? " checked" : "") + " />완료</label>" +
      "</li>";
    }).join("") + "</ol>";
  }

  function renderTodayTodos() {
    var host = $("[data-lv-ml-today-todos]");
    if (!host) return;
    var store = loadStore();
    var t = todayStr();
    var list = store.todos.filter(function (x) {
      return x.due === t || (!x.due && !x.done) || (x.priority === "높음" && !x.done);
    }).slice(0, 8);
    if (!list.length) {
      host.innerHTML = emptyBox("오늘 표시할 할 일이 없어요.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="todo">할 일 추가</button>');
      return;
    }
    var open = list.filter(function (x) { return !x.done; }).length;
    host.innerHTML = '<p class="lv-ml-note">남음 ' + open + " / 표시 " + list.length + "</p>" +
      '<ul class="lv-ml-todo-list">' +
      list.map(function (x) {
        return "<li>" +
          '<label><input type="checkbox" data-lv-ml-toggle="todo" data-id="' + esc(x.id) + '"' + (x.done ? " checked" : "") + " /><span class=\"" + (x.done ? "is-done" : "") + "\">" + esc(x.title) + "</span></label>" +
          "<em>" + esc([x.priority, x.due].filter(Boolean).join(" · ")) + "</em>" +
        "</li>";
      }).join("") + "</ul>";
  }

  function renderActiveGoals() {
    var host = $("[data-lv-ml-active-goals]");
    if (!host) return;
    var store = loadStore();
    var goals = store.goals.filter(function (g) { return g.status !== "완료"; }).slice(0, 4);
    var projects = store.projects.filter(function (p) { return p.status !== "완료"; }).slice(0, 2);
    if (!goals.length && !projects.length) {
      host.innerHTML = emptyBox("진행 중인 목표·프로젝트가 없어요.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="goal">목표 만들기</button>');
      return;
    }
    host.innerHTML = '<div class="lv-ml-goal-grid">' + goals.map(function (g) {
      return '<article class="lv-ml-goal-card">' +
        "<h4>" + esc(g.title) + "</h4>" +
        '<div class="lv-ml-progress"><span style="width:' + (g.progress || 0) + '%"></span></div>' +
        "<p>" + esc(g.progress || 0) + "% · 다음: " + esc(g.next || "—") + "</p>" +
        "<p class=\"lv-ml-note\">목표일 " + esc(g.due || "미정") + "</p>" +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-goto="goals">상세 보기</button>' +
      "</article>";
    }).join("") + projects.map(function (p) {
      var done = (p.steps || []).filter(function (s) { return s.done; }).length;
      var total = (p.steps || []).length || 1;
      var pct = Math.round(done / total * 100);
      return '<article class="lv-ml-goal-card">' +
        "<h4>" + esc(p.title) + "</h4>" +
        '<div class="lv-ml-progress"><span style="width:' + pct + '%"></span></div>' +
        "<p>프로젝트 · " + pct + "%</p>" +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-goto="projects">상세 보기</button>' +
      "</article>";
    }).join("") + "</div>";
  }

  function renderRecentSaved() {
    var host = $("[data-lv-ml-recent-saved]");
    if (!host) return;
    var list = collectedSaved().slice(0, 6);
    if (!list.length) {
      host.innerHTML = emptyBox("저장한 항목이 없어요. 관심 콘텐츠를 찾아보세요.",
        '<a class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" href="#today">오늘의 발견</a> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#life">라이프 스테이지</a> <a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#explore">탐색</a>');
      return;
    }
    host.innerHTML = '<ul class="lv-ml-saved-list">' + list.map(function (x) {
      return "<li><a href=\"" + esc(x.href) + "\"><strong>" + esc(x.label) + "</strong><span>" + esc(x.source) + "</span></a></li>";
    }).join("") + '</ul><p style="margin-top:1rem"><button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-goto="saved">저장함 전체</button></p>';
  }

  function renderModules() {
    var host = $("[data-lv-ml-modules]");
    if (!host) return;
    host.innerHTML = (DATA.modules || []).map(function (m) {
      return '<button type="button" class="lv-ml-module" data-lv-ml-goto="' + esc(m.id) + '">' +
        "<em>" + esc(m.kicker) + "</em><strong>" + esc(m.title) + "</strong><span>" + esc(m.desc) + "</span>" +
      "</button>";
    }).join("");
  }

  function setNav(view) {
    $$("[data-lv-ml-goto]").forEach(function (a) {
      if (a.tagName === "A" && a.closest(".lv-ml-nav")) {
        a.classList.toggle("is-on", a.getAttribute("data-lv-ml-goto") === view || (view === "home" && a.getAttribute("data-lv-ml-goto") === "home"));
      }
    });
  }

  function gotoView(view) {
    state.view = view || "home";
    setNav(state.view);
    if (state.view === "home") {
      refreshDashboard();
      scrollToId("ml-home");
      history.replaceState(null, "", "#ml-home");
      return;
    }
    renderPanel(state.view);
    scrollToId("ml-panel");
    history.replaceState(null, "", "#ml-" + state.view);
  }

  function panelTitle(view) {
    var m = (DATA.modules || []).find(function (x) { return x.id === view; });
    return m ? m.title : "관리";
  }

  function renderPanel(view) {
    var title = $("[data-lv-ml-panel-title]");
    var actions = $("[data-lv-ml-panel-actions]");
    var panel = $("[data-lv-ml-panel]");
    if (!panel) return;
    if (title) title.textContent = panelTitle(view);
    if (actions) {
      var addMap = { calendar: "event", todos: "todo", goals: "goal", money: "tx", health: "health", experiences: "experience", journal: "journal", projects: "project" };
      actions.innerHTML = addMap[view]
        ? '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="' + addMap[view] + '">추가</button>'
        : "";
    }
    var store = loadStore();
    if (view === "calendar") panel.innerHTML = viewCalendar(store);
    else if (view === "todos") panel.innerHTML = viewTodos(store);
    else if (view === "goals") panel.innerHTML = viewGoals(store);
    else if (view === "money") panel.innerHTML = viewMoney(store);
    else if (view === "health") panel.innerHTML = viewHealth(store);
    else if (view === "saved") panel.innerHTML = viewSaved();
    else if (view === "experiences") panel.innerHTML = viewExperiences(store);
    else if (view === "family") panel.innerHTML = viewFamily();
    else if (view === "journal") panel.innerHTML = viewJournal(store);
    else if (view === "projects") panel.innerHTML = viewProjects(store);
    else if (view === "report") panel.innerHTML = viewReport(store);
    else if (view === "settings") panel.innerHTML = viewSettings(store);
    else panel.innerHTML = emptyBox("알 수 없는 화면입니다.");
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
      return '<button type="button" class="lv-ml-chip-btn' + (mode === modeId ? " is-on" : "") + '" data-lv-ml-cal-mode="' + modeId + '">' + label + "</button>";
    }).join("");

    function eventListHtml(dayEvents) {
      return dayEvents.length
        ? '<ul class="lv-ml-manage-list">' + dayEvents.map(function (e) {
            return "<li><div><strong>" + esc(e.title) + "</strong><p>" + esc([e.start || (e.allDay ? "종일" : ""), e.place, e.category].filter(Boolean).join(" · ")) + "</p></div>" +
              '<div class="lv-ml-row-acts">' +
                '<button type="button" data-lv-ml-edit="event" data-id="' + esc(e.id) + '">수정</button>' +
                '<button type="button" data-lv-ml-del="event" data-id="' + esc(e.id) + '">삭제</button>' +
              "</div></li>";
          }).join("") + "</ul>"
        : emptyBox("이 날짜에 일정이 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="event">일정 추가</button>');
    }

    var body = "";
    if (mode === "month") {
      var first = new Date(y, m, 1);
      var startPad = first.getDay();
      var daysInMonth = new Date(y, m + 1, 0).getDate();
      var cells = [];
      for (var i = 0; i < startPad; i++) cells.push('<div class="lv-ml-cal__cell is-empty"></div>');
      for (var d = 1; d <= daysInMonth; d++) {
        var ds = y + "-" + (m + 1 < 10 ? "0" : "") + (m + 1) + "-" + (d < 10 ? "0" : "") + d;
        var count = store.events.filter(function (e) { return e.date === ds; }).length;
        cells.push('<button type="button" class="lv-ml-cal__cell' + (ds === t ? " is-today" : "") + (ds === selected ? " is-selected" : "") + '" data-lv-ml-cal-day="' + ds + '"><strong>' + d + "</strong>" +
          (count ? '<span>' + count + "</span>" : "") + "</button>");
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
        weekCells.push('<button type="button" class="lv-ml-week__day' + (wds === t ? " is-today" : "") + (wds === selected ? " is-selected" : "") + '" data-lv-ml-cal-day="' + wds + '">' +
          "<em>" + weekdayKo(wd) + "</em><strong>" + wd.getDate() + "</strong>" +
          '<ul>' + (wEvents.slice(0, 3).map(function (e) { return "<li>" + esc(e.start ? e.start + " " : "") + esc(e.title) + "</li>"; }).join("") || "<li class=\"is-empty\">없음</li>") + "</ul></button>");
      }
      body = '<div class="lv-ml-week">' + weekCells.join("") + "</div>";
    } else {
      var dayOnly = store.events.filter(function (e) { return e.date === selected; })
        .sort(function (a, b) { return String(a.start || "").localeCompare(String(b.start || "")); });
      body = '<div class="lv-ml-dayboard">' +
        '<p class="lv-ml-dayboard__date">' + esc(selected) + " · " + weekdayKo(new Date(selected + "T12:00:00")) + "</p>" +
        (dayOnly.length
          ? '<ol class="lv-ml-timeline">' + dayOnly.map(function (e) {
              return '<li class="' + (e.done ? "is-done" : "is-soon") + '"><button type="button" data-lv-ml-edit="event" data-id="' + esc(e.id) + '">' +
                "<em>" + esc(e.allDay ? "종일" : (e.start || "시간 미정")) + "</em><strong>" + esc(e.title) + "</strong>" +
                "<span>" + esc([e.category, e.place].filter(Boolean).join(" · ")) + "</span></button></li>";
            }).join("") + "</ol>"
          : emptyBox("표시할 일정이 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="event">일정 추가</button>')) +
      "</div>";
    }

    var dayEvents = store.events.filter(function (e) { return e.date === selected; })
      .sort(function (a, b) { return String(a.start || "").localeCompare(String(b.start || "")); });
    var headLabel = mode === "week"
      ? "주간 · " + selected
      : (y + "년 " + (m + 1) + "월");

    return '<div class="lv-ml-cal-toolbar">' +
      '<div class="lv-ml-cal-head">' +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-cal-nav="-1">이전</button>' +
        "<strong>" + headLabel + "</strong>" +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-cal-nav="1">다음</button>' +
        '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-cal-nav="0">오늘</button>' +
      "</div>" +
      '<div class="lv-ml-cal-modes">' + modeBtns + "</div>" +
    "</div>" +
    body +
    (mode === "day" ? "" : (
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">' + esc(selected) + " 일정</h3></div>" +
      eventListHtml(dayEvents)
    ));
  }

  function viewTodos(store) {
    var open = store.todos.filter(function (t) { return !t.done; });
    var done = store.todos.filter(function (t) { return t.done; });
    var templates = (DATA.checklistTemplates || []).map(function (tpl) {
      return '<button type="button" class="lv-ml-chip-btn" data-lv-ml-import-checklist="' + esc(tpl.id) + '">' + esc(tpl.title) + "</button>";
    }).join("");
    return '<p class="lv-ml-note">미완료 ' + open.length + " · 완료 " + done.length + "</p>" +
      '<ul class="lv-ml-manage-list">' + store.todos.map(function (t) {
        return "<li><label><input type=\"checkbox\" data-lv-ml-toggle=\"todo\" data-id=\"" + esc(t.id) + "\"" + (t.done ? " checked" : "") + " /> <strong class=\"" + (t.done ? "is-done" : "") + "\">" + esc(t.title) + "</strong></label>" +
          "<p>" + esc([t.priority, t.due, t.category].filter(Boolean).join(" · ")) + "</p>" +
          '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="todo" data-id="' + esc(t.id) + '">수정</button><button type="button" data-lv-ml-del="todo" data-id="' + esc(t.id) + '">삭제</button></div></li>';
      }).join("") + "</ul>" +
      (store.todos.length ? "" : emptyBox("할 일이 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="todo">할 일 추가</button>')) +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">체크리스트</h3></div>' +
      '<p class="lv-ml-note">템플릿을 가져와도 기존 데이터는 덮어쓰지 않습니다.</p>' +
      '<div class="lv-ml-quick__row">' + templates + '<button type="button" class="lv-ml-chip-btn" data-lv-ml-add="checklist">직접 만들기</button></div>' +
      '<ul class="lv-ml-manage-list" style="margin-top:1rem">' + store.checklists.map(function (c) {
        var doneN = (c.items || []).filter(function (i) { return i.done; }).length;
        var tot = (c.items || []).length || 1;
        return "<li><div><strong>" + esc(c.title) + "</strong><p>" + doneN + "/" + tot + " · " + Math.round(doneN / tot * 100) + "%</p>" +
          '<ul class="lv-ml-mini-check">' + (c.items || []).map(function (i) {
            return "<li><label><input type=\"checkbox\" data-lv-ml-check-item=\"" + esc(c.id) + "\" data-item=\"" + esc(i.id) + "\"" + (i.done ? " checked" : "") + " /> " + esc(i.text) + "</label></li>";
          }).join("") + "</ul></div>" +
          '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="checklist" data-id="' + esc(c.id) + '">수정</button><button type="button" data-lv-ml-del="checklist" data-id="' + esc(c.id) + '">삭제</button></div></li>';
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

  function viewGoals(store) {
    var t = todayStr();
    return '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">목표</h3></div>' +
      (store.goals.length ? '<div class="lv-ml-goal-grid">' + store.goals.map(function (g) {
        return '<article class="lv-ml-goal-card"><h4>' + esc(g.title) + "</h4>" +
          '<div class="lv-ml-progress"><span style="width:' + (g.progress || 0) + '%"></span></div>' +
          "<p>" + esc(g.progress || 0) + "% · " + esc(g.status) + "</p>" +
          '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="goal" data-id="' + esc(g.id) + '">수정</button><button type="button" data-lv-ml-del="goal" data-id="' + esc(g.id) + '">삭제</button></div></article>';
      }).join("") + "</div>" : emptyBox("목표가 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="goal">목표 만들기</button>')) +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">습관</h3></div>' +
      '<p class="lv-ml-note">하루 미실천이 전체 목표를 초기화하지 않습니다.</p>' +
      (store.habits.length ? '<ul class="lv-ml-manage-list">' + store.habits.map(function (h) {
        var on = !!(store.habitLogs[h.id] || {})[t];
        return "<li><label><input type=\"checkbox\" data-lv-ml-habit=\"" + esc(h.id) + "\"" + (on ? " checked" : "") + " /> <strong>" + esc(h.title) + "</strong></label>" +
          "<p>연속 " + streakFor(h.id, store.habitLogs) + "일 · " + esc(h.freq === "weekly" ? "매주" : "매일") + "</p>" +
          '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="habit" data-id="' + esc(h.id) + '">수정</button><button type="button" data-lv-ml-del="habit" data-id="' + esc(h.id) + '">삭제</button></div></li>';
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
    var list = collectedSaved();
    return '<p class="lv-ml-note">라이프 스테이지·오늘의 발견 등에서 저장한 항목을 모읍니다. 원본이 없으면 안내만 표시합니다.</p>' +
      (list.length
        ? '<ul class="lv-ml-manage-list">' + list.map(function (x) {
            return "<li><div><strong>" + esc(x.label) + "</strong><p>" + esc(x.source) + "</p></div>" +
              '<div class="lv-ml-row-acts"><a href="' + esc(x.href) + '">원본</a>' +
              '<button type="button" data-lv-ml-add-event-from-saved="' + esc(x.label) + '">일정에 추가</button></div></li>';
          }).join("") + "</ul>"
        : emptyBox("저장한 항목이 없습니다.", '<a class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" href="#today">오늘의 발견</a>'));
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
      "<h3>가족 공유는 아직 열려 있지 않습니다</h3>" +
      "<p>초대·권한·공유 캘린더는 인증과 백엔드 권한 체계가 갖춰진 뒤 제공합니다. 지금은 개인 일정만 이 기기에서 관리할 수 있습니다. 부모님 돌봄 전문 서비스는 Ongil로 연결합니다.</p>" +
      '<div class="lv-ml-actions"><a class="lv-ml-btn lv-ml-btn--dark" href="/ongil-start/#care">Ongil 돌봄</a>' +
      '<button type="button" class="lv-ml-btn lv-ml-btn--outline" data-lv-ml-goto="calendar">개인 일정 관리</button></div>' +
    "</div>";
  }

  function viewJournal(store) {
    return '<p class="lv-ml-note">기록은 기본 비공개이며 커뮤니티에 자동 게시되지 않습니다.</p>' +
      (store.journal.length
        ? '<ul class="lv-ml-manage-list">' + store.journal.map(function (j) {
            return "<li><div><strong>" + esc(j.title || "기록") + "</strong><p>" + esc([j.date, j.mood].filter(Boolean).join(" · ")) + "</p><p>" + esc((j.body || "").slice(0, 120)) + "</p></div>" +
              '<div class="lv-ml-row-acts"><button type="button" data-lv-ml-edit="journal" data-id="' + esc(j.id) + '">수정</button><button type="button" data-lv-ml-del="journal" data-id="' + esc(j.id) + '">삭제</button></div></li>';
          }).join("") + "</ul>"
        : emptyBox("기록이 없습니다.", '<button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-add="journal">기록 작성</button>'));
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
    var avgGoal = goals.length ? Math.round(goals.reduce(function (a, g) { return a + (g.progress || 0); }, 0) / goals.length) : null;
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
        '<div class="lv-ml-stat"><p>목표 평균 진행</p><strong>' + (avgGoal == null ? "—" : avgGoal + "%") + "</strong></div>" +
        '<div class="lv-ml-stat"><p>오늘 습관</p><strong>' + habitsDone + "/" + store.habits.length + "</strong></div>" +
        '<div class="lv-ml-stat"><p>이번 달 수입</p><strong>' + fmtMoney(income) + "</strong></div>" +
        '<div class="lv-ml-stat"><p>이번 달 지출</p><strong>' + fmtMoney(expense) + "</strong></div>" +
        '<div class="lv-ml-stat"><p>경험</p><strong>' + store.experiences.length + "</strong></div>" +
        '<div class="lv-ml-stat"><p>기록</p><strong>' + store.journal.length + "</strong></div>" +
      "</div>";
  }

  function viewSettings() {
    var stage = readJSON(KEY_STAGE, null);
    var interests = readJSON(KEY_ML_INTERESTS, []);
    if (!interests.length) interests = readJSON(KEY_LIFE_INTERESTS, []);
    var situations = readJSON(KEY_SITUATIONS, []);
    var stageMeta = (DATA.stages || {})[stage];
    return '<div class="lv-ml-settings">' +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">나의 라이프 스테이지</h3></div>' +
      "<p>" + esc(stageMeta ? stageMeta.age + " · " + stageMeta.name : "미설정") + "</p>" +
      '<div class="lv-ml-actions"><button type="button" class="lv-ml-btn lv-ml-btn--dark lv-ml-btn--sm" data-lv-ml-find>스테이지 변경</button>' +
      '<a class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" href="#life">라이프 스테이지 화면</a></div>' +
      '<p class="lv-ml-note">스테이지를 바꿔도 일정·목표·기록·저장 콘텐츠는 삭제되지 않습니다.</p>' +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">관심 분야</h3></div>' +
      '<div class="lv-ml-chips">' + (DATA.interestOptions || []).map(function (v) {
        return '<button type="button" data-lv-ml-set-interest="' + esc(v) + '"' + (interests.indexOf(v) >= 0 ? ' class="is-on"' : "") + ">" + esc(v) + "</button>";
      }).join("") + "</div>" +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">생활 상황</h3></div>' +
      '<div class="lv-ml-chips">' + (DATA.situations || []).map(function (v) {
        return '<button type="button" data-lv-ml-set-situation="' + esc(v) + '"' + (situations.indexOf(v) >= 0 ? ' class="is-on"' : "") + ">" + esc(v) + "</button>";
      }).join("") + "</div>" +
      '<div class="lv-ml-block-label"><h3 class="lv-ml-title lv-ml-title--md">데이터</h3></div>' +
      '<p class="lv-ml-note">브라우저 알림·푸시·가족 공유·계정 동기화는 아직 제공되지 않습니다.</p>' +
      '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-export>데이터 JSON 내보내기</button> ' +
      '<button type="button" class="lv-ml-btn lv-ml-btn--outline lv-ml-btn--sm" data-lv-ml-clear>내 생활 데이터 초기화</button>' +
    "</div>";
  }

  function refreshDashboard() {
    renderStats();
    renderTimeline();
    renderTodayTodos();
    renderActiveGoals();
    renderRecentSaved();
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

  function deleteItem(type, id) {
    if (!confirmDelete()) return;
    var store = loadStore();
    var key = {
      event: "events", todo: "todos", goal: "goals", habit: "habits",
      tx: "transactions", journal: "journal", experience: "experiences",
      checklist: "checklists", project: "projects", health: "health"
    }[type];
    if (!key) return;
    store[key] = (store[key] || []).filter(function (x) { return x.id !== id; });
    if (type === "habit" && store.habitLogs) delete store.habitLogs[id];
    saveStore(store);
    refreshAll();
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

  function bind() {
    document.addEventListener("click", function (e) {
      var goto = e.target.closest("[data-lv-ml-goto]");
      if (goto) {
        e.preventDefault();
        gotoView(goto.getAttribute("data-lv-ml-goto"));
        return;
      }
      var add = e.target.closest("[data-lv-ml-add]");
      if (add) {
        e.preventDefault();
        openForm(add.getAttribute("data-lv-ml-add"));
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
          document.documentElement.dataset.lvView = "life-now";
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
          } else {
            var base = parseDate(state.calSelected || todayStr()) || new Date();
            base.setDate(base.getDate() + step * (mode === "week" ? 7 : 1));
            state.calSelected = todayStr(base);
            state.calMonth = new Date(base.getFullYear(), base.getMonth(), 1);
          }
        }
        renderPanel("calendar");
        return;
      }
      var calMode = e.target.closest("[data-lv-ml-cal-mode]");
      if (calMode) {
        state.calMode = calMode.getAttribute("data-lv-ml-cal-mode") || "month";
        renderPanel("calendar");
        return;
      }
      var calDay = e.target.closest("[data-lv-ml-cal-day]");
      if (calDay) {
        state.calSelected = calDay.getAttribute("data-lv-ml-cal-day");
        var picked = parseDate(state.calSelected);
        if (picked) state.calMonth = new Date(picked.getFullYear(), picked.getMonth(), 1);
        renderPanel("calendar");
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
        }
        return;
      }
      var impP = e.target.closest("[data-lv-ml-import-project]");
      if (impP) {
        var pt = (DATA.projectTemplates || []).find(function (x) { return x.id === impP.getAttribute("data-lv-ml-import-project"); });
        if (pt) {
          var st = loadStore();
          st.projects.unshift({
            id: uid("project"), title: pt.title, purpose: "", start: todayStr(), due: "",
            steps: (pt.steps || []).map(function (text) { return { id: uid("ps"), text: text, done: false }; }),
            status: "진행 중", createdAt: Date.now(), updatedAt: Date.now()
          });
          saveStore(st);
          refreshAll();
        }
        return;
      }
      var addEv = e.target.closest("[data-lv-ml-add-event-from-saved]");
      if (addEv) {
        openForm("event", { title: addEv.getAttribute("data-lv-ml-add-event-from-saved"), date: todayStr(), category: "여가" });
        return;
      }
      var setInt = e.target.closest("[data-lv-ml-set-interest]");
      if (setInt) {
        var val = setInt.getAttribute("data-lv-ml-set-interest");
        var list = readJSON(KEY_ML_INTERESTS, []);
        if (!Array.isArray(list)) list = [];
        var i = list.indexOf(val);
        if (i >= 0) list.splice(i, 1); else list.push(val);
        writeJSON(KEY_ML_INTERESTS, list);
        writeJSON(KEY_LIFE_INTERESTS, list);
        renderPanel("settings");
        return;
      }
      var setSit = e.target.closest("[data-lv-ml-set-situation]");
      if (setSit) {
        var sv = setSit.getAttribute("data-lv-ml-set-situation");
        var sl = readJSON(KEY_SITUATIONS, []);
        if (!Array.isArray(sl)) sl = [];
        var j = sl.indexOf(sv);
        if (j >= 0) sl.splice(j, 1); else sl.push(sv);
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
        if (!confirmDelete("내 생활 로컬 데이터를 모두 삭제할까요?")) return;
        saveStore(emptyStore());
        refreshAll();
        return;
      }
    });

    document.addEventListener("change", function (e) {
      var t = e.target;
      if (t.matches("[data-lv-ml-toggle]")) {
        var type = t.getAttribute("data-lv-ml-toggle");
        var id = t.getAttribute("data-id");
        var store = loadStore();
        if (type === "todo") {
          store.todos.forEach(function (x) { if (x.id === id) x.done = !!t.checked; });
        } else if (type === "event") {
          store.events.forEach(function (x) { if (x.id === id) x.done = !!t.checked; });
        }
        saveStore(store);
        refreshAll();
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
      var budget = e.target.closest("[data-lv-ml-budget-form]");
      if (budget) {
        e.preventDefault();
        var store = loadStore();
        store.budgets.monthly = Number(new FormData(budget).get("monthly")) || 0;
        saveStore(store);
        renderPanel("money");
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
      if (e.key === "Escape") { closeForm(); closeAgeModal(); closeLogin(); }
    });
  }

  window.LivonMyLife = {
    onShow: function (hash) {
      initHero();
      refreshDashboard();
      if (!hash || hash === "life-now" || hash === "ml-home") {
        state.view = "home";
        setNav("home");
        window.scrollTo(0, 0);
        return;
      }
      if (hash.indexOf("ml-") === 0) {
        var view = hash.replace("ml-", "");
        if (view === "home" || view === "cta") {
          state.view = "home";
          setNav("home");
          setTimeout(function () { scrollToId(hash === "ml-cta" ? "ml-cta" : "ml-home"); }, 40);
          return;
        }
        var known = (DATA.modules || []).some(function (m) { return m.id === view; });
        if (known) gotoView(view);
        else setTimeout(function () { scrollToId(hash); }, 40);
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("#life-now")) return;
    initHero();
    initReveal();
    bind();
    refreshDashboard();
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "life-now") {
      window.LivonMyLife.onShow(hash || "life-now");
    }
  });
})();
