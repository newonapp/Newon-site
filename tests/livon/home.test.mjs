// LIVON Home V1: the home is a hub over existing data (Life Stage, Today, My Life, Explore, Community, AI).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const INDEX = read('index.html');
const LIFE = JSON.parse(read('life-topics.json'));
const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

function livonView() {
  const src = INDEX.match(/function livonView\(hash\) \{[\s\S]*?\n        \}/)[0];
  return vm.runInNewContext('(' + src + ')');
}

/* Minimal DOM: every selector resolves to one stub element whose innerHTML we can inspect. */
function home({ local = {}, posts = null } = {}) {
  const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };
  const els = new Map();
  const el = sel => {
    if (!els.has(sel)) els.set(sel, { sel, innerHTML: '', textContent: '', hidden: sel === '[data-lv-hm-continue]', style: {}, href: '', value: '', classList: { add() {}, remove() {}, toggle() {} }, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], getBoundingClientRect: () => ({ top: 0, bottom: 0 }), setAttribute() {}, getAttribute: () => null });
    return els.get(sel);
  };
  const listeners = {};
  const doc = {
    readyState: 'complete', documentElement: { dataset: { lvView: 'home' } },
    querySelector: sel => (/^\[data-lv-hm|^#livon-home/.test(sel) ? el(sel) : null),
    querySelectorAll: () => [], getElementById: id => (id === 'livon-home' ? el('#livon-home') : null),
    addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); }, contains: () => true
  };
  const ctx = {
    document: doc, localStorage: mem(), sessionStorage: mem(), location: { hash: '#livon-home' }, navigator: {}, URL, console,
    setTimeout: () => 0, clearTimeout() {}, scrollTo() {}, innerHeight: 800, matchMedia: () => ({ matches: true }), getComputedStyle: () => ({ getPropertyValue: () => '74px' }),
    fetch: () => Promise.reject(new Error('offline')), history: { replaceState() {}, pushState() {} }, addEventListener() {}
  };
  ctx.window = ctx;
  for (const [k, v] of Object.entries(local)) ctx.localStorage.setItem(k, JSON.stringify(v));
  vm.createContext(ctx);
  // shared data + stores exactly as the page loads them (home-page.js runs last)
  for (const f of ['life-data.js', 'life-events-data.js', 'explore-data.js', 'today-data.js', 'community-data.js']) vm.runInContext(read(f), ctx);
  const saves = new Map();
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, Object.assign({ savedAt: Date.now() }, x)), openOnboarding() { ctx._onboard = (ctx._onboard || 0) + 1; } };
  for (const f of ['life-hub.js', 'today-feed.js', 'explore-search.js', 'life-now-data.js', 'life-now-page.js']) vm.runInContext(read(f), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  if (posts) ctx.LivonCommunityRepo = { visiblePosts: () => posts };
  return { ctx, els, saves, listeners, boot: () => { vm.runInContext(read('home-page.js'), ctx); return ctx; }, html: sel => el(sel).innerHTML };
}
const hrefs = html => [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);

test('empty home: honest empty states, no personalization, continue hidden, no fake numbers', () => {
  const h = home();
  h.boot();
  assert.equal(h.els.get('[data-lv-hm-continue]').hidden, true, '이어서 하기 hidden without data');
  const stage = h.html('[data-lv-hm-mystage]');
  assert.match(stage, /아직 라이프 스테이지를 설정하지 않았어요/);
  assert.match(stage, /data-lv-hm-onboard>내 라이프 스테이지 설정하기/);
  assert.doesNotMatch(stage, /추천 주제/);
  const dash = h.html('[data-lv-hm-dash]');
  assert.match(dash, /아직 등록된 일정·할 일이 없어요/);
  assert.match(h.html('[data-lv-hm-cm-list]'), /아직 공개 게시글이 없어요[\s\S]*href="#cm-write"/);
  const all = [...h.els.values()].map(e => e.innerHTML).join('');
  assert.doesNotMatch(all, /조회수|인기 \d|평점|★|명이 (?:참여|저장)|\d+명/, 'no invented popularity or ratings');
});

