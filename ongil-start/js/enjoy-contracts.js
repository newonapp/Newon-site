/*
 * Enjoy contracts (Phase 5) — the 즐길거리 taxonomy, the content types, and every provider → contract normaliser.
 *
 *   Provider answer (data-source.js, raw)  →  from*(raw) here  →  normalizeProgram / normalizePlace  →  filter/sort  →  UI
 * The screens never read a provider's own fields: Home's 내 주변 and the 즐길거리 screen share fromLifelong().
 *
 * Content types (kept apart in meaning, one shape where the meaning is the same):
 *   PROGRAM  a programme someone runs over a period (지역 프로그램)
 *   CLASS    a course with sessions (강좌) — same shape as PROGRAM; the regional lifelong-learning data is CLASS
 *   EVENT    a dated happening (공연·행사) — no source is connected yet
 *   PLACE    somewhere to go (공원, 박물관, 관광지 …)
 *   (TRIP, GROUP: reserved for later phases; no code produces them)
 *
 * Nothing here holds or invents content. A field the source does not give stays empty and is never shown.
 * There is no booking, application or payment field, and no "recommended" ranking.
 */
import { ContractError, isPlainObject, safeText, safeHref, REGIONS } from './contracts.js';
import { isDateKey, isTime } from './dates.js';
import { officialUrl, mapUrl, cleanPhone } from './care-contracts.js';

const sub = (...labels) => Object.freeze(labels);
const cat = (id, label, description, subs) => Object.freeze({ id, label, description, subs });

/* taxonomy only — the sub-categories are words to search with, never shown as if they were programmes */
export const ENJOY_CATEGORIES = Object.freeze([
  cat('HOBBY', '취미', '새로 해 보고 싶은 취미', sub('미술', '서예', '사진', '음악·악기', '원예', '요리', '공예', '독서')),
  cat('LEARNING', '배움', '배우고 익히는 강좌와 교육', sub('스마트폰', '키오스크', 'AI', '외국어', '금융', '디지털', '평생교육')),
  cat('EXERCISE', '운동', '몸을 움직이는 활동과 장소', sub('걷기', '체조', '요가', '수영', '등산')),
  cat('CULTURE', '문화', '영화, 공연, 전시, 박물관', sub('영화', '공연', '전시', '박물관')),
  cat('OUTING', '나들이', '가볍게 다녀올 공원과 관광지', sub('공원', '관광지', '지역 행사')),
  cat('TRAVEL', '여행', '당일치기와 국내 여행지 정보', sub('당일치기', '국내여행', '지역 관광')),
]);
export const ENJOY_CATEGORY_IDS = Object.freeze(ENJOY_CATEGORIES.map((c) => c.id));
export const enjoyCategoryById = (id) => ENJOY_CATEGORIES.find((c) => c.id === id) || null;

export const ENJOY_TYPES = Object.freeze([
  Object.freeze({ id: 'PROGRAM', label: '프로그램' }),
  Object.freeze({ id: 'CLASS', label: '강좌' }),
  Object.freeze({ id: 'EVENT', label: '행사' }),
  Object.freeze({ id: 'PLACE', label: '장소' }),
]);
export const ENJOY_TYPE_IDS = Object.freeze(ENJOY_TYPES.map((t) => t.id));
export const FUTURE_ENJOY_TYPES = Object.freeze(['TRIP', 'GROUP']);
export const typeLabel = (id) => (ENJOY_TYPES.find((t) => t.id === id) || { label: '' }).label;

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,120}$/;
const regionOf = (v) => (REGIONS.some((r) => r.id === v) ? v : '');
const day = (v) => (isDateKey(v) ? v : '');
const dateText = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v) && isDateKey(v.slice(0, 10)) ? v.slice(0, 10) : '');
const coord = (v, lo, hi) => (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : null);

