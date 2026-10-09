// 한국관광공사 TourAPI (kr-tourapi): adapter, route (GET + POST nearby), privacy, normalization, images, LIVON integration.
// No real key is used. Fixtures ([QA 픽스처]) use only fields listed in the 공공데이터포털 명세 (KorService2, 1.0.0).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as tour from '../../server/livon/data/providers/tourapi.mjs';
import * as kakao from '../../server/livon/data/providers/kakao-local.mjs';
import { createDataHandler, PROVIDERS } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const root = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const KEY = 'tour-test-key+DO/NOT=LEAK-5555';
const ENV = { TOURAPI_SERVICE_KEY: KEY };
const enc = encodeURIComponent;
const Q = s => '/api/livon/data?provider=kr-tourapi&' + s;

const item = (o = {}) => Object.assign({
  contentid: '126508', contenttypeid: '12', title: '[QA 픽스처] 경복궁', addr1: '서울특별시 종로구 사직로 161', addr2: '(세종로)', zipcode: '03045',
  mapx: '126.9769930325', mapy: '37.5788222356', mlevel: '6', tel: '02-3700-3900',
  firstimage: 'http://tong.visitkorea.or.kr/cms/resource/33/2678633_image2_1.jpg', firstimage2: 'http://tong.visitkorea.or.kr/cms/resource/33/2678633_image3_1.jpg',
  cpyrhtDivCd: 'Type3', lDongRegnCd: '11', lDongSignguCd: '110', lclsSystm1: 'HS', lclsSystm2: 'HS01', lclsSystm3: 'HS010100',
  createdtime: '20031105090000', modifiedtime: '20250909101010'
}, o);
const ok = (items, total = items.length, extra = {}) => JSON.stringify({ response: { header: { resultCode: '0000', resultMsg: 'OK' }, body: Object.assign({ items: items.length ? { item: items } : '', numOfRows: 20, pageNo: 1, totalCount: total }, extra) } });
const gwError = (name, code) => `<OpenAPI_ServiceResponse><cmmMsgHeader><errMsg>SERVICE ERROR</errMsg><returnAuthMsg>${name}</returnAuthMsg><returnReasonCode>${code}</returnReasonCode></cmmMsgHeader></OpenAPI_ServiceResponse>`;

function upstream(handler) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    const u = new URL(url);
    calls.push({ url: u, init });
    if (u.origin !== 'https://apis.data.go.kr' && u.origin !== 'https://dapi.kakao.com') throw new Error('unexpected host');
    return handler(u, init);
  };
  return { fetcher, calls };
}
const reply = (text, { status = 200 } = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => 'application/json' }, text: async () => text });
function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } }; r.json = () => JSON.parse(r.body); return r; }
async function call(h, url, method = 'GET', init = {}) { const r = res(); await h({ method, url, headers: init.headers || {}, body: init.body }, r); return r; }
const post = (h, body, headers = { 'content-type': 'application/json' }) => call(h, '/api/livon/data', 'POST', { headers, body: JSON.stringify(body) });
const handler = (env, up, extra = {}) => createDataHandler({ env, fetcher: up.fetcher, cache: extra.cache || memoryCache(), log: extra.log || (() => {}) });
const op = c => c.url.pathname.split('/').pop();

/* ───────── server ───────── */
test('1 official contract: KorService2 base, current operation names, required params, decoded key sent once, no deprecated params', async () => {
  assert.equal(tour.BASE, 'https://apis.data.go.kr/B551011/KorService2');
  assert.deepEqual(Object.values(tour.OPS), ['searchKeyword2', 'areaBasedList2', 'locationBasedList2', 'detailCommon2', 'detailIntro2', 'detailImage2']);
  assert.deepEqual(Object.keys(tour.CONTENT_TYPES), ['12', '14', '15', '25', '28', '32', '38', '39']);
  const up = upstream(() => reply(ok([item()])));
  await call(handler({ TOURAPI_SERVICE_KEY: enc(KEY) }, up), Q('query=' + enc('경복궁')));
  const u = up.calls[0].url;
  assert.equal(u.origin + u.pathname, tour.BASE + '/searchKeyword2');
  assert.equal(u.searchParams.get('serviceKey'), KEY, 'an "Encoding" key is decoded, then encoded exactly once');
  assert.equal(u.searchParams.get('MobileOS'), 'WEB'); assert.equal(u.searchParams.get('MobileApp'), 'LIVON'); assert.equal(u.searchParams.get('_type'), 'json');
  for (const dep of ['areaCode', 'sigunguCode', 'cat1', 'cat2', 'cat3']) assert.equal(u.searchParams.has(dep), false, dep + ' is 미사용항목(삭제예정)');
  assert.match(root('.env.example'), /\nTOURAPI_SERVICE_KEY=\n/);
  for (const f of ['data/livon-data-config.js', 'data/livon-data-core.js', 'data/livon-data-providers.js', 'data/livon-data-schema.js', 'explore-page.js', 'life-hub.js', 'today-feed.js', 'index.html']) {
    assert.doesNotMatch(read(f), /TOURAPI_SERVICE_KEY|serviceKey|apis\.data\.go\.kr/, f + ' never touches the key or the endpoint');
  }
});

test('2 no key: configured=false, NOT_CONFIGURED, zero upstream calls; bad params still 400', async () => {
  const up = upstream(() => reply(ok([item()])));
  const h = handler({}, up);
  assert.deepEqual((await call(h, '/api/livon/data?action=status')).json().providers['kr-tourapi'], { configured: false, entityTypes: ['place'], mode: 'search' });
  assert.equal((await call(h, Q('query=a'))).json().code, 'NOT_CONFIGURED');
  assert.equal((await call(h, Q('id=126508'))).statusCode, 503);
  assert.equal((await post(h, { provider: 'kr-tourapi', action: 'nearby', lat: 37.5, lng: 127 })).statusCode, 503);
  assert.equal((await call(h, Q('id=abc'))).statusCode, 400);
  assert.equal(up.calls.length, 0);
});

