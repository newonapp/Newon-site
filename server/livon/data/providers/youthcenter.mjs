/*
 * 온통청년 (한국고용정보원) — 청년정책 Open API adapter (server only).
 *
 * Source of every name below: 온통청년 「오픈(OPEN) API 제공목록 › 청년정책」
 *   https://www.youthcenter.go.kr/cmnFooter/openapiIntro/oaiDoc   (checked 2026-09-29)
 *   request URL : https://www.youthcenter.go.kr/go/ythip/getPlcy
 *   parameters  : apiKeyNm (required), pageNum, pageSize, pageType, plcyNo, rtnType (xml|json),
 *                 plcyKywdNm, plcyExplnCn, plcyNm, zipCd, lclsfNm, mclsfNm
 *   output list : <youthPolicyList> … fields plcyNo, plcyNm, plcyKywdNm, plcyExplnCn, lclsfNm, mclsfNm,
 *                 plcySprtCn, sprvsnInstCdNm, operInstCdNm, rgtrInstCdNm, aplyUrlAddr, refUrlAddr1/2,
 *                 sprtTrgtMinAge, sprtTrgtMaxAge, sprtTrgtAgeLmtYn, earnEtcCn, addAplyQlfcCndCn,
 *                 ptcpPrpTrgtCn, aplyYmd, bizPrdBgngYmd, bizPrdEndYmd, zipCd, frstRegDt, lastMdfcnDt …
 * Not verified yet (no key; the sample response and the code table are not readable without one):
 *   - the exact JSON/XML envelope around <youthPolicyList> and the total-count field name
 *   - the text format of aplyYmd / dates and the meaning of the *Cd code values
 * The parser therefore locates <youthPolicyList> wherever it is and reads dates defensively;
 * values it cannot read are left empty (never guessed). Codes are never shown to users.
 * 조회수(inqCnt) is intentionally dropped — LIVON shows no popularity numbers.
 */

export const PROVIDER_ID = 'kr-youth-policy';
export const PROVIDER_NAME = '온통청년';
export const ENV_KEY = 'YOUTHCENTER_API_KEY';
export const UPSTREAM = 'https://www.youthcenter.go.kr/go/ythip/getPlcy'; // fixed; clients can never choose it
export const OFFICIAL_SEARCH = 'https://www.youthcenter.go.kr/youthPolicy/ythPlcyTotalSearch';
export const LICENSE = '온통청년 오픈API (한국고용정보원)';

/* ───────── parsing (JSON or XML) ───────── */
function decodeXml(s) {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Math.min(Number(n), 0x10ffff)))
    .replace(/&amp;/g, '&');
}
/* flat XML records: leaf elements in document order; each <plcyNo> starts a new policy record */
export function parseXml(text) {
  const rows = [];
  let cur = null;
  const re = /<(\w+)>(<!\[CDATA\[[\s\S]*?\]\]>|[^<]*)<\/\1>/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[1] === 'plcyNo') { if (cur && cur.plcyNo) rows.push(cur); cur = {}; }
    if (cur) cur[m[1]] = decodeXml(m[2]).trim();
  }
  if (cur && cur.plcyNo) rows.push(cur);
  const total = (/<(?:totCount|totalCount|totCnt)>\s*(\d+)\s*</.exec(text) || [])[1];
  return { rows, total: total ? Number(total) : null };
}
/* JSON: find the youthPolicyList array wherever the envelope puts it */
export function parseJson(obj) {
  let rows = null, total = null;
  const walk = (o, depth) => {
    if (!o || typeof o !== 'object' || depth > 6) return;
    for (const [k, v] of Object.entries(o)) {
      if (rows === null && k === 'youthPolicyList') {
        if (Array.isArray(v)) rows = v;
        else if (v && typeof v === 'object') rows = Array.isArray(v.youthPolicy) ? v.youthPolicy : (v.plcyNo ? [v] : Object.values(v).find(Array.isArray) || []);
      }
      if (total === null && /^(totCount|totalCount|totCnt)$/.test(k) && Number.isFinite(Number(v))) total = Number(v);
      if (v && typeof v === 'object') walk(v, depth + 1);
    }
  };
  walk(obj, 0);
  if (rows === null) { const e = new Error('shape'); e.code = 'PARSE'; throw e; } /* not the documented list → error, never "0 policies" */
  return { rows: rows.filter(r => r && typeof r === 'object' && r.plcyNo != null), total };
}
export function parseBody(text, contentType = '') {
  const t = String(text || '').trim();
  if (!t) return { rows: [], total: 0 };
  if (/json/i.test(contentType) || t[0] === '{' || t[0] === '[') {
    let obj; try { obj = JSON.parse(t); } catch { const e = new Error('parse'); e.code = 'PARSE'; throw e; }
    return parseJson(obj);
  }
  if (t[0] === '<') {
    /* an HTML maintenance/error page is not an empty result */
    if (/^<!doctype html|<html[\s>]/i.test(t) || !/<youthPolicyList[\s>/]/.test(t)) { const e = new Error('shape'); e.code = 'PARSE'; throw e; }
    return parseXml(t);
  }
  const e = new Error('parse'); e.code = 'PARSE'; throw e;
}

