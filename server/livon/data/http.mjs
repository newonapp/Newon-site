/*
 * GET /api/livon/data — LIVON Real Data Layer server route.
 *
 *   ?action=status                          → which server providers are configured (booleans only)
 *   ?provider=<id>&page=<n>&limit=<n>       → normalized, validated LIVON entities (never raw payloads)
 *   ?provider=kr-kakao-place&query=…[&category&sort]&page&limit   → one page of an on-demand place search (Kakao Local)
 *   ?provider=kr-tourapi&query=…|region=…|area=…[&type]&page&limit → one page of TourAPI 관광정보
 *   ?provider=kr-tourapi&id=<contentId>[&view=images]              → TourAPI detail / photos (opened by a user)
 *   ?provider=kr-job-training&query|org|region|method|type|period&page&limit → one page of 고용24 훈련과정 목록
 *   ?provider=kr-job-training&id=<trprId>_<degr>_<torgId>          → 과정/기관정보 for one course (opened by a user)
 *   POST {provider, action:"nearby", lat, lng, radius, …}          → position-based search; coordinates stay out of URLs
 *                                           (GET lat/lng is still accepted for Kakao only, for compatibility)
 *
 * Security model
 *   - allowlisted providers and actions only; the upstream URL is fixed inside each adapter —
 *     a client can never make the server fetch an arbitrary URL
 *   - GET only, bounded page/limit, no request body
 *   - API keys come from environment variables and never appear in responses or logs
 *   - upstream errors become fixed codes (NOT_CONFIGURED / TIMEOUT / UPSTREAM_ERROR …); bodies are discarded
 *   - one upstream refresh per provider at a time; results are cached (see cache.mjs)
 *   - a response whose rows ALL fail the shared schema is an invalid response (never cached, never "0 results")
 *
 * Operations: createDataHandler(...).diagnostics() → per provider { configured, status, lastErrorCategory, lastAt,
 *   requests, cacheHits, cacheMisses, upstreamLoads } — ids, counters and fixed codes only (no keys, URLs, queries,
 *   bodies, coordinates). Over HTTP (?action=diagnostics) only when LIVON_DATA_DIAGNOSTICS=1 outside production.
 */
import { createRequire } from 'node:module';
import { json } from '../http.mjs';
import { createServerCache, memoryCache } from './cache.mjs';
import { applyCors, CorsError } from '../cors.mjs';
import * as youth from './providers/youthcenter.mjs';
import * as bizinfo from './providers/bizinfo.mjs';
import * as bizEvent from './providers/bizinfo-event.mjs';
import * as kakao from './providers/kakao-local.mjs';
import * as tour from './providers/tourapi.mjs';
import * as lifelong from './providers/lifelong-class.mjs';
import * as taxExpert from './providers/public-tax-expert.mjs';
import * as jobs from './providers/job-training.mjs';
import { PROVIDER_MANIFEST } from './manifest.mjs';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
/* the same config + schema the browser uses (plain scripts that attach to globalThis) */
require('../../../livon/data/livon-data-config.js');
require('../../../livon/data/livon-data-schema.js');
const CFG = globalThis.LivonDataConfig;
const Schema = globalThis.LivonDataSchema;

export const LIMITS = { maxPage: 50, maxLimit: 100, defaultLimit: 100 };

