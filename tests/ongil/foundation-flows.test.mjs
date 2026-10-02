// ONGIL Phase 1 — data foundation (2/2): Profile, Onboarding, Notifications, Account boundary, Search, motion.
// Pure ES modules, no DOM and no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, createMemoryBackend, COLLECTIONS } from '../../ongil-start/js/storage.js';
import * as C from '../../ongil-start/js/contracts.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createProfileStore } from '../../ongil-start/js/profile.js';
import { createOnboarding, STEPS, QUESTION_STEPS, familyConnection } from '../../ongil-start/js/onboarding.js';
import { createNotificationCenter, DELIVERY } from '../../ongil-start/js/notifications.js';
import { createAccount, SYNCABLE_COLLECTIONS } from '../../ongil-start/js/account.js';
import { createSearch, createAreaProvider, createSavedProvider, normalizeQuery } from '../../ongil-start/js/search.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { motionAllowed } from '../../ongil-start/js/film.js';

function world(seed) {
  let t = 1_700_000_000_000;
  const now = () => (t += 1000);
  const storage = createStorage({ backend: createMemoryBackend(seed), now });
  const profile = createProfileStore(storage, { now });
  const saved = createSavedStore(storage, { now });
  const onboarding = createOnboarding({ storage, profile, now });
  const notifications = createNotificationCenter({ storage, profile, now });
  const account = createAccount({ storage });
  return { storage, profile, saved, onboarding, notifications, account };
}

/* ───────── Profile ───────── */

test('OG-PF-1 profile and preferences round-trip through storage', () => {
  const { profile, storage } = world();
  assert.equal(profile.hasProfile(), false);
  profile.updateProfile({ nickname: '영희', region: '부산', interests: ['hobby', 'culture'] });
  profile.updateProfile({ ageRange: '70s' });
  const p = profile.getProfile();
  assert.deepEqual([p.nickname, p.region, p.ageRange, p.interests], ['영희', '부산', '70s', ['hobby', 'culture']]);
  profile.updatePreferences({ textSize: 'xlarge' });
  profile.updatePreferences({ notifications: { MEDICATION: true } });
  const pref = profile.getPreferences();
  assert.equal(pref.textSize, 'xlarge');
  assert.equal(pref.notifications.MEDICATION, true);
  assert.equal(pref.notifications.STORE, false);
  assert.deepEqual(storage.list(), ['profile', 'preferences']);
});

/* ───────── Onboarding ───────── */

test('OG-ON-1 the flow is short: one question per step, seven questions', () => {
  assert.deepEqual([...STEPS], ['welcome', 'usage', 'age', 'region', 'interests', 'needs', 'notifications', 'family', 'complete']);
  assert.equal(QUESTION_STEPS.length, 7);
});

test('OG-ON-2 every step can be passed without answering; nothing is applied before the end', () => {
  const { onboarding, profile } = world();
  assert.equal(onboarding.state().status, 'new');
  assert.equal(onboarding.start().step, 'welcome');
  for (let i = 0; i < 7; i++) onboarding.next();
  assert.equal(onboarding.state().step, 'family');
  assert.equal(profile.hasProfile(), false);
  const done = onboarding.next();
  assert.equal(done.status, 'completed');
  assert.equal(done.step, 'complete');
  assert.equal(profile.getProfile().region, '');
});

test('OG-ON-3 answers reach the profile and preferences only on completion', () => {
  const { onboarding, profile } = world();
  onboarding.start();
  onboarding.next();
  assert.equal(onboarding.answer('usage', 'with-family').ok, true);
  assert.equal(onboarding.answer('age', '70s').ok, true);
  assert.equal(onboarding.answer('region', '제주').ok, true);
  assert.equal(onboarding.answer('interests', ['outing', 'bogus']).ok, true);
  assert.equal(onboarding.answer('needs', ['medication']).ok, true);
  assert.equal(onboarding.answer('notifications', 'important').ok, true);
  assert.equal(onboarding.answer('age', '999').ok, false);
  assert.equal(onboarding.answer('nope', 'x').ok, false);
  assert.equal(profile.hasProfile(), false);
  onboarding.complete();
  const p = profile.getProfile();
  assert.deepEqual([p.usageMode, p.ageRange, p.region, p.interests, p.needs], ['with-family', '70s', '제주', ['outing'], ['medication']]);
  const n = profile.getPreferences().notifications;
  assert.deepEqual([n.CHECK_IN, n.MEDICATION, n.FAMILY, n.SYSTEM, n.STORE, n.COMMUNITY], [true, true, true, true, false, false]);
});

