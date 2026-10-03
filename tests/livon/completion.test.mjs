// LIVON Product Completion Audit (livon-v1-completion) — regression tests for the defects the audit found and fixed.
//   LC-1 … LC-4  header (global) search answers from the same index as Explore; community privacy rule kept
//   LC-5 … LC-7  removing a save also removes its legacy copy, so the item does not come back; legacy import is stable
//   LC-8 … LC-11 the notifications panel shows the current schedule / to-dos / Life Events, never a stale first-visit copy
//   LC-12 … LC-13 film loading: no cancelled-and-resent film request at start-up; an unreachable film host is not retried in a loop
//   LC-17 … LC-20 with the data server reachable: AI references the chat server accepts; Help says what is really connected
//   LC-B1 … LC-B8 the same in a real browser (skipped without a local Chromium, like the accessibility and RC suites)
// Static tests run everywhere (Node vm with the shipped files, no network).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const INDEX = read('livon/index.html');

/* ───────── vm harness: the shipped scripts with a tiny document (panels optional) ───────── */
function harness({ files = [], panels = false, seed = {}, before = null } = {}) {
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  const mem = m => ({ getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) });
  const host = name => ({ innerHTML: '', name });
  const bodies = { alerts: host('alerts'), saved: host('saved') };
  const panel = id => ({ querySelector: s => (s === '[data-livon-alerts-body]' && id === 'alerts' ? bodies.alerts : s === '[data-livon-saved-body]' && id === 'saved' ? bodies.saved : null) });
  const doc = {
    readyState: 'complete', documentElement: { dataset: {}, getAttribute: () => null }, body: {},
    getElementById: () => null, querySelectorAll: () => [], addEventListener() {},
    querySelector: s => {
      if (!panels) return null;
      if (s === "[data-livon-panel='alerts']") return panel('alerts');
      if (s === "[data-livon-panel='saved']") return panel('saved');
      return null;
    }
  };
  const ctx = { document: doc, localStorage: mem(store), sessionStorage: mem(new Map()), location: { hash: '' }, setTimeout: f => f(), console, navigator: {}, Date, JSON, Math };
  ctx.window = ctx;
  vm.createContext(ctx);
  if (before) before(ctx);
  for (const f of files) vm.runInContext(read('livon/' + f), ctx, { filename: f });
  vm.runInContext(read('livon/livon-platform.js'), ctx, { filename: 'livon-platform.js' });
  return { ctx, P: ctx.LivonPlatform, store, bodies };
}
const plain = x => JSON.parse(JSON.stringify(x));
const text = html => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const localDay = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

/* ───────── LC-1 … LC-4 header search ───────── */
test('LC-1 header search delegates to the shared index (LivonSearch) and maps every type to a panel tab', () => {
  const items = [
    { type: 'life', typeLabel: '라이프 스테이지', title: '첫 직장 적응', href: '#life/20s/first-job', meta: '20대' },
    { type: 'life', typeLabel: 'Life Event', title: '이직 준비', href: '#life-events', eventId: 'job-change' },
    { type: 'content', title: '오늘의 콘텐츠', href: '#today/td-a' },
    { type: 'event', title: '행사 안내', href: '#today/td-ev' },
    { type: 'place', title: '도서관', href: '#ex-item-ex-lib' },
    { type: 'service', title: '서비스', href: '#life/services/s1' },
    { type: 'class', title: '클래스', href: '#ex-item-ex-class' },
    { type: 'policy', title: '공식 포털', href: 'https://www.example.go.kr/', external: true },
    { type: 'community', title: '이 기기 글', href: '#cm-post-p1' }
  ];
  const calls = [];
  const { P } = harness({ before: ctx => { ctx.LivonSearch = { search: (q, f) => { calls.push([q, f]); return { items: items.map((item, i) => ({ item, score: 100 - i })), total: items.length }; } }; } });
  const all = P.searchAll('취업', 'all');
  assert.equal(calls.length, 1); assert.equal(calls[0][0], '취업');
  assert.equal(all.length, items.length, 'nothing dropped, nothing added');
  assert.deepEqual(plain(all.map(r => r.kind)), ['content', 'content', 'content', 'content', 'place', 'service', 'service', 'benefit', 'community']);
  assert.equal(all[1].kindLabel, 'Life Event'); assert.equal(all[1].eventId, 'job-change');
  assert.equal(all[0].kindLabel, 'Life Stage');
  assert.equal(all[7].external, true);
  assert.deepEqual(plain(P.searchAll('취업', 'service').map(r => r.title)), ['서비스', '클래스']);
  assert.equal(P.searchAll('', 'all').length, 0, 'an empty query never lists everything');
});

test('LC-2 header search and Explore return the same results for the same query (shipped data, same index)', () => {
  const { ctx, P } = harness({ files: ['today-data.js', 'explore-data.js', 'life-data.js', 'life-events-data.js', 'explore-search.js'] });
  assert.ok(ctx.LivonSearch, 'explore-search.js loaded');
  for (const q of ['청년', '취업', '청약', '이직', '퇴직', '치매', '육아', '연금', '건강검진']) {
    const header = P.searchAll(q, 'all');
    const explore = ctx.LivonSearch.search(q, {});
    assert.equal(header.length, explore.total, q + ': header ' + header.length + ' vs Explore ' + explore.total);
    assert.deepEqual(plain(header.map(r => r.title)), plain(explore.items.map(x => x.item.title)), q + ': same order');
  }
  /* (Life Stage topics come from life-topics.json through LivonLifeHub; with them loaded — browser test LC-B1 — '퇴직' and
     '치매', which the old header list answered with nothing, return results.) */
});

