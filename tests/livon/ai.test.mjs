import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, readdirSync } from 'node:fs';
import { normalizeInput, INSTRUCTIONS, generateReply } from '../../server/livon/chat.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const J = x => JSON.parse(JSON.stringify(x));

function app({ local = {} } = {}) {
  const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };
  const ctx = {
    window: {}, localStorage: mem(), sessionStorage: mem(), location: { hash: '#ai-chat', origin: 'https://www.newon.app', pathname: '/livon/' }, navigator: {}, URL,
    history: { state: null, replaceState() {}, pushState() {} },
    document: { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null }, contains: () => false },
    fetch: () => Promise.reject(new Error('no network in tests')), setTimeout, clearTimeout, console, addEventListener() {}, AbortController,
  };
  ctx.window = ctx;
  ctx.LivonPlatform = { listSaves: () => [], saveItem() {}, removeSave() {}, folders: () => [] };
  for (const [k, v] of Object.entries(local)) ctx.localStorage.setItem(k, JSON.stringify(v));
  vm.createContext(ctx);
  for (const f of ['data/livon-user-data.js', 'explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js', 'explore-search.js', 'community-page.js', 'life-now-data.js', 'life-now-page.js', 'ai-page.js']) vm.runInContext(read(f), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  return { ctx, T: ctx.LivonAI._test, hub: ctx.LivonLifeHub, ml: () => JSON.parse(ctx.localStorage.getItem('livon.mlStore.v1') || 'null') };
}

test('deterministic conversation title from the first message (no extra AI call)', () => {
  const { T } = app();
  assert.equal(T.deriveTitle('첫 독립 준비 어떻게 해야 해?'), '첫 독립 준비');
  assert.equal(T.deriveTitle('이사 준비 체크리스트를 만들어 줘.'), '이사 준비 체크리스트');
  assert.equal(T.deriveTitle('[라이프 스테이지]\n연령대: 20대\n주제: 첫 독립 준비\n\n예산은 얼마나 잡아야 할까?'), '예산은 얼마나 잡아야');
  assert.ok(T.deriveTitle('가'.repeat(60)).length <= 25);
});

test('draft parsing: header from other screens is recognised and removable', () => {
  const { T } = app();
  const q = '[커뮤니티]\n연령대: 20대\n글: 월세 계약\n분야: 주거 · 질문\n요약: 관리비\n\n이 글과 관련해 알려줘';
  assert.equal(T.stripDraftHeader(q), '이 글과 관련해 알려줘');
  assert.equal(T.stripDraftHeader('그냥 질문'), '그냥 질문');
  const p = T.pageContext({ source: 'community', topicId: 'cm:p1', topicTitle: '월세 계약', excerpt: 'x', url: 'https://www.newon.app/livon/#cm-post-p1', role: 'system' });
  assert.deepEqual(J(p), { source: 'community', topicId: 'cm:p1', topicTitle: '월세 계약', excerpt: 'x', url: 'https://www.newon.app/livon/#cm-post-p1' });
  assert.equal(T.pageContext({ source: 'evil' }), null);
});

test('context sources from every screen are minimal and draft-only', () => {
  const { hub, ctx } = app();
  const cases = [
    [{ source: 'life', stage: '20', stageLabel: '20대', topicId: '20s.first-independence', topicTitle: '첫 독립 준비', category: '독립', url: '#life/20s/first-independence', summary: 'a'.repeat(400) }, 'life-stage', /^\[라이프 스테이지\]/],
    [{ source: 'today', topicId: 'today:td-x', topicTitle: '오늘 콘텐츠', category: '생활', url: '#today/td-x' }, 'today', /^\[오늘의 발견\]/],
    [{ source: 'explore', topicId: 'search', topicTitle: '없는검색어', category: '조건', url: '#ex-results?q=x' }, 'explore', /^\[탐색\]/],
    [{ source: 'mylife', topicId: 'todos', topicTitle: '할 일 정리', category: '내 생활 · 할 일', url: '#ml-todos' }, 'mylife', /^\[내 생활\]/],
    [{ source: 'community', topicId: 'cm:p1', topicTitle: '글', category: '주거', url: '#cm-post-p1', summary: 'b'.repeat(100) }, 'community', /^\[커뮤니티\]/],
  ];
  for (const [p, src, head] of cases) {
    hub._test.askAI(Object.assign({ q: '질문' }, p));
    const d = JSON.parse(ctx.sessionStorage.getItem('livon.aiPrompt'));
    assert.equal(d.draftOnly, true);
    assert.equal(d.page.source, src);
    assert.match(d.q, head);
    assert.ok(d.page.excerpt.length <= 160, 'excerpt only');
    assert.deepEqual(Object.keys(d.page).sort(), ['category', 'excerpt', 'lifeStage', 'source', 'stageLabel', 'topicId', 'topicTitle', 'url']);
    normalizeInput({ message: d.q, context: { page: d.page } }); // server accepts it
  }
});

