// LIVON Onboarding V1 — anonymous, optional, local-first personalization (ON-1 … ON-41, persona QA, regressions).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { loadLivon } from '../../scripts/livon-data-quality.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, 'livon', f), 'utf8');
const INDEX = read('index.html');
const K = { meta: 'livon.personalization.v1', stage: 'livon.lifeStage', interests: 'livon.lifeInterests', events: 'livon.lifeEvents', ml: 'livon.mlInterests', platform: 'livon.platform.v1' };

/*
 * The page as the browser loads it, with a stub DOM that is just enough for the onboarding UI:
 * the dialog body is a string (LivonOnboarding renders HTML), clicks are delivered to the delegated listeners.
 */
function app({ local = {}, raw = {}, blocked = false, screens = false } = {}) {
  const listeners = { doc: {}, modal: {}, entry: {} };
  const on = bag => (t, f) => { (bag[t] = bag[t] || []).push(f); };
  let doc;
  const mk = (extra = {}) => {
    const attrs = {};
    return Object.assign({
      hidden: false, innerHTML: '', textContent: '', offsetParent: {}, disabled: false, focused: 0, scrollTop: 0,
      focus() { this.focused++; doc.activeElement = this; },
      querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
      setAttribute(k, v) { attrs[k] = String(v); }, getAttribute: k => (k in attrs ? attrs[k] : null), hasAttribute: k => k in attrs,
      contains: () => false, classList: { toggle() {} }
    }, extra);
  };
  const title = mk(), status = mk(), moreBtn = mk(), close = mk(), panel = mk(), main = mk(), opener = mk();
  const body = mk({ querySelector: s => (s === '#livon-onboard-title' ? title : s === '.lv-ob__status' ? status : s === '[data-ob-more]' ? moreBtn : null) });
  const entry = mk({ hidden: true, addEventListener: on(listeners.entry) });
  const modal = mk({ hidden: true, addEventListener: on(listeners.modal) });
  modal.querySelector = s => (s === '[data-lv-ob-body]' ? body : s === '#livon-onboard-title' ? title : s === '.lv-life-modal__close' ? close : s === '.lv-life-modal__panel' ? panel : null);
  modal.querySelectorAll = () => [close];
  modal.contains = n => n === close || n === title;
  const events = [];
  doc = {
    readyState: 'complete', activeElement: opener, documentElement: { dataset: {} }, body: {}, head: { querySelector: () => null },
    getElementById: id => (id === 'livon-onboard-modal' ? modal : id === 'livon-onboard-entry' ? entry : null),
    querySelector: s => (s === 'main' ? main : null), querySelectorAll: () => [],
    addEventListener: on(listeners.doc), contains: () => true,
    dispatchEvent(e) { events.push(e.type); (listeners.doc[e.type] || []).forEach(f => f(e)); return true; }
  };
  const net = [];
  const ctx = loadLivon({
    patch(c) {
      c.document = doc;
      c.CustomEvent = class { constructor(type) { this.type = type; } };
      c.fetch = (...a) => { net.push(['fetch', String(a[0])]); return Promise.reject(new Error('offline')); };
      c.XMLHttpRequest = function () { net.push(['xhr']); throw new Error('no network in tests'); };
      c.navigator = { sendBeacon: (...a) => { net.push(['beacon', String(a[0])]); return false; } };
      if (blocked) {
        const deny = () => { throw new Error('SecurityError'); };
        Object.defineProperty(c, 'localStorage', { configurable: true, get: deny });
      }
      vm.runInContext(read('data/livon-storage-guard.js'), c, { filename: 'livon-storage-guard.js' });
      for (const [k, v] of Object.entries(local)) c.localStorage.setItem(k, JSON.stringify(v));
      for (const [k, v] of Object.entries(raw)) c.localStorage.setItem(k, v);
      vm.runInContext(read('data/livon-user-data.js'), c, { filename: 'livon-user-data.js' });
    }
  });
  let homeRenders = 0;
  ctx.LivonHome = { render() { homeRenders++; } };
  ctx.setTimeout = f => { f(); return 0; };
  const files = ['livon-platform.js', 'livon-onboarding.js'].concat(screens ? ['today-feed.js', 'community-service.js', 'community-page.js', 'life-now-data.js', 'life-now-page.js'] : []);
  for (const f of files) vm.runInContext(read(f), ctx, { filename: f });
  const target = (attr, value) => {
    const t = mk();
    t.setAttribute(attr, value == null ? '' : value);
    t.closest = sel => { const m = /^\[([\w-]+)\]$/.exec(sel); return m && t.hasAttribute(m[1]) ? t : null; };
    return t;
  };
  const click = (where, attr, value) => {
    const e = { target: target(attr, value), prevented: false, preventDefault() { this.prevented = true; } };
    (listeners[where].click || []).forEach(f => f(e));
    return e.target;
  };
  const key = (k, extra = {}) => {
    const e = Object.assign({ key: k, shiftKey: false, prevented: false, preventDefault() { this.prevented = true; } }, extra);
    (listeners.doc.keydown || []).forEach(f => f(e));
    return e;
  };
  const get = k => { const v = ctx.localStorage.getItem(k); return v == null ? null : JSON.parse(v); };
  return {
    ctx, PZ: ctx.LivonPersonalization, OB: ctx.LivonOnboarding, doc, modal, entry, body, title, status, close, main, opener, moreBtn,
    click, key, get, net, events, homeRenders: () => homeRenders,
    html: () => body.innerHTML,
    start: () => click('entry', 'data-ob-entry-start'),
    pick: (kind, v) => click('modal', 'data-ob-' + kind, v),
    next: () => click('modal', 'data-ob-next'), back: () => click('modal', 'data-ob-back'),
    finish: () => click('modal', 'data-ob-finish'), later: () => click('modal', 'data-ob-later')
  };
}
/* walk the whole flow the way a user would */
function complete(a, { stage = '', interests = [], events = [] } = {}) {
  a.start();
  if (stage) a.pick('stage', stage);
  a.next();
  interests.forEach(i => a.pick('interest', i));
  a.next();
  events.forEach(e => a.pick('event', e));
  a.next();
  a.finish();
}
const chips = (html, attr) => [...html.matchAll(new RegExp(attr + '="([^"]*)" aria-pressed="(true|false)">([^<]*)<', 'g'))].map(m => ({ value: m[1], on: m[2] === 'true', label: m[3] }));
const text = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const DATA = loadLivon();
const PZD = DATA.LivonPersonalization;

test('ON-1 first visit: state NEW, a small arrival note, never a forced dialog', () => {
  const a = app();
  assert.equal(a.PZ.state(), 'NEW');
  assert.equal(a.PZ.entry(), 'welcome');
  assert.equal(a.modal.hidden, true, 'no dialog on arrival');
  assert.equal(a.entry.hidden, false);
  assert.equal(a.entry.getAttribute('data-kind'), 'welcome');
  assert.equal(a.get(K.meta), null, 'arriving writes nothing');
});