/* ───────── field helpers ───────── */
const str = v => (v == null ? '' : String(v)).trim();
const splitList = v => str(v).split(/[,，、]/).map(s => s.trim()).filter(Boolean);
/* YYYYMMDD / YYYY-MM-DD / YYYY.MM.DD (+ optional time) → YYYY-MM-DD, otherwise null */
export function ymd(v) {
  const m = /(\d{4})[-.]?(\d{2})[-.]?(\d{2})/.exec(str(v));
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 1990 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}
/* "YYYYMMDD ~ YYYYMMDD" (two dates) → {start,end}; one date or none → no machine-readable period */
export function applicationPeriod(raw) {
  const s = str(raw.aplyYmd);
  const dates = (s.match(/\d{4}[-.]?\d{2}[-.]?\d{2}/g) || []).map(ymd).filter(Boolean);
  const out = { start: null, end: null, note: s ? s.slice(0, 200) : null };
  if (dates.length >= 2) { out.start = dates[0]; out.end = dates[dates.length - 1]; if (out.end < out.start) out.end = null; }
  return out.start || out.end || out.note ? out : null;
}
/* datetime strings → ISO (KST) or null */
function isoDateTime(v) {
  const s = str(v);
  const m = /(\d{4})[-.]?(\d{2})[-.]?(\d{2})(?:[ T]?(\d{2}):?(\d{2})(?::?(\d{2}))?)?/.exec(s);
  if (!m || !ymd(s)) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4] || '00'}:${m[5] || '00'}:${m[6] || '00'}+09:00`);
  return isNaN(d) ? null : d.toISOString();
}

/* ───────── age → LIVON life stages (10 = 10대 … 70 = 70대 이상) ───────── */
export function lifeStagesForAge(raw) {
  if (str(raw.sprtTrgtAgeLmtYn).toUpperCase() === 'N') return [];      /* no age limit → not tied to a stage */
  const min = Number(str(raw.sprtTrgtMinAge)), max = Number(str(raw.sprtTrgtMaxAge));
  if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max <= 0 || min > max || max > 120) return [];
  const out = [];
  for (let s = 10; s <= 70; s += 10) {
    const lo = s === 10 ? 0 : s, hi = s === 70 ? 200 : s + 9;
    if (min <= hi && max >= lo) out.push(String(s));
  }
  return out.length === 7 ? [] : out;                                   /* spans everyone → no specific stage */
}
export function ageText(raw) {
  if (str(raw.sprtTrgtAgeLmtYn).toUpperCase() === 'N') return '연령 제한 없음';
  const min = Number(str(raw.sprtTrgtMinAge)), max = Number(str(raw.sprtTrgtMaxAge));
  return Number.isInteger(min) && Number.isInteger(max) && min > 0 && max >= min ? `만 ${min}~${max}세` : '';
}

/* ───────── 정책 분류명 → LIVON category / interests ─────────
   Input is the 대분류/중분류 *name* returned by the API (lclsfNm/mclsfNm), matched by keyword so that
   renamed or new sub-categories still land somewhere sensible; unknown names map to nothing.
   The words on the right are the ones LIVON topics/search already use. */
export const CATEGORY_RULES = [
  { re: /창업/, category: '창업', interests: ['창업', '사업', '커리어'] },
  { re: /일자리|취업|고용|채용|직업|재직/, category: '일자리', interests: ['취업', '커리어', '일자리', '이직'] },
  { re: /주거|주택|전월세|임대/, category: '주거', interests: ['주거', '독립'] },
  { re: /교육|훈련|역량|학자금|장학|학습/, category: '교육', interests: ['교육', '배움', '자기계발', '대학'] },
  { re: /금융|자산|저축|대출|생활비|소득/, category: '금융', interests: ['돈', '재테크', '자산관리', '생활비'] },
  { re: /건강|의료|심리|마음/, category: '건강', interests: ['건강'] },
  { re: /문화|예술|여가|체육/, category: '문화', interests: ['문화', '취미', '여행'] },
  { re: /복지/, category: '복지', interests: ['복지', '공공지원'] },
  { re: /참여|권리|정책제안|활동/, category: '참여', interests: ['참여', '관계', '지역 활동'] }
];
export function mapCategory(raw) {
  const names = [str(raw.mclsfNm), str(raw.lclsfNm)].join(' ');
  const hits = CATEGORY_RULES.filter(r => r.re.test(names));
  return {
    category: hits.length ? hits[0].category : null,
    interests: [...new Set(hits.flatMap(r => r.interests))]
  };
}

/* ───────── 법정 시도 코드(앞 2자리) → 지역명 ───────── */
const SIDO = { 11: '서울', 26: '부산', 27: '대구', 28: '인천', 29: '광주', 30: '대전', 31: '울산', 36: '세종', 41: '경기', 42: '강원', 51: '강원', 43: '충북', 44: '충남', 45: '전북', 52: '전북', 46: '전남', 47: '경북', 48: '경남', 50: '제주' };
export function region(raw) {
  const codes = splitList(raw.zipCd).filter(c => /^\d{5}$/.test(c));
  if (!codes.length) return null;
  const names = [...new Set(codes.map(c => SIDO[c.slice(0, 2)]).filter(Boolean))];
  if (names.length >= 17) return '전국';
  return names.length === 1 ? names[0] : names.length ? names.slice(0, 3).join('·') + (names.length > 3 ? ' 외' : '') : null;
}

/* ───────── one API row → LIVON policy entity candidate (validated later by the shared schema) ───────── */
export function toEntity(raw, fetchedAt) {
  const plcyNo = str(raw.plcyNo), title = str(raw.plcyNm);
  if (!plcyNo || !title) return null;
  const cat = mapCategory(raw);
  const keywords = splitList(raw.plcyKywdNm);
  const age = ageText(raw);
  const eligibility = [age, str(raw.earnEtcCn), str(raw.addAplyQlfcCndCn)].filter(Boolean).join(' · ') || null;
  /* only real web links survive; anything else (javascript:, IPs, garbage) falls back to 온통청년's own search page */
  const web = v => (/^https?:\/\/([a-z0-9-]+\.)+[a-z][a-z0-9-]+(:\d+)?(\/|$)/i.test(str(v)) ? str(v) : '');
  const apply = web(raw.aplyUrlAddr), ref = web(raw.refUrlAddr1) || web(raw.refUrlAddr2);
  const reg = region(raw);
  return {
    type: 'policy',
    provider: PROVIDER_ID,
    providerId: plcyNo,
    title,
    summary: str(raw.plcyExplnCn) || null,
    description: str(raw.plcyExplnCn) || null,
    category: cat.category,
    tags: [...keywords, str(raw.lclsfNm), str(raw.mclsfNm)].filter(Boolean),
    interests: cat.interests,
    lifeStages: lifeStagesForAge(raw),
    agency: str(raw.sprvsnInstCdNm) || str(raw.operInstCdNm) || str(raw.rgtrInstCdNm) || null,
    jurisdiction: reg,
    eligibility,
    benefits: str(raw.plcySprtCn) || null,
    applicationPeriod: applicationPeriod(raw),
    applicationUrl: apply || null,
    officialSource: ref || apply || OFFICIAL_SEARCH,
    location: reg ? { country: 'KR', region: reg } : { country: 'KR' },
    source: {
      providerName: PROVIDER_NAME,
      sourceUrl: ref || apply || OFFICIAL_SEARCH,
      fetchedAt,
      updatedAt: isoDateTime(raw.lastMdfcnDt) || null,              /* 최종수정일 only — a first-registration date is not an update */
      license: LICENSE,
      attribution: '출처: 온통청년(한국고용정보원)'
    },
    metadata: {
      registeredAt: isoDateTime(raw.frstRegDt) || '',               /* 최초등록일, shown as "공고 등록" when no update date exists */
      businessStart: ymd(raw.bizPrdBgngYmd) || '',
      businessEnd: ymd(raw.bizPrdEndYmd) || '',
      howToApply: str(raw.plcyAplyMthdCn).slice(0, 200),
      documents: str(raw.sbmsnDcmntCn).slice(0, 200),
      restrictions: str(raw.ptcpPrpTrgtCn).slice(0, 200)
    }
  };
}

/* ───────── upstream request (key only ever goes into this fixed URL, server side) ───────── */
export function requestUrl(key, { pageNum = 1, pageSize = 100 } = {}) {
  const u = new URL(UPSTREAM);
  u.searchParams.set('apiKeyNm', key);
  u.searchParams.set('pageNum', String(pageNum));
  u.searchParams.set('pageSize', String(pageSize));
  u.searchParams.set('pageType', '1');
  u.searchParams.set('rtnType', 'json');
  return u.href;
}

/*
 * Fetch every page (bounded) and return validated LIVON entities.
 * Stops on an empty page, when the reported total is reached, or at maxPages.
 */
export async function fetchAll({ key, fetcher, pageSize = 100, maxPages = 20, timeoutMs = 8000, budgetMs = 25000, now = Date.now() }) {
  const started = Date.now(), fetchedAt = new Date(now).toISOString();
  const rows = [];
  let total = null;
  for (let page = 1; page <= maxPages; page++) {
    const left = budgetMs - (Date.now() - started);
    if (left <= 0) { const e = new Error('timeout'); e.code = 'TIMEOUT'; throw e; }
    let res;
    try {
      res = await fetcher(requestUrl(key, { pageNum: page, pageSize }), { method: 'GET', headers: { accept: 'application/json, application/xml;q=0.9' }, redirect: 'error', signal: AbortSignal.timeout(Math.min(timeoutMs, left)) });
    } catch (err) {
      const e = new Error('upstream'); e.code = err && (err.name === 'TimeoutError' || err.name === 'AbortError') ? 'TIMEOUT' : 'NETWORK'; throw e;
    }
    if (!res.ok) { const e = new Error('upstream'); e.code = res.status >= 500 ? 'HTTP_5XX' : 'HTTP_4XX'; e.status = res.status; throw e; }
    const text = await res.text();
    if (text.length > 5_000_000) { const e = new Error('too large'); e.code = 'INVALID_DATA'; throw e; }
    const parsed = parseBody(text, res.headers.get('content-type') || '');
    if (parsed.total != null) total = parsed.total;
    rows.push(...parsed.rows);
    if (!parsed.rows.length || (total != null && rows.length >= total)) break;
  }
  const seen = new Set();
  return rows.map(r => toEntity(r, fetchedAt)).filter(e => e && !seen.has(e.providerId) && seen.add(e.providerId));
}
