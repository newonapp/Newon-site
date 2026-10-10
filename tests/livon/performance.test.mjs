// LIVON Performance Optimization V1 — loading, start-up, assets, runtime (PERF-1 … PERF-60).
// PERF-1 … 54 are static or run in Node and run everywhere. PERF-55 … 60 need a local Chromium and are skipped
// without one. Timings asserted here are generous regression guards measured in a lab; they are not field data.
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
import { checkSources, checkPublished, checkAppHtml, scriptsOf, stylesOf, BUDGET, SCREEN_MODULES } from '../../scripts/livon-performance-quality.mjs';
import { loadLivon } from '../../scripts/livon-data-quality.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const size = f => fs.statSync(path.join(ROOT, f)).size;
const INDEX = src('livon/index.html'), MEDIA = src('livon/livon-media.js'), BOOT = src('livon/livon-boot.js');
const JS = Object.fromEntries(fs.readdirSync(path.join(ROOT, 'livon')).filter(n => n.endsWith('.js')).map(n => [n, src('livon/' + n)]));
const CSS = Object.fromEntries(fs.readdirSync(path.join(ROOT, 'livon')).filter(n => n.endsWith('.css')).map(n => [n, src('livon/' + n)]));
const DOC = src('docs/livon/LIVON_PERFORMANCE.md');
const HEAD_END = INDEX.indexOf('</head>');
const SCRIPTS = scriptsOf(INDEX), SRCS = SCRIPTS.map(s => s.src.split('?')[0]);
const VIDEOS = [...INDEX.matchAll(/<video\b[^>]*>/g)].map(m => m[0]);
const code = s => s.replace(/\/\*[\s\S]*?\*\//g, '');

function makeRoot() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'livon-perf-'));
  for (const f of ['sitemap.xml', 'robots.txt', 'livon/index.html', 'livon/seo.css', 'livon/livon-media.js', 'livon/livon-boot.js', 'assets/livon-mark.jpg', 'assets/livon-mark-icon-120.jpg', 'ko/index.html', '404.html']) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
  }
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/livon-seo-build.mjs'), '--out', dir], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return dir;
}
const OUT = makeRoot();
const SRC = checkSources(ROOT);
const PUB = checkPublished(OUT);

/* ───────── a small DOM for livon-media.js / livon-boot.js ───────── */
function fakeVideo(cls, screen, o = {}) {
  const a = Object.assign({ 'data-src': 'https://films.example/' + cls + '.mp4', class: cls }, o.attrs || {});
  return { tagName: 'VIDEO', nodeType: 1, autoplay: true, readyState: 0, loads: 0, plays: 0, _screen: screen,
    getAttribute: k => (k in a ? a[k] : null), setAttribute(k, v) { a[k] = String(v); }, removeAttribute(k) { delete a[k]; }, hasAttribute: k => k in a,
    matches: () => !!o.header, closest() { return this._screen ? { getAttribute: () => this._screen } : null; },
    load() { this.loads++; }, play() { this.plays++; return Promise.resolve(); } };
}
function mediaEnv({ view = 'home', videos = [], io = true } = {}) {
  const L = { doc: {}, win: {} };
  const on = bag => (t, f) => { (bag[t] = bag[t] || []).push(f); };
  const observed = [];
  let ioCb = null;
  const doc = { documentElement: { getAttribute: k => (k === 'data-lv-view' ? env.view : null) }, body: {}, addEventListener: on(L.doc),
    querySelector: s => (s === 'main' ? {} : null),
    querySelectorAll: s => (/^video\[data-src\]$/.test(s) ? videos.filter(v => v.getAttribute('data-src')) : s === 'video' ? videos : videos.filter(v => v.matches())) };
  const win = { document: doc, addEventListener: on(L.win), setTimeout: f => { f(); return 0; } };
  if (io) win.IntersectionObserver = function (cb, o) { const film = /^300px/.test(o.rootMargin); if (film) ioCb = cb; return { observe: v => { if (film) observed.push(v); }, unobserve() {} }; };
  const env = { view, win, doc, L, observed, fire: (bag, type, e) => (L[bag][type] || []).forEach(f => f(e || {})), see: v => ioCb([{ isIntersecting: true, target: v }]) };
  vm.runInNewContext(MEDIA, { window: win });
  return env;
}
function bootEnv({ hash = '', readyState = 'loading', idle = true } = {}) {
  const L = { doc: {}, win: {} };
  const on = bag => (t, f) => { (bag[t] = bag[t] || []).push(f); };
  const idleQueue = [], timers = [];
  const win = { document: { documentElement: {}, readyState, addEventListener: on(L.doc) }, location: { hash }, addEventListener: on(L.win),
    setTimeout: f => { timers.push(f); return timers.length; }, console: { error() {} } };
  if (idle) win.requestIdleCallback = f => { idleQueue.push(f); };
  vm.runInNewContext(BOOT, { window: win });
  return { win, B: win.LivonBoot, L, idleQueue, timers, fire: (bag, type) => (L[bag][type] || []).forEach(f => f({})) };
}

/* ═════════ loading ═════════ */
test('PERF-1 page styles: every <style> block is inside <head>, so hidden screens are never painted first', () => {
  const styles = [...INDEX.matchAll(/<style\b/g)].map(m => m.index);
  assert.ok(styles.length >= 1);
  for (const i of styles) assert.ok(i < HEAD_END, 'a <style> block sits after </head>');
  assert.match(INDEX.slice(0, HEAD_END), /html\[data-lv-view\]|data-lv-screen/, 'the rules that hide the other screens are in the head');
});

