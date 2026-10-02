/*
 * LIVON AI V1 — life assistant screen.
 *
 * Server: POST /api/livon/chat (server/livon/chat.mjs · OpenAI Responses API, key only on the server,
 * rate limit + timeout there). This file never holds a secret and never fakes a reply: if the server
 * is not configured the real error is shown.
 *
 * Request = the user's message + (1) the screen context the user brought and did not remove,
 * (2) a few real LIVON items found locally (LivonSearch), (3) recent history (≤12 messages / 12,000 chars).
 * Nothing from My Life / Community is attached automatically. Plans reach My Life only through
 * the preview → select → approve dialog (LivonMyLife.api, same duplicate rules as My Life).
 */
(function () {
  var STORE_KEY = "livon.aiStore.v1";
  /* API origin comes from livon/livon-api-config.js (same origin by default; a separate https API origin in production) */
  var API = window.LivonApi || { url: function (p) { return p; } };
  var API_BASE = API.url("/api/livon");
  var LIMITS = { message: 4000, history: 12, historyChars: 12000, refs: 5, render: 80, clientTimeout: 35000 };
  var SOURCE_LABEL = { "life-stage": "라이프 스테이지", today: "오늘의 발견", explore: "탐색", mylife: "내 생활", community: "커뮤니티" };
  var MENU_LINKS = ["#life", "#today", "#explore", "#community", "#life-now", "#ml-todos", "#ml-goals", "#ml-calendar", "#ml-saved"];
  var DRAFT_HEAD = /^\[(라이프 스테이지|오늘의 발견|탐색|내 생활|커뮤니티)\][^\n]*(\n(?!\n)[^\n]*)*\n\n/;

  var state = {
    threadId: "", sending: false, abort: null, userAborted: false, panelOpen: false, sidebarOpen: false,
    apiConfigured: null, stickBottom: true, pendingPage: null, notice: "", modal: null
  };
  var bound = false;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  /* stored value must keep the shape the caller expects (old schema / corrupted data → fallback, null entries dropped) */
  function fitShape(v, fb) { if (Array.isArray(fb)) return Array.isArray(v) ? v.filter(function (x) { return x != null; }) : fb; if (fb && typeof fb === "object") return v && typeof v === "object" && !Array.isArray(v) ? v : fb; return v; }
  function readJSON(key, fallback) {
    var UD = window.LivonUserData; if (UD) return UD.read(key, fallback);   /* repository → local adapter; AI threads stay DEVICE_LOCAL */
    try { var raw = localStorage.getItem(key); return fitShape(raw ? JSON.parse(raw) : fallback, fallback); } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    var UD = window.LivonUserData;
    if (UD) { if (UD.write(key, value)) return true; setStatus("이 기기의 저장 공간이 부족해 대화를 저장하지 못했습니다. 오래된 대화를 삭제해 주세요.", "warn"); return false; }
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { setStatus("이 기기의 저장 공간이 부족해 대화를 저장하지 못했습니다. 오래된 대화를 삭제해 주세요.", "warn"); return false; }
  }
  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }
  function reducedMotion() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function gnavOffset() {
    return (window.LivonStickyOffset ? window.LivonStickyOffset() : (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h"), 10) || 74) + 52) + 8;
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion() ? "auto" : "smooth" });
  }
  function fmtDate(ts) {
    if (!ts) return "";
    var d = new Date(ts), now = new Date();
    var hm = (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
    return d.toDateString() === now.toDateString() ? "오늘 " + hm : (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + hm;
  }
  function announce(msg) {
    var n = $("[data-lv-ai-live]");
    if (!n) return;
    n.textContent = "";
    setTimeout(function () { n.textContent = msg; }, 30);
  }

  /* ───────── Store (local-first; swap point for Newon+ sync) ───────── */
  function emptyStore() {
    return { threads: [], settings: { stage: "", interests: "", region: "", goal: "", answerLength: "balanced", personalize: true, shareLifeData: false } };
  }
  function loadStore() {
    var s = readJSON(STORE_KEY, null);
    if (!s || typeof s !== "object") s = emptyStore();
    s.threads = Array.isArray(s.threads) ? s.threads.filter(function (t) { return t && t.id; }) : [];
    s.threads.forEach(function (t) { if (!Array.isArray(t.messages)) t.messages = []; });
    s.settings = Object.assign(emptyStore().settings, s.settings || {});
    return s;
  }
  function saveStore(s) { return writeJSON(STORE_KEY, s); }
  var Threads = {
    get: function (id) { return loadStore().threads.find(function (t) { return t.id === id; }) || null; },
    put: function (thread) {
      var s = loadStore();
      var i = s.threads.findIndex(function (t) { return t.id === thread.id; });
      if (i >= 0) s.threads[i] = thread; else s.threads.unshift(thread);
      return saveStore(s);
    },
    remove: function (id) {
      var s = loadStore();
      s.threads = s.threads.filter(function (t) { return t.id !== id; });
      return saveStore(s);
    },
    clear: function () { var s = loadStore(); s.threads = []; return saveStore(s); },
    rename: function (id, title) {
      var s = loadStore();
      var t = s.threads.find(function (x) { return x.id === id; });
      if (!t) return false;
      t.title = String(title || "").replace(/\s+/g, " ").trim().slice(0, 40) || t.title;
      t.titleEdited = true;
      t.updatedAt = Date.now();
      return saveStore(s);
    }
  };
  function currentThread() { return state.threadId ? Threads.get(state.threadId) : null; }

  /* ───────── Helpers: draft header, deterministic title ───────── */
  function stripDraftHeader(q) { return String(q || "").replace(DRAFT_HEAD, ""); }
  /* "첫 독립 준비 어떻게 해야 해?" → "첫 독립 준비" (no extra API call) */
  function deriveTitle(q) {
    var t = stripDraftHeader(q).split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean)[0] || String(q || "").trim();
    t = t.replace(/[?？!！.。…~]+$/g, "").trim();
    var endings = [/\s*(어떻게|뭐부터|무엇부터|어디서부터|어디부터)\s*(해야|하면|할까|하나요|해|할지).*$/, /\s*(알려\s*줘|알려\s*주세요|정리해\s*줘|정리해\s*주세요|만들어\s*줘|만들어\s*주세요|추천해\s*줘|해\s*줘|해\s*주세요)$/,
      /\s*(하고\s*싶어|하고\s*싶어요|할까|할까요|인가요|일까|있을까|있나요|좋을까|좋을까요)$/];
    endings.forEach(function (re) { var n = t.replace(re, "").trim(); if (n.length >= 2) t = n; });
    t = t.replace(/(을|를|은|는|이|가)$/, "").trim() || t;
    return t.length > 24 ? t.slice(0, 24) + "…" : t || "새 대화";
  }

  /* ───────── LIVON retrieval (real items only, a handful) ───────── */
  var STOP = /^(뭐|뭘|무엇|무슨|어떻게|어떤|어디|어디서|언제|왜|좀|정말|너무|많이|그냥|이번|다음|지금|오늘|내일|나|내|저|제|우리|해|해야|하면|할까|해줘|알려|알려줘|정리|정리해|방법|시작|싶어|있어|없어|같은|하는|하고|해서|것|거|수|중|때|좀더|그리고|그런데|많은데|준비|준비해야|준비하려면|준비하면|해야해|할지|좋을지|좋을까|필요한|필요할까|위해|대해|관련|관리|일정|계획|단계|단계별|하세요|해요|합니다|상황|맞게|만들어|만들어줘|체크리스트|알아볼|만한|있을까|궁금해|질문|도와줘|추천|추천해|무엇부터|뭐부터|어디서부터)$/;
  function stemWord(w) { return w.replace(/(에서|으로|부터|까지|하고|하는|해서|이랑|랑|을|를|은|는|이|가|에|로|와|과|도|만|의)$/, ""); }
  function keywords(text) {
    var words = stripDraftHeader(text).replace(/[^\w가-힣\s]/g, " ").split(/\s+/).filter(Boolean);
    var out = [];
    words.forEach(function (w) {
      var k = stemWord(w);
      if (k.length < 2 || STOP.test(k) || out.indexOf(k) >= 0) return;
      out.push(k);
    });
    return out.slice(0, 6);
  }
  /* phrases of neighbouring words ("첫 독립", "부모님 병원") are stronger signals than single words */
  function phrases(text) {
    var words = stripDraftHeader(text).replace(/[^\w가-힣\s]/g, " ").split(/\s+/).filter(Boolean).map(stemWord);
    var out = [];
    for (var i = 0; i + 1 < words.length; i++) {
      var a = words[i], b = words[i + 1];
      if (!a || !b || (STOP.test(a) && STOP.test(b))) continue;
      if (a.length + b.length < 3) continue;
      var ph = a + " " + b;
      if (out.indexOf(ph) < 0) out.push(ph);
    }
    return out.slice(0, 4);
  }
  function retrieve(text, page) {
    var S = window.LivonSearch;
    if (!S || !S.search) return [];
    var queries = [];
    if (page && page.topicTitle) queries.push([page.topicTitle, 4]);
    phrases(text).forEach(function (ph) { queries.push([ph, 2]); });
    keywords(text).forEach(function (k) { queries.push([k, 1]); });
    var score = {}, byKey = {}, hits = {};
    queries.forEach(function (qw) {
      var r;
      try { r = S.search(qw[0], {}); } catch (e) { return; }
      r.items.slice(0, 8).forEach(function (x, i) {
        var it = x.item;
        /* experts only from real public data (title/role/region/source/href) — never profiles, never qualifications */
        if (!it || !it.href || (it.type === "expert" && !it.realData) || x.via) return;
        /* only links the chat server accepts as references (LIVON routes or https) — e.g. http:// institution pages are skipped */
        if (!/^(#|https:\/\/)/i.test(it.href)) return;
        byKey[it.key] = it;
        score[it.key] = (score[it.key] || 0) + qw[1] * (8 - i);
        hits[it.key] = (hits[it.key] || 0) + 1;
      });
    });
    var keys = Object.keys(score).map(function (k) { return [k, score[k] + (hits[k] > 1 ? 4 : 0)]; }).sort(function (a, b) { return b[1] - a[1]; });
    /* 직업훈련 과정 the user looked up on this page (고용24): kind/title/href only — never costs, rates or eligibility */
    var J = window.LivonData && window.LivonData.jobs, jobRefs = [];
    try { jobRefs = J && J.configured() ? J.references(keywords(text).concat(page && page.topicTitle ? [page.topicTitle] : []), 2) : []; } catch (e) { jobRefs = []; }
    if (!keys.length) return jobRefs.slice(0, LIMITS.refs);
    var top = keys[0][1];
    return keys.filter(function (x) { return x[1] >= top * 0.4; }).slice(0, LIMITS.refs).map(function (x) {
      var it = byKey[x[0]];
      return { kind: String(it.typeLabel || (S.typeLabel ? S.typeLabel(it.type) : "LIVON")).slice(0, 40), title: String(it.refTitle || it.title).slice(0, 120), href: it.href };
    }).slice(0, LIMITS.refs - jobRefs.length).concat(jobRefs);
  }
  function whenLifeReady(ms) {
    var R = window.LivonLifeHub && window.LivonLifeHub.repo;
    if (!R || R.status === "ready" || !R.load) return Promise.resolve();
    return Promise.race([R.load().catch(function () {}), new Promise(function (res) { setTimeout(res, ms); })]);
  }

  /* ───────── Safe rendering (escape first; only whitelisted markup is produced) ───────── */
  function safeHref(href, allowed) {
    href = String(href || "").replace(/&amp;/g, "&");
    if (/^https:\/\/[a-z0-9.-]+(\/[^\s"'<>]*)?$/i.test(href)) return { href: href, external: true };
    if (href.charAt(0) === "#" && (allowed.indexOf(href) >= 0 || MENU_LINKS.indexOf(href) >= 0)) return { href: href, external: false };
    return null;
  }
  function inlineFormat(s, allowed) {
    var out = esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, href) {
      var h = safeHref(href, allowed);
      if (!h) return label; /* unknown LIVON route or unsafe scheme → plain text, never a link */
      return '<a href="' + esc(h.href) + '"' + (h.external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + label + (h.external ? '<span class="visually-hidden"> (새 창)</span>' : "") + "</a>";
    });
  }
  function renderMarkdown(text, allowed) {
    allowed = allowed || [];
    var lines = String(text || "").split(/\n/);
    var buf = [], list = "", inCode = false, code = [];
    function close() { if (list) { buf.push("</" + list + ">"); list = ""; } }
    function open(tag, cls) { if (list !== tag) { close(); buf.push("<" + tag + (cls ? ' class="' + cls + '"' : "") + ">"); list = tag; } }
    lines.forEach(function (line) {
      if (/^\s*```/.test(line)) {
        if (inCode) { buf.push('<pre class="lv-ai-code"><code>' + esc(code.join("\n")) + "</code></pre>"); code = []; inCode = false; }
        else { close(); inCode = true; }
        return;
      }
      if (inCode) { code.push(line); return; }
      var t = line.trim();
      if (!t) { close(); return; }
      var m;
      if ((m = /^(#{1,4})\s+(.+)$/.exec(t))) { close(); buf.push('<h3 class="lv-ai-md-h">' + inlineFormat(m[2], allowed) + "</h3>"); return; }
      if ((m = /^[-*•]\s+\[( |x|X)\]\s+(.+)$/.exec(t))) { open("ul", "lv-ai-md-check"); buf.push('<li><span class="lv-ai-md-box" aria-hidden="true">' + (m[1] === " " ? "☐" : "☑") + "</span> " + inlineFormat(m[2], allowed) + "</li>"); return; }
      if ((m = /^[-*•]\s+(.+)$/.exec(t))) { open("ul"); buf.push("<li>" + inlineFormat(m[1], allowed) + "</li>"); return; }
      if ((m = /^\d+[.)]\s+(.+)$/.exec(t))) { open("ol"); buf.push("<li>" + inlineFormat(m[1], allowed) + "</li>"); return; }
      close();
      buf.push("<p>" + inlineFormat(t, allowed) + "</p>");
    });
    if (inCode) buf.push('<pre class="lv-ai-code"><code>' + esc(code.join("\n")) + "</code></pre>");
    close();
    return buf.join("") || "<p></p>";
  }

  /* ───────── Plan / checklist → selectable items (never saved without approval) ───────── */
  var PLAN_RE = /```json\s*([\s\S]*?)```/i;
  function extractPlan(text) {
    var m = String(text || "").match(PLAN_RE);
    if (!m) return null;
    try {
      var data = JSON.parse(m[1]);
      var plan = data && data.plan ? data.plan : data && (data.todos || data.steps) ? data : null;
      if (!plan || typeof plan !== "object") return null;
      return {
        title: typeof plan.title === "string" ? plan.title.slice(0, 80) : "",
        goal: typeof plan.goal === "string" ? plan.goal.slice(0, 200) : "",
        steps: Array.isArray(plan.steps) ? plan.steps.filter(function (x) { return typeof x === "string"; }).slice(0, 20) : [],
        todos: Array.isArray(plan.todos) ? plan.todos.map(function (x) { return typeof x === "string" ? x : x && typeof x.title === "string" ? x.title : ""; }).filter(Boolean).slice(0, 20) : []
      };
    } catch (e) { return null; }
  }
  function displayText(text) { return String(text || "").replace(PLAN_RE, "").trim(); }
  /* Only explicit checklist lines ("- [ ] …") or the structured plan become candidates — not every bullet. */
  function candidateItems(text) {
    var plan = extractPlan(text);
    var items = [];
    function add(x) { x = String(x || "").replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim().slice(0, 120); if (x && items.indexOf(x) < 0) items.push(x); }
    if (plan) { plan.todos.forEach(add); plan.steps.forEach(add); }
    displayText(text).split(/\n/).forEach(function (l) { var m = /^\s*[-*•]\s+\[( |x|X)\]\s+(.+)$/.exec(l); if (m) add(m[2]); });
    return { plan: plan, items: items.slice(0, 20) };
  }

  /* ───────── Context (what the user brought from another screen) ───────── */
  function pageContext(p) {
    if (!p || typeof p !== "object") return null;
    var out = {}, any = false;
    ["source", "lifeStage", "stageLabel", "topicId", "topicTitle", "category", "excerpt", "url"].forEach(function (k) {
      if (typeof p[k] === "string" && p[k].trim()) { out[k] = p[k].trim().slice(0, 200); any = true; }
    });
    if (out.source && !SOURCE_LABEL[out.source]) delete out.source;
    return any && Object.keys(out).length ? out : null;
  }
  function activeContext() {
    if (state.pendingPage) return state.pendingPage;
    var t = currentThread();
    return t && t.page ? t.page : null;
  }
  function contextLabel(p) {
    var parts = [p.stageLabel, p.category, p.topicTitle].filter(Boolean);
    return parts.join(" · ") || "이전 화면";
  }
  function renderContext() {
    var host = $("[data-lv-ai-context]");
    if (!host) return;
    var p = activeContext();
    if (!p) { host.hidden = true; host.innerHTML = ""; return; }
    host.hidden = false;
    host.innerHTML = '<span class="lv-ai-context__k">참고 중</span>' +
      '<span class="lv-ai-context__v">' + esc((SOURCE_LABEL[p.source] || "화면") + " · " + contextLabel(p)) + "</span>" +
      '<button type="button" class="lv-ai-context__x" data-lv-ai-context-remove aria-label="참고 맥락 제거: ' + esc(contextLabel(p)) + '">×</button>';
  }
  function removeContext() {
    state.pendingPage = null;
    var t = currentThread();
    if (t && t.page) { delete t.page; Threads.put(t); }
    var ta = $("[data-lv-ai-chat-q]");
    if (ta && DRAFT_HEAD.test(ta.value)) { ta.value = stripDraftHeader(ta.value); autoResize(ta); updateSendEnabled(); }
    renderContext();
    announce("참고 맥락을 제거했습니다. 다음 질문에는 보내지 않습니다.");
    if (ta) ta.focus();
  }

  /* ───────── Request ───────── */
  function requestPayload(thread, q, refs) {
    var prior = thread.messages.slice(0, -1).filter(function (m) { return m.role === "user" || m.role === "assistant"; }).slice(-LIMITS.history);
    var size = 0, conversation = [];
    for (var i = prior.length - 1; i >= 0; i--) {
      var c = String(prior[i].content || "");
      if (!c.trim()) continue;
      size += c.length;
      if (size > LIMITS.historyChars) break;
      conversation.unshift({ role: prior[i].role, content: c });
    }
    var settings = loadStore().settings;
    var context = { answerLength: settings.answerLength, personalize: settings.personalize === true };
    if (context.personalize) ["stage", "interests", "region", "goal"].forEach(function (k) { if (settings[k]) context[k] = String(settings[k]).slice(0, 300); });
    var page = pageContext(thread.page);
    if (page) context.page = page;
    if (refs && refs.length) context.refs = refs;
    return { message: q, conversation: conversation, context: context };
  }
  function errorFor(status, code, retryAfter, fallback) {
    if (code === "AI_NOT_CONFIGURED" || code === "AI_AUTH_ERROR") return { kind: "unconfigured", msg: "LIVON AI 연결이 아직 완료되지 않았습니다. 서버의 AI 설정이 끝나면 이용할 수 있습니다." };
    if (code === "PROTECTION_NOT_CONFIGURED" || code === "PROTECTION_UNAVAILABLE" || code === "INVALID_SERVER_CONFIG") return { kind: "unconfigured", msg: "LIVON AI 서버의 보호(요청 제한) 설정이 완료되지 않아 지금은 답변할 수 없습니다." };
    if (status === 429 || code === "RATE_LIMIT" || code === "UPSTREAM_RATE_LIMIT") return { kind: "rate", msg: "요청이 많습니다. " + (retryAfter ? retryAfter + "초 뒤에 " : "잠시 후 ") + "다시 시도해 주세요." };
    if (status === 504 || code === "TIMEOUT") return { kind: "timeout", msg: "답변 생성 시간이 초과되었습니다. 다시 시도해 주세요." };
    if (code === "INVALID_AI_RESPONSE") return { kind: "invalid", msg: "AI 응답을 해석하지 못했습니다. 다시 시도해 주세요." };
    if (status === 413 || code === "MESSAGE_TOO_LONG" || code === "HISTORY_TOO_LONG" || code === "INVALID_HISTORY" || code === "BODY_TOO_LARGE") return { kind: "input", msg: fallback || "메시지나 대화가 너무 깁니다. 새 대화를 시작해 주세요." };
    if (status === 400) return { kind: "input", msg: fallback || "요청을 처리할 수 없습니다. 입력 내용을 확인해 주세요." };
    if (status === 404 || status === 405) return { kind: "unavailable", msg: "LIVON AI 서버에 연결되어 있지 않습니다. (AI API가 이 주소에서 실행되지 않음)" };
    if (status >= 500) return { kind: "server", msg: "LIVON AI 서버에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." };
    return { kind: "server", msg: fallback || "LIVON AI에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해 주세요." };
  }
  function chatRequest(payload, signal) {
    return fetch(API_BASE + "/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), signal: signal
    }).then(function (r) {
      var type = r.headers && r.headers.get ? (r.headers.get("content-type") || "") : "application/json";
      if (type.indexOf("json") < 0) { var e0 = new Error("not json"); e0.info = errorFor(r.status === 200 ? 404 : r.status); throw e0; }
      return r.json().catch(function () { var e1 = new Error("bad json"); e1.info = errorFor(r.status, "INVALID_AI_RESPONSE"); throw e1; }).then(function (j) {
        if (!r.ok || !j || !j.success) {
          var e2 = new Error("api");
          e2.info = errorFor(r.status, j && j.code, j && j.retryAfter, j && j.error);
          throw e2;
        }
        if (typeof j.message !== "string" || !j.message.trim()) { var e3 = new Error("empty"); e3.info = errorFor(r.status, "INVALID_AI_RESPONSE"); throw e3; }
        return j;
      });
    });
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
    ta.style.height = Math.min(200, Math.max(44, ta.scrollHeight)) + "px";
  }
  function updateSendEnabled() {
    var ta = $("[data-lv-ai-chat-q]");
    var btn = $("[data-lv-ai-send]");
    var clear = $("[data-lv-ai-clear-input]");
    var count = $("[data-lv-ai-count]");
    if (!ta || !btn) return;
    var len = String(ta.value || "").length;
    var has = !!String(ta.value || "").trim();
    btn.disabled = !has || state.sending || len > LIMITS.message;
    if (clear) clear.hidden = !has;
    if (count) {
      count.hidden = len < LIMITS.message * 0.8;
      count.textContent = len.toLocaleString("ko-KR") + " / " + LIMITS.message.toLocaleString("ko-KR") + "자" + (len > LIMITS.message ? " · 너무 깁니다" : "");
      count.classList.toggle("is-over", len > LIMITS.message);
    }
  }

  function goThread(id, replace) {
    var h = id ? "#ai-chat/" + id : "#ai-chat";
    if (location.hash === h) return;
    if (replace) history.replaceState(history.state, "", h); else location.hash = h.slice(1);
  }

  function sendMessage(text, opts) {
    opts = opts || {};
    var q = String(text || "").trim();
    if (!q || state.sending) return Promise.resolve(false);
    if (q.length > LIMITS.message) { setStatus("메시지는 4,000자 이내로 입력해 주세요.", "warn"); return Promise.resolve(false); }
    var thread = currentThread();
    if (!thread) {
      thread = { id: uid("th"), title: "새 대화", createdAt: Date.now(), updatedAt: Date.now(), messages: [] };
      state.threadId = thread.id;
    }
    if (state.pendingPage) { thread.page = state.pendingPage; state.pendingPage = null; }
    if (!thread.titleEdited && (!thread.messages.length || thread.title === "새 대화")) thread.title = deriveTitle(q);
    if (opts.retry) { while (thread.messages.length && thread.messages[thread.messages.length - 1].role === "error") thread.messages.pop(); }
    else thread.messages.push({ role: "user", content: q, at: Date.now() });
    thread.updatedAt = Date.now();
    if (!Threads.put(thread)) return Promise.resolve(false);
    goThread(thread.id, true);
    var requestThreadId = thread.id;
    state.sending = true;
    state.userAborted = false;
    var ta = $("[data-lv-ai-chat-q]");
    if (ta && !opts.retry) { ta.value = ""; autoResize(ta); }
    renderThreads(); renderMessages(); renderContext(); updateSendEnabled();
    keepComposerVisible();
    var stop = $("[data-lv-ai-stop]");
    if (stop) stop.hidden = false;
    setStatus("답변 생성 중…", "busy");
    announce("질문을 보냈습니다. 답변을 기다리는 중입니다.");
    var controller = new AbortController();
    state.abort = controller;
    var timedOut = false;
    var timer = setTimeout(function () { timedOut = true; controller.abort(); }, LIMITS.clientTimeout);
    var refs = [];

    return whenLifeReady(1500).then(function () {
      if (controller.signal.aborted) throw Object.assign(new Error("aborted"), { name: "AbortError" });
      var th0 = Threads.get(requestThreadId) || thread;
      refs = retrieve(q, th0.page);
      return chatRequest(requestPayload(th0, q, refs), controller.signal);
    }).then(function (res) {
      if (controller.signal.aborted) return; /* a stopped request never adds a late reply */
      var th = Threads.get(requestThreadId);
      if (!th) return;
      var c = candidateItems(res.message);
      th.messages.push({ role: "assistant", content: res.message, at: Date.now(), refs: refs, truncated: !!res.truncated });
      th.updatedAt = Date.now();
      Threads.put(th);
      /* the side panel is opened automatically only where it sits beside the chat (it overlays on small screens) */
      if (state.threadId === requestThreadId && (c.items.length || refs.length)) {
        if (window.innerWidth > 980) openPanel(th.messages.length - 1);
        else { state.panelMsg = th.messages.length - 1; var tg = $("[data-lv-ai-panel-toggle]"); if (tg) tg.hidden = false; }
      }
      setStatus(res.truncated ? "답변이 길이 제한에서 끊겼습니다. 이어서 질문해 주세요." : "완료", "ok");
      announce("LIVON AI 답변이 도착했습니다." + (c.items.length ? " 내 생활에 추가할 수 있는 항목 " + c.items.length + "개가 있습니다." : ""));
    }).catch(function (err) {
      var info = timedOut ? errorFor(504, "TIMEOUT")
        : state.userAborted ? { kind: "cancelled", msg: "답변 생성을 중지했습니다. 필요하면 다시 시도할 수 있습니다." }
        : err && err.info ? err.info
        : typeof navigator !== "undefined" && navigator.onLine === false ? { kind: "offline", msg: "인터넷에 연결되어 있지 않습니다. 연결을 확인한 뒤 다시 시도해 주세요." }
        : { kind: "network", msg: "네트워크 연결을 확인하고 다시 시도해 주세요." };
      var th = Threads.get(requestThreadId);
      if (th) { th.messages.push({ role: "error", content: info.msg, kind: info.kind, at: Date.now() }); th.updatedAt = Date.now(); Threads.put(th); }
      setStatus(info.kind === "cancelled" ? "중지됨" : "오류", "warn");
      announce(info.msg);
      if (info.kind === "unconfigured") showApiNote(info.msg, "warn");
    }).then(function () {
      clearTimeout(timer); state.sending = false; state.abort = null;
      if (stop) stop.hidden = true;
      updateSendEnabled(); renderMessages(); renderThreads(); renderContext();
      keepComposerVisible();
      var last = $("[data-lv-ai-msgs] .lv-ai-bubble:last-child");
      if (last && last.classList.contains("lv-ai-bubble--error")) { var b = last.querySelector("[data-lv-ai-retry]"); if (b) b.focus({ preventScroll: true }); }
      return true;
    });
  }

  /* ───────── Rendering ───────── */
  function renderThreads() {
    var host = $("[data-lv-ai-threads]");
    if (!host) return;
    var store = loadStore();
    var q = (($("[data-lv-ai-thread-q]") || {}).value || "").trim().toLowerCase();
    var list = store.threads.slice().sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
    if (q) list = list.filter(function (t) { return (t.title || "").toLowerCase().indexOf(q) >= 0 || (t.messages || []).some(function (m) { return String(m.content || "").toLowerCase().indexOf(q) >= 0; }); });
    if (!list.length) {
      host.innerHTML = '<p class="lv-ai-note">' + (q ? "검색 결과가 없습니다." : "아직 대화가 없습니다.") + "</p>";
      return;
    }
    host.innerHTML = '<ul class="lv-ai-thread-ul">' + list.map(function (t) {
      var on = t.id === state.threadId;
      return '<li class="lv-ai-thread' + (on ? " is-on" : "") + '">' +
        '<a class="lv-ai-thread__main" href="#ai-chat/' + esc(t.id) + '"' + (on ? ' aria-current="page"' : "") + ">" +
          "<strong>" + esc(t.title || "새 대화") + "</strong><span>" + esc(fmtDate(t.updatedAt)) + "</span></a>" +
        '<div class="lv-ai-thread__acts">' +
          '<button type="button" data-lv-ai-rename="' + esc(t.id) + '" aria-label="' + esc(t.title || "대화") + ' 제목 변경">✎</button>' +
          '<button type="button" data-lv-ai-del-thread="' + esc(t.id) + '" aria-label="' + esc(t.title || "대화") + ' 삭제">×</button>' +
        "</div></li>";
    }).join("") + "</ul>";
  }

  function refsHtml(refs) {
    if (!refs || !refs.length) return "";
    return '<div class="lv-ai-related"><p class="lv-ai-eyebrow">참고한 LIVON 항목</p>' + refs.map(function (l) {
      var h = safeHref(l.href, [l.href]);
      if (!h) return "";
      return '<a class="lv-ai-related__item" href="' + esc(h.href) + '"' + (h.external ? ' target="_blank" rel="noopener noreferrer"' : "") + "><em>" + esc(l.kind) + "</em><strong>" + esc(l.title) + "</strong>" + (h.external ? '<span class="visually-hidden"> (새 창)</span>' : "") + "</a>";
    }).join("") + "</div>";
  }
  function renderMessages() {
    var welcome = $("[data-lv-ai-welcome]");
    var msgs = $("[data-lv-ai-msgs]");
    var title = $("[data-lv-ai-title]");
    var t = currentThread();
    if (!msgs) return;
    var notice = state.notice ? '<p class="lv-ai-note lv-ai-notice" role="status">' + esc(state.notice) + "</p>" : "";
    if (!t || !(t.messages || []).length) {
      if (welcome) welcome.hidden = false;
      msgs.hidden = !notice;
      msgs.innerHTML = notice;
      if (title) title.textContent = t ? t.title || "새 대화" : "새 대화";
      return;
    }
    if (welcome) welcome.hidden = true;
    msgs.hidden = false;
    if (title) title.textContent = t.title || "대화";
    var start = Math.max(0, t.messages.length - LIMITS.render);
    var lastIdx = t.messages.length - 1;
    msgs.innerHTML = (start ? '<p class="lv-ai-note">이전 메시지 ' + start + "개는 표시하지 않았습니다. 대화 기록에는 그대로 저장되어 있습니다.</p>" : "") +
      t.messages.slice(start).map(function (m, k) {
        var idx = start + k;
        if (m.role === "user") {
          return '<article class="lv-ai-bubble lv-ai-bubble--user" aria-label="내 메시지">' +
            '<div class="lv-ai-bubble__body">' + esc(m.content).replace(/\n/g, "<br>") + "</div>" +
            '<div class="lv-ai-bubble__acts"><button type="button" data-lv-ai-copy="' + idx + '">복사</button></div></article>';
        }
        if (m.role === "error") {
          var isLast = idx === lastIdx;
          return '<article class="lv-ai-bubble lv-ai-bubble--error"' + (isLast ? ' role="alert"' : "") + ">" +
            '<div class="lv-ai-bubble__body"><p>' + esc(m.content) + "</p>" +
            (isLast && m.kind !== "input" ? '<button type="button" class="lv-ai-btn lv-ai-btn--dark lv-ai-btn--sm" data-lv-ai-retry>다시 시도</button>' : "") + "</div></article>";
        }
        if (m.role !== "assistant") return "";
        var allowed = (m.refs || []).map(function (r) { return r.href; });
        var c = candidateItems(m.content);
        return '<article class="lv-ai-bubble lv-ai-bubble--ai" aria-label="LIVON AI 답변">' +
          '<div class="lv-ai-bubble__meta"><span class="lv-ai-mark" aria-hidden="true">AI</span><span>LIVON AI</span></div>' +
          '<div class="lv-ai-bubble__body">' + renderMarkdown(displayText(m.content), allowed) + "</div>" +
          (m.truncated ? '<p class="lv-ai-note">답변이 길이 제한에서 끊겼습니다.</p>' : "") +
          refsHtml(m.refs) +
          '<div class="lv-ai-bubble__acts">' +
            (c.items.length ? '<button type="button" class="is-primary" data-lv-ai-add="' + idx + '">내 생활에 추가 (' + c.items.length + ")</button>" : "") +
            '<button type="button" data-lv-ai-copy="' + idx + '">복사</button>' +
            (idx === lastIdx ? '<button type="button" data-lv-ai-regen="' + idx + '">다시 생성</button>' : "") +
            (m.refs && m.refs.length ? '<a href="#ex-results?q=' + encodeURIComponent(keywords(lastUserBefore(t, idx))[0] || "") + '">탐색에서 더 찾기</a>' : "") +
          "</div></article>";
      }).join("") + (notice || "");
    if (state.stickBottom) {
      var stream = $("[data-lv-ai-stream]");
      if (stream) stream.scrollTop = stream.scrollHeight;
    }
  }
  /* When the welcome block collapses (first message) the page gets shorter; keep the composer on screen. */
  function keepComposerVisible() {
    var comp = $("[data-lv-ai-composer]");
    if (!comp || document.documentElement.dataset.lvView !== "livon-ai") return;
    var r = comp.getBoundingClientRect();
    if (r.bottom > window.innerHeight || r.top < 0) comp.scrollIntoView({ block: "end", behavior: reducedMotion() ? "auto" : "smooth" });
  }
  function lastUserBefore(t, idx) {
    for (var j = idx - 1; j >= 0; j--) if (t.messages[j].role === "user") return t.messages[j].content;
    return "";
  }

  function openPanel(msgIdx) {
    state.panelMsg = msgIdx;
    var panel = $("[data-lv-ai-panel]");
    var body = $("[data-lv-ai-panel-body]");
    var toggle = $("[data-lv-ai-panel-toggle]");
    var workspace = $("[data-lv-ai-workspace]");
    var t = currentThread();
    var m = t && t.messages[msgIdx];
    if (!panel || !body || !m) return;
    var c = candidateItems(m.content);
    state.panelOpen = true;
    panel.hidden = false;
    if (toggle) toggle.hidden = false;
    if (workspace) workspace.classList.add("has-panel");
    var html = "";
    if (c.items.length) {
      html += '<div class="lv-ai-plan-card">' +
        '<p class="lv-ai-eyebrow">계획 초안 · 저장 전</p>' +
        "<h3>" + esc((c.plan && c.plan.title) || "체크리스트 초안") + "</h3>" +
        (c.plan && c.plan.goal ? "<p>" + esc(c.plan.goal) + "</p>" : "") +
        '<ul class="lv-ai-check-list">' + c.items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
        '<div class="lv-ai-actions"><button type="button" class="lv-ai-btn lv-ai-btn--dark lv-ai-btn--sm" data-lv-ai-add="' + msgIdx + '">내 생활에 추가</button>' +
        '<a class="lv-ai-btn lv-ai-btn--ghost lv-ai-btn--sm" href="#ml-todos">내 생활 열기</a></div>' +
        '<p class="lv-ai-note">추가 전 미리보기에서 항목을 고르고 승인해야 내 생활에 저장됩니다.</p></div>';
    }
    if (m.refs && m.refs.length) html += refsHtml(m.refs).replace("lv-ai-related", "lv-ai-related lv-ai-related--panel");
    body.innerHTML = html || '<p class="lv-ai-note">표시할 초안이 없습니다.</p>';
  }
  function closePanel() {
    var panel = $("[data-lv-ai-panel]");
    var workspace = $("[data-lv-ai-workspace]");
    if (panel) panel.hidden = true;
    if (workspace) workspace.classList.remove("has-panel");
    state.panelOpen = false;
  }

  /* ───────── LIVON modals (no alert/confirm/prompt) ───────── */
  function openModal(html, onClose) {
    closeModal(false);
    var root = $("#livon-ai") || document.body;
    var m = document.createElement("div");
    m.className = "lv-ai-modal";
    m.innerHTML = '<div class="lv-ai-modal__backdrop" data-lv-ai-modal-close aria-hidden="true"></div>' +
      '<div class="lv-ai-modal__panel" role="dialog" aria-modal="true" aria-labelledby="lv-ai-modal-title">' + html + "</div>";
    state.modal = { el: m, opener: document.activeElement, onClose: onClose };
    root.appendChild(m);
    document.body.style.overflow = "hidden";
    var f = m.querySelector("[data-lv-ai-autofocus]") || m.querySelector("button, input");
    if (f) f.focus();
    return m;
  }
  function closeModal(result) {
    if (!state.modal) return;
    var d = state.modal;
    state.modal = null;
    if (d.el.parentNode) d.el.parentNode.removeChild(d.el);
    document.body.style.overflow = "";
    if (d.opener && document.contains(d.opener)) d.opener.focus();
    else { var h = $("[data-lv-ai-title]"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } }
    if (d.onClose) d.onClose(result);
  }
  function confirmDialog(o) {
    return new Promise(function (resolve) {
      var m = openModal('<h2 id="lv-ai-modal-title">' + esc(o.title) + '</h2><p id="lv-ai-modal-desc">' + esc(o.body) + "</p>" +
        '<div class="lv-ai-modal__acts"><button type="button" class="lv-ai-btn lv-ai-btn--ghost lv-ai-btn--sm" data-lv-ai-modal-close data-lv-ai-autofocus>취소</button>' +
        '<button type="button" class="lv-ai-btn lv-ai-btn--dark lv-ai-btn--sm' + (o.danger ? " lv-ai-btn--danger" : "") + '" data-lv-ai-modal-ok>' + esc(o.ok || "확인") + "</button></div>", resolve);
      var panel = m.querySelector(".lv-ai-modal__panel");
      panel.setAttribute("role", "alertdialog");
      panel.setAttribute("aria-describedby", "lv-ai-modal-desc");
    });
  }
  function trapFocus(e) {
    if (!state.modal) return;
    var panel = state.modal.el.querySelector(".lv-ai-modal__panel");
    var f = $$("button:not([disabled]), a[href], input:not([disabled]), select, textarea", panel).filter(function (x) { return x.offsetParent !== null || x.getClientRects().length; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* AI → My Life: preview → select/edit → approve. Duplicates are shown and never created. */
  function myLifeApi() { return window.LivonMyLife && window.LivonMyLife.api; }
  function openAddPreview(msgIdx) {
    var t = currentThread();
    var m = t && t.messages[msgIdx];
    if (!m) return;
    var c = candidateItems(m.content);
    var api = myLifeApi();
    if (!c.items.length) return;
    if (!api) { setStatus("내 생활을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.", "warn"); return; }
    var planTitle = c.plan && c.plan.title;
    openModal('<h2 id="lv-ai-modal-title">내 생활에 추가할까요?</h2>' +
      '<p class="lv-ai-modal__lead">추가할 항목을 고르고 필요하면 문구를 고친 뒤 승인해 주세요. 승인 전에는 아무것도 저장되지 않습니다.</p>' +
      '<form data-lv-ai-add-form data-msg="' + msgIdx + '"><fieldset class="lv-ai-fieldset"><legend>할 일 (' + c.items.length + ")</legend>" +
        c.items.map(function (x, i) {
          var dup = api.findDuplicateTodo(x);
          return '<div class="lv-ai-pick' + (dup ? " is-dup" : "") + '">' +
            '<label class="lv-ai-pick__box"><input type="checkbox" name="pick" value="' + i + '"' + (dup ? " disabled" : " checked") + (i === 0 ? " data-lv-ai-autofocus" : "") + ' /><span class="visually-hidden">' + esc(x) + " 추가</span></label>" +
            '<input type="text" name="title-' + i + '" value="' + esc(x) + '" maxlength="120" aria-label="할 일 문구 ' + (i + 1) + '"' + (dup ? " disabled" : "") + " />" +
            (dup ? '<span class="lv-ai-pick__dup">이미 내 생활에 있어 추가하지 않습니다</span>' : "") + "</div>";
        }).join("") + "</fieldset>" +
        (planTitle ? '<label class="lv-ai-check"><input type="checkbox" name="goal" /> ‘' + esc(planTitle) + "’ 목표도 만들고 할 일을 연결하기</label>" : "") +
        '<p class="lv-ai-form__err" data-lv-ai-add-err role="alert"></p>' +
        '<div class="lv-ai-modal__acts"><button type="button" class="lv-ai-btn lv-ai-btn--ghost lv-ai-btn--sm" data-lv-ai-modal-close>취소</button>' +
        '<button type="submit" class="lv-ai-btn lv-ai-btn--dark lv-ai-btn--sm">승인하고 추가</button></div></form>');
  }
  function approveAdd(form) {
    var api = myLifeApi();
    var t = currentThread();
    var idx = Number(form.getAttribute("data-msg"));
    var m = t && t.messages[idx];
    if (!api || !m) return;
    var c = candidateItems(m.content);
    var picks = $$('input[name="pick"]:checked', form).map(function (x) { return Number(x.value); });
    var err = form.querySelector("[data-lv-ai-add-err]");
    if (!picks.length) { if (err) err.textContent = "추가할 항목을 하나 이상 선택해 주세요."; return; }
    var titles = picks.map(function (i) { var inp = form.querySelector('[name="title-' + i + '"]'); return String(inp ? inp.value : c.items[i]).trim(); });
    if (titles.some(function (x) { return !x; })) { if (err) err.textContent = "빈 항목이 있습니다. 문구를 입력하거나 선택을 해제해 주세요."; return; }
    var goalId = "";
    var wantGoal = form.querySelector('input[name="goal"]');
    if (wantGoal && wantGoal.checked && c.plan && c.plan.title) {
      var g = api.saveGoal({ title: c.plan.title, note: c.plan.goal || "", status: "진행 중" });
      if (g.status === "ok") goalId = g.item.id;
    }
    var added = 0, dups = 0;
    titles.forEach(function (x) {
      var r = api.saveTodo({ title: x, due: "", priority: "보통", category: "일상", note: "LIVON AI 대화 · " + (t.title || ""),
        source: "livon-ai", sourceHref: "#ai-chat/" + t.id, sourceId: t.id, goalId: goalId });
      if (r.status === "ok") added++;
      else if (r.status === "duplicate") dups++;
    });
    closeModal(true);
    var msg = added ? "할 일 " + added + "개를 내 생활에 추가했습니다." : "새로 추가된 할 일이 없습니다.";
    if (dups) msg += " 이미 있는 " + dups + "개는 그대로 두었습니다.";
    if (goalId) msg += " 목표도 만들었습니다.";
    setStatus(msg, "ok");
    announce(msg);
    showApiNote(msg + " 내 생활 › 할 일에서 확인할 수 있습니다.", "ok", '<a href="#ml-todos?source=livon-ai">내 생활에서 보기</a>');
  }

  /* contextual help: "is LIVON AI available now?" next to every connection warning */
  function helpLink() { return window.LivonHelp && typeof window.LivonHelp.link === "function" ? window.LivonHelp.link("ai-status", "LIVON AI는 지금 사용할 수 있나요?") : ""; }
  function showApiNote(text, kind, extraHtml) {
    if (kind === "warn" && !extraHtml) extraHtml = helpLink();
    var note = $("[data-lv-ai-api-note]");
    if (!note) return;
    note.hidden = !text;
    note.className = "lv-ai-api-note" + (kind ? " is-" + kind : "");
    note.innerHTML = esc(text || "") + (extraHtml ? " " + extraHtml : "");
  }
  function detectApi() {
    return fetch(API.url("/api/health"), { cache: "no-store", signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined })
      .then(function (r) { return r.ok && (r.headers.get("content-type") || "").indexOf("json") >= 0 ? r.json() : null; })
      .then(function (j) {
        if (!j) { state.apiConfigured = false; showApiNote("LIVON AI 서버 상태를 확인할 수 없습니다. AI API가 이 주소에서 실행되지 않으면 답변을 받을 수 없습니다.", "warn"); if (!state.sending) setStatus("연결 확인 불가", "warn"); return; }
        var ready = !!(j.status === "ok" && j.aiConfigured && j.protectionConfigured);
        state.apiConfigured = ready;
        if (!state.sending) setStatus(ready ? "연결됨" : "연결 미완료", ready ? "ok" : "warn");
        showApiNote(ready ? "" : !j.aiConfigured ? "LIVON AI 연결이 아직 완료되지 않았습니다. 서버의 AI 설정이 끝나면 답변을 받을 수 있습니다." : "LIVON AI 서버의 보호(요청 제한) 설정이 완료되지 않았습니다.", ready ? "" : "warn");
      }).catch(function () {
        state.apiConfigured = false;
        if (!state.sending) setStatus("연결 확인 불가", "warn");
        showApiNote("LIVON AI 서버 상태를 확인할 수 없습니다. 네트워크 또는 서버 연결을 확인해 주세요.", "warn");
      });
  }

  function fillPrompt(q, focus) {
    var ta = $("[data-lv-ai-chat-q]");
    if (!ta) return;
    ta.value = q;
    autoResize(ta);
    updateSendEnabled();
    if (focus !== false) ta.focus({ preventScroll: true });
  }
  function newChat(keepInput) {
    state.threadId = "";
    state.notice = "";
    closePanel();
    renderThreads(); renderMessages(); renderContext();
    if (!keepInput) fillPrompt("", false);
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
    if (reducedMotion() || !("IntersectionObserver" in window)) { nodes.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); } });
    }, { threshold: 0.12 });
    nodes.forEach(function (el) { io.observe(el); });
  }
  function bindNav() {
    var links = $$(".lv-ai-nav__track a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { var id = (a.getAttribute("href") || "").replace("#", ""); if (id) map[id] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-on"); a.removeAttribute("aria-current"); });
        if (map[entry.target.id]) { map[entry.target.id].classList.add("is-on"); map[entry.target.id].setAttribute("aria-current", "location"); }
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }
  function setSidebar(open) {
    state.sidebarOpen = open;
    var side = $("[data-lv-ai-sidebar]");
    var back = $("[data-lv-ai-sidebar-backdrop]");
    if (side) side.classList.toggle("is-open", open);
    if (back) back.hidden = !open;
    var btn = $("[data-lv-ai-sidebar-open]");
    if (btn) btn.setAttribute("aria-expanded", String(open));
    if (open) { var f = side && side.querySelector("[data-lv-ai-new]"); if (f) f.focus(); }
    else if (btn && side && side.contains(document.activeElement)) btn.focus();
  }

  function bindEvents() {
    if (bound) return;
    bound = true;
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest("#livon-ai")) return;
      if (e.target.closest("[data-lv-ai-modal-close]")) { e.preventDefault(); closeModal(false); return; }
      if (e.target.closest("[data-lv-ai-modal-ok]")) { e.preventDefault(); closeModal(true); return; }
      var ask = e.target.closest("[data-lv-ai-ask]");
      if (ask) {
        /* quick actions only fill the input — the user decides to send */
        e.preventDefault();
        var q = ask.getAttribute("data-lv-ai-ask") || "";
        if (!/^#ai-chat$/.test(location.hash)) { newChat(); location.hash = "ai-chat"; }
        fillPrompt(q);
        setStatus("질문을 확인하고 전송해 주세요.", "");
        return;
      }
      if (e.target.closest("[data-lv-ai-new]")) {
        e.preventDefault();
        setSidebar(false);
        if (location.hash === "#ai-chat") newChat(); else location.hash = "ai-chat";
        return;
      }
      if (e.target.closest("[data-lv-ai-sidebar-open]")) { e.preventDefault(); setSidebar(true); return; }
      if (e.target.closest("[data-lv-ai-sidebar-close], [data-lv-ai-sidebar-backdrop]")) { e.preventDefault(); setSidebar(false); return; }
      if (e.target.closest("[data-lv-ai-panel-close]")) { e.preventDefault(); closePanel(); return; }
      if (e.target.closest("[data-lv-ai-panel-toggle]")) {
        e.preventDefault();
        var panel = $("[data-lv-ai-panel]");
        if (panel && panel.hidden && state.panelMsg != null) { openPanel(state.panelMsg); var pc = $("[data-lv-ai-panel-close]"); if (pc) pc.focus(); }
        else if (panel) { panel.hidden = !panel.hidden; state.panelOpen = !panel.hidden; }
        return;
      }
      if (e.target.closest("[data-lv-ai-open-settings]")) { e.preventDefault(); setSidebar(false); scrollToId("ai-settings"); return; }
      if (e.target.closest("[data-lv-ai-context-remove]")) { e.preventDefault(); removeContext(); return; }
      if (e.target.closest("[data-lv-ai-clear-all]")) {
        e.preventDefault();
        var n = loadStore().threads.length;
        if (!n) { setStatus("삭제할 대화가 없습니다."); return; }
        confirmDialog({ title: "모든 대화 삭제", body: "이 기기에 저장된 대화 " + n + "개를 모두 삭제할까요? 되돌릴 수 없습니다. 내 생활에 추가한 항목은 그대로 남습니다.", ok: "모두 삭제", danger: true })
          .then(function (ok) { if (!ok) return; Threads.clear(); if (location.hash === "#ai-chat") newChat(); else location.hash = "ai-chat"; announce("모든 대화를 삭제했습니다."); });
        return;
      }
      if (e.target.closest(".lv-ai-thread__main")) { setSidebar(false); return; }
      var rename = e.target.closest("[data-lv-ai-rename]");
      if (rename) {
        e.preventDefault();
        var th = Threads.get(rename.getAttribute("data-lv-ai-rename"));
        if (!th) return;
        openModal('<h2 id="lv-ai-modal-title">대화 제목 변경</h2><form data-lv-ai-rename-form data-id="' + esc(th.id) + '">' +
          '<label class="lv-ai-field">제목<input name="title" maxlength="40" value="' + esc(th.title || "") + '" data-lv-ai-autofocus autocomplete="off" /></label>' +
          '<div class="lv-ai-modal__acts"><button type="button" class="lv-ai-btn lv-ai-btn--ghost lv-ai-btn--sm" data-lv-ai-modal-close>취소</button><button type="submit" class="lv-ai-btn lv-ai-btn--dark lv-ai-btn--sm">저장</button></div></form>');
        var inp = state.modal && state.modal.el.querySelector("input"); if (inp) inp.select();
        return;
      }
      var del = e.target.closest("[data-lv-ai-del-thread]");
      if (del) {
        e.preventDefault();
        var id2 = del.getAttribute("data-lv-ai-del-thread");
        var th2 = Threads.get(id2);
        if (!th2) return;
        confirmDialog({ title: "대화 삭제", body: "‘" + (th2.title || "대화") + "’ 대화를 삭제할까요? 되돌릴 수 없습니다. 내 생활에 추가한 항목은 그대로 남습니다.", ok: "삭제", danger: true })
          .then(function (ok) {
            if (!ok) return;
            Threads.remove(id2);
            if (state.threadId === id2) { if (location.hash === "#ai-chat") newChat(); else location.hash = "ai-chat"; }
            else { renderThreads(); }
            announce("대화를 삭제했습니다.");
          });
        return;
      }
      if (e.target.closest("[data-lv-ai-clear-input]")) {
        e.preventDefault();
        fillPrompt("");
        return;
      }
      if (e.target.closest("[data-lv-ai-stop]")) {
        e.preventDefault();
        if (state.abort) { state.userAborted = true; state.abort.abort(); }
        return;
      }
      if (e.target.closest("[data-lv-ai-retry]")) {
        e.preventDefault();
        if (state.sending) return;
        var thCur = currentThread();
        if (!thCur || !thCur.messages.length || thCur.messages[thCur.messages.length - 1].role !== "error") return;
        var lastUser = thCur.messages.slice().reverse().find(function (m) { return m.role === "user"; });
        if (lastUser) sendMessage(lastUser.content, { retry: true });
        return;
      }
      var copy = e.target.closest("[data-lv-ai-copy]");
      if (copy) {
        e.preventDefault();
        var thc = currentThread();
        var m = thc && thc.messages[Number(copy.getAttribute("data-lv-ai-copy"))];
        if (m && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(displayText(m.content)).then(function () { announce("복사했습니다."); }, function () { setStatus("복사하지 못했습니다.", "warn"); });
        return;
      }
      var regen = e.target.closest("[data-lv-ai-regen]");
      if (regen) {
        e.preventDefault();
        if (state.sending) return;
        var thr = currentThread();
        if (!thr) return;
        var mi = Number(regen.getAttribute("data-lv-ai-regen"));
        if (mi !== thr.messages.length - 1) return;
        thr.messages = thr.messages.slice(0, mi);
        Threads.put(thr);
        var uq = lastUserBefore(thr, thr.messages.length);
        if (uq) sendMessage(uq, { retry: true });
        return;
      }
      var add = e.target.closest("[data-lv-ai-add]");
      if (add) { e.preventDefault(); openAddPreview(Number(add.getAttribute("data-lv-ai-add"))); return; }
    });

    document.addEventListener("submit", function (e) {
      var f = e.target;
      if (!f.closest || !f.closest("#livon-ai")) return;
      if (f.matches("[data-lv-ai-form]")) { e.preventDefault(); var ta = $("[data-lv-ai-chat-q]"); sendMessage(ta ? ta.value : ""); return; }
      if (f.matches("[data-lv-ai-add-form]")) { e.preventDefault(); approveAdd(f); return; }
      if (f.matches("[data-lv-ai-rename-form]")) {
        e.preventDefault();
        var id = f.getAttribute("data-id");
        var title = String(new FormData(f).get("title") || "").trim();
        if (!title) { var i0 = f.querySelector("input"); if (i0) { i0.setAttribute("aria-invalid", "true"); i0.focus(); } return; }
        Threads.rename(id, title);
        closeModal(true);
        renderThreads(); renderMessages();
        announce("대화 제목을 바꿨습니다.");
        return;
      }
      if (f.matches("[data-lv-ai-settings]")) {
        e.preventDefault();
        var st = loadStore();
        st.settings = {
          stage: f.stage.value, interests: f.interests.value.trim(), region: f.region.value.trim(), goal: f.goal.value.trim(),
          answerLength: f.answerLength.value, personalize: !!f.personalize.checked, shareLifeData: !!f.shareLifeData.checked
        };
        saveStore(st);
        var ns = f.querySelector("[data-lv-ai-settings-status]");
        if (ns) ns.textContent = "설정을 이 기기에 저장했습니다.";
        announce("설정을 이 기기에 저장했습니다.");
      }
    });

    var ta = $("[data-lv-ai-chat-q]");
    if (ta) {
      ta.addEventListener("input", function () { autoResize(ta); updateSendEnabled(); });
      ta.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
          e.preventDefault();
          if (!ta.value.trim() || state.sending) return;
          sendMessage(ta.value);
        }
      });
    }
    var tq = $("[data-lv-ai-thread-q]");
    if (tq) tq.addEventListener("input", renderThreads);
    document.addEventListener("keydown", function (e) {
      if (document.documentElement.dataset.lvView !== "livon-ai") return;
      if (e.key === "Tab") { trapFocus(e); return; }
      if (e.key === "Escape") {
        if (state.modal) { e.preventDefault(); e.stopPropagation(); closeModal(false); return; }
        if (state.sidebarOpen) { e.preventDefault(); setSidebar(false); }
      }
    }, true);
    var stream = $("[data-lv-ai-stream]");
    if (stream) stream.addEventListener("scroll", function () { state.stickBottom = stream.scrollHeight - stream.scrollTop - stream.clientHeight < 80; }, { passive: true });
  }

  function consumePendingPrompt() {
    var raw = null;
    try { raw = sessionStorage.getItem("livon.aiPrompt"); if (raw) sessionStorage.removeItem("livon.aiPrompt"); } catch (e) {}
    if (!raw) return false;
    var data = null;
    try { data = JSON.parse(raw); } catch (e) { return false; }
    if (!data || typeof data.q !== "string") return false;
    /* a hand-off from another screen always starts a fresh conversation with that context */
    newChat(true);
    state.pendingPage = pageContext(data.page);
    renderContext();
    fillPrompt(data.q.slice(0, LIMITS.message));
    setStatus("내용과 참고 맥락을 확인한 뒤 전송해 주세요. 자동으로 보내지 않습니다.", "ok");
    return true;
  }

  /* Routes: #livon-ai · #ai-chat (new) · #ai-chat/{threadId} · #ai-{section} */
  function onShow(hash) {
    init();
    hash = String(hash || "");
    if (state.modal) closeModal(false);
    if (state.sidebarOpen) setSidebar(false);
    var m = /^ai-chat\/([\w-]+)$/.exec(hash);
    state.notice = "";
    if (m) {
      if (Threads.get(m[1])) state.threadId = m[1];
      else { state.threadId = ""; state.notice = "이 대화를 찾을 수 없습니다. 삭제되었거나 다른 기기에서 만든 대화입니다."; }
    } else if (hash === "ai-chat") {
      if (!state.sending) state.threadId = "";
    }
    var handed = consumePendingPrompt();
    if (!handed && hash !== "ai-chat" && !m && !state.threadId) {
      var s = loadStore();
      var latest = s.threads.slice().sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); })[0];
      if (latest && (!hash || hash === "livon-ai")) state.threadId = latest.id;
    }
    closePanel();
    renderThreads(); renderMessages(); renderContext(); loadSettingsForm(); updateSendEnabled();
    detectApi();
    if (!hash || hash === "livon-ai" || hash === "ai-hero") { window.scrollTo(0, 0); return; }
    if (hash === "ai-chat" || m || handed) { setTimeout(function () { scrollToId("ai-chat"); var ta = $("[data-lv-ai-chat-q]"); if (ta && handed) ta.focus({ preventScroll: true }); }, 40); return; }
    if (hash.indexOf("ai-") === 0) setTimeout(function () { scrollToId(hash === "ai-start" ? "ai-chat" : hash); }, 40);
  }

  function startChat(q) {
    location.hash = "ai-chat";
    fillPrompt(q || "");
  }

  var inited = false;
  function init() {
    if (inited || !$("#livon-ai")) return;
    inited = true;
    bindFilm(); bindReveal(); bindNav(); bindEvents();
  }

  window.LivonAI = {
    onShow: onShow, startChat: startChat, sendMessage: sendMessage,
    _test: {
      deriveTitle: deriveTitle, keywords: keywords, retrieve: retrieve, renderMarkdown: renderMarkdown, candidateItems: candidateItems,
      extractPlan: extractPlan, requestPayload: requestPayload, errorFor: errorFor, pageContext: pageContext, stripDraftHeader: stripDraftHeader,
      safeHref: safeHref, Threads: Threads, loadStore: loadStore, state: state, LIMITS: LIMITS
    }
  };

  function boot() {
    init();
    if (!inited) return;
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "livon-ai") onShow(hash || "livon-ai");
    else { renderThreads(); renderMessages(); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
