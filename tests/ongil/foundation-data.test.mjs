// ONGIL Phase 1 — data foundation (1/2): storage namespace, contracts, Saved.
// Pure ES modules, no DOM and no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, createMemoryBackend, resolveBackend, storageKey, KEY_PREFIX, NAMESPACE, COLLECTIONS } from '../../ongil-start/js/storage.js';
import * as C from '../../ongil-start/js/contracts.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createProfileStore } from '../../ongil-start/js/profile.js';

function world(seed) {
  let t = 1_700_000_000_000;
  const now = () => (t += 1000);
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  const profile = createProfileStore(storage, { now });
  const saved = createSavedStore(storage, { now });
  return { backend, storage, profile, saved };
}

/* ───────── storage ───────── */

test('OG-ST-1 every key lives in the ongil.v1 namespace', () => {
  assert.equal(NAMESPACE, 'ongil');
  assert.equal(KEY_PREFIX, 'ongil.v1.');
  for (const c of COLLECTIONS) assert.equal(storageKey(c), 'ongil.v1.' + c);
  const { backend, profile, saved } = world();
  profile.updateProfile({ nickname: '길동' });
  profile.updatePreferences({ textSize: 'large' });
  saved.save({ type: 'PLACE', id: 'p1', title: '공원' });
  assert.ok(backend.keys().length >= 3);
  for (const k of backend.keys()) assert.ok(k.startsWith('ongil.v1.'), k);
});

// Phase 2A added five collections for Home V1 and Phase 2B six for My Life; family data and health records still have none.
// The list is asserted in full so that a new collection can never appear without this test (and its privacy class) being updated.
// Phase 3 (Health + Check-in V1) added exactly two: 'symptoms' and 'healthNotes' (HEALTH_ADJACENT). A generic 'healthRecords'
// store still does not exist and is still refused below; family data still has no collection.
// Phase 4 added the user's OWN family-sharing choices and help-request notes ('familySharing', 'helpRequests', PRIVATE).
// Records about family members (connections, permissions) still have no collection and are still refused below.
// Phase 6 added the user's own community posts and group/meetup drafts (PRIVATE, this device only).
test('OG-ST-2 unknown collections are refused (family data and health records have no collection)', () => {
  const { storage } = world();
  for (const c of ['health', 'family', 'checkin', 'medication', '__proto__', '', 'livon.platform.v1']) {
    assert.throws(() => storage.get(c), /UNKNOWN_COLLECTION/);
    assert.throws(() => storage.set(c, {}), /UNKNOWN_COLLECTION/);
  }
  assert.deepEqual([...COLLECTIONS], ['profile', 'preferences', 'onboarding', 'saved', 'notifications', 'checkins', 'events', 'medications', 'medicationLogs', 'dailyLife', 'tasks', 'routines', 'routineLogs', 'sleepRecords', 'expenses', 'journal', 'symptoms', 'healthNotes', 'familySharing', 'helpRequests', 'communityPosts', 'groupDrafts', 'meetupDrafts']);
  for (const c of ['familyConnections', 'familyPermissions', 'healthRecords', 'devices']) assert.equal(COLLECTIONS.includes(c), false, c);
});

test('OG-ST-3 a corrupt or non-object value is treated as missing and never thrown', () => {
  const { storage, profile, saved } = world({ 'ongil.v1.profile': '{not json', 'ongil.v1.saved': '"a string"', 'ongil.v1.preferences': 'null' });
  assert.equal(storage.get('profile', null), null);
  assert.deepEqual(storage.get('saved', { items: [] }), { items: [] });
  assert.equal(profile.getProfile().nickname, '');
  assert.equal(profile.getPreferences().textSize, 'default');
  assert.deepEqual(saved.list(), []);
  assert.equal(saved.save({ type: 'POST', id: 'a', title: '글' }).ok, true);
});

test('OG-ST-4 clear() removes ONGIL keys only', () => {
  const { backend, storage, profile } = world({ 'livon.platform.v1': '{"keep":1}', newon_utm_v1: 'x', 'ongil.other': 'y' });
  profile.updateProfile({ nickname: 'a' });
  assert.deepEqual(storage.list(), ['profile']);
  assert.equal(storage.clear(), true);
  assert.deepEqual(storage.list(), []);
  assert.equal(backend.getItem('livon.platform.v1'), '{"keep":1}');
  assert.equal(backend.getItem('newon_utm_v1'), 'x');
  assert.equal(backend.getItem('ongil.other'), 'y');
});

