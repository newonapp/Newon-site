/*
 * 한국관광공사 국문 관광정보 서비스 (TourAPI, KorService2) adapter — server only.
 *
 * Source of every name below (checked 2026-09-29):
 *   공공데이터포털 「한국관광공사_국문 관광정보 서비스_GW」 https://www.data.go.kr/data/15101578/openapi.do (수정일 2026-02-26)
 *     Base URL : apis.data.go.kr/B551011/KorService2 (https) · 명세 버전 1.0.0 · REST · JSON+XML (_type=json → JSON, 기본 XML)
 *     공통 필수 : serviceKey, MobileOS (IOS|AND|WEB|ETC), MobileApp (서비스명)
 *     operations used : searchKeyword2, areaBasedList2, locationBasedList2, detailCommon2, detailIntro2, detailImage2
 *     list fields  : contentid, contenttypeid, title, addr1, addr2, zipcode, mapx (GPS X, WGS84 경도), mapy (GPS Y, WGS84 위도),
 *                    tel, firstimage (원본), firstimage2 (썸네일), cpyrhtDivCd (Type1 제1유형 출처표시 / Type3 제3유형 +변경금지),
 *                    lDongRegnCd, lDongSignguCd (법정동 시도/시군구), lclsSystm1~3 (분류체계), createdtime, modifiedtime, mlevel,
 *                    dist (locationBasedList2 only)
 *     deprecated   : areaCode, sigunguCode, cat1~3 (명세 표기 "미사용항목(삭제예정)") — never sent, never relied on
 *     locationBasedList2 : mapX, mapY, radius (필수, 단위 m, 최대 20000), arrange E=거리순
 *     detailCommon2 : contentId → overview, homepage, tel, telname, addr1/2, zipcode, mapx/mapy, firstimage(2), cpyrhtDivCd …
 *     detailIntro2  : contentId + contentTypeId (필수) → type-specific fields (see INTRO_FIELDS; labels from the 명세)
 *     detailImage2  : contentId (+imageYN) → originimgurl, smallimageurl, imgname, serialnum, cpyrhtDivCd
 *     contentTypeId : 12 관광지, 14 문화시설, 15 축제공연행사, 25 여행코스, 28 레포츠, 32 숙박, 38 쇼핑, 39 음식점
 *   한국관광콘텐츠랩 저작권 정책 https://api.visitkorea.or.kr/#/useServiceGuide/2
 *     출처 표기: "출처 : ⓒ한국관광콘텐츠랩 또는 ⓒ한국관광공사" · 사진 "데이터 제공: ⓒ한국관광콘텐츠랩"
 *     사진: 피사체 명예훼손·인격권 침해 용도 및 기업 CI/BI 이용 금지 · "콘텐츠 캐싱(로컬서버 저장방식) 금지"
 *     외부 활용 시 저작권 정책 안내 링크를 함께 제공
 *   → LIVON never stores TourAPI content on the server (no cache), shows the credit + policy link, and shows photos
 *     only when the item states its 공공누리 type (Type1/Type3), without cropping.
 */
import { regionOf } from './kakao-local.mjs';

export const PROVIDER_ID = 'kr-tourapi';
export const PROVIDER_NAME = '한국관광공사 TourAPI';
export const ENV_KEY = 'TOURAPI_SERVICE_KEY';
export const BASE = 'https://apis.data.go.kr/B551011/KorService2';     // fixed; clients can never choose it
export const OPS = Object.freeze({ keyword: 'searchKeyword2', area: 'areaBasedList2', location: 'locationBasedList2', common: 'detailCommon2', intro: 'detailIntro2', images: 'detailImage2' });
export const MOBILE_APP = 'LIVON';
export const LICENSE = '한국관광공사 국문 관광정보 서비스 (공공데이터포털)';
export const POLICY_URL = 'https://api.visitkorea.or.kr/#/useServiceGuide/2';
export const ATTRIBUTION = '출처: ⓒ한국관광공사';
export const PHOTO_CREDIT = '사진 데이터 제공: ⓒ한국관광콘텐츠랩';

