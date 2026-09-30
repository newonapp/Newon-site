#!/usr/bin/env node
/**
 * LIVON public-data provider status (read-only). For every provider in server/livon/data/manifest.mjs:
 *   key present  → one LIVE request through the real /api/livon/data handler, then the rows go through the Data Platform
 *                  (normalize → canonicalize → dedupe/priority → expiry) and are counted
 *   key missing  → CODE READY / KEY REQUIRED, all counts 0 (nothing is requested, nothing is faked)
 *
 *   node --env-file=.env scripts/livon-provider-status.mjs      → JSON on stdout (never prints a key)
 *
 * Counts per provider: fetched · accepted · rejected · duplicates · expired · error.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDataHandler } from '../server/livon/data/http.mjs';
import { memoryCache } from '../server/livon/data/cache.mjs';
import { PROVIDER_MANIFEST } from '../server/livon/data/manifest.mjs';
import { loadLivon } from './livon-data-quality.mjs';

/* on-demand providers need a query; these are neutral probes */
export const PROBE_QUERY = { 'kr-kakao-place': '도서관', 'kr-tourapi': '박물관', 'kr-job-training': '데이터' };

function res() { return { statusCode: 0, headers: {}, body: '', setHeader() {}, end(b) { this.body = b || ''; } }; }

export async function providerStatus({ env = process.env, fetcher = fetch, now = Date.now() } = {}) {
  const h = createDataHandler({ env, fetcher, cache: memoryCache(), log: () => {} });
  const out = {}, items = {};
  for (const [id, m] of Object.entries(PROVIDER_MANIFEST)) {
    const keySet = !!String(env[m.env] || '').trim();
    const row = { status: keySet ? 'LIVE' : 'CODE READY', keyRequired: true, keyEnv: m.env, keySet, fetched: 0, accepted: 0, rejected: 0, duplicates: 0, expired: 0, error: null };
    out[id] = row;
    if (!keySet) { row.error = 'KEY_REQUIRED'; continue; }
    const q = PROBE_QUERY[id] ? '&query=' + encodeURIComponent(PROBE_QUERY[id]) : '';
    const r = res();
    try { await h({ method: 'GET', url: '/api/livon/data?provider=' + id + q, headers: {} }, r); } catch { r.statusCode = 500; r.body = '{}'; }
    let body = {}; try { body = JSON.parse(r.body || '{}'); } catch {}
    if (!body.ok) { row.status = 'BLOCKED'; row.error = body.code || 'HTTP_' + r.statusCode; continue; }
    items[id] = body.items || [];
    row.fetched = items[id].length;
  }
  /* Data Platform pass over everything that came back */
  const ctx = loadLivon(), P = ctx.LivonDataPlatform;
  const all = Object.values(items).flat();
  const repo = P.createRepository({ now, adapters: [P.StaticAdapter({ lifeTopics: ctx.LivonLifeHub.repo.data }), P.PublicDataAdapter({ entities: all })] });
  await repo.load();
  const rows = repo.all({ includeExpired: true, includeUnsourced: true, includeDuplicates: true });
  for (const [id, row] of Object.entries(out)) {
    const mine = rows.filter(e => e.meta.upstreamProvider === id);
    row.accepted = mine.filter(e => !repo.hiddenReason(e.id)).length;
    row.duplicates = mine.filter(e => e.duplicateOf).length;
    row.expired = mine.filter(e => repo.hiddenReason(e.id) === 'expired').length;
    row.rejected = Math.max(0, row.fetched - mine.length);
  }
  const counts = { curated: rows.filter(e => e.sourceType === 'editorial' || e.sourceType === 'internal' || (e.sourceType === 'official' && !e.meta.upstreamProvider)).length,
    liveExternal: rows.filter(e => e.meta.upstreamProvider && !repo.hiddenReason(e.id)).length,
    official: repo.all().filter(e => e.verificationStatus === 'official_source').length, byType: {} };
  for (const t of ['policy', 'event', 'program', 'place', 'expert', 'service', 'class']) counts.byType[t] = repo.all().filter(e => e.type === t).length;
  return { providers: out, counts };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  providerStatus().then(r => console.log(JSON.stringify(r, null, 2)), e => { console.error(String(e && e.message || e)); process.exit(1); });
}
