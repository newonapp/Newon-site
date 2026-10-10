// LIVON Next V1 (NX-01 …): Anonymous Free Mode data protection (backup / restore / delete / storage full), public-data
// failure diagnosis (upstream vs LIVON server vs gateway vs network), the content review hold, and the merged Account Sync
// staying switched off. Data tests run in node:vm; browser tests need a local Chromium and skip without it.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const INDEX = read('livon/index.html');
const PROTECT = read('livon/data/livon-data-protect.js');
const code = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* a Storage look-alike with a byte quota (counted like browsers: UTF-16 code units) */
function makeStorageClass() {
  class Storage {
    constructor(quota = Infinity) { this._m = new Map(); this._quota = quota; }
    get length() { return this._m.size; }
    key(i) { return [...this._m.keys()][i] ?? null; }
    getItem(k) { return this._m.has(String(k)) ? this._m.get(String(k)) : null; }
    setItem(k, v) {
      k = String(k); v = String(v);
      let used = 0; for (const [a, b] of this._m) if (a !== k) used += (a.length + b.length) * 2;
      if (used + (k.length + v.length) * 2 > this._quota) { const e = new Error('quota'); e.name = 'QuotaExceededError'; e.code = 22; throw e; }
      this._m.set(k, v);
    }
    removeItem(k) { this._m.delete(String(k)); }
    clear() { this._m.clear(); }
  }
  return Storage;
}
function protectCtx({ local = {}, session = {}, quota = Infinity, withInventory = true } = {}) {
  const Storage = makeStorageClass();
  const ls = new Storage(quota), ssn = new Storage();
  for (const [k, v] of Object.entries(local)) ls._m.set(k, typeof v === 'string' ? v : JSON.stringify(v));
  for (const [k, v] of Object.entries(session)) ssn._m.set(k, String(v));
  const events = [];
  const ctx = { console, Storage, localStorage: ls, sessionStorage: ssn, setTimeout, clearTimeout, JSON, Date, CustomEvent: class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } }, dispatchEvent: e => events.push(e.type), location: { hash: '' } };
  ctx.window = ctx;
  vm.createContext(ctx);
  if (withInventory) vm.runInContext(read('livon/data/livon-user-data.js'), ctx);
  vm.runInContext(PROTECT, ctx);
  return { ctx, P: ctx.LivonDataProtect, ls, ssn, events };
}
const SEED = {
  'livon.mlStore.v1': { v: 2, todos: [{ id: 't1', title: '할 일', done: false, createdAt: 1, updatedAt: 1 }], journal: [{ id: 'j1', title: '일기', body: '개인 기록' }] },
  'livon.platform.v1': { saves: [{ id: 'life-hub:topic:20s.first-independence', title: '첫 독립 준비' }] },
  'livon.lifeStage': '"20"',
  'livon.a11y.motion.v1': 'paused',
  'livon.data.v1:provider:x': '[1,2,3]',
  'livon.vault.anon': '{"x":1}',
  'livon.sync.v1:acct': '{"c":1}',
  'livon.activeProfile.v1': '{"kind":"anon"}',
  'ongil.1.profile': '{"name":"온길 데이터"}',
  'newon-lang-dir': 'ko',
};

