// ONGIL Phase 4 — Family V1: contracts, the user's own sharing choices, help requests, privacy and storage safety.
// No browser, no dependencies:  node --test tests/ongil/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage, createMemoryBackend, COLLECTIONS, KEY_PREFIX } from '../../ongil-start/js/storage.js';
import * as F from '../../ongil-start/js/family-contracts.js';
import { createFamilySharingStore, createHelpRequestStore, buildSharePreview, familyOverview, FAMILY_DELIVERY } from '../../ongil-start/js/family.js';
import { familyConnection } from '../../ongil-start/js/onboarding.js';
import { createCheckInStore } from '../../ongil-start/js/checkin.js';
import { createMedicationStore } from '../../ongil-start/js/medication.js';
import { createSymptomStore } from '../../ongil-start/js/symptoms.js';
import { createHealthNoteStore } from '../../ongil-start/js/health-notes.js';
import { createSavedStore } from '../../ongil-start/js/saved.js';
import { createAccount, SYNCABLE_COLLECTIONS, isSyncable } from '../../ongil-start/js/account.js';
import { createSearch, createAreaProvider, createSavedProvider, createCareProvider } from '../../ongil-start/js/search.js';
import { AREAS } from '../../ongil-start/js/areas.js';
import { classOf, maySync, maySearchGlobally, familySharingAllowed } from '../../ongil-start/js/privacy.js';
import { CARE_CATEGORY_IDS } from '../../ongil-start/js/care-contracts.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (...p) => fs.readFileSync(path.join(ROOT, 'ongil-start', ...p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

function world(seed) {
  const clock = { t: new Date(2026, 9, 2, 9, 0, 0).getTime() };
  const now = () => (clock.t += 1000);
  const backend = createMemoryBackend(seed);
  const storage = createStorage({ backend, now });
  return {
    clock, now, backend, storage,
    sharing: createFamilySharingStore(storage, { now }),
    help: createHelpRequestStore(storage, { now }),
    checkIn: createCheckInStore(storage, { now }),
    medication: createMedicationStore(storage, { now }),
    symptoms: createSymptomStore(storage, { now }),
    healthNotes: createHealthNoteStore(storage, { now }),
    saved: createSavedStore(storage, { now }),
  };
}
const ID = 'fc_abcdef12';

test('OG-FM-1 family model: contracts exist for connection, permission, consent, audit, shared item and help request', () => {
  const c = F.normalizeFamilyConnection({ id: ID, ownerUserId: 'owner_123456', memberUserId: 'member_12345', relationship: 'child', status: 'pending', role: 'admin' }, 1);
  assert.deepEqual(Object.keys(c).sort(), ['createdAt', 'id', 'memberUserId', 'ownerUserId', 'relationship', 'schemaVersion', 'status', 'updatedAt']);
  assert.throws(() => F.normalizeFamilyConnection({ id: ID, ownerUserId: 'same_123456', memberUserId: 'same_123456', status: 'active' }), /INVALID_MEMBER/);
  assert.throws(() => F.normalizeFamilyConnection({ id: ID, ownerUserId: 'owner_123456', memberUserId: 'member_12345', status: 'online' }), /INVALID_STATUS/);
  assert.deepEqual([...F.CONNECTION_STATUSES], ['pending', 'active', 'revoked']);
  assert.deepEqual(F.SHARE_CATEGORY_IDS, ['CHECK_IN', 'SCHEDULE', 'TASK', 'ROUTINE', 'MEDICATION', 'HEALTH', 'DAILY_LIFE', 'HELP_REQUEST']);
  assert.deepEqual(F.SHARE_LEVELS.map((l) => l.id), ['NONE', 'SUMMARY', 'DETAIL']);
  assert.equal(F.normalizeSharedItem({ id: 'si_abcdef12', type: 'PROGRAM', sourceId: 'p-1', senderConnectionId: ID }, 1).status, 'new');
  assert.equal(F.normalizeAuditEntry({ id: 'au_abcdef12', actor: ID, action: 'view', category: 'SCHEDULE', level: 'SUMMARY' }, 1).actor, ID);
  assert.deepEqual(F.HELP_CATEGORIES.map((c) => c.label), ['병원 동행', '장보기', '이동', '집안일', '기기 사용', '기타']);
});

