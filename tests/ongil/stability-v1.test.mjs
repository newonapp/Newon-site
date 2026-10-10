// ONGIL Stability V1 (OST-01 … OST-12, OST-B1 … OST-B3): what a failed public-data request looks like to the person — loading, empty and
// error told apart, the kind of failure in plain words, one quiet retry after a 502 / 504 from the shared data route, and
// 다시 찾기. The data sources run against a stub fetcher that answers like /api/livon/data; nothing is contacted.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createLifelongClassSource, createFacilitySource, createEnjoyPlaceSource, createTourPlaceSource } from '../../ongil-start/js/data-source.js';
import { failureText, isRetryable, FAILURE_DETAILS } from '../../ongil-start/js/views.js';

const ROOT = path.resolve(new URL('../../', import.meta.url).pathname);
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const STATUS = { ok: true, providers: { 'kr-lifelong-class': { configured: true }, 'kr-kakao-place': { configured: true }, 'kr-tourapi': { configured: true } } };
const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const status = (st, code) => ({ ok: false, status: st, json: async () => ({ ok: false, code }) });

/* answers: list for the data requests (the status request always succeeds unless statusAnswer is given) */
function stub(answers, statusAnswer = null) {
  const calls = [];
  let i = 0;
  const fetcher = async (url) => {
    calls.push(url);
    if (url.includes('action=status')) { if (statusAnswer) return typeof statusAnswer === 'function' ? statusAnswer() : statusAnswer; return ok(STATUS); }
    const a = answers[Math.min(i++, answers.length - 1)];
    return typeof a === 'function' ? a() : a;
  };
  return { fetcher, calls, data: () => calls.filter((c) => !c.includes('action=status')) };
}
const KIND = { id: 'health-center', query: '보건소' };
const sources = (fetcher, extra = {}) => ({
  lifelong: createLifelongClassSource({ apiUrl: (p) => p, fetcher, retryDelayMs: 0, ...extra }),
  facility: createFacilitySource({ apiUrl: (p) => p, fetcher, retryDelayMs: 0, ...extra }),
  place: createEnjoyPlaceSource({ apiUrl: (p) => p, fetcher, retryDelayMs: 0, ...extra }),
  tour: createTourPlaceSource({ apiUrl: (p) => p, fetcher, retryDelayMs: 0, ...extra }),
});
const loadAll = (S) => Promise.all([S.lifelong.load({ region: '서울' }), S.facility.load({ region: '서울', kind: KIND }), S.place.load({ region: '서울', word: '공원' }), S.tour.load({ region: '서울', contentType: '12' })]);

test('OST-01 a 502 from the data route is retried once, quietly; the second answer is used', async () => {
  for (const name of ['lifelong', 'facility', 'place', 'tour']) {
    const s = stub([status(502, 'UPSTREAM_ERROR'), ok({ ok: true, items: [] })]);
    const r = await sources(s.fetcher)[name].load(name === 'lifelong' ? { region: '서울' } : name === 'facility' ? { region: '서울', kind: KIND } : name === 'place' ? { region: '서울', word: '공원' } : { region: '서울', contentType: '12' });
    assert.equal(r.state, 'empty', name); assert.equal(s.data().length, 2, name + ': one retry');
  }
});

test('OST-02 two 502s → NO_ANSWER with detail UPSTREAM; never a third request; nothing invented', async () => {
  const s = stub([status(502, 'UPSTREAM_ERROR')]);
  const rs = await loadAll(sources(s.fetcher));
  assert.deepEqual(rs.map((r) => [r.state, r.reason, r.detail, r.items.length]), Array(4).fill(['unavailable', 'NO_ANSWER', 'UPSTREAM', 0]));
  assert.equal(s.data().length, 8, 'two requests per source');
});

