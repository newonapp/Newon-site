/*
 * Routines — repeated habits the user defines (title · days of the week · optional time · active),
 * with a separate per-day completion log. No routine is ever created for the user.
 *
 * add · update · remove · list · listForDate(date) · setCompleted(id, completed, date)
 */
import { SCHEMA_VERSION, isPlainObject } from './contracts.js';
import { normalizeRoutine, normalizeRoutineLog, newId, pruneDays, isId, LIFE_LIMITS } from './life-contracts.js';
import { createRecordList } from './record-store.js';
import { dateKey, isDateKey, weekdayOf } from './dates.js';

export function createRoutineStore(storage, { now = () => Date.now(), today = () => dateKey(now()), makeId = () => newId('rt', now()) } = {}) {
  const list = createRecordList(storage, { collection: 'routines', normalize: normalizeRoutine, limit: LIFE_LIMITS.routines, now });
  const wrap = (r) => (r.ok ? { ok: true, routine: r.record } : r);

  /* logs: { 'YYYY-MM-DD': { <routineId>: { completed, updatedAt } } } */
  function readLogs() {
    const raw = storage.get('routineLogs', null);
    return isPlainObject(raw) && isPlainObject(raw.items) ? raw.items : {};
  }
  const writeLogs = (items) => storage.set('routineLogs', { schemaVersion: SCHEMA_VERSION, items: pruneDays(items, LIFE_LIMITS.logDays) });

  const order = (a, b) => (a.time === '' ? 1 : 0) - (b.time === '' ? 1 : 0) || a.time.localeCompare(b.time) || a.createdAt - b.createdAt || a.id.localeCompare(b.id);

  function isCompleted(id, date = today()) {
    const day = readLogs()[date];
    return isPlainObject(day) && isPlainObject(day[id]) && day[id].completed === true;
  }

  /* active routines scheduled on the weekday of `date`, each with that day's completion */
  function listForDate(date = today()) {
    const weekday = weekdayOf(date);
    /* a day that was marked keeps its routine even after the routine's days were changed or it was paused */
    const day = readLogs()[date];
    const marked = (id) => isPlainObject(day) && isPlainObject(day[id]) && day[id].completed === true;
    return list
      .read()
      .filter((r) => (r.active && r.daysOfWeek.includes(weekday)) || marked(r.id))
      .sort(order)
      .map((r) => ({ ...r, completed: isCompleted(r.id, date) }));
  }

  function setCompleted(id, completed, date = today()) {
    if (!isId(id) || !list.get(id)) return { ok: false, reason: 'NOT_FOUND' };
    if (!isDateKey(date)) return { ok: false, reason: 'INVALID_DATE' };
    const log = normalizeRoutineLog({ routineId: id, date, completed: completed === true, updatedAt: now() }, now());
    const logs = readLogs();
    const day = isPlainObject(logs[date]) ? { ...logs[date] } : {};
    day[id] = { completed: log.completed, updatedAt: log.updatedAt };
    return { ok: writeLogs({ ...logs, [date]: day }), log };
  }

  /* removing a routine removes its log entries too */
  function remove(id) {
    const r = list.remove(id);
    if (!r.ok) return r;
    const cleaned = {};
    for (const [day, marks] of Object.entries(readLogs())) {
      if (!isPlainObject(marks)) continue;
      const rest = Object.fromEntries(Object.entries(marks).filter(([rid]) => rid !== id));
      if (Object.keys(rest).length) cleaned[day] = rest;
    }
    return { ok: writeLogs(cleaned) };
  }

  return Object.freeze({
    add: (input) => wrap(list.insert({ id: makeId(), title: input && input.title, daysOfWeek: input && input.daysOfWeek, time: input && input.time, active: !(input && input.active === false) }, 'INVALID_ROUTINE')),
    update: (id, changes) => wrap(list.patch(id, changes, ['title', 'daysOfWeek', 'time', 'active'], 'INVALID_ROUTINE')),
    remove,
    get: (id) => list.get(id),
    list: () => list.read().sort(order),
    listForDate,
    setCompleted,
    isCompleted,
    count: () => list.read().length,
  });
}
