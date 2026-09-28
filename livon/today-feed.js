/*
 * LIVON 오늘의 발견 — Discovery Feed + 콘텐츠 상세 (V1)
 *
 * 새 콘텐츠 시스템이 아니라 이미 있는 데이터를 한 피드로 엮는 어댑터입니다.
 *   - 오늘의 발견 콘텐츠 : window.LivonTodayData (today-data.js)
 *   - 라이프 스테이지    : LivonLifeHub.repo (life-topics.json, 한 번만 받아 공유)
 *   - 장소·클래스·기관   : window.LivonExploreData (explore-data.js)
 *   - 서비스·정책        : life-topics.json serviceTypes / policies (공식 포털)
 * 저장은 LivonPlatform(라이프 스테이지와 같은 data-lh-save 흐름), 내 생활 추가·AI 초안은
 * LivonLifeHub의 공용 흐름을 재사용합니다. 조회수·인기 순위·평점 같은 수치는 만들지 않습니다.
 */
(function () {
  "use strict";

  var SITE = "https://www.newon.app";
  var KEY_RECENT = "livon.today.recent.v1";
  var KEY_TAB = "livon.today.tab";
  var KEY_STAGE = "livon.lifeStage";
  var KEY_PREFS = "livon.tdPrefs";
  var KEY_ML = "livon.mlStore.v1";
  var RECENT_MAX = 12;
  var PAGE = 12;

  /* ───────── utils ───────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function readJSON(key, fallback, store) {
    try { var raw = (store || localStorage).getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function writeJSON(key, value, store) {
    try { (store || localStorage).setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function safeHttp(url) { return /^https:\/\/[a-z0-9.-]+(\/|$)/i.test(String(url || "")) ? url : ""; }
  function hash32(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function daySeed() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function weekSeed() { var d = new Date(); var start = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + "w" + Math.floor((d - start) / 604800000); }
  function jitter(key, seed) { return (hash32(key + "|" + seed) % 1000) / 1000; }

  function TD() { return window.LivonTodayData || { contents: [] }; }
  function EX() { return window.LivonExploreData || { items: [] }; }
  function hub() { return window.LivonLifeHub || null; }
  function repo() { var h = hub(); return h && h.repo && h.repo.status === "ready" ? h.repo : null; }
  function repoStatus() { var h = hub(); return h && h.repo ? h.repo.status : "error"; }

  /* ───────── taxonomy (existing data → feed categories) ───────── */
  var CATS = [
    { id: "foryou", label: "For You" },
    { id: "featured", label: "주목", lead: "LIVON이 대표로 고른 콘텐츠와 연령대별 주요 주제입니다. 조회수 기반 순위가 아닙니다." },
    { id: "latest", label: "최신", lead: "작성·확인 날짜가 최근인 항목부터 보여 드립니다." },
    { id: "life", label: "생활", explore: { categoryId: "services" } },
    { id: "money", label: "돈", explore: { q: "금융" } },
    { id: "career", label: "커리어", explore: { categoryId: "career" } },
    { id: "health", label: "건강", explore: { categoryId: "health" } },
    { id: "relation", label: "관계", explore: { categoryId: "family" } },
    { id: "travel", label: "여행", explore: { q: "여행" } },
    { id: "culture", label: "문화·취미", explore: { categoryId: "leisure" } },
    { id: "space", label: "공간", explore: { categoryId: "local" } },
    { id: "class", label: "클래스", explore: { categoryId: "education" } },
    { id: "policy", label: "정책·지원", lead: "공식 기관 포털로만 연결합니다. 대상·조건은 각 공고 원문에서 확인하세요.", explore: { categoryId: "experts" } },
    { id: "event", label: "행사", lead: "LIVON은 행사 일정을 자동으로 만들지 않습니다. 공식 캘린더를 찾는 방법과 확인된 정보만 보여 드립니다.", explore: { q: "공연" } }
  ];
  function catById(id) { return CATS.find(function (c) { return c.id === id; }) || null; }
  var TOPIC_CAT = [
    [/금융|돈|자산|투자|연금/, "money"],
    [/취업|커리어|이직|창업|일자리|진로|아르바이트|자기계발|대학|공부|교육/, "career"],
    [/건강|운동|병원|의료|검진/, "health"],
    [/관계|친구|연애|가족|결혼|출산|육아|자녀|돌봄|사회활동/, "relation"],
    [/여행/, "travel"],
    [/취미|여가|문화/, "culture"],
    [/공공지원|복지|청소년 지원/, "policy"],
    [/독립|주거|디지털|생활|학교|은퇴|노후/, "life"]
  ];
  var TAG_CAT = { "건강": "health", "운동": "health", "스포츠": "health", "건강검진": "health", "여행": "travel", "자연": "travel", "가족": "relation", "돌봄": "relation", "관계": "relation", "연인": "relation", "문화": "culture", "전시": "culture", "공연": "culture", "취미": "culture", "금융": "money", "돈": "money", "주거": "life", "독립": "life", "이사": "life", "생활 정보": "life", "디지털": "life", "안전": "life", "취업": "career", "창업": "career", "커리어": "career", "자기계발": "career", "교육": "class", "정책": "policy", "지원": "policy" };
  var CAT_IMG = { money: "finance.jpg", career: "career.jpg", health: "fitness.jpg", relation: "family.jpg", travel: "travel.jpg", culture: "hobby.jpg", life: "housing.jpg", policy: "public-service.jpg", class: "study.jpg", space: "local.jpg", event: "culture-event.jpg" };
  var POLICY_CAT = { "pol-work24": "career", "pol-hrd": "career", "pol-kstartup": "career", "pol-kordi": "career", "pol-nhis": "health", "pol-mentalhealth": "health", "pol-myhome": "life", "pol-gov24": "life", "pol-kinfa": "money", "pol-nps": "money", "pol-hometax": "money", "pol-kosaf": "money", "pol-childcare": "relation", "pol-longtermcare": "relation", "pol-bokjiro": "relation", "pol-youthcenter": "career", "pol-cyber1388": "relation" };
  var TYPE_LABEL = { place: "장소", experience: "체험", learn: "배움", together: "함께", season: "계절", life: "생활 가이드", editorial: "이야기", event: "행사 안내", topic: "라이프 스테이지", program: "클래스·교육", guide: "공식 안내", service: "생활 서비스", expert: "공식 기관", policy: "공식 포털", product: "생활 상품" };

  function uniq(list) { var seen = {}; return list.filter(function (x) { if (!x || seen[x]) return false; seen[x] = 1; return true; }); }
  function catsOfContent(c) {
    var out = [];
    var byType = { place: ["space"], experience: ["culture", "class"], learn: ["class"], together: ["relation"], season: ["travel"], life: ["life"], editorial: ["life"], event: ["event", "culture"] };
    out = out.concat(byType[c.type] || []);
    (c.tags || []).forEach(function (t) { if (TAG_CAT[t]) out.push(TAG_CAT[t]); });
    TOPIC_CAT.forEach(function (r) { if (r[0].test(c.category || "")) out.push(r[1]); });
    return uniq(out);
  }
  function catsOfTopic(t) {
    var out = [];
    TOPIC_CAT.forEach(function (r) { if (r[0].test(t.category || "")) out.push(r[1]); });
    if (!out.length) out.push("life");
    return uniq(out);
  }
  function catsOfExplore(i) {
    var out = [], ids = i.categoryIds || [];
    if (i.type === "place") out.push("space");
    if (i.type === "program") out.push("class");
    if (ids.indexOf("leisure") >= 0) out.push("culture");
    if (ids.indexOf("career") >= 0) out.push("career");
    if (ids.indexOf("health") >= 0) out.push("health");
    if (ids.indexOf("family") >= 0) out.push("relation");
    if (ids.indexOf("housing") >= 0 || ids.indexOf("services") >= 0) out.push("life");
    if (i.type === "expert" || (i.type === "guide" && ids.indexOf("experts") >= 0)) out.push("policy");
    (i.tags || []).forEach(function (t) { if (TAG_CAT[t]) out.push(TAG_CAT[t]); });
    return uniq(out);
  }

  /* ───────── item adapters (no data copies — references + render fields) ───────── */
  function saveTypeForToday(c) { return c.type === "place" ? "place" : (c.type === "learn" || c.type === "experience") ? "class" : "content"; }
  function saveTypeForExplore(i) { return i.type === "place" ? "place" : i.type === "program" ? "class" : "content"; }
  function stageLabel(id) { var r = repo(); var s = r && r.stage(id); return s ? s.label : ""; }

  function fromContent(c) {
    var stages = relatedTopicsOf(c).map(function (t) { return t.lifeStageId; });
    return {
      key: "td:" + c.id, kind: "content", typeLabel: TYPE_LABEL[c.type] || "발견", category: c.category || "", title: c.title, desc: c.blurb,
      img: c.img, alt: c.alt || "", cats: catsOfContent(c), stageIds: uniq(stages), href: "#today/" + c.id, date: c.updatedAt || c.checkedAt || TD().checkedAt || "",
      featured: !!c.featured, actionable: !!(c.checklist && c.checklist.length), tags: c.tags || [],
      save: { type: saveTypeForToday(c), id: "td:" + c.id, title: c.title, href: "#today/" + c.id, stage: uniq(stages)[0] || "" }
    };
  }
  function fromTopic(t) {
    var r = repo(); var s = r && r.stage(t.lifeStageId);
    var href = "#life/" + t.stageSlug + "/" + t.slug;
    return {
      key: "lt:" + t.id, kind: "topic", typeLabel: TYPE_LABEL.topic, category: (s ? s.label + " · " : "") + t.category, title: t.title, desc: t.description,
      img: null, cats: catsOfTopic(t), stageIds: [t.lifeStageId], href: href, date: (r && r.data.updatedAt) || "",
      featured: !!(s && s.featuredTopicIds.indexOf(t.id) >= 0), actionable: t.checklist.length > 0, tags: [t.category],
      save: { type: "topic", id: t.id, title: t.title, href: href, stage: t.lifeStageId }
    };
  }
  function fromExplore(i) {
    var href = "#ex-item-" + i.id;
    return {
      key: "ex:" + i.id, kind: "explore", typeLabel: TYPE_LABEL[i.type] || "탐색", category: i.provider || i.subfield || "", title: i.title, desc: i.blurb,
      img: i.img, alt: "", cats: catsOfExplore(i), stageIds: [], href: href, date: i.checkedAt || "", featured: false, actionable: false, tags: i.tags || [],
      official: safeHttp(i.officialUrl), save: { type: saveTypeForExplore(i), id: "ex:" + i.id, title: i.title, href: href, stage: "" }
    };
  }
  function fromPolicy(p) {
    return {
      key: "pol:" + p.id, kind: "policy", typeLabel: TYPE_LABEL.policy, category: p.provider, title: p.name, desc: p.target, img: null,
      cats: uniq(["policy", POLICY_CAT[p.id]]), stageIds: [], href: safeHttp(p.sourceUrl), external: true, date: p.checkedAt || "",
      featured: false, actionable: false, tags: [], save: { type: "policy", id: p.id, title: p.name + " · " + p.provider, href: "#today", stage: "" }
    };
  }
  function fromService(svc) {
    var href = "#life/services/" + svc.id;
    return { key: "svc:" + svc.id, kind: "service", typeLabel: "서비스 유형", category: svc.group, title: svc.name, desc: svc.description, img: null, cats: [], stageIds: [], href: href, date: "", tags: [], save: null };
  }

  var poolCache = null, poolReady = false;
  function pool() {
    var r = repo();
    if (poolCache && poolReady === !!r) return poolCache;
    var items = [];
    (TD().contents || []).forEach(function (c) { items.push(fromContent(c)); });
    (EX().items || []).forEach(function (i) { if (i.type !== "product") items.push(fromExplore(i)); });
    if (r) {
      r.data.topics.forEach(function (t) { items.push(fromTopic(t)); });
      r.data.policies.forEach(function (p) { if (safeHttp(p.sourceUrl)) items.push(fromPolicy(p)); });
    }
    poolCache = items; poolReady = !!r;
    return items;
  }
  function byKey(key) { return pool().find(function (x) { return x.key === key; }) || null; }
  function contentById(id) { return (TD().contents || []).find(function (c) { return c.id === id; }) || null; }

  /* ───────── relations (Life Stage stays the source of truth) ───────── */
  function relatedTopicsOf(c) {
    var r = repo(); if (!r) return [];
    var ids = (c.lifeTopicIds || []).slice();
    var ref = "td:" + c.id;
    r.data.topics.forEach(function (t) {
      if (t.relatedContentIds.indexOf(ref) >= 0 || t.relatedClassIds.indexOf(ref) >= 0 || t.relatedPlaceIds.indexOf(ref) >= 0) ids.push(t.id);
    });
    return uniq(ids).map(function (id) { return r.topic(id); }).filter(Boolean);
  }

  /* ───────── recent views (ids only; no personal data) ───────── */
  function recent() { var l = readJSON(KEY_RECENT, []); return Array.isArray(l) ? l.filter(function (x) { return x && typeof x.key === "string"; }) : []; }
  function pushRecent(key) {
    if (!/^(td|lt|ex|pol|svc):[\w.-]+$/.test(String(key || ""))) return;
    var list = recent().filter(function (x) { return x.key !== key; });
    list.unshift({ key: key, at: Date.now() });
    writeJSON(KEY_RECENT, list.slice(0, RECENT_MAX));
  }

  /* ───────── personalization signals (only data that exists on this device) ───────── */
  function saveKey(saveId) {
    var m = /^life-hub:(\w+):(.+)$/.exec(String(saveId || ""));
    if (!m) return "";
    if (/^(td|ex):/.test(m[2])) return m[2];
    if (m[1] === "topic" || m[1] === "guide" || m[1] === "checklist") return "lt:" + m[2];
    if (m[1] === "policy") return "pol:" + m[2];
    return "";
  }
  function profile() {
    var stage = readJSON(KEY_STAGE, "");
    var prefs = readJSON(KEY_PREFS, {}) || {};
    var interests = uniq([].concat(Array.isArray(prefs.interests) ? prefs.interests : [], readJSON("livon.lifeInterests", []) || [])).filter(function (x) { return typeof x === "string"; });
    var weights = {}, signals = 0;
    function add(item, w) { if (!item) return; item.cats.forEach(function (c) { weights[c] = (weights[c] || 0) + w; }); signals++; }
    var saves = window.LivonPlatform && window.LivonPlatform.listSaves ? window.LivonPlatform.listSaves("all") : [];
    saves.forEach(function (s) { add(byKey(saveKey(s.id)), 2); });
    recent().forEach(function (x) { add(byKey(x.key), 1); });
    var ml = readJSON(KEY_ML, {}) || {};
    (Array.isArray(ml.todos) ? ml.todos : []).forEach(function (t) {
      var m = /^#life\/([1-7]0s)\/([a-z0-9-]+)$/.exec(t.sourceHref || "");
      if (m) add(byKey("lt:" + m[1] + "." + m[2]), 1);
      var n = /^#today\/([\w-]+)$/.exec(t.sourceHref || "");
      if (n) add(byKey("td:" + n[1]), 1);
    });
    return { stage: typeof stage === "string" && /^[1-7]0$/.test(stage) ? stage : "", interests: interests, weights: weights, personalized: !!(stage || interests.length || signals) };
  }
  function score(item, p) {
    var s = 0;
    if (p.stage && item.stageIds.indexOf(p.stage) >= 0) s += 3;
    var blob = [item.title, item.desc, item.category].concat(item.tags || []).join(" ");
    var hits = 0;
    p.interests.forEach(function (it) { if (hits < 2 && it && blob.indexOf(it) >= 0) { s += 2; hits++; } });
    item.cats.forEach(function (c) { s += Math.min(p.weights[c] || 0, 4); });
    if (item.actionable) s += 0.4;
    if (item.featured) s += 0.4;
    return s + jitter(item.key, daySeed());
  }

  /* ───────── cards (existing lv-td classes; no fake metrics) ───────── */
  function saveBtn(item, small) {
    if (!item.save) return "";
    var h = hub(); var on = !!(h && h.saves && h.saves.isSaved(item.save.type, item.save.id));
    return '<button type="button" class="lv-td-btn lv-td-btn--ghost' + (small ? " lv-td-btn--sm" : "") + '" data-lh-save="' + esc(item.save.type) + '" data-lh-id="' + esc(item.save.id) +
      '" data-lh-title="' + esc(item.save.title) + '" data-lh-href="' + esc(item.save.href) + '" data-lh-stage="' + esc(item.save.stage || "") + '" data-lh-label="저장" aria-pressed="' + on + '" aria-label="' + esc(item.title) + ' 저장">' + (on ? "저장됨" : "저장") + "</button>";
  }
  function primaryLink(item, text, cls) {
    if (item.external) return item.href ? '<a class="' + cls + '" href="' + esc(item.href) + '" target="_blank" rel="noopener noreferrer" data-td-key="' + esc(item.key) + '">' + esc(text || "공식 사이트") + ' <span aria-hidden="true">↗</span><span class="lh-sr"> (새 창)</span></a>' : "";
    return '<a class="' + cls + '" href="' + esc(item.href) + '" data-td-key="' + esc(item.key) + '">' + esc(text || "자세히") + "</a>";
  }
  function stageTags(item) {
    return item.stageIds.slice(0, 3).map(function (id) { var l = stageLabel(id); return l ? '<span class="td-tag">' + esc(l) + "</span>" : ""; }).join("");
  }
  function imgTag(src, alt) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt || "") + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'/livon/assets/topics/daytrip.jpg\'" />';
  }
  function titleLink(item) {
    return item.external ? esc(item.title) : '<a href="' + esc(item.href) + '" data-td-key="' + esc(item.key) + '">' + esc(item.title) + "</a>";
  }
  function feature(item) {
    return '<article class="lv-td-feature is-cover td-card" data-td-go="' + esc(item.external ? "" : item.href) + '" data-td-key="' + esc(item.key) + '">' +
      '<div class="lv-td-feature__media">' + imgTag(item.img || "/livon/assets/topics/" + (CAT_IMG[item.cats[0]] || "daytrip.jpg"), item.alt) + "</div>" +
      '<div class="lv-td-feature__body"><span class="lv-td-badge">' + esc(item.typeLabel) + "</span>" +
      '<p class="lv-td-eyebrow">' + esc(item.category) + "</p><h4>" + titleLink(item) + "</h4><p>" + esc(item.desc) + "</p>" +
      '<p class="td-tags">' + stageTags(item) + "</p>" +
      '<div class="lv-td-actions">' + primaryLink(item, "자세히 보기", "lv-td-btn") + saveBtn(item) + "</div></div></article>";
  }
  function card(item, dated) {
    var media = item.img ? '<div class="lv-td-card__media">' + imgTag(item.img, item.alt) + "</div>" : "";
    return '<article class="lv-td-card td-card' + (item.img ? "" : " td-card--text") + '" data-td-go="' + esc(item.external ? "" : item.href) + '" data-td-key="' + esc(item.key) + '">' + media +
      '<div class="lv-td-card__body"><p class="lv-td-card__meta">' + esc([item.typeLabel, item.category].filter(Boolean).join(" · ")) + "</p>" +
      "<h4>" + titleLink(item) + "</h4><p>" + esc(item.desc) + "</p>" +
      ((item.stageIds.length || dated) ? '<p class="td-tags">' + stageTags(item) + (dated && item.date ? '<span class="td-tag td-tag--muted">업데이트 ' + esc(item.date) + "</span>" : "") + "</p>" : "") +
      '<div class="lv-td-actions">' + primaryLink(item, item.external ? "공식 사이트" : "자세히", "lv-td-btn lv-td-btn--sm") + saveBtn(item, true) + "</div></div></article>";
  }
  function grid(items, dated) { return '<div class="lv-td-grid td-grid">' + items.map(function (i) { return card(i, dated); }).join("") + "</div>"; }
  function empty(title, body, action) {
    return '<div class="lv-td-empty td-empty" role="status"><span class="lv-td-badge">안내</span><h3>' + esc(title) + "</h3>" + (body ? "<p>" + esc(body) + "</p>" : "") + (action ? '<div class="lv-td-actions">' + action + "</div>" : "") + "</div>";
  }
  function loading(text) { return '<div class="lv-td-empty td-empty td-loading" role="status" aria-busy="true"><span class="td-spinner" aria-hidden="true"></span><p>' + esc(text || "불러오는 중입니다.") + "</p></div>"; }
  function errorBox(text) {
    return '<div class="lv-td-empty td-empty td-error" role="alert"><span class="lv-td-badge">오류</span><h3>' + esc(text || "라이프 스테이지 정보를 불러오지 못했습니다.") + "</h3><p>네트워크 상태를 확인한 뒤 다시 시도해 주세요. 오늘의 발견 콘텐츠는 그대로 볼 수 있습니다.</p>" +
      '<div class="lv-td-actions"><button type="button" class="lv-td-btn lv-td-btn--sm" data-td-retry>다시 시도</button></div></div>';
  }
  function section(id, eyebrow, title, lead, body, more) {
    if (!body) return "";
    return '<section class="td-block" aria-labelledby="td-b-' + id + '"><header class="lv-td-head lv-td-head--row td-block__head"><div><p class="lv-td-eyebrow">' + esc(eyebrow) + '</p><h3 class="lv-td-title lv-td-title--sm" id="td-b-' + id + '">' + esc(title) + "</h3>" +
      (lead ? '<p class="lv-td-lead">' + esc(lead) + "</p>" : "") + "</div>" + (more || "") + "</header>" + body + "</section>";
  }
  function exploreBtn(catId, label) {
    var c = catById(catId); if (!c || !c.explore) return "";
    return '<button type="button" class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" data-td-explore="' + esc(c.explore.q || "") + '" data-td-explore-cat="' + esc(c.explore.categoryId || "") + '">' + esc(label || "탐색에서 더 찾기") + "</button>";
  }

  /* ───────── feed ───────── */
  var state = { tab: readJSON(KEY_TAB, "foryou", sessionStorage) || "foryou", shown: PAGE };
  if (!catById(state.tab)) state.tab = "foryou";

  function renderTabs() {
    var host = $("[data-td-feed-tabs]"); if (!host) return;
    host.innerHTML = CATS.map(function (c) {
      var on = c.id === state.tab;
      return '<button type="button" role="tab" id="td-tab-' + c.id + '" aria-controls="td-feed-panel" aria-selected="' + on + '" tabindex="' + (on ? "0" : "-1") + '" data-td-tab="' + c.id + '"' + (on ? ' class="is-on"' : "") + ">" + esc(c.label) + "</button>";
    }).join("");
  }

  function take(list, n, used) {
    var out = [];
    for (var i = 0; i < list.length && out.length < n; i++) { if (!used[list[i].key]) { used[list[i].key] = 1; out.push(list[i]); } }
    return out;
  }
  function ranked(list, p) { return list.map(function (x) { return { x: x, s: score(x, p) }; }).sort(function (a, b) { return b.s - a.s; }).map(function (y) { return y.x; }); }
  function inCat(id) { return function (x) { return x.cats.indexOf(id) >= 0; }; }

  function forYouHtml() {
    var items = pool(), p = profile(), used = {}, r = repo(), st = repoStatus();
    var visual = items.filter(function (x) { return x.img && (x.kind === "content" || x.kind === "explore"); });
    var out = "";
    // A. 오늘의 추천
    var picks = take(ranked(visual.filter(function (x) { return x.kind === "content"; }), p), 3, used);
    out += section("pick", "Today's Pick", "오늘의 추천",
      p.personalized ? "이 기기의 연령대·관심사·저장·최근 본 항목을 기준으로 골랐습니다." : "여러 분야를 고르게 섞었습니다. 연령대나 관심사를 정하면 더 맞춰 드립니다.",
      picks.length ? '<div class="lv-td-hero-picks">' + feature(picks[0]) + picks.slice(1).map(function (x) { return card(x); }).join("") + "</div>" : "");
    // 최근 본 항목
    var rec = recent().map(function (x) { return byKey(x.key); }).filter(Boolean).slice(0, 6);
    if (rec.length) out += section("recent", "Recently viewed", "최근 본 항목", "이 기기에서 최근 연 항목입니다.", grid(rec) , '<button type="button" class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" data-td-clear-recent>기록 지우기</button>');
    // C. 내 라이프 스테이지
    if (r) {
      var stage = p.stage ? r.stage(p.stage) : null;
      var lt;
      if (stage) {
        lt = take(ranked(stage.featuredTopicIds.map(function (id) { return byKey("lt:" + id); }).filter(Boolean), p), 6, used);
        out += section("stage", "My Life Stage", stage.label + " 라이프 스테이지", stage.heroTitle, lt.length ? grid(lt) : "", '<a class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" href="#life/' + esc(stage.slug) + '">' + esc(stage.label) + " 전체 보기</a>");
      } else {
        lt = take(r.data.stages.map(function (s) { var ids = s.featuredTopicIds.slice(); return byKey("lt:" + ids[hash32(s.id + daySeed()) % ids.length]); }).filter(Boolean), 7, used);
        out += section("stage", "Life Stage", "연령대별 주요 주제", "나의 연령대를 정하면 해당 주제를 먼저 보여 드립니다.", lt.length ? grid(lt) : "", '<a class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" href="#life">라이프 스테이지 보기</a>');
      }
    } else {
      out += section("stage", "Life Stage", "라이프 스테이지 주제", "", st === "error" ? errorBox() : loading("라이프 스테이지 주제를 불러오는 중입니다."));
    }
    // B. 지금 알아두면 좋은 것 (가이드형 콘텐츠)
    var now = take(ranked(items.filter(function (x) { return x.kind === "content" && x.actionable; }), p), 3, used);
    out += section("now", "Good to know", "지금 알아두면 좋은 것", "바로 실행할 수 있는 가이드와 체크리스트입니다.", now.length ? grid(now) : "");
    // D/E/F 분야 묶음
    [["money", "Money & Living", "돈과 생활", "금융·주거·지원 정보를 모았습니다. 특정 금융상품은 추천하지 않습니다."],
     ["career", "Career", "커리어", "취업·이직·창업·자기계발 주제입니다."],
     ["health", "Healthy living", "건강한 생활", "일반 건강 정보입니다. 진단·치료는 의료진과 상담하세요."]].forEach(function (b) {
      var list = take(ranked(items.filter(inCat(b[0])), p), 3, used);
      out += section(b[0], b[1], b[2], b[3], list.length ? grid(list) : "", '<button type="button" class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" data-td-tab-go="' + b[0] + '">' + esc(catById(b[0]).label) + " 더 보기</button>");
    });
    // G. 이번 주 발견 (장소·클래스·체험·행사 안내 — 주 단위로 순환)
    var week = items.filter(function (x) { return x.img && (x.cats.indexOf("space") >= 0 || x.cats.indexOf("class") >= 0 || x.cats.indexOf("event") >= 0) && !used[x.key]; })
      .sort(function (a, b) { return jitter(a.key, weekSeed()) - jitter(b.key, weekSeed()); });
    week = take(week, 3, used);
    out += section("week", "This week", "이번 주 발견", "장소·클래스·체험을 이번 주 기준으로 바꿔 보여 드립니다. 운영 정보는 공식 안내를 확인하세요.", week.length ? grid(week) : "");
    // H. 정책·지원 (공식 포털만)
    var pol = take(ranked(items.filter(function (x) { return x.kind === "policy"; }), p), 3, used);
    if (r) out += section("policy", "Official support", "정책·지원", "공식 기관 포털로 연결합니다. LIVON은 신청 대상 여부를 판단하지 않습니다.", pol.length ? grid(pol) : "", '<button type="button" class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" data-td-tab-go="policy">정책·지원 더 보기</button>');
    // I. 저장해두고 보기 (체크리스트·가이드형)
    var keep = take(ranked(items.filter(function (x) { return x.actionable && x.kind === "topic"; }), p), 3, used);
    out += section("keep", "Save for later", "저장해두고 보기", "체크리스트가 있는 주제입니다. 저장하거나 내 생활 할 일로 옮길 수 있습니다.", keep.length ? grid(keep) : "");
    // J. 새로운 관심사 발견 (가중치가 없는 분야에서 하나씩)
    var fresh = ["travel", "culture", "relation", "class", "space", "life"].filter(function (c) { return !p.weights[c]; }).map(function (c) {
      return take(ranked(items.filter(inCat(c)), p), 1, used)[0];
    }).filter(Boolean).slice(0, 3);
    out += section("fresh", "Something new", "새로운 관심사 발견", "평소 덜 보던 분야에서 하나씩 골랐습니다.", fresh.length ? grid(fresh) : "");
    return out;
  }

  function listFor(tab) {
    var items = pool(), p = profile();
    if (tab === "featured") return items.filter(function (x) { return x.featured; }).sort(function (a, b) { return (a.kind === "content" ? 0 : 1) - (b.kind === "content" ? 0 : 1) || jitter(a.key, daySeed()) - jitter(b.key, daySeed()); });
    if (tab === "latest") return items.filter(function (x) { return x.date; }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)) || (a.kind === "content" ? -1 : 1); });
    var list = items.filter(inCat(tab));
    return list.sort(function (a, b) { return (b.img ? 1 : 0) - (a.img ? 1 : 0) || score(b, p) - score(a, p); });
  }

  function tabHtml(tab) {
    var c = catById(tab), list = listFor(tab), st = repoStatus();
    var head = '<header class="lv-td-head lv-td-head--row td-block__head"><div><p class="lv-td-eyebrow">Discovery · ' + esc(c.label) + '</p><h3 class="lv-td-title lv-td-title--sm" id="td-tab-title">' + esc(c.label) + "</h3>" +
      '<p class="lv-td-lead">' + esc(c.lead || (c.label + " 관련 콘텐츠·라이프 스테이지 주제·공식 정보를 모았습니다.")) + ' <span class="td-count">' + list.length + "개</span></p></div>" + exploreBtn(tab, "탐색에서 " + c.label + " 찾기") + "</header>";
    var pending = st !== "ready" ? (st === "error" ? errorBox("라이프 스테이지 주제를 불러오지 못해 일부만 표시합니다.") : loading("라이프 스테이지 주제를 불러오는 중입니다.")) : "";
    if (!list.length) return head + pending + (st === "ready" ? empty("이 분야에 표시할 항목이 아직 없습니다.", "다른 카테고리를 보거나 탐색에서 찾아보세요.", exploreBtn(tab) || '<button type="button" class="lv-td-btn lv-td-btn--sm" data-td-tab-go="foryou">For You 보기</button>') : "");
    var shown = list.slice(0, state.shown);
    return head + pending + grid(shown, tab === "latest") +
      (list.length > shown.length ? '<div class="td-more"><button type="button" class="lv-td-btn lv-td-btn--ghost" data-td-more>더 보기 (' + shown.length + " / " + list.length + ")</button></div>" : "");
  }

  function renderFeed() {
    var host = $("[data-td-feed]"); if (!host) return;
    try {
      host.innerHTML = '<div id="td-feed-panel" role="tabpanel" aria-labelledby="td-tab-' + esc(state.tab) + '" tabindex="-1">' + (state.tab === "foryou" ? forYouHtml() : tabHtml(state.tab)) + "</div>";
    } catch (err) {
      if (window.console) console.warn("[LivonTodayFeed]", err);
      host.innerHTML = errorBox("피드를 표시하지 못했습니다.");
    }
  }
  function setTab(tab, focus) {
    if (!catById(tab)) return;
    state.tab = tab; state.shown = PAGE;
    writeJSON(KEY_TAB, tab, sessionStorage);
    renderTabs(); renderFeed();
    var b = $('[data-td-tab="' + tab + '"]');
    if (b && b.scrollIntoView) { try { b.scrollIntoView({ block: "nearest", inline: "nearest" }); } catch (e) {} }
    if (focus && b) b.focus();
  }

  /* ───────── detail (#today/{id}) ───────── */
  var defaultMeta = null;
  function metaEl(sel, tag, attrs) {
    var el = document.head.querySelector(sel);
    if (!el) { el = document.createElement(tag); Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); }); document.head.appendChild(el); }
    return el;
  }
  function setMeta(title, desc, canonical) {
    if (!defaultMeta) {
      var d = document.head.querySelector('meta[name="description"]'), c = document.head.querySelector('link[rel="canonical"]');
      defaultMeta = { title: document.title, desc: d ? d.getAttribute("content") : null, canonical: c ? c.getAttribute("href") : null };
    }
    document.title = title;
    metaEl('meta[name="description"]', "meta", { name: "description" }).setAttribute("content", desc);
    metaEl('link[rel="canonical"]', "link", { rel: "canonical" }).setAttribute("href", canonical);
    metaEl('meta[property="og:title"]', "meta", { property: "og:title" }).setAttribute("content", title);
    metaEl('meta[property="og:description"]', "meta", { property: "og:description" }).setAttribute("content", desc);
    metaEl('meta[property="og:url"]', "meta", { property: "og:url" }).setAttribute("content", canonical);
  }
  function restoreMeta() {
    if (!defaultMeta) return;
    document.title = defaultMeta.title;
    var d = document.head.querySelector('meta[name="description"]'); if (d && defaultMeta.desc != null) d.setAttribute("content", defaultMeta.desc);
    var c = document.head.querySelector('link[rel="canonical"]'); if (c) { if (defaultMeta.canonical != null) c.setAttribute("href", defaultMeta.canonical); else c.parentNode.removeChild(c); }
  }
  function shareUrl(id) { return SITE + "/livon/today/" + id + "/"; }

  function block(n, title, body, id) {
    if (!body) return "";
    return '<section class="lv-td-block td-dblock"' + (id ? ' id="' + id + '"' : "") + ' aria-labelledby="td-d-' + n + '"><p class="lv-td-eyebrow">' + esc(n) + '</p><h3 class="lv-td-title lv-td-title--sm" id="td-d-' + n + '">' + esc(title) + "</h3>" + body + "</section>";
  }
  function tagChips(c) {
    return (c.tags || []).map(function (t) {
      var cat = TAG_CAT[t] && catById(TAG_CAT[t]);
      var ex = cat && cat.explore ? cat.explore : { q: t };
      return '<button type="button" class="td-chip" data-td-explore="' + esc(ex.categoryId ? "" : (ex.q || t)) + '" data-td-explore-cat="' + esc(ex.categoryId || "") + '" aria-label="탐색에서 ' + esc(t) + ' 찾기">#' + esc(t) + "</button>";
    }).join("");
  }

  function renderDetail(c) {
    var r = repo(), st = repoStatus();
    var item = fromContent(c);
    var topics = relatedTopicsOf(c);
    var stageIds = uniq(topics.map(function (t) { return t.lifeStageId; }));
    var userStage = readJSON(KEY_STAGE, "");
    var aiStage = stageIds.indexOf(userStage) >= 0 ? userStage : (stageIds[0] || "");
    var here = "#today/" + c.id;
    var ai = { source: "today", q: "‘" + c.title + "’ 내용을 내 상황에 맞게 정리하고, 먼저 할 일을 알려 줘.", stage: aiStage, stageLabel: stageLabel(aiStage), topicId: "today:" + c.id, topicTitle: c.title, category: c.category || "", url: here, summary: c.blurb };
    var aiBtn = function (cls) { return '<button type="button" class="' + cls + '" data-lh-ai="' + esc(JSON.stringify(ai)) + '">LIVON AI에게 물어보기</button>'; };
    var todoBtn = c.checklist && c.checklist.length ? '<button type="button" class="lv-td-btn lv-td-btn--ghost" data-td-todos="' + esc(c.id) + '">내 생활에 추가</button>' : "";
    var shareBtn = '<button type="button" class="lv-td-btn lv-td-btn--ghost" data-td-share="' + esc(c.id) + '">공유</button>';

    var facts = [];
    if (c.address) facts.push(["주소", c.address]);
    if (c.hours) facts.push(["운영 시간", c.hours]);
    if (c.price) facts.push(["가격", c.price]);
    if (c.difficulty) facts.push(["난이도", c.difficulty]);
    if (c.duration) facts.push(["소요 시간", c.duration]);
    if (c.region) facts.push(["지역", c.region]);
    if (c.indoorOutdoor) facts.push(["실내·야외", c.indoorOutdoor]);
    if (c.onlineOffline) facts.push(["온·오프라인", c.onlineOffline]);
    if (c.companion && c.companion.length) facts.push(["동행", c.companion.join(", ")]);
    if (c.source) facts.push(["출처", c.source]);
    facts.push([c.updatedAt ? "작성·수정" : "확인", c.updatedAt || c.checkedAt || TD().checkedAt || "—"]);

    var stageChips = stageIds.map(function (id) {
      var s = r && r.stage(id); return s ? '<a class="td-chip td-chip--link" href="#life/' + esc(s.slug) + '">' + esc(s.label) + "</a>" : "";
    }).join("");

    // related collections
    var exIds = uniq((c.exploreIds || []).concat([].concat.apply([], topics.map(function (t) { return t.relatedContentIds.concat(t.relatedClassIds, t.relatedPlaceIds); })).filter(function (x) { return /^ex:/.test(x); }).map(function (x) { return x.slice(3); })));
    var exItems = exIds.map(function (id) { return byKey("ex:" + id); }).filter(Boolean).slice(0, 6);
    var svcIds = uniq((c.serviceIds || []).concat([].concat.apply([], topics.map(function (t) { return t.relatedServiceIds; }))));
    var svcs = r ? svcIds.map(function (id) { return r.service(id); }).filter(Boolean).slice(0, 6).map(fromService) : [];
    var polIds = uniq((c.policyIds || []).concat([].concat.apply([], topics.map(function (t) { return t.relatedPolicyIds; }))));
    var pols = r ? polIds.map(function (id) { return r.policy(id); }).filter(Boolean).slice(0, 4).map(fromPolicy) : [];
    var sameCats = catsOfContent(c);
    var relContents = (TD().contents || []).filter(function (x) { return x.id !== c.id; }).map(fromContent)
      .map(function (x) { var s = x.cats.filter(function (k) { return sameCats.indexOf(k) >= 0; }).length + (x.tags || []).filter(function (t) { return (c.tags || []).indexOf(t) >= 0; }).length * 0.5; return { x: x, s: s }; })
      .filter(function (y) { return y.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 3).map(function (y) { return y.x; });
    var h = hub();
    var posts = h && h.sources && h.sources.communityPosts ? h.sources.communityPosts({ title: c.title, category: c.category, communityInterest: "", topicIds: c.lifeTopicIds || [] }, 3) : [];

    var pending = st === "ready" ? "" : (st === "error" ? errorBox("관련 라이프 스테이지·서비스·정책을 불러오지 못했습니다.") : loading("관련 라이프 스테이지·서비스·정책을 불러오는 중입니다."));

    var html =
      '<nav class="td-crumbs" aria-label="현재 위치"><ol><li><a href="#livon-home">LIVON</a></li><li><a href="#today" data-td-back>오늘의 발견</a></li><li><span aria-current="page">' + esc(c.category || item.typeLabel) + "</span></li></ol>" +
        '<button type="button" class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" data-td-back>← 이전으로</button></nav>' +
      // 01 Hero
      '<header class="td-dhero"><div class="lv-td-detail__hero">' + imgTag(c.img || "/livon/assets/topics/daytrip.jpg", c.alt) + "</div>" +
        '<p class="lv-td-eyebrow">' + esc([c.category, item.typeLabel].filter(Boolean).join(" · ")) + "</p>" +
        '<h2 class="lv-td-title lv-td-title--md" tabindex="-1" data-td-title-focus>' + esc(c.title) + "</h2>" +
        '<p class="lv-td-lead">' + esc(c.blurb) + "</p>" +
        (stageChips ? '<p class="td-tags" aria-label="관련 라이프 스테이지">' + stageChips + "</p>" : "") +
        '<div class="lv-td-actions td-dactions">' + saveBtn(item) + shareBtn + todoBtn + aiBtn("lv-td-btn") + "</div></header>" +
      pending +
      // 02 핵심 내용
      block("02", "핵심 내용", c.points && c.points.length ? '<ul class="td-points">' + c.points.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
      // 03 상세 본문
      block("03", "자세히 알아보기", '<p class="td-body">' + esc(c.body || c.blurb) + '</p><dl class="lv-td-facts">' + facts.map(function (f) { return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("") + "</dl>" +
        (c.tags && c.tags.length ? '<p class="td-tags" aria-label="태그 · 탐색으로 이동">' + tagChips(c) + "</p>" : "") +
        (safeHttp(c.officialUrl) ? '<p class="lv-td-actions"><a class="lv-td-btn lv-td-btn--ghost lv-td-btn--sm" href="' + esc(c.officialUrl) + '" target="_blank" rel="noopener noreferrer">공식 페이지 <span aria-hidden="true">↗</span><span class="lh-sr"> (새 창)</span></a></p>' : "")) +
      // 04 가이드
      block("04", "단계별 가이드", c.guide && c.guide.length ? '<ol class="td-steps">' + c.guide.map(function (g, i) { return '<li><em aria-hidden="true">' + String(i + 1).padStart(2, "0") + "</em><div><strong>" + esc(g.title) + "</strong><p>" + esc(g.body) + "</p></div></li>"; }).join("") + "</ol>" : "") +
      // 05 체크리스트
      block("05", "체크리스트", c.checklist && c.checklist.length ? '<ul class="td-checklist">' + c.checklist.map(function (x) { return "<li>" + esc(x.text) + "</li>"; }).join("") + "</ul>" +
        '<p class="lv-td-note">내 생활에 추가하면 항목을 확인하고 승인한 것만 할 일로 저장됩니다. 이 기기에만 저장됩니다.</p><div class="lv-td-actions">' + todoBtn + "</div>" : "", "td-d-check") +
      // 06 관련 라이프 스테이지
      block("06", "관련 라이프 스테이지", topics.length ? grid(topics.slice(0, 6).map(fromTopic)) : (st === "ready" ? "" : "")) +
      // 07 관련 콘텐츠
      block("07", "관련 콘텐츠", relContents.length ? grid(relContents) : "") +
      // 08 관련 서비스
      block("08", "관련 서비스", svcs.length ? '<p class="lv-td-note">서비스 유형 안내입니다. 제휴 업체·가격·예약은 아직 연결되지 않았습니다.</p>' + grid(svcs) : "") +
      // 09 정책·지원
      block("09", "관련 정책·지원", pols.length ? '<p class="lv-td-note">LIVON은 대상 여부를 판단하지 않습니다. 최신 공고와 조건은 공식 포털에서 확인하세요.</p>' + grid(pols) : "") +
      // 10 클래스·장소·기관
      block("10", "관련 클래스·장소·기관", exItems.length ? '<p class="lv-td-note">운영 시간·비용·신청은 각 기관의 공식 안내를 확인하세요.</p>' + grid(exItems) : "") +
      // 11 커뮤니티 (실제 글이 있을 때만)
      block("11", "커뮤니티 이야기", posts.length ? '<div class="lv-td-grid td-grid">' + posts.map(function (p) {
        return '<article class="lv-td-card td-card td-card--text" data-td-go="#cm-post-' + esc(p.id) + '"><div class="lv-td-card__body"><p class="lv-td-card__meta">커뮤니티 · 이 기기</p><h4><a href="#cm-post-' + esc(p.id) + '">' + esc(p.title) + "</a></h4><p>" + esc(String(p.body || "").slice(0, 90)) + "</p></div></article>";
      }).join("") + "</div>" : "") +
      // 12 다음 행동
      '<footer class="lv-ls-footer td-dfoot"><p>이 발견을 나의 생활로 이어가세요.</p><div class="lv-td-actions">' + saveBtn(item) + todoBtn + aiBtn("lv-td-btn") +
        (topics[0] ? '<a class="lv-td-btn lv-td-btn--ghost" href="#life/' + esc(topics[0].stageSlug) + "/" + esc(topics[0].slug) + '">라이프 스테이지에서 보기</a>' : "") +
        '<button type="button" class="lv-td-btn lv-td-btn--ghost" data-lh-compose="question">커뮤니티에 질문하기</button>' +
        '<button type="button" class="lv-td-btn lv-td-btn--ghost" data-lv-td-hide="' + esc(c.id) + '">관심 없음</button></div></footer>' +
      '<p class="lh-status td-status" data-lh-status role="status" aria-live="polite"></p>';
    return html;
  }

  function notFound(id) {
    return '<nav class="td-crumbs" aria-label="현재 위치"><ol><li><a href="#livon-home">LIVON</a></li><li><a href="#today">오늘의 발견</a></li><li><span aria-current="page">찾을 수 없음</span></li></ol></nav>' +
      '<h2 class="lv-td-title lv-td-title--md" tabindex="-1" data-td-title-focus>콘텐츠를 찾을 수 없습니다.</h2>' +
      empty("주소가 바뀌었거나 삭제된 콘텐츠일 수 있습니다.", "오늘의 발견에서 다시 찾아 주세요.", '<a class="lv-td-btn lv-td-btn--sm" href="#today">오늘의 발견으로</a>');
  }

  var detailId = null, prevHash = "";
  window.addEventListener("hashchange", function (e) { try { prevHash = new URL(e.oldURL).hash; } catch (err) { prevHash = ""; } });
  function openDetail(id) {
    var root = $("#today"), sec = $("#td-detail"), host = $("[data-lv-td-detail]");
    if (!root || !sec || !host) return false;
    var c = contentById(id);
    detailId = id;
    root.classList.add("is-td-detail");
    sec.hidden = false; sec.classList.add("is-in");
    host.innerHTML = c ? renderDetail(c) : notFound(id);
    if (c) {
      pushRecent("td:" + c.id);
      setMeta(c.title + " · 오늘의 발견 | LivOn", c.blurb, shareUrl(c.id));
    } else restoreMeta();
    window.scrollTo(0, 0);
    var t = host.querySelector("[data-td-title-focus]"); if (t) t.focus({ preventScroll: true });
    return true;
  }
  function closeDetail() {
    var root = $("#today"), sec = $("#td-detail");
    if (root) root.classList.remove("is-td-detail");
    if (sec) sec.hidden = true;
    if (detailId) restoreMeta();
    detailId = null;
  }

  /* ───────── events ───────── */
  function goExplore(q, cat) {
    if (!window.LivonExplore || !window.LivonExplore.openResults) { location.hash = "explore"; return; }
    window.LivonExplore.openResults(q || "", { categoryId: cat || "", type: "all", region: "" });
  }
  function onClick(e) {
    var t = e.target;
    var el = t.closest("[data-td-tab],[data-td-tab-go],[data-td-more],[data-td-explore],[data-td-retry],[data-td-todos],[data-td-share],[data-td-back],[data-td-clear-recent],[data-td-key],[data-td-go]");
    if (!el || !el.closest("#today")) return;
    if (el.hasAttribute("data-td-tab")) { setTab(el.getAttribute("data-td-tab")); return; }
    if (el.hasAttribute("data-td-tab-go")) { setTab(el.getAttribute("data-td-tab-go")); var f = $("[data-td-feed-tabs]"); if (f) f.scrollIntoView({ block: "start" }); return; }
    if (el.hasAttribute("data-td-more")) { state.shown += PAGE; renderFeed(); return; }
    if (el.hasAttribute("data-td-explore")) { goExplore(el.getAttribute("data-td-explore"), el.getAttribute("data-td-explore-cat")); return; }
    if (el.hasAttribute("data-td-retry")) {
      var h = hub(); if (!h) return;
      h.repo.load(true).then(refresh, refresh); refresh();
      return;
    }
    if (el.hasAttribute("data-td-clear-recent")) { writeJSON(KEY_RECENT, []); renderFeed(); return; }
    if (el.hasAttribute("data-td-todos")) {
      var c = contentById(el.getAttribute("data-td-todos")); var hb = hub();
      if (c && hb && hb.todos) hb.todos.preview({ key: "today:" + c.id, title: c.title, note: "오늘의 발견 · " + c.title, sourceHref: "#today/" + c.id, source: "today", category: "오늘의 발견", items: c.checklist }, el);
      return;
    }
    if (el.hasAttribute("data-td-share")) {
      var sc = contentById(el.getAttribute("data-td-share")); if (!sc) return;
      var url = shareUrl(sc.id), msg = function (x) { var n = $("[data-lh-status]"); if (n) { n.textContent = ""; setTimeout(function () { n.textContent = x; }, 30); } };
      if (navigator.share) navigator.share({ title: sc.title + " · LIVON", text: sc.blurb, url: url }).catch(function (err) { if (err && err.name !== "AbortError") msg("주소를 복사해 주세요: " + url); });
      else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { msg("링크를 복사했습니다: " + url); }, function () { msg("주소를 복사해 주세요: " + url); });
      else msg("주소를 복사해 주세요: " + url);
      return;
    }
    if (el.hasAttribute("data-td-back")) {
      e.preventDefault();
      if (/^#(today|td-(?!item-))/.test(prevHash) && !/^#today\//.test(prevHash)) history.back(); else location.hash = "today";
      return;
    }
    // card link / whole-card click
    if (el.hasAttribute("data-td-key") && (el.tagName === "A")) { pushRecent(el.getAttribute("data-td-key")); return; }
    var card = t.closest("[data-td-go]");
    if (card && !t.closest("a,button,input,label")) {
      var go = card.getAttribute("data-td-go");
      if (!go) return;
      if (card.hasAttribute("data-td-key")) pushRecent(card.getAttribute("data-td-key"));
      location.hash = go.replace(/^#/, "");
    }
  }
  function onKey(e) {
    var tab = e.target.closest && e.target.closest("[data-td-tab]");
    if (tab && (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End")) {
      e.preventDefault();
      var i = CATS.findIndex(function (c) { return c.id === tab.getAttribute("data-td-tab"); });
      var n = e.key === "Home" ? 0 : e.key === "End" ? CATS.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + CATS.length) % CATS.length;
      setTab(CATS[n].id, true);
    }
  }

  function refresh() {
    poolCache = null;
    if (detailId) { var c = contentById(detailId); var host = $("[data-lv-td-detail]"); if (c && host) host.innerHTML = renderDetail(c); }
    renderTabs(); renderFeed();
  }

  function init() {
    if (!$("#today")) return;
    renderTabs(); renderFeed();
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    var h = hub();
    if (h && h.onChange) h.onChange(function (status) { if (status === "ready" || status === "error") refresh(); });
    if (h && h.repo) h.repo.load().then(refresh, refresh);
  }

  window.LivonTodayFeed = {
    openDetail: openDetail, closeDetail: closeDetail, isDetailOpen: function () { return !!detailId; },
    render: refresh, setTab: setTab, recent: recent, pushRecent: pushRecent, profile: profile,
    _test: { pool: pool, catsOfContent: catsOfContent, catsOfTopic: catsOfTopic, listFor: listFor, relatedTopicsOf: relatedTopicsOf, score: score, saveKey: saveKey, CATS: CATS }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
