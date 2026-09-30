/*
 * LIVON screen data bridge — every LIVON screen reads its lists through the Data Platform repository.
 *
 *   curated files (today-data, explore-data, life-events, life-topics.json …)
 *        ↓ StaticAdapter (+ PublicDataAdapter rows when the real-data layer has any)
 *   LivonDataPlatform repository  — visibility: published · not expired · sourced · not sample · not draft; no duplicate ids
 *        ↓ LivonScreenData.*()      — returns the ORIGINAL record for every visible entity, in the original order
 *   Today · Explore · Life Stage · Home · Search · My Life   (rendering unchanged → design unchanged)
 *
 * Why the original record: each screen already renders a curated record shape; handing it the same object keeps the
 * design identical while the repository decides WHAT is shown (expired / unsourced / sample / draft rows never reach a
 * list or a detail page).
 *
 * Safety: if the platform is missing or throws, every accessor falls back to the file's own array (the site keeps working
 * exactly as before). The repository is built synchronously from data already in memory and rebuilt once when the Life
 * Stage topics (life-topics.json) finish loading. No network, no storage, no DOM.
 *
 * My Life compatibility: stored ids are never rewritten. entityId() maps a stored save {type,id} to the platform id and
 * legacy() maps back, so existing 저장함 · 일정 · 할 일 · 체크리스트 keep working unchanged.
 */
