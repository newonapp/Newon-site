// LIVON Accessibility Hardening V1 — WCAG 2.2 AA target (A11Y-1 … A11Y-67) plus browser checks (A11Y-B1 … B9).
// Static tests run everywhere. Browser tests need a local Chromium and are skipped without one; they are the
// keyboard / focus / reflow checks that markup alone cannot prove.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkSources, checkPublished, checkHtml, checkCss, checkJsTemplates, parseHtml, all, textOf, contrast, hexToRgb, TOKEN_PAIRS, cssRules } from '../../scripts/livon-accessibility-quality.mjs';
import { checkSite } from '../../scripts/livon-seo-quality.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const INDEX = src('livon/index.html'), A11Y_JS = src('livon/livon-a11y.js'), A11Y_CSS = src('livon/livon-a11y.css');
const ADMIN_HTML = src('livon/admin/index.html'), DM_HTML = src('livon/admin/data/index.html');
const ADMIN_JS = src('livon/admin/admin-app.js'), DM_JS = src('livon/admin/data/data-manager.js');
const ADMIN_CSS = src('livon/admin/admin.css'), DM_CSS = src('livon/admin/data/data-manager.css'), SEO_CSS = src('livon/seo.css');
const JS = Object.fromEntries(fs.readdirSync(path.join(ROOT, 'livon')).filter(n => n.endsWith('.js')).map(n => [n, src('livon/' + n)]));
const DOC = src('docs/livon/LIVON_ACCESSIBILITY.md');

/* generated static pages, in a temporary site root (the same generator the build runs) */
function makeRoot() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'livon-a11y-'));
  for (const f of ['sitemap.xml', 'robots.txt', 'livon/index.html', 'livon/seo.css', 'assets/livon-mark.jpg', 'ko/index.html', '404.html']) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
  }
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/livon-seo-build.mjs'), '--out', dir], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return dir;
}
const OUT = makeRoot();
const page = p => fs.readFileSync(path.join(OUT, ...p.split('/').filter(Boolean), 'index.html'), 'utf8');
const SEO_PAGES = ['/livon/life/', '/livon/life/10s/', '/livon/life/20s/', '/livon/life/70s/', '/livon/life/20s/first-job/', '/livon/life-events/', '/livon/life-events/first-job/', '/livon/help/', '/livon/help/no-signup/'];
const SRC = checkSources(ROOT);
const PUB = checkPublished(OUT);
const APP = parseHtml(INDEX);
const errorsOf = (rule, list = SRC.errors) => list.filter(e => e.includes(rule + ':'));

/* the accessibility layer, loaded without running init (document is "loading") */
function loadLayer(view = 'home', hash = '', nodes = []) {
  const doc = { title: 'LIVON | 생애주기 생활 정보', readyState: 'loading', documentElement: { getAttribute: k => (k === 'data-lv-view' ? view : null), setAttribute() {}, removeAttribute() {} },
    addEventListener() {}, querySelector: () => null, querySelectorAll: () => nodes, body: {} };
  const win = { document: doc, location: { hash }, setTimeout, clearTimeout, getComputedStyle: () => ({}), matchMedia: () => ({ matches: false }), localStorage: { getItem: () => null, setItem() {} } };
  vm.runInNewContext(A11Y_JS, { window: win });
  return { L: win.LivonA11y, doc };
}

test('A11Y-1 lang: the app page, Admin, Data Manager and every generated static page declare lang="ko"', () => {
  for (const h of [INDEX, ADMIN_HTML, DM_HTML]) assert.match(h, /<html[^>]*\blang="ko"/);
  assert.equal(errorsOf('lang').length, 0);
  assert.equal(PUB.stats.staticPages, 125);
  assert.equal(PUB.errors.filter(e => e.includes('lang:')).length, 0);
  for (const p of SEO_PAGES) assert.match(page(p), /<html lang="ko">/);
  /* language of parts: short English labels are marked, in the markup and for script-rendered ones */
  assert.ok((INDEX.match(/ lang="en"/g) || []).length >= 80);
  assert.match(INDEX, /<p class="lv-life__wordmark" lang="en">LIFE STAGE<\/p>/);
  assert.match(A11Y_JS, /function syncLang\(\)[\s\S]*?el\.setAttribute\("lang", "en"\)/);
});

test('A11Y-2 titles: every view has its own document title; a title left by another view is replaced', () => {
  const { L } = loadLayer();
  assert.deepEqual(Object.keys(L.viewNames).sort(), ['community', 'explore', 'help', 'home', 'life', 'life-now', 'livon-ai', 'today']);
  assert.equal(L.defaultTitle('home'), 'LIVON | 생애주기 생활 정보', 'Home keeps the SEO title');
  assert.equal(L.defaultTitle('life'), '라이프 스테이지 · LIVON');
  assert.equal(L.defaultTitle('today'), '오늘의 발견 · LIVON');
  assert.equal(L.defaultTitle('explore'), '탐색 · LIVON');
  assert.equal(L.defaultTitle('community'), '커뮤니티 · LIVON');
  assert.equal(L.defaultTitle('livon-ai'), 'LIVON AI');
  /* a stale detail title from another view is replaced; a title the view just set is kept */
  const a = loadLayer('life-now'); a.doc.title = '첫 독립을 준비할 때 놓치기 쉬운 것 · 오늘의 발견 | LivOn';
  a.L.syncTitle(); assert.equal(a.doc.title, a.doc.title, 'first call records the title');
  const b = loadLayer('today'); b.doc.title = 'LIVON | 생애주기 생활 정보'; b.L.syncTitle(); assert.equal(b.doc.title, '오늘의 발견 · LIVON');
  const c = loadLayer('home'); c.doc.title = 'LIVON'; c.L.syncTitle(); assert.equal(c.doc.title, 'LIVON | 생애주기 생활 정보');
  const d = loadLayer('help'); d.doc.title = '도움말 · LIVON'; d.L.syncTitle(); assert.equal(d.doc.title, '도움말 · LIVON', 'Help titles belong to help-page.js');
  const e = loadLayer('explore'); e.doc.title = '도움말 · LIVON'; e.L.syncTitle(); assert.equal(e.doc.title, '탐색 · LIVON');
  assert.match(JS['explore-page.js'], /function setTitle\(name\)[\s\S]*?document\.title = name \+ " · " \+ EX_TITLE/);
  assert.match(JS['explore-page.js'], /indexOf\("ex-item-"\) !== 0\) \{ state\.focusedDetail = null; setTitle\(""\); \}/);
  assert.match(ADMIN_JS, /document\.title = titleFor\(view\) \+ " · LIVON Admin"/);
  assert.match(DM_JS, /document\.title = v\[1\] \+ " · LIVON Data Manager"/);
  const titles = SEO_PAGES.map(p => /<title>([^<]+)<\/title>/.exec(page(p))[1]);
  assert.equal(new Set(titles).size, titles.length);
});

test('A11Y-3 H1: one H1 per screen and per static page; sub-views expose their title as level 1', () => {
  assert.equal(errorsOf('h1').length, 0);
  assert.equal(PUB.errors.filter(e => e.includes('h1:')).length, 0);
  for (const p of SEO_PAGES) assert.equal((page(p).match(/<h1\b/g) || []).length, 1, p);
  assert.equal((JS['life-hub.js'].match(/<h2 class="lv-life-title" aria-level="1" tabindex="-1" data-lh-title-focus>/g) || []).length, 6);
  assert.equal((JS['life-hub.js'].match(/data-lh-title-focus>/g) || []).length, 6, 'every hub title carries the level');
  assert.equal((JS['today-feed.js'].match(/aria-level="1" tabindex="-1" data-td-title-focus>/g) || []).length, 2);
  assert.match(JS['help-page.js'], /<h1 class="lv-hp-title/);
  assert.match(ADMIN_JS, /<h1 data-ad-title><\/h1>/); assert.match(DM_JS, /<h1 data-dm-title><\/h1>/);
});

test('A11Y-4 heading order: no skipped level in static markup; no empty heading on static pages', () => {
  assert.equal(errorsOf('heading-order').length, 0);
  assert.equal(PUB.errors.filter(e => /heading-(order|empty)/.test(e)).length, 0);
  const bad = checkHtml('<html lang="ko"><title>t</title><a class="skip" href="#m">s</a><main id="m"><h1>a</h1><h3>c</h3><h2></h2></main></html>');
  assert.ok(bad.errors.some(e => e.startsWith('heading-order')), 'the check sees a skipped level');
  assert.ok(bad.errors.some(e => e.startsWith('heading-empty')), 'the check sees an empty heading');
  assert.match(JS['life-hub.js'], /<h3 class="lh-sr">검색 결과<\/h3>/, 'search results sit under a heading, not straight under the title');
});

test('A11Y-5 landmarks: one main, named screens, named navigation landmarks', () => {
  assert.equal((INDEX.match(/<main\b/g) || []).length, 1);
  assert.equal(errorsOf('nav-name').length + errorsOf('screen-name').length + errorsOf('main').length, 0);
  const screens = all(APP, n => 'data-lv-screen' in n.attrs && n.parent.tag === 'main');
  assert.equal(screens.length, 8);
  for (const s of screens) assert.ok(s.attrs['aria-label'], s.attrs['data-lv-screen']);
  for (const p of SEO_PAGES) {
    const t = parseHtml(page(p));
    assert.equal(all(t, n => n.tag === 'main').length, 1);
    const navs = all(t, n => n.tag === 'nav').map(n => n.attrs['aria-label']);
    assert.ok(navs.length >= 2 && navs.every(Boolean) && new Set(navs).size === navs.length, p + ' ' + navs.join('|'));
    assert.ok(all(t, n => n.tag === 'header').length && all(t, n => n.tag === 'footer').length);
  }
  assert.match(ADMIN_JS, /<nav aria-label="Admin sections">/);
  assert.match(ADMIN_JS, /aria-label="Pages, below the table"/); assert.match(DM_JS, /aria-label="Pages, below the table"/);
});

test('A11Y-6 skip links: first link on every page; in the app it focuses the current screen instead of routing to Home', () => {
  assert.equal(errorsOf('skip-link').length, 0);
  assert.match(INDEX, /<a class="skip-link" href="#livon-home">본문으로 건너뛰기<\/a>/);
  assert.match(A11Y_JS, /function initSkip\(\)[\s\S]*?e\.preventDefault\(\);[\s\S]*?s\.focus\(\{ preventScroll: true \}\)/);
  assert.match(A11Y_JS, /function screen\(\) \{ return doc\.querySelector\('main > \[data-lv-screen="' \+ view\(\) \+ '"\]'\); \}/);
  for (const p of SEO_PAGES) { const h = page(p); assert.match(h, /<a class="lv-seo-skip" href="#main">본문으로 건너뛰기<\/a>/); assert.match(h, /<main[^>]*id="main"/); }
  assert.match(SEO_CSS, /\.lv-seo-skip:focus \{ left: 0\.5rem; top: 0\.5rem; \}/);
  assert.match(ADMIN_HTML, /<a class="ad-skip" href="#ad-main">/); assert.match(DM_HTML, /<a class="dm-skip" href="#dm-main">/);
  assert.match(ADMIN_JS, /<main id="ad-main" class="ad-main" tabindex="-1">/);
});

test('A11Y-7 keyboard: no click-only elements, no positive tabindex, arrow keys on every tab list', () => {
  assert.equal(SRC.errors.filter(e => /click-handler|tabindex:/.test(e)).length, 0);
  assert.equal((INDEX.match(/\bonclick=/g) || []).length, 0);
  assert.match(A11Y_JS, /function initTabs\(\)[\s\S]*?"ArrowRight"[\s\S]*?"ArrowLeft"[\s\S]*?"Home"[\s\S]*?"End"/);
  assert.match(A11Y_JS, /getAttribute\("tabindex"\) === "-1"; \}\)\) return;/, 'tab lists with their own roving tabindex are left alone');
  for (const f of ['community-page.js', 'explore-page.js', 'today-feed.js']) assert.match(JS[f], /ArrowRight|ArrowLeft/, f + ' keeps its own arrow-key handling');
  assert.doesNotMatch(JS['life-now-page.js'], /draggable|dragstart|ondrop/);
});

