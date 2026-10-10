// LIVON My Life V2 — Personal Life Hub (ML2-01 … ML2-47). Data-layer tests run everywhere (node:vm); the browser tests run
// with a local Chromium (PLAYWRIGHT_MODULE / CHROME_PATH) and are skipped without one.
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
const LIFE = JSON.parse(read('life-topics.json'));
const ML = 'livon.mlStore.v1';
const J = x => JSON.parse(JSON.stringify(x));
const PAGE = read('life-now-page.js');
const HUB = read('life-now-hub.js');
const BOTH = PAGE + '\n' + HUB;
const INDEX = read('index.html');
const FILES = ['data/livon-user-data.js', 'explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js', 'today-feed.js', 'explore-search.js', 'life-now-data.js', 'life-now-hub.js', 'life-now-page.js'];

/* the same harness as tests/livon/mylife.test.mjs: real LIVON scripts, an in-memory storage, LivonPlatform saves */
function app({ store, raw, local = {}, logs = null } = {}) {
  const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m }; };
  const saves = new Map();
  const quiet = logs ? { log: (...a) => logs.push(a), info: (...a) => logs.push(a), warn: (...a) => logs.push(a), error: (...a) => logs.push(a), debug: (...a) => logs.push(a) } : console;
  const ctx = {
    window: {}, localStorage: mem(), sessionStorage: mem(), location: { hash: '#ml-home' }, navigator: {}, URL, history: { state: null, replaceState() {}, pushState() {} },
    document: { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null }, contains: () => false },
    fetch: () => { throw new Error('no network from My Life'); }, setTimeout, console: quiet, addEventListener() {},
  };
  ctx.window = ctx;
  ctx.LivonPlatform = {
    listSaves: () => [...saves.values()],
    saveItem: x => saves.set(x.id, Object.assign({ savedAt: Date.now() }, x)),
    removeSave: id => saves.delete(id),
    folders: () => ['나중에 보기'],
  };
  if (raw != null) ctx.localStorage.setItem(ML, raw);
  if (store) ctx.localStorage.setItem(ML, JSON.stringify(store));
  for (const [k, v] of Object.entries(local)) ctx.localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
  vm.createContext(ctx);
  for (const f of FILES) vm.runInContext(read(f), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  const rawStore = () => JSON.parse(ctx.localStorage.getItem(ML) || 'null');
  return { ctx, T: ctx.LivonMyLife._test, saves, raw: rawStore, ls: ctx.localStorage };
}
/* a second page load on the same storage (reload) */
function reload(a) { const keep = new Map(a.ls._m); const b = app(); for (const [k, v] of keep) b.ls.setItem(k, v); return b; }
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const day = (n, base = new Date()) => { const d = new Date(base.getFullYear(), base.getMonth(), base.getDate()); d.setDate(d.getDate() + n); return d; };
const today = () => ymd(new Date());
const shift = n => ymd(day(n));

/* ═════════ data layer ═════════ */
test('ML2-04 calendar CRUD: create, edit (date move), delete; the day view reads the same store', () => {
  const { T, raw } = app();
  const a = T.saveEvent({ title: '치과 예약', date: today(), start: '15:00', end: '16:00', note: '정기 검진' });
  assert.equal(a.status, 'ok');
  const b = T.saveEvent({ title: '가족 저녁', date: today(), allDay: true });
  assert.equal(raw().events.length, 2);
  const d = T.dayItems(T.loadStore(), today());
  assert.deepEqual(J(d.events.map(e => e.title)), ['가족 저녁', '치과 예약'], 'all-day first, then by start time');
  const moved = T.saveEvent({ id: a.item.id, title: '치과 예약', date: shift(2), start: '10:00', end: '10:30' });
  assert.equal(moved.created, false);
  assert.equal(T.dayItems(T.loadStore(), today()).events.length, 1);
  assert.equal(T.dayItems(T.loadStore(), shift(2)).events[0].start, '10:00');
  assert.equal(T.saveEvent({ title: '', date: today() }).status, 'invalid');
  assert.equal(T.saveEvent({ title: 'x', date: today(), start: '11:00', end: '10:00' }).status, 'invalid');
  assert.equal(T.removeItem('event', b.item.id), true);
  assert.deepEqual(J(raw().events.map(e => e.title)), ['치과 예약']);
});

test('ML2-06 task CRUD: create, edit, complete, undo, delete — fields due/priority/category/memo', () => {
  const { T, raw } = app();
  const a = T.saveTodo({ title: '보험료 확인', due: today(), priority: '높음', category: '가정', note: '자동이체 날짜' });
  assert.equal(a.status, 'ok');
  assert.deepEqual(J((({ title, due, priority, category, note, done }) => ({ title, due, priority, category, note, done }))(raw().todos[0])),
    { title: '보험료 확인', due: today(), priority: '높음', category: '가정', note: '자동이체 날짜', done: false });
  T.saveTodo({ id: a.item.id, title: '보험료 확인하기', due: shift(1), priority: '낮음', category: '가정', note: '' });
  assert.equal(raw().todos[0].title, '보험료 확인하기');
  T.setTodoDone(a.item.id, true);
  assert.equal(raw().todos[0].done, true); assert.equal(typeof raw().todos[0].doneAt, 'number');
  T.setTodoDone(a.item.id, false);
  assert.equal(raw().todos[0].done, false); assert.equal('doneAt' in raw().todos[0], false);
  assert.equal(T.removeItem('todo', a.item.id), true); assert.equal(raw().todos.length, 0);
});

test('ML2-07 task filters 전체/오늘/예정/완료 and sorts 마감/생성/우선순위', () => {
  const { T } = app();
  const mk = (title, due, priority, createdAt) => { const r = T.saveTodo({ title, due, priority }); const s = T.loadStore(); s.todos.find(t => t.id === r.item.id).createdAt = createdAt; return r.item.id; };
  mk('A 내일 낮음', shift(1), '낮음', 1);
  mk('B 날짜 없음 높음', '', '높음', 3);
  const c = mk('C 오늘 보통', today(), '보통', 2);
  /* createdAt was changed on a loaded copy only; write it through the store API */
  const s = T.loadStore(); s.todos.forEach((t, i) => { t.createdAt = { 'A 내일 낮음': 1, 'B 날짜 없음 높음': 3, 'C 오늘 보통': 2 }[t.title]; });
  const list = () => J(s.todos);
  T.setTodoDone(c, false);
  const titles = sort => T.sortTodos(list(), sort).map(t => t.title[0]).join('');
  assert.equal(titles('due'), 'CAB', '마감일순: earliest deadline first, no date last');
  assert.equal(titles('created'), 'BCA', '최근 만든 순');
  assert.equal(titles('priority'), 'BCA', '우선순위순: 높음 → 보통 → 낮음');
  const done = list(); done[0].done = true; const doneTitle = done[0].title;
  assert.equal(T.sortTodos(done, 'priority').at(-1).title, doneTitle, 'completed tasks always after open ones');
  const t0 = today();
  const buckets = list().map(t => T.todoBucket(t, t0));
  assert.deepEqual(buckets.sort(), ['today', 'upcoming', 'upcoming']);
  /* the URL keeps the sort; unknown values fall back */
  T.applyParams('todos', { sort: 'priority', filter: 'done' });
  assert.equal(T.viewHash('todos'), '#ml-todos?filter=done&sort=priority');
  T.applyParams('todos', { sort: 'nope' });
  assert.equal(T.state.todoSort, 'due'); assert.equal(T.viewHash('todos'), '#ml-todos');
  assert.match(T.views.todos(T.loadStore()), /data-lv-ml-todo-sort/);
});

test('ML2-08 goals: CRUD, complete / reopen, progress only from linked tasks', () => {
  const { T, raw } = app();
  const g = T.saveGoal({ title: '독립 준비', due: shift(30) }).item;
  assert.equal(T.goalProgress(T.loadStore(), g), null, 'no linked task → no progress number');
  const a = T.saveTodo({ title: '예산 정하기', goalId: g.id }).item;
  T.saveTodo({ title: '집 보러 가기', goalId: g.id });
  T.setTodoDone(a.id, true);
  assert.deepEqual(J(T.goalProgress(T.loadStore(), g)), { done: 1, total: 2, pct: 50 });
  const done = T.saveGoal(Object.assign({}, raw().goals[0], { status: '완료' }));
  assert.equal(done.item.status, '완료'); assert.equal(typeof done.item.doneAt, 'number');
  const again = T.saveGoal(Object.assign({}, raw().goals[0], { status: '완료', note: '수정' }));
  assert.equal(again.item.doneAt, done.item.doneAt, 'editing a completed goal keeps its completion time');
  const reopened = T.saveGoal(Object.assign({}, raw().goals[0], { status: '진행 중' }));
  assert.equal('doneAt' in reopened.item, false);
  assert.match(T.views.goals(T.loadStore()), /data-lv-ml-goal-done=/);
  assert.equal(T.removeItem('goal', g.id), true);
  assert.equal(raw().todos.length, 2, 'deleting a goal keeps its tasks');
  assert.ok(raw().todos.every(t => !t.goalId));
});

