// ONGIL Enjoy + Local Discovery V2 (Phase A) — the existing 즐길거리 screen, extended:
// 오늘 뭐 하지? (shortcuts from self-chosen interests) · 내 관심사 · 내 지역 · source state per visit · 저장한 활동 as a list ·
// 날짜 골라 일정에 추가 · 할 일로 추가 · 내가 쓴 관련 글. No new storage, no new API, no server change.
// The measured browser run (Chromium, 320 … 1440px at 100% and 200% text, keyboard) is recorded in docs/ongil/ONGIL_ENJOY_V2.md.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS } from '../../ongil-start/js/storage.js';
import { INTERESTS, REGIONS, SAVED_TYPES } from '../../ongil-start/js/contracts.js';
import * as E from '../../ongil-start/js/enjoy-contracts.js';
import { SEARCH_TARGETS, TARGETS_BY_CATEGORY, ENJOY_SECTIONS, PAGE_SIZE } from '../../ongil-start/js/enjoy-view.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createPostStore } from '../../ongil-start/js/community.js';
import { reviewPrefill } from '../../ongil-start/js/community-contracts.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const VIEW = strip(read('js', 'enjoy-view.js'));
const CONTRACTS = strip(read('js', 'enjoy-contracts.js'));
const APP = strip(read('js', 'app.js'));
const INDEX = read('index.html');
const V2 = CONTRACTS.slice(CONTRACTS.indexOf('export const INTEREST_CATEGORIES'));

function world() {
  const clock = { t: new Date(2026, 9, 7, 9, 0, 0).getTime() };
  const now = () => (clock.t += 1000);
  const storage = createStorage({ backend: createMemoryBackend(), now });
  return { now, storage, saved: createSavedStore(storage, { now }), tasks: createTaskStore(storage, { now }), schedule: createScheduleStore(storage, { now }), posts: createPostStore(storage, { now }) };
}
const PLACE = E.normalizePlace({ type: 'PLACE', id: 'tour-1001', name: '서울숲', category: 'OUTING', region: '서울', address: '서울특별시 성동구 뚝섬로 273', sourceName: '한국관광공사 TourAPI', sourceUrl: 'https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=1001' });
const CLASS = E.normalizeProgram({ type: 'CLASS', id: 'c-1', title: '스마트폰 기초', category: 'LEARNING', organization: '평생학습관', region: '서울', startDate: '2026-11-03', startTime: '10:00', sourceName: '전국평생학습강좌표준데이터' });

test('EV2-01 V1 is kept: six categories, twelve search targets, the same route sections and page size', () => {
  assert.deepEqual(E.ENJOY_CATEGORIES.map((c) => c.label), ['취미', '배움', '운동', '문화', '나들이', '여행']);
  assert.equal(SEARCH_TARGETS.length, 12);
  assert.deepEqual(ENJOY_SECTIONS, ['hobby', 'learning', 'exercise', 'culture', 'outing', 'travel']);
  assert.equal(PAGE_SIZE, 30);
  assert.deepEqual(Object.keys(TARGETS_BY_CATEGORY), E.ENJOY_CATEGORY_IDS);
  for (const fn of ['normalizeProgram', 'normalizePlace', 'fromLifelong', 'fromTourPlace', 'fromKakaoPlace', 'filterEnjoy', 'availableEnjoyFilters', 'sortEnjoy', 'detailRows', 'savedInputFor', 'calendarDraft', 'isAlreadyInCalendar', 'familySendPreview']) assert.equal(typeof E[fn], 'function', fn);
  for (const kept of ["title: '무엇을 해볼까요?'", "title: '지역에서 찾아보기'", "title: '찾은 즐길거리'", "title: '저장한 즐길거리'", "'data-og-enjoy-find': 'go'", "'data-og-enjoy-more': 'true'", "'data-og-enjoy-save': 'true'", "'data-og-enjoy-calendar-open': 'true'", "'data-og-enjoy-family-open': 'true'", "'data-og-enjoy-review': 'true'"]) assert.ok(VIEW.includes(kept), kept);
  assert.ok(PLACE && CLASS);
});

