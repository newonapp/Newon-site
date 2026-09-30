// 공공기관 공개 마을세무사 정보 (kr-public-tax-expert): sources, route, trust model, privacy and LIVON integration.
// No real key is used. Fixtures use only the official column names and obviously fake names/numbers ([QA 픽스처]).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as tx from '../../server/livon/data/providers/public-tax-expert.mjs';
import { createDataHandler } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const root = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const KEY = 'pd-test-key+DO/NOT=LEAK-8282';
const ENV = { PUBLIC_DATA_SERVICE_KEY: KEY };
const Q = s => '/api/livon/data?provider=kr-public-tax-expert' + (s ? '&' + s : '');

const dg = (o = {}) => Object.assign({ EMD_NM: '신암1동', LNDCTN_NM: '[QA 픽스처] 가세무', TELNO: '053-000-0001' }, o);
const ic = (o = {}) => Object.assign({ 구분: '연수구', 세무사명: '[QA 픽스처] 나세무', 활동마을: '송도1동, 송도2동' }, o);
const gwOk = rows => JSON.stringify({ response: { header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' }, body: { items: { item: rows }, numOfRows: 100, pageNo: 1, totalCount: rows.length } } });
const odOk = rows => JSON.stringify({ page: 1, perPage: 100, totalCount: rows.length, currentCount: rows.length, matchCount: rows.length, data: rows });

function upstream({ daegu = () => reply(gwOk([dg(), dg({ EMD_NM: '효목1동', LNDCTN_NM: '[QA 픽스처] 다세무', TELNO: '053-000-0002' })])), incheon = () => reply(odOk([ic()])), other } = {}) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    const u = new URL(url); calls.push({ url: u, init });
    if (u.href.startsWith(tx.SOURCES['daegu-donggu'].endpoint)) return daegu(u);
    if (u.href.startsWith(tx.SOURCES.incheon.endpoint)) return incheon(u);
    if (other) return other(u);
    throw new Error('unexpected host ' + u.host);
  };
  return { fetcher, calls };
}
const reply = (text, { status = 200 } = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => 'application/json' }, text: async () => text });
function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } }; r.json = () => JSON.parse(r.body); return r; }
async function call(h, url, method = 'GET', init = {}) { const r = res(); await h({ method, url, headers: init.headers || {}, body: init.body }, r); return r; }
const handler = (env, up, extra = {}) => createDataHandler({ env, fetcher: up.fetcher, cache: extra.cache || memoryCache(), log: extra.log || (() => {}) });
const S = () => globalThis.LivonDataSchema;
const ent = (srcId, row, o = {}) => S().validateEntity(Object.assign(tx.toEntity(tx.SOURCES[srcId], tx.readRow(tx.SOURCES[srcId], row), 'txTEST' + (o.idSuffix || ''), '2026-09-29T00:00:00.000Z'), o.patch || {})).entity;

/* ───────── contract / server ───────── */
test('1-2 expert schema reuse + official source contract (fixed endpoints, documented params/fields, key server-only)', async () => {
  assert.deepEqual([...S().TYPES].includes('expert'), true);
  assert.deepEqual([...S().TRUST_LEVELS], ['public_designated', 'registered_professional', 'partner_verified', 'business_listing']);
  assert.deepEqual([...tx.SOURCE_IDS], ['daegu-donggu', 'incheon']);
  assert.equal(tx.SOURCES['daegu-donggu'].endpoint, 'https://apis.data.go.kr/3420000/villageTaxAccountantService/getVillageTaxAccountant');
  assert.equal(tx.SOURCES.incheon.endpoint, 'https://api.odcloud.kr/api/15029613/v1/uddi:54dc07f0-3218-48c8-ad27-93328148ad2d');
  const up = upstream();
  await call(handler({ PUBLIC_DATA_SERVICE_KEY: encodeURIComponent(KEY) }, up), Q());
  const d = up.calls.find(c => c.url.host === 'apis.data.go.kr').url, i = up.calls.find(c => c.url.host === 'api.odcloud.kr').url;
  assert.deepEqual([...d.searchParams.keys()], ['serviceKey', 'pageNo', 'numOfRows']); assert.equal(d.searchParams.get('serviceKey'), KEY);
  assert.deepEqual([...i.searchParams.keys()], ['serviceKey', 'page', 'perPage', 'returnType']); assert.equal(i.searchParams.get('returnType'), 'JSON');
  for (const f of ['data/livon-data-core.js', 'data/livon-data-providers.js', 'data/livon-data-schema.js', 'explore-page.js', 'ai-page.js', 'index.html']) assert.doesNotMatch(read(f), /PUBLIC_DATA_SERVICE_KEY|serviceKey|odcloud|villageTaxAccountant/, f);
  assert.match(root('.env.example'), /\nPUBLIC_DATA_SERVICE_KEY=\n/);
});

