/*
 * Family contracts (Phase 4) — FamilyConnection · FamilyPermission · Consent · AuditEntry · SharedItem · HelpRequest
 *
 * Plain validation only: no DOM, no storage, no network.
 *
 * What exists on this device in Phase 4
 *   - the user's OWN sharing preferences (what they would show family once connected) — family.js
 *   - the user's OWN help-request notes (written, never sent)                          — family.js
 * What does NOT exist (contracts only, for the backend that will come later)
 *   - FamilyConnection, FamilyPermission, Consent, AuditEntry, SharedItem records. No code creates one of these
 *     in Phase 4: there is no second user, no invitation, no network. They are defined so the future server and
 *     this client agree on one shape, and so the rules below are written down and tested now.
 *
 * Rules (the future server must enforce them; hiding something in this UI is not security)
 *   1. Default is NOT SHARED. A connection alone opens nothing.
 *   2. A relationship never grants anything: 자녀 does not mean "can see health".
 *   3. Every category says which levels make sense; health-adjacent ones never offer DETAIL.
 *   4. Health notes, symptom details, the journal and expenses are not shareable categories at all.
 *   5. Consent is per connection and per category, explicit, and revocable at any time. Revoked consent is never
 *      re-activated: sharing again needs a new consent record.
 *   6. Reads and changes by family are written to an audit log the senior can see.
 */
import { ContractError, isPlainObject, SCHEMA_VERSION } from './contracts.js';

const opt = (id, label) => Object.freeze({ id, label });
const ID_RE = /^[a-z]{2,4}_[a-z0-9]{6,40}$/;
const stamp = (value, fallback) => (Number.isSafeInteger(value) && value > 0 ? value : fallback);
const oneOf = (value, options) => (options.some((o) => o.id === value) ? value : '');

/* ───────── relationship · connection ───────── */

export const RELATIONSHIPS = Object.freeze([opt('spouse', '배우자'), opt('child', '자녀'), opt('sibling', '형제·자매'), opt('parent', '부모'), opt('relative', '친척'), opt('other', '기타')]);
export const CONNECTION_STATUSES = Object.freeze(['pending', 'active', 'revoked']);

/* contract only. ownerUserId / memberUserId come from the future account server — never from this device. */
export function normalizeFamilyConnection(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_CONNECTION');
  const uid = (v) => (typeof v === 'string' && /^[A-Za-z0-9_-]{6,128}$/.test(v) ? v : '');
  if (!ID_RE.test(String(input.id))) throw new ContractError('INVALID_ID');
  const ownerUserId = uid(input.ownerUserId);
  const memberUserId = uid(input.memberUserId);
  if (!ownerUserId || !memberUserId || ownerUserId === memberUserId) throw new ContractError('INVALID_MEMBER');
  if (!CONNECTION_STATUSES.includes(input.status)) throw new ContractError('INVALID_STATUS');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, ownerUserId, memberUserId, relationship: oneOf(input.relationship, RELATIONSHIPS) || 'other', status: input.status, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
}

/* ───────── what can be shared, and how much ───────── */

export const SHARE_LEVELS = Object.freeze([opt('NONE', '공유 안 함'), opt('SUMMARY', '요약만'), opt('DETAIL', '자세히')]);

/*
 * levels: the choices that make sense for the category (NONE is always first and always the default).
 * sensitive: health-adjacent — the screen asks once more before anything other than NONE is chosen.
 * words: what a family member would see at each level, in plain words (shown in the preview).
 */
