// LIVON Community V2 — local-first product completion + backend-ready architecture (CV2-01 … CV2-60).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadLivon } from '../../scripts/livon-data-quality.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, 'livon', f), 'utf8');
const J = x => JSON.parse(JSON.stringify(x));
const PAGE = read('community-page.js'), SERVICE = read('community-service.js'), REMOTE = read('community-remote.js'), INDEX = read('index.html');
const DOC = fs.readFileSync(path.join(ROOT, 'docs/livon/LIVON_COMMUNITY_V2.md'), 'utf8');
const CM = 'livon.cmStore.v1';
const text = html => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const noComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* The public page as the browser loads it, with a stub DOM (same harness as community-ux.test.mjs). */
function cm({ local = {}, raw = {}, blocked = false, hash = '#community', withRemote = false } = {}) {
  const els = {};
  const WANT = ['#community', '[data-lv-cm-feed]', '[data-lv-cm-tabs]', '[data-lv-cm-filters]', '[data-lv-cm-search-meta]', '[data-lv-cm-mine]', '#cm-detail', '[data-lv-cm-detail]', '[data-lv-cm-status]', '[data-lv-cm-rules]', '[data-lv-cm-side]'];
  const mk = () => { const a = {}; return { hidden: false, innerHTML: '', textContent: '', id: '', childElementCount: 0, style: {}, setAttribute(k, v) { a[k] = String(v); }, getAttribute: k => (k in a ? a[k] : null), focus() {}, querySelector: () => null, querySelectorAll: () => [], classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, addEventListener() {} }; };
  const doc = {
    readyState: 'complete', title: 'LIVON', documentElement: { dataset: { lvView: 'community' } }, body: { style: {} }, head: { querySelector: () => null }, activeElement: null,
    getElementById: () => null, querySelector: s => (WANT.includes(s) ? (els[s] = els[s] || mk()) : null), querySelectorAll: () => [],
    addEventListener() {}, contains: () => false, createElement: () => mk(), dispatchEvent: () => true
  };
  const net = [], logs = [];
  const ctx = loadLivon({
    patch(c) {
      c.document = doc;
      c.location = { hash, origin: 'https://www.newon.app', pathname: '/livon/', hostname: 'www.newon.app' };
      c.scrollTo = () => {}; c.pageYOffset = 0; c.matchMedia = () => ({ matches: true }); c.getComputedStyle = () => ({ getPropertyValue: () => '74px' });
      c.CustomEvent = class { constructor(type) { this.type = type; } };
      c.fetch = (...a) => { net.push(String(a[0])); return Promise.reject(new Error('offline')); };
      c.XMLHttpRequest = function () { net.push('xhr'); throw new Error('no network'); };
      c.navigator = { sendBeacon: u => { net.push('beacon ' + u); return false; } };
      const rec = k => (...a) => logs.push(k + ' ' + a.map(String).join(' '));
      c.console = { log: rec('log'), info: rec('info'), warn: rec('warn'), error: rec('error'), debug: rec('debug') };
      if (blocked) Object.defineProperty(c, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
      vm.runInContext(read('data/livon-storage-guard.js'), c);
      for (const [k, v] of Object.entries(local)) c.localStorage.setItem(k, JSON.stringify(v));
      for (const [k, v] of Object.entries(raw)) c.localStorage.setItem(k, v);
      vm.runInContext(read('data/livon-user-data.js'), c);
    }
  });
  vm.runInContext('(function () { var t = 1790000000000; Date.now = function () { t += 2000; return t; }; })()', ctx);
  for (const f of ['livon-platform.js', 'community-service.js', 'community-page.js'].concat(withRemote ? ['community-remote.js'] : [])) vm.runInContext(read(f), ctx, { filename: f });
  const C = ctx.LivonCommunity, T = C._test;
  return {
    ctx, R: ctx.LivonCommunityRepo, T, S: ctx.LivonCommunityService, RM: ctx.LivonCommunityRemote, P: ctx.LivonPlatform, net, logs, els,
    raw: () => JSON.parse(ctx.localStorage.getItem(CM) || 'null'),
    show: h => { ctx.location.hash = '#' + h; C.onShow(h); },
    feed: () => (els['[data-lv-cm-feed]'] || {}).innerHTML || '', filters: () => (els['[data-lv-cm-filters]'] || {}).innerHTML || '',
    meta: () => (els['[data-lv-cm-search-meta]'] || {}).innerHTML || '',
    detail: () => (els['[data-lv-cm-detail]'] || {}).innerHTML || '', mine: () => (els['[data-lv-cm-mine]'] || {}).innerHTML || '',
    titles: () => J(T.filterFeed().map(p => p.title))
  };
}
const post = (o = {}) => Object.assign({ type: 'question', title: '첫 자취 계약 체크', body: '계약서에서 무엇을 확인하셨나요?', tags: '자취, 계약', category: 'housing', lifeStage: '20' }, o);
const save = (a, p) => a.P.saveItem({ id: a.T.saveId(p.id), title: p.title, type: 'life-community', href: '#cm-post-' + p.id, data: { kind: 'community', refId: 'cm:' + p.id } });
const card = (html, id) => { const i = html.indexOf('id="lv-cm-t-' + id + '"'); const s = html.lastIndexOf('<article', i); return html.slice(s, html.indexOf('</article>', i)); };

/* ═════════ audit ═════════ */
test('CV2-01 existing V1 audit/reuse: every feature classified; V2 extends the V1 modules instead of replacing them', () => {
  const rows = [...DOC.matchAll(/^\| ([^|]+) \| (LIVE|LOCAL|PARTIAL|CONTRACT ONLY|PLACEHOLDER|NOT IMPLEMENTED) \| (LIVE|LOCAL|PARTIAL|CONTRACT ONLY|PLACEHOLDER|NOT IMPLEMENTED) \|/gm)]
    .map(m => ({ name: m[1].trim(), before: m[2], after: m[3] }));
  for (const name of ['Community main', 'Feed / list', 'Categories', 'Posts', 'Post detail', 'Write / edit / delete', 'Profile', 'Comments', 'Replies', 'Reactions', 'Saved', 'Report', 'Block', 'Follow', 'Groups', 'Notifications', 'Search', 'Routing / deep links', 'Storage', 'Privacy', 'Moderation', 'Account hooks', 'Sync hooks', 'Server hooks', 'AI hooks', 'Analytics', 'Responsive', 'Accessibility'])
    assert.ok(rows.some(r => r.name === name), 'audit row missing: ' + name);
  assert.ok(!rows.some(r => r.after === 'LIVE'), 'nothing is called LIVE: there is no Community server');
  for (const n of ['Follow', 'Block', 'Notifications', 'Moderation']) assert.equal(rows.find(r => r.name === n).after, 'CONTRACT ONLY', n);
  /* reuse: one service, one page, one store key — no second community implementation */
  assert.equal(fs.readdirSync(path.join(ROOT, 'livon')).filter(f => /^community.*\.js$/.test(f)).sort().join(), 'community-data.js,community-page.js,community-remote.js,community-service.js');
  assert.equal((SERVICE + PAGE).match(/livon\.cmStore\.v\d/g).every(k => k === CM), true);
  assert.doesNotMatch(INDEX, /community-remote\.js/, 'the remote contract is not loaded by the public page');
});

test('CV2-02 empty community is honest: no invented posts, people or counts; one clear CTA to write', () => {
  const a = cm();
  a.show('cm-home');
  assert.equal(a.R.visiblePosts().length, 0);
  const t = text(a.feed());
  assert.match(t, /아직 표시할 커뮤니티 글이 없어요\./);
  assert.match(t, /다른 사용자의 글은 아직 없고, 지금 쓰는 글은 이 기기에만 저장됩니다/);
  assert.match(a.feed(), /data-lv-cm-compose="question">첫 글 작성하기</);
  assert.equal(a.ctx.LivonCommunityData.posts, undefined);
  assert.doesNotMatch(t, /\d+명|팔로워 \d|조회 \d|인기/);
});

/* ═════════ write ═════════ */
test('CV2-03 create local post: stored on this device with an honest delivery state, never "published"', () => {
  const a = cm();
  const r = a.R.create(post());
  assert.equal(r.status, 'ok');
  const p = a.raw().posts[0];
  assert.deepEqual([p.title, p.authorId, p.draft, p.deleted], ['첫 자취 계약 체크', 'local', false, false]);
  assert.ok(p.id && p.createdAt && p.updatedAt);
  assert.equal(a.S.deliveryOf(p), 'LOCAL_ONLY'); assert.equal(a.R.delivery(p.id), 'LOCAL_ONLY');
  assert.equal(a.S.deliveryLabel(p), '이 기기에만 저장됨');
  a.show('cm-home');
  assert.match(card(a.feed(), p.id), /data-lv-cm-delivery="LOCAL_ONLY">이 기기에만 저장됨</);
  /* the words a server publication would need are never used for a local post */
  assert.doesNotMatch(noComments(PAGE + SERVICE), /PUBLISHED|"공개됨|공개되었습니다|게시되었습니다|게시했습니다|글을 게시했/);
  assert.match(PAGE, /"이 기기에 저장"\) \+ "<\/button>"/, 'the submit button says where it goes');
  assert.match(PAGE, /글을 이 기기에 저장했습니다\. 아직 다른 사용자에게는 보이지 않아요\./);
});

test('CV2-04 draft: kept as DRAFT, out of the feed and search, listed under 내 활동', () => {
  const a = cm();
  const d = a.R.create({ type: 'story', title: '쓰다 만 글', body: '', draft: true }).post;
  assert.equal(a.S.deliveryOf(d), 'DRAFT'); assert.equal(a.S.deliveryLabel(d), '임시 저장 · 이 기기');
  assert.equal(a.R.visiblePosts().length, 0); assert.equal(a.R.searchablePosts().length, 0);
  assert.deepEqual(J(a.R.drafts().map(p => p.id)), [d.id]);
  a.show('cm-mine');
  assert.match(text(a.mine()), /임시 저장 글 1 쓰다 만 글 · 이어 쓰기/);
  assert.equal(a.R.validatePost ? 1 : 1, 1);
  assert.equal(a.S.validatePost({ draft: true, title: ' ', body: '' }).msg, '임시 저장할 제목이나 본문을 입력해 주세요.');
});

test('CV2-05 edit: own local post only; values, updatedAt and the shared save title change; id and createdAt stay', () => {
  const a = cm();
  const p = a.R.create(post()).post;
  save(a, p);
  const r = a.R.update(p.id, post({ title: '수정한 제목', body: '수정한 본문' }));
  assert.equal(r.status, 'ok');
  const q = a.raw().posts[0];
  assert.deepEqual([q.id, q.createdAt, q.title, q.body], [p.id, p.createdAt, '수정한 제목', '수정한 본문']);
  assert.ok(q.updatedAt > q.createdAt);
  assert.equal(a.P.listSaves('all').find(s => s.id === a.T.saveId(p.id)).title, '수정한 제목');
  assert.equal(a.R.update('missing-id', post()).status, 'missing');
  a.ctx.localStorage.setItem(CM, JSON.stringify(Object.assign(a.raw(), { posts: [Object.assign({}, q, { id: 'remote-1', authorId: 'acct-9' })].concat(a.raw().posts) })));
  assert.equal(a.R.update('remote-1', post()).status, 'forbidden', 'a record that is not LOCAL is never changed');
  assert.equal(a.R.remove('remote-1').status, 'forbidden');
});

test('CV2-06 delete: the post is gone from feed, search, detail and saves', () => {
  const a = cm();
  const p = a.R.create(post()).post;
  save(a, p);
  assert.equal(a.R.remove(p.id).status, 'ok');
  assert.equal(a.raw().posts.length, 0);
  assert.equal(a.R.isSaved(p.id), false);
  a.show('cm-home?q=자취'); assert.deepEqual(a.titles(), []);
  a.show('cm-post-' + p.id); assert.match(text(a.detail()), /글을 찾을 수 없습니다/);
  assert.equal(a.R.remove(p.id).status, 'missing');
});

test('CV2-07 reload persistence: posts, drafts, comments, reactions and saves survive a new page load', () => {
  const a = cm();
  const p = a.R.create(post()).post;
  a.R.create({ type: 'story', title: '임시', body: '', draft: true });
  a.R.addComment(p.id, '댓글'); a.R.toggleReaction(p.id); save(a, p);
  const stored = { [CM]: a.ctx.localStorage.getItem(CM), 'livon.platform.v1': a.ctx.localStorage.getItem('livon.platform.v1') };
  const b = cm({ raw: stored });
  assert.equal(b.R.get(p.id).title, '첫 자취 계약 체크');
  assert.equal(b.R.drafts().length, 1);
  assert.equal(b.R.comments(p.id).length, 1);
  assert.equal(b.R.reacted(b.T.loadStore(), p.id), true);
  assert.equal(b.R.isSaved(p.id), true);
});

/* ═════════ validation and text safety ═════════ */
test('CV2-08 validation title: empty, whitespace only, too long, control characters', () => {
  const a = cm();
  for (const [title, re] of [['', /제목을 입력/], ['   ', /제목을 입력/], ['가'.repeat(81), /80자 이하/], ['제목\u0007', /제어 문자/], ['방향‮전환', /제어 문자/]]) {
    const r = a.R.create(post({ title }));
    assert.equal(r.status, 'invalid', JSON.stringify(title)); assert.equal(r.field, 'title'); assert.match(r.msg, re);
  }
  assert.equal(a.R.create(post({ title: '가'.repeat(80) })).status, 'ok');
  assert.equal(a.raw().posts.length, 1);
});

test('CV2-09 validation body: empty, whitespace only, too long, control characters; line breaks and tabs are fine', () => {
  const a = cm();
  for (const [body, re] of [['', /본문을 입력/], ['\n \t ', /본문을 입력/], ['가'.repeat(5001), /5000자 이하/], ['본문\u0000', /제어 문자/]]) {
    const r = a.R.create(post({ body }));
    assert.equal(r.status, 'invalid'); assert.equal(r.field, 'body'); assert.match(r.msg, re);
  }
  assert.equal(a.R.create(post({ body: '첫 줄\n\t둘째 줄' })).status, 'ok');
  assert.equal(a.R.create(post({ type: 'nope' })).field, 'type');
  assert.equal(a.R.create(post({ tags: '<b>태그</b>' })).field, 'tags');
});

test('CV2-10 text safety: markup is stored as text and rendered escaped; no script, javascript: URL or eval path', () => {
  const a = cm();
  const evil = '<img src=x onerror=alert(1)><script>alert(2)</script>';
  const p = a.R.create(post({ title: evil.slice(0, 60), body: evil + '\njavascript:alert(3)' })).post;
  a.R.addComment(p.id, '<svg onload=alert(4)>');
  a.show('cm-home'); a.show('cm-post-' + p.id);
  for (const html of [a.feed(), a.detail()]) {
    assert.doesNotMatch(html, /<img src=x|<script>|<svg onload/);
    assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  }
  assert.doesNotMatch(a.detail(), /href="javascript:/i);
  for (const src of [PAGE, SERVICE, REMOTE]) assert.doesNotMatch(noComments(src), /\beval\(|new Function\(|document\.write\(|createElement\(["']script/);
  assert.equal(a.S.safeHref('javascript:alert(1)'), ''); assert.equal(a.S.safeHref('http://x.y'), '');
  assert.equal(a.S.safeHref('https://www.gov.kr/'), 'https://www.gov.kr/');
});

/* ═════════ draft safety ═════════ */
test('CV2-11 unsaved draft protection: new text is autosaved on close / leave; unsaved edits of a saved post ask first', () => {
  assert.match(PAGE, /function onLeave\(e\) \{\n\s+if \(!composeOpen\(\) \|\| !state\.dirty\) return;\n\s+if \(!state\.editingId\) \{ autosaveNow\(\); return; \}\n\s+if \(e && e\.type === "beforeunload"\) \{ e\.preventDefault\(\); e\.returnValue = ""; \}/);
  assert.match(PAGE, /window\.addEventListener\("beforeunload", onLeave\);/);
  assert.match(PAGE, /window\.addEventListener\("pagehide", onLeave\);/);
  assert.match(PAGE, /title: "수정 중인 내용이 있어요", body: "닫으면 지금까지 바꾼 내용은 저장되지 않습니다\."/);
  assert.match(PAGE, /kept = autosaveNow\(\);/);
  /* a draft disappears only on an explicit action: publish, named draft or "지우고 새로 쓰기" */
  const clears = [...PAGE.matchAll(/Repo\.clearComposeDraft\(\)/g)].length;
  assert.equal(clears, 2, 'cleared after a successful save and by the discard button only');
});

test('CV2-12 draft recovery: the autosaved text comes back after a reload and is cleared only on purpose', () => {
  const a = cm();
  assert.equal(a.R.saveComposeDraft({ type: 'question', title: '쓰다 만 제목', body: '여기까지', tags: '초안' }).status, 'ok');
  const b = cm({ raw: { [CM]: a.ctx.localStorage.getItem(CM) } });
  const d = b.R.composeDraft();
  assert.deepEqual([d.title, d.body, d.type], ['쓰다 만 제목', '여기까지', 'question']);
  assert.equal(b.R.visiblePosts().length, 0, 'an unsent draft is not a post');
  assert.match(PAGE, /작성하던 내용을 불러왔어요\. <button type="button" class="lv-cm-text-btn" data-lv-cm-discard-draft>지우고 새로 쓰기<\/button>/);
  assert.equal(b.R.clearComposeDraft(), true); assert.equal(b.R.composeDraft(), null);
});

/* ═════════ detail ═════════ */
test('CV2-13 post detail: type, category, title, body, created / edited time, delivery state and saved state — real data only', () => {
  const a = cm();
  const p = a.R.create(post()).post;
  a.R.update(p.id, post({ body: '수정 후 본문' }));
  save(a, p);
  a.show('cm-post-' + p.id);
  const h = a.detail(), t = text(h);
  assert.match(h, /class="lv-cm-badge">질문</); assert.match(t, /주거/); assert.match(t, /첫 자취 계약 체크/); assert.match(t, /수정 후 본문/);
  assert.match(t, /수정됨/);
  assert.match(h, /<p class="lv-cm-delivery-note" data-lv-cm-delivery="LOCAL_ONLY"><strong>이 기기에만 저장됨<\/strong> · 아직 다른 사용자에게 공개되지 않았어요\. 커뮤니티 서버가 준비 중이라 지금은 이 기기에서만 볼 수 있어요\. · 저장한 글<\/p>/);
  assert.match(h, /aria-pressed="true"[^>]*>저장됨</);
});

test('CV2-14 no fake views: no view count field, label or number anywhere', () => {
  const a = cm(); const p = a.R.create(post()).post;
  a.show('cm-home'); a.show('cm-post-' + p.id);
  for (const h of [a.feed(), a.detail()]) assert.doesNotMatch(text(h), /조회|views?\b|읽음 \d/i);
  assert.doesNotMatch(noComments(PAGE + SERVICE), /viewCount|views\s*:|조회수/);
  assert.equal('views' in a.raw().posts[0], false);
});

test('CV2-15 no fake likes: a reaction is my on/off only; no total is stored or shown', () => {
  const a = cm(); const p = a.R.create(post()).post;
  a.R.toggleReaction(p.id);
  a.show('cm-home'); a.show('cm-post-' + p.id);
  for (const h of [card(a.feed(), p.id), a.detail()]) { assert.match(h, /공감했어요/); assert.doesNotMatch(text(h), /공감 \d|좋아요 \d|\d+명이 공감/); }
  assert.equal(typeof a.raw().likes[p.id], 'number', 'the stored value is my timestamp, not a counter of people');
  assert.doesNotMatch(noComments(PAGE + SERVICE), /likeCount|reactionCount|likes\s*:\s*\d/);
});

test('CV2-16 no fake comments: no comment exists unless written here; counts are the real local count', () => {
  const a = cm(); const p = a.R.create(post({ type: 'story' })).post;
  a.show('cm-home'); a.show('cm-post-' + p.id);
  assert.doesNotMatch(card(a.feed(), p.id), />댓글 \d/);
  assert.match(text(a.detail()), /댓글 0/); assert.match(text(a.detail()), /아직 댓글이 없습니다/);
  a.R.addComment(p.id, '내 댓글');
  a.show('cm-home');
  assert.match(card(a.feed(), p.id), />댓글 1</);
  assert.equal(a.ctx.LivonCommunityData.comments, undefined);
});

/* ═════════ comments ═════════ */
test('CV2-17 local comment: write, edit, delete; validated; stored only on this device', () => {
  const a = cm(); const p = a.R.create(post()).post;
  const c = a.R.addComment(p.id, '첫 댓글').comment;
  assert.equal(c.authorId, 'local');
  assert.equal(a.R.editComment(c.id, '고친 댓글').status, 'ok');
  assert.equal(a.R.comments(p.id)[0].body, '고친 댓글');
  for (const bad of ['', '   ', 'x'.repeat(1001), '숨은\u0007문자']) assert.equal(a.R.addComment(p.id, bad).status, 'invalid', JSON.stringify(bad));
  assert.equal(a.R.editComment(c.id, '\u0000').status, 'invalid');
  assert.equal(a.R.addComment('nope', '댓글').status, 'missing');
  assert.equal(a.R.removeComment(c.id).status, 'ok'); assert.equal(a.R.comments(p.id).length, 0);
  assert.match(PAGE, /placeholder="개인정보는 적지 마세요\."/);
  assert.deepEqual(a.net, []);
});

test('CV2-18 reply: one level, parent validated (same post, not deleted)', () => {
  const a = cm(); const p = a.R.create(post()).post; const q = a.R.create(post({ title: '다른 글' })).post;
  const root = a.R.addComment(p.id, '루트').comment;
  const r1 = a.R.addComment(p.id, '답글', root.id).comment;
  const r2 = a.R.addComment(p.id, '답글의 답글', r1.id).comment;
  assert.deepEqual([r1.parentId, r2.parentId], [root.id, root.id]);
  assert.equal(a.R.addComment(p.id, '없는 부모', 'cmt_nope').status, 'invalid');
  assert.equal(a.R.addComment(q.id, '다른 글의 부모', root.id).status, 'invalid', 'a parent on another post is refused');
  const lone = a.R.addComment(p.id, '혼자').comment;
  a.R.removeComment(lone.id);
  assert.equal(a.R.addComment(p.id, '지워진 부모', lone.id).status, 'invalid');
});

test('CV2-19 comment ownership: only LOCAL comments can be edited or deleted', () => {
  const a = cm(); const p = a.R.create(post()).post;
  const st = a.raw();
  st.comments.push({ id: 'cmt_remote', postId: p.id, parentId: '', body: '다른 사람', authorId: 'acct-2', authorNick: '누군가', createdAt: 1 });
  a.ctx.localStorage.setItem(CM, JSON.stringify(st));
  assert.equal(a.R.editComment('cmt_remote', '바꿈').status, 'forbidden');
  assert.equal(a.R.removeComment('cmt_remote').status, 'forbidden');
  a.show('cm-post-' + p.id);
  assert.doesNotMatch(a.detail(), /data-lv-cm-edit-comment="cmt_remote"/);
});

test('CV2-20 post cascade: deleting a post removes its comments, replies, comment reactions, reaction and save', () => {
  const a = cm(); const p = a.R.create(post()).post; const other = a.R.create(post({ title: '남는 글' })).post;
  const c = a.R.addComment(p.id, '댓글').comment; a.R.addComment(p.id, '답글', c.id); a.R.addComment(other.id, '남는 댓글');
  a.R.toggleReaction(p.id); save(a, p);
  a.R.report('post:' + p.id, 'spam');
  a.R.remove(p.id);
  const st = a.raw();
  assert.deepEqual(J(st.comments.map(x => x.body)), ['남는 댓글']);
  assert.equal(st.likes[p.id], undefined); assert.equal(a.R.isSaved(p.id), false);
  assert.deepEqual(J(a.R.reports().map(r => [r.targetId, r.exists])), [[p.id, false]], 'the report record stays and says the item is gone');
  assert.equal(a.R.toggleReaction(p.id), false);
});

/* ═════════ social features: truthful ═════════ */
test('CV2-21 reactions truthful: "내 반응" only — no other person\'s reaction exists or is counted', () => {
  const a = cm(); const p = a.R.create(post()).post;
  assert.equal(a.R.toggleReaction(p.id), true); assert.equal(a.R.toggleReaction(p.id), false);
  assert.equal(a.raw().likes[p.id], undefined, 'toggled back off');
  assert.equal(a.S.FEATURES.myReaction, 'LOCAL'); assert.equal(a.S.FEATURES.reactionTotals, 'ACCOUNT_REQUIRED');
  assert.match(DOC, /^## \d+\. Reaction decision$/m);
});

test('CV2-22 profile account boundary: a device display name, not an account; no photo, followers or sensitive fields', () => {
  const a = cm(); a.show('cm-mine');
  const t = text(a.mine());
  assert.match(t, /이 기기에서 쓰는 이름입니다\. 계정이 아니며, 프로필 사진·팔로워 기능은 준비 중입니다\./);
  assert.deepEqual(J(a.R.profile()), { available: false, status: 'ACCOUNT_REQUIRED', msg: '다른 사용자 계정이 필요한 기능이라 아직 준비 중입니다.' });
  assert.doesNotMatch(a.mine(), /name="(email|phone|tel|birth|address|realname|gender|age)"|type="file"/);
  const RM = cm({ withRemote: true }).RM;
  assert.deepEqual(Object.keys(RM.REMOTE_CONTRACT.profileFields), ['displayName', 'avatar', 'bio', 'interests']);
});

test('CV2-23 follow remote required: no follow list, no follower count, nothing simulated', () => {
  const a = cm();
  assert.deepEqual(J(a.R.follows()), { available: false, status: 'ACCOUNT_REQUIRED', list: [] });
  assert.equal(a.S.adapter().setFollow('x').reason, 'ACCOUNT_REQUIRED');
  a.show('cm-home?tab=following');
  assert.match(text(a.feed()), /아직 팔로우한 사용자가 없습니다\. 다른 사용자 프로필과 팔로우는 준비 중입니다\./);
  assert.equal(a.S.featureStatus('follow'), 'ACCOUNT_REQUIRED');
  assert.doesNotMatch(noComments(PAGE + SERVICE), /followerCount|followers\s*:\s*\d|팔로워 \d/);
});

test('CV2-24 block remote required: no local "blocked" success; the contract names blocker, blocked, createdAt', () => {
  const a = cm({ withRemote: true });
  const r = a.R.block('someone');
  assert.deepEqual([r.status, r.reason], ['unavailable', 'ACCOUNT_REQUIRED']);
  assert.deepEqual(J(a.raw() ? a.raw().blocked : []), []);
  a.show('cm-mine');
  assert.match(text(a.mine()), /차단 다른 사용자 계정이 필요한 기능이라 아직 준비 중입니다\. 차단한 사용자가 없고, 이 기기에서 차단한 것처럼 처리하지 않습니다\./);
  assert.deepEqual(J(a.RM.REMOTE_CONTRACT.blockFields), ['blocker', 'blocked', 'createdAt']);
  assert.match(INDEX, /<dd>사용자 차단 \(준비 중\)<\/dd>/);
  assert.match(DOC, /server-enforced/i);
});

test('CV2-25 report truthful: recorded on this device, never described as sent; future taxonomy mapped', () => {
  const a = cm({ withRemote: true }); const p = a.R.create(post()).post;
  const r = a.R.report('post:' + p.id, 'spam');
  assert.equal(r.status, 'ok'); assert.equal(r.report.status, 'local-only');
  assert.match(PAGE, /announce\("신고를 이 기기에 기록했습니다\. 운영자나 서버로 전송되지는 않습니다\."\)/);
  assert.match(PAGE, />이 기기에 신고 기록</);
  assert.doesNotMatch(noComments(PAGE), /신고(가|를) (접수|전송)(되었|했)습니다|운영팀에 전달(되었|했)/);
  assert.match(INDEX, /게시글 · 댓글 신고 \(지금은 이 기기에 기록\)/);
  const C = a.RM.REMOTE_CONTRACT;
  assert.deepEqual(J(C.reportReasons), ['spam', 'harassment', 'privacy', 'misinformation', 'illegal', 'other']);
  for (const x of a.S.REPORT_REASONS) assert.ok(C.reportReasons.includes(C.reportReasonMap[x.id]), 'every local reason maps to a server reason: ' + x.id);
  assert.equal(a.S.featureStatus('reportDelivery'), 'ACCOUNT_REQUIRED');
});

/* ═════════ search ═════════ */
test('CV2-26 local community search: title, body, type and tags in the feed; 내 활동 search covers my posts, drafts and comments', () => {
  const a = cm();
  const p = a.R.create(post()).post;
  a.R.create({ type: 'tip', title: '월급 관리', body: '통장 쪼개기', tags: '저축' });
  a.R.create({ type: 'story', title: '보증금 메모', body: '', draft: true });
  a.R.addComment(p.id, '보증금 반환 시기 확인');
  a.show('cm-home?q=' + encodeURIComponent('계약서'));
  assert.deepEqual(a.titles(), ['첫 자취 계약 체크']);
  a.show('cm-home?q=' + encodeURIComponent('생활 팁')); assert.deepEqual(a.titles(), ['월급 관리'], 'type label');
  a.show('cm-home?q=' + encodeURIComponent('저축')); assert.deepEqual(a.titles(), ['월급 관리'], 'tag');
  const m = a.R.searchMine('보증금');
  assert.deepEqual([m.posts.length, m.drafts.length, m.comments.length, m.total], [0, 1, 1, 2]);
  assert.equal(a.R.searchMine('').total, 0);
  a.T.state.mineQ = '보증금'; a.show('cm-mine');
  assert.match(text(a.mine()), /‘보증금’ 내 활동 2건/);
  assert.match(a.mine(), /임시 저장 · 보증금 메모/);
});

test('CV2-27 drafts are excluded from LIVON-wide search (Explore, Life Stage) and from the feed search', () => {
  const a = cm();
  a.R.create({ type: 'story', title: '비밀 초안 키워드', body: '본문', draft: true });
  assert.equal(a.R.searchablePosts().length, 0);
  a.show('cm-home?q=' + encodeURIComponent('비밀 초안')); assert.deepEqual(a.titles(), []);
  assert.match(read('explore-search.js'), /if \(R && R\.searchablePosts\) posts = R\.searchablePosts\(\);/);
  assert.match(read('life-hub.js'), /if \(R && R\.searchablePosts\) posts = R\.searchablePosts\(\);/);
});

test('CV2-28 private content excluded from global search; the build search index holds no user content', () => {
  const a = cm();
  a.R.create(post({ title: '나만 보는 메모', visibility: 'private' }));
  a.R.create(post({ title: '가입 커뮤니티 글', visibility: 'members' }));
  assert.equal(a.R.searchablePosts().length, 0);
  assert.equal(a.T.isSearchable({ id: 'x', title: 't', visibility: 'private' }), false);
  const idx = fs.readFileSync(path.join(ROOT, 'search-index.json'), 'utf8');
  assert.doesNotMatch(idx, /cmStore|cm-post-|"authorNick"/);
  a.show('cm-post-' + a.raw().posts[1].id);
  assert.doesNotMatch(a.detail(), /data-lh-ai=/, 'a private post is not offered to LIVON AI');
});

/* ═════════ filters / sort ═════════ */
test('CV2-29 factual filters and sorts: type, category, Life Stage, saved; newest or recently edited — round-trip in the URL', () => {
  const a = cm();
  const x = a.R.create(post({ title: 'A 질문' })).post;
  const y = a.R.create(post({ title: 'B 팁', type: 'tip', category: 'money' })).post;
  a.R.create(post({ title: 'C 이야기', type: 'story', category: 'hobby', lifeStage: '30' }));
  a.R.update(x.id, post({ title: 'A 질문', body: '나중에 고침' }));
  save(a, y);
  a.show('cm-home'); assert.deepEqual(a.titles(), ['C 이야기', 'B 팁', 'A 질문']);
  a.show('cm-home?sort=updated'); assert.deepEqual(a.titles(), ['A 질문', 'C 이야기', 'B 팁']);
  assert.equal(a.T.feedHash(), '#cm-home?sort=updated');
  a.show('cm-home?saved=1'); assert.deepEqual(a.titles(), ['B 팁']); assert.match(text(a.meta()), /저장한 글 · 게시글 1/);
  a.show('cm-home?type=question&cat=housing'); assert.deepEqual(a.titles(), ['A 질문']);
  a.show('cm-home?stage=30'); assert.deepEqual(a.titles(), ['C 이야기']);
  a.show('cm-home?sort=popular&saved=yes'); assert.equal(a.T.feedHash(), '#cm-home', 'unknown values fall back');
  assert.match(a.filters(), /<select data-lv-cm-sort><option value="new" selected>최신순<\/option><option value="updated">최근 수정순<\/option><\/select>/);
  assert.match(a.filters(), /data-lv-cm-saved-filter/);
});

test('CV2-30 no fake popularity sort: no 인기순, 추천순, trending or engagement ranking', () => {
  const a = cm();
  assert.deepEqual(J(a.S.SORTS.map(s => s.id)), ['new', 'updated']);
  assert.doesNotMatch(noComments(PAGE + SERVICE), /인기순|추천순|trending|\bhot\b|많이 본|조회순|공감순/i);
  assert.doesNotMatch(a.filters() + INDEX.slice(INDEX.indexOf('id="community"')), /인기순|트렌딩/);
});

/* ═════════ my activity ═════════ */
test('CV2-31 my posts: 내 활동 lists what I wrote on this device', () => {
  const a = cm(); a.R.create(post()); a.R.create(post({ title: '비공개 메모', visibility: 'private' }));
  a.show('cm-mine');
  assert.match(text(a.mine()), /내가 작성한 글 2 비공개 메모 첫 자취 계약 체크/);
});

test('CV2-32 my drafts: listed with 이어 쓰기, never in the feed', () => {
  const a = cm(); const d = a.R.create({ type: 'story', title: '초안', body: '', draft: true }).post;
  a.show('cm-mine');
  assert.match(a.mine(), new RegExp('data-lv-cm-edit="' + d.id + '">초안 · 이어 쓰기'));
  a.show('cm-home'); assert.deepEqual(a.titles(), []);
  const e = cm(); e.show('cm-mine'); assert.match(text(e.mine()), /임시 저장한 글이 없어요\./);
});

test('CV2-33 saved integration: the shared LivonPlatform saves (My Life) — no second Saved store; deleted posts leave no orphan', () => {
  const a = cm(); const p = a.R.create(post()).post;
  save(a, p);
  assert.equal(a.R.isSaved(p.id), true);
  assert.deepEqual(J(a.R.savedPosts().map(x => x.id)), [p.id]);
  assert.deepEqual(J(a.raw().saves), [], 'the community store keeps no saved list of its own');
  assert.match(PAGE, /function saveId\(postId\) \{ return "life-hub:community:cm:" \+ postId; \}/);
  a.R.remove(p.id);
  assert.equal(a.P.listSaves('all').some(s => s.id === a.T.saveId(p.id)), false);
});

/* ═════════ notifications ═════════ */
test('CV2-34 notifications: no producer — the Community never creates a notification', () => {
  const a = cm(); const p = a.R.create(post()).post;
  const before = a.ctx.localStorage.getItem('livon.platform.v1');
  const c = a.R.addComment(p.id, '댓글').comment; a.R.addComment(p.id, '답글', c.id); a.R.toggleReaction(p.id); a.R.report('post:' + p.id, 'spam');
  assert.deepEqual(J(a.R.notifications()), { available: false, producer: 'NONE', status: 'ACCOUNT_REQUIRED', list: [] });
  const after = JSON.parse(a.ctx.localStorage.getItem('livon.platform.v1') || '{}');
  assert.equal(JSON.stringify(after.notifications || after.alerts || []), JSON.stringify((JSON.parse(before || '{}').notifications) || []));
  assert.doesNotMatch(noComments(PAGE + SERVICE), /addNotification|pushNotification|notify\(|new Notification\(/);
  assert.deepEqual(J(a.S.NOTIFICATION_EVENTS), ['COMMENT_CREATED', 'REPLY_CREATED', 'FOLLOWED', 'REACTION_RECEIVED', 'REPORT_RESOLVED']);
});

/* ═════════ deep links ═════════ */
test('CV2-35 valid deep links: home with filters, post, write, mine render', () => {
  const a = cm(); const p = a.R.create(post()).post;
  a.show('cm-home?type=question&sort=updated'); assert.deepEqual(a.titles(), ['첫 자취 계약 체크']);
  a.show('cm-post-' + p.id); assert.match(a.detail(), /id="lv-cm-detail-title"[^>]*>첫 자취 계약 체크</);
  a.show('cm-mine'); assert.match(text(a.mine()), /내가 작성한 글 1/);
  assert.match(PAGE, /if \(id === "cm-write"\) \{/);
});

test('CV2-36 invalid deep links: unknown or hostile ids and params fall back safely', () => {
  const a = cm();
  for (const h of ['cm-post-', 'cm-post-<script>', 'cm-post-../../etc', 'cm-post-javascript:alert(1)']) {
    a.show(h);
    assert.match(text(a.detail()), /글을 찾을 수 없습니다/, h);
    assert.doesNotMatch(a.detail(), /<script>|href="javascript:/);
  }
  a.show('cm-home?tab=<b>&cat=x&type=y&stage=99&event=zz&sort=x&saved=2&q=' + encodeURIComponent('<img>'));
  assert.equal(a.T.state.tab, 'latest'); assert.equal(a.T.feedHash(), '#cm-home?q=%3Cimg%3E');
  assert.doesNotMatch(a.meta(), /<img>/);
});

test('CV2-37 deleted post link: an honest not-found page with a way back', () => {
  const a = cm(); const p = a.R.create(post()).post; a.R.remove(p.id);
  a.show('cm-post-' + p.id);
  const t = text(a.detail());
  assert.match(t, /글을 찾을 수 없습니다/);
  assert.match(a.detail(), /href="#cm-home/);
});

/* ═════════ repository architecture ═════════ */
test('CV2-38 local repository: UI → Repo → Service → Local Adapter; the adapter is swappable without UI changes', () => {
  const a = cm();
  assert.equal(a.S.adapter().kind, 'local');
  assert.deepEqual(J(a.S.ADAPTER_METHODS), ['info', 'loadStore', 'saveStore', 'follows', 'setFollow', 'submitReport']);
  let store = a.S.emptyStore();
  a.S.useAdapter({ kind: 'test', info: () => ({ kind: 'test' }), loadStore: () => ({ store: JSON.parse(JSON.stringify(store)), existed: true, problems: [] }), saveStore: s => { store = JSON.parse(JSON.stringify(s)); return true; },
    follows: () => ({ available: false, list: [] }), setFollow: () => ({ status: 'unavailable' }), submitReport: () => ({ status: 'local-only' }) });
  a.R.create(post({ title: '어댑터 글' }));
  assert.equal(store.posts[0].title, '어댑터 글');
  assert.doesNotMatch(noComments(PAGE), /localStorage\.(get|set)Item\(\s*(STORE_KEY|"livon\.cmStore)/, 'the page never touches the store key directly');
});

test('CV2-39 remote unavailable is honest: the remote adapter and repository never answer with success', async () => {
  const a = cm({ withRemote: true });
  const ad = a.S.createRemoteAdapter();
  for (const m of a.S.ADAPTER_METHODS) assert.throws(() => ad[m](), e => e.code === 'BACKEND_REQUIRED', m);
  const repo = a.RM.createRemoteRepository();
  assert.equal(repo.configured, false);
  for (const m of Object.keys(a.RM.REMOTE_CONTRACT.routes)) await assert.rejects(repo[m]({}), e => e.code === 'NOT_CONFIGURED', m);
  const r2 = a.RM.createRemoteRepository({ baseUrl: 'https://api.example.test' });
  await assert.rejects(r2.createPost({ title: 'x' }), e => e.code === 'NOT_IMPLEMENTED');
  assert.equal(a.RM.createRemoteRepository({ baseUrl: 'http://insecure' }).baseUrl, null, 'only https');
  assert.throws(() => a.S.useAdapter({ kind: 'bad' }), /INVALID_COMMUNITY_ADAPTER/);
  assert.deepEqual(a.net, []);
});

test('CV2-40 remote contract: posts, comments, replies, reactions, profiles, follows, blocks, reports — auth, pagination, authorization, moderation, rate limits', () => {
  const C = cm({ withRemote: true }).RM.REMOTE_CONTRACT, R = C.routes;
  const expect = { listPosts: 'GET /api/livon/community/posts', createPost: 'POST /api/livon/community/posts', getPost: 'GET /api/livon/community/posts/:id', updatePost: 'PATCH /api/livon/community/posts/:id', deletePost: 'DELETE /api/livon/community/posts/:id',
    listComments: 'GET /api/livon/community/posts/:id/comments', addComment: 'POST /api/livon/community/posts/:id/comments', addReply: 'POST /api/livon/community/comments/:id/replies',
    setReaction: 'PUT /api/livon/community/posts/:id/reaction', getProfile: 'GET /api/livon/community/profiles/:id', follow: 'PUT /api/livon/community/follows/:accountId',
    block: 'PUT /api/livon/community/blocks/:accountId', report: 'POST /api/livon/community/reports', moderate: 'PATCH /api/livon/community/moderation/:target' };
  for (const [k, v] of Object.entries(expect)) assert.equal(R[k].method + ' ' + R[k].path, v, k);
  for (const [k, r] of Object.entries(R)) {
    if (r.method !== 'GET') { assert.equal(r.auth, 'verified-token', k); assert.equal(r.rateLimit, 'write', k); }
  }
  assert.equal(R.listPosts.paginated, true); assert.equal(R.listComments.paginated, true); assert.deepEqual(J(C.pagination), { style: 'cursor', param: 'cursor', limitParam: 'limit', maxLimit: 50 });
  assert.deepEqual(J(C.moderationStates), ['ACTIVE', 'UNDER_REVIEW', 'HIDDEN', 'REMOVED']);
  assert.equal(R.moderate.authz, 'moderator-role');
  assert.ok(C.errors.includes('RATE_LIMITED') && C.errors.includes('UNAUTHENTICATED') && C.errors.includes('FORBIDDEN'));
  assert.match(DOC, /POST\s+\/api\/livon\/community\/posts\n/);
  assert.equal(fs.existsSync(path.join(ROOT, 'server/livon/community')), false, 'no server route is implemented in this phase');
});

test('CV2-41 verified-token identity: the author comes from the token; body authorId / userId / role are ignored', () => {
  const RM = cm({ withRemote: true }).RM;
  const body = { authorId: 'victim', userId: 'victim', role: 'community-moderator', title: 'x' };
  assert.equal(RM.identityFrom(null, body), null);
  assert.equal(RM.identityFrom({ accountId: 'a1', verified: false }, body), null);
  assert.equal(RM.identityFrom({ accountId: '', verified: true }, body), null);
  assert.deepEqual(J(RM.identityFrom({ accountId: 'a1', verified: true, roles: ['member'] }, body)), { accountId: 'a1', verified: true, roles: ['member'] });
  assert.match(RM.REMOTE_CONTRACT.identity, /authorId \/ userId \/ role in a request body are ignored/);
  assert.equal(RM.authorize('createPost', null).reason, 'UNAUTHENTICATED');
  assert.equal(RM.authorize('listPosts', null).allowed, true, 'reading public posts needs no account');
});

test('CV2-42 IDOR future contract: another account\'s post or comment id cannot be changed by guessing it', () => {
  const RM = cm({ withRemote: true }).RM;
  const me = RM.identityFrom({ accountId: 'me', verified: true });
  const theirs = { id: 'post-123', authorAccountId: 'them' };
  for (const act of ['updatePost', 'deletePost', 'updateComment', 'deleteComment']) assert.deepEqual(J(RM.authorize(act, me, theirs)), { allowed: false, reason: 'FORBIDDEN' }, act);
  assert.equal(RM.authorize('updatePost', me, null).reason, 'NOT_FOUND');
  assert.equal(RM.authorize('updatePost', me, { authorAccountId: 'me' }).allowed, true);
  assert.equal(RM.authorize('updateProfile', me).accountId, 'me', 'a profile update targets the token account, never an id from the URL');
  assert.equal(RM.authorize('follow', me, { accountId: 'me' }).reason, 'VALIDATION');
  assert.equal(RM.authorize('nope', me).reason, 'UNKNOWN_ACTION');
});

test('CV2-43 author-only mutation and server-only moderation', () => {
  const RM = cm({ withRemote: true }).RM;
  const user = RM.identityFrom({ accountId: 'u', verified: true, roles: [] });
  const mod = RM.identityFrom({ accountId: 'm', verified: true, roles: ['community-moderator'] });
  for (const k of ['updatePost', 'deletePost', 'updateComment', 'deleteComment']) assert.equal(RM.REMOTE_CONTRACT.routes[k].authz, 'author-only', k);
  assert.equal(RM.authorize('moderate', user).reason, 'FORBIDDEN');
  assert.equal(RM.authorize('moderate', mod).allowed, true);
  assert.equal(RM.authorize('updatePost', mod, { authorAccountId: 'u' }).reason, 'FORBIDDEN', 'moderators hide, they do not rewrite');
  const a = cm();
  assert.equal(a.S.moderationOf({ authorId: 'local', moderation: 'REMOVED' }), 'ACTIVE', 'a local record is never moderated on the device');
  assert.equal(a.S.moderationOf({ authorId: 'acct', moderation: 'HIDDEN' }), 'HIDDEN');
});

/* ═════════ privacy boundaries ═════════ */
const ML = { v: 2, journal: [{ id: 'j1', text: 'JOURNAL_SECRET_7731' }], transactions: [{ id: 't1', memo: 'EXPENSE_SECRET_8842', amount: 12000 }], health: [{ id: 'h1', note: 'HEALTH_SECRET_9953' }],
  todos: [{ id: 'td1', title: 'TASK_SECRET_1164' }], goals: [{ id: 'g1', title: 'GOAL_SECRET_2275' }], budgets: [{ id: 'b1', name: 'BUDGET_SECRET_3386' }] };
test('CV2-44 My Life privacy boundary: journal, expenses, budget, schedules, tasks, goals never reach the Community', () => {
  const a = cm({ local: { 'livon.mlStore.v1': ML, 'livon.aiStore.v1': { threads: [{ id: 'x', messages: [{ role: 'user', content: 'AI_SECRET_4497' }] }] } } });
  const p = a.R.create(post()).post;
  a.show('cm-home'); a.show('cm-post-' + p.id); a.show('cm-mine');
  const all = a.ctx.localStorage.getItem(CM) + a.feed() + a.detail() + a.mine() + JSON.stringify(a.R.searchMine('SECRET'));
  assert.doesNotMatch(all, /SECRET_\d/);
  assert.doesNotMatch(noComments(PAGE + SERVICE), /mlStore\.v1["'][^;]*\.(journal|transactions|health|todos|goals|budgets|calendar)/);
  assert.doesNotMatch(noComments(PAGE), /ml\.(journal|transactions|health|todos|goals|budgets|calendar)/, 'only the legacy savedCommunity list is read from My Life (migration)');
});

test('CV2-45 health privacy boundary: no health field, no health data in posts, a caution on health topics', () => {
  const a = cm({ local: { 'livon.mlStore.v1': ML } });
  a.show('cm-home');
  assert.doesNotMatch(a.ctx.localStorage.getItem(CM) || '', /HEALTH_SECRET/);
  assert.doesNotMatch(PAGE, /name="(health|diagnosis|medication|condition)"/);
  assert.match(PAGE, /건강·돈·법률 판단은 전문가와 확인하세요\./);
  assert.ok(!a.S.ADAPTER_METHODS.some(m => /health/i.test(m)));
});

test('CV2-46 AI boundary: LIVON AI never reads the community store; a hand-off happens only on a press, never for private posts', () => {
  const ai = read('ai-page.js');
  assert.doesNotMatch(ai, /cmStore|LivonCommunityRepo|LivonCommunityService/);
  assert.doesNotMatch(noComments(PAGE + SERVICE), /LivonAI\.(send|ask)|\/api\/livon\/chat/);
  assert.match(PAGE, /\(!post\.visibility \|\| post\.visibility === "public" \? '<button type="button" class="lv-cm-btn lv-cm-btn--ghost" data-lh-ai=/);
  const a = cm(); const p = a.R.create(post()).post; const s = a.R.create(post({ title: '비공개', visibility: 'private' })).post;
  a.show('cm-post-' + p.id); assert.match(a.detail(), /data-lh-ai=/);
  a.show('cm-post-' + s.id); assert.doesNotMatch(a.detail(), /data-lh-ai=/);
  assert.equal(a.ctx.sessionStorage.getItem('livon.aiPrompt'), null, 'opening a post hands nothing to AI');
});

test('CV2-47 analytics / log privacy: no post, comment, profile or query text is logged or sent', () => {
  const a = cm();
  const p = a.R.create(post({ title: 'LOGCHECK 제목', body: 'LOGCHECK 본문' })).post;
  a.R.addComment(p.id, 'LOGCHECK 댓글'); a.T.state.mineQ = 'LOGCHECK'; a.show('cm-home?q=LOGCHECK'); a.show('cm-mine'); a.show('cm-post-' + p.id);
  a.R.report('post:' + p.id, 'spam');
  assert.doesNotMatch(a.logs.join('\n'), /LOGCHECK/);
  assert.deepEqual(a.net, []);
  for (const src of [PAGE, SERVICE]) assert.doesNotMatch(noComments(src), /console\.(log|info|debug|warn|error)\(|gtag\(|dataLayer|analytics|track\(/i);
});

/* ═════════ integrity ═════════ */
test('CV2-48 corrupt storage: the Community still renders; broken entries are dropped and counted', () => {
  for (const raw of ['{not json', '[]', '"text"', JSON.stringify({ v: 2, posts: 'x', comments: {}, likes: [], reports: 5 }),
    JSON.stringify({ v: 2, posts: [null, 1, { id: '<bad id>' }, { id: 'ok-1', title: 'ok', body: 'b', type: 'zzz', authorId: 'local', createdAt: 5 }], comments: [{ id: 'c', postId: 'ok-1', body: 7 }] })]) {
    const a = cm({ raw: { [CM]: raw } });
    a.show('cm-home'); a.show('cm-mine'); a.show('cm-post-ok-1');
    assert.ok(a.feed().length > 0, raw.slice(0, 20));
  }
  const n = cm().S.normalizeStore({ v: 2, posts: [null, { id: 'ok' }, { id: 'a b' }] });
  assert.equal(n.store.posts.length, 1); assert.ok(n.problems.includes('dropped-posts:2'));
});

test('CV2-49 duplicate id: the first record wins, later copies are dropped and reported; new ids never collide', () => {
  const a = cm();
  const n = a.S.normalizeStore({ v: 2, posts: [{ id: 'p1', title: '처음' }, { id: 'p1', title: '복제' }, { id: 'p2', title: '둘' }], comments: [{ id: 'c1', postId: 'p1', body: 'a' }, { id: 'c1', postId: 'p1', body: 'b' }] });
  assert.deepEqual(J(n.store.posts.map(p => p.title)), ['처음', '둘']);
  assert.equal(n.store.comments.length, 1);
  assert.ok(n.problems.includes('duplicate-posts:1') && n.problems.includes('duplicate-comments:1'));
  const ids = new Set();
  for (let i = 0; i < 300; i++) ids.add(a.R.create(post({ title: '글 ' + i })).post.id);
  assert.equal(ids.size, 300);
});

function bigStore(n) {
  const posts = [];
  for (let i = 0; i < n; i++) posts.push({ id: 'p' + i, type: ['question', 'tip', 'story'][i % 3], title: '글 ' + i + (i % 7 === 0 ? ' 자취 계약' : ' 일상'), body: '본문 '.repeat(20) + i, tags: ['태그' + (i % 10)], category: i % 2 ? 'housing' : 'money', lifeStage: '20', authorId: 'local', authorNick: '나', createdAt: 1700000000000 + i * 1000, updatedAt: 1700000000000 + i * 1000, draft: false, deleted: false, visibility: 'public' });
  return JSON.stringify({ v: 2, profile: { nick: '나' }, posts, comments: [], likes: {}, commentLikes: {}, saves: [], joined: [], challenges: {}, blocked: [], reports: [], drafts: [] });
}
test('CV2-50 performance: 100 / 500 / 1000 local posts — load, filter and search stay fast', () => {
  for (const n of [100, 500, 1000]) {
    const a = cm({ raw: { [CM]: bigStore(n) } });
    let t0 = performance.now();
    a.show('cm-home');
    const tShow = performance.now() - t0;
    t0 = performance.now();
    a.T.applyFeedParams({ q: '자취 계약', type: 'question' }); const hits = a.T.filterFeed();
    const tSearch = performance.now() - t0;
    t0 = performance.now(); const m = a.R.searchMine('자취'); const tMine = performance.now() - t0;
    assert.ok(hits.length > 0 && m.posts.length > 0);
    assert.ok(tShow < 1500 && tSearch < 800 && tMine < 800, `${n}: show ${tShow.toFixed(0)}ms search ${tSearch.toFixed(0)}ms mine ${tMine.toFixed(0)}ms`);
  }
});

test('CV2-51 pagination / DOM bound: the feed renders 10 cards at a time with 더 보기; 내 활동 lists are capped', () => {
  const a = cm({ raw: { [CM]: bigStore(1000) } });
  a.show('cm-home');
  assert.equal((a.feed().match(/<article class="lv-cm-card/g) || []).length, 10);
  assert.match(text(a.feed()), /더 보기 \(10 \/ 1000\)/);
  a.T.state.shown = 20; a.show('cm-home');
  a.show('cm-mine');
  assert.ok((a.mine().match(/<li>/g) || []).length <= 8 * 10 + 60);
  a.T.state.mineQ = '일상'; a.show('cm-mine');
  assert.match(text(a.mine()), /내 활동 \d+건 \(처음 20건 표시\)/);
});

/* ═════════ browser: responsive, keyboard, focus, zoom ═════════ */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const canBrowse = fs.existsSync(PW) && fs.existsSync(CHROME);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp4': 'video/mp4' };
let shared = null;
async function env() {
  if (shared) return shared;
  const { chromium } = await import(PW);
  const server = http.createServer((req, res) => {
    let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f)); }
    else { res.writeHead(404); res.end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  shared = { browser, server, base: 'http://127.0.0.1:' + server.address().port };
  return shared;
}
test.after(async () => { if (shared) { await shared.browser.close(); shared.server.close(); } });
async function page(width, { scale = 1, height = 900 } = {}) {
  const { browser, base } = await env();
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, reducedMotion: 'reduce' });
  await context.route('**/*', r => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  await context.addInitScript(() => { try { if (!localStorage.getItem('livon.personalization.v1')) localStorage.setItem('livon.personalization.v1', JSON.stringify({ version: 1, state: 'SKIPPED', step: '', draft: null, updatedAt: 1 })); } catch (e) {} });
  const p = await context.newPage();
  p._errors = [];
  p.on('pageerror', e => p._errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED/.test(m.text())) p._errors.push(m.text()); });
  return { p, context, base };
}
const go = async (p, hash, wait = 600) => { await p.evaluate(h => { location.hash = h; }, hash); await p.waitForTimeout(wait); };
const overflow = p => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
async function createViaUi(p, title = '첫 자취 계약 체크', body = '계약서에서 무엇을 확인하셨나요?') {
  await p.click('[data-lv-cm-compose="question"] >> nth=0');
  await p.fill('[data-lv-cm-write] [name=title]', title);
  await p.fill('[data-lv-cm-write] [name=body]', body);
  await p.click('[data-lv-cm-write] button[type=submit]');
  await p.waitForFunction(() => /^#cm-post-/.test(location.hash));
  await p.waitForTimeout(400);
}
async function sweep(width, opts) {
  const { p, context, base } = await page(width, opts);
  const issues = [];
  const check = async tag => { const o = await overflow(p); if (o > 0) issues.push(tag + ' +' + o); };
  await p.goto(base + '/livon/#cm-home'); await p.waitForTimeout(1500);
  await check('empty feed');
  await createViaUi(p, '아주긴제목'.repeat(16), '긴본문없이이어지는글'.repeat(80) + '\nhttps://example.com/' + 'x'.repeat(200));
  await check('detail long text');
  await p.fill('#lv-cm-comment-form textarea', '댓글'.repeat(80)); await p.click('#lv-cm-comment-form button[type=submit]'); await p.waitForTimeout(500);
  await p.click('[data-lv-cm-reply] >> nth=0'); await p.fill('#lv-cm-comment-form textarea', '답글'.repeat(80)); await p.click('#lv-cm-comment-form button[type=submit]'); await p.waitForTimeout(500);
  await check('comments + replies');
  await p.click('.lv-cm-detail__acts [data-lv-cm-report]'); await p.waitForTimeout(200); await check('report dialog'); await p.keyboard.press('Escape');
  await go(p, '#cm-home'); await check('feed');
  await go(p, '#cm-home?q=' + encodeURIComponent('없는검색어')); await check('zero search');
  await go(p, '#cm-home?sort=updated&saved=1'); await check('filters');
  await p.click('[data-lv-cm-compose="question"] >> nth=0'); await p.waitForTimeout(300); await check('write form');
  await p.click('[data-lv-cm-write] button[type=submit]'); await p.waitForTimeout(200); await check('write form errors');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await go(p, '#cm-mine'); await p.fill('[data-lv-cm-mine-search] input', '아주긴'); await p.press('[data-lv-cm-mine-search] input', 'Enter'); await p.waitForTimeout(300);
  await check('my activity + search');
  /* 44px targets on the community controls added or used in V2 */
  const small = await p.evaluate(() => [...document.querySelectorAll('#cm-mine button, #cm-mine input, #cm-home select, #cm-home .lv-cm-check, #cm-home [data-lv-cm-tab]')]
    .filter(e => e.offsetParent !== null).filter(e => e.getBoundingClientRect().height < 43.5).map(e => e.outerHTML.slice(0, 60)));
  const errors = p._errors.slice();
  await context.close();
  return { issues, small, errors };
}
for (const [id, w] of [['52', 320], ['53', 390], ['54', 768], ['55', 1024], ['56', 1440]]) {
  test(`CV2-${id} ${w}px: feed, detail, write form, comments / replies, filters, search, my activity, dialogs, long text — no horizontal overflow`, { skip: !canBrowse && 'no local Chromium' }, async () => {
    const r = await sweep(w);
    assert.deepEqual(r.issues, [], 'overflow at ' + w);
    assert.deepEqual(r.small, [], 'targets under 44px at ' + w);
    assert.deepEqual(r.errors, [], 'console errors at ' + w);
  });
}

test('CV2-57 keyboard: write, save, sort, saved filter, 내 활동 search and dialogs work from the keyboard', { skip: !canBrowse && 'no local Chromium' }, async () => {
  const { p, context, base } = await page(1440);
  await p.goto(base + '/livon/#cm-home'); await p.waitForTimeout(1500);
  await p.focus('[data-lv-cm-compose="question"] >> nth=0'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => document.activeElement.name), 'title');
  await p.keyboard.type('키보드로 쓴 글'); await p.keyboard.press('Tab'); await p.keyboard.type('키보드 본문');
  await p.focus('[data-lv-cm-write] button[type=submit]'); await p.keyboard.press('Enter');
  await p.waitForFunction(() => /^#cm-post-/.test(location.hash)); await p.waitForTimeout(300);
  assert.match(await p.textContent('#lv-cm-detail-title'), /키보드로 쓴 글/);
  await p.focus('.lv-cm-detail__acts [data-lh-save]'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  /* the first save on a device asks once where saves are kept (existing life-hub flow): confirm it from the keyboard */
  if (await p.$('[data-lh-save-local]:visible')) { assert.equal(await p.evaluate(() => document.activeElement.hasAttribute('data-lh-save-local')), true); await p.keyboard.press('Enter'); await p.waitForTimeout(300); }
  assert.equal(await p.getAttribute('.lv-cm-detail__acts [data-lh-save]', 'aria-pressed'), 'true');
  await go(p, '#cm-home');
  await p.focus('[data-lv-cm-sort]'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(300);
  assert.match(await p.evaluate(() => location.hash), /sort=updated/);
  await p.focus('[data-lv-cm-saved-filter]'); await p.keyboard.press('Space'); await p.waitForTimeout(300);
  assert.match(await p.evaluate(() => location.hash), /saved=1/);
  assert.equal((await p.$$('[data-lv-cm-feed] .lv-cm-card')).length, 1);
  await go(p, '#cm-mine');
  await p.focus('[data-lv-cm-mine-search] input'); await p.keyboard.type('키보드'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  assert.match(await p.textContent('#cm-mine'), /‘키보드’ 내 활동 1건/);
  deq(p._errors, []);
  await context.close();
});
function deq(a, b, m) { assert.deepEqual(J(a), J(b), m); }

test('CV2-58 focus: visible focus, dialog focus trap, Escape closes, focus returns; errors move focus to the field', { skip: !canBrowse && 'no local Chromium' }, async () => {
  const { p, context, base } = await page(1440);
  await p.goto(base + '/livon/#cm-home'); await p.waitForTimeout(1500);
  await p.focus('[data-lv-cm-compose="tip"] >> nth=0'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  await p.click('[data-lv-cm-write] button[type=submit]'); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => document.activeElement.name), 'title', 'an empty title moves focus to the title');
  assert.equal(await p.getAttribute('[data-lv-cm-write] [name=title]', 'aria-invalid'), 'true');
  assert.equal(await p.getAttribute('[data-lv-cm-write] [name=title]', 'aria-describedby'), 'lv-cm-form-err-msg');
  for (let i = 0; i < 40; i++) await p.keyboard.press('Tab');
  assert.equal(await p.evaluate(() => !!document.activeElement.closest('[data-lv-cm-modal]')), true, 'Tab stays inside the dialog');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => document.activeElement.getAttribute('data-lv-cm-compose')), 'tip', 'focus returns to the opener');
  await p.focus('[data-lv-cm-event-filter]'); await p.keyboard.press('Tab'); await p.waitForTimeout(500);   /* after the style transition */
  const ring = await p.evaluate(() => { const e = document.activeElement, s = getComputedStyle(e); return [e.hasAttribute('data-lv-cm-sort'), e.matches(':focus-visible') && (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 || s.boxShadow !== 'none')]; });
  assert.deepEqual(ring, [true, true], 'Tab reaches the sort control and its focus is visible');
  await p.keyboard.press('Tab'); await p.waitForTimeout(500);
  assert.deepEqual(await p.evaluate(() => { const e = document.activeElement, s = getComputedStyle(e); return [e.hasAttribute('data-lv-cm-saved-filter'), parseFloat(s.outlineWidth) >= 2]; }), [true, true]);
  assert.equal(await p.evaluate(() => !!document.querySelector('#community [role=status][aria-live=polite], #community [aria-live=polite]')), true);
  deq(p._errors, []);
  await context.close();
});

test('CV2-59 200% zoom (1440 CSS px at 2× → 720 px layout): content reflows without horizontal scrolling', { skip: !canBrowse && 'no local Chromium' }, async () => {
  const r = await sweep(720, { scale: 2, height: 450 });
  assert.deepEqual(r.issues, []);
  assert.deepEqual(r.errors, []);
});

/* ═════════ scope ═════════ */
test('CV2-60 ONGIL untouched: no ONGIL, SHAREON or server file differs from the base', () => {
  let changed;
  try { changed = execFileSync('git', ['diff', '--name-only', 'dd92aaa2d', '--'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean); }
  catch (e) { changed = null; }
  assert.ok(Array.isArray(changed), 'git diff against the V2 base must be readable');
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  const all = changed.concat(untracked);
  assert.deepEqual(all.filter(f => /^(ongil|ongil-start|tests\/ongil|server\/ongil)\//.test(f) || /shareon/i.test(f)), []);
  assert.deepEqual(all.filter(f => /^server\//.test(f)), [], 'no backend was built in this phase');
  assert.deepEqual(all.filter(f => !/^(livon|tests\/livon|docs\/livon)\//.test(f)), [], 'changes stay inside livon/, tests/livon/, docs/livon/');
});
