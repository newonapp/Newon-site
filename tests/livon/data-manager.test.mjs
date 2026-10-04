// LIVON Data Management Tool V1 — local-only, read-only QA tool over the 530 curated records (DM-1 … DM-30).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { loadLivon } from '../../scripts/livon-data-quality.mjs';
import { startServer } from '../../scripts/livon-data-manager.mjs';

const ROOT = new URL('../../', import.meta.url);
const src = p => fs.readFileSync(new URL(p, ROOT), 'utf8');
const J = x => JSON.parse(JSON.stringify(x));
const deq = (a, b, m) => assert.deepEqual(J(a), J(b), m);
const CURATED = ['livon/life-topics.json', 'livon/life-data.js', 'livon/life-events-data.js', 'livon/today-data.js', 'livon/explore-data.js', 'livon/community-data.js'];
const hashFiles = () => CURATED.map(f => crypto.createHash('sha256').update(fs.readFileSync(new URL(f, ROOT))).digest('hex'));
const HASH_BEFORE = hashFiles();

function boot() {
  const ctx = loadLivon();
  vm.runInContext(src('livon/admin/data/data-manager-core.js'), ctx, { filename: 'data-manager-core.js' });
  return ctx;
}
const ctx = boot();
const DM = ctx.LivonDataManager;
const REPO_BEFORE = JSON.stringify(ctx.LivonScreenData.repository().all({ includeSamples: true, includeUnsourced: true, includeExpired: true, includeDuplicates: true }).map(e => { const { _raw, ...rest } = e; return rest; }));
const M = DM.createModel(ctx, { now: Date.parse('2026-10-01T00:00:00Z') });
const ids = list => J(list).map(r => r.id);

