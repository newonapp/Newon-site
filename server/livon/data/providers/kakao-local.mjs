/*
 * Kakao Local — 키워드/카테고리 장소 검색 adapter (server only).
 *
 * Source of every name below: Kakao Developers 「로컬 › REST API」 (https://developers.kakao.com/docs/ko/local/dev-guide, checked 2026-09-29)
 *   키워드로 장소 검색  : GET https://dapi.kakao.com/v2/local/search/keyword.${FORMAT}   (FORMAT 기본값 json)
 *   카테고리로 장소 검색: GET https://dapi.kakao.com/v2/local/search/category.${FORMAT}
 *   인증                : 헤더 Authorization: KakaoAK ${REST_API_KEY}
 *   keyword  params     : query(필수), category_group_code, x(경도), y(위도), radius(미터, 0~20000), rect,
 *                         page(1~45, 기본 1), size(1~15, 기본 15), sort(distance|accuracy — distance는 x,y 필요)
 *   category params     : category_group_code(필수), x, y, radius(0~20000) 또는 rect 중 하나 필수, page(1~45), size(1~15), sort
 *   meta                : total_count, pageable_count(total_count 중 노출 가능 문서 수, 최대 45), is_end, same_name
 *   document            : id, place_name, category_name, category_group_code, category_group_name, phone,
 *                         address_name(전체 지번 주소), road_address_name(전체 도로명 주소), x(경도), y(위도),
 *                         place_url(장소 상세페이지 URL — 카카오맵), distance(중심좌표까지 거리, 미터 — x,y를 보냈을 때만)
 * The API has NO opening hours, rating, review count, price, photo, description or update date: none are derived.
 * place_url is a Kakao Map page, not the business's official homepage.
 * 주소 → 좌표(address.json) is documented but not used in V1 (LIVON has no address-entry flow yet).
 */
import { createHash } from 'node:crypto';

export const PROVIDER_ID = 'kr-kakao-place';
export const PROVIDER_NAME = 'Kakao Local';
export const ENV_KEY = 'KAKAO_REST_API_KEY';
export const ENDPOINTS = Object.freeze({
  keyword: 'https://dapi.kakao.com/v2/local/search/keyword.json',   // fixed; clients can never choose them
  category: 'https://dapi.kakao.com/v2/local/search/category.json'
});
export const LICENSE = 'Kakao Developers 로컬 API';

/* official CategoryGroupCode enum (both search APIs) */
export const CATEGORY_CODES = Object.freeze({
  MT1: '대형마트', CS2: '편의점', PS3: '어린이집, 유치원', SC4: '학교', AC5: '학원', PK6: '주차장', OL7: '주유소, 충전소',
  SW8: '지하철역', BK9: '은행', CT1: '문화시설', AG2: '중개업소', PO3: '공공기관', AT4: '관광명소', AD5: '숙박',
  FD6: '음식점', CE7: '카페', HP8: '병원', PM9: '약국'
});
/* official group → an existing LIVON Explore category label, only where the meaning is unambiguous.
   Everything else keeps the Kakao category text only (no forced LIVON category). */
export const LIVON_CATEGORY = Object.freeze({ CT1: '취미', AT4: '여행', HP8: '건강', PM9: '건강', AC5: '배움', SC4: '배움', PS3: '육아' });

/* official limits */
export const LIMITS = Object.freeze({ maxPage: 45, maxSize: 15, maxPageable: 45, maxRadius: 20000 });
/* radii LIVON offers (all within the official 0~20000 m) */
export const RADII = Object.freeze([500, 1000, 3000, 5000, 10000, 20000]);
export const DEFAULT_RADIUS = 5000;
export const QUERY_MAX = 50;
/* user coordinates are rounded to 3 decimals (≈100 m) before they reach Kakao, a cache key or anything else */
export const COORD_DECIMALS = 3;

function bad() { return Object.assign(new Error('bad'), { code: 'BAD_REQUEST' }); }
const round = (n, d = COORD_DECIMALS) => Math.round(n * 10 ** d) / 10 ** d;
function num(v) { if (v == null || v === '') return null; const s = String(v).trim(); if (!/^-?\d{1,3}(\.\d{1,12})?$/.test(s)) throw bad(); return Number(s); }

