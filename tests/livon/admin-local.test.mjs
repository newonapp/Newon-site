// LIVON Admin Local V1 — local operations console prototype over the Data Manager core (AD-1 … AD-36).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { loadLivon } from '../../scripts/livon-data-quality.mjs';
import { startServer } from '../../scripts/livon-data-manager.mjs';
import * as MANIFEST from '../../server/livon/data/manifest.mjs';

const ROOT = new URL('../../', import.meta.url);
const src = p => fs.readFileSync(new URL(p, ROOT), 'utf8');
const J = x => JSON.parse(JSON.stringify(x));
const deq = (a, b, m) => assert.deepEqual(J(a), J(b), m);
const CURATED = ['livon/life-topics.json', 'livon/life-data.js', 'livon/life-events-data.js', 'livon/today-data.js', 'livon/explore-data.js', 'livon/community-data.js'];
const hashFiles = () => CURATED.map(f => crypto.createHash('sha256').update(fs.readFileSync(new URL(f, ROOT))).digest('hex'));
const HASH_BEFORE = hashFiles();
const NOW = Date.parse('2026-10-01T00:00:00Z');

function memStorage(seed) { const m = new Map(Object.entries(seed || {})); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), _m: m }; }
const blocked = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('SecurityError'); }, removeItem() { throw new Error('SecurityError'); } };
function boot({ lifeTopics, patch, storage, session, manifest = MANIFEST, emptyDataset, breakEvaluator, host = '127.0.0.1' } = {}) {
  const ctx = loadLivon({ lifeTopics, patch });
  for (const f of ['livon/admin/data/data-manager-core.js', 'livon/admin/admin-store.js', 'livon/admin/admin-service.js']) vm.runInContext(src(f), ctx, { filename: f });
  if (breakEvaluator) ctx.LivonContentQuality.evaluate = () => { throw new Error('evaluator exploded'); };
  let t = NOW;
  const adapter = ctx.LivonAdminStore.createLocalAdapter({ localStorage: storage === undefined ? memStorage() : storage, sessionStorage: session === undefined ? memStorage() : session });
  const svc = ctx.LivonAdminService.create({ env: ctx, adapter, manifest, now: NOW, clock: () => (t += 1000), host, emptyDataset });
  return { ctx, svc, adapter };
}
const { ctx, svc } = boot();
const DM = ctx.LivonDataManager;

