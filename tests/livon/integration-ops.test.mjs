// LIVON Real Data Providers — Integration & Operations V1.
// All 8 connected providers together: registry/manifest agreement, env, no-key, error isolation, cache isolation,
// freshness semantics, attribution, Explore coexistence, detail, My Life provenance, AI and diagnostics.
// No real keys. Upstream bodies are [QA 픽스처] built from each provider's documented fields.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createDataHandler, PROVIDERS, PROVIDER_STATES, stateForError } from '../../server/livon/data/http.mjs';
import { memoryCache } from '../../server/livon/data/cache.mjs';
import { PROVIDER_MANIFEST, READINESS, BLOCKED_CANDIDATES, DATA_ENV_KEYS } from '../../server/livon/data/manifest.mjs';
import { INSTRUCTIONS } from '../../server/livon/chat.mjs';
import * as youth from '../../server/livon/data/providers/youthcenter.mjs';
import * as biz from '../../server/livon/data/providers/bizinfo.mjs';
import * as ev from '../../server/livon/data/providers/bizinfo-event.mjs';
import * as tx from '../../server/livon/data/providers/public-tax-expert.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const root = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const IDS = ['kr-youth-policy', 'kr-business-support', 'kr-business-event', 'kr-kakao-place', 'kr-tourapi', 'kr-lifelong-class', 'kr-public-tax-expert', 'kr-job-training'];
const MARK = 'LEAK-MARKER-7f3a';
const KEYS = { YOUTHCENTER_API_KEY: 'yc-key-' + MARK, BIZINFO_API_KEY: 'bz-key-' + MARK, KAKAO_REST_API_KEY: 'kk-key-' + MARK, TOURAPI_SERVICE_KEY: 'tr-key-' + MARK, PUBLIC_DATA_SERVICE_KEY: 'pd-key-' + MARK, WORK24_TRAINING_API_KEY: 'w24-key-' + MARK };
const ymd = n => new Date(Date.now() + n * 864e5 + 9 * 3600e3).toISOString().slice(0, 10);
const compact = n => ymd(n).replace(/-/g, '');