test('personalized home: stage topics, checklist progress, related services, continue items from real data', () => {
  const h = home({ local: { 'livon.lifeStage': '20', 'livon.lifeInterests': ['주거'], 'livon.lifeHub.checklist.v1': { '20s.first-job': { c1: true, c2: true } } } });
  const T = h.ctx.LivonMyLife._test;
  T.saveTodo({ title: '이력서 마무리', due: day(-2), priority: '높음' });
  T.saveTodo({ title: '전입신고', due: day(0) });
  T.saveEvent({ title: '집 보러 가기', date: day(1), start: '14:00' });
  T.saveGoal({ title: '독립 준비' });
  h.ctx.LivonPlatform.saveItem({ type: 'content', id: 'td:place-namsan', title: '남산 산책로', href: '#today/place-namsan' });
  h.boot();
  const stage = h.html('[data-lv-hm-mystage]');
  assert.match(stage, /20대 · 독립과 도전/);
  assert.match(stage, /href="#life\/20s">내 단계 전체 보기/);
  const topicLinks = hrefs(stage).filter(x => /^#life\/20s\/[\w-]+$/.test(x));
  assert.ok(topicLinks.length >= 2, 'recommended topics link to Life Stage topic detail');
  assert.match(stage.split('진행 중인 체크리스트')[0], /첫 독립 준비/, 'interest (주거) orders the housing topic first');
  assert.match(stage, /첫 취업 준비<\/strong><small>2 \/ 7 진행/);
  assert.match(stage, /href="#life\/services\/[\w-]+"/);
  // 이어서 하기
  assert.equal(h.els.get('[data-lv-hm-continue]').hidden, false);
  const cont = h.html('[data-lv-hm-continue-list]');
  assert.match(cont, /href="#ml-todos"><em>할 일<\/em><strong>이력서 마무리<\/strong><small>기한 지남/, 'overdue task first');
  assert.match(cont, /href="#ml-goals"><em>목표<\/em><strong>독립 준비/);
  assert.match(cont, /href="#today\/place-namsan"><em>저장한 콘텐츠/);
  // My Life preview: upcoming event (tomorrow), overdue included, links into My Life
  const dash = h.html('[data-lv-hm-dash]');
  assert.match(dash, /내일 14:00[\s\S]*집 보러 가기/);
  assert.match(dash, /href="#ml-todos"[\s\S]*<strong>2<\/strong>/);
  assert.match(dash, /이력서 마무리 · 기한 지남/);
  assert.match(dash, /href="#ml-saved">저장함/);
  assert.match(dash, /<a href="#today\/place-namsan">남산 산책로<\/a>/);
});

test('Today preview uses real Today content, follows interests deterministically and links to detail', () => {
  const plain = home(); plain.boot();
  const a = plain.html('[data-lv-hm-today]');
  const ids = hrefs(a);
  assert.ok(ids.length >= 3 && ids.length <= 5, 'a few previews, not the whole feed');
  const data = plain.ctx.LivonTodayData.contents.map(c => '#today/' + c.id);
  ids.forEach(x => assert.ok(data.includes(x), x + ' is a real Today item'));
  const tagged = home({ local: { 'livon.lifeInterests': ['베이킹'] } }); tagged.boot();
  const first = hrefs(tagged.html('[data-lv-hm-today]'));
  const hit = tagged.ctx.LivonTodayData.contents.filter(c => (c.tags || []).concat(c.title, c.category).join(' ').includes('베이킹')).map(c => '#today/' + c.id);
  if (hit.length) assert.ok(first.some(x => hit.includes(x)), 'interest match surfaces in the preview');
  const again = home({ local: { 'livon.lifeInterests': ['베이킹'] } }); again.boot();
  assert.deepEqual(hrefs(again.html('[data-lv-hm-today]')), first, 'deterministic');
  hrefs(plain.html('[data-lv-hm-today-cats]')).forEach(x => assert.match(x, /^#td-(pick|week|places|hobby|learn|together|season)$/));
});

test('Community preview shows only real public posts, newest first', () => {
  const posts = [
    { id: 'p1', title: '이사 체크리스트 공유', body: '짐 정리 순서', type: 'tip', createdAt: 1, visibility: 'public' },
    { id: 'p2', title: '첫 월세 계약 질문', body: '보증금', type: 'question', createdAt: 5, visibility: 'public' },
    { id: 'p3', title: '비공개 메모', type: 'story', createdAt: 9, visibility: 'private' },
    { id: 'p4', title: '회원 공개', type: 'story', createdAt: 8, visibility: 'members' },
    { id: 'p5', title: '임시 저장', type: 'story', createdAt: 7, draft: true }
  ];
  const h = home({ posts }); h.boot();
  const html = h.html('[data-lv-hm-cm-list]');
  assert.deepEqual(hrefs(html), ['#cm-post-p2', '#cm-post-p1']);
  assert.doesNotMatch(html, /비공개|회원 공개|임시 저장/);
  assert.match(html, /<em>질문<\/em>/);
});

test('every home link and CTA routes to a real LIVON view (no dead links)', () => {
  const view = livonView();
  const h = home({ local: { 'livon.lifeStage': '30' } }); h.boot();
  const section = INDEX.slice(INDEX.indexOf('<section id="livon-home"'), INDEX.indexOf('<section class="lv-lum" id="life"'));
  const all = hrefs(section).concat(...[...h.els.values()].map(e => hrefs(e.innerHTML)));
  const inPage = new Set([...section.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  assert.ok(all.length > 30);
  for (const x of all) {
    assert.ok(x.startsWith('#'), 'internal link: ' + x);
    const hsh = x.slice(1);
    assert.ok(hsh.length, 'no href="#"');
    if (view(hsh) === 'home') assert.ok(hsh === 'livon-home' || inPage.has(hsh) || /^hm-/.test(hsh), 'routable: ' + x);
  }
  // the final CTA reaches all six areas
  const start = section.slice(section.indexOf('id="hm-start"'));
  for (const target of ['#life', '#today', '#life-now', '#explore', '#community', '#livon-ai']) assert.ok(start.includes('href="' + target + '"'), target);
  // explore categories open filtered Explore results
  hrefs(h.html('[data-lv-hm-ex-cats]')).forEach(x => assert.match(x, /^#ex-results\?ex=[\w-]+$/));
});

test('home flow order: continue → Life Stage → Today → My Life → Explore/Community → AI → all services', () => {
  const order = [...INDEX.matchAll(/<section class="lv-hm-sec[^"]*" id="(hm-[a-z]+)"/g)].map(m => m[1]);
  assert.deepEqual(order, ['hm-continue', 'hm-meaning', 'hm-journey', 'hm-events', 'hm-today', 'hm-mylivon', 'hm-connect', 'hm-ai', 'hm-services', 'hm-start']);
  const kickers = [...INDEX.matchAll(/<p class="lv-hm-kicker">(\d\d) \//g)].map(m => m[1]);
  assert.deepEqual(kickers, ['01', '02', '03', '04', '05', '06', '07', '08', '09']);
  // Hero is untouched and still first
  assert.ok(INDEX.indexOf('class="livon-hero"') < INDEX.indexOf('id="hm-continue"'));
});

test('Explore search and AI question hand off without duplicating those systems', () => {
  const h = home(); h.boot();
  const click = (attrs) => {
    const target = { closest: sel => { const m = sel.match(/^\[([\w-]+)\]$/); return m && m[1] in attrs ? { getAttribute: k => attrs[k], textContent: '' } : null; } };
    (h.listeners.click || []).forEach(f => f({ target, preventDefault() {} }));
  };
  click({ 'data-lv-hm-aiq': '이번 주 해야 할 일을 정리해 줘.' });
  assert.equal(h.ctx.location.hash, 'ai-chat');
  const handed = JSON.parse(h.ctx.sessionStorage.getItem('livon.aiPrompt'));
  assert.equal(handed.q, '이번 주 해야 할 일을 정리해 줘.');
  assert.equal(handed.draftOnly, true, 'draft only — LIVON AI never auto-sends');
  const src = read('home-page.js');
  assert.doesNotMatch(src, /startChat|sendMessage|\/api\/livon/, 'home never calls the AI API');
  assert.match(src, /location\.hash = q \? "ex-results\?q=" \+ encodeURIComponent\(q\) : "explore";/);
  click({ 'data-lv-hm-onboard': '' });
  assert.equal(h.ctx._onboard, 1, 'stage setup opens the shared onboarding dialog');
});

test('home renders once on load and reads each store a bounded number of times', () => {
  const h = home({ local: { 'livon.lifeStage': '20' } });
  let reads = 0;
  const orig = h.ctx.localStorage.getItem;
  h.ctx.localStorage.getItem = k => { reads++; return orig(k); };
  h.boot();
  assert.ok(reads < 80, 'localStorage reads on first render: ' + reads);
  assert.match(read('home-page.js'), /if \(document\.documentElement\.dataset\.lvView === "home"\) onShow\(hash \|\| "livon-home"\);\s*else renderAll\(\);/);
});

test('home accessibility: new regions are labelled, links are real anchors, focus styles exist', () => {
  assert.match(INDEX, /id="hm-continue" data-lv-hm-continue aria-labelledby="hm-continue-title" hidden/);
  assert.match(INDEX, /<h2 id="hm-continue-title">이어서 하기<\/h2>/);
  const css = read('home-page.css');
  assert.match(css, /\.lv-hm-continue__card, \.lv-hm-mystage__list a, \.lv-hm-mystage \.lv-hm-btn\):focus-visible \{ outline: 2px solid #fff/);
  assert.match(css, /\.lv-hm-continue__card,\n#livon-home \.lv-hm-mystage__list a \{\n  display: grid; gap: 0\.3rem; min-height: 44px;/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{\n  #livon-home \.lv-hm-continue__card/);
});
