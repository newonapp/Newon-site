/*
 * Family Connection V1 — the domain model (no DOM, no storage, no network).
 *
 *   FamilyGroup          one per ONGIL user: the person who owns the data (OWNER). There is no other owner.
 *   FamilyMember         a person the owner connected with (role FAMILY or CAREGIVER). A role grants nothing.
 *   FamilyInvitation     how a connection starts: a random code with an expiry, made by the owner.
 *   FamilyConnection     the link between owner and one member (ACTIVE until the owner ends it).
 *   SharingPermission    what ONE member may see of ONE category, and how much. Missing = not shared.
 *   SharingConsent       the owner's explicit "yes" for a sensitive category, per member. A withdrawn consent is
 *                        never switched back on: sharing again needs a new one.
 *   SharingSnapshot      what a member is shown at one moment — built by family-service.js through the permission
 *                        engine (family-permissions.js). It is never stored.
 *   HelpRequest          something the owner asks one member for (REQUESTED → SEEN → ACCEPTED → COMPLETED / CANCELLED).
 *   FamilyActivityLog    what happened and when (connected, sharing changed, disconnected …) — never the shared values.
 *
 * Where this runs today: on this device only (mode LOCAL). The same shapes are what an account server will keep;
 * ownerUserId / memberUserId are local ids until a Newon+ account exists. Nothing here reads a health record.
 *
 * Rules written into the shapes
 *   1. Default is NOT SHARED: a connection carries no permission.
 *   2. A relationship or a role never grants anything.
 *   3. Health-adjacent categories offer a summary only, and need the owner's consent per member.
 *   4. Health notes, symptom details, the journal and expenses are not categories at all.
 */
import { ContractError, isPlainObject, SCHEMA_VERSION, safeText } from './contracts.js';
import { RELATIONSHIPS, NEVER_SHARED } from './family-contracts.js';

const opt = (id, label) => Object.freeze({ id, label });
const stamp = (value, fallback) => (Number.isSafeInteger(value) && value > 0 ? value : fallback);
const has = (list, id) => list.some((o) => (typeof o === 'string' ? o : o.id) === id);

