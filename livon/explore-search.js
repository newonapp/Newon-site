/*
 * LIVON 탐색 — 통합 검색 인덱스 (Explore V1)
 *
 * 원본 데이터를 복사하지 않고, 각 소스의 id/route만 가진 가벼운 검색 인덱스를 한 번 만듭니다.
 *   - 라이프 스테이지 주제·서비스 유형·공식 포털 : LivonLifeHub.repo (life-topics.json, 이미 받아 둔 캐시)
 *   - 오늘의 발견 콘텐츠                        : window.LivonTodayData
 *   - 장소·클래스·기관·가이드                    : window.LivonExploreData
 *   - 커뮤니티 글                               : 이 기기의 커뮤니티 저장소(livon.cmStore.v1) — 검색할 때마다 읽음
 * 전문가 데이터는 아직 없으므로 인덱스에 넣지 않습니다(유형만 유지, 결과는 빈 상태 안내).
 * 검색 점수는 정렬에만 쓰고 화면에 표시하지 않습니다.
 */
(function () {
  "use strict";

  var TYPES = [
    { id: "all", label: "전체" },
    { id: "life", label: "라이프 스테이지" },
    { id: "content", label: "콘텐츠" },
    { id: "service", label: "서비스" },
    { id: "expert", label: "전문가" },
    { id: "class", label: "클래스" },
    { id: "place", label: "장소" },
    { id: "event", label: "행사" },
    { id: "policy", label: "정책·지원" },
    { id: "community", label: "커뮤니티" }
  ];
  var CATS = [
    { id: "housing", label: "주거", re: /주거|독립|이사|자취|월세|전세|임대|주택|입주|청소|정리|인테리어|집 /i },
    { id: "money", label: "돈", re: /금융|재테크|자산|저축|예산|연금|투자|비상금|세금|세무|월급|생활비|용돈|대출|돈/i },
    { id: "career", label: "커리어", re: /취업|커리어|이직|일자리|진로|직무|이력서|면접|경력|재취업|아르바이트|자격증|직업|구직/i },
    { id: "startup", label: "창업", re: /창업|사업|스타트업/i },
    { id: "health", label: "건강", re: /건강|운동|검진|의료|병원|마음|정신|수면|요가|스포츠|복용|진료|낙상/i },
    { id: "relation", label: "관계", re: /관계|친구|연애|결혼|부부|가족|사회활동|이웃|모임|봉사/i },
    { id: "parenting", label: "육아", re: /육아|출산|임신|보육|어린이집|영유아|아이|자녀/i },
    { id: "care", label: "돌봄", re: /돌봄|요양|부모님|간병|장기요양|복지/i },
    { id: "travel", label: "여행", re: /여행|나들이|산책|캠핑|관광/i },
    { id: "hobby", label: "취미", re: /취미|문화|전시|공연|여가|체험|사진|베이킹|도자기|독서|클래스/i },
    { id: "learn", label: "배움", re: /교육|공부|학습|강의|배움|평생교육|대학|입시|학교|외국어|장학/i },
    { id: "digital", label: "디지털·생활", re: /디지털|스마트폰|민원|키오스크|보안|사칭|공공서비스|증명서/i }
  ];
  /* 기존 탐색 카테고리(explore-data categories) → 통합 조건. Today·Life Stage에서 넘어오는 필터용 */
  var EXCAT = {
    experts: { types: ["policy"] },
    services: { types: ["service"], cats: ["housing", "digital"] },
    education: { types: ["class"], cats: ["learn"] },
    local: { types: ["place"] },
    housing: { cats: ["housing"] },
    family: { cats: ["relation", "parenting", "care"] },
    health: { cats: ["health"] },
    career: { cats: ["career", "startup"] },
    leisure: { cats: ["hobby", "travel"] },
    products: { types: [] }
  };
  /* 기존 탐색 유형 → 통합 유형 (openResults 호환) */
  var LEGACY_TYPE = { expert: "policy", program: "class", place: "place", service: "service", product: "service", guide: "all", all: "all" };
  var SYN = {
    "독립": ["자취", "주거", "이사"], "주거": ["집", "월세", "전세", "임대", "주택", "이사"], "돈": ["금융", "재테크", "자산", "예산", "저축"],
    "재테크": ["저축", "투자", "자산", "금융"], "취업": ["구직", "이력서", "면접", "일자리", "채용"], "건강": ["검진", "운동", "의료"],
    "육아": ["보육", "어린이집", "출산", "아이"], "돌봄": ["요양", "부모님", "장기요양", "간병"], "여행": ["나들이", "여가", "관광"],
    "창업": ["스타트업", "사업자", "사업계획"], "커리어": ["이직", "경력", "직무"], "정책": ["지원", "제도", "공고"], "지원": ["정책", "제도", "공고"],
    "이사": ["이삿짐", "입주"], "연금": ["노후"], "취미": ["클래스", "여가", "문화"]
  };
  /* Content Quality V1: two-way synonyms and everyday phrasings. Kept out of SYN so the suggestion chips stay as they are. */
  var ALIAS = {
    "구직": ["취업", "일자리", "채용"], "사업": ["창업", "사업자"], "집": ["주거", "주택"], "양육": ["육아", "보육", "자녀"],
    "노후": ["은퇴", "연금"], "은퇴": ["노후", "연금"], "재취업": ["취업", "일자리"], "키우기": ["육아", "양육", "보육", "자녀"],
    "배우고": ["배움", "클래스", "강좌", "평생교육", "학습"], "배우기": ["배움", "클래스", "강좌", "평생교육", "학습"], "배움": ["클래스", "강좌", "평생교육", "학습"],
    "우울": ["마음", "정신건강"], "스트레스": ["마음", "정신건강"], "치매": ["장기요양", "돌봄", "부모님"], "요양": ["장기요양", "돌봄"],
    "요리": ["베이킹", "식사"], "청약": ["주택", "주거", "마이홈"]
  };
  /* filler words in natural queries ("배우고 싶어", "창업 방법 알려줘") — dropped when another word remains */
  var FILLER = { "싶어": 1, "싶다": 1, "싶어요": 1, "싶은": 1, "알려줘": 1, "알려주세요": 1, "방법": 1, "어떻게": 1, "하려면": 1, "하고": 1, "좀": 1 };
  var RECOMMENDED = ["독립", "취업", "창업", "주거", "재테크", "건강", "육아", "돌봄", "여행"];

  function norm(s) { return String(s == null ? "" : s).toLowerCase().replace(/[\s·・,./()\[\]'"“”‘’!?~\-_:;|+]+/g, ""); }
  function uniq(list) { var seen = {}; return list.filter(function (x) { if (!x || seen[x]) return false; seen[x] = 1; return true; }); }
  function safeHttp(url) { return /^https:\/\/[a-z0-9.-]+(\/|$)/i.test(String(url || "")) ? url : ""; }
  function catsOf(text) { return CATS.filter(function (c) { return c.re.test(text); }).map(function (c) { return c.id; }); }
  /* stored value must keep the shape the caller expects (old schema / corrupted data → fallback, null entries dropped) */
  function fitShape(v, fb) { if (Array.isArray(fb)) return Array.isArray(v) ? v.filter(function (x) { return x != null; }) : fb; if (fb && typeof fb === "object") return v && typeof v === "object" && !Array.isArray(v) ? v : fb; return v; }
  function readJSON(key, fallback) { try { var raw = localStorage.getItem(key); return fitShape(raw ? JSON.parse(raw) : fallback, fallback); } catch (e) { return fallback; } }

  function hub() { return window.LivonLifeHub || null; }
  function repo() { var h = hub(); return h && h.repo && h.repo.status === "ready" ? h.repo : null; }
  function lifeStatus() { var h = hub(); return h && h.repo ? h.repo.status : "error"; }

  function words(s) { return String(s || "").toLowerCase().split(/[\s·・,./()\[\]'"“”‘’!?~\-_:;|+]+/).filter(Boolean); }
  function entry(o) {
    o.tw = words(o.title);
    o.cw = words([o.category, (o.tags || []).join(" "), o.meta].join(" "));
    o.dw = words(o.desc);
    o.nt = norm(o.title);
    o.nc = norm([o.category, (o.tags || []).join(" "), o.meta].join(" "));
    o.nd = norm(o.desc);
    o.nr = norm(o.related || "");
    o.cats = uniq((o.cats || []).concat(catsOf([o.title, o.category, (o.tags || []).join(" ")].join(" "))));
    return o;
  }

  var index = null, indexWithLife = false;
  function build() {
    var r = repo(), out = [];
    /* lists served by the LIVON Data Platform (visible rows only: no expired / unsourced / sample / draft rows); files as fallback */
    var SD = window.LivonScreenData;
    var T = window.LivonTodayData || { contents: [] }, E = window.LivonExploreData || { items: [] };
    if (SD) { T = Object.assign({}, T, { contents: SD.todayContents() }); E = Object.assign({}, E, { items: SD.exploreItems() }); }
    var TOPICS = r ? (SD ? SD.topics() : r.data.topics) : [], SERVICES = r ? (SD ? SD.serviceTypes() : r.data.serviceTypes) : [], POLICIES = r ? (SD ? SD.policies() : r.data.policies) : [];
    var stageOfTopic = {}, stageLabel = {};
    if (r) {
      r.data.stages.forEach(function (s) { stageLabel[s.id] = s.label; });
      TOPICS.forEach(function (t) {
        stageOfTopic[t.id] = t.lifeStageId;
        var href = "#life/" + t.stageSlug + "/" + t.slug;
        out.push(entry({
          key: "lt:" + t.id, type: "life", typeLabel: "라이프 스테이지", title: t.title, desc: t.description, category: t.category, tags: [stageLabel[t.lifeStageId]],
          meta: stageLabel[t.lifeStageId] + " · " + t.category, href: href, stageIds: [t.lifeStageId], date: r.data.updatedAt || "",
          related: t.knowledge.map(function (k) { return k.title; }).concat(t.guide.map(function (g) { return g.title; }), t.checklist.map(function (c) { return c.text; })).join(" "),
          rel: { svc: t.relatedServiceIds, pol: t.relatedPolicyIds, refs: t.relatedContentIds.concat(t.relatedClassIds, t.relatedPlaceIds) },
          save: { type: "topic", id: t.id, title: t.title, href: href, stage: t.lifeStageId }
        }));
      });
      SERVICES.forEach(function (s) {
        var href = "#life/services/" + s.id;
        out.push(entry({
          key: "svc:" + s.id, type: "service", typeLabel: "서비스 유형", title: s.name, desc: s.description, category: s.group, tags: [s.group],
          meta: "서비스 유형 · " + s.group, href: href, stageIds: [], date: "", related: [s.forWhom].concat(s.features || [], s.process || []).join(" "),
          save: { type: "service", id: s.id, title: s.name, href: href, stage: "" }
        }));
      });
      POLICIES.forEach(function (p) {
        var url = safeHttp(p.sourceUrl); if (!url) return;
        out.push(entry({
          key: "pol:" + p.id, type: "policy", typeLabel: "공식 포털", official: true, title: p.name, desc: p.summary || p.target, category: p.provider, tags: [p.provider],
          meta: "공식 포털 · " + p.provider, href: url, external: true, stageIds: [], date: p.checkedAt || "",
          save: { type: "policy", id: p.id, title: p.name + " · " + p.provider, href: "#ex-results?q=" + encodeURIComponent(p.provider), stage: "" }
        }));
      });
    }
    (T.contents || []).forEach(function (c) {
      var type = c.type === "place" ? "place" : (c.type === "learn" || c.type === "experience") ? "class" : c.type === "event" ? "event" : "content";
      var ref = "td:" + c.id, stages = [];
      (c.lifeTopicIds || []).forEach(function (id) { if (stageOfTopic[id]) stages.push(stageOfTopic[id]); });
      if (r) TOPICS.forEach(function (t) { if (t.relatedContentIds.indexOf(ref) >= 0 || t.relatedClassIds.indexOf(ref) >= 0 || t.relatedPlaceIds.indexOf(ref) >= 0) stages.push(t.lifeStageId); });
      var href = "#today/" + c.id, saveType = type === "place" ? "place" : type === "class" ? "class" : "content";
      out.push(entry({
        key: ref, type: type, typeLabel: type === "event" ? "행사 안내" : "오늘의 발견", title: c.title, desc: c.blurb, category: c.category, tags: c.tags || [],
        meta: "오늘의 발견 · " + (c.category || ""), href: href, img: c.img, stageIds: uniq(stages), region: c.region || "", date: c.updatedAt || c.checkedAt || T.checkedAt || "",
        related: [c.body].concat(c.points || [], (c.guide || []).map(function (g) { return g.title; }), (c.checklist || []).map(function (x) { return x.text; })).join(" "),
        rel: { svc: c.serviceIds || [], pol: c.policyIds || [], refs: (c.exploreIds || []).map(function (x) { return "ex:" + x; }) },
        save: { type: saveType, id: ref, title: c.title, href: href, stage: "" }
      }));
    });
    (E.items || []).forEach(function (i) {
      var type = { program: "class", place: "place", expert: "policy", service: "service", product: "service" }[i.type] || (i.type === "guide" && safeHttp(i.officialUrl) && (i.credentials || {}).status === "verified" ? "policy" : "content");
      var href = "#ex-item-" + i.id, saveType = i.type === "place" ? "place" : i.type === "program" ? "class" : "content";
      var exCats = i.categoryIds || [];
      out.push(entry({
        key: "ex:" + i.id, type: type, typeLabel: type === "policy" ? "공식 기관·안내" : ({ program: "교육·클래스", place: "장소", service: "생활 서비스", product: "생활 상품", guide: "가이드" }[i.type] || "탐색"),
        official: type === "policy", title: i.title, desc: i.blurb, category: i.subfield || i.provider || "", tags: (i.tags || []).concat(i.provider ? [i.provider] : []),
        meta: i.provider || "", href: href, img: i.img, stageIds: [], region: i.region || "", mode: i.mode || "", exCats: exCats, date: i.checkedAt || "",
        related: [i.body, i.audience].join(" "), cats: [].concat.apply([], exCats.map(function (x) { return (EXCAT[x] || {}).cats || []; })),
        exploreItem: true, save: { type: saveType, id: "ex:" + i.id, title: i.title, href: href, stage: "" }
      }));
    });
    /* Life Events (Data Platform) — searchable with their own type label; they open the Life Event guide */
    if (SD && typeof SD.lifeEventSearchEntries === "function") {
      try { SD.lifeEventSearchEntries().forEach(function (x) { out.push(entry(x)); }); } catch (err) {}
    }
    /* Real Data Layer: entities from external providers only (LIVON's own data is indexed above).
       No active provider → nothing is added and the existing results/empty states stay as they are. */
    var RD = window.LivonData;
    if (RD && typeof RD.searchEntries === "function") {
      try { RD.searchEntries().forEach(function (x) { out.push(entry(x)); }); } catch (err) {}
    }
    index = out; indexWithLife = !!r;
    return out;
  }
  function getIndex() { if (!index || indexWithLife !== !!repo()) build(); return index; }

  /* Community posts are read fresh on every search (never cached), so write / edit / delete is reflected at once.
     Only public, published posts are searchable — never drafts, private, members-only or deleted posts. */
  function communityItems() {
    var R = window.LivonCommunityRepo;
    var posts;
    if (R && R.searchablePosts) posts = R.searchablePosts();
    else {
      var store = readJSON("livon.cmStore.v1", null);
      posts = (store && Array.isArray(store.posts) ? store.posts : []).filter(function (p) { return p && !p.deleted && !p.draft && p.id && p.title && (!p.visibility || p.visibility === "public"); });
    }
    return posts.map(function (p) {
      var catLbl = (CATS.find(function (c) { return c.id === p.category; }) || {}).label || (p.category === "daily" ? "생활" : p.category === "etc" ? "기타" : "");
      var href = "#cm-post-" + p.id;
      return entry({
        key: "cm:" + p.id, type: "community", typeLabel: "커뮤니티 · 이 기기", title: p.title, desc: String(p.body || "").slice(0, 160), category: catLbl || p.field || "",
        tags: p.tags || [], meta: "커뮤니티 · " + (catLbl || p.field || "게시글"), href: href, stageIds: /^[1-7]0$/.test(p.lifeStage || "") ? [p.lifeStage] : [],
        date: p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "", related: p.body || "", cats: CATS.some(function (c) { return c.id === p.category; }) ? [p.category] : [],
        save: { type: "community", id: "cm:" + p.id, title: p.title, href: href, stage: p.lifeStage || "" }
      });
    });
  }

  /* ───────── scoring (title > category/tags > description > related) ───────── */
  function endsAny(list, tok) { for (var i = 0; i < list.length; i++) { var w = list[i]; if (w.length > tok.length && w.lastIndexOf(tok) === w.length - tok.length) return true; } return false; }
  function startsAny(list, tok) { for (var i = 0; i < list.length; i++) if (list[i].indexOf(tok) === 0) return true; return false; }
  /* Korean-aware: a match at the start of a word ranks above one inside a word (e.g. "이사" vs "아이사랑"). */
  function tokenScore(item, tok) {
    var s = 0;
    if (item.nt === tok) s = 120;
    else if (item.nt.indexOf(tok) === 0) s = 80;
    else if (startsAny(item.tw, tok)) s = 55;
    else if (tok.length > 2 ? item.nt.indexOf(tok) >= 0 : endsAny(item.tw, tok)) s = 35; /* 정신건강 ⊃ 건강 (compound head), not 아이사랑 ⊃ 이사 */
    /* one- or two-syllable words hide inside longer words ("이사" in "아이사랑"); outside the title they must start a word */
    var loose = tok.length > 2;
    if (startsAny(item.cw, tok)) s = s ? s + 10 : 30;
    else if (!s && loose && item.nc.indexOf(tok) >= 0) s = 15;
    if (!s && startsAny(item.dw, tok)) s = 14;
    else if (!s && loose && item.nd.indexOf(tok) >= 0) s = 8;
    if (!s && (loose ? item.nr.indexOf(tok) >= 0 : startsAny(item.rw || (item.rw = words(item.related)), tok))) s = 5;
    return s;
  }
  /* synonyms only count at the start of a title/category word */
  function synScore(item, syn) {
    if (startsAny(item.tw, syn)) return 30;
    if (startsAny(item.cw, syn)) return 20;
    return 0;
  }
  function score(item, tokens) {
    if (!tokens.length) return 1;
    var total = 0;
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i], best = tokenScore(item, tok);
      if (!best) (SYN[tok] || []).forEach(function (syn) { best = Math.max(best, synScore(item, norm(syn))); });
      /* everyday aliases rank below any direct match of the word itself (title 12 · category 8 < description 14) */
      if (!best) (ALIAS[tok] || []).forEach(function (syn) { best = Math.max(best, synScore(item, norm(syn)) * 0.4); });
      if (!best) return 0;
      total += best;
    }
    return total;
  }
  /* ───────── debug explanation (local Data Manager only; reuses the same scoring functions, changes nothing) ───────── */
  var DIRECT_LABEL = { 120: "title = word", 80: "title starts with word", 55: "a title word starts with word", 35: "title contains word",
    130: "title = word + category/tag", 90: "title starts with word + category/tag", 65: "title word + category/tag", 45: "title contains word + category/tag",
    30: "a category/tag word starts with word", 15: "category/tag contains word", 14: "a description word starts with word", 8: "description contains word", 5: "related text (guide/checklist)" };
  function explainItem(item, tokens) {
    return tokens.map(function (tok) {
      var d = tokenScore(item, tok);
      if (d) return { token: tok, kind: "direct", score: d, field: DIRECT_LABEL[d] || "direct" };
      var best = 0, via = "";
      (SYN[tok] || []).forEach(function (syn) { var v = synScore(item, norm(syn)); if (v > best) { best = v; via = syn; } });
      if (best) return { token: tok, kind: "synonym", score: best, field: (best === 30 ? "title" : "category/tag") + " word starts with synonym “" + via + "”" };
      (ALIAS[tok] || []).forEach(function (syn) { var v = synScore(item, norm(syn)) * 0.4; if (v > best) { best = v; via = syn; } });
      if (best) return { token: tok, kind: "alias", score: best, field: (best === 12 ? "title" : "category/tag") + " word starts with alias “" + via + "” (ranks below direct matches)" };
      return { token: tok, kind: "none", score: 0, field: "" };
    });
  }
  function explain(q, f) {
    var tokens = tokensOf(q), r = search(q, f);
    return { query: String(q || ""), tokens: tokens, dropped: uniq(String(q || "").trim().split(/\s+/).map(norm).filter(Boolean)).filter(function (t) { return tokens.indexOf(t) < 0; }),
      total: r.total, items: r.items.map(function (h, i) {
        var parts = h.via ? [{ token: "", kind: "related", score: h.score, field: "linked from “" + h.via + "” (a strong match)" }] : explainItem(h.item, tokens);
        return { rank: i + 1, key: h.item.key, title: h.item.title, type: h.item.type, typeLabel: h.item.typeLabel, score: h.score, parts: parts };
      }) };
  }
  function tokensOf(q) {
    var toks = uniq(String(q || "").trim().split(/\s+/).map(norm).filter(Boolean));
    var kept = toks.filter(function (t) { return !FILLER[t]; });
    return kept.length ? kept : toks;
  }
  function stageFromQuery(q) { var m = /([1-7]0)\s*(대|s)/.exec(String(q || "")); return m ? m[1] : ""; }

  function passes(item, f, skipType) {
    if (!skipType && f.type && f.type !== "all" && item.type !== f.type) return false;
    if (f.cat && item.cats.indexOf(f.cat) < 0) return false;
    if (f.age && (item.stageIds || []).indexOf(f.age) < 0) return false;
    if (f.exCat) {
      var m = EXCAT[f.exCat] || {};
      var ok = (item.exCats || []).indexOf(f.exCat) >= 0 || (m.types || []).indexOf(item.type) >= 0 || (m.cats || []).some(function (c) { return item.cats.indexOf(c) >= 0; });
      if (!ok) return false;
    }
    if (f.region && !(item.region && (item.region === f.region || item.region === "전국" || item.region === "온라인"))) return false;
    if (f.mode === "online" && item.mode !== "online" && item.mode !== "both") return false;
    if (f.mode === "offline" && item.mode !== "offline" && item.mode !== "both") return false;
    return true;
  }

  /* search(q, filters) → { items:[{item, score, via}], counts:{type:n}, total, lifeStatus } */
  function search(q, f) {
    f = f || {};
    var tokens = tokensOf(q);
    var pool = getIndex().concat(communityItems());
    var byKey = {};
    pool.forEach(function (x) { byKey[x.key] = x; });
    var scored = {};
    pool.forEach(function (x) { var s = score(x, tokens); if (s > 0) scored[x.key] = { item: x, score: s, via: "" }; });
    // related data match: sources that point at strongly matched items (e.g. 주제 → 관련 서비스·정책·콘텐츠)
    if (tokens.length) {
      Object.keys(scored).forEach(function (k) {
        var hit = scored[k]; if (hit.score < 50 || !hit.item.rel) return;
        var refs = (hit.item.rel.svc || []).map(function (id) { return "svc:" + id; })
          .concat((hit.item.rel.pol || []).map(function (id) { return "pol:" + id; }), hit.item.rel.refs || []);
        refs.forEach(function (rk) {
          var target = byKey[rk];
          if (!target || scored[rk]) return;
          scored[rk] = { item: target, score: 8, via: hit.item.title };
        });
      });
    }
    var age = f.age || "";
    var list = Object.keys(scored).map(function (k) { return scored[k]; });
    if (!tokens.length && !f.cat && !f.exCat && !age && (!f.type || f.type === "all")) list = [];
    var counts = { all: 0 };
    list.forEach(function (x) { if (passes(x.item, f, true)) { counts[x.item.type] = (counts[x.item.type] || 0) + 1; counts.all++; } });
    list = list.filter(function (x) { return passes(x.item, f, false); });
    var qStage = stageFromQuery(q);
    list.forEach(function (x) { if (qStage && x.item.stageIds && x.item.stageIds.indexOf(qStage) >= 0) x.score += 20; });
    var order = { life: 0, content: 1, service: 2, policy: 3, class: 4, place: 5, event: 6, community: 7, expert: 8 };
    list.sort(function (a, b) {
      if (f.sort === "newest") {
        var d = String(b.item.date || "").localeCompare(String(a.item.date || ""));
        if (d) return d;
      }
      return b.score - a.score || order[a.item.type] - order[b.item.type] || a.item.title.length - b.item.title.length;
    });
    return { items: list, counts: counts, total: list.length, lifeStatus: lifeStatus() };
  }

  /* ───────── suggestions (current data only) ───────── */
  var suggestPool = null, suggestWithLife = false;
  function buildSuggest() {
    var out = [], seen = {};
    function add(label, kind) { var n = norm(label); if (!n || seen[n]) return; seen[n] = 1; out.push({ label: label, kind: kind, n: n }); }
    RECOMMENDED.forEach(function (x) { add(x, "추천 검색어"); });
    CATS.forEach(function (c) { add(c.label, "분야"); });
    Object.keys(SYN).forEach(function (x) { add(x, "검색어"); });
    getIndex().forEach(function (x) { add(x.title, x.typeLabel); });
    (window.LivonExploreData && window.LivonExploreData.suggest || []).forEach(function (x) { add(x, "검색어"); });
    suggestPool = out; suggestWithLife = !!repo();
    return out;
  }
  function suggest(prefix, limit) {
    var p = norm(prefix); if (!p) return [];
    if (!suggestPool || suggestWithLife !== !!repo()) buildSuggest();
    var starts = [], contains = [];
    suggestPool.forEach(function (s) { if (s.n.indexOf(p) === 0) starts.push(s); else if (s.n.indexOf(p) > 0) contains.push(s); });
    var rank = function (a, b) { return (a.kind === "추천 검색어" || a.kind === "분야" || a.kind === "검색어" ? 0 : 1) - (b.kind === "추천 검색어" || b.kind === "분야" || b.kind === "검색어" ? 0 : 1) || a.label.length - b.label.length; };
    return starts.sort(rank).concat(contains.sort(rank)).slice(0, limit || 8).map(function (s) { return { label: s.label, kind: s.kind }; });
  }

  window.LivonSearch = {
    TYPES: TYPES, CATS: CATS, EXCAT: EXCAT, LEGACY_TYPE: LEGACY_TYPE, RECOMMENDED: RECOMMENDED,
    search: search, suggest: suggest, index: getIndex, explain: explain, rebuild: function () { index = null; suggestPool = null; return getIndex(); },
    /* community posts are not part of the cached index; only the suggestion pool may hold their titles */
    invalidate: function () { suggestPool = null; },
    lifeStatus: lifeStatus, norm: norm, typeLabel: function (id) { var t = TYPES.find(function (x) { return x.id === id; }); return t ? t.label : id; },
    catLabel: function (id) { var c = CATS.find(function (x) { return x.id === id; }); return c ? c.label : ""; }
  };
})();