test('ON-2 welcome note says what LIVON is, that no sign-up is needed, and offers start / look around', () => {
  const a = app(), t = text(a.entry.innerHTML);
  assert.match(t, /LIVON에 오신 걸 환영해요/);
  assert.match(t, /회원가입 없이 바로 쓸 수 있어요/);
  assert.match(a.entry.innerHTML, /data-ob-entry-start>나에게 맞게 시작하기<[\s\S]*data-ob-entry-skip>먼저 둘러보기</);
  assert.match(INDEX, /<aside class="lv-ob-entry" id="livon-onboard-entry" role="region" aria-labelledby="livon-onboard-entry-title" hidden>/);
});

test('ON-3 "먼저 둘러보기": skipped, the note goes away, nothing is stored about the user', () => {
  const a = app();
  a.click('entry', 'data-ob-entry-skip');
  assert.equal(a.PZ.state(), 'SKIPPED');
  assert.equal(a.entry.hidden, true);
  assert.equal(a.modal.hidden, true);
  const p = a.PZ.getProfile();
  assert.deepEqual([p.lifeStage, p.interests.length, p.lifeEvents.length], ['', 0, 0]);
  assert.equal(a.PZ.entry(), 'none', 'not asked again');
});

test('ON-4 starting opens the dialog at step 1 of 4 and marks IN_PROGRESS', () => {
  const a = app();
  a.start();
  assert.equal(a.modal.hidden, false);
  assert.equal(a.entry.hidden, true);
  assert.equal(a.PZ.state(), 'IN_PROGRESS');
  assert.match(a.html(), /role="progressbar"[^>]*aria-valuemin="1" aria-valuemax="4" aria-valuenow="1"/);
  assert.match(a.html(), /<h2 id="livon-onboard-title" tabindex="-1">연령대를 알려주세요<\/h2>/);
  assert.deepEqual([...a.PZ.STEPS], ['stage', 'interests', 'events', 'preview']);
});

test('ON-5 Life Stage: the seven existing age bands, one choice, can be undone', () => {
  const a = app();
  a.start();
  const list = chips(a.html(), 'data-ob-stage');
  assert.deepEqual(list.map(c => c.value), ['10', '20', '30', '40', '50', '60', '70']);
  assert.deepEqual(list.map(c => c.label), [...a.ctx.LivonLifeData.stages.map(s => s.label)], 'labels come from the existing taxonomy');
  assert.ok(list.every(c => !c.on));
  a.pick('stage', '20');
  assert.equal(a.status.textContent, '선택: 20대');
  a.pick('stage', '30');
  assert.equal(a.OB._state().draft.lifeStage, '30', 'single choice');
  a.pick('stage', '30');
  assert.equal(a.OB._state().draft.lifeStage, '');
  assert.equal(a.status.textContent, '선택을 해제했어요.');
  assert.match(a.html(), /생년월일이나 정확한 나이는 묻지 않아요/);
});

test('ON-6 every step can be passed without choosing anything', () => {
  const a = app();
  a.start();
  a.next(); assert.equal(a.OB._state().step, 'interests');
  a.next(); assert.equal(a.OB._state().step, 'events');
  a.next(); assert.equal(a.OB._state().step, 'preview');
  assert.match(a.html(), /기본 화면으로 시작할게요/);
  a.finish();
  assert.equal(a.PZ.state(), 'COMPLETED');
  assert.equal(a.PZ.recommend().personalized, false, 'an empty profile keeps the generic screens');
});

test('ON-7 interests: only the existing interest list, each option leads to real content, several can be chosen', () => {
  const a = app();
  a.start(); a.next();
  const opts = chips(a.html(), 'data-ob-interest').map(c => c.value);
  assert.ok(opts.length >= 8);
  for (const i of opts) {
    assert.ok(a.ctx.LivonLifeData.interests.includes(i), 'not in the taxonomy: ' + i);
    assert.ok(a.PZ.recommend({ interests: [i] }, { limit: 400 }).items.length > 0, 'no content for ' + i);
  }
  a.pick('interest', '주거'); a.pick('interest', '금융');
  assert.equal(a.status.textContent, '2개 선택했어요.');
  a.pick('interest', '주거');
  assert.deepEqual([...a.OB._state().draft.interests], ['금융']);
});

test('ON-8 interests are capped and cleaned (20 items, 20 characters, no duplicates)', () => {
  const many = Array.from({ length: 30 }, (_, i) => '관심' + i);
  const p = PZD.sanitizeProfile({ interests: many.concat(['관심1', '  주거  ', 'x'.repeat(21), 5, null]) });
  assert.equal(p.interests.length, 20);
  assert.equal(new Set(p.interests).size, 20);
  assert.deepEqual([...PZD.sanitizeProfile({ interests: ['  주거  ', '주거', 'x'.repeat(21), 5] }).interests], ['주거']);
});

test('ON-9 Life Events: the chosen band first, the rest behind "더 보기"', () => {
  const a = app();
  a.start(); a.pick('stage', '20'); a.next(); a.next();
  const ev = a.PZ.eventsFor('20');
  assert.ok(ev.primary.length && ev.primary.every(e => e.stages.includes('20')));
  assert.ok(ev.more.length && ev.more.every(e => !e.stages.includes('20')));
  assert.equal(ev.primary.length + ev.more.length, a.ctx.LivonLifeEvents.events.length, 'the existing catalog, nothing added');
  assert.match(a.html(), /20대에 해당하는 항목을 먼저 보여드려요/);
  assert.match(a.html(), /data-ob-more aria-expanded="false" aria-controls="lv-ob-more">다른 항목 더 보기</);
  assert.match(a.html(), /id="lv-ob-more" role="group" aria-label="다른 Life Event" hidden>/);
  const more = a.click('modal', 'data-ob-more');
  more.setAttribute('aria-expanded', 'false');
  assert.match(a.html(), /aria-expanded="true"[^>]*>다른 항목 접기</);
  assert.ok(a.moreBtn.focused >= 1, 'focus stays on the toggle');
  // without a stage the catalog is still offered
  assert.ok(a.PZ.eventsFor('').primary.length > 0);
});

test('ON-10 Life Events: up to 8, with a spoken limit message', () => {
  const a = app();
  a.start(); a.pick('stage', '20'); a.next(); a.next();
  const ids = a.PZ.eventsFor('20').primary.map(e => e.id).slice(0, 9);
  ids.forEach(id => a.pick('event', id));
  assert.equal(a.OB._state().draft.lifeEvents.length, 8);
  assert.equal(a.status.textContent, '8개까지 고를 수 있어요.');
  assert.equal(PZD.sanitizeProfile({ lifeEvents: DATA.LivonLifeEvents.events.map(e => e.id) }).lifeEvents.length, 8);
});

