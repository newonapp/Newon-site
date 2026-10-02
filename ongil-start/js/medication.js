/*
 * Medication — a list the user writes (name · time · days · memo) and a per-day "taken" mark.
 *
 *   plan  (medications)     what the user takes: name, time, which days (every day by default), memo
 *   log   (medicationLogs)  per local day: which ones the user marked as taken, with the name and time as they
 *                           were at that moment — editing the plan later does not rewrite past days
 *
 * This is a personal reminder list, not medical guidance: there is no dose, no interaction or suitability check,
 * nothing here recommends starting, stopping or changing a medicine, and an unmarked one is stated as a fact
 * ("아직 복용하지 않았어요"), never as a warning. The time is shown on screen only; no OS notification is set.
 * add · update · remove · list · setTaken · isTaken · listForDate · historyForDate · loggedDates
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { normalizeMedication, normalizeMedicationLog, newId, pruneDays, LIFE_LIMITS, isId, takesOn } from './life-contracts.js';
import { dateKey, isDateKey, weekdayOf } from './dates.js';
import { writableDay } from './checkin.js';

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

  /* logs: { 'YYYY-MM-DD': { <medicationId>: { taken, updatedAt, name?, time? } } } — kept for LIFE_LIMITS.medicationLogDays days */
  function readLogs() {
    const raw = storage.get('medicationLogs', null);
    return isPlainObject(raw) && isPlainObject(raw.items) ? raw.items : {};
  }
  const writeLogs = (items) => storage.set('medicationLogs', { schemaVersion: SCHEMA_VERSION, items: pruneDays(items, LIFE_LIMITS.medicationLogDays) });

  function list() {
    return read().sort((a, b) => (a.time === '' ? 1 : 0) - (b.time === '' ? 1 : 0) || a.time.localeCompare(b.time) || a.createdAt - b.createdAt || a.id.localeCompare(b.id));
  }

  function add(input) {
    const src = isPlainObject(input) ? input : {};
    let medication;
    try {
      medication = normalizeMedication({ id: makeId(), name: src.name, time: src.time, daysOfWeek: src.daysOfWeek, memo: src.memo, createdAt: now(), updatedAt: now() }, now());
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
    for (const key of ['name', 'time', 'daysOfWeek', 'memo']) if (key in p) allowed[key] = p[key];
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

  /* marks one day; today or a past day inside the kept window can be corrected, a future day cannot */
  function setTaken(id, taken, date = today()) {
    const medication = isId(id) ? read().find((it) => it.id === id) : null;
    if (!medication) return { ok: false, reason: 'NOT_FOUND' };
    if (!isDateKey(date)) return { ok: false, reason: 'INVALID_DATE' };
    const bad = writableDay(date, today(), LIFE_LIMITS.medicationLogDays);
    if (bad) return { ok: false, reason: bad };
    const logs = readLogs();
    const day = isPlainObject(logs[date]) ? { ...logs[date] } : {};
    const before = isPlainObject(day[id]) ? day[id] : null;
    /* the snapshot is taken the first time the day is marked and kept on later corrections of that day */
    const name = before && typeof before.name === 'string' && before.name ? before.name : medication.name;
    const time = before && typeof before.name === 'string' && before.name ? before.time : medication.time;
    const log = normalizeMedicationLog({ medicationId: id, date, taken: taken === true, name, time, updatedAt: now() }, now());
    day[id] = { taken: log.taken, updatedAt: log.updatedAt, ...(log.name ? { name: log.name, time: log.time } : {}) };
    return { ok: writeLogs({ ...logs, [date]: day }), log };
  }

  function isTaken(id, date = today()) {
    const day = readLogs()[date];
    return isPlainObject(day) && isPlainObject(day[id]) && day[id].taken === true;
  }

  /* the medications planned for one day (by weekday) with that day's mark; a new day starts with every mark cleared */
  function listForDate(date = today()) {
    const weekday = weekdayOf(date);
    return list()
      .filter((m) => takesOn(m, weekday))
      .map((m) => ({ ...m, taken: isTaken(m.id, date) }));
  }

  /*
   * historyForDate(date) → what that day looked like, for 내 생활 › 건강.
   *   - a medication marked that day is shown with the name and time saved with the mark
   *   - a medication that was planned that day (weekday, and already written down by then) but not marked is
   *     shown as not marked — a plain fact, no warning
   * Each row: { id, name, time, memo, taken, marked }.
   */
  function historyForDate(date = today()) {
    if (!isDateKey(date)) return [];
    const weekday = weekdayOf(date);
    const day = readLogs()[date];
    const marks = isPlainObject(day) ? day : {};
    const rows = [];
    for (const m of list()) {
      const mark = isPlainObject(marks[m.id]) ? marks[m.id] : null;
      const planned = takesOn(m, weekday) && dateKey(m.createdAt) <= date;
      if (!mark && !planned) continue;
      const snap = mark && typeof mark.name === 'string' && mark.name ? mark : null;
      rows.push({ id: m.id, name: snap ? snap.name : m.name, time: snap ? (typeof snap.time === 'string' ? snap.time : '') : m.time, memo: m.memo, daysOfWeek: m.daysOfWeek, taken: !!mark && mark.taken === true, marked: !!mark });
    }
    return rows.sort((a, b) => (a.time === '' ? 1 : 0) - (b.time === '' ? 1 : 0) || a.time.localeCompare(b.time) || a.name.localeCompare(b.name));
  }

  const loggedDates = () => Object.keys(readLogs()).filter(isDateKey).sort();

  return Object.freeze({ add, update, remove, list, setTaken, isTaken, listForDate, historyForDate, loggedDates, count: () => read().length });
}