/* allowlist: id → server adapter. New providers (business support, events, places …) are added here. */
export const PROVIDERS = {
  [youth.PROVIDER_ID]: {
    id: youth.PROVIDER_ID, name: youth.PROVIDER_NAME, entityTypes: ['policy'], envKey: youth.ENV_KEY,
    configured: env => typeof env[youth.ENV_KEY] === 'string' && env[youth.ENV_KEY].trim().length >= 8,
    load: ({ env, fetcher, now }) => youth.fetchAll({ key: env[youth.ENV_KEY].trim(), fetcher, now })
  },
  /* 기업마당 지원사업정보 */
  [bizinfo.PROVIDER_ID]: {
    id: bizinfo.PROVIDER_ID, name: bizinfo.PROVIDER_NAME, entityTypes: ['policy'], envKey: bizinfo.ENV_KEY,
    configured: env => typeof env[bizinfo.ENV_KEY] === 'string' && env[bizinfo.ENV_KEY].trim().length >= 8,
    /* optional route filters → official searchLclasId / hashtags (validated against the official code lists) */
    filters: params => bizinfo.filters(params),
    load: ({ env, fetcher, now, filter }) => bizinfo.fetchAll({ key: env[bizinfo.ENV_KEY].trim(), fetcher, now, filter })
  },
  /* 기업마당 행사정보 — same 기업마당 service key (BIZINFO_API_KEY), its own fixed endpoint and event normalization */
  [bizEvent.PROVIDER_ID]: {
    id: bizEvent.PROVIDER_ID, name: bizEvent.PROVIDER_NAME, entityTypes: ['event'], envKey: bizEvent.ENV_KEY,
    configured: env => typeof env[bizEvent.ENV_KEY] === 'string' && env[bizEvent.ENV_KEY].trim().length >= 8,
    filters: params => bizEvent.filters(params),
    load: ({ env, fetcher, now, filter }) => bizEvent.fetchAll({ key: env[bizEvent.ENV_KEY].trim(), fetcher, now, filter })
  },
  /* Kakao Local 장소 검색 — on demand only (a query or a real centre point); never a bulk list */
  [kakao.PROVIDER_ID]: {
    id: kakao.PROVIDER_ID, name: kakao.PROVIDER_NAME, entityTypes: ['place'], envKey: kakao.ENV_KEY, mode: 'search',
    params: ['page', 'limit', 'query', 'category', 'lat', 'lng', 'radius', 'sort'],
    configured: env => typeof env[kakao.ENV_KEY] === 'string' && env[kakao.ENV_KEY].trim().length >= 8,
    parse: raw => kakao.parseParams(raw),
    cacheKey: p => kakao.cacheKey(p),
    /* keyword results may use the shared cache (key is a hash, no plaintext query); results around a user's
       position stay in this instance's memory only, briefly, under a salted hash */
    ttl: p => (p.nearby ? 5 * 60e3 : 60 * 60e3),
    privateCache: p => p.nearby,
    empty: p => kakao.beyondWindow(p),
    search: ({ env, fetcher, now, params }) => kakao.search({ key: env[kakao.ENV_KEY].trim(), fetcher, params, now }),
    getCoords: true                                    /* legacy GET lat/lng; LIVON's own page now sends POST */
  },
  /* 한국관광공사 TourAPI (KorService2) — on demand only. The 저작권 정책 forbids content caching on the server,
     so nothing is stored: identical concurrent requests share one upstream call, that's all. */
  [tour.PROVIDER_ID]: {
    id: tour.PROVIDER_ID, name: tour.PROVIDER_NAME, entityTypes: ['place'], envKey: tour.ENV_KEY, mode: 'search',
    params: ['page', 'limit', 'query', 'region', 'area', 'sigungu', 'type', 'lat', 'lng', 'radius', 'id', 'view'],
    configured: env => typeof env[tour.ENV_KEY] === 'string' && env[tour.ENV_KEY].trim().length >= 8,
    parse: raw => tour.parseParams(raw),
    cacheKey: p => 'livon:data:v1:' + tour.PROVIDER_ID + ':' + createHash('sha256').update(INFLIGHT_SALT + JSON.stringify(p)).digest('hex').slice(0, 40),
    ttl: () => 0,
    privateCache: () => true,
    empty: () => false,
    search: ({ env, fetcher, now, params }) => tour.search({ key: env[tour.ENV_KEY].trim(), fetcher, params, now }),
    getCoords: false                                   /* position only via POST */
  },
  /* 전국평생학습강좌표준데이터 (교육부 · 공공데이터포털). A bounded window is loaded and cached (no caching restriction found;
     the dataset is merged monthly, updated quarterly); query/region/method/status filter that window on the server. */
  [lifelong.PROVIDER_ID]: {
    id: lifelong.PROVIDER_ID, name: lifelong.PROVIDER_NAME, entityTypes: ['program'], envKey: lifelong.ENV_KEY,
    params: ['page', 'limit', 'query', 'region', 'method', 'status'],
    configured: env => typeof env[lifelong.ENV_KEY] === 'string' && env[lifelong.ENV_KEY].trim().length >= 8,
    postFilter: true,
    filters: params => lifelong.filters(params),
    match: (e, f) => lifelong.matches(e, f),
    load: ({ env, fetcher, now }) => lifelong.fetchAll({ key: env[lifelong.ENV_KEY].trim(), fetcher, now })
  },
  /* 공공기관이 공개한 마을세무사 지정 정보 — one logical provider over an allowlist of regional sources
     (no national API exists). Sources load independently; a failing source only shortens the cache. */
  [taxExpert.PROVIDER_ID]: {
    id: taxExpert.PROVIDER_ID, name: taxExpert.PROVIDER_NAME, entityTypes: ['expert'], envKey: taxExpert.ENV_KEY,
    params: ['page', 'limit', 'region', 'query'],
    configured: env => typeof env[taxExpert.ENV_KEY] === 'string' && env[taxExpert.ENV_KEY].trim().length >= 8,
    postFilter: true,
    filters: params => taxExpert.filters(params),
    match: (e, f) => taxExpert.matches(e, f),
    partialTtl: 60 * 60e3,
    load: ({ env, fetcher, now }) => taxExpert.fetchAll({ key: env[taxExpert.ENV_KEY].trim(), fetcher, now })
  },
  /* 고용24 국민내일배움카드 훈련과정 (한국고용정보원) — on demand only: one documented upstream page per user search
     (the API filters by 과정명/기관명/지역/훈련유형/훈련구분/훈련시작일), or one course's 과정/기관정보 when a user opens it.
     Traffic limits are not published → answers are cached (list 6 h, detail 24 h); failures are never cached. */
  [jobs.PROVIDER_ID]: {
    id: jobs.PROVIDER_ID, name: jobs.PROVIDER_NAME, entityTypes: ['program'], envKey: jobs.ENV_KEY, mode: 'search',
    params: ['page', 'limit', 'query', 'org', 'region', 'method', 'type', 'period', 'id'],
    configured: env => typeof env[jobs.ENV_KEY] === 'string' && env[jobs.ENV_KEY].trim().length >= 8,
    parse: raw => jobs.parseParams(raw),
    cacheKey: p => jobs.cacheKey(p),
    ttl: p => jobs.ttl(p),
    privateCache: () => false,
    empty: () => false,
    search: ({ env, fetcher, now, params }) => jobs.search({ key: env[jobs.ENV_KEY].trim(), fetcher, params, now }),
    getCoords: false
  }
};
/* manifest facts travel with each allowlist entry (server side only; never part of a public response) */
for (const id of Object.keys(PROVIDERS)) PROVIDERS[id].meta = PROVIDER_MANIFEST[id];

