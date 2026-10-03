// ONGIL Phase 2B — privacy and safety of My Life: classification, not synced, not searched, erase-all,
// keyboard and non-colour state of the new UI, no invented data or advice.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS } from '../../ongil-start/js/storage.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createDailyLifeStore } from '../../ongil-start/js/daily-life.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createSleepStore } from '../../ongil-start/js/sleep.js';
import { createExpenseStore } from '../../ongil-start/js/expenses.js';
import { createJournalStore } from '../../ongil-start/js/journal.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createProfileStore } from '../../ongil-start/js/profile.js';
import { createAccount, SYNCABLE_COLLECTIONS, isSyncable } from '../../ongil-start/js/account.js';
import { createSearch, createAreaProvider, createSavedProvider } from '../../ongil-start/js/search.js';
import { CLASSIFICATION, CONTRACT_CLASSES, DATA_CLASSES, classOf, maySync, maySearchGlobally, familySharingAllowed, unclassified } from '../../ongil-start/js/privacy.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const INDEX = read('index.html');
const LIFE_FILES = ['life-view.js', 'life-plan.js', 'life-daily.js', 'life-records.js'];
const SRC = Object.fromEntries(LIFE_FILES.map((f) => [f, read('js', f)]));
const ALL = LIFE_FILES.map((f) => SRC[f]).join('\n');
const CODE = ALL.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const CSS = read('styles', 'ongil-life.css');

function world(seed) {
  const clock = { t: new Date(2026, 9, 2, 9, 0, 0).getTime() };
  const now = () => (clock.t += 1000);
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  return {
    backend,
    storage,
    schedule: createScheduleStore(storage, { now }),
    dailyLife: createDailyLifeStore(storage, { now }),
    tasks: createTaskStore(storage, { now }),
    routines: createRoutineStore(storage, { now }),
    sleep: createSleepStore(storage, { now }),
    expenses: createExpenseStore(storage, { now }),
    journal: createJournalStore(storage, { now }),
    medication: createMedicationStore(storage, { now }),
    checkIn: createCheckInStore(storage, { now }),
    saved: createSavedStore(storage, { now }),
    profile: createProfileStore(storage, { now }),
  };
}

// Phase 3: symptoms and healthNotes are HEALTH_ADJACENT, with contracts SymptomRecord and HealthNote. Same rules apply to them.
test('OG-PV-1 every collection has a class; private and health-adjacent data may not sync, be searched or be shared', () => {
  assert.deepEqual(unclassified(), []);
  assert.deepEqual(Object.keys(CLASSIFICATION).sort(), [...COLLECTIONS].sort());
  for (const c of Object.values(CLASSIFICATION)) assert.ok(DATA_CLASSES.includes(c));
  const by = (cls) => Object.keys(CLASSIFICATION).filter((k) => CLASSIFICATION[k] === cls).sort();
  // Phase 4: familySharing and helpRequests are PRIVATE (contracts FamilySharingPreference, HelpRequest)
  // Phase 6: communityPosts, groupDrafts, meetupDrafts are PRIVATE (contracts CommunityPost, GroupDraft, MeetupDraft)
  assert.deepEqual(by('PRIVATE'), ['communityPosts', 'emergencyContacts', 'expenses', 'familySharing', 'groupDrafts', 'helpRequests', 'journal', 'meetupDrafts']);
  assert.deepEqual(by('HEALTH_ADJACENT'), ['checkins', 'healthMeasures', 'healthNotes', 'medicationLogs', 'medications', 'symptoms']);
  assert.deepEqual(by('STANDARD'), ['dailyLife', 'events', 'routineLogs', 'routines', 'sleepRecords', 'tasks']);
  assert.deepEqual({ ...CONTRACT_CLASSES }, { CalendarEvent: 'STANDARD', Task: 'STANDARD', Routine: 'STANDARD', RoutineLog: 'STANDARD', DailyLife: 'STANDARD', SleepRecord: 'STANDARD', ExpenseRecord: 'PRIVATE', JournalEntry: 'PRIVATE', Medication: 'HEALTH_ADJACENT', MedicationLog: 'HEALTH_ADJACENT', CheckIn: 'HEALTH_ADJACENT', SymptomRecord: 'HEALTH_ADJACENT', HealthNote: 'HEALTH_ADJACENT', HealthMeasure: 'HEALTH_ADJACENT', FamilySharingPreference: 'PRIVATE', HelpRequest: 'PRIVATE', CommunityPost: 'PRIVATE', GroupDraft: 'PRIVATE', MeetupDraft: 'PRIVATE', EmergencyContact: 'PRIVATE' }); // Completion V3: + EmergencyContact
  for (const c of COLLECTIONS) {
    if (classOf(c) === 'APP') continue;
    assert.equal(maySync(c), false, c);
    assert.equal(isSyncable(c), false, c);
    assert.equal(SYNCABLE_COLLECTIONS.includes(c), false, c);
    assert.equal(maySearchGlobally(c), false, c);
  }
  assert.equal(familySharingAllowed(), false);
  assert.equal(classOf('nope'), null);
  assert.equal(maySync('nope'), false);
});

