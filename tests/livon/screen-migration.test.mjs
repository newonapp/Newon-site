// LIVON Data Platform Screen Migration V1 — every screen reads its lists through the Data Platform repository (S-1 … S-10).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { loadLivon, qualityReport } from '../../scripts/livon-data-quality.mjs';

const src = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const LIFE = JSON.parse(src('livon/life-topics.json'));
const J = x => JSON.parse(JSON.stringify(x));

/* QA rows injected into the curated files: an ended Today item, an ended Explore program, a broken official link,
   a policy with a broken URL and a Life Event without a title. None of them may reach a screen. */
function withQaRows() {
  const lt = J(LIFE);
  lt.policies.push({ id: 'pol-qa-broken', kind: 'portal', name: '[QA] 링크 깨진 정책', provider: 'QA', target: '누구나', conditions: '-', period: '-', sourceUrl: 'javascript:alert(1)', checkedAt: '2026-09-25' });
  lt.policies.push({ id: 'pol-qa-closed', kind: 'portal', name: '[QA] 접수 마감 정책', provider: 'QA', target: '누구나', conditions: '-', period: '-', sourceUrl: 'https://example.org/closed', checkedAt: '2026-09-25', applicationEnd: '2025-12-31' });
  const topic = lt.topics.find(t => t.id === '20s.first-independence');
  topic.relatedPolicyIds.push('pol-qa-broken', 'pol-qa-closed');
  return loadLivon({
    lifeTopics: lt,
    patch: ctx => {
      ctx.LivonTodayData.contents.push({ id: 'qa-ended-show', type: 'place', category: '전시', title: '[QA] 끝난 이사 전시', blurb: '종료된 전시', body: '', tags: ['이사'], region: '서울', source: 'QA', officialUrl: 'https://example.org/show', status: 'info', expiresAt: '2025-01-01' });
      ctx.LivonExploreData.items.push({ id: 'qa-ended-class', type: 'program', categoryIds: ['education'], subfield: '교육', title: '[QA] 모집 끝난 이사 교육', provider: 'QA', blurb: '종료', body: '', region: '서울', mode: 'offline', priceType: 'free', officialUrl: 'https://example.org/c', source: 'QA', tags: ['이사', '교육'], endDate: '2025-06-30' });
      ctx.LivonExploreData.items.push({ id: 'qa-broken-link', type: 'program', categoryIds: ['education'], subfield: '교육', title: '[QA] 링크 오류 이사 프로그램', provider: 'QA', blurb: '링크 오류', body: '', region: '서울', mode: 'offline', priceType: 'free', officialUrl: 'javascript:alert(1)', source: 'QA', tags: ['이사'] });
      ctx.LivonLifeEvents.events.push({ id: 'qa-no-title', title: '', blurb: 'x', stages: ['20'], situations: [], needs: [], checklist: [], resources: [], links: {} });
    }
  });
}

