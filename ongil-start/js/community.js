/*
 * Community + Groups on this device (Phase 6): three small local stores.
 *
 *   createPostStore     communityPosts  the user's own posts (임시 저장 / 이 기기에 저장). Never published.
 *   createGroupStore    groupDrafts     모임 초안. No members, no joining, no listing for others.
 *   createMeetupStore   meetupDrafts    모임 일정 초안 inside one group draft.
 *
 * All three are PRIVATE (privacy.js): never synced, never in global search, never shared with family.
 * There is no network here and nothing produces a notification.
 *
 * Community V2: the post store also keeps the one compose draft (what is being typed) in the SAME communityPosts
 * document, next to the posts — no new collection. createRemoteCommunityRepository is the future server side; today it
 * refuses every call (REMOTE_NOT_CONFIGURED) and sends nothing.
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { newId } from './life-contracts.js';
import { normalizePost, normalizeGroup, normalizeMeetup, normalizeComposeDraft, COMMUNITY_LIMITS, privacyCheck, safetyCheck, COMMUNITY_REMOTE_CONTRACT } from './community-contracts.js';

export const COMMUNITY_DELIVERY = Object.freeze({ published: false, visibleToOthers: false, server: false });

/* a list collection with id-keyed items, damaged entries skipped, duplicates dropped.
   `keep` names extra keys of the same document that a write of the items must not drop (the compose draft). */
function listStore(storage, collection, normalize, now, keep = []) {
  const extras = () => {
    const raw = storage.get(collection, null);
    const out = {};
    if (isPlainObject(raw)) for (const k of keep) if (raw[k] !== undefined) out[k] = raw[k];
    return out;
  };
  function read() {
    const raw = storage.get(collection, null);
    const items = isPlainObject(raw) && Array.isArray(raw.items) ? raw.items : [];
    const out = [];
    const seen = new Set();
    for (const it of items) {
      try {
        const n = normalize(it, now());
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        out.push(n);
      } catch {
        /* skip damaged entries */
      }
    }
    return out;
  }
  /* the storage layer refuses a value that is too large; that is reported, never silently dropped */
  const write = (items) => storage.set(collection, { ...extras(), schemaVersion: SCHEMA_VERSION, items });
  /* one extra key of the document; the items are written back exactly as stored (nothing re-normalized or dropped) */
  const readExtra = (key) => { const raw = storage.get(collection, null); return isPlainObject(raw) ? raw[key] : undefined; };
  const writeExtra = (key, value) => {
    const raw = storage.get(collection, null);
    const doc = isPlainObject(raw) ? { ...raw } : { schemaVersion: SCHEMA_VERSION, items: [] };
    if (value === undefined) delete doc[key];
    else doc[key] = value;
    return storage.set(collection, doc);
  };
  return { read, write, readExtra, writeExtra };
}
const fail = (e, code) => ({ ok: false, reason: e instanceof ContractError ? e.code : code });