test('NX-01 backup: JSON with format, version, createdAt, privacy notice; LIVON keys only; no caches, sync machinery, ONGIL or Newon keys', () => {
  const { P } = protectCtx({ local: SEED });
  const b = P.buildBackup(Date.parse('2026-10-10T04:00:00Z'));
  assert.equal(b.format, 'livon-backup'); assert.equal(b.version, 1); assert.equal(b.createdAt, '2026-10-10T04:00:00.000Z');
  assert.match(b.notice, /개인 정보/);
  assert.deepEqual(Object.keys(b.keys).sort(), ['livon.a11y.motion.v1', 'livon.lifeStage', 'livon.mlStore.v1', 'livon.platform.v1']);
  assert.equal(b.keyCount, 4);
  assert.equal(b.keys['livon.mlStore.v1'], JSON.stringify(SEED['livon.mlStore.v1']), 'values are kept exactly (raw strings)');
  assert.match(P.fileName(Date.parse('2026-10-10T04:05:00Z')), /^livon-backup-\d{8}-\d{4}\.json$/);
  /* browser only: no fetch / XHR / beacon anywhere in the module */
  assert.doesNotMatch(code(PROTECT), /\bfetch\s*\(|XMLHttpRequest|sendBeacon|navigator\.sendBeacon|firebase|\/api\//i);
});

test('NX-02 restore validation: damaged, foreign, newer, empty and non-LIVON files are refused before anything is written', () => {
  const { P, ls } = protectCtx({ local: SEED });
  const before = JSON.stringify([...ls._m]);
  const good = JSON.stringify(P.buildBackup());
  const cases = [
    ['', 'EMPTY'], ['{not json', 'NOT_JSON'], ['[]', 'NOT_LIVON'], ['{"format":"other","version":1}', 'NOT_LIVON'],
    [JSON.stringify({ format: 'livon-backup', version: 2, createdAt: '2026-10-10T00:00:00Z', keys: { 'livon.lifeStage': '"20"' } }), 'NEWER_VERSION'],
    [JSON.stringify({ format: 'livon-backup', version: 0.5, createdAt: '2026-10-10T00:00:00Z', keys: {} }), 'BAD_VERSION'],
    [JSON.stringify({ format: 'livon-backup', version: 1, createdAt: 'yesterday', keys: { 'livon.lifeStage': '"20"' } }), 'BAD_DATE'],
    [JSON.stringify({ format: 'livon-backup', version: 1, createdAt: '2026-10-10T00:00:00Z', keys: {} }), 'NO_DATA'],
    [JSON.stringify({ format: 'livon-backup', version: 1, createdAt: '2026-10-10T00:00:00Z', keys: [] }), 'BAD_KEYS'],
    [JSON.stringify({ format: 'livon-backup', version: 1, createdAt: '2026-10-10T00:00:00Z', keys: { 'ongil.1.profile': '{}' } }), 'FOREIGN_KEY'],
    [JSON.stringify({ format: 'livon-backup', version: 1, createdAt: '2026-10-10T00:00:00Z', keys: { 'livon.vault.anon': '{}' } }), 'FOREIGN_KEY'],
    [JSON.stringify({ format: 'livon-backup', version: 1, createdAt: '2026-10-10T00:00:00Z', keys: { 'livon.data.v1:provider:x': '[]' } }), 'FOREIGN_KEY'],
    [JSON.stringify({ format: 'livon-backup', version: 1, createdAt: '2026-10-10T00:00:00Z', keys: { '__proto__': '{}' } }), 'NO_DATA'],
    [JSON.stringify({ format: 'livon-backup', version: 1, createdAt: '2026-10-10T00:00:00Z', keys: { 'livon.mlStore.v1': '{"v":2,"todos":[' } }), 'BAD_VALUE'],
    [JSON.stringify({ format: 'livon-backup', version: 1, createdAt: '2026-10-10T00:00:00Z', keys: { 'livon.mlStore.v1': 42 } }), 'BAD_VALUE'],
    [good.slice(0, good.length - 40), 'NOT_JSON'],
  ];
  for (const [text, reason] of cases) {
    const r = P.validate(text);
    assert.equal(r.ok, false, reason); assert.equal(r.reason, reason, text.slice(0, 60));
    assert.ok(r.message && /[가-힣]/.test(r.message), 'a Korean message for ' + reason);
  }
  assert.equal(JSON.stringify([...ls._m]), before, 'nothing written by any refusal');
  assert.equal(P.validate(good).ok, true);
});

test('NX-03 restore: default keeps existing data (adds only missing keys); replace needs the explicit mode; counts are true', () => {
  const src = protectCtx({ local: SEED });
  const file = JSON.stringify(src.P.buildBackup());
  const { P, ls } = protectCtx({ local: { 'livon.lifeStage': '"40"', 'ongil.1.profile': '{"keep":true}' } });
  const v = P.validate(file);
  assert.equal(v.ok, true);
  assert.deepEqual([v.add.length, v.replace.length, v.same.length], [3, 1, 0]);
  const keep = P.restore(v, 'keep');
  assert.deepEqual([keep.ok, keep.written], [true, 3]);
  assert.equal(ls.getItem('livon.lifeStage'), '"40"', 'existing value kept by default');
  assert.equal(ls.getItem('livon.mlStore.v1'), JSON.stringify(SEED['livon.mlStore.v1']));
  assert.equal(ls.getItem('ongil.1.profile'), '{"keep":true}', 'ONGIL untouched');
  const v2 = P.validate(file);
  assert.deepEqual([v2.add.length, v2.replace.length, v2.same.length], [0, 1, 3]);
  assert.equal(P.restore(v2, 'replace').written, 1);
  assert.equal(ls.getItem('livon.lifeStage'), '"20"');
});

test('NX-04 restore is all-or-nothing: a write failure (storage full) rolls every key back; nothing is lost', () => {
  const src = protectCtx({ local: SEED });
  const big = { ...src.P.buildBackup() };
  big.keys = { ...big.keys, 'livon.aiStore.v1': JSON.stringify({ threads: [{ id: 'a', text: 'x'.repeat(20000) }] }) };
  const { P, ls, events } = protectCtx({ local: { 'livon.lifeStage': '"40"', 'livon.mlStore.v1': '{"v":2,"todos":[]}' }, quota: 30000 });
  const before = JSON.stringify([...ls._m].sort());
  const v = P.validate(JSON.stringify(big));
  assert.equal(v.ok, true);
  const r = P.restore(v, 'replace');
  assert.equal(r.ok, false); assert.equal(r.reason, 'QUOTA');
  assert.equal(JSON.stringify([...ls._m].sort()), before, 'every key is back to its old value; new keys removed');
  assert.ok(events.includes('livon:storage-full'), 'the storage-full signal fired');
});

test('NX-05 delete: LIVON keys only (local + session); ONGIL, Newon and other keys stay; refused while an account is active', () => {
  const { P, ls, ssn } = protectCtx({ local: SEED, session: { 'livon.aiPrompt': '{}', 'ongil.tmp': '1' } });
  const plan = P.deletionPlan();
  assert.equal(plan.local.length, 9, '8 seeded + the user-data meta key'); assert.equal(plan.session.length, 1); assert.equal(plan.otherKeys, 2);
  const r = P.deleteAll();
  assert.deepEqual([r.ok, r.removed, r.left], [true, 10, 0]);
  assert.deepEqual([...ls._m.keys()].sort(), ['newon-lang-dir', 'ongil.1.profile']);
  assert.deepEqual([...ssn._m.keys()], ['ongil.tmp']);
  const acct = protectCtx({ local: SEED });
  acct.ctx.LivonUserData = { mode: () => 'account', entryFor: acct.ctx.LivonUserData.entryFor };
  assert.equal(acct.P.deleteAll().reason, 'ACCOUNT_ACTIVE');
  assert.ok(acct.ls.getItem('livon.mlStore.v1'), 'nothing deleted');
});

test('NX-06 storage full: a failing LIVON write is noticed and the same error still reaches the caller; other keys are not counted', () => {
  const { P, ls, events } = protectCtx({ quota: 2000 });
  assert.throws(() => ls.setItem('livon.mlStore.v1', 'x'.repeat(5000)), e => e.name === 'QuotaExceededError');
  assert.equal(P.quota().count, 1);
  assert.deepEqual(events, ['livon:storage-full']);
  assert.throws(() => ls.setItem('ongil.1.big', 'x'.repeat(5000)), e => e.name === 'QuotaExceededError');
  assert.equal(P.quota().count, 1, 'ONGIL writes are not LIVON business');
  ls.setItem('livon.lifeStage', '"20"');
  assert.equal(ls.getItem('livon.lifeStage'), '"20"', 'normal writes unchanged');
  assert.equal(P.isQuota({ name: 'NS_ERROR_DOM_QUOTA_REACHED' }), true); assert.equal(P.isQuota({ name: 'TypeError' }), false);
});

/* ───────── public data: who failed ───────── */
function dataCtx(respond) {
  const ctx = { console, setTimeout, clearTimeout, AbortController, URL, Promise, JSON, location: { protocol: 'https:', hostname: 'www.newon.app', hash: '' } };
  ctx.window = ctx; ctx.fetch = respond;
  const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; } }; };
  ctx.localStorage = mem(); ctx.sessionStorage = mem();
  vm.createContext(ctx);
  for (const f of ['livon/livon-api-config.js', 'livon/data/livon-data-config.js', 'livon/data/livon-data-schema.js', 'livon/data/livon-data-core.js', 'livon/data/livon-data-providers.js']) vm.runInContext(read(f), ctx);
  return ctx;
}
const resp = (status, body, type = 'application/json') => Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(JSON.parse(body)), text: () => Promise.resolve(body), headers: { get: () => type } });