test('3 key non-exposure: never in responses or logs on any path (incl. gateway error bodies)', async () => {
  const logs = [];
  const paths = [() => { throw new Error('net ' + KEY); }, () => reply(gwError('SERVICE_KEY_IS_NOT_REGISTERED_ERROR', '30') + KEY), () => reply('<html>' + KEY, { status: 500 }), () => reply(ok([item()]))];
  for (const p of paths) {
    const h = handler(ENV, upstream(p), { log: (...a) => logs.push(a.join(' ')) });
    for (const r of [await call(h, Q('query=a')), await post(h, { provider: 'kr-tourapi', action: 'nearby', lat: 37.5665351, lng: 126.9779692 })]) {
      assert.doesNotMatch(r.body, /DO\/NOT|DO%2FNOT|serviceKey|NOT_REGISTERED|37\.5665|126\.9779/);
    }
  }
  assert.ok(logs.every(l => !/DO\/NOT|serviceKey|37\.56|126\.97/.test(l)));
});

test('4 keyword: searchKeyword2 with keyword; region → 법정동 시도코드; type filtered after (no type param in the 명세)', async () => {
  const up = upstream(() => reply(ok([item(), item({ contentid: '2', contenttypeid: '14', title: '[QA 픽스처] 국립민속박물관' }), item({ contentid: '3', contenttypeid: '15', title: '[QA 픽스처] 궁중문화축전' })])));
  const h = handler(ENV, up);
  const r = (await call(h, Q('query=' + enc('  경복궁 ') + '&region=' + enc('서울')))).json();
  const u = up.calls[0].url;
  assert.equal(u.searchParams.get('keyword'), '경복궁'); assert.equal(u.searchParams.get('lDongRegnCd'), '11');
  assert.deepEqual(r.items.map(e => e.providerId), ['126508', '2'], '행사(15) is not a place');
  const typed = (await call(h, Q('query=a&type=14'))).json();
  assert.deepEqual(typed.items.map(e => e.providerId), ['2']); assert.equal(up.calls[1].url.searchParams.has('contentTypeId'), false);
  for (const q of ['query=' + 'a'.repeat(51), 'query=' + enc('<b>'), 'query=a&type=15', 'query=a&type=99', 'query=a&region=' + enc('서울시'), 'query=a&area=1', 'query=a&sigungu=110', 'query=a&url=x', 'query=a&category=CT1']) {
    assert.equal((await call(h, Q(q))).statusCode, 400, q);
  }
});

test('5 area: areaBasedList2 with lDongRegnCd / lDongSignguCd and contentTypeId', async () => {
  const up = upstream(() => reply(ok([item()])));
  const h = handler(ENV, up);
  assert.equal((await call(h, Q('area=11&sigungu=110&type=12'))).statusCode, 200);
  const u = up.calls[0].url;
  assert.equal(op(up.calls[0]), 'areaBasedList2');
  assert.deepEqual(['lDongRegnCd', 'lDongSignguCd', 'contentTypeId'].map(k => u.searchParams.get(k)), ['11', '110', '12']);
  assert.equal((await call(h, Q('region=' + enc('부산')))).statusCode, 200);
  assert.equal(up.calls[1].url.searchParams.get('lDongRegnCd'), '26');
  assert.equal((await call(h, Q('region=' + enc('서울') + '&area=26'))).statusCode, 400, 'conflicting region/area');
});

test('6 location: POST only; mapX = 경도, mapY = 위도, rounded ≈100 m; radius ≤ 20000; GET coordinates rejected', async () => {
  const up = upstream(() => reply(ok([item({ dist: '432.19' })])));
  const h = handler(ENV, up);
  const r = await post(h, { provider: 'kr-tourapi', action: 'nearby', lat: 37.5665351, lng: 126.9779692, radius: 3000, type: '14' });
  assert.equal(r.statusCode, 200);
  const u = up.calls[0].url;
  assert.equal(op(up.calls[0]), 'locationBasedList2');
  assert.equal(u.searchParams.get('mapX'), '126.978'); assert.equal(u.searchParams.get('mapY'), '37.567');
  assert.equal(u.searchParams.get('radius'), '3000'); assert.equal(u.searchParams.get('arrange'), 'E'); assert.equal(u.searchParams.get('contentTypeId'), '14');
  assert.equal(r.json().items[0].distanceMeters, 432);
  assert.equal((await call(h, Q('lat=37.5&lng=127'))).statusCode, 400, 'position never in a GET URL for TourAPI');
  const bad = [{ lat: 91, lng: 127 }, { lat: 37, lng: 181 }, { lat: 37 }, { lat: 37, lng: 127, radius: 20001 }, { lat: 37, lng: 127, radius: 250 }, { lat: '1e2', lng: 127 },
    { lat: 37, lng: 127, query: 'x' }, { lat: 37, lng: 127, evil: 1 }, { lat: 37, lng: 127, radius: [1] }];
  for (const b of bad) assert.equal((await post(h, { provider: 'kr-tourapi', action: 'nearby', ...b })).statusCode, 400, JSON.stringify(b));
  assert.equal((await post(h, { provider: 'kr-tourapi', action: 'list', lat: 37, lng: 127 })).statusCode, 400);
  assert.equal((await post(h, { provider: 'kr-tourapi', action: 'nearby', lat: 37, lng: 127 }, {})).statusCode, 405, 'non-JSON POST');
  assert.equal((await call(h, '/api/livon/data?provider=kr-tourapi', 'POST', { headers: { 'content-type': 'application/json' }, body: 'x'.repeat(3000) })).statusCode, 405, 'query string on POST');
  assert.equal((await call(h, '/api/livon/data', 'POST', { headers: { 'content-type': 'application/json' }, body: '{"provider":"kr-tourapi","action":"nearby","lat":1,"lng":1,"query":"' + 'a'.repeat(3000) + '"}' })).statusCode, 400, 'body > 2 KB');
  assert.equal((await post(h, { provider: 'kr-youth-policy', action: 'nearby', lat: 37, lng: 127 })).statusCode, 400);
});