/* ───────── fixtures (documented fields only) ───────── */
const F = {
  youth: (o = {}) => Object.assign({ plcyNo: 'R2026QA0001', plcyNm: '[QA 픽스처] 청년 월세 지원', plcyExplnCn: '무주택 청년 월세 지원', lclsfNm: '주거', mclsfNm: '주거비 지원',
    sprvsnInstCdNm: '국토교통부', refUrlAddr1: 'https://www.molit.go.kr/', sprtTrgtMinAge: '19', sprtTrgtMaxAge: '34', sprtTrgtAgeLmtYn: 'Y',
    aplyYmd: `${compact(-3)} ~ ${compact(30)}`, zipCd: '11000', frstRegDt: '2026-01-02 09:00:00', lastMdfcnDt: '2026-09-20 10:30:00' }, o),
  biz: (o = {}) => Object.assign({ pblancId: 'PBLN_QA_0001', pblancNm: '[QA 픽스처] 예비창업패키지', pblancUrl: 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_QA_0001',
    jrsdInsttNm: '중소벤처기업부', excInsttNm: '창업진흥원', bsnsSumryCn: '예비창업자 지원', pldirSportRealmLclasCodeNm: '창업', creatPnttm: '2026-09-01 10:00:00',
    reqstBeginEndDe: `${compact(-3)} ~ ${compact(20)}`, hashTags: '2026,창업,서울' }, o),
  event: (o = {}) => Object.assign({ eventInfoId: 'EVEN_QA_0001', nttNm: '[QA 픽스처] 창업 사업설명회', eventInfoTyNm: '사업설명회', nttCn: '설명회 개최', originEngnNm: '창업진흥원',
    originUrlAdres: 'https://www.kised.or.kr/board/notice/1', BeginEndDe: `${compact(10)} ~ ${compact(10)}`, areaNm: '전국', rceptPd: `${ymd(-2)} ~ ${ymd(5)}`,
    pldirSportRealmLclasCodeNm: '경영@창업', registDe: '20260915', hashTags: '2026,창업' }, o),
  kakao: (o = {}) => Object.assign({ id: '26338954', place_name: '[QA 픽스처] 마포 중앙도서관', category_name: '문화,예술 > 문화시설 > 도서관', category_group_code: 'CT1',
    category_group_name: '문화시설', phone: '02-3153-5800', address_name: '서울 마포구 성산동 370-1', road_address_name: '서울 마포구 성산로 128', x: '126.9084', y: '37.5636',
    place_url: 'http://place.map.kakao.com/26338954', distance: '' }, o),
  tour: (o = {}) => Object.assign({ contentid: '126508', contenttypeid: '12', title: '[QA 픽스처] 경복궁', addr1: '서울특별시 종로구 사직로 161', tel: '02-3700-3900',
    mapx: '126.9769930325', mapy: '37.5788222356', cpyrhtDivCd: 'Type3', lDongRegnCd: '11', lDongSignguCd: '110', createdtime: '20031105090000', modifiedtime: '20250909101010' }, o),
  life: (o = {}) => Object.assign({ lctreNm: '[QA 픽스처] 성인 요가', operInstitutionNm: '거제시청소년수련관', edcStartDay: ymd(10), edcEndDay: ymd(70), edcMthType: '오프라인',
    edcRdnmadr: '경상남도 거제시 계룡로 175', lctreCost: '0', rceptStartDate: ymd(-3), rceptEndDate: ymd(5), homepageUrl: 'https://www.gmdc.co.kr/_gjyc/', referenceDate: '2026-07-14', instt_code: '5310000' }, o),
  dg: (o = {}) => Object.assign({ EMD_NM: '신암1동', LNDCTN_NM: '[QA 픽스처] 가세무', TELNO: '053-000-0001' }, o),
  ic: (o = {}) => Object.assign({ 구분: '연수구', 세무사명: '[QA 픽스처] 나세무', 활동마을: '송도1동' }, o),
  job: (o = {}) => Object.assign({ title: '[QA 픽스처] 웹 개발자 양성과정', subTitle: '[QA 픽스처] 가나다직업전문학교', address: '서울특별시 강남구 테헤란로 1', courseMan: '0', realMan: '0',
    titleLink: 'https://www.work24.go.kr/hr/a/a/3100/selectTracseDetl.do?tracseId=AIG1', traStartDate: ymd(14), traEndDate: ymd(120), trainTarget: '국민내일배움카드(일반)',
    trainTargetCd: 'M1001', trainstCstId: '500020012345', trprDegr: '3', trprId: 'AIG20230000412345', wkendSe: '3', yardMan: '25', eiEmplRate3: '75.5', stdgScor: '4.8', regCourseMan: '27' }, o)
};
const x = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const BODY = {
  youth: rows => JSON.stringify({ resultCode: 200, result: { pagging: { totCount: rows.length, pageNum: 1, pageSize: 100 }, youthPolicyList: rows } }),
  bizinfo: rows => JSON.stringify({ jsonArray: { title: '기업마당', item: rows } }),
  kakao: docs => JSON.stringify({ meta: { total_count: docs.length, pageable_count: docs.length, is_end: true }, documents: docs }),
  gw: rows => JSON.stringify({ response: { header: { resultCode: '0000', resultMsg: 'OK' }, body: { items: rows.length ? { item: rows } : '', numOfRows: 20, pageNo: 1, totalCount: rows.length } } }),
  pd: rows => JSON.stringify({ response: { header: { resultCode: '00' }, body: { items: rows, totalCount: rows.length } } }),
  gwTax: rows => JSON.stringify({ response: { header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' }, body: { items: { item: rows }, numOfRows: 100, pageNo: 1, totalCount: rows.length } } }),
  od: rows => JSON.stringify({ page: 1, perPage: 100, totalCount: rows.length, currentCount: rows.length, matchCount: rows.length, data: rows }),
  job: rows => `<?xml version="1.0" encoding="UTF-8"?><HRDNet><scn_cnt>${rows.length}</scn_cnt><srchList>` + rows.map(r => '<scn_list>' + Object.entries(r).map(([k, v]) => `<${k}>${x(v)}</${k}>`).join('') + '</scn_list>').join('') + '</srchList></HRDNet>',
  jobDetail: () => '<HRDNet><inst_base_info><inoNm>[QA 픽스처] 가나다직업전문학교</inoNm><trprNm>[QA 픽스처] 웹 개발자 양성과정</trprNm><trtm>640</trtm><perTrco>1500000</perTrco><trprChap>홍길동</trprChap><trprChapEmail>h@example.com</trprChapEmail></inst_base_info><inst_detail_info><tgcrGnrlTrneOwepAllt>0</tgcrGnrlTrneOwepAllt></inst_detail_info></HRDNet>'
};
/* which provider an upstream URL belongs to */
function who(u) {
  const h = u.href;
  if (h.startsWith(youth.UPSTREAM)) return 'kr-youth-policy';
  if (h.startsWith(ev.UPSTREAM)) return 'kr-business-event';
  if (h.startsWith(biz.UPSTREAM)) return 'kr-business-support';
  if (u.host === 'dapi.kakao.com') return 'kr-kakao-place';
  if (h.startsWith('https://apis.data.go.kr/B551011/')) return 'kr-tourapi';
  if (h.startsWith('https://api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api')) return 'kr-lifelong-class';
  if (h.startsWith(tx.SOURCES['daegu-donggu'].endpoint) || h.startsWith(tx.SOURCES.incheon.endpoint)) return 'kr-public-tax-expert';
  if (u.host === 'www.work24.go.kr') return 'kr-job-training';
  return null;
}
const reply = (text, { status = 200, type = 'application/json' } = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => type }, text: async () => text });
function okFor(id, u) {
  switch (id) {
    case 'kr-youth-policy': return reply(BODY.youth([F.youth()]));
    case 'kr-business-support': return reply(BODY.bizinfo([F.biz()]));
    case 'kr-business-event': return reply(BODY.bizinfo([F.event()]));
    case 'kr-kakao-place': return reply(BODY.kakao([F.kakao()]));
    case 'kr-tourapi': return reply(BODY.gw([F.tour()]));
    case 'kr-lifelong-class': return reply(BODY.pd([F.life()]));
    case 'kr-public-tax-expert': return reply(u.host === 'api.odcloud.kr' ? BODY.od([F.ic()]) : BODY.gwTax([F.dg()]));
    case 'kr-job-training': return reply(u.pathname.endsWith('310L02.do') ? BODY.jobDetail() : BODY.job([F.job()]), { type: 'application/xml' });
  }
  throw new Error('no fixture');
}
/* modes: { [providerId]: 'ok' | 'timeout' | 'network' | 'http500' | 'http401' | 'garbage' | 'badjson' | 'empty' | fn } */
function upstream(modes = {}) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    const u = new URL(url), id = who(u);
    calls.push({ id, url: u, init });
    if (!id) throw new Error('unexpected host ' + u.host);
    const m = modes[id] || 'ok';
    if (typeof m === 'function') return m(u);
    if (m === 'timeout') throw Object.assign(new Error('t ' + MARK), { name: 'TimeoutError' });
    if (m === 'network') throw new TypeError('fetch failed ' + MARK);
    if (m === 'http500') return reply('<html>Internal ' + MARK + '</html>', { status: 500 });
    if (m === 'http401') return reply('{"error":"unauthorized ' + MARK + '"}', { status: 401 });
    if (m === 'garbage') return reply('<html>maintenance ' + MARK + '</html>');
    if (m === 'badjson') return reply('{"result": ' + MARK);
    return okFor(id, u);
  };
  return { fetcher, calls };
}
function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } }; r.json = () => JSON.parse(r.body); return r; }
async function call(h, url, method = 'GET', init = {}) { const r = res(); await h({ method, url, headers: init.headers || {}, body: init.body }, r); return r; }
const handler = (env, up, extra = {}) => createDataHandler({ env, fetcher: up.fetcher, cache: extra.cache || memoryCache(), log: extra.log || (() => {}) });
/* one request per provider that reaches upstream */
const REQ = {
  'kr-youth-policy': '/api/livon/data?provider=kr-youth-policy', 'kr-business-support': '/api/livon/data?provider=kr-business-support',
  'kr-business-event': '/api/livon/data?provider=kr-business-event', 'kr-kakao-place': '/api/livon/data?provider=kr-kakao-place&query=' + encodeURIComponent('도서관'),
  'kr-tourapi': '/api/livon/data?provider=kr-tourapi&query=' + encodeURIComponent('경복궁'), 'kr-lifelong-class': '/api/livon/data?provider=kr-lifelong-class',
  'kr-public-tax-expert': '/api/livon/data?provider=kr-public-tax-expert', 'kr-job-training': '/api/livon/data?provider=kr-job-training&query=' + encodeURIComponent('웹')
};
const FIXED_CODES = ['NOT_CONFIGURED', 'TIMEOUT', 'UPSTREAM_ERROR', 'UPSTREAM_LIMIT'];

