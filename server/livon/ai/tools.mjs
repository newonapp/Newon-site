/*
 * LIVON AI data tools — server side, read-only.
 *
 * LIVON AI must not be a plain chat wrapper: before a question goes to the model, the server looks up real LIVON items
 * (Life Stage topics, Life Events, Today, Explore, official policy portals, services) through the SAME Data Platform the
 * browser uses (livon/data/livon-data-platform.js), and passes a few of them as "LIVON 참고 항목" (kind · title · link).
 *
 *   searchLivonData(query, filters)        → items across all entity types (type is always included)
 *   getLifeEventContext(idOrQuery, opts)   → a Life Event with its topics and related policies/services/…
 *   getRelatedServices(idOrQuery)          → services related to an item (explicit links first, then rules)
 *   getRelatedPolicies(idOrQuery)          → official policy portals related to an item
 *   groundingRefs(input)                   → ≤ LIMITS.refs references for the chat request (REF_HREF-valid only)
 *
 * Rules
 *   - Read-only. Nothing the user types is stored, logged or written anywhere by these tools.
 *   - Only published, sourced, non-sample, non-expired records (Data Platform default visibility).
 *   - Output is kind/title/href (+ type/source for tools) — never raw provider payloads, never My Life data.
 *   - Curated files are loaded once per server instance (vercel.json includeFiles ships them with the function).
 */
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIMITS, REF_HREF } from '../chat.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const CATALOG_FILES = Object.freeze([
  'livon/life-data.js', 'livon/life-events-data.js', 'livon/today-data.js', 'livon/explore-data.js', 'livon/community-data.js',
  'livon/data/livon-data-config.js', 'livon/data/livon-data-schema.js', 'livon/data/livon-data-platform.js'
]);
export const LIFE_TOPICS_FILE = 'livon/life-topics.json';

let cached = null;

/* load the curated LIVON files in an isolated context (no network, no timers, no DOM) and build the repository */
export function loadCatalog({ root = ROOT, adapters = [], now } = {}) {
  const ctx = { console: { log() {}, warn() {}, error() {} }, URL, Promise, Date, Math, JSON, Object, Array, String, Number, RegExp };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of CATALOG_FILES) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f, timeout: 2000 });
  const lifeTopics = JSON.parse(fs.readFileSync(path.join(root, LIFE_TOPICS_FILE), 'utf8'));
  const P = ctx.LivonDataPlatform;
  const repo = P.createRepository({ now, adapters: [P.StaticAdapter({ lifeTopics }), ...adapters.map(a => typeof a === 'function' ? a(P) : a)] });
  return repo.load().then(() => ({ platform: P, repo }));
}
export function catalog(opts) {
  if (opts) return loadCatalog(opts);
  if (!cached) cached = loadCatalog().catch(e => { cached = null; throw e; });
  return cached;
}
export function resetCatalog() { cached = null; }

function compact(e) {
  return { id: e.id, type: e.type, kind: KIND[e.type] || e.type, title: e.title, summary: e.summary || null, href: e.href || null,
    region: e.region || null, sourceName: e.sourceName, sourceType: e.sourceType, verification: e.verificationStatus };
}
/* labels the model sees; mirrors the Data Platform TYPE_LABEL */
const KIND = { content: '콘텐츠', lifeStage: '라이프 스테이지', lifeEvent: '라이프 이벤트', place: '장소', event: '행사', program: '프로그램',
  policy: '정책·지원 (공식 포털)', expert: '전문가 (공공 공개 정보)', provider: '기관', service: '서비스', class: '클래스', communityContent: '커뮤니티' };

async function resolve(repo, idOrQuery, types) {
  const direct = repo.getById(String(idOrQuery || ''));
  if (direct) return direct;
  const hit = repo.search(String(idOrQuery || ''), { limit: 1, types }).items[0];
  return hit ? hit.entity : null;
}

