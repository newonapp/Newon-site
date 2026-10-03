/*
 * Request limits for GET/POST /api/livon/data — they protect the provider quotas LIVON and ONGIL share.
 *
 * What is counted: only requests that would call a provider (a cache miss that does not join an identical request already
 * in flight). Cache hits, status checks, bad requests and NOT_CONFIGURED answers are never counted, so normal browsing of
 * cached lists costs nothing.
 *
 * Policy (fixed windows; defaults below; env overrides are integers within bounds, an invalid value keeps the default and
 * /api/health reports data.rateLimit.limitsValid=false):
 *   per client   30 provider calls / minute, 600 / day        LIVON_DATA_CLIENT_MINUTE_LIMIT, LIVON_DATA_CLIENT_DAILY_LIMIT
 *   per provider site-wide daily ceiling, ~90% of the provider's documented development quota, so the API stops itself
 *                before the provider starts refusing everyone:
 *                kr-tourapi 900 (TourAPI dev 1,000/day, and it is never cached)      LIVON_DATA_TOURAPI_DAILY_LIMIT
 *                kr-kakao-place 90,000 (Kakao Local 100,000/day)                    LIVON_DATA_KAKAO_DAILY_LIMIT
 *                kr-lifelong-class 9,000 (data.go.kr dev 10,000/day; cached 24 h)   LIVON_DATA_LIFELONG_DAILY_LIMIT
 *                any other provider 5,000
 *   over the client limit  → 429 RATE_LIMIT + Retry-After
 *   over a site ceiling    → 503 UPSTREAM_LIMIT + Retry-After (the same answer a provider quota error already gives)
 *
 * Client identity: HMAC-SHA256 of the client IP (Vercel's x-vercel-forwarded-for on Vercel, the socket address elsewhere)
 * with LIVON_RATE_LIMIT_SECRET — or, without that secret, a random per-process salt. The raw IP is never stored, logged,
 * returned or sent to Redis; keys expire with their window.
 *
 * Modes (deterministic):
 *   shared    Upstash REST configured (server/livon/redis-env.mjs) AND LIVON_RATE_LIMIT_SECRET ≥ 32 chars:
 *             one atomic EVAL per counted request, limits hold across all serverless instances.
 *   instance  production (NODE_ENV=production or any Vercel deployment) without that configuration, and — per request —
 *             whenever Upstash fails or answers badly: the same limits, counted inside this server instance only.
 *             Data keeps working; no request is refused because Redis is down, and nothing is faked.
 *   off       development/test without Upstash: no counting (local work and the test suites are unaffected).
 */
import { createHmac, randomBytes } from 'node:crypto';
import { redisRestConfig } from '../redis-env.mjs';

export const DATA_LIMIT_DEFAULTS = Object.freeze({
  clientMinute: Object.freeze([30, 60]),
  clientDay: Object.freeze([600, 86400]),
  siteDay: Object.freeze({ 'kr-tourapi': 900, 'kr-kakao-place': 90000, 'kr-lifelong-class': 9000 }),
  siteDayDefault: 5000
});
const CLIENT_ENV = Object.freeze({ clientMinute: ['LIVON_DATA_CLIENT_MINUTE_LIMIT', 600], clientDay: ['LIVON_DATA_CLIENT_DAILY_LIMIT', 100000] });
export const SITE_ENV = Object.freeze({ 'kr-tourapi': 'LIVON_DATA_TOURAPI_DAILY_LIMIT', 'kr-kakao-place': 'LIVON_DATA_KAKAO_DAILY_LIMIT', 'kr-lifelong-class': 'LIVON_DATA_LIFELONG_DAILY_LIMIT' });
const SITE_MAX = 1000000;

/* returns {0, ttl, index} for the first exhausted key, otherwise counts every key and returns {1, 0, 0} */
export const DATA_LIMIT_SCRIPT = `
for i=1,#KEYS do
 local n=tonumber(redis.call('GET',KEYS[i]) or '0')
 if n>=tonumber(ARGV[(i-1)*2+1]) then return {0,math.max(1,redis.call('TTL',KEYS[i])),i} end
end
for i=1,#KEYS do
 local n=redis.call('INCR',KEYS[i])
 if n==1 then redis.call('EXPIRE',KEYS[i],ARGV[(i-1)*2+2]) end
end
return {1,0,0}`;

export class DataLimitError extends Error {
  constructor(status, code, retryAfter) { super(code); this.status = status; this.code = code; this.retryAfter = retryAfter; }
}

function intEnv(env, name, fallback, max) {
  const raw = env && env[name];
  if (raw === undefined || raw === null || raw === '') return { value: fallback, valid: true };
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= max ? { value: n, valid: true } : { value: fallback, valid: false };
}