/* ───────── S-1 Today ───────── */
test('S-1 Today: contents come from the repository — same records, same order; ended rows are filtered; detail lookup follows', () => {
  const ctx = loadLivon(), SD = ctx.LivonScreenData;
  const list = SD.todayContents();
  /* records on a LIVON Next V1 review hold (publishStatus "review") stay in the file but are not handed to the screen */
  const shown = ctx.LivonTodayData.contents.filter(c => c.publishStatus !== 'review');
  assert.equal(list.length, shown.length);
  list.forEach((c, i) => assert.strictEqual(c, shown[i], 'the original record object is handed to the screen'));
  const q = withQaRows().LivonScreenData;
  assert.equal(q.todayContents().some(c => c.id === 'qa-ended-show'), false);
  assert.equal(q.todayById('qa-ended-show'), null, 'detail of an ended item is not shown as current');
  assert.ok(q.todayById('place-hangang'));
  /* all eight Today sections keep their content */
  /* 체험 (experience) and 배움 (learn) are empty while all their guides are on review hold (LIVON Next V1) */
  for (const k of ['place', 'together', 'season', 'life', 'editorial', 'event']) assert.ok(list.some(c => c.type === k), k);
  assert.equal(list.some(c => c.publishStatus === 'review'), false);
  /* rule-based feed (not "AI") over the same records */
  const f = SD.todayFeed({ region: '서울', interests: ['여행'], date: '2026-10-03' });
  assert.equal(f.method, 'rule-based'); assert.ok(f.items.length && f.items.every(x => x.record && x.record.id));
  /* the screens use the bridge */
  assert.match(src('livon/today-page.js'), /function contents\(\) \{ return window\.LivonScreenData \? window\.LivonScreenData\.todayContents\(\)/);
  assert.match(src('livon/today-feed.js'), /S\.todayContents\(\)/);
});

/* ───────── S-2 Explore ───────── */
test('S-2 Explore: items come from the repository; ended programs and broken official links never appear; detail lookup follows', () => {
  const ctx = loadLivon(), SD = ctx.LivonScreenData;
  assert.equal(SD.exploreItems().length, ctx.LivonExploreData.items.filter(x => x.publishStatus !== 'review').length, 'every item but those on review hold');
  const q = withQaRows(), QS = q.LivonScreenData;
  const ids = QS.exploreItems().map(x => x.id);
  assert.equal(ids.includes('qa-ended-class'), false); assert.equal(ids.includes('qa-broken-link'), false);
  assert.equal(QS.exploreById('qa-broken-link'), null);
  assert.equal(QS.repository().hiddenReason('ex:qa-broken-link'), 'unsourced');
  assert.equal(QS.repository().hiddenReason('ex:qa-ended-class'), 'expired');
  /* every Explore category still has items; experts/services/policies/programs/classes/places come from one model */
  for (const c of ctx.LivonExploreData.categories) assert.ok(SD.exploreItems().some(x => (x.categoryIds || []).includes(c.id)), c.id);
  const types = new Set(SD.repository().explore({ types: ['provider', 'service', 'program', 'class', 'place', 'policy'], limit: 999 }).items.map(e => e.type));
  /* class: the only curated classes (Today 체험 guides) are on review hold (LIVON Next V1) */
  for (const t of ['provider', 'service', 'program', 'place', 'policy']) assert.ok(types.has(t), t);
  assert.match(src('livon/explore-page.js'), /function items\(\) \{[\s\S]{0,300}window\.LivonScreenData \? window\.LivonScreenData\.exploreItems\(\)/, 'Explore V2 keeps the repository as the source and only skips malformed rows');
});

/* ───────── S-3 Life Stage ───────── */
test('S-3 Life Stage: all seven stages and their topics stay; relations resolve through the repository; broken/closed policies are gated', () => {
  const ctx = loadLivon(), SD = ctx.LivonScreenData, hub = ctx.LivonLifeHub.repo;
  assert.equal(SD.topics().length, LIFE.topics.length);
  for (const s of LIFE.stages) assert.ok(SD.topics().some(t => t.lifeStageId === s.id), s.id);
  const rel = SD.topicRelations('20s.first-independence');
  assert.ok(rel.policies.length >= 1 && rel.services.length >= 1 && rel.places.length + rel.contents.length + rel.classes.length >= 1);
  assert.ok(rel.lifeEvents.some(e => e.title === '독립'), '20대 → 독립');
  assert.deepEqual(J(SD.topicRelations('no-such-topic')), { contents: [], policies: [], services: [], experts: [], programs: [], places: [], classes: [], lifeEvents: [] }, 'no data → empty, nothing invented');
  assert.equal(rel.experts.length, 0, 'no expert profile is invented');
  const q = withQaRows(), qhub = q.LivonLifeHub.repo;
  assert.equal(qhub.policy('pol-qa-broken'), null, 'broken official link: not shown');
  assert.equal(qhub.policy('pol-qa-closed'), null, 'closed application: not shown');
  assert.ok(qhub.policy('pol-youthcenter'));
  assert.ok(hub.service('house-search'));
  assert.equal(q.LivonScreenData.lifeEvents().some(e => e.id === 'qa-no-title'), false);
  assert.match(src('livon/life-hub.js'), /gate\("pol:" \+ id\)/); assert.match(src('livon/life-page.js'), /LivonScreenData\.lifeEvents\(\)/);
});

/* ───────── S-4 Home ───────── */
test('S-4 Home: Today / Explore / Life Event data on Home come from the repository; no direct file reads remain', () => {
  const home = src('livon/home-page.js');
  /* WHY CHANGED (Home V2): Home no longer shows Life Event chips, so it reads no Life Event list.
     BEFORE: var EVENTS = SD ? SD.lifeEvents() …; 3 Today reads + 2 Explore reads on Home.
     AFTER:  no Life Event read on Home; one Today read and one Explore read (the 발견 card), both through the repository. */
  assert.equal(/lifeEvents\(\)|LivonLifeEvents/.test(home), false);
  const code = home.replace(/function (tdList|exList)\(\) \{[^\n]*\n/g, '');
  assert.doesNotMatch(code, /LivonTodayData\.contents|LivonExploreData\.items|data\.items/, 'every Home list goes through tdList()/exList()');
  assert.ok((home.match(/tdList\(\)/g) || []).length === 2 && (home.match(/exList\(\)/g) || []).length === 2, 'Home lists: one Today read + one Explore read (+ helper definitions)');
  assert.match(home, /function tdList\(\) \{ var l = SD \? SD\.todayContents\(\) : /); assert.match(home, /function exList\(\) \{ var l = SD \? SD\.exploreItems\(\) : /);
});

/* ───────── S-5 Search ───────── */
test('S-5 Search: one index over Life Stage, Life Event, content, policy, program, place, service; types labelled; every result opens a detail page', () => {
  const ctx = loadLivon();
  const r = ctx.LivonSearch.search('이사', {});
  const labels = new Set(r.items.map(h => h.item.typeLabel));
  for (const l of ['Life Event', '라이프 스테이지', '서비스 유형']) assert.ok(labels.has(l), l);
  const rep = qualityReport(ctx);
  assert.deepEqual(rep.search.brokenOrDuplicate, []);
  assert.ok(rep.search.results > 200);
  const le = ctx.LivonSearch.search('독립', {}).items.find(h => h.item.typeLabel === 'Life Event');
  assert.equal(le.item.eventId, 'independent'); assert.equal(le.item.href, '#life-events');
  /* ended / broken rows never reach search */
  const q = withQaRows();
  const titles = q.LivonSearch.search('이사', {}).items.map(h => h.item.title).join('|');
  assert.doesNotMatch(titles, /\[QA\]/);
  assert.match(src('livon/explore-page.js'), /data-lv-le-open/);
});

/* ───────── S-6 My Life: saves, storage compatibility ───────── */
test('S-6 My Life: stored saves resolve to Data Platform ids without rewriting storage; ended items stay in the user\'s list', () => {
  const ctx = loadLivon(), SD = ctx.LivonScreenData;
  const legacy = [
    { type: 'topic', id: '20s.first-independence' }, { type: 'checklist', id: '20s.first-independence' }, { type: 'service', id: 'house-search' },
    { type: 'policy', id: 'pol-youthcenter' }, { type: 'place', id: 'td:place-hangang' }, { type: 'class', id: 'ex:ex-qnet' }, { type: 'content', id: 'td:edit-daytrip' },
    { type: 'lifeEvent', id: 'independent' },
    /* the shared ids the screens actually store */
    { id: 'life-hub:topic:20s.first-independence', type: 'life-topic' }, { id: 'life-hub:checklist:20s.first-independence', type: 'life-checklist' },
    { id: 'life-hub:place:td:place-hangang', type: 'life-place' }, { id: 'life-hub:class:ex:ex-qnet', type: 'life-class' },
    { id: 'life-hub:service:house-search', type: 'life-service' }, { id: 'life-hub:policy:pol-youthcenter', type: 'life-policy' }
  ];
  for (const s of legacy) { const r = SD.resolveSave(s); assert.equal(r.known, true, JSON.stringify(s)); assert.equal(r.visible, true); }
  const post = SD.resolveSave({ id: 'life-hub:community:cm:p123', type: 'life-community' });
  assert.equal(post.known, false); assert.equal(post.visible, true, 'a local community post is never hidden by the platform');
  assert.deepEqual(J(SD.legacy('topic:20s.first-independence')), { type: 'topic', id: '20s.first-independence' });
  assert.deepEqual(J(SD.legacy('td:place-hangang')), { type: 'content', id: 'td:place-hangang' });
  /* an item that ended later is reported, never deleted */
  const q = withQaRows().LivonScreenData;
  const r = q.resolveSave({ type: 'content', id: 'td:qa-ended-show' });
  assert.equal(r.known, true); assert.equal(r.visible, false); assert.equal(r.reason, 'expired');
  /* the bridge never touches storage */
  const bridge = src('livon/data/livon-screen-data.js');
  assert.doesNotMatch(bridge.replace(/\/\*[\s\S]*?\*\//g, ''), /localStorage|sessionStorage|setItem|removeItem|document\./);
});

/* ───────── S-7 fallback ───────── */
test('S-7 fallback: without the platform, or if it throws, every screen gets the file\'s own list', () => {
  const ctx = { console, URL, Promise }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['today-data.js', 'explore-data.js', 'life-events-data.js', 'data/livon-screen-data.js']) vm.runInContext(src('livon/' + f), ctx);
  assert.strictEqual(ctx.LivonScreenData.todayContents(), ctx.LivonTodayData.contents);
  assert.strictEqual(ctx.LivonScreenData.exploreItems(), ctx.LivonExploreData.items);
  assert.equal(ctx.LivonScreenData.visible('td:anything'), true);
  ctx.LivonDataPlatform = { createRepository() { throw new Error('boom'); }, StaticAdapter() { return {}; } };
  assert.strictEqual(ctx.LivonScreenData.rebuild(), null);
  assert.strictEqual(ctx.LivonScreenData.exploreItems(), ctx.LivonExploreData.items);
  assert.equal(ctx.LivonScreenData.quality().available, false);
});

/* ───────── S-8 data quality ───────── */
test('S-8 data quality: no duplicates, no unsourced or invalid links, no dangling relations, no empty categories in the shipped data', () => {
  const rep = qualityReport(loadLivon());
  assert.equal(rep.blocking, 0, JSON.stringify(rep));
  assert.equal(rep.counts.duplicates, 0); assert.equal(rep.counts.unsourced, 0); assert.equal(rep.counts.sample, 0);
  assert.deepEqual(rep.invalidUrls, []); assert.deepEqual(rep.dangling, []);
  /* Today 체험 / 배움 are empty only because all their guides are on review hold (LIVON Next V1) — never because rows were lost */
  assert.deepEqual(J(rep.emptyCategories), { explore: [], today: ['experience', 'learn'], lifeStages: [] });
  assert.equal(rep.checks.held.count, 10);
  for (const k of Object.keys(rep.screens)) { const [a, b] = rep.screens[k].split('/'); assert.equal(a, b, k + ' lost rows'); }
  const q = qualityReport(withQaRows());
  assert.ok(q.counts.expired >= 3 && q.counts.unsourced >= 1, 'QA rows are counted as hidden, not shown');
});

/* ───────── S-9 expiry across screens ───────── */
test('S-9 expiry: one ended row is hidden on Today, Explore, Life Stage and Search at the same time', () => {
  const q = withQaRows(), SD = q.LivonScreenData;
  const where = [SD.todayContents().map(x => x.title), SD.exploreItems().map(x => x.title), SD.policies().map(x => x.name),
    q.LivonSearch.search('QA', {}).items.map(h => h.item.title)].flat().join('|');
  assert.doesNotMatch(where, /\[QA\]/);
});

/* ───────── S-10 load order / anonymous ───────── */
test('S-10 page wiring: bridge after the platform, before every screen; no login, network or storage added', () => {
  const html = src('livon/index.html');
  const i = n => html.indexOf(n);
  assert.ok(i('/livon/data/livon-data-platform.js') < i('/livon/data/livon-screen-data.js'));
  for (const f of ['/livon/life-hub.js', '/livon/life-page.js', '/livon/explore-search.js', '/livon/explore-page.js', '/livon/today-feed.js', '/livon/today-page.js', '/livon/home-page.js'])
    assert.ok(i('/livon/data/livon-screen-data.js') < i(f), f);
  const bridge = src('livon/data/livon-screen-data.js').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(bridge, /fetch\(|XMLHttpRequest|firebase|signIn|login/i);
});