export const CONTENT_TYPES = Object.freeze({ 12: '관광지', 14: '문화시설', 15: '축제공연행사', 25: '여행코스', 28: '레포츠', 32: '숙박', 38: '쇼핑', 39: '음식점' });
/* place-shaped types LIVON accepts (15 행사 → event readiness only, 25 여행코스 → not a place) */
export const PLACE_TYPES = Object.freeze(['12', '14', '28', '32', '38', '39']);
/* types LIVON screens offer (쇼핑·음식점 are supported but not promoted) */
export const LIVON_TYPES = Object.freeze(['12', '14', '28', '32']);
/* contentTypeId → existing LIVON Explore category, only where unambiguous (레포츠 has no single LIVON category) */
export const LIVON_CATEGORY = Object.freeze({ 12: '여행', 14: '취미', 32: '여행' });
export const COPYRIGHT = Object.freeze({ Type1: '공공누리 제1유형(출처표시)', Type3: '공공누리 제3유형(출처표시·변경금지)' });
/*
 * LIVON region names → 법정동 시도코드 (lDongRegnCd). Values follow the national 법정동 code standard;
 * the TourAPI 명세 points to ldongCode2 for the list — re-check with ldongCode2 once a key is issued (문서 확인 필요).
 */
export const REGION_CODES = Object.freeze({ 서울: '11', 부산: '26', 대구: '27', 인천: '28', 광주: '29', 대전: '30', 경기: '41' });

export const LIMITS = Object.freeze({ maxPage: 50, maxRows: 20, maxRadius: 20000, maxImages: 20 });
export const RADII = Object.freeze([500, 1000, 3000, 5000, 10000, 20000]);
export const DEFAULT_RADIUS = 5000;
export const QUERY_MAX = 50;
export const COORD_DECIMALS = 3;

function bad() { return Object.assign(new Error('bad'), { code: 'BAD_REQUEST' }); }
const str = v => (v == null ? '' : String(v)).trim();
const round = n => Math.round(n * 1e3) / 1e3;
function num(v) { if (v == null || v === '') return null; const s = String(v).trim(); if (!/^-?\d{1,3}(\.\d{1,12})?$/.test(s)) throw bad(); return Number(s); }

/*
 * Route params → one validated request. Modes:
 *   detail : id (contentId) [+ type]           → detailCommon2 (+ detailIntro2)        — only when a user opens a detail
 *   images : id + view=images                  → detailImage2
 *   location: lat + lng [+ radius, type]       → locationBasedList2 (POST only — see http.mjs)
 *   keyword: query [+ region|area(+sigungu)]   → searchKeyword2 (type filtered after, the API has no type parameter)
 *   area   : region|area [+ sigungu, type]     → areaBasedList2
 */
export function parseParams({ query, region, area, sigungu, type, lat, lng, radius, id, view, page, limit } = {}) {
  const pg = page == null || page === '' ? 1 : Number(page);
  if (!Number.isInteger(pg) || pg < 1 || pg > LIMITS.maxPage) throw bad();
  const rows = Math.min(Math.max(1, Number(limit) || LIMITS.maxRows), LIMITS.maxRows);
  const t = type == null || type === '' ? '' : String(type);
  if (t && !PLACE_TYPES.includes(t)) throw bad();
  const v = view == null || view === '' ? '' : String(view);
  if (v && v !== 'detail' && v !== 'images') throw bad();
  if (id != null && id !== '') {
    if (!/^\d{1,12}$/.test(String(id))) throw bad();
    if (query || region || area || lat != null || lng != null) throw bad();
    return { mode: v === 'images' ? 'images' : 'detail', id: String(id), type: t, page: 1, rows: v === 'images' ? LIMITS.maxImages : 1, nearby: false };
  }
  if (v) throw bad();
  const q = query == null ? '' : String(query).replace(/\s+/g, ' ').trim();
  if (q.length > QUERY_MAX || /[\u0000-\u001f\u007f<>]/.test(q)) throw bad();
  let regn = '';
  if (region != null && region !== '') { if (!Object.prototype.hasOwnProperty.call(REGION_CODES, region)) throw bad(); regn = REGION_CODES[region]; }
  if (area != null && area !== '') { if (!/^\d{2}$/.test(String(area)) || (regn && regn !== String(area))) throw bad(); regn = String(area); }
  let sgg = '';
  if (sigungu != null && sigungu !== '') { if (!regn || !/^\d{3,5}$/.test(String(sigungu))) throw bad(); sgg = String(sigungu); }
  const la = num(lat), ln = num(lng);
  if ((la == null) !== (ln == null)) throw bad();
  if (la != null) {
    if (la < -90 || la > 90 || ln < -180 || ln > 180) throw bad();
    if (q || regn) throw bad();
    let rad = DEFAULT_RADIUS;
    if (radius != null && radius !== '') { if (!/^\d{1,5}$/.test(String(radius)) || !RADII.includes(Number(radius))) throw bad(); rad = Number(radius); }
    return { mode: 'location', type: t, lat: round(la), lng: round(ln), radius: rad, page: pg, rows, nearby: true };
  }
  if (radius != null && radius !== '') throw bad();
  if (q) return { mode: 'keyword', query: q, type: t, area: regn, sigungu: sgg, page: pg, rows, nearby: false };
  if (regn) return { mode: 'area', type: t, area: regn, sigungu: sgg, page: pg, rows, nearby: false };
  throw bad();
}

