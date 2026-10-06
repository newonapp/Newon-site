/* LIVON · 라이프 스테이지 허브
   연령 선택 → 관심 분야 → 주제 → 주제 상세(가이드·체크리스트·관련 정보) → 관련 서비스 → 저장 / 내 생활 / LIVON AI.

   Layers
   - Repo      : 데이터 소스. 지금은 /livon/life-topics.json(정적). DB/CMS로 교체할 때 Repo.load()만 바꾸면 된다.
   - Sources   : 기존 LIVON 데이터(탐색·오늘의 발견·라이프 스테이지 도구·커뮤니티)를 읽는 어댑터. 새 데이터를 만들지 않는다.
   - Account   : Newon+ 계정 연결 지점. 로그인 API가 없으므로 isSignedIn()은 false이며, 저장은 이 기기(LivonPlatform)에만 된다.
   - UI        : 기존 Life Stage 컴포넌트 클래스(lv-life-*, lv-ls-*)만 사용한다.
   - Router    : #life/{stage}, #life/{stage}/c/{category}, #life/{stage}/{topic}, #life/{stage}/{topic}/services[/{service}],
                 #life/services/{service}, #life/search/{query}
   전문가·업체·후기·평점·예약 가능 시간은 만들지 않는다. 데이터가 없으면 EmptyState를 보여 준다. */
