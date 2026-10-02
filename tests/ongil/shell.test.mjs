// ONGIL Phase 1 — shell: navigation, routes, landmarks, accessibility foundation, honesty of copy, code hygiene.
// Static checks over ongil-start/ (no browser, no dependencies):  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AREAS, PRIMARY_AREAS, GLOBAL_AREAS, GLOBAL_ENTRIES } from '../../ongil-start/js/areas.js';
import { VIEWS, PRIMARY_VIEWS, GLOBAL_VIEWS, OVERLAYS, ROUTE_ALIASES, resolveView, hashFor } from '../../ongil-start/js/router.js';
import { viewTitle } from '../../ongil-start/js/accessibility.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'ongil-start');
const read = (...p) => fs.readFileSync(path.join(APP, ...p), 'utf8');
const INDEX = read('index.html');
const JS_FILES = fs.readdirSync(path.join(APP, 'js')).filter((f) => f.endsWith('.js')).sort();
const CSS_FILES = fs.readdirSync(path.join(APP, 'styles')).filter((f) => f.endsWith('.css')).sort();
const JS = Object.fromEntries(JS_FILES.map((f) => [f, read('js', f)]));
const CSS = CSS_FILES.map((f) => read('styles', f)).join('\n');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const CODE = Object.fromEntries(JS_FILES.map((f) => [f, stripComments(JS[f])]));
const BODY = INDEX.slice(INDEX.indexOf('<body'));
const attr = (tag, name) => (new RegExp(`\\s${name}="([^"]*)"`).exec(tag) || [])[1];
const tags = (name) => BODY.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) || [];

/* ───────── information architecture ───────── */

test('OG-IA-1 eight primary areas with the agreed names, in order', () => {
  assert.deepEqual(PRIMARY_AREAS.map((a) => a.label), ['홈', '내 생활', '건강·안부', '가족', '돌봄·서비스', '즐길거리', '커뮤니티', '스토어']);
  assert.deepEqual(PRIMARY_AREAS.map((a) => a.id), [...PRIMARY_VIEWS]);
  assert.deepEqual(GLOBAL_AREAS.map((a) => a.id), [...GLOBAL_VIEWS]);
  assert.deepEqual(AREAS.map((a) => a.id), [...VIEWS]);
  for (const old of ['건강 관리', '가족 연결', '배움·여가', '돌봄·생활 서비스']) assert.equal(new RegExp(`>${old}<`).test(INDEX), false, old);
});

test('OG-IA-2 desktop bar and mobile sheet list the same eight areas; the sheet adds 저장 and 내 정보', () => {
  const desktop = [...BODY.matchAll(/<a class="gnav__link" href="#([a-z-]+)" data-og-nav[^>]*>([^<]+)<\/a>/g)].map((m) => [m[1], m[2]]);
  const mobile = [...BODY.matchAll(/<a class="gnav-mobile__sublink" href="#([a-z-]+)" data-og-nav>([^<]+)<\/a>/g)].map((m) => [m[1], m[2]]);
  const expected = PRIMARY_AREAS.map((a) => [a.hash.slice(1), a.label]);
  assert.deepEqual(desktop, expected);
  assert.deepEqual(mobile, [...expected, ['saved', '저장'], ['account', '내 정보']]);
  assert.equal((BODY.match(/aria-current="page"/g) || []).length, 1, 'one current item in the static markup');
});

