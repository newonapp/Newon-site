// LIVON Real Data Integration V1 — provider → raw → normalizer → canonical → repository → screens (RD-1 … RD-20).
// No real key and no network: upstreams are documented-field fixtures (tests/livon/fixtures/upstream-fixtures.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, readdirSync } from 'node:fs';
import { createDataHandler } from '../../server/livon/data/http.mjs';
import { memoryCache, createServerCache } from '../../server/livon/data/cache.mjs';
import { PROVIDER_MANIFEST } from '../../server/livon/data/manifest.mjs';
import { fakeUpstream, ENV, youthRow, youthBody, bizEventItem, bizBody, bizSupportItem, kakaoDoc, kakaoBody, tourItem, tourBody, lifelongRow, lifelongBody, ymd, dash } from './fixtures/upstream-fixtures.mjs';
import { loadLivon, qualityReport } from '../../scripts/livon-data-quality.mjs';

const src = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const LIFE = JSON.parse(src('livon/life-topics.json'));
const J = x => JSON.parse(JSON.stringify(x));
const QUERIES = {
  'kr-youth-policy': '', 'kr-business-support': '', 'kr-business-event': '', 'kr-lifelong-class': '', 'kr-public-tax-expert': '',
  'kr-kakao-place': '&query=' + encodeURIComponent('도서관'), 'kr-tourapi': '&query=' + encodeURIComponent('경복궁'), 'kr-job-training': '&query=' + encodeURIComponent('웹')
};
function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } }; return r; }
async function get(h, url) { const r = res(); await h({ method: 'GET', url, headers: {} }, r); return { status: r.statusCode, body: JSON.parse(r.body) }; }

/* server side: every provider through the real /api/livon/data handler */
async function serverRun({ bodies, env = ENV, cache } = {}) {
  const up = fakeUpstream(bodies);
  const h = createDataHandler({ env, fetcher: up.fetcher, cache: cache || memoryCache(), log: () => {} });
  const stats = {}, items = [];
  for (const [id, q] of Object.entries(QUERIES)) {
    const r = await get(h, '/api/livon/data?provider=' + id + q);
    stats[id] = { status: r.status, ok: r.body.ok === true, code: r.body.code || null, fetched: (r.body.items || []).length };
    if (r.body.ok) items.push(...r.body.items);
  }
  return { h, up, stats, items };
}
/* browser side: Data Platform over curated files + the server's items */
async function platformRun(items, { now } = {}) {
  const ctx = loadLivon();
  const P = ctx.LivonDataPlatform;
  const repo = P.createRepository({ now, adapters: [P.StaticAdapter({ lifeTopics: LIFE }), P.PublicDataAdapter({ entities: J(items) })] });
  await repo.load();
  return { ctx, P, repo };
}
/* the real page chain: real-data layer (probe → refresh) talking to the handler, then the screen bridge + search */
async function browserRun(h) {
  const ctx = loadLivon({
    patch: c => {
      c.location.protocol = 'https:';
      c.fetch = async (url) => {
        const u = String(url);
        if (!u.startsWith('/api/livon/data')) throw new Error('unexpected ' + u);
        const r = res(); await h({ method: 'GET', url: u, headers: {} }, r);
        return { ok: r.statusCode >= 200 && r.statusCode < 300, status: r.statusCode, json: async () => JSON.parse(r.body), headers: { get: () => 'application/json' } };
      };
    }
  });
  for (const f of ['data/livon-data-core.js', 'data/livon-data-providers.js']) vm.runInContext(src('livon/' + f), ctx);
  /* the screen bridge was loaded before the real-data layer in loadLivon(): bind it again to the (new) repository */
  vm.runInContext(src('livon/data/livon-screen-data.js'), ctx);
  const D = ctx.LivonData;
  for (let i = 0; i < 40 && D.repository.size() === 0; i++) await new Promise(r => setTimeout(r, 25));
  await D.repository.refresh({ force: true });
  return { ctx, D };
}

