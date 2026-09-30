/*
 * 고용24 국민내일배움카드 훈련과정 API (한국고용정보원) — OpenAPI adapter, server only.
 *
 * Source of every name below (checked 2026-09-29):
 *   공공데이터포털 https://www.data.go.kr/data/15109032/openapi.do
 *     「한국고용정보원_직업훈련_국민내일배움카드 훈련과정」 · 제공기관 한국고용정보원 · API 유형 LINK (→ 고용24 OpenAPI)
 *     데이터포맷 XML · 이용허락범위 제한 없음 · 비용 무료 · 개발단계 자동승인 / 운영단계 심의승인
 *     신청 가능 트래픽 "해당 기관의 정책에 따라 상이" (no number published) · 수정일 2025-07-18
 *   고용24 OPEN-API https://www.work24.go.kr/cm/e/a/0110/selectOpenApiSvcInfo.do (국민내일배움카드 훈련과정)
 *     이용절차: 고용24 기업회원 → 인증키 신청 → 담당자 심사 후 발급. "결과 데이터는 XML 방식(UTF-8)".
 *     1. 목록        https://www.work24.go.kr/cm/openApi/call/hr/callOpenApiSvcInfo310L01.do
 *        요청: authKey, returnType(XML|JSON), outType=1, pageNum(최대 1000), pageSize(최대 100), srchTraStDt/srchTraEndDt
 *              (훈련시작일 From/To, 필수), sort(ASC|DESC), sortCol(1 훈련기관명 · 2 훈련시작일 · 3 취업률 · 5 만족도),
 *              선택: srchTraArea1(지역 대분류), crseTracseSe(훈련유형), srchTraGbn(훈련구분), srchTraProcessNm(과정명),
 *              srchTraOrganNm(기관명), wkendSe, srchNcs1-4, srchTraArea2, srchTraType
 *        출력: <HRDNet><scn_cnt/><pageNum/><pageSize/><srchList><scn_list> address, certificate, contents, courseMan(수강비),
 *              eiEmplCnt3/eiEmplRate3/eiEmplRate6(취업률), grade, instCd, ncsCd, realMan(실제 훈련비), regCourseMan(수강신청 인원),
 *              stdgScor(만족도), subTitle(부 제목), subTitleLink, telNo, title(제목), titleIcon, titleLink(제목 링크),
 *              traStartDate/traEndDate(훈련시작/종료일자), trainTarget(훈련대상), trainTargetCd(훈련구분), trainstCstId(훈련기관ID),
 *              trngAreaCd(지역코드 중분류), trprDegr(훈련과정 순차), trprId(훈련과정ID), wkendSe(주말/주중 구분), yardMan(정원)
 *     2. 과정/기관정보 https://www.work24.go.kr/cm/openApi/call/hr/callOpenApiSvcInfo310L02.do
 *        요청: authKey, returnType, outType=2, srchTrprId, srchTrprDegr, srchTorgId (모두 필수)
 *        출력: <inst_base_info> inoNm(훈련기관명), addr1/addr2, hpAddr(홈페이지 주소), trprNm, trtm(총 훈련시간), trDcnt(총 훈련일수),
 *              instPerTrco(실제 훈련비), perTrco(정부지원금), ncsNm, trprTargetNm …  <inst_detail_info> tgcrGnrlTrneOwepAllt(본인부담액),
 *              govBusiNm(훈련분야명), totTraingTime, totTraingDyct … (+ 담당자 이름/이메일/전화, 시설·장비 목록)
 *     Error responses (observed without a valid key): HTTP 200 with <GO24><error>…</error></GO24> or {"error":"…"}.
 *
 * What LIVON deliberately does NOT use, even though the API returns it:
 *   취업률·취업인원 (eiEmpl*, sortCol 3), 만족도 (stdgScor, sortCol 5), grade / torgParGrad (등급), regCourseMan (수강신청 인원 →
 *   would read as popularity / seats), contents / titleIcon (meaning not documented), 담당자 이름·이메일·전화 (personal data),
 *   시설·장비 목록. None of it is stored, cached or returned.
 * NOT in the API at all: 모집·신청 기간, 신청 URL, 잔여석, 후기·평점. → no "모집중", no "신청하기"; the documented
 *   titleLink (고용24 course page) is labelled "고용24 과정 상세 보기". 훈련기관명 is documented only in the 과정/기관정보 API,
 *   so it is shown after the user opens a course (subTitle is kept verbatim as a subtitle, without a label).
 */
