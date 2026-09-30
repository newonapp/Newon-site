// LIVON Real Data Layer V1: schema, validation, dedupe, freshness, cache, registry, repository, integrations.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const DAY = 864e5;
const iso = n => new Date(Date.now() + n * DAY).toISOString();

function mem() { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m }; }
/* browser-like context; withPage loads the real LIVON data files the layer adapts */
function env({ withPage = false, platform = true } = {}) {
  const ctx = { console, URL, setTimeout, clearTimeout, Promise, localStorage: mem(), sessionStorage: mem(), fetch: () => Promise.reject(new TypeError('offline')), AbortController };
  ctx.window = ctx;
  vm.createContext(ctx);
  if (withPage) {
    for (const f of ['explore-data.js', 'today-data.js']) vm.runInContext(read(f), ctx);
    ctx.document = { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
    vm.runInContext(read('life-hub.js'), ctx);
    ctx.LivonLifeHub.repo.use(LIFE);
  }
  if (platform) {
    const saves = new Map();
    ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, Object.assign({ savedAt: Date.now() }, x)), removeSave: id => saves.delete(id), _saves: saves };
  }
  for (const f of ['data/livon-data-config.js', 'data/livon-data-schema.js', 'data/livon-data-core.js', 'data/livon-data-providers.js']) vm.runInContext(read(f), ctx);
  return ctx;
}
const S = () => env().LivonDataSchema;

function fixtureProvider(D, id, rows, extra = {}) {
  let calls = 0;
  const p = D.providers.define(Object.assign({ id, name: id + ' 공급자', entityTypes: ['event', 'policy', 'program', 'place', 'expert', 'public'], enabled: true, status: 'active', priority: 60,
    fetch: () => { calls++; return typeof rows === 'function' ? rows() : Promise.resolve(rows); } }, extra));
  D.registry.register(p);
  return { calls: () => calls };
}
const ev = (o = {}) => Object.assign({ type: 'event', providerId: 'e1', title: '청년 창업 설명회', summary: '창업 준비', tags: ['창업'], lifeStages: ['20', '30'], organizer: '서울창업센터', schedule: { startAt: iso(3), endAt: iso(3.1) }, registrationUrl: 'https://example.org/apply', source: { sourceUrl: 'https://example.org/e1' }, location: { city: '서울', address: '서울 중구 세종대로 110' } }, o);
const pol = (o = {}) => Object.assign({ type: 'policy', providerId: 'p1', title: '청년 월세 지원', summary: '주거 지원', tags: ['주거'], lifeStages: ['20'], topicIds: ['20s.first-independence'], agency: '국토교통부', officialSource: 'https://example.org/p1', applicationUrl: 'https://example.org/p1/apply', lastVerifiedAt: iso(-2), source: { sourceUrl: 'https://example.org/p1' } }, o);

test('schema: required fields and type rules reject incomplete records without inventing values', () => {
  const s = S();
  assert.equal(s.validateEntity({ type: 'event', provider: 'x', providerId: '1', title: 't', source: { providerName: 'X', sourceUrl: 'https://a.kr/' } }).ok, false, 'event needs a start date');
  const noSrc = s.validateEntity(Object.assign(pol(), { provider: 'x', officialSource: null, source: { providerName: 'X' } }));
  assert.equal(noSrc.ok, false); assert.ok(noSrc.errors.includes('policy:officialSource'), 'policy must keep an official source');
  assert.deepEqual(s.validateEntity({ provider: 'x', providerId: '1', title: 'a' }).errors.includes('type'), true);
  const ok = s.validateEntity(Object.assign(ev(), { provider: 'x', source: { providerName: 'X', sourceUrl: 'https://example.org/e' } }));
  assert.equal(ok.ok, true);
  const e = ok.entity;
  assert.equal(e.id, 'x:event:e1');
  assert.equal(e.pricing, null, 'missing optional groups stay null');
  assert.equal(e.contact, null); assert.equal(e.media, null);
  const ex = s.validateEntity({ type: 'expert', provider: 'x', providerId: 'a', name: '홍길동', credentials: ['OO 자격'], source: { providerName: 'X' } });
  assert.equal(ex.ok, true); assert.equal(ex.entity.verifiedByLivon, false, 'LIVON never marks experts as verified');
});