test('request construction: context, refs and bounded history; removed context is not sent', () => {
  const { T } = app({ local: { 'livon.aiStore.v1': { threads: [], settings: { personalize: false, answerLength: 'short' } } } });
  const messages = [];
  for (let i = 0; i < 30; i++) messages.push({ role: i % 2 ? 'assistant' : 'user', content: 'm' + i + ' ' + 'x'.repeat(900) });
  messages.push({ role: 'error', content: 'err' });
  messages.push({ role: 'user', content: '마지막 질문' });
  const thread = { id: 't', messages, page: { source: 'life-stage', topicId: '20s.first-independence', topicTitle: '첫 독립 준비' } };
  const refs = [{ kind: '라이프 스테이지', title: '첫 독립 준비', href: '#life/20s/first-independence' }];
  const p = T.requestPayload(thread, '마지막 질문', refs);
  assert.equal(p.message, '마지막 질문');
  assert.ok(p.conversation.length <= 12);
  assert.ok(p.conversation.reduce((a, m) => a + m.content.length, 0) <= 12000);
  assert.ok(p.conversation.every(m => m.role === 'user' || m.role === 'assistant'));
  assert.equal(p.conversation.at(-1).content.startsWith('m29'), true, 'most recent history kept');
  assert.equal(p.context.page.topicId, '20s.first-independence');
  assert.deepEqual(J(p.context.refs), J(refs));
  assert.equal(p.context.stage, undefined, 'personalization off → nothing personal sent');
  const n = normalizeInput(J(p));
  assert.deepEqual(n.refs, J(refs));
  delete thread.page;
  assert.equal(T.requestPayload(thread, 'q', []).context.page, undefined);
  assert.equal(T.requestPayload(thread, 'q', []).context.refs, undefined);
});

test('retrieval returns a few real LIVON items with existing routes only', () => {
  const { T, ctx } = app();
  const refs = T.retrieve('창업 준비 뭐부터 해?', null);
  assert.ok(refs.length >= 3 && refs.length <= 5);
  const titles = refs.map(r => r.title);
  assert.ok(titles.some(t => /창업/.test(t)));
  const topics = new Set(LIFE.topics.map(t => '#life/' + t.stageSlug + '/' + t.slug));
  const today = new Set(ctx.LivonTodayData.contents.map(c => '#today/' + c.id));
  for (const r of refs) {
    assert.ok(topics.has(r.href) || today.has(r.href) || /^#(ex-item-|life\/services\/|cm-post-)/.test(r.href) || /^https:\/\//.test(r.href), r.href);
    normalizeInput({ message: 'x', context: { refs: [r] } });
  }
  assert.ok(T.retrieve('첫 독립 준비 어떻게 해야 해?', null).some(r => r.href === '#life/20s/first-independence'));
  assert.deepEqual(J(T.retrieve('zzqqxx', null)), [], 'no results → no invented references');
  assert.ok(T.keywords('부모님 병원 일정 관리는 어떻게 하세요?').includes('부모님'));
});

test('server rejects forged references, unknown sources and oversize lists', () => {
  const ok = { kind: 'k', title: 't', href: '#life/20s/first-independence' };
  for (const bad of [[{ ...ok, href: 'javascript:alert(1)' }], [{ ...ok, href: '#admin' }], [{ ...ok, href: 'http://x.com' }], Array(7).fill(ok), [{ kind: 'k' }], 'x']) {
    assert.throws(() => normalizeInput({ message: 'x', context: { refs: bad } }));
  }
  assert.throws(() => normalizeInput({ message: 'x', context: { page: { source: 'admin' } } }));
  assert.throws(() => normalizeInput({ message: 'x', context: { page: { excerpt: 'x'.repeat(201) } } }));
});

test('server instructions: real references only, no automatic changes, safety limits', async () => {
  assert.match(INSTRUCTIONS, /목록에 없는 LIVON 주제·콘텐츠·서비스·링크를 만들지 않는다/);
  assert.match(INSTRUCTIONS, /사용자가 화면에서 확인·승인해야/);
  assert.match(INSTRUCTIONS, /119/);
  assert.match(INSTRUCTIONS, /보장하지 않는다/);
  assert.match(INSTRUCTIONS, /공식 사이트/);
  let sent;
  await generateReply({ message: 'q', conversation: [], context: { answerLength: 'short' }, refs: [{ kind: 'k', title: 't', href: '#today/td-x' }] },
    { env: { OPENAI_API_KEY: 'test-key' }, fetcher: async (url, init) => { sent = JSON.parse(init.body); return { ok: true, json: async () => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'ok' }] }] }) }; } });
  assert.match(sent.input[1].content, /^LIVON 참고 항목/);
  assert.equal(sent.store, false);
});

