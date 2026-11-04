// 기업마당 지원사업정보 provider (kr-business-support): adapter, server route, normalization and LIVON integration.
// No real key is used; upstream responses are fixtures built from the documented item fields and sample envelope.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as biz from '../../server/livon/data/providers/bizinfo.mjs';
import * as youth from '../../server/livon/data/providers/youthcenter.mjs';
import { createDataHandler, PROVIDERS } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const KEY = 'biz-test-key-DO-NOT-LEAK-9876';
const ymd = n => { const d = new Date(Date.now() + n * 864e5 + 9 * 3600e3); return d.toISOString().slice(0, 10).replace(/-/g, ''); };

/* documented item fields only (apiDetail.do?id=bizinfoApi › 응답 메시지) */
const item = (o = {}) => Object.assign({
  title: '2026년 예비창업패키지 참여자 모집', link: 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000100001',
  seq: 'PBLN_000000000100001', author: '중소벤처기업부', excInsttNm: '창업진흥원',
  description: '예비창업자의 사업화를 지원합니다.', lcategory: '창업', pubDate: '2026-09-01 10:00:00',
  reqstDt: `${ymd(-10)} ~ ${ymd(20)}`, trgetNm: '예비창업자', inqireCo: '4321',
  flpthNm: 'https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_1&fileSn=0', fileNm: '공고.pdf',
  printFlpthNm: 'https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_2&fileSn=1', printFileNm: '공고.pdf',
  hashTags: '2026,창업,서울,중소벤처기업부', totCnt: '3',
  pblancNm: '2026년 예비창업패키지 참여자 모집', pblancUrl: 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000100001',
  pblancId: 'PBLN_000000000100001', jrsdInsttNm: '중소벤처기업부', bsnsSumryCn: '예비창업자의 사업화 자금과 교육을 지원합니다.',
  reqstMthPapersCn: 'K-Startup 온라인 신청', refrncNm: '창업진흥원 담당자 02-000-0000', rceptEngnHmpgUrl: 'https://www.k-startup.go.kr/',
  pldirSportRealmLclasCodeNm: '창업', creatPnttm: '2026-09-01 10:00:00', reqstBeginEndDe: `${ymd(-10)} ~ ${ymd(20)}`
}, o);
const channel = { title: '기업마당 지원사업정보', link: biz.OFFICIAL_LIST, description: '최신지원사업정보를 구독하세요', language: 'ko-kr', copyright: 'bizinfo', category: 'bizinfo', ttl: '60' };
const jsonBody = items => JSON.stringify({ jsonArray: Object.assign({}, channel, { item: items }) });
const xmlBody = items => '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>기업마당 지원사업정보</title><link>' + biz.OFFICIAL_LIST + '</link>' +
  items.map(r => '<item>' + Object.entries(r).map(([k, v]) => `<${k}><![CDATA[${v}]]></${k}>`).join('') + '</item>').join('') + '</channel></rss>';

function upstream(handler) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    calls.push(String(url));
    if (!String(url).startsWith(biz.UPSTREAM + '?') && !String(url).startsWith(youth.UPSTREAM + '?')) throw new Error('unexpected host');
    return handler(new URL(url), init);
  };
  return { fetcher, calls };
}
const reply = (body, { status = 200, type = 'application/json' } = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => type }, text: async () => body });
function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } }; r.json = () => JSON.parse(r.body); return r; }
async function call(h, url, method = 'GET') { const r = res(); await h({ method, url, headers: {} }, r); return r; }
const handler = (env, up, log = () => {}) => createDataHandler({ env, fetcher: up.fetcher, cache: memoryCache(), log });

test('no key: configured=false, NOT_CONFIGURED, no upstream call', async () => {
  const up = upstream(() => reply(jsonBody([item()])));
  const h = handler({}, up);
  assert.equal((await call(h, '/api/livon/data?action=status')).json().providers['kr-business-support'].configured, false);
  const r = await call(h, '/api/livon/data?provider=kr-business-support&page=1&limit=20');
  assert.equal(r.statusCode, 503); assert.equal(r.json().code, 'NOT_CONFIGURED');
  assert.equal(up.calls.length, 0);
});