test('7 detail: detailCommon2 then detailIntro2 (type from the record); overview/homepage sanitized; only existing rows', async () => {
  const up = upstream(u => {
    if (op({ url: u }) === 'detailCommon2') return reply(ok([item({ overview: '조선 왕조의 법궁.<br>경복궁은 <b>1395년</b>에 창건되었다.<script>alert(1)</script><img src=x onerror=alert(1)>', homepage: '<a href="https://www.royalpalace.go.kr" target="_blank" title="새창">www.royalpalace.go.kr</a>', telname: '경복궁 관리소' })]));
    return reply(ok([{ contentid: '126508', contenttypeid: '12', usetime: '09:00~18:00<br>(입장마감 17:00)', restdate: '매주 화요일', parking: '', chkpet: '불가', heritage1: '1' }]));
  });
  const h = handler(ENV, up);
  const r = (await call(h, Q('id=126508'))).json();
  assert.deepEqual(up.calls.map(op), ['detailCommon2', 'detailIntro2']);
  assert.equal(up.calls[1].url.searchParams.get('contentTypeId'), '12');
  const e = r.items[0];
  assert.equal(e.description, '조선 왕조의 법궁. / 경복궁은 1395년에 창건되었다.');
  assert.doesNotMatch(JSON.stringify(e), /alert|onerror|[<>]/);
  assert.equal(e.homepageUrl, 'https://www.royalpalace.go.kr/');
  assert.deepEqual(e.info.map(x => x.label), ['이용시간', '쉬는날', '애완동물동반가능정보', '세계문화유산유무'], 'empty 주차시설 dropped');
  assert.equal(e.info[0].value, '09:00~18:00 / (입장마감 17:00)');
  assert.equal(e.officialUrl, null, 'homepage is not labelled official');
  assert.equal(e.reservationUrl, null);
  const lodge = upstream(u => op({ url: u }) === 'detailCommon2' ? reply(ok([item({ contenttypeid: '32', homepage: 'javascript:alert(1)' })])) : reply(ok([{ checkintime: '15:00', reservationurl: '<a href="https://stay.example.kr/reserve">예약</a>', roomcount: '20' }])));
  const le = (await call(handler(ENV, lodge), Q('id=126508'))).json().items[0];
  assert.equal(le.homepageUrl, null, 'unsafe URL removed'); assert.equal(le.reservationUrl, 'https://stay.example.kr/reserve');
  assert.doesNotMatch(JSON.stringify(le), /가격|price|별점|rating|available/i);
  for (const q of ['id=12a', 'id=1234567890123', 'id=1&query=a', 'id=1&view=all', 'view=images']) assert.equal((await call(h, Q(q))).statusCode, 400, q);
});