/* minimal provider states for operations (never shown to users as technical text) */
export const PROVIDER_STATES = Object.freeze(['unconfigured', 'configured', 'available', 'temporarily_failed', 'rate_limited', 'invalid_response', 'rejected']);
const STATE_FOR_CODE = { TIMEOUT: 'temporarily_failed', NETWORK: 'temporarily_failed', HTTP_5XX: 'temporarily_failed', QUOTA: 'rate_limited', PARSE: 'invalid_response', INVALID_DATA: 'invalid_response', HTTP_4XX: 'rejected' };
export function stateForError(code) { return STATE_FOR_CODE[code] || 'temporarily_failed'; }
function invalidData() { return Object.assign(new Error('invalid'), { code: 'INVALID_DATA' }); }
function isProductionEnv(env) { return env.VERCEL_ENV === 'production' || env.NODE_ENV === 'production'; }

const INFLIGHT_SALT = createHash('sha256').update(String(Math.random()) + Date.now()).digest('hex').slice(0, 16);
const DEFAULT_PARAMS = ['page', 'limit', 'category', 'region'];
const ALL_KEYS = ['action', 'provider', 'page', 'limit', 'category', 'region', 'query', 'lat', 'lng', 'radius', 'sort', 'area', 'sigungu', 'type', 'id', 'view', 'method', 'status', 'org', 'period'];
/* POST (position-based search only): JSON body, small, fixed keys */
const POST_KEYS = ['provider', 'action', 'lat', 'lng', 'radius', 'query', 'category', 'type', 'sort', 'page', 'limit'];
const BODY_MAX = 2048;