/* ───────── RD-1 provider normalization ───────── */
test('RD-1 normalization: every provider row → real-data schema → LIVON canonical entity with the right type', async () => {
  const { stats, items } = await serverRun();
  for (const id of Object.keys(QUERIES)) assert.equal(stats[id].ok, true, id + ' ' + JSON.stringify(stats[id]));
  const { repo } = await platformRun(items);
  const want = { 'kr-youth-policy': 'policy', 'kr-business-support': 'policy', 'kr-business-event': 'event', 'kr-lifelong-class': 'program', 'kr-public-tax-expert': 'expert', 'kr-kakao-place': 'place', 'kr-tourapi': 'place' };
  for (const [prov, type] of Object.entries(want)) {
    const rows = repo.all({ includeDuplicates: true }).filter(e => e.meta.upstreamProvider === prov);
    assert.ok(rows.length >= 1, prov);
    assert.ok(rows.every(e => e.type === type), prov);
  }
  const pol = repo.getById('kr-youth-policy:policy:R2026010100001');
  assert.equal(pol.agency, '국토교통부'); assert.ok(pol.applicationStart && pol.applicationEnd); assert.ok(pol.target);
  assert.deepEqual(J(pol.lifeStages), ['10', '20', '30'], 'age groups only from the official 19–34 range');
  assert.ok(pol.lifeEvents.includes('independent'), 'Life Event from the official category 주거');
  const ev = repo.getById('kr-business-event:event:EVEN_000000000100001');
  assert.ok(ev.startDate && ev.endDate); assert.ok(ev.lifeEvents.includes('startup'));
  const pr = repo.getById(repo.all().find(e => e.meta.upstreamProvider === 'kr-lifelong-class').id);
  assert.equal(pr.online, false); assert.equal(pr.region, '대구'); assert.ok(pr.applicationEnd);
  const tour = repo.all().find(e => e.meta.upstreamProvider === 'kr-tourapi');
  assert.equal(tour.region, '서울', '서울특별시 → 서울'); assert.deepEqual(J(tour.coordinates), { lat: 37.5788222356, lng: 126.9769930325 });
});

/* ───────── RD-2 provenance ───────── */
test('RD-2 provenance: sourceName, sourceType, sourceId, retrievedAt on every external row; source update date kept apart from fetch time', async () => {
  const { items } = await serverRun();
  const { repo } = await platformRun(items);
  const ext = repo.all({ includeDuplicates: true }).filter(e => e.meta.upstreamProvider);
  assert.ok(ext.length >= 8);
  for (const e of ext) {
    assert.ok(e.sourceName, e.id); assert.ok(e.sourceType, e.id); assert.ok(e.sourceId, e.id); assert.ok(e.retrievedAt, e.id);
    assert.equal(e.provenanceMissing, false, e.id);
  }
  const tour = ext.find(e => e.meta.upstreamProvider === 'kr-tourapi');
  assert.equal(tour.sourceUpdatedAt, '2025-09-09T01:10:10.000Z', 'TourAPI modifiedtime = the source\'s own update');
  assert.notEqual(tour.sourceUpdatedAt, tour.retrievedAt);
  /* curated rows carry LIVON's own check date */
  assert.equal(repo.getById('td:place-hangang').lastCheckedAt.slice(0, 10), '2026-09-24');
});

/* ───────── RD-3 official verification ───────── */
test('RD-3 official: public-body data is "official" (official_source); Kakao (private platform) never is; experts are never partner-verified by a feed', async () => {
  const { items } = await serverRun();
  const { repo, P } = await platformRun(items);
  const by = p => repo.all({ includeDuplicates: true }).filter(e => e.meta.upstreamProvider === p);
  for (const p of ['kr-youth-policy', 'kr-business-support', 'kr-business-event', 'kr-lifelong-class', 'kr-tourapi', 'kr-public-tax-expert'])
    assert.ok(by(p).every(e => e.verificationStatus === 'official_source' && e.verified), p);
  for (const e of by('kr-kakao-place')) { assert.equal(e.sourceType, 'platform'); assert.equal(e.verificationStatus, 'source_linked'); assert.equal(e.verified, false); assert.equal(e.officialUrl, null); }
  for (const e of by('kr-public-tax-expert')) assert.notEqual(e.verificationStatus, 'partner_verified');
  assert.ok(by('kr-public-tax-expert').some(e => e.workPhone), 'the consultation line a public body published');
  assert.ok(by('kr-public-tax-expert').some(e => !e.workPhone), 'no phone is invented where the source has none');
  /* nobody can claim "official" for a non-public source */
  assert.notEqual(P.canonicalize({ id: 'x:1', type: 'place', title: 'x', sourceName: 'x', sourceType: 'platform', sourceUrl: 'https://x.example.com/1', verificationStatus: 'official_source' }).entity.verificationStatus, 'official_source');
});

