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

test('JT-3 secret non-exposure: key never in responses/logs/browser files; upstream error bodies discarded', async () => {
  const logs = [];
  for (const p of [() => { throw new Error('x ' + KEY); }, () => reply(goError('인증키가 존재하지 않습니다 ' + KEY)), () => reply('<html>' + KEY, { status: 500 }), () => reply(listXml([row()]))]) {
    const r = await call(handler(ENV, upstream(p), { log: (...a) => logs.push(a.join(' ')) }), Q());
    assert.doesNotMatch(r.body, /DO\/NOT|DO%2FNOT|authKey|인증키가|GO24|work24\.go\.kr\/cm\/openApi/);
  }
  assert.ok(logs.every(l => !/DO\/NOT|authKey/.test(l)));
  for (const f of ['data/livon-data-core.js', 'data/livon-data-providers.js', 'data/livon-data-schema.js', 'data/livon-data-config.js', 'explore-page.js', 'life-hub.js', 'today-feed.js', 'ai-page.js', 'index.html']) {
    assert.doesNotMatch(read(f), /WORK24_TRAINING_API_KEY|authKey|callOpenApiSvcInfo/, f);
  }
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

test('JT-9 dates, status and region: official 훈련시작·종료일 only; status label names its basis; region from the address', async () => {
  const e = E();
  assert.equal(e.schedule.startAt.slice(0, 10) <= day(14), true); assert.ok(e.schedule.endAt);
  assert.equal(E({ traStartDate: '20261103', traEndDate: '2026.12.01' }).schedule.startAt, '2026-11-02T15:00:00.000Z');
  assert.equal(E({ traStartDate: '상시' }).schedule, null);
  assert.equal(e.registrationStart, null); assert.equal(e.registrationEnd, null, 'no 모집/신청 fields exist');
  const { D } = await loaded();
  assert.equal(D.jobs.status(E()), '훈련 시작 전');
  assert.equal(D.jobs.status(E({ traStartDate: day(-5), traEndDate: day(20) })), '훈련 중');
  assert.equal(D.jobs.status(E({ traStartDate: day(-50), traEndDate: day(-1) })), '훈련 종료');
  assert.equal(D.jobs.status(E({ traStartDate: '' })), '');
  assert.equal(D.registrationLabel(E()), '', 'never 접수 중 / 모집중');
  assert.ok(D.ui.jobFacts(E()).some(r => r[0] === '훈련 상태' && r[1] === '훈련 시작 전 (훈련 시작·종료일 기준)'));
  assert.equal(E().location.region, '서울'); assert.equal(E({ address: '경상남도 창원시 1' }).location.region, '경남');
  assert.equal(E({ address: '어딘가 1' }).location.region, null, 'unknown spelling → no region guessed');
  assert.equal(E({ address: '' }).location, null);
});

test('JT-10 training mode: documented 훈련구분 codes only; unknown code → nothing shown', () => {
  assert.deepEqual(['M1001', 'M1005', 'M1010', 'M1014', 'X', ''].map(c => E({ trainTargetCd: c }).format), ['일반과정', '인터넷과정', '혼합과정(BL)', '스마트혼합훈련', null, null]);
  assert.deepEqual(['M1001', 'M1005', 'M1010'].map(c => E({ trainTargetCd: c }).metadata.methodMode), ['offline', 'online', 'both']);
  assert.deepEqual(['1', '2', '3', '9', ''].map(w => E({ wkendSe: w }).metadata.weekend || ''), ['주말', '주말·주중 혼합', '주중', '', '']);
});

test('JT-11 cost semantics: official names kept; "0" stays 0원 (never 무료); non-numeric dropped; no 국비/자비 inference', async () => {
  const z = E({ courseMan: '0', realMan: '0' });
  assert.equal(z.metadata.courseFee, 0); assert.equal(z.pricing, null);
  assert.equal(E({ courseMan: '문의' }).metadata.courseFee, undefined, 'non-numeric → not kept (empty scalars are dropped)');
  const { D } = await loaded();
  const facts = D.ui.jobFacts(z).map(r => r.join(' '));
  assert.ok(facts.includes('수강비 0원')); assert.ok(facts.includes('실제 훈련비 0원'));
  const all = facts.join(' | ');
  assert.doesNotMatch(all, /무료|국비|자비|전액 지원|지원 대상|부담 없음/);
  const d = jt.toDetailEntity(jt.parseDetail(detailXml()), jt.parseId('AIG20230000412345_3_500020012345'), 'x');
  assert.equal(d.metadata.govSupport, 1500000); assert.equal(d.metadata.selfPay, 0); assert.equal(d.metadata.detailRealFee, 1800000);
  const dv = S().validateEntity(d).entity, lv = E();
  const merged = Object.assign({}, lv, { organizer: dv.organizer, metadata: Object.assign({}, lv.metadata, dv.metadata) });   /* what LivonData.jobs.detail() does */
  const mf = D.ui.jobFacts(merged).map(r => r.join(' '));
  assert.ok(mf.includes('정부지원금 1,500,000원') && mf.includes('본인부담액 0원') && mf.includes('총 훈련시간 640시간') && mf.includes('총 훈련일수 80일'));
  const ex = read('explore-page.js');
  assert.match(ex, /개인별 실제 부담액·지원 여부는 LIVON이 계산하지 않으니/);
});

test('JT-12 application semantics + CTA: no 모집/신청 data → no "신청" wording; titleLink → "고용24 과정 상세 보기"', async () => {
  const { D } = await loaded();
  const e = E();
  assert.deepEqual([D.action(e).label, D.action(e).url], ['고용24 과정 상세 보기', row().titleLink]);
  assert.equal(E({ titleLink: '' }).source.sourceUrl, null); assert.equal(D.action(E({ titleLink: '' })), null, 'no URL → no button');
  assert.equal(D.action(E({ traStartDate: day(-60), traEndDate: day(-2) })).label, '고용24 과정 상세 보기', 'an ended course keeps only the detail link');
  const ex = read('explore-page.js'), jobPart = ex.slice(ex.indexOf('var jobRun = 0'), ex.indexOf('function navigateResults'));
  assert.doesNotMatch(jobPart, /신청하기|바로 신청|모집중|모집 중|마감 임박|잔여|취업 보장|예상 연봉|평점|후기|인기/);
  assert.match(jobPart, /모집·신청 기간은 이 데이터에 없습니다/);
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

test('JT-18 no key (browser): provider planned, no links, no upstream call, LIVON unaffected (no sample courses)', async () => {
  const { D, up } = await loaded({ env: {} });
  assert.equal(D.jobs.configured(), false); assert.equal(D.registry.get('kr-job-training').enabled, false);
  await assert.rejects(D.jobs.search({ query: '웹' }), e => e.code === 'NOT_CONFIGURED');
  for (const t of LIFE.topics) assert.equal(D.jobs.configured() && D.jobs.planForTopic(t), false);
  assert.equal(jobCalls(up).length, 0); assert.ok(D.repository.size() > 30, 'curated LIVON data still loads');
  assert.equal(D.repository.list({ includeExpired: true }).filter(e => e.provider === 'kr-job-training').length, 0);
});

test('JT-19 on demand only: configured provider is never bulk-loaded into the store (Home/Life/Today stay unchanged)', async () => {
  const { D, up } = await loaded();
  assert.equal(D.jobs.configured(), true);
  assert.equal(jobCalls(up).length, 0, 'no upstream call until a user searches');
  assert.equal(D.repository.list({ includeExpired: true }).filter(e => e.provider === 'kr-job-training').length, 0);
  assert.equal(D.registry.runnable().some(p => p.id === 'kr-job-training'), false);
});

test('JT-20 Explore search + filters: documented query string only; results are session entities with facts', async () => {
  const { D, up } = await loaded({ rows: [row(), row({ trprDegr: '4', title: '[QA 픽스처] 데이터 분석 과정', traStartDate: day(40), traEndDate: day(160), trainTargetCd: 'M1005', address: '' })] });
  const r = await D.jobs.search({ query: '웹 <개발>', region: '서울', method: 'online', type: 'C0104', period: 30 });
  assert.equal(r.items.length, 2); assert.equal(r.total, 2);
  const s = jobCalls(up).at(-1).url.searchParams;
  assert.equal(s.get('srchTraProcessNm'), '웹 개발'); assert.equal(s.get('srchTraArea1'), '11'); assert.equal(s.get('srchTraGbn'), 'M1005'); assert.equal(s.get('crseTracseSe'), 'C0104');
  await D.jobs.search({ query: '가나다', field: 'org', region: '제주', method: 'bogus', type: 'X', period: 999 });
  const t = jobCalls(up).at(-1).url.searchParams;
  assert.equal(t.get('srchTraOrganNm'), '가나다'); assert.equal(t.get('srchTraArea1'), null, 'regions outside the Explore list are not sent'); assert.equal(t.get('srchTraGbn'), null); assert.equal(t.get('crseTracseSe'), null);
  assert.equal(t.get('srchTraEndDt'), day(90).replace(/-/g, ''), 'invalid period → default 90 days');
  const e = r.items[0];
  assert.equal(D.repository.getById(e.id).title, e.title, 'kept for this page session (save / detail / AI)');
  assert.equal(D.searchEntries().some(x => x.entityId === e.id), false, 'not injected into the general Explore index');
  const ex = read('explore-page.js');
  assert.match(ex, /state\.type === "class" && !!JBC\(\)/); assert.match(ex, /jobs=1/);
  for (const k of ['jf', 'jt', 'jm', 'jp']) assert.ok(ex.includes('data-lv-ex-job=\\"' + k + '\\"'), k);
  assert.match(ex, /평생학습 강좌와는 다른 공식 직업훈련 데이터/);
});

test('JT-21 detail (browser): 과정/기관정보 merged into the opened course; list dates and link kept; hidden fields absent', async () => {
  const { D, up } = await loaded();
  const [e] = (await D.jobs.search({ query: '웹' })).items;
  const m = await D.jobs.detail(e.id);
  assert.equal(m.organizer, '[QA 픽스처] 가나다직업전문학교'); assert.equal(m.schedule.startAt, e.schedule.startAt); assert.equal(m.source.sourceUrl, e.source.sourceUrl);
  assert.equal(m.metadata.govSupport, 1500000); assert.equal(D.repository.getById(e.id).organizer, '[QA 픽스처] 가나다직업전문학교');
  const facts = [...D.ui.jobFacts(m).map(r => r[0])];
  assert.deepEqual(facts, ['훈련기관', '훈련기간', '훈련 상태', '총 훈련시간', '총 훈련일수', '주말/주중', '훈련구분', '훈련대상', '주소', '정원', 'NCS', '자격증', '수강비', '실제 훈련비', '정부지원금', '본인부담액', '문의']);
  const bare = [...D.ui.jobFacts(E({ wkendSe: '9', certificate: '', yardMan: '', telNo: '', courseMan: '', realMan: '' })).map(r => r[0])];
  assert.deepEqual(bare, ['훈련기간', '훈련 상태', '훈련구분', '훈련대상', '주소'], 'missing fields are hidden, never "정보 없음"');
  await assert.rejects(D.jobs.detail('kr-job-training:program:nope'), e2 => e2.code === 'BAD_REQUEST');
  assert.equal(jobCalls(up).filter(c => c.url.pathname.endsWith('310L02.do')).length, 1, 'detail only when a user opens a course');
});

test('JT-22 Life Stage: search link only on existing 취업·이직·재취업·직무 교육 topics; never by age; no auto courses', async () => {
  const { D } = await loaded();
  const ids = LIFE.topics.map(t => t.id);
  const linked = LIFE.topics.filter(t => D.jobs.planForTopic(t)).map(t => t.id);
  assert.deepEqual(linked, ['20s.first-job', '30s.job-change-30', '40s.career-shift-40', '50s.second-career-50', '20s.course-choice', '40s.retraining-choice', '50s.work-options']);
  linked.forEach(id => assert.ok(ids.includes(id), id + ' exists in the taxonomy'));
  assert.equal(D.jobs.planForTopic(LIFE.topics.find(t => t.id === '20s.first-job')).href, '#ex-results?type=class&jobs=1');
  for (const t of LIFE.topics.filter(x => ['건강', '여행', '창업', '연금', '자녀교육', '돌봄'].includes(x.category))) assert.equal(D.jobs.planForTopic(t), null, t.id);
  for (const t of LIFE.topics) assert.equal(D.forTopic(t, 'program').filter(e => e.provider === 'kr-job-training').length, 0);
  assert.match(read('life-hub.js'), /J\.configured\(\) && J\.planForTopic/);
});

test('JT-23 Today: link only on the explicit 취업 support content; nothing forced elsewhere', async () => {
  const { ctx, D } = await loaded();
  const contents = ctx.LivonTodayData.contents;
  assert.deepEqual([...contents.filter(c => D.jobs.planForContent(c)).map(c => c.id)], ['td-youth-policy']);
  assert.equal(D.jobs.planForContent({ id: 'learn-kmooc' }), null); assert.equal(D.jobs.planForContent({ id: 'td-startup-first-weeks' }), null);
  assert.match(read('today-feed.js'), /J\.configured\(\) && J\.planForContent/);
});

test('JT-24 Home unchanged: no job-training code path, no age-based course recommendation', async () => {
  const { D } = await loaded();
  await D.jobs.search({ query: '웹' });
  const r = D.forHome({ stage: '20', interests: ['취업', '커리어', '자격증', '교육'] });
  assert.equal(r.programs.filter(e => e.provider === 'kr-job-training').length, 0);
  assert.doesNotMatch(read('home-page.js'), /kr-job-training|LivonData\.jobs|jobs\./);
});

test('JT-25 My Life save: explicit action; snapshot holds real course facts only (official names), survives provider loss', async () => {
  const { ctx, D } = await loaded();
  const [e] = (await D.jobs.search({ query: '웹' })).items;
  await D.jobs.detail(e.id);
  assert.equal(ctx.LivonPlatform._saves.size, 0, 'nothing saved automatically');
  assert.equal(D.save(e.id), 'saved');
  const rec = ctx.LivonPlatform._saves.get('ext:' + e.id), s = rec.data.snapshot;
  assert.equal(rec.type, 'class'); assert.equal(rec.source, '고용24 국민내일배움카드 훈련과정');
  assert.equal(s.externalUrl, row().titleLink); assert.equal(s.actionLabel, '고용24 과정 상세 보기');
  assert.equal(s.agency, '[QA 픽스처] 가나다직업전문학교'); assert.ok(s.startAt && s.endAt); assert.equal(s.registrationPeriod, null);
  assert.deepEqual([s.trainingCourse.trprId, s.trainingCourse.trprDegr, s.trainingCourse.courseFee, s.trainingCourse.realFee, s.trainingCourse.govSupport, s.trainingCourse.selfPay, s.trainingCourse.totalHours, s.trainingCourse.statusBasis],
    ['AIG20230000412345', '3', 1800000, 1800000, 1500000, 0, 640, '훈련 시작·종료일']);
  assert.equal(s.trainingCourse.sourceUpdatedAt, null, 'no source update date → none claimed'); assert.ok(s.trainingCourse.fetchedAt);
  assert.doesNotMatch(JSON.stringify(rec), /취업률|만족도|eiEmpl|stdgScor|regCourseMan|홍길동|평점/);
  assert.equal(D.save(e.id), 'removed');
});

test('JT-26 calendar/task: only on explicit call; 훈련 시작일 only (no 접수 마감 exists); duplicates prevented', async () => {
  const { ctx, D } = await loaded({ rows: [row(), row({ trprDegr: '9', traStartDate: day(-3), traEndDate: day(30) })] });
  const [future, started] = (await D.jobs.search({ query: '웹' })).items;
  assert.equal(ctx.LivonMyLife._todos.length, 0, 'nothing added automatically');
  const r1 = D.addToMyLife(future.id, 'start');
  assert.equal(r1.status, 'ok'); assert.equal(r1.item.title, '[훈련 시작] [QA 픽스처] 웹 개발자 양성과정'); assert.equal(r1.item.due, day(14));
  assert.equal(r1.item.sourceHref, row().titleLink); assert.equal(r1.item.sourceId, 'ext:' + future.id);
  assert.equal(D.addToMyLife(future.id, 'start').status, 'duplicate');
  assert.equal(D.addToMyLife(future.id, 'deadline').status, 'no-date', 'the API has no 접수 마감일');
  assert.equal(ctx.LivonMyLife._todos.length, 1);
  const ex = read('explore-page.js');
  assert.match(ex, /future \? "<button[^;]+data-kind=\\"start\\">훈련 시작일을 할 일에 추가/);
  void started;
});

test('JT-27 AI: kind/title/href only, https only, from courses the user looked up; instructions forbid 취업·합격·지원금 inference', async () => {
  const { D } = await loaded({ rows: [row(), row({ trprDegr: '5', title: '[QA 픽스처] 웹 퍼블리셔 과정', titleLink: 'http://www.work24.go.kr/x' })] });
  assert.equal(D.jobs.references(['웹']).length, 0, 'nothing before a search');
  await D.jobs.search({ query: '웹' });
  const refs = D.jobs.references(['웹', '개발']);
  assert.equal(refs.length, 1, 'http link skipped');
  assert.deepEqual([...Object.keys(refs[0])], ['kind', 'title', 'href']);
  assert.equal(refs[0].kind, '직업훈련 과정(고용24)'); assert.match(refs[0].href, /^https:\/\/www\.work24\.go\.kr\//);
  assert.doesNotMatch(JSON.stringify(refs), /원|1800000|취업률|만족도|국민내일배움카드\(일반\)/);
  assert.equal(D.jobs.references(['요가']).length, 0);
  assert.match(INSTRUCTIONS, /취업 가능성, 합격·선발 가능성, 지원금·훈련비 지원 수령 가능성, 취업률·만족도를 추론하거나 말하지 않고/);
  const ai = read('ai-page.js');
  assert.match(ai, /J\.references\(/); assert.match(ai, /concat\(jobRefs\)/);
});

test('JT-28 dedupe: same official id → one; never merged with 평생학습강좌 or partner programs, even with identical title/org/day', async () => {
  const { D } = await loaded();
  const a = E(), b = E({ courseMan: '1' });
  assert.equal(D.dedupe([a, b]).length, 1);
  const life = S().validateEntity(lc.toEntity({ lctreNm: '[QA 픽스처] 웹 개발자 양성과정', operInstitutionNm: '[QA 픽스처] 가나다직업전문학교', edcStartDay: day(14), edcEndDay: day(120), edcRdnmadr: '서울특별시 강남구 테헤란로 1', homepageUrl: row().titleLink }, 'x')).entity;
  const aOrg = Object.assign({}, a, { organizer: '[QA 픽스처] 가나다직업전문학교' });
  const out = D.dedupe([life, aOrg]);
  assert.equal(out.length, 2, 'no cross-provider merge without a shared official id');
  assert.ok(out.every(x => !x.alsoFrom.length));
  const partner = Object.assign({}, aOrg, { id: 'partner-programs:program:P1', provider: 'partner-programs', providerId: 'P1' });
  assert.equal(D.dedupe([aOrg, partner]).length, 2);
});

test('JT-29 lifelong coexistence: both providers configured, separate data/meaning, lifelong unchanged', async () => {
  const lrow = { lctreNm: '[QA 픽스처] 성인 요가', operInstitutionNm: '거제시청소년수련관', edcStartDay: day(10), edcEndDay: day(70), edcRdnmadr: '경상남도 거제시 1', homepageUrl: 'https://x.example.kr/' };
  const { D } = await loaded({ env: { ...ENV, PUBLIC_DATA_SERVICE_KEY: 'pd-test-key-123456' }, lifelongRows: [lrow] });
  assert.equal(D.classes.configured(), true); assert.equal(D.jobs.configured(), true);
  const life = D.repository.list({ includeExpired: true }).filter(e => e.provider === 'kr-lifelong-class');
  assert.equal(life.length, 1); assert.equal(D.action(life[0]).label, '공식 안내 보기');
  const [j] = (await D.jobs.search({ query: '웹' })).items;
  assert.equal(D.action(j).label, '고용24 과정 상세 보기');
  assert.notEqual(life[0].source.providerName, j.source.providerName);
  assert.equal(D.repository.list({ includeExpired: true }).filter(e => e.provider === 'kr-job-training').length, 0, 'job courses never join the lifelong store');
  const docs = root('docs/livon/real-data-providers.md');
  assert.match(docs, /kr-job-training/); assert.match(docs, /callOpenApiSvcInfo310L01/); assert.match(docs, /15109032/);
});

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

test('JT-31 no forbidden claims anywhere in LIVON copy for job training', () => {
  const files = ['explore-page.js', 'data/livon-data-providers.js', 'data/livon-data-core.js', 'life-hub.js', 'today-feed.js'].map(read).join('\n');
  const part = files.split('\n').filter(l => /job|Job|직업훈련|훈련/.test(l)).join('\n');
  assert.doesNotMatch(part, /취업 보장|예상 연봉|합격률|수강 만족도|평점|후기|인기 과정|추천 순위|마감 임박|잔여석|실시간 좌석|신청하기/);
  const src = root('server/livon/data/providers/job-training.mjs');
  assert.doesNotMatch(src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''), /eiEmpl|stdgScor|regCourseMan|torgParGrad|trprChap|sortCol', '3|sortCol', '5/);
});