/* ───────── registry / manifest / env ───────── */
test('OPS-2 environment: one name per key everywhere (adapters, route, manifest, .env.example, docs); no secret in browser code or build', () => {
  assert.deepEqual([...new Set(Object.values(PROVIDERS).map(p => p.envKey))].sort(), [...DATA_ENV_KEYS].sort());
  const example = root('.env.example'), docs = root('docs/livon/real-data-providers.md');
  for (const k of DATA_ENV_KEYS) { assert.match(example, new RegExp('\\n' + k + '=\\n'), k); assert.ok(docs.includes('`' + k + '`'), k + ' documented'); }
  assert.ok(docs.includes('`LIVON_DATA_DIAGNOSTICS`'));
  const SECRET = /YOUTHCENTER_API_KEY|BIZINFO_API_KEY|KAKAO_REST_API_KEY|TOURAPI_SERVICE_KEY|PUBLIC_DATA_SERVICE_KEY|WORK24_TRAINING_API_KEY|serviceKey=|authKey=|KakaoAK|crtfcKey/;
  const scan = dir => { for (const n of readdirSync(dir)) { const p = dir + '/' + n; if (statSync(p).isDirectory()) scan(p); else if (/\.(js|html|json|css)$/.test(n)) assert.doesNotMatch(readFileSync(p, 'utf8'), SECRET, p); } };
  scan(new URL('../../livon', import.meta.url).pathname);
  const pub = new URL('../../_publish/livon', import.meta.url).pathname;
  if (existsSync(pub)) scan(pub);
});