const cat = (id, label, levels, words, sensitive = false) => Object.freeze({ id, label, levels: Object.freeze(['NONE', ...levels]), words: Object.freeze(words), sensitive });
export const SHARE_CATEGORIES = Object.freeze([
  cat('CHECK_IN', '오늘의 안부', ['SUMMARY', 'DETAIL'], { SUMMARY: '오늘 안부를 남겼는지만', DETAIL: '오늘 고른 기분(좋아요·괜찮아요 등)까지' }, true),
  cat('SCHEDULE', '일정', ['SUMMARY', 'DETAIL'], { SUMMARY: '오늘 일정이 몇 개인지만', DETAIL: '일정 이름과 시간' }),
  cat('TASK', '할 일', ['SUMMARY', 'DETAIL'], { SUMMARY: '남은 할 일이 몇 개인지만', DETAIL: '할 일 이름' }),
  cat('ROUTINE', '루틴', ['SUMMARY', 'DETAIL'], { SUMMARY: '오늘 루틴을 몇 개 했는지만', DETAIL: '루틴 이름과 한 것' }),
  cat('MEDICATION', '복약', ['SUMMARY'], { SUMMARY: '오늘 먹은 약이 몇 개인지만 (약 이름은 보이지 않아요)' }, true),
  cat('HEALTH', '몸 상태', ['SUMMARY'], { SUMMARY: '오늘 몸 상태를 적었는지만 (증상·메모 내용은 보이지 않아요)' }, true),
  cat('DAILY_LIFE', '생활 (식사·물·운동)', ['SUMMARY', 'DETAIL'], { SUMMARY: '식사·물·운동을 적었는지만', DETAIL: '끼니 수, 물 잔 수, 운동 여부' }),
  cat('HELP_REQUEST', '도움 요청', ['DETAIL'], { DETAIL: '내가 보내기로 고른 도움 요청 (보낼 때마다 다시 확인)' }),
]);
export const SHARE_CATEGORY_IDS = Object.freeze(SHARE_CATEGORIES.map((c) => c.id));
/* never offered as a category, at any level */
export const NEVER_SHARED = Object.freeze(['건강 메모', '증상 내용', '기록(일기)', '생활비']);

export const categoryById = (id) => SHARE_CATEGORIES.find((c) => c.id === id) || null;
export function isAllowedLevel(category, level) {
  const c = categoryById(category);
  return !!c && c.levels.includes(level);
}

/* contract only: one category of one connection. Relationship is not an input — it cannot grant anything. */
export function normalizeFamilyPermission(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_PERMISSION');
  if (!ID_RE.test(String(input.connectionId))) throw new ContractError('INVALID_CONNECTION');
  if (!categoryById(input.category)) throw new ContractError('INVALID_CATEGORY');
  if (!isAllowedLevel(input.category, input.level)) throw new ContractError('INVALID_LEVEL');
  return { schemaVersion: SCHEMA_VERSION, connectionId: input.connectionId, category: input.category, level: input.level, updatedAt: stamp(input.updatedAt, now) };
}

/* ───────── consent · revocation · audit ───────── */

export const CONSENT_STATUSES = Object.freeze(['granted', 'revoked']);

/*
 * Consent — the senior's explicit "yes" for one category, at one level, to one connection (grantee).
 * subject is always the senior's own account ("self" on this device). It is a record of a decision, not a setting:
 * a later change is a new record, and revoking keeps the old one with revokedAt (for the audit trail).
 */
export function normalizeConsent(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_CONSENT');
  if (!ID_RE.test(String(input.id))) throw new ContractError('INVALID_ID');
  if (input.subject !== 'self') throw new ContractError('INVALID_SUBJECT');
  const scope = isPlainObject(input.scope) ? input.scope : {};
  if (!isAllowedLevel(scope.category, scope.level) || scope.level === 'NONE') throw new ContractError('INVALID_SCOPE');
  if (!ID_RE.test(String(input.grantee))) throw new ContractError('INVALID_GRANTEE');
  if (!CONSENT_STATUSES.includes(input.status)) throw new ContractError('INVALID_STATUS');
  const revokedAt = input.status === 'revoked' ? stamp(input.revokedAt, now) : null;
  return { schemaVersion: SCHEMA_VERSION, id: input.id, subject: 'self', scope: { category: scope.category, level: scope.level }, grantee: input.grantee, status: input.status, createdAt: stamp(input.createdAt, now), revokedAt };
}

/* revoke is a first-class operation: always allowed, immediate, one-way */
export function revokeConsent(consent, now = Date.now()) {
  const c = normalizeConsent(consent, now);
  if (c.status === 'revoked') return c;
  return { ...c, status: 'revoked', revokedAt: now };
}
/* access is decided by the latest consent alone: revoked or missing means nothing is visible */
export function consentAllows(consent, category, level) {
  if (!consent || consent.status !== 'granted' || !consent.scope || consent.scope.category !== category) return false;
  const order = ['NONE', 'SUMMARY', 'DETAIL'];
  return order.indexOf(level) > 0 && order.indexOf(level) <= order.indexOf(consent.scope.level);
}

