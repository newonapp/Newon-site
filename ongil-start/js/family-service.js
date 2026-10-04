/*
 * Family Connection V1 — everything the family screen does, in one place. The screen calls this service; the
 * service asks the permission engine (family-permissions.js) and keeps state through a FamilyRepository
 * (family-repository.js). No DOM. No network: mode LOCAL means every record lives on this device.
 *
 *   Who is who here: this device belongs to the OWNER — the person whose life is written in ONGIL. A member is
 *   someone the owner connected with. In V1 the member's side (accepting an invitation, the family view, answering
 *   a help request) can only be done on this same device, and the screen says so. A connection between two
 *   devices needs a Newon+ account and a family server, which do not exist yet (ACCOUNT REQUIRED).
 *
 *   Every change returns { ok: true, … } or { ok: false, reason }. A change the device could not store is
 *   { ok: false, reason: 'STORAGE_UNAVAILABLE' } and leaves nothing half-written.
 */
import { ContractError, isPlainObject, safeText } from './contracts.js';
import {
  FAMILY_LIMITS, FAMILY_MODE, MEMBER_ROLES, RELATIONSHIPS, INVITE_EXPIRY, SHARING_CATEGORIES, SHARING_CATEGORY_IDS, NEVER_SHARED, LEVEL_LABELS, FAMILY_HELP_KINDS, HELP_DELIVERY,
  sharingCategory, levelAllowed, levelRank, makeId, makeInvitationCode, parseInvitationCode, secureRandomBytes,
  normalizeGroup, normalizeMember, normalizeInvitation, normalizeConnection, normalizePermission, normalizeConsent, normalizeRequest, normalizeActivity,
} from './family-domain.js';
import { activeMember, effectiveLevel, canView, canShare, canManageFamily, canRespondHelpRequest, canOwnerMoveHelpRequest, grantedConsent, levelsFor } from './family-permissions.js';
import { CHECKIN_STATUSES, EXERCISE_TYPES, HEALTH_EVENT_KINDS, isHealthEvent, eventKind, eventKindLabel } from './life-contracts.js';
import { dateKey, formatTime, formatDateKey } from './dates.js';

const labelOf = (list, id) => (list.find((o) => o.id === id) || { label: '' }).label;
const fail = (reason, extra) => ({ ok: false, reason, ...(extra || {}) });