test('OG-IA-3 global layer: search and notifications are overlays, saved and account are views, the assistant is reserved', () => {
  assert.deepEqual([...OVERLAYS], ['search', 'notifications']);
  assert.deepEqual(GLOBAL_ENTRIES.filter((e) => e.enabled).map((e) => e.id), ['search', 'notifications', 'saved', 'account']);
  assert.deepEqual(GLOBAL_ENTRIES.filter((e) => !e.enabled).map((e) => e.id), ['assistant']);
  for (const tool of ['search', 'notifications']) assert.match(BODY, new RegExp(`data-og-tool="${tool}" aria-expanded="false" aria-controls="og-panel-${tool}" aria-label="[^"]+"`));
  assert.match(BODY, /<a class="og-tool og-tool--wide" href="#saved" data-og-nav aria-label="저장">/);
  assert.match(BODY, /<a class="og-tool og-tool--wide" href="#account" data-og-nav aria-label="내 정보">/);
  assert.equal(/ONGIL AI|assistant/i.test(BODY), false, 'no assistant UI in Phase 1');
});

/* ───────── routes ───────── */

test('OG-RT-1 every view has exactly one screen, a level-1 heading and (primary areas) a module region', () => {
  const screens = [...BODY.matchAll(/<section class="og-screen" id="([a-z]+)" data-og-screen="([a-z]+)" aria-labelledby="([a-z-]+)">/g)];
  assert.deepEqual(screens.map((m) => m[2]), [...VIEWS]);
  for (const [, id, view, label] of screens) {
    assert.equal(id, view);
    assert.match(BODY, new RegExp(`<h1[^>]*id="${label}"[^>]*tabindex="-1"|<h1[^>]*tabindex="-1"[^>]*id="${label}"|<h1 id="${label}"[^>]*tabindex="-1"`), `${view} heading`);
  }
  assert.equal((BODY.match(/<h1\b/g) || []).length, VIEWS.length, 'one h1 per view (only one view is shown at a time)');
  for (const view of PRIMARY_VIEWS) assert.match(BODY, new RegExp(`<section class="og-band" data-og-modules="${view}" aria-labelledby="og-${view}-section-title">`));
  assert.match(BODY, /data-og-saved/);
  assert.match(BODY, /data-og-account/);
});

test('OG-RT-2 routes resolve; old deep links still work; unknown hashes are not routes', () => {
  assert.equal(resolveView(''), 'home');
  assert.equal(resolveView('#ongil-home'), 'home');
  for (const v of VIEWS) assert.equal(resolveView(hashFor(v)), v);
  assert.deepEqual(['#learn', '#profile', '#settings', '#support', '#share'].map(resolveView), ['enjoy', 'account', 'account', 'home', 'family']);
  for (const h of ['#og-main', '#nope', '#__proto__', '#constructor', '#search', '#checkout']) assert.equal(resolveView(h), null, h);
  for (const a of AREAS) assert.equal(resolveView(a.hash), a.id);
  assert.equal(hashFor('nope'), '#ongil-home');
});

test('OG-RT-3 the pre-paint route map in index.html equals the router table', () => {
  const block = /var map = \{([\s\S]*?)\};/.exec(INDEX)[1];
  const inline = Object.fromEntries([...block.matchAll(/"([a-z-]+)":\s*"([a-z]+)"/g)].map((m) => [m[1], m[2]]));
  const expected = { ...ROUTE_ALIASES };
  delete expected[''];
  assert.deepEqual(inline, expected);
});

test('OG-RT-4 every in-page link points at a route and CSS shows every view', () => {
  for (const tag of tags('a')) {
    const href = attr(tag, 'href');
    assert.ok(href, tag);
    if (href.startsWith('#') && href !== '#og-main') assert.notEqual(resolveView(href), null, href);
  }
  for (const v of VIEWS) assert.ok(CSS.includes(`html[data-og-view="${v}"] main > [data-og-screen="${v}"]`), v);
});

test('OG-RT-5 titles name the view', () => {
  assert.equal(viewTitle(AREAS[0]), 'Ongil');
  assert.equal(viewTitle(AREAS.find((a) => a.id === 'store')), '스토어 | Ongil');
});

/* ───────── view shells ───────── */

