/*
 * LIVON Admin — service layer (no DOM).
 *
 *   Admin UI (admin-app.js) → Admin Service (this file) → Adapter (admin-store.js: local today, server later)
 *
 * Everything that describes LIVON data comes from the Data Manager core (LivonDataManager) built ONCE per session,
 * which itself uses the shared quality evaluator (LivonContentQuality). The Admin and the Data Manager therefore
 * cannot disagree: same model, same rules, same numbers.
 *
 * READ-ONLY with respect to LIVON: drafts, review states, moderation marks and audit events are local simulations
 * stored through the adapter. Curated files, the Data Platform repository and the public community store are never
 * written. Nothing is presented as LIVE unless it is.
 */
(function (root) {
  "use strict";

  /* ───────── one place for status words ───────── */
  var STATUS = { READY: "READY", ACTIVE: "ACTIVE", LOCAL_ONLY: "LOCAL ONLY", CODE_READY: "CODE READY", NOT_CONNECTED: "NOT CONNECTED",
    NOT_CONFIGURED: "NOT CONFIGURED", BACKEND_REQUIRED: "BACKEND REQUIRED", DEFERRED: "DEFERRED", LOCAL_FIRST: "LOCAL-FIRST", LOCAL_RULE_BASED: "LOCAL RULE-BASED", ERROR: "ERROR", UNAVAILABLE: "UNAVAILABLE" };

  var NAV = [
    { id: "overview", label: "Overview" }, { id: "content", label: "Content" }, { id: "life-stage", label: "Life Stage" }, { id: "life-events", label: "Life Events" },
    { id: "today", label: "Today" }, { id: "explore", label: "Explore" }, { id: "community", label: "Community" }, { id: "quality", label: "Data Quality" },
    { id: "review", label: "Review Queue" }, { id: "sources", label: "Sources" }, { id: "providers", label: "Providers" }, { id: "reports", label: "Reports" },
    { id: "drafts", label: "Local Drafts" }, { id: "audit", label: "Audit Events" }, { id: "system", label: "System" }
  ];
  var FUTURE_MODULES = [
    { id: "users", label: "Users", manages: ["account list and status", "consent and data-deletion requests", "support history"], requires: "NEWON+ account backend (deferred)" },
    { id: "partners", label: "Partners", manages: ["partner onboarding and verification", "partner-provided listings", "contracts and contacts"], requires: "partner backend" },
    { id: "bookings", label: "Bookings", manages: ["reservation requests", "schedule and capacity", "cancellations"], requires: "reservation backend" },
    { id: "payments", label: "Payments", manages: ["orders and receipts", "refunds", "settlement"], requires: "payment provider and backend" }
  ];
  var TODAY_SECTIONS = ["place", "experience", "learn", "together", "season", "life", "editorial", "event"];
  /* provider facts not in the manifest, taken from docs/livon/real-data-providers.md */
  var PROVIDER_NORMALIZER = { "kr-youth-policy": "server/livon/data/providers/youthcenter.mjs", "kr-business-support": "server/livon/data/providers/bizinfo.mjs",
    "kr-business-event": "server/livon/data/providers/bizinfo-event.mjs", "kr-kakao-place": "server/livon/data/providers/kakao-local.mjs", "kr-tourapi": "server/livon/data/providers/tourapi.mjs",
    "kr-lifelong-class": "server/livon/data/providers/lifelong-class.mjs", "kr-public-tax-expert": "server/livon/data/providers/public-tax-expert.mjs", "kr-job-training": "server/livon/data/providers/job-training.mjs" };
  var PROVIDER_APPROVAL = { "kr-youth-policy": "Yes — 인증키 신청 후 담당자 승인", "kr-business-support": "Yes — 기업마당 사용신청 후 인증키 발급 (승인 절차 확인 필요)",
    "kr-business-event": "Yes — 기업마당 사용신청 후 인증키 발급 (승인 절차 확인 필요)", "kr-kakao-place": "App registration — Kakao Developers 앱 + REST API 키",
    "kr-tourapi": "Yes — 공공데이터포털 활용신청 (개발 자동승인 / 운영 심의승인)", "kr-lifelong-class": "Yes — 공공데이터포털 활용신청 (자동승인)",
    "kr-public-tax-expert": "Yes — 공공데이터포털 활용신청 (자동승인)", "kr-job-training": "Yes — 공공데이터포털 활용신청 (개발 자동승인 / 운영 심의승인)" };
  var FRESHNESS_DAYS = { event: 7, program: 14, "class": 14, policy: 30, place: 180, expert: 90, provider: 180, service: 180, content: 365 };
  var EDITABLE = ["title", "summary", "category", "tags", "cta"];
  var SECRETISH = /(secret|token|password|api[-_]?key|apikey|credential|authorization|cookie|email|phone)/i;

  function uniq(a) { var s = {}; return a.filter(function (x) { if (x == null || s[x]) return false; s[x] = 1; return true; }); }
  function countBy(list, f) { var m = {}; list.forEach(function (x) { [].concat(f(x)).forEach(function (k) { if (k == null || k === "") return; m[k] = (m[k] || 0) + 1; }); }); return m; }
  function lc(s) { return String(s == null ? "" : s).toLowerCase(); }
  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  function avg(list) { return list.length ? +(list.reduce(function (n, x) { return n + x; }, 0) / list.length).toFixed(1) : null; }

  function create(opts) {
    opts = opts || {};
    var env = opts.env || root, DM = env.LivonDataManager, adapter = opts.adapter, clock = opts.clock || function () { return Date.now(); };
    var manifest = opts.manifest && opts.manifest.PROVIDER_MANIFEST ? opts.manifest : null;
    var model = null, modelError = null;
    try {
      if (!DM) throw new Error("Data Manager core not loaded");
      model = opts.emptyDataset ? null : DM.createModel(env, { now: opts.now });
    } catch (e) { modelError = String(e && e.message || e); }
    var records = model ? model.records : [];
    var cache = {};
    function memo(k, f) { if (!(k in cache)) cache[k] = f(); return cache[k]; }
    function need() { if (!model) { var e = new Error(modelError || "NO_DATA"); e.code = modelError ? "MODEL_ERROR" : "NO_DATA"; throw e; } return model; }
    var auditSeq = 0;

    /* ───────── status ───────── */
    function operationsStatus() {
      var q = model ? DM.reviewQueue(model).counts : null;
      var live = records.filter(function (r) { var e = model.repo.getById(r.id, { any: true }); return e && e.meta && e.meta.upstreamProvider; }).length;
      var reps = model ? model.repo.report() : [];
      var SD = env.LivonScreenData;
      return [
        { id: "curated", label: "Curated Data", status: !model ? STATUS.ERROR : q.P0 ? STATUS.ERROR : STATUS.READY, detail: model ? records.length + " records · P0 " + q.P0 : modelError },
        { id: "platform", label: "Data Platform", status: model && reps.every(function (r) { return !r.failed || r.async; }) ? STATUS.READY : STATUS.ERROR, detail: model ? reps.map(function (r) { return r.adapter + " " + r.accepted; }).join(" · ") : "not loaded" },
        { id: "screens", label: "Screen Integration", status: SD && SD.todayContents().length && SD.exploreItems().length && SD.topics().length ? STATUS.READY : STATUS.ERROR, detail: SD ? "Today " + SD.todayContents().length + " · Explore " + SD.exploreItems().length + " · Life Stage topics " + SD.topics().length : "screen bridge missing" },
        { id: "providers", label: "Real Data Providers", status: live ? STATUS.READY : manifest ? STATUS.CODE_READY : STATUS.NOT_CONNECTED, detail: (manifest ? Object.keys(manifest.PROVIDER_MANIFEST).length + " providers, code ready · " : "") + "live external records " + live + " · NOT CONNECTED in this local session" },
        { id: "ai", label: "LIVON AI", status: STATUS.NOT_CONNECTED, detail: "server route exists; this local session has no API origin or key" },
        { id: "community", label: "Community Backend", status: STATUS.BACKEND_REQUIRED, detail: "posts live only on each device (localStorage)" },
        { id: "newon-plus", label: "NEWON+", status: STATUS.DEFERRED, detail: "no Newon+ project configured — LIVON runs anonymously" },
        { id: "booking", label: "Booking", status: STATUS.BACKEND_REQUIRED, detail: "no reservation backend" },
        { id: "payments", label: "Payments", status: STATUS.BACKEND_REQUIRED, detail: "no payment backend" }
      ];
    }

    /* ───────── overview ───────── */
    function overview() {
      return memo("overview", function () {
        if (!model) return { empty: true, error: modelError };
        var d = DM.dashboard(model), Q = DM.reviewQueue(model), F = DM.freshness(model), C = DM.coverage(model);
        return {
          content: { total: d.total, types: d.types, searchable: C.totals.SEARCH, detail: C.totals.DETAIL, contentGaps: DM.contentGaps(model).length },
          quality: { average: d.quality.average, grades: d.quality.grades, activeFlags: Object.keys(d.flags).length, flags: d.flags },
          review: Q.counts,
          sources: { official: records.filter(function (r) { return !!r.officialUrl; }).length, "LIVON-written": d.sources["LIVON-written"], Government: d.sources.Government, "Public institution": d.sources["Public institution"], Newon: d.sources.Newon, Other: d.sources.Other },
          freshness: F.counts,
          screens: { Home: C.totals.HOME, Today: C.totals.TODAY, "Life Stage": C.totals["LIFE STAGE"], Explore: C.totals.EXPLORE, Search: C.totals.SEARCH, "My Life": C.totals["MY LIFE"], Detail: C.totals.DETAIL, Community: C.totals.COMMUNITY }
        };
      });
    }

    /* ───────── content ───────── */
    function content(q) { return DM.query(need(), q || {}); }
    function inspect(id) {
      if (!model) return null;
      var d = DM.inspect(model, id); if (!d) return null;
      var r = d.record;
      d.ops = { editable: EDITABLE.slice(), searchable: r.screens.indexOf("SEARCH") >= 0, hasDetail: r.screens.indexOf("DETAIL") >= 0,
        freshnessWindowDays: FRESHNESS_DAYS[r.type] || null, planned: !!((model.repo.source(r.id) || {}).planned) };
      return d;
    }

    /* ───────── Life Stage ───────── */
    function relatedTypeCounts(topics) {
      var ids = uniq([].concat.apply([], topics.map(function (t) { return Object.keys(t.relationIds).filter(function (k) { return k !== "topicIds"; }).map(function (k) { return t.relationIds[k]; }).reduce(function (a, b) { return a.concat(b); }, []); })));
      var byType = { content: 0, policy: 0, service: 0, program: 0, place: 0, "class": 0 };
      ids.forEach(function (id) { var r = model.byId[id]; if (r && r.type in byType) byType[r.type]++; });
      return byType;
    }
    function lifeStages() {
      return memo("stages", function () {
        need();
        return DM.STAGES.map(function (s) {
          var topics = records.filter(function (r) { return /^topic:/.test(r.id) && r.lifeStage.indexOf(s) >= 0; });
          var stageRec = model.byId["stage:" + s];
          var c = relatedTypeCounts(topics);
          return { stage: s, label: stageRec ? stageRec.title : s + "대", topics: topics.length, content: c.content, policy: c.policy, service: c.service, program: c.program, place: c.place, "class": c["class"],
            flagged: topics.filter(function (t) { return t.flags.length; }).length, gaps: DM.contentGaps(model).filter(function (g) { return g.area.indexOf(s + "대") === 0; }).length,
            topicList: topics.map(function (t) { return { id: t.id, title: t.title, category: t.category, score: t.score, flags: t.flags, searchable: t.screens.indexOf("SEARCH") >= 0, related: t.relationCount }; }) };
        });
      });
    }
    function topicDetail(id) {
      var d = inspect(id); if (!d || !/^topic:/.test(id)) return null;
      var s = d.record.lifeStage[0];
      d.stageGaps = DM.contentGaps(model).filter(function (g) { return g.area.indexOf(s + "대") === 0; });
      return d;
    }

    /* ───────── Life Events ───────── */
    function lifeEvents() {
      return memo("events", function () {
        need();
        var R = DM.relationExplorer(model);
        return R.events.map(function (e) {
          var r = model.byId[e.id], raw = model.repo.source(e.id) || {}, key = e.id.slice(3);
          return { id: e.id, title: e.title, status: e.status, planned: !!raw.planned, stages: e.stages, topics: e.topics,
            relatedContent: records.filter(function (x) { return x.type !== "lifeEvent" && x.lifeEvent.indexOf(key) >= 0; }).length,
            searchable: r.screens.indexOf("SEARCH") >= 0, score: r.score, grade: r.grade, flags: r.flags };
        });
      });
    }

    /* ───────── Today ───────── */
    function today() {
      return memo("today", function () {
        need();
        var items = records.filter(function (r) { return /^td:/.test(r.id); }).map(function (r) {
          var raw = model.repo.source(r.id) || {};
          return { id: r.id, title: r.title, section: raw.type, category: r.category, source: r.sourceName, sourceClass: r.sourceClass, officialUrl: r.officialUrl,
            budget: raw.budget || null, price: raw.price || null, score: r.score, grade: r.grade, freshness: r.freshness,
            dateStatus: r.requiresDateVerification ? "DATE VERIFICATION REQUIRED" : r.startDate || r.endDate || r.expiresAt ? "dated" : "evergreen (no date)",
            flags: r.flags, featured: !!raw.featured };
        });
        var sections = TODAY_SECTIONS.map(function (s) {
          var it = items.filter(function (x) { return x.section === s; });
          return { section: s, count: it.length, sources: countBy(it, function (x) { return x.source; }), budgets: countBy(it, function (x) { return x.budget || "(none)"; }),
            categories: it.map(function (x) { return x.category; }), avgScore: avg(it.map(function (x) { return x.score; })), freshness: countBy(it, function (x) { return x.freshness; }),
            dateStatus: countBy(it, function (x) { return x.dateStatus; }), flagged: it.filter(function (x) { return x.flags.some(function (f) { return f === "UNSOURCED_SPECIFIC" || f === "FIELD_CONFLICT"; }); }).length };
        });
        return { items: items, sections: sections, unsourced: items.filter(function (x) { return x.flags.indexOf("UNSOURCED_SPECIFIC") >= 0; }).length,
          conflicts: items.filter(function (x) { return x.flags.indexOf("FIELD_CONFLICT") >= 0; }).length };
      });
    }

    /* ───────── Explore ───────── */
    function explore() {
      return memo("explore", function () {
        need();
        var cats = ((env.LivonExploreData || {}).categories || []);
        var items = records.filter(function (r) { return /^ex:/.test(r.id); }).map(function (r) {
          var raw = model.repo.source(r.id) || {};
          return { id: r.id, title: r.title, uiType: raw.type, canonicalType: r.type, categories: raw.categoryIds || [], source: r.sourceName, sourceClass: r.sourceClass,
            official: !!r.officialUrl, freshness: r.freshness, score: r.score, grade: r.grade, route: r.href, flags: r.flags };
        });
        var group = function (list) { return { count: list.length, sources: countBy(list, function (x) { return x.source; }), official: list.filter(function (x) { return x.official; }).length,
          freshness: countBy(list, function (x) { return x.freshness; }), avgScore: avg(list.map(function (x) { return x.score; })), routes: list.map(function (x) { return x.route; }) }; };
        var byType = {}; uniq(items.map(function (x) { return x.uiType; })).forEach(function (t) { byType[t] = group(items.filter(function (x) { return x.uiType === t; })); });
        var byCategory = cats.map(function (c) { return Object.assign({ id: c.id, label: c.label || c.id }, group(items.filter(function (x) { return x.categories.indexOf(c.id) >= 0; }))); });
        return { items: items, byType: byType, byCategory: byCategory,
          expertProfiles: records.filter(function (r) { return r.type === "expert"; }).length,
          expertNote: "0 individual expert profiles. Explore cards of type “expert” are official institutions/portals (providerKind: institution). LIVON never creates person profiles." };
      });
    }

    /* ───────── Community ───────── */
    function readCommunityStore(raw) {
      if (raw == null) return { available: false, reason: "no community activity stored in this browser" };
      var o; try { o = typeof raw === "string" ? JSON.parse(raw) : raw; } catch (e) { return { available: false, reason: "community store is malformed (left untouched)" }; }
      if (!o || typeof o !== "object") return { available: false, reason: "community store is malformed (left untouched)" };
      var posts = Array.isArray(o.posts) ? o.posts.filter(function (p) { return p && p.id; }) : [];
      return { available: true, posts: posts.map(function (p) { return { id: String(p.id), title: String(p.title || "").slice(0, 80), type: p.type || "story", visibility: p.visibility || "public", deleted: !!p.deleted, draft: !!p.draft, category: p.category || "", createdAt: p.createdAt || null }; }),
        comments: Array.isArray(o.comments) ? o.comments.length : 0, reports: Array.isArray(o.reports) ? o.reports.length : 0, saves: Array.isArray(o.saves) ? o.saves.length : 0, joined: Array.isArray(o.joined) ? o.joined.length : 0 };
    }
    function community(storeRaw) {
      need();
      var CD = env.LivonCommunityData || {};
      var device = readCommunityStore(storeRaw);
      return {
        backend: STATUS.NOT_CONNECTED,
        curated: { groups: records.filter(function (r) { return /^cm:/.test(r.id); }).map(function (r) { return { id: r.id, title: r.title, category: r.category, score: r.score }; }),
          challenges: records.filter(function (r) { return /^ch:/.test(r.id); }).map(function (r) { return { id: r.id, title: r.title, category: r.category, score: r.score }; }),
          rules: (CD.rules || []).length, postTypes: CD.typeLabels || {} },
        device: device,
        postTypes: device.available ? countBy(device.posts, function (p) { return p.type; }) : {},
        note: "Curated = groups/challenges shipped with LIVON. Device = posts written in this browser only (read-only here). There is no community server."
      };
    }

    /* ───────── quality / review / sources ───────── */
    function quality() {
      need();
      var d = DM.dashboard(model), FL = env.LivonContentQuality.FLAGS;
      return { grades: d.quality.grades, average: d.quality.average, flags: Object.keys(FL).map(function (f) { return { flag: f, meaning: FL[f], count: d.flags[f] || 0 }; }), activeFlags: Object.keys(d.flags) };
    }
    function issueKey(i) { return [i.priority, i.rule, i.recordId || "", i.recordId ? "" : i.title].join("|"); }
    function reviewQueue(states) {
      need();
      var Q = DM.reviewQueue(model); states = states || {};
      return { counts: Q.counts, byRule: Q.byRule, rules: Q.rules, items: Q.items.map(function (i) { return Object.assign({ key: issueKey(i), state: states[issueKey(i)] || "OPEN" }, i); }) };
    }
    function sources() {
      need();
      return DM.sources(model).map(function (s) {
        var rs = records.filter(function (r) { return r.sourceClass === s.cls; });
        return Object.assign({}, s, { freshness: countBy(rs, function (r) { return r.freshness; }), dateVerification: rs.filter(function (r) { return r.requiresDateVerification; }).length,
          qualityIssues: rs.filter(function (r) { return r.flags.length; }).length, averageScore: avg(rs.map(function (r) { return r.score; })) });
      });
    }

    /* ───────── providers ───────── */
    function providers() {
      if (!manifest) return { available: false, rows: [], reason: "Provider manifest not loaded (server/livon/data/manifest.mjs)" };
      var M = manifest.PROVIDER_MANIFEST;
      var rows = Object.keys(M).map(function (id) {
        var m = M[id];
        var count = model ? model.repo.all({ includeExpired: true, includeUnsourced: true, includeDuplicates: true }).filter(function (e) { return e.meta && e.meta.upstreamProvider === id; }).length : 0;
        return { id: id, dataType: m.entity, status: count ? "LIVE" : STATUS.NOT_CONFIGURED, keyRequired: true, keyEnv: m.env, lastFetch: null, lastSuccess: null, lastFailure: null,
          recordCount: count, errorType: count ? null : "KEY_REQUIRED", readiness: (manifest.READINESS && manifest.READINESS[id]) || [], liveVerified: !!m.liveVerified };
      });
      return { available: true, rows: rows, note: "Key status is only known on the server. This local session has no server, so every provider is NOT CONFIGURED and live records are 0." };
    }
    function providerDetail(id) {
      if (!manifest || !manifest.PROVIDER_MANIFEST[id]) return null;
      var m = manifest.PROVIDER_MANIFEST[id], row = providers().rows.filter(function (r) { return r.id === id; })[0];
      return { id: id, sourceOrganization: m.sourceOrganization, officialSource: m.officialSource, dataType: m.entity, sourceKind: m.sourceKind, envVar: m.env, keyRequired: true,
        approvalRequired: PROVIDER_APPROVAL[id] || "see docs/livon/real-data-providers.md", normalizer: PROVIDER_NORMALIZER[id] || null, mode: m.mode, capabilities: m.capabilities,
        cachePolicy: m.cache, freshnessPolicy: m.freshness + (FRESHNESS_DAYS[m.entity] ? " · stale after " + FRESHNESS_DAYS[m.entity] + " days (Data Platform)" : ""),
        readiness: row.readiness, liveVerified: row.liveVerified, lastStatus: row.status, recordCount: row.recordCount, errorType: row.errorType };
    }

    /* ───────── reports ───────── */
    var REPORTS = [
      { id: "inventory", title: "Content Inventory", records: true },
      { id: "quality", title: "Quality Report", columns: ["id", "title", "type", "score", "grade", "flags"] },
      { id: "review", title: "Review Queue", columns: ["priority", "rule", "recordId", "title", "note", "state"] },
      { id: "gaps", title: "Content Gaps", columns: ["kind", "area", "id", "detail"] },
      { id: "sources", title: "Source Report", columns: ["cls", "label", "count", "official", "missingSource", "dateVerification", "qualityIssues", "averageScore"] },
      { id: "dates", title: "Date Verification", columns: ["id", "type", "kind", "title", "source", "officialUrl", "reason"] },
      { id: "duplicates", title: "Duplicate Candidates", columns: ["group", "basis", "value", "reasonCode", "id", "title", "type", "age", "category", "url"] },
      { id: "taxonomy", title: "Taxonomy Review", columns: ["a", "b", "basis", "status"] },
      { id: "cta", title: "CTA Review", columns: ["cta", "count", "generic"] },
      { id: "providers", title: "Provider Status", columns: ["id", "dataType", "status", "keyRequired", "keyEnv", "recordCount", "errorType", "liveVerified"] }
    ];
    function report(id, states) {
      var def = REPORTS.filter(function (r) { return r.id === id; })[0]; if (!def) return null;
      if (id === "providers") { var P = providers(); return { def: def, columns: def.columns, rows: P.rows, empty: P.available ? null : P.reason }; }
      need();
      var rows;
      if (id === "inventory") return { def: def, columns: DM.EXPORT_FIELDS, rows: records, records: true };
      if (id === "quality") rows = records.map(function (r) { return { id: r.id, title: r.title, type: r.type, score: r.score, grade: r.grade, flags: r.flags }; });
      else if (id === "review") rows = reviewQueue(states).items;
      else if (id === "gaps") rows = DM.contentGaps(model);
      else if (id === "sources") rows = sources();
      else if (id === "dates") rows = DM.dateReview(model);
      else if (id === "duplicates") rows = [].concat.apply([], DM.duplicateGroups(model).map(function (g, i) { return g.members.map(function (m) { return Object.assign({ group: i + 1, basis: g.basis, value: g.value, reasonCode: g.reasonCode }, m); }); }));
      else if (id === "taxonomy") rows = DM.taxonomy(model).nearDuplicates;
      else if (id === "cta") rows = DM.ctas(model).list.map(function (c) { return { cta: c.cta, count: c.count, generic: c.generic }; });
      return { def: def, columns: def.columns, rows: rows };
    }
    function exportReport(id, format, states) {
      var r = report(id, states); if (!r) return null;
      var meta = { report: r.def.title, generatedAt: new Date(clock()).toISOString() };
      if (r.records) return format === "csv" ? DM.exportCSV(r.rows) : DM.exportJSON(r.rows, meta);
      return DM.exportTable(r.rows, r.columns, format, meta);
    }

    /* ───────── system ───────── */
    function system(info) {
      info = info || {};
      var live = model ? model.repo.all({ includeExpired: true }).filter(function (e) { return e.meta && e.meta.upstreamProvider; }).length : 0;
      var auth = env.NewonAuth && typeof env.NewonAuth.status === "function" ? env.NewonAuth.status() : null;
      return [
        { key: "Environment", value: opts.host && DM && DM.isAllowedHost(opts.host) ? "LOCAL" : STATUS.UNAVAILABLE, detail: opts.host || "" },
        { key: "Anonymous Mode", value: STATUS.ACTIVE, detail: auth ? "NewonAuth status: " + auth : "no sign-in module is loaded; Newon+ is not configured" },
        { key: "Data Platform", value: model ? STATUS.READY : STATUS.ERROR, detail: model ? "repository built once for this session" : modelError },
        { key: "Quality Evaluator", value: model ? STATUS.READY : STATUS.ERROR, detail: "livon/data/livon-content-quality.js (shared with the CLI)" },
        { key: "Curated Records", value: String(records.length), detail: "" },
        { key: "Live External", value: String(live), detail: "records from real-data providers" },
        { key: "Personalization Engine", value: STATUS.LOCAL_RULE_BASED, detail: "onboarding profile (Life Stage · interests · Life Events) stays in the visitor's browser; the admin never reads or collects it" },
        { key: "AI", value: STATUS.NOT_CONNECTED, detail: "no API origin in this local session" },
        { key: "Account", value: STATUS.DEFERRED, detail: "NEWON+ account backend deferred" },
        { key: "Community Backend", value: STATUS.NOT_CONNECTED, detail: "device-local posts only" },
        { key: "Storage", value: STATUS.LOCAL_FIRST, detail: "admin adapter: " + (adapter ? adapter.kind : "none") + (info.persistent === false ? " · memory only (browser storage blocked)" : info.persistent ? " · localStorage" : "") },
        { key: "Provider Manifest", value: manifest ? STATUS.READY : STATUS.UNAVAILABLE, detail: manifest ? Object.keys(manifest.PROVIDER_MANIFEST).length + " providers" : "not loaded" }
      ];
    }

    /* ───────── global search / commands ───────── */
    function searchIndex() {
      return memo("gsearch", function () {
        var out = [];
        records.forEach(function (r) { out.push({ kind: "Content", label: r.title, sub: r.id + " · " + r.type, route: "#record/" + encodeURIComponent(r.id), text: lc(r.id + " " + r.title + " " + (r.category || "") + " " + r.tags.join(" ")) }); });
        if (model) {
          DM.STAGES.forEach(function (s) { var st = model.byId["stage:" + s]; out.push({ kind: "Life Stage", label: (st ? st.title : s + "대"), sub: "stage " + s, route: "#life-stage/" + s, text: lc(s + "대 " + s + "s stage " + (st ? st.title : "")) }); });
          records.filter(function (r) { return r.type === "lifeEvent"; }).forEach(function (r) { out.push({ kind: "Life Event", label: r.title, sub: r.id, route: "#life-events/" + encodeURIComponent(r.id), text: lc(r.title + " " + r.id + " life event") }); });
          uniq(records.map(function (r) { return r.sourceName; })).forEach(function (n) { out.push({ kind: "Source", label: n, sub: "source", route: "#sources", text: lc(n + " source") }); });
          DM.reviewQueue(model).items.filter(function (i) { return i.priority !== "P4"; }).forEach(function (i) { out.push({ kind: "Review Issue", label: i.rule + " · " + (i.title || ""), sub: i.priority, route: i.recordId ? "#record/" + encodeURIComponent(i.recordId) : "#review", text: lc(i.rule + " " + i.priority + " " + (i.title || "") + " " + (i.recordId || "")) }); });
        }
        if (manifest) Object.keys(manifest.PROVIDER_MANIFEST).forEach(function (id) { var m = manifest.PROVIDER_MANIFEST[id]; out.push({ kind: "Provider", label: id, sub: m.sourceOrganization, route: "#provider/" + id, text: lc(id + " " + m.sourceOrganization + " provider " + m.entity) }); });
        return out;
      });
    }
    function globalSearch(q, limit) {
      var words = lc(q).split(/\s+/).filter(Boolean); if (!words.length) return [];
      var order = { "Life Stage": 0, "Life Event": 1, Provider: 2, Source: 3, "Review Issue": 4, Content: 5 };
      var hits = searchIndex().filter(function (e) { return words.every(function (w) { return e.text.indexOf(w) >= 0; }); });
      hits.sort(function (a, b) { var ta = lc(a.label).indexOf(words[0]) === 0 ? 0 : 1, tb = lc(b.label).indexOf(words[0]) === 0 ? 0 : 1; return ta - tb || order[a.kind] - order[b.kind] || a.label.localeCompare(b.label, "ko"); });
      return hits.slice(0, limit || 40);
    }
    function commands() {
      return NAV.map(function (n) { return { id: "go-" + n.id, label: "Go to " + n.label, route: "#" + n.id }; })
        .concat([{ id: "open-data-manager", label: "Open Data Manager", route: "/livon/admin/data/" }, { id: "open-provider-status", label: "Open Provider Status", route: "#providers" }, { id: "open-reports", label: "Open Reports", route: "#reports" }])
        .concat(FUTURE_MODULES.map(function (m) { return { id: "go-" + m.id, label: "Go to " + m.label + " (backend required)", route: "#" + m.id }; }));
    }

    /* ───────── audit ───────── */
    function sanitize(v) {
      if (v == null) return null;
      if (typeof v === "string") return v.slice(0, 300);
      if (Array.isArray(v)) return v.slice(0, 20).map(sanitize);
      if (typeof v === "object") { var o = {}; Object.keys(v).forEach(function (k) { if (!SECRETISH.test(k)) o[k] = sanitize(v[k]); }); return o; }
      return v;
    }
    function audit(action, entity, before, after) {
      var at = new Date(clock()).toISOString();
      return adapter.appendAudit({ id: "ev-" + clock().toString(36) + "-" + (++auditSeq), at: at, action: action, entity: String(entity), actor: "local-operator", before: sanitize(before), after: sanitize(after) });
    }

    /* ───────── drafts (local, never applied to LIVON) ───────── */
    function validate(record, after) {
      var errors = [];
      var check = function (f, ok, msg) { if (f in after && !ok) errors.push({ field: f, message: msg }); };
      var s = function (f) { return String(after[f] == null ? "" : after[f]); };
      var len = function (f) { return [...s(f)].length; };
      check("title", len("title") >= 2 && len("title") <= 30, "title must be 2–30 characters");
      check("summary", len("summary") >= 16 && len("summary") <= 160, "summary must be 16–160 characters");
      check("category", after.category == null || (len("category") >= 1 && len("category") <= 30), "category must be 1–30 characters");
      check("tags", Array.isArray(after.tags) && after.tags.length <= 10 && after.tags.every(function (t) { return typeof t === "string" && t.trim() && [...t].length <= 20; }), "tags: up to 10, each 1–20 characters");
      check("cta", !after.cta || len("cta") <= 12, "CTA must be 12 characters or fewer");
      check("cta", !after.cta || !/신청하기/.test(s("cta")) || !!record.officialUrl, "“신청하기” needs an official application page");
      EDITABLE.forEach(function (f) { if (f in after && /[<>]/.test(JSON.stringify(after[f]))) errors.push({ field: f, message: "HTML is not allowed" }); });
      Object.keys(after).forEach(function (f) { if (EDITABLE.indexOf(f) < 0) errors.push({ field: f, message: "field is not editable" }); });
      return errors;
    }
    function currentValues(r) { return { title: r.title, summary: r.summary, category: r.category, tags: r.tags.slice(), cta: r.cta }; }
    function diff(draft) {
      return EDITABLE.map(function (f) {
        var b = draft.before[f], a = f in draft.after ? draft.after[f] : b;
        return { field: f, before: b == null ? null : b, after: a == null ? null : a, changed: draft.changedFields.indexOf(f) >= 0 };
      });
    }
    function saveDraft(recordId, input) {
      need();
      var r = model.byId[recordId];
      if (!r) return Promise.reject(Object.assign(new Error("RECORD_NOT_FOUND"), { code: "RECORD_NOT_FOUND" }));
      var before = currentValues(r), after = {};
      Object.keys(input || {}).forEach(function (f) {
        var v = input[f];
        if (f === "tags" && typeof v === "string") v = v.split(",").map(function (t) { return t.trim(); }).filter(Boolean);
        if (typeof v === "string") v = v.trim();
        if (v === "" && (f === "cta" || f === "category")) v = null;
        after[f] = v;
      });
      var errors = validate(r, after);
      if (errors.length) return Promise.reject(Object.assign(new Error("VALIDATION_FAILED"), { code: "VALIDATION_FAILED", errors: errors }));
      var changed = EDITABLE.filter(function (f) { return f in after && JSON.stringify(after[f] == null ? null : after[f]) !== JSON.stringify(before[f] == null ? null : before[f]); });
      if (!changed.length) return Promise.reject(Object.assign(new Error("NO_CHANGES"), { code: "NO_CHANGES" }));
      var id = "draft:" + recordId, now = new Date(clock()).toISOString();
      return adapter.getDraft(id).then(function (prev) {
        var afterOnly = {}; changed.forEach(function (f) { afterOnly[f] = after[f]; });
        var beforeOnly = {}; changed.forEach(function (f) { beforeOnly[f] = before[f]; });
        var d = { id: id, recordId: recordId, changedFields: changed, before: before, after: afterOnly, createdAt: prev ? prev.createdAt : now, updatedAt: now, status: "DRAFT", localOnly: true };
        return adapter.putDraft(d).then(function () { return audit(prev ? "draft.update" : "draft.create", recordId, beforeOnly, afterOnly); }).then(function () { return d; });
      });
    }
    var TRANSITIONS = { DRAFT: ["READY_FOR_REVIEW"], READY_FOR_REVIEW: ["APPROVED_LOCAL", "REJECTED_LOCAL", "DRAFT"], APPROVED_LOCAL: ["DRAFT"], REJECTED_LOCAL: ["DRAFT"] };
    function setDraftStatus(id, status) {
      return adapter.getDraft(id).then(function (d) {
        if (!d) throw Object.assign(new Error("DRAFT_NOT_FOUND"), { code: "DRAFT_NOT_FOUND" });
        if ((TRANSITIONS[d.status] || []).indexOf(status) < 0) throw Object.assign(new Error("INVALID_TRANSITION"), { code: "INVALID_TRANSITION" });
        var prev = d.status; d.status = status; d.updatedAt = new Date(clock()).toISOString();
        return adapter.putDraft(d).then(function () { return audit("draft.status", d.recordId, { status: prev }, { status: status }); }).then(function () { return d; });
      });
    }
    function discardDraft(id) {
      return adapter.getDraft(id).then(function (d) { if (!d) return false; return adapter.removeDraft(id).then(function () { return audit("draft.discard", d.recordId, { status: d.status }, null); }).then(function () { return true; }); });
    }
    function setReviewState(key, state) {
      return adapter.getReviewStates().then(function (all) { var prev = all[key] || "OPEN"; return adapter.setReviewState(key, state).then(function () { return audit("review.state", key, { state: prev }, { state: state }); }).then(function () { return state; }); });
    }
    function setModeration(postId, state) {
      var key = "post:" + postId;
      return adapter.getModeration().then(function (all) { var prev = all[key] || null; return adapter.setModeration(key, state || null).then(function () { return audit("moderation.state", key, { state: prev }, { state: state || null }); }).then(function () { return state || null; }); });
    }

    return {
      STATUS: STATUS, NAV: NAV, FUTURE_MODULES: FUTURE_MODULES, REPORTS: REPORTS, EDITABLE: EDITABLE,
      get model() { return model; }, get modelError() { return modelError; }, adapter: adapter,
      operationsStatus: operationsStatus, overview: overview, content: content, inspect: inspect, lifeStages: lifeStages, topicDetail: topicDetail, lifeEvents: lifeEvents,
      today: today, explore: explore, community: community, quality: quality, reviewQueue: reviewQueue, issueKey: issueKey, sources: sources,
      providers: providers, providerDetail: providerDetail, report: report, exportReport: exportReport, system: system, globalSearch: globalSearch, commands: commands,
      validate: validate, diff: diff, saveDraft: saveDraft, setDraftStatus: setDraftStatus, discardDraft: discardDraft, setReviewState: setReviewState, setModeration: setModeration,
      listDrafts: function () { return adapter.listDrafts(); }, listAudit: function (q) { return adapter.listAudit(q); }, reviewStates: function () { return adapter.getReviewStates(); },
      moderationStates: function () { return adapter.getModeration(); }, adapterInfo: function () { return adapter.info(); },
      uiState: function (v) { return adapter.getUiState(v); }, setUiState: function (v, s) { return adapter.setUiState(v, s); },
      /* the Data Manager core, for views that reuse its analyses directly */
      dm: DM
    };
  }

  root.LivonAdminService = { create: create, STATUS: STATUS, NAV: NAV, FUTURE_MODULES: FUTURE_MODULES };
})(typeof window !== "undefined" ? window : globalThis);
