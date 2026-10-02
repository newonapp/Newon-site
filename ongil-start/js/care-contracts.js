/*
 * Care contracts (Phase 4) — CareService · PublicBenefit · Facility, the care categories, and the pure helpers
 * the 돌봄·서비스 screen uses (filter, search, saved input, family-send preview, link checks).
 *
 * Three types, kept apart on purpose — they answer different questions:
 *   CARE_SERVICE    a service someone provides (돌봄, 병원 동행, 식사 배달 …)
 *   PUBLIC_BENEFIT  a public programme with conditions set by an official body. ONGIL never decides eligibility.
 *   FACILITY        a place to go or call (복지관, 행정복지센터, 보건소 …)
 * (PROVIDER — the organisation behind services — is reserved for later.)
 *
 * Content comes only from a connected source (data-source.js). Nothing here holds or invents an item.
 * There is no booking, application or payment: no field says otherwise, and nothing sets one.
 */
import { ContractError, isPlainObject, safeText, REGIONS } from './contracts.js';

const opt = (id, label, description) => Object.freeze({ id, label, description });

export const CARE_TYPES = Object.freeze([opt('CARE_SERVICE', '서비스', '도움을 주는 서비스'), opt('PUBLIC_BENEFIT', '혜택·복지', '공공기관이 정한 지원 제도'), opt('FACILITY', '기관·시설', '찾아가거나 전화할 수 있는 곳')]);
export const CARE_TYPE_IDS = Object.freeze(CARE_TYPES.map((t) => t.id));

/* eleven categories, each with one plain sentence (senior UX: what the word means, without changing official meanings) */
export const CARE_CATEGORIES = Object.freeze([
  opt('care', '돌봄', '집에서 돌봄을 받거나 낮 동안 돌봄을 받는 것'),
  opt('living', '생활지원', '혼자 하기 어려운 일상의 일을 도와받는 것'),
  opt('hospital-escort', '병원 동행', '병원에 갈 때 함께 가 주는 도움'),
  opt('mobility', '이동', '차량이나 동행으로 다니기 쉽게 돕는 것'),
  opt('meals', '식사', '도시락, 식사 배달, 함께 먹는 식당'),
  opt('housekeeping', '청소·세탁', '청소나 빨래 같은 집안일 도움'),
  opt('shopping', '장보기', '장보기를 대신하거나 함께하는 도움'),
  opt('housing', '주거·안전', '집 수리, 안전 손잡이, 주거 지원'),
  opt('digital', '디지털 도움', '스마트폰과 인터넷 사용을 배우거나 도움받기'),
  opt('welfare', '복지·공공지원', '나라와 지자체가 정한 지원 제도'),
  opt('facility', '기관·시설', '복지관, 행정복지센터, 보건소 같은 가까운 기관'),
]);
export const CARE_CATEGORY_IDS = Object.freeze(CARE_CATEGORIES.map((c) => c.id));
export const careCategoryById = (id) => CARE_CATEGORIES.find((c) => c.id === id) || null;

/* kinds of facility the 기관·시설 search can look for (search words, not claims about what each one offers) */
export const FACILITY_KINDS = Object.freeze([
  Object.freeze({ id: 'senior-welfare', label: '노인복지관', query: '노인복지관' }),
  Object.freeze({ id: 'community-center', label: '행정복지센터 (주민센터)', query: '행정복지센터' }),
  Object.freeze({ id: 'health-center', label: '보건소', query: '보건소' }),
  Object.freeze({ id: 'dementia-center', label: '치매안심센터', query: '치매안심센터' }),
  Object.freeze({ id: 'long-term-care', label: '장기요양기관', query: '장기요양기관' }),
]);
export const facilityKindById = (id) => FACILITY_KINDS.find((k) => k.id === id) || null;

/* ───────── links ───────── */