/* the effective policy for this environment: client caps, site ceiling per provider, and whether every override was valid */
export function dataLimitPolicy(env = {}) {
  let valid = true;
  const pick = (name, fallback, max) => { const r = intEnv(env, name, fallback, max); if (!r.valid) valid = false; return r.value; };
  const client = [
    [pick(CLIENT_ENV.clientMinute[0], DATA_LIMIT_DEFAULTS.clientMinute[0], CLIENT_ENV.clientMinute[1]), DATA_LIMIT_DEFAULTS.clientMinute[1]],
    [pick(CLIENT_ENV.clientDay[0], DATA_LIMIT_DEFAULTS.clientDay[0], CLIENT_ENV.clientDay[1]), DATA_LIMIT_DEFAULTS.clientDay[1]]
  ];
  const site = {};
  for (const [id, name] of Object.entries(SITE_ENV)) site[id] = pick(name, DATA_LIMIT_DEFAULTS.siteDay[id], SITE_MAX);
  return { client, siteDay: id => Object.prototype.hasOwnProperty.call(site, id) ? site[id] : DATA_LIMIT_DEFAULTS.siteDayDefault, site, valid };
}

export function isLimitProduction(env = {}) { return env.NODE_ENV === 'production' || !!env.VERCEL; }
function sharedConfigured(env) { return !!(redisRestConfig(env) && typeof env.LIVON_RATE_LIMIT_SECRET === 'string' && env.LIVON_RATE_LIMIT_SECRET.length >= 32); }

/* 'shared' | 'instance' | 'off' — booleans/ids only, safe for /api/health */
export function dataLimitMode(env = {}) {
  if (sharedConfigured(env)) return 'shared';
  return isLimitProduction(env) ? 'instance' : 'off';
}

/* the client address the platform vouches for — never a client-supplied X-Forwarded-For */
export function clientAddress(req, env = {}) {
  const h = (req && req.headers) || {};
  const ip = env.VERCEL ? String(h['x-vercel-forwarded-for'] || '').split(',')[0].trim() : String((req && req.socket && req.socket.remoteAddress) || '');
  return ip || 'unknown';
}

export function createDataLimiter({ env = process.env, fetcher = fetch, now = () => Date.now() } = {}) {
  const mode = dataLimitMode(env);
  const policy = dataLimitPolicy(env);
  const salt = sharedConfigured(env) ? env.LIVON_RATE_LIMIT_SECRET : randomBytes(32).toString('hex');
  const local = new Map();   /* instance mode: hashed keys → { count, until }; lives and dies with this instance */
  const identity = ip => createHmac('sha256', salt).update('livon-data:' + ip).digest('hex').slice(0, 40);

  function keysFor(providerId, id) {
    return [`livon:data:client:${id}:minute`, `livon:data:client:${id}:day`, `livon:data:site:${providerId}:day`];
  }
  function capsFor(providerId) { return [...policy.client, [policy.siteDay(providerId), 86400]]; }
  function refusal(index, retryAfter) {
    const after = Math.max(1, Math.ceil(Number(retryAfter) || 60));
    return index >= 2 ? new DataLimitError(503, 'UPSTREAM_LIMIT', after) : new DataLimitError(429, 'RATE_LIMIT', after);
  }
  function countLocally(keys, caps) {
    const t = now();
    for (const [k, b] of local) if (b.until <= t) local.delete(k);
    for (let i = 0; i < keys.length; i++) { const b = local.get(keys[i]); if (b && b.count >= caps[i][0]) throw refusal(i, (b.until - t) / 1000); }
    keys.forEach((k, i) => { const b = local.get(k) || { count: 0, until: t + caps[i][1] * 1000 }; b.count++; local.set(k, b); });
  }

  /* throws DataLimitError when this provider call must not happen; resolves when it may */
  async function check(providerId, ip) {
    if (mode === 'off') return 'off';
    const keys = keysFor(String(providerId), identity(String(ip || 'unknown')));
    const caps = capsFor(String(providerId));
    if (mode === 'shared') {
      const redis = redisRestConfig(env);
      let result = null;
      try {
        const r = await fetcher(redis.url, {
          method: 'POST', signal: AbortSignal.timeout(2500),
          headers: { Authorization: `Bearer ${redis.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(['EVAL', DATA_LIMIT_SCRIPT, String(keys.length), ...keys, ...caps.flat().map(String)])
        });
        if (r && r.ok) { const data = await r.json(); if (data && Array.isArray(data.result) && [0, 1].includes(data.result[0])) result = data.result; }
      } catch { result = null; }
      if (result) {
        if (result[0] === 1) return 'shared';
        throw refusal(Number(result[2]) - 1, result[1]);
      }
      /* Upstash unavailable or malformed: same limits, counted in this instance (documented, deterministic) */
    }
    countLocally(keys, caps);
    return 'instance';
  }
  return { mode, policy, check };
}
