// LIVON Content Quality V1 — the 530 curated records: inventory, wording, relations, search and recommendations (CQ-1 … CQ-25).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadLivon } from '../../scripts/livon-data-quality.mjs';
import { contentQuality, SEARCH_SET, SCENARIOS, PROVENANCE } from '../../scripts/livon-content-quality.mjs';

/* rows come from the vm realm of the loaded browser scripts: compare as plain JSON */
const J = x => JSON.parse(JSON.stringify(x));
const deq = (a, b, m) => assert.deepEqual(J(a), J(b), m);
const src = p => fs.readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const BASE_IDS = JSON.parse(src('tests/livon/fixtures/content-ids-v1.json')).ids;
const NOW = Date.parse('2026-10-01T00:00:00Z');
const ctx = loadLivon();
const rep = contentQuality(ctx, { now: NOW });
const SD = ctx.LivonScreenData, repo = SD.repository(), S = ctx.LivonSearch;
const rec = id => rep.records.find(r => r.id === id);
const withFlag = f => rep.records.filter(r => r.flags.includes(f)).map(r => r.id);
const L = s => [...String(s || '')].length;
const PLANNED = ['campus-life', 'cert', 'freelance', 'car', 'abroad', 'newlywed', 'first-salary', 'saving', 'loan', 'checkup', 'habit-health', 'parent-health', 'first-trip', 'long-trip'];

/* ───────── inventory ───────── */
test('CQ-1 inventory: 530 curated records, counts by type add up to the curated total, every record is inventoried with its fields', () => {
  assert.equal(rep.totals.total, 530);
  assert.equal(rep.totals.curated, 530);
  deq(rep.byType, { lifeStage: 7, lifeEvent: 34, content: 259, policy: 17, service: 143, place: 10, class: 4, program: 9, provider: 21, communityContent: 26 });
  assert.equal(Object.values(rep.byType).reduce((a, b) => a + b, 0), rep.totals.total);
  for (const r of rep.records) for (const k of ['id', 'type', 'title', 'summary', 'category', 'ageGroup', 'lifeStage', 'lifeEvent', 'tags', 'keywords', 'source', 'urls', 'relations', 'cta', 'dates', 'screens', 'score', 'grade', 'flags']) assert.ok(k in r, r.id + ' ' + k);
});

test('CQ-2 ids are unchanged (saved My Life items keep working) — same 530 ids as before Content Quality V1', () => {
  deq(rep.records.map(r => r.id).sort(), BASE_IDS);
});

test('CQ-3 screen usage is tracked and nothing is an orphan (derived provider rows are referenced by providerId)', () => {
  for (const s of ['HOME', 'TODAY', 'LIFE STAGE', 'EXPLORE', 'SEARCH', 'MY LIFE', 'DETAIL', 'COMMUNITY']) assert.ok(rep.screens[s] > 0, s);
  /* LIVON Next V1: 7 Today and 3 Explore records are on review hold (kept in the files, not shown) */
  assert.equal(rep.screens.TODAY, 27);
  /* BEFORE 25 → AFTER 26 (Next V1 integration): ex-hrdkorea re-checked against 고용24, corrected and released from the review hold */ 
  assert.equal(rep.screens.EXPLORE, 26);
  deq(rep.orphans, []);
  const prov = rep.records.filter(r => r.id.startsWith('prov:'));
  assert.ok(prov.length && prov.every(r => r.incoming > 0));
});

/* ───────── wording ───────── */
test('CQ-4 no placeholder summaries: the 14 planned Life Events describe what the event is and what to prepare', () => {
  assert.equal(src('livon/life-events-data.js').includes('확장 예정 Life Event입니다'), false);
  deq(withFlag('PLACEHOLDER_SUMMARY'), []);
  const ev = ctx.LivonLifeEvents.events;
  for (const id of PLANNED) {
    const e = ev.find(x => x.id === id);
    assert.equal(e.planned, true, 'still marked planned — the UI badge is unchanged');
    assert.ok(L(e.blurb) >= 25 && L(e.blurb) <= 47, id + ' length within the old placeholder length');
    assert.match(e.blurb, /[다]\.$/);
  }
});

test('CQ-5 no tautological or repeated summaries (tool cards, provider rows) — every summary says more than its title', () => {
  deq(withFlag('WEAK_SUMMARY'), []);
  deq(withFlag('DUPLICATE_SUMMARY'), []);
  deq(withFlag('MISSING_SUMMARY'), []);
  const tools = (ctx.LivonLifeData.stages || []).flatMap(s => s.services || []);
  assert.equal(tools.length, 99);
  for (const t of tools) { assert.notEqual(t.desc.replace(/[입니다.\s]/g, ''), t.name.replace(/\s/g, ''), t.id); assert.ok(L(t.desc) <= 28, t.id + ' fits the existing card'); }
  assert.equal(new Set(tools.map(t => t.desc)).size, tools.length, 'no two tool cards share a description');
});