export async function searchLivonData(query, filters = {}, opts) {
  const { repo } = await catalog(opts);
  const r = repo.search(String(query || '').slice(0, 200), { ...filters, limit: Math.min(Number(filters.limit) || 8, 20) });
  return { query: r.query, total: r.total, byType: r.byType || {}, items: r.items.map(x => compact(x.entity)) };
}
export async function getLifeEventContext(idOrQuery, { lifeStage } = {}, opts) {
  const { repo } = await catalog(opts);
  const c = repo.getLifeEventContext(String(idOrQuery || '').slice(0, 120), { lifeStage });
  if (!c) return null;
  const related = {};
  for (const [k, v] of Object.entries(c.related)) related[k] = v.slice(0, 5).map(x => compact(x.entity));
  return { lifeEvent: compact(c.lifeEvent), checklist: c.lifeEvent.checklist || [], topics: c.topics.slice(0, 6).map(compact), related };
}
async function relatedOfType(idOrQuery, type, opts) {
  const { repo } = await catalog(opts);
  const e = await resolve(repo, idOrQuery);
  if (!e) return [];
  const out = repo.getRelatedItems(e.id, { types: [type], limit: 6, minScore: 2 }).map(r => compact(r.entity));
  if (out.length) return out;
  return repo.search(e.title, { types: [type], limit: 4 }).items.map(x => compact(x.entity));
}
export const getRelatedServices = (idOrQuery, opts) => relatedOfType(idOrQuery, 'service', opts);
export const getRelatedPolicies = (idOrQuery, opts) => relatedOfType(idOrQuery, 'policy', opts);

/* keywords from a question: Korean/latin words of 2+ chars, common endings and filler removed */
const STOP = new Set(['알려줘', '알려', '주세요', '해줘', '뭐부터', '어떻게', '무엇', '뭐가', '있어', '있나요', '좋을까', '추천', '방법', '준비해', '하고', '싶어', '싶은데', '이번', '그리고', '정리해', '만들어', '줘']);
export function keywords(text) {
  return [...new Set(String(text || '').toLowerCase().replace(/[^0-9a-z가-힣\s]/g, ' ').split(/\s+/)
    .map(w => w.replace(/(을|를|이|가|은|는|에|의|도|와|과|로|으로|에서|하고|까지|부터|해|해줘|할래|하려면|하는|할)$/u, ''))
    .filter(w => w.length >= 2 && !STOP.has(w)))].slice(0, 6);
}

/*
 * groundingRefs(input) → [{kind,title,href}] — server-side retrieval for one chat request.
 * Client refs keep priority; the server only fills the remaining slots. Every href must pass REF_HREF.
 */
export async function groundingRefs(input, { limit = LIMITS.refs, opts } = {}) {
  const have = Array.isArray(input.refs) ? input.refs : [];
  if (have.length >= limit) return have;
  const { repo } = await catalog(opts);
  const page = input.context && input.context.page;
  const words = keywords([input.message, page && page.topicTitle].filter(Boolean).join(' '));
  if (!words.length) return have;
  const score = new Map();
  const add = (items, w) => items.forEach((x, i) => {
    const e = x.entity;
    if (!e.href || !REF_HREF.test(e.href) || e.type === 'lifeStage') return;
    const prev = score.get(e.id) || { e, s: 0 };
    prev.s += w * (8 - i); score.set(e.id, prev);
  });
  add(repo.search(words.join(' '), { limit: 8 }).items, 2);
  for (const w of words) add(repo.search(w, { limit: 6 }).items, 1);
  const lifeStage = page && page.lifeStage ? String(page.lifeStage) : undefined;
  const ranked = [...score.values()]
    .filter(x => !lifeStage || !x.e.lifeStages.length || x.e.lifeStages.includes(lifeStage.replace(/[^0-9]/g, '').slice(0, 2)))
    .sort((a, b) => b.s - a.s);
  const seen = new Set(have.map(r => r.href));
  const out = have.slice();
  for (const x of ranked) {
    if (out.length >= limit) break;
    if (seen.has(x.e.href)) continue;
    seen.add(x.e.href);
    out.push({ kind: KIND[x.e.type] || 'LIVON', title: String(x.e.title).slice(0, 120), href: x.e.href });
  }
  return out;
}
