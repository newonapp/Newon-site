// LIVON Data Platform V1 — canonical schema, adapters, normalization, lifecycle, search, relations, Today, Explore (D-1 … D-10).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL('../../' + f, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('livon/life-topics.json'));
const FX = JSON.parse(read('tests/livon/fixtures/data-platform-public.fixture.json'));
const NOW = Date.parse('2026-09-30T12:00:00+09:00');
const DAY = 864e5;

function load({ withSchema = true } = {}) {
  const ctx = { console, URL, Promise };
  ctx.window = ctx;
  vm.createContext(ctx);
  const files = ['life-data.js', 'life-events-data.js', 'today-data.js', 'explore-data.js', 'community-data.js', 'data/livon-data-config.js']
    .concat(withSchema ? ['data/livon-data-schema.js'] : []).concat(['data/livon-data-platform.js']);
  for (const f of files) vm.runInContext(read('livon/' + f), ctx, { filename: f });
  return ctx;
}
const J = x => JSON.parse(JSON.stringify(x));
async function repoWith(extra = [], o = {}) {
  const ctx = load();
  const P = ctx.LivonDataPlatform;
  const repo = P.createRepository({ now: o.now ?? NOW, includeSamples: o.includeSamples, adapters: [P.StaticAdapter({ lifeTopics: LIFE }), ...extra.map(f => f(P))] });
  await repo.load();
  return { P, repo, ctx };
}
const minimal = (type, o = {}) => Object.assign({ id: 'fx:' + type, type, title: type + ' 제목', summary: '요약', sourceName: '테스트 출처', sourceType: 'official',
  sourceUrl: 'https://example.org/' + type, status: 'published' }, type === 'event' ? { startDate: '2026-10-10' } : {}, o);

/* ───────── D-1 schema ───────── */
test('D-1 schema: 12 canonical entity types, required fields, sanitising, verification rules', () => {
  const P = load().LivonDataPlatform;
  assert.deepEqual(J(P.TYPES), ['content', 'lifeStage', 'lifeEvent', 'place', 'event', 'program', 'policy', 'expert', 'provider', 'service', 'class', 'communityContent']);
  assert.deepEqual(J(P.STATUSES), ['draft', 'review', 'published', 'expired', 'archived']);
  for (const type of P.TYPES) {
    const r = P.canonicalize(minimal(type));
    assert.equal(r.ok, true, type + ' ' + r.errors.join(','));
    for (const k of ['id', 'type', 'title', 'summary', 'category', 'tags', 'lifeStages', 'lifeEvents', 'region', 'priceType', 'startDate', 'endDate', 'applicationStart', 'applicationEnd',
      'sourceName', 'sourceType', 'sourceUrl', 'officialUrl', 'bookingUrl', 'bookingType', 'availabilityType', 'providerId', 'verified', 'verificationStatus', 'status', 'publishedAt', 'updatedAt', 'expiresAt', 'relations', 'domains'])
      assert.ok(k in r.entity, type + ' missing ' + k);
    for (const k of Object.values(P.TYPE_FIELDS[type]).flat()) assert.ok(k in r.entity, type + ' missing type field ' + k);
  }
  const bad = P.canonicalize({ type: 'place', id: 'x:1' });
  assert.equal(bad.ok, false); assert.ok(bad.errors.includes('title') && bad.errors.includes('sourceType') && bad.errors.includes('sourceName'));
  const x = P.canonicalize(minimal('place', { title: '<img src=x onerror=alert(1)>도서관<script>x()</script>', officialUrl: 'javascript:alert(1)', bookingUrl: 'https://user:pw@evil.example.com/' })).entity;
  assert.equal(x.title, '도서관'); assert.equal(x.officialUrl, null); assert.equal(x.bookingUrl, null);
  /* partner_verified only from a partner source; "official" needs a link */
  assert.notEqual(P.canonicalize(minimal('expert', { verificationStatus: 'partner_verified' })).entity.verificationStatus, 'partner_verified');
  assert.equal(P.canonicalize(minimal('expert', { sourceType: 'partner', verificationStatus: 'partner_verified' })).entity.verified, true);
  assert.equal(P.canonicalize(minimal('place', { sourceType: 'official' })).entity.verificationStatus, 'official_source');
  assert.equal(P.canonicalize(minimal('content', { sourceType: 'editorial', sourceUrl: null })).entity.verificationStatus, 'editorial');
  /* booking-ready fields exist but nothing books */
  const svc = P.canonicalize(minimal('service', { bookingUrl: 'https://example.org/book' })).entity;
  assert.equal(svc.bookingType, 'external'); assert.ok(P.BOOKING_TYPES.includes('partner') && P.AVAILABILITY_TYPES.includes('on_request'));
  /* works without livon-data-schema.js (Node/server) */
  assert.equal(load({ withSchema: false }).LivonDataPlatform.canonicalize(minimal('place', { title: '<b>공원</b>' })).entity.title, '공원');
});

