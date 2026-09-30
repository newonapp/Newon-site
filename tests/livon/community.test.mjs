import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const CM = 'livon.cmStore.v1';
const J = x => JSON.parse(JSON.stringify(x));

function app({ store, local = {}, platform = true } = {}) {
  const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };
  const saves = new Map();
  const ctx = {
    window: {}, localStorage: mem(), sessionStorage: mem(), location: { hash: '#community', origin: 'https://www.newon.app', pathname: '/livon/' }, navigator: {}, URL,
    history: { state: null, replaceState() {}, pushState() {} },
    document: { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null }, contains: () => false },
    fetch: () => Promise.reject(new Error('no network in tests')), setTimeout, console, addEventListener() {},
  };
  ctx.window = ctx;
  if (platform) ctx.LivonPlatform = {
    listSaves: () => [...saves.values()],
    saveItem: x => saves.set(x.id, Object.assign({ savedAt: Date.now() }, x)),
    removeSave: id => saves.delete(id),
    folders: () => ['나중에 보기'],
  };
  if (store) ctx.localStorage.setItem(CM, JSON.stringify(store));
  for (const [k, v] of Object.entries(local)) ctx.localStorage.setItem(k, JSON.stringify(v));
  vm.createContext(ctx);
  for (const f of ['data/livon-user-data.js', 'explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js', 'explore-search.js', 'today-feed.js', 'community-page.js', 'life-now-data.js', 'life-now-page.js']) vm.runInContext(read(f), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  const raw = () => JSON.parse(ctx.localStorage.getItem(CM) || 'null');
  return { ctx, T: ctx.LivonCommunity._test, R: ctx.LivonCommunityRepo, hub: ctx.LivonLifeHub, S: ctx.LivonSearch, saves, raw };
}
const post = (over = {}) => Object.assign({ type: 'question', category: 'housing', title: '첫 자취 계약 체크', body: '계약서에서 무엇을 확인하셨나요?', tags: '자취, 계약' }, over);

test('no sample data: an empty device has no posts, comments, users or counts', () => {
  const { R, ctx, T } = app();
  assert.equal(R.visiblePosts().length, 0);
  assert.equal(R.searchablePosts().length, 0);
  const D = ctx.LivonCommunityData;
  assert.equal(D.posts, undefined); assert.equal(D.comments, undefined); assert.equal(D.users, undefined);
  for (const c of D.communities) for (const k of ['members', 'memberCount', 'followers', 'likes', 'views', 'rating']) assert.equal(c[k], undefined, c.id + '.' + k);
  const s = T.loadStore();
  assert.deepEqual(J(s.posts), []); assert.deepEqual(J(s.comments), []); assert.deepEqual(J(s.likes), {});
  assert.equal(s.profile.nick, '나');
});

test('post CRUD + validation (title, body, category, lengths, tags)', () => {
  const { R, raw } = app();
  assert.equal(R.create(post({ title: '  ' })).field, 'title');
  assert.equal(R.create(post({ body: '' })).field, 'body');
  assert.equal(R.create(post({ category: '' })).field, 'category');
  assert.equal(R.create(post({ title: 'x'.repeat(81) })).field, 'title');
  assert.equal(R.create(post({ body: 'x'.repeat(5001) })).field, 'body');
  assert.equal(R.create(post({ tags: 'a,b,c,d,e,f,g,h,i' })).field, 'tags');
  assert.equal(R.create(post({ tags: 'x'.repeat(21) })).field, 'tags');
  const r = R.create(post());
  assert.equal(r.status, 'ok');
  assert.deepEqual(J(r.post.tags), ['자취', '계약']);
  assert.equal(r.post.authorId, 'local'); assert.equal(r.post.authorNick, '나');
  const u = R.update(r.post.id, post({ title: '첫 자취 계약 체크 (수정)', category: 'money', tags: '월세' }));
  assert.equal(u.status, 'ok');
  assert.equal(raw().posts[0].title, '첫 자취 계약 체크 (수정)');
  assert.equal(raw().posts[0].category, 'money');
  assert.equal(raw().posts[0].createdAt, r.post.createdAt);
  assert.ok(raw().posts[0].updatedAt >= r.post.createdAt);
  assert.equal(R.remove(r.post.id).status, 'ok');
  assert.equal(raw().posts.length, 0);
});