export const AUDIT_ACTIONS = Object.freeze(['view', 'change', 'grant', 'revoke']);
/* AuditEntry — who (actor connection or 'self'), did what, to which category, under which level, when. Contract only. */
export function normalizeAuditEntry(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_AUDIT');
  if (!ID_RE.test(String(input.id))) throw new ContractError('INVALID_ID');
  if (!(input.actor === 'self' || ID_RE.test(String(input.actor)))) throw new ContractError('INVALID_ACTOR');
  if (!AUDIT_ACTIONS.includes(input.action)) throw new ContractError('INVALID_ACTION');
  if (!categoryById(input.category)) throw new ContractError('INVALID_CATEGORY');
  if (!isAllowedLevel(input.category, input.level)) throw new ContractError('INVALID_LEVEL');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, actor: input.actor, action: input.action, category: input.category, level: input.level, at: stamp(input.at, now) };
}

/* ───────── "가족이 보내준 것" ───────── */

export const SHARED_ITEM_TYPES = Object.freeze([opt('PROGRAM', '프로그램'), opt('PLACE', '장소'), opt('SERVICE', '서비스'), opt('PRODUCT', '상품'), opt('SCHEDULE', '일정')]);
export const SHARED_ITEM_STATUSES = Object.freeze(['new', 'seen', 'saved', 'dismissed']);
/* contract only: produced by the future server when a connected family member sends something */
export function normalizeSharedItem(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_SHARED_ITEM');
  if (!ID_RE.test(String(input.id))) throw new ContractError('INVALID_ID');
  if (!SHARED_ITEM_TYPES.some((t) => t.id === input.type)) throw new ContractError('INVALID_TYPE');
  const sourceId = typeof input.sourceId === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/.test(input.sourceId) ? input.sourceId : '';
  if (!sourceId) throw new ContractError('INVALID_SOURCE');
  if (!ID_RE.test(String(input.senderConnectionId))) throw new ContractError('INVALID_SENDER');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, type: input.type, sourceId, senderConnectionId: input.senderConnectionId, status: SHARED_ITEM_STATUSES.includes(input.status) ? input.status : 'new', createdAt: stamp(input.createdAt, now) };
}

/* ───────── help request ───────── */

/*
 * HelpRequest — "도움이 필요해요" as an everyday request (병원 동행, 장보기…), NOT an emergency call.
 * careCategory: where 돌봄·서비스 can show related information (nothing is applied for automatically).
 * Status: on this device a request is only ever 'draft' (written, not sent) or 'resolved' (the user marked it done).
 * 'sent' is reserved for the future backend; a stored 'sent' is read back as 'draft' so nothing can claim a delivery.
 */
export const HELP_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'hospital-escort', label: '병원 동행', careCategory: 'hospital-escort' }),
  Object.freeze({ id: 'shopping', label: '장보기', careCategory: 'shopping' }),
  Object.freeze({ id: 'mobility', label: '이동', careCategory: 'mobility' }),
  Object.freeze({ id: 'housework', label: '집안일', careCategory: 'housekeeping' }),
  Object.freeze({ id: 'device', label: '기기 사용', careCategory: 'digital' }),
  Object.freeze({ id: 'other', label: '기타', careCategory: '' }),
]);
export const HELP_STATUSES = Object.freeze(['draft', 'sent', 'resolved']);
export const HELP_LOCAL_STATUSES = Object.freeze(['draft', 'resolved']);
export const HELP_LIMITS = Object.freeze({ message: 300, requests: 50 });

export function normalizeHelpRequest(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_HELP');
  if (!ID_RE.test(String(input.id))) throw new ContractError('INVALID_ID');
  if (!HELP_CATEGORIES.some((c) => c.id === input.category)) throw new ContractError('INVALID_CATEGORY');
  const message = typeof input.message === 'string' ? input.message.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, HELP_LIMITS.message) : '';
  const status = input.status === 'resolved' ? 'resolved' : 'draft';
  return { schemaVersion: SCHEMA_VERSION, id: input.id, category: input.category, message, status, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now), resolvedAt: status === 'resolved' ? stamp(input.resolvedAt, now) : null };
}
export const helpCategoryOf = (id) => HELP_CATEGORIES.find((c) => c.id === id) || null;