/* official source: https, no credentials, and a public-sector Korean domain. Anything else is not called "공식". */
const OFFICIAL_SUFFIXES = ['.go.kr', '.or.kr'];
export function officialUrl(value) {
  if (typeof value !== 'string' || value.length > 500) return '';
  try {
    const u = new URL(value.trim());
    if (u.protocol !== 'https:' || u.username || u.password || u.port) return '';
    const host = u.hostname.toLowerCase();
    return OFFICIAL_SUFFIXES.some((s) => host.endsWith(s) && host.length > s.length) ? u.href : '';
  } catch {
    return '';
  }
}
/* a map page link (Kakao Map) — useful, but never presented as an official source */
export function mapUrl(value) {
  if (typeof value !== 'string' || value.length > 500) return '';
  try {
    const u = new URL(value.trim());
    if (u.protocol !== 'https:' || u.username || u.password) return '';
    return /(^|\.)kakao\.com$/i.test(u.hostname) ? u.href : '';
  } catch {
    return '';
  }
}
/* phone numbers as published: digits and hyphens only, 7–15 digits */
export function cleanPhone(value) {
  const v = typeof value === 'string' ? value.trim() : '';
  return /^[0-9][0-9-]{5,18}[0-9]$/.test(v) && v.replace(/-/g, '').length >= 7 && v.replace(/-/g, '').length <= 15 ? v : '';
}
const CARE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,120}$/;
const dateText = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : '');
const regionOf = (v) => (REGIONS.some((r) => r.id === v) ? v : '');

/* ───────── the three contracts ───────── */

export function normalizeCareService(input) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_CARE');
  if (!CARE_ID.test(String(input.id))) throw new ContractError('INVALID_ID');
  const title = safeText(input.title, 120);
  if (!title) throw new ContractError('INVALID_TITLE');
  if (!careCategoryById(input.category) || input.category === 'facility') throw new ContractError('INVALID_CATEGORY');
  return {
    type: 'CARE_SERVICE',
    id: input.id,
    title,
    category: input.category,
    summary: safeText(input.summary, 300),
    region: regionOf(input.region),
    costText: safeText(input.costText, 120),
    hoursText: safeText(input.hoursText, 120),
    phone: cleanPhone(input.phone),
    sourceName: safeText(input.sourceName, 80),
    sourceUrl: officialUrl(input.sourceUrl),
    updatedAt: dateText(input.updatedAt),
    /* no source in Phase 4 offers booking; the field exists so it can never be assumed */
    bookingAvailable: false,
  };
}

export function normalizePublicBenefit(input) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_BENEFIT');
  if (!CARE_ID.test(String(input.id))) throw new ContractError('INVALID_ID');
  const title = safeText(input.title, 120);
  if (!title) throw new ContractError('INVALID_TITLE');
  if (!careCategoryById(input.category) || input.category === 'facility') throw new ContractError('INVALID_CATEGORY');
  const sourceName = safeText(input.sourceName, 80);
  if (!sourceName) throw new ContractError('INVALID_SOURCE');
  return {
    type: 'PUBLIC_BENEFIT',
    id: input.id,
    title,
    category: input.category,
    summary: safeText(input.summary, 300),
    eligibilityText: safeText(input.eligibilityText, 300),
    region: regionOf(input.region),
    applicationText: safeText(input.applicationText, 300),
    sourceName,
    sourceUrl: officialUrl(input.sourceUrl),
    updatedAt: dateText(input.updatedAt),
    /* ONGIL shows what the source says; it never decides who qualifies and never applies on anyone's behalf */
    applicationAvailable: false,
  };
}

export function normalizeFacility(input) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_FACILITY');
  if (!CARE_ID.test(String(input.id))) throw new ContractError('INVALID_ID');
  const name = safeText(input.name, 120);
  if (!name) throw new ContractError('INVALID_NAME');
  const sourceName = safeText(input.sourceName, 80);
  if (!sourceName) throw new ContractError('INVALID_SOURCE');
  return {
    type: 'FACILITY',
    id: input.id,
    title: name,
    name,
    category: 'facility',
    kind: facilityKindById(input.kind) ? input.kind : '',
    placeType: safeText(input.placeType, 80),
    address: safeText(input.address, 160),
    region: regionOf(input.region),
    phone: cleanPhone(input.phone),
    sourceName,
    sourceUrl: officialUrl(input.sourceUrl),
    mapUrl: mapUrl(input.mapUrl),
    updatedAt: dateText(input.updatedAt),
  };
}

