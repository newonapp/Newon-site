/*
 * LIVON account sync engine V1 (Newon+ account ⇄ this device).
 *
 *   NewonAuth (verified Firebase session)  →  livon-auth-bridge.js  →  LivonSync.onSignedIn / onSignedOut
 *   LivonSync  ─ remote ─▶  /api/livon/userdata (Bearer ID token; server resolves the internal Newon account)
 *              ─ local  ─▶  LivonUserData (same keys the UI reads)
 *
 * Profiles (who the live storage keys belong to — account switching never leaks data):
 *   anonymous   this device's own data (the only profile before sign-in; restored on sign-out)
 *   account K   the signed-in account's data. K = hash(issuer|subject) — a local scope key, not the account id.
 *   While an account is active, the device's anonymous data waits in "livon.vault.anon.v1"; after sign-out the account's
 *   copy waits in "livon.vault.acct.<K>.v1" (offline cache) unless the user removes it. Nothing is deleted automatically.
 *
 * First sign-in on this device: nothing is uploaded until the user chooses (counts per collection; sensitive data
 * — 건강·돈·일기 — is a separate, unchecked choice). Declining keeps the device data local and only downloads the account.
 *
 * One sync pass: pull (serverRev > cursor) → compare with the local snapshot (changed = hash differs from the last synced
 * hash) → merge with LivonUserData.mergeCollection (union / set / pref / record-with-conflict-copy / calendar dedupe /
 * AI idempotence / edit-after-delete survives; exact calendar duplicates and repeated AI approvals from different devices
 * collapse to one) → write merged results locally → push with optimistic revisions →
 * server conflicts are merged again (≤ 3 rounds). A failure leaves local data as it is and is retried later.
 * Isolation: every pass is bound to one identity and one profile generation. A pass whose account signed out or switched
 * meanwhile applies, saves and uploads nothing; the remote refuses to send a token whose iss/sub differ from its identity.
 * Results are applied only over records that are still exactly what the pass read (edits made meanwhile are never lost).
 * No token, record content or account id is logged or put in a URL.
 */