/*
 * Route params → validated search request. Throws BAD_REQUEST on anything outside the official/LIVON limits.
 *   keyword  : query (1~50 chars) [+ category] [+ lat,lng,radius] [sort=accuracy|distance]
 *   category : category + lat,lng (+radius) — Kakao requires a centre for category search; LIVON never invents one
 */
export function parseParams({ query, category, lat, lng, radius, sort, page = 1, limit = LIMITS.maxSize } = {}) {
  const q = query == null ? '' : String(query).replace(/\s+/g, ' ').trim();
  if (q.length > QUERY_MAX || /[\u0000-\u001f\u007f<>]/.test(q)) throw bad();
  const cat = category == null || category === '' ? '' : String(category);
  if (cat && !Object.prototype.hasOwnProperty.call(CATEGORY_CODES, cat)) throw bad();
  const la = num(lat), ln = num(lng);
  if ((la == null) !== (ln == null)) throw bad();                          /* both or neither */
  if (la != null && (la < -90 || la > 90 || ln < -180 || ln > 180)) throw bad();
  let rad = null;
  if (radius != null && radius !== '') {
    if (la == null || !/^\d{1,5}$/.test(String(radius)) || !RADII.includes(Number(radius))) throw bad();
    rad = Number(radius);
  }
  const s = sort == null || sort === '' ? 'accuracy' : String(sort);
  if (s !== 'accuracy' && s !== 'distance') throw bad();
  if (s === 'distance' && la == null) throw bad();                        /* official: distance sort needs x,y */
  const mode = q ? 'keyword' : cat ? 'category' : null;
  if (!mode) throw bad();
  if (mode === 'category' && la == null) throw bad();                     /* official: x,y,radius or rect required */
  const size = Math.min(Math.max(1, Number(limit) || LIMITS.maxSize), LIMITS.maxSize);
  const pg = page == null || page === '' ? 1 : Number(page);
  if (!Number.isInteger(pg) || pg < 1 || pg > LIMITS.maxPage) throw bad();
  const nearby = la != null;
  return {
    mode, query: q, category: cat, sort: s, page: pg, size, nearby,
    lat: nearby ? round(la) : null, lng: nearby ? round(ln) : null,
    radius: nearby ? (rad == null ? DEFAULT_RADIUS : rad) : null
  };
}

/* the whole pageable window (45 docs) is already exhausted → no upstream call */
export function beyondWindow(p) { return (p.page - 1) * p.size >= LIMITS.maxPageable; }

export function requestUrl(p) {
  const u = new URL(ENDPOINTS[p.mode]);
  if (p.mode === 'keyword') u.searchParams.set('query', p.query);
  if (p.category) u.searchParams.set('category_group_code', p.category);
  if (p.nearby) {
    u.searchParams.set('x', String(p.lng));        /* x = longitude */
    u.searchParams.set('y', String(p.lat));        /* y = latitude  */
    u.searchParams.set('radius', String(p.radius));
  }
  u.searchParams.set('page', String(p.page));
  u.searchParams.set('size', String(p.size));
  u.searchParams.set('sort', p.sort);
  return u.href;
}

/* cache key without plaintext query or coordinates (per-process salt for the private nearby cache) */
const SALT = createHash('sha256').update(String(Math.random()) + Date.now()).digest('hex').slice(0, 16);
export function cacheKey(p) {
  const base = [p.mode, p.query, p.category, p.sort, p.page, p.size, p.lat, p.lng, p.radius].join('|');
  const h = createHash('sha256').update((p.nearby ? SALT : 'livon-kakao-v1') + '|' + base).digest('hex').slice(0, 40);
  return `livon:data:v1:${PROVIDER_ID}:${p.nearby ? 'near' : 'kw'}:${h}`;
}

/* ───────── normalization ───────── */
const str = v => (v == null ? '' : String(v)).trim();
/* 시/도 names as Kakao writes them (short or full form); the first address token is kept only if it is one of these */
const SIDO = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도', '강원특별자치도',
  '충청북도', '충청남도', '전라북도', '전북특별자치도', '전라남도', '경상북도', '경상남도', '제주특별자치도'];
