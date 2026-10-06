// LIVON Explore V2 (EV2-01 …). Explore as LIVON's public discovery hub: topics with real counts, official sources,
// removable filters, one saved store, and no private data. Data tests run everywhere (node:vm); browser tests need a
// local Chromium and skip without it. Cache-mix tests need the pre-V2 base commit in git and skip without it.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, 'livon', f), 'utf8');
const PAGE = read('explore-page.js'), SEARCH = read('explore-search.js'), INDEX = read('index.html'), PLATFORM = read('livon-platform.js'), CSS = read('explore-page.css');
const EXPLORE_HTML = INDEX.slice(INDEX.indexOf('id="explore" data-lv-screen="explore"'), INDEX.indexOf('id="community" data-lv-screen="community"'));
const code = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const BASE_COMMIT = '04ee2649c';
const ML = 'livon.mlStore.v1', CM = 'livon.cmStore.v1';
const SECRET = 'QA비밀기록제목';

/* ───────── node:vm: the public search index on its own ───────── */
function searchCtx({ local = {}, exploreItems = null } = {}) {
  const m = new Map(Object.entries(local).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  const ls = { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; } };
  const ctx = { console, localStorage: ls, sessionStorage: ls, location: { hash: '' }, document: { addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] }, addEventListener() {}, setTimeout, fetch: () => { throw new Error('no network'); } };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['explore-data.js', 'today-data.js']) vm.runInContext(read(f), ctx);
  if (exploreItems) ctx.LivonExploreData.items = exploreItems(ctx.LivonExploreData.items);
  vm.runInContext(SEARCH, ctx);
  return ctx;
}
const titles = r => r.items.map(x => x.item.title);