/* data.go.kr issues an "Encoding" and a "Decoding" key; the decoded form is used and encoded exactly once here */
function plainKey(key) { const k = str(key); if (/%[0-9A-Fa-f]{2}/.test(k)) { try { return decodeURIComponent(k); } catch { return k; } } return k; }
export function requestUrl(op, p, key) {
  const u = new URL(BASE + '/' + OPS[op]);
  u.searchParams.set('serviceKey', plainKey(key));
  u.searchParams.set('MobileOS', 'WEB');
  u.searchParams.set('MobileApp', MOBILE_APP);
  u.searchParams.set('_type', 'json');
  if (op === 'keyword' || op === 'area' || op === 'location') {
    u.searchParams.set('numOfRows', String(p.rows));
    u.searchParams.set('pageNo', String(p.page));
  }
  if (op === 'keyword') { u.searchParams.set('keyword', p.query); u.searchParams.set('arrange', 'A'); }
  if (op === 'keyword' || op === 'area') {
    if (p.area) u.searchParams.set('lDongRegnCd', p.area);
    if (p.sigungu) u.searchParams.set('lDongSignguCd', p.sigungu);
  }
  if (op === 'area') { u.searchParams.set('arrange', 'A'); if (p.type) u.searchParams.set('contentTypeId', p.type); }
  if (op === 'location') {
    u.searchParams.set('mapX', String(p.lng));     /* mapX = WGS84 경도 (longitude) */
    u.searchParams.set('mapY', String(p.lat));     /* mapY = WGS84 위도 (latitude) */
    u.searchParams.set('radius', String(p.radius));
    u.searchParams.set('arrange', 'E');            /* E = 거리순 */
    if (p.type) u.searchParams.set('contentTypeId', p.type);
  }
  if (op === 'common' || op === 'intro' || op === 'images') u.searchParams.set('contentId', p.id);
  if (op === 'intro') u.searchParams.set('contentTypeId', p.type);
  if (op === 'images') { u.searchParams.set('imageYN', 'Y'); u.searchParams.set('numOfRows', String(LIMITS.maxImages)); u.searchParams.set('pageNo', '1'); }
  return u.href;
}

/* ───────── response handling (official error names → fixed LIVON codes; bodies never leave this file) ───────── */
const QUOTA = /LIMITED_NUMBER_OF_SERVICE_REQUESTS(_PER_SECOND)?_EXCEEDS_ERROR/;
const AUTH = /SERVICE_KEY_IS_NULL|PERMISSION_DENIED|SERVICE_ACCESS_DENIED_ERROR|SERVICE_KEY_IS_NOT_REGISTERED_ERROR|DEADLINE_HAS_EXPIRED_ERROR|BLACKLIST_IP_ACCESS_ERROR/;
function fail(code) { return Object.assign(new Error('upstream'), { code }); }
function codeFor(resultCode, text) {
  if (QUOTA.test(text) || resultCode === '22' || resultCode === '23') return 'QUOTA';
  if (/SERVICETIMEOUT_ERROR/.test(text) || resultCode === '05') return 'TIMEOUT';
  if (AUTH.test(text)) return 'HTTP_4XX';
  return 'PARSE';
}
export function parseBody(text) {
  const t = str(text);
  if (!t) throw fail('PARSE');
  if (t[0] !== '{') {                                   /* the gateway answers errors in XML/HTML even for _type=json */
    const m = /<returnReasonCode>\s*(\d+)\s*</.exec(t) || /<resultCode>\s*(\d+)\s*</.exec(t);
    throw fail(codeFor(m ? m[1] : '', t));
  }
  let obj; try { obj = JSON.parse(t); } catch { throw fail('PARSE'); }
  const r = obj && obj.response;
  const h = r && r.header;
  if (!h || typeof h !== 'object') throw fail(codeFor('', t));
  const rc = str(h.resultCode);
  if (rc !== '0000' && rc !== '00' && rc !== '0') throw fail(codeFor(rc, str(h.resultMsg)));
  const b = r.body && typeof r.body === 'object' ? r.body : {};
  const it = b.items && typeof b.items === 'object' ? b.items.item : null;   /* zero results: items is "" */
  const rows = it == null ? [] : Array.isArray(it) ? it : [it];
  const total = Number(b.totalCount);
  return { rows: rows.filter(x => x && typeof x === 'object'), total: Number.isFinite(total) && total >= 0 ? total : null };
}

