// LIVON Home V2 — the personal hub: 오늘 → 내 생활 → 지금 내 생애주기 → 발견 → 저장한 것, then Community / LIVON AI,
// then the introduction to LIVON. Home reads and links; it owns no data and writes none.
//
// WHY THIS FILE CHANGED (Home V2): the Home V1 tests pinned the V1 layout and its Home-owned pieces.
// BEFORE: order continue → meaning → journey → events → today → mylivon → connect → ai → services → start; a settings
//         form, Life Event chips and "나를 위한 추천" on Home; Home counted "남은 할 일" as every open to-do with its own
//         date arithmetic; numbered Explore / Community rows; one renderAll() without isolation.
// AFTER:  the hub comes right after the hero and uses the same day model as 오늘의 발견 › 내 오늘; the form, the chips,
//         the recommendation wording and the numbering are gone; livon.hmRegion is neither read nor written; every
//         section is drawn on its own. Kept from V1: real data only, real links, AI hand-off as a draft, bounded reads.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const INDEX = read('index.html');
const LIFE = JSON.parse(read('life-topics.json'));
const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

function livonView() {
  const src = INDEX.match(/function livonView\(hash\) \{[\s\S]*?\n        \}/)[0];
  return vm.runInNewContext('(' + src + ')');
}

/* Minimal DOM: every selector resolves to one stub element whose innerHTML we can inspect. */
function home({ local = {}, posts = null } = {}) {
  const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };
  const els = new Map();
  const el = sel => {
    if (!els.has(sel)) els.set(sel, { sel, innerHTML: '', textContent: '', hidden: false, style: {}, href: '', value: '', classList: { add() {}, remove() {}, toggle() {} }, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], getBoundingClientRect: () => ({ top: 0, bottom: 0 }), setAttribute() {}, getAttribute: () => null });
    return els.get(sel);
  };
  const listeners = {};
  const doc = {
    readyState: 'complete', documentElement: { dataset: { lvView: 'home' } },
    querySelector: sel => (/^\[data-lv-hm|^#livon-home/.test(sel) ? el(sel) : null),
    querySelectorAll: () => [], getElementById: id => (id === 'livon-home' ? el('#livon-home') : null),
    addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); }, contains: () => true
  };
  const ctx = {
    document: doc, localStorage: mem(), sessionStorage: mem(), location: { hash: '#livon-home' }, navigator: {}, URL, console,
    setTimeout: () => 0, clearTimeout() {}, scrollTo() {}, innerHeight: 800, matchMedia: () => ({ matches: true }), getComputedStyle: () => ({ getPropertyValue: () => '74px' }),
    fetch: () => Promise.reject(new Error('offline')), history: { replaceState() {}, pushState() {} }, addEventListener() {}
  };
  ctx.window = ctx;
  for (const [k, v] of Object.entries(local)) ctx.localStorage.setItem(k, JSON.stringify(v));
  vm.createContext(ctx);
  // shared data + stores exactly as the page loads them (home-page.js runs last)
  for (const f of ['life-data.js', 'life-events-data.js', 'explore-data.js', 'today-data.js', 'community-data.js']) vm.runInContext(read(f), ctx);
  const saves = new Map();
  ctx.LivonPlatform = { listSaves: () => { if (ctx._savesThrow) throw new Error('broken saves'); return ctx._savesRaw || [...saves.values()]; }, saveItem: x => saves.set(x.id, Object.assign({ savedAt: Date.now() }, x)), openOnboarding() { ctx._onboard = (ctx._onboard || 0) + 1; } };
  for (const f of ['data/livon-user-data.js', 'life-hub.js', 'today-feed.js', 'explore-search.js', 'life-now-data.js', 'life-now-hub.js', 'life-now-page.js']) vm.runInContext(read(f), ctx);
  ctx.LivonLifeHub.repo.use(LIFE);
  if (posts) ctx.LivonCommunityRepo = { visiblePosts: () => posts };
  return { ctx, els, saves, listeners, boot: () => { vm.runInContext(read('home-page.js'), ctx); return ctx; }, html: sel => el(sel).innerHTML };
}
const hrefs = html => [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);

const SRC = read('home-page.js');
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '');
const CSS = read('home-page.css');
const SECTION = INDEX.slice(INDEX.indexOf('<section id="livon-home"'), INDEX.indexOf('<section class="lv-lum" id="life"'));
const HUB = SECTION.slice(SECTION.indexOf('id="hm-hub"'), SECTION.indexOf('id="hm-connect"'));
const text = html => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const SEL = { today: '[data-lv-hm-v2="today"]', mylife: '[data-lv-hm-v2="mylife"]', stage: '[data-lv-hm-mystage]', discover: '[data-lv-hm-v2="discover"]', saved: '[data-lv-hm-v2="saved"]', community: '[data-lv-hm-cm-list]' };
const allHtml = h => Object.values(SEL).map(s => h.html(s)).join('\n');