test('OPS-3 no keys: every provider unconfigured, NOT_CONFIGURED, zero upstream calls; bad params still 400', async () => {
  const up = upstream();
  const h = handler({}, up);
  const st = (await call(h, '/api/livon/data?action=status')).json().providers;
  for (const id of IDS) {
    assert.equal(st[id].configured, false, id);
    assert.deepEqual(Object.keys(st[id]).filter(k => !['configured', 'entityTypes', 'mode'].includes(k)), [], 'status stays booleans + types');
    const r = await call(h, REQ[id]);
    assert.equal(r.statusCode, 503, id); assert.equal(r.json().code, 'NOT_CONFIGURED');
  }
  assert.equal((await call(h, '/api/livon/data?provider=kr-job-training&region=Mars')).statusCode, 400);
  assert.equal(up.calls.length, 0);
  const d = h.diagnostics();
  for (const id of IDS) assert.equal(d[id].status, 'unconfigured', id);
  const all = handler(KEYS, upstream());
  const st2 = (await call(all, '/api/livon/data?action=status')).json().providers;
  for (const id of IDS) assert.equal(st2[id].configured, true, id);
  assert.doesNotMatch(JSON.stringify(st2), new RegExp(MARK));
});

/* ───────── error isolation ───────── */
test('OPS-4 error isolation: timeout / network / HTTP 5xx / HTTP 401 / invalid body / invalid JSON → fixed codes, no raw text/key/stack', async () => {
  const logs = [];
  for (const mode of ['timeout', 'network', 'http500', 'http401', 'garbage', 'badjson']) {
    for (const id of IDS) {
      const up = upstream({ [id]: mode });
      const h = handler(KEYS, up, { log: (...a) => logs.push(a.join(' ')) });
      const r = await call(h, REQ[id]);
      assert.ok(up.calls.length >= 1, `${id} ${mode} reached upstream`);
      assert.ok([502, 503, 504].includes(r.statusCode), `${id} ${mode} → ${r.statusCode}`);
      const b = r.json();
      assert.equal(b.ok, false); assert.ok(FIXED_CODES.includes(b.code), `${id} ${mode} code ${b.code}`);
      assert.deepEqual(Object.keys(b).sort(), ['code', 'error', 'ok']);
      assert.doesNotMatch(r.body, new RegExp(MARK + '|stack|Error:|at .*\\.mjs|<html|unauthorized|maintenance'), `${id} ${mode}`);
      assert.equal(r.headers['cache-control'], 'no-store');
      const d = h.diagnostics()[id];
      assert.ok(['temporarily_failed', 'rejected', 'invalid_response', 'rate_limited'].includes(d.status), `${id} ${mode} status ${d.status}`);
      if (mode === 'timeout' || mode === 'network' || mode === 'http500') assert.equal(d.status, 'temporarily_failed', `${id} ${mode}`);
      if (mode === 'garbage' || mode === 'badjson') assert.ok(['invalid_response', 'rejected', 'temporarily_failed'].includes(d.status));
    }
  }
  assert.ok(logs.every(l => !l.includes(MARK) && !/https?:\/\//.test(l)), 'logs: fixed codes only');
  assert.deepEqual([...PROVIDER_STATES], ['unconfigured', 'configured', 'available', 'temporarily_failed', 'rate_limited', 'invalid_response', 'rejected']);
  assert.deepEqual(['TIMEOUT', 'NETWORK', 'HTTP_5XX', 'QUOTA', 'PARSE', 'INVALID_DATA', 'HTTP_4XX', 'WHATEVER'].map(stateForError),
    ['temporarily_failed', 'temporarily_failed', 'temporarily_failed', 'rate_limited', 'invalid_response', 'invalid_response', 'rejected', 'temporarily_failed']);
});

test('OPS-5 rate limit / quota and zero results are distinct from failures', async () => {
  const quota = { 'kr-lifelong-class': () => reply('<OpenAPI_ServiceResponse><cmmMsgHeader><returnAuthMsg>LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR</returnAuthMsg><returnReasonCode>22</returnReasonCode></cmmMsgHeader></OpenAPI_ServiceResponse>'),
    'kr-job-training': () => reply("<GO24><error>일일 호출 건수를 초과하였습니다</error></GO24>") };
  const h = handler(KEYS, upstream(quota));
  for (const id of ['kr-lifelong-class', 'kr-job-training']) {
    const r = await call(h, REQ[id]);
    assert.equal(r.statusCode, 503, id); assert.equal(r.json().code, 'UPSTREAM_LIMIT');
    assert.equal(h.diagnostics()[id].status, 'rate_limited');
  }
  const zero = handler(KEYS, upstream({ 'kr-kakao-place': () => reply(BODY.kakao([])), 'kr-job-training': () => reply(BODY.job([])), 'kr-lifelong-class': () => reply(BODY.pd([])) }));
  for (const id of ['kr-kakao-place', 'kr-job-training', 'kr-lifelong-class']) {
    const r = await call(zero, REQ[id]);
    assert.equal(r.statusCode, 200, id); assert.equal(r.json().items.length, 0);
    assert.equal(zero.diagnostics()[id].status, 'available', id + ': zero results are a normal answer');
  }
});

test('OPS-6 schema mismatch: rows present but none valid → invalid_response (502), never cached, never "0 results"', async () => {
  const id = 'qa-schema-probe';
  let n = 0;
  PROVIDERS[id] = { id, name: 'QA', entityTypes: ['program'], envKey: 'QA_KEY', configured: () => true, load: async () => { n++; return [{ type: 'program', provider: id, providerId: '', title: '' }, { type: 'nope' }]; } };
  try {
    const h = handler({}, upstream());
    const a = await call(h, '/api/livon/data?provider=' + id), b = await call(h, '/api/livon/data?provider=' + id);
    assert.equal(a.statusCode, 502); assert.equal(a.json().code, 'UPSTREAM_ERROR'); assert.equal(b.statusCode, 502);
    assert.equal(n, 2, 'not cached');
    assert.equal(h.diagnostics()[id].status, 'invalid_response');
  } finally { delete PROVIDERS[id]; }
});

test('OPS-7 provider failure isolation: one failing provider never affects another in the same server instance', async () => {
  const up = upstream({ 'kr-business-support': 'http500', 'kr-tourapi': 'timeout' });
  const h = handler(KEYS, up);
  const out = {};
  for (const id of IDS) out[id] = (await call(h, REQ[id])).statusCode;
  assert.deepEqual(out, { 'kr-youth-policy': 200, 'kr-business-support': 502, 'kr-business-event': 200, 'kr-kakao-place': 200, 'kr-tourapi': 504, 'kr-lifelong-class': 200, 'kr-public-tax-expert': 200, 'kr-job-training': 200 });
  const d = h.diagnostics();
  assert.equal(d['kr-business-support'].status, 'temporarily_failed'); assert.equal(d['kr-business-event'].status, 'available', 'same key, separate provider');
  const part = handler(KEYS, upstream({ 'kr-public-tax-expert': u => (u.host === 'api.odcloud.kr' ? reply('', { status: 500 }) : okFor('kr-public-tax-expert', u)) }));
  const r = await call(part, REQ['kr-public-tax-expert']);
  assert.equal(r.statusCode, 200, 'one tax source down → the other source still answers'); assert.ok(r.json().items.length >= 1);
});

/* ───────── cache ───────── */
test('OPS-8 cache isolation: per-provider keys, failures never cached, hits/misses counted, fetchedAt = original fetch (cache age)', async () => {
  const cache = memoryCache({ maxEntries: 500 }); const keys = [];
  const set = cache.set.bind(cache); cache.set = (k, v, t) => { keys.push([k, t]); return set(k, v, t); };
  let t0 = Date.parse('2026-09-29T00:00:00Z'); const clock = () => t0;
  let failOnce = true;
  const up = upstream({ 'kr-job-training': u => { if (failOnce) { failOnce = false; return reply('', { status: 500 }); } return okFor('kr-job-training', u); } });
  const h = createDataHandler({ env: KEYS, fetcher: up.fetcher, cache, now: clock, log: () => {} });
  assert.equal((await call(h, REQ['kr-job-training'])).statusCode, 502);
  for (const id of IDS) await call(h, REQ[id]);
  const first = (await call(h, REQ['kr-youth-policy'])).json();
  t0 += 3600e3;
  const again = (await call(h, REQ['kr-youth-policy'])).json();
  assert.equal(again.cached, true); assert.equal(again.fetchedAt, first.fetchedAt, 'a cached answer keeps its original fetch time');
  const ids = keys.map(([k]) => k.split(':')[3]);
  assert.ok(!ids.includes('kr-tourapi'), 'TourAPI content is never cached (copyright policy)');
  for (const id of IDS.filter(i => i !== 'kr-tourapi')) assert.ok(ids.includes(id), id + ' cached under its own key');
  assert.ok(keys.every(([k]) => /^livon:data:v1:kr-[a-z-]+(:|$)/.test(k)));
  assert.ok(keys.every(([k]) => !k.includes('웹') && !k.includes('도서관') && !k.includes(MARK)), 'no plaintext search text or key in cache keys');
  assert.ok(keys.every(([, t]) => t > 0));
  const d = h.diagnostics();
  assert.equal(d['kr-youth-policy'].cacheHits, 2); assert.equal(d['kr-youth-policy'].upstreamLoads, 1);
  assert.equal(d['kr-job-training'].upstreamLoads, 2, 'the failed load was retried, not served from cache');
  assert.ok(Object.values(d).every(v => typeof v.cacheMisses === 'number'));
  /* identical concurrent requests share one upstream call (all providers) */
  const slow = upstream(Object.fromEntries(IDS.map(id => [id, u => new Promise(r => setTimeout(() => r(okFor(id, u)), 15))])));
  const single = upstream();
  const h1 = handler(KEYS, single);
  for (const id of IDS) await call(h1, REQ[id]);
  const hs = handler(KEYS, slow);
  await Promise.all(IDS.flatMap(id => [call(hs, REQ[id]), call(hs, REQ[id]), call(hs, REQ[id])]));
  for (const id of IDS) {
    const one = single.calls.filter(c => c.id === id).length, n = slow.calls.filter(c => c.id === id).length;
    assert.ok(one >= 1); assert.equal(n, one, id + ': three concurrent identical requests cost the same upstream calls as one');
  }
  /* bounded memory cache */
  const small = memoryCache({ maxEntries: 3 });
  for (let i = 0; i < 10; i++) await small.set('k' + i, { items: [] }, 1000);
  assert.equal(await small.get('k0'), null); assert.ok(await small.get('k9'));
});

/* ───────── browser (vm) ───────── */
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
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: y => saves.set(y.id, y), removeSave: id => saves.delete(id), _saves: saves };
  ctx.LivonMyLife = { api: { saveTodo: t => { if (todos.find(y => y.title === t.title)) return { status: 'duplicate' }; todos.push(t); return { status: 'ok', item: t }; } }, _todos: todos };
  for (const f of ['data/livon-data-config.js', 'data/livon-data-schema.js', 'data/livon-data-core.js', 'data/livon-data-providers.js', 'explore-search.js']) vm.runInContext(read(f), ctx);
  return ctx;
}
async function loaded({ env = KEYS, modes = {} } = {}) {
  const up = upstream(modes);
  const h = handler(env, up);
  const ctx = browser((url, init = {}) => call(h, url, init.method || 'GET', init));
  await new Promise(r => setTimeout(r, 30));
  await ctx.LivonData.repository.refresh({ force: true });
  const D = ctx.LivonData;
  const first = p => p.then(r => r.items[0], () => null);   /* a failing on-demand provider leaves its slot empty */
  const place = await first(D.places.search({ query: '도서관' }));
  const tour = await first(D.tour.search({ query: '경복궁' }));
  const job = await first(D.jobs.search({ query: '웹' }));
  const byProvider = id => D.repository.list({ includeExpired: true }).find(e => e.provider === id);
  const E = { policy: byProvider('kr-youth-policy'), biz: byProvider('kr-business-support'), event: byProvider('kr-business-event'), life: byProvider('kr-lifelong-class'), expert: byProvider('kr-public-tax-expert'), place, tour, job };
  return { ctx, D, up, h, E };
}
const FAKE = /평점|별점|후기|리뷰|인기|추천 순위|예약 가능|잔여|남은 자리|마감 임박|실시간|무료|취업률|만족도|합격|LIVON 검증|LIVON 인증|검증된 전문가|정보 없음|undefined|null|NaN/;

