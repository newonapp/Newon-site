/*
 * 스토어 (Store + Products V1, Phase 7) — the Product contract and the pure rules around it.
 *
 *   Source → normalizeProduct → Product → filter / search / sort → view
 *
 * ONGIL does not sell in V1: no cart, checkout, payment, order, shipping or inventory. A product is information
 * from a source (name, what it is for, the price text the source gave, who sells it, where to check). The view
 * never reads a raw provider payload: every item passes normalizeProduct first, and anything not in the contract
 * (ratings, review counts, stock, discounts, list prices, sales counts …) is dropped.
 *
 * No DOM, no storage, no network here.
 */
import { isPlainObject, safeText, safeHref, ContractError } from './contracts.js';

const opt = (id, label, slug, description, examples) => Object.freeze({ id, label, slug, description, examples: Object.freeze(examples) });

/* ten categories; examples are kinds of things (search words), never products */
export const PRODUCT_CATEGORIES = Object.freeze([
  opt('SAFETY_LIVING', '생활·안전', 'safety', '집 안에서 넘어지지 않고 안전하게 지내는 데 쓰는 물건', ['미끄럼 방지 매트', '야간 조명', '안전 손잡이']),
  opt('HEALTH_LIVING', '건강 생활', 'health-living', '건강한 생활 습관을 돕는 일상 용품 (의약품이나 치료 제품은 다루지 않아요)', ['물병', '자세 쿠션', '수면 안대']),
  opt('MEAL_KITCHEN', '식사·주방', 'kitchen', '식사 준비와 식사에 쓰는 물건', ['손잡이가 큰 수저', '가벼운 냄비', '미끄럼 방지 그릇']),
  opt('BATH_HOME', '욕실·주거', 'bath-home', '욕실과 집 안에서 쓰는 물건', ['목욕 의자', '욕실 손잡이', '높이 조절 변기 커버']),
  opt('MOBILITY', '이동', 'mobility', '걷고 이동할 때 쓰는 물건', ['지팡이', '보행 보조기', '보행 카트']),
  opt('EXERCISE', '운동', 'exercise', '가볍게 몸을 움직일 때 쓰는 물건', ['스트레칭 밴드', '요가 매트', '만보기']),
  opt('HOBBY', '취미', 'hobby', '취미 생활에 쓰는 물건', ['돋보기', '뜨개질 도구', '원예 도구']),
  opt('DIGITAL', '디지털', 'digital', '스마트폰·태블릿과 함께 쓰는 물건', ['큰 글씨 키보드', '거치대', '충전기']),
  opt('SMART_DEVICE', '스마트기기', 'smart-device', '집에서 쓰는 스마트기기', ['스마트 조명', '스마트 플러그', '움직임 감지 센서']),
  opt('GIFT', '선물', 'gift', '가족에게 선물하기 좋은 물건', ['생활 선물', '취미 선물', '계절 선물']),
]);
export const PRODUCT_CATEGORY_IDS = Object.freeze(PRODUCT_CATEGORIES.map((c) => c.id));
export const productCategoryById = (id) => PRODUCT_CATEGORIES.find((c) => c.id === id) || null;
export const productCategoryBySlug = (slug) => PRODUCT_CATEGORIES.find((c) => c.slug === slug) || null;
export const categoryLabel = (id) => (productCategoryById(id) || { label: '' }).label;

export const PRODUCT_LIMITS = Object.freeze({ id: 80, name: 120, summary: 300, brand: 60, priceText: 40, sellerName: 60, sourceName: 60, feature: 80, features: 8, products: 1000 });

/* V1 is a discovery layer: everything that would make it a shop is off, and says so */
export const STORE_COMMERCE = Object.freeze({ mode: 'EXTERNAL_LINK', cart: false, checkout: false, payment: false, order: false, shipping: false, inventory: false, reviews: false, alerts: false });

/*
 * Reserved for later (names only — never filled with invented values in V1):
 *   partnerId · commerceMode (EXTERNAL_LINK / AFFILIATE / MARKETPLACE / ONGIL_CHECKOUT) · certification ·
 *   deviceType · compatibility
 */
