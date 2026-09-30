import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { buildRoutes, stubHtml } from '../../scripts/render-livon-life-routes.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const DATA = JSON.parse(read('life-topics.json'));

// Categories as specified in the Life Stage brief (per stage, in order).
const EXPECTED_CATEGORIES = {
  '10': ['학교생활', '진로 탐색', '대학/입시', '공부', '자기계발', '친구/관계', '건강', '취미', '금융 기초', '디지털 생활', '아르바이트 준비', '청소년 지원'],
  '20': ['대학/교육', '취업', '커리어', '자기계발', '독립', '주거', '돈/재테크', '건강', '연애/관계', '여행', '창업', '취미/문화', '공공지원'],
  '30': ['커리어 성장', '이직', '창업', '자산관리', '주거', '결혼', '출산', '육아', '건강', '관계', '여행', '자기계발', '가족관리'],
  '40': ['커리어 전환', '자산관리', '투자', '주거', '자녀교육', '부모 돌봄', '건강검진', '운동', '가족', '여가', '노후 준비', '자기계발'],
  '50': ['제2의 커리어', '은퇴 준비', '자산관리', '연금', '건강', '운동', '부모/가족 돌봄', '자녀 독립', '여행', '취미', '사회활동', '주거 계획'],
  '60': ['은퇴 생활', '연금', '자산관리', '건강관리', '운동', '취미', '여행', '사회활동', '일자리', '가족', '주거', '돌봄', '디지털 생활'],
  '70': ['건강관리', '병원/의료 생활정보', '운동', '돌봄', '복지', '연금', '생활지원', '주거', '가족', '취미', '여행', '사회활동', '디지털 도움'],
};

function app() {
  const store = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };
  const saves = new Map();
  const ctx = {
    window: {}, localStorage: store(), sessionStorage: store(), location: { hash: '#life/20s/first-independence' }, navigator: {},
    document: { readyState: 'complete', getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null } },
    fetch: () => Promise.reject(new Error('no network in tests')), setTimeout, console,
  };
  ctx.window = ctx;
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, x), removeSave: id => saves.delete(id) };
  vm.createContext(ctx);
  for (const f of ['data/livon-user-data.js', 'life-data.js', 'service-details-data.js', 'service-details.js', 'explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js']) vm.runInContext(read(f), ctx);
  const hub = ctx.LivonLifeHub;
  hub.repo.use(DATA);
  return { ctx, hub, saves };
}

test('7 stages with exactly the requested interest categories, each with topics', () => {
  assert.equal(DATA.stages.length, 7);
  assert.deepEqual(DATA.stages.map(s => s.slug), ['10s', '20s', '30s', '40s', '50s', '60s', '70s']);
  for (const s of DATA.stages) {
    const cats = s.categoryIds.map(id => DATA.categories.find(c => c.id === id));
    assert.deepEqual(cats.map(c => c.name), EXPECTED_CATEGORIES[s.id], s.label);
    for (const c of cats) assert.ok(c.topicIds.length >= 2, c.id);
    assert.ok(s.featuredTopicIds.length >= 4);
  }
});