test('comment CRUD with one-level replies; deleting a post removes its comments and reactions only', async () => {
  const { R, raw } = app();
  const a = R.create(post()).post, b = R.create(post({ title: '다른 글' })).post;
  assert.equal(R.addComment(a.id, '  ').status, 'invalid');
  const c1 = R.addComment(a.id, '관리비 포함 여부요').comment;
  assert.equal(R.addComment(a.id, '연속').status, 'invalid', 'rate limit');
  await new Promise(r => setTimeout(r, 1600));
  const reply = R.addComment(a.id, '저도요', c1.id).comment;
  assert.equal(reply.parentId, c1.id);
  await new Promise(r => setTimeout(r, 1600));
  const nested = R.addComment(a.id, '답글의 답글', reply.id).comment;
  assert.equal(nested.parentId, c1.id, 'max one level');
  assert.equal(R.editComment(c1.id, '관리비 포함 여부 (수정)').status, 'ok');
  assert.equal(raw().comments.find(x => x.id === c1.id).body, '관리비 포함 여부 (수정)');
  assert.ok(raw().comments.find(x => x.id === c1.id).updatedAt);
  const d = R.removeComment(c1.id);
  assert.equal(d.kept, true, 'root with replies becomes a placeholder');
  R.removeComment(reply.id); R.removeComment(nested.id);
  assert.equal(raw().comments.filter(x => x.postId === a.id).length, 0, 'empty placeholder cleaned up');
  await new Promise(r => setTimeout(r, 1600));
  R.addComment(b.id, 'B 댓글');
  R.toggleReaction(a.id); R.toggleReaction(b.id);
  R.remove(a.id);
  const s = raw();
  assert.equal(s.comments.length, 1); assert.equal(s.comments[0].postId, b.id);
  assert.deepEqual(Object.keys(s.likes), [b.id]);
});

test('reaction is a local on/off toggle, never a count', () => {
  const { R, T } = app();
  const p = R.create(post()).post;
  assert.equal(R.toggleReaction(p.id), true);
  assert.equal(R.reacted(T.loadStore(), p.id), true);
  assert.equal(R.toggleReaction(p.id), false);
  assert.equal(R.reacted(T.loadStore(), p.id), false);
  assert.equal(typeof T.loadStore().likes[p.id], 'undefined');
});

test('shared save: LivonPlatform id, visible in My Life saved (community type), unsave reflects back', () => {
  const { R, T, hub, ctx, saves } = app();
  const p = R.create(post()).post;
  hub._test.doSave({ type: 'community', id: 'cm:' + p.id, title: p.title, href: '#cm-post-' + p.id });
  assert.ok(saves.has(T.saveId(p.id)));
  assert.equal(saves.get(T.saveId(p.id)).source, '커뮤니티');
  assert.equal(R.isSaved(p.id), true);
  const ml = ctx.LivonMyLife._test.collectedSaved();
  assert.equal(ml.length, 1); assert.equal(ml[0].type, 'community'); assert.equal(ml[0].href, '#cm-post-' + p.id);
  ctx.LivonMyLife._test.unsave(ml[0].id);
  assert.equal(R.isSaved(p.id), false);
  assert.equal(hub.saves.isSaved('community', 'cm:' + p.id), false);
  hub._test.doSave({ type: 'community', id: 'cm:' + p.id, title: p.title, href: '#cm-post-' + p.id });
  R.remove(p.id);
  assert.equal(saves.size, 0, 'deleting the post removes its shared save');
});

test('Life Stage reference by id (no copy) and both directions', () => {
  const { R, hub } = app();
  const topic = LIFE.topics.find(t => t.id === '20s.first-independence');
  const p = R.create(post({ lifeStage: '20', lifeTopicId: topic.id, title: '관리비 이야기', body: '확인해 보세요', tags: '' })).post;
  assert.equal(p.lifeTopicId, '20s.first-independence');
  assert.equal(p.lifeStage, '20');
  assert.equal(p.topicTitle, undefined, 'topic data is not copied');
  assert.equal(R.create(post({ lifeTopicId: '../x' })).post.lifeTopicId, '', 'invalid reference ignored');
  const rel = hub.sources.communityPosts(topic, 3);
  assert.equal(rel[0].id, p.id, 'topic-linked post shows on the Life Stage topic');
  const other = LIFE.topics.find(t => t.id === '60s.' + LIFE.topics.find(x => x.lifeStageId === '60').slug);
  assert.ok(!hub.sources.communityPosts(Object.assign({}, other, { title: 'zzzz', category: 'zzzz' }), 3).length, 'no fake matches');
});