(function (root) {
  "use strict";
  var repo = null, builtWithTopics = false, lastError = null, builds = 0;

  function P() { return root.LivonDataPlatform || null; }
  function hubData() { var h = root.LivonLifeHub && root.LivonLifeHub.repo; return h && h.status === "ready" ? h.data : null; }

  function build() {
    var platform = P();
    if (!platform || typeof platform.createRepository !== "function") return null;
    var topics = hubData();
    try {
      var adapters = [platform.StaticAdapter({ lifeTopics: topics })];
      /* external rows already loaded by the real-data layer (never fetched here) */
      if (root.LivonData && root.LivonData.repository && typeof root.LivonData.external === "function") {
        var ext = [];
        try { ext = root.LivonData.external(root.LivonData.repository.list()) || []; } catch (e) { ext = []; }
        if (ext.length) adapters.push({ id: "livon-public-data", kind: "public", sourceType: "public_api", status: function () { return {}; },
          loadSync: function () { return ext.map(function (x) { return platform.normalizeRealDataEntity(x, { sourceType: "public_api", provider: x.provider }); }).filter(Boolean); } });
      }
      var r = platform.createRepository({ adapters: adapters });
      r.loadSync();
      repo = r; builtWithTopics = !!topics; builds++; lastError = null;
      return repo;
    } catch (e) { lastError = e; repo = null; return null; }
  }
  function get() {
    if (!repo || (!builtWithTopics && hubData())) build();
    return repo;
  }

  /* original records whose entity is visible, in the file's own order; fallback = the file's array */
  function pass(list, prefix, keyOf) {
    list = Array.isArray(list) ? list : [];
    var r = get();
    if (!r) return list;
    var seen = {};
    return list.filter(function (x) {
      if (!x || x.id == null) return false;
      var id = prefix + keyOf(x);
      if (seen[id]) return false; /* duplicate id in a source file: first one wins */
      seen[id] = 1;
      /* not in the repository = rejected by the schema (no title, broken official link, …): not shown as real */
      return !r.hiddenReason(id);
    });
  }
  function byId(x) { return x.id; }

  var api = {
    version: 1,
    repository: function () { return get(); },
    rebuild: function () { repo = null; return build(); },

    /* ── lists per screen ── */
    todayContents: function () { return pass(root.LivonTodayData && root.LivonTodayData.contents, "td:", byId); },
    exploreItems: function () { return pass(root.LivonExploreData && root.LivonExploreData.items, "ex:", byId); },
    lifeEvents: function () { return pass(root.LivonLifeEvents && root.LivonLifeEvents.events, "le:", byId); },
    communities: function () { return pass(root.LivonCommunityData && root.LivonCommunityData.communities, "cm:", byId); },
    topics: function () { var d = hubData(); return pass(d && d.topics, "topic:", byId); },
    policies: function () { var d = hubData(); return pass(d && d.policies, "pol:", byId); },
    serviceTypes: function () { var d = hubData(); return pass(d && d.serviceTypes, "svc:", byId); },

    /* ── single lookups (detail pages): null when missing or hidden ── */
    visible: function (entityId) { var r = get(); return r ? !r.hiddenReason(entityId) : true; },
    todayById: function (id) { var l = api.todayContents(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; },
    exploreById: function (id) { var l = api.exploreItems(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; },

    /* ── Today: rule-based feed from the repository, as original Today records ── */
    todayFeed: function (opts) {
      var r = get();
      if (!r) return { method: "rule-based", items: [] };
      var f = r.getTodayFeed(opts || {});
      return { method: f.method, season: f.season, items: f.items.map(function (x) { return { record: r.source(x.entity.id), entity: x.entity, score: x.score, reasons: x.reasons }; }).filter(function (x) { return x.record; }) };
    },

    /* ── Life Stage relations (explicit links, visible only) ── */
    topicRelations: function (topicId) {
      var r = get(), out = { contents: [], policies: [], services: [], experts: [], programs: [], places: [], classes: [], lifeEvents: [] };
      if (!r) return out;
      var e = r.getById("topic:" + topicId);
      if (!e) return out;
      var rel = e.relations || {};
      function add(ids, bucket) { (ids || []).forEach(function (id) { var x = r.getById(id); if (x) out[bucket].push(x); }); }
      add(rel.contentIds, "contents"); add(rel.policyIds, "policies"); add(rel.serviceIds, "services"); add(rel.expertIds, "experts");
      add(rel.placeIds, "places"); add(rel.classIds, "classes");
      out.programs = out.classes.filter(function (x) { return x.type === "program"; });
      out.lifeEvents = r.getLifeEvents().filter(function (ev) { return (ev.relations.topicIds || []).indexOf(e.id) >= 0; });
      return out;
    },

    /* ── Search: Life Events are indexed too (type label "Life Event") ── */
    lifeEventSearchEntries: function () {
      return api.lifeEvents().map(function (ev) {
        return { key: "le:" + ev.id, type: "life", typeLabel: "Life Event", title: ev.title, desc: ev.blurb || "", category: (ev.situations || []).join(" "),
          tags: (ev.needs || []).slice(0, 6), meta: (ev.stages || []).map(function (s) { return s === "70" ? "70대+" : s + "대"; }).join("·"),
          href: "#life-events", stageIds: (ev.stages || []).slice(), date: "", related: (ev.checklist || []).join(" "), eventId: ev.id,
          save: { type: "lifeEvent", id: ev.id, title: ev.title, href: "#life-events", stage: (ev.stages || [])[0] || "" } };
      });
    },

    /* ── My Life compatibility: stored {type,id} ⇄ platform entity id (stored data is never rewritten) ── */
    entityId: function (save) {
      if (!save || save.id == null) return null;
      var id = String(save.id), t = String(save.type || "").replace(/^life-/, "");
      /* shared save id used by Life Stage / Today / Explore / Community: "life-hub:{type}:{ref}" */
      var m = /^life-hub:([\w-]+):(.+)$/.exec(id);
      if (m) { t = m[1]; id = m[2]; }
      if (/^cm:/.test(id) && t === "community") return null; /* a community post on this device, not a Data Platform row */
      if (/^(td|ex|le|pol|svc|tool|topic|cm|ch|stage):/.test(id)) return id;
      if (t === "topic" || t === "checklist") return "topic:" + id;
      if (t === "service") { var r0 = get(); return r0 && !r0.getById("svc:" + id, { any: true }) && r0.getById("tool:" + id, { any: true }) ? "tool:" + id : "svc:" + id; }
      if (t === "policy") return "pol:" + id;
      if (t === "lifeEvent" || t === "life-event") return "le:" + id;
      if (t === "today" || t === "td") return "td:" + id;
      return null;
    },
    legacy: function (entityId) {
      var m = /^(\w+):(.+)$/.exec(String(entityId || ""));
      if (!m) return null;
      var type = { td: "content", ex: "content", topic: "topic", svc: "service", pol: "policy", le: "lifeEvent", tool: "tool", cm: "community", ch: "community", stage: "stage" }[m[1]];
      return type ? { type: type, id: m[1] === "td" || m[1] === "ex" ? entityId : m[2] } : null;
    },
    resolveSave: function (save) {
      var r = get(), id = api.entityId(save);
      if (!r || !id) return { entityId: id, known: false, visible: true, local: !id };
      var e = r.getById(id, { any: true });
      return { entityId: id, known: !!e, visible: !!e && !r.hiddenReason(id), reason: r.hiddenReason(id) };
    },

    /* ── data quality (counts only; used by QA and the Explore/Today empty states) ── */
    quality: function () {
      var r = get();
      if (!r) return { available: false, error: lastError ? String(lastError.message || lastError) : "platform missing" };
      var all = r.all({ includeSamples: true, includeUnsourced: true, includeExpired: true });
      var q = { available: true, builds: builds, withTopics: builtWithTopics, total: all.length, visible: 0, sample: 0, expired: 0, unsourced: 0, draft: 0, comingSoon: 0,
        bySourceType: {}, byType: {}, duplicates: 0, sameTitleVariants: 0 };
      var titles = {}, variants = {};
      all.forEach(function (e) {
        var why = r.hiddenReason(e.id);
        if (!why) q.visible++;
        else if (why === "expired") q.expired++;
        else if (why === "unsourced") q.unsourced++;
        else if (why === "sample") q.sample++;
        else if (why === "draft" || why === "review" || why === "archived") q.draft++;
        if (e.meta && e.meta.comingSoon) q.comingSoon++;
        q.bySourceType[e.sourceType] = (q.bySourceType[e.sourceType] || 0) + 1;
        q.byType[e.type] = (q.byType[e.type] || 0) + 1;
        /* a true duplicate repeats type + title + life stages + link; the same title for another life stage is a variant */
        var t = e.type + "|" + String(e.title).replace(/\s+/g, "");
        var k = t + "|" + e.lifeStages.join(",") + "|" + (e.href || "");
        if (titles[k]) q.duplicates++; else titles[k] = 1;
        if (variants[t]) q.sameTitleVariants++; else variants[t] = 1;
      });
      q.adapters = r.report();
      return q;
    }
  };
  root.LivonScreenData = api;
})(typeof window !== "undefined" ? window : globalThis);
