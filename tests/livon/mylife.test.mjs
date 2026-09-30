import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const ML = 'livon.mlStore.v1';
const J = x => JSON.parse(JSON.stringify(x));

function app({ store, local = {} } = {}) {
  const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), _m: m }; };
  const saves = new Map();
  const ctx = {
    window: {}, localStorage: mem(), sessionStorage: mem(), location: { hash: '#ml-home' }, navigator: {}, URL, history: { state: null, replaceState() {}, pushState() {} },
    document: { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null }, contains: () => false },
    fetch: () => Promise.reject(new Error('no network in tests')), setTimeout, console, addEventListener() {},
  };
  ctx.window = ctx;
  ctx.LivonPlatform = {
    listSaves: () => [...saves.values()],
    saveItem: x => saves.set(x.id, Object.assign({ savedAt: Date.now() }, x)),
    removeSave: id => saves.delete(id),
    folders: () => ['나중에 보기'],
  };
  if (store) ctx.localStorage.setItem(ML, JSON.stringify(store));
  for (const [k, v] of Object.entries(local)) ctx.localStorage.setItem(k, JSON.stringify(v));
  vm.createContext(ctx);
  for (const f of ['data/livon-user-data.js', 'explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js', 'today-feed.js', 'explore-search.js', 'life-now-data.js', 'life-now-page.js']) vm.runInContext(read(f), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  const raw = () => JSON.parse(ctx.localStorage.getItem(ML) || 'null');
  return { ctx, T: ctx.LivonMyLife._test, hub: ctx.LivonLifeHub, feed: ctx.LivonTodayFeed, saves, raw };
}
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const shift = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

test('task CRUD + completion + filters (오늘/예정/완료)', () => {
  const { T, raw } = app();
  const a = T.saveTodo({ title: '이력서 수정', due: today(), priority: '높음' });
  assert.equal(a.status, 'ok');
  const b = T.saveTodo({ title: '포트폴리오 정리', due: shift(3) });
  const c = T.saveTodo({ title: '날짜 없는 일' });
  assert.equal(raw().todos.length, 3);
  assert.equal(T.todoBucket(a.item, today()), 'today');
  assert.equal(T.todoBucket(b.item, today()), 'upcoming');
  assert.equal(T.todoBucket(c.item, today()), 'upcoming');
  const upd = T.saveTodo({ id: b.item.id, title: '포트폴리오 정리 v2', due: shift(-1), priority: '보통' });
  assert.equal(upd.status, 'ok'); assert.equal(upd.created, false);
  assert.equal(T.todoBucket(upd.item, today()), 'today', 'overdue counts as 오늘');
  T.setTodoDone(a.item.id, true);
  assert.equal(raw().todos.find(t => t.id === a.item.id).done, true);
  assert.equal(T.todoBucket(raw().todos.find(t => t.id === a.item.id), today()), 'done');
  T.setTodoDone(a.item.id, false);
  assert.equal(raw().todos.find(t => t.id === a.item.id).done, false);
  assert.equal(T.saveTodo({ title: '   ' }).status, 'invalid');
  assert.equal(T.removeItem('todo', c.item.id), true);
  assert.equal(raw().todos.length, 2);
});

test('duplicate prevention: same open title needs explicit confirmation; Life Stage/Today ids never duplicate', () => {
  const { T, hub, raw } = app();
  T.saveTodo({ title: '예산 정하기' });
  const dup = T.saveTodo({ title: '  예산   정하기 ' });
  assert.equal(dup.status, 'duplicate');
  assert.equal(raw().todos.length, 1);
  assert.equal(T.saveTodo({ title: '예산 정하기' }, { force: true }).status, 'ok');
  assert.equal(raw().todos.length, 2);
  // Life Stage / Today add flows (existing, reused) dedupe by id
  const topic = LIFE.topics.find(t => t.id === '20s.first-customers');
  const ids = topic.checklist.map(c => c.id);
  assert.equal(hub._test.addToMyLife(topic.id, ids), ids.length);
  assert.equal(hub._test.addToMyLife(topic.id, ids), 0);
  const spec = { key: 'td-x', title: 'T', source: 'today', sourceHref: '#today/td-x', category: '오늘의 발견', items: [{ id: 'a', text: '하나' }] };
  assert.equal(hub._test.addTodos(spec, ['a']), 1);
  assert.equal(hub._test.addTodos(spec, ['a']), 0);
});