(function (root) {
  "use strict";

  var ACTIVE_KEY = "livon.activeProfile.v1", VAULT_ANON = "livon.vault.anon.v1";
  function vaultKey(k) { return "livon.vault.acct." + k + ".v1"; }
  function stateKey(k) { return "livon.sync.v1:" + k; }
  var STATUSES = ["idle", "unavailable", "waiting-consent", "syncing", "synced", "offline", "error"];
  var PUSH_BATCH = 200, MAX_PULL_PAGES = 20, MAX_ROUNDS = 3, DEBOUNCE_MS = 4000, PERIODIC_MS = 60000;
  var SESSION_VAULT = "livon.sessionVault.";

  function UD() { return root.LivonUserData; }
  function storage() { try { return root.localStorage || null; } catch (e) { return null; } }
  function readJSON(key) { try { var s = storage(); var raw = s && s.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function writeJSON(key, v) { try { storage().setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function removeKey(key) { try { storage().removeItem(key); return true; } catch (e) { return false; } }
  function fnv(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); }
  function accountKey(session) { return "k" + fnv(session.issuer + "|" + session.subject) + fnv(session.subject + "|" + session.issuer); }
  function isPlain(o) { return !!o && typeof o === "object" && !Array.isArray(o); }
  function keyOf(r) { return r.collection + "|" + r.id; }
  /* base64url → string (only to compare the token's iss/sub with the bound session; never trusted as an identity) */
  function b64url(part) {
    var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_", out = "", buf = 0, bits = 0;
    for (var i = 0; i < part.length; i++) {
      var v = A.indexOf(part.charAt(i)); if (v < 0) throw new Error("b64");
      buf = (buf << 6) | v; bits += 6;
      if (bits >= 8) { bits -= 8; out += String.fromCharCode((buf >> bits) & 255); }
    }
    try { return decodeURIComponent(escape(out)); } catch (e) { return out; }
  }
  function now() { return Date.now(); }

  function createEngine(opts) {
    opts = opts || {};
    var st = { status: "idle", accountKey: null, lastSyncAt: null, errorCode: null, pending: null, changedSinceLoad: 0 };
    var remote = null, listeners = [], timer = null, running = null, session = null, stopWrite = null;
    /* generation: bumped whenever the signed-in identity or the live profile changes. A sync started under an older
       generation never applies, saves or uploads anything afterwards (its results belong to another account). */
    var gen = 0;
    var fetchImpl = opts.fetchImpl || (typeof root.fetch === "function" ? root.fetch.bind(root) : null);
    /* read lazily: livon/livon-api-config.js may load after this file */
    var api = { url: function (p) { var A = opts.api || root.LivonApi; return A && typeof A.url === "function" ? A.url(p) : p; } };
    var getToken = opts.getToken || function () { return root.NewonAuth ? root.NewonAuth.getIdToken() : Promise.resolve(null); };
    /* the UI modules read storage when they render: after the live profile changed, the page reloads once */
    var onProfileChanged = opts.onProfileChanged || function () { try { if (root.document && root.location && typeof root.location.reload === "function") root.location.reload(); } catch (e) {} };

    function emit(type) { var snap = status(); listeners.slice().forEach(function (fn) { try { fn({ type: type, status: snap }); } catch (e) {} }); }
    function set(patch, type) { Object.keys(patch).forEach(function (k) { st[k] = patch[k]; }); emit(type || "status"); }
    function status() {
      return { status: st.status, signedIn: !!st.accountKey, lastSyncAt: st.lastSyncAt, errorCode: st.errorCode, changedSinceLoad: st.changedSinceLoad,
        pending: st.pending ? { counts: st.pending.counts, sensitiveCounts: st.pending.sensitiveCounts } : null, active: active().kind };
    }
    function active() { var a = readJSON(ACTIVE_KEY); return isPlain(a) && a.kind === "account" && typeof a.key === "string" ? a : { kind: "anon" }; }
    function syncState(k) { var s = readJSON(stateKey(k)); return isPlain(s) ? s : { v: 1, lastServerRev: 0, lastSyncAt: 0, index: {}, importDecision: null, sensitive: false }; }
    function saveSyncState(k, s) { writeJSON(stateKey(k), s); }

    /* ───────── server availability (the API says so itself; nothing is assumed) ───────── */
    function serverReady() {
      if (!fetchImpl) return Promise.resolve(false);
      return fetchImpl(api.url("/api/health"), { cache: "no-store" }).then(function (r) {
        return r.ok ? r.json() : null;
      }).then(function (j) { return !!(j && j.userdata && j.userdata.ready === true); }).catch(function () { return false; });
    }
    /* the remote is bound to ONE identity: a token whose iss/sub differ from it (another account signed in meanwhile) is
       never sent — the request fails with SESSION_CHANGED instead of writing this account's data into another account */
    function makeRemote(sess) {
      function bound() {
        return Promise.resolve(getToken()).then(function (t) {
          if (!t) return t;
          var c = claimsOf(t);
          if (session !== sess || !c || c.iss !== sess.issuer || c.sub !== sess.subject) throw Object.assign(new Error("session changed"), { code: "SESSION_CHANGED" });
          return t;
        });
      }
      return UD().createRemoteAdapter({ endpoint: api.url("/api/livon/userdata"), getAccessToken: bound, fetchImpl: fetchImpl });
    }

    /* ───────── profile swap ───────── */
    /* SESSION_ONLY drafts (AI prompt, service drafts, filters) belong to whoever was using the tab: they are parked per
       profile in sessionStorage and restored only for that profile, so account B never sees account A's drafts */
    function swapSession(from, to) {
      var ss = null; try { ss = root.sessionStorage || null; } catch (e) { ss = null; }
      if (!ss) return;
      try {
        var U = UD(), park = {}, keys = [];
        for (var i = 0; i < ss.length; i++) { var key = ss.key(i), e = key && U.entryFor(key); if (e && e.storage === "session" && key.indexOf(SESSION_VAULT) !== 0) keys.push(key); }
        keys.forEach(function (key) { park[key] = ss.getItem(key); });
        if (keys.length) ss.setItem(SESSION_VAULT + from, JSON.stringify(park));
        keys.forEach(function (key) { ss.removeItem(key); });
        var back = null; try { back = JSON.parse(ss.getItem(SESSION_VAULT + to) || "null"); } catch (e2) { back = null; }
        if (isPlain(back)) Object.keys(back).forEach(function (key) { var e = U.entryFor(key); if (e && e.storage === "session" && typeof back[key] === "string") ss.setItem(key, back[key]); });
        ss.removeItem(SESSION_VAULT + to);
      } catch (e3) { /* drafts are best-effort; the profile swap itself must still happen */ }
    }
    function enterAccount(k, importRecords) {
      var U = UD(), a = active();
      if (a.kind === "account" && a.key === k) return false;
      if (a.kind === "account") leaveAccount(a.key);
      gen++;
      swapSession("anon", k);
      if (!writeJSON(VAULT_ANON, U.snapshotProfile())) throw Object.assign(new Error("vault"), { code: "STORAGE_WRITE_FAILED" });
      U.loadProfile(readJSON(vaultKey(k)) || {}, removeKey);
      if (importRecords && importRecords.length) U.applyRecords(importRecords);
      writeJSON(ACTIVE_KEY, { kind: "account", key: k, since: now() });
      return true;
    }
    function leaveAccount(k) {
      var U = UD();
      gen++;
      swapSession(k, "anon");
      if (!writeJSON(vaultKey(k), U.snapshotProfile())) throw Object.assign(new Error("vault"), { code: "STORAGE_WRITE_FAILED" });
      U.loadProfile(readJSON(VAULT_ANON) || {}, removeKey);
      removeKey(VAULT_ANON);
      writeJSON(ACTIVE_KEY, { kind: "anon", since: now() });
    }

    /* ───────── one sync pass ───────── */
    function localRecords(s) {
      var out = {};
      UD().collectAccountRecords({ includeSensitive: !!s.sensitive }).records.forEach(function (r) { out[keyOf(r)] = r; });
      return out;
    }
    var runningGen = -1;
    function syncOnce() {
      if (running && runningGen === gen) return running;
      var k = st.accountKey, rem = remote, myGen = gen;
      if (!k || !rem || active().kind !== "account" || active().key !== k) return Promise.resolve(status());
      set({ status: "syncing", errorCode: null });
      var U = UD(), s = syncState(k), conflicts = 0, pulledRev = s.lastServerRev || 0, applied = 0;
      /* every step re-checks that this pass still belongs to the live account */
      function alive() {
        if (myGen !== gen || st.accountKey !== k || remote !== rem || active().kind !== "account" || active().key !== k) throw Object.assign(new Error("aborted"), { code: "SYNC_ABORTED" });
      }
      /* apply server/merged results only over records that are still exactly what this pass read (no lost in-flight edits) */
      function stillAsRead(key, readRecord) {
        var cur = localRecords(s)[key];
        if (!cur && !readRecord) return true;
        return !!cur && !!readRecord && U.recordHash(cur) === U.recordHash(readRecord);
      }
      function changed(r) { var i = s.index[keyOf(r)]; return !i || i.h !== U.recordHash(r); }
      function remember(r, rev) { s.index[keyOf(r)] = { rev: rev, h: U.recordHash(r) }; }
      function pullAll(since, page, acc) {
        return rem.pull(since, 500).then(function (res) {
          alive();
          acc = acc.concat(Array.isArray(res.records) ? res.records : []);
          if (res.hasMore && page < MAX_PULL_PAGES) return pullAll(res.nextSince, page + 1, acc);
          pulledRev = Math.max(pulledRev, Number(res.nextSince) || 0);
          return acc;
        });
      }
      var p = pullAll(s.lastServerRev || 0, 1, []).then(function (incoming) {
        alive();
        var local = localRecords(s), toApply = [], toPush = {};
        incoming.forEach(function (r) {
          var key = keyOf(r), L = local[key], known = s.index[key];
          /* our own write coming back (the revision we already hold): nothing new — a pending local edit is pushed below */
          if (known && known.rev === r.serverRev) return;
          delete local[key];                               /* handled here; the local-changes pass below must not see it again */
          if (!L || !changed(L)) { toApply.push(r); remember(r, r.serverRev); return; }
          /* both sides changed since the last common revision (exact: revision + content hash, not device clocks) */
          var m = U.mergeCollection([L], [r], { lastSyncedAt: 0 });
          conflicts += m.conflicts.length;
          m.records.forEach(function (x) {
            toApply.push(x);
            if (keyOf(x) === key && U.recordHash(x) === U.recordHash(r)) remember(r, r.serverRev);
            else toPush[keyOf(x)] = Object.assign({}, x, { serverRev: keyOf(x) === key ? r.serverRev : null });
          });
        });
        applied += U.applyRecords(toApply).changed;
        /* calendar duplicates / repeated LIVON AI approvals created on different devices collapse into one (same survivor everywhere) */
        collapseDuplicates(s).forEach(function (x) { toPush[keyOf(x)] = x; applied++; });
        /* local changes the server has not seen */
        Object.keys(local).forEach(function (key) {
          var L = local[key];
          if (toPush[key] || !changed(L)) return;
          var idx = s.index[key];
          toPush[key] = Object.assign({}, L, { serverRev: idx ? idx.rev : null });
        });
        return push(Object.keys(toPush).map(function (x) { return toPush[x]; }), 1);
      }).then(function () {
        alive();
        s.lastServerRev = pulledRev; s.lastSyncAt = now();
        saveSyncState(k, s);
        var decided = s.importDecision != null;
        return rem.device({ deviceId: deviceId(), lastServerRev: pulledRev, conflicts: conflicts, importDecided: decided }).catch(function () {});
      }).then(function () {
        if (myGen !== gen) return status();
        set({ status: "synced", lastSyncAt: s.lastSyncAt, errorCode: null, changedSinceLoad: st.changedSinceLoad + applied }, applied ? "data-changed" : "synced");
        return status();
      }, function (e) {
        /* a pass that lost its account (sign-out / switch) or its session writes nothing and reports nothing */
        if (myGen !== gen || (e && e.code === "SYNC_ABORTED")) return status();
        if (e && e.code === "SESSION_CHANGED") { set({ status: "error", errorCode: "SESSION_CHANGED" }); return status(); }
        saveSyncState(k, s);    /* whatever was confirmed stays confirmed; local data is untouched by a failure */
        var off = (root.navigator && root.navigator.onLine === false) || (e && e.name === "TypeError");
        set({ status: off ? "offline" : "error", errorCode: (e && (e.serverCode || e.code)) || "SYNC_FAILED" });
        return status();
      }).then(function (x) { if (running === p) running = null; return x; });
      running = p; runningGen = myGen;
      return p;

      function push(list, round) {
        if (!list.length) return Promise.resolve();
        var chunks = [];
        for (var i = 0; i < list.length; i += PUSH_BATCH) chunks.push(list.slice(i, i + PUSH_BATCH));
        var retry = [];
        return chunks.reduce(function (p, chunk) {
          return p.then(function () {
            alive();
            return rem.batch(chunk.map(clean), { sensitive: !!s.sensitive }).then(function (res) {
              alive();
              var byKey = {}; chunk.forEach(function (r) { byKey[keyOf(r)] = r; });
              (res.results || []).forEach(function (x) {
                var r = byKey[x.collection + "|" + x.id];
                if (!r) return;
                if (x.status === "applied") { remember(r, x.serverRev); return; }
                if (x.status !== "conflict") return;               /* rejected (e.g. sensitive without consent): stays local */
                conflicts++;
                var C = x.current;
                if (!C) { retry.push(Object.assign({}, r, { serverRev: null })); return; }
                /* edited again on this device while the request was in flight: keep that edit, merge it next pass */
                if (!stillAsRead(keyOf(r), r)) return;
                var m = U.mergeCollection([Object.assign({}, r, { serverRev: undefined })], [C], { lastSyncedAt: 0 });
                applied += U.applyRecords(m.records).changed;
                m.records.forEach(function (y) {
                  if (keyOf(y) === keyOf(C) && U.recordHash(y) === U.recordHash(C)) remember(C, C.serverRev);
                  else retry.push(Object.assign({}, y, { serverRev: keyOf(y) === keyOf(C) ? C.serverRev : null }));
                });
              });
            });
          });
        }, Promise.resolve()).then(function () { return round < MAX_ROUNDS ? push(retry, round + 1) : undefined; });
      }
    }
    /* exact calendar duplicates and open LIVON AI tasks/goals with the same title: mergeCollection's rules applied across ids.
       Records are ordered by (createdAt, id) so every device keeps the same survivor; the others become tombstones. */
    function collapseDuplicates(s) {
      var U = UD(), t = now(), out = [];
      var recs = U.collectAccountRecords({ includeSensitive: !!s.sensitive }).records.filter(function (r) {
        return !r.deletedAt && (r.collection === "calendar_items" || r.collection === "tasks" || r.collection === "goals");
      });
      if (recs.length < 2) return out;
      recs.sort(function (a, b) { return (a.createdAt - b.createdAt) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); });
      var kept = {};
      U.mergeCollection(recs.map(function (r) { return Object.assign({}, r); }), [], {}).records.forEach(function (r) { kept[keyOf(r)] = r; });
      recs.forEach(function (r) {
        var k = keyOf(r), x = kept[k], i = s.index[k];
        if (!x) out.push({ id: r.id, collection: r.collection, schemaVersion: r.schemaVersion, createdAt: r.createdAt, updatedAt: t, deletedAt: t, localRev: 0, serverRev: i ? i.rev : null, data: null });
        else if (U.recordHash(x) !== U.recordHash(r)) out.push(Object.assign({}, x, { serverRev: i ? i.rev : null }));
      });
      if (out.length) U.applyRecords(out);
      return out;
    }
    function claimsOf(t) {
      try { var part = String(t).split(".")[1]; return part ? JSON.parse(b64url(part)) : null; } catch (e) { return null; }
    }
    function clean(r) { var o = {}; ["id", "collection", "schemaVersion", "createdAt", "updatedAt", "deletedAt", "localRev", "serverRev", "data"].forEach(function (f) { if (r[f] !== undefined) o[f] = r[f]; }); if (o.serverRev === undefined) o.serverRev = null; if (o.deletedAt) o.data = null; return o; }
    function deviceId() { var m = UD().meta(); return (m && typeof m.deviceId === "string" && /^dv_[a-z0-9]{6,24}$/.test(m.deviceId)) ? m.deviceId : "dv_unknown00"; }

    function schedule(ms) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { timer = null; syncOnce(); }, ms == null ? DEBOUNCE_MS : ms);
    }

    /* ───────── lifecycle ───────── */
    function onSignedIn(sess) {
      if (!sess || typeof sess.issuer !== "string" || typeof sess.subject !== "string") return Promise.resolve(status());
      var k = accountKey(sess), a = active();
      if (!session || session.issuer !== sess.issuer || session.subject !== sess.subject) gen++;
      session = sess;
      st.accountKey = k;
      remote = makeRemote(sess);
      if (!stopWrite) stopWrite = UD().onWrite(function () { if (active().kind === "account") schedule(); });
      if (a.kind === "account" && a.key === k) return syncOnce();          /* already this account's data (reload / reconnect) */
      if (a.kind === "account") { leaveAccount(a.key); onProfileChanged("switched"); }
      return serverReady().then(function (ready) {
        if (!ready) { set({ status: "unavailable", errorCode: "SYNC_NOT_AVAILABLE" }); return status(); }
        var s = syncState(k);
        if (s.importDecision == null) {
          var plan = UD().planLoginImport();
          var total = 0; [plan.counts, plan.sensitiveCounts].forEach(function (c) { Object.keys(c).forEach(function (x) { total += c[x]; }); });
          if (total > 0) { set({ status: "waiting-consent", pending: plan }, "consent-needed"); return status(); }
          s.importDecision = "nothing-to-import"; saveSyncState(k, s);
        }
        return startAccount(k, []);
      });
    }
    function startAccount(k, importRecords) {
      var swapped;
      /* storage full / blocked: nothing is swapped (the anonymous vault is written before anything else changes) */
      try { swapped = enterAccount(k, importRecords); }
      catch (e) { set({ status: "error", errorCode: (e && e.code) || "STORAGE_WRITE_FAILED" }); return Promise.resolve(status()); }
      return syncOnce().then(function (x) { if (swapped) onProfileChanged("signed-in"); return x; });
    }
    /* selection: { collections: [...], includeSensitive: boolean } — only what the user ticked is uploaded */
    function approveImport(selection) {
      if (st.status !== "waiting-consent" || !st.accountKey || !st.pending) return Promise.resolve({ status: "NOT_OFFERED" });
      selection = selection || {};
      var cols = Array.isArray(selection.collections) ? selection.collections : [];
      var sens = selection.includeSensitive === true;
      var U = UD(), allowed = Object.create(null);
      cols.forEach(function (c) { if (U.isCollection(c) && (sens || U.SENSITIVE_COLLECTIONS.indexOf(c) < 0)) allowed[c] = 1; });
      var recs = U.collectAccountRecords({ includeSensitive: sens }).records.filter(function (r) { return !r.deletedAt && allowed[r.collection]; });
      var k = st.accountKey, s = syncState(k);
      s.importDecision = "imported"; s.sensitive = sens; saveSyncState(k, s);
      set({ pending: null });
      return startAccount(k, recs).then(function (x) { return { status: "IMPORTED", selected: recs.length, sync: x.status }; });
    }
    function declineImport() {
      if (st.status !== "waiting-consent" || !st.accountKey) return Promise.resolve({ status: "NOT_OFFERED" });
      var k = st.accountKey, s = syncState(k);
      s.importDecision = "declined"; saveSyncState(k, s);
      set({ pending: null });
      return startAccount(k, []).then(function (x) { return { status: "DECLINED", sync: x.status }; });
    }
    /* sign-out: one bounded last sync, then the account's copy moves to its vault and this device's own data comes back */
    function onSignedOut(o) {
      o = o || {};
      var a = active(), k = a.kind === "account" ? a.key : null;
      var finalSync = (k && remote && o.finalSync !== false) ? Promise.race([syncOnce(), new Promise(function (r) { setTimeout(r, 4000); })]) : Promise.resolve();
      return finalSync.then(function () {
        if (timer) { clearTimeout(timer); timer = null; }
        if (stopWrite) { stopWrite(); stopWrite = null; }
        remote = null; session = null; gen++;
        set({ status: "idle", accountKey: null, pending: null, errorCode: null });
        if (!k) return { status: "SIGNED_OUT" };
        try { leaveAccount(k); }
        catch (e) { set({ status: "error", errorCode: (e && e.code) || "STORAGE_WRITE_FAILED" }); return { status: "SIGN_OUT_STORAGE_FAILED" }; }
        if (o.forgetAccountOnDevice === true) forgetAccount(k);
        if (o.reload !== false) onProfileChanged("signed-out");
        return { status: "SIGNED_OUT" };
      });
    }
    /* explicit user choice only: remove an account's cached copy + sync cursor from this device (server data stays) */
    function forgetAccount(k) { if (active().kind === "account" && active().key === k) return false; removeKey(vaultKey(k)); removeKey(stateKey(k)); return true; }
    function setSensitive(on) { if (!st.accountKey) return false; var s = syncState(st.accountKey); s.sensitive = on === true; saveSyncState(st.accountKey, s); schedule(0); return true; }

    return {
      STATUSES: STATUSES, status: status, subscribe: function (fn) { if (typeof fn !== "function") return function () {}; listeners.push(fn); return function () { listeners = listeners.filter(function (x) { return x !== fn; }); }; },
      onSignedIn: onSignedIn, onSignedOut: onSignedOut, approveImport: approveImport, declineImport: declineImport,
      syncNow: function () { return syncOnce(); }, forgetAccount: forgetAccount, setSensitive: setSensitive,
      activeProfile: active, accountKey: accountKey, _schedule: schedule,
      /* periodic pull (other devices' changes arrive without a local edit): only while signed in, visible and online */
      _tick: function () {
        var d = root.document;
        if (!st.accountKey || !remote || st.status === "syncing" || st.status === "waiting-consent" || st.status === "unavailable") return false;
        if (d && d.visibilityState && d.visibilityState !== "visible") return false;
        if (root.navigator && root.navigator.onLine === false) return false;
        syncOnce(); return true;
      }
    };
  }

  var engine = createEngine();
  engine.create = createEngine;
  root.LivonSync = engine;

  if (typeof root.setInterval === "function") { var tick = root.setInterval(function () { engine._tick(); }, PERIODIC_MS); if (tick && tick.unref) tick.unref(); }
  if (root.addEventListener) {
    root.addEventListener("online", function () { if (engine.status().signedIn) engine._schedule(500); });
    if (root.document && root.document.addEventListener) root.document.addEventListener("visibilitychange", function () {
      var s = engine.status();
      if (root.document.visibilityState === "visible" && s.signedIn && (!s.lastSyncAt || Date.now() - s.lastSyncAt > 60000)) engine._schedule(0);
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