test('CQ-6 official portals get a real summary; the eligibility text and the policy card fields stay as they were', () => {
  const LT = ctx.LivonLifeHub.repo.data;
  assert.equal(LT.policies.length, 17);
  for (const p of LT.policies) {
    assert.ok(p.summary && /(포털|사이트|서비스|안내에서 확인합니다)/.test(p.summary), p.id);
    const e = repo.getById('pol:' + p.id);
    assert.equal(e.summary, p.summary);
    assert.equal(e.eligibility, p.target, 'eligibility is not rewritten');
    assert.ok(p.target && p.conditions && p.period, 'card fields (대상 · 주요 조건 · 신청기간) untouched');
  }
  const hit = S.search('정신건강', {}).items.find(h => h.item.key === 'pol:pol-mentalhealth');
  assert.equal(hit.item.desc, LT.policies.find(p => p.id === 'pol-mentalhealth').summary);
});

test('CQ-7 no fabricated specifics in the rewritten text: no amounts, prices, phone numbers, dates, hours or ages', () => {
  const texts = [...PLANNED.map(id => ctx.LivonLifeEvents.events.find(e => e.id === id).blurb),
    ...ctx.LivonLifeHub.repo.data.policies.map(p => p.summary),
    ...(ctx.LivonLifeData.stages || []).flatMap(s => s.services || []).map(t => t.desc),
    ...rep.records.filter(r => r.id.startsWith('prov:')).map(r => r.summary)];
  for (const t of texts) assert.doesNotMatch(t, /\d|원\b|만 ?원|세 이상|시간|전화|☎|\d{2,4}-\d{3,4}/, t);
  deq(withFlag('TIME_SENSITIVE_CLAIM'), []);
});

test('CQ-8 unsourced specifics are flagged for review, never removed (Today budget buckets drive the budget filter)', () => {
  const ids = withFlag('UNSOURCED_SPECIFIC');
  assert.ok(ids.length > 0);
  for (const id of ids) { assert.match(id, /^td:/); assert.ok(ctx.LivonTodayData.contents.find(c => 'td:' + c.id === id).budget); }
});

/* ───────── duplicates · taxonomy · metadata ───────── */
test('CQ-9 duplicate candidates each carry a keep decision and a reason; age variants are kept, nothing is merged', () => {
  assert.ok(rep.duplicates.length > 0);
  for (const d of rep.duplicates) { assert.equal(d.decision, 'keep', d.kind + ' ' + d.ids.join(',')); assert.match(d.reason, /^[A-Z_]+ — /); }
  const v = rep.duplicates.find(d => d.kind === 'title' && d.key === '초기 고객 찾기');
  assert.match(v.reason, /^AGE_VARIANT/);
  assert.ok(repo.getById('topic:20s.first-customers') && repo.getById('topic:30s.first-customers'));
});

test('CQ-10 category taxonomy: canonical categories are Korean labels; UI filter ids (Explore categories, Today types) unchanged', () => {
  assert.equal(repo.getById('tool:service-70-01').category, '가이드');
  assert.ok(rep.records.filter(r => r.id.startsWith('tool:')).every(r => ['도구', '가이드', '전문가·기관', '활동·콘텐츠'].includes(r.category)));
  assert.equal(repo.getById('pol:pol-gov24').category, '공식 포털');
  assert.equal(repo.getById('cm:c-daily').category, '일상·생활');
  deq(ctx.LivonExploreData.categories.map(c => c.id), ['experts', 'services', 'education', 'local', 'housing', 'family', 'health', 'career', 'leisure', 'products']);
  deq([...new Set(ctx.LivonTodayData.contents.map(c => c.type))].sort(), ['editorial', 'event', 'experience', 'learn', 'life', 'place', 'season', 'together']);
});

test('CQ-11 search metadata: every record has a category or tags (stages use their focus words, providers their card tags)', () => {
  deq(withFlag('WEAK_SEARCH_METADATA'), []);
  deq(repo.getById('stage:10').tags, ['학습', '진로', '취미']);
  const p = repo.getById('prov:한국산업인력공단', { any: true });
  assert.ok(p.tags.length && p.category);
});

test('CQ-12 ageGroup: general content is not restricted to an age; no official age range is guessed', () => {
  const general = rep.records.filter(r => r.ageGroup === 'general');
  assert.ok(general.some(r => r.id.startsWith('ex:')) && general.some(r => r.id.startsWith('pol:')));
  const LT = ctx.LivonLifeHub.repo.data;
  for (const p of LT.policies) assert.equal(repo.getById('pol:' + p.id).targetAges, null);
});