test('3-4 no key: configured=false, zero calls; secret never exposed', async () => {
  const up = upstream();
  const h = handler({}, up);
  assert.deepEqual((await call(h, '/api/livon/data?action=status')).json().providers['kr-public-tax-expert'], { configured: false, entityTypes: ['expert'] });
  assert.equal((await call(h, Q())).json().code, 'NOT_CONFIGURED'); assert.equal(up.calls.length, 0);
  const logs = [];
  const bad = upstream({ daegu: () => reply('<OpenAPI_ServiceResponse><returnAuthMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</returnAuthMsg>' + KEY + '</OpenAPI_ServiceResponse>'), incheon: () => { throw new Error('x ' + KEY); } });
  const r = await call(handler(ENV, bad, { log: (...a) => logs.push(a.join(' ')) }), Q());
  assert.equal(r.statusCode, 502); assert.doesNotMatch(r.body, /DO\/NOT|serviceKey|NOT_REGISTERED/); assert.ok(logs.every(l => !/DO\/NOT|serviceKey/.test(l)));
});

test('5 source allowlist + strict params: no arbitrary URL, no unknown source, no phone-number lookups', async () => {
  const h = handler(ENV, upstream());
  for (const q of ['source=evil', 'url=https://evil.example', 'region=' + encodeURIComponent('서울'), 'query=053', 'query=0530000001', 'query=' + encodeURIComponent('<b>'), 'category=01', 'lat=1', 'page=0']) {
    assert.equal((await call(h, Q(q))).statusCode, 400, q);
  }
  assert.equal((await call(h, Q('region=' + encodeURIComponent('인천')))).json().items.length, 1);
  assert.deepEqual([...tx.REGIONS], ['대구', '인천']);
});

test('6-12 person normalization: name, role, region, contact (purpose-checked), designation, source date — only official values', () => {
  const d = ent('daegu-donggu', dg());
  assert.equal(d.type, 'expert'); assert.equal(d.title, '[QA 픽스처] 가세무'); assert.equal(d.name, '[QA 픽스처] 가세무');
  assert.equal(d.role, '마을세무사'); assert.equal(d.trustLevel, 'public_designated'); assert.equal(d.verifiedByLivon, false);
  assert.equal(d.serviceArea, '신암1동'); assert.deepEqual([d.location.region, d.location.city, d.location.district], ['대구', '대구광역시 동구', '신암1동']);
  assert.equal(d.contact.phone, '053-000-0001'); assert.equal(d.metadata.phonePurpose, 'consultation');
  assert.equal(d.designationStart, null); assert.equal(d.designationEnd, null);
  assert.equal(d.metadata.referenceDate, '2025-08-28'); assert.equal(d.metadata.referenceKind, 'modified');
  assert.equal(d.sourceOrganization, '대구광역시 동구'); assert.equal(d.sourceDataset, '대구광역시 동구_마을세무사 현황'); assert.equal(d.source.sourceUrl, 'https://www.data.go.kr/data/15110587/openapi.do');
  const i = ent('incheon', ic());
  assert.equal(i.serviceArea, '연수구 송도1동, 송도2동'); assert.equal(i.location.city, '인천광역시 연수구'); assert.equal(i.location.district, null);
  assert.equal(i.contact, null, 'the 20260228 Incheon file has no phone column'); assert.equal(i.metadata.referenceDate, '2026-02-28');
  assert.equal(ent('daegu-donggu', dg({ TELNO: '문의 바람' })).contact, null, 'non-phone text dropped');
});

