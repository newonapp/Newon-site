/*
 * Generic fixed-window request limiter for LIVON API routes (same Upstash database and HMAC identity scheme as LIVON AI).
 *   identity  hashed with LIVON_RATE_LIMIT_SECRET before it leaves the process (raw ids/IPs are never stored)
 *   keys      expire with their window (nothing is kept longer than the longest window)
 *   caps      [[max, windowSeconds], …] checked and counted atomically in one EVAL
 * Production without Upstash (or with Upstash unreachable) fails closed; outside production an in-process limiter is used.
 */
import { createHmac } from 'node:crypto';
import { isProduction, protectionConfigured } from './chat.mjs';
import { redisRestConfig } from './redis-env.mjs';

export const BUCKET_SCRIPT = `
for i=1,#KEYS do
 local n=tonumber(redis.call('GET',KEYS[i]) or '0')
 if n>=tonumber(ARGV[(i-1)*2+1]) then return {0,math.max(1,redis.call('TTL',KEYS[i]))} end
end
for i=1,#KEYS do
 local n=redis.call('INCR',KEYS[i])
 if n==1 then redis.call('EXPIRE',KEYS[i],ARGV[(i-1)*2+2]) end
end
return {1,0}`;

export class LimitError extends Error {
  constructor(status, code, retryAfter) { super(code); this.status = status; this.code = code; this.retryAfter = retryAfter; }
}
const local = new Map();

export async function limitBuckets({ scope, identity, caps, env = {}, fetcher = fetch, now = () => Date.now() }) {
  if (!/^[a-z0-9-]{2,32}$/.test(scope) || !identity || !Array.isArray(caps) || !caps.length) throw new LimitError(503, 'INVALID_SERVER_CONFIG');
  if (!protectionConfigured(env)) {
    if (isProduction(env)) throw new LimitError(503, 'PROTECTION_NOT_CONFIGURED');
    const t = now();
    for (const [k, b] of local) if (b.until <= t) local.delete(k);
    const keys = caps.map((_, i) => `${scope}:${identity}:${i}`);
    for (let i = 0; i < keys.length; i++) { const b = local.get(keys[i]); if (b && b.count >= caps[i][0]) throw new LimitError(429, 'RATE_LIMIT', Math.ceil((b.until - t) / 1000)); }
    keys.forEach((k, i) => { const b = local.get(k) || { count: 0, until: t + caps[i][1] * 1000 }; b.count++; local.set(k, b); });
    return;
  }
  const id = createHmac('sha256', env.LIVON_RATE_LIMIT_SECRET).update(scope + ':' + identity).digest('hex');
  const keys = caps.map((_, i) => `livon:${scope}:${id}:${i}`);
  const redis = redisRestConfig(env);
  try {
    const r = await fetcher(redis.url, {
      method: 'POST', signal: AbortSignal.timeout(3000),
      headers: { Authorization: `Bearer ${redis.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', BUCKET_SCRIPT, String(keys.length), ...keys, ...caps.flat().map(String)])
    });
    if (!r.ok) throw new Error('limiter');
    const data = await r.json();
    if (!Array.isArray(data.result) || ![0, 1].includes(data.result[0])) throw new Error('limiter');
    if (!data.result[0]) throw new LimitError(429, 'RATE_LIMIT', Math.max(1, Number(data.result[1]) || 60));
  } catch (e) {
    if (e instanceof LimitError) throw e;
    throw new LimitError(503, 'PROTECTION_UNAVAILABLE');
  }
}
