/*
 * Today's daily life — meals (0–3), glasses of water, and whether the user walked or exercised.
 * Plain counts the user sets. Nothing is evaluated, scored or compared with a target.
 * Phase 2B replaces the counts with MealRecord / ExerciseRecord detail; the day key stays the same.
 */
import { SCHEMA_VERSION, isPlainObject } from './contracts.js';
import { normalizeDailyLife, emptyDailyLife, pruneDays, LIFE_LIMITS } from './life-contracts.js';
import { dateKey, isDateKey } from './dates.js';

export function createDailyLifeStore(storage, { now = () => Date.now(), today = () => dateKey(now()) } = {}) {
  function read() {
    const raw = storage.get('dailyLife', null);
    return isPlainObject(raw) && isPlainObject(raw.items) ? raw.items : {};
  }
  function get(date = today()) {
    if (!isDateKey(date)) return null;
    const item = read()[date];
    if (!item) return emptyDailyLife(date);
    try {
      return normalizeDailyLife({ ...item, date }, now());
    } catch {
      return emptyDailyLife(date);
    }
  }
  /* patch: { meals?, water?, exercise? } for the current local day. Out-of-range numbers are refused. */
  function update(patch) {
    const p = isPlainObject(patch) ? patch : {};
    if ('meals' in p && !(Number.isInteger(p.meals) && p.meals >= 0 && p.meals <= LIFE_LIMITS.meals)) return { ok: false, reason: 'INVALID_MEALS' };
    if ('water' in p && !(Number.isInteger(p.water) && p.water >= 0 && p.water <= LIFE_LIMITS.water)) return { ok: false, reason: 'INVALID_WATER' };
    if ('exercise' in p && typeof p.exercise !== 'boolean') return { ok: false, reason: 'INVALID_EXERCISE' };
    const date = today();
    const current = get(date);
    const next = normalizeDailyLife({ ...current, ...('meals' in p ? { meals: p.meals } : {}), ...('water' in p ? { water: p.water } : {}), ...('exercise' in p ? { exercise: p.exercise } : {}), date, updatedAt: now() }, now());
    const items = pruneDays({ ...read(), [date]: next }, LIFE_LIMITS.days);
    return { ok: storage.set('dailyLife', { schemaVersion: SCHEMA_VERSION, items }), dailyLife: next };
  }
  return Object.freeze({ get, update, limits: LIFE_LIMITS });
}
