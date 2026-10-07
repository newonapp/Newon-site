// ONGIL Phase 5 — Enjoy + Local Discovery V1: taxonomy, contracts, provider normalisation (fixture fetchers, no
// network), discovery rules, saved / calendar / family, Home, search privacy, safety and quality checks.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import * as E from '../../ongil-start/js/enjoy-contracts.js';
import { createLifelongClassSource, createEnjoyPlaceSource, createTourPlaceSource, createUnconnectedSource, TOUR_REGIONS, LIFELONG_PROVIDER, KAKAO_PLACE_PROVIDER, TOUR_PROVIDER } from '../../ongil-start/js/data-source.js';
import { SEARCH_TARGETS, TARGETS_BY_CATEGORY, ENJOY_SECTIONS, resolveEnjoySection, PAGE_SIZE } from '../../ongil-start/js/enjoy-view.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { SAVED_TYPES, normalizeSavedItem } from '../../ongil-start/js/contracts.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createSearch, createAreaProvider, createSavedProvider, createCareProvider, createEnjoyProvider } from '../../ongil-start/js/search.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { CARE_CATEGORY_IDS, CARE_TYPE_IDS } from '../../ongil-start/js/care-contracts.js';
import { ENJOY_CATEGORIES as HOME_ENJOY } from '../../ongil-start/js/home-explore.js';
import { createJournalStore } from '../../ongil-start/js/journal.js';
import { createHealthNoteStore } from '../../ongil-start/js/health-notes.js';
import { createHelpRequestStore } from '../../ongil-start/js/family.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { resolveView, sectionOf } from '../../ongil-start/js/router.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const VIEW = strip(read('js', 'enjoy-view.js'));
const CONTRACTS = strip(read('js', 'enjoy-contracts.js'));
const HOME = strip(read('js', 'home-explore.js'));
const APP = read('js', 'app.js');
const CSS = ['ongil-tokens.css', 'ongil-app.css', 'ongil-home.css', 'ongil-life.css', 'ongil-care.css'].map((f) => read('styles', f)).join('\n');

/* provider answer shapes (server/livon/data/providers/*.mjs toEntity) — TEST FIXTURES ONLY */
const lifelong = (i, over = {}) => ({ type: 'program', providerId: `lc${String(i).padStart(6, '0')}`, title: `스마트폰 교실 ${i}`, summary: '기초', organizer: '구립도서관', eligibility: '성인', venue: '2층', days: '화', timeText: '10:00~12:00', capacity: 20, registrationStart: '2026-10-01', registrationEnd: '2026-10-20', schedule: { startAt: '2026-11-03', endAt: '2026-12-01' }, pricing: { amount: 0 }, location: { region: '서울', address: '서울특별시 종로구 1' }, contact: { website: 'https://lib.example.kr/' }, source: { attribution: '교육부 · 공공데이터포털' }, ...over });
const kakao = (i, over = {}) => ({ type: 'place', providerId: String(100 + i), title: `공원 ${i}`, placeType: '여행 › 공원', mapUrl: `https://place.map.kakao.com/${100 + i}`, location: { region: '서울', roadAddress: `서울 공원로 ${i}`, latitude: 37.5, longitude: 127 }, contact: { phone: '02-111-2222' }, ...over });
const tour = (i, type = '12', over = {}) => ({ type: 'place', providerId: String(200 + i), title: `관광지 ${i}`, location: { region: '부산', address: '부산 해운대구', latitude: 35.1, longitude: 129.1 }, contact: null, source: { providerName: '한국관광공사', attribution: '한국관광공사 TourAPI', updatedAt: '2026-09-01T00:00:00Z' }, metadata: { contentTypeId: type }, ...over });
function api({ configured = { [LIFELONG_PROVIDER]: true, [KAKAO_PLACE_PROVIDER]: true, [TOUR_PROVIDER]: true }, items = {}, fail = [] } = {}) {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    const provider = Object.keys(configured).find((p) => url.includes(`provider=${p}`));
    if (fail.includes(provider)) throw new Error('down');
    const body = /action=status/.test(url) ? { ok: true, providers: Object.fromEntries(Object.entries(configured).map(([k, v]) => [k, { configured: v }])) } : { ok: true, items: items[provider] || [] };
    return { ok: true, json: async () => body };
  };
  return { calls, opts: { apiUrl: (p) => p, fetcher } };
}
function world() {
  const storage = createStorage({ backend: createMemoryBackend() });
  const clock = { t: new Date(2026, 9, 2, 9).getTime() };
  const now = () => (clock.t += 1000);
  return { storage, saved: createSavedStore(storage, { now }), schedule: createScheduleStore(storage, { now }) };
}
const cls = (over = {}) => E.normalizeProgram({ type: 'CLASS', id: 'lc1', title: '서예 교실', category: 'HOBBY', organization: '복지관', startDate: '2026-11-03', startTime: '10:00', sourceName: '공공데이터포털', ...over });
const place = (over = {}) => E.normalizePlace({ type: 'PLACE', id: 'kakao-1', name: '어린이대공원', category: 'OUTING', address: '서울 광진구', region: '서울', sourceName: '카카오', mapUrl: 'https://place.map.kakao.com/1', ...over });

/* ───────── model / data ───────── */

test('OG-EN-1 category taxonomy: six categories with sub-categories as search words only', () => {
  assert.deepEqual(E.ENJOY_CATEGORIES.map((c) => [c.id, c.label]), [['HOBBY', '취미'], ['LEARNING', '배움'], ['EXERCISE', '운동'], ['CULTURE', '문화'], ['OUTING', '나들이'], ['TRAVEL', '여행']]);
  assert.deepEqual([...E.enjoyCategoryById('HOBBY').subs], ['미술', '서예', '사진', '음악·악기', '원예', '요리', '공예', '독서']);
  assert.deepEqual([...E.enjoyCategoryById('TRAVEL').subs], ['당일치기', '국내여행', '지역 관광']);
  assert.match(VIEW, /예를 들면 \$\{chosen\.subs\.join\(', '\)\} 같은 것이에요/, 'sub-categories are shown as examples of words, not as programmes');
  assert.deepEqual([...ENJOY_SECTIONS], ['hobby', 'learning', 'exercise', 'culture', 'outing', 'travel']);
  assert.deepEqual([...HOME_ENJOY], ['취미', '배움', '운동', '문화', '나들이', '여행']);
});