// Phase 2A: Home's nine modules are implemented (available). Phase 2B: My Life's eight. The other six areas are still slots.
// Phase 2C: Home shows My Life's tasks and routines (eleven modules) and My Life records water (nine modules).
// Phase 3: 건강·안부 now has four working parts (check-in, life-check, medication, records), kept in 내 생활 › 건강 and
// linked from the area. Exactly those four may say they work; 도움 요청 · 긴급 연락망 · 병원 · 검진 are still not built and must not.
// My Life gained the four 건강 sections. Every other area still has no working module.
const HEALTH_LIVE = ['check-in', 'life-check', 'medication', 'records'];
test('OG-VW-1 every primary area has a description, an empty state and module slots with unique ids; only Home, My Life and the built health parts are available', () => {
  for (const a of PRIMARY_AREAS) {
    assert.ok(a.description.length >= 10, a.id);
    assert.ok(a.empty && /없습니다/.test(a.empty), `${a.id} empty state`);
    assert.ok(a.modules.length >= 4, a.id);
    assert.equal(new Set(a.modules.map((m) => m.id)).size, a.modules.length, a.id);
    for (const m of a.modules) {
      assert.equal(m.available, a.id === 'home' || a.id === 'life' || (a.id === 'health' && HEALTH_LIVE.includes(m.id)), `${a.id}.${m.id} must not claim to work before it is built`);
      assert.ok(m.title && m.description);
    }
  }
  assert.deepEqual(AREAS.find((a) => a.id === 'health').modules.filter((m) => !m.available).map((m) => m.id), ['help', 'contacts', 'hospital', 'checkup']);
  assert.equal(AREAS.find((a) => a.id === 'health').link.href, '#life/checkin');
  const ids = (id) => AREAS.find((a) => a.id === id).modules.map((m) => m.id);
  assert.deepEqual(ids('home'), ['greeting', 'check-in', 'schedule', 'tasks', 'routines', 'medication', 'life-check', 'family-update', 'today', 'nearby', 'quick-actions']);
  assert.deepEqual(ids('life'), ['calendar', 'tasks', 'routine', 'meals', 'water', 'exercise', 'sleep', 'expenses', 'journal', 'checkin', 'symptoms', 'medication', 'health-notes']);
  assert.equal(ids('store').length, 10);
});

/* ───────── accessibility foundation ───────── */

test('OG-A11Y-1 language, landmarks and skip link', () => {
  assert.match(INDEX, /<html lang="ko">/);
  assert.equal(tags('main').length, 1);
  assert.match(BODY, /<main class="og" id="og-main" tabindex="-1">/);
  assert.equal(tags('header').length, 1);
  assert.match(BODY, /<nav class="gnav__nav" aria-label="Ongil 메뉴">/);
  assert.match(BODY, /<a class="skip-link" href="#og-main" data-og-skip>본문으로 건너뛰기<\/a>/);
  assert.ok(BODY.indexOf('skip-link') < BODY.indexOf('<header'), 'skip link comes first');
  for (const m of BODY.matchAll(/<p class="og-film__wordmark"[^>]*>|<p class="og-label"[^>]*>/g)) assert.match(m[0], /lang="en"/);
});

test('OG-A11Y-2 ids are unique and every aria reference resolves', () => {
  const ids = [...BODY.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], 'duplicate ids');
  const dynamic = new Set([...PRIMARY_VIEWS.map((v) => `og-${v}-section-title`), 'og-onboarding-title']);
  for (const m of BODY.matchAll(/\s(?:aria-labelledby|aria-controls|for)="([^"]+)"/g)) {
    for (const ref of m[1].split(/\s+/)) assert.ok(ids.includes(ref) || dynamic.has(ref), `unresolved reference ${ref}`);
  }
  assert.ok(JS['views.js'].includes('`og-${area.id}-section-title`'));
  assert.ok(JS['onboarding-view.js'].includes("id: 'og-onboarding-title'"));
});

