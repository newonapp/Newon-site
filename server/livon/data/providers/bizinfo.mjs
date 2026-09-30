/*
 * 기업마당 (중소벤처기업부) — 지원사업정보 API adapter (server only).
 *
 * Source of every name below: 기업마당 「정책정보 개방 › 지원사업정보 API」
 *   https://www.bizinfo.go.kr/apiDetail.do?id=bizinfoApi   (checked 2026-09-29; page 수정일 2025.10.22)
 *   URL         : https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do  · GET · JSON / XML(RSS)
 *   parameters  : crtfcKey (required), dataType (rss|json), searchCnt, searchLclasId, hashtags, pageUnit, pageIndex
 *                 searchCnt "0 또는 값이 없을 경우 전체 데이터 제공" → LIVON always sends a bounded value
 *   분야 codes  : 01 금융 · 02 기술 · 03 인력 · 04 수출 · 05 내수 · 06 창업 · 07 경영 · 09 기타
 *   hashtags    : the 8 분야 names above and the regions 서울 부산 대구 인천 전남광주 대전 울산 세종 경기 강원 충북 충남 전북 경북 경남 제주
 *   JSON sample : {"jsonArray":{ "title", "link", …, "item":[ { … } ] }}   XML: <rss><channel> … <item> … </item>
 *   item fields : title, link, seq, author, excInsttNm, description, lcategory, pubDate, reqstDt, trgetNm, inqireCo,
 *                 flpthNm, fileNm, printFlpthNm, printFileNm, hashTags, totCnt, pblancNm, pblancUrl, pblancId,
 *                 jrsdInsttNm, bsnsSumryCn, reqstMthPapersCn, refrncNm, rceptEngnHmpgUrl,
 *                 pldirSportRealmLclasCodeNm, creatPnttm, reqstBeginEndDe
 * Not used on purpose: 조회수 (inqireCo — LIVON shows no popularity), attachment file links, contact person text.
 * The API has no age, amount or structured eligibility fields: nothing of that kind is derived from free text.
 */

import { FIELD_CODES, REGION_TAGS, CATEGORY_MAP, mapCategory, parseXml, parseJson, parseBody, str, first, web, ymd, isoDateTime,
  splitHashTags, regionOf, PAGE_UNIT, MAX_PAGES, MAX_TOTAL, filters, buildUrl, fetchPages } from './bizinfo-common.mjs';
export { FIELD_CODES, REGION_TAGS, CATEGORY_MAP, mapCategory, parseXml, parseJson, parseBody, ymd, splitHashTags, regionOf, PAGE_UNIT, MAX_PAGES, MAX_TOTAL, filters };

export const PROVIDER_ID = 'kr-business-support';
export const PROVIDER_NAME = '기업마당';
export const ENV_KEY = 'BIZINFO_API_KEY';
export const UPSTREAM = 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do'; // fixed; clients can never choose it
export const OFFICIAL_LIST = 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do';
export const LICENSE = '기업마당 정책정보 개방 API';

/* documented format "20220727 ~ 20220930"; anything else (상시, 예산 소진 시 …) stays a note — never an expiry */
export function applicationPeriod(raw) {
  const s = first(raw.reqstBeginEndDe, raw.reqstDt);
  if (!s) return null;
  const r = /^\s*(\d{8}|\d{4}-\d{2}-\d{2})\s*~\s*(\d{8}|\d{4}-\d{2}-\d{2})\s*$/.test(s) ? { start: ymd(s.split('~')[0]), end: ymd(s.split('~')[1]) } : null;
  const out = { start: null, end: null, note: s.slice(0, 200) };
  if (r) { out.start = r.start; out.end = r.end; if (out.start && out.end && out.end < out.start) out.end = null; }
  return out;
}

/* ───────── one API item → LIVON policy candidate (validated later by the shared schema) ───────── */
export function toEntity(raw, fetchedAt) {
  const id = first(raw.pblancId, raw.seq);
  const title = first(raw.pblancNm, raw.title);
  if (!id || !title) return null;
  const fieldName = first(raw.pldirSportRealmLclasCodeNm, raw.lcategory);
  const cat = mapCategory(fieldName);
  const ht = splitHashTags(raw.hashTags);
  const summary = first(raw.bsnsSumryCn, raw.description) || null;
  const notice = web(first(raw.pblancUrl, raw.link));
  const apply = web(raw.rceptEngnHmpgUrl);
  const target = str(raw.trgetNm);
  const region = regionOf(ht.regions);
  return {
    type: 'policy',
    provider: PROVIDER_ID,
    providerId: id,
    title,
    summary,
    description: summary,
    category: cat.category,
    tags: [fieldName, target, ...ht.tags, ...ht.regions].filter(Boolean),
    interests: cat.interests,
    lifeStages: [],                                          /* no age condition in this API → never tied to an age group */
    agency: first(raw.jrsdInsttNm, raw.author) || null,
    jurisdiction: ht.regions.length ? ht.regions.join('·') : null,
    eligibility: target ? '지원 대상: ' + target : null,      /* the official 지원대상 text as given; LIVON does not judge it */
    benefits: null,                                          /* not provided by the API */
    applicationPeriod: applicationPeriod(raw),
    applicationUrl: apply || null,
    officialSource: notice || OFFICIAL_LIST,
    location: region ? { country: 'KR', region } : { country: 'KR' },
    source: {
      providerName: PROVIDER_NAME,
      sourceUrl: notice || OFFICIAL_LIST,
      fetchedAt,
      updatedAt: null,                                       /* the API only gives a registration date (below) */
      license: LICENSE,
      attribution: '출처: 기업마당'
    },
    metadata: {
      fieldCode: Object.keys(FIELD_CODES).find(k => FIELD_CODES[k] === fieldName) || '',
      registeredAt: isoDateTime(first(raw.creatPnttm, raw.pubDate)) || '',
      operator: str(raw.excInsttNm).slice(0, 120),
      howToApply: str(raw.reqstMthPapersCn).slice(0, 200)
    }
  };
}

/* ───────── request + paging (shared with the 행사정보 adapter) ───────── */
export function requestUrl(key, opts = {}) { return buildUrl(UPSTREAM, key, opts); }
export function fetchAll({ key, fetcher, filter = {}, timeoutMs, budgetMs, now } = {}) {
  return fetchPages({ upstream: UPSTREAM, key, fetcher, toEntity, filter, timeoutMs, budgetMs, now });
}
