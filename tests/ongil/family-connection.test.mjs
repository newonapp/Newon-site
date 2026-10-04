// ONGIL Family Connection V1 — family group, invitation, connection, consent, per-member sharing, preview, revocation,
// the permission-filtered family view, help requests and the activity log.
// What is real here: everything on ONE device (LOCAL). What is not: a connection between two devices — that needs a
// Newon+ account and a family server (ACCOUNT REQUIRED), and these tests pin that it is never claimed.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import * as D from '../../ongil-start/js/family-domain.js';
import * as P from '../../ongil-start/js/family-permissions.js';
import { createLocalFamilyRepository, createRemoteFamilyRepository, selectFamilyRepository, FamilyRepositoryUnavailable, FAMILY_REMOTE_CONTRACT, FAMILY_COLLECTION } from '../../ongil-start/js/family-repository.js';
import { createFamilyService } from '../../ongil-start/js/family-service.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createScheduleStore } from '../../ongil-start/js/schedule.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { classOf, maySync, maySearchGlobally } from '../../ongil-start/js/privacy.js';
import { dateKey } from '../../ongil-start/js/dates.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const FAMILY_MODULES = ['family-domain.js', 'family-permissions.js', 'family-repository.js', 'family-service.js', 'family-connect-view.js'];
const VIEW = strip(read('js', 'family-connect-view.js'));

function world(seed) {
  const clock = { t: new Date(2026, 9, 4, 9, 0, 0).getTime() };
  const now = () => (clock.t += 1000);
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  const checkIn = createCheckInStore(storage, { now });
  const schedule = createScheduleStore(storage, { now });
  const medication = createMedicationStore(storage, { now });
  const extra = { daily: null, sleep: null, contacts: 0 };
  const sources = { checkIn, schedule, medication, dailyLife: { get: () => extra.daily }, sleep: { get: () => extra.sleep }, emergencyContacts: { count: () => extra.contacts } };
  const repository = createLocalFamilyRepository(storage, { now });
  const service = createFamilyService({ repository, sources, now });
  const today = () => dateKey(clock.t);
  return { clock, now, backend, storage, checkIn, schedule, medication, extra, sources, repository, service, today };
}
/* invite + accept: one connected member with nothing shared */
function connect(w, displayName = '큰딸', more = {}) {
  const made = w.service.createInvitation({ displayName, relationship: 'child', ...more });
  assert.equal(made.ok, true);
  const got = w.service.acceptInvitation(made.code);
  assert.equal(got.ok, true);
  return { member: got.member, code: made.code, invitation: made.invitation };
}
const raw = (w) => w.storage.get(FAMILY_COLLECTION, null);
const DAY = 24 * 3600e3;

test('FC-01 no family: an empty state, nothing shared, nothing stored', () => {
  const w = world();
  const o = w.service.overview();
  assert.deepEqual([o.hasGroup, o.members.length, o.connected.length, o.pending.length, o.invitations.length], [false, 0, 0, 0, 0]);
  assert.equal(o.mode, 'LOCAL');
  assert.equal(o.crossDevice, 'ACCOUNT_REQUIRED');
  assert.equal(w.service.connectedCount(), 0);
  assert.deepEqual(w.service.requests(), []);
  assert.deepEqual(w.service.activity(), []);
  assert.equal(raw(w), null, 'reading must not create a family');
  assert.deepEqual(D.normalizeFamilyState(null), D.emptyFamilyState());
  assert.equal(w.service.familyView('fm_aaaaaaaaaaaa').reason, 'ACCESS_DENIED');
  assert.equal(w.service.stopAllSharing().reason, 'NO_FAMILY');
});

test('FC-02 create invitation: a pending invitation with a 20-character code and an expiry', () => {
  const w = world();
  const made = w.service.createInvitation({ displayName: '  큰딸  ', relationship: 'child', expiry: '1d' });
  assert.equal(made.ok, true);
  assert.match(made.code, /^[23456789A-HJ-NP-Z]{20}$/);
  assert.equal(made.invitation.status, 'PENDING');
  assert.equal(made.invitation.displayName, '큰딸');
  const life = (i) => i.expiresAt - i.createdAt; /* the test clock ticks a second per reading */
  assert.ok(life(made.invitation) >= DAY && life(made.invitation) < DAY + 10e3, 'one day from the moment it was made');
  assert.equal('code' in made.invitation, false, 'the public invitation record never carries the code');
  assert.equal(w.service.invitationCode(made.invitation.id), made.code);
  assert.equal(D.formatInvitationCode(made.code).length, 23);
  assert.equal(D.parseInvitationCode(D.formatInvitationCode(made.code).toLowerCase()), made.code);
  const o = w.service.overview();
  assert.deepEqual([o.hasGroup, o.pending.length, o.members.length], [true, 1, 0]);
  /* a name is required; the default expiry is 7 days; pending invitations are limited */
  assert.equal(w.service.createInvitation({ displayName: '   ' }).ok, false);
  const d7 = w.service.createInvitation({ displayName: '아들' });
  assert.ok(life(d7.invitation) >= 7 * DAY && life(d7.invitation) < 7 * DAY + 10e3);
  for (let i = 0; i < 3; i += 1) assert.equal(w.service.createInvitation({ displayName: `가족${i}` }).ok, true);
  assert.equal(w.service.createInvitation({ displayName: '여섯째' }).reason, 'LIMIT_INVITATIONS');
});

test('FC-03 invitation expiry: an expired code connects nobody and reads EXPIRED', () => {
  const w = world();
  const made = w.service.createInvitation({ displayName: '큰딸', expiry: '1d' });
  w.clock.t += DAY + 1000;
  assert.equal(w.service.overview().invitations[0].status, 'EXPIRED', 'expired before anything was written');
  assert.equal(w.service.invitationCode(made.invitation.id), '');
  assert.equal(w.service.inspectInvitation(made.code).reason, 'EXPIRED');
  assert.equal(w.service.acceptInvitation(made.code).reason, 'EXPIRED');
  assert.equal(w.service.declineInvitation(made.code).reason, 'EXPIRED');
  assert.equal(w.service.revokeInvitation(made.invitation.id).reason, 'EXPIRED');
  assert.equal(w.service.overview().members.length, 0);
  assert.equal(raw(w).invitations[0].status, 'EXPIRED', 'the expiry is stored');
  assert.equal(w.service.activity().some((a) => a.action === 'INVITE_EXPIRED' && a.actor === 'SYSTEM'), true);
  /* an expired invitation no longer counts against the pending limit */
  assert.equal(w.service.overview().pending.length, 0);
});

test('FC-04 cancel invitation: a revoked code is dead, and only a pending one can be revoked', () => {
  const w = world();
  const made = w.service.createInvitation({ displayName: '큰딸' });
  assert.equal(w.service.revokeInvitation(made.invitation.id).ok, true);
  assert.equal(w.service.overview().invitations[0].status, 'REVOKED');
  assert.equal(w.service.acceptInvitation(made.code).reason, 'REVOKED');
  assert.equal(w.service.inspectInvitation(made.code).reason, 'REVOKED');
  assert.equal(w.service.revokeInvitation(made.invitation.id).reason, 'REVOKED');
  assert.equal(w.service.revokeInvitation('fi_doesnotexist00').reason, 'NOT_FOUND');
  assert.equal(w.service.overview().members.length, 0);
  /* declining is the invited person's "no" */
  const second = w.service.createInvitation({ displayName: '아들' });
  assert.equal(w.service.declineInvitation(second.code).ok, true);
  assert.equal(w.service.acceptInvitation(second.code).reason, 'DECLINED');
});

