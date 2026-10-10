/*
 * LIVON Data Platform V1 — one canonical data model for every LIVON screen and for LIVON AI.
 *
 *   Data Source  (curated static files · public-data feeds · partners · future DB/Admin)
 *        ↓ Adapter           StaticAdapter · PublicDataAdapter · PartnerAdapter · InternalAdapter
 *        ↓ normalize*()      external shape → LIVON canonical schema (canonicalize())
 *        ↓ Repository        status/expiry filter · relations · search · rule-based recommendations
 *        ↓ UI / AI tools     Home · Life Stage · Today · Explore · Search · LIVON AI (server tools)
 *
 * Design rules (docs/livon/LIVON_DATA_ARCHITECTURE.md):
 *   - Additive: existing screens keep reading their own files; this layer reads the same files and never changes them.
 *   - Nothing is invented. A record without a source name is rejected; a factual record (place, event, policy, …)
 *     without any source/official URL is kept out of default results (provenanceMissing).
 *   - Samples are explicit: sourceType "fixture" ⇒ sample:true ⇒ hidden unless a caller asks for samples.
 *   - Lifecycle: draft → review → published → expired/archived. Time-bound types (event, program, policy, class)
 *     are treated as expired after expiresAt / applicationEnd / endDate, so they never stay on top of a feed.
 *   - Recommendations are rule-based and say so (method: "rule-based"); nothing here is called AI.
 *   - Runs unchanged in the browser (window.LivonDataPlatform) and in Node (globalThis.LivonDataPlatform) —
 *     the LIVON AI server loads the same file for its data tools. No keys, tokens or endpoints live here.
 */