test('source reference is shown and preserved when the task is edited', () => {
  const { T, hub, raw } = app();
  const topic = LIFE.topics.find(t => t.id === '20s.first-customers');
  hub._test.addToMyLife(topic.id, [topic.checklist[0].id]);
  const t0 = raw().todos[0];
  assert.equal(t0.source, 'life-stage');
  assert.equal(t0.sourceHref, '#life/20s/first-customers');
  assert.equal(T.todoSource(t0), 'life-stage');
  const r = T.saveTodo({ id: t0.id, title: t0.title + ' (수정)', due: shift(2), priority: '높음', category: '라이프 스테이지', note: t0.note });
  assert.equal(r.status, 'ok');
  const t1 = raw().todos[0];
  assert.equal(t1.source, 'life-stage');
  assert.equal(t1.sourceHref, '#life/20s/first-customers');
  assert.equal(t1.createdAt, t0.createdAt);
  assert.equal(T.safeHref(t1.sourceHref), '#life/20s/first-customers');
  assert.equal(T.safeHref('javascript:alert(1)'), '');
  assert.equal(T.safeHref('#'), '');
});

test('event CRUD, date move, conflict needs confirmation, end before start rejected', () => {
  const { T, raw } = app();
  const e = T.saveEvent({ title: '치과', date: today(), start: '10:00', end: '11:00', category: '건강' });
  assert.equal(e.status, 'ok');
  assert.equal(T.saveEvent({ title: '회의', date: today(), start: '10:00' }).status, 'conflict');
  assert.equal(T.saveEvent({ title: '회의', date: today(), start: '10:00' }, { force: true }).status, 'ok');
  assert.equal(T.saveEvent({ title: 'x', date: today(), start: '12:00', end: '11:00' }).status, 'invalid');
  const moved = T.saveEvent({ id: e.item.id, title: '치과', date: shift(7), start: '10:00', end: '11:00', category: '건강' });
  assert.equal(moved.status, 'ok');
  assert.equal(raw().events.find(x => x.id === e.item.id).date, shift(7));
  assert.equal(raw().events.length, 2);
  assert.equal(T.removeItem('event', e.item.id), true);
  assert.equal(raw().events.length, 1);
});

test('goal CRUD + goal–task relation: progress only from linked tasks; deleting a goal keeps its tasks', () => {
  const { T, raw } = app();
  const g = T.saveGoal({ title: '첫 독립', status: '진행 중', start: today(), due: shift(90) });
  assert.equal(g.status, 'ok');
  assert.equal(T.goalProgress(raw(), g.item), null, 'no linked tasks → no progress shown');
  assert.equal(T.saveGoal({ title: 'x', start: today(), due: shift(-1) }).status, 'invalid');
  const a = T.saveTodo({ title: '예산 정하기', goalId: g.item.id });
  const b = T.saveTodo({ title: '매물 보기' });
  T.setGoalTodos(g.item.id, [a.item.id, b.item.id]);
  T.setTodoDone(a.item.id, true);
  assert.deepEqual(J(T.goalProgress(raw(), g.item)), { done: 1, total: 2, pct: 50 });
  T.saveGoal({ id: g.item.id, title: '첫 독립', status: '보류', start: today(), due: shift(90) });
  assert.equal(raw().goals[0].status, '보류');
  T.setGoalTodos(g.item.id, [a.item.id]);
  assert.equal(raw().todos.find(t => t.id === b.item.id).goalId, undefined);
  assert.equal(T.removeItem('goal', g.item.id), true);
  const s = raw();
  assert.equal(s.goals.length, 0);
  assert.equal(s.todos.length, 2, 'linked tasks are kept');
  assert.ok(s.todos.every(t => !t.goalId), 'links are cleared');
});

test('record (기록) CRUD with category', () => {
  const { T, raw } = app();
  assert.equal(T.saveJournal({ title: '', date: today(), body: '' }).status, 'invalid');
  const r = T.saveJournal({ title: '산책', date: today(), category: '건강', body: '30분 걸었다' });
  assert.equal(r.status, 'ok');
  assert.equal(raw().journal[0].category, '건강');
  assert.equal(raw().journal[0].private, true);
  T.saveJournal({ id: r.item.id, title: '산책', date: shift(-1), category: '없는분류', body: '수정' });
  assert.equal(raw().journal[0].category, '기타');
  assert.equal(raw().journal[0].date, shift(-1));
  assert.equal(T.removeItem('journal', r.item.id), true);
  assert.equal(raw().journal.length, 0);
});