export const FUTURE_PRODUCT_FIELDS = Object.freeze(['partnerId', 'commerceMode', 'certification', 'deviceType', 'compatibility']);
/* SMART_DEVICE taxonomy for a future ONGIL Home / IoT phase. CAMERA stays optional, never a default. No pairing, no Device storage. */
export const FUTURE_DEVICE_TYPES = Object.freeze(['SENSOR', 'SOS_DEVICE', 'WATCH', 'SMART_LIGHT', 'SMART_PLUG', 'CAMERA', 'MEDICATION_DEVICE']);

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/;

/* external links: https only (no javascript:, data:, http:, in-app hashes or paths, credentials) */
export function safeExternalUrl(value) {
  const href = safeHref(value);
  return /^https:\/\//.test(href) ? href : '';
}
/* an image is shown only from a real https URL the source gave; there is no stock or placeholder image */
export function safeImageUrl(value) {
  const href = safeExternalUrl(value);
  if (!href) return '';
  try {
    const u = new URL(href);
    return /\.(svg)(\?|$)/i.test(u.pathname) ? '' : href;
  } catch {
    return '';
  }
}
function day(value) {
  if (typeof value !== 'string') return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!m) return '';
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]) ? `${m[1]}-${m[2]}-${m[3]}` : '';
}
function featureList(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const f of value) {
    const t = safeText(f, PRODUCT_LIMITS.feature);
    if (t && !out.includes(t)) out.push(t);
    if (out.length >= PRODUCT_LIMITS.features) break;
  }
  return out;
}

/*
 * Product. Required: id, name, category, summary. Everything else is optional and simply absent when the source
 * did not give it. Unknown fields are dropped (no mass assignment).
 */
export function normalizeProduct(input) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_PRODUCT');
  const id = typeof input.id === 'string' ? input.id.trim() : '';
  if (!ID.test(id)) throw new ContractError('INVALID_ID');
  const name = safeText(input.name, PRODUCT_LIMITS.name);
  if (!name) throw new ContractError('INVALID_NAME');
  if (!productCategoryById(input.category)) throw new ContractError('INVALID_CATEGORY');
  const summary = safeText(input.summary, PRODUCT_LIMITS.summary);
  if (!summary) throw new ContractError('INVALID_SUMMARY');
  const out = { id, name, category: input.category, summary, features: featureList(input.features) };
  const text = { brand: PRODUCT_LIMITS.brand, priceText: PRODUCT_LIMITS.priceText, sellerName: PRODUCT_LIMITS.sellerName, sourceName: PRODUCT_LIMITS.sourceName };
  for (const [key, max] of Object.entries(text)) {
    const v = safeText(input[key], max);
    if (v) out[key] = v;
  }
  const urls = { imageUrl: safeImageUrl(input.imageUrl), sellerUrl: safeExternalUrl(input.sellerUrl), sourceUrl: safeExternalUrl(input.sourceUrl) };
  for (const [key, v] of Object.entries(urls)) if (v) out[key] = v;
  const updated = day(input.updatedAt);
  if (updated) out.updatedAt = updated;
  return out;
}

