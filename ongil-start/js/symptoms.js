/*
 * Symptoms — what the user felt on a day, written by the user (Phase 3).
 *
 * One record per local day: the chosen symptoms, an optional 기타 text, the user's own word for how strong it
 * felt, and a note. Saving the same day again edits that record. Nothing is inferred from it: no illness, no
 * likelihood, no severity, no emergency prompt, no advice. It stays on this device and is never searched,
 * synced or shared (privacy.js: HEALTH_ADJACENT).
 * get · save · remove · recordedDates
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { normalizeSymptoms, pruneDays, LIFE_LIMITS, SYMPTOM_TYPES, SYMPTOM_FEELINGS } from './life-contracts.js';
import { dateKey, isDateKey } from './dates.js';
import { writableDay } from './checkin.js';

export function createSymptomStore(storage, { now = () => Date.now(), today = () => dateKey(now()) } = {}) {
  function read() {
    const raw = storage.get('symptoms', null);
    return isPlainObject(raw) && isPlainObject(raw.items) ? raw.items : {};
  }
  const write = (items) => storage.set('symptoms', { schemaVersion: SCHEMA_VERSION, items: pruneDays(items, LIFE_LIMITS.days) });

  function get(date = today()) {
    if (!isDateKey(date)) return null;
    const item = read()[date];
    if (!isPlainObject(item)) return null;
    try {
      return normalizeSymptoms({ ...item, date }, now());
    } catch {
      return null;
    }
  }

  /* save(patch, date): change some of the day's fields and keep the rest. Clearing everything removes the day. */
  function save(patch, date = today()) {
    const bad = writableDay(date, today());
    if (bad) return { ok: false, reason: bad };
    const p = isPlainObject(patch) ? patch : {};
    const previous = get(date);
    const next = { symptoms: [], other: '', intensity: '', note: '', ...(previous || {}) };
    for (const key of ['symptoms', 'other', 'intensity', 'note']) if (key in p) next[key] = p[key];
    let item;
    try {
      item = normalizeSymptoms({ ...next, date, createdAt: previous ? previous.createdAt : now(), updatedAt: now() }, now());
    } catch (e) {
      if (e instanceof ContractError && e.code === 'EMPTY_RECORD' && previous) return { ok: remove(date), record: null, removed: true };
      return { ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_SYMPTOMS' };
    }
    return { ok: write({ ...read(), [date]: item }), record: item };
  }

  function remove(date = today()) {
    const items = { ...read() };
    if (!(date in items)) return false;
    delete items[date];
    return storage.set('symptoms', { schemaVersion: SCHEMA_VERSION, items });
  }

  const recordedDates = () => Object.keys(read()).filter(isDateKey).sort();

  return Object.freeze({ get, save, remove, recordedDates, types: SYMPTOM_TYPES, feelings: SYMPTOM_FEELINGS });
}
