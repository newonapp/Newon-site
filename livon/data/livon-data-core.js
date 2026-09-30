/*
 * LIVON Real Data Layer — core: provider registry, cache, observability, freshness,
 * deduplication, repository, shared-save snapshots and UI integration interfaces.
 *
 *   provider adapter (fetch → normalize → validate)      livon-data-providers.js
 *        ↓ validated entities (livon-data-schema.js)
 *   Repository  (cache · dedupe · freshness · query)     this file
 *        ↓ plain entities, never raw provider payloads
 *   UI hooks    (Explore search, Life Stage, Today, Home, My Life save)
 *
 * Rules: nothing here invents data. With no active provider every query returns [] and the
 * existing screens keep their honest empty states. Providers that need a key never run in the
 * browser; they are "requiresServer" and stay in status "planned" until a server route exists.
 */
(function (root) {
  "use strict";
  var CFG = root.LivonDataConfig || {};
  var S = root.LivonDataSchema;
  var CACHE_CFG = CFG.cache || { namespace: "livon.data.v1", ttlByType: {}, maxEntriesPerProvider: 500, maxStoredChars: 400000 };
  var FRESH_CFG = CFG.freshness || { freshForByType: {}, policyNeedsVerification: true };
  var DEDUPE_CFG = CFG.dedupe || { minExtraSignals: 2 };
  var now = function () { return Date.now(); };

  /* ───────── Cache (swap point: server cache / DB / Redis implement the same 4 methods) ───────── */
  function MemoryCache() {
    var m = {};
    return {
      kind: "memory",
      get: function (k) { var v = m[k]; if (!v) return null; if (v.exp && v.exp < now()) { delete m[k]; return null; } return v.value; },
      set: function (k, value, ttlMs) { m[k] = { value: value, exp: ttlMs ? now() + ttlMs : 0 }; return true; },
      delete: function (k) { delete m[k]; },
      clear: function () { m = {}; }
    };
  }
  function StorageCache(storage, namespace, maxChars) {
    var prefix = (namespace || CACHE_CFG.namespace) + ":";
    function read(k) { try { var raw = storage.getItem(prefix + k); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
    return {
      kind: "storage",
      get: function (k) { var v = read(k); if (!v) return null; if (v.exp && v.exp < now()) { try { storage.removeItem(prefix + k); } catch (e) {} return null; } return v.value; },
      set: function (k, value, ttlMs) {
        try {
          var raw = JSON.stringify({ value: value, exp: ttlMs ? now() + ttlMs : 0 });
          if (raw.length > (maxChars || CACHE_CFG.maxStoredChars)) return false; /* too big for the browser: memory only */
          storage.setItem(prefix + k, raw);
          return true;
        } catch (e) { return false; }
      },
      delete: function (k) { try { storage.removeItem(prefix + k); } catch (e) {} },
      clear: function () {
        try { var ks = []; for (var i = 0; i < storage.length; i++) { var k = storage.key(i); if (k && k.indexOf(prefix) === 0) ks.push(k); } ks.forEach(function (k) { storage.removeItem(k); }); } catch (e) {}
      }
    };
  }
  /* two-level: memory first, storage second (storage failures never break the app) */
  function LayeredCache(a, b) {
    return {
      kind: a.kind + "+" + b.kind,
      get: function (k) { var v = a.get(k); return v != null ? v : b.get(k); },
      set: function (k, v, ttl) { a.set(k, v, ttl); b.set(k, v, ttl); return true; },
      delete: function (k) { a.delete(k); b.delete(k); },
      clear: function () { a.clear(); b.clear(); }
    };
  }

  /* ───────── Observability: counts and codes only — never tokens, URLs with keys or response bodies ───────── */
  var ERROR_CODES = ["NOT_CONFIGURED", "DISABLED", "NETWORK", "TIMEOUT", "HTTP_4XX", "HTTP_5XX", "PARSE", "INVALID_DATA", "UNKNOWN"];
  function Monitor() {
    var st = {};
    function rec(id) { return st[id] || (st[id] = { provider: id, lastSuccessAt: null, lastFailureAt: null, itemCount: 0, rejectedCount: 0, errorCode: null, fromCache: false }); }
    return {
      success: function (id, count, rejected, fromCache) { var r = rec(id); r.lastSuccessAt = now(); r.itemCount = count; r.rejectedCount = rejected || 0; r.errorCode = null; r.fromCache = !!fromCache; },
      failure: function (id, code) { var r = rec(id); r.lastFailureAt = now(); r.errorCode = ERROR_CODES.indexOf(code) >= 0 ? code : "UNKNOWN"; },
      get: function (id) { return id ? Object.assign({}, rec(id)) : Object.keys(st).map(function (k) { return Object.assign({}, st[k]); }); }
    };
  }
  function errorCode(err) {
    var c = err && err.code;
    if (ERROR_CODES.indexOf(c) >= 0) return c;
    if (err && err.name === "AbortError") return "TIMEOUT";
    if (err && typeof err.status === "number") return err.status >= 500 ? "HTTP_5XX" : "HTTP_4XX";
    if (err instanceof SyntaxError) return "PARSE";
    if (err instanceof TypeError) return "NETWORK";
    return "UNKNOWN";
  }

  /* ───────── Provider registry ───────── */
  var STATUSES = ["planned", "configured", "active", "error", "disabled"];
  function Registry() {
    var list = [];
    return {
      register: function (p) {
        if (!p || !p.id || typeof p.fetch !== "function" || typeof p.normalize !== "function") throw new Error("invalid provider");
        var entry = Object.assign({
          name: p.id, entityTypes: [], enabled: false, requiresServer: false, requiresKey: false, status: "planned",
          builtin: false, priority: 50, ttlByType: null, license: null, homepage: null
        }, p);
        entry.status = STATUSES.indexOf(entry.status) >= 0 ? entry.status : "planned";
        list = list.filter(function (x) { return x.id !== entry.id; }).concat([entry]);
        return entry;
      },
      get: function (id) { return list.find(function (x) { return x.id === id; }) || null; },
      list: function () { return list.map(function (p) { return { id: p.id, name: p.name, entityTypes: p.entityTypes.slice(), enabled: !!p.enabled, requiresServer: !!p.requiresServer, requiresKey: !!p.requiresKey, status: p.status, builtin: !!p.builtin }; }); },
      runnable: function () {
        return list.filter(function (p) {
          if (!p.enabled) return false;
          /* on-demand providers (e.g. Kakao Local place search) answer one user query at a time — never bulk-loaded */
          if (p.onDemand) return false;
          if (p.status !== "active" && p.status !== "configured" && p.status !== "error") return false;
          /* keyed / server providers only run where a server route is configured (never with a key in the browser) */
          if ((p.requiresKey || p.requiresServer) && !p.serverConfigured) return false;
          return true;
        });
      },
      setEnabled: function (id, on) { var p = this.get(id); if (p) p.enabled = !!on; return !!p; },
      setStatus: function (id, status) { var p = this.get(id); if (p && STATUSES.indexOf(status) >= 0) p.status = status; }
    };
  }

  /* ───────── Freshness ───────── */
  function freshness(e, at) {
    at = at || now();
    var t = function (iso) { return iso ? Date.parse(iso) : NaN; };
    if (e.type === "event") {
      if (e.eventStatus === "cancelled") return "expired";
      var end = t(e.schedule && (e.schedule.endAt || e.schedule.startAt));
      if (!isNaN(end) && end < at) return "expired";
    }
    if (e.type === "program" && e.registrationEnd && t(e.registrationEnd) < at && !(e.schedule && t(e.schedule.endAt) > at)) return "expired";
    /* a published designation whose official end date has passed is past information (dates only) */
    if (e.type === "expert" && e.designationEnd && t(e.designationEnd) < at) return "expired";
    /* a course whose official end date has passed is over (dates only — never inferred from text) */
    if (e.type === "program" && e.schedule && e.schedule.endAt && t(e.schedule.endAt) < at) return "expired";
    if (e.type === "policy" && e.applicationPeriod && e.applicationPeriod.end && t(e.applicationPeriod.end) < at) return "expired";
    /* only a fetch time, no source update/verification date (Kakao Local): never shown as "최근 확인" */
    if (e.metadata && (e.metadata.freshness === "fetched-only" || e.metadata.freshness === "source-dated") && !e.lastVerifiedAt) return "unknown";
    /* "source-dated" (TourAPI modifiedtime): the provider's own edit date, shown as "출처 업데이트", never as LIVON verification */
    var ref;
    if (e.type === "policy" && FRESH_CFG.policyNeedsVerification) ref = t(e.lastVerifiedAt);
    /* a LIVON fetch time is not a check of the data: only a verification or the source's own update date counts */
    else ref = t(e.lastVerifiedAt || (e.source && e.source.updatedAt));
    if (isNaN(ref)) return "unknown";
    var win = (FRESH_CFG.freshForByType || {})[e.type];
    if (!win) return "unknown";
    return at - ref <= win ? "fresh" : "stale";
  }
  var FRESH_LABEL = { fresh: "최근 확인", stale: "확인 필요", expired: "종료", unknown: "확인 시점 미상" };

  /* official category / 분야 names of an entity ("경영@창업" events carry both) — exact keys, no fuzzy matching */
  function fieldKeys(e) {
    var fs = [e.category].concat(String((e.metadata && e.metadata.fields) || "").split(","));
    return fs.map(normKey).filter(function (k) { return k.length >= 2; });
  }

  /* ───────── Deduplication ───────── */
  function normKey(s) { return String(s || "").toLowerCase().replace(/\(.*?\)|\[.*?\]/g, " ").replace(/[^0-9a-z가-힣]/g, ""); }
  var NO_CROSS_MERGE = { "kr-job-training": 1 };
  function signals(e) {
    return {
      title: normKey(e.title),
      org: normKey(e.organization || e.organizer || e.agency || (e.type === "expert" ? "" : "")),
      place: normKey(e.location && (e.location.roadAddress || e.location.address || [e.location.city, e.location.district].filter(Boolean).join(" "))),
      phone: String((e.contact && e.contact.phone) || "").replace(/\D/g, ""),
      area: normKey(e.serviceArea || ""),
      /* ≈100 m grid: coordinates count only as one supporting signal, never alone */
      geo: e.location && e.location.latitude != null && e.location.longitude != null ? e.location.latitude.toFixed(3) + "," + e.location.longitude.toFixed(3) : "",
      day: e.schedule && e.schedule.startAt ? e.schedule.startAt.slice(0, 10) : "",
      url: normKey((e.officialSource || e.officialUrl || e.source && e.source.sourceUrl || "").replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, ""))
    };
  }
  /*
   * Same provider + providerId → same entity (newer copy wins).
   * Across providers → merge only on high confidence: same type, same normalized title and
   * at least minExtraSignals of {organization, location, start day, official URL}. Events also need
   * the same start day. Anything less stays a separate entity.
   */
  function dedupe(entities, priorityOf) {
    var byId = {}, out = [];
    entities.forEach(function (e) {
      var prev = byId[e.id];
      if (!prev) { byId[e.id] = e; out.push(e); return; }
      var newer = (Date.parse(e.source.updatedAt || e.source.fetchedAt || 0) || 0) >= (Date.parse(prev.source.updatedAt || prev.source.fetchedAt || 0) || 0);
      if (newer) { out[out.indexOf(prev)] = e; byId[e.id] = e; }
    });
    var merged = [];
    out.forEach(function (e) {
      var se = signals(e);
      var twin = !se.title ? null : merged.find(function (m) {
        if (m.type !== e.type || m.provider === e.provider) return false;
        /* no official id is shared with any other dataset (e.g. 평생학습강좌): such courses are never merged across providers */
        if (NO_CROSS_MERGE[m.provider] || NO_CROSS_MERGE[e.provider]) return false;
        var sm = signals(m);
        if (sm.title !== se.title) return false;
        if (e.type === "event" && (!se.day || se.day !== sm.day)) return false;
        /* people: a shared name is never enough — same contact AND same assigned area are required */
        if (e.type === "expert") return !!(se.phone && se.phone === sm.phone && se.area && se.area === sm.area);
        var extra = ["org", "place", "day", "url"].concat(e.type === "place" ? ["phone", "geo"] : []).filter(function (k) { return se[k] && se[k] === sm[k]; }).length;
        return extra >= DEDUPE_CFG.minExtraSignals;
      });
      if (!twin) { merged.push(Object.assign({}, e, { alsoFrom: [] })); return; }
      var keepNew = priorityOf(e.provider) > priorityOf(twin.provider);
      var primary = keepNew ? e : twin, other = keepNew ? twin : e;
      var sources = (twin.alsoFrom || []).concat([{ provider: other.provider, providerId: other.providerId, providerName: other.source.providerName, sourceUrl: other.source.sourceUrl }]);
      merged[merged.indexOf(twin)] = Object.assign({}, primary, { alsoFrom: sources });
    });
    return merged;
  }

  /* ───────── Registration window (events/programs): closed registration is NOT a finished event ───────── */
  function registrationState(e, at) {
    at = at || now();
    var s = e.registrationStart ? Date.parse(e.registrationStart) : NaN, en = e.registrationEnd ? Date.parse(e.registrationEnd) : NaN;
    if (!isNaN(en) && en < at) return "closed";
    if (!isNaN(s) && s > at) return "upcoming";
    if (!isNaN(s) || !isNaN(en)) return "open";
    return "unknown";   /* no parseable dates: the provider's own text is shown, nothing is decided from it */
  }
  var REG_LABEL = { open: "접수 중", closed: "접수 마감", upcoming: "접수 예정" };

  /* ───────── Actions: button text always matches what really happens (external pages only in V1) ───────── */
  function action(e, at) {
    var expired = freshness(e, at) === "expired";
    var official = e.officialSource || e.officialUrl || e.source.sourceUrl || (e.contact && e.contact.website) || null;
    var pick = function (url, label) { return url ? { label: label, url: url, external: true, kind: "external" } : null; };
    var a = null;
    if (!expired) {
      if (e.type === "expert") a = pick(e.externalBookingUrl, "예약 페이지로 이동");
      /* "신청" only with an official registration URL while registration is not closed / not yet open */
      if (e.type === "program" || e.type === "event") { var rs = registrationState(e, at); if (rs === "open" || rs === "unknown") a = pick(e.registrationUrl, "신청 페이지로 이동"); }
      if (e.type === "policy") a = pick(e.applicationUrl, "공식 신청 페이지로 이동");
    }
    /* people: only a real booking/consultation URL becomes a button; the dataset page is attribution, not an action */
    if (!a && e.type === "expert") return null;
    /* 고용24 titleLink is the course page (not an application form): named exactly that */
    if (!a && e.type === "program" && e.metadata && e.metadata.linkKind === "course-detail") return pick(e.source.sourceUrl, "고용24 과정 상세 보기");
    /* a map page is named for what it is ("카카오맵에서 보기"), never "공식 페이지" */
    if (!a && e.type === "place" && !e.officialUrl && e.mapUrl) return pick(e.mapUrl, (e.mapProvider || "지도") + "에서 보기");
    return a || pick(official, e.type === "policy" || e.type === "event" || e.type === "program" ? "공식 안내 보기" : "공식 페이지 보기");
  }
  function attribution(e) {
    var src = e.source || {};
    var names = [src.providerName].concat((e.alsoFrom || []).map(function (x) { return x.providerName; })).filter(Boolean);
    return {
      providers: names,
      /* the provider's own attribution line wins (e.g. "출처: 온통청년(한국고용정보원)") unless sources were merged */
      text: src.attribution && !(e.alsoFrom || []).length ? src.attribution : "출처: " + names.join(" · ") + (src.license ? " (" + src.license + ")" : ""),
      sourceUrl: src.sourceUrl || e.officialSource || null,
      /* verification or the source's own update date only — never LIVON's fetch time */
      lastChecked: e.lastVerifiedAt || src.updatedAt || null,
      attribution: src.attribution || null
    };
  }

  /* ───────── Repository ───────── */
  function createRepository(opts) {
    opts = opts || {};
    var registry = opts.registry || Registry();
    var cache = opts.cache || MemoryCache();
    var monitor = opts.monitor || Monitor();
    var store = [], byId = {}, session = {}, listeners = [], loading = null, loadedAt = 0;

    function priorityOf(id) { var p = registry.get(id); return p ? p.priority : 0; }
    function ttlFor(p, type) {
      var o = p.ttlByType && p.ttlByType[type];
      return o != null ? o : (CACHE_CFG.ttlByType || {})[type] || 0;
    }
    /* a provider response is cached as long as its shortest-lived entity type allows */
    function providerTtl(p) {
      var ts = (p.entityTypes.length ? p.entityTypes : ["public"]).map(function (t) { return ttlFor(p, t); }).filter(function (x) { return x > 0; });
      return ts.length ? Math.min.apply(null, ts) : 0;
    }

    /* fetch → normalize → validate, one provider; failures are isolated and recorded */
    function loadProvider(p, force) {
      var key = "provider:" + p.id;
      var cached = force ? null : cache.get(key);
      if (cached && Array.isArray(cached)) { monitor.success(p.id, cached.length, 0, true); return Promise.resolve(cached); }
      var ctx = { fetchImpl: opts.fetchImpl || (typeof fetch === "function" ? fetch.bind(root) : null), serverEndpoint: CFG.serverEndpoint, now: now() };
      return Promise.resolve().then(function () { return p.fetch(ctx); }).then(function (raw) {
        var rows = p.normalize(raw, ctx) || [];
        var ok = [], rejected = 0;
        rows.slice(0, CACHE_CFG.maxEntriesPerProvider || 500).forEach(function (r) {
          var input = Object.assign({}, r, { provider: p.id });
          if (!input.source || typeof input.source !== "object") input.source = {};
          input.source = Object.assign({ providerName: p.name, fetchedAt: new Date(ctx.now).toISOString(), license: p.license || null }, input.source);
          if (typeof p.mapCategory === "function") input.category = p.mapCategory(r) || input.category;
          if (typeof p.mapLifeStage === "function") input.lifeStages = p.mapLifeStage(r) || input.lifeStages;
          var v = S.validateEntity(input);
          if (v.ok && (typeof p.validate !== "function" || p.validate(v.entity) !== false)) ok.push(v.entity); else rejected++;
        });
        if (rows.length && !ok.length) { var err = new Error("invalid"); err.code = "INVALID_DATA"; throw err; }
        var ttl = providerTtl(p);
        if (ttl > 0) cache.set(key, ok, ttl); /* no TTL configured → never cached */
        monitor.success(p.id, ok.length, rejected, false);
        if (p.status === "error" || p.status === "configured") registry.setStatus(p.id, "active");
        return ok;
      }).catch(function (err) {
        monitor.failure(p.id, errorCode(err));
        if (p.status === "active") registry.setStatus(p.id, "error");
        return [];
      });
    }

    function setStore(list) {
      store = dedupe(list, priorityOf);
      byId = {};
      store.forEach(function (e) { byId[e.id] = e; (e.alsoFrom || []).forEach(function (x) { byId[x.provider + ":" + e.type + ":" + x.providerId] = byId[x.provider + ":" + e.type + ":" + x.providerId] || e; }); });
      loadedAt = now();
      listeners.slice().forEach(function (fn) { try { fn(store.length); } catch (e) {} });
    }

    function refresh(o) {
      o = o || {};
      if (loading && !o.force) return loading;
      var ps = registry.runnable();
      loading = Promise.all(ps.map(function (p) { return loadProvider(p, o.force); })).then(function (all) {
        setStore([].concat.apply([], all));
        loading = null;
        return store.length;
      });
      return loading;
    }

    /* query helpers — all synchronous over the loaded store */
    function words(q) { return String(q || "").toLowerCase().split(/\s+/).map(normKey).filter(Boolean); }
    function hay(e) { return normKey([e.title, e.summary, e.category, (e.tags || []).join(" "), (e.interests || []).join(" "), e.organization, e.organizer, e.agency, e.eventType, e.location && e.location.city, e.location && e.location.region, e.metadata && e.metadata.regionText].join(" ")); }
    function active(list, o) { return (o && o.includeExpired) ? list : list.filter(function (e) { return freshness(e) !== "expired"; }); }
    function limit(list, o) { return o && o.limit ? list.slice(0, o.limit) : list; }

    var api = {
      registry: registry, cache: cache, monitor: monitor,
      refresh: refresh,
      ready: function () { return loadedAt > 0; },
      size: function () { return store.length; },
      onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); },
      getById: function (id) { return byId[id] || session[id] || null; },
      /* on-demand results (place search): this page session only — not in the store, the Explore index or browser storage */
      remember: function (list) { (list || []).forEach(function (e) { if (e && e.id) session[e.id] = e; }); var ks = Object.keys(session); if (ks.length > 300) ks.slice(0, ks.length - 300).forEach(function (k) { delete session[k]; }); },
      sessionList: function (provider) { return Object.keys(session).map(function (k) { return session[k]; }).filter(function (e) { return !provider || e.provider === provider; }); },
      list: function (o) { return limit(active(store.slice(), o), o); },
      listByType: function (type, o) { return limit(active(store.filter(function (e) { return e.type === type; }), o), o); },
      listByLifeStage: function (stageId, o) { return limit(active(store.filter(function (e) { return e.lifeStages.indexOf(String(stageId)) >= 0 && (!o || !o.type || e.type === o.type); }), o), o); },
      listByInterest: function (interests, o) {
        var ks = (interests || []).map(normKey).filter(Boolean);
        return limit(active(store.filter(function (e) { var h = hay(e); return ks.some(function (k) { return h.indexOf(k) >= 0; }) && (!o || !o.type || e.type === o.type); }), o), o);
      },
      /* A topic gets an entity only when it is explicitly linked (topicIds), or when BOTH the life stage
         and the topic's own category words match. Entities without a life stage never attach by guesswork. */
      listByTopic: function (topic, o) {
        if (!topic) return [];
        var ks = String(topic.category || "").split(/[\/·,\s]+/).map(normKey).filter(function (k) { return k.length >= 2; });
        return limit(active(store.filter(function (e) {
          if (o && o.type && e.type !== o.type) return false;
          if (e.topicIds && e.topicIds.indexOf(topic.id) >= 0) return true;
          if (!e.lifeStages.length) {
            /* providers whose data is not age-based (e.g. business support) match by the exact category only */
            var prov = registry.get(e.provider);
            return !!(prov && prov.topicMatch === "category" && fieldKeys(e).some(function (f) { return ks.indexOf(f) >= 0; }));
          }
          if (e.lifeStages.indexOf(String(topic.lifeStageId)) < 0) return false;
          var tagHay = normKey([e.category, (e.tags || []).join(" "), (e.interests || []).join(" ")].join(" "));
          return ks.some(function (k) { return tagHay.indexOf(k) >= 0; });
        }), o), o);
      },
      listNearby: function (lat, lng, km, o) {
        if (typeof lat !== "number" || typeof lng !== "number") return [];
        var R = 6371, rad = Math.PI / 180;
        var d = function (e) { var a = e.location; var dLat = (a.latitude - lat) * rad, dLng = (a.longitude - lng) * rad; var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat * rad) * Math.cos(a.latitude * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2); return 2 * R * Math.asin(Math.sqrt(h)); };
        return limit(active(store.filter(function (e) { return e.location && e.location.latitude != null; }), o).map(function (e) { return { e: e, d: d(e) }; })
          .filter(function (x) { return x.d <= (km || 5); }).sort(function (a, b) { return a.d - b.d; }).map(function (x) { return x.e; }), o);
      },
      listUpcoming: function (o) {
        o = o || {};
        var from = o.from || now(), to = from + (o.days || 30) * 864e5;
        return limit(store.filter(function (e) {
          var s = e.schedule && Date.parse(e.schedule.startAt), en = e.schedule && Date.parse(e.schedule.endAt || e.schedule.startAt);
          return (e.type === "event" || e.type === "program") && !isNaN(s) && en >= from && s <= to && freshness(e, from) !== "expired";
        }).sort(function (a, b) { return a.schedule.startAt.localeCompare(b.schedule.startAt); }), o);
      },
      search: function (q, o) {
        var ws = words(q);
        if (!ws.length) return [];
        return limit(active(store.filter(function (e) {
          if (o && o.type && e.type !== o.type) return false;
          var h = hay(e);
          return ws.every(function (w) { return h.indexOf(w) >= 0; });
        }), o).map(function (e) { return { e: e, s: normKey(e.title).indexOf(ws[0]) === 0 ? 2 : 1 }; }).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.e; }), o);
      },
      _setForTest: setStore
    };
    return api;
  }

  /* ───────── My Life: shared save with a snapshot (survives provider outages) ───────── */
  /* date semantics per provider: official update date ≠ registration date ≠ dataset reference date ≠ LIVON fetch time */
  function provenance(e) {
    var src = e.source || {}, m = e.metadata || {}, p = registry.get(e.provider);
    return {
      provider: e.provider, providerId: e.providerId, providerName: src.providerName || null, sourceKind: (p && p.sourceKind) || "public",
      attribution: attribution(e).text, sourceUrl: src.sourceUrl || null, license: src.license || null,
      sourceUpdatedAt: src.updatedAt || null, sourceRegisteredAt: m.registeredAt || null,
      sourceReferenceDate: m.referenceDate || null, sourceReferenceKind: m.referenceDate ? (m.referenceKind === "modified" ? "modified" : "reference") : null,
      verifiedAt: e.lastVerifiedAt || null, verifiedBy: e.lastVerifiedAt ? (p && p.builtin ? "livon-editorial" : "source") : null, livonFetchedAt: src.fetchedAt || null
    };
  }
  var SAVE_KIND = { policy: "policy", place: "place", program: "class", event: "event", expert: "expert", public: "content" };
  function toSaveItem(e) {
    var a = action(e);
    var att = attribution(e);
    return {
      id: "ext:" + e.id, type: SAVE_KIND[e.type] || "content", title: e.title, label: e.title,
      href: a ? a.url : "#ml-saved", source: att.providers.join(" · "),
      data: {
        kind: SAVE_KIND[e.type] || "content", entityId: e.id, entityType: e.type,
        snapshot: {
          title: e.title, summary: e.summary, category: e.category, provider: e.provider, providerName: e.source.providerName,
          sourceUrl: att.sourceUrl, externalUrl: a ? a.url : null, actionLabel: a ? a.label : null,
          startAt: e.schedule ? e.schedule.startAt : null, endAt: e.schedule ? e.schedule.endAt : null,
          region: e.location ? (e.location.city || e.location.region) : null, lastChecked: att.lastChecked, savedAt: new Date().toISOString(),
          /* where this snapshot came from and what each date means (kept as saved even if the provider changes later) */
          provenance: provenance(e),
          /* policy essentials so a saved policy stays useful even if the provider disappears */
          agency: e.agency || e.organization || e.organizer || null,
          officialSource: e.officialSource || e.officialUrl || null,
          applicationUrl: e.applicationUrl || e.registrationUrl || e.externalBookingUrl || null,
          applicationPeriod: e.applicationPeriod ? { start: e.applicationPeriod.start, end: e.applicationPeriod.end, note: e.applicationPeriod.note } : null,
          updatedAt: (e.source && e.source.updatedAt) || null, verifiedAt: e.lastVerifiedAt || null,
          registeredAt: (e.metadata && e.metadata.registeredAt) || null,
          /* event essentials (기업마당 행사정보 …) */
          organizer: e.organizer || null, eventType: e.eventType || null,
          regionText: (e.location && e.location.region) || (e.metadata && e.metadata.regionText) || null,
          registrationPeriod: e.registrationStart || e.registrationEnd || (e.metadata && e.metadata.registrationNote)
            ? { start: e.registrationStart || null, end: e.registrationEnd || null, note: (e.metadata && e.metadata.registrationNote) || null } : null,
          originUrl: (e.contact && e.contact.website) || null,
          /* place essentials — the PLACE's own coordinates; a user's search position is never part of an entity */
          address: (e.location && e.location.address) || null, roadAddress: (e.location && e.location.roadAddress) || null,
          phone: (e.contact && e.contact.phone) || null,
          latitude: e.location && e.location.latitude != null ? e.location.latitude : null, longitude: e.location && e.location.longitude != null ? e.location.longitude : null,
          mapUrl: e.mapUrl || null, placeType: e.placeType || null,
          detailAddress: (e.location && e.location.detailAddress) || null,
          /* provider record ids (TourAPI contentId / contentTypeId) so a saved place can be reopened at its source */
          providerRef: e.providerId || null, contentTypeId: (e.metadata && e.metadata.contentTypeId) || null,
          homepageUrl: e.homepageUrl || null, attribution: att.text || null,
          /* course essentials (전국평생학습강좌) */
          instructor: e.instructor || null, eligibility: e.eligibility || null, format: e.format || null, venue: e.venue || null,
          days: e.days || null, timeText: e.timeText || null,
          price: e.pricing && e.pricing.amount != null ? e.pricing.amount : null, capacity: e.capacity != null ? e.capacity : null,
          referenceDate: (e.metadata && e.metadata.referenceDate) || null,
          /* 직업훈련 과정 essentials (고용24) — official field names kept; nothing derived */
          trainingCourse: e.provider === "kr-job-training" ? jobSnapshot(e) : null,
          /* public expert essentials — a snapshot as published at save time (contact details may change later) */
          name: e.type === "expert" ? (e.name || e.title) : null, role: e.role || null, assignedRegion: e.serviceArea || null,
          sourceOrganization: e.sourceOrganization || null, sourceDataset: e.sourceDataset || null, trustLevel: e.trustLevel || null,
          consultationContact: e.type === "expert" && e.metadata && e.metadata.phonePurpose === "consultation" && e.contact ? e.contact.phone : null,
          designationPeriod: e.designationStart || e.designationEnd ? { start: e.designationStart || null, end: e.designationEnd || null } : null,
          snapshotNote: e.type === "expert" ? "저장 당시 공개 정보입니다. 연락처 등은 바뀌었을 수 있습니다." : null
        }
      }
    };
  }
  /* saved record → current entity if the provider still has it, otherwise the saved snapshot (marked) */
  function fromSave(saved, repo) {
    var d = saved && saved.data;
    if (!d || !d.entityId) return null;
    var live = repo && repo.getById(d.entityId);
    if (live) return { entity: live, fromSnapshot: false };
    var s = d.snapshot || {};
    return { entity: { id: d.entityId, type: d.entityType, title: s.title || saved.title, summary: s.summary || null, source: { providerName: s.providerName || saved.source || "", sourceUrl: s.sourceUrl || null }, externalUrl: s.externalUrl || null, lastChecked: s.lastChecked || null }, fromSnapshot: true };
  }

  /* ───────── Explore search entries (same shape as LivonSearch index entries) ───────── */
  var SEARCH_TYPE = { expert: "expert", program: "class", place: "place", event: "event", policy: "policy", public: "content" };
  function toSearchEntry(e) {
    var a = action(e);
    return {
      key: "ext:" + e.id, type: SEARCH_TYPE[e.type] || "content", typeLabel: S.TYPE_LABEL[e.type] || "정보",
      official: e.type === "policy", title: e.title, desc: e.summary || (e.type === "expert" && e.metadata && e.metadata.semantics) || "", category: e.category || "", tags: e.tags || [],
      meta: e.type === "expert" ? [e.role, e.serviceArea, e.sourceOrganization ? "공개: " + e.sourceOrganization : ""].filter(Boolean).join(" · ")
        : [e.organizer ? "기관: " + e.organizer : "", e.source.providerName || "", e.location && (e.location.city || e.location.region) || ""].filter(Boolean).join(" · "),
      href: a ? a.url : (e.source.sourceUrl || ""), external: true, img: e.media && e.media.thumbnail || "",
      stageIds: e.lifeStages || [], region: (e.location && (e.type === "expert" ? e.location.region || e.location.city : e.location.city || e.location.region)) || (e.metadata && e.metadata.regionText) || "", date: e.source.updatedAt || e.source.fetchedAt || "",
      related: [e.description, e.organization, e.organizer, e.agency, e.eventType, e.metadata && e.metadata.fields, e.metadata && e.metadata.regionText].filter(Boolean).join(" "),
      realData: true, freshness: freshness(e), save: null, entityId: e.id,
      mode: (e.metadata && e.metadata.methodMode) || "", actionLabel: e.type === "expert" && !a ? "데이터 출처 보기" : a ? a.label : "", attribution: attribution(e).text,
      facts: e.type === "program" ? programFacts(e).map(function (r) { return r[0] + " " + r[1]; }) : e.type === "expert" ? expertFacts(e).map(function (r) { return r[0] + " " + r[1]; }) : null,
      trustLabel: e.type === "expert" ? (TRUST_LABEL[e.trustLevel] || "") : "",
      tel: e.type === "expert" && e.metadata && e.metadata.phonePurpose === "consultation" && e.contact && e.contact.phone ? e.contact.phone : "",
      refTitle: e.type === "expert" ? [e.title, e.role, e.serviceArea, e.sourceOrganization ? "공개: " + e.sourceOrganization : ""].filter(Boolean).join(" · ") : "",
      status: e.type === "program" ? (REG_LABEL[registrationState(e)] || "") : "",
      todo: e.type === "program" ? { deadline: !!(e.registrationEnd && registrationState(e) !== "closed"), start: !!(e.schedule && e.schedule.startAt && Date.parse(e.schedule.startAt) > now()) } : null
    };
  }

  /* ───────── UI rendering helper (escaped; used only when real entities exist) ───────── */
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  /* dates are stored in UTC ISO; LIVON shows them in Korea time */
  function day(iso) { var t = iso ? Date.parse(iso) : NaN; return isNaN(t) ? "" : new Date(t + 9 * 3600e3).toISOString().slice(0, 10).replace(/-/g, "."); }
  function isSaved(e) {
    var P = root.LivonPlatform;
    return !!(P && P.listSaves && P.listSaves("all").some(function (x) { return x.id === "ext:" + e.id; }));
  }
  /* say exactly what the date means: verified by a person, updated by the source, or only collected */
  function dateLabel(e) {
    var src = e.source || {};
    if (e.lastVerifiedAt) return "확인 " + day(e.lastVerifiedAt);
    if (src.updatedAt) return "출처 업데이트 " + day(src.updatedAt);
    if (e.metadata && e.metadata.registeredAt) return (e.type === "event" ? "등록 " : "공고 등록 ") + day(e.metadata.registeredAt);
    if (e.metadata && e.metadata.referenceDate) return (e.metadata.referenceKind === "modified" ? "데이터 수정일 " : "데이터 기준일 ") + String(e.metadata.referenceDate).replace(/-/g, ".");
    if (src.fetchedAt) return "LIVON 수집 " + day(src.fetchedAt);
    return "";
  }
  /* markup follows the existing card styles of the screen it is placed in (no new design) */
  var THEME = {
    life: { wrap: "lv-life-services is-trio", card: "lv-life-svc", kicker: "lv-life-svc__n", note: "lv-life-note", acts: "lv-life-svc__acts", go: "lv-life-btn lv-life-btn--dark lv-life-btn--sm", save: "lv-life-btn lv-life-btn--outline lv-life-btn--sm", body: "" },
    today: { wrap: "lv-td-grid td-grid", card: "lv-td-card td-card td-card--text", kicker: "lv-td-card__meta", note: "lv-td-note", acts: "lv-td-actions", go: "lv-td-btn lv-td-btn--sm", save: "lv-td-btn lv-td-btn--ghost lv-td-btn--sm", body: "lv-td-card__body" }
  };
  /* event facts exactly as the source gives them: 행사유형 · 접수 기간 (or the original 접수 text) */
  function eventLine(e, T) {
    var rs = registrationState(e), note = e.metadata && e.metadata.registrationNote;
    var reg = e.registrationStart || e.registrationEnd
      ? "접수 " + [day(e.registrationStart), day(e.registrationEnd)].filter(Boolean).join(" – ") + (REG_LABEL[rs] ? " (" + REG_LABEL[rs] + ")" : "")
      : (note ? "접수: " + note : "");
    var bits = [e.eventType, reg].filter(Boolean);
    return bits.length ? '<p class="' + T.note + ' lv-data-event">' + esc(bits.join(" · ")) + "</p>" : "";
  }
  /* 350m / 1.2km — Kakao's own distance value only */
  function distance(m) { return typeof m === "number" && isFinite(m) && m >= 0 ? (m < 1000 ? Math.round(m) + "m" : (Math.round(m / 100) / 10) + "km") : ""; }
  /* place facts exactly as the source gives them: 카테고리 · 도로명(없으면 지번) 주소 · 전화 · 거리 */
  function placeLine(e, T) {
    var loc = e.location || {};
    var bits = [e.placeType, loc.roadAddress || [loc.address, loc.detailAddress].filter(Boolean).join(" "), e.contact && e.contact.phone, e.distanceMeters != null ? "거리 " + distance(e.distanceMeters) : ""].filter(Boolean);
    return bits.length ? '<p class="' + T.note + ' lv-data-place">' + esc(bits.join(" · ")) + "</p>" : "";
  }
  /* course facts exactly as the source gives them; rows without a value are skipped */
  function programFacts(e) {
    var rs = registrationState(e), loc = e.location || {};
    var period = e.schedule && e.schedule.startAt ? day(e.schedule.startAt) + (e.schedule.endAt && day(e.schedule.endAt) !== day(e.schedule.startAt) ? " – " + day(e.schedule.endAt) : "") : "";
    var reg = e.registrationStart || e.registrationEnd ? [day(e.registrationStart), day(e.registrationEnd)].filter(Boolean).join(" – ") + (REG_LABEL[rs] ? " (" + REG_LABEL[rs] + ")" : "") : "";
    return [
      ["운영기관", e.organizer], ["강사", e.instructor], ["교육 대상", e.eligibility], ["교육 방법", e.format],
      ["교육 기간", period], ["요일·시간", [e.days, e.timeText].filter(Boolean).join(" ")], ["교육 장소", e.venue], ["주소", loc.address],
      ["수강료", e.pricing && e.pricing.amount != null ? e.pricing.amount.toLocaleString("ko-KR") + "원" : (e.metadata && e.metadata.costNote) || ""],
      ["정원", e.capacity != null ? e.capacity + "명" : ""], ["접수 기간", reg], ["접수 방법", e.applyMethod], ["선정 방법", e.selectionMethod],
      ["문의", e.contact && e.contact.phone]
    ].filter(function (r) { return r[1]; });
  }
  /* 직업훈련 (고용24): official fields with their official names; money exactly as given ("0" → 0원, never 무료) */
  function won(v) { return typeof v === "number" && isFinite(v) ? v.toLocaleString("ko-KR") + "원" : ""; }
  function jobStatusLabel(e) { var J = root.LivonData && root.LivonData.jobs; return J && J.status ? J.status(e) : ""; }
  function jobFacts(e) {
    var m = e.metadata || {}, loc = e.location || {};
    var period = e.schedule && e.schedule.startAt ? day(e.schedule.startAt) + (e.schedule.endAt && day(e.schedule.endAt) !== day(e.schedule.startAt) ? " – " + day(e.schedule.endAt) : "") : "";
    var st = jobStatusLabel(e);
    return [
      ["훈련기관", e.organizer || m.institution], ["훈련기간", period], ["훈련 상태", st ? st + " (훈련 시작·종료일 기준)" : ""],
      ["총 훈련시간", m.totalHours !== "" && m.totalHours != null ? m.totalHours + "시간" : ""], ["총 훈련일수", m.totalDays !== "" && m.totalDays != null ? m.totalDays + "일" : ""],
      ["주말/주중", m.weekend], ["훈련구분", e.format], ["훈련대상", m.trainTarget], ["주소", loc.address],
      ["정원", e.capacity != null ? e.capacity + "명" : ""], ["NCS", m.ncsName || ""], ["자격증", m.certificate],
      ["수강비", won(m.courseFee)], ["실제 훈련비", won(m.detailRealFee !== "" && m.detailRealFee != null ? m.detailRealFee : m.realFee)],
      ["정부지원금", won(m.govSupport)], ["본인부담액", won(m.selfPay)], ["문의", e.contact && e.contact.phone]
    ].filter(function (r) { return r[1]; });
  }
  function jobSnapshot(e) {
    var m = e.metadata || {};
    var n = function (v) { return typeof v === "number" && isFinite(v) ? v : null; };
    return { trprId: m.trprId || null, trprDegr: m.trprDegr || null, subTitle: m.subTitle || null, institution: e.organizer || m.institution || null,
      trainTarget: m.trainTarget || null, trainingMethod: e.format || null, weekend: m.weekend || null,
      courseFee: n(m.courseFee), realFee: n(m.detailRealFee) != null ? n(m.detailRealFee) : n(m.realFee), govSupport: n(m.govSupport), selfPay: n(m.selfPay),
      totalHours: n(m.totalHours), totalDays: n(m.totalDays), certificate: m.certificate || null, capacity: e.capacity != null ? e.capacity : null,
      statusBasis: "훈련 시작·종료일", fetchedAt: (e.source && e.source.fetchedAt) || null, sourceUpdatedAt: (e.source && e.source.updatedAt) || null };
  }
  var TRUST_LABEL = { public_designated: "공공기관 공개 정보", registered_professional: "공식 등록 정보", partner_verified: "LIVON 파트너 확인", business_listing: "사업장 정보" };
  /* expert facts exactly as published; no qualification/career/rating/price is ever derived */
  function expertFacts(e) {
    var ref = e.metadata && e.metadata.referenceDate ? String(e.metadata.referenceDate).replace(/-/g, ".") : "";
    return [
      ["역할", e.role], ["담당 지역", e.serviceArea], ["공개 기관", e.sourceOrganization],
      ["지정 기간", e.designationStart || e.designationEnd ? [day(e.designationStart), day(e.designationEnd)].filter(Boolean).join(" – ") : ""],
      ["공개 상담 연락처", e.metadata && e.metadata.phonePurpose === "consultation" && e.contact ? e.contact.phone : ""],
      [e.metadata && e.metadata.referenceKind === "modified" ? "데이터 수정일" : "데이터 기준일", ref],
      ["데이터 출처", e.sourceDataset]
    ].filter(function (r) { return r[1]; });
  }
  function programLine(e, T) {
    var f = programFacts(e);
    return f.length ? '<p class="' + T.note + ' lv-data-program">' + esc(f.map(function (r) { return r[0] + " " + r[1]; }).join(" · ")) + "</p>" : "";
  }
  /* explicit "add to My Life" actions — only for real dates, never automatic */
  function todoButtons(e, T) {
    var b = [];
    if (e.registrationEnd && registrationState(e) !== "closed") b.push('<button type="button" class="' + T.save + '" data-livon-entity-todo="' + esc(e.id) + '" data-kind="deadline">접수 마감일을 할 일에 추가</button>');
    if (e.schedule && e.schedule.startAt && Date.parse(e.schedule.startAt) > now()) b.push('<button type="button" class="' + T.save + '" data-livon-entity-todo="' + esc(e.id) + '" data-kind="start">교육 시작일을 할 일에 추가</button>');
    return b.length ? '<div class="' + T.acts + '">' + b.join("") + "</div>" : "";
  }
  function cardHtml(e, theme) {
    var T = THEME[theme] || THEME.life;
    var a = action(e), att = attribution(e), f = freshness(e);
    var when = e.schedule && e.schedule.startAt ? day(e.schedule.startAt) + (e.schedule.endAt && day(e.schedule.endAt) !== day(e.schedule.startAt) ? " – " + day(e.schedule.endAt) : "") : "";
    var saved = isSaved(e);
    var inner =
      '<p class="' + T.kicker + '">' + esc((S.TYPE_LABEL[e.type] || "정보") + " · " + (e.source.providerName || "")) + "</p>" +
      "<h4>" + esc(e.title) + "</h4>" +
      (e.summary ? "<p>" + esc(e.summary) + "</p>" : "") +
      (e.type === "event" ? eventLine(e, T) : "") +
      (e.type === "place" ? placeLine(e, T) : "") +
      (e.type === "program" ? programLine(e, T) + todoButtons(e, T) : "") +
      (e.type === "expert" ? '<p class="' + T.note + ' lv-data-expert">' + esc(expertFacts(e).map(function (r) { return r[0] + " " + r[1]; }).join(" · ")) + "</p>" : "") +
      '<p class="' + T.note + ' lv-data-meta">' + esc([when, (e.location && (e.location.city || e.location.region)) || (e.metadata && e.metadata.regionText), f === "stale" || f === "expired" ? FRESH_LABEL[f] : "", dateLabel(e)].filter(Boolean).join(" · ")) + "</p>" +
      '<p class="' + T.note + ' lv-data-source">' + esc(att.text) + (att.sourceUrl ? ' · <a href="' + esc(att.sourceUrl) + '" target="_blank" rel="noopener noreferrer">원문 보기<span class="visually-hidden"> (새 창)</span></a>' : "") + "</p>" +
      '<div class="' + T.acts + '">' +
        (a ? '<a class="' + T.go + '" href="' + esc(a.url) + '" target="_blank" rel="noopener noreferrer">' + esc(a.label) + '<span class="visually-hidden"> (새 창)</span></a>' : "") +
        '<button type="button" class="' + T.save + '" data-livon-entity-save="' + esc(e.id) + '" aria-pressed="' + saved + '">' + (saved ? "저장됨" : "저장") + "</button>" +
      "</div>";
    return '<article class="' + T.card + ' lv-data-card" data-livon-entity="' + esc(e.id) + '">' + (T.body ? '<div class="' + T.body + '">' + inner + "</div>" : inner) + "</article>";
  }
  /* "" when there is nothing real to show — callers keep their existing empty states */
  function listHtml(list, note, theme) {
    if (!list || !list.length) return "";
    var T = THEME[theme] || THEME.life;
    return '<div class="lv-data-block">' + (note ? '<p class="' + T.note + '">' + esc(note) + "</p>" : "") +
      '<div class="' + T.wrap + '">' + list.map(function (e) { return cardHtml(e, theme); }).join("") + "</div></div>";
  }

  /* ───────── assemble the shared instance ───────── */
  var registry = Registry();
  var memory = MemoryCache();
  var cache = root.localStorage ? LayeredCache(memory, StorageCache(root.localStorage, CACHE_CFG.namespace, CACHE_CFG.maxStoredChars)) : memory;
  var repo = createRepository({ registry: registry, cache: cache });
  var TYPE_NOTE = {
    policy: "LIVON은 대상 여부를 판단하지 않습니다. 최신 공고와 조건은 공식 출처에서 확인하세요.",
    event: "일정·장소·신청 방법은 주최 측 공식 안내가 우선합니다.",
    program: "모집 기간·정원·비용은 운영 기관 공식 안내를 확인하세요.",
    place: "운영 시간과 이용 조건은 공식 안내를 확인하세요.",
    expert: "LIVON이 검증한 전문가가 아닙니다. 자격·이용 조건은 제공처에서 직접 확인하세요."
  };

  var LivonData = {
    version: 1,
    config: CFG,
    schema: S,
    registry: registry,
    repository: repo,
    freshness: freshness,
    freshnessLabel: function (e) { return FRESH_LABEL[freshness(e)]; },
    action: action,
    registrationState: registrationState,
    attribution: attribution,
    dedupe: function (list) { return dedupe(list, function (id) { var p = registry.get(id); return p ? p.priority : 0; }); },
    status: function () { return { providers: registry.list(), monitor: repo.monitor.get(), size: repo.size() }; },
    /* external (non-builtin) providers only — builtin data is already indexed by the existing screens */
    external: function (list) { return (list || []).filter(function (e) { var p = registry.get(e.provider); return p && !p.builtin; }); },
    searchEntries: function () { return LivonData.external(repo.list()).map(toSearchEntry); },
    forTopic: function (topic, type, limit) { return LivonData.external(repo.listByTopic(topic, { type: type, limit: limit || 6 })); },
    forToday: function (content, type, limit) {
      if (!content) return [];
      var ks = [content.category].concat(content.tags || []);
      var exact = ks.map(normKey).filter(function (k) { return k.length >= 2; });
      /* non-age providers (기업마당 …) appear only when the content's category/tags name one of their official fields */
      return LivonData.external(repo.listByInterest(ks, { type: type }).filter(function (e) {
        var p = registry.get(e.provider);
        return !(p && p.topicMatch === "category") || fieldKeys(e).some(function (f) { return exact.indexOf(f) >= 0; });
      })).slice(0, limit || 4);
    },
    forHome: function (profile) {
      profile = profile || {};
      var interests = profile.interests || [];
      var stage = profile.stage || "";
      /* relevant only: same life stage and/or one of the user's interests — never "any policy" */
      var pick = function (type, n) {
        if (!stage && !interests.length) return [];
        var exact = interests.map(normKey).filter(function (k) { return k.length >= 2; });
        /* non-age providers (기업마당 …): the interest must name one of the official fields exactly (organizer names etc. do not count) */
        var byInterest = (interests.length ? repo.listByInterest(interests, { type: type }) : []).filter(function (e) {
          var p = registry.get(e.provider);
          return !(p && p.topicMatch === "category") || fieldKeys(e).some(function (f) { return exact.indexOf(f) >= 0; });
        });
        var ranked = stage
          ? byInterest.filter(function (e) { return !e.lifeStages.length || e.lifeStages.indexOf(String(stage)) >= 0; })
              .concat(repo.listByLifeStage(stage, { type: type }))
          : byInterest;
        var seen = {};
        return LivonData.external(ranked.filter(function (e) { return seen[e.id] ? false : (seen[e.id] = 1); })).slice(0, n);
      };
      var relevant = {};
      pick("event", 50).forEach(function (e) { relevant[e.id] = 1; });
      var events = LivonData.external(repo.listUpcoming({ days: 30 })).filter(function (e) { return relevant[e.id]; }).slice(0, 3);
      return { events: events, policies: pick("policy", 3), programs: pick("program", 3) };
    },
    toSaveItem: toSaveItem,
    registrationLabel: function (e) { return REG_LABEL[registrationState(e)] || ""; },
    /* user-approved only: a course deadline / start date becomes a My Life to-do (the My Life duplicate check applies) */
    addToMyLife: function (entityId, kind) {
      var e = repo.getById(entityId), ML = root.LivonMyLife && root.LivonMyLife.api;
      if (!e || !ML || typeof ML.saveTodo !== "function") return { status: "unavailable" };
      var dateIso = kind === "deadline" ? e.registrationEnd : kind === "start" ? e.schedule && e.schedule.startAt : null;
      if (!dateIso) return { status: "no-date" };
      var due = new Date(Date.parse(dateIso) + 9 * 3600e3).toISOString().slice(0, 10);
      var a = action(e);
      var job = e.provider === "kr-job-training";
      if (job && kind !== "start") return { status: "no-date" };   /* the API has no 접수 마감일 */
      return ML.saveTodo({ title: (kind === "deadline" ? "[접수 마감] " : job ? "[훈련 시작] " : "[교육 시작] ") + e.title, due: due, priority: "보통", category: "배움",
        note: [e.organizer, attribution(e).text].filter(Boolean).join(" · "), source: "saved", sourceHref: a ? a.url : "", sourceId: "ext:" + e.id });
    },
    fromSave: function (saved) { return fromSave(saved, repo); },
    save: function (entityId) {
      var e = repo.getById(entityId), P = root.LivonPlatform;
      if (!e || !P || !P.saveItem) return false;
      var item = toSaveItem(e);
      if (isSaved(e)) { P.removeSave(item.id); return "removed"; }
      P.saveItem(item); return "saved";
    },
    ui: { card: cardHtml, list: listHtml, note: function (type) { return TYPE_NOTE[type] || ""; }, esc: esc, day: day, distance: distance, jobFacts: jobFacts },
    _internals: { MemoryCache: MemoryCache, StorageCache: StorageCache, LayeredCache: LayeredCache, Registry: Registry, Monitor: Monitor, createRepository: createRepository, dedupe: dedupe, toSearchEntry: toSearchEntry, errorCode: errorCode }
  };

  if (root.document && root.document.addEventListener) {
    root.document.addEventListener("click", function (ev) {
      var b = ev.target && ev.target.closest && ev.target.closest("[data-livon-entity-todo]");
      if (!b) return;
      ev.preventDefault();
      var r = LivonData.addToMyLife(b.getAttribute("data-livon-entity-todo"), b.getAttribute("data-kind"));
      b.textContent = r.status === "ok" ? "할 일에 추가됨" : r.status === "duplicate" ? "이미 할 일에 있어요" : "추가하지 못했어요";
      b.disabled = true;
    });
  }
  /* save buttons on entity cards (delegated, one listener) */
  if (root.document && root.document.addEventListener) {
    root.document.addEventListener("click", function (ev) {
      var b = ev.target && ev.target.closest && ev.target.closest("[data-livon-entity-save]");
      if (!b) return;
      ev.preventDefault();
      var r = LivonData.save(b.getAttribute("data-livon-entity-save"));
      if (r) { b.setAttribute("aria-pressed", String(r === "saved")); b.textContent = r === "saved" ? "저장됨" : "저장"; }
    });
  }
  /* explore search index picks up new real data */
  var lastExternal = 0;
  repo.onChange(function () {
    /* builtin data is already on screen and in the Explore index: only external data triggers work */
    var ext = LivonData.external(repo.list({ includeExpired: true })).length;
    var changed = ext !== lastExternal || ext > 0;
    lastExternal = ext;
    if (!changed) return;
    if (root.LivonSearch && root.LivonSearch.rebuild) root.LivonSearch.rebuild();
    if (!ext || !root.document) return;
    var view = root.document.documentElement && root.document.documentElement.dataset.lvView;
    try {
      if (view === "life" && root.LivonLifeHub && root.LivonLifeHub.open) root.LivonLifeHub.open(root.location.hash);
      else if (view === "today" && root.LivonTodayFeed && root.LivonTodayFeed.render) root.LivonTodayFeed.render();
      /* an open Explore result list (e.g. a class search opened straight from a link) picks up newly loaded entities */
      else if (view === "explore" && root.LivonExplore && root.LivonExplore.refreshResults) root.LivonExplore.refreshResults();
    } catch (e) {}
  });

  /* a provider was switched on by the server status check: re-render the open Life/Today screen once
     (on-demand providers such as Kakao Local add a search link, not entities) */
  if (root.document && root.document.addEventListener) root.document.addEventListener("livon:data-status", function () {
    var view = root.document.documentElement && root.document.documentElement.dataset.lvView;
    try {
      if (view === "life" && root.LivonLifeHub && root.LivonLifeHub.open) root.LivonLifeHub.open(root.location.hash);
      else if (view === "today" && root.LivonTodayFeed && root.LivonTodayFeed.render) root.LivonTodayFeed.render();
    } catch (e) {}
  });

  root.LivonData = LivonData;
})(typeof window !== "undefined" ? window : globalThis);