import { createHash } from 'node:crypto';

export const PROVIDER_ID = 'kr-job-training';
export const PROVIDER_NAME = '고용24 국민내일배움카드 훈련과정';
export const ENV_KEY = 'WORK24_TRAINING_API_KEY';
export const UPSTREAM_LIST = 'https://www.work24.go.kr/cm/openApi/call/hr/callOpenApiSvcInfo310L01.do';     // fixed
export const UPSTREAM_DETAIL = 'https://www.work24.go.kr/cm/openApi/call/hr/callOpenApiSvcInfo310L02.do';   // fixed
export const DATASET_URL = 'https://www.data.go.kr/data/15109032/openapi.do';
export const API_DOC_URL = 'https://www.work24.go.kr/cm/e/a/0110/selectOpenApiIntro.do';
export const LICENSE = '고용24 OpenAPI (한국고용정보원) · 공공데이터포털 이용허락범위 제한 없음';
export const ATTRIBUTION = '출처: 고용24 국민내일배움카드 훈련과정 (한국고용정보원)';

export const LIMITS = Object.freeze({ maxPage: 50, maxSize: 50, defaultSize: 20 });
export const PERIODS = Object.freeze([30, 90, 180]);          /* 훈련시작일 window (days from today, KST) */
export const DEFAULT_PERIOD = 90;
export const TTL = Object.freeze({ list: 6 * 3600e3, detail: 24 * 3600e3 });

/* documented code tables (고용24 목록 API 요청 Parameters) */
export const AREA = Object.freeze({
  서울: '11', 부산: '26', 대구: '27', 인천: '28', 광주: '12', 전남: '12', 전남광주: '12', 대전: '30', 울산: '31', 세종: '36',
  경기: '41', 충북: '43', 충남: '44', 전북: '45', 경북: '47', 경남: '48', 제주: '50', 강원: '51'
});
export const METHOD = Object.freeze({ offline: 'M1001', online: 'M1005', blended: 'M1010', smart: 'M1014' });
export const METHOD_LABEL = Object.freeze({ M1001: '일반과정', M1005: '인터넷과정', M1010: '혼합과정(BL)', M1014: '스마트혼합훈련' });
const METHOD_MODE = { M1001: 'offline', M1005: 'online', M1010: 'both', M1014: 'both' };
export const TRAINING_TYPES = Object.freeze({
  C0061: '국민내일배움카드(일반)', C0061S: '국민내일배움카드(주 훈련대상 : 구직자)', C0061I: '국민내일배움카드(주 훈련대상 : 재직자)',
  C0054: '국가기간전략산업직종', C0055C: '과정평가형훈련', C0054G: '기업맞춤형훈련', C0054Y: '스마트혼합훈련', C0054S: '일반고특화훈련',
  C0104: 'K-디지털 트레이닝', C0105: 'K-디지털 기초역량훈련', C0102: '산업구조변화대응', C0055: '실업자 원격훈련', C0031: '근로자 원격훈련',
  C0031C: '돌봄서비스훈련', C0031F: '근로자 외국어훈련'
});
export const WEEKEND = Object.freeze({ 1: '주말', 2: '주말·주중 혼합', 3: '주중' });   /* 9 해당없음 → not shown */
const SIDO = {
  서울특별시: '서울', 부산광역시: '부산', 대구광역시: '대구', 인천광역시: '인천', 광주광역시: '광주', 대전광역시: '대전', 울산광역시: '울산', 세종특별자치시: '세종',
  경기도: '경기', 강원도: '강원', 강원특별자치도: '강원', 충청북도: '충북', 충청남도: '충남', 전라북도: '전북', 전북특별자치도: '전북', 전라남도: '전남',
  경상북도: '경북', 경상남도: '경남', 제주특별자치도: '제주'
};
/* only the official course pages are linked (no arbitrary host from the payload becomes a CTA) */
const LINK_HOSTS = ['www.work24.go.kr', 'work24.go.kr', 'www.hrd.go.kr', 'hrd.go.kr'];