test('OST-03 504 → UPSTREAM_SLOW (retried once); 503 and 429 → LIMIT (not retried); 500 and a non-{ok:true} body → SERVER', async () => {
  const cases = [[status(504, 'TIMEOUT'), 'UPSTREAM_SLOW', 2], [status(503, 'UPSTREAM_LIMIT'), 'LIMIT', 1], [status(429, 'RATE_LIMIT'), 'LIMIT', 1], [status(500, 'SERVER_ERROR'), 'SERVER', 1], [ok({ ok: false }), 'SERVER', 1]];
  for (const [answer, detail, n] of cases) {
    const s = stub([answer]);
    const r = await sources(s.fetcher).tour.load({ region: '서울', contentType: '12' });
    assert.deepEqual([r.reason, r.detail], ['NO_ANSWER', detail], detail); assert.equal(s.data().length, n, detail + ' requests');
  }
});

test('OST-04 offline, network and timeout are told apart (from what the browser saw, not guessed)', async () => {
  let s = stub([async () => { throw new TypeError('Failed to fetch'); }]);
  assert.equal((await sources(s.fetcher).tour.load({ region: '서울', contentType: '12' })).detail, 'NETWORK');
  s = stub([async () => { throw new TypeError('Failed to fetch'); }]);
  assert.equal((await sources(s.fetcher, { online: () => false }).tour.load({ region: '서울', contentType: '12' })).detail, 'NETWORK', 'online is not a source option: navigator decides');
  const abort = async () => { const e = new Error('aborted'); e.name = 'AbortError'; throw e; };
  s = stub([abort]);
  assert.equal((await sources(s.fetcher).tour.load({ region: '서울', contentType: '12' })).detail, 'TIMEOUT');
  /* the status request itself failing is the same NO_ANSWER (the screen says "try again", not "not connected") */
  s = stub([ok({ ok: true, items: [] })], status(502, 'UPSTREAM_ERROR'));
  const r = await sources(s.fetcher).facility.load({ region: '서울', kind: KIND });
  assert.deepEqual([r.reason, r.detail], ['NO_ANSWER', 'UPSTREAM']);
});

test('OST-05 offline via navigator.onLine = false', async () => {
  const had = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true });
  try {
    const s = stub([async () => { throw new TypeError('Failed to fetch'); }]);
    const r = await sources(s.fetcher).place.load({ region: '서울', word: '공원' });
    assert.equal(r.detail, 'OFFLINE');
  } finally { if (had) Object.defineProperty(globalThis, 'navigator', had); else delete globalThis.navigator; }
});

test('OST-06 not connected stays not connected: 404 / no key → NOT_CONFIGURED without detail, not retryable', async () => {
  const s = stub([ok({ ok: true, items: [] })], status(404, ''));
  const r = await sources(s.fetcher).lifelong.load({ region: '서울' });
  assert.deepEqual([r.state, r.reason, r.detail], ['unavailable', 'NOT_CONFIGURED', undefined]);
  assert.equal(isRetryable(r), false); assert.equal(isRetryable({ state: 'unavailable', reason: 'NO_ANSWER' }), true);
  assert.equal(s.data().length, 0, 'no search without a configured key');
});

test('OST-07 words for each kind: what happened, never why; 을/를 follows the subject; every kind ends with what to do', () => {
  assert.deepEqual([...FAILURE_DETAILS], ['OFFLINE', 'NETWORK', 'TIMEOUT', 'UPSTREAM', 'UPSTREAM_SLOW', 'LIMIT', 'SERVER']);
  const t = (detail, subject) => failureText({ state: 'unavailable', reason: 'NO_ANSWER', detail }, subject);
  assert.match(t('OFFLINE', '기관 정보'), /^인터넷이 연결되어 있지 않아 기관 정보를 받아오지 못했어요/);
  assert.match(t('UPSTREAM', '강좌 정보'), /^강좌 정보를 주는 곳이 지금 응답하지 않아요/);
  assert.match(t('UPSTREAM_SLOW', '자료'), /^자료를 주는 곳의 응답이 늦어요/);
  assert.match(t('LIMIT', '기관 정보'), /요청이 많아/);
  assert.equal(t('', '강좌 정보'), '지금은 강좌 정보를 받아오지 못했어요. 잠시 뒤 다시 찾아 주세요.');
  for (const d of [...FAILURE_DETAILS, '']) {
    const x = t(d, '기관 정보');
    assert.match(x, /다시 찾아 주세요\.$/, d);
    assert.doesNotMatch(x, /키|key|카카오|Kakao|서버 오류|원인|ONGIL 문제/i, d + ': no guessed cause, no provider blamed');
  }
});