(function (root) {
  "use strict";

  /* ───────────────────────── Vocabulary ───────────────────────── */
  var TYPES = ["content", "lifeStage", "lifeEvent", "place", "event", "program", "policy", "expert", "provider", "service", "class", "communityContent"];
  var TYPE_LABEL = {
    content: "콘텐츠", lifeStage: "라이프 스테이지", lifeEvent: "라이프 이벤트", place: "장소", event: "행사", program: "프로그램",
    policy: "정책·지원", expert: "전문가", provider: "기관·제공자", service: "서비스", "class": "클래스", communityContent: "커뮤니티"
  };
  var STATUSES = ["draft", "review", "published", "expired", "archived"];
  /* allowed Admin transitions (future Admin UI; enforced here so every writer uses the same rules) */
  var TRANSITIONS = {
    draft: ["review", "archived"],
    review: ["draft", "published", "archived"],
    published: ["expired", "archived", "review"],
    expired: ["archived", "review"],
    archived: ["draft"]
  };
  /* where a record comes from */
  /* official = 정부·지자체 공식 페이지 · public_api = 공공기관 공개 API/데이터셋 · partner = 직접 검증 파트너
     platform = 민간 플랫폼 API (예: Kakao Local — 공식 데이터로 표시하지 않음) · editorial = LIVON 편집 · internal = Newon 자체 서비스 */
  var SOURCE_TYPES = ["official", "public_api", "partner", "platform", "editorial", "internal", "user", "fixture"];
  /* Source priority when the same thing arrives from several sources (higher wins). docs/livon/LIVON_REAL_DATA_ARCHITECTURE.md */
  var SOURCE_PRIORITY = { official: 100, public_api: 80, partner: 60, internal: 50, editorial: 40, platform: 30, user: 10, fixture: 0 };
  /* Freshness per type (days): how long after the last check (lastCheckedAt) or the source's own update (sourceUpdatedAt) a record
     counts as "fresh". A LIVON fetch time alone (retrievedAt) is never a check. null = evergreen type (no freshness). */
  var FRESHNESS_POLICY = { event: 7, program: 14, "class": 14, policy: 30, place: 180, expert: 90, provider: 180, service: 180, content: 365,
    lifeStage: null, lifeEvent: null, communityContent: null };
  var FRESHNESS = ["fresh", "stale", "expired", "unknown"];
  /* private platform providers: their rows are never "official" (server manifest sourceKind private-platform) */
  var PLATFORM_PROVIDERS = { "kr-kakao-place": 1 };
  /* official category names → Life Events (category mapping only; ages are never inferred) */
  /* stage tool card types (life-data.js) → Korean labels, same as service-details-data.js */
  var TOOL_TYPE_LABEL = { Tool: "도구", Guide: "가이드", Expert: "전문가·기관", Discovery: "활동·콘텐츠", AI: "AI 상담" };
  var CATEGORY_LIFE_EVENTS = { "창업": ["startup"], "일자리": ["first-job", "job-change"], "취업": ["first-job"], "주거": ["independent", "move"],
    "금융": ["saving", "loan"], "결혼": ["marriage"], "출산": ["childbirth"], "육아": ["parenting"], "보육": ["parenting"], "은퇴": ["retire-prep"] };
  /* what LIVON can say about it — only official_source / partner_verified count as "verified" */
  var VERIFICATION = ["unverified", "editorial", "source_linked", "official_source", "partner_verified", "needs_review"];
  var PRICE_TYPES = ["free", "paid", "varies", "quote", "external", "unknown"];
  var BOOKING_TYPES = ["none", "external", "inquiry", "partner"];
  var AVAILABILITY_TYPES = ["always", "scheduled", "on_request", "unknown"];
  var STAGES = ["10", "20", "30", "40", "50", "60", "70"];
  /* types whose life is bounded by dates */
  var TIME_BOUND = { event: 1, program: 1, policy: 1, "class": 1 };
  /* types that state facts about the world: they need a source link to be shown as real */
  var FACTUAL = { place: 1, event: 1, program: 1, policy: 1, expert: 1, provider: 1, "class": 1, service: 1 };
  var DAY = 864e5;

  /* Explore domains (one search/filter system across all entity types) */
  var DOMAINS = [
    { id: "education", label: "교육·진로", re: /교육|공부|학습|강의|배움|평생교육|대학|입시|학교|진학|진로|장학|자격|외국어|클래스|도서관/ },
    { id: "career", label: "커리어", re: /취업|커리어|이직|일자리|직무|이력서|면접|경력|재취업|구직|직업|창업|프리랜서|퇴사|첫 월급/ },
    { id: "housing", label: "주거", re: /주거|독립|이사|자취|월세|전세|임대|주택|입주|청소|인테리어|내 집|집 찾기|가구|공간/ },
    { id: "finance", label: "금융", re: /금융|재테크|자산|저축|예산|연금|투자|비상금|세금|세무|월급|생활비|대출|보험|돈/ },
    { id: "family", label: "가족", re: /가족|육아|출산|임신|보육|자녀|결혼|신혼|부모|돌봄|연애|부부/ },
    { id: "health", label: "건강", re: /건강|운동|검진|의료|병원|마음|정신|수면|요가|웰니스|스포츠|생활습관/ },
    { id: "leisure", label: "여행·여가", re: /여행|여가|취미|문화|전시|공연|산책|공원|캠핑|관광|체험|도자기|베이킹|사진|나들이|축제/ },
    { id: "local", label: "지역", re: /지역|동네|이웃|주민|구청|시청|주민센터|공공시설|도서관|공원|지역 생활/ },
    { id: "senior", label: "시니어", re: /시니어|노후|은퇴|어르신|노인|장기요양|연금|60대|70대/ }
  ];
  var EXPLORE_CATEGORY_DOMAIN = { education: "education", career: "career", housing: "housing", family: "family", health: "health", leisure: "leisure", local: "local" };
  /* Today's eight sections (existing UI order) */
  var TODAY_CATEGORIES = [
    { id: "place", label: "장소" }, { id: "experience", label: "체험" }, { id: "learn", label: "배움" }, { id: "together", label: "함께" },
    { id: "season", label: "계절" }, { id: "life", label: "일상" }, { id: "editorial", label: "이야기" }, { id: "event", label: "행사" }
  ];
  var TODAY_IDS = TODAY_CATEGORIES.map(function (c) { return c.id; });
  var REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
  var NATIONWIDE = { "전국": 1, "온라인": 1 };
  /* official long names → the short region names LIVON's filters use */
  var REGION_ALIAS = { "서울특별시": "서울", "부산광역시": "부산", "대구광역시": "대구", "인천광역시": "인천", "광주광역시": "광주", "대전광역시": "대전", "울산광역시": "울산",
    "세종특별자치시": "세종", "경기도": "경기", "강원도": "강원", "강원특별자치도": "강원", "충청북도": "충북", "충청남도": "충남", "전라북도": "전북", "전북특별자치도": "전북",
    "전라남도": "전남", "경상북도": "경북", "경상남도": "경남", "제주도": "제주", "제주특별자치도": "제주" };
  function regionName(v) { var s = cleanText(v, 30); if (!s) return null; return REGION_ALIAS[s] || s; }
  /* query expansion for Search V1 (small, explicit; weight 0.5 of a direct hit) */
  var SYNONYMS = {
    "이사": ["독립", "자취", "주거", "입주", "청소"], "독립": ["자취", "이사", "주거"], "자취": ["독립", "주거"], "집": ["주거", "주택"],
    "취업": ["구직", "일자리", "커리어"], "일자리": ["취업", "구직"], "이직": ["커리어", "경력"], "돈": ["금융", "생활비", "저축"],
    "육아": ["보육", "자녀", "출산", "양육"], "병원": ["건강", "의료"], "운동": ["건강", "스포츠"], "은퇴": ["노후", "연금", "시니어"],
    "노후": ["은퇴", "연금", "시니어"], "여행": ["관광", "나들이"], "공부": ["학습", "교육"], "자격증": ["자격", "시험"],
    "구직": ["취업", "일자리", "채용"], "창업": ["사업", "스타트업"], "사업": ["창업", "사업자"], "주거": ["집", "주택", "이사"],
    "양육": ["육아", "보육", "자녀"], "재취업": ["취업", "일자리", "커리어"], "배움": ["교육", "학습", "강좌"], "우울": ["마음", "정신건강"]
  };

  /* ───────────────────────── Sanitising (shared with livon-data-schema.js when loaded) ───────────────────────── */
  var DS = root.LivonDataSchema;
  function isObj(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  var cleanText = DS && DS.cleanText ? DS.cleanText : function (v, max) {
    if (v == null || (typeof v !== "string" && typeof v !== "number")) return null;
    var s = String(v).replace(/<(script|style)[\s\S]*?<\/\1\s*>/gi, " ").replace(/<[^>]*>/g, " ").replace(/[<>]/g, "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‪-‮⁦-⁩]/g, "").replace(/\s+/g, " ").trim();
    if (!s) return null;
    return max && s.length > max ? s.slice(0, max - 1) + "…" : s;
  };
  var safeUrl = DS && DS.safeUrl ? DS.safeUrl : function (v) {
    if (typeof v !== "string" || !/^https?:\/\//i.test(v.trim())) return null;
    try { var u = new URL(v.trim()); return (u.username || u.password || !/^([a-z0-9-]+\.)+[a-z][a-z0-9-]{1,}$/i.test(u.hostname)) ? null : u.href; } catch (e) { return null; }
  };
  function cleanList(v, max, itemMax) {
    if (!Array.isArray(v)) v = v == null || v === "" ? [] : [v];
    var seen = {}, out = [];
    v.forEach(function (x) { var s = cleanText(x, itemMax || 60); if (s && !seen[s.toLowerCase()]) { seen[s.toLowerCase()] = 1; out.push(s); } });
    return out.slice(0, max || 30);
  }
  /* a LIVON route (#…) or an absolute https URL; anything else is dropped */
  function safeHref(v) {
    if (typeof v !== "string") return null;
    var s = v.trim();
    if (/^#[\w\-./?=&%가-힣]{1,200}$/.test(s)) return s;
    return /^https:\/\//i.test(s) ? safeUrl(s) : null;
  }
  /* YYYY-MM-DD or ISO datetime → ISO string. A bare date is a whole day in Korea time; an end date lasts until 23:59:59. */
  function isoDate(v, endOfDay) {
    if (v == null || v === "") return null;
    if (typeof v === "number") { var dn = new Date(v); return isNaN(dn) ? null : dn.toISOString(); }
    if (typeof v !== "string") return null;
    /* "2026.10.20" → "2026-10-20" (only the date part; ".000Z" milliseconds stay) */
    var s = v.trim().replace(/^(\d{4})\.(\d{1,2})\.(\d{1,2})\.?/, function (m, y, mo, d) { return y + "-" + ("0" + mo).slice(-2) + "-" + ("0" + d).slice(-2); });
    if (/^\d{8}$/.test(s)) s = s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6);
    if (!/^\d{4}-\d{2}-\d{2}([T ][0-9:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(s)) return null;
    /* a bare date is a whole Korea day; a date-time without a zone is Korea time too (official APIs publish KST) */
    var d = new Date(s.length === 10 ? s + (endOfDay ? "T23:59:59+09:00" : "T00:00:00+09:00") : s.replace(" ", "T") + (/(Z|[+-]\d{2}:?\d{2})$/.test(s) ? "" : "+09:00"));
    if (isNaN(d)) return null;
    var y = d.getUTCFullYear();
    return y < 1990 || y > 2100 ? null : d.toISOString();
  }
  function num(v, min, max) {
    var n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
    return typeof n === "number" && isFinite(n) && (min == null || n >= min) && (max == null || n <= max) ? n : null;
  }
  function oneOf(v, list, dflt) { return list.indexOf(v) >= 0 ? v : dflt; }
  function norm(s) { return String(s == null ? "" : s).toLowerCase().replace(/[^0-9a-z가-힣]/g, ""); }
  function stageOf(v) {
    var s = String(v == null ? "" : v).replace(/[^0-9]/g, "");
    if (s.length >= 2) s = s.slice(0, 1) + "0";
    return STAGES.indexOf(s) >= 0 ? s : null;
  }
  function uniq(list) { var seen = {}; return list.filter(function (x) { if (x == null || seen[x]) return false; seen[x] = 1; return true; }); }
  function t(iso) { return iso ? Date.parse(iso) : NaN; }

  /* ───────────────────────── Canonical schema ───────────────────────── */
  var RELATION_KEYS = ["topicIds", "lifeEventIds", "contentIds", "placeIds", "policyIds", "serviceIds", "classIds", "programIds", "expertIds", "providerIds", "communityIds", "eventIds"];
  /* entity-specific fields: text (≤300), list (≤20 × 120), number, bool */
  var TYPE_FIELDS = {
    content: { text: ["contentKind", "body"], list: ["checklist", "points"] },
    lifeStage: { text: ["label", "heroTitle", "focus"], number: ["ageMin", "ageMax"] },
    lifeEvent: { text: ["situation"], list: ["checklist", "needs", "situations"] },
    place: { text: ["placeType", "openingHours", "indoorOutdoor", "address", "phone"], list: ["facilities"] },
    event: { text: ["organizer", "venue", "eventStatus", "eventType"] },
    program: { text: ["organizer", "eligibility", "format", "duration", "audience", "target", "applyMethod"] },
    policy: { text: ["agency", "eligibility", "benefits", "jurisdiction", "policyKind", "periodText", "target", "applyMethod"] },
    /* experts: only a work contact a public body published for a public role (workPhone); never a personal number */
    expert: { text: ["name", "organization", "trustLevel", "role", "workPhone", "serviceArea"], list: ["specialties", "consultationMethods"] },
    provider: { text: ["providerKind", "audience", "phone"], list: ["offers"] },
    service: { text: ["serviceGroup", "audience", "forWhom"], list: ["process", "prepare", "features"] },
    "class": { text: ["organizer", "difficulty", "duration", "format"], number: ["capacity"] },
    communityContent: { text: ["communityKind", "interest", "join"], number: ["days"] }
  };

  function classifyDomains(e, explicit) {
    var text = [e.title, e.category, e.subCategory, e.summary].concat(e.tags || []).join(" ");
    var out = (explicit || []).slice();
    DOMAINS.forEach(function (d) { if (d.re.test(text)) out.push(d.id); });
    if ((e.lifeStages || []).length && e.lifeStages.every(function (s) { return s === "60" || s === "70"; })) out.push("senior");
    return uniq(out.filter(function (d) { return DOMAINS.some(function (x) { return x.id === d; }); }));
  }

  /*
   * canonicalize(raw, {now}) → { ok, entity, errors, warnings }
   *   errors reject the record; warnings drop or downgrade a single field.
   */
  function canonicalize(raw, opts) {
    opts = opts || {};
    var errors = [], warnings = [];
    if (!isObj(raw)) return { ok: false, entity: null, errors: ["not-an-object"], warnings: warnings };
    var type = TYPES.indexOf(raw.type) >= 0 ? raw.type : null;
    if (!type) errors.push("type");
    var id = cleanText(raw.id, 160);
    if (!id || !/^[\w가-힣.:\-]+$/.test(id)) errors.push("id");
    var title = cleanText(raw.title || raw.name, 200);
    if (!title) errors.push("title");
    var sourceType = oneOf(raw.sourceType, SOURCE_TYPES, null);
    if (!sourceType) errors.push("sourceType");
    var sourceName = cleanText(raw.sourceName, 120);
    if (!sourceName) errors.push("sourceName");

    var e = {
      id: id, type: type, title: title,
      summary: cleanText(raw.summary, 500), description: cleanText(raw.description, 5000),
      category: cleanText(raw.category, 60), subCategory: cleanText(raw.subCategory, 60),
      tags: cleanList(raw.tags, 20, 40),
      lifeStages: uniq(cleanList(raw.lifeStages, 7, 4).map(stageOf)),
      lifeEvents: cleanList(raw.lifeEvents, 20, 60),
      targetAges: null,
      region: regionName(raw.region), location: null, coordinates: null,
      online: typeof raw.online === "boolean" ? raw.online : null,
      price: null, priceType: oneOf(raw.priceType, PRICE_TYPES, "unknown"),
      startDate: isoDate(raw.startDate), endDate: isoDate(raw.endDate, true),
      applicationStart: isoDate(raw.applicationStart), applicationEnd: isoDate(raw.applicationEnd, true),
      image: typeof raw.image === "string" && /^\/[\w\-./]+\.(jpe?g|png|webp|avif)$/i.test(raw.image) ? raw.image : safeUrl(raw.image),
      sourceName: sourceName, sourceType: sourceType,
      sourceUrl: safeUrl(raw.sourceUrl), officialUrl: safeUrl(raw.officialUrl), bookingUrl: safeUrl(raw.bookingUrl),
      bookingType: oneOf(raw.bookingType, BOOKING_TYPES, raw.bookingUrl ? "external" : "none"),
      availabilityType: oneOf(raw.availabilityType, AVAILABILITY_TYPES, "unknown"),
      providerId: cleanText(raw.providerId, 160),
      verificationStatus: oneOf(raw.verificationStatus, VERIFICATION, null), verified: false,
      status: oneOf(raw.status, STATUSES, "draft"),
      publishedAt: isoDate(raw.publishedAt), updatedAt: isoDate(raw.updatedAt), retrievedAt: isoDate(raw.retrievedAt), expiresAt: isoDate(raw.expiresAt, true),
      /* provenance: the source's own update date · the last time LIVON (or a job) checked it · the source's record id */
      sourceUpdatedAt: isoDate(raw.sourceUpdatedAt), lastCheckedAt: isoDate(raw.lastCheckedAt),
      sourceId: cleanText(raw.sourceId, 200), officialId: cleanText(raw.officialId, 200), alsoFrom: [], duplicateOf: null,
      href: safeHref(raw.href),
      sample: sourceType === "fixture",
      provenanceMissing: false,
      relations: {},
      domains: [],
      meta: {}
    };
    ["startDate", "endDate", "applicationStart", "applicationEnd", "expiresAt", "updatedAt", "retrievedAt", "publishedAt", "sourceUpdatedAt", "lastCheckedAt"].forEach(function (k) {
      if (raw[k] && !e[k]) warnings.push(k + ":invalid");
    });
    ["sourceUrl", "officialUrl", "bookingUrl"].forEach(function (k) { if (raw[k] && !e[k]) warnings.push(k + ":invalid"); });
    if (e.startDate && e.endDate && e.endDate < e.startDate) { warnings.push("endDate:before-start"); e.endDate = null; }
    if (e.applicationStart && e.applicationEnd && e.applicationEnd < e.applicationStart) { warnings.push("applicationEnd:before-start"); e.applicationEnd = null; }

    if (isObj(raw.targetAges)) {
      var amin = num(raw.targetAges.min, 0, 120), amax = num(raw.targetAges.max, 0, 120);
      if (amin != null || amax != null) e.targetAges = { min: amin, max: amax != null && amin != null && amax < amin ? null : amax };
    }
    if (isObj(raw.location)) {
      var loc = { address: cleanText(raw.location.address, 300), city: cleanText(raw.location.city, 60), district: cleanText(raw.location.district, 60) };
      if (loc.address || loc.city || loc.district) e.location = loc;
    }
    var co = raw.coordinates;
    if (isObj(co)) {
      var lat = num(co.lat, -90, 90), lng = num(co.lng, -180, 180);
      if (lat == null || lng == null || (lat === 0 && lng === 0)) warnings.push("coordinates:dropped");
      else e.coordinates = { lat: lat, lng: lng };
    }
    if (!e.region && e.location && e.location.city) e.region = REGIONS.filter(function (r) { return e.location.city.indexOf(r) === 0; })[0] || null;
    if (e.region === "온라인" && e.online == null) e.online = true;
    if (isObj(raw.price)) {
      var p = { amount: num(raw.price.amount, 0), currency: cleanText(raw.price.currency, 3) || (raw.price.amount != null ? "KRW" : null), label: cleanText(raw.price.label, 80) };
      if (p.amount != null || p.label) e.price = p;
    }
    if (isObj(raw.relations)) RELATION_KEYS.forEach(function (k) { var l = cleanList(raw.relations[k], 40, 160); if (l.length) e.relations[k] = l; });
    if (isObj(raw.meta)) Object.keys(raw.meta).slice(0, 20).forEach(function (k) {
      var v = raw.meta[k];
      if (typeof v === "string") { var s = cleanText(v, 200); if (s) e.meta[k] = s; }
      else if ((typeof v === "number" && isFinite(v)) || typeof v === "boolean") e.meta[k] = v;
      else if (Array.isArray(v)) { var l = cleanList(v, 10, 40); if (l.length) e.meta[k] = l; }
    });

    var spec = TYPE_FIELDS[type] || {};
    (spec.text || []).forEach(function (k) { e[k] = cleanText(raw[k], k === "body" ? 3000 : 300); });
    (spec.list || []).forEach(function (k) { e[k] = cleanList(raw[k], 20, 120); });
    (spec.number || []).forEach(function (k) { e[k] = num(raw[k], 0); });

    /* ── type rules ── */
    if (type === "policy" && !(e.officialUrl || e.sourceUrl)) errors.push("policy:officialUrl");
    if (type === "event" && !e.startDate) errors.push("event:startDate");
    if (type === "expert") e.name = e.name || title;

    /* ── provenance ──
       traceable = a source link, or (for a data feed) the source's name + its own record id (TourAPI contentid, 기업마당 공고 ID …) */
    var linked = !!(e.sourceUrl || e.officialUrl);
    var feed = ["official", "public_api", "partner", "platform"].indexOf(sourceType) >= 0;
    var traceable = linked || (feed && !!e.sourceId && !!sourceName);
    if (FACTUAL[type] && !traceable && ["editorial", "user", "fixture", "internal"].indexOf(sourceType) < 0) {
      e.provenanceMissing = true; warnings.push("provenance:missing");
    }
    if (e.verificationStatus === "partner_verified" && sourceType !== "partner") { warnings.push("verification:partner-only"); e.verificationStatus = null; }
    if (e.verificationStatus === "official_source" && ["official", "public_api"].indexOf(sourceType) < 0) { warnings.push("verification:official-only"); e.verificationStatus = null; }
    if ((e.verificationStatus === "official_source" || e.verificationStatus === "source_linked") && !traceable) { warnings.push("verification:no-link"); e.verificationStatus = null; }
    if (!e.verificationStatus) {
      e.verificationStatus = e.provenanceMissing ? "unverified"
        : sourceType === "editorial" ? "editorial"
        : (sourceType === "official" || sourceType === "public_api") && traceable ? "official_source"
        : sourceType === "platform" && traceable ? "source_linked"
        : linked ? "source_linked" : "unverified";
    }
    if (e.provenanceMissing) e.verificationStatus = "unverified";
    /* time-bound row with no official date: kept (evergreen portal / guide) but marked — a date is never guessed */
    if (TIME_BOUND[type] && !e.startDate && !e.endDate && !e.applicationStart && !e.applicationEnd && !e.expiresAt) e.meta.requiresDateVerification = true;
    e.verified = e.verificationStatus === "official_source" || e.verificationStatus === "partner_verified";
    if (e.sample) e.verified = false;

    /* ── lifecycle ── */
    if (e.status === "published" && !e.publishedAt) e.publishedAt = e.updatedAt || e.retrievedAt || null;
    e.domains = classifyDomains(e, cleanList(raw.domains, 9, 20));
    return { ok: !errors.length, entity: errors.length ? null : e, errors: errors, warnings: warnings };
  }

  /* the date after which a record no longer counts as current */
  /*
   * The date after which a record no longer counts as current (per type):
   *   event            → the event itself is over (endDate, else startDate day)
   *   policy           → the application closed (applicationEnd, else endDate)
   *   program / class  → the course ended (endDate); see lifecycleStatus for "closed and already started"
   */
  function effectiveEnd(e) {
    if (e.expiresAt) return e.expiresAt;
    if (!TIME_BOUND[e.type]) return null;
    if (e.type === "event") return e.endDate || e.startDate;
    if (e.type === "policy") return e.applicationEnd || e.endDate;
    return e.endDate || e.applicationEnd;
  }
  /* stored status + dates → status right now (a published record past its end is "expired") */
  function lifecycleStatus(e, at) {
    var now = at == null ? Date.now() : at;
    if (e.status !== "published") return e.status;
    var end = effectiveEnd(e);
    if (end && t(end) < now) return "expired";
    if (e.expiresAt && t(e.expiresAt) < now) return "expired";
    /* a course nobody can join any more: registration closed AND it already started */
    if ((e.type === "program" || e.type === "class") && e.applicationEnd && e.startDate && t(e.applicationEnd) < now && t(e.startDate) < now) return "expired";
    return "published";
  }
  /* fresh · stale · expired · unknown — by type (FRESHNESS_POLICY); expired always wins */
  function freshnessStatus(e, at) {
    var now = at == null ? Date.now() : at;
    if (lifecycleStatus(e, now) === "expired") return "expired";
    var days = FRESHNESS_POLICY[e.type];
    if (days == null) return "unknown";
    var ref = Math.max(t(e.lastCheckedAt) || 0, t(e.sourceUpdatedAt) || 0);
    if (!ref) return "unknown";
    return now - ref <= days * DAY ? "fresh" : "stale";
  }
  function isVisible(e, at, o) {
    o = o || {};
    /* includeHeld (LIVON Next V1): QA/inventory tools may list records on a review hold (status "review"); screens never ask for them */
    if (lifecycleStatus(e, at) !== "published" && !(o.includeExpired && lifecycleStatus(e, at) === "expired") && !(o.includeHeld && e.status === "review")) return false;
    if (e.sample && !o.includeSamples) return false;
    if (e.provenanceMissing && !o.includeUnsourced) return false;
    if (e.duplicateOf && !o.includeDuplicates) return false;
    return true;
  }

  /* ───────────────────────── Normalizers: external shape → canonical raw ───────────────────────── */
  /* accepts the existing real-data layer entity (livon-data-schema.js) or a loose external record */
  function pick(o) { for (var i = 1; i < arguments.length; i++) { var k = arguments[i], v = o[k]; if (v != null && v !== "") return v; } return null; }
  function baseFrom(x, type, ctx) {
    ctx = ctx || {};
    var src = isObj(x.source) ? x.source : {};
    var loc = isObj(x.location) ? x.location : {};
    var sch = isObj(x.schedule) ? x.schedule : {};
    var pr = isObj(x.pricing) ? x.pricing : null;
    var provider = pick(x, "provider") || ctx.provider || "external";
    var localId = pick(x, "providerId", "id", "contentId", "externalId");
    return {
      id: String(pick(x, "canonicalId") || (provider + ":" + type + ":" + localId)).replace(/[^\w가-힣.:\-]/g, "-"),
      type: type,
      title: pick(x, "title", "name"),
      summary: pick(x, "summary", "blurb"),
      description: pick(x, "description", "body"),
      category: pick(x, "category"), subCategory: pick(x, "subCategory", "subfield"),
      tags: x.tags || [], lifeStages: x.lifeStages || [], lifeEvents: x.lifeEvents || [],
      region: pick(x, "region") || loc.region || (loc.city ? REGIONS.filter(function (r) { return String(loc.city).indexOf(r) === 0; })[0] : null) || null,
      location: loc.address || loc.roadAddress || loc.city ? { address: loc.roadAddress || loc.address, city: loc.city, district: loc.district } : null,
      coordinates: loc.latitude != null && loc.longitude != null ? { lat: loc.latitude, lng: loc.longitude } : (isObj(x.coordinates) ? x.coordinates : null),
      online: typeof x.online === "boolean" ? x.online : null,
      priceType: pr ? ({ free: "free", paid: "paid", varies: "varies" })[pr.type] || "unknown" : pick(x, "priceType"),
      price: pr && (pr.amount != null) ? { amount: pr.amount, currency: pr.currency } : null,
      startDate: pick(x, "startDate") || sch.startAt || null, endDate: pick(x, "endDate") || sch.endAt || null,
      applicationStart: pick(x, "applicationStart", "registrationStart") || (isObj(x.applicationPeriod) ? x.applicationPeriod.start : null),
      applicationEnd: pick(x, "applicationEnd", "registrationEnd") || (isObj(x.applicationPeriod) ? x.applicationPeriod.end : null),
      image: pick(x, "image") || (isObj(x.media) ? x.media.thumbnail : null),
      sourceName: pick(x, "sourceName") || src.providerName || ctx.sourceName || null,
      sourceType: pick(x, "sourceType") || (PLATFORM_PROVIDERS[provider] ? "platform" : ctx.sourceType || "public_api"),
      sourceUrl: pick(x, "sourceUrl") || src.sourceUrl || null,
      officialUrl: pick(x, "officialUrl", "officialSource") || null,
      bookingUrl: pick(x, "bookingUrl", "externalBookingUrl", "registrationUrl", "applicationUrl", "reservationUrl") || null,
      retrievedAt: pick(x, "retrievedAt") || src.fetchedAt || null, updatedAt: pick(x, "updatedAt") || src.updatedAt || null,
      sourceUpdatedAt: pick(x, "sourceUpdatedAt") || src.updatedAt || null, lastCheckedAt: pick(x, "lastCheckedAt", "lastVerifiedAt") || null,
      sourceId: localId != null ? provider + ":" + localId : null, officialId: pick(x, "officialId") || null,
      expiresAt: pick(x, "expiresAt"),
      status: pick(x, "status") && STATUSES.indexOf(x.status) >= 0 ? x.status : "published",
      providerId: pick(x, "providerRef"),
      href: pick(x, "href"),
      relations: isObj(x.relations) ? x.relations : (x.topicIds ? { topicIds: x.topicIds } : null),
      lifeEvents: lifeEventsFromCategory(x),
      meta: { upstreamProvider: provider, lifeEventLink: lifeEventsFromCategory(x).length ? "official-category" : null }
    };
  }
  /* Life Events only from an official category name (never from free text, never from an assumed age) */
  function lifeEventsFromCategory(x) {
    var out = (Array.isArray(x.lifeEvents) ? x.lifeEvents : []).slice();
    [x.category].concat(x.metadata && x.metadata.fields ? String(x.metadata.fields).split(",") : []).forEach(function (c) {
      var k = String(c || "").trim();
      (CATEGORY_LIFE_EVENTS[k] || []).forEach(function (le) { if (out.indexOf(le) < 0) out.push(le); });
    });
    return out;
  }
  function normalizeEvent(x, ctx) {
    var r = baseFrom(x, "event", ctx);
    r.organizer = x.organizer; r.venue = x.venue; r.eventStatus = x.eventStatus; r.eventType = x.eventType;
    if (x.eventStatus === "cancelled") r.status = "archived";
    return r;
  }
  function normalizePlace(x, ctx) {
    var r = baseFrom(x, "place", ctx);
    r.placeType = x.placeType || x.category; r.openingHours = x.openingHours || x.hours; r.facilities = x.facilities;
    r.address = r.location && r.location.address;
    /* a map page (e.g. Kakao map) is a source link, never an "official" page */
    if (x.mapUrl && !x.officialUrl) { r.sourceUrl = r.sourceUrl || x.mapUrl; r.officialUrl = null; }
    r.bookingType = x.reservationUrl ? "external" : "none";
    r.availabilityType = "always";
    r.phone = x.contact && x.contact.phone || x.phone || null; /* a facility/business number as published, not a person */
    return r;
  }
  function normalizeProgram(x, ctx) {
    var r = baseFrom(x, "program", ctx);
    r.organizer = x.organizer; r.eligibility = x.eligibility; r.format = x.format; r.duration = x.duration;
    r.target = x.target || x.eligibility; r.applyMethod = x.applyMethod;
    if (typeof x.online === "boolean") r.online = x.online;
    else if (/온라인/.test(x.format || "") && !/오프라인|혼합|병행/.test(x.format || "")) r.online = true;
    else if (/오프라인|집체|현장/.test(x.format || "") && !/온라인|혼합|병행/.test(x.format || "")) r.online = false;
    r.bookingType = r.bookingUrl ? "external" : "none"; r.availabilityType = r.startDate ? "scheduled" : "unknown";
    return r;
  }
  function normalizeClass(x, ctx) {
    var r = normalizeProgram(x, ctx);
    r.type = "class"; r.id = r.id.replace(":program:", ":class:");
    r.difficulty = x.difficulty; r.capacity = x.capacity;
    return r;
  }
  function normalizePolicy(x, ctx) {
    var r = baseFrom(x, "policy", ctx);
    r.agency = x.agency || x.provider; r.eligibility = x.eligibility || x.target; r.benefits = x.benefits; r.jurisdiction = x.jurisdiction;
    r.policyKind = x.kind || "policy"; r.periodText = x.period || (isObj(x.applicationPeriod) ? x.applicationPeriod.note : null);
    r.target = x.target || x.eligibility; r.applyMethod = x.applyMethod;
    r.officialUrl = r.officialUrl || x.sourceUrl || (isObj(x.source) ? x.source.sourceUrl : null);
    r.verificationStatus = null;
    return r;
  }
  function normalizeExpert(x, ctx) {
    var r = baseFrom(x, "expert", ctx);
    r.name = x.name || x.title; r.organization = x.organization; r.role = x.role;
    r.specialties = x.specialties; r.consultationMethods = x.consultationMethods; r.trustLevel = x.trustLevel; r.serviceArea = x.serviceArea;
    /* only the work contact a public body published for a public role; nothing else about the person */
    r.workPhone = x.trustLevel === "public_designated" && x.contact && x.contact.phone ? x.contact.phone : null;
    /* a data feed never makes anyone "partner verified" */
    r.verificationStatus = null;
    r.bookingType = x.externalBookingUrl ? "external" : "inquiry"; r.availabilityType = "on_request";
    return r;
  }
  function normalizeService(x, ctx) {
    var r = baseFrom(x, "service", ctx);
    r.serviceGroup = x.group || x.serviceGroup; r.audience = x.audience; r.forWhom = x.forWhom;
    r.process = x.process; r.prepare = x.prepare; r.features = x.features;
    r.bookingType = x.bookingUrl ? "external" : (x.partner ? "partner" : "none"); r.availabilityType = "on_request";
    return r;
  }
  function normalizeContent(x, ctx) {
    var r = baseFrom(x, "content", ctx);
    r.contentKind = x.contentKind || "guide"; r.body = x.body; r.checklist = x.checklist; r.points = x.points;
    return r;
  }
  /* real-data layer types → canonical types */
  var REALDATA_TYPE = { event: normalizeEvent, place: normalizePlace, program: normalizeProgram, policy: normalizePolicy, expert: normalizeExpert, "public": normalizeContent };
  function normalizeRealDataEntity(x, ctx) {
    var fn = REALDATA_TYPE[x && x.type];
    return fn ? fn(x, ctx) : null;
  }

  /* ───────────────────────── Admin foundation (no UI in V1) ───────────────────────── */
  function createDraft(raw, at) {
    var now = new Date(at == null ? Date.now() : at).toISOString();
    return canonicalize(Object.assign({}, raw, { status: "draft", sourceType: raw && raw.sourceType || "internal", updatedAt: now }));
  }
  /* what must hold before a record may be published */
  function validateForPublish(e) {
    var problems = [];
    var r = canonicalize(e);
    if (!r.ok) return r.errors.map(function (x) { return "schema:" + x; });
    var c = r.entity;
    if (!c.summary && !c.description) problems.push("summary");
    if (FACTUAL[c.type] && c.provenanceMissing) problems.push("provenance");
    if (c.sample) problems.push("sample-data");
    var end = effectiveEnd(c);
    if (end && t(end) < Date.now()) problems.push("already-expired");
    return problems;
  }
  /* transition(entity, to, {at}) → { ok, entity, error } — returns a new object, never mutates */
  function transition(e, to, o) {
    o = o || {};
    if (!e || STATUSES.indexOf(e.status) < 0) return { ok: false, entity: null, error: "INVALID_ENTITY" };
    if (STATUSES.indexOf(to) < 0) return { ok: false, entity: null, error: "INVALID_STATUS" };
    if ((TRANSITIONS[e.status] || []).indexOf(to) < 0) return { ok: false, entity: null, error: "TRANSITION_NOT_ALLOWED" };
    if (to === "published") { var p = validateForPublish(e); if (p.length) return { ok: false, entity: null, error: "NOT_PUBLISHABLE", problems: p }; }
    var now = new Date(o.at == null ? Date.now() : o.at).toISOString();
    var next = Object.assign({}, e, { status: to, updatedAt: now });
    if (to === "published") next.publishedAt = now;
    if (to === "expired" && !next.expiresAt) next.expiresAt = now;
    return { ok: true, entity: next, error: null };
  }

  /* ───────────────────────── Adapters ───────────────────────── */
  /*
   * Adapter contract: { id, kind, sourceType, status(), load(ctx) → Promise<Array<raw canonical input>> }.
   * load() may resolve to [] — an adapter never invents rows to look busy.
   */
  function stageSlug(id) { return id + "s"; }
  function topicHref(tp) { return "#life/" + (tp.stageSlug || stageSlug(tp.lifeStageId)) + "/" + tp.slug; }
  var TODAY_TYPE = { place: "place", experience: "class", learn: "program", together: "content", season: "content", life: "content", editorial: "content", event: "content" };
  function priceTypeFromText(s) {
    s = String(s || "");
    if (!s) return "unknown";
    if (/^무료$|^무료\s*\(|대부분 무료|기본 열람 무료/.test(s)) return /일부 유료|유료\)/.test(s) ? "varies" : "free";
    if (/견적/.test(s)) return "quote";
    if (/판매처|외부/.test(s)) return "external";
    if (/상이|별|다름|varies/.test(s)) return "varies";
    if (/원|유료/.test(s)) return "paid";
    return "unknown";
  }
  function refToId(ref) {
    ref = String(ref || "");
    if (/^td:/.test(ref)) return ref;
    if (/^ex[-:]/.test(ref)) return "ex:" + ref.replace(/^ex:/, "");
    return ref;
  }

  /* curated LIVON files already shipped with the site */
  function StaticAdapter(sources) {
    sources = sources || {};
    function g(name) { return sources[name] || (root[name] || null); }
    return {
      id: "livon-static", kind: "static", sourceType: "editorial",
      status: function () { return { configured: true, sources: ["LivonLifeData", "LivonLifeEvents", "LivonTodayData", "LivonExploreData", "LivonCommunityData", "lifeTopics"].filter(function (k) { return k === "lifeTopics" ? !!sources.lifeTopics : !!g(k); }) }; },
      load: function () { return Promise.resolve(this.loadSync()); },
      loadSync: function () {
        var out = [];
        var LT = sources.lifeTopics || null, LD = g("LivonLifeData"), LE = g("LivonLifeEvents"), TD = g("LivonTodayData"), EX = g("LivonExploreData"), CM = g("LivonCommunityData");
        var ltStages = LT && LT.stages ? LT.stages : [];
        /* Life Stages */
        (LD && LD.stages ? LD.stages : ltStages).forEach(function (s) {
          var lt = ltStages.filter(function (x) { return x.id === s.id; })[0] || {};
          var ages = lt.ageRange || [Number(s.id), s.id === "70" ? null : Number(s.id) + 9];
          out.push({ id: "stage:" + s.id, type: "lifeStage", title: s.label || lt.label, summary: s.lead || lt.heroLead, description: s.desc || lt.title,
            label: s.label || lt.label, heroTitle: lt.heroTitle || s.title, focus: s.focus, tags: String(s.focus || "").split(/\s*·\s*/).filter(Boolean), ageMin: ages[0], ageMax: ages[1], targetAges: { min: ages[0], max: ages[1] },
            lifeStages: [s.id], image: s.img, href: "#life/" + stageSlug(s.id), sourceName: "LIVON", sourceType: "editorial", status: "published",
            relations: { topicIds: (lt.featuredTopicIds || []).map(function (x) { return "topic:" + x; }) }, _raw: s });
        });
        /* Life Events */
        (LE && LE.events || []).forEach(function (ev) {
          out.push({ id: "le:" + ev.id, type: "lifeEvent", title: ev.title, summary: ev.blurb, lifeStages: ev.stages, lifeEvents: [ev.id],
            situations: ev.situations, needs: ev.needs, checklist: ev.checklist, tags: (ev.needs || []).concat(ev.situations || []),
            category: ev.category || null,
            relations: { topicIds: (ev.topicIds || []).map(function (x) { return "topic:" + x; }) },
            href: "#life", sourceName: "LIVON", sourceType: "editorial", status: "published", meta: { aiPrompt: ev.links && ev.links.ai, planned: !!ev.planned }, _raw: ev });
        });
        /* Life Stage topics → content (guide) */
        (LT && LT.topics || []).forEach(function (tp) {
          var rel = { topicIds: (tp.relatedTopicIds || []).map(function (x) { return "topic:" + x; }),
            placeIds: (tp.relatedPlaceIds || []).map(refToId), classIds: (tp.relatedClassIds || []).map(refToId), contentIds: (tp.relatedContentIds || []).map(refToId),
            policyIds: (tp.relatedPolicyIds || []).map(function (x) { return "pol:" + x; }), serviceIds: (tp.relatedServiceIds || []).map(function (x) { return "svc:" + x; })
              .concat((tp.relatedToolIds || []).map(function (x) { return "tool:" + x; })),
            expertIds: (tp.relatedExpertIds || []).map(refToId) };
          out.push({ id: "topic:" + tp.id, type: "content", contentKind: "topic", title: tp.title, summary: tp.description, category: tp.category, subCategory: tp.categoryId,
            tags: [tp.category, tp.communityInterest].filter(Boolean), lifeStages: [tp.lifeStageId], checklist: (tp.checklist || []).map(function (c) { return c.text; }),
            href: topicHref(tp), sourceName: "LIVON", sourceType: "editorial", status: "published", updatedAt: LT.updatedAt, lastCheckedAt: LT.updatedAt, relations: rel,
            meta: { communityInterest: tp.communityInterest, aiPrompt: (tp.aiPrompts || [])[0] }, _raw: tp });
        });
        /* official portals (policy links; LIVON does not restate eligibility or amounts) */
        (LT && LT.policies || []).forEach(function (p) {
          out.push({ id: "pol:" + p.id, type: "policy", title: p.name, summary: p.summary || p.target, description: p.conditions, category: p.kind === "portal" ? "공식 포털" : null, agency: p.provider, eligibility: p.target,
            policyKind: p.kind, periodText: p.period, officialUrl: p.sourceUrl, sourceUrl: p.sourceUrl, sourceName: p.provider, sourceType: "official",
            retrievedAt: p.checkedAt, updatedAt: p.checkedAt, lastCheckedAt: p.checkedAt, href: p.sourceUrl, status: p.publishStatus || "published", availabilityType: "always", tags: [p.provider],
            applicationStart: p.applicationStart, applicationEnd: p.applicationEnd, expiresAt: p.expiresAt, _raw: p });
        });
        /* service types (Life Stage › services) */
        (LT && LT.serviceTypes || []).forEach(function (s) {
          out.push({ id: "svc:" + s.id, type: "service", title: s.name, summary: s.description, category: s.group, serviceGroup: s.group, forWhom: s.forWhom,
            process: s.process, prepare: s.prepare, features: s.features, tags: [s.group], href: "#life/services/" + s.id,
            officialUrl: typeof s.externalUrl === "string" ? s.externalUrl : null, sourceName: "LIVON", sourceType: "editorial", status: "published",
            bookingType: s.partner ? "partner" : "none", availabilityType: "on_request",
            relations: { classIds: (s.relatedExploreIds || []).map(refToId), contentIds: (s.relatedContentIds || []).map(refToId), serviceIds: (s.relatedToolIds || []).map(function (x) { return "tool:" + x; }) }, _raw: s });
        });
        /* per-stage tools (My Life tools / guides) */
        (LD && LD.stages || []).forEach(function (st) {
          (st.services || []).forEach(function (s) {
            if (!s.id) return;
            out.push({ id: "tool:" + s.id, type: "service", title: s.name, summary: s.desc, category: TOOL_TYPE_LABEL[s.type] || s.type, serviceGroup: "도구", audience: s.audience,
              features: s.feats, tags: s.feats, lifeStages: [s.lifeStage || st.id], href: /^#[\w-]+$/.test(s.destination || "") ? s.destination : "#life-now",
              sourceName: "LIVON", sourceType: "editorial", status: "published", availabilityType: s.status === "soon" ? "unknown" : "always",
              meta: { tool: true, comingSoon: s.status === "soon", uiStatus: s.status }, _raw: s });
          });
        });
        /* Today contents */
        (TD && TD.contents || []).forEach(function (c) {
          var type = c.type === "event" && c.startDate ? "event" : TODAY_TYPE[c.type] || "content";
          var official = c.officialUrl || null;
          out.push({ id: "td:" + c.id, type: type, title: c.title, summary: c.blurb, description: c.body, category: c.category, tags: c.tags,
            region: c.region || null, online: /온라인/.test(c.onlineOffline || c.region || "") ? true : (/오프라인/.test(c.onlineOffline || "") ? false : null),
            /* Next V1 integration: "free" / a price only from a record with an official source; a LIVON guide's own budget is not a price */
            priceType: !/^https:\/\//.test(String(c.officialUrl || "")) ? "unknown" : priceTypeFromText(c.price), price: c.price && /^https:\/\//.test(String(c.officialUrl || "")) ? { label: c.price } : null,
            image: c.img, location: c.address ? { address: c.address } : null, openingHours: c.hours, indoorOutdoor: c.indoorOutdoor, address: c.address,
            difficulty: c.difficulty, duration: c.duration, format: c.onlineOffline, contentKind: c.type === "editorial" ? "editorial" : "guide",
            body: c.body, points: c.points, checklist: c.checklist,
            officialUrl: official, sourceUrl: official, sourceName: c.source || "LIVON", sourceType: official ? "official" : "editorial",
            verificationStatus: official ? "source_linked" : null,
            retrievedAt: c.checkedAt || TD.checkedAt, updatedAt: c.updatedAt || c.checkedAt || TD.checkedAt, lastCheckedAt: c.checkedAt || TD.checkedAt,
            href: "#today/" + c.id, status: c.publishStatus || "published", availabilityType: c.evergreen ? "always" : "unknown",
            startDate: c.startDate, endDate: c.endDate, applicationEnd: c.applicationEnd, expiresAt: c.expiresAt,
            bookingType: "none",
            relations: { topicIds: (c.lifeTopicIds || []).map(function (x) { return "topic:" + x; }), placeIds: [], classIds: (c.exploreIds || []).map(refToId),
              serviceIds: (c.serviceIds || []).map(function (x) { return "svc:" + x; }), policyIds: (c.policyIds || []).map(function (x) { return "pol:" + x; }) },
            meta: { todayCategory: c.type, featured: !!c.featured, evergreen: !!c.evergreen, seasons: c.seasons || [], companion: c.companion || [], reason: c.reason, uiStatus: c.status }, _raw: c });
        });
        /* Explore items */
        var EXPLORE_TYPE = { expert: "provider", program: "program", service: "service", place: "place", product: "content" };
        var providers = {};
        (EX && Array.isArray(EX.items) ? EX.items : []).forEach(function (x) {
          /* Explore V2: one malformed Explore row (null, no id/title, wrong field types) is skipped or normalised here —
             before, it threw inside this adapter and left the whole repository (Today, Life Stage, Explore) empty */
          if (!x || typeof x !== "object" || typeof x.id !== "string" || !x.id || typeof x.title !== "string" || !x.title.trim()) return;
          if (!Array.isArray(x.tags) || !Array.isArray(x.categoryIds)) x = Object.assign({}, x, { tags: Array.isArray(x.tags) ? x.tags : [], categoryIds: Array.isArray(x.categoryIds) ? x.categoryIds.filter(function (k) { return typeof k === "string"; }) : [] });
          var type = EXPLORE_TYPE[x.type] || "content";
          /* a site-relative link ("/ongil-start/…") is a Newon service of our own: internal source, never an "official" page */
          var internal = /^\/[\w\-./#]*$/.test(x.officialUrl || "") ? x.officialUrl : null;
          var official = internal ? null : x.officialUrl || null;
          var srcType = internal ? "internal" : official ? "official" : "editorial";
          var cred = x.credentials && x.credentials.status;
          var provId = x.provider && x.provider !== "LIVON" && x.provider !== "LIVON 생활 가이드" ? "prov:" + norm(x.provider) : null;
          /* Next V1: an explicit providerRef names the Explore provider record that runs this service (no derived copy) */
          var refd = typeof x.providerRef === "string" && x.providerRef && EX.items.some(function (y) { return y && y.id === x.providerRef && EXPLORE_TYPE[y.type] === "provider"; });
          if (refd) provId = "ex:" + x.providerRef;
          if (provId && !refd && !providers[provId] && type !== "provider") providers[provId] = { id: provId, type: "provider", title: x.provider, providerKind: "institution",
            summary: "LIVON 탐색의 ‘" + x.title + "’ 안내를 제공하는 기관입니다. 이용·신청은 기관 공식 채널에서 확인하세요.", category: x.subfield || null, tags: (x.tags || []).slice(0, 6),
            domains: (x.categoryIds || []).map(function (k) { return EXPLORE_CATEGORY_DOMAIN[k]; }).filter(Boolean),
            sourceName: x.source || x.provider, sourceType: srcType, officialUrl: official, sourceUrl: official, meta: internal ? { internalUrl: internal } : undefined,
            retrievedAt: x.checkedAt, updatedAt: x.checkedAt, lastCheckedAt: x.checkedAt, status: "published", href: official || internal, offers: [x.type] };
          out.push({ id: "ex:" + x.id, type: type, title: x.title, summary: x.blurb, description: x.body, category: x.subfield, subCategory: (x.categoryIds || []).join(","),
            tags: x.tags, domains: (x.categoryIds || []).map(function (k) { return EXPLORE_CATEGORY_DOMAIN[k]; }).filter(Boolean),
            region: x.region || null, online: x.mode === "online" ? true : x.mode === "offline" ? false : null,
            priceType: oneOf(x.priceType, PRICE_TYPES, priceTypeFromText(x.priceLabel)), price: x.priceLabel ? { label: x.priceLabel } : null,
            image: x.img, location: x.address ? { address: x.address } : null, address: x.address, openingHours: x.hours, audience: x.audience,
            providerKind: type === "provider" ? "institution" : null, offers: type === "provider" ? ["expert"] : null,
            officialUrl: official, sourceUrl: official, sourceName: x.source || x.provider || "LIVON", sourceType: srcType,
            verificationStatus: official ? (cred === "verified" ? "official_source" : "source_linked") : null,
            providerId: type !== "provider" ? provId : null,
            retrievedAt: x.checkedAt || EX.checkedAt, updatedAt: x.checkedAt || EX.checkedAt, lastCheckedAt: x.checkedAt || EX.checkedAt, href: "#ex-item-" + x.id, status: x.publishStatus || "published",
            startDate: x.startDate, endDate: x.endDate, applicationStart: x.applicationStart, applicationEnd: x.applicationEnd, expiresAt: x.expiresAt,
            bookingType: "none", availabilityType: "unknown",
            meta: { uiType: x.type, layout: x.layout, credentialNote: x.credentials && x.credentials.note, internalUrl: internal }, _raw: x });
        });
        Object.keys(providers).forEach(function (k) { out.push(providers[k]); });
        /* Community: groups and challenges (read-only descriptions; posts stay on the device) */
        (CM && CM.communities || []).forEach(function (c) {
          out.push({ id: "cm:" + c.id, type: "communityContent", communityKind: "group", title: c.name, summary: c.desc, category: c.interest || null, interest: c.interest, join: c.join,
            tags: [c.interest], image: c.img, href: "#cm-groups", sourceName: "LIVON", sourceType: "editorial", status: "published", _raw: c });
        });
        (CM && CM.challenges || []).forEach(function (c) {
          out.push({ id: "ch:" + c.id, type: "communityContent", communityKind: "challenge", title: c.title, summary: c.desc, category: c.field || null, interest: c.field, days: c.days,
            tags: [c.field], href: "#community", sourceName: "LIVON", sourceType: "editorial", status: "published", _raw: c });
        });
        return out;
      }
    };
  }

  /*
   * Public data (공공데이터포털 · 온통청년 · 기업마당 · 고용24 · TourAPI · Kakao Local …).
   * Keys never reach the browser: rows come from the LIVON API (/api/livon/data) through the real-data layer,
   * or from any function the host passes (server tools, tests). No configured provider ⇒ [].
   */
  function PublicDataAdapter(o) {
    o = o || {};
    return {
      id: o.id || "livon-public-data", kind: "public", sourceType: "public_api",
      status: function () { return { configured: !!(o.entities || o.load || (root.LivonData && root.LivonData.repository)) }; },
      load: function (ctx) {
        var p = o.entities ? Promise.resolve(o.entities) : o.load ? Promise.resolve().then(o.load)
          : root.LivonData && root.LivonData.repository ? Promise.resolve(root.LivonData.external(root.LivonData.repository.list())) : Promise.resolve([]);
        return p.then(function (list) {
          return (Array.isArray(list) ? list : []).map(function (x) {
            var fn = o.normalize || normalizeRealDataEntity;
            var r = fn(x, { sourceType: "public_api", provider: x && x.provider });
            /* an unknown / missing type still goes to canonicalize so it is counted as rejected with a reason */
            if (!r && x && typeof x === "object") r = { id: x.id, type: String(x.type || ""), title: x.title, sourceType: "public_api", sourceName: x.source && x.source.providerName || null };
            /* LIVON retrieved it now if the row does not say when (a fetch time — never a source date) */
            if (r && !r.retrievedAt) r.retrievedAt = new Date(ctx && ctx.now || Date.now()).toISOString();
            return r;
          }).filter(Boolean);
        }).catch(function () { return []; });
      }
    };
  }
  /* direct partners (future): contract only, no rows until a partner feed exists */
  function PartnerAdapter(o) {
    o = o || {};
    return {
      id: o.id || "livon-partner", kind: "partner", sourceType: "partner",
      status: function () { return { configured: !!o.load, planned: !o.load }; },
      load: function () {
        if (!o.load) return Promise.resolve([]);
        return Promise.resolve().then(o.load).then(function (list) {
          return (list || []).map(function (x) { return Object.assign({}, x, { sourceType: "partner" }); });
        }).catch(function () { return []; });
      }
    };
  }
  /* LIVON-managed records (future Admin / DB). V1: in-memory records passed by the host (tests, server). */
  function InternalAdapter(o) {
    o = o || {};
    return {
      id: o.id || "livon-internal", kind: "internal", sourceType: "internal",
      status: function () { return { configured: !!(o.records || o.load) }; },
      load: function () {
        var p = o.records ? Promise.resolve(o.records) : o.load ? Promise.resolve().then(o.load) : Promise.resolve([]);
        return p.catch(function () { return []; });
      }
    };
  }

  /* ───────────────────────── Search V1 ───────────────────────── */
  var FIELD_WEIGHT = [["title", 6], ["tags", 3], ["category", 2], ["subCategory", 1], ["summary", 1.5], ["description", 0.5], ["sourceName", 1]];
  function tokens(q) { return String(q || "").toLowerCase().split(/[\s,·/]+/).map(norm).filter(function (x) { return x.length >= 1; }); }
  function words(v) { return String(Array.isArray(v) ? v.join(" ") : v == null ? "" : v).toLowerCase().split(/[\s,·/()\[\]]+/).map(norm).filter(Boolean); }
  function indexEntity(e) {
    var f = {};
    FIELD_WEIGHT.forEach(function (fw) { f[fw[0]] = words(e[fw[0]]); });
    f.extra = words([e.name, e.organization, e.agency, e.region, e.interest].concat(e.specialties || [], e.needs || [], e.checklist || []));
    return f;
  }
  /* a hit is a word that starts with the token (Korean compounds: "이사준비" ← "이사"); a mid-word hit counts only
     for tokens of 3+ characters and at half weight, so "이사" never matches "아이사랑" */
  function wordScore(ws, tok) {
    var best = 0;
    for (var i = 0; i < ws.length; i++) {
      var w = ws[i];
      if (w === tok) return 1.5;
      if (w.indexOf(tok) === 0) best = Math.max(best, 1);
      else if (tok.length >= 3 && w.indexOf(tok) > 0) best = Math.max(best, 0.5);
    }
    return best;
  }
  function scoreToken(fields, tok) {
    var best = 0;
    FIELD_WEIGHT.forEach(function (fw) { var m = wordScore(fields[fw[0]], tok); if (m) best = Math.max(best, fw[1] * m); });
    if (!best && wordScore(fields.extra, tok)) best = 0.8;
    return best;
  }

  /* ───────────────────────── Repository ───────────────────────── */
  /*
   * createRepository({ adapters, now, includeSamples }) — the only door the UI and the AI tools use.
   * Everything is synchronous after load(); load() never rejects (a failing adapter contributes 0 rows).
   */
  function createRepository(o) {
    o = o || {};
    var adapters = o.adapters || [];
    var clock = typeof o.now === "function" ? o.now : function () { return o.now != null ? o.now : Date.now(); };
    var store = [], byId = {}, idx = {}, rawById = {}, reverse = {}, report = [], loaded = false, loading = null;
    function defaults(q) { return Object.assign({ includeSamples: !!o.includeSamples }, q || {}); }

    function add(raw, adapter, rep) {
      var r = canonicalize(Object.assign({ sourceType: adapter.sourceType }, raw));
      if (!r.ok) {
        rep.rejected++; if (rep.errors.length < 20) rep.errors.push({ id: raw && raw.id || null, errors: r.errors });
        r.errors.forEach(function (c) { rep.errorCodes[c] = (rep.errorCodes[c] || 0) + 1; });
        return;
      }
      r.warnings.forEach(function (c) { rep.warningCodes[c] = (rep.warningCodes[c] || 0) + 1; });
      var e = r.entity;
      if (r.warnings.length) rep.warnings += r.warnings.length;
      if (byId[e.id]) { rep.duplicates++; return; } /* first adapter wins; later adapters cannot overwrite curated rows */
      e.meta.adapter = adapter.id;
      store.push(e); byId[e.id] = e;   /* the search index of a record is built on its first search (fieldsOf) */
      if (raw && raw._raw && typeof raw._raw === "object") rawById[e.id] = raw._raw;
      rep.accepted++;
    }
    /* search fields of one record, computed once per repository and only when a search needs them */
    function fieldsOf(e) { return idx[e.id] || (idx[e.id] = indexEntity(e)); }
    function buildReverse() {
      reverse = {};
      store.forEach(function (e) {
        RELATION_KEYS.forEach(function (k) {
          (e.relations[k] || []).forEach(function (target) { (reverse[target] = reverse[target] || []).push(e.id); });
        });
      });
    }
    /* Life Event ↔ topic links that the files do not state: same stage + the event's name in the topic */
    function inferEventTopics() {
      var events = store.filter(function (e) { return e.type === "lifeEvent"; });
      var topics = store.filter(function (e) { return e.type === "content" && e.contentKind === "topic"; });
      events.forEach(function (ev) {
        var evKey = ev.lifeEvents[0] || ev.id.replace(/^le:/, "");
        /* curated links (life-events-data.js topicIds) first — only ids that exist are kept */
        var picked = (ev.relations.topicIds || []).filter(function (id) { return byId[id] && byId[id].contentKind === "topic"; });
        ev.relations.topicIds = picked;
        picked.forEach(function (h) { var tp = byId[h]; tp.lifeEvents = uniq(tp.lifeEvents.concat([evKey])); });
        if (picked.length) ev.meta.topicLinks = "curated";
        var key = norm(ev.title);
        if (key.length < 2) return;
        var hits = topics.filter(function (tp) {
          if (!tp.lifeStages.some(function (s) { return ev.lifeStages.indexOf(s) >= 0; })) return false;
          return norm(tp.title + " " + (tp.category || "")).indexOf(key) >= 0;
        }).map(function (tp) { return tp.id; });
        if (hits.length) {
          ev.relations.topicIds = uniq(picked.concat(hits)).slice(0, 12);
          ev.meta.topicLinks = picked.length ? "curated+inferred" : "inferred";
          hits.forEach(function (h) { var tp = byId[h]; if (ev.relations.topicIds.indexOf(h) >= 0) tp.lifeEvents = uniq(tp.lifeEvents.concat([evKey])); });
        }
      });
    }
    /* synchronous load for adapters that already hold their rows in memory (curated files): screens render at once */
    function loadSync() {
      store = []; byId = {}; idx = {}; rawById = {}; report = [];
      adapters.forEach(function (a) {
        var rep = { adapter: a.id, kind: a.kind, accepted: 0, rejected: 0, duplicates: 0, warnings: 0, errors: [], errorCodes: {}, warningCodes: {}, merged: 0, failed: false };
        report.push(rep);
        if (typeof a.loadSync !== "function") { rep.failed = true; rep.async = true; return; }
        try { (a.loadSync({ now: clock() }) || []).forEach(function (raw) { add(raw, a, rep); }); } catch (e) { rep.failed = true; }
      });
      finalize();
      loaded = true;
      return api;
    }
    function finalize() { inferEventTopics(); crossSourceDedupe(); buildReverse(); }
    /*
     * Cross-source duplicates (docs/livon/LIVON_REAL_DATA_ARCHITECTURE.md §Dedupe). Two rows are the same thing only on strong evidence:
     *   · the same official id (officialId), or
     *   · the same official detail URL (host + path — never a bare home page), or
     *   · the same normalized title AND ≥ 2 of { start day, address, organizer/agency, official URL }.
     * A title alone never merges (age-variant LIVON guides share titles on purpose); two curated rows never merge;
     * rows of one adapter with the same source id are handled by the id itself.
     * The row with the higher SOURCE_PRIORITY stays (tie → newer source/check date); the other is kept but hidden
     * (duplicateOf) and listed in the winner's alsoFrom.
     */
    function dedupeKey(e) {
      var url = (e.officialUrl || e.sourceUrl || "").replace(/^https?:\/\/(www\.)?/i, "").replace(/#.*$/, "").replace(/\/+$/, "");
      return {
        official: e.officialId ? norm(e.officialId) : "",
        url: url.indexOf("/") > 0 ? url.toLowerCase() : "",
        title: norm(e.title), day: (e.startDate || "").slice(0, 10),
        addr: norm(e.location && e.location.address || ""), org: norm(e.organizer || e.agency || e.organization || ""),
        /* places only: ≈100 m grid and the facility's phone count as one signal each, never alone */
        geo: e.type === "place" && e.coordinates ? e.coordinates.lat.toFixed(3) + "," + e.coordinates.lng.toFixed(3) : "",
        phone: e.type === "place" ? String(e.phone || "").replace(/\D/g, "") : ""
      };
    }
    function rank(e) { return (SOURCE_PRIORITY[e.sourceType] || 0) * 1e13 + (t(e.sourceUpdatedAt || e.lastCheckedAt || e.updatedAt) || 0); }
    function curated(e) { return e.sourceType === "editorial" || e.sourceType === "internal"; }
    function crossSourceDedupe() {
      var dup = 0;
      store.forEach(function (e) { e.duplicateOf = null; e.alsoFrom = []; });
      store.forEach(function (e) {
        if (curated(e) || e.duplicateOf) return;
        var k = dedupeKey(e), twin = null;
        store.some(function (m) {
          /* rows of the same source never merge with each other (their own ids already tell them apart) */
          if (m === e || m.type !== e.type || m.duplicateOf || (m.meta.upstreamProvider || m.meta.adapter) === (e.meta.upstreamProvider || e.meta.adapter)) return false;
          var mk = dedupeKey(m);
          var strong = (k.official && k.official === mk.official) || (k.url && k.url === mk.url);
          var extra = ["day", "addr", "org", "url", "geo", "phone"].filter(function (f) { return k[f] && k[f] === mk[f]; }).length;
          if (strong || (k.title && k.title === mk.title && extra >= 2)) { twin = m; return true; }
          return false;
        });
        if (!twin) return;
        var keep = rank(e) > rank(twin) ? e : twin, drop = keep === e ? twin : e;
        drop.duplicateOf = keep.id;
        keep.alsoFrom = keep.alsoFrom.concat([{ id: drop.id, sourceName: drop.sourceName, sourceType: drop.sourceType, sourceUrl: drop.sourceUrl || drop.officialUrl || null }]);
        dup++;
        report.forEach(function (r) { if (r.adapter === drop.meta.adapter) r.merged++; });
      });
      return dup;
    }
    function load(force) {
      if (loaded && !force) return Promise.resolve(api);
      if (loading && !force) return loading;
      store = []; byId = {}; idx = {}; rawById = {}; report = [];
      loading = adapters.reduce(function (p, a) {
        return p.then(function () {
          var rep = { adapter: a.id, kind: a.kind, accepted: 0, rejected: 0, duplicates: 0, warnings: 0, errors: [], errorCodes: {}, warningCodes: {}, merged: 0, failed: false };
          report.push(rep);
          return Promise.resolve().then(function () { return a.load({ now: clock() }); }).then(function (rows) {
            (Array.isArray(rows) ? rows : []).forEach(function (raw) { add(raw, a, rep); });
          }).catch(function () { rep.failed = true; });
        });
      }, Promise.resolve()).then(function () {
        finalize();
        loaded = true; loading = null;
        return api;
      });
      return loading;
    }

    function visible(q) { q = defaults(q); var now = q.at != null ? q.at : clock(); return store.filter(function (e) { return isVisible(e, now, q); }); }
    function ofType(type, q) { return visible(q).filter(function (e) { return e.type === type; }); }
    function activeOn(e, day) {
      var d = t(day); if (isNaN(d)) return true;
      var s = t(e.startDate), en = t(effectiveEnd(e));
      if (!isNaN(s) && s > d + DAY) return false;
      if (!isNaN(en) && en < d) return false;
      return true;
    }
    function regionMatch(e, region, nationwide) {
      if (!region) return true;
      if (e.region === region) return true;
      if (nationwide !== false && (!e.region || NATIONWIDE[e.region] || e.online === true)) return true;
      return !!(e.location && e.location.address && e.location.address.indexOf(region) === 0);
    }
    /* shared filter system (Explore, Search, AI tools) */
    function applyFilters(list, f) {
      f = f || {};
      var types = f.types || (f.type ? [f.type] : null);
      return list.filter(function (e) {
        if (types && types.indexOf(e.type) < 0) return false;
        if (f.category && !(e.domains.indexOf(f.category) >= 0 || norm(e.category) === norm(f.category) || (e.subCategory && e.subCategory.split(",").indexOf(f.category) >= 0))) return false;
        if (f.tags && f.tags.length && !f.tags.some(function (tg) { return e.tags.map(norm).indexOf(norm(tg)) >= 0; })) return false;
        if (f.region && !regionMatch(e, f.region, f.nationwide)) return false;
        if (f.lifeStage && e.lifeStages.length && e.lifeStages.indexOf(stageOf(f.lifeStage)) < 0) return false;
        if (f.lifeStage && f.strictLifeStage && !e.lifeStages.length) return false;
        if (f.lifeEvent && e.lifeEvents.indexOf(String(f.lifeEvent).replace(/^le:/, "")) < 0 && e.id !== "le:" + String(f.lifeEvent).replace(/^le:/, "")) return false;
        if (f.priceType && e.priceType !== f.priceType) return false;
        if (typeof f.online === "boolean" && e.online !== f.online) return false;
        if (f.verified === true && !e.verified) return false;
        if (f.date && !activeOn(e, f.date)) return false;
        if (f.target && norm([e.audience, e.eligibility, e.forWhom, e.summary].join(" ")).indexOf(norm(f.target)) < 0) return false;
        return true;
      });
    }
    function search(query, f) {
      f = f || {};
      var base = applyFilters(visible(f), f);
      var toks = tokens(query);
      if (!toks.length) return { query: String(query || ""), total: base.length, items: base.slice(0, f.limit || 20).map(result(0, [])) };
      function scoreAll(requireAll) {
        var hits = [];
        base.forEach(function (e) {
          var fields = fieldsOf(e), total = 0, matched = [], all = true;
          toks.forEach(function (tok) {
            var s = scoreToken(fields, tok);
            if (!s) (SYNONYMS[tok] || []).forEach(function (syn) { s = Math.max(s, scoreToken(fields, norm(syn)) * 0.5); });
            if (s) { total += s; matched.push(tok); } else all = false;
          });
          if (total && (!requireAll || all)) hits.push({ e: e, s: total + (e.verified ? 0.3 : 0), m: matched });
        });
        return hits;
      }
      var hits = scoreAll(true);
      if (!hits.length && toks.length > 1) hits = scoreAll(false);
      hits.sort(function (a, b) { return b.s - a.s || a.e.title.localeCompare(b.e.title); });
      var items = hits.slice(0, f.limit || 20).map(function (h) { return result(h.s, h.m)(h.e); });
      var byType = {};
      hits.forEach(function (h) { byType[h.e.type] = (byType[h.e.type] || 0) + 1; });
      return { query: String(query || ""), total: hits.length, byType: byType, items: items };
    }
    function result(score, matched) {
      return function (e) {
        return { id: e.id, type: e.type, typeLabel: TYPE_LABEL[e.type], title: e.title, summary: e.summary, href: e.href, region: e.region,
          sourceType: e.sourceType, freshness: freshnessStatus(e, clock()), retrievedAt: e.retrievedAt, lastCheckedAt: e.lastCheckedAt, officialUrl: e.officialUrl,
          sourceName: e.sourceName, verificationStatus: e.verificationStatus, verified: e.verified, score: Math.round(score * 100) / 100, matched: matched, entity: e };
      };
    }

    /* related items: explicit links first (both directions), then shared life events / tags / stages / domains */
    function related(id, q) {
      q = q || {};
      var e = byId[id];
      if (!e) return [];
      var pool = applyFilters(visible(q), q);
      var explicit = {};
      RELATION_KEYS.forEach(function (k) { (e.relations[k] || []).forEach(function (x) { explicit[x] = 1; }); });
      (reverse[id] || []).forEach(function (x) { explicit[x] = 1; });
      var tagSet = e.tags.map(norm);
      var scored = pool.filter(function (x) { return x.id !== id; }).map(function (x) {
        var s = 0, why = [];
        if (explicit[x.id]) { s += 10; why.push("linked"); }
        var le = x.lifeEvents.filter(function (v) { return e.lifeEvents.indexOf(v) >= 0; }).length;
        if (le) { s += 4 * le; why.push("lifeEvent"); }
        var tg = x.tags.filter(function (v) { return tagSet.indexOf(norm(v)) >= 0; }).length;
        if (tg) { s += 2 * Math.min(tg, 3); why.push("tags"); }
        var dm = x.domains.filter(function (v) { return e.domains.indexOf(v) >= 0; }).length;
        if (dm) { s += Math.min(dm, 2); why.push("domain"); }
        if (e.lifeStages.length && x.lifeStages.some(function (v) { return e.lifeStages.indexOf(v) >= 0; })) { s += 1; why.push("lifeStage"); }
        if (e.category && x.category && norm(e.category) === norm(x.category)) { s += 2; why.push("category"); }
        return { entity: x, score: s, reasons: why };
      }).filter(function (r) { return r.score >= (q.minScore || 3); });
      scored.sort(function (a, b) { return b.score - a.score || a.entity.title.localeCompare(b.entity.title); });
      return scored.slice(0, q.limit || 12);
    }

    /* Life Stage → Life Events → Content / Policy / Program / Expert / Service / Place / Community */
    function lifeEventContext(idOrQuery, q) {
      q = q || {};
      var ev = byId[idOrQuery] || byId["le:" + idOrQuery];
      if (!ev) {
        var s = search(idOrQuery, { types: ["lifeEvent"], limit: 1, lifeStage: q.lifeStage });
        ev = s.items.length ? s.items[0].entity : null;
      }
      if (!ev || !isVisible(ev, clock(), defaults(q))) return null;
      var stage = q.lifeStage ? stageOf(q.lifeStage) : null;
      var topics = (ev.relations.topicIds || []).map(function (x) { return byId[x]; }).filter(function (x) { return x && isVisible(x, clock(), defaults(q)) && (!stage || x.lifeStages.indexOf(stage) >= 0); });
      var buckets = { content: [], policy: [], program: [], "class": [], expert: [], provider: [], service: [], place: [], communityContent: [] };
      var seen = {};
      function put(x, why) { if (!x || seen[x.id] || !buckets[x.type] || !isVisible(x, clock(), defaults(q))) return; seen[x.id] = 1; buckets[x.type].push({ entity: x, via: why }); }
      topics.forEach(function (tp) {
        put(tp, "topic");
        RELATION_KEYS.forEach(function (k) { (tp.relations[k] || []).forEach(function (x) { put(byId[x], "topic:" + tp.id); }); });
      });
      /* fill empty buckets from search on the event's name (rule-based, labelled "search") */
      ["policy", "service", "program", "place", "provider"].forEach(function (type) {
        if (buckets[type].length) return;
        search(ev.title, { types: [type], limit: 3, lifeStage: stage || undefined }).items.forEach(function (r) { put(r.entity, "search"); });
      });
      var interests = uniq(topics.map(function (tp) { return tp.meta.communityInterest; }).filter(Boolean));
      visible(q).filter(function (x) { return x.type === "communityContent" && interests.indexOf(x.interest) >= 0; }).slice(0, 3).forEach(function (x) { put(x, "interest"); });
      return { lifeEvent: ev, topics: topics, related: buckets };
    }
    function lifeStageGraph(stageId, q) {
      var s = stageOf(stageId);
      var stage = byId["stage:" + s];
      if (!stage) return null;
      var events = ofType("lifeEvent", q).filter(function (e) { return e.lifeStages.indexOf(s) >= 0; });
      return {
        lifeStage: stage,
        lifeEvents: events.map(function (ev) { return lifeEventContext(ev.id, Object.assign({}, q, { lifeStage: s })); }).filter(Boolean),
        topics: ofType("content", q).filter(function (e) { return e.contentKind === "topic" && e.lifeStages.indexOf(s) >= 0; })
      };
    }

    /* ── Today feed: rule-based ranking (region · interests · life stage · season · date) ── */
    function seasonOf(ms) {
      var m = new Date(ms + 9 * 3600e3).getUTCMonth() + 1; /* Korea time */
      return m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter";
    }
    function todayFeed(p) {
      p = p || {};
      var at = p.date ? t(isoDate(p.date) || p.date) : clock();
      if (isNaN(at)) at = clock();
      var season = seasonOf(at);
      var interests = (p.interests || []).map(norm).filter(Boolean);
      var stage = p.lifeStage ? stageOf(p.lifeStage) : null;
      var pool = visible(Object.assign({}, p, { at: at })).filter(function (e) {
        if (e.meta.todayCategory) return true;
        /* dated public items (events/classes/programs) join Today only while current and near */
        if ((e.type === "event" || e.type === "class" || e.type === "program") && e.sourceType !== "editorial" && e.startDate) {
          /* upcoming within 30 days, or running now; never after it ended */
          var s = t(e.startDate), end = t(effectiveEnd(e) || e.startDate);
          return s <= at + 30 * DAY && !(end < at);
        }
        return false;
      });
      var scored = pool.map(function (e) {
        var s = 0, why = [];
        if (p.region) {
          if (e.region === p.region) { s += 3; why.push("region:" + p.region); }
          else if (!e.region || NATIONWIDE[e.region] || e.online === true) { s += 1; why.push("region:nationwide"); }
          else s -= 3;
        }
        var hit = e.tags.concat([e.category]).map(norm).filter(function (x) { return x && interests.some(function (i) { return x.indexOf(i) >= 0 || i.indexOf(x) >= 0; }); }).length;
        if (hit) { s += 2 * Math.min(hit, 3); why.push("interests"); }
        if (stage && e.lifeStages.indexOf(stage) >= 0) { s += 2; why.push("lifeStage:" + stage); }
        var seasons = e.meta.seasons || [];
        if (seasons.indexOf(season) >= 0) { s += 2; why.push("season:" + season); }
        if (e.meta.featured) { s += 1; why.push("featured"); }
        if (e.startDate) { var d = (t(e.startDate) - at) / DAY; if (d >= -1 && d <= 14) { s += 2; why.push("upcoming"); } }
        return { entity: e, score: s, reasons: why, category: e.meta.todayCategory || (e.type === "event" ? "event" : e.type === "class" ? "experience" : "learn") };
      });
      scored.sort(function (a, b) { return b.score - a.score || a.entity.title.localeCompare(b.entity.title); });
      var byCategory = {};
      TODAY_IDS.forEach(function (c) { byCategory[c] = []; });
      scored.forEach(function (r) { if (byCategory[r.category] && byCategory[r.category].length < (p.perCategory || 6)) byCategory[r.category].push(r); });
      return { method: "rule-based", date: new Date(at).toISOString(), season: season, total: scored.length, items: scored.slice(0, p.limit || 12), byCategory: byCategory };
    }
    /* generic recommendations for a context (rule-based; used by Home/Explore/AI tools) */
    function recommendations(ctx) {
      ctx = ctx || {};
      var f = { types: ctx.types, region: ctx.region, lifeStage: ctx.lifeStage, lifeEvent: ctx.lifeEvent, category: ctx.category };
      var list = applyFilters(visible(ctx), f);
      var interests = (ctx.interests || []).map(norm);
      /* Context check for all-age rows: a row whose own category is a life-event category (육아, 보육, 창업, 은퇴 …)
         belongs to that event's life stages (from the Life Event catalog). Asked for another stage, it is left out —
         e.g. the 아이사랑 childcare portal (category 육아 → Life Event 육아 → 20·30·40대) is not recommended to 70대,
         even though its "돌봄" tag matches. Tags and search are untouched; rows with a stage of their own are unaffected. */
      var eventStages = {};
      store.forEach(function (x) { if (x.type === "lifeEvent") eventStages[x.id.replace(/^le:/, "")] = x.lifeStages; });
      function contextStages(e) {
        var evs = CATEGORY_LIFE_EVENTS[String(e.category || "").trim()] || [];
        return uniq([].concat.apply([], evs.map(function (k) { return eventStages[k] || []; })));
      }
      var want = ctx.lifeStage ? stageOf(ctx.lifeStage) : null;
      if (want) list = list.filter(function (e) { if (e.lifeStages.length) return true; var cs = contextStages(e); return !cs.length || cs.indexOf(want) >= 0; });
      var scored = list.map(function (e) {
        var s = 0, why = [];
        if (e.verified) { s += 1; why.push("verified +1"); }
        if (e.meta.featured) { s += 1; why.push("featured +1"); }
        if (want && e.lifeStages.indexOf(want) >= 0) { s += 2; why.push("life stage " + want + " +2"); }
        var hit = e.tags.map(norm).filter(function (x) { return interests.indexOf(x) >= 0; });
        if (hit.length) { s += 2 * hit.length; why.push("interest " + hit.join(",") + " +" + 2 * hit.length); }
        if (ctx.region && e.region === ctx.region) { s += 2; why.push("region +2"); }
        if (ctx.lifeEvent) why.push("life event " + String(ctx.lifeEvent).replace(/^le:/, "") + " (filter)");
        return { entity: e, score: s, reasons: why };
      });
      scored.sort(function (a, b) { return b.score - a.score || a.entity.title.localeCompare(b.entity.title); });
      return { method: "rule-based", items: scored.slice(0, ctx.limit || 10) };
    }
    function facets(list) {
      var out = { type: {}, domain: {}, region: {}, priceType: {} };
      (list || visible()).forEach(function (e) {
        out.type[e.type] = (out.type[e.type] || 0) + 1;
        e.domains.forEach(function (d) { out.domain[d] = (out.domain[d] || 0) + 1; });
        if (e.region) out.region[e.region] = (out.region[e.region] || 0) + 1;
        out.priceType[e.priceType] = (out.priceType[e.priceType] || 0) + 1;
      });
      return out;
    }

    var api = {
      load: load,
      loadSync: loadSync,
      /* the original curated record behind an entity (screens render it unchanged); null for external rows */
      source: function (id) { return rawById[id] || null; },
      /* why an entity is not shown: null when visible */
      hiddenReason: function (id, q) {
        var e = byId[id]; if (!e) return "missing";
        var st = lifecycleStatus(e, clock());
        if (st !== "published") return st;
        if (e.sample && !(q && q.includeSamples)) return "sample";
        if (e.provenanceMissing && !(q && q.includeUnsourced)) return "unsourced";
        if (e.duplicateOf && !(q && q.includeDuplicates)) return "duplicate";
        return null;
      },
      get loaded() { return loaded; },
      report: function () { return report.map(function (r) { return Object.assign({}, r, { errors: r.errors.slice() }); }); },
      size: function () { return store.length; },
      all: function (q) { return visible(q); },
      getById: function (id, q) { var e = byId[id]; return e && (q && q.any ? true : isVisible(e, clock(), defaults(q))) ? e : null; },
      getContents: function (q) { return applyFilters(ofType("content", q), q); },
      getLifeStages: function (q) { return ofType("lifeStage", q); },
      getLifeEvents: function (q) { return applyFilters(ofType("lifeEvent", q), q); },
      getPlaces: function (q) { return applyFilters(ofType("place", q), q); },
      getEvents: function (q) { return applyFilters(ofType("event", q), q); },
      getPrograms: function (q) { return applyFilters(ofType("program", q), q); },
      getPolicies: function (q) { return applyFilters(ofType("policy", q), q); },
      getExperts: function (q) { return applyFilters(ofType("expert", q), q); },
      getProviders: function (q) { return applyFilters(ofType("provider", q), q); },
      getServices: function (q) { return applyFilters(ofType("service", q), q); },
      getClasses: function (q) { return applyFilters(ofType("class", q), q); },
      getCommunityContents: function (q) { return applyFilters(ofType("communityContent", q), q); },
      explore: function (f) { var list = applyFilters(visible(f), f); return { total: list.length, items: list.slice(f && f.offset || 0, (f && f.offset || 0) + (f && f.limit || 24)), facets: facets(list) }; },
      search: search,
      getRelatedItems: related,
      getLifeEventContext: lifeEventContext,
      getLifeStageGraph: lifeStageGraph,
      getTodayFeed: todayFeed,
      getRecommendations: recommendations,
      facets: facets,
      lifecycleStatus: function (e) { return lifecycleStatus(e, clock()); },
      freshness: function (idOrEntity) { var e = typeof idOrEntity === "string" ? byId[idOrEntity] : idOrEntity; return e ? freshnessStatus(e, clock()) : "unknown"; }
    };
    return api;
  }

  /* ───────────────────────── Browser default (lazy; no DOM work, no network unless the real-data layer already loaded) ───────────────────────── */
  var shared = null;
  function sharedRepository(force) {
    if (shared && !force) return shared;
    var hub = root.LivonLifeHub && root.LivonLifeHub.repo;
    var ready = hub && hub.status !== "ready" && hub.load ? Promise.resolve().then(function () { return hub.load(); }).catch(function () { return null; }) : Promise.resolve(hub && hub.data);
    shared = ready.then(function (topics) {
      var repo = createRepository({ adapters: [StaticAdapter({ lifeTopics: topics || (hub && hub.data) || null }), PublicDataAdapter(), PartnerAdapter(), InternalAdapter()] });
      return repo.load();
    });
    return shared;
  }

  root.LivonDataPlatform = {
    version: 1,
    TYPES: TYPES, TYPE_LABEL: TYPE_LABEL, STATUSES: STATUSES, TRANSITIONS: TRANSITIONS, SOURCE_TYPES: SOURCE_TYPES, VERIFICATION: VERIFICATION,
    PRICE_TYPES: PRICE_TYPES, BOOKING_TYPES: BOOKING_TYPES, AVAILABILITY_TYPES: AVAILABILITY_TYPES, DOMAINS: DOMAINS.map(function (d) { return { id: d.id, label: d.label }; }),
    TODAY_CATEGORIES: TODAY_CATEGORIES, RELATION_KEYS: RELATION_KEYS, TYPE_FIELDS: TYPE_FIELDS,
    canonicalize: canonicalize, effectiveEnd: effectiveEnd, lifecycleStatus: lifecycleStatus, isVisible: isVisible, freshnessStatus: freshnessStatus,
    SOURCE_PRIORITY: SOURCE_PRIORITY, FRESHNESS_POLICY: FRESHNESS_POLICY, FRESHNESS: FRESHNESS, PLATFORM_PROVIDERS: PLATFORM_PROVIDERS, CATEGORY_LIFE_EVENTS: CATEGORY_LIFE_EVENTS,
    normalizeEvent: normalizeEvent, normalizePlace: normalizePlace, normalizeProgram: normalizeProgram, normalizeClass: normalizeClass,
    normalizePolicy: normalizePolicy, normalizeExpert: normalizeExpert, normalizeService: normalizeService, normalizeContent: normalizeContent,
    normalizeRealDataEntity: normalizeRealDataEntity,
    createDraft: createDraft, validateForPublish: validateForPublish, transition: transition,
    StaticAdapter: StaticAdapter, PublicDataAdapter: PublicDataAdapter, PartnerAdapter: PartnerAdapter, InternalAdapter: InternalAdapter,
    createRepository: createRepository,
    /* the domains a piece of text belongs to (same classifier the entities use) */
    domainsOfText: function (text) { var out = []; text = String(text || ""); DOMAINS.forEach(function (d) { if (d.re.test(text)) out.push(d.id); }); return out; },
    shared: sharedRepository
  };
})(typeof window !== "undefined" ? window : globalThis);