test('normalization: lists, life stages, coordinates, dates and metadata are cleaned', () => {
  const v = S().validateEntity({ type: 'place', provider: 'x', providerId: 'p', title: '  시립 도서관  ', tags: ['도서관', '도서관', ' 독서 ', 5], lifeStages: ['20', '90', 'x', '60'],
    location: { latitude: 91, longitude: 127 }, schedule: { startAt: '2026-13-40' }, source: { providerName: 'X', fetchedAt: 'yesterday' },
    metadata: { raw: { nested: true }, note: '<b>ok</b>', n: 3 } });
  assert.equal(v.ok, true);
  const e = v.entity;
  assert.equal(e.title, '시립 도서관');
  assert.deepEqual([...e.tags], ['도서관', '독서', '5']);
  assert.deepEqual([...e.lifeStages], ['20', '60']);
  assert.equal(e.location, null, 'out-of-range coordinates dropped');
  assert.equal(e.schedule, null, 'invalid date dropped');
  assert.equal(e.source.fetchedAt, null);
  assert.deepEqual(JSON.parse(JSON.stringify(e.metadata)), { note: 'ok', n: 3 }, 'nested raw payloads never reach the UI');
  assert.ok(v.warnings.includes('location.coordinates:dropped'));
});

test('unsafe HTML and control characters never survive', () => {
  const s = S();
  const v = s.validateEntity({ type: 'public', provider: 'x', providerId: '1', title: '<img src=x onerror=alert(1)>공지<script>alert(1)</script>', summary: '&lt;script&gt;alert(1)&lt;/script&gt;안내‮', description: '<iframe src="https://evil.example"></iframe>본문', source: { providerName: '<b>기관</b>' } });
  assert.equal(v.ok, true);
  const e = v.entity;
  for (const f of [e.title, e.summary, e.description, e.source.providerName]) { assert.doesNotMatch(f, /[<>]|script|onerror|iframe|‮/i, f); }
  assert.equal(e.title, '공지'); assert.equal(e.description, '본문');
});

test('invalid and unsupported links are dropped; buttons fall back to the official page', () => {
  const ctx = env(); const s = ctx.LivonDataSchema, D = ctx.LivonData;
  for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', 'ftp://a.kr/', 'https://user:pw@a.kr/', 'https://localhost/', 'http://127.0.0.1/', '//a.kr/x', 'not a url']) assert.equal(s.safeUrl(bad), null, bad);
  assert.equal(s.safeUrl('https://www.work24.go.kr/path?x=1'), 'https://www.work24.go.kr/path?x=1');
  const v = s.validateEntity(Object.assign(pol({ applicationUrl: 'javascript:alert(1)' }), { provider: 'x', source: { providerName: 'X', sourceUrl: 'https://example.org/p1' } }));
  assert.equal(v.entity.applicationUrl, null);
  assert.deepEqual(JSON.parse(JSON.stringify(D.action(v.entity))), { label: '공식 안내 보기', url: 'https://example.org/p1', external: true, kind: 'external' });
});

test('booking/application labels describe what really happens (external pages only)', () => {
  const ctx = env(); const s = ctx.LivonDataSchema, D = ctx.LivonData;
  const mk = raw => s.validateEntity(Object.assign({ provider: 'x' }, raw, { source: Object.assign({ providerName: 'X', sourceUrl: 'https://example.org/s' }, raw.source) })).entity;
  assert.equal(D.action(mk({ type: 'expert', providerId: 'a', name: '상담사', externalBookingUrl: 'https://example.org/b' })).label, '예약 페이지로 이동');
  assert.equal(D.action(mk(ev())).label, '신청 페이지로 이동');
  assert.equal(D.action(mk(pol())).label, '공식 신청 페이지로 이동');
  assert.equal(D.action(mk(ev({ schedule: { startAt: iso(-3), endAt: iso(-2) } }))).label, '공식 안내 보기', 'ended event: no apply button');
  assert.equal(D.action(mk({ type: 'place', providerId: 'pl', title: '도서관' })).label, '공식 페이지 보기');
  const src = read('data/livon-data-core.js');
  assert.doesNotMatch(src, /"예약하기"|"신청하기"|"바로 예약"/, 'no wording that implies an in-app booking engine');
});

