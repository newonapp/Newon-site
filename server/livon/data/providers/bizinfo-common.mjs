/*
 * 기업마당 정책정보 개방 API — shared helpers for the 지원사업정보 and 행사정보 adapters (server only).
 *
 * Both official APIs (checked 2026-09-29) share: the crtfcKey service key issued by 기업마당, dataType rss|json,
 * searchCnt / searchLclasId / hashtags / pageUnit / pageIndex, the same 분야 codes and region hashtags,
 * the RSS envelope (<rss><channel><item>) and the JSON envelope {"jsonArray":{ …, "item":[…] }}.
 * Only what is identical in both documents lives here; each adapter keeps its own endpoint and fields.
 */

/* official 분야 codes (URL코드표) */
export const FIELD_CODES = { '01': '금융', '02': '기술', '03': '인력', '04': '수출', '05': '내수', '06': '창업', '07': '경영', '09': '기타' };
/* official region hashtags (URL코드표) — '전남광주' is one official value and is kept as is */
export const REGION_TAGS = ['서울', '부산', '대구', '인천', '전남광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '경북', '경남', '제주'];

/* 분야 → LIVON category/interests. Business programmes/events are for companies and founders: only the words
   LIVON already uses for business topics are attached; nothing maps to personal finance or job seeking. */
export const CATEGORY_MAP = {
  금융: { category: '금융', interests: ['금융', '사업'] },
  기술: { category: '기술', interests: ['기술', '사업'] },
  인력: { category: '인력', interests: ['인력', '채용', '사업'] },
  수출: { category: '수출', interests: ['수출', '사업'] },
  내수: { category: '내수', interests: ['판로', '사업'] },
  창업: { category: '창업', interests: ['창업', '사업', '스타트업'] },
  경영: { category: '경영', interests: ['경영', '사업'] },
  기타: { category: null, interests: [] }
};
export function mapCategory(name) {
  const n = String(name || '').trim();
  return CATEGORY_MAP[n] || { category: null, interests: [] };
}
/* "경영@창업" (행사정보) or "창업" → every official field name, then the union of their mappings */
export function mapCategories(value) {
  const names = [...new Set(String(value || '').split('@').map(s => s.trim()).filter(Boolean))];
  const mapped = names.map(mapCategory);
  return {
    names,
    category: (mapped.find(m => m.category) || {}).category || null,
    categories: mapped.map(m => m.category).filter(Boolean),
    interests: [...new Set(mapped.flatMap(m => m.interests))]
  };
}

/* ───────── parsing (JSON or XML/RSS) ───────── */
function decodeXml(s) {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Math.min(Number(n), 0x10ffff)))
    .replace(/&amp;/g, '&');
}
export function parseErr() { const e = new Error('shape'); e.code = 'PARSE'; return e; }
export function parseXml(text) {
  if (!/<rss[\s>]/.test(text) || !/<channel[\s>]/.test(text)) throw parseErr();
  const rows = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g; let m;
  while ((m = itemRe.exec(text))) {
    const row = {};
    const fr = /<(\w+)>(<!\[CDATA\[[\s\S]*?\]\]>|[^<]*)<\/\1>/g; let f;
    while ((f = fr.exec(m[1]))) row[f[1]] = decodeXml(f[2]).trim();
    rows.push(row);
  }
  return { rows };
}
export function parseJson(obj) {
  const ja = obj && obj.jsonArray;
  if (ja == null) throw parseErr();                                  /* not the documented envelope */
  let items;
  if (Array.isArray(ja)) items = ja;                                 /* tolerate a bare array of items */
  else if (typeof ja === 'object') items = ja.item == null ? [] : Array.isArray(ja.item) ? ja.item : [ja.item];
  else throw parseErr();
  return { rows: items.filter(r => r && typeof r === 'object') };
}
export function parseBody(text, contentType = '') {
  const t = String(text || '').trim();
  if (!t) throw parseErr();
  if (/json/i.test(contentType) || t[0] === '{' || t[0] === '[') {
    let obj; try { obj = JSON.parse(t); } catch { throw parseErr(); }
    return parseJson(obj);
  }
  if (t[0] === '<') { if (/^<!doctype html|<html[\s>]/i.test(t)) throw parseErr(); return parseXml(t); }
  throw parseErr();
}

