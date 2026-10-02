// ONGIL Phase 2C — Home + My Life as one screen system: Home cards for tasks and routines, deep links,
// cross-view refresh, privacy, touch targets, text size, honest copy.
// Static checks over the sources (no browser, no dependencies):  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS } from '../../ongil-start/js/storage.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { resolveView, sectionOf } from '../../ongil-start/js/router.js';
import { LIFE_SECTIONS, LIFE_GROUPS, SECTION_ALIASES, resolveSection, groupOf, lifeHash } from '../../ongil-start/js/life-view.js';
import { HOME_LEVELS } from '../../ongil-start/js/home-view.js';
import { QUICK_ACTIONS } from '../../ongil-start/js/home-explore.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createDailyLifeStore } from '../../ongil-start/js/daily-life.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createProfileStore } from '../../ongil-start/js/profile.js';
import { createAccount, SYNCABLE_COLLECTIONS, isSyncable } from '../../ongil-start/js/account.js';
import { createSearch, createAreaProvider, createSavedProvider } from '../../ongil-start/js/search.js';
import { CLASSIFICATION, maySync, maySearchGlobally, familySharingAllowed } from '../../ongil-start/js/privacy.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const JS_DIR = path.join(ROOT, 'ongil-start', 'js');
const JS = Object.fromEntries(fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).map((f) => [f, read('js', f)]));
const SCREEN_FILES = ['home-view.js', 'home-today.js', 'home-explore.js', 'home-list.js', 'home-ui.js', 'life-view.js', 'life-plan.js', 'life-daily.js', 'life-records.js'];
const SCREENS = SCREEN_FILES.map((f) => JS[f]).join('\n');
const SCREEN_CODE = strip(SCREENS);
const CSS_FILES = ['ongil-tokens.css', 'ongil-shell.css', 'ongil-app.css', 'ongil-home.css', 'ongil-life.css'];
const CSS = Object.fromEntries(CSS_FILES.map((f) => [f, read('styles', f)]));
const INDEX = read('index.html');
const APP = JS['app.js'];

/* ───────── Home cards for My Life records ───────── */