test('deduplication: providerId first, cross-provider merge only with high confidence, sources kept', () => {
  const ctx = env(); const D = ctx.LivonData, s = ctx.LivonDataSchema;
  D.registry.register(D.providers.define({ id: 'a', name: 'A기관', entityTypes: ['event'], priority: 80 }));
  D.registry.register(D.providers.define({ id: 'b', name: 'B포털', entityTypes: ['event'], priority: 40 }));
  const mk = (provider, raw) => s.validateEntity(Object.assign({}, raw, { provider, source: Object.assign({ providerName: provider === 'a' ? 'A기관' : 'B포털' }, raw.source) })).entity;
  const older = mk('a', ev({ title: '옛 제목', source: { sourceUrl: 'https://example.org/e1', updatedAt: iso(-5) } }));
  const newer = mk('a', ev({ source: { sourceUrl: 'https://example.org/e1', updatedAt: iso(-1) } }));
  let out = D.dedupe([older, newer]);
  assert.equal(out.length, 1); assert.equal(out[0].title, '청년 창업 설명회', 'same providerId → newest copy');
  const twin = mk('b', ev({ providerId: 'zz', title: '청년 창업 설명회 (서울)', source: { sourceUrl: 'https://portal.example.org/e/77' } }));
  out = D.dedupe([newer, twin]);
  assert.equal(out.length, 1, 'same title + organizer + place + day → merged');
  assert.equal(out[0].provider, 'a', 'higher-priority provider is primary');
  assert.equal(out[0].alsoFrom[0].provider, 'b'); assert.equal(out[0].alsoFrom[0].sourceUrl, 'https://portal.example.org/e/77', 'other source URL is not lost');
  assert.match(D.attribution(out[0]).text, /A기관 · B포털/);
  const otherDay = mk('b', ev({ providerId: 'yy', schedule: { startAt: iso(10) } }));
  assert.equal(D.dedupe([newer, otherDay]).length, 2, 'different day → separate event');
  const weak = mk('b', ev({ providerId: 'ww', organizer: '다른 기관', location: { city: '부산' }, source: { sourceUrl: 'https://other.example.org/' } }));
  assert.equal(D.dedupe([newer, weak]).length, 2, 'title + day only → low confidence, kept separate');
});

test('freshness: events expire, policies need verification, stale after the configured window', () => {
  const ctx = env(); const D = ctx.LivonData, s = ctx.LivonDataSchema;
  const mk = raw => s.validateEntity(Object.assign({ provider: 'x' }, raw, { source: Object.assign({ providerName: 'X', sourceUrl: 'https://example.org/s' }, raw.source) })).entity;
  assert.equal(D.freshness(mk(ev({ schedule: { startAt: iso(-3), endAt: iso(-2) } }))), 'expired');
  assert.equal(D.freshness(mk(ev({ eventStatus: 'cancelled' }))), 'expired');
  assert.equal(D.freshness(mk(pol({ lastVerifiedAt: null, source: { fetchedAt: iso(0) } }))), 'unknown', 'fetchedAt alone never makes a policy fresh');
  assert.equal(D.freshness(mk(pol({ lastVerifiedAt: iso(-1) }))), 'fresh');
  assert.equal(D.freshness(mk(pol({ lastVerifiedAt: iso(-400) }))), 'stale');
  assert.equal(D.freshness(mk(pol({ applicationPeriod: { end: iso(-1) } }))), 'expired');
  assert.equal(D.freshness(mk({ type: 'program', providerId: 'c', title: '강좌', registrationEnd: iso(-1) })), 'expired');
  assert.equal(D.freshness(mk({ type: 'place', providerId: 'pl', title: '공원' })), 'unknown');
  assert.equal(D.freshnessLabel(mk(pol({ lastVerifiedAt: iso(-400) }))), '확인 필요');
  const cfg = read('data/livon-data-config.js');
  assert.match(cfg, /freshForByType: \{ place: 90 \* DAY/, 'windows live in the config file, not in adapters');
});

test('registry: planned, disabled and keyed providers never run in the browser; app keeps working', async () => {
  const ctx = env(); const D = ctx.LivonData;
  const planned = D.registry.list().filter(p => !p.builtin);
  assert.ok(planned.length >= 6);
  planned.forEach(p => { assert.equal(p.enabled, false); assert.equal(p.status, 'planned'); assert.equal(p.requiresServer, true); });
  let hit = 0;
  D.registry.register(D.providers.define({ id: 'keyed', name: 'K', entityTypes: ['policy'], enabled: true, status: 'active', requiresKey: true, fetch: () => { hit++; return Promise.resolve([]); } }));
  D.registry.register(D.providers.define({ id: 'off', name: 'O', entityTypes: ['policy'], enabled: false, status: 'active', fetch: () => { hit++; return Promise.resolve([]); } }));
  await D.repository.refresh({ force: true });
  assert.equal(hit, 0, 'no call without a configured server route / when disabled');
  assert.equal(D.repository.size(), 0);
});

test('provider failure is isolated and recorded without secrets or response bodies', async () => {
  const ctx = env(); const D = ctx.LivonData;
  fixtureProvider(D, 'good', [ev()]);
  fixtureProvider(D, 'bad', () => Promise.reject(Object.assign(new Error('serviceKey=SECRET123 body:<html>'), { status: 503 })));
  fixtureProvider(D, 'junk', [{ type: 'event', providerId: 'x', title: '', source: {} }]);
  await D.repository.refresh({ force: true });
  assert.equal(D.repository.size(), 1, 'good provider still loads');
  const st = D.status().monitor;
  const bad = st.find(x => x.provider === 'bad'), junk = st.find(x => x.provider === 'junk'), good = st.find(x => x.provider === 'good');
  assert.equal(bad.errorCode, 'HTTP_5XX'); assert.equal(junk.errorCode, 'INVALID_DATA'); assert.equal(good.itemCount, 1);
  assert.doesNotMatch(JSON.stringify(D.status()), /SECRET123|serviceKey|<html>/);
  assert.equal(D.registry.get('bad').status, 'error');
});

test('cache: TTL respected, TTL 0 never cached, storage failures are harmless', async () => {
  const ctx = env(); const D = ctx.LivonData;
  const f = fixtureProvider(D, 'cached', [ev()], { ttlByType: { event: 60000 } });
  await D.repository.refresh({ force: true });
  await D.repository.refresh();
  assert.equal(f.calls(), 1, 'second refresh served from cache');
  const g = fixtureProvider(D, 'nocache', [pol()], { entityTypes: ['policy'], ttlByType: { policy: 0 } });
  await D.repository.refresh(); await D.repository.refresh();
  assert.equal(g.calls(), 2, 'TTL 0 → always fetched');
  const { MemoryCache, StorageCache } = D._internals;
  const m = MemoryCache(); m.set('k', 1, 1); await new Promise(r => setTimeout(r, 5)); assert.equal(m.get('k'), null, 'expired entry dropped');
  const broken = StorageCache({ getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); }, removeItem() {}, length: 0, key: () => null }, 'ns', 100);
  assert.equal(broken.set('a', [1], 1000), false); assert.equal(broken.get('a'), null);
  const small = StorageCache(mem(), 'ns', 10);
  assert.equal(small.set('big', 'x'.repeat(50), 1000), false, 'over budget → memory only');
});