test('EV2-02 the screen order: 오늘 뭐 하지? → 내 관심사·내 지역 → 분류 → 찾기 → 찾은 것 → 저장한 활동 → 내 글, on the same #enjoy screen', () => {
  assert.match(VIEW, /el\('div', \{ class: 'og-care-grid' \}, cards\.today\.root, cards\.mine\.root, cards\.categories\.root, cards\.search\.root, cards\.results\.root, cards\.saved\.root, cards\.posts\.root\)/);
  for (const slot of ['today', 'mine', 'categories', 'search', 'results', 'saved', 'posts']) assert.match(VIEW, new RegExp(`createCard\\(\\{ area: 'enjoy', slot: '${slot}'`), slot);
  assert.match(VIEW, /title: '오늘 뭐 하지\?'/);
  assert.match(VIEW, /title: '내 관심사 · 내 지역'/);
  assert.match(VIEW, /저장한 활동/);
  assert.match(VIEW, /title: '내가 쓴 관련 글'/);
  /* no new page, route or stylesheet */
  assert.equal(/ongil-enjoy\.css|enjoy-v2\.css/.test(INDEX), false);
  assert.equal(fs.existsSync(path.join(ROOT, 'ongil-start/js/enjoy-home.js')), false);
});

test('EV2-03 interest shortcuts come only from the interests the person ticked — the existing eight, nothing new', () => {
  assert.deepEqual(INTERESTS.map((i) => i.id), ['health', 'exercise', 'hobby', 'learning', 'culture', 'outing', 'community', 'family'], 'the profile list is unchanged');
  assert.deepEqual(Object.keys(E.INTEREST_CATEGORIES), ['exercise', 'hobby', 'learning', 'culture', 'outing']);
  for (const [interest, cats] of Object.entries(E.INTEREST_CATEGORIES)) {
    assert.ok(INTERESTS.some((i) => i.id === interest));
    for (const c of cats) assert.ok(E.enjoyCategoryById(c), c);
  }
  assert.deepEqual(E.interestShortcuts([]), []);
  assert.deepEqual(E.interestShortcuts(['outing', 'exercise']).map((s) => `${s.interest}>${s.category}>${s.hash}`), ['exercise>EXERCISE>#enjoy/exercise', 'outing>OUTING>#enjoy/outing', 'outing>TRAVEL>#enjoy/travel'], 'in the order 내 정보 lists them');
  /* 건강 · 모임·이웃 · 가족 have no 즐길거리 category: they are not turned into a guess */
  assert.deepEqual(E.interestShortcuts(['health', 'community', 'family']), []);
  for (const junk of [null, undefined, 'outing', 7, {}, ['nope', 3, null]]) assert.deepEqual(E.interestShortcuts(junk), []);
  assert.deepEqual(E.interestLabels(['family', 'hobby', 'zzz']), ['취미', '가족']);
  const all = E.interestShortcuts(INTERESTS.map((i) => i.id)).map((s) => s.category);
  assert.deepEqual([...new Set(all)].sort(), [...E.ENJOY_CATEGORY_IDS].sort(), 'every category can be reached, each once');
  assert.equal(all.length, 6);
});