test('OG-A11Y-3 every control has a name and every field a label', () => {
  for (const tag of tags('button')) {
    assert.equal(attr(tag, 'type') !== undefined, true, `button without type: ${tag}`);
  }
  for (const m of BODY.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)) {
    const text = m[1].replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').trim();
    assert.ok(text || attr(m[0], 'aria-label'), `unnamed button: ${m[0].slice(0, 80)}`);
  }
  for (const m of BODY.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)) {
    const text = m[1].replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').trim();
    assert.ok(text || attr(m[0], 'aria-label'), `unnamed link: ${m[0].slice(0, 80)}`);
  }
  for (const tag of [...tags('input'), ...tags('select')]) {
    const id = attr(tag, 'id');
    assert.ok((id && BODY.includes(`for="${id}"`)) || attr(tag, 'aria-label'), `unlabelled field: ${tag}`);
  }
  for (const svg of tags('svg')) assert.match(svg, /aria-hidden="true"/);
  for (const img of tags('img')) assert.notEqual(attr(img, 'alt'), undefined);
});

test('OG-A11Y-4 dynamic status is announced', () => {
  assert.match(BODY, /role="status" aria-live="polite" data-og-search-status/);
  for (const f of ['saved-view.js', 'account-view.js']) assert.match(JS[f], /role: 'status', 'aria-live': 'polite'/, f);
  assert.match(JS['views.js'], /role: state === 'error' \? 'alert' : 'status'/);
});