test('shared save: one store, typed, unsave removes every id form and legacy copies', () => {
  const { T, hub, saves, ctx } = app({ local: { 'livon.tdSaved': [{ id: 'td-startup-first-weeks', label: 'x' }], 'livon.exSaved': [{ id: 'ex-nl' }] } });
  hub._test.doSave({ type: 'topic', id: '20s.first-customers', title: '초기 고객 찾기', href: '#life/20s/first-customers', lifeStage: '20' });
  hub._test.doSave({ type: 'content', id: 'td:td-startup-first-weeks', title: '창업 첫 2주', href: '#today/td-startup-first-weeks' });
  ctx.LivonPlatform.saveItem({ id: 'td:td-startup-first-weeks', label: 'legacy', href: '#td-item-td-startup-first-weeks' });
  hub._test.doSave({ type: 'place', id: 'ex:ex-nl', title: '국립중앙도서관', href: '#ex-item-ex-nl' });
  const list = T.collectedSaved();
  assert.equal(list.length, 3, 'legacy + shared id of the same content count once');
  assert.deepEqual(J(list.map(x => x.type).sort()), ['content', 'place', 'topic']);
  assert.ok(list.every(x => x.at > 0 && x.label && x.href.startsWith('#')));
  T.unsave('life-hub:content:td:td-startup-first-weeks');
  assert.ok(![...saves.keys()].some(k => k.includes('td-startup-first-weeks')));
  assert.equal(JSON.parse(ctx.localStorage.getItem('livon.tdSaved')).length, 0);
  assert.equal(hub.saves.isSaved('content', 'td:td-startup-first-weeks'), false, 'original screen reads the same state');
  T.unsave('life-hub:place:ex:ex-nl');
  assert.equal(JSON.parse(ctx.localStorage.getItem('livon.exSaved')).length, 0);
  assert.equal(hub.saves.isSaved('topic', '20s.first-customers'), true);
});

test('interests: My Life writes the key Today For You reads; removal also clears Today prefs', () => {
  const { T, feed, ctx } = app({ local: { 'livon.tdPrefs': { interests: ['여행'] }, 'livon.mlInterests': ['오늘 저장 라벨'] } });
  assert.deepEqual(J(T.readInterests()), ['여행']);
  assert.equal(T.addInterest('캠핑').status, 'ok');
  assert.equal(T.addInterest('캠핑').status, 'exists');
  assert.ok(feed.profile().interests.includes('캠핑'));
  assert.deepEqual(J(JSON.parse(ctx.localStorage.getItem('livon.lifeInterests'))), ['캠핑']);
  assert.deepEqual(J(JSON.parse(ctx.localStorage.getItem('livon.mlInterests'))), ['오늘 저장 라벨', '캠핑'], 'other mlInterests entries are kept');
  T.removeInterest('여행');
  assert.equal(feed.profile().interests.includes('여행'), false);
  T.removeInterest('캠핑');
  assert.deepEqual(J(feed.profile().interests), []);
});

test('route state: #ml-{view}?params round-trips; unknown values fall back', () => {
  const { T } = app();
  const r = T.parseMlHash('#ml-todos?filter=today&source=life-stage');
  assert.equal(r.view, 'todos');
  T.applyParams('todos', r.params);
  assert.equal(T.viewHash('todos'), '#ml-todos?filter=today&source=life-stage');
  T.applyParams('todos', { filter: 'bogus', source: '<x>' });
  assert.equal(T.viewHash('todos'), '#ml-todos');
  T.applyParams('journal', T.parseMlHash('#ml-journal?cat=%EA%B1%B4%EA%B0%95').params);
  assert.equal(T.viewHash('journal'), '#ml-journal?cat=%EA%B1%B4%EA%B0%95');
  T.applyParams('saved', { type: 'policy' });
  assert.equal(T.viewHash('saved'), '#ml-saved?type=policy');
  T.applyParams('calendar', { mode: 'week', date: '2026-10-05' });
  assert.equal(T.viewHash('calendar'), '#ml-calendar?mode=week&date=2026-10-05');
  assert.equal(T.viewHash('home'), '#ml-home');
});

