#!/usr/bin/env node
/**
 * LIVON data quality report (read-only). Loads the curated LIVON files, the Data Platform and the screen bridge exactly as
 * the browser does, then checks: duplicates · expired rows · rows without a source · invalid URLs · relation ids that point
 * to no detail page · empty categories · every search result opens an existing detail page · My Life save compatibility.
 *
 *   node scripts/livon-data-quality.mjs          → JSON report on stdout, exit 1 if a blocking problem is found
 */
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(ROOT, 'livon', f), 'utf8');

export function loadLivon({ lifeTopics, patch } = {}) {
  const mem = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; } }; };
  const ctx = {
    console: { log() {}, warn() {}, error() {} }, URL, Promise, setTimeout, clearTimeout, AbortController,
    localStorage: mem(), sessionStorage: mem(), navigator: {}, history: { state: null, replaceState() {}, pushState() {} },
    location: { hash: '', origin: 'https://www.newon.app', pathname: '/livon/', hostname: 'www.newon.app' },
    document: { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null }, contains: () => false },
    fetch: () => Promise.reject(new Error('offline')), addEventListener() {}
  };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of ['life-data.js', 'life-events-data.js', 'explore-data.js', 'community-data.js', 'today-data.js']) vm.runInContext(read(f), ctx, { filename: f });
  if (patch) patch(ctx);
  for (const f of ['data/livon-data-config.js', 'data/livon-data-schema.js', 'data/livon-data-platform.js', 'data/livon-screen-data.js', 'life-hub.js', 'explore-search.js', 'data/livon-content-quality.js', 'livon-personalization.js']) vm.runInContext(read(f), ctx, { filename: f });
  ctx.LivonLifeHub.repo.use(lifeTopics || JSON.parse(read('life-topics.json')));
  return ctx;
}

