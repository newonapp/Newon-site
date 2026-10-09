// ONGIL Phase 2A — Home V1 screen: modules, hierarchy, routing of shortcuts, accessibility, honesty of copy.
// Static checks over the Home sources (no browser, no dependencies):  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AREAS } from '../../ongil-start/js/areas.js';
import { resolveView } from '../../ongil-start/js/router.js';
/* Home V2: HOME_LEVELS → HOME_SECTIONS; 빠른 실행 (QUICK_ACTIONS) was removed */
import { HOME_SECTIONS } from '../../ongil-start/js/home-view.js';
import { ENJOY_CATEGORIES } from '../../ongil-start/js/home-explore.js';
import { createSearch, createAreaProvider, createSavedProvider } from '../../ongil-start/js/search.js';
import { createStorage, createMemoryBackend } from '../../ongil-start/js/storage.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const INDEX = read('index.html');
const HOME_FILES = ['home-view.js', 'home-today.js', 'home-explore.js', 'home-list.js', 'home-ui.js'];
const SRC = Object.fromEntries(HOME_FILES.map((f) => [f, read('js', f)]));
const ALL = HOME_FILES.map((f) => SRC[f]).join('\n');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const CODE = strip(ALL);
const CSS = read('styles', 'ongil-home.css');
/* Home V2: the section frame and the smaller mobile hero are in their own stylesheet (ongil-home.css is unchanged) */
const CSS2 = read('styles', 'ongil-home-v2.css');
const home = AREAS.find((a) => a.id === 'home');

// Home V2 — WHY: Home became nine sections in the approved order (오늘 · 오늘 할 것 · 건강·안부 · 가족 · 즐길거리 ·
// 돌봄·서비스 · 커뮤니티 · ONGIL 도우미 · 서비스 안내). BEFORE eleven modules in five rows of two (… nearby · quick-actions)
// · AFTER greeting + eight sections whose cards are listed in HOME_SECTIONS; every slot still has its card.
test('OG-HM-1 all Home V2 sections exist and are marked available', () => {
  assert.deepEqual(home.modules.map((m) => m.id), ['greeting', 'plan', 'health', 'family', 'enjoy', 'care', 'community', 'helper', 'guide']);
  assert.ok(home.modules.every((m) => m.available === true));
  assert.match(INDEX, /<p class="og-greeting" data-og-greeting data-og-slot="home\.greeting">/);
  assert.deepEqual(HOME_SECTIONS.map((s) => s.id), home.modules.map((m) => m.id).filter((id) => id !== 'greeting'));
  for (const slot of HOME_SECTIONS.flatMap((s) => s.cards)) assert.ok(new RegExp(`slot: '${slot}'|slot: g\\.slot`).test(ALL), slot);
  assert.deepEqual(HOME_SECTIONS.flatMap((s) => s.cards).filter((c) => c.startsWith('plan-')), ['plan-events', 'plan-tasks', 'plan-routines', 'plan-overdue', 'plan-upcoming']);
  assert.match(INDEX, /<section class="og-band" data-og-modules="home" aria-labelledby="og-home-section-title">/);
  assert.match(SRC['home-view.js'], /id: 'og-home-section-title'/);
  assert.match(SRC['home-view.js'], /'data-og-extra': 'home'/);
});