test('OST-08 loading, empty and error are three different states on Home, 돌봄 and 즐길거리', () => {
  const home = read('ongil-start/js/home-explore.js'), care = read('ongil-start/js/care-view.js'), enjoy = read('ongil-start/js/enjoy-view.js');
  assert.match(home, /setRegionState\(zone, 'loading', '강좌를 찾고 있습니다\.'\)/);
  assert.match(home, /setRegionState\(zone, 'empty', '지금 모집 중인 강좌를 찾지 못했어요\.'\)/);
  assert.match(home, /setRegionState\(zone, 'error', failureText\(result, '강좌 정보'\)\)/);
  assert.match(care, /setRegionState\(zone, 'error', failureText\(state\.lastLoad, '기관 정보'\)\)/);
  assert.match(care, /detail: result\.detail \|\| ''/);
  assert.match(enjoy, /state: items\.length \? 'ready' : failed \? 'error' :/);
  assert.match(read('ongil-start/js/views.js'), /role: state === 'error' \? 'alert' : 'status'/, 'an error is announced as an alert, the others politely');
});

test('OST-09 recovery: 다시 찾기 repeats the same search (Home and 돌봄); 즐길거리 keeps its 찾기 button next to the words', () => {
  const home = read('ongil-start/js/home-explore.js'), care = read('ongil-start/js/care-view.js');
  assert.match(home, /'data-og-home-retry': 'lifelong', text: '다시 찾기', onclick: \(\) => button\.click\(\)/);
  assert.match(care, /'data-og-care-retry': 'facility', text: '다시 찾기'/);
  assert.match(care, /form\.requestSubmit\(\)/);
});