/* ───────── guard ───────── */
test('DM-1 production guard: local hosts only, never published, never linked from LIVON, no data loaded before the guard', () => {
  for (const h of ['localhost', '127.0.0.1', '[::1]', '::1', 'dm.localhost', 'newon.test']) assert.equal(DM.isAllowedHost(h), true, h);
  for (const h of ['www.newon.app', 'newon.app', 'newonapp.github.io', 'livon-api.vercel.app', '127.0.0.1.nip.io', 'localhost.evil.com', '', null]) assert.equal(DM.isAllowedHost(h), false, String(h));
  assert.match(src('scripts/publish-site.mjs'), /fs\.rmSync\(path\.join\(OUT, "livon", "admin"\)/);
  assert.match(src('scripts/publish-site.mjs'), /livon\/admin must not be published/);
  const ui = src('livon/admin/data/data-manager.js');
  assert.ok(ui.indexOf('DM.isAllowedHost(location.hostname)') < ui.indexOf('SCRIPTS.reduce'), 'guard runs before any data script is loaded');
  assert.doesNotMatch(src('livon/admin/data/index.html'), /livon-data-platform|today-data|life-topics/, 'the page itself references no data');
  for (const f of fs.readdirSync(new URL('livon/', ROOT)).filter(f => /\.(js|html)$/.test(f))) assert.doesNotMatch(src('livon/' + f), /admin\/data/, 'no link from ' + f);
  assert.match(src('livon/admin/data/index.html'), /noindex/);
  assert.doesNotMatch(src('livon/index.html'), /livon-content-quality|admin\/data|data-manager/, 'the public LIVON page loads none of the tool code');
  assert.doesNotMatch(src('livon/admin/data/data-manager.js') + src('livon/admin/data/index.html'), /type=["']password|passcode|prompt\(/i, 'no fake client-side password');
});

/* ───────── inventory & dashboard ───────── */
test('DM-2 inventory: the model holds all 530 curated records with the inspector fields', () => {
  assert.equal(M.records.length, 530);
  assert.equal(new Set(M.records.map(r => r.id)).size, 530);
  deq(ids(M.records).sort(), JSON.parse(src('tests/livon/fixtures/content-ids-v1.json')).ids);
  for (const k of ['id', 'type', 'title', 'summary', 'category', 'tags', 'keywords', 'lifeStage', 'lifeEvent', 'sourceClass', 'officialUrl', 'cta', 'screens', 'score', 'grade', 'flags', 'relationIds']) assert.ok(k in M.records[0], k);
});

test('DM-3 dashboard counts are computed from the data (not hard-coded) and add up', () => {
  const d = DM.dashboard(M);
  assert.equal(d.total, 530);
  deq(d.types, { lifeStage: 7, lifeEvent: 34, content: 259, policy: 17, service: 143, place: 10, class: 4, program: 9, provider: 21, communityContent: 26 });
  assert.equal(Object.values(d.types).reduce((a, b) => a + b, 0), d.total);
  assert.equal(Object.values(d.quality.grades).reduce((a, b) => a + b, 0), d.total);
  assert.equal(Object.values(d.sources).reduce((a, b) => a + b, 0), d.total);
  deq(d.sources, { 'LIVON-written': 463, Government: 44, 'Public institution': 21, Newon: 2, Other: 0 });
  assert.equal(d.flags.DATE_VERIFICATION_REQUIRED, 30);
  assert.equal(d.flags.UNSOURCED_SPECIFIC, 8);
  assert.equal(d.flags.MISSING_RELATION, 4);
  assert.equal(d.flags.DUPLICATE_CANDIDATE, 97);
  deq(d.dates, { dateVerificationRequired: 30, staleReviewRequired: 0, expired: 0, undatedTimeSensitive: 30 });
  deq(d.relations, { related: d.relations.related, missingRelation: 0, contentGap: 4, orphan: 0, broken: 0 });
  assert.ok(d.lifeStages['70대'] > 0 && Object.keys(d.lifeEvents).length === 34);
  /* change the data → the dashboard follows */
  const c2 = loadLivon({ patch: c => c.LivonTodayData.contents.push({ id: 'dm-extra', type: 'life', category: '테스트', title: '추가 카드', blurb: '관리 도구 테스트용 추가 카드입니다.', body: '', tags: ['테스트'], source: 'LIVON', status: 'guide' }) });
  vm.runInContext(src('livon/admin/data/data-manager-core.js'), c2);
  assert.equal(c2.LivonDataManager.dashboard(c2.LivonDataManager.createModel(c2)).total, 531);
});

/* ───────── explorer ───────── */
test('DM-4 type filter', () => {
  const r = DM.query(M, { filters: { type: 'policy' }, pageSize: 1000 });
  assert.equal(r.total, 17); assert.ok(r.all.every(x => x.type === 'policy'));
});
test('DM-5 category filter', () => {
  const r = DM.query(M, { filters: { category: '공식 포털' }, pageSize: 1000 });
  assert.equal(r.total, 17);
  assert.ok(DM.query(M, { filters: { category: '(none)' } }).total >= 0);
});
test('DM-6 age filter: general content is its own bucket; stage filters use lifeStages', () => {
  const g = DM.query(M, { filters: { age: 'general' }, pageSize: 1000 }).all;
  assert.ok(g.length > 0 && g.every(r => r.general));
  const s = DM.query(M, { filters: { age: '70' }, pageSize: 1000 }).all;
  assert.ok(s.length > 0 && s.every(r => r.ageGroup.includes('70')));
  assert.equal(DM.query(M, { filters: { lifeStage: '70' } }).total, s.length);
  assert.ok(DM.query(M, { filters: { lifeEvent: 'enroll' } }).total >= 3);
});
test('DM-7 flag filter', () => {
  for (const [f, n] of [['UNSOURCED_SPECIFIC', 8], ['DATE_VERIFICATION_REQUIRED', 30], ['MISSING_RELATION', 4], ['DUPLICATE_CANDIDATE', 97]]) assert.equal(DM.query(M, { filters: { flag: f } }).total, n, f);
  assert.equal(DM.query(M, { filters: { dateVerification: 'yes' } }).total, 30);
  assert.equal(DM.query(M, { filters: { hasOfficialUrl: 'yes' } }).total + DM.query(M, { filters: { hasOfficialUrl: 'no' } }).total, 530);
  assert.equal(DM.query(M, { filters: { hasRelations: 'yes' } }).total + DM.query(M, { filters: { hasRelations: 'no' } }).total, 530);
});
test('DM-8 quality filter and sorting', () => {
  const d = DM.dashboard(M);
  for (const g of ['Excellent', 'Good', 'Needs Review', 'Poor']) assert.equal(DM.query(M, { filters: { grade: g } }).total, d.quality.grades[g], g);
  const byScore = DM.query(M, { sort: 'score', pageSize: 1000 }).all;
  for (let i = 1; i < byScore.length; i++) assert.ok(byScore[i - 1].score <= byScore[i].score);
  const desc = DM.query(M, { sort: 'flags', dir: 'desc', pageSize: 5 }).items;
  assert.ok(desc[0].flags.length >= desc[4].flags.length);
  const titles = DM.query(M, { sort: 'title', pageSize: 1000 }).all.map(r => r.title);
  deq(titles, [...J(titles)].sort((a, b) => a.localeCompare(b, 'ko')));
  const p2 = DM.query(M, { pageSize: 50, page: 2 });
  assert.equal(p2.items.length, 50); assert.equal(p2.pages, 11);
});
test('DM-9 search across id, title, summary, tags and source; fast on 530 records', () => {
  assert.ok(DM.query(M, { q: '주거' }).total > 10);
  deq(ids(DM.query(M, { q: 'place-mmca' }).all), ['td:place-mmca']);
  assert.ok(DM.query(M, { q: '온통청년' }).all.some(r => r.id === 'pol:pol-youthcenter'));
  assert.equal(DM.query(M, { q: 'zzzz-없는-검색어' }).total, 0);
  const t = performance.now();
  for (let i = 0; i < 200; i++) DM.query(M, { q: '건강', filters: { grade: 'Excellent', age: 'general' }, sort: 'score', dir: 'desc' });
  assert.ok((performance.now() - t) / 200 < 10, 'a search + filter + sort pass takes < 10 ms');
});

test('DM-10 record inspector: every field, where it is shown, relations with status, incoming links, queue items', () => {
  const d = DM.inspect(M, 'topic:20s.first-independence');
  assert.equal(d.record.title, '첫 독립 준비');
  deq(d.exposure.filter(x => x.shown).map(x => x.screen), ['LIFE STAGE', 'SEARCH', 'MY LIFE', 'DETAIL']);
  assert.ok(d.relations.length && d.relations.every(g => g.items.every(x => x.status === 'ok' || x.status === 'external-tool')));
  assert.ok(d.incoming.length > 0);
  const p = DM.inspect(M, 'td:place-mmca');
  assert.ok(p.queue.some(q => q.rule === 'FIELD_CONFLICT'));
  assert.equal(DM.inspect(M, 'nope:x'), null);
});

/* ───────── review queue ───────── */
test('DM-11 review queue: deterministic priorities; P0 = 0 when nothing is blocking', () => {
  const Q = DM.reviewQueue(M);
  assert.equal(Q.counts.P0, 0);
  assert.equal(Q.byRule['P1 UNSOURCED_SPECIFIC'], 8);
  assert.equal(Q.byRule['P1 FIELD_CONFLICT'], 2);
  assert.equal(Q.byRule['P2 DATE_VERIFICATION_REQUIRED'], 30);
  assert.equal(Q.byRule['P3 CONTENT_GAP'], 4);
  assert.equal(Q.byRule['P4 DUPLICATE_CANDIDATE'], 97);
  assert.equal(Q.byRule['P4 CTA_REVIEW'], 47);
  assert.ok(Q.byRule['P4 TAXONOMY_REVIEW'] > 0);
  const again = DM.reviewQueue(DM.createModel(ctx));
  deq(again.items.map(i => i.priority + i.rule + i.recordId), Q.items.map(i => i.priority + i.rule + i.recordId));
  const order = Q.items.map(i => i.priority); deq(order, [...order].sort());
  /* a broken relation goes to P0 */
  const lt = JSON.parse(src('livon/life-topics.json'));
  lt.topics[0].relatedTopicIds.push('does-not-exist');
  const c3 = loadLivon({ lifeTopics: lt }); vm.runInContext(src('livon/admin/data/data-manager-core.js'), c3);
  const Q3 = c3.LivonDataManager.reviewQueue(c3.LivonDataManager.createModel(c3));
  assert.equal(Q3.counts.P0, 1); assert.equal(Q3.items[0].rule, 'BROKEN_RELATION');
});

test('DM-12 duplicate groups: every candidate shown with members, basis and the kept reason; nothing merged', () => {
  const G = DM.duplicateGroups(M);
  const members = new Set(G.flatMap(g => g.members.map(m => m.id)));
  assert.equal(members.size, 97);
  for (const g of G) { assert.ok(g.members.length >= 2); assert.match(g.basis, /same title|same official URL/); assert.match(g.reason, /^[A-Z_]+ — /); assert.equal(g.decision, 'keep'); for (const m of g.members) assert.ok('title' in m && 'type' in m && 'age' in m && 'category' in m && 'url' in m); }
  assert.ok(G.some(g => g.reasonCode === 'AGE_VARIANT'));
  assert.equal(M.records.length, 530);
});

test('DM-13 relations: Life Event → stages → topics, topic × kind matrix, no broken/self/duplicate relation', () => {
  const R = DM.relationExplorer(M);
  deq(R.issues, []);
  assert.equal(R.events.length, 34);
  assert.equal(R.events.find(e => e.id === 'le:enroll').status, 'linked');
  assert.equal(R.matrix.length, 7);
  assert.equal(R.matrix.reduce((n, m) => n + m.topics, 0), 228);
  assert.equal(R.topics.length, 228);
  assert.ok(R.topics.every(t => 'policy' in t && 'program' in t && 'service' in t && 'place' in t && 'guide' in t));
});

test('DM-14 content gaps: the 4 relation-less Life Events are CONTENT GAP (not errors); taxonomy gaps are found, nothing is generated', () => {
  const R = DM.relationExplorer(M);
  deq(R.events.filter(e => e.status === 'CONTENT GAP').map(e => e.id).sort(), ['le:abroad', 'le:car', 'le:freelance', 'le:long-trip']);
  assert.ok(R.events.every(e => e.status !== 'missing'), 'no missing relation that is an error');
  const G = DM.contentGaps(M);
  const areas = G.map(g => g.id);
  for (const id of ['freelancing', 'car', 'abroad', 'dementia']) assert.ok(areas.includes(id), id);
  assert.ok(G.some(g => g.kind === 'Life Stage × domain with no topic'));
  assert.equal(M.records.length, 530);
});

test('DM-15 source inspector: A–E classes with counts, official URLs and missing sources', () => {
  const S = DM.sources(M);
  deq(S.map(s => s.cls), ['A', 'B', 'C', 'D', 'E']);
  assert.equal(S.reduce((n, s) => n + s.count, 0), 530);
  const B = S.find(s => s.cls === 'B');
  assert.equal(B.official, B.count);
  assert.ok(B.names.some(n => n.name === '온통청년' && n.urls.includes('https://www.youthcenter.go.kr/')));
  assert.equal(S.reduce((n, s) => n + s.missingSource, 0), 0);
  const U = DM.unsourced(M);
  assert.equal(U.length, 9);
  const mmca = U.find(u => u.id === 'td:place-mmca');
  assert.equal(mmca.value, '1만~3만 원'); assert.equal(mmca.price, '전시·프로그램별 상이'); assert.match(mmca.reason, /^CONFLICT/);
  assert.equal(ctx.LivonTodayData.contents.find(c => c.id === 'place-mmca').budget, '1만~3만 원', 'value shown, never corrected');
});

test('DM-16 date review: the 30 undated time-bound rows with kind, source and reason; no date generated', () => {
  const D = DM.dateReview(M);
  assert.equal(D.length, 30);
  const kinds = D.reduce((m, d) => (m[d.kind] = (m[d.kind] || 0) + 1, m), {});
  assert.equal(kinds.policy, 17);
  assert.equal(Object.values(kinds).reduce((a, b) => a + b, 0), 30);
  for (const d of D) { assert.ok(Object.values(d.dates).every(v => !v)); assert.ok(d.reason && d.title); }
  const F = DM.freshness(M);
  for (const k of ['fresh', 'stale', 'expired', 'unknown']) assert.ok(k in F.counts, k);
  assert.equal(Object.values(F.counts).reduce((a, b) => a + b, 0), 530);
});

/* ───────── testers ───────── */
test('DM-17 search tester: live ranking with matched fields; the 66-query set reports PASS / WEAK / ZERO RESULT', () => {
  const e = DM.searchTest(M, '청약');
  assert.equal(e.items[0].key, 'ex:ex-molit-housing');
  assert.equal(e.items[0].parts[0].kind, 'direct');
  assert.equal(e.items[1].parts[0].kind, 'alias');
  const n = DM.searchTest(M, '배우고 싶어'); deq(n.dropped, ['싶어']);
  deq(J(DM.searchTest(M, '이사').items.map(i => i.key)), J(ctx.LivonSearch.search('이사', {}).items.map(h => h.item.key)), 'same ranking as the site search');
  const S = DM.runSearchSet(M);
  assert.equal(S.length, 66);
  deq(S.filter(s => s.status !== 'PASS').map(s => s.q + ' ' + s.status), ['프리랜서 WEAK']);
});

test('DM-18 recommendation tester: age → stage, life event, interests; rank, score and reasons', () => {
  assert.equal(DM.stageFromAge(72), '70'); assert.equal(DM.stageFromAge(9), '10'); assert.equal(DM.stageFromAge(95), '70'); assert.equal(DM.stageFromAge(''), '');
  const r = DM.recommend(M, { age: 24, lifeEvent: 'first-job', interests: ['취업'] });
  assert.equal(r.context.lifeStage, '20');
  assert.ok(r.items.length >= 3);
  r.items.forEach((x, i) => { assert.equal(x.rank, i + 1); assert.ok(Array.isArray(x.reasons) && x.reasons.length); });
  assert.ok(r.items.some(x => /first-job|interview|resume/.test(x.id)));
});

test('DM-19 regression: the 아이사랑 childcare portal is not recommended to 70대, still is to 30대; 돌봄 tag and search unchanged', () => {
  const repo = ctx.LivonScreenData.repository();
  const seventy = repo.getRecommendations({ lifeStage: '70', interests: ['건강', '돌봄'], limit: 50 }).items.map(i => i.entity.id);
  assert.equal(seventy.includes('ex:ex-childcare'), false);
  assert.ok(seventy.includes('ex:ex-bokjiro'), 'a general welfare portal with the same 돌봄 tag still appears');
  const thirty = repo.getRecommendations({ lifeStage: '30', interests: ['육아', '돌봄'], limit: 50 }).items.map(i => i.entity.id);
  assert.ok(thirty.includes('ex:ex-childcare'));
  assert.ok(repo.getById('ex:ex-childcare').tags.includes('돌봄'), 'tag kept');
  assert.ok(ctx.LivonSearch.search('돌봄', {}).items.some(h => h.item.key === 'ex:ex-childcare'), 'search unchanged');
  assert.ok(repo.getRecommendations({ interests: ['돌봄'], limit: 50 }).items.some(i => i.entity.id === 'ex:ex-childcare'), 'no stage given → no context filter');
});

test('DM-20 taxonomy inspector: every category with counts/types/screens; near-duplicates marked TAXONOMY REVIEW', () => {
  const T = DM.taxonomy(M);
  assert.ok(T.categories.length > 100);
  assert.equal(T.categories.reduce((n, c) => n + c.count, 0), M.records.filter(r => r.category).length);
  const has = (a, b) => T.nearDuplicates.some(p => (p.a === a && p.b === b) || (p.a === b && p.b === a));
  assert.ok(has('대학/입시', '대학/교육')); assert.ok(has('건강', '건강관리'));
  assert.ok(T.nearDuplicates.every(p => p.status === 'TAXONOMY REVIEW'));
  assert.ok(T.categories.find(c => c.name === '건강').related.includes('건강관리'));
});

test('DM-21 CTA inspector: every CTA counted; generic 정보 보기 21 / 둘러보기 26 in the CTA review queue', () => {
  const C = DM.ctas(M);
  assert.equal(C.list.reduce((n, c) => n + c.count, 0), 530);
  assert.equal(C.list.find(c => c.cta === '정보 보기').count, 21);
  assert.equal(C.list.find(c => c.cta === '둘러보기').count, 26);
  deq(C.generic.map(c => c.cta).sort(), ['둘러보기', '정보 보기']);
  deq(C.applyWithoutOfficialPage, []);
});

test('DM-22 screen coverage matrix and coverage filters', () => {
  const C = DM.coverage(M);
  deq(C.screens, ['HOME', 'TODAY', 'LIFE STAGE', 'EXPLORE', 'SEARCH', 'MY LIFE', 'DETAIL', 'COMMUNITY']);
  assert.equal(C.totals.TODAY, 34); assert.equal(C.totals.EXPLORE, 28);
  assert.equal(DM.query(M, { filters: { coverage: 'only-one' } }).total, C.onlyOne);
  assert.equal(DM.query(M, { filters: { coverage: 'not-searchable' } }).total, C.notSearchable);
  assert.equal(DM.query(M, { filters: { coverage: 'no-detail' } }).total, C.noDetail);
  assert.equal(DM.query(M, { filters: { coverage: 'no-my-life' } }).total, C.noMyLife);
});

/* ───────── export ───────── */
test('DM-23 JSON export: all or filtered records, whitelisted fields, read-only marker', () => {
  const all = JSON.parse(DM.exportJSON(M.records, M.report));
  assert.equal(all.count, 530); assert.equal(all.readOnly, true); assert.equal(all.records.length, 530);
  deq(Object.keys(all.records[0]), DM.EXPORT_FIELDS);
  const f = DM.filterRecords(M, { filters: { flag: 'UNSOURCED_SPECIFIC' } });
  assert.equal(JSON.parse(DM.exportJSON(f)).records.length, 8);
});
test('DM-24 CSV export: header + one row per record, quoting and formula-injection safe', () => {
  const csv = DM.exportCSV(M.records);
  const lines = csv.replace(/^﻿/, '').trim().split('\r\n');
  assert.equal(lines[0], DM.EXPORT_FIELDS.join(','));
  assert.ok(lines.length >= 531);
  const esc = DM.exportCSV([{ id: 'x', title: '=HYPERLINK("a")', summary: 'a,"b"\nc', tags: ['t1', 't2'] }]);
  assert.match(esc, /"'=HYPERLINK\(""a""\)"/); assert.match(esc, /"a,""b""\nc"/); assert.match(esc, /t1\|t2/);
});

/* ───────── review state ───────── */
test('DM-25 local review state: marks persist in localStorage under one key and never touch curated data', () => {
  const mem = new Map(); const ls = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k) };
  const s = DM.reviewStore(ls);
  assert.equal(s.persistent, true);
  assert.equal(s.setRecord('td:place-mmca', 'needs-review'), true);
  assert.equal(s.setGroup('title:초기 고객 찾기', 'keep'), true);
  assert.equal(s.setRecord('td:x', 'delete-it'), false, 'unknown values are refused');
  const s2 = DM.reviewStore(ls);
  assert.equal(s2.record('td:place-mmca'), 'needs-review'); assert.equal(s2.group('title:초기 고객 찾기'), 'keep');
  deq([...mem.keys()], ['livon.dataManager.review.v1']);
  s2.setRecord('td:place-mmca', ''); assert.equal(DM.reviewStore(ls).record('td:place-mmca'), null);
  assert.equal(ctx.LivonTodayData.contents.find(c => c.id === 'place-mmca').budget, '1만~3만 원');
});
test('DM-26 blocked storage: falls back to memory without throwing', () => {
  const blocked = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('SecurityError'); }, removeItem() { throw new Error('SecurityError'); } };
  const s = DM.reviewStore(blocked);
  assert.equal(s.persistent, false);
  assert.equal(s.setRecord('topic:10s.school-life', 'reviewed'), true);
  assert.equal(s.record('topic:10s.school-life'), 'reviewed');
  const full = { getItem: () => null, setItem() { throw new Error('QuotaExceeded'); } };
  const s2 = DM.reviewStore(full); s2.setRecord('a', 'reviewed'); assert.equal(s2.record('a'), 'reviewed'); assert.equal(s2.persistent, false);
  const none = DM.reviewStore(null); none.setGroup('g', 'review'); assert.equal(none.group('g'), 'review');
});