test('every relation id resolves; no fake experts, partners or non-https policy sources', () => {
  const { hub } = app();
  const topicIds = new Set(DATA.topics.map(t => t.id));
  assert.equal(topicIds.size, DATA.topics.length);
  for (const t of DATA.topics) {
    for (const k of ['title', 'description', 'category']) assert.ok(t[k], `${t.id}.${k}`);
    assert.ok(t.knowledge.length && t.guide.length && t.checklist.length, t.id);
    for (const r of t.relatedTopicIds) assert.ok(topicIds.has(r), `${t.id} → ${r}`);
    for (const r of [...t.relatedContentIds, ...t.relatedClassIds, ...t.relatedPlaceIds]) assert.ok(hub.sources.ref(r), `${t.id} → ${r}`);
    for (const r of t.relatedPolicyIds) assert.ok(hub.repo.policy(r), `${t.id} → ${r}`);
    for (const r of t.relatedServiceIds) assert.ok(hub.repo.service(r), `${t.id} → ${r}`);
    assert.deepEqual(t.relatedExpertIds, []);
  }
  assert.deepEqual(DATA.experts, []);
  for (const p of DATA.policies) { assert.match(p.sourceUrl, /^https:\/\//); assert.equal(p.kind, 'portal'); }
  for (const s of DATA.serviceTypes) { assert.equal(s.externalUrl, null); assert.equal(s.partner, null); }
  const text = JSON.stringify([DATA.topics, DATA.serviceTypes, DATA.policies]);
  for (const banned of ['평점', '리뷰 ', '예약 가능 시간', '★']) assert.equal(text.includes(banned), false, banned);
});

test('routes parse and round-trip', () => {
  const { hub } = app();
  const cases = [
    ['#life/20s/first-independence', { view: 'topic', stage: '20s', topic: 'first-independence' }],
    ['#life/20s/c/indep', { view: 'category', stage: '20s', category: 'indep' }],
    ['#life/20s/first-independence/services', { view: 'services', stage: '20s', topic: 'first-independence', service: null }],
    ['#life/20s/first-independence/services/moving', { view: 'service', stage: '20s', topic: 'first-independence', service: 'moving' }],
    ['#life/services/moving', { view: 'service', service: 'moving' }],
  ];
  for (const [hash, want] of cases) {
    const got = hub.parse(hash);
    assert.deepEqual(JSON.parse(JSON.stringify(got)), want, hash);
    assert.equal(hub.route(got), hash);
  }
  assert.equal(hub.parse('#life'), null);
  assert.equal(hub.parse('#life-now'), null);
  assert.equal(hub.parse('#life/search/%EB%8F%85%EB%A6%BD').q, '독립');
  assert.equal(hub.stageIdFromHash('#life/70s'), '70');
  assert.equal(hub.stageIdFromHash('life/90s'), null);
  assert.equal(hub.stageIdFromHash('#life/20s/first-independence'), null);
});

test('every topic and featured card links to a resolvable topic route', () => {
  const { hub } = app();
  for (const t of DATA.topics) {
    const r = hub.parse(`#life/${t.stageSlug}/${t.slug}`);
    assert.equal(hub.repo.topicByRoute(r.stage, r.topic).id, t.id);
  }
  for (const s of DATA.stages) for (const id of s.featuredTopicIds) assert.ok(hub.repo.topic(id), id);
});

test('My Life add requires explicit ids and never duplicates todos', () => {
  const { ctx, hub } = app();
  const t = hub.repo.topic('20s.first-independence');
  assert.equal(hub._test.addToMyLife(t.id, []), 0);
  assert.equal(ctx.localStorage.getItem('livon.mlStore.v1'), '{"todos":[]}');
  assert.equal(hub._test.addToMyLife(t.id, ['c1', 'c2']), 2);
  assert.equal(hub._test.addToMyLife(t.id, ['c1', 'c2', 'c3']), 1);
  const todos = JSON.parse(ctx.localStorage.getItem('livon.mlStore.v1')).todos;
  assert.equal(todos.length, 3);
  for (const x of todos) { assert.equal(x.category, '라이프 스테이지'); assert.equal(x.done, false); assert.match(x.sourceHref, /^#life\/20s\//); }
});

test('existing My Life records are preserved', () => {
  const { ctx, hub } = app();
  ctx.localStorage.setItem('livon.mlStore.v1', JSON.stringify({ todos: [{ id: 'mine', title: '내 할 일' }], notes: [1] }));
  assert.equal(hub._test.addToMyLife('30s.marriage-30', ['c1']), 1);
  const s = JSON.parse(ctx.localStorage.getItem('livon.mlStore.v1'));
  assert.ok(s.todos.some(x => x.id === 'mine'));
  assert.deepEqual(s.notes, [1]);
});

test('save uses the shared LIVON store and toggles', () => {
  const { hub, saves } = app();
  hub._test.doSave({ type: 'topic', id: '20s.first-independence', title: '첫 독립 준비', href: '#life/20s/first-independence', lifeStage: '20' });
  const x = saves.get('life-hub:topic:20s.first-independence');
  assert.equal(x.type, 'life-topic'); assert.equal(x.source, '라이프 스테이지'); assert.equal(x.lifeStage, '20');
  assert.equal(hub._test.isSaved('topic', '20s.first-independence'), true);
  hub._test.doSave({ type: 'topic', id: '20s.first-independence' });
  assert.equal(saves.size, 0);
  assert.equal(hub.account.isSignedIn(), false);
});

test('AI hand-off passes page context as a draft (no auto-send, no fake answer)', () => {
  const { ctx, hub } = app();
  hub._test.askAI({ q: '계획을 만들어 줘', stage: '20', stageLabel: '20대', topicId: '20s.first-independence', topicTitle: '첫 독립 준비', category: '독립', url: '#life/20s/first-independence' });
  const p = JSON.parse(ctx.sessionStorage.getItem('livon.aiPrompt'));
  assert.equal(p.draftOnly, true);
  assert.match(p.q, /첫 독립 준비/);
  assert.equal(p.page.url, 'https://www.newon.app/livon/#life/20s/first-independence');
  assert.equal(p.page.topicId, '20s.first-independence');
  assert.equal(ctx.location.hash, 'ai-chat');
  assert.equal(hub._test.absUrl('https://evil.example/x'), '');
});

test('search finds topics, guides and policies and filters by stage', () => {
  const { hub } = app();
  const all = hub.search('독립', {});
  assert.ok(all.some(r => r.type === 'topic' && r.href === '#life/20s/first-independence'));
  const only10 = hub.search('독립', { stage: '10s' });
  assert.ok(only10.every(r => r.type !== 'topic' || r.href.startsWith('#life/10s/')));
  assert.equal(hub.search('   ', {}).length, 0);
});

test('static route stubs: one per stage/topic with canonical + redirect', () => {
  const routes = buildRoutes(DATA);
  assert.equal(routes.length, 1 + DATA.stages.length + DATA.topics.length);
  const html = stubHtml(routes.find(r => r.dir === 'life/20s/first-independence'));
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.newon\.app\/livon\/life\/20s\/first-independence\/" \/>/);
  assert.match(html, /location\.replace\("\/livon\/#life\/20s\/first-independence"\)/);
  assert.match(html, /<title>첫 독립 준비/);
});

const PRIORITY_CATEGORIES = [
  '10s.career', '10s.college', '10s.health', '10s.money',
  '20s.job', '20s.indep', '20s.housing', '20s.money', '20s.health', '20s.startup',
  '30s.change', '30s.startup', '30s.asset', '30s.housing', '30s.birth', '30s.parenting', '30s.health',
  '40s.shift', '40s.asset', '40s.invest', '40s.kids', '40s.care', '40s.checkup', '40s.retire',
  '50s.second', '50s.retire', '50s.asset', '50s.pension', '50s.health', '50s.care', '50s.housing',
  '60s.pension', '60s.asset', '60s.health', '60s.job', '60s.housing', '60s.care', '60s.digital',
  '70s.health', '70s.medical', '70s.care', '70s.welfare', '70s.pension', '70s.support', '70s.housing', '70s.digital',
];

test('priority interests contain 3–5 topics; all 88 categories own distinct substantial topics', () => {
  const { hub } = app();
  assert.equal(DATA.categories.length, 88);
  for (const id of PRIORITY_CATEGORIES) {
    const n = hub.repo.category(id).topicIds.length;
    // 20s.startup: 창업 첫걸음 + the five topics the product owner listed (incl. 초기 고객 찾기) → 6.
    const max = id === '20s.startup' ? 6 : 5;
    assert.ok(n >= 3 && n <= max, `${id}: ${n}`);
  }
  for (const c of DATA.categories) {
    const topics = hub.repo.topicsOf(c);
    assert.equal(new Set(topics.map(t => t.title)).size, topics.length, c.id);
    assert.equal(new Set(topics.map(t => JSON.stringify(t.guide))).size, topics.length, c.id);
    assert.equal(new Set(topics.map(t => JSON.stringify(t.checklist))).size, topics.length, c.id);
    for (const t of topics) {
      assert.ok(t.description.trim().length >= 20, t.id);
      assert.ok(t.guide.length >= 3 && t.checklist.length >= 3, t.id);
      for (const section of [...t.guide, ...t.knowledge]) assert.ok(section.title.trim() && section.body.trim(), t.id);
      assert.equal(new Set(t.checklist.map(x => x.id)).size, t.checklist.length, t.id);
      for (const item of t.checklist) assert.ok(item.text.trim(), t.id);
      assert.ok(t.relatedServiceIds.length && t.relatedTopicIds.length && t.aiPrompts.length, t.id);
      assert.ok(t.relatedTopicIds.some(id => id !== t.id && hub.repo.topic(id).categoryId === c.id), t.id);
    }
  }
});

test('stage/category/topic ownership is bidirectional with no orphan, duplicate, or self relation', () => {
  const { hub } = app();
  for (const key of ['stages', 'categories', 'topics', 'serviceTypes', 'policies']) {
    assert.equal(new Set(DATA[key].map(x => x.id)).size, DATA[key].length, key);
  }
  for (const stage of DATA.stages) {
    assert.equal(new Set(stage.categoryIds).size, stage.categoryIds.length, stage.id);
    for (const id of stage.categoryIds) assert.equal(hub.repo.category(id).stageId, stage.id, id);
    for (const id of stage.featuredTopicIds) assert.equal(hub.repo.topic(id).lifeStageId, stage.id, id);
  }
  for (const c of DATA.categories) {
    assert.ok(hub.repo.stage(c.stageId).categoryIds.includes(c.id), c.id);
    assert.equal(c.id, `${hub.repo.stage(c.stageId).slug}.${c.slug}`);
    assert.equal(new Set(c.topicIds).size, c.topicIds.length, c.id);
    for (const id of c.topicIds) assert.equal(hub.repo.topic(id).categoryId, c.id, id);
  }
  for (const t of DATA.topics) {
    const c = hub.repo.category(t.categoryId), s = hub.repo.stage(t.lifeStageId);
    assert.equal(c.stageId, s.id, t.id);
    assert.equal(t.stageSlug, s.slug, t.id);
    assert.equal(t.category, c.name, t.id);
    assert.equal(t.id, `${s.slug}.${t.slug}`);
    assert.equal(DATA.categories.filter(x => x.topicIds.includes(t.id)).length, 1, t.id);
    for (const key of Object.keys(t).filter(k => /^related.*Ids$/.test(k))) {
      assert.equal(new Set(t[key]).size, t[key].length, `${t.id}.${key}`);
    }
    assert.ok(!t.relatedTopicIds.includes(t.id), t.id);
  }
});

test('all topic tools and service downstream references resolve through real source adapters', () => {
  const { hub } = app();
  for (const t of DATA.topics) for (const id of t.relatedToolIds) assert.ok(hub.sources.tool(id), `${t.id} → tool ${id}`);
  for (const s of DATA.serviceTypes) {
    for (const id of s.relatedToolIds) assert.ok(hub.sources.tool(id), `${s.id} → tool ${id}`);
    for (const id of s.relatedExploreIds) assert.ok(hub.sources.explore(id), `${s.id} → explore ${id}`);
    for (const id of s.relatedContentIds) assert.ok(hub.sources.ref(id), `${s.id} → content ${id}`);
  }
});

test('every topic preserves checklist isolation, My Life deduplication, saves and AI draft context', () => {
  const { ctx, hub, saves } = app();
  ctx.localStorage.setItem('livon.mlStore.v1', JSON.stringify({ todos: [{ id: 'mine', title: '기존 할 일' }], notes: ['keep'] }));
  let expectedTodos = 1;
  for (const t of DATA.topics) {
    const href = `#life/${t.stageSlug}/${t.slug}`;
    const ids = t.checklist.map(x => x.id);
    assert.equal(hub._test.checks(t.id)[ids[0]], undefined, t.id);
    hub._test.setCheck(t.id, ids[0], true);
    assert.equal(hub._test.checks(t.id)[ids[0]], true, t.id);
    assert.equal(hub._test.addToMyLife(t.id, ids), ids.length, t.id);
    assert.equal(hub._test.addToMyLife(t.id, ids), 0, t.id);
    expectedTodos += ids.length;
    const payload = { type: 'topic', id: t.id, title: t.title, href, lifeStage: t.lifeStageId };
    hub._test.doSave(payload);
    assert.equal(saves.get(`life-hub:topic:${t.id}`).href, href, t.id);
    hub._test.doSave(payload);
    assert.equal(hub._test.isSaved('topic', t.id), false, t.id);
    hub._test.askAI({ q: t.aiPrompts[0], stage: t.lifeStageId, stageLabel: hub.repo.stage(t.lifeStageId).label, topicId: t.id, topicTitle: t.title, category: t.category, url: href });
    const draft = JSON.parse(ctx.sessionStorage.getItem('livon.aiPrompt'));
    assert.equal(draft.draftOnly, true, t.id);
    assert.equal(draft.page.topicId, t.id);
    assert.equal(draft.page.category, t.category);
    assert.equal(draft.page.url, `https://www.newon.app/livon/${href}`);
    assert.ok(hub.search(t.title, { stage: t.stageSlug }).some(x => x.type === 'topic' && x.href === href), t.id);
  }
  const saved = JSON.parse(ctx.localStorage.getItem('livon.mlStore.v1'));
  assert.equal(saved.todos.length, expectedTodos);
  assert.equal(new Set(saved.todos.map(x => x.id)).size, expectedTodos);
  assert.deepEqual(saved.notes, ['keep']);
  assert.deepEqual(saved.todos.find(x => x.id === 'mine'), { id: 'mine', title: '기존 할 일' });
  assert.equal(saves.size, 0);
});

test('all category, topic and linked service views render without missing content', () => {
  const { ctx, hub } = app();
  const node = () => ({ innerHTML: '', hidden: true, setAttribute() {}, getAttribute() { return null; }, querySelector() { return null; }, classList: { add() {}, remove() {} }, appendChild() {} });
  const root = node();
  let host;
  root.appendChild = n => { host = n; };
  ctx.document.getElementById = id => id === 'life' ? root : null;
  ctx.document.createElement = node;
  ctx.document.head.appendChild = () => {};
  ctx.scrollTo = () => {};
  for (const c of DATA.categories) {
    const s = hub.repo.stage(c.stageId);
    assert.equal(hub.open(`#life/${s.slug}/c/${c.slug}`), true);
    for (const id of c.topicIds) assert.ok(host.innerHTML.includes(hub.repo.topic(id).title), id);
    assert.ok(!host.innerHTML.includes('화면을 표시하지 못했습니다'), c.id);
  }
  for (const t of DATA.topics) {
    const href = `#life/${t.stageSlug}/${t.slug}`;
    assert.equal(hub.open(href), true);
    assert.ok(host.innerHTML.includes(t.title), t.id);
    for (const g of t.guide) assert.ok(host.innerHTML.includes(g.body), `${t.id}: guide`);
    for (const c of t.checklist) assert.ok(host.innerHTML.includes(c.text), `${t.id}: checklist`);
    assert.ok(!host.innerHTML.includes('화면을 표시하지 못했습니다'), t.id);
    assert.equal(hub.open(`${href}/services`), true);
    for (const id of t.relatedServiceIds) {
      assert.ok(host.innerHTML.includes(hub.repo.service(id).name), `${t.id}: service list`);
    }
    for (const id of t.relatedServiceIds) {
      assert.equal(hub.open(`${href}/services/${id}`), true);
      assert.ok(host.innerHTML.includes(hub.repo.service(id).description), `${t.id}: ${id}`);
      assert.ok(!host.innerHTML.includes('화면을 표시하지 못했습니다'), `${t.id}: ${id}`);
    }
  }
  const routes = buildRoutes(DATA);
  assert.equal(new Set(routes.map(x => x.dir)).size, routes.length);
  for (const t of DATA.topics) {
    const r = routes.find(x => x.dir === `life/${t.stageSlug}/${t.slug}`);
    assert.ok(r, t.id);
    assert.ok(stubHtml(r).includes(`https://www.newon.app/livon/life/${t.stageSlug}/${t.slug}/`), t.id);
  }
});

test('20s startup includes 초기 고객 찾기 with valid relations (228 topics)', () => {
  const { hub } = app();
  assert.equal(DATA.topics.length, 228);
  const t = hub.repo.topic('20s.first-customers');
  assert.ok(t && t.title === '초기 고객 찾기' && t.categoryId === '20s.startup');
  assert.ok(hub.repo.category('20s.startup').topicIds.includes(t.id));
  for (const id of t.relatedTopicIds) assert.equal(hub.repo.topic(id).categoryId, '20s.startup', id);
  for (const id of t.relatedServiceIds) assert.ok(hub.repo.service(id), id);
  assert.deepEqual(hub.parse('#life/20s/first-customers').topic, 'first-customers');
});
