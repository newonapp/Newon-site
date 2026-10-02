// ONGIL Phase 2A — Home V1 screen: modules, hierarchy, routing of shortcuts, accessibility, honesty of copy.
// Static checks over the Home sources (no browser, no dependencies):  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AREAS } from '../../ongil-start/js/areas.js';
import { resolveView } from '../../ongil-start/js/router.js';
import { HOME_LEVELS } from '../../ongil-start/js/home-view.js';
import { ENJOY_CATEGORIES, QUICK_ACTIONS } from '../../ongil-start/js/home-explore.js';
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
const home = AREAS.find((a) => a.id === 'home');

// Phase 2C: Home gained two modules — 오늘 할 일 (tasks) and 오늘 루틴 (routines), showing My Life's own records.
// The list is now eleven; every other check of this test is unchanged.
test('OG-HM-1 all eleven Home modules exist and are marked available', () => {
  assert.deepEqual(home.modules.map((m) => m.id), ['greeting', 'check-in', 'schedule', 'tasks', 'routines', 'medication', 'life-check', 'family-update', 'today', 'nearby', 'quick-actions']);
  assert.ok(home.modules.every((m) => m.available === true));
  assert.match(INDEX, /<p class="og-greeting" data-og-greeting data-og-slot="home\.greeting">/);
  const slots = HOME_LEVELS.flatMap((r) => r.slots);
  assert.deepEqual(slots, home.modules.map((m) => m.id).filter((id) => id !== 'greeting'));
  for (const slot of slots) assert.match(ALL, new RegExp(`createCard\\(\\{ slot: '${slot}'`), slot);
  assert.match(INDEX, /<section class="og-band" data-og-modules="home" aria-labelledby="og-home-section-title">/);
  assert.match(SRC['home-view.js'], /id: 'og-home-section-title'/);
  assert.match(SRC['home-view.js'], /'data-og-extra': 'home'/);
});

// Phase 2C: a fifth row (오늘 할 일 · 오늘 루틴) sits between today's cards and the care cards, and rows are named.
// Still four visual levels, two modules a row, most important first — and the row names are now asserted too.
test('OG-HM-2 Home has a hierarchy: four levels, two modules each, most important first', () => {
  assert.deepEqual(HOME_LEVELS.map((r) => [r.level, [...r.slots]]), [[1, ['check-in', 'schedule']], [2, ['tasks', 'routines']], [2, ['medication', 'life-check']], [3, ['family-update', 'today']], [4, ['nearby', 'quick-actions']]]);
  assert.deepEqual(HOME_LEVELS.map((r) => r.group), ['today', 'plan', 'care', 'connection', 'discovery']);
  assert.ok(HOME_LEVELS.every((r, i) => i === 0 || r.level >= HOME_LEVELS[i - 1].level), 'weight never rises further down the page');
  const level = (slot) => Number(new RegExp(`createCard\\(\\{ slot: '${slot}', title: '[^']+', level: (\\d)`).exec(ALL)[1]);
  for (const row of HOME_LEVELS) for (const slot of row.slots) assert.equal(level(slot), row.level, slot);
  for (const n of [1, 2, 3, 4]) assert.match(CSS, new RegExp(`\\.og-home-card--l${n} \\{`));
  assert.match(CSS, /\.og-home-card--l1 \.og-home-card__title \{ font-size: 1\.75rem; \}/);
});