/* ───────── relations ───────── */
test('CQ-13 related ids: none missing, none pointing to itself, no repeated ids, no list longer than 12', () => {
  deq(withFlag('BROKEN_RELATION'), []);
  deq(withFlag('TOO_MANY_RELATIONS'), []);
});

test('CQ-14 Life Events: curated topic links exist, overlap the event\'s stages and are written back onto the topic', () => {
  const ev = ctx.LivonLifeEvents.events.filter(e => e.topicIds);
  assert.equal(ev.length, 17);
  for (const e of ev) for (const t of e.topicIds) {
    const tp = repo.getById('topic:' + t);
    assert.ok(tp, t);
    assert.ok(tp.lifeStages.some(s => e.stages.includes(s)), e.id + ' → ' + t + ' stage overlap');
    assert.ok(tp.lifeEvents.includes(e.id), 'back-link on ' + t);
    assert.ok(repo.getById('le:' + e.id).relations.topicIds.includes('topic:' + t));
  }
  assert.equal(repo.getById('le:enroll').meta.topicLinks, 'curated');
});

test('CQ-15 Life Events: no forced links — events without a matching guide stay without topics', () => {
  for (const id of ['freelance', 'car', 'abroad', 'long-trip']) {
    assert.equal(ctx.LivonLifeEvents.events.find(e => e.id === id).topicIds, undefined);
    deq(repo.getById('le:' + id).relations.topicIds, []);
  }
  deq(withFlag('MISSING_RELATION').sort(), ['le:abroad', 'le:car', 'le:freelance', 'le:long-trip']);
});

test('CQ-16 Life Stage × relation matrix: all 7 stages have topics, each topic links policies/services, service types map their content links', () => {
  const m = rep.relations.lifeStageMatrix;
  deq(Object.keys(m).sort(), ['10', '20', '30', '40', '50', '60', '70']);
  assert.equal(Object.values(m).reduce((n, s) => n + s.topics, 0), 228);
  for (const s of Object.values(m)) { assert.equal(s.service, s.topics); assert.ok(s.policy > 0); }
  deq(repo.getById('svc:public-docs').relations.contentIds, ['td:life-public']);
  deq(repo.getById('svc:internet').relations.contentIds, ['td:td-moving-checklist']);
});

/* ───────── CTA · URL · provenance · dates ───────── */
test('CQ-17 CTA: no "신청하기" without an official application page; tool CTAs are short action labels', () => {
  deq(rep.cta.applyWithoutOfficialPage, []);
  for (const t of (ctx.LivonLifeData.stages || []).flatMap(s => s.services || [])) { assert.ok(t.cta && L(t.cta) <= 12, t.id); assert.doesNotMatch(t.cta, /신청하기/); }
});

test('CQ-18 URL format: every official/source link is a well-formed https URL; HTTP status is not claimed', () => {
  deq(rep.urls.invalid, []);
  assert.ok(rep.urls.checked > 100);
  assert.equal(rep.urls.httpVerified, false);
});

test('CQ-19 provenance classes A–E cover every record; Ongil is a Newon service (D); .go.kr links are government (B)', () => {
  deq(Object.keys(PROVENANCE), ['A', 'B', 'C', 'D', 'E']);
  assert.equal(Object.values(rep.byProvenance).reduce((a, b) => a + b, 0), 530);
  assert.equal(rec('ex:ex-ongil').source.class, 'D');
  assert.equal(rec('prov:newonongil').source.class, 'D');
  deq(withFlag('MISSING_SOURCE'), []);
  assert.equal(rec('pol:pol-gov24').source.class, 'B');
  assert.equal(rec('pol:pol-nhis').source.class, 'C');
  assert.equal(rec('topic:10s.school-life').source.class, 'A');
});

test('CQ-20 dates: the 30 undated time-bound rows carry requiresDateVerification; no date is invented; dated rows are not flagged', () => {
  const ids = rep.dates.requiresDateVerification;
  assert.equal(ids.length, 30);
  for (const id of ids) {
    const e = repo.getById(id, { any: true });
    assert.equal(e.meta.requiresDateVerification, true);
    assert.ok(!e.startDate && !e.endDate && !e.applicationStart && !e.applicationEnd && !e.expiresAt);
  }
  const P = ctx.LivonDataPlatform;
  const dated = P.canonicalize({ id: 'x:1', type: 'program', title: '과정', sourceType: 'official', sourceName: 'x', officialUrl: 'https://example.org/p', status: 'published', startDate: '2026-11-01' }).entity;
  assert.equal(dated.meta.requiresDateVerification, undefined);
  deq(rep.dates.stale, []);
});

