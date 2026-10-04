/*
 * LIVON Real Data Layer — configuration (single place for policy values).
 *
 * Every tunable number of the data layer lives here, not inside adapters or UI code:
 *   - cache TTL per entity type (a provider may override it in its registry entry)
 *   - how long an entity counts as "fresh" before it becomes "stale"
 *   - provider priority used when two providers describe the same thing
 * No keys, tokens or endpoints with credentials belong in this file (it ships to the browser).
 */
(function (root) {
  "use strict";
  var HOUR = 3600 * 1000, DAY = 24 * HOUR;
  root.LivonDataConfig = {
    version: 1,
    cache: {
      namespace: "livon.data.v1",
      /* how long a provider response may be reused before refresh() calls the provider again */
      ttlByType: { place: 7 * DAY, expert: 7 * DAY, program: DAY, event: 6 * HOUR, policy: DAY, public: DAY },
      maxEntriesPerProvider: 500,
      /* browser storage budget for cached provider responses (characters of JSON) */
      maxStoredChars: 400000
    },
    freshness: {
      /* after this age (since lastVerifiedAt / updatedAt) an entity is shown as "stale" (확인 필요) */
      freshForByType: { place: 90 * DAY, expert: 60 * DAY, program: 14 * DAY, event: 7 * DAY, policy: 30 * DAY, public: 30 * DAY },
      /* policies are only "fresh" when a person/job re-verified them — fetchedAt alone never counts */
      policyNeedsVerification: true
    },
    dedupe: {
      /* a cross-provider merge needs at least this many matching signals besides the title */
      minExtraSignals: 2
    },
    limits: { titleMax: 200, summaryMax: 500, descriptionMax: 5000, tagMax: 20, tagLength: 40 },
    /* browser code never talks to keyed APIs; keyed providers go through this server route (not deployed yet) */
    /* same origin by default; livon/livon-api-config.js may point to a separate https API origin (never a key) */
    serverEndpoint: (root.LivonApi && typeof root.LivonApi.url === "function" ? root.LivonApi.url("/api/livon/data") : "/api/livon/data")
  };
})(typeof window !== "undefined" ? window : globalThis);