/* ───────── normalization ───────── */
function coord(v, min, max) { const s = str(v); if (!/^-?\d{1,3}(\.\d+)?$/.test(s)) return null; const n = Number(s); return n >= min && n <= max ? n : null; }
/* image URLs only from the Korea Tourism Organization's own hosts */
export function imageUrl(v) {
  const s = str(v);
  try { const u = new URL(s); return (u.protocol === 'https:' || u.protocol === 'http:') && /(^|\.)visitkorea\.or\.kr$/i.test(u.hostname) ? u.href : ''; } catch { return ''; }
}
/* homepage often arrives as markup (<a href="…">…</a>): take the first http(s) URL, nothing else */
export function homepageUrl(v) {
  const s = str(v);
  const m = /href\s*=\s*["']?(https?:\/\/[^"'\s>]+)/i.exec(s) || /(https?:\/\/[^\s"'<>]+)/i.exec(s);
  if (!m) return '';
  try { const u = new URL(m[1].replace(/&amp;/g, '&')); return (u.protocol === 'https:' || u.protocol === 'http:') && !u.username && !u.password ? u.href : ''; } catch { return ''; }
}
/* official markup → plain text (line breaks kept as " / "); the shared schema cleans it again */
export function plain(v, max = 5000) {
  const s = str(v)
    .replace(/<(script|style|iframe|object|embed|template)[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' / ')
    .replace(/<\/?(b|i|u|em|strong|span|font|a|small|sup|sub)\b[^>]*>/gi, '')   /* inline markup: no extra space */
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&amp;/gi, '&')
    .replace(/[<>]/g, '')
    .replace(/\s*\/\s*(\/\s*)+/g, ' / ')
    .replace(/\s+/g, ' ').trim().replace(/^\/\s*|\s*\/$/g, '');
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
function tsIso(v) {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?$/.exec(str(v));
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4] || '00'}:${m[5] || '00'}:${m[6] || '00'}+09:00`);
  return isNaN(d) || d.getUTCFullYear() < 1990 ? null : d.toISOString();
}
function photo(url, thumb, name, cpy) {
  const license = COPYRIGHT[str(cpy)] ? str(cpy) : '';
  const u = imageUrl(url), th = imageUrl(thumb);
  if (!u && !th) return null;
  return { url: u || th, thumb: th || u, name: plain(name, 120), license, licenseLabel: COPYRIGHT[license] || '', credit: PHOTO_CREDIT };
}

export function toEntity(raw, fetchedAt, { nearby = false } = {}) {
  if (!raw || typeof raw !== 'object') return null;
  const id = str(raw.contentid), type = str(raw.contenttypeid), title = plain(raw.title, 200);
  if (!/^\d{1,12}$/.test(id) || !title || !PLACE_TYPES.includes(type)) return null;   /* 15 행사 / 25 코스 are not places */
  const lat = coord(raw.mapy, -90, 90), lng = coord(raw.mapx, -180, 180);
  const both = lat != null && lng != null;
  const a1 = plain(raw.addr1, 300), a2 = plain(raw.addr2, 300);
  const cover = photo(raw.firstimage, raw.firstimage2, '', raw.cpyrhtDivCd);
  const dist = nearby && /^\d+(\.\d+)?$/.test(str(raw.dist)) ? Math.round(Number(str(raw.dist))) : null;
  return {
    type: 'place',
    provider: PROVIDER_ID,
    providerId: id,
    title,
    summary: null,                                          /* 개요 (overview) comes only from detailCommon2 */
    category: LIVON_CATEGORY[type] || null,
    tags: [CONTENT_TYPES[type]].filter(Boolean),
    interests: [],
    lifeStages: [],
    placeType: CONTENT_TYPES[type],
    officialUrl: null,
    homepageUrl: null,
    distanceMeters: dist,
    location: { country: 'KR', region: regionOf(a1), address: a1 || null, detailAddress: a2 || null, latitude: both ? lat : null, longitude: both ? lng : null },
    contact: str(raw.tel) ? { phone: plain(raw.tel, 40) } : null,
    photos: cover && cover.license ? [cover] : [],          /* shown only with a stated 공공누리 type */
    source: {
      providerName: PROVIDER_NAME,
      sourceUrl: null,                                      /* the API gives no public detail-page URL; none is invented */
      fetchedAt,
      updatedAt: tsIso(raw.modifiedtime),                   /* 출처 수정일 — not a LIVON verification */
      license: LICENSE,
      attribution: ATTRIBUTION
    },
    metadata: {
      freshness: 'source-dated',
      contentId: id,
      contentTypeId: type,
      contentTypeName: CONTENT_TYPES[type],
      lDongRegnCd: str(raw.lDongRegnCd), lDongSignguCd: str(raw.lDongSignguCd),
      lclsSystm1: str(raw.lclsSystm1), lclsSystm2: str(raw.lclsSystm2), lclsSystm3: str(raw.lclsSystm3),
      zipcode: str(raw.zipcode),
      createdtime: str(raw.createdtime), modifiedtime: str(raw.modifiedtime),
      imageUrl: cover ? cover.url : '', imageLicense: cover ? cover.license : '',
      policyUrl: POLICY_URL
    }
  };
}

/* detailIntro2 fields per contentTypeId with the 명세 labels — shown only when the value exists */
export const INTRO_FIELDS = Object.freeze({
  12: [['usetime', '이용시간'], ['restdate', '쉬는날'], ['useseason', '이용시기'], ['opendate', '개장일'], ['parking', '주차시설'], ['infocenter', '문의및안내'],
    ['accomcount', '수용인원'], ['expguide', '체험안내'], ['expagerange', '체험가능연령'], ['chkbabycarriage', '유모차대여정보'], ['chkpet', '애완동물동반가능정보'], ['chkcreditcard', '신용카드가능정보'],
    ['heritage1', '세계문화유산유무'], ['heritage2', '세계자연유산유무'], ['heritage3', '세계기록유산유무']],
  14: [['usetimeculture', '이용시간'], ['restdateculture', '쉬는날'], ['usefee', '이용요금'], ['discountinfo', '할인정보'], ['spendtime', '관람소요시간'], ['parkingculture', '주차시설'],
    ['parkingfee', '주차요금'], ['infocenterculture', '문의및안내'], ['scale', '규모'], ['accomcountculture', '수용인원'], ['chkbabycarriageculture', '유모차대여정보'], ['chkpetculture', '애완동물동반가능정보'], ['chkcreditcardculture', '신용카드가능정보']],
  28: [['usetimeleports', '이용시간'], ['restdateleports', '쉬는날'], ['openperiod', '개장기간'], ['usefeeleports', '입장료'], ['reservation', '예약안내'], ['parkingleports', '주차시설'],
    ['parkingfeeleports', '주차요금'], ['infocenterleports', '문의및안내'], ['scaleleports', '규모'], ['accomcountleports', '수용인원'], ['expagerangeleports', '체험가능연령'],
    ['chkbabycarriageleports', '유모차대여정보'], ['chkpetleports', '애완동물동반가능정보'], ['chkcreditcardleports', '신용카드가능정보']],
  32: [['checkintime', '입실시간'], ['checkouttime', '퇴실시간'], ['roomcount', '객실수'], ['roomtype', '객실유형'], ['scalelodging', '규모'], ['accomcountlodging', '수용가능인원'],
    ['chkcooking', '객실내취사여부'], ['parkinglodging', '주차시설'], ['foodplace', '식음료장'], ['subfacility', '부대시설'], ['pickup', '픽업서비스'], ['reservationlodging', '예약안내'],
    ['refundregulation', '환불규정'], ['infocenterlodging', '문의및안내']],
  38: [['opentime', '영업시간'], ['restdateshopping', '쉬는날'], ['saleitem', '판매품목'], ['parkingshopping', '주차시설'], ['infocentershopping', '문의및안내'], ['shopguide', '매장안내']],
  39: [['opentimefood', '영업시간'], ['restdatefood', '쉬는날'], ['firstmenu', '대표메뉴'], ['treatmenu', '취급메뉴'], ['parkingfood', '주차시설'], ['infocenterfood', '문의및안내'], ['reservationfood', '예약안내']]
});
export function introRows(raw, type) {
  if (!raw || typeof raw !== 'object') return [];
  return (INTRO_FIELDS[type] || []).map(([k, label]) => ({ label, value: plain(raw[k], 300) })).filter(r => r.value);
}
/* 숙박 reservationurl (예약안내홈페이지) is kept as a plain link — never a booking button */
export function reservationUrl(raw) { return raw && typeof raw === 'object' ? homepageUrl(raw.reservationurl) : ''; }

export function photosFrom(rows) {
  return rows.map(r => photo(r.originimgurl, r.smallimageurl, r.imgname, r.cpyrhtDivCd)).filter(p => p && p.license).slice(0, LIMITS.maxImages);
}

/* ───────── upstream calls (one per list page; detail = common (+intro); images = one) ───────── */
async function get(fetcher, url, timeoutMs) {
  let res;
  try { res = await fetcher(url, { method: 'GET', headers: { accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(timeoutMs) }); }
  catch (err) { throw fail(err && (err.name === 'TimeoutError' || err.name === 'AbortError') ? 'TIMEOUT' : 'NETWORK'); }
  const text = await res.text();
  if (text.length > 2_000_000) throw fail('INVALID_DATA');
  if (!res.ok) {
    if (QUOTA.test(text)) throw fail('QUOTA');
    throw fail(res.status >= 500 ? 'HTTP_5XX' : 'HTTP_4XX');
  }
  return parseBody(text);
}

export async function search({ key, fetcher, params: p, timeoutMs = 8000, now = Date.now() }) {
  const fetchedAt = new Date(now).toISOString();
  if (p.mode === 'images') {
    const r = await get(fetcher, requestUrl('images', p, key), timeoutMs);
    return { items: [], photos: photosFrom(r.rows), hasMore: false, total: null, fetchedAt };
  }
  if (p.mode === 'detail') {
    const common = await get(fetcher, requestUrl('common', p, key), timeoutMs);
    const raw = common.rows[0];
    const e = toEntity(raw, fetchedAt);
    if (!e) return { items: [], hasMore: false, total: 0, fetchedAt };
    const type = e.metadata.contentTypeId;
    let rows = [], reserve = '';
    if (INTRO_FIELDS[type]) {
      const intro = await get(fetcher, requestUrl('intro', { ...p, type }, key), timeoutMs);
      rows = introRows(intro.rows[0], type);
      reserve = type === '32' ? reservationUrl(intro.rows[0]) : '';
    }
    e.description = plain(raw.overview, 5000) || null;
    e.summary = e.description ? e.description.slice(0, 180) + (e.description.length > 180 ? '…' : '') : null;
    e.homepageUrl = homepageUrl(raw.homepage) || null;
    e.reservationUrl = reserve || null;
    e.info = rows;
    return { items: [e], hasMore: false, total: 1, fetchedAt };
  }
  const r = await get(fetcher, requestUrl(p.mode, p, key), timeoutMs);
  let items = r.rows.map(x => toEntity(x, fetchedAt, { nearby: p.nearby })).filter(Boolean);
  if (p.mode === 'keyword' && p.type) items = items.filter(e => e.metadata.contentTypeId === p.type);   /* searchKeyword2 has no type parameter */
  const hasMore = r.total != null ? p.page * p.rows < r.total && p.page < LIMITS.maxPage : r.rows.length === p.rows && p.page < LIMITS.maxPage;
  return { items, hasMore, total: r.total, fetchedAt };
}