test('NX-07 public data failures are classified by where they happened; the notice names it without guessing a cause', async () => {
  const cases = [
    [() => resp(502, JSON.stringify({ ok: false, code: 'UPSTREAM_ERROR', error: '제공처 데이터를 지금 불러올 수 없습니다.' })), 'upstream', /제공처에서 지금 정보를 받지 못했어요/],
    [() => resp(503, JSON.stringify({ ok: false, code: 'UPSTREAM_LIMIT', error: 'x' })), 'upstream', /호출 한도/],
    [() => resp(504, JSON.stringify({ ok: false, code: 'TIMEOUT', error: 'x' })), 'upstream', /응답이 늦어/],
    [() => resp(500, JSON.stringify({ ok: false, code: 'SERVER_ERROR', error: 'x' })), 'livon', /LIVON 데이터 서버/],
    [() => resp(502, '<html>Bad Gateway</html>', 'text/html'), 'gateway', /LIVON 데이터 서버/],
    [() => Promise.reject(new TypeError('Failed to fetch')), 'network', /네트워크 연결/],
  ];
  for (const [fn, origin, re] of cases) {
    const ctx = dataCtx((url, o) => /action=status/.test(url) ? resp(200, JSON.stringify({ ok: true, providers: { 'kr-lifelong-class': { configured: true }, 'kr-public-tax-expert': { configured: true } } })) : fn(url, o));
    const D = ctx.LivonData;
    for (const id of ['kr-lifelong-class', 'kr-public-tax-expert']) { const p = D.registry.get(id); p.serverConfigured = true; p.enabled = true; D.registry.setStatus(id, 'configured'); }
    await D.repository.refresh({ force: true });
    const m = D.repository.monitor.get('kr-lifelong-class');
    assert.equal(m.origin, origin, origin);
    const n = D.providerNotice(['kr-lifelong-class', 'kr-public-tax-expert']);
    assert.equal(n.length, 2);
    assert.match(n[0].text, re); assert.match(n[0].text, /다른 정보는 그대로 볼 수 있어요/);
    assert.match(n[0].text, /평생학습 강좌/); assert.match(n[1].text, /마을세무사/);
    assert.doesNotMatch(n.map(x => x.text).join(' '), /키|key|인증|장애|점검|serviceKey/i, 'no guessed cause, no key talk');
    assert.equal(D.repository.monitor.get('livon-curated').errorCode, null, 'the curated provider still loaded — one failure does not stop the rest');
  }
});