test('OG-ON-4 skip keeps the draft and can be resumed; back never goes below the first step', () => {
  const { onboarding, profile } = world();
  onboarding.start();
  onboarding.next();
  onboarding.next();
  onboarding.answer('age', '60s');
  assert.equal(onboarding.skip().status, 'skipped');
  assert.equal(profile.hasProfile(), false);
  const resumed = onboarding.start();
  assert.equal(resumed.status, 'in_progress');
  assert.equal(resumed.step, 'age');
  assert.equal(resumed.answers.age, '60s');
  for (let i = 0; i < 5; i++) onboarding.back();
  assert.equal(onboarding.state().step, 'welcome');
});

test('OG-ON-5 a finished setup can be redone with the current answers', () => {
  const { onboarding, profile } = world();
  onboarding.start();
  onboarding.answer('region', '대전');
  onboarding.complete();
  profile.updateProfile({ region: '광주' });
  const again = onboarding.start();
  assert.equal(again.step, 'usage');
  assert.equal(again.answers.region, '광주');
});

test('OG-ON-6 "connect family now" only records the wish — no connection is ever created', () => {
  const { onboarding, profile, storage } = world();
  onboarding.start();
  assert.equal(onboarding.answer('family', 'now').ok, true);
  onboarding.complete();
  assert.equal(profile.getProfile().familyIntent, 'now');
  assert.deepEqual({ ...onboarding.familyConnection() }, { available: false, status: 'NOT_AVAILABLE' });
  assert.deepEqual({ ...familyConnection() }, { available: false, status: 'NOT_AVAILABLE' });
  const raw = JSON.stringify(COLLECTIONS.map((c) => storage.get(c)));
  for (const word of ['connected', 'members', 'familyId', 'inviteCode', 'permission']) assert.equal(raw.includes(word), false, word);
});

/* ───────── Notifications ───────── */

test('OG-NT-1 nothing is delivered in Phase 1 and the list starts empty', () => {
  const { notifications } = world();
  assert.deepEqual({ ...DELIVERY }, { push: false, server: false, inApp: true });
  assert.deepEqual(notifications.list(), []);
  assert.equal(notifications.unreadCount(), 0);
  assert.equal(notifications.preferences().length, 9);
  assert.equal(notifications.preferences().every((p) => p.enabled === false), true);
});

test('OG-NT-2 preferences gate what may be added; read state works', () => {
  const { notifications } = world();
  assert.equal(notifications.add({ id: 'n1', type: 'SCHEDULE', title: '일정' }).reason, 'TYPE_DISABLED');
  assert.equal(notifications.setPreference('SCHEDULE', true).ok, true);
  assert.equal(notifications.setPreference('NOPE', true).ok, false);
  assert.equal(notifications.add({ id: 'n1', type: 'SCHEDULE', title: '일정', href: 'javascript:x' }).ok, true);
  assert.equal(notifications.add({ id: 'n2', type: 'ORDER', title: 'x' }).ok, false);
  assert.equal(notifications.list()[0].href, '');
  assert.equal(notifications.unreadCount(), 1);
  notifications.markAllRead();
  assert.equal(notifications.unreadCount(), 0);
});

/* ───────── Account boundary ───────── */

test('OG-AC-1 ONGIL runs in local mode: no sign-in, no sync', () => {
  const { account } = world();
  const s = account.state();
  assert.deepEqual([s.mode, s.signedIn, s.syncAvailable, s.adapterId], ['local', false, false, null]);
});

test('OG-AC-2 a sync adapter is refused unless it is valid and configured (fail-closed)', () => {
  const { account, profile } = world();
  for (const bad of [null, {}, { id: 'x' }, { id: 'x', isConfigured: () => true }]) assert.deepEqual(account.connectSyncAdapter(bad), { connected: false, reason: 'INVALID_ADAPTER' });
  const pushed = [];
  assert.equal(account.connectSyncAdapter({ id: 'newon-plus', isConfigured: () => false, push: (c) => pushed.push(c) }).reason, 'NOT_CONFIGURED');
  assert.equal(account.connectSyncAdapter({ id: 'newon-plus', isConfigured: () => { throw new Error('x'); }, push() {} }).reason, 'NOT_CONFIGURED');
  profile.updateProfile({ nickname: 'a' });
  assert.equal(pushed.length, 0);
  assert.equal(account.state().mode, 'local');
});

