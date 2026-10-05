// LIVON Today V2 — 내 오늘 (TV2-01 … TV2-56). Today shows My Life's own records from today's point of view and keeps no
// data of its own. Data tests run everywhere (node:vm, fixed clocks); browser tests need a local Chromium and skip without.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, 'livon', f), 'utf8');
const ML = 'livon.mlStore.v1';
const J = x => JSON.parse(JSON.stringify(x));
const TODAY_JS = read('today-page.js');
const MY_TODAY = TODAY_JS.slice(TODAY_JS.indexOf('/* ———————— 내 오늘'), TODAY_JS.indexOf('  function renderAll() {'));
const PAGE = read('life-now-page.js'), HUB = read('life-now-hub.js'), INDEX = read('index.html');
const FILES = ['data/livon-user-data.js', 'explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js', 'today-feed.js', 'explore-search.js', 'life-now-data.js', 'life-now-hub.js', 'life-now-page.js'];

function app({ store, raw } = {}) {
  const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m }; };
  const saves = new Map();
  const ctx = {
    window: {}, localStorage: mem(), sessionStorage: mem(), location: { hash: '#today' }, navigator: {}, URL, history: { state: null, replaceState() {}, pushState() {} },
    document: { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null }, contains: () => false },
    fetch: () => { throw new Error('no network'); }, setTimeout, console, addEventListener() {},
  };
  ctx.window = ctx;
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, x), removeSave: id => saves.delete(id), folders: () => ['나중에 보기'] };
  if (raw != null) ctx.localStorage.setItem(ML, raw);
  if (store) ctx.localStorage.setItem(ML, JSON.stringify(store));
  vm.createContext(ctx);
  for (const f of FILES) vm.runInContext(read(f), ctx);
  return { ctx, api: ctx.LivonMyLife.api, T: ctx.LivonMyLife._test, raw: () => JSON.parse(ctx.localStorage.getItem(ML) || 'null'), ls: ctx.localStorage };
}
function reload(a) { const b = app(); for (const [k, v] of a.ls._m) b.ls.setItem(k, v); return b; }
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const at = (y, m, d, hh = 9, mm = 0) => new Date(y, m - 1, d, hh, mm);
const addD = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
/* a fixed day (Wednesday 2026-10-07) with records around it */
const NOW = at(2026, 10, 7, 10, 30);
function dayStore() {
  const d = n => ymd(addD(NOW, n)), ms = at(2026, 9, 1).getTime();
  return { v: 2,
    todos: [{ id: 't-today', title: '보고서 제출', due: d(0), priority: '높음', createdAt: ms }, { id: 't-done', title: '끝낸 일', due: d(0), done: true, doneAt: ms, createdAt: ms },
      { id: 't-late', title: '지난 세금 신고', due: d(-2), createdAt: ms }, { id: 't-late-done', title: '지난 완료', due: d(-1), done: true, createdAt: ms },
      { id: 't-future', title: '책 반납', due: d(3), createdAt: ms }, { id: 't-nodate', title: '날짜 없는 일', due: '', createdAt: ms }, { id: 't-far', title: '먼 마감', due: d(8), createdAt: ms }],
    events: [{ id: 'e-timed', title: '팀 회의', date: d(0), start: '14:00', end: '15:00', place: '회의실' }, { id: 'e-allday', title: '어머니 생신', date: d(0), allDay: true },
      { id: 'e-tomorrow', title: '병원 예약', date: d(1), start: '09:30' }, { id: 'e-d7', title: '7일 뒤', date: d(7) }, { id: 'e-d8', title: '8일 뒤', date: d(8) }, { id: 'e-yday', title: '어제 일정', date: d(-1) }],
    goals: [{ id: 'g1', title: '독립 준비', status: '진행 중', due: d(5) }],
    habits: [{ id: 'h-daily', title: '아침 산책', freq: 'daily', createdAt: ms }, { id: 'h-wed', title: '수영', freq: 'days', days: [3], createdAt: ms }, { id: 'h-mon', title: '요가', freq: 'days', days: [1], createdAt: ms }],
    habitLogs: { 'h-daily': { [d(-1)]: true } }, journal: [{ id: 'j1', title: '기록은 오늘에 나오지 않음', date: d(0), body: 'x' }],
    transactions: [], budgets: { monthly: 0, categories: {} }, health: [], experiences: [], checklists: [], projects: [], folders: [], settings: { weekStartsOn: 0, currency: 'KRW', fontScale: 'md' } };
}

/* ═════════ data: the today model over the My Life store ═════════ */
test('TV2-02 the model is built for the device-local date', () => {
  const { api } = app({ store: dayStore() });
  const m = api.today(NOW);
  assert.equal(m.date, '2026-10-07'); assert.equal(m.weekday, '수'); assert.equal(m.label, '10월 7일 (수)');
});

