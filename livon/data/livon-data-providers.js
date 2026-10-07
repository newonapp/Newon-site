/*
 * LIVON Real Data Layer — provider adapters + registry entries.
 *
 * Every provider implements the same interface, so screens never see provider names or raw payloads:
 *   fetch(ctx)        → raw payload (Promise)
 *   normalize(raw)    → array of LIVON entity candidates (schema: livon-data-schema.js)
 *   validate(entity)  → false to drop an entity the schema accepted but the provider knows is bad
 *   mapCategory(row)  → LIVON category label (optional)
 *   mapLifeStage(row) → ["20","30",…] (optional)
 *   getSource()       → { providerName, homepage, license } for attribution
 *
 * Kinds of provider:
 *   builtin   — LIVON's own curated, human-checked data that is already on the page (official portals,
 *               public places and programs). It runs through the same pipeline but is flagged builtin so
 *               existing screens (which already show it) never show it twice.
 *   server    — anything that needs an API key or has CORS/licence limits. The browser never holds a key:
 *               it asks the LIVON server route (config.serverEndpoint) which returns already-normalized
 *               rows. These stay "planned" and disabled until that route and the key exist.
 * Endpoints of external APIs are intentionally NOT written here; see docs/livon/real-data-providers.md.
 */
(function (root) {
  "use strict";
  var D = root.LivonData;
  if (!D) return;

  function notConfigured() { var e = new Error("provider not configured"); e.code = "NOT_CONFIGURED"; return Promise.reject(e); }

  /* base: fills the interface with safe defaults and checks what a provider must declare */
  function defineProvider(spec) {
    if (!spec || !spec.id || !spec.name || !Array.isArray(spec.entityTypes) || !spec.entityTypes.length) throw new Error("provider needs id, name, entityTypes");
    return Object.assign({
      enabled: false, status: "planned", requiresServer: false, requiresKey: false, builtin: false, priority: 50,
      fetch: notConfigured,
      normalize: function (raw) { return Array.isArray(raw) ? raw : (raw && Array.isArray(raw.items) ? raw.items : []); },
      validate: function () { return true; },
      mapCategory: null, mapLifeStage: null,
      getSource: function () { return { providerName: spec.name, homepage: spec.homepage || null, license: spec.license || null }; }
    }, spec);
  }

  /*
   * Server-proxied provider: GET {serverEndpoint}?provider={id}&page=n&limit=100 → { ok, items, hasMore }.
   * The server holds the key, calls the official API, validates and returns LIVON entities only.
   * Registered disabled; it is switched on only when the server's ?action=status says it is configured.
   */
  var PAGE_LIMIT = 100, MAX_PAGES = 10;
  function serverProvider(spec) {
    return defineProvider(Object.assign({
      requiresServer: true,
      fetch: function (ctx) {
        if (!ctx.fetchImpl || !ctx.serverEndpoint) return notConfigured();
        var all = [];
        function page(n) {
          var ctrl = typeof AbortController === "function" ? new AbortController() : null;
          var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 45000) : null;
          return ctx.fetchImpl(ctx.serverEndpoint + "?provider=" + encodeURIComponent(spec.id) + "&page=" + n + "&limit=" + PAGE_LIMIT, { headers: { accept: "application/json" }, credentials: "same-origin", signal: ctrl ? ctrl.signal : undefined })
            .then(function (r) {
              if (timer) clearTimeout(timer);
              if (!r.ok) { var e = new Error("http"); e.status = r.status; throw e; }
              return r.json();
            })
            .then(function (body) {
              if (!body || body.ok !== true || !Array.isArray(body.items)) { var e = new Error("invalid"); e.code = "INVALID_DATA"; throw e; }
              all = all.concat(body.items);
              return body.hasMore && n < MAX_PAGES ? page(n + 1) : all;
            });
        }
        return page(1);
      }
    }, spec));
  }

  /* ───────── builtin: LIVON curated data already bundled with the site ───────── */
  var EX_TYPE = { program: "program", place: "place" }; /* other explore items are official agency pages → "public" */
  function stageIdsFromTopics(topicIds) {
    var hub = root.LivonLifeHub, out = [];
    (topicIds || []).forEach(function (id) { var t = hub && hub.repo && hub.repo.topic(id); if (t && out.indexOf(t.lifeStageId) < 0) out.push(t.lifeStageId); });
    return out;
  }
  var curated = defineProvider({
    id: "livon-curated", name: "LIVON 큐레이션", entityTypes: ["program", "place", "policy", "public"],
    sourceKind: "livon-curated",
    enabled: true, status: "active", builtin: true, priority: 10,
    /* bundled with the page already: never written to the browser cache */
    ttlByType: { program: 0, place: 0, policy: 0, public: 0 },
    license: "LIVON 편집 (각 기관 공식 안내 링크)",
    fetch: function () {
      var hub = root.LivonLifeHub;
      var life = hub && hub.repo ? (hub.repo.status === "ready" ? Promise.resolve(hub.repo.data) : hub.repo.load().catch(function () { return null; })) : Promise.resolve(null);
      return life.then(function (lifeData) { return { explore: root.LivonExploreData || { items: [] }, life: lifeData }; });
    },
    normalize: function (raw) {
      var out = [];
      ((raw.explore && raw.explore.items) || []).forEach(function (i) {
        if (!i.officialUrl) return;
        var type = EX_TYPE[i.type] || "public";
        out.push({
          type: type, providerId: "ex-" + i.id, title: i.title, summary: i.blurb, description: i.body, category: i.subfield || null,
          tags: i.tags, interests: i.tags,
          organization: i.provider, organizer: type === "program" ? i.provider : undefined,
          placeType: type === "place" ? (i.subfield || null) : undefined, openingHours: type === "place" ? i.hours : undefined, officialUrl: type === "place" ? i.officialUrl : undefined,
          location: i.region && i.region !== "전국" ? { country: "KR", region: i.region, address: i.address || null } : { country: "KR" },
          pricing: { type: i.priceType === "free" ? "free" : i.priceType === "paid" ? "paid" : i.priceType ? "varies" : "unknown" },
          contact: { website: i.officialUrl },
          source: { providerName: i.source || i.provider || "LIVON 큐레이션", sourceUrl: i.officialUrl, updatedAt: i.checkedAt || null },
          metadata: { livonRoute: "#ex-item-" + i.id }
        });
      });
      ((raw.life && raw.life.policies) || []).forEach(function (p) {
        out.push({
          type: "policy", providerId: p.id, title: p.name, summary: p.target, category: "공식 포털",
          agency: p.provider, eligibility: p.conditions, officialSource: p.sourceUrl, lastVerifiedAt: p.checkedAt || null,
          applicationPeriod: p.period ? { note: p.period } : null,
          lifeStages: stageIdsFromTopics((raw.life.topics || []).filter(function (t) { return (t.relatedPolicyIds || []).indexOf(p.id) >= 0; }).map(function (t) { return t.id; })),
          topicIds: (raw.life.topics || []).filter(function (t) { return (t.relatedPolicyIds || []).indexOf(p.id) >= 0; }).map(function (t) { return t.id; }),
          source: { providerName: p.provider, sourceUrl: p.sourceUrl, updatedAt: p.checkedAt || null }
        });
      });
      return out;
    }
  });

  /* ───────── planned external providers (disabled; no endpoint or key in the browser) ───────── */
  var planned = [
    /* 온통청년 청년정책 (한국고용정보원). Server adapter: server/livon/data/providers/youthcenter.mjs — the key exists only on the server */
    serverProvider({ id: "kr-youth-policy", name: "온통청년", entityTypes: ["policy"], requiresKey: true, priority: 90, homepage: "https://www.youthcenter.go.kr/", license: "온통청년 오픈API (한국고용정보원)", docs: "docs/livon/real-data-providers.md#policy" }),
    /* 기업마당 지원사업정보 (중소벤처기업부). Server adapter: server/livon/data/providers/bizinfo.mjs.
       Business programmes are not age-based: they attach to Life Stage topics by exact category (e.g. 창업) only. */
    serverProvider({ id: "kr-business-support", name: "기업마당", entityTypes: ["policy"], requiresKey: true, priority: 85, topicMatch: "category", homepage: "https://www.bizinfo.go.kr/", license: "기업마당 정책정보 개방 API", docs: "docs/livon/real-data-providers.md#policy" }),
    serverProvider({ id: "kr-business-event", name: "기업마당", entityTypes: ["event"], requiresKey: true, priority: 85, topicMatch: "category", homepage: "https://www.bizinfo.go.kr/", license: "기업마당 정책정보 개방 API", docs: "docs/livon/real-data-providers.md#events" }),
    serverProvider({ id: "kr-public-policy", name: "정부·지자체 공공 정책/서비스 데이터", entityTypes: ["policy"], requiresKey: true, priority: 90, docs: "docs/livon/real-data-providers.md#policy" }),
    serverProvider({ id: "kr-public-events", name: "공공 문화·행사 데이터", entityTypes: ["event"], requiresKey: true, priority: 80, docs: "docs/livon/real-data-providers.md#events" }),
    /* Kakao Local 장소 검색: on demand only (a user query or a user-approved position), never bulk-loaded */
    serverProvider({ id: "kr-kakao-place", name: "Kakao Local", entityTypes: ["place"], requiresKey: true, onDemand: true, priority: 60, sourceKind: "private-platform", homepage: "https://developers.kakao.com/docs/ko/local/dev-guide", license: "Kakao Developers 로컬 API", docs: "docs/livon/real-data-providers.md#places" }),
    /* 한국관광공사 TourAPI 관광정보: on demand only; nothing cached (저작권 정책: 콘텐츠 캐싱 금지) */
    serverProvider({ id: "kr-tourapi", name: "한국관광공사 TourAPI", entityTypes: ["place"], requiresKey: true, onDemand: true, priority: 75, homepage: "https://api.visitkorea.or.kr/", license: "한국관광공사 국문 관광정보 서비스 (공공데이터포털)", docs: "docs/livon/real-data-providers.md#places" }),
    serverProvider({ id: "kr-public-places", name: "공공 장소·시설 데이터", entityTypes: ["place"], requiresKey: true, priority: 80, docs: "docs/livon/real-data-providers.md#places" }),
    /* 전국평생학습강좌표준데이터: a bounded, server-cached window of upcoming/ongoing courses (no category field → exact-category topics only) */
    serverProvider({ id: "kr-lifelong-class", name: "전국평생학습강좌표준데이터", entityTypes: ["program"], requiresKey: true, priority: 70, topicMatch: "category", homepage: "https://www.data.go.kr/data/15013110/standard.do", license: "공공데이터포털 전국평생학습강좌표준데이터 (교육부)", docs: "docs/livon/real-data-providers.md#classes" }),
    serverProvider({ id: "kr-public-programs", name: "공공 교육·프로그램 데이터", entityTypes: ["program"], requiresKey: true, priority: 80, docs: "docs/livon/real-data-providers.md#classes" }),
    /* 공공기관이 공개한 마을세무사 지정 정보 (regional sources; not a LIVON verification) */
    serverProvider({ id: "kr-public-tax-expert", name: "공공기관 공개 마을세무사 정보", entityTypes: ["expert"], requiresKey: true, priority: 80, topicMatch: "category", homepage: "https://www.data.go.kr/", license: "공공데이터포털 · 이용허락범위 제한 없음", docs: "docs/livon/real-data-providers.md#experts" }),
    /* 고용24 국민내일배움카드 훈련과정 (한국고용정보원): on demand only — a user search or an opened course, never bulk-loaded,
       never attached to a topic, Today or Home automatically (search links only) */
    serverProvider({ id: "kr-job-training", name: "고용24 국민내일배움카드 훈련과정", entityTypes: ["program"], requiresKey: true, onDemand: true, priority: 70, homepage: "https://www.work24.go.kr/", license: "고용24 OpenAPI (한국고용정보원)", docs: "docs/livon/real-data-providers.md#job-training" }),
    serverProvider({ id: "partner-experts", name: "파트너 직접 등록 (전문가)", entityTypes: ["expert"], requiresKey: false, priority: 70, docs: "docs/livon/real-data-providers.md#experts" }),
    serverProvider({ id: "partner-programs", name: "파트너 직접 등록 (클래스·프로그램)", entityTypes: ["program"], requiresKey: false, priority: 70, docs: "docs/livon/real-data-providers.md#classes" })
  ];

  /*
   * Place search (Kakao Local through the LIVON server route). Nothing here holds a key or an endpoint of Kakao.
   * A user position is used only for the one request it was given for: rounded to ≈100 m before it leaves the
   * page, never stored (no localStorage, no entity, no save snapshot), never logged.
   */
  var PLACE_ID = "kr-kakao-place";
  var PLACE_CATS = { MT1: "대형마트", CS2: "편의점", PS3: "어린이집, 유치원", SC4: "학교", AC5: "학원", PK6: "주차장", OL7: "주유소, 충전소", SW8: "지하철역", BK9: "은행",
    CT1: "문화시설", AG2: "중개업소", PO3: "공공기관", AT4: "관광명소", AD5: "숙박", FD6: "음식점", CE7: "카페", HP8: "병원", PM9: "약국" };
  var RADII = [500, 1000, 3000, 5000, 10000, 20000];
  /* explicit topic/content categories → a search the user can start. Only unambiguous pairs; no age rule. */
  var TOPIC_PLANS = {
    "창업": { query: "창업지원센터" },
    "건강": { category: "HP8" }, "건강관리": { category: "HP8" }, "병원/의료 생활정보": { category: "HP8" },
    "여행": { category: "AT4" }, "취미/문화": { category: "CT1" }
  };
  var CONTENT_PLANS = {
    "창업": { query: "창업지원센터" }, "도서관": { query: "도서관" },
    "문화 행사": { category: "CT1" }, "미술관": { category: "CT1" }, "지역별 하루 여행": { category: "AT4" }, "건강": { category: "HP8" }
  };
  function plan(p) {
    if (!p) return null;
    var out = { query: p.query || "", category: p.category || "", needsLocation: !p.query };
    out.label = p.query ? "‘" + p.query + "’ 장소 검색" : "가까운 " + PLACE_CATS[p.category] + " 찾기";
    return out;
  }
  function round3(n) { return Math.round(n * 1000) / 1000; }
  var places = {
    CATEGORIES: PLACE_CATS, RADII: RADII,
    configured: function () { var p = D.registry.get(PLACE_ID); return !!(p && p.serverConfigured); },
    planForTopic: function (topic) { return topic ? plan(TOPIC_PLANS[String(topic.category || "")]) : null; },
    planForContent: function (c) { return c ? plan(CONTENT_PLANS[String(c.category || "")]) : null; },
    /* opts: { query, category, coords: {lat,lng} (only from an explicit user action), radius, sort, page, fetchImpl } */
    search: function (opts) {
      opts = opts || {};
      var f = opts.fetchImpl || root.fetch, ep = D.config && D.config.serverEndpoint;
      if (!places.configured() || typeof f !== "function" || !ep) { var e0 = new Error("not configured"); e0.code = "NOT_CONFIGURED"; return Promise.reject(e0); }
      var q = String(opts.query || "").replace(/\s+/g, " ").trim().slice(0, 50);
      var cat = PLACE_CATS[opts.category] ? opts.category : "";
      var c = opts.coords, near = !!(c && typeof c.lat === "number" && typeof c.lng === "number" && isFinite(c.lat) && isFinite(c.lng));
      if (!q && !(cat && near)) { var e1 = new Error("needs query or location"); e1.code = "NEEDS_INPUT"; return Promise.reject(e1); }
      var page = Math.min(Math.max(1, opts.page | 0 || 1), 3);
      var req;
      if (near) {
        /* position → POST body, never the URL (URLs end up in hosting access logs) */
        var b = { provider: PLACE_ID, action: "nearby", lat: round3(c.lat), lng: round3(c.lng), radius: RADII.indexOf(opts.radius) >= 0 ? opts.radius : 5000, sort: "distance", page: page, limit: 15 };
        if (q) b.query = q;
        if (cat) b.category = cat;
        req = postJson(f, ep, b);
      } else {
        var parts = ["provider=" + PLACE_ID, "query=" + encodeURIComponent(q)];
        if (cat) parts.push("category=" + cat);
        parts.push("page=" + page, "limit=15");
        req = getJson(f, ep + "?" + parts.join("&"));
      }
      return req.then(function (body) {
        var list = entities(body, PLACE_ID);
        return { items: list, hasMore: !!body.hasMore && page < 3, page: page, total: typeof body.total === "number" ? body.total : null, nearby: near };
      });
    }
  };
  D.places = places;

  /* shared request helpers for on-demand providers (same-origin LIVON route only) */
  function checked(r) { if (!r.ok) { var e = new Error("http"); e.status = r.status; throw e; } return r.json(); }
  function getJson(f, url) { return f.call(root, url, { headers: { accept: "application/json" }, credentials: "same-origin" }).then(checked).then(okBody); }
  function postJson(f, ep, body) {
    return f.call(root, ep, { method: "POST", headers: { accept: "application/json", "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify(body) }).then(checked).then(okBody);
  }
  function okBody(body) { if (!body || body.ok !== true || !Array.isArray(body.items)) { var e = new Error("invalid"); e.code = "INVALID_DATA"; throw e; } return body; }
  function entities(body, id) {
    var list = [];
    body.items.forEach(function (raw) { var v = D.schema.validateEntity(raw); if (v.ok && v.entity.provider === id) list.push(v.entity); });
    D.repository.remember(list);
    return list;
  }

  /*
   * 한국관광공사 TourAPI (관광 콘텐츠). Separate from Kakao Local on purpose: Kakao answers "where is it / how far",
   * TourAPI answers "what is it" (개요, 이용 정보, 공공누리 사진). The two are never merged automatically here.
   * Detail, intro and photos are requested only when the user opens them (no N+1 from lists).
   */
  var TOUR_ID = "kr-tourapi";
  var TOUR_TYPES = { 12: "관광지", 14: "문화시설", 28: "레포츠", 32: "숙박" };           /* offered by LIVON screens */
  var TOUR_REGIONS = ["서울", "부산", "대구", "인천", "광주·전남", "대전", "경기"];   /* 광주 + 전남 are one TourAPI region (code 12): "광주" alone is not a region the route answers */
  var TOUR_TOPIC_PLANS = { "여행": { type: "12" }, "취미/문화": { type: "14" } };
  var TOUR_CONTENT_PLANS = { "미술관": { query: "미술관" }, "문화 행사": { type: "14" }, "지역별 하루 여행": { type: "12" } };
  function tourPlan(p) {
    if (!p) return null;
    return { query: p.query || "", type: p.type || "", needsLocation: !p.query, label: p.query ? "‘" + p.query + "’ 관광정보 보기" : TOUR_TYPES[p.type] + " 관광정보 보기" };
  }
  function tourReady(f, ep) {
    if (!tour.configured() || typeof f !== "function" || !ep) { var e = new Error("not configured"); e.code = "NOT_CONFIGURED"; return false; }
    return true;
  }
  function notReady() { var e = new Error("not configured"); e.code = "NOT_CONFIGURED"; return Promise.reject(e); }
  var tour = {
    TYPES: TOUR_TYPES, REGIONS: TOUR_REGIONS, RADII: RADII,
    POLICY_URL: "https://api.visitkorea.or.kr/#/useServiceGuide/2",
    configured: function () { var p = D.registry.get(TOUR_ID); return !!(p && p.serverConfigured); },
    planForTopic: function (topic) { return topic ? tourPlan(TOUR_TOPIC_PLANS[String(topic.category || "")]) : null; },
    planForContent: function (c) { return c ? tourPlan(TOUR_CONTENT_PLANS[String(c.category || "")]) : null; },
    /* opts: { query, region, type, coords (explicit user action only), radius, page, fetchImpl } */
    search: function (opts) {
      opts = opts || {};
      var f = opts.fetchImpl || root.fetch, ep = D.config && D.config.serverEndpoint;
      if (!tourReady(f, ep)) return notReady();
      var q = String(opts.query || "").replace(/\s+/g, " ").trim().slice(0, 50);
      var type = TOUR_TYPES[opts.type] ? String(opts.type) : "";
      var region = TOUR_REGIONS.indexOf(opts.region) >= 0 ? opts.region : "";
      var c = opts.coords, near = !!(c && typeof c.lat === "number" && typeof c.lng === "number" && isFinite(c.lat) && isFinite(c.lng));
      if (!q && !region && !near) { var e1 = new Error("needs input"); e1.code = "NEEDS_INPUT"; return Promise.reject(e1); }
      var page = Math.min(Math.max(1, opts.page | 0 || 1), 5);
      var req;
      if (near) {
        var b = { provider: TOUR_ID, action: "nearby", lat: round3(c.lat), lng: round3(c.lng), radius: RADII.indexOf(opts.radius) >= 0 ? opts.radius : 5000, page: page, limit: 20 };
        if (type) b.type = type;
        req = postJson(f, ep, b);
      } else {
        var parts = ["provider=" + TOUR_ID];
        if (q) parts.push("query=" + encodeURIComponent(q));
        if (region) parts.push("region=" + encodeURIComponent(region));
        if (type) parts.push("type=" + type);
        parts.push("page=" + page, "limit=20");
        req = getJson(f, ep + "?" + parts.join("&"));
      }
      return req.then(function (body) {
        return { items: entities(body, TOUR_ID), hasMore: !!body.hasMore && page < 5, page: page, total: typeof body.total === "number" ? body.total : null, nearby: near };
      });
    },
    /* detailCommon2 (+detailIntro2) for one contentId, when the user opens it */
    detail: function (contentId, opts) {
      opts = opts || {};
      var f = opts.fetchImpl || root.fetch, ep = D.config && D.config.serverEndpoint;
      if (!tourReady(f, ep)) return notReady();
      if (!/^\d{1,12}$/.test(String(contentId || ""))) return Promise.reject(Object.assign(new Error("bad id"), { code: "BAD_REQUEST" }));
      return getJson(f, ep + "?provider=" + TOUR_ID + "&id=" + contentId).then(function (body) { return entities(body, TOUR_ID)[0] || null; });
    },
    /* detailImage2 — photos with their 공공누리 type; photos without a stated type are not returned */
    images: function (contentId, opts) {
      opts = opts || {};
      var f = opts.fetchImpl || root.fetch, ep = D.config && D.config.serverEndpoint;
      if (!tourReady(f, ep)) return notReady();
      if (!/^\d{1,12}$/.test(String(contentId || ""))) return Promise.reject(Object.assign(new Error("bad id"), { code: "BAD_REQUEST" }));
      return getJson(f, ep + "?provider=" + TOUR_ID + "&id=" + contentId + "&view=images").then(function (body) {
        var v = D.schema.validateEntity({ type: "place", provider: TOUR_ID, providerId: "x", title: "x", source: { providerName: "x" }, photos: Array.isArray(body.photos) ? body.photos : [] });
        return v.ok ? v.entity.photos : [];
      });
    }
  };
  D.tour = tour;

  /*
   * 전국평생학습강좌 search links for Life Stage / Today. The dataset has no category field, so a topic never
   * receives courses automatically; only literal, explicit keyword pairs open an Explore search the user can read.
   */
  var CLASS_ID = "kr-lifelong-class";
  var CLASS_TOPIC_WORDS = { "디지털 생활": "스마트폰", "디지털 도움": "스마트폰" };
  var CLASS_CONTENT_WORDS = { "요가": "요가", "베이킹": "베이킹", "사진": "사진", "도자기": "도자기", "시니어 디지털 교육": "스마트폰" };
  function classPlan(w) { return w ? { query: w, label: "‘" + w + "’ 관련 강좌 찾기", href: "#ex-results?q=" + encodeURIComponent(w) + "&type=class" } : null; }
  /*
   * Public experts (마을세무사). Never recommended to a person automatically: topics/contents with an explicit tax
   * relation get a search link; the user chooses. Coverage is only the connected regions.
   */
  var EXPERT_ID = "kr-public-tax-expert";
  var TAX_TOPIC_IDS = ["20s.registration-prep", "20s.startup-20", "30s.startup-30", "20s.startup-cost", "20s.salary-management", "50s.downsizing-plan"];
  var TAX_CONTENT_IDS = ["td-startup-first-weeks"];
  var TAX_LINK = { label: "세무 상담 정보 찾기", href: "#ex-results?q=%EB%A7%88%EC%9D%84%EC%84%B8%EB%AC%B4%EC%82%AC&type=expert" };
  D.experts = {
    configured: function () { var p = D.registry.get(EXPERT_ID); return !!(p && p.serverConfigured); },
    /* organisations whose published records are loaded right now (honest partial coverage) */
    coverage: function () {
      var seen = {}, out = [];
      D.repository.list().forEach(function (e) { if (e.provider === EXPERT_ID && e.sourceOrganization && !seen[e.sourceOrganization]) { seen[e.sourceOrganization] = 1; out.push(e.sourceOrganization); } });
      return out;
    },
    planForTopic: function (t) { return t && TAX_TOPIC_IDS.indexOf(t.id) >= 0 ? TAX_LINK : null; },
    planForContent: function (c) { return c && TAX_CONTENT_IDS.indexOf(c.id) >= 0 ? TAX_LINK : null; }
  };
  D.classes = {
    configured: function () { var p = D.registry.get(CLASS_ID); return !!(p && p.serverConfigured); },
    planForTopic: function (t) { return t ? classPlan(CLASS_TOPIC_WORDS[String(t.category || "")]) : null; },
    planForContent: function (c) { return c ? classPlan(CLASS_CONTENT_WORDS[String(c.category || "")]) : null; }
  };

  /*
   * 고용24 국민내일배움카드 훈련과정 (직업훈련). Separate from 평생학습강좌 (kr-lifelong-class): different dataset, different
   * meaning, never merged. The server holds the key; this object only builds allowlisted query strings for the LIVON route.
   * Life Stage / Today get a search link only for topics/contents that are explicitly about 취업·이직·재취업·직무 교육.
   */
  var JOB_ID = "kr-job-training";
  var JOB_REGIONS = { "서울": "서울", "경기": "경기", "인천": "인천", "부산": "부산", "대구": "대구", "광주": "광주", "대전": "대전" };
  var JOB_METHODS = { offline: "일반과정", online: "인터넷과정", blended: "혼합과정(BL)" };
  var JOB_TYPES = { C0061: "국민내일배움카드(일반)", C0061S: "국민내일배움카드(구직자)", C0061I: "국민내일배움카드(재직자)", C0104: "K-디지털 트레이닝",
    C0105: "K-디지털 기초역량훈련", C0054: "국가기간전략산업직종", C0055C: "과정평가형훈련", C0054G: "기업맞춤형훈련", C0055: "실업자 원격훈련", C0031: "근로자 원격훈련" };
  var JOB_PERIODS = [30, 90, 180];
  var JOB_TOPIC_IDS = ["20s.first-job", "20s.course-choice", "30s.job-change-30", "40s.career-shift-40", "40s.retraining-choice", "50s.second-career-50", "50s.work-options"];
  var JOB_CONTENT_IDS = ["td-youth-policy"];
  var JOB_LINK = { label: "국민내일배움카드 훈련과정 찾기", href: "#ex-results?type=class&jobs=1", attribution: "출처: 고용24(한국고용정보원)" };
  function jobsReady(f, ep) { return jobs.configured() && typeof f === "function" && !!ep; }
  function jobStatus(e, at) {
    at = at || Date.now();
    var today = new Date(at + 9 * 3600e3).toISOString().slice(0, 10);
    var s = e && e.schedule && e.schedule.startAt ? new Date(Date.parse(e.schedule.startAt) + 9 * 3600e3).toISOString().slice(0, 10) : "";
    var en = e && e.schedule && e.schedule.endAt ? new Date(Date.parse(e.schedule.endAt) + 9 * 3600e3).toISOString().slice(0, 10) : "";
    if (!s) return "";
    if (en && en < today) return "훈련 종료";
    if (s > today) return "훈련 시작 전";
    return "훈련 중";
  }
  var jobs = {
    ID: JOB_ID, REGIONS: JOB_REGIONS, METHODS: JOB_METHODS, TYPES: JOB_TYPES, PERIODS: JOB_PERIODS,
    configured: function () { var p = D.registry.get(JOB_ID); return !!(p && p.serverConfigured); },
    planForTopic: function (t) { return t && JOB_TOPIC_IDS.indexOf(t.id) >= 0 ? JOB_LINK : null; },
    planForContent: function (c) { return c && JOB_CONTENT_IDS.indexOf(c.id) >= 0 ? JOB_LINK : null; },
    /* status from the official 훈련시작일·훈련종료일 only (the API has no 모집/신청 fields) */
    status: jobStatus,
    /* opts: { query, field: "course"|"org", region, method, type, period, page, fetchImpl } */
    search: function (opts) {
      opts = opts || {};
      var f = opts.fetchImpl || root.fetch, ep = D.config && D.config.serverEndpoint;
      if (!jobsReady(f, ep)) return notReady();
      var q = String(opts.query || "").replace(/\s+/g, " ").replace(/[<>&%]/g, "").trim().slice(0, 50);
      var parts = ["provider=" + JOB_ID];
      if (q) parts.push((opts.field === "org" ? "org=" : "query=") + encodeURIComponent(q));
      if (JOB_REGIONS[opts.region]) parts.push("region=" + encodeURIComponent(JOB_REGIONS[opts.region]));
      if (JOB_METHODS[opts.method]) parts.push("method=" + opts.method);
      if (JOB_TYPES[opts.type]) parts.push("type=" + opts.type);
      var period = JOB_PERIODS.indexOf(Number(opts.period)) >= 0 ? Number(opts.period) : 90;
      var page = Math.min(Math.max(1, opts.page | 0 || 1), 10);
      parts.push("period=" + period, "page=" + page, "limit=20");
      return getJson(f, ep + "?" + parts.join("&")).then(function (body) {
        return { items: entities(body, JOB_ID), hasMore: !!body.hasMore && page < 10, page: page, total: typeof body.total === "number" ? body.total : null };
      });
    },
    /* 과정/기관정보 for one course the user opened; merged into that course (list facts win for dates/links) */
    detail: function (entityId, opts) {
      opts = opts || {};
      var f = opts.fetchImpl || root.fetch, ep = D.config && D.config.serverEndpoint;
      if (!jobsReady(f, ep)) return notReady();
      var base = D.repository.getById(entityId);
      var pid = base && base.provider === JOB_ID ? base.providerId : "";
      if (!/^[A-Za-z0-9]{1,30}_\d{1,4}_[A-Za-z0-9]{1,30}$/.test(pid)) return Promise.reject(Object.assign(new Error("bad id"), { code: "BAD_REQUEST" }));
      return getJson(f, ep + "?provider=" + JOB_ID + "&id=" + encodeURIComponent(pid)).then(function (body) {
        var list = [];
        body.items.forEach(function (raw) { var v = D.schema.validateEntity(raw); if (v.ok && v.entity.provider === JOB_ID && v.entity.providerId === pid) list.push(v.entity); });
        var d = list[0];
        if (!d) return base;
        var m = Object.assign({}, base.metadata || {});
        Object.keys(d.metadata || {}).forEach(function (k) { if (d.metadata[k] !== "" && d.metadata[k] != null && k !== "freshness") m[k] = d.metadata[k]; });
        var merged = Object.assign({}, base, {
          organizer: d.organizer || base.organizer || null,
          location: base.location || d.location || null,
          contact: Object.assign({}, base.contact || {}, { website: (d.contact && d.contact.website) || (base.contact && base.contact.website) || null }),
          metadata: m
        });
        D.repository.remember([merged]);
        return merged;
      });
    },
    /* AI: courses the user actually looked up in this page session — kind/title/href only */
    references: function (words, max) {
      var ws = (words || []).map(function (w) { return String(w || "").toLowerCase().replace(/\s+/g, ""); }).filter(function (w) { return w.length >= 2; });
      if (!ws.length) return [];
      return D.repository.sessionList(JOB_ID).filter(function (e) {
        var h = [e.title, e.organizer, e.metadata && e.metadata.subTitle].join(" ").toLowerCase().replace(/\s+/g, "");
        return ws.some(function (w) { return h.indexOf(w) >= 0; }) && e.source && /^https:\/\//i.test(e.source.sourceUrl || "");
      }).slice(0, max || 2).map(function (e) {
        return { kind: "직업훈련 과정(고용24)", title: String([e.title, e.organizer].filter(Boolean).join(" · ")).slice(0, 120), href: e.source.sourceUrl };
      });
    }
  };
  D.jobs = jobs;

  D.providers = { define: defineProvider, server: serverProvider, curated: curated };
  D.registry.register(curated);
  planned.forEach(function (p) { D.registry.register(p); });

  /*
   * Load once after the page's own data is available. The server is asked which keyed providers it
   * has configured (booleans only); only those are switched on. No server route (static hosting,
   * local file) or no key → they stay planned and nothing else changes. Failures never block the page.
   */
  function probeServer() {
    var ep = D.config && D.config.serverEndpoint;
    if (!ep || typeof root.fetch !== "function" || !root.location || !/^https?:$/.test(root.location.protocol)) return Promise.resolve(false);
    return root.fetch(ep + "?action=status", { headers: { accept: "application/json" }, credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (body) {
        var ps = body && body.ok && body.providers;
        if (!ps || typeof ps !== "object") return false;
        var any = false;
        Object.keys(ps).forEach(function (id) {
          var p = D.registry.get(id);
          if (!p || !p.requiresServer || !ps[id] || ps[id].configured !== true) return;
          p.serverConfigured = true; p.enabled = true; D.registry.setStatus(id, "configured"); any = true;
        });
        if (any && root.document && typeof root.document.dispatchEvent === "function" && typeof root.CustomEvent === "function") {
          try { root.document.dispatchEvent(new root.CustomEvent("livon:data-status")); } catch (e) {}
        }
        return any;
      })
      .catch(function () { return false; });
  }
  function start() {
    D.repository.refresh().catch(function () {});
    /* newly enabled providers: wait for the first pass, then load again WITHOUT bypassing the cache, so a page
       reload inside the TTL reuses the stored responses instead of calling /api/livon/data for every provider */
    probeServer().then(function (any) {
      if (!any) return;
      var again = function () { return D.repository.refresh(); };
      Promise.resolve(D.repository.refresh()).then(again, again).catch(function () {});
    });
  }
  if (root.document && root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start);
  else if (root.document) setTimeout(start, 0);
})(typeof window !== "undefined" ? window : globalThis);