test('OG-A11Y-5 films never start by themselves in the markup, can be paused, and respect reduced motion', () => {
  const videos = tags('video');
  assert.equal(videos.length, 7);
  for (const v of videos) {
    assert.equal(/\sautoplay\b/.test(v), false, 'no autoplay attribute');
    assert.equal(/\ssrc="/.test(v), false, 'no eager src');
    assert.match(v, /preload="none"/);
    assert.match(v, /data-og-src="https:\/\//);
    assert.match(v, /muted/);
    assert.match(v, /aria-hidden="true"/);
  }
  assert.equal(INDEX.includes('film-keep.js'), false, 'the shared keep-playing script cannot be paused, so it is not loaded here');
  assert.match(JS['film.js'], /data-og-motion-toggle/);
  assert.match(JS['film.js'], /prefers-reduced-motion: reduce/);
  assert.match(CSS, /@media \(prefers-reduced-motion: reduce\)/);
});

test('OG-A11Y-6 senior-friendly floors: 44px controls, 16px regular body text, visible focus, no colour-only state', () => {
  assert.match(CSS, /--og-control: 2\.75rem;/);
  assert.match(CSS, /--og-size-body: 1rem;/);
  assert.match(CSS, /--og-weight-body: 400;/);
  assert.match(CSS, /\.og-tool \{[^}]*width: var\(--og-control\); height: var\(--og-control\)/);
  for (const sel of ['.og-btn', '.og-choice', '.og-filter', '.og-motion']) assert.match(CSS, new RegExp(`\\${sel} \\{[^}]*min-height: var\\(--og-control\\)`), sel);
  assert.match(CSS, /:focus-visible[^{]*\{ outline: var\(--og-focus\)/);
  assert.match(CSS, /\.og-filter\[aria-pressed="true"\]::before \{ content: "✓ "; \}/);
  assert.match(CSS, /\.og-tool\[aria-current="page"\]::after/);
  assert.match(CSS, /html\[data-og-text="large"\] \{ font-size: 112\.5%; \}/);
  assert.match(CSS, /html\[data-og-text="xlarge"\] \{ font-size: 125%; \}/);
});

/* ───────── design is kept ───────── */

test('OG-DS-1 tokens carry the existing dark / film palette and nothing else', () => {
  const tokens = read('styles', 'ongil-tokens.css');
  for (const [name, value] of [['--og-bg', '#000'], ['--og-film-bg', '#0a0a0a'], ['--og-surface', '#212121'], ['--og-surface-deep', '#101010'], ['--og-ink', '#e1e0cc'], ['--og-ink-soft', '#dedbc8'], ['--og-muted', '#9ca3af'], ['--og-radius-card', '1.1rem'], ['--og-radius-lg', '1.5rem'], ['--og-radius-pill', '9999px']]) {
    assert.ok(tokens.includes(`${name}: ${value};`), name);
  }
  assert.match(tokens, /--og-font: "Almarai", "Noto Sans KR"/);
  assert.match(tokens, /--og-font-serif: "Instrument Serif"/);
  assert.equal(/lv-|livon/i.test(CSS.replace(/\/\*[\s\S]*?\*\//g, '')), false, 'no LIVON class names or styles');
  assert.equal(/--nls-/.test(CSS), false, 'the intro page monochrome tokens are not used in the product shell');
});

/* ───────── honesty of copy ───────── */

const COPY = INDEX + '\n' + Object.values(JS).join('\n');

test('OG-NF-1 no claim of a feature that does not exist', () => {
  for (const phrase of ['예약 완료', '예약되었습니다', '결제 완료', '주문 완료', '구매 가능', '구매하기', '바로 구매', '장바구니', '가족 연결 완료', '가족과 연결되었습니다', '연결되었습니다', '실시간 안전 확인', '응급 감지', '전문가 연결 완료', '배송 조회', '재고 있음']) {
    assert.equal(COPY.includes(phrase), false, phrase);
  }
  for (const sentence of COPY.split(/[.\n]|<br>/).filter((s) => s.includes('의료 진단'))) assert.match(sentence, /않습니다|대신하지/, sentence.trim());
  for (const sentence of COPY.split(/[.\n]/).filter((s) => /119/.test(s))) assert.match(sentence, /직접 전화/, sentence.trim());
});

test('OG-NF-2 store has no checkout, cart, price, stock or order of any kind', () => {
  const store = BODY.slice(BODY.indexOf('id="store"'), BODY.indexOf('<!-- SAVED -->'));
  assert.equal(/<form|<input|type="submit"/.test(store), false);
  for (const f of JS_FILES) assert.equal(/checkout|cart|payment|price|stock|orderId|shipping/i.test(CODE[f]), false, f);
  assert.match(AREAS.find((a) => a.id === 'store').notice, /결제, 주문, 배송 기능은 없습니다/);
});

test('OG-NF-3 health and family are shells: no storage, no sharing, no automation', () => {
  for (const f of JS_FILES) {
    assert.equal(/diagnos|emergencyCall|autoCall|shareWithFamily|grantPermission|inviteCode|tel:/i.test(CODE[f]), false, f);
  }
  const health = AREAS.find((a) => a.id === 'health');
  const family = AREAS.find((a) => a.id === 'family');
  assert.match(health.notice, /의료 진단이나 치료 판단을 대신하지 않습니다/);
  assert.match(health.notice, /119에 직접 전화/);
  assert.match(family.notice, /가족 연결은 아직 할 수 없습니다/);
  assert.match(JS['account-view.js'], /'data-og-family-status': 'NOT_AVAILABLE'/);
});

test('OG-NF-4 account is local mode and says so; no sign-in is wired', () => {
  assert.match(JS['account-view.js'], /이 기기에서만 사용 중/);
  assert.match(JS['account-view.js'], /Newon\+ 계정 연결은 아직 제공되지 않습니다/);
  assert.equal(/newon-auth|firebase|NewonAuth/i.test(INDEX), false);
  for (const f of JS_FILES) assert.equal(/firebase|NewonAuth|signIn\(|signInWith|Bearer/i.test(CODE[f]), false, f);
});

/* ───────── code hygiene and security ───────── */

test('OG-SEC-1 no string-built markup anywhere in ONGIL scripts', () => {
  for (const f of JS_FILES) {
    assert.equal(/innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\(|new Function\(/.test(CODE[f]), false, f);
  }
  assert.match(JS['dom.js'], /safeHref\(String\(value\)\)/);
});

// Phase 2A: one external source exists (내 주변). The network function is injected in app.js and used only by data-source.js.
test('OG-SEC-2 only storage.js touches browser storage; the network is reachable only through data-source.js', () => {
  for (const f of JS_FILES) {
    if (f !== 'storage.js') assert.equal(/localStorage|sessionStorage|indexedDB|document\.cookie/.test(CODE[f]), false, f);
    assert.equal(/XMLHttpRequest|sendBeacon|WebSocket|EventSource/.test(CODE[f]), false, f);
    if (f !== 'app.js') assert.equal(/\bfetch\(/.test(CODE[f]), false, f);
  }
  assert.equal((CODE['app.js'].match(/\bfetch\(/g) || []).length, 1, 'app.js injects fetch once');
  assert.match(CODE['app.js'], /fetcher: typeof win\.fetch === 'function' \? \(url, init\) => win\.fetch\(url, init\) : null/);
  for (const f of JS_FILES) if (f !== 'data-source.js') assert.equal(/fetcher\(/.test(CODE[f]), false, f);
  assert.match(CODE['data-source.js'], /credentials: 'omit'/);
});

test('OG-SEC-3 imports resolve, stay inside ongil-start/js, and never reach into LIVON', () => {
  for (const f of JS_FILES) {
    for (const m of JS[f].matchAll(/from '([^']+)'/g)) {
      assert.match(m[1], /^\.\/[a-z-]+\.js$/, `${f} → ${m[1]}`);
      assert.ok(JS_FILES.includes(m[1].slice(2)), `${f} → ${m[1]} is missing`);
    }
    assert.equal(/\/server\//i.test(CODE[f]), false, f);
    /* Phase 2A: the existing data route and the site's API config are named in exactly two places; no LIVON file is imported */
    if (f !== 'data-source.js' && f !== 'app.js') assert.equal(/livon/i.test(CODE[f]), false, f);
  }
  assert.deepEqual(CODE['data-source.js'].match(/livon[^'"\s;]*/gi), ['livon/data']);
  assert.deepEqual([...new Set(CODE['app.js'].match(/livon\w*/gi))], ['LivonApi']);
});

test('OG-SEC-4 the page loads only same-site files (plus the fonts it already used) and no secrets', () => {
  const scripts = [...INDEX.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
  for (const s of scripts) assert.ok(s.startsWith('/'), s);
  assert.equal(scripts.filter((s) => s.includes('/ongil-start/js/')).length, 1, 'one module entry');
  assert.match(INDEX, /<script type="module" src="\/ongil-start\/js\/app\.js\?v=[0-9a-z]+"><\/script>/);
  const sheets = [...INDEX.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"|<link href="([^"]+)" rel="stylesheet"/g)].map((m) => m[1] || m[2]);
  for (const s of sheets) assert.ok(s.startsWith('/') || s.startsWith('https://fonts.googleapis.com/'), s);
  for (const s of [...scripts, ...sheets].filter((x) => x.startsWith('/'))) assert.ok(fs.existsSync(path.join(ROOT, s.split('?')[0])), `missing file ${s}`);
  assert.equal(/api[_-]?key|secret|[a-z]token|token\s*[:=]|passw(or)?d\s*[:=]/i.test(Object.values(CODE).join('\n')), false);
  assert.match(INDEX, /<meta name="robots" content="noindex, nofollow" \/>/);
});

test('OG-SEC-5 index.html has one small inline script (the pre-paint route map) and no inline handlers or styles', () => {
  const inline = [...INDEX.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(inline.length, 1);
  assert.ok(inline[0][1].length < 1200);
  assert.equal(/<style\b/.test(INDEX), false);
  assert.equal(/\son[a-z]+="/.test(BODY), false);
  assert.equal(/\sstyle="/.test(BODY), false);
});
