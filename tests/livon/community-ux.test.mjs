// LIVON Community UX V1 + Onboarding integration (CU-1 … CU-45 and the A–D isolation checks).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadLivon } from '../../scripts/livon-data-quality.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, 'livon', f), 'utf8');
const J = x => JSON.parse(JSON.stringify(x));
const INDEX = read('index.html'), PAGE = read('community-page.js'), SERVICE = read('community-service.js'), CSS = read('community-page.css');
const CM = 'livon.cmStore.v1';
const K = { stage: 'livon.lifeStage', interests: 'livon.lifeInterests', events: 'livon.lifeEvents', meta: 'livon.personalization.v1', platform: 'livon.platform.v1', ml: 'livon.mlStore.v1' };
const CURATED = ['community-data.js', 'life-events-data.js', 'life-data.js', 'life-topics.json', 'explore-data.js', 'today-data.js'];
const hashFiles = () => CURATED.map(f => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'livon', f))).digest('hex'));
const HASH_BEFORE = hashFiles();
const text = html => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/* The public page as the browser loads it (data platform, personalization, platform saves, community), with a stub
   DOM: the community renders HTML strings into a few hosts, which is what the tests read. */
function cm({ local = {}, raw = {}, blocked = false, hash = '#community' } = {}) {
  const els = {};
  const WANT = ['#community', '[data-lv-cm-feed]', '[data-lv-cm-tabs]', '[data-lv-cm-filters]', '[data-lv-cm-search-meta]', '[data-lv-cm-mine]', '#cm-detail', '[data-lv-cm-detail]', '[data-lv-cm-status]', '[data-lv-cm-rules]', '[data-lv-cm-side]'];
  const mk = () => { const a = {}; return { hidden: false, innerHTML: '', textContent: '', id: '', childElementCount: 0, style: {}, setAttribute(k, v) { a[k] = String(v); }, getAttribute: k => (k in a ? a[k] : null), focus() {}, querySelector: () => null, querySelectorAll: () => [], classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, addEventListener() {} }; };
  const doc = {
    readyState: 'complete', title: 'LIVON', documentElement: { dataset: { lvView: 'community' } }, body: { style: {} }, head: { querySelector: () => null }, activeElement: null,
    getElementById: () => null, querySelector: s => (WANT.includes(s) ? (els[s] = els[s] || mk()) : null), querySelectorAll: () => [],
    addEventListener() {}, contains: () => false, createElement: () => mk(), dispatchEvent: () => true
  };
  const net = [];
  const ctx = loadLivon({
    patch(c) {
      c.document = doc;
      c.location = { hash, origin: 'https://www.newon.app', pathname: '/livon/', hostname: 'www.newon.app' };
      c.scrollTo = () => {}; c.pageYOffset = 0; c.matchMedia = () => ({ matches: true }); c.getComputedStyle = () => ({ getPropertyValue: () => '74px' });
      c.CustomEvent = class { constructor(type) { this.type = type; } };
      c.fetch = (...a) => { net.push(String(a[0])); return Promise.reject(new Error('offline')); };
      c.XMLHttpRequest = function () { net.push('xhr'); throw new Error('no network'); };
      c.navigator = { sendBeacon: u => { net.push('beacon ' + u); return false; } };
      if (blocked) Object.defineProperty(c, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
      vm.runInContext(read('data/livon-storage-guard.js'), c);
      for (const [k, v] of Object.entries(local)) c.localStorage.setItem(k, JSON.stringify(v));
      for (const [k, v] of Object.entries(raw)) c.localStorage.setItem(k, v);
      vm.runInContext(read('data/livon-user-data.js'), c);
    }
  });
  /* a clock that moves 2 s per call: ordered timestamps, and the comment rate limit never interferes */
  vm.runInContext('(function () { var t = 1790000000000; Date.now = function () { t += 2000; return t; }; })()', ctx);
  for (const f of ['livon-platform.js', 'community-service.js', 'community-page.js']) vm.runInContext(read(f), ctx, { filename: f });
  const C = ctx.LivonCommunity, T = C._test;
  return {
    ctx, R: ctx.LivonCommunityRepo, T, S: ctx.LivonCommunityService, PZ: ctx.LivonPersonalization, P: ctx.LivonPlatform, net, els,
    raw: () => JSON.parse(ctx.localStorage.getItem(CM) || 'null'),
    get: k => { const v = ctx.localStorage.getItem(k); return v == null ? null : JSON.parse(v); },
    show: h => { ctx.location.hash = '#' + h; C.onShow(h); },
    feed: () => (els['[data-lv-cm-feed]'] || {}).innerHTML || '', filters: () => (els['[data-lv-cm-filters]'] || {}).innerHTML || '',
    detail: () => (els['[data-lv-cm-detail]'] || {}).innerHTML || '', mine: () => (els['[data-lv-cm-mine]'] || {}).innerHTML || '',
    titles: () => J(T.filterFeed().map(p => p.title))
  };
}
const POSTS = {
  lease: { type: 'question', title: '첫 자취 계약 체크', body: '계약서에서 무엇을 확인하셨나요? 보증금 Deposit 관련', tags: '자취, 계약', category: 'housing', lifeStage: '20', lifeEvent: 'independent', lifeTopicId: '20s.first-independence' },
  parenting: { type: 'experience', title: '육아 휴직 복직 경험', body: '어린이집 적응 기간 이야기', tags: '육아, 복직', category: 'parenting', lifeStage: '30', lifeEvent: 'parenting' },
  salary: { type: 'tip', title: '월급 관리 팁', body: '통장 쪼개기 Budget 방법', tags: '저축', category: 'money', lifeStage: '20', lifeEvent: 'first-salary' },
  checkup: { type: 'review', title: '건강검진 후기', body: '국가 검진 예약 과정', tags: '건강검진', category: 'health', lifeStage: '50', lifeEvent: 'checkup' },
  center: { type: 'info', title: '복지관 프로그램 정보', body: '동네 복지관 강좌 신청', tags: '복지관', category: 'daily', lifeStage: '70' },
  walk: { type: 'story', title: '주말 산책 일상', body: '한강 Walk 다녀왔어요', tags: '산책' },
  interview: { type: 'question', title: '첫 취업 면접 질문', body: '면접에서 자주 나오는 질문이 궁금해요', tags: '면접', category: 'career', lifeStage: '20', lifeEvent: 'first-job', lifeTopicId: '20s.first-job' }
};
/* seven public posts + one draft + one private post */
function seed(a) {
  const ids = {};
  for (const [k, v] of Object.entries(POSTS)) { const r = a.R.create(v); assert.equal(r.status, 'ok', k); ids[k] = r.post.id; }
  ids.draft = a.R.create({ type: 'story', title: '임시 글', body: '', draft: true }).post.id;
  ids.secret = a.R.create({ type: 'story', title: '비공개 메모', body: '나만 보는 글', visibility: 'private' }).post.id;
  return ids;
}

test('CU-1 audit: every community function is classified and the classification is documented', () => {
  const doc = fs.readFileSync(path.join(ROOT, 'docs/livon/LIVON_COMMUNITY_UX.md'), 'utf8');
  const rows = [...doc.matchAll(/^\| ([^|]+) \| (WORKING|PARTIAL|PLACEHOLDER|BACKEND_REQUIRED|BROKEN) \| (WORKING|PARTIAL|PLACEHOLDER|BACKEND_REQUIRED|BROKEN) \|/gm)].map(m => ({ name: m[1].trim(), before: m[2], after: m[3] }));
  for (const name of ['Community Home', 'For You', '최신', '팔로잉', 'Post cards', 'Post detail', 'Create', 'Draft', 'Edit', 'Delete', 'Reaction', 'Save', 'Comments', 'Replies', 'Search', 'Filters', 'Profile / local activity', 'Follow', 'Related content', 'Report', 'Empty states', 'Error states', 'Storage', 'Deep links', 'Mobile', 'Keyboard', 'Accessibility']) {
    assert.ok(rows.some(r => r.name === name), 'audit row missing: ' + name);
  }
  assert.ok(rows.every(r => r.after !== 'BROKEN' && r.after !== 'PLACEHOLDER'), 'nothing is left broken or as a placeholder');
  assert.deepEqual(rows.filter(r => r.after === 'BACKEND_REQUIRED').map(r => r.name).sort(), ['Follow', '팔로잉'], 'only following needs a backend, and says so');
});

test('CU-2 feed: an empty device shows no invented posts; three tabs; cards come from the local store', () => {
  const a = cm();
  a.show('cm-home');
  assert.equal(a.R.visiblePosts().length, 0);
  assert.match(text(a.feed()), /아직 이 기기에 작성된 글이 없습니다/);
  assert.deepEqual([...(a.els['[data-lv-cm-tabs]'].innerHTML.matchAll(/data-lv-cm-tab="(\w+)"/g))].map(m => m[1]), ['foryou', 'latest', 'following']);
  seed(a);
  a.show('cm-home');
  assert.equal(a.titles().length, 7, 'draft and private posts are not in the feed');
  assert.equal((a.feed().match(/<article class="lv-cm-card/g) || []).length, 7);
  assert.equal(a.ctx.LivonCommunityData.posts, undefined, 'no curated posts exist');
});

test('CU-3 For You: the onboarding profile ranks the feed, each boosted card says why; no profile → generic order', () => {
  const a = cm({ local: { [K.stage]: '30', [K.interests]: ['가족'], [K.events]: ['parenting'] } });
  seed(a);
  a.show('cm-home?tab=foryou');
  assert.equal(a.titles()[0], '육아 휴직 복직 경험');
  const sig = a.T.userSignals(a.T.loadStore());
  const f = a.T.forYou(a.R.visiblePosts().find(p => p.title === '육아 휴직 복직 경험'), sig);
  assert.deepEqual(J(f.reasons.slice(0, 2).map(r => r.type + ':' + r.value)), ['event:parenting', 'stage:30']);
  assert.ok(f.score >= 7);
  assert.match(a.feed(), /<p class="lv-cm-card__why">선택한 ‘육아’ 관련<\/p>/);
  assert.match(text(a.feed()), /내 맞춤 설정\(연령대·관심 분야·Life Event\)에 맞는 글을 먼저 보여드려요\. 이 기기 안에서만 계산해요\./);
  for (const p of a.R.visiblePosts().filter(x => x.lifeStage && x.lifeStage !== '30')) assert.equal(a.T.forYouScore(p, sig), 0, 'another band is never boosted: ' + p.title);
  assert.equal(JSON.stringify(a.titles()), JSON.stringify(a.titles()), 'deterministic');
  const b = cm(); seed(b);
  b.show('cm-home?tab=foryou');
  const foryou = b.titles();
  assert.doesNotMatch(b.feed(), /lv-cm-card__why/);
  assert.match(b.feed(), /맞춤 설정이 없어 최신순으로 보여드려요/);
  b.show('cm-home?tab=latest');
  assert.deepEqual(foryou, b.titles(), 'generic feed = latest order');
  assert.doesNotMatch(SERVICE + PAGE, /openai|인기순|trending|많이 본/i, 'no fake AI or popularity ranking');
});

test('CU-4 latest: strictly by the stored creation time, undated legacy posts last', () => {
  const a = cm(); seed(a);
  a.show('cm-home');
  const st = a.raw();
  const order = st.posts.filter(p => !p.draft && p.visibility !== 'private').sort((x, y) => y.createdAt - x.createdAt).map(p => p.title);
  assert.deepEqual(a.titles(), order);
  assert.equal(a.titles()[0], '첫 취업 면접 질문', 'the newest post is first');
  st.posts.push({ id: 'legacy', title: '날짜 없는 글', body: 'x', type: 'story', category: 'etc' });
  a.ctx.localStorage.setItem(CM, JSON.stringify(st));
  assert.equal(a.titles().pop(), '날짜 없는 글');
});

test('CU-5 following: an honest fallback — no simulated people, posts or counts', () => {
  const a = cm(); seed(a);
  a.show('cm-home?tab=following');
  assert.equal(a.titles().length, 0);
  assert.match(text(a.feed()), /아직 팔로우한 사용자가 없습니다\. 다른 사용자 프로필과 팔로우는 준비 중입니다\./);
  assert.doesNotMatch(a.feed(), /lv-cm-card/);
  assert.match(a.feed(), /href="#cm-home\?tab=latest">최신 글 보기/);
});

test('CU-6 post cards: type, labels, author, excerpt, tags, actions — no numbers that were not counted here', () => {
  const a = cm(); const ids = seed(a);
  const store = a.T.loadStore(), p = store.posts.find(x => x.id === ids.lease);
  const h = a.T.cardHtml(p, store), t = text(h);
  assert.match(h, /<article class="lv-cm-card lv-cm-card--question" aria-labelledby="lv-cm-t-/);
  for (const part of ['질문', '주거', '20대', '독립', '나', '첫 자취 계약 체크', '#자취', '#계약', '공감하기', '댓글', '저장']) assert.ok(t.includes(part), 'card shows ' + part);
  assert.match(h, /<h3 id="lv-cm-t-[^"]+"><a href="#cm-post-[^"]+" data-lv-cm-go>첫 자취 계약 체크<\/a><\/h3>/);
  assert.match(h, /data-lv-cm-like="[^"]+" aria-pressed="false"/);
  assert.doesNotMatch(t, /조회|좋아요 \d|공감 \d|팔로워/, 'no views, like totals or followers');
  assert.match(t, /답변 대기/, 'a question without comments says so instead of showing 0');
});

test('CU-7 create: type, title and body are enough; optional Life Stage, Life Event, tags and topic are kept', () => {
  const a = cm();
  const min = a.R.create({ type: 'story', title: '안녕하세요', body: '첫 글입니다' });
  assert.equal(min.status, 'ok');
  assert.deepEqual([min.post.type, min.post.category, min.post.lifeStage, min.post.lifeEvent, min.post.authorId], ['story', 'etc', '', '', 'local']);
  assert.deepEqual([...a.S.TYPES], ['question', 'experience', 'info', 'review', 'tip', 'story'], 'the six existing types');
  for (const t of a.S.TYPES) assert.ok(a.ctx.LivonCommunityData.typeLabels[t], t);
  const full = a.R.create(POSTS.interview).post;
  assert.deepEqual([full.lifeStage, full.lifeEvent, full.lifeTopicId, J(full.tags)], ['20', 'first-job', '20s.first-job', ['면접']]);
  const odd = a.R.create({ type: 'tip', title: 't', body: 'b', lifeStage: '25', lifeEvent: 'no-such-event', lifeTopicId: '../x' }).post;
  assert.deepEqual([odd.lifeStage, odd.lifeEvent, odd.lifeTopicId], ['', '', ''], 'unknown stage / event / topic are dropped, not an error');
  assert.match(PAGE, /<span>분야 \(선택\)<\/span>/);
  assert.match(PAGE, /<span>Life Event<\/span><select name="lifeEvent">/);
  assert.ok(a.T.eventOptions('20', '').includes('value="first-job"') && !a.T.eventOptions('20', '').includes('value="later-life"'), 'events of the chosen band');
  assert.ok(a.T.eventOptions('', '').includes('value="later-life"'), 'whole catalog without a band');
});

test('CU-8 draft: autosave, restore, discard — and the named draft stays out of feed and search', () => {
  const a = cm();
  assert.equal(a.R.composeDraft(), null);
  assert.equal(a.R.saveComposeDraft({ type: 'question', title: '쓰다 만 글', body: '여기까지 썼어요', tags: '초안', lifeStage: '20', lifeEvent: 'first-job' }).status, 'ok');
  const b = cm({ local: { [CM]: a.raw() } });   // a reload: the text is still there
  const d = b.R.composeDraft();
  assert.deepEqual([d.type, d.title, d.body, d.tags, d.lifeStage, d.lifeEvent], ['question', '쓰다 만 글', '여기까지 썼어요', '초안', '20', 'first-job']);
  assert.equal(b.R.visiblePosts().length, 0, 'an unsent draft is not a post');
  assert.equal(b.R.searchablePosts().length, 0);
  assert.equal(b.R.clearComposeDraft(), true);
  assert.equal(b.R.composeDraft(), null);
  assert.equal(b.R.saveComposeDraft({ title: '  ', body: '' }).draft, null, 'nothing to keep → no draft');
  assert.equal(b.R.create({ type: 'story', title: '임시 글', body: '', draft: true }).status, 'ok');
  assert.equal(b.R.drafts().length, 1);
  assert.equal(b.R.visiblePosts().length, 0);
  assert.match(PAGE, /function scheduleAutosave\(\)[\s\S]{0,200}setTimeout\(autosaveNow, 500\)/);
  assert.match(PAGE, /data-lv-cm-restored>작성하던 내용을 불러왔어요\. <button type="button" class="lv-cm-text-btn" data-lv-cm-discard-draft>지우고 새로 쓰기<\/button>/);
  assert.match(PAGE, /if \(!editing\) Repo\.clearComposeDraft\(\);/, 'publishing empties the autosave slot');
  assert.match(PAGE, /data-lv-cm-autosave role="status" aria-live="polite"/);
});

test('CU-9 validation: empty, whitespace only, too long, invalid type, malformed tag', () => {
  const a = cm(), ok = { type: 'tip', title: '제목', body: '본문' };
  const f = over => a.R.create(Object.assign({}, ok, over));
  assert.deepEqual([f({ title: '' }).field, f({ title: '   \n ' }).field, f({ body: '' }).field, f({ body: ' \t ' }).field], ['title', 'title', 'body', 'body']);
  assert.equal(f({ title: 'x'.repeat(81) }).field, 'title');
  assert.equal(f({ title: 'x'.repeat(80) }).status, 'ok');
  assert.equal(f({ body: 'x'.repeat(5001) }).field, 'body');
  assert.equal(f({ type: 'poll' }).field, 'type');
  assert.equal(f({ type: '<script>' }).field, 'type');
  for (const bad of ['<b>굵게</b>', 'a"b', "x'y", 'tag/and', 'a&b', '😀😀']) assert.equal(f({ tags: bad }).field, 'tags', bad);
  assert.equal(f({ tags: 'a,b,c,d,e,f,g,h,i' }).field, 'tags');
  assert.equal(f({ tags: 'x'.repeat(21) }).field, 'tags');
  assert.deepEqual(J(f({ tags: ' #자취 , 첫 계약,자취, ' }).post.tags), ['자취', '첫 계약'], 'trimmed, # removed, duplicates merged');
  assert.equal(a.R.visiblePosts().length, 2, 'invalid input created nothing');
  for (const r of [f({ title: '' }), f({ type: 'poll' })]) assert.ok(r.msg && r.status === 'invalid');
});

test('CU-10 detail: the whole post, its labels, actions and linked sections', () => {
  const a = cm(); const ids = seed(a);
  a.show('cm-post-' + ids.interview);
  const h = a.detail(), t = text(h);
  assert.match(h, /<h2 class="lv-cm-title lv-cm-title--md" id="lv-cm-detail-title" tabindex="-1">첫 취업 면접 질문<\/h2>/);
  for (const part of ['질문', '커리어', '20대', '첫 취업', '내 글', '면접에서 자주 나오는 질문이 궁금해요', '#면접', '공감하기', '댓글 쓰기', '공유', '신고', '수정', '삭제', '이어서 보기', '관련 LIVON 정보', '댓글 0', '아직 댓글이 없습니다']) assert.ok(t.includes(part), 'detail shows ' + part);
  assert.match(h, /href="#cm-home\?event=first-job">첫 취업<\/a>/);
  assert.match(h, /← 피드로/);
  assert.equal(a.ctx.document.title, '첫 취업 면접 질문 · 커뮤니티 · LIVON');
});

test('CU-11 edit: only a local post, fields update, creation time and id stay', () => {
  const a = cm(); const ids = seed(a);
  const before = a.raw().posts.find(p => p.id === ids.walk);
  const u = a.R.update(ids.walk, { type: 'tip', title: '주말 산책 코스', body: '한강 코스 추천', tags: '산책, 한강', lifeStage: '40', lifeEvent: 'habit-health' });
  assert.equal(u.status, 'ok');
  const after = a.raw().posts.find(p => p.id === ids.walk);
  assert.deepEqual([after.id, after.createdAt, after.title, after.type, after.lifeStage, after.lifeEvent], [before.id, before.createdAt, '주말 산책 코스', 'tip', '40', 'habit-health']);
  assert.ok(after.updatedAt > before.updatedAt);
  assert.equal(a.R.update(ids.walk, { type: 'tip', title: '', body: 'x' }).field, 'title');
  assert.equal(a.R.update('nope', { type: 'tip', title: 't', body: 'b' }).status, 'missing');
  a.show('cm-post-' + ids.walk);
  assert.match(text(a.detail()), /수정됨/);
});

test('CU-12 delete: the post leaves feed, search, saves, comments and reactions — nothing dangles', () => {
  const a = cm(); const ids = seed(a);
  a.R.addComment(ids.lease, '저도 궁금해요'); a.R.toggleReaction(ids.lease);
  a.P.saveItem({ id: a.T.saveId(ids.lease), title: '첫 자취 계약 체크', type: 'life-community', href: '#cm-post-' + ids.lease });
  a.R.report('post:' + ids.lease, 'spam');
  assert.equal(a.R.isSaved(ids.lease), true);
  assert.equal(a.R.remove(ids.lease).status, 'ok');
  const st = a.raw();
  assert.ok(!st.posts.some(p => p.id === ids.lease));
  assert.equal(st.comments.filter(c => c.postId === ids.lease).length, 0);
  assert.equal(st.likes[ids.lease], undefined);
  assert.equal(a.R.isSaved(ids.lease), false, 'removed from the shared saves (My Life)');
  assert.ok(!a.R.searchablePosts().some(p => p.id === ids.lease));
  a.show('cm-home?q=자취');
  assert.deepEqual(a.titles(), []);
  assert.equal(a.R.toggleReaction(ids.lease), false, 'no reaction can be attached to a deleted post');
  assert.equal(a.raw().likes[ids.lease], undefined);
  assert.equal(a.R.addComment(ids.lease, '늦은 댓글').status, 'missing');
  assert.deepEqual(J(a.R.reports().map(r => [r.targetId, r.exists])), [[ids.lease, false]], 'the report record remains and says the item is gone');
  a.show('cm-post-' + ids.lease);
  assert.match(text(a.detail()), /글을 찾을 수 없습니다/);
});

test('CU-13 curated mutation protection: a local action can change LOCAL records only', () => {
  const a = cm(); const ids = seed(a);
  const curated = JSON.stringify(a.ctx.LivonCommunityData), events = JSON.stringify(a.ctx.LivonLifeEvents);
  const st = a.raw();
  st.posts.push({ id: 'remote1', title: '다른 사람 글', body: 'x', type: 'story', authorId: 'user-9', createdAt: 5 }, { id: 'cur1', title: '운영 글', body: 'x', type: 'info', authorId: 'livon', origin: 'CURATED', createdAt: 6 });
  st.comments.push({ id: 'rc1', postId: ids.walk, body: '남의 댓글', authorId: 'user-9', createdAt: 7 });
  a.ctx.localStorage.setItem(CM, JSON.stringify(st));
  const S = a.S, find = id => a.T.loadStore().posts.find(p => p.id === id);
  assert.deepEqual([S.originOf(find('remote1')), S.originOf(find('cur1')), S.originOf(find(ids.walk))], ['REMOTE', 'CURATED', 'LOCAL']);
  for (const id of ['remote1', 'cur1']) {
    assert.equal(a.R.update(id, { type: 'story', title: '바꿈', body: '바꿈' }).status, 'forbidden');
    assert.equal(a.R.remove(id).status, 'forbidden');
  }
  assert.equal(a.R.editComment('rc1', '바꿈').status, 'forbidden');
  assert.equal(a.R.removeComment('rc1').status, 'forbidden');
  a.show('cm-post-cur1');
  assert.doesNotMatch(a.detail(), /data-lv-cm-edit="cur1"|data-lv-cm-del-post="cur1"/, 'no edit / delete controls on a read-only post');
  a.R.toggleReaction('cur1'); a.R.addComment('cur1', '댓글'); a.R.report('post:cur1', 'other'); a.R.resetLocal();
  assert.equal(JSON.stringify(a.ctx.LivonCommunityData), curated, 'curated community data is identical after every kind of local action');
  assert.equal(JSON.stringify(a.ctx.LivonLifeEvents), events);
  assert.deepEqual(hashFiles(), HASH_BEFORE, 'curated files untouched');
});

test('CU-14 reaction: on / off, kept after a reload, never a total', () => {
  const a = cm(); const ids = seed(a);
  assert.equal(a.R.toggleReaction(ids.walk), true);
  const b = cm({ local: { [CM]: a.raw() } });
  assert.equal(b.R.reacted(b.T.loadStore(), ids.walk), true, 'kept after reload');
  assert.match(b.T.cardHtml(b.T.loadStore().posts.find(p => p.id === ids.walk), b.T.loadStore()), /aria-pressed="true" class="is-on">공감했어요/);
  assert.equal(b.R.toggleReaction(ids.walk), false);
  assert.equal(b.raw().likes[ids.walk], undefined);
  assert.equal(typeof a.raw().likes[ids.walk], 'number', 'a timestamp, not a counter');
  assert.doesNotMatch(PAGE, /likeCount|likes\.length|공감 수/);
});

test('CU-15 save: the shared LivonPlatform store (My Life), unsave, reload', () => {
  const a = cm(); const ids = seed(a);
  const p = a.raw().posts.find(x => x.id === ids.salary);
  a.P.saveItem({ id: a.T.saveId(p.id), title: p.title, type: 'life-community', href: '#cm-post-' + p.id, data: { kind: 'community', refId: 'cm:' + p.id } });
  assert.equal(a.R.isSaved(p.id), true);
  assert.deepEqual(J(a.R.savedPosts().map(x => x.title)), ['월급 관리 팁']);
  assert.ok(a.get(K.platform).saves.some(s => s.id === 'life-hub:community:cm:' + p.id), 'one store for every menu');
  const b = cm({ local: { [CM]: a.raw(), [K.platform]: a.get(K.platform) } });
  assert.equal(b.R.isSaved(p.id), true, 'kept after reload');
  b.P.removeSave(b.T.saveId(p.id));
  assert.equal(b.R.isSaved(p.id), false);
  assert.match(b.T.cardHtml(b.T.loadStore().posts.find(x => x.id === p.id), b.T.loadStore()), /data-lh-save="community" data-lh-id="cm:[^"]+"[^>]*aria-pressed="false"/);
});

test('CU-16 comments: write, edit, delete on local comments', () => {
  const a = cm(); const ids = seed(a);
  const c = a.R.addComment(ids.walk, '  좋은 코스네요  ');
  assert.equal(c.status, 'ok');
  assert.equal(c.comment.body, '좋은 코스네요');
  assert.equal(a.R.editComment(c.comment.id, '정말 좋은 코스네요').status, 'ok');
  const store = a.T.loadStore(), post = store.posts.find(p => p.id === ids.walk);
  const h = a.T.commentsHtml(post, store);
  assert.match(text(h), /댓글 1 나 · [\d.]+ · 수정됨 정말 좋은 코스네요 답글 수정 삭제 신고/);
  assert.equal(a.R.removeComment(c.comment.id).status, 'ok');
  assert.equal(a.R.comments(ids.walk).length, 0);
  assert.match(text(a.T.commentsHtml(post, a.T.loadStore())), /아직 댓글이 없습니다/);
  assert.equal(a.ctx.LivonCommunityData.comments, undefined, 'no curated comments exist or were added');
});

test('CU-17 replies: one level only — a reply to a reply joins the same thread', () => {
  const a = cm(); const ids = seed(a);
  const root = a.R.addComment(ids.walk, '첫 댓글').comment;
  const r1 = a.R.addComment(ids.walk, '답글 1', root.id).comment;
  const r2 = a.R.addComment(ids.walk, '답글의 답글', r1.id).comment;
  assert.deepEqual([r1.parentId, r2.parentId], [root.id, root.id]);
  const store = a.T.loadStore(), h = a.T.commentsHtml(store.posts.find(p => p.id === ids.walk), store);
  assert.equal((h.match(/<ul class="lv-cm-replies"[^>]*>/g) || []).length, 1, 'a single nested list');
  assert.equal((h.match(/class="lv-cm-comment is-reply"/g) || []).length, 2);
  assert.doesNotMatch(h.slice(h.indexOf('lv-cm-replies')), /data-lv-cm-reply="/, 'no reply button on a reply');
  // deleting a comment that has replies keeps the thread readable
  assert.equal(a.R.removeComment(root.id).kept, true);
  assert.match(text(a.T.commentsHtml(a.T.loadStore().posts.find(p => p.id === ids.walk), a.T.loadStore())), /삭제된 댓글입니다\. .*답글 1/);
  assert.match(CSS, /@media \(max-width: 480px\) \{[\s\S]*?\.lv-cm-replies \{ margin-left: 0\.35rem; padding-left: 0\.6rem; \}/);
});

test('CU-18 comment validation: empty, whitespace, too long, missing post', () => {
  const a = cm(); const ids = seed(a);
  for (const bad of ['', '   ', '\n\t']) assert.equal(a.R.addComment(ids.walk, bad).status, 'invalid', JSON.stringify(bad));
  assert.equal(a.R.addComment(ids.walk, 'x'.repeat(1001)).status, 'invalid');
  assert.equal(a.R.addComment(ids.walk, 'x'.repeat(1000)).status, 'ok');
  assert.equal(a.R.addComment('nope', '댓글').status, 'missing');
  const c = a.R.addComment(ids.walk, '수정 전').comment;
  assert.equal(a.R.editComment(c.id, '  ').status, 'invalid');
  assert.equal(a.R.editComment('nope', 'x').status, 'missing');
  assert.equal(a.S.validateComment('x'.repeat(1001)).msg, '댓글은 1000자 이하로 입력해 주세요.');
});

const QUERIES = [
  ['자취', ['첫 자취 계약 체크']], ['계약서', ['첫 자취 계약 체크']], ['#자취', ['첫 자취 계약 체크']], ['deposit', ['첫 자취 계약 체크']], ['DEPOSIT', ['첫 자취 계약 체크']],
  ['독립', ['첫 자취 계약 체크']], ['주거', ['첫 자취 계약 체크']], ['질문', ['첫 취업 면접 질문', '첫 자취 계약 체크']], ['후기', ['건강검진 후기']], ['생활 팁', ['월급 관리 팁']],
  ['20대', ['첫 취업 면접 질문', '월급 관리 팁', '첫 자취 계약 체크']], ['30대', ['육아 휴직 복직 경험']], ['70대', ['복지관 프로그램 정보']], ['첫 취업', ['첫 취업 면접 질문']], ['첫취업', ['첫 취업 면접 질문']],
  ['육아', ['육아 휴직 복직 경험']], ['walk', ['주말 산책 일상']], ['  월급   관리  ', ['월급 관리 팁']], ['월급관리', ['월급 관리 팁']], ['건강 검진', ['건강검진 후기']],
  ['검진 예약', ['건강검진 후기']], ['복지', ['복지관 프로그램 정보']], ['산책 한강', ['주말 산책 일상']], ['면접 20대', ['첫 취업 면접 질문']], ['일상', ['주말 산책 일상']],
  ['경험', ['육아 휴직 복직 경험']], ['첫 월급', ['월급 관리 팁']], ['건강검진 50대', ['건강검진 후기']], ['Budget', ['월급 관리 팁']], ['어린이집', ['육아 휴직 복직 경험']],
  ['없는검색어', []], ['ㅋㅋㅋ', []], ['<script>', []], ['임시', []], ['비공개', []], ['육아 70대', []]
];
test('CU-19 search: title, body, type, tags, Life Stage and Life Event — Korean, partial, spacing, case (' + QUERIES.length + ' queries)', () => {
  const a = cm(); seed(a);
  assert.ok(QUERIES.length >= 30);
  for (const [q, want] of QUERIES) {
    a.T.applyFeedParams({ q });
    assert.deepEqual(a.titles(), want, 'query ' + JSON.stringify(q));
  }
  assert.equal(a.S.norm('  Ａ  b\n C '), 'ａ b c');
  assert.equal(a.S.matchesQuery({ title: '카페', body: '' }, '카페'.normalize('NFD')), true, 'decomposed Hangul matches');
});

test('CU-20 zero search: a clear empty state with a way out, and nothing invented', () => {
  const a = cm(); seed(a);
  a.show('cm-home?q=' + encodeURIComponent('없는검색어'));
  assert.deepEqual(a.titles(), []);
  const t = text(a.feed());
  assert.match(t, /검색 결과가 없습니다\. 다른 주제나 검색어로 찾아보세요\. 필터 초기화 다른 주제 탐색/);
  assert.doesNotMatch(a.feed(), /lv-cm-card/);
  assert.match(text(a.els['[data-lv-cm-search-meta]'].innerHTML), /‘없는검색어’ · 게시글 0/);
  a.show('cm-home?q=' + encodeURIComponent('<img src=x onerror=1>'));
  assert.doesNotMatch(a.els['[data-lv-cm-search-meta]'].innerHTML, /<img/, 'the query is shown as text');
});

test('CU-21 filters: post type, Life Stage, Life Event — alone, combined, with search, in the URL', () => {
  const a = cm(); seed(a);
  const set = p => { a.T.applyFeedParams(p); return a.titles(); };
  assert.deepEqual(set({ type: 'question' }), ['첫 취업 면접 질문', '첫 자취 계약 체크']);
  assert.deepEqual(set({ stage: '20' }), ['첫 취업 면접 질문', '월급 관리 팁', '첫 자취 계약 체크']);
  assert.deepEqual(set({ event: 'first-job' }), ['첫 취업 면접 질문']);
  assert.deepEqual(set({ type: 'question', stage: '20', event: 'independent' }), ['첫 자취 계약 체크']);
  assert.deepEqual(set({ stage: '20', q: '팁' }), ['월급 관리 팁']);
  assert.deepEqual(set({ type: 'review', stage: '20' }), []);
  a.T.applyFeedParams({ tab: 'foryou', type: 'tip', stage: '20', event: 'first-salary', q: '월급' });
  const h = a.T.feedHash();
  assert.equal(h, '#cm-home?tab=foryou&type=tip&stage=20&event=first-salary&q=' + encodeURIComponent('월급'));
  a.T.applyFeedParams({});
  a.T.applyFeedParams(a.T.parseHash(h).params);
  assert.deepEqual([a.T.state.tab, a.T.state.type, a.T.state.stage, a.T.state.event, a.T.state.q], ['foryou', 'tip', '20', 'first-salary', '월급']);
  a.show('cm-home?stage=20');
  assert.match(a.filters(), /<span>글 유형<\/span><select data-lv-cm-type-filter>/);
  assert.match(a.filters(), /<span>라이프 스테이지<\/span><select data-lv-cm-stage-filter>/);
  assert.match(a.filters(), /<span>Life Event<\/span><select data-lv-cm-event-filter><option value="">모든 Life Event<\/option>/);
  assert.ok(a.filters().includes('value="first-job"') && !a.filters().includes('value="later-life"'), 'events follow the chosen band');
});

test('CU-22 profile / local activity: what was done here — not an account profile', () => {
  const a = cm(); const ids = seed(a);
  a.R.toggleReaction(ids.walk); a.R.addComment(ids.walk, '좋아요');
  a.P.saveItem({ id: a.T.saveId(ids.salary), title: '월급 관리 팁', type: 'life-community', href: '#cm-post-' + ids.salary });
  a.show('cm-mine');
  const act = a.R.activity();
  assert.deepEqual([act.posts.length, act.drafts.length, act.comments.length, act.reacted.length], [8, 1, 1, 1]);
  const t = text(a.mine());
  for (const part of ['내가 작성한 글 8', '임시 저장 글 1', '저장한 글 1', '공감한 글 1', '내가 작성한 댓글 1', '신고 기록 0', '표시 이름']) assert.ok(t.includes(part), 'activity shows ' + part);
  assert.match(t, /이 기기에서 쓰는 이름입니다\. 계정이 아니며, 프로필 사진·팔로워 기능은 준비 중입니다\./);
  assert.match(t, /실명·연락처·주소는 적지 마세요/);
  assert.doesNotMatch(a.mine(), /<img|팔로워 \d|팔로잉 \d|type="file"/, 'no photo, no follower numbers');
  assert.equal(a.raw().profile.nick, '나', 'no real name is asked or generated');
});

test('CU-23 follow: unavailable without accounts, behind an interface a remote adapter can replace', () => {
  const a = cm(); seed(a);
  assert.deepEqual(J(a.R.follows()), { available: false, status: 'ACCOUNT_REQUIRED', list: [] });
  assert.deepEqual(J(a.S.adapter().setFollow('user-1', true)), { status: 'unavailable', reason: 'ACCOUNT_REQUIRED' });
  a.show('cm-mine');
  assert.match(text(a.mine()), /팔로우 다른 사용자 계정이 연결되지 않아 팔로우·팔로워가 없습니다\./);
  assert.equal(a.raw().following, undefined, 'no local follow list is simulated');
  assert.ok(a.S.ADAPTER_METHODS.includes('follows') && a.S.ADAPTER_METHODS.includes('setFollow'));
});

test('CU-24 related content: only real relations (the post topic and Life Event) — nothing guessed from text', () => {
  const a = cm(); const ids = seed(a);
  const post = id => a.T.loadStore().posts.find(p => p.id === id);
  const repo = a.ctx.LivonScreenData.repository();
  const rel = J(a.S.relatedContent(post(ids.interview)));
  assert.ok(rel.length >= 4 && rel.length <= 6);
  assert.deepEqual(rel[0], { id: 'topic:20s.first-job', title: '첫 취업 준비', href: '#life/20s/first-job', kind: '주제', external: false });
  const linked = new Set(Object.values(repo.getById('topic:20s.first-job').relations).flat().concat(['topic:20s.first-job']));
  for (const x of rel) {
    const e = repo.getById(x.id);
    assert.ok(e && e.title === x.title, 'a real record: ' + x.id);
    assert.ok(linked.has(x.id) || (e.lifeEvents || []).includes('first-job'), 'really linked: ' + x.id);
    assert.match(x.href, /^(#|https:\/\/)/);
  }
  assert.ok(new Set(rel.map(x => x.kind)).size >= 3, 'guide / policy / service / program kinds: ' + rel.map(x => x.kind));
  // Life Event only → the topics written for that event, in the post's band
  const ev = J(a.S.relatedContent(post(ids.parenting)));
  assert.ok(ev.length >= 1 && ev.every(x => /^topic:30s\./.test(x.id)), ev.map(x => x.id).join());
  // no relation → nothing, and the page says so
  assert.deepEqual(J(a.S.relatedContent(post(ids.walk))), []);
  assert.match(text(a.T.relatedInfoHtml(post(ids.walk))), /관련 LIVON 정보 이 글에 연결된 LIVON 정보가 없습니다\./);
  assert.match(a.T.relatedInfoHtml(post(ids.interview)), /<span class="lv-cm-badge">주제<\/span> <a href="#life\/20s\/first-job">첫 취업 준비<\/a>/);
  assert.match(a.T.relatedInfoHtml(post(ids.interview)), /target="_blank" rel="noopener noreferrer"/, 'official external links open safely');
});

test('CU-25 report: five reasons, a local record, never described as sent', () => {
  const a = cm(); const ids = seed(a);
  assert.deepEqual(J(a.S.REPORT_REASONS.map(r => r.label)), ['스팸', '부적절한 콘텐츠', '괴롭힘/비방', '잘못된 정보', '기타']);
  assert.equal(a.R.report('post:' + ids.walk, '').status, 'invalid');
  assert.equal(a.R.report('post:' + ids.walk, '아무 사유').status, 'invalid');
  assert.equal(a.R.report('post:nope', 'spam').status, 'missing');
  assert.equal(a.R.report('user:1', 'spam').status, 'invalid');
  const r = a.R.report('post:' + ids.walk, 'harassment');
  assert.equal(r.status, 'ok');
  assert.deepEqual(Object.keys(a.raw().reports[0]).sort(), ['at', 'id', 'reason', 'reasonId', 'status', 'target'], 'target, reason and time only — no personal data');
  assert.deepEqual([r.report.reason, r.report.reasonId, r.report.status], ['괴롭힘/비방', 'harassment', 'local-only']);
  const c = a.R.addComment(ids.walk, '댓글').comment;
  assert.equal(a.R.report('comment:' + c.id, 'misinformation').status, 'ok');
  assert.match(PAGE, /신고는 이 기기에만 기록됩니다\. 운영자나 서버로 전송되지 않으며/);
  assert.match(PAGE, /신고를 이 기기에 기록했습니다\. 운영자나 서버로 전송되지는 않습니다\./);
  assert.doesNotMatch(PAGE.replace(/전송되지/g, ''), /운영팀에 전달|신고가 접수|운영자에게 전송|전송되었|검토 후 조치/, 'no claim that a report reached anyone');
  assert.deepEqual(a.net, []);
});

test('CU-26 report dedupe: the same item + the same reason is recorded once', () => {
  const a = cm(); const ids = seed(a);
  assert.equal(a.R.report('post:' + ids.walk, 'spam').status, 'ok');
  const dup = a.R.report('post:' + ids.walk, 'spam');
  assert.equal(dup.status, 'duplicate');
  assert.equal(dup.msg, '같은 사유로 이미 기록한 신고예요.');
  assert.equal(a.R.report('post:' + ids.walk, '스팸').status, 'duplicate', 'by label too');
  assert.equal(a.R.report('post:' + ids.walk, '스팸·광고').status, 'duplicate', 'and by the earlier build’s label');
  assert.equal(a.R.report('post:' + ids.walk, 'other').status, 'ok', 'a different reason is a different report');
  assert.equal(a.R.report('post:' + ids.lease, 'spam').status, 'ok', 'a different post too');
  assert.equal(a.raw().reports.length, 3);
});

function admin(storeRaw) {
  const ctx = loadLivon();
  const mem = seedObj => { const m = new Map(Object.entries(seedObj || {})); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };
  const ls = mem(storeRaw == null ? {} : { [CM]: storeRaw });
  for (const f of ['admin/data/data-manager-core.js', 'community-service.js', 'admin/admin-store.js', 'admin/admin-service.js']) vm.runInContext(read(f), ctx, { filename: f });
  const adapter = ctx.LivonAdminStore.createLocalAdapter({ localStorage: ls, sessionStorage: mem() });
  let t = Date.parse('2026-10-01T00:00:00Z');
  const svc = ctx.LivonAdminService.create({ env: ctx, adapter, now: t, clock: () => (t += 1000), host: '127.0.0.1' });
  return { ctx, svc, adapter, ls };
}
test('CU-27 Admin moderation: a report recorded in Community is reviewable in the Local Admin of the same browser', async () => {
  const a = cm(); const ids = seed(a);
  const c = a.R.addComment(ids.walk, '광고 댓글').comment;
  a.R.report('post:' + ids.walk, 'spam'); a.R.report('comment:' + c.id, 'harassment');
  const raw = a.ctx.localStorage.getItem(CM);
  const ad = admin(raw);
  const C = ad.svc.community(await ad.adapter.readCommunitySnapshot());
  assert.equal(C.device.reports, 2);
  assert.deepEqual(J(C.device.reportList.map(r => [r.target, r.reasonId, r.reason, r.exists, r.title]).sort()), [['comment:' + c.id, 'harassment', '괴롭힘/비방', true, '광고 댓글'], ['post:' + ids.walk, 'spam', '스팸', true, '주말 산책 일상']].sort());
  assert.deepEqual(J(C.device.reportList), J(a.R.reports()), 'the same model on both sides');
  assert.equal(await ad.svc.setModeration('post:' + ids.walk, 'NEEDS_REVIEW'), 'NEEDS_REVIEW');
  assert.equal(await ad.svc.setModeration('comment:' + c.id, 'RESOLVED_LOCAL'), 'RESOLVED_LOCAL');
  assert.deepEqual(J(await ad.svc.moderationStates()), { ['post:' + ids.walk]: 'NEEDS_REVIEW', ['comment:' + c.id]: 'RESOLVED_LOCAL' });
  assert.equal(ad.ls.getItem(CM), raw, 'the Admin never changes the community store');
  assert.equal(admin(null).svc.community(null).device.available, false);
  assert.deepEqual(J(admin('{broken').svc.community('{broken').device), { available: false, reason: 'community store is malformed (left untouched)' });
  const app = read('admin/admin-app.js');
  assert.match(app, /Reports recorded in LIVON Community <strong>in this browser<\/strong> \(local only — nothing was sent to a server/);
  assert.match(app, /data-ad-mod="' \+ esc\(r\.target\) \+ '"/);
  assert.match(read('admin/index.html'), /<script src="\/livon\/community-service\.js"><\/script>[\s\S]*<script src="\/livon\/admin\/admin-store\.js">/);
});

test('CU-28 empty states: feed, following, search, saved, my posts, comments, related content, activity', () => {
  const a = cm();
  a.show('cm-home');
  assert.match(text(a.feed()), /아직 이 기기에 작성된 글이 없습니다\. .* 첫 글 작성하기/);
  a.show('cm-home?tab=following');
  assert.match(text(a.feed()), /아직 팔로우한 사용자가 없습니다/);
  a.show('cm-home?q=x');
  assert.match(text(a.feed()), /검색 결과가 없습니다/);
  a.show('cm-mine');
  const t = text(a.mine());
  for (const part of ['아직 이 기기에 남긴 커뮤니티 활동이 없습니다', '작성한 글이 없어요', '임시 저장한 글이 없어요', '저장한 글이 없어요', '공감한 글이 없어요', '작성한 댓글이 없어요', '남긴 신고가 없어요']) assert.ok(t.includes(part), 'empty state: ' + part);
  assert.match(a.mine(), /data-lv-cm-reset-local disabled>/, 'nothing to clear → the button is disabled');
  const id = a.R.create(POSTS.walk).post.id;
  a.show('cm-post-' + id);
  assert.match(text(a.detail()), /이 글에 연결된 LIVON 정보가 없습니다/);
  assert.match(text(a.detail()), /아직 댓글이 없습니다/);
  for (const h of [a.feed(), a.mine(), a.detail()]) assert.ok(h.trim().length > 40, 'never a blank screen');
});

test('CU-29 malformed local data: repaired on read, every view still renders', () => {
  const junk = { v: 2, posts: [null, 5, 'x', { id: 1 }, { id: 'ok', title: { a: 1 }, body: null, tags: 'x', image: 'javascript:alert(1)', lifeStage: '99', lifeEvent: '<b>', type: 'weird', createdAt: 'yesterday' }, { id: 'ok2', title: '정상 글', body: '본문', type: 'tip', authorId: 'local', createdAt: 5 }],
    comments: [null, { id: 'c' }, { id: 'c2', postId: 'ok2', body: 7, parentId: 9 }], likes: [], commentLikes: 'x', reports: [{}, { target: 'x', reason: 'y' }, { target: 'post:ok2', reason: 'spam', at: 'x' }], joined: ['c-daily', null, { id: 5 }], profile: 'x', compose: 'x', saves: [1, 'a'], blocked: null, challenges: [] };
  for (const raw of ['{broken', '[]', '"text"', '42', 'null', JSON.stringify(junk)]) {
    const a = cm({ raw: { [CM]: raw } });
    assert.doesNotThrow(() => { a.show('cm-home'); a.show('cm-home?tab=foryou&q=정상'); a.show('cm-mine'); a.show('cm-post-ok'); a.show('cm-post-ok2'); a.R.activity(); a.R.reports(); }, raw.slice(0, 20));
    assert.equal(a.R.create(POSTS.walk).status, 'ok', 'still usable: ' + raw.slice(0, 20));
  }
  const a = cm({ raw: { [CM]: JSON.stringify(junk) } });
  const s = a.T.loadStore();
  assert.deepEqual(J(s.posts.map(p => p.id)), ['ok', 'ok2']);
  assert.deepEqual(J([s.posts[0].title, s.posts[0].body, s.posts[0].tags, s.posts[0].image, s.posts[0].lifeStage, s.posts[0].lifeEvent, s.posts[0].type]), ['', '', [], '', '', '', 'story']);
  assert.deepEqual(J(s.comments.map(c => c.id)), ['c2']);
  assert.deepEqual(J([s.likes, s.commentLikes, s.challenges, s.profile.nick, s.compose]), [{}, {}, {}, '나', null]);
  assert.deepEqual(J(s.reports.map(r => r.target)), ['post:ok2']);
  assert.deepEqual(J(s.joined.map(j => j.id)), ['c-daily']);
  assert.ok(a.S.normalizeStore(JSON.parse(JSON.stringify(junk))).problems.length >= 5, 'what was dropped is reported');
});

test('CU-30 blocked storage: writing, drafting and reading work for this tab; a full quota is reported, not hidden', () => {
  const a = cm({ blocked: true });
  assert.deepEqual([...a.ctx.LIVON_STORAGE_FALLBACK], ['localStorage']);
  const id = a.R.create(POSTS.walk).post.id;
  assert.equal(a.R.saveComposeDraft({ title: '초안', body: '내용' }).status, 'ok');
  assert.equal(a.R.composeDraft().title, '초안');
  a.show('cm-post-' + id);
  assert.match(text(a.detail()), /주말 산책 일상/);
  assert.equal(a.S.adapter().info().persistent, false);
  // without the storage guard the adapter itself falls back to memory
  const S = a.S, thrower = { read() { throw new Error('SecurityError'); }, write() { throw new Error('SecurityError'); } };
  const mem = S.createLocalAdapter(thrower);
  const st = mem.loadStore().store; st.posts.push({ id: 'm1', title: 't', body: 'b', type: 'tip', authorId: 'local' });
  assert.equal(mem.saveStore(st), true);
  assert.deepEqual(J(mem.loadStore().store.posts.map(p => p.id)), ['m1']);
  assert.equal(mem.info().persistent, false);
  // quota exceeded: the write fails and the caller is told
  const full = S.createLocalAdapter({ read: () => null, write: () => false });
  assert.equal(full.saveStore(S.emptyStore()), false);
  assert.match(PAGE, /이 기기의 저장 공간이 부족해 저장하지 못했습니다/);
});

test('CU-31 missing or deleted post: a friendly page, not a crash', () => {
  const a = cm(); const ids = seed(a);
  for (const id of ['nope', '', '../../etc', '<img>', ids.draft + 'x']) {
    assert.doesNotThrow(() => a.show('cm-post-' + id));
    const t = text(a.detail());
    assert.match(t, /글을 찾을 수 없습니다 삭제되었거나 다른 기기에서 작성된 글입니다\. 커뮤니티 글은 현재 작성한 기기에만 저장됩니다\. 피드 보기/);
    assert.doesNotMatch(a.detail(), /<img>/);
  }
  assert.equal(a.R.get('nope'), null);
  a.R.remove(ids.walk);
  a.show('cm-post-' + ids.walk);
  assert.match(text(a.detail()), /글을 찾을 수 없습니다/);
  assert.equal(a.ctx.document.title, '커뮤니티 · LIVON');
});

test('CU-32 XSS: user text is always escaped; tampered storage cannot inject markup or a script URL', () => {
  const a = cm();
  const evil = '<img src=x onerror=alert(1)>"><script>alert(2)</script>';
  const id = a.R.create({ type: 'question', title: evil.slice(0, 80), body: evil + '\n<b>bold</b>' }).post.id;
  a.R.addComment(id, evil);
  const st = a.raw();
  st.profile.nick = evil.slice(0, 20);
  Object.assign(st.posts[0], { tags: ['"><svg onload=1>'], category: '"><b>', lifeTopicId: '"><x', lifeStage: '20', image: 'javascript:alert(3)', region: '<i>' });
  st.posts.push({ id: 'p"><img src=x>', title: '따옴표 id', body: 'x', type: 'tip', authorId: 'local', createdAt: 9, image: 'data:text/html;base64,PHNjcmlwdD4=' });
  a.ctx.localStorage.setItem(CM, JSON.stringify(st));
  a.show('cm-home?q=' + encodeURIComponent('<script>'));
  a.show('cm-home'); const feed = a.feed();
  a.show('cm-mine'); const mine = a.mine();
  a.show('cm-post-' + id); const detail = a.detail();
  for (const [name, h] of [['feed', feed], ['mine', mine], ['detail', detail]]) {
    assert.doesNotMatch(h, /<script|<img src=x|<svg|<b>bold|<i>|<x/, name + ' has no injected markup');
    assert.doesNotMatch(h, /src="(javascript|data:text)/, name + ' has no script image source');
  }
  assert.ok(detail.includes('&lt;img src=x onerror=alert(1)&gt;'), 'shown as text');
  assert.equal(a.T.loadStore().posts.find(p => p.id === id).image, '', 'a non-bitmap image source is dropped');
  assert.ok(!a.T.loadStore().posts.some(p => /["<>]/.test(p.id)), 'a record whose id is not an id is not a record');
  assert.equal(a.S.safeHref('javascript:alert(1)'), '');
  assert.equal(a.S.safeHref('http://plain.example'), '');
  assert.equal(a.S.safeHref('#life/20s/first-job'), '#life/20s/first-job');
  assert.doesNotMatch(PAGE.replace(/\/\*[\s\S]*?\*\//g, ''), /\.innerHTML\s*=\s*[a-z]+\.(title|body|nick)\b|eval\(|document\.write/);
});

test('CU-33 deep links: a post URL opens the post; unknown ids and another browser get a clear page', () => {
  const a = cm(); const ids = seed(a);
  a.show('cm-post-' + ids.center);
  assert.match(text(a.detail()), /복지관 프로그램 정보/);
  const other = cm({ hash: '#cm-post-' + ids.center });   // another browser: the local record is not there
  assert.match(text(other.detail()), /글을 찾을 수 없습니다 삭제되었거나 다른 기기에서 작성된 글입니다/);
  a.show('cm-home?tab=popular&stage=99&event=zzz&type=bad&cat=nope&q=' + 'x'.repeat(200));
  assert.deepEqual([a.T.state.tab, a.T.state.stage, a.T.state.event, a.T.state.type, a.T.state.cat, a.T.state.q.length], ['latest', '', '', '', '', 80], 'unknown values fall back');
  a.show('cm-home?%E0%A4%A=1&event=first-job');
  assert.equal(a.T.state.event, 'first-job', 'a broken parameter does not break the others');
  assert.match(PAGE, /현재 이 기기에만 저장되어 있어 다른 기기에서는 열리지 않을 수 있습니다/, 'sharing says the link is device-local');
  // a direct link can arrive before the Life Stage data: the linked information is filled in when it loads
  assert.match(PAGE, /lr\.load\(\)\.then\(function \(\) \{[\s\S]{0,400}showDetail\(id, \{ scroll: false, afterData: true, focus: onTitle \}\);/);
  assert.match(PAGE, /if \(ta && ta\.value\) return;/);
});

test('CU-34 navigation: every community route renders; back goes to the feed the reader came from', () => {
  const a = cm(); const ids = seed(a);
  for (const h of ['community', 'cm-hero', 'cm-home', 'cm-communities', 'cm-stages', 'cm-interests', 'cm-qa', 'cm-programs', 'cm-mine', 'cm-safe', 'cm-write', 'cm-write?type=tip', 'cm-unknown']) assert.doesNotThrow(() => a.show(h), h);
  a.show('cm-home?stage=20&q=' + encodeURIComponent('팁'));
  a.show('cm-post-' + ids.salary);
  assert.match(a.detail(), new RegExp('href="#cm-home\\?stage=20&amp;q=' + encodeURIComponent('팁') + '" data-lv-cm-back>← 피드로'));
  a.show('cm-safe');
  const rules = a.els['[data-lv-cm-rules]'].innerHTML;
  assert.equal((rules.match(/<li>/g) || []).length, 6);
  for (const part of ['서로 존중하기', '개인정보 지키기', '스팸·광고 금지', '불법·유해한 내용 금지', '잘못된 정보 주의', '문제가 보이면 신고']) assert.ok(rules.includes(part), part);
  assert.match(INDEX, /<h3 class="lv-cm-rules__title" id="cm-rules-title">커뮤니티 가이드<\/h3>\s*<ul class="lv-cm-rules" data-lv-cm-rules aria-labelledby="cm-rules-title"><\/ul>/);
  assert.ok(a.S.GUIDELINES.every(g => (g.title + g.text).length < 90), 'short, not a legal document');
});

test('CU-35 mobile: wrapping filters and forms, shallow reply indent, long words wrap, 44px targets', () => {
  assert.match(CSS, /#community \.lv-cm-filter-row \{ display: flex; flex-wrap: wrap;/);
  assert.match(CSS, /#community \.lv-cm-filter-row \.lv-cm-field--inline \{ flex: 1 1 9\.5rem; \}/);
  assert.match(CSS, /#community \.lv-cm-form__row \{ display: grid; gap: 0\.85rem; grid-template-columns: repeat\(auto-fit, minmax\(min\(100%, 12rem\), 1fr\)\); \}/);
  assert.match(CSS, /#community \.lv-cm-field--inline select,\s*#community \.lv-cm-field--inline input \{ min-height: 44px; max-width: 100%; \}/);
  assert.match(CSS, /#community \.lv-cm-info-list a \{[^}]*min-height: 44px;[^}]*overflow-wrap: anywhere;/);
  assert.match(CSS, /#community \.lv-cm-comment__body, #community \.lv-cm-detail__body \{ overflow-wrap: anywhere; \}/);
  assert.match(CSS, /#community \.lv-cm-rules \{[^}]*overflow-wrap: anywhere;/);
  assert.doesNotMatch(CSS.slice(CSS.indexOf('Community UX V1')).replace(/@media \([^)]*\)/g, ''), /width:\s*\d{3,}px/, 'no fixed widths in the new styles');
});

test('CU-36 keyboard: tabs with arrow keys, Escape closes one layer, focus is trapped in dialogs and returned', () => {
  const a = cm(); seed(a); a.show('cm-home');
  const tabs = a.els['[data-lv-cm-tabs]'].innerHTML;
  assert.equal((tabs.match(/role="tab"/g) || []).length, 3);
  assert.equal((tabs.match(/tabindex="0"/g) || []).length, 1, 'roving tabindex');
  assert.match(tabs, /data-lv-cm-tab="latest" aria-selected="true" tabindex="0" class="is-on"/);
  assert.match(PAGE, /e\.key === "ArrowRight" \|\| e\.key === "ArrowLeft" \|\| e\.key === "Home" \|\| e\.key === "End"/);
  assert.match(PAGE, /if \(e\.key === "Tab"\) \{ trapFocus\(e\); return; \}/);
  assert.match(PAGE, /if \(dialog\) \{ e\.preventDefault\(\); e\.stopPropagation\(\); closeDialog\(false\); return; \}\s*if \(composeOpen\(\)\) \{ e\.preventDefault\(\); e\.stopPropagation\(\); closeCompose\(false\); return; \}/);
  assert.match(PAGE, /function restoreFocus\(el\) \{\s*if \(el && document\.contains\(el\) && typeof el\.focus === "function"\) \{ el\.focus\(\); return; \}/);
  assert.match(PAGE, /if \(dialog\) dialog\.opener = opener0;/, 'the reset confirmation returns focus to its button');
  assert.doesNotMatch(PAGE, /<div[^>]*\sonclick=|<span[^>]*data-lv-cm-(like|report|edit)/, 'actions are real buttons and links');
});

test('CU-37 accessibility: dialogs, labels, headings, pressed state, status and error announcements', () => {
  assert.match(INDEX, /<p class="visually-hidden" role="status" aria-live="polite" data-lv-cm-status><\/p>/);
  assert.match(INDEX, /<div class="lv-cm-modal__panel" role="dialog" aria-modal="true" aria-labelledby="lv-cm-modal-title">/);
  assert.match(PAGE, /role="alertdialog" aria-modal="true" aria-labelledby="lv-cm-dialog-title" aria-describedby="lv-cm-dialog-desc"/);
  assert.match(PAGE, /<fieldset class="lv-cm-fieldset"><legend>신고 사유<\/legend>/);
  assert.match(PAGE, /data-lv-cm-report-err role="alert"/);
  assert.match(PAGE, /data-lv-cm-form-err role="alert"/);
  assert.match(PAGE, /f\.setAttribute\("aria-invalid", "true"\);\s*f\.setAttribute\("aria-describedby", "lv-cm-form-err-msg"\);/);
  const a = cm(); const ids = seed(a);
  a.show('cm-home');
  for (const sel of ['data-lv-cm-type-filter', 'data-lv-cm-stage-filter', 'data-lv-cm-event-filter']) assert.match(a.filters(), new RegExp('<label class="lv-cm-field lv-cm-field--inline"><span>[^<]+</span><select ' + sel + '>'), sel + ' is labelled');
  assert.match(a.filters(), /role="group" aria-label="주제"/);
  assert.equal(a.els['[data-lv-cm-feed]'].getAttribute('role'), 'tabpanel');
  assert.equal(a.els['[data-lv-cm-feed]'].getAttribute('aria-labelledby'), 'lv-cm-tab-latest');
  a.show('cm-post-' + ids.interview);
  const d = a.detail();
  assert.equal((d.match(/<h2 /g) || []).length, 1, 'one h2: the post title');
  for (const h3 of ['lv-cm-links-title', 'lv-cm-info-title', 'lv-cm-comments-title']) assert.match(d, new RegExp('<section[^>]*aria-labelledby="' + h3 + '"><h3 id="' + h3 + '"'), h3);
  assert.match(d, /<label class="lv-cm-field"><span>댓글 /);
  assert.match(d, /data-lv-cm-like="[^"]+" aria-pressed="false">공감하기/);
  assert.match(d, /<span class="visually-hidden"> \(새 창\)<\/span>/, 'external links say they open a new window');
  assert.match(a.T.cardHtml(a.T.loadStore().posts[0], a.T.loadStore()), /<span class="visually-hidden">: [^<]+<\/span>/, 'repeated buttons name their post');
});

test('CU-38 reduced motion: no smooth scrolling or transitions when the reader asked for less motion', () => {
  assert.match(PAGE, /behavior: instant \|\| reducedMotion\(\) \? "auto" : "smooth"/);
  assert.match(PAGE, /behavior: reducedMotion\(\) \? "auto" : "smooth"/);
  assert.match(CSS, /@media \(prefers-reduced-motion: reduce\) \{\s*#community \.lv-cm-card,\s*#community \.lv-cm-btn \{ transition: none; \}/);
  assert.doesNotMatch(CSS.slice(CSS.indexOf('Community UX V1')), /transition|animation/, 'the new styles add no motion');
});

test('CU-39 privacy: no network, no personal field, the page says where things are stored', () => {
  const a = cm(); const ids = seed(a);
  a.R.addComment(ids.walk, '댓글'); a.R.toggleReaction(ids.walk); a.R.report('post:' + ids.walk, 'spam'); a.R.saveComposeDraft({ title: 'a', body: 'b' });
  a.show('cm-home?tab=foryou'); a.show('cm-post-' + ids.interview); a.show('cm-mine'); a.R.resetLocal();
  assert.deepEqual(a.net, [], 'nothing leaves the browser');
  for (const src of [SERVICE, PAGE]) assert.doesNotMatch(src.replace(/\/\*[\s\S]*?\*\//g, ''), /fetch\(|XMLHttpRequest|sendBeacon|WebSocket|\/api\//);
  assert.doesNotMatch(PAGE, /name="(email|phone|tel|birth|address|realname|password)"/);
  assert.match(PAGE, /개인정보\(연락처·주소·실명 등\)는 게시하지 마세요\. 글은 이 기기에만 저장됩니다\./);
  assert.match(PAGE, /placeholder="개인정보는 적지 마세요\."/);
  assert.match(INDEX, /글·댓글·공감은 이 기기에만 저장됩니다\./);
  assert.equal(a.ctx.LivonUserData.classify(CM), 'COMMUNITY_LOCAL', 'community data is never an account-sync candidate');
});

test('CU-40 curated / local / remote are separate: origin on every record, one local store, no profile copy', () => {
  const a = cm({ local: { [K.stage]: '30', [K.interests]: ['가족'], [K.events]: ['parenting'] } }); seed(a);
  assert.deepEqual(J(a.S.ORIGIN), { CURATED: 'CURATED', LOCAL: 'LOCAL', REMOTE: 'REMOTE' });
  const snap = a.S.snapshot(a.ctx.localStorage.getItem(CM));
  assert.ok(snap.posts.length === 9 && snap.posts.every(p => p.origin === 'LOCAL'));
  const D = a.ctx.LivonCommunityData;
  assert.deepEqual(Object.keys(D).sort(), ['challenges', 'communities', 'interests', 'questionFields', 'regions', 'rules', 'typeLabels'], 'curated = groups, challenges, labels, rules');
  a.show('cm-home?tab=foryou');
  const st = a.raw();
  assert.deepEqual(Object.keys(st).sort(), ['blocked', 'challenges', 'commentLikes', 'comments', 'compose', 'drafts', 'joined', 'likes', 'posts', 'profile', 'region', 'reports', 'saves', 'v']);
  assert.doesNotMatch(JSON.stringify(st.profile), /가족|parenting|"30"/, 'the onboarding profile is not copied into the community store');
  assert.doesNotMatch(PAGE + SERVICE, /livon\.cmProfile|livon\.cmPersonal|livon\.cmPrefs/, 'no second personalization store');
  assert.match(PAGE, /prof = PZ && typeof PZ\.getProfile === "function" \? PZ\.getProfile\(\) : null/);
});

test('CU-41 adapter: UI → Repo → Service → Adapter; the local adapter can be replaced without touching the UI', () => {
  const a = cm(); const S = a.S;
  assert.deepEqual([...S.ADAPTER_METHODS], ['info', 'loadStore', 'saveStore', 'follows', 'setFollow', 'submitReport']);
  assert.equal(S.adapter().kind, 'local');
  assert.equal(S.adapter().info().key, CM);
  const remote = S.createRemoteAdapter({ baseUrl: 'https://example.invalid' });
  for (const m of S.ADAPTER_METHODS) assert.throws(() => remote[m](), /BACKEND_REQUIRED/, m);
  assert.throws(() => S.useAdapter({ loadStore() {} }), /INVALID_COMMUNITY_ADAPTER/);
  // swap in another adapter: the same UI code writes there, and browser storage is not touched
  const before = a.ctx.localStorage.getItem(CM);
  let held = null; const calls = [];
  const mem = S.createLocalAdapter({ read: () => { calls.push('read'); return held; }, write: (k, v) => { calls.push('write'); held = JSON.parse(JSON.stringify(v)); return true; } });
  S.useAdapter(mem);
  const id = a.R.create(POSTS.walk).post.id;
  a.R.addComment(id, '댓글'); a.R.report('post:' + id, 'spam');
  assert.deepEqual([held.posts.length, held.comments.length, held.reports.length], [1, 1, 1]);
  assert.equal(a.ctx.localStorage.getItem(CM), before);
  assert.ok(calls.includes('read') && calls.includes('write'));
  const code = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.equal((code.match(/localStorage\./g) || []).length, 2, 'only the two guarded helpers for the older preference keys');
  assert.doesNotMatch(code, /(read|write)JSON\(STORE_KEY/, 'the store is reached only through the adapter');
  assert.equal((code.match(/SVC\.adapter\(\)\.(loadStore|saveStore)\(/g) || []).length, 4);
});

test('CU-42 Admin regression: all 13 sections, system status and the community view still work', async () => {
  const { svc, ctx } = admin(null);
  assert.deepEqual(J(ctx.LivonAdminService.NAV.map(n => n.label)), ['Overview', 'Content', 'Life Stage', 'Life Events', 'Today', 'Explore', 'Community', 'Data Quality', 'Review Queue', 'Sources', 'Providers', 'Reports', 'Local Drafts', 'Audit Events', 'System']);
  const sys = Object.fromEntries(svc.system(await svc.adapterInfo()).map(s => [s.key, s.value]));
  assert.deepEqual([sys['Personalization Engine'], sys['Community Backend'], sys['Curated Records'], sys['Anonymous Mode']], ['LOCAL RULE-BASED', 'NOT CONNECTED', '530', 'ACTIVE']);
  const C = svc.community(null);
  assert.deepEqual([C.backend, C.curated.groups.length, C.curated.challenges.length, C.device.available], ['NOT CONNECTED', 21, 5, false]);
  for (const view of ['overview', 'lifeStages', 'lifeEvents', 'today', 'explore', 'quality', 'sources', 'providers']) assert.ok(svc[view](), view + ' renders its data');
  assert.ok(Array.isArray(svc.reviewQueue({})) || svc.reviewQueue({}), 'review queue');
  const app = read('admin/admin-app.js');
  for (const tab of ['posts', 'reports', 'moderation', 'profiles', 'groups']) assert.ok(app.includes('["' + tab + '"'), 'community tab ' + tab);
  assert.doesNotMatch(read('admin/admin-store.js') + read('admin/admin-service.js') + app, /setItem\("livon\.cmStore|saveStore\(/, 'the Admin still never writes the community store');
});

test('CU-43 Data Manager regression: the model, the 530 records and the onboarding simulation are unchanged', () => {
  const ctx = loadLivon();
  vm.runInContext(read('admin/data/data-manager-core.js'), ctx);
  const DM = ctx.LivonDataManager, M = DM.createModel(ctx, { now: Date.parse('2026-10-01T00:00:00Z') });
  assert.equal(M.records.length, 530);
  assert.ok(DM.DATA_SCRIPTS.includes('/livon/community-data.js') && DM.DATA_SCRIPTS.includes('/livon/livon-personalization.js'));
  assert.ok(!DM.DATA_SCRIPTS.some(s => /community-(page|service)/.test(s)), 'the tool loads no community UI code');
  const sim = DM.simulateOnboarding(M, { lifeStage: '70', interests: ['돌봄'] });
  assert.ok(sim.available && !sim.items.some(x => x.id === 'ex:ex-childcare'));
  for (const fn of ['contentGaps', 'coverage', 'searchTest', 'recommend', 'exportJSON', 'exportCSV']) assert.equal(typeof DM[fn], 'function', fn);
  assert.equal(DM.isAllowedHost('www.newon.app'), false);
});

test('CU-44 public regression: script order, shared search, saves and other screens are untouched', () => {
  const pos = f => INDEX.indexOf('/livon/' + f + '?');
  const order = ['data/livon-storage-guard.js', 'livon-platform.js', 'livon-personalization.js', 'livon-onboarding.js', 'community-data.js', 'community-service.js', 'community-page.js'].map(pos);
  assert.ok(order.every(i => i > 0), 'all loaded: ' + order);
  assert.deepEqual([...order].sort((x, y) => x - y), order, 'service before page, after personalization');
  for (const f of ['community-service.js', 'community-page.js']) assert.equal(INDEX.split('/livon/' + f + '?').length - 1, 1, f + ' once');
  const a = cm(); const ids = seed(a);
  const r = a.ctx.LivonSearch.search('면접', { type: 'community' });
  assert.deepEqual(J(r.items.map(x => x.item.key)), ['cm:' + ids.interview], 'Explore still finds public community posts');
  assert.equal(a.ctx.LivonSearch.search('비공개 메모', { type: 'community' }).total, 0);
  assert.equal(a.ctx.LivonSearch.search('임시 글', { type: 'community' }).total, 0);
  assert.equal(a.ctx.LivonScreenData.repository().all().length > 400, true, 'the Data Platform is not rebuilt or changed by the community');
  assert.equal(typeof a.ctx.LivonCommunity.onShow, 'function');
  assert.equal(typeof a.ctx.LivonCommunityRepo.searchablePosts, 'function');
});

test('CU-45 anonymous mode: everything works without an account, and nothing pretends there is one', () => {
  const a = cm(); const ids = seed(a);
  assert.equal(a.R.source, 'local');
  assert.ok(a.raw().posts.every(p => p.authorId === 'local' && p.authorNick === '나'));
  assert.doesNotMatch(PAGE.replace(/\/\*[\s\S]*?\*\//g, ''), /로그인이 필요|로그인 후|회원가입 후|LivonAuth|requireLogin/);
  assert.doesNotMatch(text(a.T.cardHtml(a.T.loadStore().posts[0], a.T.loadStore())), /회원|레벨|인증됨/);
  a.show('cm-mine');
  assert.doesNotMatch(a.mine(), /로그인|회원가입/);
  assert.ok(ids.walk);
});

/* ───────── the four isolation checks (spec §34) ───────── */
test('A. 70대 + 돌봄: ex-childcare is never recommended, and childcare posts are never boosted', () => {
  const a = cm({ local: { [K.stage]: '70', [K.interests]: ['돌봄', '가족'], [K.events]: ['later-life'] } });
  const ids = seed(a);
  a.R.create({ type: 'question', title: '육아 도우미 구하는 법', body: '보육 정보가 궁금해요', tags: '육아' });
  for (const interests of [['돌봄'], ['돌봄', '가족'], ['돌봄', '육아']]) {
    const rec = a.PZ.recommend({ lifeStage: '70', interests, lifeEvents: ['later-life'] }, { limit: 2000 }).items.map(x => x.id);
    assert.ok(!rec.includes('ex:ex-childcare'), 'ex-childcare for 70대 + ' + interests);
    assert.ok(!rec.includes('pol:pol-childcare'));
  }
  assert.ok(!a.PZ.allowedIds('70')['ex:ex-childcare']);
  const sig = a.T.userSignals(a.T.loadStore());
  for (const p of a.R.visiblePosts().filter(x => /육아/.test(x.title))) assert.equal(a.T.forYouScore(p, sig), 0, 'not boosted: ' + p.title);
  a.show('cm-home?tab=foryou');
  assert.equal(a.titles()[0], '복지관 프로그램 정보', 'the 70대 post leads');
  assert.equal(a.PZ.textAgeOk('육아 도우미', '70'), false);
  assert.equal(a.PZ.textAgeOk('육아 도우미', '30'), true);
  assert.equal(a.PZ.textAgeOk('복지관 강좌', '70'), true);
  assert.equal(a.PZ.textAgeOk('육아', ''), true, 'no band → no restriction');
  assert.ok(a.titles().includes('육아 도우미 구하는 법'), 'not boosted, but still readable — nothing is hidden');
  assert.ok(ids.parenting);
});

test('B. 30대 + 육아: childcare content is recommended, in LIVON and in Community', () => {
  const a = cm({ local: { [K.stage]: '30', [K.interests]: ['육아'], [K.events]: ['parenting'] } });
  seed(a);
  const rec = a.PZ.recommend(null, { limit: 2000 }).items.map(x => x.id);
  assert.ok(rec.includes('ex:ex-childcare') && rec.includes('pol:pol-childcare'), 'real childcare records are offered');
  assert.ok(rec.slice(0, 5).some(id => /^topic:30s\.(childcare|parenting)/.test(id)));
  a.show('cm-home?tab=foryou');
  assert.equal(a.titles()[0], '육아 휴직 복직 경험');
  assert.match(a.feed(), /선택한 ‘육아’ 관련/);
});

test('C. clearing community data never deletes the onboarding profile or other LIVON data', () => {
  const a = cm({ local: { [K.stage]: '30', [K.interests]: ['육아'], [K.events]: ['parenting'], [K.meta]: { version: 1, state: 'COMPLETED', step: '', draft: null, updatedAt: 5 },
    [K.ml]: { v: 3, todos: [{ id: 't1', title: '서류' }], goals: [{ id: 'g1', title: '목표' }] }, [K.platform]: { onboarded: true, saves: [{ id: 'ex:ex-career24', type: 'content', title: '고용24', href: '#ex-item-ex-career24', savedAt: 1 }] } } });
  const ids = seed(a);
  a.P.saveItem({ id: a.T.saveId(ids.walk), title: '주말 산책 일상', type: 'life-community', href: '#cm-post-' + ids.walk });
  a.R.addComment(ids.walk, '댓글'); a.R.toggleReaction(ids.walk); a.R.report('post:' + ids.walk, 'spam');
  const before = JSON.stringify(a.PZ.getProfile());
  const res = a.R.resetLocal();
  assert.deepEqual(J(res), { status: 'ok', removed: { posts: 9, comments: 1, reports: 1 } });
  const st = a.raw();
  assert.deepEqual([st.posts.length, st.comments.length, st.reports.length, Object.keys(st.likes).length, st.compose], [0, 0, 0, 0, null]);
  assert.equal(JSON.stringify(a.PZ.getProfile()), before, 'profile untouched');
  assert.deepEqual([a.get(K.stage), a.get(K.interests), a.get(K.events), a.get(K.meta).state], ['30', ['육아'], ['parenting'], 'COMPLETED']);
  assert.deepEqual([a.get(K.ml).todos.length, a.get(K.ml).goals.length], [1, 1]);
  assert.deepEqual(J(a.get(K.platform).saves.map(s => s.id)), ['ex:ex-career24'], 'only the community saves went with their posts');
  // every other community action leaves the profile alone as well
  const ids2 = seed(a); a.R.update(ids2.walk, { type: 'tip', title: 'a', body: 'b' }); a.R.remove(ids2.walk); a.show('cm-home?tab=foryou');
  assert.equal(JSON.stringify(a.PZ.getProfile()), before);
  assert.doesNotMatch(PAGE + SERVICE, /LivonPersonalization\.(complete|update|reset|skip)|PZ\.(complete|update|reset|skip)\(/, 'Community never writes the profile');
});

test('D. resetting or changing the onboarding profile never deletes community posts, comments or reactions', () => {
  const a = cm({ local: { [K.stage]: '30', [K.interests]: ['육아'], [K.events]: ['parenting'], [K.meta]: { version: 1, state: 'COMPLETED', step: '', draft: null, updatedAt: 5 } } });
  const ids = seed(a);
  a.R.addComment(ids.walk, '댓글'); a.R.toggleReaction(ids.walk); a.R.report('post:' + ids.walk, 'spam'); a.R.saveComposeDraft({ title: '초안', body: 'x' });
  a.P.saveItem({ id: a.T.saveId(ids.walk), title: '주말 산책 일상', type: 'life-community', href: '#cm-post-' + ids.walk });
  const before = a.ctx.localStorage.getItem(CM);
  a.PZ.update({ lifeStage: '40', interests: ['건강'] });
  assert.equal(a.ctx.localStorage.getItem(CM), before, 'update');
  a.PZ.reset();
  assert.equal(a.ctx.localStorage.getItem(CM), before, 'reset');
  a.PZ.complete({ lifeStage: '20', interests: [], lifeEvents: [] }); a.PZ.skip();
  assert.equal(a.ctx.localStorage.getItem(CM), before, 'complete / skip');
  assert.equal(a.R.visiblePosts().length, 7);
  assert.equal(a.R.isSaved(ids.walk), true);
  a.show('cm-home?tab=foryou');
  assert.equal(a.titles().length, 7, 'the feed simply follows the new profile');
});

test('documentation: LIVON_COMMUNITY_UX.md and the Help/FAQ topic inventory exist', () => {
  const doc = fs.readFileSync(path.join(ROOT, 'docs/livon/LIVON_COMMUNITY_UX.md'), 'utf8');
  for (const h of ['Audit', 'Architecture', 'Data model', 'Feed', 'Onboarding integration', 'Post creation', 'Draft', 'Detail, edit, delete', 'Reaction and save', 'Comments and replies', 'Search', 'Filters', 'Local activity', 'Follow', 'Related content', 'Report', 'Admin moderation', 'Empty states', 'Error and recovery', 'Security', 'Deep links', 'Guidelines', 'Data ownership', 'Help & FAQ topic inventory']) {
    assert.match(doc, new RegExp('^## .*' + h.replace(/[&]/g, '\\$&'), 'm'), 'missing section: ' + h);
  }
  const topics = [...doc.slice(doc.indexOf('Help & FAQ topic inventory')).matchAll(/^\| (HF-\d+) \|/gm)].map(m => m[1]);
  assert.ok(topics.length >= 20 && new Set(topics).size === topics.length, 'at least 20 unique FAQ topics: ' + topics.length);
  assert.match(fs.readFileSync(path.join(ROOT, 'docs/livon/LIVON_ONBOARDING.md'), 'utf8'), /community-service\.js/);
});

test('performance: feed, search, filter and For You stay fast with 300 posts; the Data Platform is built once', () => {
  const a = cm({ local: { [K.stage]: '30', [K.interests]: ['가족', '건강'], [K.events]: ['parenting', 'checkup'] } });
  const keys = Object.keys(POSTS), st = a.T.loadStore();
  for (let i = 0; i < 300; i++) st.posts.push(Object.assign({}, POSTS[keys[i % keys.length]], { id: 'post_p' + i, tags: ['태그' + (i % 9)], authorId: 'local', authorNick: '나', createdAt: 1000 + i, updatedAt: 1000 + i }));
  a.ctx.localStorage.setItem(CM, JSON.stringify(st));
  const repo = a.ctx.LivonScreenData.repository();
  const time = fn => { fn(); const t = process.hrtime.bigint(); for (let i = 0; i < 5; i++) fn(); return Number(process.hrtime.bigint() - t) / 1e6 / 5; };
  const ms = {
    latest: time(() => { a.T.applyFeedParams({}); a.T.filterFeed(); }),
    forYou: time(() => { a.T.applyFeedParams({ tab: 'foryou' }); a.T.filterFeed(); }),
    search: time(() => { a.T.applyFeedParams({ q: '육아 휴직' }); a.T.filterFeed(); }),
    filter: time(() => { a.T.applyFeedParams({ type: 'question', stage: '20', event: 'first-job' }); a.T.filterFeed(); }),
    render: time(() => a.show('cm-home?tab=foryou')),
    related: time(() => a.S.relatedContent(st.posts[6]))
  };
  for (const [k, v] of Object.entries(ms)) assert.ok(v < 250, k + ' ' + v.toFixed(1) + 'ms');
  assert.equal(a.ctx.LivonScreenData.repository(), repo, 'the repository is reused, not rebuilt');
  a.T.applyFeedParams({ tab: 'foryou' });
  assert.equal(a.T.filterFeed().length, 300);
  assert.equal(a.T.filterFeed()[0].lifeEvent, 'parenting', 'the profile still leads with 300 posts');
});