test('AI hand-off from My Life is a draft only and never mutates My Life data', () => {
  const { T, hub, ctx, raw } = app();
  T.saveTodo({ title: '이력서 수정', due: today() });
  const before = ctx.localStorage.getItem(ML);
  hub._test.askAI({ source: 'mylife', topicId: 'todos', topicTitle: '할 일 정리', category: '내 생활 · 할 일', url: '#ml-todos', q: '순서를 제안해 줘' });
  const p = JSON.parse(ctx.sessionStorage.getItem('livon.aiPrompt'));
  assert.equal(p.draftOnly, true);
  assert.match(p.q, /^\[내 생활\]\n항목: 할 일 정리\n분야: 내 생활 · 할 일/);
  assert.equal(p.page.url, 'https://www.newon.app/livon/#ml-todos');
  assert.deepEqual(Object.keys(p.page).sort(), ['category', 'excerpt', 'lifeStage', 'source', 'stageLabel', 'topicId', 'topicTitle', 'url']);
  assert.equal(ctx.localStorage.getItem(ML), before);
  assert.equal(raw().todos.length, 1);
});

test('priority uses only real deadlines, event times and user priority', () => {
  const { T, raw } = app();
  T.saveTodo({ title: '지난 일', due: shift(-2) });
  T.saveTodo({ title: '오늘 일', due: today() });
  T.saveTodo({ title: '중요한 일', priority: '높음' });
  T.saveTodo({ title: '보통 미래 일', due: shift(5) });
  T.saveEvent({ title: '종일 행사', date: today(), allDay: true });
  const items = T.priorityItems(raw(), new Date());
  const titles = items.map(x => x.item.title);
  assert.deepEqual(J(titles), ['지난 일', '종일 행사', '오늘 일', '중요한 일']);
  assert.ok(!titles.includes('보통 미래 일'));
  assert.equal(T.priorityItems({ todos: [], events: [] }, new Date()).length, 0);
});

test('one-time migration is additive and idempotent (no data deleted)', () => {
  const legacy = {
    goals: [{ id: 'g1', title: '저축', progress: 40, status: '' }, { id: 'g2', title: '끝', progress: 100, status: '완료' }],
    todos: [{ id: 't1', title: 'AI 할 일', priority: 'medium', note: 'LIVON AI 초안 · 계획' }, { id: 't2', title: '일반', priority: '높음' }],
    journal: [{ id: 'j1', body: 'x', date: '2026-09-01' }],
    checklists: [{ id: 'c1', title: 'AI 단계', items: [{ text: 'a', done: false }, { text: 'b', done: false }] }],
    customField: { keep: true },
  };
  const { T, raw } = app({ store: legacy });
  const s = T.loadStore();
  assert.equal(s.v, 2);
  const r = raw();
  assert.equal(r.v, 2, 'migration is persisted once');
  assert.equal(r.goals[0].status, '진행 중'); assert.equal(r.goals[0].progress, 40, 'old progress value kept, just not shown');
  assert.equal(r.goals[1].status, '완료');
  assert.equal(r.todos[0].priority, '보통'); assert.equal(r.todos[0].source, 'livon-ai');
  assert.equal(r.todos[1].source, undefined);
  assert.equal(r.journal[0].category, '기타');
  assert.ok(r.checklists[0].items.every(i => i.id), 'checklist items become checkable');
  assert.deepEqual(J(r.customField), { keep: true });
  const snapshot = JSON.stringify(r);
  T.loadStore();
  assert.equal(JSON.stringify(raw()), snapshot, 'second load does not migrate again');
});

test('recently viewed resolves the shared Today/Life/Explore list without inventing items', () => {
  const { T, ctx } = app({ local: { 'livon.today.recent.v1': [{ key: 'lt:20s.first-customers', at: 2 }, { key: 'td:td-startup-first-weeks', at: 1 }, { key: 'zz:unknown', at: 0 }] } });
  const r = T.recentViewed();
  assert.deepEqual(J(r.items.map(x => x.key)), ['lt:20s.first-customers', 'td:td-startup-first-weeks']);
  assert.ok(r.items.every(x => x.title && x.href));
  assert.ok(ctx);
});