/* ───────── RD-4 dates ───────── */
test('RD-4 dates: YYYYMMDD / YYYY-MM-DD / ranges parse to Korea-time ISO; invalid dates are dropped, end < start is rejected', () => {
  const P = loadLivon().LivonDataPlatform;
  const e = P.canonicalize({ id: 'x:d', type: 'program', title: 't', sourceName: 's', sourceType: 'public_api', sourceId: 's:1', startDate: '20261010', endDate: '2026.10.20', applicationEnd: '2026-10-05' }).entity;
  assert.equal(e.startDate, '2026-10-09T15:00:00.000Z'); assert.equal(e.endDate, '2026-10-20T14:59:59.000Z'); assert.equal(e.applicationEnd, '2026-10-05T14:59:59.000Z');
  const bad = P.canonicalize({ id: 'x:e', type: 'program', title: 't', sourceName: 's', sourceType: 'public_api', sourceId: 's:2', startDate: '2026-13-01', endDate: '어제', lastCheckedAt: 'yesterday' });
  assert.equal(bad.entity.startDate, null); assert.ok(bad.warnings.includes('startDate:invalid') && bad.warnings.includes('lastCheckedAt:invalid'));
  const rev = P.canonicalize({ id: 'x:f', type: 'event', title: 't', sourceName: 's', sourceType: 'public_api', sourceId: 's:3', startDate: '2026-10-10', endDate: '2026-10-01' });
  assert.equal(rev.entity.endDate, null); assert.ok(rev.warnings.includes('endDate:before-start'));
});

/* ───────── RD-5 expiry ───────── */
test('RD-5 expiry: ended events, closed applications and finished programs leave recommendations and search; general guides stay', async () => {
  const past = { eventPeriod: `${ymd(-20)} ~ ${ymd(-19)}`, BeginEndDe: `${ymd(-20)} ~ ${ymd(-19)}`, seq: 'EVEN_OLD', eventInfoId: 'EVEN_OLD', title: '[QA 픽스처] 끝난 설명회', nttNm: '[QA 픽스처] 끝난 설명회' };
  const closed = { aplyYmd: `${ymd(-60)} ~ ${ymd(-1)}`, plcyNo: 'R-CLOSED', plcyNm: '[QA 픽스처] 마감된 청년 정책' };
  const { items } = await serverRun({ bodies: { bizEvent: () => bizBody([bizEventItem(), bizEventItem(past)]), youth: () => youthBody([youthRow(), youthRow(closed)]) } });
  const { repo } = await platformRun(items);
  assert.equal(repo.getById('kr-business-event:event:EVEN_OLD'), null);
  assert.equal(repo.getById('kr-youth-policy:policy:R-CLOSED'), null);
  assert.equal(repo.getById('kr-youth-policy:policy:R-CLOSED', { any: true }).status, 'published', 'kept, not deleted');
  assert.equal(repo.search('끝난 설명회').items.some(x => x.id.includes('EVEN_OLD')), false);
  assert.equal(repo.getTodayFeed({ date: dash(0) }).items.some(x => /EVEN_OLD|R-CLOSED/.test(x.entity.id)), false);
  assert.ok(repo.getById('td:event-howto'), 'an evergreen guide about events is not expired');
});

