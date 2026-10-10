// LIVON Life Stage V2 (LS2-01 …). Life Stage as a structured information hub the person steers: a stage is chosen, never
// guessed; search runs on the one shared LIVON index; conditions live in the URL; one saved store; no popularity claims;
// a bad data row never takes the store with it. Data tests run everywhere (node:vm); browser tests need a local Chromium
// and skip without it. Cache-mix tests need the pre-V2 base commit in git and skip without it.
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
const HUB = read('life-hub.js'), PAGE = read('life-page.js'), CSS = read('life-page.css'), INDEX = read('index.html'), SEARCH = read('explore-search.js');
const DATA = JSON.parse(read('life-topics.json'));
const code = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const BASE_COMMIT = 'cf0b1505e';
const ML = 'livon.mlStore.v1', CM = 'livon.cmStore.v1', STAGE = 'livon.lifeStage';
const SECRET = 'QA비밀기록제목';
const clone = x => JSON.parse(JSON.stringify(x));

/* ───────── node:vm: the Life Stage hub + the shared search index, no DOM ───────── */
function app({ local = {}, data = DATA } = {}) {
  const m = new Map(Object.entries(local).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  const ls = { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m };
  const saves = new Map(), fetched = [];
  const ctx = { console, localStorage: ls, sessionStorage: ls, location: { hash: '#life' }, navigator: {}, setTimeout, addEventListener() {},
    document: { readyState: 'complete', getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, head: { querySelector: () => null } },
    fetch: (...a) => { fetched.push(String(a[0])); return Promise.reject(new Error('no network in tests')); } };
  ctx.window = ctx;
  ctx.LivonPlatform = { listSaves: () => [...saves.values()], hasSave: id => saves.has(id), saveItem: x => saves.set(x.id, x), removeSave: id => saves.delete(id) };
  vm.createContext(ctx);
  for (const f of ['data/livon-user-data.js', 'life-data.js', 'service-details-data.js', 'service-details.js', 'explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js', 'explore-search.js']) vm.runInContext(read(f), ctx);
  const hub = ctx.LivonLifeHub;
  if (data) hub.repo.use(data);
  return { ctx, hub, saves, ls, fetched, S: ctx.LivonSearch };
}
const st = (q, o = {}) => ({ view: 'search', q, stage: '', type: 'all', area: '', ...o });

/* ═════════ data ═════════ */
test('LS2-01 inventory (counted, not assumed): 228 topics · 7 stages · 88 categories (55 names) · 38 service types in 13 groups · 17 official portals', () => {
  assert.equal(DATA.topics.length, 228); assert.equal(DATA.stages.length, 7); assert.equal(DATA.categories.length, 88);
  assert.equal(new Set(DATA.categories.map(c => c.name)).size, 55);
  assert.equal(DATA.serviceTypes.length, 38); assert.equal(new Set(DATA.serviceTypes.map(s => s.group)).size, 13);
  assert.equal(DATA.policies.length, 17); assert.equal(new Set(DATA.policies.map(p => new URL(p.sourceUrl).host)).size, 17);
  assert.deepEqual(DATA.stages.map(s => DATA.topics.filter(t => t.lifeStageId === s.id).length), [28, 38, 33, 31, 31, 33, 34]);
  assert.equal(DATA.experts.length, 0, 'no expert records exist, so none are shown');
  assert.equal(DATA.topics.reduce((n, t) => n + t.checklist.length, 0), 831);
});

test('LS2-02 data quality: the shipped file passes every row check — ids, titles, summaries, stages, categories, references, https sources, dates', () => {
  const { hub } = app();
  assert.deepEqual(clone(hub.repo.issues), [], 'no row is dropped or flagged');
  assert.equal(hub.repo.data, DATA, 'clean data is used as it is (no copy)');
  const ids = new Set();
  for (const t of DATA.topics) {
    assert.ok(!ids.has(t.id), 'duplicate ' + t.id); ids.add(t.id);
    assert.equal(t.id, t.stageSlug + '.' + t.slug);
    assert.ok(t.title.trim() && t.description.trim(), t.id);
    assert.ok(hub.repo.stage(t.lifeStageId), t.id + ' stage'); assert.ok(hub.repo.category(t.categoryId), t.id + ' category');
    assert.equal(hub.repo.category(t.categoryId).name, t.category, t.id);
    for (const k of ['knowledge', 'guide', 'checklist', 'relatedTopicIds', 'relatedPolicyIds', 'relatedServiceIds', 'aiPrompts']) assert.ok(Array.isArray(t[k]), t.id + '.' + k);
  }
  for (const c of DATA.categories) for (const id of c.topicIds) assert.ok(ids.has(id), c.id + ' → ' + id);
  for (const s of DATA.stages) for (const id of s.featuredTopicIds) assert.ok(ids.has(id), s.id + ' featured ' + id);
  const today = new Date().toISOString().slice(0, 10);
  for (const p of DATA.policies) {
    assert.match(p.sourceUrl, /^https:\/\/[a-z0-9.-]+\//, p.id); assert.ok(p.provider && p.name, p.id);
    if (p.checkedAt != null) { assert.match(p.checkedAt, /^\d{4}-\d{2}-\d{2}$/, p.id); assert.ok(p.checkedAt <= today, p.id + ' not in the future'); }
  }
  assert.equal(DATA.policies.filter(p => p.checkedAt == null).length, 6, 'six portals have no check date in the data, and get none on screen');
  assert.match(DATA.updatedAt, /^\d{4}-\d{2}-\d{2}$/); assert.ok(DATA.updatedAt <= today);
});

test('LS2-03 malformed data: bad rows are left out one by one and counted; every good row stays (FULL STORE LOSS = 0)', () => {
  const bad = clone(DATA);
  bad.topics.push(null, 7, 'x', [], { title: 'id 없음' }, { ...clone(DATA.topics[0]) },                                 /* not objects, no id, duplicate id */
    { ...clone(DATA.topics[1]), id: '10s.no-title', slug: 'no-title', title: '   ' },
    { ...clone(DATA.topics[1]), id: '10s.no-summary', slug: 'no-summary', description: null },
    { ...clone(DATA.topics[1]), id: '99s.ghost', slug: 'ghost', lifeStageId: '99', stageSlug: '99s' },
    { ...clone(DATA.topics[1]), id: '10s.wrong-route', slug: 'other' },
    { ...clone(DATA.topics[1]), id: '10s.loose', slug: 'loose', title: '느슨한 행', guide: 'not-an-array', knowledge: [null, { title: 3 }, { title: '남는 항목', body: 'ok' }], checklist: { a: 1 }, relatedTopicIds: [1, null, '10s.nowhere'], relatedPolicyIds: 'pol-x', aiPrompts: null, category: 5 });
  bad.policies.push({ id: 'pol-http', name: 'http 출처', provider: '기관', sourceUrl: 'http://example.go.kr/' }, { id: 'pol-js', name: 'js', provider: '기관', sourceUrl: 'javascript:alert(1)' },
    { id: 'pol-nosrc', name: '출처 없음', provider: '기관' }, { id: 'pol-noprov', name: '기관 없음', sourceUrl: 'https://example.go.kr/' },
    { id: 'pol-baddate', name: '날짜 이상', provider: '기관', sourceUrl: 'https://example.go.kr/', checkedAt: '2026-13-45' },
    { id: 'pol-future', name: '미래 날짜', provider: '기관', sourceUrl: 'https://example.go.kr/', checkedAt: '2099-01-01' });
  bad.categories.push({ id: 'x.cat', stageId: '99', name: '없는 단계' }, { id: '10s.noname', stageId: '10' }, null);
  bad.serviceTypes.push({ id: 'svc-untitled' }, { id: 'svc-loose', name: '느슨한 서비스', features: 'x', process: null });
  bad.stages.push({ id: '80' }, null);
  const { hub, S } = app({ data: null });
  assert.doesNotThrow(() => hub.repo.use(bad));
  assert.equal(hub.repo.status, 'ready');
  assert.equal(hub.repo.data.topics.length, 229, '228 good rows + the loose row that could be repaired');
  assert.equal(hub.repo.data.stages.length, 7); assert.equal(hub.repo.data.categories.length, 88);
  for (const t of DATA.topics) assert.ok(hub.repo.topic(t.id), t.id + ' survived');
  const reasons = clone(hub.repo.issues).map(i => i.reason);
  for (const r of ['not-an-object', 'missing-id', 'duplicate-id', 'missing-title', 'missing-summary', 'unknown-stage', 'id-route-mismatch', 'non-https-source', 'missing-source', 'invalid-check-date', 'orphan-topic-reference', 'missing-name', 'invalid-slug']) assert.ok(reasons.includes(r), r);
  const loose = hub.repo.topic('10s.loose');
  assert.deepEqual(clone([loose.guide, loose.knowledge.length, loose.checklist, loose.relatedTopicIds, loose.relatedPolicyIds, loose.aiPrompts, loose.category]), [[], 1, [], ['10s.nowhere'], [], [], '']);
  for (const id of ['pol-http', 'pol-js', 'pol-nosrc', 'pol-noprov']) assert.equal(hub.repo.policy(id), null, id + ' is never shown');
  assert.equal(hub.repo.policy('pol-baddate').checkedAt, null, 'an invalid date is dropped, not shown');
  assert.equal(hub.repo.policy('pol-future').checkedAt, null, 'a future date is dropped, not shown');
  assert.deepEqual(clone(hub.repo.service('svc-loose').features), []);
  /* the screens built on it still work */
  S.rebuild();
  assert.ok(hub.runSearch(st('독립')).total > 0); assert.ok(hub.runSearch(st('느슨한')).items.some(h => h.item.title === '느슨한 행'));
  assert.equal(hub.runSearch(st('http 출처')).total, 0);
  /* something that is not Life Stage data at all is refused as a whole, and what was loaded before stays */
  for (const junk of [null, 7, 'x', [], {}, { stages: [] }, { topics: [] }, { stages: 'x', topics: [] }]) assert.throws(() => hub.repo.use(junk), /invalid life-topics data/);
  assert.equal(hub.repo.data.topics.length, 229, 'a refused file does not empty the store');
});

/* ═════════ search ═════════ */
test('LS2-04 one search system: Life Stage search calls the shared LIVON index and keeps no matcher of its own', () => {
  const c = code(HUB), run = c.slice(c.indexOf('function run(st)'), c.indexOf('function hasCondition'));
  assert.match(run, /L\.search\(st\.q \|\| "", f\)/); assert.match(c, /function shared\(\) \{ var L = window\.LivonSearch;/);
  assert.doesNotMatch(c, /Repo\.data\.topics\.forEach\(function \(t\) \{[\s\S]{0,200}hit\(/, 'the old per-screen matcher is gone');
  assert.doesNotMatch(c, /function hit\(/); assert.doesNotMatch(c, /searchState\./);
  assert.equal((c.match(/\.search\(/g) || []).length, 2, 'two calls, both into LivonSearch (with words / listing a kind)');
  assert.doesNotMatch(run, /localStorage|readJSON|KEY_ML|KEY_CM|communityItems/);
  const { hub, S } = app();
  const viaHub = hub.runSearch(st('독립')).items.map(h => h.item.key);
  const viaIndex = S.search('독립', { type: 'all' }).items.filter(h => /^(lt|svc|pol):/.test(h.item.key)).map(h => h.item.key);
  assert.ok(S.search('주거', {}).items.some(h => /^ex:/.test(h.item.key)), 'the index also holds 탐색 items');
  assert.ok(hub.runSearch(st('주거')).items.every(h => /^(lt|svc|pol):/.test(h.item.key)), 'Life Stage lists its own rows only');
  assert.deepEqual(clone(viaHub), clone(viaIndex), 'same hits, same order as the shared index');
  assert.deepEqual(clone(hub.SCOPE.map(x => x.id)), ['all', 'life', 'service', 'policy']);
});

test('LS2-05 search results: Life Stage kinds only (주제 · 서비스 유형 · 공식 포털); stage, kind and area narrow them; counts are real', () => {
  const { hub } = app();
  const all = hub.runSearch(st('주거'));
  assert.ok(all.total > 0); assert.equal(all.ready, true);
  assert.ok(all.items.every(h => ['life', 'service', 'policy'].includes(h.item.type)));
  assert.equal(all.counts.all, all.total); assert.equal((all.counts.life || 0) + (all.counts.service || 0) + (all.counts.policy || 0), all.total);
  const s20 = hub.runSearch(st('주거', { stage: '20' }));
  assert.ok(s20.total > 0 && s20.total < all.total);
  assert.ok(s20.items.every(h => h.item.type === 'life' && h.item.stageIds.includes('20')), 'a stage belongs to topics only');
  const pol = hub.runSearch(st('주거', { type: 'policy' }));
  assert.ok(pol.total > 0); assert.ok(pol.items.every(h => h.item.type === 'policy' && h.item.external && /^https:\/\//.test(h.item.href)));
  assert.equal(pol.counts.all, all.total, 'the other kinds\' counts stay visible while one kind is chosen');
  const area = hub.runSearch(st('', { area: 'money' }));
  assert.ok(area.total > 0); assert.ok(area.items.every(h => h.item.cats.includes('money')));
  const stageOnly = hub.runSearch(st('', { stage: '70' }));
  assert.equal(stageOnly.total, 34, 'a stage on its own lists that stage\'s 34 topics');
  const kindOnly = hub.runSearch(st('', { type: 'service' }));
  assert.equal(kindOnly.total, 38); assert.equal(kindOnly.counts.life, 228); assert.equal(kindOnly.counts.policy, 17);
  assert.equal(hub.runSearch(st('')).total, 0, 'no words and no condition → nothing listed (the screen shows a prompt)');
  assert.equal(hub.runSearch(st('zzqqxx없는말')).total, 0);
  assert.equal(hub.runSearch(st('주거', { area: 'not-an-area' })).total, all.total, 'an unknown area is ignored, not applied');
  /* every topic can be found by its own title in its own stage */
  for (const t of DATA.topics) assert.ok(hub.runSearch(st(t.title, { stage: t.lifeStageId })).items.some(h => h.item.href === '#life/' + t.stageSlug + '/' + t.slug), t.id);
});

test('LS2-06 URL state: query and conditions round-trip through the hash; unknown values are ignored; old links still open', () => {
  const { hub } = app();
  const r = hub.route(st('청년 주거', { stage: '20', type: 'life', area: 'housing' }));
  assert.equal(r, '#life/search/' + encodeURIComponent('청년 주거') + '?stage=20&type=life&area=housing');
  assert.deepEqual(clone(hub.parse(r)), { view: 'search', q: '청년 주거', stage: '20', type: 'life', area: 'housing' });
  assert.equal(hub.route(st('연금')), '#life/search/' + encodeURIComponent('연금'), 'no conditions → no query string');
  assert.deepEqual(clone(hub.parse('#life/search/%EB%8F%85%EB%A6%BD')), { view: 'search', q: '독립', stage: '', type: 'all', area: '' }, 'a V1 link');
  assert.deepEqual(clone(hub.parse('#life/search/')), { view: 'search', q: '', stage: '', type: 'all', area: '' });
  assert.equal(hub.parse('#life/search/x?stage=20s').stage, '20', 'the older slug form is accepted');
  const odd = hub.parse('#life/search/x?stage=90&type=community&area=<script>&evil=1&stage');
  assert.deepEqual(clone(odd), { view: 'search', q: 'x', stage: '', type: 'all', area: '' });
  assert.equal(hub.parse('#life/search/' + 'a'.repeat(200)).q.length, 60);
  assert.deepEqual(clone(hub.searchState('#life/20s/first-independence')), null);
  /* the other Life Stage routes are untouched by the query-string parsing */
  assert.deepEqual(clone(hub.parse('#life/20s/first-independence')), { stage: '20s', topic: 'first-independence', view: 'topic' });
  assert.deepEqual(clone(hub.parse('#life/20s/c/housing')), { stage: '20s', view: 'category', category: 'housing' });
  assert.equal(hub.stageIdFromHash('#life/20s'), '20');
});

/* ═════════ boundaries ═════════ */
test('LS2-07 private boundary (data): My Life records and every Community post — public or not — stay out of Life Stage search', () => {
  const ml = { v: 2, todos: [{ id: 't', title: SECRET + '할일' }], events: [{ id: 'e', title: SECRET + '일정' }], journal: [{ id: 'j', title: SECRET + '일기', body: SECRET }], health: [{ id: 'h', title: SECRET + '건강' }], transactions: [{ id: 'x', title: SECRET + '가계' }] };
  const cm = { posts: [{ id: 'p1', title: SECRET + '초안', body: 'x', draft: true }, { id: 'p2', title: SECRET + '비공개', body: 'x', visibility: 'private' }, { id: 'p3', title: SECRET + '멤버', body: 'x', visibility: 'members' },
    { id: 'p4', title: SECRET + '삭제', body: 'x', deleted: true }, { id: 'p5', title: SECRET + '공개글', body: 'x', visibility: 'public', createdAt: 1 }] };
  const { hub, S, ls } = app({ local: { [ML]: ml, [CM]: cm, 'livon.exRecent': [SECRET + '검색'], 'livon.platform.v1': { recentSearches: [SECRET + '최근'] } } });
  assert.equal(hub.runSearch(st(SECRET)).total, 0);
  assert.ok(S.search(SECRET, {}).items.some(h => h.item.type === 'community'), 'the shared index does know the public post — Life Stage leaves it to 탐색');
  for (const q of ['할일', '일기', '공개글', '초안']) assert.ok(!JSON.stringify(hub.runSearch(st(q)).items).includes(SECRET), q);
  assert.ok(!JSON.stringify(hub.runSearch(st('', { stage: '20' })).items).includes(SECRET));
  assert.equal(ls.getItem(STAGE), null);
});

test('LS2-08 no inference: nothing in Life Stage derives a stage from age, birthday, My Life, Community or search history, and searching never stores one', () => {
  const hub = code(HUB), page = code(PAGE);
  assert.doesNotMatch(hub, /writeJSON\(KEY_STAGE|setItem\("livon\.lifeStage"|KEY_STAGE,/, 'the hub never writes a stage');
  assert.doesNotMatch(hub + page, /ageRange|birth|생년|getFullYear\(\) -|나이를 (계산|추정)/i, 'no age arithmetic');
  /* the stage key is written in exactly one place: setStage(id), which is only called from a control the person pressed */
  assert.deepEqual(page.match(/writeJSON\(KEY_STAGE, [^)]*\)/g), ['writeJSON(KEY_STAGE, String(id)', 'writeJSON(KEY_STAGE, null)'], 'set by setStage(id), cleared by the reset button — nothing else');
  assert.match(page, /function setStage\(id, opts\) \{\s*opts = opts \|\| \{\};\s*if \(id\) writeJSON\(KEY_STAGE, String\(id\)\);/);
  const calls = [...page.matchAll(/setStage\((.*?)\);/g)].map(m => m[1]).filter(a => a !== 'id, opts');
  assert.ok(calls.length >= 5);
  for (const a of calls) assert.match(a, /^(id|p\.stage|t\.getAttribute\("data-setup-stage"\)), \{ [a-zA-Z:, ]+ \}$/, 'setStage(' + a + ')');
  /* id = the pressed control's own attribute; p.stage = the value the person stored earlier, re-applied on load */
  assert.match(page, /if \(p\.stage\) setStage\(p\.stage, \{ goto: false \}\);/);
  assert.match(page, /var id = btn\.getAttribute\("data-age"\);/, 'the "나의 라이프 스테이지" dialog stores the band the person pressed');
  assert.doesNotMatch(page, /livon\.mlStore|livon\.cmStore|recentSearches|exRecent|livon\.aiStore/, 'the Life Stage page reads no private store');
  /* the hub reads My Life only to add a checklist the person approved, and Community only for public posts */
  const approved = hub.slice(hub.indexOf('function addTodos(spec, ids)'), hub.indexOf('function saveAck('));
  assert.equal((hub.match(/KEY_ML/g) || []).length, 5); assert.equal((approved.match(/KEY_ML/g) || []).length, 4, 'My Life is touched only inside the two "add after approval" functions');
  assert.match(hub, /!p\.deleted && !p\.draft && p\.id && p\.title && \(!p\.visibility \|\| p\.visibility === "public"\)/);
  const { hub: H, ls } = app({ local: { [ML]: { v: 2, todos: [{ id: 't', title: '은퇴 연금 수령 준비', due: '2026-10-06' }], health: [{ id: 'h', title: '혈압' }] }, 'livon.exRecent': ['은퇴', '연금'] } });
  H.runSearch(st('연금', { stage: '60' })); H.runSearch(st('', { stage: '70' })); H.search('독립', { stage: '20s' });
  assert.equal(ls.getItem(STAGE), null, 'filtering by a stage is not choosing "my" stage');
  assert.deepEqual([...ls._m.keys()].filter(k => !['livon.mlStore.v1', 'livon.exRecent', 'livon.userData.meta.v1'].includes(k)), [], 'searching writes nothing');
});

test('LS2-09 truthfulness: no popularity, ranking, rating or score wording anywhere in Life Stage', () => {
  const BANNED = /인기|많이 찾는|많이 겪는|많이 본|조회수|랭킹|순위|베스트|평점|별점|Popular|Trending|Ranking|추천 점수|성공 확률|합격률|당첨 확률|자격이 됩니다|대상입니다\./;
  for (const [name, src] of [['life-hub.js', code(HUB)], ['life-page.js', code(PAGE)]]) {
    const strings = (src.match(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g) || []).join('\n');
    assert.doesNotMatch(strings, BANNED, name);
  }
  assert.match(PAGE, /<p class="lv-life-kicker">Questions<\/p><h3 class="lv-life-title lv-life-title--md">LIVON AI에게 물어볼 질문 예시<\/h3>/);
  assert.match(PAGE, /<p class="lv-life-kicker">Topics<\/p><h3 class="lv-life-title lv-life-title--md">먼저 살펴볼 주제<\/h3>/);
  assert.match(PAGE, /이 시기의 Life Event/); assert.match(PAGE, /함께 볼 콘텐츠/);
  const life = INDEX.slice(INDEX.indexOf('id="life" data-lv-screen="life"'), INDEX.indexOf('id="today" data-lv-screen="today"'));
  assert.ok(life.length > 1000); assert.doesNotMatch(life.replace(/<!--[\s\S]*?-->/g, ''), BANNED);
  assert.doesNotMatch(fs.readFileSync(path.join(ROOT, 'scripts/livon-seo-build.mjs'), 'utf8'), /많이 찾는 주제|인기 주제/);
  /* the data: no rating, review, ranking or view-count field on any row */
  const keys = new Set(); JSON.stringify(DATA, (k, v) => { keys.add(k); return v; });
  for (const k of keys) assert.doesNotMatch(k, /rating|score|rank|popular|views?$|likes?$|review|star/i, 'field ' + k);
  for (const t of DATA.topics) assert.doesNotMatch(t.title + t.description, /인기|랭킹|평점|1위/, t.id);
  /* the editor-picked topics keep the file's own order: nothing sorts them by a number */
  assert.match(HUB, /s\.featuredTopicIds\.map\(Repo\.topic\)\.filter\(Boolean\)\.map\(function \(t\) \{ return UI\.TopicCard\(t\); \}\)/);
});

test('LS2-10 source attribution and dates: LIVON is named as the author of its own guides, never as the official body; dates come from the data only', () => {
  assert.match(HUB, /LIVON이 정리한 일반 생활 안내입니다\. 공식 기관의 안내가 아니며, 자격·금액·기한은 각 기관의 공식 사이트에서 확인해 주세요\./);
  assert.match(HUB, /\(validDay\(Repo\.data\.updatedAt\) \? " 내용 정리일 " \+ esc\(Repo\.data\.updatedAt\) \+ "\." : ""\)/);
  assert.match(HUB, /\(validDay\(p\.checkedAt\) \? " · LIVON 링크 확인 " \+ esc\(p\.checkedAt\) : ""\)/);
  assert.match(HUB, /LIVON은 정책 대상 여부를 판단하지 않습니다\. 공식 포털에서 최신 공고와 조건을 확인하세요\./);
  /* external links: https only, new window, announced as such */
  assert.match(HUB, /function safeHttp\(url\) \{ return \/\^https:\\\/\\\/\[a-z0-9\.-\]\+\(\\\/\|\$\)\/i\.test\(String\(url \|\| ""\)\) \? url : ""; \}/);
  assert.match(HUB, /target="_blank" rel="noopener noreferrer">' \+ esc\(text\) \+ ' <span aria-hidden="true">↗<\/span><span class="lh-sr"> \(새 창\)<\/span><\/a>'/);
  /* no date is made up: the only clock read in the hub is the "not in the future" check and the modal/AI timestamps */
  const c = code(HUB);
  assert.doesNotMatch(c, /checkedAt\s*=\s*(new Date|Date\.now|today)/); assert.doesNotMatch(c, /updatedAt\s*=\s*(new Date|Date\.now)/);
  assert.doesNotMatch(c, /new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/, 'today\'s date is never printed as a check date');
  const { hub } = app();
  for (const p of DATA.policies) assert.equal(hub.repo.policy(p.id).checkedAt, p.checkedAt ?? null, p.id + ' date unchanged by loading');
  assert.equal(DATA.updatedAt, '2026-09-28', 'the content date is the file\'s own, not the day the code changed');
  assert.equal(spawnSync('git', ['diff', '--quiet', BASE_COMMIT, '--', 'livon/life-topics.json'], { cwd: ROOT }).status === 1, false, 'life-topics.json is not edited by V2');
});

test('LS2-11 one saved store: Life Stage saves only through the shared LIVON saved list; the old Life Stage-only list is never written', () => {
  for (const [name, src] of [['life-hub.js', code(HUB)], ['life-page.js', code(PAGE)]]) {
    assert.doesNotMatch(src, /lifeSavedLocal|KEY_SAVED/, name + ' has no list of its own');
    assert.doesNotMatch(src, /writeJSON\([^)]*[Ss]aved/, name);
  }
  assert.match(PAGE, /P\.saveItem\(\{ id: saveKey\(name\), title: name, label: name, type: "life", href: "#life", source: "라이프 스테이지" \}\);/);
  assert.match(HUB, /window\.LivonPlatform\.saveItem\(\{ id: id, title: item\.title/); assert.match(HUB, /window\.LivonPlatform\.removeSave\(id\);/);
  const { hub, saves, ls } = app();
  const t = DATA.topics[0];
  assert.equal(hub._test.doSave({ type: 'topic', id: t.id, title: t.title, href: '#life/' + t.stageSlug + '/' + t.slug, lifeStage: t.lifeStageId }), true);
  assert.deepEqual([...saves.keys()], ['life-hub:topic:' + t.id]); assert.equal(saves.get('life-hub:topic:' + t.id).source, '라이프 스테이지');
  assert.equal(hub._test.isSaved('topic', t.id), true);
  assert.equal(hub._test.doSave({ type: 'topic', id: t.id, title: t.title, href: '#x' }), false, 'pressing again removes it');
  assert.equal(saves.size, 0); assert.equal(ls.getItem('livon.lifeSavedLocal'), null); assert.equal(ls.getItem(STAGE), null, 'saving stores no stage');
});

test('LS2-12 AI and account: Life Stage calls no AI endpoint and turns on no sync; "LIVON AI에게 물어보기" only prepares a draft the person sends', () => {
  const c = code(HUB) + code(PAGE);
  assert.doesNotMatch(c, /\/api\/livon\/(chat|ai)|openai|api\.openai\.com|LivonApi\.url|getIdToken|Authorization/i);
  assert.doesNotMatch(c, /LIVON_ACCOUNT_SYNC_PUBLIC\s*=|LivonSync\.(onSignedIn|syncNow|approveImport)/);
  assert.equal((code(HUB).match(/fetch\(/g) || []).length, 1, 'one request: the public Life Stage data file');
  assert.match(HUB, /fetch\(DATA_URL, \{ cache: "no-cache" \}\)/); assert.match(HUB, /var DATA_URL = "\/livon\/life-topics\.json\?v=20261001cq1";/);
  const { hub, ctx, fetched, ls } = app({ local: { [ML]: { v: 2, journal: [{ id: 'j', title: SECRET, body: SECRET }] } } });
  hub._test.askAI({ q: '독립 계획을 만들어 줘.', stage: '20', stageLabel: '20대', topicId: '20s.first-independence', topicTitle: '첫 독립 준비', category: '독립', url: '#life/20s/first-independence' });
  const draft = JSON.parse(ls.getItem('livon.aiPrompt'));
  assert.equal(draft.draftOnly, true); assert.ok(!JSON.stringify(draft).includes(SECRET), 'no private record in the draft');
  assert.deepEqual(fetched, [], 'nothing was sent anywhere'); assert.equal(ctx.location.hash, 'ai-chat');
  assert.equal(hub.account.isSignedIn(), false); assert.equal(hub.account.syncAvailable, false);
  assert.doesNotMatch(c, /클라우드에 (저장|백업)|동기화됨|백업 완료/);
});

test('LS2-13 cache keys: only the changed Life Stage assets move to ?v=20261007ls1; Explore keeps ex1, Today keeps c7, the data file keeps its key', () => {
  for (const f of ['life-hub.js', 'life-page.js', 'life-page.css']) assert.match(INDEX, new RegExp('/livon/' + f.replace(/\./g, '\\.') + '\\?v=20261007ls1"'), f);
  assert.equal((INDEX.match(/\?v=20261007ls1/g) || []).length, 3);
  /* explore-page.js moved on later in LIVON Next V1 (?v=20261010nx1) */
  for (const f of ['explore-page.js', 'explore-search.js', 'explore-page.css', 'livon-platform.js']) assert.match(INDEX, new RegExp('/livon/' + f.replace(/\./g, '\\.') + '\\?v=20261006ex1' + (f === 'explore-page.js' ? '|/livon/explore-page\\.js\\?v=20261010nx\\d' : '') + '"'), f);
  assert.match(INDEX, /\/livon\/today-page\.js\?v=(20261004c7|20261010nx\d)"/); /* LIVON Next V1 bumped Today (typed sections stay honest when empty) */
  for (const f of ['life-data.js', 'life-events-data.js']) assert.match(INDEX, new RegExp('/livon/' + f.replace(/\./g, '\\.') + '\\?v=20261001cq1"'), f + ' unchanged');
  const base = f => spawnSync('git', ['show', BASE_COMMIT + ':livon/' + f], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 });
  /* explore-page.js and today-page.js were changed later by LIVON Next V1 — the Life Stage phase itself left them alone */
  for (const f of ['explore-search.js', 'livon-platform.js', 'life-topics.json', 'life-data.js']) { const b = base(f); if (b.status === 0) assert.equal(b.stdout, read(f), f + ' is byte-identical to the base'); }
  assert.ok(INDEX.indexOf('/livon/life-hub.js') < INDEX.indexOf('/livon/explore-search.js'), 'the hub loads before the shared index (the index reads the hub\'s data lazily)');
});

test('LS2-14 touch targets (CSS contract): Life Stage controls are given a 44px minimum; search controls have their own', () => {
  assert.match(CSS, /#life :is\(\.lv-life-btn, \.lv-life-btn--sm, \.lv-life-sticky__link, \.lv-life-chips button, \.lv-life-fields button,[^)]*\) \{ min-height: 44px; \}/);
  assert.match(CSS, /#life :is\(\.lv-life-sticky__link, \.lv-life-aiq a, \.lh-toc a, \.lv-ls-breadcrumb a, \.lh-crumbs a\) \{ display: inline-flex; align-items: center; min-height: 44px; min-width: 44px; \}/);
  assert.match(CSS, /#life \.lh-search__clear \{[^}]*width: 44px; min-height: 44px;/);
  assert.match(CSS, /#life \.lh-applied__chip, #life \.lh-applied__reset \{[^}]*min-height: 44px;/);
  assert.match(CSS, /#life \.lh-filters button \{ min-height: 44px; min-width: 44px; \}/);
  assert.match(CSS, /@media \(max-width: 640px\) \{ #life \.lh-results \{ grid-template-columns: minmax\(0, 1fr\); \} \}/, 'one column on a phone');
});

test('LS2-15 markup contract: labelled filter groups with pressed state, removable conditions, a live count, a clear button, a labelled search box', () => {
  assert.match(HUB, /role="group" aria-labelledby="lh-f-' \+ attr \+ '">/);
  assert.match(HUB, /data-lh-remove="' \+ c\.key \+ '" aria-label="' \+ esc\(c\.label\) \+ ' 조건 지우기">/);
  assert.match(HUB, /<button type="button" class="lh-applied__reset" data-lh-reset>모두 지우기<\/button>/);
  assert.match(HUB, /class="lh-search__clear" data-lh-clear aria-label="검색어 지우기"/);
  assert.match(HUB, /<form class="lh-search" role="search" data-lh-search-form/); assert.match(HUB, /class="lh-sr">라이프 스테이지 검색<\/label>/);
  assert.match(HUB, /type="search" name="q" maxlength="60"/); assert.match(HUB, /enterkeyhint="search"/);
  assert.match(HUB, /role="status" aria-live="polite" data-lh-count-line>/);
  /* filters exist only for metadata the index really has: stage, kind, area. No region, price, rating or "official only" switch. */
  assert.deepEqual([...HUB.matchAll(/filterGroup\("([^"]+)", "([a-z]+)"/g)].map(m => m[1] + ':' + m[2]), ['생애 단계:stage', '정보 종류:type', '분야:area']);
  assert.doesNotMatch(code(HUB), /data-lh-filter-(region|price|rating|sort|official)/);
  assert.match(SEARCH, /var CATS = \[/, 'the areas are the shared index\'s own list');
});

/* ═════════ browser ═════════ */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const skip = !(fs.existsSync(PW) && fs.existsSync(CHROME)) && 'no local Chromium';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const baseFile = f => { const r = spawnSync('git', ['show', BASE_COMMIT + ':livon/' + f], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }); return r.status === 0 ? r.stdout : null; };
const OLD = { hub: null, page: null, index: null };
const skipMix = skip || ((OLD.hub = baseFile('life-hub.js')) && (OLD.page = baseFile('life-page.js')) && (OLD.index = baseFile('index.html')) ? false : 'base commit ' + BASE_COMMIT + ' missing');
let B = null, SERVER = null, BASE = '', OVERRIDE = {};
async function boot() {
  if (B) return;
  const { chromium } = await import(PW);
  SERVER = await new Promise(resolve => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      if (OVERRIDE[p] != null) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(OVERRIDE[p]); return; }
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
async function open(hash = '#life', { width = 1280, height = 900, local = {}, record = null, override = {} } = {}) {
  await boot();
  OVERRIDE = override;
  const ctx = await B.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  await ctx.route('**/*', r => { const u = r.request().url(); if (record) record.push({ method: r.request().method(), url: u, body: r.request().postData() || '' }); return u.startsWith(BASE) ? r.continue() : r.abort(); });
  await ctx.addInitScript(([pz, loc]) => { try { if (!sessionStorage.getItem('ls2-seeded')) { sessionStorage.setItem('ls2-seeded', '1'); localStorage.setItem('livon.personalization.v1', pz); sessionStorage.setItem('livon.lifeHub.saveAck', 'true'); for (const [k, v] of Object.entries(loc)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } } catch (e) {} }, [SKIPPED, local]);
  const pg = await ctx.newPage();
  pg._errors = []; pg._console = [];
  pg.on('pageerror', e => pg._errors.push(e.message)); pg.on('console', m => pg._console.push(m.text()));
  await pg.goto(BASE + '/livon/' + hash, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(1300);
  return pg;
}
const go = async (pg, hash, wait = 600) => { await pg.evaluate(h => { location.hash = h; }, hash); await pg.waitForTimeout(wait); };
const close = pg => pg.context().close();
const hashOf = pg => pg.evaluate(() => decodeURIComponent(location.hash));
const countLine = pg => pg.locator('[data-lh-count-line]').textContent();
const focusOf = pg => pg.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute('data-lh-q') != null ? 'q' : [...a.attributes].filter(x => /^data-lh-/.test(x.name)).map(x => x.name + '=' + x.value).join(',') || a.tagName) : ''; });
/* layout: no page-level horizontal scroll, nothing pushed past the viewport outside its own scroll area, no control under 44px
   (a checkbox inside a 44px label is reached through the label; a link inside a sentence is text) */
async function layout(pg, sel) {
  return pg.evaluate(s => {
    const vw = document.documentElement.clientWidth, root = document.querySelector(s);
    const scrollParent = e => { for (let p = e.parentElement; p && p !== root; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true; } return false; };
    const vis = e => e.offsetParent && !e.closest('[hidden]');
    const over = [...root.querySelectorAll('*')].filter(e => vis(e) && !scrollParent(e) && (e.getBoundingClientRect().right > vw + 1) && e.getBoundingClientRect().width > 0).map(e => e.tagName + '.' + e.className.toString().slice(0, 30));
    const labelled = e => e.matches('input[type=checkbox],input[type=radio]') && e.closest('label') && e.closest('label').getBoundingClientRect().height >= 44;
    const small = [...root.querySelectorAll('a,button,select,input,summary')].filter(e => vis(e) && getComputedStyle(e).display !== 'inline' && e.getAttribute('tabindex') !== '-1' && !labelled(e)).map(e => { const b = e.getBoundingClientRect(); return [(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 20), Math.round(b.width), Math.round(b.height)]; }).filter(x => x[1] < 44 || x[2] < 44);
    const clipped = [...root.querySelectorAll('button,a')].filter(e => vis(e) && e.scrollWidth > e.clientWidth + 2 && ['hidden', 'clip'].includes(getComputedStyle(e).overflowX)).map(e => e.textContent.trim().slice(0, 20));
    return { pageScroll: document.documentElement.scrollWidth > vw, over: [...new Set(over)].slice(0, 5), small: small.slice(0, 8), clipped: clipped.slice(0, 5) };
  }, sel);
}
const PRIVATE = {
  [ML]: { v: 2, todos: [{ id: 't1', title: SECRET + ' 연금 수령 신청', due: '2026-10-06', createdAt: 1, updatedAt: 1 }], events: [{ id: 'e1', title: SECRET + ' 은퇴식', date: '2026-10-06', createdAt: 1, updatedAt: 1 }],
    journal: [{ id: 'j1', title: SECRET + ' 일기', body: SECRET + ' 독립 고민', createdAt: 1 }], health: [{ id: 'h1', title: SECRET + ' 혈압', createdAt: 1 }], transactions: [{ id: 'x1', title: SECRET + ' 월세', amount: 1, createdAt: 1 }] },
  [CM]: { v: 2, posts: [{ id: 'p1', title: SECRET + ' 초안 독립', body: '독립 x', draft: true, createdAt: 1 }, { id: 'p2', title: SECRET + ' 비공개 독립', body: '독립 x', visibility: 'private', createdAt: 1 },
    { id: 'p3', title: SECRET + ' 멤버 독립', body: '독립 x', visibility: 'members', createdAt: 1 }, { id: 'p4', title: SECRET + ' 삭제 독립', body: '독립 x', deleted: true, createdAt: 1 }] },
  'livon.exRecent': [SECRET + ' 검색']
};

test('LS2-20 landing: one h1, a stage chooser the person operates, one search box, truthful section names, no stage chosen for them', { skip }, async () => {
  const pg = await open('#life');
  const r = await pg.evaluate(() => ({
    h1: [...document.querySelectorAll('#life h1')].filter(h => h.offsetParent).length, search: document.querySelectorAll('#life-explore [data-lh-home-search] form[role=search]').length,
    label: (document.querySelector('[data-lv-life-stage-label]') || {}).textContent, stored: localStorage.getItem('livon.lifeStage'),
    rail: document.querySelectorAll('[data-lv-life-rail] [data-stage]').length, railOn: document.querySelectorAll('[data-lv-life-rail] .is-on').length,
    heads: [...document.querySelectorAll('#life h2, #life h3')].filter(h => h.offsetParent).map(h => h.textContent.trim()), text: document.getElementById('life').innerText }));
  assert.equal(r.h1, 1); assert.equal(r.search, 1); assert.equal(r.rail, 7); assert.equal(r.railOn, 0, 'no stage is pre-selected');
  assert.equal(r.label, '선택된 라이프 스테이지: 없음'); assert.equal(r.stored, null);
  for (const h of ['먼저 살펴볼 주제', 'LIVON AI에게 물어볼 질문 예시', '이 시기의 Life Event', '주제·서비스 유형·공식 포털 검색']) assert.ok(r.heads.includes(h), h + ' / ' + r.heads.join(' | '));
  assert.doesNotMatch(r.text, /인기 질문|많이 찾는|많이 겪는|조회수|랭킹|평점/);
  assert.match(r.text, /생애 단계는 직접 고릅니다\. LIVON은 나이나 기록으로 단계를 추측하지 않습니다\./);
  /* the person chooses: the dialog stores exactly the band that was pressed */
  await pg.locator('[data-lv-life-find]').first().click(); await pg.waitForTimeout(300);
  await pg.locator('#lv-life-age-modal [data-age="40"]').click(); await pg.waitForTimeout(500);
  assert.equal(await pg.evaluate(() => localStorage.getItem('livon.lifeStage')), '"40"');
  assert.match(await pg.locator('[data-lv-life-stage-label]').textContent(), /^선택된 라이프 스테이지: 40대/);
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('LS2-21 search: Enter submits, the count is announced, clear empties the box and the URL, no result offers a way out, reload and Back/Forward restore', { skip }, async () => {
  const pg = await open('#life');
  await pg.locator('[data-lh-home-search] [data-lh-q]').fill('연금'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
  assert.equal(await hashOf(pg), '#life/search/연금');
  const n = Number((await countLine(pg)).match(/^‘연금’ 결과 (\d+)건$/)[1]);
  assert.ok(n > 0); assert.equal(await pg.locator('.lh-results > li').count(), Math.min(n, 24));
  assert.equal(await pg.locator('[data-lh-count-line]').getAttribute('role'), 'status');
  assert.equal(await focusOf(pg), 'q', 'focus stays in the search box after submitting');
  assert.equal(await pg.locator('#life-hub-view [data-lh-q]').inputValue(), '연금');
  /* reload keeps the query; Back returns to the landing; Forward returns to the results */
  await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(1300);
  assert.equal(await hashOf(pg), '#life/search/연금'); assert.match(await countLine(pg), new RegExp('결과 ' + n + '건$'));
  await pg.locator('#life-hub-view [data-lh-q]').fill('zzqq없는말'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(600);
  assert.match(await countLine(pg), /^‘zzqq없는말’ 결과 0건$/);
  assert.match(await pg.locator('#life-hub-view .lh-empty').innerText(), /조건에 맞는 결과가 없습니다\.[\s\S]*탐색에서 검색/);
  await pg.goBack(); await pg.waitForTimeout(600);
  assert.equal(await hashOf(pg), '#life/search/연금'); assert.match(await countLine(pg), new RegExp('결과 ' + n + '건$'));
  await pg.goForward(); await pg.waitForTimeout(600);
  assert.equal(await hashOf(pg), '#life/search/zzqq없는말');
  /* clear: one press empties the field and the URL, focus returns to the field, the button hides */
  const clear = pg.locator('#life-hub-view [data-lh-clear]');
  assert.equal(await clear.isVisible(), true); await clear.click(); await pg.waitForTimeout(600);
  assert.equal(await hashOf(pg), '#life/search/'); assert.equal(await pg.locator('#life-hub-view [data-lh-q]').inputValue(), '');
  assert.equal(await focusOf(pg), 'q'); assert.equal(await pg.locator('#life-hub-view [data-lh-clear]').isVisible(), false);
  assert.match(await pg.locator('#life-hub-view .lh-empty').innerText(), /검색어를 입력하거나 조건을 골라 주세요\./);
  assert.equal(await countLine(pg), '');
  /* typing shows the clear button again without submitting */
  await pg.locator('#life-hub-view [data-lh-q]').type('독'); assert.equal(await pg.locator('#life-hub-view [data-lh-clear]').isVisible(), true);
  assert.equal(await pg.evaluate(() => localStorage.getItem('livon.lifeStage')), null);
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('LS2-22 filters: pressed state, URL state, focus stays on the pressed filter, single remove, 모두 지우기, keyboard — and no stage is stored', { skip }, async () => {
  const pg = await open('#life/search/' + encodeURIComponent('주거'));
  const total = Number((await countLine(pg)).match(/결과 (\d+)건/)[1]);
  const groups = await pg.evaluate(() => [...document.querySelectorAll('#life-hub-view [role=group]')].map(g => document.getElementById(g.getAttribute('aria-labelledby')).textContent + ':' + g.querySelectorAll('button').length));
  assert.deepEqual(groups, ['생애 단계:8', '정보 종류:4', '분야:13']);
  await pg.locator('[data-lh-filter-stage="20"]').click(); await pg.waitForTimeout(600);
  assert.equal(await hashOf(pg), '#life/search/주거?stage=20');
  assert.equal(await pg.locator('[data-lh-filter-stage="20"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await pg.locator('[data-lh-filter-stage=""]').getAttribute('aria-pressed'), 'false');
  assert.equal(await focusOf(pg), 'data-lh-filter-stage=20', 'focus is kept on the filter that was pressed');
  const n20 = Number((await countLine(pg)).match(/결과 (\d+)건/)[1]); assert.ok(n20 > 0 && n20 < total);
  assert.ok((await pg.locator('.lh-results .lv-life-svc__n').allTextContents()).every(t => /^주제 · 20대 · /.test(t)));
  /* keyboard: Tab to the next group, Space presses, Enter presses */
  await pg.locator('[data-lh-filter-type="life"]').focus(); await pg.keyboard.press('Space'); await pg.waitForTimeout(600);
  assert.equal(await hashOf(pg), '#life/search/주거?stage=20&type=life'); assert.equal(await focusOf(pg), 'data-lh-filter-type=life');
  await pg.locator('[data-lh-filter-area="housing"]').focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(600);
  assert.equal(await hashOf(pg), '#life/search/주거?stage=20&type=life&area=housing'); assert.equal(await focusOf(pg), 'data-lh-filter-area=housing');
  assert.deepEqual(await pg.locator('.lh-applied__chip').evaluateAll(els => els.map(e => e.getAttribute('aria-label'))), ['검색어 ‘주거’ 조건 지우기', '생애 단계 20대 조건 지우기', '정보 종류 주제 조건 지우기', '분야 주거 조건 지우기']);
  /* single remove: only that condition goes, focus lands on a remaining remove button */
  await pg.locator('[data-lh-remove="stage"]').click(); await pg.waitForTimeout(600);
  assert.equal(await hashOf(pg), '#life/search/주거?type=life&area=housing'); assert.match(await focusOf(pg), /^data-lh-remove=/);
  assert.equal(await pg.locator('[data-lh-filter-stage=""]').getAttribute('aria-pressed'), 'true');
  /* pressing the chosen area again clears it */
  await pg.locator('[data-lh-filter-area="housing"]').click(); await pg.waitForTimeout(600);
  assert.equal(await hashOf(pg), '#life/search/주거?type=life');
  /* Back restores the previous conditions */
  await pg.goBack(); await pg.waitForTimeout(600);
  assert.equal(await hashOf(pg), '#life/search/주거?type=life&area=housing'); assert.equal(await pg.locator('[data-lh-filter-area="housing"]').getAttribute('aria-pressed'), 'true');
  /* reset all → the idle prompt (not a failure), focus in the search box */
  await pg.locator('[data-lh-reset]').first().click(); await pg.waitForTimeout(600);
  assert.equal(await hashOf(pg), '#life/search/'); assert.equal(await pg.locator('.lh-applied').count(), 0); assert.equal(await focusOf(pg), 'q');
  assert.match(await pg.locator('#life-hub-view .lh-empty').innerText(), /검색어를 입력하거나 조건을 골라 주세요\./);
  /* a stage on its own lists that stage; the filter is never stored as "my stage" */
  await pg.locator('[data-lh-filter-stage="70"]').click(); await pg.waitForTimeout(600);
  assert.match(await countLine(pg), /^결과 34건$/);
  assert.equal(await pg.locator('.lh-results > li').count(), 24); await pg.locator('[data-lh-more]').click(); await pg.waitForTimeout(500);
  assert.equal(await pg.locator('.lh-results > li').count(), 34); assert.equal(await pg.locator('[data-lh-more]').count(), 0);
  assert.equal(await pg.evaluate(() => document.activeElement.closest('.lh-results > li') === document.querySelectorAll('.lh-results > li')[24]), true, 'focus moves to the first newly shown result');
  assert.equal(await pg.evaluate(() => localStorage.getItem('livon.lifeStage')), null, 'LIFE STAGE INFERENCE = 0');
  /* a pasted URL with unknown values shows no invented chip */
  await go(pg, '#life/search/x?stage=90&type=community&area=zzz', 600);
  assert.deepEqual(await pg.locator('.lh-applied__chip').allTextContents(), ['검색어 ‘x’ ×']);
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('LS2-23 detail: direct URL, reload, Back/Forward, heading focus, LIVON named as author, official links https + new window + data\'s own check date', { skip }, async () => {
  const t = DATA.topics.find(x => x.id === '20s.first-independence');
  const pg = await open('#life/20s/first-independence');
  const r = await pg.evaluate(() => {
    const v = document.getElementById('life-hub-view');
    return { title: v.querySelector('[data-lh-title-focus]').textContent, focused: document.activeElement === v.querySelector('[data-lh-title-focus]'), level: v.querySelector('[data-lh-title-focus]').getAttribute('aria-level'),
      source: v.querySelector('[data-lh-source]').textContent, heads: [...v.querySelectorAll('h3')].map(h => h.textContent),
      ext: [...v.querySelectorAll('a[target=_blank]')].map(a => [a.href.slice(0, 8), a.rel, a.textContent]),
      policies: [...v.querySelectorAll('.lh-policy')].map(p => [p.querySelector('h4').textContent, p.querySelector('.lh-dl').textContent]), text: v.innerText, docTitle: document.title };
  });
  assert.equal(r.title, t.title); assert.equal(r.focused, true); assert.equal(r.level, '1');
  assert.equal(r.source, 'LIVON이 정리한 일반 생활 안내입니다. 공식 기관의 안내가 아니며, 자격·금액·기한은 각 기관의 공식 사이트에서 확인해 주세요. 내용 정리일 2026-09-28.');
  for (const h of ['이 주제에서 알아야 할 것', '단계별 가이드', '체크리스트', '관련 정책', '관련 서비스', '관련 주제']) assert.ok(r.heads.includes(h), h);
  assert.ok(r.ext.length >= 1);
  for (const [scheme, rel, text] of r.ext) { assert.equal(scheme, 'https://'); assert.equal(rel, 'noopener noreferrer'); assert.match(text, /\(새 창\)$/); }
  assert.equal(r.policies.length, t.relatedPolicyIds.length);
  for (const [name, dl] of r.policies) {
    const p = DATA.policies.find(x => x.name === name); assert.ok(p, name);
    if (p.checkedAt) assert.ok(dl.includes('LIVON 링크 확인 ' + p.checkedAt), name); else assert.doesNotMatch(dl, /링크 확인/, name + ' has no date in the data → none on screen');
  }
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(!r.text.includes(today) || DATA.policies.some(p => p.checkedAt === today), 'today\'s date is not printed as a check date');
  assert.doesNotMatch(r.text, /평점|후기 \d|조회수|인기|추천 점수|합격률/);
  assert.match(r.docTitle, new RegExp(t.title));
  /* reload, then a related topic, then Back / Forward */
  await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(1300);
  assert.equal(await pg.locator('#life-hub-view [data-lh-title-focus]').textContent(), t.title);
  const next = await pg.locator('#lh-related .lh-card h4 a').first().getAttribute('href');
  await pg.locator('#lh-related .lh-card h4 a').first().click(); await pg.waitForTimeout(700);
  assert.equal(await pg.evaluate(() => location.hash), next);
  assert.equal(await pg.evaluate(() => document.activeElement === document.querySelector('#life-hub-view [data-lh-title-focus]')), true, 'the new page\'s heading takes focus');
  await pg.goBack(); await pg.waitForTimeout(700);
  assert.equal(await pg.evaluate(() => location.hash), '#life/20s/first-independence'); assert.equal(await pg.locator('#life-hub-view [data-lh-title-focus]').textContent(), t.title);
  await pg.goForward(); await pg.waitForTimeout(700);
  assert.equal(await pg.evaluate(() => location.hash), next);
  /* an address that does not exist says so and offers a way back */
  await go(pg, '#life/20s/no-such-topic', 600);
  assert.match(await pg.locator('#life-hub-view').innerText(), /주제를 찾을 수 없습니다\.[\s\S]*라이프 스테이지로/);
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('LS2-24 save / unsave: one shared store, shown in My Life › 저장 and the saved panel, survives reload; no Life Stage-only list', { skip }, async () => {
  const pg = await open('#life/search/' + encodeURIComponent('첫 독립'));
  const card = pg.locator('.lh-results > li').filter({ hasText: '첫 독립 준비' }).first();
  const btn = card.locator('[data-lh-save]');
  assert.equal(await btn.getAttribute('aria-pressed'), 'false');
  await btn.click(); await pg.waitForTimeout(500);
  assert.equal(await btn.getAttribute('aria-pressed'), 'true'); assert.equal(await btn.textContent(), '저장됨');
  assert.match(await pg.locator('#lh-status').textContent(), /저장했습니다/);
  let s = await pg.evaluate(() => ({ saves: LivonPlatform.listSaves('all').map(x => [x.id, x.source, x.href]), keys: Object.keys(localStorage).sort(), legacy: localStorage.getItem('livon.lifeSavedLocal'), stage: localStorage.getItem('livon.lifeStage') }));
  assert.deepEqual(s.saves, [['life-hub:topic:20s.first-independence', '라이프 스테이지', '#life/20s/first-independence']]);
  assert.equal(s.legacy, null); assert.equal(s.stage, null);
  assert.deepEqual(s.keys.filter(k => /saved|Saved/.test(k)), [], 'no other saved list');
  /* the same item is "saved" on its detail page and listed in My Life › 저장 after a reload */
  await pg.reload({ waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(1300);
  assert.equal(await pg.locator('.lh-results > li').filter({ hasText: '첫 독립 준비' }).first().locator('[data-lh-save]').getAttribute('aria-pressed'), 'true');
  await go(pg, '#life/20s/first-independence', 800);
  assert.equal(await pg.locator('.lh-actions [data-lh-save="topic"]').getAttribute('aria-pressed'), 'true');
  await go(pg, '#ml-saved', 900);
  assert.match(await pg.locator('#life-now').innerText(), /첫 독립 준비/);
  /* unsave from the detail page → gone everywhere */
  await go(pg, '#life/20s/first-independence', 800);
  await pg.locator('.lh-actions [data-lh-save="topic"]').click(); await pg.waitForTimeout(500);
  assert.equal(await pg.locator('.lh-actions [data-lh-save="topic"]').getAttribute('aria-pressed'), 'false');
  s = await pg.evaluate(() => ({ n: LivonPlatform.listSaves('all').length, legacy: localStorage.getItem('livon.lifeSavedLocal') }));
  assert.deepEqual(s, { n: 0, legacy: null });
  await go(pg, '#ml-saved', 900);
  assert.doesNotMatch(await pg.locator('#life-now').innerText(), /첫 독립 준비/);
  /* an official portal saved from Life Stage is the same record Explore knows */
  await go(pg, '#life/search/?type=policy', 800);
  await pg.locator('.lh-results [data-lh-save="policy"]').first().click(); await pg.waitForTimeout(400);
  assert.match(await pg.evaluate(() => LivonPlatform.listSaves('all')[0].id), /^life-hub:policy:pol-/);
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('LS2-25 private boundary (browser): My Life records and Community drafts / private / members / deleted posts never reach Life Stage screens, URLs, requests or the console', { skip }, async () => {
  const record = [];
  const pg = await open('#life', { local: PRIVATE, record });
  /* (a query the person types is echoed back to them; the private words are therefore searched for through other words) */
  for (const h of ['#life/search/' + encodeURIComponent('독립'), '#life/search/' + encodeURIComponent('연금 은퇴'), '#life/search/?stage=60', '#life/20s/first-independence', '#life/60s', '#life']) {
    await go(pg, h, 800);
    assert.ok(!(await pg.locator('#life').innerText()).includes(SECRET), h + ' shows no private text');
    assert.ok(!(await pg.evaluate(() => document.getElementById('life').innerHTML)).includes(SECRET), h + ' holds no private text in the markup');
  }
  await go(pg, '#life/search/' + encodeURIComponent(SECRET), 800);
  assert.match(await countLine(pg), /결과 0건$/, 'the private words match nothing in Life Stage');
  assert.equal(await pg.locator('.lh-results > li').count(), 0);
  assert.equal(await pg.evaluate(() => localStorage.getItem('livon.lifeStage')), null, 'a diary about retirement does not make the person "60대"');
  assert.equal(await pg.locator('[data-lv-life-stage-label]').textContent(), '선택된 라이프 스테이지: 없음');
  const outside = record.filter(r => !r.url.startsWith(BASE)).map(r => new URL(r.url).host);
  const allowed = ['fonts.googleapis.com', 'fonts.gstatic.com', 'fonts.cdnfonts.com', 'db.onlinewebfonts.com', 'd8j0ntlcm91z4.cloudfront.net', 'cdn.jsdelivr.net', 'images.higgs.ai'];
  assert.deepEqual([...new Set(outside)].filter(h => !allowed.includes(h)), [], 'no new host');
  for (const r of record) { assert.ok(!decodeURIComponent(r.url).includes(SECRET) || r.url.includes('#'), 'no private text in a request URL'); assert.ok(!r.body.includes(SECRET)); assert.ok(!/\/api\/livon\/(chat|ai|userdata)/.test(r.url), 'no AI or account request: ' + r.url); }
  assert.deepEqual(record.filter(r => r.method !== 'GET').map(r => r.url), [], 'Life Stage only reads public files');
  assert.ok(!pg._console.join('\n').includes(SECRET)); assert.deepEqual(pg._errors, []);
  assert.doesNotMatch(pg._console.join('\n'), /at \S+ \(http|Uncaught|TypeError|ReferenceError/, 'no stack trace in the console');
  await close(pg);
});

test('LS2-26 keyboard: Tab order through search → filters → results, Shift+Tab back, Escape closes the dialog and returns focus, no nested controls', { skip }, async () => {
  const pg = await open('#life/search/' + encodeURIComponent('연금'));
  assert.equal(await pg.evaluate(() => document.querySelectorAll('#life a a, #life a button, #life button button, #life button a').length), 0);
  await pg.locator('#life-hub-view [data-lh-q]').focus();
  const seq = [];
  for (let i = 0; i < 6; i++) { await pg.keyboard.press('Tab'); seq.push(await focusOf(pg)); }
  assert.deepEqual(seq.slice(0, 4), ['data-lh-clear=', 'BUTTON', 'data-lh-filter-stage=', 'data-lh-filter-stage=10']);
  await pg.keyboard.press('Shift+Tab'); assert.equal(await focusOf(pg), 'data-lh-filter-stage=' + (seq[4].split('=')[1] || ''));
  const ring = await pg.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; });
  assert.equal(ring, true, 'visible focus ring');
  /* the result title is a link; Enter opens the detail */
  await pg.locator('.lh-results h4 a').first().focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
  assert.match(await pg.evaluate(() => location.hash), /^#life\/[1-7]0s\/[a-z0-9-]+$/);
  /* dialog: "내 생활 할 일에 추가" opens a preview, Escape closes it, focus returns to the button, nothing was added */
  const add = pg.locator('#lh-check [data-lh-to-mylife]'); await add.focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(400);
  assert.equal(await pg.locator('.lh-modal [role=dialog]').count(), 1);
  assert.equal(await pg.evaluate(() => !!document.activeElement.closest('.lh-modal')), true, 'focus moves into the dialog');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
  assert.equal(await pg.locator('.lh-modal').count(), 0);
  assert.equal(await pg.evaluate(() => document.activeElement.hasAttribute('data-lh-to-mylife')), true, 'focus returns to the opener');
  assert.equal(await pg.evaluate(() => localStorage.getItem('livon.mlStore.v1')), null, 'nothing is written to My Life without approval');
  /* the guide steps are native disclosure widgets: Space toggles */
  const step = pg.locator('.lh-guide details').nth(1); await step.locator('summary').focus(); await pg.keyboard.press('Space');
  assert.equal(await step.evaluate(d => d.open), true);
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

for (const w of [320, 390, 768, 1024, 1440]) {
  test('LS2-3' + [320, 390, 768, 1024, 1440].indexOf(w) + ' ' + w + 'px: landing, stage, search, detail and service pages — no horizontal overflow, no clipping, no control under 44px', { skip }, async () => {
    const pg = await open('#life', { width: w, height: 900 });
    for (const h of ['#life', '#life/30s', '#stage-60', '#life/search/' + encodeURIComponent('건강') + '?stage=50&type=life&area=health', '#life/search/?type=policy', '#life/search/zz없는말', '#life/20s/first-independence', '#life/20s/c/housing', '#life/20s/first-independence/services', '#life/services/house-search']) {
      await go(pg, h, 700);
      const r = await layout(pg, '#life');
      assert.equal(r.pageScroll, false, w + ' ' + h + ' page scroll'); assert.deepEqual(r.over, [], w + ' ' + h + ' overflow');
      assert.deepEqual(r.small, [], w + ' ' + h + ' controls under 44px'); assert.deepEqual(r.clipped, [], w + ' ' + h + ' clipped');
    }
    assert.deepEqual(pg._errors, []);
    await close(pg);
  });
}

test('LS2-35 200% text: landing, search with every condition, and a detail page stay inside the viewport at 390px and 1440px', { skip }, async () => {
  for (const w of [390, 1440]) {
    const pg = await open('#life', { width: w });
    await pg.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await pg.waitForTimeout(300);
    for (const h of ['#life', '#life/search/' + encodeURIComponent('부모 돌봄 장기요양') + '?stage=50&type=life&area=care', '#life/50s/family-care-50', '#life/search/?type=policy']) {
      await go(pg, h, 700);
      const r = await layout(pg, '#life');
      assert.equal(r.pageScroll, false, w + ' ' + h); assert.deepEqual(r.over, [], w + ' ' + h); assert.deepEqual(r.clipped, [], w + ' ' + h);
      /* a control is reachable when it is inside the viewport's width, or inside a strip that scrolls sideways by itself */
      const lost = await pg.evaluate(() => {
        const strip = e => { for (let p = e.parentElement; p && p.id !== 'life'; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth) return true; } return false; };
        return [...document.querySelectorAll('#life-hub-view button, #life-hub-view a')].filter(e => e.offsetParent && !strip(e)).filter(e => { const b = e.getBoundingClientRect(); return !(b.width > 0 && b.left >= -1 && b.right <= document.documentElement.clientWidth + 1); }).map(e => e.textContent.trim().slice(0, 20));
      });
      assert.deepEqual(lost, [], w + ' ' + h + ' every control is reachable');
    }
    await close(pg);
  }
});

test('LS2-36 long text and odd rows: a very long Korean title, a row without optional fields and broken rows render without overflow; 228 good rows stay', { skip }, async () => {
  const bad = clone(DATA);
  bad.topics.push(null, { id: 'x' }, { ...clone(DATA.topics[0]), id: '20s.ls2-long', lifeStageId: '20', stageSlug: '20s', slug: 'ls2-long', categoryId: '20s.housing', category: '주거', title: '아주 긴 한국어 제목으로 줄바꿈과 잘림을 확인하는 라이프 스테이지 주제 '.repeat(3).trim(), description: '긴설명'.repeat(80) + 'https://example.com/' + 'a'.repeat(120),
    knowledge: 'x', guide: null, checklist: [{}], relatedTopicIds: ['nope'], relatedPolicyIds: ['pol-nope'], relatedServiceIds: 7, relatedContentIds: null, relatedClassIds: null, relatedPlaceIds: null, relatedToolIds: null, relatedExpertIds: null, aiPrompts: 'x' });
  bad.policies.push({ id: 'pol-ls2-http', name: 'LS2 http 포털', provider: '기관', sourceUrl: 'http://example.go.kr/', checkedAt: '2026-09-01' });
  for (const w of [320, 1280]) {
    const pg = await open('#life/search/' + encodeURIComponent('줄바꿈과 잘림'), { width: w, override: { '/livon/life-topics.json': JSON.stringify(bad) } });
    assert.match(await countLine(pg), /결과 1건$/);
    let r = await layout(pg, '#life'); assert.equal(r.pageScroll, false, w + ' results'); assert.deepEqual(r.over, []); assert.deepEqual(r.clipped, []);
    await go(pg, '#life/20s/ls2-long', 700);
    assert.match(await pg.locator('#life-hub-view [data-lh-title-focus]').textContent(), /^아주 긴 한국어 제목/);
    r = await layout(pg, '#life'); assert.equal(r.pageScroll, false, w + ' detail'); assert.deepEqual(r.over, []);
    assert.equal(await pg.evaluate(() => LivonLifeHub.repo.data.topics.length), 229);
    await go(pg, '#life/search/' + encodeURIComponent('LS2 http'), 600); assert.match(await countLine(pg), /결과 0건$/, 'a non-https source is never listed');
    await go(pg, '#life/20s/first-independence', 600); assert.equal(await pg.locator('#life-hub-view [data-lh-title-focus]').textContent(), '첫 독립 준비');
    assert.deepEqual(pg._errors, []);
    await close(pg);
  }
  /* a file that is not Life Stage data: an error state with a retry, the rest of LIVON keeps working */
  const pg = await open('#life/20s/first-independence', { override: { '/livon/life-topics.json': '{"stages":"x"}' } });
  assert.match(await pg.locator('#life-hub-view').innerText(), /정보를 불러오지 못했습니다\.[\s\S]*다시 시도/);
  await go(pg, '#explore', 700); assert.equal(await pg.locator('#explore').isVisible(), true);
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('LS2-37 connections: Explore\'s "#life" link, Today\'s Life Stage link, My Life and Community entry points all still land on Life Stage', { skip }, async () => {
  const pg = await open('#explore');
  assert.ok(await pg.locator('#explore a[href="#life"]').count() >= 1, 'Explore V2 keeps its Life Stage link');
  await pg.locator('#explore a[href="#life"]').first().click(); await pg.waitForTimeout(800);
  assert.equal(await pg.evaluate(() => document.documentElement.dataset.lvView), 'life'); assert.equal(await pg.locator('#life').isVisible(), true);
  /* the "탐색에서 함께 검색" link carries the query to Explore's own results */
  await go(pg, '#life/search/' + encodeURIComponent('취업'), 700);
  await pg.locator('#life-hub-view a[href^="#ex-results?q="]').first().click(); await pg.waitForTimeout(900);
  assert.equal(await hashOf(pg), '#ex-results?q=취업'); assert.match(await pg.locator('[data-lv-ex-count]').textContent(), /^\d+개 결과/);
  /* an Explore result that is a Life Stage topic opens the Life Stage detail */
  const lifeHit = pg.locator('#ex-results a[href^="#life/"]').first();
  if (await lifeHit.count()) { await lifeHit.click(); await pg.waitForTimeout(800); assert.match(await pg.evaluate(() => location.hash), /^#life\/[1-7]0s\//); assert.equal(await pg.locator('#life-hub-view').isVisible(), true); }
  await go(pg, '#today', 900);
  const todayLife = await pg.evaluate(() => [...document.querySelectorAll('#today a[href^="#life"]')].length);
  assert.ok(todayLife >= 1, 'Today keeps a Life Stage link');
  assert.equal(await pg.evaluate(() => localStorage.getItem('livon.lifeStage')), null);
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('LS2-38 cache window A: new page + old cached Life Stage scripts — the page works, the old search still answers, nothing is corrupted', { skip: skipMix }, async () => {
  const pg = await open('#life', { override: { '/livon/life-hub.js': OLD.hub, '/livon/life-page.js': OLD.page } });
  assert.deepEqual(pg._errors, []);
  assert.equal(await pg.locator('[data-lv-life-rail] [data-stage]').count(), 7);
  await go(pg, '#life/search/' + encodeURIComponent('독립') + '?stage=20', 800);
  assert.equal(await pg.locator('#life-hub-view').isVisible(), true, 'the old script still opens its search screen');
  assert.equal(await pg.locator('#life-hub-view [role=search]').count(), 1);
  await go(pg, '#life/20s/first-independence', 800);
  assert.equal(await pg.locator('#life-hub-view [data-lh-title-focus]').textContent(), '첫 독립 준비');
  const r = await layout(pg, '#life'); assert.equal(r.pageScroll, false);
  assert.equal(await pg.evaluate(() => localStorage.getItem('livon.lifeStage')), null);
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('LS2-39 cache window B: old cached page + new Life Stage scripts — no crash; search, filters and detail work; old saved entries are still read', { skip: skipMix }, async () => {
  const pg = await open('#life', { override: { '/livon/index.html': OLD.index, '/livon/': OLD.index }, local: { 'livon.lifeSavedLocal': ['예전에 저장한 서비스'] } });
  assert.deepEqual(pg._errors, []);
  assert.equal(await pg.locator('[data-lh-home-search] form').count(), 1, 'the new script adds its search box to the old page');
  await pg.locator('[data-lh-home-search] [data-lh-q]').fill('연금'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(800);
  assert.match(await countLine(pg), /^‘연금’ 결과 \d+건$/);
  await pg.locator('[data-lh-filter-stage="60"]').click(); await pg.waitForTimeout(600);
  assert.equal(await hashOf(pg), '#life/search/연금?stage=60');
  await go(pg, '#life/60s/pension-60', 800);
  const title = await pg.locator('#life-hub-view [data-lh-title-focus]').count();
  assert.equal(title, 1);
  /* the old Life Stage-only list is carried into the shared list by the platform (read once), and never written again */
  await go(pg, '#ml-saved', 900);
  const s = await pg.evaluate(() => ({ ids: LivonPlatform.listSaves('all').map(x => x.id), legacy: localStorage.getItem('livon.lifeSavedLocal') }));
  assert.ok(s.ids.includes('life:예전에 저장한 서비스'), s.ids.join(',')); assert.equal(s.legacy, '["예전에 저장한 서비스"]', 'the old list is left as it was');
  assert.deepEqual(pg._errors, []);
  await close(pg);
});

test('LS2-40 regressions around Life Stage: Explore results, Today, My Life, Community and LIVON AI still render without errors', { skip }, async () => {
  const pg = await open('#life/search/' + encodeURIComponent('독립'));
  for (const [h, sel] of [['#explore', '#explore'], ['#ex-results?q=' + encodeURIComponent('취업'), '#ex-results'], ['#today', '#today'], ['#life-now', '#life-now'], ['#ml-saved', '#life-now'], ['#community', '#community'], ['#livon-ai', '#livon-ai'], ['#life', '#life'], ['#life/40s', '#life']]) {
    await go(pg, h, 800);
    assert.equal(await pg.locator(sel).first().isVisible(), true, h);
    assert.ok((await pg.locator(sel).first().innerText()).length > 50, h + ' has content');
  }
  assert.equal(await pg.evaluate(() => document.querySelector('#today .lv-td-body > section').id), 'td-mytoday', 'Today V2 layout unchanged');
  assert.equal(await pg.evaluate(() => typeof window.LivonSearch.search('취업', {}).total), 'number');
  assert.deepEqual(pg._errors, []);
  await close(pg);
});
