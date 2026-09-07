/**
 * Generic prefs PATCH save with one-shot 409 retry.
 * Used for habit titles (+ optional habit_check rename migration).
 */

import {
  parseSyncGetResponse,
  parseSyncPatchResponse,
} from "./ox-month-parser.mjs";
import {
  assertNoClientIdentityInBody,
  assertNoClientIdentityInUrl,
} from "./ox-month-sync.mjs";

/**
 * @param {object} args
 * @param {{ getOxMonthSync: Function, patchOxMonthSync: Function }} args.client
 * @param {() => Promise<string>} args.getIdToken
 * @param {{ revision: number, schemaVersion?: number, updatedAt?: string, payload: Record<string, unknown> }} args.syncState
 * @param {(payload: Record<string, unknown>) => {
 *   payload: Record<string, unknown>,
 *   patch: Record<string, string|null>,
 * }} args.applyLocal
 */
export async function savePrefsPatchWithConflictRetry(args) {
  const client = args.client;
  /** @type {{ revision: number, schemaVersion: number, updatedAt: string, payload: Record<string, unknown> }} */
  let sync = {
    revision: args.syncState.revision,
    schemaVersion: args.syncState.schemaVersion || 1,
    updatedAt: args.syncState.updatedAt || "",
    payload: { ...(args.syncState.payload || {}) },
  };
  const methods = [];

  async function token() {
    return args.getIdToken();
  }

  async function doGet() {
    const idToken = await token();
    const result = await client.getOxMonthSync(idToken);
    methods.push(result.method || "GET");
    assertNoClientIdentityInUrl(result.sentUrl || "");
    return result;
  }

  async function doPatch(baseRevision, patch) {
    const idToken = await token();
    const body = {
      baseRevision,
      schemaVersion: 1,
      patch,
    };
    if (
      Object.prototype.hasOwnProperty.call(body, "email") ||
      Object.prototype.hasOwnProperty.call(body, "userId")
    ) {
      throw new Error("sync_body_must_not_include_identity");
    }
    const result = await client.patchOxMonthSync(idToken, body);
    methods.push(result.method || "PATCH");
    assertNoClientIdentityInUrl(result.sentUrl || "");
    assertNoClientIdentityInBody(result.sentBody);
    return result;
  }

  function ingestGet(result) {
    if (result.status === 401) return { kind: "unauthorized" };
    if (result.status === 403) return { kind: "forbidden" };
    if (result.status === 404) return { kind: "not_found" };
    if (result.status >= 500 || result.status === 0) {
      return { kind: "server_error" };
    }
    const parsed = parseSyncGetResponse(result.body);
    if (!parsed.ok) return { kind: "parse_error" };
    sync = {
      revision: parsed.revision,
      schemaVersion: parsed.schemaVersion,
      updatedAt: parsed.updatedAt,
      payload: { ...parsed.payload },
    };
    return { kind: "ok" };
  }

  function mapPatchFailure(status) {
    if (status === 401) return "unauthorized";
    if (status === 403) return "forbidden";
    if (status === 404) return "not_found";
    if (status === 400) return "bad_request";
    if (status === 413) return "payload_too_large";
    if (status === 409) return "conflict";
    if (status >= 500 || status === 0) return "server_error";
    return "save_failed";
  }

  let local;
  try {
    local = args.applyLocal(sync.payload);
  } catch (err) {
    return {
      ok: false,
      error:
        err && typeof err.message === "string" ? err.message : "bad_request",
      sync,
      methods,
      putUsed: false,
      retries: 0,
    };
  }

  let patchResult;
  try {
    patchResult = await doPatch(sync.revision, local.patch);
  } catch {
    return {
      ok: false,
      error: "network",
      sync,
      methods,
      putUsed: false,
      retries: 0,
    };
  }

  if (patchResult.status === 200) {
    const parsed = parseSyncPatchResponse(patchResult.body);
    if (!parsed.ok) {
      return {
        ok: false,
        error: "parse_error",
        sync,
        methods,
        putUsed: false,
        retries: 0,
      };
    }
    sync = {
      ...sync,
      revision: parsed.revision,
      updatedAt: parsed.updatedAt,
      payload: local.payload,
    };
    return {
      ok: true,
      sync,
      methods,
      putUsed: false,
      retries: 0,
      appliedCount: parsed.appliedCount,
    };
  }

  if (patchResult.status !== 409) {
    return {
      ok: false,
      error: mapPatchFailure(patchResult.status),
      sync,
      methods,
      putUsed: false,
      retries: 0,
    };
  }

  let getResult;
  try {
    getResult = await doGet();
  } catch {
    return {
      ok: false,
      error: "network",
      sync,
      methods,
      putUsed: false,
      retries: 0,
    };
  }
  const got = ingestGet(getResult);
  if (got.kind !== "ok") {
    return {
      ok: false,
      error: got.kind,
      sync,
      methods,
      putUsed: false,
      retries: 0,
    };
  }

  try {
    local = args.applyLocal(sync.payload);
  } catch (err) {
    return {
      ok: false,
      error:
        err && typeof err.message === "string" ? err.message : "bad_request",
      sync,
      methods,
      putUsed: false,
      retries: 1,
    };
  }

  let patch2;
  try {
    patch2 = await doPatch(sync.revision, local.patch);
  } catch {
    return {
      ok: false,
      error: "network",
      sync,
      methods,
      putUsed: false,
      retries: 1,
    };
  }

  if (patch2.status === 200) {
    const parsed = parseSyncPatchResponse(patch2.body);
    if (!parsed.ok) {
      return {
        ok: false,
        error: "parse_error",
        sync,
        methods,
        putUsed: false,
        retries: 1,
      };
    }
    sync = {
      ...sync,
      revision: parsed.revision,
      updatedAt: parsed.updatedAt,
      payload: local.payload,
    };
    return {
      ok: true,
      sync,
      methods,
      putUsed: false,
      retries: 1,
      appliedCount: parsed.appliedCount,
    };
  }

  if (patch2.status === 409) {
    try {
      const get2 = await doGet();
      ingestGet(get2);
    } catch {
      /* keep */
    }
    return {
      ok: false,
      error: "conflict_retry_exhausted",
      sync,
      methods,
      putUsed: false,
      retries: 1,
    };
  }

  return {
    ok: false,
    error: mapPatchFailure(patch2.status),
    sync,
    methods,
    putUsed: false,
    retries: 1,
  };
}