test('13-18 nothing invented: no qualification, career, rating, review, price, availability, photo, gender, age', () => {
  for (const e of [ent('daegu-donggu', dg()), ent('incheon', ic())]) {
    assert.deepEqual([...e.credentials], []); assert.deepEqual([...e.specialties], []); assert.deepEqual([...e.serviceTypes], []); assert.deepEqual([...e.consultationMethods], []);
    assert.equal(e.externalBookingUrl, null); assert.equal(e.pricing, null); assert.equal(e.media, null); assert.equal(e.availability, null); assert.equal(e.organization, null);
    assert.doesNotMatch(JSON.stringify(e, (k, v) => (v === null ? undefined : v)), /rating|review|career|자격|경력|평점|후기|상담료|예약|gender|age"|photo/i);
    assert.equal(e.category, '세무');
  }
  const forged = S().validateEntity({ type: 'expert', provider: 'x', providerId: '1', title: 't', source: { providerName: 'x' }, trustLevel: 'partner_verified' }).entity;
  assert.equal(forged.trustLevel, null, 'a data feed can never claim partner verification');
});

test('19-21 stable id; same-name people are not merged; cross-source merge needs same contact + area', async () => {
  const s = tx.SOURCES['daegu-donggu'];
  const r1 = tx.readRow(s, dg()), r2 = tx.readRow(s, dg({ EMD_NM: '효목1동' }));
  assert.equal(tx.stableId(s, r1), tx.stableId(s, tx.readRow(s, dg({ TELNO: '053-000-0009' }))), 'id does not depend on the phone');
  assert.notEqual(tx.stableId(s, r1), tx.stableId(s, r2), 'same name, different area → different people');
  assert.notEqual(tx.stableId(s, r1), tx.stableId(tx.SOURCES.incheon, r1), 'source is part of the id');
  const all = await tx.fetchAll({ key: KEY, fetcher: upstream({ daegu: () => reply(gwOk([dg(), dg()])), incheon: () => reply(odOk([])) }).fetcher });
  assert.equal(all.items.length, 2, 'identical rows in one source stay two records (ordinal)'); assert.notEqual(all.items[0].providerId, all.items[1].providerId);
  const { D } = await loaded();
  const a = ent('daegu-donggu', dg());
  const twin = Object.assign({}, a, { id: 'partner-experts:expert:P1', provider: 'partner-experts', providerId: 'P1' });
  assert.equal(D.dedupe([a, twin]).length, 1, 'same name + same contact + same area → one');
  assert.equal(D.dedupe([a, Object.assign({}, twin, { contact: { phone: '053-000-0003' } })]).length, 2, 'same name + area, different contact → two');
  assert.equal(D.dedupe([a, Object.assign({}, twin, { serviceArea: '효목1동' })]).length, 2, 'same name + contact, different area → two');
});

test('22-23 designation: an ended designation is past info (excluded); no dates → status unknown, never "active"', async () => {
  const { D } = await loaded();
  const past = ent('daegu-donggu', dg(), { patch: { designationStart: '2020-01-01', designationEnd: '2021-12-31' } });
  assert.equal(D.freshness(past), 'expired');
  const now = ent('daegu-donggu', dg());
  assert.equal(D.freshness(now), 'unknown');
  const html = D.ui.list([now], D.ui.note('expert'), 'life');
  assert.doesNotMatch(html, /활동 중|현재 인증|최근 검증|검증된 전문가|LIVON 인증|공인 전문가/);
  assert.match(html, /데이터 수정일 2025\.08\.28/); assert.match(html, /LIVON이 검증한 전문가가 아닙니다/);
});

test('34 + 38-39: source failure isolation, timeout, zero results; partial results cached briefly', async () => {
  const ttls = [];
  const cache = memoryCache(); const set = cache.set.bind(cache); cache.set = (k, v, t) => { ttls.push(t); return set(k, v, t); };
  const partial = await call(handler(ENV, upstream({ incheon: () => reply('', { status: 500 }) }), { cache }), Q());
  assert.equal(partial.statusCode, 200); assert.equal(partial.json().items.length, 2, '대구 동구 still shown when 인천 fails');
  assert.deepEqual(ttls, [3600e3], 'a partial result is cached for 1 hour only');
  const full = memoryCache(); const t2 = []; const s2 = full.set.bind(full); full.set = (k, v, t) => { t2.push(t); return s2(k, v, t); };
  await call(handler(ENV, upstream(), { cache: full }), Q()); assert.deepEqual(t2, [7 * 24 * 3600e3], 'expert TTL from config');
  const t = await call(handler(ENV, upstream({ daegu: () => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }); }, incheon: () => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }); } })), Q());
  assert.equal(t.statusCode, 504);
  const quota = await call(handler(ENV, upstream({ daegu: () => reply('<x><returnAuthMsg>LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR</returnAuthMsg><returnReasonCode>22</returnReasonCode></x>'), incheon: () => reply('{"bad":1}') })), Q());
  assert.equal(quota.statusCode, 503); assert.equal(quota.json().code, 'UPSTREAM_LIMIT');
  const zero = await call(handler(ENV, upstream({ daegu: () => reply(JSON.stringify({ response: { header: { resultCode: '03' } } })), incheon: () => reply(odOk([])) })), Q());
  assert.equal(zero.statusCode, 200); assert.deepEqual(zero.json().items, []);
});

