/*
 * 마을세무사 (공공기관이 공개한 마을세무사 지정 정보) — logical provider `kr-public-tax-expert`, server only.
 *
 * There is NO national, unified 마을세무사 person API (checked 2026-09-29 on 공공데이터포털, keyword "마을세무사":
 * 20 regional file datasets, 2 OpenAPIs — one of them is 행정안전부 통계연보 (counts, not people)).
 * V1 therefore connects a few regional sources whose contract and columns were read on the official pages.
 * Each source is its own adapter; one failing source never takes the others down.
 *
 * Meaning of a record: "<기관>이 공개한 마을세무사 지정 정보". It is NOT a LIVON verification and NOT a check of a
 * 세무사 licence. No qualification, career, rating, review, price, availability, photo, gender or age exists here.
 */
import { createHash } from 'node:crypto';

export const PROVIDER_ID = 'kr-public-tax-expert';
export const PROVIDER_NAME = '공공기관 공개 마을세무사 정보';
export const ENV_KEY = 'PUBLIC_DATA_SERVICE_KEY';        /* 공공데이터포털 일반 인증키 (each API still needs its own 활용신청) */
export const ROLE = '마을세무사';
export const TRUST = 'public_designated';
export const PROGRAM_URL = 'https://www.data.go.kr/data/15107426/openapi.do';   /* 행정안전부_통계연보_마을세무사 (제도 통계, 사람 정보 아님) */