export function createPostStore(storage, { now = () => Date.now(), makeId = () => newId('cp', now()) } = {}) {
  const s = listStore(storage, 'communityPosts', normalizePost, now, ['compose']);
  const list = () => s.read().sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id));

  function save(input, id = null) {
    const src = isPlainObject(input) ? input : {};
    /* an ID number or a payment card number is never stored (Community V2 adds the card number) */
    if (safetyCheck(src.title, src.body).blocked) return { ok: false, reason: 'SENSITIVE_NUMBER' };
    const items = s.read();
    const index = id ? items.findIndex((p) => p.id === id) : -1;
    if (id && index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const before = index >= 0 ? items[index] : null;
    let post;
    try {
      post = normalizePost({ id: before ? before.id : makeId(), type: src.type, category: src.category, title: src.title, body: src.body, status: src.status, source: before ? before.source : src.source, createdAt: before ? before.createdAt : now(), updatedAt: now() }, now());
    } catch (e) {
      return fail(e, 'INVALID_POST');
    }
    if (!before && items.length >= COMMUNITY_LIMITS.posts) return { ok: false, reason: 'LIMIT' };
    if (before) items[index] = post;
    else items.push(post);
    return s.write(items) ? { ok: true, post, check: safetyCheck(post.title, post.body) } : { ok: false, reason: 'STORAGE_FULL' };
  }

  function remove(id) {
    const items = s.read();
    const next = items.filter((p) => p.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    return { ok: s.write(next) };
  }

  /*
   * The compose draft: one, on this device, until the post is saved or the user throws it away. A damaged draft reads as
   * none (it never breaks the screen). Saving it re-checks the ID / card number rule: such a number is not kept here either.
   */
  const compose = Object.freeze({
    get: () => normalizeComposeDraft(s.readExtra('compose'), now()),
    save(editId, values) {
      const d = normalizeComposeDraft({ editId: editId || '', values, savedAt: now() }, now());
      if (!d) return { ok: true, empty: true, cleared: s.readExtra('compose') === undefined ? true : s.writeExtra('compose', undefined) };
      if (safetyCheck(d.values.title, d.values.body).blocked) return { ok: false, reason: 'SENSITIVE_NUMBER' };
      return s.writeExtra('compose', d) ? { ok: true, draft: d } : { ok: false, reason: 'STORAGE_FULL' };
    },
    clear: () => (s.readExtra('compose') === undefined ? true : s.writeExtra('compose', undefined)),
  });

  return Object.freeze({ list, get: (id) => s.read().find((p) => p.id === id) || null, add: (input) => save(input), update: (id, input) => save(input, id), remove, count: () => s.read().length, delivery: COMMUNITY_DELIVERY, compose });
}

export function createGroupStore(storage, { now = () => Date.now(), makeId = () => newId('gd', now()), meetups = null } = {}) {
  const s = listStore(storage, 'groupDrafts', normalizeGroup, now);
  const list = () => s.read().sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id));

  function save(input, id = null) {
    const src = isPlainObject(input) ? input : {};
    if (safetyCheck(src.name, src.description).blocked) return { ok: false, reason: 'SENSITIVE_NUMBER' };
    const items = s.read();
    const index = id ? items.findIndex((g) => g.id === id) : -1;
    if (id && index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const before = index >= 0 ? items[index] : null;
    let group;
    try {
      group = normalizeGroup({ id: before ? before.id : makeId(), name: src.name, category: src.category, description: src.description, region: src.region, meetingStyle: src.meetingStyle, status: 'DRAFT', createdAt: before ? before.createdAt : now(), updatedAt: now() }, now());
    } catch (e) {
      return fail(e, 'INVALID_GROUP');
    }
    if (!before && items.length >= COMMUNITY_LIMITS.groups) return { ok: false, reason: 'LIMIT' };
    if (before) items[index] = group;
    else items.push(group);
    return s.write(items) ? { ok: true, group } : { ok: false, reason: 'STORAGE_FULL' };
  }

  /* removing a group draft removes its meetup drafts too — nothing is left pointing at a missing group */
  function remove(id) {
    const items = s.read();
    const next = items.filter((g) => g.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    const ok = s.write(next);
    if (ok && meetups) meetups.removeForGroup(id);
    return { ok };
  }

  return Object.freeze({ list, get: (id) => s.read().find((g) => g.id === id) || null, add: (input) => save(input), update: (id, input) => save(input, id), remove, count: () => s.read().length });
}

export function createMeetupStore(storage, { now = () => Date.now(), makeId = () => newId('mt', now()) } = {}) {
  const s = listStore(storage, 'meetupDrafts', normalizeMeetup, now);
  const all = () => s.read();
  const listFor = (groupId) => all().filter((m) => m.groupId === groupId).sort((a, b) => a.date.localeCompare(b.date) || (a.time || '99').localeCompare(b.time || '99') || a.id.localeCompare(b.id));

  function save(groupId, input, id = null) {
    const src = isPlainObject(input) ? input : {};
    if (safetyCheck(src.title, src.placeText, src.description).blocked) return { ok: false, reason: 'SENSITIVE_NUMBER' };
    const items = s.read();
    const index = id ? items.findIndex((m) => m.id === id) : -1;
    if (id && index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const before = index >= 0 ? items[index] : null;
    let meetup;
    try {
      meetup = normalizeMeetup({ id: before ? before.id : makeId(), groupId: before ? before.groupId : groupId, title: src.title, date: src.date, time: src.time, placeText: src.placeText, description: src.description, status: 'DRAFT', createdAt: before ? before.createdAt : now(), updatedAt: now() }, now());
    } catch (e) {
      return fail(e, 'INVALID_MEETUP');
    }
    if (!before && items.length >= COMMUNITY_LIMITS.meetups) return { ok: false, reason: 'LIMIT' };
    if (before) items[index] = meetup;
    else items.push(meetup);
    return s.write(items) ? { ok: true, meetup, check: privacyCheck(meetup.placeText) } : { ok: false, reason: 'STORAGE_FULL' };
  }

  function remove(id) {
    const items = s.read();
    const next = items.filter((m) => m.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    return { ok: s.write(next) };
  }
  function removeForGroup(groupId) {
    const items = s.read();
    const next = items.filter((m) => m.groupId !== groupId);
    return next.length === items.length ? true : s.write(next);
  }

  /* Phase 11: { groupId: number of meetup drafts } from ONE read — the group list used to read the collection once per group */
  function countsByGroup() {
    const out = {};
    for (const m of all()) out[m.groupId] = (out[m.groupId] || 0) + 1;
    return out;
  }

  return Object.freeze({ listFor, countsByGroup, add: (groupId, input) => save(groupId, input), update: (id, input) => save(null, input, id), remove, removeForGroup, count: () => s.read().length });
}

/*
 * The future server side of community (Community V2 boundary). Nothing calls a server: every operation of the contract
 * answers REMOTE_NOT_CONFIGURED, so a screen can never show "공개됐어요", "신고가 접수됐어요" or "차단했어요" by mistake.
 * selectCommunityRepository always gives the local stores until a configured server exists.
 */
export function createRemoteCommunityRepository() {
  const refuse = () => Promise.resolve({ ok: false, reason: 'REMOTE_NOT_CONFIGURED' });
  return Object.freeze({ mode: 'REMOTE_NOT_CONFIGURED', configured: false, ...Object.fromEntries(COMMUNITY_REMOTE_CONTRACT.routes.map((r) => [r.op, refuse])) });
}
export function selectCommunityRepository({ storage, now } = {}) {
  return { mode: 'LOCAL', posts: createPostStore(storage, { now }), remote: createRemoteCommunityRepository() };
}