test('FC-05 accept invitation: one member, one connection, and the code works exactly once', () => {
  const w = world();
  const made = w.service.createInvitation({ displayName: '큰딸', relationship: 'child', role: 'CAREGIVER' });
  const seen = w.service.inspectInvitation(made.code);
  assert.equal(seen.ok, true);
  assert.deepEqual(seen.sharedOnConnect, [], 'looking at an invitation shows no data');
  assert.equal(w.service.acceptInvitation('AAAAA-BBBBB').reason, 'INVALID_CODE');
  assert.equal(w.service.acceptInvitation('2'.repeat(20)).reason, 'NOT_FOUND');
  const got = w.service.acceptInvitation(D.formatInvitationCode(made.code).toLowerCase());
  assert.equal(got.ok, true);
  assert.deepEqual(got.shared, []);
  assert.deepEqual([got.member.displayName, got.member.role, got.member.status], ['큰딸', 'CAREGIVER', 'ACTIVE']);
  assert.equal(w.service.acceptInvitation(made.code).reason, 'ACCEPTED', 'a used code cannot connect a second person');
  const s = raw(w);
  assert.deepEqual([s.members.length, s.connections.length, s.connections[0].status, s.invitations[0].status], [1, 1, 'ACTIVE', 'ACCEPTED']);
  assert.equal(w.service.connectedCount(), 1);
  assert.ok(w.service.member(got.member.id));
});

test('FC-06 a connection shares nothing: every category is NONE until the owner turns it on', () => {
  const w = world();
  w.checkIn.save({ status: 'good' }, w.today());
  w.schedule.add({ title: '손주 생일 저녁', date: w.today(), time: '18:30' });
  w.medication.add({ name: '혈압약', time: '08:00' });
  const { member } = connect(w);
  const s = raw(w);
  assert.deepEqual([s.permissions.length, s.consents.length], [0, 0]);
  assert.deepEqual([...new Set(Object.values(w.service.levels(member.id)))], ['NONE']);
  assert.equal(Object.keys(w.service.levels(member.id)).length, 10);
  const view = w.service.familyView(member.id);
  assert.deepEqual([view.ok, view.snapshot.items.length, view.snapshot.requests.length, view.snapshot.empty], [true, 0, 0, true]);
  const preview = w.service.previewFor(member.id);
  assert.deepEqual([preview.shared.length, preview.notShared.length], [0, 10]);
  for (const c of D.SHARING_CATEGORY_IDS) assert.equal(P.canView(s, member.id, { category: c }), false, c);
});

test('FC-07 turning one category on shows that category and nothing else', () => {
  const w = world();
  w.checkIn.save({ status: 'good' }, w.today());
  w.schedule.add({ title: '손주 생일 저녁', date: w.today(), time: '18:30' });
  const { member } = connect(w);
  const out = w.service.setSharing(member.id, 'CHECK_IN', 'SUMMARY');
  assert.deepEqual([out.ok, out.changed, out.levels.CHECK_IN], [true, 1, 'SUMMARY']);
  const view = w.service.familyView(member.id).snapshot;
  assert.deepEqual(view.items.map((i) => i.category), ['CHECK_IN']);
  assert.deepEqual(view.items[0].lines, ['오늘 안부를 남겼어요.'], 'summary: that a check-in exists, not the mood');
  assert.equal(JSON.stringify(view).includes('손주'), false);
  w.service.setSharing(member.id, 'CHECK_IN', 'DETAIL');
  assert.equal(w.service.familyView(member.id).snapshot.items[0].lines.length, 2);
  /* saving the same level again changes nothing and writes no log line */
  const before = w.service.activity().length;
  assert.equal(w.service.setSharing(member.id, 'CHECK_IN', 'DETAIL').changed, 0);
  assert.equal(w.service.activity().length, before);
  /* a level a category does not offer, and a category that does not exist, are refused */
  assert.equal(w.service.setSharing(member.id, 'SLEEP', 'EVERYTHING').reason, 'INVALID_LEVEL');
  assert.equal(w.service.setSharing(member.id, 'DIARY', 'SUMMARY').reason, 'INVALID_CATEGORY');
  assert.equal(w.service.setSharing(member.id, 'HELP_REQUEST', 'SUMMARY').reason, 'INVALID_LEVEL');
});

test('FC-08 turning a category off removes it from the family view at once', () => {
  const w = world();
  w.schedule.add({ title: '손주 생일 저녁', date: w.today(), time: '18:30' });
  const { member } = connect(w);
  w.service.applySharing(member.id, { SCHEDULE: 'DETAIL', CHECK_IN: 'SUMMARY' });
  assert.equal(JSON.stringify(w.service.familyView(member.id)).includes('손주 생일 저녁'), true);
  assert.equal(w.service.setSharing(member.id, 'SCHEDULE', 'NONE').ok, true);
  const view = w.service.familyView(member.id).snapshot;
  assert.deepEqual(view.items.map((i) => i.category), ['CHECK_IN']);
  assert.equal(JSON.stringify(view).includes('손주'), false);
  assert.equal(raw(w).permissions.some((p) => p.category === 'SCHEDULE'), false, 'OFF is the absence of a permission');
});

test('FC-09 members are independent: what one member sees says nothing about another', () => {
  const w = world();
  w.schedule.add({ title: '손주 생일 저녁', date: w.today(), time: '18:30' });
  const a = connect(w, '큰딸').member;
  const b = connect(w, '아들').member;
  assert.notEqual(a.id, b.id);
  assert.notEqual(a.memberUserId, b.memberUserId);
  w.service.applySharing(a.id, { SCHEDULE: 'DETAIL', MEAL: 'SUMMARY' });
  w.service.applySharing(b.id, { CHECK_IN: 'SUMMARY' });
  assert.deepEqual(w.service.familyView(a.id).snapshot.items.map((i) => i.category), ['SCHEDULE', 'MEAL']);
  assert.deepEqual(w.service.familyView(b.id).snapshot.items.map((i) => i.category), ['CHECK_IN']);
  w.service.stopSharing(a.id);
  assert.equal(w.service.levels(b.id).CHECK_IN, 'SUMMARY', "stopping one member leaves the other's settings alone");
  assert.equal(w.service.familyView(a.id).snapshot.empty, true);
  /* a permission record of member A never counts for member B */
  const s = raw(w);
  s.permissions.push({ ...s.permissions[0], id: 'fp_zzzzzzzzzzzz', memberId: b.id, memberUserId: a.memberUserId, category: 'SLEEP' });
  w.storage.set(FAMILY_COLLECTION, s);
  assert.equal(w.service.levels(b.id).SLEEP, 'NONE', 'a record whose memberUserId belongs to someone else is dropped');
});

test('FC-10 sensitive categories need a separate, explicit consent — per member and per category', () => {
  const w = world();
  const a = connect(w, '큰딸').member;
  const b = connect(w, '아들').member;
  assert.deepEqual(D.SHARING_CATEGORIES.filter((c) => c.sensitive).map((c) => c.id), ['MEDICATION', 'HEALTH', 'CHECKUP', 'EMERGENCY_INFO']);
  const refused = w.service.applySharing(a.id, { CHECK_IN: 'SUMMARY', MEDICATION: 'SUMMARY', HEALTH: 'SUMMARY' }, { consents: ['HEALTH'] });
  assert.deepEqual([refused.ok, refused.reason, refused.categories], [false, 'CONSENT_REQUIRED', ['MEDICATION']]);
  assert.deepEqual([...new Set(Object.values(w.service.levels(a.id)))], ['NONE'], 'all or nothing: the non-sensitive part was not saved either');
  assert.equal(w.service.setSharing(a.id, 'MEDICATION', 'SUMMARY').reason, 'CONSENT_REQUIRED');
  assert.equal(w.service.setSharing(a.id, 'MEDICATION', 'SUMMARY', { consent: true }).ok, true);
  const s = raw(w);
  assert.deepEqual(s.consents.map((c) => [c.memberId, c.category, c.status]), [[a.id, 'MEDICATION', 'GRANTED']]);
  /* consent for one member is not consent for another, and consent for one category is not consent for another */
  assert.equal(w.service.setSharing(b.id, 'MEDICATION', 'SUMMARY').reason, 'CONSENT_REQUIRED');
  assert.equal(w.service.setSharing(a.id, 'HEALTH', 'SUMMARY').reason, 'CONSENT_REQUIRED');
  /* turning it off withdraws the consent: turning it on again asks again */
  assert.equal(w.service.setSharing(a.id, 'MEDICATION', 'NONE').ok, true);
  assert.equal(raw(w).consents[0].status, 'WITHDRAWN');
  assert.equal(w.service.setSharing(a.id, 'MEDICATION', 'SUMMARY').reason, 'CONSENT_REQUIRED');
  /* the engine itself: a sensitive permission with no standing consent is NONE */
  const forged = raw(w);
  forged.permissions.push({ id: 'fp_zzzzzzzzzzzz', familyGroupId: forged.group.id, ownerUserId: forged.group.ownerUserId, memberId: a.id, memberUserId: a.memberUserId, category: 'HEALTH', level: 'SUMMARY', createdAt: 1, updatedAt: 1 });
  assert.equal(P.effectiveLevel(forged, a.id, 'HEALTH'), 'NONE');
  assert.equal(P.canView(forged, a.id, { category: 'HEALTH' }), false);
});

