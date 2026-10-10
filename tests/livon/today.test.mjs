import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';
import { buildTodayRoutes, loadTodayContents } from '../../scripts/render-livon-today-routes.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));

function app({ stage, saves: preset = [] } = {}) {
  const store = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };
  const saves = new Map(preset.map(x => [x.id, x]));
  const ctx = {
    window: {}, localStorage: store(), sessionStorage: store(), location: { hash: '#today' }, navigator: {}, URL,
    document: { readyState: 'complete', getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null } },
    fetch: () => Promise.reject(new Error('no network in tests')), setTimeout, console, addEventListener() {},
  };
  ctx.window = ctx;
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, x), removeSave: id => saves.delete(id) };
  if (stage) ctx.localStorage.setItem('livon.lifeStage', JSON.stringify(stage));
  vm.createContext(ctx);
  for (const f of ['explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js', 'today-feed.js']) vm.runInContext(read(f), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  return { ctx, hub: ctx.LivonLifeHub, feed: ctx.LivonTodayFeed, saves, TD: ctx.LivonTodayData, EX: ctx.LivonExploreData };
}

test('today contents: unique ids, valid references into Life Stage / services / policies / explore', () => {
  const { TD, EX } = app();
  const ids = TD.contents.map(c => c.id);
  assert.equal(new Set(ids).size, ids.length);
  const topics = new Set(LIFE.topics.map(t => t.id)), svcs = new Set(LIFE.serviceTypes.map(s => s.id)), pols = new Set(LIFE.policies.map(p => p.id)), ex = new Set(EX.items.map(i => i.id));
  for (const c of TD.contents) {
    assert.match(c.id, /^[a-z0-9-]+$/, c.id);
    for (const k of ['title', 'blurb', 'body', 'category', 'type']) assert.ok(String(c[k] || '').trim(), `${c.id}.${k}`);
    assert.ok(existsSync(new URL('../..' + c.img, import.meta.url)), `${c.id} image ${c.img}`);
    for (const id of c.lifeTopicIds || []) assert.ok(topics.has(id), `${c.id} → topic ${id}`);
    for (const id of c.serviceIds || []) assert.ok(svcs.has(id), `${c.id} → service ${id}`);
    for (const id of c.policyIds || []) assert.ok(pols.has(id), `${c.id} → policy ${id}`);
    for (const id of c.exploreIds || []) assert.ok(ex.has(id), `${c.id} → explore ${id}`);
    if (c.checklist) { assert.ok(c.checklist.length >= 3); assert.equal(new Set(c.checklist.map(x => x.id)).size, c.checklist.length, c.id); }
    for (const g of c.guide || []) assert.ok(g.title && g.body, c.id);
  }
  // Life Stage stays the source of truth: no topic bodies copied into Today data
  const text = JSON.stringify(TD.contents);
  for (const t of LIFE.topics.slice(0, 40)) assert.equal(text.includes(JSON.stringify(t.guide)), false, t.id);
  for (const banned of ['평점', '별점', '리뷰 수', '조회수', '좋아요', '예약 가능 시간', '★']) assert.equal(text.includes(banned), false, banned);
  // Seeds are minimal
  assert.ok(TD.contents.length <= 40);
});

