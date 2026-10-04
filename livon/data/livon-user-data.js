/*
 * LIVON User Data — account & persistence foundation (V1).
 *
 *   UI (My Life · Platform saves · Community · AI · services)
 *        ↓ LivonUserData.read / write            (same keys, same JSON as before — nothing is renamed or deleted)
 *   Repository  (inventory · classification · change tracking · tombstones · export/merge · diagnostics)
 *        ↓
 *   LocalAdapter  (localStorage)       ← always used; LIVON stays local-first and works without an account
 *   RemoteAdapter (contract only)      ← configured:false, fail-closed. No endpoint exists; nothing is uploaded.
 *
 * Rules
 *   - Anonymous mode is the default and the only active mode in V1. There is no login UI, no fake user, no sample profile.
 *   - An account identity can only come from a future auth provider (setAuthProvider) — never from storage, URL or UI input.
 *   - Migration is additive, idempotent and non-destructive: it only writes this module's own meta key.
 *   - Account sync candidates are explicit (ACCOUNT_SYNC). AI conversations, recent activity, caches, locations,
 *     drafts and Community content are never collected for an account automatically.
 *   - Nothing is uploaded automatically. A future first-login import is a user choice (planLoginImport → user approves).
 */
(function (root) {
  "use strict";

  var META_KEY = "livon.userData.meta.v1";
  var SCHEMA_VERSION = 1;
  var INVENTORY_VERSION = 1;
  var MAX_TOMBSTONES = 1000;

  /* ───────── classification ─────────
     ACCOUNT_SYNC        user-owned data a future Newon+ account may hold (only after the user chooses to import)
       sensitive: true   health / money / personal writing — excluded from an import unless the user opts in
     DEVICE_LOCAL        stays on this device (recent activity, AI conversations, UI state, onboarding flags)
     SESSION_ONLY        sessionStorage hand-offs and drafts
     SERVER_SOURCE_CACHE provider responses cached in the browser — not user data
     COMMUNITY_LOCAL     Community V1 content written on this device; a future server Community is a separate boundary
     LEGACY              older keys kept for migration reads only (never written by new code) */
  var CLASSES = ["ACCOUNT_SYNC", "DEVICE_LOCAL", "SESSION_ONLY", "SERVER_SOURCE_CACHE", "COMMUNITY_LOCAL", "LEGACY"];

  /* collection → conflict policy (see mergeCollection) */
  var POLICY = {
    saved_items: "union", save_folders: "set",
    tasks: "record", goals: "record", checklists: "record", habits: "record", projects: "record",
    calendar_items: "calendar",
    journal: "record", transactions: "record", health_records: "record", experiences: "record", budgets: "pref",
    preferences: "pref", life_progress: "pref"
  };
  var COLLECTIONS = Object.keys(POLICY);
  var SENSITIVE_COLLECTIONS = ["journal", "transactions", "health_records", "budgets"];

  /*
   * Inventory of every browser storage key LIVON uses (found by scanning livon/*.js).
   * key: exact key, or prefix ending in "." / ":"; fields: per-field classes for structured stores.
   */
  var INVENTORY = [
    { key: "livon.mlStore.v1", storage: "local", owner: "life-now-page.js (+ service-*.js, life-hub.js, today-feed.js, home-page.js read)", schema: "object · v:2 (additive migrate v1→v2)", pii: "personal notes, health, money, schedule",
      fields: {
        todos: { cls: "ACCOUNT_SYNC", collection: "tasks" }, goals: { cls: "ACCOUNT_SYNC", collection: "goals" }, events: { cls: "ACCOUNT_SYNC", collection: "calendar_items" },
        checklists: { cls: "ACCOUNT_SYNC", collection: "checklists" }, habits: { cls: "ACCOUNT_SYNC", collection: "habits" }, habitLogs: { cls: "ACCOUNT_SYNC", collection: "habits", note: "embedded into each habit record" },
        projects: { cls: "ACCOUNT_SYNC", collection: "projects" }, experiences: { cls: "ACCOUNT_SYNC", collection: "experiences" },
        journal: { cls: "ACCOUNT_SYNC", collection: "journal", sensitive: true }, transactions: { cls: "ACCOUNT_SYNC", collection: "transactions", sensitive: true },
        budgets: { cls: "ACCOUNT_SYNC", collection: "budgets", sensitive: true }, health: { cls: "ACCOUNT_SYNC", collection: "health_records", sensitive: true },
        folders: { cls: "ACCOUNT_SYNC", collection: "preferences", prefId: "ml.folders" }, settings: { cls: "ACCOUNT_SYNC", collection: "preferences", prefId: "ml.settings" },
        savedCommunity: { cls: "LEGACY", note: "moved to platform saves by Community migration v2" }, v: { cls: "DEVICE_LOCAL", note: "store version" }
      } },
    { key: "livon.platform.v1", storage: "local", owner: "livon-platform.js", schema: "object (defaults merged on load)", pii: "display name, region (시/도·시군구·동)",
      fields: {
        saves: { cls: "ACCOUNT_SYNC", collection: "saved_items" }, folders: { cls: "ACCOUNT_SYNC", collection: "save_folders" },
        alertPrefs: { cls: "ACCOUNT_SYNC", collection: "preferences", prefId: "platform.alertPrefs" },
        region: { cls: "ACCOUNT_SYNC", collection: "preferences", prefId: "platform.region", note: "시/도·시군구 only; 동 stays on the device" },
        alerts: { cls: "DEVICE_LOCAL", note: "generated on the device" }, recentSearches: { cls: "DEVICE_LOCAL" }, onboarded: { cls: "DEVICE_LOCAL" }, onboardSkipped: { cls: "DEVICE_LOCAL" },
        family: { cls: "DEVICE_LOCAL", note: "not active (status soon); may describe other people" }, profile: { cls: "DEVICE_LOCAL", note: "a Newon+ account will own the profile" }
      } },
    { key: "livon.cmStore.v1", storage: "local", owner: "community-page.js (LivonCommunityRepo)", schema: "object · v:2", pii: "nickname, posts, comments, reports", cls: "COMMUNITY_LOCAL" },
    { key: "livon.aiStore.v1", storage: "local", owner: "ai-page.js", schema: "{threads, settings}", pii: "full AI conversations, personalization", cls: "DEVICE_LOCAL", note: "AI threads never sync automatically; approved plans already live in My Life" },
    { key: "livon.lifeStage", storage: "local", owner: "life-page.js / platform", schema: "string", pii: "age band", cls: "ACCOUNT_SYNC", collection: "preferences" },
    { key: "livon.lifeInterests", storage: "local", owner: "life-page.js / platform", schema: "string[]", cls: "ACCOUNT_SYNC", collection: "preferences" },
    { key: "livon.lifeSituations", storage: "local", owner: "life-page.js", schema: "string[]", cls: "ACCOUNT_SYNC", collection: "preferences" },
    { key: "livon.lifeGoals", storage: "local", owner: "life-page.js", schema: "string[]", cls: "ACCOUNT_SYNC", collection: "preferences" },
    { key: "livon.lifeEvents", storage: "local", owner: "life-page.js", schema: "string[] (life event ids)", cls: "ACCOUNT_SYNC", collection: "preferences" },
    { key: "livon.mlInterests", storage: "local", owner: "life-now-page.js", schema: "string[]", cls: "ACCOUNT_SYNC", collection: "preferences" },
    { key: "livon.tdPrefs", storage: "local", owner: "today-feed.js", schema: "object", cls: "ACCOUNT_SYNC", collection: "preferences" },
    { key: "livon.tdHidden", storage: "local", owner: "today-page.js", schema: "string[]", cls: "ACCOUNT_SYNC", collection: "preferences" },
    { key: "livon.exPrefRegion", storage: "local", owner: "explore-page.js", schema: "string (시/도)", cls: "ACCOUNT_SYNC", collection: "preferences" },
    { key: "livon.hmRegion", storage: "local", owner: "home-page.js / platform", schema: "string (시/도 시군구)", cls: "ACCOUNT_SYNC", collection: "preferences" },
    { key: "livon.personalization.v1", storage: "local", owner: "livon-personalization.js", schema: "{version, state: NEW|IN_PROGRESS|COMPLETED|SKIPPED, step, draft, updatedAt}", cls: "DEVICE_LOCAL", note: "onboarding first-run state and unfinished draft; the profile itself is livon.lifeStage / lifeInterests / lifeEvents" },
    { key: "livon.a11y.motion.v1", storage: "local", owner: "livon-a11y.js", schema: "'paused'|'playing'", cls: "DEVICE_LOCAL", note: "the visitor's choice for background video on this device; no personal data" },
    { key: "livon.lifeEventProgress.v1", storage: "local", owner: "livon-platform.js", schema: "{eventId: {areas}}", cls: "ACCOUNT_SYNC", collection: "life_progress" },
    { key: "livon.lifeHub.checklist.v1", storage: "local", owner: "life-hub.js", schema: "{topicId: checked[]}", cls: "ACCOUNT_SYNC", collection: "life_progress" },
    { key: "livon.tdSaved", storage: "local", owner: "today-page.js (legacy mirror of platform saves)", schema: "[{id,label,at}]", cls: "LEGACY" },
    { key: "livon.lifeSavedLocal", storage: "local", owner: "life-page.js (legacy)", schema: "string[]", cls: "LEGACY" },
    { key: "livon.exSaved", storage: "local", owner: "explore-page.js (legacy; migrated to platform saves)", schema: "string[]", cls: "LEGACY" },
    { key: "livon.cmJoined", storage: "local", owner: "community-page.js (legacy)", schema: "array", cls: "LEGACY" },
    { key: "livon.cmInterests", storage: "local", owner: "community-page.js (legacy)", schema: "string[]", cls: "LEGACY" },
    { key: "livon.life.v1", storage: "local", owner: "life-app.js (not loaded by livon/index.html)", schema: "object", cls: "LEGACY" },
    { key: "livon.today.recent.v1", storage: "local", owner: "today-feed.js", schema: "recent views", cls: "DEVICE_LOCAL", note: "recent activity" },
    { key: "livon.exRecent", storage: "local", owner: "explore-page.js", schema: "recent queries", cls: "DEVICE_LOCAL", note: "recent activity" },
    { key: "livon.exViewed", storage: "local", owner: "explore-page.js", schema: "recent item ids", cls: "DEVICE_LOCAL", note: "recent activity" },
    { key: "livon.exCompare", storage: "local", owner: "explore-page.js", schema: "item ids", cls: "DEVICE_LOCAL" },
    { key: "livon.exTrackHistory", storage: "local", owner: "explore-page.js", schema: "'0'|'1'", cls: "DEVICE_LOCAL", note: "the user's tracking choice for this device" },
    { key: "livon.exScroll", storage: "local", owner: "explore-page.js", schema: "scroll state", cls: "DEVICE_LOCAL" },
    { key: "livon.lifeHub.saveAck", storage: "local", owner: "life-hub.js", schema: "flag", cls: "DEVICE_LOCAL" },
    { key: "livon.lifeHub.lastHash", storage: "local", owner: "life-hub.js", schema: "string", cls: "DEVICE_LOCAL" },
    { key: "livon.today.tab", storage: "local", owner: "today-feed.js", schema: "string", cls: "DEVICE_LOCAL" },
    { key: META_KEY, storage: "local", owner: "livon/data/livon-user-data.js", schema: "{v, deviceId, stores, tombstones, …}", cls: "DEVICE_LOCAL", note: "sync metadata" },
    { key: "livon.activeProfile.v1", storage: "local", owner: "livon/data/livon-sync.js", schema: "{kind: anon|account, key}", cls: "DEVICE_LOCAL", note: "whose data the live keys hold (account switching safety)" },
    { key: "livon.vault.", storage: "local", owner: "livon/data/livon-sync.js", schema: "profile snapshot (anon | acct.<key>)", cls: "DEVICE_LOCAL", prefix: true, note: "this device's anonymous data while signed in; an account's cache while signed out" },
    { key: "livon.sync.v1:", storage: "local", owner: "livon/data/livon-sync.js", schema: "{lastServerRev, lastSyncAt, index, importDecision, sensitive}", cls: "DEVICE_LOCAL", prefix: true, note: "per-account sync cursor (no content)" },
    { key: "livon.data.v1", storage: "local", owner: "livon/data/livon-data-core.js (namespace livon.data.v1:*)", schema: "provider responses (TTL)", cls: "SERVER_SOURCE_CACHE", prefix: true },
    { key: "livon.aiPrompt", storage: "session", owner: "life-hub / today / services → ai-page.js", schema: "{q, draftOnly}", cls: "SESSION_ONLY" },
    { key: "livon.ai.prompt", storage: "session", owner: "life-app.js (legacy)", schema: "string", cls: "SESSION_ONLY" },
    { key: "livon.openLifeEvent", storage: "session", owner: "livon-platform.js → life-page.js", schema: "id", cls: "SESSION_ONLY" },
    { key: "livon.mlGoto", storage: "session", owner: "livon-platform.js", schema: "view", cls: "SESSION_ONLY" },
    { key: "livon.cmFeedScroll", storage: "session", owner: "community-page.js", schema: "{hash,y}", cls: "SESSION_ONLY" },
    { key: "livon.studyPlanDraft", storage: "session", owner: "service-details.js", schema: "draft", cls: "SESSION_ONLY" },
    { key: "livon.majorCompare", storage: "session", owner: "service-details.js / service-youth.js", schema: "ids", cls: "SESSION_ONLY" },
    { key: "livon.serviceFilters.", storage: "session", owner: "service-details.js", schema: "filters", cls: "SESSION_ONLY", prefix: true },
    { key: "livon.teenFilters.", storage: "session", owner: "service-teen.js", schema: "filters", cls: "SESSION_ONLY", prefix: true },
    { key: "livon.sessionVault.", storage: "session", owner: "livon-sync.js", schema: "{key: draft} parked per profile on account switch", cls: "SESSION_ONLY", prefix: true },
    { key: "livon.serviceDraft.", storage: "session", owner: "service-tools.js", schema: "draft", cls: "SESSION_ONLY", prefix: true },
    { key: "livon.youthDraft.", storage: "session", owner: "service-youth.js", schema: "draft", cls: "SESSION_ONLY", prefix: true },
    { key: "(memory) LivonData repository session", storage: "memory", owner: "livon-data-core.js", schema: "on-demand provider results", cls: "SERVER_SOURCE_CACHE", note: "Kakao / TourAPI / 고용24 results of this page only" }
  ];
  function entryFor(key) {
    for (var i = 0; i < INVENTORY.length; i++) { var e = INVENTORY[i]; if (e.prefix ? String(key).indexOf(e.key) === 0 : e.key === key) return e; }
    return null;
  }

  /* ───────── safe values ───────── */
  /* prototype-polluting property names (a plain-object lookup table would itself inherit "toString" etc.) */
  function isBadKey(k) { return k === "__proto__" || k === "constructor" || k === "prototype"; }
  var MAX_DEPTH = 12;
  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  /* collections and ids are looked up in plain objects: only own entries count, never inherited names ("toString"…) */
  function isCollection(c) { return typeof c === "string" && hasOwn(POLICY, c); }
  function isReservedId(id) { return id === "__proto__" || id === "prototype" || hasOwn(Object.prototype, id); }
  /* plain JSON object from any realm (iframe/vm/server): its prototype is null or an Object.prototype */
  function isPlain(o) { if (!o || typeof o !== "object" || Array.isArray(o) || Object.prototype.toString.call(o) !== "[object Object]") return false; var p = Object.getPrototypeOf(o); return p === null || Object.getPrototypeOf(p) === null; }
  /* deep copy of JSON data only; drops prototype-polluting keys and non-JSON values; bounded depth */
  function clean(v, depth) {
    depth = depth || 0;
    if (depth > MAX_DEPTH) return null;
    if (v === null || typeof v === "boolean") return v;
    if (typeof v === "number") return isFinite(v) ? v : null;
    if (typeof v === "string") return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‪-‮⁦-⁩]/g, "");
    if (Array.isArray(v)) return v.slice(0, 5000).map(function (x) { return clean(x, depth + 1); });
    if (typeof v === "object") {
      var out = {};
      Object.keys(v).forEach(function (k) { if (!isBadKey(k) && Object.prototype.hasOwnProperty.call(v, k)) { var c = clean(v[k], depth + 1); if (c !== undefined) out[k] = c; } });
      return out;
    }
    return undefined;
  }
  function hasBadKeys(v, depth) {
    depth = depth || 0;
    if (!v || typeof v !== "object") return false;
    if (depth > MAX_DEPTH) return true;                   /* excessive nesting is refused, not skipped (fail closed) */
    var ks = Object.getOwnPropertyNames(v);
    for (var i = 0; i < ks.length; i++) { if (isBadKey(ks[i])) return true; if (hasBadKeys(v[ks[i]], depth + 1)) return true; }
    return false;
  }
  /* location of the USER (not of a saved place), secrets, raw payloads and request parameters never leave the device */
  var PRIVATE_KEYS = /^(nearby|nearbySearchOrigin|origin|coords|locationCoordinates|userLat|userLng|myLocation|position|token|accessToken|access_token|idToken|id_token|refreshToken|refresh_token|authorization|cookie|authKey|serviceKey|apiKey|api_key|privateKey|private_key|clientSecret|client_secret|password|secret|raw|rawResponse|rawServerResponse|request|requestParams)$/i;
  function hasPrivateKeys(v, depth) {
    depth = depth || 0;
    if (!v || typeof v !== "object" || depth > MAX_DEPTH) return false;
    if (Array.isArray(v)) return v.some(function (x) { return hasPrivateKeys(x, depth + 1); });
    return Object.keys(v).some(function (k) { return PRIVATE_KEYS.test(k) || hasPrivateKeys(v[k], depth + 1); });
  }
  function privacyFilter(v, depth) {
    depth = depth || 0;
    if (!v || typeof v !== "object" || depth > 12) return v;
    if (Array.isArray(v)) return v.map(function (x) { return privacyFilter(x, depth + 1); });
    var out = {};
    Object.keys(v).forEach(function (k) { if (!PRIVATE_KEYS.test(k)) out[k] = privacyFilter(v[k], depth + 1); });
    return out;
  }
  function hashId(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); }
  var ID_RE = /^[A-Za-z0-9가-힣_.:~@#\-]{1,160}$/;
  function safeId(v) { var s = String(v == null ? "" : v).trim(); return ID_RE.test(s) ? s : ""; }
  function ts(v) { var n = typeof v === "number" ? v : Date.parse(v); return isFinite(n) && n > 0 ? n : 0; }

  /* ───────── adapters ───────── */
  /* stored value must keep the shape the caller expects (old schema / corrupted data → fallback, null entries dropped) */
  function fitShape(v, fb) { if (Array.isArray(fb)) return Array.isArray(v) ? v.filter(function (x) { return x != null; }) : fb; if (fb && typeof fb === "object") return v && typeof v === "object" && !Array.isArray(v) ? v : fb; return v; }
  function LocalAdapter(storage) {
    return {
      kind: "local", configured: true,
      readRaw: function (key) { try { return storage ? storage.getItem(key) : null; } catch (e) { return null; } },
      readJSON: function (key, fallback) { try { var raw = storage && storage.getItem(key); return fitShape(raw ? JSON.parse(raw) : fallback, fallback); } catch (e) { return fallback; } },
      writeJSON: function (key, value) { try { storage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; } },
      keys: function () { var out = []; try { for (var i = 0; i < storage.length; i++) out.push(storage.key(i)); } catch (e) {} return out; },
      writeRaw: function (key, raw) { try { storage.setItem(key, String(raw)); return true; } catch (e) { return false; } }
      /* no remove(): LIVON user data is never deleted by the persistence layer (the profile swap in livon-sync.js clears a
         live key only after copying it into a vault snapshot) */
    };
  }
  function notConfigured() { var e = new Error("remote not configured"); e.code = "REMOTE_NOT_CONFIGURED"; return Promise.reject(e); }
  var REMOTE_OPS = ["get", "list", "upsert", "delete", "batch", "syncMeta", "pull", "device"];
  /*
   * Remote adapter contract (vendor-neutral). Operations:
   *   get(collection, id) · list(collection, {sinceServerRev}) · upsert(record) · delete(collection, id, deletedAt)
   *   batch(records ≤ 500) · syncMeta() → {serverRev, lastSyncAt}
   * The server decides the user from its own session (bearer token) — records never carry a userId.
   * With no endpoint/token getter it is configured:false and every call rejects without any network request.
   */
  /* same-origin "/api/…" path, or the configured LIVON API origin (livon/livon-api-config.js) + "/api/…" — never any other host */
  function allowedEndpoint(ep) {
    if (typeof ep !== "string") return "";
    if (/^\/api\/[a-z0-9/_-]+$/.test(ep)) return ep;
    var A = root.LivonApi;
    if (A && typeof A.base === "string" && A.base && ep.indexOf(A.base + "/api/") === 0 && /^\/api\/[a-z0-9/_-]+$/.test(ep.slice(A.base.length))) return ep;
    return "";
  }
  function httpError(r, body) {
    var e = new Error("http"); e.status = r.status; e.serverCode = body && typeof body.code === "string" ? body.code : null;
    e.code = r.status === 401 ? "NO_SESSION" : r.status === 403 ? "FORBIDDEN" : r.status === 409 ? "CONFLICT" : r.status === 429 ? "RATE_LIMIT" : r.status >= 500 ? "REMOTE_UNAVAILABLE" : "REMOTE_REJECTED";
    return e;
  }
  var REQUEST_TIMEOUT_MS = 25000;
  function createRemoteAdapter(opts) {
    opts = opts || {};
    var ep = allowedEndpoint(opts.endpoint);
    var token = typeof opts.getAccessToken === "function" ? opts.getAccessToken : null;
    var f = opts.fetchImpl || null;
    if (!ep || !token || typeof f !== "function") {
      var off = { kind: "remote", configured: false };
      REMOTE_OPS.forEach(function (op) { off[op] = notConfigured; });
      return off;
    }
    function send(op, payload) {
      var body = { op: op, payload: payload };
      var check = validateSyncRequest(body);
      if (!check.ok) { var e = new Error("invalid"); e.code = "INVALID_PAYLOAD"; e.reason = check.reason; return Promise.reject(e); }
      return Promise.resolve(token()).then(function (t) {
        if (!t) { var e2 = new Error("no session"); e2.code = "NO_SESSION"; throw e2; }
        return timed(function (signal) { return f(ep, { method: "POST", credentials: "omit", redirect: "error", cache: "no-store", signal: signal, headers: { "content-type": "application/json", accept: "application/json", authorization: "Bearer " + t }, body: JSON.stringify(check.value) }); });
      }).then(readResponse);
    }
    /* no cookies (Bearer only), no redirects (a token never follows a redirect), bounded wait */
    function timed(run) {
      var C = root.AbortController, ctl = typeof C === "function" ? new C() : null, timer = null;
      if (ctl && typeof root.setTimeout === "function") timer = root.setTimeout(function () { ctl.abort(); }, REQUEST_TIMEOUT_MS);
      return Promise.resolve().then(function () { return run(ctl ? ctl.signal : undefined); }).then(function (r) {
        if (timer != null) root.clearTimeout(timer);
        if (r && (r.redirected || r.type === "opaqueredirect")) { var e = new Error("redirect"); e.code = "REMOTE_REJECTED"; throw e; }
        return r;
      }, function (e) { if (timer != null) root.clearTimeout(timer); throw e; });
    }
    function readResponse(r) {
      return Promise.resolve(r.json ? r.json().catch(function () { return null; }) : null).then(function (b) {
        if (!r.ok || !b || b.ok !== true) throw httpError(r.ok ? { status: 502 } : r, b);
        return b;
      });
    }
    /* GET {ep}?since=&limit= — the token travels only in the Authorization header, never in the URL */
    function pull(since, limit) {
      var q = "?since=" + Math.max(0, Math.floor(Number(since) || 0)) + "&limit=" + Math.min(500, Math.max(1, Math.floor(Number(limit) || 500)));
      return Promise.resolve(token()).then(function (t) {
        if (!t) { var e2 = new Error("no session"); e2.code = "NO_SESSION"; throw e2; }
        return timed(function (signal) { return f(ep + q, { method: "GET", credentials: "omit", redirect: "error", cache: "no-store", signal: signal, headers: { accept: "application/json", authorization: "Bearer " + t } }); });
      }).then(readResponse);
    }
    return {
      kind: "remote", configured: true,
      get: function (c, id) { return send("get", { collection: c, id: id }); },
      list: function (c, o) { return send("list", { collection: c, sinceServerRev: o && o.sinceServerRev || 0 }); },
      upsert: function (rec) { return send("batch", { records: [rec] }); },
      delete: function (c, id, at) { return send("batch", { records: [{ id: id, collection: c, schemaVersion: SCHEMA_VERSION, createdAt: at, updatedAt: at, deletedAt: at, localRev: 0, data: null }] }); },
      batch: function (records, o) { var p = { records: records }; if (o && o.sensitive === true) p.sensitive = true; return send("batch", p); },
      syncMeta: function () { return send("syncMeta", {}); },
      pull: pull,
      device: function (d) { return send("device", d); }
    };
  }

  /* ───────── sync request contract (browser and server use the same rules) ───────── */
  var LIMITS = { maxRecords: 500, maxRecordBytes: 64 * 1024, maxBatchBytes: 1024 * 1024 };
  var RECORD_FIELDS = ["id", "collection", "schemaVersion", "createdAt", "updatedAt", "deletedAt", "localRev", "serverRev", "data"];
  /* singleton collections: only the ids LIVON itself writes (no arbitrary settings keys on the account) */
  var fixedIds = null;
  function fixedIdAllowed(collection, id) {
    if (!fixedIds) {
      fixedIds = { preferences: {}, life_progress: {}, save_folders: { "platform.folders": 1 }, budgets: { "ml.budgets": 1 } };
      INVENTORY.forEach(function (e) {
        if (e.fields) Object.keys(e.fields).forEach(function (f) { var x = e.fields[f]; if (x.prefId && fixedIds[x.collection]) fixedIds[x.collection][x.prefId] = 1; });
        else if (!e.prefix && e.cls === "ACCOUNT_SYNC" && fixedIds[e.collection]) fixedIds[e.collection][e.key] = 1;
      });
    }
    return !hasOwn(fixedIds, collection) || hasOwn(fixedIds[collection], id);
  }
  function validateRecord(r) {
    if (!isPlain(r)) return "record:not-object";
    if (hasBadKeys(r)) return "record:forbidden-key";
    var ks = Object.keys(r);
    for (var i = 0; i < ks.length; i++) if (RECORD_FIELDS.indexOf(ks[i]) < 0) return "record:unknown-field:" + ks[i].slice(0, 20);   /* mass assignment */
    if (typeof r.id !== "string" || safeId(r.id) !== r.id || isReservedId(r.id)) return "record:id";
    if (!isCollection(r.collection)) return "record:collection";
    if (!fixedIdAllowed(r.collection, r.id)) return "record:id-not-allowed";
    if (r.schemaVersion !== SCHEMA_VERSION) return "record:schemaVersion";
    if (!ts(r.createdAt) || !ts(r.updatedAt)) return "record:timestamps";
    if (r.deletedAt != null && !ts(r.deletedAt)) return "record:deletedAt";
    if (r.deletedAt == null && !isPlain(r.data)) return "record:data";
    if (r.deletedAt != null && r.data != null) return "record:tombstone-data";
    if (r.data && r.data.id != null && safeId(r.data.id) && String(r.data.id) !== r.id) return "record:data-id";
    if (hasPrivateKeys(r.data)) return "record:private-field";          /* secrets, tokens, raw payloads, user location */
    if (r.serverRev != null && !(Number.isInteger(r.serverRev) && r.serverRev >= 0)) return "record:serverRev";
    if (r.localRev != null && !(Number.isInteger(r.localRev) && r.localRev >= 0 && r.localRev < 2147483647)) return "record:localRev";
    var size; try { size = JSON.stringify(r).length; } catch (e) { return "record:not-json"; }
    if (size > LIMITS.maxRecordBytes) return "record:too-large";
    return "";
  }
  function validateSyncRequest(body) {
    if (!isPlain(body) || hasBadKeys(body)) return { ok: false, reason: "body" };
    var allowed = ["op", "payload"];
    if (Object.keys(body).some(function (k) { return allowed.indexOf(k) < 0; })) return { ok: false, reason: "body:unknown-field" };   /* e.g. a client "userId" */
    if (["get", "list", "batch", "syncMeta", "device"].indexOf(body.op) < 0) return { ok: false, reason: "op" };
    var p = body.payload;
    if (!isPlain(p)) return { ok: false, reason: "payload" };
    if ("userId" in p || "user" in p || "ownerId" in p) return { ok: false, reason: "payload:client-identity" };
    var total; try { total = JSON.stringify(body).length; } catch (e) { return { ok: false, reason: "not-json" }; }
    if (total > LIMITS.maxBatchBytes) return { ok: false, reason: "payload:too-large" };
    if (body.op === "batch") {
      if (!Array.isArray(p.records) || !p.records.length || p.records.length > LIMITS.maxRecords) return { ok: false, reason: "payload:records" };
      if (Object.keys(p).some(function (k) { return k !== "records" && k !== "sensitive"; })) return { ok: false, reason: "payload:unknown-field" };
      if (p.sensitive !== undefined && typeof p.sensitive !== "boolean") return { ok: false, reason: "payload:sensitive" };
      for (var i = 0; i < p.records.length; i++) { var why = validateRecord(p.records[i]); if (why) return { ok: false, reason: why }; }
      var seen = Object.create(null);
      for (var j = 0; j < p.records.length; j++) { var key = p.records[j].collection + "|" + p.records[j].id; if (seen[key]) return { ok: false, reason: "payload:duplicate-record" }; seen[key] = 1; }
      var batch = { records: p.records.map(function (r) { var o = {}; RECORD_FIELDS.forEach(function (k) { if (r[k] !== undefined) o[k] = clean(r[k]); }); return o; }) };
      if (p.sensitive === true) batch.sensitive = true;
      return { ok: true, value: { op: "batch", payload: batch } };
    }
    if (body.op === "device") {
      if (Object.keys(p).some(function (k) { return ["deviceId", "lastServerRev", "conflicts", "importDecided"].indexOf(k) < 0; })) return { ok: false, reason: "payload:unknown-field" };
      if (typeof p.deviceId !== "string" || !/^dv_[a-z0-9]{6,24}$/.test(p.deviceId)) return { ok: false, reason: "payload:device" };
      if (!(Number.isInteger(p.lastServerRev) && p.lastServerRev >= 0) || (p.conflicts !== undefined && !(Number.isInteger(p.conflicts) && p.conflicts >= 0 && p.conflicts <= 10000))) return { ok: false, reason: "payload:device" };
      if (p.importDecided !== undefined && typeof p.importDecided !== "boolean") return { ok: false, reason: "payload:device" };
      return { ok: true, value: clean(body) };
    }
    if (body.op === "get" && (!safeId(p.id) || isReservedId(p.id) || !isCollection(p.collection))) return { ok: false, reason: "payload:get" };
    if (body.op === "list" && (!isCollection(p.collection) || !(p.sinceServerRev >= 0))) return { ok: false, reason: "payload:list" };
    return { ok: true, value: clean(body) };
  }

  /* ───────── local stores → account records (export for a future, user-approved import) ───────── */
  function record(collection, id, data, created, updated, extra) {
    var now = Date.now();
    var c = ts(created) || ts(updated) || 0, u = ts(updated) || c;
    return Object.assign({ id: id, collection: collection, schemaVersion: SCHEMA_VERSION, createdAt: c || now, updatedAt: u || c || now, deletedAt: null, localRev: 0, data: data }, extra || {});
  }
  function collectAccountRecords(opts) {
    opts = opts || {};
    var L = repo.local, out = [], skipped = { sensitive: 0, invalid: 0 };
    var includeSensitive = !!opts.includeSensitive;
    var m0 = meta(), stores = isPlain(m0.stores) ? m0.stores : {};
    function push(r) {
      if (SENSITIVE_COLLECTIONS.indexOf(r.collection) >= 0 && !includeSensitive) { skipped.sensitive++; return; }
      /* single-value records carry no timestamp of their own: use when their store last changed on this device */
      if (r.collection === "preferences" || r.collection === "save_folders" || r.collection === "life_progress" || r.collection === "budgets") {
        var src = r.id.indexOf("ml.") === 0 ? "livon.mlStore.v1" : r.id.indexOf("platform.") === 0 ? "livon.platform.v1" : r.id;
        var st = hasOwn(stores, src) && isPlain(stores[src]) ? stores[src] : null;
        if (st && ts(st.changedAt)) { r.updatedAt = ts(st.changedAt); if (ts(r.createdAt) > r.updatedAt) r.createdAt = r.updatedAt; }
      }
      r.data = r.data == null ? null : privacyFilter(clean(r.data));
      if (validateRecord(r)) { skipped.invalid++; return; }
      out.push(r);
    }
    var ml = L.readJSON("livon.mlStore.v1", null);
    if (isPlain(ml)) {
      var inv = entryFor("livon.mlStore.v1").fields;
      Object.keys(inv).forEach(function (field) {
        var f = inv[field];
        if (f.cls !== "ACCOUNT_SYNC" || field === "habitLogs") return;
        var v = ml[field];
        if (f.prefId) { if (v != null) push(record("preferences", f.prefId, { value: v }, 0, 0)); return; }
        if (field === "budgets") { if (isPlain(v)) push(record("budgets", "ml.budgets", v, 0, 0)); return; }
        (Array.isArray(v) ? v : []).forEach(function (it) {
          if (!isPlain(it)) return;
          var id = safeId(it.id) || (f.collection + "~" + hashId(JSON.stringify(it)));
          var data = Object.assign({}, it);
          if (field === "habits" && isPlain(ml.habitLogs) && ml.habitLogs[it.id]) data.logs = ml.habitLogs[it.id];
          push(record(f.collection, id, data, it.createdAt, it.updatedAt || it.doneAt));
        });
      });
    }
    var pf = L.readJSON("livon.platform.v1", null);
    if (isPlain(pf)) {
      (Array.isArray(pf.saves) ? pf.saves : []).forEach(function (s) {
        if (!isPlain(s) || !safeId(s.id)) { skipped.invalid++; return; }
        push(record("saved_items", s.id, s, s.savedAt || s.at, s.savedAt || s.at));
      });
      if (Array.isArray(pf.folders)) push(record("save_folders", "platform.folders", { values: pf.folders }, 0, 0));
      if (isPlain(pf.alertPrefs)) push(record("preferences", "platform.alertPrefs", { value: pf.alertPrefs }, 0, 0));
      if (isPlain(pf.region) && (pf.region.sido || pf.region.sgg)) push(record("preferences", "platform.region", { value: { sido: pf.region.sido || "", sgg: pf.region.sgg || "" } }, 0, 0));   /* 동 stays local */
    }
    INVENTORY.forEach(function (e) {
      if (e.fields || e.prefix || e.storage !== "local" || e.cls !== "ACCOUNT_SYNC") return;
      var raw = L.readRaw(e.key);
      if (raw == null) return;
      var v, isRaw = false; try { v = JSON.parse(raw); } catch (err) { v = raw; isRaw = true; }
      push(record(e.collection, e.key, isRaw ? { value: v, rawString: true } : { value: v }, 0, 0));
    });
    /* tombstones: deletions made on this device since change tracking began (so an import never resurrects them) */
    /* …unless the item exists again on this device (re-saved / re-created / undone): the live record is the current truth */
    var live = Object.create(null);
    out.forEach(function (r) { live[r.collection + "|" + r.id] = 1; });
    (meta().tombstones || []).forEach(function (t) { if (isCollection(t.collection) && safeId(t.id) && !live[t.collection + "|" + t.id]) out.push(record(t.collection, t.id, null, t.deletedAt, t.deletedAt, { deletedAt: t.deletedAt })); });
    return { records: out, skipped: skipped };
  }
  /* what a first-login import would bring — counts only, no side effects, no network (the user decides) */
  function planLoginImport() {
    var all = collectAccountRecords({ includeSensitive: true }).records.filter(function (r) { return !r.deletedAt; });
    var counts = {}, sensitive = {};
    all.forEach(function (r) { var bag = SENSITIVE_COLLECTIONS.indexOf(r.collection) >= 0 ? sensitive : counts; bag[r.collection] = (bag[r.collection] || 0) + 1; });
    return { autoUpload: false, requiresUserChoice: true, counts: counts, sensitiveCounts: sensitive, sensitiveDefault: "excluded", excluded: ["AI 대화", "최근 활동", "커뮤니티 글", "위치", "데이터 캐시", "임시 초안"] };
  }

  /* ───────── merge / conflict policy ───────── */
  function norm(s) { return String(s || "").toLowerCase().replace(/\s+/g, " ").trim(); }
  function sameData(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function naturalKey(r) {
    var d = r.data || {};
    return r.collection === "calendar_items" ? [norm(d.title), d.date || "", d.allDay ? "all" : d.start || ""].join("|") : "";
  }
  /*
   * mergeCollection(local, remote, {lastSyncedAt}) → { records, conflicts }
   *   union     (saved_items)   union by stable id; same id → newer savedAt wins, nothing dropped
   *   set       (save_folders)  union of values
   *   pref      (preferences…)  newer updatedAt wins; a differing older value is reported as a conflict (never silent)
   *   record    (tasks, goals…) one side changed since lastSyncedAt → that side; both changed → remote stays at the id and the
   *                             local version is kept as a copy (conflictOf) for the user to resolve. LIVON AI approvals
   *                             (data.source "livon-ai") are idempotent: the same open title merges into one.
   *   calendar                  record rules + exact duplicates (same title/date/start) collapse into one (ids kept in mergedIds)
   *   deleted                   a tombstone wins only over data not edited after the deletion; otherwise the edit survives
   */
  function mergeCollection(local, remote, opts) {
    opts = opts || {};
    var base = ts(opts.lastSyncedAt) || 0;
    var byId = Object.create(null), order = [], conflicts = [];
    (remote || []).forEach(function (r) { if (!byId[r.id]) order.push(r.id); byId[r.id] = { remote: r }; });
    (local || []).forEach(function (r) { if (!byId[r.id]) { order.push(r.id); byId[r.id] = {}; } byId[r.id].local = r; });
    var out = [];
    order.forEach(function (id) {
      var L0 = byId[id].local, R0 = byId[id].remote;
      if (!L0 || !R0) { out.push(L0 || R0); return; }
      var policy = isCollection((L0 || R0).collection) ? POLICY[(L0 || R0).collection] : "record";
      if (sameData(L0.data, R0.data) && !!L0.deletedAt === !!R0.deletedAt) { out.push(R0); return; }
      if (L0.deletedAt || R0.deletedAt) {
        var del = L0.deletedAt ? L0 : R0, live = L0.deletedAt ? R0 : L0;
        if (del.deletedAt && live.deletedAt) { out.push(ts(L0.deletedAt) >= ts(R0.deletedAt) ? L0 : R0); return; }
        if (ts(del.deletedAt) >= ts(live.updatedAt)) out.push(del);
        else { out.push(live); conflicts.push({ collection: live.collection, id: id, kind: "edit-after-delete", kept: "edit" }); }
        return;
      }
      if (policy === "set") {
        var vals = []; [R0, L0].forEach(function (r) { ((r.data && r.data.values) || []).forEach(function (v) { if (vals.indexOf(v) < 0) vals.push(v); }); });
        out.push(Object.assign({}, R0, { data: { values: vals }, updatedAt: Math.max(ts(L0.updatedAt), ts(R0.updatedAt)) })); return;
      }
      if (policy === "union" || policy === "pref") {
        var newer = ts(L0.updatedAt) > ts(R0.updatedAt) ? L0 : R0, older = newer === L0 ? R0 : L0;
        out.push(newer);
        if (policy === "pref") conflicts.push({ collection: newer.collection, id: id, kind: "preference-differs", kept: newer === L0 ? "local" : "remote" });
        return;
      }
      var lc = ts(L0.updatedAt) > base, rc = ts(R0.updatedAt) > base;
      if (lc && !rc) { out.push(L0); return; }
      if (rc && !lc) { out.push(R0); return; }
      out.push(R0);
      /* suffix first, then the id is shortened to fit: a long id can never collapse onto the original */
      var suffix = "~c" + hashId(id + "|" + JSON.stringify(L0.data));
      var copyId = id.slice(0, 160 - suffix.length) + suffix;
      /* the copy is a separate item: its own id also inside data (list items are matched by data.id) */
      var copy = Object.assign({}, L0, { id: copyId, data: Object.assign({}, L0.data, { conflictOf: id }, L0.data && L0.data.id != null ? { id: copyId } : {}) });
      out.push(copy);
      conflicts.push({ collection: L0.collection, id: id, kind: "both-changed", kept: "both", copyId: copy.id });
    });
    /* AI approvals: idempotent by open title (the My Life duplicate rule) */
    var seenAi = Object.create(null);
    out = out.filter(function (r) {
      var d = r.data || {};
      if (r.deletedAt || d.source !== "livon-ai" || d.done || d.conflictOf || (r.collection !== "tasks" && r.collection !== "goals")) return true;
      var k = r.collection + "|" + norm(d.title);
      if (seenAi[k]) return false;
      seenAi[k] = 1; return true;
    });
    /* calendar: exact duplicates with different ids collapse (earliest created kept, other ids remembered) */
    var seenCal = Object.create(null);
    out = out.filter(function (r) {
      if (r.collection !== "calendar_items" || r.deletedAt || (r.data && r.data.conflictOf)) return true;
      var k = naturalKey(r);
      if (!k.replace(/\|/g, "")) return true;
      var first = seenCal[k];
      if (!first) { seenCal[k] = r; return true; }
      if (sameData(Object.assign({}, first.data, { id: 0, createdAt: 0, updatedAt: 0, mergedIds: 0 }), Object.assign({}, r.data, { id: 0, createdAt: 0, updatedAt: 0, mergedIds: 0 }))) {
        first.data = Object.assign({}, first.data, { mergedIds: ((first.data && first.data.mergedIds) || []).concat([r.id]) });
        return false;
      }
      return true;
    });
    return { records: out, conflicts: conflicts };
  }

  /* ───────── account records → local stores (sync write-back) ───────── */
  var ML_KEY = "livon.mlStore.v1", PF_KEY = "livon.platform.v1";
  var ML_FIELD = { tasks: "todos", goals: "goals", calendar_items: "events", checklists: "checklists", habits: "habits", projects: "projects", experiences: "experiences", journal: "journal", transactions: "transactions", health_records: "health" };
  var ML_ACCOUNT_FIELDS = ["todos", "goals", "events", "checklists", "habits", "habitLogs", "projects", "experiences", "journal", "transactions", "budgets", "health", "folders", "settings"];
  var PF_ACCOUNT_FIELDS = ["saves", "folders", "alertPrefs", "region"];
  function singleAccountKeys() { return INVENTORY.filter(function (e) { return !e.fields && !e.prefix && e.storage === "local" && e.cls === "ACCOUNT_SYNC"; }).map(function (e) { return e.key; }); }
  function recordHash(r) { return hashId(JSON.stringify({ d: r && !r.deletedAt ? r.data : null, x: r && r.deletedAt ? 1 : 0 })); }
  function itemRecordId(collection, it) { return safeId(it && it.id) || (collection + "~" + hashId(JSON.stringify(it))); }
  /*
   * applyRecords(records) writes server/merged records into the same local stores the UI reads (same keys, same shapes).
   * Tombstones remove the item from its list without creating a new local tombstone (no echo). Preference tombstones are
   * ignored (a preference key is never removed by sync). Returns { changed }.
   */
  function applyRecords(records) {
    var L = repo.local, changed = 0;
    var ml = L.readJSON(ML_KEY, null), pf = L.readJSON(PF_KEY, null), mlDirty = false, pfDirty = false;
    if (!isPlain(ml)) ml = null;
    if (!isPlain(pf)) pf = null;
    applying = true;
    try {
      (records || []).forEach(function (r) {
        if (!isPlain(r) || !isCollection(r.collection) || !safeId(r.id) || isReservedId(r.id)) return;
        var d = r.deletedAt ? null : clean(r.data);
        if (!r.deletedAt && !isPlain(d)) return;
        var f = ML_FIELD[r.collection];
        if (f) {
          if (!ml) { if (!d) return; ml = { v: 2 }; }
          var arr = Array.isArray(ml[f]) ? ml[f].slice() : [], idx = -1;
          for (var i = 0; i < arr.length; i++) if (isPlain(arr[i]) && itemRecordId(r.collection, arr[i]) === r.id) { idx = i; break; }
          if (!d) { if (idx >= 0) { arr.splice(idx, 1); ml[f] = arr; mlDirty = true; changed++; } return; }
          var item = Object.assign({}, d);
          if (r.collection === "habits" && item.logs !== undefined) {
            ml.habitLogs = isPlain(ml.habitLogs) ? ml.habitLogs : {};
            if (!sameData(ml.habitLogs[item.id || r.id], item.logs)) { ml.habitLogs[item.id || r.id] = item.logs; mlDirty = true; }
            delete item.logs;
          }
          if (item.id == null) item.id = r.id;
          if (idx >= 0) { if (sameData(arr[idx], item)) return; arr[idx] = item; } else arr.push(item);
          ml[f] = arr; mlDirty = true; changed++; return;
        }
        if (r.collection === "budgets") { if (!d) return; if (!ml) ml = { v: 2 }; if (!sameData(ml.budgets, d)) { ml.budgets = d; mlDirty = true; changed++; } return; }
        if (r.collection === "saved_items") {
          if (!pf) { if (!d) return; pf = {}; }
          var saves = Array.isArray(pf.saves) ? pf.saves.slice() : [], si = -1;
          for (var j = 0; j < saves.length; j++) if (isPlain(saves[j]) && saves[j].id === r.id) { si = j; break; }
          if (!d) { if (si >= 0) { saves.splice(si, 1); pf.saves = saves; pfDirty = true; changed++; } return; }
          if (si >= 0) { if (sameData(saves[si], d)) return; saves[si] = d; } else saves.push(d);
          pf.saves = saves; pfDirty = true; changed++; return;
        }
        if (!d) return;
        if (r.collection === "save_folders") { if (!pf) pf = {}; var vals = Array.isArray(d.values) ? d.values : []; if (!sameData(pf.folders, vals)) { pf.folders = vals; pfDirty = true; changed++; } return; }
        var v = d.value;
        if (r.id === "ml.folders" || r.id === "ml.settings") { if (!ml) ml = { v: 2 }; var fld = r.id === "ml.folders" ? "folders" : "settings"; if (!sameData(ml[fld], v)) { ml[fld] = v; mlDirty = true; changed++; } return; }
        if (r.id === "platform.alertPrefs") { if (!pf) pf = {}; if (isPlain(v) && !sameData(pf.alertPrefs, v)) { pf.alertPrefs = v; pfDirty = true; changed++; } return; }
        if (r.id === "platform.region") {
          if (!pf) pf = {};
          var reg = Object.assign({}, isPlain(pf.region) ? pf.region : {}, { sido: (v && v.sido) || "", sgg: (v && v.sgg) || "" });   /* 동 stays as it was on this device */
          if (!sameData(pf.region, reg)) { pf.region = reg; pfDirty = true; changed++; }
          return;
        }
        var e = entryFor(r.id);
        if (!e || e.fields || e.prefix || e.cls !== "ACCOUNT_SYNC" || e.key !== r.id) return;
        var raw = d.rawString === true ? String(v) : JSON.stringify(v);
        if (raw !== undefined && L.readRaw(r.id) !== raw) { L.writeRaw(r.id, raw); changed++; }
      });
      if (mlDirty) L.writeJSON(ML_KEY, ml);
      if (pfDirty) L.writeJSON(PF_KEY, pf);
    } finally { applying = false; }
    return { changed: changed };
  }
  /* ───────── profile snapshots (account switching: whose data the live keys hold) ───────── */
  function snapshotProfile() {
    var L = repo.local, ml = L.readJSON(ML_KEY, null), pf = L.readJSON(PF_KEY, null), m = meta();
    var snap = { v: 1, at: Date.now(), ml: {}, pf: {}, keys: {}, tombstones: Array.isArray(m.tombstones) ? m.tombstones.slice() : [] };
    if (isPlain(ml)) ML_ACCOUNT_FIELDS.forEach(function (f) { if (ml[f] !== undefined) snap.ml[f] = ml[f]; });
    if (isPlain(pf)) PF_ACCOUNT_FIELDS.forEach(function (f) { if (pf[f] !== undefined) snap.pf[f] = pf[f]; });
    singleAccountKeys().forEach(function (k) { var raw = L.readRaw(k); if (raw != null) snap.keys[k] = raw; });
    return snap;
  }
  /* loadProfile(snapshot, clearKey): account fields/keys become exactly the snapshot's; other fields (device-local) stay.
     clearKey(key) is supplied by the caller that already holds a copy of the current values (livon-sync.js). */
  function loadProfile(snap, clearKey) {
    snap = isPlain(snap) ? snap : {};
    var sml = isPlain(snap.ml) ? snap.ml : {}, spf = isPlain(snap.pf) ? snap.pf : {}, skeys = isPlain(snap.keys) ? snap.keys : {};
    var L = repo.local;
    applying = true;
    try {
      var ml = L.readJSON(ML_KEY, null);
      if (isPlain(ml) || Object.keys(sml).length) { ml = isPlain(ml) ? ml : { v: 2 }; ML_ACCOUNT_FIELDS.forEach(function (f) { if (sml[f] !== undefined) ml[f] = sml[f]; else delete ml[f]; }); L.writeJSON(ML_KEY, ml); }
      var pf = L.readJSON(PF_KEY, null);
      if (isPlain(pf) || Object.keys(spf).length) { pf = isPlain(pf) ? pf : {}; PF_ACCOUNT_FIELDS.forEach(function (f) { if (spf[f] !== undefined) pf[f] = spf[f]; else delete pf[f]; }); L.writeJSON(PF_KEY, pf); }
      singleAccountKeys().forEach(function (k) {
        if (typeof skeys[k] === "string") L.writeRaw(k, skeys[k]);
        else if (L.readRaw(k) != null && typeof clearKey === "function") clearKey(k);
      });
      var m = meta(); if (m.v) { m.tombstones = Array.isArray(snap.tombstones) ? snap.tombstones.slice(-MAX_TOMBSTONES) : []; writeMeta(m); }
    } finally { applying = false; }
    return true;
  }

  /* ───────── change tracking (writes through the repository) ───────── */
  var TRACKED = {
    "livon.mlStore.v1": { todos: "tasks", goals: "goals", events: "calendar_items", checklists: "checklists", habits: "habits", projects: "projects", journal: "journal", transactions: "transactions", health: "health_records", experiences: "experiences" },
    "livon.platform.v1": { saves: "saved_items" }
  };
  function idsOf(v, field) { var s = Object.create(null); ((v && Array.isArray(v[field])) ? v[field] : []).forEach(function (x) { if (x && x.id != null) s[String(x.id)] = 1; }); return s; }
  function meta() {
    var m = repo.local.readJSON(META_KEY, null);
    return isPlain(m) ? m : { v: 0 };
  }
  function writeMeta(m) { return repo.local.writeJSON(META_KEY, m); }
  var applying = false;                                   /* true while remote records are written back (no echo tombstones) */
  var writeListeners = [];
  function track(key, prevRaw, next) {
    var t = TRACKED[key], m = meta();
    if (!m.v) return;                                     /* before migration nothing is tracked (and nothing is lost) */
    if (applying) return;
    var prev; try { prev = prevRaw ? JSON.parse(prevRaw) : null; } catch (e) { prev = null; }
    var now = Date.now();
    m.stores = isPlain(m.stores) ? m.stores : {};
    var st = m.stores[key] = isPlain(m.stores[key]) ? m.stores[key] : { localRev: 0 };
    st.localRev = (Number(st.localRev) || 0) + 1; st.changedAt = now;
    if (t) {
      m.tombstones = Array.isArray(m.tombstones) ? m.tombstones : [];
      Object.keys(t).forEach(function (field) {
        var a = idsOf(prev, field), b = idsOf(next, field);
        Object.keys(a).forEach(function (id) { if (!b[id] && safeId(id)) m.tombstones.push({ collection: t[field], id: id, deletedAt: now }); });
        /* an id that exists again (re-saved, re-created, undone) is no longer deleted */
        m.tombstones = m.tombstones.filter(function (x) { return !(x.collection === t[field] && b[x.id] && !a[x.id]); });
      });
      if (m.tombstones.length > MAX_TOMBSTONES) m.tombstones = m.tombstones.slice(-MAX_TOMBSTONES);
    }
    writeMeta(m);
  }

  /* ───────── migration (additive · idempotent · non-destructive) ───────── */
  function deviceId() { return "dv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
  function migrate() {
    try {
      var m = meta();
      if (m.v === SCHEMA_VERSION && m.inventoryVersion === INVENTORY_VERSION) return { ok: true, changed: false, version: m.v };
      var next = {
        v: SCHEMA_VERSION, inventoryVersion: INVENTORY_VERSION, deviceId: typeof m.deviceId === "string" && /^dv_[a-z0-9]{6,24}$/.test(m.deviceId) ? m.deviceId : deviceId(),
        migratedAt: m.migratedAt || Date.now(), stores: isPlain(m.stores) ? m.stores : {}, tombstones: Array.isArray(m.tombstones) ? m.tombstones : [],
        lastSync: null, conflictCount: Number(m.conflictCount) || 0, lastErrorCategory: null
      };
      if (!writeMeta(next)) throw Object.assign(new Error("write"), { code: "STORAGE_WRITE_FAILED" });
      return { ok: true, changed: true, version: SCHEMA_VERSION };
    } catch (e) {
      lastError = e && e.code ? e.code : "MIGRATION_FAILED";   /* original user data untouched: only META_KEY is ever written here */
      return { ok: false, changed: false, error: lastError };
    }
  }

  /* ───────── auth (foundation only) ───────── */
  var auth = { status: "anonymous", userId: null };
  var authProvider = null, remote = createRemoteAdapter({}), lastError = null;
  /* A future Newon+ integration passes a provider object; LIVON V1 never calls this (no login exists). */
  function setAuthProvider(p) {
    if (!p || typeof p.getSession !== "function") { authProvider = null; auth = { status: "anonymous", userId: null }; return auth; }
    authProvider = p;
    return refreshAuth();
  }
  function refreshAuth() {
    var s = null;
    try { s = authProvider ? authProvider.getSession() : null; } catch (e) { s = null; }
    var ok = s && typeof s.userId === "string" && /^[A-Za-z0-9_-]{6,128}$/.test(s.userId) && s.verified === true;
    auth = ok ? { status: "authenticated", userId: s.userId } : { status: "anonymous", userId: null };
    return { status: auth.status };
  }
  function setRemoteAdapter(a) { remote = a && a.kind === "remote" ? a : createRemoteAdapter({}); return remote.configured; }
  function mode() { return auth.status === "authenticated" && remote.configured ? "account" : "anonymous"; }

  /* ───────── diagnostics (counts and codes only — never content) ───────── */
  function diagnostics() {
    var m = meta(), counts = {};
    try { collectAccountRecords({ includeSensitive: true }).records.forEach(function (r) { if (!r.deletedAt) counts[r.collection] = (counts[r.collection] || 0) + 1; }); } catch (e) {}
    return { mode: mode(), remoteConfigured: !!remote.configured, migrationVersion: m.v || 0, recordCounts: counts,
      tombstones: Array.isArray(m.tombstones) ? m.tombstones.length : 0, lastSync: m.lastSync || null, conflictCount: Number(m.conflictCount) || 0, lastErrorCategory: lastError || m.lastErrorCategory || null };
  }

  /* ───────── repository (the one read/write path) ───────── */
  var repo = {
    local: LocalAdapter(root.localStorage || null),
    read: function (key, fallback) { return repo.local.readJSON(key, fallback); },
    write: function (key, value) {
      var prevRaw = TRACKED[key] ? repo.local.readRaw(key) : null;
      var ok = repo.local.writeJSON(key, value);
      if (ok) { try { track(key, prevRaw, value); } catch (e) { lastError = "TRACKING_FAILED"; } }
      if (ok && !applying) { var e0 = entryFor(key); if (e0 && (e0.fields || e0.cls === "ACCOUNT_SYNC")) writeListeners.slice().forEach(function (fn) { try { fn(key); } catch (er) {} }); }
      return ok;
    }
  };

  var api = {
    version: SCHEMA_VERSION, META_KEY: META_KEY, CLASSES: CLASSES, POLICY: POLICY, COLLECTIONS: COLLECTIONS, SENSITIVE_COLLECTIONS: SENSITIVE_COLLECTIONS,
    INVENTORY: INVENTORY, LIMITS: LIMITS, entryFor: entryFor, classify: function (key) { var e = entryFor(key); return e ? e.cls || "STRUCTURED" : "UNKNOWN"; },
    read: repo.read, write: repo.write,
    mode: mode, auth: function () { return { status: auth.status }; }, setAuthProvider: setAuthProvider, setRemoteAdapter: setRemoteAdapter,
    remote: function () { return { configured: !!remote.configured }; }, createRemoteAdapter: createRemoteAdapter,
    migrate: migrate, meta: function () { return clean(meta()); },
    collectAccountRecords: collectAccountRecords, planLoginImport: planLoginImport, mergeCollection: mergeCollection,
    applyRecords: applyRecords, snapshotProfile: snapshotProfile, loadProfile: loadProfile, recordHash: recordHash,
    onWrite: function (fn) { if (typeof fn !== "function") return function () {}; writeListeners.push(fn); return function () { writeListeners = writeListeners.filter(function (x) { return x !== fn; }); }; },
    validateRecord: validateRecord, validateSyncRequest: validateSyncRequest, isCollection: isCollection, isReservedId: isReservedId, MAX_DEPTH: MAX_DEPTH, clean: clean, privacyFilter: privacyFilter, hasBadKeys: hasBadKeys,
    diagnostics: diagnostics,
    _setStorage: function (s) { repo.local = LocalAdapter(s); }
  };
  root.LivonUserData = api;
  if (root.localStorage) migrate();
})(typeof window !== "undefined" ? window : globalThis);