test('OPS-18 documentation: current implementation, verification split (code/fixture vs live), readiness matrix', () => {
  const docs = root('docs/livon/real-data-providers.md');
  assert.match(docs, /실제 API 호출 검증\(LIVE VERIFIED\)을 마친 provider는 없습니다/);
  assert.match(docs, /8개 모두 \*\*코드\/fixture 검증 완료\*\*, \*\*실제 API 호출 검증 미완료\*\*/);
  for (const id of IDS) assert.match(docs, new RegExp('\\| ' + id + ' \\| CODE READY · LIVE KEY REQUIRED · LIVE VERIFICATION REQUIRED \\|'), id);
  assert.match(docs, /public-law-expert \(provider 아님\) \| BLOCKED: OFFICIAL SOURCE DOWNLOAD REQUIRED/);
  assert.doesNotMatch(docs.replace('실제 API 호출 검증(LIVE VERIFIED)을 마친 provider는 없습니다', ''), /LIVE VERIFIED/);
  for (const id of IDS) assert.ok(docs.includes('`' + id + '`'), id + ' in provider table');
  assert.doesNotMatch(docs.slice(0, 400), /연결된 외부 공급자 없음/, 'stale header removed');
});

/* ───────── V1 release: full failure matrix ───────── */
test('OPS-19 V1 failure matrix: every provider × HTTP 400/403/404/429/502/503, empty body, HTML 200 → fixed code, no leak; empty results → 200 []', async () => {
  const EMPTY = {
    'kr-youth-policy': () => reply(BODY.youth([])), 'kr-business-support': () => reply(BODY.bizinfo([])), 'kr-business-event': () => reply(BODY.bizinfo([])),
    'kr-kakao-place': () => reply(BODY.kakao([])), 'kr-tourapi': () => reply(BODY.gw([])), 'kr-lifelong-class': () => reply(BODY.pd([])),
    'kr-public-tax-expert': u => reply(u.host === 'api.odcloud.kr' ? BODY.od([]) : BODY.gwTax([])), 'kr-job-training': () => reply(BODY.job([]), { type: 'application/xml' })
  };
  const modes = {
    http400: () => reply('{"error":"bad ' + MARK + '"}', { status: 400 }), http403: () => reply('forbidden ' + MARK, { status: 403 }),
    http404: () => reply('<html>404 ' + MARK + '</html>', { status: 404, type: 'text/html' }), http429: () => reply('{"error":"too many ' + MARK + '"}', { status: 429 }),
    http502: () => reply('<html>bad gateway ' + MARK + '</html>', { status: 502, type: 'text/html' }), http503: () => reply('unavailable ' + MARK, { status: 503 }),
    emptyBody: () => reply(''), html200: () => reply('<!DOCTYPE html><html><body>maintenance ' + MARK + '</body></html>', { type: 'text/html' })
  };
  for (const [mode, fn] of Object.entries(modes)) {
    for (const id of IDS) {
      const h = handler(KEYS, upstream({ [id]: fn }));
      const r = await call(h, REQ[id]);
      if (r.statusCode === 200) {
        /* a provider may legitimately treat an empty/blank upstream answer as "no results" — but never invent rows */
        assert.ok(['emptyBody'].includes(mode), `${id} ${mode} must not succeed`);
        assert.equal(r.json().items.length, 0, `${id} ${mode}`);
        continue;
      }
      assert.ok([502, 503, 504].includes(r.statusCode), `${id} ${mode} → ${r.statusCode}`);
      const b = r.json();
      assert.ok(FIXED_CODES.includes(b.code), `${id} ${mode} code ${b.code}`);
      assert.deepEqual(Object.keys(b).sort(), ['code', 'error', 'ok']);
      assert.doesNotMatch(r.body, new RegExp(MARK + '|<html|stack'), `${id} ${mode}`);
      if (mode === 'http429') assert.ok(['UPSTREAM_LIMIT', 'UPSTREAM_ERROR'].includes(b.code), `${id} 429 → controlled code, not a crash`);
    }
  }
  for (const id of IDS) {
    const h = handler(KEYS, upstream({ [id]: EMPTY[id] }));
    const r = await call(h, REQ[id]);
    assert.equal(r.statusCode, 200, id + ' empty'); assert.deepEqual(r.json().items, [], id + ' empty items');
  }
});