test('repository queries: search, byId, type, life stage, interest, topic, upcoming, nearby', async () => {
  const ctx = env(); const D = ctx.LivonData;
  fixtureProvider(D, 'fx', [
    ev(), pol(),
    { type: 'place', providerId: 'lib', title: '시립 도서관', tags: ['독서'], location: { city: '서울', latitude: 37.5663, longitude: 126.9779 }, source: { sourceUrl: 'https://example.org/lib' } },
    { type: 'place', providerId: 'far', title: '부산 도서관', location: { city: '부산', latitude: 35.18, longitude: 129.07 }, source: { sourceUrl: 'https://example.org/far' } },
    ev({ providerId: 'old', title: '지난 박람회', schedule: { startAt: iso(-9), endAt: iso(-8) } })
  ]);
  await D.repository.refresh({ force: true });
  const R = D.repository;
  assert.deepEqual([...R.search('창업 설명회').map(e => e.id)], ['fx:event:e1']);
  assert.equal(R.search('박람회').length, 0, 'expired hidden by default');
  assert.equal(R.search('박람회', { includeExpired: true }).length, 1);
  assert.equal(R.getById('fx:policy:p1').agency, '국토교통부');
  assert.equal(R.listByType('place').length, 2);
  assert.deepEqual([...R.listByLifeStage('20').map(e => e.type).sort()], ['event', 'policy']);
  assert.equal(R.listByInterest(['독서']).length, 1);
  const topic = LIFE.topics.find(t => t.id === '20s.first-independence');
  assert.deepEqual([...R.listByTopic(topic, { type: 'policy' }).map(e => e.id)], ['fx:policy:p1']);
  assert.deepEqual([...R.listUpcoming({ days: 30 }).map(e => e.id)], ['fx:event:e1']);
  assert.deepEqual([...R.listNearby(37.5665, 126.978, 3).map(e => e.id)], ['fx:place:lib']);
});