const str = v => (v == null ? '' : String(v)).trim();
function fail(code) { return Object.assign(new Error('upstream'), { code }); }
export function text(v, max = 200) {
  const s = str(v).replace(/<(script|style)[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
/* Korean phone as given, digits/hyphens only; anything else is dropped (never guessed) */
export function phone(v) {
  const s = str(v).replace(/[\s.]/g, '-').replace(/-+/g, '-');
  return /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(s) ? s : '';
}
function plainKey(key) { const k = str(key); if (/%[0-9A-Fa-f]{2}/.test(k)) { try { return decodeURIComponent(k); } catch { return k; } } return k; }

/*
 * Source registry (allowlist). Every value is copied from the official page named in `page`.
 *   fields  : official column / item names
 *   phone   : 'consultation' only when the dataset states the number is published for 주민 상담·문의
 */
export const SOURCES = Object.freeze({
  'daegu-donggu': Object.freeze({
    id: 'daegu-donggu',
    organization: '대구광역시 동구',
    dataset: '대구광역시 동구_마을세무사 현황',
    page: 'https://www.data.go.kr/data/15110587/openapi.do',          /* OpenAPI · REST · JSON · 수정일 2025-08-28 · 이용허락범위 제한 없음 */
    endpoint: 'https://apis.data.go.kr/3420000/villageTaxAccountantService/getVillageTaxAccountant',
    kind: 'gw',                                                        /* serviceKey, pageNo, numOfRows (+ TELNO filter, unused) */
    fields: ['EMD_NM', 'LNDCTN_NM', 'TELNO'],                           /* 읍면동 명, 세무사 명, 전화번호 */
    region: '대구', city: '대구광역시 동구',
    referenceDate: '2025-08-28', referenceKind: 'modified',            /* dataset 수정일 — the API has no date field */
    phone: 'consultation',                                             /* 설명: 전화번호로 … 상담 예약이나 문의 */
    semantics: '대구광역시 동구가 공개한 마을세무사 현황(읍면동별)'
  }),
  incheon: Object.freeze({
    id: 'incheon',
    organization: '인천광역시',
    dataset: '인천광역시_마을세무사_20260228',
    page: 'https://www.data.go.kr/data/15029613/fileData.do',         /* 파일데이터 CSV + 자동변환 OpenAPI · 연간 · 수정일 2026-03-09 · 제한 없음 */
    endpoint: 'https://api.odcloud.kr/api/15029613/v1/uddi:54dc07f0-3218-48c8-ad27-93328148ad2d',   /* 20260228 version */
    kind: 'odcloud',                                                   /* page, perPage, returnType, serviceKey */
    fields: ['구분', '세무사명', '활동마을'],                            /* the 20260228 version has no 전화번호 column */
    region: '인천', city: '',
    referenceDate: '2026-02-28', referenceKind: 'reference',           /* date in the official file name */
    phone: 'none',
    semantics: '인천광역시가 공개한 마을세무사 현황(군·구, 활동마을)'
  })
});
export const SOURCE_IDS = Object.freeze(Object.keys(SOURCES));
export const REGIONS = Object.freeze([...new Set(SOURCE_IDS.map(k => SOURCES[k].region))]);
const MAX_PAGES = 5, ROWS = 100;

export function requestUrl(src, key, page) {
  const u = new URL(src.endpoint);
  u.searchParams.set('serviceKey', plainKey(key));
  if (src.kind === 'gw') { u.searchParams.set('pageNo', String(page)); u.searchParams.set('numOfRows', String(ROWS)); }
  else { u.searchParams.set('page', String(page)); u.searchParams.set('perPage', String(ROWS)); u.searchParams.set('returnType', 'JSON'); }
  return u.href;
}

/* response → rows; gateway errors (XML) and unknown shapes are errors, never "zero people" */
export function parseBody(src, body) {
  const t = str(body);
  if (!t) throw fail('PARSE');
  if (t[0] !== '{') {
    if (/LIMITED_NUMBER_OF_SERVICE_REQUESTS/.test(t) || /<returnReasonCode>\s*2[23]\s*</.test(t)) throw fail('QUOTA');
    if (/SERVICETIMEOUT_ERROR/.test(t)) throw fail('TIMEOUT');
    throw fail(/SERVICE_KEY|ACCESS_DENIED|PERMISSION|DEADLINE|UNREGISTERED_IP/.test(t) ? 'HTTP_4XX' : 'PARSE');
  }
  let o; try { o = JSON.parse(t); } catch { throw fail('PARSE'); }
  if (src.kind === 'odcloud') {
    if (!o || !Array.isArray(o.data)) throw fail('PARSE');
    const total = Number(o.totalCount);
    return { rows: o.data.filter(r => r && typeof r === 'object'), total: Number.isFinite(total) ? total : null };
  }
  const r = o && (o.response || o);
  const h = r && r.header;
  if (!h || typeof h !== 'object') throw fail('PARSE');
  const rc = str(h.resultCode);
  if (rc === '03') return { rows: [], total: 0 };
  if (rc !== '00' && rc !== '0' && rc !== '0000') throw fail(rc === '22' || rc === '23' ? 'QUOTA' : rc === '05' ? 'TIMEOUT' : 'PARSE');
  const b = r.body && typeof r.body === 'object' ? r.body : {};
  const items = b.items;
  const rows = Array.isArray(items) ? items : items && typeof items === 'object' ? (Array.isArray(items.item) ? items.item : items.item ? [items.item] : []) : [];
  const total = Number(b.totalCount);
  return { rows: rows.filter(x => x && typeof x === 'object'), total: Number.isFinite(total) ? total : null };
}

/* one official row → { name, area, district, phone } using only the source's own columns */
export function readRow(src, r) {
  if (src.id === 'daegu-donggu') return { name: text(r.LNDCTN_NM, 40), area: text(r.EMD_NM, 60), district: text(r.EMD_NM, 40), city: src.city, phone: src.phone === 'consultation' ? phone(r.TELNO) : '' };
  if (src.id === 'incheon') {
    const gu = text(r['구분'], 20), areas = text(r['활동마을'], 200);
    return { name: text(r['세무사명'], 40), area: [gu, areas].filter(Boolean).join(' '), district: '', city: gu ? '인천광역시 ' + gu : '', phone: '' };
  }
  return null;
}

/* stable id: source + name + assigned area (+ an ordinal only when the same source lists the same name+area twice) */
export function stableId(src, row, ordinal = 0) {
  return 'tx' + createHash('sha256').update([src.id, src.dataset, row.name, row.area, ordinal].join('|')).digest('hex').slice(0, 24);
}

export function toEntity(src, row, id, fetchedAt) {
  if (!row || !row.name) return null;
  return {
    type: 'expert',
    provider: PROVIDER_ID,
    providerId: id,
    title: row.name,
    name: row.name,
    role: ROLE,
    trustLevel: TRUST,
    summary: null,
    category: '세무',
    tags: [ROLE, src.organization],
    interests: [],
    lifeStages: [],
    organization: null,                                   /* no 사무소/소속 column in these sources */
    serviceArea: row.area || null,                        /* 담당 지역 as given */
    sourceOrganization: src.organization,
    sourceDataset: src.dataset,
    specialties: [], credentials: [], serviceTypes: [], consultationMethods: [],   /* never filled: not in the data */
    designationStart: null, designationEnd: null,         /* no 지정 기간 in these sources */
    location: { country: 'KR', region: src.region, city: row.city || null, district: row.district || null },
    contact: row.phone ? { phone: row.phone } : null,
    source: {
      providerName: PROVIDER_NAME,
      sourceUrl: src.page,
      fetchedAt,
      updatedAt: null,
      license: '공공데이터포털 · 이용허락범위 제한 없음',
      attribution: '출처: ' + src.organization + ' (' + src.dataset + ')'
    },
    metadata: {
      freshness: 'source-dated',
      sourceId: src.id,
      referenceDate: src.referenceDate,
      referenceKind: src.referenceKind,
      phonePurpose: row.phone ? src.phone : '',
      semantics: src.semantics
    }
  };
}

async function loadSource(src, { key, fetcher, timeoutMs, fetchedAt }) {
  const out = [], seen = {};
  let total = null;
  for (let page = 1; page <= MAX_PAGES; page++) {
    let res;
    try { res = await fetcher(requestUrl(src, key, page), { method: 'GET', headers: { accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(timeoutMs) }); }
    catch (err) { throw fail(err && (err.name === 'TimeoutError' || err.name === 'AbortError') ? 'TIMEOUT' : 'NETWORK'); }
    const body = await res.text();
    if (body.length > 2_000_000) throw fail('INVALID_DATA');
    if (!res.ok) { if (/LIMITED_NUMBER_OF_SERVICE_REQUESTS/.test(body)) throw fail('QUOTA'); throw fail(res.status >= 500 ? 'HTTP_5XX' : 'HTTP_4XX'); }
    const r = parseBody(src, body);
    if (r.total != null) total = r.total;
    for (const raw of r.rows) {
      const row = readRow(src, raw);
      if (!row || !row.name) continue;
      const base = [row.name, row.area].join('|');
      const ord = seen[base] = (seen[base] == null ? 0 : seen[base] + 1);
      const e = toEntity(src, row, stableId(src, row, ord), fetchedAt);
      if (e) out.push(e);
    }
    if (!r.rows.length || (total != null && page * ROWS >= total)) break;
  }
  return out;
}

/*
 * All sources in parallel; each failure is isolated (Promise.allSettled). Returns
 * { items, partial, sources: {id: 'ok'|'error'} } — all sources failing is an error for the route.
 */
export async function fetchAll({ key, fetcher, timeoutMs = 8000, now = Date.now(), only = SOURCE_IDS } = {}) {
  const fetchedAt = new Date(now).toISOString();
  const ids = only.filter(id => SOURCE_IDS.includes(id));
  const settled = await Promise.allSettled(ids.map(id => loadSource(SOURCES[id], { key, fetcher, timeoutMs, fetchedAt })));
  const sources = {}, items = [];
  let firstErr = null;
  settled.forEach((s, i) => {
    if (s.status === 'fulfilled') { sources[ids[i]] = 'ok'; items.push(...s.value); }
    else { sources[ids[i]] = 'error'; firstErr = firstErr || s.reason; }
  });
  if (!items.length && firstErr && Object.values(sources).every(v => v === 'error')) throw firstErr;
  return { items, partial: Object.values(sources).includes('error'), sources };
}

/* route filters over the loaded list (the data is tiny; no upstream filter is used) */
export function filters({ region, query } = {}) {
  const out = {};
  if (region != null && region !== '') { if (!REGIONS.includes(region)) throw Object.assign(new Error('bad'), { code: 'BAD_REQUEST' }); out.region = region; }
  if (query != null && query !== '') {
    const q = String(query).replace(/\s+/g, ' ').trim();
    if (!q || q.length > 30 || /[\u0000-\u001f\u007f<>]/.test(q) || /\d{3,}/.test(q)) throw Object.assign(new Error('bad'), { code: 'BAD_REQUEST' });   /* no phone-number lookups */
    out.query = q;
  }
  return out;
}
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, '');
export function matches(e, f) {
  if (f.region && !(e.location && e.location.region === f.region)) return false;
  if (f.query) {
    const hay = norm([e.title, e.role, e.serviceArea, e.sourceOrganization, e.category].join(' '));    /* never the phone number */
    if (!f.query.split(' ').every(w => hay.includes(norm(w)))) return false;
  }
  return true;
}