test('NX-08 server diagnostics (unchanged server): an upstream 503 is answered 502 UPSTREAM_ERROR; the log line carries the provider status and category, never a key, URL or body', async () => {
  const { createDataHandler } = await import(path.join(ROOT, 'server/livon/data/http.mjs'));
  const logs = [];
  const KEY = 'TESTKEY-' + 'A'.repeat(30);
  const handler = createDataHandler({ env: { PUBLIC_DATA_SERVICE_KEY: KEY, LIVON_DATA_SOURCE: 'live' }, fetcher: async () => ({ ok: false, status: 503, text: async () => '<html>busy ' + KEY + '</html>', headers: new Map() }), cache: { get: async () => null, set: async () => {} }, log: (...a) => logs.push(a.join(' ')), limiter: null });
  const res = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; }, writeHead(s, h) { this.statusCode = s; Object.assign(this.headers, h || {}); } };
  await handler({ method: 'GET', url: '/api/livon/data?provider=kr-lifelong-class', headers: { host: 'localhost' } }, res);
  const body = JSON.parse(res.body || '{}');
  assert.equal(res.statusCode, 502); assert.deepEqual(body, { ok: false, code: 'UPSTREAM_ERROR', error: '제공처 데이터를 지금 불러올 수 없습니다.' }, 'public answer unchanged');
  const d = handler.diagnostics()['kr-lifelong-class'];
  assert.equal(d.lastErrorCategory, 'HTTP_5XX');
  const all = logs.join('\n');
  assert.match(all, /"upstreamStatus":503/); assert.match(all, /"category":"HTTP_5XX"/);
  assert.equal(all.includes(KEY), false); assert.doesNotMatch(all, /serviceKey|api\.data\.go\.kr|<html>/);
});