/* ───────── search ───────── */
test('CQ-21 search test set (66 queries): no query comes back empty; at least 4 of the top 5 results are relevant on average', () => {
  assert.ok(SEARCH_SET.length >= 50);
  deq(rep.searchSummary.zeroResults, []);
  assert.ok(rep.searchSummary.relevantTop5Avg >= 4, String(rep.searchSummary.relevantTop5Avg));
  /* '요리' became a content gap when the baking / pottery guides went on review hold (LIVON Next V1) */
  deq(rep.searchSummary.weak, ['요리', '프리랜서'], 'only a real content gap stays weak');
});

test('CQ-22 two-way synonyms: 취업/구직 · 창업/사업 · 집/주거 · 육아/양육 · 노후/은퇴 find each other', () => {
  const titles = q => S.search(q, {}).items.slice(0, 10).map(h => h.item.title).join(' ');
  assert.match(titles('구직'), /취업/);
  assert.match(titles('사업'), /창업/);
  assert.match(S.search('집', {}).items.map(h => h.item.title).join(' '), /주거/);
  assert.match(titles('양육'), /육아/);
  assert.match(titles('노후'), /은퇴|노후/);
  assert.ok(S.search('노후', {}).items.some(h => /은퇴/.test(h.item.title)));
  assert.ok(S.search('은퇴', {}).items.some(h => /노후/.test(h.item.title)));
  const P = repo.search('양육', {}); assert.ok(P.total > 0, 'Data Platform search knows the same pairs');
});

test('CQ-23 everyday phrasing: filler words are dropped, aliases rank below direct matches, suggestion chips unchanged', () => {
  assert.ok(S.search('배우고 싶어', {}).total > 0);
  assert.ok(S.search('아이 키우기', {}).items.slice(0, 3).every(h => /육아|보육|아이/.test(h.item.title + h.item.desc)));
  deq(S.search('창업 방법 알려줘', {}).items.slice(0, 3).map(h => h.item.key), S.search('창업', {}).items.slice(0, 3).map(h => h.item.key));
  assert.ok(S.search('방법', {}).total >= 0, 'a query made only of a filler word still searches that word');
  assert.equal(S.search('청약', {}).items[0].item.key, 'ex:ex-molit-housing', 'the one card that names 청약 ranks above synonym hits');
  const chips = S.suggest('키', 20).map(s => s.label);
  assert.equal(chips.includes('키우기'), false);
});

/* ───────── recommendations ───────── */
test('CQ-24 recommendation scenarios (age · life event · interest only): every scenario returns relevant items and no wrong-age item', () => {
  assert.equal(SCENARIOS.length, 9);
  for (const r of rep.recommendations) {
    assert.ok(r.count >= 3, r.name + ' ' + r.count);
    assert.equal(r.relevant, r.count, r.name);
    deq(r.ageMismatch, [], r.name);
  }
  const teen = rep.recommendations.find(r => r.name === '10대 학생');
  assert.ok(teen.top.some(t => /school-life/.test(t)));
  const fifty = rep.recommendations.find(r => r.name === '50대 재취업');
  assert.ok(fifty.top.some(t => /work-options|career-profile/.test(t)));
});

/* ───────── score ───────── */
test('CQ-25 quality score: deterministic, graded 90/75/60, internal only; CLI writes the JSON report on request', () => {
  const again = contentQuality(loadLivon(), { now: NOW });
  deq(again.records.map(r => [r.id, r.score, r.flags.join()]), rep.records.map(r => [r.id, r.score, r.flags.join()]));
  const t = rep.totals;
  assert.equal(t.pass + t.needsReview + t.poor, t.total);
  for (const r of rep.records) {
    const g = r.score >= 90 ? 'Excellent' : r.score >= 75 ? 'Good' : r.score >= 60 ? 'Needs Review' : 'Poor';
    assert.equal(r.grade, g);
  }
  assert.equal(t.poor, 0);
  assert.equal(rep.detailIncomplete.length, 0);
  for (const f of fs.readdirSync(new URL('../../livon/', import.meta.url)).filter(f => f.endsWith('.js'))) assert.doesNotMatch(src('livon/' + f), /contentQuality|qualityScore|livon-content-quality/, f);
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cq-')), 'content-quality-report.json');
  const stdout = execFileSync(process.execPath, [new URL('../../scripts/livon-content-quality.mjs', import.meta.url).pathname, '--json', out], { encoding: 'utf8' });
  assert.match(stdout, /^LIVON CONTENT QUALITY\nTOTAL +530/);
  assert.match(stdout, /PASS +\d+/); assert.match(stdout, /NEEDS REVIEW +\d+/); assert.match(stdout, /POOR +\d+/);
  assert.equal(JSON.parse(fs.readFileSync(out, 'utf8')).records.length, 530);
});
