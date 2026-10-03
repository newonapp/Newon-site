/*
 * 전국평생학습강좌표준데이터 (교육부 소관 · 지방자치단체/교육청 제공) — OpenAPI adapter, server only.
 *
 * Source of every name below (checked 2026-09-29):
 *   공공데이터포털 https://www.data.go.kr/data/15013110/standard.do  (수정일 2026-09-03 · 갱신주기 분기 · 분류 교육-평생·직업교육)
 *     "개별 기관이 등록한 데이터는 매월 초 병합하여 전국 단위로 제공"
 *   오픈 API 탭:
 *     요청주소      https://api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api
 *     활용승인 절차 개발단계 자동승인 / 운영단계 자동승인
 *     신청 가능 트래픽 개발계정 10,000 / 운영계정 활용사례 등록 시 증가 신청 가능
 *     요청변수      serviceKey, pageNo, numOfRows (최대 1000), type (xml|json) + every output field as an optional filter
 *     출력결과      lctreNm 강좌명, instrctrNm 강사명, edcStartDay/edcEndDay 교육시작/종료일자, edcStartTime/edcColseTime 교육시작/종료시각,
 *                   lctreCo 강좌내용, edcTrgetType 교육대상구분, edcMthType 교육방법구분, operDay 운영요일, edcPlace 교육장소,
 *                   psncpa 강좌정원수, lctreCost 수강료, edcRdnmadr 교육장도로명주소, operInstitutionNm 운영기관명,
 *                   operPhoneNumber 운영기관전화번호, rceptStartDate/rceptEndDate 접수시작/종료일자, rceptMthType 접수방법구분,
 *                   slctnMthType 선정방법구분, homepageUrl 홈페이지주소, oadtCtLctreYn 직업능력개발훈련비지원강좌여부,
 *                   pntBankAckestYn 학점은행제평가(학점)인정여부, lrnAcnutAckestYn 평생학습계좌제평가인정여부,
 *                   referenceDate 데이터기준일자, instt_code 제공기관코드
 *     에러코드      00 NORMAL_CODE, 03 NODATA_ERROR, 22 LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR, 30 SERVICE_KEY_IS_NOT_REGISTERED_ERROR …
 * NOT in the dataset: a course ID, a 분류(category) field, a 신청 URL, coordinates, remaining seats, ratings or reviews.
 *   → the ID is a composite hash of official fields; no LIVON category is assigned; homepageUrl is an institution page
 *     ("공식 안내 보기", never "신청"); nothing about availability/popularity is shown.
 * Whether the optional filter parameters match partially or exactly is not stated (확인 필요) — LIVON does not rely on them:
 * it reads a bounded window and filters it on the server.
 */
import { createHash } from 'node:crypto';

export const PROVIDER_ID = 'kr-lifelong-class';
export const PROVIDER_NAME = '전국평생학습강좌표준데이터';
export const ENV_KEY = 'PUBLIC_DATA_SERVICE_KEY';
export const UPSTREAM = 'https://api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api';   // fixed; clients can never choose it
export const DATASET_URL = 'https://www.data.go.kr/data/15013110/standard.do';
export const LICENSE = '공공데이터포털 전국평생학습강좌표준데이터 (교육부)';
export const ATTRIBUTION = '출처: 공공데이터포털 전국평생학습강좌표준데이터';

export const PAGE_ROWS = 1000;          /* official maximum numOfRows */
export const MAX_PAGES = 3;             /* bounded window: never a crawl of the whole dataset */
export const MAX_KEEP = 500;            /* entities returned to LIVON (upcoming / ongoing first) */

/* 교육방법구분 values named in the dataset description (온라인/오프라인/혼합/우편통신/모바일) → Explore mode */
export const METHOD_MODE = Object.freeze({ 온라인: 'online', 오프라인: 'offline', 혼합: 'both' });
/* 시/도 names as written in 도로명주소 → the short names LIVON's region filter uses (a spelling map, not a guess) */
const SIDO = {
  서울특별시: '서울', 부산광역시: '부산', 대구광역시: '대구', 인천광역시: '인천', 광주광역시: '광주', 대전광역시: '대전', 울산광역시: '울산', 세종특별자치시: '세종',
  경기도: '경기', 강원도: '강원', 강원특별자치도: '강원', 충청북도: '충북', 충청남도: '충남', 전라북도: '전북', 전북특별자치도: '전북', 전라남도: '전남',
  경상북도: '경북', 경상남도: '경남', 제주특별자치도: '제주'
};
export const REGIONS = Object.freeze([...new Set(Object.values(SIDO))]);