test('safe rendering: no raw HTML, unknown LIVON links become text, external links are isolated', () => {
  const { T } = app();
  const html = T.renderMarkdown('## 제목\n<script>alert(1)</script>\n- [ ] 예산 정하기\n1. 첫째\n[가짜](#life/20s/not-real) [첫 독립](#life/20s/first-independence) [공식](https://www.k-startup.go.kr/) [x](javascript:alert(1)) **굵게** <img src=x onerror=alert(1)>', ['#life/20s/first-independence']);
  assert.ok(!/<script|<img|onerror=|javascript:/i.test(html.replace(/&lt;[^&]*&gt;/g, '')), html);
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('href="#life/20s/not-real"'), 'unknown route not linked');
  assert.ok(html.includes('href="#life/20s/first-independence"'));
  assert.ok(html.includes('href="https://www.k-startup.go.kr/" target="_blank" rel="noopener noreferrer"'));
  assert.ok(html.includes('<h3 class="lv-ai-md-h">제목</h3>') && html.includes('<ol>') && html.includes('<strong>굵게</strong>') && html.includes('☐'));
  assert.equal(T.safeHref('#life', []).href, '#life');
  assert.equal(T.safeHref('http://x.com', []), null);
});

test('plan / checklist candidates: structured plan or explicit checklist only', () => {
  const { T } = app();
  const c = T.candidateItems('설명입니다\n- 그냥 bullet\n- [ ] 예산 정하기\n- [ ] 지역 정하기\n```json\n{"plan":{"title":"첫 독립","goal":"g","steps":["집 보기"],"todos":[{"title":"예산 정하기"},{"title":"계약 확인"}]}}\n```');
  assert.deepEqual(J(c.items), ['예산 정하기', '계약 확인', '집 보기', '지역 정하기']);
  assert.equal(c.plan.title, '첫 독립');
  assert.deepEqual(J(T.candidateItems('- a\n- b\n* c').items), [], 'plain bullets are not tasks');
  assert.equal(T.candidateItems('```json\n{bad json\n```').plan, null);
});

test('AI → My Life: approved items only, source kept, duplicates never created', () => {
  const { ctx, ml } = app();
  const api = ctx.LivonMyLife.api;
  assert.equal(ml(), null, 'nothing is written before approval');
  api.saveTodo({ title: '예산 정하기' });
  assert.ok(api.findDuplicateTodo(' 예산  정하기 '));
  const r1 = api.saveTodo({ title: '예산 정하기', source: 'livon-ai', sourceHref: '#ai-chat/th_1', sourceId: 'th_1' });
  assert.equal(r1.status, 'duplicate');
  const g = api.saveGoal({ title: '첫 독립', status: '진행 중' });
  const r2 = api.saveTodo({ title: '계약 확인', source: 'livon-ai', sourceHref: '#ai-chat/th_1', sourceId: 'th_1', goalId: g.item.id });
  assert.equal(r2.status, 'ok');
  const t = ml().todos.find(x => x.title === '계약 확인');
  assert.deepEqual([t.source, t.sourceHref, t.sourceId, t.goalId], ['livon-ai', '#ai-chat/th_1', 'th_1', g.item.id]);
  assert.equal(ml().todos.filter(x => x.title === '예산 정하기').length, 1);
});

