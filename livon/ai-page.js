(function () {
  var STORE_KEY = "livon.aiStore.v1";
  var KEY_ML = "livon.mlStore.v1";
  var KEY_SAVED = "livon.aiSaved";
  var API_BASE = "/api/livon";
  var CONNECTION_ERROR = "LIVON AI에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";

  var state = {
    threadId: "",
    sending: false,
    abort: null,
    panelOpen: false,
    sidebarOpen: false,
    draftPlan: null,
    apiBase: "",
    apiConfigured: null,
    stickBottom: true
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
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { alert("저장에 실패했습니다. 저장 공간을 확인해 주세요."); return false; }
    return true;
  }
  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
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
  function fmtDate(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    return (d.getMonth() + 1) + "." + d.getDate();
  }

  function emptyStore() {
    return {
      threads: [],
      settings: {
        stage: "",
        interests: "",
        region: "",
        goal: "",
        answerLength: "balanced",
        personalize: true,
        shareLifeData: false
      }
    };
  }
  function loadStore() {
    var s = readJSON(STORE_KEY, null);
    if (!s || typeof s !== "object") s = emptyStore();
    s.threads = Array.isArray(s.threads) ? s.threads : [];
    s.settings = Object.assign(emptyStore().settings, s.settings || {});
    return s;
  }
  function saveStore(s) { return writeJSON(STORE_KEY, s); }

  function currentThread() {
    var store = loadStore();
    return store.threads.find(function (t) { return t.id === state.threadId; }) || null;
  }
  function ensureThread() {
    var store = loadStore();
    var t = store.threads.find(function (x) { return x.id === state.threadId; });
    if (t) return t;
    t = {
      id: uid("th"),
      title: "새 대화",
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    store.threads.unshift(t);
    saveStore(store);
    state.threadId = t.id;
    return t;
  }

  function setStatus(text, kind) {
    var el = $("[data-lv-ai-status]");
    if (!el) return;
    el.textContent = text || "";
    el.className = "lv-ai-status" + (kind ? " is-" + kind : "");
  }

  function autoResize(ta) {
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(160, Math.max(44, ta.scrollHeight)) + "px";
  }

  function updateSendEnabled() {
    var ta = $("[data-lv-ai-chat-q]");
    var btn = $("[data-lv-ai-send]");
    var clear = $("[data-lv-ai-clear-input]");
    if (!ta || !btn) return;
    var has = !!String(ta.value || "").trim();
    btn.disabled = !has || state.sending;
    if (clear) clear.hidden = !has;
  }

  function renderMarkdownLite(text) {
    var raw = String(text || "");
    var parts = raw.split(/```(?:json)?\n?([\s\S]*?)```/i);
    var html = "";
    parts.forEach(function (part, i) {
      if (i % 2 === 1) {
        html += "<pre class=\"lv-ai-code\"><code>" + esc(part.trim()) + "</code></pre>";
        return;
      }
      var lines = part.split(/\n/);
      var buf = [];
      var inList = false;
      function flushList() {
        if (inList) { buf.push("</ul>"); inList = false; }
      }
      lines.forEach(function (line) {
        var t = line.trim();
        if (!t) { flushList(); return; }
        if (/^#{1,3}\s+/.test(t)) {
          flushList();
          buf.push("<h4>" + esc(t.replace(/^#{1,3}\s+/, "")) + "</h4>");
          return;
        }
        if (/^[-*•]\s+/.test(t)) {
          if (!inList) { buf.push("<ul>"); inList = true; }
          buf.push("<li>" + inlineFormat(t.replace(/^[-*•]\s+/, "")) + "</li>");
          return;
        }
        flushList();
        buf.push("<p>" + inlineFormat(t) + "</p>");
      });
      flushList();
      html += buf.join("");
    });
    return html || "<p></p>";
  }
  function inlineFormat(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\((#[^)]+|https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');
  }

  function extractPlan(text) {
    var m = String(text || "").match(/```json\s*([\s\S]*?)```/i);
    if (!m) return null;
    try {
      var data = JSON.parse(m[1]);
      if (data && data.plan) return data.plan;
      if (data && (data.todos || data.steps)) return data;
    } catch (e) {}
    return null;
  }

  function searchLocalLinks(q) {
    var ql = String(q || "").toLowerCase();
    var out = [];
    var today = (window.LivonTodayData && window.LivonTodayData.contents) || [];
    today.forEach(function (c) {
      var hay = [c.title, c.blurb, (c.tags || []).join(" "), c.category, c.region].join(" ").toLowerCase();
      if (ql && hay.indexOf(ql.split(/\s+/)[0]) < 0 && !ql.split(/\s+/).some(function (t) { return t.length > 1 && hay.indexOf(t) >= 0; })) return;
      out.push({ kind: "오늘의 발견", title: c.title, href: "#td-item-" + c.id, blurb: c.blurb || "" });
    });
    var explore = (window.LivonExploreData && window.LivonExploreData.items) || [];
    explore.forEach(function (c) {
      var hay = [c.title, c.blurb, c.provider, (c.tags || []).join(" "), c.subfield].join(" ").toLowerCase();
      if (ql && !ql.split(/\s+/).some(function (t) { return t.length > 1 && hay.indexOf(t) >= 0; })) return;
      out.push({ kind: "탐색", title: c.title, href: "#ex-item-" + c.id, blurb: c.blurb || "" });
    });
    try {
      var cm = readJSON("livon.cmStore.v1", null);
      if (cm && Array.isArray(cm.posts)) {
        cm.posts.filter(function (p) { return !p.deleted && !p.draft && p.visibility !== "private"; }).forEach(function (p) {
          var hay = [p.title, p.body, (p.tags || []).join(" ")].join(" ").toLowerCase();
          if (ql && !ql.split(/\s+/).some(function (t) { return t.length > 1 && hay.indexOf(t) >= 0; })) return;
          out.push({ kind: "커뮤니티", title: p.title, href: "#cm-post-" + p.id, blurb: String(p.body || "").slice(0, 80) });
        });
      }
    } catch (e) {}
    return out.slice(0, 6);
  }

  function renderThreads() {
    var host = $("[data-lv-ai-threads]");
    if (!host) return;
    var store = loadStore();
    var q = (($("[data-lv-ai-thread-q]") || {}).value || "").trim().toLowerCase();
    var list = store.threads.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; });
    if (q) {
      list = list.filter(function (t) {
        return (t.title || "").toLowerCase().indexOf(q) >= 0 ||
          (t.messages || []).some(function (m) { return String(m.content || "").toLowerCase().indexOf(q) >= 0; });
      });
    }
    if (!list.length) {
      host.innerHTML = "<p class=\"lv-ai-note\">아직 나눈 대화가 없어요. 새로운 이야기를 시작해 보세요.</p>";
      return;
    }
    host.innerHTML = list.map(function (t) {
      return "<div class=\"lv-ai-thread" + (t.id === state.threadId ? " is-on" : "") + "\" data-lv-ai-thread=\"" + esc(t.id) + "\">" +
        "<button type=\"button\" class=\"lv-ai-thread__main\" data-lv-ai-open-thread=\"" + esc(t.id) + "\">" +
          "<strong>" + esc(t.title || "새 대화") + "</strong>" +
          "<span>" + esc(fmtDate(t.updatedAt)) + "</span>" +
        "</button>" +
        "<div class=\"lv-ai-thread__acts\">" +
          "<button type=\"button\" data-lv-ai-rename=\"" + esc(t.id) + "\" aria-label=\"제목 변경\">✎</button>" +
          "<button type=\"button\" data-lv-ai-del-thread=\"" + esc(t.id) + "\" aria-label=\"삭제\">×</button>" +
        "</div></div>";
    }).join("");
  }

  function renderMessages() {
    var welcome = $("[data-lv-ai-welcome]");
    var msgs = $("[data-lv-ai-msgs]");
    var title = $("[data-lv-ai-title]");
    var t = currentThread();
    if (!msgs) return;
    if (!t || !(t.messages || []).length) {
      if (welcome) welcome.hidden = false;
      msgs.hidden = true;
      msgs.innerHTML = "";
      if (title) title.textContent = "새 대화";
      return;
    }
    if (welcome) welcome.hidden = true;
    msgs.hidden = false;
    if (title) title.textContent = t.title || "대화";
    msgs.innerHTML = t.messages.map(function (m, idx) {
      if (m.role === "user") {
        return "<article class=\"lv-ai-bubble lv-ai-bubble--user\" data-msg=\"" + idx + "\">" +
          "<div class=\"lv-ai-bubble__body\">" + esc(m.content).replace(/\n/g, "<br>") + "</div>" +
          "<div class=\"lv-ai-bubble__acts\"><button type=\"button\" data-lv-ai-copy=\"" + idx + "\">복사</button></div></article>";
      }
      if (m.role === "error") {
        return "<article class=\"lv-ai-bubble lv-ai-bubble--error\" data-msg=\"" + idx + "\">" +
          "<div class=\"lv-ai-bubble__body\"><p>" + esc(m.content) + "</p>" +
          "<button type=\"button\" class=\"lv-ai-btn lv-ai-btn--dark lv-ai-btn--sm\" data-lv-ai-retry>다시 시도</button></div></article>";
      }
      if (m.role === "system") {
        return "<article class=\"lv-ai-bubble lv-ai-bubble--sys\"><div class=\"lv-ai-bubble__body\">" + renderMarkdownLite(m.content) + "</div></article>";
      }
      return "<article class=\"lv-ai-bubble lv-ai-bubble--ai\" data-msg=\"" + idx + "\">" +
        "<div class=\"lv-ai-bubble__meta\"><span class=\"lv-ai-mark\">AI</span><span>LIVON AI</span></div>" +
        "<div class=\"lv-ai-bubble__body\">" + renderMarkdownLite(m.content) + "</div>" +
        (m.linksHtml || "") +
        "<div class=\"lv-ai-bubble__acts\">" +
          "<button type=\"button\" data-lv-ai-copy=\"" + idx + "\">복사</button>" +
          "<button type=\"button\" data-lv-ai-regen=\"" + idx + "\">다시 생성</button>" +
          "<button type=\"button\" data-lv-ai-feedback=\"up:" + idx + "\">도움됨</button>" +
          "<button type=\"button\" data-lv-ai-feedback=\"down:" + idx + "\">아쉬움</button>" +
        "</div></article>";
    }).join("");
    if (state.stickBottom) {
      var stream = $("[data-lv-ai-stream]");
      if (stream) stream.scrollTop = stream.scrollHeight;
    }
  }

  function openPanel(plan, links) {
    var panel = $("[data-lv-ai-panel]");
    var body = $("[data-lv-ai-panel-body]");
    var toggle = $("[data-lv-ai-panel-toggle]");
    var workspace = $("[data-lv-ai-workspace]");
    if (!panel || !body) return;
    state.panelOpen = true;
    panel.hidden = false;
    if (toggle) toggle.hidden = false;
    if (workspace) workspace.classList.add("has-panel");
    state.draftPlan = plan || null;
    var html = "";
    if (plan) {
      html += "<div class=\"lv-ai-plan-card\">" +
        "<p class=\"lv-ai-eyebrow\">계획 초안 · 승인 전</p>" +
        "<h3>" + esc(plan.title || "생활 계획") + "</h3>" +
        "<p>" + esc(plan.goal || "") + "</p>" +
        "<p class=\"lv-ai-note\">시작 " + esc(plan.startDate || "미정") + " · 목표 " + esc(plan.endDate || "미정") + "</p>" +
        ((plan.steps || []).length ? "<ol>" + plan.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" : "") +
        ((plan.todos || []).length
          ? "<ul class=\"lv-ai-check-list\">" + plan.todos.map(function (td, i) {
              var title = typeof td === "string" ? td : (td.title || "");
              return "<li><label><input type=\"checkbox\" data-lv-ai-todo-pick=\"" + i + "\" checked /> " + esc(title) + "</label></li>";
            }).join("") + "</ul>"
          : "") +
        ((plan.costItems || []).length ? "<p class=\"lv-ai-note\">예상 비용 항목: " + esc(plan.costItems.join(", ")) + " (금액 미확정)</p>" : "") +
        "<div class=\"lv-ai-actions\">" +
          "<button type=\"button\" class=\"lv-ai-btn lv-ai-btn--dark lv-ai-btn--sm\" data-lv-ai-save-plan>선택한 항목만 내 생활에 저장</button>" +
          "<a class=\"lv-ai-btn lv-ai-btn--ghost lv-ai-btn--sm\" href=\"#life-now\">내 생활 열기</a>" +
        "</div>" +
        "<p class=\"lv-ai-note\">저장 버튼을 누르기 전에는 내 생활 데이터가 변경되지 않습니다.</p>" +
      "</div>";
    }
    if (links && links.length) {
      html += "<div class=\"lv-ai-link-list\"><h4>관련 LIVON 콘텐츠</h4>" +
        links.map(function (l) {
          return "<a href=\"" + esc(l.href) + "\"><em>" + esc(l.kind) + "</em><strong>" + esc(l.title) + "</strong><span>" + esc(l.blurb) + "</span></a>";
        }).join("") + "</div>";
    }
    if (!html) html = "<p class=\"lv-ai-note\">표시할 초안이 없습니다.</p>";
    body.innerHTML = html;
  }
  function closePanel() {
    var panel = $("[data-lv-ai-panel]");
    var workspace = $("[data-lv-ai-workspace]");
    if (panel) panel.hidden = true;
    if (workspace) workspace.classList.remove("has-panel");
    state.panelOpen = false;
  }

  function savePlanToMyLife() {
    var plan = state.draftPlan;
    if (!plan) return;
    var picks = $$("[data-lv-ai-todo-pick]");
    var selected = [];
    if (picks.length) {
      picks.forEach(function (cb, i) {
        if (cb.checked && plan.todos && plan.todos[i]) {
          var td = plan.todos[i];
          selected.push(typeof td === "string" ? td : (td.title || ""));
        }
      });
    } else if (plan.todos) {
      selected = plan.todos.map(function (td) { return typeof td === "string" ? td : (td.title || ""); });
    }
    if (!selected.length && !(plan.steps || []).length) {
      alert("저장할 항목을 선택해 주세요.");
      return;
    }
    var ml = readJSON(KEY_ML, null);
    if (!ml || typeof ml !== "object") {
      ml = { events: [], todos: [], checklists: [], goals: [], habits: [], habitLogs: {}, transactions: [], budgets: { monthly: 0, categories: {} }, health: [], experiences: [], journal: [], projects: [], folders: [], settings: {}, savedCommunity: [] };
    }
    ml.todos = Array.isArray(ml.todos) ? ml.todos : [];
    ml.goals = Array.isArray(ml.goals) ? ml.goals : [];
    ml.checklists = Array.isArray(ml.checklists) ? ml.checklists : [];
    ml.projects = Array.isArray(ml.projects) ? ml.projects : [];

    var dup = selected.filter(function (title) {
      return ml.todos.some(function (t) { return !t.done && t.title === title; });
    });
    if (dup.length) {
      if (!confirm("비슷한 할 일이 이미 있습니다: " + dup.slice(0, 3).join(", ") + "\n그래도 저장할까요?")) return;
    }

    selected.forEach(function (title) {
      if (!title) return;
      ml.todos.unshift({
        id: uid("todo"),
        title: title,
        done: false,
        due: "",
        priority: "medium",
        note: "LIVON AI 초안 · " + (plan.title || ""),
        createdAt: Date.now()
      });
    });
    if (plan.title) {
      ml.goals.unshift({
        id: uid("goal"),
        title: plan.title,
        detail: plan.goal || "",
        progress: 0,
        status: "진행 중",
        createdAt: Date.now()
      });
      ml.projects.unshift({
        id: uid("proj"),
        title: plan.title,
        note: plan.memo || plan.goal || "",
        status: "진행 중",
        createdAt: Date.now()
      });
    }
    if ((plan.steps || []).length) {
      ml.checklists.unshift({
        id: uid("cl"),
        title: (plan.title || "체크리스트") + " 단계",
        items: plan.steps.map(function (s) { return { text: s, done: false }; }),
        createdAt: Date.now()
      });
    }
    if (!writeJSON(KEY_ML, ml)) {
      alert("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    var legacy = readJSON(KEY_SAVED, []);
    if (!Array.isArray(legacy)) legacy = [];
    legacy.unshift({ id: uid("ai"), label: plan.title || "AI 계획", at: Date.now() });
    writeJSON(KEY_SAVED, legacy.slice(0, 40));
    alert("선택한 항목을 내 생활에 저장했습니다.");
  }

  function detectApi() {
    return fetch("/api/health", { cache: "no-store", signal: AbortSignal.timeout(5000) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var ready = !!(j && j.status === "ok" && j.aiConfigured && j.protectionConfigured);
        state.apiConfigured = ready;
        if (!state.sending) setStatus(ready ? "연결 준비됨" : "연결 대기", ready ? "ok" : "warn");
        var note = $("[data-lv-ai-api-note]");
        if (note) note.textContent = ready
          ? "AI 답변을 요청할 수 있습니다. 대화는 이 브라우저에 저장되며, 최근 대화와 허용한 설정만 AI에 전달됩니다."
          : CONNECTION_ERROR;
      }).catch(function () {
        state.apiConfigured = false;
        if (!state.sending) setStatus("연결 대기", "warn");
        var note = $("[data-lv-ai-api-note]");
        if (note) note.textContent = CONNECTION_ERROR;
      });
  }

  function requestPayload(thread, q) {
    var recent = thread.messages.slice(0, -1).filter(function (m) {
      return m.role === "user" || m.role === "assistant";
    }).slice(-12);
    var size = 0, conversation = [];
    for (var i = recent.length - 1; i >= 0; i--) {
      size += recent[i].content.length;
      if (size > 12000) break;
      conversation.unshift({ role: recent[i].role, content: recent[i].content });
    }
    var settings = loadStore().settings;
    var context = { answerLength: settings.answerLength, personalize: settings.personalize === true };
    if (context.personalize) ["stage", "interests", "region", "goal"].forEach(function (k) { context[k] = settings[k] || ""; });
    return { message: q, conversation: conversation, context: context };
  }

  function chatRequest(payload, signal) {
    return fetch(API_BASE + "/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), signal: signal
    }).then(function (r) {
      return r.json().catch(function () { throw new Error(CONNECTION_ERROR); }).then(function (j) {
        if (!r.ok || !j.success) {
          var err = new Error(j.error || CONNECTION_ERROR);
          err.code = j.code;
          if (location.hostname === "localhost" || location.hostname === "127.0.0.1") console.warn("[LIVON AI]", j.code || "HTTP_ERROR", r.status);
          throw err;
        }
        return j;
      });
    });
  }

  function appendLocalLinks(userText, assistantText) {
    var links = searchLocalLinks(userText);
    if (!links.length) return { text: assistantText, linksHtml: "", links: [] };
    var linksHtml = "<div class=\"lv-ai-related\"><p class=\"lv-ai-eyebrow\">관련 실제 콘텐츠</p>" +
      links.map(function (l) {
        return "<a class=\"lv-ai-related__item\" href=\"" + esc(l.href) + "\"><em>" + esc(l.kind) + "</em><strong>" + esc(l.title) + "</strong></a>";
      }).join("") + "</div>";
    return { text: assistantText, linksHtml: linksHtml, links: links };
  }

  function sendMessage(text, opts) {
    opts = opts || {};
    var q = String(text || "").trim();
    if (!q || state.sending) return;
    if (q.length > 4000) { setStatus("메시지는 4,000자 이내로 입력해 주세요.", "warn"); return; }
    var thread = ensureThread();
    if (!thread.messages.length || thread.title === "새 대화") thread.title = q.slice(0, 28) + (q.length > 28 ? "…" : "");
    if (!opts.retry) thread.messages.push({ role: "user", content: q, at: Date.now() });
    else if (thread.messages.length && thread.messages[thread.messages.length - 1].role === "error") thread.messages.pop();
    var payload = opts.payload || requestPayload(thread, q);
    thread.updatedAt = Date.now();
    var store = loadStore();
    var idx = store.threads.findIndex(function (t) { return t.id === thread.id; });
    if (idx >= 0) store.threads[idx] = thread; else store.threads.unshift(thread);
    if (!saveStore(store)) return;
    var requestThreadId = thread.id;
    state.threadId = requestThreadId;
    state.sending = true;
    renderThreads(); renderMessages();
    var ta = $("[data-lv-ai-chat-q]");
    if (ta && !opts.keepInput) { ta.value = ""; autoResize(ta); }
    updateSendEnabled();
    var stop = $("[data-lv-ai-stop]");
    if (stop) stop.hidden = false;
    setStatus("전송 중…", "busy");
    var controller = new AbortController();
    state.abort = controller;
    var timedOut = false;
    var timer = setTimeout(function () { timedOut = true; controller.abort(); }, 35000);
    setStatus("답변 생성 중…", "busy");

    return chatRequest(payload, controller.signal).then(function (res) {
      var st = loadStore();
      var th = st.threads.find(function (t) { return t.id === requestThreadId; });
      if (!th) return;
      var enriched = appendLocalLinks(q, res.message);
      th.messages.push({ role: "assistant", content: enriched.text, linksHtml: enriched.linksHtml, at: Date.now() });
      th.updatedAt = Date.now(); saveStore(st);
      if (state.threadId === requestThreadId) {
        var plan = extractPlan(enriched.text);
        if (plan || enriched.links.length) openPanel(plan, enriched.links);
      }
      setStatus(res.truncated ? "답변 길이 제한에 도달했습니다. 이어서 질문해 주세요." : "완료", "ok");
    }).catch(function (err) {
      var msg = timedOut ? "답변 생성 시간이 초과되었습니다. 다시 시도해 주세요."
        : controller.signal.aborted ? "답변 생성을 중지했습니다. 다시 시도할 수 있습니다."
        : err instanceof TypeError ? "네트워크 연결을 확인하고 다시 시도해 주세요." : err.message || CONNECTION_ERROR;
      var st = loadStore();
      var th = st.threads.find(function (t) { return t.id === requestThreadId; });
      if (th) { th.messages.push({ role: "error", content: msg, request: payload, at: Date.now() }); th.updatedAt = Date.now(); saveStore(st); }
      setStatus(msg, "warn");
    }).finally(function () {
      clearTimeout(timer); state.sending = false; state.abort = null;
      if (stop) stop.hidden = true;
      updateSendEnabled(); renderMessages(); renderThreads();
    });
  }

  function fillPrompt(q) {
    var ta = $("[data-lv-ai-chat-q]");
    if (ta) {
      ta.value = q;
      autoResize(ta);
      updateSendEnabled();
      ta.focus();
    }
    scrollToId("ai-chat");
  }

  function newChat() {
    state.threadId = "";
    closePanel();
    renderThreads();
    renderMessages();
    fillPrompt("");
    setStatus("");
  }

  function loadSettingsForm() {
    var form = $("[data-lv-ai-settings]");
    if (!form) return;
    var s = loadStore().settings;
    form.stage.value = s.stage || "";
    form.interests.value = s.interests || "";
    form.region.value = s.region || "";
    form.goal.value = s.goal || "";
    form.answerLength.value = s.answerLength || "balanced";
    form.personalize.checked = !!s.personalize;
    form.shareLifeData.checked = !!s.shareLifeData;
  }

  function bindFilm() {
    var hero = $("#ai-hero");
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
    var nodes = $$("[data-lv-ai-reveal]");
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
  function bindNav() {
    var links = $$(".lv-ai-nav__track a");
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

  function setSidebar(open) {
    state.sidebarOpen = open;
    var side = $("[data-lv-ai-sidebar]");
    var back = $("[data-lv-ai-sidebar-backdrop]");
    if (side) side.classList.toggle("is-open", open);
    if (back) back.hidden = !open;
  }

  function bindEvents() {
    document.addEventListener("click", function (e) {
      var ask = e.target.closest("[data-lv-ai-ask]");
      if (ask) {
        e.preventDefault();
        var q = ask.getAttribute("data-lv-ai-ask") || "";
        scrollToId("ai-chat");
        location.hash = "ai-chat";
        fillPrompt(q);
        sendMessage(q);
        return;
      }
      if (e.target.closest("[data-lv-ai-new]")) { e.preventDefault(); newChat(); return; }
      if (e.target.closest("[data-lv-ai-sidebar-open]")) { e.preventDefault(); setSidebar(true); return; }
      if (e.target.closest("[data-lv-ai-sidebar-close], [data-lv-ai-sidebar-backdrop]")) { e.preventDefault(); setSidebar(false); return; }
      if (e.target.closest("[data-lv-ai-panel-close]")) { e.preventDefault(); closePanel(); return; }
      if (e.target.closest("[data-lv-ai-panel-toggle]")) {
        e.preventDefault();
        var panel = $("[data-lv-ai-panel]");
        if (panel) { panel.hidden = !panel.hidden; state.panelOpen = !panel.hidden; }
        return;
      }
      if (e.target.closest("[data-lv-ai-open-settings]")) { e.preventDefault(); scrollToId("ai-settings"); return; }
      if (e.target.closest("[data-lv-ai-clear-all]")) {
        e.preventDefault();
        if (!confirm("모든 대화를 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;
        var st = loadStore();
        st.threads = [];
        saveStore(st);
        newChat();
        return;
      }
      var openTh = e.target.closest("[data-lv-ai-open-thread]");
      if (openTh) {
        e.preventDefault();
        state.threadId = openTh.getAttribute("data-lv-ai-open-thread");
        setSidebar(false);
        renderThreads();
        renderMessages();
        return;
      }
      var rename = e.target.closest("[data-lv-ai-rename]");
      if (rename) {
        e.preventDefault();
        var id = rename.getAttribute("data-lv-ai-rename");
        var st2 = loadStore();
        var th = st2.threads.find(function (t) { return t.id === id; });
        if (!th) return;
        var next = prompt("대화 제목", th.title || "");
        if (next == null) return;
        th.title = String(next).trim().slice(0, 40) || th.title;
        th.updatedAt = Date.now();
        saveStore(st2);
        renderThreads();
        renderMessages();
        return;
      }
      var del = e.target.closest("[data-lv-ai-del-thread]");
      if (del) {
        e.preventDefault();
        if (!confirm("이 대화를 삭제할까요?")) return;
        var id2 = del.getAttribute("data-lv-ai-del-thread");
        var st3 = loadStore();
        st3.threads = st3.threads.filter(function (t) { return t.id !== id2; });
        saveStore(st3);
        if (state.threadId === id2) newChat();
        else { renderThreads(); renderMessages(); }
        return;
      }
      if (e.target.closest("[data-lv-ai-clear-input]")) {
        e.preventDefault();
        var ta = $("[data-lv-ai-chat-q]");
        if (ta) { ta.value = ""; autoResize(ta); updateSendEnabled(); }
        return;
      }
      if (e.target.closest("[data-lv-ai-stop]")) {
        e.preventDefault();
        if (state.abort) state.abort.abort();
        return;
      }
      if (e.target.closest("[data-lv-ai-retry]")) {
        e.preventDefault();
        if (state.sending) return;
        var thCur = currentThread();
        if (!thCur || !thCur.messages.length) return;
        var last = thCur.messages[thCur.messages.length - 1];
        if (last.role !== "error") return;
        var lastUser = thCur.messages.slice().reverse().find(function (m) { return m.role === "user"; });
        if (lastUser) sendMessage(lastUser.content, { retry: true, payload: last.request });
        return;
      }
      var copy = e.target.closest("[data-lv-ai-copy]");
      if (copy) {
        e.preventDefault();
        var thc = currentThread();
        var m = thc && thc.messages[Number(copy.getAttribute("data-lv-ai-copy"))];
        if (m && navigator.clipboard) navigator.clipboard.writeText(m.content);
        return;
      }
      var regen = e.target.closest("[data-lv-ai-regen]");
      if (regen) {
        e.preventDefault();
        if (state.sending) return;
        var thr = currentThread();
        if (!thr) return;
        var mi = Number(regen.getAttribute("data-lv-ai-regen"));
        // find preceding user message
        var uq = "";
        for (var j = mi - 1; j >= 0; j--) {
          if (thr.messages[j].role === "user") { uq = thr.messages[j].content; break; }
        }
        var st6 = loadStore();
        var th6 = st6.threads.find(function (t) { return t.id === state.threadId; });
        if (th6) {
          th6.messages = th6.messages.slice(0, mi);
          // also remove the user message we're about to resend
          if (th6.messages.length && th6.messages[th6.messages.length - 1].role === "user") th6.messages.pop();
          saveStore(st6);
        }
        if (uq) sendMessage(uq);
        return;
      }
      var fb = e.target.closest("[data-lv-ai-feedback]");
      if (fb) {
        e.preventDefault();
        fb.textContent = "기록됨";
        fb.disabled = true;
        return;
      }
      if (e.target.closest("[data-lv-ai-save-plan]")) {
        e.preventDefault();
        savePlanToMyLife();
        return;
      }
    });

    var form = $("[data-lv-ai-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ta = $("[data-lv-ai-chat-q]");
        sendMessage(ta ? ta.value : "");
      });
    }
    var ta = $("[data-lv-ai-chat-q]");
    if (ta) {
      ta.addEventListener("input", function () {
        autoResize(ta);
        updateSendEnabled();
      });
      ta.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
          e.preventDefault();
          if (!ta.value.trim() || state.sending) return;
          sendMessage(ta.value);
        }
      });
    }
    var tq = $("[data-lv-ai-thread-q]");
    if (tq) tq.addEventListener("input", renderThreads);

    var settings = $("[data-lv-ai-settings]");
    if (settings) {
      settings.addEventListener("submit", function (e) {
        e.preventDefault();
        var st = loadStore();
        st.settings = {
          stage: settings.stage.value,
          interests: settings.interests.value.trim(),
          region: settings.region.value.trim(),
          goal: settings.goal.value.trim(),
          answerLength: settings.answerLength.value,
          personalize: !!settings.personalize.checked,
          shareLifeData: !!settings.shareLifeData.checked
        };
        saveStore(st);
        alert("설정이 이 기기에 저장되었습니다.");
      });
    }

    var stream = $("[data-lv-ai-stream]");
    if (stream) {
      stream.addEventListener("scroll", function () {
        var nearBottom = stream.scrollHeight - stream.scrollTop - stream.clientHeight < 80;
        state.stickBottom = nearBottom;
      });
    }
  }

  function consumePendingPrompt() {
    try {
      var raw = sessionStorage.getItem("livon.aiPrompt");
      if (!raw) return;
      sessionStorage.removeItem("livon.aiPrompt");
      var data = JSON.parse(raw);
      if (data && data.q) setTimeout(function () {
        if (data.draftOnly) { fillPrompt(data.q); setStatus("내용을 확인한 뒤 전송해 주세요.", "ok"); }
        else sendMessage(data.q);
      }, 120);
    } catch (e) {}
  }

  function onShow(hash) {
    renderThreads();
    renderMessages();
    loadSettingsForm();
    detectApi();
    consumePendingPrompt();
    if (!hash || hash === "livon-ai" || hash === "ai-hero") {
      window.scrollTo(0, 0);
      return;
    }
    if (hash === "ai-chat" || hash.indexOf("ai-") === 0) setTimeout(function () { scrollToId(hash === "ai-start" ? "ai-chat" : hash); }, 40);
  }

  function startChat(q) {
    scrollToId("ai-chat");
    location.hash = "ai-chat";
    fillPrompt(q || "");
    if (q) sendMessage(q);
  }

  function init() {
    if (!$("#livon-ai")) return;
    bindFilm();
    bindReveal();
    bindNav();
    bindEvents();
    var store = loadStore();
    if (store.threads.length) state.threadId = store.threads[0].id;
    renderThreads();
    renderMessages();
    loadSettingsForm();
    updateSendEnabled();
    detectApi();
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "livon-ai") onShow(hash || "livon-ai");
  }

  window.LivonAI = { onShow: onShow, startChat: startChat, sendMessage: sendMessage };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