test('8 images: detailImage2 only when asked; each photo keeps URL, thumbnail, name, 공공누리 type and credit; unlicensed or foreign-host photos dropped', async () => {
  const up = upstream(() => reply(ok([
    { contentid: '126508', originimgurl: 'http://tong.visitkorea.or.kr/cms/resource/1.jpg', smallimageurl: 'http://tong.visitkorea.or.kr/cms/resource/1s.jpg', imgname: '경복궁 근정전', serialnum: '1_1', cpyrhtDivCd: 'Type1' },
    { contentid: '126508', originimgurl: 'http://tong.visitkorea.or.kr/cms/resource/2.jpg', smallimageurl: '', imgname: '광화문', serialnum: '1_2', cpyrhtDivCd: 'Type3' },
    { contentid: '126508', originimgurl: 'http://tong.visitkorea.or.kr/cms/resource/3.jpg', imgname: '유형 없음', serialnum: '1_3', cpyrhtDivCd: '' },
    { contentid: '126508', originimgurl: 'https://evil.example/4.jpg', imgname: 'x', serialnum: '1_4', cpyrhtDivCd: 'Type1' }
  ])));
  const r = (await call(handler(ENV, up), Q('id=126508&view=images'))).json();
  assert.equal(op(up.calls[0]), 'detailImage2'); assert.equal(up.calls[0].url.searchParams.get('imageYN'), 'Y');
  assert.deepEqual(r.items, []);
  assert.deepEqual(r.photos.map(p => [p.name, p.license, p.licenseLabel]), [['경복궁 근정전', 'Type1', '공공누리 제1유형(출처표시)'], ['광화문', 'Type3', '공공누리 제3유형(출처표시·변경금지)']]);
  assert.ok(r.photos.every(p => p.credit === '사진 데이터 제공: ⓒ한국관광콘텐츠랩' && /^http:\/\/tong\.visitkorea\.or\.kr\//.test(p.url) && p.thumb));
  assert.doesNotMatch(JSON.stringify(r), /무료 이미지|free/i);
});

test('9-10 pagination + totalCount: LIVON page/limit → pageNo/numOfRows (≤20); hasMore from totalCount; bounded pages; one call per request', async () => {
  const up = upstream(u => reply(ok([item({ contentid: 'x'.length + u.searchParams.get('pageNo') })], 45)));
  const h = handler(ENV, up);
  const p1 = (await call(h, Q('query=a&page=1&limit=99'))).json();
  assert.equal(p1.limit, 20); assert.equal(p1.total, 45); assert.equal(p1.hasMore, true);
  assert.equal(up.calls[0].url.searchParams.get('numOfRows'), '20'); assert.equal(up.calls[0].url.searchParams.get('pageNo'), '1');
  assert.equal((await call(h, Q('query=a&page=3'))).json().hasMore, false, '3 × 20 ≥ 45');
  assert.equal((await call(h, Q('query=a&page=51'))).statusCode, 400);
  assert.equal(up.calls.length, 2);
});

test('11 contentTypeId mapping: places 12/14/28/32 (+38/39 technically); 15 행사 and 25 코스 are not places', () => {
  const t = type => tour.toEntity(item({ contenttypeid: type }), 'x');
  assert.deepEqual(['12', '14', '28', '32', '38', '39'].map(x => t(x).placeType), ['관광지', '문화시설', '레포츠', '숙박', '쇼핑', '음식점']);
  assert.equal(t('15'), null); assert.equal(t('25'), null); assert.equal(t('99'), null);
  assert.deepEqual([...tour.LIVON_TYPES], ['12', '14', '28', '32']);
});

test('12 coordinates: mapx → longitude, mapy → latitude; invalid pairs dropped (no geocoding, no Kakao fallback)', () => {
  const S = globalThis.LivonDataSchema;
  const e = S.validateEntity(tour.toEntity(item(), 'x')).entity;
  assert.equal(e.location.longitude, 126.9769930325); assert.equal(e.location.latitude, 37.5788222356);
  for (const [x, y] of [['0', '95'], ['200', '37'], ['', ''], ['abc', '37']]) {
    const b = tour.toEntity(item({ mapx: x, mapy: y }), 'x');
    assert.equal(b.location.latitude, null); assert.equal(b.location.longitude, null);
  }
});

test('13-14 address + phone: addr1/addr2/zipcode kept; region only 시/도 name; phone missing → no contact', () => {
  const e = tour.toEntity(item(), 'x');
  assert.equal(e.location.address, '서울특별시 종로구 사직로 161'); assert.equal(e.location.detailAddress, '(세종로)');
  assert.equal(e.metadata.zipcode, '03045'); assert.equal(e.location.region, '서울특별시');
  assert.equal(e.metadata.lDongRegnCd, '11'); assert.equal(e.metadata.lDongSignguCd, '110');
  assert.equal(tour.toEntity(item({ addr1: '주소 미상 텍스트' }), 'x').location.region, null);
  assert.equal(tour.toEntity(item({ tel: '' }), 'x').contact, null);
});

test('15 category mapping: only existing LIVON categories; codes preserved in metadata', () => {
  const c = type => tour.toEntity(item({ contenttypeid: type }), 'x').category;
  assert.equal(c('12'), '여행'); assert.equal(c('14'), '취미'); assert.equal(c('32'), '여행');
  for (const x of ['28', '38', '39']) assert.equal(c(x), null, x);
  const explore = read('explore-search.js');
  for (const label of new Set(Object.values(tour.LIVON_CATEGORY))) assert.match(explore, new RegExp('label: "' + label + '"'));
  const e = tour.toEntity(item(), 'x');
  assert.deepEqual([e.metadata.contentTypeId, e.metadata.lclsSystm1, e.metadata.lclsSystm2, e.metadata.lclsSystm3], ['12', 'HS', 'HS01', 'HS010100']);
});

test('16-17 sanitation: markup, scripts and entities removed; unsafe/foreign URLs removed', () => {
  assert.equal(tour.plain('a<br/>b<br><br>c &amp; d<script>x()</script><style>p{}</style>'), 'a / b / c & d');
  assert.equal(tour.homepageUrl('<a href="javascript:alert(1)">x</a>'), '');
  assert.equal(tour.homepageUrl('<a href="https://user:pw@evil.example">x</a>'), '');
  assert.equal(tour.homepageUrl('홈페이지: http://www.example.go.kr/main?a=1&amp;b=2'), 'http://www.example.go.kr/main?a=1&b=2');
  assert.equal(tour.imageUrl('https://evil.example/x.jpg'), ''); assert.equal(tour.imageUrl('data:image/png;base64,xx'), '');
  const e = tour.toEntity(item({ title: '<b>[QA 픽스처] 경복궁</b>', firstimage: 'javascript:alert(1)', firstimage2: '' }), 'x');
  assert.equal(e.title, '[QA 픽스처] 경복궁'); assert.deepEqual(e.photos, []);
});

test('18-19 list photo: firstimage shown only with a 공공누리 type; licence + credit preserved; never "free"', () => {
  const S = globalThis.LivonDataSchema;
  const e = S.validateEntity(tour.toEntity(item(), 'x')).entity;
  assert.equal(e.photos.length, 1);
  assert.deepEqual([e.photos[0].license, e.photos[0].licenseLabel, e.photos[0].credit], ['Type3', '공공누리 제3유형(출처표시·변경금지)', '사진 데이터 제공: ⓒ한국관광콘텐츠랩']);
  assert.equal(e.metadata.imageLicense, 'Type3'); assert.equal(e.metadata.policyUrl, tour.POLICY_URL);
  const none = S.validateEntity(tour.toEntity(item({ cpyrhtDivCd: '' }), 'x')).entity;
  assert.deepEqual(none.photos, []); assert.match(none.metadata.imageUrl, /tong\.visitkorea/, 'URL kept as source metadata only');
  assert.equal(S.validateEntity({ type: 'place', provider: 'x', providerId: '1', title: 't', source: { providerName: 'x' }, photos: [{ url: 'https://a.kr/x.jpg' }] }).entity.photos.length, 0, 'schema drops photos without licence/credit');
});

test('20 modifiedtime semantics: source updatedAt (출처 수정일), freshness unknown, never "최근 확인"', async () => {
  const { D } = await loaded();
  const r = await D.tour.search({ query: '경복궁' });
  const e = r.items[0];
  assert.equal(e.source.updatedAt, '2025-09-09T01:10:10.000Z');
  assert.equal(D.freshness(e), 'unknown');
  const html = D.ui.list([e], '', 'life');
  assert.match(html, /출처 업데이트 2025\.09\.09/); assert.doesNotMatch(html, /최근 확인|검증|확인 완료/);
});

test('31-35 zero results, timeout, upstream/quota/malformed errors → fixed LIVON codes; nothing cached', async () => {
  const zero = (await call(handler(ENV, upstream(() => reply(ok([], 0)))), Q('query=zz'))).json();
  assert.deepEqual(zero.items, []); assert.equal(zero.total, 0); assert.equal(zero.hasMore, false);
  const t = await call(handler(ENV, upstream(() => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }); })), Q('query=a'));
  assert.equal(t.statusCode, 504); assert.equal(t.json().code, 'TIMEOUT');
  const cases = [
    [gwError('LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR', '22'), 200, 503, 'UPSTREAM_LIMIT'],
    [gwError('LIMITED_NUMBER_OF_SERVICE_REQUESTS_PER_SECOND_EXCEEDS_ERROR', '23'), 200, 503, 'UPSTREAM_LIMIT'],
    [JSON.stringify({ response: { header: { resultCode: '22', resultMsg: 'LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR' } } }), 200, 503, 'UPSTREAM_LIMIT'],
    [gwError('SERVICETIMEOUT_ERROR', '05'), 200, 504, 'TIMEOUT'],
    [gwError('SERVICE_KEY_IS_NOT_REGISTERED_ERROR', '30'), 200, 502, 'UPSTREAM_ERROR'],
    [gwError('PERMISSION_DENIED', '20'), 200, 502, 'UPSTREAM_ERROR'],
    [JSON.stringify({ response: { header: { resultCode: '10', resultMsg: 'INVALID_REQUEST_PARAMETER_ERROR' } } }), 200, 502, 'UPSTREAM_ERROR'],
    ['<html>oops</html>', 500, 502, 'UPSTREAM_ERROR'], ['{"x":1}', 200, 502, 'UPSTREAM_ERROR'], ['not json', 200, 502, 'UPSTREAM_ERROR'], ['', 200, 502, 'UPSTREAM_ERROR']
  ];
  for (const [text, status, want, code] of cases) {
    const r = await call(handler(ENV, upstream(() => reply(text, { status }))), Q('query=a'));
    assert.equal(r.statusCode, want, text.slice(0, 60)); assert.equal(r.json().code, code);
    assert.doesNotMatch(r.body, /LIMITED|SERVICE_KEY|PERMISSION|OpenAPI_ServiceResponse/);
  }
  const shared = memoryCache(); let sets = 0; const orig = shared.set.bind(shared); shared.set = (...a) => { if (a[2] > 0) sets++; return orig(...a); };
  const up = upstream(() => reply(ok([item()])));
  const h = handler(ENV, up, { cache: shared });
  await call(h, Q('query=a')); await call(h, Q('query=a')); await call(h, Q('id=126508'));
  assert.equal(sets, 0, '저작권 정책: 콘텐츠 캐싱(로컬서버 저장) 금지 → nothing stored');
  assert.equal(up.calls.length, 4, 'repeat requests go upstream again (common + intro for the detail)');
});