test('LC-3 without the shared index the fallback list still never shows members-only, private, draft or deleted posts', () => {
  const posts = [
    { id: 'a', title: '공개 취업 질문', body: '', visibility: 'public' },
    { id: 'b', title: '가입 커뮤니티 취업 글', body: '', visibility: 'members' },
    { id: 'c', title: '비공개 취업 메모', body: '', visibility: 'private' },
    { id: 'd', title: '임시저장 취업', body: '', draft: true },
    { id: 'e', title: '삭제된 취업', body: '', deleted: true },
    { id: 'f', title: '예전 취업 글', body: '' }
  ];
  const { P } = harness({ seed: { 'livon.cmStore.v1': { posts } } });
  const titles = JSON.parse(JSON.stringify(P.searchAll('취업', 'community').map(r => r.title).sort()));
  assert.deepEqual(titles, ['공개 취업 질문', '예전 취업 글']);
});

test('LC-4 the header panel links to the full Explore results and opens official sites in a new tab', () => {
  const src = read('livon/livon-platform.js');
  assert.match(src, /data-lv-plat-all-results>탐색에서 전체 결과 보기</);
  assert.match(src, /#ex-results\?q=" \+ esc\(encodeURIComponent\(q\)\)/);
  assert.match(src, /r\.external \? " target=\\"_blank\\" rel=\\"noopener noreferrer\\""/);
  assert.match(src, /\(새 창, 공식 사이트\)/, 'the new-tab behaviour is announced');
});

/* ───────── LC-5 … LC-7 saves ───────── */
test('LC-5 removing a Today save that also lives in the legacy list does not bring it back', () => {
  const { P, store } = harness({ panels: true });
  P.saveItem({ id: 'td:place-hangang', title: '한강', label: '한강', type: 'Discovery', href: '#td-item-place-hangang' });
  assert.ok(JSON.parse(store.get('livon.tdSaved')).some(x => x.id === 'place-hangang'), 'legacy copy written on save');
  P.removeSave('td:place-hangang');
  assert.deepEqual(P.listSaves('all').map(x => x.id), []);
  P.init(); P.init();   /* the legacy import runs on start-up and on every saved-panel refresh */
  assert.deepEqual(P.listSaves('all').map(x => x.id), [], 'still removed after the legacy import');
  assert.equal(JSON.parse(store.get('livon.tdSaved')).length, 0);
});

test('LC-6 removing a legacy Life Stage save prunes livon.lifeSavedLocal (string and object entries)', () => {
  const { P, store } = harness({ panels: true, seed: { 'livon.lifeSavedLocal': ['독립 준비', { name: '첫 취업' }] } });
  assert.deepEqual(P.listSaves('all').map(x => x.id).sort(), ['life:독립 준비', 'life:첫 취업']);
  P.removeSave('life:독립 준비'); P.removeSave('life:첫 취업');
  P.init();
  assert.deepEqual(P.listSaves('all'), []);
  assert.deepEqual(JSON.parse(store.get('livon.lifeSavedLocal')), []);
});

test('LC-7 legacy import is stable: plain-string entries keep one id, entries without an id are skipped, nothing multiplies', () => {
  const { P } = harness({ panels: true, seed: { 'livon.tdSaved': ['td-a', { id: 'td-b', label: 'B' }, { label: '' }, null, 'td-a'] } });
  for (let i = 0; i < 5; i++) P.init();
  assert.deepEqual(P.listSaves('all').map(x => x.id).sort(), ['td:td-a', 'td:td-b']);
  assert.ok(!P.listSaves('all').some(x => /0\.\d/.test(x.id)), 'no random id');
});

/* ───────── LC-8 … LC-11 notifications ───────── */
test('LC-8 notifications follow the stored to-dos: a new one appears, a finished one disappears (no reload)', () => {
  const { P, store, bodies } = harness({ panels: true });
  const open = () => { P.setAlertPref('system', true); return text(bodies.alerts.innerHTML); };   /* setAlertPref refreshes the panel */
  assert.doesNotMatch(open(), /할 일 ·/);
  store.set('livon.mlStore.v1', JSON.stringify({ todos: [{ id: 't1', title: '서류 제출', done: false }], events: [] }));
  assert.match(open(), /할 일 · 서류 제출/);
  store.set('livon.mlStore.v1', JSON.stringify({ todos: [{ id: 't1', title: '서류 제출', done: true }], events: [] }));
  assert.doesNotMatch(open(), /서류 제출/, 'a finished to-do is not announced');
  store.set('livon.mlStore.v1', JSON.stringify({ todos: [], events: [] }));
  assert.doesNotMatch(open(), /서류 제출/, 'a deleted to-do is not announced');
  assert.match(open(), /LIVON 안내/);
});

test('LC-9 notifications: today\'s schedule uses the LOCAL date; overdue and due-today to-dos are marked; links open the module', () => {
  const now = new Date();
  const today = localDay(now), yesterday = localDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)), tomorrow = localDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  const { P, store, bodies } = harness({ panels: true });
  store.set('livon.mlStore.v1', JSON.stringify({
    events: [{ id: 'e1', title: '병원', date: today, start: '10:00' }, { id: 'e2', title: '내일 약속', date: tomorrow, start: '09:00' }],
    todos: [{ id: 'a', title: '늦은 일', due: yesterday }, { id: 'b', title: '오늘 일', due: today }, { id: 'c', title: '나중 일', due: '' }]
  }));
  P.setAlertPref('schedule', true);
  const html = bodies.alerts.innerHTML, t = text(html);
  assert.match(t, /오늘 일정 · 10:00 병원/);
  assert.doesNotMatch(t, /내일 약속/);
  assert.match(t, /늦은 일 · 기한 지남/);
  assert.match(t, /오늘 일 · 오늘 마감/);
  assert.match(html, /href="#ml-calendar"/); assert.match(html, /href="#ml-todos"/);
});