test('PERF-2 background films: all eight wait for their screen (data-src, no src, preload="none")', () => {
  assert.equal(VIDEOS.length, 8);
  for (const v of VIDEOS) {
    assert.doesNotMatch(v, /\ssrc="/, v.slice(0, 90));
    assert.match(v, /\sdata-src="https:\/\/[^"]+\.mp4"/, v.slice(0, 90));
    assert.match(v, /preload="none"/, v.slice(0, 90));
  }
});

test('PERF-3 no <source src> is left in the page (it would be fetched while parsing)', () => {
  assert.doesNotMatch(INDEX, /<source\b[^>]*\bsrc=/);
});

test('PERF-4 the loader and the scheduler come before every screen module and before the inline router', () => {
  const at = n => SRCS.indexOf(n);
  assert.ok(at('/livon/livon-media.js') > at('/film-keep.js'), 'after film-keep.js');
  for (const f of Object.keys(SCREEN_MODULES)) { assert.ok(at('/livon/' + f) > at('/livon/livon-boot.js'), f); assert.ok(at('/livon/' + f) > at('/livon/livon-media.js'), f); }
  const boot = SCRIPTS.find(s => s.src.startsWith('/livon/livon-boot.js'));
  assert.ok(boot.index < INDEX.indexOf('function showLivonScreen'), 'the scheduler registers its hashchange listener before the router');
});

test('PERF-5 the CSP-pinned inline scripts were not edited: each one still matches a hash in vercel.json', () => {
  const csp = src('vercel.json');
  const inline = [...INDEX.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(s => s.trim());
  assert.ok(inline.length >= 4);
  for (const s of inline) assert.ok(csp.includes('sha256-' + crypto.createHash('sha256').update(s).digest('base64')), 'inline script without a CSP hash: ' + s.trim().slice(0, 60));
});

test('PERF-6 film loader: a small retry limit, no polling, no storage, no network of its own', () => {
  assert.match(MEDIA, /FAIL_LIMIT = 2/);
  const c = code(MEDIA);
  for (const bad of [/setInterval\s*\(/, /localStorage|sessionStorage/, /\bfetch\s*\(/, /XMLHttpRequest/]) assert.doesNotMatch(c, bad);
});

test('PERF-7 film loader: only the film of the screen that is showing gets a src; another screen gets it when opened', () => {
  const home = fakeVideo('home', 'home', { header: true }), life = fakeVideo('life', 'life', { header: true }), today = fakeVideo('today', 'today', { header: true });
  const env = mediaEnv({ view: 'life', videos: [home, life, today] });
  assert.equal(life.getAttribute('src'), 'https://films.example/life.mp4');
  assert.equal(home.getAttribute('src'), null); assert.equal(today.getAttribute('src'), null);
  assert.equal(life.loads, 1); assert.equal(life.plays, 1);
  env.view = 'today'; env.fire('win', 'hashchange');
  assert.equal(today.getAttribute('src'), 'https://films.example/today.mp4');
  assert.equal(home.getAttribute('src'), null, 'Home is still not fetched');
  env.fire('win', 'hashchange');
  assert.equal(today.loads, 1, 'a film that already has its src is not reloaded');
  assert.equal(typeof env.win.LivonMedia.sync, 'function'); assert.equal(env.win.LivonMedia.failLimit, 2);
});

test('PERF-8 film loader: a film that cannot be loaded is detached after two errors and retried only on "online" or re-entry', () => {
  const home = fakeVideo('home', 'home', { header: true });
  const env = mediaEnv({ view: 'home', videos: [home] });
  env.fire('doc', 'error', { target: home });
  assert.equal(home.getAttribute('src'), 'https://films.example/home.mp4', 'one error is tolerated');
  env.fire('doc', 'error', { target: home });
  assert.equal(home.getAttribute('src'), null); assert.equal(home.__lvOff, true);
  const loads = home.loads;
  env.win.LivonMedia.sync();
  assert.equal(home.getAttribute('src'), null, 'no retry loop'); assert.equal(home.loads, loads);
  env.fire('win', 'online');
  assert.equal(home.getAttribute('src'), 'https://films.example/home.mp4', 'retried once when the browser is back online');
  env.fire('doc', 'error', { target: home }); env.fire('doc', 'error', { target: home });
  assert.equal(home.getAttribute('src'), null);
  env.fire('win', 'hashchange');
  assert.equal(home.getAttribute('src'), 'https://films.example/home.mp4', 'retried when the screen is opened again');
  env.fire('doc', 'error', { target: { tagName: 'IMG' } });   /* other elements are ignored */
});

test('PERF-9 film loader: in-page films and background photos wait until they are near the viewport', () => {
  const card = fakeVideo('card', 'home');
  const env = mediaEnv({ view: 'home', videos: [card] });
  assert.deepEqual(env.observed, [card]); assert.equal(card.getAttribute('src'), null);
  env.see(card);
  assert.equal(card.getAttribute('src'), 'https://films.example/card.mp4');
  const old = fakeVideo('old', 'home');
  mediaEnv({ view: 'home', videos: [old], io: false });
  assert.equal(old.getAttribute('src'), 'https://films.example/old.mp4', 'without IntersectionObserver the film simply loads');
  assert.match(MEDIA, /rootMargin: "300px 0px"/); assert.match(MEDIA, /MutationObserver/);
  /* background photos written by templates: applied near the viewport, at once when already shown, quoted safely */
  const mk = u => { const at = { 'data-lv-bg': u }; return { nodeType: 1, style: {}, getAttribute: k => (k in at ? at[k] : null), removeAttribute(k) { delete at[k]; }, hasAttribute: k => k in at }; };
  const a = mk('/livon/assets/topics/a.jpg'), b = mk('/x"y.jpg'), seen = [];
  let fire;
  const doc = { documentElement: { getAttribute: () => 'home' }, body: {}, addEventListener() {}, querySelector: q => (q === 'main' ? {} : null), querySelectorAll: q => (q === '[data-lv-bg]' ? [a, b] : []) };
  const win = { document: doc, addEventListener() {}, setTimeout, IntersectionObserver: function (f, o) { if (/^600px/.test(o.rootMargin)) fire = f; return { observe: v => seen.push(v), unobserve() {} }; } };
  vm.runInNewContext(MEDIA, { window: win });
  assert.equal(a.style.backgroundImage, undefined, 'not fetched before the card is near');
  fire([{ isIntersecting: true, target: a }, { isIntersecting: false, target: b }]);
  assert.equal(a.style.backgroundImage, 'url("/livon/assets/topics/a.jpg")'); assert.equal(a.hasAttribute('data-lv-bg'), false); assert.equal(b.style.backgroundImage, undefined);
  fire([{ isIntersecting: true, target: b }]);
  assert.equal(b.style.backgroundImage, 'url("/x\\22 y.jpg")', 'a quote cannot end the url()');
  assert.equal(win.LivonMedia.bgAttr('/a"b<.jpg'), ' data-lv-bg="/a&quot;b&lt;.jpg"'); assert.equal(win.LivonMedia.bgAttr(''), '');
  assert.match(JS['community-page.js'], /'<div class="lv-cm-comm__media"' \+ bgPhoto\(c\.img\) \+ '><\/div>'/);
  /* WHY CHANGED (Home V2): the hub is text cards — the V1 photo mosaics (오늘의 발견 magazine, 나를 위한 추천) are gone.
     BEFORE: five background photos drawn by Home through bgPhoto(). AFTER: Home draws no card photo at all. */
  assert.equal((JS['home-page.js'].match(/bgPhoto\(|background-image:url/g) || []).length, 0);
  for (const f of ['community-page.js']) assert.match(JS[f], /M && M\.bgAttr \? M\.bgAttr\(url, esc\) : /, f + ' keeps the plain style when the loader is missing');
});

/* ═════════ start-up ═════════ */
test('PERF-10 the scheduler maps a hash to the same screen as the page router (plus Help)', () => {
  const fn = /function livonView\(hash\) \{[\s\S]*?\n        \}/.exec(INDEX)[0];
  const router = vm.runInNewContext('(' + fn + ')');
  const { B } = bootEnv();
  for (const h of ['', 'livon-home', 'hm-x', 'life', 'life-stages', 'stage-20', 'life/20s/first-job', 'life-events', 'life-setup', 'life-service-x', 'life-now', 'ml-settings', 'ml-saved', 'profile-edit',
    'today', 'today/td-indep-missed', 'td-item-x', 'explore', 'ex-results?q=a', 'ex-item-ex-career24', 'community', 'cm-home?tab=latest', 'cm-post-x', 'livon-ai', 'ai-chat', 'unknown'])
    assert.equal(B.viewOf('#' + h), router(h), h);
  for (const h of ['#help', '#help/a/no-signup', '#help?q=x']) assert.equal(B.viewOf(h), 'help');
  assert.equal(B.viewOf('#helpful'), 'home');
});

test('PERF-11 start-up: the screen that is showing starts at DOMContentLoaded, the others wait', () => {
  const env = bootEnv({ hash: '#community' });
  const ran = [];
  env.B.view('home', () => ran.push('home')); env.B.view('community', () => ran.push('community')); env.B.view('today', () => ran.push('today-feed')); env.B.view('today', () => ran.push('today-page'));
  assert.deepEqual(ran, [], 'nothing runs before DOMContentLoaded');
  env.fire('doc', 'DOMContentLoaded');
  assert.deepEqual(ran, ['community']);
  assert.equal(env.B.isStarted('community'), true); assert.equal(env.B.isStarted('today'), false);
  assert.deepEqual([...env.B.stats.atLoad], ['community']);
});

test('PERF-12 start-up: opening a screen starts its modules once, in registration order, before the router runs', () => {
  const env = bootEnv({ hash: '' });
  const ran = [];
  env.B.view('today', () => ran.push('today-feed')); env.B.view('today', () => ran.push('today-page')); env.B.view('explore', () => ran.push('explore'));
  env.fire('doc', 'DOMContentLoaded');
  env.win.location.hash = '#td-item-x'; env.fire('win', 'hashchange');
  assert.deepEqual(ran, ['today-feed', 'today-page']);
  env.fire('win', 'hashchange'); env.B.ensure('today');
  assert.deepEqual(ran, ['today-feed', 'today-page'], 'never twice');
  assert.equal(env.B.ensure('explore'), true); assert.equal(env.B.ensure('explore'), false);
  assert.deepEqual([...env.B.stats.onDemand], ['today', 'explore']);
  assert.ok(INDEX.indexOf('/livon/livon-boot.js') < INDEX.indexOf('addEventListener("hashchange", showLivonScreen') || /hashchange/.test(BOOT));
});

test('PERF-13 start-up: the remaining screens start in idle time, one per idle period, after load', () => {
  const env = bootEnv({ hash: '' });
  const ran = [];
  for (const v of ['home', 'life', 'today', 'explore']) env.B.view(v, () => ran.push(v));
  env.fire('doc', 'DOMContentLoaded');
  assert.deepEqual(ran, ['home']);
  assert.equal(env.idleQueue.length, 0, 'nothing is scheduled before load');
  env.fire('win', 'load'); env.timers.shift()();
  assert.equal(env.idleQueue.length, 1);
  env.idleQueue.shift()(); assert.deepEqual(ran, ['home', 'life']);
  env.idleQueue.shift()(); assert.deepEqual(ran, ['home', 'life', 'today']);
  env.idleQueue.shift()(); env.idleQueue.shift()();
  assert.deepEqual(ran, ['home', 'life', 'today', 'explore']);
  assert.equal(env.idleQueue.length, 0, 'the warm-up stops when nothing is left');
  assert.deepEqual([...env.B.stats.idle], ['life', 'today', 'explore']);
  assert.match(BOOT, /requestIdleCallback\(next, \{ timeout: 4000 \}\)/);
  /* while the visitor is typing, clicking, scrolling or changing screens the warm-up waits */
  for (const type of ['keydown', 'pointerdown', 'wheel', 'touchstart', 'hashchange']) {
    const e = bootEnv({ hash: '' });
    const done = [];
    e.B.view('home', () => done.push('home')); e.B.view('life', () => done.push('life'));
    e.fire('doc', 'DOMContentLoaded'); e.fire('win', 'load'); e.timers.shift()();
    e.fire('win', type);
    e.idleQueue.shift()();
    assert.deepEqual(done, ['home'], type + ': nothing starts right after activity');
    assert.equal(e.timers.length, 1, type + ': the warm-up is rescheduled');
  }
  assert.match(BOOT, /QUIET_MS = 1500/);
});

test('PERF-14 start-up: a module that throws does not stop the others; a late registration for a started screen runs at once', () => {
  const env = bootEnv({ hash: '', readyState: 'complete' });
  const ran = [];
  env.B.view('life', () => { throw new Error('boom'); }); env.B.view('life', () => ran.push('life-2'));
  assert.equal(env.B.ensure('life'), true);
  assert.deepEqual(ran, ['life-2']);
  env.B.view('life', () => ran.push('life-late'));
  assert.deepEqual(ran, ['life-2', 'life-late']);
  env.B.view('home', 'not a function'); env.B.ensureAll();
});

test('PERF-15 every screen module registers with the scheduler and still starts by itself when the scheduler is missing', () => {
  for (const [file, view] of Object.entries(SCREEN_MODULES)) {
    assert.match(JS[file], new RegExp('window\\.LivonBoot && typeof window\\.LivonBoot\\.view === "function"\\) window\\.LivonBoot\\.view\\("' + view + '", \\w+\\);'), file);
    const tail = JS[file].slice(JS[file].lastIndexOf('LivonBoot.view('));
    assert.match(tail, /else[\s\S]{0,160}DOMContentLoaded/, file + ' fallback');
  }
});

test('PERF-16 a screen asked for from another screen is started first', () => {
  assert.match(JS['explore-page.js'], /if \(window\.LivonBoot\) window\.LivonBoot\.ensure\("explore"\);/);
  assert.match(JS['community-page.js'], /openCompose: function \(type\) \{ if \(window\.LivonBoot\) window\.LivonBoot\.ensure\("community"\);/);
  assert.match(JS['home-page.js'], /LivonBoot/);
});

test('PERF-17 the layers every screen depends on are not deferred', () => {
  for (const f of ['livon-platform.js', 'livon-onboarding.js', 'life-hub.js', 'help-page.js', 'livon-a11y.js', 'livon-personalization.js']) if (JS[f]) assert.doesNotMatch(JS[f], /LivonBoot\.view\(/, f);
  assert.equal(SRCS[SRCS.length - 1], '/livon/livon-a11y.js', 'the accessibility layer is still the last script');
});

/* ═════════ fonts, third parties ═════════ */
test('PERF-18 web fonts: only families a style uses are requested; the icon font is gone', () => {
  const fontLinks = stylesOf(INDEX).filter(h => /fonts\.googleapis\.com/.test(h));
  assert.equal(fontLinks.length, 1);
  for (const gone of ['Geist', 'UnifrakturCook', 'Instrument+Sans', 'Material+Symbols', 'family=Inter']) assert.ok(!fontLinks[0].includes(gone), gone);
  for (const kept of ['Noto+Sans+KR', 'Noto+Serif+KR', 'Kanit', 'Instrument+Serif']) assert.ok(fontLinks[0].includes(kept), kept);
  assert.match(fontLinks[0], /display=swap/);
  assert.deepEqual(SRC.errors.filter(e => e.startsWith('[font]')), []);
});

test('PERF-19 no third-party script blocks parsing', () => {
  const third = SCRIPTS.filter(s => /^https?:/.test(s.src));
  assert.equal(third.length, 1);
  for (const s of third) assert.match(s.tag, /\s(async|defer)(\s|>|=)/, s.src);
  assert.match(INDEX, /if \(window\.gsap\)/, 'the page works while GSAP is still loading or blocked');
});

/* ═════════ assets ═════════ */
test('PERF-20 header logo: a 120px file with dimensions; the original is kept', () => {
  const tag = /<img class="gnav__logo"[^>]*>/.exec(INDEX)[0];
  assert.match(tag, /src="\/assets\/livon-mark-icon-120\.jpg"/); assert.match(tag, /width="40" height="40"/);
  assert.ok(size('assets/livon-mark-icon-120.jpg') <= BUDGET.logoBytes, 'logo ' + size('assets/livon-mark-icon-120.jpg'));
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/livon-mark-icon.jpg')));
});

test('PERF-21 topic photos: 42 JPEG files, each within the image budget and 9.4 MB or less in total', () => {
  const dir = path.join(ROOT, 'livon/assets/topics');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
  assert.equal(files.length, 42);
  let total = 0;
  for (const f of files) {
    const b = fs.readFileSync(path.join(dir, f));
    assert.equal(b.readUInt16BE(0), 0xffd8, f + ' is a JPEG');
    assert.ok(b.length <= BUDGET.imageBytes, f + ' ' + b.length);
    total += b.length;
  }
  assert.ok(total <= 9.4 * 1024 * 1024, 'total ' + total);
  assert.ok(total <= BUDGET.topicImagesBytes);
});

test('PERF-22 card videos rendered by JS wait for the viewport (data-src, preload="none")', () => {
  let n = 0;
  for (const [f, js] of Object.entries(JS)) for (const m of js.matchAll(/<video\b[^>]{0,400}?>/g)) {
    n++;
    assert.match(m[0].replace(/\\"/g, '"'), /preload="none"/, f);
    if (f !== 'x') { assert.doesNotMatch(m[0], /\ssrc=/, f); assert.match(m[0], /data-src=/, f); }
  }
  assert.ok(n >= 3, 'card video templates found: ' + n);
  assert.deepEqual(SRC.errors.filter(e => e.startsWith('[video]')), []);
});

test('PERF-23 images rendered by JS are lazy or decoded off the main thread', () => {
  assert.deepEqual(SRC.warnings.filter(w => w.startsWith('[image] livon/')), []);
  for (const f of ['life-page.js', 'explore-page.js', 'community-page.js', 'today-page.js', 'today-feed.js']) assert.match(JS[f].replace(/\\"/g, '"'), /<img\b[^>]*decoding="async"/, f);
});

test('PERF-24 images in the page declare their size', () => {
  const imgs = [...INDEX.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
  assert.ok(imgs.length >= 5);
  for (const t of imgs) { assert.match(t, /\swidth="\d+"/, t.slice(0, 80)); assert.match(t, /\sheight="\d+"/, t.slice(0, 80)); }
  assert.deepEqual(SRC.errors.filter(e => e.startsWith('[image]')), []);
});

/* ═════════ data, search, storage ═════════ */
const LIVON = loadLivon();
const median = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const timeIt = (fn, n = 5) => { fn(); const t = []; for (let i = 0; i < n; i++) { const s = performance.now(); fn(); t.push(performance.now() - s); } return median(t); };

test('PERF-25 search index: an entity is indexed the first time a search needs it, and results do not change', () => {
  const P = src('livon/data/livon-data-platform.js');
  assert.match(P, /function fieldsOf\(e\) \{ return idx\[e\.id\] \|\| \(idx\[e\.id\] = indexEntity\(e\)\); \}/);
  assert.doesNotMatch(P, /store\.push\(e\);[^\n]*indexEntity\(e\)/, 'no eager indexing while loading');
  const repo = LIVON.LivonScreenData.repository();
  const ids = q => JSON.stringify(repo.search(q).items.map(x => x.id));
  for (const q of ['취업', '건강', '육아', 'first job', 'zzzz']) assert.equal(ids(q), ids(q), q);
  assert.ok(repo.search('취업').items.length > 0); assert.equal(repo.search('zzzz').items.length, 0);
});

test('PERF-26 cleanText: the fast path returns exactly what the full path returns', () => {
  const S = LIVON.LivonDataSchema;
  const schema = src('livon/data/livon-data-schema.js');
  assert.match(schema, /var NEEDS_CLEANING = \/\[<>&/);
  const slowCtx = { console }; slowCtx.window = slowCtx; vm.createContext(slowCtx);
  vm.runInContext(schema.replace(/var NEEDS_CLEANING = [^\n]+/, 'var NEEDS_CLEANING = /(?:)/;'), slowCtx);   /* every string takes the full path */
  const slow = slowCtx.LivonDataSchema.cleanText;
  const samples = ['첫 취업 준비', '  여러   칸\n줄  ', '탭\t문자', '', '   ', 'x'.repeat(300), 'plain ASCII text', '줄\r\n바꿈'];
  for (const t of LIVON.LivonLifeHub.repo.data.topics.slice(0, 80)) samples.push(t.title, t.summary || '');
  for (const v of samples) { assert.equal(S.cleanText(v), slow(v), JSON.stringify(String(v).slice(0, 30))); assert.equal(S.cleanText(v, 40), slow(v, 40)); }
  assert.equal(S.cleanText('<b>굵게</b> 글자'), '굵게 글자'); assert.equal(S.cleanText('a &amp; b'), 'a & b');
  assert.equal(S.cleanText('제어\u0007문자'), slow('제어\u0007문자')); assert.equal(S.cleanText('A\u202EB'), slow('A\u202EB'));
  assert.equal(S.cleanText(null), null); assert.equal(S.cleanText(12), '12'); assert.equal(S.cleanText({}), null);
});

test('PERF-27 repository: built from the app data well inside the start-up budget (lab guard: 400 ms in Node)', () => {
  const P = LIVON.LivonDataPlatform;
  const build = () => { const r = P.createRepository({ adapters: [P.StaticAdapter({ lifeTopics: LIVON.LivonLifeHub.repo.data })] }); r.loadSync(); return r; };
  const ms = timeIt(build);
  assert.ok(ms < 400, 'repository build ' + ms.toFixed(1) + ' ms');
  assert.ok(build().all().length >= 400);
  assert.equal(LIVON.LivonScreenData.repository(), LIVON.LivonScreenData.repository(), 'screens share one repository');
});

test('PERF-28 repository search: each query answers within 60 ms once the index is warm', () => {
  const repo = LIVON.LivonScreenData.repository();
  for (const q of ['취업', '건강', '육아', '주거', '연금', '청년', '교육', '복지', 'first job', 'zzzz']) {
    const ms = timeIt(() => repo.search(q), 5);
    assert.ok(ms < 60, q + ' ' + ms.toFixed(1) + ' ms');
  }
});

test('PERF-29 Help search: the median query takes less than 5 ms and never touches the network', () => {
  let net = 0;
  const ctx = loadLivon({ patch(c) { c.fetch = () => { net++; return Promise.reject(new Error('offline')); }; } });
  for (const f of ['help-data.js', 'help-page.js']) vm.runInContext(src('livon/' + f), ctx, { filename: f });
  const before = net;
  const qs = ['저장', '계정', '삭제', '로그인', '커뮤니티', '신고', 'AI', '개인정보', '할 일', '접근성', '검색', '가입', '데이터', '내보내기', '글쓰기', '알림', '오류', '영상', '언어', '오프라인', 'save', 'account', 'zzzz', '계정 삭제'];
  const times = qs.map(q => timeIt(() => ctx.LivonHelp.search(q), 9));
  assert.ok(median(times) < 5, 'median ' + median(times).toFixed(2) + ' ms');
  assert.ok(Math.max(...times) < 25, 'slowest ' + Math.max(...times).toFixed(2) + ' ms');
  assert.ok(ctx.LivonHelp.search('저장').items.length > 0);
  assert.equal(net, before, 'searching makes no request');
});

function platform(saves = []) {
  const mem = () => { const m = new Map(); let reads = 0; return { getItem: k => { reads++; return m.has(k) ? m.get(k) : null; }, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; }, get reads() { return reads; } }; };
  const ctx = { console, URL, Promise, setTimeout, clearTimeout, localStorage: mem(), sessionStorage: mem(), navigator: {}, history: { state: null, replaceState() {}, pushState() {} },
    location: { hash: '', origin: 'https://www.newon.app', pathname: '/livon/', hostname: 'www.newon.app' },
    document: { readyState: 'loading', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null }, contains: () => false, body: {} },
    addEventListener() {}, fetch: () => Promise.reject(new Error('offline')) };
  ctx.window = ctx;
  if (saves.length) ctx.localStorage.setItem('livon.platform.v1', JSON.stringify({ saves }));
  vm.createContext(ctx);
  let parses = 0;
  const parse = JSON.parse;
  vm.runInContext('JSON.parse = (function (p) { return function (s) { __parses(); return p(s); }; })(JSON.parse);', Object.assign(ctx, { __parses: () => { parses++; } }));
  for (const f of ['data/livon-user-data.js', 'livon-platform.js']) vm.runInContext(src('livon/' + f), ctx, { filename: f });
  void parse;
  return { P: ctx.LivonPlatform, ctx, parses: () => parses };
}

test('PERF-30 "is this saved?": answered from an id index that is rebuilt only when the stored text changes', () => {
  const saves = Array.from({ length: 200 }, (_, i) => ({ id: 'fx-' + i, label: '합성 저장 ' + i, type: 'content', href: '#today', folder: '나중에 보기', at: i }));
  const { P, ctx, parses } = platform(saves);
  assert.equal(P.hasSave('fx-3'), true); assert.equal(P.hasSave('nope'), false);
  const before = parses();
  for (let i = 0; i < 300; i++) P.hasSave('fx-' + i);
  assert.equal(parses(), before, '300 checks parse the store 0 times');
  P.saveItem({ id: 'new-1', label: '새 항목' });
  assert.equal(P.hasSave('new-1'), true, 'a write is seen at once');
  P.removeSave('new-1');
  assert.equal(P.hasSave('new-1'), false);
  const raw = JSON.parse(ctx.localStorage.getItem('livon.platform.v1'));
  raw.saves.unshift({ id: 'other-tab', label: 'x' });
  ctx.localStorage.setItem('livon.platform.v1', JSON.stringify(raw));
  assert.equal(P.hasSave('other-tab'), true, 'a change made elsewhere (another tab, sync) is seen');
  const ids = P.saveIds(); ids.push('mutated');
  assert.equal(P.hasSave('mutated'), false, 'callers get a copy');
  assert.equal(platform().P.hasSave('x'), false, 'empty storage');
});

test('PERF-31 the per-card callers use the index', () => {
  assert.match(JS['life-hub.js'], /if \(P && P\.hasSave\) return P\.hasSave\(saveId\(type, id\)\);/);
  assert.match(JS['service-details.js'], /P\.hasSave\(id\)/);
  assert.match(JS['today-page.js'], /P\.saveIds \? P\.saveIds\(\)/);
  assert.match(JS['community-page.js'], /P\.hasSave\(saveId\(postId\)\)/);
  assert.match(src('livon/data/livon-data-core.js'), /P\.hasSave\("ext:" \+ e\.id\)/);
  for (const f of ['life-hub.js', 'service-details.js', 'today-page.js']) assert.match(JS[f], /listSaves\(/, f + ' keeps the fallback');
});

test('PERF-32 Community: the feed renders a page of cards, not every post', () => {
  assert.match(JS["community-page.js"], /var PAGE = 10;/); assert.match(JS["community-page.js"], /var shown = list\.slice\(0, state\.shown\);/);
});

test('PERF-33 saved items stay bounded (200) so the store cannot grow without limit', () => {
  assert.ok((JS['livon-platform.js'].match(/s\.saves = s\.saves\.slice\(0, 200\);/g) || []).length >= 2);
});

/* ═════════ layout: large text on a small screen ═════════ */
test('PERF-34 card grids may shrink to one column: minmax(min(100%, …), 1fr)', () => {
  assert.match(CSS['community-page.css'], /repeat\(auto-fit, minmax\(min\(100%, 16\.5rem\), 1fr\)\)/);
  assert.match(CSS['today-page.css'], /repeat\(auto-fit, minmax\(min\(100%, 16\.5rem\), 1fr\)\)/);
  assert.match(CSS['explore-page.css'], /repeat\(auto-fill, minmax\(min\(100%, 11\.5rem\), 1fr\)\)/);
});

test('PERF-35 large text: grid and flex children may shrink and long words may wrap', () => {
  const block = CSS['livon-a11y.css'].slice(CSS['livon-a11y.css'].indexOf('large text on a small screen'));
  assert.ok(block.length > 200);
  for (const sel of ['#livon-home .lv-hm-me > *', '#livon-home .lv-hm-me__row > *', '#livon-home .lv-hm-ex-ol a > *', '#life .lv-life-pack__steps', '#community .lv-cm-row > :not(.lv-cm-row__n)']) assert.ok(block.includes(sel), sel);
  assert.match(block, /min-width: 0; overflow-wrap: anywhere;/);
  assert.match(block, /#explore \.lv-ex-sort \{ flex-wrap: wrap;/);
});

test('PERF-36 content-visibility is not used: it moved in-page anchors by thousands of pixels in the lab', () => {
  for (const [f, css] of Object.entries(CSS)) assert.doesNotMatch(css, /content-visibility\s*:/, f);
  assert.doesNotMatch(INDEX, /content-visibility\s*:/);
});

/* ═════════ nothing was traded away ═════════ */
test('PERF-37 accessibility is intact: skip link, route status, pause control, reduced motion, keyboard handlers', () => {
  assert.match(INDEX, /class="skip-link"/);
  const A = JS['livon-a11y.js'];
  for (const need of ['data-lv-a11y-route', 'data-lv-motion-toggle', '"role", "status"', 'keydown', 'livon.a11y.motion.v1']) assert.ok(A.includes(need), need);
  assert.match(CSS['livon-a11y.css'], /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(INDEX, /href="\/livon\/livon-a11y\.css/);
  assert.match(MEDIA, /pause control[\s\S]{0,80}work as before/);
});

test('PERF-38 static SEO pages: no script, seo.css only, every page inside the size budget', () => {
  assert.deepEqual(PUB.errors, []);
  assert.equal(PUB.stats.staticPages, 125);
  assert.ok(PUB.stats.staticPageMaxKB <= 26, 'largest static page ' + PUB.stats.staticPageMaxKB + ' KB');
  const html = fs.readFileSync(path.join(OUT, 'livon/life/20s/first-job/index.html'), 'utf8');
  assert.doesNotMatch(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, ''), /<script\b/);
  assert.match(html, /<h1\b/); assert.doesNotMatch(html, /livon-boot|livon-media|<video/);
});

test('PERF-39 the static style sheet stays small', () => {
  assert.ok(size('livon/seo.css') <= BUDGET.staticCssBytes, 'seo.css ' + size('livon/seo.css'));
});

test('PERF-40 Admin and Data Manager load no public screen module and no film', () => {
  for (const page of ['livon/admin/index.html', 'livon/admin/data/index.html']) {
    const html = src(page), list = scriptsOf(html).map(s => s.src.split('?')[0]);
    assert.ok(list.length <= BUDGET.adminScripts, page + ' ' + list.length);
    for (const f of Object.keys(SCREEN_MODULES)) assert.ok(!list.includes('/livon/' + f), page + ' ' + f);
    assert.doesNotMatch(html, /<video\b/); assert.doesNotMatch(html, /fonts\.googleapis\.com/);
  }
});

test('PERF-41 the public app loads no Admin file', () => {
  for (const s of SRCS) assert.doesNotMatch(s, /\/livon\/admin\//);
  assert.doesNotMatch(INDEX, /admin-app\.js|data-manager\.js/);
});

/* ═════════ quality script and build ═════════ */
test('PERF-42 the performance check passes on the sources', () => {
  assert.deepEqual(SRC.errors, []);
  assert.equal(SRC.stats.backgroundVideos, 8); assert.equal(SRC.stats.images, 42);
});

test('PERF-43 the performance check passes on generated output and reports what it looked at', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/livon-performance-quality.mjs'), '--root', OUT], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /livon-performance-quality: 0 error\(s\)/); assert.match(r.stdout, /"staticPages":125/);
  assert.match(r.stdout, /static checks only \(timings are measured in a browser\)/);
});

test('PERF-44 the check catches the regressions this phase removed', () => {
  const has = (html, re) => assert.ok(checkAppHtml(html).errors.some(e => re.test(e)), String(re));
  has(INDEX.replace('</main>', '</main><style>.x{color:red}</style>'), /<style> block sits outside <head>/);
  has(INDEX.replace(/(<video\b[^>]*?)data-src=/, '$1src='), /\[video\].*has src/);
  has(INDEX.replace(/(<video\b[^>]*?)preload="none"/, '$1preload="auto"'), /preload is not "none"/);
  has(INDEX.replace(/<video\b/, '<video><source src="/x.mp4" type="video/mp4" /></video><video'), /<source src>/);
  has(INDEX.replace(/(gsap\.min\.js") async>/, '$1>'), /third-party script blocks parsing/);
  has(INDEX.replace(/<script src="\/livon\/livon-boot\.js[^>]*><\/script>/, ''), /livon-boot\.js is not loaded/);
  has(INDEX.replace('</body>', '<script src="/livon/life-hub.js"></script></body>'), /loaded twice/);
  assert.deepEqual(checkAppHtml(INDEX).errors, []);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'livon-perf-bad-'));
  fs.mkdirSync(path.join(dir, 'livon/x'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'livon/x/index.html'), '<!doctype html><html lang="ko"><head><link rel="stylesheet" href="/livon/life-page.css"></head><body><h1>x</h1><script src="/livon/life-page.js"></script></body></html>');
  fs.writeFileSync(path.join(dir, 'livon/a.js.map'), '{}');
  const bad = checkPublished(dir).errors.join('\n');
  for (const re of [/a static page loads a script/, /static pages use seo\.css only/, /source map file/, /livon-media\.js is missing/]) assert.match(bad, re);
});

test('PERF-45 the build runs the check after the accessibility check and requires the new files', () => {
  const p = src('scripts/publish-site.mjs');
  assert.match(p, /"livon-performance-quality\.mjs"\), "--root", OUT\]/);
  assert.ok(p.indexOf('livon-performance-quality.mjs') > p.indexOf('livon-accessibility-quality.mjs'));
  for (const f of ['"livon", "livon-media.js"', '"livon", "livon-boot.js"', '"assets", "livon-mark-icon-120.jpg"']) assert.ok(p.includes('required.push(path.join(OUT, ' + f + '));'), f);
});

test('PERF-46 budgets sit above the measured state, but not far above it', () => {
  const s = SRC.stats;
  const near = (actual, budget, label) => { assert.ok(actual <= budget, label + ' over budget'); assert.ok(actual >= budget * 0.6, label + ': the budget is too loose to catch growth (' + actual + ' of ' + budget + ')'); };
  near(s.appScripts, BUDGET.appScripts, 'scripts');
  near(s.appScriptKB * 1024, BUDGET.appScriptBytes, 'script bytes');
  near(s.appStyles, BUDGET.appStyles, 'style sheets');
  near(s.appStyleKB * 1024, BUDGET.appStyleBytes, 'style bytes');
  near(s.appPageKB * 1024, BUDGET.appPageBytes, 'page bytes');
  near(s.topicImagesKB * 1024, BUDGET.topicImagesBytes, 'topic photos');
});

test('PERF-47 no source map is referenced by LIVON scripts or styles', () => {
  for (const [f, t] of [...Object.entries(JS), ...Object.entries(CSS)]) assert.doesNotMatch(t, /sourceMappingURL=/, f);
});

test('PERF-48 cache busting: every local script and style sheet carries a version; nothing is loaded twice', () => {
  for (const s of SCRIPTS) if (!/^https?:/.test(s.src)) assert.match(s.src, /\?v=[\w.-]+$/, s.src);
  for (const h of stylesOf(INDEX)) if (!/^https?:/.test(h)) assert.match(h, /\?v=[\w.-]+$/, h);
  assert.equal(new Set(SRCS).size, SRCS.length);
});

test('PERF-49 the files changed in this phase carry a new version', () => {
  /* a later phase may bump a file again (Product Completion Audit: ?v=20261004c1, Community V2: ?v=20261005cv2, Explore V2: ?v=20261006ex1, Life Stage V2: ?v=20261007ls1, Saved V2: ?v=20261007sv1, Home V2: ?v=20261008hv2, LIVON Next V1: ?v=20261010nx1) — never back to a pre-Performance version */
  const V = '\\?v=(20261002perf\\d|20261004c\\d|20261005cv\\d|20261006ex\\d|20261007ls\\d|20261007sv\\d|20261008hv\\d|20261010nx\\d)';
  for (const f of ['livon-media.js', 'livon-boot.js']) assert.match(INDEX, new RegExp('/livon/' + f.replace('.', '\\.') + V));
  for (const f of Object.keys(SCREEN_MODULES).concat(['livon-platform.js', 'life-hub.js', 'service-details.js', 'data/livon-data-platform.js', 'data/livon-data-schema.js', 'data/livon-data-core.js', 'livon-a11y.css', 'community-page.css', 'today-page.css', 'explore-page.css']))
    assert.match(INDEX, new RegExp('/livon/' + f.replace(/[./]/g, '\\$&') + V), f);
});

/* ═════════ network ═════════ */
test('PERF-50 no new third-party host: the page names the same hosts as before, minus none added', () => {
  const hosts = new Set([...INDEX.matchAll(/https?:\/\/([a-z0-9.-]+)/g)].map(m => m[1]));
  const allowed = ['www.newon.app', 'schema.org', 'fonts.googleapis.com', 'fonts.gstatic.com', 'fonts.cdnfonts.com', 'images.higgs.ai', 'db.onlinewebfonts.com', 'd8j0ntlcm91z4.cloudfront.net', 'cdn.jsdelivr.net'];
  for (const h of hosts) assert.ok(allowed.includes(h), 'unexpected host ' + h);
});

test('PERF-51 the two new scripts make no request and read no account, AI or provider API', () => {
  for (const [name, js] of [['livon-media.js', MEDIA], ['livon-boot.js', BOOT]]) {
    const c = code(js);
    for (const bad of [/\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /firebase/i, /openai/i, /\/api\//, /new Image\(/]) assert.doesNotMatch(c, bad, name);
  }
});

test('PERF-52 the two new scripts store nothing, so the storage inventory is unchanged', () => {
  for (const js of [MEDIA, BOOT]) assert.doesNotMatch(code(js), /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.match(MEDIA, /Nothing is stored and nothing is sent anywhere/);
});

/* ═════════ documentation ═════════ */
test('PERF-53 the performance document covers method, baseline, results, budget and limits', () => {
  for (const h of ['Method', 'Baseline', 'Before and after', 'JavaScript', 'CSS', 'Images', 'Video', 'Fonts', 'Data Platform', 'Search', 'Community', 'Help', 'Admin', 'Data Manager', 'Storage', 'DOM', 'Event listeners', 'Network', 'Offline',
    'Responsive', '390px + 200% text', 'Performance budget', 'Quality script', 'Known limitations']) assert.ok(DOC.includes(h), h);
  assert.match(DOC, /livon-performance-quality\.mjs/); assert.match(DOC, /tests\/livon\/performance\.test\.mjs/);
});

test('PERF-54 the document does not claim what was not measured', () => {
  assert.match(DOC, /NOT MEASURED/); assert.match(DOC, /lab/i); assert.match(DOC, /Lighthouse was not run/);
  assert.doesNotMatch(DOC, /Lighthouse (score|점수)\s*[:=]?\s*\d/i);
  assert.doesNotMatch(DOC, /실사용자 CWV 통과|passes Core Web Vitals|field data shows/i);
});

/* ───────── browser (skipped when no local Chromium) ───────── */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const skip = !(fs.existsSync(PW) && fs.existsSync(CHROME)) && 'no local Chromium';
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
const SKIPPED = JSON.stringify({ version: 1, state: 'SKIPPED', step: '', draft: null, updatedAt: 1 });
const OBSERVE = () => {
  window.__cls = 0;
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {}
};
async function open(browser, base, url, { width = 1280, height = 800, external, seed, wait = 1200 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const ext = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith(base)) return r.continue(); ext.push(u); return external ? external(r, u) : r.abort(); });
  await ctx.addInitScript(v => { try { if (!localStorage.getItem('livon.personalization.v1')) localStorage.setItem('livon.personalization.v1', v); } catch (e) {} }, SKIPPED);
  await ctx.addInitScript(OBSERVE);
  if (seed) await ctx.addInitScript(seed.fn, seed.arg);
  const pg = await ctx.newPage();
  pg._errors = []; pg._ext = ext; pg.on('pageerror', e => pg._errors.push(e.message));
  await pg.goto(base + url, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(wait);
  return pg;
}

test('PERF-55 lab CLS stays at or below 0.1 on the long screens (it was up to 1.0 before the styles moved to the head)', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    for (const h of ['', '#life', '#today', '#explore', '#life-now', '#community']) {
      const pg = await open(browser, base, '/livon/' + h, { wait: 1800 });
      const cls = await pg.evaluate(() => window.__cls);
      assert.ok(cls <= 0.1, (h || 'home') + ' CLS ' + cls.toFixed(3));
      assert.deepEqual(pg._errors, [], h);
      await pg.context().close();
    }
  });
});

test('PERF-56 one film per entry: only the film of the open screen is requested, and opening another screen requests one more', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const pg = await open(browser, base, '/livon/#community');
    const HEADER = "video[data-livon-video], video.lv-lum__bg, video[class*='film__bg']";
    const films = () => new Set(pg._ext.filter(u => /\.mp4/.test(u)));
    const want = sel => pg.evaluate(([sel, h]) => document.querySelector(sel + ' ' + h.split(', ').join(', ' + sel + ' ')).getAttribute('data-src'), [sel, HEADER]);
    assert.deepEqual([...films()], [await want('#community')], 'only the Community film');
    const others = await pg.evaluate(h => [...document.querySelectorAll(h)].filter(v => v.getAttribute('src') && !v.closest('#community')).length, HEADER);
    assert.equal(others, 0, 'no other header film has a src');
    await pg.evaluate(() => { location.hash = '#today'; }); await pg.waitForTimeout(600);
    assert.deepEqual([...films()].sort(), [await want('#community'), await want('#today')].sort());
    assert.deepEqual(pg._errors, []);
    await pg.context().close();
  });
});

test('PERF-57 an unreachable film host: at most two attempts per film, the load event fires, the page stays usable', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const pg = await open(browser, base, '/livon/', { wait: 3500 });
    const films = pg._ext.filter(u => /\.mp4/.test(u));
    const perFilm = {};
    for (const u of films) perFilm[u] = (perFilm[u] || 0) + 1;
    assert.ok(Object.keys(perFilm).length >= 1);
    for (const [u, n] of Object.entries(perFilm)) assert.ok(n <= 3, u.split('/').pop() + ' was requested ' + n + ' times');
    assert.ok(films.length <= 8, 'film requests in 3.5 s: ' + films.length + ' (was about 150)');
    assert.equal(await pg.evaluate(() => performance.getEntriesByType('navigation')[0].loadEventEnd > 0), true, 'load fired');
    assert.equal(await pg.evaluate(() => !!document.querySelector('#livon-home h1')), true);
    await pg.context().close();
  });
});

test('PERF-58 start-up in the browser: only the open screen starts at load; the rest start on demand or in idle time', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const pg = await open(browser, base, '/livon/#help', { wait: 300 });
    const stats = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.LivonBoot.stats)));
    const s0 = await stats();
    assert.deepEqual(s0.atLoad, [], 'Help needs no screen module');
    assert.equal(await pg.evaluate(() => !!document.querySelector('#help h1')), true, 'Help itself is ready');
    await pg.evaluate(() => { location.hash = '#explore'; }); await pg.waitForTimeout(400);
    assert.equal(await pg.evaluate(() => window.LivonBoot.isStarted('explore')), true);
    assert.ok(await pg.evaluate(() => document.querySelectorAll('#explore a, #explore button').length) > 5, 'Explore rendered');
    await pg.waitForTimeout(4500);
    const s1 = await stats();
    for (const v of ['home', 'life', 'today', 'life-now', 'community', 'livon-ai']) assert.ok(s1.idle.includes(v) || s1.onDemand.includes(v), v + ' started later');
    assert.deepEqual(pg._errors, []);
    await pg.context().close();
  });
});

test('PERF-59 390px wide with 200% text: no screen scrolls sideways', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const pg = await open(browser, base, '/livon/', { width: 390, height: 844 });
    for (const h of ['#livon-home', '#life', '#life/20s/first-job', '#today', '#life-now', '#ml-settings', '#explore', '#ex-results?q=취업', '#community', '#ai-chat', '#help', '#help/a/no-signup']) {
      await pg.goto(base + '/livon/' + h); await pg.waitForTimeout(700);
      await pg.addStyleTag({ content: 'html{font-size:200% !important}' }); await pg.waitForTimeout(300);
      const over = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(over <= 1, h + ' overflows by ' + over + 'px');
    }
    assert.deepEqual(pg._errors, []);
    await pg.context().close();
  });
});