test('ON-11 preview: the choices and real items per kind, each with the reason it is shown', () => {
  const a = app();
  a.start(); a.pick('stage', '20'); a.next(); a.pick('interest', '주거'); a.next(); a.pick('event', 'first-job'); a.next();
  const h = a.html();
  assert.match(h, /이런 정보를 먼저 보여드릴게요/);
  assert.match(h, /<ul class="lv-ob__picked" aria-label="내 선택"><li>20대<\/li><li>주거<\/li><li>첫 취업<\/li><\/ul>/);
  const pv = a.PZ.preview(a.OB._state().draft);
  assert.ok(pv.groups.length >= 2 && pv.total >= 4);
  for (const g of pv.groups) for (const x of g.items) {
    assert.ok(h.includes('<strong>' + x.title.replace(/&/g, '&amp;') + '</strong>'), x.title);
    assert.ok(x.why && h.includes(x.why));
  }
  assert.match(h, /data-ob-finish>이대로 시작하기</);
});

test('ON-12 preview with nothing chosen: default screen, no invented recommendation', () => {
  const a = app();
  a.start(); a.next(); a.next(); a.next();
  assert.match(a.html(), /기본 화면으로 시작할게요/);
  assert.doesNotMatch(a.html(), /lv-ob__preview/);
  assert.equal(a.PZ.preview({}).total, 0);
});

test('ON-13 a chosen Life Event without content is said plainly; nothing is made up for it', () => {
  const r = PZD.recommend({ lifeStage: '30', lifeEvents: ['freelance'] }, { limit: 400 });
  assert.deepEqual(JSON.parse(JSON.stringify(r.gaps)), [{ id: 'freelance', title: '프리랜서' }]);
  assert.ok(r.items.every(x => !x.reasons.some(y => y.type === 'event')), 'no row claims to be about the event');
  const a = app();
  a.start(); a.pick('stage', '30'); a.next(); a.next(); a.pick('event', 'freelance'); a.next();
  assert.match(a.html(), /‘프리랜서’ 안내는 아직 준비 중이에요\. 다른 선택에 맞는 정보를 먼저 보여드려요\./);
});

test('ON-14 finishing writes the three existing preference keys and refreshes the screens', () => {
  const a = app();
  complete(a, { stage: '20', interests: ['주거', '금융'], events: ['first-job', 'independent'] });
  assert.equal(a.get(K.stage), '20');
  assert.deepEqual(a.get(K.interests), ['주거', '금융']);
  assert.deepEqual(a.get(K.events), ['first-job', 'independent']);
  assert.deepEqual(a.get(K.ml), ['주거', '금융'], 'Explore reads the same interests');
  const m = a.get(K.meta);
  assert.deepEqual([m.version, m.state, m.step, m.draft], [1, 'COMPLETED', '', null]);
  assert.equal(a.get(K.platform).onboarded, true);
  assert.equal(a.modal.hidden, true);
  assert.equal(a.homeRenders(), 1, 'Home re-rendered');
  assert.deepEqual(a.events, ['livon:personalization'], 'other screens are told once');
  assert.equal(a.PZ.getProfile().onboardingCompleted, true);
});

test('ON-15 going back keeps every choice', () => {
  const a = app();
  a.start(); a.pick('stage', '40'); a.next(); a.pick('interest', '건강'); a.next(); a.pick('event', 'checkup');
  a.back();
  assert.equal(a.OB._state().step, 'interests');
  assert.ok(chips(a.html(), 'data-ob-interest').find(c => c.value === '건강').on);
  a.back();
  assert.ok(chips(a.html(), 'data-ob-stage').find(c => c.value === '40').on);
  assert.doesNotMatch(a.html(), /data-ob-back/, 'no back button on the first step');
  a.next(); a.next();
  assert.ok(chips(a.html(), 'data-ob-event').find(c => c.value === 'checkup').on);
});

test('ON-16 closing (Escape / × / backdrop) keeps the progress and offers to resume — also after a reload', () => {
  const a = app();
  a.start(); a.pick('stage', '30'); a.next(); a.pick('interest', '가족'); a.next();
  assert.equal(a.key('Escape').prevented, true);
  assert.equal(a.modal.hidden, true);
  assert.equal(a.PZ.state(), 'IN_PROGRESS');
  assert.equal(a.entry.getAttribute('data-kind'), 'resume');
  assert.match(a.entry.innerHTML, /이어서 하기/);
  assert.equal(a.get(K.stage), null, 'nothing is applied until the user finishes');
  // a new page load on the same device
  const b = app({ local: { [K.meta]: a.get(K.meta) } });
  assert.equal(b.PZ.entry(), 'resume');
  b.start();
  assert.equal(b.OB._state().step, 'events');
  assert.equal(b.OB._state().draft.lifeStage, '30');
  assert.deepEqual([...b.OB._state().draft.interests], ['가족']);
  b.click('modal', 'data-lv-onboard-close');
  assert.equal(b.modal.hidden, true);
  assert.equal(b.PZ.state(), 'IN_PROGRESS');
  // "그만두기" on the resume note stops asking
  b.click('entry', 'data-ob-entry-skip');
  assert.equal(b.PZ.state(), 'SKIPPED');
});

test('ON-17 "나중에 할게요" is on every step; it skips without limiting anything', () => {
  const a = app();
  a.start();
  for (let i = 0; i < 4; i++) { assert.match(a.html(), /data-ob-later>나중에 할게요</); if (i < 3) a.next(); }
  a.later();
  assert.equal(a.modal.hidden, true);
  assert.equal(a.PZ.state(), 'SKIPPED');
  assert.equal(a.get(K.platform).onboardSkipped, true);
  assert.equal(a.get(K.stage), null);
  // every screen stays reachable: personalization only re-orders, the generic lists are untouched
  assert.equal(a.PZ.recommend().items.length, 0);
  assert.equal(a.PZ.allowedIds(''), null);
});

test('ON-18 after completing or skipping, the note is not shown again', () => {
  for (const state of ['COMPLETED', 'SKIPPED']) {
    const a = app({ local: { [K.meta]: { version: 1, state, step: '', draft: null, updatedAt: 1 } } });
    assert.equal(a.PZ.entry(), 'none');
    assert.equal(a.entry.hidden, true, state);
    assert.equal(a.modal.hidden, true);
  }
});

