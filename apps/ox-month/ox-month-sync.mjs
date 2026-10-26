/**
 * Authenticated Sync GET/PUT/PATCH client for OX MONTH Web.
 * Never sends email/userId in query or body.
 * PUT is only for explicit first-time document create (never auto on GET 404).
 */

const DEFAULT_BASE = "https://api.newon.app";

/**
 * @param {object} [options]
 * @param {string} [options.baseUrl]
 * @param {typeof fetch} [options.fetchImpl]
 */
export function createSyncClient(options = {}) {
  const baseUrl = `${options.baseUrl || DEFAULT_BASE}`.replace(/\/$/, "");
  const fetchImpl = options.fetchImpl || globalThis.fetch.bind(globalThis);

  /**
   * @param {string} idToken
   */
  async function getOxMonthSync(idToken) {
    const token = `${idToken ?? ""}`.trim();
    if (!token) {
      return {
        status: 401,
        body: { error: "unauthorized" },
        sentUrl: "",
        sentHeaders: {},
        method: "GET",
        sentBody: null,
      };
    }

    const sentUrl = `${baseUrl}/api/sync/v1/ox_month`;
    const sentHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    const res = await fetchImpl(sentUrl, {
      method: "GET",
      headers: sentHeaders,
    });

    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    return {
      status: res.status,
      body,
      sentUrl,
      sentHeaders,
      method: "GET",
      sentBody: null,
    };
  }

  /**
   * PUT full snapshot. Create uses baseRevision 0 when no document exists.
   * @param {string} idToken
   * @param {{ baseRevision: number, schemaVersion?: number, payload: Record<string, unknown> }} putBody
   */
  async function putOxMonthSync(idToken, putBody) {
    const token = `${idToken ?? ""}`.trim();
    if (!token) {
      return {
        status: 401,
        body: { error: "unauthorized" },
        sentUrl: "",
        sentHeaders: {},
        method: "PUT",
        sentBody: null,
      };
    }

    if (
      !putBody ||
      typeof putBody !== "object" ||
      Array.isArray(putBody) ||
      putBody.payload == null ||
      typeof putBody.payload !== "object" ||
      Array.isArray(putBody.payload)
    ) {
      return {
        status: 400,
        body: { error: "validation_error" },
        sentUrl: "",
        sentHeaders: {},
        method: "PUT",
        sentBody: null,
      };
    }

    if (
      Object.prototype.hasOwnProperty.call(putBody, "email") ||
      Object.prototype.hasOwnProperty.call(putBody, "userId") ||
      Object.prototype.hasOwnProperty.call(putBody.payload, "email") ||
      Object.prototype.hasOwnProperty.call(putBody.payload, "userId")
    ) {
      throw new Error("sync_body_must_not_include_identity");
    }

    const sentUrl = `${baseUrl}/api/sync/v1/ox_month`;
    assertNoClientIdentityInUrl(sentUrl);

    const payload = {
      baseRevision: putBody.baseRevision,
      schemaVersion:
        putBody.schemaVersion == null ? 1 : putBody.schemaVersion,
      payload: putBody.payload,
    };
    const sentBody = JSON.stringify(payload);
    const sentHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const res = await fetchImpl(sentUrl, {
      method: "PUT",
      headers: sentHeaders,
      body: sentBody,
    });

    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    return {
      status: res.status,
      body,
      sentUrl,
      sentHeaders,
      method: "PUT",
      sentBody,
    };
  }

  /**
   * @param {string} idToken
   * @param {{ baseRevision: number, schemaVersion?: number, patch: Record<string, string|null> }} patchBody
   */
  async function patchOxMonthSync(idToken, patchBody) {
    const token = `${idToken ?? ""}`.trim();
    if (!token) {
      return {
        status: 401,
        body: { error: "unauthorized" },
        sentUrl: "",
        sentHeaders: {},
        method: "PATCH",
        sentBody: null,
      };
    }

    if (
      !patchBody ||
      typeof patchBody !== "object" ||
      Array.isArray(patchBody) ||
      !patchBody.patch ||
      typeof patchBody.patch !== "object" ||
      Array.isArray(patchBody.patch)
    ) {
      return {
        status: 400,
        body: { error: "validation_error" },
        sentUrl: "",
        sentHeaders: {},
        method: "PATCH",
        sentBody: null,
      };
    }

    if (
      Object.prototype.hasOwnProperty.call(patchBody, "email") ||
      Object.prototype.hasOwnProperty.call(patchBody, "userId")
    ) {
      throw new Error("sync_body_must_not_include_identity");
    }

    const sentUrl = `${baseUrl}/api/sync/v1/ox_month`;
    assertNoClientIdentityInUrl(sentUrl);

    const payload = {
      baseRevision: patchBody.baseRevision,
      schemaVersion:
        patchBody.schemaVersion == null ? 1 : patchBody.schemaVersion,
      patch: patchBody.patch,
    };
    const sentBody = JSON.stringify(payload);
    const sentHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const res = await fetchImpl(sentUrl, {
      method: "PATCH",
      headers: sentHeaders,
      body: sentBody,
    });

    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    return {
      status: res.status,
      body,
      sentUrl,
      sentHeaders,
      method: "PATCH",
      sentBody,
    };
  }

  return { getOxMonthSync, putOxMonthSync, patchOxMonthSync, baseUrl };
}

/**
 * @param {string} url
 */
export function assertNoClientIdentityInUrl(url) {
  const u = new URL(url, "https://example.invalid");
  if (u.searchParams.has("email") || u.searchParams.has("userId")) {
    throw new Error("sync_url_must_not_include_identity");
  }
}

/**
 * @param {string|null|undefined} sentBody
 */
export function assertNoClientIdentityInBody(sentBody) {
  if (sentBody == null || sentBody === "") return;
  let parsed;
  try {
    parsed = JSON.parse(sentBody);
  } catch {
    return;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
  if (
    Object.prototype.hasOwnProperty.call(parsed, "email") ||
    Object.prototype.hasOwnProperty.call(parsed, "userId")
  ) {
    throw new Error("sync_body_must_not_include_identity");
  }
}