/* ───────── structure ───────── */
test('HOME-V2-01 section order: hero → hub (오늘, 내 생활, 생애주기, 발견, 저장한 것) → Community → AI → introduction', () => {
  const order = [...SECTION.matchAll(/<section class="lv-hm-sec[^"]*" id="(hm-[a-z]+)"/g)].map(m => m[1]);
  assert.deepEqual(order, ['hm-hub', 'hm-connect', 'hm-ai', 'hm-meaning', 'hm-journey', 'hm-services', 'hm-start']);
  assert.deepEqual([...HUB.matchAll(/<section class="lv-hm-hub__card[^"]*" id="(hm-[a-z]+)"/g)].map(m => m[1]), ['hm-today', 'hm-mylife', 'hm-stage', 'hm-discover', 'hm-saved']);
  assert.deepEqual([...HUB.matchAll(/<h3 id="hm-[a-z]+-title">([^<]+)<\/h3>/g)].map(m => m[1]), ['오늘', '내 생활', '지금 내 생애주기', '발견', '저장한 것']);
  assert.ok(INDEX.indexOf('class="livon-hero"') < INDEX.indexOf('id="hm-hub"'), 'the hero is still first');
  assert.ok(SECTION.indexOf('id="hm-hub"') < SECTION.indexOf('id="hm-meaning"'), 'no brand section above the hub');
  /* Decision 1: the introduction is kept, below */
  for (const kept of ['id="hm-meaning"', 'data-lv-hm-stage-tabs', 'data-lv-hm-svc-tabs', 'id="hm-start"', '/livon/life/', '/livon/life-events/', '/livon/help/']) assert.ok(SECTION.includes(kept), kept);
  assert.deepEqual([...SECTION.matchAll(/<p class="lv-hm-kicker">(\d\d) \//g)].map(m => m[1]), ['01', '02', '03', '04'], 'introduction kickers only');
});

test('HOME-V2-02 removed Home-owned pieces: no settings form, no Life Event chips, no V1 dashboard, no stage write button', () => {
  for (const gone of ['hm-continue', 'hm-events', 'hm-mylivon', 'data-lv-hm-dash', 'data-lv-hm-events', 'data-lv-hm-set-stage', 'data-lv-hm-today-cats', 'data-lv-hm-ex-list'])
    assert.equal(SECTION.includes(gone), false, gone);
  for (const gone of ['data-lv-hm-stage-select', 'data-lv-hm-region', 'data-lv-hm-save-prefs', 'data-lv-hm-sit', 'data-lv-hm-interest=', 'data-lv-hm-event=', 'PERSONALIZE', 'INTEREST_OPTS', 'toggleLifeEvent', 'recommendItems'])
    assert.equal(SRC.includes(gone), false, gone);
  /* the stage is chosen and changed in onboarding, the place that owns it; Life Events live in Life Stage */
  assert.match(SECTION, /<button type="button" class="lv-hm-btn lv-hm-btn--ghost" data-lv-hm-onboard>내 라이프 스테이지 설정하기<\/button>/);
  assert.match(SRC, /href=\\"#life-events\\">준비 중인 변화 보기/);
});

test('HOME-V2-03 Home writes nothing: no localStorage write at all; livon.hmRegion and the old Home keys are neither read nor written', () => {
  assert.equal(/localStorage\.(setItem|removeItem|clear)/.test(CODE), false, 'no localStorage write in Home');
  assert.equal(/writeJSON/.test(CODE), false);
  for (const key of ['livon.hmRegion', 'hmRegion', 'livon.lifeSituations', 'livon.lifeEvents', 'livon.mlInterests', 'livon.tdSaved', 'livon.mlStore.v1', 'savedCommunity'])
    assert.equal(SRC.includes(key), false, key + ' is not used by Home');
  /* no LIVON screen reads the old Home region key. Onboarding (livon-platform.js) still writes its region there — that
     is its own write, outside Home, and is left as it is; the value stays on the device as unused legacy state. */
  const PLATFORM = read('livon-platform.js');
  assert.deepEqual(PLATFORM.match(/.*KEY_REGION.*/g).map(l => l.trim().slice(0, 24)), ['var KEY_REGION = "livon.', 'writeJSON(KEY_REGION, [s'], 'declared and written once; never read');
  for (const f of ['livon-personalization.js', 'livon-onboarding.js', 'life-now-page.js', 'life-now-hub.js', 'today-page.js', 'today-feed.js', 'explore-page.js', 'life-page.js', 'life-hub.js', 'community-page.js', 'ai-page.js'])
    assert.equal(read(f).includes('hmRegion'), false, f);
  const legacy = { 'livon.hmRegion': '서울', 'livon.lifeEvents': ['move'], 'livon.lifeSituations': ['single'], 'livon.tdSaved': [{ id: 'x', label: '옛 저장' }] };
  const h = home({ local: { ...legacy, 'livon.lifeStage': '30', 'livon.lifeInterests': ['주거'] } });
  const seen = [], wrote = [];
  const get = h.ctx.localStorage.getItem, set = h.ctx.localStorage.setItem;
  h.ctx.localStorage.getItem = k => { seen.push(k); return get(k); };
  h.ctx.localStorage.setItem = (k, v) => { wrote.push(k); return set(k, v); };
  h.ctx.localStorage.removeItem = k => { wrote.push('rm:' + k); };
  h.boot();
  assert.equal(seen.includes('livon.hmRegion'), false, 'HM REGION READ = 0');
  assert.deepEqual(wrote, [], 'HM REGION WRITE = 0 and no other write on render');
  for (const [k, v] of Object.entries(legacy)) assert.equal(get(k), JSON.stringify(v), k + ' is left exactly as it was');
  assert.doesNotMatch(allHtml(h), /옛 저장/, 'the legacy saved list is not shown as a save');
});

/* ───────── 오늘 ───────── */
test('HOME-V2-04 오늘 uses the shared day model: today\'s to-dos, events and routines — not every open to-do', () => {
  const h = home();
  const T = h.ctx.LivonMyLife._test;
  T.saveTodo({ title: '오늘 마감 A', due: day(0) }); const done = T.saveTodo({ title: '오늘 마감 B', due: day(0) });
  T.setTodoDone(done.item.id, true);
  T.saveTodo({ title: '지난 할 일', due: day(-2) });
  T.saveTodo({ title: '다음 주 할 일', due: day(5) });
  T.saveTodo({ title: '기한 없는 할 일' });
  T.saveEvent({ title: '오늘 병원', date: day(0), start: '09:30' }); T.saveEvent({ title: '내일 모임', date: day(1), start: '19:00' });
  const r1 = T.saveHabit({ title: '물 마시기' }); T.saveHabit({ title: '스트레칭' });
  T.setHabitDone((r1.item || r1).id, T.todayStr(new Date()), true);
  h.boot();
  const m = h.ctx.LivonMyLife.api.today(new Date());
  const html = h.html(SEL.today), t = text(html);
  assert.match(html, new RegExp('<time datetime="' + m.date + '">'));
  assert.equal(m.todos.length, 2); assert.equal(m.events.length, 1); assert.equal(m.routines.length, 2); assert.equal(m.overdue.length, 1);
  assert.match(t, /오늘 할 일 2개 중 1개 완료/); assert.match(t, /오늘 일정 1개/); assert.match(t, /오늘 루틴 2개 중 1개 완료/); assert.match(t, /기한 지난 할 일 1개/);
  assert.match(t, /09:30 · 오늘 병원/); assert.match(t, /오늘 마감 A/);
  assert.doesNotMatch(t, /다음 주 할 일|기한 없는 할 일|내일 모임|남은 할 일/, 'only what is due today is counted as today');
  assert.deepEqual(hrefs(html), ['#ml-todos?filter=today', '#ml-calendar', '#ml-routines', '#ml-todos']);
  /* the same sentences Today builds from the same model */
  const TODAY = read('today-page.js');
  for (const piece of ['m = api.today(now)', '"오늘 할 일 " + m.todos.length + "개 중 " + tDone + "개 완료"', '"오늘 일정 " + m.events.length + "개"', '"오늘 루틴 " + m.routines.length + "개 중 " + rDone + "개 완료"']) assert.ok(TODAY.includes(piece), 'Today: ' + piece);
  assert.match(CODE, /var m = api\.today\(new Date\(\)\);/);
  assert.equal((CODE.match(/api\.today\(/g) || []).length, 1, 'one call per render, shared by 오늘 and 내 생활');
  assert.equal(/getFullYear|getMonth|getDate\(|setDate|864e5|T12:00:00/.test(CODE), false, 'Home has no date arithmetic of its own');
});

test('HOME-V2-05 date boundary in Asia/Seoul, UTC and America/Los_Angeles: Home shows the day and the items Today\'s model returns', () => {
  const R = fileURLToPath(new URL('../../livon/', import.meta.url));
  const code = `
    const vm = require('node:vm'), fs = require('node:fs'), path = require('node:path'); const R = ${JSON.stringify(R)};
    const run = (y, mo, d, hh, mi, ss) => {
      const fixed = new Date(y, mo, d, hh, mi, ss).getTime();
      const m = new Map(); const ls = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; } };
      const els = new Map(); const el = s => { if (!els.has(s)) els.set(s, { innerHTML: '', style: {}, classList: { add() {} }, addEventListener() {}, querySelector: () => null, getBoundingClientRect: () => ({ top: 0, bottom: 0 }) }); return els.get(s); };
      const ctx = { localStorage: ls, sessionStorage: ls, location: { hash: '#livon-home' }, navigator: {}, URL, history: { replaceState() {}, pushState() {} }, setTimeout: () => 0, console, addEventListener() {}, scrollTo() {}, innerHeight: 800,
        matchMedia: () => ({ matches: true }), getComputedStyle: () => ({ getPropertyValue: () => '74px' }),
        document: { readyState: 'complete', documentElement: { dataset: { lvView: 'home' } }, getElementById: () => null, querySelector: s => (/^\\[data-lv-hm|^#livon-home/.test(s) ? el(s) : null), querySelectorAll: () => [], addEventListener() {}, contains: () => false } };
      ctx.window = ctx; vm.createContext(ctx);
      vm.runInContext('(function(){ var R = Date; var F = ' + fixed + '; function D(a,b,c,d,e,f,g){ if (!(this instanceof D)) return new R(F).toString(); var n = arguments.length; return n === 0 ? new R(F) : n === 1 ? new R(a) : new R(a, b, c || 1, d || 0, e || 0, f || 0, g || 0); } D.now = function(){ return F; }; D.parse = R.parse; D.UTC = R.UTC; D.prototype = R.prototype; Date = D; })()', ctx);
      for (const f of ['data/livon-user-data.js', 'life-now-data.js', 'life-now-hub.js', 'life-now-page.js']) vm.runInContext(fs.readFileSync(path.join(R, f), 'utf8'), ctx);
      ls.setItem('livon.mlStore.v1', JSON.stringify({ v: 2, todos: [
        { id: 'a', title: 'T-oct31', due: '2026-10-31' }, { id: 'b', title: 'T-nov01', due: '2026-11-01' }, { id: 'c', title: 'T-dec31', due: '2026-12-31' }, { id: 'd', title: 'T-jan01', due: '2027-01-01' }],
        events: [{ id: 'e1', title: 'E-oct31', date: '2026-10-31', start: '10:00' }, { id: 'e2', title: 'E-nov01', date: '2026-11-01', start: '10:00' }], habits: [{ id: 'h1', title: 'R-daily', freq: 'daily' }], habitLogs: {} }));
      vm.runInContext(fs.readFileSync(path.join(R, 'home-page.js'), 'utf8'), ctx);
      const html = el('[data-lv-hm-v2="today"]').innerHTML, up = el('[data-lv-hm-v2="mylife"]').innerHTML;
      const model = ctx.LivonMyLife.api.today(vm.runInContext('new Date()', ctx));
      const names = s => (s.match(/[TER]-[a-z0-9]+/g) || []).join(',');
      return [ (html.match(/datetime="([^"]+)"/) || [])[1], model.date, names(html), names(up), model.todos.length + '/' + model.events.length + '/' + model.routines.length ];
    };
    console.log(JSON.stringify({ lastSecond: run(2026, 9, 31, 23, 59, 59), firstSecond: run(2026, 10, 1, 0, 0, 0), yearEnd: run(2026, 11, 31, 23, 59, 0), yearStart: run(2027, 0, 1, 0, 1, 0) }));`;
  const want = {
    lastSecond: ['2026-10-31', '2026-10-31', 'T-oct31,E-oct31,R-daily', 'E-nov01,T-nov01', '1/1/1'],
    firstSecond: ['2026-11-01', '2026-11-01', 'T-nov01,E-nov01,R-daily', '', '1/1/1'],
    yearEnd: ['2026-12-31', '2026-12-31', 'T-dec31,R-daily', 'T-jan01', '1/0/1'],
    yearStart: ['2027-01-01', '2027-01-01', 'T-jan01,R-daily', '', '1/0/1']
  };
  for (const TZ of ['Asia/Seoul', 'UTC', 'America/Los_Angeles']) {
    const r = spawnSync(process.execPath, ['-e', code], { env: { ...process.env, TZ }, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout.trim().split('\n').pop()), want, TZ);
  }
});

/* ───────── 내 생활 ───────── */
test('HOME-V2-06 내 생활: the same 다가오는 7일 list as Today and goals in progress with counted (never invented) progress', () => {
  const h = home();
  const T = h.ctx.LivonMyLife._test;
  T.saveEvent({ title: '집 보러 가기', date: day(1), start: '14:00' });
  T.saveTodo({ title: '전입신고', due: day(3) });
  const g = T.saveGoal({ title: '독립 준비' }).item; T.saveGoal({ title: '끝낸 목표', status: '완료' });
  const t1 = T.saveTodo({ title: '보증금 모으기', goalId: g.id }).item; T.saveTodo({ title: '짐 정리', goalId: g.id }); T.setTodoDone(t1.id, true);
  h.boot();
  const html = h.html(SEL.mylife), t = text(html);
  const m = h.ctx.LivonMyLife.api.today(new Date());
  assert.equal(m.upcoming.map(x => x.title).join('|'), '집 보러 가기|전입신고');
  assert.match(t, /다가오는 7일/); assert.match(t, /집 보러 가기.*일정 · 14:00/); assert.match(t, /전입신고.*할 일 마감/);
  assert.match(t, /진행 중인 목표 독립 준비 연결한 할 일 1 \/ 2/); assert.doesNotMatch(t, /끝낸 목표/);
  assert.doesNotMatch(t, /%|점수|달성률|\d+점/, 'no score or percentage');
  hrefs(html).forEach(x => assert.match(x, /^#ml-(calendar|todos|goals)$/));
  assert.match(HUB, /<a class="lv-hm-hub__more" href="#life-now">내 생활 전체 보기<\/a>/);
  /* Home only reads My Life: no add / edit / delete control */
  assert.equal(/saveTodo|saveGoal|saveEvent|setTodoDone|setRoutineDone|removeItem|<input type=\\"checkbox/.test(CODE), false);
});

/* ───────── 생애주기 ───────── */
test('HOME-V2-07 Life Stage: shown only for the stage the person chose; nothing is inferred; Home never stores a stage', () => {
  /* other signals but no chosen stage → no stage is shown */
  const none = home({ local: { 'livon.lifeInterests': ['육아', '은퇴'], 'livon.hmRegion': '서울', 'livon.lifeEvents': ['retire'] } });
  none.ctx.LivonMyLife._test.saveTodo({ title: '연금 알아보기', due: day(0) });
  none.boot();
  const empty = none.html(SEL.stage);
  assert.match(text(empty), /아직 라이프 스테이지를 고르지 않았어요\. 고르기 전에는 어떤 단계도 짐작해서 보여 주지 않아요\./);
  assert.match(empty, /data-lv-hm-onboard>내 라이프 스테이지 설정하기<\/button>/);
  assert.doesNotMatch(text(empty), /\d0대/, 'STAGE INFERENCE = 0');
  const h = home({ local: { 'livon.lifeStage': '20', 'livon.lifeInterests': ['주거'], 'livon.lifeHub.checklist.v1': { '20s.first-job': { c1: true, c2: true } } } });
  h.boot();
  const html = h.html(SEL.stage), t = text(html);
  assert.match(t, /^20대 독립과 도전/);
  assert.match(t.split('진행 중인 체크리스트')[0], /이 단계의 주제 첫 독립 준비/, 'the chosen interest (주거) orders the housing topic first');
  assert.match(t, /진행 중인 체크리스트 첫 취업 준비 2 \/ \d+ 진행/);
  assert.match(t, /관련 서비스/);
  assert.ok(hrefs(html).filter(x => /^#life\/20s\/[\w-]+$/.test(x)).length >= 2, 'topic and checklist rows open the Life Stage topic');
  assert.ok(hrefs(html).includes('#life/20s') && hrefs(html).includes('#life-events'));
  assert.match(html, /data-lv-hm-onboard aria-label="라이프 스테이지 변경">변경<\/button>/);
  assert.equal(LIFE.stages.length, 7);
  assert.equal((CODE.match(/KEY_STAGE/g) || []).length, 2, 'the stage key is declared and read once — never written');
});

/* ───────── 발견 ───────── */
test('HOME-V2-08 발견: real Today / Explore items in their own order, the ordering rule is said, nothing is called a recommendation', () => {
  const plain = home(); plain.boot();
  const a = plain.html(SEL.discover), ids = hrefs(a);
  const today = [...plain.ctx.LivonTodayData.contents].map(c => '#today/' + c.id), explore = [...plain.ctx.LivonExploreData.items].map(c => '#ex-item-' + c.id);
  assert.equal(ids.length, 4, 'two + two previews, not the whole feed');
  ids.forEach(x => assert.ok(today.includes(x) || explore.includes(x), x + ' is a registered item'));
  assert.deepEqual(ids.slice(0, 2), today.slice(0, 2), 'no interests → the registered order');
  assert.deepEqual(ids.slice(2), explore.slice(0, 2));
  assert.match(text(a), /등록된 순서대로 보여요\. 순위나 점수는 없어요\./);
  const tagged = home({ local: { 'livon.lifeInterests': ['베이킹'] } }); tagged.boot();
  const b = tagged.html(SEL.discover), first = hrefs(b);
  const hit = [...tagged.ctx.LivonTodayData.contents].filter(c => (c.tags || []).concat(c.title, c.category).join(' ').includes('베이킹')).map(c => '#today/' + c.id);
  assert.ok(hit.length && hit.includes(first[0]), 'a chosen interest word moves matching items first');
  assert.match(text(b), /내가 고른 관심사\(베이킹\)의 낱말이 들어 있는 항목을 먼저/);
  const again = home({ local: { 'livon.lifeInterests': ['베이킹'] } }); again.boot();
  assert.deepEqual(hrefs(again.html(SEL.discover)), first, 'deterministic');
  assert.match(HUB, /href="#today">오늘의 발견 전체 보기<\/a><a class="lv-hm-hub__more" href="#explore">탐색 전체 보기<\/a>/);
});

test('HOME-V2-09 wording and ranking: no "추천", no rank numbers, no popularity, rating or activity numbers on the hub', () => {
  const h = home({ local: { 'livon.lifeStage': '30', 'livon.lifeInterests': ['여행'] }, posts: [{ id: 'p1', title: '첫 글', type: 'tip', createdAt: 1, visibility: 'public' }, { id: 'p2', title: '둘째 글', type: 'question', createdAt: 2, visibility: 'public' }] });
  h.ctx.LivonPlatform.saveItem({ type: 'content', id: 'td:x', title: '저장 하나', href: '#today/place-namsan' });
  h.boot();
  const dynamic = allHtml(h);
  const said = text(dynamic) + ' ' + text(HUB) + ' ' + text(SECTION.slice(SECTION.indexOf('id="hm-connect"'), SECTION.indexOf('id="hm-meaning"')));
  assert.doesNotMatch(said, /추천|맞춤|인기|랭킹|순위 \d|TOP|베스트|평점|별점|★|조회수|\d+명|실시간/, 'RECOMMENDATION WORDING = 0, FAKE RANKING = 0');
  assert.doesNotMatch(dynamic, /<(em|span)[^>]*>\s*0\d\s*<\//, 'no 01 / 02 / 03 row numbers');
  assert.equal(/padStart\(2, "0"\)|String\(i \+ [12]\)/.test(CODE), false, 'no numbering code for rows');
  assert.equal(SRC.includes('추천'), false, 'the word is not in the Home script at all');
  assert.equal(/AI가 (분석|추천)|분석했|맞춤 추천/.test(SECTION), false);
});

/* ───────── 저장한 것 ───────── */
test('HOME-V2-10 저장한 것: only the shared saves through LivonPlatform, the three most recent, and the way to the full list', () => {
  const empty = home(); empty.boot();
  assert.match(text(empty.html(SEL.saved)), /저장한 항목이 없어요\./);
  const h = home();
  ['하나', '둘', '셋', '넷', '다섯', '여섯'].forEach((name, i) => h.saves.set('s' + i, { id: 's' + i, title: name, href: i === 2 ? 'https://example.com/x' : '#today/place-namsan', source: '오늘의 발견', savedAt: 1000 + i }));
  h.boot();
  const html = h.html(SEL.saved), t = text(html);
  assert.match(t, /저장한 항목 6개 · 최근 저장한 순/);
  assert.deepEqual([...html.matchAll(/<strong>([^<]+)<\/strong>/g)].map(m => m[1]), ['여섯', '다섯', '넷'], 'newest first, at most three');
  assert.deepEqual(hrefs(html), ['#today/place-namsan', '#today/place-namsan', '#today/place-namsan']);
  const out = home(); out.saves.set('o', { id: 'o', title: '밖 링크', href: 'https://example.com/x', savedAt: 9 }); out.boot();
  assert.deepEqual(hrefs(out.html(SEL.saved)), ['#ml-saved'], 'a stored outside link is not followed from Home');
  assert.match(HUB, /<a class="lv-hm-hub__more" href="#ml-saved">저장한 것 전체 보기<\/a>/);
  assert.match(CODE, /P\.listSaves\("all"\)/);
  assert.equal(/saveItem|removeSave|setSaveFolder|toggleSave|clearSaves/.test(CODE), false, 'Home does not save, unsave or clear');
  assert.equal(/api\.saved\(|collectedSaved|KEY_TD_SAVED/.test(CODE), false, 'no second saved path');
  assert.match(read('livon-platform.js'), /var KEY_PLATFORM = "livon\.platform\.v1";/);
});

/* ───────── Community / AI ───────── */
test('HOME-V2-11 Community: this device\'s public posts, newest first, without numbers or activity claims', () => {
  const posts = [
    { id: 'p1', title: '이사 체크리스트 공유', body: '짐 정리 순서', type: 'tip', createdAt: 1, visibility: 'public' },
    { id: 'p2', title: '첫 월세 계약 질문', body: '보증금', type: 'question', createdAt: 5, visibility: 'public' },
    { id: 'p3', title: '비공개 메모', type: 'story', createdAt: 9, visibility: 'private' },
    { id: 'p4', title: '회원 공개', type: 'story', createdAt: 8, visibility: 'members' },
    { id: 'p5', title: '임시 저장', type: 'story', createdAt: 7, draft: true }
  ];
  const h = home({ posts }); h.boot();
  const html = h.html(SEL.community);
  assert.deepEqual(hrefs(html), ['#cm-post-p2', '#cm-post-p1']);
  assert.doesNotMatch(html, /비공개|회원 공개|임시 저장|보증금|짐 정리 순서/);
  assert.match(text(html), /이 기기에 있는 공개 글을 최근 순으로 보여요\./);
  assert.match(html, /<small>질문<\/small>/);
  const none = home(); none.boot();
  assert.match(none.html(SEL.community), /아직 공개 게시글이 없어요[\s\S]*href="#cm-write"/);
});

test('HOME-V2-12 AI: a small way in; the question is only placed as a draft; nothing from the hub goes with it; no AI call from Home', () => {
  const h = home({ local: { 'livon.lifeStage': '30' } });
  h.ctx.LivonMyLife._test.saveTodo({ title: '비밀 할 일', due: day(0) });
  h.ctx.LivonPlatform.saveItem({ type: 'content', id: 'td:x', title: '비밀 저장', href: '#today/place-namsan' });
  h.boot();
  const click = (attrs) => {
    const target = { closest: sel => { const m = sel.match(/^\[([\w-]+)\]$/); return m && m[1] in attrs ? { getAttribute: k => attrs[k], textContent: '' } : null; } };
    (h.listeners.click || []).forEach(f => f({ target, preventDefault() {} }));
  };
  click({ 'data-lv-hm-aiq': '이번 주 해야 할 일을 정리해 줘.' });
  assert.equal(h.ctx.location.hash, 'ai-chat');
  const raw = h.ctx.sessionStorage.getItem('livon.aiPrompt'), handed = JSON.parse(raw);
  assert.deepEqual(Object.keys(handed).sort(), ['at', 'draftOnly', 'q', 'source']);
  assert.equal(handed.q, '이번 주 해야 할 일을 정리해 줘.'); assert.equal(handed.draftOnly, true, 'draft only — LIVON AI never auto-sends');
  assert.doesNotMatch(raw, /비밀 할 일|비밀 저장/, 'no hub data in the hand-off');
  assert.doesNotMatch(SRC, /startChat|sendMessage|\/api\/livon|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/, 'Home makes no request of its own');
  assert.match(SRC, /location\.hash = q \? "ex-results\?q=" \+ encodeURIComponent\(q\) : "explore";/);
  click({ 'data-lv-hm-onboard': '' });
  assert.equal(h.ctx._onboard, 1, 'stage setup opens the shared onboarding dialog');
  assert.match(SECTION, /질문은 LIVON AI 대화 화면의 입력란에 옮겨 적기만 해요\. 자동으로 보내지 않고, 홈의 내 기록도 함께 보내지 않아요\./);
  const AI = read('ai-page.js');
  assert.match(AI, /fillPrompt\(data\.q\.slice\(0, LIMITS\.message\)\);/); assert.match(AI, /자동으로 보내지 않습니다/);
});

/* ───────── isolation ───────── */
test('HOME-V2-13 section isolation: a section that throws shows its own message and every other section is still drawn', () => {
  const cases = {
    today: h => { h.ctx.LivonMyLife.api.today = () => { throw new Error('boom'); }; },
    saved: h => { h.ctx._savesThrow = true; },
    discover: h => { h.ctx.LivonTodayData.contents = [{ title: 'x', get id() { throw new Error('bad row'); } }]; },
    community: h => { h.ctx.LivonCommunityData = { get typeLabels() { throw new Error('bad labels'); } }; }
  };
  for (const [broken, breakIt] of Object.entries(cases)) {
    const h = home({ local: { 'livon.lifeStage': '20' }, posts: [{ id: 'p1', title: '글', type: 'tip', createdAt: 1, visibility: 'public' }] });
    h.ctx.LivonMyLife._test.saveTodo({ title: '오늘 것', due: day(0) });
    h.saves.set('s', { id: 's', title: '저장 하나', href: '#today/place-namsan', savedAt: 1 });
    h.ctx.console = { error() {}, log() {}, warn() {} };
    breakIt(h);
    assert.doesNotThrow(() => h.boot(), broken);
    for (const name of Object.keys(SEL)) assert.ok(h.html(SEL[name]).length > 0, broken + ' broken → ' + name + ' still has content');
    if (broken === 'today') {
      assert.match(text(h.html(SEL.today)), /내 생활 정보를 불러오지 못했어요/); assert.match(text(h.html(SEL.mylife)), /내 생활 정보를 불러오지 못했어요/);
    } else assert.match(text(h.html(SEL.today)), /오늘 할 일 1개 중 0개 완료/, broken + ': 오늘 is unaffected');
    if (broken !== 'saved') assert.match(text(h.html(SEL.saved)), /저장 하나/, broken + ': 저장한 것 is unaffected');
    else assert.match(text(h.html(SEL.saved)), /이 영역을 지금 보여 드리지 못했어요/);
    if (broken === 'discover') assert.match(text(h.html(SEL.discover)), /이 영역을 지금 보여 드리지 못했어요/);
    if (broken === 'community') assert.match(text(h.html(SEL.community)), /이 영역을 지금 보여 드리지 못했어요/);
    assert.match(text(h.html(SEL.stage)), /^20대/, broken + ': 생애주기 is unaffected');
    /* the introduction under the hub is drawn too */
    assert.ok(h.html('[data-lv-hm-svc-panel]').length > 0 && h.html('[data-lv-hm-stage-tabs]').length > 0, broken);
  }
  assert.match(CODE, /ORDER\.forEach\(safe\);/);
  assert.match(CODE, /try \{ s\.fn\(host\); return true; \}\s*catch \(e\) \{/);
});

test('HOME-V2-14 malformed stored data: broken rows are skipped, broken JSON falls back, nothing invented, no crash', () => {
  const h = home();
  h.ctx.localStorage.setItem('livon.lifeStage', '{not json');
  h.ctx.localStorage.setItem('livon.lifeInterests', '"just a string"');
  h.ctx.localStorage.setItem('livon.lifeHub.checklist.v1', '[1,2,3]');
  h.ctx._savesRaw = [null, 7, 'text', {}, { id: 'ok', title: '정상 저장', href: 'javascript:alert(1)', savedAt: 5 }, { id: 'no-title' }, { title: 'no id' }];
  h.ctx.LivonCommunityRepo = { visiblePosts: () => [null, { id: 'p1' }, { id: 'p2', title: '<img src=x onerror=1>', type: 'tip', createdAt: 2, visibility: 'public' }] };
  assert.doesNotThrow(() => h.boot());
  const saved = h.html(SEL.saved);
  assert.match(text(saved), /저장한 항목 1개/); assert.deepEqual(hrefs(saved), ['#ml-saved'], 'a javascript: link is never used');
  assert.match(text(h.html(SEL.stage)), /아직 라이프 스테이지를 고르지 않았어요/);
  const cm = h.html(SEL.community);
  assert.deepEqual(hrefs(cm), ['#cm-post-p2']); assert.doesNotMatch(cm, /<img/); assert.match(cm, /&lt;img src=x onerror=1&gt;/);
  /* a broken My Life store: the cards say so or show nothing-today; the rest stay */
  const b = home();
  b.ctx.localStorage.setItem('livon.mlStore.v1', '{"todos":"oops","events":7,"habits":null');
  b.ctx.console = { error() {}, log() {}, warn() {} };
  assert.doesNotThrow(() => b.boot());
  for (const name of Object.keys(SEL)) assert.ok(b.html(SEL[name]).length > 0, name);
});

test('HOME-V2-15 empty device: truthful empty states and the ways to start; no invented content or numbers', () => {
  const h = home(); h.boot();
  assert.match(text(h.html(SEL.today)), /오늘 할 일 없음.*오늘 일정 없음.*오늘 루틴 없음.*오늘 마감인 할 일, 오늘 일정, 오늘 루틴이 없어요\./);
  assert.match(text(h.html(SEL.mylife)), /앞으로 7일 동안 예정된 일정·마감이 없고, 진행 중인 목표도 없어요\./);
  assert.deepEqual(hrefs(h.html(SEL.mylife)), ['#ml-calendar', '#ml-goals']);
  assert.match(text(h.html(SEL.stage)), /아직 라이프 스테이지를 고르지 않았어요/);
  assert.match(text(h.html(SEL.saved)), /저장한 항목이 없어요/);
  assert.match(h.html(SEL.community), /아직 공개 게시글이 없어요/);
  assert.doesNotMatch(text(allHtml(h)), /조회수|인기 \d|평점|★|명이 (?:참여|저장)|\d+명/, 'no invented popularity or ratings');
  /* static HTML carries no personal data: every hub body is empty until the script fills it on the device */
  assert.equal((HUB.match(/<div class="lv-hm-hub__body" [^>]+><\/div>/g) || []).length, 5);
});

/* ───────── routing / privacy / performance / a11y ───────── */
test('HOME-V2-16 every home link and CTA routes to a real LIVON view (no dead links)', () => {
  const view = livonView();
  const h = home({ local: { 'livon.lifeStage': '30' } });
  h.ctx.LivonMyLife._test.saveTodo({ title: '할 일', due: day(0) }); h.ctx.LivonMyLife._test.saveGoal({ title: '목표' });
  h.saves.set('s', { id: 's', title: '저장', href: '#today/place-namsan', savedAt: 1 });
  h.boot();
  const all = hrefs(SECTION).concat(...[...h.els.values()].map(e => hrefs(e.innerHTML)));
  const inPage = new Set([...SECTION.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  assert.ok(all.length > 30);
  const GUIDES = ['/livon/life/', '/livon/life-events/', '/livon/help/'];
  assert.deepEqual(all.filter(x => !x.startsWith('#')), GUIDES);
  const VIEW_OF = { '#td-mytoday': 'today', '#today': 'today', '#life-now': 'life-now', '#ml-saved': 'life-now', '#ml-todos?filter=today': 'life-now', '#ml-calendar': 'life-now', '#ml-routines': 'life-now', '#ml-goals': 'life-now', '#explore': 'explore', '#life/30s': 'life', '#life-events': 'life', '#community': 'community' };
  for (const x of all.filter(x => x.startsWith('#'))) {
    const hsh = x.slice(1);
    assert.ok(hsh.length, 'no href="#"');
    if (view(hsh) === 'home') assert.ok(hsh === 'livon-home' || inPage.has(hsh) || /^hm-/.test(hsh), 'routable: ' + x);
    if (VIEW_OF[x]) assert.equal(view(hsh.split('?')[0]), VIEW_OF[x], x);
  }
  for (const must of Object.keys(VIEW_OF)) assert.ok(all.includes(must), must + ' is offered');
  const start = SECTION.slice(SECTION.indexOf('id="hm-start"'));
  for (const target of ['#life', '#today', '#life-now', '#explore', '#community', '#livon-ai']) assert.ok(start.includes('href="' + target + '"'), target);
  assert.ok(INDEX.includes('id="td-mytoday"'), 'the 오늘 card opens Today\'s own 내 오늘');
});

test('HOME-V2-17 privacy: personal text stays on the screen — not in the static HTML, URLs, storage writes or any request', () => {
  const h = home({ local: { 'livon.lifeStage': '40', 'livon.lifeInterests': ['건강'] } });
  const T = h.ctx.LivonMyLife._test;
  T.saveTodo({ title: 'PRIVATE-TODO', due: day(0) }); T.saveEvent({ title: 'PRIVATE-EVENT', date: day(0) }); T.saveHabit({ title: 'PRIVATE-ROUTINE' });
  T.saveGoal({ title: 'PRIVATE-GOAL' }); h.saves.set('s', { id: 's', title: 'PRIVATE-SAVE', href: '#today/place-namsan', savedAt: 1 });
  let fetched = 0; h.ctx.fetch = () => { fetched++; return Promise.reject(new Error('no')); };
  h.ctx.navigator.sendBeacon = () => { fetched++; };
  const before = h.ctx.location.hash;
  h.boot();
  const shown = text(allHtml(h));
  for (const p of ['PRIVATE-TODO', 'PRIVATE-EVENT', 'PRIVATE-ROUTINE', 'PRIVATE-GOAL', 'PRIVATE-SAVE']) assert.ok(shown.includes(p), p + ' is shown on the device');
  assert.equal(fetched, 0, 'PRIVATE NETWORK = 0: rendering Home makes no request');
  assert.equal(h.ctx.location.hash, before, 'PRIVATE URL = 0: rendering does not change the address');
  for (const href of hrefs(allHtml(h))) assert.doesNotMatch(href, /PRIVATE/, 'no personal text inside a link');
  assert.doesNotMatch(INDEX, /data-lv-hm-v2="[a-z]+">[^<]/, 'PRIVATE STATIC = 0: the hub is empty in the HTML file');
  assert.equal(h.ctx.sessionStorage.getItem('livon.aiPrompt'), null, 'nothing is handed to AI without a question');
  assert.equal(/gtag|dataLayer|analytics|track\(|LivonAnalytics/i.test(CODE), false, 'PRIVATE ANALYTICS = 0: Home has no analytics call');
  /* the static guide pages / sitemap are built from the registered LIVON data, never from a device */
  assert.doesNotMatch(readFileSync(new URL('../../scripts/livon-seo-build.mjs', import.meta.url), 'utf8'), /localStorage|mlStore|platform\.v1/);
});

test('HOME-V2-18 performance: renders once on load, bounded store reads, one day-model call, no new dependency', () => {
  const h = home({ local: { 'livon.lifeStage': '20' } });
  let reads = 0, calls = 0;
  const orig = h.ctx.localStorage.getItem;
  h.ctx.localStorage.getItem = k => { reads++; return orig(k); };
  const today = h.ctx.LivonMyLife.api.today; h.ctx.LivonMyLife.api.today = n => { calls++; return today(n); };
  h.boot();
  assert.ok(reads < 80, 'localStorage reads on first render: ' + reads);
  assert.equal(calls, 1, 'the day model is read once per render');
  assert.match(SRC, /if \(document\.documentElement\.dataset\.lvView === "home"\) onShow\(hash \|\| "livon-home"\);\s*else renderAll\(\);/);
  assert.ok(SRC.length < 45000, 'Home script is smaller than V1 (51 KB): ' + SRC.length);
  assert.doesNotMatch(SRC, /import\(|require\(|document\.createElement\("script"\)/);
  assert.match(SRC, /LivonBoot/);
});

test('HOME-V2-19 accessibility: headings in order, labelled regions, real links and buttons, visible focus, 44px targets, reduced motion', () => {
  /* h1 (hero) → h2 (hub) → h3 (cards) → h4 (inside a card) */
  assert.match(SECTION, /<h1 id="livon-home-title"/);
  assert.match(SECTION, /<section class="lv-hm-sec lv-hm-sec--hub" id="hm-hub" aria-labelledby="hm-hub-title">[\s\S]*?<h2 id="hm-hub-title">오늘의 내 LIVON<\/h2>/);
  for (const id of ['hm-today', 'hm-mylife', 'hm-stage', 'hm-discover', 'hm-saved']) assert.match(HUB, new RegExp('<section class="lv-hm-hub__card[^"]*" id="' + id + '" aria-labelledby="' + id + '-title">\\s*<p class="lv-hm-eyebrow" lang="en">[A-Z ]+</p>\\s*<h3 id="' + id + '-title">'));
  const hubCode = CODE.slice(CODE.indexOf('function note('), CODE.indexOf('function goAi('));
  assert.equal(/<h[12356]\b/.test(hubCode), false, 'cards add h4 only');
  assert.match(SECTION, /<section class="lv-hm-sec lv-hm-sec--connect lv-hm-sec--compact" id="hm-connect" aria-label="커뮤니티">/);
  assert.match(SECTION, /id="hm-ai" aria-labelledby="hm-ai-title">[\s\S]*?<h2 id="hm-ai-title"/);
  assert.match(SECTION, /<label class="visually-hidden" for="hm-ex-q">탐색 검색<\/label>/); assert.match(SECTION, /<label class="visually-hidden" for="hm-ai-q">LIVON AI에게 질문<\/label>/);
  /* navigation is a link, an action is a button */
  assert.equal(/<a[^>]*data-lv-hm-onboard|<div[^>]*(onclick|role=\\"button\\")|<span[^>]*onclick/.test(SRC + SECTION), false);
  assert.match(CSS, /#livon-home :is\(\.lv-hm-hub__stat, \.lv-hm-hub__list a, \.lv-hm-hub__more, \.lv-hm-hub__flag a, \.lv-hm-hub__card \.lv-hm-btn\):focus-visible \{ outline: 2px solid #fff; outline-offset: 3px;/);
  assert.match(CSS, /\.lv-hm-hub__stat,\n#livon-home \.lv-hm-hub__list a \{ display: grid; gap: 0\.15rem; min-height: 2\.75rem;/);
  assert.match(CSS, /\.lv-hm-hub__more \{ display: inline-flex; align-items: center; min-height: 2\.75rem;/);
  assert.match(CSS, /#livon-home \.lv-hm-hub \{ display: grid; grid-template-columns: minmax\(0, 1fr\); gap: 1rem; \}/, 'one column first (mobile)');
  const hubCss = CSS.slice(CSS.indexOf('Home V2: the personal hub')).replace(/^[\s\S]*?\*\//, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.equal(/\b\d+px\b/.test(hubCss.replace(/min-width: (720|1080)px|max-width: 899px|[12]px solid|1px dashed|outline-offset: 3px/g, '')), false, 'hub sizes follow the text size (rem), so 200% text reflows');
  assert.equal(/overflow-x:\s*(auto|scroll|hidden)|white-space:\s*nowrap/.test(hubCss), false, 'nothing is clipped or scrolled sideways');
  assert.equal(/animation|transition/.test(hubCss), false, 'the hub does not move');
  assert.match(SRC, /prefers-reduced-motion: reduce/);
  assert.equal(/data-lv-hm-reveal/.test(HUB), false, 'the hub is visible at once (no reveal-on-scroll)');
});

test('HOME-V2-20 cache: only the two Home assets moved to a new version; every other version is as it was', () => {
  assert.match(INDEX, /<link rel="stylesheet" href="\/livon\/home-page\.css\?v=20261008hv2" \/>/);
  assert.match(INDEX, /<script src="\/livon\/home-page\.js\?v=20261008hv2"><\/script>/);
  assert.equal(/home-page\.(css\?v=20260929hm1|js\?v=20261002perf1)/.test(INDEX), false, 'OLD CACHE REFERENCES = 0');
  assert.equal((INDEX.match(/20261008hv2/g) || []).length, 2, 'MIXED ASSETS = 0');
  for (const kept of ['20261007sv1', '20261007ls1', '20261006ex1', '20261002perf1']) assert.ok(INDEX.includes(kept), kept + ' is unchanged');
  /* today-page.js (c7) moved on later in LIVON Next V1 (?v=20261010nx1) — a later version, never an older one */
  assert.match(INDEX, /today-page\.js\?v=(20261004c7|20261010nx\d)"/);
});