test('DM-27 no source mutation: curated files and repository entities are byte-identical after every tool function', () => {
  const m = DM.createModel(ctx);
  DM.dashboard(m); DM.query(m, { q: '건강', filters: { age: 'general' }, sort: 'score' }); DM.inspect(m, 'td:place-mmca'); DM.reviewQueue(m); DM.duplicateGroups(m);
  DM.relationExplorer(m); DM.contentGaps(m); DM.sources(m); DM.unsourced(m); DM.dateReview(m); DM.freshness(m); DM.taxonomy(m); DM.ctas(m); DM.coverage(m);
  DM.searchTest(m, '청약'); DM.runSearchSet(m); DM.recommend(m, { age: 72, interests: ['건강'] }); DM.exportJSON(m.records); DM.exportCSV(m.records);
  deq(hashFiles(), HASH_BEFORE);
  const after = JSON.stringify(ctx.LivonScreenData.repository().all({ includeSamples: true, includeUnsourced: true, includeExpired: true, includeDuplicates: true }).map(e => { const { _raw, ...rest } = e; return rest; }));
  assert.equal(after, REPO_BEFORE);
  const code = src('livon/admin/data/data-manager-core.js') + src('livon/admin/data/data-manager.js') + src('scripts/livon-data-manager.mjs');
  assert.doesNotMatch(code, /writeFile|appendFile|method:\s*["']POST|XMLHttpRequest|\.save\(\)|repo\.(add|set|put|remove)/);
  assert.match(src('scripts/livon-data-manager.mjs'), /GET\/HEAD only|405/);
});

test('DM-28 no secret export: only whitelisted content fields; no key/token-like field or value', () => {
  assert.ok(DM.EXPORT_FIELDS.every(f => !/(secret|token|password|api[-_]?key|credential|authorization|cookie)/i.test(f)));
  const poisoned = Object.assign({}, J(M.records[0]), { apiKey: 'sk-live-123', OPENAI_API_KEY: 'sk-xyz', token: 't', _text: 'x' });
  const j = DM.exportJSON([poisoned]), c = DM.exportCSV([poisoned]);
  for (const out of [j, c]) { assert.doesNotMatch(out, /sk-live-123|sk-xyz|apiKey|OPENAI_API_KEY|"token"/); }
  const all = DM.exportJSON(M.records) + DM.exportCSV(M.records);
  assert.doesNotMatch(all, /(^|[^A-Za-z0-9-])sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,}|-----BEGIN|Bearer [A-Za-z0-9]/);
});

/* ───────── browser (skipped when no local Chromium) ───────── */
const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const canBrowse = fs.existsSync(PW) && fs.existsSync(CHROME);
async function withBrowser(fn) {
  const { chromium } = await import(PW);
  const server = await startServer({ port: 0 });
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  try { await fn(browser, base); } finally { await browser.close(); server.close(); }
}
async function openDM(browser, base, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page._errors = []; page.on('pageerror', e => page._errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') page._errors.push(m.text()); });
  await page.route(/(fonts\.googleapis|fonts\.gstatic|cloudfront\.net|jsdelivr)/, r => r.abort());
  await page.goto(base + '/livon/admin/data/#dashboard');
  await page.waitForSelector('[data-dm-state="ready"]', { timeout: 20000 });
  return page;
}

test('DM-29 responsive: 390 / 768 / 1024 / 1440 — every view renders, no horizontal page overflow, no console error; production host shows Unavailable', { skip: !canBrowse && 'no local Chromium' }, async () => {
  await withBrowser(async (browser, base) => {
    for (const w of [390, 768, 1024, 1440]) {
      const page = await openDM(browser, base, w);
      assert.equal(await page.textContent('[data-dm-total]'), '530');
      for (const v of ['dashboard', 'explorer', 'quality', 'queue', 'duplicates', 'relations', 'gaps', 'sources', 'unsourced', 'dates', 'freshness', 'search', 'search-set', 'recommend', 'taxonomy', 'cta', 'coverage', 'export']) {
        await page.evaluate(v => { location.hash = '#' + v; }, v);
        await page.waitForFunction(v => document.querySelector('[data-dm-view]').getAttribute('data-dm-current') === v, v);
        const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, text: document.querySelector('[data-dm-view]').innerText.length }));
        assert.ok(m.sw <= m.cw, `${w} ${v} page overflow ${m.sw} > ${m.cw}`);
        assert.ok(m.text > 20, `${w} ${v} renders`);
      }
      deq(page._errors, [], 'console errors at ' + w);
      await page.close();
    }
    /* the same files served under the production host name */
    const page = await browser.newPage();
    const requested = [];
    await page.route('https://www.newon.app/**', async route => { const u = new URL(route.request().url()); requested.push(u.pathname); const r = await fetch(base + u.pathname); route.fulfill({ status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'text/plain' }, body: Buffer.from(await r.arrayBuffer()) }); });
    await page.goto('https://www.newon.app/livon/admin/data/');
    await page.waitForSelector('[data-dm-state="unavailable"]');
    assert.match(await page.textContent('#dm-app'), /Unavailable/);
    assert.equal(requested.some(p => /today-data|livon-data-platform|life-topics/.test(p)), false, 'no data is requested on a non-local host');
    await page.close();
  });
});