test('FC-11 preview comes from the permission model and matches the family view exactly', () => {
  const w = world();
  const { member } = connect(w);
  w.service.applySharing(member.id, { CHECK_IN: 'DETAIL', MEDICATION: 'SUMMARY', SLEEP: 'SUMMARY' }, { consents: ['MEDICATION'] });
  const saved = w.service.previewFor(member.id);
  assert.equal(saved.saved, true);
  assert.deepEqual(saved.shared.map((x) => [x.id, x.level]), [['CHECK_IN', 'DETAIL'], ['MEDICATION', 'SUMMARY'], ['SLEEP', 'SUMMARY']]);
  assert.deepEqual(saved.shared.map((x) => x.id), w.service.familyView(member.id).snapshot.items.map((i) => i.category));
  assert.equal(saved.shared.length + saved.notShared.length, D.SHARING_CATEGORIES.length);
  assert.equal(saved.shared.every((x) => x.text && x.levelLabel && x.needsConsent === false), true);
  assert.ok(saved.never.length > 0, 'what is never shared is listed too');
  /* a draft shows what WOULD be shared, flags the consent it needs, and saves nothing */
  const draft = w.service.previewFor(member.id, { CHECK_IN: 'NONE', HEALTH: 'SUMMARY', SLEEP: 'BOGUS' });
  assert.equal(draft.saved, false);
  assert.deepEqual(draft.shared.map((x) => x.id), ['MEDICATION', 'HEALTH']);
  assert.equal(draft.shared.find((x) => x.id === 'HEALTH').needsConsent, true);
  assert.equal(draft.shared.find((x) => x.id === 'MEDICATION').needsConsent, false);
  assert.equal(w.service.levels(member.id).CHECK_IN, 'DETAIL');
  /* every label in the preview is the category's own: no second, hand-written list in the screen */
  for (const x of [...saved.shared, ...saved.notShared]) assert.equal(x.label, D.sharingCategory(x.id).label);
  assert.match(VIEW, /service\.previewFor\(/);
  assert.equal(w.service.previewFor('fm_aaaaaaaaaaaa').reason, 'MEMBER_NOT_CONNECTED');
});

test('FC-12 revoke: per item, per member, and everything at once — the connection stays', () => {
  const w = world();
  const a = connect(w, '큰딸').member;
  const b = connect(w, '아들').member;
  w.service.applySharing(a.id, { CHECK_IN: 'DETAIL', MEDICATION: 'SUMMARY' }, { consents: ['MEDICATION'] });
  w.service.applySharing(b.id, { MEAL: 'DETAIL', HEALTH: 'SUMMARY' }, { consents: ['HEALTH'] });
  w.service.setSharing(a.id, 'CHECK_IN', 'NONE');
  assert.deepEqual([w.service.levels(a.id).CHECK_IN, w.service.levels(a.id).MEDICATION], ['NONE', 'SUMMARY']);
  assert.equal(w.service.stopSharing(a.id).ok, true);
  assert.deepEqual([...new Set(Object.values(w.service.levels(a.id)))], ['NONE']);
  assert.equal(w.service.levels(b.id).MEAL, 'DETAIL');
  assert.ok(w.service.member(a.id), '공유 중단 is not 연결 해제');
  assert.equal(w.service.stopAllSharing().ok, true);
  assert.deepEqual([...new Set(Object.values(w.service.levels(b.id)))], ['NONE']);
  const s = raw(w);
  assert.equal(s.permissions.length, 0);
  assert.equal(s.consents.every((c) => c.status === 'WITHDRAWN' && c.withdrawnAt > 0), true);
  assert.equal(w.service.connectedCount(), 2);
  assert.equal(w.service.stopSharing('fm_aaaaaaaaaaaa').reason, 'MEMBER_NOT_CONNECTED');
  /* the screen names the two actions differently and asks before either */
  assert.match(VIEW, /'공유 중단'/);
  assert.match(VIEW, /'연결 해제'/);
  assert.match(VIEW, /연결은 그대로/);
});

test('FC-13 disconnect a member: sharing off, consents withdrawn, open requests cancelled', () => {
  const w = world();
  const a = connect(w, '큰딸').member;
  const b = connect(w, '아들').member;
  w.service.applySharing(a.id, { HELP_REQUEST: 'DETAIL', MEDICATION: 'SUMMARY' }, { consents: ['MEDICATION'] });
  w.service.applySharing(b.id, { CHECK_IN: 'SUMMARY' });
  const req = w.service.requestHelp({ memberId: a.id, kind: 'shopping' }).request;
  assert.equal(w.service.disconnect(a.id).ok, true);
  const s = raw(w);
  const stored = s.members.find((m) => m.id === a.id);
  assert.deepEqual([stored.status, stored.disconnectedAt > 0], ['DISCONNECTED', true]);
  assert.equal(s.connections.find((c) => c.memberId === a.id).status, 'DISCONNECTED');
  assert.equal(s.permissions.some((p) => p.memberId === a.id), false);
  assert.equal(s.consents.filter((c) => c.memberId === a.id).every((c) => c.status === 'WITHDRAWN'), true);
  assert.equal(w.service.requests().find((r) => r.id === req.id).status, 'CANCELLED');
  const o = w.service.overview();
  assert.deepEqual([o.connected.map((m) => m.id), o.disconnected.map((m) => m.id)], [[b.id], [a.id]]);
  assert.equal(w.service.levels(b.id).CHECK_IN, 'SUMMARY');
  assert.equal(w.service.disconnect(a.id).reason, 'MEMBER_NOT_CONNECTED');
});

test('FC-14 a disconnected member is denied everywhere, and cannot be re-opened by an old record', () => {
  const w = world();
  w.checkIn.save({ status: 'good' }, w.today());
  const { member, code } = connect(w);
  w.service.applySharing(member.id, { CHECK_IN: 'DETAIL', HELP_REQUEST: 'DETAIL' });
  const req = w.service.requestHelp({ memberId: member.id, kind: 'call' }).request;
  const before = raw(w);
  w.service.disconnect(member.id);
  assert.equal(w.service.familyView(member.id).reason, 'ACCESS_DENIED');
  assert.equal('snapshot' in w.service.familyView(member.id), false);
  assert.equal(w.service.member(member.id), null);
  assert.equal(w.service.previewFor(member.id).reason, 'MEMBER_NOT_CONNECTED');
  assert.equal(w.service.setSharing(member.id, 'CHECK_IN', 'SUMMARY').reason, 'MEMBER_NOT_CONNECTED');
  assert.equal(w.service.requestHelp({ memberId: member.id, kind: 'call' }).reason, 'MEMBER_NOT_CONNECTED');
  assert.equal(w.service.respondHelp(member.id, req.id, 'SEEN').reason, 'NOT_ALLOWED');
  assert.equal(w.service.acceptInvitation(code).reason, 'ACCEPTED', 'the old code does not reconnect');
  /* old permission records pasted back do not help: the member is not ACTIVE */
  const s = raw(w);
  s.permissions = before.permissions;
  w.storage.set(FAMILY_COLLECTION, s);
  assert.equal(w.service.familyView(member.id).reason, 'ACCESS_DENIED');
  assert.equal(P.effectiveLevel(s, member.id, 'CHECK_IN'), 'NONE');
  /* member ACTIVE but connection ended → still denied */
  const half = JSON.parse(JSON.stringify(before));
  half.connections[0].status = 'DISCONNECTED';
  assert.equal(P.activeMember(half, member.id), null);
  assert.equal(P.canView(half, member.id, { category: 'CHECK_IN' }), false);
});

test('FC-15 default deny: the engine says no to anything missing, unknown or malformed', () => {
  const w = world();
  const { member } = connect(w);
  w.service.setSharing(member.id, 'CHECK_IN', 'SUMMARY');
  const s = raw(w);
  assert.equal(P.canView(s, member.id, { category: 'CHECK_IN' }), true);
  assert.equal(P.canView(s, member.id, { category: 'CHECK_IN', level: 'DETAIL' }), false, 'a summary does not grant the detail');
  for (const state of [null, undefined, 'x', 7, [], {}, { group: null }, { ...s, group: null }, { ...s, members: 'x' }, { ...s, connections: [] }, { ...s, permissions: null }]) {
    assert.equal(P.canView(state, member.id, { category: 'CHECK_IN' }), false);
    assert.equal(P.effectiveLevel(state, member.id, 'CHECK_IN'), 'NONE');
    assert.equal(P.canManageFamily(state, { role: 'OWNER', userId: s.group.ownerUserId }), !!state && state.group === s.group);
  }
  for (const id of [undefined, null, '', 'fm_nobody000000', 42, {}]) assert.equal(P.canView(s, id, { category: 'CHECK_IN' }), false);
  for (const res of [undefined, null, 'CHECK_IN', {}, { category: 'DIARY' }, { category: '__proto__' }, { category: 'SCHEDULE' }]) assert.equal(P.canView(s, member.id, res), false);
  /* only the owner manages: a member's role or id never passes */
  for (const actor of [null, {}, { role: 'FAMILY', userId: s.group.ownerUserId }, { role: 'OWNER', userId: member.memberUserId }, { role: 'CAREGIVER', userId: member.memberUserId }]) {
    assert.equal(P.canManageFamily(s, actor), false);
    assert.equal(P.canShare(s, actor, member.id, 'MEAL', 'SUMMARY').reason, 'NOT_OWNER');
  }
  assert.deepEqual(Object.values(P.levelsFor(null, member.id)).every((l) => l === 'NONE'), true);
});

test('FC-16 corrupted permission data denies instead of guessing', () => {
  const w = world();
  w.medication.add({ name: '혈압약', time: '08:00' });
  const { member } = connect(w);
  w.service.applySharing(member.id, { CHECK_IN: 'DETAIL', MEDICATION: 'SUMMARY' }, { consents: ['MEDICATION'] });
  const good = JSON.stringify(raw(w));
  const mutate = (fn) => { const s = JSON.parse(good); fn(s); w.storage.set(FAMILY_COLLECTION, s); return w.service.levels(member.id); };
  /* two records for the same member and category: neither counts */
  assert.equal(mutate((s) => s.permissions.push({ ...s.permissions.find((p) => p.category === 'CHECK_IN'), id: 'fp_zzzzzzzzzzzz', level: 'SUMMARY' })).CHECK_IN, 'NONE');
  /* a level the category does not offer */
  assert.equal(mutate((s) => { s.permissions.find((p) => p.category === 'MEDICATION').level = 'DETAIL'; }).MEDICATION, 'NONE');
  assert.equal(mutate((s) => { s.permissions.find((p) => p.category === 'CHECK_IN').level = 'ALL'; }).CHECK_IN, 'NONE');
  /* the consent is gone, withdrawn, or doubled */
  assert.equal(mutate((s) => { s.consents = []; }).MEDICATION, 'NONE');
  assert.equal(mutate((s) => { s.consents[0].status = 'WITHDRAWN'; }).MEDICATION, 'NONE');
  assert.equal(mutate((s) => { s.consents.push({ ...s.consents[0], id: 'fs_zzzzzzzzzzzz' }); }).MEDICATION, 'NONE');
  /* a record that points at another group, owner or member */
  assert.equal(mutate((s) => { s.permissions[0].familyGroupId = 'fg_zzzzzzzzzzzz'; })[JSON.parse(good).permissions[0].category], 'NONE');
  assert.equal(mutate((s) => { s.permissions.forEach((p) => { p.memberUserId = 'member_zzzzzzzzzzzz'; }); }).CHECK_IN, 'NONE');
  /* not an object at all → no family, no access, no crash */
  for (const junk of ['garbage', 42, [], null, { group: 'x' }, { group: { id: 'bad' } }, { ...JSON.parse(good), group: { id: 'bad' } }]) {
    w.backend.setItem(`${KEY_PREFIX}${FAMILY_COLLECTION}`, JSON.stringify(junk));
    assert.equal(w.service.overview().members.length, 0);
    assert.equal(w.service.familyView(member.id).reason, 'ACCESS_DENIED');
  }
  w.backend.setItem(`${KEY_PREFIX}${FAMILY_COLLECTION}`, '{not json');
  assert.equal(w.service.overview().hasGroup, false);
  /* the untouched document still works */
  w.storage.set(FAMILY_COLLECTION, JSON.parse(good));
  assert.deepEqual([w.service.levels(member.id).CHECK_IN, w.service.levels(member.id).MEDICATION], ['DETAIL', 'SUMMARY']);
});

test('FC-17 help request: only to a connected member who is shown help requests, with truthful delivery', () => {
  const w = world();
  const { member } = connect(w);
  assert.equal(w.service.requestHelp({ memberId: member.id, kind: 'shopping' }).reason, 'SHARING_OFF');
  w.service.setSharing(member.id, 'HELP_REQUEST', 'DETAIL');
  assert.equal(w.service.requestHelp({ memberId: member.id, kind: 'spaceship' }).ok, false);
  assert.equal(w.service.requestHelp({ memberId: member.id, kind: 'other', message: '  ' }).ok, false, '"직접 작성" needs words');
  const out = w.service.requestHelp({ memberId: member.id, kind: 'other', message: '토요일에 은행에 같이 가 주세요' });
  assert.equal(out.ok, true);
  assert.deepEqual([out.request.status, out.request.kindLabel, out.request.memberId], ['REQUESTED', '직접 작성', member.id]);
  assert.deepEqual(out.delivery, { channel: 'LOCAL_IN_APP', push: false, sms: false, server: false });
  assert.deepEqual(w.service.familyView(member.id).snapshot.requests.map((r) => r.id), [out.request.id]);
  /* another member does not see it */
  const other = connect(w, '아들').member;
  w.service.setSharing(other.id, 'HELP_REQUEST', 'DETAIL');
  assert.deepEqual(w.service.familyView(other.id).snapshot.requests, []);
  assert.equal(w.service.respondHelp(other.id, out.request.id, 'ACCEPTED').reason, 'NOT_ALLOWED');
  /* the screen does not claim a message was sent */
  assert.match(VIEW, /'data-og-help-delivery': HELP_DELIVERY\.channel|data-og-help-delivery/);
  assert.doesNotMatch(VIEW, /문자를 보냈|카카오톡으로 보냈|알림을 보냈|전송했어요|전달했어요/);
});

test('FC-18 help request states: REQUESTED → SEEN → ACCEPTED → COMPLETED, CANCELLED by the owner only', () => {
  const w = world();
  const { member } = connect(w);
  w.service.setSharing(member.id, 'HELP_REQUEST', 'DETAIL');
  const make = () => w.service.requestHelp({ memberId: member.id, kind: 'call' }).request.id;
  assert.deepEqual(D.HELP_REQUEST_STATES, ['REQUESTED', 'SEEN', 'ACCEPTED', 'COMPLETED', 'CANCELLED']);
  const a = make();
  assert.equal(w.service.respondHelp(member.id, a, 'COMPLETED').reason, 'NOT_ALLOWED', 'no skipping to the end');
  assert.equal(w.service.respondHelp(member.id, a, 'CANCELLED').reason, 'NOT_ALLOWED', 'a member cannot cancel');
  assert.equal(w.service.respondHelp(member.id, a, 'DONE').reason, 'NOT_ALLOWED');
  assert.equal(w.service.respondHelp(member.id, a, 'SEEN').request.status, 'SEEN');
  assert.equal(w.service.respondHelp(member.id, a, 'REQUESTED').reason, 'NOT_ALLOWED', 'no going back');
  assert.equal(w.service.completeHelp(a).reason, 'NOT_ALLOWED', 'the owner cannot complete what nobody accepted');
  assert.equal(w.service.respondHelp(member.id, a, 'ACCEPTED').request.status, 'ACCEPTED');
  assert.equal(w.service.respondHelp(member.id, a, 'COMPLETED').request.status, 'COMPLETED');
  assert.equal(w.service.cancelHelp(a).reason, 'NOT_ALLOWED', 'a finished request stays finished');
  const b = make();
  assert.equal(w.service.removeRequest(b).reason, 'NOT_ALLOWED');
  assert.equal(w.service.cancelHelp(b).request.status, 'CANCELLED');
  assert.equal(w.service.respondHelp(member.id, b, 'ACCEPTED').reason, 'NOT_ALLOWED');
  assert.equal(w.service.familyView(member.id).snapshot.requests.some((r) => r.id === b), false, 'a cancelled request disappears from the family view');
  assert.equal(w.service.removeRequest(b).ok, true);
  const c = make();
  w.service.respondHelp(member.id, c, 'ACCEPTED');
  assert.equal(w.service.completeHelp(c).request.status, 'COMPLETED');
  /* once help requests are no longer shared with the member, the member cannot answer */
  const d = make();
  w.service.setSharing(member.id, 'HELP_REQUEST', 'NONE');
  assert.equal(w.service.respondHelp(member.id, d, 'SEEN').reason, 'NOT_ALLOWED');
  assert.deepEqual(w.service.familyView(member.id).snapshot.requests, []);
  assert.equal(w.service.cancelHelp('fr_doesnotexist00').reason, 'NOT_FOUND');
  for (const s of D.HELP_REQUEST_STATES) assert.ok(D.HELP_STATE_LABELS[s]);
});

test('FC-19 activity log: every change is recorded, newest first, with who did it', () => {
  const w = world();
  const { member } = connect(w);
  w.service.applySharing(member.id, { CHECK_IN: 'SUMMARY', HELP_REQUEST: 'DETAIL', MEDICATION: 'SUMMARY' }, { consents: ['MEDICATION'] });
  const req = w.service.requestHelp({ memberId: member.id, kind: 'call' }).request;
  w.service.respondHelp(member.id, req.id, 'ACCEPTED');
  w.service.stopSharing(member.id);
  w.service.disconnect(member.id);
  const log = w.service.activity();
  const actions = log.map((a) => a.action);
  for (const a of ['INVITE_CREATED', 'INVITE_ACCEPTED', 'SHARING_CHANGED', 'CONSENT_GIVEN', 'HELP_REQUESTED', 'HELP_STATUS_CHANGED', 'SHARING_STOPPED', 'DISCONNECTED']) assert.ok(actions.includes(a), a);
  assert.deepEqual([actions[0], actions[actions.length - 1]], ['DISCONNECTED', 'INVITE_CREATED']);
  assert.equal(log.every((a, i) => i === 0 || log[i - 1].at >= a.at), true);
  assert.equal(log.find((a) => a.action === 'INVITE_ACCEPTED').actor, 'MEMBER');
  assert.equal(log.find((a) => a.action === 'HELP_STATUS_CHANGED').actor, 'MEMBER');
  assert.equal(log.find((a) => a.action === 'DISCONNECTED').memberName, '큰딸');
  const changed = log.filter((a) => a.action === 'SHARING_CHANGED');
  assert.deepEqual(changed.map((a) => [a.category, a.level]).sort(), [['CHECK_IN', 'SUMMARY'], ['HELP_REQUEST', 'DETAIL'], ['MEDICATION', 'SUMMARY']]);
  for (const a of actions) assert.ok(D.ACTIVITY_ACTIONS[a], `${a} has a sentence for the screen`);
  /* the log is bounded */
  for (let i = 0; i < 130; i += 1) { const made = w.service.createInvitation({ displayName: '가' }); w.service.revokeInvitation(made.invitation.id); }
  assert.equal(w.service.activity().length, D.FAMILY_LIMITS.activity);
  assert.ok(raw(w).invitations.length <= D.FAMILY_LIMITS.invitations);
});

test('FC-20 the activity log never holds a shared value, a message or a code', () => {
  const w = world();
  w.checkIn.save({ status: 'good' }, w.today());
  w.schedule.add({ title: '손주 생일 저녁', date: w.today(), time: '18:30' });
  w.medication.add({ name: '혈압약', time: '08:00' });
  const { member, code } = connect(w);
  w.service.applySharing(member.id, { CHECK_IN: 'DETAIL', SCHEDULE: 'DETAIL', MEDICATION: 'SUMMARY', HELP_REQUEST: 'DETAIL' }, { consents: ['MEDICATION'] });
  w.service.requestHelp({ memberId: member.id, kind: 'other', message: '토요일에 은행에 같이 가 주세요' });
  w.service.familyView(member.id);
  const stored = JSON.stringify(raw(w).activity);
  const shown = JSON.stringify(w.service.activity());
  for (const secret of [code, D.formatInvitationCode(code), '손주', '혈압약', '은행', '18:30', 'good']) {
    assert.equal(stored.includes(secret), false, `stored log leaks ${secret === code ? 'the code' : secret}`);
    assert.equal(shown.includes(secret), false);
  }
  const allowed = ['schemaVersion', 'id', 'familyGroupId', 'ownerUserId', 'action', 'actor', 'memberId', 'category', 'level', 'status', 'createdAt', 'updatedAt'];
  for (const entry of raw(w).activity) for (const key of Object.keys(entry)) assert.ok(allowed.includes(key), `unexpected log field ${key}`);
  /* a forged log entry with extra fields loses them on the way in */
  const s = raw(w);
  s.activity[0] = { ...s.activity[0], message: '혈압약', code };
  w.storage.set(FAMILY_COLLECTION, s);
  assert.equal(JSON.stringify(w.repository.load().activity).includes('혈압약'), false);
});

test('FC-21 invitation codes are cryptographically random, unambiguous and unique', () => {
  const codes = new Set();
  for (let i = 0; i < 500; i += 1) codes.add(D.makeInvitationCode());
  assert.equal(codes.size, 500);
  for (const c of codes) assert.match(c, /^[23456789A-HJ-NP-Z]{20}$/);
  assert.equal(D.INVITE_ALPHABET.length, 32, '5 bits per character, no modulo bias');
  assert.equal(D.INVITATION_CODE_LENGTH * 5, 100, '100 bits');
  assert.doesNotMatch(D.INVITE_ALPHABET, /[01OI]/, 'no look-alike characters');
  /* every character position uses the whole alphabet */
  const seen = new Set([...codes].flatMap((c) => [...c]));
  assert.equal(seen.size, 32);
  /* the bytes come from the injected secure source, and only from it */
  let asked = 0;
  const fixed = D.makeInvitationCode((n) => { asked += n; return new Uint8Array(n).fill(33); });
  assert.ok(asked >= 20);
  assert.equal(fixed, D.INVITE_ALPHABET[33 % 32].repeat(20));
  const domain = strip(read('js', 'family-domain.js'));
  assert.match(domain, /getRandomValues/);
  assert.match(domain, /NO_SECURE_RANDOM/);
  for (const f of FAMILY_MODULES) assert.doesNotMatch(strip(read('js', f)), /Math\.random|Date\.now\(\)\.toString\(36\)/, f);
  /* ids are random too, and a code tells nothing about an id */
  const ids = new Set();
  for (let i = 0; i < 200; i += 1) ids.add(D.makeId('fm'));
  assert.equal(ids.size, 200);
  /* parsing: anything that is not exactly 20 allowed characters is no code */
  for (const bad of ['', null, 42, 'ABCDE', 'O'.repeat(20), '1'.repeat(20), `${'A'.repeat(20)}A`, '<script>'.repeat(3)]) assert.equal(D.parseInvitationCode(bad), '', String(bad));
});

test('FC-22 codes are never logged, never put in a URL, never sent anywhere, never counted', () => {
  for (const f of FAMILY_MODULES) {
    const src = strip(read('js', f));
    assert.doesNotMatch(src, /console\.(log|info|warn|error|debug)/, `${f} logs`);
    assert.doesNotMatch(src, /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/, `${f} talks to a network`);
    assert.doesNotMatch(src, /location\.(href|hash|search|assign|replace)|URLSearchParams|history\.(push|replace)State/, `${f} touches the URL`);
    assert.doesNotMatch(src, /navigator\.clipboard|document\.cookie|sessionStorage|localStorage/, `${f} uses a side channel`);
    assert.doesNotMatch(src, /analytics|instrument|track\(/i, `${f} reports to analytics`);
  }
  const app = strip(read('js', 'app.js'));
  assert.match(app, /const familyConnect = createFamilyService\(\{ repository: selectFamilyRepository\(\{ storage \}\)/);
  assert.doesNotMatch(app, /instrument\.[A-Za-z]+\(\s*familyConnect|instrument\.[A-Za-z]+\(createFamilyService/);
  assert.doesNotMatch(app, /window\.Ongil\s*=\s*\{[^}]*familyConnect/s, 'the service is not put on the page handle');
  /* the family document is PRIVATE: never synced, never searched */
  assert.ok(COLLECTIONS.includes('family'));
  assert.equal(classOf('family'), 'PRIVATE');
  assert.equal(maySync('family'), false);
  assert.equal(maySearchGlobally('family'), false);
  /* the code lives in the family document only */
  const w = world();
  const { code } = connect(w);
  const made = w.service.createInvitation({ displayName: '아들' });
  for (const key of w.backend.keys ? w.backend.keys() : []) if (key !== `${KEY_PREFIX}family`) assert.equal(String(w.backend.getItem(key)).includes(made.code), false);
  assert.equal(JSON.stringify(w.service.overview()).includes(made.code), false, 'the overview carries no code');
  assert.equal(JSON.stringify(w.service.overview()).includes(code), false);
  assert.equal(JSON.stringify(w.service.inspectInvitation(made.code)).includes(made.code), false);
});

test('FC-23 the family view refuses anyone who is not a connected member', () => {
  const w = world();
  w.checkIn.save({ status: 'good' }, w.today());
  const { member } = connect(w);
  w.service.setSharing(member.id, 'CHECK_IN', 'DETAIL');
  const s = raw(w);
  for (const who of [undefined, null, '', 'fm_aaaaaaaaaaaa', s.group.ownerUserId, member.memberUserId, s.group.id, s.invitations[0].id, { id: member.id }, [member.id]]) {
    const out = w.service.familyView(who);
    assert.deepEqual(out, { ok: false, reason: 'ACCESS_DENIED' }, 'a refusal says nothing else');
  }
  /* an invitation that was not accepted gives no access */
  const pending = w.service.createInvitation({ displayName: '아들' });
  assert.equal(w.service.familyView(pending.invitation.id).reason, 'ACCESS_DENIED');
  assert.equal(w.service.overview().members.length, 1);
  /* the filtering is in the service, not in the screen: the screen receives only the snapshot */
  assert.match(VIEW, /service\.familyView\(/);
  assert.doesNotMatch(VIEW, /sources\.|checkIn\.get|medication\.list|schedule\.list|storage\.get/);
  assert.doesNotMatch(VIEW, /blur|filter:\s*blur|og-locked|잠긴 정보|가려진/);
});

test('FC-24 health: only the fact that something was written — never the values — and only with consent', () => {
  const w = world();
  w.checkIn.save({ status: 'good', body: 'tired', pain: 'yes' }, w.today());
  const { member } = connect(w);
  w.service.applySharing(member.id, { CHECK_IN: 'DETAIL', SCHEDULE: 'DETAIL' });
  w.schedule.add({ title: '내과 진료 김원장', date: w.today(), time: '14:00', kind: 'MEDICAL_APPOINTMENT' });
  w.schedule.add({ title: '손주 생일 저녁', date: w.today(), time: '18:30' });
  let view = w.service.familyView(member.id).snapshot;
  assert.equal(view.items.some((i) => i.category === 'HEALTH' || i.category === 'CHECKUP'), false);
  assert.equal(JSON.stringify(view).includes('내과'), false, 'a hospital visit is not an ordinary schedule item');
  assert.equal(JSON.stringify(view).includes('손주 생일 저녁'), true);
  w.service.applySharing(member.id, { HEALTH: 'SUMMARY', CHECKUP: 'DETAIL' }, { consents: ['HEALTH', 'CHECKUP'] });
  view = w.service.familyView(member.id).snapshot;
  assert.deepEqual(view.items.find((i) => i.category === 'HEALTH').lines, ['오늘 몸 상태를 적었어요.']);
  const checkup = view.items.find((i) => i.category === 'CHECKUP').lines.join(' ');
  assert.equal(/내과|김원장/.test(checkup), false, 'a date and the kind of visit — not the title');
  assert.equal(D.levelAllowed('HEALTH', 'DETAIL'), false, 'there is no detailed health sharing in V1');
  /* nothing in the snapshot reads as a judgement about safety or health */
  assert.doesNotMatch(JSON.stringify(view), /안전|이상 없|정상|위험|괜찮|피곤|tired|yes/);
  const texts = strip(read('js', 'family-service.js')) + VIEW + strip(read('js', 'family-domain.js'));
  assert.doesNotMatch(texts, /안전 확인 완료|현재 안전함|안전합니다|건강 이상 없음|이상 없어요|감시/);
});

test('FC-25 medication: a count only — no names, no times — and gone the moment consent is withdrawn', () => {
  const w = world();
  w.medication.add({ name: '혈압약', time: '08:00' });
  w.medication.add({ name: '당뇨약', time: '19:00' });
  const { member } = connect(w);
  w.service.applySharing(member.id, { CHECK_IN: 'SUMMARY' });
  assert.equal(w.service.familyView(member.id).snapshot.items.some((i) => i.category === 'MEDICATION'), false);
  w.service.setSharing(member.id, 'MEDICATION', 'SUMMARY', { consent: true });
  const item = w.service.familyView(member.id).snapshot.items.find((i) => i.category === 'MEDICATION');
  assert.deepEqual(item.lines, ['오늘 먹을 약 2개 가운데 0개를 먹었다고 표시했어요.']);
  assert.equal(/혈압약|당뇨약|08:00|19:00|오전|오후/.test(JSON.stringify(item)), false);
  assert.equal(D.levelAllowed('MEDICATION', 'DETAIL'), false);
  /* withdraw the consent record alone: the permission record is still there but shows nothing */
  const s = raw(w);
  s.consents.find((c) => c.category === 'MEDICATION').status = 'WITHDRAWN';
  w.storage.set(FAMILY_COLLECTION, s);
  assert.equal(w.service.familyView(member.id).snapshot.items.some((i) => i.category === 'MEDICATION'), false);
  /* emergency contacts: how many, never who or which number */
  w.extra.contacts = 2;
  w.service.setSharing(member.id, 'EMERGENCY_INFO', 'SUMMARY', { consent: true });
  assert.deepEqual(w.service.familyView(member.id).snapshot.items.find((i) => i.category === 'EMERGENCY_INFO').lines, ['긴급 연락처 2명을 적어 두었어요.']);
});

test('FC-26 empty states: no family, nothing shared, no requests, no activity — each says so plainly', () => {
  assert.match(VIEW, /아직 연결된 가족이 없어요/);
  assert.match(VIEW, /data-og-preview-shared': 'none'|'data-og-preview-shared': 'none'/);
  assert.match(VIEW, /부탁한 도움 요청이 없어요/);
  assert.match(VIEW, /card\.root\.hidden = !all\.length/, 'with no activity the record card is not shown at all');
  assert.match(VIEW, /data-og-family-help': 'sharing-off'|'data-og-family-help': 'sharing-off'/);
  const w = world();
  const { member } = connect(w);
  const view = w.service.familyView(member.id).snapshot;
  assert.equal(view.empty, true);
  /* shared but nothing written today: a plain sentence, not an empty box and not a guess */
  w.service.applySharing(member.id, { CHECK_IN: 'DETAIL', SCHEDULE: 'DETAIL', MEAL: 'DETAIL', SLEEP: 'DETAIL', ACTIVITY: 'DETAIL' });
  const lines = w.service.familyView(member.id).snapshot.items.flatMap((i) => i.lines);
  assert.equal(lines.length, 5);
  assert.equal(lines.every((l) => /않았어요|없어요/.test(l)), true);
  assert.equal(lines.some((l) => /undefined|null|NaN/.test(l)), false);
});

test('FC-27 ended invitations are shown as what they are: expired, cancelled, declined', () => {
  assert.match(VIEW, /EXPIRED: '초대 기간이 끝났어요'/);
  assert.match(VIEW, /REVOKED: '취소한 초대'/);
  assert.match(VIEW, /DECLINED: '받지 않은 초대'/);
  assert.match(VIEW, /data-og-family-invite-state/);
  const w = world();
  const a = w.service.createInvitation({ displayName: '큰딸', expiry: '1d' });
  const b = w.service.createInvitation({ displayName: '아들' });
  const c = w.service.createInvitation({ displayName: '동생' });
  w.service.revokeInvitation(b.invitation.id);
  w.service.declineInvitation(c.code);
  w.clock.t += 2 * DAY;
  w.service.refresh();
  const by = Object.fromEntries(w.service.overview().invitations.map((i) => [i.displayName, i.status]));
  assert.deepEqual(by, { 큰딸: 'EXPIRED', 아들: 'REVOKED', 동생: 'DECLINED' });
  assert.equal(w.service.overview().pending.length, 0);
  assert.equal(w.service.invitationCode(a.invitation.id), '', 'an ended invitation no longer shows its code');
  /* the person entering an old code is told why, in plain words */
  for (const reason of ['INVALID_CODE', 'NOT_FOUND', 'EXPIRED', 'REVOKED', 'ACCEPTED', 'DECLINED']) assert.match(VIEW, new RegExp(`${reason}: '[^']*[가-힣]`), reason);
});

test('FC-28 accessibility: labels, announced status, associated errors, keyboard and focus', () => {
  assert.match(VIEW, /role: 'alert'/);
  assert.match(VIEW, /'aria-invalid'/);
  assert.match(VIEW, /'aria-describedby'/);
  assert.match(VIEW, /'aria-expanded'/);
  assert.match(VIEW, /role: 'group'/);
  assert.match(VIEW, /'aria-label'/);
  assert.match(VIEW, /makeField\(/, 'fields are built with the shared labelled field');
  assert.match(VIEW, /el\('fieldset'|el\('legend'/, 'radio groups are fieldsets with a legend');
  assert.match(VIEW, /Escape/);
  assert.match(VIEW, /focusLater\(|\.focus\(/);
  assert.match(VIEW, /data-og-focus/);
  /* status is announced through the card's live region, not by colour */
  assert.match(VIEW, /\.announce\(|say\(/);
  /* only real controls are clickable; no div buttons, no positive tabindex, no mouse-only handlers */
  assert.doesNotMatch(VIEW, /el\('(div|span|li|p)',\s*\{[^}]*onclick/);
  assert.doesNotMatch(VIEW, /tabindex: ?'?[1-9]/);
  assert.doesNotMatch(VIEW, /onmouseover|onmouseenter|ondblclick|title: /);
  /* destructive actions ask first, and the question names the member */
  assert.match(VIEW, /data-og-family-confirm/);
  assert.match(VIEW, /연결을 해제할까요\?/);
  /* no developer words reach the screen */
  const quoted = VIEW.match(/'[^'\n]*[가-힣][^'\n]*'|`[^`\n]*[가-힣][^`\n]*`/g) || [];
  assert.ok(quoted.length > 60);
  for (const q of quoted) assert.doesNotMatch(q.replace(/\$\{[^}]*\}/g, ''), /ACL|permission|authorization|token|LOCAL|ACCOUNT_REQUIRED|SUMMARY|DETAIL|REQUESTED|권한 엔진/i, q);
});

test('FC-29 responsive: the family screen adds no layout of its own beyond one wrapping rule', () => {
  const css = read('styles', 'ongil-care.css');
  const rule = css.match(/\.og-band \.og-family-code \{[^}]*\}/);
  assert.ok(rule, 'the code line has its rule');
  assert.match(rule[0], /overflow-wrap: anywhere/, 'a 23-character code wraps at 320px instead of overflowing');
  assert.doesNotMatch(rule[0], /width|white-space: nowrap|position|color|background|font-family/);
  /* design freeze: Family V1 added no colour, font, shadow or fixed size anywhere */
  const added = css.split('\n').filter((l) => /og-family-code/.test(l)).join('\n');
  assert.doesNotMatch(added, /#[0-9a-f]{3,8}\b|rgb\(|font-family|box-shadow|\d+px/i);
  /* the screen is built from existing ONGIL pieces: no inline styles, no new stylesheet, no new class families */
  assert.doesNotMatch(VIEW, /\.style\.|style: |cssText|insertRule|createElement\('style'\)/);
  const classes = new Set((VIEW.match(/og-[a-z0-9_-]+/g) || []).filter((c) => !c.startsWith('og-family-') && !/^og-(member|preview|view|request|help|consent|focus|state)\b/.test(c)));
  const allCss = fs.readdirSync(path.join(ROOT, 'ongil-start', 'styles')).map((f) => read('styles', f)).join('\n');
  for (const c of classes) if (!/^og-(family|member|preview|view|request|help|focus)/.test(c)) assert.ok(allCss.includes(`.${c}`), `class ${c} exists in ONGIL's stylesheets`);
  assert.doesNotMatch(read('index.html'), /family-connect\.css|family\.css/i);
});

test('FC-30 persistence: everything survives a restart, a failed write changes nothing, erase removes it', () => {
  const w = world();
  const { member } = connect(w);
  w.service.applySharing(member.id, { CHECK_IN: 'DETAIL', HELP_REQUEST: 'DETAIL', MEDICATION: 'SUMMARY' }, { consents: ['MEDICATION'] });
  const req = w.service.requestHelp({ memberId: member.id, kind: 'shopping' }).request;
  const pending = w.service.createInvitation({ displayName: '아들' });
  /* a new service over the same device storage: the same family */
  const storage2 = createStorage({ backend: w.backend, now: w.now });
  const again = createFamilyService({ repository: selectFamilyRepository({ storage: storage2, now: w.now }), sources: w.sources, now: w.now });
  assert.deepEqual(again.levels(member.id), w.service.levels(member.id));
  assert.deepEqual(again.overview(), w.service.overview());
  assert.deepEqual(again.requests().map((r) => r.id), [req.id]);
  assert.equal(again.invitationCode(pending.invitation.id), pending.code);
  assert.equal(again.activity().length, w.service.activity().length);
  /* what is stored is exactly what load() accepts: a round trip changes nothing */
  assert.deepEqual(D.normalizeFamilyState(raw(w), w.clock.t), raw(w));
  assert.deepEqual(Object.keys(raw(w)).sort(), ['activity', 'connections', 'consents', 'group', 'invitations', 'members', 'permissions', 'requests', 'schemaVersion']);
  /* a write the device refuses: the caller is told and nothing is half-changed */
  const stuck = { ...w.repository, save: () => false };
  const failing = createFamilyService({ repository: stuck, sources: w.sources, now: w.now });
  const before = JSON.stringify(raw(w));
  for (const out of [failing.createInvitation({ displayName: '동생' }), failing.setSharing(member.id, 'MEAL', 'SUMMARY'), failing.stopSharing(member.id), failing.disconnect(member.id), failing.requestHelp({ memberId: member.id, kind: 'call' }), failing.cancelHelp(req.id)]) assert.deepEqual(out, { ok: false, reason: 'STORAGE_UNAVAILABLE' });
  assert.equal(JSON.stringify(raw(w)), before);
  /* erase */
  assert.equal(w.repository.clear(), true);
  assert.equal(w.service.overview().hasGroup, false);
  assert.equal(w.service.familyView(member.id).reason, 'ACCESS_DENIED');
  assert.match(read('js', 'account-view.js'), /가족 연결과 초대, 가족에게 보여줄 정보 설정, 활동 기록도 지웁니다/);
});

test('FC-31 the remote repository is disabled: nothing is sent and nothing pretends to be connected', () => {
  const remote = createRemoteFamilyRepository();
  assert.deepEqual([remote.kind, remote.mode, remote.available], ['remote', 'ACCOUNT_REQUIRED', false]);
  for (const call of [() => remote.load(), () => remote.save({}), () => remote.clear()]) assert.throws(call, (e) => e instanceof FamilyRepositoryUnavailable && e.code === 'ACCOUNT_REQUIRED');
  const w = world();
  const chosen = selectFamilyRepository({ storage: w.storage, now: w.now });
  assert.deepEqual([chosen.kind, chosen.mode, chosen.available], ['local', 'LOCAL', true]);
  assert.equal(w.service.mode, 'LOCAL');
  assert.equal(FAMILY_REMOTE_CONTRACT.status, 'NOT_IMPLEMENTED');
  assert.equal(FAMILY_REMOTE_CONTRACT.routes.length, 12);
  assert.equal(FAMILY_REMOTE_CONTRACT.routes.every((r) => r.path.startsWith('/api/ongil/family/') && /^(GET|POST|PUT|PATCH|DELETE)$/.test(r.method) && r.who && r.does), true);
  assert.equal(fs.existsSync(path.join(ROOT, 'api', 'ongil')), false, 'no family server exists, so none is claimed');
  const repo = strip(read('js', 'family-repository.js'));
  assert.doesNotMatch(repo, /createRemoteFamilyRepository\(\)\s*[;)]?\s*$/m);
  assert.doesNotMatch(strip(read('js', 'app.js')), /createRemoteFamilyRepository/);
  /* the screen says where this works and where it does not, next to the action */
  assert.match(VIEW, /data-og-family-scope/);
  assert.match(VIEW, /이 기기 안에서만 연결돼요/);
  assert.match(VIEW, /Newon\+ 계정이 필요/);
  assert.match(VIEW, /아직 열리지 않았어요/);
  assert.doesNotMatch(VIEW, /실시간|가족에게 알렸어요|가족 휴대폰|연결 완료!|동기화했/);
});

test('FC-32 limits and input safety: names, messages and counts are bounded; markup is plain text', () => {
  const w = world();
  const long = w.service.createInvitation({ displayName: '가'.repeat(60) });
  assert.equal(long.ok && long.invitation.displayName.length <= D.FAMILY_LIMITS.name, true, 'a long name is cut to the limit, never stored whole');
  const odd = w.service.createInvitation({ displayName: '<b>딸</b>', relationship: 'nonsense', role: 'OWNER' });
  if (odd.ok) {
    assert.notEqual(odd.invitation.role, 'OWNER', 'nobody is invited as the owner');
    assert.equal(/<b>/.test(odd.invitation.displayName), false);
  }
  const { member } = connect(w, '큰딸');
  w.service.setSharing(member.id, 'HELP_REQUEST', 'DETAIL');
  const wordy = w.service.requestHelp({ memberId: member.id, kind: 'other', message: '나'.repeat(900) });
  assert.equal(wordy.ok && wordy.request.message.length <= D.FAMILY_LIMITS.message, true, 'a long message is cut to the limit');
  const marked = w.service.requestHelp({ memberId: member.id, kind: 'other', message: '<img src=x onerror=1>' });
  assert.equal(marked.ok ? typeof marked.request.message : 'string', 'string');
  for (const bad of [null, undefined, 'x', 7, []]) {
    assert.equal(w.service.createInvitation(bad).ok, false);
    assert.equal(w.service.requestHelp(bad).ok, false);
    assert.equal(w.service.applySharing(member.id, bad).ok, false);
  }
  assert.doesNotMatch(VIEW, /innerHTML|insertAdjacentHTML|outerHTML|document\.write/);
});

test('FC-33 the old "내가 공유할 내용" preference is never applied to a connected member by itself', () => {
  const view = strip(read('js', 'family-view.js'));
  assert.match(view, /connect = null/);
  assert.match(view, /createFamilyConnectView\(/);
  assert.match(view, /syncLegacy/);
  const service = strip(read('js', 'family-service.js'));
  assert.doesNotMatch(service, /familySharing|createFamilySharingStore|from '\.\/family\.js'/, 'the service does not read the old preference');
  const w = world();
  w.storage.set('familySharing', { CHECK_IN: true, MEDICATION: true, updatedAt: 1 });
  const { member } = connect(w);
  assert.deepEqual([...new Set(Object.values(w.service.levels(member.id)))], ['NONE']);
});

test('FC-34 local wording and no stale connection status: "이 기기 안에서 연결했어요"; saving or stopping sharing clears the old "아직 아무것도 공유하지 않아요" line', () => {
  /* the connect message says the connection is on this device only — never that a family phone is connected */
  assert.match(VIEW, /님과 이 기기 안에서 연결했어요\. 아직 아무것도 공유하지 않아요\./);
  assert.equal(/님과 연결했어요/.test(VIEW), false, 'no connect message without "이 기기 안에서"');
  for (const phrase of ['초대가 전송되었습니다', '초대를 보냈어요', '알림을 보냈습니다', '알림을 보냈어요', '가족이 연결되었습니다', '휴대폰에 연결']) assert.equal(VIEW.includes(phrase), false, phrase);
  /* the connection card's line is cleared only when the change really happened (r.ok) — sharing saved, one member stopped, all stopped */
  assert.match(VIEW, /if \(r\.ok\) \{ ui\.draft = null; ui\.consents = \[\]; cards\.connect\.say\(''\); \}\s*say\(card, r, `\$\{m\.displayName\}님에게 보여줄 정보를 저장했어요\.`\);/);
  assert.match(VIEW, /service\.stopSharing\(m\.id\); ui\.confirm = null; ui\.draft = null; ui\.consents = \[\]; if \(r\.ok\) cards\.connect\.say\(''\);/);
  assert.match(VIEW, /service\.stopAllSharing\(\); ui\.confirm = null; ui\.draft = null; ui\.consents = \[\]; if \(r\.ok\) cards\.connect\.say\(''\);/);
  /* a refused save (missing consent) returns before anything is cleared or announced */
  const save = VIEW.slice(VIEW.indexOf("service.applySharing(m.id, draft"), VIEW.indexOf("cards.connect.say('')"));
  assert.match(save, /CONSENT_REQUIRED[\s\S]*return;/);
});
