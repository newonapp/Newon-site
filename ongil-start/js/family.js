/*
 * Family on this device (Phase 4) — two small local stores and two pure helpers.
 *
 *   createFamilySharingStore   "내가 공유할 내용": the user's own choice per category (default: 공유 안 함 for all)
 *   createHelpRequestStore     "도움 요청": requests the user writes down. Kept here, never sent.
 *   buildSharePreview(levels)  what a connected family member WOULD see, in words — never the data itself
 *   familyOverview(stores)     counts for Home (choices made, open requests) — no family activity exists
 *
 * A sharing choice is a PREFERENCE, not a consent: there is no one to give consent to. When a real connection
 * exists, each category the user turns on becomes a Consent record for that one connection, confirmed by the user
 * (family-contracts.js). Nothing in this file talks to a network, and nothing here reads health records.
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { SHARE_CATEGORIES, SHARE_CATEGORY_IDS, isAllowedLevel, categoryById, normalizeHelpRequest, HELP_CATEGORIES, HELP_LIMITS } from './family-contracts.js';
import { newId } from './life-contracts.js';

export const FAMILY_DELIVERY = Object.freeze({ connected: false, sendsAnything: false, recipients: 0 });

export function createFamilySharingStore(storage, { now = () => Date.now() } = {}) {
  /* unknown categories and levels a category does not offer are dropped; everything missing is NONE */
  function levels() {
    const raw = storage.get('familySharing', null);
    const src = isPlainObject(raw) && isPlainObject(raw.levels) ? raw.levels : {};
    return Object.fromEntries(SHARE_CATEGORY_IDS.map((id) => [id, isAllowedLevel(id, src[id]) ? src[id] : 'NONE']));
  }
  function set(category, level) {
    if (!categoryById(category)) return { ok: false, reason: 'INVALID_CATEGORY' };
    if (!isAllowedLevel(category, level)) return { ok: false, reason: 'INVALID_LEVEL' };
    const next = { ...levels(), [category]: level };
    const stored = Object.fromEntries(Object.entries(next).filter(([, l]) => l !== 'NONE'));
    return { ok: storage.set('familySharing', { schemaVersion: SCHEMA_VERSION, levels: stored, updatedAt: now() }), level };
  }
  /* "모두 공유 안 함" — back to the default */
  function reset() {
    return storage.remove('familySharing');
  }
  const chosen = () => Object.entries(levels()).filter(([, l]) => l !== 'NONE').map(([id, level]) => ({ id, level }));
  return Object.freeze({ levels, set, reset, chosen, count: () => chosen().length, categories: SHARE_CATEGORIES });
}

/* what each chosen category would show — words from the contract, never the user's records */
export function buildSharePreview(levelMap) {
  const items = SHARE_CATEGORIES.filter((c) => levelMap && levelMap[c.id] && levelMap[c.id] !== 'NONE' && c.levels.includes(levelMap[c.id])).map((c) => ({ id: c.id, label: c.label, level: levelMap[c.id], text: c.words[levelMap[c.id]] }));
  return { items, empty: items.length === 0, delivered: false, recipients: 0 };
}

export function createHelpRequestStore(storage, { now = () => Date.now(), makeId = () => newId('hr', now()) } = {}) {
  function read() {
    const raw = storage.get('helpRequests', null);
    const items = isPlainObject(raw) && Array.isArray(raw.items) ? raw.items : [];
    const out = [];
    const seen = new Set();
    for (const it of items) {
      try {
        const n = normalizeHelpRequest(it, now());
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        out.push(n);
      } catch {
        /* skip damaged entries */
      }
    }
    return out;
  }
  const write = (items) => storage.set('helpRequests', { schemaVersion: SCHEMA_VERSION, items });
  const fail = (e) => ({ ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_HELP' });

  /* open ones first, newest first */
  const list = () => read().sort((a, b) => (a.status === 'resolved') - (b.status === 'resolved') || b.createdAt - a.createdAt || a.id.localeCompare(b.id));

  function add(input) {
    const src = isPlainObject(input) ? input : {};
    let request;
    try {
      request = normalizeHelpRequest({ id: makeId(), category: src.category, message: src.message, status: 'draft', createdAt: now(), updatedAt: now() }, now());
    } catch (e) {
      return fail(e);
    }
    const items = read();
    if (items.length >= HELP_LIMITS.requests) return { ok: false, reason: 'LIMIT' };
    items.push(request);
    return write(items) ? { ok: true, request } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  function update(id, patch) {
    const items = read();
    const index = items.findIndex((r) => r.id === id);
    if (index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const p = isPlainObject(patch) ? patch : {};
    let request;
    try {
      request = normalizeHelpRequest({ ...items[index], category: 'category' in p ? p.category : items[index].category, message: 'message' in p ? p.message : items[index].message, id, updatedAt: now() }, now());
    } catch (e) {
      return fail(e);
    }
    items[index] = request;
    return write(items) ? { ok: true, request } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  /* the user's own "이 일은 해결됐어요" mark — local only, nobody is told */
  function setResolved(id, resolved) {
    const items = read();
    const index = items.findIndex((r) => r.id === id);
    if (index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const t = now();
    items[index] = normalizeHelpRequest({ ...items[index], status: resolved ? 'resolved' : 'draft', resolvedAt: resolved ? t : null, updatedAt: t }, t);
    return { ok: write(items), request: items[index] };
  }

  function remove(id) {
    const items = read();
    const next = items.filter((r) => r.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    return { ok: write(next) };
  }

  return Object.freeze({ add, update, setResolved, remove, list, openCount: () => read().filter((r) => r.status === 'draft').length, count: () => read().length, categories: HELP_CATEGORIES, delivery: FAMILY_DELIVERY });
}

/* Home: facts about this device only. There is no family activity to show, and none is made up. */
export function familyOverview({ familyConnection, sharing, help }) {
  const state = familyConnection();
  return { status: state.status, connected: false, chosen: sharing.count(), openRequests: help.openCount() };
}