export function qualityReport(ctx) {
  const SD = ctx.LivonScreenData, repo = SD.repository(), LT = ctx.LivonLifeHub.repo.data;
  const q = SD.quality();
  const safe = u => { try { const x = new URL(u); return (x.protocol === 'https:' || x.protocol === 'http:') && /\./.test(x.hostname); } catch { return false; } };
  const internal = u => /^\/[\w\-./#]*$/.test(u || '');
  /* invalid URLs in the curated files */
  const invalidUrls = [];
  for (const c of ctx.LivonTodayData.contents) if (c.officialUrl && !safe(c.officialUrl)) invalidUrls.push('td:' + c.id);
  for (const x of ctx.LivonExploreData.items) if (x.officialUrl && !safe(x.officialUrl) && !internal(x.officialUrl)) invalidUrls.push('ex:' + x.id);
  for (const p of LT.policies) if (!safe(p.sourceUrl)) invalidUrls.push('pol:' + p.id);
  /* relation ids that point to no detail page */
  const exists = id => !!repo.getById(id, { any: true });
  const dangling = [];
  const tools = new Set((ctx.LivonLifeData.stages || []).flatMap(s => (s.services || []).map(x => x.id)));
  for (const t of LT.topics) {
    for (const r of [...t.relatedContentIds, ...t.relatedClassIds, ...t.relatedPlaceIds]) { const id = /^td:/.test(r) ? r : 'ex:' + r.replace(/^ex:/, ''); if (!exists(id)) dangling.push(t.id + ' → ' + r); }
    for (const r of t.relatedPolicyIds) if (!exists('pol:' + r)) dangling.push(t.id + ' → pol:' + r);
    for (const r of t.relatedServiceIds) if (!exists('svc:' + r)) dangling.push(t.id + ' → svc:' + r);
    for (const r of t.relatedTopicIds) if (!exists('topic:' + r)) dangling.push(t.id + ' → topic:' + r);
  }
  /* tool ids are resolved by LivonServices at runtime (not all are LIVON data rows) — reported separately, not blocking */
  const unresolvedTools = [...new Set(LT.topics.flatMap(t => t.relatedToolIds).filter(id => !tools.has(id)))];
  /* empty categories */
  const exploreCats = ctx.LivonExploreData.categories.map(c => ({ id: c.id, n: SD.exploreItems().filter(x => (x.categoryIds || []).includes(c.id)).length }));
  const todayTypes = ['place', 'experience', 'learn', 'together', 'season', 'life', 'editorial', 'event'].map(k => ({ id: k, n: SD.todayContents().filter(c => c.type === k).length }));
  const stageTopics = LT.stages.map(s => ({ id: s.id, n: SD.topics().filter(t => t.lifeStageId === s.id).length }));
  /* every search index entry opens an existing detail page */
  const S = ctx.LivonSearch;
  const probe = ['이사', '독립', '취업', '건강', '육아', '여행', '도서관', '연금', '자격증', '청년', '돌봄', '창업', '주거', '클래스'];
  const badHref = new Set(), seenKeys = new Map(); let results = 0; const typesSeen = {};
  const todayIds = new Set(SD.todayContents().map(c => c.id)), exIds = new Set(SD.exploreItems().map(x => x.id));
  const topicRoutes = new Set(SD.topics().map(t => '#life/' + t.stageSlug + '/' + t.slug)), svcRoutes = new Set(SD.serviceTypes().map(s => '#life/services/' + s.id));
  const leIds = new Set(SD.lifeEvents().map(e => e.id));
  for (const qy of probe) {
    const r = S.search(qy, {});
    for (const h of r.items) {
      const it = h.item; results++;
      typesSeen[it.typeLabel] = (typesSeen[it.typeLabel] || 0) + 1;
      if (seenKeys.has(qy + '|' + it.key)) badHref.add('duplicate:' + it.key); seenKeys.set(qy + '|' + it.key, 1);
      const href = it.href || '';
      const ok = /^https:\/\//.test(href) ? true
        : /^#today\//.test(href) ? todayIds.has(href.slice(7))
        : /^#ex-item-/.test(href) ? exIds.has(href.slice(9))
        : /^#life\/services\//.test(href) ? svcRoutes.has(href)
        : /^#life\/[1-7]0s\//.test(href) ? topicRoutes.has(href)
        : href === '#life-events' ? leIds.has(it.eventId)
        : /^#cm-post-/.test(href) ? true : false;
      if (!ok) badHref.add(it.key + ' → ' + href);
    }
  }
  /* ── extended checks (Real Data Integration V1) ── */
  const reps = repo.report();
  const sum = (key, codes) => reps.reduce((n, r) => n + codes.reduce((m, c) => m + ((r[key] || {})[c] || 0), 0), 0);
  /* held records (review hold, LIVON Next V1) stay in the inventory: they exist, are not shown, and relations to them are not broken */
  const all = repo.all({ includeSamples: true, includeUnsourced: true, includeExpired: true, includeDuplicates: true, includeHeld: true });
  const heldIds = all.filter(e => repo.hiddenReason(e.id) === 'review').map(e => e.id);
  const idCount = {}, srcCount = {};
  all.forEach(e => { idCount[e.id] = (idCount[e.id] || 0) + 1; if (e.sourceId && e.sourceType !== 'editorial' && e.sourceType !== 'internal') srcCount[e.sourceId] = (srcCount[e.sourceId] || 0) + 1; });
  const orphanRelations = [];
  all.forEach(e => Object.values(e.relations || {}).flat().forEach(id => { if (!repo.getById(id, { any: true }) && !/^tool:/.test(id)) orphanRelations.push(e.id + ' → ' + id); }));
  const exCatIds = new Set(ctx.LivonExploreData.categories.map(c => c.id));
  const todayTypes8 = new Set(['place', 'experience', 'learn', 'together', 'season', 'life', 'editorial', 'event']);
  const unsupportedCategory = ctx.LivonExploreData.items.flatMap(x => (x.categoryIds || []).filter(c => !exCatIds.has(c)).map(c => 'ex:' + x.id + ' ' + c))
    .concat(ctx.LivonTodayData.contents.filter(c => !todayTypes8.has(c.type)).map(c => 'td:' + c.id + ' ' + c.type));
  /* time-bound curated rows without an official date: kept undated on purpose (evergreen portals / guides) — never guessed */
  const timeBound = { event: 1, program: 1, policy: 1, class: 1 };
  const undatedTimeBound = all.filter(e => timeBound[e.type] && (e.sourceType === 'editorial' || e.sourceType === 'official' || e.sourceType === 'internal')
    && !e.startDate && !e.endDate && !e.applicationEnd && !e.expiresAt).map(e => e.id);
  const now = Date.now();
  const checks = {
    missingId: sum('errorCodes', ['id']),
    duplicateId: reps.reduce((n, r) => n + r.duplicates, 0) + Object.values(idCount).filter(n => n > 1).length,
    duplicateSourceId: Object.values(srcCount).filter(n => n > 1).length,
    invalidUrl: sum('warningCodes', ['sourceUrl:invalid', 'officialUrl:invalid', 'bookingUrl:invalid']),
    missingSource: sum('errorCodes', ['sourceName', 'sourceType', 'policy:officialUrl']) + q.unsourced,
    invalidDate: sum('warningCodes', ['startDate:invalid', 'endDate:invalid', 'applicationStart:invalid', 'applicationEnd:invalid', 'expiresAt:invalid', 'updatedAt:invalid', 'retrievedAt:invalid', 'publishedAt:invalid', 'sourceUpdatedAt:invalid', 'lastCheckedAt:invalid']) + sum('errorCodes', ['event:startDate']),
    endBeforeStart: sum('warningCodes', ['endDate:before-start', 'applicationEnd:before-start']),
    expired: all.filter(e => repo.hiddenReason(e.id) === 'expired').length,
    stale: all.filter(e => !repo.hiddenReason(e.id) && repo.freshness(e) === 'stale').length,   /* shown and stale */
    held: { count: heldIds.length, note: 'review overdue and the source could not be re-checked — kept in the files, not shown, nothing deleted', ids: heldIds },
    orphanRelations,
    invalidEntityType: sum('errorCodes', ['type']),
    unsupportedCategory,
    missingTitle: sum('errorCodes', ['title']),
    malformedCoordinates: sum('warningCodes', ['coordinates:dropped']),
    rejected: reps.reduce((n, r) => n + r.rejected, 0),
    undatedTimeBound: { count: undatedTimeBound.length, note: 'curated portals/guides without an official date — left null on purpose (dates are never guessed)', ids: undatedTimeBound }
  };
  const blocking = q.duplicates + q.unsourced + invalidUrls.length + dangling.length + badHref.size
    + checks.missingId + checks.duplicateId + checks.invalidEntityType + checks.missingTitle + orphanRelations.length + unsupportedCategory.length;
  return {
    counts: { total: q.total, visible: q.visible, sample: q.sample, expired: q.expired, unsourced: q.unsourced, draft: q.draft, held: q.held, comingSoon: q.comingSoon, duplicates: q.duplicates, sameTitleVariants: q.sameTitleVariants, bySourceType: q.bySourceType, byType: q.byType },
    /* placed / shippable: a record on review hold is not expected on a screen (counted under checks.held) */
    screens: { today: SD.todayContents().length + '/' + ctx.LivonTodayData.contents.filter(c => c.publishStatus !== 'review').length, explore: SD.exploreItems().length + '/' + ctx.LivonExploreData.items.filter(x => x.publishStatus !== 'review').length,
      lifeEvents: SD.lifeEvents().length + '/' + ctx.LivonLifeEvents.events.length, topics: SD.topics().length + '/' + LT.topics.length,
      policies: SD.policies().length + '/' + LT.policies.length, serviceTypes: SD.serviceTypes().length + '/' + LT.serviceTypes.length },
    invalidUrls, dangling, unresolvedTools,
    emptyCategories: { explore: exploreCats.filter(c => !c.n).map(c => c.id), today: todayTypes.filter(c => !c.n).map(c => c.id), lifeStages: stageTopics.filter(c => !c.n).map(c => c.id) },
    search: { probes: probe.length, results, byTypeLabel: typesSeen, brokenOrDuplicate: [...badHref] },
    freshness: q.freshness, checks,
    blocking
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rep = qualityReport(loadLivon());
  console.log(JSON.stringify(rep, null, 2));
  process.exit(rep.blocking ? 1 : 0);
}
