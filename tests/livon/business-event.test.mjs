// 기업마당 행사정보 provider (kr-business-event): adapter, server route, event normalization and LIVON integration.
// No real key is used; upstream responses are fixtures built from the documented item fields and sample envelope.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as ev from '../../server/livon/data/providers/bizinfo-event.mjs';
import * as biz from '../../server/livon/data/providers/bizinfo.mjs';
import * as common from '../../server/livon/data/providers/bizinfo-common.mjs';
import { createDataHandler, PROVIDERS } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const KEY = 'biz-event-test-key-DO-NOT-LEAK-4242';
const ymd = n => { const d = new Date(Date.now() + n * 864e5 + 9 * 3600e3); return d.toISOString().slice(0, 10).replace(/-/g, ''); };
const dash = n => { const s = ymd(n); return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}`; };

/* documented item fields only (apiDetail.do?id=bizinfoEventApi › 응답 메시지) */
const item = (o = {}) => Object.assign({
  seq: 'EVEN_000000000100001', title: '[전국] 2026 창업 사업설명회 개최 안내', areaNm: '전국', eventType: '사업설명회',
  description: '예비창업자와 초기 창업기업을 위한 지원사업 설명회를 개최합니다.', originOrg: '창업진흥원',
  rceptPd: `${dash(-5)} ~ ${dash(5)}`, originUrl: 'https://www.kised.or.kr/board/notice/1',
  eventPeriod: `${ymd(10)} ~ ${ymd(10)}`, inqireCo: '98765', lcategory: '경영@창업',
  bizinfoUrl: 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C127/AX/210/view.do?eventInfoId=?eventInfoId=EVEN_000000000100001',
  registDe: '20260915', flpthNm: 'https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_1&fileSn=0', fileNm: '포스터.jpg',
  printFlpthNm: 'https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_2&fileSn=4', printFileNm: '공고문.hwp',
  hashTags: '2026,경영,창업,중소벤처기업부', totCnt: '4',
  eventInfoId: 'EVEN_000000000100001', nttNm: '[전국] 2026 창업 사업설명회 개최 안내', eventInfoTyNm: '사업설명회',
  nttCn: '예비창업자와 초기 창업기업을 위한 지원사업 설명회를 개최합니다.', originEngnNm: '창업진흥원',
  originUrlAdres: 'https://www.kised.or.kr/board/notice/1', BeginEndDe: `${ymd(10)} ~ ${ymd(10)}`, pldirSportRealmLclasCodeNm: '경영@창업'
}, o);
const only = (o = {}) => { const r = item(o); for (const k of Object.keys(o)) if (o[k] === undefined) delete r[k]; return r; };
const channel = { title: '기업마당 행사 정보', link: ev.OFFICIAL_LIST, description: '최신 행사 정보를 구독하세요', language: 'ko-kr', copyright: 'bizinfo', category: 'bizinfo', ttl: '60' };
const jsonBody = items => JSON.stringify({ jsonArray: Object.assign({}, channel, { item: items }) });
const xmlBody = items => '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>기업마당 행사 정보</title><link>' + ev.OFFICIAL_LIST + '</link>' +
  items.map(r => '<item>' + Object.entries(r).map(([k, v]) => `<${k}><![CDATA[${v}]]></${k}>`).join('') + '</item>').join('') + '</channel></rss>';

function upstream(handler) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    calls.push(String(url));
    if (!String(url).startsWith(ev.UPSTREAM + '?') && !String(url).startsWith(biz.UPSTREAM + '?')) throw new Error('unexpected host');
    return handler(new URL(url), init);
  };
  return { fetcher, calls };
}
const reply = (body, { status = 200, type = 'application/json' } = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => type }, text: async () => body });
function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } }; r.json = () => JSON.parse(r.body); return r; }
async function call(h, url, method = 'GET') { const r = res(); await h({ method, url, headers: {} }, r); return r; }
const handler = (env, up, log = () => {}) => createDataHandler({ env, fetcher: up.fetcher, cache: memoryCache(), log });
const E = (o, at = new Date().toISOString()) => ev.toEntity(item(o), at);

/* ───────── server side ───────── */
test('1 official contract: fixed event endpoint, same 기업마당 key, documented parameters, bounded searchCnt', () => {
  assert.equal(ev.UPSTREAM, 'https://www.bizinfo.go.kr/uss/rss/bizinfoEventApi.do');
  assert.equal(ev.PROVIDER_ID, 'kr-business-event'); assert.equal(ev.ENV_KEY, 'BIZINFO_API_KEY'); assert.equal(ev.ENV_KEY, biz.ENV_KEY);
  const u = new URL(ev.requestUrl('K', { pageIndex: 3, searchLclasId: '07', hashtags: '부산' }));
  assert.equal(u.origin + u.pathname, ev.UPSTREAM);
  assert.deepEqual([...u.searchParams.keys()], ['crtfcKey', 'dataType', 'searchCnt', 'searchLclasId', 'hashtags', 'pageUnit', 'pageIndex']);
  assert.ok(Number(u.searchParams.get('searchCnt')) > 0 && Number(u.searchParams.get('searchCnt')) <= common.MAX_TOTAL);
  assert.ok(Number(u.searchParams.get('pageUnit')) <= 100);
  assert.deepEqual(PROVIDERS['kr-business-event'].entityTypes, ['event']);
  for (const f of ['livon-data-config.js', 'livon-data-core.js', 'livon-data-providers.js', 'livon-data-schema.js']) {
    assert.doesNotMatch(read('data/' + f), /crtfcKey|bizinfoEventApi\.do|BIZINFO_API_KEY/, f + ' (browser) never touches the key or the endpoint');
  }
});

test('2 shared helpers: support and event adapters use the same parsing/paging code (no copy)', () => {
  assert.equal(biz.filters, common.filters); assert.equal(ev.filters, common.filters);
  assert.equal(biz.parseBody, common.parseBody);
  assert.notEqual(biz.UPSTREAM, ev.UPSTREAM);
  assert.equal(new URL(biz.requestUrl('K')).pathname, '/uss/rss/bizinfoApi.do', 'support endpoint unchanged');
});

test('3 no key: status configured=false for both 기업마당 providers, NOT_CONFIGURED, no upstream call', async () => {
  const up = upstream(() => reply(jsonBody([item()])));
  const h = handler({}, up);
  const st = (await call(h, '/api/livon/data?action=status')).json().providers;
  assert.equal(st['kr-business-event'].configured, false); assert.deepEqual(st['kr-business-event'].entityTypes, ['event']);
  const r = await call(h, '/api/livon/data?provider=kr-business-event&page=1&limit=20');
  assert.equal(r.statusCode, 503); assert.equal(r.json().code, 'NOT_CONFIGURED'); assert.equal(up.calls.length, 0);
  assert.equal((await call(handler({ BIZINFO_API_KEY: '  short ' }, up), '/api/livon/data?provider=kr-business-event')).statusCode, 503);
});

test('4 query mapping: page/limit/category/region validated; unknown keys, bad codes and URLs rejected before config', async () => {
  const up = upstream(() => reply(jsonBody([item()])));
  const h = handler({ BIZINFO_API_KEY: KEY }, up);
  const ok = await call(h, '/api/livon/data?provider=kr-business-event&category=06&region=%EB%B6%80%EC%82%B0&page=1&limit=20');
  assert.equal(ok.statusCode, 200);
  const u = new URL(up.calls[0]);
  assert.equal(u.searchParams.get('searchLclasId'), '06'); assert.equal(u.searchParams.get('hashtags'), '부산');
  for (const q of ['category=10', 'region=%EC%84%9C%EC%9A%B8%EC%8B%9C', 'url=https://evil.example', 'page=0', 'limit=abc', 'page=1&page=2', 'searchCnt=0']) {
    assert.equal((await call(handler({}, up), '/api/livon/data?provider=kr-business-event&' + q)).statusCode, 400, q);
  }
  const big = await call(h, '/api/livon/data?provider=kr-business-event&limit=9999');
  assert.equal(big.json().limit, 100, 'limit is capped');
});

test('5 secret non-exposure: key never in responses or logs on any path', async () => {
  const logs = [];
  const paths = [() => { throw new Error('net ' + KEY); }, () => reply('<html>err ' + KEY + '</html>', { type: 'text/html' }), () => reply('', { status: 401 }), () => reply(jsonBody([item()]))];
  for (const p of paths) {
    const h = createDataHandler({ env: { BIZINFO_API_KEY: KEY }, fetcher: upstream(p).fetcher, cache: memoryCache(), log: (...a) => logs.push(a.join(' ')) });
    const r = await call(h, '/api/livon/data?provider=kr-business-event');
    assert.doesNotMatch(r.body, new RegExp(KEY)); assert.doesNotMatch(r.body, /crtfcKey/);
  }
  assert.ok(logs.every(l => !l.includes(KEY) && !l.includes('crtfcKey')));
});

test('6 JSON (jsonArray.item) and XML (RSS item) parse to the same entities; HTML/unknown shapes are errors', () => {
  const at = '2026-09-29T00:00:00.000Z';
  const j = common.parseBody(jsonBody([item()])).rows.map(r => ev.toEntity(r, at));
  const x = common.parseBody(xmlBody([item()]), 'application/rss+xml').rows.map(r => ev.toEntity(r, at));
  assert.deepEqual(j, x);
  const single = JSON.stringify({ jsonArray: Object.assign({}, channel, { item: item() }) });
  assert.equal(common.parseBody(single).rows.length, 1, 'single item object tolerated');
  assert.throws(() => common.parseBody('<!DOCTYPE html><html></html>'), e => e.code === 'PARSE');
  assert.throws(() => common.parseBody('{"error":"x"}'), e => e.code === 'PARSE');
});

test('7 normalization: event schema fields from documented fields; alias fields (nttNm …) used as fallback', () => {
  const e = E();
  assert.equal(e.type, 'event'); assert.equal(e.provider, 'kr-business-event'); assert.equal(e.providerId, 'EVEN_000000000100001');
  assert.equal(e.title, '[전국] 2026 창업 사업설명회 개최 안내'); assert.match(e.description, /설명회를 개최/);
  assert.equal(e.organizer, '창업진흥원'); assert.equal(e.eventType, '사업설명회');
  assert.equal(e.source.sourceUrl, 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C127/AX/210/view.do?eventInfoId=EVEN_000000000100001', 'documented duplicated query repaired');
  assert.equal(e.contact.website, 'https://www.kised.or.kr/board/notice/1');
  assert.equal(e.metadata.registeredAt, '2026-09-14T15:00:00.000Z');
  const alias = ev.toEntity(only({ seq: undefined, title: undefined, eventType: undefined, description: undefined, originOrg: undefined, originUrl: undefined, eventPeriod: undefined, lcategory: undefined }), 'x');
  assert.equal(alias.providerId, 'EVEN_000000000100001'); assert.equal(alias.title, e.title); assert.equal(alias.eventType, '사업설명회');
  assert.equal(alias.organizer, '창업진흥원'); assert.equal(alias.schedule.startAt, e.schedule.startAt); assert.equal(alias.category, e.category);
  assert.equal(ev.toEntity(only({ seq: undefined, eventInfoId: undefined }), 'x'), null, 'no id → dropped');
});

test('8 nothing invented: no price, capacity, rating, popularity, participants, address, coordinates, images', () => {
  const S = globalThis.LivonDataSchema || (vm.runInThisContext(read('data/livon-data-config.js')), vm.runInThisContext(read('data/livon-data-schema.js')), globalThis.LivonDataSchema);
  const v = S.validateEntity(E());
  assert.ok(v.ok, v.errors.join());
  const e = v.entity;
  assert.equal(e.pricing, null); assert.equal(e.media, null); assert.equal(e.capacity, undefined);
  assert.equal(e.location.address, null); assert.equal(e.location.latitude, null); assert.equal(e.location.longitude, null);
  const flat = JSON.stringify(e);
  assert.doesNotMatch(flat, /98765/, 'inqireCo (view count) not used');
  assert.doesNotMatch(flat, /getImageFile|포스터\.jpg|공고문\.hwp/, 'attachments are not used as images or links');
  assert.doesNotMatch(flat, /rating|popular|participants|capacity/i);
});

test('9 schedule is date-only from eventPeriod; unparseable period → rejected by the schema (no guessed date)', () => {
  const S = globalThis.LivonDataSchema;
  const e = S.validateEntity(E({ eventPeriod: '20261001 ~ 20261003', BeginEndDe: '20261001 ~ 20261003' })).entity;
  assert.equal(e.schedule.startAt, '2026-09-30T15:00:00.000Z'); assert.equal(e.schedule.endAt, '2026-10-03T14:59:59.000Z');
  assert.equal(e.metadata.dateOnly, true);
  const bad = S.validateEntity(E({ eventPeriod: '추후 공지', BeginEndDe: '추후 공지' }));
  assert.equal(bad.ok, false); assert.ok(bad.errors.includes('event:schedule.startAt'));
  assert.equal(S.validateEntity(E({ eventPeriod: '20261005 ~ 20261001', BeginEndDe: '' })).ok, false, 'reversed range not trusted');
});

test('10 registration period: exact range → dates; other text kept as note only', () => {
  const S = globalThis.LivonDataSchema;
  const e = S.validateEntity(E()).entity;
  assert.ok(e.registrationStart && e.registrationEnd);
  assert.equal(e.metadata.registrationNote, `${dash(-5)} ~ ${dash(5)}`);
  const t = S.validateEntity(E({ rceptPd: '선착순 마감 시까지' })).entity;
  assert.equal(t.registrationStart, null); assert.equal(t.registrationEnd, null);
  assert.equal(t.metadata.registrationNote, '선착순 마감 시까지');
  const none = S.validateEntity(E({ rceptPd: '' })).entity;
  assert.equal(none.registrationEnd, null);
});

test('11 region: areaNm first; 전국 kept; multiple/irregular values stay text; hashtags only as fallback', () => {
  assert.equal(E().location.region, '전국');
  assert.equal(E({ areaNm: '부산' }).location.region, '부산');
  const multi = E({ areaNm: '서울,경기' });
  assert.equal(multi.location.region, undefined); assert.ok(multi.tags.includes('서울,경기')); assert.equal(multi.metadata.regionText, '서울,경기');
  assert.equal(E({ areaNm: '전남광주' }).location.region, undefined);
  assert.equal(E({ areaNm: '', hashTags: '2026,창업,대구' }).location.region, '대구');
  assert.equal(E({ areaNm: '', hashTags: '2026,창업,대구,경북' }).location.region, undefined);
});

test('12 category: "경영@창업" keeps both fields; 기타 attaches nothing', () => {
  const e = E();
  assert.equal(e.category, '경영'); assert.equal(e.metadata.fields, '경영,창업');
  assert.ok(e.tags.includes('경영') && e.tags.includes('창업'));
  assert.ok(e.interests.includes('창업') && e.interests.includes('경영'));
  const other = E({ lcategory: '기타', pldirSportRealmLclasCodeNm: '기타' });
  assert.equal(other.category, null); assert.deepEqual(other.interests, []);
});

test('13 pagination, timeout, zero result, upstream failure and cache (event TTL from config)', async () => {
  let n = 0;
  const pages = upstream(u => { n++; const p = Number(u.searchParams.get('pageIndex')); return reply(jsonBody(p <= 2 ? [item({ eventInfoId: 'P' + p, seq: 'P' + p, totCnt: '2' })] : [])); });
  const all = await ev.fetchAll({ key: KEY, fetcher: pages.fetcher });
  assert.deepEqual(all.map(e => e.providerId), ['P1', 'P2']); assert.equal(n, 2, 'stops at totCnt');
  const keep = setTimeout(() => {}, 2000);
  await assert.rejects(ev.fetchAll({ key: KEY, fetcher: (u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(Object.assign(new Error('t'), { name: 'TimeoutError' })))), timeoutMs: 30 }), e => e.code === 'TIMEOUT');
  clearTimeout(keep);
  const zero = await call(handler({ BIZINFO_API_KEY: KEY }, upstream(() => reply(jsonBody([])))), '/api/livon/data?provider=kr-business-event');
  assert.equal(zero.statusCode, 200); assert.equal(zero.json().total, 0);
  let k = 0; const ttls = [];
  const cache = memoryCache(); const set = cache.set.bind(cache); cache.set = (key, v, ttl) => { ttls.push(ttl); return set(key, v, ttl); };
  const h = createDataHandler({ env: { BIZINFO_API_KEY: KEY }, fetcher: upstream(() => { k++; return k === 1 ? reply('', { status: 500 }) : reply(jsonBody([item({ totCnt: '1' })])); }).fetcher, cache, log: () => {} });
  assert.equal((await call(h, '/api/livon/data?provider=kr-business-event')).statusCode, 502);
  assert.equal((await call(h, '/api/livon/data?provider=kr-business-event')).json().cached, false, 'failure not cached');
  assert.equal((await call(h, '/api/livon/data?provider=kr-business-event')).json().cached, true);
  assert.deepEqual(ttls, [6 * 3600e3], 'event TTL (config ttlByType.event)');
});

test('14 event and support caches are separate; one failing does not break the other', async () => {
  const up = upstream(u => u.href.startsWith(ev.UPSTREAM) ? reply('', { status: 500 }) : reply(jsonBody([])));
  const h = handler({ BIZINFO_API_KEY: KEY }, up);
  assert.equal((await call(h, '/api/livon/data?provider=kr-business-event')).statusCode, 502);
  assert.equal((await call(h, '/api/livon/data?provider=kr-business-support')).statusCode, 200);
});

/* ───────── browser side ───────── */
function browser(server) {
  const mem = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; } }; };
  const ctx = { console, URL, setTimeout, clearTimeout, Promise, AbortController, localStorage: mem(), sessionStorage: mem(), location: { protocol: 'https:', hash: '' } };
  ctx.window = ctx;
  ctx.fetch = async url => { const r = await server(String(url)); return { ok: r.statusCode === 200, status: r.statusCode, json: async () => JSON.parse(r.body) }; };
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
const evItems = () => [
  item(),                                                                                        /* open registration, upcoming event */
  item({ eventInfoId: 'CLOSED', seq: 'CLOSED', title: '수출기업 해외마케팅 세미나', nttNm: '수출기업 해외마케팅 세미나', areaNm: '부산', eventType: '세미나', eventInfoTyNm: '세미나',
    lcategory: '수출', pldirSportRealmLclasCodeNm: '수출', originOrg: '부산경제진흥원', originEngnNm: '부산경제진흥원', rceptPd: `${dash(-20)} ~ ${dash(-1)}`,
    eventPeriod: `${ymd(3)} ~ ${ymd(4)}`, BeginEndDe: `${ymd(3)} ~ ${ymd(4)}`, description: '해외 판로 개척 세미나', nttCn: '해외 판로 개척 세미나' }),
  item({ eventInfoId: 'ENDED', seq: 'ENDED', title: '지난 창업 박람회', nttNm: '지난 창업 박람회', eventPeriod: `${ymd(-9)} ~ ${ymd(-2)}`, BeginEndDe: `${ymd(-9)} ~ ${ymd(-2)}`, rceptPd: '' }),
  item({ eventInfoId: 'TEXT', seq: 'TEXT', title: '중소기업 기술 교육 (취소 여부 확인)', nttNm: '중소기업 기술 교육 (취소 여부 확인)', lcategory: '기술', pldirSportRealmLclasCodeNm: '기술',
    eventType: '교육', eventInfoTyNm: '교육', rceptPd: '상시 접수', description: '행사가 취소될 수 있습니다.', nttCn: '행사가 취소될 수 있습니다.', areaNm: '서울,경기', hashTags: '2026,기술' })
];
async function loaded({ rows = evItems(), supportRows = [], env = { BIZINFO_API_KEY: KEY } } = {}) {
  const up = upstream(u => reply(jsonBody(u.href.startsWith(ev.UPSTREAM) ? rows : supportRows)));
  const h = handler(env, up);
  const ctx = browser(url => call(h, url));
  await new Promise(r => setTimeout(r, 30));
  await ctx.LivonData.repository.refresh({ force: true });
  return { ctx, D: ctx.LivonData, up };
}
const evs = (D, o = { includeExpired: true }) => D.repository.list(o).filter(e => e.provider === 'kr-business-event');
const byId = (D, id) => evs(D).find(e => e.providerId === id);

test('15 browser no-key: provider stays planned, nothing added, curated data unaffected', async () => {
  const { D, up } = await loaded({ env: {} });
  const p = D.registry.get('kr-business-event');
  assert.equal(p.enabled, false); assert.equal(p.status, 'planned'); assert.equal(p.topicMatch, 'category');
  assert.equal(evs(D).length, 0); assert.equal(up.calls.length, 0); assert.ok(D.repository.size() > 30);
});

test('16 no data: configured provider with zero events shows nothing (no placeholders)', async () => {
  const { D } = await loaded({ rows: [] });
  assert.equal(D.registry.get('kr-business-event').enabled, true);
  assert.equal(evs(D).length, 0);
  assert.equal(D.ui.list(D.forTopic(LIFE.topics.find(t => t.category === '창업'), 'event'), '', 'life'), '');
});

test('17 expired only after the event end; closed registration is not an ended event; no auto-cancel from text', async () => {
  const { D } = await loaded();
  assert.equal(D.freshness(byId(D, 'ENDED')), 'expired');
  const closed = byId(D, 'CLOSED');
  assert.notEqual(D.freshness(closed), 'expired'); assert.equal(D.registrationState(closed), 'closed');
  assert.equal(D.registrationState(byId(D, 'EVEN_000000000100001')), 'open');
  const text = byId(D, 'TEXT');
  assert.equal(text.eventStatus, 'unknown'); assert.notEqual(D.freshness(text), 'expired'); assert.equal(D.registrationState(text), 'unknown');
});

test('18 CTA: no official registration URL → "공식 안내 보기"; "신청 페이지로 이동" only while open with a registration URL', async () => {
  const { D } = await loaded();
  for (const id of ['EVEN_000000000100001', 'CLOSED', 'TEXT', 'ENDED']) {
    const a = D.action(byId(D, id));
    assert.equal(a.label, '공식 안내 보기', id); assert.match(a.url, /^https:\/\/www\.bizinfo\.go\.kr\//);
  }
  const base = byId(D, 'EVEN_000000000100001');
  assert.equal(D.action(Object.assign({}, base, { registrationUrl: 'https://apply.example.go.kr/' })).label, '신청 페이지로 이동');
  assert.equal(D.action(Object.assign({}, byId(D, 'CLOSED'), { registrationUrl: 'https://apply.example.go.kr/' })).label, '공식 안내 보기', 'closed');
  assert.equal(D.action(Object.assign({}, base, { registrationUrl: 'https://apply.example.go.kr/', registrationStart: new Date(Date.now() + 5 * 864e5).toISOString() })).label, '공식 안내 보기', 'not yet open');
});

test('19 attribution "기관: X / 데이터 출처: 기업마당" and card facts (행사유형, 접수 기간/원문)', async () => {
  const { D } = await loaded();
  const e = byId(D, 'EVEN_000000000100001');
  assert.equal(D.attribution(e).text, '기관: 창업진흥원 / 데이터 출처: 기업마당');
  const html = D.ui.list([e, byId(D, 'TEXT'), byId(D, 'CLOSED')], D.ui.note('event'), 'life');
  assert.match(html, /행사 · 기업마당/); assert.match(html, /기관: 창업진흥원 \/ 데이터 출처: 기업마당/);
  assert.match(html, /사업설명회 · 접수 [\d.]+ – [\d.]+ \(접수 중\)/); assert.match(html, /교육 · 접수: 상시 접수/); assert.match(html, /접수 마감/);
  assert.match(html, /전국/); assert.match(html, /서울,경기/); assert.match(html, /등록 2026\.09\.15/);
  assert.doesNotMatch(html, /<img|getImageFile|98765|조회/);
});

test('20 Explore: title/description/organizer/eventType/category/region/tags; ended events excluded', async () => {
  const { ctx } = await loaded();
  const S = ctx.LivonSearch;
  const found = (q, id) => S.search(q).items.some(x => x.item.key === 'ext:kr-business-event:event:' + id);
  assert.ok(found('창업 사업설명회', 'EVEN_000000000100001'), 'title');
  assert.ok(found('초기 창업기업', 'EVEN_000000000100001'), 'description');
  assert.ok(found('창업진흥원', 'EVEN_000000000100001'), 'organizer');
  assert.ok(found('세미나', 'CLOSED'), 'eventType'); assert.ok(found('수출', 'CLOSED'), 'category');
  assert.ok(found('부산', 'CLOSED'), 'region'); assert.ok(found('중소벤처기업부', 'EVEN_000000000100001'), 'tags');
  assert.ok(!found('지난 창업 박람회', 'ENDED'), 'ended event not offered');
  const r = S.search('창업', { type: 'event' });
  assert.ok(r.items.every(x => x.item.type === 'event'));
});

test('21 Life Stage: exact category/field only (창업 via "경영@창업"), never by age', async () => {
  const { D } = await loaded();
  const ids = t => [...D.forTopic(t, 'event').filter(e => e.provider === 'kr-business-event').map(e => e.providerId)];
  const startupTopics = LIFE.topics.filter(t => t.category === '창업');
  assert.ok(startupTopics.length);
  for (const t of startupTopics) assert.deepEqual(ids(t), ['EVEN_000000000100001'], t.id + ' (ended hidden, other fields excluded)');
  for (const cat of ['돈/재테크', '취업', '자산관리', '여행', '커리어 성장', '자기계발']) for (const t of LIFE.topics.filter(x => x.category === cat)) assert.deepEqual(ids(t), [], t.id);
  assert.ok(evs(D).every(e => e.lifeStages.length === 0));
  assert.deepEqual([...D.repository.listByLifeStage('20', { type: 'event' }).filter(e => e.provider === 'kr-business-event')], []);
});

test('22 Today: only content whose category/tags name an official field', async () => {
  const { ctx, D } = await loaded();
  const today = ctx.LivonTodayData || ctx.LIVON_TODAY || null;
  const startup = { category: '창업', tags: ['창업', '커리어', '새로운 도전'] };
  assert.deepEqual([...D.forToday(startup, 'event').filter(e => e.provider === 'kr-business-event').map(e => e.providerId)], ['EVEN_000000000100001']);
  for (const c of [{ category: '문화 행사', tags: ['주말', '전시'] }, { category: '돈 관리', tags: ['사업', '경영 습관'] }, { category: '독립', tags: ['부산'] }]) {
    assert.deepEqual([...D.forToday(c, 'event').filter(e => e.provider === 'kr-business-event')], [], c.category);
  }
  void today;
});

test('23 Home: "관련 행사" wording, relevant interests only, never "내 주변"', async () => {
  const { D } = await loaded();
  const home = read('home-page.js');
  assert.match(home, /col\("관련 행사"/); assert.doesNotMatch(home, /가까운 행사|내 주변 행사/);
  const ids = r => [...r.events.filter(e => e.provider === 'kr-business-event').map(e => e.providerId)];
  assert.deepEqual(ids(D.forHome({ stage: '30', interests: [] })), [], 'life stage alone');
  assert.deepEqual(ids(D.forHome({ stage: '', interests: ['여행'] })), []);
  assert.deepEqual(ids(D.forHome({ stage: '30', interests: ['창업'] })), ['EVEN_000000000100001']);
});

test('24 My Life snapshot: title, organizer, eventType, region, event/registration period, source, URLs, date', async () => {
  const { ctx, D } = await loaded();
  const id = 'kr-business-event:event:EVEN_000000000100001';
  assert.equal(D.save(id), 'saved');
  const rec = ctx.LivonPlatform._saves.get('ext:' + id);
  const s = rec.data.snapshot;
  assert.equal(rec.type, 'event'); assert.equal(rec.data.kind, 'event'); assert.equal(rec.source, '기업마당');
  assert.equal(s.title, '[전국] 2026 창업 사업설명회 개최 안내'); assert.equal(s.organizer, '창업진흥원'); assert.equal(s.eventType, '사업설명회');
  assert.equal(s.regionText, '전국'); assert.ok(s.startAt && s.endAt);
  assert.ok(s.registrationPeriod.start && s.registrationPeriod.end && s.registrationPeriod.note);
  assert.equal(s.providerName, '기업마당'); assert.match(s.sourceUrl, /eventInfoId=EVEN_000000000100001$/);
  assert.equal(s.originUrl, 'https://www.kised.or.kr/board/notice/1'); assert.equal(s.actionLabel, '공식 안내 보기');
  assert.equal(s.registeredAt, '2026-09-14T15:00:00.000Z');
  D.registry.setEnabled('kr-business-event', false); await D.repository.refresh({ force: true });
  const back = D.fromSave(rec); assert.equal(back.fromSnapshot, true); assert.equal(back.entity.title, s.title);
});

test('25 dedupe: strong evidence only (same title + start day + organizer/URL); similar titles stay separate', () => {
  const ctx = browser(async () => ({ statusCode: 503, body: '{}' }));
  const D = ctx.LivonData;
  const at = new Date().toISOString();
  const a = ctx.LivonDataSchema.validateEntity(ev.toEntity(item(), at)).entity;
  const twin = Object.assign({}, a, { id: 'kr-public-events:event:X1', provider: 'kr-public-events', providerId: 'X1', source: Object.assign({}, a.source, { providerName: '공공 행사' }) });
  const otherDay = Object.assign({}, twin, { id: 'kr-public-events:event:X2', providerId: 'X2', schedule: { startAt: new Date(Date.now() + 40 * 864e5).toISOString(), endAt: null } });
  const titleOnly = Object.assign({}, twin, { id: 'kr-public-events:event:X3', providerId: 'X3', organizer: '다른 기관', source: Object.assign({}, twin.source, { sourceUrl: 'https://example.org/x' }), contact: null });
  assert.equal(D.dedupe([a, twin]).length, 1);
  assert.equal(D.dedupe([a, otherDay]).length, 2, 'different start day');
  const t3 = D.dedupe([a, Object.assign({}, titleOnly, { schedule: { startAt: '2000-01-01T00:00:00.000Z' } })]);
  assert.equal(t3.length, 2);
});

test('26 route/doc wiring: vercel function, serve route, .env.example unchanged key, docs section', () => {
  const root = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
  assert.match(root('.env.example'), /\nBIZINFO_API_KEY=\n/); assert.doesNotMatch(root('.env.example'), /BIZINFO_EVENT/);
  assert.match(root('docs/livon/real-data-providers.md'), /kr-business-event/);
  assert.match(root('docs/livon/real-data-providers.md'), /bizinfoEventApi\.do/);
});

test('support regression: kr-business-support still loads, normalizes and acts the same alongside events', async () => {
  const supportRow = { pblancId: 'PBLN_1', seq: 'PBLN_1', pblancNm: '예비창업패키지', title: '예비창업패키지', jrsdInsttNm: '중소벤처기업부', pldirSportRealmLclasCodeNm: '창업', lcategory: '창업',
    pblancUrl: 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_1', rceptEngnHmpgUrl: 'https://www.k-startup.go.kr/', reqstBeginEndDe: `${ymd(-3)} ~ ${ymd(30)}`, hashTags: '2026,창업', totCnt: '1', creatPnttm: '2026-09-01 10:00:00' };
  const { D } = await loaded({ supportRows: [supportRow] });
  const p = D.repository.list().find(e => e.provider === 'kr-business-support');
  assert.ok(p); assert.equal(p.type, 'policy'); assert.equal(D.action(p).label, '공식 신청 페이지로 이동'); assert.equal(D.attribution(p).text, '출처: 기업마당');
  assert.ok(evs(D).length >= 3, 'events loaded next to support');
  const t = LIFE.topics.find(x => x.category === '창업');
  assert.deepEqual([...D.forTopic(t, 'policy').filter(e => e.provider === 'kr-business-support').map(e => e.providerId)], ['PBLN_1']);
});