test('feed pool reuses existing data; every item links to a real LIVON route or an official https site', () => {
  const { feed } = app();
  const pool = feed._test.pool();
  const kinds = pool.reduce((m, x) => (m[x.kind] = (m[x.kind] || 0) + 1, m), {});
  assert.equal(kinds.topic, LIFE.topics.length);
  assert.ok(kinds.content >= 30 && kinds.explore >= 20 && kinds.policy === LIFE.policies.length);
  assert.equal(new Set(pool.map(x => x.key)).size, pool.length);
  for (const x of pool) {
    if (x.external) assert.match(x.href, /^https:\/\//, x.key);
    else assert.match(x.href, /^#(today\/[a-z0-9-]+|life\/[1-7]0s\/[a-z0-9-]+|ex-item-[\w-]+)$/, x.key);
    assert.ok(x.title && x.cats.length, x.key);
    for (const k of ['views', 'likes', 'rating', 'reviews']) assert.equal(x[k], undefined);
  }
});

test('every category tab has real items (event shows guides only), for-you ranks the chosen stage first', () => {
  const { feed } = app();
  for (const c of feed._test.CATS) {
    if (c.id === 'foryou') continue;
    const list = feed._test.listFor(c.id);
    assert.ok(list.length > 0, c.id);
  }
  for (const x of feed._test.listFor('event')) assert.ok(!/\d{4}-\d{2}-\d{2}/.test(x.title), 'no invented dated events');
  const a = app({ stage: '70' });
  const p = a.feed.profile();
  assert.equal(p.stage, '70'); assert.equal(p.personalized, true);
  const pool = a.feed._test.pool().filter(x => x.kind === 'topic');
  const s70 = pool.filter(x => x.stageIds[0] === '70').map(x => a.feed._test.score(x, p));
  const s20 = pool.filter(x => x.stageIds[0] === '20').map(x => a.feed._test.score(x, p));
  assert.ok(Math.min(...s70) > Math.max(...s20) - 1.01, 'stage match outweighs daily jitter');
  assert.equal(app().feed.profile().personalized, false);
});

test('today content ↔ Life Stage relations work both ways without copying topics', () => {
  const { feed, TD } = app();
  const c = TD.contents.find(x => x.id === 'td-indep-missed');
  const rel = feed._test.relatedTopicsOf(c).map(t => t.id);
  assert.ok(rel.includes('20s.first-independence'));
  // reverse: topics that reference td:* in life-topics.json show up on the content
  const yoga = TD.contents.find(x => x.id === 'exp-yoga');
  const reverse = LIFE.topics.filter(t => t.relatedContentIds.concat(t.relatedClassIds, t.relatedPlaceIds).includes('td:exp-yoga')).map(t => t.id);
  assert.ok(reverse.length > 0);
  for (const id of reverse) assert.ok(feed._test.relatedTopicsOf(yoga).some(t => t.id === id), id);
});

test('save ids are shared with Life Stage / My Life (LivonPlatform) and map back to feed items', () => {
  const { feed, hub, saves } = app();
  hub._test.doSave({ type: 'content', id: 'td:td-indep-missed', title: 'x', href: '#today/td-indep-missed', lifeStage: '20' });
  assert.ok(saves.has('life-hub:content:td:td-indep-missed'));
  assert.equal(feed._test.saveKey('life-hub:content:td:td-indep-missed'), 'td:td-indep-missed');
  assert.equal(feed._test.saveKey('life-hub:topic:20s.first-independence'), 'lt:20s.first-independence');
  assert.equal(feed._test.saveKey('life-hub:policy:pol-nhis'), 'pol:pol-nhis');
  assert.ok(feed.profile().weights.life > 0, 'saved category feeds For You');
});

test('My Life add from Today: approval-only, deduplicated, keeps existing records', () => {
  const { hub, ctx, TD } = app();
  ctx.localStorage.setItem('livon.mlStore.v1', JSON.stringify({ todos: [{ id: 'mine' }], notes: [1] }));
  const c = TD.contents.find(x => x.id === 'td-moving-checklist');
  const spec = { key: 'today:' + c.id, title: c.title, items: c.checklist, sourceHref: '#today/' + c.id, source: 'today', category: '오늘의 발견' };
  assert.equal(hub._test.addTodos(spec, []), 0);
  assert.equal(hub._test.addTodos(spec, ['c1', 'c2']), 2);
  assert.equal(hub._test.addTodos(spec, ['c1', 'c2', 'c3']), 1);
  const s = JSON.parse(ctx.localStorage.getItem('livon.mlStore.v1'));
  assert.ok(s.todos.some(x => x.id === 'mine')); assert.deepEqual(s.notes, [1]);
  assert.equal(s.todos.filter(x => x.source === 'today').length, 3);
  assert.ok(s.todos.every(x => x.id === 'mine' || x.sourceHref === '#today/td-moving-checklist'));
});

test('AI draft from Today carries content context in the existing page fields (no auto-send)', () => {
  const { hub, ctx } = app();
  hub._test.askAI({ source: 'today', q: '정리해 줘', stage: '20', stageLabel: '20대', topicId: 'today:td-indep-missed', topicTitle: '첫 독립을 준비할 때 놓치기 쉬운 것', category: '독립', url: '#today/td-indep-missed', summary: 'x'.repeat(500) });
  const p = JSON.parse(ctx.sessionStorage.getItem('livon.aiPrompt'));
  assert.equal(p.draftOnly, true);
  assert.match(p.q, /^\[오늘의 발견\]/); assert.match(p.q, /콘텐츠: 첫 독립/); assert.match(p.q, /요약: x{200}\n/);
  assert.deepEqual(Object.keys(p.page).sort(), ['category', 'excerpt', 'lifeStage', 'source', 'stageLabel', 'topicId', 'topicTitle', 'url']);
  assert.equal(p.page.url, 'https://www.newon.app/livon/#today/td-indep-missed');
  // Life Stage drafts are unchanged
  hub._test.askAI({ q: 'q', stage: '20', stageLabel: '20대', topicId: '20s.first-independence', topicTitle: '첫 독립 준비', category: '독립', url: '#life/20s/first-independence' });
  assert.match(JSON.parse(ctx.sessionStorage.getItem('livon.aiPrompt')).q, /^\[라이프 스테이지\]\n연령대: 20대\n주제: 첫 독립 준비/);
});

test('recent history: ids only, deduplicated, capped', () => {
  const { feed, ctx } = app();
  for (let i = 0; i < 20; i++) feed.pushRecent('td:place-hangang');
  feed.pushRecent('lt:20s.first-independence'); feed.pushRecent('<script>'); feed.pushRecent('td:exp-yoga');
  for (let i = 0; i < 20; i++) feed.pushRecent('ex:ex-nl' + (i % 3 === 0 ? '' : ''));
  const list = feed.recent();
  assert.ok(list.length <= 12);
  assert.equal(new Set(list.map(x => x.key)).size, list.length);
  assert.ok(list.every(x => /^(td|lt|ex|pol|svc):[\w.-]+$/.test(x.key) && Object.keys(x).sort().join() === 'at,key'));
  assert.equal(list[0].key, 'ex:ex-nl');
});

test('static Today routes: one per content with canonical + redirect', () => {
  const contents = loadTodayContents();
  const routes = buildTodayRoutes(contents);
  /* BEFORE: one per content. AFTER (LIVON Next V1 integration): one per content not on review hold — a held record gets no page */
  const held = contents.filter(c => c.publishStatus && c.publishStatus !== 'published').map(c => c.id);
  assert.deepEqual([...held].sort(), ['exp-baking', 'exp-photo', 'exp-pottery', 'exp-yoga', 'learn-digital-senior', 'learn-finance', 'learn-kmooc']);
  assert.equal(routes.length, contents.length - held.length + 1);
  for (const id of held) assert.ok(!routes.some(x => x.dir === 'today/' + id), id + ' has no static page');
  const r = routes.find(x => x.dir === 'today/td-indep-missed');
  assert.equal(r.pathName, '/livon/today/td-indep-missed/'); assert.equal(r.hash, '#today/td-indep-missed');
});