export function regionOf(addr) {
  const t = str(addr).split(/\s+/)[0] || '';
  return SIDO.includes(t) ? t : null;
}
function coord(v, min, max) {
  const s = str(v);
  if (!/^-?\d{1,3}(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return n >= min && n <= max ? n : null;
}
function webUrl(v) {
  const s = str(v);
  try { const u = new URL(s); return (u.protocol === 'https:' || u.protocol === 'http:') && /(^|\.)kakao\.com$/i.test(u.hostname) ? u.href : ''; } catch { return ''; }
}

export function toEntity(doc, fetchedAt, { nearby = false } = {}) {
  if (!doc || typeof doc !== 'object') return null;
  const id = str(doc.id), title = str(doc.place_name);
  if (!/^\d{1,20}$/.test(id) || !title) return null;
  const code = str(doc.category_group_code);
  const groupName = str(doc.category_group_name);
  const catName = str(doc.category_name);
  const road = str(doc.road_address_name), jibun = str(doc.address_name);
  const lat = coord(doc.y, -90, 90), lng = coord(doc.x, -180, 180);       /* y = latitude, x = longitude */
  const both = lat != null && lng != null;
  const dist = nearby && /^\d{1,6}$/.test(str(doc.distance)) ? Number(str(doc.distance)) : null;
  const map = webUrl(doc.place_url);
  const region = regionOf(road || jibun);
  return {
    type: 'place',
    provider: PROVIDER_ID,
    providerId: id,
    title,
    summary: null,                                                  /* the API has no description */
    category: LIVON_CATEGORY[code] || null,
    tags: [groupName, ...catName.split('>').map(s => s.trim())].filter(Boolean),
    interests: [],
    lifeStages: [],
    placeType: catName ? catName.split('>').map(x => x.trim()).filter(Boolean).join(' › ') : groupName || null, /* Kakao's own category text; only the '>' separator is shown as '›' (markup-safe) */
    mapUrl: map || null,
    mapProvider: map ? '카카오맵' : null,
    officialUrl: null,                                              /* Kakao Local has no official-homepage field */
    distanceMeters: dist,                                           /* only when Kakao returned it for a centre point */
    location: {
      country: 'KR',
      region,
      address: jibun || null,
      roadAddress: road || null,
      latitude: both ? lat : null,
      longitude: both ? lng : null
    },
    contact: str(doc.phone) ? { phone: str(doc.phone) } : null,
    source: {
      providerName: PROVIDER_NAME,
      sourceUrl: null,                                              /* the Kakao Map link is the action, not a "source document" */
      fetchedAt,
      updatedAt: null,                                              /* no update date in the API */
      license: LICENSE,
      attribution: '장소 정보 출처: Kakao Local'
    },
    metadata: {
      freshness: 'fetched-only',
      categoryGroupCode: code,
      categoryGroupName: groupName,
      categoryName: catName.split('>').map(x => x.trim()).filter(Boolean).join(' › ')
    }
  };
}

/* one upstream call (no crawling): page/size mapped 1:1 onto the official page/size */
export async function search({ key, fetcher, params, timeoutMs = 8000, now = Date.now() }) {
  let res;
  try {
    res = await fetcher(requestUrl(params), { method: 'GET', headers: { Authorization: 'KakaoAK ' + key, accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    throw Object.assign(new Error('upstream'), { code: err && (err.name === 'TimeoutError' || err.name === 'AbortError') ? 'TIMEOUT' : 'NETWORK' });
  }
  if (!res.ok) throw Object.assign(new Error('upstream'), { code: res.status >= 500 ? 'HTTP_5XX' : 'HTTP_4XX', status: res.status });
  const text = await res.text();
  if (text.length > 2_000_000) throw Object.assign(new Error('too large'), { code: 'INVALID_DATA' });
  let body;
  try { body = JSON.parse(text); } catch { throw Object.assign(new Error('parse'), { code: 'PARSE' }); }
  if (!body || typeof body !== 'object' || !Array.isArray(body.documents) || !body.meta || typeof body.meta !== 'object') throw Object.assign(new Error('shape'), { code: 'PARSE' });
  const fetchedAt = new Date(now).toISOString();
  const items = body.documents.slice(0, LIMITS.maxSize).map(d => toEntity(d, fetchedAt, { nearby: params.nearby })).filter(Boolean);
  const pageable = Number(body.meta.pageable_count);
  return {
    items,
    isEnd: body.meta.is_end !== false,
    pageableCount: Number.isFinite(pageable) ? Math.min(pageable, LIMITS.maxPageable) : null,
    totalCount: Number.isFinite(Number(body.meta.total_count)) ? Number(body.meta.total_count) : null,
    fetchedAt
  };
}