/* a source answer → products; damaged, unsafe or duplicate entries are skipped, never fatal */
export function sanitizeProducts(list, max = PRODUCT_LIMITS.products) {
  const out = [];
  const seen = new Set();
  for (const raw of Array.isArray(list) ? list : []) {
    if (out.length >= max) break;
    let p;
    try {
      p = normalizeProduct(raw);
    } catch {
      continue;
    }
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

/* ───────── search · filter · sort ───────── */

const fold = (s) => String(s || '').toLowerCase().replace(/[\s·]+/g, '');
export function productMatches(p, query) {
  const q = fold(safeText(query, 60));
  if (!q) return true;
  return [p.name, p.summary, p.brand, categoryLabel(p.category), ...(p.features || [])].some((f) => fold(f).includes(q));
}
export function filterProducts(items, { category = '', brand = '', seller = '', query = '' } = {}) {
  return (Array.isArray(items) ? items : []).filter((p) => (!category || p.category === category) && (!brand || p.brand === brand) && (!seller || p.sellerName === seller) && productMatches(p, query));
}
/* brand / seller choices exist only when the loaded data really has more than one of them */
export function availableProductFilters(items) {
  const list = Array.isArray(items) ? items : [];
  const uniq = (key) => [...new Set(list.map((p) => p[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ko'));
  const brands = uniq('brand');
  const sellers = uniq('sellerName');
  return { categories: PRODUCT_CATEGORY_IDS.filter((c) => list.some((p) => p.category === c)), brands: brands.length > 1 ? brands : [], sellers: sellers.length > 1 ? sellers : [] };
}
/* only factual orders. There is no structured numeric price, so no price sort; no 인기·추천·판매·베스트 order exists. */
export const PRODUCT_SORTS = Object.freeze([Object.freeze({ id: 'name', label: '가나다순' })]);
export function sortProducts(items) {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => a.name.localeCompare(b.name, 'ko') || a.id.localeCompare(b.id));
}

/* ───────── detail · saved · family ───────── */

export const CLAIM_NOTE = '소개와 특징은 판매처나 자료 출처가 적은 내용이에요. ONGIL이 평가하거나 보증하지 않아요.';
export const PRICE_NOTE = '판매처가 알려 준 가격이에요. 최신 가격은 판매처에서 확인하세요.';
export function productDetailRows(p) {
  return [
    ['분류', categoryLabel(p.category)],
    ['브랜드', p.brand],
    ['자료에 적힌 소개', p.summary],
    ['판매처가 알린 가격', p.priceText],
    ['판매처', p.sellerName],
    ['자료 출처', p.sourceName],
    ['정보 갱신일', p.updatedAt],
  ]
    .filter(([, v]) => v)
    .map(([label, value]) => ({ label, value }));
}

/* the saved snapshot: existing SavedItem (type PRODUCT), the minimum to find it again — never the raw payload */
export function productSavedInput(p) {
  const cat = productCategoryById(p.category);
  return {
    type: 'PRODUCT',
    id: p.id,
    title: p.name,
    description: [cat ? cat.label : '', p.brand, p.sellerName].filter(Boolean).join(' · '),
    href: p.sellerUrl || p.sourceUrl || `#store/${cat ? cat.slug : ''}`.replace(/\/$/, ''),
    source: p.sourceName || p.sellerName || '',
  };
}

/* 가족에게 보여주기: preview only — no family is connected and nothing is sent */
export function productFamilyPreview(p) {
  const fields = [['상품 이름', p.name], ['분류', categoryLabel(p.category)], ['브랜드', p.brand], ['판매처', p.sellerName], ['판매처 주소', p.sellerUrl], ['자료 출처', p.sourceName]].filter(([, v]) => v).map(([label, value]) => ({ label, value }));
  return { fields, sendable: false, reason: 'NO_FAMILY_CONNECTION', personalDataIncluded: false, addressIncluded: false, billingIncluded: false };
}

/* ───────── comparison (screen state only, never stored) ───────── */

export const COMPARE_MAX = 3;
export const COMPARE_MISSING = '정보 없음';
const COMPARE_FIELDS = Object.freeze([['name', '이름'], ['brand', '브랜드'], ['category', '분류'], ['priceText', '판매처가 알린 가격'], ['features', '특징'], ['sellerName', '판매처']]);
export function toggleCompare(selected, id) {
  const list = Array.isArray(selected) ? selected.filter((x) => typeof x === 'string') : [];
  if (list.includes(id)) return { ok: true, selected: list.filter((x) => x !== id), added: false };
  if (list.length >= COMPARE_MAX) return { ok: false, selected: list, reason: 'MAX' };
  return { ok: true, selected: [...list, id], added: true };
}
export function compareRows(products) {
  const list = (Array.isArray(products) ? products : []).slice(0, COMPARE_MAX);
  return COMPARE_FIELDS.map(([key, label]) => ({
    key,
    label,
    values: list.map((p) => {
      const raw = key === 'category' ? categoryLabel(p.category) : key === 'features' ? (p.features || []).join(', ') : p[key] || '';
      return { id: p.id, name: p.name, value: raw || COMPARE_MISSING, missing: !raw };
    }),
  }));
}