test('30 nearby privacy + concurrency: identical concurrent requests share one call; no stored copy; hashed in-flight key', async () => {
  let n = 0;
  const up = upstream(async () => { n++; await new Promise(r => setTimeout(r, 20)); return reply(ok([item()])); });
  const h = handler(ENV, up);
  await Promise.all([1, 2, 3].map(() => post(h, { provider: 'kr-tourapi', action: 'nearby', lat: 37.5665351, lng: 126.9779692 })));
  assert.equal(n, 1);
  const key = PROVIDERS['kr-tourapi'].cacheKey(tour.parseParams({ lat: '37.5665351', lng: '126.9779692' }));
  assert.match(key, /^livon:data:v1:kr-tourapi:[0-9a-f]{40}$/); assert.doesNotMatch(key, /37\.|126\./);
});

/* ───────── browser ───────── */
function browser(server) {
  const mem = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m }; };
  const requested = [];
  const ctx = { console, URL, setTimeout, clearTimeout, Promise, AbortController, localStorage: mem(), sessionStorage: mem(), location: { protocol: 'https:', hash: '' } };
  ctx.window = ctx;
  ctx.fetch = async (url, init = {}) => { requested.push(String(url) + (init.body ? ' BODY ' + init.body : '')); const r = await server(String(url), init); return { ok: r.statusCode === 200, status: r.statusCode, json: async () => JSON.parse(r.body) }; };
  vm.createContext(ctx);
  for (const f of ['explore-data.js', 'today-data.js']) vm.runInContext(read(f), ctx);
  ctx.document = { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
  vm.runInContext(read('life-hub.js'), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  const saves = new Map();
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, x), removeSave: id => saves.delete(id), _saves: saves };
  for (const f of ['data/livon-data-config.js', 'data/livon-data-schema.js', 'data/livon-data-core.js', 'data/livon-data-providers.js', 'explore-search.js']) vm.runInContext(read(f), ctx);
  ctx._requested = requested;
  return ctx;
}
const kdoc = (o = {}) => Object.assign({ id: '18619440', place_name: '[QA 픽스처] 경복궁', category_name: '여행 > 관광,명소 > 고궁', category_group_code: 'AT4', category_group_name: '관광명소', phone: '02-3700-3900',
  address_name: '서울 종로구 세종로 1-91', road_address_name: '서울 종로구 사직로 161', x: '126.9770', y: '37.5788', place_url: 'http://place.map.kakao.com/18619440', distance: '' }, o);