test('OG-ST-5 blocked or throwing localStorage falls back to memory and keeps working', () => {
  const throwing = { get localStorage() { throw new Error('SecurityError'); } };
  const full = { localStorage: { setItem() { throw new Error('QuotaExceededError'); }, removeItem() {}, getItem: () => null, key: () => null, length: 0 } };
  for (const win of [throwing, full, {}, null]) {
    const backend = resolveBackend(win);
    assert.equal(backend.kind, 'memory');
    const storage = createStorage({ backend });
    assert.equal(storage.persistent, false);
    assert.equal(storage.set('profile', { nickname: 'x' }), true);
    assert.equal(storage.get('profile').nickname, 'x');
  }
  const map = new Map();
  const ok = { localStorage: { setItem: (k, v) => map.set(k, v), removeItem: (k) => map.delete(k), getItem: (k) => (map.has(k) ? map.get(k) : null), key: (i) => [...map.keys()][i], get length() { return map.size; } } };
  const storage = createStorage({ backend: resolveBackend(ok) });
  assert.equal(storage.persistent, true);
  storage.set('saved', { items: [] });
  assert.deepEqual([...map.keys()], ['ongil.v1.saved']);
});

test('OG-ST-6 a failed write reports false; subscribe reports each change', () => {
  const backend = createMemoryBackend();
  const storage = createStorage({ backend: { ...backend, setItem() { throw new Error('quota'); } } });
  assert.equal(storage.set('profile', { a: 1 }), false);
  const { storage: s2 } = world();
  const seen = [];
  const off = s2.subscribe((c) => seen.push([c.collection, c.op]));
  s2.set('profile', { a: 1 });
  s2.remove('profile');
  off();
  s2.set('profile', { a: 2 });
  assert.deepEqual(seen, [['profile', 'set'], ['profile', 'remove']]);
  assert.throws(() => s2.set('profile', 'text'), /INVALID_VALUE/);
});

/* ───────── contracts ───────── */

test('OG-CT-1 safeHref allows in-app hashes, same-site paths and https only', () => {
  for (const ok of ['#life', '#ongil-home', '/ko/ongil/', 'https://www.newon.app/x?y=1']) assert.notEqual(C.safeHref(ok), '', ok);
  for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>', '//evil.example', 'http://insecure.example', 'https://user:pw@evil.example/', ' #life" onclick="x', '#"><img>', 'vbscript:x', '', null, 42, '/\\evil']) {
    assert.equal(C.safeHref(bad), '', String(bad));
  }
});

test('OG-CT-2 profile keeps only known fields and values', () => {
  const p = C.normalizeProfile({ nickname: '  <b>길동</b>\u0000 ' + 'x'.repeat(40), ageRange: '120', region: '서울', interests: ['health', 'nope', 'health'], needs: 'daily', usageMode: 'self', phone: '010', realName: 'x' });
  assert.equal(p.nickname.length <= C.LIMITS.nickname, true);
  assert.equal(p.nickname.includes('\u0000'), false);
  assert.equal(p.ageRange, '');
  assert.equal(p.region, '서울');
  assert.deepEqual(p.interests, ['health']);
  assert.deepEqual(p.needs, []);
  assert.deepEqual(Object.keys(p).sort(), ['ageRange', 'familyIntent', 'interests', 'needs', 'nickname', 'region', 'schemaVersion', 'updatedAt', 'usageMode']);
  for (const forbidden of ['phone', 'realName', 'birthDate', 'address']) assert.equal(forbidden in p, false);
});

test('OG-CT-3 preferences default to quiet, system motion, default text', () => {
  const d = C.emptyPreferences();
  assert.equal(d.textSize, 'default');
  assert.equal(d.motion, 'system');
  assert.equal(Object.values(d.notifications).every((v) => v === false), true);
  const p = C.normalizePreferences({ textSize: 'huge', motion: 'off', notifications: { CHECK_IN: true, FAKE: true, STORE: 'yes' } });
  assert.equal(p.textSize, 'default');
  assert.equal(p.motion, 'off');
  assert.equal(p.notifications.CHECK_IN, true);
  assert.equal(p.notifications.STORE, false);
  assert.equal('FAKE' in p.notifications, false);
  assert.deepEqual(C.NOTIFICATION_TYPES.map((t) => t.id), ['CHECK_IN', 'SCHEDULE', 'MEDICATION', 'FAMILY', 'SERVICE', 'PROGRAM', 'COMMUNITY', 'STORE', 'SYSTEM']);
});