/* a link and the honest label for it: official page / organiser's site / map / plain source */
function linkOf(input) {
  /* an item normalised before (e.g. by the lifelong source) keeps its link and its kind: normalising is idempotent */
  if (input.linkKind === 'organizer' && /^https:\/\//i.test(String(input.sourceUrl || '')) && safeHref(input.sourceUrl)) return { sourceUrl: safeHref(input.sourceUrl), linkKind: 'organizer' };
  if (input.linkKind === 'map' && mapUrl(input.sourceUrl)) return { sourceUrl: mapUrl(input.sourceUrl), linkKind: 'map' };
  const off = officialUrl(input.sourceUrl);
  if (off) return { sourceUrl: off, linkKind: 'official' };
  const map = mapUrl(input.mapUrl);
  if (map) return { sourceUrl: map, linkKind: 'map' };
  const site = /^https:\/\//i.test(String(input.homepageUrl || '')) ? safeHref(input.homepageUrl) : '';
  if (site) return { sourceUrl: site, linkKind: 'organizer' };
  return { sourceUrl: '', linkKind: '' };
}
export const LINK_LABELS = Object.freeze({ official: '공식 페이지에서 확인 (새 창)', organizer: '운영기관 누리집 보기 (새 창)', map: '카카오맵에서 위치 보기 (새 창)' });

/* ───────── PROGRAM · CLASS · EVENT (one shape; EVENT simply has no recruitment/capacity) ───────── */

export function normalizeProgram(input) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_PROGRAM');
  if (!['PROGRAM', 'CLASS', 'EVENT'].includes(input.type)) throw new ContractError('INVALID_TYPE');
  if (!ID.test(String(input.id))) throw new ContractError('INVALID_ID');
  const title = safeText(input.title, 120);
  if (!title) throw new ContractError('INVALID_TITLE');
  if (!enjoyCategoryById(input.category)) throw new ContractError('INVALID_CATEGORY');
  const start = day(input.startDate);
  const end = day(input.endDate);
  const isEvent = input.type === 'EVENT';
  return {
    type: input.type,
    id: input.id,
    title,
    category: input.category,
    summary: safeText(input.summary, 300),
    organization: safeText(input.organization, 80),
    region: regionOf(input.region),
    location: safeText(input.location, 160),
    startDate: start,
    endDate: end && (!start || end >= start) ? end : '',
    scheduleText: isEvent ? '' : safeText(input.scheduleText, 80),
    startTime: isTime(input.startTime) ? input.startTime : '',
    costText: safeText(input.costText, 60),
    targetText: isEvent ? '' : safeText(input.targetText, 80),
    recruitmentText: isEvent ? '' : safeText(input.recruitmentText, 80),
    capacityText: isEvent ? '' : safeText(input.capacityText, 40),
    sourceName: safeText(input.sourceName, 120),
    ...linkOf(input),
    updatedAt: dateText(input.updatedAt),
  };
}

export function normalizePlace(input) {
  if (!isPlainObject(input) || input.type !== 'PLACE') throw new ContractError('INVALID_PLACE');
  if (!ID.test(String(input.id))) throw new ContractError('INVALID_ID');
  const name = safeText(input.name, 120);
  if (!name) throw new ContractError('INVALID_NAME');
  if (!enjoyCategoryById(input.category)) throw new ContractError('INVALID_CATEGORY');
  const lat = coord(input.latitude, -90, 90);
  const lng = coord(input.longitude, -180, 180);
  return {
    type: 'PLACE',
    id: input.id,
    title: name,
    name,
    category: input.category,
    placeType: safeText(input.placeType, 60),
    summary: safeText(input.summary, 300),
    region: regionOf(input.region),
    address: safeText(input.address, 160),
    phone: cleanPhone(input.phone),
    /* coordinates only when the source gave both; never invented, never used to guess a distance here */
    latitude: lat !== null && lng !== null ? lat : null,
    longitude: lat !== null && lng !== null ? lng : null,
    sourceName: safeText(input.sourceName, 120),
    ...linkOf(input),
    updatedAt: dateText(input.updatedAt),
  };
}

/* ───────── provider answers → contract input (the only place provider field names appear) ───────── */

const obj = (v) => (v && typeof v === 'object' ? v : {});
const str = (v) => (typeof v === 'string' ? v : '');

