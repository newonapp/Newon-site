/*
 * LIVON Data Manager — core (no DOM). Local-only, READ-ONLY inspection of the curated LIVON records.
 *
 * Everything is derived from what the site itself loads: the Data Platform repository (LivonScreenData),
 * the search index (LivonSearch) and the shared quality evaluator (LivonContentQuality — the same code the
 * Node CLI scripts/livon-content-quality.mjs runs). Nothing here writes to a curated file or to the repository;
 * the only thing it stores is the reviewer's own local review marks (localStorage, memory fallback).
 *
 * Used by /livon/admin/data/ (browser) and tests/livon/data-manager.test.mjs (Node vm).
 */
(function (root) {
  "use strict";

  /* ───────── local-only guard ───────── */
  function isAllowedHost(hostname) {
    var h = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
    return h === "localhost" || h === "127.0.0.1" || h === "::1" || /\.localhost$/.test(h) || /\.test$/.test(h);
  }

  /* the LIVON data scripts the local tools load (same files as the site, in the site's order) */
  var DATA_SCRIPTS = ["/livon/life-data.js", "/livon/life-events-data.js", "/livon/explore-data.js", "/livon/community-data.js", "/livon/today-data.js",
    "/livon/data/livon-data-config.js", "/livon/data/livon-data-schema.js", "/livon/data/livon-data-platform.js", "/livon/data/livon-screen-data.js",
    "/livon/life-hub.js", "/livon/explore-search.js", "/livon/data/livon-content-quality.js", "/livon/livon-personalization.js"];
  var SCREENS = ["HOME", "TODAY", "LIFE STAGE", "EXPLORE", "SEARCH", "MY LIFE", "DETAIL", "COMMUNITY"];
  var STAGES = ["10", "20", "30", "40", "50", "60", "70"];
  var GRADES = ["Excellent", "Good", "Needs Review", "Poor"];
  var SOURCE_CLASS_LABEL = { A: "LIVON-written", B: "Government", C: "Public institution", D: "Newon", E: "Other" };
  var TIME_BOUND = { event: 1, program: 1, policy: 1, "class": 1 };
  var GENERIC_CTA = ["정보 보기", "둘러보기", "자세히 보기", "이용하기", "바로가기"];

  /* Review Queue priority — a fixed rule per flag (deterministic). */
  var PRIORITY_RULES = [
    { p: "P0", label: "broken / invalid", flags: ["BROKEN_RELATION", "INVALID_URL", "MISSING_SOURCE", "MISSING_SUMMARY", "ORPHAN"] },
    { p: "P1", label: "unsourced or conflicting factual claim", flags: ["UNSOURCED_SPECIFIC", "FIELD_CONFLICT", "TIME_SENSITIVE_CLAIM"] },
    { p: "P2", label: "date verification", flags: ["DATE_VERIFICATION_REQUIRED", "STALE_REVIEW_REQUIRED"] },
    { p: "P3", label: "missing relation / weak content", flags: ["MISSING_RELATION", "TOO_MANY_RELATIONS", "PLACEHOLDER_SUMMARY", "WEAK_SUMMARY", "DUPLICATE_SUMMARY", "WEAK_SEARCH_METADATA", "TITLE_LENGTH"] },
    { p: "P4", label: "duplicate candidate / taxonomy / CTA cleanup", flags: ["DUPLICATE_CANDIDATE"] }
  ];
  var FLAG_PRIORITY = {};
  PRIORITY_RULES.forEach(function (r) { r.flags.forEach(function (f) { FLAG_PRIORITY[f] = r.p; }); });

  /* Known subject areas checked against the whole catalogue (a term found nowhere outside its own Life Event = gap). */
  var GAP_TERMS = [
    { id: "freelancing", label: "프리랜서 (freelancing)", terms: ["프리랜서", "프리랜스"] },
    { id: "car", label: "차량 구매 (car purchase)", terms: ["차량", "자동차", "중고차"] },
    { id: "abroad", label: "해외생활 (living abroad)", terms: ["해외생활", "해외 생활", "유학", "이민", "워킹홀리데이"] },
    { id: "long-trip", label: "장기여행 (long trips)", terms: ["장기여행", "장기 여행", "한 달 살기"] },
    { id: "dementia", label: "치매 돌봄 (dementia-specific care)", terms: ["치매"] },
    { id: "cooking", label: "요리 (cooking)", terms: ["요리", "쿠킹", "레시피"] }
  ];

  var FORBIDDEN_EXPORT_KEY = /(secret|token|password|api[-_]?key|apikey|credential|authorization|cookie)/i;
  var EXPORT_FIELDS = ["id", "type", "kind", "title", "summary", "description", "category", "ageGroup", "lifeStage", "lifeEvent", "tags", "keywords",
    "sourceName", "sourceType", "sourceClass", "verification", "officialUrl", "sourceUrl", "href", "cta", "startDate", "endDate", "applicationEnd",
    "lastCheckedAt", "updatedAt", "requiresDateVerification", "freshness", "screens", "relationCount", "incoming", "score", "grade", "flags", "priority"];

  function uniq(a) { var s = {}; return a.filter(function (x) { if (x == null || s[x]) return false; s[x] = 1; return true; }); }
  function countBy(list, f) { var m = {}; list.forEach(function (x) { [].concat(f(x)).forEach(function (k) { if (k == null || k === "") return; m[k] = (m[k] || 0) + 1; }); }); return m; }
  function lc(s) { return String(s == null ? "" : s).toLowerCase(); }
  function arr(x) { return Array.isArray(x) ? x : x == null ? [] : [x]; }

  /* ───────── model (built once; filters/sorts run on the in-memory index) ───────── */
  function createModel(env, opts) {
    opts = opts || {};
    var CQ = env.LivonContentQuality, SD = env.LivonScreenData;
    if (!CQ || !SD) throw new Error("LIVON data scripts are not loaded");
    var repo = SD.repository();
    var report = CQ.evaluate(env, { now: opts.now, lite: true });
    var byId = {};
    var records = report.records.map(function (r) {
      var e = repo.getById(r.id, { any: true }) || {};
      var relIds = r.relationIds || {};
      var relCount = Object.keys(relIds).reduce(function (n, k) { return n + relIds[k].length; }, 0);
      var pri = r.flags.map(function (f) { return FLAG_PRIORITY[f]; }).filter(Boolean).sort()[0] || null;
      var x = {
        id: r.id, type: r.type, kind: r.kind, title: r.title, summary: r.summary, description: r.description, category: r.category,
        ageGroup: Array.isArray(r.ageGroup) ? r.ageGroup : [], general: !Array.isArray(r.ageGroup), lifeStage: r.lifeStage || [], lifeEvent: r.lifeEvent || [],
        tags: r.tags || [], keywords: r.keywords || [], sourceName: r.source.name, sourceType: r.source.type, sourceClass: r.source.class,
        verification: r.source.verification, officialUrl: r.urls.official || null, sourceUrl: r.urls.source || null, bookingUrl: r.urls.booking || null, href: r.urls.href || null,
        cta: r.cta, startDate: r.dates.start, endDate: r.dates.end, applicationEnd: r.dates.applicationEnd, applicationStart: e.applicationStart || null, expiresAt: e.expiresAt || null,
        lastCheckedAt: r.dates.lastCheckedAt, updatedAt: r.updatedAt, requiresDateVerification: !!r.dates.requiresDateVerification,
        freshness: r.freshness || "unknown", hiddenReason: r.hiddenReason, visible: r.visible,
        relationIds: relIds, relationCount: relCount, incoming: r.incoming, screens: r.screens, score: r.score, grade: r.grade, flags: r.flags, notes: r.notes || [],
        price: r.price, budget: r.budget, priority: pri
      };
      x._text = lc([x.id, x.title, x.summary, x.description, x.category, x.tags.join(" "), x.keywords.join(" "), x.sourceName].join(" "));
      byId[x.id] = x;
      return x;
    });
    /* incoming relation lists (who points at me) */
    var incomingFrom = {};
    records.forEach(function (r) { Object.keys(r.relationIds).forEach(function (k) { r.relationIds[k].forEach(function (id) { (incomingFrom[id] = incomingFrom[id] || []).push({ from: r.id, kind: k }); }); }); });
    var model = { env: env, repo: repo, report: report, records: records, byId: byId, incomingFrom: incomingFrom, _cache: {} };
    model.gapEvents = records.filter(function (r) { return r.type === "lifeEvent" && r.flags.indexOf("MISSING_RELATION") >= 0; }).map(function (r) { return r.id; });
    return model;
  }
  function memo(model, key, fn) { if (!(key in model._cache)) model._cache[key] = fn(); return model._cache[key]; }

  /* ───────── dashboard ───────── */
  function dashboard(m) {
    return memo(m, "dashboard", function () {
      var R = m.records, rep = m.report;
      var flags = {}; R.forEach(function (r) { r.flags.forEach(function (f) { flags[f] = (flags[f] || 0) + 1; }); });
      var grades = {}; GRADES.forEach(function (g) { grades[g] = R.filter(function (r) { return r.grade === g; }).length; });
      var sources = {}; Object.keys(SOURCE_CLASS_LABEL).forEach(function (c) { sources[SOURCE_CLASS_LABEL[c]] = R.filter(function (r) { return r.sourceClass === c; }).length; });
      var lifeEvents = {};
      R.filter(function (r) { return r.type === "lifeEvent"; }).forEach(function (le) { var key = le.id.slice(3); lifeEvents[le.title] = R.filter(function (r) { return r.type !== "lifeEvent" && r.lifeEvent.indexOf(key) >= 0; }).length; });
      var gaps = m.gapEvents.length;
      return {
        total: R.length,
        types: countBy(R, function (r) { return r.type; }),
        categories: countBy(R, function (r) { return r.category || "(none)"; }),
        ageGroups: countBy(R, function (r) { return r.general ? "general (all ages)" : r.ageGroup.map(function (s) { return s + "s"; }); }),
        lifeStages: STAGES.reduce(function (o, s) { o[s + "대"] = R.filter(function (r) { return r.lifeStage.indexOf(s) >= 0; }).length; return o; }, {}),
        lifeEvents: lifeEvents,
        sources: sources,
        sourceNames: countBy(R, function (r) { return r.sourceName || "(none)"; }),
        quality: { grades: grades, average: rep.totals.averageScore, pass: rep.totals.pass },
        flags: flags,
        dates: {
          dateVerificationRequired: R.filter(function (r) { return r.flags.indexOf("DATE_VERIFICATION_REQUIRED") >= 0; }).length,
          staleReviewRequired: R.filter(function (r) { return r.flags.indexOf("STALE_REVIEW_REQUIRED") >= 0; }).length,
          expired: R.filter(function (r) { return r.hiddenReason === "expired" || r.freshness === "expired"; }).length,
          undatedTimeSensitive: R.filter(function (r) { return TIME_BOUND[r.type] && !(r.startDate || r.endDate || r.applicationStart || r.applicationEnd || r.expiresAt); }).length
        },
        relations: {
          related: R.filter(function (r) { return r.relationCount > 0; }).length,
          missingRelation: R.filter(function (r) { return r.flags.indexOf("MISSING_RELATION") >= 0 && m.gapEvents.indexOf(r.id) < 0; }).length,
          contentGap: gaps,
          orphan: R.filter(function (r) { return r.flags.indexOf("ORPHAN") >= 0; }).length,
          broken: R.filter(function (r) { return r.flags.indexOf("BROKEN_RELATION") >= 0; }).length
        }
      };
    });
  }

  /* ───────── explorer: search · filter · sort · page ───────── */
  var FILTERS = {
    type: function (r, v) { return r.type === v; },
    category: function (r, v) { return (r.category || "(none)") === v; },
    age: function (r, v) { return v === "general" ? r.general : r.ageGroup.indexOf(v) >= 0; },
    lifeStage: function (r, v) { return r.lifeStage.indexOf(v) >= 0; },
    lifeEvent: function (r, v) { return r.lifeEvent.indexOf(v) >= 0 || r.id === "le:" + v; },
    sourceClass: function (r, v) { return r.sourceClass === v; },
    sourceType: function (r, v) { return r.sourceType === v; },
    grade: function (r, v) { return r.grade === v; },
    flag: function (r, v) { return r.flags.indexOf(v) >= 0; },
    priority: function (r, v) { return r.priority === v; },
    dateVerification: function (r, v) { return (v === "yes") === r.requiresDateVerification; },
    hasRelations: function (r, v) { return (v === "yes") === r.relationCount > 0; },
    hasOfficialUrl: function (r, v) { return (v === "yes") === !!r.officialUrl; },
    freshness: function (r, v) { return r.freshness === v; },
    screen: function (r, v) { return r.screens.indexOf(v) >= 0; },
    coverage: function (r, v) {
      if (v === "only-one") return r.screens.length === 1;
      if (v === "none") return r.screens.length === 0;
      if (v === "not-searchable") return r.screens.indexOf("SEARCH") < 0;
      if (v === "no-detail") return r.screens.indexOf("DETAIL") < 0;
      if (v === "no-my-life") return r.screens.indexOf("MY LIFE") < 0;
      return true;
    }
  };
  var SORTS = {
    title: function (a, b) { return String(a.title).localeCompare(String(b.title), "ko"); },
    type: function (a, b) { return a.type.localeCompare(b.type) || a.id.localeCompare(b.id); },
    score: function (a, b) { return a.score - b.score || a.id.localeCompare(b.id); },
    updated: function (a, b) { return String(a.updatedAt || a.lastCheckedAt || "").localeCompare(String(b.updatedAt || b.lastCheckedAt || "")) || a.id.localeCompare(b.id); },
    flags: function (a, b) { return a.flags.length - b.flags.length || a.id.localeCompare(b.id); },
    id: function (a, b) { return a.id.localeCompare(b.id); }
  };
  function filterRecords(m, q) {
    q = q || {};
    var words = lc(q.q).split(/\s+/).filter(Boolean), f = q.filters || {};
    var keys = Object.keys(f).filter(function (k) { return f[k] !== "" && f[k] != null && FILTERS[k]; });
    return m.records.filter(function (r) {
      for (var i = 0; i < words.length; i++) if (r._text.indexOf(words[i]) < 0) return false;
      for (var j = 0; j < keys.length; j++) if (!FILTERS[keys[j]](r, f[keys[j]])) return false;
      return true;
    });
  }
  function query(m, q) {
    q = q || {};
    var list = filterRecords(m, q).slice();
    var cmp = SORTS[q.sort] || SORTS.id;
    list.sort(cmp);
    if (q.dir === "desc") list.reverse();
    var size = q.pageSize || 50, pages = Math.max(1, Math.ceil(list.length / size)), page = Math.min(Math.max(1, q.page || 1), pages);
    return { total: list.length, pages: pages, page: page, items: list.slice((page - 1) * size, page * size), all: list };
  }
  function facets(m) {
    return memo(m, "facets", function () {
      var R = m.records;
      var sorted = function (o) { return Object.keys(o).sort(function (a, b) { return String(a).localeCompare(String(b), "ko"); }); };
      return {
        type: sorted(countBy(R, function (r) { return r.type; })),
        category: sorted(countBy(R, function (r) { return r.category || "(none)"; })),
        age: ["general"].concat(STAGES),
        lifeStage: STAGES,
        lifeEvent: R.filter(function (r) { return r.type === "lifeEvent"; }).map(function (r) { return { value: r.id.slice(3), label: r.title }; }),
        sourceClass: Object.keys(SOURCE_CLASS_LABEL).map(function (k) { return { value: k, label: k + " · " + SOURCE_CLASS_LABEL[k] }; }),
        sourceType: sorted(countBy(R, function (r) { return r.sourceType; })),
        grade: GRADES,
        flag: Object.keys(m.env.LivonContentQuality.FLAGS),
        priority: ["P0", "P1", "P2", "P3", "P4"],
        freshness: sorted(countBy(R, function (r) { return r.freshness; })),
        screen: SCREENS
      };
    });
  }

  /* ───────── record inspector ───────── */
  function inspect(m, id) {
    var r = m.byId[id]; if (!r) return null;
    var rels = Object.keys(r.relationIds).map(function (k) {
      var seen = {};
      return { kind: k, items: r.relationIds[k].map(function (rid) {
        var t = m.byId[rid], status = rid === r.id ? "self" : seen[rid] ? "duplicate" : t ? "ok" : /^tool:/.test(rid) ? "external-tool" : "broken";
        seen[rid] = 1;
        return { id: rid, title: t ? t.title : null, type: t ? t.type : null, status: status };
      }) };
    });
    return { record: r, relations: rels, incoming: (m.incomingFrom[id] || []).map(function (x) { return { id: x.from, kind: x.kind, title: (m.byId[x.from] || {}).title }; }),
      exposure: SCREENS.map(function (s) { return { screen: s, shown: r.screens.indexOf(s) >= 0 }; }),
      queue: reviewQueue(m).items.filter(function (q) { return q.recordId === id; }) };
  }

  /* ───────── duplicates ───────── */
  function duplicateGroups(m) {
    return memo(m, "dups", function () {
      return m.report.duplicates.filter(function (d) { return d.kind !== "summary"; }).map(function (d) {
        return { key: d.kind + ":" + d.key, basis: d.kind === "title" ? "same title" : "same official URL", value: d.key, decision: d.decision,
          reason: d.reason, reasonCode: String(d.reason).split(" ")[0],
          members: d.ids.map(function (id) { var r = m.byId[id] || {}; return { id: id, title: r.title, type: r.type, age: r.general ? "general" : (r.ageGroup || []).join(","), category: r.category, url: r.officialUrl || r.sourceUrl || r.href }; }) };
      });
    });
  }

  /* ───────── taxonomy / CTA ───────── */
  function catParts(c) { return String(c).split(/[\/·,]+/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length >= 2; }); }
  function taxonomy(m) {
    return memo(m, "taxonomy", function () {
      var cats = {};
      m.records.forEach(function (r) { if (!r.category) return; var c = cats[r.category] = cats[r.category] || { name: r.category, count: 0, types: {}, screens: {} };
        c.count++; c.types[r.type] = 1; r.screens.forEach(function (s) { c.screens[s] = 1; }); });
      var names = Object.keys(cats);
      /* near-duplicate: one label contains the other, or they share a part ("대학/입시" · "대학/교육", "건강" · "건강관리") */
      var pairs = [];
      names.forEach(function (a, i) { names.slice(i + 1).forEach(function (b) {
        var pa = catParts(a), pb = catParts(b);
        var shared = pa.filter(function (x) { return pb.indexOf(x) >= 0; });
        /* "건강" · "건강관리": the longer label is the shorter one plus a short suffix (≤ 2 characters, no space) */
        var lo = a.length <= b.length ? a : b, hi = lo === a ? b : a;
        var contains = lo.length >= 2 && hi.indexOf(lo) === 0 && hi.length - lo.length <= 2 && !/\s/.test(hi);
        if (contains || shared.length) pairs.push({ a: a, b: b, basis: contains ? "same label + short suffix" : "shared part “" + shared[0] + "”", status: "TAXONOMY REVIEW" });
      }); });
      var list = names.map(function (n) { var c = cats[n]; return { name: n, count: c.count, types: Object.keys(c.types), screens: Object.keys(c.screens),
        related: pairs.filter(function (p) { return p.a === n || p.b === n; }).map(function (p) { return p.a === n ? p.b : p.a; }) }; })
        .sort(function (x, y) { return y.count - x.count || x.name.localeCompare(y.name, "ko"); });
      return { categories: list, nearDuplicates: pairs, domains: countBy(m.records, function (r) { return r.keywords; }) };
    });
  }
  function ctas(m) {
    return memo(m, "cta", function () {
      var counts = countBy(m.records, function (r) { return r.cta || "(screen default)"; });
      var list = Object.keys(counts).map(function (k) { return { cta: k, count: counts[k], generic: GENERIC_CTA.indexOf(k) >= 0, records: m.records.filter(function (r) { return (r.cta || "(screen default)") === k; }).map(function (r) { return r.id; }) }; })
        .sort(function (a, b) { return b.count - a.count; });
      return { list: list, generic: list.filter(function (x) { return x.generic; }), applyWithoutOfficialPage: m.report.cta.applyWithoutOfficialPage };
    });
  }

  /* ───────── review queue ───────── */
  function reviewQueue(m) {
    return memo(m, "queue", function () {
      var items = [];
      m.records.forEach(function (r) {
        r.flags.forEach(function (f) {
          var p = FLAG_PRIORITY[f]; if (!p) return;
          var gap = f === "MISSING_RELATION" && m.gapEvents.indexOf(r.id) >= 0;
          items.push({ priority: p, rule: gap ? "CONTENT_GAP" : f, recordId: r.id, title: r.title, type: r.type, note: gap ? "no matching guide exists yet — not an error" : /UNSOURCED_SPECIFIC|FIELD_CONFLICT|BROKEN_RELATION/.test(f) ? (r.notes || []).join("; ") : "" });
        });
      });
      taxonomy(m).nearDuplicates.forEach(function (p) { items.push({ priority: "P4", rule: "TAXONOMY_REVIEW", recordId: null, title: p.a + " ↔ " + p.b, type: "category", note: p.basis }); });
      ctas(m).generic.forEach(function (c) { c.records.forEach(function (id) { items.push({ priority: "P4", rule: "CTA_REVIEW", recordId: id, title: (m.byId[id] || {}).title, type: (m.byId[id] || {}).type, note: "generic CTA “" + c.cta + "”" }); }); });
      var order = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
      items.sort(function (a, b) { return order[a.priority] - order[b.priority] || String(a.rule).localeCompare(String(b.rule)) || String(a.recordId || a.title).localeCompare(String(b.recordId || b.title)); });
      var counts = { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 };
      items.forEach(function (i) { counts[i.priority]++; });
      var byRule = countBy(items, function (i) { return i.priority + " " + i.rule; });
      return { rules: PRIORITY_RULES, items: items, counts: counts, byRule: byRule };
    });
  }

  /* ───────── relations ───────── */
  function relationExplorer(m) {
    return memo(m, "relations", function () {
      var issues = [];
      m.records.forEach(function (r) { Object.keys(r.relationIds).forEach(function (k) { var seen = {}; r.relationIds[k].forEach(function (id) {
        if (id === r.id) issues.push({ id: r.id, kind: k, target: id, status: "self" });
        else if (seen[id]) issues.push({ id: r.id, kind: k, target: id, status: "duplicate" });
        else if (!m.byId[id] && !/^tool:/.test(id)) issues.push({ id: r.id, kind: k, target: id, status: "broken" });
        seen[id] = 1; }); }); });
      var events = m.records.filter(function (r) { return r.type === "lifeEvent"; }).map(function (le) {
        var topics = (le.relationIds.topicIds || []).map(function (id) { var t = m.byId[id]; return { id: id, title: t && t.title, stages: t ? t.lifeStage : [] }; });
        var gap = m.gapEvents.indexOf(le.id) >= 0;
        return { id: le.id, title: le.title, stages: le.lifeStage, topics: topics, status: gap ? "CONTENT GAP" : topics.length ? "linked" : "missing" };
      });
      var kinds = { policy: "policyIds", program: "classIds", service: "serviceIds", place: "placeIds", guide: "contentIds", topic: "topicIds" };
      var topics = m.records.filter(function (r) { return /^topic:/.test(r.id); }).map(function (t) {
        var o = { id: t.id, title: t.title, stage: t.lifeStage[0] };
        Object.keys(kinds).forEach(function (k) { o[k] = (t.relationIds[kinds[k]] || []).length; });
        return o;
      });
      var matrix = STAGES.map(function (s) { var ts = topics.filter(function (t) { return t.stage === s; }); var row = { stage: s, topics: ts.length };
        Object.keys(kinds).forEach(function (k) { row[k] = ts.filter(function (t) { return t[k] > 0; }).length; }); return row; });
      return { issues: issues, events: events, topics: topics, matrix: matrix, missing: m.records.filter(function (r) { return r.flags.indexOf("MISSING_RELATION") >= 0; }).map(function (r) { return { id: r.id, title: r.title, gap: m.gapEvents.indexOf(r.id) >= 0 }; }) };
    });
  }

  /* ───────── content gaps (reported, never filled automatically) ───────── */
  function contentGaps(m) {
    return memo(m, "gaps", function () {
      var R = m.records, gaps = [];
      relationExplorer(m).events.filter(function (e) { return e.status === "CONTENT GAP"; }).forEach(function (e) {
        gaps.push({ kind: "Life Event without a guide", area: e.title, id: e.id, detail: "stages " + e.stages.join("·") + " — no Life Stage topic covers it" }); });
      GAP_TERMS.forEach(function (g) {
        var hits = R.filter(function (r) { if (r.type === "lifeEvent") return false; var t = [r.title, r.summary, r.tags.join(" "), r.category].join(" "); return g.terms.some(function (w) { return t.indexOf(w) >= 0; }); });
        if (!hits.length) gaps.push({ kind: "subject with no content", area: g.label, id: g.id, detail: "no record mentions " + g.terms.join(" / ") });
      });
      var domains = Object.keys(countBy(R, function (r) { return r.keywords; })).sort();
      STAGES.forEach(function (s) { domains.forEach(function (d) {
        var n = R.filter(function (r) { return /^topic:/.test(r.id) && r.lifeStage.indexOf(s) >= 0 && r.keywords.indexOf(d) >= 0; }).length;
        if (!n) gaps.push({ kind: "Life Stage × domain with no topic", area: s + "대 × " + d, id: s + ":" + d, detail: "0 topics" });
      }); });
      var env = m.env;
      ((env.LivonExploreData || {}).categories || []).forEach(function (c) {
        var n = ((env.LivonScreenData && env.LivonScreenData.exploreItems()) || []).filter(function (x) { return (x.categoryIds || []).indexOf(c.id) >= 0; }).length;
        if (!n) gaps.push({ kind: "Explore category with no item", area: c.label || c.id, id: "ex-cat:" + c.id, detail: "0 items" });
      });
      return gaps;
    });
  }

  /* ───────── sources ───────── */
  function sources(m) {
    return memo(m, "sources", function () {
      return Object.keys(SOURCE_CLASS_LABEL).map(function (c) {
        var rs = m.records.filter(function (r) { return r.sourceClass === c; });
        var names = {};
        rs.forEach(function (r) { var k = r.sourceName || "(none)"; var n = names[k] = names[k] || { name: k, count: 0, official: 0, urls: {} }; n.count++; if (r.officialUrl) { n.official++; n.urls[r.officialUrl] = 1; } else if (r.sourceUrl) n.urls[r.sourceUrl] = 1; });
        return { cls: c, label: SOURCE_CLASS_LABEL[c], count: rs.length, official: rs.filter(function (r) { return !!r.officialUrl; }).length,
          missingSource: rs.filter(function (r) { return r.flags.indexOf("MISSING_SOURCE") >= 0; }).length,
          names: Object.keys(names).map(function (k) { var n = names[k]; return { name: n.name, count: n.count, official: n.official, urls: Object.keys(n.urls) }; }).sort(function (a, b) { return b.count - a.count; }) };
      });
    });
  }
  function unsourced(m) {
    return m.records.filter(function (r) { return r.flags.indexOf("UNSOURCED_SPECIFIC") >= 0 || r.flags.indexOf("FIELD_CONFLICT") >= 0; }).map(function (r) {
      return { id: r.id, title: r.title, claim: "budget / price", field: "budget", value: r.budget, price: r.price, source: r.officialUrl || r.sourceUrl || "(no official link)",
        flags: r.flags.filter(function (f) { return f === "UNSOURCED_SPECIFIC" || f === "FIELD_CONFLICT"; }),
        reason: (r.flags.indexOf("FIELD_CONFLICT") >= 0 ? "CONFLICT — " : "") + (r.notes || []).join("; ") };
    });
  }

  /* ───────── dates / freshness ───────── */
  function dateKind(r) { return r.applicationEnd || r.applicationStart ? "application" : TIME_BOUND[r.type] ? r.type : "other"; }
  var DATE_REASON = { policy: "official portal — application periods differ per announcement; no single date to state",
    program: "program guide without an official session date", "class": "class/learning guide without a session date", event: "event without an official date", other: "time-bound record without a date" };
  function dateReview(m) {
    return m.records.filter(function (r) { return r.flags.indexOf("DATE_VERIFICATION_REQUIRED") >= 0; }).map(function (r) {
      return { id: r.id, type: r.type, kind: dateKind(r), title: r.title, dates: { start: r.startDate, end: r.endDate, applicationStart: r.applicationStart, applicationEnd: r.applicationEnd, expiresAt: r.expiresAt },
        source: r.sourceName, officialUrl: r.officialUrl, reason: DATE_REASON[dateKind(r)] || DATE_REASON.other };
    });
  }
  function freshness(m) {
    return memo(m, "fresh", function () {
      var by = countBy(m.records, function (r) { return r.freshness || "unknown"; });
      ["fresh", "stale", "expired", "unknown"].forEach(function (k) { if (!(k in by)) by[k] = 0; });
      return { counts: by, note: "Freshness windows apply to dated/checked rows (Real Data Integration V1). Editorial guides with no check date are \"unknown\" by design." };
    });
  }

  /* ───────── testers ───────── */
  function searchTest(m, q, f) { var S = m.env.LivonSearch; return S && S.explain ? S.explain(q, f || {}) : { query: q, tokens: [], total: 0, items: [] }; }
  function runSearchSet(m) {
    return memo(m, "searchSet", function () {
      var rep = m.env.LivonContentQuality.evaluate(m.env, { now: m.report.generatedAt ? Date.parse(m.report.generatedAt) : undefined });
      return rep.search.map(function (s) { return { q: s.q, total: s.total, relevantTop5: s.relevantTop5, top3: s.top3, status: !s.total ? "ZERO RESULT" : s.relevantTop5 < 2 ? "WEAK" : "PASS" }; });
    });
  }
  function stageFromAge(age) { var n = parseInt(age, 10); if (!(n > 0)) return ""; return String(Math.min(70, Math.max(10, Math.floor(n / 10) * 10))); }
  function recommend(m, input) {
    input = input || {};
    var stage = input.lifeStage || stageFromAge(input.age);
    var ctx = { lifeStage: stage || undefined, lifeEvent: input.lifeEvent || undefined, interests: arr(input.interests).filter(Boolean), limit: input.limit || 10 };
    var r = m.repo.getRecommendations(ctx);
    return { context: ctx, method: r.method, items: r.items.map(function (x, i) { return { rank: i + 1, id: x.entity.id, title: x.entity.title, type: x.entity.type, score: x.score, reasons: x.reasons || [] }; }) };
  }

  /* Onboarding profile simulation: the same rule the public onboarding uses, run on a profile typed into the tool.
     It never reads a visitor's stored profile — recommend(profile) is given the scenario explicitly. */
  function simulateOnboarding(m, input) {
    var PZ = root.LivonPersonalization;
    input = input || {};
    var profile = { lifeStage: input.lifeStage || stageFromAge(input.age) || "", interests: arr(input.interests).filter(Boolean), lifeEvents: arr(input.lifeEvents).filter(Boolean) };
    if (!PZ || typeof PZ.recommend !== "function") return { available: false, profile: profile, items: [], gaps: [] };
    var r = PZ.recommend(profile, { limit: input.limit || 20 });
    return { available: true, engine: PZ.ENGINE, method: r.method, profile: PZ.sanitizeProfile(profile), personalized: r.personalized, gaps: r.gaps,
      items: r.items.map(function (x, i) { return { rank: i + 1, id: x.id, title: x.title, type: x.type, kind: x.kind, score: x.score, reasons: x.reasons.map(function (y) { return y.type + ":" + y.value + (y.via ? " (via " + y.via + ")" : ""); }), why: x.why }; }) };
  }

  /* ───────── coverage ───────── */
  function coverage(m) {
    return memo(m, "coverage", function () {
      var totals = {}; SCREENS.forEach(function (s) { totals[s] = m.records.filter(function (r) { return r.screens.indexOf(s) >= 0; }).length; });
      return { screens: SCREENS, totals: totals,
        onlyOne: m.records.filter(function (r) { return r.screens.length === 1; }).length,
        notSearchable: m.records.filter(function (r) { return r.screens.indexOf("SEARCH") < 0; }).length,
        noDetail: m.records.filter(function (r) { return r.screens.indexOf("DETAIL") < 0; }).length,
        noMyLife: m.records.filter(function (r) { return r.screens.indexOf("MY LIFE") < 0; }).length,
        none: m.records.filter(function (r) { return !r.screens.length; }).length };
    });
  }

  /* ───────── export (read-only, whitelisted fields, never a secret) ───────── */
  function exportRow(r) {
    var o = {};
    EXPORT_FIELDS.forEach(function (k) { if (FORBIDDEN_EXPORT_KEY.test(k)) return; var v = r[k]; o[k] = Array.isArray(v) ? v.slice() : v == null ? null : v; });
    return o;
  }
  function exportJSON(records, meta) {
    return JSON.stringify({ tool: "LIVON Data Manager", readOnly: true, generatedAt: (meta && meta.generatedAt) || null, count: records.length, fields: EXPORT_FIELDS, records: records.map(exportRow) }, null, 2);
  }
  function csvCell(v) {
    var s = Array.isArray(v) ? v.join("|") : v == null ? "" : String(v);
    if (/^[=+\-@]/.test(s)) s = "'" + s; /* spreadsheet formula injection */
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function exportCSV(records) {
    var lines = [EXPORT_FIELDS.join(",")];
    records.forEach(function (r) { var o = exportRow(r); lines.push(EXPORT_FIELDS.map(function (k) { return csvCell(o[k]); }).join(",")); });
    return "﻿" + lines.join("\r\n") + "\r\n";
  }

  /* generic table export for reports (same rules: whitelisted columns, no secret-like column, CSV injection-safe) */
  function exportTable(rows, columns, format, meta) {
    var cols = (columns || []).filter(function (c) { return !FORBIDDEN_EXPORT_KEY.test(c); });
    var pick = function (r) { var o = {}; cols.forEach(function (c) { var v = r[c]; o[c] = Array.isArray(v) ? v.slice() : v == null ? null : typeof v === "object" ? JSON.stringify(v) : v; }); return o; };
    if (format === "csv") {
      var lines = [cols.join(",")];
      rows.forEach(function (r) { var o = pick(r); lines.push(cols.map(function (c) { return csvCell(o[c]); }).join(",")); });
      return "\ufeff" + lines.join("\r\n") + "\r\n";
    }
    return JSON.stringify({ tool: "LIVON Admin (local)", readOnly: true, report: (meta && meta.report) || null, generatedAt: (meta && meta.generatedAt) || null, count: rows.length, columns: cols, rows: rows.map(pick) }, null, 2);
  }

  /* ───────── local review state (never touches curated data) ───────── */
  var REVIEW_KEY = "livon.dataManager.review.v1";
  var REVIEW_VALUES = { reviewed: 1, "needs-review": 1, keep: 1, review: 1 };
  function reviewStore(storage) {
    var mem = { records: {}, groups: {} }, persistent = false;
    function load() {
      try { var raw = storage && storage.getItem(REVIEW_KEY); persistent = !!storage; if (!raw) return; var o = JSON.parse(raw);
        if (o && typeof o === "object") { mem.records = o.records && typeof o.records === "object" ? o.records : {}; mem.groups = o.groups && typeof o.groups === "object" ? o.groups : {}; }
      } catch (e) { persistent = false; }
    }
    function save() { if (!persistent) return; try { storage.setItem(REVIEW_KEY, JSON.stringify(mem)); } catch (e) { persistent = false; } }
    load();
    function set(bucket, id, value) {
      if (value == null || value === "") delete mem[bucket][id];
      else if (REVIEW_VALUES[value]) mem[bucket][id] = value;
      else return false;
      save(); return true;
    }
    return {
      get persistent() { return persistent; },
      record: function (id) { return mem.records[id] || null; },
      group: function (key) { return mem.groups[key] || null; },
      setRecord: function (id, v) { return set("records", id, v); },
      setGroup: function (key, v) { return set("groups", key, v); },
      snapshot: function () { return JSON.parse(JSON.stringify(mem)); },
      clear: function () { mem = { records: {}, groups: {} }; save(); }
    };
  }

  root.LivonDataManager = {
    isAllowedHost: isAllowedHost, SCREENS: SCREENS, SOURCE_CLASS_LABEL: SOURCE_CLASS_LABEL, PRIORITY_RULES: PRIORITY_RULES, GAP_TERMS: GAP_TERMS, EXPORT_FIELDS: EXPORT_FIELDS,
    createModel: createModel, dashboard: dashboard, query: query, filterRecords: filterRecords, facets: facets, inspect: inspect,
    duplicateGroups: duplicateGroups, taxonomy: taxonomy, ctas: ctas, reviewQueue: reviewQueue, relationExplorer: relationExplorer,
    contentGaps: contentGaps, sources: sources, unsourced: unsourced, dateReview: dateReview, freshness: freshness,
    searchTest: searchTest, runSearchSet: runSearchSet, recommend: recommend, stageFromAge: stageFromAge, coverage: coverage,
    simulateOnboarding: simulateOnboarding, exportJSON: exportJSON, exportCSV: exportCSV, exportTable: exportTable, reviewStore: reviewStore, DATA_SCRIPTS: DATA_SCRIPTS, GRADES: GRADES, STAGES: STAGES
  };
})(typeof window !== "undefined" ? window : globalThis);