test('OG-FM-2 no fake family: no code creates a connection, member, invitation, message or online state', () => {
  const files = fs.readdirSync(path.join(ROOT, 'ongil-start', 'js')).filter((f) => f.endsWith('.js'));
  for (const f of files) {
    const code = strip(read('js', f));
    /* Family Connection V1 — WHY: connections, members, invitations and consents are now made ON THIS DEVICE by the family service
       (mode LOCAL). BEFORE: no file but the contracts named them. AFTER: the three family-connection modules do; nothing
       is sent, no one is "online", and FAMILY_DELIVERY below is unchanged. Cross-device connection stays ACCOUNT REQUIRED. */
    if (f === 'family-contracts.js' || f === 'family-domain.js' || f === 'family-service.js') continue;
    assert.equal(/normalizeFamilyConnection\(|normalizeConsent\(|normalizeSharedItem\(|normalizeAuditEntry\(|status: 'active'|inviteCode|online: true|isOnline/.test(code), false, f);
  }
  assert.deepEqual({ ...FAMILY_DELIVERY }, { connected: false, sendsAnything: false, recipients: 0 });
  assert.equal(familyConnection().status, 'NOT_AVAILABLE');
  assert.equal(COLLECTIONS.some((c) => /connection|member|invite|consent|sharedItem|audit/i.test(c)), false);
});

test('OG-FM-3 connection empty: the overview reports no connection, only local choices', () => {
  const w = world();
  const o = familyOverview({ familyConnection, sharing: w.sharing, help: w.help });
  assert.deepEqual(o, { status: 'NOT_AVAILABLE', connected: false, chosen: 0, openRequests: 0 });
  w.sharing.set('SCHEDULE', 'SUMMARY');
  w.help.add({ category: 'shopping' });
  assert.deepEqual(familyOverview({ familyConnection, sharing: w.sharing, help: w.help }), { status: 'NOT_AVAILABLE', connected: false, chosen: 1, openRequests: 1 });
});

test('OG-FM-4 relationship model: relationships are labels only and never decide what is shared', () => {
  assert.deepEqual(F.RELATIONSHIPS.map((r) => r.label), ['배우자', '자녀', '형제·자매', '부모', '친척', '기타']);
  assert.equal(F.normalizeFamilyConnection({ id: ID, ownerUserId: 'owner_123456', memberUserId: 'member_12345', relationship: 'boss', status: 'pending' }, 1).relationship, 'other');
  /* a permission is built from connection + category + level only; a relationship input changes nothing */
  const a = F.normalizeFamilyPermission({ connectionId: ID, category: 'HEALTH', level: 'SUMMARY', relationship: 'child' }, 1);
  assert.equal('relationship' in a, false);
  const code = strip(read('js', 'family-contracts.js') + read('js', 'family.js'));
  assert.equal(/relationship\s*===|RELATIONSHIP_DEFAULTS|defaultsFor\(/.test(code), false, 'no level is derived from a relationship');
});

test('OG-FM-5 permission default private: every category starts at 공유 안 함 and nothing is stored', () => {
  const w = world();
  assert.deepEqual(Object.values(w.sharing.levels()), Array(8).fill('NONE'));
  assert.equal(w.storage.get('familySharing'), null);
  assert.equal(w.sharing.count(), 0);
  for (const c of F.SHARE_CATEGORIES) assert.equal(c.levels[0], 'NONE', c.id);
});

test('OG-FM-6 permission update: allowed levels only, unknown categories refused, reset returns to private', () => {
  const w = world();
  assert.equal(w.sharing.set('SCHEDULE', 'DETAIL').ok, true);
  assert.equal(w.sharing.set('MEDICATION', 'DETAIL').reason, 'INVALID_LEVEL', 'medication offers no detail');
  assert.equal(w.sharing.set('HELP_REQUEST', 'SUMMARY').reason, 'INVALID_LEVEL');
  assert.equal(w.sharing.set('JOURNAL', 'SUMMARY').reason, 'INVALID_CATEGORY');
  assert.equal(w.sharing.set('SCHEDULE', 'EVERYTHING').reason, 'INVALID_LEVEL');
  w.sharing.set('TASK', 'SUMMARY');
  assert.deepEqual(w.sharing.chosen(), [{ id: 'SCHEDULE', level: 'DETAIL' }, { id: 'TASK', level: 'SUMMARY' }]);
  w.sharing.set('TASK', 'NONE');
  assert.deepEqual(w.storage.get('familySharing').levels, { SCHEDULE: 'DETAIL' }, 'NONE is the absence of a choice');
  assert.equal(w.sharing.reset(), true);
  assert.equal(w.sharing.count(), 0);
});

test('OG-FM-7 health not auto shared: health-adjacent categories never offer detail, default none, and nothing reads health records', () => {
  for (const id of ['CHECK_IN', 'MEDICATION', 'HEALTH']) assert.equal(F.categoryById(id).sensitive, true, id);
  assert.deepEqual(F.categoryById('MEDICATION').levels, ['NONE', 'SUMMARY']);
  assert.deepEqual(F.categoryById('HEALTH').levels, ['NONE', 'SUMMARY']);
  const w = world();
  w.checkIn.set('hard');
  w.medication.add({ name: '비밀약' });
  w.symptoms.save({ symptoms: ['dizzy'] });
  assert.deepEqual(w.sharing.levels().HEALTH, 'NONE', 'writing health records changes no sharing choice');
  const seen = [];
  const spy = { ...w.storage, get: (c, f) => { seen.push(c); return w.storage.get(c, f); } };
  const s = createFamilySharingStore(spy);
  s.set('HEALTH', 'SUMMARY');
  buildSharePreview(s.levels());
  assert.deepEqual([...new Set(seen)], ['familySharing'], 'the family layer never reads check-ins, medication, symptoms or notes');
  const code = strip(read('js', 'family.js') + read('js', 'family-view.js'));
  assert.equal(/checkIn|medication\.|symptoms\.|healthNotes|checkins|medicationLogs/.test(code), false);
});

test('OG-FM-8 health note not shared: health notes, symptom details, journal and expenses are not categories at all', () => {
  assert.deepEqual([...F.NEVER_SHARED], ['건강 메모', '증상 내용', '기록(일기)', '생활비']);
  for (const id of ['HEALTH_NOTE', 'HEALTH_NOTES', 'SYMPTOMS', 'JOURNAL', 'EXPENSES']) assert.equal(F.categoryById(id), null, id);
  assert.match(F.categoryById('HEALTH').words.SUMMARY, /증상·메모 내용은 보이지 않아요/);
  const w = world();
  assert.equal(w.sharing.set('HEALTH_NOTE', 'SUMMARY').ok, false);
});

test('OG-FM-9 consent model: explicit, per category and grantee, never NONE, subject is the senior', () => {
  const c = F.normalizeConsent({ id: 'cs_abcdef12', subject: 'self', scope: { category: 'SCHEDULE', level: 'SUMMARY' }, grantee: ID, status: 'granted' }, 5);
  assert.deepEqual([c.status, c.revokedAt, c.scope], ['granted', null, { category: 'SCHEDULE', level: 'SUMMARY' }]);
  assert.throws(() => F.normalizeConsent({ id: 'cs_abcdef12', subject: 'family', scope: { category: 'SCHEDULE', level: 'SUMMARY' }, grantee: ID, status: 'granted' }), /INVALID_SUBJECT/);
  assert.throws(() => F.normalizeConsent({ id: 'cs_abcdef12', subject: 'self', scope: { category: 'SCHEDULE', level: 'NONE' }, grantee: ID, status: 'granted' }), /INVALID_SCOPE/);
  assert.throws(() => F.normalizeConsent({ id: 'cs_abcdef12', subject: 'self', scope: { category: 'HEALTH', level: 'DETAIL' }, grantee: ID, status: 'granted' }), /INVALID_SCOPE/);
  assert.equal(F.consentAllows(c, 'SCHEDULE', 'SUMMARY'), true);
  assert.equal(F.consentAllows(c, 'SCHEDULE', 'DETAIL'), false, 'never more than consented');
  assert.equal(F.consentAllows(c, 'TASK', 'SUMMARY'), false, 'never another category');
  assert.equal(F.consentAllows(null, 'SCHEDULE', 'SUMMARY'), false);
});

test('OG-FM-10 revoke model: revocation is immediate, one-way and keeps the record', () => {
  const c = F.normalizeConsent({ id: 'cs_abcdef12', subject: 'self', scope: { category: 'CHECK_IN', level: 'DETAIL' }, grantee: ID, status: 'granted', createdAt: 5 }, 5);
  const r = F.revokeConsent(c, 99);
  assert.deepEqual([r.status, r.revokedAt, r.createdAt, r.scope.category], ['revoked', 99, 5, 'CHECK_IN']);
  assert.equal(F.consentAllows(r, 'CHECK_IN', 'SUMMARY'), false, 'revoked = nothing visible');
  assert.equal(F.revokeConsent(r, 200).revokedAt, 99, 'revoking again changes nothing');
  assert.equal(typeof F.reactivateConsent, 'undefined', 'there is no way back: sharing again needs a new consent');
});

test('OG-FM-11 share preview: words for the chosen levels only, never data, never "delivered"', () => {
  const w = world();
  assert.deepEqual(buildSharePreview(w.sharing.levels()), { items: [], empty: true, delivered: false, recipients: 0 });
  w.checkIn.set('hard');
  w.sharing.set('CHECK_IN', 'SUMMARY');
  w.sharing.set('SCHEDULE', 'DETAIL');
  const p = buildSharePreview(w.sharing.levels());
  assert.deepEqual(p.items.map((i) => [i.id, i.text]), [['CHECK_IN', '오늘 안부를 남겼는지만'], ['SCHEDULE', '일정 이름과 시간']]);
  assert.equal(JSON.stringify(p).includes('조금 힘들어요'), false, 'the preview never contains the user\'s records');
  assert.equal(p.delivered, false);
  assert.deepEqual(buildSharePreview({ MEDICATION: 'DETAIL' }).items, [], 'a level a category does not offer is not previewed');
});

test('OG-FM-12 shared item empty: nothing can be "received"; there is no store and the contract refuses bad input', () => {
  assert.equal(COLLECTIONS.some((c) => /shared|received|inbox/i.test(c)), false);
  assert.throws(() => F.normalizeSharedItem({ id: 'si_abcdef12', type: 'MONEY', sourceId: 'x', senderConnectionId: ID }), /INVALID_TYPE/);
  assert.throws(() => F.normalizeSharedItem({ id: 'si_abcdef12', type: 'PLACE', sourceId: '<b>', senderConnectionId: ID }), /INVALID_SOURCE/);
  assert.deepEqual(F.SHARED_ITEM_TYPES.map((t) => t.id), ['PROGRAM', 'PLACE', 'SERVICE', 'PRODUCT', 'SCHEDULE']);
});

test('OG-FM-13 help request create: category required, message optional and bounded, kept as a draft', () => {
  const w = world();
  const r = w.help.add({ category: 'hospital-escort', message: '  다음 주 화요일 병원에 같이 가 주세요\r\n\r\n\r\n오전 10시  ' });
  assert.equal(r.ok, true);
  assert.deepEqual([r.request.status, r.request.message, r.request.resolvedAt], ['draft', '다음 주 화요일 병원에 같이 가 주세요\n\n오전 10시', null]);
  assert.equal(w.help.add({ category: 'emergency' }).reason, 'INVALID_CATEGORY');
  assert.equal(w.help.add({ category: 'other', message: 'x'.repeat(900) }).request.message.length, F.HELP_LIMITS.message);
  assert.equal(w.help.add({ category: 'shopping' }).ok, true, 'a message is optional');
  assert.equal(w.help.openCount(), 3);
});

test('OG-FM-14 help request edit: category and message change; resolve and reopen locally', () => {
  const w = world();
  const r = w.help.add({ category: 'shopping', message: '우유' }).request;
  assert.equal(w.help.update(r.id, { message: '우유와 계란', category: 'mobility' }).request.message, '우유와 계란');
  assert.equal(w.help.list()[0].category, 'mobility');
  assert.equal(w.help.update(r.id, { category: 'nope' }).reason, 'INVALID_CATEGORY');
  assert.equal(w.help.setResolved(r.id, true).request.status, 'resolved');
  assert.ok(w.help.list()[0].resolvedAt > 0);
  assert.equal(w.help.openCount(), 0);
  assert.equal(w.help.setResolved(r.id, false).request.resolvedAt, null);
  assert.equal(w.help.update('hr_missing0001', {}).reason, 'NOT_FOUND');
});

test('OG-FM-15 help request delete: one goes, the others stay', () => {
  const w = world();
  const a = w.help.add({ category: 'shopping' }).request;
  w.help.add({ category: 'device' });
  assert.equal(w.help.remove(a.id).ok, true);
  assert.deepEqual(w.help.list().map((r) => r.category), ['device']);
  assert.equal(w.help.remove(a.id).reason, 'NOT_FOUND');
});

test('OG-FM-16 help request not sent: no status says sent, nothing leaves the device, a stored "sent" reads as draft', () => {
  const w = world();
  const seen = [];
  w.storage.subscribe((c) => seen.push(c.collection));
  w.help.add({ category: 'hospital-escort' });
  assert.deepEqual(seen, ['helpRequests'], 'one local write and nothing else');
  assert.deepEqual([...F.HELP_LOCAL_STATUSES], ['draft', 'resolved']);
  const w2 = world({ [`${KEY_PREFIX}helpRequests`]: JSON.stringify({ items: [{ id: 'hr_abcdef12', category: 'shopping', status: 'sent', createdAt: 1, updatedAt: 1 }] }) });
  assert.equal(w2.help.list()[0].status, 'draft', 'a tampered "sent" is never shown as a delivery');
  const view = strip(read('js', 'family-view.js'));
  assert.match(view, /도움 요청은 아직 가족에게 보내지지 않아요/);
  assert.equal(/전송 완료|전달됐|전달되었|보냈습니다|요청을 보냈|전송했/.test(view), false);
  assert.match(view, /도움 요청은 응급 신고가 아니에요/);
  assert.equal(/fetch\(|sendBeacon|XMLHttpRequest|tel:|sms:|mailto:/.test(strip(read('js', 'family.js') + read('js', 'family-view.js'))), false);
});

test('OG-FM-17 home integration: the 가족 card states local facts only — no family activity', () => {
  const ex = read('js', 'home-explore.js');
  /* Home V2 — WHY: the card now says what really works (connecting on this device) instead of "가족 연결은 준비 중", and it
     shows connection facts only. BEFORE createFamilyCard({ familyConnection, family }) with a count of sharing choices ·
     AFTER createFamilyCard({ family }) with connected members, waiting invitations and unsent help notes, plus the
     sentences that nothing is shared automatically and that other-device connection is not open. */
  assert.match(ex, /export function createFamilyCard\(\{ family = null \}\)/);
  assert.match(ex, /기다리는 초대 \$\{pending\}개/);
  assert.match(ex, /적어 둔 도움 요청 \$\{open\}개 \(보내지 않음\)/);
  assert.match(ex, /건강·안부·위치·연락처는 자동으로 공유되지 않아요/);
  assert.match(ex, /다른 휴대폰이나 컴퓨터의 가족과 연결하는 기능은 아직 열리지 않았어요/);
  assert.equal(/checkIn|medication|snapshot|previewFor|familyView\(/.test(strip(ex).slice(strip(ex).indexOf('createFamilyCard'), strip(ex).indexOf('ENJOY_CATEGORIES'))), false, 'the card never reads a record');
  assert.equal(/확인했어요|답장|읽었어요|접속|온라인/.test(strip(ex)), false, 'no invented family activity');
  /* Family Connection V1: Home also receives the family service, to say how many members are connected on this device */
  assert.match(read('js', 'app.js'), /family: \{ sharing: familySharing, help: helpRequests, connect: familyConnect \}/);
  assert.match(read('js', 'home-view.js'), /made\.family = guard\('family', '가족', \(\) => createFamilyCard\(\{ family \}\)\);/); /* Home V2: BEFORE 'family-update' slot · AFTER 'family' section, built inside its guard */
});

test('OG-FM-18 search exclusion: sharing choices and help requests are never search results', async () => {
  const w = world();
  w.help.add({ category: 'shopping', message: '찾으면안되는도움요청' });
  w.sharing.set('SCHEDULE', 'DETAIL');
  const search = createSearch();
  search.registerProvider(createAreaProvider(AREAS));
  search.registerProvider(createSavedProvider(w.saved));
  search.registerProvider(createCareProvider(() => []));
  for (const q of ['찾으면안되는도움요청', 'SCHEDULE', '일정 이름과 시간']) assert.deepEqual((await search.query(q)).results.filter((r) => r.providerId !== 'areas'), [], q);
  assert.deepEqual((await search.query('찾으면안되는도움요청')).results, []);
  for (const c of ['familySharing', 'helpRequests']) assert.equal(maySearchGlobally(c), false, c);
});

test('OG-FM-19 sync exclusion: family choices and help requests are PRIVATE and never reach a sync adapter', () => {
  assert.deepEqual([classOf('familySharing'), classOf('helpRequests')], ['PRIVATE', 'PRIVATE']);
  assert.deepEqual([...SYNCABLE_COLLECTIONS], ['profile', 'preferences', 'saved', 'onboarding']);
  for (const c of ['familySharing', 'helpRequests']) assert.equal(maySync(c) || isSyncable(c), false, c);
  assert.equal(familySharingAllowed(), false);
  const w = world();
  const pushed = [];
  createAccount({ storage: w.storage }).connectSyncAdapter({ id: 't', isConfigured: () => true, push: (c) => pushed.push(c.collection) });
  w.sharing.set('CHECK_IN', 'DETAIL');
  w.help.add({ category: 'device' });
  assert.deepEqual(pushed, []);
});

const DAMAGE = ['{not json', '"x"', 'null', '7', '[]', '{"levels":"x"}', '{"levels":{"HEALTH":"DETAIL","CHECK_IN":"ALL","NOPE":"DETAIL","SCHEDULE":"SUMMARY","__proto__":"DETAIL"}}', '{"items":"x"}', '{"items":[1,null,"x",{"id":"bad"},{"id":"hr_abcdef12","category":"zzz"},{"id":"hr_abcdef13","category":"shopping","status":"sent","message":5}]}'];
test('OG-FM-20 corrupted storage: family choices and help requests survive any damage without a throw', () => {
  for (const c of ['familySharing', 'helpRequests']) {
    for (const bad of DAMAGE) {
      const w = world({ [`${KEY_PREFIX}${c}`]: bad, 'livon.keep': '1', [`${KEY_PREFIX}journal`]: '{"items":[]}' });
      assert.doesNotThrow(() => { w.sharing.levels(); w.help.list(); buildSharePreview(w.sharing.levels()); familyOverview({ familyConnection, sharing: w.sharing, help: w.help }); }, `${c} ${bad}`);
      for (const [id, level] of Object.entries(w.sharing.levels())) assert.ok(F.isAllowedLevel(id, level), `${c} ${bad} ${id}`);
      for (const r of w.help.list()) assert.ok(['draft', 'resolved'].includes(r.status) && typeof r.message === 'string');
      assert.equal(w.sharing.set('TASK', 'SUMMARY').ok, true, 'writable again');
      assert.equal(w.help.add({ category: 'other' }).ok, true);
      assert.equal(w.backend.getItem('livon.keep'), '1');
      assert.equal(w.backend.getItem(`${KEY_PREFIX}journal`), '{"items":[]}');
    }
  }
  const w = world({ [`${KEY_PREFIX}familySharing`]: DAMAGE[6] });
  assert.deepEqual(w.sharing.chosen(), [{ id: 'SCHEDULE', level: 'SUMMARY' }], 'only the valid choice survives; HEALTH:DETAIL is not a level that exists');
  assert.equal(CARE_CATEGORY_IDS.includes(F.helpCategoryOf('hospital-escort').careCategory), true);
});