test('OST-10 the shared data route and LIVON are untouched; ONGIL still calls only /api/livon/data with GET and no credentials', () => {
  const r = spawnSync('git', ['diff', '--name-only', '70a816aa9df58570ebe73b09c75d8d3c71ac83c0', 'HEAD', '--'], { cwd: ROOT, encoding: 'utf8' });
  if (r.status === 0) assert.deepEqual(r.stdout.split('\n').filter(Boolean).filter((f) => !/^(ongil-start\/|docs\/ongil\/|tests\/ongil\/)/.test(f)), []);
  const ds = read('ongil-start/js/data-source.js');
  assert.match(ds, /const DATA_PATH = '\/api\/livon\/data';/);
  assert.match(ds, /method: 'GET', headers: \{ accept: 'application\/json' \}, credentials: 'omit'/);
  const v = read('ongil-start/js/views.js'), words = v.slice(v.indexOf('export const FAILURE_DETAILS'), v.indexOf('export function renderArea('));
  assert.ok(words.length > 200); assert.doesNotMatch(words, /fetch\(|XMLHttpRequest|storage/, 'words only');
});

test('OST-11 no new module: the failure words live in views.js next to setRegionState; the import map is current; the entry version is unchanged', () => {
  const html = read('ongil-start/index.html');
  assert.equal(fs.existsSync(path.join(ROOT, 'ongil-start/js/source-failure.js')), false);
  assert.match(read('ongil-start/js/views.js'), /export function failureText\(result, subject = '자료'\)/);
  const r = spawnSync(process.execPath, ['scripts/ongil-module-versions.mjs'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(html, /<script type="module" src="\/ongil-start\/js\/app\.js\?v=20261009hv2"><\/script>/, 'app.js did not change, so its entry version stays');
});

test('OST-12 document: docs/ongil/ONGIL_STABILITY_V1.md separates what was observed from what was NOT VERIFIED', () => {
  const d = read('docs/ongil/ONGIL_STABILITY_V1.md');
  for (const re of [/NOT VERIFIED/, /UPSTREAM_ERROR/, /kr-kakao-place/, /kr-lifelong-class/, /kr-tourapi/, /PUSH = NO/, /DEPLOY = NO/]) assert.match(d, re);
});

/* ═════════ browser (Chromium): the real ONGIL app, the data route answered by a stub ═════════ */
import http from 'node:http';
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const skip = !(fs.existsSync(PW) && fs.existsSync(CHROME)) && 'no local Chromium';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
let B = null, SERVER = null, BASE = '';
async function boot() {
  if (B) return;
  const { chromium } = await import(PW);
  SERVER = await new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); return res.end(fs.readFileSync(f)); }
      res.writeHead(404); res.end();
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
  BASE = `http://127.0.0.1:${SERVER.address().port}`;
  B = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
}
test.after(async () => { if (B) await B.close(); if (SERVER) SERVER.close(); });

/* plan: the answers for the lifelong data requests in order (the last one repeats); each { status, body, delay } */
async function homeWithRoute(plan) {
  await boot();
  const ctx = await B.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
  const data = [];
  await ctx.route('**/*', async (r) => {
    const url = r.request().url();
    if (/\/api\/livon\/data/.test(url)) {
      if (/action=status/.test(url)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(STATUS) });
      const a = plan[Math.min(data.length, plan.length - 1)];
      data.push(url);
      if (a.delay) await new Promise((res) => setTimeout(res, a.delay));
      return r.fulfill({ status: a.status, contentType: 'application/json', body: JSON.stringify(a.body) });
    }
    return url.startsWith(BASE) ? r.continue() : r.abort();
  });
  const pg = await ctx.newPage();
  pg._errors = []; pg.on('pageerror', (e) => pg._errors.push(e.message));
  await pg.goto(`${BASE}/ongil-start/#ongil-home`, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  /* the region is the person's own setting (내 정보); Home reads it when it is drawn */
  await pg.evaluate(() => window.Ongil.profile.updateProfile({ region: '서울' }));
  await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  return { pg, ctx, data };
}
const nearby = (pg) => pg.evaluate(() => {
  const part = document.querySelector('[data-og-home-part="nearby"]');
  const zone = part && part.querySelector('[data-og-region="nearby"]');
  const st = zone && zone.querySelector('[data-og-region-status]');
  const retry = part && part.querySelector('[data-og-home-retry]');
  const rb = retry && retry.getBoundingClientRect();
  return { part: part ? part.dataset.ogState : null, zone: zone ? zone.dataset.ogState : null, busy: zone ? zone.getAttribute('aria-busy') : null,
    role: st ? st.getAttribute('role') : null, text: st ? st.textContent : '', retry: !!retry, retrySize: rb ? [Math.round(rb.width), Math.round(rb.height)] : null };
});
const press = (pg) => pg.evaluate(() => { const b = [...document.querySelectorAll('[data-og-home-part="nearby"] button')].find((x) => /지역 강좌 찾아보기/.test(x.textContent)); b.click(); });

test('OST-B1 browser: loading → error (two 502s, one quiet retry) with 다시 찾기 → the same search again → empty, three states told apart', { skip }, async () => {
  const { pg, ctx, data } = await homeWithRoute([{ status: 502, body: { ok: false, code: 'UPSTREAM_ERROR' }, delay: 400 }]);
  await press(pg); await pg.waitForTimeout(150);
  const loading = await nearby(pg);
  assert.equal(loading.zone, 'loading'); assert.equal(loading.busy, 'true'); assert.equal(loading.role, 'status');
  await pg.waitForTimeout(2200);
  const err = await nearby(pg);
  assert.equal(err.zone, 'error'); assert.equal(err.busy, 'false'); assert.equal(err.role, 'alert');
  assert.match(err.text, /강좌 정보를 주는 곳이 지금 응답하지 않아요\. 잠시 뒤 다시 찾아 주세요\./);
  assert.equal(data.length, 2, 'one request and one quiet retry — never a third');
  assert.ok(err.retry && err.retrySize[0] >= 44 && err.retrySize[1] >= 44, '다시 찾기 is a 44px target');
  /* recovery: the provider answers again (no class open now) */
  await ctx.unroute('**/*');
  const again = [];
  await ctx.route('**/*', (r) => {
    const url = r.request().url();
    if (/\/api\/livon\/data/.test(url)) {
      if (/action=status/.test(url)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(STATUS) });
      again.push(url); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, items: [] }) });
    }
    return url.startsWith(BASE) ? r.continue() : r.abort();
  });
  await pg.evaluate(() => document.querySelector('[data-og-home-retry]').click());
  await pg.waitForTimeout(800);
  const empty = await nearby(pg);
  assert.equal(empty.zone, 'empty'); assert.equal(empty.role, 'status'); assert.equal(empty.retry, false);
  assert.match(empty.text, /지금 모집 중인 강좌를 찾지 못했어요\./);
  assert.equal(again.length, 1); assert.equal(again[0].replace(/^.*\?/, ''), data[0].replace(/^.*\?/, ''), '다시 찾기 sends the same search');
  assert.deepEqual(pg._errors, []);
  await ctx.close();
});