test('LC-10 notifications respect the on/off preferences from My Life settings', () => {
  const { P, store, bodies } = harness({ panels: true, seed: { 'livon.mlStore.v1': { todos: [{ id: 't', title: '할 것', done: false }], events: [] }, 'livon.lifeEvents': ['job-change'] } });
  P.setAlertPref('todo', false);
  assert.doesNotMatch(text(bodies.alerts.innerHTML), /할 것/);
  P.setAlertPref('lifeEvent', false); P.setAlertPref('system', false);
  assert.match(text(bodies.alerts.innerHTML), /표시할 알림이 없습니다/);
  P.setAlertPref('todo', true);
  assert.match(text(bodies.alerts.innerHTML), /할 것/);
  assert.ok(!JSON.parse(store.get('livon.platform.v1')).alerts.length, 'derived alerts are not copied into storage');
});

test('LC-11 a Life Event alert names the event and opens it; an unknown id still gives a generic, honest line', () => {
  const probe = harness({ files: ['life-events-data.js'] });
  const ev = probe.ctx.LivonLifeEvents.events[0];
  const { P, bodies } = harness({ files: ['life-events-data.js'], panels: true, seed: { 'livon.lifeEvents': [ev.id, 'no-such-event'] } });
  P.setAlertPref('lifeEvent', true);
  const html = bodies.alerts.innerHTML;
  assert.ok(text(html).includes('Life Event · ' + ev.title), 'named');
  assert.ok(html.includes('data-lv-plat-result="' + ev.id + '"'), 'opens that event');
  assert.match(text(html), /진행 중 Life Event를 이어서 준비해 보세요/);
});

/* ───────── LC-12 … LC-13 film loading (static) ───────── */
test('LC-12 header films get their src after film-keep.js start-up (DOMContentLoaded), so no film request is cancelled and resent', () => {
  const media = read('livon/livon-media.js');
  assert.match(media, /if \(doc\.readyState === "loading"\) doc\.addEventListener\("DOMContentLoaded", syncHeaders\); else syncHeaders\(\);/);
  const pos = s => INDEX.indexOf(s);
  assert.ok(pos('/film-keep.js') > 0 && pos('/film-keep.js') < pos('/livon/livon-media.js'), 'film-keep.js registers its start-up listener first');
  assert.match(read('film-keep.js'), /document\.addEventListener\("DOMContentLoaded", boot\)/);
});

test('LC-13 an unreachable film host: a retry that starts after a failure is counted, so a cancelled request no longer escapes the limit', () => {
  const media = read('livon/livon-media.js');
  assert.match(media, /doc\.addEventListener\("loadstart", onLoadStart, true\)/);
  assert.match(media, /function onLoadStart\(e\) \{[\s\S]*?__lvStarted \|\| !video\.__lvFails\) return;[\s\S]*?__lvRetries < FAIL_LIMIT\) return;[\s\S]*?detach\(video\);/);
  for (const reset of ['retry()', 'hashchange', 'playing']) assert.ok(media.includes('__lvRetries = 0'), reset);
  assert.match(media, /FAIL_LIMIT = 2;/);
});

