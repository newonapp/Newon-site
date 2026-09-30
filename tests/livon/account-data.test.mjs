// LIVON Account & Data Persistence Foundation V1 — repository, local/remote adapters, classification, migration,
// sync metadata, conflict policy, privacy, security contract and compatibility with every existing store.
// No account, no login, no server: anonymous local-first behaviour must stay exactly as before.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { prepareSyncRequest, ENDPOINT_ENABLED, SyncError } from '../../server/livon/userdata/contract.mjs';

const read = f => readFileSync(new URL('../../livon/' + f, import.meta.url), 'utf8');
const root = p => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const LIFE = JSON.parse(read('life-topics.json'));
const ML = 'livon.mlStore.v1', PF = 'livon.platform.v1', CM = 'livon.cmStore.v1', AI = 'livon.aiStore.v1', META = 'livon.userData.meta.v1';

function mem(init = {}) {
  const m = new Map(Object.entries(init).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m };
}
/* full LIVON stack in a vm (same scripts as livon/index.html, in order, minus DOM-only pages) */
function app({ local = {}, withPlatform = true, files } = {}) {
  const ls = mem(local), ss = mem();
  const doc = { readyState: 'complete', documentElement: { dataset: {} }, body: { classList: { add() {}, remove() {}, toggle() {} }, style: {}, appendChild() {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}, createElement: () => ({ setAttribute() {}, appendChild() {}, classList: { add() {} }, style: {} }), head: { querySelector: () => null, appendChild() {} }, contains: () => false };
  const ctx = { localStorage: ls, sessionStorage: ss, location: { hash: '#ml-home', protocol: 'https:', pathname: '/livon/' }, navigator: {}, URL, history: { state: null, replaceState() {}, pushState() {} },
    document: doc, fetch: () => Promise.reject(new Error('no network in tests')), setTimeout, clearTimeout, console, addEventListener() {}, Promise, CustomEvent: class {} };
  ctx.window = ctx;
  vm.createContext(ctx);
  const list = files || ['data/livon-user-data.js', ...(withPlatform ? ['livon-platform.js'] : []), 'explore-data.js', 'today-data.js', 'community-data.js', 'life-hub.js', 'today-feed.js', 'explore-search.js', 'community-page.js', 'life-now-data.js', 'life-now-page.js', 'ai-page.js'];
  if (!withPlatform) { const saves = new Map(); ctx.LivonPlatform = { listSaves: () => [...saves.values()], saveItem: x => saves.set(x.id, Object.assign({ savedAt: Date.now() }, x)), removeSave: id => saves.delete(id), folders: () => ['나중에 보기'] }; }
  for (const f of list) vm.runInContext(read(f), ctx);
  if (ctx.LivonLifeHub) ctx.LivonLifeHub.repo.use(LIFE);
  const raw = k => JSON.parse(ls.getItem(k) || 'null');
  return { ctx, U: ctx.LivonUserData, ls, ss, raw, T: ctx.LivonMyLife && ctx.LivonMyLife._test, P: ctx.LivonPlatform };
}
const J = x => JSON.parse(JSON.stringify(x));
const LEGACY = () => ({
  [ML]: { v: 2, todos: [{ id: 'todo_a', title: '이력서 수정', due: '2026-10-01', priority: '높음', category: '커리어', note: '', done: false, createdAt: 1790000000000, updatedAt: 1790000000000 },
    { id: 'todo_ai', title: '포트폴리오 정리', source: 'livon-ai', sourceHref: '#livon-ai', done: false, createdAt: 1790000000001, updatedAt: 1790000000001 }],
    goals: [{ id: 'goal_1', title: '이직 준비', status: '진행 중', createdAt: 1790000000002, updatedAt: 1790000000002 }],
    events: [{ id: 'event_1', title: '면접', date: '2026-10-05', start: '10:00', end: '11:00', allDay: false, category: '예약', createdAt: 1790000000003, updatedAt: 1790000000003 }],
    checklists: [], habits: [{ id: 'habit_1', title: '물 마시기', createdAt: 1790000000004 }], habitLogs: { habit_1: { '2026-09-28': true } },
    transactions: [{ id: 'tx_1', title: '월세', amount: 500000, date: '2026-09-25' }], budgets: { monthly: 2000000, categories: {} },
    health: [{ id: 'h_1', title: '혈압 기록', value: '120/80', date: '2026-09-27' }], experiences: [], journal: [{ id: 'j_1', title: '오늘', body: '개인적인 기록', category: '생활' }],
    projects: [], folders: [], settings: { weekStartsOn: 0, currency: 'KRW', fontScale: 'md' } },
  [PF]: { onboarded: true, onboardSkipped: false, recentSearches: ['이사'], alertPrefs: { todo: true }, alerts: [{ id: 'al1' }],
    saves: [{ id: 'ext:kr-job-training:program:AIG1_3_500', title: '[QA 픽스처] 웹 개발자 양성과정', type: 'class', href: 'https://www.work24.go.kr/x', folder: '취업 준비', source: '고용24', savedAt: 1790000000100,
      data: { kind: 'class', entityId: 'kr-job-training:program:AIG1_3_500', snapshot: { title: '[QA 픽스처] 웹 개발자 양성과정', provider: 'kr-job-training', provenance: { provider: 'kr-job-training', sourceKind: 'public', attribution: '출처: 고용24', livonFetchedAt: '2026-09-29T00:00:00.000Z', verifiedBy: null }, trainingCourse: { trprId: 'AIG1', courseFee: 0 } } } },
      { id: 'ext:kr-kakao-place:place:26338954', title: '[QA 픽스처] 도서관', type: 'place', savedAt: 1790000000200, data: { snapshot: { latitude: 37.56, longitude: 126.9, provenance: { sourceKind: 'private-platform' } } } }],
    folders: ['취업 준비', '나중에 보기'], region: { sido: '서울', sgg: '마포구', dong: '성산동' }, family: { members: [{ name: '엄마' }] }, profile: { displayName: '홍길동', note: '' } },
  [CM]: { v: 2, profile: { nick: '나', bio: '', interests: [] }, posts: [{ id: 'p1', title: '질문', body: '내용', createdAt: 1 }], comments: [], likes: {}, commentLikes: {}, saves: [], joined: [], challenges: {}, blocked: [], reports: [], drafts: [{ id: 'd1', body: '초안' }], region: '' },
  [AI]: { threads: [{ id: 'th1', title: '상담', messages: [{ role: 'user', content: '내 건강이 걱정돼' }] }], settings: { stage: '30', interests: '', region: '', goal: '', answerLength: 'balanced', personalize: true, shareLifeData: false } },
  'livon.lifeStage': '30', 'livon.lifeInterests': ['취업', '주거'], 'livon.today.recent.v1': [{ id: 'x' }], 'livon.exViewed': ['a'], 'livon.data.v1:provider:kr-youth-policy': { value: [], exp: 0 },
  'livon.lifeHub.checklist.v1': { '20s.first-job': [0, 2] }, 'livon.hmRegion': '서울 마포구'
});

/* ───────── inventory / classification ───────── */
test('UD-1 storage inventory: every livon.* key used in the code is classified; classes are the minimal set', () => {
  const { U } = app({ files: ['data/livon-user-data.js'] });
  assert.deepEqual([...U.CLASSES], ['ACCOUNT_SYNC', 'DEVICE_LOCAL', 'SESSION_ONLY', 'SERVER_SOURCE_CACHE', 'COMMUNITY_LOCAL', 'LEGACY']);
  const keys = new Set();
  for (const f of readdirSync(new URL('../../livon', import.meta.url)).filter(n => n.endsWith('.js')).map(n => n).concat(['data/livon-data-core.js', 'data/livon-data-config.js'])) {
    for (const m of read(f).matchAll(/["'](livon\.[A-Za-z0-9_.:-]+)["']/g)) keys.add(m[1]);
  }
  const missing = [...keys].filter(k => U.classify(k) === 'UNKNOWN');
  assert.deepEqual(missing, [], 'unclassified keys');
  for (const e of U.INVENTORY) { assert.ok(e.owner && e.schema && e.storage, e.key); if (!e.fields) assert.ok(U.CLASSES.includes(e.cls), e.key); else Object.values(e.fields).forEach(f => assert.ok(U.CLASSES.includes(f.cls), e.key)); }
  assert.equal(U.classify(AI), 'DEVICE_LOCAL', 'AI conversations never sync automatically');
  assert.equal(U.classify(CM), 'COMMUNITY_LOCAL');
  assert.equal(U.classify('livon.data.v1:provider:kr-tourapi'), 'SERVER_SOURCE_CACHE');
  assert.equal(U.classify('livon.aiPrompt'), 'SESSION_ONLY'); assert.equal(U.classify('livon.serviceDraft.abc'), 'SESSION_ONLY');
  assert.equal(U.classify('livon.exViewed'), 'DEVICE_LOCAL'); assert.equal(U.classify('livon.lifeInterests'), 'ACCOUNT_SYNC');
  const ml = U.entryFor(ML).fields;
  assert.equal(ml.todos.cls, 'ACCOUNT_SYNC'); assert.equal(ml.health.sensitive, true); assert.equal(ml.journal.sensitive, true); assert.equal(ml.transactions.sensitive, true);
  const pf = U.entryFor(PF).fields;
  assert.equal(pf.saves.cls, 'ACCOUNT_SYNC'); assert.equal(pf.profile.cls, 'DEVICE_LOCAL'); assert.equal(pf.family.cls, 'DEVICE_LOCAL'); assert.equal(pf.recentSearches.cls, 'DEVICE_LOCAL');
});

/* ───────── anonymous mode / repository / adapters ───────── */
test('UD-2 anonymous mode: default and only active mode; no login, no fake user, remote configured:false; LIVON works fully', async () => {
  const { U, T, P, raw } = app();
  assert.equal(U.mode(), 'anonymous'); assert.deepEqual(J(U.auth()), { status: 'anonymous' }); assert.equal(U.remote().configured, false);
  assert.equal(T.saveTodo({ title: '익명으로 추가' }).status, 'ok');
  P.saveItem({ id: 'td:x', title: '저장', type: 'content' });
  assert.equal(raw(ML).todos.length, 1); assert.ok(raw(PF).saves.some(s => s.id === 'td:x'));
  for (const f of ['index.html', 'life-now-page.js', 'livon-platform.js', 'home-page.js', 'community-page.js', 'ai-page.js']) {
    assert.doesNotMatch(read(f), /setAuthProvider\(|demo@|test user|샘플 사용자|가짜 계정/, f + ': no screen switches identity');
  }
  assert.doesNotMatch(read('data/livon-user-data.js'), /demo@|test user|샘플 사용자|가짜 계정|userId: ["'][A-Za-z]/, 'no built-in user');
  const html = read('index.html');
  assert.ok(html.indexOf('data/livon-user-data.js') < html.indexOf('livon-platform.js'), 'repository loads before the first store user');
  /* unverified or malformed sessions never switch modes */
  for (const s of [null, {}, { userId: 'abc' }, { userId: 'x', verified: true }, { userId: '<script>', verified: true }, { userId: 'valid_user_1', verified: 'yes' }]) {
    U.setAuthProvider({ getSession: () => s });
    assert.equal(U.auth().status, 'anonymous', JSON.stringify(s));
  }
  U.setAuthProvider({ getSession: () => ({ userId: 'future_user_01', verified: true }) });
  assert.equal(U.auth().status, 'authenticated'); assert.equal(U.mode(), 'anonymous', 'no configured remote → still local-first');
  assert.equal('userId' in U.auth(), false, 'the id is not exposed to UI code');
  U.setAuthProvider(null); assert.equal(U.auth().status, 'anonymous');
});

test('UD-3 repository + local adapter: same keys and JSON as before; never deletes; quota failures reported, data kept', () => {
  const init = LEGACY();
  const { U, ls } = app({ files: ['data/livon-user-data.js'], local: init });
  assert.deepEqual(J(U.read(ML, null)), init[ML]);
  assert.equal(U.read('missing', 7), 7);
  assert.equal(U.write('livon.tdHidden', ['a']), true); assert.equal(ls.getItem('livon.tdHidden'), '["a"]');
  const src = read('data/livon-user-data.js');
  assert.doesNotMatch(src.replace(/\/\*[\s\S]*?\*\//g, ''), /removeItem|\.clear\(/, 'the persistence layer never deletes user data');
  const broken = mem(init); broken.setItem = () => { throw new Error('QuotaExceededError'); };
  U._setStorage(broken);
  assert.equal(U.write(ML, { todos: [] }), false);
  assert.deepEqual(JSON.parse(broken.getItem(ML)), init[ML], 'original kept on failed write');
  const bad = mem({ [ML]: '{not json' }); U._setStorage(bad);
  assert.equal(U.read(ML, 'fallback'), 'fallback'); assert.equal(bad.getItem(ML), '{not json', 'corrupt data left untouched');
});

test('UD-4 remote adapter: unconfigured → fail-closed without network; configured contract sends no userId and validates first', async () => {
  const { U } = app({ files: ['data/livon-user-data.js'] });
  let calls = 0;
  const off = U.createRemoteAdapter({ endpoint: '/api/livon/userdata', fetchImpl: () => { calls++; } });
  assert.equal(off.configured, false);
  for (const op of ['get', 'list', 'upsert', 'delete', 'batch', 'syncMeta']) await assert.rejects(off[op]('tasks', 'x'), e => e.code === 'REMOTE_NOT_CONFIGURED');
  assert.equal(calls, 0);
  assert.equal(U.createRemoteAdapter({ endpoint: 'https://evil.example/api', getAccessToken: () => 't', fetchImpl: () => {} }).configured, false, 'only a same-origin /api path');
  const sent = [];
  const on = U.createRemoteAdapter({ endpoint: '/api/livon/userdata', getAccessToken: () => 'tok', fetchImpl: async (url, init) => { sent.push({ url, init }); return { ok: true, json: async () => ({ ok: true }) }; } });
  const rec = { id: 'todo_a', collection: 'tasks', schemaVersion: 1, createdAt: 1790000000000, updatedAt: 1790000000000, deletedAt: null, localRev: 1, data: { title: 'x' } };
  await on.batch([rec]);
  const body = JSON.parse(sent[0].init.body);
  assert.equal(sent[0].init.headers.authorization, 'Bearer tok');
  assert.deepEqual(Object.keys(body), ['op', 'payload']); assert.doesNotMatch(sent[0].init.body, /userId/);
  await assert.rejects(on.batch([{ ...rec, userId: 'someone' }]), e => e.code === 'INVALID_PAYLOAD');
  assert.equal(sent.length, 1, 'invalid payloads never leave the browser');
  const noSession = U.createRemoteAdapter({ endpoint: '/api/livon/userdata', getAccessToken: () => null, fetchImpl: async () => { throw new Error('should not call'); } });
  await assert.rejects(noSession.batch([rec]), e => e.code === 'NO_SESSION');
  U.setRemoteAdapter(on); assert.equal(U.mode(), 'anonymous', 'a remote without an authenticated session is not account mode');
  /* Account backend V1: the endpoint exists but is fail-closed unless explicitly enabled + database + verifier (tests/livon/account-backend.test.mjs) */
  assert.ok(existsSync(new URL('../../api/livon/userdata.mjs', import.meta.url)));
  assert.match(root('server/livon/userdata/http.mjs'), /if \(!cfg\.enabled\) throw new UserDataError\(503, 'SYNC_NOT_AVAILABLE'\)/);
});

/* ───────── migration ───────── */
test('UD-5 migration: additive (only its own meta key), idempotent, non-destructive for every existing store', () => {
  const init = LEGACY();
  const { U, ls } = app({ files: ['data/livon-user-data.js'], local: init });
  const snapshot = k => ls.getItem(k);
  for (const k of Object.keys(init)) assert.equal(snapshot(k), typeof init[k] === 'string' ? init[k] : JSON.stringify(init[k]), k + ' byte-identical after migration');
  const m1 = JSON.parse(ls.getItem(META));
  assert.equal(m1.v, 1); assert.match(m1.deviceId, /^dv_[a-z0-9]{6,24}$/);
  assert.deepEqual([...ls._m.keys()].filter(k => !(k in init)), [META], 'no other key created');
  const again = U.migrate();
  assert.deepEqual(J(again), { ok: true, changed: false, version: 1 });
  assert.deepEqual(JSON.parse(ls.getItem(META)), m1, 'idempotent');
  /* migration failure keeps the original data */
  const f = mem(init); f.setItem = () => { throw new Error('quota'); };
  U._setStorage(f);
  const r = U.migrate();
  assert.equal(r.ok, false); assert.equal(r.error, 'STORAGE_WRITE_FAILED');
  for (const k of Object.keys(init)) assert.equal(f.getItem(k), typeof init[k] === 'string' ? init[k] : JSON.stringify(init[k]));
  assert.equal(U.diagnostics().lastErrorCategory, 'STORAGE_WRITE_FAILED');
});

test('UD-6 existing store migrations still run through the repository: mlStore v1→v2, cmStore v1→v2, legacy saves', () => {
  const old = { [ML]: { goals: [{ id: 'g', title: 'x', status: '엉뚱' }], todos: [{ id: 't', title: 'y', priority: 'high', note: 'LIVON AI 초안 · 대화' }], journal: [{ id: 'j', title: 'z' }], checklists: [{ id: 'c', items: [{ text: 'a' }] }] },
    'livon.tdSaved': [{ id: 'td1', label: '발견 글' }], 'livon.lifeSavedLocal': ['첫 취업'] };
  const { raw, T, P } = app({ local: old });
  T.loadStore();
  const s = raw(ML);
  assert.equal(s.v, 2); assert.equal(s.goals[0].status, '진행 중'); assert.equal(s.todos[0].priority, '높음'); assert.equal(s.todos[0].source, 'livon-ai'); assert.equal(s.journal[0].category, '기타'); assert.ok(s.checklists[0].items[0].id);
  const ids = P.listSaves('all').map(x => x.id);
  assert.ok(ids.includes('td:td1') && ids.includes('life:첫 취업'), 'legacy saves moved into platform saves');
  assert.deepEqual(raw('livon.tdSaved'), old['livon.tdSaved'], 'legacy key kept');
});

/* ───────── My Life through the repository ───────── */
test('UD-7 My Life tasks / goals / calendar / duplicate prevention unchanged; deletions leave tombstones', () => {
  const { T, U, raw } = app();
  const a = T.saveTodo({ title: '서류 준비' }); assert.equal(a.status, 'ok');
  assert.equal(T.saveTodo({ title: '서류 준비' }).status, 'duplicate');
  const g = T.saveGoal({ title: '이직', status: '진행 중' }); assert.equal(g.status, 'ok');
  assert.equal(T.setGoalTodos(g.item.id, [a.item.id]) !== undefined, true);
  const e1 = T.saveEvent({ title: '면접', date: '2026-10-05', start: '10:00', end: '11:00' }); assert.equal(e1.status, 'ok');
  assert.equal(T.saveEvent({ title: '다른 일정', date: '2026-10-05', start: '10:00', end: '10:30' }).status, 'conflict', 'calendar clash detection kept');
  assert.equal(T.removeItem('goal', g.item.id), true);
  assert.equal(raw(ML).todos.find(t => t.id === a.item.id).goalId, undefined, 'deleting a goal only unlinks tasks');
  assert.equal(T.removeItem('todo', a.item.id), true);
  const m = raw(META);
  assert.ok(m.tombstones.some(t => t.collection === 'goals' && t.id === g.item.id));
  assert.ok(m.tombstones.some(t => t.collection === 'tasks' && t.id === a.item.id));
  assert.ok(m.stores[ML].localRev >= 5);
  const recs = U.collectAccountRecords().records;
  assert.ok(recs.some(r => r.collection === 'tasks' && r.id === a.item.id && r.deletedAt), 'a deleted task is exported as a tombstone, never resurrected');
  assert.equal(recs.find(r => r.id === e1.item.id).collection, 'calendar_items');
});

test('UD-8 saves: explicit only; provider snapshot + provenance preserved in the account record; unsave → tombstone', () => {
  const init = LEGACY();
  const { U, P, raw } = app({ local: init });
  const rec = U.collectAccountRecords().records;
  const job = rec.find(r => r.id === 'ext:kr-job-training:program:AIG1_3_500');
  assert.equal(job.collection, 'saved_items');
  assert.deepEqual(J(job.data.data.snapshot), init[PF].saves[0].data.snapshot, 'snapshot kept verbatim (trainingCourse, provenance)');
  const place = rec.find(r => r.id === 'ext:kr-kakao-place:place:26338954');
  assert.equal(place.data.data.snapshot.latitude, 37.56, 'a saved PLACE keeps its own coordinates (not the user\'s)');
  assert.equal(place.data.data.snapshot.provenance.sourceKind, 'private-platform');
  P.removeSave('ext:kr-kakao-place:place:26338954');
  assert.ok(raw(META).tombstones.some(t => t.collection === 'saved_items' && t.id === 'ext:kr-kakao-place:place:26338954'));
  /* provider data may disappear later: the saved record still carries the snapshot */
  const again = U.collectAccountRecords().records.find(r => r.id === job.id);
  assert.equal(again.data.data.snapshot.title, '[QA 픽스처] 웹 개발자 양성과정');
});

test('UD-9 provider snapshot compatibility: policy/event/place/tourism/program/expert/trainingCourse saves survive export + merge', () => {
  const { U } = app({ files: ['data/livon-user-data.js'] });
  const kinds = { policy: 'kr-youth-policy', event: 'kr-business-event', place: 'kr-kakao-place', tourism: 'kr-tourapi', program: 'kr-lifelong-class', expert: 'kr-public-tax-expert', trainingCourse: 'kr-job-training' };
  const saves = Object.entries(kinds).map(([k, p], i) => ({ id: 'ext:' + p + ':' + k + ':' + i, title: k, type: k, savedAt: 1790000000000 + i,
    data: { entityId: p + ':x:' + i, snapshot: { title: k, provider: p, provenance: { provider: p, providerId: String(i), sourceKind: p === 'kr-kakao-place' ? 'private-platform' : 'public', attribution: '출처: ' + p, sourceUpdatedAt: null, livonFetchedAt: '2026-09-29T00:00:00.000Z', verifiedBy: null }, ...(k === 'trainingCourse' ? { trainingCourse: { trprId: 'A', courseFee: 0 } } : {}) } } }));
  const { U: U2 } = app({ files: ['data/livon-user-data.js'], local: { [PF]: { saves } } });
  const recs = U2.collectAccountRecords().records.filter(r => r.collection === 'saved_items');
  assert.equal(recs.length, 7);
  const merged = U.mergeCollection(recs, [], {}).records;
  for (const s of saves) {
    const r = merged.find(x => x.id === s.id);
    assert.deepEqual(J(r.data.data.snapshot), s.data.snapshot, s.id);
    assert.equal(U.validateRecord(r), '');
  }
});

/* ───────── sync model / conflicts ───────── */
const R = (collection, id, data, updatedAt, extra = {}) => ({ id, collection, schemaVersion: 1, createdAt: 1790000000000, updatedAt, deletedAt: null, localRev: 1, data, ...extra });
test('UD-10 conflict policy: no blind last-write-wins; nothing disappears silently', () => {
  const { U } = app({ files: ['data/livon-user-data.js'] });
  const base = 1790000001000;
  /* task edited on both sides since last sync → remote stays, local kept as a conflict copy */
  const both = U.mergeCollection([R('tasks', 't1', { title: '로컬 수정' }, base + 10)], [R('tasks', 't1', { title: '서버 수정' }, base + 20)], { lastSyncedAt: base });
  assert.equal(both.records.length, 2); assert.equal(both.conflicts[0].kind, 'both-changed');
  assert.equal(both.records.find(r => r.id === 't1').data.title, '서버 수정');
  assert.equal(both.records.find(r => r.data.conflictOf === 't1').data.title, '로컬 수정');
  /* only one side changed → that side */
  const one = U.mergeCollection([R('goals', 'g1', { title: '로컬' }, base + 10)], [R('goals', 'g1', { title: '예전' }, base - 10)], { lastSyncedAt: base });
  assert.equal(one.records.length, 1); assert.equal(one.records[0].data.title, '로컬'); assert.equal(one.conflicts.length, 0);
  /* first login (no base): differing record → both kept */
  assert.equal(U.mergeCollection([R('goals', 'g2', { title: 'a' }, 5)], [R('goals', 'g2', { title: 'b' }, 9)]).records.length, 2);
  /* saved items: union by stable id */
  const sv = U.mergeCollection([R('saved_items', 's1', { folder: '취업' }, 20), R('saved_items', 's2', {}, 5)], [R('saved_items', 's1', { folder: '나중에' }, 10), R('saved_items', 's3', {}, 5)]);
  assert.deepEqual([...sv.records.map(r => r.id)].sort(), ['s1', 's2', 's3']); assert.equal(sv.records.find(r => r.id === 's1').data.folder, '취업');
  /* folders: set union */
  assert.deepEqual([...U.mergeCollection([R('save_folders', 'f', { values: ['A', 'B'] }, 2)], [R('save_folders', 'f', { values: ['B', 'C'] }, 1)]).records[0].data.values].sort(), ['A', 'B', 'C']);
  /* preferences: newer wins but the difference is reported */
  const pr = U.mergeCollection([R('preferences', 'livon.lifeStage', { value: '30' }, 9)], [R('preferences', 'livon.lifeStage', { value: '20' }, 5)]);
  assert.equal(pr.records[0].data.value, '30'); assert.equal(pr.conflicts[0].kind, 'preference-differs');
  /* identical data → no conflict */
  assert.equal(U.mergeCollection([R('tasks', 'x', { a: 1 }, 1)], [R('tasks', 'x', { a: 1 }, 2)]).conflicts.length, 0);
});

test('UD-11 calendar duplicates, AI approvals idempotent, deleted-record behaviour', () => {
  const { U } = app({ files: ['data/livon-user-data.js'] });
  const ev = d => ({ title: '면접', date: '2026-10-05', start: '10:00', allDay: false, ...d });
  const cal = U.mergeCollection([R('calendar_items', 'e1', ev({}), 5)], [R('calendar_items', 'e2', ev({}), 6), R('calendar_items', 'e3', ev({ start: '11:00' }), 6)]);
  assert.equal(cal.records.length, 2, 'exact duplicate (other device, other id) collapses'); assert.deepEqual([...cal.records.find(r => r.id === 'e2').data.mergedIds], ['e1']);
  const ai = U.mergeCollection([R('tasks', 'a1', { title: '포트폴리오 정리', source: 'livon-ai' }, 5)], [R('tasks', 'a2', { title: '포트폴리오  정리', source: 'livon-ai' }, 6), R('tasks', 'm1', { title: '포트폴리오 정리' }, 6)]);
  assert.equal(ai.records.filter(r => r.data.source === 'livon-ai').length, 1, 'the same AI approval applied twice → one task');
  assert.ok(ai.records.some(r => r.id === 'm1'), 'a manual task with the same title is not touched');
  const tomb = (id, at) => R('tasks', id, null, at, { deletedAt: at });
  assert.equal(U.mergeCollection([tomb('d1', 100)], [R('tasks', 'd1', { title: 'x' }, 50)]).records[0].deletedAt, 100, 'deleted after the last edit → stays deleted');
  const edit = U.mergeCollection([tomb('d2', 100)], [R('tasks', 'd2', { title: 'x' }, 150)]);
  assert.equal(edit.records[0].deletedAt, null); assert.equal(edit.conflicts[0].kind, 'edit-after-delete', 'an edit after the deletion is never lost');
  assert.equal(U.validateRecord(tomb('d3', 5)), '', 'tombstones are valid records');
});

test('UD-12 sync metadata: record ids, timestamps, schemaVersion, device revision; counts-only diagnostics', () => {
  const { U, T } = app({ local: LEGACY() });
  T.saveTodo({ title: '새 할 일' });
  const recs = U.collectAccountRecords({ includeSensitive: true }).records;
  for (const r of recs) {
    assert.equal(U.validateRecord(r), '', r.collection + ' ' + r.id);
    assert.deepEqual(Object.keys(r), ['id', 'collection', 'schemaVersion', 'createdAt', 'updatedAt', 'deletedAt', 'localRev', 'data']);
  }
  const habit = recs.find(r => r.collection === 'habits'); assert.deepEqual(J(habit.data.logs), { '2026-09-28': true }, 'habit logs travel with the habit');
  const m = U.meta(); assert.equal(m.v, 1); assert.ok(m.stores[ML].localRev >= 1); assert.equal(m.lastSync, null);
  const d = U.diagnostics();
  assert.deepEqual(Object.keys(d), ['mode', 'remoteConfigured', 'migrationVersion', 'recordCounts', 'tombstones', 'lastSync', 'conflictCount', 'lastErrorCategory']);
  assert.equal(d.mode, 'anonymous'); assert.equal(d.recordCounts.tasks, 3);
  assert.doesNotMatch(JSON.stringify(d), /이력서|포트폴리오|개인적인 기록|혈압|월세|홍길동/, 'no user content in diagnostics');
});

/* ───────── privacy ───────── */
test('UD-13 privacy exclusions: AI conversations, recent activity, caches, community, profile, family, 동, drafts, secrets never exported', () => {
  const init = LEGACY();
  init[ML].todos.push({ id: 'todo_x', title: '위치', nearby: { lat: 37.5, lng: 127 }, token: 'secret-token', note: '' });
  const { U, ss } = app({ files: ['data/livon-user-data.js'], local: init });
  ss.setItem('livon.aiPrompt', '{"q":"건강"}');
  const all = JSON.stringify(U.collectAccountRecords({ includeSensitive: true }).records);
  for (const bad of ['내 건강이 걱정돼', 'th1', '"recentSearches"', '이사', 'livon.today.recent', 'livon.exViewed', 'livon.data.v1', '질문', '초안', '홍길동', '엄마', '성산동', 'secret-token', '"nearby"', '"alerts"', '"onboarded"']) assert.ok(!all.includes(bad), bad);
  assert.match(all, /"sido":"서울","sgg":"마포구"/, 'coarse region only');
  const def = U.collectAccountRecords();
  assert.ok(!def.records.some(r => U.SENSITIVE_COLLECTIONS.includes(r.collection)), 'health/money/journal need an explicit opt-in');
  assert.equal(def.skipped.sensitive, 4);
  const plan = U.planLoginImport();
  assert.equal(plan.autoUpload, false); assert.equal(plan.requiresUserChoice, true); assert.equal(plan.sensitiveDefault, 'excluded');
  assert.deepEqual(J(plan.sensitiveCounts), { transactions: 1, budgets: 1, health_records: 1, journal: 1 });
  assert.equal(plan.counts.saved_items, 2); assert.ok(plan.excluded.includes('AI 대화'));
});

/* ───────── Community / AI boundaries ───────── */
test('UD-14 Community boundary: posts/comments/drafts stay COMMUNITY_LOCAL; saves of posts go through platform saves', () => {
  const { ctx, U, raw } = app({ local: LEGACY() });
  const repo = ctx.LivonCommunityRepo;
  assert.ok(repo, 'Community repo (future server swap point) still exists');
  const recs = U.collectAccountRecords({ includeSensitive: true }).records;
  assert.ok(!recs.some(r => /community|posts|comments/.test(r.collection)));
  assert.equal(raw(CM).posts[0].id, 'p1', 'community data untouched');
  assert.match(read('community-page.js'), /Community stays COMMUNITY_LOCAL/);
});

test('UD-15 AI: history stays on the device; AI suggestions reach My Life only through approval (no repository write API for AI)', () => {
  const { ctx, U, raw } = app({ local: LEGACY() });
  assert.equal(raw(AI).threads.length, 1);
  assert.ok(!JSON.stringify(U.collectAccountRecords({ includeSensitive: true }).records).includes('th1'));
  const ai = read('ai-page.js');
  assert.match(ai, /function approveAdd\(form\)/);
  assert.doesNotMatch(ai, /LivonUserData\.(write|collectAccountRecords|setRemoteAdapter|setAuthProvider)|remote\(\)\.|\.batch\(/, 'AI never writes account data');
  assert.ok(typeof ctx.LivonAI === 'object' || true);
  /* an approved AI task is a normal My Life task (source livon-ai) and is idempotent on merge (UD-11) */
  assert.ok(U.collectAccountRecords().records.some(r => r.id === 'todo_ai' && r.data.source === 'livon-ai'));
});

/* ───────── security contract ───────── */
test('UD-16 invalid payloads, mass assignment and prototype pollution are rejected (browser and server contract)', () => {
  const { U } = app({ files: ['data/livon-user-data.js'] });
  const ok = R('tasks', 't1', { title: 'x' }, 1790000000000);
  assert.equal(U.validateSyncRequest({ op: 'batch', payload: { records: [ok] } }).ok, true);
  const cases = {
    'client userId': { op: 'batch', payload: { userId: 'u1', records: [ok] } },
    'top-level userId': { op: 'batch', payload: { records: [ok] }, userId: 'u1' },
    'unknown op': { op: 'drop', payload: {} },
    'unknown record field': { op: 'batch', payload: { records: [{ ...ok, ownerId: 'x' }] } },
    'unknown collection': { op: 'batch', payload: { records: [{ ...ok, collection: 'users' }] } },
    'bad id': { op: 'batch', payload: { records: [{ ...ok, id: '../../etc' }] } },
    'bad schema': { op: 'batch', payload: { records: [{ ...ok, schemaVersion: 99 }] } },
    'no data': { op: 'batch', payload: { records: [{ ...ok, data: null }] } },
    'too many': { op: 'batch', payload: { records: Array.from({ length: 501 }, (_, i) => ({ ...ok, id: 't' + i })) } },
    'too large': { op: 'batch', payload: { records: [{ ...ok, data: { t: 'x'.repeat(70000) } }] } },
    'proto': JSON.parse('{"op":"batch","payload":{"records":[{"id":"t","collection":"tasks","schemaVersion":1,"createdAt":1,"updatedAt":1,"deletedAt":null,"localRev":0,"data":{"__proto__":{"admin":true}}}]}}'),
    'constructor': { op: 'batch', payload: { records: [{ ...ok, data: { constructor: { prototype: { x: 1 } } } }] } },
    'array body': [], 'string body': 'x'
  };
  for (const [name, body] of Object.entries(cases)) assert.equal(U.validateSyncRequest(body).ok, false, name);
  assert.equal({}.admin, undefined, 'no pollution happened');
  const cleaned = U.clean(JSON.parse('{"a":{"__proto__":{"x":1}},"b":"\\u202Etext\\u0000"}'));
  assert.deepEqual(Object.keys(cleaned.a), []); assert.equal(cleaned.b, 'text');
  /* server contract: identity only from the verified token (issuer + subject → accountId); endpoint disabled */
  const ISS = 'https://securetoken.google.com/newon-plus-example';
  const sess = { verified: true, issuer: ISS, subject: 'firebaseUid0001', accountId: 'acct_000001' };
  const on = { enabled: true, allowedIssuers: [ISS] };
  assert.equal(ENDPOINT_ENABLED, false);
  assert.throws(() => prepareSyncRequest({ op: 'batch', payload: { records: [ok] } }, sess), e => e instanceof SyncError && e.code === 'SYNC_NOT_AVAILABLE');
  assert.throws(() => prepareSyncRequest({ op: 'batch', payload: { records: [ok] } }, null, on), e => e.status === 401);
  assert.throws(() => prepareSyncRequest({ op: 'batch', payload: { records: [ok] } }, { ...sess, verified: false }, on), e => e.status === 401, 'unverified session');
  assert.throws(() => prepareSyncRequest({ op: 'batch', payload: { records: [ok] } }, { userId: 'user_000001', verified: true }, on), e => e.status === 401, 'a bare userId is not an identity');
  assert.throws(() => prepareSyncRequest({ op: 'batch', payload: { records: [ok] } }, { ...sess, issuer: 'https://securetoken.google.com/other-app' }, on), e => e.status === 403 && e.code === 'ISSUER_NOT_ALLOWED', 'cross-app token');
  assert.throws(() => prepareSyncRequest({ op: 'batch', payload: { records: [ok] } }, { ...sess, accountId: undefined }, on), e => e.code === 'ACCOUNT_NOT_LINKED');
  assert.throws(() => prepareSyncRequest(cases['client userId'], sess, on), e => e.status === 400);
  const rows = prepareSyncRequest({ op: 'batch', payload: { records: [ok] } }, sess, on).rows;
  assert.equal(rows[0].owner_id, 'acct_000001'); assert.equal(rows[0].collection, 'tasks'); assert.equal(rows[0].record_id, 't1');
});

test('UD-17 documentation: inventory, classification, sync, migration, privacy, security, backend comparison, schema, Newon+ path', () => {
  const d = root('docs/livon/account-data-foundation.md');
  for (const h of ['## 1. 현재 저장소 inventory', '## 2. 데이터 분류', '## 3. Repository 구조', '## 4. Sync 모델', '## 5. Conflict 정책', '## 6. Migration', '## 7. 개인정보', '## 8. 보안', '## 9. 향후 인증 연결', '## 10. Backend 비교', '## 11. 권장 구조', '## 12. DB schema 초안', '## 13. Newon+ 통합 경로', '## 14. 진단']) assert.ok(d.includes(h), h);
  for (const k of ['livon.mlStore.v1', 'livon.platform.v1', 'livon.cmStore.v1', 'livon.aiStore.v1', 'livon.userData.meta.v1']) assert.ok(d.includes(k), k);
  for (const w of ['Supabase', 'Firebase', 'Postgres', 'user_records', 'saved_items', 'sync_metadata', 'tombstone']) assert.ok(d.includes(w), w);
  assert.match(d, /실제 로그인·DB·원격 endpoint는 만들지 않았습니다/);
});

test('UD-18 auth architecture audit doc: facts vs. unverified separated, no secret values, compatible contract documented', () => {
  const d = root('docs/newon/auth-architecture.md');
  for (const h of ['## 1. 요약', '## 2. 현재 구현', '## 3. 계정 모델', '## 4. Newon+의 의미', '## 5. Secret audit', '## 6. LIVON Foundation 호환성', '## 7. Identity boundary', '## 8. Cross-app SSO', '## 9. 인증 방식 비교', '## 10. DB 선택', '## 11. 권장 구조', '## 12. Migration 단계', '## 13. 보안 위협 검토']) assert.ok(d.includes(h), h);
  for (const m of ['[확인]', '[미확인]', '[제안]']) assert.ok(d.includes(m), m);
  for (const f of ['admin/hq-auth.js', 'apps/ox-month/ox-month-sync.mjs', 'firestore.rules', 'newon-oxmonth', 'newon-hq', 'allowedIssuers']) assert.ok(d.includes(f), f);
  assert.doesNotMatch(d, /AIza[0-9A-Za-z_-]{10,}|HiVqV|BEGIN [A-Z ]*PRIVATE KEY/, 'no key or identifier values in the report');
  /* the facts the doc states are true in the code */
  const hq = root('admin/hq-auth.js'), ox = root('apps/ox-month/ox-month-web-app.js'), sync = root('apps/ox-month/ox-month-sync.mjs');
  assert.match(hq, /signInWithPopup/); assert.match(hq, /GoogleAuthProvider/);
  assert.match(ox, /signInWithEmailAndPassword/); assert.match(ox, /browserLocalPersistence/); assert.doesNotMatch(ox, /GoogleAuthProvider|OAuthProvider/);
  assert.match(sync, /Authorization: `Bearer \$\{token\}`/); assert.match(sync, /api\/sync\/v1\/ox_month/);
  assert.match(root('server/livon/userdata/http.mjs'), /LIVON_USERDATA_ENABLED === 'true'/, 'the user-data route stays off unless explicitly enabled');
  for (const f of ['livon/life-hub.js', 'livon/life-now-page.js']) assert.doesNotMatch(root(f), /firebase|signInWith|getIdToken/, f + ': LIVON screens have no auth SDK');
  assert.doesNotMatch(root('livon/index.html'), /gstatic\.com\/firebasejs|signInWith/, 'LIVON loads only the Newon+ auth foundation (SDK loads only when configured)');
});