test('OG-CT-4 future contracts are named, not implemented', () => {
  for (const name of ['CheckIn', 'CalendarEvent', 'Task', 'Routine', 'Medication', 'FamilyConnection', 'FamilyPermission', 'CareService', 'Program', 'Place', 'CommunityPost', 'Product', 'Notification']) {
    assert.ok(C.FUTURE_CONTRACTS.includes(name), name);
  }
  for (const name of ['normalizeCheckIn', 'normalizeMedication', 'normalizeFamilyConnection', 'normalizeFamilyPermission']) assert.equal(name in C, false);
});

/* ───────── Saved ───────── */

test('OG-SV-1 save · isSaved · list · filter · unsave', () => {
  const { saved } = world();
  assert.deepEqual([...C.SAVED_TYPES], ['SERVICE', 'BENEFIT', 'FACILITY', 'PROGRAM', 'PLACE', 'POST', 'PRODUCT']);
  for (const [i, type] of C.SAVED_TYPES.entries()) assert.equal(saved.save({ type, id: 'x' + i, title: '항목 ' + i, href: '#care' }).ok, true);
  assert.equal(saved.count(), 7);
  assert.equal(saved.isSaved('PLACE', 'x4'), true);
  assert.equal(saved.isSaved('PLACE', 'x0'), false);
  assert.deepEqual(saved.list({ type: 'PROGRAM' }).map((i) => i.id), ['x3']);
  assert.deepEqual(saved.list({ type: 'NOPE' }), []);
  assert.equal(saved.list()[0].id, 'x6', 'newest first');
  assert.equal(saved.counts().POST, 1);
  assert.equal(saved.unsave('PLACE', 'x4'), true);
  assert.equal(saved.unsave('PLACE', 'x4'), false);
  assert.equal(saved.isSaved('PLACE', 'x4'), false);
  assert.equal(saved.count(), 6);
});

test('OG-SV-2 duplicates, toggle and invalid input', () => {
  const { saved } = world();
  const a = saved.save({ type: 'SERVICE', id: 's1', title: '방문요양' });
  const b = saved.save({ type: 'SERVICE', id: 's1', title: '다른 제목' });
  assert.equal(a.already, false);
  assert.equal(b.already, true);
  assert.equal(saved.count(), 1);
  assert.equal(saved.list()[0].title, '방문요양');
  assert.equal(saved.save({ type: 'PRODUCT', id: 's1', title: '같은 id 다른 종류' }).ok, true, 'key is type:id');
  assert.equal(saved.toggle({ type: 'SERVICE', id: 's1', title: 'x' }).saved, false);
  assert.equal(saved.toggle({ type: 'SERVICE', id: 's1', title: '방문요양' }).saved, true);
  for (const bad of [null, {}, { type: 'ORDER', id: 'a', title: 't' }, { type: 'PLACE', id: '', title: 't' }, { type: 'PLACE', id: 'a b', title: 't' }, { type: 'PLACE', id: 'a', title: '   ' }, { type: 'PLACE', id: '<x>', title: 't' }]) {
    assert.equal(saved.save(bad).ok, false);
  }
});

test('OG-SV-3 unsafe links and unknown fields never survive a save', () => {
  const { saved } = world();
  saved.save({ type: 'POST', id: 'p', title: '<img src=x onerror=alert(1)>', description: '<script>x</script>', href: 'javascript:alert(1)', price: 1000, order: { paid: true } });
  const it = saved.list()[0];
  assert.equal(it.href, '');
  assert.equal(it.title, '<img src=x onerror=alert(1)>', 'kept as text; the UI renders it with textContent');
  for (const k of ['price', 'order']) assert.equal(k in it, false);
});

test('OG-SV-4 the list is bounded', () => {
  const { saved } = world();
  for (let i = 0; i < C.LIMITS.savedItems; i++) saved.save({ type: 'PLACE', id: 'n' + i, title: 't' + i });
  assert.equal(saved.save({ type: 'PLACE', id: 'over', title: 't' }).reason, 'LIMIT');
  assert.equal(saved.count(), C.LIMITS.savedItems);
});
