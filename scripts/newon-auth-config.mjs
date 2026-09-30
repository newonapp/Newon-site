/**
 * Newon+ auth public web config → _publish/newon-auth/newon-auth-config.js (build time).
 * Only the four PUBLIC Firebase web config values are read; nothing server-side is ever written to the browser bundle.
 * Missing / partial / forbidden (HQ or per-app project) values → the committed empty config is kept (anonymous mode).
 */
export const PUBLIC_ENV = Object.freeze({
  apiKey: "NEWON_PLUS_FIREBASE_API_KEY",
  authDomain: "NEWON_PLUS_FIREBASE_AUTH_DOMAIN",
  projectId: "NEWON_PLUS_FIREBASE_PROJECT_ID",
  appId: "NEWON_PLUS_FIREBASE_APP_ID",
  persistence: "NEWON_PLUS_AUTH_PERSISTENCE",
  providers: "NEWON_PLUS_AUTH_PROVIDERS",
});
/* sign-in methods the Newon+ Firebase project has ENABLED (comma-separated). Nothing is enabled by default. */
export const SIGN_IN_PROVIDERS = Object.freeze(["google.com", "apple.com"]);
const FORBIDDEN = ["newon-hq", "newon-oxmonth"];

export function newonAuthConfigFromEnv(env = {}) {
  const v = {};
  for (const [k, name] of Object.entries(PUBLIC_ENV)) v[k] = String(env[name] || "").trim();
  if (!v.apiKey || !v.authDomain || !v.projectId || !v.appId) return null;
  if (FORBIDDEN.includes(v.projectId)) return null;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(v.apiKey) || !/^[a-z][a-z0-9-]{4,38}[a-z0-9]$/.test(v.projectId) ||
      !/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(v.authDomain) || !/^\d+:\d+:web:[a-f0-9]+$/.test(v.appId)) return null;
  const out = { apiKey: v.apiKey, authDomain: v.authDomain, projectId: v.projectId, appId: v.appId };
  if (["session", "local", "memory"].includes(v.persistence)) out.persistence = v.persistence;
  const providers = [...new Set(v.providers.split(",").map(x => x.trim()).filter(x => SIGN_IN_PROVIDERS.includes(x)))];
  if (providers.length) out.providers = providers;
  return out;
}

export function newonAuthConfigScript(cfg) {
  return "/* generated at build time from NEWON_PLUS_FIREBASE_* (public Firebase web config only) */\n" +
    "(function (root) { \"use strict\"; root.NEWON_PLUS_AUTH_CONFIG = " + JSON.stringify(cfg).replace(/</g, "\\u003c") + "; })(typeof window !== \"undefined\" ? window : globalThis);\n";
}