/* kr-lifelong-class (server/livon/data/providers/lifelong-class.mjs toEntity) → CLASS. Category = the one searched under. */
export function fromLifelong(raw, category = 'LEARNING') {
  if (!raw || typeof raw !== 'object' || raw.type !== 'program') return null;
  const id = str(raw.providerId).trim();
  const title = safeText(raw.title, 120);
  if (!id || !title || !ID.test(id)) return null;
  const sch = obj(raw.schedule);
  const loc = obj(raw.location);
  const contact = obj(raw.contact);
  const source = obj(raw.source);
  const fee = obj(raw.pricing);
  const time = /^(\d{2}:\d{2})/.exec(str(raw.timeText));
  const cap = Number.isInteger(raw.capacity) && raw.capacity > 0 ? `${raw.capacity}명` : '';
  const rs = str(raw.registrationStart);
  const re = str(raw.registrationEnd);
  return {
    type: 'CLASS',
    id,
    title,
    category: enjoyCategoryById(category) ? category : 'LEARNING',
    summary: str(raw.summary),
    organization: str(raw.organizer),
    region: str(loc.region),
    location: [str(loc.address), str(raw.venue)].filter(Boolean).join(' · '),
    startDate: str(sch.startAt).slice(0, 10),
    endDate: str(sch.endAt).slice(0, 10),
    scheduleText: [str(raw.days), str(raw.timeText)].filter(Boolean).join(' '),
    startTime: time ? time[1] : '',
    costText: Number.isInteger(fee.amount) ? (fee.amount === 0 ? '무료' : `${fee.amount.toLocaleString('ko-KR')}원`) : '',
    targetText: str(raw.eligibility),
    recruitmentText: rs || re ? `접수 ${[rs, re].filter(Boolean).join(' ~ ')}` : '',
    capacityText: cap,
    sourceName: str(source.attribution) || str(source.providerName),
    homepageUrl: str(contact.website),
    updatedAt: str(source.updatedAt),
  };
}

/* kr-tourapi place (tourapi.mjs toEntity) → PLACE. contentTypeId decides the category, nothing else. */
export const TOUR_TYPES = Object.freeze([
  Object.freeze({ id: '12', label: '관광지', category: 'OUTING' }),
  Object.freeze({ id: '14', label: '문화시설', category: 'CULTURE' }),
  Object.freeze({ id: '28', label: '레포츠', category: 'EXERCISE' }),
]);
export function fromTourPlace(raw, category) {
  if (!raw || typeof raw !== 'object' || raw.type !== 'place') return null;
  const id = str(raw.providerId);
  if (!/^\d{1,12}$/.test(id)) return null;
  const meta = obj(raw.metadata);
  const tour = TOUR_TYPES.find((t) => t.id === str(meta.contentTypeId));
  if (!tour) return null; /* 숙박 · 쇼핑 · 음식점 are not 즐길거리 here */
  const loc = obj(raw.location);
  const contact = obj(raw.contact);
  const source = obj(raw.source);
  return {
    type: 'PLACE',
    id: `tour-${id}`,
    name: str(raw.title),
    category: enjoyCategoryById(category) ? category : tour.category,
    placeType: tour.label,
    summary: str(raw.summary),
    region: str(loc.region),
    address: [str(loc.address), str(loc.detailAddress)].filter(Boolean).join(' '),
    phone: str(contact.phone),
    latitude: loc.latitude,
    longitude: loc.longitude,
    sourceName: str(source.attribution) || str(source.providerName),
    sourceUrl: str(source.sourceUrl),
    updatedAt: str(source.updatedAt),
  };
}

/* kr-kakao-place (kakao-local.mjs toEntity) → PLACE. A private map platform: named as such, its link is a map. */
export function fromKakaoPlace(raw, category) {
  if (!raw || typeof raw !== 'object' || raw.type !== 'place') return null;
  const id = str(raw.providerId);
  if (!/^\d{1,20}$/.test(id) || !enjoyCategoryById(category)) return null;
  const loc = obj(raw.location);
  const contact = obj(raw.contact);
  return {
    type: 'PLACE',
    id: `kakao-${id}`,
    name: str(raw.title),
    category,
    placeType: str(raw.placeType),
    summary: '',
    region: str(loc.region),
    address: str(loc.roadAddress) || str(loc.address),
    phone: str(contact.phone),
    latitude: loc.latitude,
    longitude: loc.longitude,
    sourceName: '카카오 (Kakao Local, 민간 지도 서비스)',
    mapUrl: str(raw.mapUrl),
    updatedAt: '',
  };
}