export function createFamilyService({ repository, sources = {}, now = () => Date.now(), randomBytes = secureRandomBytes }) {
  const read = () => repository.load();
  const actorOf = (state) => (state.group ? { role: 'OWNER', userId: state.group.ownerUserId } : { role: 'OWNER', userId: '' });

  /* an invitation past its time reads as EXPIRED everywhere, whether or not the change was stored yet */
  const statusOf = (inv) => (inv.status === 'PENDING' && inv.expiresAt <= now() ? 'EXPIRED' : inv.status);

  function log(state, action, extra = {}) {
    const entry = normalizeActivity({ id: makeId('fa', randomBytes), familyGroupId: state.group.id, ownerUserId: state.group.ownerUserId, action, actor: extra.actor || 'OWNER', memberId: extra.memberId || '', category: extra.category || '', level: extra.level || '', status: extra.status || '', createdAt: now(), updatedAt: now() }, now());
    state.activity = [entry, ...state.activity].slice(0, FAMILY_LIMITS.activity);
  }
  /* stores expirations that have happened since the last write, so the log says when a code ran out */
  function sweep(state) {
    for (const inv of state.invitations) {
      if (inv.status === 'PENDING' && inv.expiresAt <= now()) {
        inv.status = 'EXPIRED';
        inv.updatedAt = now();
        log(state, 'INVITE_EXPIRED', { actor: 'SYSTEM' });
      }
    }
    return state;
  }
  const commit = (state, result) => (repository.save(state) ? { ok: true, ...result } : fail('STORAGE_UNAVAILABLE'));
  function ensureGroup(state) {
    if (state.group) return state;
    state.group = normalizeGroup({ id: makeId('fg', randomBytes), ownerUserId: makeId('local', randomBytes), createdAt: now(), updatedAt: now() }, now());
    return state;
  }
  const refs = (state, member) => ({ familyGroupId: state.group.id, ownerUserId: state.group.ownerUserId, memberId: member.id, memberUserId: member.memberUserId });

  /* ───────── reading ───────── */

  const publicInvitation = (inv) => ({ id: inv.id, displayName: inv.displayName, relationship: inv.relationship, role: inv.role, status: statusOf(inv), createdAt: inv.createdAt, expiresAt: inv.expiresAt });
  function overview() {
    const state = read();
    const members = state.members.map((m) => ({ ...m, connected: !!activeMember(state, m.id), sharedCount: Object.values(levelsFor(state, m.id)).filter((l) => l !== 'NONE').length }));
    return {
      mode: repository.mode,
      crossDevice: FAMILY_MODE.ACCOUNT_REQUIRED,
      hasGroup: !!state.group,
      members,
      connected: members.filter((m) => m.connected),
      disconnected: members.filter((m) => !m.connected),
      invitations: state.invitations.map(publicInvitation),
      pending: state.invitations.filter((i) => statusOf(i) === 'PENDING').map(publicInvitation),
    };
  }
  const member = (memberId) => activeMember(read(), memberId);
  const levels = (memberId) => levelsFor(read(), memberId);

  /* ───────── invitations ───────── */

  function createInvitation(input) {
    const src = isPlainObject(input) ? input : {};
    const expiry = INVITE_EXPIRY.find((e) => e.id === src.expiry) || INVITE_EXPIRY[INVITE_EXPIRY.length - 1];
    let state;
    let invitation;
    try {
      state = sweep(ensureGroup(read()));
      if (!canManageFamily(state, actorOf(state))) return fail('NOT_OWNER');
      if (state.invitations.filter((i) => i.status === 'PENDING').length >= FAMILY_LIMITS.pendingInvitations) return fail('LIMIT_INVITATIONS');
      if (state.members.filter((m) => m.status === 'ACTIVE').length >= FAMILY_LIMITS.members) return fail('LIMIT_MEMBERS');
      invitation = normalizeInvitation({ id: makeId('fi', randomBytes), familyGroupId: state.group.id, ownerUserId: state.group.ownerUserId, code: makeInvitationCode(randomBytes), displayName: src.displayName, relationship: src.relationship, role: src.role || 'FAMILY', status: 'PENDING', createdAt: now(), updatedAt: now(), expiresAt: now() + expiry.ms }, now());
    } catch (e) {
      return fail(e instanceof ContractError ? e.code : 'INVALID_INVITATION');
    }
    /* finished invitations are history: only the newest are kept */
    state.invitations = [invitation, ...state.invitations].slice(0, FAMILY_LIMITS.invitations);
    log(state, 'INVITE_CREATED');
    /* the code is handed to the caller once, to show to the owner — it is never written to the activity log */
    return commit(state, { invitation: publicInvitation(invitation), code: invitation.code });
  }
  /* the owner looks the code up again (their own invitation, on their own device) */
  function invitationCode(id) {
    const inv = read().invitations.find((i) => i.id === id);
    return inv && statusOf(inv) === 'PENDING' ? inv.code : '';
  }
  function revokeInvitation(id) {
    const state = sweep(read());
    const inv = state.invitations.find((i) => i.id === id);
    if (!inv) return fail('NOT_FOUND');
    if (inv.status !== 'PENDING') return fail(inv.status);
    inv.status = 'REVOKED';
    inv.updatedAt = now();
    log(state, 'INVITE_REVOKED');
    return commit(state, { invitation: publicInvitation(inv) });
  }
  function findByCode(state, input) {
    const code = parseInvitationCode(input);
    return code ? state.invitations.find((i) => i.code === code) || null : null;
  }
  /* what the invited person is shown before deciding: who invites and what a connection means — never any data */
  function inspectInvitation(input) {
    const state = read();
    if (!parseInvitationCode(input)) return fail('INVALID_CODE');
    const inv = findByCode(state, input);
    if (!inv) return fail('NOT_FOUND');
    const status = statusOf(inv);
    if (status !== 'PENDING') return fail(status);
    return { ok: true, invitation: publicInvitation(inv), sharedOnConnect: [] };
  }
  function acceptInvitation(input) {
    const state = sweep(read());
    if (!parseInvitationCode(input)) return fail('INVALID_CODE');
    const inv = findByCode(state, input);
    if (!inv) return fail('NOT_FOUND');
    if (inv.status !== 'PENDING') return repository.save(state) ? fail(inv.status) : fail('STORAGE_UNAVAILABLE');
    if (state.members.filter((m) => m.status === 'ACTIVE').length >= FAMILY_LIMITS.members) return fail('LIMIT_MEMBERS');
    const m = normalizeMember({ id: makeId('fm', randomBytes), familyGroupId: state.group.id, ownerUserId: state.group.ownerUserId, memberUserId: makeId('member', randomBytes), displayName: inv.displayName, relationship: inv.relationship, role: inv.role, status: 'ACTIVE', createdAt: now(), updatedAt: now() }, now());
    const c = normalizeConnection({ id: makeId('fc', randomBytes), ...refs(state, m), invitationId: inv.id, status: 'ACTIVE', createdAt: now(), updatedAt: now() }, now());
    inv.status = 'ACCEPTED';
    inv.memberId = m.id;
    inv.updatedAt = now();
    state.members.push(m);
    state.connections.push(c);
    /* a connection carries no permission: nothing is added to state.permissions here, on purpose */
    log(state, 'INVITE_ACCEPTED', { actor: 'MEMBER', memberId: m.id });
    return commit(state, { member: m, shared: [] });
  }
  function declineInvitation(input) {
    const state = sweep(read());
    const inv = findByCode(state, input);
    if (!inv) return fail(parseInvitationCode(input) ? 'NOT_FOUND' : 'INVALID_CODE');
    if (inv.status !== 'PENDING') return fail(inv.status);
    inv.status = 'DECLINED';
    inv.updatedAt = now();
    log(state, 'INVITE_DECLINED', { actor: 'MEMBER' });
    return commit(state, { invitation: publicInvitation(inv) });
  }

  /* ───────── sharing: per member, per category ───────── */

  function withdraw(state, memberId, category) {
    let n = 0;
    for (const c of state.consents) {
      if (c.memberId === memberId && c.status === 'GRANTED' && (!category || c.category === category)) {
        c.status = 'WITHDRAWN';
        c.withdrawnAt = now();
        c.updatedAt = now();
        n += 1;
      }
    }
    return n;
  }
  /*
   * applySharing(memberId, { CHECK_IN: 'SUMMARY', … }, { consents: ['MEDICATION'] })
   *   Categories that are not named keep their level. Everything is checked first; if one category is refused
   *   (unknown, level not offered, consent missing) nothing at all is changed.
   */
  function applySharing(memberId, wanted, { consents = [] } = {}) {
    const state = sweep(read());
    const m = activeMember(state, memberId);
    if (!m) return fail('MEMBER_NOT_CONNECTED');
    if (!isPlainObject(wanted)) return fail('INVALID_LEVEL');
    const agreed = Array.isArray(consents) ? consents : [];
    const changes = [];
    const needConsent = [];
    for (const [category, level] of Object.entries(wanted)) {
      const verdict = canShare(state, actorOf(state), memberId, category, level, { consent: agreed.includes(category) });
      if (!verdict.ok && verdict.reason === 'CONSENT_REQUIRED') needConsent.push(category);
      else if (!verdict.ok) return fail(verdict.reason, { category });
      else if (effectiveLevel(state, memberId, category) !== level) changes.push({ category, level });
    }
    if (needConsent.length) return fail('CONSENT_REQUIRED', { categories: needConsent });
    for (const { category, level } of changes) {
      const c = sharingCategory(category);
      state.permissions = state.permissions.filter((p) => !(p.memberId === memberId && p.category === category));
      if (level !== 'NONE') state.permissions.push(normalizePermission({ id: makeId('fp', randomBytes), ...refs(state, m), category, level, createdAt: now(), updatedAt: now() }, now()));
      if (c.sensitive) {
        const standing = grantedConsent(state, memberId, category);
        const covered = !!standing && levelRank(standing.level) >= levelRank(level);
        if (level === 'NONE') {
          if (withdraw(state, memberId, category)) log(state, 'CONSENT_WITHDRAWN', { memberId, category });
        } else if (!covered) {
          withdraw(state, memberId, category);
          state.consents.push(normalizeConsent({ id: makeId('fs', randomBytes), ...refs(state, m), category, level, status: 'GRANTED', grantedAt: now(), createdAt: now(), updatedAt: now() }, now()));
          log(state, 'CONSENT_GIVEN', { memberId, category });
        }
      }
      log(state, 'SHARING_CHANGED', { memberId, category, level });
    }
    if (!changes.length) return { ok: true, changed: 0, levels: levelsFor(state, memberId) };
    return commit(state, { changed: changes.length, levels: levelsFor(state, memberId) });
  }
  const setSharing = (memberId, category, level, options) => applySharing(memberId, { [category]: level }, { consents: options && options.consent ? [category] : [] });

  function closeAccess(state, memberId) {
    state.permissions = state.permissions.filter((p) => p.memberId !== memberId);
    withdraw(state, memberId);
  }
  /* 공유 중단: the connection stays, everything shown to this member stops */
  function stopSharing(memberId) {
    const state = sweep(read());
    if (!activeMember(state, memberId)) return fail('MEMBER_NOT_CONNECTED');
    closeAccess(state, memberId);
    log(state, 'SHARING_STOPPED', { memberId });
    return commit(state, {});
  }
  function stopAllSharing() {
    const state = sweep(read());
    if (!state.group) return fail('NO_FAMILY');
    for (const m of state.members) closeAccess(state, m.id);
    log(state, 'SHARING_STOPPED_ALL');
    return commit(state, {});
  }
  /* 연결 해제: sharing stops AND the member is no longer connected. Open requests to them are cancelled. */
  function disconnect(memberId) {
    const state = sweep(read());
    const m = activeMember(state, memberId);
    if (!m) return fail('MEMBER_NOT_CONNECTED');
    closeAccess(state, memberId);
    for (const c of state.connections) if (c.memberId === memberId && c.status === 'ACTIVE') Object.assign(c, { status: 'DISCONNECTED', endedAt: now(), updatedAt: now() });
    for (const r of state.requests) if (r.memberId === memberId && ['REQUESTED', 'SEEN', 'ACCEPTED'].includes(r.status)) Object.assign(r, { status: 'CANCELLED', updatedAt: now() });
    const stored = state.members.find((x) => x.id === memberId);
    Object.assign(stored, { status: 'DISCONNECTED', disconnectedAt: now(), updatedAt: now() });
    log(state, 'DISCONNECTED', { memberId });
    return commit(state, {});
  }

  /* ───────── preview: "이 가족에게 이렇게 보여요" — from the permission model, never a fixed list ───────── */

  /* draft: levels the owner is about to save ({ category: level }); without it, what is in force now */
  function previewFor(memberId, draft = null) {
    const state = read();
    if (!activeMember(state, memberId)) return fail('MEMBER_NOT_CONNECTED');
    const now_ = levelsFor(state, memberId);
    const shared = [];
    const notShared = [];
    for (const c of SHARING_CATEGORIES) {
      const want = isPlainObject(draft) && Object.prototype.hasOwnProperty.call(draft, c.id) ? draft[c.id] : now_[c.id];
      const level = levelAllowed(c.id, want) ? want : 'NONE';
      if (level === 'NONE') notShared.push({ id: c.id, label: c.label });
      else shared.push({ id: c.id, label: c.label, level, levelLabel: LEVEL_LABELS[level], text: c.words[level], needsConsent: c.sensitive && !(grantedConsent(state, memberId, c.id) && levelRank(grantedConsent(state, memberId, c.id).level) >= levelRank(level)) });
    }
    return { ok: true, shared, notShared, never: [...NEVER_SHARED], saved: !draft };
  }

  /* ───────── family view: the SharingSnapshot one member is shown ───────── */

  const READERS = {
    CHECK_IN: (level, date) => {
      const ci = sources.checkIn ? sources.checkIn.get(date) : null;
      if (!ci || !ci.status) return ['오늘은 아직 안부를 남기지 않았어요.'];
      return level === 'DETAIL' ? ['오늘 안부를 남겼어요.', `오늘 고른 기분: ${labelOf(CHECKIN_STATUSES, ci.status)}`] : ['오늘 안부를 남겼어요.'];
    },
    SCHEDULE: (level, date) => {
      const events = (sources.schedule ? sources.schedule.listForDate(date) : []).filter((e) => !isHealthEvent(e));
      if (!events.length) return ['오늘 적어 둔 일정이 없어요.'];
      return level === 'DETAIL' ? events.map((e) => (e.time ? `${formatTime(e.time)} ${e.title}` : e.title)) : [`오늘 일정 ${events.length}개`];
    },
    MEDICATION: (level, date) => {
      const meds = sources.medication ? sources.medication.listForDate(date) : [];
      return meds.length ? [`오늘 먹을 약 ${meds.length}개 가운데 ${meds.filter((m) => m.taken).length}개를 먹었다고 표시했어요.`] : ['오늘 먹을 약으로 적어 둔 것이 없어요.'];
    },
    HEALTH: (level, date) => {
      const ci = sources.checkIn ? sources.checkIn.get(date) : null;
      return [ci && (ci.body || ci.energy || ci.pain) ? '오늘 몸 상태를 적었어요.' : '오늘은 몸 상태를 적지 않았어요.'];
    },
    CHECKUP: (level, date) => {
      const events = sources.schedule ? HEALTH_EVENT_KINDS.flatMap((kind) => sources.schedule.listUpcoming(kind, date)) : [];
      if (!events.length) return ['다가오는 병원·검진 일정이 없어요.'];
      if (level !== 'DETAIL') return [`다가오는 병원·검진 일정 ${events.length}개`];
      return events.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10).map((e) => `${formatDateKey(e.date)} ${eventKindLabel(eventKind(e))}`);
    },
    ACTIVITY: (level, date) => {
      const d = sources.dailyLife ? sources.dailyLife.get(date) : null;
      if (!d || !d.exercise) return ['오늘은 운동을 적지 않았어요.'];
      if (level !== 'DETAIL') return ['오늘 운동을 적었어요.'];
      return [`오늘 운동: ${[labelOf(EXERCISE_TYPES, d.exerciseType), d.exerciseMinutes ? `${d.exerciseMinutes}분` : ''].filter(Boolean).join(' ') || '했어요'}`];
    },
    MEAL: (level, date) => {
      const d = sources.dailyLife ? sources.dailyLife.get(date) : null;
      if (!d || !d.meals) return ['오늘은 식사를 적지 않았어요.'];
      return [level === 'DETAIL' ? `오늘 식사 ${d.meals}끼를 적었어요.` : '오늘 식사를 적었어요.'];
    },
    SLEEP: (level, date) => {
      const s = sources.sleep ? sources.sleep.get(date) : null;
      if (!s) return ['어젯밤 잠을 적지 않았어요.'];
      if (level !== 'DETAIL') return ['어젯밤 잠을 적었어요.'];
      return [[s.bedTime ? `잠든 시각 ${formatTime(s.bedTime)}` : '', s.wakeTime ? `일어난 시각 ${formatTime(s.wakeTime)}` : ''].filter(Boolean).join(' · ') || '어젯밤 잠을 적었어요.'];
    },
    EMERGENCY_INFO: () => {
      const n = sources.emergencyContacts ? sources.emergencyContacts.count() : 0;
      return [n ? `긴급 연락처 ${n}명을 적어 두었어요.` : '적어 둔 긴급 연락처가 없어요.'];
    },
  };
  const publicRequest = (r) => ({ id: r.id, memberId: r.memberId, kind: r.kind, kindLabel: labelOf(FAMILY_HELP_KINDS, r.kind), message: r.message, status: r.status, createdAt: r.createdAt, updatedAt: r.updatedAt });
  /*
   * familyView(memberId) → { ok, snapshot } — only categories this member may see are read at all; a category that
   * is not shared is absent (not blurred, not counted, not named). A member who is not connected gets ACCESS_DENIED.
   */
  function familyView(memberId, date = dateKey(now())) {
    const state = read();
    const m = activeMember(state, memberId);
    if (!m) return fail('ACCESS_DENIED');
    const items = [];
    for (const c of SHARING_CATEGORIES) {
      if (c.id === 'HELP_REQUEST' || !canView(state, memberId, { category: c.id })) continue;
      const level = effectiveLevel(state, memberId, c.id);
      items.push({ category: c.id, label: c.label, level, lines: READERS[c.id](level, date).map((line) => safeText(line, 200)) });
    }
    const requests = canView(state, memberId, { category: 'HELP_REQUEST', level: 'DETAIL' }) ? state.requests.filter((r) => r.memberId === memberId && r.status !== 'CANCELLED').map(publicRequest) : [];
    return { ok: true, snapshot: { memberId, displayName: m.displayName, date, generatedAt: now(), mode: repository.mode, items, requests, empty: items.length === 0 && requests.length === 0 } };
  }

  /* ───────── help requests ───────── */

  function requestHelp(input) {
    const src = isPlainObject(input) ? input : {};
    const state = sweep(read());
    const m = activeMember(state, src.memberId);
    if (!m) return fail('MEMBER_NOT_CONNECTED');
    if (!canManageFamily(state, actorOf(state))) return fail('NOT_OWNER');
    /* a request is something this member is shown, so 도움 요청 has to be shared with them first */
    if (effectiveLevel(state, m.id, 'HELP_REQUEST') !== 'DETAIL') return fail('SHARING_OFF');
    if (state.requests.length >= FAMILY_LIMITS.requests) return fail('LIMIT');
    let request;
    try {
      request = normalizeRequest({ id: makeId('fr', randomBytes), ...refs(state, m), kind: src.kind, message: src.message, status: 'REQUESTED', createdAt: now(), updatedAt: now() }, now());
    } catch (e) {
      return fail(e instanceof ContractError ? e.code : 'INVALID_REQUEST');
    }
    state.requests = [request, ...state.requests];
    log(state, 'HELP_REQUESTED', { memberId: m.id, status: 'REQUESTED' });
    return commit(state, { request: publicRequest(request), delivery: HELP_DELIVERY });
  }
  function moveRequest(id, toStatus, who, memberId) {
    const state = sweep(read());
    const r = state.requests.find((x) => x.id === id);
    if (!r) return fail('NOT_FOUND');
    const allowed = who === 'MEMBER' ? canRespondHelpRequest(state, memberId, r, toStatus) : canOwnerMoveHelpRequest(state, actorOf(state), r, toStatus);
    if (!allowed) return fail('NOT_ALLOWED');
    r.status = toStatus;
    r.updatedAt = now();
    log(state, 'HELP_STATUS_CHANGED', { actor: who, memberId: r.memberId, status: toStatus });
    return commit(state, { request: publicRequest(r) });
  }
  const requests = () => read().requests.map(publicRequest);
  const removeRequest = (id) => {
    const state = read();
    const r = state.requests.find((x) => x.id === id);
    if (!r) return fail('NOT_FOUND');
    if (!['COMPLETED', 'CANCELLED'].includes(r.status)) return fail('NOT_ALLOWED');
    state.requests = state.requests.filter((x) => x.id !== id);
    return commit(state, {});
  };

  /* ───────── activity ───────── */

  function activity() {
    const state = read();
    const names = new Map(state.members.map((m) => [m.id, m.displayName]));
    return state.activity.map((a) => ({ id: a.id, at: a.createdAt, action: a.action, actor: a.actor, memberId: a.memberId, memberName: names.get(a.memberId) || '', category: a.category, categoryLabel: a.category ? sharingCategory(a.category).label : '', level: a.level, status: a.status }));
  }

  return Object.freeze({
    mode: repository.mode,
    overview, member, levels, categories: SHARING_CATEGORIES, categoryIds: SHARING_CATEGORY_IDS, roles: MEMBER_ROLES, relationships: RELATIONSHIPS, expiryOptions: INVITE_EXPIRY,
    createInvitation, invitationCode, revokeInvitation, inspectInvitation, acceptInvitation, declineInvitation,
    applySharing, setSharing, stopSharing, stopAllSharing, disconnect, previewFor, familyView,
    requestHelp, requests, removeRequest,
    respondHelp: (memberId, id, toStatus) => moveRequest(id, toStatus, 'MEMBER', memberId),
    cancelHelp: (id) => moveRequest(id, 'CANCELLED', 'OWNER'),
    completeHelp: (id) => moveRequest(id, 'COMPLETED', 'OWNER'),
    activity,
    /* stores expirations that are due (called when the family screen opens) */
    refresh: () => { const state = read(); const before = JSON.stringify(state.invitations.map((i) => i.status)); sweep(state); return JSON.stringify(state.invitations.map((i) => i.status)) === before ? true : repository.save(state); },
    connectedCount: () => overview().connected.length,
  });
}