test('36-37 safe text + no HTML; phone normalization only', () => {
  const e = ent('incheon', ic({ 세무사명: '<b>[QA 픽스처] 라세무</b><script>alert(1)</script>', 활동마을: '<img src=x onerror=alert(1)>송도1동' }));
  assert.equal(e.title, '[QA 픽스처] 라세무'); assert.equal(e.serviceArea, '연수구 송도1동'); assert.doesNotMatch(JSON.stringify(e), /alert|onerror|[<>]/);
  assert.equal(tx.phone('053 000 0001'), '053-000-0001'); assert.equal(tx.phone('javascript:1'), ''); assert.equal(tx.phone('12345'), '');
});

/* ───────── browser ───────── */
function browser(server) {
  const mem = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; } }; };
  const ctx = { console, URL, setTimeout, clearTimeout, Promise, AbortController, localStorage: mem(), sessionStorage: mem(), location: { protocol: 'https:', hash: '' } };
  ctx.window = ctx;
  ctx.fetch = async (url, init = {}) => { const r = await server(String(url), init); return { ok: r.statusCode === 200, status: r.statusCode, json: async () => JSON.parse(r.body) }; };
  vm.createContext(ctx);
  for (const f of ['explore-data.js', 'today-data.js']) vm.runInContext(read(f), ctx);
  ctx.document = { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
  vm.runInContext(read('life-hub.js'), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  const saves = new Map();
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, x), removeSave: id => saves.delete(id), _saves: saves };
  for (const f of ['data/livon-data-config.js', 'data/livon-data-schema.js', 'data/livon-data-core.js', 'data/livon-data-providers.js', 'explore-search.js']) vm.runInContext(read(f), ctx);
  return ctx;
}
async function loaded({ env = ENV, up = upstream() } = {}) {
  const h = handler(env, up);
  const ctx = browser((url, init = {}) => call(h, url, init.method || 'GET', init));
  await new Promise(r => setTimeout(r, 30));
  await ctx.LivonData.repository.refresh({ force: true });
  return { ctx, D: ctx.LivonData, up };
}
const ours = D => D.repository.list({ includeExpired: true }).filter(e => e.provider === 'kr-public-tax-expert');

test('no key (browser): planned, empty, links hidden; LIVON unaffected', async () => {
  const { D, up } = await loaded({ env: {} });
  assert.equal(D.experts.configured(), false); assert.equal(ours(D).length, 0); assert.equal(up.calls.length, 0); assert.ok(D.repository.size() > 30);
});

