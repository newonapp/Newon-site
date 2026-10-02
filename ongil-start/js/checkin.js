/*
 * Check-in — a self-reported "how are you today?" kept on this device, one record per local day.
 *
 * Phase 2A: 기분 (status) from Home's "오늘의 안부".
 * Phase 3 : optional 몸 상태 · 에너지 · 통증 · 메모 from 내 생활 › 건강, and correcting or removing a past day.
 *
 * It records what the user chose and nothing else. It does not confirm that anyone is safe or well, nothing is
 * scored, it is not sent to anyone, and choosing "help" triggers nothing: no call, no message, no family alert.
 * Phase 4 (family, help requests) builds on this contract; it is not simulated here.
 *
 * Days: a check-in belongs to a LOCAL day. Today and the past kept window (LIFE_LIMITS.days) can be written;
 * a future day cannot — it has not happened yet.
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { normalizeCheckIn, pruneDays, LIFE_LIMITS, CHECKIN_STATUSES, CHECKIN_BODY, CHECKIN_ENERGY, CHECKIN_PAIN, CHECKIN_FIELDS } from './life-contracts.js';
import { dateKey, isDateKey, addDays } from './dates.js';

export const CHECKIN_DELIVERY = Object.freeze({ sharedWithFamily: false, notifiesAnyone: false, confirmsSafety: false });

/* '' when the day may be written, otherwise the reason */
export function writableDay(date, today, keep = LIFE_LIMITS.days) {
  if (!isDateKey(date)) return 'INVALID_DATE';
  if (date > today) return 'FUTURE_DATE';
  if (date < addDays(today, -(keep - 1))) return 'TOO_OLD';
  return '';
}

export function createCheckInStore(storage, { now = () => Date.now(), today = () => dateKey(now()) } = {}) {
  function read() {
    const raw = storage.get('checkins', null);
    return isPlainObject(raw) && isPlainObject(raw.items) ? raw.items : {};
  }
  const write = (items) => storage.set('checkins', { schemaVersion: SCHEMA_VERSION, items: pruneDays(items, LIFE_LIMITS.days) });

  function get(date = today()) {
    if (!isDateKey(date)) return null;
    const item = read()[date];
    if (!isPlainObject(item)) return null;
    try {
      return normalizeCheckIn({ ...item, date }, now());
    } catch {
      return null;
    }
  }

  /*
   * save(patch, date): change some fields of one day's check-in and keep the rest. A field set to '' is removed.
   * The same day saved again updates its one record; it never stacks a second one.
   */
  function save(patch, date = today()) {
    const bad = writableDay(date, today());
    if (bad) return { ok: false, reason: bad };
    const p = isPlainObject(patch) ? patch : {};
    const previous = get(date);
    const next = { ...(previous || {}) };
    /* an unknown choice is ignored (the earlier choice stays); '' takes a choice back */
    const options = { body: CHECKIN_BODY, energy: CHECKIN_ENERGY, pain: CHECKIN_PAIN };
    for (const key of CHECKIN_FIELDS) {
      if (!(key in p)) continue;
      if (options[key] && p[key] !== '' && !options[key].some((o) => o.id === p[key])) continue;
      next[key] = p[key];
    }
    let item;
    try {
      item = normalizeCheckIn({ ...next, date, createdAt: previous ? previous.createdAt : now(), updatedAt: now() }, now());
    } catch (e) {
      /* every field cleared: the day has nothing left, so its record goes */
      if (e instanceof ContractError && e.code === 'INVALID_STATUS' && previous && CHECKIN_FIELDS.every((k) => !next[k])) return { ok: remove(date), checkIn: null, removed: true };
      return { ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_CHECKIN' };
    }
    const items = { ...read(), [date]: item };
    return { ok: write(items), checkIn: item, changed: !!previous };
  }

  /* sets or changes the 기분 of the current local day (Home). Other fields of today's record are kept. */
  function set(status) {
    if (!CHECKIN_STATUSES.some((s) => s.id === status)) return { ok: false, reason: 'INVALID_STATUS' };
    const previous = get(today());
    const r = save({ status }, today());
    return r.ok ? { ...r, changed: !!previous && previous.status !== status } : r;
  }

  /* removes one day's whole record */
  function remove(date = today()) {
    const items = { ...read() };
    if (!(date in items)) return false;
    delete items[date];
    return storage.set('checkins', { schemaVersion: SCHEMA_VERSION, items });
  }

  /* Home "오늘 안부 지우기": clears today's 기분. Anything else written for today in 내 생활 stays. */
  function clear() {
    const current = get(today());
    if (!current) return false;
    if (CHECKIN_FIELDS.some((k) => k !== 'status' && current[k])) return save({ status: '' }, today()).ok;
    return remove(today());
  }

  const recordedDates = () => Object.keys(read()).filter(isDateKey).sort();

  return Object.freeze({ get, set, save, clear, remove, recordedDates, statuses: CHECKIN_STATUSES, body: CHECKIN_BODY, energy: CHECKIN_ENERGY, pain: CHECKIN_PAIN, delivery: CHECKIN_DELIVERY });
}
