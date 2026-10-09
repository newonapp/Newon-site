// ONGIL Responsive + Accessibility Hardening (RH1) — large text (200%) on a narrow phone (320 / 390px).
// What was wrong: the calendar's 월·주·일 picker, the 이전/다음 rows (calendar and 생활비) and the date field next to the
// 건강 date bar could not wrap or shrink, so their cards grew wider than the page; the page clips sideways, so the
// controls on the right could not be reached. The fix is layout-only CSS at the end of ongil-life.css.
// These tests pin the rules and redo the layout arithmetic from the stylesheets' own numbers. The measured browser
// matrix (Chromium, 320 … 1440px, 100% and 200% text) is recorded in docs/ongil/ONGIL_RESPONSIVE_HARDENING_V1.md.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classOf, maySync, maySearchGlobally } from '../../ongil-start/js/privacy.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const LIFE = read('styles', 'ongil-life.css');
const HOME = read('styles', 'ongil-home.css');
const TOKENS = read('styles', 'ongil-tokens.css');
const INDEX = read('index.html');
const MARK = '/* [RH1] Responsive + accessibility hardening';
const RH = LIFE.slice(LIFE.indexOf(MARK));
const BEFORE = LIFE.slice(0, LIFE.indexOf(MARK));
const RULES = RH.replace(/\/\*[\s\S]*?\*\//g, ''); /* the block without its comments */
const block = (re) => { const m = re.exec(RULES); assert.ok(m, `missing ${re}`); return m[1]; };
const CAL = block(/\.og-cal \{ container-type: inline-size; \}\s*@container \(max-width: [0-9.]+rem\) \{([\s\S]*?)\n\}/);
const CAL_AT = Number(/\.og-cal \{ container-type: inline-size; \}\s*@container \(max-width: ([0-9.]+)rem\)/.exec(RULES)[1]);

/* the page's own numbers, read from the stylesheets (rem) */
const GUTTER = Number(/--og-wrap: min\(1180px, calc\(100% - ([0-9.]+)rem\)\)/.exec(TOKENS)[1]) / 2; /* each side */
const CARD_PAD = Number(/@media \(max-width: 480px\) \{\s*\.og-home-card, \.og-home-card--l1 \{ padding: [0-9.]+rem ([0-9.]+)rem; \}/.exec(HOME)[1]);
const BLEED = /@media \(max-width: 380px\) \{\n {2}\.og-home-card\[data-og-slot="life\.calendar"\] \{ margin-inline: calc\(-([0-9.]+)rem \+ ([0-9.]+)px\); \}/.exec(BEFORE);
/* widths in px for a viewport and a root font size (16 = ordinary text, 32 = 200%) */
function calendarCard(viewport, root) {
  const bleeds = viewport <= 380; /* the px media query does not depend on text size */
  const card = bleeds ? viewport - 2 * Number(BLEED[2]) : viewport - 2 * GUTTER * root;
  return { card, inner: card - 2 * CARD_PAD * root, innerRem: (card - 2 * CARD_PAD * root) / root };
}
const plainCard = (viewport, root) => { const card = viewport - 2 * GUTTER * root; return { card, inner: card - 2 * CARD_PAD * root, innerRem: (card - 2 * CARD_PAD * root) / root }; };

test('RH1-01 the hardening is one appended block: every earlier rule of ongil-life.css is still there, unchanged', () => {
  assert.ok(LIFE.includes(MARK));
  assert.equal(LIFE.split(MARK).length, 2, 'one block');
  assert.ok(LIFE.endsWith(RH));
  for (const kept of [
    '.og-cal__nav { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }',
    '.og-cal__grid { width: 100%; border-collapse: separate; border-spacing: 2px; table-layout: fixed; }',
    '.og-cal__view-picks { flex-wrap: nowrap; width: 100%; max-width: 24rem; }',
    '.og-daynav { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto;',
    '.og-tabs { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));',
    '.og-input[type="date"] { max-width: 14rem; color-scheme: dark; }',
  ]) assert.ok(BEFORE.includes(kept), kept);
  for (const f of ['ongil-tokens.css', 'ongil-shell.css', 'ongil-app.css', 'ongil-home.css', 'ongil-care.css']) assert.equal(read('styles', f).includes('[RH1]'), false, `${f} is not touched`);
  assert.equal(GUTTER, 1);
  assert.equal(CARD_PAD, 1.1);
  assert.deepEqual([BLEED[1], BLEED[2]], ['1', '4']);
});

test('RH1-02 calendar at 320px + 200% text: the picker, the month row and the grid stay inside the card', () => {
  const c = calendarCard(320, 32);
  assert.equal(c.card, 312);
  assert.ok(c.innerRem < CAL_AT, `the card is ${c.innerRem.toFixed(2)}rem wide inside: the narrow-card rules apply`);
  /* 월 · 주 · 일 may take more than one row, and none is squeezed under its label */
  assert.match(CAL, /\.og-cal__view-picks \{ flex-wrap: wrap; \}/);
  assert.match(CAL, /\.og-cal__view-picks \.og-pick \{ min-width: min-content; \}/);
  /* the month on its own line; 이전 / 다음 under it, each wide enough for its label, wrapping when two do not fit */
  assert.match(CAL, /\.og-cal__nav \{ flex-wrap: wrap; \}/);
  assert.match(CAL, /\.og-band \.og-cal__month \{ order: -1; flex: 1 1 100%; \}/);
  const basis = Number(/\.og-cal__nav \.og-btn \{ flex: 1 1 ([0-9.]+)rem; \}/.exec(CAL)[1]);
  assert.ok(basis * 32 <= c.inner, 'one button fits a row');
  assert.ok(2 * basis * 32 + 0.5 * 32 > c.inner, 'two do not: they go one under the other rather than off the card');
  /* the month grid uses the card's padding: seven columns across the whole card, each at least 44px */
  const g = /\.og-cal__grid \{ width: calc\(100% \+ ([0-9.]+)rem\); margin-inline: -([0-9.]+)rem; \}/.exec(CAL);
  assert.deepEqual([Number(g[1]), Number(g[2])], [2 * CARD_PAD, CARD_PAD], 'exactly the padding: the grid never leaves the card');
  const grid = c.inner + Number(g[1]) * 32;
  assert.equal(Math.round(grid), c.card);
  assert.ok(grid <= 320, 'inside the page');
  assert.ok(grid / 7 >= 44, `each day is ${(grid / 7).toFixed(1)}px wide`);
  /* two digits at the day's font size fit a cell (digits are about 0.6em wide) */
  const dayFont = Number(/@media \(max-width: 480px\) \{[\s\S]*?\.og-cal__day \{ min-height: [0-9.]+rem; font-size: ([0-9.]+)rem;/.exec(BEFORE)[1]) * 32;
  assert.ok(2 * 0.6 * dayFont <= grid / 7, 'a two-digit date fits its cell');
});

test('RH1-03 calendar at 390px + 200% text: the same rules apply and every day is still a 44px target', () => {
  const c = calendarCard(390, 32);
  assert.equal(c.card, 390 - 64);
  assert.ok(c.innerRem < CAL_AT);
  const grid = c.inner + 2 * CARD_PAD * 32;
  assert.equal(Math.round(grid), c.card);
  const spacing = Number(/@media \(max-width: 480px\) \{\s*\.og-cal__grid \{ border-spacing: ([0-9.]+)px; \}/.exec(BEFORE)[1]);
  assert.ok((grid - 8 * spacing) / 7 >= 44, `each day is ${((grid - 8 * spacing) / 7).toFixed(1)}px wide`);
  assert.ok(grid + 2 * GUTTER * 32 <= 390);
  /* week and day views live in the same card: the same picker and row rules cover them (one .og-cal per card) */
  const plan = read('js', 'life-plan.js');
  assert.match(plan, /class: 'og-picks og-cal__view-picks'/);
  assert.match(plan, /month: \['이전 달', '다음 달'\], week: \['이전 주', '다음 주'\], day: \['이전 날', '다음 날'\]/);
});

test('RH1-04 ordinary text is not affected: at 320 … 1440px the narrow-card rules do not apply', () => {
  for (const vp of [320, 390]) assert.ok(calendarCard(vp, 16).innerRem > CAL_AT, `${vp}px: ${calendarCard(vp, 16).innerRem.toFixed(1)}rem`);
  for (const vp of [320, 390]) assert.ok(plainCard(vp, 16).innerRem > CAL_AT, `생활비 card at ${vp}px`);
  for (const vp of [768, 1024, 1440]) assert.ok((Math.min(vp - 2 * GUTTER * 16, 60 * 16) - 2 * 1.4 * 16) / 16 > CAL_AT, `${vp}px`);
  /* and with 200% text on a wide screen the card is wide again */
  assert.ok((Math.min(1440 - 64, 60 * 32) - 2 * 1.4 * 32) / 32 > CAL_AT);
  /* outside the container query the block only lets things wrap or shrink — it sets no size, colour or font */
  const outside = RULES.replace(/@container[^{]*\{[\s\S]*?\n\}/g, '').replace(/@media[^{]*\{[\s\S]*?\n\}/g, '');
  for (const decl of outside.match(/[a-z-]+: [^;{}]+;/g)) assert.match(decl, /^(container-type|word-break|overflow-wrap|grid-template-columns|min-width|flex-wrap|max-width|white-space|text-align): /, decl);
});

test('RH1-05 생활비 at 320px + 200% text: the month controls wrap inside the card; nothing about the data changes', () => {
  const c = plainCard(320, 32);
  assert.ok(c.innerRem < CAL_AT);
  const rec = read('js', 'life-records.js');
  /* the controls are the same three elements in the same order, inside the same .og-cal the rules are scoped to */
  assert.match(rec, /\{ class: 'og-cal' \},\s*el\(\s*'div',\s*\{ class: 'og-cal__nav' \},\s*el\('button', \{[^}]*'data-og-expense-nav': 'prev', text: '이전 달'[\s\S]*?class: 'og-cal__month'[\s\S]*?'data-og-expense-nav': 'next', text: '다음 달'/);
  const basis = Number(/\.og-cal__nav \.og-btn \{ flex: 1 1 ([0-9.]+)rem; \}/.exec(CAL)[1]);
  assert.ok(basis * 32 <= c.inner, 'a month button fits the card');
  /* the total (“합계 1,234,567원 · 1건”) breaks between words, and a long amount is cut rather than pushed off the card */
  assert.match(RULES, /\.og-band \.og-cal__month, \.og-band \.og-cal__selected, \.og-band \.og-life-value \{ word-break: keep-all; overflow-wrap: anywhere; \}/);
  assert.match(rec, /class: 'og-life-value', 'data-og-expense-total'/);
  /* a row's 고치기 · 지우기 may wrap */
  assert.match(RULES, /\.og-home-item__actions \{ flex-wrap: wrap; max-width: 100%; \}/);
  /* privacy is where it was: expenses are PRIVATE, never synced or searched, and the note still says so */
  assert.equal(classOf('expenses'), 'PRIVATE');
  assert.equal(maySync('expenses'), false);
  assert.equal(maySearchGlobally('expenses'), false);
  assert.match(rec, /note: `\$\{PRIVATE_NOTE\} 쓴 돈을 평가하거나 조언하지 않습니다\.`/);
  assert.doesNotMatch(RH, /content:|attr\(/, 'the stylesheet prints no data');
});

test('RH1-06 건강 date bar at 320px + 200% text: the bar and the date field next to it stay inside the page', () => {
  const bar = block(/@media \(max-width: 700px\) \{([\s\S]*?)\n\}/);
  assert.match(bar, /\.og-daynav \{ display: flex; flex-wrap: wrap; \}/);
  assert.match(bar, /\.og-daynav__date \{ order: -1; flex: 1 1 100%; \}/);
  assert.match(bar, /\.og-daynav__btn \{ flex: 1 1 0; min-width: min-content; \}/);
  assert.match(RULES, /\.og-daynav__state \{ white-space: pre-wrap; \}/);
  /* the field that opens a date: as wide as its card, never as wide as the control's own minimum */
  assert.match(RULES, /\.og-field \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(RULES, /\.og-input \{ min-width: 0; \}/);
  /* the bar is the same four elements in the same order (keyboard order = reading order), with their labels */
  const daily = read('js', 'life-daily.js');
  assert.match(daily, /button\('prev', '이전 날', addDays\(d, -1\), d <= oldest, '이전 날로'\),\s*label,\s*button\('next', '다음 날', addDays\(d, 1\), state === 'today', '다음 날로'\),\s*button\('today', '오늘', t, state === 'today', '오늘로 돌아가기'\)/);
  assert.match(daily, /class: 'og-daynav__date', tabindex: '-1', 'aria-live': 'polite'/);
  assert.match(BEFORE, /\.og-daynav__btn \{ min-height: 3rem; \}/, 'the buttons keep their 48px height');
  /* health wording is untouched: a record, not a diagnosis or a safety check */
  const health = read('js', 'life-health.js');
  assert.match(health, /의료 진단을 대신하지 않습니다/);
  for (const f of ['life-health.js', 'life-daily.js', 'health-safety-view.js']) assert.doesNotMatch(read('js', f), /안전 확인 완료|현재 안전함|건강 이상 없음/, f);
});

test('RH1-07 nothing is hidden to make it fit: no scroll box, no clipping, no smaller text, no design change', () => {
  assert.doesNotMatch(RULES, /overflow(-x|-y)?:\s*(auto|scroll|hidden|clip)/);
  assert.doesNotMatch(RULES, /display:\s*none|visibility:|opacity:|clip-path|text-overflow|line-clamp|max-height|transform:/);
  assert.doesNotMatch(RULES, /font-size|font-family|font-weight|letter-spacing|color:|background|border(-[a-z]+)?:|box-shadow|border-radius/);
  assert.doesNotMatch(RULES, /!important/);
  assert.doesNotMatch(RULES, /min-height|height:/, 'no target is made shorter');
  /* the page still clips sideways rather than scrolling sideways — which is why nothing may leave its card */
  assert.match(read('styles', 'ongil-shell.css'), /html\[data-og-view\], html\[data-og-view\] body \{ height: auto; overflow: auto; overflow-x: clip; \}/);
});

test('RH1-08 the five tabs: one row while each has room for its label, more rows with larger text — never a clipped label', () => {
  const min = Number(/\.og-tabs \{ grid-template-columns: repeat\(auto-fit, minmax\(([0-9.]+)rem, 1fr\)\); \}/.exec(RULES)[1]);
  const gap = 0.5;
  const fit = (viewport, root) => Math.min(5, Math.floor((((viewport - 2 * GUTTER * root) / root) + gap) / (min + gap)));
  for (const vp of [320, 390, 768, 1024, 1440]) assert.equal(fit(vp, 16), 5, `${vp}px: five in a row, as before`);
  assert.equal(fit(320, 32), 2);
  assert.ok(fit(390, 32) >= 2 && fit(390, 32) < 5);
  /* a two-letter label at the tab's font size (1.1rem, 0.2rem side padding on a phone) fits the smallest column */
  assert.ok(min >= 2 * 1.1 + 2 * 0.2 + 0.2, 'room for 요약 · 일정 · 생활 · 기록 · 건강');
  assert.ok(min * 32 >= 44, 'and a 44px target at 200%');
  /* still a tablist of buttons: the keyboard model is the script's, not the stylesheet's */
  assert.match(read('js', 'life-view.js'), /class: 'og-tab', role: 'tab'/);
});

test('RH1-09 neighbours on the same screens: the water counter, summary tiles and the screen button also stay inside', () => {
  assert.match(RULES, /\.og-stepper \{ flex-wrap: wrap; max-width: 100%; \}/);
  assert.match(RULES, /\.og-life-tiles \{ container-type: inline-size; \}\s*@container \(max-width: [0-9.]+rem\) \{\s*\.og-life-tile \{ grid-template-columns: minmax\(0, 1fr\); \}\s*\.og-life-tile \.og-btn \{ grid-column: 1; grid-row: auto; justify-self: start; \}\s*\}/);
  const at = Number(/\.og-life-tiles \{ container-type: inline-size; \}\s*@container \(max-width: ([0-9.]+)rem\)/.exec(RULES)[1]);
  assert.ok(plainCard(320, 16).innerRem > at, 'ordinary text at 320px keeps the button beside the text');
  assert.ok(plainCard(390, 32).innerRem < at, '200% text on a phone puts it under the text');
  assert.match(RULES, /\.og-film__actions \.og-film__more \{ max-width: 100%; white-space: normal; text-align: center; \}/);
});

test('RH1-10 only the stylesheet moved on: one cache version changed, no script, markup or data file', () => {
  /* WHY: ongil-life.css changed, so its address in index.html moves on (BEFORE ?v=20261004v13, AFTER ?v=20261007r14). */
  assert.match(INDEX, /ongil-start\/styles\/ongil-life\.css\?v=20261007r14/);
  assert.equal((INDEX.match(/\?v=20261007r14/g) || []).length, 1);
  assert.match(INDEX, /ongil-start\/js\/app\.js\?v=20261009hv2/, 'the entry moved on with Enjoy V2; Responsive Hardening itself changed no script'); /* Enjoy V2: app.js changed (tasks + own posts handed to 즐길거리, refresh on entry) → entry moved on (BEFORE 20261006m15, AFTER 20261007e16) */ /* Home V2: app.js changed (the Home V2 sections; community counts, the helper button and the 내 생활 add forms handed to Home) → entry moved on (WHY: a new page must never run a cached old entry; BEFORE 20261007e16, AFTER 20261009hv2) */
  for (const f of ['ongil-tokens.css', 'ongil-shell.css', 'ongil-app.css', 'ongil-home.css']) assert.match(INDEX, new RegExp(`${f.replace('.', '\\.')}\\?v=20261003r11`), f);
  /* container queries are the only new CSS feature; they are used for layout only and the page works without them
     (an old browser simply shows the layout it had before) */
  assert.equal((RULES.match(/@container/g) || []).length, 2);
  assert.equal((RULES.match(/container-type: inline-size/g) || []).length, 2);
});

test('RH1-11 the document records what was measured, what changed and what was left alone', () => {
  const doc = fs.readFileSync(path.join(ROOT, 'docs/ongil/ONGIL_RESPONSIVE_HARDENING_V1.md'), 'utf8');
  for (const word of ['320', '390', '768', '1024', '1440', '200%', '캘린더', '생활비', '건강', 'cf0b1505e7d748709f4954d6b956e942abfa5b59']) assert.ok(doc.includes(word), word);
  assert.match(doc, /알려진 한계/);
  assert.match(doc, /확인하지 못한 것/);
  assert.doesNotMatch(doc, /LIVE VERIFIED|WCAG (AA|AAA) (인증|certified)/i);
});
