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
  for (const f of ['data/livon-user-data.js', 'explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js', 'explore-search.js', 'community-service.js', 'community-page.js', 'life-now-data.js', 'life-now-page.js', 'ai-page.js']) vm.runInContext(read(f), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  return { ctx, T: ctx.LivonAI._test, hub: ctx.LivonLifeHub, ml: () => JSON.parse(ctx.localStorage.getItem('livon.mlStore.v1') || 'null') };
}

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

test('no API secret or provider key in any client file', () => {
  const dir = new URL('../../livon/', import.meta.url);
  for (const f of readdirSync(dir).filter(f => /\.(js|html|json|css)$/.test(f))) {
    const s = readFileSync(new URL(f, dir), 'utf8');
    assert.ok(!/sk-[A-Za-z0-9_-]{16,}/.test(s), f);
    assert.ok(!/OPENAI_API_KEY|UPSTASH_REDIS_REST_TOKEN|LIVON_RATE_LIMIT_SECRET/.test(s), f);
  }
});

