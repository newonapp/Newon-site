/*
 * FIXTURE — test-only upstream responses for the 8 LIVON public-data providers, built from the documented field names
 * (same shapes as the per-provider tests). Titles are marked [QA 픽스처]. Never shipped (tests/ is not published).
 * One fake fetcher answers every provider host, so the whole chain can run: upstream → server provider → /api/livon/data
 * → real-data schema → Data Platform normalizer → repository → screens.
 */
const DAY = 864e5;
const kst = n => new Date(Date.now() + n * DAY + 9 * 3600e3);
export const ymd = n => kst(n).toISOString().slice(0, 10).replace(/-/g, '');
export const dash = n => kst(n).toISOString().slice(0, 10);

export const youthRow = (o = {}) => Object.assign({
  plcyNo: 'R2026010100001', plcyNm: '[QA 픽스처] 청년 월세 한시 특별지원', plcyKywdNm: '월세,주거지원',
  plcyExplnCn: '무주택 청년에게 월세를 지원합니다.', lclsfNm: '주거', mclsfNm: '주거비 지원', plcySprtCn: '월 최대 20만원, 최대 12개월',
  sprvsnInstCdNm: '국토교통부', operInstCdNm: '주택도시보증공사', aplyUrlAddr: 'https://www.bokjiro.go.kr/', refUrlAddr1: 'https://www.molit.go.kr/',
  sprtTrgtMinAge: '19', sprtTrgtMaxAge: '34', sprtTrgtAgeLmtYn: 'Y', earnEtcCn: '기준 중위소득 60% 이하', addAplyQlfcCndCn: '무주택자',
  aplyYmd: `${ymd(-30)} ~ ${ymd(60)}`, zipCd: '11000', frstRegDt: '2026-01-02 09:00:00', lastMdfcnDt: '2026-09-20 10:30:00', inqCnt: '99999', sprvsnInstCd: 'B551234'
}, o);
export const youthBody = rows => JSON.stringify({ resultCode: 200, result: { pagging: { totCount: rows.length, pageNum: 1, pageSize: 100 }, youthPolicyList: rows } });

export const bizSupportItem = (o = {}) => Object.assign({
  title: '[QA 픽스처] 2026년 예비창업패키지 참여자 모집', link: 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000100001',
  seq: 'PBLN_000000000100001', author: '중소벤처기업부', excInsttNm: '창업진흥원', description: '예비창업자의 사업화를 지원합니다.', lcategory: '창업',
  pubDate: '2026-09-01 10:00:00', reqstDt: `${ymd(-10)} ~ ${ymd(20)}`, trgetNm: '예비창업자', inqireCo: '4321', hashTags: '2026,창업,서울,중소벤처기업부', totCnt: '1',
  pblancNm: '[QA 픽스처] 2026년 예비창업패키지 참여자 모집', pblancUrl: 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000100001',
  pblancId: 'PBLN_000000000100001', jrsdInsttNm: '중소벤처기업부', bsnsSumryCn: '예비창업자의 사업화 자금과 교육을 지원합니다.',
  reqstMthPapersCn: 'K-Startup 온라인 신청', refrncNm: '창업진흥원', rceptEngnHmpgUrl: 'https://www.k-startup.go.kr/',
  pldirSportRealmLclasCodeNm: '창업', creatPnttm: '2026-09-01 10:00:00', reqstBeginEndDe: `${ymd(-10)} ~ ${ymd(20)}`
}, o);
export const bizEventItem = (o = {}) => Object.assign({
  seq: 'EVEN_000000000100001', title: '[QA 픽스처] 2026 창업 사업설명회 개최 안내', areaNm: '전국', eventType: '사업설명회',
  description: '예비창업자와 초기 창업기업을 위한 지원사업 설명회를 개최합니다.', originOrg: '창업진흥원',
  rceptPd: `${dash(-5)} ~ ${dash(5)}`, originUrl: 'https://www.kised.or.kr/board/notice/1', eventPeriod: `${ymd(10)} ~ ${ymd(10)}`, inqireCo: '98765', lcategory: '경영@창업',
  bizinfoUrl: 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C127/AX/210/view.do?eventInfoId=EVEN_000000000100001', registDe: '20260915',
  hashTags: '2026,경영,창업', totCnt: '1', eventInfoId: 'EVEN_000000000100001', nttNm: '[QA 픽스처] 2026 창업 사업설명회 개최 안내', eventInfoTyNm: '사업설명회',
  nttCn: '예비창업자와 초기 창업기업을 위한 지원사업 설명회를 개최합니다.', originEngnNm: '창업진흥원', originUrlAdres: 'https://www.kised.or.kr/board/notice/1',
  BeginEndDe: `${ymd(10)} ~ ${ymd(10)}`, pldirSportRealmLclasCodeNm: '경영@창업'
}, o);
const bizChannel = items => JSON.stringify({ jsonArray: { title: '기업마당', link: 'https://www.bizinfo.go.kr/', description: '', language: 'ko-kr', item: items } });
export const bizBody = bizChannel;

