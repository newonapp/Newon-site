// LIVON cross-menu integration checks: routing, shared header, sticky navigation, shared saves and dialogs.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const INDEX = read('index.html');

/* The router's view mapping lives inline in index.html; evaluate that exact function. */
function livonView() {
  const src = INDEX.match(/function livonView\(hash\) \{[\s\S]*?\n        \}/);
  assert.ok(src, 'livonView() found in index.html');
  return vm.runInNewContext('(' + src[0] + ')');
}

test('every menu, detail and sub-route resolves to its own view; unknown routes fall back to home', () => {
  const view = livonView();
  const cases = {
    'livon-home': 'home', '': 'home', 'life': 'life', 'life/20s': 'life', 'life/10s/school-life': 'life', 'life-events': 'life',
    'today': 'today', 'today/place-namsan': 'today', 'td-hobby': 'today',
    'life-now': 'life-now', 'ml-todos': 'life-now', 'ml-todos?filter=today': 'life-now', 'ml-calendar': 'life-now',
    'explore': 'explore', 'ex-results?q=취업': 'explore', 'ex-item-ex-career24': 'explore',
    'community': 'community', 'cm-home': 'community', 'cm-post-abc': 'community',
    'livon-ai': 'livon-ai', 'ai-chat': 'livon-ai', 'ai-chat/t1': 'livon-ai',
    'zzz-unknown': 'home'
  };
  for (const [hash, want] of Object.entries(cases)) assert.equal(view(hash), want, hash);
});