const str = v => (v == null ? '' : String(v)).trim();
function fail(code) { return Object.assign(new Error('upstream'), { code }); }
function bad() { return Object.assign(new Error('bad'), { code: 'BAD_REQUEST' }); }

/* ───────── field helpers ───────── */
export function ymd(v) {
  const m = /^(\d{4})[-.]?(\d{2})[-.]?(\d{2})$/.exec(str(v));
  if (!m) return null;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  return y < 1990 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31 ? null : `${m[1]}-${m[2]}-${m[3]}`;
}
export function text(v, max = 300) {
  /* HTML-looking tags are removed; other angle brackets ("<실무> 과정") lose only the brackets */
  const s = str(v).replace(/<(script|style)[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<\/?[A-Za-z!][^>]*>/g, ' ').replace(/[<>]/g, ' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‪-‮⁦-⁩]/g, '').replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
/* any explicit http(s) URL with a real host (institution homepages from the detail API) */
export function webUrl(v) {
  const s = str(v);
  if (!/^https?:\/\//i.test(s)) return '';
  try {
    const u = new URL(s);
    return (u.protocol === 'https:' || u.protocol === 'http:') && !u.username && !u.password && /^([a-z0-9-]+\.)+[a-z][a-z0-9-]+$/i.test(u.hostname) ? u.href : '';
  } catch { return ''; }
}
/* the course page link: official 고용24 / HRD-Net hosts only */
export function courseUrl(v) { const u = webUrl(v); return u && LINK_HOSTS.includes(new URL(u).hostname.toLowerCase()) ? u : ''; }
/* money fields exactly as given: digits only → a number (원). "0" stays 0 — never rewritten as "무료". */
export function amount(v) { const s = str(v).replace(/,/g, ''); return /^\d{1,10}$/.test(s) ? Number(s) : null; }
export function regionOf(addr) { return SIDO[str(addr).split(/\s+/)[0]] || null; }
const idPart = (v, re) => (re.test(str(v)) ? str(v) : '');
export function courseKey(r) {
  const id = idPart(r.trprId, /^[A-Za-z0-9]{1,30}$/), degr = idPart(r.trprDegr, /^\d{1,4}$/), torg = idPart(r.trainstCstId, /^[A-Za-z0-9]{1,30}$/);
  return id && degr ? { id, degr, torg } : null;
}
export function providerIdOf(k) { return k.id + '_' + k.degr + (k.torg ? '_' + k.torg : ''); }
/* parse "AIG2023…_3_500020…" back into its three official parts (strict; anything else is a bad request) */
export function parseId(v) {
  const m = /^([A-Za-z0-9]{1,30})_(\d{1,4})_([A-Za-z0-9]{1,30})$/.exec(str(v));
  return m ? { id: m[1], degr: m[2], torg: m[3] } : null;
}

/* ───────── XML (documented format) → flat records ───────── */
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function decode(s) {
  return String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, e) => {
      if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : ''; }
      return ENT[e.toLowerCase()] || '';
    });
}
/* leaf elements of one block: <tag>value</tag> and <tag/> ; nested blocks are ignored */
function leaves(block) {
  const out = {};
  const re = /<([A-Za-z_][\w]*)\s*(?:\/>|>((?:(?!<[A-Za-z_])[\s\S])*?)<\/\1\s*>)/g;
  let m;
  while ((m = re.exec(block))) if (!(m[1] in out)) out[m[1]] = m[2] == null ? '' : decode(m[2]);
  return out;
}
function blocks(xml, tag) {
  const out = []; const re = new RegExp('<' + tag + '\\b[^>]*>([\\s\\S]*?)</' + tag + '\\s*>', 'g'); let m;
  while ((m = re.exec(xml)) && out.length < 200) out.push(m[1]);
  return out;
}
function errorCode(msg) {
  const t = str(msg);
  if (/초과|한도|횟수|LIMIT/i.test(t)) return 'QUOTA';
  if (/인증키|OpenApi 서비스|권한|승인|KEY/i.test(t)) return 'HTTP_4XX';
  return 'PARSE';
}
/* documented XML (or the JSON error shape) → rows; any error body becomes a fixed code and is discarded */
export function parseList(body) {
  const t = str(body);
  if (!t) throw fail('PARSE');
  if (t[0] === '{') {
    let o; try { o = JSON.parse(t); } catch { throw fail('PARSE'); }
    throw fail(o && typeof o.error === 'string' ? errorCode(o.error) : 'PARSE');   /* LIVON requests XML; JSON is an error shape only */
  }
  const err = /<error>([\s\S]*?)<\/error>/i.exec(t);
  if (err) throw fail(errorCode(decode(err[1])));
  if (!/<HRDNet\b/i.test(t)) throw fail('PARSE');
  const cnt = /<scn_cnt>\s*(\d{1,9})\s*<\/scn_cnt>/.exec(t);
  const rows = blocks(t, 'scn_list').map(leaves);
  return { rows, total: cnt ? Number(cnt[1]) : rows.length ? null : 0 };
}
export function parseDetail(body) {
  const t = str(body);
  if (!t) throw fail('PARSE');
  if (t[0] === '{') { let o; try { o = JSON.parse(t); } catch { throw fail('PARSE'); } throw fail(o && typeof o.error === 'string' ? errorCode(o.error) : 'PARSE'); }
  const err = /<error>([\s\S]*?)<\/error>/i.exec(t);
  if (err) throw fail(errorCode(decode(err[1])));
  if (!/<HRDNet\b/i.test(t)) throw fail('PARSE');
  const base = blocks(t, 'inst_base_info')[0], det = blocks(t, 'inst_detail_info')[0];
  return base || det ? { base: base ? leaves(base) : {}, detail: det ? leaves(det) : {} } : null;
}

/* ───────── one list row → LIVON program (validated later by the shared schema) ───────── */
export function toEntity(r, fetchedAt) {
  if (!r || typeof r !== 'object') return null;
  const k = courseKey(r);
  const title = text(r.title, 200);
  if (!k || !title) return null;
  const start = ymd(r.traStartDate), end = ymd(r.traEndDate);
  const addr = text(r.address, 300);
  const cd = str(r.trainTargetCd).toUpperCase();
  const methodLabel = METHOD_LABEL[cd] || '';
  const link = courseUrl(r.titleLink);
  const cap = /^\d{1,6}$/.test(str(r.yardMan)) ? Number(str(r.yardMan)) : null;
  const courseFee = amount(r.courseMan), realFee = amount(r.realMan);
  const target = text(r.trainTarget, 60);
  return {
    type: 'program',
    provider: PROVIDER_ID,
    providerId: providerIdOf(k),
    title,
    summary: null,
    description: null,
    category: null,                          /* no LIVON category is invented; NCS code kept as given below */
    tags: [target, methodLabel].filter(Boolean),
    interests: [],
    lifeStages: [],                          /* never an age group */
    organizer: null,                         /* 훈련기관명 is documented only in the 과정/기관정보 API (added when a user opens it) */
    format: methodLabel || null,             /* 훈련구분 code → its documented label */
    capacity: cap,                           /* 정원 (not remaining seats) */
    registrationStart: null, registrationEnd: null, registrationUrl: null,   /* not in the API */
    schedule: start ? { startAt: start, endAt: end || start, timezone: 'Asia/Seoul' } : null,
    pricing: null,                           /* fee fields keep their own official names in metadata */
    location: addr ? { country: 'KR', region: regionOf(addr), address: addr } : null,
    contact: { phone: text(r.telNo, 40) || null },
    source: { providerName: PROVIDER_NAME, sourceUrl: link || null, fetchedAt, updatedAt: null, license: LICENSE, attribution: ATTRIBUTION },
    metadata: {
      freshness: 'fetched-only',            /* the API has no update/reference date → never shown as a check date */
      linkKind: link ? 'course-detail' : '',
      subTitle: text(r.subTitle, 120),
      trainTarget: target,
      methodCode: methodLabel ? cd : '',
      methodMode: METHOD_MODE[cd] || '',
      weekend: WEEKEND[str(r.wkendSe)] || '',
      courseFee: courseFee == null ? '' : courseFee,
      realFee: realFee == null ? '' : realFee,
      certificate: text(r.certificate, 120),
      ncsCd: idPart(r.ncsCd, /^[0-9A-Za-z]{1,20}$/),
      trprId: k.id, trprDegr: k.degr, torgId: k.torg,
      instCd: idPart(r.instCd, /^[0-9A-Za-z]{1,30}$/)
    }
  };
}
/* the 과정/기관정보 answer for one course → the same program id, with only the documented detail fields */
export function toDetailEntity(d, key, fetchedAt) {
  if (!d) return null;
  const b = d.base || {}, x = d.detail || {};
  const title = text(b.trprNm || x.trprNm, 200);
  if (!title) return null;
  const addr = text([str(b.addr1), str(b.addr2)].filter(Boolean).join(' '), 300);
  const home = webUrl(b.hpAddr);
  const hours = /^\d{1,5}$/.test(str(b.trtm)) ? Number(str(b.trtm)) : /^\d{1,5}$/.test(str(x.totTraingTime)) ? Number(str(x.totTraingTime)) : null;
  const days = /^\d{1,4}$/.test(str(b.trDcnt)) ? Number(str(b.trDcnt)) : /^\d{1,4}$/.test(str(x.totTraingDyct)) ? Number(str(x.totTraingDyct)) : null;
  const val = v => { const n = amount(v); return n == null ? '' : n; };
  return {
    type: 'program', provider: PROVIDER_ID, providerId: providerIdOf(key), title,
    organizer: text(b.inoNm, 120) || null,
    location: addr ? { country: 'KR', region: regionOf(addr), address: addr } : null,
    contact: { website: home || null },
    source: { providerName: PROVIDER_NAME, sourceUrl: null, fetchedAt, updatedAt: null, license: LICENSE, attribution: ATTRIBUTION },
    metadata: {
      freshness: 'fetched-only', detail: true,
      institution: text(b.inoNm, 120),
      totalHours: hours == null ? '' : hours, totalDays: days == null ? '' : days,
      detailRealFee: val(b.instPerTrco), govSupport: val(b.perTrco), selfPay: val(x.tgcrGnrlTrneOwepAllt),
      ncsName: text(b.ncsNm, 80), trainingField: text(x.govBusiNm, 80), courseTarget: text(b.trprTargetNm, 60)
    }
  };
}

/* ───────── request parameters (allowlist; everything else is a 400 at the route) ───────── */
export function parseParams({ query, org, region, method, type, period, id, page, limit } = {}) {
  const has = v => v != null && v !== '';
  if (has(id)) {
    if ([query, org, region, method, type, period].some(has)) throw bad();
    const k = parseId(id); if (!k) throw bad();
    return { kind: 'detail', key: k, page: 1, size: 1 };
  }
  const out = { kind: 'list', page: 1, size: LIMITS.defaultSize, period: DEFAULT_PERIOD };
  if (has(page)) { if (!/^\d{1,4}$/.test(String(page)) || +page < 1) throw bad(); out.page = Math.min(+page, LIMITS.maxPage); }
  if (has(limit)) { if (!/^\d{1,4}$/.test(String(limit)) || +limit < 1) throw bad(); out.size = Math.min(+limit, LIMITS.maxSize); }
  const words = (v, field) => {
    const q = String(v).replace(/\s+/g, ' ').trim();
    if (!q || q.length > 50 || /[\u0000-\u001f\u007f<>&%]/.test(q)) throw bad();
    out[field] = q;
  };
  if (has(query)) words(query, 'query');
  if (has(org)) words(org, 'org');
  if (has(region)) { if (!Object.prototype.hasOwnProperty.call(AREA, region)) throw bad(); out.region = region; }
  if (has(method)) { if (!Object.prototype.hasOwnProperty.call(METHOD, method)) throw bad(); out.method = method; }
  if (has(type)) { if (!Object.prototype.hasOwnProperty.call(TRAINING_TYPES, type)) throw bad(); out.type = type; }
  if (has(period)) { if (!PERIODS.includes(Number(period)) || !/^\d{2,3}$/.test(String(period))) throw bad(); out.period = Number(period); }
  return out;
}
const kst = ms => new Date(ms + 9 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '');
export function searchWindow(p, now = Date.now()) { return { from: kst(now), to: kst(now + p.period * 864e5) }; }
export function cacheKey(p, now = Date.now()) {
  const w = p.kind === 'list' ? searchWindow(p, now) : null;
  const basis = JSON.stringify({ p, w });
  return 'livon:data:v1:' + PROVIDER_ID + ':' + createHash('sha256').update(basis).digest('hex').slice(0, 40);
}
export function ttl(p) { return p.kind === 'detail' ? TTL.detail : TTL.list; }

export function listUrl(key, p, now = Date.now()) {
  const u = new URL(UPSTREAM_LIST), w = searchWindow(p, now);
  u.searchParams.set('authKey', str(key));
  u.searchParams.set('returnType', 'XML');
  u.searchParams.set('outType', '1');
  u.searchParams.set('pageNum', String(p.page));
  u.searchParams.set('pageSize', String(p.size));
  u.searchParams.set('srchTraStDt', w.from);
  u.searchParams.set('srchTraEndDt', w.to);
  u.searchParams.set('sort', 'ASC');
  u.searchParams.set('sortCol', '2');                 /* 훈련시작일 — never 취업률(3) / 만족도(5) */
  if (p.region) u.searchParams.set('srchTraArea1', AREA[p.region]);
  if (p.type) u.searchParams.set('crseTracseSe', p.type);
  if (p.method) u.searchParams.set('srchTraGbn', METHOD[p.method]);
  if (p.query) u.searchParams.set('srchTraProcessNm', p.query);
  if (p.org) u.searchParams.set('srchTraOrganNm', p.org);
  return u.href;
}
export function detailUrl(key, k) {
  const u = new URL(UPSTREAM_DETAIL);
  u.searchParams.set('authKey', str(key));
  u.searchParams.set('returnType', 'XML');
  u.searchParams.set('outType', '2');
  u.searchParams.set('srchTrprId', k.id);
  u.searchParams.set('srchTrprDegr', k.degr);
  u.searchParams.set('srchTorgId', k.torg);
  return u.href;
}

async function get(fetcher, url, timeoutMs) {
  let res;
  try { res = await fetcher(url, { method: 'GET', headers: { accept: 'application/xml' }, redirect: 'error', signal: AbortSignal.timeout(timeoutMs) }); }
  catch (err) { throw fail(err && (err.name === 'TimeoutError' || err.name === 'AbortError') ? 'TIMEOUT' : 'NETWORK'); }
  const body = await res.text();
  if (body.length > 5_000_000) throw fail('INVALID_DATA');
  if (!res.ok) throw fail(res.status >= 500 ? 'HTTP_5XX' : 'HTTP_4XX');
  return body;
}

/* one upstream page (list) or one course (detail) per request — the route caches the normalized answer */
export async function search({ key, fetcher, params: p, timeoutMs = 8000, now = Date.now() }) {
  const fetchedAt = new Date(now).toISOString();
  if (p.kind === 'detail') {
    const d = parseDetail(await get(fetcher, detailUrl(key, p.key), timeoutMs));
    const e = toDetailEntity(d, p.key, fetchedAt);
    return { items: e ? [e] : [], total: e ? 1 : 0, hasMore: false, fetchedAt };
  }
  const r = parseList(await get(fetcher, listUrl(key, p, now), timeoutMs));
  const seen = new Set(), items = [];
  for (const row of r.rows) {
    const e = toEntity(row, fetchedAt);
    if (!e || seen.has(e.providerId)) continue;
    seen.add(e.providerId); items.push(e);
  }
  const total = r.total;
  const hasMore = p.page < LIMITS.maxPage && (total != null ? p.page * p.size < total : r.rows.length >= p.size);
  return { items, total, hasMore, fetchedAt };
}
