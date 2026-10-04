// ONGIL Phase 3 — Health + Check-in V1: screens (static review of the sources), copy, accessibility rules, wiring.
// The browser QA (390 / 820 / 1440, real clicks) is recorded in docs/ongil/PHASE_3_HEALTH_CHECKIN_V1.md;
// these tests pin the rules that QA checked so they cannot silently regress.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIFE_SECTIONS, LIFE_GROUPS, DATED_GROUPS, resolveSection, groupOf } from '../../ongil-start/js/life-view.js';
import { QUICK_ACTIONS } from '../../ongil-start/js/home-explore.js';
import { HOME_LEVELS } from '../../ongil-start/js/home-view.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { LIFE_LIMITS } from '../../ongil-start/js/life-contracts.js';
import { HEALTH_SAFETY_NOTE } from '../../ongil-start/js/life-health.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const JS_DIR = path.join(ROOT, 'ongil-start', 'js');
const JS = Object.fromEntries(fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).map((f) => [f, read('js', f)]));
const HEALTH_FILES = ['life-health.js', 'checkin.js', 'symptoms.js', 'health-notes.js', 'medication.js'];
const HEALTH = HEALTH_FILES.map((f) => JS[f]).join('\n');
const HEALTH_CODE = strip(HEALTH);
const SCREEN = strip(JS['life-health.js']);
const CSS = ['ongil-tokens.css', 'ongil-shell.css', 'ongil-app.css', 'ongil-home.css', 'ongil-life.css'].map((f) => read('styles', f)).join('\n');
const APP = JS['app.js'];
/* every quoted Korean string the health screens and Home can show */
const strings = (code) => [...code.matchAll(/(['`])((?:(?!\1)[^\\\n]|\\.)*[가-힣](?:(?!\1)[^\\\n]|\\.)*)\1/g)].map((m) => m[2]);
const HEALTH_COPY = strings(strip(JS['life-health.js'] + JS['life-contracts.js'] + JS['home-today.js'] + JS['home-view.js'] + JS['areas.js']));

test('OG-HL-32 accessibility: named groups, pressed state with a tick, labelled fields, alert errors, confirmed deletes, date semantics', () => {
  /* single and multiple choices are buttons in a group named by a visible heading; the state is aria-pressed + ✓ (not colour) */
  assert.match(SCREEN, /'div',\s*\{ class: 'og-picks', role: 'group', 'aria-labelledby': id \}/);
  assert.match(SCREEN, /'div',\s*\{ class: 'og-picks', role: 'group', 'aria-labelledby': listId \}/);
  assert.match(JS['home-ui.js'], /'aria-pressed': pressed \? 'true' : 'false'[\s\S]*text: pressed \? '✓' : ''/);
  assert.equal((SCREEN.match(/choiceButton\(/g) || []).length >= 2, true);
  /* every text field comes from makeField (label for=, optional marker, hint by aria-describedby); the weekday set is a fieldset + legend */
  assert.equal(/el\('input'/.test(SCREEN), false, 'no unlabelled input built by hand');
  assert.match(JS['home-ui.js'], /el\('label', \{ class: 'og-field__label', for: id \}/);
  assert.match(JS['home-ui.js'], /el\('fieldset', \{ class: 'og-choices'[^]*el\('legend'/);
  assert.match(SCREEN, /type: 'days', required: false, options: DAY_OPTIONS/);
  /* errors are announced and the field is marked */
  assert.ok((SCREEN.match(/role: 'alert'/g) || []).length >= 3);
  assert.ok((SCREEN.match(/setAttribute\('aria-invalid', 'true'\)/g) || []).length >= 3);
  /* deleting a day always asks first; the opener says whether the question is open and gets focus back */
  assert.match(SCREEN, /'aria-expanded': 'false'/);
  assert.match(SCREEN, /open\.setAttribute\('aria-expanded', 'false'\);\s*open\.focus\(\);/);
  assert.equal(/window\.confirm|[^.\w]confirm\(/.test(HEALTH_CODE), false);
  /* dates: the chosen day in the history is aria-pressed AND aria-current="date"; buttons read the full date ("10월 2일 금요일") */
  assert.match(SCREEN, /'aria-pressed': d === chosen \? 'true' : 'false', 'aria-current': d === chosen \? 'date' : null, 'aria-label': `\$\{name\} 건강 기록 보기`/);
  assert.match(SCREEN, /const name = d === today \? `\$\{formatDateKey\(d\)\} \(오늘\)` : formatDateKey\(d\);/);
  assert.match(JS['life-daily.js'], /'aria-live': 'polite', 'data-og-daynav': 'date'/);
  /* the date field is bounded the same way as the date bar */
  assert.match(SCREEN, /field\.input\.setAttribute\('min', oldest\);\s*field\.input\.setAttribute\('max', today\);/);
  /* status lines and focus after each change */
  assert.match(SCREEN, /function refocus\(root, selector\)/);
  assert.ok((SCREEN.match(/card\.say\(/g) || []).length >= 4, 'every change is announced on the card status line');
  /* touch targets: picks, buttons, tabs and date-bar buttons keep their 44px+ rules */
  assert.match(CSS, /\.og-pick \{[^}]*min-height: 3rem/);
  assert.match(CSS, /\.og-tab \{[^}]*min-height: 3\.25rem/);
  assert.match(CSS, /\.og-daynav__btn \{ min-height: 3rem; \}/);
});

test('OG-HL-33 390 responsive rules: five tabs in equal columns, date bar on two lines, long words wrap', () => {
  assert.match(CSS, /\.og-tabs \{ display: grid; grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(CSS, /@media \(max-width: 700px\) \{[\s\S]*\.og-tab \{ font-size: 1\.1rem; padding-inline: 0\.2rem; \}/);
  assert.match(CSS, /@media \(max-width: 700px\) \{[\s\S]*\.og-daynav \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); \}/);
  assert.match(CSS, /\.og-home-card__body > \* \{ min-width: 0; \}/);
  assert.match(CSS, /\.og-home-item__text \{[^}]*overflow-wrap: anywhere/);
  assert.equal(LIFE_GROUPS.every((g) => g.label.length <= 2), true, 'tab names stay short enough for a phone');
});

test('OG-HL-34 820 responsive rules: the 건강 tab uses the same card grid and panel width as the other tabs', () => {
  assert.match(CSS, /\.og-life-panel \{ display: grid; gap: 1rem; max-width: 60rem; \}/);
  assert.match(JS['life-view.js'], /el\('div', \{ class: 'og-life-panel', role: 'tabpanel'/);
  assert.equal(/@media[^{]*\{[^}]*og-health[^}]*width:\s*\d{3,}px/.test(CSS), false, 'no fixed pixel width for health cards');
  assert.equal(/style:\s*['`]/.test(SCREEN), false, 'no inline layout in the health screen');
});

test('OG-HL-35 1440 responsive rules: tabs and notices keep a readable measure on a wide screen', () => {
  assert.match(CSS, /\.og-tabs \{[^}]*max-width: 48rem/);
  assert.match(CSS, /\.og-notice \{[^}]*max-width: 46rem/);
  assert.match(CSS, /\.og-health-intro \{ margin: 0; \}/);
});

test('OG-HL-36 empty states: each health card says plainly that nothing is written — no sample record', () => {
  for (const text of ['적어 둔 상태가 없어요.', '적어 둔 증상이 없어요.', '적어 둔 약이 없어요.', '남긴 건강 메모가 없어요.', '적은 내용 없음']) assert.ok(JS['life-health.js'].includes(text), text);
  assert.match(SCREEN, /'data-og-health-empty': 'checkin'/);
  assert.match(SCREEN, /'data-og-health-empty': 'symptoms'/);
  /* no store or screen seeds a record: every add/save in the health files is driven by a user action or argument */
  assert.equal(/\.(add|save|setTaken)\(\{ ?(name|text|symptoms|status): ?'[가-힣]/.test(HEALTH_CODE + strip(APP)), false, 'no sample data');
  assert.match(JS['home-today.js'], /emptyText: \(\) => \(medication\.count\(\) \? '오늘 먹을 약으로 적어 둔 것이 없어요\.' : '적어 둔 약이 없어요\.'\)/);
});

test('OG-HL-37 long text: every free text is bounded and wraps', () => {
  assert.deepEqual([LIFE_LIMITS.medicationName, LIFE_LIMITS.checkinMemo, LIFE_LIMITS.symptomOther, LIFE_LIMITS.symptomNote, LIFE_LIMITS.healthNoteText], [40, 200, 40, 200, 300]);
  for (const key of ['checkinMemo', 'symptomOther', 'symptomNote', 'healthNoteText', 'medicationName']) assert.ok(SCREEN.includes(`LIFE_LIMITS.${key}`), key);
  assert.match(CSS, /\.og-home-item__title \{[^}]*overflow-wrap: anywhere|\.og-home-item__title[^{]*\{[^}]*overflow-wrap/);
  assert.match(CSS, /\.og-life-days__text \{[^}]*overflow-wrap: anywhere/);
  assert.match(CSS, /\.og-daynav__date \{[^}]*overflow-wrap: anywhere/);
});

test('OG-HL-38 no medical diagnosis copy: no diagnosis, illness, risk, treatment, medicine or dose advice, no doctor substitute', () => {
  /* the only sentences allowed to name these words are the ones that say ONGIL does NOT do it */
  const NEGATIONS = [HEALTH_SAFETY_NOTE, '복용량이나 약에 대해 조언하지 않습니다', '약이나 복용량을 정하거나 권하지 않습니다', '증상을 판단하거나 원인을 짐작하지 않습니다', '의료 진단이나 치료 판단을 대신하지 않습니다', '점수를 매기지 않습니다'];
  const FORBIDDEN = /진단|질병|병명|위험|확률|가능성|치료|처방|복용량|용량|추천|권장|권합니다|의사 대신|응급|위급합니다|위험합니다|건강 점수|건강점수|등급/;
  const bad = HEALTH_COPY.filter((s) => FORBIDDEN.test(NEGATIONS.reduce((t, n) => t.split(n).join(''), s)));
  assert.deepEqual(bad.filter((s) => !/119에 직접 전화/.test(s)), [], 'every remaining health sentence is free of medical judgement');
  assert.equal(HEALTH_SAFETY_NOTE, 'ONGIL의 건강 기록은 생활 기록을 위한 기능이며 의료 진단을 대신하지 않습니다.');
  assert.equal((JS['life-health.js'].match(/HEALTH_SAFETY_NOTE/g) || []).length, 2, 'the safety note is defined once and shown once, not on every card');
  /* a missed medication is a fact, never a warning */
  assert.ok(JS['life-health.js'].includes("'아직 복용하지 않았어요'"));
  /* no emergency prompt on symptoms: the 119 line exists only where it already was (Home "help" and the 건강·안부 notice) */
  assert.equal(/119/.test(strip(JS['life-health.js'])), false);
  assert.equal(/diagnos|triage|emergencyCall|autoCall|riskScore|severityScore/i.test(HEALTH_CODE), false);
});

test('OG-HL-39 no fake health score: nothing is computed into a score, grade, percent or verdict', () => {
  assert.equal(/score|grade|percent|risk|rating|average|Math\.round|toFixed/i.test(HEALTH_CODE), false);
  /* "점수를 매기지 않습니다" / "점수를 매기거나 평가하지 않습니다" (statements that nothing is scored) are the only places the word may appear */
  assert.deepEqual(HEALTH_COPY.filter((t) => /점수|등급|%|양호|나쁨/.test(t.split('점수를 매기지 않습니다').join('').split('점수를 매기거나 평가하지 않습니다').join(''))), []);
  /* Home only says written / not yet for the check-in */
  const summary = strip(JS['home-view.js']);
  assert.match(summary, /text: record \? '남겼어요' : '아직 남기지 않았어요'/);
  assert.equal(/record\.(status|body|energy|pain)/.test(summary), false, 'Home never reads how the user felt into the summary');
  /* My Life's summary does not read health stores at all */
  assert.equal(/checkIn|symptoms|healthNotes|medication/.test(strip(JS['life-view.js']).slice(strip(JS['life-view.js']).indexOf('export function buildOverview'), strip(JS['life-view.js']).indexOf('export function createLifeView'))), false);
});

test('OG-HL-40 regression: wiring, routes, Home layout, quick actions, search, sync, notifications and network unchanged', () => {
  /* 건강 tab: four sections, one alias, shares the date bar */
  assert.deepEqual(LIFE_GROUPS.find((g) => g.id === 'health').sections, ['checkin', 'symptoms', 'medication', 'health-notes', 'measures']);
  assert.deepEqual([...DATED_GROUPS], ['daily', 'health']);
  assert.equal(groupOf(resolveSection('health')).id, 'health');
  assert.ok(LIFE_SECTIONS.includes('health-notes'));
  assert.match(JS['life-view.js'], /if \(group\.id === 'health'\) panels\.health\.querySelector\('\[data-og-daynav-slot\]'\)\.append\(daily\.nav\.node\);/);
  assert.match(JS['life-view.js'], /getDate: daily\.nav\.date/);
  assert.match(JS['life-daily.js'], /if \(typeof onDateChange === 'function'\) onDateChange\(\);/);
  /* one store object per kind, shared by Home and 내 생활 */
  for (const name of ['createCheckInStore', 'createMedicationStore', 'createSymptomStore', 'createHealthNoteStore']) assert.equal((APP.match(new RegExp(`${name}\\(storage\\)`, 'g')) || []).length, 1, name);
  assert.match(APP, /health: \{ checkIn, symptoms, medication, healthNotes, healthMeasures \}/);
  assert.match(APP, /stores: \{ profile, checkIn, schedule, medication, dailyLife, tasks, routines, saved, familyConnection: onboarding\.familyConnection \}/);
  /* Home: same rows, same six shortcuts, check-in and medication link into 건강 */
  assert.deepEqual(HOME_LEVELS.map((r) => r.slots.join(',')), ['check-in,schedule', 'tasks,routines', 'medication,life-check', 'family-update,today', 'nearby,quick-actions']);
  assert.equal(QUICK_ACTIONS.length, 6);
  assert.match(JS['home-today.js'], /moreLinks\(\[\{ label: '몸 상태·증상도 적기', href: '#life\/checkin' \}\]\)/);
  assert.match(JS['home-today.js'], /href: '#life\/medication'/);
  assert.match(JS['home-view.js'], /'check-in': createCheckInCard\(\{ checkIn, onChange: renderSummary \}\)/);
  /* search still has two providers; no health provider was registered */
  // Phase 4: + public care provider (3); no health provider
  // Phase 5: + public 즐길거리 provider (4); still no health provider
  // Phase 7: the fifth provider is public product information loaded on the 스토어 screen (createStoreProvider).
  assert.equal((APP.match(/search\.registerProvider\(/g) || []).length, 5);
  assert.equal(/registerProvider\(create(Health|Symptom|CheckIn|Medication)/.test(APP), false);
  /* nothing in the health files talks to a network, schedules an OS notification or touches family */
  assert.equal(/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|new Notification|Notification\.requestPermission|serviceWorker|setTimeout|setInterval/.test(HEALTH_CODE), false);
  assert.equal(/family|Family/.test(HEALTH_CODE.replace(/sharedWithFamily: false/g, '')), false);
  /* onboarding has no new health step */
  assert.equal(/symptom|healthNote|증상/.test(JS['onboarding.js'] + JS['onboarding-view.js']), false);
  /* the 건강·안부 area points to 내 생활 › 건강 and keeps its notice */
  const health = AREAS.find((a) => a.id === 'health');
  assert.equal(health.link.href, '#life/checkin');
  assert.match(health.notice, /의료 진단이나 치료 판단을 대신하지 않습니다/);
  assert.match(JS['views.js'], /if \(area\.link\) primary\.append/);
  /* the erase copy names the new records */
  // Phase 4 extended the same sentence with the family records
  assert.match(JS['account-view.js'], /증상과 건강 메모, 가족 공유 설정과 도움 요청도 함께 지웁니다/);
  /* no markup strings */
  assert.equal(/innerHTML|outerHTML|insertAdjacentHTML/.test(HEALTH_CODE), false);
});