test('ON-19 a device that already has LIVON data gets a short invitation; its data is kept', () => {
  const saves = [{ type: 'content', id: 'ex:ex-career24', title: '고용24', href: '#ex-item-ex-career24', savedAt: 1 }];
  const ml = { v: 3, todos: [{ id: 't1', title: '서류 준비' }], goals: [] };
  const a = app({ local: { [K.platform]: { saves }, 'livon.mlStore.v1': ml } });
  assert.equal(a.PZ.hasExistingData(), true);
  assert.equal(a.PZ.entry(), 'invite');
  assert.equal(a.modal.hidden, true, 'never blocks an existing user');
  assert.match(a.entry.innerHTML, /지금 쓰던 내용은 그대로예요/);
  complete(a, { stage: '50', interests: ['건강'] });
  assert.deepEqual(a.get(K.platform).saves, saves);
  assert.deepEqual(a.get('livon.mlStore.v1').todos, ml.todos);
  // an existing preference is the starting point, not overwritten by an empty draft
  const b = app({ local: { [K.stage]: '40', [K.interests]: ['여행'] } });
  assert.equal(b.PZ.entry(), 'invite');
  b.start();
  assert.equal(b.OB._state().draft.lifeStage, '40');
  assert.deepEqual([...b.OB._state().draft.interests], ['여행']);
});

test('ON-20 the old one-screen onboarding flags are honoured', () => {
  assert.equal(app({ local: { [K.platform]: { onboarded: true } } }).PZ.state(), 'COMPLETED');
  const s = app({ local: { [K.platform]: { onboardSkipped: true } } });
  assert.equal(s.PZ.state(), 'SKIPPED');
  assert.equal(s.entry.hidden, true);
  const src = read('livon-platform.js');
  assert.doesNotMatch(src, /needsOnboarding|completeOnboarding|ONBOARD_GOALS/, 'the old flow is gone, not duplicated');
  assert.match(src, /function openOnboarding\(opts\)/);
});