test('OG-IV-1 Home shows tasks and routines through My Life\'s stores and the shared list — no second task UI', () => {
  const today = JS['home-today.js'];
  assert.match(today, /export function createHomeTasksCard\(\{ tasks, now = \(\) => Date\.now\(\), onChange, onAdd \}\)/);
  assert.match(today, /getItems: \(\) => tasks\.dueOn\(dateKey\(now\(\)\)\)/, 'tasks due on the local day');
  assert.match(today, /onToggle: \(item, checked\) => tasks\.update\(item\.id, \{ completed: checked \}\)/);
  assert.match(today, /export function createHomeRoutinesCard\(\{ routines, onChange \}\)/);
  assert.match(today, /getItems: \(\) => routines\.listForDate\(\)/);
  assert.match(today, /onToggle: \(item, checked\) => routines\.setCompleted\(item\.id, checked\)/);
  /* both Home cards only show and check: no form fields, no add, no edit, no delete */
  for (const fn of ['createHomeTasksCard', 'createHomeRoutinesCard']) {
    const body = today.slice(today.indexOf(`export function ${fn}`), today.indexOf('/* ─────────', today.indexOf(`export function ${fn}`)));
    assert.match(body, /canAdd: false,\s*canEdit: false,\s*fields: \[\],/, fn);
    assert.equal(/onAdd: \(|onUpdate: \(|onRemove: \(/.test(body), false, `${fn} has no form of its own`);
    assert.match(body, /doneWord: '[^']+',\s*checkWord: '[^']+'/, `${fn} says the state in words`);
  }
  assert.match(today, /href: '#life\/tasks', text: '할 일 모두 보기'/);
  assert.match(today, /href: '#life\/routines'/);
  assert.match(today, /href: '#life\/calendar'/);
  assert.match(today, /href: '#life\/meals'/);
  /* the stores handed to Home are the very objects My Life uses */
  assert.match(APP, /stores: \{ profile, checkIn, schedule, medication, dailyLife, tasks, routines, saved, familyConnection: onboarding\.familyConnection \}/);
  assert.match(APP, /stores: \{ schedule, tasks, routines, dailyLife, sleep, expenses, journal \}/);
  for (const name of ['createTaskStore', 'createRoutineStore', 'createDailyLifeStore', 'createScheduleStore']) assert.equal((APP.match(new RegExp(`${name}\\(storage\\)`, 'g')) || []).length, 1, `${name} is created once`);
  assert.deepEqual([...COLLECTIONS].filter((c) => /home|water/i.test(c)), [], 'no Home-only or water-only collection');
  // Phase 3 added symptoms + healthNotes (16 → 18); still no Home-only collection (checked above)
  // Phase 4 added familySharing + helpRequests (18 → 20); still no Home-only collection
  // Phase 6 added communityPosts + groupDrafts + meetupDrafts (20 → 23); still no Home-only collection
  assert.equal(COLLECTIONS.length, 23);
});

test('OG-IV-2 "할 일 추가" on Home continues in My Life\'s own task form', () => {
  assert.deepEqual(QUICK_ACTIONS.filter((a) => a.kind === 'action').map((a) => a.id), ['add-event', 'add-task', 'add-medication']);
  assert.ok(QUICK_ACTIONS.length <= 6, 'a short list of shortcuts');
  for (const a of QUICK_ACTIONS.filter((x) => x.kind === 'route')) assert.equal(resolveView(a.href), a.id);
  assert.match(JS['life-view.js'], /tasks: \{ cards: \[tasks\.card\], render: tasks\.render, openAdd: tasks\.openAdd \}/);
  assert.match(APP, /if \(pendingLifeAdd\) \{\s*const target = pendingLifeAdd;\s*pendingLifeAdd = null;\s*life\.openAdd\(target\);/);
  assert.equal(/준비 중|coming soon/i.test(strip(JS['home-explore.js']).slice(strip(JS['home-explore.js']).indexOf('QUICK_ACTIONS'))), false, 'no dead shortcut');
});

/* ───────── cross-view refresh ───────── */

test('OG-IV-3 SPA cross-view refresh: entering Home or My Life re-reads storage; nothing is cached between screens', () => {
  assert.match(APP, /if \(view === 'home'\) refreshHome\(\);/);
  assert.match(APP, /if \(view === 'life'\) showLife\(section, \{ focus: userInitiated && !!section, entered: true \}\);/);
  assert.match(JS['home-view.js'], /for \(const key of Object\.keys\(cards\)\) \{[^}]*cards\[key\]\.card\.status\.textContent = '';\s*cards\[key\]\.render\(\);\s*\}\s*renderSummary\(\);/, 'every Home card and the summary re-render on entry, and stale status lines are cleared');
  assert.match(JS['life-view.js'], /for \(const s of group\.sections\) for \(const card of sections\[s\]\.cards\) card\.status\.textContent = '';/);
  assert.match(JS['life-view.js'], /for \(const s of group\.sections\) sections\[s\]\.render\(\);/, 'the visible tab re-renders on entry and on every tab change');
  /* stores keep no copy of the data: two store objects over one storage always agree */
  const backend = createMemoryBackend();
  const storage = createStorage({ backend });
  const a = { tasks: createTaskStore(storage), routines: createRoutineStore(storage), dailyLife: createDailyLifeStore(storage) };
  const b = { tasks: createTaskStore(storage), routines: createRoutineStore(storage), dailyLife: createDailyLifeStore(storage) };
  const t = a.tasks.add({ title: '한쪽에서 만든 일' }).task;
  assert.equal(b.tasks.get(t.id).title, '한쪽에서 만든 일');
  b.tasks.toggle(t.id);
  assert.equal(a.tasks.get(t.id).completed, true);
  a.dailyLife.update({ water: 4 });
  assert.equal(b.dailyLife.get().water, 4);
  for (const f of ['tasks.js', 'routines.js', 'daily-life.js', 'schedule.js', 'record-store.js', 'sleep.js']) assert.equal(/\blet (cache|items|memo|state)\b/.test(strip(JS[f])), false, `${f} holds no cached copy`);
  /* arriving in My Life starts the day cards on today; moving between its tabs keeps the chosen day */
  assert.match(JS['life-view.js'], /if \(entered\) daily\.resetDate\(\);/);
});

test('OG-IV-4 no listener piles up: global listeners are bound once, screens are built once', () => {
  assert.equal(/(window|document|doc|win)\.addEventListener\(/.test(SCREEN_CODE), false, 'cards never bind to window or document');
  assert.equal((strip(APP).match(/createHomeView\(/g) || []).length, 1);
  assert.equal((strip(APP).match(/createLifeView\(/g) || []).length, 1);
  assert.equal((strip(APP).match(/setInterval\(/g) || []).length, 1);
  const life = strip(JS['life-view.js']);
  assert.equal((life.match(/\bbuild\(\);/g) || []).length, 1, 'My Life is built once; show() only re-renders');
  const show = life.slice(life.indexOf('function show('), life.indexOf('function openAdd('));
  assert.equal(/addEventListener|createCard\(|create\w+Section\(/.test(show), false, 'show() creates no card and binds nothing');
  const home = strip(JS['home-view.js']);
  assert.match(home, /if \(!cards \|\| renderedDay !== dateKey\(now\(\)\)\) \{\s*build\(\);/, 'Home is rebuilt only when the day changes');
  assert.equal((strip(JS['router.js']).match(/addEventListener\('hashchange'/g) || []).length, 1);
  /* re-rendering replaces the nodes that carried the handlers */
  for (const f of ['home-list.js', 'life-daily.js', 'home-today.js']) assert.match(JS[f], /clear\(card\.body\);/, f);
  assert.match(JS['life-daily.js'], /clear\(node\);/, 'the date bar too');
});

/* ───────── deep links ───────── */

// Phase 3: the 건강 tab adds four sections (checkin, symptoms, medication, health-notes) and the tab-name address #life/health.
test('OG-IV-5 deep links: every section and tab has an address', () => {
  for (const s of ['calendar', 'tasks', 'routines', 'meals', 'water', 'exercise', 'sleep', 'expenses', 'journal', 'checkin', 'symptoms', 'medication', 'health-notes']) {
    assert.equal(resolveView(`#life/${s}`), 'life', s);
    assert.equal(sectionOf(`#life/${s}`), s);
    assert.equal(resolveSection(s), s);
    assert.equal(lifeHash(s), `#life/${s}`);
  }
  assert.deepEqual({ ...SECTION_ALIASES }, { plan: 'calendar', daily: 'meals', records: 'expenses', health: 'checkin' });
  assert.deepEqual([resolveSection('health'), groupOf(resolveSection('health')).id], ['checkin', 'health'], '#life/health opens the 건강 tab');
  assert.deepEqual([resolveSection('daily'), groupOf(resolveSection('daily')).id], ['meals', 'daily'], '#life/daily opens the 생활 tab');
  assert.deepEqual([resolveSection('plan'), resolveSection('records'), resolveSection('overview')], ['calendar', 'expenses', 'overview']);
  for (const g of LIFE_GROUPS) for (const s of g.sections) assert.equal(groupOf(s).id, g.id);
  /* every in-app link to My Life points at a real section */
  const links = [...(SCREENS + JS['areas.js'] + INDEX).matchAll(/#life\/([a-z-]+)/g)].map((m) => m[1]);
  assert.ok(links.length >= 5);
  for (const s of links) assert.notEqual(resolveSection(s), '', `#life/${s}`);
  assert.deepEqual([...LIFE_SECTIONS].filter((s) => !LIFE_GROUPS.some((g) => g.sections.includes(s))), []);
});

test('OG-IV-6 deep link fallback: an unknown section shows the summary and the address is corrected', () => {
  for (const bad of ['nope', 'calendar2', 'constructor', '__proto__', 'toString', 'hasOwnProperty', 'CALENDAR', '', undefined, null, 5, 'a/b']) assert.equal(resolveSection(bad), '', String(bad));
  assert.equal(groupOf(resolveSection('nope') || 'overview').id, 'overview');
  assert.deepEqual([sectionOf('#life/<script>'), sectionOf('#life/a/b'), sectionOf('#life/'), sectionOf('#life/%20')], ['', '', '', ''], 'unsafe text never becomes a section');
  assert.match(JS['life-view.js'], /current = resolveSection\(section\) \|\| 'overview';/);
  assert.match(APP, /if \(view === 'life' && section && !resolveSection\(section\)\) win\.history\.replaceState\(null, '', '#life'\);/);
  assert.equal(resolveView('#lifes'), null, 'a hash that is not a route leaves the current view alone');
  assert.equal(resolveView('#life/nope'), 'life');
});

/* ───────── privacy ───────── */

test('OG-IV-7 private and personal records are still not searched, and Home adds no search source', async () => {
  const backend = createMemoryBackend();
  const storage = createStorage({ backend });
  const tasks = createTaskStore(storage);
  const routines = createRoutineStore(storage);
  tasks.add({ title: '홈에보이는비밀할일', dueDate: undefined });
  routines.add({ title: '홈에보이는비밀루틴', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] });
  const search = createSearch();
  search.registerProvider(createAreaProvider(AREAS));
  search.registerProvider(createSavedProvider(createSavedStore(storage)));
  for (const q of ['홈에보이는비밀할일', '홈에보이는비밀루틴', '비밀']) assert.deepEqual((await search.query(q)).results, [], q);
  assert.equal((APP.match(/search\.registerProvider\(/g) || []).length, 4, 'menus, saved items, public care and public 즐길거리 content only');
  // Phase 5: a fourth provider, 즐길거리, searches only PUBLIC enjoy items loaded on that screen (never a personal record).
  assert.match(APP, /search\.registerProvider\(createEnjoyProvider\(\(\) => enjoyView\.items\(\)\)\);/);
  // Phase 4: a third provider, 돌봄·서비스, searches only PUBLIC care items loaded on that screen (never a personal record).
  assert.match(APP, /search\.registerProvider\(createCareProvider\(\(\) => care\.items\(\)\)\);/);
  assert.equal(/registerProvider|createSearch|notifications\.add\(|saved\.save\(\{ type: '(TASK|ROUTINE|JOURNAL|EXPENSE)/.test(SCREEN_CODE), false, 'no screen registers a search source, raises a notification or saves a personal record as a Saved item');
  for (const c of COLLECTIONS) assert.equal(maySearchGlobally(c), c === 'saved', c);
});

// Phase 3: the two new health collections joined HEALTH_ADJACENT; nothing moved between classes and the sync list is unchanged.
test('OG-IV-8 private and personal records are still not synced or shared: the classification is unchanged', () => {
  const by = (cls) => Object.keys(CLASSIFICATION).filter((k) => CLASSIFICATION[k] === cls).sort();
  // Phase 4: the user's family-sharing choices and help-request notes are PRIVATE
  // Phase 6: the user's community posts and group/meetup drafts are PRIVATE too
  assert.deepEqual(by('PRIVATE'), ['communityPosts', 'expenses', 'familySharing', 'groupDrafts', 'helpRequests', 'journal', 'meetupDrafts']);
  assert.deepEqual(by('HEALTH_ADJACENT'), ['checkins', 'healthNotes', 'medicationLogs', 'medications', 'symptoms']);
  assert.deepEqual(by('STANDARD'), ['dailyLife', 'events', 'routineLogs', 'routines', 'sleepRecords', 'tasks']);
  assert.deepEqual([...SYNCABLE_COLLECTIONS], ['profile', 'preferences', 'saved', 'onboarding']);
  assert.deepEqual(COLLECTIONS.filter(isSyncable).sort(), ['onboarding', 'preferences', 'profile', 'saved'], 'what an adapter may actually receive');
  for (const c of COLLECTIONS) if (CLASSIFICATION[c] !== 'APP') assert.equal(maySync(c), false, c);
  assert.equal(familySharingAllowed(), false);
  const storage = createStorage({ backend: createMemoryBackend() });
  const account = createAccount({ storage });
  const pushed = [];
  account.connectSyncAdapter({ id: 't', isConfigured: () => true, push: (c) => pushed.push(c.collection) });
  const tasks = createTaskStore(storage);
  const routines = createRoutineStore(storage);
  const daily = createDailyLifeStore(storage);
  const t = tasks.add({ title: '할 일' }).task;
  tasks.update(t.id, { completed: true });
  const r = routines.add({ title: '루틴', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }).routine;
  routines.setCompleted(r.id, true);
  daily.update({ water: 2, mealSlots: { lunch: true }, exercise: true });
  daily.update({ water: 1 }, '2026-01-01');
  assert.deepEqual(pushed, [], 'what Home now shows is still never handed to a sync adapter');
  createProfileStore(storage).updateProfile({ nickname: 'a' });
  assert.deepEqual(pushed, ['profile']);
  assert.equal(/\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|navigator\.share/.test(SCREEN_CODE), false, 'the screens send nothing anywhere');
});

/* ───────── touch, text size, state in words ───────── */

const rem = (value, tokens) => {
  const v = value.trim();
  const viaToken = /^var\((--[a-z0-9-]+)\)$/.exec(v);
  const raw = viaToken ? tokens[viaToken[1]] : v;
  const m = /^([0-9.]+)rem$/.exec(raw || '');
  return m ? Number(m[1]) : NaN;
};
const TOKENS = Object.fromEntries([...CSS['ongil-tokens.css'].matchAll(/(--og-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
/* the declarations of the first rule whose selector list contains `selector` exactly */
function rule(selector) {
  for (const f of CSS_FILES) {
    for (const m of CSS[f].replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (m[1].split(',').map((s) => s.trim()).includes(selector)) return m[2];
    }
  }
  return null;
}

test('OG-IV-9 touch targets: every control of Home and My Life is at least 44px (2.75rem) tall', () => {
  assert.equal(rem('var(--og-control)', TOKENS), 2.75, 'the shared control height is 44px');
  assert.ok(rem('var(--og-input)', TOKENS) >= 2.75);
  const minHeight = (selector) => {
    const body = rule(selector);
    assert.ok(body, `${selector} has a rule`);
    const m = /(?:min-height|(?<![-\w])height):\s*([^;]+);/.exec(body);
    assert.ok(m, `${selector} sets a height`);
    return rem(m[1], TOKENS);
  };
  for (const selector of ['.og-btn', '.og-pick', '.og-tab', '.og-cal__day', '.og-stepper__btn', '.og-quick__item', '.og-linkchip', '.og-home-item__label', '.og-choice', '.og-filter', '.og-input', '.og-daynav__btn', '.og-life-days__pick', '.og-home-more__link']) {
    assert.ok(minHeight(selector) >= 2.75, `${selector} is ${minHeight(selector)}rem`);
  }
  /* the narrow-screen calendar day is the smallest control; it must still be 44px */
  const phone = /@media \(max-width: 480px\) \{[\s\S]*?\.og-cal__day \{ min-height: ([0-9.]+)rem/.exec(CSS['ongil-life.css']);
  assert.ok(Number(phone[1]) >= 2.75, 'calendar day on a phone');
  /* the checkbox is small, but its label (same row) is a full-height target */
  assert.match(JS['home-list.js'], /el\('label', \{ for: checkId, class: 'og-home-item__label' \}/);
  /* new controls use the shared button and choice components, not bare elements */
  assert.match(JS['life-daily.js'], /class: 'og-btn og-btn--ghost og-daynav__btn'/);
  assert.match(JS['life-daily.js'], /class: 'og-stepper__btn', 'data-og-life-water': 'minus'/);
  assert.match(JS['home-today.js'], /class: 'og-btn og-btn--ghost', 'data-og-home-add': 'task'/);
});

test('OG-IV-10 body text size: nothing people read in ONGIL is under 16px (1rem)', () => {
  assert.equal(rem('var(--og-size-body)', TOKENS), 1);
  /* labels and glyphs that are not sentences; everything else must be 1rem or more */
  const allowed = {
    '.og-label': 'the short capital label above a heading (MY LIFE)',
    '.og-band .og-label, .og-page .og-label': 'the same label inside a band or page',
    '.gnav--ongil .gnav__link': 'the site header menu, sized by the shared header',
    '.og-pick__mark': 'the tick glyph inside a choice',
    '.og-panel__title': 'the caption of the search / notification panel',
    '.og-panel__group': 'the group caption inside a panel',
    '.og-chip p, .og-card li, .og-card__lead': 'legacy shell rule; ONGIL chips override it to body size (checked below)',
  };
  const small = [];
  for (const f of CSS_FILES) {
    for (const m of CSS[f].replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const size = /font-size:\s*([^;]+);/.exec(m[2]);
      if (!size) continue;
      const value = size[1].trim();
      const px = /^([0-9.]+)px$/.exec(value);
      const r = /^([0-9.]+)rem$/.exec(value);
      const clamp = /^clamp\(([0-9.]+)rem/.exec(value);
      const smallest = px ? Number(px[1]) / 16 : r ? Number(r[1]) : clamp ? Number(clamp[1]) : value.startsWith('var(') ? rem(value, TOKENS) : 1;
      if (smallest < 1) small.push(m[1].trim());
    }
  }
  assert.deepEqual(small.filter((s) => !(s in allowed)), [], 'a text rule under 1rem that is not on the short list of labels');
  for (const s of Object.keys(allowed)) assert.ok(small.includes(s), `${s} is still the exception it is listed as`);
  assert.match(CSS['ongil-app.css'], /\.og-band \.og-chip--slot p \{ font-size: var\(--og-size-body\);/);
  /* the texts this phase raised to 16px: notes, form hints, type lines, progress, search result descriptions */
  for (const [f, selector] of [['ongil-home.css', '.og-band .og-home-note'], ['ongil-app.css', '.og-field__hint'], ['ongil-app.css', '.og-item__type'], ['ongil-app.css', '.og-dialog__progress'], ['ongil-shell.css', '.og-panel__note'], ['ongil-shell.css', '.og-panel__result-desc']]) {
    assert.match(CSS[f], new RegExp(`${selector.replace(/[.]/g, '\\.')} \\{[^}]*font-size: 1rem;`), selector);
  }
  for (const selector of ['.og-home-empty', '.og-home-summary__item', '.og-home-more__link', '.og-band .og-daynav__date', '.og-band .og-home-count']) assert.ok(rem(/font-size:\s*([^;]+);/.exec(rule(selector))[1], TOKENS) >= 1, selector);
  assert.equal(/font-weight:\s*(100|200|300)\b/.test(CSS['ongil-app.css'] + CSS['ongil-home.css'] + CSS['ongil-life.css']), false, 'no thin text in the ONGIL screens');
});

test('OG-IV-11 screen-reader review (static): names, live regions and states said in words', () => {
  /* landmarks and headings */
  assert.match(INDEX, /<main class="og" id="og-main" tabindex="-1">/);
  assert.match(INDEX, /<section class="og-band" data-og-modules="home" aria-labelledby="og-home-section-title">/);
  assert.match(INDEX, /<section class="og-band" data-og-modules="life" aria-labelledby="og-life-section-title">/);
  assert.match(JS['home-ui.js'], /'aria-labelledby': titleId/, 'every card is a named region');
  /* status lines */
  assert.match(JS['home-ui.js'], /role: 'status', 'aria-live': 'polite'/);
  assert.match(JS['life-daily.js'], /class: 'og-daynav__date', tabindex: '-1', 'aria-live': 'polite'/, 'the chosen day is announced when it changes');
  /* completed / chosen states are carried by attributes and words, not by colour */
  assert.match(JS['home-list.js'], /type: 'checkbox',\s*id: checkId,\s*class: 'og-home-item__check',\s*checked: done,/, 'task and routine completion is a real checkbox');
  assert.match(JS['home-list.js'], /done \? el\('span', \{ class: 'og-home-item__done', text: ` \(\$\{config\.doneWord\}\)` \}\) : null/);
  assert.match(JS['home-ui.js'], /'aria-pressed': pressed \? 'true' : 'false'/, 'check-in, meals and exercise choices');
  assert.match(JS['life-daily.js'], /'aria-pressed': d === chosen \? 'true' : 'false', 'aria-label': `\$\{name\} 기록 보기`/);
  assert.match(CSS['ongil-life.css'], /\.og-life-days__pick\[aria-pressed="true"\]::after \{ content: " ✓";/);
  assert.match(JS['life-view.js'], /tabs\[g\.id\]\.setAttribute\('aria-selected', on \? 'true' : 'false'\);/);
  for (const text of ['끝낸 일로 표시했습니다', '오늘 한 루틴으로 표시했습니다', '표시를 풀었습니다', '마신 물을 ${value}잔으로 적었습니다']) assert.ok(SCREENS.includes(text), text);
  /* named groups and buttons */
  for (const label of ["'오늘 남은 것'", "'기록할 날짜'", "'이전 날로'", "'다음 날로'", "'오늘로 돌아가기'", "'물 한 잔 빼기'", "'물 한 잔 더하기'", "'최근 7일 기록'", "'오늘까지 할 일'", "'오늘 루틴'"]) assert.ok(SCREENS.includes(label), label);
  /* a button that becomes unavailable hands focus to the date instead of dropping it */
  assert.match(JS['life-daily.js'], /if \(target && !target\.disabled\) target\.focus\(\);\s*else label\.focus\(\);/);
  /* dialogs: a native modal dialog (focus is trapped by the browser), named, and focus returns */
  assert.match(INDEX, /<dialog[^>]*id="og-onboarding"[^>]*aria-labelledby=/);
  assert.match(JS['onboarding-view.js'], /showModal\(\)/);
  assert.match(JS['onboarding-view.js'], /document\.contains\(target\)\) target\.focus\(\)/, 'focus returns to what opened the dialog');
  assert.match(JS['panels.js'], /if \(wasOpen && restoreFocus\) btn\.focus\(\);/);
  assert.match(JS['panels.js'], /aria-expanded/);
  assert.match(JS['panels.js'], /Escape/);
});

/* ───────── honest copy ───────── */

test('OG-IV-12 no false health or safety claim, no fixed amount to drink, no score — in any Home or My Life text', () => {
  const banned = ['안전합니다', '안전해요', '이상이 없습니다', '이상 없음', '건강합니다', '건강해요', '건강 상태', '건강 점수', '정상입니다', '안심하세요', '권장량', '권장', '하루 8잔', '8잔', '2리터', '수분 부족', '탈수', '마셔야', '드셔야', '목표 달성', '목표량', '달성률', '점입니다', '점수는', '오늘의 점수', '연속 ', '칼로리', 'kcal', '수면 부족', '운동이 부족', '잘하셨', '훌륭', '가족에게 알렸', '알림을 보냈', '진단', '처방'];
  for (const phrase of banned) assert.equal(SCREEN_CODE.includes(phrase), false, phrase);
  assert.equal(/\bscore\b|\bgrade\b|\bstreak\b|\bgoal\b|\btarget(Water|Meals|Minutes)\b|percent/i.test(SCREEN_CODE), false);
  assert.match(JS['life-daily.js'], /직접 적는 잔 수입니다\. 마실 양을 정해 주거나 평가하지 않습니다\./);
  assert.match(JS['home-view.js'], /`\$\{parts\[k\]\.left\}개 남음`/, 'the summary is a count');
  /* nothing is created for the user, on Home or in My Life */
  assert.equal(/\.(add|save|set|update|setCompleted|setTaken)\(/.test(strip(JS['home-view.js'])), false, 'Home view only reads');
  assert.equal(/tasks\.add\(|routines\.add\(|routines\.update\(|tasks\.remove\(|routines\.remove\(/.test(strip(JS['home-today.js'])), false, 'Home never makes, edits or deletes a task or routine');
  assert.deepEqual(HOME_LEVELS.flatMap((r) => r.slots).filter((s) => /score|rank|badge/.test(s)), []);
});
