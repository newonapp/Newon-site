/*
 * Community + Groups on this device (Phase 6): three small local stores.
 *
 *   createPostStore     communityPosts  the user's own posts (임시 저장 / 이 기기에 저장). Never published.
 *   createGroupStore    groupDrafts     모임 초안. No members, no joining, no listing for others.
 *   createMeetupStore   meetupDrafts    모임 일정 초안 inside one group draft.
 *
 * All three are PRIVATE (privacy.js): never synced, never in global search, never shared with family.
 * There is no network here and nothing produces a notification.
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { newId } from './life-contracts.js';
import { normalizePost, normalizeGroup, normalizeMeetup, COMMUNITY_LIMITS, privacyCheck } from './community-contracts.js';

export const COMMUNITY_DELIVERY = Object.freeze({ published: false, visibleToOthers: false, server: false });

/* a list collection with id-keyed items, damaged entries skipped, duplicates dropped */
function listStore(storage, collection, normalize, now) {
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
  const write = (items) => storage.set(collection, { schemaVersion: SCHEMA_VERSION, items });
  return { read, write };
}
const fail = (e, code) => ({ ok: false, reason: e instanceof ContractError ? e.code : code });

export function createPostStore(storage, { now = () => Date.now(), makeId = () => newId('cp', now()) } = {}) {
  const s = listStore(storage, 'communityPosts', normalizePost, now);
  const list = () => s.read().sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id));

  function save(input, id = null) {
    const src = isPlainObject(input) ? input : {};
    if (privacyCheck(src.title, src.body).blocked) return { ok: false, reason: 'SENSITIVE_NUMBER' };
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
    return s.write(items) ? { ok: true, post, check: privacyCheck(post.title, post.body) } : { ok: false, reason: 'STORAGE_FULL' };
  }

  function remove(id) {
    const items = s.read();
    const next = items.filter((p) => p.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    return { ok: s.write(next) };
  }

  return Object.freeze({ list, get: (id) => s.read().find((p) => p.id === id) || null, add: (input) => save(input), update: (id, input) => save(input, id), remove, count: () => s.read().length, delivery: COMMUNITY_DELIVERY });
}

export function createGroupStore(storage, { now = () => Date.now(), makeId = () => newId('gd', now()), meetups = null } = {}) {
  const s = listStore(storage, 'groupDrafts', normalizeGroup, now);
  const list = () => s.read().sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id));

  function save(input, id = null) {
    const src = isPlainObject(input) ? input : {};
    if (privacyCheck(src.name, src.description).blocked) return { ok: false, reason: 'SENSITIVE_NUMBER' };
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
    if (privacyCheck(src.title, src.placeText, src.description).blocked) return { ok: false, reason: 'SENSITIVE_NUMBER' };
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

  return Object.freeze({ listFor, add: (groupId, input) => save(groupId, input), update: (id, input) => save(null, input, id), remove, removeForGroup, count: () => s.read().length });
}