test('OST-B2 browser: a single 502 is retried quietly and the second answer is used (no error shown)', { skip }, async () => {
  const { pg, ctx, data } = await homeWithRoute([{ status: 502, body: { ok: false, code: 'UPSTREAM_ERROR' } }, { status: 200, body: { ok: true, items: [] } }]);
  await press(pg); await pg.waitForTimeout(2000);
  const r = await nearby(pg);
  assert.equal(data.length, 2); assert.equal(r.zone, 'empty'); assert.notEqual(r.role, 'alert'); assert.equal(r.retry, false);
  assert.deepEqual(pg._errors, []);
  await ctx.close();
});

test('OST-B3 browser: 504 twice → "응답이 늦어요" error; 503 → not retried, "요청이 많아"; not configured → plain sentence, no 다시 찾기', { skip }, async () => {
  let { pg, ctx, data } = await homeWithRoute([{ status: 504, body: { ok: false, code: 'TIMEOUT' } }]);
  await press(pg); await pg.waitForTimeout(2200);
  let r = await nearby(pg);
  assert.equal(data.length, 2); assert.equal(r.zone, 'error'); assert.match(r.text, /강좌 정보를 주는 곳의 응답이 늦어요/); assert.ok(r.retry);
  await ctx.close();
  ({ pg, ctx, data } = await homeWithRoute([{ status: 503, body: { ok: false, code: 'UPSTREAM_LIMIT' } }]));
  await press(pg); await pg.waitForTimeout(1500);
  r = await nearby(pg);
  assert.equal(data.length, 1, '503 is never retried'); assert.equal(r.zone, 'error'); assert.match(r.text, /요청이 많아/);
  await ctx.close();
  /* the route says the provider is not configured: not a temporary failure */
  await boot();
  ctx = await B.newContext({ viewport: { width: 390, height: 900 } });
  const calls = [];
  await ctx.route('**/*', (q) => {
    const url = q.request().url();
    if (/\/api\/livon\/data/.test(url)) { calls.push(url); return q.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, providers: { 'kr-lifelong-class': { configured: false } } }) }); }
    return url.startsWith(BASE) ? q.continue() : q.abort();
  });
  pg = await ctx.newPage();
  await pg.goto(`${BASE}/ongil-start/#ongil-home`, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  await pg.evaluate(() => window.Ongil.profile.updateProfile({ region: '서울' }));
  await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  await press(pg); await pg.waitForTimeout(1200);
  r = await nearby(pg);
  assert.equal(r.zone, 'empty'); assert.notEqual(r.role, 'alert'); assert.equal(r.retry, false);
  assert.match(r.text, /주변 강좌 정보는 지금 쓸 수 없어요/);
  assert.equal(calls.filter((c) => !/action=status/.test(c)).length, 0, 'no data request when the provider is not configured');
  await ctx.close();
});
