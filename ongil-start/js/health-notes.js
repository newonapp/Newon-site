/*
 * Health notes — short free notes for a day ("병원 다녀옴", "몸이 피곤했음"), written by the user (Phase 3).
 *
 * Several per day (up to LIFE_LIMITS.healthNotesPerDay), each edited or removed on its own. Notes older than
 * the kept window (LIFE_LIMITS.days) are dropped on the next write, like the other day records.
 * Local only; never searched, synced or shared (privacy.js: HEALTH_ADJACENT).
 * add · update · remove · listForDate · countForDate · recordedDates
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { normalizeHealthNote, newId, LIFE_LIMITS } from './life-contracts.js';
import { dateKey, isDateKey, addDays } from './dates.js';
import { writableDay } from './checkin.js';

export function createHealthNoteStore(storage, { now = () => Date.now(), today = () => dateKey(now()), makeId = () => newId('hn', now()) } = {}) {
  function read() {
    const raw = storage.get('healthNotes', null);
    const items = isPlainObject(raw) && Array.isArray(raw.items) ? raw.items : [];
    const out = [];
    const seen = new Set();
    for (const it of items) {
      try {
        const n = normalizeHealthNote(it, now());
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        out.push(n);
      } catch {
        /* skip damaged entries */
      }
    }
    return out;
  }
  function write(items) {
    const oldest = addDays(today(), -(LIFE_LIMITS.days - 1));
    return storage.set('healthNotes', { schemaVersion: SCHEMA_VERSION, items: items.filter((n) => n.date >= oldest) });
  }
  const fail = (e) => ({ ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_NOTE' });

  const byTime = (a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id);
  const listForDate = (date = today()) => (isDateKey(date) ? read().filter((n) => n.date === date).sort(byTime) : []);

  function add(input, date = today()) {
    const src = isPlainObject(input) ? input : {};
    const day = isDateKey(src.date) ? src.date : date;
    const bad = writableDay(day, today());
    if (bad) return { ok: false, reason: bad };
    let note;
    try {
      note = normalizeHealthNote({ id: makeId(), date: day, text: src.text, createdAt: now(), updatedAt: now() }, now());
    } catch (e) {
      return fail(e);
    }
    const items = read();
    if (items.filter((n) => n.date === day).length >= LIFE_LIMITS.healthNotesPerDay || items.length >= LIFE_LIMITS.healthNotes) return { ok: false, reason: 'LIMIT' };
    items.push(note);
    return write(items) ? { ok: true, note } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  function update(id, patch) {
    const items = read();
    const index = items.findIndex((n) => n.id === id);
    if (index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const p = isPlainObject(patch) ? patch : {};
    let note;
    try {
      note = normalizeHealthNote({ ...items[index], text: 'text' in p ? p.text : items[index].text, id, updatedAt: now() }, now());
    } catch (e) {
      return fail(e);
    }
    items[index] = note;
    return write(items) ? { ok: true, note } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  function remove(id) {
    const items = read();
    const next = items.filter((n) => n.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    return { ok: write(next) };
  }

  const recordedDates = () => [...new Set(read().map((n) => n.date))].sort();

  return Object.freeze({ add, update, remove, listForDate, countForDate: (date) => listForDate(date).length, recordedDates, count: () => read().length });
}