export const lifelongRow = (o = {}) => Object.assign({
  lctreNm: '[QA 픽스처] 시니어 스마트폰 교실', instrctrNm: '김수미', edcStartDay: dash(10), edcEndDay: dash(70), edcStartTime: '10:10', edcColseTime: '10:50',
  lctreCo: '스마트폰 기초 과정', edcTrgetType: '시민', edcMthType: '오프라인', operDay: '월+화', edcPlace: '3층 강의실', psncpa: '15', lctreCost: '0',
  edcRdnmadr: '대구광역시 동구 아양로 1', operInstitutionNm: '동구평생학습관', operPhoneNumber: '053-000-0000',
  rceptStartDate: dash(-3), rceptEndDate: dash(5), rceptMthType: '온라인', slctnMthType: '선착순', homepageUrl: 'https://www.example.go.kr/lifelong/',
  oadtCtLctreYn: 'N', pntBankAckestYn: 'N', lrnAcnutAckestYn: 'N', referenceDate: '2026-07-14', instt_code: '5310000'
}, o);
export const lifelongBody = rows => JSON.stringify({ response: { header: { resultCode: '00', resultMsg: 'NORMAL SERVICE.' }, body: { items: rows, totalCount: rows.length, numOfRows: 1000, pageNo: 1 } } });

export const kakaoDoc = (o = {}) => Object.assign({
  id: '26338954', place_name: '[QA 픽스처] 마포 중앙도서관', category_name: '문화,예술 > 문화시설 > 도서관', category_group_code: 'CT1', category_group_name: '문화시설',
  phone: '02-3153-5800', address_name: '서울 마포구 성산동 370-1', road_address_name: '서울 마포구 성산로 128', x: '126.9084', y: '37.5636',
  place_url: 'http://place.map.kakao.com/26338954', distance: ''
}, o);
export const kakaoBody = docs => JSON.stringify({ meta: { same_name: null, total_count: docs.length, pageable_count: docs.length, is_end: true }, documents: docs });

export const tourItem = (o = {}) => Object.assign({
  contentid: '126508', contenttypeid: '12', title: '[QA 픽스처] 경복궁', addr1: '서울특별시 종로구 사직로 161', addr2: '(세종로)', zipcode: '03045',
  mapx: '126.9769930325', mapy: '37.5788222356', mlevel: '6', tel: '02-3700-3900', cpyrhtDivCd: 'Type3', lDongRegnCd: '11', lDongSignguCd: '110',
  lclsSystm1: 'HS', lclsSystm2: 'HS01', lclsSystm3: 'HS010100', createdtime: '20031105090000', modifiedtime: '20250909101010'
}, o);
export const tourBody = items => JSON.stringify({ response: { header: { resultCode: '0000', resultMsg: 'OK' }, body: { items: items.length ? { item: items } : '', numOfRows: 20, pageNo: 1, totalCount: items.length } } });

export const taxDaegu = (o = {}) => Object.assign({ EMD_NM: '신암1동', LNDCTN_NM: '[QA 픽스처] 가세무', TELNO: '053-000-0001' }, o);
export const taxIncheon = (o = {}) => Object.assign({ 구분: '연수구', 세무사명: '[QA 픽스처] 나세무', 활동마을: '송도1동, 송도2동' }, o);
export const gwOk = rows => JSON.stringify({ response: { header: { resultCode: '00', resultMsg: 'NORMAL SERVICE.' }, body: { items: { item: rows }, totalCount: rows.length, numOfRows: 100, pageNo: 1 } } });
export const odOk = rows => JSON.stringify({ page: 1, perPage: 100, totalCount: rows.length, currentCount: rows.length, matchCount: rows.length, data: rows });

export const ENV = {
  YOUTHCENTER_API_KEY: 'yc-fixture-key', BIZINFO_API_KEY: 'bz-fixture-key', KAKAO_REST_API_KEY: 'kk-fixture-key', TOURAPI_SERVICE_KEY: 'tr-fixture-key',
  PUBLIC_DATA_SERVICE_KEY: 'pd-fixture-key', WORK24_TRAINING_API_KEY: 'w24-fixture-key'
};
const reply = (text, { status = 200, type = 'application/json' } = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => type }, text: async () => text, json: async () => JSON.parse(text) });

/* one fake upstream for all providers; `bodies` overrides a provider's answer (function (url) → text | Error | {status}) */
export function fakeUpstream(bodies = {}) {
  const calls = [];
  const route = [
    ['youth', 'https://www.youthcenter.go.kr/', () => youthBody([youthRow()])],
    ['bizEvent', 'https://www.bizinfo.go.kr/uss/rss/bizinfoEventApi.do', () => bizBody([bizEventItem()])],
    ['bizSupport', 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do', () => bizBody([bizSupportItem()])],
    ['lifelong', 'https://api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api', () => lifelongBody([lifelongRow()])],
    ['kakao', 'https://dapi.kakao.com/', () => kakaoBody([kakaoDoc()])],
    ['tour', 'https://apis.data.go.kr/B551011/', () => tourBody([tourItem()])],
    ['taxDaegu', 'https://apis.data.go.kr/3420000/', () => gwOk([taxDaegu()])],
    ['taxIncheon', 'https://api.odcloud.kr/', () => odOk([taxIncheon()])],
    ['job', 'https://www.work24.go.kr/', () => '<?xml version="1.0" encoding="UTF-8"?><HRDNet><scn_cnt>0</scn_cnt><pageNum>1</pageNum><pageSize>10</pageSize><srchList></srchList></HRDNet>']
  ];
  const fetcher = async (url, init = {}) => {
    const u = String(url);
    const r = route.find(([, prefix]) => u.startsWith(prefix));
    if (!r) throw new Error('unexpected host ' + u);
    calls.push({ provider: r[0], url: u });
    const custom = bodies[r[0]];
    const out = custom ? custom(new URL(u), init) : r[2]();
    if (out instanceof Error) throw out;
    if (out && typeof out === 'object' && 'status' in out) return reply(out.body || '', out);
    return reply(out, { type: r[0] === 'job' ? 'application/xml' : 'application/json' });
  };
  return { fetcher, calls };
}