test('all in-page hash links in the LIVON shell point at a routable view (no dead anchors)', () => {
  const view = livonView();
  const hrefs = [...INDEX.matchAll(/href="#([^"]*)"/g)].map(m => m[1]);
  assert.ok(hrefs.length > 20);
  assert.ok(!hrefs.includes(''), 'no bare href="#"');
  const homeish = /^(livon-home|hm-|lv-)/;
  const ids = new Set([...INDEX.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  for (const h of hrefs) {
    if (view(h) === 'home') assert.ok(homeish.test(h) || ids.has(h), 'unroutable link #' + h);
  }
});

test('shared header: small phones keep brand + actions apart and language stays reachable', () => {
  assert.match(INDEX, /@media \(max-width: 480px\) \{\s*\.gnav__wordmark \{ display: none; \}/);
  assert.match(INDEX, /@media \(max-width: 374px\) \{\s*\.gnav__util > \.gnav__lang \{ display: none; \}\s*\.lv-gnav-mobile-lang \{ display: flex; \}/);
  assert.match(INDEX, /id="lang-select-mobile-livon"[^>]*data-lang-select/);
  assert.equal((INDEX.match(/id="lang-select-livon"/g) || []).length, 1);
  // header tool panels are anchored to the viewport on small phones (they were clipped off-screen)
  assert.match(INDEX, /@media \(max-width: 480px\) \{[\s\S]{0,200}\.livon-panel \{\s*position: fixed;/);
  // the life page no longer carries its own header override, so every view shares one header
  assert.doesNotMatch(read('life-page.css'), /\.gnav__wordmark/);
  // no account system yet: logout stays out of the profile menu
  assert.match(INDEX, /<button type="button" role="menuitem" data-livon-logout hidden>/);
});

test('sticky sub-navigation works: pages do not turn html/body into scroll containers', () => {
  for (const f of ['life-page.css', 'today-page.css', 'life-now-page.css', 'explore-page.css', 'community-page.css', 'ai-page.css']) {
    const css = read(f);
    const block = css.match(/html\[data-lv-view="[^"]+"\] body \{([^}]*)\}/);
    assert.ok(block, f);
    assert.doesNotMatch(block[1], /overflow:\s*auto/, f + ' must not use overflow:auto on html/body');
    assert.match(block[1], /overflow-x:\s*clip/, f);
  }
  const shell = INDEX.match(/html\[data-lv-view="livon-ai"\] body \{([^}]*)\}/)[1];
  assert.doesNotMatch(shell, /overflow:\s*auto/);
});

test('section jumps account for the sticky sub-navigation on every page', () => {
  assert.match(INDEX, /window\.LivonStickyOffset = function/);
  for (const f of ['ai-page.js', 'explore-page.js', 'community-page.js', 'today-page.js', 'life-now-page.js', 'life-page.js']) {
    assert.match(read(f), /function gnavOffset\(\) \{\s*return \(window\.LivonStickyOffset \? window\.LivonStickyOffset\(\)/, f);
  }
  assert.match(read('life-hub.js'), /window\.LivonStickyOffset/);
});

test('smooth scrolling respects reduced motion everywhere', () => {
  for (const f of ['explore-page.js', 'home-page.js', 'life-page.js', 'today-page.js', 'ai-page.js', 'community-page.js', 'life-now-page.js']) {
    const src = read(f);
    for (const m of src.matchAll(/behavior:\s*([^}]+)\}/g)) {
      if (/"smooth"/.test(m[1])) assert.match(m[1], /reduce|reducedMotion|instant/, f + ': ' + m[1].trim());
    }
  }
});

test('My Life month calendar labels the weekdays', () => {
  const src = read('life-now-page.js');
  assert.match(src, /\["일", "월", "화", "수", "목", "금", "토"\]\.map\(function \(w\) \{ return '<div class="lv-ml-cal__dow" aria-hidden="true">'/);
  assert.match(read('life-now-page.css'), /\.lv-ml-cal__dow \{/);
});

/* Minimal DOM for the shared platform layer (onboarding dialog + saves). */
function platform() {
  const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };
  const listeners = {};
  const el = (extra = {}) => Object.assign({ hidden: true, innerHTML: '', offsetParent: {}, disabled: false, focused: 0, focus() { this.focused++; doc.activeElement = this; }, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, contains: () => false }, extra);
  const close = el({ hidden: false });
  const opener = el({ hidden: false });
  const modal = el({ hidden: true });
  modal.querySelector = s => (s === '.lv-life-modal__close' ? close : el());
  modal.querySelectorAll = () => [close];
  modal.contains = n => n === close;
  const doc = {
    readyState: 'complete', activeElement: opener, documentElement: { dataset: {} }, body: {},
    getElementById: id => (id === 'livon-onboard-modal' ? modal : null),
    querySelector: () => null, querySelectorAll: () => [],
    addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); },
    contains: () => true
  };
  const ctx = { document: doc, localStorage: mem(), sessionStorage: mem(), location: { hash: '' }, setTimeout: f => f(), console, navigator: {} };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(read('livon-platform.js'), ctx);
  const key = (k, extra = {}) => { const e = Object.assign({ key: k, shiftKey: false, prevented: false, preventDefault() { this.prevented = true; } }, extra); (listeners.keydown || []).forEach(f => f(e)); return e; };
  return { ctx, modal, close, opener, key, doc };
}

test('onboarding dialog: opens with focus inside, Escape = "later", focus returns to the opener', () => {
  const { ctx, modal, close, opener, key, doc } = platform();
  // first visit auto-opens (setTimeout runs immediately in this harness)
  assert.equal(modal.hidden, false);
  assert.ok(close.focused >= 1, 'focus moved into the dialog');
  doc.activeElement = close;
  const tab = key('Tab');
  assert.equal(tab.prevented, true, 'Tab is kept inside the dialog');
  key('Escape');
  assert.equal(modal.hidden, true);
  assert.equal(JSON.parse(ctx.localStorage.getItem('livon.platform.v1')).onboardSkipped, true);
  assert.equal(doc.activeElement, opener, 'focus restored');
  // Escape with the dialog closed does nothing
  assert.equal(key('Escape').prevented, false);
});

test('cross-menu saves: Life Stage, Today, Explore and Community share one store without duplicates and reach My Life', () => {
  const { ctx } = platform();
  const P = ctx.LivonPlatform;
  const items = [
    { type: 'life-topic', id: 'life-hub:topic:10s.school-life', title: 'Life', href: '#life/10s/school-life' },
    { type: 'content', id: 'td:place-namsan', title: '남산', href: '#today/place-namsan' },
    { type: 'content', id: 'ex:ex-career24', title: '고용24', href: '#ex-item-ex-career24' },
    { type: 'community', id: 'cm:post-1', title: '글', href: '#cm-post-1' }
  ];
  items.forEach(x => P.saveItem(x));
  items.forEach(x => P.saveItem(x)); // saving again must not duplicate
  const list = P.listSaves();
  assert.equal(list.length, items.length);
  assert.equal(new Set(list.map(s => s.type + ':' + s.id)).size, items.length);
  P.removeSave(items[1].id);
  assert.equal(P.listSaves().length, items.length - 1);
  // My Life reads the same store
  const mem = ctx.localStorage;
  const mlctx = { window: {}, localStorage: mem, sessionStorage: ctx.sessionStorage, location: { hash: '#ml-saved' }, navigator: {}, URL, history: { replaceState() {}, pushState() {} },
    document: { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null }, contains: () => false },
    fetch: () => Promise.reject(new Error('offline')), setTimeout, console, addEventListener() {}, LivonPlatform: P };
  mlctx.window = mlctx;
  vm.createContext(mlctx);
  for (const f of ['data/livon-user-data.js', 'explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js', 'today-feed.js', 'explore-search.js', 'life-now-data.js', 'life-now-page.js']) vm.runInContext(read(f), mlctx);
  const saved = mlctx.LivonMyLife._test.collectedSaved();
  const ids = saved.map(s => s.id);
  for (const x of [items[0], items[2], items[3]]) assert.ok(ids.includes(x.id), 'My Life shows ' + x.id);
  assert.ok(!ids.includes(items[1].id), 'removed save is gone from My Life');
});

test('LIVON AI offline: a failed request is announced to screen readers, not left on "waiting"', () => {
  const src = read('ai-page.js');
  assert.match(src, /setStatus\(info\.kind === "cancelled" \? "중지됨" : "오류", "warn"\);\s*announce\(info\.msg\);/);
});
