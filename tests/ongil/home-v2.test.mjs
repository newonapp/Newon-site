// ONGIL Home V2 — the senior's day first (오늘 할 것 · 건강·안부), then 가족 · 즐길거리 · 돌봄·서비스 · 커뮤니티 · ONGIL 도우미 ·
// 서비스 안내. Data checks run everywhere; the browser checks run when a local Chromium exists (else they are skipped).
//   node --test tests/ongil/home-v2.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS } from '../../ongil-start/js/storage.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createDailyLifeStore } from '../../ongil-start/js/daily-life.js';
import { createSleepStore } from '../../ongil-start/js/sleep.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createPostStore, createGroupStore, createMeetupStore } from '../../ongil-start/js/community.js';
import { createLocalFamilyRepository } from '../../ongil-start/js/family-repository.js';
import { createFamilyService } from '../../ongil-start/js/family-service.js';
import * as LT from '../../ongil-start/js/life-today.js';
import { HOME_SECTIONS, SECTION_ERROR_TEXT, buildHomeSummary } from '../../ongil-start/js/home-view.js';
import { PLAN_GROUPS, splitToday, UPCOMING_HOME_LINES } from '../../ongil-start/js/home-today.js';
import { FAMILY_LOCAL_TEXT, FAMILY_PRIVATE_TEXT, COMMUNITY_LOCAL_TEXT, HELPER_EXAMPLES, HELPER_TEXT, CARE_LINKS, ENJOY_CATEGORIES } from '../../ongil-start/js/home-explore.js';
import { SUGGESTIONS } from '../../ongil-start/js/assistant-tools.js';
import { CARE_SECTIONS } from '../../ongil-start/js/care-view.js';
import { COMMUNITY_SECTIONS } from '../../ongil-start/js/community-view.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { resolveView } from '../../ongil-start/js/router.js';
import { addDays } from '../../ongil-start/js/dates.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const code = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const HOME_FILES = ['home-view.js', 'home-today.js', 'home-explore.js'];
const JS = Object.fromEntries(['home-view.js', 'home-today.js', 'home-explore.js', 'app.js', 'life-view.js', 'life-plan.js', 'health-safety-view.js'].map((f) => [f, read(`ongil-start/js/${f}`)]));
const HOME = HOME_FILES.map((f) => JS[f]).join('\n');
const HOME_CODE = code(HOME);
const shown = (src) => [...code(src).matchAll(/'([^'\n]*[가-힣][^'\n]*)'|`([^`\n]*[가-힣][^`\n]*)`/g)].map((m) => m[1] || m[2]).join('\n');
const COPY = HOME_FILES.map((f) => shown(JS[f])).join('\n');
const INDEX = read('ongil-start/index.html');
const CSS2 = read('ongil-start/styles/ongil-home-v2.css');

const FORBIDDEN_SAFETY = /안전합니다|안전해요|안전을 확인했|안전 확인 완료|이상 없|정상입니다|정상이에요|보호자가 확인|확인 완료|위험 없|보호됩니다|무사해요|응급 상황입니다/;
const FORBIDDEN_FAKE = /전송되었습니다|전달되었습니다|보냈어요|예약 완료|예약되었습니다|접수되었습니다|신청 완료|참여 예정|가족이 확인했|공개되었습니다|댓글 \d|좋아요 \d|인기|추천 프로그램|맞춤 추천|오늘의 추천|순위|베스트/;
const FORBIDDEN_AI = /AI 비서|AI에게|인공지능 상담|무엇이든 물어보|대화형 AI입니다|ChatGPT|GPT|생성형 AI로/;

