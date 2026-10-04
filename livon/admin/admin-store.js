/*
 * LIVON Admin — storage adapters.
 *
 *   Admin UI → Admin Service → Adapter
 *                              ├─ LocalAdapter   (this file, today: localStorage / sessionStorage, memory fallback)
 *                              └─ ServerAdapter  (future: same method names, backed by an authenticated API)
 *
 * The UI never touches storage directly. Every method returns a Promise so the local adapter can be swapped for a
 * network-backed one without changing the service or the UI. Nothing here writes to curated LIVON data or to the
 * public community store (livon.cmStore.v1) — drafts, review states, moderation marks and audit events are local
 * simulations only.
 */
(function (root) {
  "use strict";

  var NS = "livon.admin.v1.";
  var KEYS = { drafts: NS + "drafts", review: NS + "review", moderation: NS + "moderation", audit: NS + "audit" };
  var UI_KEY = NS + "ui";
  var ADAPTER_METHODS = ["listDrafts", "getDraft", "putDraft", "removeDraft", "getReviewStates", "setReviewState", "getModeration", "setModeration",
    "appendAudit", "listAudit", "getUiState", "setUiState", "readCommunitySnapshot", "info"];
  var DRAFT_STATUS = ["DRAFT", "READY_FOR_REVIEW", "APPROVED_LOCAL", "REJECTED_LOCAL"];
  var REVIEW_STATES = ["OPEN", "REVIEWED", "NEEDS_ACTION", "RESOLVED_LOCAL"];
  var MODERATION_STATES = ["FLAGGED", "HIDDEN_LOCAL", "NEEDS_REVIEW", "RESOLVED_LOCAL"];
  var AUDIT_LIMIT = 500;

  function isObj(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  function probe(s) { try { if (!s) return null; var k = NS + "__probe"; s.setItem(k, "1"); s.removeItem(k); return s; } catch (e) { return null; } }

  /* validators — malformed stored state is dropped (and reported), never trusted */
  function validDraft(d) {
    return isObj(d) && typeof d.id === "string" && typeof d.recordId === "string" && Array.isArray(d.changedFields) && isObj(d.before) && isObj(d.after) &&
      DRAFT_STATUS.indexOf(d.status) >= 0 && typeof d.createdAt === "string" && typeof d.updatedAt === "string";
  }
  function validAudit(e) { return isObj(e) && typeof e.id === "string" && typeof e.at === "string" && typeof e.action === "string" && typeof e.entity === "string"; }

  function createLocalAdapter(opts) {
    opts = opts || {};
    var local = probe(opts.localStorage), session = probe(opts.sessionStorage);
    var mem = { drafts: {}, review: {}, moderation: {}, audit: [], ui: {} };
    var problems = [];
    function read(key, fallback, validate) {
      if (!local) return fallback;
      var raw = null;
      try { raw = local.getItem(key); } catch (e) { local = null; problems.push("storage-read-failed"); return fallback; }
      if (raw == null) return fallback;
      try { var v = JSON.parse(raw); var ok = validate(v); if (ok) return ok; } catch (e) {}
      problems.push("malformed:" + key.slice(NS.length));
      return fallback;
    }
    function write(key, value) {
      if (!local) return false;
      try { local.setItem(key, JSON.stringify(value)); return true; } catch (e) { local = null; problems.push("storage-write-failed"); return false; }
    }
    /* load once, validating every entry */
    mem.drafts = read(KEYS.drafts, {}, function (v) { if (!isObj(v)) return null; var o = {}; Object.keys(v).forEach(function (k) { if (validDraft(v[k])) o[k] = v[k]; else problems.push("dropped-draft:" + k); }); return o; });
    mem.review = read(KEYS.review, {}, function (v) { if (!isObj(v)) return null; var o = {}; Object.keys(v).forEach(function (k) { if (REVIEW_STATES.indexOf(v[k]) >= 0) o[k] = v[k]; }); return o; });
    mem.moderation = read(KEYS.moderation, {}, function (v) { if (!isObj(v)) return null; var o = {}; Object.keys(v).forEach(function (k) { if (MODERATION_STATES.indexOf(v[k]) >= 0) o[k] = v[k]; }); return o; });
    mem.audit = read(KEYS.audit, [], function (v) { return Array.isArray(v) ? v.filter(validAudit) : null; });
    if (session) { try { var u = JSON.parse(session.getItem(UI_KEY) || "{}"); if (isObj(u)) mem.ui = u; } catch (e) { problems.push("malformed:ui"); } }

    var P = function (v) { return Promise.resolve(clone(v)); };
    return {
      kind: "local",
      info: function () { return P({ kind: "local", persistent: !!local, sessionPersistent: !!session, problems: problems.slice(), keys: Object.keys(KEYS).map(function (k) { return KEYS[k]; }) }); },
      listDrafts: function () { return P(Object.keys(mem.drafts).map(function (k) { return mem.drafts[k]; }).sort(function (a, b) { return a.updatedAt < b.updatedAt ? 1 : -1; })); },
      getDraft: function (id) { return P(mem.drafts[id] || null); },
      putDraft: function (d) { if (!validDraft(d)) return Promise.reject(new Error("INVALID_DRAFT")); mem.drafts[d.id] = clone(d); write(KEYS.drafts, mem.drafts); return P(d); },
      removeDraft: function (id) { delete mem.drafts[id]; write(KEYS.drafts, mem.drafts); return P(true); },
      getReviewStates: function () { return P(mem.review); },
      setReviewState: function (key, state) {
        if (state !== "OPEN" && REVIEW_STATES.indexOf(state) < 0) return Promise.reject(new Error("INVALID_STATE"));
        if (state === "OPEN") delete mem.review[key]; else mem.review[key] = state;
        write(KEYS.review, mem.review); return P(state);
      },
      getModeration: function () { return P(mem.moderation); },
      setModeration: function (key, state) {
        if (state && MODERATION_STATES.indexOf(state) < 0) return Promise.reject(new Error("INVALID_STATE"));
        if (!state) delete mem.moderation[key]; else mem.moderation[key] = state;
        write(KEYS.moderation, mem.moderation); return P(state || null);
      },
      appendAudit: function (e) { if (!validAudit(e)) return Promise.reject(new Error("INVALID_AUDIT")); mem.audit.push(clone(e)); if (mem.audit.length > AUDIT_LIMIT) mem.audit = mem.audit.slice(-AUDIT_LIMIT); write(KEYS.audit, mem.audit); return P(e); },
      listAudit: function (q) { var n = (q && q.limit) || 100; return P(mem.audit.slice(-n).reverse()); },
      /* the public community store of THIS browser, read-only (never written by the Admin) */
      readCommunitySnapshot: function () { var raw = null; try { raw = opts.localStorage ? opts.localStorage.getItem("livon.cmStore.v1") : null; } catch (e) { raw = null; } return Promise.resolve(raw); },
      /* UI view state (filters, page) — session only */
      getUiState: function (view) { return P(mem.ui[view] || null); },
      setUiState: function (view, value) { mem.ui[view] = clone(value); if (session) { try { session.setItem(UI_KEY, JSON.stringify(mem.ui)); } catch (e) { session = null; } } return P(true); }
    };
  }

  /* Future: the same interface over an authenticated API. Until a backend exists every call fails with BACKEND_REQUIRED. */
  function createServerAdapter(config) {
    var err = function () { var e = new Error("BACKEND_REQUIRED"); e.code = "BACKEND_REQUIRED"; return Promise.reject(e); };
    var a = { kind: "server", config: { baseUrl: (config && config.baseUrl) || null } };
    ADAPTER_METHODS.forEach(function (m) { a[m] = err; });
    return a;
  }

  root.LivonAdminStore = { createLocalAdapter: createLocalAdapter, createServerAdapter: createServerAdapter, ADAPTER_METHODS: ADAPTER_METHODS, KEYS: KEYS,
    DRAFT_STATUS: DRAFT_STATUS, REVIEW_STATES: REVIEW_STATES, MODERATION_STATES: MODERATION_STATES };
})(typeof window !== "undefined" ? window : globalThis);