async function loaded({ env = { ...ENV, KAKAO_REST_API_KEY: 'kakao-test-key-123' }, rows = [item(), item({ contentid: '2', contenttypeid: '14', title: '[QA 픽스처] 국립현대미술관', tel: '', cpyrhtDivCd: '' })] } = {}) {
  const up = upstream(u => {
    if (u.origin === 'https://dapi.kakao.com') return reply(JSON.stringify({ meta: { total_count: 1, pageable_count: 1, is_end: true }, documents: [kdoc({ distance: u.searchParams.has('x') ? '120' : '' })] }));
    const name = u.pathname.split('/').pop();
    if (name === 'detailCommon2') return reply(ok([item({ overview: '조선의 법궁<br>설명', homepage: '<a href="https://www.royalpalace.go.kr">x</a>' })]));
    if (name === 'detailIntro2') return reply(ok([{ usetime: '09:00~18:00', restdate: '화요일' }]));
    if (name === 'detailImage2') return reply(ok([{ originimgurl: 'http://tong.visitkorea.or.kr/1.jpg', smallimageurl: 'http://tong.visitkorea.or.kr/1s.jpg', imgname: '근정전', serialnum: '1', cpyrhtDivCd: 'Type1' }]));
    return reply(ok(rows.map(r => (name === 'locationBasedList2' ? { ...r, dist: '250' } : r)), rows.length));
  });
  const h = handler(env, up);
  const ctx = browser((url, init = {}) => call(h, url, init.method || 'GET', init));
  await new Promise(r => setTimeout(r, 30));
  await ctx.LivonData.repository.refresh({ force: true });
  return { ctx, D: ctx.LivonData, up };
}
const tourCalls = up => up.calls.filter(c => c.url.origin === 'https://apis.data.go.kr');

test('no-key in the browser: provider planned, D.tour refuses, zero calls; Kakao and curated data unaffected', async () => {
  const { D, up } = await loaded({ env: { KAKAO_REST_API_KEY: 'kakao-test-key-123' } });
  assert.equal(D.tour.configured(), false); assert.equal(D.places.configured(), true);
  await assert.rejects(D.tour.search({ query: 'a' }), e => e.code === 'NOT_CONFIGURED');
  await assert.rejects(D.tour.detail('126508'), e => e.code === 'NOT_CONFIGURED');
  assert.equal(tourCalls(up).length, 0);
  assert.equal((await D.places.search({ query: '경복궁' })).items.length, 1, 'Kakao still works');
  assert.ok(D.repository.size() > 30);
});

test('21 Explore readiness: keyword/region search, no bulk load, no static-index leak, no N+1 detail/image calls', async () => {
  const { ctx, D, up } = await loaded();
  assert.equal(tourCalls(up).length, 0, 'status + refresh make no TourAPI call');
  const r = await D.tour.search({ query: '경복궁' });
  assert.equal(r.items.length, 2); assert.equal(tourCalls(up).length, 1, 'one list call, no detail/image per item');
  await D.tour.search({ region: '서울', type: '12' });
  assert.equal(op(tourCalls(up)[1]), 'areaBasedList2');
  await assert.rejects(D.tour.search({ type: '12' }), e => e.code === 'NEEDS_INPUT', 'no query/region/position → nothing');
  assert.ok(!ctx.LivonSearch.search('경복궁').items.some(x => String(x.item.key).includes('kr-tourapi')));
  const ex = read('explore-page.js');
  assert.match(ex, /관광정보/); assert.match(ex, /출처: ⓒ한국관광공사/); assert.match(ex, /저작권 정책/); assert.match(ex, /object-fit:contain/, 'photos are not cropped (Type3 변경금지)');
  assert.doesNotMatch(ex.slice(ex.indexOf('한국관광공사 TourAPI 관광정보 (shown')), /공식 홈페이지|예약하기|별점|★/);
  const d = await D.tour.detail('126508');
  assert.deepEqual(tourCalls(up).slice(2).map(op), ['detailCommon2', 'detailIntro2']);
  assert.equal(d.info.length, 2); assert.equal(d.homepageUrl, 'https://www.royalpalace.go.kr/');
  const ph = await D.tour.images('126508');
  assert.equal(ph.length, 1); assert.equal(ph[0].license, 'Type1'); assert.equal(op(tourCalls(up).at(-1)), 'detailImage2');
});

test('Nearby (browser): position only from an explicit call, sent as POST body rounded to ≈100 m; never persisted', async () => {
  const { ctx, D, up } = await loaded();
  const r = await D.tour.search({ type: '14', coords: { lat: 37.5665351, lng: 126.9779692 } });
  assert.equal(r.nearby, true); assert.equal(r.items[0].distanceMeters, 250);
  const sent = ctx._requested.find(u => u.includes('kr-tourapi') && u.includes('BODY'));
  assert.match(sent, /^\/api\/livon\/data BODY /);
  assert.deepEqual((({ lat, lng, action, type }) => [lat, lng, action, type])(JSON.parse(sent.split(' BODY ')[1])), [37.567, 126.978, 'nearby', '14']);
  assert.equal(tourCalls(up)[0].url.searchParams.get('mapY'), '37.567');
  await D.places.search({ query: '경복궁', coords: { lat: 37.5665351, lng: 126.9779692 } });
  assert.ok(ctx._requested.every(u => !/lat=|lng=/.test(u.split(' BODY ')[0])), 'no coordinates in any URL (Kakao moved to POST as well)');
  D.save(r.items[0].id);
  const blob = JSON.stringify([...ctx.localStorage._m.entries(), ...ctx.sessionStorage._m.entries(), [...ctx.LivonPlatform._saves.values()], r.items]);
  assert.doesNotMatch(blob, /37\.566|37\.567|126\.977(?!0)|126\.978/, 'user origin never stored (place coordinates are 37.5788 / 126.9769…)');
});