test('TV2-05 / TV2-06 / TV2-07 today\'s tasks: due today (open first), later ones excluded, overdue listed separately and truthfully', () => {
  const { api } = app({ store: dayStore() });
  const m = api.today(NOW);
  assert.deepEqual(J(m.todos.map(t => t.id)), ['t-today', 't-done']);
  assert.equal(m.todos[0].priority, '높음'); assert.equal(m.todos[1].done, true);
  for (const id of ['t-future', 't-nodate', 't-far']) assert.ok(!m.todos.some(t => t.id === id), id);
  assert.deepEqual(J(m.overdue.map(t => [t.id, t.due, t.dueLabel])), [['t-late', '2026-10-05', '10월 5일 (월)']], 'only open overdue tasks, with their real date');
});

test('TV2-08 / TV2-09 task completion and undo from Today are the My Life record (persist across reload)', () => {
  const a = app({ store: dayStore() });
  assert.deepEqual(J(a.api.setTodoDone('t-today', true)), { id: 't-today', title: '보고서 제출', done: true });
  const b = reload(a);
  assert.equal(b.raw().todos.find(t => t.id === 't-today').done, true);
  assert.equal(typeof b.raw().todos.find(t => t.id === 't-today').doneAt, 'number');
  assert.equal(b.api.today(NOW).todos.find(t => t.id === 't-today').done, true);
  b.api.setTodoDone('t-today', false);
  const c = reload(b);
  assert.equal(c.raw().todos.find(t => t.id === 't-today').done, false);
  assert.equal(c.api.setTodoDone('no-such', true), null);
});

test('TV2-10 / TV2-11 / TV2-12 / TV2-13 today\'s schedule: all-day first, then by time; other days excluded', () => {
  const { api } = app({ store: dayStore() });
  const m = api.today(NOW);
  assert.deepEqual(J(m.events), [
    { id: 'e-allday', title: '어머니 생신', allDay: true, start: '', end: '', place: '', done: false },
    { id: 'e-timed', title: '팀 회의', allDay: false, start: '14:00', end: '15:00', place: '회의실', done: false }]);
});

test('TV2-14 / TV2-15 / TV2-16 / TV2-17 routines: only the ones scheduled today; check and undo write the My Life log', () => {
  const a = app({ store: dayStore() });
  const m = a.api.today(NOW);
  assert.deepEqual(J(m.routines.map(r => r.id)), ['h-daily', 'h-wed'], 'Wednesday: daily + Wednesday routine, not the Monday one');
  assert.equal(a.api.setRoutineDone('h-mon', true, NOW), null, 'a routine not scheduled today cannot be checked from Today');
  assert.deepEqual(J(a.api.setRoutineDone('h-wed', true, NOW)), { id: 'h-wed', title: '수영', done: true });
  const b = reload(a);
  assert.equal(b.raw().habitLogs['h-wed']['2026-10-07'], true);
  assert.equal(b.api.today(NOW).routines.find(r => r.id === 'h-wed').done, true);
  b.api.setRoutineDone('h-wed', false, NOW);
  assert.equal(reload(b).raw().habitLogs['h-wed']['2026-10-07'], undefined);
});

test('TV2-18 / TV2-19 / TV2-20 upcoming: tomorrow … +7 days, real dates only — nothing invented, today not repeated', () => {
  const { api } = app({ store: dayStore() });
  const up = api.today(NOW).upcoming;
  assert.deepEqual(J(up.map(x => x.kind + ':' + x.id + ':' + x.date)), ['event:e-tomorrow:2026-10-08', 'todo:t-future:2026-10-10', 'goal:g1:2026-10-12', 'event:e-d7:2026-10-14']);
  assert.ok(!up.some(x => ['t-nodate', 'e-d8', 't-far', 'e-timed', 't-today'].includes(x.id)));
  assert.equal(up[0].time, '09:30');
});

