// 고용24 국민내일배움카드 훈련과정 (kr-job-training): adapter, route, normalization and LIVON integration.
// No real key is used. Fixtures ([QA 픽스처]) use only the XML elements documented on the 고용24 OPEN-API pages
// (목록 callOpenApiSvcInfo310L01 / 과정·기관정보 callOpenApiSvcInfo310L02). Error bodies mirror what the endpoint returned
// without a valid key on 2026-09-29 (HTTP 200 + <GO24><error>…</error></GO24>).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as jt from '../../server/livon/data/providers/job-training.mjs';
import * as lc from '../../server/livon/data/providers/lifelong-class.mjs';
import { createDataHandler, PROVIDERS } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';
import { INSTRUCTIONS } from '../../server/livon/chat.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const root = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const KEY = 'w24-test-key+DO/NOT=LEAK-4242';
const ENV = { WORK24_TRAINING_API_KEY: KEY };
const day = n => new Date(Date.now() + n * 864e5 + 9 * 3600e3).toISOString().slice(0, 10);
const Q = s => '/api/livon/data?provider=kr-job-training' + (s ? '&' + s : '');
const enc = encodeURIComponent;

const row = (o = {}) => Object.assign({
  address: '서울특별시 강남구 테헤란로 1', certificate: '정보처리산업기사', contents: '비공개 의미 필드', courseMan: '1800000',
  eiEmplCnt3: '12', eiEmplRate3: '75.5', eiEmplRate6: '80.1', grade: 'A', instCd: '500020012345', ncsCd: '20010202',
  realMan: '1800000', regCourseMan: '27', stdgScor: '4.8', subTitle: '[QA 픽스처] 가나다직업전문학교', subTitleLink: 'https://www.work24.go.kr/inst',
  telNo: '02-555-0101', title: '[QA 픽스처] 웹 개발자 양성과정', titleIcon: '1',
  titleLink: 'https://www.work24.go.kr/hr/a/a/3100/selectTracseDetl.do?tracseId=AIG20230000412345&tracseTme=3&crseTracseSe=C0061&trainstCstmrId=500020012345',
  traStartDate: day(14), traEndDate: day(120), trainTarget: '국민내일배움카드(일반)', trainTargetCd: 'M1001', trainstCstId: '500020012345',
  trngAreaCd: '11680', trprDegr: '3', trprId: 'AIG20230000412345', wkendSe: '3', yardMan: '25'
}, o);
const xesc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const listXml = (rows, total = rows.length, page = 1) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<HRDNet><scn_cnt>${total}</scn_cnt><pageNum>${page}</pageNum><pageSize>20</pageSize><srchList>` +
  rows.map(r => '<scn_list>' + Object.entries(r).map(([k, v]) => `<${k}>${xesc(v)}</${k}>`).join('') + '</scn_list>').join('') + '</srchList></HRDNet>';
const detailXml = (b = {}, d = {}) => {
  const base = Object.assign({ addr1: '서울특별시 강남구 테헤란로 1', addr2: '5층', filePath: '/x', hpAddr: 'https://gnd.example.ac.kr', inoNm: '[QA 픽스처] 가나다직업전문학교', instIno: '500020012345',
    instPerTrco: '1800000', ncsCd: '20010202', ncsNm: '응용SW엔지니어링', ncsYn: 'Y', perTrco: '1500000', torgParGrad: 'A등급', trDcnt: '80', traingMthCd: 'M1001',
    trprChap: '홍길동', trprChapEmail: 'hong@example.com', trprChapTel: '010-1234-5678', trprDegr: '3', trprGbn: 'C', trprId: 'AIG20230000412345',
    trprNm: '[QA 픽스처] 웹 개발자 양성과정', trprTargetNm: '국민내일배움카드', trtm: '640', zipCd: '06000' }, b);
  const det = Object.assign({ govBusiNm: '정보통신', torgGbnCd: '01', totTraingDyct: '80', totTraingTime: '640', tgcrGnrlTrneOwepAllt: '0', trprDegr: '3', trprId: 'AIG20230000412345', trprNm: '[QA 픽스처] 웹 개발자 양성과정' }, d);
  const tags = o => Object.entries(o).map(([k, v]) => `<${k}>${xesc(v)}</${k}>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><HRDNet><inst_base_info>${tags(base)}</inst_base_info><inst_detail_info>${tags(det)}</inst_detail_info>` +
    '<inst_facility_info><inst_facility_info_list><cstmrNm>가나다</cstmrNm><trafcltyNm>강의실</trafcltyNm></inst_facility_info_list></inst_facility_info></HRDNet>';
};
const goError = msg => `<?xml version='1.0' encoding='UTF-8'?>\n<GO24>\n  <error>${msg}</error>\n</GO24>\n`;

function upstream(handler) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    const u = new URL(url); calls.push({ url: u, init });
    if (u.origin !== 'https://www.work24.go.kr' && u.origin !== 'https://api.data.go.kr' && u.origin !== 'https://www.bizinfo.go.kr') throw new Error('unexpected host');
    return handler(u, init);
  };
  return { fetcher, calls };
}
const reply = (text, { status = 200 } = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => 'application/xml' }, text: async () => text });
function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } }; r.json = () => JSON.parse(r.body); return r; }
async function call(h, url, method = 'GET', init = {}) { const r = res(); await h({ method, url, headers: init.headers || {}, body: init.body }, r); return r; }
const handler = (env, up, extra = {}) => createDataHandler({ env, fetcher: up.fetcher, cache: extra.cache || memoryCache(), log: extra.log || (() => {}) });
const S = () => globalThis.LivonDataSchema;
const E = (o, at = new Date().toISOString()) => S().validateEntity(jt.toEntity(row(o), at)).entity;
const defaultUp = () => upstream(u => reply(u.pathname.endsWith('310L02.do') ? detailXml() : listXml([row()])));

/* ───────── official contract / auth / secrets ───────── */
test('JT-1 official contract: fixed 고용24 endpoints, documented params only, XML, sort by 훈련시작일 (never 취업률/만족도)', async () => {
  assert.equal(jt.UPSTREAM_LIST, 'https://www.work24.go.kr/cm/openApi/call/hr/callOpenApiSvcInfo310L01.do');
  assert.equal(jt.UPSTREAM_DETAIL, 'https://www.work24.go.kr/cm/openApi/call/hr/callOpenApiSvcInfo310L02.do');
  assert.equal(jt.DATASET_URL, 'https://www.data.go.kr/data/15109032/openapi.do');
  const up = defaultUp();
  const r = await call(handler(ENV, up), Q());
  assert.equal(r.statusCode, 200);
  const u = up.calls[0].url;
  assert.equal(u.origin + u.pathname, jt.UPSTREAM_LIST);
  assert.deepEqual([...u.searchParams.keys()], ['authKey', 'returnType', 'outType', 'pageNum', 'pageSize', 'srchTraStDt', 'srchTraEndDt', 'sort', 'sortCol']);
  assert.equal(u.searchParams.get('authKey'), KEY); assert.equal(u.searchParams.get('returnType'), 'XML'); assert.equal(u.searchParams.get('outType'), '1');
  assert.equal(u.searchParams.get('sort'), 'ASC'); assert.equal(u.searchParams.get('sortCol'), '2');
  assert.equal(u.searchParams.get('srchTraStDt'), day(0).replace(/-/g, '')); assert.equal(u.searchParams.get('srchTraEndDt'), day(90).replace(/-/g, ''));
  assert.equal(up.calls[0].init.redirect, 'error'); assert.ok(up.calls[0].init.signal, 'timeout signal');
  assert.match(root('.env.example'), /\nWORK24_TRAINING_API_KEY=\n/);
});

test('JT-2 authentication / no key: configured=false, NOT_CONFIGURED, 0 upstream calls, bad params still 400', async () => {
  const up = defaultUp();
  const h = handler({}, up);
  assert.deepEqual((await call(h, '/api/livon/data?action=status')).json().providers['kr-job-training'], { configured: false, entityTypes: ['program'], mode: 'search' });
  const r = await call(h, Q('query=' + enc('웹')));
  assert.equal(r.statusCode, 503); assert.equal(r.json().code, 'NOT_CONFIGURED');
  assert.equal((await call(h, Q('id=1'))).statusCode, 400);
  assert.equal((await call(h, Q('region=Seoul'))).statusCode, 400);
  assert.equal((await call(handler({ WORK24_TRAINING_API_KEY: 'short' }, up), Q())).statusCode, 503, 'a too-short key is not configured');
  assert.equal(up.calls.length, 0);
});

/* ───────── parameters / pagination ───────── */
test('JT-4 parameter validation: allowlist → documented codes; unsafe / unknown values rejected before any upstream call', async () => {
  const up = defaultUp();
  const h = handler(ENV, up);
  await call(h, Q('query=' + enc('웹 개발') + '&region=' + enc('부산') + '&method=online&type=C0104&period=30'));
  const u = up.calls.at(-1).url.searchParams;
  assert.equal(u.get('srchTraProcessNm'), '웹 개발'); assert.equal(u.get('srchTraArea1'), '26'); assert.equal(u.get('srchTraGbn'), 'M1005');
  assert.equal(u.get('crseTracseSe'), 'C0104'); assert.equal(u.get('srchTraEndDt'), day(30).replace(/-/g, '')); assert.equal(u.get('srchTraOrganNm'), null);
  await call(h, Q('org=' + enc('가나다') + '&region=' + enc('광주') + '&method=blended'));
  const v = up.calls.at(-1).url.searchParams;
  assert.equal(v.get('srchTraOrganNm'), '가나다'); assert.equal(v.get('srchTraProcessNm'), null); assert.equal(v.get('srchTraArea1'), '12', '광주 → documented 전남광주 code'); assert.equal(v.get('srchTraGbn'), 'M1010');
  const before = up.calls.length;
  for (const q of ['query=' + 'a'.repeat(51), 'query=' + enc('<x>'), 'query=' + enc('a&authKey=b'), 'query=' + enc('100%'), 'region=Seoul', 'region=' + enc('전국'), 'method=mobile', 'type=C9999',
    'type=' + enc('C0061;'), 'period=60', 'period=abc', 'page=0', 'page=-1', 'limit=abc', 'id=' + enc('../x'), 'id=AIG1_3', 'id=AIG1_3_5&query=a', 'lat=37.5&lng=127',
    'status=open', 'category=01', 'url=' + enc('https://evil.example'), 'sortCol=3', 'authKey=x']) {
    assert.equal((await call(h, Q(q))).statusCode, 400, q);
  }
  assert.equal(up.calls.length, before, 'no upstream call for a rejected request');
  assert.equal((await call(h, '/api/livon/data', 'POST', { headers: { 'content-type': 'application/json' }, body: JSON.stringify({ provider: 'kr-job-training', action: 'nearby', lat: 1, lng: 1 }) })).statusCode, 400);
});

test('JT-5 pagination: pageNum/pageSize bounded (≤50 pages, ≤50 rows), hasMore from scn_cnt; LIVON page ↔ pageNum', async () => {
  const up = upstream(u => { const n = +u.searchParams.get('pageNum'); return reply(listXml([row({ trprDegr: String(n) })], 45, n)); });
  const h = handler(ENV, up);
  const p1 = (await call(h, Q('limit=20'))).json();
  assert.equal(p1.total, 45); assert.equal(p1.hasMore, true); assert.equal(p1.limit, 20);
  const p3 = (await call(h, Q('limit=20&page=3'))).json();
  assert.equal(p3.hasMore, false, '3×20 ≥ 45');
  assert.equal(up.calls[1].url.searchParams.get('pageNum'), '3');
  await call(h, Q('limit=999&page=999'));
  assert.equal(up.calls.at(-1).url.searchParams.get('pageSize'), '50'); assert.equal(up.calls.at(-1).url.searchParams.get('pageNum'), '50');
  const last = (await call(h, Q('limit=999&page=999'))).json();
  assert.equal(last.hasMore, false, 'never more than LIMITS.maxPage');
});

/* ───────── normalization ───────── */
test('JT-6 normalization: documented list fields → existing program entity; forbidden fields never stored', () => {
  const e = E();
  assert.equal(e.type, 'program'); assert.equal(e.provider, 'kr-job-training');
  assert.equal(e.title, '[QA 픽스처] 웹 개발자 양성과정');
  assert.equal(e.format, '일반과정'); assert.equal(e.capacity, 25);
  assert.equal(e.metadata.subTitle, '[QA 픽스처] 가나다직업전문학교'); assert.equal(e.metadata.trainTarget, '국민내일배움카드(일반)');
  assert.equal(e.metadata.weekend, '주중'); assert.equal(e.metadata.certificate, '정보처리산업기사'); assert.equal(e.metadata.ncsCd, '20010202');
  assert.equal(e.metadata.courseFee, 1800000); assert.equal(e.metadata.realFee, 1800000);
  assert.equal(e.category, null); assert.deepEqual([...e.lifeStages], []); assert.equal(e.summary, null, '"contents" meaning is not documented');
  const json = JSON.stringify(jt.toEntity(row(), 'x'));
  for (const bad of ['75.5', '80.1', '4.8', '"27"', 'eiEmpl', 'stdgScor', 'grade', 'regCourseMan', '비공개 의미 필드', 'titleIcon']) assert.ok(!json.includes(bad), bad);
  assert.doesNotMatch(JSON.stringify(e, (k, v) => (v === null ? undefined : v)), /rating|review|popular|seats|remaining|availability|applicants|취업률|만족도|합격/i);
});

test('JT-7 course id: official trprId + 회차 + 훈련기관ID; stable; malformed ids dropped; route id parsing strict', () => {
  const a = jt.toEntity(row(), 'x'), b = jt.toEntity(row({ title: '[QA 픽스처] 제목 수정', courseMan: '1' }), 'y');
  assert.equal(a.providerId, 'AIG20230000412345_3_500020012345'); assert.equal(a.providerId, b.providerId);
  assert.notEqual(jt.toEntity(row({ trprDegr: '4' }), 'x').providerId, a.providerId, 'another 회차 is another course');
  assert.equal(jt.toEntity(row({ trprId: '' }), 'x'), null); assert.equal(jt.toEntity(row({ trprId: 'AIG/../x' }), 'x'), null);
  assert.equal(jt.toEntity(row({ trprDegr: 'x' }), 'x'), null); assert.equal(jt.toEntity(row({ title: '' }), 'x'), null);
  assert.equal(jt.toEntity(row({ trainstCstId: '' }), 'x').providerId, 'AIG20230000412345_3', 'no 기관ID → id without it (detail unavailable)');
  assert.deepEqual(jt.parseId('AIG1_3_500'), { id: 'AIG1', degr: '3', torg: '500' });
  for (const bad of ['AIG1_3', 'AIG1_x_500', 'A-1_3_5', 'AIG1_3_500_9', '']) assert.equal(jt.parseId(bad), null, bad);
});

test('JT-8 institution: 훈련기관명 only from the documented 과정/기관정보 field (inoNm); subTitle kept verbatim, never labelled', async () => {
  assert.equal(E().organizer, null);
  const d = jt.toDetailEntity(jt.parseDetail(detailXml()), jt.parseId('AIG20230000412345_3_500020012345'), 'x');
  assert.equal(d.organizer, '[QA 픽스처] 가나다직업전문학교'); assert.equal(d.metadata.institution, '[QA 픽스처] 가나다직업전문학교');
  const json = JSON.stringify(d);
  for (const pii of ['홍길동', 'hong@example.com', '010-1234-5678', 'A등급', '강의실', 'filePath']) assert.ok(!json.includes(pii), pii);
});

test('JT-10 training mode: documented 훈련구분 codes only; unknown code → nothing shown', () => {
  assert.deepEqual(['M1001', 'M1005', 'M1010', 'M1014', 'X', ''].map(c => E({ trainTargetCd: c }).format), ['일반과정', '인터넷과정', '혼합과정(BL)', '스마트혼합훈련', null, null]);
  assert.deepEqual(['M1001', 'M1005', 'M1010'].map(c => E({ trainTargetCd: c }).metadata.methodMode), ['offline', 'online', 'both']);
  assert.deepEqual(['1', '2', '3', '9', ''].map(w => E({ wkendSe: w }).metadata.weekend || ''), ['주말', '주말·주중 혼합', '주중', '', '']);
});

test('JT-13 official URL + unsafe URL: course link only on 고용24/HRD-Net hosts; homepage must be http(s) with a real host', () => {
  for (const u of ['javascript:alert(1)', 'https://evil.example/hr', 'http://work24.go.kr.evil.example/x', 'https://user:pw@www.work24.go.kr/x', '/hr/a/a/3100', 'data:text/html,x']) assert.equal(jt.courseUrl(u), '', u);
  assert.equal(jt.courseUrl('https://www.work24.go.kr/hr/x?a=1'), 'https://www.work24.go.kr/hr/x?a=1');
  assert.equal(jt.courseUrl('https://www.hrd.go.kr/x'), 'https://www.hrd.go.kr/x');
  for (const u of ['javascript:alert(1)', 'https://localhost', 'www.x.kr', 'https://u:p@x.kr']) assert.equal(jt.webUrl(u), '', u);
  const d = jt.toDetailEntity(jt.parseDetail(detailXml({ hpAddr: 'javascript:alert(1)' })), jt.parseId('A1_1_B1'), 'x');
  assert.equal(d.contact.website, null);
});

test('JT-14 unsafe text: tags/scripts/bidi removed from every field; XML entities/CDATA decoded once', () => {
  const e = E({ title: '<b>[QA 픽스처] 과정</b><script>alert(1)</script>', subTitle: '<img src=x onerror=alert(1)>기관‮', certificate: 'A&amp;B' });
  assert.equal(e.title, '[QA 픽스처] 과정'); assert.equal(e.metadata.subTitle, '기관'); assert.doesNotMatch(JSON.stringify(e), /alert|onerror|[<>]|‮/);
  const x = jt.parseList('<HRDNet><scn_cnt>1</scn_cnt><srchList><scn_list><title><![CDATA[R&D <과정>]]></title><trprId>A1</trprId><trprDegr>1</trprDegr><telNo/></scn_list></srchList></HRDNet>');
  assert.equal(x.rows[0].title, 'R&D <과정>'); assert.equal(x.rows[0].telNo, '');
  assert.equal(jt.toEntity(x.rows[0], 'x').title, 'R&D 과정', 'non-HTML angle brackets are removed, the words kept');
  assert.equal(S().validateEntity(jt.toEntity(x.rows[0], 'x')).entity.title, 'R&D 과정');
});

/* ───────── failures / cache ───────── */
test('JT-15 zero results, timeout, upstream failure, auth error, quota → fixed codes; nothing leaks', async () => {
  const zero = (await call(handler(ENV, upstream(() => reply(listXml([], 0)))), Q('query=' + enc('없는과정')))).json();
  assert.deepEqual(zero.items, []); assert.equal(zero.total, 0); assert.equal(zero.hasMore, false);
  const t = await call(handler(ENV, upstream(() => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }); })), Q());
  assert.equal(t.statusCode, 504); assert.equal(t.json().code, 'TIMEOUT');
  for (const [text, st, want, code] of [
    [goError('인증키가 존재하지 않습니다'), 200, 502, 'UPSTREAM_ERROR'], [goError('신청하신 OpenApi 서비스가 존재하지 않습니다'), 200, 502, 'UPSTREAM_ERROR'],
    ['{\n  "error" : "인증키가 존재하지 않습니다"\n}', 200, 502, 'UPSTREAM_ERROR'], [goError('일일 호출 건수를 초과하였습니다'), 200, 503, 'UPSTREAM_LIMIT'],
    ['<html></html>', 500, 502, 'UPSTREAM_ERROR'], ['<html>ok</html>', 200, 502, 'UPSTREAM_ERROR'], ['', 200, 502, 'UPSTREAM_ERROR'], ['<HRDNet>', 404, 502, 'UPSTREAM_ERROR']]) {
    const r = await call(handler(ENV, upstream(() => reply(text, { status: st }))), Q());
    assert.equal(r.statusCode, want, text.slice(0, 40)); assert.equal(r.json().code, code);
    assert.doesNotMatch(r.body, /인증키|OpenApi|초과|html/);
  }
  const net = await call(handler(ENV, upstream(() => { throw new TypeError('fetch failed'); })), Q());
  assert.equal(net.statusCode, 502);
});

test('JT-16 cache: identical searches share one upstream call (list 6 h / detail 24 h TTL); failures never cached; hashed key', async () => {
  let n = 0; const ttls = [], keys = [];
  const cache = memoryCache(); const set = cache.set.bind(cache); cache.set = (k, v, t) => { ttls.push(t); keys.push(k); return set(k, v, t); };
  const h = handler(ENV, upstream(u => (++n === 1 ? reply('', { status: 500 }) : reply(u.pathname.endsWith('310L02.do') ? detailXml() : listXml([row()])))), { cache });
  assert.equal((await call(h, Q('query=' + enc('웹')))).statusCode, 502);
  const a = (await call(h, Q('query=' + enc('웹')))).json(), b = (await call(h, Q('query=' + enc('웹')))).json();
  assert.equal(a.cached, false); assert.equal(b.cached, true); assert.equal(n, 2);
  await call(h, Q('query=' + enc('웹') + '&region=' + enc('서울')));
  assert.equal(n, 3, 'different filters → different page');
  await call(h, Q('id=AIG20230000412345_3_500020012345')); await call(h, Q('id=AIG20230000412345_3_500020012345'));
  assert.equal(n, 4);
  assert.deepEqual(ttls, [6 * 3600e3, 6 * 3600e3, 24 * 3600e3]);
  assert.ok(keys.every(k => /^livon:data:v1:kr-job-training:[0-9a-f]{40}$/.test(k)), 'no plaintext query in cache keys');
  const conc = upstream(() => new Promise(r => setTimeout(() => r(reply(listXml([row()]))), 20)));
  const hc = handler(ENV, conc);
  await Promise.all([call(hc, Q('query=x1')), call(hc, Q('query=x1')), call(hc, Q('query=x1'))]);
  assert.equal(conc.calls.length, 1, 'in-flight requests share one upstream call');
});

test('JT-17 detail route: 과정/기관정보 with the three official ids; PII, facility lists and 등급 dropped', async () => {
  const up = defaultUp();
  const r = (await call(handler(ENV, up), Q('id=AIG20230000412345_3_500020012345'))).json();
  const u = up.calls[0].url;
  assert.equal(u.origin + u.pathname, jt.UPSTREAM_DETAIL);
  assert.deepEqual([...u.searchParams.keys()], ['authKey', 'returnType', 'outType', 'srchTrprId', 'srchTrprDegr', 'srchTorgId']);
  assert.deepEqual([u.searchParams.get('srchTrprId'), u.searchParams.get('srchTrprDegr'), u.searchParams.get('srchTorgId'), u.searchParams.get('outType')], ['AIG20230000412345', '3', '500020012345', '2']);
  assert.equal(r.items.length, 1); const d = r.items[0];
  assert.equal(d.providerId, 'AIG20230000412345_3_500020012345'); assert.equal(d.organizer, '[QA 픽스처] 가나다직업전문학교');
  assert.equal(d.location.address, '서울특별시 강남구 테헤란로 1 5층'); assert.equal(d.contact.website, 'https://gnd.example.ac.kr/');
  assert.equal(d.metadata.totalHours, 640); assert.equal(d.metadata.trainingField, '정보통신');
  assert.doesNotMatch(r.body || JSON.stringify(r), /홍길동|hong@|010-1234|A등급|강의실/);
  const empty = (await call(handler(ENV, upstream(() => reply('<HRDNet></HRDNet>'))), Q('id=A1_1_B1'))).json();
  assert.deepEqual(empty.items, []);
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
  const saves = new Map(), todos = [];
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, x), removeSave: id => saves.delete(id), _saves: saves };
  ctx.LivonMyLife = { api: { saveTodo: t => { const dup = todos.find(x => x.title === t.title && !x.done); if (dup) return { status: 'duplicate', dup }; todos.push(t); return { status: 'ok', item: t }; } }, _todos: todos };
  for (const f of ['data/livon-data-config.js', 'data/livon-data-schema.js', 'data/livon-data-core.js', 'data/livon-data-providers.js', 'explore-search.js']) vm.runInContext(read(f), ctx);
  return ctx;
}
async function loaded({ env = ENV, rows = [row()], lifelongRows = null } = {}) {
  const up = upstream(u => {
    if (u.origin === 'https://api.data.go.kr') return reply(JSON.stringify({ response: { header: { resultCode: '00' }, body: { items: lifelongRows || [], totalCount: (lifelongRows || []).length } } }));
    if (u.origin === 'https://www.bizinfo.go.kr') return reply(JSON.stringify({ jsonArray: { item: [] } }));
    return reply(u.pathname.endsWith('310L02.do') ? detailXml() : listXml(rows));
  });
  const h = handler(env, up);
  const ctx = browser((url, init = {}) => call(h, url, init.method || 'GET', init));
  await new Promise(r => setTimeout(r, 30));
  await ctx.LivonData.repository.refresh({ force: true });
  return { ctx, D: ctx.LivonData, up };
}
const jobCalls = up => up.calls.filter(c => c.url.origin === 'https://www.work24.go.kr');

test('JT-30 existing providers regression: status lists all 8 providers; job params are job-only; others unchanged', async () => {
  const env = { ...ENV, KAKAO_REST_API_KEY: 'kakao-key-123', TOURAPI_SERVICE_KEY: 'tour-key-12345', PUBLIC_DATA_SERVICE_KEY: 'pd-key-123456', BIZINFO_API_KEY: 'biz-key-123456', YOUTHCENTER_API_KEY: 'youth-key-1234' };
  const h = handler(env, upstream(() => reply('{}')));
  const st = (await call(h, '/api/livon/data?action=status')).json().providers;
  assert.deepEqual(Object.keys(st), ['kr-youth-policy', 'kr-business-support', 'kr-business-event', 'kr-kakao-place', 'kr-tourapi', 'kr-lifelong-class', 'kr-public-tax-expert', 'kr-job-training']);
  assert.equal(st['kr-job-training'].mode, 'search'); assert.equal(st['kr-lifelong-class'].mode, undefined);
  for (const [p, q] of [['kr-kakao-place', 'org=a&query=a'], ['kr-tourapi', 'period=30&query=a'], ['kr-lifelong-class', 'org=a'], ['kr-public-tax-expert', 'period=30'], ['kr-youth-policy', 'org=a']]) {
    assert.equal((await call(h, '/api/livon/data?provider=' + p + '&' + q)).statusCode, 400, p);
  }
  assert.deepEqual(PROVIDERS['kr-job-training'].params, ['page', 'limit', 'query', 'org', 'region', 'method', 'type', 'period', 'id']);
  assert.equal((await call(h, '/api/livon/data?provider=kr-job-training&view=images')).statusCode, 400);
  assert.equal((await call(h, '/api/livon/data?provider=kr-job-training&sort=distance')).statusCode, 400);
});

