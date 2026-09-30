/*
 * LIVON Community V1 — local-first.
 *
 *   UI (this file)  ↕  Repo (window.LivonCommunityRepo)  ↕  localStorage "livon.cmStore.v1"
 *
 * Only posts / comments / reactions / reports written on this device exist. No sample posts,
 * users, counts or popularity are generated. When a Newon+ account and Community API exist,
 * Repo is the single place to swap (see TODO(API) notes).
 * Saves go through the shared LivonPlatform store (id "life-hub:community:cm:{postId}").
 */
(function () {
  var DATA = window.LivonCommunityData || { communities: [], challenges: [], typeLabels: {}, questionFields: [], interests: [], regions: [], rules: [] };
  var STORE_KEY = "livon.cmStore.v1";
  var KEY_LEGACY_JOINED = "livon.cmJoined";
  var KEY_LEGACY_INTERESTS = "livon.cmInterests";
  var KEY_ML = "livon.mlStore.v1";
  var KEY_STAGE = "livon.lifeStage";
  var KEY_LIFE_INTERESTS = "livon.lifeInterests";
  var KEY_TD_PREFS = "livon.tdPrefs";
  var KEY_FEED_SCROLL = "livon.cmFeedScroll";
  var STORE_VERSION = 2;
  var LIMITS = { title: 80, body: 5000, tags: 8, tag: 20, comment: 1000 };
  var PAGE = 10;
  var SITE_ORIGIN = "https://www.newon.app";
  var STAGES = [
    { id: "10", slug: "10s", label: "10대" }, { id: "20", slug: "20s", label: "20대" }, { id: "30", slug: "30s", label: "30대" },
    { id: "40", slug: "40s", label: "40대" }, { id: "50", slug: "50s", label: "50대" }, { id: "60", slug: "60s", label: "60대" },
    { id: "70", slug: "70s", label: "70대 이상" }
  ];
  /* compose types (existing typeLabels, "모임 관련" is kept only for old posts) */
  var COMPOSE_TYPES = ["question", "experience", "info", "review", "tip", "story"];
  var REPORT_REASONS = ["스팸·광고", "욕설·혐오 표현", "개인정보 노출", "허위·위험한 정보", "기타"];
  var TABS = [{ id: "foryou", label: "For You" }, { id: "latest", label: "최신" }, { id: "following", label: "팔로잉" }];
  /* legacy post.field / communityId → shared category id (one-time migration only) */
  var FIELD_CAT = {
    "교육·진로": "learn", "취업·커리어": "career", "독립·주거": "housing", "생활비·금융": "money", "가족·육아": "parenting",
    "건강·운동": "health", "취미·여가": "hobby", "여행·문화": "travel", "지역 생활": "daily", "시니어 생활": "daily", "기타": "etc"
  };
  var COMM_CAT = {
    "c-daily": "daily", "c-edu": "learn", "c-career": "career", "c-home": "housing", "c-money": "money", "c-family": "parenting",
    "c-health": "health", "c-hobby": "hobby", "c-travel": "travel", "c-food": "hobby", "c-pet": "daily", "c-local": "daily",
    "c-senior": "daily", "c-challenge": "etc"
  };

  var state = {
    tab: "latest", cat: "", type: "", stage: "", q: "", shown: PAGE,
    detailId: "", editingId: null, composeType: "story", dirty: false,
    lastFeedHash: "#cm-home", modalOpener: null, replyTo: "", editCommentId: ""
  };
  var bound = false;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  /* stored value must keep the shape the caller expects (old schema / corrupted data → fallback, null entries dropped) */
  function fitShape(v, fb) { if (Array.isArray(fb)) return Array.isArray(v) ? v.filter(function (x) { return x != null; }) : fb; if (fb && typeof fb === "object") return v && typeof v === "object" && !Array.isArray(v) ? v : fb; return v; }
  function readJSON(key, fallback) {
    var UD = window.LivonUserData; if (UD) return UD.read(key, fallback);   /* repository → local adapter; Community stays COMMUNITY_LOCAL */
    try { var raw = localStorage.getItem(key); return fitShape(raw ? JSON.parse(raw) : fallback, fallback); } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    var UD = window.LivonUserData; if (UD) return UD.write(key, value);
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }
  function uniq(list) {
    var seen = {};
    return list.filter(function (x) { if (typeof x !== "string" || !x || seen[x]) return false; seen[x] = 1; return true; });
  }
  function reducedMotion() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function gnavOffset() {
    return (window.LivonStickyOffset ? window.LivonStickyOffset() : (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h"), 10) || 74) + 52) + 8;
  }
  function scrollToId(id, instant) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - gnavOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: instant || reducedMotion() ? "auto" : "smooth" });
  }
  function todayKey() {
    var d = new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  function fmtDate(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    if (isNaN(d)) return "";
    return d.getFullYear() + "." + (d.getMonth() + 1) + "." + d.getDate();
  }
  function announce(msg) {
    var n = $("[data-lv-cm-status]");
    if (!n) return;
    n.textContent = "";
    setTimeout(function () { n.textContent = msg; }, 30);
  }
  function typeLabel(t) { return (DATA.typeLabels && DATA.typeLabels[t]) || t || ""; }
  function stageById(id) { return STAGES.find(function (s) { return s.id === String(id || ""); }) || null; }

  /* Shared taxonomy: the unified search categories (LivonSearch.CATS) + 생활 / 기타 */
  function categories() {
    var C = window.LivonSearch && Array.isArray(window.LivonSearch.CATS) ? window.LivonSearch.CATS : [];
    return [{ id: "daily", label: "생활" }].concat(C.map(function (c) { return { id: c.id, label: c.label }; }), [{ id: "etc", label: "기타" }]);
  }
  function catLabel(id) {
    var c = categories().find(function (x) { return x.id === id; });
    return c ? c.label : "";
  }
  function catsOfText(text) {
    var C = window.LivonSearch && Array.isArray(window.LivonSearch.CATS) ? window.LivonSearch.CATS : [];
    return C.filter(function (c) { return c.re && c.re.test(text); }).map(function (c) { return c.id; });
  }
  /* Life Stage references are ids only ("20s.first-independence"); topic data is never copied */
  function lifeRepo() { return window.LivonLifeHub && window.LivonLifeHub.repo; }
  function topicOf(id) {
    var r = lifeRepo();
    return id && r && r.topic ? r.topic(id) : null;
  }
  function topicHref(id) {
    var m = /^([1-7]0s)\.([a-z0-9-]+)$/.exec(String(id || ""));
    return m ? "#life/" + m[1] + "/" + m[2] : "";
  }

  /* ───────── Store + migration ───────── */
  function emptyStore() {
    return {
      v: STORE_VERSION,
      profile: { nick: "나", bio: "", interests: [] },
      posts: [], comments: [], likes: {}, commentLikes: {}, saves: [], joined: [],
      challenges: {}, blocked: [], reports: [], drafts: [], region: ""
    };
  }
  function loadStore() {
    var raw = readJSON(STORE_KEY, null);
    var store = raw && typeof raw === "object" ? raw : null;
    if (!store) {
      store = emptyStore();
      var legacyJoined = readJSON(KEY_LEGACY_JOINED, []);
      var legacyInt = readJSON(KEY_LEGACY_INTERESTS, []);
      if (Array.isArray(legacyJoined) && legacyJoined.length) {
        store.joined = legacyJoined.map(function (x) {
          return typeof x === "string" ? { id: x, at: Date.now() } : { id: x.id, at: x.at || Date.now(), label: x.label || "" };
        });
      }
      if (Array.isArray(legacyInt)) store.profile.interests = legacyInt.slice(0, 20);
    }
    store.posts = Array.isArray(store.posts) ? store.posts : [];
    store.comments = Array.isArray(store.comments) ? store.comments : [];
    store.likes = store.likes && typeof store.likes === "object" ? store.likes : {};
    store.commentLikes = store.commentLikes && typeof store.commentLikes === "object" ? store.commentLikes : {};
    store.saves = Array.isArray(store.saves) ? store.saves : [];
    store.joined = Array.isArray(store.joined) ? store.joined : [];
    store.challenges = store.challenges && typeof store.challenges === "object" ? store.challenges : {};
    store.blocked = Array.isArray(store.blocked) ? store.blocked : [];
    store.reports = Array.isArray(store.reports) ? store.reports : [];
    store.profile = store.profile && typeof store.profile === "object" ? store.profile : { nick: "나", bio: "", interests: [] };
    if (migrate(store) || !raw) saveStore(store);
    return store;
  }
  function saveStore(store) {
    var ok = writeJSON(STORE_KEY, store);
    if (!ok) announce("이 기기의 저장 공간이 부족해 저장하지 못했습니다. 이미지가 큰 글을 정리해 주세요.");
    return ok;
  }
  /* v1 → v2, once, additive: nothing is deleted and ids are kept.
     - post.category from the old 질문 분야 / 커뮤니티, post.lifeStage from a stage community
     - local save list (store.saves, mlStore.savedCommunity) → shared LivonPlatform saves */
  function migrate(store) {
    if ((Number(store.v) || 1) >= STORE_VERSION) return false;
    var changed = false;
    store.posts.forEach(function (p) {
      if (!p || typeof p !== "object") return;
      if (!p.category) { p.category = FIELD_CAT[p.field] || COMM_CAT[p.communityId] || "etc"; changed = true; }
      if (!p.lifeStage && /^stage-[1-7]0$/.test(String(p.communityId || ""))) { p.lifeStage = String(p.communityId).slice(6); changed = true; }
      if (!p.createdAt && p.updatedAt) { p.createdAt = p.updatedAt; changed = true; }
    });
    var P = window.LivonPlatform;
    if (P && P.saveItem && P.listSaves) {
      var ml = readJSON(KEY_ML, null);
      var ids = store.saves.slice();
      if (ml && Array.isArray(ml.savedCommunity)) ml.savedCommunity.forEach(function (x) { if (x && x.id) ids.push(x.id); });
      uniq(ids).forEach(function (id) {
        var post = store.posts.find(function (p) { return p.id === id && !p.deleted; });
        if (!post) return;
        if (!P.listSaves("all").some(function (s) { return s.id === saveId(id); })) P.saveItem(saveItemOf(post));
      });
      /* converted to the shared store; keeping the old copies would make My Life show them twice */
      store.saves = [];
      if (ml && Array.isArray(ml.savedCommunity) && ml.savedCommunity.length) { ml.savedCommunity = []; writeJSON(KEY_ML, ml); }
      store.v = STORE_VERSION;
      return true;
    }
    /* LivonPlatform not ready yet: posts are migrated now, saves on the next load (v stays 1) */
    return changed;
  }

  /* ───────── Repo (swap point for a future Community API) ───────── */
  function isVisible(p, store) {
    if (!p || p.deleted || p.draft) return false;
    if (p.visibility === "private") return false;
    if (p.visibility === "members") return p.authorId === "local" || store.joined.some(function (j) { return j.id === p.communityId; });
    return true;
  }
  /* Searchable elsewhere (Explore / Life Stage / Today): public only — never drafts, private or members-only */
  function isSearchable(p) { return !!p && !p.deleted && !p.draft && p.id && p.title && (!p.visibility || p.visibility === "public"); }
  function validatePost(input) {
    var title = String(input.title || "").trim(), body = String(input.body || "").trim();
    /* a draft only needs something to keep; publishing needs title + body + category */
    if (input.draft && !title && !body) return { field: "title", msg: "임시 저장할 제목이나 본문을 입력해 주세요." };
    if (!title && !input.draft) return { field: "title", msg: "제목을 입력해 주세요." };
    if (title.length > LIMITS.title) return { field: "title", msg: "제목은 " + LIMITS.title + "자 이하로 입력해 주세요." };
    if (!body && !input.draft) return { field: "body", msg: "본문을 입력해 주세요." };
    if (body.length > LIMITS.body) return { field: "body", msg: "본문은 " + LIMITS.body + "자 이하로 입력해 주세요." };
    if (!input.draft && !input.category) return { field: "category", msg: "분야를 선택해 주세요." };
    var tags = parseTags(input.tags);
    if (tags.error) return { field: "tags", msg: tags.error };
    return null;
  }
  function parseTags(v) {
    var list = Array.isArray(v) ? v : String(v || "").split(",");
    list = uniq(list.map(function (t) { return String(t || "").replace(/^#/, "").trim(); }).filter(Boolean));
    if (list.length > LIMITS.tags) return { error: "태그는 " + LIMITS.tags + "개까지 입력할 수 있어요." };
    if (list.some(function (t) { return t.length > LIMITS.tag; })) return { error: "태그 하나는 " + LIMITS.tag + "자 이하로 입력해 주세요." };
    return { list: list };
  }
  function saveId(postId) { return "life-hub:community:cm:" + postId; }
  function saveItemOf(p) {
    return {
      id: saveId(p.id), title: p.title, label: p.title, type: "life-community", href: "#cm-post-" + p.id,
      source: "커뮤니티", lifeStage: p.lifeStage || "", data: { kind: "community", refId: "cm:" + p.id }
    };
  }
  function invalidateSearch() {
    /* Explore reads community posts fresh on every search; this only drops any cached index state */
    if (window.LivonSearch && typeof window.LivonSearch.invalidate === "function") window.LivonSearch.invalidate("community");
  }

  var Repo = {
    source: "local", /* TODO(API): "server" once Newon+ accounts and the Community API exist */
    load: loadStore,
    get: function (id) { return loadStore().posts.find(function (p) { return p.id === id && !p.deleted; }) || null; },
    visiblePosts: function () { var s = loadStore(); return s.posts.filter(function (p) { return isVisible(p, s); }); },
    searchablePosts: function () { return loadStore().posts.filter(isSearchable); },
    drafts: function () { return loadStore().posts.filter(function (p) { return p && !p.deleted && p.draft; }); },
    create: function (input) {
      var err = validatePost(input);
      if (err) return { status: "invalid", field: err.field, msg: err.msg };
      var store = loadStore(), now = Date.now();
      var post = {
        id: uid("post"), type: COMPOSE_TYPES.indexOf(input.type) >= 0 || input.type === "meetup" ? input.type : "story",
        title: String(input.title).trim(), body: String(input.body).trim(), tags: parseTags(input.tags).list,
        category: input.category || "", lifeStage: stageById(input.lifeStage) ? String(input.lifeStage) : "",
        lifeTopicId: input.lifeTopicId && topicHref(input.lifeTopicId) ? input.lifeTopicId : "",
        field: "", communityId: input.communityId || "", region: input.region || "",
        visibility: ["public", "members", "private"].indexOf(input.visibility) >= 0 ? input.visibility : "public",
        image: input.image || "", authorNick: store.profile.nick || "나", authorId: "local",
        draft: !!input.draft, resolved: false, helpfulCommentId: "", createdAt: now, updatedAt: now, deleted: false
      };
      store.posts.unshift(post);
      if (!saveStore(store)) return { status: "error" };
      invalidateSearch();
      return { status: "ok", post: post };
    },
    update: function (id, input) {
      var err = validatePost(input);
      if (err) return { status: "invalid", field: err.field, msg: err.msg };
      var store = loadStore();
      var post = store.posts.find(function (p) { return p.id === id && !p.deleted; });
      if (!post) return { status: "missing" };
      if (post.authorId !== "local") return { status: "forbidden" };
      post.title = String(input.title).trim();
      post.body = String(input.body).trim();
      post.tags = parseTags(input.tags).list;
      if (input.type) post.type = input.type;
      post.category = input.category || post.category || "";
      post.lifeStage = stageById(input.lifeStage) ? String(input.lifeStage) : "";
      post.lifeTopicId = input.lifeTopicId && topicHref(input.lifeTopicId) ? input.lifeTopicId : "";
      if ("communityId" in input) post.communityId = input.communityId || "";
      if ("region" in input) post.region = input.region || "";
      if (input.visibility) post.visibility = input.visibility;
      if ("image" in input) post.image = input.image || "";
      post.draft = !!input.draft;
      post.updatedAt = Date.now();
      if (!saveStore(store)) return { status: "error" };
      /* keep the shared save title in sync */
      var P = window.LivonPlatform;
      if (P && P.listSaves && P.saveItem && P.listSaves("all").some(function (s) { return s.id === saveId(id); })) {
        var old = P.listSaves("all").find(function (s) { return s.id === saveId(id); });
        P.saveItem(Object.assign(saveItemOf(post), { folder: old && old.folder }));
      }
      invalidateSearch();
      return { status: "ok", post: post };
    },
    /* removes the post, its comments and reactions on this device; reports stay as a record */
    remove: function (id) {
      var store = loadStore();
      var post = store.posts.find(function (p) { return p.id === id; });
      if (!post) return { status: "missing" };
      if (post.authorId !== "local") return { status: "forbidden" };
      var cids = store.comments.filter(function (c) { return c.postId === id; }).map(function (c) { return c.id; });
      store.posts = store.posts.filter(function (p) { return p.id !== id; });
      store.comments = store.comments.filter(function (c) { return c.postId !== id; });
      delete store.likes[id];
      cids.forEach(function (c) { delete store.commentLikes[c]; });
      store.saves = store.saves.filter(function (x) { return x !== id; });
      if (!saveStore(store)) return { status: "error" };
      var P = window.LivonPlatform;
      if (P && P.removeSave) P.removeSave(saveId(id));
      invalidateSearch();
      return { status: "ok" };
    },
    comments: function (postId) {
      return loadStore().comments.filter(function (c) { return c.postId === postId; }).sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
    },
    commentCount: function (store, postId) {
      return store.comments.filter(function (c) { return c.postId === postId && !c.deleted; }).length;
    },
    addComment: function (postId, body, parentId) {
      body = String(body || "").trim();
      if (!body) return { status: "invalid", msg: "댓글 내용을 입력해 주세요." };
      if (body.length > LIMITS.comment) return { status: "invalid", msg: "댓글은 " + LIMITS.comment + "자 이하로 입력해 주세요." };
      var store = loadStore();
      if (!store.posts.some(function (p) { return p.id === postId && !p.deleted; })) return { status: "missing" };
      var last = store.comments.filter(function (c) { return c.authorId === "local"; }).slice(-1)[0];
      if (last && Date.now() - (last.createdAt || 0) < 1500) return { status: "invalid", msg: "너무 빠르게 연속으로 작성했어요. 잠시 후 다시 등록해 주세요." };
      /* replies are limited to one level: a reply to a reply attaches to its root */
      var parent = parentId ? store.comments.find(function (c) { return c.id === parentId && c.postId === postId; }) : null;
      var rootId = parent ? (parent.parentId || parent.id) : "";
      var c = { id: uid("cmt"), postId: postId, parentId: rootId, body: body, authorNick: store.profile.nick || "나", authorId: "local", createdAt: Date.now(), deleted: false };
      store.comments.push(c);
      if (!saveStore(store)) return { status: "error" };
      return { status: "ok", comment: c };
    },
    editComment: function (id, body) {
      body = String(body || "").trim();
      if (!body) return { status: "invalid", msg: "댓글 내용을 입력해 주세요." };
      if (body.length > LIMITS.comment) return { status: "invalid", msg: "댓글은 " + LIMITS.comment + "자 이하로 입력해 주세요." };
      var store = loadStore();
      var c = store.comments.find(function (x) { return x.id === id && !x.deleted; });
      if (!c) return { status: "missing" };
      if (c.authorId !== "local") return { status: "forbidden" };
      c.body = body;
      c.updatedAt = Date.now();
      saveStore(store);
      return { status: "ok", comment: c };
    },
    removeComment: function (id) {
      var store = loadStore();
      var c = store.comments.find(function (x) { return x.id === id; });
      if (!c) return { status: "missing" };
      if (c.authorId !== "local") return { status: "forbidden" };
      var hasReplies = store.comments.some(function (x) { return x.parentId === id && !x.deleted; });
      if (hasReplies) { c.deleted = true; c.body = ""; }
      else store.comments = store.comments.filter(function (x) { return x.id !== id; });
      delete store.commentLikes[id];
      /* a deleted root whose replies are all gone is cleaned up too */
      store.comments = store.comments.filter(function (x) { return !(x.deleted && !store.comments.some(function (y) { return y.parentId === x.id && !y.deleted; })); });
      var post = store.posts.find(function (p) { return p.id === c.postId; });
      if (post && post.helpfulCommentId === id) { post.helpfulCommentId = ""; post.resolved = false; }
      saveStore(store);
      return { status: "ok", kept: hasReplies };
    },
    /* one local person → a reaction is on/off, never a number */
    toggleReaction: function (postId) {
      var store = loadStore();
      if (store.likes[postId]) delete store.likes[postId]; else store.likes[postId] = Date.now();
      saveStore(store);
      return !!store.likes[postId];
    },
    reacted: function (store, postId) { return !!store.likes[postId]; },
    report: function (target, reason) {
      if (REPORT_REASONS.indexOf(reason) < 0) return { status: "invalid", msg: "신고 사유를 선택해 주세요." };
      var store = loadStore();
      /* TODO(API): send to the moderation API; until then this is a record on this device only */
      var r = { id: uid("report"), target: String(target), reason: reason, at: Date.now(), status: "local-only" };
      store.reports.push(r);
      saveStore(store);
      return { status: "ok", report: r };
    },
    reported: function (target) { return loadStore().reports.some(function (r) { return r.target === target; }); },
    isSaved: function (postId) {
      var P = window.LivonPlatform;
      return !!(P && P.listSaves && P.listSaves("all").some(function (s) { return s.id === saveId(postId); }));
    },
    savedPosts: function () {
      var P = window.LivonPlatform, store = loadStore();
      if (!P || !P.listSaves) return [];
      return P.listSaves("all").map(function (s) {
        var m = /^life-hub:community:cm:(.+)$/.exec(s.id);
        return m ? store.posts.find(function (p) { return p.id === m[1] && !p.deleted; }) : null;
      }).filter(Boolean);
    }
  };

  /* ───────── Feed ───────── */
  function userSignals(store) {
    var stage = readJSON(KEY_STAGE, "");
    var life = readJSON(KEY_LIFE_INTERESTS, []);
    var td = readJSON(KEY_TD_PREFS, null);
    var interests = uniq([].concat(Array.isArray(life) ? life : [], td && Array.isArray(td.interests) ? td.interests : []));
    var cats = {};
    interests.forEach(function (i) { catsOfText(i).forEach(function (c) { cats[c] = 1; }); });
    var joinedCats = {};
    store.joined.forEach(function (j) { if (COMM_CAT[j.id]) joinedCats[COMM_CAT[j.id]] = 1; });
    return { stage: typeof stage === "string" && /^[1-7]0$/.test(stage) ? stage : "", interests: interests, cats: cats, joinedCats: joinedCats };
  }
  function forYouScore(p, sig) {
    var s = 0;
    if (sig.stage && p.lifeStage === sig.stage) s += 3;
    if (p.category && sig.cats[p.category]) s += 2;
    if (p.category && sig.joinedCats[p.category]) s += 1;
    var blob = [p.title, (p.tags || []).join(" ")].join(" ");
    if (sig.interests.some(function (i) { return i && blob.indexOf(i) >= 0; })) s += 1;
    return s;
  }
  function matchesQuery(p, q) {
    if (!q) return true;
    var hay = [p.title, p.body, (p.tags || []).join(" "), catLabel(p.category), typeLabel(p.type), p.field, p.region].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (t) { return hay.indexOf(t) >= 0; });
  }
  function filterFeed(store) {
    store = store || loadStore();
    if (state.tab === "following") return []; /* no other user identities exist yet */
    var q = String(state.q || "").trim();
    var list = store.posts.filter(function (p) { return isVisible(p, store); }).filter(function (p) {
      return (!state.cat || p.category === state.cat) && (!state.type || p.type === state.type) && (!state.stage || p.lifeStage === state.stage) && matchesQuery(p, q);
    });
    var byDate = function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); };
    if (state.tab === "foryou") {
      var sig = userSignals(store);
      return list.map(function (p) { return { p: p, s: forYouScore(p, sig) }; })
        .sort(function (a, b) { return b.s - a.s || byDate(a.p, b.p); }).map(function (x) { return x.p; });
    }
    return list.slice().sort(byDate);
  }

  function feedHash() {
    var p = [];
    function add(k, v) { if (v) p.push(k + "=" + encodeURIComponent(v)); }
    if (state.tab !== "latest") add("tab", state.tab);
    add("cat", state.cat); add("type", state.type); add("stage", state.stage); add("q", state.q);
    return "#cm-home" + (p.length ? "?" + p.join("&") : "");
  }
  function parseHash(hash) {
    var h = String(hash || "").replace(/^#/, "");
    var q = "", i = h.indexOf("?");
    if (i >= 0) { q = h.slice(i + 1); h = h.slice(0, i); }
    var params = {};
    q.split("&").forEach(function (part) {
      if (!part) return;
      var kv = part.split("=");
      try { params[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || "").replace(/\+/g, " ")); } catch (e) {}
    });
    return { id: h, params: params };
  }
  function applyFeedParams(p) {
    p = p || {};
    state.tab = TABS.some(function (t) { return t.id === p.tab; }) ? p.tab : "latest";
    state.cat = categories().some(function (c) { return c.id === p.cat; }) ? p.cat : "";
    state.type = DATA.typeLabels && DATA.typeLabels[p.type] ? p.type : "";
    state.stage = stageById(p.stage) ? p.stage : "";
    state.q = String(p.q || "").slice(0, 80);
    state.shown = PAGE;
  }
  function syncFeedUrl() {
    var h = feedHash();
    state.lastFeedHash = h;
    if (location.hash !== h && /^#cm-home/.test(location.hash || "#cm-home")) history.replaceState(history.state, "", h);
  }

  function renderTabs() {
    var host = $("[data-lv-cm-tabs]");
    if (!host) return;
    host.innerHTML = TABS.map(function (t) {
      var on = state.tab === t.id;
      return '<button type="button" role="tab" id="lv-cm-tab-' + t.id + '" aria-controls="lv-cm-feed-panel" data-lv-cm-tab="' + t.id + '" aria-selected="' + on + '" tabindex="' + (on ? "0" : "-1") + '"' + (on ? ' class="is-on"' : "") + ">" + esc(t.label) + "</button>";
    }).join("");
  }
  function renderFilters() {
    var host = $("[data-lv-cm-filters]");
    if (!host) return;
    var cats = [{ id: "", label: "전체" }].concat(categories());
    host.innerHTML =
      '<div class="lv-cm-chips lv-cm-filter-chips" role="group" aria-label="주제">' + cats.map(function (c) {
        var on = state.cat === c.id;
        return '<button type="button" data-lv-cm-cat="' + esc(c.id) + '" aria-pressed="' + on + '"' + (on ? ' class="is-on"' : "") + ">" + esc(c.label) + "</button>";
      }).join("") + "</div>" +
      '<div class="lv-cm-filter-row">' +
        '<label class="lv-cm-field lv-cm-field--inline"><span>글 유형</span><select data-lv-cm-type-filter><option value="">모든 유형</option>' +
          Object.keys(DATA.typeLabels || {}).map(function (k) { return '<option value="' + esc(k) + '"' + (state.type === k ? " selected" : "") + ">" + esc(typeLabel(k)) + "</option>"; }).join("") +
        "</select></label>" +
        '<label class="lv-cm-field lv-cm-field--inline"><span>라이프 스테이지</span><select data-lv-cm-stage-filter><option value="">모든 연령대</option>' +
          STAGES.map(function (s) { return '<option value="' + s.id + '"' + (state.stage === s.id ? " selected" : "") + ">" + esc(s.label) + "</option>"; }).join("") +
        "</select></label>" +
      "</div>";
  }

  function cardHtml(p, store) {
    var comm = findCommunity(p.communityId);
    var comments = Repo.commentCount(store, p.id);
    var reacted = Repo.reacted(store, p.id);
    var saved = Repo.isSaved(p.id);
    var preview = String(p.body || "").slice(0, 140);
    var stage = stageById(p.lifeStage);
    var answered = p.type === "question" ? (p.resolved ? "해결됨" : (comments ? "댓글 " + comments : "답변 대기")) : "";
    var href = "#cm-post-" + p.id;
    return '<article class="lv-cm-card lv-cm-card--' + esc(p.type) + (p.image ? " has-image" : "") + '" aria-labelledby="lv-cm-t-' + esc(p.id) + '">' +
      (p.image ? '<a class="lv-cm-card__media" href="' + href + '" data-lv-cm-go tabindex="-1" aria-hidden="true"><img src="' + esc(p.image) + '" alt="" loading="lazy" /></a>' : "") +
      '<div class="lv-cm-card__body">' +
        '<div class="lv-cm-card__meta">' +
          '<span class="lv-cm-badge">' + esc(typeLabel(p.type)) + "</span>" +
          (catLabel(p.category) ? "<span>" + esc(catLabel(p.category)) + "</span>" : "") +
          (stage ? "<span>" + esc(stage.label) + "</span>" : "") +
          (comm ? "<span>" + esc(comm.name) + "</span>" : "") +
          (p.createdAt ? "<span>" + esc(fmtDate(p.createdAt)) + "</span>" : "") +
          (answered ? "<span>" + esc(answered) + "</span>" : "") +
          (p.visibility === "private" ? "<span>비공개</span>" : p.visibility === "members" ? "<span>가입 커뮤니티 공개</span>" : "") +
        "</div>" +
        '<p class="lv-cm-card__author">' + esc(p.authorNick || "나") + "</p>" +
        '<h3 id="lv-cm-t-' + esc(p.id) + '"><a href="' + href + '" data-lv-cm-go>' + esc(p.title) + "</a></h3>" +
        '<p class="lv-cm-card__preview">' + esc(preview) + (String(p.body || "").length > 140 ? "…" : "") + "</p>" +
        ((p.tags || []).length ? '<p class="lv-cm-card__tags">' + (p.tags || []).map(function (t) { return "#" + esc(t); }).join(" ") + "</p>" : "") +
        '<div class="lv-cm-card__acts">' +
          '<button type="button" data-lv-cm-like="' + esc(p.id) + '" aria-pressed="' + reacted + '"' + (reacted ? ' class="is-on"' : "") + ">" + (reacted ? "공감했어요" : "공감하기") + '<span class="visually-hidden">: ' + esc(p.title) + "</span></button>" +
          '<a href="' + href + '" data-lv-cm-go>댓글' + (comments ? " " + comments : "") + '<span class="visually-hidden">: ' + esc(p.title) + "</span></a>" +
          saveButton(p, saved) +
        "</div>" +
      "</div></article>";
  }
  function saveButton(p, saved, cls) {
    return '<button type="button"' + (cls ? ' class="' + cls + '"' : "") + ' data-lh-save="community" data-lh-id="cm:' + esc(p.id) + '" data-lh-title="' + esc(p.title) + '" data-lh-href="#cm-post-' + esc(p.id) +
      '" data-lh-stage="' + esc(p.lifeStage || "") + '" data-lh-label="저장" aria-pressed="' + saved + '" aria-label="' + esc(p.title) + ' 저장">' + (saved ? "저장됨" : "저장") + "</button>";
  }

  function emptyHtml(title, body, acts) {
    return '<div class="lv-cm-empty"><h3>' + esc(title) + "</h3>" + (body ? "<p>" + esc(body) + "</p>" : "") + (acts ? '<div class="lv-cm-actions">' + acts + "</div>" : "") + "</div>";
  }
  function renderFeed() {
    var host = $("[data-lv-cm-feed]");
    var meta = $("[data-lv-cm-search-meta]");
    if (!host) return;
    host.id = "lv-cm-feed-panel";
    host.setAttribute("role", "tabpanel");
    host.setAttribute("aria-labelledby", "lv-cm-tab-" + state.tab);
    renderTabs();
    renderFilters();
    var store = loadStore();
    var list = filterFeed(store);
    var filtered = !!(state.q || state.cat || state.type || state.stage);
    if (meta) {
      if (filtered && state.tab !== "following") {
        meta.hidden = false;
        meta.innerHTML = "<p>" + (state.q ? "‘" + esc(state.q) + "’ · " : "") + [catLabel(state.cat), typeLabel(state.type), (stageById(state.stage) || {}).label].filter(Boolean).map(esc).join(" · ") +
          (state.q || state.cat || state.type || state.stage ? " · " : "") + "게시글 " + list.length +
          ' · <button type="button" class="lv-cm-text-btn" data-lv-cm-reset>필터 초기화</button></p>';
      } else meta.hidden = true;
    }
    var any = store.posts.some(function (p) { return isVisible(p, store); });
    if (state.tab === "following") {
      host.innerHTML = emptyHtml("아직 팔로우한 사용자가 없습니다.", "다른 사용자 프로필과 팔로우는 준비 중입니다. 지금은 주제별로 글을 둘러볼 수 있어요.",
        '<a class="lv-cm-btn lv-cm-btn--dark" href="#cm-home?tab=latest">최신 글 보기</a><a class="lv-cm-btn lv-cm-btn--ghost" href="#cm-interests">주제 둘러보기</a>');
      return;
    }
    if (!list.length) {
      host.innerHTML = any || filtered
        ? emptyHtml("검색 결과가 없습니다.", "다른 주제나 검색어로 찾아보세요.",
            '<button type="button" class="lv-cm-btn lv-cm-btn--dark" data-lv-cm-reset>필터 초기화</button><a class="lv-cm-btn lv-cm-btn--ghost" href="#cm-interests">다른 주제 탐색</a>')
        : emptyHtml("아직 이 기기에 작성된 글이 없습니다.", "LIVON 커뮤니티 글은 지금 이 기기에만 저장됩니다. 궁금한 점이나 경험을 먼저 나눠 보세요.",
            '<button type="button" class="lv-cm-btn lv-cm-btn--dark" data-lv-cm-compose="question">첫 글 작성하기</button><a class="lv-cm-btn lv-cm-btn--ghost" href="#cm-interests">관심 주제 둘러보기</a><a class="lv-cm-btn lv-cm-btn--ghost" href="#life">라이프 스테이지 둘러보기</a>');
      return;
    }
    var sig = state.tab === "foryou" ? userSignals(store) : null;
    var note = sig && !sig.stage && !sig.interests.length ? '<p class="lv-cm-note lv-cm-note--plain">관심사나 라이프 스테이지를 설정하면 관련 글이 먼저 보입니다. <a href="#ml-interests">관심사 설정</a></p>' : "";
    var shown = list.slice(0, state.shown);
    host.innerHTML = note + '<div class="lv-cm-feed-list">' + shown.map(function (p) { return cardHtml(p, store); }).join("") + "</div>" +
      (list.length > shown.length ? '<p class="lv-cm-more"><button type="button" class="lv-cm-btn lv-cm-btn--outline" data-lv-cm-more>더 보기 <span class="lv-cm-count">(' + shown.length + " / " + list.length + ")</span></button></p>" : "");
  }

  function findCommunity(id) {
    return (DATA.communities || []).find(function (c) { return c.id === id; });
  }
  function isJoined(store, id) { return store.joined.some(function (x) { return x.id === id; }); }

  function renderSide() {
    var host = $("[data-lv-cm-side]");
    if (!host) return;
    var store = loadStore();
    var joined = store.joined.map(function (j) { return findCommunity(j.id); }).filter(Boolean).slice(0, 5);
    var challenges = Object.keys(store.challenges).map(function (id) {
      return (DATA.challenges || []).find(function (c) { return c.id === id; });
    }).filter(Boolean).slice(0, 3);
    host.innerHTML =
      '<div class="lv-cm-side__block">' +
        "<h3>나의 가입 커뮤니티</h3>" +
        (joined.length
          ? "<ul>" + joined.map(function (c) {
              return '<li><a href="#cm-home?cat=' + esc(COMM_CAT[c.id] || "") + (/^stage-/.test(c.id) ? "&stage=" + c.id.slice(6) : "") + '">' + esc(c.name) + "</a></li>";
            }).join("") + "</ul>"
          : '<p class="lv-cm-note">관심 있는 커뮤니티를 찾아보세요.</p><a class="lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm" href="#cm-communities">커뮤니티 탐색하기</a>') +
      "</div>" +
      '<div class="lv-cm-side__block">' +
        "<h3>주제 둘러보기</h3>" +
        '<div class="lv-cm-chips">' + categories().map(function (c) {
          return '<a href="#cm-home?cat=' + esc(c.id) + '">' + esc(c.label) + "</a>";
        }).join("") + "</div>" +
      "</div>" +
      '<div class="lv-cm-side__block">' +
        "<h3>참여 예정 모임</h3>" +
        '<p class="lv-cm-note">오프라인 모임은 아직 열리지 않았습니다.</p>' +
        '<a class="lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm" href="#cm-groups">모임 안내 보기</a>' +
      "</div>" +
      '<div class="lv-cm-side__block">' +
        "<h3>진행 중 챌린지</h3>" +
        (challenges.length
          ? "<ul>" + challenges.map(function (c) { return "<li>" + esc(c.title) + "</li>"; }).join("") + "</ul>"
          : '<p class="lv-cm-note">참여 중인 챌린지가 없어요.</p>') +
        '<a class="lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm" href="#cm-programs">챌린지 보기</a>' +
      "</div>" +
      '<div class="lv-cm-side__block">' +
        "<h3>나의 활동</h3>" +
        '<p class="lv-cm-note">이 기기에서 작성한 글 ' + store.posts.filter(function (p) { return !p.deleted && !p.draft; }).length +
          " · 댓글 " + store.comments.filter(function (c) { return !c.deleted; }).length + "</p>" +
        '<a class="lv-cm-btn lv-cm-btn--ghost lv-cm-btn--sm" href="#cm-mine">나의 커뮤니티</a>' +
      "</div>";
  }

  function renderCommunities() {
    var host = $("[data-lv-cm-comm-list]");
    if (!host) return;
    var store = loadStore();
    host.innerHTML = (DATA.communities || []).map(function (c) {
      var posts = store.posts.filter(function (p) { return isVisible(p, store) && p.communityId === c.id; }).length;
      var joined = isJoined(store, c.id);
      var feed = "#cm-home?" + (COMM_CAT[c.id] ? "cat=" + COMM_CAT[c.id] : "stage=" + String(c.id).slice(6));
      return '<article class="lv-cm-comm">' +
        '<div class="lv-cm-comm__media" style="background-image:url(' + esc(c.img || "") + ')"></div>' +
        '<div class="lv-cm-comm__body">' +
          '<p class="lv-cm-eyebrow">' + esc(c.interest || c.stage || "") + "</p>" +
          "<h3>" + esc(c.name) + "</h3>" +
          "<p>" + esc(c.desc) + "</p>" +
          '<p class="lv-cm-note">이 기기의 글 ' + posts + (joined ? " · 가입함" : "") + "</p>" +
          '<div class="lv-cm-actions">' +
            '<button type="button" class="lv-cm-btn' + (joined ? " lv-cm-btn--ghost" : " lv-cm-btn--dark") + '" data-lv-cm-join="' + esc(c.id) + '" data-lv-cm-label="' + esc(c.name) + '" aria-pressed="' + joined + '">' +
              (joined ? "가입 해제" : "가입") + '<span class="visually-hidden">: ' + esc(c.name) + "</span></button>" +
            '<a class="lv-cm-btn lv-cm-btn--ghost" href="' + feed + '">게시글 보기<span class="visually-hidden">: ' + esc(c.name) + "</span></a>" +
          "</div>" +
        "</div></article>";
    }).join("");
  }

  function renderChallenges() {
    var host = $("[data-lv-cm-challenges]");
    if (!host) return;
    var store = loadStore();
    host.innerHTML = (DATA.challenges || []).map(function (c) {
      var prog = store.challenges[c.id];
      var logs = prog && prog.logs ? Object.keys(prog.logs).length : 0;
      var pct = Math.min(100, Math.round(logs / (c.days || 1) * 100));
      var on = !!prog;
      var today = !!(prog && prog.logs && prog.logs[todayKey()]);
      return '<article class="lv-cm-challenge">' +
        '<p class="lv-cm-eyebrow">' + esc(c.field) + "</p>" +
        "<h3>" + esc(c.title) + "</h3>" +
        "<p>" + esc(c.desc) + "</p>" +
        '<p class="lv-cm-note">목표 ' + esc(c.goal) + " · " + c.days + "일</p>" +
        (on ? '<div class="lv-cm-progress" role="img" aria-label="나의 기록 ' + logs + "/" + c.days + '일"><span style="width:' + pct + '%"></span></div><p class="lv-cm-note">나의 기록 ' + logs + "/" + c.days + "일</p>" : "") +
        '<div class="lv-cm-actions">' +
          '<button type="button" class="lv-cm-btn' + (on ? "" : " lv-cm-btn--dark") + '" data-lv-cm-challenge="' + esc(c.id) + '" aria-pressed="' + on + '">' + (on ? "참여 중 · 그만두기" : "참여") + '<span class="visually-hidden">: ' + esc(c.title) + "</span></button>" +
          (on ? '<button type="button" class="lv-cm-btn lv-cm-btn--ghost" data-lv-cm-challenge-log="' + esc(c.id) + '" aria-pressed="' + today + '">' + (today ? "오늘 기록함" : "오늘 실천 기록") + "</button>" : "") +
          '<a class="lv-cm-btn lv-cm-btn--ghost" href="#ml-goals">내 생활 목표</a>' +
        "</div></article>";
    }).join("");
  }

  function readInterests() {
    var life = readJSON(KEY_LIFE_INTERESTS, []);
    var td = readJSON(KEY_TD_PREFS, null);
    return uniq([].concat(Array.isArray(life) ? life : [], td && Array.isArray(td.interests) ? td.interests : []));
  }
  function renderMine() {
    var host = $("[data-lv-cm-mine]");
    if (!host) return;
    var store = loadStore();
    var myPosts = store.posts.filter(function (p) { return !p.deleted && !p.draft && p.authorId === "local"; });
    var drafts = store.posts.filter(function (p) { return !p.deleted && p.draft; });
    var myComments = store.comments.filter(function (c) { return !c.deleted && c.authorId === "local"; });
    var saved = Repo.savedPosts();
    var reacted = Object.keys(store.likes).map(function (id) { return store.posts.find(function (p) { return p.id === id && !p.deleted; }); }).filter(Boolean);
    var joined = store.joined.map(function (j) { var c = findCommunity(j.id); return c ? c.name : j.label || ""; }).filter(Boolean);
    var ch = Object.keys(store.challenges).map(function (id) {
      return (DATA.challenges || []).find(function (c) { return c.id === id; });
    }).filter(Boolean);
    var interests = readInterests();
    function postLink(p) { return '<li><a href="#cm-post-' + esc(p.id) + '">' + esc(p.title) + "</a></li>"; }
    function listBlock(title, items, empty, mapper, extra) {
      return '<div class="lv-cm-mine-block"><h3>' + esc(title) + ' <span class="lv-cm-count">' + items.length + "</span></h3>" +
        (items.length ? "<ul>" + items.slice(0, 8).map(mapper).join("") + "</ul>" : '<p class="lv-cm-note">' + esc(empty) + "</p>") + (extra || "") + "</div>";
    }
    host.innerHTML =
      '<div class="lv-cm-profile-card">' +
        "<h3>" + esc(store.profile.nick || "나") + "</h3>" +
        "<p>이 기기에서 쓰는 이름입니다. 프로필 사진·팔로워 기능은 준비 중입니다.</p>" +
        '<form class="lv-cm-inline" data-lv-cm-profile-form><label class="lv-cm-field lv-cm-field--inline"><span>표시 이름</span><input type="text" name="nick" maxlength="20" autocomplete="off" value="' + esc(store.profile.nick || "나") + '" /></label>' +
        '<button type="submit" class="lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm">이름 저장</button></form>' +
        '<p class="lv-cm-note">실명·연락처·주소는 적지 마세요. 새 글부터 이 이름이 표시됩니다.</p>' +
      "</div>" +
      '<div class="lv-cm-mine-grid">' +
        listBlock("내가 작성한 글", myPosts, "작성한 글이 없어요.", postLink) +
        listBlock("임시 저장 글", drafts, "임시 저장한 글이 없어요. 임시 저장 글은 피드·검색에 나오지 않습니다.", function (p) {
          return '<li><button type="button" class="lv-cm-text-btn" data-lv-cm-edit="' + esc(p.id) + '">' + esc(p.title || "제목 없음") + " · 이어 쓰기</button></li>";
        }) +
        listBlock("저장한 글", saved, "저장한 글이 없어요.", postLink, '<a class="lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm" href="#ml-saved">내 생활 › 저장 전체</a>') +
        listBlock("공감한 글", reacted, "공감한 글이 없어요.", postLink) +
        listBlock("내가 작성한 댓글", myComments, "작성한 댓글이 없어요.", function (c) {
          return '<li><a href="#cm-post-' + esc(c.postId) + '">' + esc((c.body || "").slice(0, 40)) + "</a></li>";
        }) +
        listBlock("관심 주제", interests, "관심사가 없어요.", function (x) { return "<li>" + esc(x) + "</li>"; }, '<a class="lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm" href="#ml-interests">관심사 관리</a>') +
        listBlock("가입한 커뮤니티", joined, "가입한 커뮤니티가 없어요.", function (n) { return "<li>" + esc(n) + "</li>"; }) +
        listBlock("참여 중 챌린지", ch, "챌린지에 참여해 보세요.", function (c) { return "<li>" + esc(c.title) + "</li>"; }) +
        '<div class="lv-cm-mine-block"><h3>팔로우</h3><p class="lv-cm-note">다른 사용자 계정이 연결되지 않아 팔로우·팔로워가 없습니다.</p></div>' +
        '<div class="lv-cm-mine-block"><h3>신고 기록</h3><p class="lv-cm-note">이 기기에 남긴 신고 ' + store.reports.length + "건 · 서버 신고 시스템은 아직 연결되지 않았습니다.</p></div>" +
      "</div>";
  }

  /* ───────── Modals (LIVON UI: focus trap, ESC one level, focus restore) ───────── */
  var dialog = null; /* confirm / report dialog stacked above the compose modal */
  function composeOpen() { var m = $("[data-lv-cm-modal]"); return !!(m && !m.hidden); }
  function restoreFocus(el) {
    if (el && document.contains(el) && typeof el.focus === "function") { el.focus(); return; }
    var t = state.detailId ? $("#cm-detail h2") : $("#cm-home h2");
    if (t) { t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); }
  }
  function openDialog(html, onClose) {
    closeDialog(false);
    var root = $("#community") || document.body;
    var m = document.createElement("div");
    m.className = "lv-cm-modal lv-cm-modal--dialog";
    m.innerHTML = '<div class="lv-cm-modal__backdrop" data-lv-cm-dialog-close aria-hidden="true"></div>' +
      '<div class="lv-cm-modal__panel" role="alertdialog" aria-modal="true" aria-labelledby="lv-cm-dialog-title" aria-describedby="lv-cm-dialog-desc">' + html + "</div>";
    dialog = { el: m, opener: document.activeElement, onClose: onClose };
    root.appendChild(m);
    document.body.style.overflow = "hidden";
    var f = m.querySelector("[data-lv-cm-autofocus]") || m.querySelector("button");
    if (f) f.focus();
    return m;
  }
  function closeDialog(result) {
    if (!dialog) return;
    var d = dialog;
    dialog = null;
    if (d.el.parentNode) d.el.parentNode.removeChild(d.el);
    if (!composeOpen()) document.body.style.overflow = "";
    if (!result || composeOpen()) restoreFocus(d.opener);
    if (d.onClose) d.onClose(result);
  }
  function confirmDialog(o) {
    return new Promise(function (resolve) {
      openDialog('<h2 id="lv-cm-dialog-title">' + esc(o.title) + '</h2><p id="lv-cm-dialog-desc">' + esc(o.body || "") + "</p>" +
        '<div class="lv-cm-form__acts"><button type="button" class="lv-cm-btn lv-cm-btn--ghost" data-lv-cm-dialog-close data-lv-cm-autofocus>' + esc(o.cancel || "취소") + "</button>" +
        '<button type="button" class="lv-cm-btn lv-cm-btn--dark' + (o.danger ? " lv-cm-btn--danger" : "") + '" data-lv-cm-dialog-ok>' + esc(o.ok || "확인") + "</button></div>", resolve);
    });
  }
  function openReport(target, opener) {
    var already = Repo.reported(target);
    openDialog('<h2 id="lv-cm-dialog-title">' + (target.indexOf("comment:") === 0 ? "댓글 신고" : "게시글 신고") + "</h2>" +
      '<p id="lv-cm-dialog-desc">서버 신고 시스템은 아직 연결되지 않았습니다. 신고하면 이 기기에만 기록되며 운영자에게 전달되지 않습니다.' + (already ? " 이 기기에서 이미 신고한 적이 있는 항목입니다." : "") + "</p>" +
      '<form data-lv-cm-report-form data-target="' + esc(target) + '"><fieldset class="lv-cm-fieldset"><legend>신고 사유</legend>' +
        REPORT_REASONS.map(function (r, i) { return '<label class="lv-cm-radio"><input type="radio" name="reason" value="' + esc(r) + '"' + (i === 0 ? " data-lv-cm-autofocus" : "") + " /> " + esc(r) + "</label>"; }).join("") +
      '</fieldset><p class="lv-cm-form__err" data-lv-cm-report-err role="alert"></p>' +
      '<div class="lv-cm-form__acts"><button type="button" class="lv-cm-btn lv-cm-btn--ghost" data-lv-cm-dialog-close>취소</button><button type="submit" class="lv-cm-btn lv-cm-btn--dark">이 기기에 신고 기록</button></div></form>');
    if (opener && dialog) dialog.opener = opener;
  }
  function trapFocus(e) {
    var panel = dialog ? dialog.el.querySelector(".lv-cm-modal__panel") : composeOpen() ? $("[data-lv-cm-modal] .lv-cm-modal__panel") : null;
    if (!panel) return;
    var f = $$("button:not([disabled]), a[href], input:not([disabled]):not([type=hidden]), select, textarea", panel).filter(function (x) { return x.offsetParent !== null || x.getClientRects().length; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ───────── Compose / edit ───────── */
  function topicOptions(stageId, selected) {
    var r = lifeRepo();
    var s = stageById(stageId);
    if (!s) return '<option value="">먼저 연령대를 선택하세요</option>';
    if (!r || !r.data) return '<option value="">주제를 불러오는 중입니다…</option>' + (selected ? '<option value="' + esc(selected) + '" selected>' + esc(selected) + "</option>" : "");
    var topics = r.data.topics.filter(function (t) { return t.lifeStageId === s.id; });
    var groups = [];
    topics.forEach(function (t) { var g = groups.find(function (x) { return x.name === t.category; }); if (!g) groups.push(g = { name: t.category, items: [] }); g.items.push(t); });
    return '<option value="">주제 선택 안 함</option>' + groups.map(function (g) {
      return '<optgroup label="' + esc(g.name) + '">' + g.items.map(function (t) { return '<option value="' + esc(t.id) + '"' + (t.id === selected ? " selected" : "") + ">" + esc(t.title) + "</option>"; }).join("") + "</optgroup>";
    }).join("");
  }
  function refreshTopicSelect(form, selected) {
    var sel = form.querySelector("[name=lifeTopicId]");
    var st = form.querySelector("[name=lifeStage]");
    if (!sel || !st) return;
    sel.innerHTML = topicOptions(st.value, selected);
    sel.disabled = !st.value;
    var r = lifeRepo();
    if (st.value && r && !r.data && r.load) r.load().then(function () { if (form.isConnected) { sel.innerHTML = topicOptions(st.value, selected); } }, function () {});
  }
  function safetyNote(cat) {
    if (cat === "health") return "건강 글은 개인 경험으로 나눠 주세요. 진단·치료 판단은 의료진과 확인하세요.";
    if (cat === "money" || cat === "startup") return "돈 이야기는 개인 경험으로 나눠 주세요. 투자·세무 판단은 전문가와 확인하세요.";
    if (cat === "housing" || cat === "care") return "계약·법률 문제는 개인 경험과 구분해 주세요. 법률 판단은 전문가와 확인하세요.";
    return "";
  }
  function counter(name, max, val) {
    return '<span class="lv-cm-counter" data-lv-cm-counter="' + name + '" aria-hidden="true">' + String(val || "").length + " / " + max + "</span>";
  }
  function openCompose(type, editPost, opener) {
    var modal = $("[data-lv-cm-modal]");
    var title = $("[data-lv-cm-modal-title]");
    var form = $("[data-lv-cm-write]");
    if (!modal || !form) return;
    closeDialog(false);
    if (!composeOpen()) state.modalOpener = opener || document.activeElement;
    var p = editPost || {};
    var t = p.type || (COMPOSE_TYPES.indexOf(type) >= 0 ? type : "story");
    state.composeType = t;
    state.editingId = editPost ? editPost.id : null;
    state.dirty = false;
    if (title) title.textContent = editPost ? (editPost.draft ? "임시 저장 글 이어 쓰기" : "글 수정") : "글쓰기";
    var types = COMPOSE_TYPES.concat(p.type === "meetup" ? ["meetup"] : []);
    form.innerHTML =
      '<p class="lv-cm-note lv-cm-note--plain">개인정보(연락처·주소·실명 등)는 게시하지 마세요. 글은 이 기기에만 저장됩니다.</p>' +
      '<div class="lv-cm-form__row">' +
        '<label class="lv-cm-field"><span>글 유형</span><select name="type">' + types.map(function (k) {
          return '<option value="' + k + '"' + (t === k ? " selected" : "") + ">" + esc(typeLabel(k)) + "</option>";
        }).join("") + "</select></label>" +
        '<label class="lv-cm-field"><span>분야 <em aria-hidden="true">*</em></span><select name="category" required aria-required="true"><option value="">선택</option>' + categories().map(function (c) {
          return '<option value="' + esc(c.id) + '"' + (p.category === c.id ? " selected" : "") + ">" + esc(c.label) + "</option>";
        }).join("") + "</select></label>" +
      "</div>" +
      '<p class="lv-cm-note lv-cm-note--plain" data-lv-cm-safety' + (safetyNote(p.category) ? "" : " hidden") + ">" + esc(safetyNote(p.category)) + "</p>" +
      '<label class="lv-cm-field"><span>제목 <em aria-hidden="true">*</em> ' + counter("title", LIMITS.title, p.title) + '</span><input name="title" required aria-required="true" maxlength="' + LIMITS.title + '" autocomplete="off" value="' + esc(p.title || "") + '" /></label>' +
      '<label class="lv-cm-field"><span>본문 <em aria-hidden="true">*</em> ' + counter("body", LIMITS.body, p.body) + '</span><textarea name="body" required aria-required="true" maxlength="' + LIMITS.body + '" rows="7">' + esc(p.body || "") + "</textarea></label>" +
      '<fieldset class="lv-cm-fieldset"><legend>라이프 스테이지 연결 (선택)</legend><div class="lv-cm-form__row">' +
        '<label class="lv-cm-field"><span>연령대</span><select name="lifeStage"><option value="">선택 안 함</option>' + STAGES.map(function (s) {
          return '<option value="' + s.id + '"' + (p.lifeStage === s.id ? " selected" : "") + ">" + esc(s.label) + "</option>";
        }).join("") + "</select></label>" +
        '<label class="lv-cm-field"><span>관련 주제</span><select name="lifeTopicId"></select></label>' +
      "</div></fieldset>" +
      '<label class="lv-cm-field"><span>태그 (선택, 쉼표로 구분 · 최대 ' + LIMITS.tags + '개)</span><input name="tags" autocomplete="off" value="' + esc((p.tags || []).join(", ")) + '" placeholder="예: 자취, 첫 계약" /></label>' +
      '<details class="lv-cm-more-opts"' + (p.communityId || p.region || (p.visibility && p.visibility !== "public") || p.image ? " open" : "") + "><summary>공개 범위 · 커뮤니티 · 지역 · 이미지</summary>" +
        '<label class="lv-cm-field"><span>공개 범위</span><select name="visibility">' +
          '<option value="public"' + ((p.visibility || "public") === "public" ? " selected" : "") + ">전체 공개</option>" +
          '<option value="members"' + (p.visibility === "members" ? " selected" : "") + ">가입 커뮤니티</option>" +
          '<option value="private"' + (p.visibility === "private" ? " selected" : "") + ">비공개 (나만)</option>" +
        "</select></label>" +
        '<label class="lv-cm-field"><span>커뮤니티</span><select name="communityId"><option value="">선택 안 함</option>' + (DATA.communities || []).map(function (c) {
          return '<option value="' + esc(c.id) + '"' + (p.communityId === c.id ? " selected" : "") + ">" + esc(c.name) + "</option>";
        }).join("") + "</select></label>" +
        '<label class="lv-cm-field"><span>지역</span><select name="region"><option value="">선택 안 함</option>' + (DATA.regions || []).map(function (r) {
          return '<option value="' + esc(r) + '"' + (p.region === r ? " selected" : "") + ">" + esc(r) + "</option>";
        }).join("") + "</select></label>" +
        '<label class="lv-cm-field"><span>이미지 (선택, 약 1MB 이하 · 이 기기 저장)</span><input type="file" name="image" accept="image/*" /></label>' +
        (p.image ? '<p class="lv-cm-note lv-cm-note--plain">기존 이미지가 있습니다. 새 파일을 고르면 교체됩니다. <button type="button" class="lv-cm-text-btn" data-lv-cm-remove-image aria-pressed="false">이미지 제거</button></p>' : "") +
      "</details>" +
      '<p class="lv-cm-form__err" data-lv-cm-form-err role="alert"></p>' +
      '<div class="lv-cm-form__acts">' +
        '<button type="button" class="lv-cm-btn lv-cm-btn--ghost" data-lv-cm-modal-close>취소</button>' +
        (!editPost || editPost.draft ? '<button type="button" class="lv-cm-btn lv-cm-btn--outline" data-lv-cm-draft>임시 저장</button>' : "") +
        '<button type="submit" class="lv-cm-btn lv-cm-btn--dark">' + (editPost && !editPost.draft ? "수정 완료" : "게시") + "</button>" +
      "</div>";
    refreshTopicSelect(form, p.lifeTopicId || "");
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var first = form.querySelector(editPost ? "[name=title]" : "[name=category]");
    if (first) first.focus();
  }
  function closeCompose(force) {
    if (!composeOpen()) return;
    if (state.dirty && !force) {
      confirmDialog({ title: "작성 중인 내용이 있어요", body: "닫으면 지금까지 입력한 내용은 저장되지 않습니다. 보관하려면 ‘임시 저장’을 눌러 주세요.", cancel: "계속 작성", ok: "닫기", danger: true })
        .then(function (ok) { if (ok) closeCompose(true); });
      return;
    }
    var modal = $("[data-lv-cm-modal]");
    if (modal) modal.hidden = true;
    document.body.style.overflow = "";
    state.dirty = false;
    state.editingId = null;
    var opener = state.modalOpener;
    state.modalOpener = null;
    if (/^#cm-write/.test(location.hash)) history.replaceState(history.state, "", state.lastFeedHash || "#cm-home");
    restoreFocus(opener);
  }
  function formError(form, field, msg) {
    var box = form.querySelector("[data-lv-cm-form-err]");
    $$("[aria-invalid]", form).forEach(function (x) { x.removeAttribute("aria-invalid"); x.removeAttribute("aria-describedby"); });
    if (box) { box.id = "lv-cm-form-err-msg"; box.textContent = msg; }
    var f = field ? form.querySelector('[name="' + field + '"]') : null;
    if (f) {
      if (f.closest("details")) f.closest("details").open = true;
      f.setAttribute("aria-invalid", "true");
      f.setAttribute("aria-describedby", "lv-cm-form-err-msg");
      f.focus();
    }
  }
  function readFileAsDataURL(file, cb) {
    if (!file || !file.size) return cb({ data: "" });
    if (file.size > 1.2 * 1024 * 1024) return cb({ error: "이미지는 약 1MB 이하만 올릴 수 있어요." });
    var reader = new FileReader();
    reader.onload = function () { cb({ data: String(reader.result || "") }); };
    reader.onerror = function () { cb({ error: "이미지를 읽지 못했습니다. 다른 파일을 선택해 주세요." }); };
    reader.readAsDataURL(file);
  }
  function submitCompose(form, asDraft) {
    var fd = new FormData(form);
    var input = {
      type: fd.get("type"), category: fd.get("category") || "", title: fd.get("title"), body: fd.get("body"), tags: fd.get("tags"),
      lifeStage: fd.get("lifeStage") || "", lifeTopicId: fd.get("lifeTopicId") || "", visibility: fd.get("visibility") || "public",
      communityId: fd.get("communityId") || "", region: fd.get("region") || "", draft: !!asDraft
    };
    var err = validatePost(input);
    if (err) { formError(form, err.field, err.msg); return; }
    var removeImg = form.querySelector('[data-lv-cm-remove-image][aria-pressed="true"]');
    readFileAsDataURL(fd.get("image"), function (img) {
      if (img.error) { formError(form, "image", img.error); return; }
      if (img.data) input.image = img.data;
      else if (removeImg) input.image = "";
      var editing = state.editingId;
      var res = editing ? Repo.update(editing, input) : Repo.create(input);
      if (res.status === "invalid") { formError(form, res.field, res.msg); return; }
      if (res.status !== "ok") { formError(form, "", "저장하지 못했습니다. 이 기기의 저장 공간을 확인해 주세요."); return; }
      state.dirty = false;
      closeCompose(true);
      renderAll();
      if (asDraft) {
        announce("임시 저장했습니다. 임시 저장 글은 피드와 검색에 나오지 않습니다.");
        return;
      }
      announce(editing ? "글을 수정했습니다." : "글을 게시했습니다. 이 기기에 저장되었습니다.");
      var h = "#cm-post-" + res.post.id;
      if (location.hash === h) showDetail(res.post.id, { focus: true });
      else location.hash = h.slice(1);
    });
  }

  /* ───────── Detail ───────── */
  function aiPayload(p) {
    var stage = stageById(p.lifeStage);
    return {
      source: "community", stage: p.lifeStage || "", stageLabel: stage ? stage.label : "",
      topicId: "cm:" + p.id, topicTitle: p.title, category: [catLabel(p.category), typeLabel(p.type)].filter(Boolean).join(" · "),
      url: "#cm-post-" + p.id, summary: String(p.body || "").replace(/\s+/g, " ").slice(0, 100),
      q: "이 커뮤니티 글과 관련해 참고할 만한 일반 정보를 알려줘. 글을 대신 쓰거나 게시하지 말고 설명만 해 줘."
    };
  }
  function commentsHtml(post, store) {
    var list = store.comments.filter(function (c) { return c.postId === post.id; }).sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
    var roots = list.filter(function (c) { return !c.parentId; });
    function one(c, isReply) {
      var kids = isReply ? [] : list.filter(function (x) { return x.parentId === c.id; });
      var kidsHtml = kids.length ? '<ul class="lv-cm-replies">' + kids.map(function (k) { return one(k, true); }).join("") + "</ul>" : "";
      if (c.deleted) return '<li class="lv-cm-comment is-deleted"><p>삭제된 댓글입니다.</p>' + kidsHtml + "</li>";
      var own = c.authorId === "local";
      var editing = state.editCommentId === c.id;
      var body = editing
        ? '<form class="lv-cm-comment-edit" data-lv-cm-comment-edit="' + esc(c.id) + '"><label class="lv-cm-field"><span>댓글 수정</span><textarea name="body" rows="3" maxlength="' + LIMITS.comment + '">' + esc(c.body) + '</textarea></label>' +
            '<p class="lv-cm-form__err" data-lv-cm-cerr role="alert"></p><div class="lv-cm-comment__acts"><button type="submit">저장</button><button type="button" data-lv-cm-comment-cancel>취소</button></div></form>'
        : '<p class="lv-cm-comment__body">' + esc(c.body).replace(/\n/g, "<br>") + "</p>";
      return '<li class="lv-cm-comment' + (isReply ? " is-reply" : "") + '" id="lv-cm-c-' + esc(c.id) + '">' +
        '<p class="lv-cm-comment__meta"><strong>' + esc(c.authorNick || "나") + "</strong> · " + esc(fmtDate(c.createdAt)) + (c.updatedAt ? " · 수정됨" : "") +
          (post.helpfulCommentId === c.id ? ' · <span class="lv-cm-badge">도움 된 답변</span>' : "") + "</p>" +
        body +
        (editing ? "" : '<div class="lv-cm-comment__acts">' +
          (!isReply ? '<button type="button" data-lv-cm-reply="' + esc(c.id) + '">답글</button>' : "") +
          (own ? '<button type="button" data-lv-cm-edit-comment="' + esc(c.id) + '">수정</button><button type="button" data-lv-cm-del-comment="' + esc(c.id) + '">삭제</button>' : "") +
          '<button type="button" data-lv-cm-report="comment:' + esc(c.id) + '">신고</button>' +
          (post.type === "question" && post.authorId === "local" && post.helpfulCommentId !== c.id ? '<button type="button" data-lv-cm-helpful="' + esc(c.id) + '">도움 된 답변</button>' : "") +
        "</div>") + kidsHtml + "</li>";
    }
    var n = list.filter(function (c) { return !c.deleted; }).length;
    var replyTo = state.replyTo ? list.find(function (c) { return c.id === state.replyTo && !c.deleted; }) : null;
    return '<section class="lv-cm-detail__comments" aria-labelledby="lv-cm-comments-title">' +
      '<h3 id="lv-cm-comments-title">댓글 ' + n + "</h3>" +
      (roots.length ? '<ul class="lv-cm-comments">' + roots.map(function (c) { return one(c, false); }).join("") + "</ul>" : '<p class="lv-cm-note lv-cm-note--plain">아직 댓글이 없습니다.</p>') +
      '<form class="lv-cm-comment-form" id="lv-cm-comment-form" data-lv-cm-comment-form data-post="' + esc(post.id) + '">' +
        (replyTo ? '<p class="lv-cm-note lv-cm-note--plain">‘' + esc(String(replyTo.body).slice(0, 30)) + '’에 답글 작성 중 · <button type="button" class="lv-cm-text-btn" data-lv-cm-reply-cancel>답글 취소</button></p>' : "") +
        '<label class="lv-cm-field"><span>' + (replyTo ? "답글" : "댓글") + " " + counter("comment", LIMITS.comment, "") + '</span><textarea name="body" maxlength="' + LIMITS.comment + '" rows="3" placeholder="개인정보는 적지 마세요."></textarea></label>' +
        '<p class="lv-cm-form__err" data-lv-cm-cerr role="alert"></p>' +
        '<button type="submit" class="lv-cm-btn lv-cm-btn--dark lv-cm-btn--sm">' + (replyTo ? "답글 등록" : "댓글 등록") + "</button>" +
      "</form></section>";
  }
  function showDetail(id, opts) {
    opts = opts || {};
    var sec = $("#cm-detail");
    var host = $("[data-lv-cm-detail]");
    if (!sec || !host) return;
    var store = loadStore();
    var post = store.posts.find(function (p) { return p.id === id && !p.deleted; });
    if (state.detailId !== id) { state.replyTo = ""; state.editCommentId = ""; }
    state.detailId = id;
    sec.hidden = false;
    var back = '<a class="lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm" href="' + esc(state.lastFeedHash || "#cm-home") + '" data-lv-cm-back>← 피드로</a>';
    if (!post || (post.visibility === "private" && post.authorId !== "local")) {
      host.innerHTML = back + '<article class="lv-cm-detail">' + '<h2 class="lv-cm-title lv-cm-title--md">글을 찾을 수 없습니다</h2>' +
        '<p class="lv-cm-note lv-cm-note--plain">삭제되었거나 다른 기기에서 작성된 글입니다. 커뮤니티 글은 현재 작성한 기기에만 저장됩니다.</p>' +
        '<div class="lv-cm-actions"><a class="lv-cm-btn lv-cm-btn--dark" href="#cm-home">피드 보기</a></div></article>';
      document.title = "커뮤니티 · LIVON";
      if (opts.scroll !== false) scrollToId("cm-detail", true);
      return;
    }
    var comm = findCommunity(post.communityId);
    var stage = stageById(post.lifeStage);
    var topic = topicOf(post.lifeTopicId);
    var tHref = topicHref(post.lifeTopicId);
    var reacted = Repo.reacted(store, id);
    var saved = Repo.isSaved(id);
    var related = store.posts.filter(function (p) {
      return p.id !== id && isVisible(p, store) && ((post.lifeTopicId && p.lifeTopicId === post.lifeTopicId) || (post.category && p.category === post.category) || (p.tags || []).some(function (t) { return (post.tags || []).indexOf(t) >= 0; }));
    }).slice(0, 3);
    var exQ = (topic && topic.title) || catLabel(post.category) || (post.tags || [])[0] || post.title;
    host.innerHTML = back +
      '<article class="lv-cm-detail" aria-labelledby="lv-cm-detail-title">' +
        '<div class="lv-cm-card__meta">' +
          '<span class="lv-cm-badge">' + esc(typeLabel(post.type)) + "</span>" +
          (catLabel(post.category) ? '<a href="#cm-home?cat=' + esc(post.category) + '">' + esc(catLabel(post.category)) + "</a>" : "") +
          (stage ? '<a href="#cm-home?stage=' + esc(stage.id) + '">' + esc(stage.label) + "</a>" : "") +
          (comm ? "<span>" + esc(comm.name) + "</span>" : "") +
          (post.createdAt ? "<span>" + esc(fmtDate(post.createdAt)) + (post.updatedAt && post.updatedAt !== post.createdAt ? " · 수정됨" : "") + "</span>" : "") +
          (post.type === "question" ? "<span>" + (post.resolved ? "해결됨" : "답변을 기다리는 중") + "</span>" : "") +
          (post.visibility === "private" ? "<span>비공개 (나만)</span>" : post.visibility === "members" ? "<span>가입 커뮤니티 공개</span>" : "") +
        "</div>" +
        '<p class="lv-cm-card__author">' + esc(post.authorNick || "나") + (post.authorId === "local" ? " · 내 글" : "") + "</p>" +
        '<h2 class="lv-cm-title lv-cm-title--md" id="lv-cm-detail-title" tabindex="-1">' + esc(post.title) + "</h2>" +
        (post.image ? '<img class="lv-cm-detail__img" src="' + esc(post.image) + '" alt="" />' : "") +
        '<div class="lv-cm-detail__body">' + esc(post.body).replace(/\n/g, "<br>") + "</div>" +
        ((post.tags || []).length ? '<p class="lv-cm-card__tags">' + (post.tags || []).map(function (t) { return '<a href="#cm-home?q=' + encodeURIComponent(t) + '">#' + esc(t) + "</a>"; }).join(" ") + "</p>" : "") +
        '<div class="lv-cm-actions lv-cm-detail__acts">' +
          '<button type="button" class="lv-cm-btn' + (reacted ? "" : " lv-cm-btn--outline") + '" data-lv-cm-like="' + esc(id) + '" aria-pressed="' + reacted + '">' + (reacted ? "공감했어요" : "공감하기") + "</button>" +
          '<button type="button" class="lv-cm-btn lv-cm-btn--outline" data-lv-cm-to-comment>댓글 쓰기</button>' +
          saveButton(post, saved, "lv-cm-btn lv-cm-btn--outline") +
          '<button type="button" class="lv-cm-btn lv-cm-btn--ghost" data-lv-cm-share="' + esc(id) + '">공유</button>' +
          '<button type="button" class="lv-cm-btn lv-cm-btn--ghost" data-lv-cm-report="post:' + esc(id) + '">신고</button>' +
          '<button type="button" class="lv-cm-btn lv-cm-btn--ghost" data-lh-ai="' + esc(JSON.stringify(aiPayload(post))) + '">LIVON AI에게 물어보기</button>' +
          (post.authorId === "local"
            ? '<button type="button" class="lv-cm-btn lv-cm-btn--ghost" data-lv-cm-edit="' + esc(id) + '">수정</button>' +
              '<button type="button" class="lv-cm-btn lv-cm-btn--ghost" data-lv-cm-del-post="' + esc(id) + '">삭제</button>'
            : "") +
        "</div>" +
        '<p class="lv-cm-note lv-cm-note--plain">커뮤니티 글은 개인의 경험입니다. 건강·돈·법률 판단은 전문가와 확인하세요.</p>' +
        '<section class="lv-cm-detail__links" aria-labelledby="lv-cm-links-title"><h3 id="lv-cm-links-title">이어서 보기</h3><ul>' +
          (tHref ? '<li><a href="' + esc(tHref) + '">라이프 스테이지 · ' + esc(topic ? topic.title : (stage ? stage.label + " 주제" : "관련 주제")) + "</a></li>"
            : stage ? '<li><a href="#life/' + esc(stage.slug) + '">라이프 스테이지 · ' + esc(stage.label) + "</a></li>" : "") +
          '<li><a href="#ex-results?q=' + encodeURIComponent(exQ) + '">탐색에서 ‘' + esc(exQ) + "’ 찾기</a></li>" +
          (post.category ? '<li><a href="#cm-home?cat=' + esc(post.category) + '">커뮤니티 · ' + esc(catLabel(post.category)) + " 글 더 보기</a></li>" : "") +
        "</ul></section>" +
        commentsHtml(post, store) +
        (related.length ? '<section class="lv-cm-detail__related" aria-labelledby="lv-cm-related-title"><h3 id="lv-cm-related-title">관련 글</h3><div class="lv-cm-feed-list">' + related.map(function (p) { return cardHtml(p, store); }).join("") + "</div></section>" : "") +
      "</article>";
    document.title = post.title + " · 커뮤니티 · LIVON";
    if (opts.scroll !== false) scrollToId("cm-detail", true);
    if (opts.focus) { var h = $("#lv-cm-detail-title"); if (h) h.focus({ preventScroll: true }); }
  }
  function hideDetail() {
    var sec = $("#cm-detail");
    if (sec) sec.hidden = true;
    state.detailId = "";
    if (/ · 커뮤니티 · LIVON$|^커뮤니티 · LIVON$/.test(document.title)) document.title = document.title.replace(/^.* · 커뮤니티 · LIVON$|^커뮤니티 · LIVON$/, "LIVON");
  }

  function renderAll() {
    renderFeed();
    renderSide();
    renderCommunities();
    renderChallenges();
    renderMine();
    if (window.LivonLifeHub && window.LivonLifeHub.saves) window.LivonLifeHub.saves.refresh();
  }
  function rerenderAfterChange() {
    renderAll();
    if (state.detailId) showDetail(state.detailId, { scroll: false });
  }

  function share(id) {
    var p = Repo.get(id);
    if (!p) return;
    var url = location.origin + location.pathname + "#cm-post-" + id;
    var note = "커뮤니티 글은 현재 이 기기에만 저장되어 있어 다른 기기에서는 열리지 않을 수 있습니다.";
    if (navigator.share) {
      navigator.share({ title: p.title + " · LIVON 커뮤니티", url: url }).then(function () { announce("공유했습니다. " + note); }, function (err) {
        if (err && err.name === "AbortError") return;
        copy(url, note);
      });
    } else copy(url, note);
  }
  function copy(url, note) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { announce("링크를 복사했습니다. " + note); }, function () { showUrl(url, note); });
    } else showUrl(url, note);
  }
  function showUrl(url, note) {
    openDialog('<h2 id="lv-cm-dialog-title">링크 복사</h2><p id="lv-cm-dialog-desc">' + esc(note) + '</p><label class="lv-cm-field"><span>글 주소</span><input type="text" readonly value="' + esc(url) + '" data-lv-cm-autofocus /></label>' +
      '<div class="lv-cm-form__acts"><button type="button" class="lv-cm-btn lv-cm-btn--dark" data-lv-cm-dialog-close>닫기</button></div>');
    var inp = dialog && dialog.el.querySelector("input");
    if (inp) inp.select();
  }

  function saveFeedScroll() {
    try { sessionStorage.setItem(KEY_FEED_SCROLL, JSON.stringify({ hash: state.lastFeedHash, y: window.pageYOffset })); } catch (e) {}
  }
  function restoreFeedScroll(hash) {
    var s = null;
    try { s = JSON.parse(sessionStorage.getItem(KEY_FEED_SCROLL) || "null"); } catch (e) {}
    if (s && s.hash === hash && typeof s.y === "number") { window.scrollTo(0, s.y); return true; }
    return false;
  }

  /* ───────── Events ───────── */
  function bindEvents() {
    if (bound) return;
    bound = true;
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest("#community")) return;
      if (e.target.closest("[data-lv-cm-dialog-close]")) { e.preventDefault(); closeDialog(false); return; }
      if (e.target.closest("[data-lv-cm-dialog-ok]")) { e.preventDefault(); closeDialog(true); return; }
      var scroll = e.target.closest("[data-lv-cm-scroll]");
      if (scroll) {
        e.preventDefault();
        scrollToId((scroll.getAttribute("href") || "#cm-home").replace("#", ""));
        return;
      }
      var compose = e.target.closest("[data-lv-cm-compose]");
      if (compose) {
        e.preventDefault();
        openCompose(compose.getAttribute("data-lv-cm-compose") || "story", null, compose);
        return;
      }
      if (e.target.closest("[data-lv-cm-go]")) { saveFeedScroll(); return; }
      var tab = e.target.closest("[data-lv-cm-tab]");
      if (tab) {
        e.preventDefault();
        state.tab = tab.getAttribute("data-lv-cm-tab") || "latest";
        state.shown = PAGE;
        renderFeed(); syncFeedUrl();
        var t = $('[data-lv-cm-tab="' + state.tab + '"]'); if (t) t.focus();
        return;
      }
      var cat = e.target.closest("[data-lv-cm-cat]");
      if (cat) {
        e.preventDefault();
        state.cat = cat.getAttribute("data-lv-cm-cat") || "";
        state.shown = PAGE;
        renderFeed(); syncFeedUrl();
        var c = $('[data-lv-cm-cat="' + state.cat + '"]'); if (c) c.focus();
        announce((catLabel(state.cat) || "전체") + " 주제 · 게시글 " + filterFeed().length + "개");
        return;
      }
      if (e.target.closest("[data-lv-cm-reset]")) {
        e.preventDefault();
        applyFeedParams({ tab: state.tab });
        var input = $("[data-lv-cm-q]"); if (input) input.value = "";
        var cb = $("[data-lv-cm-clear]"); if (cb) cb.hidden = true;
        renderFeed(); syncFeedUrl();
        var r0 = $('[data-lv-cm-cat=""]'); if (r0) r0.focus();
        announce("필터를 초기화했습니다.");
        return;
      }
      if (e.target.closest("[data-lv-cm-more]")) {
        e.preventDefault();
        var before = state.shown;
        state.shown += PAGE;
        renderFeed();
        var cards = $$("[data-lv-cm-feed] .lv-cm-card h3 a");
        if (cards[before]) cards[before].focus();
        return;
      }
      var clear = e.target.closest("[data-lv-cm-clear]");
      if (clear) {
        e.preventDefault();
        var inp = $("[data-lv-cm-q]");
        if (inp) { inp.value = ""; inp.focus(); }
        state.q = "";
        clear.hidden = true;
        renderFeed(); syncFeedUrl();
        return;
      }
      var like = e.target.closest("[data-lv-cm-like]");
      if (like) {
        e.preventDefault();
        var lid = like.getAttribute("data-lv-cm-like");
        var on = Repo.toggleReaction(lid);
        $$('[data-lv-cm-like="' + lid + '"]').forEach(function (b) {
          b.setAttribute("aria-pressed", String(on));
          b.classList.toggle("is-on", on);
          if (b.classList.contains("lv-cm-btn")) b.classList.toggle("lv-cm-btn--outline", !on);
          var sr = b.querySelector(".visually-hidden");
          b.textContent = on ? "공감했어요" : "공감하기";
          if (sr) b.appendChild(sr);
        });
        renderMine();
        announce(on ? "공감했어요." : "공감을 취소했습니다.");
        return;
      }
      var join = e.target.closest("[data-lv-cm-join]");
      if (join) {
        e.preventDefault();
        var jid = join.getAttribute("data-lv-cm-join");
        var label = join.getAttribute("data-lv-cm-label") || "";
        var st2 = loadStore();
        var exists = isJoined(st2, jid);
        st2.joined = exists ? st2.joined.filter(function (x) { return x.id !== jid; }) : st2.joined.concat([{ id: jid, at: Date.now(), label: label }]);
        saveStore(st2);
        writeJSON(KEY_LEGACY_JOINED, st2.joined);
        renderCommunities(); renderSide(); renderMine(); renderFeed();
        var again = $('[data-lv-cm-join="' + jid + '"]'); if (again) again.focus();
        announce("‘" + label + "’ " + (exists ? "가입을 해제했습니다." : "에 가입했습니다. 이 기기에만 기록됩니다."));
        return;
      }
      var challenge = e.target.closest("[data-lv-cm-challenge]");
      if (challenge) {
        e.preventDefault();
        var chid = challenge.getAttribute("data-lv-cm-challenge");
        var st4 = loadStore();
        var was = !!st4.challenges[chid];
        if (was) delete st4.challenges[chid];
        else st4.challenges[chid] = { joinedAt: Date.now(), logs: {} };
        saveStore(st4);
        renderChallenges(); renderMine(); renderSide();
        var b4 = $('[data-lv-cm-challenge="' + chid + '"]'); if (b4) b4.focus();
        announce(was ? "챌린지 참여를 그만두었습니다." : "챌린지에 참여했습니다.");
        return;
      }
      var clog = e.target.closest("[data-lv-cm-challenge-log]");
      if (clog) {
        e.preventDefault();
        var cid2 = clog.getAttribute("data-lv-cm-challenge-log");
        var st5 = loadStore();
        if (!st5.challenges[cid2]) st5.challenges[cid2] = { joinedAt: Date.now(), logs: {} };
        var key = todayKey();
        var had = !!st5.challenges[cid2].logs[key];
        if (had) delete st5.challenges[cid2].logs[key]; else st5.challenges[cid2].logs[key] = true;
        saveStore(st5);
        renderChallenges();
        var b5 = $('[data-lv-cm-challenge-log="' + cid2 + '"]'); if (b5) b5.focus();
        announce(had ? "오늘 기록을 취소했습니다." : "오늘 실천을 기록했습니다.");
        return;
      }
      if (e.target.closest("[data-lv-cm-modal-close]")) { e.preventDefault(); closeCompose(false); return; }
      var edit = e.target.closest("[data-lv-cm-edit]");
      if (edit) {
        e.preventDefault();
        var ep = Repo.get(edit.getAttribute("data-lv-cm-edit"));
        if (ep && ep.authorId === "local") openCompose(ep.type, ep, edit);
        return;
      }
      var delPost = e.target.closest("[data-lv-cm-del-post]");
      if (delPost) {
        e.preventDefault();
        var did = delPost.getAttribute("data-lv-cm-del-post");
        var dp = Repo.get(did);
        if (!dp) return;
        var nComments = Repo.commentCount(loadStore(), did);
        confirmDialog({ title: "글 삭제", body: "‘" + dp.title + "’을(를) 삭제할까요? 이 기기에 저장된 글" + (nComments ? "과 댓글 " + nComments + "개" : "") + ", 공감·저장 상태가 함께 삭제되며 되돌릴 수 없습니다.", ok: "삭제", danger: true })
          .then(function (ok) {
            if (!ok) return;
            if (Repo.remove(did).status !== "ok") { announce("삭제하지 못했습니다."); return; }
            hideDetail();
            var fh = state.lastFeedHash || "#cm-home";
            history.replaceState(history.state, "", fh);
            applyFeedParams(parseHash(fh).params);
            renderAll();
            scrollToId("cm-home", true);
            restoreFocus(null);
            announce("글을 삭제했습니다.");
          });
        return;
      }
      if (e.target.closest("[data-lv-cm-to-comment]")) {
        e.preventDefault();
        var ta = $("#lv-cm-comment-form textarea");
        if (ta) { ta.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" }); ta.focus({ preventScroll: true }); }
        return;
      }
      var reply = e.target.closest("[data-lv-cm-reply]");
      if (reply) {
        e.preventDefault();
        state.replyTo = reply.getAttribute("data-lv-cm-reply") || "";
        state.editCommentId = "";
        showDetail(state.detailId, { scroll: false });
        var ta2 = $("#lv-cm-comment-form textarea");
        if (ta2) { ta2.scrollIntoView({ block: "center" }); ta2.focus({ preventScroll: true }); }
        return;
      }
      if (e.target.closest("[data-lv-cm-reply-cancel]")) {
        e.preventDefault();
        state.replyTo = "";
        showDetail(state.detailId, { scroll: false });
        var ta3 = $("#lv-cm-comment-form textarea"); if (ta3) ta3.focus({ preventScroll: true });
        return;
      }
      var ec = e.target.closest("[data-lv-cm-edit-comment]");
      if (ec) {
        e.preventDefault();
        state.editCommentId = ec.getAttribute("data-lv-cm-edit-comment");
        showDetail(state.detailId, { scroll: false });
        var ta4 = $('[data-lv-cm-comment-edit="' + state.editCommentId + '"] textarea'); if (ta4) ta4.focus({ preventScroll: true });
        return;
      }
      if (e.target.closest("[data-lv-cm-comment-cancel]")) {
        e.preventDefault();
        var cancelled = state.editCommentId;
        state.editCommentId = "";
        showDetail(state.detailId, { scroll: false });
        var b6 = $('[data-lv-cm-edit-comment="' + cancelled + '"]'); if (b6) b6.focus({ preventScroll: true });
        return;
      }
      var delC = e.target.closest("[data-lv-cm-del-comment]");
      if (delC) {
        e.preventDefault();
        var dcid = delC.getAttribute("data-lv-cm-del-comment");
        confirmDialog({ title: "댓글 삭제", body: "이 댓글을 삭제할까요? 되돌릴 수 없습니다.", ok: "삭제", danger: true }).then(function (ok) {
          if (!ok) return;
          var r = Repo.removeComment(dcid);
          if (r.status !== "ok") return;
          rerenderAfterChange();
          var t = $("#lv-cm-comments-title"); if (t) { t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); }
          announce("댓글을 삭제했습니다.");
        });
        return;
      }
      var helpful = e.target.closest("[data-lv-cm-helpful]");
      if (helpful) {
        e.preventDefault();
        var st8 = loadStore();
        var hp = st8.posts.find(function (x) { return x.id === state.detailId; });
        if (hp && hp.authorId === "local") {
          hp.helpfulCommentId = helpful.getAttribute("data-lv-cm-helpful");
          hp.resolved = true;
          saveStore(st8);
          rerenderAfterChange();
          announce("도움 된 답변으로 표시했습니다.");
        }
        return;
      }
      var report = e.target.closest("[data-lv-cm-report]");
      if (report) { e.preventDefault(); openReport(report.getAttribute("data-lv-cm-report"), report); return; }
      var sh = e.target.closest("[data-lv-cm-share]");
      if (sh) { e.preventDefault(); share(sh.getAttribute("data-lv-cm-share")); return; }
      var rmImg = e.target.closest("[data-lv-cm-remove-image]");
      if (rmImg) {
        e.preventDefault();
        var on2 = rmImg.getAttribute("aria-pressed") !== "true";
        rmImg.setAttribute("aria-pressed", String(on2));
        rmImg.textContent = on2 ? "이미지 제거 예정 (취소)" : "이미지 제거";
        state.dirty = true;
        return;
      }
      if (e.target.closest("[data-lv-cm-draft]")) {
        e.preventDefault();
        var formEl = $("[data-lv-cm-write]");
        if (formEl) submitCompose(formEl, true);
        return;
      }
    });

    /* shared save buttons (data-lh-save) are handled by life-hub.js; re-render our views after it */
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest('#community [data-lh-save="community"], [data-lh-save-local]')) return;
      setTimeout(function () { if (document.documentElement.dataset.lvView === "community") renderMine(); }, 0);
    });

    document.addEventListener("change", function (e) {
      var t = e.target;
      if (!t.closest || !t.closest("#community")) return;
      if (t.matches("[data-lv-cm-type-filter]")) { state.type = t.value; state.shown = PAGE; renderFeed(); syncFeedUrl(); var a = $("[data-lv-cm-type-filter]"); if (a) a.focus(); return; }
      if (t.matches("[data-lv-cm-stage-filter]")) { state.stage = t.value; state.shown = PAGE; renderFeed(); syncFeedUrl(); var b = $("[data-lv-cm-stage-filter]"); if (b) b.focus(); return; }
      var form = t.closest("[data-lv-cm-write]");
      if (form) {
        state.dirty = true;
        if (t.name === "lifeStage") refreshTopicSelect(form, "");
        if (t.name === "category") {
          var n = form.querySelector("[data-lv-cm-safety]");
          var msg = safetyNote(t.value);
          if (n) { n.textContent = msg; n.hidden = !msg; }
        }
      }
    });
    document.addEventListener("input", function (e) {
      var t = e.target;
      if (!t.closest || !t.closest("#community")) return;
      if (t.closest("[data-lv-cm-write]")) state.dirty = true;
      if (t.name === "title" || t.name === "body") {
        var cnt = t.closest("form") && t.closest("form").querySelector('[data-lv-cm-counter="' + t.name + '"]');
        if (cnt) cnt.textContent = t.value.length + " / " + (t.name === "title" ? LIMITS.title : LIMITS.body);
      }
      if (t.closest("[data-lv-cm-comment-form]") && t.name === "body") {
        var cc = t.closest("form").querySelector('[data-lv-cm-counter="comment"]');
        if (cc) cc.textContent = t.value.length + " / " + LIMITS.comment;
      }
      if (t.matches("[data-lv-cm-q]")) { var cb = $("[data-lv-cm-clear]"); if (cb) cb.hidden = !t.value; }
      if (t.getAttribute("aria-invalid")) t.removeAttribute("aria-invalid");
    });

    document.addEventListener("submit", function (e) {
      var f = e.target;
      if (!f.closest || !f.closest("#community")) return;
      if (f.matches("[data-lv-cm-form]")) {
        e.preventDefault();
        var input = $("[data-lv-cm-q]");
        state.q = input ? input.value.trim().slice(0, 80) : "";
        state.shown = PAGE;
        var clearBtn = $("[data-lv-cm-clear]");
        if (clearBtn) clearBtn.hidden = !state.q;
        hideDetail();
        renderFeed(); syncFeedUrl();
        announce(state.q ? "‘" + state.q + "’ 검색 결과 " + filterFeed().length + "개" : "전체 글을 표시합니다.");
        return;
      }
      if (f.matches("[data-lv-cm-write]")) { e.preventDefault(); submitCompose(f, false); return; }
      if (f.matches("[data-lv-cm-report-form]")) {
        e.preventDefault();
        var reason = (f.querySelector("input[name=reason]:checked") || {}).value;
        var res = Repo.report(f.getAttribute("data-target"), reason);
        if (res.status !== "ok") { var er = f.querySelector("[data-lv-cm-report-err]"); if (er) er.textContent = res.msg; return; }
        closeDialog(false);
        renderMine();
        announce("이 기기에 신고 기록이 저장되었습니다. 서버 신고 시스템은 아직 연결되지 않았습니다.");
        return;
      }
      if (f.matches("[data-lv-cm-profile-form]")) {
        e.preventDefault();
        var nick = String(new FormData(f).get("nick") || "").trim().slice(0, 20) || "나";
        var st10 = loadStore();
        st10.profile.nick = nick;
        saveStore(st10);
        renderMine();
        var ni = $("[data-lv-cm-profile-form] input"); if (ni) ni.focus();
        announce("표시 이름을 이 기기에 저장했습니다.");
        return;
      }
      if (f.matches("[data-lv-cm-comment-edit]")) {
        e.preventDefault();
        var cid = f.getAttribute("data-lv-cm-comment-edit");
        var r1 = Repo.editComment(cid, new FormData(f).get("body"));
        if (r1.status === "invalid") { var e1 = f.querySelector("[data-lv-cm-cerr]"); if (e1) e1.textContent = r1.msg; return; }
        state.editCommentId = "";
        rerenderAfterChange();
        var b1 = $('[data-lv-cm-edit-comment="' + cid + '"]'); if (b1) b1.focus({ preventScroll: true });
        announce("댓글을 수정했습니다.");
        return;
      }
      if (f.matches("[data-lv-cm-comment-form]")) {
        e.preventDefault();
        var r2 = Repo.addComment(f.getAttribute("data-post"), new FormData(f).get("body"), state.replyTo);
        if (r2.status !== "ok") {
          var e2 = f.querySelector("[data-lv-cm-cerr]");
          if (e2) e2.textContent = r2.msg || "댓글을 등록하지 못했습니다.";
          var ta = f.querySelector("textarea"); if (ta) { ta.setAttribute("aria-invalid", "true"); ta.focus(); }
          return;
        }
        var wasReply = !!state.replyTo;
        state.replyTo = "";
        rerenderAfterChange();
        var nc = document.getElementById("lv-cm-c-" + r2.comment.id);
        if (nc) { nc.setAttribute("tabindex", "-1"); nc.focus({ preventScroll: true }); }
        announce(wasReply ? "답글을 등록했습니다." : "댓글을 등록했습니다.");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (document.documentElement.dataset.lvView !== "community") return;
      if (e.key === "Tab") { trapFocus(e); return; }
      if (e.key === "Escape") {
        if (dialog) { e.preventDefault(); e.stopPropagation(); closeDialog(false); return; }
        if (composeOpen()) { e.preventDefault(); e.stopPropagation(); closeCompose(false); return; }
        if (state.editCommentId) { state.editCommentId = ""; showDetail(state.detailId, { scroll: false }); }
        return;
      }
      var tab = e.target.closest && e.target.closest("[data-lv-cm-tab]");
      if (tab && (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End")) {
        e.preventDefault();
        var ids = TABS.map(function (t) { return t.id; });
        var i = ids.indexOf(tab.getAttribute("data-lv-cm-tab"));
        i = e.key === "Home" ? 0 : e.key === "End" ? ids.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length;
        state.tab = ids[i]; state.shown = PAGE;
        renderFeed(); syncFeedUrl();
        var nt = $('[data-lv-cm-tab="' + state.tab + '"]'); if (nt) nt.focus();
      }
    }, true);

    window.addEventListener("storage", function (e) {
      if (document.documentElement.dataset.lvView !== "community") return;
      if (e.key === STORE_KEY || e.key === "livon.platform.v1") rerenderAfterChange();
    });
  }

  function bindFilm() {
    var hero = $("#cm-hero");
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
    $$("[data-lv-cm-reveal]").forEach(function (el) { el.classList.add("is-in"); });
  }
  function bindNav() {
    var links = $$(".lv-cm-nav__track a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = (a.getAttribute("href") || "").replace("#", "");
      if (id) map[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-on"); a.removeAttribute("aria-current"); });
        if (map[entry.target.id]) { map[entry.target.id].classList.add("is-on"); map[entry.target.id].setAttribute("aria-current", "location"); }
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* Routes: #community · #cm-home[?tab=&cat=&type=&stage=&q=] · #cm-post-{id} · #cm-write[?type=] · #cm-{section} */
  function onShow(hash) {
    init();
    var r = parseHash(hash);
    var id = r.id;
    if (dialog) closeDialog(false);
    if (id.indexOf("cm-post-") === 0) {
      if (composeOpen()) closeCompose(true);
      renderAll();
      showDetail(id.slice(8), { focus: true });
      return;
    }
    if (id === "cm-write") {
      renderAll();
      var q = r.params.type;
      if (!composeOpen()) openCompose(COMPOSE_TYPES.indexOf(q) >= 0 ? q : "story");
      return;
    }
    if (composeOpen()) closeCompose(true);
    hideDetail();
    if (id === "cm-home") {
      applyFeedParams(r.params);
      var input = $("[data-lv-cm-q]"); if (input) input.value = state.q;
      var cb = $("[data-lv-cm-clear]"); if (cb) cb.hidden = !state.q;
      state.lastFeedHash = feedHash();
      renderAll();
      if (!restoreFeedScroll(state.lastFeedHash)) setTimeout(function () { scrollToId("cm-home", true); }, 30);
      return;
    }
    renderAll();
    if (!id || id === "community" || id === "cm-hero") { window.scrollTo(0, 0); return; }
    if (id.indexOf("cm-") === 0) setTimeout(function () { scrollToId(id); }, 40);
  }

  var inited = false;
  function init() {
    if (inited || !$("#community")) return;
    inited = true;
    bindFilm();
    bindReveal();
    bindNav();
    bindEvents();
  }

  window.LivonCommunityRepo = Repo;
  window.LivonCommunity = {
    onShow: onShow,
    openCompose: function (type) { init(); openCompose(type); },
    openPost: function (id) { location.hash = "cm-post-" + id; },
    _test: {
      repo: Repo, loadStore: loadStore, migrate: migrate, validatePost: validatePost, parseTags: parseTags, filterFeed: filterFeed,
      applyFeedParams: applyFeedParams, feedHash: feedHash, parseHash: parseHash, state: state, categories: categories,
      userSignals: userSignals, forYouScore: forYouScore, aiPayload: aiPayload, saveId: saveId, isSearchable: isSearchable, topicHref: topicHref
    }
  };

  function boot() {
    init();
    if (!inited) return;
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "community") onShow(hash || "community");
    else renderAll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