/* ───────── content hold ───────── */
const HELD = ['td:exp-pottery', 'td:exp-baking', 'td:exp-yoga', 'td:exp-photo', 'td:learn-kmooc', 'td:learn-finance', 'td:learn-digital-senior', 'ex:ex-hrdkorea', 'ex:ex-allilearn', 'ex:ex-worknet-job'];
test('NX-09 content review hold: overdue records that could not be re-checked are hidden (not deleted); re-checked ones carry the real check date', async () => {
  const { loadLivon, qualityReport } = await import(path.join(ROOT, 'scripts/livon-data-quality.mjs'));
  const ctx = loadLivon();
  const repo = ctx.LivonScreenData.repository();
  for (const id of HELD) {
    const e = repo.getById(id, { any: true });
    assert.ok(e, id + ' still exists'); assert.equal(e.status, 'review', id);
    assert.equal(repo.getById(id), null, id + ' is not shown');
  }
  const td = read('livon/today-data.js'), ex = read('livon/explore-data.js');
  assert.equal((td.match(/publishStatus: "review", reviewReason: "stale-unverified"/g) || []).length, 7);
  assert.equal((ex.match(/publishStatus: "review", reviewReason: "stale-unverified"/g) || []).length, 3);
  for (const id of ['ex-qnet', 'ex-lifelong', 'ex-senior-job']) assert.match(ex.slice(ex.indexOf('id: "' + id + '"'), ex.indexOf('id: "' + id + '"') + 1600), /checkedAt: "2026-10-10"/, id + ' re-checked on its official site');
  assert.doesNotMatch(td + ex, /checkedAt: "2026-10-1[1-9]"|checkedAt: "2026-1[1-2]/, 'no date in the future');
  const r = qualityReport(ctx);
  assert.equal(r.checks.stale, 0, 'nothing stale is shown'); assert.equal(r.blocking, 0);
});

test('NX-10 Account Sync V1 merged but off: no public flag, no login UI shown, no new server or env', () => {
  const sync = read('livon/data/livon-sync.js'), ui = read('livon/livon-account-ui.js');
  assert.match(INDEX, /\/livon\/data\/livon-sync\.js\?v=20261004as1"/); assert.match(INDEX, /\/livon\/livon-account-ui\.js\?v=20261004as1"/);
  assert.doesNotMatch(INDEX, /LIVON_ACCOUNT_SYNC_PUBLIC\s*=\s*true/);
  for (const f of ['livon/index.html', 'livon/livon-api-config.js', 'livon/data/livon-auth-bridge.js', 'livon/livon-account-ui.js']) assert.doesNotMatch(read(f), /LIVON_ACCOUNT_SYNC_PUBLIC\s*=\s*true/, f);
  assert.match(ui, /function syncPublic\(\) \{ return root\.LIVON_ACCOUNT_SYNC_PUBLIC === true; \}/);
  assert.match(sync, /retry|backoff|attempt/i);
  assert.ok(fs.existsSync(path.join(ROOT, 'tests/livon/account-sync.test.mjs')));
});

test('NX-11 cache keys: new and changed files carry ?v=20261010nx1; the protect module loads before the platform', () => {
  for (const f of ['data/livon-data-protect.js', 'data/livon-data-core.js', 'data/livon-data-providers.js', 'data/livon-data-platform.js', 'data/livon-screen-data.js', 'explore-page.js', 'today-page.js']) assert.match(INDEX, new RegExp('/livon/' + f.replace(/[./]/g, '\\$&') + '\\?v=20261010nx1"'), f);
  assert.ok(INDEX.indexOf('livon-data-protect.js') < INDEX.indexOf('livon-platform.js'));
  assert.ok(INDEX.indexOf('livon-storage-guard.js') < INDEX.indexOf('livon-data-protect.js'));
});

/* ═════════ browser ═════════ */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const skip = !(fs.existsSync(PW) && fs.existsSync(CHROME)) && 'no local Chromium';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
let B = null, SERVER = null, BASE = '';
async function boot() {
  if (B) return;
  const { chromium } = await import(PW);
  SERVER = await new Promise(resolve => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      let f = path.join(ROOT, p);
      if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(fs.readFileSync(f)); return; }
      res.writeHead(404); res.end('not found');
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
  BASE = 'http://127.0.0.1:' + SERVER.address().port;
  B = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
}
test.after(async () => { if (B) await B.close(); if (SERVER) SERVER.close(); });
const SKIPPED = JSON.stringify({ version: 1, state: 'SKIPPED', step: '', draft: null, updatedAt: 1 });
async function open(hash, { width = 390, local = {}, api = null } = {}) {
  await boot();
  const ctx = await B.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', acceptDownloads: true });
  await ctx.route('**/*', r => { const u = r.request().url(); if (api && u.includes('/api/livon/data')) return api(r, u); return u.startsWith(BASE) ? r.continue() : r.abort(); });
  await ctx.addInitScript(([pz, loc]) => { try { if (!sessionStorage.getItem('nx-seeded')) { sessionStorage.setItem('nx-seeded', '1'); localStorage.setItem('livon.personalization.v1', pz); for (const [k, v] of Object.entries(loc)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } } catch (e) {} }, [SKIPPED, local]);
  const pg = await ctx.newPage();
  pg._errors = []; pg.on('pageerror', e => pg._errors.push(e.message));
  await pg.goto(BASE + '/livon/' + hash, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(1500);
  return pg;
}

test('NX-12 My Life › 설정: backup downloads a valid file; a damaged file is refused; restore keeps data by default; replace asks first', { skip }, async () => {
  const pg = await open('#ml-settings', { local: { 'livon.mlStore.v1': { v: 2, todos: [{ id: 't1', title: 'NX 할 일', done: false, createdAt: 1, updatedAt: 1 }] }, 'ongil.1.profile': '{"keep":1}' } });
  assert.equal(await pg.locator('[data-livon-data-protect]').count(), 1);
  assert.equal(await pg.locator('#lv-dp-title').textContent(), 'LIVON 데이터 백업 · 복원 · 삭제');
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.locator('[data-lv-dp-backup]').click()]);
  const text = fs.readFileSync(await dl.path(), 'utf8'); const j = JSON.parse(text);
  assert.equal(j.format, 'livon-backup'); assert.equal(j.version, 1); assert.ok(j.keys['livon.mlStore.v1']); assert.equal(j.keys['ongil.1.profile'], undefined);
  assert.match(dl.suggestedFilename(), /^livon-backup-\d{8}-\d{4}\.json$/);
  const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'nx-'));
  fs.writeFileSync(path.join(tmp, 'bad.json'), text.slice(0, text.length - 30));
  await pg.locator('[data-lv-dp-file]').setInputFiles(path.join(tmp, 'bad.json')); await pg.waitForTimeout(300);
  assert.match(await pg.locator('[data-lv-dp-msg]').textContent(), /손상|JSON 형식/);
  assert.equal(await pg.locator('[data-lv-dp-review]').count(), 0);
  await pg.evaluate(() => localStorage.setItem('livon.mlStore.v1', JSON.stringify({ v: 2, todos: [] })));
  fs.writeFileSync(path.join(tmp, 'ok.json'), text);
  await pg.locator('[data-lv-dp-file]').setInputFiles(path.join(tmp, 'ok.json')); await pg.waitForTimeout(300);
  assert.equal(await pg.locator('[data-lv-dp-mode][value=keep]').isChecked(), true, 'keep is the default');
  await pg.locator('[data-lv-dp-restore]').click(); await pg.waitForTimeout(200);
  assert.equal(await pg.evaluate(() => localStorage.getItem('livon.mlStore.v1')), '{"v":2,"todos":[]}', 'existing data kept');
  await pg.locator('[data-lv-dp-file]').setInputFiles(path.join(tmp, 'ok.json')); await pg.waitForTimeout(300);
  await pg.locator('[data-lv-dp-mode][value=replace]').check();
  await pg.locator('[data-lv-dp-restore]').click(); await pg.waitForTimeout(200);
  assert.equal(await pg.locator('[data-lv-dp-replace-ack]').isVisible(), true, 'replace asks for a confirmation first');
  assert.equal(await pg.evaluate(() => localStorage.getItem('livon.mlStore.v1')), '{"v":2,"todos":[]}');
  await pg.locator('[data-lv-dp-replace-confirm]').check(); await pg.locator('[data-lv-dp-restore]').click(); await pg.waitForTimeout(200);
  assert.match(await pg.evaluate(() => localStorage.getItem('livon.mlStore.v1')), /NX 할 일/);
  assert.equal(await pg.evaluate(() => localStorage.getItem('ongil.1.profile')), '{"keep":1}');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('NX-13 delete all: separate confirmation, LIVON keys only, ONGIL/Newon kept, page returns to a clean first state', { skip }, async () => {
  const pg = await open('#ml-settings', { local: { 'livon.mlStore.v1': { v: 2, todos: [{ id: 't1', title: '지울 할 일', done: false, createdAt: 1, updatedAt: 1 }] }, 'ongil.1.profile': '{"keep":1}', 'newon-lang-dir': 'ko' } });
  await pg.locator('[data-lv-dp-delete-open]').click(); await pg.waitForTimeout(150);
  const box = await pg.locator('[data-lv-dp-delete-box]').innerText();
  assert.match(box, /지워지는 것/); assert.match(box, /남는 것/); assert.match(box, /ONGIL/); assert.match(box, /되돌릴 수 없어요/);
  assert.equal(await pg.locator('[data-lv-dp-delete-run]').isDisabled(), true, 'the delete button waits for the confirmation');
  await pg.locator('[data-lv-dp-delete-cancel]').click(); await pg.waitForTimeout(150);
  assert.ok(await pg.evaluate(() => localStorage.getItem('livon.mlStore.v1')), 'cancel deletes nothing');
  await pg.locator('[data-lv-dp-delete-open]').click(); await pg.locator('[data-lv-dp-delete-confirm]').check();
  await pg.locator('[data-lv-dp-delete-run]').click(); await pg.waitForTimeout(3000);
  const keys = await pg.evaluate(() => Object.keys(localStorage));
  assert.ok(keys.includes('ongil.1.profile') && keys.includes('newon-lang-dir'));
  assert.equal(await pg.evaluate(() => localStorage.getItem('livon.mlStore.v1')), null, 'My Life data gone (no store is recreated with old content)');
  assert.equal(await pg.evaluate(() => (localStorage.getItem('livon.mlStore.v1') || '').includes('지울 할 일')), false);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('NX-14 storage full in the page: a notice with a backup action appears; the app keeps working', { skip }, async () => {
  const pg = await open('#life-now');
  const r = await pg.evaluate(() => { try { localStorage.setItem('livon.exScroll', 'x'.repeat(6 * 1024 * 1024)); return 'stored'; } catch (e) { return e.name; } });
  assert.equal(r, 'QuotaExceededError');
  await pg.waitForTimeout(200);
  assert.equal(await pg.locator('.lv-dp-notice[role=alert]').count(), 1);
  assert.match(await pg.locator('.lv-dp-notice').innerText(), /저장 공간이 부족해요/);
  assert.equal(await pg.locator('.lv-dp-notice [data-lv-dp-notice-backup]').count(), 1);
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(100);
  assert.equal(await pg.locator('.lv-dp-notice').count(), 0);
  await pg.evaluate(() => { location.hash = '#today'; }); await pg.waitForTimeout(800);
  assert.ok((await pg.evaluate(() => document.querySelector('#today').innerText.length)) > 100, 'the app still works');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('NX-15 Explore: a failing public provider shows where it failed and a retry; the rest of the results stay', { skip }, async () => {
  let fail = true;
  const api = (r, u) => {
    if (u.includes('action=status')) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, providers: { 'kr-lifelong-class': { configured: true }, 'kr-public-tax-expert': { configured: true } } }) });
    return fail ? r.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'UPSTREAM_ERROR', error: 'x' }) })
      : r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, items: [], hasMore: false }) });
  };
  const pg = await open('#ex-results?q=' + encodeURIComponent('스마트폰') + '&type=class', { api });
  await pg.waitForTimeout(1200);
  await pg.evaluate(() => window.LivonExplore && LivonExplore.refreshResults && LivonExplore.refreshResults()); await pg.waitForTimeout(300);
  const notice = pg.locator('[data-lv-ex-data-notice]');
  assert.equal(await notice.count(), 1);
  assert.match(await notice.innerText(), /평생학습 강좌\(공공데이터포털\) 제공처에서 지금 정보를 받지 못했어요/);
  fail = false;
  await pg.locator('[data-lv-ex-data-retry]').click(); await pg.waitForTimeout(1000);
  assert.equal(await pg.locator('[data-lv-ex-data-notice]').count(), 0, 'gone after a successful retry');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('NX-16 layout: the data section at 320/390/768/1024/1440 and 200% text — no page scroll, controls ≥ 44px, visible focus', { skip }, async () => {
  for (const [w, z] of [[320, 1], [390, 1], [768, 1], [1024, 1], [1440, 1], [390, 2], [1440, 2]]) {
    const pg = await open('#ml-settings', { width: w });
    if (z !== 1) { await pg.evaluate(z2 => { document.documentElement.style.fontSize = z2 * 100 + '%'; }, z); await pg.waitForTimeout(200); }
    await pg.locator('[data-lv-dp-delete-open]').click(); await pg.waitForTimeout(150);
    const r = await pg.evaluate(() => {
      const host = document.querySelector('[data-livon-data-protect]');
      const vw = document.documentElement.clientWidth;
      const small = [...host.querySelectorAll('button,a[href],label')].filter(e => e.getClientRects().length && !e.closest('[hidden]')).map(e => { const b = e.getBoundingClientRect(); return [e.textContent.trim().slice(0, 20), Math.round(b.width), Math.round(b.height)]; }).filter(x => x[2] < 44 || x[1] < 44);
      const over = [...host.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > vw + 1).length;
      return { pageScroll: document.documentElement.scrollWidth > vw, small, over };
    });
    assert.equal(r.pageScroll, false, w + '@' + z); assert.equal(r.over, 0, w + '@' + z); assert.deepEqual(r.small, [], w + '@' + z);
    const btn = pg.locator('[data-lv-dp-backup]'); await btn.focus(); await pg.keyboard.press('Shift+Tab'); await pg.keyboard.press('Tab'); await pg.waitForTimeout(80);
    const ring = await pg.evaluate(() => { const c = getComputedStyle(document.activeElement); return (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 1) || c.boxShadow !== 'none'; });
    assert.ok(ring, 'visible focus ' + w);
    assert.deepEqual(pg._errors, []);
    await pg.context().close();
  }
});