test('OG-HM-3 hero greeting: time of day and date, nickname optional, poster can be added later', () => {
  assert.match(SRC['home-view.js'], /greeting\(hour, profile\.getProfile\(\)\.nickname\)/);
  assert.match(SRC['home-view.js'], /formatDay\(now\(\)\)/);
  assert.match(read('js', 'film.js'), /getAttribute\('poster'\)/);
  assert.equal(/poster="/.test(INDEX), false, 'no poster asset exists yet, so none is referenced');
  assert.equal((INDEX.match(/<video/g) || []).length, 7);
});

test('OG-HM-4 family card shows the real state: not connected, nothing sent, link to the family view', () => {
  const src = SRC['home-explore.js'];
  assert.match(src, /아직 연결된 가족이 없어요\./);
  assert.match(src, /'data-og-family-status': state\.status/);
  assert.match(src, /연결하기 전에는 어떤 내용도 가족에게 전달되지 않습니다/);
  assert.match(src, /href: '#family', text: '가족 화면 보기'/);
  for (const fake of ['딸', '아들', '손주', '며느리', '사위', '님이 보냈', '새 메시지', '읽지 않은 메시지', '가족 소식 1']) assert.equal(ALL.includes(fake), false, fake);
});

test('OG-HM-5 "오늘 뭐 하지?" offers the five categories and leads to 즐길거리 — no invented programme', () => {
  assert.deepEqual([...ENJOY_CATEGORIES], ['취미', '배움', '운동', '문화', '나들이']);
  assert.match(SRC['home-explore.js'], /class: 'og-linkchip', href: '#enjoy'/);
  assert.match(SRC['home-explore.js'], /createEnjoyCard\(\{ recommend = null \} = \{\}\)/);
  assert.match(SRC['home-view.js'], /today: createEnjoyCard\(\)/, 'no recommendation source is connected in Phase 2A');
  assert.match(SRC['home-explore.js'], /추천할 프로그램은 아직 준비 중입니다/);
  for (const fake of ['교실 모집', '특강', '축제', '무료 체험', '선착순', '오늘의 추천:', '인기 프로그램']) assert.equal(ALL.includes(fake), false, fake);
});

test('OG-HM-6 nearby: asked only on a button press; unavailable and empty are plain states, not errors', () => {
  const src = SRC['home-explore.js'];
  assert.match(src, /onclick: async \(\) => \{[\s\S]*?source\.load\(\{ region \}\)/);
  assert.equal((src.match(/source\.load\(/g) || []).length, 1, 'never loaded on render');
  assert.match(src, /setRegionState\(zone, 'loading'/);
  assert.match(src, /setRegionState\(zone, 'empty', '지금 모집 중인 강좌를 찾지 못했어요\.'\)/);
  assert.match(src, /setRegionState\(zone, 'empty', '주변 정보는 아직 연결되지 않았어요\./);
  assert.equal(/setRegionState\(zone, 'error'/.test(src), false);
  assert.match(src, /사는 지역을 정하면/);
  assert.match(src, /href: '#account', text: '내 정보에서 지역 정하기'/);
  assert.match(src, /지역 이름만 보내며, 버튼을 눌렀을 때만 찾습니다/);
  assert.match(src, /`자료: \$\{result\.attribution\}`/);
  assert.match(src, /rel: 'noopener noreferrer'/);
  assert.match(read('js', 'app.js'), /source: nearbySource/);
});

// Phase 2C: "할 일 추가" became a real action (it opens My Life's task form) and "가족 보기" left the shortcuts —
// the 가족 card right above already links to the family view. Still six shortcuts; each action must be wired.
test('OG-HM-7 quick actions: three real actions, three real routes, no assistant', () => {
  assert.deepEqual(QUICK_ACTIONS.map((a) => [a.id, a.label, a.kind]), [['add-event', '일정 추가', 'action'], ['add-task', '할 일 추가', 'action'], ['add-medication', '약 추가', 'action'], ['life', '내 생활 보기', 'route'], ['enjoy', '즐길거리 찾기', 'route'], ['care', '돌봄·서비스 찾기', 'route']]);
  for (const a of QUICK_ACTIONS.filter((x) => x.kind === 'action')) assert.ok(SRC['home-view.js'].includes(`'${a.id}': () =>`), `${a.id} is wired`);
  assert.match(SRC['home-view.js'], /'add-task': \(\) => onAddTask && onAddTask\(\)/);
  assert.match(read('js', 'app.js'), /pendingLifeAdd = 'tasks';\s*win\.location\.hash = lifeHash\('tasks'\);/);
  for (const a of QUICK_ACTIONS.filter((x) => x.kind === 'route')) assert.equal(resolveView(a.href), a.id);
  assert.match(SRC['home-view.js'], /'add-event': \(\) => reveal\(scheduleCard\.card, scheduleCard\.openAdd\)/);
  assert.match(SRC['home-view.js'], /'add-medication': \(\) => reveal\(medicationCard\.card, medicationCard\.openAdd\)/);
  assert.equal(/AI|assistant|물어보기/.test(QUICK_ACTIONS.map((a) => a.label + a.id).join(' ')), false);
  assert.equal(/ONGIL AI|AI에게/.test(ALL + INDEX), false);
});

test('OG-HM-8 accessibility: named groups, labelled fields, status lines, confirm before delete, no colour-only state', () => {
  assert.match(SRC['home-ui.js'], /role: 'status', 'aria-live': 'polite'/);
  assert.match(SRC['home-ui.js'], /'aria-labelledby': titleId/);
  assert.match(SRC['home-ui.js'], /el\('label', \{ class: 'og-field__label', for: id \}/);
  assert.match(SRC['home-ui.js'], /'aria-pressed': pressed \? 'true' : 'false'/);
  assert.match(SRC['home-ui.js'], /text: pressed \? '✓' : ''/, 'the chosen option carries a tick, not only a colour');
  for (const label of ['오늘의 안부 고르기', '오늘 식사 횟수', '오늘 마신 물', '오늘 걷기·운동', '물 한 잔 빼기', '물 한 잔 더하기', '즐길거리 종류', '빠른 실행']) assert.ok(ALL.includes(`'${label}'`), label);
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
  assert.equal((app.match(/search\.registerProvider\(/g) || []).length, 2, 'no provider was added for schedule, medication or check-in');
  const hit = await search.query('오늘 일정');
  assert.deepEqual([hit.results[0].id, hit.results[0].href], ['home.schedule', '#ongil-home']);
});
