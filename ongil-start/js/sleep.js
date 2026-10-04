/*
 * Sleep — one optional record per morning (bed time · wake time · how it felt · memo).
 * "How it felt" is the user's own word (좋았어요 / 보통이에요 / 아쉬웠어요). Nothing is measured, scored or diagnosed.
 * save(date) upserts · remove · get · recent
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { normalizeSleep, pruneDays, LIFE_LIMITS } from './life-contracts.js';
import { dateKey, isDateKey } from './dates.js';

export function createSleepStore(storage, { now = () => Date.now(), today = () => dateKey(now()) } = {}) {
  function read() {
    const raw = storage.get('sleepRecords', null);
    return isPlainObject(raw) && isPlainObject(raw.items) ? raw.items : {};
  }
  const write = (items) => storage.set('sleepRecords', { schemaVersion: SCHEMA_VERSION, items: pruneDays(items, LIFE_LIMITS.days) });

  function get(date = today()) {
    if (!isDateKey(date)) return null;
    const item = read()[date];
    if (!item) return null;
    try {
      return normalizeSleep({ ...item, date }, now());
    } catch {
      return null;
    }
  }

  /* one record per date: saving again for the same date replaces it */
  function save(input) {
    const src = isPlainObject(input) ? input : {};
    const date = src.date === undefined || src.date === '' ? today() : src.date;
    let record;
    try {
      record = normalizeSleep({ date, bedTime: src.bedTime, wakeTime: src.wakeTime, quality: src.quality, memo: src.memo, updatedAt: now() }, now());
    } catch (e) {
      return { ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_SLEEP' };
    }
    const existed = !!get(date);
    return write({ ...read(), [date]: record }) ? { ok: true, sleep: record, replaced: existed } : { ok: false, reason: 'STORAGE_UNAVAILABLE' };
  }

  function remove(date) {
    const items = { ...read() };
    if (!(date in items)) return { ok: false, reason: 'NOT_FOUND' };
    delete items[date];
    return { ok: write(items) };
  }

  /* newest first */
  function recent(limit = 14) {
    return Object.keys(read())
      .filter(isDateKey)
      .sort()
      .reverse()
      .slice(0, limit)
      .map((d) => get(d))
      .filter(Boolean);
  }

  return Object.freeze({ get, save, remove, recent });
}
