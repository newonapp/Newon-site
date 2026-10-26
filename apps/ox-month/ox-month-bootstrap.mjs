/**
 * Explicit first-time Sync create (PUT baseRevision 0 → revision 1).
 *
 * MUST NOT be called automatically on GET 404 — mobile accounts may still
 * need UID migration. Call only after an explicit user "start fresh" action.
 */

import { parseSyncGetResponse, parseSyncPutResponse } from "./ox-month-parser.mjs";
import {
  assertNoClientIdentityInBody,
  assertNoClientIdentityInUrl,
} from "./ox-month-sync.mjs";

/**
 * @param {object} args
 * @param {{ getOxMonthSync: Function, putOxMonthSync: Function }} args.client
 * @param {() => Promise<string>} args.getIdToken
 * @param {string} [args.locale]
 */
export async function bootstrapOxMonthSyncDocument(args) {
  const locale = `${args.locale ?? "ko"}`.trim() || "ko";
  const methods = [];
  const initialPayload = {
    ox_month_locale_v2: locale,
  };

  async function doPut() {
    const idToken = await args.getIdToken();
    const result = await args.client.putOxMonthSync(idToken, {
      baseRevision: 0,
      schemaVersion: 1,
      payload: initialPayload,
    });
    methods.push(result.method || "PUT");
    assertNoClientIdentityInUrl(result.sentUrl || "");
    assertNoClientIdentityInBody(result.sentBody);
    return result;
  }

  async function doGet() {
    const idToken = await args.getIdToken();
    const result = await args.client.getOxMonthSync(idToken);
    methods.push(result.method || "GET");
    assertNoClientIdentityInUrl(result.sentUrl || "");
    return result;
  }

  let putResult;
  try {
    putResult = await doPut();
  } catch {
    return { ok: false, error: "network", methods, putUsed: true };
  }

  if (putResult.status === 200) {
    const parsed = parseSyncPutResponse(putResult.body);
    if (!parsed.ok) {
      return { ok: false, error: "parse_error", methods, putUsed: true };
    }
    return {
      ok: true,
      sync: {
        appId: "ox_month",
        revision: parsed.revision,
        schemaVersion: parsed.schemaVersion,
        updatedAt: parsed.updatedAt,
        payload: { ...initialPayload },
      },
      methods,
      putUsed: true,
      created: true,
    };
  }

  // Race: another client created first → GET existing
  if (putResult.status === 409) {
    let getResult;
    try {
      getResult = await doGet();
    } catch {
      return { ok: false, error: "network", methods, putUsed: true };
    }
    if (getResult.status === 401) {
      return { ok: false, error: "unauthorized", methods, putUsed: true };
    }
    if (getResult.status === 403) {
      return { ok: false, error: "forbidden", methods, putUsed: true };
    }
    if (getResult.status === 404) {
      return { ok: false, error: "not_found", methods, putUsed: true };
    }
    const parsed = parseSyncGetResponse(getResult.body);
    if (!parsed.ok) {
      return { ok: false, error: "parse_error", methods, putUsed: true };
    }
    return {
      ok: true,
      sync: {
        appId: parsed.appId,
        revision: parsed.revision,
        schemaVersion: parsed.schemaVersion,
        updatedAt: parsed.updatedAt,
        payload: { ...parsed.payload },
      },
      methods,
      putUsed: true,
      created: false,
    };
  }

  if (putResult.status === 401) {
    return { ok: false, error: "unauthorized", methods, putUsed: true };
  }
  if (putResult.status === 403) {
    return { ok: false, error: "forbidden", methods, putUsed: true };
  }
  if (putResult.status === 400) {
    return { ok: false, error: "bad_request", methods, putUsed: true };
  }
  if (putResult.status >= 500 || putResult.status === 0) {
    return { ok: false, error: "server_error", methods, putUsed: true };
  }
  return { ok: false, error: "save_failed", methods, putUsed: true };
}