test('OG-EN-2 program model: one shape, optional fields stay empty, dates validated', () => {
  const p = E.normalizeProgram({ type: 'PROGRAM', id: 'pg-1', title: ' 걷기 모임 ', category: 'EXERCISE', startDate: '2026-11-01', endDate: '2026-10-01', costText: '무료', price: 3, bookingUrl: 'x' });
  assert.deepEqual(Object.keys(p).sort(), ['capacityText', 'category', 'costText', 'endDate', 'id', 'linkKind', 'location', 'organization', 'recruitmentText', 'region', 'scheduleText', 'sourceName', 'sourceUrl', 'startDate', 'startTime', 'summary', 'targetText', 'title', 'type', 'updatedAt']);
  assert.deepEqual([p.title, p.endDate, p.costText], ['걷기 모임', '', '무료'], 'an end before the start is dropped');
  assert.throws(() => E.normalizeProgram({ type: 'PROGRAM', id: 'pg-1', title: 'x', category: 'SHOPPING' }), /INVALID_CATEGORY/);
  assert.throws(() => E.normalizeProgram({ type: 'TRIP', id: 'pg-1', title: 'x', category: 'TRAVEL' }), /INVALID_TYPE/);
  assert.equal(E.normalizeProgram({ type: 'PROGRAM', id: 'p', title: 't', category: 'HOBBY', startDate: '2026-02-30' }).startDate, '');
});

test('OG-EN-3 class model: same shape as PROGRAM, its own type and label', () => {
  const c = cls();
  assert.deepEqual([c.type, E.typeLabel(c.type), c.startTime], ['CLASS', '강좌', '10:00']);
  assert.deepEqual(Object.keys(c).sort(), Object.keys(E.normalizeProgram({ type: 'PROGRAM', id: 'a', title: 'a', category: 'HOBBY' })).sort());
});

test('OG-EN-4 event model: no recruitment, capacity or target; no booking flag; no source yet', async () => {
  const e = E.normalizeProgram({ type: 'EVENT', id: 'ev-1', title: '음악회', category: 'CULTURE', recruitmentText: '선착순', capacityText: '100명', targetText: '누구나', scheduleText: '매일', bookingAvailable: true });
  assert.deepEqual([e.recruitmentText, e.capacityText, e.targetText, e.scheduleText, 'bookingAvailable' in e], ['', '', '', '', false]);
  assert.equal(SEARCH_TARGETS.some((t) => t.source === 'event'), false, 'no event source is connected');
  assert.deepEqual((await createUnconnectedSource('events', '행사').load()).reason, 'NOT_CONNECTED');
});

test('OG-EN-5 place model: coordinates only as a pair from the source; phone and links validated', () => {
  const p = place({ latitude: 37.5, longitude: 127.1, phone: '02-123-4567' });
  assert.deepEqual([p.type, p.title, p.latitude, p.longitude, p.phone, p.linkKind], ['PLACE', '어린이대공원', 37.5, 127.1, '02-123-4567', 'map']);
  assert.deepEqual([place({ latitude: 37.5 }).latitude, place({ latitude: '37', longitude: '127' }).longitude], [null, null], 'no half or string coordinate is kept');
  assert.equal(place({ phone: 'call<b>' }).phone, '');
  assert.throws(() => E.normalizePlace({ type: 'PLACE', id: 'x', name: '', category: 'OUTING' }), /INVALID_NAME/);
});

test('OG-EN-6 provider normalization: lifelong, tour and kakao answers become contract items; screens never read provider fields', () => {
  const c = E.normalizeProgram(E.fromLifelong(lifelong(1), 'HOBBY'));
  assert.deepEqual([c.type, c.id, c.category, c.organization, c.startDate, c.endDate, c.startTime, c.costText, c.capacityText, c.recruitmentText, c.linkKind], ['CLASS', 'lc000001', 'HOBBY', '구립도서관', '2026-11-03', '2026-12-01', '10:00', '무료', '20명', '접수 2026-10-01 ~ 2026-10-20', 'organizer']);
  const t = E.normalizePlace(E.fromTourPlace(tour(1, '14')));
  assert.deepEqual([t.id, t.category, t.placeType, t.updatedAt, t.latitude], ['tour-201', 'CULTURE', '문화시설', '2026-09-01', 35.1]);
  assert.equal(E.fromTourPlace(tour(2, '32')), null, '숙박 is not a 즐길거리 place');
  const k = E.normalizePlace(E.fromKakaoPlace(kakao(1), 'OUTING'));
  assert.deepEqual([k.id, k.address, k.sourceName, k.linkKind], ['kakao-101', '서울 공원로 1', '카카오 (Kakao Local, 민간 지도 서비스)', 'map']);
  for (const field of ['providerId', 'lctreNm', 'contenttypeid', 'place_name', 'metadata.', 'raw.']) assert.equal(VIEW.includes(field), false, field);
  assert.match(strip(read('js', 'data-source.js')), /const input = fromLifelong\(raw, category\);/, 'Home and 즐길거리 share the one lifelong normaliser');
});

test('OG-EN-7 missing fields: nothing is filled in, empty rows are not shown', () => {
  const bare = E.normalizeProgram(E.fromLifelong({ type: 'program', providerId: 'lc9', title: '강좌', organizer: 'x' }));
  for (const f of ['startDate', 'costText', 'capacityText', 'recruitmentText', 'targetText', 'sourceUrl', 'updatedAt']) assert.equal(bare[f], '', f);
  assert.deepEqual(E.detailRows(bare).map((r) => r.label), ['종류', '분류', '운영 기관']);
  assert.deepEqual(E.detailRows(place()).map((r) => r.label), ['종류', '분류', '주소', '자료 출처']);
  assert.equal(E.calendarDraft(bare), null, 'no date → no calendar action');
});

test('OG-EN-8 no fake content: the production code holds no programme, place, price or period', () => {
  for (const code of [VIEW, CONTRACTS, HOME, strip(read('js', 'data-source.js'))]) {
    assert.equal(/title: '[^']*(교실|강좌|축제|공원|박물관)[^']*'|costText: '\d|startDate: '\d{4}/.test(code), false);
  }
  assert.equal(/fixture|sample|mock|dummy|lorem/i.test(VIEW + CONTRACTS), false);
  assert.match(VIEW, /아직 찾은 것이 없어요/);
  assert.match(VIEW, /강좌나 장소를 지어내지 않아요/);
});

