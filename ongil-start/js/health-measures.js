/*
 * Health measures (Completion V1) — the numbers a person reads off their own scale, blood-pressure monitor or glucose
 * meter and writes down: 체중 · 혈압 · 혈당 · 맥박, with an optional time, "언제 쟀는지" and memo.
 *
 * A record is a number the user typed, kept as written. Nothing here judges it: no normal range, no high/low word,
 * no colour, no score, no trend verdict, no advice. Several per day (MEASURE_LIMITS.perDay); records older than the
 * kept window (LIFE_LIMITS.days) are dropped on the next write, like the other day records. Today and past days only.
 * Local only; never searched, synced, shared with family, sent to analytics or read by the assistant
 * (privacy.js: HEALTH_ADJACENT).
 * add · update · remove · listForDate · countForDate · recent · recordedDates · count
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { normalizeHealthMeasure, parseMeasureValue, newId, LIFE_LIMITS, MEASURE_LIMITS } from './life-contracts.js';
import { dateKey, isDateKey, addDays } from './dates.js';
import { writableDay } from './checkin.js';

export function createHealthMeasureStore(storage, { now = () => Date.now(), today = () => dateKey(now()), makeId = () => newId('hm', now()) } = {}) {
  function read() {
    const raw = storage.get('healthMeasures', null);
    const items = isPlainObject(raw) && Array.isArray(raw.items) ? raw.items : [];
    const out = [];
    const seen = new Set();
    for (const it of items) {
      try {
        const m = normalizeHealthMeasure(it, now());
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        out.push(m);
      } catch {
        /* skip damaged entries */
      }
    }
    return out;
  }
  function write(items) {
    const oldest = addDays(today(), -(LIFE_LIMITS.days - 1));
    return storage.set('healthMeasures', { schemaVersion: SCHEMA_VERSION, items: items.filter((m) => m.date >= oldest) });
  }
  const fail = (e) => ({ ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_MEASURE' });
  /* within a day: by the time written (no time → after timed ones), then by when it was entered */
  const order = (a, b) => (a.time || '99:99').localeCompare(b.time || '99:99') || a.createdAt - b.createdAt || a.id.localeCompare(b.id);
  const listForDate = (date = today()) => (isDateKey(date) ? read().filter((m) => m.date === date).sort(order) : []);

  /* input: { type, text ("62.5" / "120/80"), date?, time?, timing?, memo? } */
  function build(base, src) {
    const type = 'type' in src ? src.type : base.type;
    const parsed = 'text' in src ? parseMeasureValue(type, src.text) : { value: base.value, value2: base.value2 };
    return normalizeHealthMeasure({ ...base, type, value: parsed.value, value2: parsed.value2, time: 'time' in src ? src.time : base.time, timing: 'timing' in src ? src.timing : base.timing, memo: 'memo' in src ? src.memo : base.memo }, now());
  }

  function add(input, date = today()) {
    const src = isPlainObject(input) ? input : {};
    const day = isDateKey(src.date) ? src.date : date;
    const bad = writableDay(day, today());
    if (bad) return { ok: false, reason: bad };
    let m;
    try {
      m = build({ id: makeId(), date: day, createdAt: now(), updatedAt: now() }, src);
    } catch (e) {
      return fail(e);
    }
    const items = read();
    if (items.filter((x) => x.date === day).length >= MEASURE_LIMITS.perDay || items.length >= MEASURE_LIMITS.total) return { ok: false, reason: 'LIMIT' };
    items.push(m);
    return write(items) ? { ok: true, measure: m } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  function update(id, patch) {
    const items = read();
    const index = items.findIndex((m) => m.id === id);
    if (index < 0) return { ok: false, reason: 'NOT_FOUND' };
    const p = isPlainObject(patch) ? { ...patch } : {};
    delete p.date;   /* a record stays on its day */
    let m;
    try {
      m = build({ ...items[index], updatedAt: now() }, p);
    } catch (e) {
      return fail(e);
    }
    items[index] = m;
    return write(items) ? { ok: true, measure: m } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  function remove(id) {
    const items = read();
    const next = items.filter((m) => m.id !== id);
    if (next.length === items.length) return { ok: false, reason: 'NOT_FOUND' };
    return { ok: write(next) };
  }

  /* the newest `n` records of one kind, newest first — shown as a plain list, never as a verdict */
  function recent(type, n = 7) {
    return read().filter((m) => m.type === type).sort((a, b) => b.date.localeCompare(a.date) || order(b, a)).slice(0, Math.max(0, n));
  }

  const recordedDates = () => [...new Set(read().map((m) => m.date))].sort();

  return Object.freeze({ add, update, remove, listForDate, countForDate: (date) => listForDate(date).length, recent, recordedDates, count: () => read().length });
}