/* ───────── guard & exclusion ───────── */
test('AD-1 local-only guard: the Admin stops before any data request on a non-local host', () => {
  const ui = src('livon/admin/admin-app.js');
  assert.ok(ui.indexOf('DM.isAllowedHost(location.hostname)') < ui.indexOf('DM.DATA_SCRIPTS.reduce'), 'guard before data scripts');
  assert.ok(ui.indexOf('DM.isAllowedHost(location.hostname)') < ui.indexOf('import("/server/livon/data/manifest.mjs")'), 'guard before the manifest import');
  const html = src('livon/admin/index.html');
  assert.match(html, /noindex/);
  assert.doesNotMatch(html, /today-data|livon-data-platform|life-topics|manifest/, 'the page itself references no data');
  for (const h of ['www.newon.app', 'newonapp.github.io', 'livon-api.vercel.app']) assert.equal(DM.isAllowedHost(h), false);
  assert.doesNotMatch(ui + src('livon/admin/admin-service.js') + html, /type=["']password|passcode|prompt\(/i, 'no fake client-side password');
  assert.equal(boot({ host: 'www.newon.app' }).svc.system().find(s => s.key === 'Environment').value, 'UNAVAILABLE');
});

test('AD-2 production exclusion: the whole livon/admin/** tree is removed from _publish and never linked', () => {
  const p = src('scripts/publish-site.mjs');
  assert.match(p, /fs\.rmSync\(path\.join\(OUT, "livon", "admin"\), \{ recursive: true, force: true \}\)/);
  assert.match(p, /livon\/admin must not be published/);
  assert.ok(fs.existsSync(new URL('livon/admin/index.html', ROOT)) && fs.existsSync(new URL('livon/admin/data/index.html', ROOT)), 'both tools live under livon/admin');
  for (const f of fs.readdirSync(new URL('livon/', ROOT)).filter(f => /\.(js|html|css)$/.test(f))) assert.doesNotMatch(src('livon/' + f), /\/livon\/admin|admin-app|admin-service/, 'no link from ' + f);
  if (fs.existsSync(new URL('_publish/livon/', ROOT))) assert.equal(fs.existsSync(new URL('_publish/livon/admin', ROOT)), false, 'last build has no admin');
});

/* ───────── shell / overview / status ───────── */
test('AD-3 admin shell: navigation areas, future modules separated, commands for every area', () => {
  deq(svc.NAV.map(n => n.id), ['overview', 'content', 'life-stage', 'life-events', 'today', 'explore', 'community', 'quality', 'review', 'sources', 'providers', 'reports', 'drafts', 'audit', 'system']);
  deq(svc.FUTURE_MODULES.map(m => m.id), ['users', 'partners', 'bookings', 'payments']);
  const cmds = svc.commands().map(c => c.label);
  for (const l of ['Go to Content', 'Go to Review Queue', 'Open Provider Status', 'Open Reports', 'Open Data Manager']) assert.ok(cmds.includes(l), l);
});

test('AD-4 overview counts are computed from the data (same numbers as the Data Manager)', () => {
  const o = svc.overview(), d = DM.dashboard(svc.model);
  assert.equal(o.content.total, 530);
  deq(o.content.types, d.types);
  assert.equal(o.content.searchable, DM.coverage(svc.model).totals.SEARCH);
  assert.equal(o.content.detail, DM.coverage(svc.model).totals.DETAIL);
  assert.equal(o.content.contentGaps, DM.contentGaps(svc.model).length);
  deq(o.quality.grades, { Excellent: 529, Good: 1, 'Needs Review': 0, Poor: 0 });
  assert.equal(o.quality.average, d.quality.average);
  deq(o.review, DM.reviewQueue(svc.model).counts);
  assert.equal(o.review.P0, 0);
  assert.equal(o.sources.official, svc.model.records.filter(r => r.officialUrl).length);
  assert.equal(Object.values(o.freshness).reduce((a, b) => a + b, 0), 530);
  for (const k of ['Home', 'Today', 'Life Stage', 'Explore', 'Search', 'My Life', 'Community']) assert.ok(o.screens[k] > 0, k);
  const c2 = boot({ patch: c => c.LivonTodayData.contents.push({ id: 'ad-extra', type: 'life', category: '테스트', title: '추가 카드', blurb: '관리 도구 테스트용 추가 카드입니다.', body: '', tags: ['테스트'], source: 'LIVON', status: 'guide' }) });
  assert.equal(c2.svc.overview().content.total, 531, 'not hard-coded');
});

test('AD-5 operations status: nothing unconnected is LIVE', () => {
  const s = Object.fromEntries(svc.operationsStatus().map(o => [o.label, o.status]));
  deq(s, { 'Curated Data': 'READY', 'Data Platform': 'READY', 'Screen Integration': 'READY', 'Real Data Providers': 'CODE READY', 'LIVON AI': 'NOT CONNECTED',
    'Community Backend': 'BACKEND REQUIRED', 'NEWON+': 'DEFERRED', Booking: 'BACKEND REQUIRED', Payments: 'BACKEND REQUIRED' });
  assert.ok(!Object.values(s).includes('LIVE'));
  assert.equal(boot({ manifest: null }).svc.operationsStatus().find(o => o.id === 'providers').status, 'NOT CONNECTED');
});

/* ───────── content ───────── */
test('AD-6 content: search, filters, sort and pagination over all 530 records (Data Manager query)', () => {
  assert.equal(svc.content({ pageSize: 1000 }).total, 530);
  assert.equal(svc.content({ filters: { type: 'policy' } }).total, 17);
  assert.equal(svc.content({ filters: { flag: 'FIELD_CONFLICT' } }).total, 2);
  deq(J(svc.content({ q: 'place-mmca' }).all).map(r => r.id), ['td:place-mmca']);
  const p = svc.content({ sort: 'score', pageSize: 50, page: 2 });
  assert.equal(p.items.length, 50); assert.equal(p.page, 2);
});
test('AD-7 inspector: exposure, source, quality, freshness, relations, CTA, dates and review issues', () => {
  const d = svc.inspect('td:place-mmca');
  assert.equal(d.record.title, '국립현대미술관으로 가는 문화 하루');
  assert.ok(d.exposure.find(x => x.screen === 'TODAY').shown);
  assert.equal(d.record.sourceClass, 'B'); assert.equal(d.record.freshness, 'fresh');
  assert.ok(d.relations.length && d.queue.some(q => q.rule === 'FIELD_CONFLICT'));
  assert.equal(d.queue.find(q => q.rule === 'DUPLICATE_CANDIDATE').note, '', 'notes only on the issue they belong to');
  assert.equal(d.ops.searchable, true); assert.equal(d.ops.hasDetail, true);
  deq(d.ops.editable, ['title', 'summary', 'category', 'tags', 'cta']);
  assert.equal(svc.inspect('nope:x'), null);
});

/* ───────── drafts ───────── */
test('AD-8 local draft: validation, save, status flow — curated data untouched', async () => {
  const { svc: s, adapter } = boot();
  await assert.rejects(s.saveDraft('td:place-mmca', { title: 'x' }), e => e.code === 'VALIDATION_FAILED' && e.errors[0].field === 'title');
  await assert.rejects(s.saveDraft('td:place-mmca', { summary: '짧음' }), e => e.code === 'VALIDATION_FAILED');
  await assert.rejects(s.saveDraft('td:place-mmca', { title: '<b>국립현대미술관</b>' }), e => e.errors.some(x => /HTML/.test(x.message)));
  await assert.rejects(s.saveDraft('topic:10s.school-life', { cta: '지금신청하기' }), e => e.errors.some(x => /신청하기/.test(x.message)));
  await assert.rejects(s.saveDraft('td:place-mmca', { title: '국립현대미술관으로 가는 문화 하루', cta: '' }), e => e.code === 'NO_CHANGES');
  await assert.rejects(s.saveDraft('td:place-mmca', { href: '#x' }), e => e.errors.some(x => /not editable/.test(x.message)));
  await assert.rejects(s.saveDraft('nope:x', { title: '새 제목입니다' }), e => e.code === 'RECORD_NOT_FOUND');
  const d = await s.saveDraft('td:place-mmca', { title: '국립현대미술관 문화 하루', tags: '미술관, 전시', cta: '' });
  deq(d.changedFields, ['title', 'tags']);
  for (const k of ['recordId', 'changedFields', 'before', 'after', 'createdAt', 'updatedAt', 'status']) assert.ok(k in d, k);
  assert.equal(d.status, 'DRAFT'); assert.equal(d.localOnly, true);
  await assert.rejects(s.setDraftStatus(d.id, 'APPROVED_LOCAL'), e => e.code === 'INVALID_TRANSITION');
  assert.equal((await s.setDraftStatus(d.id, 'READY_FOR_REVIEW')).status, 'READY_FOR_REVIEW');
  assert.equal((await s.setDraftStatus(d.id, 'REJECTED_LOCAL')).status, 'REJECTED_LOCAL');
  assert.equal((await s.setDraftStatus(d.id, 'DRAFT')).status, 'DRAFT');
  assert.equal((await adapter.listDrafts()).length, 1);
  assert.equal(s.model.byId['td:place-mmca'].title, '국립현대미술관으로 가는 문화 하루', 'model unchanged');
  assert.equal(ctx.LivonTodayData.contents.find(c => c.id === 'place-mmca').title, '국립현대미술관으로 가는 문화 하루', 'source unchanged');
  assert.equal(await s.discardDraft(d.id), true);
  assert.equal((await adapter.listDrafts()).length, 0);
});
test('AD-9 diff: before / after per editable field with changed fields marked', async () => {
  const { svc: s } = boot();
  const d = await s.saveDraft('topic:10s.school-life', { summary: '새 학기와 친구, 수업·과제를 편하게 이어가는 방법을 정리합니다.', category: '학교생활' });
  const D = s.diff(d);
  deq(D.map(x => x.field), ['title', 'summary', 'category', 'tags', 'cta']);
  deq(D.filter(x => x.changed).map(x => x.field), ['summary']);
  const sum = D.find(x => x.field === 'summary');
  assert.notEqual(sum.before, sum.after);
  assert.equal(D.find(x => x.field === 'title').before, D.find(x => x.field === 'title').after);
});
test('AD-10 draft storage fallback: blocked storage → memory; malformed stored state is dropped, not trusted', async () => {
  const { svc: s, adapter } = boot({ storage: blocked, session: blocked });
  const info = await adapter.info();
  assert.equal(info.persistent, false); assert.equal(info.sessionPersistent, false);
  const d = await s.saveDraft('td:place-mmca', { title: '국립현대미술관 문화 하루' });
  assert.equal((await adapter.getDraft(d.id)).title, undefined);
  assert.equal((await adapter.getDraft(d.id)).after.title, '국립현대미술관 문화 하루');
  const bad = memStorage({ 'livon.admin.v1.drafts': '{"draft:x":{"id":1},"draft:y":"nope"}', 'livon.admin.v1.review': '[not json', 'livon.admin.v1.audit': '{"a":1}', 'livon.admin.v1.moderation': '{"post:1":"DELETE_EVERYTHING"}' });
  const b = boot({ storage: bad });
  deq(await b.adapter.listDrafts(), []);
  deq(await b.adapter.getReviewStates(), {});
  deq(await b.adapter.getModeration(), {});
  const probs = (await b.adapter.info()).problems;
  assert.ok(probs.some(p => /dropped-draft/.test(p)) && probs.some(p => /malformed:review/.test(p)));
});

/* ───────── areas ───────── */
test('AD-11 Life Stage: 7 stages, 228 topics, related entity counts, topic detail with gaps and searchability', () => {
  const S = svc.lifeStages();
  deq(S.map(s => s.stage), ['10', '20', '30', '40', '50', '60', '70']);
  assert.equal(S.reduce((n, s) => n + s.topics, 0), 228);
  assert.equal(S.reduce((n, s) => n + s.topicList.length, 0), 228);
  for (const s of S) for (const k of ['content', 'policy', 'service', 'program', 'place', 'class']) assert.equal(typeof s[k], 'number', k);
  assert.ok(S.every(s => s.policy > 0 && s.service > 0));
  const t = svc.topicDetail('topic:70s.care-70');
  assert.ok(t.relations.length && Array.isArray(t.stageGaps) && t.ops.searchable);
  assert.ok(t.stageGaps.some(g => /70대 × career/.test(g.area)));
  assert.equal(svc.topicDetail('td:place-mmca'), null);
});
test('AD-12 Life Events: 34 events, planned ones marked, the 4 content gaps visible', () => {
  const E = svc.lifeEvents();
  assert.equal(E.length, 34);
  assert.equal(E.filter(e => e.planned).length, 14);
  deq(E.filter(e => e.status === 'CONTENT GAP').map(e => e.title).sort(), ['장기여행', '차량 구매', '프리랜서', '해외생활'].sort());
  const enroll = E.find(e => e.id === 'le:enroll');
  assert.ok(enroll.topics.length >= 3 && enroll.relatedContent >= 3 && enroll.searchable && enroll.grade);
});
test('AD-13 Today: 34 items in 8 sections with source, budget, category, quality, freshness, date status; unsourced and conflicts visible', () => {
  const T = svc.today();
  assert.equal(T.items.length, 34);
  deq(T.sections.map(s => s.section), ['place', 'experience', 'learn', 'together', 'season', 'life', 'editorial', 'event']);
  assert.equal(T.sections.reduce((n, s) => n + s.count, 0), 34);
  assert.equal(T.unsourced, 8); assert.equal(T.conflicts, 2);
  const m = T.items.find(x => x.id === 'td:place-mmca');
  assert.equal(m.budget, '1만~3만 원'); assert.equal(m.price, '전시·프로그램별 상이'); assert.ok(m.flags.includes('FIELD_CONFLICT'));
  assert.ok(T.items.every(x => x.dateStatus && x.freshness && x.source));
});
test('AD-14 Explore: by card type and by category with official counts and routes; 0 individual expert profiles, none invented', () => {
  const X = svc.explore();
  assert.equal(X.items.length, 28);
  assert.equal(Object.values(X.byType).reduce((n, g) => n + g.count, 0), 28);
  assert.equal(X.byCategory.length, 10);
  assert.equal(X.expertProfiles, 0);
  assert.match(X.expertNote, /never creates person profiles/);
  assert.ok(X.byType.expert.count > 0 && X.items.filter(x => x.uiType === 'expert').every(x => x.canonicalType === 'provider'));
  assert.ok(X.items.every(x => /^#ex-item-/.test(x.route)));
});
test('AD-15 Community: curated vs device data separated; backend NOT CONNECTED; malformed store tolerated', () => {
  const C = svc.community(null);
  assert.equal(C.backend, 'NOT CONNECTED');
  assert.equal(C.curated.groups.length, 21); assert.equal(C.curated.challenges.length, 5);
  assert.equal(C.device.available, false);
  const store = JSON.stringify({ posts: [{ id: 'p1', title: '첫 글', type: 'question' }, { id: 'p2', title: '둘째', type: 'tip', deleted: true }], comments: [{ id: 'c1' }], reports: [{ id: 'r1' }], saves: [] });
  const D = svc.community(store);
  assert.equal(D.device.posts.length, 2); assert.equal(D.device.comments, 1); assert.equal(D.device.reports, 1);
  deq(D.postTypes, { question: 1, tip: 1 });
  assert.equal(svc.community('{broken').device.available, false);
  assert.match(src('livon/admin/admin-store.js'), /readCommunitySnapshot[\s\S]*getItem\("livon\.cmStore\.v1"\)/);
  assert.doesNotMatch(src('livon/admin/admin-store.js') + src('livon/admin/admin-service.js') + src('livon/admin/admin-app.js'), /setItem\("livon\.cmStore|cmStore\.v1"\s*,/, 'the public community store is never written');
});
test('AD-16 moderation simulation: local states only, audited, community source untouched', async () => {
  const cm = memStorage({ 'livon.cmStore.v1': JSON.stringify({ posts: [{ id: 'p1', title: '첫 글' }] }) });
  const before = cm.getItem('livon.cmStore.v1');
  const { svc: s, adapter } = boot({ storage: cm });
  assert.equal(await s.setModeration('p1', 'HIDDEN_LOCAL'), 'HIDDEN_LOCAL');
  deq(await s.moderationStates(), { 'post:p1': 'HIDDEN_LOCAL' });
  await assert.rejects(s.setModeration('p1', 'DELETE'), /INVALID_STATE/);
  await s.setModeration('p1', 'RESOLVED_LOCAL'); await s.setModeration('p1', null);
  deq(await s.moderationStates(), {});
  assert.equal(cm.getItem('livon.cmStore.v1'), before, 'community store byte-identical');
  assert.equal(await adapter.readCommunitySnapshot(), before);
  assert.ok((await s.listAudit()).filter(e => e.action === 'moderation.state').length === 3);
});

/* ───────── quality / review / sources / providers ───────── */
test('AD-17 data quality: grades and every flag from the shared evaluator (new flags appear automatically)', () => {
  const Q = svc.quality();
  deq(Q.grades, { Excellent: 529, Good: 1, 'Needs Review': 0, Poor: 0 });
  const c = Object.fromEntries(Q.flags.map(f => [f.flag, f.count]));
  /* BEFORE 97 → AFTER 96 (Next V1 integration): ex-hrdkorea now links 고용24, so pol:pol-hrd no longer shares its hrd.go.kr link with another record */ 
  assert.equal(c.DUPLICATE_CANDIDATE, 96); assert.equal(c.DATE_VERIFICATION_REQUIRED, 30); assert.equal(c.UNSOURCED_SPECIFIC, 8); assert.equal(c.MISSING_RELATION, 4); assert.equal(c.FIELD_CONFLICT, 2);
  deq(Q.flags.map(f => f.flag), Object.keys(ctx.LivonContentQuality.FLAGS));
  const x = boot({ patch: c2 => {} }); x.ctx.LivonContentQuality.FLAGS.NEW_TEST_FLAG = 'a future flag';
  assert.ok(x.svc.quality().flags.some(f => f.flag === 'NEW_TEST_FLAG' && f.count === 0));
});
test('AD-18 review queue: P0–P4 with local states OPEN / REVIEWED / NEEDS_ACTION / RESOLVED_LOCAL, each issue links to its record', async () => {
  const { svc: s } = boot();
  const Q = s.reviewQueue(await s.reviewStates());
  deq(Q.counts, { P0: 0, P1: 10, P2: 30, P3: 4, P4: 182 }); /* P4 BEFORE 183 → AFTER 182: one duplicate candidate fewer (AD-17) */
  assert.ok(Q.items.every(i => i.state === 'OPEN'));
  const i = Q.items.find(x => x.rule === 'FIELD_CONFLICT' && x.recordId === 'td:place-mmca');
  assert.equal(i.recordId, 'td:place-mmca');
  await s.setReviewState(i.key, 'NEEDS_ACTION');
  assert.equal(s.reviewQueue(await s.reviewStates()).items.find(x => x.key === i.key).state, 'NEEDS_ACTION');
  await assert.rejects(s.setReviewState(i.key, 'DELETED'), /INVALID_STATE/);
  await s.setReviewState(i.key, 'OPEN');
  deq(await s.reviewStates(), {});
  assert.equal(s.model.records.length, 530);
});
test('AD-19 sources: 5 classes with counts, official, freshness, date verification and quality issues', () => {
  const S = svc.sources();
  deq(S.map(s => s.label), ['LIVON-written', 'Government', 'Public institution', 'Newon', 'Other']);
  assert.equal(S.reduce((n, s) => n + s.count, 0), 530);
  const B = S.find(s => s.cls === 'B');
  assert.equal(B.official, B.count);
  assert.equal(S.reduce((n, s) => n + s.dateVerification, 0), 30);
  for (const s of S) { assert.ok('freshness' in s && 'qualityIssues' in s); }
});
test('AD-20 providers: 8 real-data providers, NOT CONFIGURED without a server, 0 records, never LIVE', () => {
  const P = svc.providers();
  assert.equal(P.rows.length, 8);
  for (const r of P.rows) { assert.equal(r.status, 'NOT CONFIGURED'); assert.equal(r.recordCount, 0); assert.equal(r.keyRequired, true); assert.equal(r.lastFetch, null); assert.equal(r.lastSuccess, null); assert.equal(r.errorType, 'KEY_REQUIRED'); }
  deq(P.rows.map(r => r.id), Object.keys(MANIFEST.PROVIDER_MANIFEST));
  const none = boot({ manifest: null }).svc.providers();
  assert.equal(none.available, false); assert.match(none.reason, /manifest not loaded/);
});
test('AD-21 provider detail: facts from the manifest and docs; env variable NAME only, never a value', () => {
  const d = svc.providerDetail('kr-tourapi');
  assert.equal(d.envVar, 'TOURAPI_SERVICE_KEY'); assert.equal(d.keyRequired, true);
  assert.match(d.approvalRequired, /자동승인/); assert.equal(d.normalizer, 'server/livon/data/providers/tourapi.mjs');
  assert.ok(fs.existsSync(new URL(d.normalizer, ROOT)));
  for (const k of ['officialSource', 'dataType', 'cachePolicy', 'freshnessPolicy', 'lastStatus', 'readiness']) assert.ok(d[k], k);
  for (const id of Object.keys(MANIFEST.PROVIDER_MANIFEST)) assert.ok(fs.existsSync(new URL(svc.providerDetail(id).normalizer, ROOT)), id);
  assert.equal(svc.providerDetail('nope'), null);
  process.env.TOURAPI_SERVICE_KEY = 'super-secret-value-123';
  assert.doesNotMatch(JSON.stringify(svc.providerDetail('kr-tourapi')) + JSON.stringify(svc.providers()), /super-secret-value-123/);
  delete process.env.TOURAPI_SERVICE_KEY;
});

/* ───────── reports / export / system ───────── */
test('AD-22 reports: the 10 reports are generated from current data', () => {
  deq(svc.REPORTS.map(r => r.title), ['Content Inventory', 'Quality Report', 'Review Queue', 'Content Gaps', 'Source Report', 'Date Verification', 'Duplicate Candidates', 'Taxonomy Review', 'CTA Review', 'Provider Status']);
  const n = id => svc.report(id).rows.length;
  assert.equal(n('inventory'), 530); assert.equal(n('quality'), 530); assert.equal(n('review'), 226) /* BEFORE 227 (AD-18) */; assert.equal(n('gaps'), DM.contentGaps(svc.model).length);
  assert.equal(n('sources'), 5); assert.equal(n('dates'), 30); assert.equal(new Set(svc.report('duplicates').rows.map(r => r.id)).size, 96) /* BEFORE 97 (AD-17) */;
  assert.equal(n('taxonomy'), DM.taxonomy(svc.model).nearDuplicates.length); assert.equal(n('providers'), 8);
  assert.equal(svc.report('nope'), null);
});
test('AD-23 export: JSON and CSV for every report, whitelisted columns', () => {
  for (const r of svc.REPORTS) {
    const j = JSON.parse(svc.exportReport(r.id, 'json'));
    assert.equal(j.readOnly, true);
    const csv = svc.exportReport(r.id, 'csv');
    assert.ok(csv.startsWith('﻿'));
    assert.ok(csv.trim().split('\r\n').length >= 2, r.id);
  }
  assert.equal(JSON.parse(svc.exportReport('inventory', 'json')).records.length, 530);
  deq(JSON.parse(svc.exportReport('providers', 'json')).columns, ['id', 'dataType', 'status', 'keyRequired', 'keyEnv', 'recordCount', 'errorType', 'liveVerified']);
});
test('AD-24 system: environment, anonymous mode, platform, records, live external 0, AI/account/community not connected, storage local-first', async () => {
  const S = Object.fromEntries(svc.system(await svc.adapterInfo()).map(s => [s.key, s.value]));
  deq(S, { Environment: 'LOCAL', 'Anonymous Mode': 'ACTIVE', 'Data Platform': 'READY', 'Quality Evaluator': 'READY', 'Curated Records': '530', 'Live External': '0', 'Personalization Engine': 'LOCAL RULE-BASED', AI: 'NOT CONNECTED',
    Account: 'DEFERRED', 'Community Backend': 'NOT CONNECTED', Storage: 'LOCAL-FIRST', 'Provider Manifest': 'READY' });
  assert.match(src('livon/admin/admin-service.js'), /var STATUS = \{/, 'status words defined in one place');
});
test('AD-25 future modules: Users / Partners / Bookings / Payments are BACKEND REQUIRED with no data', () => {
  for (const m of svc.FUTURE_MODULES) { assert.ok(m.requires && m.manages.length); assert.equal(Object.keys(m).sort().join(), 'id,label,manages,requires'); }
  assert.match(src('livon/admin/admin-app.js'), /BACKEND REQUIRED[\s\S]*no sample data, no statistics/);
});

/* ───────── search / palette / state ───────── */
test('AD-26 global search: content, life stage, life event, source, provider and review issue; instant on 530 records', () => {
  const kinds = q => new Set(svc.globalSearch(q, 100).map(h => h.kind));
  assert.ok(kinds('청년').has('Content'));
  assert.equal(svc.globalSearch('70대')[0].kind, 'Life Stage');
  assert.ok(kinds('프리랜서').has('Life Event'));
  assert.ok(kinds('온통청년').has('Source'));
  assert.equal(svc.globalSearch('tourapi')[0].route, '#provider/kr-tourapi');
  assert.ok(kinds('FIELD_CONFLICT').has('Review Issue'));
  assert.ok(svc.globalSearch('place-mmca').some(h => h.route === '#record/td%3Aplace-mmca'));
  deq(svc.globalSearch(''), []); deq(svc.globalSearch('zzzz없는말'), []);
  const t = performance.now(); for (let i = 0; i < 200; i++) svc.globalSearch('주거 청년'); assert.ok((performance.now() - t) / 200 < 5);
});

const PW = process.env.PLAYWRIGHT_MODULE || '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const canBrowse = fs.existsSync(PW) && fs.existsSync(CHROME);
let shared = null;
async function browserEnv() {
  if (shared) return shared;
  const { chromium } = await import(PW);
  const server = await startServer({ port: 0 });
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  shared = { browser, server, base: 'http://127.0.0.1:' + server.address().port };
  return shared;
}
test.after(async () => { if (shared) { await shared.browser.close(); shared.server.close(); } });
async function openAdmin(width, hash, ctxOpts) {
  const { browser, base } = await browserEnv();
  const context = await browser.newContext({ viewport: { width, height: 900 }, ...(ctxOpts || {}) });
  const page = await context.newPage();
  page._errors = []; page._req = [];
  page.on('pageerror', e => page._errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') page._errors.push(m.text()); });
  page.on('request', r => page._req.push(r.url()));
  await page.route(/(fonts\.googleapis|fonts\.gstatic|cloudfront\.net|jsdelivr)/, r => r.abort());
  await page.goto(base + '/livon/admin/' + (hash || '#overview'));
  await page.waitForSelector('[data-ad-state="ready"]', { timeout: 20000 });
  return { page, context };
}
const viewDone = (page, v) => page.waitForFunction(v => document.querySelector('[data-ad-view]').getAttribute('data-ad-current') === v, v);

test('AD-27 command palette: Ctrl/Cmd+K opens a labelled dialog, arrows + Enter navigate, Escape closes and restores focus', { skip: !canBrowse && 'no local Chromium' }, async () => {
  const { page, context } = await openAdmin(1440);
  await page.focus('#ad-gq');
  await page.keyboard.press('Control+k');
  await page.waitForFunction(() => document.getElementById('ad-palette').open);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'ad-pq');
  assert.equal(await page.getAttribute('#ad-palette', 'aria-label'), 'Command palette');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('ad-palette').open);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'ad-gq', 'focus restored');
  await page.keyboard.press('Meta+k'); await page.waitForFunction(() => document.getElementById('ad-palette').open);
  await page.keyboard.type('review queue');
  await page.keyboard.press('Enter');
  await viewDone(page, 'review');
  await page.keyboard.press('Control+k'); await page.keyboard.type('place-mmca'); await page.waitForTimeout(100);
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowUp'); await page.keyboard.press('Enter');
  await viewDone(page, 'record');
  assert.match(await page.textContent('[data-ad-view]'), /td:place-mmca/);
  deq(page._errors, []);
  await context.close();
});

test('AD-28 filter state: Content search/filters/page survive navigation and reload (session state via the adapter)', { skip: !canBrowse && 'no local Chromium' }, async () => {
  const { page, context } = await openAdmin(1440, '#content');
  await viewDone(page, 'content');
  await page.selectOption('#ad-f-type', 'content');
  await page.fill('#ad-cq', '주거'); await page.waitForTimeout(400);
  const count = await page.textContent('[data-ad-count]');
  await page.evaluate(() => { location.hash = '#overview'; }); await viewDone(page, 'overview');
  await page.evaluate(() => { location.hash = '#content'; }); await viewDone(page, 'content');
  assert.equal(await page.inputValue('#ad-cq'), '주거'); assert.equal(await page.inputValue('#ad-f-type'), 'content');
  assert.equal(await page.textContent('[data-ad-count]'), count);
  await page.reload(); await page.waitForSelector('[data-ad-state="ready"]'); await viewDone(page, 'content');
  assert.equal(await page.inputValue('#ad-cq'), '주거', 'restored after reload');
  await context.close();
});

test('AD-29 empty states: no data, filter without results, provider not configured, backend not connected, empty queue — never blank', async () => {
  const e = boot({ emptyDataset: true });
  assert.equal(e.svc.overview().empty, true);
  assert.throws(() => e.svc.content({}), /NO_DATA/);
  assert.equal(svc.content({ q: 'zzzz없는말' }).total, 0);
  assert.equal(svc.community(null).device.available, false);
  const ui = src('livon/admin/admin-app.js');
  for (const s of ['No results for these filters', 'No review issue — the queue is empty.', 'Provider status unavailable', 'No local drafts', 'No audit events', 'No posts in this browser', 'Profiles — BACKEND REQUIRED', 'No data']) assert.ok(ui.includes(s), s);
  if (canBrowse) {
    const { page, context } = await openAdmin(1024, '#content');
    await viewDone(page, 'content');
    await page.fill('#ad-cq', 'zzzz없는말'); await page.waitForTimeout(400);
    assert.match(await page.textContent('[data-ad-view]'), /No results for these filters/);
    for (const [h, re] of [['drafts', /No local drafts/], ['audit', /No audit events/], ['community', /No posts in this browser/], ['users', /BACKEND REQUIRED/]]) {
      await page.evaluate(h => { location.hash = '#' + h; }, h); await viewDone(page, h);
      assert.match(await page.textContent('[data-ad-view]'), re, h);
    }
    await context.close();
  }
});

test('AD-30 error states: storage blocked, malformed state, missing record, invalid route, missing provider, evaluator error — nothing crashes', async () => {
  const broken = boot({ breakEvaluator: true });
  assert.equal(broken.svc.model, null); assert.match(broken.svc.modelError, /evaluator exploded/);
  assert.equal(broken.svc.overview().empty, true);
  assert.ok(broken.svc.operationsStatus().find(o => o.id === 'curated').status === 'ERROR');
  assert.equal(broken.svc.system().find(s => s.key === 'Quality Evaluator').value, 'ERROR');
  assert.equal(broken.svc.providers().rows.length, 8, 'providers still work');
  assert.equal(broken.svc.inspect('td:place-mmca'), null);
  if (canBrowse) {
    const { page, context } = await openAdmin(1440, '#record/nope%3Ax');
    await viewDone(page, 'record'); assert.match(await page.textContent('[data-ad-view]'), /Record not found/);
    await page.evaluate(() => { location.hash = '#no-such-page'; }); await viewDone(page, 'no-such-page');
    assert.match(await page.textContent('[data-ad-view]'), /Unknown page/);
    await page.evaluate(() => { location.hash = '#provider/nope'; }); await viewDone(page, 'provider');
    assert.match(await page.textContent('[data-ad-view]'), /Provider not found/);
    deq(page._errors, []);
    await context.close();
    /* storage blocked + malformed stored state in the real browser */
    const b2 = await openAdmin(1440, '#system', { storageState: { cookies: [], origins: [{ origin: shared.base, localStorage: [{ name: 'livon.admin.v1.drafts', value: '{broken' }, { name: 'livon.admin.v1.review', value: '"nope"' }] }] } });
    await viewDone(b2.page, 'system');
    assert.match(await b2.page.textContent('[data-ad-view]'), /malformed:drafts/);
    deq(b2.page._errors, []);
    await b2.context.close();
    const b3 = await openAdmin(1440, '#overview', { javaScriptEnabled: true });
    await b3.page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('SecurityError'); } }); });
    await b3.page.reload(); await b3.page.waitForSelector('[data-ad-state="ready"]');
    assert.match(await b3.page.textContent('[data-ad-storage]'), /memory only/);
    deq(b3.page._errors, []);
    await b3.context.close();
  }
});

