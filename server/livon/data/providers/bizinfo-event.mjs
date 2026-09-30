/*
 * 기업마당 (중소벤처기업부) — 행사정보 API adapter (server only).
 *
 * Source of every name below: 기업마당 「정책정보 개방 › 행사정보 API」
 *   https://www.bizinfo.go.kr/apiDetail.do?id=bizinfoEventApi   (checked 2026-09-29; page 등록일 2023.08.02 · 수정일 2025.09.08)
 *   URL         : https://www.bizinfo.go.kr/uss/rss/bizinfoEventApi.do  · GET · JSON / XML(RSS)
 *   설명        : 중소기업이 참여 가능한 교육, 세미나, 전시회 정보 제공
 *   parameters  : crtfcKey ("기업마당에서 발급받은 서비스 인증키" — same wording as 지원사업정보), dataType, searchCnt,
 *                 searchLclasId, hashtags, pageUnit, pageIndex — identical to 지원사업정보 (shared in bizinfo-common.mjs)
 *   item fields : seq/eventInfoId, title/nttNm, areaNm, eventType/eventInfoTyNm, description/nttCn, originOrg/originEngnNm,
 *                 rceptPd, originUrl/originUrlAdres, eventPeriod/BeginEndDe, inqireCo, lcategory/pldirSportRealmLclasCodeNm,
 *                 bizinfoUrl, registDe, flpthNm, fileNm, printFlpthNm, printFileNm, hashTags, totCnt
 * The API has NO registration-URL field → LIVON never shows "신청 페이지로 이동" for these events (only "공식 안내 보기").
 * No price, capacity, venue address, coordinates, participants or cancellation fields exist: none are derived.
 * Not used on purpose: inqireCo (조회수 — LIVON shows no popularity), attachment/poster files (not used as images).
 */

import { REGION_TAGS, mapCategories, str, first, web, ymd, parseRange, isoDateTime, splitHashTags, regionOf, filters, buildUrl, fetchPages } from './bizinfo-common.mjs';
export { filters };

export const PROVIDER_ID = 'kr-business-event';
export const PROVIDER_NAME = '기업마당';
export const ENV_KEY = 'BIZINFO_API_KEY';          /* same 기업마당 service key system (see docs: 사용신청 per API 확인 필요) */
export const UPSTREAM = 'https://www.bizinfo.go.kr/uss/rss/bizinfoEventApi.do'; // fixed; clients can never choose it
/* channel "link" (공고목록URL) exactly as given in the official response sample */
export const OFFICIAL_LIST = 'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do';
export const LICENSE = '기업마당 정책정보 개방 API';

/* bizinfoUrl: only a bizinfo.go.kr page; the documented sample repeats "?eventInfoId=" — that exact defect is repaired */
export function detailUrl(v) {
  let u = web(v);
  if (!u) return '';
  u = u.replace(/\?eventInfoId=\?eventInfoId=/, '?eventInfoId=');
  try {
    const p = new URL(u);
    if (!/(^|\.)bizinfo\.go\.kr$/i.test(p.hostname)) return '';
    return p.href;
  } catch { return ''; }
}

/* areaNm first ('전국' kept as is); otherwise one official region hashtag; several/irregular values are never forced */
export function regionFor(areaNm, hashRegions) {
  const a = str(areaNm);
  if (a) {
    if (a === '전국') return { region: '전국', text: a };
    if (REGION_TAGS.includes(a) && a !== '전남광주') return { region: a, text: a };
    return { region: null, text: a.slice(0, 60) };            /* e.g. "서울,경기" or free text → shown as a tag only */
  }
  const r = regionOf(hashRegions);
  return { region: r, text: hashRegions.join('·') || '' };
}

/* rceptPd "2022-03-16 ~ 2022-04-13" → dates; anything else (상시, 선착순 …) stays text and never closes the event */
export function registrationPeriod(raw) {
  const s = str(raw.rceptPd);
  if (!s) return { start: null, end: null, note: '' };
  const r = parseRange(s);
  return { start: r ? r.start : null, end: r ? r.end : null, note: s.slice(0, 200) };
}

/* ───────── one API item → LIVON event candidate (validated later by the shared schema) ───────── */
export function toEntity(raw, fetchedAt) {
  const id = first(raw.eventInfoId, raw.seq);
  const title = first(raw.title, raw.nttNm);
  if (!id || !title) return null;
  const period = parseRange(first(raw.eventPeriod, raw.BeginEndDe));
  const fieldValue = first(raw.lcategory, raw.pldirSportRealmLclasCodeNm);
  const cat = mapCategories(fieldValue);
  const ht = splitHashTags(raw.hashTags);
  const reg = regionFor(raw.areaNm, ht.regions);
  const rp = registrationPeriod(raw);
  const eventType = first(raw.eventType, raw.eventInfoTyNm);
  const organizer = first(raw.originOrg, raw.originEngnNm);
  const description = first(raw.description, raw.nttCn) || null;
  const detail = detailUrl(raw.bizinfoUrl);
  const origin = web(first(raw.originUrl, raw.originUrlAdres));
  return {
    type: 'event',
    provider: PROVIDER_ID,
    providerId: id,
    title,
    summary: description,
    description,
    category: cat.category,
    tags: [...cat.names, eventType, reg.region ? null : reg.text, ...ht.tags].filter(Boolean),
    interests: cat.interests,
    lifeStages: [],                                          /* no age condition in this API */
    organizer: organizer || null,
    eventType: eventType || null,                            /* official 행사유형 text, not re-classified */
    eventStatus: 'unknown',                                  /* never inferred from text (no cancel/postpone field) */
    registrationRequired: null,
    registrationUrl: null,                                   /* the API has no registration URL field */
    registrationStart: rp.start,
    registrationEnd: rp.end,
    schedule: period ? { startAt: period.start, endAt: period.end, timezone: 'Asia/Seoul' } : null,
    location: reg.region ? { country: 'KR', region: reg.region } : { country: 'KR' },
    contact: origin ? { website: origin } : null,
    source: {
      providerName: PROVIDER_NAME,
      sourceUrl: detail || OFFICIAL_LIST,
      fetchedAt,
      updatedAt: null,
      license: LICENSE,
      attribution: (organizer ? '기관: ' + organizer + ' / ' : '') + '데이터 출처: 기업마당'
    },
    metadata: {
      dateOnly: true,
      fields: cat.names.join(','),                           /* e.g. "경영,창업" from "경영@창업" */
      registrationNote: rp.note,
      regionText: reg.text,
      originUrl: origin,
      eventPeriodText: first(raw.eventPeriod, raw.BeginEndDe).slice(0, 60),
      registeredAt: isoDateTime(raw.registDe) || ''
    }
  };
}

export function requestUrl(key, opts = {}) { return buildUrl(UPSTREAM, key, opts); }
export function fetchAll({ key, fetcher, filter = {}, timeoutMs, budgetMs, now } = {}) {
  return fetchPages({ upstream: UPSTREAM, key, fetcher, toEntity, filter, timeoutMs, budgetMs, now });
}
export { ymd };
