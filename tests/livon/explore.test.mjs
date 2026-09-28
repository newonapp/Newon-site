import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));

function app({ withLife = true, posts = [] } = {}) {
  const store = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };
  const saves = new Map();
  const ctx = {
    window: {}, localStorage: store(), sessionStorage: store(), location: { hash: '#explore' }, navigator: {}, URL,
    document: { readyState: 'complete', getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null } },
    fetch: () => Promise.reject(new Error('no network in tests')), setTimeout, console, addEventListener() {},
  };
  ctx.window = ctx;
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, x), removeSave: id => saves.delete(id) };
  if (posts.length) ctx.localStorage.setItem('livon.cmStore.v1', JSON.stringify({ posts }));
  vm.createContext(ctx);
  for (const f of ['explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js', 'explore-search.js']) vm.runInContext(read(f), ctx);
  if (withLife) ctx.LivonLifeHub.repo.use(LIFE);
  return { ctx, S: ctx.LivonSearch, hub: ctx.LivonLifeHub, saves, TD: ctx.LivonTodayData, EX: ctx.LivonExploreData };
}
const titles = r => r.items.map(x => x.item.title);
const keys = r => r.items.map(x => x.item.key);

test('unified index: every source by reference, no copies, no experts invented', () => {
  const { S, TD, EX } = app();
  const idx = S.index();
  const by = idx.reduce((m, x) => (m[x.type.startsWith('l') ? 'life' : x.key.split(':')[0]] = (m[x.type.startsWith('l') ? 'life' : x.key.split(':')[0]] || 0) + 1, m), {});
  assert.equal(idx.filter(x => x.key.startsWith('lt:')).length, LIFE.topics.length);
  assert.equal(idx.filter(x => x.key.startsWith('td:')).length, TD.contents.length);
  assert.equal(idx.filter(x => x.key.startsWith('ex:')).length, EX.items.length);
  assert.equal(idx.filter(x => x.key.startsWith('svc:')).length, LIFE.serviceTypes.length);
  assert.equal(idx.filter(x => x.key.startsWith('pol:')).length, LIFE.policies.length);
  assert.equal(new Set(idx.map(x => x.key)).size, idx.length);
  assert.equal(idx.filter(x => x.type === 'expert').length, 0, 'no expert data exists yet');
  for (const x of idx) {
    assert.ok(x.external ? /^https:\/\//.test(x.href) : /^#(life\/[1-7]0s\/[a-z0-9-]+|life\/services\/[a-z0-9-]+|today\/[a-z0-9-]+|ex-item-[\w-]+)$/.test(x.href), x.key + ' ' + x.href);
    for (const k of ['rating', 'views', 'reviews', 'price']) assert.equal(x[k], undefined);
  }
  assert.ok(by);
});

test('창업: Life Stage, Today, K-Startup policy and related services are found', () => {
  const { S } = app();
  const r = S.search('창업', {});
  const t = titles(r);
  for (const x of ['창업 아이디어 검증', '사업계획 준비', '초기 비용 계산', '사업자등록 준비', '초기 고객 찾기', '창업 첫걸음', '창업 아이디어, 첫 2주에 확인할 것', '창업 준비']) assert.ok(t.includes(x), x);
  assert.ok(keys(r).includes('pol:pol-kstartup'));
  assert.ok(keys(r).some(k => k.startsWith('svc:')));
  // relevance: title matches outrank category-only matches, which outrank related-data matches
  const pos = k => keys(r).indexOf(k);
  assert.ok(pos('lt:20s.startup-20') < pos('lt:20s.business-plan'));
  assert.ok(pos('lt:20s.business-plan') < r.items.findIndex(x => x.via));
});

test('독립 / 주거 / 취업 / 건강 / 육아 / 돌봄 / 여행 return real matches across types', () => {
  const { S } = app();
  const r = S.search('독립', {});
  for (const x of ['첫 독립 준비', '독립 예산 만들기', '이사 준비', '독립 후 생활비 관리', '첫 독립을 준비할 때 놓치기 쉬운 것']) assert.ok(titles(r).includes(x), x);
  assert.ok(r.counts.service > 0 && r.counts.policy > 0 && keys(r).includes('pol:pol-myhome'));
  for (const q of ['주거', '취업', '건강', '육아', '돌봄', '여행']) {
    const x = S.search(q, {});
    assert.ok(x.total >= 5, q + ' ' + x.total);
    assert.ok(x.counts.life > 0, q);
  }
});

test('Korean short words do not match inside unrelated words', () => {
  const { S } = app();
  const hit = S.search('이사', {}).items.find(x => x.item.key === 'ex:ex-childcare');
  assert.ok(!hit || hit.via, '"이사" must not match "아이사랑" directly (only via a related topic)');
  assert.ok(titles(S.search('이사', {})).includes('이사 준비 체크리스트'));
});

test('filters: type, category, age, legacy explore category, region; counts ignore the type filter', () => {
  const { S } = app();
  const life = S.search('창업', { type: 'life' });
  assert.ok(life.items.length && life.items.every(x => x.item.type === 'life'));
  assert.equal(life.counts.all, S.search('창업', {}).total);
  const age = S.search('창업', { age: '20' });
  assert.ok(age.items.length && age.items.every(x => x.item.stageIds.includes('20')));
  const cat = S.search('', { cat: 'startup' });
  assert.ok(cat.items.length && cat.items.every(x => x.item.cats.includes('startup')));
  const ex = S.search('', { exCat: 'career' });
  assert.ok(ex.items.some(x => x.item.key === 'ex:ex-career24') && ex.items.some(x => x.item.type === 'life'));
  const region = S.search('', { exCat: 'local', region: '서울' });
  assert.ok(region.items.every(x => ['서울', '전국', '온라인'].includes(x.item.region)));
  const expert = S.search('세무사', { type: 'expert' });
  assert.equal(expert.items.length, 0);
  assert.ok(expert.counts.policy > 0, 'official institutions are offered instead');
});

test('no results: honest zero, no filler', () => {
  const { S } = app();
  const r = S.search('존재하지않는검색어zz', {});
  assert.equal(r.total, 0); assert.equal(r.counts.all, 0);
  assert.equal(S.search('', {}).total, 0, 'empty query without filters shows the search home, not everything');
});

test('newest sort uses real dates only; relevance is default', () => {
  const { S } = app();
  const r = S.search('독립', { sort: 'newest' });
  const dates = r.items.map(x => x.item.date || '');
  for (let i = 1; i < dates.length; i++) assert.ok(dates[i - 1] >= dates[i] || !dates[i], dates[i - 1] + ' ' + dates[i]);
});

test('community: only real local posts are searched', () => {
  assert.equal(app().S.search('이사', { type: 'community' }).total, 0);
  const { S } = app({ posts: [{ id: 'p1', title: '이사 업체 고르는 팁', body: '견적 비교', field: '주거·독립' }, { id: 'p2', title: '임시 저장', body: '이사', draft: true }] });
  const r = S.search('이사', { type: 'community' });
  assert.equal(JSON.stringify(keys(r)), '["cm:p1"]');
  assert.equal(r.items[0].item.href, '#cm-post-p1');
});

test('Life Stage data still loading → Today/Explore still searchable, status reported', () => {
  const { S } = app({ withLife: false });
  const r = S.search('창업', {});
  assert.equal(r.lifeStatus === 'ready', false);
  assert.ok(titles(r).includes('창업 아이디어, 첫 2주에 확인할 것'));
  assert.equal(r.items.some(x => x.item.type === 'life'), false);
});

test('save ids are the shared Life Stage / Today ids', () => {
  const { S, hub, saves } = app();
  const topic = S.index().find(x => x.key === 'lt:20s.first-customers');
  const td = S.index().find(x => x.key === 'td:td-startup-first-weeks');
  const ex = S.index().find(x => x.key === 'ex:ex-nl');
  assert.deepEqual([topic.save.type, topic.save.id], ['topic', '20s.first-customers']);
  assert.deepEqual([td.save.type, td.save.id], ['content', 'td:td-startup-first-weeks']);
  assert.deepEqual([ex.save.type, ex.save.id], ['place', 'ex:ex-nl']);
  hub._test.doSave({ type: topic.save.type, id: topic.save.id, title: 'x', href: topic.save.href, lifeStage: '20' });
  assert.ok(saves.has('life-hub:topic:20s.first-customers'));
  assert.equal(hub.saves.isSaved('topic', '20s.first-customers'), true);
});

test('suggestions come from real data (창 → 창업 …), capped', () => {
  const { S } = app();
  const s = S.suggest('창', 8).map(x => x.label);
  assert.ok(s.length <= 8 && s[0] === '창업');
  assert.ok(s.includes('창업 아이디어 검증'));
  assert.equal(S.suggest('', 8).length, 0);
});

test('AI draft from a no-result search carries only query/filters/url', () => {
  const { hub, ctx } = app();
  hub._test.askAI({ source: 'explore', q: '찾고 있어요', stage: '20', stageLabel: '20대', topicId: 'search', topicTitle: '없는검색어', category: '라이프 스테이지 · 창업', url: '#ex-results?q=%EC%97%86' });
  const p = JSON.parse(ctx.sessionStorage.getItem('livon.aiPrompt'));
  assert.equal(p.draftOnly, true);
  assert.match(p.q, /^\[탐색\]\n연령대: 20대\n검색어: 없는검색어\n조건: 라이프 스테이지 · 창업/);
  assert.equal(p.page.url, 'https://www.newon.app/livon/#ex-results?q=%EC%97%86');
});