test('query mapping: category/region → official searchLclasId/hashtags; invalid values rejected; no URL from the client', async () => {
  const up = upstream(() => reply(jsonBody([item()])));
  const h = handler({ BIZINFO_API_KEY: KEY }, up);
  const ok = await call(h, '/api/livon/data?provider=kr-business-support&category=06&region=%EC%84%9C%EC%9A%B8&page=1&limit=20');
  assert.equal(ok.statusCode, 200);
  const u = new URL(up.calls[0]);
  assert.equal(u.searchParams.get('searchLclasId'), '06'); assert.equal(u.searchParams.get('hashtags'), '서울');
  for (const bad of ['category=99', 'category=%EC%B0%BD%EC%97%85', 'region=%ED%8F%89%EC%96%91', 'region=%EC%A0%84%EB%82%A8', 'url=https://evil.example', 'hashtags=x', 'crtfcKey=x']) {
    assert.equal((await call(h, '/api/livon/data?provider=kr-business-support&' + bad)).statusCode, 400, bad);
  }
  assert.equal((await call(h, '/api/livon/data?provider=kr-youth-policy&category=06')).statusCode, 400, 'youth provider has no filters');
  assert.equal((await call(h, '/api/livon/data?provider=kr-business-support&category=06&category=01')).statusCode, 400, 'duplicate params');
  assert.equal((await call(h, '/api/livon/data?provider=kr-business-support', 'POST')).statusCode, 405);
  up.calls.forEach(c => assert.ok(c.startsWith(biz.UPSTREAM + '?')));
});

test('secret non-exposure on every failure path', async () => {
  const logs = [];
  for (const f of [() => reply('<html>' + KEY + '</html>', { status: 500, type: 'text/html' }), () => { throw new Error('boom ' + KEY); }, () => reply('garbage ' + KEY, { type: 'text/plain' }), () => reply(JSON.stringify({ error: 'invalid key ' + KEY }))]) {
    const up = upstream(f);
    const r = await call(handler({ BIZINFO_API_KEY: KEY }, up, (...a) => logs.push(a.join(' '))), '/api/livon/data?provider=kr-business-support');
    assert.equal(r.statusCode, 502); assert.equal(r.json().code, 'UPSTREAM_ERROR');
    assert.doesNotMatch(r.body, new RegExp(KEY + '|bizinfo|crtfcKey|html'));
  }
  logs.forEach(l => assert.doesNotMatch(l, new RegExp(KEY + '|bizinfo|crtfcKey')));
});

test('JSON (jsonArray.item) and XML (RSS item) parse to the same entities; invalid shapes are errors', () => {
  const a = biz.parseBody(jsonBody([item(), item({ pblancId: 'P2', seq: 'P2' })]), 'application/json');
  const b = biz.parseBody(xmlBody([item(), item({ pblancId: 'P2', seq: 'P2' })]), 'application/rss+xml');
  assert.equal(a.rows.length, 2); assert.equal(b.rows.length, 2);
  const at = new Date().toISOString();
  assert.deepEqual(biz.toEntity(a.rows[0], at), biz.toEntity(b.rows[0], at));
  assert.equal(biz.parseBody(JSON.stringify({ jsonArray: Object.assign({}, channel, { item: item() }) })).rows.length, 1, 'single item object');
  assert.equal(biz.parseBody(JSON.stringify({ jsonArray: Object.assign({}, channel) })).rows.length, 0, 'documented envelope, no items → real zero');
  for (const bad of ['', '{bad', JSON.stringify({ result: [] }), '<!doctype html><title>점검</title>', '<foo/>', 'text']) assert.throws(() => biz.parseBody(bad), e => e.code === 'PARSE', bad);
});