/* a fixed local day: 2026-10-09 (Friday) 09:00 — the tests never depend on the day they run */
const TODAY = '2026-10-09';
function world() {
  const backend = createMemoryBackend();
  let writes = 0;
  const counting = { ...backend, setItem: (k, v) => { writes += 1; backend.setItem(k, v); }, removeItem: (k) => { writes += 1; backend.removeItem(k); } };
  const clock = { t: new Date(2026, 9, 9, 9, 0, 0).getTime() };
  const now = () => (clock.t += 1000);
  const today = () => { const d = new Date(clock.t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const storage = createStorage({ backend: counting, now });
  let n = 0;
  const id = (p) => () => `${p}_h${String(++n).padStart(6, '0')}`;
  const opts = { now, today };
  const meetups = createMeetupStore(storage, { now });
  const w = {
    storage, now, writes: () => writes,
    tasks: createTaskStore(storage, { now, makeId: id('tk') }),
    routines: createRoutineStore(storage, { ...opts, makeId: id('rt') }),
    schedule: createScheduleStore(storage, { ...opts, makeId: id('ev') }),
    checkIn: createCheckInStore(storage, opts),
    medication: createMedicationStore(storage, { ...opts, makeId: id('md') }),
    dailyLife: createDailyLifeStore(storage, opts),
    sleep: createSleepStore(storage, opts),
    saved: createSavedStore(storage, { now }),
    posts: createPostStore(storage, { now }),
    groups: createGroupStore(storage, { now, meetups }),
  };
  w.family = createFamilyService({ repository: createLocalFamilyRepository(storage, { now }), sources: { checkIn: w.checkIn, schedule: w.schedule, medication: w.medication, dailyLife: w.dailyLife, sleep: w.sleep }, now });
  return w;
}
function filled() {
  const w = world();
  w.schedule.add({ title: '오늘 복지관', date: TODAY, time: '10:00' });
  w.schedule.add({ title: '오늘 정형외과', date: TODAY, time: '14:00', kind: 'MEDICAL_APPOINTMENT' });
  w.schedule.add({ title: '내일 장보기', date: addDays(TODAY, 1) });
  w.schedule.add({ title: '다음 주 모임', date: addDays(TODAY, 7) });
  w.tasks.add({ title: '오늘까지 전기요금', dueDate: TODAY });
  w.tasks.add({ title: '지난주 할 일', dueDate: addDays(TODAY, -3) });
  w.tasks.add({ title: '날짜 없는 할 일' });
  w.tasks.add({ title: '내일 할 일', dueDate: addDays(TODAY, 1) });
  w.routines.add({ title: '아침 스트레칭', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], time: '08:00' });
  return w;
}

/* ═════════════ 1. 구조 ═════════════ */

test('HV2-01 section order: 오늘 · 오늘 할 것 · 건강·안부 · 가족 · 즐길거리 · 돌봄·서비스 · 커뮤니티 · ONGIL 도우미 · 서비스 안내', () => {
  assert.deepEqual(HOME_SECTIONS.map((s) => s.id), ['plan', 'health', 'family', 'enjoy', 'care', 'community', 'helper', 'guide']);
  assert.deepEqual(HOME_SECTIONS.map((s) => s.title), ['오늘 할 것', '건강·안부', '가족', '즐길거리', '돌봄·서비스', '커뮤니티', 'ONGIL 도우미', '서비스 안내']);
  assert.match(JS['home-view.js'], /text: '오늘' \}\),\n\s+el\('p', \{ class: 'og-lead', 'data-og-home-date': true/, '1 · 오늘 comes first (h2, date, summary)');
  assert.deepEqual([...HOME_SECTIONS.find((s) => s.id === 'health').cards], ['check-in', 'medication', 'life-check'], 'decision 1: 식사·물·운동 in 건강·안부');
  assert.deepEqual(AREAS.find((a) => a.id === 'home').modules.map((m) => m.id), ['greeting', ...HOME_SECTIONS.map((s) => s.id)]);
  assert.equal(/quick-actions|QUICK_ACTIONS|빠른 실행|slot: 'nearby'|createNearbyCard/.test(HOME_CODE), false, 'decisions 3 and 4: no shortcut section, no separate 내 주변 card');
});

/* ═════════════ 2. 오늘 할 것 = My Life's buildToday ═════════════ */

test('HV2-02 Today consistency: the four lists are one buildToday result — the same records and numbers as 내 생활 › 오늘 할 것', () => {
  const w = filled();
  const t = LT.buildToday(w, w.now);
  const g = splitToday(t);
  assert.deepEqual(g.events.map((i) => i.title), ['오늘 복지관', '오늘 정형외과']);
  assert.deepEqual(g.tasks.map((i) => i.title), ['오늘까지 전기요금']);
  assert.deepEqual(g.routines.map((i) => i.title), ['아침 스트레칭']);
  assert.deepEqual(g.overdue.map((i) => i.title), ['지난주 할 일']);
  /* 내 생활 › 요약 › 오늘 할 것 lists t.items + t.overdue: Home shows exactly those, nothing more, nothing less */
  const mine = [...t.items, ...t.overdue].map((i) => i.key).sort();
  const home = [...g.events, ...g.tasks, ...g.routines, ...g.overdue].map((i) => i.key).sort();
  assert.deepEqual(home, mine);
  const all = [...g.events, ...g.tasks, ...g.routines, ...g.overdue].map((i) => i.title).join(' ');
  for (const later of ['내일 장보기', '다음 주 모임', '날짜 없는 할 일', '내일 할 일']) assert.equal(all.includes(later), false, `${later} is not today`);
  const s = buildHomeSummary(w, w.now);
  assert.deepEqual([s.events.total, s.tasks.total, s.routines.total], [g.events.length, g.tasks.length, g.routines.length], 'the summary counts agree');
  assert.deepEqual(PLAN_GROUPS.map((p) => p.title), ['오늘 일정', '오늘 할 일', '오늘 루틴', '기한 지난 할 일']);
});

test('HV2-03 Today marks: a mark on Home is the store\'s own call, and 내 생활 sees it at once (no copy)', () => {
  const w = filled();
  const g = splitToday(LT.buildToday(w, w.now));
  assert.equal(w.schedule.update(g.events[0].id, { completed: true }).ok, true);
  assert.notEqual(w.routines.setCompleted(g.routines[0].id, true).ok, false);
  assert.equal(w.tasks.update(g.overdue[0].id, { completed: true }).ok, true);
  const after = LT.buildToday(w, w.now);
  assert.equal(after.items.find((i) => i.id === g.events[0].id).done, true);
  assert.equal(after.items.find((i) => i.id === g.routines[0].id).done, true);
  assert.deepEqual(after.overdue, [], 'a finished overdue task leaves the list');
  assert.deepEqual(COLLECTIONS.filter((c) => /home/i.test(c)), [], 'no Home collection');
  assert.match(JS['home-today.js'], /const today = \(\) => splitToday\(buildToday\(\{ schedule, tasks, routines \}, now\)\);/);
});

test('HV2-04 upcoming: tomorrow onward, a few lines, never in today\'s numbers', () => {
  const w = filled();
  const u = LT.buildUpcoming(w, w.now);
  assert.deepEqual(u.days.flatMap((d) => d.lines).slice(0, UPCOMING_HOME_LINES).map((l) => l.title), ['내일 장보기', '내일 할 일', '다음 주 모임']);
  assert.match(JS['home-today.js'], /내일부터의 일정이에요\. 오늘 할 것의 숫자에는 넣지 않아요\./);
});

test('HV2-05 add and edit happen in 내 생활: Home opens the exact form (calendar · tasks · medication); no form on Home', () => {
  assert.match(JS['life-plan.js'], /const openAdd = \(\) => \{\n\s+select\(today\(now\)\);\n\s+list\.openAdd\(\);/);
  assert.match(JS['life-view.js'], /calendar: \{ cards: \[calendar\.card\], render: calendar\.render, api: calendar, openAdd: calendar\.openAdd \}/);
  assert.match(JS['app.js'], /onAdd: \(section\) => \{\n\s+pendingLifeAdd = section;\n\s+win\.location\.hash = lifeHash\(section\);/);
  for (const s of ['calendar', 'tasks', 'medication']) assert.equal(resolveView(`#life/${s}`), 'life');
  assert.equal(/schedule\.(add|remove)\(|medication\.(add|update|remove)\(|tasks\.(add|remove)\(|routines\.(add|update|remove)\(|onUpdate: \(|onRemove: \(|fields: \[\{/.test(HOME_CODE), false);
});

/* ═════════════ 3. 건강·안부 ═════════════ */

test('HV2-06 Health canonical data: 먹었어요 · 건너뜀 · 표시 풀기 use medication.setStatus, like 건강·안부 — the meaning is unchanged', () => {
  const w = world();
  w.medication.add({ name: '아침약', time: '08:00' });
  const id = w.medication.list()[0].id;
  assert.equal(w.medication.setStatus(id, 'SKIPPED', TODAY).ok, true);
  assert.deepEqual(LT.buildHealthGlance(w, w.now).doses, { planned: 1, taken: 0, skipped: 1 });
  assert.equal(buildHomeSummary(w, w.now).medication.left, 1, 'a skipped dose is not counted as taken');
  assert.equal(w.medication.setStatus(id, 'NONE', TODAY).ok, true);
  assert.deepEqual(LT.buildHealthGlance(w, w.now).doses, { planned: 1, taken: 0, skipped: 0 });
  for (const status of ['TAKEN', 'SKIPPED', 'NONE']) assert.match(JS['home-today.js'], new RegExp(`mark\\(m, '${status}'`), status);
  assert.match(JS['home-today.js'], /medication\.setStatus\(m\.id, status, date\)/);
  for (const word of ['먹었어요로 표시', '건너뜀으로 표시', '아직 표시하지 않았어요']) { assert.ok(JS['home-today.js'].includes(word), word); assert.ok(JS['health-safety-view.js'].includes(word), word); }
});

test('HV2-07 no inference: no answer is not danger, no record is not illness; nothing is shared with family', () => {
  assert.doesNotMatch(COPY, FORBIDDEN_SAFETY);
  assert.doesNotMatch(COPY, /위험|응급 상황|이상 징후|건강 이상|무응답|응답 없음|연락 두절|보호자에게 알|가족에게 알렸/);
  assert.match(JS['home-today.js'], /표시하지 않은 약을 먹지 않았다고 여기지 않아요\./);
  assert.match(JS['home-view.js'], /ONGIL이 몸 상태를 판단하거나 누군가에게 알리지 않아요\./);
  assert.match(JS['home-today.js'], /ONGIL은 이 선택을 다른 사람에게 알리지 않습니다\./);
  assert.equal(/familyConnect|family\.|applySharing|setSharing/.test(code(JS['home-today.js'])), false, 'the health cards never touch family');
});

/* ═════════════ 4. 가족 ═════════════ */

test('HV2-08 Family privacy: the card reads connection facts only — never a record — and reading writes nothing', () => {
  const src = code(JS['home-explore.js']);
  const body = src.slice(src.indexOf('export function createFamilyCard'), src.indexOf('export const ENJOY_CATEGORIES'));
  assert.deepEqual([...body.matchAll(/connect\.(\w+)\(/g)].map((m) => m[1]).sort(), ['connectedCount', 'overview']);
  assert.equal(/checkIn|medication|schedule|dailyLife|sleep|emergency|snapshot|previewFor|familyView|phone|location|activity\(/.test(body), false);
  assert.ok(FAMILY_LOCAL_TEXT.includes('이 기기 안에서만'));
  assert.ok(FAMILY_PRIVATE_TEXT.includes('자동으로 공유되지 않아요'));
  const w = world();
  const before = w.writes();
  assert.equal(w.family.connectedCount(), 0);
  assert.equal(w.family.overview().pending.length, 0);
  assert.equal(w.writes(), before, 'reading the family state writes nothing');
  assert.doesNotMatch(COPY, /가족과 연결되었|가족이 볼 수 있습니다|가족에게 보냈|원격 연결됨/);
  assert.match(INDEX, /지금은 이 기기 안에서만 가족과 연결할 수 있어요/);
  assert.doesNotMatch(INDEX, /가족 연결은 아직 준비 중입니다/);
});

/* ═════════════ 5. 즐길거리 ═════════════ */

test('HV2-09 Enjoy saved data: only what the person really saved, PROGRAM and PLACE only; nothing when nothing was saved', () => {
  const w = world();
  assert.deepEqual(LT.buildActivities(w.saved), { total: 0, items: [] });
  w.saved.save({ type: 'PROGRAM', id: 'p1', title: '서예 교실' });
  w.saved.save({ type: 'PLACE', id: 'pl1', title: '시립 공원' });
  w.saved.save({ type: 'PRODUCT', id: 'x1', title: '보행 보조기' });
  const a = LT.buildActivities(w.saved);
  assert.equal(a.total, 2);
  assert.deepEqual(a.items.map((i) => i.title).sort(), ['서예 교실', '시립 공원']);
  assert.match(JS['home-explore.js'], /mine\.total\n\s+\? \[\n\s+el\('h4', \{ class: 'og-life-sub', text: '내가 저장한 관심 활동' \}\)/);
  assert.deepEqual([...ENJOY_CATEGORIES], ['취미', '배움', '운동', '문화', '나들이', '여행']);
  assert.doesNotMatch(COPY, FORBIDDEN_FAKE);
  assert.equal(/36110|광주·전남|TOUR_REGIONS|ENJOY_REGIONS/.test(HOME), false, 'nothing of the held Enjoy Phase B');
});

test('HV2-10 내 주변 inside 즐길거리: button only, region only; a 502 or a throw stays inside the part', () => {
  const src = code(JS['home-explore.js']);
  assert.equal((src.match(/source\.load\(/g) || []).length, 1);
  assert.match(src, /try \{\n\s+result = await source\.load\(\{ region \}\);\n\s+\} catch \{\n\s+result = \{ state: 'unavailable', items: \[\] \};/);
  assert.match(src, /result && result\.reason === 'NO_ANSWER'/);
  assert.match(src, /지금은 강좌 정보를 받아오지 못했어요\. 잠시 뒤 다시 눌러 주세요\./);
  assert.match(src, /const nearby = profile && source && saved \? createNearbyPart/);
});

/* ═════════════ 6. 돌봄 · 커뮤니티 · 도우미 ═════════════ */

test('HV2-11 Care: links go to real 돌봄·서비스 sections; services and benefits are said to have no data yet', () => {
  for (const c of CARE_LINKS) assert.ok(CARE_SECTIONS.includes(c.id), c.id);
  assert.match(JS['home-explore.js'], /돌봄 서비스와 복지 혜택 정보는 아직 연결된 자료가 없어요/);
  assert.match(JS['home-explore.js'], /ONGIL은 신청이나 예약을 대신하지 않아요/);
});

test('HV2-12 Community truthful state: this device only, counts of the person\'s own items, no remote community shown', () => {
  assert.ok(COMMUNITY_LOCAL_TEXT.includes('이 기기에만 저장돼요'));
  assert.ok(COMMUNITY_LOCAL_TEXT.includes('아직 열리지 않았어요'));
  for (const s of ['write', 'groups']) assert.ok(COMMUNITY_SECTIONS.includes(s), s);
  const src = code(JS['home-explore.js']);
  const body = src.slice(src.indexOf('export function createCommunityCard'), src.indexOf('export const HELPER_EXAMPLES'));
  assert.deepEqual([...body.matchAll(/community\.(posts|groups)\.(\w+)\(/g)].map((m) => m[2]), ['count', 'count'], 'counts only, never the words');
  assert.doesNotMatch(COPY, /공개되었|게시되었|댓글이 달|이웃이|팔로|새 글 \d/);
});

test('HV2-13 Helper truthful state: rule-based only — examples that really work, never called an AI', () => {
  const texts = SUGGESTIONS.filter((s) => s.kind === 'run').map((s) => s.text);
  for (const e of HELPER_EXAMPLES) assert.ok(texts.includes(e), e);
  assert.match(HELPER_TEXT, /정해진 요청만 알아듣는 도우미예요/);
  assert.match(HELPER_TEXT, /AI는 아니에요/);
  assert.doesNotMatch(COPY, FORBIDDEN_AI);
  assert.match(JS['app.js'], /const button = doc\.querySelector\('\[data-og-tool="assistant"\]'\);\n\s+if \(button && button\.getAttribute\('aria-expanded'\) !== 'true'\) win\.setTimeout\(\(\) => button\.click\(\), 0\);/);
});

/* ═════════════ 7. 오류 격리 · 개인정보 · 캐시 ═════════════ */

test('HV2-14 Section error isolation (static): every card is made and redrawn inside a guard; the notice has no code or record', () => {
  const v = JS['home-view.js'];
  for (const slot of ['plan-events', 'plan-upcoming', 'check-in', 'medication', 'life-check', 'family', 'enjoy', 'care', 'community', 'helper', 'guide']) assert.match(v, new RegExp(`guard\\('${slot}'`), slot);
  assert.match(v, /function draw\(slot\) \{[\s\S]*?try \{[\s\S]*?\} catch \{[\s\S]*?replaceWith/);
  assert.doesNotMatch(SECTION_ERROR_TEXT, /[A-Z_]{4,}|error|Error|\d{3}/);
  assert.match(SECTION_ERROR_TEXT, /다른 부분은 그대로 쓸 수 있어요/);
});

test('HV2-15 Privacy (static): Home sends nothing, stores nothing of its own and never changes the address while drawing', () => {
  assert.equal(/\bfetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB/.test(HOME_CODE), false);
  assert.equal(/location\.hash|location\.href|history\.(push|replace)State/.test(HOME_CODE), false, 'Home changes the address only through a link the person presses');
  assert.equal(/innerHTML|insertAdjacentHTML|outerHTML/.test(HOME_CODE), false);
});

test('HV2-16 Cache references: the entry and the new stylesheet have new addresses; the import map is current; the mobile hero is smaller', () => {
  assert.match(INDEX, /<link rel="stylesheet" href="\/ongil-start\/styles\/ongil-home-v2\.css\?v=20261009hv2" \/>/);
  assert.match(INDEX, /<script type="module" src="\/ongil-start\/js\/app\.js\?v=20261009hv2"><\/script>/);
  assert.ok(INDEX.indexOf('ongil-home.css?v=') < INDEX.indexOf('ongil-home-v2.css?v='), 'V2 rules come after the Home rules');
  const r = spawnSync(process.execPath, ['scripts/ongil-module-versions.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(CSS2, /@media \(max-width: 860px\) \{[\s\S]*?\.og-hero \{ height: 72svh; min-height: 32rem; \}/, 'decision 5');
  assert.equal(/#[0-9a-f]{3,6}\b/i.test(CSS2.replace(/\/\*[\s\S]*?\*\//g, '')), false, 'colours come from tokens');
});

/* ═════════════ 8. 브라우저 (Chromium) ═════════════ */

const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const skip = !(fs.existsSync(PW) && fs.existsSync(CHROME)) && 'no local Chromium';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
let B = null, SERVER = null, BASE = '';
async function boot() {
  if (B) return;
  const { chromium } = await import(PW);
  SERVER = await new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); return res.end(fs.readFileSync(f)); }
      res.writeHead(404); res.end();
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
  BASE = `http://127.0.0.1:${SERVER.address().port}`;
  B = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
}
test.after(async () => { if (B) await B.close(); if (SERVER) SERVER.close(); });
async function page(width, hash = '#ongil-home', { height = 900 } = {}) {
  await boot();
  const ctx = await B.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  await ctx.route('**/*', (r) => (r.request().url().startsWith(BASE) ? r.continue() : r.abort()));
  const pg = await ctx.newPage();
  pg._errors = []; pg.on('pageerror', (e) => pg._errors.push(e.message));
  await pg.goto(`${BASE}/ongil-start/${hash}`, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  return pg;
}
const go = async (pg, hash) => { await pg.evaluate((h) => { location.hash = h; }, hash); await pg.waitForTimeout(300); };
const HOME_SEL = '[data-og-modules="home"]';
const layout = (pg, scope) => pg.evaluate((scope) => {
  const vis = (e) => { const s = getComputedStyle(e); const b = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && !e.closest('[hidden]'); };
  const root = document.querySelector(scope);
  const inter = [...root.querySelectorAll('a[href],button,input,select,textarea')].filter(vis);
  const small = inter.filter((e) => {
    const b = e.getBoundingClientRect();
    if (e.type === 'checkbox') { const l = (e.id && document.querySelector(`label[for="${e.id}"]`)) || e.closest('label'); return !l || l.getBoundingClientRect().height < 44 || l.getBoundingClientRect().width < 44; }
    return b.height < 44 || b.width < 44;
  }).map((e) => e.outerHTML.slice(0, 80));
  const clipped = [...root.querySelectorAll('p,li,h2,h3,h4,button,a')].filter(vis).filter((e) => !e.closest('.visually-hidden')).filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'hidden').map((e) => e.textContent.slice(0, 30));
  const headings = [...root.querySelectorAll('h2,h3')].filter(vis).filter((h) => !h.closest('[data-og-extra]')).map((h) => `${h.tagName}:${h.textContent}`); /* the onboarding invitation above the sections is not a Home section */
  return { over: document.documentElement.scrollWidth - document.documentElement.clientWidth, small, clipped, text: root.innerText, headings };
}, scope);
async function fill(pg) {
  await pg.evaluate(() => {
    const O = window.Ongil;
    const d = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
    O.schedule.add({ title: '동네 복지관 노래 교실 가는 날이에요'.repeat(2), date: d(0), time: '10:00' });
    O.schedule.add({ title: '내일 장보기', date: d(1) });
    O.tasks.add({ title: '전기요금 내기아주긴할일제목입니다아주긴할일제목입니다', dueDate: d(0), time: '09:30' });
    O.tasks.add({ title: '지난주 할 일', dueDate: d(-3) });
    O.routines.add({ title: '아침 스트레칭', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], time: '08:00' });
    O.medication.add({ name: '아침약', time: '08:00' });
    O.saved.save({ type: 'PROGRAM', id: 'qa-p1', title: '복지관 서예 교실' });
    O.communityPosts.add({ type: 'QUESTION', category: 'HOBBY', title: '첫 글', body: '본문' });
  });
  await go(pg, '#life');
  await go(pg, '#ongil-home');
}
const ORDER = ['H2:오늘', 'H3:오늘 할 것', 'H3:건강·안부', 'H3:가족', 'H3:즐길거리', 'H3:돌봄·서비스', 'H3:커뮤니티', 'H3:ONGIL 도우미', 'H3:서비스 안내'];
const EMPTY_WORDS = ['오늘 적어 둔 일정이 없어요.', '오늘까지 할 일이 없어요.', '적어 둔 약이 없어요.', '아직 연결한 가족이 없어요.', '아직 쓴 글이나 모임 준비가 없어요.', '정해진 요청만 알아듣는 도우미예요.'];
const FILLED_WORDS = ['동네 복지관', '전기요금 내기', '기한 지난 할 일', '지난주 할 일', '아침 스트레칭', '내일 장보기', '아침약', '복지관 서예 교실', '내가 쓴 글 1개'];

for (const [id, w] of [['HV2-B1', 320], ['HV2-B2', 390], ['HV2-B3', 768], ['HV2-B4', 1024], ['HV2-B5', 1440]]) {
  test(`${id} browser ${w}px: Home empty and filled — section order, no overflow, no clipped text, targets ≥ 44px`, { skip }, async () => {
    const pg = await page(w);
    for (const step of ['empty', 'filled']) {
      if (step === 'filled') await fill(pg);
      const r = await layout(pg, HOME_SEL);
      assert.equal(r.over, 0, `${w} ${step}: page overflow ${r.over}px`);
      assert.deepEqual(r.small, [], `${w} ${step}: small targets`);
      assert.deepEqual(r.clipped, [], `${w} ${step}: clipped text`);
      assert.deepEqual(r.headings, ORDER, `${w} ${step}: section order`);
      assert.doesNotMatch(r.text, FORBIDDEN_SAFETY);
      assert.doesNotMatch(r.text, FORBIDDEN_FAKE);
      assert.doesNotMatch(r.text, FORBIDDEN_AI);
      if (step === 'empty') {
        for (const t of EMPTY_WORDS) assert.ok(r.text.includes(t), `${w} empty: ${t}`);
        assert.equal(r.text.includes('기한 지난 할 일'), false, 'no empty overdue box');
      } else for (const t of FILLED_WORDS) assert.ok(r.text.includes(t), `${w} filled: ${t}`);
    }
    if (w <= 860) {
      const hero = await pg.evaluate(() => document.querySelector('.og-hero').getBoundingClientRect().height / innerHeight);
      assert.ok(hero < 0.8, `${w}: the hero no longer fills the first screen (${hero.toFixed(2)})`);
    }
    assert.deepEqual(pg._errors, []);
    await pg.context().close();
  });
}

test('HV2-B6 browser 200% text at 320px: Home still fits — nothing overflows or is clipped; the hero keeps its buttons inside', { skip }, async () => {
  const pg = await page(320);
  await fill(pg);
  await pg.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await pg.waitForTimeout(200);
  const r = await layout(pg, HOME_SEL);
  assert.equal(r.over, 0, `overflow ${r.over}px`);
  assert.deepEqual(r.clipped, []);
  const hero = await pg.evaluate(() => { const h = document.querySelector('.og-hero').getBoundingClientRect(); const a = document.querySelector('.og-hero__actions').getBoundingClientRect(); return a.bottom <= h.bottom + 1 && a.top >= h.top; });
  assert.equal(hero, true, 'the hero buttons stay inside the hero');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('HV2-B7 browser keyboard: Space marks a 오늘 할 것 row and focus stays; 건너뜀 works from the keyboard with a visible ring', { skip }, async () => {
  const pg = await page(390);
  await fill(pg);
  const box = pg.locator(`${HOME_SEL} [data-og-slot="home.plan-routines"] .og-home-item__check`).first();
  await box.focus(); await pg.keyboard.press('Space'); await pg.waitForTimeout(200);
  assert.equal(await pg.evaluate(() => window.Ongil.routines.listForDate()[0].completed), true);
  assert.equal(await pg.evaluate(() => document.activeElement.classList.contains('og-home-item__check')), true);
  assert.match(await pg.locator(`${HOME_SEL} [data-og-slot="home.plan-routines"] [role="status"]`).innerText(), /오늘 한 루틴으로 표시했습니다/);
  await pg.locator(`${HOME_SEL} [data-og-slot="home.medication"] [data-og-med-mark="SKIPPED"]`).first().focus();
  await pg.keyboard.press('Enter'); await pg.waitForTimeout(200);
  const state = await pg.evaluate(() => { const d = window.Ongil.medication.listForDate()[0]; const a = document.activeElement; const s = getComputedStyle(a); return [d.taken, d.skipped, a.tagName, s.outlineStyle !== 'none' || s.boxShadow !== 'none']; });
  assert.deepEqual(state, [false, true, 'BUTTON', true], 'skipped, focus kept on a button of the row, visible ring');
  await go(pg, '#health');
  assert.match(await pg.locator('[data-og-modules="health"]').innerText(), /건너뜀으로 표시/, '건강·안부 shows the same mark');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('HV2-B8 browser: 일정 추가 · 약 추가 open the exact form in 내 생활; the helper button opens the helper panel', { skip }, async () => {
  const pg = await page(390);
  await pg.locator(`${HOME_SEL} [data-og-home-add="calendar"]`).click(); await pg.waitForTimeout(600);
  assert.equal(await pg.evaluate(() => location.hash), '#life/calendar');
  assert.equal(await pg.evaluate(() => (document.activeElement.closest('[data-og-slot="life.calendar"] form') ? document.activeElement.name : '')), 'title', 'the event form is open on its first field');
  await go(pg, '#ongil-home');
  await pg.locator(`${HOME_SEL} [data-og-home-add="medication"]`).click(); await pg.waitForTimeout(600);
  assert.equal(await pg.evaluate(() => location.hash), '#life/medication');
  assert.equal(await pg.evaluate(() => !!document.activeElement.closest('form')), true, 'the medication form is open');
  await go(pg, '#ongil-home');
  await pg.locator(`${HOME_SEL} [data-og-home-helper="open"]`).click(); await pg.waitForTimeout(200);
  assert.equal(await pg.evaluate(() => document.querySelector('#og-panel-assistant').hidden), false);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('HV2-B9 browser error isolation: broken sources leave a plain notice in their place; every other section draws', { skip }, async () => {
  const pg = await page(1024);
  const r = await pg.evaluate(async () => {
    const { createHomeView } = await import('/ongil-start/js/home-view.js');
    const O = window.Ongil;
    const host = document.createElement('div');
    document.body.append(host);
    const boom = () => { throw new Error('BROKEN_STORE'); };
    const broken = { ...O.medication, listForDate: boom, count: boom };
    const brokenTasks = { ...O.tasks, dueOn: boom, overdue: boom };
    const view = createHomeView({ host, doc: document, stores: { profile: O.profile, checkIn: O.checkIn, schedule: O.schedule, medication: broken, dailyLife: O.dailyLife, tasks: brokenTasks, routines: O.routines, saved: O.saved }, source: null, family: { connect: { connectedCount: boom, overview: boom } }, community: { posts: { count: boom }, groups: { count: boom } }, enjoyLoaded: boom });
    view.refresh();
    const out = { text: host.innerText, errors: [...host.querySelectorAll('[data-og-home-error]')].map((e) => e.dataset.ogHomeError), sections: [...host.querySelectorAll('[data-og-home-section]')].map((s) => s.dataset.ogHomeSection) };
    host.remove();
    return out;
  });
  assert.deepEqual(r.sections, ['plan', 'health', 'family', 'enjoy', 'care', 'community', 'helper', 'guide']);
  assert.ok(r.errors.length >= 1, 'a broken card shows the notice');
  for (const t of ['오늘의 안부', '식사·물·운동', '돌봄·서비스', '서비스 안내', 'ONGIL 도우미']) assert.ok(r.text.includes(t), `still drawn: ${t}`);
  assert.doesNotMatch(r.text, /BROKEN|Error|undefined|\bnull\b/);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('HV2-B10 browser privacy: drawing and refreshing Home writes nothing, sends nothing and keeps the address', { skip }, async () => {
  await boot();
  const ctx = await B.newContext({ viewport: { width: 390, height: 900 } });
  const api = [];
  ctx.on('request', (q) => { if (/\/api\//.test(q.url())) api.push(q.url()); });
  await ctx.route('**/*', (q) => (q.request().url().startsWith(BASE) ? q.continue() : q.abort()));
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/ongil-start/#ongil-home`, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  const r = await pg.evaluate(async () => {
    const { createHomeView } = await import('/ongil-start/js/home-view.js');
    const O = window.Ongil;
    let writes = 0;
    const set = Storage.prototype.setItem; const rm = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (...a) { writes += 1; return set.apply(this, a); };
    Storage.prototype.removeItem = function (...a) { writes += 1; return rm.apply(this, a); };
    const hash = location.hash;
    const host = document.createElement('div'); document.body.append(host);
    try {
      const view = createHomeView({ host, doc: document, stores: { profile: O.profile, checkIn: O.checkIn, schedule: O.schedule, medication: O.medication, dailyLife: O.dailyLife, tasks: O.tasks, routines: O.routines, saved: O.saved }, source: { load: () => { throw new Error('must not load'); } }, family: null, community: { posts: O.communityPosts, groups: O.groupDrafts }, enjoyLoaded: () => [] });
      view.refresh(); view.refresh();
    } finally {
      Storage.prototype.setItem = set; Storage.prototype.removeItem = rm;
      host.remove();
    }
    return { writes, same: location.hash === hash };
  });
  assert.deepEqual(r, { writes: 0, same: true });
  assert.deepEqual(api, [], 'no API call while drawing Home');
  await ctx.close();
});