test('D-1 static catalog: every curated LIVON record becomes a valid canonical entity with unique ids and resolvable links', async () => {
  const { repo } = await repoWith();
  const r = repo.report()[0];
  assert.equal(r.rejected, 0, JSON.stringify(r.errors)); assert.equal(r.duplicates, 0); assert.equal(r.warnings, 0);
  /* includeHeld: records on a LIVON Next V1 review hold are still valid catalog entities (kept in the files, not shown) */
  const all = repo.all({ includeSamples: true, includeUnsourced: true, includeHeld: true });
  const types = new Set(all.map(e => e.type));
  for (const t of ['lifeStage', 'lifeEvent', 'content', 'policy', 'service', 'place', 'class', 'program', 'provider', 'communityContent']) assert.ok(types.has(t), t);
  assert.equal(repo.getLifeStages().length, 7);
  assert.equal(repo.getLifeEvents().length, 34);
  assert.equal(new Set(all.map(e => e.id)).size, all.length);
  /* policies are official portal links only */
  for (const p of repo.getPolicies()) { assert.match(p.officialUrl, /^https:\/\//); assert.equal(p.sourceType, 'official'); }
  /* no expert profiles are invented from curated files */
  assert.equal(repo.getExperts().length, 0);
  /* most explicit relation targets resolve (unknown tool ids from older data are simply not linked) */
  let total = 0, ok = 0;
  for (const e of all) for (const k of Object.keys(e.relations)) for (const id of e.relations[k]) { total++; if (repo.getById(id, { any: true })) ok++; }
  assert.ok(total > 500 && ok / total > 0.85, ok + '/' + total);
});

/* ───────── D-2 normalization ───────── */
test('D-2 normalization: public-data rows (real-data layer shape) → canonical schema through PublicDataAdapter', async () => {
  const { repo, P } = await repoWith([P => P.PublicDataAdapter({ entities: FX.realDataEntities })]);
  const pol = repo.getById('kr-youth-policy:policy:Y-001');
  assert.equal(pol.type, 'policy'); assert.equal(pol.officialUrl, 'https://www.example.go.kr/policy/Y-001'); assert.equal(pol.agency, '국토교통부');
  assert.equal(pol.region, '서울'); assert.equal(pol.sourceType, 'public_api'); assert.equal(pol.verificationStatus, 'official_source');
  assert.equal(pol.applicationEnd, '2026-12-31T14:59:59.000Z');
  const ev = repo.getById('kr-business-event:event:E-9');
  assert.equal(ev.startDate, '2026-10-10T01:00:00.000Z'); assert.equal(ev.bookingUrl, 'https://www.example.or.kr/e9/apply'); assert.equal(ev.bookingType, 'external');
  assert.equal(ev.location.address, '서울 중구 세종대로 110');
  const place = repo.getById('kr-kakao-place:place:P-7');
  assert.equal(place.officialUrl, null, 'a map page is never an official URL'); assert.equal(place.sourceUrl, 'https://place.map.example.com/7');
  assert.deepEqual(J(place.coordinates), { lat: 37.55, lng: 126.91 });
  const ex = repo.getById('kr-public-tax-expert:expert:T-2');
  assert.notEqual(ex.verificationStatus, 'partner_verified', 'a data feed cannot mark an expert partner-verified');
  assert.equal(ex.name, '[샘플] 마을세무사');
  /* each named normalizer maps its own shape */
  assert.equal(P.normalizeClass({ id: 'c', title: '클래스', provider: 'p', source: { providerName: 'X', sourceUrl: 'https://x.org/c' } }).type, 'class');
  const svc = P.canonicalize(P.normalizeService({ id: 's', title: '이사 서비스', group: '주거', process: ['견적'], sourceName: 'X', sourceUrl: 'https://x.org/s' }, { provider: 'partner-x', sourceType: 'partner' })).entity;
  assert.equal(svc.serviceGroup, '주거'); assert.equal(svc.sourceType, 'partner'); assert.deepEqual(J(svc.process), ['견적']);
  assert.equal(P.canonicalize(P.normalizeContent({ id: 'k', title: '가이드', sourceName: 'X' }, { sourceType: 'editorial' })).entity.contentKind, 'guide');
  /* partner / internal adapters exist and return nothing until a real feed is wired */
  assert.deepEqual(J(await P.PartnerAdapter().load()), []); assert.deepEqual(J(await P.InternalAdapter().load()), []);
  assert.equal(P.PartnerAdapter().status().planned, true);
});

/* ───────── D-3 expiry / lifecycle ───────── */
test('D-3 expired filtering: past events and closed applications leave default results; Admin lifecycle rules', async () => {
  const { repo, P } = await repoWith([P => P.PublicDataAdapter({ entities: FX.realDataEntities })]);
  assert.equal(repo.getById('kr-business-event:event:E-old'), null, 'ended event hidden');
  assert.equal(repo.getEvents({ includeExpired: true }).some(e => e.id === 'kr-business-event:event:E-old'), true);
  assert.equal(repo.lifecycleStatus(repo.getById('kr-business-event:event:E-old', { any: true })), 'expired');
  assert.ok(repo.getById('kr-lifelong-class:program:L-3'), 'open until 10-04');
  const later = P.createRepository({ now: Date.parse('2026-10-05T12:00:00+09:00'), adapters: [P.PublicDataAdapter({ entities: FX.realDataEntities })] });
  await later.load();
  assert.equal(later.getById('kr-lifelong-class:program:L-3'), null, 'application closed → expired');
  assert.equal(later.search('스마트폰').total, 0, 'expired rows never reach search');
  /* expiresAt wins for any type */
  const e = P.canonicalize(minimal('content', { expiresAt: '2026-01-01' })).entity;
  assert.equal(P.lifecycleStatus(e, NOW), 'expired');
  /* Admin transitions */
  const draft = P.createDraft({ id: 'adm:1', type: 'place', title: '새 장소', summary: '설명', sourceName: 'LIVON 운영', sourceUrl: 'https://example.org/p' }, NOW).entity;
  assert.equal(draft.status, 'draft'); assert.equal(draft.sourceType, 'internal');
  assert.equal(P.transition(draft, 'published').error, 'TRANSITION_NOT_ALLOWED');
  const review = P.transition(draft, 'review', { at: NOW }).entity;
  const pub = P.transition(review, 'published', { at: NOW });
  assert.equal(pub.ok, true); assert.equal(pub.entity.status, 'published'); assert.ok(pub.entity.publishedAt);
  assert.equal(draft.status, 'draft', 'transition never mutates');
  const exp = P.transition(pub.entity, 'expired', { at: NOW }).entity; assert.ok(exp.expiresAt);
  assert.equal(P.transition(exp, 'archived').ok, true);
  const noSummary = P.transition(Object.assign({}, review, { summary: null }), 'published');
  assert.equal(noSummary.error, 'NOT_PUBLISHABLE'); assert.ok(noSummary.problems.includes('summary'));
  const sample = P.transition(Object.assign({}, review, { sourceType: 'fixture' }), 'published');
  assert.ok(sample.problems.includes('sample-data'), 'samples can never be published');
  assert.equal(P.transition(review, 'bogus').error, 'INVALID_STATUS');
});

/* ───────── D-4 search ───────── */
test('D-4 search: one index over every entity type; results carry type; keyword, tags, category, region, lifeStage, lifeEvent filters', async () => {
  const { repo } = await repoWith([P => P.PublicDataAdapter({ entities: FX.realDataEntities })]);
  const s = repo.search('이사');
  assert.ok(s.total >= 10);
  const types = new Set(s.items.map(x => x.type).concat(Object.keys(s.byType)));
  for (const t of ['lifeEvent', 'content', 'service']) assert.ok(types.has(t), t);
  for (const x of s.items) { assert.ok(x.type && x.typeLabel && x.title && x.id); }
  assert.equal(s.items.some(x => /아이사랑/.test(x.title)), false, '"이사" must not match inside "아이사랑"');
  assert.equal(s.items[0].title.includes('이사'), true);
  assert.ok(repo.search('청년 주거').items.some(x => x.type === 'policy' || x.type === 'service'));
  assert.ok(repo.search('창업', { types: ['event'] }).items.every(x => x.type === 'event'));
  assert.ok(repo.search('도서관', { region: '서울', nationwide: false }).items.every(x => x.region === '서울' || (x.entity.location && /^서울/.test(x.entity.location.address || ''))));
  assert.ok(repo.search('자격증', { lifeStage: '20' }).items.every(x => !x.entity.lifeStages.length || x.entity.lifeStages.includes('20')));
  assert.ok(repo.search('', { lifeEvent: 'independent' }).items.length >= 1);
  assert.ok(repo.search('주거', { category: 'housing' }).items.every(x => x.entity.domains.includes('housing') || x.entity.category === 'housing'));
  assert.ok(repo.search('독립', { tags: ['주거·독립'] }).items.every(x => x.entity.tags.includes('주거·독립')));
  /* synonyms: "이사" also finds 자취/독립 items at lower weight; an unknown word finds nothing */
  assert.equal(repo.search('존재하지않는검색어zzz').total, 0);
  /* samples never appear unless asked */
  assert.equal(repo.search('샘플').items.some(x => x.entity.sample), false);
});

/* ───────── D-5 related items ───────── */
test('D-5 related items: explicit links first (both directions), then rule-based signals, never itself or hidden rows', async () => {
  const { repo } = await repoWith();
  const id = 'topic:20s.first-independence';
  const topic = repo.getById(id);
  const rel = repo.getRelatedItems(id, { limit: 40 });
  assert.ok(rel.length >= 5);
  assert.equal(rel.some(r => r.entity.id === id), false);
  const explicit = Object.values(topic.relations).flat().filter(x => repo.getById(x));
  for (const x of explicit) assert.ok(rel.some(r => r.entity.id === x && r.reasons.includes('linked')), 'explicit link kept: ' + x);
  for (let i = 1; i < rel.length; i++) assert.ok(rel[i - 1].score >= rel[i].score, 'sorted by score');
  /* reverse direction: a Today item that links to the topic is related to it */
  const back = repo.all().filter(e => (e.relations.topicIds || []).includes(id) && e.id.startsWith('td:'));
  for (const b of back) assert.ok(rel.some(r => r.entity.id === b.id), 'reverse link: ' + b.id);
  assert.ok(repo.getRelatedItems(id, { types: ['policy'] }).every(r => r.entity.type === 'policy'));
  assert.deepEqual(J(repo.getRelatedItems('no-such-id')), []);
});

/* ───────── D-6 Life Stage relations ───────── */
test('D-6 Life Stage graph: stage → life events → topics → policy / service / content / community (20대 → 독립)', async () => {
  const { repo } = await repoWith();
  for (const s of ['10', '20', '30', '40', '50', '60', '70']) {
    const g = repo.getLifeStageGraph(s);
    assert.ok(g && g.lifeStage.id === 'stage:' + s && g.lifeEvents.length >= 1 && g.topics.length >= 10, s);
  }
  const g20 = repo.getLifeStageGraph('20');
  const indep = g20.lifeEvents.find(c => c.lifeEvent.title === '독립');
  assert.ok(indep, '20대 → 독립');
  assert.ok(indep.topics.some(t => t.title === '첫 독립 준비'));
  assert.ok(indep.topics.every(t => t.lifeStages.includes('20')), 'topics stay in the stage');
  assert.ok(indep.related.policy.length >= 1, 'official housing/youth portals');
  assert.ok(indep.related.service.length >= 1, 'moving/housing services');
  assert.ok(indep.related.content.length >= 1);
  assert.ok(indep.related.communityContent.length >= 1, 'related community group');
  const ctx = repo.getLifeEventContext('독립');
  assert.equal(ctx.lifeEvent.id, 'le:independent');
  assert.equal(repo.getLifeEventContext('없는이벤트xyz'), null);
  assert.equal(repo.getLifeStageGraph('90'), null);
});

/* ───────── D-7 Today feed ───────── */
test('D-7 Today feed: rule-based ranking by region, interests, life stage, season and date; eight Today sections; no expired rows', async () => {
  const { repo, P } = await repoWith([P => P.PublicDataAdapter({ entities: FX.realDataEntities })]);
  const f = repo.getTodayFeed({ region: '서울', interests: ['여행', '문화'], lifeStage: '20', date: '2026-10-03' });
  assert.equal(f.method, 'rule-based'); assert.equal(f.season, 'autumn');
  assert.deepEqual(J(Object.keys(f.byCategory)), J(P.TODAY_CATEGORIES.map(c => c.id)));
  assert.deepEqual(J(P.TODAY_CATEGORIES.map(c => c.label)), ['장소', '체험', '배움', '함께', '계절', '일상', '이야기', '행사']);
  /* 체험 (experience): its four LIVON guides are on review hold in LIVON Next V1, so that section is empty until they are re-checked */
  for (const c of Object.keys(f.byCategory)) if (c !== 'experience') assert.ok(f.byCategory[c].length >= 1, c);
  assert.equal(f.byCategory.experience.length, 0, 'held records never reach the feed');
  for (let i = 1; i < f.items.length; i++) assert.ok(f.items[i - 1].score >= f.items[i].score);
  assert.ok(f.items.every(r => Array.isArray(r.reasons)));
  assert.ok(f.items.slice(0, 5).every(r => !r.entity.region || ['서울', '전국', '온라인'].includes(r.entity.region)), 'other regions do not lead a Seoul feed');
  assert.ok(f.byCategory.event.some(r => r.entity.id === 'kr-business-event:event:E-9'), 'a current public event joins 행사');
  assert.equal(f.items.concat(...Object.values(f.byCategory)).some(r => r.entity.id === 'kr-business-event:event:E-old'), false);
  const busan = repo.getTodayFeed({ region: '부산', date: '2026-10-03' });
  assert.ok(busan.items.every(r => r.entity.region !== '서울' || r.score < busan.items[0].score));
  const winter = repo.getTodayFeed({ date: '2027-01-10' });
  assert.equal(winter.season, 'winter');
  /* the platform never calls rule-based ranking "AI" */
  assert.doesNotMatch(read('livon/data/livon-data-platform.js').replace(/\/\*[\s\S]*?\*\//g, ''), /method:\s*"ai"/i);
});

/* ───────── D-8 Explore filters ───────── */
test('D-8 Explore: nine domains and one filter system across experts/providers/services/programs/classes/places/policies', async () => {
  const { repo, P } = await repoWith([P => P.PublicDataAdapter({ entities: FX.realDataEntities })]);
  assert.deepEqual(J(P.DOMAINS.map(d => d.label)), ['교육·진로', '커리어', '주거', '금융', '가족', '건강', '여행·여가', '지역', '시니어']);
  for (const d of P.DOMAINS) assert.ok(repo.explore({ category: d.id }).total >= 1, d.id);
  const types = ['provider', 'service', 'program', 'class', 'place', 'policy', 'expert'];
  const all = repo.explore({ types, limit: 500 });
  /* class: the curated classes (Today 체험 guides) are on review hold in LIVON Next V1 — none is shown */
  for (const t of types) if (t !== 'class') assert.ok(all.facets.type[t] >= 1, t);
  assert.equal(all.items.some(e => e.status === 'review'), false);
  const free = repo.explore({ priceType: 'free' }); assert.ok(free.total >= 1 && free.items.every(e => e.priceType === 'free'));
  const online = repo.explore({ online: true }); assert.ok(online.total >= 1 && online.items.every(e => e.online === true));
  const offline = repo.explore({ online: false }); assert.ok(offline.items.every(e => e.online === false));
  const verified = repo.explore({ verified: true, limit: 500 }); assert.ok(verified.total >= 1 && verified.items.every(e => e.verified));
  const seoul = repo.explore({ region: '서울', nationwide: false, limit: 500 }); assert.ok(seoul.items.every(e => e.region === '서울' || /^서울/.test(e.location?.address || '')));
  const stage = repo.explore({ lifeStage: '60', strictLifeStage: true, limit: 500 }); assert.ok(stage.total >= 1 && stage.items.every(e => e.lifeStages.includes('60')));
  const dated = repo.explore({ date: '2026-10-10', types: ['event'] }); assert.ok(dated.items.some(e => e.id === 'kr-business-event:event:E-9'));
  assert.equal(repo.explore({ date: '2026-12-01', types: ['event'] }).items.some(e => e.id === 'kr-business-event:event:E-9'), false);
  const target = repo.explore({ target: '구직자' }); assert.ok(target.total >= 1);
  const le = repo.explore({ lifeEvent: 'independent' }); assert.ok(le.total >= 1);
});

/* ───────── D-9 malformed data ───────── */
test('D-9 malformed data: bad rows are rejected with reasons, a failing adapter never breaks the others', async () => {
  const { repo } = await repoWith([
    P => P.InternalAdapter({ id: 'bad-rows', records: FX.malformed }),
    P => ({ id: 'throws', kind: 'internal', sourceType: 'internal', status: () => ({}), load: () => { throw new Error('boom'); } }),
    P => ({ id: 'rejects', kind: 'public', sourceType: 'public_api', status: () => ({}), load: () => Promise.reject(new Error('down')) }),
    P => ({ id: 'not-array', kind: 'public', sourceType: 'public_api', status: () => ({}), load: () => Promise.resolve({ rows: 1 }) })
  ]);
  const rep = Object.fromEntries(repo.report().map(r => [r.adapter, r]));
  assert.equal(rep['bad-rows'].accepted, 0); assert.equal(rep['bad-rows'].rejected, FX.malformed.length);
  assert.ok(rep['bad-rows'].errors.some(e => e.errors.includes('policy:officialUrl')));
  assert.ok(rep['bad-rows'].errors.some(e => e.errors.includes('event:startDate')));
  assert.ok(rep['bad-rows'].errors.some(e => e.errors.includes('id')));
  assert.equal(rep.throws.failed, true); assert.equal(rep.rejects.failed, true); assert.equal(rep['not-array'].accepted, 0);
  assert.ok(rep['livon-static'].accepted > 400, 'curated data still loaded');
  assert.ok(repo.search('이사').total > 0);
  /* dates, coordinates and ranges are validated field by field */
  const P = load().LivonDataPlatform;
  const r = P.canonicalize(minimal('event', { startDate: '2026-13-40', endDate: 'soon' }));
  assert.equal(r.ok, false);
  const w = P.canonicalize(minimal('place', { coordinates: { lat: 999, lng: 1 }, startDate: '2026-10-10', endDate: '2026-10-01' }));
  assert.equal(w.entity.coordinates, null); assert.equal(w.entity.endDate, null); assert.ok(w.warnings.includes('endDate:before-start'));
});

/* ───────── D-10 missing source ───────── */
test('D-10 missing source: unsourced facts are not shown as real, samples are opt-in and never verified', async () => {
  const { repo, P } = await repoWith([P => P.InternalAdapter({ id: 'public-rows', records: FX.unsourced.map(x => x) }), P => P.InternalAdapter({ id: 'fixtures', records: FX.canonicalSamples })]);
  /* InternalAdapter rows keep their own sourceType (public_api here) → provenance required */
  const hidden = repo.getById('x:unsourced-place', { any: true });
  assert.equal(hidden.provenanceMissing, true); assert.equal(hidden.verificationStatus, 'unverified'); assert.equal(hidden.verified, false);
  assert.equal(repo.getById('x:unsourced-place'), null);
  assert.equal(repo.search('출처 링크 없는 장소').items.some(x => x.id === 'x:unsourced-place'), false);
  assert.equal(repo.getPlaces({ includeUnsourced: true }).some(e => e.id === 'x:unsourced-place'), true);
  /* policy with no official link: rejected outright */
  assert.equal(P.canonicalize({ type: 'policy', id: 'p:x', title: '정책', sourceName: 'X', sourceType: 'official' }).ok, false);
  /* a record with no source name at all is rejected */
  assert.equal(P.canonicalize({ type: 'content', id: 'c:x', title: '글', sourceType: 'editorial' }).ok, false);
  /* samples */
  const s = repo.getById('fx:class:bake', { any: true });
  assert.equal(s.sample, true); assert.equal(s.verified, false);
  assert.equal(repo.getClasses().some(e => e.sample), false);
  assert.equal(repo.getClasses({ includeSamples: true }).some(e => e.id === 'fx:class:bake'), true);
  assert.equal(repo.getTodayFeed({ date: '2026-10-10' }).items.some(r => r.entity.sample), false);
  /* editorial LIVON guides are allowed without an external link, and say so */
  const guide = repo.getById('ex:ex-move-guide');
  assert.equal(guide.sourceType, 'editorial'); assert.equal(guide.verificationStatus, 'editorial'); assert.equal(guide.verified, false);
  /* a Newon service of our own is "internal", not an official page */
  const ongil = repo.getById('ex:ex-ongil');
  assert.equal(ongil.sourceType, 'internal'); assert.equal(ongil.officialUrl, null); assert.equal(ongil.meta.internalUrl, '/ongil-start/#care');
});

/* ───────── browser integration (additive only) ───────── */
test('browser: platform script loads after the data layer, reads existing globals lazily, holds no secrets or endpoints', async () => {
  const html = read('livon/index.html');
  const i = n => html.indexOf(n);
  assert.ok(i('/livon/data/livon-data-platform.js') > i('/livon/data/livon-data-providers.js'));
  assert.ok(i('/livon/data/livon-data-platform.js') < i('/livon/life-hub.js'));
  const src = read('livon/data/livon-data-platform.js');
  assert.doesNotMatch(src, /OPENAI|API_KEY|SERVICE_KEY|UPSTASH|secret|Bearer|fetch\(/i);
  assert.doesNotMatch(src, /localStorage|sessionStorage|document\./, 'no storage or DOM work');
  /* shared(): builds from window globals + the Life Hub topics without touching the network */
  const ctx = load();
  ctx.LivonLifeHub = { repo: { status: 'ready', data: LIFE } };
  const repo = await ctx.LivonDataPlatform.shared();
  assert.ok(repo.size() > 400);
  assert.strictEqual(await ctx.LivonDataPlatform.shared(), repo, 'cached');
});