test('DM-30 accessibility basics: labels, table semantics, dialog with Escape and focus return, keyboard nav, skip link', { skip: !canBrowse && 'no local Chromium' }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await openDM(browser, base, 1440);
    await page.evaluate(() => { location.hash = '#explorer'; });
    await page.waitForFunction(() => document.querySelector('[data-dm-view]').getAttribute('data-dm-current') === 'explorer');
    const a = await page.evaluate(() => ({
      unlabeled: [...document.querySelectorAll('input, select')].filter(el => !(el.id && document.querySelector('label[for="' + el.id + '"]')) && !el.getAttribute('aria-label')).length,
      th: document.querySelectorAll('table th[scope="col"]').length, caption: !!document.querySelector('table caption'), region: !!document.querySelector('.dm-scroll[role="region"][aria-label]'),
      current: document.querySelector('[aria-current="page"]').getAttribute('href'), skip: !!document.querySelector('.dm-skip[href="#dm-main"]'), lang: document.documentElement.lang,
      emptyButtons: [...document.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length }));
    assert.equal(a.unlabeled, 0); assert.ok(a.th >= 10); assert.ok(a.caption && a.region && a.skip); assert.equal(a.current, '#explorer'); assert.equal(a.lang, 'ko'); assert.equal(a.emptyButtons, 0);
    await page.fill('[data-dm-q]', 'place-mmca');
    await page.waitForSelector('[data-dm-open="td:place-mmca"]');
    await page.focus('[data-dm-open="td:place-mmca"]');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.getElementById('dm-inspector').open);
    assert.equal(await page.evaluate(() => document.activeElement.hasAttribute('data-dm-close')), true, 'focus moves into the dialog');
    assert.equal(await page.evaluate(() => document.getElementById('dm-inspector').getAttribute('aria-labelledby')), 'dm-insp-title');
    assert.match(await page.textContent('#dm-inspector'), /FIELD_CONFLICT/);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('dm-inspector').open);
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('data-dm-open')), 'td:place-mmca', 'focus returns to the opener');
    /* keyboard: tab reaches the nav and Enter switches view */
    await page.focus('[data-dm-nav="queue"]'); await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('[data-dm-view]').getAttribute('data-dm-current') === 'queue');
    assert.equal(await page.textContent('[data-dm-p="P0"]'), '0');
    deq(page._errors, []);
    await page.close();
  });
});