test('24-25 Explore + detail: 전문가 tab, region filter, trust badge, facts, tel CTA only for consultation numbers, source link, partial coverage', async () => {
  const { ctx, D } = await loaded();
  assert.equal(ours(D).length, 3);
  const L = ctx.LivonSearch;
  const hits = (q, f) => L.search(q, f || {}).items.filter(x => String(x.item.key).startsWith('ext:kr-public-tax-expert') && !x.via);
  assert.equal(hits('마을세무사').length, 3); assert.equal(hits('마을세무사', { region: '인천' }).length, 1); assert.equal(hits('신암1동').length, 1);
  const g = hits('가세무')[0].item;
  assert.equal(g.type, 'expert'); assert.equal(g.trustLabel, '공공기관 공개 정보'); assert.equal(g.tel, '053-000-0001');
  assert.equal(g.href, 'https://www.data.go.kr/data/15110587/openapi.do'); assert.equal(g.actionLabel, '데이터 출처 보기');
  assert.match(g.meta, /마을세무사 · 신암1동 · 공개: 대구광역시 동구/); assert.doesNotMatch(g.meta + g.desc + (g.tags || []).join(), /053-000/);
  assert.deepEqual([...g.facts], ['역할 마을세무사', '담당 지역 신암1동', '공개 기관 대구광역시 동구', '공개 상담 연락처 053-000-0001', '데이터 수정일 2025.08.28', '데이터 출처 대구광역시 동구_마을세무사 현황']);
  const n = hits('나세무')[0].item; assert.equal(n.tel, '', 'no phone in the Incheon source → no call button');
  assert.equal(D.action(ours(D)[0]), null, 'no fake booking / 공식 페이지 action');
  assert.deepEqual([...D.experts.coverage()].sort(), ['대구광역시 동구', '인천광역시']);
  const ex = read('explore-page.js');
  assert.match(ex, /전화 문의/); assert.match(ex, /공공기관에서 공개한 상담 정보를 순차적으로 연결하고 있습니다/); assert.match(ex, /LIVON이 자격·경력을 검증한 전문가 목록이 아닙니다/);
  assert.doesNotMatch(ex.replace("가격·평점·인기순은 확인된 데이터가 없어 제공하지 않습니다.", ""), /평점순|인기순|예약하기|상담 가능 시간|오늘 가능/);
});

test('31 search never works on phone numbers (index + server)', async () => {
  const { ctx } = await loaded();
  assert.equal(ctx.LivonSearch.search('053-000-0001').items.filter(x => String(x.item.key).startsWith('ext:kr-public-tax-expert')).length, 0);
  assert.equal(ctx.LivonSearch.search('0530000001').items.filter(x => String(x.item.key).startsWith('ext:kr-public-tax-expert')).length, 0);
});

test('26-28 Life Stage / Today links only for explicit tax topics; no person recommended; Home unchanged', async () => {
  const { D } = await loaded();
  const t = LIFE.topics.find(x => x.id === '20s.registration-prep');
  assert.equal(D.experts.planForTopic(t).label, '세무 상담 정보 찾기');
  assert.equal(D.experts.planForTopic(LIFE.topics.find(x => x.category === '여행')), null);
  for (const topic of LIFE.topics) assert.equal(D.forTopic(topic, 'expert').filter(e => e.provider === 'kr-public-tax-expert').length, 0, topic.id);
  assert.ok(LIFE.topics.filter(x => x.lifeStageId === '20').some(x => D.experts.planForTopic(x) === null), 'never by age');
  assert.equal(D.experts.planForContent({ id: 'td-startup-first-weeks' }).href, '#ex-results?q=%EB%A7%88%EC%9D%84%EC%84%B8%EB%AC%B4%EC%82%AC&type=expert');
  assert.equal(D.experts.planForContent({ id: 'exp-yoga' }), null);
  const home = D.forHome({ stage: '20', interests: ['세금', '창업', '세무'] });
  assert.equal(Object.keys(home).includes('experts'), false); assert.doesNotMatch(read('home-page.js'), /kr-public-tax-expert|마을세무사/);
  assert.match(read('life-hub.js'), /X\.configured\(\) && X\.planForTopic/); assert.match(read('today-feed.js'), /X\.configured\(\) && X\.planForContent/);
});