class DataError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
const ERROR_TEXT = {
  METHOD_NOT_ALLOWED: '허용되지 않은 요청입니다.', BAD_REQUEST: '요청 형식이 올바르지 않습니다.', UNKNOWN_PROVIDER: '지원하지 않는 데이터 제공처입니다.',
  NOT_CONFIGURED: '이 데이터 제공처는 아직 연결되지 않았습니다.', UPSTREAM_ERROR: '제공처 데이터를 지금 불러올 수 없습니다.', TIMEOUT: '제공처 응답이 지연되고 있습니다.',
  UPSTREAM_LIMIT: '제공처 호출 한도를 넘었습니다. 잠시 후 다시 시도해 주세요.', SERVER_ERROR: '데이터를 불러오지 못했습니다.',
  ORIGIN_NOT_ALLOWED: '허용되지 않은 요청입니다.'
};
const kakaoWindow = kakao.LIMITS.maxPageable;
const UPSTREAM_CODES = { TIMEOUT: [504, 'TIMEOUT'], NETWORK: [502, 'UPSTREAM_ERROR'], HTTP_4XX: [502, 'UPSTREAM_ERROR'], HTTP_5XX: [502, 'UPSTREAM_ERROR'], PARSE: [502, 'UPSTREAM_ERROR'], INVALID_DATA: [502, 'UPSTREAM_ERROR'], QUOTA: [503, 'UPSTREAM_LIMIT'] };

function intParam(v, min, max, dflt) {
  if (v == null || v === '') return dflt;
  if (!/^\d{1,4}$/.test(String(v))) throw new DataError(400, 'BAD_REQUEST');
  const n = Number(v);
  if (n < min) throw new DataError(400, 'BAD_REQUEST');
  return Math.min(n, max);
}
function ttlFor(p) {
  const t = CFG.cache.ttlByType || {};
  const ts = p.entityTypes.map(x => t[x]).filter(x => x > 0);
  return ts.length ? Math.min(...ts) : 3600e3;
}
/* upstream rows → shared schema validation (same rules as the browser); invalid rows are dropped */
function validate(list) {
  const out = []; let rejected = 0;
  for (const raw of list) { const v = Schema.validateEntity(raw); if (v.ok) out.push(v.entity); else rejected++; }
  return { items: out, rejected };
}

/* request body: a pre-parsed body (Vercel) or the raw stream (local server), at most BODY_MAX bytes */
function readJson(req) {
  if (req.body != null) {
    if (typeof req.body === 'object' && !(req.body instanceof Uint8Array)) return Promise.resolve(req.body);
    const s = String(req.body);
    if (s.length > BODY_MAX) return Promise.reject(new Error('too large'));
    return Promise.resolve(JSON.parse(s));
  }
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    const timer = setTimeout(() => reject(new Error('timeout')), 3000);
    req.on('data', c => { size += c.length; if (size > BODY_MAX) { clearTimeout(timer); reject(new Error('too large')); req.destroy && req.destroy(); } else chunks.push(c); });
    req.on('end', () => { clearTimeout(timer); try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null')); } catch (e) { reject(e); } });
    req.on('error', e => { clearTimeout(timer); reject(e); });
  });
}
/* photo records from TourAPI detailImage2, re-checked with the shared URL/text rules */
function validPhotos(list) {
  const v = Schema.validateEntity({ type: 'place', provider: 'x', providerId: 'x', title: 'x', source: { providerName: 'x' }, photos: list });
  return v.ok ? v.entity.photos : [];
}