test('ON-21 profile schema: versioned, three fields, state and timestamp', () => {
  const a = app();
  complete(a, { stage: '60', interests: ['건강'], events: ['later-life'] });
  const p = a.PZ.getProfile();
  assert.deepEqual(Object.keys(p).sort(), ['interests', 'lifeEvents', 'lifeStage', 'onboardingCompleted', 'state', 'updatedAt', 'version']);
  assert.equal(p.version, 1);
  assert.equal(a.PZ.VERSION, 1);
  assert.ok(p.updatedAt > 0);
  assert.deepEqual([...a.PZ.STATES], ['NEW', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']);
  assert.deepEqual(Object.keys(a.get(K.meta)).sort(), ['draft', 'state', 'step', 'updatedAt', 'version']);
});

test('ON-22 only Life Stage, interests and Life Events are ever stored — nothing sensitive is asked', () => {
  const p = PZD.sanitizeProfile({ lifeStage: '25', interests: ['주거'], lifeEvents: ['first-job', 'nope', '<x>'], name: '홍길동', birth: '1999-01-01', phone: '010', email: 'a@b.c', income: 1 });
  assert.deepEqual(JSON.parse(JSON.stringify(p)), { lifeStage: '', interests: ['주거'], lifeEvents: ['first-job'] });
  assert.equal(PZD.sanitizeProfile({ lifeStage: { id: 20 } }).lifeStage, '20', 'an older stored shape is read');
  // the UI asks no sensitive question
  const a = app();
  a.start();
  let all = text(a.entry.innerHTML);
  for (let i = 0; i < 4; i++) { all += ' ' + text(a.html()); if (i < 3) a.next(); }
  assert.doesNotMatch(all.replace('생년월일이나 정확한 나이는 묻지 않아요', ''), /실명|이름을|생년월일|전화번호|이메일|주소|회사명|소득|자산|질병|정치|종교/);
  assert.doesNotMatch(read('livon-onboarding.js'), /<input|<textarea|<select/, 'no free-text field');
});

test('ON-23 damaged storage is recovered: a first-visit state, no error', () => {
  const a = app({ raw: { [K.meta]: '{not json', [K.stage]: '"abc"', [K.interests]: '{"a":1}', [K.events]: '[1,null,"first-job","zzz"]', [K.platform]: '[]' } });
  assert.equal(a.PZ.state(), 'NEW');
  const p = a.PZ.getProfile();
  assert.equal(p.lifeStage, '');
  assert.deepEqual([...p.interests], []);
  assert.deepEqual([...p.lifeEvents], ['first-job']);
  complete(a, { stage: '20' });
  assert.equal(a.PZ.state(), 'COMPLETED');
  for (const bad of ['null', '[]', '"x"', '{"version":1,"state":"DONE","step":"zz","draft":"x","updatedAt":"y"}']) {
    const b = app({ raw: { [K.meta]: bad } });
    assert.equal(b.PZ.state(), 'NEW', bad);
    assert.deepEqual(JSON.parse(JSON.stringify(b.PZ.draft())), { step: 'stage', draft: null });
  }
});

test('ON-24 profile versioning: an unknown version is ignored, an unversioned record is migrated', () => {
  const future = app({ local: { [K.meta]: { version: 99, state: 'COMPLETED', step: 'events', draft: { lifeStage: '20' } } } });
  assert.equal(future.PZ.state(), 'NEW');
  const old = app({ local: { [K.meta]: { state: 'IN_PROGRESS', step: 'interests', draft: { lifeStage: '30', interests: ['건강'] }, updatedAt: 5 } } });
  assert.equal(old.PZ.state(), 'IN_PROGRESS');
  assert.equal(old.PZ.draft().step, 'interests');
  old.start();
  assert.equal(old.get(K.meta).version, 1, 'rewritten in the current version');
  assert.equal(old.OB._state().draft.lifeStage, '30');
});

test('ON-25 blocked browser storage: the flow still works for this tab and says the choice may not be kept', () => {
  const a = app({ blocked: true });
  assert.deepEqual([...a.ctx.LIVON_STORAGE_FALLBACK], ['localStorage']);
  assert.equal(a.PZ.storageIsTemporary(), true);
  a.start();
  assert.match(a.html(), /이 브라우저에서는 저장이 막혀 있어, 창을 닫으면 선택한 내용이 사라질 수 있어요\./);
  a.pick('stage', '20'); a.next(); a.next(); a.next(); a.finish();
  assert.equal(a.PZ.getProfile().lifeStage, '20');
  assert.equal(app().PZ.storageIsTemporary(), false);
  assert.doesNotMatch((() => { const n = app(); n.start(); return n.html(); })(), /저장이 막혀/);
});

test('ON-26 storage: one new device-only key; the profile reuses the existing preference keys and the storage layer', () => {
  const UD = app().ctx.LivonUserData;
  assert.equal(UD.classify(K.meta), 'DEVICE_LOCAL');
  for (const k of [K.stage, K.interests, K.events]) assert.equal(UD.classify(k), 'ACCOUNT_SYNC', k);
  const src = read('livon-personalization.js');
  const keys = [...new Set([...src.matchAll(/"(livon\.[\w.]+)"/g)].map(m => m[1]))];
  assert.deepEqual(keys.filter(k => UD.classify(k) === 'UNKNOWN'), [], 'every key is in the inventory');
  assert.match(src, /UD\.read\(key, fb\)/);
  assert.match(src, /UD\.write\(key, value\)/);
  // a fresh completion writes exactly these keys
  const a = app();
  const before = new Set(Array.from({ length: a.ctx.localStorage.length }, (_, i) => a.ctx.localStorage.key(i)));
  complete(a, { stage: '20', interests: ['주거'], events: ['independent'] });
  const added = Array.from({ length: a.ctx.localStorage.length }, (_, i) => a.ctx.localStorage.key(i)).filter(k => !before.has(k)).sort();
  assert.deepEqual(added, [K.events, K.interests, K.stage, K.ml, K.meta].sort());
});

test('ON-27 recommendation engine: local, rule-based and deterministic', () => {
  assert.equal(PZD.ENGINE, 'LOCAL RULE-BASED');
  const prof = { lifeStage: '30', interests: ['금융', '건강'], lifeEvents: ['home-buy', 'parenting'] };
  const one = JSON.stringify(PZD.recommend(prof, { limit: 50 })), two = JSON.stringify(PZD.recommend(prof, { limit: 50 }));
  assert.equal(one, two);
  assert.equal(JSON.parse(one).method, 'rule-based');
  assert.equal(JSON.stringify(app().PZ.recommend(prof, { limit: 50 })), one, 'same result in a fresh page');
  assert.doesNotMatch(read('livon-personalization.js'), /Math\.random|openai|fetch\(|XMLHttpRequest|sendBeacon|LivonAI/i);
});

test('ON-28 every recommended item carries its reasons, and a reason only states what the user chose', () => {
  const prof = { lifeStage: '20', interests: ['주거', '금융'], lifeEvents: ['first-job', 'independent'] };
  const r = PZD.recommend(prof, { limit: 400 });
  assert.ok(r.personalized && r.items.length > 10);
  for (const x of r.items) {
    assert.ok(x.reasons.length >= 1 && x.why, x.id);
    for (const y of x.reasons) {
      if (y.type === 'stage') assert.equal(y.value, '20');
      else if (y.type === 'interest') assert.ok(prof.interests.includes(y.value));
      else if (y.type === 'event') assert.ok(prof.lifeEvents.includes(y.value));
      else assert.fail('unknown reason ' + y.type);
    }
    assert.match(x.why, /^(선택한 ‘.+’ 관련|관심사 ‘.+’|20대 주제)$/);
    assert.doesNotMatch(x.why, /인기|많이 본|추천 1위|AI/);
  }
  assert.equal(PZD.reasonText({ type: 'event', label: '첫 취업' }), '선택한 ‘첫 취업’ 관련');
  assert.equal(PZD.reasonText({ type: 'interest', label: '주거' }), '관심사 ‘주거’');
  assert.equal(PZD.reasonText({ type: 'stage', label: '70대 이상' }), '70대 이상 주제');
});

test('ON-29 an empty or unknown profile gives no recommendation (screens keep their default order)', () => {
  for (const p of [{}, null, { lifeStage: '99' }, { interests: [] }, { lifeEvents: ['unknown-event'] }]) {
    const r = PZD.recommend(p || {});
    assert.equal(r.personalized, false);
    assert.equal(r.items.length, 0);
  }
  assert.equal(PZD.hasSignals(PZD.sanitizeProfile({})), false);
});

test('ON-30 recommendations are existing records only — nothing is invented', () => {
  const repo = DATA.LivonScreenData.repository();
  for (const prof of [{ lifeStage: '10' }, { lifeStage: '40', interests: ['교육'], lifeEvents: ['child-edu'] }, { interests: ['여행', '문화'] }, { lifeStage: '70', lifeEvents: ['later-life'] }]) {
    const r = PZD.recommend(prof, { limit: 400 });
    assert.ok(r.items.length > 0, JSON.stringify(prof));
    for (const x of r.items) {
      const e = repo.getById(x.id, { any: true });
      assert.ok(e, 'not a real record: ' + x.id);
      assert.equal(e.title, x.title);
      assert.ok(['topic', 'guide', 'policy', 'service', 'program', 'today'].includes(x.kind));
    }
    assert.equal(new Set(r.items.map(x => x.id)).size, r.items.length, 'no duplicates');
  }
});

test('ON-31 age context (ex-childcare regression): childcare rows are not offered to 70대, and are to a 30대 parent', () => {
  const ids = p => PZD.recommend(p, { limit: 1000 }).items.map(x => x.id);
  for (const interests of [[], ['가족'], ['가족', '교육', '건강', '금융', '주거']]) {
    const got = ids({ lifeStage: '70', interests, lifeEvents: ['later-life'] });
    assert.ok(!got.includes('ex:ex-childcare'), 'ex-childcare for 70대');
    assert.ok(!got.includes('pol:pol-childcare'), 'pol-childcare for 70대');
    assert.ok(!got.some(id => /^topic:[1-6]0s\./.test(id)), 'no other band topic');
  }
  const allow70 = PZD.allowedIds('70'), allow30 = PZD.allowedIds('30');
  assert.ok(!allow70['ex:ex-childcare'] && !allow70['pol:pol-childcare']);
  assert.ok(allow30['ex:ex-childcare'], 'still available to the bands the event belongs to');
  assert.ok(ids({ lifeStage: '30', interests: ['가족'], lifeEvents: ['parenting'] }).some(id => /childcare|parenting/.test(id)));
});

test('ON-32 age context: senior rows are not offered to younger bands, teen rows only to 10대', () => {
  const repo = DATA.LivonScreenData.repository();
  for (const st of ['10', '20', '30', '40']) {
    for (const x of PZD.recommend({ lifeStage: st, interests: ['일자리', '건강', '교육', '진로'] }, { limit: 1000 }).items) {
      const e = repo.getById(x.id, { any: true });
      assert.ok(!(e.domains || []).includes('senior') || (e.lifeStages || []).includes(st), st + ' got senior row ' + x.id);
      if (st !== '10') assert.ok(!(e.tags || []).includes('청소년') || (e.lifeStages || []).includes(st), st + ' got teen row ' + x.id);
      if ((e.lifeStages || []).length) assert.ok(e.lifeStages.includes(st), st + ' got ' + x.id);
    }
  }
  assert.ok(!PZD.allowedIds('20')['ex:ex-senior-job']);
});

test('ON-33 weights: a Life Event match ranks above stage, stage above interest', () => {
  const r = PZD.recommend({ lifeStage: '20', interests: ['주거'], lifeEvents: ['first-job'] }, { limit: 400 });
  assert.ok(r.items[0].reasons.some(y => y.type === 'event' && y.value === 'first-job'));
  for (let i = 1; i < r.items.length; i++) assert.ok(r.items[i - 1].score >= r.items[i].score, 'sorted by score');
  const w = x => x.reasons.reduce((s, y) => s + (y.type === 'event' ? (y.via ? 3 : 4) : y.type === 'stage' ? 3 : 2), 0);
  for (const x of r.items) assert.ok(x.score === w(x) || x.score === w(x) + 0.5, x.id + ' score ' + x.score);
});

/* WHY CHANGED (Home V2): the column keeps its logic (topics that match the Life Events chosen in onboarding, each with
   its reason) but is no longer called a recommendation.
   BEFORE: heading "추천 주제" inside the V1 내 라이프 스테이지 card.
   AFTER:  heading "내가 고른 변화와 관련된 주제" inside the hub's 지금 내 생애주기 card; without Life Events the card
           shows "이 단계의 주제" as the plain stage list. */
test('ON-34 Home: topics that match the chosen Life Events follow the profile and show why', () => {
  const src = read('home-page.js');
  assert.match(src, /PZ\.recommend\(prof, \{ kinds: \["topic"\], limit: 3 \}\)/);
  const r = PZD.recommend({ lifeStage: '20', lifeEvents: ['independent'] }, { kinds: ['topic'], limit: 3 });
  assert.equal(r.items.length, 3);
  for (const x of r.items) { assert.match(x.id, /^topic:20s\./); assert.equal(x.why, '선택한 ‘독립’ 관련'); assert.match(x.href, /^#life\/20s\//); }
  // without Life Events the Home column is the one it always was
  assert.match(src, /mine\.length \? "<h4>내가 고른 변화와 관련된 주제<\/h4>"[\s\S]*?: topics\.length \? "<h4>이 단계의 주제<\/h4>"/);
  assert.match(src, /row\(topicHref\(x\.t\), x\.t\.title, x\.why \|\| x\.t\.category \|\| ""\)/, 'the reason is shown');
  assert.equal(src.includes('추천'), false);
});

test('ON-35 Today: the feed profile carries Life Events and they raise matching items', () => {
  const a = app({ screens: true, local: { [K.stage]: '20', [K.events]: ['first-trip'] } });
  const T = a.ctx.LivonTodayFeed, p = T.profile();
  assert.deepEqual([...p.events], ['first-trip']);
  const item = { title: '첫 해외여행 준비', desc: '', category: '', tags: [], stageIds: [], cats: [] };
  const withEv = T._test.score(item, p), without = T._test.score(item, Object.assign({}, p, { events: [] }));
  assert.equal(withEv - without, 2);
  assert.equal(a.PZ.eventBoost('관계없는 글', ['first-trip']), null);
  assert.match(read('today-feed.js'), /document\.addEventListener\("livon:personalization", function \(\) \{ try \{ refresh\(\); \}/);
});

test('ON-36 Explore: "For You" uses the same rules and the age-context filter', () => {
  const src = read('explore-page.js');
  assert.match(src, /PZ\.recommend\(/);
  assert.match(src, /allowed = prof\.lifeStage \? PZ\.allowedIds\(prof\.lifeStage\) : null/);
  assert.match(src, /document\.addEventListener\("livon:personalization", function \(\) \{ try \{ renderForYou\(\); \}/);
  const allow = PZD.allowedIds('20');
  assert.ok(Object.keys(allow).length > 50);
  assert.equal(PZD.allowedIds('20'), allow, 'computed once per stage');
  assert.equal(PZD.allowedIds(''), null, 'no stage: Explore is not filtered');
});

test('ON-37 Community: Life Events join the existing For You signals', () => {
  const a = app({ screens: true, local: { [K.stage]: '30', [K.interests]: ['가족'], [K.events]: ['parenting'] } });
  const C = a.ctx.LivonCommunity._test, sig = C.userSignals(C.loadStore());
  assert.deepEqual([...sig.events], ['parenting']);
  assert.match(read('community-service.js'), /PZ\.eventBoost\(blob, events\)/);
  assert.equal(C.forYou({ id: 'p', title: '육아 휴직 후기', tags: [], category: '' }, sig).why, '선택한 ‘육아’ 관련');
  assert.doesNotMatch(read('community-page.js'), /LivonPersonalization\.(complete|update|reset)/, 'Community never changes the profile');
});

test('ON-38 My Life settings: each part can be changed alone; an edit never undoes a finished setup', () => {
  const ml = read('life-now-page.js');
  for (const step of ['stage', 'interests', 'events']) assert.match(ml, new RegExp('editBtn\\("' + step + '"'));
  assert.match(ml, /data-lv-onboard-reopen>맞춤 설정 다시 하기</);
  assert.match(ml, /data-lv-ml-pz-reset>맞춤 설정 초기화</);
  const a = app();
  complete(a, { stage: '20', interests: ['주거'], events: ['independent'] });
  const e = a.click('doc', 'data-lv-onboard-edit', 'events');
  assert.equal(a.modal.hidden, false);
  assert.equal(a.OB._state().step, 'events');
  assert.equal(a.OB._state().edit, true);
  assert.ok(chips(a.html(), 'data-ob-event').find(c => c.value === 'independent').on, 'current choices are pre-selected');
  assert.match(a.html(), /data-ob-later>바꾸지 않고 닫기</);
  a.pick('event', 'move');
  a.later();
  assert.equal(a.PZ.state(), 'COMPLETED');
  assert.deepEqual(a.get(K.events), ['independent'], 'closing without finishing changes nothing');
  a.click('doc', 'data-lv-onboard-edit', 'events');
  a.pick('event', 'move'); a.next(); a.finish();
  assert.deepEqual(a.get(K.events), ['independent', 'move']);
  assert.equal(a.homeRenders(), 2, 'screens refresh at once');
});

test('ON-39 update applies at once; reset clears only the three preferences and keeps everything else', () => {
  const saves = [{ type: 'content', id: 'td:place-namsan', title: '남산', href: '#today/place-namsan', savedAt: 1 }];
  const a = app({ local: { [K.platform]: { saves }, 'livon.mlStore.v1': { v: 3, todos: [{ id: 't1', title: 'a' }] }, 'livon.cmStore.v1': { posts: [{ id: 'p1' }] }, [K.ml]: ['직접 쓴 관심사'] } });
  complete(a, { stage: '20', interests: ['주거', '금융'], events: ['independent'] });
  a.PZ.update({ interests: ['금융'] });
  assert.deepEqual(a.get(K.interests), ['금융']);
  assert.deepEqual(a.get(K.ml), ['직접 쓴 관심사', '금융'], 'a dropped interest leaves Explore too');
  assert.equal(a.PZ.recommend().items.some(x => x.reasons.some(y => y.value === '주거')), false);
  a.PZ.reset();
  assert.equal(a.get(K.stage), null);
  assert.deepEqual(a.get(K.interests), []);
  assert.deepEqual(a.get(K.events), []);
  assert.deepEqual(a.get(K.ml), ['직접 쓴 관심사']);
  assert.deepEqual(a.get(K.platform).saves, saves);
  assert.equal(a.get('livon.mlStore.v1').todos.length, 1);
  assert.equal(a.get('livon.cmStore.v1').posts.length, 1);
  assert.equal(a.PZ.state(), 'SKIPPED', 'not asked again after a reset');
  assert.equal(a.PZ.recommend().personalized, false);
  assert.match(read('life-now-page.js'), /confirmDialog[\s\S]{0,400}LivonPersonalization\.reset\(\)/);
});

test('ON-40 privacy: no network, no AI call, no analytics transport; measurement is a schema only', () => {
  const a = app();
  complete(a, { stage: '20', interests: ['주거'], events: ['first-job'] });
  a.PZ.update({ lifeStage: '30' }); a.PZ.recommend(); a.PZ.preview(); a.PZ.reset();
  assert.deepEqual(a.net, [], 'no request of any kind');
  for (const f of ['livon-personalization.js', 'livon-onboarding.js']) {
    assert.doesNotMatch(read(f).replace(/\/\*[\s\S]*?\*\//g, ''), /fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|gtag|dataLayer|\/api\/|https?:\/\//, f);
  }
  assert.deepEqual([...a.PZ.ANALYTICS_EVENTS], ['onboarding_started', 'stage_selected', 'interest_selected', 'life_event_selected', 'onboarding_completed', 'onboarding_skipped', 'personalization_updated']);
  const log = JSON.parse(JSON.stringify(a.PZ._log()));
  assert.ok(log.length >= 3);
  for (const l of log) assert.deepEqual(Object.keys(l).sort(), ['at', 'event', 'step'], 'names only — never the chosen values');
  // interfaces for later phases exist, nothing calls them
  assert.deepEqual(JSON.parse(JSON.stringify(app({ local: { [K.stage]: '20', [K.events]: ['first-job'] } }).PZ.aiContext())), { lifeStage: '20대', interests: [], lifeEvents: ['첫 취업'] });
  assert.deepEqual(Object.keys(a.PZ.exportForAccount()).sort(), ['interests', 'lifeEvents', 'lifeStage', 'updatedAt', 'version']);
  for (const f of ['ai-page.js', 'livon-platform.js', 'home-page.js']) assert.doesNotMatch(read(f), /aiContext\(|exportForAccount\(/, f);
  const a2 = app(); a2.start();
  assert.match(a2.html(), /선택한 내용은 이 기기에서 LIVON을 맞춤 설정하는 데만 사용돼요\. 회원가입 없이 쓸 수 있고, 언제든 바꾸거나 지울 수 있어요\./);
});

test('ON-41 accessibility: dialog semantics, pressed state, live status, focus trap and return, reduced motion, touch size', () => {
  assert.match(INDEX, /id="livon-onboard-modal" hidden>[\s\S]{0,400}role="dialog" aria-modal="true" aria-labelledby="livon-onboard-title"/);
  assert.match(INDEX, /class="lv-life-modal__close" data-lv-onboard-close aria-label="닫기"/);
  const a = app();
  a.start();
  assert.ok(a.title.focused >= 1, 'focus moves to the step heading');
  assert.equal(a.doc.activeElement, a.title);
  const h = a.html();
  assert.match(h, /role="progressbar" aria-label="맞춤 설정 진행"[^>]*aria-valuetext="4단계 중 1단계, 연령대"/);
  assert.match(h, /role="group" aria-labelledby="livon-onboard-title"/);
  assert.match(h, /<p class="lv-ob__status" role="status" aria-live="polite">/);
  assert.ok(chips(h, 'data-ob-stage').length === 7 && /<button type="button" class="lv-ob__chip"/.test(h), 'real buttons with aria-pressed');
  a.pick('stage', '20');
  a.next();
  assert.equal(a.pick('interest', '주거').getAttribute('aria-pressed'), 'true');
  assert.ok(a.title.focused >= 2, 'each step announces its heading');
  // focus trap
  a.doc.activeElement = a.close;
  assert.equal(a.key('Tab').prevented, true);
  a.doc.activeElement = a.opener;
  assert.equal(a.key('Tab').prevented, true, 'focus outside is pulled back in');
  // Escape closes, focus returns to the opener; with no opener it goes to <main>
  a.key('Escape');
  assert.equal(a.doc.activeElement, a.opener);
  assert.equal(a.key('Escape').prevented, false, 'Escape does nothing when closed');
  a.doc.activeElement = { offsetParent: null };
  a.OB.open();
  a.key('Escape');
  assert.equal(a.doc.activeElement, a.main);
  assert.equal(a.main.getAttribute('tabindex'), '-1');
  const css = read('life-page.css');
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.lv-ob__bar span\s*\{\s*transition:\s*none/);
  assert.match(css, /\.lv-ob__chip\s*\{[^}]*min-height:\s*2\.75rem/);
  assert.match(css, /\.lv-ob__chip:focus-visible/);
  assert.match(css, /\.lv-ob-entry\s*\{[^}]*width:\s*min\(400px, calc\(100vw - 2rem\)\)/);
});

/* ───────── persona QA: nine anonymous profiles through the real flow ───────── */
const PERSONAS = [
  { name: '10대 · 진학 준비', stage: '10', interests: ['교육', '진로'], events: ['advance'] },
  { name: '20대 · 첫 취업', stage: '20', interests: ['일자리', '진로'], events: ['first-job'] },
  { name: '20대 · 독립과 프리랜서', stage: '20', interests: ['주거', '금융'], events: ['independent', 'freelance'], gaps: ['freelance'] },
  { name: '30대 · 육아와 내 집 마련', stage: '30', interests: ['가족', '주거'], events: ['parenting', 'home-buy'] },
  { name: '40대 · 이직과 자녀 교육', stage: '40', interests: ['일자리', '교육'], events: ['job-change', 'child-edu'] },
  { name: '50대 · 은퇴 준비와 부모 돌봄', stage: '50', interests: ['금융', '건강'], events: ['retire-prep', 'parent-care'], gaps: ['parent-care'] },
  { name: '60대 · 노후 준비', stage: '60', interests: ['건강', '취미'], events: ['later-life'] },
  { name: '70대 이상 · 건강과 지역 생활', stage: '70', interests: ['건강', '지역 생활'], events: ['later-life'] },
  { name: '아무것도 고르지 않음', stage: '', interests: [], events: [] }
];
test('PERSONA QA: nine profiles get their own band, their own reasons, and honest gaps', () => {
  const repo = DATA.LivonScreenData.repository();
  for (const p of PERSONAS) {
    const a = app();
    complete(a, p);
    const prof = a.PZ.getProfile();
    assert.equal(prof.lifeStage, p.stage, p.name);
    assert.deepEqual([...prof.interests], p.interests, p.name);
    assert.deepEqual([...prof.lifeEvents], p.events, p.name);
    const r = a.PZ.recommend(prof, { limit: 400 });
    if (!p.stage) { assert.equal(r.personalized, false, p.name); assert.equal(a.PZ.entry(), 'none'); continue; }
    assert.ok(r.items.length >= 5, p.name + ': ' + r.items.length);
    assert.ok(r.items[0].id.startsWith('topic:' + p.stage + 's.'), p.name + ': an own-band topic first — ' + r.items[0].id);
    assert.ok(r.items.slice(0, 5).every(x => (repo.getById(x.id, { any: true }).lifeStages || []).includes(p.stage)), p.name + ': own-band rows on top — ' + r.items.slice(0, 5).map(x => x.id));
    for (const x of r.items) {
      const e = repo.getById(x.id, { any: true });
      assert.ok(e, p.name + ' ' + x.id);
      if ((e.lifeStages || []).length) assert.ok(e.lifeStages.includes(p.stage), p.name + ' got another band: ' + x.id);
      assert.ok(x.why, p.name);
    }
    assert.deepEqual([...r.gaps.map(g => g.id)], p.gaps || [], p.name + ' gaps');
    const covered = p.events.filter(id => !(p.gaps || []).includes(id));
    for (const id of covered) assert.ok(r.items.some(x => x.reasons.some(y => y.type === 'event' && y.value === id)), p.name + ': nothing for ' + id);
    const top = a.PZ.recommend(prof, { kinds: ['topic'], limit: 3 }).items;
    assert.equal(top.length, 3, p.name + ' Home topics');
  }
});

test('ex-childcare regression across every band: a band never receives another band’s rows', () => {
  const repo = DATA.LivonScreenData.repository();
  for (const st of ['10', '20', '30', '40', '50', '60', '70']) {
    const r = PZD.recommend({ lifeStage: st, interests: [...DATA.LivonLifeData.interests] }, { limit: 2000 });
    for (const x of r.items) {
      const e = repo.getById(x.id, { any: true });
      if ((e.lifeStages || []).length) assert.ok(e.lifeStages.includes(st), st + ' ← ' + x.id);
    }
    const childcare = r.items.some(x => x.id === 'ex:ex-childcare');
    assert.equal(childcare && !['20', '30', '40'].includes(st), false, 'ex-childcare offered to ' + st);
  }
});

test('performance: recommendation and step rendering stay instant', () => {
  const prof = { lifeStage: '30', interests: ['금융', '건강', '가족'], lifeEvents: ['parenting', 'home-buy', 'loan'] };
  PZD.recommend(prof);
  let t = process.hrtime.bigint();
  for (let i = 0; i < 20; i++) PZD.recommend(prof, { limit: 12 });
  const rec = Number(process.hrtime.bigint() - t) / 1e6 / 20;
  assert.ok(rec < 50, 'recommend ' + rec.toFixed(1) + 'ms');
  const a = app();
  a.start();
  t = process.hrtime.bigint();
  a.pick('stage', '30'); a.next(); a.pick('interest', '금융'); a.next(); a.pick('event', 'parenting'); a.next();
  const flow = Number(process.hrtime.bigint() - t) / 1e6;
  assert.ok(flow < 500, 'whole flow ' + flow.toFixed(1) + 'ms');
  const size = fs.statSync(path.join(ROOT, 'livon/livon-personalization.js')).size + fs.statSync(path.join(ROOT, 'livon/livon-onboarding.js')).size;
  assert.ok(size < 60 * 1024, 'two small scripts: ' + size);
});

test('page wiring: scripts load after the platform layer, one dialog, one note, no duplicate ids', () => {
  const order = ['data/livon-storage-guard.js', 'livon-platform.js', 'livon-personalization.js', 'livon-onboarding.js'].map(f => INDEX.indexOf(f + '?'));
  assert.ok(order.every(i => i > 0), 'all loaded: ' + order);
  assert.deepEqual([...order].sort((x, y) => x - y), order);
  for (const id of ['livon-onboard-modal', 'livon-onboard-entry']) assert.equal(INDEX.split('id="' + id + '"').length - 1, 1, id);
  assert.match(INDEX, /<div data-lv-ob-body><\/div>/);
  assert.doesNotMatch(INDEX, /data-lv-onboard-goal|data-lv-onboard-skip/, 'the old one-screen form is gone');
});

test('Admin and Data Manager: status only and typed-in simulation; visitor choices are never collected', () => {
  assert.match(fs.readFileSync(path.join(ROOT, 'livon/admin/admin-service.js'), 'utf8'), /key: "Personalization Engine", value: STATUS\.LOCAL_RULE_BASED/);
  for (const f of ['admin/admin-service.js', 'admin/admin-app.js', 'admin/data/data-manager-core.js', 'admin/data/data-manager.js']) {
    assert.doesNotMatch(read(f), /getProfile\(|livon\.lifeEvents|livon\.personalization\.v1/, f + ' must not read a visitor profile');
  }
  const ctx = loadLivon();
  ctx.localStorage.setItem(K.stage, '"70"');
  vm.runInContext(read('admin/data/data-manager-core.js'), ctx, { filename: 'data-manager-core.js' });
  const DM = ctx.LivonDataManager, M = DM.createModel(ctx, { now: Date.parse('2026-10-01T00:00:00Z') });
  const sim = DM.simulateOnboarding(M, { lifeStage: '20', interests: ['주거'], lifeEvents: ['independent'] });
  assert.equal(sim.available, true);
  assert.equal(sim.engine, 'LOCAL RULE-BASED');
  assert.equal(sim.profile.lifeStage, '20', 'the typed scenario, not the stored profile');
  assert.ok(sim.items.length > 0 && sim.items[0].rank === 1 && sim.items.every(x => x.reasons.length));
});

test('documentation: docs/livon/LIVON_ONBOARDING.md covers the required sections', () => {
  const doc = fs.readFileSync(path.join(ROOT, 'docs/livon/LIVON_ONBOARDING.md'), 'utf8');
  for (const h of ['Flow', 'Profile schema', 'Storage', 'Privacy', 'Life Stage', 'Interests', 'Life Events', 'Recommendation', 'Home integration', 'Today / Explore integration', 'Community integration', 'Settings', 'Reset', 'Fallback', 'Future NEWON+ migration', 'Analytics schema', 'Accessibility']) {
    assert.match(doc, new RegExp('^## .*' + h.replace(/[+/]/g, '\\$&'), 'm'), 'missing section: ' + h);
  }
  assert.match(doc, /livon\.personalization\.v1/);
  assert.doesNotMatch(doc, /sk-[A-Za-z0-9]{10,}|api[_-]?key\s*[:=]\s*\S/i);
});