test('NX-17 Today 체험 / 배움: own type first, then only records the data assigns to that section — never unrelated types, never held records, never unsourced prices', { skip }, async () => {
  const pg = await open('#today', { width: 1280 });
  const learn = await pg.locator('[data-lv-td-learn]').innerText(), hobby = await pg.locator('[data-lv-td-hobby]').innerText();
  assert.match(learn, /국립중앙도서관에서 하루 공부·독서/, '배움: the library the data assigns to 배움 (official source)');
  assert.doesNotMatch(learn, /한강공원|남산|국립현대미술관|K-MOOC|생활 금융|키오스크/, '배움: no park / museum, no held record');
  assert.match(hobby, /새 취미, 장비가 아니라 루틴으로 시작하기/, '체험: the guide the data assigns to 체험');
  assert.doesNotMatch(hobby, /한강공원|도자기|베이킹|요가|거리 사진|단풍·캠핑|겨울 실내 취미/, '체험: no unrelated record, no held record, no unsourced budget');
  assert.ok((await pg.locator('#td-places').innerText()).length > 100, 'other sections keep their content');
  const src = read('livon/today-page.js');
  assert.match(src, /var amount = \/\\d\/\.test\(String\(c\.price \|\| ""\) \+ String\(c\.budget \|\| ""\)\);\s*return !amount \|\| !!c\.officialUrl;/);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});
