/*
 * Upstash Redis REST configuration — the ONE place the server reads it (AI limits, data limits, data cache, userdata limits).
 *
 *   1. UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN   (the names this repository has always used)
 *   2. KV_REST_API_URL + KV_REST_API_TOKEN                   (the names Vercel's Upstash/KV integration injects)
 *
 * A pair is used only when it is complete: an https URL and a non-empty token. The first complete pair wins, and the two
 * pairs are never mixed (a URL from one with the token of the other). KV_REST_API_READ_ONLY_TOKEN is never used: the
 * limiters and the cache write. The result stays on the server; nothing here is logged, returned or sent to a browser.
 */
const PAIRS = Object.freeze([
  Object.freeze({ source: 'upstash', url: 'UPSTASH_REDIS_REST_URL', token: 'UPSTASH_REDIS_REST_TOKEN' }),
  Object.freeze({ source: 'kv', url: 'KV_REST_API_URL', token: 'KV_REST_API_TOKEN' })
]);
export const REDIS_ENV_PAIRS = PAIRS;

export function redisRestConfig(env = {}) {
  for (const p of PAIRS) {
    const url = String((env && env[p.url]) || '').trim();
    const token = String((env && env[p.token]) || '').trim();
    if (/^https:\/\/[^\s/?#]+/.test(url) && token) return { url, token, source: p.source };
  }
  return null;
}

/* which pair is in use, for health/diagnostics: 'upstash' | 'kv' | null — never the URL or the token */
export function redisSource(env = {}) {
  const c = redisRestConfig(env);
  return c ? c.source : null;
}