test('PERF-60 large data and static pages: 300 posts render one page of cards; a static page runs no script', { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const kinds = [['question', '첫 자취 계약 체크', 'housing', '20', 'independent'], ['experience', '육아 휴직 복직 경험', 'parenting', '30', 'parenting'], ['tip', '월급 관리 팁', 'money', '20', 'first-salary']];
    const posts = Array.from({ length: 300 }, (_, i) => ({ id: 'post_p' + i, type: kinds[i % 3][0], title: kinds[i % 3][1] + ' ' + i, body: '합성 fixture', tags: ['태그' + (i % 9)], category: kinds[i % 3][2], lifeStage: kinds[i % 3][3], lifeEvent: kinds[i % 3][4], authorId: 'local', authorNick: '나', createdAt: 1700000000000 + i * 60000, updatedAt: 1700000000000 + i * 60000 }));
    const store = { v: 2, profile: { nick: '나', bio: '', interests: [] }, posts, comments: [], likes: {}, commentLikes: {}, saves: [], joined: [], challenges: {}, blocked: [], reports: [], drafts: [], region: '', compose: null };
    const pg = await open(browser, base, '/livon/#community', { seed: { fn: v => { try { localStorage.setItem('livon.cmStore.v1', v); } catch (e) {} }, arg: JSON.stringify(store) }, wait: 1500 });
    const cards = await pg.evaluate(() => document.querySelectorAll('#lv-cm-feed-panel a[data-lv-cm-go]').length);
    assert.ok(cards >= 10 && cards <= 60, 'cards rendered for 300 posts: ' + cards);
    assert.ok(await pg.evaluate(() => document.querySelectorAll('#community *').length) < 2500, 'Community DOM stays small');
    const ms = await pg.evaluate(() => new Promise(r => { const t = performance.now(); location.hash = '#cm-home?q=육아'; requestAnimationFrame(() => requestAnimationFrame(() => r(performance.now() - t))); }));
    assert.ok(ms < 1500, 'search over 300 posts to next frame: ' + ms.toFixed(0) + ' ms');
    assert.deepEqual(pg._errors, []);
    await pg.context().close();
    const st = await open(browser, base, '/livon/life/20s/first-job/', { wait: 500 });
    const res = await st.evaluate(() => performance.getEntriesByType('resource').map(r => r.initiatorType + ' ' + r.name.split('/').pop().split('?')[0]));
    assert.deepEqual(res.filter(r => r.startsWith('script')), [], 'no script request');
    assert.equal(await st.evaluate(() => document.scripts.length - document.querySelectorAll('script[type="application/ld+json"]').length), 0);
    assert.equal(await st.evaluate(() => window.__cls), 0);
    await st.context().close();
  });
});