test('EV2-04 오늘 뭐 하지? is a shortcut, not a recommendation: no score, rank, popularity or "for you" wording', () => {
  assert.match(VIEW, /내 관심사에서 찾아보기/);
  assert.match(VIEW, /추천이나 순위가 아니고, 건강·가족·생활 기록은 쓰지 않아요/);
  assert.match(VIEW, /interestShortcuts\(profile\.getProfile\(\)\.interests\)/);
  const words = (VIEW + V2).match(/'[^'\n]*[가-힣][^'\n]*'|`[^`\n]*[가-힣][^`\n]*`/g) || [];
  assert.ok(words.length > 80);
  for (const w of words) {
    if (/추천이나 순위가 아니/.test(w)) continue;
    assert.doesNotMatch(w, /맞춤 추천|추천해|추천합니다|추천 활동|인기|랭킹|순위|점수|평점|별점|후기 \d|\d+명이|남은 자리|잔여|마감 임박|가까운|근처|내 주변|km|미터/, w);
  }
  /* a shortcut only picks the category: it never starts a search by itself */
  const today = VIEW.slice(VIEW.indexOf('function renderToday'), VIEW.indexOf('function renderMine'));
  assert.match(today, /choose\(sc\.category, true\)/);
  assert.doesNotMatch(today, /runSearch|sources\.|\.load\(/);
});

test('EV2-05 interest inference = 0: the V2 code reads no health, family, age or My Life record', () => {
  const v2view = VIEW;
  assert.doesNotMatch(v2view + V2, /ageRange|usageMode|needs\b|familyIntent|nickname/, 'only interests and region are read from the profile');
  assert.doesNotMatch(v2view + V2, /checkIn|medication|symptom|healthNote|healthMeasure|sleep\b|dailyLife|journal|expenses|memos|routines|emergency|familyConnect|familySharing|helpRequests/);
  assert.deepEqual([...new Set((v2view.match(/profile\.getProfile\(\)\.?[a-zA-Z]*/g) || []))].sort(), ['profile.getProfile()', 'profile.getProfile().interests', 'profile.getProfile().region'].sort());
  assert.match(v2view, /const p = profile\.getProfile\(\);\s*const labels = interestLabels\(p\.interests\);/);
  /* the task list and calendar are written to and checked for duplicates — never read to suggest anything */
  assert.deepEqual([...new Set(v2view.match(/tasks\.[a-zA-Z]+/g))].sort(), ['tasks.add', 'tasks.list']);
  assert.deepEqual([...new Set(v2view.match(/schedule\.[a-zA-Z]+/g))].sort(), ['schedule.add', 'schedule.listForDate']);
  assert.equal(E.interestShortcuts(['exercise']).length, 1);
});

test('EV2-06 내 관심사 · 내 지역: what 내 정보 holds, with the way to change it — no new profile store, no location', () => {
  const mine = VIEW.slice(VIEW.indexOf('function renderMine'), VIEW.indexOf('function renderCategories'));
  assert.match(mine, /'data-og-enjoy-interests'/);
  assert.match(mine, /'data-og-enjoy-region': p\.region \|\| 'none'/);
  assert.match(mine, /href: '#account'/);
  assert.match(mine, /내 위치는 묻지 않고, 따라가지도 않아요/);
  assert.doesNotMatch(mine, /updateProfile|storage\.|localStorage/);
  for (const f of ['enjoy-view.js', 'enjoy-contracts.js']) assert.doesNotMatch(strip(read('js', f)), /geolocation|getCurrentPosition|watchPosition|navigator\.permissions|latitude:\s*pos|coords\./, f);
  assert.equal(REGIONS.length, 17);
  assert.equal(COLLECTIONS.some((c) => /enjoy|interest|activity|browse|recent/i.test(c)), false, 'no new collection');
});

test('EV2-07 source state is what each source answered this visit — independent, and never fixed in the code', () => {
  const T = SEARCH_TARGETS;
  assert.deepEqual(E.SOURCE_GROUPS.map((g) => g.id), ['tour', 'lifelong', 'place']);
  assert.deepEqual(E.sourceSummary(T, {}).map((s) => s.state), ['idle', 'idle', 'idle']);
  const mixed = E.sourceSummary(T, { 'tour-12': { state: 'ready', text: '서울에서 3건 찾았어요.' }, 'kakao-park': { state: 'unavailable', text: '지금은 자료를 받아오지 못했어요. 잠시 뒤 다시 찾아 주세요.' }, lifelong: { state: 'unavailable', text: '지금은 자료를 받아오지 못했어요. 잠시 뒤 다시 찾아 주세요.' } });
  assert.deepEqual(mixed.map((s) => `${s.id}:${s.state}`), ['tour:ready', 'lifelong:unavailable', 'place:unavailable'], 'one source failing leaves the others as they are');
  assert.equal(mixed[1].text, '지금은 자료를 받아오지 못했어요. 잠시 뒤 다시 찾아 주세요.');
  /* the same sources answer later in the visit: the line follows the answer */
  const later = E.sourceSummary(T, { lifelong: { state: 'ready', text: 'x' }, 'kakao-park': { state: 'unavailable', text: 'y' }, 'kakao-museum': { state: 'ready', text: 'z' } });
  assert.deepEqual(later.map((s) => `${s.id}:${s.state}`), ['tour:idle', 'lifelong:ready', 'place:ready']);
  assert.deepEqual(E.sourceSummary(T, { 'tour-14': { state: 'empty', text: '' }, 'tour-12': { state: 'loading', text: '' } })[0].state, 'loading');
  assert.deepEqual(E.sourceSummary(T, { 'tour-14': { state: 'empty', text: '' } })[0].state, 'empty');
  for (const junk of [null, undefined, 'x', []]) assert.deepEqual(E.sourceSummary(junk, junk).map((s) => s.state), ['idle', 'idle', 'idle']);
  /* nothing in the screen names a provider as broken ahead of time, and no stand-in data exists */
  assert.doesNotMatch(VIEW + CONTRACTS, /UPSTREAM_ERROR|502|장애 중|현재 장애|점검 중/);
  assert.doesNotMatch(VIEW + CONTRACTS, /fixture|sample(Items|Data)|mockItems|fallbackItems|DEMO_/i);
  assert.match(VIEW, /sourceSummary\(SEARCH_TARGETS, state\.sourceStatus\)/);
  assert.match(VIEW, /한 자료가 응답하지 않아도 다른 자료에서 찾은 것은 그대로 보여요/);
  assert.match(VIEW, /state\.items = \[\.\.\.state\.items\.filter\(\(i\) => i\._target !== target\.id\)/, 'a failed search removes only its own earlier results');
});

test('EV2-08 results show only fields the source gave: no rating, review count, popularity, seats, distance or made-up price', () => {
  const rows = E.detailRows(PLACE).map((r) => r.label);
  assert.deepEqual(rows, ['종류', '분류', '주소', '자료 출처']);
  assert.equal(E.detailRows(CLASS).some((r) => r.label === '비용'), false, 'no cost when the source gave none');
  for (const key of Object.keys(PLACE).concat(Object.keys(CLASS))) assert.doesNotMatch(key, /rating|review|popular|rank|score|seats|remaining|distance|price|likes|views/i, key);
  assert.doesNotMatch(VIEW + CONTRACTS, /rating|reviewCount|popularity|remainingSeats|distanceKm|likes|viewCount/i);
});

test('EV2-09 저장한 활동 is the existing Saved store, listed: save, unsave, reload — one storage', () => {
  const w = world();
  assert.deepEqual(E.savedActivities(w.saved.list()), []);
  assert.equal(w.saved.toggle(E.savedInputFor(PLACE)).saved, true);
  assert.equal(w.saved.toggle(E.savedInputFor(CLASS)).saved, true);
  w.saved.save({ type: 'POST', id: 'p1', title: '내 글', href: '#community' });
  w.saved.save({ type: 'PRODUCT', id: 'x1', title: '상품', href: '#store' });
  const list = E.savedActivities(w.saved.list());
  assert.deepEqual(list.map((s) => `${s.type}:${s.id}`), ['PROGRAM:c-1', 'PLACE:tour-1001'], 'programmes and places only, newest first');
  /* a new store over the same device storage reads the same list (reload) */
  const again = createSavedStore(w.storage, { now: w.now });
  assert.deepEqual(E.savedActivities(again.list()).map((s) => s.id), ['c-1', 'tour-1001']);
  assert.equal(w.saved.unsave('PLACE', 'tour-1001'), true);
  assert.deepEqual(E.savedActivities(w.saved.list()).map((s) => s.id), ['c-1']);
  assert.equal(w.saved.count(), 3);
  for (const junk of [null, 'x', [null, 3, { type: 'PLACE' }, { type: 'SERVICE', id: 'a', title: 'b' }]]) assert.deepEqual(E.savedActivities(junk), []);
  /* the screen reads the store each time and writes through its own methods only */
  assert.match(VIEW, /const entries = savedActivities\(saved\.list\(\)\);/);
  assert.deepEqual([...new Set(VIEW.match(/(?<![.\w])saved\.[a-zA-Z]+\(/g))].sort(), ['saved.isSaved(', 'saved.list(', 'saved.toggle(', 'saved.unsave(']);
  assert.deepEqual(SAVED_TYPES, ['SERVICE', 'BENEFIT', 'FACILITY', 'PROGRAM', 'PLACE', 'POST', 'PRODUCT'], 'no new saved type');
  assert.doesNotMatch(VIEW + CONTRACTS, /storage\.(get|set)|localStorage|sessionStorage|indexedDB/);
});

test('EV2-10 a saved entry opens as what was written down when saving, and toggling it names exactly that entry', () => {
  const w = world();
  w.saved.toggle(E.savedInputFor(PLACE));
  const entry = w.saved.list()[0];
  const item = E.itemFromSaved(entry);
  assert.deepEqual([item.type, item.id, item.title, item.snapshot, item.sourceName], ['PLACE', 'tour-1001', '서울숲', true, '한국관광공사 TourAPI']);
  assert.deepEqual(E.savedDetailRows(item).map((r) => r.label), ['종류', '저장할 때 적어 둔 내용', '자료 출처']);
  assert.match(item.sourceUrl, /^https:\/\//);
  assert.equal(E.savedInputFor(item).type, 'PLACE');
  assert.equal(w.saved.isSaved(E.savedInputFor(item).type, item.id), true);
  assert.equal(w.saved.toggle(E.savedInputFor(item)).saved, false, 'unsaved through the same key');
  assert.equal(w.saved.count(), 0);
  assert.equal(w.saved.toggle(E.savedInputFor(item)).saved, true, 'and saved again as the same entry');
  assert.deepEqual(w.saved.list().map((s) => [s.type, s.id, s.title, s.source]), [['PLACE', 'tour-1001', '서울숲', '한국관광공사 TourAPI']]);
  /* a link that is not https is not offered; damaged or foreign entries give nothing */
  assert.equal(E.itemFromSaved({ type: 'PLACE', id: 'a1', title: 'x', href: 'javascript:alert(1)' }).sourceUrl, '');
  assert.equal(E.itemFromSaved({ type: 'PLACE', id: 'a1', title: 'x', href: '#enjoy' }).sourceUrl, '');
  for (const junk of [null, {}, { type: 'POST', id: 'a', title: 'b' }, { type: 'PLACE', id: '<x>', title: 'b' }, { type: 'PLACE', id: 'a', title: '  ' }]) assert.equal(E.itemFromSaved(junk), null);
  assert.deepEqual(E.savedDetailRows(PLACE), []);
  assert.match(VIEW, /저장할 때 적어 둔 내용이에요\. 지금 정보는 다시 찾아보거나 운영 기관에서 확인해 주세요/);
});

test('EV2-11 a class with a real start date keeps the V1 calendar path', () => {
  assert.deepEqual(E.calendarDraft(CLASS), { title: '스마트폰 기초', date: '2026-11-03', time: '10:00' });
  assert.equal(E.calendarDraft(PLACE), null, 'a place has no date of its own');
  assert.match(VIEW, /const draft = \(extra && extra\.draft\) \|\| calendarDraft\(item\);/);
  assert.match(VIEW, /\$\{draft\.picked \? '\(내가 고른 날\)' : '\(시작일\)'\}/);
});

test('EV2-12 a place goes to the calendar only with a day the person picked: today or later, preview first', () => {
  const today = '2026-10-07';
  assert.deepEqual(E.pickedCalendarDraft(PLACE, '2026-10-10', '', today), { title: '서울숲', date: '2026-10-10', time: '', picked: true });
  assert.deepEqual(E.pickedCalendarDraft(PLACE, today, '14:30', today).time, '14:30');
  assert.equal(E.pickedCalendarDraft(PLACE, '2026-10-06', '', today), null, 'not a day that has passed');
  for (const bad of ['', '2026-13-01', '2026-02-30', 'tomorrow', null, undefined, 20261010]) assert.equal(E.pickedCalendarDraft(PLACE, bad, '', today), null, String(bad));
  assert.equal(E.pickedCalendarDraft(PLACE, '2026-10-10', '25:00', today).time, '', 'a time that is not a time is left out');
  for (const junk of [null, {}, { title: '   ' }]) assert.equal(E.pickedCalendarDraft(junk, '2026-10-10', '', today), null);
  assert.equal(E.pickedCalendarDraft({ title: '가'.repeat(200) }, '2026-10-10', '', today).title.length, 80);
  /* the screen: pick → preview → the one button that writes */
  const pick = VIEW.slice(VIEW.indexOf("mode === 'pick'"), VIEW.indexOf("mode === 'task'"));
  assert.match(pick, /date\.input\.min = today;/);
  assert.match(pick, /openDetail\(item, null, 'calendar', \{ draft \}\)/);
  assert.doesNotMatch(pick, /schedule\.add/, 'picking a day writes nothing');
  assert.match(pick, /'aria-invalid', 'true'/);
  assert.match(pick, /role: 'alert'/);
  assert.match(pick, /date\.input\.focus\(\)/);
  assert.equal((VIEW.match(/schedule\.add\(/g) || []).length, 1, 'one place in the screen writes a calendar entry: the confirm button');
});

test('EV2-13 calendar: the canonical schedule store, and the same entry is never added twice', () => {
  const w = world();
  const draft = E.pickedCalendarDraft(PLACE, '2026-10-10', '', '2026-10-07');
  assert.equal(E.isAlreadyInCalendar(draft, w.schedule.listForDate(draft.date)), false);
  assert.equal(w.schedule.add({ title: draft.title, date: draft.date, time: draft.time }).ok, true);
  assert.equal(E.isAlreadyInCalendar(draft, w.schedule.listForDate(draft.date)), true);
  assert.equal(E.isAlreadyInCalendar(E.pickedCalendarDraft(PLACE, '2026-10-11', '', '2026-10-07'), w.schedule.listForDate('2026-10-11')), false, 'another day is another entry');
  assert.equal(E.isAlreadyInCalendar(E.pickedCalendarDraft(PLACE, '2026-10-10', '09:00', '2026-10-07'), w.schedule.listForDate('2026-10-10')), false, 'another time too');
  assert.equal(w.schedule.count(), 1);
  assert.deepEqual(Object.keys(w.schedule.listForDate('2026-10-10')[0]).filter((k) => /source|enjoy|place|url/i.test(k)), [], 'nothing about the source is copied into the calendar');
  assert.match(VIEW, /if \(isAlreadyInCalendar\(draft, schedule\.listForDate\(draft\.date\)\)\) \{\s*status\.textContent = '이미 내 일정에 있어요\. 다시 추가하지 않았어요\.';/);
});

test('EV2-14 할 일로 추가: a title only, in the canonical task list, previewed, never twice while open', () => {
  const w = world();
  assert.deepEqual(E.taskDraft(PLACE), { title: '서울숲 가 보기' });
  assert.deepEqual(E.taskDraft(CLASS), { title: '스마트폰 기초 알아보기' });
  assert.ok(E.taskDraft({ type: 'PLACE', title: '가'.repeat(200) }).title.length <= 80);
  for (const junk of [null, {}, { title: '' }, { title: '  ' }, { title: 7 }]) assert.equal(E.taskDraft(junk), null);
  const draft = E.taskDraft(PLACE);
  assert.equal(E.isAlreadyInTasks(draft, w.tasks.list({ filter: 'open' })), false);
  const r = w.tasks.add({ title: draft.title });
  assert.equal(r.ok, true);
  assert.deepEqual([r.task.title, r.task.dueDate, r.task.completed], ['서울숲 가 보기', '', false], 'no due date is made up');
  assert.equal(E.isAlreadyInTasks(draft, w.tasks.list({ filter: 'open' })), true);
  w.tasks.toggle(r.task.id);
  assert.equal(E.isAlreadyInTasks(draft, w.tasks.list()), false, 'a finished task may be added again');
  for (const junk of [null, 'x', [null, {}]]) assert.equal(E.isAlreadyInTasks(draft, junk), false);
  assert.equal(E.isAlreadyInTasks(null, w.tasks.list()), false);
  const task = VIEW.slice(VIEW.indexOf("mode === 'task'"), VIEW.indexOf('const rows = item.snapshot'));
  assert.match(task, /'data-og-enjoy-task': 'preview'/);
  assert.match(task, /if \(isAlreadyInTasks\(draft, tasks\.list\(\{ filter: 'open' \}\)\)\) \{\s*status\.textContent = '이미 할 일에 있어요\. 다시 추가하지 않았어요\.';/);
  assert.equal((VIEW.match(/tasks\.add\(/g) || []).length, 1);
  assert.match(VIEW, /tasks \? el\('button', \{[^}]*'data-og-enjoy-task-open'/, 'the button exists only when the task list was handed in');
  assert.equal(COLLECTIONS.filter((c) => /task|event|schedule|calendar/i.test(c)).length, 2, 'the same two collections as before: events and tasks');
});

test('EV2-15 nothing is booked or applied for: the previews say so', () => {
  assert.equal((VIEW.match(/신청이나 예약이 되는 것은 아니에요/g) || []).length, 3, 'calendar, date pick and task previews');
  assert.doesNotMatch(VIEW + CONTRACTS, /예약하기|신청하기|결제하기|바로 신청|예약 완료|신청 완료/);
});

test('EV2-16 내가 쓴 관련 글: only the person\'s own posts that were started from a 즐길거리 item, read-only', () => {
  const w = world();
  const prefill = reviewPrefill({ type: 'PLACE', id: 'tour-1001', title: '서울숲', category: 'OUTING' });
  assert.equal(w.posts.add({ ...prefill, body: '산책하기 좋았어요.' }).ok, true);
  assert.equal(w.posts.add({ type: 'DAILY', category: 'OUTING', title: '그냥 일상', body: '오늘은 맑았어요.' }).ok, true);
  const mine = E.relatedPosts(w.posts.list());
  assert.equal(mine.length, 1, 'a post that did not start from 즐길거리 is not listed');
  assert.deepEqual([mine[0].title, mine[0].about], ['서울숲 후기', '서울숲']);
  assert.match(mine[0].href, /^#community\/post-[A-Za-z0-9_-]+$/);
  assert.deepEqual(Object.keys(mine[0]).sort(), ['about', 'href', 'id', 'title'], 'no body, author or count leaves the store');
  for (const junk of [null, 'x', [null, {}, { id: 'a', title: 'b' }, { id: 'a', title: 'b', source: { sourceType: 'USER' } }]]) assert.deepEqual(E.relatedPosts(junk), []);
  const posts = VIEW.slice(VIEW.indexOf('function renderPosts'), VIEW.indexOf('function show('));
  assert.match(posts, /relatedPosts\(typeof posts === 'function' \? posts\(\) : \[\]\)/);
  assert.match(posts, /다른 사람의 글이나 참여 인원은 보여 드리지 않아요/);
  assert.doesNotMatch(VIEW, /posts\.(add|update|remove)|communityPosts|groupDrafts|meetupDrafts/);
  assert.match(APP, /posts: \(\) => communityPosts\.list\(\),/);
  assert.doesNotMatch(VIEW + V2, /참여자|\d+명 참여|인기 모임|모임 추천|함께한 사람/);
});

test('EV2-17 후기 쓰기 and 가족에게 보여주기 are as they were: a prefill only, and a preview that sends nothing', () => {
  assert.match(VIEW, /onReview\(\{ type: item\.type, id: item\.id, title: item\.title, category: item\.category \}\)/);
  assert.match(APP, /pendingReview = reviewPrefill\(item\);/);
  const p = E.familySendPreview(PLACE);
  assert.deepEqual([p.sendable, p.reason, p.personalDataIncluded], [false, 'NO_FAMILY_CONNECTION', false]);
  assert.match(VIEW, /아직 연결된 가족이 없어서 보내지 않았어요/);
  assert.doesNotMatch(VIEW + CONTRACTS, /familyRemote|family-remote|\/api\/ongil\/family|sendToFamily|shareWith/);
});

test('EV2-18 privacy: nothing about browsing is kept, sent or put in an address', () => {
  for (const f of ['enjoy-view.js', 'enjoy-contracts.js']) {
    const src = strip(read('js', f));
    assert.doesNotMatch(src, /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket/, `${f} does not call the network itself`);
    assert.doesNotMatch(src, /console\.(log|info|warn|error|debug)/, f);
    assert.doesNotMatch(src, /document\.cookie|navigator\.clipboard/, f);
  }
  /* the only address the screen writes is the category */
  assert.deepEqual([...new Set(VIEW.match(/replaceState\([^)]*\)/g))], ["replaceState(null, '', hash)"]);
  assert.match(VIEW, /const hash = category \? `#enjoy\/\$\{category\.toLowerCase\(\)\}` : '#enjoy';/);
  /* the app hands 즐길거리 the stores it needs and nothing else; analytics gets the opened item only */
  const call = APP.slice(APP.indexOf('enjoyView = createEnjoyView({'), APP.indexOf('search.registerProvider(createEnjoyProvider'));
  assert.deepEqual((call.match(/^ {2}([a-zA-Z]+)[,:]/gm) || []).map((s) => s.trim().replace(/[,:]$/, '')), ['host', 'doc', 'saved', 'profile', 'schedule', 'tasks', 'posts', 'sources', 'onOpen', 'onReview']);
  assert.doesNotMatch(call, /checkIn|medication|symptoms|healthNotes|journal|expenses|familyConnect|familySharing/);
  /* the global search still sees only what was loaded on this screen */
  assert.match(APP, /search\.registerProvider\(createEnjoyProvider\(\(\) => enjoyView\.items\(\)\)\);/);
});

test('EV2-19 server boundary: the same three sources through the same route — no new API, provider or parameter', () => {
  const ds = strip(read('js', 'data-source.js'));
  assert.equal((ds.match(/const DATA_PATH = '\/api\/livon\/data';/g) || []).length, 1);
  assert.deepEqual([...new Set(ds.match(/kr-[a-z-]+/g))].sort(), ['kr-kakao-place', 'kr-lifelong-class', 'kr-tourapi']);
  assert.deepEqual([...new Set(SEARCH_TARGETS.map((t) => t.source))].sort(), ['lifelong', 'place', 'tour']);
  assert.deepEqual(SEARCH_TARGETS.filter((t) => t.source === 'tour').map((t) => t.params.contentType), ['12', '14', '28'], 'no festival / event type is asked for');
  assert.doesNotMatch(VIEW + CONTRACTS, /\/api\/|vercel|newon-api/);
});

test('EV2-20 accessibility: labelled groups and buttons, announced results, focus that comes back', () => {
  assert.match(VIEW, /role: 'group', 'aria-label': '내 관심사에서 찾아보기'/);
  assert.match(VIEW, /'aria-label': `내 관심사 ‘\$\{sc\.interestLabel\}’에서 \$\{sc\.label\} 찾아보기`/);
  assert.match(VIEW, /cards\.search\.focusTitle\(\);\s*cards\.search\.say\(/);
  assert.match(VIEW, /'aria-label': '저장한 활동'/);
  assert.match(VIEW, /'aria-haspopup': 'dialog',\s*'aria-label': `저장한 ‘\$\{s\.title\}’ 자세히 보기`/);
  assert.match(VIEW, /'aria-label': `‘\$\{s\.title\}’ 저장 취소`/);
  assert.match(VIEW, /'aria-label': '자료 연결 상태'/);
  assert.match(VIEW, /'aria-label': '추가될 할 일'/);
  /* the dialog keeps Tab inside, closes on Escape natively, and focus returns to the row that opened it —
     or to the card when that row is gone */
  assert.match(VIEW, /if \(event\.key !== 'Tab'\) return;/);
  assert.match(VIEW, /openerSelector \? host\.querySelector\(openerSelector\)/);
  assert.match(VIEW, /else if \(openerSelector && openerSelector\.includes\('saved-open'\)\) cards\.saved\.focusTitle\(\);/);
  assert.match(VIEW, /card\.say\(ok \? `‘\$\{s\.title\}’ 저장을 취소했습니다\.` : '저장을 취소하지 못했습니다\.'\);\s*card\.focusTitle\(\);/);
  /* only real controls act; state is said in words, not by colour */
  assert.doesNotMatch(VIEW, /el\('(div|span|li|p)',\s*\{[^}]*onclick/);
  assert.doesNotMatch(VIEW, /tabindex: ?'?[1-9]|onmouseover|ondblclick|\.style\.|innerHTML/);
  for (const state of ['아직 찾아보지 않았어요.', '이번 방문에서 자료를 받아왔어요.', '응답은 왔지만 찾은 것이 없었어요.']) assert.ok(read('js', 'enjoy-contracts.js').includes(state), state);
});

test('EV2-21 responsive: built from existing ONGIL parts only — no stylesheet change, so the hardening rules apply as they are', () => {
  const life = read('styles', 'ongil-life.css');
  assert.ok(life.includes('[RH1] Responsive + accessibility hardening'));
  assert.match(life, /\.og-home-item__actions \{ flex-wrap: wrap; max-width: 100%; \}/, 'row buttons (자세히 · 저장 취소) wrap');
  assert.match(life, /\.og-field \{ grid-template-columns: minmax\(0, 1fr\); \}/, 'the date field in the dialog cannot outgrow it');
  assert.match(INDEX, /ongil-life\.css\?v=20261007r14/, 'no stylesheet moved');
  const css = fs.readdirSync(path.join(ROOT, 'ongil-start/styles')).map((f) => read('styles', f)).join('\n');
  const mine = VIEW.slice(VIEW.indexOf('function renderToday'), VIEW.indexOf('function renderCategories')) + VIEW.slice(VIEW.indexOf('function summaryList'), VIEW.indexOf('function refreshSummary')) + VIEW.slice(VIEW.indexOf('function renderSaved'), VIEW.indexOf('function show('));
  const classes = new Set((mine.match(/class: '([^']+)'/g) || []).flatMap((m) => m.slice(8, -1).split(' ')));
  assert.ok(classes.size >= 10);
  for (const c of classes) if (c !== 'og-enjoy-today') assert.ok(css.includes(`.${c}`), `class ${c} is an existing ONGIL class`);
});

test('EV2-22 cache: the entry and the two changed modules moved on; nothing else did', () => {
  assert.match(INDEX, /<script type="module" src="\/ongil-start\/js\/app\.js\?v=20261007e16"><\/script>/);
  assert.equal((INDEX.match(/20261006m15/g) || []).length, 0);
  assert.match(INDEX, /"\/ongil-start\/js\/enjoy-view\.js": "\/ongil-start\/js\/enjoy-view\.js\?v=[0-9a-f]{12}"/);
  assert.match(INDEX, /"\/ongil-start\/js\/enjoy-contracts\.js": "\/ongil-start\/js\/enjoy-contracts\.js\?v=[0-9a-f]{12}"/);
  assert.equal(fs.readdirSync(path.join(ROOT, 'ongil-start/js')).filter((f) => f.endsWith('.js')).length, 82, 'no new module');
});

test('EV2-23 the document says what is real: what works, what does not answer today, and what was left out', () => {
  const doc = fs.readFileSync(path.join(ROOT, 'docs/ongil/ONGIL_ENJOY_V2.md'), 'utf8');
  for (const word of ['오늘 뭐 하지?', '내 관심사', '저장한 활동', '할 일로 추가', '내가 쓴 관련 글', 'TourAPI', 'Kakao', '평생학습', 'Phase B', '320', '1440', '200%']) assert.ok(doc.includes(word), word);
  assert.match(doc, /알려진 한계/);
  assert.match(doc, /확인하지 못한 것/);
  assert.doesNotMatch(doc, /LIVE VERIFIED|PRODUCTION LIVE = YES/);
});