test('TV2-23 Today keeps no store of its own: no storage key, no write except through the My Life API', () => {
  for (const bad of [/localStorage/, /sessionStorage/, /writeJSON\(/, /indexedDB/]) assert.doesNotMatch(MY_TODAY, bad);
  assert.match(MY_TODAY, /api\.setTodoDone\(/); assert.match(MY_TODAY, /api\.setRoutineDone\(/);
  const a = app({ store: dayStore() });
  const before = [...a.ls._m.keys()].sort();
  a.api.today(NOW); a.api.setTodoDone('t-today', true); a.api.setRoutineDone('h-daily', true, NOW);
  assert.deepEqual([...a.ls._m.keys()].sort().filter(k => !before.includes(k)).filter(k => k !== 'livon.userData.meta.v1'), [], 'no new key');
});

test('TV2-21 one record: what Today shows equals what My Life shows for the same day', () => {
  const { api, T } = app({ store: dayStore() });
  api.setTodoDone('t-today', true); api.setRoutineDone('h-daily', true, NOW);
  const s = T.loadStore(), m = api.today(NOW);
  for (const t of m.todos) assert.equal(s.todos.find(x => x.id === t.id).done, t.done);
  const day = T.dayItems(s, '2026-10-07');
  assert.deepEqual(J(m.events.map(e => e.id)), J(day.events.map(e => e.id)), 'same order as the My Life calendar day');
  assert.equal(!!s.habitLogs['h-daily']['2026-10-07'], m.routines.find(r => r.id === 'h-daily').done);
});

test('TV2-24 / TV2-25 / TV2-26 / TV2-27 / TV2-28 dates in Asia/Seoul and UTC: midnight, month, year and leap-day boundaries', () => {
  const code = `
    const vm = require('node:vm'), fs = require('node:fs'), path = require('node:path'); const R = ${JSON.stringify(ROOT)};
    const m = new Map(); const ls = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; } };
    const ctx = { localStorage: ls, sessionStorage: ls, location: { hash: '' }, navigator: {}, URL, history: { replaceState() {}, pushState() {} }, setTimeout, console, addEventListener() {},
      document: { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, contains: () => false } };
    ctx.window = ctx; vm.createContext(ctx);
    for (const f of ['data/livon-user-data.js', 'life-now-data.js', 'life-now-hub.js', 'life-now-page.js']) vm.runInContext(fs.readFileSync(path.join(R, 'livon', f), 'utf8'), ctx);
    const api = ctx.LivonMyLife.api;
    ls.setItem('livon.mlStore.v1', JSON.stringify({ v: 2, todos: [
      { id: 'a', title: 'eve', due: '2026-10-31' }, { id: 'b', title: 'nov1', due: '2026-11-01' }, { id: 'c', title: 'dec31', due: '2026-12-31' }, { id: 'd', title: 'jan1', due: '2027-01-01' }, { id: 'e', title: 'leap', due: '2028-02-29' }, { id: 'f', title: 'mar1', due: '2028-03-01' }],
      events: [], habits: [], habitLogs: {} }));
    const ids = now => { const t = api.today(now); return [t.date, t.todos.map(x => x.id).join(''), t.upcoming.map(x => x.id).join('')]; };
    console.log(JSON.stringify({
      lastSecond: ids(new Date(2026, 9, 31, 23, 59, 59)), firstSecond: ids(new Date(2026, 10, 1, 0, 0, 0)),
      yearEnd: ids(new Date(2026, 11, 31, 23, 59)), yearStart: ids(new Date(2027, 0, 1, 0, 1)),
      leap: ids(new Date(2028, 1, 29, 12)), afterLeap: ids(new Date(2028, 2, 1, 0, 0)) }));`;
  const want = { lastSecond: ['2026-10-31', 'a', 'b'], firstSecond: ['2026-11-01', 'b', ''], yearEnd: ['2026-12-31', 'c', 'd'], yearStart: ['2027-01-01', 'd', ''], leap: ['2028-02-29', 'e', 'f'], afterLeap: ['2028-03-01', 'f', ''] };
  for (const TZ of ['Asia/Seoul', 'UTC', 'America/Los_Angeles']) {
    const r = spawnSync(process.execPath, ['-e', code], { env: { ...process.env, TZ }, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout.trim().split('\n').pop()), want, TZ);
  }
  assert.doesNotMatch(MY_TODAY, /new Date\(\s*["'`]?\d{4}-\d\d-\d\d/, 'no Date("YYYY-MM-DD") parsing (UTC midnight) in Today');
});

test('TV2-29 Today/My Life records never enter the public LIVON search', () => {
  const a = app({ store: dayStore() });
  const idx = JSON.stringify(a.ctx.LivonSearch.rebuild()) + JSON.stringify(a.ctx.LivonSearch.search('보고서 제출')) + JSON.stringify(a.ctx.LivonSearch.suggest('보고서', 30));
  for (const t of ['보고서 제출', '어머니 생신', '아침 산책']) assert.equal(idx.includes(t), false, t);
});

test('TV2-30 / TV2-31 / TV2-32 Community, sitemap/SEO generator and static HTML do not read or carry My Life records', () => {
  const cm = read('community-page.js') + read('community-service.js');
  /* the only My Life key Community touches is its own legacy save list (moved to the shared saves) */
  const uses = [...cm.matchAll(/\bml\.(\w+)/g)].map(m => m[1]);
  assert.deepEqual([...new Set(uses)], ['savedCommunity'], 'Community reads no My Life record');
  assert.doesNotMatch(cm, /LivonMyLife|ml\.(todos|events|habits|habitLogs|journal)/);
  for (const f of fs.readdirSync(path.join(ROOT, 'scripts')).filter(n => /^(livon-seo|render-livon|publish-site)/.test(n))) assert.doesNotMatch(fs.readFileSync(path.join(ROOT, 'scripts', f), 'utf8'), /mlStore|LivonMyLife/, f);
  const sec = INDEX.slice(INDEX.indexOf('id="td-mytoday"'), INDEX.indexOf('id="td-pick"'));
  assert.match(sec, /data-td-my><p class="lv-td-my__empty">내 생활에 기록한 오늘의 할 일·일정·루틴은 <a href="#ml-home">내 생활<\/a>에서 볼 수 있어요\.<\/p><\/div>/, 'the static page only has the generic fallback line');
});

test('TV2-33 no record title in any URL Today builds: every link is a fixed internal route', () => {
  const hrefs = [...MY_TODAY.matchAll(/href="([^"]*)"/g)].map(m => m[1]).filter(h => !h.includes("' + href + '"))
    .concat([...MY_TODAY.matchAll(/myEmpty\("[^"]*", "([^"]+)"/g)].map(m => m[1]));
  assert.match(MY_TODAY, /function myEmpty\(text, href, label\)/); assert.equal((MY_TODAY.match(/myEmpty\(/g) || []).length, 5, 'four calls + the definition');
  assert.ok(hrefs.length >= 9, hrefs.join(' '));
  for (const h of hrefs) assert.match(h, /^#(ml-[a-z]+(\?filter=today)?|td-pick)$/, h);
  assert.doesNotMatch(MY_TODAY, /location\.(hash|href)\s*=|history\.(push|replace)State/, 'Today does not put anything into the address');
});

test('TV2-34 / TV2-35 / TV2-36 / TV2-37 / TV2-38 nothing is sent, AI stays off, no sync, no fake notification or cloud claim', () => {
  for (const bad of [/fetch\(/, /XMLHttpRequest/, /sendBeacon/, /LivonAI|shareMyLife|aiStore/, /LivonSync|livon-sync|firebase/i, /Notification\(|serviceWorker|PushManager/, /console\./])
    assert.doesNotMatch(MY_TODAY, bad, String(bad));
  assert.match(read('ai-page.js'), /shareSaved: false, shareMyLife: false \}/, 'AI may use My Life only after opt-in (default OFF)');
  const words = MY_TODAY.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const bad of ['동기화', '백업', '클라우드', '알림을 보냈', '알려드릴게요', '전송했', '추천해 드려요', 'AI']) assert.equal(words.includes(bad), false, bad);
  assert.match(words, /이 영역의 내용은 이 기기에만 있고 어디에도 보내지 않아요/);
});

test('TV2-39 terminology: the routine is "루틴" everywhere a person reads it in My Life and Today', () => {
  const ui = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/habitPresets|data-lv-ml-habit|habit\w*/g, '');
  for (const [f, s] of [['life-now-page.js', PAGE], ['life-now-hub.js', HUB], ['today-page.js (내 오늘)', MY_TODAY]]) assert.equal(ui(s).includes('습관'), false, f);
  const ml = INDEX.slice(INDEX.indexOf('id="life-now"'), INDEX.indexOf('id="explore"'));
  assert.equal(ml.includes('습관'), false, 'My Life markup');
  assert.match(PAGE, /habit: "루틴"/);
});

test('TV2-40a Korean particles follow the word: 거래를, 할 일을, 루틴을, 일정을 — no "을(를)" for known words', () => {
  const { api } = app();
  const cases = [['거래', '을를', '거래를'], ['할 일', '을를', '할 일을'], ['루틴', '을를', '루틴을'], ['일정', '을를', '일정을'], ['목표', '을를', '목표를'], ['건강 기록', '을를', '건강 기록을'],
    ['병원', '과와', '병원과'], ['이력서', '과와', '이력서와'], ['보고서', '이가', '보고서가'], ['회의', '이가', '회의가'], ['산책', '이가', '산책이'], ['Run', '을를', 'Run을(를)'], ['QA-2', '과와', 'QA-2과(와)']];
  for (const [w, p, want] of cases) assert.equal(api.josa(w, p), want, w);
  assert.doesNotMatch(PAGE.replace(/\/\*[\s\S]*?\*\//g, ''), /"을\(를\) (추가|저장|삭제)했습니다\."|\+ "을\(를\)/, 'messages no longer append a fixed 을(를)');
});

test('TV2-49 routine week count leaves out the days before the routine existed (no "0/7" on its first day)', () => {
  const { T } = app();
  const ws = T.startOfWeek(at(2026, 10, 8), 0); // Sun 2026-10-04
  const created = at(2026, 10, 8, 8).getTime(); // made on Thursday
  assert.deepEqual(J(T.habitWeek({ id: 'h', title: 'x', freq: 'daily', createdAt: created }, {}, ws)), { done: 0, planned: 3 }, 'Thu, Fri, Sat');
  assert.deepEqual(J(T.habitWeek({ id: 'h', title: 'x', freq: 'days', days: [1, 3, 5], createdAt: created }, { h: { '2026-10-05': true, '2026-10-09': true } }, ws)), { done: 1, planned: 1 }, 'only Friday counts; a check before it existed is ignored');
  assert.deepEqual(J(T.habitWeek({ id: 'h', title: 'x', freq: 'weekly', createdAt: at(2026, 10, 20).getTime() }, {}, ws)), { done: 0, planned: 0 }, 'a weekly routine made after this week has nothing planned in it');
  assert.deepEqual(J(T.habitWeek({ id: 'h', title: 'x', freq: 'daily', createdAt: at(2026, 9, 1).getTime() }, {}, ws)), { done: 0, planned: 7 }, 'older routines are unchanged');
  const r = T.weeklyReview({ events: [], todos: [], goals: [], journal: [], health: [], transactions: [], habits: [{ id: 'h', title: 'x', freq: 'daily', createdAt: created }], habitLogs: {}, settings: { weekStartsOn: 0 } }, at(2026, 10, 8, 12), 0);
  assert.equal(r.habitPlanned, 3, 'the weekly review uses the same count');
});

test('TV2-50 damaged or empty My Life storage: the today model is empty, never invented, never throws', () => {
  for (const raw of ['{not json', '[]', 'null', '"x"']) {
    const { api } = app({ raw });
    assert.deepEqual(J(api.today(NOW)), { date: '2026-10-07', weekday: '수', label: '10월 7일 (수)', todos: [], overdue: [], events: [], routines: [], upcoming: [] }, raw);
  }
  const { api } = app({ store: { v: 2, todos: [null, 5, { title: 'id 없음', due: '2026-10-07' }], events: 'x', habits: [{ title: '루틴', freq: 'days', days: [] }] } });
  const m = api.today(NOW);
  assert.equal(m.todos.length, 1); assert.equal(typeof m.todos[0].id, 'string');
  assert.deepEqual(J(m.events), []); assert.equal(m.routines.length, 1, 'a routine with an empty day list is treated as daily (existing rule)');
});

test('TV2-51 cache window: a new page with an old Today script still shows a useful line; the new script with an old page renders nothing broken', () => {
  assert.match(INDEX, /<div data-td-my><p class="lv-td-my__empty">[^<]*<a href="#ml-home">내 생활<\/a>/);
  assert.match(MY_TODAY, /var host = \$\("\[data-td-my\]"\);\s*if \(!host\) return;/);
  assert.match(MY_TODAY, /if \(!api\) \{ host\.innerHTML = emptyHtml\(/, 'without the My Life script, an honest message');
  for (const f of ['today-page.js', 'today-page.css', 'life-now-page.js', 'life-now-hub.js']) assert.match(INDEX, new RegExp('/livon/' + f.replace(/\./g, '\\.') + '\\?v=20261004c6"'), f);
  assert.ok(INDEX.indexOf('/livon/life-now-page.js?') < INDEX.indexOf('/livon/today-page.js?'), 'My Life loads before Today');
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
      let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
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
/* the browser's real "today" — fixtures are built relative to it */
function liveStore() {
  const now = new Date(), d = n => ymd(addD(now, n)), ms = Date.now() - 864e6;
  const dow = now.getDay();
  return { v: 2,
    todos: [{ id: 't1', title: '보고서 제출', due: d(0), priority: '높음', createdAt: ms }, { id: 't2', title: '지난 세금 신고', due: d(-2), createdAt: ms }, { id: 't3', title: '책 반납', due: d(3), createdAt: ms }],
    events: [{ id: 'e1', title: '팀 회의', date: d(0), start: '14:00', end: '15:00' }, { id: 'e2', title: '어머니 생신', date: d(0), allDay: true }, { id: 'e3', title: '병원 예약', date: d(2), start: '10:00' }],
    goals: [], habits: [{ id: 'h1', title: '아침 산책', freq: 'daily', createdAt: ms }, { id: 'h2', title: '다른 요일 루틴', freq: 'days', days: [(dow + 1) % 7], createdAt: ms }],
    habitLogs: {}, journal: [], transactions: [], budgets: { monthly: 0, categories: {} }, health: [], experiences: [], checklists: [], projects: [], folders: [], settings: { weekStartsOn: 0, currency: 'KRW', fontScale: 'md' } };
}
const SKIPPED = JSON.stringify({ version: 1, state: 'SKIPPED', step: '', draft: null, updatedAt: 1 });
async function open(hash = '#today', { width = 1280, height = 860, store = liveStore(), record = null } = {}) {
  await boot();
  const ctx = await B.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  await ctx.route('**/*', r => { const u = r.request().url(); if (record) record.push(r.request().method() + ' ' + u); return u.startsWith(BASE) ? r.continue() : r.abort(); });
  await ctx.addInitScript(([pz, st]) => { try { if (!sessionStorage.getItem('tv2-seeded')) { sessionStorage.setItem('tv2-seeded', '1'); localStorage.setItem('livon.personalization.v1', pz); if (st) localStorage.setItem('livon.mlStore.v1', st); } } catch (e) {} }, [SKIPPED, store ? JSON.stringify(store) : '']);
  const pg = await ctx.newPage();
  pg._errors = []; pg._console = [];
  pg.on('pageerror', e => pg._errors.push(e.message)); pg.on('console', m => pg._console.push(m.text()));
  await pg.goto(BASE + '/livon/' + hash, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(900);
  return pg;
}
const go = async (pg, hash, wait = 500) => { await pg.evaluate(h => { location.hash = h; }, hash); await pg.waitForTimeout(wait); };
const status = async pg => { await pg.waitForTimeout(120); return pg.evaluate(() => document.querySelector('[data-td-my-status]').textContent); };
const mystore = pg => pg.evaluate(() => JSON.parse(localStorage.getItem('livon.mlStore.v1')));

test('TV2-01 / TV2-02 / TV2-03 Today opens with 내 오늘 first: local date, greeting, summary from real counts', { skip }, async () => {
  const pg = await open('#today');
  const r = await pg.evaluate(() => ({ view: document.documentElement.dataset.lvView, first: document.querySelector('#today .lv-td-body > section').id,
    date: document.querySelector('[data-td-my-date]').textContent, sum: [...document.querySelectorAll('.lv-td-my__sum li')].map(x => x.textContent),
    heads: [...document.querySelectorAll('#td-mytoday h2, #td-mytoday h3')].map(h => h.tagName + ':' + h.textContent), nav: document.querySelector('.lv-td-nav__track a').textContent }));
  const d = new Date();
  assert.equal(r.view, 'today'); assert.equal(r.first, 'td-mytoday'); assert.equal(r.nav, '내 오늘');
  assert.ok(r.date.startsWith(d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ('), r.date);
  assert.match(r.date, /(아침|오후|저녁|밤)이에요\.|오후예요\./);
  assert.deepEqual(r.sum, ['오늘 할 일 1개 중 0개 완료', '오늘 일정 2개', '오늘 루틴 1개 중 0개 완료', '기한 지난 할 일 1개']);
  assert.deepEqual(r.heads, ['H2:내 오늘', 'H3:오늘 할 일', 'H3:오늘 일정', 'H3:오늘 루틴', 'H3:다가오는 7일']);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('TV2-04 empty My Life: honest empty lines, links to the real My Life screens, nothing invented', { skip }, async () => {
  const pg = await open('#today', { store: null });
  const t = await pg.locator('[data-td-my]').innerText();
  for (const s of ['오늘 마감인 할 일 없음', '오늘 일정 없음', '오늘 루틴 없음', '오늘 할 일이 없어요.', '오늘 예정된 일정이 없어요.', '오늘 할 루틴이 없어요.', '앞으로 7일 동안 예정된 일정·마감이 없어요.']) assert.ok(t.includes(s), s);
  const hrefs = await pg.evaluate(() => [...document.querySelectorAll('[data-td-my] a')].map(a => a.getAttribute('href')));
  for (const h of ['#ml-todos', '#ml-calendar', '#ml-routines']) assert.ok(hrefs.includes(h), h);
  assert.equal(await pg.locator('[data-td-my] input[type=checkbox]').count(), 0);
  assert.equal(await pg.evaluate(() => localStorage.getItem('livon.mlStore.v1')), null, 'opening Today writes nothing');
  await pg.context().close();
});

test('TV2-21 / TV2-22 / TV2-40 / TV2-41 / TV2-42 check a task and a routine in Today with the keyboard → same state in My Life, after reload, announced', { skip }, async () => {
  const pg = await open('#today');
  const cb = pg.locator('#td-my-todo-t1');
  await cb.focus(); await pg.keyboard.press('Space');
  assert.match(await status(pg), /‘보고서 제출’ 할 일을 완료로 표시했어요\./);
  assert.equal(await pg.evaluate(() => document.activeElement.id), 'td-my-todo-t1', 'focus stays on the checkbox after the re-render');
  assert.equal(await pg.locator('#td-my-todo-t1').isChecked(), true);
  const rb = pg.locator('#td-my-routine-h1');
  await rb.focus(); await pg.keyboard.press('Space');
  assert.match(await status(pg), /‘아침 산책’ 루틴을 완료로 표시했어요\./);
  assert.match(await pg.locator('.lv-td-my__sum').innerText(), /오늘 할 일 1개 중 1개 완료[\s\S]*오늘 루틴 1개 중 1개 완료/);
  const s = await mystore(pg);
  assert.equal(s.todos.find(t => t.id === 't1').done, true);
  assert.equal(Object.keys(s.habitLogs.h1).length, 1);
  await go(pg, '#ml-todos', 700);
  assert.equal(await pg.locator('#ml-panel input[data-lv-ml-toggle="todo"][data-id="t1"]').isChecked(), true, 'My Life shows the same record');
  await go(pg, '#ml-routines', 600);
  assert.equal(await pg.locator('#ml-panel input[data-lv-ml-habit="h1"]').isChecked(), true);
  /* and back: undo in My Life → Today shows it open */
  await pg.locator('#ml-panel input[data-lv-ml-habit="h1"]').click(); await pg.waitForTimeout(200);
  await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(700);
  await go(pg, '#today', 700);
  assert.equal(await pg.locator('#td-my-routine-h1').isChecked(), false, 'undone in My Life, reload, Today agrees');
  assert.equal(await pg.locator('#td-my-todo-t1').isChecked(), true);
  await pg.locator('#td-my-todo-t1').uncheck(); await pg.waitForTimeout(150);
  assert.match(await status(pg), /‘보고서 제출’ 할 일의 완료를 취소했어요\./);
  assert.equal((await mystore(pg)).todos.find(t => t.id === 't1').done, false);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('TV2-33 / TV2-34 / TV2-23 no request, no URL change carrying a title, no new storage key from Today', { skip }, async () => {
  const rec = [];
  const pg = await open('#today', { record: rec });
  const keys0 = await pg.evaluate(() => Object.keys(localStorage).sort());
  const n0 = rec.length, url0 = await pg.evaluate(() => location.href);
  await pg.locator('#td-my-todo-t1').check(); await pg.locator('#td-my-routine-h1').check(); await pg.waitForTimeout(200);
  assert.deepEqual(rec.slice(n0).filter(u => !/^GET .*\.(jpg|jpeg|png|webp|svg|woff2?)$/.test(u)), [], 'checking makes no request (lazy images of the feed below may load)');
  assert.deepEqual(rec.slice(n0).filter(u => !/^GET /.test(u) || /\/api\//.test(u)), [], 'no write request and no API call after the changes');
  assert.deepEqual(rec.filter(u => !/^GET /.test(u)), [], 'no write request at all (the only API call is the existing public data status GET)');
  assert.equal(await pg.evaluate(() => location.href), url0);
  const keys1 = await pg.evaluate(() => Object.keys(localStorage).sort());
  assert.deepEqual(keys1.filter(k => !keys0.includes(k)).filter(k => k !== 'livon.userData.meta.v1'), []);
  assert.ok(rec.every(u => !/보고서|산책|회의/.test(decodeURIComponent(u))));
  for (const secret of ['보고서 제출', '아침 산책']) assert.equal(pg._console.join('\n').includes(secret), false);
  await pg.context().close();
});

test('TV2-30 Community and the public search show none of the Today records', { skip }, async () => {
  const pg = await open('#today');
  await go(pg, '#community', 900);
  assert.equal(/보고서 제출|어머니 생신|아침 산책/.test(await pg.evaluate(() => document.querySelector('#community').innerText)), false);
  await go(pg, '#ex-results?q=' + encodeURIComponent('보고서 제출'), 900);
  const ex = await pg.evaluate(() => document.querySelector('#explore').innerText);
  assert.equal(ex.split('\n').filter(l => l.includes('보고서 제출') && !/검색 결과/.test(l)).length, 0);
  await pg.context().close();
});

test('TV2-52 titles are escaped: markup in a record title is shown as text', { skip }, async () => {
  const s = liveStore(); s.todos[0].title = '<img src=x onerror="window.__x=1">'; s.habits[0].title = '"><b>루틴</b>';
  const pg = await open('#today', { store: s });
  assert.equal(await pg.evaluate(() => window.__x), undefined);
  assert.equal(await pg.locator('[data-td-my] img, [data-td-my] b').count(), 0);
  assert.match(await pg.locator('[data-td-my]').innerText(), /<img src=x/);
  await pg.context().close();
});

test('TV2-53 the routine week count in My Life no longer shows 0/7 for a routine made today', { skip }, async () => {
  const s = liveStore(); s.habits = [{ id: 'hn', title: '새 루틴', freq: 'daily', createdAt: Date.now() }];
  const pg = await open('#ml-routines', { store: s });
  const left = 7 - new Date().getDay();
  assert.match(await pg.locator('#ml-panel').innerText(), new RegExp('이번 주 0/' + left));
  await pg.context().close();
});

test('TV2-44 … TV2-48 / TV2-43 320 / 390 / 768 / 1024 / 1440 and 200% text: no overflow, no clipped text, 44px targets', { skip }, async () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    const pg = await open('#today', { width, height: 860 });
    for (const store of ['full']) {
      const r = await pg.evaluate(() => {
        const sec = document.querySelector('#td-mytoday'); sec.scrollIntoView();
        const wide = [...sec.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.right > innerWidth + 1; }).map(e => e.className).slice(0, 3);
        const small = [...sec.querySelectorAll('a, button, label')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.height && b.height < 31.5; }).map(e => e.tagName + ' ' + e.textContent.trim().slice(0, 16) + ' ' + Math.round(e.getBoundingClientRect().height));
        const rows = [...sec.querySelectorAll('.lv-td-my__item')].filter(e => e.getBoundingClientRect().height < 43.5).length;
        return { ov: document.documentElement.scrollWidth - innerWidth, wide, small, rows };
      });
      assert.ok(r.ov <= 0, width + ' overflow ' + r.ov); assert.deepEqual(r.wide, [], width + ' ' + store); assert.deepEqual(r.small, [], width); assert.equal(r.rows, 0, width + ' rows ≥ 44px');
    }
    if (width === 390) {
      await pg.addStyleTag({ content: 'html{font-size:200% !important}' }); await pg.waitForTimeout(200);
      const z = await pg.evaluate(() => { const out = []; document.querySelectorAll('#td-mytoday *').forEach(e => { const cs = getComputedStyle(e); if (![...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim())) return; if ((cs.overflowX === 'hidden' || cs.overflow === 'hidden') && e.scrollWidth > e.clientWidth + 2) out.push(e.className); }); return { ov: document.documentElement.scrollWidth - innerWidth, clipped: out }; });
      assert.ok(z.ov <= 1, '200% overflow ' + z.ov); assert.deepEqual(z.clipped, []);
    }
    assert.deepEqual(pg._errors, [], String(width));
    await pg.context().close();
  }
});

test('TV2-54 the rest of Today and LIVON still render; My Life V2 deep links unchanged', { skip }, async () => {
  const pg = await open('#today');
  assert.ok(await pg.locator('[data-td-feed] .td-block, [data-td-feed] .lv-td-grid').count() > 0, 'discovery feed still renders');
  for (const h of ['#ml-home', '#ml-routines', '#ml-records', '#ml-settings', '#life', '#explore', '#community', '#help', '#ai-chat', '#today']) {
    await go(pg, h, 500);
    assert.ok((await pg.evaluate(() => document.querySelector('main').innerText.length)) > 200, h);
  }
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('TV2-55 a new day while the page stays open: returning to the tab shows the new day', { skip }, async () => {
  const pg = await open('#today');
  await pg.evaluate(() => { const RealDate = Date, shift = 864e5; window.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(RealDate.now() + shift); } static now() { return RealDate.now() + shift; } }; window.dispatchEvent(new Event('focus')); });
  await pg.waitForTimeout(200);
  const tomorrow = new Date(Date.now() + 864e5);
  assert.ok((await pg.locator('[data-td-my-date]').innerText()).includes((tomorrow.getMonth() + 1) + '월 ' + tomorrow.getDate() + '일'));
  assert.match(await pg.locator('.lv-td-my__sum').innerText(), /오늘 마감인 할 일 없음/, "yesterday's task is now overdue, not today's");
  await pg.context().close();
});

test('TV2-56 Escape and focus: Today has no dialog of its own; My Life dialogs opened from its links still close with Escape', { skip }, async () => {
  const pg = await open('#today');
  assert.equal(await pg.locator('#td-mytoday [role=dialog], #td-mytoday dialog').count(), 0);
  await pg.locator('#td-mytoday a[href="#ml-routines"]').first().click(); await pg.waitForTimeout(700);
  await pg.locator('[data-lv-ml-panel-actions] [data-lv-ml-add="habit"]').click();
  assert.equal(await pg.locator('#lv-ml-form-modal').isVisible(), true);
  await pg.keyboard.press('Escape');
  assert.equal(await pg.locator('#lv-ml-form-modal').isVisible(), false);
  assert.equal(await pg.evaluate(() => document.activeElement.getAttribute('data-lv-ml-add')), 'habit');
  await pg.context().close();
});