// Home V2 — WHY: the hierarchy is now the section order itself. BEFORE four visual levels in rows of two · AFTER the two
// grouped sections (오늘 할 것, 건강·안부) have an h3 and h4 cards, the single-card sections follow two to a row in order.
test('OG-HM-2 Home has a hierarchy: the day first, then the rest of ONGIL', () => {
  assert.deepEqual(HOME_SECTIONS.map((s) => s.title), ['오늘 할 것', '건강·안부', '가족', '즐길거리', '돌봄·서비스', '커뮤니티', 'ONGIL 도우미', '서비스 안내']);
  assert.match(SRC['home-view.js'], /const GROUPED = Object\.freeze\(\['plan', 'health'\]\);/);
  assert.match(SRC['home-view.js'], /el\('h3', \{ class: 'og-home-section__title', id: titleId, tabindex: '-1', text: s\.title \}\)/);
  for (const n of [1, 2, 3, 4]) assert.match(CSS, new RegExp(`\\.og-home-card--l${n} \\{`));
  assert.match(CSS2, /\.og-home-section__title \{/);
  assert.match(CSS2, /@media \(max-width: 860px\) \{\n\s+\.og-home-row--sections \{ grid-template-columns: 1fr; \}/);
});

test('OG-HM-3 hero greeting: time of day and date, nickname optional, poster can be added later', () => {
  /* Home V2 — WHY: the nickname is read inside a guard so a damaged profile cannot stop Home. BEFORE greeting(hour, profile.getProfile().nickname) · AFTER the same value through a try */
  assert.match(SRC['home-view.js'], /nickname = profile\.getProfile\(\)\.nickname;/);
  assert.match(SRC['home-view.js'], /greeting\(hour, nickname\)/);
  assert.match(SRC['home-view.js'], /formatDay\(now\(\)\)/);
  assert.match(read('js', 'film.js'), /getAttribute\('poster'\)/);
  assert.equal(/poster="/.test(INDEX), false, 'no poster asset exists yet, so none is referenced');
  assert.equal((INDEX.match(/<video/g) || []).length, 8); // Completion V2: + the Store film
});

// Home V2 — WHY: the 가족 card now says what really works (connecting on this device) and what does not (other devices),
// instead of "준비 중". BEFORE '아직 연결된 가족이 없어요.' + the unavailable status · AFTER connection facts only.
test('OG-HM-4 family card shows the real state: this device only, nothing shared automatically, link to the family view', () => {
  const src = SRC['home-explore.js'];
  assert.match(src, /아직 연결한 가족이 없어요\./);
  assert.match(src, /이 기기에서 연결한 가족 \$\{connected\}명/);
  assert.match(src, /지금은 이 기기 안에서만 가족과 연결돼요/);
  assert.match(src, /건강·안부·위치·연락처는 자동으로 공유되지 않아요/);
  assert.match(src, /link\('#family', connected \? '가족 화면 보기' : '가족 화면에서 연결 살펴보기'\)/);
  for (const fake of ['딸', '아들', '손주', '며느리', '사위', '님이 보냈', '새 메시지', '읽지 않은 메시지', '가족 소식 1']) assert.equal(ALL.includes(fake), false, fake);
});

// Home V2 — WHY: 오늘 뭐 하지? became the 즐길거리 section: the six categories, what the person saved (only when something
// was saved) and what was found this visit. BEFORE createEnjoyCard({ loaded }) · AFTER createEnjoyCard({ loaded, saved, profile, source }).
test('OG-HM-5 즐길거리 offers the six categories and leads to 즐길거리 — no invented programme', () => {
  assert.deepEqual([...ENJOY_CATEGORIES], ['취미', '배움', '운동', '문화', '나들이', '여행']);
  assert.match(SRC['home-explore.js'], /class: 'og-linkchip', href: `#enjoy\/\$\{ENJOY_LINKS\[name\]\}`/);
  assert.match(SRC['home-explore.js'], /export function createEnjoyCard\(\{ loaded = null, saved = null, profile = null, source = null \} = \{\}\)/);
  assert.match(SRC['home-view.js'], /createEnjoyCard\(\{ loaded: enjoyLoaded, saved, profile, source \}\)/, 'only what was loaded or saved; no recommendation source');
  assert.match(SRC['home-explore.js'], /추천이 아니라 이번에 즐길거리 화면에서 찾아 본 것 가운데 몇 가지예요/);
  assert.match(SRC['home-explore.js'], /mine\.total\n\s+\? \[/, 'saved activities only when something was saved');
  for (const fake of ['교실 모집', '특강', '축제', '무료 체험', '선착순', '오늘의 추천:', '인기 프로그램']) assert.equal(ALL.includes(fake), false, fake);
});

// Home V2 — WHY: 내 주변 joined the 즐길거리 card. BEFORE its own card · AFTER a part of 즐길거리 with the same button-only
// rule; an unusable source now points to 즐길거리 ('주변 강좌 정보는 지금 쓸 수 없어요').
test('OG-HM-6 nearby: asked only on a button press; unavailable and empty are plain states, not errors', () => {
  const src = SRC['home-explore.js'];
  assert.match(src, /onclick: async \(\) => \{[\s\S]*?source\.load\(\{ region \}\)/);
  assert.equal((src.match(/source\.load\(/g) || []).length, 1, 'never loaded on render');
  assert.match(src, /setRegionState\(zone, 'loading'/);
  assert.match(src, /setRegionState\(zone, 'empty', '지금 모집 중인 강좌를 찾지 못했어요\.'\)/);
  assert.match(src, /setRegionState\(zone, 'empty', '주변 강좌 정보는 지금 쓸 수 없어요\./);
  assert.equal(/setRegionState\(zone, 'error'/.test(src), false);
  assert.match(src, /사는 지역을 정하면/);
  assert.match(src, /link\('#account', '내 정보에서 지역 정하기'\)/);
  assert.match(src, /지역 이름만 보내며, 버튼을 눌렀을 때만 찾습니다/);
  assert.match(src, /`자료: \$\{result\.attribution\}`/);
  assert.match(src, /rel: 'noopener noreferrer'/);
  assert.match(read('js', 'app.js'), /source: nearbySource/);
});

// Home V2 — WHY: 빠른 실행 repeated the menu and the cards, so it was removed (approved decision 3). The three add actions sit
// on their own cards and open the one form in 내 생활. BEFORE six shortcuts and Home's own event / medication forms ·
// AFTER no shortcut section, onAdd(section) → life.openAdd, and the helper is the rule-based ONGIL 도우미 (never "AI").
test('OG-HM-7 add actions open My Life\'s own forms; no shortcut section; the helper is not called an AI', () => {
  assert.equal(/QUICK_ACTIONS|createQuickActionsCard|빠른 실행/.test(ALL), false);
  assert.match(SRC['home-today.js'], /add\('calendar', '일정 추가'\)/);
  assert.match(SRC['home-today.js'], /add\('tasks', '할 일 추가'\)/);
  assert.match(SRC['home-today.js'], /'data-og-home-add': 'medication', text: '약 추가', onclick: \(\) => onAdd && onAdd\('medication'\)/);
  assert.match(read('js', 'app.js'), /pendingLifeAdd = section;\s*win\.location\.hash = lifeHash\(section\);/);
  assert.equal(/schedule\.add\(|schedule\.remove\(|medication\.add\(|medication\.update\(|medication\.remove\(/.test(CODE), false, 'Home never makes, edits or deletes an event or a medication');
  assert.equal(/ONGIL AI|AI에게|AI 비서|인공지능 상담/.test(ALL + INDEX), false);
  assert.match(SRC['home-explore.js'], /자유로운 대화를 하거나 글을 지어내는 AI는 아니에요/);
});

test('OG-HM-8 accessibility: named groups, labelled fields, status lines, confirm before delete, no colour-only state', () => {
  assert.match(SRC['home-ui.js'], /role: 'status', 'aria-live': 'polite'/);
  assert.match(SRC['home-ui.js'], /'aria-labelledby': titleId/);
  assert.match(SRC['home-ui.js'], /el\('label', \{ class: 'og-field__label', for: id \}/);
  assert.match(SRC['home-ui.js'], /'aria-pressed': pressed \? 'true' : 'false'/);
  assert.match(SRC['home-ui.js'], /text: pressed \? '✓' : ''/, 'the chosen option carries a tick, not only a colour');
  /* Home V2: BEFORE … '빠른 실행' · AFTER '오늘 먹을 약' and '돌봄·서비스 종류' (빠른 실행 was removed) */
  for (const label of ['오늘의 안부 고르기', '오늘 식사 횟수', '오늘 마신 물', '오늘 걷기·운동', '물 한 잔 빼기', '물 한 잔 더하기', '즐길거리 종류', '오늘 먹을 약', '돌봄·서비스 종류']) assert.ok(ALL.includes(`'${label}'`), label);
  const list = SRC['home-list.js'];
  assert.match(list, /role: 'alert'/);
  assert.match(list, /setAttribute\('aria-invalid', 'true'\)/);
  assert.match(list, /el\('label', \{ for: checkId/);
  assert.match(list, /'aria-label': `‘\$\{d\.title\}’ 지우기`/);
  assert.match(list, /mode\.type === 'delete' && mode\.id === item\.id/);
  assert.match(list, /지울까요\? 되돌릴 수 없습니다\./);
  assert.ok(list.indexOf("text: '취소', onclick: () => setMode({ type: 'idle', id: null }, `delete:") < list.indexOf("config.onRemove(item.id)"), 'cancel comes before the destructive button');
  assert.equal((list.match(/config\.onRemove\(/g) || []).length, 1, 'removal happens only from the confirmation');
  assert.match(list, /done \? el\('span', \{ class: 'og-home-item__done'/, 'done items say so in words');
  for (const sel of ['.og-pick', '.og-linkchip', '.og-quick__item']) assert.match(CSS, new RegExp(`\\${sel} \\{[^}]*min-height: 3(\\.5)?rem`), sel);
  assert.match(CSS, /\.og-stepper__btn \{ width: 3rem; height: 3rem;/);
  assert.match(CSS, /@media \(max-width: 860px\) \{\s*\.og-home-row \{ grid-template-columns: 1fr; \}/);
});

test('OG-HM-9 no false safety or health claim, no score, no advice', () => {
  for (const phrase of ['안전합니다', '안전해요', '이상이 없습니다', '이상 없음', '건강합니다', '건강해요', '건강 점수', '점입니다', '정상입니다', '안심하세요', '가족에게 알렸', '알림을 보냈', '신고했습니다', '연결되었습니다', '권장량', '복용량을', '하루 8잔', '목표 달성']) {
    assert.equal(ALL.includes(phrase), false, phrase);
  }
  assert.match(SRC['home-today.js'], /ONGIL은 이 선택을 다른 사람에게 알리지 않습니다\./);
  assert.match(SRC['home-today.js'], /위급할 때는 119에 직접 전화해 주세요\./);
  assert.match(SRC['home-today.js'], /ONGIL은 복용량이나 약에 대해 조언하지 않습니다\./);
  assert.match(SRC['home-today.js'], /점수를 매기거나 평가하지 않습니다\./);
  assert.equal(/tel:|sms:|mailto:|sendBeacon|notifications\.add\(/.test(CODE), false, 'choosing "help" contacts no one');
  assert.equal(/\bscore|\bgrade\b|\bbmi\b|\bdos(e|age)\b|interaction/i.test(CODE), false);
});

test('OG-HM-10 Home code keeps the Phase 1 rules: stores only, no markup strings, no network', () => {
  assert.equal(/localStorage|sessionStorage|storage\.(get|set)\(/.test(CODE), false, 'cards use the stores, never storage directly');
  assert.equal(/innerHTML|insertAdjacentHTML|outerHTML/.test(CODE), false);
  assert.equal(/\bfetch\(|fetcher\(|XMLHttpRequest/.test(CODE), false);
  for (const f of HOME_FILES) for (const m of SRC[f].matchAll(/from '([^']+)'/g)) assert.ok(fs.existsSync(path.join(ROOT, 'ongil-start/js', m[1])), `${f} → ${m[1]}`);
  assert.match(INDEX, /<link rel="stylesheet" href="\/ongil-start\/styles\/ongil-home\.css\?v=[0-9a-z]+" \/>/);
  assert.equal(/lv-|livon|--nls-/i.test(CSS.replace(/\/\*[\s\S]*?\*\//g, '')), false);
  assert.equal(/#[0-9a-f]{3,6}\b/i.test(CSS.replace(/\/\*[\s\S]*?\*\//g, '').replace('#2b2b2b', '')), false, 'colours come from tokens (one hover shade aside)');
});

test('OG-HM-11 private Home data is not searchable: only menus and saved items are', async () => {
  const storage = createStorage({ backend: createMemoryBackend() });
  const saved = createSavedStore(storage);
  createScheduleStore(storage).add({ title: '비밀스러운병원예약' });
  createMedicationStore(storage).add({ name: '비밀스러운약이름' });
  createCheckInStore(storage).set('help');
  const search = createSearch();
  search.registerProvider(createAreaProvider(AREAS));
  search.registerProvider(createSavedProvider(saved));
  for (const q of ['비밀스러운병원예약', '비밀스러운약이름', '도움이 필요해요']) assert.deepEqual((await search.query(q)).results, [], q);
  assert.deepEqual(search.providerIds(), ['areas', 'saved']);
  const app = read('js', 'app.js');
  // Phase 7: the fifth provider is public product information loaded on the 스토어 screen (createStoreProvider).
  assert.equal((app.match(/search\.registerProvider\(/g) || []).length, 5, 'no provider was added for schedule, medication or check-in (the third to fifth are public care, 즐길거리 and product content)');
  assert.match(app, /search\.registerProvider\(createStoreProvider\(\(\) => storeView\.items\(\)\)\);/);
  // Phase 5: a fourth provider, 즐길거리, searches only PUBLIC enjoy items loaded on that screen (never a personal record).
  assert.match(app, /search\.registerProvider\(createEnjoyProvider\(\(\) => enjoyView\.items\(\)\)\);/);
  // Phase 4: a third provider, 돌봄·서비스, searches only PUBLIC care items loaded on that screen (never a personal record).
  assert.match(app, /search\.registerProvider\(createCareProvider\(\(\) => care\.items\(\)\)\);/);
  const hit = await search.query('오늘 일정');
  /* Home V2 — WHY: 오늘 일정 is part of the 오늘 할 것 section. BEFORE home.schedule · AFTER home.plan (still on Home) */
  assert.deepEqual([hit.results[0].id, hit.results[0].href], ['home.plan', '#ongil-home']);
});