test('Explore indexing: public posts only, edits and deletes reflected on the next search', () => {
  const { R, S } = app();
  const pub = R.create(post({ title: '월세 계약 경험', lifeStage: '20' })).post;
  R.create(post({ title: '월세 임시 저장', draft: true }));
  R.create(post({ title: '월세 비공개 메모', visibility: 'private' }));
  R.create(post({ title: '월세 멤버 공개', visibility: 'members' }));
  let r = S.search('월세', { type: 'community' });
  assert.deepEqual(J(r.items.map(x => x.item.key)), ['cm:' + pub.id]);
  const it = r.items[0].item;
  assert.equal(it.href, '#cm-post-' + pub.id);
  assert.deepEqual(J(it.save), { type: 'community', id: 'cm:' + pub.id, title: '월세 계약 경험', href: '#cm-post-' + pub.id, stage: '20' });
  assert.ok(it.cats.includes('housing')); assert.deepEqual(J(it.stageIds), ['20']);
  R.update(pub.id, post({ title: '전세 계약 경험' }));
  assert.equal(S.search('월세 계약 경험', { type: 'community' }).total, 0);
  assert.equal(S.search('전세 계약', { type: 'community' }).items[0].item.title, '전세 계약 경험');
  R.remove(pub.id);
  assert.equal(S.search('전세 계약', { type: 'community' }).total, 0);
});

test('drafts and private posts never reach feed, Explore, Life Stage or Today', () => {
  const { R, T, hub } = app();
  R.create(post({ title: '독립 준비 초안', draft: true, category: '' }));
  R.create(post({ title: '독립 준비 비공개', visibility: 'private' }));
  assert.equal(T.filterFeed().some(p => /초안/.test(p.title)), false);
  assert.equal(T.filterFeed().filter(p => /비공개/.test(p.title)).length, 0);
  assert.equal(R.searchablePosts().length, 0);
  assert.equal(hub.sources.communityPosts({ title: '독립 준비', category: '독립' }, 3).length, 0);
  assert.equal(R.drafts().length, 1, 'draft may be saved without a category');
});

test('feed: latest by createdAt (legacy undated last), For You deterministic, following honest-empty, filters', () => {
  const { R, T, ctx } = app({ local: { 'livon.lifeStage': '30', 'livon.lifeInterests': ['육아'] } });
  const a = R.create(post({ title: 'A 주거', category: 'housing' })).post;
  const b = R.create(post({ title: 'B 육아', category: 'parenting' })).post;
  const c = R.create(post({ title: 'C 30대', category: 'career', lifeStage: '30' })).post;
  const st = T.loadStore();
  st.posts.find(p => p.id === a.id).createdAt = 1000; st.posts.find(p => p.id === b.id).createdAt = 2000; st.posts.find(p => p.id === c.id).createdAt = 3000;
  st.posts.push({ id: 'legacy', title: 'L', body: 'x', type: 'story', category: 'etc' });
  ctx.localStorage.setItem(CM, JSON.stringify(st));
  T.applyFeedParams({});
  assert.deepEqual(J(T.filterFeed().map(p => p.title)), ['C 30대', 'B 육아', 'A 주거', 'L']);
  T.applyFeedParams({ tab: 'foryou' });
  assert.deepEqual(J(T.filterFeed().map(p => p.title)), ['C 30대', 'B 육아', 'A 주거', 'L']);
  T.applyFeedParams({ tab: 'following' });
  assert.equal(T.filterFeed().length, 0);
  T.applyFeedParams({ cat: 'housing' });
  assert.deepEqual(J(T.filterFeed().map(p => p.title)), ['A 주거']);
  T.applyFeedParams({ q: '육아' });
  assert.deepEqual(J(T.filterFeed().map(p => p.title)), ['B 육아']);
  T.applyFeedParams({ tab: 'popular' });
  assert.equal(T.state.tab, 'latest', 'no popularity tab');
});

test('report is stored locally with post id, reason and time only', () => {
  const { R, raw } = app();
  const p = R.create(post()).post;
  assert.equal(R.report('post:' + p.id, '아무 사유').status, 'invalid');
  const r = R.report('post:' + p.id, '스팸·광고');
  assert.equal(r.status, 'ok');
  const rec = raw().reports[0];
  assert.deepEqual(Object.keys(rec).sort(), ['at', 'id', 'reason', 'status', 'target']);
  assert.equal(rec.status, 'local-only');
  assert.equal(R.reported('post:' + p.id), true);
});

