/*
 * Shared plumbing for id-based record lists ({ schemaVersion, items: [...] } in one collection).
 * Each store supplies its normaliser; damaged or duplicate entries are skipped on read so one bad
 * value can never take the whole list — or the app — down.
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';

export function createRecordList(storage, { collection, normalize, limit, now }) {
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
        /* skip */
      }
    }
    return out;
  }
  const write = (items) => storage.set(collection, { schemaVersion: SCHEMA_VERSION, items });
  const fail = (e, fallback) => ({ ok: false, reason: e instanceof ContractError ? e.code : fallback });

  function insert(candidate, fallback) {
    let record;
    try {
      record = normalize({ ...candidate, createdAt: now(), updatedAt: now() }, now());
    } catch (e) {
      return fail(e, fallback);
    }
    const items = read();
    if (items.length >= limit) return { ok: false, reason: 'LIMIT' };
    items.push(record);
    return write(items) ? { ok: true, record } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  /* only the listed keys of the patch are applied; id and createdAt can never be changed */
  function patch(id, changes, allowedKeys, fallback) {
    const items = read();
    const index = items.findIndex((it) => it.id === id);
    if (index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const p = isPlainObject(changes) ? changes : {};
    const allowed = {};
    for (const key of allowedKeys) if (key in p) allowed[key] = p[key];
    let record;
    try {
      record = normalize({ ...items[index], ...allowed, id, createdAt: items[index].createdAt, updatedAt: now() }, now());
    } catch (e) {
      return fail(e, fallback);
    }
    items[index] = record;
    return write(items) ? { ok: true, record } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  function remove(id) {
    const items = read();
    const next = items.filter((it) => it.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    return { ok: write(next) };
  }

  return { read, insert, patch, remove, get: (id) => read().find((it) => it.id === id) || null };
}