/* everything a screen shows goes through this: bad items are dropped, duplicates removed, nothing "fixed" */
export function sanitizeEnjoyItems(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seen = new Set();
  for (const raw of list) {
    let item = null;
    try {
      item = raw && raw.type === 'PLACE' ? normalizePlace(raw) : normalizeProgram(raw);
    } catch {
      continue;
    }
    const key = `${item.type}:${item.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/* ───────── filter · search · sort ───────── */

const norm = (s) => String(s || '').toLowerCase().replace(/[\s·]+/g, '');
export function filterEnjoy(items, { type = '', category = '', region = '', query = '' } = {}) {
  const q = norm(safeText(query, 60));
  const catLabel = (id) => (enjoyCategoryById(id) || { label: '' }).label;
  return (Array.isArray(items) ? items : []).filter((it) => {
    if (type && it.type !== type) return false;
    if (category && it.category !== category) return false;
    if (region && it.region !== region) return false;
    if (q && ![it.title, it.summary, it.organization, it.location, it.address, it.placeType, catLabel(it.category)].some((f) => norm(f).includes(q))) return false;
    return true;
  });
}

/* filter choices that mean something for what is loaded; nothing else is offered and nothing is counted */
export function availableEnjoyFilters(items) {
  const list = Array.isArray(items) ? items : [];
  return {
    types: ENJOY_TYPE_IDS.filter((t) => list.some((i) => i.type === t)),
    categories: ENJOY_CATEGORY_IDS.filter((c) => list.some((i) => i.category === c)),
    regions: REGIONS.map((r) => r.id).filter((r) => list.some((i) => i.region === r)),
  };
}

/* factual sorts only: by name, by start date (only when some item has one). No "추천순", no distance without one. */
export const SORTS = Object.freeze([Object.freeze({ id: 'title', label: '가나다순' }), Object.freeze({ id: 'start', label: '시작일순' })]);
export function sortOptions(items) {
  const list = Array.isArray(items) ? items : [];
  return SORTS.filter((s) => s.id === 'title' || list.some((i) => i.startDate));
}
export function sortEnjoy(items, sort = 'title') {
  const list = (Array.isArray(items) ? items : []).slice();
  const byTitle = (a, b) => a.title.localeCompare(b.title, 'ko') || a.id.localeCompare(b.id);
  if (sort === 'start') return list.sort((a, b) => (a.startDate ? 0 : 1) - (b.startDate ? 0 : 1) || (a.startDate || '').localeCompare(b.startDate || '') || byTitle(a, b));
  return list.sort(byTitle);
}

/* ───────── detail: what · where · when · how much · who · how to check ───────── */

export function detailRows(item) {
  if (!item) return [];
  const period = item.startDate ? (item.endDate && item.endDate !== item.startDate ? `${item.startDate} ~ ${item.endDate}` : item.startDate) : '';
  const rows = [
    ['종류', [typeLabel(item.type), item.placeType].filter(Boolean).join(' · ')],
    ['분류', (enjoyCategoryById(item.category) || { label: '' }).label],
    ['소개', item.summary],
    ['운영 기관', item.organization],
    ['장소', item.location],
    ['주소', item.address],
    ['기간', period],
    ['일정', item.scheduleText],
    ['비용', item.costText],
    ['대상', item.targetText],
    ['모집', item.recruitmentText],
    ['정원', item.capacityText],
    ['전화', item.phone],
    ['자료 출처', item.sourceName],
    ['자료 날짜', item.updatedAt],
  ];
  return rows.filter(([, v]) => typeof v === 'string' && v.trim() !== '').map(([label, value]) => ({ label, value }));
}

/* ───────── saved · calendar · family ───────── */

/*
 * Saved (Phase 1 types): PLACE stays PLACE; PROGRAM, CLASS and EVENT are saved as PROGRAM (the existing type for
 * "something someone runs"), with the precise kind first in the description ("강좌 · …"). No new saved type.
 * Only a small snapshot is kept — never the provider payload.
 */
export function savedInputFor(item) {
  return {
    type: item.type === 'PLACE' ? 'PLACE' : 'PROGRAM',
    id: item.id,
    title: item.title,
    description: [typeLabel(item.type), item.type === 'PLACE' ? item.address : item.organization, item.startDate].filter(Boolean).join(' · '),
    href: item.sourceUrl || '#enjoy',
    source: item.sourceName,
  };
}

/* a calendar entry only from a real start date; title, date and (if given) start time — nothing else is copied */
export function calendarDraft(item) {
  if (!item || item.type === 'PLACE' || !isDateKey(item.startDate)) return null;
  return { title: item.title.slice(0, 80), date: item.startDate, time: isTime(item.startTime) ? item.startTime : '' };
}
/* the same title on the same day (and time) already in the calendar counts as added */
export function isAlreadyInCalendar(draft, eventsOnDay) {
  if (!draft) return false;
  return (Array.isArray(eventsOnDay) ? eventsOnDay : []).some((e) => e.title === draft.title && (e.time || '') === draft.time);
}

export function familySendPreview(item) {
  const fields = [['이름', item.title], ['종류', typeLabel(item.type)], ['운영 기관', item.organization], ['장소', item.location || item.address], ['기간', item.startDate], ['자료 출처', item.sourceName]].filter(([, v]) => v).map(([label, value]) => ({ label, value }));
  return { fields, sendable: false, reason: 'NO_FAMILY_CONNECTION', personalDataIncluded: false };
}