test('22-23 Life Stage / Today: explicit category relations only, never by age; links only when connected', async () => {
  const { D } = await loaded();
  for (const t of LIFE.topics.filter(x => x.category === '여행')) assert.equal(D.tour.planForTopic(t).type, '12');
  for (const t of LIFE.topics.filter(x => x.category === '취미/문화')) assert.equal(D.tour.planForTopic(t).type, '14');
  for (const c of ['창업', '돈/재테크', '주거', '건강', '운동', '취업']) for (const t of LIFE.topics.filter(x => x.category === c)) assert.equal(D.tour.planForTopic(t), null, t.id);
  assert.equal(D.tour.planForContent({ category: '미술관' }).query, '미술관');
  assert.equal(D.tour.planForContent({ category: '지역별 하루 여행' }).type, '12');
  for (const c of ['창업', '돈 관리', '베이킹', '커플 데이트']) assert.equal(D.tour.planForContent({ category: c }), null, c);
  assert.match(read('life-hub.js'), /T\.configured\(\) && T\.planForTopic/); assert.match(read('today-feed.js'), /T\.configured\(\) && T\.planForContent/);
});

test('24 Home unchanged: no TourAPI section, no "내 주변", no automatic calls', async () => {
  const { D, up } = await loaded();
  const r = D.forHome({ stage: '30', interests: ['여행', '취미'] });
  assert.ok([...r.events, ...r.policies, ...r.programs].every(e => e.provider !== 'kr-tourapi'));
  assert.doesNotMatch(read('home-page.js'), /kr-tourapi|관광정보|내 주변/);
  assert.equal(tourCalls(up).length, 0);
});

test('25 My Life snapshot: title, provider, contentId/type, category, address, phone, place coordinates, attribution; no photo, no origin', async () => {
  const { ctx, D } = await loaded();
  const r = await D.tour.search({ query: '경복궁' });
  const e = r.items[0];
  assert.equal(D.save(e.id), 'saved');
  const rec = ctx.LivonPlatform._saves.get('ext:' + e.id), s = rec.data.snapshot;
  assert.equal(rec.type, 'place'); assert.equal(rec.source, '한국관광공사 TourAPI');
  assert.deepEqual([s.title, s.provider, s.providerRef, s.contentTypeId, s.category], ['[QA 픽스처] 경복궁', 'kr-tourapi', '126508', '12', '여행']);
  assert.deepEqual([s.address, s.detailAddress, s.phone, s.latitude, s.longitude], ['서울특별시 종로구 사직로 161', '(세종로)', '02-3700-3900', 37.5788222356, 126.9769930325]);
  assert.equal(s.attribution, '출처: ⓒ한국관광공사');
  assert.doesNotMatch(JSON.stringify(rec), /tong\.visitkorea|firstimage|distance/);
});

test('26-28 Kakao coexistence, strict dedupe, no automatic enrichment', async () => {
  const { D, up } = await loaded();
  const k = (await D.places.search({ query: '경복궁' })).items[0];
  const t = (await D.tour.search({ query: '경복궁' })).items[0];
  assert.equal(tourCalls(up).length, 1, 'a Kakao search never triggers a TourAPI call');
  assert.equal(up.calls.filter(c => c.url.origin === 'https://dapi.kakao.com').length, 1, 'and vice versa');
  assert.equal(D.action(k).label, '카카오맵에서 보기'); assert.equal(D.action(t), null, 'TourAPI list items get no external CTA (no KTO page URL in the API)');
  assert.equal(D.dedupe([k, t]).length, 1, 'same title + same phone + same ≈100 m cell → one place (strong evidence)');
  const kNoPhone = Object.assign({}, k, { contact: null });
  assert.equal(D.dedupe([kNoPhone, t]).length, 2, 'same title + nearby only (address spelled differently) → kept separate');
  assert.equal(D.dedupe([Object.assign({}, kNoPhone, { location: Object.assign({}, k.location, { latitude: 35, longitude: 129 }) }), t]).length, 2, 'title only → kept separate');
  const twin = Object.assign({}, t, { location: Object.assign({}, t.location, { address: k.location.roadAddress, roadAddress: k.location.roadAddress, latitude: k.location.latitude, longitude: k.location.longitude }), contact: k.contact });
  assert.equal(D.dedupe([k, twin]).length, 1, 'title + address + phone + coordinates → one');
  assert.equal(D.dedupe([k, Object.assign({}, twin, { contact: null, location: Object.assign({}, twin.location, { latitude: 35, longitude: 129 }) })]).length, 2, 'title + address only');
});

test('36 existing providers regression: status lists the five earlier providers first; bizinfo/youth list routes unaffected', async () => {
  const h = handler({ ...ENV, BIZINFO_API_KEY: 'biz-test-key-123456' }, upstream(u => reply(u.origin === 'https://apis.data.go.kr' ? ok([]) : '{}')));
  const st = (await call(h, '/api/livon/data?action=status')).json().providers;
  assert.deepEqual(Object.keys(st).slice(0, 5), ['kr-youth-policy', 'kr-business-support', 'kr-business-event', 'kr-kakao-place', 'kr-tourapi']);
  assert.equal((await call(h, '/api/livon/data?provider=kr-youth-policy', 'POST')).statusCode, 405);
  assert.equal((await call(h, '/api/livon/data?provider=kr-business-support&type=12')).statusCode, 400, 'TourAPI params are TourAPI-only');
  assert.equal(kakao.PROVIDER_ID, 'kr-kakao-place');
  const docs = root('docs/livon/real-data-providers.md');
  assert.match(docs, /kr-tourapi/); assert.match(docs, /KorService2/); assert.match(docs, /TOURAPI_SERVICE_KEY/);
});

