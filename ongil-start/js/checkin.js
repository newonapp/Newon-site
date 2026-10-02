/*
 * Today's check-in — a self-reported "how are you today?" kept on this device.
 *
 * It records what the user chose and nothing else. It does not confirm that anyone is safe or well, it is not
 * sent to anyone, and choosing "help" triggers nothing: no call, no message, no family alert.
 * Phase 3 (health) and Phase 4 (family, help requests) build on this contract; they are not simulated here.
 */
import { SCHEMA_VERSION, ContractError, isPlainObject } from './contracts.js';
import { normalizeCheckIn, pruneDays, LIFE_LIMITS, CHECKIN_STATUSES } from './life-contracts.js';
import { dateKey, isDateKey } from './dates.js';

export const CHECKIN_DELIVERY = Object.freeze({ sharedWithFamily: false, notifiesAnyone: false, confirmsSafety: false });

export function createCheckInStore(storage, { now = () => Date.now(), today = () => dateKey(now()) } = {}) {
  function read() {
    const raw = storage.get('checkins', null);
    return isPlainObject(raw) && isPlainObject(raw.items) ? raw.items : {};
  }
  function get(date = today()) {
    if (!isDateKey(date)) return null;
    const item = read()[date];
    if (!item) return null;
    try {
      return normalizeCheckIn({ ...item, date }, now());
    } catch {
      return null;
    }
  }
  /* sets or changes the check-in of the current local day */
  function set(status) {
    const date = today();
    const previous = get(date);
    let item;
    try {
      item = normalizeCheckIn({ date, status, createdAt: previous ? previous.createdAt : now(), updatedAt: now() }, now());
    } catch (e) {
      return { ok: false, reason: e instanceof ContractError ? e.code : 'INVALID_CHECKIN' };
    }
    const items = pruneDays({ ...read(), [date]: item }, LIFE_LIMITS.days);
    return { ok: storage.set('checkins', { schemaVersion: SCHEMA_VERSION, items }), checkIn: item, changed: !!previous && previous.status !== status };
  }
  function clear() {
    const items = { ...read() };
    if (!(today() in items)) return false;
    delete items[today()];
    return storage.set('checkins', { schemaVersion: SCHEMA_VERSION, items });
  }
  return Object.freeze({ get, set, clear, statuses: CHECKIN_STATUSES, delivery: CHECKIN_DELIVERY });
}