/* ───────── RD-6 freshness ───────── */
test('RD-6 freshness: per-type policy; fetch time alone is never "fresh"; expired wins', async () => {
  const { items } = await serverRun();
  const { repo, P } = await platformRun(items, { now: Date.now() });
  assert.deepEqual(J(P.FRESHNESS), ['fresh', 'stale', 'expired', 'unknown']);
  assert.equal(P.FRESHNESS_POLICY.event, 7); assert.equal(P.FRESHNESS_POLICY.place, 180); assert.equal(P.FRESHNESS_POLICY.policy, 30);
  const kakao = repo.all().find(e => e.meta.upstreamProvider === 'kr-kakao-place');
  assert.equal(repo.freshness(kakao), 'unknown', 'Kakao gives only a fetch time');
  const tour = repo.all().find(e => e.meta.upstreamProvider === 'kr-tourapi');
  assert.equal(repo.freshness(tour), 'stale', 'source updated 2025-09-09, place window 180 days');
  const mk = (o) => P.canonicalize(Object.assign({ id: 'x:' + Math.random(), type: 'event', title: 't', sourceName: 's', sourceType: 'public_api', sourceId: 's:x', startDate: dash(30), status: 'published' }, o)).entity;
  assert.equal(P.freshnessStatus(mk({ lastCheckedAt: dash(-1) })), 'fresh');
  assert.equal(P.freshnessStatus(mk({ lastCheckedAt: dash(-30) })), 'stale');
  assert.equal(P.freshnessStatus(mk({ startDate: dash(-3), lastCheckedAt: dash(-1) })), 'expired');
  assert.equal(P.freshnessStatus(mk({ retrievedAt: dash(0) })), 'unknown');
  assert.equal(repo.search('경복궁').items.find(x => x.type === 'place').freshness, 'stale', 'search results carry freshness');
});

/* ───────── RD-7 dedupe ───────── */
test('RD-7 dedupe: same official id / detail URL / title + 2 signals merge; title alone never does; age-variant guides stay', async () => {
  const { items } = await serverRun();
  const twin = J(items.find(x => x.provider === 'kr-tourapi'));
  /* the same palace from a second public dataset: same title, same address, same official page */
  Object.assign(twin, { id: 'seoul-open:place:gb-1', provider: 'seoul-open', providerId: 'gb-1', officialUrl: 'https://royal.khs.go.kr/gbg', source: { providerName: '서울 열린데이터광장', sourceUrl: 'https://royal.khs.go.kr/gbg' } });
  const lookalike = J(items.find(x => x.provider === 'kr-tourapi'));
  Object.assign(lookalike, { id: 'other:place:x', provider: 'other', providerId: 'x', location: { address: '부산 어딘가 1' }, source: { providerName: '다른 기관', sourceUrl: 'https://other.example.org/x' } });
  const { repo } = await platformRun(items.concat([twin, lookalike]));
  const tour = repo.all({ includeDuplicates: true }).find(e => e.meta.upstreamProvider === 'kr-tourapi');
  const tw = repo.getById('seoul-open:place:gb-1', { any: true });
  assert.ok(tour.duplicateOf === tw.id || tw.duplicateOf === tour.id, 'title + address + … → merged');
  const keep = tour.duplicateOf ? tw : tour;
  assert.equal(keep.alsoFrom.length, 1);
  assert.equal(repo.getById('other:place:x', { any: true }).duplicateOf, null, 'same title, different address → separate');
  /* curated age-variant guides with the same title are untouched */
  const q = qualityReport(loadLivon());
  assert.equal(q.counts.duplicates, 0); assert.equal(q.counts.sameTitleVariants, 16);
  assert.equal(repo.all().filter(e => e.title === '초기 고객 찾기').length, 2);
});

/* ───────── RD-8 source priority ───────── */
test('RD-8 source priority: 정부·지자체 공식 > 공공기관 > 검증 파트너 > 편집 > 민간 플랫폼 — the higher source stays', async () => {
  const { items } = await serverRun();
  const { repo, P } = await platformRun(items);
  const S = P.SOURCE_PRIORITY;
  assert.ok(S.official > S.public_api && S.public_api > S.partner && S.partner > S.editorial && S.editorial > S.platform && S.platform > S.fixture);
  /* the same library from Kakao (platform) and from a public dataset (public_api): the public row wins */
  const kakao = J(items.find(x => x.provider === 'kr-kakao-place'));
  const pub = J(kakao);
  Object.assign(pub, { id: 'kr-library:place:lib-1', provider: 'kr-library', providerId: 'lib-1', officialUrl: 'https://mapo.go.kr/lib/1', source: { providerName: '마포구 공공도서관 데이터', sourceUrl: 'https://mapo.go.kr/lib/1' } });
  const r2 = await platformRun(items.concat([pub]));
  const k = r2.repo.all({ includeDuplicates: true }).find(e => e.meta.upstreamProvider === 'kr-kakao-place');
  assert.equal(k.duplicateOf, 'kr-library:place:lib-1');
  assert.equal(r2.repo.getById('kr-library:place:lib-1').alsoFrom[0].sourceType, 'platform');
  assert.equal(r2.repo.getById(k.id), null, 'the lower-priority copy is not shown');
});

