(function () {
  var DATA = window.LivonCommunityData || { communities: [], challenges: [], typeLabels: {}, questionFields: [], interests: [], regions: [], rules: [] };
  var STORE_KEY = "livon.cmStore.v1";
  var KEY_LEGACY_JOINED = "livon.cmJoined";
  var KEY_LEGACY_INTERESTS = "livon.cmInterests";
  var KEY_ML = "livon.mlStore.v1";
  var KEY_ML_INTERESTS = "livon.mlInterests";

  var state = {
    tab: "latest",
    q: "",
    detailId: "",
    editingId: null,
    composeType: "story",
    dirty: false
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
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { alert("저장에 실패했습니다. 저장 공간을 확인해 주세요."); }
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
  function todayKey() {
    var d = new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  function fmtDate(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    return d.getFullYear() + "." + (d.getMonth() + 1) + "." + d.getDate();
  }

  function emptyStore() {
    return {
      profile: { nick: "나", bio: "", interests: [] },
      posts: [],
      comments: [],
      likes: {},
      commentLikes: {},
      saves: [],
      joined: [],
      challenges: {},
      blocked: [],
      reports: [],
      drafts: [],
      region: ""
    };
  }

  function loadStore() {
    var store = readJSON(STORE_KEY, null);
    if (!store || typeof store !== "object") {
      store = emptyStore();
      var legacyJoined = readJSON(KEY_LEGACY_JOINED, []);
      var legacyInt = readJSON(KEY_LEGACY_INTERESTS, []);
      if (Array.isArray(legacyJoined)) {
        store.joined = legacyJoined.map(function (x) {
          return typeof x === "string" ? { id: x, at: Date.now() } : { id: x.id, at: x.at || Date.now() };
        });
      }
      if (Array.isArray(legacyInt)) store.profile.interests = legacyInt.slice(0, 20);
      saveStore(store);
    }
    store.posts = Array.isArray(store.posts) ? store.posts : [];
    store.comments = Array.isArray(store.comments) ? store.comments : [];
    store.likes = store.likes && typeof store.likes === "object" ? store.likes : {};
    store.saves = Array.isArray(store.saves) ? store.saves : [];
    store.joined = Array.isArray(store.joined) ? store.joined : [];
    store.challenges = store.challenges && typeof store.challenges === "object" ? store.challenges : {};
    store.blocked = Array.isArray(store.blocked) ? store.blocked : [];
    store.reports = Array.isArray(store.reports) ? store.reports : [];
    store.profile = store.profile || { nick: "나", bio: "", interests: [] };
    return store;
  }
  function saveStore(store) { writeJSON(STORE_KEY, store); }

  function findCommunity(id) {
    return (DATA.communities || []).find(function (c) { return c.id === id; });
  }
  function findPost(id) {
    return loadStore().posts.find(function (p) { return p.id === id && !p.deleted; });
  }
  function isJoined(id) {
    return loadStore().joined.some(function (x) { return x.id === id; });
  }
  function isSaved(id) {
    return loadStore().saves.indexOf(id) >= 0;
  }
  function isLiked(id) {
    return !!(loadStore().likes[id]);
  }
  function likeCount(id) {
    return loadStore().likes[id] ? 1 : 0;
  }
  function commentCount(postId) {
    return loadStore().comments.filter(function (c) { return c.postId === postId && !c.deleted; }).length;
  }
  function memberCount(commId) {
    return loadStore().joined.filter(function (x) { return x.id === commId; }).length;
  }
  function postCount(commId) {
    return loadStore().posts.filter(function (p) { return !p.deleted && p.visibility !== "private" && p.communityId === commId; }).length;
  }

  function syncSavedToMyLife(post, adding) {
    try {
      var ml = readJSON(KEY_ML, null);
      if (!ml || typeof ml !== "object") return;
      if (!Array.isArray(ml.savedCommunity)) ml.savedCommunity = [];
      if (adding) {
        if (!ml.savedCommunity.some(function (x) { return x.id === post.id; })) {
          ml.savedCommunity.unshift({ id: post.id, title: post.title, at: Date.now(), href: "#cm-post-" + post.id });
        }
      } else {
        ml.savedCommunity = ml.savedCommunity.filter(function (x) { return x.id !== post.id; });
      }
      writeJSON(KEY_ML, ml);
    } catch (e) {}
  }

  function publicPosts() {
    var store = loadStore();
    return store.posts.filter(function (p) {
      if (p.deleted || p.draft) return false;
      if (p.visibility === "private") return false;
      if (p.visibility === "members") {
        return p.authorId === "local" || store.joined.some(function (j) { return j.id === p.communityId; });
      }
      return true;
    });
  }

  function searchExtras(q) {
    if (!q) return { communities: [], challenges: [] };
    var ql = q.toLowerCase();
    return {
      communities: (DATA.communities || []).filter(function (c) {
        return [c.name, c.desc, c.interest, c.stage].join(" ").toLowerCase().indexOf(ql) >= 0;
      }).slice(0, 6),
      challenges: (DATA.challenges || []).filter(function (c) {
        return [c.title, c.goal, c.field, c.desc].join(" ").toLowerCase().indexOf(ql) >= 0;
      }).slice(0, 4)
    };
  }

  function scorePost(p, q) {
    if (!q) return 1;
    var hay = [p.title, p.body, (p.tags || []).join(" "), p.field, p.region, p.type].join(" ").toLowerCase();
    var tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    var s = 0;
    tokens.forEach(function (t) { if (hay.indexOf(t) >= 0) s += 2; });
    return s;
  }

  function filterFeed() {
    var store = loadStore();
    var q = String(state.q || "").trim();
    var list = publicPosts();
    if (q) list = list.filter(function (p) { return scorePost(p, q) > 0; });

    if (state.tab === "question") list = list.filter(function (p) { return p.type === "question"; });
    else if (state.tab === "experience") list = list.filter(function (p) { return p.type === "experience"; });
    else if (state.tab === "review") list = list.filter(function (p) { return p.type === "review"; });
    else if (state.tab === "meetup") list = list.filter(function (p) { return p.type === "meetup"; });
    else if (state.tab === "joined") {
      var ids = store.joined.map(function (x) { return x.id; });
      list = list.filter(function (p) { return ids.indexOf(p.communityId) >= 0; });
    } else if (state.tab === "recommend") {
      var interests = (store.profile.interests || []).concat(
        store.joined.map(function (j) { var c = findCommunity(j.id); return c ? c.interest : ""; }).filter(Boolean)
      );
      if (interests.length) {
        var scored = list.map(function (p) {
          var s = 0;
          interests.forEach(function (i) { if (scorePost(p, i) > 0 || (p.tags || []).indexOf(i) >= 0) s += 2; });
          return { p: p, s: s };
        }).filter(function (x) { return x.s > 0; });
        if (scored.length) list = scored.sort(function (a, b) { return b.s - a.s || b.p.createdAt - a.p.createdAt; }).map(function (x) { return x.p; });
        else list = list.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
      } else {
        list = list.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
      }
      return list;
    }

    if (state.tab === "popular") {
      list = list.slice().sort(function (a, b) {
        var sa = likeCount(a.id) * 3 + commentCount(a.id);
        var sb = likeCount(b.id) * 3 + commentCount(b.id);
        return sb - sa || b.createdAt - a.createdAt;
      });
    } else if (state.tab !== "recommend") {
      list = list.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
    }
    return list;
  }

  function typeLabel(t) { return (DATA.typeLabels && DATA.typeLabels[t]) || t; }

  function renderTabs() {
    var host = $("[data-lv-cm-tabs]");
    if (!host) return;
    var tabs = [
      { id: "recommend", label: "추천" },
      { id: "latest", label: "최신" },
      { id: "popular", label: "인기" },
      { id: "question", label: "질문" },
      { id: "experience", label: "경험 공유" },
      { id: "review", label: "후기" },
      { id: "meetup", label: "모임" },
      { id: "joined", label: "가입 커뮤니티" }
    ];
    host.innerHTML = tabs.map(function (t) {
      return "<button type=\"button\" role=\"tab\" data-lv-cm-tab=\"" + t.id + "\"" +
        (state.tab === t.id ? " class=\"is-on\" aria-selected=\"true\"" : " aria-selected=\"false\"") + ">" + t.label + "</button>";
    }).join("");
  }

  function cardHtml(p) {
    var comm = findCommunity(p.communityId);
    var likes = likeCount(p.id);
    var comments = commentCount(p.id);
    var saved = isSaved(p.id);
    var liked = isLiked(p.id);
    var preview = String(p.body || "").slice(0, 140);
    var answered = p.type === "question" ? (p.resolved ? "해결됨" : (comments ? "답변 " + comments : "답변 대기")) : "";
    return "<article class=\"lv-cm-card lv-cm-card--" + esc(p.type) + (p.image ? " has-image" : "") + "\">" +
      (p.image ? "<button type=\"button\" class=\"lv-cm-card__media\" data-lv-cm-open=\"" + esc(p.id) + "\"><img src=\"" + esc(p.image) + "\" alt=\"\" loading=\"lazy\" /></button>" : "") +
      "<div class=\"lv-cm-card__body\">" +
        "<div class=\"lv-cm-card__meta\">" +
          "<span class=\"lv-cm-badge\">" + esc(typeLabel(p.type)) + "</span>" +
          (comm ? "<span>" + esc(comm.name) + "</span>" : "") +
          "<span>" + esc(fmtDate(p.createdAt)) + "</span>" +
          (answered ? "<span>" + esc(answered) + "</span>" : "") +
        "</div>" +
        "<p class=\"lv-cm-card__author\">" + esc(p.authorNick || "나") + "</p>" +
        "<h3><button type=\"button\" data-lv-cm-open=\"" + esc(p.id) + "\">" + esc(p.title) + "</button></h3>" +
        "<p class=\"lv-cm-card__preview\">" + esc(preview) + (String(p.body || "").length > 140 ? "…" : "") + "</p>" +
        ((p.tags || []).length ? "<p class=\"lv-cm-card__tags\">" + (p.tags || []).map(function (t) { return "#" + esc(t); }).join(" ") + "</p>" : "") +
        "<div class=\"lv-cm-card__acts\">" +
          "<button type=\"button\" data-lv-cm-like=\"" + esc(p.id) + "\"" + (liked ? " class=\"is-on\"" : "") + ">좋아요 " + likes + "</button>" +
          "<button type=\"button\" data-lv-cm-open=\"" + esc(p.id) + "\">댓글 " + comments + "</button>" +
          "<button type=\"button\" data-lv-cm-save-post=\"" + esc(p.id) + "\"" + (saved ? " class=\"is-on\"" : "") + ">" + (saved ? "저장됨" : "저장") + "</button>" +
        "</div>" +
      "</div></article>";
  }

  function renderFeed() {
    var host = $("[data-lv-cm-feed]");
    var meta = $("[data-lv-cm-search-meta]");
    if (!host) return;
    renderTabs();
    var list = filterFeed();
    var extras = searchExtras(state.q);
    if (meta) {
      if (state.q) {
        meta.hidden = false;
        meta.innerHTML = "<p>“" + esc(state.q) + "” · 게시글 " + list.length +
          " · 커뮤니티 " + extras.communities.length +
          " · 챌린지 " + extras.challenges.length +
          " · <button type=\"button\" class=\"lv-cm-text-btn\" data-lv-cm-clear-q>검색 초기화</button></p>" +
          (extras.communities.length
            ? "<div class=\"lv-cm-search-hits\"><strong>커뮤니티</strong> " +
              extras.communities.map(function (c) {
                return "<button type=\"button\" data-lv-cm-filter-comm=\"" + esc(c.id) + "\">" + esc(c.name) + "</button>";
              }).join(" ") + "</div>"
            : "") +
          (extras.challenges.length
            ? "<div class=\"lv-cm-search-hits\"><strong>챌린지</strong> " +
              extras.challenges.map(function (c) {
                return "<a href=\"#cm-programs\">" + esc(c.title) + "</a>";
              }).join(" · ") + "</div>"
            : "");
      } else meta.hidden = true;
    }
    if (!list.length) {
      host.innerHTML = "<div class=\"lv-cm-empty\">" +
        "<h3>" + (state.q ? "검색 결과가 없어요" : "아직 등록된 이야기가 없어요. 첫 번째 이야기를 나눠보세요.") + "</h3>" +
        "<p>" + (state.q ? "관련 카테고리를 보거나 검색어를 바꿔 보세요." : "질문·경험·후기를 남기면 피드에 표시됩니다. 가짜 게시글은 만들지 않습니다.") + "</p>" +
        "<div class=\"lv-cm-actions\">" +
          "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--dark\" data-lv-cm-compose=\"" + (state.tab === "question" ? "question" : "story") + "\">글 작성하기</button>" +
          "<a class=\"lv-cm-btn lv-cm-btn--ghost\" href=\"#cm-communities\">커뮤니티 탐색하기</a>" +
        "</div></div>";
      return;
    }
    host.innerHTML = "<div class=\"lv-cm-feed-list\">" + list.map(cardHtml).join("") + "</div>";
  }

  function renderSide() {
    var host = $("[data-lv-cm-side]");
    if (!host) return;
    var store = loadStore();
    var joined = store.joined.map(function (j) { return findCommunity(j.id); }).filter(Boolean).slice(0, 5);
    var challenges = Object.keys(store.challenges).map(function (id) {
      return (DATA.challenges || []).find(function (c) { return c.id === id; });
    }).filter(Boolean).slice(0, 3);
    host.innerHTML =
      "<div class=\"lv-cm-side__block\">" +
        "<h3>나의 가입 커뮤니티</h3>" +
        (joined.length
          ? "<ul>" + joined.map(function (c) {
              return "<li><button type=\"button\" data-lv-cm-filter-comm=\"" + esc(c.id) + "\">" + esc(c.name) + "</button></li>";
            }).join("") + "</ul>"
          : "<p class=\"lv-cm-note\">관심 있는 커뮤니티를 찾아보세요.</p><a class=\"lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm\" href=\"#cm-communities\">커뮤니티 탐색하기</a>") +
      "</div>" +
      "<div class=\"lv-cm-side__block\">" +
        "<h3>관심사로 찾기</h3>" +
        "<div class=\"lv-cm-chips\">" + (DATA.interests || []).slice(0, 8).map(function (i) {
          var on = (store.profile.interests || []).indexOf(i) >= 0;
          return "<button type=\"button\" data-lv-cm-interest=\"" + esc(i) + "\"" + (on ? " class=\"is-on\"" : "") + ">" + esc(i) + "</button>";
        }).join("") + "</div>" +
      "</div>" +
      "<div class=\"lv-cm-side__block\">" +
        "<h3>참여 예정 모임</h3>" +
        "<p class=\"lv-cm-note\">아직 참여 예정인 모임이 없어요.</p>" +
        "<a class=\"lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm\" href=\"#cm-groups\">모임 찾아보기</a>" +
      "</div>" +
      "<div class=\"lv-cm-side__block\">" +
        "<h3>진행 중 챌린지</h3>" +
        (challenges.length
          ? "<ul>" + challenges.map(function (c) { return "<li>" + esc(c.title) + "</li>"; }).join("") + "</ul>"
          : "<p class=\"lv-cm-note\">참여 중인 챌린지가 없어요.</p>") +
        "<a class=\"lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm\" href=\"#cm-programs\">챌린지 보기</a>" +
      "</div>" +
      "<div class=\"lv-cm-side__block\">" +
        "<h3>최근 활동</h3>" +
        "<p class=\"lv-cm-note\">작성 " + store.posts.filter(function (p) { return !p.deleted; }).length +
          " · 댓글 " + store.comments.filter(function (c) { return !c.deleted; }).length +
          " · 저장 " + store.saves.length + "</p>" +
        "<a class=\"lv-cm-btn lv-cm-btn--ghost lv-cm-btn--sm\" href=\"#cm-mine\">나의 커뮤니티</a>" +
      "</div>";
  }

  function renderCommunities() {
    var host = $("[data-lv-cm-comm-list]");
    if (!host) return;
    host.innerHTML = (DATA.communities || []).map(function (c) {
      var members = memberCount(c.id);
      var posts = postCount(c.id);
      var joined = isJoined(c.id);
      return "<article class=\"lv-cm-comm\">" +
        "<div class=\"lv-cm-comm__media\" style=\"background-image:url(" + esc(c.img || "") + ")\"></div>" +
        "<div class=\"lv-cm-comm__body\">" +
          "<p class=\"lv-cm-eyebrow\">" + esc(c.interest || c.stage || "") + "</p>" +
          "<h3>" + esc(c.name) + "</h3>" +
          "<p>" + esc(c.desc) + "</p>" +
          "<p class=\"lv-cm-note\">회원 " + members + " · 게시글 " + posts + " · " + (c.join === "open" ? "공개 가입" : "승인제") + "</p>" +
          "<div class=\"lv-cm-actions\">" +
            "<button type=\"button\" class=\"lv-cm-btn" + (joined ? " lv-cm-btn--ghost" : " lv-cm-btn--dark") + "\" data-lv-cm-join=\"" + esc(c.id) + "\" data-lv-cm-label=\"" + esc(c.name) + "\">" +
              (joined ? "탈퇴" : "가입") + "</button>" +
            "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--ghost\" data-lv-cm-filter-comm=\"" + esc(c.id) + "\">게시글 보기</button>" +
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
      return "<article class=\"lv-cm-challenge\">" +
        "<p class=\"lv-cm-eyebrow\">" + esc(c.field) + "</p>" +
        "<h3>" + esc(c.title) + "</h3>" +
        "<p>" + esc(c.desc) + "</p>" +
        "<p class=\"lv-cm-note\">목표 " + esc(c.goal) + " · " + c.days + "일</p>" +
        (on ? "<div class=\"lv-cm-progress\"><span style=\"width:" + pct + "%\"></span></div><p class=\"lv-cm-note\">나의 진행 " + logs + "/" + c.days + " (" + pct + "%)</p>" : "") +
        "<div class=\"lv-cm-actions\">" +
          "<button type=\"button\" class=\"lv-cm-btn" + (on ? "" : " lv-cm-btn--dark") + "\" data-lv-cm-challenge=\"" + esc(c.id) + "\">" + (on ? "참여 중 · 탈퇴" : "참여") + "</button>" +
          (on ? "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--ghost\" data-lv-cm-challenge-log=\"" + esc(c.id) + "\">오늘 실천 기록</button>" : "") +
          "<a class=\"lv-cm-btn lv-cm-btn--ghost\" href=\"#life-now\">내 생활 습관</a>" +
        "</div></article>";
    }).join("");
  }

  function renderMine() {
    var host = $("[data-lv-cm-mine]");
    if (!host) return;
    var store = loadStore();
    var myPosts = store.posts.filter(function (p) { return !p.deleted; });
    var myComments = store.comments.filter(function (c) { return !c.deleted; });
    var saved = store.saves.map(findPost).filter(Boolean);
    var liked = Object.keys(store.likes).map(findPost).filter(Boolean);
    var questions = myPosts.filter(function (p) { return p.type === "question"; });
    var joined = store.joined.map(function (j) { return findCommunity(j.id); }).filter(Boolean);
    var ch = Object.keys(store.challenges).map(function (id) {
      return (DATA.challenges || []).find(function (c) { return c.id === id; });
    }).filter(Boolean);

    function listBlock(title, items, empty, mapper) {
      return "<div class=\"lv-cm-mine-block\"><h3>" + esc(title) + "</h3>" +
        (items.length
          ? "<ul>" + items.slice(0, 8).map(mapper).join("") + "</ul>"
          : "<p class=\"lv-cm-note\">" + esc(empty) + "</p>") +
        "</div>";
    }

    host.innerHTML =
      "<div class=\"lv-cm-profile-card\">" +
        "<h3>" + esc(store.profile.nick || "나") + "</h3>" +
        "<p>" + esc(store.profile.bio || "자기소개를 추가할 수 있습니다.") + "</p>" +
        "<label class=\"lv-cm-inline\">닉네임 <input type=\"text\" maxlength=\"20\" value=\"" + esc(store.profile.nick || "나") + "\" data-lv-cm-nick /></label>" +
        "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm\" data-lv-cm-save-profile>프로필 저장</button>" +
        "<p class=\"lv-cm-note\">실명·연락처·주소는 기본 공개하지 않습니다. 푸시 알림은 미제공입니다.</p>" +
      "</div>" +
      "<div class=\"lv-cm-mine-grid\">" +
        listBlock("내가 작성한 글", myPosts, "작성한 글이 없어요.", function (p) {
          return "<li><button type=\"button\" data-lv-cm-open=\"" + esc(p.id) + "\">" + esc(p.title) + "</button></li>";
        }) +
        listBlock("내가 작성한 댓글", myComments, "작성한 댓글이 없어요.", function (c) {
          return "<li><button type=\"button\" data-lv-cm-open=\"" + esc(c.postId) + "\">" + esc((c.body || "").slice(0, 40)) + "</button></li>";
        }) +
        listBlock("저장한 게시글", saved, "저장한 게시글이 없어요.", function (p) {
          return "<li><button type=\"button\" data-lv-cm-open=\"" + esc(p.id) + "\">" + esc(p.title) + "</button></li>";
        }) +
        listBlock("좋아요한 게시글", liked, "좋아요한 게시글이 없어요.", function (p) {
          return "<li><button type=\"button\" data-lv-cm-open=\"" + esc(p.id) + "\">" + esc(p.title) + "</button></li>";
        }) +
        listBlock("내가 작성한 질문", questions, "작성한 질문이 없어요.", function (p) {
          return "<li><button type=\"button\" data-lv-cm-open=\"" + esc(p.id) + "\">" + esc(p.title) + (p.resolved ? " · 해결됨" : "") + "</button></li>";
        }) +
        listBlock("가입한 커뮤니티", joined, "관심 있는 커뮤니티를 찾아보세요.", function (c) {
          return "<li>" + esc(c.name) + "</li>";
        }) +
        listBlock("참여 중 챌린지", ch, "챌린지에 참여해 보세요.", function (c) {
          return "<li>" + esc(c.title) + "</li>";
        }) +
        "<div class=\"lv-cm-mine-block\"><h3>참여 예정 모임</h3><p class=\"lv-cm-note\">아직 참여 예정인 모임이 없어요.</p><a class=\"lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm\" href=\"#cm-groups\">모임 찾아보기</a></div>" +
        "<div class=\"lv-cm-mine-block\"><h3>신고 기록</h3><p class=\"lv-cm-note\">이 기기 신고 " + store.reports.length + "건 (운영자 검토 백엔드 미연동)</p></div>" +
      "</div>";
  }

  function openCompose(type, editPost) {
    var modal = $("[data-lv-cm-modal]");
    var title = $("[data-lv-cm-modal-title]");
    var form = $("[data-lv-cm-write]");
    if (!modal || !form) return;
    state.composeType = type || "story";
    state.editingId = editPost ? editPost.id : null;
    state.dirty = false;
    if (title) title.textContent = editPost ? "글 수정" : ("글쓰기 · " + typeLabel(state.composeType));
    var store = loadStore();
    var p = editPost || {};
    var communities = DATA.communities || [];
    form.innerHTML =
      "<label class=\"lv-cm-field\">유형<select name=\"type\">" +
        Object.keys(DATA.typeLabels || {}).map(function (k) {
          return "<option value=\"" + k + "\"" + ((p.type || state.composeType) === k ? " selected" : "") + ">" + esc(typeLabel(k)) + "</option>";
        }).join("") +
      "</select></label>" +
      "<label class=\"lv-cm-field\">제목<input name=\"title\" required maxlength=\"80\" value=\"" + esc(p.title || "") + "\" /></label>" +
      "<label class=\"lv-cm-field\">본문<textarea name=\"body\" required maxlength=\"5000\" rows=\"7\">" + esc(p.body || "") + "</textarea></label>" +
      "<label class=\"lv-cm-field\">주제 태그 (쉼표 구분)<input name=\"tags\" value=\"" + esc((p.tags || []).join(", ")) + "\" placeholder=\"예: 자취, 이사\" /></label>" +
      "<label class=\"lv-cm-field\">질문 분야<select name=\"field\"><option value=\"\">선택</option>" +
        (DATA.questionFields || []).map(function (f) {
          return "<option value=\"" + esc(f) + "\"" + (p.field === f ? " selected" : "") + ">" + esc(f) + "</option>";
        }).join("") +
      "</select></label>" +
      "<label class=\"lv-cm-field\">커뮤니티<select name=\"communityId\"><option value=\"\">선택 안 함</option>" +
        communities.map(function (c) {
          return "<option value=\"" + esc(c.id) + "\"" + (p.communityId === c.id ? " selected" : "") + ">" + esc(c.name) + "</option>";
        }).join("") +
      "</select></label>" +
      "<label class=\"lv-cm-field\">지역<select name=\"region\"><option value=\"\">선택 안 함</option>" +
        (DATA.regions || []).map(function (r) {
          return "<option value=\"" + esc(r) + "\"" + (p.region === r ? " selected" : "") + ">" + esc(r) + "</option>";
        }).join("") +
      "</select></label>" +
      "<label class=\"lv-cm-field\">공개 범위<select name=\"visibility\">" +
        "<option value=\"public\"" + ((p.visibility || "public") === "public" ? " selected" : "") + ">전체 공개</option>" +
        "<option value=\"members\"" + (p.visibility === "members" ? " selected" : "") + ">가입 커뮤니티</option>" +
        "<option value=\"private\"" + (p.visibility === "private" ? " selected" : "") + ">비공개 (나만)</option>" +
      "</select></label>" +
      "<label class=\"lv-cm-field\">이미지 (선택, 이 기기 저장)<input type=\"file\" name=\"image\" accept=\"image/*\" /></label>" +
      (p.image ? "<p class=\"lv-cm-note\">기존 이미지 있음 · 새 파일을 고르면 교체됩니다. <button type=\"button\" data-lv-cm-remove-image>이미지 제거</button></p>" : "") +
      "<p class=\"lv-cm-note\">커뮤니티 규칙: " + esc((DATA.rules || []).slice(0, 2).join(" / ")) + "</p>" +
      "<div class=\"lv-cm-form__acts\">" +
        "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--ghost\" data-lv-cm-modal-close>취소</button>" +
        "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--outline\" data-lv-cm-draft>임시 저장</button>" +
        "<button type=\"submit\" class=\"lv-cm-btn lv-cm-btn--dark\">" + (editPost ? "수정 완료" : "게시") + "</button>" +
      "</div>";
    modal.hidden = false;
    form.querySelector("[name=title]") && form.querySelector("[name=title]").focus();
    form.addEventListener("input", function () { state.dirty = true; }, { once: false });
  }

  function closeModal(force) {
    if (state.dirty && !force) {
      if (!confirm("저장되지 않은 변경사항이 있습니다. 닫을까요?")) return;
    }
    var modal = $("[data-lv-cm-modal]");
    if (modal) modal.hidden = true;
    state.dirty = false;
    state.editingId = null;
  }

  function readFileAsDataURL(file, cb) {
    if (!file) return cb("");
    if (file.size > 1.2 * 1024 * 1024) {
      alert("이미지는 약 1MB 이하를 권장합니다.");
      return cb("");
    }
    var reader = new FileReader();
    reader.onload = function () { cb(String(reader.result || "")); };
    reader.onerror = function () { alert("이미지 읽기에 실패했습니다."); cb(""); };
    reader.readAsDataURL(file);
  }

  function submitPost(fd, asDraft, keepImage) {
    var store = loadStore();
    var title = String(fd.get("title") || "").trim();
    var body = String(fd.get("body") || "").trim();
    if (!title || !body) { alert("제목과 본문을 입력해 주세요."); return; }
    var tags = String(fd.get("tags") || "").split(",").map(function (t) { return t.trim(); }).filter(Boolean).slice(0, 8);
    var file = fd.get("image");
    var finish = function (imageData) {
      var now = Date.now();
      if (state.editingId) {
        var post = store.posts.find(function (p) { return p.id === state.editingId; });
        if (!post) return;
        post.title = title;
        post.body = body;
        post.type = fd.get("type") || post.type;
        post.tags = tags;
        post.field = fd.get("field") || "";
        post.communityId = fd.get("communityId") || "";
        post.region = fd.get("region") || "";
        post.visibility = fd.get("visibility") || "public";
        post.draft = !!asDraft;
        post.updatedAt = now;
        if (imageData) post.image = imageData;
        if (keepImage === false) post.image = "";
      } else {
        store.posts.unshift({
          id: uid("post"),
          type: fd.get("type") || "story",
          title: title,
          body: body,
          tags: tags,
          field: fd.get("field") || "",
          communityId: fd.get("communityId") || "",
          region: fd.get("region") || "",
          visibility: fd.get("visibility") || "public",
          image: imageData || "",
          authorNick: store.profile.nick || "나",
          authorId: "local",
          draft: !!asDraft,
          resolved: false,
          helpfulCommentId: "",
          createdAt: now,
          updatedAt: now,
          deleted: false
        });
      }
      saveStore(store);
      state.dirty = false;
      closeModal(true);
      state.tab = "latest";
      renderAll();
      var newest = store.posts[0];
      if (newest && !asDraft) renderDetail(newest.id);
      else scrollToId("cm-home");
    };
    if (file && file.size) readFileAsDataURL(file, finish);
    else finish(state.editingId && keepImage !== false ? (findPost(state.editingId) || {}).image || "" : "");
  }

  function renderDetail(id) {
    var sec = $("#cm-detail");
    var host = $("[data-lv-cm-detail]");
    var post = findPost(id);
    if (!sec || !host) return;
    if (!post || (post.visibility === "private" && post.authorId !== "local")) {
      sec.hidden = true;
      return;
    }
    state.detailId = id;
    sec.hidden = false;
    var store = loadStore();
    var comm = findCommunity(post.communityId);
    var comments = store.comments.filter(function (c) { return c.postId === id; })
      .sort(function (a, b) { return a.createdAt - b.createdAt; });
    var related = publicPosts().filter(function (p) {
      return p.id !== id && (p.communityId === post.communityId || (p.tags || []).some(function (t) { return (post.tags || []).indexOf(t) >= 0; }));
    }).slice(0, 3);

    function commentTreeHtml() {
      var roots = comments.filter(function (c) { return !c.parentId; });
      function renderOne(c, depth) {
        var kids = comments.filter(function (x) { return x.parentId === c.id; });
        if (c.deleted) {
          return "<li class=\"lv-cm-comment is-deleted\" style=\"margin-left:" + (depth * 1.2) + "rem\"><p>삭제된 댓글입니다.</p>" +
            (kids.length ? "<ul>" + kids.map(function (k) { return renderOne(k, depth + 1); }).join("") + "</ul>" : "") + "</li>";
        }
        return "<li class=\"lv-cm-comment\" style=\"margin-left:" + (depth * 1.2) + "rem\">" +
          "<p><strong>" + esc(c.authorNick || "나") + "</strong> · " + esc(fmtDate(c.createdAt)) +
            (post.helpfulCommentId === c.id ? " · <span class=\"lv-cm-badge\">도움 됨</span>" : "") + "</p>" +
          "<p>" + esc(c.body) + "</p>" +
          "<div class=\"lv-cm-comment__acts\">" +
            "<button type=\"button\" data-lv-cm-reply=\"" + esc(c.id) + "\">답글</button>" +
            "<button type=\"button\" data-lv-cm-del-comment=\"" + esc(c.id) + "\">삭제</button>" +
            "<button type=\"button\" data-lv-cm-report=\"comment:" + esc(c.id) + "\">신고</button>" +
            (post.type === "question" && post.authorId === "local"
              ? "<button type=\"button\" data-lv-cm-helpful=\"" + esc(c.id) + "\">도움 된 답변</button>" : "") +
          "</div>" +
          (kids.length ? "<ul>" + kids.map(function (k) { return renderOne(k, depth + 1); }).join("") + "</ul>" : "") +
        "</li>";
      }
      return roots.length ? "<ul class=\"lv-cm-comments\">" + roots.map(function (c) { return renderOne(c, 0); }).join("") + "</ul>"
        : "<p class=\"lv-cm-note\">아직 댓글이 없습니다.</p>";
    }

    host.innerHTML =
      "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--outline lv-cm-btn--sm\" data-lv-cm-back-feed>← 피드로</button>" +
      "<article class=\"lv-cm-detail\">" +
        "<div class=\"lv-cm-card__meta\">" +
          "<span class=\"lv-cm-badge\">" + esc(typeLabel(post.type)) + "</span>" +
          (comm ? "<span>" + esc(comm.name) + "</span>" : "") +
          "<span>" + esc(fmtDate(post.createdAt)) + (post.updatedAt !== post.createdAt ? " · 수정됨" : "") + "</span>" +
          (post.type === "question" ? "<span>" + (post.resolved ? "해결됨" : "진행 중") + "</span>" : "") +
        "</div>" +
        "<p class=\"lv-cm-card__author\">" + esc(post.authorNick || "나") + "</p>" +
        "<h2 class=\"lv-cm-title lv-cm-title--md\">" + esc(post.title) + "</h2>" +
        (post.image ? "<img class=\"lv-cm-detail__img\" src=\"" + esc(post.image) + "\" alt=\"\" />" : "") +
        "<div class=\"lv-cm-detail__body\">" + esc(post.body).replace(/\n/g, "<br>") + "</div>" +
        ((post.tags || []).length ? "<p class=\"lv-cm-card__tags\">" + (post.tags || []).map(function (t) { return "#" + esc(t); }).join(" ") + "</p>" : "") +
        "<div class=\"lv-cm-actions\">" +
          "<button type=\"button\" class=\"lv-cm-btn" + (isLiked(id) ? "" : " lv-cm-btn--outline") + "\" data-lv-cm-like=\"" + esc(id) + "\">좋아요 " + likeCount(id) + "</button>" +
          "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--outline\" data-lv-cm-save-post=\"" + esc(id) + "\">" + (isSaved(id) ? "저장됨" : "저장") + "</button>" +
          "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--ghost\" data-lv-cm-share=\"" + esc(id) + "\">공유 링크 복사</button>" +
          "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--ghost\" data-lv-cm-report=\"post:" + esc(id) + "\">신고</button>" +
          (post.authorId === "local"
            ? "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--ghost\" data-lv-cm-edit=\"" + esc(id) + "\">수정</button>" +
              "<button type=\"button\" class=\"lv-cm-btn lv-cm-btn--ghost\" data-lv-cm-del-post=\"" + esc(id) + "\">삭제</button>"
            : "") +
          "<a class=\"lv-cm-btn lv-cm-btn--ghost\" href=\"#livon-ai\">LIVON AI</a>" +
          "<a class=\"lv-cm-btn lv-cm-btn--ghost\" href=\"#explore\">관련 탐색</a>" +
        "</div>" +
        "<section class=\"lv-cm-detail__comments\">" +
          "<h3>댓글 " + commentCount(id) + "</h3>" +
          commentTreeHtml() +
          "<form class=\"lv-cm-comment-form\" data-lv-cm-comment-form data-post=\"" + esc(id) + "\">" +
            "<input type=\"hidden\" name=\"parentId\" value=\"\" />" +
            "<label class=\"lv-cm-field\">댓글<textarea name=\"body\" required maxlength=\"1000\" rows=\"3\" placeholder=\"댓글을 입력하세요\"></textarea></label>" +
            "<button type=\"submit\" class=\"lv-cm-btn lv-cm-btn--dark lv-cm-btn--sm\">댓글 등록</button>" +
          "</form>" +
        "</section>" +
        (related.length
          ? "<section><h3>관련 게시글</h3><div class=\"lv-cm-feed-list\">" + related.map(cardHtml).join("") + "</div></section>"
          : "") +
      "</article>";
    location.hash = "cm-post-" + id;
    scrollToId("cm-detail");
  }

  function renderAll() {
    renderFeed();
    renderSide();
    renderCommunities();
    renderChallenges();
    renderMine();
  }

  function bindEvents() {
    document.addEventListener("click", function (e) {
      var scroll = e.target.closest("[data-lv-cm-scroll]");
      if (scroll) {
        e.preventDefault();
        scrollToId((scroll.getAttribute("href") || "#cm-home").replace("#", ""));
        return;
      }
      var compose = e.target.closest("[data-lv-cm-compose]");
      if (compose) {
        e.preventDefault();
        openCompose(compose.getAttribute("data-lv-cm-compose") || "story");
        return;
      }
      var tab = e.target.closest("[data-lv-cm-tab]");
      if (tab) {
        e.preventDefault();
        state.tab = tab.getAttribute("data-lv-cm-tab") || "latest";
        renderFeed();
        return;
      }
      var jump = e.target.closest("[data-lv-cm-tab-jump]");
      if (jump) {
        state.tab = jump.getAttribute("data-lv-cm-tab-jump") || "latest";
        renderFeed();
        return;
      }
      var clear = e.target.closest("[data-lv-cm-clear], [data-lv-cm-clear-q]");
      if (clear) {
        e.preventDefault();
        var input = $("[data-lv-cm-q]");
        if (input) input.value = "";
        state.q = "";
        var clearBtn = $("[data-lv-cm-clear]");
        if (clearBtn) clearBtn.hidden = true;
        renderFeed();
        return;
      }
      var open = e.target.closest("[data-lv-cm-open]");
      if (open) {
        e.preventDefault();
        renderDetail(open.getAttribute("data-lv-cm-open"));
        return;
      }
      var like = e.target.closest("[data-lv-cm-like]");
      if (like) {
        e.preventDefault();
        var lid = like.getAttribute("data-lv-cm-like");
        var store = loadStore();
        if (store.likes[lid]) delete store.likes[lid];
        else store.likes[lid] = Date.now();
        saveStore(store);
        renderFeed();
        if (state.detailId === lid) renderDetail(lid);
        return;
      }
      var savePost = e.target.closest("[data-lv-cm-save-post]");
      if (savePost) {
        e.preventDefault();
        var sid = savePost.getAttribute("data-lv-cm-save-post");
        var st = loadStore();
        var idx = st.saves.indexOf(sid);
        var post = findPost(sid);
        if (idx >= 0) st.saves.splice(idx, 1);
        else st.saves.unshift(sid);
        saveStore(st);
        if (post) syncSavedToMyLife(post, idx < 0);
        renderFeed();
        renderMine();
        if (state.detailId === sid) renderDetail(sid);
        return;
      }
      var join = e.target.closest("[data-lv-cm-join]");
      if (join) {
        e.preventDefault();
        var jid = join.getAttribute("data-lv-cm-join");
        var st2 = loadStore();
        var exists = st2.joined.some(function (x) { return x.id === jid; });
        st2.joined = exists
          ? st2.joined.filter(function (x) { return x.id !== jid; })
          : st2.joined.concat([{ id: jid, at: Date.now() }]);
        saveStore(st2);
        writeJSON(KEY_LEGACY_JOINED, st2.joined);
        renderAll();
        return;
      }
      var interest = e.target.closest("[data-lv-cm-interest]");
      if (interest) {
        e.preventDefault();
        var name = interest.getAttribute("data-lv-cm-interest");
        var st3 = loadStore();
        var ints = st3.profile.interests || [];
        st3.profile.interests = ints.indexOf(name) >= 0 ? ints.filter(function (x) { return x !== name; }) : ints.concat([name]).slice(0, 20);
        saveStore(st3);
        writeJSON(KEY_LEGACY_INTERESTS, st3.profile.interests);
        writeJSON(KEY_ML_INTERESTS, st3.profile.interests);
        renderSide();
        renderMine();
        return;
      }
      var filterComm = e.target.closest("[data-lv-cm-filter-comm]");
      if (filterComm) {
        e.preventDefault();
        var cid = filterComm.getAttribute("data-lv-cm-filter-comm");
        var c = findCommunity(cid);
        state.q = c ? c.name : cid;
        state.tab = "latest";
        var input2 = $("[data-lv-cm-q]");
        if (input2) input2.value = state.q;
        renderFeed();
        scrollToId("cm-home");
        location.hash = "cm-home";
        return;
      }
      var challenge = e.target.closest("[data-lv-cm-challenge]");
      if (challenge) {
        e.preventDefault();
        var chid = challenge.getAttribute("data-lv-cm-challenge");
        var st4 = loadStore();
        if (st4.challenges[chid]) delete st4.challenges[chid];
        else st4.challenges[chid] = { joinedAt: Date.now(), logs: {} };
        saveStore(st4);
        renderChallenges();
        renderMine();
        renderSide();
        return;
      }
      var clog = e.target.closest("[data-lv-cm-challenge-log]");
      if (clog) {
        e.preventDefault();
        var cid2 = clog.getAttribute("data-lv-cm-challenge-log");
        var st5 = loadStore();
        if (!st5.challenges[cid2]) st5.challenges[cid2] = { joinedAt: Date.now(), logs: {} };
        var key = todayKey();
        if (st5.challenges[cid2].logs[key]) delete st5.challenges[cid2].logs[key];
        else st5.challenges[cid2].logs[key] = true;
        saveStore(st5);
        renderChallenges();
        return;
      }
      var modalClose = e.target.closest("[data-lv-cm-modal-close]");
      if (modalClose) {
        e.preventDefault();
        closeModal(false);
        return;
      }
      var back = e.target.closest("[data-lv-cm-back-feed]");
      if (back) {
        e.preventDefault();
        var sec = $("#cm-detail");
        if (sec) sec.hidden = true;
        location.hash = "cm-home";
        scrollToId("cm-home");
        return;
      }
      var edit = e.target.closest("[data-lv-cm-edit]");
      if (edit) {
        e.preventDefault();
        openCompose("story", findPost(edit.getAttribute("data-lv-cm-edit")));
        return;
      }
      var delPost = e.target.closest("[data-lv-cm-del-post]");
      if (delPost) {
        e.preventDefault();
        if (!confirm("게시글을 삭제할까요?")) return;
        var st6 = loadStore();
        var p = st6.posts.find(function (x) { return x.id === delPost.getAttribute("data-lv-cm-del-post"); });
        if (p) { p.deleted = true; p.updatedAt = Date.now(); }
        saveStore(st6);
        $("#cm-detail") && ($("#cm-detail").hidden = true);
        renderAll();
        return;
      }
      var delC = e.target.closest("[data-lv-cm-del-comment]");
      if (delC) {
        e.preventDefault();
        if (!confirm("댓글을 삭제할까요?")) return;
        var st7 = loadStore();
        var cmt = st7.comments.find(function (x) { return x.id === delC.getAttribute("data-lv-cm-del-comment"); });
        if (cmt) { cmt.deleted = true; cmt.body = ""; }
        saveStore(st7);
        renderDetail(state.detailId);
        return;
      }
      var reply = e.target.closest("[data-lv-cm-reply]");
      if (reply) {
        e.preventDefault();
        var form = $("[data-lv-cm-comment-form]");
        if (form) {
          form.querySelector("[name=parentId]").value = reply.getAttribute("data-lv-cm-reply") || "";
          form.querySelector("[name=body]").focus();
        }
        return;
      }
      var helpful = e.target.closest("[data-lv-cm-helpful]");
      if (helpful) {
        e.preventDefault();
        var st8 = loadStore();
        var post = st8.posts.find(function (x) { return x.id === state.detailId; });
        if (post && post.authorId === "local") {
          post.helpfulCommentId = helpful.getAttribute("data-lv-cm-helpful");
          post.resolved = true;
          saveStore(st8);
          renderDetail(state.detailId);
        }
        return;
      }
      var report = e.target.closest("[data-lv-cm-report]");
      if (report) {
        e.preventDefault();
        var reason = prompt("신고 사유를 입력해 주세요. (스팸/혐오/개인정보 등)");
        if (!reason) return;
        var st9 = loadStore();
        st9.reports.push({ id: uid("report"), target: report.getAttribute("data-lv-cm-report"), reason: reason, at: Date.now(), status: "local-only" });
        saveStore(st9);
        alert("이 기기에 신고가 기록되었습니다. 운영자 검토 시스템은 아직 연결되어 있지 않습니다.");
        renderMine();
        return;
      }
      var share = e.target.closest("[data-lv-cm-share]");
      if (share) {
        e.preventDefault();
        var url = location.origin + location.pathname + "#cm-post-" + share.getAttribute("data-lv-cm-share");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () { alert("공개 게시글 링크를 복사했습니다."); });
        } else {
          prompt("링크를 복사하세요", url);
        }
        return;
      }
      var saveProfile = e.target.closest("[data-lv-cm-save-profile]");
      if (saveProfile) {
        e.preventDefault();
        var nick = $("[data-lv-cm-nick]");
        var st10 = loadStore();
        st10.profile.nick = (nick && nick.value.trim()) || "나";
        saveStore(st10);
        renderMine();
        alert("프로필이 이 기기에 저장되었습니다.");
        return;
      }
      var removeImg = e.target.closest("[data-lv-cm-remove-image]");
      if (removeImg) {
        e.preventDefault();
        removeImg.setAttribute("data-cleared", "1");
        removeImg.textContent = "제거 예정";
        return;
      }
      var draftBtn = e.target.closest("[data-lv-cm-draft]");
      if (draftBtn) {
        e.preventDefault();
        var formEl = $("[data-lv-cm-write]");
        if (!formEl) return;
        var fd = new FormData(formEl);
        var cleared = formEl.querySelector("[data-lv-cm-remove-image][data-cleared]");
        submitPost(fd, true, !cleared);
        return;
      }
      // legacy save buttons
      var legacySave = e.target.closest("[data-lv-cm-save]");
      if (legacySave && !savePost) {
        e.preventDefault();
        return;
      }
    });

    var searchForm = $("[data-lv-cm-form]");
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = $("[data-lv-cm-q]");
        state.q = input ? input.value.trim() : "";
        var clearBtn = $("[data-lv-cm-clear]");
        if (clearBtn) clearBtn.hidden = !state.q;
        state.tab = "latest";
        renderFeed();
        scrollToId("cm-home");
      });
    }
    var qInput = $("[data-lv-cm-q]");
    if (qInput) {
      qInput.addEventListener("input", function () {
        var clearBtn = $("[data-lv-cm-clear]");
        if (clearBtn) clearBtn.hidden = !qInput.value;
      });
    }

    document.addEventListener("submit", function (e) {
      var write = e.target.closest("[data-lv-cm-write]");
      if (write) {
        e.preventDefault();
        var fd = new FormData(write);
        var cleared = write.querySelector("[data-lv-cm-remove-image][data-cleared]");
        submitPost(fd, false, !cleared);
        return;
      }
      var cform = e.target.closest("[data-lv-cm-comment-form]");
      if (cform) {
        e.preventDefault();
        var body = String(new FormData(cform).get("body") || "").trim();
        if (!body) return;
        var last = loadStore().comments.filter(function (c) { return c.authorId === "local"; }).slice(-1)[0];
        if (last && Date.now() - last.createdAt < 1500) {
          alert("너무 빠른 연속 작성입니다. 잠시 후 다시 시도해 주세요.");
          return;
        }
        var st = loadStore();
        st.comments.push({
          id: uid("cmt"),
          postId: cform.getAttribute("data-post"),
          parentId: String(new FormData(cform).get("parentId") || "") || "",
          body: body,
          authorNick: st.profile.nick || "나",
          authorId: "local",
          createdAt: Date.now(),
          deleted: false
        });
        saveStore(st);
        renderDetail(cform.getAttribute("data-post"));
        renderFeed();
      }
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
        links.forEach(function (a) { a.classList.remove("is-on"); });
        if (map[entry.target.id]) map[entry.target.id].classList.add("is-on");
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  function onShow(hash) {
    renderAll();
    if (!hash || hash === "community" || hash === "cm-hero") {
      window.scrollTo(0, 0);
      return;
    }
    if (hash.indexOf("cm-post-") === 0) {
      renderDetail(hash.replace("cm-post-", ""));
      return;
    }
    if (hash.indexOf("cm-") === 0) setTimeout(function () { scrollToId(hash); }, 40);
  }

  function init() {
    if (!$("#community")) return;
    bindFilm();
    bindReveal();
    bindNav();
    bindEvents();
    renderAll();
    var hash = (location.hash || "").slice(1);
    if (document.documentElement.dataset.lvView === "community") onShow(hash || "community");
  }

  window.LivonCommunity = {
    onShow: onShow,
    openCompose: openCompose,
    openPost: renderDetail
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
