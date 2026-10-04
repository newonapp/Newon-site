/*
 * ONGIL Saved — local-first foundation.
 *
 * save · unsave · toggle · isSaved · list({ type }) · count
 * Items live in the "saved" collection as { schemaVersion, items: SavedItem[] }. The UI talks to this store
 * only; when account sync exists the store keeps the same API and the storage layer forwards changes.
 */
import { SCHEMA_VERSION, SAVED_TYPES, LIMITS, ContractError, normalizeSavedItem, savedKey, isPlainObject } from './contracts.js';

export function createSavedStore(storage, { now = () => Date.now() } = {}) {
  function read() {
    const raw = storage.get('saved', null);
    const items = isPlainObject(raw) && Array.isArray(raw.items) ? raw.items : [];
    const seen = new Set();
    const out = [];
    for (const it of items) {
      try {
        const n = normalizeSavedItem(it, now());
        if (seen.has(n.key)) continue;
        seen.add(n.key);
        out.push(n);
      } catch {
        /* a damaged entry is skipped, the rest stay usable */
      }
    }
    return out;
  }
  function write(items) {
    return storage.set('saved', { schemaVersion: SCHEMA_VERSION, items });
  }

  function isSaved(type, id) {
    const key = savedKey(type, id);
    return read().some((it) => it.key === key);
  }

  function save(input) {
    let item;
    try {
      item = normalizeSavedItem({ ...input, savedAt: now() }, now());
    } catch (e) {
      return { ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_ITEM' };
    }
    const items = read();
    const existing = items.find((it) => it.key === item.key);
    if (existing) return { ok: true, already: true, item: existing };
    if (items.length >= LIMITS.savedItems) return { ok: false, reason: 'LIMIT' };
    items.push(item);
    if (!write(items)) return { ok: false, reason: 'STORAGE_UNAVAILABLE' };
    return { ok: true, already: false, item };
  }

  function unsave(type, id) {
    const key = savedKey(type, id);
    const items = read();
    const next = items.filter((it) => it.key !== key);
    if (next.length === items.length) return false;
    return write(next);
  }

  function toggle(input) {
    if (input && isSaved(input.type, input.id)) return { ok: unsave(input.type, input.id), saved: false };
    const r = save(input);
    return { ...r, saved: r.ok };
  }

  /* newest first; type = one of SAVED_TYPES, or omitted for everything */
  function list({ type } = {}) {
    if (type !== undefined && type !== null && type !== '' && !SAVED_TYPES.includes(type)) return [];
    const items = read().sort((a, b) => b.savedAt - a.savedAt || a.key.localeCompare(b.key));
    return type ? items.filter((it) => it.type === type) : items;
  }

  function counts() {
    const out = Object.fromEntries(SAVED_TYPES.map((t) => [t, 0]));
    for (const it of read()) out[it.type] += 1;
    return out;
  }

  return Object.freeze({ save, unsave, toggle, isSaved, list, count: () => read().length, counts });
}