test('LC-14 cache keys: the four changed scripts carry a new ?v= (other script versions are unchanged)', () => {
  assert.match(INDEX, /\/livon\/livon-media\.js\?v=20261004c1"/);
  assert.match(INDEX, /\/livon\/livon-platform\.js\?v=20261004c1"/);
  assert.equal((INDEX.match(/\?v=20261004c1/g) || []).length, 4, 'livon-media, livon-platform, livon-api-config, ai-page');
});

test('LC-15 a route change closes the open header panel and the mobile menu drawer (both were left open over the new screen)', () => {
  const src = read('livon/livon-platform.js');
  assert.match(src, /window\.addEventListener\("hashchange", function \(\) \{\s*Array\.prototype\.forEach\.call\(root\.querySelectorAll\('\[data-livon-tool\]\[aria-expanded="true"\]'\)/);
  assert.match(src, /getElementById\("gnav-mobile-livon"\)/);
  assert.match(src, /querySelector\("\[data-gnav-close\]"\)/, 'closed through the drawer\'s own control (site-chrome.js is not changed)');
  assert.match(INDEX, /id="gnav-mobile-livon"[\s\S]{0,200}data-gnav-close/);
  /* site-chrome.js (shared) still ignores in-page links — that is why LIVON closes the drawer itself */
  assert.match(read('site-chrome.js'), /if \(!raw \|\| raw\.charAt\(0\) === "#"\) return;/);
});

test('LC-16 separate API origin: every browser URL carries the trailing slash the Vercel API needs; same origin is unchanged', async () => {
  const { livonApiConfigScript } = await import('../../scripts/livon-api-config.mjs');
  const run = (code, host) => { const c = { window: {} }; c.window = c; if (host) c.location = { hostname: host }; vm.createContext(c); vm.runInContext(code, c); return c; };
  const g = run(livonApiConfigScript('https://newon-api.example.app'), 'www.newon.app');
  const u = p => g.LivonApi.url(p);
  assert.equal(u('/api/health'), 'https://newon-api.example.app/api/health/');
  assert.equal(u('/api/livon/chat'), 'https://newon-api.example.app/api/livon/chat/');
  assert.equal(u('/api/livon/userdata'), 'https://newon-api.example.app/api/livon/userdata/');
  assert.equal(u('/api/livon/data?action=status'), 'https://newon-api.example.app/api/livon/data/?action=status');
  assert.equal(u('/api/health/'), 'https://newon-api.example.app/api/health/', 'never a double slash');
  vm.runInContext(read('livon/data/livon-data-config.js'), g);
  assert.equal(g.LivonDataConfig.serverEndpoint + '?action=status', 'https://newon-api.example.app/api/livon/data/?action=status', 'what the data layer requests');
  const same = run(livonApiConfigScript(''), 'www.newon.app');
  assert.equal(same.LivonApi.url('/api/health'), '/api/health', 'same origin (GitHub Pages today) is unchanged');
  assert.equal(run(livonApiConfigScript('https://newon-api.example.app'), 'localhost').LivonApi.url('/api/livon/chat'), '/api/livon/chat', 'local dev server unchanged');
  /* the slash is tied to the API deployment's configuration: if vercel.json stops adding slashes this test must be revisited */
  assert.equal(JSON.parse(read('vercel.json')).trailingSlash, true);
  const ai = read('livon/ai-page.js');
  assert.match(ai, /var CHAT_URL = API\.url\("\/api\/livon\/chat"\);/);
  assert.match(ai, /return fetch\(CHAT_URL, \{/);
  assert.doesNotMatch(ai, /API_BASE \+/, 'no URL is glued together after the config has built it');
  assert.equal(read('livon/livon-api-config.js'), livonApiConfigScript(''), 'committed file = generated default');
  assert.match(INDEX, /\/livon\/livon-api-config\.js\?v=20261004c1"/); assert.match(INDEX, /\/livon\/ai-page\.js\?v=20261004c1"/);
});

/* ───────── browser (skipped when no local Chromium) ───────── */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const canBrowse = fs.existsSync(PW) && fs.existsSync(CHROME);
const skip = !canBrowse && 'no local Chromium';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
let B = null, SERVER = null, BASE = '';
async function boot() {
  if (B) return;
  const { chromium } = await import(PW);
  SERVER = await new Promise(resolve => {
    const s = http.createServer((req, res) => {
      let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); return res.end(fs.readFileSync(f)); }
      res.writeHead(404); res.end('not found');
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
  BASE = 'http://127.0.0.1:' + SERVER.address().port;
  B = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
}
test.after(async () => { if (B) await B.close(); if (SERVER) SERVER.close(); });
const SKIPPED = JSON.stringify({ version: 1, state: 'SKIPPED', step: '', draft: null, updatedAt: 1 });
async function open(url = '/livon/', { init = null, film = null } = {}) {
  await boot();
  const ctx = await B.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const ext = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith(BASE)) return r.continue(); ext.push(u); return film && /\.(mp4|webm)(\?|$)/.test(u) ? film(r) : r.abort(); });
  await ctx.addInitScript(v => { try { if (!localStorage.getItem('livon.personalization.v1')) localStorage.setItem('livon.personalization.v1', v); } catch (e) {} }, SKIPPED);
  if (init) await ctx.addInitScript(init.fn, init.arg);
  const pg = await ctx.newPage();
  pg._errors = []; pg._ext = ext; pg.on('pageerror', e => pg._errors.push(e.message));
  await pg.goto(BASE + url, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(900);
  return pg;
}

test('LC-B1 header search panel: same count as Explore for the same query, with Life Stage topics; "전체 결과" opens Explore', { skip }, async () => {
  const pg = await open('/livon/#today');
  for (const q of ['청약', '퇴직', '치매']) {
    await pg.click('[data-livon-tool="search"]');
    await pg.fill('#livon-search-input', q); await pg.press('#livon-search-input', 'Enter'); await pg.waitForTimeout(300);
    const note = await pg.locator('[data-livon-search-body] .livon-panel__note').nth(0).innerText();
    const header = +(/(\d+)건/.exec(note) || [])[1];
    const explore = await pg.evaluate(q => window.LivonSearch.search(q, {}).total, q);
    assert.ok(header > 0, q + ' has results');
    assert.equal(header, explore, q + ': header ' + header + ' vs Explore ' + explore);
    await pg.locator('[data-lv-plat-all-results]').click(); await pg.waitForTimeout(700);
    assert.equal(await pg.evaluate(() => decodeURIComponent(location.hash)), '#ex-results?q=' + q);
    assert.equal(await pg.evaluate(() => document.documentElement.getAttribute('data-lv-view')), 'explore');
  }
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('LC-B2 notifications panel: a to-do added in My Life appears without reload; finishing it removes it', { skip }, async () => {
  const pg = await open('/livon/#livon-home');
  const alerts = async () => { await pg.click('[data-livon-tool="alerts"]'); await pg.waitForTimeout(200); const t = await pg.locator('[data-livon-alerts-body]').innerText(); await pg.keyboard.press('Escape'); return t; };
  assert.doesNotMatch(await alerts(), /할 일 ·/);
  await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('livon.mlStore.v1') || '{}'); s.todos = [{ id: 'lc', title: '감사 확인 할 일', done: false }]; s.events = s.events || []; localStorage.setItem('livon.mlStore.v1', JSON.stringify(s)); });
  assert.match(await alerts(), /할 일 · 감사 확인 할 일/);
  await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('livon.mlStore.v1')); s.todos[0].done = true; localStorage.setItem('livon.mlStore.v1', JSON.stringify(s)); });
  assert.doesNotMatch(await alerts(), /감사 확인 할 일/);
  for (const h of ['#ml-todos', '#ml-calendar']) {
    await pg.evaluate(h => { location.hash = h; }, h); await pg.waitForTimeout(600);
    assert.equal(await pg.evaluate(() => document.documentElement.getAttribute('data-lv-view')), 'life-now', h + ' is a My Life route');
  }
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('LC-B3 a Today save that also exists in the legacy list stays removed after unsave and reload', { skip }, async () => {
  const pg = await open('/livon/#today');
  await pg.evaluate(() => { const c = window.LivonTodayData.contents[0]; window.LivonPlatform.saveItem({ id: 'td:' + c.id, title: c.title, label: c.title, type: 'Discovery', href: '#td-item-' + c.id }); window.LivonPlatform.removeSave('td:' + c.id); });
  await pg.click('[data-livon-tool="saved"]'); await pg.waitForTimeout(200);
  await pg.reload(); await pg.waitForTimeout(900);
  assert.equal(await pg.evaluate(() => window.LivonPlatform.listSaves('all').length), 0);
  await pg.context().close();
});

test('LC-B4 films: an unreachable host is asked at most three times per film (was up to four); a reachable film is requested once and plays', { skip }, async () => {
  for (let i = 0; i < 4; i++) {
    const pg = await open('/livon/', {});
    await pg.waitForTimeout(2000);
    const per = {}; for (const u of pg._ext.filter(u => /\.mp4/.test(u))) per[u] = (per[u] || 0) + 1;
    assert.ok(Object.keys(per).length >= 1);
    for (const [u, n] of Object.entries(per)) assert.ok(n <= 3, u.split('/').pop() + ' requested ' + n + ' times (run ' + i + ')');
    await pg.context().close();
  }
  /* a reachable host: a short WebM recorded by the browser itself stands in for the film (headless Chromium has no H.264) */
  await boot();
  const dir = fs.mkdtempSync(path.join(ROOT, '.tmp-lc-film-'));
  try {
    const rec = await B.newContext({ recordVideo: { dir, size: { width: 160, height: 90 } }, viewport: { width: 160, height: 90 } });
    const rp = await rec.newPage(); await rp.setContent('<body style="background:teal"><b id=x>0</b><script>let i=0;setInterval(()=>x.textContent=i++,40)</script>'); await rp.waitForTimeout(1500);
    await rec.close();
    const webm = fs.readFileSync(path.join(dir, fs.readdirSync(dir).find(f => f.endsWith('.webm'))));
    const pg = await open('/livon/', { film: r => r.fulfill({ status: 200, contentType: 'video/webm', body: webm }) });
    await pg.waitForTimeout(1800);
    const films = pg._ext.filter(u => /\.mp4/.test(u));
    assert.equal(films.length, 1, 'the Home film is requested once (was twice: film-keep.js cancelled and resent it)');
    assert.equal(await pg.evaluate(() => { const v = document.querySelector('#livon-home video[src]'); return !!v && v.readyState >= 2 && !v.paused; }), true, 'the Home film plays');
    await pg.context().close();
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('LC-B5 header panels and the mobile menu close after a link inside them changes the route; focus moves to the new screen', { skip }, async () => {
  const pg = await open('/livon/#livon-home');
  await pg.click('[data-livon-tool="profile"]'); await pg.waitForTimeout(200);
  await pg.locator('#livon-panel-profile a[href="#help"]').click(); await pg.waitForTimeout(600);
  assert.equal(await pg.evaluate(() => document.getElementById('livon-panel-profile').hidden), true, 'profile menu closed');
  assert.equal(await pg.getAttribute('[data-livon-tool="profile"]', 'aria-expanded'), 'false');
  await pg.click('[data-livon-tool="alerts"]'); await pg.waitForTimeout(200);
  await pg.locator('#livon-panel-alerts a').first().click(); await pg.waitForTimeout(600);
  assert.equal(await pg.evaluate(() => document.getElementById('livon-panel-alerts').hidden), true, 'alerts panel closed');
  await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(300);
  for (const [href, view] of [['#today', 'today'], ['#explore', 'explore'], ['#help', 'help']]) {
    await pg.click('[data-gnav-toggle]'); await pg.waitForTimeout(300);
    assert.equal(await pg.evaluate(() => document.getElementById('gnav-mobile-livon').hidden), false, 'drawer opened');
    await pg.locator('.gnav-mobile__sublink[href="' + href + '"]').click(); await pg.waitForTimeout(700);
    const st = await pg.evaluate(() => ({ hidden: document.getElementById('gnav-mobile-livon').hidden, expanded: document.querySelector('[data-gnav-toggle]').getAttribute('aria-expanded'), view: document.documentElement.getAttribute('data-lv-view'), inScreen: !!document.activeElement.closest('main > [data-lv-screen="' + document.documentElement.getAttribute('data-lv-view') + '"]') }));
    assert.deepEqual(st, { hidden: true, expanded: 'false', view, inScreen: true }, href);
  }
  /* Escape and the close button still work as before */
  await pg.click('[data-gnav-toggle]'); await pg.waitForTimeout(300); await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
  assert.equal(await pg.evaluate(() => document.getElementById('gnav-mobile-livon').hidden), true, 'Escape closes');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('LC-B6 production page + separate API origin that redirects /api/x → /api/x/ without CORS: the AI page reaches the API and stays honest', { skip }, async () => {
  const { livonApiConfigScript } = await import('../../scripts/livon-api-config.mjs');
  await boot();
  const SITE = 'https://www.newon.app', API = 'https://newon-api.example.app';
  const ctx = await B.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const seen = [];
  await ctx.route('**/*', async r => {
    const url = new URL(r.request().url());
    if (url.origin === SITE) {
      if (url.pathname === '/livon/livon-api-config.js') return r.fulfill({ status: 200, contentType: 'text/javascript', body: livonApiConfigScript(API) });
      let f = path.join(ROOT, decodeURIComponent(url.pathname));
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (f.startsWith(ROOT) && fs.existsSync(f)) return r.fulfill({ status: 200, contentType: TYPES[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
      return r.fulfill({ status: 404, body: 'not found' });
    }
    if (url.origin === API) {
      seen.push(r.request().method() + ' ' + url.pathname + url.search);
      const cors = { 'Access-Control-Allow-Origin': SITE, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
      /* what the live API does (vercel.json trailingSlash: true): a redirect without CORS headers */
      if (!url.pathname.endsWith('/')) return r.fulfill({ status: 308, headers: { Location: API + url.pathname + '/' + url.search } });
      if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
      if (url.pathname === '/api/health/') return r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ status: 'ok', aiConfigured: false, protectionConfigured: true }) });
      if (url.pathname === '/api/livon/chat/') return r.fulfill({ status: 503, headers: cors, contentType: 'application/json', body: JSON.stringify({ success: false, code: 'AI_NOT_CONFIGURED', error: 'AI 설정이 완료되지 않았습니다.' }) });
      return r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ ok: true, providers: {} }) });
    }
    return r.abort();
  });
  await ctx.addInitScript(v => { try { if (!localStorage.getItem('livon.personalization.v1')) localStorage.setItem('livon.personalization.v1', v); } catch (e) {} }, SKIPPED);
  const pg = await ctx.newPage(); const errors = []; pg.on('pageerror', e => errors.push(e.message));
  await pg.goto(SITE + '/livon/#ai-chat', { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(1500);
  assert.equal(await pg.evaluate(() => window.LivonApi.env), 'production');
  assert.ok(seen.includes('GET /api/health/'), 'health asked at the slash URL: ' + seen.join(', '));
  assert.ok(!seen.some(x => /^GET \/api\/health$/.test(x)), 'never the redirecting URL');
  const note = await pg.locator('[data-lv-ai-api-note]').innerText();
  assert.match(note, /AI 연결이 아직 완료되지 않았습니다/, 'the server answered: AI not configured (not "cannot check")');
  await pg.evaluate(() => window.LivonAI.sendMessage('테스트 질문'));
  await pg.locator('.lv-ai-bubble--error').waitFor();
  assert.match(await pg.locator('.lv-ai-bubble--error').innerText(), /연결이 아직 완료되지 않았습니다/, 'honest error, no invented answer');
  assert.ok(seen.some(x => x === 'POST /api/livon/chat/'), 'chat sent to the slash URL: ' + seen.join(', '));
  assert.equal(await pg.locator('.lv-ai-bubble--ai').count(), 0);
  assert.deepEqual(errors, []);
  await ctx.close();
});

/* ───────── LC-17 … LC-20: the API origin is configured in production (data server reachable, AI not configured) ───────── */
import { loadLivon } from '../../scripts/livon-data-quality.mjs';

test('LC-17 AI references: the page sends only links the chat server accepts (one rejected link used to fail the whole question)', async () => {
  const { REF_HREF, normalizeInput, LIMITS } = await import('../../server/livon/chat.mjs');
  const ai = read('livon/ai-page.js');
  const client = /var REF_HREF = (\/.*\/i);/.exec(ai);
  assert.ok(client, 'the page has its own copy of the pattern');
  assert.equal(client[1], String(REF_HREF), 'client pattern = server pattern (server/livon/chat.mjs REF_HREF)');
  assert.match(ai, /if \(!REF_HREF\.test\(it\.href\) \|\| it\.href\.length > 200\) return;/, 'search references are filtered');
  assert.match(ai, /jobRefs = jobRefs\.filter\(function \(r\) \{ return r && REF_HREF\.test\(r\.href\) && r\.href\.length <= 200; \}\);/, 'job-training references are filtered');
  assert.doesNotMatch(ai, /if \(!\/\^\(#\|https:\\\/\\\/\)\/i\.test\(it\.href\)\) return;/, 'the loose "# or https" rule is gone');
  const re = vm.runInNewContext(client[1]);
  /* every link type the shared search index can return for a question */
  const ctx = loadLivon();
  const hrefs = new Set();
  for (const q of ['첫 취업', '이직', '육아', '독립', '건강검진', '청약', '창업', '은퇴', '도서관', '평생학습', '세무']) for (const x of ctx.LivonSearch.search(q, {}).items) if (x.item && x.item.href) hrefs.add(x.item.href);
  const all = [...hrefs];
  assert.ok(all.includes('#life-events'), 'the index does return Life Event links (the case that broke)');
  const kept = all.filter(h => re.test(h) && h.length <= 200), dropped = all.filter(h => !kept.includes(h));
  assert.ok(kept.length >= 20, 'most links are kept: ' + kept.length);
  assert.ok(dropped.includes('#life-events'));
  for (const h of dropped) assert.throws(() => normalizeInput({ message: 'q', context: { refs: [{ kind: 'k', title: 't', href: h }] } }), e => e.code === 'INVALID_CONTEXT', 'the server refuses ' + h);
  for (let i = 0; i < kept.length; i += LIMITS.refs - 1) {
    const refs = kept.slice(i, i + LIMITS.refs - 1).map(h => ({ kind: '라이프 스테이지', title: '제목', href: h }));
    assert.doesNotThrow(() => normalizeInput({ message: '첫 취업 준비 방법', conversation: [], context: { answerLength: 'balanced', personalize: true, refs } }), 'the server accepts ' + refs.map(r => r.href).join(' '));
  }
});

function helpWith(status) {
  const ctx = loadLivon({ patch(c) { if (status) c.LivonData = { status: () => status }; } });
  for (const f of ['help-data.js', 'help-page.js']) vm.runInContext(read('livon/' + f), ctx, { filename: f });
  if (status) ctx.LivonData = { status: () => status };
  return ctx;
}
const provider = (id, name, st, o = {}) => Object.assign({ id, name, enabled: st !== 'planned', requiresServer: true, requiresKey: true, status: st, builtin: false }, o);
const CURATED = { id: 'livon-curated', name: 'LIVON 큐레이션', enabled: true, requiresServer: false, requiresKey: false, status: 'active', builtin: true };

test('LC-18 Help service status: public data is reported from what this browser received — never from configuration alone', () => {
  const row = html => /실시간 공공 데이터<\/strong><span class="lv-hp-badge lv-hp-badge--(\w+)"[^>]*>([^<]*)<\/span><\/div><p>([^<]*)/.exec(html);
  const none = row(helpWith(null).LivonHelp._test.viewStatus());
  assert.deepEqual([none[1], none[2]], ['off', '아직 연결 안 됨'], 'no data layer: as written in help-data.js');
  const planned = row(helpWith({ providers: [CURATED, provider('kr-lifelong-class', '전국평생학습강좌표준데이터', 'planned')] }).LivonHelp._test.viewStatus());
  assert.equal(planned[1], 'off', 'the built-in curated source is not "public data connected"');
  const configured = row(helpWith({ providers: [CURATED, provider('kr-kakao-place', 'Kakao Local', 'configured'), provider('kr-tourapi', '한국관광공사', 'configured')] }).LivonHelp._test.viewStatus());
  assert.deepEqual([configured[1], configured[2]], ['off', '아직 연결 안 됨'], 'configured on the server but nothing received: not shown as connected');
  const live = row(helpWith({ providers: [CURATED, provider('kr-kakao-place', 'Kakao Local', 'configured'), provider('kr-lifelong-class', '전국평생학습강좌표준데이터', 'active'), provider('kr-public-tax-expert', '공공기관 공개 마을세무사 정보', 'active')] }).LivonHelp._test.viewStatus());
  assert.deepEqual([live[1], live[2]], ['available', '일부 연결됨']);
  assert.match(live[3], /지금 이 브라우저에서 받아 온 공공 데이터가 있어요: 전국평생학습강좌표준데이터, 공공기관 공개 마을세무사 정보\./);
  assert.doesNotMatch(live[3], /Kakao/, 'a provider that is only configured is not named');
  const broken = helpWith(null); broken.LivonData = { status() { throw new Error('boom'); } };
  assert.equal(row(broken.LivonHelp._test.viewStatus())[1], 'off', 'a failing data layer does not break Help');
  /* the other rows are untouched: AI and the account stay "not connected" whatever the data layer says */
  const html = helpWith({ providers: [CURATED, provider('kr-lifelong-class', 'x', 'active')] }).LivonHelp._test.viewStatus();
  assert.match(html, /LIVON AI<\/strong><span class="lv-hp-badge lv-hp-badge--off">아직 연결 안 됨/);
  assert.match(html, /계정·기기 간 동기화<\/strong><span class="lv-hp-badge lv-hp-badge--off">아직 연결 안 됨/);
});

test('LC-19 Help articles stay true with and without a data server: live-data and what-is-stored', () => {
  const D = helpWith(null).LivonHelpData, by = Object.fromEntries(D.articles.map(a => [a.id, a]));
  const live = by['live-data'];
  assert.doesNotMatch(live.short + live.body.join(' '), /아직 연결되어 있지 않아요/, 'no unconditional "not connected" (false once the data server answers)');
  assert.match(live.short, /데이터 서버가 연결되어 응답할 때만, 일부 영역에서 보여요/);
  assert.match(live.body.join(' '), /연결되지 않았거나 응답이 없으면[^.]*준비 중으로 표시되고/);
  assert.match(live.body.join(' '), /‘서비스 상태’에서 볼 수 있어요/);
  const stored = by['what-is-stored'];
  assert.doesNotMatch(stored.body.join(' '), /예외는 하나예요/, 'place and course search also send the search word to the data server');
  assert.match(stored.body.join(' '), /탐색으로 장소나 훈련 과정을 검색하면, 검색어가[^.]*데이터 서버로 전달돼요/);
  assert.match(stored.body.join(' '), /‘내 위치 기준으로 찾기’를 눌렀을 때만 약 100m 단위로 줄인 위치가 함께 가고, 저장되지 않아요/);
  /* what the Help now says about location matches the screen that asks for it */
  assert.match(read('livon/explore-page.js'), /위치는 이 검색에만 쓰이고 저장되지 않습니다\. 약 100m 단위로 줄여서 보냅니다\./);
  /* AI and account articles are unchanged: still not connected (production: aiConfigured false, userdata disabled) */
  assert.match(by['ai-status'].short, /아직 답변을 받을 수 없어요/);
  assert.equal(D.facts.ai, 'NOT_CONNECTED'); assert.equal(D.facts.account, 'NOT_CONNECTED'); assert.equal(D.facts.sync, 'NOT_CONNECTED');
});

test('LC-20 cache keys for this step: help-data.js and help-page.js carry a new ?v=', () => {
  assert.match(INDEX, /\/livon\/help-data\.js\?v=20261004c2"/); assert.match(INDEX, /\/livon\/help-page\.js\?v=20261004c2"/);
  assert.equal((INDEX.match(/\?v=20261004c2/g) || []).length, 2);
});

/* the real API handlers (server/livon) with fixture upstreams: four providers configured, AI not configured — production's shape */
async function liveSite() {
  await boot();
  const { createDataHandler } = await import('../../server/livon/data/http.mjs');
  const { createHealthHandler } = await import('../../server/livon/health.mjs');
  const { memoryCache } = await import('../../server/livon/data/cache.mjs');
  const { fakeUpstream } = await import('./fixtures/upstream-fixtures.mjs');
  const chat = (await import('../../api/livon/chat.mjs')).default;
  const env = { KAKAO_REST_API_KEY: 'kk-fixture-key', TOURAPI_SERVICE_KEY: 'tr-fixture-key', PUBLIC_DATA_SERVICE_KEY: 'pd-fixture-key' };
  const data = createDataHandler({ env, fetcher: fakeUpstream().fetcher, cache: memoryCache(), log: () => {} });
  const health = createHealthHandler({ env });
  const server = await new Promise(resolve => {
    const s = http.createServer((req, res) => {
      const route = req.url.split('?')[0].replace(/\/$/, '');
      if (route === '/api/health') return health(req, res);
      if (route === '/api/livon/data') return data(req, res);
      if (route === '/api/livon/chat') return chat(req, res);
      let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); return res.end(fs.readFileSync(f)); }
      res.writeHead(404); res.end('not found');
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  const ctx = await B.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await ctx.route('**/*', r => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  await ctx.addInitScript(v => { try { if (!localStorage.getItem('livon.personalization.v1')) localStorage.setItem('livon.personalization.v1', v); } catch (e) {} }, SKIPPED);
  const pg = await ctx.newPage();
  pg._errors = []; pg.on('pageerror', e => pg._errors.push(e.message));
  pg._chat = []; pg.on('response', async r => { if (r.url().includes('/api/livon/chat')) { try { pg._chat.push([r.status(), (await r.json()).code]); } catch (e) {} } });
  return { pg, base, close: async () => { await ctx.close(); server.close(); } };
}

test('LC-B7 data server reachable, AI not configured: Help reports the public data that arrived; AI and account stay "not connected"', { skip }, async () => {
  const { pg, base, close } = await liveSite();
  try {
    await pg.goto(base + '/livon/#help/status', { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(2500);
    const badge = pg.locator('[data-lv-hp-live]');
    assert.equal(await badge.innerText(), '일부 연결됨', 'the row follows the data that arrived after the page was shown');
    const text = await pg.locator('#help').innerText();
    assert.match(text, /지금 이 브라우저에서 받아 온 공공 데이터가 있어요: [^\n]*평생학습/);
    assert.match(text, /LIVON AI\s*아직 연결 안 됨/); assert.match(text, /계정·기기 간 동기화\s*아직 연결 안 됨/);
    assert.equal(await pg.evaluate(() => window.LivonScreenData.repository().all().filter(e => e.sourceType === 'public_api').length > 0), true, 'public rows really are in the repository');
    await pg.goto(base + '/livon/#help/a/live-data'); await pg.waitForTimeout(500);
    assert.doesNotMatch(await pg.locator('#help').innerText(), /아직 연결되어 있지 않아요/);
    assert.equal(await pg.evaluate(() => document.querySelectorAll('[data-newon-auth-signin]').length), 0, 'no sign-in control');
    assert.deepEqual(pg._errors, []);
  } finally { await close(); }
});

test('LC-B8 a real question that matches a Life Event reaches the chat server as a valid request and gets the honest "not configured" answer', { skip }, async () => {
  const { pg, base, close } = await liveSite();
  try {
    await pg.goto(base + '/livon/#ai-chat', { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(2500);
    assert.match(await pg.locator('[data-lv-ai-api-note]').innerText(), /AI 연결이 아직 완료되지 않았습니다/);
    await pg.fill('#ai-chat-q', '첫 취업 준비 방법'); await pg.keyboard.press('Enter');
    await pg.locator('.lv-ai-bubble--error').waitFor();
    assert.deepEqual(pg._chat, [[503, 'AI_NOT_CONFIGURED']], 'accepted by the server\'s validation (was 400 INVALID_CONTEXT), refused only because no AI is configured');
    assert.match(await pg.locator('.lv-ai-bubble--error').innerText(), /연결이 아직 완료되지 않았습니다/, 'not "temporarily unavailable, try again"');
    assert.equal(await pg.locator('.lv-ai-bubble--ai').count(), 0, 'no invented answer');
    assert.deepEqual(pg._errors, []);
  } finally { await close(); }
});