test('normalization: documented fields only; no amounts/eligibility invented; view count and attachments dropped', () => {
  const e = biz.toEntity(item(), '2026-09-29T00:00:00.000Z');
  assert.equal(e.provider, 'kr-business-support'); assert.equal(e.providerId, 'PBLN_000000000100001'); assert.equal(e.type, 'policy');
  assert.equal(e.title, '2026년 예비창업패키지 참여자 모집');
  assert.equal(e.summary, '예비창업자의 사업화 자금과 교육을 지원합니다.');
  assert.equal(e.agency, '중소벤처기업부'); assert.equal(e.metadata.operator, '창업진흥원');
  assert.equal(e.eligibility, '지원 대상: 예비창업자'); assert.equal(e.benefits, null);
  assert.equal(e.applicationUrl, 'https://www.k-startup.go.kr/');
  assert.equal(e.officialSource, 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000100001');
  assert.equal(e.source.updatedAt, null, 'registration date is not an update date');
  assert.equal(e.metadata.registeredAt, '2026-09-01T01:00:00.000Z'); assert.equal(e.metadata.fieldCode, '06');
  assert.deepEqual(e.lifeStages, []);
  const flat = JSON.stringify(e);
  assert.doesNotMatch(flat, /4321|inqireCo|getImageFile|공고\.pdf|02-000-0000/);
  assert.equal(biz.toEntity(item({ pblancId: '', seq: '' }), 'x'), null);
});

test('category codes → LIVON category/interests; 기타 maps to nothing', () => {
  assert.deepEqual(biz.mapCategory('창업'), { category: '창업', interests: ['창업', '사업', '스타트업'] });
  assert.equal(biz.mapCategory('금융').category, '금융');
  assert.ok(!biz.mapCategory('금융').interests.includes('돈'), 'business finance is not personal money');
  assert.ok(!biz.mapCategory('인력').interests.includes('취업'), 'hiring support is not job seeking');
  assert.deepEqual(biz.mapCategory('기타'), { category: null, interests: [] });
  assert.deepEqual(biz.mapCategory('없는분야'), { category: null, interests: [] });
  Object.values(biz.FIELD_CODES).forEach(n => assert.ok(biz.CATEGORY_MAP[n], n));
});

test('region: one official region → location.region; several or 전남광주 → text/tags only', () => {
  const r = t => biz.toEntity(item({ hashTags: t }), 'x');
  assert.equal(r('2026,창업,서울,중소벤처기업부').location.region, '서울');
  const many = r('2026,금융,충북,대전,중소벤처기업부');
  assert.equal(many.location.region, undefined); assert.equal(many.jurisdiction, '충북·대전');
  const jg = r('창업,전남광주');
  assert.equal(jg.location.region, undefined); assert.ok(jg.tags.includes('전남광주')); assert.equal(jg.jurisdiction, '전남광주');
  assert.ok(!r('2026,창업').tags.includes('2026'), 'year tags dropped');
});

test('application period: documented range → start/end; other wording is only a note (never expired)', () => {
  assert.deepEqual(biz.applicationPeriod(item({ reqstBeginEndDe: '20260101 ~ 20260331' })), { start: '2026-01-01', end: '2026-03-31', note: '20260101 ~ 20260331' });
  assert.deepEqual(biz.applicationPeriod(item({ reqstBeginEndDe: '상시접수', reqstDt: '' })), { start: null, end: null, note: '상시접수' });
  assert.deepEqual(biz.applicationPeriod(item({ reqstBeginEndDe: '예산 소진시까지 (20260101~)', reqstDt: '' })).end, null);
  assert.equal(biz.applicationPeriod(item({ reqstBeginEndDe: '', reqstDt: '' })), null);
});

test('pagination: bounded pages; stops on empty page, repeated page, totCnt or cap', async () => {
  let pages = 0;
  const up = upstream(u => { pages++; const n = Number(u.searchParams.get('pageIndex')); return reply(jsonBody(n === 1 ? [item(), item({ pblancId: 'B', seq: 'B' })] : n === 2 ? [item({ pblancId: 'C', seq: 'C', totCnt: '9' })] : [])); });
  const list = await biz.fetchAll({ key: KEY, fetcher: up.fetcher });
  assert.equal(list.length, 3); assert.equal(pages, 3);
  let p2 = 0;
  const same = upstream(() => { p2++; return reply(jsonBody([item({ totCnt: '500' })])); });
  assert.equal((await biz.fetchAll({ key: KEY, fetcher: same.fetcher })).length, 1); assert.equal(p2, 2, 'upstream ignoring paging → stop after a page with no new IDs');
  let p3 = 0;
  const full = upstream(u => { p3++; const n = Number(u.searchParams.get('pageIndex')); return reply(jsonBody(Array.from({ length: 100 }, (_, i) => item({ pblancId: n + '-' + i, seq: n + '-' + i, totCnt: '99999' })))); });
  assert.equal((await biz.fetchAll({ key: KEY, fetcher: full.fetcher })).length, biz.MAX_TOTAL); assert.equal(p3, biz.MAX_PAGES, 'hard cap');
});

test('timeout, zero result, upstream failure and server cache', async () => {
  const keep = setTimeout(() => {}, 2000);
  await assert.rejects(biz.fetchAll({ key: KEY, fetcher: (u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(Object.assign(new Error('t'), { name: 'TimeoutError' })))), timeoutMs: 30 }), e => e.code === 'TIMEOUT');
  clearTimeout(keep);
  const zero = await call(handler({ BIZINFO_API_KEY: KEY }, upstream(() => reply(jsonBody([])))), '/api/livon/data?provider=kr-business-support');
  assert.equal(zero.statusCode, 200); assert.deepEqual(zero.json().items, []); assert.equal(zero.json().total, 0);
  let n = 0;
  const up = upstream(() => { n++; return n === 1 ? reply('', { status: 503, type: 'text/plain' }) : reply(jsonBody([item({ totCnt: '1' })])); });
  const h = handler({ BIZINFO_API_KEY: KEY }, up);
  assert.equal((await call(h, '/api/livon/data?provider=kr-business-support')).statusCode, 502);
  const ok = await call(h, '/api/livon/data?provider=kr-business-support&limit=20');
  assert.equal(ok.statusCode, 200); assert.equal(ok.json().cached, false, 'failure was not cached');
  const again = await call(h, '/api/livon/data?provider=kr-business-support&page=1&limit=20');
  assert.equal(again.json().cached, true);
  const pagesBefore = up.calls.length;
  await Promise.all([call(h, '/api/livon/data?provider=kr-business-support&category=06'), call(h, '/api/livon/data?provider=kr-business-support&category=06')]);
  assert.equal(up.calls.length - pagesBefore, 1, 'concurrent identical requests share one upstream refresh');
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
const bizItems = () => [
  item(),
  item({ pblancId: 'FIN1', seq: 'FIN1', pblancNm: '중소기업 정책자금 융자', title: '중소기업 정책자금 융자', lcategory: '금융', pldirSportRealmLclasCodeNm: '금융', trgetNm: '중소기업', hashTags: '2026,금융,경기', rceptEngnHmpgUrl: '', bsnsSumryCn: '중소기업의 운전자금을 융자합니다.' }),
  item({ pblancId: 'OLD1', seq: 'OLD1', pblancNm: '지난 창업 경진대회', title: '지난 창업 경진대회', reqstBeginEndDe: `${ymd(-60)} ~ ${ymd(-2)}`, reqstDt: `${ymd(-60)} ~ ${ymd(-2)}` })
];
async function loaded({ bizRows = bizItems(), youthRows = [], env = { BIZINFO_API_KEY: KEY } } = {}) {
  const up = upstream(u => reply(u.href.startsWith(biz.UPSTREAM) ? jsonBody(bizRows) : JSON.stringify({ result: { youthPolicyList: youthRows } })));
  const h = handler(env, up);
  const ctx = browser(url => call(h, url));
  await new Promise(r => setTimeout(r, 30));
  await ctx.LivonData.repository.refresh({ force: true });
  return { ctx, D: ctx.LivonData, up };
}