test('conversation persistence and deletion (local store only)', () => {
  const { T, ctx } = app();
  T.Threads.put({ id: 'th_a', title: 'A', updatedAt: 1, messages: [{ role: 'user', content: 'q' }] });
  T.Threads.put({ id: 'th_b', title: 'B', updatedAt: 2, messages: [] });
  assert.equal(T.loadStore().threads.length, 2);
  assert.ok(T.Threads.rename('th_a', '  새   제목 '));
  assert.equal(T.Threads.get('th_a').title, '새 제목');
  T.Threads.remove('th_a');
  assert.deepEqual(J(T.loadStore().threads.map(t => t.id)), ['th_b']);
  T.Threads.clear();
  assert.equal(JSON.parse(ctx.localStorage.getItem('livon.aiStore.v1')).threads.length, 0);
});

test('error handling distinguishes causes', () => {
  const { T } = app();
  const k = (s, c, r) => T.errorFor(s, c, r).kind;
  assert.equal(k(503, 'AI_NOT_CONFIGURED'), 'unconfigured');
  assert.match(T.errorFor(503, 'AI_NOT_CONFIGURED').msg, /LIVON AI 연결이 아직 완료되지 않았습니다/);
  assert.equal(k(503, 'PROTECTION_NOT_CONFIGURED'), 'unconfigured');
  assert.equal(k(429, 'RATE_LIMIT', 30), 'rate');
  assert.match(T.errorFor(429, 'RATE_LIMIT', 30).msg, /30초/);
  assert.equal(k(504, 'TIMEOUT'), 'timeout');
  assert.equal(k(502, 'INVALID_AI_RESPONSE'), 'invalid');
  assert.equal(k(404), 'unavailable');
  assert.equal(k(502, 'UPSTREAM_ERROR'), 'server');
  assert.equal(k(413, 'MESSAGE_TOO_LONG'), 'input');
});

test('send → server unavailable → one error, retry does not duplicate the user message; abort adds no late reply', async () => {
  const { ctx, T } = app();
  let mode = 'down', calls = 0, release;
  ctx.fetch = (url, init) => {
    calls++;
    if (mode === 'down') return Promise.resolve({ ok: false, status: 503, headers: { get: () => 'application/json' }, json: async () => ({ success: false, code: 'AI_NOT_CONFIGURED', error: 'x' }) });
    if (mode === 'ok') return Promise.resolve({ ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => ({ success: true, message: '답변' }) });
    return new Promise((res, rej) => { init.signal.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError' }))); release = () => res({ ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => ({ success: true, message: '늦은 답변' }) }); });
  };
  await ctx.LivonAI.sendMessage('첫 독립 준비 어떻게 해야 해?');
  let th = T.loadStore().threads[0];
  assert.deepEqual(J(th.messages.map(m => m.role)), ['user', 'error']);
  assert.equal(th.messages[1].kind, 'unconfigured');
  assert.equal(th.title, '첫 독립 준비');
  mode = 'ok';
  T.state.threadId = th.id;
  await ctx.LivonAI.sendMessage('첫 독립 준비 어떻게 해야 해?', { retry: true });
  th = T.loadStore().threads[0];
  assert.deepEqual(J(th.messages.map(m => m.role)), ['user', 'assistant'], 'retry replaced the error, no duplicate user message');
  assert.ok(Array.isArray(th.messages[1].refs));
  mode = 'hang';
  const p = ctx.LivonAI.sendMessage('다음 질문');
  await new Promise(r => setTimeout(r, 20));
  T.state.userAborted = true; T.state.abort.abort();
  await p;
  if (release) release();
  await new Promise(r => setTimeout(r, 20));
  th = T.loadStore().threads[0];
  assert.deepEqual(J(th.messages.map(m => m.role)), ['user', 'assistant', 'user', 'error']);
  assert.equal(th.messages[3].kind, 'cancelled');
  assert.ok(!th.messages.some(m => m.content === '늦은 답변'));
  assert.equal(calls, 3);
});

test('no API secret or provider key in any client file', () => {
  const dir = new URL('../../livon/', import.meta.url);
  for (const f of readdirSync(dir).filter(f => /\.(js|html|json|css)$/.test(f))) {
    const s = readFileSync(new URL(f, dir), 'utf8');
    assert.ok(!/sk-[A-Za-z0-9_-]{16,}/.test(s), f);
    assert.ok(!/OPENAI_API_KEY|UPSTASH_REDIS_REST_TOKEN|LIVON_RATE_LIMIT_SECRET/.test(s), f);
  }
});

test('no alert / confirm / prompt left in LIVON AI code', () => {
  const s = read('ai-page.js');
  assert.equal((s.match(/\b(alert|confirm|prompt)\s*\(/g) || []).length, 0);
});