test('no provider data: every integration returns nothing, UI helpers render nothing (honest empty states stay)', async () => {
  const ctx = env({ withPage: true }); const D = ctx.LivonData;
  await D.repository.refresh({ force: true });
  assert.ok(D.repository.size() > 30, 'builtin curated data flows through the pipeline');
  assert.deepEqual([...D.searchEntries()], [], 'builtin data is already indexed by Explore — not added twice');
  const topic = LIFE.topics.find(t => t.id === '20s.first-independence');
  assert.equal(D.forTopic(topic, 'policy').length, 0);
  assert.equal(D.forToday(ctx.LivonTodayData.contents[0], 'event').length, 0);
  const h = D.forHome({ stage: '20', interests: ['주거'] });
  assert.equal(h.events.length + h.policies.length + h.programs.length, 0);
  assert.equal(D.ui.list([], 'x', 'life'), '');
  assert.equal(D.ui.list(D.forTopic(topic, 'expert'), D.ui.note('expert'), 'life'), '');
});

test('builtin curated provider: official sources kept, no invented experts/ratings/prices', async () => {
  const ctx = env({ withPage: true }); const D = ctx.LivonData;
  await D.repository.refresh({ force: true });
  const all = D.repository.list({ includeExpired: true });
  assert.equal(all.filter(e => e.type === 'policy').length, LIFE.policies.length);
  assert.equal(all.filter(e => e.type === 'expert').length, 0, 'no experts exist, none invented');
  all.forEach(e => {
    assert.ok(e.source.providerName && (e.source.sourceUrl || e.officialSource), e.id + ' has a source');
    assert.equal(e.pricing && e.pricing.amount, null, 'no invented prices');
  });
  const p = all.find(e => e.providerId === 'pol-youthcenter');
  assert.equal(p.officialSource, 'https://www.youthcenter.go.kr/');
  assert.ok(p.lifeStages.includes('20'));
  assert.equal(D.freshness(p) === 'fresh' || D.freshness(p) === 'stale', true, 'curated policies carry a real checked date');
});

test('My Life: saving an external entity keeps a snapshot that survives the provider going away', async () => {
  const ctx = env(); const D = ctx.LivonData;
  fixtureProvider(D, 'fx', [ev(), pol()]);
  await D.repository.refresh({ force: true });
  assert.equal(D.save('fx:policy:p1'), 'saved');
  const rec = ctx.LivonPlatform._saves.get('ext:fx:policy:p1');
  assert.equal(rec.type, 'policy'); assert.equal(rec.data.kind, 'policy', 'My Life saved filter type');
  assert.equal(rec.href, 'https://example.org/p1/apply');
  assert.equal(rec.data.snapshot.sourceUrl, 'https://example.org/p1');
  assert.equal(rec.data.snapshot.providerName, 'fx 공급자');
  assert.equal(rec.source, 'fx 공급자');
  // provider disappears → still readable from the snapshot
  D.registry.setEnabled('fx', false);
  await D.repository.refresh({ force: true });
  const back = D.fromSave(rec);
  assert.equal(back.fromSnapshot, true); assert.equal(back.entity.title, '청년 월세 지원'); assert.equal(back.entity.externalUrl, 'https://example.org/p1/apply');
  assert.equal(D.save('fx:policy:p1'), false, 'cannot save something that is no longer loaded');
  // toggling removes
  D.registry.setEnabled('fx', true); await D.repository.refresh({ force: true });
  assert.equal(D.save('fx:policy:p1'), 'removed');
  // real LivonPlatform keeps the data field
  assert.match(read('livon-platform.js'), /data: item\.data \|\| null,/);
});

test('Explore integration: external entities join the unified index; without them the index is unchanged', async () => {
  const ctx = env({ withPage: true }); const D = ctx.LivonData;
  vm.runInContext(read('explore-search.js'), ctx);
  await D.repository.refresh({ force: true });
  const before = ctx.LivonSearch.rebuild().length;
  assert.equal(ctx.LivonSearch.index().filter(x => String(x.key).startsWith('ext:')).length, 0);
  fixtureProvider(D, 'fx', [ev()]);
  await D.repository.refresh({ force: true });
  const idx = ctx.LivonSearch.index();
  assert.equal(idx.length, before + 1, 'onChange rebuilt the index');
  const r = ctx.LivonSearch.search('창업 설명회');
  const hit = r.items.find(x => x.item.key === 'ext:fx:event:e1');
  assert.ok(hit, 'found by unified search'); assert.equal(hit.item.type, 'event'); assert.equal(hit.item.external, true);
  assert.equal(r.counts.event, 1);
});