test('AI draft: [커뮤니티] context, short excerpt, no auto send, no mutation', () => {
  const { R, T, hub, ctx } = app();
  const p = R.create(post({ body: '가'.repeat(400), lifeStage: '20' })).post;
  const before = ctx.localStorage.getItem(CM);
  hub._test.askAI(T.aiPayload(p));
  const d = JSON.parse(ctx.sessionStorage.getItem('livon.aiPrompt'));
  assert.equal(d.draftOnly, true);
  assert.match(d.q, /^\[커뮤니티\]\n연령대: 20대\n글: 첫 자취 계약 체크\n분야: 주거 · 질문\n요약: 가{100}\n/);
  assert.ok(!d.q.includes('가'.repeat(101)), 'body is not sent in full');
  assert.equal(d.page.topicId, 'cm:' + p.id);
  assert.equal(d.page.url, 'https://www.newon.app/livon/#cm-post-' + p.id);
  assert.equal(ctx.localStorage.getItem(CM), before);
});

test('route state: #cm-home params round-trip; unknown values fall back', () => {
  const { T } = app();
  T.applyFeedParams(T.parseHash('#cm-home?tab=foryou&cat=housing&type=question&stage=20&q=%EC%9E%90%EC%B7%A8').params);
  assert.equal(T.feedHash(), '#cm-home?tab=foryou&cat=housing&type=question&stage=20&q=%EC%9E%90%EC%B7%A8');
  T.applyFeedParams({ tab: 'x', cat: '<b>', type: 'nope', stage: '99' });
  assert.equal(T.feedHash(), '#cm-home');
  assert.equal(T.parseHash('#cm-post-post_abc').id, 'cm-post-post_abc');
  assert.equal(T.topicHref('20s.first-independence'), '#life/20s/first-independence');
});

test('one-time additive migration: categories, stage, saves → LivonPlatform; ids kept; idempotent', () => {
  const legacy = {
    profile: { nick: '나', interests: ['주거·독립'] },
    posts: [
      { id: 'p1', title: '자취 질문', body: 'b', type: 'question', field: '독립·주거', createdAt: 5, authorId: 'local' },
      { id: 'p2', title: '20대 이야기', body: 'b', type: 'story', communityId: 'stage-20', createdAt: 6, authorId: 'local' },
      { id: 'p3', title: '삭제된 글', body: 'b', deleted: true, createdAt: 7 },
    ],
    comments: [{ id: 'c1', postId: 'p1', body: 'x', createdAt: 8 }], likes: { p1: 9 }, saves: ['p1', 'p3'], joined: [], reports: [],
  };
  const { T, raw, saves, ctx } = app({ store: legacy, local: { 'livon.mlStore.v1': { todos: [{ id: 't' }], savedCommunity: [{ id: 'p2', title: '20대 이야기' }] } } });
  T.loadStore();
  const s = raw();
  assert.equal(s.v, 2);
  assert.deepEqual(J(s.posts.map(p => p.id)), ['p1', 'p2', 'p3']);
  assert.equal(s.posts[0].category, 'housing'); assert.equal(s.posts[0].field, '독립·주거');
  assert.equal(s.posts[1].lifeStage, '20');
  assert.deepEqual(J([...saves.keys()].sort()), ['life-hub:community:cm:p1', 'life-hub:community:cm:p2']);
  assert.deepEqual(J(s.saves), []);
  const ml = JSON.parse(ctx.localStorage.getItem('livon.mlStore.v1'));
  assert.deepEqual(J(ml.savedCommunity), []); assert.deepEqual(J(ml.todos), [{ id: 't' }], 'My Life data untouched');
  assert.deepEqual(J(s.comments), J(legacy.comments)); assert.deepEqual(J(s.likes), { p1: 9 });
  const snap = JSON.stringify(raw());
  T.loadStore();
  assert.equal(JSON.stringify(raw()), snap);
  assert.equal(saves.size, 2);
});

test('migration waits for LivonPlatform instead of dropping saves', () => {
  const { T, raw } = app({ store: { posts: [{ id: 'p1', title: 't', body: 'b', field: '기타' }], saves: ['p1'] }, platform: false });
  T.loadStore();
  assert.equal(raw().v, undefined);
  assert.deepEqual(J(raw().saves), ['p1']);
  assert.equal(raw().posts[0].category, 'etc');
});