test('ML2-09 routines: weekday setting, scheduled days, validation', () => {
  const { T, raw } = app();
  assert.equal(T.saveHabit({ title: '' }).status, 'invalid');
  assert.equal(T.saveHabit({ title: '수영', freq: 'days', days: [] }).field, 'days');
  const h = T.saveHabit({ title: '수영', freq: 'days', days: [1, 3, 5, 3, 9] }).item;
  assert.deepEqual(J(h.days), [1, 3, 5], 'unique valid weekdays only');
  const mon = new Date(2026, 9, 5), tue = new Date(2026, 9, 6); // 2026-10-05 is a Monday
  assert.equal(mon.getDay(), 1);
  assert.equal(T.habitScheduledOn(h, mon), true); assert.equal(T.habitScheduledOn(h, tue), false);
  const all = T.saveHabit({ title: '물 마시기', freq: 'days', days: [0, 1, 2, 3, 4, 5, 6] }).item;
  assert.equal(all.freq, 'daily'); assert.equal('days' in all, false);
  const daily = T.saveHabit({ title: '산책' }).item;
  assert.equal(T.habitScheduledOn(daily, tue), true);
  const edited = T.saveHabit({ id: h.id, title: '수영', freq: 'daily' }).item;
  assert.equal(edited.id, h.id); assert.equal('days' in edited, false);
  assert.equal(raw().habits.length, 3);
});

test('ML2-10 routine streak comes only from the real log: unscheduled days skipped, today open does not break it', () => {
  const { T } = app();
  const now = new Date(2026, 9, 9, 20, 0); // Friday
  const h = { id: 'h1', title: '수영', freq: 'days', days: [1, 3, 5], createdAt: new Date(2026, 8, 1).getTime() };
  const logs = { h1: { '2026-10-05': true, '2026-10-07': true } }; // Mon, Wed — today (Fri) not yet
  assert.deepEqual(J(T.habitStreak(h, logs, now)), { count: 2, unit: '일' });
  logs.h1['2026-10-09'] = true;
  assert.equal(T.habitStreak(h, logs, now).count, 3);
  delete logs.h1['2026-10-07'];
  assert.equal(T.habitStreak(h, logs, now).count, 1, 'a missed scheduled day ends the streak');
  assert.equal(T.habitStreak(h, {}, now).count, 0, 'no history → 0, never a made-up number');
  const young = { id: 'h2', title: '독서', freq: 'daily', createdAt: new Date(2026, 9, 8).getTime() };
  assert.equal(T.habitStreak(young, { h2: { '2026-10-08': true, '2026-10-09': true, '2026-10-01': true } }, now).count, 2, 'days before the routine existed do not count');
  const weekly = { id: 'h3', title: '대청소', freq: 'weekly', createdAt: new Date(2026, 8, 1).getTime() };
  assert.deepEqual(J(T.habitStreak(weekly, { h3: { '2026-09-30': true, '2026-09-23': true } }, now)), { count: 2, unit: '주' });
  const w = T.habitWeek(h, { h1: { '2026-10-05': true, '2026-10-06': true } }, T.startOfWeek(now, 0));
  assert.deepEqual(J(w), { done: 1, planned: 3 }, 'a check on an unscheduled day is not counted');
});