const str = v => (v == null ? '' : String(v)).trim();
/* extra: diagnostics only (upstream HTTP status / official result code digits) — never a key, URL or body */
function fail(code, extra) { return Object.assign(new Error('upstream'), { code }, extra || null); }
function bad() { return Object.assign(new Error('bad'), { code: 'BAD_REQUEST' }); }

/* ───────── field helpers ───────── */
export function ymd(v) {
  const m = /^(\d{4})-?(\d{2})-?(\d{2})$/.exec(str(v));
  if (!m) return null;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  return y < 1990 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31 ? null : `${m[1]}-${m[2]}-${m[3]}`;
}
export function hhmm(v) { const m = /^(\d{1,2}):(\d{2})$/.exec(str(v)); return m && +m[1] < 24 && +m[2] < 60 ? `${m[1].padStart(2, '0')}:${m[2]}` : ''; }
/* only an explicit http(s) URL counts; "성주군청 (sj.go.kr)" or "www.x.kr" stay text */
export function webUrl(v) {
  const s = str(v);
  if (!/^https?:\/\//i.test(s)) return '';
  try { const u = new URL(s); return (u.protocol === 'https:' || u.protocol === 'http:') && !u.username && !u.password && /\./.test(u.hostname) ? u.href : ''; } catch { return ''; }
}
export function text(v, max = 300) {
  const s = str(v).replace(/<(script|style)[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
export function regionOf(addr) { return SIDO[str(addr).split(/\s+/)[0]] || null; }
/* 수강료: a plain integer is kept as an amount (원 단위 is not stated in the spec → shown as "수강료 N원" with the raw value);
   anything else is kept only as a note. "0" is NOT rewritten as "무료". */
export function cost(v) {
  const s = str(v).replace(/,/g, '');
  if (/^\d{1,9}$/.test(s)) return { amount: Number(s), note: '' };
  return { amount: null, note: text(v, 80) };
}
/* stable composite id from official fields (no personal data such as 강사명 in the input) */
export function compositeId(r) {
  const basis = [str(r.instt_code), str(r.operInstitutionNm), str(r.lctreNm), str(r.edcStartDay), str(r.edcStartTime), str(r.edcPlace), str(r.operDay)].join('|');
  return 'lc' + createHash('sha256').update(basis).digest('hex').slice(0, 24);
}

/* ───────── one API row → LIVON program candidate (validated later by the shared schema) ───────── */
export function toEntity(r, fetchedAt) {
  if (!r || typeof r !== 'object') return null;
  const title = text(r.lctreNm, 200);
  const start = ymd(r.edcStartDay);
  if (!title || !str(r.operInstitutionNm)) return null;
  const end = ymd(r.edcEndDay);
  const t1 = hhmm(r.edcStartTime), t2 = hhmm(r.edcColseTime);
  const days = text(r.operDay, 60);
  const method = text(r.edcMthType, 20);
  const rs = ymd(r.rceptStartDate), re = ymd(r.rceptEndDate);
  const fee = cost(r.lctreCost);
  const cap = /^\d{1,6}$/.test(str(r.psncpa)) ? Number(str(r.psncpa)) : null;
  const home = webUrl(r.homepageUrl);
  const addr = text(r.edcRdnmadr, 300);
  const time = t1 && t2 ? `${t1}~${t2}` : t1 || '';
  return {
    type: 'program',
    provider: PROVIDER_ID,
    providerId: compositeId(r),
    title,
    summary: text(r.lctreCo, 300) || null,
    description: text(r.lctreCo, 2000) || null,
    category: null,                                   /* the dataset has no 분류 field — no LIVON category is invented */
    tags: [method, text(r.edcTrgetType, 40)].filter(Boolean),
    interests: [],
    lifeStages: [],                                   /* 교육대상구분 is free text ("성인", "초4~6") — never turned into an age group */
    organizer: text(r.operInstitutionNm, 120),
    instructor: text(r.instrctrNm, 80) || null,
    eligibility: text(r.edcTrgetType, 80) || null,    /* 교육대상구분 as given */
    format: method || null,                           /* 교육방법구분 as given */
    venue: text(r.edcPlace, 120) || null,
    days: days || null,
    timeText: time || null,
    applyMethod: text(r.rceptMthType, 60) || null,
    selectionMethod: text(r.slctnMthType, 40) || null,
    capacity: cap,
    registrationStart: rs,
    registrationEnd: re,
    registrationUrl: null,                            /* no application URL in the dataset */
    schedule: start ? { startAt: start, endAt: end || start, timezone: 'Asia/Seoul', recurrence: [days, time].filter(Boolean).join(' ') || null } : null,
    pricing: fee.amount != null ? { type: 'unknown', amount: fee.amount, currency: 'KRW' } : null,
    location: { country: 'KR', region: regionOf(addr), address: addr || null },
    contact: { phone: text(r.operPhoneNumber, 40) || null, website: home || null },
    source: {
      providerName: PROVIDER_NAME,
      sourceUrl: null,                                /* the dataset has no per-course page */
      fetchedAt,
      updatedAt: null,
      license: LICENSE,
      attribution: ATTRIBUTION + ' (운영기관: ' + text(r.operInstitutionNm, 80) + ')'
    },
    metadata: {
      freshness: 'source-dated',
      referenceDate: ymd(r.referenceDate) || '',
      insttCode: str(r.instt_code).slice(0, 20),
      costNote: fee.note,
      homepageText: home ? '' : text(r.homepageUrl, 120),
      methodMode: METHOD_MODE[method] || '',
      oadtCtLctreYn: str(r.oadtCtLctreYn).slice(0, 1), pntBankAckestYn: str(r.pntBankAckestYn).slice(0, 1), lrnAcnutAckestYn: str(r.lrnAcnutAckestYn).slice(0, 1)
    }
  };
}

/* ───────── response parsing (official error codes → fixed LIVON codes; bodies never leave this file) ───────── */
export function parseBody(textBody) {
  const t = str(textBody);
  if (!t) throw fail('PARSE');
  if (t[0] !== '{') {
    const m = /<returnReasonCode>\s*(\d+)\s*</.exec(t) || /<resultCode>\s*(\d+)\s*</.exec(t);
    throw fail(codeFor(m ? m[1] : '', t), m ? { upstreamCode: m[1] } : null);
  }
  let obj; try { obj = JSON.parse(t); } catch { throw fail('PARSE'); }
  const r = obj && obj.response;
  const h = r && r.header;
  if (!h || typeof h !== 'object') throw fail(codeFor('', t));
  const rc = str(h.resultCode);
  if (rc === '03') return { rows: [], total: 0 };                 /* NODATA_ERROR = zero results */
  if (rc !== '00' && rc !== '0' && rc !== '0000') throw fail(codeFor(rc, str(h.resultMsg)), { upstreamCode: rc });
  const b = r.body && typeof r.body === 'object' ? r.body : {};
  const items = b.items;
  const rows = Array.isArray(items) ? items : items && typeof items === 'object' ? (Array.isArray(items.item) ? items.item : items.item ? [items.item] : []) : [];
  const total = Number(b.totalCount);
  return { rows: rows.filter(x => x && typeof x === 'object'), total: Number.isFinite(total) && total >= 0 ? total : null };
}
function codeFor(rc, t) {
  if (rc === '22' || /LIMITED_NUMBER_OF_SERVICE_REQUESTS/.test(t)) return 'QUOTA';
  if (rc === '05' || /SERVICETIMEOUT_ERROR/.test(t)) return 'TIMEOUT';
  if (/^(20|21|30|31|32|33)$/.test(rc) || /SERVICE_KEY|ACCESS_DENIED|UNREGISTERED_IP|DEADLINE_HAS_EXPIRED/.test(t)) return 'HTTP_4XX';
  return 'PARSE';
}

function plainKey(key) { const k = str(key); if (/%[0-9A-Fa-f]{2}/.test(k)) { try { return decodeURIComponent(k); } catch { return k; } } return k; }
export function requestUrl(key, pageNo) {
  const u = new URL(UPSTREAM);
  u.searchParams.set('serviceKey', plainKey(key));
  u.searchParams.set('pageNo', String(pageNo));
  u.searchParams.set('numOfRows', String(PAGE_ROWS));
  u.searchParams.set('type', 'json');
  return u.href;
}

/* ───────── route filters (applied by LIVON on the loaded window — the upstream filter semantics are unconfirmed) ───────── */
export const FILTER_KEYS = ['query', 'region', 'method', 'status'];
export function filters({ query, region, method, status } = {}) {
  const out = {};
  if (query != null && query !== '') {
    const q = String(query).replace(/\s+/g, ' ').trim();
    if (!q || q.length > 50 || /[\u0000-\u001f\u007f<>]/.test(q)) throw bad();
    out.query = q;
  }
  if (region != null && region !== '') { if (!REGIONS.includes(region)) throw bad(); out.region = region; }
  if (method != null && method !== '') { if (!['online', 'offline', 'both'].includes(method)) throw bad(); out.method = method; }
  if (status != null && status !== '') { if (status !== 'open') throw bad(); out.status = 'open'; }
  return out;
}
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, '');
export function matches(e, f, now = Date.now()) {
  if (f.query) {
    const hay = norm([e.title, e.summary, e.organizer, e.venue, e.eligibility, e.location && e.location.address].join(' '));
    if (!f.query.split(' ').every(w => hay.includes(norm(w)))) return false;
  }
  if (f.region && !(e.location && e.location.region === f.region)) return false;
  if (f.method && !((e.metadata && e.metadata.methodMode) === f.method || (e.metadata && e.metadata.methodMode) === 'both')) return false;
  if (f.status === 'open') {
    const s = e.registrationStart ? Date.parse(e.registrationStart) : NaN, en = e.registrationEnd ? Date.parse(e.registrationEnd) : NaN;
    if (isNaN(s) && isNaN(en)) return false;                          /* no dates → never "모집중" */
    if (!isNaN(s) && s > now) return false;
    if (!isNaN(en) && en < now) return false;
  }
  return true;
}

/* ───────── bounded load: ≤ MAX_PAGES pages, ended courses dropped, upcoming/ongoing first ───────── */
export async function fetchAll({ key, fetcher, timeoutMs = 8000, budgetMs = 25000, now = Date.now() } = {}) {
  const started = Date.now(), fetchedAt = new Date(now).toISOString();
  const today = new Date(now + 9 * 3600e3).toISOString().slice(0, 10);
  const byId = new Map();
  let total = null;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const left = budgetMs - (Date.now() - started);
    if (left <= 0) throw fail('TIMEOUT');
    let res;
    try { res = await fetcher(requestUrl(key, page), { method: 'GET', headers: { accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(Math.min(timeoutMs, left)) }); }
    catch (err) { throw fail(err && (err.name === 'TimeoutError' || err.name === 'AbortError') ? 'TIMEOUT' : 'NETWORK'); }
    const body = await res.text();
    if (body.length > 20_000_000) throw fail('INVALID_DATA');
    if (!res.ok) { if (/LIMITED_NUMBER_OF_SERVICE_REQUESTS/.test(body)) throw fail('QUOTA'); throw fail(res.status >= 500 ? 'HTTP_5XX' : 'HTTP_4XX', { status: res.status }); }
    const r = parseBody(body);
    if (r.total != null) total = r.total;
    for (const row of r.rows) {
      const e = toEntity(row, fetchedAt);
      if (!e) continue;
      if (e.schedule && e.schedule.endAt && e.schedule.endAt < today) continue;   /* 교육종료일자 passed → not offered */
      if (!byId.has(e.providerId)) byId.set(e.providerId, e);
    }
    if (!r.rows.length || (total != null && page * PAGE_ROWS >= total)) break;
  }
  return [...byId.values()]
    .sort((a, b) => String((a.schedule && a.schedule.startAt) || '9999').localeCompare(String((b.schedule && b.schedule.startAt) || '9999')))
    .slice(0, MAX_KEEP);
}
