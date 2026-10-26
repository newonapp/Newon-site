/*
 * LIVON Community — remote contract (Community V2). Reference only: NOT loaded by the public page, and nothing here
 * opens a connection. It describes what a future Newon+ Community server must provide and enforce, and gives the
 * RemoteCommunityRepository shape that will replace the local repository once that server exists.
 *
 *   CommunityService (LivonCommunityService)
 *     ├─ LocalCommunityRepository   today — Local Adapter, this browser only
 *     └─ RemoteCommunityRepository  future — createRemoteRepository(); until configured, every call fails NOT_CONFIGURED
 *
 * Requires community-service.js (states, events). Server rules here are advisory in a browser; the server enforces them.
 */
(function (root) {
  "use strict";
  var S = root.LivonCommunityService;
  if (!S) throw new Error("community-service.js must be loaded first");
  function isObj(x) { return !!x && typeof x === "object" && !Array.isArray(x); }

  /* ───────── Remote contract (server not built; nothing here sends anything) ─────────
     The future RemoteCommunityRepository talks to these routes. Every route needs a verified Newon+ token; the
     server takes the author from the token, never from the body; lists are cursor-paginated; writes are rate-limited. */
  var REMOTE_BASE = "/api/livon/community";
  function route(method, path, o) {
    o = o || {};
    return { method: method, path: REMOTE_BASE + path, auth: o.auth || "verified-token", authz: o.authz || "any-verified",
      paginated: !!o.paginated, rateLimit: o.rateLimit || (method === "GET" ? "read" : "write"), moderation: !!o.moderation };
  }
  var REMOTE_CONTRACT = {
    version: 1,
    identity: "author = the account id inside the verified token; authorId / userId / role in a request body are ignored",
    pagination: { style: "cursor", param: "cursor", limitParam: "limit", maxLimit: 50 },
    rateLimit: { write: "per account and per IP; 429 with Retry-After", read: "per IP" },
    errors: ["UNAUTHENTICATED", "FORBIDDEN", "NOT_FOUND", "VALIDATION", "RATE_LIMITED", "BLOCKED", "BACKEND_REQUIRED"],
    moderationStates: S.MODERATION_STATES.slice(),
    deliveryStates: [S.DELIVERY.PENDING, S.DELIVERY.DELIVERED],
    reportReasons: ["spam", "harassment", "privacy", "misinformation", "illegal", "other"],
    /* local reason id → server reason; "inappropriate" is reviewed and re-classified by a moderator */
    reportReasonMap: { spam: "spam", harassment: "harassment", misinformation: "misinformation", inappropriate: "other", other: "other" },
    notificationEvents: S.NOTIFICATION_EVENTS.slice(),
    profileFields: { displayName: "required, 1–20", avatar: "optional image URL from the server", bio: "optional, ≤ 160", interests: "optional, ≤ 10 ids" },
    blockFields: ["blocker", "blocked", "createdAt"],
    routes: {
      listPosts: route("GET", "/posts", { auth: "optional", paginated: true, moderation: true }),
      getPost: route("GET", "/posts/:id", { auth: "optional", moderation: true }),
      createPost: route("POST", "/posts"),
      updatePost: route("PATCH", "/posts/:id", { authz: "author-only" }),
      deletePost: route("DELETE", "/posts/:id", { authz: "author-only" }),
      listComments: route("GET", "/posts/:id/comments", { auth: "optional", paginated: true, moderation: true }),
      addComment: route("POST", "/posts/:id/comments"),
      addReply: route("POST", "/comments/:id/replies"),
      updateComment: route("PATCH", "/comments/:id", { authz: "author-only" }),
      deleteComment: route("DELETE", "/comments/:id", { authz: "author-only" }),
      setReaction: route("PUT", "/posts/:id/reaction"),
      clearReaction: route("DELETE", "/posts/:id/reaction"),
      getProfile: route("GET", "/profiles/:id", { auth: "optional" }),
      updateProfile: route("PATCH", "/profiles/me", { authz: "self-only" }),
      follow: route("PUT", "/follows/:accountId"),
      unfollow: route("DELETE", "/follows/:accountId"),
      block: route("PUT", "/blocks/:accountId"),
      unblock: route("DELETE", "/blocks/:accountId"),
      report: route("POST", "/reports"),
      moderate: route("PATCH", "/moderation/:target", { authz: "moderator-role" })
    }
  };
  /* Reference authorization rules for the server (client checks are advisory; the server must enforce these).
     actor = what the server read from a verified token: { accountId, verified, roles[] }. A body never supplies it. */
  function identityFrom(token, body) {
    void body;   /* body.authorId / userId / role are ignored on purpose */
    if (!isObj(token) || token.verified !== true || typeof token.accountId !== "string" || !token.accountId) return null;
    return { accountId: token.accountId, verified: true, roles: Array.isArray(token.roles) ? token.roles.filter(function (r) { return typeof r === "string"; }) : [] };
  }
  function authorize(action, actor, record) {
    var r = REMOTE_CONTRACT.routes[action];
    if (!r) return { allowed: false, reason: "UNKNOWN_ACTION" };
    if (!actor || actor.verified !== true) return r.auth === "optional" ? { allowed: true } : { allowed: false, reason: "UNAUTHENTICATED" };
    if (r.authz === "author-only") {
      if (!isObj(record)) return { allowed: false, reason: "NOT_FOUND" };
      return record.authorAccountId === actor.accountId ? { allowed: true } : { allowed: false, reason: "FORBIDDEN" };
    }
    if (r.authz === "moderator-role") return (actor.roles || []).indexOf("community-moderator") >= 0 ? { allowed: true } : { allowed: false, reason: "FORBIDDEN" };
    if (r.authz === "self-only") return { allowed: true, accountId: actor.accountId };
    if ((action === "follow" || action === "block") && isObj(record) && record.accountId === actor.accountId) return { allowed: false, reason: "VALIDATION" };
    return { allowed: true };
  }
  /* RemoteCommunityRepository: the future server client. Not configured → every call fails with NOT_CONFIGURED; it never
     answers with success, empty lists or cached copies. */
  function createRemoteRepository(config) {
    var baseUrl = config && typeof config.baseUrl === "string" && /^https:\/\//.test(config.baseUrl) ? config.baseUrl : null;
    var repo = { kind: "remote", configured: false, baseUrl: baseUrl, contract: REMOTE_CONTRACT };
    Object.keys(REMOTE_CONTRACT.routes).forEach(function (name) {
      repo[name] = function () {
        var e = new Error(baseUrl ? "NOT_IMPLEMENTED" : "NOT_CONFIGURED");
        e.code = baseUrl ? "NOT_IMPLEMENTED" : "NOT_CONFIGURED";
        return Promise.reject(e);
      };
    });
    return repo;
  }

  root.LivonCommunityRemote = {
    REMOTE_CONTRACT: REMOTE_CONTRACT, identityFrom: identityFrom, authorize: authorize, createRemoteRepository: createRemoteRepository
  };
})(typeof window !== "undefined" ? window : globalThis);
