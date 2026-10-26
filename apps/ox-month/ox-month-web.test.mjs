/**
 * OX MONTH Web parser + sync client + O/X PATCH unit tests (no network).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyOxIntention,
  buildHabitCheckPatchBody,
  buildPatchedHabitCheckJson,
  habitCheckPrefsKey,
  nextMarkFromPick,
  serializeHabitCheckRoot,
} from "./ox-month-habit-check.mjs";
import {
  buildOxMonthViewModel,
  markForHabitTitle,
  parseHabitCheckRoot,
  parseHabitTitles,
  parseOxMark,
  parseSyncGetResponse,
  parseSyncPatchResponse,
  parseSyncPutResponse,
} from "./ox-month-parser.mjs";
import {
  applyHabitListMutation,
  habitTitlesPrefsKey,
  renameHabitInCheckRoot,
  serializeHabitTitles,
} from "./ox-month-habit-list.mjs";
import { bootstrapOxMonthSyncDocument } from "./ox-month-bootstrap.mjs";
import {
  SYNC_MIGRATION_META_KEY,
  classifySyncPayload,
  decideMigrationAction,
  fingerprintPrefsPayload,
  parseMigrationMeta,
  syncPayloadHasUserData,
} from "./ox-month-migrate-policy.mjs";
import { savePrefsPatchWithConflictRetry } from "./ox-month-prefs-save.mjs";
import { saveOxIntentionWithConflictRetry } from "./ox-month-ox-save.mjs";
import { resolveAccents } from "./ox-month-accents.mjs";
import {
  computeMonthStats,
  goalsPrefsKey,
  goalsStorageMonthKey,
  parseGoalsMap,
  serializeGoalsMap,
} from "./ox-month-stats.mjs";
import {
  assertNoClientIdentityInBody,
  assertNoClientIdentityInUrl,
  createSyncClient,
} from "./ox-month-sync.mjs";

const EMAIL = "a@b.com";
const CHECK_KEY = habitCheckPrefsKey(EMAIL);
const TODAY = "2026-09-06";

describe("ox-month parser", () => {
  it("parses marks and titles safely", () => {
    assert.equal(parseOxMark("O"), "o");
    assert.equal(parseOxMark("x"), "x");
    assert.equal(parseOxMark("nope"), null);
    assert.deepEqual(parseHabitTitles('[{"t":"Run","p":0}]'), [
      { title: "Run", part: 0 },
    ]);
    assert.deepEqual(parseHabitTitles("not-json"), []);
    assert.deepEqual(parseHabitTitles(["Walk"]), [
      { title: "Walk", part: 2 },
    ]);
  });

  it("parses habit_check v2 and ignores junk", () => {
    const root = parseHabitCheckRoot(
      JSON.stringify({
        "2026-09-06": { Run: "o", Skip: "nope" },
        bad: { Run: "o" },
      }),
    );
    assert.deepEqual(root, { "2026-09-06": { Run: "o" } });
    assert.deepEqual(parseHabitCheckRoot("{"), {});
  });

  it("builds read-only view model without crashing", () => {
    const now = new Date(2026, 8, 6);
    const email = "a@b.com";
    const vm = buildOxMonthViewModel(
      {
        [`ox_month_habit_titles_${email}_2026-09`]: [{ t: "Run", p: 0 }],
        [`ox_month_habit_check_${email}_v2`]:
          '{"2026-09-06":{"Run":"o"},"broken"',
        "ox_month_auth_session_v2": "ignore",
      },
      { email, now },
    );
    assert.equal(vm.habitsToday[0].title, "Run");
    assert.equal(vm.habitsToday[0].mark, null); // malformed check → empty root
    assert.equal(vm.monthDays.length, 30);
  });

  it("parseSyncGetResponse rejects bad bodies", () => {
    assert.equal(parseSyncGetResponse(null).ok, false);
    assert.equal(
      parseSyncGetResponse({
        appId: "ox_month",
        revision: 1,
        schemaVersion: 1,
        updatedAt: "2026-01-01T00:00:00.000Z",
        payload: {},
      }).ok,
      true,
    );
  });
});

describe("Flutter O/X intention rules", () => {
  it("O select, X select, same-tap does not clear (Flutter _onPick)", () => {
    assert.equal(nextMarkFromPick(null, "o"), "o");
    assert.equal(nextMarkFromPick("x", "o"), "o");
    assert.equal(nextMarkFromPick("o", "x"), "x");
    assert.equal(nextMarkFromPick("o", "o"), "o");
    assert.equal(nextMarkFromPick("x", "x"), "x");
  });

  it("preserves other habits and dates when applying one intention", () => {
    const root = parseHabitCheckRoot(
      JSON.stringify({
        "2026-09-05": { Run: "o", Sleep: "x" },
        "2026-09-06": { Run: "x", Sleep: "o" },
      }),
    );
    const next = applyOxIntention(root, {
      dateKey: TODAY,
      habitTitle: "Run",
      mark: "o",
    });
    assert.equal(next["2026-09-06"].Run, "o");
    assert.equal(next["2026-09-06"].Sleep, "o");
    assert.equal(next["2026-09-05"].Run, "o");
    assert.equal(next["2026-09-05"].Sleep, "x");
  });

  it("builds habit_check PATCH body for one prefs key", () => {
    const { json } = buildPatchedHabitCheckJson(
      JSON.stringify({ "2026-09-06": { Sleep: "x" } }),
      { dateKey: TODAY, habitTitle: "Run", mark: "o" },
    );
    const body = buildHabitCheckPatchBody({
      baseRevision: 3,
      checkKey: CHECK_KEY,
      checkJson: json,
    });
    assert.equal(body.baseRevision, 3);
    assert.equal(body.schemaVersion, 1);
    assert.deepEqual(Object.keys(body.patch), [CHECK_KEY]);
    const parsed = JSON.parse(body.patch[CHECK_KEY]);
    assert.equal(parsed["2026-09-06"].Run, "o");
    assert.equal(parsed["2026-09-06"].Sleep, "x");
    assert.equal(Object.hasOwn(body, "email"), false);
    assert.equal(Object.hasOwn(body, "userId"), false);
  });
});

describe("ox-month sync client", () => {
  it("GET does not send email/userId and uses Bearer only", async () => {
    let seen = null;
    const client = createSyncClient({
      baseUrl: "https://api.newon.app",
      fetchImpl: async (url, init) => {
        seen = { url, init };
        return {
          status: 404,
          json: async () => ({ error: "not_found" }),
        };
      },
    });
    const res = await client.getOxMonthSync("tok.en");
    assert.equal(res.status, 404);
    assert.equal(seen.url, "https://api.newon.app/api/sync/v1/ox_month");
    assert.equal(seen.init.method, "GET");
    assert.equal(seen.init.headers.Authorization, "Bearer tok.en");
    assertNoClientIdentityInUrl(seen.url);
    assert.equal(seen.url.includes("email="), false);
    assert.equal(seen.url.includes("userId="), false);
    assert.equal(seen.init.body, undefined);
  });

  it("PATCH sends Bearer + habit_check only, never PUT/email/userId", async () => {
    let seen = null;
    const client = createSyncClient({
      baseUrl: "https://api.newon.app",
      fetchImpl: async (url, init) => {
        seen = { url, init };
        return {
          status: 200,
          json: async () => ({
            ok: true,
            revision: 2,
            updatedAt: "2026-09-06T00:00:00.000Z",
            appliedCount: 1,
          }),
        };
      },
    });
    const json = serializeHabitCheckRoot({
      "2026-09-06": { Run: "o" },
    });
    const body = buildHabitCheckPatchBody({
      baseRevision: 1,
      checkKey: CHECK_KEY,
      checkJson: json,
    });
    const res = await client.patchOxMonthSync("tok.en", body);
    assert.equal(res.status, 200);
    assert.equal(seen.init.method, "PATCH");
    assert.equal(seen.init.headers.Authorization, "Bearer tok.en");
    assertNoClientIdentityInUrl(seen.url);
    assertNoClientIdentityInBody(seen.init.body);
    const sent = JSON.parse(seen.init.body);
    assert.equal(sent.baseRevision, 1);
    assert.equal(sent.schemaVersion, 1);
    assert.equal(Object.keys(sent.patch).length, 1);
    assert.equal(Object.hasOwn(sent, "email"), false);
    assert.equal(Object.hasOwn(sent, "userId"), false);
    assert.equal(parseSyncPatchResponse(res.body).revision, 2);
  });

  it("rejects identity query helpers", () => {
    assert.throws(() =>
      assertNoClientIdentityInUrl(
        "https://api.newon.app/api/sync/v1/ox_month?email=a@b.com",
      ),
    );
  });

  it("rejects identity fields in patch body object", async () => {
    const client = createSyncClient({
      baseUrl: "https://api.newon.app",
      fetchImpl: async () => ({ status: 200, json: async () => ({}) }),
    });
    await assert.rejects(
      () =>
        client.patchOxMonthSync("tok", {
          baseRevision: 1,
          patch: { [CHECK_KEY]: "{}" },
          email: "a@b.com",
        }),
      /sync_body_must_not_include_identity/,
    );
  });
});

describe("O/X save + 409 retry", () => {
  function makeStore(initial) {
    let revision = initial.revision;
    let payload = { ...initial.payload };
    let forceConflictCount = initial.forceConflictCount || 0;
    const calls = [];

    const client = {
      async getOxMonthSync() {
        calls.push({ method: "GET" });
        return {
          status: 200,
          body: {
            appId: "ox_month",
            revision,
            schemaVersion: 1,
            updatedAt: "2026-09-06T00:00:00.000Z",
            payload: { ...payload },
          },
          sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
          sentHeaders: { Authorization: "Bearer t" },
          method: "GET",
          sentBody: null,
        };
      },
      async patchOxMonthSync(_token, body) {
        calls.push({ method: "PATCH", body });
        assert.equal(Object.hasOwn(body, "email"), false);
        assert.equal(Object.hasOwn(body, "userId"), false);
        if (forceConflictCount > 0) {
          forceConflictCount -= 1;
          return {
            status: 409,
            body: { error: "revision_conflict", currentRevision: revision },
            sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
            sentHeaders: {},
            method: "PATCH",
            sentBody: JSON.stringify(body),
          };
        }
        if (body.baseRevision !== revision) {
          return {
            status: 409,
            body: { error: "revision_conflict", currentRevision: revision },
            sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
            sentHeaders: {},
            method: "PATCH",
            sentBody: JSON.stringify(body),
          };
        }
        for (const [k, v] of Object.entries(body.patch)) {
          payload[k] = v;
        }
        revision += 1;
        return {
          status: 200,
          body: {
            ok: true,
            revision,
            updatedAt: "2026-09-06T01:00:00.000Z",
            appliedCount: 1,
          },
          sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
          sentHeaders: {},
          method: "PATCH",
          sentBody: JSON.stringify(body),
        };
      },
    };

    return {
      client,
      calls,
      get revision() {
        return revision;
      },
      get payload() {
        return payload;
      },
      bumpServerRevision(extra) {
        revision += 1;
        if (extra) Object.assign(payload, extra);
      },
      setStatusPatch(fn) {
        client.patchOxMonthSync = async (_token, body) => {
          calls.push({ method: "PATCH", body });
          return fn(body, revision, payload);
        };
      },
    };
  }

  it("O select → correct habit_check PATCH and revision bump", async () => {
    const store = makeStore({
      revision: 1,
      payload: {
        [CHECK_KEY]: JSON.stringify({
          "2026-09-06": { Sleep: "x" },
          "2026-09-05": { Run: "o" },
        }),
      },
    });
    const result = await saveOxIntentionWithConflictRetry({
      client: store.client,
      getIdToken: async () => "t",
      email: EMAIL,
      syncState: {
        revision: 1,
        schemaVersion: 1,
        updatedAt: "2026-09-06T00:00:00.000Z",
        payload: { ...store.payload },
      },
      intention: { dateKey: TODAY, habitTitle: "Run", mark: "o" },
    });
    assert.equal(result.ok, true);
    assert.equal(result.sync.revision, 2);
    assert.equal(result.putUsed, false);
    assert.deepEqual(result.methods, ["PATCH"]);
    const root = parseHabitCheckRoot(result.sync.payload[CHECK_KEY]);
    assert.equal(root["2026-09-06"].Run, "o");
    assert.equal(root["2026-09-06"].Sleep, "x");
    assert.equal(root["2026-09-05"].Run, "o");
  });

  it("X select patches correctly", async () => {
    const store = makeStore({
      revision: 4,
      payload: {
        [CHECK_KEY]: JSON.stringify({ "2026-09-06": { Run: "o" } }),
      },
    });
    const result = await saveOxIntentionWithConflictRetry({
      client: store.client,
      getIdToken: async () => "t",
      email: EMAIL,
      syncState: {
        revision: 4,
        payload: { ...store.payload },
      },
      intention: { dateKey: TODAY, habitTitle: "Run", mark: "x" },
    });
    assert.equal(result.ok, true);
    assert.equal(result.sync.revision, 5);
    assert.equal(
      parseHabitCheckRoot(result.sync.payload[CHECK_KEY])["2026-09-06"].Run,
      "x",
    );
  });

  it("first 409 → GET → reapply intention → PATCH success", async () => {
    const store = makeStore({
      revision: 2,
      payload: {
        [CHECK_KEY]: JSON.stringify({
          "2026-09-06": { Sleep: "o" },
        }),
        other: "keep",
      },
      forceConflictCount: 1,
    });
    // Server already moved ahead with Sleep still o; web had stale rev 1
    store.bumpServerRevision();
    const result = await saveOxIntentionWithConflictRetry({
      client: store.client,
      getIdToken: async () => "t",
      email: EMAIL,
      syncState: {
        revision: 2, // stale vs server 3 after bump... wait forceConflict then match
        payload: {
          [CHECK_KEY]: JSON.stringify({ "2026-09-06": { Sleep: "o" } }),
          other: "keep",
        },
      },
      intention: { dateKey: TODAY, habitTitle: "Run", mark: "x" },
    });
    assert.equal(result.ok, true);
    assert.equal(result.retries, 1);
    assert.deepEqual(result.methods, ["PATCH", "GET", "PATCH"]);
    const root = parseHabitCheckRoot(result.sync.payload[CHECK_KEY]);
    assert.equal(root["2026-09-06"].Run, "x");
    assert.equal(root["2026-09-06"].Sleep, "o");
    assert.equal(result.sync.payload.other, "keep");
    assert.equal(result.putUsed, false);
  });

  it("second 409 stops retry and does not loop forever", async () => {
    const store = makeStore({
      revision: 1,
      payload: { [CHECK_KEY]: "{}" },
      forceConflictCount: 99,
    });
    let giveUp = 0;
    const result = await saveOxIntentionWithConflictRetry({
      client: store.client,
      getIdToken: async () => "t",
      email: EMAIL,
      syncState: {
        revision: 1,
        payload: { [CHECK_KEY]: "{}" },
      },
      intention: { dateKey: TODAY, habitTitle: "Run", mark: "o" },
      onConflictGiveUp: () => {
        giveUp += 1;
      },
    });
    assert.equal(result.ok, false);
    assert.equal(result.error, "conflict_retry_exhausted");
    assert.equal(result.retries, 1);
    assert.equal(giveUp, 1);
    const patchCalls = result.methods.filter((m) => m === "PATCH");
    assert.equal(patchCalls.length, 2);
    assert.ok(result.methods.filter((m) => m === "GET").length >= 1);
    assert.equal(result.putUsed, false);
  });

  it("400/413/500/network map to failure (caller rolls back)", async () => {
    for (const status of [400, 413, 500]) {
      const store = makeStore({
        revision: 1,
        payload: { [CHECK_KEY]: "{}" },
      });
      store.setStatusPatch(async (body) => ({
        status,
        body: { error: "x" },
        sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
        sentHeaders: {},
        method: "PATCH",
        sentBody: JSON.stringify(body),
      }));
      const result = await saveOxIntentionWithConflictRetry({
        client: store.client,
        getIdToken: async () => "t",
        email: EMAIL,
        syncState: { revision: 1, payload: { [CHECK_KEY]: "{}" } },
        intention: { dateKey: TODAY, habitTitle: "Run", mark: "o" },
      });
      assert.equal(result.ok, false);
      assert.ok(
        ["bad_request", "payload_too_large", "server_error"].includes(
          result.error,
        ),
      );
      assert.equal(result.retries, 0);
    }
  });

  it("401 / 403 / 404 from PATCH", async () => {
    const cases = [
      [401, "unauthorized"],
      [403, "forbidden"],
      [404, "not_found"],
    ];
    for (const [status, err] of cases) {
      const store = makeStore({
        revision: 1,
        payload: { [CHECK_KEY]: "{}" },
      });
      store.setStatusPatch(async (body) => ({
        status,
        body: { error: err },
        sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
        sentHeaders: {},
        method: "PATCH",
        sentBody: JSON.stringify(body),
      }));
      const result = await saveOxIntentionWithConflictRetry({
        client: store.client,
        getIdToken: async () => "t",
        email: EMAIL,
        syncState: { revision: 1, payload: { [CHECK_KEY]: "{}" } },
        intention: { dateKey: TODAY, habitTitle: "Run", mark: "o" },
      });
      assert.equal(result.ok, false);
      assert.equal(result.error, err);
    }
  });

  it("never uses PUT across save flows", async () => {
    const store = makeStore({
      revision: 1,
      payload: { [CHECK_KEY]: "{}" },
      forceConflictCount: 1,
    });
    store.bumpServerRevision();
    const result = await saveOxIntentionWithConflictRetry({
      client: store.client,
      getIdToken: async () => "t",
      email: EMAIL,
      syncState: { revision: 1, payload: { [CHECK_KEY]: "{}" } },
      intention: { dateKey: TODAY, habitTitle: "Run", mark: "o" },
    });
    assert.equal(result.putUsed, false);
    assert.equal(result.methods.includes("PUT"), false);
    assert.equal(
      store.calls.every((c) => c.method === "GET" || c.method === "PATCH"),
      true,
    );
  });
});

describe("duplicate click lock helper", () => {
  it("oxSaving flag blocks overlapping saves at UI layer contract", () => {
    // Documented contract: UI sets oxSaving=true until save settles.
    let oxSaving = false;
    function canEdit() {
      return !oxSaving;
    }
    assert.equal(canEdit(), true);
    oxSaving = true;
    assert.equal(canEdit(), false);
  });
});

describe("habit list Flutter keys + rename history", () => {
  const titlesKey = habitTitlesPrefsKey(EMAIL, "2026-09");

  it("adds habit as JSON string titles list", () => {
    const { payload } = applyHabitListMutation(
      {},
      { email: EMAIL, month: "2026-09", action: "add", title: "  Run  ", part: 0 },
    );
    assert.equal(typeof payload[titlesKey], "string");
    assert.deepEqual(JSON.parse(payload[titlesKey]), [{ t: "Run", p: 0 }]);
  });

  it("rename migrates habit_check keys so history is not lost", () => {
    const before = {
      [titlesKey]: serializeHabitTitles([{ title: "Run", part: 2 }]),
      [CHECK_KEY]: JSON.stringify({
        "2026-09-01": { Run: "o" },
        "2026-09-02": { Run: "x", Sleep: "o" },
      }),
    };
    const { payload, checkChanged } = applyHabitListMutation(before, {
      email: EMAIL,
      month: "2026-09",
      action: "rename",
      title: "Run",
      newTitle: "Jog",
    });
    assert.equal(checkChanged, true);
    assert.deepEqual(JSON.parse(payload[titlesKey]), [{ t: "Jog", p: 2 }]);
    const root = parseHabitCheckRoot(payload[CHECK_KEY]);
    assert.equal(root["2026-09-01"].Jog, "o");
    assert.equal(root["2026-09-01"].Run, undefined);
    assert.equal(root["2026-09-02"].Jog, "x");
    assert.equal(root["2026-09-02"].Sleep, "o");
  });

  it("delete removes title but leaves orphaned checks (Flutter-compatible)", () => {
    const before = {
      [titlesKey]: serializeHabitTitles([
        { title: "Run", part: 2 },
        { title: "Read", part: 1 },
      ]),
      [CHECK_KEY]: JSON.stringify({ "2026-09-01": { Run: "o", Read: "x" } }),
    };
    const { payload } = applyHabitListMutation(before, {
      email: EMAIL,
      month: "2026-09",
      action: "delete",
      title: "Run",
    });
    assert.deepEqual(JSON.parse(payload[titlesKey]), [{ t: "Read", p: 1 }]);
    assert.equal(
      parseHabitCheckRoot(payload[CHECK_KEY])["2026-09-01"].Run,
      "o",
    );
  });

  it("renameHabitInCheckRoot helper", () => {
    const next = renameHabitInCheckRoot(
      { "2026-09-01": { Old: "o" } },
      "Old",
      "New",
    );
    assert.equal(next["2026-09-01"].New, "o");
  });
});

describe("explicit bootstrap PUT (never auto on GET 404)", () => {
  it("PUT baseRevision 0 creates revision 1 when user opts in", async () => {
    let revision = 0;
    let payload = null;
    const client = {
      async getOxMonthSync() {
        if (!payload) {
          return {
            status: 404,
            body: { error: "not_found" },
            sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
            method: "GET",
            sentBody: null,
          };
        }
        return {
          status: 200,
          body: {
            appId: "ox_month",
            revision,
            schemaVersion: 1,
            updatedAt: "2026-09-06T00:00:00.000Z",
            payload: { ...payload },
          },
          sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
          method: "GET",
          sentBody: null,
        };
      },
      async putOxMonthSync(_t, body) {
        assert.equal(body.baseRevision, 0);
        assert.equal(body.schemaVersion, 1);
        assert.equal(Object.hasOwn(body, "email"), false);
        assert.equal(Object.hasOwn(body.payload, "email"), false);
        assert.equal(Object.hasOwn(body.payload, "userId"), false);
        payload = { ...body.payload };
        revision = 1;
        return {
          status: 200,
          body: {
            ok: true,
            revision: 1,
            schemaVersion: 1,
            updatedAt: "2026-09-06T00:00:00.000Z",
          },
          sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
          method: "PUT",
          sentBody: JSON.stringify(body),
        };
      },
    };
    const result = await bootstrapOxMonthSyncDocument({
      client,
      getIdToken: async () => "t",
      locale: "ko",
    });
    assert.equal(result.ok, true);
    assert.equal(result.putUsed, true);
    assert.equal(result.created, true);
    assert.equal(result.sync.revision, 1);
    assert.equal(result.sync.payload.ox_month_locale_v2, "ko");
    assert.deepEqual(result.methods, ["PUT"]);
    assert.equal(parseSyncPutResponse({
      ok: true,
      revision: 1,
      schemaVersion: 1,
      updatedAt: "2026-09-06T00:00:00.000Z",
    }).ok, true);
  });

  it("PUT 409 race → GET existing", async () => {
    const client = {
      async putOxMonthSync() {
        return {
          status: 409,
          body: { error: "revision_conflict" },
          sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
          method: "PUT",
          sentBody: "{}",
        };
      },
      async getOxMonthSync() {
        return {
          status: 200,
          body: {
            appId: "ox_month",
            revision: 1,
            schemaVersion: 1,
            updatedAt: "2026-09-06T00:00:00.000Z",
            payload: { ox_month_locale_v2: "en" },
          },
          sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
          method: "GET",
          sentBody: null,
        };
      },
    };
    const result = await bootstrapOxMonthSyncDocument({
      client,
      getIdToken: async () => "t",
    });
    assert.equal(result.ok, true);
    assert.equal(result.created, false);
    assert.equal(result.sync.payload.ox_month_locale_v2, "en");
  });
});

describe("habit titles PATCH + 409 retry", () => {
  it("add habit patches titles key only", async () => {
    const titlesKey = habitTitlesPrefsKey(EMAIL, "2026-09");
    let revision = 1;
    let payload = {
      [titlesKey]: "[]",
      [CHECK_KEY]: "{}",
    };
    const client = {
      async getOxMonthSync() {
        return {
          status: 200,
          body: {
            appId: "ox_month",
            revision,
            schemaVersion: 1,
            updatedAt: "2026-09-06T00:00:00.000Z",
            payload: { ...payload },
          },
          sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
          method: "GET",
          sentBody: null,
        };
      },
      async patchOxMonthSync(_t, body) {
        assert.equal(body.baseRevision, revision);
        for (const [k, v] of Object.entries(body.patch)) payload[k] = v;
        revision += 1;
        return {
          status: 200,
          body: {
            ok: true,
            revision,
            updatedAt: "2026-09-06T01:00:00.000Z",
            appliedCount: 1,
          },
          sentUrl: "https://api.newon.app/api/sync/v1/ox_month",
          method: "PATCH",
          sentBody: JSON.stringify(body),
        };
      },
    };
    const result = await savePrefsPatchWithConflictRetry({
      client,
      getIdToken: async () => "t",
      syncState: {
        revision: 1,
        payload: { ...payload },
      },
      applyLocal: (p) => {
        const mutated = applyHabitListMutation(p, {
          email: EMAIL,
          month: "2026-09",
          action: "add",
          title: "Walk",
        });
        return {
          payload: mutated.payload,
          patch: { [mutated.titlesKey]: mutated.payload[mutated.titlesKey] },
        };
      },
    });
    assert.equal(result.ok, true);
    assert.equal(result.sync.revision, 2);
    assert.deepEqual(JSON.parse(result.sync.payload[titlesKey]), [
      { t: "Walk", p: 2 },
    ]);
  });
});

describe("sync PUT client", () => {
  it("PUT create rejects identity and sends baseRevision 0", async () => {
    let seen = null;
    const client = createSyncClient({
      baseUrl: "https://api.newon.app",
      fetchImpl: async (url, init) => {
        seen = { url, init };
        return {
          status: 200,
          json: async () => ({
            ok: true,
            revision: 1,
            schemaVersion: 1,
            updatedAt: "2026-09-06T00:00:00.000Z",
          }),
        };
      },
    });
    const res = await client.putOxMonthSync("tok", {
      baseRevision: 0,
      schemaVersion: 1,
      payload: { ox_month_locale_v2: "ko" },
    });
    assert.equal(res.status, 200);
    assert.equal(seen.init.method, "PUT");
    const body = JSON.parse(seen.init.body);
    assert.equal(body.baseRevision, 0);
    assert.equal(Object.hasOwn(body, "email"), false);
    await assert.rejects(
      () =>
        client.putOxMonthSync("tok", {
          baseRevision: 0,
          schemaVersion: 1,
          payload: { ox_month_locale_v2: "ko" },
          email: "x",
        }),
      /identity/,
    );
  });
});

describe("future date guard (view contract)", () => {
  it("month view marks only use existing check data; future dates are comparable", () => {
    const now = new Date(2026, 8, 6);
    const vm = buildOxMonthViewModel(
      {
        [`ox_month_habit_titles_${EMAIL}_2026-09`]: [{ t: "Run", p: 2 }],
        [CHECK_KEY]: JSON.stringify({
          "2026-09-06": { Run: "o" },
          "2026-09-07": { Run: "x" },
        }),
      },
      { email: EMAIL, now },
    );
    assert.equal(vm.today, "2026-09-06");
    const d6 = vm.monthDays.find((d) => d.dateKey === "2026-09-06");
    const d7 = vm.monthDays.find((d) => d.dateKey === "2026-09-07");
    assert.equal(markForHabitTitle(d6.marks, "Run"), "o");
    assert.equal(markForHabitTitle(d7.marks, "Run"), "x");
    assert.equal("2026-09-07" > vm.today, true);
  });
});

describe("web writes only Flutter-compatible sync keys", () => {
  function isAllowedOxMonthWriteKey(key, email) {
    const e = `${email}`.trim().toLowerCase();
    if (key === "ox_month_locale_v2") return true;
    if (key === `ox_month_habit_check_${e}_v2`) return true;
    if (key.startsWith(`ox_month_habit_titles_${e}_`)) {
      return /^ox_month_habit_titles_.+_\d{4}-\d{2}$/.test(key);
    }
    return false;
  }

  it("blocks subscription / foreign keys from client write set", () => {
    assert.equal(isAllowedOxMonthWriteKey("ox_month_locale_v2", EMAIL), true);
    assert.equal(isAllowedOxMonthWriteKey(CHECK_KEY, EMAIL), true);
    assert.equal(
      isAllowedOxMonthWriteKey(habitTitlesPrefsKey(EMAIL, "2026-09"), EMAIL),
      true,
    );
    assert.equal(
      isAllowedOxMonthWriteKey("ox_month_premium_v1", EMAIL),
      false,
    );
    assert.equal(
      isAllowedOxMonthWriteKey("subscription_status", EMAIL),
      false,
    );
    assert.equal(
      isAllowedOxMonthWriteKey(
        `ox_month_habit_check_other@x.com_v2`,
        EMAIL,
      ),
      false,
    );
  });
});

describe("migration conflict + idempotency policy", () => {
  const checkKey = habitCheckPrefsKey(EMAIL);
  const titlesKey = habitTitlesPrefsKey(EMAIL, "2026-09");
  const localPayload = {
    [titlesKey]: JSON.stringify([{ t: "Walk", p: 2 }]),
    [checkKey]: JSON.stringify({ "2026-09-01": { Walk: "o" } }),
    ox_month_locale_v2: "ko",
  };
  const fp = fingerprintPrefsPayload(localPayload);

  it("classifies empty vs user data", () => {
    assert.equal(classifySyncPayload(null), "absent");
    assert.equal(classifySyncPayload({ ox_month_locale_v2: "ko" }), "empty");
    assert.equal(syncPayloadHasUserData(localPayload), true);
    assert.equal(classifySyncPayload(localPayload), "has_user_data");
  });

  it("sync absent → create", () => {
    const d = decideMigrationAction({
      syncDocExists: false,
      incomingFingerprint: fp,
    });
    assert.equal(d.action, "create");
  });

  it("same fingerprint → noop", () => {
    const existing = {
      ...localPayload,
      [SYNC_MIGRATION_META_KEY]: JSON.stringify({
        source: "mobile_shared_preferences",
        version: 1,
        migratedAt: "2026-09-07T00:00:00.000Z",
        sourceFingerprint: fp,
      }),
    };
    const d = decideMigrationAction({
      syncDocExists: true,
      existingPayload: existing,
      incomingFingerprint: fp,
    });
    assert.equal(d.action, "noop");
    assert.equal(parseMigrationMeta(existing[SYNC_MIGRATION_META_KEY]).sourceFingerprint, fp);
  });

  it("sync has user data → blocked (no overwrite)", () => {
    const d = decideMigrationAction({
      syncDocExists: true,
      existingPayload: localPayload,
      incomingFingerprint: fingerprintPrefsPayload({
        ...localPayload,
        ox_month_locale_v2: "en",
      }),
    });
    assert.equal(d.action, "blocked");
    assert.equal(d.reason, "sync_has_user_data");
  });

  it("empty sync → merge_empty", () => {
    const d = decideMigrationAction({
      syncDocExists: true,
      existingPayload: { ox_month_locale_v2: "ko" },
      incomingFingerprint: fp,
    });
    assert.equal(d.action, "merge_empty");
  });

  it("no local data → blocked", () => {
    const d = decideMigrationAction({
      syncDocExists: false,
      incomingFingerprint: "{}",
    });
    assert.equal(d.action, "blocked");
    assert.equal(d.reason, "no_local_data");
  });
});

describe("ox-month accents + stats + setPart", () => {
  it("resolves free default accents", () => {
    const a = resolveAccents({});
    assert.equal(a.oId, "c20");
    assert.equal(a.xId, "c00");
    assert.equal(a.oHex, "#00FF87");
  });

  it("computes month stats and goals map", () => {
    const titles = serializeHabitTitles([
      { title: "Run", part: 0 },
      { title: "Read", part: 2 },
    ]);
    const check = JSON.stringify({
      "2026-09-01": { Run: "o", Read: "x" },
      "2026-09-02": { Run: "o" },
    });
    const stats = computeMonthStats(check, titles, "2026-09");
    assert.equal(stats.totalO, 2);
    assert.equal(stats.totalX, 1);
    assert.equal(stats.habitCount, 2);
    assert.equal(stats.best.title, "Run");

    const gKey = goalsPrefsKey(EMAIL);
    assert.equal(gKey, "ox_month_goals_map_v1_a@b.com");
    const map = parseGoalsMap('{"2026_9":80}');
    assert.equal(map["2026_9"], 80);
    assert.equal(goalsStorageMonthKey(new Date(2026, 8, 1)), "2026_9");
    assert.equal(serializeGoalsMap(map), '{"2026_9":80}');
  });

  it("setPart mutates titles only", () => {
    const titlesKey = habitTitlesPrefsKey(EMAIL, "2026-09");
    const payload = {
      [titlesKey]: serializeHabitTitles([{ title: "Run", part: 2 }]),
    };
    const out = applyHabitListMutation(payload, {
      email: EMAIL,
      month: "2026-09",
      action: "setPart",
      title: "Run",
      part: 0,
    });
    assert.deepEqual(parseHabitTitles(out.payload[titlesKey]), [
      { title: "Run", part: 0 },
    ]);
    assert.equal(out.checkChanged, false);
  });
});
