/*
 * Family Connection V1 — the permission engine. Every "may this member see that?" in ONGIL is answered here and
 * nowhere else (no screen carries its own condition).
 *
 * Default deny. The answer is "no" unless ALL of this is true:
 *   - the state is readable and has a group
 *   - the member exists, is ACTIVE, and has an ACTIVE connection
 *   - the category exists and the stored level is one that category offers
 *   - for a sensitive category: the owner's consent for this member and category is GRANTED and covers the level
 * Anything missing, damaged or unknown gives NONE / false. Pure: no DOM, no storage, no network.
 */
import { isPlainObject } from './contracts.js';
import { sharingCategory, levelAllowed, levelRank, SHARING_CATEGORIES, HELP_TRANSITIONS, HELP_REQUEST_STATES } from './family-domain.js';

const list = (state, key) => (isPlainObject(state) && Array.isArray(state[key]) ? state[key] : []);
const groupOf = (state) => (isPlainObject(state) && isPlainObject(state.group) ? state.group : null);

export function activeMember(state, memberId) {
  if (!groupOf(state) || typeof memberId !== 'string') return null;
  const member = list(state, 'members').find((m) => isPlainObject(m) && m.id === memberId);
  if (!member || member.status !== 'ACTIVE') return null;
  const linked = list(state, 'connections').some((c) => isPlainObject(c) && c.memberId === memberId && c.memberUserId === member.memberUserId && c.status === 'ACTIVE');
  return linked ? member : null;
}

/* the owner's standing consent for one member and one sensitive category, or null */
export function grantedConsent(state, memberId, category) {
  const hits = list(state, 'consents').filter((c) => isPlainObject(c) && c.memberId === memberId && c.category === category && c.status === 'GRANTED');
  return hits.length === 1 ? hits[0] : null; /* two standing consents for one thing is damaged data: neither counts */
}

/* how much of `category` this member may see right now: 'NONE' | 'SUMMARY' | 'DETAIL' */
export function effectiveLevel(state, memberId, category) {
  const c = sharingCategory(category);
  if (!c || !activeMember(state, memberId)) return 'NONE';
  const hits = list(state, 'permissions').filter((p) => isPlainObject(p) && p.memberId === memberId && p.category === category);
  if (hits.length !== 1) return 'NONE';
  const level = hits[0].level;
  if (level === 'NONE' || !levelAllowed(category, level)) return 'NONE';
  if (c.sensitive) {
    const consent = grantedConsent(state, memberId, category);
    if (!consent || levelRank(consent.level) < levelRank(level)) return 'NONE';
  }
  return level;
}

/* canView(state, memberId, { category, level }) — level defaults to the least a category shows */
export function canView(state, memberId, resource) {
  if (!isPlainObject(resource)) return false;
  const want = resource.level === 'DETAIL' ? 'DETAIL' : 'SUMMARY';
  const have = effectiveLevel(state, memberId, resource.category);
  return have !== 'NONE' && levelRank(have) >= levelRank(want);
}

/* only the person whose data it is manages the family: no role of a member ever passes */
export function canManageFamily(state, actor) {
  const group = groupOf(state);
  return !!group && isPlainObject(actor) && actor.role === 'OWNER' && typeof actor.userId === 'string' && actor.userId === group.ownerUserId;
}

/*
 * canShare(state, actor, memberId, category, level, { consent }) → { ok } | { ok:false, reason }
 *   consent: the owner ticked the consent for this sensitive category in this very action.
 */
export function canShare(state, actor, memberId, category, level, { consent = false } = {}) {
  if (!canManageFamily(state, actor)) return { ok: false, reason: 'NOT_OWNER' };
  if (!activeMember(state, memberId)) return { ok: false, reason: 'MEMBER_NOT_CONNECTED' };
  const c = sharingCategory(category);
  if (!c) return { ok: false, reason: 'INVALID_CATEGORY' };
  if (!levelAllowed(category, level)) return { ok: false, reason: 'INVALID_LEVEL' };
  if (level !== 'NONE' && c.sensitive) {
    const standing = grantedConsent(state, memberId, category);
    const covered = !!standing && levelRank(standing.level) >= levelRank(level);
    if (!covered && consent !== true) return { ok: false, reason: 'CONSENT_REQUIRED' };
  }
  return { ok: true };
}

/* a member may answer a request only when it was addressed to them and 도움 요청 is shared with them */
export function canRespondHelpRequest(state, memberId, request, toStatus) {
  if (!isPlainObject(request) || request.memberId !== memberId || !HELP_REQUEST_STATES.includes(toStatus)) return false;
  if (effectiveLevel(state, memberId, 'HELP_REQUEST') !== 'DETAIL') return false;
  const next = HELP_TRANSITIONS.MEMBER[request.status];
  return Array.isArray(next) && next.includes(toStatus);
}
export function canOwnerMoveHelpRequest(state, actor, request, toStatus) {
  if (!canManageFamily(state, actor) || !isPlainObject(request)) return false;
  const next = HELP_TRANSITIONS.OWNER[request.status];
  return Array.isArray(next) && next.includes(toStatus);
}

/* every category with its level for one member — what a preview and the family view are built from */
export function levelsFor(state, memberId) {
  return Object.fromEntries(SHARING_CATEGORIES.map((c) => [c.id, effectiveLevel(state, memberId, c.id)]));
}