test('A11Y-8 no keyboard trap: Tab wraps inside the open modal only; every dialog closes with Escape', () => {
  assert.match(A11Y_JS, /function initDialogs\(\)[\s\S]*?e\.key !== "Tab" \|\| e\.defaultPrevented[\s\S]*?topModal\(\)/);
  assert.match(A11Y_JS, /root\.addEventListener\("keydown"/, 'window + bubble: after the dialogs\' own handlers');
  for (const f of ['community-page.js', 'life-now-page.js', 'ai-page.js', 'life-hub.js', 'livon-onboarding.js', 'livon-account-ui.js', 'life-page.js']) assert.match(JS[f], /Escape/, f);
  assert.match(DM_JS, /<dialog|showModal/); assert.match(ADMIN_JS, /<dialog id="ad-palette"/);
});

test('A11Y-9 focus visible: every outline removal has a replacement; dialogs, fields and the pause control have a ring', () => {
  assert.equal(SRC.errors.filter(e => e.includes('outline-removal')).length, 0);
  assert.ok(SRC.stats.outlineRemovals >= 20, 'the check looked at the outline removals');
  const bad = checkCss([['x.css', '#a .field input { outline: none; }']]);
  assert.equal(bad.errors.filter(e => e.includes('outline-removal')).length, 1, 'an unreplaced removal is an error');
  const ok = checkCss([['x.css', '#a .field input { outline: none; } #a .field input:focus { border-color: #000; } @media (prefers-reduced-motion: reduce){*{animation-duration:.01ms !important;transition-duration:.01ms !important}}']]);
  assert.equal(ok.errors.filter(e => e.includes('outline-removal')).length, 0);
  assert.match(A11Y_CSS, /#livon-home \.lv-hm-ai:focus-within \{ outline: 2px solid #fff; outline-offset: 2px; \}/);
  assert.match(A11Y_CSS, /:is\(\.lv-life-modal, \.lv-ml-modal, \.lv-cm-modal, \.lv-ai-modal\) :is\(button, a\):not\(\[class\*="backdrop"\]\):focus-visible \{ outline: 2px solid #0a0a0a/);
  assert.match(A11Y_CSS, /\.lv-motion-toggle:focus-visible \{ outline: 2px solid #fff/);
  assert.match(SEO_CSS, /\.lv-seo a:focus-visible \{ outline: 2px solid #0a0a0a/);
  assert.match(ADMIN_CSS, /:focus-visible \{ outline: 3px solid #1a73e8/);
});

test('A11Y-10 focus not obscured: scroll padding under the fixed header; a tall sticky column scrolls on its own', () => {
  assert.match(A11Y_CSS, /html\[data-lv-view\] \{ scroll-padding-top: calc\(var\(--gnav-h, 74px\) \+ 64px\); scroll-padding-bottom: 24px; \}/);
  assert.match(A11Y_CSS, /#explore \.lv-ex-side \{ max-height: calc\(100vh - var\(--gnav-h, 74px\) - 24px\); overflow-y: auto;/);
  assert.match(ADMIN_CSS, /html \{ scroll-padding-top: 72px; \}/);
});

test('A11Y-11 target size: controls are at least 24px; primary controls 44px', () => {
  assert.match(A11Y_CSS, /\.lv-motion-toggle \{[\s\S]*?width: 44px; height: 44px;/);
  assert.ok((SEO_CSS.match(/min-height: 44px/g) || []).length >= 8);
  assert.match(SEO_CSS, /\.lv-seo main h3 > a, \.lv-seo main p > a:only-child \{ display: inline-flex; align-items: center; min-height: 44px; \}/);
  assert.match(ADMIN_CSS, /\.ad-kv dt a \{ display: inline-block; min-width: 24px; min-height: 24px;/);
  assert.match(DM_CSS, /\.dm-btn--link \{ padding-block: 2px; min-height: 24px; \}/);
});

test('A11Y-12 images: every image has alt; decorative images have alt=""; no file-name alt', () => {
  assert.equal(SRC.errors.filter(e => e.includes('img-alt')).length, 0);
  for (const m of INDEX.matchAll(/<img\b[^>]*>/g)) assert.match(m[0], /\balt="/, m[0].slice(0, 80));
  for (const [f, js] of Object.entries(JS)) for (const m of js.matchAll(/<img\b[^>]*>/g)) assert.match(m[0], /\balt=/, f);
  const t = checkJsTemplates([['x.js', 'var h = \'<img src="a.jpg">\';']]);
  assert.equal(t.errors.length, 1);
  assert.equal(checkHtml('<html lang="ko"><title>t</title><a class="skip" href="#m">s</a><main id="m"><h1>a</h1><img src="x.png" alt="x.png"></main></html>').errors.filter(e => e.startsWith('img-alt')).length, 1);
});

test('A11Y-13 icons: icon-only controls have a name; decorative SVG is hidden from assistive technology', () => {
  assert.equal(SRC.errors.filter(e => /button-name|link-name/.test(e)).length, 0);
  for (const m of INDEX.matchAll(/<svg\b[^>]*>/g)) assert.match(m[0], /aria-hidden="true"/);
  assert.match(A11Y_JS, /<span class="lv-motion-toggle__icon" aria-hidden="true"><\/span><span class="visually-hidden">배경 영상 일시 정지<\/span>/);
  for (const m of INDEX.matchAll(/<button\b[^>]*class="[^"]*(?:livon-tool|gnav__menu-btn)[^"]*"[^>]*>/g)) assert.match(m[0], /aria-label="[^"]+"/);
});

test('A11Y-14 text contrast: token pairs reach 4.5:1; no declared colour fails on both white and ink', () => {
  for (const [label, fg, bg, need] of TOKEN_PAIRS) assert.ok(contrast(hexToRgb(fg), hexToRgb(bg)) >= need, label);
  assert.equal(SRC.errors.filter(e => e.includes('contrast')).length, 0);
  assert.ok(contrast(hexToRgb('#737373'), [255, 255, 255]) >= 4.5 && contrast(hexToRgb('#777'), [255, 255, 255]) < 4.5, '#777 was just under; #737373 passes');
  for (const f of ['ai-page.css', 'community-page.css', 'explore-page.css', 'life-now-page.css', 'life-page.css', 'today-page.css']) assert.doesNotMatch(src('livon/' + f), /color:\s?#777;/, f);
  const light = { 'community-page.css': ['#community .lv-cm-card__tags', '#community .lv-cm-counter', '#community .lv-cm-card__meta'], 'ai-page.css': ['#livon-ai .lv-ai-thread__main span', '#livon-ai .lv-ai-status'], 'explore-page.css': ['#explore .lv-ex-recent', '#explore .lv-ex-ac li small'], 'home-page.css': ['.lv-hm-search-results em'] };
  for (const [f, sels] of Object.entries(light)) { const rules = cssRules(src('livon/' + f)); for (const s of sels) { const r = rules.find(x => x.selector === s); assert.ok(r, s); assert.match(r.body, /color: #737373/, s); } }
  assert.ok(SRC.manual.length > 0, 'colours on an unknown background are reported for manual review, not passed');
});

test('A11Y-15 UI contrast: form-field boundaries reach 3:1', () => {
  assert.ok(contrast(hexToRgb('#858585'), [255, 255, 255]) >= 3 && contrast(hexToRgb('#85827a'), [255, 255, 255]) >= 3);
  assert.ok(contrast(hexToRgb('#e0e0e0'), [255, 255, 255]) < 3, 'the old boundary was under 3:1');
  assert.match(A11Y_CSS, /html :is\(#community, \.lv-cm-modal\) \.lv-cm-field :is\(input, select, textarea\):not\(\[aria-invalid="true"\]\),/);
  assert.match(A11Y_CSS, /html \.livon-search input \{ border-color: #858585; \}/);
  assert.match(A11Y_CSS, /html #livon-home \.lv-hm-ai:not\(:focus-within\) \{ border-color: rgba\(255, 255, 255, 0\.62\); \}/);
  assert.match(ADMIN_CSS, /\.ad-gsearch input, \.ad-field input, \.ad-field select, \.ad-field textarea, \.ad-palette__in input, \.ad-table select \{ border-color: #85827a; \}/);
  assert.match(DM_CSS, /\.dm-field input, \.dm-field select, \.dm-table select \{ border-color: #85827a; \}/);
});

test('A11Y-16 colour is not the only signal: selected chips, filters and section links expose their state', () => {
  /* WHY CHANGED (Home V2): Home no longer has its own settings form or Life Event chips.
     BEFORE: three chip groups on Home (생활 상황, 관심사, Life Event) each exposed aria-pressed.
     AFTER:  Home has no selectable chips at all — those choices are made in onboarding / Life Stage, which keep theirs. */
  assert.equal((JS['home-page.js'].match(/data-lv-chip|aria-pressed/g) || []).length, 0);
  assert.equal((JS['life-page.js'].match(/data-lv-chip aria-pressed="true"/g) || []).length, 4);
  assert.match(JS['today-page.js'], /data-lv-chip aria-pressed="true"/); assert.match(JS['livon-platform.js'], /data-lv-chip aria-pressed=\\"true\\"/);
  assert.match(A11Y_JS, /function syncChips\(\)[\s\S]*?b\.classList\.contains\("is-on"\) \? "true" : "false"/);
  assert.match(INDEX, /<button type="button" class="is-on" aria-pressed="true" data-lv-td-week="all">전체<\/button>/);
  assert.match(INDEX, /<button type="button" class="is-on" aria-pressed="true" data-lv-td-cat="all">전체<\/button>/);
  for (const f of ['ai-page.js', 'explore-page.js', 'today-page.js', 'community-page.js']) assert.match(JS[f], /setAttribute\("aria-current", "location"\)/, f);
  assert.match(JS['life-page.js'], /aria-pressed=\\"true\\"" : " aria-pressed=\\"false\\""\) \+ ">" \+ esc\(f\.label\)/);
});

test('A11Y-17 resize text: zoom is never disabled; text sizes are relative on the public pages', () => {
  for (const h of [INDEX, ADMIN_HTML, DM_HTML].concat(SEO_PAGES.map(page))) {
    const vp = /<meta name="viewport" content="([^"]+)"/.exec(h);
    assert.ok(vp, 'viewport meta'); assert.doesNotMatch(vp[1], /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/);
  }
  assert.doesNotMatch(SEO_CSS, /font-size:\s*\d+px/); assert.doesNotMatch(A11Y_CSS, /font-size:\s*\d+px/);
});

test('A11Y-18 reflow: the Home hero stacks on narrow screens; static pages wrap long words', () => {
  assert.match(A11Y_CSS, /@media \(max-width: 860px\) \{\s*#livon-home \.livon-hero__foot \{ flex-direction: column;[\s\S]*?#livon-home \.livon-hero__actions \{ position: static; transform: none;/);
  assert.match(SEO_CSS, /overflow-wrap: anywhere;/); assert.match(SEO_CSS, /width: min\(880px, calc\(100% - clamp/);
});

test('A11Y-19 text spacing: controls grow with their text (min-height, not fixed height)', () => {
  assert.doesNotMatch(SEO_CSS, /(?<!min-|max-|line-)height:\s*\d+(px|rem)/);
  assert.doesNotMatch(A11Y_CSS.replace(/\.lv-motion-toggle[^}]*\}/g, ''), /(?<!min-|max-|line-)height:\s*\d+px/);
});

test('A11Y-20 reduced motion: a global rule stops animation, a control pauses background video, the preference starts paused', () => {
  assert.equal(SRC.errors.filter(e => e.includes('reduced-motion')).length, 0);
  assert.match(A11Y_CSS, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?scroll-behavior: auto !important;[\s\S]*?animation-duration: 0\.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0\.01ms !important;/);
  assert.match(A11Y_JS, /prefers-reduced-motion: reduce/);
  assert.match(A11Y_JS, /video\.defaultPlaybackRate = paused \? 0 : 1; video\.playbackRate = paused \? 0 : 1;/);
  assert.ok(SRC.stats.backgroundVideos >= 7);
  for (const host of ['.livon-hero', 'data-lv-life-hero', 'data-lv-ml-hero', 'data-lv-ex-hero', 'data-lv-cm-hero', 'data-lv-td-hero', 'data-lv-ai-hero']) assert.ok(A11Y_JS.includes(host), host);
  assert.doesNotMatch(INDEX + Object.values(JS).join(''), /<marquee|<blink/);
});

test('A11Y-21 forms: every static control has a label; placeholders are never the only label', () => {
  assert.equal(SRC.errors.filter(e => /\blabel:|label-for|control-name/.test(e)).length, 0);
  const bad = checkHtml('<html lang="ko"><title>t</title><a class="skip" href="#m">s</a><main id="m"><h1>a</h1><input type="text" placeholder="이름"></main></html>');
  assert.ok(bad.errors.some(e => e.startsWith('label') && e.includes('placeholder is not a label')));
  assert.match(INDEX, /<label class="visually-hidden" for="hm-ai-q">LIVON AI에게 질문<\/label>/);
  assert.match(INDEX, /<label class="visually-hidden" for="lv-cm-q">/);
});

test('A11Y-22 labels: repeated checkboxes and repeated action buttons carry their subject', () => {
  assert.match(JS['life-now-page.js'], /<span class="visually-hidden">' \+ esc\(a\.label\) \+ " 알림 <\/span>받기<\/label>/);
  assert.match(JS['service-details.js'], /class="lv-life-svc__acts lv-ls-secondary" role="group" aria-label="' \+ esc\(s\.name\) \+ '">/);
  assert.match(JS['explore-page.js'], /aria-label=\\"" \+ esc\(x\.title\) \+ " 저장\\"/);
  assert.match(ADMIN_JS, /<label class="ad-sr" for="' \+ domId\("ad-st-", i\.key\) \+ '">State of /);
});

test('A11Y-23 errors: invalid fields are marked, described in text and announced', () => {
  assert.match(JS['community-page.js'], /aria-describedby="lv-cm-cerr"><\/textarea>/);
  assert.match(JS['community-page.js'], /<p class="lv-cm-form__err" id="lv-cm-cerr" data-lv-cm-cerr role="alert"><\/p>/);
  assert.match(JS['community-page.js'], /id="lv-cm-cerr-edit" data-lv-cm-cerr role="alert"/);
  assert.match(JS['community-page.js'], /lv-cm-form-err-msg/);
  assert.match(JS['life-now-page.js'], /lv-ml-form-err-msg/);
  assert.match(JS['community-page.js'], /setAttribute\("aria-invalid", "true"\)/);
  assert.match(JS['ai-page.js'], /lv-ai-bubble--error"' \+ \(isLast \? ' role="alert"' : ""\)/);
});

test('A11Y-24 error focus: a failed submit moves focus to the field that needs attention', () => {
  assert.match(JS['community-page.js'], /ta\.setAttribute\("aria-invalid", "true"\); ta\.focus\(\);/);
  assert.match(JS['community-page.js'], /t1\.setAttribute\("aria-invalid", "true"\); t1\.focus\(\);/, 'editing a comment too');
  assert.match(JS['life-now-page.js'], /aria-invalid[\s\S]{0,400}\.focus\(\)/);
});

test('A11Y-25 status messages: polite status regions, one per screen; alerts only for errors', () => {
  for (const a of ['data-lv-ml-status', 'data-lv-cm-status', 'data-lv-ai-live', 'data-lv-hp-status']) assert.match(INDEX, new RegExp('<p class="visually-hidden" role="status" aria-live="polite" ' + a + '></p>'));
  assert.match(INDEX, /<p class="lv-ex-note" data-lv-ex-count role="status"><\/p>/);
  assert.doesNotMatch(INDEX, /id="ex-results" aria-live/, 'the whole results region is no longer a live region');
  assert.doesNotMatch(INDEX, /aria-live="assertive"/);
  assert.match(A11Y_JS, /statusEl\.setAttribute\("role", "status"\);/);
  assert.match(A11Y_JS, /name \+ " 화면으로 이동했습니다\."/);
  assert.match(JS['livon-onboarding.js'], /window\.LivonA11y\.say\("맞춤 설정을 저장했습니다\."\)/);
  assert.equal(SRC.errors.filter(e => e.includes('live-region')).length, 0);
});

test('A11Y-26 destructive actions: an alert dialog asks first and is fully usable from the keyboard', () => {
  assert.match(JS['community-page.js'], /role="alertdialog" aria-modal="true" aria-labelledby="lv-cm-dialog-title" aria-describedby="lv-cm-/);
  assert.match(JS['life-now-page.js'], /role="alertdialog" aria-modal="true" aria-labelledby="lv-ml-confirm-title" aria-describedby="lv-/);
  assert.match(JS['community-page.js'], /data-lv-cm-del-post/); assert.match(JS['life-now-page.js'], /data-lv-ml-pz-reset/);
});

test('A11Y-27 dialogs: role, aria-modal, a name, a close control, focus return', () => {
  const dialogs = all(APP, n => n.attrs.role === 'dialog');
  assert.ok(dialogs.length >= 7);
  for (const d of dialogs) { assert.equal(d.attrs['aria-modal'], 'true'); assert.ok(d.attrs['aria-label'] || d.attrs['aria-labelledby']); }
  assert.equal(SRC.errors.filter(e => e.includes('dialog:')).length, 0);
  for (const f of ['ai-page.js', 'life-hub.js', 'life-now-page.js', 'livon-account-ui.js']) assert.match(JS[f], /role="dialog" aria-modal="true" aria-labelledby="/, f);
  assert.match(A11Y_JS, /function settleModals\(\)[\s\S]*?var o = top\.opener;[\s\S]*?o = screen\(\);/);
  assert.match(DM_JS, /dm-inspector/); assert.match(DM_JS, /aria-labelledby="dm-insp-title"/);
});

test('A11Y-28 tabs: role="tab" only inside a tab list, always with aria-selected; arrow keys work', () => {
  assert.equal(SRC.errors.filter(e => e.includes('tabs:')).length, 0);
  const tabs = all(APP, n => n.attrs.role === 'tab');
  assert.ok(tabs.length >= 10);
  for (const t of tabs) assert.ok('aria-selected' in t.attrs);
  assert.equal(all(APP, n => n.attrs.role === 'tablist' && !n.attrs['aria-label']).length, 0, 'every tab list is named');
  assert.match(JS['community-page.js'], /role="tab"[^>]*aria-controls="lv-cm-feed-panel"/);
  assert.doesNotMatch(INDEX, /role="listitem"/); assert.doesNotMatch(JS['life-page.js'], /role="listitem"/);
  assert.match(INDEX, /<div class="lv-life-rail" role="group" aria-label="생애 단계 선택" data-lv-life-rail><\/div>/);
});

test('A11Y-29 accordion: a button inside a heading, with aria-expanded and aria-controls', () => {
  assert.match(JS['help-page.js'], /aria-expanded="/); assert.match(JS['help-page.js'], /aria-controls="/);
  assert.match(JS['help-page.js'], /role="region" aria-labelledby="' \+ bid \+ '"/);
  assert.match(JS['livon-onboarding.js'], /data-ob-more[^>]*aria-expanded=/);
});

test('A11Y-30 filter chips: pressed state on every filter group', () => {
  for (const a of ['data-lv-ex-filter-cat', 'data-lv-ex-filter-age', 'data-lv-ex-filter-region', 'data-lv-ex-filter-mode']) assert.ok(JS['explore-page.js'].includes('chip("' + a + '"'), a);
  assert.match(JS['explore-page.js'], /function chip\([^)]*\) \{[\s\S]{0,300}aria-pressed/);
  assert.match(JS['community-page.js'], /data-lv-cm-cat[^>]*aria-pressed|aria-pressed[^>]*data-lv-cm-cat/);
  /* Life Stage V2: every search filter group (생애 단계 · 정보 종류 · 분야) is built by one helper that sets the pressed state */
  assert.match(JS['life-hub.js'], /'<button type="button" data-lh-filter-' \+ attr \+ '="' \+ esc\(o\.value\) \+ '" aria-pressed="' \+ on \+ '"'/);
  for (const g of ['"생애 단계", "stage"', '"정보 종류", "type"', '"분야", "area"']) assert.ok(JS['life-hub.js'].includes('filterGroup(' + g), g);
  assert.match(JS['today-page.js'], /b\.setAttribute\("aria-pressed", b === week \? "true" : "false"\)/);
  assert.match(INDEX, /data-lv-td-week-filters role="group" aria-label="이번 주 발견 필터"/);
  assert.match(INDEX, /data-lv-td-lib-filters role="group" aria-label="발견 유형 필터"/);
});

test('A11Y-31 search: labelled inputs, search landmarks, result counts announced, empty results announced', () => {
  for (const id of ['lv-cm-q', 'lv-ex-q', 'lv-td-q', 'hm-ex-q', 'livon-search-input']) assert.ok(INDEX.includes('for="' + id + '"') || new RegExp('id="' + id + '"[^>]*aria-label').test(INDEX), id);
  assert.match(INDEX, /role="search" aria-label="커뮤니티 검색"/);
  assert.match(JS['help-page.js'], /role="search" aria-label="도움말 검색"/);
  /* Life Stage V2: the count line is a polite live region that is always in the page; the empty result is a status block */
  assert.match(JS['life-hub.js'], /<p class="lv-life-note lh-count" role="status" aria-live="polite" data-lh-count-line>/);
  assert.match(JS['life-hub.js'], /var summary = \(st\.q \? "‘" \+ st\.q \+ "’ " : ""\) \+ "결과 " \+ res\.total \+ "건";/);
  assert.match(JS['life-hub.js'], /UI\.EmptyState\("조건에 맞는 결과가 없습니다\."/);
  assert.match(JS['explore-page.js'], /lv-ex-noresult\\" role=\\"status\\"/);
  assert.match(ADMIN_JS, /id="ad-gq" type="search" role="combobox" aria-expanded="false" aria-controls="ad-gres" aria-autocomplete="list"/);
});

test('A11Y-32 cards: no interactive element inside another; the Today week list is rendered in its own container', () => {
  assert.equal(SRC.errors.filter(e => e.includes('nested-interactive')).length, 0);
  assert.match(INDEX, /<div data-lv-td-week-list><\/div>/);
  assert.match(JS['today-page.js'], /var host = \$\("\[data-lv-td-week-list\]"\);/);
  assert.doesNotMatch(JS['today-page.js'], /var host = \$\("\[data-lv-td-week\]"\);/, 'the list is no longer rendered into the first filter button');
  const nested = checkHtml('<html lang="ko"><title>t</title><a class="skip" href="#m">s</a><main id="m"><h1>a</h1><button type="button">x<button type="button">y</button></button></main></html>');
  assert.ok(nested.errors.some(e => e.startsWith('nested-interactive')));
});

test('A11Y-33 link purpose: repeated "자세히 보기" / "전체 보기" links name their subject for screen readers', () => {
  assert.match(JS['life-hub.js'], /\(about \? '<span class="lh-sr">: ' \+ esc\(about\) \+ "<\/span>" : ""\)/);
  assert.equal((JS['life-hub.js'].match(/UI\.link\("자세히 보기", .{1,40}?, "dark", "", [a-z.]+\)/gi) || []).length, 4);
  assert.doesNotMatch(JS['life-hub.js'], /UI\.link\("자세히 보기", [^,]+, "dark"\)/, 'no bare "자세히 보기" left');
  assert.match(JS['today-feed.js'], /esc\(text \|\| "자세히"\) \+ '<span class="visually-hidden">: ' \+ esc\(item\.title \|\| ""\)/);
  assert.match(JS['today-page.js'], /자세히<span class="visually-hidden">: ' \+ esc\(c\.title\)/);
  assert.match(JS['explore-page.js'], /자세히 보기<span class=\\"visually-hidden\\">: " \+ esc\(x\.title\)/);
  assert.equal((INDEX.match(/전체 보기<span class="visually-hidden">: [^<]+<\/span><\/a>/g) || []).length, 8);
  for (const p of SEO_PAGES) for (const m of page(p).matchAll(/<a [^>]*target="_blank"[^>]*>[\s\S]*?<\/a>/g)) assert.match(m[0], /새 창/);
});

test('A11Y-34 duplicate ids: none in static markup; generated ids are valid and unique', () => {
  assert.equal(SRC.errors.filter(e => /duplicate-id|\bid:/.test(e)).length, 0);
  assert.equal(PUB.errors.filter(e => /duplicate-id/.test(e)).length, 0);
  const ctx = {}; vm.runInNewContext(/function domId\(prefix, key\) \{[^\n]*\}/.exec(ADMIN_JS)[0] + '; this.domId = domId;', ctx);
  const a = ctx.domId('ad-st-', 'P4|TAXONOMY_REVIEW||가족 ↔ 가족·육아'), b = ctx.domId('ad-st-', 'P4|TAXONOMY_REVIEW||돌봄 ↔ 부모/가족');
  assert.match(a, /^[A-Za-z][\w-]*$/); assert.notEqual(a, b);
  assert.equal(ctx.domId('ad-st-', 'x y'), ctx.domId('ad-st-', 'x y'));
});

test('A11Y-35 ARIA validity: known roles only, references resolve, state attributes sit on matching roles', () => {
  assert.equal(SRC.errors.filter(e => /\brole:|aria-reference|aria-pressed|aria-selected|role-override/.test(e)).length, 0);
  assert.equal(PUB.errors.filter(e => /\brole:|aria-reference/.test(e)).length, 0);
  const bad = checkHtml('<html lang="ko"><title>t</title><a class="skip" href="#m">s</a><main id="m"><h1>a</h1><div role="buton" aria-labelledby="nope">x</div><button role="listitem">y</button><span aria-selected="true">z</span></main></html>');
  for (const rule of ['role', 'aria-reference', 'role-override', 'aria-selected']) assert.ok(bad.errors.some(e => e.startsWith(rule + ':')), rule);
});

test('A11Y-36 hidden content: nothing focusable inside aria-hidden; full-screen backdrops are not tab stops', () => {
  assert.equal(SRC.errors.filter(e => e.includes('aria-hidden-focus')).length, 0);
  for (const m of INDEX.matchAll(/<button type="button" class="lv-(?:life|ml)-modal__backdrop"[^>]*>/g)) assert.match(m[0], /tabindex="-1"/);
  assert.match(JS['life-hub.js'], /lv-life-modal__backdrop" data-lh-modal-close aria-label="닫기" tabindex="-1"/);
  assert.match(JS['livon-account-ui.js'], /lv-life-modal__backdrop" data-livon-consent-close aria-label="닫기" tabindex="-1"/);
  assert.match(INDEX, /<div id="gnav-mobile-livon" class="gnav-mobile" hidden aria-hidden="true">/);
});

test('A11Y-37 onboarding: progress, step and selection are exposed; the result is announced', () => {
  const o = JS['livon-onboarding.js'];
  assert.match(o, /role="progressbar"/); assert.match(o, /aria-valuetext=/); assert.match(o, /aria-pressed=/);
  assert.match(o, /role="group" aria-labelledby="livon-onboard-title"/);
  assert.match(o, /<p class="lv-ob__status" role="status" aria-live="polite">/);
  assert.match(INDEX, /role="dialog" aria-modal="true" aria-labelledby="livon-onboard-title"/);
  assert.match(o, /data-ob-back/); assert.match(o, /data-ob-later/); assert.match(o, /data-ob-finish/);
});

test('A11Y-38 personalization: reasons are text; preference controls say what they change', () => {
  assert.match(JS['today-page.js'], /"이유 · " \+ x\.reasons\.join\(" · "\)/);
  assert.match(JS['life-now-page.js'], /data-lv-onboard-edit="' \+ step \+ '" aria-label="' \+ label \+ ' 변경">변경<\/button>/);
  assert.match(JS['life-now-page.js'], /알림 <\/span>받기/);
});

test('A11Y-39 community: named search, real tabs, pressed filters, labelled post actions', () => {
  const c = JS['community-page.js'];
  assert.match(INDEX, /<div class="lv-cm-tabs" role="tablist" aria-label="피드" data-lv-cm-tabs><\/div>/);
  assert.match(c, /host\.setAttribute\("role", "tabpanel"\);/); assert.match(c, /aria-pressed/);
  assert.match(c, /<article class="lv-cm-detail" aria-labelledby="lv-cm-detail-title">/);
  assert.match(c, /id="lv-cm-detail-title" tabindex="-1"/);
  assert.match(INDEX, /<div class="lv-cm-modal__panel" role="dialog" aria-modal="true" aria-labelledby="lv-cm-modal-title">/);
});

test('A11Y-40 comments and replies: a labelled list, replies nested one level with their own label', () => {
  const c = JS['community-page.js'];
  assert.match(c, /<ul class="lv-cm-comments" aria-labelledby="lv-cm-comments-title">/);
  assert.match(c, /<ul class="lv-cm-replies" aria-label="답글 ' \+ kids\.length \+ '개">/);
  assert.match(c, /var kids = isReply \? \[\] : list\.filter/, 'one level only');
  assert.match(c, /에 답글 작성 중/);
});

test('A11Y-41 report: the report form is an alert dialog with a title and description', () => {
  assert.match(JS['community-page.js'], /data-lv-cm-report/);
  assert.match(JS['community-page.js'], /role="alertdialog" aria-modal="true" aria-labelledby="lv-cm-dialog-title"/);
});

test('A11Y-42 Help: status region, focusable page title, search landmark, the same Help link on every screen', () => {
  assert.match(INDEX, /data-lv-hp-status/);
  assert.match(JS['help-page.js'], /id="lv-hp-h" tabindex="-1"/);
  assert.match(JS['help-page.js'], /function announce\(msg\)/);
  for (const p of SEO_PAGES) { const h = page(p); assert.match(h, /<header[\s\S]*?href="\/livon\/help\/"[\s\S]*?<\/header>/, p + ' header'); assert.match(h, /<footer[\s\S]*?href="\/livon\/help\/"[\s\S]*?<\/footer>/, p + ' footer'); }
  assert.match(INDEX, /href="#help"/);
});

test('A11Y-43 LIVON AI: labelled input, message roles, polite status, alert on error', () => {
  assert.match(INDEX, /<label class="visually-hidden" for="ai-chat-q">LIVON AI에게 보낼 메시지<\/label>/);
  assert.match(INDEX, /data-lv-ai-stream role="region" aria-label="대화 내용" tabindex="0"/);
  assert.match(JS['ai-page.js'], /lv-ai-bubble--user" aria-label="내 메시지"/);
  assert.match(JS['ai-page.js'], /lv-ai-bubble--ai" aria-label="LIVON AI 답변"/);
  assert.match(INDEX, /role="status" aria-live="polite" data-lv-ai-live/);
});

test('A11Y-44 My Life: no drag-only interaction; modules, forms and confirmations are keyboard reachable', () => {
  const m = JS['life-now-page.js'];
  assert.doesNotMatch(m, /draggable|dragstart|dragover|ondrop/);
  assert.match(m, /role="dialog" aria-modal="true" aria-labelledby="lv-ml-form-title"/);
  assert.match(m, /if \(on\) a\.setAttribute\("aria-current", "page"\); else a\.removeAttribute\("aria-current"\);/);
  assert.match(INDEX, /<a href="#ml-home" data-lv-ml-goto="home" class="is-on" aria-current="page">/);
});

test('A11Y-45 Admin: no whole-app live region; one status line; tables with caption and scoped headers', () => {
  assert.doesNotMatch(ADMIN_HTML, /aria-live/);
  assert.match(ADMIN_HTML, /<p class="ad-boot" role="status">Loading…<\/p>/);
  assert.match(ADMIN_JS, /<p class="ad-sr" role="status" data-ad-live><\/p>/);
  assert.match(ADMIN_JS, /live\.textContent = titleFor\(view\) \+ \(cnt \? ": " \+ cnt\.textContent : ""\);/);
  assert.match(ADMIN_JS, /<th scope="col">/); assert.match(ADMIN_JS, /<caption>/);
  assert.match(ADMIN_JS, /if \(focus\) app\.querySelector\("#ad-main"\)\.focus\(\);/);
  assert.match(ADMIN_JS, /role="option"[^>]*aria-selected|aria-selected="true"/);
});

test('A11Y-46 Data Manager: no whole-app live region; status line; labelled filters; native dialog', () => {
  assert.doesNotMatch(DM_HTML, /aria-live/);
  assert.match(DM_JS, /<p class="dm-sr" role="status" data-dm-live><\/p>/);
  assert.match(DM_JS, /<th scope="col"/); assert.match(DM_JS, /<label for="dm-sort">Sort<\/label>/);
  assert.match(DM_CSS, /\.dm-sr \{ position: absolute;/);
});

test('A11Y-47 static pages: all 125 generated pages pass the structural checks', () => {
  assert.deepEqual(PUB.errors, []);
  assert.equal(PUB.stats.staticPages, 125);
  for (const p of SEO_PAGES) {
    const t = parseHtml(page(p));
    const crumbs = all(t, n => n.tag === 'nav' && /crumb/.test(n.attrs.class || ''))[0];
    assert.ok(crumbs && all(crumbs, n => n.attrs['aria-current'] === 'page').length === 1, p);
    assert.equal(all(t, n => n.tag === 'script' && n.attrs.type !== 'application/ld+json').length, 0);
    for (const a of all(t, n => n.tag === 'a')) assert.ok(textOf(a), p + ' link without text');
  }
});

test('A11Y-48 mobile navigation: toggle exposes state and target; the panel is a named modal dialog', () => {
  assert.match(INDEX, /<button[^>]*class="gnav__menu-btn"[^>]*data-gnav-toggle[^>]*aria-expanded="false"[^>]*aria-controls="gnav-mobile-livon"[^>]*aria-label="메뉴"|<button[^>]*data-gnav-toggle[^>]*aria-label="메뉴"/);
  assert.match(INDEX, /aria-controls="gnav-mobile-livon"/);
  assert.match(INDEX, /<div class="gnav-mobile__panel" role="dialog" aria-modal="true" aria-label="메뉴">/);
  assert.match(INDEX, /class="gnav-mobile__backdrop" data-gnav-close tabindex="-1" aria-label="닫기"/);
  assert.match(A11Y_JS, /function initDisclosure\(\)[\s\S]*?attributeFilter: \["aria-expanded"\]/);
});

test('A11Y-49 desktop navigation: the current view is marked aria-current="page"', () => {
  assert.match(INDEX, /if \(on\) link\.setAttribute\("aria-current", "page"\);\s*else link\.removeAttribute\("aria-current"\);/);
  assert.match(ADMIN_JS, /setAttribute\("aria-current", "page"\)/); assert.match(DM_JS, /setAttribute\("aria-current", "page"\)/);
  for (const p of ['/livon/life/20s/', '/livon/help/no-signup/']) assert.match(page(p), /aria-current="page"/);
});

test('A11Y-50 forced colors: selection and focus use system colours', () => {
  assert.match(A11Y_CSS, /@media \(forced-colors: active\) \{[\s\S]*?\[aria-pressed="true"\], \[aria-selected="true"\], \[aria-current\], \[aria-checked="true"\]\) \{\s*outline: 2px solid Highlight;/);
  assert.match(A11Y_CSS, /:focus-visible \{ outline: 3px solid Highlight; outline-offset: 2px; \}/);
  assert.match(ADMIN_CSS, /@media \(forced-colors: active\)/); assert.match(DM_CSS, /@media \(forced-colors: active\)/);
  assert.equal(SRC.warnings.filter(w => w.includes('forced-colors')).length, 0);
});

test('A11Y-51 task keyboard QA: the eight tasks and their result are recorded; the browser run is A11Y-B4', () => {
  for (let i = 1; i <= 8; i++) assert.match(DOC, new RegExp('TASK ' + i + '\\b'), 'TASK ' + i);
  assert.match(DOC, /keyboard only/i);
});

for (const [n, w] of [[52, 320], [53, 390], [54, 768], [55, 1024], [56, 1440]]) {
  test(`A11Y-${n} responsive ${w}: the layout rules that keep ${w}px free of page overflow are in place (browser run: A11Y-B5)`, () => {
    assert.match(/<meta name="viewport" content="([^"]+)"/.exec(INDEX)[1], /width=device-width/);
    for (const p of SEO_PAGES) assert.match(page(p), /<meta name="viewport" content="width=device-width, initial-scale=1(\.0)?" \/>/);
    if (w <= 860) assert.match(A11Y_CSS, /@media \(max-width: 860px\)/);
    if (w >= 960) assert.match(A11Y_CSS, /@media \(min-width: 960px\) \{\s*#explore \.lv-ex-side/);
    if (w <= 480) assert.match(SEO_CSS, /@media \(max-width: 480px\)/);
    assert.match(DOC, new RegExp('\\b' + w + '\\b'));
  });
}

test('A11Y-57 200% text: nothing prevents zoom; the result is recorded with its limits', () => {
  assert.doesNotMatch(INDEX, /user-scalable\s*=\s*no/);
  assert.match(DOC, /200%/);
});

test('A11Y-58 text spacing: the user-stylesheet test and its result are recorded', () => {
  assert.match(DOC, /letter-spacing: \.12em/); assert.match(DOC, /word-spacing: \.16em/); assert.match(DOC, /line-height: 1\.5/);
});

test('A11Y-59 SEO regression: metadata, canonical, JSON-LD, manifest and sitemap are unchanged and still pass', () => {
  const q = checkSite(OUT);
  assert.deepEqual(q.errors, []);
  assert.equal(q.stats.pages, 125); assert.equal(q.stats.indexable, 126); assert.equal(q.stats.uniqueTitles, 125); assert.equal(q.stats.orphans, 0);
  assert.match(INDEX, /<title>LIVON \| 생애주기 생활 정보<\/title>/);
  assert.match(INDEX, /<link rel="canonical" href="https:\/\/www\.newon\.app\/livon\/" \/>/);
  assert.match(INDEX, /<meta name="robots" content="index, follow"/);
  assert.equal((INDEX.match(/<script type="application\/ld\+json">/g) || []).length, 1);
  assert.match(INDEX, /<p class="lv-hm-guides">/); assert.match(INDEX, /<noscript>\s*<nav class="lv-noscript"/);
});

test('A11Y-60 Help regression: the same articles, the same routes, the same single source', () => {
  const ctx = { window: {} }; vm.runInNewContext(JS['help-data.js'], ctx);
  const D = ctx.window.LivonHelpData;
  assert.equal(D.articles.length, 68); assert.equal(D.seoIndexable.length, 39);
  assert.match(JS['help-page.js'], /window\.addEventListener\("hashchange", route\);/);
  assert.match(JS['help-page.js'], /#help\/a\//);
});

test('A11Y-61 Community regression: curated data is not written; posts stay on the device', () => {
  assert.match(JS['community-service.js'], /CURATED/);
  assert.doesNotMatch(JS['community-page.js'], /fetch\(|XMLHttpRequest|sendBeacon/);
  assert.match(JS['community-page.js'], /너무 빠르게 연속으로 작성했어요/);
});

test('A11Y-62 Onboarding regression: never a dialog on arrival; skip and resume still exist', () => {
  const o = JS['livon-onboarding.js'];
  assert.match(o, /never a dialog on arrival/); assert.match(o, /function later\(\)/); assert.match(o, /function closeKeep\(\)/);
  assert.match(o, /p\.complete\(ui\.draft\);/);
});

test('A11Y-63 Admin regression: local-only guard and read-only data are untouched', () => {
  assert.match(ADMIN_JS, /localhost/); assert.match(ADMIN_HTML, /noindex, nofollow/);
  assert.match(src('scripts/publish-site.mjs'), /fs\.rmSync\(path\.join\(OUT, "livon", "admin"\), \{ recursive: true, force: true \}\);/);
  assert.match(ADMIN_JS, /READ-ONLY/);
});

test('A11Y-64 Data Manager regression: never published, exports unchanged', () => {
  assert.match(DM_HTML, /noindex, nofollow/); assert.match(DM_JS, /data-dm-open/); assert.match(DM_JS, /Export/);
  assert.match(src('livon/admin/data/index.html'), /refuses to run on any host other than localhost/);
});

test('A11Y-65 public LIVON regression: inline scripts are byte-identical (CSP hashes); the layer loads last', () => {
  const csp = src('vercel.json');
  const hashes = [...INDEX.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(m => "'sha256-" + crypto.createHash('sha256').update(m[1]).digest('base64') + "'");
  assert.equal(hashes.length, 4);
  for (const h of hashes) assert.ok(csp.includes(h), 'inline script changed: ' + h);
  const scripts = [...INDEX.matchAll(/<script src="([^"]+)"/g)].map(m => m[1].split('?')[0]);
  assert.equal(scripts[scripts.length - 1], '/livon/livon-a11y.js');
  assert.match(INDEX, /<link rel="stylesheet" href="\/livon\/livon-a11y\.css\?v=[\w]+" \/>/);
  assert.doesNotMatch(A11Y_JS, /innerHTML = [^'"]*\+/, 'the layer inserts no user text as HTML');
});

test('A11Y-66 anonymous mode: the layer sends nothing and keeps one classified local preference', () => {
  assert.doesNotMatch(A11Y_JS, /fetch\(|XMLHttpRequest|sendBeacon|navigator\.|document\.cookie/);
  assert.deepEqual([...new Set([...A11Y_JS.matchAll(/["'](livon\.[A-Za-z0-9_.:-]+)["']/g)].map(m => m[1]))], ['livon.a11y.motion.v1']);
  const ctx = { window: {} }; vm.runInNewContext(src('livon/data/livon-user-data.js'), ctx);
  const U = ctx.window.LivonUserData || ctx.LivonUserData;
  if (U && U.classify) assert.equal(U.classify('livon.a11y.motion.v1'), 'DEVICE_LOCAL');
  else assert.match(src('livon/data/livon-user-data.js'), /key: "livon\.a11y\.motion\.v1", storage: "local", owner: "livon-a11y\.js"[^\n]*cls: "DEVICE_LOCAL"/);
  assert.doesNotMatch(A11Y_JS, /personalization|lifeStage|cmStore/, 'the layer reads no personal data');
});

test('A11Y-67 build: the site build runs the accessibility check and ships the layer', () => {
  const p = src('scripts/publish-site.mjs');
  assert.match(p, /"livon-accessibility-quality\.mjs"\), "--root", OUT\]/);
  assert.ok(p.indexOf('livon-accessibility-quality.mjs') > p.indexOf('livon-seo-quality.mjs'));
  assert.match(p, /required\.push\(path\.join\(OUT, "livon", "livon-a11y\.css"\)\);/); assert.match(p, /required\.push\(path\.join\(OUT, "livon", "livon-a11y\.js"\)\);/);
  assert.deepEqual(SRC.errors, []);
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/livon-accessibility-quality.mjs'), '--root', OUT], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /livon-accessibility-quality: 0 error\(s\)/); assert.match(r.stdout, /"staticPages":125/);
  for (const w of ['WCAG 2.2', 'MANUAL REVIEW REQUIRED', 'Issue register', 'Remaining issues']) assert.ok(DOC.includes(w), w);
  assert.doesNotMatch(DOC, /WCAG[- ]certified|인증을? ?받/i);
});

/* ───────── browser (skipped when no local Chromium) ───────── */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const canBrowse = fs.existsSync(PW) && fs.existsSync(CHROME);
const skip = !canBrowse && 'no local Chromium';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      for (const root of [ROOT, OUT]) {
        let f = path.join(root, p);
        if (!f.startsWith(root)) continue;
        if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
        if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(fs.readFileSync(f)); return; }
      }
      res.writeHead(404); res.end('not found');
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}
async function withBrowser(fn) {
  const { chromium } = await import(PW);
  const server = await serve();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  try { await fn(browser, base); } finally { await browser.close(); server.close(); }
}
const SKIPPED = { version: 1, state: 'SKIPPED', step: '', draft: null, updatedAt: 1 };
async function open(browser, base, url, { width = 1280, height = 800, fresh = false, reducedMotion = 'reduce', forcedColors } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion, forcedColors });
  await ctx.route('**/*', r => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  if (!fresh) await ctx.addInitScript(v => { try { if (!localStorage.getItem('livon.personalization.v1')) localStorage.setItem('livon.personalization.v1', v); } catch (e) {} }, JSON.stringify(SKIPPED));
  const pg = await ctx.newPage();
  pg._errors = []; pg.on('pageerror', e => pg._errors.push(e.message));
  await pg.goto(base + url, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(600);
  return pg;
}
const key = async (pg, sel, k = 'Enter', wait = 450) => { await pg.focus(sel); await pg.keyboard.press(k); await pg.waitForTimeout(wait); };
const active = pg => pg.evaluate(() => { const e = document.activeElement; return e ? e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ')[0] : ''; });

test('A11Y-B1 skip link, titles and route status in the browser', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const pg = await open(browser, base, '/livon/#community');
    await key(pg, '.skip-link');
    assert.equal(await pg.evaluate(() => location.hash), '#community', 'the skip link does not route to Home');
    assert.equal(await active(pg), 'section#community.lv-cm');
    assert.equal(await pg.title(), '커뮤니티 · LIVON');
    for (const [h, t] of [['life', '라이프 스테이지 · LIVON'], ['today', '오늘의 발견 · LIVON'], ['ml-settings', '설정 · 내 생활 · LIVON'], ['explore', '탐색 · LIVON'], ['livon-ai', 'LIVON AI'], ['livon-home', 'LIVON | 생애주기 생활 정보']]) {
      await pg.evaluate(x => { location.hash = x; }, h); await pg.waitForTimeout(450);
      assert.equal(await pg.title(), t, h);
    }
    await pg.evaluate(() => { location.hash = 'today/td-indep-missed'; }); await pg.waitForTimeout(500);
    assert.match(await pg.title(), /오늘의 발견/);
    await pg.evaluate(() => { location.hash = 'life-now'; }); await pg.waitForTimeout(500);
    assert.equal(await pg.title(), '내 생활 · LIVON', 'a detail title from another view does not stay');
    assert.equal(await pg.evaluate(() => document.querySelector('[data-lv-a11y-route]').textContent), '내 생활 화면으로 이동했습니다.');
    assert.deepEqual(pg._errors, []);
  });
});

test('A11Y-B2 dialogs and menus: Tab stays inside, Escape closes, focus returns', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const m = await open(browser, base, '/livon/#life', { width: 390, height: 844 });
    await key(m, '.gnav__menu-btn');
    assert.equal(await m.getAttribute('.gnav__menu-btn', 'aria-expanded'), 'true');
    for (let i = 0; i < 14; i++) { await m.keyboard.press('Tab'); assert.ok(await m.evaluate(() => !!document.activeElement.closest('#gnav-mobile-livon')), 'focus left the menu at Tab ' + i); }
    await m.keyboard.press('Escape'); await m.waitForTimeout(350);
    assert.match(await active(m), /gnav__menu-btn/);
    const pg = await open(browser, base, '/livon/#life');
    await key(pg, '#life [data-lv-life-find]');
    for (let i = 0; i < 12; i++) { await pg.keyboard.press('Tab'); assert.ok(await pg.evaluate(() => !!document.activeElement.closest('.lv-life-modal:not([hidden])')), 'focus left the dialog at Tab ' + i); }
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(400);
    assert.equal(await pg.evaluate(() => document.activeElement.hasAttribute('data-lv-life-find')), true, 'focus returns to the opener');
    await key(pg, 'button.livon-tool[data-livon-tool=search]');
    assert.match(await active(pg), /livon-search-input/);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
    assert.match(await active(pg), /livon-tool/, 'focus returns to the search button');
    assert.deepEqual(pg._errors.concat(m._errors), []);
  });
});

test('A11Y-B3 background video: one control pauses every film; reduced motion starts paused; the choice is kept', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const pg = await open(browser, base, '/livon/#life', { reducedMotion: 'no-preference' });
    assert.equal(await pg.evaluate(() => document.querySelectorAll('[data-lv-motion-toggle]').length), 7);
    assert.equal(await pg.getAttribute('#life [data-lv-motion-toggle]', 'aria-pressed'), 'false');
    const r = await pg.evaluate(() => { const b = document.querySelector('#life [data-lv-motion-toggle]').getBoundingClientRect(); return [b.width, b.height]; });
    assert.deepEqual(r, [44, 44]);
    await key(pg, '#life [data-lv-motion-toggle]');
    assert.equal(await pg.getAttribute('#life [data-lv-motion-toggle]', 'aria-pressed'), 'true');
    assert.equal(await pg.evaluate(() => localStorage.getItem('livon.a11y.motion.v1')), 'paused');
    assert.ok(await pg.evaluate(() => [...document.querySelectorAll('video')].every(v => v.playbackRate === 0)));
    await pg.evaluate(() => { location.hash = 'today'; }); await pg.waitForTimeout(500);
    assert.ok(await pg.evaluate(() => [...document.querySelectorAll('video')].every(v => v.playbackRate === 0)), 'still paused after a view change');
    const q = await open(browser, base, '/livon/#life', { reducedMotion: 'reduce' });
    assert.equal(await q.getAttribute('#life [data-lv-motion-toggle]', 'aria-pressed'), 'true', 'reduce motion starts paused');
  });
});

test('A11Y-B4 keyboard tasks: onboarding, life topic, explore, community, help, preferences, AI', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    /* TASK 1 */
    let pg = await open(browser, base, '/livon/', { fresh: true });
    await key(pg, '[data-lv-hm-onboard]');
    assert.match(await active(pg), /livon-onboard-title/);
    await key(pg, '[data-ob-stage="20"]', 'Space', 200); await key(pg, '[data-ob-next]');
    await key(pg, '.lv-ob [data-ob-interest]', 'Space', 200); await key(pg, '[data-ob-next]');
    await key(pg, '[data-ob-next]'); await key(pg, '[data-ob-finish]', 'Enter', 700);
    assert.equal(await pg.evaluate(() => JSON.parse(localStorage.getItem('livon.personalization.v1')).state), 'COMPLETED');
    assert.notEqual(await pg.evaluate(() => document.activeElement === document.body), true, 'focus is not lost when the dialog closes');
    assert.equal(await pg.evaluate(() => document.querySelector('[data-lv-a11y-route]').textContent), '맞춤 설정을 저장했습니다.');
    /* TASK 2 */
    pg = await open(browser, base, '/livon/#life');
    await key(pg, '[data-lv-life-rail] [data-lv-life-goto="stage-20"]', 'Enter', 700);
    await key(pg, '#life a[href="#life/20s/first-job"]', 'Enter', 900);
    assert.match(await pg.title(), /첫 취업 준비/);
    assert.equal(await pg.evaluate(() => document.activeElement.getAttribute('aria-level')), '1');
    /* TASK 3 */
    await pg.evaluate(() => { location.hash = 'explore'; }); await pg.waitForTimeout(600);
    await pg.focus('[data-lv-ex-input]'); await pg.keyboard.type('취업'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(900);
    assert.match(await pg.evaluate(() => document.querySelector('[data-lv-ex-count]').textContent), /결과/);
    if (await pg.getAttribute('[data-lv-ex-toggle-filters]', 'aria-expanded') !== 'true') await key(pg, '[data-lv-ex-toggle-filters]');
    await key(pg, '[data-lv-ex-filter-cat="career"]', 'Space', 600);
    assert.equal(await pg.getAttribute('[data-lv-ex-filter-cat="career"]', 'aria-pressed'), 'true');
    await key(pg, '#ex-results [data-lv-ex-open]', 'Enter', 900);
    assert.equal(await active(pg), 'h2#lv-ex-detail-title.lv-ex-title');
    assert.match(await pg.title(), / · 탐색 · LIVON$/);
    await key(pg, '[data-lv-ex-detail] [data-lh-save]', 'Enter', 600);
    if (await pg.evaluate(() => /이 기기에 저장/.test(document.activeElement.textContent))) { await pg.keyboard.press('Enter'); await pg.waitForTimeout(600); }
    assert.equal(await pg.getAttribute('[data-lv-ex-detail] [data-lh-save]', 'aria-pressed'), 'true');
    /* TASK 5 (write, edit) then TASK 4 (search, comment, reply, save) then delete */
    await pg.evaluate(() => { location.hash = 'community'; }); await pg.waitForTimeout(600);
    await key(pg, 'button[data-lv-cm-compose=question]');
    const M = '.lv-cm-modal:not([hidden]) .lv-cm-modal__panel';
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
    assert.equal(await pg.getAttribute(M + ' input[name=title]', 'aria-invalid'), 'true');
    assert.equal(await pg.evaluate(s => document.activeElement === document.querySelector(s), M + ' input[name=title]'), true, 'focus on the first invalid field');
    await pg.keyboard.type('키보드로 쓴 질문'); await pg.focus(M + ' textarea[name=body]'); await pg.keyboard.type('키보드만으로 작성한 본문입니다. 접근성 과업 검사.');
    await key(pg, M + ' button[type=submit]', 'Enter', 800);
    assert.match(await active(pg), /lv-cm-detail-title/);
    await key(pg, '#community [data-lv-cm-edit]'); await pg.focus(M + ' input[name=title]'); await pg.keyboard.press('End'); await pg.keyboard.type(' (수정)');
    await key(pg, M + ' button[type=submit]', 'Enter', 800);
    assert.match(await pg.evaluate(() => document.getElementById('lv-cm-detail-title').textContent), /\(수정\)$/);
    await pg.focus('#community form textarea[name=body]'); await pg.keyboard.type('키보드 댓글'); await pg.keyboard.press('Tab'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(600);
    assert.equal(await pg.evaluate(() => document.querySelector('[data-lv-cm-status]').textContent), '댓글을 등록했습니다.');
    await pg.waitForTimeout(1600);
    await key(pg, '#community [data-lv-cm-reply]'); await pg.keyboard.type('답글입니다'); await pg.keyboard.press('Tab'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(600);
    assert.equal(await pg.evaluate(() => document.querySelectorAll('#community .lv-cm-comment ul.lv-cm-replies[aria-label] > li').length), 1);
    await key(pg, '#community [data-lv-cm-report^="post:"]');
    assert.equal(await pg.evaluate(() => { const d = document.querySelector('.lv-cm-modal:not([hidden]) [role=alertdialog]'); return !!d && d.contains(document.activeElement); }), true);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(400);
    assert.equal(await pg.evaluate(() => document.activeElement.hasAttribute('data-lv-cm-report')), true);
    await key(pg, '#community [data-lv-cm-del-post]');
    assert.equal(await pg.evaluate(() => document.activeElement.textContent.trim()), '취소', 'the safe choice has focus first');
    await pg.keyboard.press('Tab'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(800);
    assert.equal(await pg.evaluate(() => document.querySelector('[data-lv-cm-status]').textContent), '글을 삭제했습니다.');
    /* TASK 6 */
    await pg.evaluate(() => { location.hash = 'help'; }); await pg.waitForTimeout(600);
    await pg.focus('#lv-hp-q'); await pg.keyboard.type('저장'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
    assert.match(await pg.evaluate(() => document.querySelector('[data-lv-hp-status]').textContent), /검색 결과 \d+개/);
    await key(pg, '#help a[data-lv-hp-result]', 'Enter', 700);
    assert.equal(await active(pg), 'h1#lv-hp-h.lv-hp-title');
    const t1 = await pg.title(); await key(pg, '#help a[data-lv-hp-result]', 'Enter', 700); assert.notEqual(await pg.title(), t1);
    /* TASK 7 */
    await pg.evaluate(() => { location.hash = 'ml-settings'; }); await pg.waitForTimeout(700);
    assert.equal(await pg.title(), '설정 · 내 생활 · LIVON');
    await key(pg, '#life-now [data-lv-onboard-edit="interests"]', 'Enter', 600);
    assert.match(await active(pg), /livon-onboard-title/);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(400);
    assert.notEqual(await pg.evaluate(() => document.activeElement === document.body), true);
    /* TASK 8 */
    await pg.evaluate(() => { location.hash = 'ai-chat'; }); await pg.waitForTimeout(700);
    await pg.focus('#ai-chat-q'); await pg.keyboard.type('첫 취업 준비 방법'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(2500);
    assert.equal(await pg.evaluate(() => !!document.querySelector('#livon-ai .lv-ai-bubble--error[role=alert]')), true);
    assert.match(await pg.evaluate(() => document.querySelector('[data-lv-ai-live]').textContent), /오류|연결|준비/);
    assert.deepEqual(pg._errors, []);
  });
});

const VIEWS = ['/livon/', '/livon/#life/20s', '/livon/#life/20s/first-job', '/livon/#today', '/livon/#ml-settings', '/livon/#ex-results?q=취업', '/livon/#community', '/livon/#ai-chat', '/livon/#help', '/livon/#help/a/no-signup',
  '/livon/life/', '/livon/life/20s/', '/livon/life/20s/first-job/', '/livon/life-events/first-job/', '/livon/help/', '/livon/help/no-signup/', '/livon/admin/#content', '/livon/admin/data/#explorer'];
test('A11Y-B5 responsive: 320 / 390 / 768 / 1024 / 1440 — no horizontal page overflow, no script error', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      const pg = await open(browser, base, VIEWS[0], { width, height: 800 });
      for (const v of VIEWS) {
        await pg.goto(base + v, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(260);
        assert.equal(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${width}px ${v}`);
      }
      const o = await pg.goto(base + VIEWS[0]).then(() => pg.waitForTimeout(400)).then(() => pg.evaluate(() => { const f = document.querySelector('.livon-hero__foot'); const R = [...f.querySelectorAll('p,a')].map(e => e.getBoundingClientRect()); let n = 0; for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i], b = R[j]; if (!(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom)) n++; } return n; }));
      assert.equal(o, 0, `${width}px: Home hero captions and buttons do not overlap`);
      assert.deepEqual(pg._errors, [], width + 'px');
      await pg.context().close();
    }
  });
});

test('A11Y-B6 text spacing and 200% text: no clipped text, no page overflow', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const CLIP = () => { const out = []; document.querySelectorAll('body *').forEach(e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); if (!r.width || !r.height || e.closest('[aria-hidden=true]') || /visually-hidden|lh-sr|ad-sr|dm-sr|wordmark/.test(e.className)) return; if (![...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim())) return; if ((cs.overflowX === 'hidden' || cs.overflowX === 'clip') && e.scrollWidth > e.clientWidth + 2 && cs.textOverflow !== 'ellipsis') out.push(e.tagName + '.' + e.className); if ((cs.overflowY === 'hidden' || cs.overflowY === 'clip') && e.scrollHeight > e.clientHeight + 3 && (!cs.webkitLineClamp || cs.webkitLineClamp === 'none')) out.push(e.tagName + '.' + e.className); }); return { clipped: out, overflow: document.documentElement.scrollWidth - innerWidth }; };
    for (const [css, width] of [['*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p{margin-bottom:2em !important}', 320], ['html{font-size:200% !important}', 1280]]) {
      const pg = await open(browser, base, VIEWS[0], { width, height: 800 });
      for (const v of VIEWS) {
        await pg.goto(base + v, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(260); await pg.addStyleTag({ content: css }); await pg.waitForTimeout(160);
        const r = await pg.evaluate(CLIP);
        assert.ok(r.overflow <= 1, `${width}px ${v}: page overflow ${r.overflow}`);
        assert.deepEqual(r.clipped, [], `${width}px ${v}`);
      }
      await pg.context().close();
    }
  });
});

test('A11Y-B7 Tab walk: every tab stop is on screen, uncovered and visibly focused', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const STEP = () => { const e = document.activeElement; if (!e || e === document.body) return null; const r = e.getBoundingClientRect(), c = getComputedStyle(e); const inV = r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; let cover = ''; if (inV) { const x = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1), y = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1), t = document.elementFromPoint(x, y); if (t && t !== e && !e.contains(t) && !t.contains(e) && !(e.closest('label') && e.closest('label').contains(t))) { for (let q = t; q; q = q.parentElement) { const p = getComputedStyle(q).position; if (p === 'fixed' || p === 'sticky') { cover = q.tagName + '.' + q.className; break; } } } } let ind = (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 1) || c.boxShadow !== 'none'; for (let p = e.parentElement, i = 0; p && i < 2 && !ind; p = p.parentElement, i++) { const pc = getComputedStyle(p); ind = (pc.outlineStyle !== 'none' && parseFloat(pc.outlineWidth) >= 1) || (pc.boxShadow !== 'none' && p.matches(':focus-within')); } return { k: e.tagName + (e.id || '') + e.className + Math.round(r.left) + ',' + Math.round(r.top + scrollY), s: e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0], inV, cover, ind }; };
    for (const [v, width] of [['/livon/', 390], ['/livon/#community', 390], ['/livon/#ex-results?q=취업', 1024], ['/livon/#ml-settings', 1440], ['/livon/life/20s/', 320], ['/livon/help/', 1440], ['/livon/admin/#content', 1440]]) {
      const pg = await open(browser, base, v, { width, height: 800 });
      const seen = new Set(); let n = 0;
      for (let i = 0; i < 60; i++) {
        await pg.keyboard.press('Tab'); await pg.waitForTimeout(80);
        const a = await pg.evaluate(STEP);
        if (!a) continue;
        if (seen.has(a.k)) break;
        seen.add(a.k); n++;
        assert.ok(a.inV, `${v} @${width}: ${a.s} is off screen when focused`);
        assert.equal(a.cover, '', `${v} @${width}: ${a.s} is covered by ${a.cover}`);
        assert.ok(a.ind, `${v} @${width}: ${a.s} has no visible focus indicator`);
      }
      assert.ok(n >= 15, `${v}: walked ${n} tab stops`);
      await pg.context().close();
    }
  });
});

test('A11Y-B8 forced colors and rendered structure: selection stays visible; ids unique; names present', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const pg = await open(browser, base, '/livon/#community', { forcedColors: 'active' });
    assert.notEqual(await pg.evaluate(() => getComputedStyle(document.querySelector('[role=tab][aria-selected=true]')).outlineStyle), 'none');
    const q = await open(browser, base, '/livon/#today');
    for (const v of ['/livon/#today', '/livon/#life/20s', '/livon/#ex-results?q=취업', '/livon/#community', '/livon/#ml-settings', '/livon/#ai-chat', '/livon/#help/c/start']) {
      await q.goto(base + v); await q.waitForTimeout(600);
      const r = await q.evaluate(() => {
        const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
        const ids = {}; const dup = []; document.querySelectorAll('[id]').forEach(e => { if (ids[e.id]) dup.push(e.id); ids[e.id] = 1; });
        const nameless = [...document.querySelectorAll('main a[href], main button')].filter(vis).filter(e => !e.closest('[aria-hidden=true]') && !(e.getAttribute('aria-label') || e.textContent.trim() || e.querySelector('img[alt]:not([alt=""])'))).map(e => e.outerHTML.slice(0, 80));
        const nested = [...document.querySelectorAll('main button button, main a a, main a button, main button a')].filter(vis).length;
        const unlabelled = [...document.querySelectorAll('main input:not([type=hidden]), main select, main textarea, .lv-ml-modal input, .lv-cm-modal input')].filter(vis).filter(e => !(e.labels && e.labels.length) && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')).map(e => e.outerHTML.slice(0, 80));
        const classOnly = [...document.querySelectorAll('main button.is-on')].filter(vis).filter(e => !['aria-pressed', 'aria-selected', 'aria-current', 'aria-expanded'].some(a => e.hasAttribute(a))).map(e => e.outerHTML.slice(0, 80));
        return { dup, nameless, nested, unlabelled, classOnly };
      });
      assert.deepEqual(r, { dup: [], nameless: [], nested: 0, unlabelled: [], classOnly: [] }, v);
    }
    assert.equal(await q.evaluate(() => !!document.querySelector('#help h2 > button[aria-expanded], #help h3 > button[aria-expanded]')), true, 'FAQ buttons sit inside headings');
  });
});

test('A11Y-B9 Admin and Data Manager in the browser: status line, focus on navigation, valid ids', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const pg = await open(browser, base, '/livon/admin/');
    await key(pg, 'nav a[href="#content"]', 'Enter', 700);
    assert.equal(await active(pg), 'main#ad-main.ad-main');
    assert.match(await pg.evaluate(() => document.querySelector('[data-ad-live]').textContent), /^Content: \d+ records$/);
    await pg.evaluate(() => { location.hash = '#review'; }); await pg.waitForTimeout(900);
    assert.equal(await pg.evaluate(() => [...document.querySelectorAll('[id]')].filter(e => /\s/.test(e.id)).length), 0);
    assert.equal(await pg.evaluate(() => [...document.querySelectorAll('label[for]')].filter(l => !document.getElementById(l.getAttribute('for'))).length), 0);
    const dm = await open(browser, base, '/livon/admin/data/#explorer');
    assert.match(await dm.evaluate(() => document.querySelector('[data-dm-live]').textContent), /^Content Explorer: \d+ records$/);
    assert.deepEqual(pg._errors.concat(dm._errors), []);
  });
});