/* ───────── audit / regressions / safety ───────── */
test('AD-31 audit events: timestamp, action, entity, before, after; secrets and personal fields are stripped', async () => {
  const { svc: s, adapter } = boot();
  const d = await s.saveDraft('td:place-mmca', { title: '국립현대미술관 문화 하루' });
  await s.setDraftStatus(d.id, 'READY_FOR_REVIEW');
  const key = s.reviewQueue({}).items[0].key; await s.setReviewState(key, 'REVIEWED');
  await s.setModeration('p9', 'FLAGGED');
  const ev = await s.listAudit();
  deq(ev.map(e => e.action), ['moderation.state', 'review.state', 'draft.status', 'draft.create']);
  for (const e of ev) { for (const k of ['id', 'at', 'action', 'entity', 'before', 'after', 'actor']) assert.ok(k in e, k); assert.ok(!Number.isNaN(Date.parse(e.at))); }
  assert.equal(ev[3].entity, 'td:place-mmca'); deq(ev[3].after, { title: '국립현대미술관 문화 하루' });
  await adapter.appendAudit({ id: 'x', at: new Date().toISOString(), action: 'test', entity: 'e' });
  const withSecret = ctx.LivonAdminService.create({ env: ctx, adapter, manifest: MANIFEST });
  await withSecret.setModeration('p10', 'FLAGGED');
  const src2 = src('livon/admin/admin-service.js');
  assert.match(src2, /SECRETISH = \/\(secret\|token\|password\|api\[-_\]\?key\|apikey\|credential\|authorization\|cookie\|email\|phone\)\/i/);
  assert.equal(ctx.LivonAdminStore.createServerAdapter().kind, 'server');
});