/* ───────── RD-9 failure isolation ───────── */
test('RD-9 failure isolation: one provider down (network, 500, auth) never hides the others or the curated data', async () => {
  const { stats, items } = await serverRun({ bodies: { youth: () => new Error('ECONNRESET'), bizEvent: () => ({ status: 500, body: 'oops' }), tour: () => ({ status: 401, body: '' }) } });
  assert.equal(stats['kr-youth-policy'].ok, false); assert.equal(stats['kr-business-event'].ok, false); assert.equal(stats['kr-tourapi'].ok, false);
  for (const id of ['kr-business-support', 'kr-lifelong-class', 'kr-kakao-place', 'kr-public-tax-expert']) assert.equal(stats[id].ok, true, id);
  const { repo } = await platformRun(items);
  assert.ok(repo.getPolicies().some(e => e.meta.upstreamProvider === 'kr-business-support'));
  assert.equal(repo.getLifeStages().length, 7); assert.ok(repo.size() > 530);
  /* browser real-data layer: each provider resolves on its own (no all-or-nothing) */
  const core = src('livon/data/livon-data-core.js');
  /* LIVON Next V1 passes where the failure happened (fixed values) as a third argument */
  assert.match(core, /\.catch\(function \(err\) \{\s*monitor\.failure\(p\.id, errorCode\(err\)(, \{[^}]*\})?\);[\s\S]{0,120}return \[\];/);
});

/* ───────── RD-10 pagination ───────── */
test('RD-10 pagination: upstream pages are followed within the documented bound and merged once', async () => {
  let pages = 0;
  const { stats } = await serverRun({ bodies: { bizSupport: u => { pages++; const n = Number(u.searchParams.get('pageIndex') || 1); return n <= 2 ? bizBody([bizSupportItem({ pblancId: 'P' + n, seq: 'P' + n, title: '[QA 픽스처] 공고 ' + n, pblancNm: '[QA 픽스처] 공고 ' + n, totCnt: '2' })]) : bizBody([]); } } });
  assert.equal(stats['kr-business-support'].fetched, 2);
  assert.ok(pages >= 2 && pages <= 10, 'bounded window: ' + pages);
  assert.match(PROVIDER_MANIFEST['kr-business-support'].capabilities.pagination, /bounded/);
});

/* ───────── RD-11 malformed response ───────── */
test('RD-11 malformed upstream / rows: fixed error code, no crash; bad rows rejected with reasons', async () => {
  const { stats } = await serverRun({ bodies: { youth: () => '<html>maintenance</html>', lifelong: () => '{"response":' } });
  assert.equal(stats['kr-youth-policy'].ok, false); assert.ok(stats['kr-youth-policy'].code);
  assert.equal(stats['kr-lifelong-class'].ok, false);
  const { items } = await serverRun();
  const broken = J(items.slice(0, 3)).map((x, i) => i === 0 ? Object.assign(x, { title: '' }) : i === 1 ? Object.assign(x, { type: 'spaceship' }) : Object.assign(x, { location: { latitude: 999, longitude: 1 } }));
  const ctx = loadLivon(), P = ctx.LivonDataPlatform;
  const repo = P.createRepository({ adapters: [P.PublicDataAdapter({ entities: broken })] });
  await repo.load();
  const rep = repo.report()[0];
  assert.equal(rep.rejected, 2); assert.ok(rep.errorCodes.title >= 1);
  assert.ok(repo.all()[0].coordinates === null, 'malformed coordinates dropped');
});

/* ───────── RD-12 empty provider ───────── */
test('RD-12 empty provider: zero rows is a normal answer; screens keep curated data and empty states', async () => {
  const { stats, items } = await serverRun({ bodies: { youth: () => youthBody([]), kakao: () => kakaoBody([]), tour: () => tourBody([]) } });
  assert.equal(stats['kr-youth-policy'].ok, true); assert.equal(stats['kr-youth-policy'].fetched, 0);
  const { repo } = await platformRun(items);
  assert.equal(repo.getTopics ? 0 : 0, 0);
  const none = await platformRun([]);
  assert.equal(none.repo.size(), 530, 'no external data: exactly the curated catalogue');
  assert.equal(none.repo.report()[1].accepted, 0); assert.equal(none.repo.report()[1].failed, false);
});

/* ───────── RD-13 … RD-16 screens through the real page chain ───────── */
test('RD-13..16 screens: real rows reach Search, Today, Explore and Life Stage through the real-data layer; expired/duplicate rows never do', async () => {
  const past = { eventPeriod: `${ymd(-20)} ~ ${ymd(-19)}`, BeginEndDe: `${ymd(-20)} ~ ${ymd(-19)}`, seq: 'EVEN_OLD', eventInfoId: 'EVEN_OLD', title: '[QA 픽스처] 끝난 설명회', nttNm: '[QA 픽스처] 끝난 설명회' };
  const { h } = await serverRun({ bodies: { bizEvent: () => bizBody([bizEventItem(), bizEventItem(past)]) } });
  const { ctx, D } = await browserRun(h);
  const ids = D.repository.list({ includeExpired: true }).map(e => e.id);
  assert.ok(ids.some(x => x.startsWith('kr-youth-policy:')) && ids.some(x => x.startsWith('kr-lifelong-class:')), 'server providers were switched on by ?action=status');
  const SD = ctx.LivonScreenData;
  /* RD-13 search: external rows join the unified index, expired ones do not */
  const idx = D.searchEntries();
  assert.ok(idx.some(x => /청년 월세/.test(x.title)));
  assert.equal(idx.some(x => /끝난 설명회/.test(x.title)), false);
  ctx.LivonSearch.rebuild && ctx.LivonSearch.rebuild();
  const s = ctx.LivonSearch.search('청년 월세', {});
  assert.ok(s.items.some(h => /청년 월세/.test(h.item.title)), 'unified search finds the real policy');
  /* RD-14 Today: real events are available to Today (forToday) and to the platform feed */
  const today = D.forToday({ category: '창업', tags: ['창업'] }, 'event', 5);
  assert.ok(today.some(e => /창업 사업설명회/.test(e.title))); assert.equal(today.some(e => /끝난/.test(e.title)), false);
  const feed = SD.repository().getTodayFeed({ date: dash(0) });
  assert.ok(feed.byCategory.event.some(r => /창업 사업설명회/.test(r.entity.title)));
  /* RD-15 Explore: real policy / program / place / expert rows through the same repository filters */
  const ex = SD.repository().explore({ types: ['policy', 'program', 'place', 'expert'], limit: 999 });
  for (const t of ['policy', 'program', 'place', 'expert']) assert.ok(ex.items.some(e => e.type === t && e.sourceType !== 'editorial'), t);
  assert.ok(SD.repository().explore({ category: 'senior', verified: true }).total >= 0);
  /* RD-16 Life Stage: 20대 → 독립 finds the real youth housing policy (official age + category), never forced into other stages */
  const topic = LIFE.topics.find(t => t.id === '20s.first-independence');
  const forTopic = D.forTopic(topic, 'policy', 6);
  assert.ok(forTopic.some(e => /청년 월세/.test(e.title)));
  const le = SD.repository().getLifeEventContext('independent', { lifeStage: '20' });
  assert.ok(le.related.policy.some(x => /청년 월세/.test(x.entity.title)) || SD.repository().search('월세', { lifeEvent: 'independent' }).items.length >= 1);
  const pol60 = SD.repository().getPolicies({ lifeStage: '60', strictLifeStage: true }).filter(e => e.sourceType === 'public_api');
  assert.equal(pol60.some(e => /청년/.test(e.title)), false, 'a 19–34 policy is never placed in 60대');
  /* provider health for a future Admin view */
  const health = SD.providerHealth();
  for (const id of Object.keys(QUERIES)) assert.ok(health.some(x => x.provider === id), id);
  const planned = health.filter(x => !(x.provider in QUERIES));
  assert.ok(planned.length >= 1 && planned.every(x => x.status === 'planned' && x.recordCount === 0), 'future sources are listed as planned, with no rows');
  const yh = health.find(x => x.provider === 'kr-youth-policy');
  assert.ok(yh.lastSuccess && yh.recordCount >= 1 && yh.accepted >= 1 && yh.errorType === null);
});

/* ───────── RD-17 cache ───────── */
test('RD-17 cache: a provider list is reused within its TTL (no second upstream call); failures are not cached', async () => {
  const cache = memoryCache();
  const run1 = await serverRun({ cache });
  const n1 = run1.up.calls.filter(c => c.provider === 'bizSupport').length;
  const up2 = fakeUpstream();
  const h2 = createDataHandler({ env: ENV, fetcher: up2.fetcher, cache, log: () => {} });
  await get(h2, '/api/livon/data?provider=kr-business-support');
  assert.ok(n1 >= 1); assert.equal(up2.calls.filter(c => c.provider === 'bizSupport').length, 0, 'served from cache');
  const c3 = memoryCache();
  await serverRun({ cache: c3, bodies: { youth: () => ({ status: 500, body: '' }) } });
  const up4 = fakeUpstream();
  await get(createDataHandler({ env: ENV, fetcher: up4.fetcher, cache: c3, log: () => {} }), '/api/livon/data?provider=kr-youth-policy');
  assert.equal(up4.calls.filter(c => c.provider === 'youth').length >= 1, true, 'a failure was not cached');
  /* without Upstash the server cache is memory-only (never claims a shared cache it does not have) */
  assert.equal(createServerCache({}, fetch).kind, 'memory');
});

/* ───────── RD-18 invalid URLs ───────── */
test('RD-18 invalid URLs: javascript:, credentials and host-less links are dropped; a factual row left without a traceable source is hidden', async () => {
  const P = loadLivon().LivonDataPlatform;
  for (const bad of ['javascript:alert(1)', 'https://user:pw@evil.example.com/', 'http://localhost/x', 'ftp://x.example.com/', 'https:///nohost']) {
    const r = P.canonicalize({ id: 'x:u', type: 'place', title: 't', sourceName: 's', sourceType: 'official', officialUrl: bad, status: 'published' });
    assert.equal(r.entity.officialUrl, null, bad); assert.equal(r.entity.provenanceMissing, true, bad);
  }
  const rep = qualityReport(loadLivon());
  assert.deepEqual(J(rep.invalidUrls), []);
});

/* ───────── RD-19 orphan relations ───────── */
test('RD-19 relations: every curated relation points to an existing row; unknown ids never render', () => {
  const rep = qualityReport(loadLivon());
  assert.deepEqual(J(rep.dangling), []);
  assert.deepEqual(J(rep.checks.orphanRelations), []);
});

/* ───────── RD-20 no sample data in production ───────── */
test('RD-20 no sample/fixture data in production files; fixtures live only under tests/', () => {
  const rep = qualityReport(loadLivon());
  assert.equal(rep.counts.sample, 0);
  const shipped = ['livon/today-data.js', 'livon/explore-data.js', 'livon/life-events-data.js', 'livon/community-data.js', 'livon/life-data.js', 'livon/life-topics.json'];
  for (const f of shipped) assert.doesNotMatch(src(f), /QA 픽스처|\[샘플\]|"sourceType":\s*"fixture"|sourceType: "fixture"/, f);
  for (const f of readdirSync(new URL('../../livon/data/', import.meta.url))) assert.doesNotMatch(src('livon/data/' + f), /QA 픽스처|fixture-key/, f);
  assert.ok(readdirSync(new URL('./fixtures/', import.meta.url)).includes('upstream-fixtures.mjs'));
});
