/*
 * Newon+ consumer auth — PUBLIC Firebase web config (client-visible by design; not a secret).
 *
 * Intentionally empty: no Newon+ Firebase project exists yet, so every Newon web service runs anonymously.
 * The build (scripts/publish-site.mjs) writes the real values into _publish/newon-auth/newon-auth-config.js when ALL of
 *   NEWON_PLUS_FIREBASE_API_KEY · NEWON_PLUS_FIREBASE_AUTH_DOMAIN · NEWON_PLUS_FIREBASE_PROJECT_ID · NEWON_PLUS_FIREBASE_APP_ID
 * are set (optional NEWON_PLUS_AUTH_PERSISTENCE = session | local | memory). Never put server credentials here.
 * Never use the HQ (newon-hq) or OX MONTH (newon-oxmonth) projects — NewonAuth refuses them.
 */
(function (root) {
  "use strict";
  root.NEWON_PLUS_AUTH_CONFIG = null;
})(typeof window !== "undefined" ? window : globalThis);