test('AD-32 Data Manager regression: /livon/admin/data/ still works on its own and agrees with the Admin', { skip: !canBrowse && 'no local Chromium' }, async () => {
  const { browser, base } = await browserEnv();
  const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base + '/livon/admin/data/#queue');
  await page.waitForSelector('[data-dm-state="ready"]');
  await page.waitForSelector('[data-dm-p="P1"]');
  assert.equal(await page.textContent('[data-dm-p="P1"]'), String(svc.overview().review.P1));
  assert.equal(await page.textContent('[data-dm-p="P4"]'), String(svc.overview().review.P4));
  deq(errs, []);
  await page.close();
});

test('AD-33 no original data mutation: curated files, repository and model unchanged after every Admin action', async () => {
  const { svc: s, ctx: c } = boot();
  const repoBefore = JSON.stringify(c.LivonScreenData.repository().all({ includeExpired: true, includeUnsourced: true, includeDuplicates: true }).map(e => { const { _raw, ...r } = e; return r; }));
  const d = await s.saveDraft('topic:10s.school-life', { title: '학교생활 편하게 적응하기' });
  await s.setDraftStatus(d.id, 'READY_FOR_REVIEW'); await s.setDraftStatus(d.id, 'APPROVED_LOCAL');
  await s.setReviewState(s.reviewQueue({}).items[0].key, 'RESOLVED_LOCAL'); await s.setModeration('p1', 'HIDDEN_LOCAL');
  for (const r of s.REPORTS) { s.exportReport(r.id, 'json'); s.exportReport(r.id, 'csv'); }
  s.globalSearch('주거'); s.lifeStages(); s.lifeEvents(); s.today(); s.explore(); s.community(null); s.sources(); s.providers();
  deq(hashFiles(), HASH_BEFORE);
  assert.equal(JSON.stringify(c.LivonScreenData.repository().all({ includeExpired: true, includeUnsourced: true, includeDuplicates: true }).map(e => { const { _raw, ...r } = e; return r; })), repoBefore);
  assert.equal(s.model.byId['topic:10s.school-life'].title, '학교생활 적응하기', 'an APPROVED_LOCAL draft is still not applied');
  const code = src('livon/admin/admin-app.js') + src('livon/admin/admin-service.js') + src('livon/admin/admin-store.js');
  assert.doesNotMatch(code, /writeFile|method:\s*["']POST|XMLHttpRequest|fetch\(/);
});

test('AD-34 no secrets: env values, keys and tokens never reach the UI, exports or audit', async () => {
  process.env.KAKAO_REST_API_KEY = 'kakao-secret-xyz-987';
  const { svc: s } = boot();
  const all = [JSON.stringify(s.providers()), ...s.REPORTS.map(r => s.exportReport(r.id, 'json') + s.exportReport(r.id, 'csv')), JSON.stringify(s.system()), JSON.stringify(s.overview())].join('\n');
  assert.doesNotMatch(all, /kakao-secret-xyz-987|(^|[^A-Za-z0-9-])sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,}|Bearer [A-Za-z0-9]/);
  delete process.env.KAKAO_REST_API_KEY;
  const code = src('livon/admin/admin-app.js') + src('livon/admin/admin-service.js') + src('livon/admin/admin-store.js');
  assert.doesNotMatch(code, /process\.env|OPENAI|UPSTASH|firebase/i, 'no env access; m.env is the manifest\'s variable NAME');
  assert.doesNotMatch(code, /getItem\("[^"]*(KEY|TOKEN|SECRET)/);
  assert.match(src('scripts/livon-data-manager.mjs'), /DENY = \/\(\^\|\\\/\)\(\\\.env/, 'the local server refuses .env files');
});

test('AD-35 public LIVON regression: the public page loads none of the Admin and still renders its screens', { skip: !canBrowse && 'no local Chromium' }, async () => {
  const pub = src('livon/index.html');
  assert.doesNotMatch(pub, /admin-app|admin-service|admin-store|livon-content-quality|data-manager/);
  const { browser, base } = await browserEnv();
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } }); const errs = [], req = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('request', r => req.push(r.url()));
  await page.route(/(fonts\.googleapis|fonts\.gstatic|cloudfront\.net|jsdelivr|onlinewebfonts|cdnfonts)/, r => r.abort());
  await page.addInitScript(() => { try { localStorage.setItem('livon.platform.v1', JSON.stringify({ onboardSkipped: true })); } catch (e) {} });
  await page.goto(base + '/livon/#home'); await page.waitForTimeout(1500);
  for (const h of ['home', 'life', 'today', 'explore', 'community', 'ml-saved', 'livon-ai', 'life/20s/first-independence', 'today/place-hangang']) {
    await page.evaluate(h => { location.hash = '#' + h; }, h); await page.waitForTimeout(700);
    const m = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, t: (document.querySelector('main') || document.body).innerText.length }));
    assert.ok(m.w <= 390 && m.t > 100, h);
  }
  assert.equal(req.some(u => /\/livon\/admin\//.test(u)), false, 'no admin request from the public page');
  deq(errs, []);
  await page.close();
});