const NORMALIZE = { CARE_SERVICE: normalizeCareService, PUBLIC_BENEFIT: normalizePublicBenefit, FACILITY: normalizeFacility };
/* anything a source returns goes through this; bad items are dropped, never "fixed" with invented values */
export function sanitizeCareItems(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seen = new Set();
  for (const raw of list) {
    const fn = raw && NORMALIZE[raw.type];
    if (!fn) continue;
    try {
      const item = fn(raw);
      const key = `${item.type}:${item.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    } catch {
      /* dropped */
    }
  }
  return out;
}

/* ───────── filter · search ───────── */

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, '');
export function filterCare(items, { type = '', category = '', region = '', query = '' } = {}) {
  const q = norm(safeText(query, 60));
  return (Array.isArray(items) ? items : []).filter((it) => {
    if (type && it.type !== type) return false;
    if (category && it.category !== category) return false;
    if (region && it.region && it.region !== region) return false;
    if (q && ![it.title, it.summary, it.address, it.placeType, it.sourceName].some((f) => norm(f).includes(q))) return false;
    return true;
  });
}
/* which filter choices mean something for what is loaded right now (others are disabled, never given fake counts) */
export function availableFilters(items) {
  const list = Array.isArray(items) ? items : [];
  return { types: CARE_TYPE_IDS.filter((t) => list.some((i) => i.type === t)), regions: REGIONS.map((r) => r.id).filter((r) => list.some((i) => i.region === r)) };
}

/* ───────── detail rows (only fields that exist) ───────── */

export function detailRows(item) {
  if (!item) return [];
  const typeLabel = (CARE_TYPES.find((t) => t.id === item.type) || { label: '' }).label;
  const rows = [
    ['종류', typeLabel],
    ['분류', item.type === 'FACILITY' ? (facilityKindById(item.kind) || { label: item.placeType || '' }).label : (careCategoryById(item.category) || { label: '' }).label],
    ['설명', item.summary],
    ['대상', item.eligibilityText],
    ['신청 방법 (공식 안내 내용)', item.applicationText],
    ['지역', item.region],
    ['비용', item.costText],
    ['운영 시간', item.hoursText],
    ['주소', item.address],
    ['전화', item.phone],
    ['자료 출처', item.sourceName],
    ['자료 날짜', item.updatedAt],
  ];
  return rows.filter(([, v]) => typeof v === 'string' && v.trim() !== '').map(([label, value]) => ({ label, value }));
}

/* ───────── saved · family preview ───────── */

/* Care types map onto the existing SavedItem types (Phase 1): no new saved type, nothing to migrate */
export const SAVED_TYPE_OF = Object.freeze({ CARE_SERVICE: 'SERVICE', PUBLIC_BENEFIT: 'BENEFIT', FACILITY: 'FACILITY' });
export function savedInputFor(item) {
  return {
    type: SAVED_TYPE_OF[item.type],
    id: item.id,
    title: item.title,
    description: [item.type === 'FACILITY' ? item.address : item.summary, item.phone].filter(Boolean).join(' · '),
    href: item.sourceUrl || item.mapUrl || '#care',
    source: item.sourceName,
  };
}

/* what "가족에게 보내기" WOULD send once a family member is connected — public facts about the item only */
export function familySendPreview(item) {
  const fields = [['이름', item.title], ['종류', (CARE_TYPES.find((t) => t.id === item.type) || { label: '' }).label], ['주소', item.address], ['전화', item.phone], ['자료 출처', item.sourceName]].filter(([, v]) => v).map(([label, value]) => ({ label, value }));
  return { fields, sendable: false, reason: 'NO_FAMILY_CONNECTION', personalDataIncluded: false };
}
