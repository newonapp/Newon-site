/*
 * Schedule — CalendarEvent store. Home shows one day; the full calendar (Phase 2B) reads the same collection.
 * add · update · toggle · remove · get · listForDate
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { normalizeEvent, newId, LIFE_LIMITS } from './life-contracts.js';
import { dateKey } from './dates.js';

export function createScheduleStore(storage, { now = () => Date.now(), today = () => dateKey(now()), makeId = () => newId('ev', now()) } = {}) {
  function read() {
    const raw = storage.get('events', null);
    const items = isPlainObject(raw) && Array.isArray(raw.items) ? raw.items : [];
    const out = [];
    const seen = new Set();
    for (const it of items) {
      try {
        const n = normalizeEvent(it, now());
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        out.push(n);
      } catch {
        /* a damaged entry is skipped */
      }
    }
    return out;
  }
  const write = (items) => storage.set('events', { schemaVersion: SCHEMA_VERSION, items });
  const fail = (e) => ({ ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_EVENT' });

  function add(input) {
    const src = isPlainObject(input) ? input : {};
    let event;
    try {
      event = normalizeEvent({ id: makeId(), title: src.title, date: src.date === undefined ? today() : src.date, time: src.time, completed: false, createdAt: now(), updatedAt: now() }, now());
    } catch (e) {
      return fail(e);
    }
    const items = read();
    if (items.length >= LIFE_LIMITS.events) return { ok: false, reason: 'LIMIT' };
    items.push(event);
    return write(items) ? { ok: true, event } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  function update(id, patch) {
    const items = read();
    const index = items.findIndex((it) => it.id === id);
    if (index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const p = isPlainObject(patch) ? patch : {};
    const allowed = {};
    for (const key of ['title', 'date', 'time', 'completed']) if (key in p) allowed[key] = p[key];
    let event;
    try {
      event = normalizeEvent({ ...items[index], ...allowed, id, createdAt: items[index].createdAt, updatedAt: now() }, now());
    } catch (e) {
      return fail(e);
    }
    items[index] = event;
    return write(items) ? { ok: true, event } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  function toggle(id) {
    const current = get(id);
    return current ? update(id, { completed: !current.completed }) : { ok: false, reason: 'NOT_FOUND' };
  }

  function remove(id) {
    const items = read();
    const next = items.filter((it) => it.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    return { ok: write(next) };
  }

  function get(id) {
    return read().find((it) => it.id === id) || null;
  }

  /* timed events first in time order, then untimed ones in the order they were written */
  function listForDate(date = today()) {
    return read()
      .filter((it) => it.date === date)
      .sort((a, b) => (a.time === '' ? 1 : 0) - (b.time === '' ? 1 : 0) || a.time.localeCompare(b.time) || a.createdAt - b.createdAt || a.id.localeCompare(b.id));
  }

  return Object.freeze({ add, update, toggle, remove, get, listForDate, count: () => read().length });
}