(function () {
  "use strict";

  var DATA_URL = "/livon/life-topics.json?v=20261001cq1";
  var SITE_ORIGIN = "https://www.newon.app";
  var KEY_CHECKS = "livon.lifeHub.checklist.v1";
  var KEY_ML = "livon.mlStore.v1";
  var KEY_STAGE = "livon.lifeStage";
  var KEY_CM = "livon.cmStore.v1";
  var KEY_SAVE_ACK = "livon.lifeHub.saveAck";
  var KEY_AIQ = "livon.aiPrompt";
  var KEY_LAST = "livon.lifeHub.lastHash";

  /* ───────── utils ───────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  /* stored value must keep the shape the caller expects (old schema / corrupted data → fallback, null entries dropped) */
  function fitShape(v, fb) { if (Array.isArray(fb)) return Array.isArray(v) ? v.filter(function (x) { return x != null; }) : fb; if (fb && typeof fb === "object") return v && typeof v === "object" && !Array.isArray(v) ? v : fb; return v; }
  function readJSON(key, fallback, storage) {
    try { var raw = (storage || localStorage).getItem(key); return fitShape(raw ? JSON.parse(raw) : fallback, fallback); } catch (e) { return fallback; }
  }
  function writeJSON(key, value, storage) {
    try { (storage || localStorage).setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function safeHttp(url) { return /^https:\/\/[a-z0-9.-]+(\/|$)/i.test(String(url || "")) ? url : ""; }

  /* ───────── Repo (data source) ───────── */
  var Repo = {
    status: "idle", error: null, data: null, _promise: null, idx: null,
    load: function (force) {
      if (Repo.status === "ready" && !force) return Promise.resolve(Repo.data);
      if (Repo._promise && !force) return Repo._promise;
      Repo.status = "loading"; Repo.error = null;
      notify();
      var request = typeof fetch === "function"
        ? fetch(DATA_URL, { cache: "no-cache" }).then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
          })
        : Promise.reject(new Error("fetch unavailable"));
      Repo._promise = request.then(function (json) {
        Repo.use(json);
        return Repo.data;
      }).catch(function (err) {
        Repo.status = "error"; Repo.error = err; Repo._promise = null;
        notify();
        throw err;
      });
      return Repo._promise;
    },
    /* Accepts already-loaded data (tests, future SSR/CMS injection). */
    use: function (json) {
      if (!json || !Array.isArray(json.stages) || !Array.isArray(json.topics)) throw new Error("invalid life-topics data");
      var idx = { stageById: {}, stageBySlug: {}, topic: {}, cat: {}, svc: {}, pol: {}, expert: {} };
      json.stages.forEach(function (s) { idx.stageById[s.id] = s; idx.stageBySlug[s.slug] = s; });
      json.categories.forEach(function (c) { idx.cat[c.id] = c; });
      json.topics.forEach(function (t) { idx.topic[t.id] = t; });
      (json.serviceTypes || []).forEach(function (s) { idx.svc[s.id] = s; });
      (json.policies || []).forEach(function (p) { idx.pol[p.id] = p; });
      (json.experts || []).forEach(function (x) { idx.expert[x.id] = x; });
      Repo.data = json; Repo.idx = idx; Repo.status = "ready";
      notify();
    },
    stage: function (key) { return Repo.idx ? (Repo.idx.stageBySlug[key] || Repo.idx.stageById[String(key)] || null) : null; },
    topic: function (id) { return Repo.idx ? Repo.idx.topic[id] || null : null; },
    topicByRoute: function (stageSlug, slug) { return Repo.topic(stageSlug + "." + slug); },
    category: function (id) { return Repo.idx ? Repo.idx.cat[id] || null : null; },
    categoriesOf: function (stage) { return stage ? stage.categoryIds.map(Repo.category).filter(Boolean) : []; },
    topicsOf: function (cat) { return cat ? cat.topicIds.map(Repo.topic).filter(Boolean) : []; },
    /* services / policies pass the LIVON Data Platform gate (expired or unsourced rows are not shown as real) */
    service: function (id) { var x = Repo.idx ? Repo.idx.svc[id] || null : null; return x && gate("svc:" + id) ? x : null; },
    policy: function (id) { var x = Repo.idx ? Repo.idx.pol[id] || null : null; return x && gate("pol:" + id) ? x : null; },
    expert: function (id) { return Repo.idx ? Repo.idx.expert[id] || null : null; }
  };

  function gate(entityId) { var SD = window.LivonScreenData; try { return !SD || SD.visible(entityId); } catch (e) { return true; } }

  var listeners = [];
  function notify() { listeners.forEach(function (fn) { try { fn(Repo.status); } catch (e) {} }); }

  /* ───────── Sources: existing LIVON data (read-only adapters) ───────── */
  var Sources = {
    explore: function (id) {
      var d = window.LivonExploreData, SD = window.LivonScreenData;
      var it = SD ? SD.exploreById(id) : d && (d.items || []).find(function (x) { return x.id === id; });
      if (!it) return null;
      return { ref: "ex:" + id, kind: it.type, title: it.title, body: it.blurb || "", provider: it.provider || "",
        href: "#ex-item-" + id, official: safeHttp(it.url || it.officialUrl), source: "탐색 · " + (it.provider || "공식 안내") };
    },
    today: function (id) {
      var d = window.LivonTodayData, SD = window.LivonScreenData;
      var it = SD ? SD.todayById(id) : d && (d.contents || []).find(function (x) { return x.id === id; });
      if (!it) return null;
      return { ref: "td:" + id, kind: it.type, title: it.title, body: it.blurb || "", provider: it.source || "",
        href: "#td-item-" + id, official: safeHttp(it.officialUrl), source: "오늘의 발견 · " + (it.source || "LIVON") };
    },
    ref: function (ref) {
      var p = String(ref || "").split(":");
      if (p[0] === "ex") return Sources.explore(p[1]);
      if (p[0] === "td") return Sources.today(p[1]);
      return null;
    },
    tool: function (id) {
      var all = window.LivonServices && window.LivonServices.all ? window.LivonServices.all() : [];
      return all.find(function (s) { return s.id === id; }) || null;
    },
    /* Real posts on this device only: public, not drafts, not deleted. Posts that reference this
       Life Stage topic id come first, then text matches. Nothing is shown when nothing matches. */
    communityPosts: function (topic, limit) {
      var R = window.LivonCommunityRepo;
      var posts;
      if (R && R.searchablePosts) posts = R.searchablePosts();
      else {
        var store = readJSON(KEY_CM, null);
        posts = (store && Array.isArray(store.posts) ? store.posts : []).filter(function (p) { return p && !p.deleted && !p.draft && p.id && p.title && (!p.visibility || p.visibility === "public"); });
      }
      var words = [topic.title, topic.category].concat((topic.title || "").split(/\s+/)).filter(function (w) { return w && w.length > 1; });
      return posts.map(function (p) {
        if (p.lifeTopicId && (p.lifeTopicId === topic.id || (topic.topicIds || []).indexOf(p.lifeTopicId) >= 0)) return { p: p, s: 3 };
        var blob = [p.title, p.body, (p.tags || []).join(" "), p.field].join(" ");
        var hit = words.some(function (w) { return blob.indexOf(w) >= 0; }) || (topic.communityInterest && p.field === topic.communityInterest);
        return { p: p, s: hit ? 1 : 0 };
      }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s || (b.p.createdAt || 0) - (a.p.createdAt || 0); })
        .map(function (x) { return x.p; }).slice(0, limit || 3);
    },
    community: function (interest) {
      var d = window.LivonCommunityData;
      return d && (d.communities || []).find(function (c) { return c.interest === interest; }) || null;
    }
  };

  /* ───────── Account / Save (Newon+ 연결 지점) ───────── */
  var Account = {
    provider: "Newon+",
    /* TODO(API): Newon+ 인증 API가 연결되면 세션 확인 결과를 반환한다. */
    /* account mode only when LivonUserData has a verified session AND a configured remote — never in V1 */
    isSignedIn: function () { var U = window.LivonUserData; return !!(U && U.mode() === "account"); },
    syncAvailable: false
  };
  var SAVE_TYPES = { topic: "주제", guide: "가이드", checklist: "체크리스트", content: "콘텐츠", policy: "정책", service: "서비스", expert: "전문가", class: "클래스", place: "장소", community: "커뮤니티 글" };
  function saveId(type, id) { return "life-hub:" + type + ":" + id; }
  function isSaved(type, id) {
    var P = window.LivonPlatform;
    if (P && P.hasSave) return P.hasSave(saveId(type, id));
    return !!P && P.listSaves("all").some(function (s) { return s.id === saveId(type, id); });
  }
  function doSave(item) {
    if (!window.LivonPlatform) { status("저장 기능을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요."); return false; }
    var id = saveId(item.type, item.id);
    if (isSaved(item.type, item.id)) {
      window.LivonPlatform.removeSave(id);
      status(SAVE_TYPES[item.type] + " 저장을 해제했습니다.");
      return false;
    }
    window.LivonPlatform.saveItem({ id: id, title: item.title, label: item.title, type: "life-" + item.type, href: item.href,
      /* the screen the item belongs to (Explore V2: an Explore or Today item saved here no longer shows as Life Stage) */
      source: item.type === "community" ? "커뮤니티" : /^ex:/.test(String(item.id)) ? "탐색" : /^td:/.test(String(item.id)) ? "오늘의 발견" : "라이프 스테이지", lifeStage: item.lifeStage || "", data: { kind: item.type, refId: item.id } });
    /* TODO(API): Account.isSignedIn()이면 서버 저장 API 호출 후 동기화 상태를 표시한다. */
    status(SAVE_TYPES[item.type] + "을(를) 이 기기의 내 생활 › 저장함에 저장했습니다.");
    return true;
  }
  function refreshSaveButtons() {
    $$("[data-lh-save]").forEach(function (b) {
      var on = isSaved(b.getAttribute("data-lh-save"), b.getAttribute("data-lh-id"));
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.textContent = on ? "저장됨" : (b.getAttribute("data-lh-label") || "저장하기");
    });
  }

  /* ───────── Router ───────── */
  function parse(hash) {
    var h = String(hash || "").replace(/^#/, "");
    if (h.indexOf("life/") !== 0) return null;
    var parts = h.split("/").slice(1).map(function (p) { try { return decodeURIComponent(p); } catch (e) { return p; } });
    if (!parts[0]) return { view: "stage", stage: null };
    if (parts[0] === "search") return { view: "search", q: parts.slice(1).join("/") };
    if (parts[0] === "services") return parts[1] ? { view: "service", service: parts[1] } : null;
    var r = { stage: parts[0] };
    if (!parts[1]) { r.view = "stage"; return r; }
    if (parts[1] === "c") { r.view = "category"; r.category = parts[2] || ""; return r; }
    r.topic = parts[1];
    if (parts[2] === "services") { r.view = parts[3] ? "service" : "services"; r.service = parts[3] || null; return r; }
    r.view = "topic";
    return r;
  }
  function route(obj) {
    if (obj.view === "search") return "#life/search/" + encodeURIComponent(obj.q || "");
    if (obj.view === "service" && !obj.topic) return "#life/services/" + obj.service;
    var base = "#life/" + obj.stage;
    if (obj.view === "category") return base + "/c/" + obj.category;
    if (obj.view === "topic") return base + "/" + obj.topic;
    if (obj.view === "services") return base + "/" + obj.topic + "/services";
    if (obj.view === "service") return base + "/" + obj.topic + "/services/" + obj.service;
    return base;
  }
  function topicRoute(t) { return route({ view: "topic", stage: t.stageSlug, topic: t.slug }); }
  function stageRoute(s) { return "#life/" + s.slug; }
  function shareUrl(t) { return SITE_ORIGIN + "/livon/life/" + t.stageSlug + "/" + t.slug + "/"; }

  /* ───────── shared UI components (existing classes) ───────── */
  var UI = {
    btn: function (text, attrs, kind) {
      return '<button type="button" class="lv-life-btn lv-life-btn--' + (kind || "outline") + ' lv-life-btn--sm" ' + (attrs || "") + ">" + esc(text) + "</button>";
    },
    /* about: what the link leads to, for screen readers, when the visible label repeats on a page ("자세히 보기") */
    link: function (text, href, kind, attrs, about) {
      return '<a class="lv-life-btn lv-life-btn--' + (kind || "outline") + ' lv-life-btn--sm" href="' + esc(href) + '" ' + (attrs || "") + ">" + esc(text) + (about ? '<span class="lh-sr">: ' + esc(about) + "</span>" : "") + "</a>";
    },
    external: function (text, href) {
      var url = safeHttp(href);
      return url ? '<a class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(text) + ' <span aria-hidden="true">↗</span><span class="lh-sr"> (새 창)</span></a>' : "";
    },
    SaveButton: function (type, id, title, href, stageId, label) {
      var on = isSaved(type, id);
      return '<button type="button" class="lv-life-btn lv-life-btn--outline lv-life-btn--sm" data-lh-save="' + esc(type) + '" data-lh-id="' + esc(id) +
        '" data-lh-title="' + esc(title) + '" data-lh-href="' + esc(href) + '" data-lh-stage="' + esc(stageId || "") + '" data-lh-label="' + esc(label || "저장하기") +
        '" aria-pressed="' + on + '">' + (on ? "저장됨" : esc(label || "저장하기")) + "</button>";
    },
    AskLivonAIButton: function (payload, text, kind) {
      return '<button type="button" class="lv-life-btn lv-life-btn--' + (kind || "outline") + ' lv-life-btn--sm" data-lh-ai="' + esc(JSON.stringify(payload)) + '">' + esc(text || "LIVON AI에게 물어보기") + "</button>";
    },
    EmptyState: function (title, body, action) {
      return '<div class="lv-life-empty lh-empty" role="status"><strong>' + esc(title) + "</strong>" + (body ? "<p>" + esc(body) + "</p>" : "") + (action ? '<div class="lv-life-svc__acts">' + action + "</div>" : "") + "</div>";
    },
    LoadingState: function (text) {
      return '<div class="lv-life-empty lh-empty lh-loading" role="status" aria-live="polite" aria-busy="true"><span class="lh-spinner" aria-hidden="true"></span>' + esc(text || "라이프 스테이지 정보를 불러오는 중입니다.") + "</div>";
    },
    ErrorState: function (text) {
      return '<div class="lv-life-empty lh-empty lh-error" role="alert"><strong>' + esc(text || "정보를 불러오지 못했습니다.") + "</strong><p>네트워크 상태를 확인한 뒤 다시 시도해 주세요. 다른 LIVON 메뉴는 그대로 이용할 수 있습니다.</p>" +
        '<div class="lv-life-svc__acts">' + UI.btn("다시 시도", "data-lh-retry", "dark") + UI.link("라이프 스테이지로", "#life") + "</div></div>";
    },
    block: function (n, title, body, attrs, tools) {
      return '<section class="lv-ls-block lh-block" ' + (attrs || "") + '><div class="lh-block__head"><p class="lv-life-kicker">' + esc(n) + '</p><h3 class="lv-life-title lv-life-title--md">' + esc(title) + "</h3>" + (tools ? '<div class="lh-block__tools">' + tools + "</div>" : "") + "</div>" + body + "</section>";
    },
    TopicCard: function (t, opts) {
      opts = opts || {};
      var stage = Repo.stage(t.lifeStageId);
      return '<article class="lv-life-svc lh-card" data-lh-card="' + esc(topicRoute(t)) + '">' +
        '<p class="lv-life-svc__n">' + esc((stage ? stage.label : "") + " · " + t.category) + "</p>" +
        '<h4><a href="' + esc(topicRoute(t)) + '">' + esc(t.title) + "</a></h4>" +
        "<p>" + esc(t.description) + "</p>" +
        (opts.guideCount !== false ? "<ul><li>가이드 " + t.guide.length + "단계</li><li>체크리스트 " + t.checklist.length + "개</li></ul>" : "") +
        '<div class="lv-life-svc__acts">' + UI.link("자세히 보기", topicRoute(t), "dark", "", t.title) + "</div></article>";
    },
    StageSelector: function (activeSlug, makeHref) {
      var stages = Repo.data ? Repo.data.stages : [];
      return '<nav class="lh-stages" aria-label="다른 라이프 스테이지">' + stages.map(function (s) {
        var on = s.slug === activeSlug;
        return '<a href="' + esc(makeHref ? makeHref(s) : stageRoute(s)) + '"' + (on ? ' class="is-on" aria-current="true"' : "") + ">" + esc(s.label) + "</a>";
      }).join("") + "</nav>";
    },
    Breadcrumb: function (items) {
      return '<nav class="lv-ls-breadcrumb lh-crumbs" aria-label="현재 위치"><ol>' + items.map(function (it, i) {
        var last = i === items.length - 1;
        return "<li>" + (last || !it.href ? '<span aria-current="' + (last ? "page" : "false") + '">' + esc(it.label) + "</span>" : '<a href="' + esc(it.href) + '">' + esc(it.label) + "</a>") + "</li>";
      }).join("") + "</ol>" + UI.btn("← 이전으로", 'data-lh-back="' + esc(items.length > 1 ? items[items.length - 2].href || "#life" : "#life") + '"', "ghost-ink") + "</nav>";
    }
  };

  /* ───────── status line ───────── */
  function status(text) {
    var nodes = $$("#lh-status, [data-lh-status]").filter(function (x) { return x.offsetParent !== null || x.getClientRects().length; });
    var n = nodes[0] || $("#lh-status");
    if (n) { n.textContent = ""; setTimeout(function () { n.textContent = text; }, 30); }
  }

  /* ───────── checklist progress (this device) ───────── */
  function checks(topicId) { var all = readJSON(KEY_CHECKS, {}); return all && all[topicId] ? all[topicId] : {}; }
  function setCheck(topicId, itemId, on) {
    var all = readJSON(KEY_CHECKS, {}) || {};
    all[topicId] = all[topicId] || {};
    if (on) all[topicId][itemId] = true; else delete all[topicId][itemId];
    if (!writeJSON(KEY_CHECKS, all)) status("저장 공간이 부족해 체크 상태를 저장하지 못했습니다.");
  }

  /* ───────── view host ───────── */
  var host = null, lastFocus = null, defaultMeta = null;
  function ensureHost() {
    var root = document.getElementById("life");
    if (!root) return null;
    if (!host) {
      host = document.createElement("section");
      host.id = "life-hub-view";
      host.className = "lh-view";
      host.setAttribute("aria-live", "off");
      host.hidden = true;
      root.appendChild(host);
    }
    return host;
  }
  function show(html, titleForMeta) {
    var h = ensureHost();
    if (!h) return;
    var root = document.getElementById("life");
    root.classList.add("has-hub-view");
    h.hidden = false;
    h.innerHTML = html + '<p id="lh-status" class="lh-status" role="status" aria-live="polite"></p>';
    window.scrollTo(0, 0);
    var title = h.querySelector("[data-lh-title-focus]");
    if (title) title.focus({ preventScroll: true });
  }
  function hide() {
    var root = document.getElementById("life");
    if (root) root.classList.remove("has-hub-view");
    if (host) { host.hidden = true; host.innerHTML = ""; }
    restoreMeta();
  }

  /* ───────── metadata (SEO) ───────── */
  function metaEl(sel, create) {
    var el = document.head.querySelector(sel);
    if (!el && create) { el = document.createElement(create.tag); Object.keys(create.attrs).forEach(function (k) { el.setAttribute(k, create.attrs[k]); }); document.head.appendChild(el); }
    return el;
  }
  function setMeta(m) {
    if (!defaultMeta) {
      var d = metaEl('meta[name="description"]');
      var c = metaEl('link[rel="canonical"]');
      defaultMeta = { title: document.title, desc: d ? d.getAttribute("content") : null, canonical: c ? c.getAttribute("href") : null };
    }
    document.title = m.title;
    metaEl('meta[name="description"]', { tag: "meta", attrs: { name: "description" } }).setAttribute("content", m.description);
    metaEl('link[rel="canonical"]', { tag: "link", attrs: { rel: "canonical" } }).setAttribute("href", m.canonical);
    metaEl('meta[property="og:title"]', { tag: "meta", attrs: { property: "og:title" } }).setAttribute("content", m.title);
    metaEl('meta[property="og:description"]', { tag: "meta", attrs: { property: "og:description" } }).setAttribute("content", m.description);
    metaEl('meta[property="og:url"]', { tag: "meta", attrs: { property: "og:url" } }).setAttribute("content", m.canonical);
  }
  function restoreMeta() {
    if (!defaultMeta) return;
    document.title = defaultMeta.title;
    var d = metaEl('meta[name="description"]'); if (d && defaultMeta.desc != null) d.setAttribute("content", defaultMeta.desc);
    var c = metaEl('link[rel="canonical"]');
    if (c) { if (defaultMeta.canonical != null) c.setAttribute("href", defaultMeta.canonical); else c.parentNode.removeChild(c); }
  }
  function topicMeta(t) {
    var s = Repo.stage(t.lifeStageId);
    return { title: t.title + " · " + s.label + " 라이프 스테이지 | LivOn", description: t.description, canonical: shareUrl(t) };
  }

  /* ───────── renderers ───────── */
  function stageCrumb(s) { return { label: s.label, href: stageRoute(s) }; }
  var ROOT_CRUMBS = [{ label: "LIVON", href: "#livon-home" }, { label: "라이프 스테이지", href: "#life" }];

  /* Real Data Layer hook: external entities for this topic, rendered with the Life Stage card style.
     Returns "" when no provider has data, so every block keeps its current content/empty state. */
  function realData(t, type) {
    var D = window.LivonData;
    if (!D || typeof D.forTopic !== "function") return "";
    try { return D.ui.list(D.forTopic(t, type), D.ui.note(type), "life"); } catch (e) { return ""; }
  }
  /* Kakao Local place search, only for topics with an explicit place relation (never by age); "" when not connected */
  function placeSearchLink(t) {
    var P = window.LivonData && window.LivonData.places;
    var pl = P && P.configured() && P.planForTopic(t);
    if (!pl) return "";
    var h = "#ex-results?" + (pl.query ? "q=" + encodeURIComponent(pl.query) + "&" : "") + "type=place" + (pl.category ? "&pcat=" + pl.category : "");
    return '<p class="lv-life-note lv-data-place-plan">' + esc(pl.needsLocation ? "위치 사용에 동의하면 주변 장소를 찾을 수 있습니다." : "이 주제와 관련된 장소를 검색할 수 있습니다.") + " " + UI.link(pl.label, h) + " · 장소 정보 출처: Kakao Local</p>";
  }
  /* 한국관광공사 TourAPI 관광정보 link — explicit topic relation only (여행, 취미/문화); "" when not connected */
  function tourSearchLink(t) {
    var T = window.LivonData && window.LivonData.tour;
    var pl = T && T.configured() && T.planForTopic(t);
    if (!pl) return "";
    var h = "#ex-results?" + (pl.query ? "q=" + encodeURIComponent(pl.query) + "&" : "") + "type=place" + (pl.type ? "&tt=" + pl.type : "");
    return '<p class="lv-life-note lv-data-tour-plan">' + esc(pl.needsLocation ? "지역을 고르거나 위치 사용에 동의하면 관광정보를 볼 수 있습니다." : "관련 관광정보를 볼 수 있습니다.") + " " + UI.link(pl.label, h) + " · 출처: ⓒ한국관광공사</p>";
  }
  /* 전국평생학습강좌 search link — explicit keyword pairs only; "" when not connected */
  function classSearchLink(t) {
    var C = window.LivonData && window.LivonData.classes;
    var pl = C && C.configured() && C.planForTopic(t);
    return pl ? '<p class="lv-life-note lv-data-class-plan">' + UI.link(pl.label, pl.href) + " · 출처: 공공데이터포털 전국평생학습강좌표준데이터</p>" : "";
  }
  /* 마을세무사 search link — explicit tax-related topics only; never a specific person */
  function expertSearchLink(t) {
    var X = window.LivonData && window.LivonData.experts;
    var pl = X && X.configured() && X.planForTopic(t);
    return pl ? '<p class="lv-life-note lv-data-expert-plan">' + UI.link(pl.label, pl.href) + " · 공공기관이 공개한 마을세무사 정보(연결된 지역만)</p>" : "";
  }
  /* 고용24 직업훈련 search link — only topics explicitly about 취업·이직·재취업·직무 교육; "" when not connected */
  function jobSearchLink(t) {
    var J = window.LivonData && window.LivonData.jobs;
    var pl = J && J.configured() && J.planForTopic(t);
    return pl ? '<p class="lv-life-note lv-data-job-plan">' + UI.link(pl.label, pl.href) + " · " + esc(pl.attribution) + "</p>" : "";
  }
  function renderTopic(t) {
    var s = Repo.stage(t.lifeStageId);
    var here = topicRoute(t);
    var done = checks(t.id);
    var doneCount = t.checklist.filter(function (c) { return done[c.id]; }).length;
    var aiPayload = { q: "내 상황에 맞게 " + t.title + " 계획을 만들어 줘.", stage: s.id, stageLabel: s.label, topicId: t.id, topicTitle: t.title, category: t.category, url: here };

    var know = t.knowledge.map(function (k, i) {
      return '<article class="lh-know__item"><p class="lv-life-svc__n">' + pad(i + 1) + "</p><h4>" + esc(k.title) + "</h4><p>" + esc(k.body) + "</p></article>";
    }).join("");

    var guide = '<ol class="lh-guide">' + t.guide.map(function (g, i) {
      return '<li><details class="lh-step"' + (i === 0 ? " open" : "") + '><summary><em>' + pad(i + 1) + "</em><span>" + esc(g.title) + '</span><i aria-hidden="true"></i></summary><p>' + esc(g.body) + "</p></details></li>";
    }).join("") + "</ol>";

    var checklist = '<p class="lh-progress" data-lh-progress>' + doneCount + " / " + t.checklist.length + ' 완료 · 체크 상태는 이 기기에 저장됩니다.</p><div class="lv-ls-checklist lh-checklist">' +
      t.checklist.map(function (c) {
        return '<label><input type="checkbox" data-lh-check="' + esc(t.id) + '" value="' + esc(c.id) + '"' + (done[c.id] ? " checked" : "") + " /><span>" + esc(c.text) + "</span></label>";
      }).join("") + "</div>" +
      '<div class="lv-life-svc__acts">' + UI.btn("내 생활 할 일에 추가", 'data-lh-to-mylife="' + esc(t.id) + '"', "dark") +
      UI.SaveButton("checklist", t.id, t.title + " 체크리스트", here, s.id, "체크리스트 저장") + UI.btn("체크 초기화", 'data-lh-check-reset="' + esc(t.id) + '"', "ghost-ink") + "</div>";

    var contents = t.relatedContentIds.map(Sources.ref).filter(Boolean);
    var tools = t.relatedToolIds.map(Sources.tool).filter(Boolean);
    var infoBody = (contents.length ? '<div class="lv-life-services is-trio">' + contents.map(function (c) { return refCard(c, "content", s.id); }).join("") + "</div>" : UI.EmptyState("연결된 LIVON 콘텐츠가 아직 없습니다.", "관련 콘텐츠는 순차적으로 추가됩니다. 오늘의 발견에서 다른 콘텐츠를 살펴볼 수 있습니다.", UI.link("오늘의 발견 보기", "#today"))) +
      (tools.length ? '<h4 class="lh-subhead">LIVON에서 바로 쓰는 도구</h4><div class="lv-life-services is-trio">' + tools.map(function (x) { return window.LivonServices.card(x, s.id); }).join("") + "</div>" : "");

    var policies = t.relatedPolicyIds.map(Repo.policy).filter(Boolean);
    var extPolicy = realData(t, "policy"), extEvent = realData(t, "event"), extExpert = realData(t, "expert"), extProgram = realData(t, "program"), extPlace = realData(t, "place");
    var policyBody = policies.length ? '<p class="lv-life-note">LIVON은 정책 대상 여부를 판단하지 않습니다. 공식 포털에서 최신 공고와 조건을 확인하세요.</p><div class="lv-life-services is-trio">' + policies.map(function (p) { return policyCard(p, s.id); }).join("") + "</div>"
      : UI.EmptyState("현재 연결된 정책 데이터가 없습니다.", "정부·지자체 정책 데이터 연동은 준비 중입니다. 복지로·정부24에서 직접 검색할 수 있습니다.", UI.external("복지로에서 검색", "https://www.bokjiro.go.kr/"));

    var services = t.relatedServiceIds.map(Repo.service).filter(Boolean);
    var servicesRoute = route({ view: "services", stage: s.slug, topic: t.slug });
    var serviceBody = services.length ? '<div class="lv-life-services is-trio">' + services.slice(0, 6).map(function (x) { return serviceCard(x, t); }).join("") + "</div>" +
      '<div class="lv-life-svc__acts lh-more">' + UI.link("관련 서비스 이용하기 · 전체 " + services.length + "개", servicesRoute, "dark") + "</div>"
      : UI.EmptyState("현재 연결된 서비스가 없습니다.", "관련 생활 서비스는 순차적으로 연결하고 있습니다.", UI.link("탐색에서 찾아보기", "#explore"));

    var experts = t.relatedExpertIds.map(Repo.expert).filter(Boolean);
    var expertBody = experts.length ? "" : UI.EmptyState("현재 이 주제와 연결된 전문가가 없습니다.", "전문가 서비스는 순차적으로 준비하고 있습니다. 공공 상담 기관은 탐색에서 확인할 수 있습니다.",
      UI.btn("탐색에서 공식 상담 기관 보기", 'data-lh-explore="' + esc(t.category) + '" data-lh-explore-type="expert"'));

    var classes = t.relatedClassIds.map(Sources.ref).filter(Boolean);
    var classBody = classes.length ? '<p class="lv-life-note">공식 교육 포털과 LIVON 배움 가이드입니다. 개별 수업 일정·가격·예약은 연결되지 않았습니다.</p><div class="lv-life-services is-trio">' + classes.map(function (c) { return refCard(c, "class", s.id); }).join("") + "</div>"
      : UI.EmptyState("현재 등록된 클래스가 없습니다.", "관련 교육·클래스는 순차적으로 연결됩니다.", UI.btn("탐색에서 교육 찾기", 'data-lh-explore="' + esc(t.category) + '" data-lh-explore-type="program"'));

    var places = t.relatedPlaceIds.map(Sources.ref).filter(Boolean);
    var placeBody = places.length ? '<p class="lv-life-note">운영 시간과 이용 조건은 기관 공식 안내를 확인하세요.</p><div class="lv-life-services is-trio">' + places.map(function (c) { return refCard(c, "place", s.id); }).join("") + "</div>"
      : UI.EmptyState("현재 연결된 장소가 없습니다.", "관련 장소·시설 정보는 순차적으로 연결됩니다.", UI.link("오늘의 발견에서 장소 보기", "#td-places"));

    /* real entities replace an empty state, or follow LIVON's own items */
    if (extPolicy) policyBody = policies.length ? policyBody + extPolicy : extPolicy;
    if (extExpert) expertBody = extExpert;
    if (extProgram) classBody = classes.length ? classBody + extProgram : extProgram;
    if (extPlace) placeBody = places.length ? placeBody + extPlace : extPlace;
    placeBody += placeSearchLink(t) + tourSearchLink(t);
    classBody += classSearchLink(t) + jobSearchLink(t);
    expertBody += expertSearchLink(t);
    if (extEvent) infoBody = infoBody + '<h4 class="lh-subhead">관련 행사</h4>' + extEvent;
    var posts = Sources.communityPosts(t, 3);
    var room = Sources.community(t.communityInterest);
    var communityBody = (posts.length ? '<div class="lv-life-services is-trio">' + posts.map(function (p) {
        return '<article class="lv-life-svc"><p class="lv-life-svc__n">커뮤니티 · ' + esc(p.authorNick || "나") + "</p><h4><a href=\"#cm-post-" + esc(p.id) + "\">" + esc(p.title) + "</a></h4><p>" + esc(String(p.body || "").slice(0, 90)) + '</p><div class="lv-life-svc__acts">' + UI.link("게시글 보기", "#cm-post-" + p.id, "dark") + "</div></article>";
      }).join("") + "</div>"
      : UI.EmptyState("이 주제와 관련된 게시글이 아직 없습니다.", "경험이나 질문을 먼저 남겨 보세요. 현재 커뮤니티 글은 이 기기에만 저장됩니다.", UI.btn("커뮤니티에 질문 남기기", 'data-lh-compose="question"', "dark") + UI.link("커뮤니티 둘러보기", "#community"))) +
      (room ? '<p class="lv-life-note">관련 커뮤니티: <a href="#community">' + esc(room.name) + "</a> — " + esc(room.desc) + "</p>" : "");

    var related = t.relatedTopicIds.map(Repo.topic).filter(Boolean);
    var relatedBody = related.length ? '<div class="lv-life-services is-trio">' + related.map(function (r) { return UI.TopicCard(r, { guideCount: false }); }).join("") + "</div>" : UI.EmptyState("연결된 관련 주제가 없습니다.", "", UI.link(s.label + " 주제 보기", stageRoute(s)));

    var html =
      UI.Breadcrumb(ROOT_CRUMBS.concat([stageCrumb(s), { label: t.category, href: route({ view: "category", stage: s.slug, category: t.categoryId.split(".")[1] }) }, { label: t.title }])) +
      UI.StageSelector(s.slug) +
      '<header class="lv-ls-heading lh-heading"><p class="lv-life-kicker">' + esc(t.category) + " · " + esc(s.label) + "</p>" +
        '<h2 class="lv-life-title" aria-level="1" tabindex="-1" data-lh-title-focus>' + esc(t.title) + "</h2>" +
        '<p class="lv-life-lead">' + esc(t.description) + "</p>" +
        '<div class="lv-life-svc__acts lh-actions">' + UI.SaveButton("topic", t.id, t.title, here, s.id, "주제 저장") +
          UI.btn("공유", 'data-lh-share="' + esc(t.id) + '"') + UI.AskLivonAIButton(aiPayload, "LIVON AI에게 물어보기", "dark") + "</div>" +
      "</header>" +
      '<nav class="lh-toc" aria-label="이 페이지의 구성"><a href="#lh-know">알아야 할 것</a><a href="#lh-guide">단계별 가이드</a><a href="#lh-check">체크리스트</a><a href="#lh-info">관련 정보</a><a href="#lh-policy">정책</a><a href="#lh-services">서비스</a><a href="#lh-experts">전문가</a><a href="#lh-classes">클래스</a><a href="#lh-places">장소</a><a href="#lh-community">커뮤니티</a><a href="#lh-related">관련 주제</a></nav>' +
      UI.block("02", "이 주제에서 알아야 할 것", '<div class="lh-know">' + know + "</div>", 'id="lh-know"') +
      UI.block("03", "단계별 가이드", guide, 'id="lh-guide"', UI.SaveButton("guide", t.id, t.title + " 가이드", here, s.id, "가이드 저장") + UI.btn("모두 펼치기", "data-lh-expand")) +
      UI.block("04", "체크리스트", checklist, 'id="lh-check"') +
      UI.block("05", "관련 정보", infoBody, 'id="lh-info"') +
      UI.block("06", "관련 정책", policyBody, 'id="lh-policy"') +
      UI.block("07", "관련 서비스", serviceBody, 'id="lh-services"') +
      UI.block("08", "전문가", expertBody, 'id="lh-experts"') +
      UI.block("09", "클래스", classBody, 'id="lh-classes"') +
      UI.block("10", "장소", placeBody, 'id="lh-places"') +
      UI.block("11", "커뮤니티", communityBody, 'id="lh-community"') +
      UI.block("12", "관련 주제", relatedBody, 'id="lh-related"') +
      '<footer class="lv-ls-footer"><p>이 주제를 나의 생활로 이어가세요.</p><div class="lv-life-svc__acts">' +
        UI.btn("체크리스트를 내 생활에 추가", 'data-lh-to-mylife="' + esc(t.id) + '"', "dark") +
        UI.AskLivonAIButton(aiPayload, "LIVON AI에게 물어보기") + UI.link("내 생활 저장함", "#ml-saved") + UI.link(s.label + " 다른 주제", stageRoute(s)) + "</div></footer>";
    show(html);
    setMeta(topicMeta(t));
  }

  function refCard(c, type, stageId) {
    var label = type === "class" ? "클래스·교육" : type === "place" ? "장소" : "콘텐츠";
    return '<article class="lv-life-svc"><p class="lv-life-svc__n">' + esc(label + " · " + c.source) + "</p><h4><a href=\"" + esc(c.href) + "\">" + esc(c.title) + "</a></h4><p>" + esc(c.body) + "</p>" +
      '<div class="lv-life-svc__acts">' + UI.link("자세히 보기", c.href, "dark", "", c.title) + UI.SaveButton(type, c.ref, c.title, c.href, stageId) + (c.official ? UI.external("공식 사이트", c.official) : "") + "</div></article>";
  }
  function policyCard(p, stageId) {
    return '<article class="lv-life-svc lh-policy"><p class="lv-life-svc__n">공식 포털 · ' + esc(p.provider) + "</p><h4>" + esc(p.name) + "</h4>" +
      '<dl class="lh-dl"><div><dt>대상</dt><dd>' + esc(p.target) + "</dd></div><div><dt>주요 조건</dt><dd>" + esc(p.conditions) + "</dd></div><div><dt>신청기간</dt><dd>" + esc(p.period) + "</dd></div><div><dt>제공기관</dt><dd>" + esc(p.provider) + "</dd></div><div><dt>공식 출처</dt><dd>" + esc(p.sourceUrl.replace(/^https:\/\//, "").replace(/\/$/, "")) + (p.checkedAt ? " · 링크 확인 " + esc(p.checkedAt) : "") + "</dd></div></dl>" +
      '<div class="lv-life-svc__acts">' + UI.external("공식 사이트에서 자세히 보기", p.sourceUrl) + UI.SaveButton("policy", p.id, p.name + " · " + p.provider, location.hash || "#life", stageId) + "</div></article>";
  }
  function serviceCard(svc, t) {
    var href = t ? route({ view: "service", stage: t.stageSlug, topic: t.slug, service: svc.id }) : route({ view: "service", service: svc.id });
    return '<article class="lv-life-svc" data-lh-card="' + esc(href) + '"><p class="lv-life-svc__n">' + esc(svc.group) + " · 서비스 유형</p><h4><a href=\"" + esc(href) + "\">" + esc(svc.name) + "</a></h4><p>" + esc(svc.description) + "</p>" +
      "<ul>" + svc.features.slice(0, 3).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
      '<div class="lv-life-svc__acts">' + UI.link("자세히 보기", href, "dark", "", svc.name) + "</div></article>";
  }

  function renderServices(t) {
    var s = Repo.stage(t.lifeStageId);
    var services = t.relatedServiceIds.map(Repo.service).filter(Boolean);
    var groups = [];
    services.forEach(function (x) { var g = groups.find(function (y) { return y.name === x.group; }); if (!g) groups.push(g = { name: x.group, items: [] }); g.items.push(x); });
    var body = groups.length ? groups.map(function (g) {
      return '<section class="lv-ls-block lh-block"><div class="lh-block__head"><p class="lv-life-kicker">' + esc(g.items.map(function (x) { return x.name; }).join(" / ")) + '</p><h3 class="lv-life-title lv-life-title--md">' + esc(g.name) + "</h3></div>" +
        '<div class="lv-life-services is-trio">' + g.items.map(function (x) { return serviceCard(x, t); }).join("") + "</div></section>";
    }).join("") : UI.EmptyState("현재 연결된 서비스가 없습니다.", "관련 생활 서비스는 순차적으로 연결하고 있습니다.", UI.link("탐색에서 찾아보기", "#explore"));
    show(UI.Breadcrumb(ROOT_CRUMBS.concat([stageCrumb(s), { label: t.title, href: topicRoute(t) }, { label: "관련 서비스" }])) +
      '<header class="lv-ls-heading lh-heading"><p class="lv-life-kicker">관련 서비스 · ' + esc(s.label) + '</p><h2 class="lv-life-title" aria-level="1" tabindex="-1" data-lh-title-focus>' + esc(t.title) + " 관련 서비스</h2>" +
      '<p class="lv-life-lead">서비스 유형별로 준비 과정과 확인할 점을 안내합니다. 제휴 사업자는 아직 연결되지 않았으며, 특정 업체를 추천하지 않습니다.</p></header>' + body +
      '<footer class="lv-ls-footer"><div class="lv-life-svc__acts">' + UI.link("← " + t.title + " 주제로", topicRoute(t)) + UI.link("탐색에서 더 찾기", "#explore") + "</div></footer>");
    setMeta({ title: t.title + " 관련 서비스 · " + s.label + " | LivOn", description: t.title + "에 필요한 생활 서비스 유형과 준비 과정을 안내합니다.", canonical: shareUrl(t) });
  }

  function renderService(svc, t) {
    var s = t ? Repo.stage(t.lifeStageId) : null;
    var here = t ? route({ view: "service", stage: t.stageSlug, topic: t.slug, service: svc.id }) : route({ view: "service", service: svc.id });
    var explore = svc.relatedExploreIds.map(Sources.explore).filter(Boolean);
    var official = explore.filter(function (x) { return x.kind !== "place"; });
    var placeRefs = explore.filter(function (x) { return x.kind === "place"; });
    var contents = svc.relatedContentIds.map(Sources.ref).filter(Boolean);
    var tools = svc.relatedToolIds.map(Sources.tool).filter(Boolean);
    var policies = t ? t.relatedPolicyIds.map(Repo.policy).filter(Boolean) : [];
    var aiPayload = { q: svc.name + "을(를) 준비하려면 무엇부터 해야 해?" + (t ? " (" + t.title + " 중)" : ""), stage: s ? s.id : "", stageLabel: s ? s.label : "", topicId: t ? t.id : "", topicTitle: t ? t.title : "", category: svc.group, url: here };
    var crumbs = t ? ROOT_CRUMBS.concat([stageCrumb(s), { label: t.title, href: topicRoute(t) }, { label: "관련 서비스", href: route({ view: "services", stage: s.slug, topic: t.slug }) }, { label: svc.name }])
      : ROOT_CRUMBS.concat([{ label: "서비스" }, { label: svc.name }]);
    var html = UI.Breadcrumb(crumbs) +
      '<header class="lv-ls-heading lh-heading"><p class="lv-life-kicker">' + esc(svc.group) + " · 서비스" + (s ? " · " + esc(s.label) : "") + "</p>" +
        '<h2 class="lv-life-title" aria-level="1" tabindex="-1" data-lh-title-focus>' + esc(svc.name) + '</h2><p class="lv-life-lead">' + esc(svc.description) + "</p>" +
        '<div class="lv-life-svc__acts lh-actions">' + UI.SaveButton("service", svc.id, svc.name, here, s ? s.id : "", "서비스 저장") + UI.AskLivonAIButton(aiPayload, "LIVON AI에게 질문하기", "dark") +
        (svc.externalUrl ? UI.external("서비스 이용하기", svc.externalUrl) : "") + "</div></header>" +
      '<div class="lv-ls-overview"><section class="lv-ls-block"><h3 class="lv-life-title">누구에게 필요한가요?</h3><p>' + esc(svc.forWhom) + '</p></section><section class="lv-ls-block"><h3 class="lv-life-title">LIVON에서 할 수 있는 것</h3><ul>' +
        svc.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></section></div>" +
      UI.block("01", "이용 과정", '<ol class="lh-guide lh-guide--flat">' + svc.process.map(function (p, i) { return '<li><div class="lh-step lh-step--flat"><em>' + pad(i + 1) + "</em><span>" + esc(p) + "</span></div></li>"; }).join("") + "</ol>") +
      UI.block("02", "준비할 것", '<ul class="lh-bullets">' + svc.prepare.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>") +
      UI.block("03", "관련 콘텐츠·공식 안내", (official.length || contents.length || tools.length)
        ? '<div class="lv-life-services is-trio">' + official.concat(contents).map(function (c) { return refCard(c, "content", s ? s.id : ""); }).join("") + tools.map(function (x) { return window.LivonServices.card(x, s ? s.id : x.lifeStage); }).join("") + "</div>"
        : UI.EmptyState("연결된 콘텐츠가 아직 없습니다.", "관련 콘텐츠는 순차적으로 추가됩니다.")) +
      UI.block("04", "관련 전문가", UI.EmptyState("현재 이 서비스와 연결된 전문가가 없습니다.", "전문가 서비스는 순차적으로 준비하고 있습니다.", UI.btn("탐색에서 공식 상담 기관 보기", 'data-lh-explore="' + esc(svc.name) + '" data-lh-explore-type="expert"'))) +
      UI.block("05", "관련 장소", placeRefs.length ? '<div class="lv-life-services is-trio">' + placeRefs.map(function (c) { return refCard(c, "place", s ? s.id : ""); }).join("") + "</div>" : UI.EmptyState("현재 연결된 장소가 없습니다.", "관련 장소·시설 정보는 순차적으로 연결됩니다.")) +
      UI.block("06", "관련 정책", policies.length ? '<div class="lv-life-services is-trio">' + policies.map(function (p) { return policyCard(p, s.id); }).join("") + "</div>" : UI.EmptyState("현재 연결된 정책 데이터가 없습니다.", "정책 데이터 연동은 준비 중입니다.")) +
      '<p class="lv-life-note">' + (svc.partner ? "" : "현재 제휴 사업자가 연결되지 않았습니다. LIVON은 특정 업체를 추천하거나 예약·결제를 대신하지 않습니다.") + "</p>" +
      '<footer class="lv-ls-footer"><div class="lv-life-svc__acts">' + (t ? UI.link("← 관련 서비스 목록", route({ view: "services", stage: s.slug, topic: t.slug })) + UI.link(t.title + " 주제로", topicRoute(t)) : UI.link("라이프 스테이지로", "#life")) + UI.link("내 생활 저장함", "#ml-saved") + "</div></footer>";
    show(html);
    setMeta({ title: svc.name + " · 라이프 스테이지 서비스 | LivOn", description: svc.description, canonical: t ? shareUrl(t) : SITE_ORIGIN + "/livon/life/" });
  }

  function renderCategory(s, cat) {
    var topics = Repo.topicsOf(cat);
    var others = Repo.categoriesOf(s).filter(function (c) { return c.id !== cat.id; });
    show(UI.Breadcrumb(ROOT_CRUMBS.concat([stageCrumb(s), { label: cat.name }])) + UI.StageSelector(s.slug) +
      '<header class="lv-ls-heading lh-heading"><p class="lv-life-kicker">관심 분야 · ' + esc(s.label) + '</p><h2 class="lv-life-title" aria-level="1" tabindex="-1" data-lh-title-focus>' + esc(cat.name) + "</h2>" +
      '<p class="lv-life-lead">' + esc(s.label) + " " + esc(cat.name) + " 분야의 주제입니다. 주제를 열면 단계별 가이드와 체크리스트, 관련 정보를 볼 수 있습니다.</p></header>" +
      (topics.length ? '<div class="lv-life-services is-trio">' + topics.map(function (t) { return UI.TopicCard(t); }).join("") + "</div>" : UI.EmptyState("이 분야에 등록된 주제가 아직 없습니다.", "주제는 순차적으로 추가됩니다.")) +
      UI.block("", "다른 관심 분야", '<div class="lv-life-fields">' + others.map(function (c) { return '<a class="lh-chip" href="' + esc(route({ view: "category", stage: s.slug, category: c.slug })) + '">' + esc(c.name) + "</a>"; }).join("") + "</div>") +
      '<footer class="lv-ls-footer"><div class="lv-life-svc__acts">' + UI.link("← " + s.label + " 라이프 스테이지", stageRoute(s)) + "</div></footer>");
    setMeta({ title: s.label + " " + cat.name + " · 라이프 스테이지 | LivOn", description: s.label + " " + cat.name + " 분야의 생활 정보와 가이드", canonical: SITE_ORIGIN + "/livon/life/" + s.slug + "/" });
  }

  /* ───────── search ───────── */
  var SEARCH_TYPES = [{ id: "all", label: "전체" }, { id: "topic", label: "주제" }, { id: "guide", label: "가이드" }, { id: "service", label: "서비스" }, { id: "policy", label: "정책" }, { id: "content", label: "콘텐츠" }];
  function norm(s) { return String(s || "").toLowerCase().replace(/\s+/g, ""); }
  function search(q, opts) {
    opts = opts || {};
    var terms = String(q || "").trim().split(/\s+/).map(norm).filter(Boolean);
    if (!terms.length || !Repo.data) return [];
    function hit(text) { var n = norm(text); return terms.every(function (w) { return n.indexOf(w) >= 0; }); }
    var out = [];
    Repo.data.topics.forEach(function (t) {
      if (opts.stage && t.stageSlug !== opts.stage) return;
      var s = Repo.stage(t.lifeStageId);
      if (hit([t.title, t.description, t.category, s.label].join(" "))) out.push({ type: "topic", title: t.title, sub: s.label + " · " + t.category, body: t.description, href: topicRoute(t) });
      t.guide.forEach(function (g, i) { if (hit(g.title + " " + g.body)) out.push({ type: "guide", title: g.title, sub: s.label + " · " + t.title + " · " + (i + 1) + "단계", body: g.body, href: topicRoute(t) }); });
    });
    Repo.data.serviceTypes.forEach(function (x) { if (!opts.stage && hit([x.name, x.description, x.group].join(" "))) out.push({ type: "service", title: x.name, sub: x.group + " · 서비스 유형", body: x.description, href: route({ view: "service", service: x.id }) }); });
    Repo.data.policies.forEach(function (p) { if (hit([p.name, p.provider, p.target].join(" "))) out.push({ type: "policy", title: p.name, sub: "공식 포털 · " + p.provider, body: p.target, href: p.sourceUrl, external: true }); });
    var seen = {};
    Repo.data.topics.forEach(function (t) { t.relatedContentIds.concat(t.relatedClassIds, t.relatedPlaceIds).forEach(function (ref) { if (seen[ref]) return; seen[ref] = 1; var c = Sources.ref(ref); if (c && hit(c.title + " " + c.body)) out.push({ type: "content", title: c.title, sub: c.source, body: c.body, href: c.href }); }); });
    return opts.type && opts.type !== "all" ? out.filter(function (r) { return r.type === opts.type; }) : out;
  }
  var searchState = { type: "all", stage: "" };
  function renderSearch(q) {
    var results = search(q, { type: searchState.type, stage: searchState.stage });
    var label = { topic: "주제", guide: "가이드", service: "서비스", policy: "정책", content: "콘텐츠" };
    var stages = Repo.data.stages;
    show(UI.Breadcrumb(ROOT_CRUMBS.concat([{ label: "검색" }])) +
      '<header class="lv-ls-heading lh-heading"><p class="lv-life-kicker">라이프 스테이지 검색</p><h2 class="lv-life-title" aria-level="1" tabindex="-1" data-lh-title-focus>무엇을 준비하고 있나요?</h2></header>' +
      searchForm(q) +
      '<div class="lv-life-chips lh-filters" role="group" aria-label="검색 결과 종류">' + SEARCH_TYPES.map(function (t) {
        return '<button type="button" data-lh-filter-type="' + t.id + '" aria-pressed="' + (searchState.type === t.id) + '"' + (searchState.type === t.id ? ' class="is-on"' : "") + ">" + esc(t.label) + "</button>";
      }).join("") + "</div>" +
      '<div class="lv-life-chips lh-filters" role="group" aria-label="라이프 스테이지"><button type="button" data-lh-filter-stage="" aria-pressed="' + (!searchState.stage) + '"' + (!searchState.stage ? ' class="is-on"' : "") + ">전체 연령</button>" +
        stages.map(function (s) { var on = searchState.stage === s.slug; return '<button type="button" data-lh-filter-stage="' + s.slug + '" aria-pressed="' + on + '"' + (on ? ' class="is-on"' : "") + ">" + esc(s.label) + "</button>"; }).join("") + "</div>" +
      (String(q || "").trim()
        ? '<p class="lv-life-note" role="status">‘' + esc(q) + "’ 검색 결과 " + results.length + "건</p>" +
          (results.length ? '<h3 class="lh-sr">검색 결과</h3><div class="lv-life-services is-trio">' + results.slice(0, 60).map(function (r) {
            return '<article class="lv-life-svc"><p class="lv-life-svc__n">' + esc(label[r.type] + " · " + r.sub) + "</p><h4>" + (r.external ? esc(r.title) : '<a href="' + esc(r.href) + '">' + esc(r.title) + "</a>") + "</h4><p>" + esc(r.body) + '</p><div class="lv-life-svc__acts">' + (r.external ? UI.external("공식 사이트", r.href) : UI.link("자세히 보기", r.href, "dark", "", r.title)) + "</div></article>";
          }).join("") + "</div>" : UI.EmptyState("검색 결과가 없습니다.", "다른 단어로 검색하거나 연령·종류 필터를 바꿔 보세요.", UI.link("라이프 스테이지 둘러보기", "#life")))
        : UI.EmptyState("검색어를 입력해 주세요.", "예: 독립, 취업, 연금, 건강검진, 부모 돌봄")));
    setMeta({ title: "라이프 스테이지 검색 | LivOn", description: "주제·가이드·서비스·정책·콘텐츠를 검색합니다.", canonical: SITE_ORIGIN + "/livon/life/" });
  }
  function searchForm(q) {
    return '<form class="lh-search" role="search" data-lh-search-form><label for="lh-q-' + (++searchSeq) + '" class="lh-sr">라이프 스테이지 검색</label>' +
      '<input id="lh-q-' + searchSeq + '" type="search" name="q" maxlength="60" placeholder="무엇을 준비하고 있나요? 예: 독립, 취업, 연금" value="' + esc(q || "") + '" autocomplete="off" />' +
      '<button type="submit" class="lv-life-btn lv-life-btn--dark">검색</button></form>';
  }
  var searchSeq = 0;

  /* ───────── stage page blocks (inside existing stage view) ───────── */
  function renderStageBlocks() {
    $$("[data-lh-featured]").forEach(function (el) {
      var s = Repo.stage(el.getAttribute("data-lh-featured"));
      if (Repo.status === "error") { el.innerHTML = UI.ErrorState("추천 주제를 불러오지 못했습니다."); return; }
      if (Repo.status !== "ready" || !s) { el.innerHTML = UI.LoadingState("추천 주제를 불러오는 중입니다."); return; }
      el.innerHTML = '<div class="lv-life-services is-trio lh-featured">' + s.featuredTopicIds.map(Repo.topic).filter(Boolean).map(function (t) { return UI.TopicCard(t); }).join("") + "</div>";
    });
    $$("[data-lh-categories]").forEach(function (el) {
      var s = Repo.stage(el.getAttribute("data-lh-categories"));
      if (Repo.status === "error") { el.innerHTML = UI.ErrorState("관심 분야를 불러오지 못했습니다."); return; }
      if (Repo.status !== "ready" || !s) { el.innerHTML = UI.LoadingState("관심 분야를 불러오는 중입니다."); return; }
      el.innerHTML = '<div class="lv-life-fields lh-cats">' + Repo.categoriesOf(s).map(function (c) {
        return '<a class="lh-chip" href="' + esc(route({ view: "category", stage: s.slug, category: c.slug })) + '"><span>' + esc(c.name) + "</span><small>주제 " + c.topicIds.length + "</small></a>";
      }).join("") + "</div>";
    });
    $$("[data-lh-count]").forEach(function (el) {
      var s = Repo.stage(el.getAttribute("data-lh-count"));
      if (s && Repo.status === "ready") el.textContent = "관심 분야 " + s.categoryIds.length + "개";
    });
    $$("[data-lh-hero]").forEach(function (el) {
      var s = Repo.stage(el.getAttribute("data-lh-hero"));
      if (s && Repo.status === "ready") el.innerHTML = '<p class="lh-hero-line"><strong>' + esc(s.heroTitle) + "</strong> " + esc(s.heroLead) + "</p>";
    });
  }
  listeners.push(renderStageBlocks);

  /* ───────── My Life (approval before creating personal data) ───────── */
  var modal = null;
  function openModal(html, opener) {
    closeModal();
    lastFocus = opener || document.activeElement;
    modal = document.createElement("div");
    modal.className = "lv-life-modal lh-modal";
    modal.innerHTML = '<button type="button" class="lv-life-modal__backdrop" data-lh-modal-close aria-label="닫기" tabindex="-1"></button><div class="lv-life-modal__panel" role="dialog" aria-modal="true" aria-labelledby="lh-modal-title">' +
      '<button type="button" class="lv-life-modal__close" data-lh-modal-close aria-label="닫기">×</button>' + html + "</div>";
    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
    var f = modal.querySelector(".lv-life-modal__panel [data-lh-autofocus]") || modal.querySelector(".lv-life-modal__panel button");
    if (f) f.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.parentNode.removeChild(modal); modal = null;
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }
  function trapFocus(e) {
    if (!modal || e.key !== "Tab") return;
    var f = $$("button, a[href], input, [tabindex]:not([tabindex='-1'])", modal.querySelector(".lv-life-modal__panel"));
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function previewMyLife(topicId, opener) {
    var t = Repo.topic(topicId); if (!t) return;
    var s = Repo.stage(t.lifeStageId);
    var done = checks(t.id);
    openModal('<h2 id="lh-modal-title">내 생활 › 할 일에 추가할까요?</h2><p>아래 항목을 ‘' + esc(t.title) + '’ 할 일로 추가합니다. 추가할 항목을 확인한 뒤 승인해 주세요. 데이터는 이 기기의 내 생활에 저장됩니다.</p>' +
      '<form data-lh-mylife-form="' + esc(t.id) + '" class="lh-modal-list"><fieldset><legend>추가할 할 일</legend>' + t.checklist.map(function (c) {
        return '<label><input type="checkbox" name="item" value="' + esc(c.id) + '"' + (done[c.id] ? "" : " checked") + " /> " + esc(c.text) + (done[c.id] ? " <small>(완료함)</small>" : "") + "</label>";
      }).join("") + '</fieldset><div class="lv-life-svc__acts"><button type="submit" class="lv-life-btn lv-life-btn--dark" data-lh-autofocus>승인하고 추가</button><button type="button" class="lv-life-btn lv-life-btn--outline" data-lh-modal-close>취소</button></div></form>', opener);
  }
  /* Generic checklist → My Life (used by 오늘의 발견). spec: {key, title, note, sourceHref, source, category, items:[{id,text}]} */
  var todoSpecs = {};
  function previewTodos(spec, opener) {
    if (!spec || !spec.key || !Array.isArray(spec.items) || !spec.items.length) return;
    todoSpecs[spec.key] = spec;
    openModal('<h2 id="lh-modal-title">내 생활 › 할 일에 추가할까요?</h2><p>아래 항목을 ‘' + esc(spec.title) + '’ 할 일로 추가합니다. 추가할 항목을 확인한 뒤 승인해 주세요. 데이터는 이 기기의 내 생활에 저장됩니다.</p>' +
      '<form data-lh-todos-form="' + esc(spec.key) + '" class="lh-modal-list"><fieldset><legend>추가할 할 일</legend>' + spec.items.map(function (c) {
        return '<label><input type="checkbox" name="item" value="' + esc(c.id) + '" checked /> ' + esc(c.text) + "</label>";
      }).join("") + '</fieldset><div class="lv-life-svc__acts"><button type="submit" class="lv-life-btn lv-life-btn--dark" data-lh-autofocus>승인하고 추가</button><button type="button" class="lv-life-btn lv-life-btn--outline" data-lh-modal-close>취소</button></div></form>', opener);
  }
  function addTodos(spec, ids) {
    if (!spec) return 0;
    var store = readJSON(KEY_ML, {}) || {};
    store.todos = Array.isArray(store.todos) ? store.todos : [];
    var now = Date.now(), added = 0;
    spec.items.forEach(function (c) {
      if (ids.indexOf(c.id) < 0) return;
      var id = "lh_" + String(spec.key).replace(/\W/g, "_") + "_" + c.id;
      if (store.todos.some(function (x) { return x.id === id; })) return;
      store.todos.unshift({ id: id, title: c.text, due: "", priority: "보통", category: spec.category || "오늘의 발견", note: spec.note || spec.title, done: false, createdAt: now, updatedAt: now, source: spec.source || "today", sourceHref: spec.sourceHref || "" });
      added++;
    });
    if (!writeJSON(KEY_ML, store)) { status("저장 공간이 부족해 추가하지 못했습니다."); return -1; }
    return added;
  }
  function addToMyLife(topicId, ids) {
    var t = Repo.topic(topicId); if (!t) return 0;
    var s = Repo.stage(t.lifeStageId);
    var store = readJSON(KEY_ML, {}) || {};
    store.todos = Array.isArray(store.todos) ? store.todos : [];
    var now = Date.now(), added = 0;
    t.checklist.forEach(function (c) {
      if (ids.indexOf(c.id) < 0) return;
      var id = "lh_" + t.id.replace(/\W/g, "_") + "_" + c.id;
      if (store.todos.some(function (x) { return x.id === id; })) return;
      store.todos.unshift({ id: id, title: c.text, due: "", priority: "보통", category: "라이프 스테이지", note: s.label + " · " + t.title, done: false, createdAt: now, updatedAt: now, source: "life-stage", sourceHref: topicRoute(t) });
      added++;
    });
    if (!writeJSON(KEY_ML, store)) { status("저장 공간이 부족해 추가하지 못했습니다."); return -1; }
    return added;
  }
  function saveAck(then, opener) {
    if (Account.isSignedIn() || readJSON(KEY_SAVE_ACK, false, sessionStorage)) return then();
    /* anonymous public mode: no login prompt — one local-storage notice per session, then saves go straight to this device */
    openModal('<h2 id="lh-modal-title">이 기기에 저장됩니다</h2><p>현재 이 기기에 저장됩니다. 브라우저 데이터를 삭제하거나 다른 기기에서 이용하면 저장 내용이 유지되지 않을 수 있습니다. 저장한 항목은 <strong>내 생활 › 저장함</strong>에서 볼 수 있습니다.' +
      (window.LivonHelp ? ' <a class="lv-help-link" href="#help/a/local-data-storage" data-lv-help-link="local-data-storage" data-lh-modal-close>내 정보는 어디에 저장되나요?</a>' : "") + "</p>" +
      '<div class="lv-life-svc__acts"><button type="button" class="lv-life-btn lv-life-btn--dark" data-lh-save-local data-lh-autofocus>이 기기에 저장</button><button type="button" class="lv-life-btn lv-life-btn--outline" data-lh-modal-close>취소</button></div>', opener);
    pendingSave = then;
  }
  var pendingSave = null;

  /* ───────── LIVON AI hand-off (context only, no fake answers) ───────── */
  function absUrl(u) {
    u = String(u || "");
    if (u.charAt(0) === "#") return SITE_ORIGIN + "/livon/" + u;
    return /^https:\/\/(www\.)?newon\.app\//.test(u) ? u : "";
  }
  function askAI(p) {
    var SRC = { today: "today", explore: "explore", mylife: "mylife", community: "community" };
    var ctx = { source: SRC[p.source] || "life-stage", lifeStage: String(p.stage || ""), stageLabel: String(p.stageLabel || ""), topicId: String(p.topicId || ""), topicTitle: String(p.topicTitle || ""), category: String(p.category || ""),
      excerpt: String(p.summary || "").replace(/\s+/g, " ").slice(0, 160), url: absUrl(p.url) };
    var head = p.source === "today" ? "[오늘의 발견]" : p.source === "explore" ? "[탐색]" : p.source === "mylife" ? "[내 생활]" : p.source === "community" ? "[커뮤니티]" : "[라이프 스테이지]";
    var titleLabel = p.source === "today" ? "콘텐츠: " : p.source === "explore" ? (ctx.topicId === "search" ? "검색어: " : "항목: ") : p.source === "mylife" ? "항목: " : p.source === "community" ? "글: " : "주제: ";
    var lines = [head, ctx.stageLabel && "연령대: " + ctx.stageLabel, ctx.topicTitle && titleLabel + ctx.topicTitle, ctx.category && (p.source === "explore" ? "조건: " : "분야: ") + ctx.category,
      p.summary && "요약: " + String(p.summary).replace(/\s+/g, " ").slice(0, 200)].filter(Boolean);
    var q = lines.join("\n") + "\n\n" + String(p.q || "");
    if (!writeJSON(KEY_AIQ, { q: q.slice(0, 3900), draftOnly: true, page: ctx, at: Date.now() }, sessionStorage)) { status("LIVON AI로 내용을 전달하지 못했습니다."); return; }
    location.hash = "ai-chat";
  }

  /* ───────── events ───────── */
  function onClick(e) {
    var jump = e.target.closest(".lh-toc a[href^='#lh-']");
    if (jump) {
      /* In-page anchors must not change location.hash (the hash is the SPA route). */
      e.preventDefault();
      var target = document.getElementById(jump.getAttribute("href").slice(1));
      if (target) {
        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var top = target.getBoundingClientRect().top + window.pageYOffset - (window.LivonStickyOffset ? window.LivonStickyOffset() : ((document.querySelector(".gnav") || {}).offsetHeight || 72)) - 12;
        window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
        var h = target.querySelector("h3"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      }
      return;
    }
    var el = e.target.closest("[data-lh-save],[data-lh-share],[data-lh-ai],[data-lh-to-mylife],[data-lh-check-reset],[data-lh-expand],[data-lh-back],[data-lh-retry],[data-lh-modal-close],[data-lh-save-local],[data-lh-explore],[data-lh-compose],[data-lh-filter-type],[data-lh-filter-stage],[data-lh-card]");
    if (!el) return;
    if (el.hasAttribute("data-lh-card")) {
      if (e.target.closest("a,button,input,label,summary")) return;
      location.hash = el.getAttribute("data-lh-card").replace(/^#/, "");
      return;
    }
    if (el.hasAttribute("data-lh-modal-close")) { closeModal(); pendingSave = null; return; }
    if (el.hasAttribute("data-lh-save-local")) { writeJSON(KEY_SAVE_ACK, true, sessionStorage); var fn = pendingSave; pendingSave = null; closeModal(); if (fn) fn(); return; }
    if (el.hasAttribute("data-lh-save")) {
      var item = { type: el.getAttribute("data-lh-save"), id: el.getAttribute("data-lh-id"), title: el.getAttribute("data-lh-title"), href: el.getAttribute("data-lh-href"), lifeStage: el.getAttribute("data-lh-stage") };
      var run = function () { doSave(item); refreshSaveButtons(); };
      if (isSaved(item.type, item.id)) return run();
      return saveAck(run, el);
    }
    if (el.hasAttribute("data-lh-share")) {
      var t = Repo.topic(el.getAttribute("data-lh-share")); if (!t) return;
      var url = shareUrl(t);
      if (navigator.share) navigator.share({ title: t.title + " · LIVON", text: t.description, url: url }).catch(function (err) { if (err && err.name !== "AbortError") status("공유하지 못했습니다. 주소를 복사해 주세요: " + url); });
      else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { status("링크를 복사했습니다: " + url); }, function () { status("주소를 복사해 주세요: " + url); });
      else status("주소를 복사해 주세요: " + url);
      return;
    }
    if (el.hasAttribute("data-lh-ai")) { try { askAI(JSON.parse(el.getAttribute("data-lh-ai"))); } catch (err) { status("LIVON AI로 이동하지 못했습니다."); } return; }
    if (el.hasAttribute("data-lh-to-mylife")) return previewMyLife(el.getAttribute("data-lh-to-mylife"), el);
    if (el.hasAttribute("data-lh-check-reset")) {
      var tid = el.getAttribute("data-lh-check-reset"); var all = readJSON(KEY_CHECKS, {}) || {}; delete all[tid]; writeJSON(KEY_CHECKS, all);
      $$('[data-lh-check="' + tid + '"]').forEach(function (c) { c.checked = false; }); updateProgress(tid); status("체크리스트를 초기화했습니다."); return;
    }
    if (el.hasAttribute("data-lh-expand")) { var steps = $$(".lh-guide details"); var open = steps.some(function (d) { return !d.open; }); steps.forEach(function (d) { d.open = open; }); el.textContent = open ? "모두 접기" : "모두 펼치기"; return; }
    if (el.hasAttribute("data-lh-back")) {
      var prev = readJSON(KEY_LAST, null, sessionStorage);
      if (prev && prev !== location.hash && history.length > 1) history.back();
      else location.hash = el.getAttribute("data-lh-back").replace(/^#/, "");
      return;
    }
    if (el.hasAttribute("data-lh-retry")) { Repo.load(true).then(function () { handle(location.hash); }, function () { handle(location.hash); }); return; }
    if (el.hasAttribute("data-lh-explore")) {
      var q = el.getAttribute("data-lh-explore"), type = el.getAttribute("data-lh-explore-type") || "";
      location.hash = "explore";
      setTimeout(function () { if (window.LivonExplore && window.LivonExplore.openResults) window.LivonExplore.openResults(q, { categoryId: "", type: type, region: "" }); }, 60);
      return;
    }
    if (el.hasAttribute("data-lh-compose")) {
      var type2 = el.getAttribute("data-lh-compose");
      location.hash = "community";
      setTimeout(function () { if (window.LivonCommunity && window.LivonCommunity.openCompose) window.LivonCommunity.openCompose(type2); }, 80);
      return;
    }
    if (el.hasAttribute("data-lh-filter-type")) { searchState.type = el.getAttribute("data-lh-filter-type"); var r = parse(location.hash); if (r && r.view === "search") renderSearch(r.q); return; }
    if (el.hasAttribute("data-lh-filter-stage")) { searchState.stage = el.getAttribute("data-lh-filter-stage"); var r2 = parse(location.hash); if (r2 && r2.view === "search") renderSearch(r2.q); return; }
  }
  function updateProgress(topicId) {
    var t = Repo.topic(topicId), p = $("[data-lh-progress]"); if (!t || !p) return;
    var done = checks(topicId);
    p.textContent = t.checklist.filter(function (c) { return done[c.id]; }).length + " / " + t.checklist.length + " 완료 · 체크 상태는 이 기기에 저장됩니다.";
  }
  function onChange(e) {
    var c = e.target.closest("[data-lh-check]");
    if (c) { setCheck(c.getAttribute("data-lh-check"), c.value, c.checked); updateProgress(c.getAttribute("data-lh-check")); }
  }
  function onSubmit(e) {
    var f = e.target;
    if (f.matches && f.matches("[data-lh-search-form]")) {
      e.preventDefault();
      var q = String(new FormData(f).get("q") || "").trim();
      location.hash = route({ view: "search", q: q }).slice(1);
      return;
    }
    if (f.matches && f.matches("[data-lh-mylife-form], [data-lh-todos-form]")) {
      e.preventDefault();
      var ids = new FormData(f).getAll("item").map(String);
      if (!ids.length) { status("추가할 항목을 한 개 이상 선택해 주세요."); return; }
      var n = f.hasAttribute("data-lh-todos-form") ? addTodos(todoSpecs[f.getAttribute("data-lh-todos-form")], ids) : addToMyLife(f.getAttribute("data-lh-mylife-form"), ids);
      if (n < 0) return;
      var panel = f.parentNode;
      panel.innerHTML = '<button type="button" class="lv-life-modal__close" data-lh-modal-close aria-label="닫기">×</button><h2 id="lh-modal-title">내 생활에 추가했습니다</h2><p>' +
        (n ? "할 일 " + n + "개를 추가했습니다." : "선택한 항목은 이미 내 생활 할 일에 있습니다.") + " 이 기기의 내 생활 › 할 일에서 확인할 수 있습니다.</p>" +
        '<div class="lv-life-svc__acts"><a class="lv-life-btn lv-life-btn--dark" href="#ml-todos" data-lh-modal-close data-lh-autofocus>할 일 보기</a><button type="button" class="lv-life-btn lv-life-btn--outline" data-lh-modal-close>계속 보기</button></div>';
      var go = panel.querySelector("[data-lh-autofocus]"); if (go) go.focus();
    }
  }
  function onKey(e) {
    if (e.key === "Escape" && modal) { closeModal(); pendingSave = null; }
    trapFocus(e);
  }

  /* ───────── main entry ───────── */
  function handle(hash) {
    var r = parse(hash);
    if (!r || (r.view === "stage" && (!r.stage || /^[1-7]0s$/.test(r.stage)))) { hide(); return false; }
    if (Repo.status !== "ready") {
      show(UI.Breadcrumb(ROOT_CRUMBS.concat([{ label: "불러오는 중" }])) + (Repo.status === "error" ? UI.ErrorState() : UI.LoadingState()));
      if (Repo.status !== "loading") Repo.load().then(function () { if (location.hash === hash || ("#" + String(hash).replace(/^#/, "")) === location.hash) handle(hash); }, function () { if (parse(location.hash)) show(UI.Breadcrumb(ROOT_CRUMBS) + UI.ErrorState()); });
      else Repo._promise.then(function () { handle(location.hash); }, function () { if (parse(location.hash)) show(UI.Breadcrumb(ROOT_CRUMBS) + UI.ErrorState()); });
      return true;
    }
    var notFound = function (what) {
      show(UI.Breadcrumb(ROOT_CRUMBS.concat([{ label: "찾을 수 없음" }])) + '<header class="lv-ls-heading lh-heading"><h2 class="lv-life-title" aria-level="1" tabindex="-1" data-lh-title-focus>' + esc(what) + " 찾을 수 없습니다.</h2></header>" +
        UI.EmptyState("주소가 바뀌었거나 삭제된 항목일 수 있습니다.", "라이프 스테이지에서 다시 찾아 주세요.", UI.link("라이프 스테이지로", "#life", "dark") + UI.link("검색하기", "#life/search/")));
      restoreMeta();
      return true;
    };
    try {
      if (r.view === "search") { renderSearch(r.q); remember(hash); return true; }
      if (r.view === "service" && !r.topic) { var sv = Repo.service(r.service); if (!sv) return notFound("서비스를"); renderService(sv, null); remember(hash); return true; }
      var s = Repo.stage(r.stage);
      if (!s) return notFound("라이프 스테이지를");
      if (r.view === "category") { var cat = Repo.category(s.slug + "." + r.category); if (!cat) return notFound("관심 분야를"); renderCategory(s, cat); remember(hash); return true; }
      var t = Repo.topicByRoute(s.slug, r.topic);
      if (!t) return notFound("주제를");
      if (r.view === "topic") renderTopic(t);
      else if (r.view === "services") renderServices(t);
      else if (r.view === "service") { var svc = Repo.service(r.service); if (!svc || t.relatedServiceIds.indexOf(svc.id) < 0) return notFound("서비스를"); renderService(svc, t); }
      remember(hash);
      return true;
    } catch (err) {
      if (window.console) console.warn("[LivonLifeHub]", err);
      show(UI.Breadcrumb(ROOT_CRUMBS) + UI.ErrorState("화면을 표시하지 못했습니다."));
      return true;
    }
  }
  function remember(hash) { writeJSON(KEY_LAST, "#" + String(hash).replace(/^#/, ""), sessionStorage); }

  function stageIdFromHash(hash) {
    var m = /^#?life\/([1-7]0)s\/?$/.exec(String(hash || ""));
    return m ? m[1] : null;
  }

  function init() {
    if (!document.getElementById("life")) return;
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
    document.addEventListener("submit", onSubmit);
    document.addEventListener("keydown", onKey);
    Repo.load().catch(function () {});
  }

  window.LivonLifeHub = {
    open: handle, hide: hide, parse: parse, route: route, search: search, stageIdFromHash: stageIdFromHash,
    renderStageBlocks: renderStageBlocks, searchForm: function (q) { return searchForm(q); },
    repo: Repo, account: Account, sources: Sources, ui: UI,
    /* Shared platform hooks (오늘의 발견 등 다른 화면에서 재사용) */
    saves: { isSaved: isSaved, refresh: refreshSaveButtons },
    todos: { preview: previewTodos },
    onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); },
    _test: { addToMyLife: addToMyLife, addTodos: addTodos, askAI: askAI, absUrl: absUrl, doSave: doSave, isSaved: isSaved, setCheck: setCheck, checks: checks, topicMeta: topicMeta, shareUrl: shareUrl }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