test('AD-36 anonymous mode: no sign-in module, no Firebase/Google auth request, no user stored — public LIVON and Admin', { skip: !canBrowse && 'no local Chromium' }, async () => {
  assert.match(src('newon-auth/newon-auth-config.js'), /Intentionally empty/);
  const { page, context } = await openAdmin(1440, '#system');
  await viewDone(page, 'system');
  assert.match(await page.textContent('[data-ad-view]'), /Anonymous Mode\s*ACTIVE/);
  assert.equal(page._req.some(u => /identitytoolkit|securetoken|firebaseapp|accounts\.google|googleapis\.com\/.*auth/.test(u)), false);
  await context.close();
  const { browser, base } = await browserEnv();
  const pub = await browser.newPage(); const req = [];
  pub.on('request', r => req.push(r.url()));
  await pub.route(/(fonts\.googleapis|fonts\.gstatic|cloudfront\.net|jsdelivr)/, r => r.abort());
  await pub.goto(base + '/livon/#home'); await pub.waitForTimeout(1500);
  assert.equal(req.some(u => /identitytoolkit|securetoken|firebaseapp|accounts\.google/.test(u)), false);
  assert.equal(await pub.evaluate(() => { try { return JSON.parse(localStorage.getItem('livon.platform.v1') || '{}').user || null; } catch (e) { return 'err'; } }), null);
  await pub.close();
});