/* ───────── field helpers ───────── */
export const str = v => (v == null ? '' : String(v)).trim();
export const first = (...vs) => vs.map(str).find(Boolean) || '';
export const web = v => (/^https?:\/\/([a-z0-9-]+\.)+[a-z][a-z0-9-]+(:\d+)?(\/|$)/i.test(str(v)) ? str(v) : '');
export function ymd(v) {
  const m = /(\d{4})[-.]?(\d{2})[-.]?(\d{2})/.exec(str(v));
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return y < 1990 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31 ? null : `${m[1]}-${m[2]}-${m[3]}`;
}
/* exactly "DATE ~ DATE" (YYYYMMDD, YYYY-MM-DD or YYYY.MM.DD) → {start,end}; anything else → null (caller keeps the text) */
export function parseRange(s) {
  const m = /^\s*(\d{8}|\d{4}[-.]\d{2}[-.]\d{2})\s*~\s*(\d{8}|\d{4}[-.]\d{2}[-.]\d{2})\s*$/.exec(str(s));
  if (!m) return null;
  const start = ymd(m[1]), end = ymd(m[2]);
  if (!start || !end || end < start) return null;
  return { start, end };
}
/* "2022-09-02 15:38:29" or "20220316" → ISO (KST); anything else → null */
export function isoDateTime(v) {
  const s = str(v);
  const m = /^(\d{4})-?(\d{2})-?(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (!m || !ymd(s)) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4] || '00'}:${m[5] || '00'}:${m[6] || '00'}+09:00`);
  return isNaN(d) ? null : d.toISOString();
}
/* hashTags "2022,금융,충북,대전,중소벤처기업부" → region tags (official list only) + other tags (years dropped) */
export function splitHashTags(v) {
  const all = str(v).split(',').map(s => s.trim()).filter(Boolean);
  const regions = [...new Set(all.filter(t => REGION_TAGS.includes(t)))];
  const tags = [...new Set(all.filter(t => !REGION_TAGS.includes(t) && !/^\d{4}$/.test(t)))];
  return { regions, tags };
}
/* one simple region → location.region; several or the combined official '전남광주' → text only, no guessing */
export function regionOf(regions) {
  if (regions.length === 1 && regions[0] !== '전남광주') return regions[0];
  return null;
}

/* ───────── query mapping + bounded paging (identical in both official APIs) ───────── */
export const PAGE_UNIT = 100, MAX_PAGES = 10, MAX_TOTAL = PAGE_UNIT * MAX_PAGES;
/* LIVON route params → validated filter; anything outside the official code lists is rejected */
export function filters({ category, region } = {}) {
  const out = {};
  if (category != null && category !== '') {
    if (!Object.prototype.hasOwnProperty.call(FIELD_CODES, category)) throw Object.assign(new Error('bad'), { code: 'BAD_REQUEST' });
    out.searchLclasId = category;
  }
  if (region != null && region !== '') {
    if (!REGION_TAGS.includes(region)) throw Object.assign(new Error('bad'), { code: 'BAD_REQUEST' });
    out.hashtags = region;
  }
  return out;
}
export function buildUrl(upstream, key, { pageIndex = 1, pageUnit = PAGE_UNIT, searchLclasId, hashtags } = {}) {
  const u = new URL(upstream);
  u.searchParams.set('crtfcKey', key);
  u.searchParams.set('dataType', 'json');
  u.searchParams.set('searchCnt', String(MAX_TOTAL));   /* never 0/empty: that would request the whole database */
  if (searchLclasId) u.searchParams.set('searchLclasId', searchLclasId);
  if (hashtags) u.searchParams.set('hashtags', hashtags);
  u.searchParams.set('pageUnit', String(Math.min(pageUnit, PAGE_UNIT)));
  u.searchParams.set('pageIndex', String(pageIndex));
  return u.href;
}
/*
 * Fetch pages (bounded) and map items with toEntity.
 * Stops on an empty page, a page with no new IDs (paging ignored upstream), the reported totCnt, or MAX_PAGES.
 */
export async function fetchPages({ upstream, key, fetcher, toEntity, filter = {}, timeoutMs = 8000, budgetMs = 25000, now = Date.now() }) {
  const started = Date.now(), fetchedAt = new Date(now).toISOString();
  const byId = new Map();
  let total = null;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const left = budgetMs - (Date.now() - started);
    if (left <= 0) throw Object.assign(new Error('timeout'), { code: 'TIMEOUT' });
    let res;
    try {
      res = await fetcher(buildUrl(upstream, key, { pageIndex: page, ...filter }), { method: 'GET', headers: { accept: 'application/json, application/rss+xml;q=0.9' }, redirect: 'error', signal: AbortSignal.timeout(Math.min(timeoutMs, left)) });
    } catch (err) {
      throw Object.assign(new Error('upstream'), { code: err && (err.name === 'TimeoutError' || err.name === 'AbortError') ? 'TIMEOUT' : 'NETWORK' });
    }
    if (!res.ok) throw Object.assign(new Error('upstream'), { code: res.status >= 500 ? 'HTTP_5XX' : 'HTTP_4XX', status: res.status });
    const text = await res.text();
    if (text.length > 5_000_000) throw Object.assign(new Error('too large'), { code: 'INVALID_DATA' });
    const { rows } = parseBody(text, res.headers.get('content-type') || '');
    let added = 0;
    for (const r of rows) {
      const tc = Number(str(r.totCnt));
      if (str(r.totCnt) !== '' && Number.isFinite(tc) && tc >= 0) total = tc;
      const e = toEntity(r, fetchedAt);
      if (e && !byId.has(e.providerId)) { byId.set(e.providerId, e); added++; }
      if (byId.size >= MAX_TOTAL) break;
    }
    if (!rows.length || !added || byId.size >= MAX_TOTAL || (total != null && byId.size >= total)) break;
  }
  return [...byId.values()];
}