/* ───────── region codes (ONGIL Enjoy Phase B) ───────── */
const LIVE_CODES = { 서울: '11', 부산: '26', 대구: '27', 인천: '28', '광주·전남': '12', 대전: '30', 울산: '31', 세종: '36110', 경기: '41', 강원: '51', 충북: '43', 충남: '44', 전북: '52', 경북: '47', 경남: '48', 제주: '50' };

test('26 regions: every region name is sent as the code the live service answers for it — nationwide, in a natural order', async () => {
  assert.deepEqual({ ...tour.REGION_CODES }, LIVE_CODES);
  assert.deepEqual(Object.keys(tour.REGION_CODES), ['서울', '부산', '대구', '인천', '광주·전남', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '경북', '경남', '제주']);
  const up = upstream(() => reply(ok([item()])));
  const h = handler(ENV, up);
  for (const [name, code] of Object.entries(LIVE_CODES)) {
    const before = up.calls.length;
    assert.equal((await call(h, Q('region=' + enc(name) + '&type=12'))).statusCode, 200, name);
    const u = up.calls[before].url;
    assert.equal(op(up.calls[before]), 'areaBasedList2');
    assert.equal(u.searchParams.get('lDongRegnCd'), code, name + ' → ' + code);
    assert.equal(u.searchParams.get('contentTypeId'), '12');
    assert.equal(u.searchParams.has('areaCode'), false);
  }
  /* the keyword search carries the same code */
  const k = up.calls.length;
  await call(h, Q('query=' + enc('호수공원') + '&region=' + enc('세종')));
  assert.equal(up.calls[k].url.searchParams.get('lDongRegnCd'), '36110');
});

test('27 광주·전남 is one upstream region (12): 광주 or 전남 alone is refused, never answered with the merged list', async () => {
  const up = upstream(() => reply(ok([item()])));
  const h = handler(ENV, up);
  assert.equal(tour.parseParams({ region: '광주·전남' }).area, '12');
  for (const alone of ['광주', '전남', '광주광역시', '전라남도', '광주전남', '전남광주통합특별시']) {
    assert.equal((await call(h, Q('region=' + enc(alone) + '&type=12'))).statusCode, 400, alone);
  }
  assert.equal(up.calls.length, 0, 'a refused region never reaches the provider');
});

test('28 codes that return nothing upstream (29, 36, 42, 45, 46) are in no mapping and are refused as area values', async () => {
  const dead = ['29', '36', '42', '45', '46'];
  for (const c of dead) assert.equal(Object.values(tour.REGION_CODES).includes(c), false, c);
  const up = upstream(() => reply(ok([item()])));
  const h = handler(ENV, up);
  for (const c of [...dead, '1', '99', '3611', '361100', '36110x']) assert.equal((await call(h, Q('area=' + c + '&type=12'))).statusCode, 400, 'area=' + c);
  assert.equal(up.calls.length, 0);
  /* live codes still work as area values, 세종's five digits included, with a 시군구 code */
  assert.equal((await call(h, Q('area=36110&type=14'))).statusCode, 200);
  assert.equal(up.calls[0].url.searchParams.get('lDongRegnCd'), '36110');
  assert.equal((await call(h, Q('area=12&sigungu=240'))).statusCode, 200);
  assert.deepEqual(['lDongRegnCd', 'lDongSignguCd'].map(x => up.calls[1].url.searchParams.get(x)), ['12', '240']);
  assert.equal((await call(h, Q('region=' + enc('세종') + '&area=36'))).statusCode, 400);
});

test('29 content types are unchanged: places only (12, 14, 28, 32, 38, 39); 행사 15 and 여행코스 25 stay refused', async () => {
  assert.deepEqual([...tour.PLACE_TYPES], ['12', '14', '28', '32', '38', '39']);
  assert.deepEqual([...tour.LIVON_TYPES], ['12', '14', '28', '32']);
  assert.equal(Object.values(tour.OPS).some(o => /festival/i.test(o)), false, 'no festival operation');
  const up = upstream(() => reply(ok([item()])));
  const h = handler(ENV, up);
  for (const t of ['15', '25']) assert.equal((await call(h, Q('region=' + enc('제주') + '&type=' + t))).statusCode, 400, 'type ' + t);
  assert.equal(up.calls.length, 0);
});

test('30 LIVON client: its TourAPI regions are all names the route answers; 광주 alone sends no region, 광주·전남 reaches code 12', async () => {
  const { D, up } = await loaded();
  assert.deepEqual([...D.tour.REGIONS], ['서울', '부산', '대구', '인천', '광주·전남', '대전', '경기']);
  for (const r of D.tour.REGIONS) assert.ok(Object.prototype.hasOwnProperty.call(tour.REGION_CODES, r), r + ' is in the route table');
  await D.tour.search({ region: '광주·전남', type: '12' });
  const sent = tourCalls(up);
  assert.equal(sent[sent.length - 1].url.searchParams.get('lDongRegnCd'), '12');
  /* "광주" is not a TourAPI region for LIVON any more: with nothing else to search by, nothing is sent (no 400, no empty list) */
  const before = tourCalls(up).length;
  await assert.rejects(D.tour.search({ region: '광주', type: '12' }), e => e.code === 'NEEDS_INPUT');
  assert.equal(tourCalls(up).length, before);
});