test('OG-AC-3 a configured adapter receives later changes only, and a failing adapter never breaks local use', () => {
  const { account, profile, saved, notifications } = world();
  profile.updateProfile({ nickname: '기존' });
  const pushed = [];
  assert.equal(account.connectSyncAdapter({ id: 'test', isConfigured: () => true, push: (c) => { pushed.push(c.collection); throw new Error('network'); } }).connected, true);
  assert.equal(account.state().mode, 'account');
  assert.equal(account.state().signedIn, false, 'identity comes only from a real auth provider');
  assert.equal(pushed.length, 0, 'what was already on the device is not uploaded by connecting');
  assert.equal(saved.save({ type: 'PLACE', id: 'a', title: 't' }).ok, true);
  notifications.setPreference('SYSTEM', true);
  assert.deepEqual(pushed, ['saved', 'preferences']);
  assert.deepEqual([...SYNCABLE_COLLECTIONS], ['profile', 'preferences', 'saved', 'onboarding']);
  account.disconnectSyncAdapter();
  profile.updateProfile({ nickname: 'b' });
  assert.equal(pushed.length, 2);
  assert.equal(account.state().mode, 'local');
});

/* ───────── Search ───────── */

test('OG-SE-1 no provider data means an empty result — never an invented one', async () => {
  const s = createSearch();
  assert.deepEqual((await s.query('방문요양')).results, []);
  s.registerProvider({ id: 'empty', label: 'x', search: () => [] });
  const r = await s.query('아무거나');
  assert.deepEqual([r.results, r.groups, r.failed], [[], [], []]);
  assert.deepEqual((await s.query('   ')).results, []);
  assert.equal(normalizeQuery('  a\u0000b  ' + 'x'.repeat(100)).length <= C.LIMITS.query, true);
});

test('OG-SE-2 area and saved providers return real local data', async () => {
  const { saved } = world();
  const s = createSearch();
  s.registerProvider(createAreaProvider(AREAS));
  s.registerProvider(createSavedProvider(saved, C.SAVED_TYPE_LABELS));
  assert.deepEqual(s.providerIds(), ['areas', 'saved']);
  const store = await s.query('스토어');
  assert.equal(store.results[0].href, '#store');
  const med = await s.query('복약');
  assert.ok(med.results.length >= 2);
  assert.ok(med.results.every((r) => r.providerId === 'areas'));
  /* Phase 2A: Home's 복약 works now. Phase 3: 복약 also works in 내 생활 › 건강 and the 건강·안부 entry that points there,
     so those no longer say 준비 중; a section that is still unfinished (병원) does. */
  assert.equal(med.results.find((r) => r.id === 'home.medication').description.includes('준비 중'), false);
  for (const id of ['life.medication', 'health.medication']) assert.equal(med.results.find((r) => r.id === id).description.includes('준비 중'), false, id);
  const hospital = await s.query('진료 예약');
  assert.ok(hospital.results.length >= 1 && hospital.results.every((r) => r.description.includes('준비 중')), 'unfinished sections say so');
  assert.deepEqual((await s.query('동네 공원')).results, []);
  saved.save({ type: 'PLACE', id: 'park', title: '동네 공원', href: '#enjoy' });
  const park = await s.query('동네 공원');
  assert.deepEqual([park.results.length, park.results[0].providerId, park.results[0].href], [1, 'saved', '#enjoy']);
});

test('OG-SE-3 provider failures are isolated and results are sanitised', async () => {
  const s = createSearch();
  s.registerProvider({ id: 'boom', label: 'x', search: () => { throw new Error('down'); } });
  s.registerProvider({ id: 'web', label: '외부', search: async () => [{ id: 1, title: 'ok', href: 'javascript:alert(1)' }, { id: 2, title: '' }, null, 'str'] });
  const r = await s.query('ok');
  assert.deepEqual(r.failed, ['boom']);
  assert.equal(r.results.length, 1);
  assert.equal(r.results[0].href, '');
  assert.throws(() => s.registerProvider({ id: 'Bad Id', search() {} }), /INVALID_PROVIDER/);
  assert.throws(() => s.registerProvider({ id: 'nosearch' }), /INVALID_PROVIDER/);
});

/* ───────── motion ───────── */

test('OG-MO-1 films stay still when the user or the device asks for reduced motion', () => {
  assert.equal(motionAllowed('system', false), true);
  assert.equal(motionAllowed('system', true), false);
  assert.equal(motionAllowed('off', false), false);
  assert.equal(motionAllowed('on', true), true);
});