test('EV2-01 topics: the topic list is the search index\'s own taxonomy (no second topic database)', () => {
  assert.match(PAGE, /var TOPIC_ORDER = \["housing", "money", "career", "health", "relation", "parenting", "care", "learn", "hobby", "travel", "startup", "digital"\];/);
  const ctx = searchCtx();
  const ids = ctx.LivonSearch.CATS.map(c => c.id);
  for (const id of ['housing', 'money', 'career', 'health', 'relation', 'parenting', 'care', 'learn', 'hobby', 'travel', 'startup', 'digital']) assert.ok(ids.includes(id), id);
  assert.match(PAGE, /function topicCounts\(\) \{[\s\S]*?L\.index\(\)/, 'counts come from the public index');
  assert.doesNotMatch(code(PAGE).slice(PAGE.indexOf('function topicCounts'), PAGE.indexOf('function renderTopics')), /communityItems|cmStore|mlStore/);
});

test('EV2-02 public search: Explore items and Today contents are found; empty query with no condition returns nothing', () => {
  const S = searchCtx().LivonSearch;
  assert.ok(S.search('취업', {}).total > 0);
  assert.equal(S.search('', {}).total, 0, 'no query and no filter → no list (the page shows an idle prompt instead)');
  assert.ok(S.search('', { cat: 'housing' }).total > 0, 'a topic alone lists that topic');
  assert.equal(S.search('zzqqxx없는말', {}).total, 0);
});

test('EV2-03 private boundary (data): My Life records, Community drafts / private / members posts never enter Explore search', () => {
  const ml = { v: 2, todos: [{ id: 't', title: SECRET + '할일', due: '2026-10-06' }], events: [{ id: 'e', title: SECRET + '일정', date: '2026-10-06' }], habits: [{ id: 'h', title: SECRET + '루틴' }], journal: [{ id: 'j', title: SECRET + '일기', body: SECRET }], transactions: [{ id: 'x', memo: SECRET }], goals: [{ id: 'g', title: SECRET + '목표' }] };
  const cm = { posts: [
    { id: 'p1', title: SECRET + '초안', body: 'x', draft: true, createdAt: 1 },
    { id: 'p2', title: SECRET + '비공개', body: 'x', visibility: 'private', createdAt: 1 },
    { id: 'p3', title: SECRET + '멤버', body: 'x', visibility: 'members', createdAt: 1 },
    { id: 'p4', title: SECRET + '삭제', body: 'x', deleted: true, createdAt: 1 },
    { id: 'p5', title: '공개 커뮤니티 글 테스트', body: 'x', visibility: 'public', createdAt: 1 }] };
  const S = searchCtx({ local: { [ML]: ml, [CM]: cm } }).LivonSearch;
  assert.equal(JSON.stringify(titles(S.search(SECRET, {}))), '[]', 'no My Life record and no non-public community post');
  for (const w of ['할일', '일정', '루틴', '일기', '목표', '초안', '비공개', '멤버', '삭제']) assert.equal(S.search(SECRET + w, {}).total, 0, w);
  const pub = S.search('공개 커뮤니티 글 테스트', {});
  assert.equal(pub.items[0].item.type, 'community'); assert.equal(pub.items[0].item.typeLabel, '커뮤니티 · 이 기기', 'a public post written on this device is labelled as such');
  assert.equal(S.index().some(x => x.type === 'community'), false, 'community posts are not part of the cached public index (topic counts)');
  for (const src of [PAGE, SEARCH]) {
    assert.doesNotMatch(code(src), /livon\.mlStore\.v1|LivonMyLife|habitLogs|\.todos\b|\.journal\b|\.transactions\b/, 'Explore reads no My Life store');
  }
});

test('EV2-04 malformed data: null rows, rows without id or title, and wrong field types are skipped, never break the index', () => {
  const S = searchCtx({ exploreItems: items => [null, 5, { title: 'id 없음' }, { id: 'no-title' }, { id: 'bad-tags', title: '태그가 글자인 항목 EV2', tags: '주거', categoryIds: 'housing' }, ...items] }).LivonSearch;
  const idx = S.index();
  assert.ok(idx.length > 20);
  assert.equal(idx.some(x => x.key === 'ex:no-title'), false);
  const hit = S.search('태그가 글자인 항목 EV2', {});
  assert.equal(hit.total, 1, 'a row with string tags is normalised and still searchable');
  assert.match(PAGE, /function items\(\) \{[\s\S]{0,400}typeof x\.id === "string"[\s\S]{0,120}typeof x\.title === "string"/);
});

test('EV2-05 truthfulness: no popularity, trend, real-time, AI or personal-match claims in Explore or the shared search panel', () => {
  const ui = [code(PAGE), EXPLORE_HTML.replace(/<!--[\s\S]*?-->/g, ''), code(SEARCH)].join('\n')
    .replace('가격·평점·인기순은 확인된 데이터가 없어 제공하지 않습니다.', '').replace('많이 본 순서나 인기를 뜻하지 않습니다.', '');
  for (const bad of ['인기', '트렌드', '실시간', '많이 본', '많이 찾', 'AI 추천', 'AI 분석', 'AI 맞춤', '맞춤 탐색', '추천 검색어', '연령대별 추천', '규칙으로 추천', 'My Life sync', '관심 저장']) assert.equal(ui.includes(bad), false, bad);
  assert.equal(code(PLATFORM).includes('인기 · 추천 검색'), false, 'shared search panel: example queries are not called popular');
  assert.match(code(PLATFORM), /<strong>검색어 예시<\/strong>/);
  assert.match(PAGE, /AI가 고른 것이 아닙니다/);
  assert.match(EXPLORE_HTML, /많이 본 순서나 인기를 뜻하지 않습니다/);
});

test('EV2-06 one saved store: Explore writes no Explore-only list, no My Life store and no interest list', () => {
  const c = code(PAGE);
  assert.doesNotMatch(c, /syncToMyLife|savedExplore|KEY_ML_SAVED/);
  assert.equal((c.match(/writeJSON\(KEY_SAVED/g) || []).length, 1, 'only the one-time migration of the old Explore list');
  assert.doesNotMatch(c, /writeJSON\(KEY_INTERESTS/);
  assert.match(c, /P\.saveItem\(\{ id: id, title: item\.title, label: item\.title, type: "life-" \+ type, href: "#ex-item-" \+ item\.id, source: "탐색"/);
  assert.match(read('life-hub.js'), /\/\^ex:\/\.test\(String\(item\.id\)\) \? "탐색"/, 'an Explore item saved through the shared button is labelled 탐색');
  assert.equal((EXPLORE_HTML.match(/data-lv-ex-save=/g) || []).length, 0, 'keyword "관심 저장" buttons are gone');
  assert.match(c, /var legacySave = e\.target\.closest\("\[data-lv-ex-save\]"\);[\s\S]{0,120}openResults\(legacySave\.getAttribute\("data-lv-ex-save"\) \|\| ""\);/, 'an old cached page\'s keyword button opens public results');
});

test('EV2-07 AI boundary: Explore never calls the AI endpoint itself; the AI button only prepares a draft the person sends', () => {
  for (const src of [PAGE, SEARCH]) assert.doesNotMatch(code(src), /\/api\/livon\/chat|LivonAI\.sendMessage|sendBeacon|XMLHttpRequest/);
  assert.doesNotMatch(code(SEARCH), /fetch\(/, 'the search index is built locally');
  assert.match(PAGE, /data-lh-ai=/);
});

test('EV2-08 official sources: https only, external links say so, and the date is LIVON\'s check date', () => {
  assert.match(PAGE, /function safeHttps\(url\) \{ return \/\^https:/);
  assert.match(PAGE, /target=\\"_blank\\" rel=\\"noopener noreferrer\\">공식 사이트<span aria-hidden=\\"true\\"> ↗<\/span><span class=\\"visually-hidden\\">: " \+ esc\(it\.title\) \+ " \(외부 사이트, 새 창\)<\/span>/);
  assert.match(PAGE, /LIVON 확인일/);
  assert.match(PAGE, /LIVON은 이 기관이 아니며/);
  assert.doesNotMatch(code(PAGE), /오늘 업데이트|방금 업데이트|new Date\(\)\.toISOString\(\)\.slice\(0, 10\) \+ " 기준"/);
  const ctx = searchCtx();
  for (const it of ctx.LivonExploreData.items) if (it.officialUrl) assert.match(it.officialUrl, /^(https:\/\/|\/(?!\/))/, it.id + ': https or a page of this site (ONGIL)');
  assert.match(PAGE, /function officialLink\(item, cls, label\)/);
});

test('EV2-09 cache keys: changed Explore/shared assets carry ?v=20261006ex1; Today keeps c7; ONGIL keeps its own entry version', () => {
  for (const f of ['explore-page.js', 'explore-search.js', 'explore-page.css', 'life-hub.js', 'livon-platform.js']) assert.match(INDEX, new RegExp('/livon/' + f.replace(/\./g, '\\.') + '\\?v=20261006ex1"'), f);
  assert.match(INDEX, /\/livon\/today-page\.js\?v=20261004c7"/);
  /* ONGIL is another product with its own release line (h14 at Explore V2's base, m15 after ONGIL My Life V2): Explore V2 never
     sets it — the entry keeps a version of ONGIL's own and its import map stays current */
  assert.match(fs.readFileSync(path.join(ROOT, 'ongil-start/index.html'), 'utf8'), /<script type="module" src="\/ongil-start\/js\/app\.js\?v=\d{8}[a-z]+\d+"><\/script>/);
  assert.equal(spawnSync(process.execPath, [path.join(ROOT, 'scripts/ongil-module-versions.mjs')], { cwd: ROOT, encoding: 'utf8' }).status, 0, 'ONGIL module map current');
  for (const src of [PAGE, SEARCH, CSS]) assert.doesNotMatch(src, /ongil-start\/js\//, 'Explore does not load ONGIL modules');
  assert.equal(fs.existsSync(path.join(ROOT, 'livon/sw.js')) || /serviceWorker\.register/.test(INDEX), false, 'no service worker');
});

test('EV2-10 touch targets (CSS contract): every Explore control class is given a 44px minimum', () => {
  assert.match(CSS, /#explore :is\(\.lv-ex-btn, \.lv-ex-btn--sm, \.lv-ex-chips button, \.lv-ex-pills button,[^)]*\) \{ min-height: 44px; \}/);
  assert.match(CSS, /#explore \.lv-ex-nav a \{ display: inline-flex; align-items: center; min-height: 44px; min-width: 44px;/);
  assert.match(CSS, /#explore \.lv-ex-topic \{[\s\S]*?min-height: 56px;/);
});

/* ═════════ browser ═════════ */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const skip = !(fs.existsSync(PW) && fs.existsSync(CHROME)) && 'no local Chromium';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const baseFile = f => { const r = spawnSync('git', ['show', BASE_COMMIT + ':livon/' + f], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }); return r.status === 0 ? r.stdout : null; };
const OLD = { page: null, index: null };
const skipMix = skip || ((OLD.page = baseFile('explore-page.js')) && (OLD.index = baseFile('index.html')) ? false : 'base commit ' + BASE_COMMIT + ' missing');
let B = null, SERVER = null, BASE = '', OVERRIDE = {};
async function boot() {
  if (B) return;
  const { chromium } = await import(PW);
  SERVER = await new Promise(resolve => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      if (OVERRIDE[p] != null) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(OVERRIDE[p]); return; }
      let f = path.join(ROOT, p);
      if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(fs.readFileSync(f)); return; }
      res.writeHead(404); res.end('not found');
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
  BASE = 'http://127.0.0.1:' + SERVER.address().port;
  B = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
}
test.after(async () => { if (B) await B.close(); if (SERVER) SERVER.close(); });
const SKIPPED = JSON.stringify({ version: 1, state: 'SKIPPED', step: '', draft: null, updatedAt: 1 });
async function open(hash = '#explore', { width = 1280, height = 900, local = {}, record = null, override = {} } = {}) {
  await boot();
  OVERRIDE = override;
  const ctx = await B.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  await ctx.route('**/*', r => { const u = r.request().url(); if (record) record.push({ method: r.request().method(), url: u, body: r.request().postData() || '' }); return u.startsWith(BASE) ? r.continue() : r.abort(); });
  await ctx.addInitScript(([pz, loc]) => { try { if (!sessionStorage.getItem('ev2-seeded')) { sessionStorage.setItem('ev2-seeded', '1'); localStorage.setItem('livon.personalization.v1', pz); for (const [k, v] of Object.entries(loc)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } } catch (e) {} }, [SKIPPED, local]);
  const pg = await ctx.newPage();
  pg._errors = []; pg._console = [];
  pg.on('pageerror', e => pg._errors.push(e.message)); pg.on('console', m => pg._console.push(m.text()));
  await pg.goto(BASE + '/livon/' + hash, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(1200);
  return pg;
}
const go = async (pg, hash, wait = 600) => { await pg.evaluate(h => { location.hash = h; }, hash); await pg.waitForTimeout(wait); };
const close = pg => pg.context().close();
const exploreItem = (over = {}) => ({ id: 'ev2-long', type: 'guide', categoryIds: ['housing'], subfield: '주거 안내', title: '아주 긴 한국어 제목으로 줄바꿈과 잘림을 확인하는 탐색 항목 '.repeat(3).trim(), provider: '테스트 기관', blurb: '긴 설명 '.repeat(60).trim(), body: '본문', img: '', region: '전국', mode: 'online', visit: false, priceType: 'free', priceLabel: '무료', audience: '누구나', credentials: { status: 'verified', note: '테스트' }, officialUrl: 'https://example.org/', source: '테스트 출처', checkedAt: '2026-09-25', tags: ['주거'], layout: 'guide', compare: {}, ...over });
const withItems = extra => ({ '/livon/explore-data.js': read('explore-data.js') + '\n;window.LivonExploreData.items = ' + JSON.stringify(extra) + '.concat(window.LivonExploreData.items);' });
/* layout: no page-level horizontal scroll, nothing pushed past the viewport outside its own scroll area, no control under 44px */
async function layout(pg, sel) {
  return pg.evaluate(s => {
    const vw = document.documentElement.clientWidth, root = document.querySelector(s);
    const scrollParent = e => { for (let p = e.parentElement; p && p !== root; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true; } return false; };
    const vis = e => e.offsetParent && !e.closest('[hidden]') && !e.closest('.visually-hidden');
    const over = [...root.querySelectorAll('*')].filter(e => vis(e) && !scrollParent(e) && (e.getBoundingClientRect().right > vw + 1) && e.getBoundingClientRect().width > 0).map(e => e.tagName + '.' + e.className.toString().slice(0, 30));
    const small = [...root.querySelectorAll('a,button,select,input,summary')].filter(e => vis(e) && getComputedStyle(e).display !== 'inline' && e.getAttribute('tabindex') !== '-1').map(e => { const b = e.getBoundingClientRect(); return [(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 20), Math.round(b.width), Math.round(b.height)]; }).filter(x => x[1] < 44 || x[2] < 44);
    const clipped = [...root.querySelectorAll('button,a')].filter(e => vis(e) && e.scrollWidth > e.clientWidth + 2 && ['hidden', 'clip'].includes(getComputedStyle(e).overflowX)).map(e => e.textContent.trim().slice(0, 20));
    return { pageScroll: document.documentElement.scrollWidth > vw, over: over.slice(0, 5), small: small.slice(0, 8), clipped: clipped.slice(0, 5) };
  }, sel);
}

test('EV2-11 Explore home: search, 주제별 보기 with real counts, 공식 기관 정보, categories; one h1 and logical headings', { skip }, async () => {
  const pg = await open('#explore');
  const r = await pg.evaluate(() => {
    const L = window.LivonSearch, idx = L.index(), want = {};
    idx.forEach(x => (x.cats || []).forEach(c => { want[c] = (want[c] || 0) + 1; }));
    const topics = [...document.querySelectorAll('[data-lv-ex-quick] [data-lv-ex-quick-cat]')].map(b => [b.getAttribute('data-lv-ex-quick-cat'), b.querySelector('.lv-ex-topic__n').textContent]);
    const heads = [...document.querySelectorAll('#ex-home h1, #ex-home h2, #ex-home h3')].map(h => h.tagName + ':' + h.textContent.trim());
    return { topics, want, heads, h1: document.querySelectorAll('#explore h1').length,
      official: [...document.querySelectorAll('[data-lv-ex-official] a[target=_blank]')].map(a => [a.href.slice(0, 8), a.rel, a.textContent]),
      officialDates: [...document.querySelectorAll('.lv-ex-official__main small')].map(x => x.textContent) };
  });
  assert.equal(r.topics.length, 12);
  for (const [id, label] of r.topics) assert.equal(label, r.want[id] ? '정보 ' + r.want[id] + '개' : '준비 중', id);
  assert.equal(r.h1, 1);
  assert.ok(r.heads.includes('H2:무엇을 찾고 있나요?') && r.heads.includes('H3:주제별 보기') && r.heads.includes('H3:공식 기관 정보'), r.heads.join(' | '));
  assert.ok(r.official.length >= 4);
  for (const [scheme, rel, text] of r.official) { assert.equal(scheme, 'https://'); assert.equal(rel, 'noopener noreferrer'); assert.match(text, /외부 사이트, 새 창/); }
  for (const d of r.officialDates) assert.match(d, /^LIVON 확인일 \d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('EV2-12 topic → results: URL state, accessible count, removable conditions, 모두 지우기 → idle prompt (not a failure)', { skip }, async () => {
  const pg = await open('#explore');
  await pg.locator('[data-lv-ex-quick-cat="housing"]').click(); await pg.waitForTimeout(700);
  let r = await pg.evaluate(() => ({ hash: location.hash, count: document.querySelector('[data-lv-ex-count]').textContent, role: document.querySelector('[data-lv-ex-count]').getAttribute('role'), chips: [...document.querySelectorAll('.lv-ex-applied__chip')].map(b => b.textContent) }));
  assert.equal(r.hash, '#ex-results?cat=housing'); assert.match(r.count, /^\d+개 결과 · 주거$/); assert.equal(r.role, 'status'); assert.deepEqual(r.chips, ['분야 · 주거 ×']);
  await pg.locator('[data-lv-ex-filter-region="서울"]').first().evaluate(b => b.click()); await pg.waitForTimeout(500);
  r = await pg.evaluate(() => ({ hash: decodeURIComponent(location.hash), chips: [...document.querySelectorAll('.lv-ex-applied__chip')].map(b => b.textContent), all: !!document.querySelector('[data-lv-ex-unset="all"]') }));
  assert.equal(r.hash, '#ex-results?cat=housing&region=서울'); assert.deepEqual(r.chips, ['분야 · 주거 ×', '지역 · 서울 ×']); assert.ok(r.all);
  await pg.locator('[data-lv-ex-unset="region"]').click(); await pg.waitForTimeout(400);
  assert.equal(await pg.evaluate(() => location.hash), '#ex-results?cat=housing');
  await pg.locator('[data-lv-ex-unset="cat"]').focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(400);
  r = await pg.evaluate(() => ({ hash: location.hash, idle: document.querySelector('.lv-ex-idle h3')?.textContent, alert: !!document.querySelector('#ex-results [role=alert]'), focus: document.activeElement.hasAttribute('data-lv-ex-q') }));
  assert.equal(r.hash, '#ex-results'); assert.equal(r.idle, '검색어를 입력하거나 주제를 골라 보세요.'); assert.equal(r.alert, false); assert.ok(r.focus, 'focus moves to the results heading, not to <body>');
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('EV2-13 filters by keyboard: Space/Enter toggles, aria-pressed follows, focus stays on the pressed filter after re-render', { skip }, async () => {
  const pg = await open('#ex-results?q=%EC%B7%A8%EC%97%85');
  await pg.evaluate(() => { const s = document.querySelector('[data-lv-ex-side]'); if (s) s.classList.remove('is-collapsed'); });
  const age = pg.locator('[data-lv-ex-filter-age="20"]');
  await age.focus(); await pg.keyboard.press('Space'); await pg.waitForTimeout(500);
  let r = await pg.evaluate(() => ({ pressed: document.querySelector('[data-lv-ex-filter-age="20"]').getAttribute('aria-pressed'), focus: document.activeElement.getAttribute('data-lv-ex-filter-age'), hash: location.hash }));
  assert.deepEqual(r, { pressed: 'true', focus: '20', hash: '#ex-results?q=%EC%B7%A8%EC%97%85&age=20' });
  await pg.keyboard.press('Enter'); await pg.waitForTimeout(400);   /* pressing the active one again keeps it (chip groups pick one; "전체" clears) */
  await pg.locator('[data-lv-ex-filter-age=""]').focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(400);
  r = await pg.evaluate(() => ({ hash: location.hash, focus: document.activeElement.getAttribute('data-lv-ex-filter-age') }));
  assert.equal(r.hash, '#ex-results?q=%EC%B7%A8%EC%97%85'); assert.equal(r.focus, '');
  const vis = await pg.evaluate(() => { const b = document.querySelector('[data-lv-ex-filter-age=""]'); b.focus(); const cs = getComputedStyle(b); return cs.outlineStyle + ' ' + cs.outlineWidth; });
  assert.match(vis, /solid 2px/);
  await close(pg);
});

test('EV2-14 public search: Enter submits, count is announced, clear empties the box, no result offers a way out; back/forward restore queries', { skip }, async () => {
  const pg = await open('#explore');
  await pg.locator('[data-lv-ex-input]').fill('이사'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
  assert.equal(await pg.evaluate(() => location.hash), '#ex-results?q=%EC%9D%B4%EC%82%AC');
  assert.match(await pg.locator('[data-lv-ex-count]').textContent(), /^\d+개 결과/);
  await pg.locator('[data-lv-ex-input]').fill('없는검색어zzqq'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
  const nr = await pg.evaluate(() => ({ h: document.querySelector('.lv-ex-noresult h3')?.textContent, count: document.querySelector('[data-lv-ex-count]').textContent, ways: document.querySelectorAll('.lv-ex-noresult [data-lv-ex-quick-cat], .lv-ex-noresult [data-lv-ex-chip]').length }));
  assert.equal(nr.h, '‘없는검색어zzqq’ 검색 결과가 없습니다.'); assert.match(nr.count, /^0개 결과/); assert.ok(nr.ways > 3);
  await pg.goBack(); await pg.waitForTimeout(700);
  assert.equal(await pg.locator('[data-lv-ex-input]').inputValue(), '이사', 'back restores the previous query');
  assert.match(await pg.locator('[data-lv-ex-count]').textContent(), /^[1-9]\d*개 결과/);
  await pg.goForward(); await pg.waitForTimeout(700);
  assert.equal(await pg.locator('[data-lv-ex-input]').inputValue(), '없는검색어zzqq');
  await pg.locator('[data-lv-ex-clear]').click(); await pg.waitForTimeout(200);
  assert.equal(await pg.locator('[data-lv-ex-input]').inputValue(), '');
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('EV2-15 result card → detail → back: canonical #ex-item route, heading focused, source + LIVON check date, safe external link', { skip }, async () => {
  const pg = await open('#ex-results?q=%EA%B3%A0%EC%9A%A924');
  const open1 = pg.locator('#ex-results [data-lv-ex-open="ex-career24"]').first();
  await open1.click(); await pg.waitForTimeout(700);
  const r = await pg.evaluate(() => ({ hash: location.hash, focus: document.activeElement.id, title: document.title, side: document.querySelector('.lv-ex-detail__side').innerText,
    ext: [...document.querySelectorAll('.lv-ex-detail a[target=_blank]')].map(a => [a.protocol, a.rel, a.textContent]) }));
  assert.equal(r.hash, '#ex-item-ex-career24'); assert.equal(r.focus, 'lv-ex-detail-title'); assert.match(r.title, /^고용24 취업 지원 · 탐색 · LIVON$/);
  assert.match(r.side, /LIVON 확인일\s*2026-09-25/); assert.match(r.side, /LIVON은 출처 기관이 아니며/);
  for (const [proto, rel, text] of r.ext) { assert.equal(proto, 'https:'); assert.equal(rel, 'noopener noreferrer'); }
  assert.ok(r.ext.some(x => /공식 페이지 열기/.test(x[2]) && /외부 사이트, 새 창/.test(x[2])));
  await pg.goBack(); await pg.waitForTimeout(700);
  assert.equal(await pg.evaluate(() => location.hash), '#ex-results?q=%EA%B3%A0%EC%9A%A924');
  /* deep link straight to the item */
  await go(pg, '#ex-item-ex-qnet', 700);
  assert.equal(await pg.evaluate(() => document.getElementById('lv-ex-detail-title').textContent), '큐넷 국가기술자격 안내');
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('EV2-16 save / unsave: one shared store, labelled 탐색, shown in My Life › 저장, survives reload; no other storage written', { skip }, async () => {
  const pg = await open('#ex-item-ex-career24');
  const before = await pg.evaluate(() => Object.keys(localStorage).sort());
  const btn = pg.locator('.lv-ex-detail__side [data-lh-save]');
  await btn.click(); await pg.waitForTimeout(300);
  if (await pg.locator('[data-lh-save-local]').count()) { await pg.locator('[data-lh-save-local]').click(); await pg.waitForTimeout(300); }
  let r = await pg.evaluate(() => ({ saves: LivonPlatform.listSaves('all').map(x => [x.id, x.source, x.href]), pressed: document.querySelector('.lv-ex-detail__side [data-lh-save]').getAttribute('aria-pressed'), keys: Object.keys(localStorage).sort(),
    ml: localStorage.getItem('livon.mlStore.v1'), ex: localStorage.getItem('livon.exSaved'), interests: localStorage.getItem('livon.mlInterests') }));
  assert.deepEqual(r.saves, [['life-hub:content:ex:ex-career24', '탐색', '#ex-item-ex-career24']]);
  assert.equal(r.pressed, 'true'); assert.equal(r.ml, null, 'no My Life store is created'); assert.equal(r.ex, null); assert.equal(r.interests, null);
  assert.deepEqual(r.keys.filter(k => !before.includes(k)).filter(k => !/^livon\.(platform\.v1|userData\.meta\.v1|exViewed|exScroll|cmStore\.v1)$/.test(k)), [], 'only the shared saved store (and existing view history; the Community module creates its own store on boot) changes');
  await pg.reload(); await pg.waitForTimeout(1200);
  assert.equal(await pg.evaluate(() => document.querySelector('.lv-ex-detail__side [data-lh-save]').getAttribute('aria-pressed')), 'true', 'saved state after reload');
  await go(pg, '#ml-saved', 900);
  assert.match(await pg.evaluate(() => document.getElementById('ml-panel').innerText), /고용24 취업 지원/);
  await go(pg, '#explore', 700);
  assert.match(await pg.evaluate(() => document.querySelector('[data-lv-ex-activity]').innerText), /저장한 탐색 정보[\s\S]*고용24 취업 지원/);
  assert.equal(await pg.evaluate(() => document.querySelector('[data-lv-ex-activity] a[href="#ml-saved"]').textContent), '내 생활 › 저장 (1)');
  await go(pg, '#ex-item-ex-career24', 700);
  await pg.locator('.lv-ex-detail__side [data-lh-save]').click(); await pg.waitForTimeout(300);
  r = await pg.evaluate(() => ({ saves: LivonPlatform.listSaves('all').length, pressed: document.querySelector('.lv-ex-detail__side [data-lh-save]').getAttribute('aria-pressed') }));
  assert.deepEqual(r, { saves: 0, pressed: 'false' });
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('EV2-17 Life Stage connection: links to the existing screen; a stored stage is used for ordering only, never announced as "you are"', { skip }, async () => {
  const pg = await open('#explore', { local: { 'livon.lifeStage': '20' } });
  const r = await pg.evaluate(() => ({ text: document.getElementById('explore').innerText, life: [...document.querySelectorAll('#explore a[href="#life"]')].length, stages: document.querySelectorAll('#ex-stages .lv-ex-stage').length }));
  assert.ok(r.life >= 1); assert.equal(r.stages, 7);
  assert.doesNotMatch(r.text, /당신은|현재 .{0,6}단계입니다|님은 .{0,6}대/);
  await close(pg);
  const blank = await open('#explore');
  assert.equal(await blank.evaluate(() => localStorage.getItem('livon.lifeStage')), null, 'Explore never writes a stage');
  await close(blank);
});

test('EV2-18 private boundary (browser): My Life, Today and Community drafts stay out of results, URL, requests and console', { skip }, async () => {
  const record = [];
  const ml = { v: 2, todos: [{ id: 't1', title: SECRET + '할일', due: '2026-10-06', createdAt: 1 }], events: [{ id: 'e1', title: SECRET + '일정', date: '2026-10-06' }], goals: [], habits: [{ id: 'h1', title: SECRET + '루틴', freq: 'daily', createdAt: 1 }], habitLogs: {}, journal: [{ id: 'j1', title: SECRET + '일기', body: SECRET, date: '2026-10-06' }], transactions: [], budgets: { monthly: 0, categories: {} }, health: [], experiences: [], checklists: [], projects: [], folders: [], settings: {} };
  const cm = { posts: [{ id: 'd1', title: SECRET + '초안', body: SECRET, draft: true, createdAt: 1 }, { id: 'd2', title: SECRET + '비공개', body: SECRET, visibility: 'private', createdAt: 1 }] };
  const pg = await open('#explore', { local: { [ML]: ml, [CM]: cm }, record });
  const mlBefore = await pg.evaluate(k => localStorage.getItem(k), ML);
  await pg.locator('[data-lv-ex-input]').fill(SECRET); await pg.keyboard.press('Enter'); await pg.waitForTimeout(800);
  const r = await pg.evaluate(s => ({ count: document.querySelector('[data-lv-ex-count]').textContent, list: document.querySelector('[data-lv-ex-list]').innerText, home: document.querySelector('#ex-home').innerText }), SECRET);
  assert.match(r.count, /^0개 결과/);
  for (const w of ['할일', '일정', '루틴', '일기', '초안', '비공개']) assert.equal(r.list.includes(SECRET + w), false, w + ': only the typed query itself is echoed (heading, condition chip)');
  for (const w of ['할일', '일정', '루틴', '일기', '초안', '비공개']) assert.equal(r.home.includes(SECRET + w), false, 'home: ' + w);
  for (const q of ['할일', '루틴', '일기']) { await go(pg, '#ex-results?q=' + encodeURIComponent(SECRET + q), 500); assert.match(await pg.locator('[data-lv-ex-count]').textContent(), /^0개 결과/, q); }
  await go(pg, '#ex-results?cat=housing', 500);
  assert.equal((await pg.evaluate(() => document.querySelector('[data-lv-ex-list]').innerText)).includes(SECRET), false, 'a browsed topic shows no private record');
  assert.equal(await pg.evaluate(k => localStorage.getItem(k), ML), mlBefore, 'My Life store untouched');
  const sent = record.filter(x => x.method !== 'GET' || /api\/livon\/(chat|userdata)/.test(x.url) || decodeURIComponent(x.url).includes(SECRET + '할일') || x.body.includes(SECRET));
  assert.deepEqual(sent, [], 'no request carries a private record and nothing is sent to AI or account sync');
  assert.equal(pg._console.some(m => m.includes(SECRET)), false, 'nothing is logged');
  await close(pg);
});

test('EV2-19 long Korean title / long description / missing optional fields render without overflow; malformed rows are skipped', { skip }, async () => {
  const pg = await open('#ex-results?q=' + encodeURIComponent('아주 긴 한국어 제목'), { width: 320, override: withItems([exploreItem(), exploreItem({ id: 'ev2-min', title: '선택 항목이 없는 EV2 항목', blurb: undefined, img: undefined, provider: undefined, priceLabel: undefined, region: undefined, checkedAt: undefined, credentials: undefined, officialUrl: 'javascript:alert(1)', tags: undefined }), null, { id: 'ev2-no-title' }, { title: 'id 없음 EV2' }]) });
  assert.deepEqual(pg._errors, []);
  const t = await pg.evaluate(() => document.querySelector('[data-lv-ex-list]').innerText);
  assert.match(t, /아주 긴 한국어 제목/); assert.equal(t.includes('id 없음 EV2'), false);
  const l = await layout(pg, '#ex-results');
  assert.deepEqual(l, { pageScroll: false, over: [], small: [], clipped: [] });
  await go(pg, '#ex-item-ev2-min', 700);
  const d = await pg.evaluate(() => ({ side: document.querySelector('.lv-ex-detail__side').innerText, js: [...document.querySelectorAll('#ex-detail a')].some(a => /^javascript:/i.test(a.getAttribute('href') || '')) }));
  assert.match(d.side, /LIVON 확인일\s*정보 없음/); assert.equal(d.js, false, 'an unsafe official URL never becomes a link');
  assert.deepEqual(await layout(pg, '#ex-detail'), { pageScroll: false, over: [], small: [], clipped: [] });
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

for (const w of [320, 390, 768, 1024, 1440]) {
  test('EV2-2' + [320, 390, 768, 1024, 1440].indexOf(w) + ' responsive ' + w + 'px: home, results with filters open, detail — no overflow, no clipped control, 44px targets', { skip }, async () => {
    const pg = await open('#explore', { width: w, override: withItems([exploreItem()]) });
    assert.deepEqual(await layout(pg, '#ex-home'), { pageScroll: false, over: [], small: [], clipped: [] }, 'home');
    await go(pg, '#ex-results?q=%EC%A3%BC%EA%B1%B0&cat=housing&region=%EC%84%9C%EC%9A%B8', 800);
    await pg.evaluate(() => { const t = document.querySelector('[data-lv-ex-toggle-filters]'); if (t && t.getAttribute('aria-expanded') === 'false') t.click(); });
    await pg.waitForTimeout(300);
    assert.deepEqual(await layout(pg, '#ex-results'), { pageScroll: false, over: [], small: [], clipped: [] }, 'results + filters');
    await go(pg, '#ex-item-ev2-long', 700);
    assert.deepEqual(await layout(pg, '#ex-detail'), { pageScroll: false, over: [], small: [], clipped: [] }, 'detail');
    assert.deepEqual(pg._errors, []);
    await close(pg);
  });
}

test('EV2-25 200% text: home and results stay inside the viewport at 390px and 1280px', { skip }, async () => {
  for (const w of [390, 1280]) {
    const pg = await open('#explore', { width: w });
    await pg.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await pg.waitForTimeout(300);
    const h = await layout(pg, '#ex-home');
    assert.equal(h.pageScroll, false, w + ' home'); assert.deepEqual(h.over, [], w + ' home'); assert.deepEqual(h.clipped, []);
    await go(pg, '#ex-results?q=%EC%B7%A8%EC%97%85&age=20', 800);
    const r = await layout(pg, '#ex-results');
    assert.equal(r.pageScroll, false, w + ' results'); assert.deepEqual(r.over, [], w + ' results'); assert.deepEqual(r.clipped, []);
    await close(pg);
  }
});

test('EV2-26 keyboard: topic cards, official links and result cards are reachable by Tab; card images are not extra tab stops', { skip }, async () => {
  const pg = await open('#explore');
  const r = await pg.evaluate(() => ({
    topic: document.querySelector('.lv-ex-topic').tabIndex, off: document.querySelector('.lv-ex-official__main').tabIndex,
    media: [...document.querySelectorAll('.lv-ex-card .lv-ex-card__media')].every(m => m.tabIndex === -1),
    nested: document.querySelectorAll('#explore a a, #explore a button, #explore button button, #explore button a').length }));
  assert.deepEqual(r, { topic: 0, off: 0, media: true, nested: 0 });
  await pg.locator('.lv-ex-topic').first().focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
  assert.match(await pg.evaluate(() => location.hash), /^#ex-results\?cat=/);
  await close(pg);
});

test('EV2-27 cache window A: new page + old cached Explore script — page works, no crash, no data corruption', { skip: skipMix }, async () => {
  const pg = await open('#explore', { override: { '/livon/explore-page.js': OLD.page } });
  assert.deepEqual(pg._errors, []);
  await pg.locator('[data-lv-ex-input]').fill('이사'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
  assert.match(await pg.locator('[data-lv-ex-count]').textContent(), /^\d+개 결과/);
  assert.equal(await pg.evaluate(() => document.querySelectorAll('[data-lv-ex-quick] button').length) > 0, true, 'the old script still fills the topic host');
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('EV2-28 cache window B: old cached page + new scripts — no crash; old keyword "관심 저장" opens results and writes nothing', { skip: skipMix }, async () => {
  const pg = await open('#explore', { override: { '/livon/index.html': OLD.index, '/livon/': OLD.index } });
  assert.deepEqual(pg._errors, []);
  const r = await pg.evaluate(() => ({ topics: document.querySelectorAll('[data-lv-ex-quick] .lv-ex-topic').length, official: !!document.querySelector('[data-lv-ex-official]') }));
  assert.equal(r.topics, 15, 'the new script fills the old page\'s quick host with topic counts'); assert.equal(r.official, false);
  await go(pg, '#ex-experts', 500);
  const before = await pg.evaluate(() => JSON.stringify(Object.keys(localStorage).sort()));
  await pg.locator('[data-lv-ex-save="전문가 찾기"]').click(); await pg.waitForTimeout(700);
  const after = await pg.evaluate(() => ({ hash: decodeURIComponent(location.hash), keys: JSON.stringify(Object.keys(localStorage).sort()), ml: localStorage.getItem('livon.mlStore.v1'), saves: LivonPlatform.listSaves('all').length }));
  assert.equal(after.hash, '#ex-results?q=전문가 찾기'); assert.equal(after.ml, null); assert.equal(after.saves, 0);
  assert.deepEqual(JSON.parse(after.keys).filter(k => !JSON.parse(before).includes(k) && !/^livon\.(exRecent|exScroll|cmStore\.v1)$/.test(k)), [], 'search history only (the Community store is its own, read for public posts)');
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('EV2-29 regressions around Explore: Today 내 오늘, My Life saved view, Community and LIVON AI still render', { skip }, async () => {
  const pg = await open('#today');
  assert.equal(await pg.evaluate(() => document.querySelector('#today .lv-td-body > section').id), 'td-mytoday');
  for (const [h, sel] of [['#ml-saved', '#ml-panel'], ['#community', '#community'], ['#livon-ai', '#livon-ai'], ['#life', '#life']]) {
    await go(pg, h, 800);
    assert.ok((await pg.evaluate(s => document.querySelector(s).innerText.length, sel)) > 100, h);
  }
  assert.deepEqual(pg._errors, []);
  await close(pg);
});
