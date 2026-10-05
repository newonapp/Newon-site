// ONGIL Phase 9 — Admin + Analytics V1: a LOCAL operations view (#admin) and privacy-preserving local usage counters.
//   OG-AD-1 … 20  the operations view: route, positioning, what it shows and what it must never show
//   OG-AN-1 … 35  analytics: contract, allowlists, privacy, storage bounds, instrumentation, source status
//   OG-AQ-1 … 20  quality: accessibility, responsive, security, regression
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
// Browser QA (390 / 820 / 1440) runs from a harness outside the repository — see docs/ongil/PHASE_9_ADMIN_ANALYTICS_V1.md.
// Everything built below is a TEST FIXTURE; none of it is shipped.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import * as A from '../../ongil-start/js/analytics.js';
import * as S from '../../ongil-start/js/source-status.js';
import * as AD from '../../ongil-start/js/admin.js';
import * as R from '../../ongil-start/js/routes.js';
import { createInstrumentation } from '../../ongil-start/js/instrument.js';
import { VIEWS, INTERNAL_VIEWS, resolveView, sectionOf, hashFor } from '../../ongil-start/js/router.js';
import { AREAS, PRIMARY_AREAS, GLOBAL_ENTRIES } from '../../ongil-start/js/areas.js';
import { CLASSIFICATION, classOf, maySync, maySearchGlobally, unclassified } from '../../ongil-start/js/privacy.js';
import { isSyncable } from '../../ongil-start/js/account.js';
import { createSearch, createAreaProvider, createSavedProvider, createCareProvider, createEnjoyProvider, createStoreProvider } from '../../ongil-start/js/search.js';
import * as C from '../../ongil-start/js/contracts.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createTaskStore } from '../../ongil-start/js/tasks.js';
import { createRoutineStore } from '../../ongil-start/js/routines.js';
import { createFamilySharingStore, createHelpRequestStore } from '../../ongil-start/js/family.js';
import { createPostStore, createGroupStore, createMeetupStore } from '../../ongil-start/js/community.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const JS_DIR = path.join(ROOT, 'ongil-start/js');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const js = (f) => read(`ongil-start/js/${f}`);
const HTML = read('ongil-start/index.html');
const APP = js('app.js');
const VIEW = js('admin-view.js');
const ADMIN_SRC = js('admin.js');
const ANALYTICS_SRC = js('analytics.js');
const SOURCE_SRC = js('source-status.js');
const INSTRUMENT_SRC = js('instrument.js');
const APP_CSS = read('ongil-start/styles/ongil-app.css');
const SHELL_CSS = read('ongil-start/styles/ongil-shell.css');
const P9 = ['analytics.js', 'source-status.js', 'instrument.js', 'admin.js', 'admin-view.js'];
/* comments describe what is absent ("no token …"), so wording checks look at code only */
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
/* every sentence the operations view can put on screen */
const STRINGS = [VIEW, ADMIN_SRC, SOURCE_SRC, ANALYTICS_SRC].map(code).join('\n');
const ADMIN_HTML = HTML.slice(HTML.indexOf('id="admin"'), HTML.indexOf('</section>', HTML.indexOf('id="admin"')));

const NOW = new Date(2026, 9, 3, 9, 0, 0).getTime();
const DAY = 86_400_000;
function world(seed) {
  const clock = { t: NOW };
  const now = () => clock.t;
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  const analytics = A.createAnalytics({ storage, now });
  const calls = [];
  const instrument = createInstrumentation((name, props, screen) => {
    calls.push({ name, props: props === undefined ? undefined : { ...props } });
    return analytics.track(name, props, screen);
  });
  return { clock, now, backend, storage, analytics, instrument, calls };
}
const rawAnalytics = (w) => w.backend.getItem(`${KEY_PREFIX}analytics`);
const countOf = (w, name) => (w.analytics.summary().events.find((e) => e.name === name) || { count: 0 }).count;
function fullSearch(saved) {
  const s = createSearch();
  s.registerProvider(createAreaProvider(AREAS));
  s.registerProvider(createSavedProvider(saved, C.SAVED_TYPE_LABELS));
  s.registerProvider(createCareProvider(() => []));
  s.registerProvider(createEnjoyProvider(() => []));
  s.registerProvider(createStoreProvider(() => []));
  return s;
}
/* a public-data source as the screens use it: load() answers { state, items, reason } */
const fakeSource = (answers) => {
  let i = 0;
  return { id: 'fake', connected: true, load: async () => { const a = answers[Math.min(i++, answers.length - 1)]; if (a instanceof Error) throw a; return a; } };
};
const META = { id: 'lifelong-class', label: '평생학습 강좌', provider: 'kr-lifelong-class', purpose: '강좌 찾기', features: ['즐길거리'] };

/* ═════════ OG-AD — the operations view ═════════ */

test('OG-AD-1 route: #admin is an internal view with four sections, resolved and canonical', () => {
  assert.deepEqual([...INTERNAL_VIEWS], ['admin']);
  assert.equal(VIEWS.includes('admin'), false, 'not one of the product screens');
  assert.equal(resolveView('#admin'), 'admin');
  assert.equal(hashFor('admin'), '#admin');
  assert.deepEqual([...R.ADMIN_SECTIONS], ['overview', 'data', 'analytics', 'privacy']);
  for (const s of R.ADMIN_SECTIONS) {
    assert.equal(resolveView(`#admin/${s}`), 'admin');
    assert.equal(sectionOf(`#admin/${s}`), s);
    assert.equal(R.canonicalHash(`#admin/${s}`), `#admin/${s}`);
  }
  assert.equal(AD.adminHash('overview'), '#admin');
  assert.equal(AD.adminHash('data'), '#admin/data');
  assert.equal(AD.adminHash('nope'), '#admin');
  assert.deepEqual(AD.ADMIN_TABS.map((t) => t.id), [...R.ADMIN_SECTIONS]);
});