export function createDataHandler({ env = process.env, fetcher = fetch, cache = createServerCache(env, fetcher), now = () => Date.now(), log = null } = {}) {
  const inflight = new Map();
  const privateCache = memoryCache({ maxEntries: 200 });   /* never shared/persistent: nearby place results only */
  const warn = log || ((...a) => { if (!env.VERCEL && env.NODE_ENV !== 'production') console.warn(...a); });
  /* diagnostics: counters + fixed codes per provider id — nothing request-specific is kept */
  const diag = new Map();
  const rec = id => { if (!diag.has(id)) diag.set(id, { requests: 0, cacheHits: 0, cacheMisses: 0, upstreamLoads: 0, status: null, lastErrorCategory: null, lastAt: null }); return diag.get(id); };
  function track(id, what) { const d = rec(id); if (what === 'hit') d.cacheHits++; else if (what === 'miss') d.cacheMisses++; else if (what === 'load') d.upstreamLoads++; }
  function outcome(id, status, category = null) { const d = rec(id); d.status = status; d.lastErrorCategory = category; d.lastAt = new Date(now()).toISOString(); }
  function diagnostics() {
    const out = {};
    for (const p of Object.values(PROVIDERS)) {
      const d = diag.get(p.id) || rec(p.id);
      const configured = !!p.configured(env);
      out[p.id] = { configured, status: configured ? d.status || 'configured' : 'unconfigured', lastErrorCategory: d.lastErrorCategory, lastAt: d.lastAt,
        requests: d.requests, cacheHits: d.cacheHits, cacheMisses: d.cacheMisses, upstreamLoads: d.upstreamLoads };
    }
    return out;
  }

  async function entities(p, filter = {}) {
    const fk = Object.keys(filter).sort().map(k => k + '=' + filter[k]).join('&');
    const key = `livon:data:v1:${p.id}${fk ? ':' + fk : ''}`;
    const hit = await cache.get(key);
    if (hit && Array.isArray(hit.items)) { track(p.id, 'hit'); return { ...hit, cached: true }; }
    track(p.id, 'miss');
    if (inflight.has(key)) return inflight.get(key);
    const job = (async () => {
      track(p.id, 'load');
      const loaded = await p.load({ env, fetcher, now: now(), filter });
      /* multi-source providers return { items, partial }: a partial result is cached only briefly */
      const raw = Array.isArray(loaded) ? loaded : (loaded && loaded.items) || [];
      const partial = !Array.isArray(loaded) && !!(loaded && loaded.partial);
      const { items, rejected } = validate(raw);
      if (raw.length && !items.length) throw invalidData();      /* schema mismatch ≠ zero results */
      const value = { items, rejected, fetchedAt: new Date(now()).toISOString() };
      await cache.set(key, value, partial && p.partialTtl ? Math.min(p.partialTtl, ttlFor(p)) : ttlFor(p));
      return { ...value, cached: false };
    })().finally(() => inflight.delete(key));
    inflight.set(key, job);
    return job;
  }

  /* on-demand search (one upstream page per request, cached, identical concurrent requests share one call) */
  async function searchPage(p, params) {
    const key = p.cacheKey(params);
    const store = p.privateCache(params) ? privateCache : cache;
    const hit = await store.get(key);
    if (hit && Array.isArray(hit.items)) { track(p.id, 'hit'); return { ...hit, cached: true }; }
    track(p.id, 'miss');
    if (inflight.has(key)) return inflight.get(key);
    const job = (async () => {
      track(p.id, 'load');
      const r = await p.search({ env, fetcher, now: now(), params });
      const { items, rejected } = validate(r.items);
      if (r.items.length && !items.length) throw invalidData();  /* schema mismatch ≠ zero results */
      const hasMore = typeof r.hasMore === 'boolean' ? r.hasMore
        : !r.isEnd && params.page * params.size < (r.pageableCount == null ? kakaoWindow : Math.min(r.pageableCount, kakaoWindow));
      const value = { items, rejected, hasMore, total: r.total !== undefined ? r.total : r.pageableCount, fetchedAt: r.fetchedAt };
      if (Array.isArray(r.photos)) value.photos = validPhotos(r.photos);
      await store.set(key, value, p.ttl(params));
      return { ...value, cached: false };
    })().finally(() => inflight.delete(key));
    inflight.set(key, job);
    return job;
  }

  /* POST /api/livon/data  {provider, action:"nearby", lat, lng, radius, …} — the only POST; body ≤ 2 KB JSON */
  async function handlePost(req, res) {
    const ct = String((req.headers && (req.headers['content-type'] || req.headers['Content-Type'])) || '');
    const url = new URL(req.url || '/', 'http://local');
    /* anything but a JSON body with an empty query string is not the nearby action: same 405 as before */
    if (!/^application\/json\b/i.test(ct) || [...url.searchParams.keys()].length) { res.setHeader('Allow', 'GET, POST'); throw new DataError(405, 'METHOD_NOT_ALLOWED'); }
    let body;
    try { body = await readJson(req); } catch { throw new DataError(400, 'BAD_REQUEST'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new DataError(400, 'BAD_REQUEST');
    const keys = Object.keys(body);
    if (keys.some(k => !POST_KEYS.includes(k)) || body.action !== 'nearby') throw new DataError(400, 'BAD_REQUEST');
    const id = typeof body.provider === 'string' ? body.provider : '';
    if (!/^[a-z0-9-]{2,40}$/.test(id) || !Object.prototype.hasOwnProperty.call(PROVIDERS, id)) throw new DataError(404, 'UNKNOWN_PROVIDER');
    const p = PROVIDERS[id];
    if (p.mode !== 'search' || !p.params.includes('lat')) throw new DataError(400, 'BAD_REQUEST');
    const raw = {};
    for (const k of keys) {
      if (k === 'provider' || k === 'action') continue;
      if (!p.params.includes(k)) throw new DataError(400, 'BAD_REQUEST');
      const v = body[k];
      if (v == null) continue;
      if (typeof v !== 'string' && typeof v !== 'number') throw new DataError(400, 'BAD_REQUEST');
      raw[k] = String(v);
    }
    if (raw.lat == null || raw.lng == null) throw new DataError(400, 'BAD_REQUEST');
    return runSearch(p, raw, res);
  }

  /* shared by GET and POST: validate → configured? → one upstream page */
  async function runSearch(p, raw, res) {
    if (raw.page != null && !/^\d{1,4}$/.test(raw.page)) throw new DataError(400, 'BAD_REQUEST');
    if (raw.limit != null && !/^\d{1,4}$/.test(raw.limit)) throw new DataError(400, 'BAD_REQUEST');
    let params;
    try { params = p.parse(raw); } catch { throw new DataError(400, 'BAD_REQUEST'); }
    if (!p.configured(env)) throw new DataError(503, 'NOT_CONFIGURED');
    const lim = params.size != null ? params.size : params.rows;
    if (p.empty(params)) return json(res, 200, { ok: true, provider: p.id, page: params.page, limit: lim, total: null, hasMore: false, fetchedAt: null, cached: false, items: [] });
    let data;
    rec(p.id).requests++;
    try { data = await searchPage(p, params); outcome(p.id, 'available'); }
    catch (err) { outcome(p.id, stateForError(err && err.code), (err && UPSTREAM_CODES[err.code] && err.code) || 'UNKNOWN'); const m = UPSTREAM_CODES[err && err.code] || [502, 'UPSTREAM_ERROR']; throw new DataError(m[0], m[1]); }
    const out = { ok: true, provider: p.id, page: params.page, limit: lim, total: data.total, hasMore: data.hasMore, fetchedAt: data.fetchedAt, cached: data.cached, items: data.items };
    if (data.photos) out.photos = data.photos;
    return json(res, 200, out);
  }

  const handler = async (req, res) => {
    try {
      /* cross-origin frontend (GitHub Pages → API origin): exact allowlist only, see server/livon/cors.mjs */
      let cors;
      try { cors = applyCors(req, res, env, { methods: ['GET', 'POST'] }); } catch (e) { if (e instanceof CorsError) throw new DataError(403, 'ORIGIN_NOT_ALLOWED'); throw e; }
      if (cors.preflight) { res.statusCode = 204; res.setHeader('Cache-Control', 'no-store'); return res.end(); }
      if (req.method === 'POST') return await handlePost(req, res);
      if (req.method !== 'GET') { res.setHeader('Allow', 'GET, POST, OPTIONS'); throw new DataError(405, 'METHOD_NOT_ALLOWED'); }
      const url = new URL(req.url || '/', 'http://local');
      const keys = [...url.searchParams.keys()];
      if (keys.some(k => !ALL_KEYS.includes(k)) || keys.length > ALL_KEYS.length || new Set(keys).size !== keys.length) throw new DataError(400, 'BAD_REQUEST');
      const action = url.searchParams.get('action') || 'list';
      if (action === 'status') {
        const providers = {};
        for (const p of Object.values(PROVIDERS)) providers[p.id] = { configured: p.configured(env), entityTypes: p.entityTypes, ...(p.mode === 'search' ? { mode: 'search' } : {}) };
        return json(res, 200, { ok: true, providers });
      }
      /* internal diagnostics: opt-in and never in production (unknown action there — no hint that it exists) */
      if (action === 'diagnostics' && env.LIVON_DATA_DIAGNOSTICS === '1' && !isProductionEnv(env) && keys.length === 1) return json(res, 200, { ok: true, providers: diagnostics() });
      if (action !== 'list') throw new DataError(400, 'BAD_REQUEST');
      const id = url.searchParams.get('provider') || '';
      if (!/^[a-z0-9-]{2,40}$/.test(id) || !Object.prototype.hasOwnProperty.call(PROVIDERS, id)) throw new DataError(404, 'UNKNOWN_PROVIDER');
      const p = PROVIDERS[id];
      if (keys.some(k => k !== 'action' && k !== 'provider' && !(p.params || DEFAULT_PARAMS).includes(k))) throw new DataError(400, 'BAD_REQUEST');
      if (p.mode === 'search') {
        const raw = {}; for (const k of p.params) { const v = url.searchParams.get(k); if (v != null) raw[k] = v; }
        if (!p.getCoords && (raw.lat != null || raw.lng != null || raw.radius != null)) throw new DataError(400, 'BAD_REQUEST');   /* position → POST */
        return await runSearch(p, raw, res);
      }
      const page = intParam(url.searchParams.get('page'), 1, LIMITS.maxPage, 1);
      const limit = intParam(url.searchParams.get('limit'), 1, LIMITS.maxLimit, LIMITS.defaultLimit);
      const wanted = {};
      for (const k of (p.params || DEFAULT_PARAMS)) if (k !== 'page' && k !== 'limit' && url.searchParams.get(k) != null) wanted[k] = url.searchParams.get(k);
      let filter = {};
      if (Object.keys(wanted).length) {
        if (typeof p.filters !== 'function') throw new DataError(400, 'BAD_REQUEST');   /* provider has no filters */
        try { filter = p.filters(wanted); } catch { throw new DataError(400, 'BAD_REQUEST'); }
      }
      /* parameters are validated first so a bad request is always 400, configured or not */
      if (!p.configured(env)) throw new DataError(503, 'NOT_CONFIGURED');
      let data;
      rec(p.id).requests++;
      try { data = await entities(p, p.postFilter ? {} : filter); outcome(p.id, 'available'); }
      catch (err) { outcome(p.id, stateForError(err && err.code), (err && UPSTREAM_CODES[err.code] && err.code) || 'UNKNOWN'); const m = UPSTREAM_CODES[err && err.code] || [502, 'UPSTREAM_ERROR']; throw new DataError(m[0], m[1]); }
      /* post-filter providers: one cached window, filtered per request (no extra upstream call per filter) */
      const all = p.postFilter && Object.keys(filter).length ? data.items.filter(e => p.match(e, filter)) : data.items;
      const start = (page - 1) * limit;
      const items = all.slice(start, start + limit);
      return json(res, 200, { ok: true, provider: p.id, page, limit, total: all.length, hasMore: start + limit < all.length, fetchedAt: data.fetchedAt, cached: data.cached, items });
    } catch (error) {
      const safe = error instanceof DataError ? error : new DataError(500, 'SERVER_ERROR');
      warn('[LIVON DATA]', safe.code, safe.status); /* fixed code + status only: never keys, URLs or bodies */
      return json(res, safe.status, { ok: false, code: safe.code, error: ERROR_TEXT[safe.code] || ERROR_TEXT.SERVER_ERROR });
    }
  };
  handler.diagnostics = diagnostics;
  return handler;
}