export const FAMILY_MODE = Object.freeze({ LOCAL: 'LOCAL', ACCOUNT_REQUIRED: 'ACCOUNT_REQUIRED' });
export const FAMILY_ROLES = Object.freeze(['OWNER', 'FAMILY', 'CAREGIVER']);
/* the roles an invitation can carry. OWNER is never invited: it is the person whose data it is. */
export const MEMBER_ROLES = Object.freeze([opt('FAMILY', '가족'), opt('CAREGIVER', '돌봄을 도와주는 분')]);
export const MEMBER_STATUSES = Object.freeze(['ACTIVE', 'DISCONNECTED']);
export const INVITATION_STATUSES = Object.freeze(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED']);
export const CONNECTION_STATES = Object.freeze(['ACTIVE', 'DISCONNECTED']);
export const CONSENT_STATES = Object.freeze(['GRANTED', 'WITHDRAWN']);
export const INVITE_EXPIRY = Object.freeze([Object.freeze({ id: '1d', label: '하루 동안', ms: 24 * 3600e3 }), Object.freeze({ id: '7d', label: '7일 동안', ms: 7 * 24 * 3600e3 })]);
export const FAMILY_LIMITS = Object.freeze({ members: 10, pendingInvitations: 5, invitations: 40, requests: 50, activity: 200, name: 20, message: 300 });
export { RELATIONSHIPS, NEVER_SHARED };

/* ───────── what can be shared with a member, and how much ───────── */

export const SHARE_LEVEL_IDS = Object.freeze(['NONE', 'SUMMARY', 'DETAIL']);
export const levelRank = (level) => Math.max(0, SHARE_LEVEL_IDS.indexOf(level));
export const LEVEL_LABELS = Object.freeze({ NONE: '공유 안 함', SUMMARY: '요약만', DETAIL: '자세히' });

const cat = (id, label, levels, words, sensitive = false) => Object.freeze({ id, label, levels: Object.freeze(['NONE', ...levels]), words: Object.freeze(words), sensitive });
export const SHARING_CATEGORIES = Object.freeze([
  cat('CHECK_IN', '안부', ['SUMMARY', 'DETAIL'], { SUMMARY: '오늘 안부를 남겼는지만', DETAIL: '오늘 고른 기분(좋아요·괜찮아요 등)까지' }),
  cat('SCHEDULE', '일정', ['SUMMARY', 'DETAIL'], { SUMMARY: '오늘 일정이 몇 개인지만', DETAIL: '오늘 일정의 이름과 시간 (병원·검진 일정은 빼고)' }),
  cat('MEDICATION', '복약', ['SUMMARY'], { SUMMARY: '오늘 먹을 약 가운데 몇 개를 먹었다고 표시했는지만 (약 이름은 보이지 않아요)' }, true),
  cat('HEALTH', '건강 기록', ['SUMMARY'], { SUMMARY: '오늘 몸 상태를 적었는지만 (증상·수치·메모 내용은 보이지 않아요)' }, true),
  cat('CHECKUP', '병원·검진 일정', ['SUMMARY', 'DETAIL'], { SUMMARY: '다가오는 병원·검진 일정이 몇 개인지만', DETAIL: '날짜와 종류(병원 일정·건강검진)까지 (병원 이름과 메모는 보이지 않아요)' }, true),
  cat('ACTIVITY', '활동', ['SUMMARY', 'DETAIL'], { SUMMARY: '오늘 운동을 적었는지만', DETAIL: '운동 종류와 시간' }),
  cat('MEAL', '식사', ['SUMMARY', 'DETAIL'], { SUMMARY: '오늘 식사를 적었는지만', DETAIL: '오늘 먹은 끼니 수' }),
  cat('SLEEP', '수면', ['SUMMARY', 'DETAIL'], { SUMMARY: '어젯밤 잠을 적었는지만', DETAIL: '잠든 시각과 일어난 시각' }),
  cat('HELP_REQUEST', '도움 요청', ['DETAIL'], { DETAIL: '이 가족에게 부탁한 도움 요청' }),
  cat('EMERGENCY_INFO', '비상 연락 정보', ['SUMMARY'], { SUMMARY: '긴급 연락처를 몇 명 적어 두었는지만 (이름과 전화번호는 보이지 않아요)' }, true),
]);
export const SHARING_CATEGORY_IDS = Object.freeze(SHARING_CATEGORIES.map((c) => c.id));
export const sharingCategory = (id) => SHARING_CATEGORIES.find((c) => c.id === id) || null;
export function levelAllowed(category, level) {
  const c = sharingCategory(category);
  return !!c && c.levels.includes(level);
}

/* ───────── help requests ───────── */

export const FAMILY_HELP_KINDS = Object.freeze([opt('hospital-escort', '병원 같이 가기'), opt('shopping', '장보기 도움'), opt('call', '전화 부탁'), opt('housework', '집안일 도움'), opt('other', '직접 작성')]);
export const HELP_REQUEST_STATES = Object.freeze(['REQUESTED', 'SEEN', 'ACCEPTED', 'COMPLETED', 'CANCELLED']);
export const HELP_STATE_LABELS = Object.freeze({ REQUESTED: '부탁함', SEEN: '가족이 봄', ACCEPTED: '가족이 돕기로 함', COMPLETED: '끝남', CANCELLED: '취소함' });
/* who may move a request where. Anything not listed is refused. */
export const HELP_TRANSITIONS = Object.freeze({
  MEMBER: Object.freeze({ REQUESTED: Object.freeze(['SEEN', 'ACCEPTED']), SEEN: Object.freeze(['ACCEPTED']), ACCEPTED: Object.freeze(['COMPLETED']) }),
  OWNER: Object.freeze({ REQUESTED: Object.freeze(['CANCELLED']), SEEN: Object.freeze(['CANCELLED']), ACCEPTED: Object.freeze(['CANCELLED', 'COMPLETED']) }),
});
/* how a request reaches the member. V1 has no push, SMS or server: it is visible inside ONGIL on this device only. */
export const HELP_DELIVERY = Object.freeze({ channel: 'LOCAL_IN_APP', push: false, sms: false, server: false });

/* ───────── activity log ───────── */

export const ACTIVITY_ACTIONS = Object.freeze({
  INVITE_CREATED: '초대를 만들었어요',
  INVITE_REVOKED: '초대를 취소했어요',
  INVITE_EXPIRED: '초대 기간이 끝났어요',
  INVITE_DECLINED: '초대를 받지 않았어요',
  INVITE_ACCEPTED: '초대를 받아 연결됐어요',
  SHARING_CHANGED: '공유 설정을 바꿨어요',
  CONSENT_GIVEN: '건강 관련 공유에 동의했어요',
  CONSENT_WITHDRAWN: '건강 관련 공유 동의를 거뒀어요',
  SHARING_STOPPED: '이 가족과의 공유를 모두 멈췄어요',
  SHARING_STOPPED_ALL: '모든 가족과의 공유를 멈췄어요',
  DISCONNECTED: '연결을 해제했어요',
  HELP_REQUESTED: '도움을 부탁했어요',
  HELP_STATUS_CHANGED: '도움 요청 상태가 바뀌었어요',
});
export const ACTIVITY_ACTORS = Object.freeze(['OWNER', 'MEMBER', 'SYSTEM']);

/* ───────── ids and the invitation code ───────── */

const ID_RE = /^f[gmicprsa]_[a-z0-9]{12,32}$/;
const USER_RE = /^[a-z]{5,12}_[a-z0-9]{12,32}$/;
const BASE36 = 'abcdefghijklmnopqrstuvwxyz0123456789';
/* 32 characters, none that look alike (no 0 1 I O) — 5 bits each */
export const INVITE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const INVITATION_CODE_LENGTH = 20; /* 100 bits */

/* cryptographically strong bytes, or nothing: an invitation is never made from Math.random */
export function secureRandomBytes(n) {
  const c = globalThis.crypto;
  if (!c || typeof c.getRandomValues !== 'function') throw new ContractError('NO_SECURE_RANDOM');
  return c.getRandomValues(new Uint8Array(n));
}
export function makeId(prefix, randomBytes = secureRandomBytes) {
  /* 36 does not divide 256: bytes of 252 and above are skipped so every character is equally likely */
  let out = '';
  while (out.length < 16) for (const b of randomBytes(24)) if (b < 252 && out.length < 16) out += BASE36[b % 36];
  return `${prefix}_${out}`;
}
export function makeInvitationCode(randomBytes = secureRandomBytes) {
  const bytes = randomBytes(INVITATION_CODE_LENGTH);
  if (!bytes || bytes.length !== INVITATION_CODE_LENGTH) throw new ContractError('NO_SECURE_RANDOM');
  let out = '';
  for (const b of bytes) out += INVITE_ALPHABET[b & 31]; /* 256 = 8 × 32: no bias */
  return out;
}
export const formatInvitationCode = (code) => (typeof code === 'string' ? code.replace(/(.{5})(?=.)/g, '$1-') : '');
/* what a person typed → the code, or '' (spaces, hyphens and lower case are forgiven; anything else is not) */
export function parseInvitationCode(input) {
  if (typeof input !== 'string' || input.length > 64) return '';
  const s = input.toUpperCase().replace(/[\s-]/g, '');
  return s.length === INVITATION_CODE_LENGTH && [...s].every((ch) => INVITE_ALPHABET.includes(ch)) ? s : '';
}

/* ───────── normalizers (a record that does not pass is dropped by normalizeFamilyState: missing = denied) ───────── */

const idOf = (v, letter) => (typeof v === 'string' && ID_RE.test(v) && v[1] === letter ? v : '');
const userOf = (v) => (typeof v === 'string' && USER_RE.test(v) ? v : '');
function base(input, letter, now) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_RECORD');
  const id = idOf(input.id, letter);
  const familyGroupId = letter === 'g' ? id : idOf(input.familyGroupId, 'g');
  const ownerUserId = userOf(input.ownerUserId);
  if (!id || !familyGroupId || !ownerUserId) throw new ContractError('INVALID_ID');
  return { schemaVersion: SCHEMA_VERSION, id, familyGroupId, ownerUserId, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
}
function memberRef(input) {
  const memberId = idOf(input.memberId, 'm');
  const memberUserId = userOf(input.memberUserId);
  if (!memberId || !memberUserId || memberUserId === input.ownerUserId) throw new ContractError('INVALID_MEMBER');
  return { memberId, memberUserId };
}
const nameOf = (v) => {
  const name = safeText(v, FAMILY_LIMITS.name);
  if (!name) throw new ContractError('INVALID_NAME');
  return name;
};
const roleOf = (v) => {
  if (!has(MEMBER_ROLES, v)) throw new ContractError('INVALID_ROLE');
  return v;
};
const relationOf = (v) => (has(RELATIONSHIPS, v) ? v : 'other');

export function normalizeGroup(input, now = Date.now()) {
  const b = base(input, 'g', now);
  return { ...b, role: 'OWNER', mode: FAMILY_MODE.LOCAL };
}
export function normalizeMember(input, now = Date.now()) {
  const b = base(input, 'm', now);
  const memberUserId = userOf(input.memberUserId);
  if (!memberUserId || memberUserId === b.ownerUserId) throw new ContractError('INVALID_MEMBER');
  if (!MEMBER_STATUSES.includes(input.status)) throw new ContractError('INVALID_STATUS');
  return { ...b, memberUserId, displayName: nameOf(input.displayName), relationship: relationOf(input.relationship), role: roleOf(input.role), status: input.status, mode: FAMILY_MODE.LOCAL, disconnectedAt: input.status === 'DISCONNECTED' ? stamp(input.disconnectedAt, b.updatedAt) : 0 };
}
export function normalizeInvitation(input, now = Date.now()) {
  const b = base(input, 'i', now);
  const code = parseInvitationCode(input.code);
  if (!code) throw new ContractError('INVALID_CODE');
  if (!INVITATION_STATUSES.includes(input.status)) throw new ContractError('INVALID_STATUS');
  const expiresAt = stamp(input.expiresAt, 0);
  if (!expiresAt || expiresAt <= b.createdAt) throw new ContractError('INVALID_EXPIRY');
  return { ...b, code, displayName: nameOf(input.displayName), relationship: relationOf(input.relationship), role: roleOf(input.role), status: input.status, expiresAt, memberId: input.status === 'ACCEPTED' ? idOf(input.memberId, 'm') : '' };
}
export function normalizeConnection(input, now = Date.now()) {
  const b = base(input, 'c', now);
  if (!CONNECTION_STATES.includes(input.status)) throw new ContractError('INVALID_STATUS');
  return { ...b, ...memberRef(input), invitationId: idOf(input.invitationId, 'i'), status: input.status, endedAt: input.status === 'DISCONNECTED' ? stamp(input.endedAt, b.updatedAt) : 0 };
}
export function normalizePermission(input, now = Date.now()) {
  const b = base(input, 'p', now);
  if (!levelAllowed(input.category, input.level) || input.level === 'NONE') throw new ContractError('INVALID_LEVEL');
  return { ...b, ...memberRef(input), category: input.category, level: input.level };
}
export function normalizeConsent(input, now = Date.now()) {
  const b = base(input, 's', now);
  const c = sharingCategory(input.category);
  if (!c || !c.sensitive || !levelAllowed(input.category, input.level) || input.level === 'NONE') throw new ContractError('INVALID_LEVEL');
  if (!CONSENT_STATES.includes(input.status)) throw new ContractError('INVALID_STATUS');
  return { ...b, ...memberRef(input), category: input.category, level: input.level, status: input.status, grantedAt: stamp(input.grantedAt, b.createdAt), withdrawnAt: input.status === 'WITHDRAWN' ? stamp(input.withdrawnAt, b.updatedAt) : 0 };
}
export function normalizeRequest(input, now = Date.now()) {
  const b = base(input, 'r', now);
  if (!has(FAMILY_HELP_KINDS, input.kind)) throw new ContractError('INVALID_KIND');
  if (!HELP_REQUEST_STATES.includes(input.status)) throw new ContractError('INVALID_STATUS');
  const message = safeText(input.message, FAMILY_LIMITS.message);
  if (input.kind === 'other' && !message) throw new ContractError('INVALID_MESSAGE');
  return { ...b, ...memberRef(input), kind: input.kind, message, status: input.status, delivery: HELP_DELIVERY.channel };
}
/* an activity entry names what happened — never a name, a number, a title or any other shared value */
export function normalizeActivity(input, now = Date.now()) {
  const b = base(input, 'a', now);
  if (!Object.prototype.hasOwnProperty.call(ACTIVITY_ACTIONS, input.action)) throw new ContractError('INVALID_ACTION');
  if (!ACTIVITY_ACTORS.includes(input.actor)) throw new ContractError('INVALID_ACTOR');
  return { ...b, action: input.action, actor: input.actor, memberId: idOf(input.memberId, 'm'), category: sharingCategory(input.category) ? input.category : '', level: SHARE_LEVEL_IDS.includes(input.level) ? input.level : '', status: HELP_REQUEST_STATES.includes(input.status) ? input.status : '' };
}

export function emptyFamilyState() {
  return { schemaVersion: SCHEMA_VERSION, group: null, members: [], invitations: [], connections: [], permissions: [], consents: [], requests: [], activity: [] };
}
const LISTS = Object.freeze({ members: normalizeMember, invitations: normalizeInvitation, connections: normalizeConnection, permissions: normalizePermission, consents: normalizeConsent, requests: normalizeRequest, activity: normalizeActivity });
/*
 * Whatever was stored → a state every reader can trust. Damaged, foreign-group, duplicate or prototype-carrying
 * records are dropped, so a permission that cannot be read is simply not there — and "not there" means not shared.
 */
export function normalizeFamilyState(raw, now = Date.now()) {
  const out = emptyFamilyState();
  if (!isPlainObject(raw)) return out;
  try {
    out.group = raw.group === null || raw.group === undefined ? null : normalizeGroup(raw.group, now);
  } catch {
    return out; /* without a readable group nothing below can be attributed to an owner */
  }
  if (!out.group) return out;
  for (const [key, normalize] of Object.entries(LISTS)) {
    const seen = new Set();
    for (const item of Array.isArray(raw[key]) ? raw[key] : []) {
      try {
        const n = normalize(item, now);
        if (n.familyGroupId !== out.group.id || n.ownerUserId !== out.group.ownerUserId || seen.has(n.id)) continue;
        seen.add(n.id);
        out[key].push(n);
      } catch {
        /* dropped */
      }
    }
  }
  const members = new Map(out.members.map((m) => [m.id, m]));
  const sameMember = (r) => members.has(r.memberId) && members.get(r.memberId).memberUserId === r.memberUserId;
  for (const key of ['connections', 'permissions', 'consents', 'requests']) out[key] = out[key].filter(sameMember);
  /* one permission per member and category: a second one is ambiguous, so neither counts */
  const count = new Map();
  for (const p of out.permissions) count.set(`${p.memberId}:${p.category}`, (count.get(`${p.memberId}:${p.category}`) || 0) + 1);
  out.permissions = out.permissions.filter((p) => count.get(`${p.memberId}:${p.category}`) === 1);
  return out;
}