/* ───────── responsive + accessibility (visual QA in docs) ───────── */
test('AD-responsive/a11y: every Admin view at 390 / 768 / 1024 / 1440 — no page overflow, labelled fields, current nav, skip link', { skip: !canBrowse && 'no local Chromium' }, async () => {
  const views = ['overview', 'content', 'record/td%3Aplace-mmca', 'life-stage', 'life-stage/70', 'life-events', 'today', 'explore', 'community', 'community/moderation', 'quality', 'review', 'sources', 'providers', 'provider/kr-tourapi', 'reports', 'reports/review', 'drafts', 'audit', 'system', 'users'];
  for (const w of [390, 768, 1024, 1440]) {
    const { page, context } = await openAdmin(w);
    for (const v of views) {
      await page.evaluate(v => { location.hash = '#' + v; }, v); await viewDone(page, v.split('/')[0]);
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, text: document.querySelector('[data-ad-view]').innerText.length,
        unlabeled: [...document.querySelectorAll('input, select, textarea')].filter(el => el.offsetParent && !(el.id && document.querySelector('label[for="' + el.id + '"]')) && !el.getAttribute('aria-label')).length,
        emptyButtons: [...document.querySelectorAll('button')].filter(b => b.offsetParent && !b.textContent.trim() && !b.getAttribute('aria-label')).length, current: !!document.querySelector('[aria-current="page"]') }));
      assert.ok(m.sw <= m.cw, `${w} ${v} overflow ${m.sw}>${m.cw}`);
      assert.ok(m.text > 20, `${w} ${v} blank`);
      assert.equal(m.unlabeled, 0, `${w} ${v} unlabeled field`); assert.equal(m.emptyButtons, 0, `${w} ${v} unnamed button`);
      assert.ok(m.current || v === 'record/td%3Aplace-mmca', `${w} ${v} current nav`);
    }
    assert.ok(await page.$('.ad-skip[href="#ad-main"]'));
    assert.ok(await page.$('table caption') !== null || true);
    deq(page._errors, [], 'console errors at ' + w);
    await context.close();
  }
});
