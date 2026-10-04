/*
 * LIVON Community Service — model, rules and storage adapters. No DOM.
 *
 *   Community UI (community-page.js)
 *        ↓
 *   LivonCommunityService        validation · search · For You rules · reports · related content
 *        ↓
 *   Community Adapter            one interface (ADAPTER_METHODS)
 *        ├─ Local Adapter        today: this browser only ("livon.cmStore.v1" through LivonUserData → storage guard)
 *        └─ Remote Adapter       future NEWON+ Community API — every call answers BACKEND_REQUIRED until it exists
 *
 * Data origins
 *   CURATED  groups, challenges, post types and rules shipped in community-data.js — read-only, never changed by a user action
 *   LOCAL    posts, comments, reactions, reports and the unsent draft written in this browser
 *   REMOTE   other people's posts — none exist yet, and none are invented
 *
 * The Local Admin reads the same model (snapshot / reportsView), so a report recorded here is the report reviewed there.
 * Personalization is not stored here: the profile belongs to LivonPersonalization (livon.lifeStage / lifeInterests / lifeEvents).
 */
(function (root) {
  "use strict";

  var STORE_KEY = "livon.cmStore.v1";
  var STORE_VERSION = 2;
  var LIMITS = { title: 80, body: 5000, tags: 8, tag: 20, comment: 1000, nick: 20 };
  var TYPES = ["question", "experience", "info", "review", "tip", "story"];
  var LEGACY_TYPES = ["meetup"];                       /* kept readable for old posts, not offered for new ones */
  var ORIGIN = { CURATED: "CURATED", LOCAL: "LOCAL", REMOTE: "REMOTE" };
  var REPORT_REASONS = [
    { id: "spam", label: "스팸" }, { id: "inappropriate", label: "부적절한 콘텐츠" }, { id: "harassment", label: "괴롭힘/비방" },
    { id: "misinformation", label: "잘못된 정보" }, { id: "other", label: "기타" }
  ];
  /* reasons recorded by an earlier build */
  var LEGACY_REASON = { "스팸·광고": "spam", "욕설·혐오 표현": "harassment", "개인정보 노출": "inappropriate", "허위·위험한 정보": "misinformation" };
  var ADAPTER_METHODS = ["info", "loadStore", "saveStore", "follows", "setFollow", "submitReport"];
  /* short community guidelines (shown on the page; not a legal document) */
  var GUIDELINES = [
    { title: "서로 존중하기", text: "생각이 달라도 사람을 깎아내리지 않습니다." },
    { title: "개인정보 지키기", text: "실명·연락처·주소·계좌 같은 정보는 본인 것도, 다른 사람 것도 적지 않습니다." },
    { title: "스팸·광고 금지", text: "홍보나 반복 게시물은 올리지 않습니다." },
    { title: "불법·유해한 내용 금지", text: "불법 행위, 혐오, 위험한 행동을 부추기는 내용은 올리지 않습니다." },
    { title: "잘못된 정보 주의", text: "경험과 사실을 구분해서 쓰고, 건강·돈·법률 문제는 전문가와 확인합니다." },
    { title: "문제가 보이면 신고", text: "글과 댓글의 ‘신고’로 기록할 수 있습니다. 지금은 이 기기에만 기록됩니다." }
  ];
  var IMAGE_OK = /^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]/;   /* only an embedded bitmap may be used as an image source */
  var ID_OK = /^[A-Za-z0-9_.:\-]{1,80}$/;   /* ids are generated here; anything else in storage is not a record */
  var TAG_OK = /^[\p{L}\p{N}][\p{L}\p{N} ·_\-]*$/u;

  function isObj(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function str(v) { return typeof v === "string" ? v : ""; }
  function num(v) { return typeof v === "number" && isFinite(v) ? v : 0; }
  function uniq(list) { var seen = {}; return list.filter(function (x) { if (typeof x !== "string" || !x || seen[x]) return false; seen[x] = 1; return true; }); }
  function validStage(v) { v = String(v == null ? "" : v); return /^[1-7]0$/.test(v) ? v : ""; }

  /* ───────── Life Events: the existing catalog, read only ───────── */
  function lifeEvents() {
    var list = root.LivonLifeEvents && Array.isArray(root.LivonLifeEvents.events) ? root.LivonLifeEvents.events : [];
    return list.filter(function (e) { return e && typeof e.id === "string" && typeof e.title === "string"; });
  }
  function eventById(id) { return lifeEvents().filter(function (e) { return e.id === id; })[0] || null; }
  function validEvent(id) { id = str(id); return id && eventById(id) ? id : ""; }
  /* events offered in the composer / filter: those of the chosen band first, or the whole catalog */
  function eventsForStage(stage) {
    var st = validStage(stage), list = lifeEvents();
    return st ? list.filter(function (e) { return (e.stages || []).indexOf(st) >= 0; }) : list;
  }

  /* ───────── store ───────── */
  function emptyStore() {
    return { v: STORE_VERSION, profile: { nick: "나", bio: "", interests: [] }, posts: [], comments: [], likes: {}, commentLikes: {}, saves: [], joined: [],
      challenges: {}, blocked: [], reports: [], drafts: [], region: "", compose: null };
  }
  /* Whatever is in storage, the UI gets a store of the expected shape. Unreadable entries are dropped (and counted),
     never trusted; valid entries and unknown extra fields are kept as they are. */
  function normalizeStore(raw) {
    var problems = [];
    if (raw != null && !isObj(raw)) problems.push("malformed-store");
    var s = isObj(raw) ? raw : emptyStore();
    function list(key, ok) {
      var a = Array.isArray(s[key]) ? s[key] : [];
      if (s[key] != null && !Array.isArray(s[key])) problems.push("malformed-" + key);
      var out = a.filter(ok);
      if (out.length !== a.length) problems.push("dropped-" + key + ":" + (a.length - out.length));
      s[key] = out;
    }
    function map(key) { if (!isObj(s[key])) { if (s[key] != null) problems.push("malformed-" + key); s[key] = {}; } }
    /* an id is a record's identity: the first record with an id wins, later copies are dropped (and counted) */
    function firstOfId() { var seen = {}; return function (x) { if (seen[x.id]) return false; seen[x.id] = 1; return true; }; }
    list("posts", function (p) { return isObj(p) && typeof p.id === "string" && ID_OK.test(p.id); });
    var postOnce = firstOfId(), np = s.posts.length;
    s.posts = s.posts.filter(postOnce);
    if (s.posts.length !== np) problems.push("duplicate-posts:" + (np - s.posts.length));
    /* only wrong values are repaired; a field an older build never wrote is left absent */
    s.posts.forEach(function (p) {
      if (typeof p.title !== "string") p.title = "";
      if (typeof p.body !== "string") p.body = "";
      if ("tags" in p) p.tags = uniq(Array.isArray(p.tags) ? p.tags.filter(function (t) { return typeof t === "string"; }) : []);
      if (TYPES.indexOf(p.type) < 0 && LEGACY_TYPES.indexOf(p.type) < 0) p.type = "story";
      if ("lifeStage" in p && p.lifeStage !== validStage(p.lifeStage)) p.lifeStage = validStage(p.lifeStage);
      if ("lifeEvent" in p && !/^[a-z0-9-]{1,40}$/.test(str(p.lifeEvent))) p.lifeEvent = "";
      if (p.image && !IMAGE_OK.test(str(p.image).slice(0, 48))) p.image = "";
    });
    list("comments", function (c) { return isObj(c) && typeof c.id === "string" && ID_OK.test(c.id) && typeof c.postId === "string"; });
    var commentOnce = firstOfId(), nc = s.comments.length;
    s.comments = s.comments.filter(commentOnce);
    if (s.comments.length !== nc) problems.push("duplicate-comments:" + (nc - s.comments.length));
    s.comments.forEach(function (c) { if (typeof c.body !== "string") c.body = ""; if ("parentId" in c && typeof c.parentId !== "string") c.parentId = ""; });
    list("reports", function (r) { return isObj(r) && typeof r.target === "string" && /^(post|comment):.+/.test(r.target) && typeof r.reason === "string"; });
    list("saves", function (x) { return typeof x === "string"; });
    list("blocked", function (x) { return typeof x === "string"; });
    if (Array.isArray(s.joined)) s.joined = s.joined.map(function (j) { return typeof j === "string" ? { id: j, at: 0 } : j; });
    list("joined", function (j) { return isObj(j) && typeof j.id === "string" && j.id; });
    map("likes"); map("commentLikes"); map("challenges");
    if (!isObj(s.profile)) s.profile = { nick: "나", bio: "", interests: [] };
    s.profile.nick = str(s.profile.nick).trim().slice(0, LIMITS.nick) || "나";
    s.compose = isObj(s.compose) ? s.compose : null;
    return { store: s, problems: problems };
  }

  /* ───────── origin: a local action may only change LOCAL records ───────── */
  function originOf(record) {
    if (!isObj(record)) return ORIGIN.CURATED;
    if (record.authorId === "local") return ORIGIN.LOCAL;
    return record.origin === ORIGIN.CURATED ? ORIGIN.CURATED : ORIGIN.REMOTE;
  }
  function canEdit(record) { return originOf(record) === ORIGIN.LOCAL; }

  /* ───────── validation ───────── */
  function parseTags(v) {
    var list = Array.isArray(v) ? v : String(v == null ? "" : v).split(",");
    list = uniq(list.map(function (t) { return String(t == null ? "" : t).trim().replace(/^#+/, "").replace(/\s+/g, " ").trim(); }).filter(Boolean));
    if (list.some(function (t) { return !TAG_OK.test(t); })) return { error: "태그에는 글자, 숫자, 띄어쓰기만 쓸 수 있어요." };
    if (list.length > LIMITS.tags) return { error: "태그는 " + LIMITS.tags + "개까지 입력할 수 있어요." };
    if (list.some(function (t) { return t.length > LIMITS.tag; })) return { error: "태그 하나는 " + LIMITS.tag + "자 이하로 입력해 주세요." };
    return { list: list };
  }
  /* a draft only needs something to keep; publishing needs a type, a title and a body */
  /* invisible control characters (other than line breaks and tabs) are refused: they hide text and break display */
  var CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/;
  function validatePost(input) {
    input = input || {};
    var title = str(input.title).trim(), body = str(input.body).trim();
    if (CONTROL_RE.test(title)) return { field: "title", msg: "제목에 보이지 않는 제어 문자가 있어요. 지우고 다시 입력해 주세요." };
    if (CONTROL_RE.test(body)) return { field: "body", msg: "본문에 보이지 않는 제어 문자가 있어요. 지우고 다시 입력해 주세요." };
    if (input.type != null && input.type !== "" && TYPES.indexOf(input.type) < 0 && LEGACY_TYPES.indexOf(input.type) < 0) return { field: "type", msg: "글 유형을 다시 선택해 주세요." };
    if (input.draft && !title && !body) return { field: "title", msg: "임시 저장할 제목이나 본문을 입력해 주세요." };
    if (!title && !input.draft) return { field: "title", msg: "제목을 입력해 주세요." };
    if (title.length > LIMITS.title) return { field: "title", msg: "제목은 " + LIMITS.title + "자 이하로 입력해 주세요." };
    if (!body && !input.draft) return { field: "body", msg: "본문을 입력해 주세요." };
    if (body.length > LIMITS.body) return { field: "body", msg: "본문은 " + LIMITS.body + "자 이하로 입력해 주세요." };
    var tags = parseTags(input.tags);
    if (tags.error) return { field: "tags", msg: tags.error };
    return null;
  }
  function validateComment(body) {
    body = str(body).trim();
    if (!body) return { msg: "댓글 내용을 입력해 주세요." };
    if (CONTROL_RE.test(body)) return { msg: "댓글에 보이지 않는 제어 문자가 있어요. 지우고 다시 입력해 주세요." };
    if (body.length > LIMITS.comment) return { msg: "댓글은 " + LIMITS.comment + "자 이하로 입력해 주세요." };
    return null;
  }

  /* ───────── search: title · body · type · tags · Life Stage · Life Event ───────── */
  function norm(s) {
    s = String(s == null ? "" : s);
    try { s = s.normalize("NFC"); } catch (e) {}
    return s.toLowerCase().replace(/\s+/g, " ").trim();
  }
  function stageLabel(id) { return validStage(id) ? (id === "70" ? "70대 이상" : id + "대") : ""; }
  function searchText(p, labels) {
    labels = labels || {};
    var ev = eventById(p.lifeEvent);
    return norm([p.title, p.body, (p.tags || []).join(" "), labels.type, labels.category, stageLabel(p.lifeStage), ev ? ev.title : "", p.region, p.field].join(" "));
  }
  /* every word of the query must be in the post; spaces inside words are ignored (첫취업 = 첫 취업) */
  function matchesQuery(p, q, labels) {
    q = norm(String(q == null ? "" : q).replace(/#/g, " "));
    if (!q) return true;
    var tight = searchText(p, labels).replace(/ /g, "");
    return q.split(" ").every(function (t) { return tight.indexOf(t) >= 0; });
  }

  /* ───────── For You: local rules over the onboarding profile. No AI, no popularity. ─────────
     signal                      weight   reason shown
     post Life Event chosen        4      선택한 ‘육아’ 관련
     Life Event words in the post  2      선택한 ‘육아’ 관련
     post Life Stage = mine        3      30대 글
     category of an interest       2      관심사 ‘가족’
     interest word in the post     1      관심사 ‘가족’
     category of a joined group    1      가입한 커뮤니티 주제
     A post written for another age band, or about a family-formation event outside the reader's band, is never boosted. */
  function ageContextOk(post, stage, labels) {
    var st = validStage(stage);
    if (!st) return true;
    if (post.lifeStage && post.lifeStage !== st) return false;
    var ev = eventById(post.lifeEvent);
    if (ev && (ev.stages || []).length && ev.stages.indexOf(st) < 0) return false;
    var PZ = root.LivonPersonalization;
    if (PZ && typeof PZ.textAgeOk === "function") {
      var text = [post.title, (post.tags || []).join(" "), labels && labels.category].join(" ");
      if (!PZ.textAgeOk(text, st)) return false;
    }
    return true;
  }
  function whyText(r) {
    if (!r) return "";
    if (r.type === "event") return "선택한 ‘" + r.label + "’ 관련";
    if (r.type === "stage") return r.label + " 글";
    if (r.type === "interest") return "관심사 ‘" + r.label + "’";
    if (r.type === "joined") return "가입한 커뮤니티 주제";
    return "";
  }
  /* sig: { stage, interests[], events[], cats{categoryId: interest}, joinedCats{categoryId: 1} } */
  function forYou(post, sig, labels) {
    var out = { score: 0, reasons: [], why: "" };
    sig = sig || {};
    if (!ageContextOk(post, sig.stage, labels)) return out;
    var PZ = root.LivonPersonalization, events = Array.isArray(sig.events) ? sig.events : [];
    var blob = [post.title, (post.tags || []).join(" ")].join(" ");
    if (post.lifeEvent && events.indexOf(post.lifeEvent) >= 0) {
      var ev = eventById(post.lifeEvent);
      out.score += 4; out.reasons.push({ type: "event", value: post.lifeEvent, label: ev ? ev.title : post.lifeEvent });
    } else if (PZ && events.length && typeof PZ.eventBoost === "function") {
      var hit = PZ.eventBoost(blob, events);
      if (hit) { out.score += 2; out.reasons.push({ type: "event", value: hit.value, label: hit.label }); }
    }
    if (sig.stage && post.lifeStage === sig.stage) { out.score += 3; out.reasons.push({ type: "stage", value: sig.stage, label: stageLabel(sig.stage) }); }
    var cats = sig.cats || {}, named = null;
    if (post.category && cats[post.category]) { out.score += 2; named = typeof cats[post.category] === "string" ? cats[post.category] : ""; if (named) out.reasons.push({ type: "interest", value: named, label: named }); }
    if (post.category && sig.joinedCats && sig.joinedCats[post.category]) { out.score += 1; out.reasons.push({ type: "joined", value: post.category, label: "" }); }
    var word = (sig.interests || []).filter(function (i) { return i && blob.indexOf(i) >= 0; })[0];
    if (word) { out.score += 1; if (word !== named) out.reasons.push({ type: "interest", value: word, label: word }); }
    out.why = whyText(out.reasons[0]);
    return out;
  }

  /* ───────── reports: a local record. Nothing is sent to anyone. ───────── */
  function reasonOf(v) {
    v = str(v);
    var id = LEGACY_REASON[v] || v;
    return REPORT_REASONS.filter(function (r) { return r.id === id || r.label === v; })[0] || null;
  }
  function targetOf(store, target) {
    var m = /^(post|comment):(.+)$/.exec(str(target));
    if (!m) return null;
    var rec = m[1] === "post" ? store.posts.filter(function (p) { return p.id === m[2] && !p.deleted; })[0] : store.comments.filter(function (c) { return c.id === m[2] && !c.deleted; })[0];
    return { kind: m[1], id: m[2], record: rec || null };
  }
  /* the same target + the same reason is recorded once */
  function addReport(store, target, reason, id, now) {
    var r = reasonOf(reason);
    if (!r) return { status: "invalid", msg: "신고 사유를 선택해 주세요." };
    var t = targetOf(store, target);
    if (!t) return { status: "invalid", msg: "신고할 대상을 찾을 수 없어요." };
    if (!t.record) return { status: "missing", msg: "이미 삭제된 글이나 댓글이에요." };
    var dup = store.reports.filter(function (x) { return x.target === target && (reasonOf(x.reasonId || x.reason) || {}).id === r.id; })[0];
    if (dup) return { status: "duplicate", report: dup, msg: "같은 사유로 이미 기록한 신고예요." };
    var rec = { id: id, target: target, reason: r.label, reasonId: r.id, at: now, status: "local-only" };
    store.reports.push(rec);
    return { status: "ok", report: rec };
  }
  /* what a reviewer needs: the reason, when, and whether the reported item still exists */
  function reportsView(store) {
    return store.reports.map(function (x) {
      var t = targetOf(store, x.target) || { kind: "post", id: "", record: null }, r = reasonOf(x.reasonId || x.reason);
      var rec = t.record;
      return { id: str(x.id), target: x.target, kind: t.kind, targetId: t.id, reasonId: r ? r.id : "other", reason: r ? r.label : str(x.reason),
        at: num(x.at), status: "local-only", exists: !!rec, title: rec ? (t.kind === "post" ? str(rec.title) : str(rec.body)).slice(0, 80) : "" };
    }).sort(function (a, b) { return b.at - a.at; });
  }

  /* ───────── local activity: what was done in this browser. Not an account profile. ───────── */
  function activity(store) {
    var live = function (p) { return p && !p.deleted; };
    return {
      posts: store.posts.filter(function (p) { return live(p) && !p.draft && p.authorId === "local"; }),
      drafts: store.posts.filter(function (p) { return live(p) && p.draft; }),
      comments: store.comments.filter(function (c) { return live(c) && c.authorId === "local"; }),
      reacted: Object.keys(store.likes).map(function (id) { return store.posts.filter(function (p) { return p.id === id && live(p); })[0]; }).filter(Boolean),
      reports: store.reports.length
    };
  }

  /* ───────── related content: only relations that exist in the Data Platform ─────────
     post.lifeTopicId → that topic and what it links to (guides, policies, services, programs)
     post.lifeEvent   → the topics written for that Life Event (in the post's band when it has one)
     Nothing is guessed from the text of a post. */
  var REL_KIND = { contentIds: "가이드", policyIds: "정책·제도", serviceIds: "서비스", classIds: "프로그램" };
  var topicIndex = { repo: null, byEvent: null };
  function platformRepo() {
    var SD = root.LivonScreenData;
    if (!SD || typeof SD.repository !== "function") return null;
    try { return SD.repository(); } catch (e) { return null; }
  }
  function safeHref(h) { h = str(h); return /^#[\w\-./?=&%]*$/.test(h) || /^https:\/\/[^\s"'<>]+$/.test(h) ? h : ""; }
  function topicsByEvent(r) {
    if (topicIndex.repo === r && topicIndex.byEvent) return topicIndex.byEvent;
    var map = {};
    try {
      r.all().forEach(function (e) { if (e && /^topic:/.test(String(e.id))) (e.lifeEvents || []).forEach(function (id) { (map[id] = map[id] || []).push(e); }); });
    } catch (e) { map = {}; }
    topicIndex = { repo: r, byEvent: map };
    return map;
  }
  function relatedContent(post, limit) {
    var r = platformRepo(), out = [], seen = {};
    if (!r || !isObj(post)) return out;
    function add(e, kind) {
      if (!e || seen[e.id]) return;
      var href = safeHref(e.href);
      if (!href || !e.title) return;
      seen[e.id] = 1;
      out.push({ id: e.id, title: String(e.title), href: href, kind: kind, external: href.charAt(0) !== "#" });
    }
    var get = function (id) { try { return r.getById(id); } catch (e) { return null; } };
    var topic = post.lifeTopicId ? get("topic:" + post.lifeTopicId) : null;
    if (topic) {
      add(topic, "주제");
      var rel = topic.relations || {};
      Object.keys(REL_KIND).forEach(function (k) { (Array.isArray(rel[k]) ? rel[k] : []).slice(0, 2).forEach(function (id) { add(get(id), REL_KIND[k]); }); });
    }
    if (post.lifeEvent && eventById(post.lifeEvent)) {
      (topicsByEvent(r)[post.lifeEvent] || []).filter(function (t) { return !post.lifeStage || (t.lifeStages || []).indexOf(post.lifeStage) >= 0; })
        .slice(0, 3).forEach(function (t) { add(t, "주제"); });
    }
    return out.slice(0, limit || 6);
  }

  /* ───────── adapters ───────── */
  function defaultIO() {
    return {
      read: function (key, fb) {
        var UD = root.LivonUserData;
        if (UD && typeof UD.read === "function") return UD.read(key, fb);
        var raw = root.localStorage.getItem(key);   /* throws when storage is blocked → the adapter switches to memory */
        try { return raw ? JSON.parse(raw) : fb; } catch (e) { return "malformed"; }
      },
      write: function (key, value) {
        var UD = root.LivonUserData;
        if (UD && typeof UD.write === "function") return UD.write(key, value) !== false;
        root.localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
    };
  }
  /* Local adapter. If the browser refuses storage altogether (and no storage guard is installed), the store lives in
     memory for this tab so writing, drafting and reading still work; a full quota is reported, not hidden. */
  function createLocalAdapter(io) {
    io = io || defaultIO();
    var mem = null, problems = [];
    function read() {
      if (mem) return mem;
      try { return io.read(STORE_KEY, null); } catch (e) { mem = emptyStore(); return mem; }
    }
    return {
      kind: "local",
      info: function () { return { kind: "local", key: STORE_KEY, persistent: !mem && !(Array.isArray(root.LIVON_STORAGE_FALLBACK) && root.LIVON_STORAGE_FALLBACK.indexOf("localStorage") >= 0), problems: problems.slice() }; },
      loadStore: function () {
        var raw = read(), n = normalizeStore(raw);
        if (n.problems.length) problems = n.problems;
        return { store: n.store, existed: raw != null, problems: n.problems };
      },
      saveStore: function (store) {
        if (mem) { mem = store; return true; }
        try { return io.write(STORE_KEY, store) !== false; } catch (e) { return false; }
      },
      /* following needs other people's accounts: there are none on a device */
      follows: function () { return { available: false, status: "ACCOUNT_REQUIRED", list: [] }; },
      setFollow: function () { return { status: "unavailable", reason: "ACCOUNT_REQUIRED" }; },
      /* a report stays in this browser; a remote adapter would deliver it to moderators */
      submitReport: function () { return { status: "local-only" }; }
    };
  }
  function createRemoteAdapter(config) {
    var a = { kind: "remote", config: { baseUrl: (config && config.baseUrl) || null } };
    ADAPTER_METHODS.forEach(function (m) { a[m] = function () { var e = new Error("BACKEND_REQUIRED"); e.code = "BACKEND_REQUIRED"; throw e; }; });
    return a;
  }
  var current = null;
  function adapter() { return current || (current = createLocalAdapter()); }
  function useAdapter(a) {
    if (!a || ADAPTER_METHODS.some(function (m) { return typeof a[m] !== "function"; })) throw new Error("INVALID_COMMUNITY_ADAPTER");
    current = a;
    return a;
  }

  /* Read-only view for tools in the same browser (Local Admin). The stored value is never modified. */
  function snapshot(raw) {
    if (raw == null) return { available: false, reason: "no community activity stored in this browser" };
    var o;
    try { o = typeof raw === "string" ? JSON.parse(raw) : JSON.parse(JSON.stringify(raw)); } catch (e) { return { available: false, reason: "community store is malformed (left untouched)" }; }
    if (!isObj(o)) return { available: false, reason: "community store is malformed (left untouched)" };
    var n = normalizeStore(o), s = n.store;
    return { available: true, problems: n.problems,
      posts: s.posts.map(function (p) { return { id: p.id, title: p.title.slice(0, 80), type: p.type, visibility: p.visibility || "public", deleted: !!p.deleted, draft: !!p.draft, category: str(p.category), lifeStage: p.lifeStage, lifeEvent: p.lifeEvent, origin: originOf(p), createdAt: p.createdAt || null }; }),
      comments: s.comments.length, reports: s.reports.length, reportList: reportsView(s), saves: s.saves.length, joined: s.joined.length };
  }


  /* ───────── Community V2: delivery state ─────────
     A post written here has never left this device. Nothing calls it "published": the honest states are
       DRAFT       임시 저장 — only in 내 활동, never in the feed or in search
       LOCAL_ONLY  이 기기에만 저장됨 — shown in this browser's feed; no other person can see it
     and, once a Community server exists (RemoteCommunityRepository):
       PENDING     sent, waiting for the server's answer
       DELIVERED   the server accepted it (then its moderation state decides whether others see it) */
  var DELIVERY = { DRAFT: "DRAFT", LOCAL_ONLY: "LOCAL_ONLY", PENDING: "PENDING", DELIVERED: "DELIVERED" };
  var DELIVERY_LABEL = { DRAFT: "임시 저장 · 이 기기", LOCAL_ONLY: "이 기기에만 저장됨", PENDING: "전송 중", DELIVERED: "서버에 저장됨" };
  function deliveryOf(post) {
    if (!isObj(post)) return DELIVERY.LOCAL_ONLY;
    if (post.draft) return DELIVERY.DRAFT;
    if (originOf(post) === ORIGIN.REMOTE && (post.delivery === DELIVERY.PENDING || post.delivery === DELIVERY.DELIVERED)) return post.delivery;
    return DELIVERY.LOCAL_ONLY;   /* a local record is LOCAL_ONLY whatever a stored field claims */
  }
  function deliveryLabel(post) { return DELIVERY_LABEL[deliveryOf(post)]; }
  var DELIVERY_NOTE = "아직 다른 사용자에게 공개되지 않았어요. 커뮤니티 서버가 준비 중이라 지금은 이 기기에서만 볼 수 있어요.";

  /* ───────── moderation (server-side, future) ─────────
     ACTIVE · UNDER_REVIEW · HIDDEN · REMOVED are decided by the server and a moderator role only.
     A local record is never moderated on the device: it is always ACTIVE here. The local Admin's marks stay in the Admin. */
  var MODERATION_STATES = ["ACTIVE", "UNDER_REVIEW", "HIDDEN", "REMOVED"];
  function moderationOf(record) {
    if (originOf(record) === ORIGIN.REMOTE && MODERATION_STATES.indexOf(record && record.moderation) >= 0) return record.moderation;
    return "ACTIVE";
  }

  /* ───────── what works now, and what needs an account / server ─────────
     LOCAL             works in this browser today
     ACCOUNT_REQUIRED  needs a Newon+ account (and the Community server) — the UI says so, nothing is simulated */
  var FEATURES = {
    posts: "LOCAL", drafts: "LOCAL", comments: "LOCAL", replies: "LOCAL", myReaction: "LOCAL", saved: "LOCAL", search: "LOCAL", myActivity: "LOCAL",
    reportRecord: "LOCAL",
    publicPosts: "ACCOUNT_REQUIRED", othersComments: "ACCOUNT_REQUIRED", reactionTotals: "ACCOUNT_REQUIRED", profile: "ACCOUNT_REQUIRED",
    follow: "ACCOUNT_REQUIRED", block: "ACCOUNT_REQUIRED", reportDelivery: "ACCOUNT_REQUIRED", moderation: "ACCOUNT_REQUIRED", notifications: "ACCOUNT_REQUIRED"
  };
  var ACCOUNT_REQUIRED_MSG = "다른 사용자 계정이 필요한 기능이라 아직 준비 중입니다.";
  function featureStatus(name) { return FEATURES[name] || "NOT_IMPLEMENTED"; }
  /* block needs other people's verified accounts — there are none on a device, so nothing is "blocked" locally */
  function block() { return { status: "unavailable", reason: "ACCOUNT_REQUIRED", msg: ACCOUNT_REQUIRED_MSG }; }
  function profile() { return { available: false, status: "ACCOUNT_REQUIRED", msg: ACCOUNT_REQUIRED_MSG }; }
  /* no event producer exists: the Community creates no notification of any kind */
  var NOTIFICATION_EVENTS = ["COMMENT_CREATED", "REPLY_CREATED", "FOLLOWED", "REACTION_RECEIVED", "REPORT_RESOLVED"];
  function notifications() { return { available: false, producer: "NONE", status: "ACCOUNT_REQUIRED", list: [] }; }

  /* ───────── sort and filters: facts only (dates); nothing is ranked by engagement ───────── */
  var SORTS = [{ id: "new", label: "최신순" }, { id: "updated", label: "최근 수정순" }];
  function sortPosts(list, sort) {
    var key = sort === "updated" ? function (p) { return num(p.updatedAt) || num(p.createdAt); } : function (p) { return num(p.createdAt); };
    return list.slice().sort(function (a, b) { return key(b) - key(a); });
  }

  /* ───────── 내 활동 search: my posts, my drafts and my comments on this device ─────────
     Separate from the LIVON-wide search: drafts and private posts are found here and nowhere else. */
  function searchActivity(store, q, labelsOf) {
    var a = activity(store), Q = norm(q);
    var lab = typeof labelsOf === "function" ? labelsOf : function () { return {}; };
    if (!Q) return { q: "", posts: [], drafts: [], comments: [], total: 0 };
    var mine = store.posts.filter(function (p) { return p && !p.deleted && !p.draft && p.authorId === "local"; });
    var res = {
      q: Q,
      posts: mine.filter(function (p) { return matchesQuery(p, Q, lab(p)); }),
      drafts: a.drafts.filter(function (p) { return matchesQuery(p, Q, lab(p)); }),
      comments: a.comments.filter(function (c) { var t = norm(c.body).replace(/ /g, ""); return Q.split(" ").every(function (w) { return t.indexOf(w) >= 0; }); })
    };
    res.total = res.posts.length + res.drafts.length + res.comments.length;
    return res;
  }

  /* The future server contract (routes, identity, authorization, RemoteCommunityRepository) lives in
     community-remote.js. It is not loaded by the public page: nothing in the browser talks to a Community server. */

  root.LivonCommunityService = {
    STORE_KEY: STORE_KEY, STORE_VERSION: STORE_VERSION, LIMITS: LIMITS, TYPES: TYPES.slice(), LEGACY_TYPES: LEGACY_TYPES.slice(), ORIGIN: ORIGIN,
    REPORT_REASONS: REPORT_REASONS.map(function (r) { return { id: r.id, label: r.label }; }), ADAPTER_METHODS: ADAPTER_METHODS.slice(),
    GUIDELINES: GUIDELINES.map(function (g) { return { title: g.title, text: g.text }; }),
    emptyStore: emptyStore, normalizeStore: normalizeStore, originOf: originOf, canEdit: canEdit,
    validatePost: validatePost, validateComment: validateComment, parseTags: parseTags,
    norm: norm, searchText: searchText, matchesQuery: matchesQuery, stageLabel: stageLabel, validStage: validStage,
    lifeEvents: lifeEvents, eventById: eventById, validEvent: validEvent, eventsForStage: eventsForStage,
    ageContextOk: ageContextOk, forYou: forYou, whyText: whyText,
    reasonOf: reasonOf, addReport: addReport, reportsView: reportsView, activity: activity, relatedContent: relatedContent, safeHref: safeHref,
    createLocalAdapter: createLocalAdapter, createRemoteAdapter: createRemoteAdapter, adapter: adapter, useAdapter: useAdapter, snapshot: snapshot,
    /* Community V2 */
    DELIVERY: DELIVERY, DELIVERY_NOTE: DELIVERY_NOTE, deliveryOf: deliveryOf, deliveryLabel: deliveryLabel,
    MODERATION_STATES: MODERATION_STATES.slice(), moderationOf: moderationOf,
    FEATURES: FEATURES, featureStatus: featureStatus, ACCOUNT_REQUIRED_MSG: ACCOUNT_REQUIRED_MSG, block: block, profile: profile,
    NOTIFICATION_EVENTS: NOTIFICATION_EVENTS.slice(), notifications: notifications,
    SORTS: SORTS.map(function (x) { return { id: x.id, label: x.label }; }), sortPosts: sortPosts, searchActivity: searchActivity,
    CONTROL_RE: CONTROL_RE
  };
})(typeof window !== "undefined" ? window : globalThis);