test('Life Stage / Today / Home integration interfaces are wired but add nothing without data', async () => {
  const hub = read('life-hub.js'), feed = read('today-feed.js'), home = read('home-page.js');
  assert.match(hub, /function realData\(t, type\)[\s\S]*D\.forTopic\(t, type\)/);
  assert.match(hub, /if \(extPolicy\) policyBody = policies\.length \? policyBody \+ extPolicy : extPolicy;/);
  assert.match(feed, /function realData\(c, type\)[\s\S]*D\.forToday\(c, type\)/);
  assert.match(home, /function realDataCols\(stage\)[\s\S]*D\.forHome\(/);
  const ctx = env({ withPage: true }); const D = ctx.LivonData;
  fixtureProvider(D, 'fx', [pol(), ev({ tags: ['공원', '산책'], lifeStages: [] })]);
  await D.repository.refresh({ force: true });
  const topic = LIFE.topics.find(t => t.id === '20s.first-independence');
  const html = D.ui.list(D.forTopic(topic, 'policy'), D.ui.note('policy'), 'life');
  assert.match(html, /class="lv-life-svc lv-data-card"/);
  assert.match(html, /출처: fx 공급자/);
  assert.match(html, /원문 보기/);
  assert.match(html, /확인 \d{4}\.\d{2}\.\d{2}/, 'verified date is labelled as a check, not as freshness of the source');
  assert.match(html, /target="_blank" rel="noopener noreferrer">공식 신청 페이지로 이동/);
  assert.match(html, /대상 여부를 판단하지 않습니다/);
  const park = ctx.LivonTodayData.contents.find(c => (c.tags || []).includes('공원') || c.category === '공원');
  if (park) assert.match(D.ui.list(D.forToday(park, 'event'), '', 'today'), /lv-td-card td-card td-card--text lv-data-card/);
  const home2 = D.forHome({ stage: '20' });
  assert.equal(home2.policies[0].id, 'fx:policy:p1');
});

test('security: no keys, tokens or secret-looking values in data layer files', () => {
  for (const f of ['data/livon-data-config.js', 'data/livon-data-schema.js', 'data/livon-data-core.js', 'data/livon-data-providers.js']) {
    const src = read(f);
    assert.doesNotMatch(src, /serviceKey\s*[=:]\s*["'][^"']+|api[_-]?key\s*[=:]\s*["'][^"']+|sk-[A-Za-z0-9]{16,}|Bearer\s+[A-Za-z0-9._-]{16,}/i, f);
    assert.doesNotMatch(src, /https?:\/\/(?!example\.org)[^"'\s]*\?(?:[^"'\s]*&)?(?:key|serviceKey|token)=/i, f + ': no keyed endpoint URLs');
  }
});

test('My Life saved filter maps external events and experts to their own types (not 기타)', () => {
  const ctx = env({ withPage: true });
  ctx.history = { replaceState() {}, pushState() {} }; ctx.location = { hash: '#ml-saved' }; ctx.navigator = {}; ctx.addEventListener = () => {};
  ctx.document.head = { querySelector: () => null }; ctx.document.contains = () => false;
  for (const f of ['community-data.js', 'today-feed.js', 'explore-search.js', 'life-now-data.js', 'life-now-page.js']) vm.runInContext(read(f), ctx);
  const T = ctx.LivonMyLife._test, D = ctx.LivonData, s = ctx.LivonDataSchema;
  const mk = raw => s.validateEntity(Object.assign({ provider: 'fx' }, raw, { source: { providerName: 'FX', sourceUrl: 'https://example.org/s' } })).entity;
  const kinds = [ev(), pol(), { type: 'expert', providerId: 'x1', name: '상담사' }, { type: 'program', providerId: 'c1', title: '강좌' }, { type: 'place', providerId: 'pl', title: '도서관' }]
    .map(r => T.savedType(D.toSaveItem(mk(r))));
  assert.deepEqual([...kinds], ['event', 'policy', 'expert', 'class', 'place']);
  const src = read('life-now-page.js');
  assert.match(src, /\{ id: "event", label: "행사" \}, \{ id: "expert", label: "전문가" \}/);
  assert.match(src, /SAVED_TYPES\.filter\(function \(t\) \{ return t\.id === "all" \|\| counts\[t\.id\] \|\| t\.id === type; \}\)/, 'chips only appear when such saves exist');
});
