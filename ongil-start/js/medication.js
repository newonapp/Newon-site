/*
 * Medication — a list the user writes (name · time · memo) and a per-day "taken" mark.
 *
 * This is a personal reminder list, not medical guidance: there is no dose, no schedule logic, no interaction
 * or suitability check, and nothing here recommends starting, stopping or changing a medicine.
 * add · update · remove · list · setTaken · listForDate
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { normalizeMedication, normalizeMedicationLog, newId, pruneDays, LIFE_LIMITS, isId } from './life-contracts.js';
import { dateKey, isDateKey } from './dates.js';

export function createMedicationStore(storage, { now = () => Date.now(), today = () => dateKey(now()), makeId = () => newId('md', now()) } = {}) {
  function read() {
    const raw = storage.get('medications', null);
    const items = isPlainObject(raw) && Array.isArray(raw.items) ? raw.items : [];
    const out = [];
    const seen = new Set();
    for (const it of items) {
      try {
        const n = normalizeMedication(it, now());
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        out.push(n);
      } catch {
        /* skip damaged entries */
      }
    }
    return out;
  }
  const write = (items) => storage.set('medications', { schemaVersion: SCHEMA_VERSION, items });
  const fail = (e) => ({ ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_MEDICATION' });

  /* logs: { 'YYYY-MM-DD': { <medicationId>: { taken, updatedAt } } } */
  function readLogs() {
    const raw = storage.get('medicationLogs', null);
    return isPlainObject(raw) && isPlainObject(raw.items) ? raw.items : {};
  }
  const writeLogs = (items) => storage.set('medicationLogs', { schemaVersion: SCHEMA_VERSION, items: pruneDays(items, LIFE_LIMITS.logDays) });

  function list() {
    return read().sort((a, b) => (a.time === '' ? 1 : 0) - (b.time === '' ? 1 : 0) || a.time.localeCompare(b.time) || a.createdAt - b.createdAt || a.id.localeCompare(b.id));
  }

  function add(input) {
    const src = isPlainObject(input) ? input : {};
    let medication;
    try {
      medication = normalizeMedication({ id: makeId(), name: src.name, time: src.time, memo: src.memo, createdAt: now(), updatedAt: now() }, now());
    } catch (e) {
      return fail(e);
    }
    const items = read();
    if (items.length >= LIFE_LIMITS.medications) return { ok: false, reason: 'LIMIT' };
    items.push(medication);
    return write(items) ? { ok: true, medication } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  function update(id, patch) {
    const items = read();
    const index = items.findIndex((it) => it.id === id);
    if (index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const p = isPlainObject(patch) ? patch : {};
    const allowed = {};
    for (const key of ['name', 'time', 'memo']) if (key in p) allowed[key] = p[key];
    let medication;
    try {
      medication = normalizeMedication({ ...items[index], ...allowed, id, createdAt: items[index].createdAt, updatedAt: now() }, now());
    } catch (e) {
      return fail(e);
    }
    items[index] = medication;
    return write(items) ? { ok: true, medication } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  /* removing a medication also removes its marks, so no orphan log refers to a name that no longer exists */
  function remove(id) {
    const items = read();
    const next = items.filter((it) => it.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    const logs = readLogs();
    const cleaned = {};
    for (const [day, marks] of Object.entries(logs)) {
      if (!isPlainObject(marks)) continue;
      const rest = Object.fromEntries(Object.entries(marks).filter(([mid]) => mid !== id));
      if (Object.keys(rest).length) cleaned[day] = rest;
    }
    return { ok: write(next) && writeLogs(cleaned) };
  }

  function setTaken(id, taken, date = today()) {
    if (!isId(id) || !read().some((it) => it.id === id)) return { ok: false, reason: 'NOT_FOUND' };
    if (!isDateKey(date)) return { ok: false, reason: 'INVALID_DATE' };
    const log = normalizeMedicationLog({ medicationId: id, date, taken: taken === true, updatedAt: now() }, now());
    const logs = readLogs();
    const day = isPlainObject(logs[date]) ? { ...logs[date] } : {};
    day[id] = { taken: log.taken, updatedAt: log.updatedAt };
    return { ok: writeLogs({ ...logs, [date]: day }), log };
  }

  function isTaken(id, date = today()) {
    const day = readLogs()[date];
    return isPlainObject(day) && isPlainObject(day[id]) && day[id].taken === true;
  }

  /* the list with a mark for one day; a new day starts with every mark cleared */
  function listForDate(date = today()) {
    return list().map((m) => ({ ...m, taken: isTaken(m.id, date) }));
  }

  return Object.freeze({ add, update, remove, list, setTaken, isTaken, listForDate, count: () => read().length });
}