test('OG-EN-9 provider isolation: one failing source does not empty another; each keeps its own state', async () => {
  const a = api({ configured: { [LIFELONG_PROVIDER]: true, [KAKAO_PLACE_PROVIDER]: true, [TOUR_PROVIDER]: false }, items: { [KAKAO_PLACE_PROVIDER]: [kakao(1), kakao(2)] }, fail: [LIFELONG_PROVIDER] });
  const [l, k, t] = await Promise.all([createLifelongClassSource(a.opts).load({ region: '서울' }), createEnjoyPlaceSource(a.opts).load({ region: '서울', word: '공원' }), createTourPlaceSource(a.opts).load({ region: '서울', contentType: '12' })]);
  assert.deepEqual([l.state, k.state, t.state, t.reason], ['unavailable', 'ready', 'unavailable', 'NOT_CONFIGURED']);
  assert.equal(k.items.length, 2);
  assert.match(VIEW, /state\.items = \[\.\.\.state\.items\.filter\(\(i\) => i\._target !== target\.id\), \.\.\.items/, 'a search replaces only its own earlier results');
  assert.match(VIEW, /state\.sourceStatus\[target\.id\] = \{ state:/);
  assert.match(VIEW, /\} catch \{\s*result = \{ state: 'unavailable', reason: 'NO_ANSWER', items: \[\] \};/);
});

test('OG-EN-10 URL safety: official only for public-sector https, organiser sites labelled as such, maps as maps', () => {
  assert.equal(cls({ sourceUrl: 'https://www.sejong.go.kr/x' }).linkKind, 'official');
  assert.equal(cls({ homepageUrl: 'https://lib.example.kr/' }).linkKind, 'organizer');
  for (const bad of ['javascript:alert(1)', 'http://lib.example.kr/', 'data:text/html,x', '//evil.com', 'https://u:p@x.kr/']) assert.deepEqual([cls({ homepageUrl: bad, sourceUrl: bad }).sourceUrl, cls({ homepageUrl: bad }).linkKind], ['', ''], bad);
  assert.equal(place({ mapUrl: 'https://kakao.com.evil.io/' }).linkKind, '');
  assert.equal(cls({ linkKind: 'organizer', sourceUrl: 'javascript:x' }).linkKind, '', 'an already-normalised item is re-checked');
  assert.equal(E.normalizeProgram(cls({ homepageUrl: 'https://a.kr/' })).linkKind, 'organizer', 'normalising twice keeps the link');
  assert.deepEqual({ ...E.LINK_LABELS }, { official: '공식 페이지에서 확인 (새 창)', organizer: '운영기관 누리집 보기 (새 창)', map: '카카오맵에서 위치 보기 (새 창)' });
  assert.match(VIEW, /rel: 'noopener noreferrer'/);
});

/* ───────── discovery ───────── */

test('OG-EN-11 enjoy screen: own view at #enjoy and #enjoy/<category>; categories, search, results, saved entry', () => {
  assert.match(APP, /enjoyView = createEnjoyView\(\{/);
  // Phase 6: 커뮤니티 has its own view as well, so the shell loop skips it too.
  // Phase 7: 스토어 has its own view as well, so the shell loop skips it too.
  assert.match(APP, /if \(area\.id === 'home' \|\| area\.id === 'life' \|\| area\.id === 'family' \|\| area\.id === 'care' \|\| area\.id === 'enjoy' \|\| area\.id === 'community' \|\| area\.id === 'store'\) continue;/);
  assert.equal(resolveView('#enjoy/culture'), 'enjoy');
  assert.equal(sectionOf('#enjoy/culture'), 'culture');
  assert.deepEqual([resolveEnjoySection('culture'), resolveEnjoySection('booking')], ['CULTURE', '']);
  for (const t of ['무엇을 해볼까요?', '지역에서 찾아보기', '찾은 즐길거리', '저장한 즐길거리']) assert.ok(VIEW.includes(`'${t}'`), t);
  assert.match(APP, /if \(view === 'enjoy'\) enjoyView\.show\(section\);/);
});

test('OG-EN-12 empty state: nothing is loaded until asked; the empty card says so', async () => {
  assert.equal((VIEW.match(/sources\.(lifelong|tour|place)\.load\(/g) || []).length, 3);
  assert.match(VIEW, /form\.addEventListener\('submit', async \(event\) => \{/);
  assert.equal(/load\(\{[^}]*\}\)\s*;?\s*\n\s*build\(\)/.test(VIEW), false);
  assert.match(VIEW, /'data-og-enjoy-empty': 'results', text: '아직 찾은 것이 없어요\.'/);
});

test('OG-EN-13 loading state: the source region is marked busy and the button is disabled while asking', () => {
  assert.match(VIEW, /setRegionState\(fresh, 'loading', '찾고 있습니다\.'\);/);
  assert.match(VIEW, /button\.disabled = true;/);
  assert.match(VIEW, /if \(mine !== ticket\) return;/, 'a slower earlier answer cannot overwrite a newer one');
});

test('OG-EN-14 unavailable state: unconfigured, unsupported or failing sources answer plainly, with no items', async () => {
  const off = api({ configured: { [LIFELONG_PROVIDER]: false, [KAKAO_PLACE_PROVIDER]: false, [TOUR_PROVIDER]: false } });
  assert.equal((await createEnjoyPlaceSource(off.opts).load({ region: '서울', word: '공원' })).reason, 'NOT_CONFIGURED');
  assert.equal(off.calls.length, 1, 'status first; no search without a key');
  /*
   * WHY CHANGED (Enjoy Phase B): the tourism source now covers the whole country, and 광주 + 전남 are one region.
   * BEFORE: 제주 → REGION_NOT_SUPPORTED; TOUR_REGIONS = the seven regions 서울 부산 대구 인천 광주 대전 경기.
   * AFTER:  제주 is asked for; '광주' or '전남' alone → REGION_NOT_SUPPORTED (no request); sixteen regions.
   */
  const jeju = api({ items: { [TOUR_PROVIDER]: [tour(1)] } });
  assert.equal((await createTourPlaceSource(jeju.opts).load({ region: '제주', contentType: '12' })).state, 'ready');
  for (const alone of ['광주', '전남']) {
    const a = api();
    assert.equal((await createTourPlaceSource(a.opts).load({ region: alone, contentType: '12' })).reason, 'REGION_NOT_SUPPORTED', alone);
    assert.equal(a.calls.length, 0, 'nothing is sent for a name the tourism data does not have');
  }
  assert.equal((await createTourPlaceSource(api().opts).load({ region: '화성', contentType: '12' })).reason, 'REGION_REQUIRED');
  assert.deepEqual([...TOUR_REGIONS], ['서울', '부산', '대구', '인천', '광주·전남', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '경북', '경남', '제주']);
  assert.equal((await createTourPlaceSource(api().opts).load({ region: '서울', contentType: '32' })).reason, 'TYPE_REQUIRED', '숙박 is never asked for');
  assert.equal((await createEnjoyPlaceSource({}).load({ region: '서울', word: '공원' })).state, 'unavailable');
  assert.equal((await createEnjoyPlaceSource(api().opts).load({ region: '서울', word: '<script>' })).reason, 'WORD_REQUIRED');
  assert.match(VIEW, /이 자료는 아직 연결되지 않았어요\./);
});

const MIX = () => E.sanitizeEnjoyItems([cls(), cls({ id: 'lc2', title: '가야금', category: 'HOBBY', startDate: '2026-10-20', region: '부산' }), place(), place({ id: 'kakao-2', name: '국립중앙박물관', category: 'CULTURE', region: '서울' }), E.normalizeProgram({ type: 'PROGRAM', id: 'pg', title: '걷기', category: 'EXERCISE', region: '서울' })]);

test('OG-EN-15 category filter', () => {
  assert.deepEqual(E.filterEnjoy(MIX(), { category: 'HOBBY' }).map((i) => i.id), ['lc1', 'lc2']);
  assert.deepEqual(E.availableEnjoyFilters(MIX()).categories, ['HOBBY', 'EXERCISE', 'CULTURE', 'OUTING']);
  assert.match(VIEW, /if \(o\.id && !available\.includes\(o\.id\)\) \{\s*b\.disabled = true;/);
});

test('OG-EN-16 type filter', () => {
  assert.deepEqual(E.filterEnjoy(MIX(), { type: 'PLACE' }).map((i) => i.id), ['kakao-1', 'kakao-2']);
  assert.deepEqual(E.availableEnjoyFilters(MIX()).types, ['PROGRAM', 'CLASS', 'PLACE']);
  assert.deepEqual(E.filterEnjoy(MIX(), { type: 'EVENT' }), []);
});

test('OG-EN-17 region filter: only when results span more than one region', () => {
  assert.deepEqual(E.availableEnjoyFilters(MIX()).regions, ['서울', '부산']);
  assert.deepEqual(E.filterEnjoy(MIX(), { region: '부산' }).map((i) => i.id), ['lc2']);
  assert.match(VIEW, /if \(avail\.regions\.length > 1\) \{/);
  assert.match(VIEW, /기본값은 내 정보에 설정한 지역/, 'the profile region is "설정한 지역", never "your location"');
});

test('OG-EN-18 search: title, summary, organisation, location, category — loaded items only', () => {
  assert.deepEqual(E.filterEnjoy(MIX(), { query: '박물관' }).map((i) => i.id), ['kakao-2']);
  assert.deepEqual(E.filterEnjoy(MIX(), { query: '복지관' }).map((i) => i.id).sort(), ['lc1', 'lc2']);
  assert.deepEqual(E.filterEnjoy(MIX(), { query: '나들이' }).map((i) => i.id), ['kakao-1'], 'category name is searchable');
  assert.deepEqual(E.filterEnjoy([], { query: '공원' }), []);
});

test('OG-EN-19 factual sort: 가나다순 and 시작일순 only; no ranking, no distance', () => {
  assert.deepEqual(E.sortEnjoy(MIX(), 'title').map((i) => i.title), ['가야금', '걷기', '국립중앙박물관', '서예 교실', '어린이대공원']);
  assert.deepEqual(E.sortEnjoy(MIX(), 'start').map((i) => i.id).slice(0, 2), ['lc2', 'lc1'], 'dated items first, earliest first');
  assert.deepEqual(E.sortOptions([place()]).map((s) => s.id), ['title'], 'no start-date sort without dates');
  assert.deepEqual(E.SORTS.map((s) => s.label), ['가나다순', '시작일순']);
  assert.equal(/추천순|인기순|가까운 순|거리순|distance/.test(VIEW + CONTRACTS), false);
});

test('OG-EN-20 detail: what, where, when, cost, who, source — in that order, existing fields only', () => {
  const c = E.normalizeProgram(E.fromLifelong(lifelong(1)));
  assert.deepEqual(E.detailRows(c).map((r) => r.label), ['종류', '분류', '소개', '운영 기관', '장소', '기간', '일정', '비용', '대상', '모집', '정원', '자료 출처']);
  assert.match(VIEW, /dialog = el\('dialog', \{ class: 'og-dialog og-care-dialog og-enjoy-dialog', id: 'og-enjoy-detail'/);
  assert.match(VIEW, /if \(dialog\) return dialog;/);
  assert.match(VIEW, /dialog\.addEventListener\('close', \(\) => \{\s*clear\(dialog\);/);
});

/* ───────── integration ───────── */

test('OG-EN-21 saved: places as PLACE, programmes, classes and events as PROGRAM with the kind first', () => {
  const w = world();
  assert.equal(w.saved.toggle(E.savedInputFor(cls())).saved, true);
  assert.equal(w.saved.toggle(E.savedInputFor(place())).saved, true);
  const items = w.saved.list();
  assert.deepEqual(items.map((i) => [i.type, i.id]).sort(), [['PLACE', 'kakao-1'], ['PROGRAM', 'lc1']]);
  assert.match(w.saved.list({ type: 'PROGRAM' })[0].description, /^강좌 · 복지관/);
  assert.equal(w.saved.list({ type: 'PLACE' })[0].href, 'https://place.map.kakao.com/1');
});

test('OG-EN-22 saved backward compatibility: no new saved type; Home 내 주변 and 즐길거리 save the same key', () => {
  assert.deepEqual([...SAVED_TYPES], ['SERVICE', 'BENEFIT', 'FACILITY', 'PROGRAM', 'PLACE', 'POST', 'PRODUCT']);
  const w = world();
  w.saved.save({ type: 'PROGRAM', id: 'lc000001', title: '스마트폰 교실 1' });
  const fromEnjoy = E.savedInputFor(E.normalizeProgram(E.fromLifelong(lifelong(1))));
  assert.equal(w.saved.isSaved(fromEnjoy.type, fromEnjoy.id), true, 'an item saved from Home shows as saved in 즐길거리');
  assert.ok(normalizeSavedItem({ type: 'PLACE', id: 'park', title: '동네 공원', href: '#enjoy' }, 1));
});

test('OG-EN-23 unsave: toggling again removes only that item; the saved payload stays small', () => {
  const w = world();
  w.saved.toggle(E.savedInputFor(cls()));
  w.saved.toggle(E.savedInputFor(place()));
  assert.equal(w.saved.toggle(E.savedInputFor(cls())).saved, false);
  assert.deepEqual(w.saved.list().map((i) => i.id), ['kakao-1']);
  const stored = JSON.parse(w.storage.get('saved') ? JSON.stringify(w.storage.get('saved')) : '{}');
  assert.deepEqual(Object.keys(stored.items[0]).sort(), ['description', 'href', 'id', 'key', 'savedAt', 'schemaVersion', 'source', 'title', 'type'], 'a snapshot, never the provider payload');
});

test('OG-EN-24 family preview: public facts about the item only, not sendable', () => {
  const p = E.familySendPreview(cls({ location: '2층' }));
  assert.deepEqual(p.fields.map((f) => f.label), ['이름', '종류', '운영 기관', '장소', '기간', '자료 출처']);
  assert.deepEqual([p.sendable, p.reason, p.personalDataIncluded], [false, 'NO_FAMILY_CONNECTION', false]);
  assert.match(VIEW, /가족 연결이 필요해요\./);
});

test('OG-EN-25 no family send: the family branch only renders — no storage, no network, no "sent"', () => {
  const body = VIEW.slice(VIEW.indexOf("if (mode === 'family') {"), VIEW.indexOf("} else if (mode === 'calendar')"));
  assert.ok(body.length > 100);
  assert.equal(/saved\.|schedule\.|storage|fetch|sources\.|\.load\(|\.add\(/.test(body), false);
  assert.equal(/보냈습니다|전송 완료|전달했/.test(VIEW), false);
});

test('OG-EN-26 calendar preview: only a real start date; title, date and start time shown before adding', () => {
  assert.deepEqual(E.calendarDraft(cls()), { title: '서예 교실', date: '2026-11-03', time: '10:00' });
  assert.equal(E.calendarDraft(place()), null);
  assert.equal(E.calendarDraft(cls({ startDate: '' })), null);
  assert.deepEqual(E.calendarDraft(cls({ startTime: '25:00' })).time, '');
  assert.match(VIEW, /'data-og-enjoy-calendar': 'preview'/);
  assert.match(VIEW, /신청이나 예약이 되는 것은 아니에요/);
});

test('OG-EN-27 calendar add: the existing CalendarEvent, minimal values only, on the user\'s press', () => {
  const w = world();
  const d = E.calendarDraft(cls({ title: '서예 교실 <b>x</b>' }));
  const r = w.schedule.add({ title: d.title, date: d.date, time: d.time });
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.event).sort(), ['completed', 'createdAt', 'date', 'id', 'schemaVersion', 'time', 'title', 'updatedAt'], 'no source URL, id or metadata is copied into the event');
  assert.match(VIEW, /const r = schedule\.add\(\{ title: draft\.title, date: draft\.date, time: draft\.time \}\);/);
  assert.equal((VIEW.match(/schedule\.add\(/g) || []).length, 1);
});

test('OG-EN-28 calendar duplicate protection: the same title on the same day and time is not added twice', () => {
  const w = world();
  const d = E.calendarDraft(cls());
  assert.equal(E.isAlreadyInCalendar(d, w.schedule.listForDate(d.date)), false);
  w.schedule.add({ title: d.title, date: d.date, time: d.time });
  assert.equal(E.isAlreadyInCalendar(d, w.schedule.listForDate(d.date)), true);
  assert.equal(E.isAlreadyInCalendar({ ...d, time: '14:00' }, w.schedule.listForDate(d.date)), false, 'another time is another event');
  assert.match(VIEW, /if \(isAlreadyInCalendar\(draft, schedule\.listForDate\(draft\.date\)\)\) \{/);
});

test('OG-EN-29 Home integration: six categories to #enjoy/<id>; only items found this visit, never called a recommendation', () => {
  assert.match(HOME, /href: `#enjoy\/\$\{ENJOY_LINKS\[name\]\}`/);
  assert.match(HOME, /const items = typeof loaded === 'function' \? loaded\(\)\.slice\(0, 3\) : \[\];/);
  assert.match(HOME, /추천이 아니라 즐길거리 화면에서 찾아 본 것 가운데 몇 가지예요/);
  assert.equal(/추천 프로그램|오늘의 추천|맞춤 추천|인기/.test(HOME), false);
  assert.match(APP, /enjoyLoaded: \(\) => \(enjoyView \? enjoyView\.items\(\) : \[\]\),/);
});

test('OG-EN-30 Nearby shared normalization: Home 내 주변 items are the same normalised CLASS items', async () => {
  const a = api({ items: { [LIFELONG_PROVIDER]: [lifelong(1)] } });
  const r = await createLifelongClassSource(a.opts).load({ region: '서울' });
  assert.deepEqual([r.items[0].type, r.items[0].id, r.items[0].organization, r.items[0].organizer, r.items[0].href], ['CLASS', 'lc000001', '구립도서관', '구립도서관', 'https://lib.example.kr/']);
  assert.match(a.calls[1].url, /provider=kr-lifelong-class&region=%EC%84%9C%EC%9A%B8&status=open&limit=6$/, 'Home\'s request is unchanged');
  const b = api({ items: { [LIFELONG_PROVIDER]: [lifelong(1)] } });
  await createLifelongClassSource(b.opts).load({ region: '서울', query: '서예', limit: 20 });
  assert.match(b.calls[1].url, /&query=%EC%84%9C%EC%98%88&status=open&limit=20$/);
  // Phase 9: the tour and place sources are wrapped by observeSource; the lifelong source is still the one object Home uses.
  // BEFORE: sources: { lifelong: nearbySource, tour: createTourPlaceSource(dataApi), place: createEnjoyPlaceSource(dataApi) } on one line.
  assert.match(APP, /sources: \{\s*lifelong: nearbySource,\s*tour: observeSource\(createTourPlaceSource\(dataApi\), [^\n]*\),\s*place: observeSource\(createEnjoyPlaceSource\(dataApi\), [^\n]*\),\s*\}/, 'one lifelong source object for both screens');
});

test('OG-EN-31 Global Search: loaded public enjoy items are findable, with a clear type label', async () => {
  let loaded = [];
  const s = createSearch();
  s.registerProvider(createEnjoyProvider(() => loaded));
  assert.deepEqual((await s.query('서예')).results, []);
  loaded = MIX();
  const r = await s.query('서예');
  assert.deepEqual(r.results.map((x) => [x.providerId, x.type, x.title, x.href]), [['enjoy', 'CLASS', '서예 교실', '#enjoy/hobby']]);
  assert.match(r.results[0].description, /^강좌/);
  assert.match(APP, /search\.registerProvider\(createEnjoyProvider\(\(\) => enjoyView\.items\(\)\)\);/);
});

test('OG-EN-32 private search exclusion: personal records never appear through any provider', async () => {
  const storage = createStorage({ backend: createMemoryBackend() });
  createJournalStore(storage).add({ text: '비밀일기Y' });
  createHealthNoteStore(storage).add({ text: '비밀메모Y' });
  createHelpRequestStore(storage).add({ category: 'shopping', message: '비밀도움Y' });
  createMedicationStore(storage).add({ name: '비밀약Y' });
  createScheduleStore(storage).add({ title: '비밀일정Y' });
  const s = createSearch();
  s.registerProvider(createAreaProvider(AREAS));
  s.registerProvider(createSavedProvider(createSavedStore(storage)));
  s.registerProvider(createCareProvider(() => []));
  s.registerProvider(createEnjoyProvider(() => []));
  for (const q of ['비밀일기Y', '비밀메모Y', '비밀도움Y', '비밀약Y', '비밀일정Y']) assert.deepEqual((await s.query(q)).results, [], q);
  assert.equal(/storage|journal|schedule|healthNotes|helpRequests/.test(strip(read('js', 'search.js'))), false);
});

test('OG-EN-33 Care semantic separation: different types, categories and screens; shared route only', () => {
  assert.equal(E.ENJOY_TYPE_IDS.some((t) => CARE_TYPE_IDS.includes(t)), false);
  assert.equal(E.ENJOY_CATEGORY_IDS.some((c) => CARE_CATEGORY_IDS.includes(c.toLowerCase())), false);
  assert.equal(/노인복지관|보건소|치매안심센터|장기요양/.test(VIEW), false, 'care facilities are not 즐길거리 search words');
  assert.equal(/care-view|createCareView/.test(VIEW), false);
  assert.equal(E.fromKakaoPlace({ type: 'place', providerId: '1', title: 'x' }, 'facility'), null, 'a care category cannot be an enjoy category');
});

test('OG-EN-34 Community no auto-post: nothing in 즐길거리 writes to community or creates a group', () => {
  /* Enjoy V2 — WHY: 즐길거리 now LISTS the person's own posts that were started from a 즐길거리 item (내가 쓴 관련 글), read-only.
     BEFORE: the words "community" / "post" could not appear in the view at all.
     AFTER: reading is allowed; every way of writing, publishing or joining is still refused (and the next lines still hold). */
  assert.equal(/post\(|createGroup|joinGroup|meetup/i.test(VIEW + CONTRACTS), false);
  assert.equal(/posts\.(add|update|remove|save|compose)|posts\(\)\.(push|splice)/.test(VIEW + CONTRACTS), false, 'the list of own posts is only read');
  assert.deepEqual((VIEW + CONTRACTS).match(/#community[^'"`]*/g).filter((h) => !h.startsWith('#community/post-')), [], 'the only community address is the person\'s own post');
  assert.deepEqual([...E.FUTURE_ENJOY_TYPES], ['TRIP', 'GROUP']);
  assert.equal(AREAS.find((a) => a.id === 'enjoy').modules.find((m) => m.id === 'groups').available, false);
  // Phase 6: 커뮤니티 owns communityPosts/groupDrafts/meetupDrafts. 즐길거리 still never touches them: its review button only
  // hands a small prefill to app.js, and nothing is written until the user saves in 커뮤니티.
  assert.deepEqual(COLLECTIONS.filter((c) => /group|post|community|meetup/i.test(c)), ['communityPosts', 'groupDrafts', 'meetupDrafts']);
  assert.equal(/communityPosts|groupDrafts|meetupDrafts|posts\.add|groups\.add/.test(VIEW + CONTRACTS), false);
});

test('OG-EN-35 no booking: no booking, application, payment, lodging or transport action', () => {
  assert.equal(/예약하기|신청하기|결제하기|바로 신청|신청 완료|숙박 예약|교통 예약|항공|패키지/.test(VIEW + CONTRACTS + HOME), false);
  assert.match(VIEW, /ONGIL이 운영하는 프로그램이 아니에요/);
  assert.match(AREAS.find((a) => a.id === 'enjoy').notice, /신청·예약·결제 기능은 없습니다/);
  assert.equal(/bookingAvailable|applicationAvailable|price/.test(CONTRACTS), false);
});

/* ───────── quality ───────── */

test('OG-EN-36 corrupted provider response: any shape is survived; bad items dropped, never repaired', async () => {
  for (const bad of [null, 'x', 5, [], { ok: true }, { ok: true, items: 'no' }, { ok: true, items: [null, 1, 'x', { type: 'program' }, { type: 'program', providerId: '<b>', title: 't' }, { type: 'place', providerId: 'abc', title: 't' }] }]) {
    const fetcher = async (url) => ({ ok: true, json: async () => (/action=status/.test(url) ? { ok: true, providers: { [LIFELONG_PROVIDER]: { configured: true }, [KAKAO_PLACE_PROVIDER]: { configured: true }, [TOUR_PROVIDER]: { configured: true } } } : bad) });
    const opts = { apiUrl: (p) => p, fetcher };
    for (const r of await Promise.all([createLifelongClassSource(opts).load({ region: '서울' }), createEnjoyPlaceSource(opts).load({ region: '서울', word: '공원' }), createTourPlaceSource(opts).load({ region: '서울', contentType: '12' })])) {
      assert.ok(['unavailable', 'empty', 'ready'].includes(r.state));
      assert.equal(E.sanitizeEnjoyItems((r.items || []).map((x) => (x && x.type === 'place' ? E.fromKakaoPlace(x, 'OUTING') : x)).filter(Boolean)).length, 0, JSON.stringify(bad));
    }
  }
  assert.deepEqual(E.sanitizeEnjoyItems([null, 1, { type: 'CLASS' }, { type: 'PLACE', id: 'x' }, cls(), cls()]).map((i) => i.id), ['lc1']);
});

test('OG-EN-37 400 item performance: filter, search and sort over 400 items stay fast', () => {
  const items = E.sanitizeEnjoyItems([
    ...Array.from({ length: 200 }, (_, i) => E.fromLifelong(lifelong(i, { location: { region: i % 2 ? '서울' : '부산', address: '주소 ' + i } }), i % 3 ? 'LEARNING' : 'HOBBY')),
    ...Array.from({ length: 200 }, (_, i) => E.fromKakaoPlace(kakao(i), i % 2 ? 'OUTING' : 'CULTURE')),
  ]);
  assert.equal(items.length, 400);
  const t = performance.now();
  for (let k = 0; k < 20; k++) {
    E.sortEnjoy(E.filterEnjoy(items, { query: '교실 1' }), 'start');
    E.filterEnjoy(items, { type: 'PLACE', category: 'OUTING', region: '서울' });
    E.availableEnjoyFilters(items);
  }
  const ms = (performance.now() - t) / 20;
  assert.ok(ms < 50, `one filter+search+sort pass took ${ms.toFixed(1)}ms`);
});

test('OG-EN-38 DOM bound: at most 30 rows at a time, one detail dialog, built only when opened', () => {
  assert.equal(PAGE_SIZE, 30);
  assert.match(VIEW, /const page = items\.slice\(0, state\.shown\);/);
  assert.match(VIEW, /state\.shown \+= PAGE_SIZE;/);
  assert.equal((VIEW.match(/el\('dialog'/g) || []).length, 1);
  assert.match(VIEW, /function ensureDialog\(\) \{\s*if \(dialog\) return dialog;/);
});

test('OG-EN-39 accessibility: named groups, pressed state with a tick, labelled fields, live counts, dialog semantics', () => {
  assert.match(VIEW, /role: 'group', 'aria-label': '즐길거리 분류'/);
  assert.match(VIEW, /role: 'group', 'aria-labelledby': id/);
  assert.equal(/el\('input'/.test(VIEW), false, 'every field comes from makeField (label for=)');
  assert.match(VIEW, /'data-og-enjoy-count': String\(list\.length\), 'aria-live': 'polite'/);
  assert.match(VIEW, /'aria-haspopup': 'dialog'/);
  assert.match(VIEW, /'aria-labelledby': 'og-enjoy-detail-title'/);
  assert.match(VIEW, /'aria-pressed': isSaved \? 'true' : 'false'/);
  assert.match(VIEW, /b\.setAttribute\('aria-disabled', 'true'\);/);
});

test('OG-EN-40 keyboard: Tab stays in the dialog, Escape closes it natively, focus returns; "더 보기" moves focus to the first new row', () => {
  assert.match(VIEW, /if \(event\.key !== 'Tab'\) return;/);
  assert.match(VIEW, /if \(back\) back\.focus\(\);/);
  assert.match(VIEW, /const focusRow = next\.querySelectorAll\('\[data-og-enjoy-open\]'\)\[first\];/);
  assert.match(VIEW, /if \(target && !target\.disabled\) target\.focus\(\);/, 'a filter keeps focus on the pressed choice');
});

test('OG-EN-41 390 responsive rules: dialog rows stack, long titles and addresses wrap', () => {
  assert.match(CSS, /@media \(max-width: 480px\) \{\s*\.og-care-rows \{ grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(CSS, /\.og-care-dialog \.og-dialog__title \{ overflow-wrap: anywhere; \}/);
  assert.match(VIEW, /class: 'og-dialog og-care-dialog og-enjoy-dialog'/, 'the enjoy dialog uses the same wrapping rules');
});

test('OG-EN-42 820 responsive rules: one card column with a readable width', () => {
  /* Enjoy V2 — WHY: two cards were added before the V1 cards. BEFORE: the grid started with cards.categories. AFTER: today, mine, then the V1 cards in their order. */
  assert.match(VIEW, /el\('div', \{ class: 'og-care-grid' \}, cards\.today\.root, cards\.mine\.root, cards\.categories\.root, cards\.search\.root, cards\.results\.root, cards\.saved\.root, cards\.posts\.root\)/);
  assert.match(CSS, /\.og-family-grid, \.og-care-grid \{ display: grid; gap: 1rem; max-width: 60rem; \}/);
});

test('OG-EN-43 1440 responsive rules: bounded dialog; the page uses the same stylesheets (no new visual system)', () => {
  assert.match(CSS, /\.og-dialog \{ width: min\(34rem, calc\(100vw - 2rem\)\)/);
  assert.equal(/ongil-enjoy\.css|livon/i.test(read('index.html').match(/<link[^>]+ongil[^>]+>/g).join('')), false);
});

test('OG-EN-44 long text: every provider text is bounded before it reaches the screen', () => {
  const long = 'x'.repeat(5000);
  const c = E.normalizeProgram({ type: 'CLASS', id: 'a', title: long, category: 'HOBBY', summary: long, organization: long, location: long, scheduleText: long, sourceName: long });
  assert.deepEqual([c.title.length, c.summary.length, c.organization.length, c.location.length, c.scheduleText.length, c.sourceName.length], [120, 300, 80, 160, 80, 120]);
  assert.equal(E.calendarDraft({ ...c, startDate: '2026-11-01' }).title.length, 80, 'calendar titles fit the event contract');
  assert.match(CSS, /\.og-home-item__title \{[^}]*overflow-wrap: anywhere/);
});

test('OG-EN-45 no horizontal overflow sources: shrinkable dialog children, wrapping rows', () => {
  assert.match(CSS, /\.og-care-dialog \.og-dialog__body > \* \{ min-width: 0; \}/);
  assert.match(CSS, /\.og-care-rows dd \{[^}]*overflow-wrap: anywhere/);
  assert.match(CSS, /\.og-life-days__text \{[^}]*overflow-wrap: anywhere/);
});

test('OG-EN-46 no console errors: no console calls; a failing source becomes a state', () => {
  assert.equal(/console\.(error|warn|log)/.test(VIEW + CONTRACTS), false);
  assert.match(VIEW, /\} catch \{\s*result = \{ state: 'unavailable'/);
});

test('OG-EN-47 no page errors: null children skipped, no markup strings, no geolocation', () => {
  assert.match(VIEW, /const put = \(node, \.\.\.kids\) => append\(node, kids\);/);
  assert.equal(/card\.body\.append\(/.test(VIEW), false);
  assert.equal(/innerHTML|outerHTML|insertAdjacentHTML/.test(VIEW + CONTRACTS + HOME), false);
  assert.equal(/geolocation|getCurrentPosition|watchPosition/.test(VIEW + CONTRACTS + HOME + strip(APP) + strip(read('js', 'data-source.js'))), false, 'automatic geolocation = 0');
});

test('OG-EN-48 account delete safety: no new collection; saved and calendar entries go with the ONGIL erase', () => {
  // Phase 5 added no collection (20). Phase 6 then added three community collections (23) — none of them for 즐길거리.
  // Phase 9: one collection was added — "analytics" (daily usage counters, numbers only; class OPERATIONAL). BEFORE: 23. AFTER: 24.
  /* Family Connection V1: + family (BEFORE 26, AFTER 27) */ /* My Life V2: + memos (BEFORE 27, AFTER 28) */ assert.equal(COLLECTIONS.length, 28, 'Phase 5 added no collection; Phase 6 added three community ones; Phase 9 added analytics; Completion V1 added healthMeasures; Completion V3 added emergencyContacts');
  const w = world();
  w.saved.toggle(E.savedInputFor(cls()));
  w.schedule.add(E.calendarDraft(cls()));
  assert.deepEqual(w.storage.list().sort(), ['events', 'saved']);
  w.storage.clear();
  assert.deepEqual(w.storage.list(), []);
});

test('OG-EN-49 non-ONGIL preserved: LIVON and site keys survive the erase', () => {
  const foreign = { 'livon.keep': '1', 'livon.explore.saved': '[1]', 'newon-app-theme': 'dark', 'ongil.v2.saved': 'x' };
  const backend = createMemoryBackend(foreign);
  const storage = createStorage({ backend });
  createSavedStore(storage).toggle(E.savedInputFor(place()));
  storage.clear();
  for (const [k, v] of Object.entries(foreign)) assert.equal(backend.getItem(k), v, k);
});

test('OG-EN-50 regression: fetch injected once, sources only in data-source.js, existing screens and providers kept', () => {
  assert.equal((APP.match(/\bfetch\(/g) || []).length, 1);
  /* Family Connection V2: + family-remote.js uses the injected fetch for /api/ongil/family (BEFORE: data-source.js only) */
  for (const f of fs.readdirSync(path.join(ROOT, 'ongil-start', 'js')).filter((x) => x.endsWith('.js') && x !== 'data-source.js' && x !== 'family-remote.js')) assert.equal(/fetcher\(|\bfetch\(/.test(strip(read('js', f)).replace(/win\.fetch\(url, init\)/, '')), false, f);
  assert.match(APP, /search\.registerProvider\(createCareProvider\(\(\) => care\.items\(\)\)\);/);
  // Phase 9: wrapped by observeSource (see OG-FC-10); still created once.
  assert.match(APP, /const nearbySource = observeSource\(createLifelongClassSource\(dataApi\), /);
  assert.equal((APP.match(/createLifelongClassSource\(/g) || []).length, 1);
  assert.match(APP, /facility: observeSource\(createFacilitySource\(dataApi\), /); // Phase 9: observed, as above
  assert.deepEqual(TARGETS_BY_CATEGORY.TRAVEL, ['tour-12'], 'travel = tourist information only (no lodging, no transport)');
  assert.equal(SEARCH_TARGETS.length, 12);
  assert.equal(/server\/|KAKAO_REST_API_KEY|TOURAPI_SERVICE_KEY|PUBLIC_DATA_SERVICE_KEY/.test(strip(read('js', 'data-source.js'))), false);
});

/* ───────── Phase B: the regions 즐길거리 looks in ───────── */

test('OG-EN-B1 Enjoy regions: sixteen choices in a natural order; 광주 and 전남 are one choice, 내 정보 keeps its own names', async () => {
  const { REGIONS } = await import('../../ongil-start/js/contracts.js');
  assert.deepEqual(E.ENJOY_REGIONS.map((r) => r.label), ['서울', '부산', '대구', '인천', '광주·전남', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '경북', '경남', '제주']);
  assert.deepEqual(E.ENJOY_REGIONS.map((r) => r.id), E.ENJOY_REGIONS.map((r) => r.label), 'the label is the name that is sent');
  assert.equal(E.ENJOY_REGIONS.some((r) => r.id === '광주' || r.id === '전남'), false, 'no 광주-only or 전남-only choice');
  assert.equal(REGIONS.length, 17, 'the profile regions are not changed');
  assert.ok(REGIONS.some((r) => r.id === '광주') && REGIONS.some((r) => r.id === '전남'), 'a stored 내 정보 region stays valid');
  /* every profile region belongs to exactly one Enjoy region, and nothing else does */
  for (const r of REGIONS) assert.equal(E.ENJOY_REGIONS.filter((x) => E.enjoyRegionParts(x.id).includes(r.id)).length, 1, r.id);
  assert.deepEqual([E.enjoyRegionFor('광주'), E.enjoyRegionFor('전남'), E.enjoyRegionFor('세종'), E.enjoyRegionFor('강원'), E.enjoyRegionFor(''), E.enjoyRegionFor('화성')], ['광주·전남', '광주·전남', '세종', '강원', '', '']);
  assert.deepEqual([E.enjoyRegionParts('광주·전남'), E.enjoyRegionParts('제주'), E.enjoyRegionParts('광주'), E.enjoyRegionParts('x')], [['광주', '전남'], ['제주'], [], []]);
});

test('OG-EN-B2 the tourism request carries the chosen region name and one of 12 / 14 / 28 only — nothing about the person', async () => {
  for (const region of TOUR_REGIONS) {
    const a = api({ items: { [TOUR_PROVIDER]: [tour(1)] } });
    assert.equal((await createTourPlaceSource(a.opts).load({ region, contentType: '14' })).state, 'ready', region);
    const url = a.calls[a.calls.length - 1].url;
    assert.equal(new URLSearchParams(url.slice(url.indexOf('?'))).get('region'), region);
    assert.deepEqual([...new URLSearchParams(url.slice(url.indexOf('?'))).keys()].sort(), ['limit', 'page', 'provider', 'region', 'type']);
  }
  for (const type of ['15', '25', '32', '38', '39']) assert.equal((await createTourPlaceSource(api().opts).load({ region: '서울', contentType: type })).reason, 'TYPE_REQUIRED', type);
  const zero = api({ items: { [TOUR_PROVIDER]: [] } });
  assert.deepEqual(await createTourPlaceSource(zero.opts).load({ region: '세종', contentType: '12' }), { state: 'empty', items: [], attribution: '' }, 'nothing found stays nothing — no other region is shown instead');
});

test('OG-EN-B3 the screen: the region list is the Enjoy list, the default follows 내 정보, and a merged region is asked part by part', () => {
  assert.match(VIEW, /options: ENJOY_REGIONS, hint \}, state\.region \|\| mine\)/);
  assert.match(VIEW, /const mine = enjoyRegionFor\(myRegion\);/);
  assert.match(VIEW, /if \(!ENJOY_REGIONS\.some\(\(x\) => x\.id === r\)\)/);
  assert.doesNotMatch(VIEW, /options: REGIONS/);
  assert.doesNotMatch(VIEW, /서울, 부산, 대구, 인천, 광주, 대전, 경기만/, 'the seven-region sentence is gone');
  assert.match(VIEW, /sources\.tour\.load\(\{ region, contentType: target\.params\.contentType \}\)/, 'tourism: one request with the merged name');
  assert.match(VIEW, /loadParts\(region, \(part\) => sources\.lifelong\.load\(\{ region: part,/);
  assert.match(VIEW, /loadParts\(region, \(part\) => sources\.place\.load\(\{ region: part,/);
  assert.match(VIEW, /partial: failed\.length > 0/, 'a part that could not be read is said, not hidden');
  assert.match(VIEW, /return failed\[0\] \|\| answers\[0\];/, 'no part answered → unavailable before empty');
  assert.doesNotMatch(VIEW, /geolocation|getCurrentPosition/);
});
