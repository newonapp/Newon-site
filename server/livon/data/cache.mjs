/*
 * Server-side cache for the LIVON data route.
 *
 *   memory  — per serverless instance; always on; lost on cold start
 *   upstash — shared & persistent, used automatically when Upstash REST is configured (server/livon/redis-env.mjs:
 *             UPSTASH_REDIS_REST_URL/TOKEN, or Vercel's KV_REST_API_URL/TOKEN)
 *             (same Upstash database LIVON AI uses for rate limiting). Any Redis/DB can replace it
 *             by implementing get/set with the same signatures.
 * Cache failures never fail a request: they fall back to memory / a fresh upstream call.
 * Values are already-normalized LIVON entities — never raw upstream payloads or keys.
 */
import { redisRestConfig } from '../redis-env.mjs';

export function memoryCache({ maxEntries = 50 } = {}) {
  const m = new Map();
  return {
    kind: 'memory',
    async get(k) { const v = m.get(k); if (!v) return null; if (v.exp < Date.now()) { m.delete(k); return null; } return v.value; },
    async set(k, value, ttlMs) {
      if (!(ttlMs > 0)) return false;
      if (m.size >= maxEntries) m.delete(m.keys().next().value);
      m.set(k, { value, exp: Date.now() + ttlMs });
      return true;
    }
  };
}

export function upstashCache(env, fetcher = fetch) {
  const cfg = redisRestConfig(env);
  if (!cfg) return null;
  const { url, token } = cfg;
  const call = async cmd => {
    const r = await fetcher(url, { method: 'POST', signal: AbortSignal.timeout(2500), headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
    if (!r.ok) throw new Error('cache unavailable');
    return (await r.json()).result;
  };
  return {
    kind: 'upstash',
    async get(k) { try { const v = await call(['GET', k]); return v ? JSON.parse(v) : null; } catch { return null; } },
    async set(k, value, ttlMs) {
      if (!(ttlMs > 0)) return false;
      try { const raw = JSON.stringify(value); if (raw.length > 900_000) return false; await call(['SET', k, raw, 'PX', String(Math.round(ttlMs))]); return true; } catch { return false; }
    }
  };
}

/* memory first, then shared cache; writes go to both */
export function createServerCache(env, fetcher = fetch) {
  const mem = memoryCache();
  const shared = upstashCache(env, fetcher);
  if (!shared) return mem;
  return {
    kind: 'memory+upstash',
    async get(k) { const v = await mem.get(k); if (v) return v; const s = await shared.get(k); if (s) await mem.set(k, s, 60_000); return s; },
    async set(k, v, ttl) { await mem.set(k, v, ttl); return shared.set(k, v, ttl); }
  };
}