test('OG-PV-2 private data is not synced: a connected adapter never receives My Life or health-adjacent records', () => {
  const w = world();
  const account = createAccount({ storage: w.storage });
  const pushed = [];
  assert.equal(account.connectSyncAdapter({ id: 't', isConfigured: () => true, push: (c) => pushed.push(c.collection) }).connected, true);
  w.journal.add({ text: '일기' });
  w.expenses.add({ category: 'food', amount: 5000 });
  w.tasks.add({ title: '할 일' });
  const r = w.routines.add({ title: '루틴', daysOfWeek: [5] }).routine;
  w.routines.setCompleted(r.id, true);
  w.sleep.save({ quality: 'good' });
  w.schedule.add({ title: '일정' });
  w.dailyLife.update({ meals: 1 });
  const m = w.medication.add({ name: '약' }).medication;
  w.medication.setTaken(m.id, true);
  w.checkIn.set('good');
  assert.deepEqual(pushed, []);
  w.profile.updateProfile({ nickname: 'a' });
  assert.deepEqual(pushed, ['profile'], 'the adapter itself works — it is the classification that keeps the rest out');
});

test('OG-PV-3 private data is not searched: journal, expenses, tasks, events, routines and sleep never appear in global search', async () => {
  const w = world();
  w.journal.add({ text: '찾으면안되는일기내용' });
  w.expenses.add({ category: 'food', amount: 4242, memo: '찾으면안되는지출메모' });
  w.tasks.add({ title: '찾으면안되는할일' });
  w.schedule.add({ title: '찾으면안되는일정' });
  w.routines.add({ title: '찾으면안되는루틴', daysOfWeek: [1] });
  w.sleep.save({ memo: '찾으면안되는수면메모' });
  const search = createSearch();
  search.registerProvider(createAreaProvider(AREAS));
  search.registerProvider(createSavedProvider(w.saved));
  for (const q of ['찾으면안되는일기내용', '찾으면안되는지출메모', '4242', '찾으면안되는할일', '찾으면안되는일정', '찾으면안되는루틴', '찾으면안되는수면메모']) assert.deepEqual((await search.query(q)).results, [], q);
  // Phase 7: the fifth provider is public product information loaded on the 스토어 screen (createStoreProvider).
  assert.equal((read('js', 'app.js').match(/search\.registerProvider\(/g) || []).length, 5, 'menus, saved items, public care, public 즐길거리 and public product content only');
  // Phase 5: a fourth provider, 즐길거리, searches only PUBLIC enjoy items loaded on that screen (never a personal record).
  assert.match(read('js', 'app.js'), /search\.registerProvider\(createEnjoyProvider\(\(\) => enjoyView\.items\(\)\)\);/);
  // Phase 4: a third provider, 돌봄·서비스, searches only PUBLIC care items loaded on that screen (never a personal record).
  assert.match(read('js', 'app.js'), /search\.registerProvider\(createCareProvider\(\(\) => care\.items\(\)\)\);/);
  assert.equal(/registerProvider|createSearch|notifications\.add\(/.test(CODE), false, 'My Life registers no search provider and raises no notification');
  const hit = await search.query('생활비');
  // Phase 8: a menu entry that has its own address opens that section. BEFORE: every section result opened its area
  // ('#life'). AFTER: '#life/expenses'. Still the menu entry only — the description is the menu's, never a record.
  assert.deepEqual([hit.results[0].id, hit.results[0].href, hit.results[0].typeLabel], ['life.expenses', '#life/expenses', '메뉴'], 'the menu entry is found; its content is not');
});

test('OG-PV-4 "erase ONGIL data" removes every collection, new ones included, and nothing that is not ONGIL', () => {
  const w = world({ 'livon.mlStore.v1': '{"keep":true}', 'newon-app-theme': 'dark', 'ongil-unrelated': 'x' });
  w.profile.updateProfile({ nickname: 'a' });
  w.profile.updatePreferences({ textSize: 'large' });
  w.saved.save({ type: 'PLACE', id: 'p', title: 't' });
  w.checkIn.set('good');
  w.schedule.add({ title: 'e' });
  const m = w.medication.add({ name: 'm' }).medication;
  w.medication.setTaken(m.id, true);
  w.dailyLife.update({ meals: 1 });
  w.tasks.add({ title: 't' });
  const r = w.routines.add({ title: 'r', daysOfWeek: [5] }).routine;
  w.routines.setCompleted(r.id, true);
  w.sleep.save({ quality: 'good' });
  w.expenses.add({ category: 'food', amount: 1 });
  w.journal.add({ text: 'j' });
  const written = w.storage.list();
  for (const c of ['checkins', 'events', 'medications', 'medicationLogs', 'dailyLife', 'tasks', 'routines', 'routineLogs', 'sleepRecords', 'expenses', 'journal', 'profile', 'preferences', 'saved']) assert.ok(written.includes(c), c);
  assert.equal(w.storage.clear(), true);
  assert.deepEqual(w.storage.list(), []);
  assert.deepEqual(w.backend.keys().sort(), ['livon.mlStore.v1', 'newon-app-theme', 'ongil-unrelated']);
  assert.equal(w.journal.count() + w.expenses.count() + w.tasks.count() + w.routines.count() + w.schedule.count(), 0);
  assert.match(read('js', 'account-view.js'), /일정·할 일·루틴·복약·식사·운동·수면·생활비·기록·안부까지 이 기기에서 모두 지웁니다/);
  assert.match(read('js', 'app.js'), /life\.refresh\(\);/);
});

test('OG-LF-7 tabs, calendar and forms are operable without a mouse and state is never colour-only', () => {
  const view = SRC['life-view.js'];
  assert.match(view, /role: 'tablist', 'aria-label': '내 생활 영역'/);
  assert.match(view, /role: 'tab', id: `og-life-tab-\$\{group\.id\}`, 'aria-controls': `og-life-panel-\$\{group\.id\}`, 'aria-selected': 'false'/);
  assert.match(view, /role: 'tabpanel', id: `og-life-panel-\$\{group\.id\}`, 'aria-labelledby': tab\.id/);
  for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) assert.ok(view.includes(`'${key}'`), key);
  const plan = SRC['life-plan.js'];
  assert.match(plan, /role: 'grid', 'aria-label': `\$\{formatMonth\(month\)\} 달력`/);
  assert.match(plan, /scope: 'col', abbr: WEEKDAY_NAMES\[i\]/);
  assert.match(plan, /tabindex: isSelected \? '0' : '-1', 'aria-pressed': isSelected \? 'true' : 'false', 'aria-current': key === today\(now\) \? 'date' : null, 'aria-label': dayLabel/);
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']) assert.ok(plan.includes(key), key);
  assert.match(plan, /parts\.push\(`일정 \$\{events\}개`\)/, 'a day with events says so in its name, not only with a dot');
  for (const label of ['이전 달', '다음 달', '오늘로 가기', '할 일 골라 보기', '운동 종류']) assert.ok(ALL.includes(`'${label}'`), label);
  // Phase 2C: 식사 and 운동 can be recorded for a chosen day, so their group names carry the day ("오늘" or the date)
  // instead of a fixed "오늘". The groups must still be named — and so must the new 물 group and the date bar.
  for (const label of ['`${word} 먹은 끼니`', '`${word} 걷기·운동`', '`${word} 마신 물`', "'기록할 날짜'"]) assert.ok(ALL.includes(`'aria-label': ${label}`), label);
  assert.match(ALL, /export const dayWord = \(date, today\) => \(date === today \? '오늘' : formatDateKey\(date\)\);/);
  assert.match(CSS, /\.og-tab\[aria-selected="true"\]::after \{/);
  assert.match(CSS, /\.og-cal__day\[aria-current="date"\] \{ border-color: var\(--og-ink\); border-style: dashed; \}/);
  assert.match(CSS, /\.og-tab \{[^}]*min-height: 3\.25rem/);
  assert.match(CSS, /\.og-cal__day \{[^}]*min-height: 3rem/);
  assert.match(CSS, /@media \(max-width: 480px\) \{[\s\S]*\.og-cal__day \{ min-height: 2\.9rem/);
  assert.match(CSS, /table-layout: fixed/);
  // Phase 3: a fifth tab (건강). Still a grid of equal columns — no horizontal scrolling — and checked at 390px in the browser.
  assert.match(CSS, /\.og-tabs \{ display: grid; grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/, 'five tabs fit a phone without scrolling');
  assert.equal(/lv-|livon|--nls-/i.test(CSS.replace(/\/\*[\s\S]*?\*\//g, '')), false);
  assert.equal(/#[0-9a-f]{3,6}\b/i.test(CSS.replace(/\/\*[\s\S]*?\*\//g, '')), false, 'colours come from tokens');
  /* every list that can delete goes through the shared confirmation */
  assert.equal((ALL.match(/createListCard\(\{/g) || []).length, 7);
  assert.equal(/window\.confirm|[^.\w]confirm\(/.test(CODE), false);
});

test('OG-LF-8 no invented data, no judgement, no medical or financial advice, no network, no markup strings', () => {
  for (const phrase of ['칼로리', 'kcal', '권장', '목표 달성', '점수', '수면 효율', '수면 부족', '수면장애', '불면', '과소비', '절약하세요', '예산 초과', '평균보다', '건강합니다', '운동이 부족', '수면이 부족', '식사가 부족', '잘하셨', '클라우드', '백업 완료', '가족에게 공유']) {
    assert.equal(CODE.includes(phrase), false, phrase);
  }
  assert.match(SRC['life-daily.js'], /식단을 평가하거나 열량을 계산하지 않습니다/);
  assert.match(SRC['life-daily.js'], /운동량을 평가하거나 열량을 추정하지 않습니다/);
  assert.match(SRC['life-daily.js'], /수면 상태를 판단하거나 조언하지 않습니다/);
  assert.match(SRC['life-records.js'], /쓴 돈을 평가하거나 조언하지 않습니다/);
  assert.match(SRC['life-records.js'], /이 기기에만 저장됩니다\. 다른 사람에게 전달되지 않고, 검색에도 나오지 않습니다\./);
  assert.equal(/\.add\(\{ title: '|sampleData|\bdemo\b/.test(CODE), false, 'no default routine, task or sample record is created');
  assert.equal(/innerHTML|insertAdjacentHTML|outerHTML/.test(CODE), false);
  assert.equal(/\bfetch\(|fetcher\(|XMLHttpRequest|localStorage|sessionStorage|storage\.(get|set)\(/.test(CODE), false);
  for (const f of LIFE_FILES) for (const m of SRC[f].matchAll(/from '([^']+)'/g)) assert.ok(fs.existsSync(path.join(ROOT, 'ongil-start/js', m[1])), `${f} → ${m[1]}`);
  for (const empty of ['적어 둔 할 일이 없어요.', '만들어 둔 루틴이 없어요.', '적어 둔 수면 기록이 없어요.', '에 적은 생활비가 없어요.', '아직 남긴 기록이 없어요.', '이 날 적어 둔 일정이 없어요.', '이번 주에 적은 내용이 아직 없어요.']) assert.ok(ALL.includes(empty), empty);
  assert.match(INDEX, /<link rel="stylesheet" href="\/ongil-start\/styles\/ongil-life\.css\?v=[0-9a-z]+" \/>/);
});