test('OG-AD-2 invalid admin addresses fall back to #admin and are corrected, also when the router stays silent', () => {
  for (const bad of ['#admin/nope', '#admin/data/x', '#admin/OVERVIEW', '#admin/', '#admin/__proto__', '#admin/constructor']) assert.equal(R.canonicalHash(bad), '#admin', bad);
  for (const junk of ['#admin/%3Cscript%3E', '#admin/<script>', '#admin/"x']) assert.equal(R.canonicalHash(junk) || hashFor(resolveView(junk) || 'admin'), '#admin', junk);
  for (const s of ['nope', 'OVERVIEW', '', null, undefined, 5, {}, 'data/x']) assert.equal(R.resolveAdminSection(s), '', String(s));
  assert.equal(R.sectionValid('admin', 'analytics'), true);
  assert.equal(R.sectionValid('admin', 'users'), false);
  assert.match(APP, /if \(view === 'admin' && section && !resolveAdminSection\(section\)\) win\.history\.replaceState\(null, '', '#admin'\);/);
  assert.match(APP, /win\.addEventListener\('hashchange', \(\) => \{\n {2}const hash = win\.location\.hash;\n {2}const view = resolveView\(hash\);\n {2}if \(!view \|\| !hash\.includes\('\/'\)\) return;/, 'a malformed section on the same screen is corrected too');
  assert.match(VIEW, /resolveAdminSection\(/, 'the view itself only accepts known sections');
});

test('OG-AD-3 not in navigation: no menu entry, no search result and no link leads to the operations view', async () => {
  assert.equal(AREAS.some((a) => a.id === 'admin' || /admin|운영 보기/.test(JSON.stringify(a))), false);
  assert.equal(GLOBAL_ENTRIES.some((e) => /admin/.test(JSON.stringify(e))), false);
  assert.equal(/href="#admin/.test(HTML), false, 'no link in the page');
  assert.equal(/data-og-nav="admin"/.test(HTML), false);
  const w = world();
  const search = fullSearch(createSavedStore(w.storage));
  for (const q of ['운영', 'admin', '관리자', '운영 보기', 'analytics']) assert.deepEqual((await search.query(q)).results, [], q);
  const own = ['admin.js', 'admin-view.js', 'router.js', 'routes.js', 'app.js', 'analytics.js'];
  for (const f of fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js') && !own.includes(f))) assert.equal(/#admin/.test(js(f)), false, `${f} does not link to #admin`);
});

test('OG-AD-4 positioning: a LOCAL OPERATIONS VIEW that says it has no server sign-in, roles or audit log', () => {
  assert.deepEqual({ ...AD.ADMIN_MODE }, { kind: 'LOCAL_OPERATIONS_VIEW', serverAuth: false, rbac: false, remoteAuditLog: false, remoteUsers: false, remoteModeration: false, remoteAnalytics: false, remoteDataEdit: false, liveProviderChecks: false });
  assert.match(HTML, /<section class="og-screen" id="admin" data-og-screen="admin" aria-labelledby="og-admin-title">/);
  assert.match(ADMIN_HTML, /LOCAL OPERATIONS VIEW/);
  assert.match(HTML, /<h1 class="og-page__title" id="og-admin-title" tabindex="-1">운영 보기<\/h1>/);
  assert.match(VIEW, /'data-og-admin-mode': 'LOCAL_OPERATIONS_VIEW'/);
  assert.match(VIEW, /보안된 관리자 페이지가 아닙니다/);
  assert.equal(AD.KNOWN_LIMITATIONS[0].includes('보안된 관리자 페이지가 아니에요'), true);
  assert.equal(/관리자 페이지입니다|관리자 전용|관리자 로그인|권한이 확인되었/.test(STRINGS + HTML), false, 'never claims to be a secured admin page');
});

test('OG-AD-5 no fake authentication: no password, PIN, role or sign-in gate exists in front of the view', () => {
  for (const f of P9) assert.equal(/type: 'password'|type="password"|\bpin\b|passcode|isAdmin|role ===|adminToken|login\(|signIn\(|authenticate\(/i.test(code(js(f))), false, f);
  assert.equal(/<input/i.test(ADMIN_HTML), false);
  assert.equal(AD.SERVER_GAPS.every((g) => g.implemented === false), true);
});

test('OG-AD-6 system status: computed from the code, with the version, environment and storage it really has', () => {
  const w = world();
  const s = AD.buildSystemStatus({ version: 'admin-v1', hostname: 'localhost', storage: w.storage, search: fullSearch(createSavedStore(w.storage)) });
  assert.equal(s.version, 'admin-v1');
  assert.deepEqual(s.environment, { id: 'LOCAL_PREVIEW', label: '로컬 미리보기' });
  assert.equal(s.storage.collectionsDefined, COLLECTIONS.length);
  assert.equal(s.storage.collectionsInUse, 0);
  assert.equal(s.routes.views, VIEWS.length);
  assert.equal(s.routes.internalViews, 1);
  assert.equal(s.routes.sectionedViews, R.SECTIONED_VIEWS.length);
  assert.deepEqual(s.search, { providers: 5, publicProviders: 5, privateProviders: 0 });
  assert.equal(s.savedTypes, C.SAVED_TYPES.length);
  assert.equal(s.notificationTypes, C.NOTIFICATION_TYPES.length);
  assert.deepEqual(s.analytics, { events: A.EVENT_NAMES.length, counters: A.ALL_COUNTERS.length, retentionDays: A.RETENTION_DAYS });
  createTaskStore(w.storage).add({ title: '은행', dueDate: '2026-10-03' });
  assert.equal(AD.buildSystemStatus({ storage: w.storage, search: null }).storage.collectionsInUse, 1, 'counted, not hard-coded');
  assert.match(APP, /const adminView = createAdminView\(\{[\s\S]*?version: APP_VERSION,/);
});

test('OG-AD-7 environment: only what the address shows — an unknown host is "unknown", never "production OK"', () => {
  for (const h of ['localhost', '127.0.0.1', '[::1]', 'LOCALHOST']) assert.equal(AD.environmentOf(h).id, 'LOCAL_PREVIEW', h);
  for (const h of ['ongil.example.test', 'newon.kr', '', null, undefined, 42]) assert.equal(AD.environmentOf(h).id, 'UNKNOWN', String(h));
  assert.equal(/PRODUCTION|STAGING|운영 환경|process\.env|import\.meta\.env/.test(code(ADMIN_SRC) + code(VIEW)), false, 'no environment is asserted and no build configuration is read');
});

test('OG-AD-8 feature status: every area is described by HOW it works, from four modes, counted from the menu', () => {
  assert.deepEqual([...AD.CAPABILITY_MODES], ['LOCAL_READY', 'PUBLIC_DATA_DEPENDENT', 'BACKEND_REQUIRED', 'FUTURE']);
  const f = AD.buildFeatureStatus();
  assert.deepEqual(f.map((x) => x.id), PRIMARY_AREAS.map((a) => a.id));
  assert.deepEqual(f.map((x) => x.id), ['home', 'life', 'health', 'family', 'care', 'enjoy', 'community', 'store']);
  for (const area of f) {
    const src = PRIMARY_AREAS.find((a) => a.id === area.id);
    assert.equal(area.modulesTotal, src.modules.length, area.id);
    assert.equal(area.modulesAvailable, src.modules.filter((m) => m.available === true).length, area.id);
    assert.ok(area.capabilities.length >= 2, area.id);
    for (const c of area.capabilities) {
      assert.ok(AD.CAPABILITY_MODES.includes(c.mode), `${area.id} ${c.label}`);
      assert.equal(c.modeLabel, AD.CAPABILITY_LABELS[c.mode]);
    }
  }
  const mode = (id, i) => f.find((x) => x.id === id).capabilities[i].mode;
  assert.equal(mode('family', 1), 'BACKEND_REQUIRED', '가족 연결 has no server');
  assert.equal(mode('community', 1), 'BACKEND_REQUIRED');
  assert.equal(mode('store', 1), 'FUTURE', 'no product source is connected');
  assert.equal(mode('store', 2), 'FUTURE', 'no payment');
  assert.equal(mode('care', 0), 'PUBLIC_DATA_DEPENDENT');
});

test('OG-AD-9 no readiness score: no percentage, grade, score or "healthy" badge is computed or written', () => {
  for (const area of AD.buildFeatureStatus()) assert.deepEqual(Object.keys(area).sort(), ['capabilities', 'id', 'label', 'modulesAvailable', 'modulesTotal']);
  assert.equal(/score|readiness|percent|grade|\bhealthy\b|uptime/i.test(code(ADMIN_SRC) + code(VIEW)), false);
  assert.equal(/\d+\s*%|\d+\s*점|준비도 \d|완성도|정상 작동|양호/.test(STRINGS), false);
  assert.match(VIEW, /점수나 준비도 평가가 아니에요/);
  assert.equal(AD.buildSecurityStatus().overall, null, 'no overall verdict');
});

test('OG-AD-10 data sources: the three real providers and the unconnected ones, named without any secret', () => {
  const ids = [...APP.matchAll(/observeSource\([\s\S]*?\{ id: '([a-z-]+)', label: '[^']+', provider: '([a-z-]*)'/g)].map((m) => `${m[1]}:${m[2]}`);
  assert.deepEqual(ids, ['lifelong-class:kr-lifelong-class', 'care-facility:kr-kakao-place', 'care-services:', 'care-benefits:', 'tour-place:kr-tourapi', 'enjoy-place:kr-kakao-place', 'products:']);
  const known = new Set(ids.map((i) => i.split(':')[0]));
  for (const caps of Object.values(AD.FEATURE_CAPABILITIES)) for (const c of caps) for (const s of c.sources) assert.ok(known.has(s), `${s} is a registered source`);
  assert.equal((APP.match(/, sourceStatus\)/g) || []).length, 7, 'every source is observed by the one registry');
});

test('OG-AD-11 data sources: never LIVE VERIFIED — a source that was not asked says NOT_REQUESTED', () => {
  assert.equal(S.LIVE_VERIFIED, false);
  const reg = S.createSourceRegistry({ now: () => NOW });
  S.observeSource(fakeSource([{ state: 'ready', items: [1] }]), META, reg);
  const [row] = AD.buildSourceStatus(reg);
  assert.deepEqual([row.state, row.stateLabel, row.requests, row.lastRequestAt, row.lastCount, row.configured, row.liveVerified], ['NOT_REQUESTED', '이번 방문에 요청하지 않음', 0, 0, null, 'UNKNOWN', false]);
  assert.equal(/LIVE VERIFIED|라이브 확인|실시간 확인됨|서버 정상|연결 정상/.test(STRINGS), false);
  assert.match(VIEW, /'data-og-admin-live': 'not-verified'/);
  assert.match(VIEW, /운영 서버 확인: 하지 않음/);
  assert.equal(/fetch\(|setInterval|setTimeout|healthCheck|ping\(/.test(code(SOURCE_SRC) + code(ADMIN_SRC) + code(VIEW)), false, 'nothing asks a source by itself');
});

test('OG-AD-12 content status: counts only, "loaded this visit" is not a catalogue size', () => {
  const w = world();
  createPostStore(w.storage).add({ type: 'QUESTION', category: 'LOCAL', title: '비밀 제목 가나다', body: '비밀 본문 라마바' });
  const saved = createSavedStore(w.storage);
  saved.save({ type: 'PLACE', id: 'p1', title: '저장한 공원 이름', href: '#enjoy' });
  const c = AD.buildContentStatus({ loaded: { care: 3, enjoy: -1, store: 'x' }, savedCounts: saved.counts(), storage: w.storage });
  assert.deepEqual(c.loadedThisVisit, { care: 3, enjoy: 0, store: 0 });
  assert.equal(c.saved.find((t) => t.type === 'PLACE').count, 1);
  assert.deepEqual(c.communityLocal, { posts: 1, groupDrafts: 0, meetupDrafts: 0, publicPosts: null, reports: null, members: null });
  const out = JSON.stringify(c);
  for (const secret of ['비밀 제목', '비밀 본문', '저장한 공원']) assert.equal(out.includes(secret), false, secret);
  assert.match(VIEW, /이번 방문에 불러온 공개 항목/);
  assert.match(VIEW, /전체 자료 수가 아니에요/);
});

test('OG-AD-13 health and family: the operations view does not read or count them at all', () => {
  const src = code(ADMIN_SRC) + code(VIEW);
  for (const c of ['checkins', 'symptoms', 'medications', 'medicationLogs', 'healthNotes', 'familySharing', 'helpRequests', 'journal', 'expenses', 'sleepRecords', 'dailyLife', 'events', 'tasks', 'routines', 'routineLogs']) assert.equal(new RegExp(`['"]${c}['"]`).test(src), false, `${c} is never read by the view`);
  assert.deepEqual([...src.matchAll(/rawCount\(storage, '([A-Za-z]+)'\)/g)].map((m) => m[1]), ['communityPosts', 'groupDrafts', 'meetupDrafts']);
  const w = world();
  createCheckInStore(w.storage).set('hard');
  createFamilySharingStore(w.storage).set('SCHEDULE', 'SUMMARY');
  createHelpRequestStore(w.storage).add({ category: 'shopping' });
  const all = JSON.stringify([AD.buildContentStatus({ storage: w.storage }), AD.buildSystemStatus({ storage: w.storage }), AD.buildPrivacyMatrix(), AD.buildSecurityStatus()]);
  for (const leak of ['hard', 'shopping', 'SUMMARY']) assert.equal(all.includes(`"${leak}"`), false, leak);
  assert.match(VIEW, /건강 기록과 가족 설정은 이 화면에서 세지도 읽지도 않아요/);
});

test('OG-AD-14 rawCount: counts entries without normalising or exposing them, and survives damage', () => {
  const w = world({ [`${KEY_PREFIX}communityPosts`]: '{"items":[{"title":"a"},{"title":"b"},null]}', [`${KEY_PREFIX}groupDrafts`]: '{not json', [`${KEY_PREFIX}meetupDrafts`]: '{"items":"x"}' });
  assert.equal(AD.rawCount(w.storage, 'communityPosts'), 3);
  assert.equal(AD.rawCount(w.storage, 'groupDrafts'), 0);
  assert.equal(AD.rawCount(w.storage, 'meetupDrafts'), 0);
  assert.equal(AD.rawCount({ get() { throw new Error('x'); } }, 'communityPosts'), 0);
});

test('OG-AD-15 search operations: providers and owners from the registries; queries are stored nowhere', async () => {
  const w = world();
  const search = fullSearch(createSavedStore(w.storage));
  const ops = AD.buildSearchOps(search);
  assert.deepEqual(ops.providers.map((p) => `${p.id}:${p.scope}:${p.runs}`), search.providers().map((p) => `${p.id}:PUBLIC:true`));
  assert.deepEqual(ops.owners.map((o) => o.type), [...R.CONTENT_TYPE_IDS]);
  assert.equal(ops.owners.find((o) => o.type === 'POST').searchable, false, 'a saved post is not searched');
  assert.equal(ops.storesQueries, false);
  await search.query('아주 사적인 검색어');
  assert.deepEqual(w.backend.keys(), [], 'a search writes nothing');
  assert.equal(JSON.stringify(AD.buildSearchOps(search)).includes('사적인'), false);
});

test('OG-AD-16 saved operations: item-level sync policy as the content registry defines it (POST = LOCAL_ONLY)', () => {
  const ops = AD.buildSavedOps();
  assert.deepEqual(ops.map((t) => t.type), [...R.CONTENT_TYPE_IDS]);
  for (const t of ops) assert.equal(t.syncPolicy, R.CONTENT_TYPES[t.type].syncPolicy, t.type);
  assert.equal(ops.find((t) => t.type === 'POST').syncPolicy, 'LOCAL_ONLY');
  assert.equal(ops.find((t) => t.type === 'POST').external, false);
  assert.equal(ops.filter((t) => t.syncPolicy === 'LOCAL_ONLY').length, 1);
  assert.match(VIEW, /SYNCABLE, 연결 없음/, 'syncable is a policy, not a working connection');
});

test('OG-AD-17 notification operations: in-app list only; no push, e-mail, SMS, server delivery or producer', () => {
  const n = AD.buildNotificationOps();
  assert.deepEqual(n.delivery, { inApp: true, osPush: false, email: false, sms: false, remote: false });
  assert.equal(n.types.length, C.NOTIFICATION_TYPES.length);
  assert.equal(n.types.every((t) => t.produced === false && t.producer === 'NONE'), true);
  assert.equal(/푸시를 보냈|알림을 보냈|발송 완료/.test(STRINGS), false);
});

test('OG-AD-18 privacy matrix: one row per class, from privacy.js and account.js — nothing personal is shared', () => {
  const m = AD.buildPrivacyMatrix();
  assert.deepEqual(m.map((r) => r.class), ['PUBLIC', 'APP', 'STANDARD', 'PRIVATE', 'HEALTH_ADJACENT', 'OPERATIONAL']);
  assert.deepEqual(m.slice(1).flatMap((r) => r.collections).sort(), [...COLLECTIONS].sort(), 'every collection is in exactly one row');
  for (const r of m.slice(1)) {
    assert.equal(r.search, r.collections.some(maySearchGlobally) ? 'PUBLIC_ITEMS_ONLY' : 'NO', r.class);
    assert.equal(r.sync, r.collections.some(isSyncable) ? 'ALLOWED_NOT_CONNECTED' : 'NO', r.class);
    assert.equal(r.family, 'NO');
    assert.equal(r.community, 'NO');
  }
  for (const cls of ['STANDARD', 'PRIVATE', 'HEALTH_ADJACENT', 'OPERATIONAL']) assert.deepEqual([m.find((r) => r.class === cls).search, m.find((r) => r.class === cls).sync], ['NO', 'NO'], cls);
  assert.deepEqual(m.find((r) => r.class === 'OPERATIONAL').collections, ['analytics']);
  for (const v of new Set(m.flatMap((r) => [r.search, r.sync, r.family, r.community]))) assert.ok(AD.PRIVACY_ANSWERS[v], v);
});

test('OG-AD-19 security: SERVER AUTH, ADMIN RBAC and REMOTE AUDIT LOG are NOT IMPLEMENTED; no "secure" claim', () => {
  const s = AD.buildSecurityStatus();
  assert.deepEqual(s.serverGaps.map((g) => `${g.id}:${g.implemented}`), ['server-auth:false', 'admin-rbac:false', 'remote-audit-log:false']);
  for (const label of ['SERVER AUTH', 'ADMIN RBAC', 'REMOTE AUDIT LOG']) assert.ok(s.serverGaps.some((g) => g.label.includes(label)), label);
  assert.match(VIEW, /NOT IMPLEMENTED/);
  assert.equal(/\bSECURE\b|\bSECURED\b|\bPROTECTED\b|\bCOMPLIANT\b|안전합니다|보호됩니다|보안 인증|규정 준수/.test(STRINGS), false);
  assert.deepEqual(s.policies.map((p) => p.id), ['text-rendering', 'external-url', 'route-validation', 'saved-sync-policy', 'analytics-allowlist']);
  assert.deepEqual(s.transmission, { remote: false, endpoint: null, batch: false, beacon: false });
  assert.equal(Object.values(s.identifiers).every((v) => v === false), true);
});

test('OG-AD-20 actions: read-only except three local ones — re-read, forget source states, reset counters (confirmed)', () => {
  const actions = [...new Set([...VIEW.matchAll(/'data-og-admin-action': '([a-z-]+)'/g)].map((m) => m[1]))].sort();
  assert.deepEqual(actions, ['clear-sources', 'refresh', 'reset-analytics', 'reset-cancel', 'reset-confirm']);
  const v = code(VIEW);
  assert.equal(/storage\.(set|remove|clear)\(|\.save\(|\.add\(|\.unsave\(|\.update\(|\.remove\(/.test(v), false, 'the view writes no user record');
  assert.deepEqual([...new Set(v.match(/analytics\.(\w+)\(/g))].sort(), ['analytics.reset(', 'analytics.summary('], 'the only write is the counter reset');
  assert.match(v, /'data-og-admin-action': 'reset-analytics', disabled: s\.empty,[^\n]*onclick: \(\) => \{ confirmReset = true;/, 'the reset first asks');
  assert.match(v, /'data-og-admin-action': 'reset-confirm'[^\n]*analytics\.reset\(\)/, 'and only the confirmation deletes');
  assert.match(v, /일정, 건강 기록, 저장함 같은 내 정보는 그대로예요/);
  assert.equal(/el\('(input|textarea|select|form)'/.test(v), false, 'no field: nothing can be edited here');
});

/* ═════════ OG-AN — local analytics ═════════ */

test('OG-AN-1 event contract: { name, timestamp, screen, properties } and nothing else', () => {
  const e = A.normalizeEvent('screen_view', { view: 'life', hasSection: 'yes' }, { screen: 'life', now: NOW });
  assert.deepEqual(e, { name: 'screen_view', timestamp: NOW, screen: 'life', properties: { view: 'life', hasSection: 'yes' } });
  assert.deepEqual(Object.keys(e), ['name', 'timestamp', 'screen', 'properties']);
  assert.equal(A.normalizeEvent('app_open', undefined, { screen: 'nowhere', now: NOW }).screen, '', 'an unknown screen is not kept');
  assert.equal(A.normalizeEvent('app_open', null, { now: -5 }).timestamp > 0, true);
  assert.deepEqual(A.normalizeEvent('app_open', 'text', { now: NOW }).properties, {});
});

test('OG-AN-2 event allowlist: exactly the named events (18 from Phase 9 + 4 from Phase 10); anything else is refused', () => {
  // Phase 10: four ONGIL 도우미 events were added (ai_open, ai_intent_matched, ai_action_confirmed, ai_action_cancelled) with
  // three closed-set properties (intent, tool, result). BEFORE: 18 events, 7 properties. AFTER: 22 events, 10 properties.
  assert.deepEqual([...A.EVENT_NAMES], ['app_open', 'screen_view', 'search_submit', 'search_result_open', 'saved_add', 'saved_remove', 'checkin_saved', 'calendar_event_created', 'task_created', 'routine_completed', 'family_settings_changed', 'help_request_draft_created', 'care_item_opened', 'enjoy_item_opened', 'product_opened', 'community_post_saved', 'group_draft_created', 'meetup_draft_created', 'ai_open', 'ai_intent_matched', 'ai_action_confirmed', 'ai_action_cancelled']);
  assert.deepEqual(Object.keys(A.EVENT_LABELS), [...A.EVENT_NAMES]);
  assert.equal(Object.isFrozen(A.EVENTS) && Object.values(A.EVENTS).every(Object.isFrozen), true);
  const w = world();
  for (const bad of ['purchase', 'login', 'medication_taken', 'symptom_logged', '__proto__', 'constructor', 'toString', '', null, undefined, 7, {}, 'APP_OPEN', 'app_open ']) {
    assert.equal(A.normalizeEvent(bad), null, String(bad));
    assert.deepEqual(w.analytics.track(bad), { ok: false, reason: 'UNKNOWN_EVENT' }, String(bad));
  }
  assert.equal(rawAnalytics(w), null, 'a refused event writes nothing');
});

test('OG-AN-3 property allowlist: a property not listed for its event, or a value outside its set, is dropped', () => {
  const e = A.normalizeEvent('saved_add', { contentType: 'PLACE', title: '공원', id: 'p1', view: 'home', queryLength: '1-2' }, { now: NOW });
  assert.deepEqual(e.properties, { contentType: 'PLACE' });
  assert.deepEqual(A.normalizeEvent('saved_add', { contentType: 'JOURNAL' }, { now: NOW }).properties, {});
  assert.deepEqual(A.normalizeEvent('saved_add', { contentType: ['PLACE'] }, { now: NOW }).properties, {});
  assert.deepEqual(A.normalizeEvent('checkin_saved', { status: 'hard', contentType: 'POST' }, { now: NOW }).properties, {}, 'a check-in carries nothing');
  assert.deepEqual(A.normalizeEvent('screen_view', { view: 'life/health', hasSection: true }, { now: NOW }).properties, {});
  for (const [name, keys] of Object.entries(A.EVENTS)) for (const k of keys) assert.ok(Array.isArray(A.PROPERTIES[k]), `${name}.${k} has a closed value set`);
});

test('OG-AN-4 free text cannot be expressed: every property is a short closed list of tokens', () => {
  // Phase 10: + intent, tool, result — enum names only (the longest is PREPARE_FAMILY_SHARE), so the token limit is 24 (BEFORE: 12) and a list may hold 24 values (BEFORE: 12).
  assert.deepEqual(Object.keys(A.PROPERTIES), ['view', 'hasSection', 'queryLength', 'resultCount', 'providerCount', 'outcome', 'contentType', 'intent', 'tool', 'result']);
  for (const k of ['query', 'q', 'text', 'title', 'body', 'name', 'note', 'memo', 'message', 'amount', 'price', 'address', 'phone', 'email', 'location', 'latitude', 'longitude', 'region', 'id', 'itemId', 'userId', 'deviceId', 'status', 'medication', 'symptom', 'category', 'level', 'date', 'time', 'url', 'href']) assert.equal(k in A.PROPERTIES, false, k);
  for (const [k, values] of Object.entries(A.PROPERTIES)) {
    assert.equal(Object.isFrozen(values), true, k);
    assert.ok(values.length <= 24, k);
    for (const v of values) assert.match(v, /^[A-Za-z0-9+_-]{1,24}$/, `${k}=${v}`);
  }
  assert.equal(A.ALL_COUNTERS.every((c) => /^[a-z_]+(\|[A-Za-z]+=[A-Za-z0-9+_-]+)?$/.test(c)), true);
});

test('OG-AN-5 search: only the LENGTH BUCKET of a query is counted — the words never reach storage', () => {
  const w = world();
  const q = '고혈압 약 부작용 김영희 010-1234-5678';
  w.analytics.track('search_submit', { query: q, q, queryLength: A.lengthBucket(q.length), resultCount: A.sizeBucket(0), providerCount: A.providerBucket(0), outcome: 'no-results' }, 'home');
  w.analytics.track('search_submit', { queryLength: q, outcome: q }, 'home');
  const stored = rawAnalytics(w);
  for (const part of ['고혈압', '부작용', '김영희', '010', '1234', '5678', String(q.length)]) assert.equal(stored.includes(part), false, part);
  assert.equal(countOf(w, 'search_submit'), 2);
  assert.deepEqual(w.analytics.summary().events[0].breakdown.map((b) => `${b.key}=${b.value}:${b.count}`), ['queryLength=11+:1', 'resultCount=0:1', 'providerCount=0:1', 'outcome=no-results:1']);
  assert.match(js('panels.js'), /tell\(onSearch, \{ queryLength: outcome\.query\.length, total: outcome\.total, providerCount: outcome\.groups\.length, state: outcome\.state \}\)/, 'the panel hands over a length, not the query');
  assert.match(APP, /onSearch: \(o\) => instrument\.track\('search_submit', \{ queryLength: lengthBucket\(o\.queryLength\), resultCount: sizeBucket\(o\.total\), providerCount: providerBucket\(o\.providerCount\), outcome: o\.state \}\),/);
});

test('OG-AN-6 buckets: exact numbers become ranges before they are counted', () => {
  assert.deepEqual([0, 1, 2, 3, 5, 6, 10, 11, 500].map(A.lengthBucket), ['1-2', '1-2', '1-2', '3-5', '3-5', '6-10', '6-10', '11+', '11+']);
  assert.deepEqual([0, 1, 5, 6, 20, 21, 9999].map(A.sizeBucket), ['0', '1-5', '1-5', '6-20', '6-20', '21+', '21+']);
  assert.deepEqual([0, 1, 4, 5, 12].map(A.providerBucket), ['0', '1', '4', '5+', '5+']);
  for (const odd of [NaN, Infinity, -3, '7', null, undefined, {}]) {
    assert.ok(A.PROPERTIES.queryLength.includes(A.lengthBucket(odd)));
    assert.ok(A.PROPERTIES.resultCount.includes(A.sizeBucket(odd)));
    assert.ok(A.PROPERTIES.providerCount.includes(A.providerBucket(odd)));
  }
});

test('OG-AN-7 no identifier: no user, device, advertising or session id and no fingerprint is created or read', () => {
  assert.deepEqual({ ...A.IDENTIFIERS }, { userId: false, deviceId: false, advertisingId: false, sessionId: false, fingerprint: false });
  for (const f of P9) assert.equal(/randomUUID|getRandomValues|Math\.random|navigator\.|userAgent|document\.cookie|screen\.width|devicePixelRatio|hardwareConcurrency|getTimezoneOffset|canvas|createId|uid\b/i.test(code(js(f))), false, f);
  const w = world();
  for (const name of A.EVENT_NAMES) w.analytics.track(name, {}, 'home');
  const stored = JSON.parse(rawAnalytics(w));
  assert.deepEqual(Object.keys(stored).sort(), ['days', 'schemaVersion']);
  assert.equal(/id|user|device|session|client|visitor/i.test(Object.keys(stored.days['2026-10-03']).join(' ').replace(/provider/g, '')), false);
});

test('OG-AN-8 no remote transmission: no network call, beacon, pixel or third-party analytics script anywhere', () => {
  assert.deepEqual({ ...A.TRANSMISSION }, { remote: false, endpoint: null, batch: false, beacon: false });
  for (const f of P9) assert.equal(/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|new Image|\.src\s*=|importScripts|https?:\/\//.test(code(js(f))), false, f);
  assert.equal(/googletagmanager|google-analytics|gtag\(|\bga\(|segment|mixpanel|amplitude|hotjar|clarity|fbq\(|plausible|posthog|sentry/i.test(HTML), false);
  for (const f of fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js'))) assert.equal(/sendBeacon|googletagmanager|gtag\(|mixpanel|amplitude|posthog/i.test(js(f)), false, f);
  const w = world();
  assert.equal(w.analytics.transmission.remote, false);
  assert.equal('send' in w.analytics || 'flush' in w.analytics || 'export' in w.analytics, false);
  assert.deepEqual(Object.keys(w.analytics).sort(), ['identifiers', 'reset', 'retentionDays', 'summary', 'track', 'transmission']);
});

test('OG-AN-9 storage shape: daily totals only — no raw event, no timestamp, no order of events', () => {
  const w = world();
  w.analytics.track('screen_view', { view: 'health', hasSection: 'no' }, 'health');
  w.clock.t += 60_000;
  w.analytics.track('screen_view', { view: 'health', hasSection: 'no' }, 'health');
  w.analytics.track('checkin_saved', undefined, 'life');
  assert.deepEqual(JSON.parse(rawAnalytics(w)), { schemaVersion: C.SCHEMA_VERSION, days: { '2026-10-03': { screen_view: 2, 'screen_view|hasSection=no': 2, 'screen_view|view=health': 2, checkin_saved: 1 } } });
  assert.equal(/\d{13}|events|timestamp|log/.test(rawAnalytics(w)), false, 'no event list and no time of day');
  assert.deepEqual(w.backend.keys(), [`${KEY_PREFIX}analytics`], 'one key');
});

test('OG-AN-10 bounded: the counter names are a finite set, so a day cannot grow without limit', () => {
  assert.equal(A.ALL_COUNTERS.length, new Set(A.ALL_COUNTERS).size);
  // Phase 10: the four 도우미 events add 35 counters. BEFORE: < 120 counters, 18 events × 400 = 7,200, < 6,000 chars. AFTER: < 160, 22 × 400 = 8,800, < 8,000.
  assert.ok(A.ALL_COUNTERS.length < 160, String(A.ALL_COUNTERS.length));
  const w = world();
  for (let i = 0; i < 400; i++) for (const name of A.EVENT_NAMES) w.analytics.track(name, { view: A.PROPERTIES.view[i % 11], hasSection: i % 2 ? 'yes' : 'no', queryLength: A.PROPERTIES.queryLength[i % 4], resultCount: A.PROPERTIES.resultCount[i % 4], providerCount: A.PROPERTIES.providerCount[i % 6], outcome: A.PROPERTIES.outcome[i % 4], contentType: A.PROPERTIES.contentType[i % 8], intent: A.PROPERTIES.intent[i % 24], tool: A.PROPERTIES.tool[i % 2], result: A.PROPERTIES.result[i % 5], junk: `x${i}` }, 'home');
  const day = JSON.parse(rawAnalytics(w)).days['2026-10-03'];
  assert.equal(Object.keys(day).every((k) => A.ALL_COUNTERS.includes(k)), true);
  assert.equal(Object.keys(day).length, A.ALL_COUNTERS.length, 'every counter used, and not one more');
  assert.ok(rawAnalytics(w).length < 6000, `7,200 events stay small: ${rawAnalytics(w).length} chars`);
  assert.equal(w.analytics.summary().total, 8800);
});

test('OG-AN-11 retention: fourteen days are kept, older days are dropped on the next write', () => {
  assert.equal(A.RETENTION_DAYS, 14);
  const w = world();
  for (let d = 0; d < 40; d++) {
    w.analytics.track('app_open');
    w.clock.t += DAY;
  }
  const days = Object.keys(JSON.parse(rawAnalytics(w)).days);
  assert.equal(days.length, 14);
  assert.deepEqual([days[0], days[13]], ['2026-10-29', '2026-11-11']);
  assert.deepEqual([w.analytics.summary().days, w.analytics.summary().total], [14, 14]);
  assert.ok(rawAnalytics(w).length < 14 * 6000);
});

test('OG-AN-12 retention on read: stored days beyond the limit, or dated in the future, are not shown or kept', () => {
  const days = {};
  for (let i = 1; i <= 30; i++) days[`2026-09-${String(i).padStart(2, '0')}`] = { app_open: 1 };
  days['2027-01-01'] = { app_open: 50 };
  const w = world({ [`${KEY_PREFIX}analytics`]: JSON.stringify({ schemaVersion: 1, days }) });
  assert.equal(w.analytics.summary().days, 14, 'only the newest fourteen are read');
  w.analytics.track('app_open');
  const kept = Object.keys(JSON.parse(rawAnalytics(w)).days);
  assert.equal(kept.length <= 14, true);
  assert.equal(kept.includes('2027-01-01'), false, 'a day after today is dropped');
  assert.equal(kept[kept.length - 1], '2026-10-03');
});

test('OG-AN-13 corrupted storage: any damaged value reads as "no records" and the next event starts again', () => {
  for (const bad of ['{not json', '[1,2]', '"text"', '5', 'null', '{"days":"x"}', '{"days":[1]}', '{"days":{"2026-10-03":"x"}}', '{"days":{"not-a-day":{"app_open":3}}}', '{"days":{"2026-13-45":{"app_open":3}}}']) {
    const w = world({ [`${KEY_PREFIX}analytics`]: bad });
    assert.doesNotThrow(() => w.analytics.summary(), bad);
    assert.deepEqual([w.analytics.summary().empty, w.analytics.summary().total], [true, 0], bad);
    assert.equal(w.analytics.track('app_open').ok, true, bad);
    assert.deepEqual(JSON.parse(rawAnalytics(w)).days, { '2026-10-03': { app_open: 1 } }, bad);
  }
});

test('OG-AN-14 corrupted counters: unknown names, text, negatives and fractions are dropped; counts are capped', () => {
  const w = world({ [`${KEY_PREFIX}analytics`]: JSON.stringify({ days: { '2026-10-03': { app_open: 3, evil_key: 9, 'search_submit|query=비밀 검색어': 4, 'screen_view|view=<script>': 2, screen_view: '7', task_created: -3, checkin_saved: 1.5, saved_add: 9e16, product_opened: A.MAX_COUNT + 50, __proto__: 1 } } }) });
  const s = w.analytics.summary();
  assert.deepEqual(s.events.map((e) => `${e.name}:${e.count}`), ['app_open:3', `product_opened:${A.MAX_COUNT}`]);
  w.analytics.track('app_open');
  const stored = rawAnalytics(w);
  for (const gone of ['evil_key', '비밀 검색어', '<script>', 'task_created', 'checkin_saved', 'saved_add']) assert.equal(stored.includes(gone), false, gone);
  w.analytics.track('product_opened');
  assert.equal(JSON.parse(rawAnalytics(w)).days['2026-10-03'].product_opened, A.MAX_COUNT, 'a counter never passes the cap');
});

test('OG-AN-15 storage unavailable or full: track() answers { ok: false } and never throws', () => {
  const throwing = { get() { throw new Error('SecurityError'); }, set() { throw new Error('QuotaExceededError'); }, remove() { throw new Error('x'); } };
  const a = A.createAnalytics({ storage: throwing, now: () => NOW });
  assert.doesNotThrow(() => a.track('app_open'));
  assert.equal(a.track('app_open').ok, false);
  assert.deepEqual([a.summary().empty, a.summary().total, a.reset()], [true, 0, false]);
  const full = { get: () => null, set: () => false, remove: () => true };
  assert.equal(A.createAnalytics({ storage: full, now: () => NOW }).track('app_open').ok, false, 'a refused write is reported, not thrown');
  assert.doesNotThrow(() => A.createAnalytics({ storage: {}, now: () => NOW }).track('app_open'));
  assert.equal(A.createAnalytics({ storage: null, now: () => NOW }).track('app_open').ok, false);
  assert.equal(A.createAnalytics({ storage: full, now: () => { throw new Error('clock'); } }).track('app_open').ok, false);
});

test('OG-AN-16 reset: removes the counters and only the counters', () => {
  const w = world();
  const tasks = createTaskStore(w.storage);
  tasks.add({ title: '남아야 하는 할 일', dueDate: '2026-10-03' });
  createCheckInStore(w.storage).set('good');
  w.analytics.track('app_open');
  w.analytics.track('screen_view', { view: 'home', hasSection: 'no' });
  assert.equal(w.analytics.summary().total, 2);
  const before = w.backend.keys().filter((k) => k !== `${KEY_PREFIX}analytics`).map((k) => [k, w.backend.getItem(k)]);
  assert.equal(w.analytics.reset(), true);
  assert.equal(rawAnalytics(w), null);
  assert.deepEqual(w.analytics.summary(), { days: 0, firstDay: '', lastDay: '', total: 0, events: [], empty: true });
  assert.deepEqual(w.backend.keys().map((k) => [k, w.backend.getItem(k)]), before, 'every personal record is untouched');
  assert.equal(tasks.count(), 1);
  assert.equal(w.analytics.reset(), true, 'resetting nothing is fine');
});

test('OG-AN-17 erase and classification: counters are ONGIL data — erased with it, never synced, searched or shared', () => {
  assert.ok(COLLECTIONS.includes('analytics'));
  assert.equal(CLASSIFICATION.analytics, 'OPERATIONAL');
  assert.equal(classOf('analytics'), 'OPERATIONAL');
  assert.deepEqual([maySync('analytics'), isSyncable('analytics'), maySearchGlobally('analytics')], [false, false, false]);
  assert.deepEqual(unclassified(), []);
  const w = world({ 'livon.keep': '1', 'newon-app-theme': 'dark' });
  w.analytics.track('app_open');
  createTaskStore(w.storage).add({ title: '할 일', dueDate: '2026-10-03' });
  assert.equal(w.storage.clear(), true);
  assert.deepEqual(w.backend.keys().sort(), ['livon.keep', 'newon-app-theme'], 'the account erase removes the counters and leaves other products alone');
  assert.equal(w.analytics.summary().empty, true);
});

test('OG-AN-18 summary: totals per event with their breakdown, across the kept days', () => {
  const w = world();
  w.analytics.track('saved_add', { contentType: 'PLACE' });
  w.analytics.track('saved_add', { contentType: 'PRODUCT' });
  w.clock.t += DAY;
  w.analytics.track('saved_add', { contentType: 'PLACE' });
  w.analytics.track('app_open');
  const s = w.analytics.summary();
  assert.deepEqual([s.days, s.firstDay, s.lastDay, s.total, s.empty], [2, '2026-10-03', '2026-10-04', 4, false]);
  assert.deepEqual(s.events, [
    { name: 'app_open', label: 'ONGIL 열기', count: 1, breakdown: [] },
    { name: 'saved_add', label: '저장', count: 3, breakdown: [{ key: 'contentType', value: 'PLACE', count: 2 }, { key: 'contentType', value: 'PRODUCT', count: 1 }] },
  ]);
  assert.match(VIEW, /'data-og-admin-analytics-empty': 'true', text: '아직 기록 없음'/, 'the empty state says so instead of showing zeros');
});

test('OG-AN-19 no business metric: no user count, DAU/MAU, revenue, conversion or retention figure exists', () => {
  const names = code(ANALYTICS_SRC) + code(ADMIN_SRC) + code(VIEW) + code(INSTRUMENT_SRC);
  assert.equal(/\bDAU\b|\bMAU\b|\bWAU\b|revenue|conversion|churn|\bARPU\b|\bLTV\b|activeUsers|userCount|memberCount|signups|cohort|funnel/i.test(names), false);
  assert.equal(/활성 사용자 \d|가입자 \d|회원 \d|매출 \d|전환율 \d|재방문율|이용자 \d/.test(STRINGS), false);
  const members = AD.buildContentStatus({ storage: world().storage }).communityLocal;
  assert.deepEqual([members.publicPosts, members.reports, members.members], [null, null, null], 'unknown stays unknown — not zero, not a number');
  assert.match(VIEW, /이용자 수나 매출 같은 숫자는 서버가 없어 알 수 없어요/);
});

test('OG-AN-20 one module: screens and stores never call analytics — only instrument.js (wired once in app.js)', () => {
  const files = fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js'));
  const importers = files.filter((f) => /from '\.\/analytics\.js'/.test(js(f))).sort();
  assert.deepEqual(importers, ['admin.js', 'app.js'], 'admin.js reads constants; app.js creates the one instance');
  assert.equal(/createAnalytics|\.track\(/.test(code(ADMIN_SRC)), false);
  assert.deepEqual(files.filter((f) => /from '\.\/instrument\.js'/.test(js(f))), ['app.js']);
  for (const f of files.filter((f) => !['analytics.js', 'instrument.js', 'app.js'].includes(f))) assert.equal(/\.track\(|analytics\.track|instrument\./.test(code(js(f))), false, `${f} does not track`);
  assert.equal((APP.match(/createAnalytics\(/g) || []).length, 1);
  assert.equal((APP.match(/analytics\.track\(/g) || []).length, 1, 'every event goes through the one instrument');
  assert.match(APP, /const instrument = createInstrumentation\(\(name, props\) => analytics\.track\(name, props, html\.dataset\.ogView \|\| ''\)\);/);
});

test('OG-AN-21 saved: counted by TYPE only — no title, id or address; a repeat or a refusal is not counted', () => {
  const w = world();
  const saved = w.instrument.saved(createSavedStore(w.storage));
  assert.equal(saved.save({ type: 'PLACE', id: 'p1', title: '비밀 공원 이름', href: '#enjoy', address: '서울 비밀로 1' }).ok, true);
  saved.save({ type: 'PLACE', id: 'p1', title: '비밀 공원 이름', href: '#enjoy' });
  assert.equal(saved.save({ type: 'JOURNAL', id: 'j1', title: '일기' }).ok, false);
  saved.toggle({ type: 'PRODUCT', id: 'x1', title: '비밀 상품', href: '#store' });
  saved.toggle({ type: 'PRODUCT', id: 'x1', title: '비밀 상품', href: '#store' });
  saved.unsave('PLACE', 'p1');
  assert.deepEqual(w.calls, [{ name: 'saved_add', props: { contentType: 'PLACE' } }, { name: 'saved_add', props: { contentType: 'PRODUCT' } }, { name: 'saved_remove', props: { contentType: 'PRODUCT' } }, { name: 'saved_remove', props: { contentType: 'PLACE' } }]);
  for (const leak of ['비밀', 'p1', 'x1', '서울']) assert.equal(rawAnalytics(w).includes(leak), false, leak);
  assert.equal(saved.count(), 0, 'the wrapped store is the same store');
});

test('OG-AN-22 check-in: that one was saved is counted — how the person feels is not', () => {
  const w = world();
  const checkIn = w.instrument.checkIn(createCheckInStore(w.storage));
  assert.equal(checkIn.set('hard').ok, true);
  assert.equal(checkIn.set('not-a-status').ok, false);
  assert.deepEqual(w.calls, [{ name: 'checkin_saved', props: undefined }]);
  assert.equal(/hard|good|okay|status/.test(rawAnalytics(w)), false);
  assert.deepEqual([...A.EVENTS.checkin_saved], []);
});

test('OG-AN-23 calendar and tasks: creation is counted without a title, date or place', () => {
  const w = world();
  const schedule = w.instrument.schedule(createScheduleStore(w.storage));
  const tasks = w.instrument.tasks(createTaskStore(w.storage));
  assert.equal(schedule.add({ title: '비밀 병원 예약', time: '14:00' }).ok, true);
  assert.equal(tasks.add({ title: '비밀 은행 업무', dueDate: '2026-10-03' }).ok, true);
  assert.equal(tasks.add({ title: '   ' }).ok, false);
  assert.deepEqual(w.calls, [{ name: 'calendar_event_created', props: undefined }, { name: 'task_created', props: undefined }]);
  for (const leak of ['비밀', '병원', '은행', '14:00']) assert.equal(rawAnalytics(w).includes(leak), false, leak);
  assert.equal(tasks.count(), 1);
});

test('OG-AN-24 routines: only marking one done is counted — not its name, and not un-marking', () => {
  const w = world();
  const routines = w.instrument.routines(createRoutineStore(w.storage));
  const r = routines.add({ title: '비밀 혈압 재기', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }).routine;
  assert.deepEqual(w.calls, [], 'creating a routine is not an event');
  assert.equal(routines.setCompleted(r.id, true).ok, true);
  routines.setCompleted(r.id, false);
  routines.setCompleted('no-such-id', true);
  assert.deepEqual(w.calls, [{ name: 'routine_completed', props: undefined }]);
  assert.equal(/비밀|혈압/.test(rawAnalytics(w)), false);
});

test('OG-AN-25 family: a change of sharing choice and a help request draft are counted — never what was chosen', () => {
  const w = world();
  const sharing = w.instrument.familySharing(createFamilySharingStore(w.storage));
  const help = w.instrument.helpRequests(createHelpRequestStore(w.storage));
  assert.equal(sharing.set('SCHEDULE', 'SUMMARY').ok, true);
  assert.equal(sharing.set('JOURNAL', 'SUMMARY').ok, false);
  assert.equal(help.add({ category: 'shopping', note: '비밀 부탁 내용' }).ok, true);
  assert.deepEqual(w.calls, [{ name: 'family_settings_changed', props: undefined }, { name: 'help_request_draft_created', props: undefined }]);
  for (const leak of ['SCHEDULE', 'SUMMARY', 'shopping', '비밀']) assert.equal(rawAnalytics(w).includes(leak), false, leak);
  assert.deepEqual([[...A.EVENTS.family_settings_changed], [...A.EVENTS.help_request_draft_created]], [[], []]);
});

test('OG-AN-26 community: a saved post or a group / meetup draft is counted — no text, category or place', () => {
  const w = world();
  const meetupStore = createMeetupStore(w.storage);
  const posts = w.instrument.posts(createPostStore(w.storage));
  const groups = w.instrument.groups(createGroupStore(w.storage, { meetups: meetupStore }));
  const meetups = w.instrument.meetups(meetupStore);
  assert.equal(posts.add({ type: 'QUESTION', category: 'LOCAL', title: '비밀 글 제목', body: '비밀 글 본문' }).ok, true);
  assert.equal(posts.add({ type: 'AD', category: 'LOCAL', title: 'x', body: 'y' }).ok, false);
  const g = groups.add({ name: '비밀 모임 이름', category: 'WALKING', meetingStyle: 'OFFLINE', description: '비밀 설명' });
  assert.equal(g.ok, true);
  assert.equal(meetups.add(g.group.id, { title: '비밀 일정', date: '2026-10-10', time: '08:30', placeText: '비밀 공원 정문' }).ok, true);
  assert.deepEqual(w.calls.map((c) => [c.name, c.props]), [['community_post_saved', undefined], ['group_draft_created', undefined], ['meetup_draft_created', undefined]]);
  for (const leak of ['비밀', 'WALKING', 'LOCAL', 'QUESTION', '08:30']) assert.equal(rawAnalytics(w).includes(leak), false, leak);
});

test('OG-AN-27 opening a public item: care and enjoy count the TYPE, a product counts nothing but the open', () => {
  const w = world();
  w.instrument.careOpened({ type: 'FACILITY', id: 'f1', title: '비밀 복지관', address: '서울 비밀로 2', phone: '02-000-0000', latitude: 37.5 });
  w.instrument.enjoyOpened({ type: 'CLASS', id: 'e1', title: '비밀 강좌', organization: '비밀 기관' });
  w.instrument.enjoyOpened({ type: 'PLACE', id: 'e2', title: '비밀 장소' });
  w.instrument.productOpened({ id: 'p1', name: '비밀 상품', price: 12000 });
  w.instrument.careOpened(null);
  assert.deepEqual(w.calls, [{ name: 'care_item_opened', props: { contentType: 'FACILITY' } }, { name: 'enjoy_item_opened', props: { contentType: 'PROGRAM' } }, { name: 'enjoy_item_opened', props: { contentType: 'PLACE' } }, { name: 'product_opened', props: undefined }, { name: 'care_item_opened', props: { contentType: '' } }]);
  for (const leak of ['비밀', '서울', '02-000', '37.5', '12000', 'f1', 'e1', 'p1']) assert.equal(rawAnalytics(w).includes(leak), false, leak);
  for (const [f, hook] of [['care-view.js', 'onOpen'], ['enjoy-view.js', 'onOpen'], ['store-view.js', 'onOpen']]) assert.match(js(f), /if \(from && mode === 'detail' && typeof onOpen === 'function'\) onOpen\((item|p)\);/, `${f} reports an open made by a person, not a restore`);
  assert.match(APP, /onOpen: instrument\.careOpened,/);
  assert.match(APP, /onOpen: instrument\.enjoyOpened,/);
  assert.match(APP, /onOpen: instrument\.productOpened,/);
});

test('OG-AN-28 search result opened: the content type (or MENU) only — not which result, not its title', () => {
  assert.match(APP, /onResultOpen: \(r\) => instrument\.track\('search_result_open', \{ contentType: r\.providerId === 'areas' \? 'MENU' : contentType\(r\.contentType \|\| r\.type\) \}\),/);
  const w = world();
  w.instrument.track('search_result_open', { contentType: 'MENU', title: '비밀 결과', id: 'r1', href: '#life/health' });
  assert.deepEqual(JSON.parse(rawAnalytics(w)).days['2026-10-03'], { search_result_open: 1, 'search_result_open|contentType=MENU': 1 });
  assert.match(js('panels.js'), /onclick: \(\) => tell\(onResultOpen, r\)/);
  assert.match(js('panels.js'), /const tell = /, 'a failing callback cannot break the search panel');
});

test('OG-AN-29 screen view and app open: the screen name and whether it had a section — never the section itself', () => {
  assert.match(APP, /instrument\.track\('screen_view', \{ view, hasSection: section \? 'yes' : 'no' \}\);/);
  assert.match(APP, /instrument\.track\('app_open'\);\nrouter\.start\(\);/);
  const w = world();
  w.instrument.track('screen_view', { view: 'life', hasSection: 'yes', section: 'health' });
  assert.equal(rawAnalytics(w).includes('health'), false, 'being on 내 생활 › 건강 is not recorded');
  assert.deepEqual([...A.PROPERTIES.view], ['home', 'life', 'health', 'family', 'care', 'enjoy', 'community', 'store', 'saved', 'account', 'admin']);
  assert.deepEqual([...A.PROPERTIES.view].sort(), [...VIEWS, ...INTERNAL_VIEWS].sort(), 'exactly the screens that exist');
});

test('OG-AN-30 non-blocking: a failing or throwing tracker changes nothing about what a feature does', () => {
  const storage = createStorage({ backend: createMemoryBackend() });
  const broken = createInstrumentation(() => { throw new Error('analytics is down'); });
  const tasks = broken.tasks(createTaskStore(storage));
  const saved = broken.saved(createSavedStore(storage));
  let r;
  assert.doesNotThrow(() => { r = tasks.add({ title: '할 일', dueDate: '2026-10-03' }); });
  assert.equal(r.ok, true);
  assert.equal(r.task.title, '할 일', 'the result is the store\'s own result');
  assert.doesNotThrow(() => saved.save({ type: 'PLACE', id: 'p1', title: '공원', href: '#enjoy' }));
  assert.doesNotThrow(() => broken.track('app_open'));
  assert.doesNotThrow(() => broken.careOpened({ type: 'FACILITY' }));
  assert.deepEqual([tasks.count(), saved.count()], [1, 1]);
  assert.equal(/await |async |Promise|setTimeout/.test(code(INSTRUMENT_SRC) + code(ANALYTICS_SRC)), false, 'synchronous and tiny: nothing waits on analytics');
});

test('OG-AN-31 wrapped stores keep every method and return the same answers; only success is counted', () => {
  const w = world();
  const plain = createTaskStore(createStorage({ backend: createMemoryBackend() }));
  const wrapped = w.instrument.tasks(createTaskStore(w.storage));
  assert.deepEqual(Object.keys(wrapped).sort(), Object.keys(plain).sort());
  assert.equal(Object.isFrozen(wrapped), true);
  assert.deepEqual(Object.keys(wrapped.add({ title: '가' }, 0)).sort(), Object.keys(plain.add({ title: '가' }, 0)).sort());
  assert.deepEqual(wrapped.add({ title: '' }), plain.add({ title: '' }));
  assert.equal(w.calls.length, 1);
  const src = code(INSTRUMENT_SRC);
  assert.equal(/\.title|\.body|\.name|\.note|\.memo|\.amount|\.address|\.phone|\.status|\.category|\.level|\.id\b/.test(src), false, 'no field of a record is read');
  assert.deepEqual([...new Set([...src.matchAll(/track\('([a-z_]+)'/g)].map((m) => m[1]))].sort(), A.EVENT_NAMES.filter((n) => !['app_open', 'screen_view', 'search_submit', 'search_result_open'].includes(n) && !n.startsWith('ai_')).sort()); // Phase 10: the ai_* events are sent by app.js through instrument.track, like the search events
});

test('OG-AN-32 source states: NOT_REQUESTED → LOADING → SUCCESS / EMPTY / UNAVAILABLE / ERROR, from real answers', async () => {
  assert.deepEqual([...S.SOURCE_STATES], ['NOT_REQUESTED', 'LOADING', 'SUCCESS', 'EMPTY', 'UNAVAILABLE', 'ERROR']);
  assert.deepEqual(Object.keys(S.SOURCE_STATE_LABELS), [...S.SOURCE_STATES]);
  const reg = S.createSourceRegistry({ now: () => NOW });
  let release;
  const slow = { connected: true, load: () => new Promise((res) => { release = () => res({ state: 'ready', items: [{}, {}, {}] }); }) };
  const src = S.observeSource(slow, META, reg);
  assert.equal(reg.get('lifelong-class').state, 'NOT_REQUESTED');
  const pending = src.load({ region: '서울' });
  assert.deepEqual([reg.get('lifelong-class').state, reg.get('lifelong-class').requests, reg.get('lifelong-class').lastRequestAt], ['LOADING', 1, NOW]);
  release();
  await pending;
  assert.deepEqual([reg.get('lifelong-class').state, reg.get('lifelong-class').lastCount, reg.get('lifelong-class').configured], ['SUCCESS', 3, 'YES']);
  const cases = [[{ state: 'ready', items: [] }, 'EMPTY', 0, ''], [{ state: 'empty', items: [] }, 'EMPTY', 0, ''], [{ state: 'unavailable', reason: 'NOT_CONFIGURED', items: [] }, 'UNAVAILABLE', null, 'NOT_CONFIGURED'], [{ state: 'unavailable', reason: 'NOT_CONNECTED' }, 'UNAVAILABLE', null, 'NOT_CONNECTED'], [{ state: 'unavailable', reason: 'REGION_REQUIRED' }, 'UNAVAILABLE', null, 'REGION_REQUIRED'], [{ state: 'unavailable', reason: 'NO_ANSWER' }, 'ERROR', null, 'NO_ANSWER'], [{ state: 'error' }, 'ERROR', null, 'OTHER'], [null, 'ERROR', null, 'OTHER'], ['text', 'ERROR', null, 'OTHER']];
  for (const [answer, state, count, reason] of cases) {
    const r = S.createSourceRegistry({ now: () => NOW });
    await S.observeSource(fakeSource([answer]), META, r).load();
    assert.deepEqual([r.get('lifelong-class').state, r.get('lifelong-class').lastCount, r.get('lifelong-class').lastReason], [state, count, reason], JSON.stringify(answer));
  }
  const r = S.createSourceRegistry();
  await S.observeSource(fakeSource([{ state: 'unavailable', reason: 'NOT_CONFIGURED' }]), META, r).load();
  assert.equal(r.get('lifelong-class').configured, 'NO');
});

test('OG-AN-33 source errors are sanitised: a reason is a category — a message, key or URL is never kept', async () => {
  assert.deepEqual([...S.REASONS], ['NOT_CONNECTED', 'NOT_CONFIGURED', 'NO_ANSWER', 'REGION_REQUIRED', 'OTHER']);
  const reg = S.createSourceRegistry({ now: () => NOW });
  const leaky = { state: 'unavailable', reason: 'HTTP 401 https://api.example.test/v1?serviceKey=SECRETKEY123&region=서울', message: 'Authorization: Bearer abc.def.ghi', items: [{ title: '비밀 항목' }], headers: { authorization: 'KakaoAK 0123456789abcdef' } };
  const src = S.observeSource(fakeSource([leaky, new Error('ECONNREFUSED 10.0.0.5:443 token=abc123')]), META, reg);
  assert.equal(await src.load({ region: '서울 강남구', query: '비밀 검색' }), leaky, 'the answer itself is handed on untouched');
  assert.deepEqual([reg.get('lifelong-class').state, reg.get('lifelong-class').lastReason], ['ERROR', 'OTHER']);
  await assert.rejects(() => src.load(), /ECONNREFUSED/, 'a thrown error still reaches the caller');
  assert.deepEqual([reg.get('lifelong-class').state, reg.get('lifelong-class').lastReason, reg.get('lifelong-class').requests], ['ERROR', 'OTHER', 2]);
  const all = JSON.stringify([reg.list(), AD.buildSourceStatus(reg)]);
  for (const leak of ['SECRETKEY', 'serviceKey', 'Bearer', 'KakaoAK', '0123456789', 'abc123', '10.0.0.5', 'ECONNREFUSED', '401', 'https://', '서울', '강남', '비밀']) assert.equal(all.includes(leak), false, leak);
  assert.deepEqual(Object.keys(reg.get('lifelong-class')).sort(), ['configured', 'connected', 'features', 'id', 'label', 'lastCount', 'lastReason', 'lastRequestAt', 'liveVerified', 'provider', 'purpose', 'requests', 'state']);
  assert.equal(/error\.message|\.stack|String\(error\)|JSON\.stringify/.test(code(SOURCE_SRC)), false);
});

test('OG-AN-34 sources are independent and their status lives in memory only; clearing forgets states, not sources', async () => {
  const reg = S.createSourceRegistry({ now: () => NOW });
  const a = S.observeSource(fakeSource([{ state: 'unavailable', reason: 'NO_ANSWER' }]), META, reg);
  const b = S.observeSource(fakeSource([{ state: 'ready', items: [1, 2] }]), { ...META, id: 'tour-place', label: '관광 정보', provider: 'kr-tourapi' }, reg);
  S.observeSource({ connected: false, load: async () => ({ state: 'unavailable', reason: 'NOT_CONNECTED' }) }, { id: 'products', label: '상품 정보', provider: '' }, reg);
  await a.load();
  assert.deepEqual(reg.list().map((s) => `${s.id}:${s.state}:${s.configured}`), ['lifelong-class:ERROR:UNKNOWN', 'tour-place:NOT_REQUESTED:UNKNOWN', 'products:NOT_REQUESTED:NO'], 'one failing source says nothing about the others');
  await b.load();
  assert.deepEqual(reg.list().map((s) => s.state), ['ERROR', 'SUCCESS', 'NOT_REQUESTED']);
  assert.equal(reg.clear(), true);
  assert.deepEqual(reg.list().map((s) => `${s.id}:${s.state}:${s.requests}:${s.lastCount}`), ['lifelong-class:NOT_REQUESTED:0:null', 'tour-place:NOT_REQUESTED:0:null', 'products:NOT_REQUESTED:0:null']);
  assert.equal(/storage|localStorage|sessionStorage|indexedDB/.test(code(SOURCE_SRC)), false, 'never stored: a reload starts from NOT_REQUESTED');
  assert.match(APP, /const sourceStatus = createSourceRegistry\(\);/);
});

test('OG-AN-35 observing changes nothing: same source, same answers; a broken registry cannot fail a load', async () => {
  const answer = { state: 'ready', items: [{ id: 1 }] };
  const base = { id: 'x', connected: true, extra: () => 'kept', load: async (...args) => ({ ...answer, args }) };
  const reg = S.createSourceRegistry();
  const src = S.observeSource(base, META, reg);
  assert.equal(src.extra(), 'kept');
  assert.deepEqual((await src.load('a', 2)).args, ['a', 2], 'arguments pass through');
  const broken = { register: () => 'id', started() { throw new Error('x'); }, finished() { throw new Error('y'); } };
  assert.deepEqual((await S.observeSource(base, META, broken).load()).items, [{ id: 1 }]);
  for (const bad of [{ id: 'Bad Id' }, { id: '' }, { id: '<script>' }, { id: 'a' }, {}]) assert.equal(S.observeSource(base, bad, reg), base, 'an invalid id leaves the source as it was');
  assert.equal(reg.list().length, 1);
  const clean = S.createSourceRegistry();
  clean.register({ id: 'tour-place', label: 'x'.repeat(200), provider: 'p'.repeat(200), purpose: 'y'.repeat(500), features: Array.from({ length: 30 }, (_, i) => `f${i}`) });
  const e = clean.get('tour-place');
  assert.deepEqual([e.label.length, e.provider.length, e.purpose.length, e.features.length], [40, 40, 120, 6], 'descriptions are short text, bounded');
});

/* ═════════ OG-AQ — quality: accessibility, responsive, security, regression ═════════ */

const allJs = () => fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js'));
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

test('OG-AQ-1 headings: one h1 on the screen, cards are h2 / h3, groups inside a card are h4 — no skipped level', () => {
  assert.equal((ADMIN_HTML.match(/<h1/g) || []).length, 1);
  const levels = [...VIEW.matchAll(/createCard\(\{ area: 'admin', slot: '([a-z]+)', title: '[^']+', level: (\d) \}\)/g)].map((m) => `${m[1]}:${m[2]}`);
  assert.deepEqual(levels, ['system:2', 'features:2', 'content:2', 'limits:3', 'sources:2', 'search:3', 'saved:3', 'notifications:3', 'analytics:2', 'privacy:2', 'security:3']);
  assert.equal(/el\('h[1235]'/.test(VIEW), false, 'only h4 is created by the view, under a card heading');
  assert.ok((VIEW.match(/el\('h4'/g) || []).length >= 4);
  assert.match(ADMIN_HTML, /aria-labelledby="og-admin-title"/);
  assert.match(ADMIN_HTML, /<p class="og-label" lang="en">LOCAL OPERATIONS VIEW<\/p>/, 'the English label is marked as English');
});

test('OG-AQ-2 tabs: tablist / tab / tabpanel with aria-selected, roving tabindex and arrow, Home and End keys', () => {
  assert.match(VIEW, /class: 'og-tabs', role: 'tablist', 'aria-label': '운영 보기 영역'/);
  assert.match(VIEW, /role: 'tab', id: `og-admin-tab-\$\{t\.id\}`, 'aria-controls': `og-admin-panel-\$\{t\.id\}`, 'aria-selected': 'false', tabindex: '-1'/);
  assert.match(VIEW, /role: 'tabpanel', id: `og-admin-panel-\$\{t\.id\}`, 'aria-labelledby': tab\.id, tabindex: '-1', hidden: true/);
  assert.match(VIEW, /tabs\[t\.id\]\.setAttribute\('aria-selected', on \? 'true' : 'false'\);\n\s+tabs\[t\.id\]\.tabIndex = on \? 0 : -1;\n\s+panels\[t\.id\]\.hidden = !on;/);
  for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) assert.ok(VIEW.includes(`event.key === '${key}'`), key);
  assert.match(VIEW, /event\.preventDefault\(\);\n\s+window\.location\.hash = adminHash\(ADMIN_SECTIONS\[next\]\);\n\s+tabs\[ADMIN_SECTIONS\[next\]\]\.focus\(\);/, 'the address follows the tab, and focus follows the key');
});

test('OG-AQ-3 every control is a real button with a visible name; nothing is clickable text or an icon alone', () => {
  const buttons = (VIEW.match(/el\('button', \{/g) || []).length;
  assert.equal(buttons, 6, 'refresh, tab, clear, cancel, confirm, reset');
  assert.equal((VIEW.match(/el\('button', \{ type: 'button', class: 'og-(btn og-btn--(ghost|danger)|tab)'/g) || []).length, buttons, 'each is a typed button in an existing style');
  assert.deepEqual([...VIEW.matchAll(/'data-og-admin-(?:action|tab)': (?:'[a-z-]+'|t\.id),(?: disabled: s\.empty,)? text: ('[^']+'|t\.label)/g)].map((m) => m[1]), ["'자료 상태 지우기'", "'취소'", "'지우기'", "'사용 기록 지우기'", 't.label', "'다시 읽기'"], 'each has a visible Korean name');
  assert.equal(/el\('(div|span|p|li)', \{[^}]*onclick/.test(VIEW), false);
  assert.equal(/el\('a'/.test(VIEW), false, 'no link: the view leads nowhere outside itself');
  assert.equal(/tabindex: '0'|tabIndex = [1-9]/.test(VIEW), false, 'no artificial tab order');
});

test('OG-AQ-4 state is words, never colour alone: every state, mode and answer has a Korean label', () => {
  for (const s of S.SOURCE_STATES) assert.match(S.SOURCE_STATE_LABELS[s], /[가-힣]/, s);
  for (const r of S.REASONS) assert.match(S.REASON_LABELS[r], /[가-힣]/, r);
  for (const m of AD.CAPABILITY_MODES) assert.match(AD.CAPABILITY_LABELS[m], /[가-힣]/, m);
  for (const v of Object.values(AD.PRIVACY_ANSWERS)) assert.match(v, /[가-힣]/);
  for (const n of A.EVENT_NAMES) assert.match(A.EVENT_LABELS[n], /[가-힣]/, n);
  const p9css = APP_CSS.slice(APP_CSS.indexOf('/* [P9]'));
  assert.equal(/data-og-admin-state|data-og-admin-mode|\[data-og-state/.test(p9css), false, 'no state is styled by colour');
  assert.equal(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/.test(p9css), false, 'only the existing ONGIL colour tokens');
  assert.match(VIEW, /\['상태', s\.stateLabel, 'state'\]/);
});

test('OG-AQ-5 announcements and focus: actions report in a live region and focus never falls off the page', () => {
  assert.match(js('home-ui.js'), /say: \(message\) => announce\(status, message\)/, 'cards own a polite status line');
  assert.match(VIEW, /cards\.sources\.say\('이번 방문에 본 자료 상태를 지웠어요\. 자료 자체는 그대로예요\.'\); renderData\('\[data-og-admin-action="clear-sources"\]'\);/);
  assert.match(VIEW, /card\.say\(done \? '사용 기록 집계를 지웠어요\.' : '지우지 못했어요\.'\); renderAnalytics\('title'\);/, 'after a reset the button is disabled, so focus goes to the card title');
  assert.match(VIEW, /queueMicrotask\(\(\) => cancel\.focus\(\)\);/, 'the confirmation puts focus on 취소, the safe choice');
  assert.match(VIEW, /confirmReset = false; renderAnalytics\('\[data-og-admin-action="reset-analytics"\]'\);/, 'cancel returns focus to the button that asked');
  assert.match(VIEW, /if \(t && !t\.disabled\) t\.focus\(\);\n\s+else card\.focusTitle\(\);/);
  assert.match(VIEW, /class: 'og-confirm', role: 'group', 'aria-label': '사용 기록 지우기 확인'/);
  assert.match(VIEW, /if \(current !== 'analytics'\) confirmReset = false;/, 'leaving the tab drops a pending confirmation');
});

test('OG-AQ-6 numbers and words only: lists with labels — no table, chart, canvas, image or animation', () => {
  assert.equal(/el\('(table|canvas|svg|img|video|iframe|progress|meter)'/.test(VIEW), false);
  assert.match(VIEW, /el\('ul', \{ class: 'og-life-days og-admin-rows', 'aria-label': label \}/);
  const p9css = APP_CSS.slice(APP_CSS.indexOf('/* [P9]'));
  assert.equal(/animation|transition|@keyframes|transform/.test(p9css), false, 'nothing moves');
  assert.equal(/emoji|[\u{1F300}-\u{1FAFF}]/u.test(VIEW + ADMIN_SRC), false);
});

test('OG-AQ-7 responsive: rows wrap, long text breaks, and a phone stacks label over value', () => {
  const p9css = APP_CSS.slice(APP_CSS.indexOf('/* [P9]'));
  assert.match(p9css, /\.og-admin-rows li \{ flex-wrap: wrap;/);
  assert.match(p9css, /\.og-admin-value \{ flex: 1 1 12rem; min-width: 0; text-align: right; color: var\(--og-ink\); overflow-wrap: anywhere; \}/);
  assert.match(p9css, /@media \(max-width: 480px\) \{\n {2}\.og-admin-value \{ flex-basis: 100%; text-align: left;/);
  assert.match(p9css, /\.og-admin-group \{ min-width: 0;/);
  assert.equal(/[\s;{]width: \d{3,}px|min-width: \d{3,}px|white-space: nowrap|overflow-x: (auto|scroll)/.test(p9css), false, 'nothing forces a wide layout or sideways scrolling');
  assert.equal(/font-size: (0\.[0-8]\d*rem|1[0-5]px)/.test(p9css), false, 'no small type');
  assert.match(SHELL_CSS, /html\[data-og-view="admin"\] main > \[data-og-screen="admin"\] \{ display: block; \}/);
});

test('OG-AQ-8 identity: the existing dark / film shell, cards, tabs and buttons — no new stylesheet, font or theme', () => {
  assert.deepEqual([...HTML.matchAll(/<link rel="stylesheet" href="\/ongil-start\/styles\/([a-z-]+\.css)\?v=[0-9a-z]+"/g)].map((m) => m[1]), ['ongil-tokens.css', 'ongil-shell.css', 'ongil-app.css', 'ongil-home.css', 'ongil-life.css', 'ongil-care.css'], 'the same six ONGIL stylesheets as before');
  for (const cls of ['og-notice', 'og-tabs', 'og-tab', 'og-life-panel', 'og-btn og-btn--ghost', 'og-btn og-btn--danger', 'og-confirm', 'og-home-note', 'og-home-empty', 'og-life-sub']) assert.ok(VIEW.includes(cls), `reuses ${cls}`);
  assert.match(VIEW, /import \{ createCard \} from '\.\/home-ui\.js';/);
  assert.match(ADMIN_HTML, /class="og-page"[\s\S]*class="og-wrap"[\s\S]*class="og-band og-admin" data-og-admin/);
  const p9css = APP_CSS.slice(APP_CSS.indexOf('/* [P9]'));
  assert.equal(/font-family|background(-color)?:|box-shadow|@import|url\(/.test(p9css), false);
  assert.ok(p9css.split('\n').length < 20, 'a dozen layout rules, nothing more');
});

test('OG-AQ-9 no HTML-string rendering anywhere: innerHTML-family count is 0 across every ONGIL module', () => {
  for (const f of allJs()) assert.equal(/\.innerHTML|\.outerHTML|insertAdjacentHTML|document\.write|DOMParser|createContextualFragment|\beval\(|new Function\(/.test(code(js(f))), false, f);
  assert.match(VIEW, /import \{ el, clear, formatDate \} from '\.\/dom\.js';/);
  assert.equal(/createElement|\.textContent = (?!'')/.test(code(VIEW)), false, 'the view builds everything through el() — text only');
});

test('OG-AQ-10 secret detection: no key, token, private key or credential-shaped string in ONGIL or its docs', () => {
  const files = [...walk(path.join(ROOT, 'ongil-start')), ...walk(path.join(ROOT, 'docs/ongil'))].filter((f) => /\.(js|mjs|html|css|md|json|txt)$/.test(f));
  assert.ok(files.length > 70);
  /* a 40-character hexadecimal string is a git commit id (the audit documents quote the base commit); any other long one is refused */
  const SHAPES = [/sk-[A-Za-z0-9_-]{20,}/, /AIza[0-9A-Za-z_-]{30,}/, /KakaoAK\s+[0-9a-f]{20,}/i, /Bearer\s+[A-Za-z0-9._-]{24,}/, /gh[pousr]_[A-Za-z0-9]{30,}/, /xox[baprs]-[A-Za-z0-9-]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /serviceKey=[A-Za-z0-9%+/=]{16,}/i, /(api[_-]?key|secret|token|password)["']?\s*[:=]\s*["'][A-Za-z0-9+/=_-]{16,}["']/i, /\b(?![0-9a-f]{40}\b)[0-9a-f]{32,}\b/, /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}\./];
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    for (const shape of SHAPES) assert.equal(shape.test(text), false, `${path.relative(ROOT, f)} matches ${shape}`);
  }
});

test('OG-AQ-11 the operations view cannot show a secret: it has no access to keys, headers or server configuration', () => {
  for (const f of P9) {
    const src = code(js(f));
    assert.equal(/api[_-]?key|apikey|secret|token|authorization|bearer|password|credential|serviceKey|process\.env|import\.meta|\.env\b|headers/i.test(src), false, f);
  }
  const reg = S.createSourceRegistry();
  S.observeSource(fakeSource([{ state: 'ready', items: [] }]), { ...META, apiKey: 'SHOULD-NOT-BE-KEPT', token: 'SHOULD-NOT-BE-KEPT', headers: { authorization: 'SHOULD-NOT-BE-KEPT' } }, reg);
  assert.equal(JSON.stringify(reg.list()).includes('SHOULD-NOT'), false, 'registering a source keeps names only');
  assert.deepEqual([...S.CONFIGURED], ['YES', 'NO', 'UNKNOWN'], 'configuration is a state, never a value');
  assert.match(VIEW, /요청 내용, 응답 내용, 지역, 검색어, 키는 기록하지 않아요\. 상태와 개수만 남겨요\./);
});

test('OG-AQ-12 no new network surface: Phase 9 adds no request, endpoint, backend, Firebase, AI or external API', () => {
  for (const f of P9) assert.equal(/fetch\(|XMLHttpRequest|firebase|firestore|openai|anthropic|supabase|\/api\/|https?:\/\//i.test(code(js(f))), false, f);
  const hosts = new Set(allJs().flatMap((f) => [...code(js(f)).matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1])));
  for (const h of hosts) assert.equal(/analytics|telemetry|track|metrics|collect|stats/i.test(h), false, h);
  /* Family Connection V2 added the one ONGIL backend: server/ongil/family (BEFORE: no server/ongil · AFTER: family/ only). Phase 9 modules above still make no request. */
  assert.deepEqual(fs.readdirSync(path.join(ROOT, 'server/ongil')), ['family'], 'the only ONGIL backend is the V2 family route');
  assert.equal(/<script[^>]+src="https?:/.test(HTML), false, 'no third-party script');
});

test('OG-AQ-13 no dependency: every import is a relative ONGIL module; LIVON and shared code are not touched or used', () => {
  for (const f of allJs()) for (const m of js(f).matchAll(/from '([^']+)'/g)) assert.match(m[1], /^\.\/[a-z-]+\.js$/, `${f} imports ${m[1]}`);
  for (const f of P9) assert.equal(/livon|\.\.\/|newon-app|shared\//i.test(code(js(f))), false, f);
  // Phase 10: + assistant-intents.js, assistant-tools.js, assistant-view.js. BEFORE: 65. AFTER: 68.
  /* Family Connection V1: + family-domain, family-permissions, family-repository, family-service, family-connect-view (BEFORE 71, AFTER 76) */
  /* Family Connection V2: + family-remote, family-remote-view (BEFORE 76, AFTER 78) */
  /* Health · Safety V2: + health-changes, health-safety-view (BEFORE 78, AFTER 80) · My Life V2: + memos, life-today (BEFORE 80, AFTER 82) */ assert.equal(allJs().length, 82, 'sixty modules + the five of Phase 9 + the three of Phase 10 + health-measures (Completion V1) + health-appointments (Completion V2) + emergency-contacts (Completion V3)');
  for (const f of P9) assert.ok(fs.existsSync(path.join(JS_DIR, f)), f);
});

test('OG-AQ-14 storage: exactly one new collection ("analytics"), classified, and nothing personal moved', () => {
  /* Family Connection V1: + family (BEFORE 26, AFTER 27) */ /* My Life V2: + memos (BEFORE 27, AFTER 28) */ assert.equal(COLLECTIONS.length, 28); // Completion V3: + emergencyContacts
  assert.equal(COLLECTIONS[COLLECTIONS.length - 1], 'analytics');
  assert.deepEqual(Object.keys(CLASSIFICATION).sort(), [...COLLECTIONS].sort());
  assert.deepEqual(COLLECTIONS.filter((c) => CLASSIFICATION[c] === 'OPERATIONAL'), ['analytics']);
  for (const c of ['checkins', 'symptoms', 'medications', 'medicationLogs', 'healthNotes']) assert.equal(CLASSIFICATION[c], 'HEALTH_ADJACENT', c);
  const sources = code(ANALYTICS_SRC);
  assert.deepEqual([...new Set([...sources.matchAll(/storage\.(?:get|set|remove)\('([a-zA-Z]+)'/g)].map((m) => m[1]))], ['analytics'], 'analytics reads and writes its own collection only');
});

test('OG-AQ-15 wiring: the screen exists before paint, has a title, and is rendered only when it is opened', () => {
  assert.match(HTML, /"admin": "admin"/, 'the pre-paint route map knows #admin, so the first frame is the right screen');
  assert.match(APP, /doc\.title = view === 'admin' \? '운영 보기 \| Ongil' : viewTitle\(areaById\(view\)\);/);
  assert.equal((APP.match(/if \(view === 'admin'\) adminView\.show\(section\);/g) || []).length, 2, 'on entering the screen and on changing its section');
  assert.match(VIEW, /RENDER\[current\]\(\);/, 'only the visible section is computed');
  assert.equal(/setInterval|setTimeout|MutationObserver|IntersectionObserver|requestAnimationFrame|addEventListener\('storage'/.test(code(VIEW)), false, 'no timer, observer or background refresh');
  assert.match(APP, /loaded: \(\) => \(\{ care: care\.items\(\)\.length, enjoy: enjoyView\.items\(\)\.length, store: storeView\.items\(\)\.length \}\)/, 'counts are asked for at render time');
});

test('OG-AQ-16 version and cache: the app states its version and the changed files have a new address', () => {
  // Phase 10 moved the version on. BEFORE: admin-v1 / ?v=20261003a9. AFTER: assistant-v1 / ?v=20261003b10.
  // Phase 11 moved it on again. BEFORE: assistant-v1 / ?v=20261003b10. AFTER: hardening-v1 / ?v=20261003r11.
  assert.match(APP, /const APP_VERSION = 'hardening-v1';/);
  assert.match(APP, /win\.Ongil = Object\.freeze\(\{ version: APP_VERSION, assistant, assistantView, analytics, sources: sourceStatus,/);
  assert.match(HTML, /ongil-shell\.css\?v=20261003r11/);
  assert.match(HTML, /ongil-app\.css\?v=20261003r11/);
  // Completion V2 moved app.js and ongil-life.css on (BEFORE ?v=20261003r11, AFTER ?v=20261004v12); Completion V3 changed the same two files again (AFTER ?v=20261004v13).
  assert.match(HTML, /js\/app\.js\?v=20261006m15/); // Health · Safety V2 changed app.js again (AFTER ?v=20261005h14) /* My Life V2: app.js changed → entry moved on (BEFORE 20261005h14, AFTER 20261006m15) */
  assert.match(HTML, /ongil-life\.css\?v=20261004v13/);
});

test('OG-AQ-17 performance: one small write per event and a tiny summary — no list of events to scan', () => {
  const w = world();
  let writes = 0;
  w.storage.subscribe ? w.storage.subscribe(() => { writes += 1; }) : null;
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < 2000; i++) w.analytics.track('screen_view', { view: 'home', hasSection: 'no' }, 'home');
  const perEvent = Number(process.hrtime.bigint() - t0) / 2000 / 1e6;
  assert.ok(perEvent < 1, `track() took ${perEvent.toFixed(3)} ms`);
  assert.ok(rawAnalytics(w).length < 200, 'two thousand events are three numbers');
  assert.equal(w.analytics.summary().total, 2000);
  assert.equal(writes === 0 || writes === 2000, true);
  assert.ok(fs.statSync(path.join(JS_DIR, 'analytics.js')).size < 12_000);
  assert.ok(P9.reduce((n, f) => n + fs.statSync(path.join(JS_DIR, f)).size, 0) < 60_000, 'five modules, under 60 KB unminified');
});

test('OG-AQ-18 regression — routes and navigation: the ten product screens and their menus are unchanged', () => {
  assert.deepEqual([...VIEWS], ['home', 'life', 'health', 'family', 'care', 'enjoy', 'community', 'store', 'saved', 'account']);
  assert.deepEqual(PRIMARY_AREAS.map((a) => a.id), ['home', 'life', 'health', 'family', 'care', 'enjoy', 'community', 'store']);
  for (const v of VIEWS) assert.equal(resolveView(hashFor(v)), v);
  assert.deepEqual([...R.SECTIONED_VIEWS], ['life', 'care', 'enjoy', 'community', 'store', 'admin']);
  for (const h of ['#life/calendar', '#care/facility', '#store/safety', '#community/groups']) assert.equal(R.canonicalHash(h), h, h);
  assert.equal(R.safeRoute('#admin/data'), '#admin/data');
  for (const t of R.CONTENT_TYPE_IDS) assert.notEqual(R.CONTENT_TYPES[t].owner, 'admin', 'no content opens in the operations view');
});

test('OG-AQ-19 regression — privacy boundaries from earlier phases still hold with analytics present', async () => {
  const w = world();
  const saved = w.instrument.saved(createSavedStore(w.storage));
  createCheckInStore(w.storage).set('hard');
  createPostStore(w.storage).add({ type: 'QUESTION', category: 'LOCAL', title: '비밀글제목XYZ', body: '비밀글본문XYZ' });
  w.analytics.track('app_open');
  const search = fullSearch(saved);
  for (const q of ['hard', '비밀글제목XYZ', 'XYZ', 'app_open', 'analytics']) assert.deepEqual((await search.query(q)).results, [], q);
  assert.equal(search.providers().every((p) => p.scope === 'PUBLIC'), true);
  assert.equal(R.CONTENT_TYPES.POST.syncPolicy, 'LOCAL_ONLY');
  assert.equal(saved.save({ type: 'CHECK_IN', id: 'c1', title: '안부' }).reason, 'INVALID_TYPE');
  assert.deepEqual(COLLECTIONS.filter(isSyncable).sort(), ['onboarding', 'preferences', 'profile', 'saved']);
});

test('OG-AQ-20 documentation and suite: the Phase 9 document has every required section; no earlier test file is gone', () => {
  const doc = read('docs/ongil/PHASE_9_ADMIN_ANALYTICS_V1.md');
  for (const h of ['OBJECTIVE', 'AUDIT', 'ADMIN POSITIONING', 'ADMIN ROUTES', 'SYSTEM STATUS', 'FEATURE STATUS', 'DATA SOURCES', 'CONTENT STATUS', 'ANALYTICS ARCHITECTURE', 'EVENT CONTRACT', 'EVENT ALLOWLIST', 'PRIVACY', 'RETENTION', 'INSTRUMENTATION', 'DATA MANAGER', 'SEARCH OPERATIONS', 'SAVED OPERATIONS', 'NOTIFICATION OPERATIONS', 'PRIVACY MATRIX', 'SECURITY LIMITATIONS', 'ADMIN ACTIONS', 'ACCESSIBILITY', 'RESPONSIVE', 'PERFORMANCE', 'TESTS', 'KNOWN LIMITATIONS', 'PRODUCTION MIGRATION', 'PHASE 10 HANDOFF']) assert.match(doc, new RegExp(`^## (\\d+\\. )?${h}$`, 'm'), h);
  // Phase 10: the ai_* events are documented in PHASE_10_ONGIL_AI_V1.md (checked by OG-AI-78)
  for (const name of A.EVENT_NAMES.filter((n) => !n.startsWith('ai_'))) assert.ok(doc.includes(`\`${name}\``), `${name} is documented`);
  assert.equal(/LIVE VERIFIED(?!")|screen reader: VERIFIED/.test(doc.replace(/never[^\n]*LIVE VERIFIED|no[^\n]*LIVE VERIFIED|not[^\n]*LIVE VERIFIED/gi, '')), false);
  const tests = fs.readdirSync(path.join(ROOT, 'tests/ongil')).filter((f) => f.endsWith('.test.mjs')).sort();
  assert.deepEqual(tests, ['admin-analytics', 'assistant', 'care-data', 'community-data', /* Community V2: + community-v2 (new test file) */ 'community-v2', 'cross-product', 'emergency-contacts', 'enjoy-data', /* Family Connection V1: + family-connection (new test file; BEFORE absent, AFTER listed) */ 'family-connection', 'family-data', /* Family Connection V2: + family-v2 (new test file) */ 'family-v2', 'foundation-data', 'foundation-flows', 'health-calendar', 'health-data', 'health-measures', /* Health · Safety V2: + health-safety-v2 (new test file) */ 'health-safety-v2', 'health-view', 'home-data', 'home-view', 'integration-data', 'integration-view', 'life-data', 'life-privacy', 'life-view', /* My Life V2: + my-life-v2 (new test file) */ 'my-life-v2', 'product-completion', 'production-api', 'production-release', 'release-hardening', 'shell', 'store-data'].map((n) => `${n}.test.mjs`)); // Phase 11: + release-hardening · Phase 12: + production-release · API connection: + production-api · Completion V1: + health-measures · Completion V2: + health-calendar · Completion V3: + emergency-contacts · Product Completion Audit V1: + product-completion
});