test('ML2-11 routine today complete / undo persists across reload', () => {
  const a = app();
  const h = a.T.saveHabit({ title: '스트레칭' }).item;
  assert.equal(a.T.setHabitDone(h.id, today(), true), true);
  const b = reload(a);
  assert.equal(b.raw().habitLogs[h.id][today()], true);
  b.T.setHabitDone(h.id, today(), false);
  assert.equal(reload(b).raw().habitLogs[h.id][today()], undefined);
  assert.equal(a.T.setHabitDone('nope', today(), true), false, 'unknown routine → nothing written');
  assert.match(b.T.views.routines(b.T.loadStore()), /data-lv-ml-habit="/);
});

test('ML2-12 records hub: existing types only, type / range / text filter, newest first, render limit', () => {
  const { T } = app();
  T.saveJournal({ title: '첫 출근', date: shift(-1), body: '긴장했지만 괜찮았다', category: '커리어' });
  T.saveTx({ kind: 'expense', amount: 12000, date: today(), category: '식비', note: '점심' });
  const s = T.loadStore();
  s.health.push({ id: 'hl1', kind: '수면', date: shift(-10), value: '7시간' });
  s.experiences.push({ id: 'ex1', title: '도자기 클래스', status: '경험 완료', date: shift(-3) });
  const all = T.recordsList(s, {});
  assert.deepEqual(J(all.map(r => r.type)), ['tx', 'journal', 'experience', 'health'], 'newest first');
  assert.deepEqual(J(T.recordsList(s, { type: 'journal' }).map(r => r.title)), ['첫 출근']);
  assert.equal(T.recordsList(s, { range: '7d' }).length, 3);
  assert.deepEqual(J(T.recordsList(s, { q: '점심' }).map(r => r.type)), ['tx']);
  for (let i = 0; i < 45; i++) s.journal.push({ id: 'j' + i, title: '기록 ' + i, date: shift(-20), body: 'x' });
  T.applyParams('records', {});
  const html = T.views.records(s);
  assert.equal((html.match(/data-lv-ml-edit="/g) || []).length, 30, 'renders 30 at a time');
  assert.match(html, /data-lv-ml-record-more/);
  T.applyParams('records', { type: 'health', range: '7d' });
  assert.equal(T.viewHash('records'), '#ml-records?type=health&range=7d');
});

test('ML2-13 journal: CRUD, always private, never read by Community or sent to LIVON AI', () => {
  const { T, raw } = app();
  const j = T.saveJournal({ title: '일기', date: today(), body: '비밀 내용 XJ' }).item;
  assert.equal(j.private, true);
  T.saveJournal({ id: j.id, title: '일기 2', date: today(), body: '고친 내용' });
  assert.equal(raw().journal[0].title, '일기 2');
  assert.equal(T.saveJournal({ title: 'x', date: today(), body: '' }).status, 'invalid');
  assert.equal(T.removeItem('journal', j.id), true);
  const ai = read('ai-page.js');
  const scoped = ai.slice(ai.indexOf('function scopedPersonalData('), ai.indexOf('function scopedPersonalData(') + 2600);
  assert.doesNotMatch(scoped, /\.journal|\.health|\.transactions|\.budgets/, 'AI context never reads journal/health/money');
  assert.doesNotMatch(read('community-page.js') + read('community-service.js'), /\.journal\b/);
});

test('ML2-14 expenses: amount/category/date/memo, monthly totals by category', () => {
  const { T } = app();
  assert.equal(T.saveTx({ amount: '', date: today() }).status, 'invalid');
  assert.equal(T.saveTx({ amount: -5, date: today() }).status, 'invalid');
  assert.equal(T.saveTx({ amount: 1000, date: 'x' }).status, 'invalid');
  T.saveTx({ kind: 'expense', amount: 12000, date: '2026-10-02', category: '식비', note: '점심' });
  T.saveTx({ kind: 'expense', amount: 8000, date: '2026-10-15', category: '식비' });
  T.saveTx({ kind: 'expense', amount: 1250, date: '2026-10-03', category: '교통' });
  T.saveTx({ kind: 'income', amount: 300000, date: '2026-10-25', category: '급여' });
  T.saveTx({ kind: 'expense', amount: 99999, date: '2026-09-30', category: '쇼핑' });
  const m = T.moneySummary(T.loadStore(), '2026-10');
  assert.deepEqual(J({ income: m.income, expense: m.expense, byCat: m.byCat, count: m.count }), { income: 300000, expense: 21250, byCat: { 식비: 20000, 교통: 1250 }, count: 4 });
});

test('ML2-15 budget: spent and remaining from real numbers, no budget → no number, calm wording', () => {
  const { T } = app();
  T.saveTx({ amount: 150000, date: '2026-10-02', category: '식비' });
  const s = T.loadStore();
  assert.equal(T.moneySummary(s, '2026-10').remain, null); assert.equal(T.moneySummary(s, '2026-10').usedPct, null);
  s.budgets.monthly = 100000;
  const m = T.moneySummary(s, '2026-10');
  assert.equal(m.remain, -50000); assert.equal(m.usedPct, 150);
  const money = HUB.slice(HUB.indexOf('function viewMoney('), HUB.indexOf('function weeklyReviewHtml('));
  assert.doesNotMatch(money, /경고|위험|파산|큰일/, 'over budget is stated plainly');
  assert.match(money, /예산보다 " \+ fmtMoney\(-m\.remain\) \+ " 더 썼어요/);
});

test('ML2-16 health records: no diagnosis or prediction wording, not part of the AI context', () => {
  const health = PAGE.slice(PAGE.indexOf('function viewHealth('), PAGE.indexOf('function viewSaved('));
  assert.match(health, /의료 진단·예측을 제공하지 않습니다/);
  assert.doesNotMatch(health, /위험도|예측합니다|진단 결과|건강 점수/);
  const { T } = app();
  const s = T.loadStore(); s.health.push({ id: 'hh', kind: '수면', date: today(), value: '5시간' });
  assert.doesNotMatch(T.views.records(s), /점수|위험/);
});

test('ML2-17 Saved integration: one shared store (LivonPlatform), nothing copied into My Life, not exported', () => {
  const { T, ctx, saves, raw } = app();
  ctx.LivonLifeHub._test.doSave({ type: 'topic', id: '20s.first-customers', title: '초기 고객 찾기', href: '#life/20s/first-customers', lifeStage: '20' });
  assert.equal(saves.size, 1);
  assert.equal(T.collectedSaved().length, 1);
  T.saveTodo({ title: 'x' });
  assert.equal(JSON.stringify(raw()).includes('초기 고객 찾기'), false, 'the save is not duplicated into livon.mlStore.v1');
  assert.equal(JSON.stringify(T.exportPayload(T.loadStore())).includes('초기 고객 찾기'), false);
});

test('ML2-18 upcoming 7 days: dated schedule, open task deadlines and goal target dates only', () => {
  const { T } = app();
  const now = new Date(2026, 9, 4, 9, 0);
  const d = n => ymd(day(n, now));
  const s = T.loadStore();
  s.events.push({ id: 'e0', title: '오늘 일정', date: d(0) }, { id: 'e1', title: '내일 일정', date: d(1), start: '09:00' }, { id: 'e8', title: '8일 뒤', date: d(8) }, { id: 'ed', title: '끝난 일정', date: d(2), done: true });
  s.todos.push({ id: 't3', title: '마감 3일', due: d(3) }, { id: 'td', title: '완료한 일', due: d(3), done: true }, { id: 'tn', title: '날짜 없음', due: '' });
  s.goals.push({ id: 'g7', title: '목표 7일', due: d(7), status: '진행 중' }, { id: 'gh', title: '보류 목표', due: d(5), status: '보류' });
  s.journal.push({ id: 'j', title: '기록은 제외', date: d(2), body: 'x' });
  const list = T.upcomingItems(s, now, 7);
  assert.deepEqual(J(list.map(x => x.kind + ':' + x.item.title)), ['event:내일 일정', 'todo:마감 3일', 'goal:목표 7일']);
});

test('ML2-19 weekly review: counts of what really happened that week, no score', () => {
  const { T } = app();
  const now = new Date(2026, 9, 7, 12, 0); // Wed; week (Sun start) = 10-04 … 10-10
  const s = T.loadStore();
  const at = (y, m, dd) => new Date(y, m, dd, 10).getTime();
  s.events.push({ id: 'e', title: 'a', date: '2026-10-05' }, { id: 'e2', title: 'b', date: '2026-10-11' });
  s.todos.push({ id: 't1', title: 'done', done: true, doneAt: at(2026, 9, 6), createdAt: at(2026, 9, 1), due: '2026-10-06' }, { id: 't2', title: 'open', due: '2026-10-09', createdAt: at(2026, 9, 5) }, { id: 't3', title: 'old', done: true, doneAt: at(2026, 8, 20), createdAt: at(2026, 8, 1) });
  s.goals.push({ id: 'g', title: 'g', status: '완료', doneAt: at(2026, 9, 8) });
  s.habits.push({ id: 'h', title: '산책', freq: 'daily', createdAt: at(2026, 8, 1) });
  s.habitLogs.h = { '2026-10-04': true, '2026-10-06': true };
  s.journal.push({ id: 'j', title: 'j', date: '2026-10-07', body: 'x' });
  s.transactions.push({ id: 'x', kind: 'expense', amount: 5000, date: '2026-10-07' }, { id: 'y', kind: 'expense', amount: 7000, date: '2026-10-12' });
  const w = T.weeklyReview(s, now, 0);
  assert.deepEqual(J(w), { from: '2026-10-04', to: '2026-10-10', events: 1, todosDone: 1, todosDue: 2, todosDueOpen: 1, todosAdded: 1, goalsDone: 1, habitDone: 2, habitPlanned: 7, journal: 1, health: 0, expense: 5000, income: 0 });
  const prev = T.weeklyReview(s, now, -1);
  assert.equal(prev.from, '2026-09-27'); assert.equal(prev.todosDone, 0);
  const report = PAGE.slice(PAGE.indexOf('function viewReport('), PAGE.indexOf('function viewSettings(')) + HUB.slice(HUB.indexOf('function weeklyReviewHtml('));
  assert.doesNotMatch(report, /<p>[^<]*(점수|등급|score)/i, 'no score tile');
  assert.match(report, /점수나 평가는 매기지 않아요/);
});

test('ML2-20 private My Life search: every area, case and spacing insensitive, limit; empty query finds nothing', () => {
  const { T } = app();
  T.saveTodo({ title: '병원 서류 챙기기' });
  T.saveEvent({ title: '정형외과', date: today(), place: '동네 병원' });
  T.saveJournal({ title: '오늘', date: today(), body: '병원 다녀옴' });
  T.saveHabit({ title: 'Morning Run' });
  T.saveTx({ amount: 3000, date: today(), note: '병원 주차' });
  const r = T.searchMyLife(T.loadStore(), '  병원 ');
  assert.equal(r.total, 4);
  assert.deepEqual(J(r.items.map(x => x.area).sort()), ['events', 'journal', 'todos', 'transactions']);
  assert.equal(T.searchMyLife(T.loadStore(), 'morning run').total, 1);
  assert.equal(T.searchMyLife(T.loadStore(), '   ').total, 0);
  const s = T.loadStore(); for (let i = 0; i < 80; i++) s.todos.push({ id: 'z' + i, title: '병원 ' + i });
  const big = T.searchMyLife(s, '병원', 50);
  assert.equal(big.items.length, 50); assert.equal(big.total, 84);
});

test('ML2-21 export: version, exportedAt, exactly the My Life collections, nothing from other stores', () => {
  const { T } = app({ local: { 'livon.cmStore.v1': { posts: [{ id: 'p', title: 'COMMUNITY-POST' }] }, 'livon.aiStore.v1': { threads: [{ id: 'a', title: 'AI-THREAD' }] } } });
  T.saveTodo({ title: '할 일 하나' });
  T.saveHabit({ title: '루틴' });
  const p = T.exportPayload(T.loadStore(), Date.UTC(2026, 9, 4, 1, 2, 3));
  assert.equal(p.app, 'LIVON'); assert.equal(p.kind, 'my-life-export'); assert.equal(p.version, 1); assert.equal(p.storeVersion, 2);
  assert.equal(p.exportedAt, '2026-10-04T01:02:03.000Z');
  assert.deepEqual(Object.keys(p.collections), J(T.ML_COLLECTIONS));
  assert.deepEqual(J(T.ML_COLLECTIONS).sort(), ['budgets', 'checklists', 'events', 'experiences', 'goals', 'habitLogs', 'habits', 'health', 'journal', 'projects', 'todos', 'transactions']);
  const text = JSON.stringify(p);
  for (const bad of ['COMMUNITY-POST', 'AI-THREAD', 'saves', 'settings', 'savedCommunity']) assert.equal(text.includes(bad), false, bad);
  assert.equal(p.collections.todos[0].title, '할 일 하나');
  const dl = HUB.slice(HUB.indexOf('function downloadExport('), HUB.indexOf('function viewMoney('));
  assert.match(dl, /URL\.createObjectURL\(blob\)/); assert.match(dl, /a\.download = "livon-my-life-"/); assert.match(dl, /revokeObjectURL/);
  assert.doesNotMatch(dl, /fetch|XMLHttpRequest|sendBeacon|navigator\.share/);
});

test('ML2-24 delete-all clears My Life collections only and keeps settings and every other store', () => {
  const others = {
    'livon.cmStore.v1': { v: 2, posts: [{ id: 'p1', title: '내 글' }] }, 'livon.personalization.v1': { version: 1, state: 'DONE' }, 'livon.lifeInterests': ['캠핑'],
    'livon.aiStore.v1': { threads: [{ id: 't' }], settings: { shareMyLife: false } }, 'livon.today.recent.v1': [{ key: 'x', at: 1 }], 'livon.platform.v1': { saves: [{ id: 's1' }] },
    'ongil.state.v1': { keep: true }, 'newon.plus.session': 'keep'
  };
  const a = app({ local: others });
  const s = a.T.loadStore(); s.settings.weekStartsOn = 1; s.savedCommunity = ['legacy']; a.ctx.localStorage.setItem(ML, JSON.stringify(s));
  a.T.saveTodo({ title: '지울 할 일' }); a.T.saveJournal({ title: 'j', date: today(), body: 'b' }); a.T.saveHabit({ title: 'h' });
  const h = a.T.loadStore().habits[0]; a.T.setHabitDone(h.id, today(), true);
  a.T.saveTx({ amount: 1, date: today() });
  const before = {}; for (const k of Object.keys(others)) before[k] = a.ls.getItem(k);
  assert.equal(a.T.clearMyLifeData(), true);
  const r = a.raw();
  for (const k of a.T.ML_COLLECTIONS) {
    if (k === 'habitLogs') assert.deepEqual(r[k], {}); else if (k === 'budgets') assert.deepEqual(r[k], { monthly: 0, categories: {} }); else assert.deepEqual(r[k], [], k);
  }
  assert.equal(r.settings.weekStartsOn, 1, 'store settings stay'); assert.deepEqual(r.savedCommunity, ['legacy'], 'legacy key stays');
  for (const k of Object.keys(others)) assert.equal(a.ls.getItem(k), before[k], k + ' untouched');
  assert.deepEqual(J(a.T.exportCounts(a.T.loadStore())), Object.fromEntries(a.T.ML_COLLECTIONS.map(k => [k, 0])));
});

test('ML2-25 delete-all keeps Saved items (shared LivonPlatform store)', () => {
  const { T, ctx, saves } = app();
  ctx.LivonLifeHub._test.doSave({ type: 'topic', id: '20s.first-customers', title: '초기 고객 찾기', href: '#life/20s/first-customers', lifeStage: '20' });
  T.saveTodo({ title: 'x' });
  T.clearMyLifeData();
  assert.equal(saves.size, 1); assert.equal(T.collectedSaved().length, 1);
});

test('ML2-26 delete-all keeps Community data; the clear code only writes livon.mlStore.v1', () => {
  const cm = JSON.stringify({ v: 2, posts: [{ id: 'p1', title: 'post' }], comments: [{ id: 'c1' }] });
  const { T, ls } = app({ local: { 'livon.cmStore.v1': cm } });
  T.saveTodo({ title: 'x' }); T.clearMyLifeData();
  assert.equal(ls.getItem('livon.cmStore.v1'), cm);
  const fn = HUB.slice(HUB.indexOf('function clearMyLifeData('), HUB.indexOf('function habitRowHtml('));
  assert.doesNotMatch(fn, /removeItem\(|localStorage|writeJSON\(/, 'writes only through saveStore');
  assert.match(fn, /saveStore\(store\)/);
});

test('ML2-27 malformed storage never crashes: broken JSON, wrong shapes and junk entries', () => {
  for (const raw of ['{not json', '"text"', '[1,2]', 'null', '42']) {
    const { T } = app({ raw });
    const s = T.loadStore();
    assert.ok(Array.isArray(s.todos) && Array.isArray(s.events), raw);
    for (const v of Object.values(T.views)) assert.equal(typeof v(s), 'string');
  }
  const { T, raw } = app({ store: { v: 2, todos: [null, 'x', 5, { title: '진짜 할 일', id: 't1' }], events: 'nope', habitLogs: [], budgets: 7, habits: [{ title: 'id 없는 루틴' }], journal: [{ id: 'j', body: 'b' }] } });
  const s = T.loadStore();
  assert.deepEqual(J(s.todos.map(t => t.title)), ['진짜 할 일']);
  assert.deepEqual(J(s.events), []); assert.deepEqual(J(s.habitLogs), {}); assert.equal(J(s.budgets).monthly, 0);
  assert.equal(typeof s.habits[0].id, 'string');
  assert.equal(raw().todos.length, 1, 'the repaired store is written back');
  for (const v of Object.values(T.views)) assert.equal(typeof v(s), 'string');
  assert.equal(T.searchMyLife(s, '진짜').total, 1);
});

test('ML2-28 duplicate ids are repaired without losing a record; new ids are unique', () => {
  const { T, raw } = app({ store: { v: 2, todos: [{ id: 'same', title: 'A' }, { id: 'same', title: 'B' }], events: [{ id: 'e', title: 'x', date: today() }, { id: 'e', title: 'y', date: today() }] } });
  const s = T.loadStore();
  assert.deepEqual(J(s.todos.map(t => t.title)), ['A', 'B']);
  assert.equal(new Set(s.todos.map(t => t.id)).size, 2); assert.equal(s.todos[0].id, 'same', 'the first keeps its id');
  assert.equal(new Set(raw().events.map(e => e.id)).size, 2);
  const ids = new Set(); for (let i = 0; i < 200; i++) ids.add(T.saveTodo({ title: 't' + i }).item.id);
  assert.equal(ids.size, 200);
  T.removeItem('todo', s.todos[1].id);
  assert.deepEqual(J(raw().todos.filter(t => /^[AB]$/.test(t.title)).map(t => t.title)), ['A'], 'delete acts on exactly one record');
});

test('ML2-29 deleted records stay deleted after reload; edits are not resurrected', () => {
  const a = app();
  const t = a.T.saveTodo({ title: '지울 것' }).item; const e = a.T.saveEvent({ title: '지울 일정', date: today() }).item;
  a.T.removeItem('todo', t.id); a.T.removeItem('event', e.id);
  const b = reload(a);
  assert.equal(b.T.loadStore().todos.length, 0); assert.equal(b.T.loadStore().events.length, 0);
  assert.equal(b.T.searchMyLife(b.T.loadStore(), '지울').total, 0);
});

test('ML2-30 reload persistence: task completion, goal status, routine log, budget, filters in the URL', () => {
  const a = app();
  const t = a.T.saveTodo({ title: '완료할 일', due: today() }).item; a.T.setTodoDone(t.id, true);
  const g = a.T.saveGoal({ title: '목표', status: '완료' }).item;
  const s = a.T.loadStore(); s.budgets.monthly = 500000; a.ctx.localStorage.setItem(ML, JSON.stringify(s));
  const b = reload(a);
  const r = b.raw();
  assert.equal(r.todos[0].done, true); assert.equal(r.goals[0].status, '완료'); assert.equal(r.goals[0].doneAt, g.doneAt); assert.equal(r.budgets.monthly, 500000);
  const p = b.T.parseMlHash('#ml-todos?filter=done&sort=created');
  b.T.applyParams('todos', p.params); assert.equal(b.T.viewHash('todos'), '#ml-todos?filter=done&sort=created');
});

test('ML2-31 local dates in any time zone: today, upcoming and weekly windows use the device calendar day', () => {
  const code = `
    const vm = require('node:vm'), fs = require('node:fs'), path = require('node:path');
    const R = ${JSON.stringify(ROOT)};
    const m = new Map(); const ls = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; } };
    const ctx = { localStorage: ls, sessionStorage: ls, location: { hash: '' }, navigator: {}, URL, history: { replaceState() {}, pushState() {} }, setTimeout, console, addEventListener() {},
      document: { readyState: 'complete', documentElement: { dataset: {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, contains: () => false } };
    ctx.window = ctx; vm.createContext(ctx);
    for (const f of ['data/livon-user-data.js', 'life-now-data.js', 'life-now-hub.js', 'life-now-page.js']) vm.runInContext(fs.readFileSync(path.join(R, 'livon', f), 'utf8'), ctx);
    const T = ctx.LivonMyLife._test;
    const late = new Date(2026, 0, 31, 23, 50), early = new Date(2026, 1, 1, 0, 10);
    const s = T.loadStore(); s.events.push({ id: 'a', title: 'feb1', date: '2026-02-01' }, { id: 'b', title: 'feb8', date: '2026-02-08' });
    const w = T.weeklyReview(s, early, 0);
    console.log(JSON.stringify({ late: T.todayStr(late), early: T.todayStr(early), up: T.upcomingItems(s, late, 7).map(x => x.item.title), up2: T.upcomingItems(s, early, 7).map(x => x.item.title), wk: [w.from, w.to, w.events] }));`;
  const want = { late: '2026-01-31', early: '2026-02-01', up: ['feb1'], up2: ['feb8'], wk: ['2026-02-01', '2026-02-07', 1] };
  for (const TZ of ['Asia/Seoul', 'UTC', 'America/Los_Angeles', 'Pacific/Kiritimati', 'Pacific/Pago_Pago']) {
    const r = spawnSync(process.execPath, ['-e', code], { env: { ...process.env, TZ }, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout.trim().split('\n').pop()), want, TZ);
  }
});

test('ML2-32 public LIVON search never contains My Life content', () => {
  const { T, ctx } = app();
  T.saveTodo({ title: 'PRIVATE-TODO-QZ' }); T.saveJournal({ title: 'PRIVATE-DIARY-QZ', date: today(), body: 'PRIVATE-BODY-QZ' });
  T.saveEvent({ title: 'PRIVATE-EVENT-QZ', date: today() });
  const idx = JSON.stringify(ctx.LivonSearch.rebuild());
  assert.equal(/QZ/.test(idx), false);
  assert.equal(JSON.stringify(ctx.LivonSearch.search('PRIVATE')).includes('QZ'), false);
  assert.equal(JSON.stringify(ctx.LivonSearch.suggest('PRIVATE', 20)).includes('QZ'), false);
  assert.doesNotMatch(read('explore-search.js'), /mlStore|LivonMyLife/);
  assert.equal(T.searchMyLife(T.loadStore(), 'QZ').total, 3, 'only the My Life search finds them');
});

test('ML2-33 nothing is logged and nothing leaves the device: no console, no network, no analytics in My Life', () => {
  const code = BOTH.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const bad of [/console\./, /\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /gtag|dataLayer|analytics/i, /navigator\.clipboard/]) assert.doesNotMatch(code, bad, String(bad));
  const logs = [];
  const { T } = app({ logs });
  T.saveTodo({ title: 'LOG-SECRET' }); T.saveJournal({ title: 'LOG-SECRET', date: today(), body: 'LOG-SECRET' }); T.saveTx({ amount: 1, date: today(), note: 'LOG-SECRET' });
  T.searchMyLife(T.loadStore(), 'LOG-SECRET'); T.exportPayload(T.loadStore()); T.clearMyLifeData();
  for (const v of Object.values(T.views)) v(T.loadStore());
  assert.equal(JSON.stringify(logs).includes('LOG-SECRET'), false);
});

test('ML2-34 LIVON AI may use My Life only after opt-in (default OFF); My Life sends nothing by itself', () => {
  const ai = read('ai-page.js');
  assert.match(ai, /shareSaved: false, shareMyLife: false \}/, 'AI settings default: My Life OFF');
  assert.match(ai, /if \(settings\.shareMyLife === true && ASKS_MY_LIFE\.test\(q\)\)/);
  const { T } = app();
  const set = T.views.settings(T.loadStore());
  assert.match(set, /꺼짐 \(기본\)/); assert.match(set, /href="#ai-settings"/);
  const on = app({ local: { 'livon.aiStore.v1': { threads: [], settings: { shareMyLife: true } } } });
  assert.match(on.T.views.settings(on.T.loadStore()), /켜짐 · 내 생활을 묻는 질문에만/);
  assert.doesNotMatch(BOTH, /shareMyLife\s*=(?!=)/, 'My Life never changes the AI permission');
});

test('ML2-35 route state: new views round-trip; unknown views fall back; the search view keeps its query out of the URL', () => {
  const { T } = app();
  assert.equal(T.parseMlHash('#ml-routines').view, 'routines');
  assert.equal(T.viewHash('routines'), '#ml-routines'); assert.equal(T.viewHash('records'), '#ml-records');
  T.state.searchQ = '병원'; assert.equal(T.viewHash('search'), '#ml-search');
  T.applyParams('records', { type: 'nope', range: 'nope' }); assert.equal(T.viewHash('records'), '#ml-records');
  for (const v of ['routines', 'records', 'search']) assert.ok(INDEX.includes('data-lv-ml-goto="' + v + '"') || v === 'search', v + ' in the menu');
  const data = read('life-now-data.js');
  assert.match(data, /id: "search"[^}]*hidden: true/);
  assert.match(PAGE, /\.filter\(function \(m\) \{ return !m\.hidden; \}\)/, 'hidden module is not listed as a card');
});

test('ML2-36 cache keys: the files changed for My Life V2 carry ?v=20261004c5 or a later c version (Today V2: page and hub on c6)', () => {
  for (const f of ['life-now-page.js', 'life-now-hub.js', 'life-now-data.js', 'life-now-page.css', 'help-data.js']) assert.match(INDEX, new RegExp('/livon/' + f.replace('.', '\\.') + '\\?v=(20261004c[5-9]|20261007sv\\d|20261010nx\\d)"'), f);   /* Saved V2 moved the page, hub and style sheet to sv1; LIVON Next V1 moved Help to nx2 */
});

test('ML2-37 Help matches the product: export and delete-all are described where the buttons are', () => {
  const ctx = { console }; ctx.window = ctx; vm.createContext(ctx); vm.runInContext(read('help-data.js'), ctx);
  const by = Object.fromEntries(ctx.LivonHelpData.articles.map(a => [a.id, a]));
  const scope = by['my-life-reset-scope'].body.join(' ');
  assert.match(scope, /내 생활 데이터 전체 삭제: 내 생활 › 설정에서/); assert.match(scope, /저장한 항목, 커뮤니티 글, 맞춤 설정, 관심사, LIVON AI 대화는 남아요/);
  /* BEFORE (My Life V2): "아직 옮길 수 없어요 … 다시 불러오는 기능은 아직 없어요". AFTER (LIVON Next V1): the LIVON backup in
     My Life › 설정 (livon/data/livon-data-protect.js) restores on another device; automatic moving still does not exist. */
  assert.match(by['move-device'].short, /백업 파일로 직접 옮길 수 있어요\. 자동으로 옮기는 기능은 아직 없어요/); assert.match(by['move-device'].body[0], /JSON 파일 하나로 내려받아져요/);
  assert.match(by['move-device'].body[1], /기본은 그 기기에 없는 항목만 더하고/);
  assert.equal(by['my-life-reset-scope'].feature[1], '#ml-settings');
  assert.match(HUB, /내 생활 데이터 내보내기 \(JSON\)/); assert.match(HUB, />내 생활 데이터 전체 삭제</);
});

test('ML2-38 empty states: every new block says what is missing and offers the next step', () => {
  const { T } = app();
  const s = T.loadStore();
  assert.match(PAGE, /오늘 예정된 일정이 없어요\./);
  assert.match(T.views.routines(s), /루틴이 없습니다\.[\s\S]*data-lv-ml-add="habit"/);
  assert.match(T.views.records(s), /아직 기록이 없어요\.[\s\S]*data-lv-ml-add="journal"/);
  assert.match(T.views.search(s), /찾을 단어를 입력해 주세요\./);
  T.state.searchQ = '없는단어'; assert.match(T.views.search(s), /일치하는 내 생활 항목이 없어요/); T.state.searchQ = '';
  T.state.reviewOffset = 0; assert.match(T.views.report(s), /이 주에는 기록된 일정·할 일·루틴·기록이 없어요\./);
  T.state.moneyOffset = 0; assert.match(T.views.money(s), /지출 기록이 없습니다\./);
  assert.match(T.views.settings(s), /지울 내 생활 데이터가 없어요\./);
  assert.match(T.views.settings(s), /data-lv-ml-export disabled/); assert.match(T.views.settings(s), /data-lv-ml-clear disabled/);
  T.state.calSelected = today(); assert.match(T.views.calendar(s), /이 날짜가 마감인 할 일이 없어요\.[\s\S]*이 날짜에 남긴 기록이 없어요\./);
});

test('ML2-39 calendar shows the day\'s events, task deadlines and records from the same store', () => {
  const { T } = app();
  T.saveEvent({ title: '면접', date: today(), start: '14:00' });
  T.saveTodo({ title: '서류 제출', due: today() });
  T.saveJournal({ title: '면접 후기', date: today(), body: '좋았다' });
  T.state.calSelected = today(); T.state.calMonth = new Date(); T.state.calMode = 'month';
  const html = T.views.calendar(T.loadStore());
  for (const t of ['면접', '서류 제출', '면접 후기']) assert.ok(html.includes(t), t);
  assert.match(html, /aria-label="[^"]*일정 1개, 마감 할 일 1개"/);
});

test('ML2-40 Account Sync compatibility: the store keeps its top-level schema; new fields live inside records', () => {
  const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
  const src = read('data/livon-user-data.js');
  const inv = src.slice(src.indexOf('{ key: "livon.mlStore.v1"'), src.indexOf('{ key: "livon.platform.v1"'));
  const fields = [...inv.matchAll(/\b([a-zA-Z]+): \{ cls:/g)].map(m => m[1]);
  const { T, raw } = app();
  T.saveTodo({ title: 'x', due: today() }); T.saveHabit({ title: 'h', freq: 'days', days: [1] }); T.saveGoal({ title: 'g', status: '완료' });
  T.saveTx({ amount: 1, date: today() }); T.saveJournal({ title: 'j', date: today(), body: 'b' });
  T.clearMyLifeData(); T.saveTodo({ title: 'y' });
  const top = Object.keys(raw());
  for (const k of top) assert.ok(fields.includes(k) || k === 'v', 'unknown top-level key ' + k);
  for (const k of T.ML_COLLECTIONS) assert.ok(fields.includes(k), k + ' is a syncable field');
  assert.match(src, /"livon\.mlStore\.v1": \{ todos: "tasks", goals: "goals", events: "calendar_items"/, 'sync tracking of the store is unchanged');
  assert.match(PAGE, /var STORE_VERSION = 2;/, 'no schema version bump: additive fields only (habit.days, goal.doneAt)');
});

/* ═════════ browser ═════════ */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const canBrowse = fs.existsSync(PW) && fs.existsSync(CHROME);
const skip = !canBrowse && 'no local Chromium';
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

/* fixture: a realistic day on this device */
function fixture() {
  const d = n => { const x = new Date(); x.setDate(x.getDate() + n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const t = d(0), now = Date.now();
  return { v: 2,
    events: [{ id: 'e1', title: '팀 회의', date: t, start: '23:58', end: '23:59', category: '업무' }, { id: 'e2', title: '어머니 생신', date: t, allDay: true, category: '기념일' }, { id: 'e3', title: '병원 예약', date: d(2), start: '10:00', category: '건강' }],
    todos: [{ id: 't1', title: '보고서 마무리', due: t, priority: '높음', createdAt: now }, { id: 't2', title: '지난 세금 신고', due: d(-2), priority: '보통', createdAt: now }, { id: 't3', title: '책 반납', due: d(3), createdAt: now }, { id: 't4', title: '끝낸 일', due: t, done: true, doneAt: now, createdAt: now }],
    goals: [{ id: 'g1', title: '독립 준비', status: '진행 중', due: d(6), start: d(-10) }],
    habits: [{ id: 'h1', title: '아침 산책', freq: 'daily', createdAt: now - 864e5 * 10 }],
    habitLogs: { h1: { [d(-1)]: true, [d(-2)]: true } },
    journal: [{ id: 'j1', title: '좋은 하루', date: t, body: '산책이 좋았다', category: '생활', private: true }],
    transactions: [{ id: 'x1', kind: 'expense', amount: 12000, date: t, category: '식비', note: '점심' }],
    budgets: { monthly: 300000, categories: {} }, health: [{ id: 'hl1', kind: '수면', date: t, value: '7시간' }], experiences: [], checklists: [], projects: [], folders: [],
    settings: { weekStartsOn: 0, currency: 'KRW', fontScale: 'md' } };
}
const SKIPPED = JSON.stringify({ version: 1, state: 'SKIPPED', step: '', draft: null, updatedAt: 1 });
async function open(hash = '#ml-home', { width = 1280, height = 860, store = fixture(), record = null } = {}) {
  await boot();
  const ctx = await B.newContext({ viewport: { width, height }, reducedMotion: 'reduce', acceptDownloads: true });
  await ctx.route('**/*', r => { const u = r.request().url(); if (record) record.push(r.request().method() + ' ' + u); return u.startsWith(BASE) ? r.continue() : r.abort(); });
  await ctx.addInitScript(([pz, st]) => { try { if (!sessionStorage.getItem('ml2-seeded')) { sessionStorage.setItem('ml2-seeded', '1'); localStorage.setItem('livon.personalization.v1', pz); if (st) localStorage.setItem('livon.mlStore.v1', st); } } catch (e) {} }, [SKIPPED, store ? JSON.stringify(store) : '']);
  const pg = await ctx.newPage();
  pg._errors = []; pg._console = [];
  pg.on('pageerror', e => pg._errors.push(e.message)); pg.on('console', m => pg._console.push(m.text()));
  await pg.goto(BASE + '/livon/#' + hash.replace(/^#/, ''), { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(900);
  return pg;
}
const go = async (pg, hash, wait = 500) => { await pg.evaluate(h => { location.hash = h; }, hash); await pg.waitForTimeout(wait); };
const store = pg => pg.evaluate(() => JSON.parse(localStorage.getItem('livon.mlStore.v1')));
/* announce() clears the live region and writes the message 30 ms later (so a repeated message is read again) */
const status = async pg => { await pg.waitForTimeout(120); return pg.evaluate(() => document.querySelector('[data-lv-ml-status]').textContent); };

test('ML2-01 dashboard: date, greeting and every tile is a real count from the store', { skip }, async () => {
  const pg = await open('#ml-home');
  const r = await pg.evaluate(() => ({ label: document.querySelector('[data-lv-ml-today-label]').textContent, greet: document.querySelector('[data-lv-ml-greeting]').textContent,
    tiles: [...document.querySelectorAll('[data-lv-ml-stats] .lv-ml-stat')].map(x => x.querySelector('p').textContent + '=' + x.querySelector('strong').textContent) }));
  const d = new Date();
  assert.ok(r.label.startsWith(d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일'), r.label);
  assert.match(r.greet, /오늘 일정 2개, 오늘 마감 할 일 1개, 기한 지난 할 일 1개가 있어요\./);
  assert.deepEqual(r.tiles.slice(0, 4), ['일정=2', '할 일=2', '목표=1', '루틴=1'], '2 events today; 2 open due ≤ today; 1 goal; 1 routine open today');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('ML2-02 today: schedule in time order (all-day first), completed tasks marked in text, routines and upcoming blocks', { skip }, async () => {
  const pg = await open('#ml-home');
  const r = await pg.evaluate(() => ({
    tl: [...document.querySelectorAll('[data-lv-ml-timeline] li strong')].map(x => x.textContent),
    done: [...document.querySelectorAll('[data-lv-ml-today-todos] .lv-ml-task.is-done label')].map(x => x.textContent),
    habits: document.querySelector('[data-lv-ml-today-habits]').innerText, up: document.querySelector('[data-lv-ml-upcoming]').innerText }));
  assert.deepEqual(r.tl, ['어머니 생신', '팀 회의']);
  assert.deepEqual(r.done, ['끝낸 일 (완료)'], 'completion is in the accessible text, not color only');
  assert.match(r.habits, /아침 산책/); assert.match(r.habits, /연속 2일/);
  assert.match(r.up, /병원 예약/); assert.match(r.up, /책 반납/); assert.match(r.up, /독립 준비/);
  const empty = await open('#ml-home', { store: null });
  assert.match(await empty.evaluate(() => document.querySelector('[data-lv-ml-timeline]').innerText), /오늘 예정된 일정이 없어요\./);
  assert.match(await empty.evaluate(() => document.querySelector('[data-lv-ml-upcoming]').innerText), /앞으로 7일 동안 예정된/);
  await empty.context().close();
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('ML2-03 quick add: + 할 일 opens the form, saves, shows in Today and announces', { skip }, async () => {
  const pg = await open('#ml-home');
  await pg.locator('.lv-ml-quick [data-lv-ml-add="todo"]').click();
  await pg.locator('#lv-ml-form-modal input[name="title"]').fill('빠른 추가 할 일');
  await pg.locator('#lv-ml-form-modal input[name="due"]').fill(today());
  await pg.locator('#lv-ml-form-modal button[type="submit"]').click(); await pg.waitForTimeout(200);
  assert.ok((await store(pg)).todos.some(t => t.title === '빠른 추가 할 일' && t.due === today()));
  assert.match(await pg.locator('[data-lv-ml-today-todos]').innerText(), /빠른 추가 할 일/);
  assert.match(await status(pg), /^할 일을 추가했습니다\.$/, "Today V2: the particle follows the word");
  for (const t of ['event', 'goal', 'journal']) {
    await pg.locator('.lv-ml-quick [data-lv-ml-add="' + t + '"]').click();
    assert.equal(await pg.locator('#lv-ml-form-modal').isVisible(), true, t);
    await pg.keyboard.press('Escape');
  }
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('ML2-05 calendar: month navigation, select a date, add there, persists after reload', { skip }, async () => {
  const pg = await open('#ml-calendar');
  const head = () => pg.locator('#ml-panel .lv-ml-cal-head strong').innerText();
  const h0 = await head();
  await pg.locator('[data-lv-ml-cal-nav="1"]').click(); assert.notEqual(await head(), h0);
  await pg.locator('[data-lv-ml-cal-nav="0"]').click(); assert.equal(await head(), h0);
  /* a day of this month that has no fixture event (the empty day offers "이 날짜에 일정 추가") */
  const ym = today().slice(0, 7);
  const target = [shift(1), shift(-1), shift(4), shift(-3)].find(x => x.startsWith(ym));
  await pg.locator('[data-lv-ml-cal-day="' + target + '"]').click();
  assert.equal(await pg.locator('[data-lv-ml-cal-day="' + target + '"]').getAttribute('aria-pressed'), 'true');
  await pg.locator('#ml-panel [data-lv-ml-add="event"][data-date="' + target + '"]').first().click();
  assert.equal(await pg.locator('#lv-ml-form-modal input[name="date"]').inputValue(), target);
  await pg.locator('#lv-ml-form-modal input[name="title"]').fill('달력에서 추가');
  await pg.locator('#lv-ml-form-modal button[type="submit"]').click(); await pg.waitForTimeout(200);
  await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  await go(pg, '#ml-calendar?date=' + target);
  assert.match(await pg.locator('#ml-panel').innerText(), /달력에서 추가/);
  assert.match(await pg.locator('#ml-panel').innerText(), /이 날 마감인 할 일/);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('ML2-22 export: warning first, then a browser download of the My Life JSON — no request is made', { skip }, async () => {
  const rec = [];
  const pg = await open('#ml-settings', { record: rec });
  const before = rec.length;
  await pg.locator('[data-lv-ml-export]').click();
  assert.match(await pg.locator('#lv-ml-confirm-modal').innerText(), /개인 기록[\s\S]*LIVON 서버나 다른 곳으로 보내지지 않아요/);
  await pg.locator('#lv-ml-confirm-modal button[data-lv-ml-confirm="0"]').click();
  assert.equal(await pg.locator('#lv-ml-confirm-modal').count(), 0);
  await pg.locator('[data-lv-ml-export]').click();
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.locator('#lv-ml-confirm-modal button[data-lv-ml-confirm="1"]').click()]);
  assert.match(dl.suggestedFilename(), /^livon-my-life-\d{4}-\d{2}-\d{2}\.json$/);
  const p = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  assert.equal(p.kind, 'my-life-export'); assert.equal(p.version, 1); assert.ok(!isNaN(Date.parse(p.exportedAt)));
  assert.equal(p.collections.todos.length, 4); assert.equal(p.collections.journal[0].title, '좋은 하루');
  assert.deepEqual(rec.slice(before).filter(u => !/^GET /.test(u)), [], 'no upload of any kind');
  assert.match(await status(pg), /파일로 내려받았어요/);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('ML2-23 delete-all: scope explained, cancel keeps everything, two confirmations delete', { skip }, async () => {
  const pg = await open('#ml-settings');
  await pg.evaluate(() => { localStorage.setItem('livon.cmStore.v1', JSON.stringify({ v: 2, posts: [{ id: 'p', title: 'KEEP' }] })); });
  await pg.locator('[data-lv-ml-clear]').click();
  const body = await pg.locator('#lv-ml-confirm-modal').innerText();
  assert.match(body, /지워지는 것:[\s\S]*남는 것: 저장한 항목, 커뮤니티 글·댓글, 맞춤 설정, 관심사, 최근 본 항목, LIVON AI 대화, ONGIL, Newon\+ 계정/);
  await pg.keyboard.press('Escape');
  assert.equal((await store(pg)).todos.length, 4, 'Escape cancels');
  await pg.locator('[data-lv-ml-clear]').click();
  await pg.locator('#lv-ml-confirm-modal button[data-lv-ml-confirm="1"]').click();
  assert.match(await pg.locator('#lv-ml-confirm-modal').innerText(), /되돌릴 수 없어요/);
  await pg.locator('#lv-ml-confirm-modal button[data-lv-ml-confirm="0"]').click();
  assert.equal((await store(pg)).todos.length, 4, 'cancel at the final step keeps everything');
  await pg.locator('[data-lv-ml-clear]').click();
  await pg.locator('#lv-ml-confirm-modal button[data-lv-ml-confirm="1"]').click();
  await pg.locator('#lv-ml-confirm-modal button[data-lv-ml-confirm="1"]').click(); await pg.waitForTimeout(150);
  const s = await store(pg);
  assert.deepEqual([s.todos.length, s.events.length, s.journal.length, s.transactions.length, s.health.length, Object.keys(s.habitLogs).length], [0, 0, 0, 0, 0, 0]);
  assert.equal(await pg.evaluate(() => JSON.parse(localStorage.getItem('livon.cmStore.v1')).posts[0].title), 'KEEP');
  assert.match(await status(pg), /내 생활 데이터를 지웠어요/);
  assert.equal(await pg.evaluate(() => document.activeElement && document.activeElement.id), 'ml-data-title', 'focus lands on the data heading');
  await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  assert.equal((await store(pg)).todos.length, 0, 'still empty after reload');
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('ML2-41 responsive 320 / 390 / 768 / 1024 / 1440: no horizontal overflow on any My Life view', { skip }, async () => {
  const views = ['#ml-home', '#ml-calendar', '#ml-todos', '#ml-goals', '#ml-routines', '#ml-records', '#ml-money', '#ml-report', '#ml-settings'];
  for (const width of [320, 390, 768, 1024, 1440]) {
    const pg = await open('#ml-home', { width, height: 820 });
    for (const v of views) {
      await go(pg, v, 350);
      const r = await pg.evaluate(() => ({ ov: document.documentElement.scrollWidth - innerWidth, wide: [...document.querySelectorAll('#life-now .lv-ml__wrap *')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.right > innerWidth + 1 && !e.closest('.lv-ml-nav__track') && getComputedStyle(e).position !== 'fixed'; }).slice(0, 3).map(e => e.tagName + '.' + e.className) }));
      assert.ok(r.ov <= 0, width + ' ' + v + ' overflow ' + r.ov); assert.deepEqual(r.wide, [], width + ' ' + v);
    }
    assert.deepEqual(pg._errors, [], String(width));
    await pg.context().close();
  }
});

test('ML2-42 keyboard: quick add opens with Enter, Escape closes and returns focus, a routine toggles with Space', { skip }, async () => {
  const pg = await open('#ml-home');
  const btn = pg.locator('.lv-ml-quick [data-lv-ml-add="todo"]');
  await btn.focus(); await pg.keyboard.press('Enter');
  assert.equal(await pg.evaluate(() => document.activeElement.name), 'title', 'focus moves into the form');
  await pg.keyboard.press('Escape');
  assert.equal(await pg.evaluate(() => document.activeElement.getAttribute('data-lv-ml-add')), 'todo', 'focus returns to the opener');
  await go(pg, '#ml-routines');
  const cb = pg.locator('#ml-panel input[data-lv-ml-habit="h1"]');
  await cb.focus(); await pg.keyboard.press('Space'); await pg.waitForTimeout(100);
  assert.equal((await store(pg)).habitLogs.h1[today()], true);
  assert.equal(await pg.evaluate(() => document.activeElement.getAttribute('data-lv-ml-habit')), 'h1', 'focus stays on the routine after re-render');
  assert.match(await status(pg), /아침 산책’ 오늘 완료로 표시했어요/);
  await pg.keyboard.press('Space'); await pg.waitForTimeout(100);
  assert.equal((await store(pg)).habitLogs.h1[today()], undefined, 'undo');
  /* the search form works from the keyboard */
  await go(pg, '#ml-home');
  await pg.locator('#ml-search-q').fill('산책'); await pg.locator('#ml-search-q').press('Enter'); await pg.waitForTimeout(500);
  assert.match(await pg.evaluate(() => location.hash), /^#ml-search$/);
  assert.match(await pg.locator('#ml-panel').innerText(), /‘산책’ 검색 결과 2개/);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('ML2-43 dialog focus: the confirm dialog focuses Cancel, traps Tab, Escape closes and focus returns', { skip }, async () => {
  const pg = await open('#ml-settings');
  await pg.locator('[data-lv-ml-clear]').focus(); await pg.keyboard.press('Enter');
  const role = await pg.evaluate(() => { const p = document.querySelector('#lv-ml-confirm-modal .lv-ml-modal__panel'); return [p.getAttribute('role'), p.getAttribute('aria-modal'), document.activeElement.getAttribute('data-lv-ml-confirm')]; });
  assert.deepEqual(role, ['alertdialog', 'true', '0']);
  for (let i = 0; i < 5; i++) { await pg.keyboard.press('Tab'); assert.ok(await pg.evaluate(() => !!document.activeElement.closest('#lv-ml-confirm-modal')), 'Tab stays in the dialog'); }
  await pg.keyboard.press('Shift+Tab'); assert.ok(await pg.evaluate(() => !!document.activeElement.closest('#lv-ml-confirm-modal')));
  await pg.keyboard.press('Escape');
  assert.equal(await pg.evaluate(() => document.activeElement.hasAttribute('data-lv-ml-clear')), true);
  /* routine form: weekday checkboxes are labelled, invalid choice is announced in the form */
  await go(pg, '#ml-routines');
  await pg.locator('[data-lv-ml-panel-actions] [data-lv-ml-add="habit"]').click();
  await pg.locator('#lv-ml-form-modal input[name="title"]').fill('수영');
  await pg.locator('#lv-ml-form-modal select[name="freq"]').selectOption('days');
  await pg.locator('#lv-ml-form-modal button[type="submit"]').click();
  assert.match(await pg.locator('[data-lv-ml-form-err]').innerText(), /요일을 하나 이상/);
  await pg.locator('#lv-ml-form-modal label:has-text("월요일") input').check();
  await pg.locator('#lv-ml-form-modal button[type="submit"]').click(); await pg.waitForTimeout(150);
  assert.deepEqual((await store(pg)).habits.find(h => h.title === '수영').days, [1]);
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('ML2-44 200% text: no overflow and no clipped text on My Life views', { skip }, async () => {
  const pg = await open('#ml-home', { width: 390, height: 844 });
  for (const v of ['#ml-home', '#ml-routines', '#ml-records', '#ml-report', '#ml-settings', '#ml-calendar', '#ml-todos']) {
    await go(pg, v, 300);
    await pg.addStyleTag({ content: 'html{font-size:200% !important}' }); await pg.waitForTimeout(150);
    const r = await pg.evaluate(() => { const out = []; document.querySelectorAll('#life-now *').forEach(e => { const cs = getComputedStyle(e), b = e.getBoundingClientRect(); if (!b.width || e.closest('[aria-hidden=true],[hidden]') || /visually-hidden|wordmark/.test(e.className)) return; if (![...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim())) return; if ((cs.overflowX === 'hidden' || cs.overflow === 'hidden') && e.scrollWidth > e.clientWidth + 2 && cs.textOverflow !== 'ellipsis') out.push(e.tagName + '.' + e.className); }); return { ov: document.documentElement.scrollWidth - innerWidth, clipped: out.slice(0, 5) }; });
    assert.ok(r.ov <= 1, v + ' overflow ' + r.ov); assert.deepEqual(r.clipped, [], v);
  }
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('ML2-45 touch targets: new My Life controls are at least 44px high', { skip }, async () => {
  const pg = await open('#ml-home', { width: 390, height: 844 });
  const small = [];
  for (const v of ['#ml-home', '#ml-routines', '#ml-records', '#ml-report', '#ml-settings', '#ml-todos', '#ml-money']) {
    await go(pg, v, 300);
    small.push(...await pg.evaluate(v => [...document.querySelectorAll('#life-now button, #life-now select, #life-now input:not([type=checkbox]), #life-now .lv-ml-row-acts a, #life-now .lv-ml-btn')]
      .filter(e => { const b = e.getBoundingClientRect(); return b.width && b.height && !e.closest('[hidden]') && !e.closest('.lv-ml-nav') && b.height < 43.5; })
      .filter(e => e.matches('[data-lv-ml-export],[data-lv-ml-clear],[data-lv-ml-record-type],[data-lv-ml-record-range],[data-lv-ml-record-more],[data-lv-ml-todo-sort],[data-lv-ml-review-nav],[data-lv-ml-money-nav],[data-lv-ml-goal-done],[data-lv-ml-search-form] *,[data-lv-ml-record-search] *'))
      .map(e => v + ' ' + e.tagName + ' ' + e.textContent.trim().slice(0, 20) + ' ' + Math.round(e.getBoundingClientRect().height)), v));
  }
  assert.deepEqual(small, []);
  /* the routine checkbox has a 44px row */
  await go(pg, '#ml-routines', 300);
  assert.ok(await pg.evaluate(() => document.querySelector('#ml-panel input[data-lv-ml-habit]').closest('li').getBoundingClientRect().height >= 44));
  await pg.context().close();
});

test('ML2-46 state is exposed to assistive tech: pressed filters, live status, labelled day cells, headings', { skip }, async () => {
  const pg = await open('#ml-records');
  await pg.locator('[data-lv-ml-record-type="journal"]').click();
  assert.equal(await pg.locator('[data-lv-ml-record-type="journal"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await pg.locator('[data-lv-ml-record-type="all"]').getAttribute('aria-pressed'), 'false');
  assert.equal(await pg.evaluate(() => document.activeElement.getAttribute('data-lv-ml-record-type')), 'journal');
  await pg.locator('[data-lv-ml-record-search] input').fill('산책'); await pg.locator('[data-lv-ml-record-search] input').press('Enter'); await pg.waitForTimeout(100);
  assert.match(await status(pg), /기록 1개/);
  await go(pg, '#ml-goals');
  await pg.locator('[data-lv-ml-goal-done="g1"]').click(); await pg.waitForTimeout(100);
  assert.match(await status(pg), /독립 준비’ 목표를 완료로 표시했어요/);
  assert.equal((await store(pg)).goals[0].status, '완료');
  await go(pg, '#ml-calendar');
  assert.match(await pg.locator('[data-lv-ml-cal-day="' + today() + '"]').getAttribute('aria-label'), /오늘, 일정 2개, 마감 할 일 1개/);
  const heads = await pg.evaluate(() => [...document.querySelectorAll('#life-now h2, #life-now h3')].filter(h => h.offsetParent).map(h => h.tagName));
  assert.ok(heads.includes('H2') && heads.includes('H3'));
  assert.deepEqual(pg._errors, []);
  await pg.context().close();
});

test('ML2-47 full flow: no page error, no console output with personal content, no request outside the page', { skip }, async () => {
  const rec = [];
  const pg = await open('#ml-home', { record: rec });
  for (const v of ['#ml-calendar', '#ml-todos', '#ml-goals', '#ml-routines', '#ml-journal', '#ml-records', '#ml-money', '#ml-health', '#ml-saved', '#ml-report', '#ml-settings', '#ml-search', '#ml-home']) await go(pg, v, 300);
  await pg.locator('[data-lv-ml-review-nav="-1"]').count();
  await go(pg, '#ml-report'); await pg.locator('[data-lv-ml-review-nav="-1"]').click(); await pg.waitForTimeout(100);
  assert.match(await pg.locator('#ml-panel').innerText(), /지난주 ·/);
  await go(pg, '#ml-money'); await pg.locator('[data-lv-ml-money-nav="-1"]').click(); await pg.waitForTimeout(100);
  assert.match(await pg.locator('#ml-panel').innerText(), /이번 달/);
  await go(pg, '#ml-todos'); await pg.locator('[data-lv-ml-todo-sort]').selectOption('priority'); await pg.waitForTimeout(100);
  assert.equal(await pg.evaluate(() => location.hash), '#ml-todos?sort=priority');
  assert.equal(await pg.locator('#ml-panel .lv-ml-task__title').first().innerText(), '보고서 마무리');
  assert.deepEqual(pg._errors, []);
  for (const secret of ['좋은 하루', '산책이 좋았다', '보고서 마무리', '점심']) assert.equal(pg._console.join('\n').includes(secret), false, secret);
  assert.deepEqual(rec.filter(u => !u.includes(BASE)).filter(u => !/^GET https:\/\/(fonts\.|d8j0ntlcm91z4\.cloudfront\.net|images\.higgs\.ai|cdn\.|db\.onlinewebfonts\.com)/.test(u)), [], 'only page assets (external ones are refused in tests)');
  assert.deepEqual(rec.filter(u => /^(POST|PUT|PATCH|DELETE) /.test(u) && /livon|api/.test(u)), []);
  await pg.context().close();
});