test('29 My Life: explicit save only; snapshot of published facts, marked as a save-time snapshot', async () => {
  const { ctx, D } = await loaded();
  assert.equal(ctx.LivonPlatform._saves.size, 0);
  const e = ours(D).find(x => x.title.includes('가세무'));
  assert.equal(D.save(e.id), 'saved');
  const rec = ctx.LivonPlatform._saves.get('ext:' + e.id), s = rec.data.snapshot;
  assert.equal(rec.type, 'expert');
  assert.deepEqual([s.name, s.role, s.assignedRegion, s.sourceOrganization, s.sourceDataset, s.consultationContact, s.referenceDate, s.trustLevel],
    ['[QA 픽스처] 가세무', '마을세무사', '신암1동', '대구광역시 동구', '대구광역시 동구_마을세무사 현황', '053-000-0001', '2025-08-28', 'public_designated']);
  assert.equal(s.designationPeriod, null); assert.match(s.snapshotNote, /저장 당시 공개 정보/);
  assert.doesNotMatch(JSON.stringify(s, (k, v) => (v === null ? undefined : v)), /자격|경력|평점|후기|price|rating/);
});

test('30 AI reference: experts only from real public data, as kind/title(role·area·source)/href; no profile fields', async () => {
  const ai = read('ai-page.js');
  assert.match(ai, /\(it\.type === "expert" && !it\.realData\)/); assert.match(ai, /title: String\(it\.refTitle \|\| it\.title\)/);
  const { ctx } = await loaded();
  const g = ctx.LivonSearch.search('가세무').items.find(x => String(x.item.key).startsWith('ext:kr-public-tax-expert')).item;
  assert.equal(g.refTitle, '[QA 픽스처] 가세무 · 마을세무사 · 신암1동 · 공개: 대구광역시 동구');
  assert.match(g.href, /^https:\/\/www\.data\.go\.kr\//);
});

test('32-33 location: no geocoding, no Kakao call', async () => {
  const { D, up } = await loaded();
  for (const e of ours(D)) { assert.equal(e.location.latitude, null); assert.equal(e.location.longitude, null); }
  assert.ok(up.calls.every(c => c.url.host !== 'dapi.kakao.com'));
});

test('35 partial coverage wording + docs (trust model, readiness, partner architecture)', () => {
  const docs = root('docs/livon/real-data-providers.md');
  for (const re of [/kr-public-tax-expert/, /전국 통합 인물 API 없음/, /public_designated/, /partner_verified/, /Realtor/, /Village lawyer/, /mojmabyun/, /tn_pubr_public_med_office_api/, /LIVON Expert Partner/, /B553077/]) assert.match(docs, re);
});

test('40 existing providers regression: status lists all seven; other providers’ params untouched', async () => {
  const h = handler({ ...ENV, KAKAO_REST_API_KEY: 'kakao-key-123', TOURAPI_SERVICE_KEY: 'tour-key-1234' }, upstream({ other: () => reply('{}') }));
  const st = (await call(h, '/api/livon/data?action=status')).json().providers;
  assert.deepEqual(Object.keys(st), ['kr-youth-policy', 'kr-business-support', 'kr-business-event', 'kr-kakao-place', 'kr-tourapi', 'kr-lifelong-class', 'kr-public-tax-expert', 'kr-job-training']);
  assert.equal(st['kr-lifelong-class'].configured, true); assert.equal(st['kr-public-tax-expert'].configured, true);
  assert.equal((await call(h, '/api/livon/data?provider=kr-lifelong-class&query=' + encodeURIComponent('요가') + '&method=online')).statusCode !== 400, true);
  assert.equal((await call(h, '/api/livon/data?provider=kr-kakao-place&region=' + encodeURIComponent('대구') + '&query=a')).statusCode, 400);
});
