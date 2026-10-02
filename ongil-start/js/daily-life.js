/*
 * Daily life — one record per local day, shared by Home (counts) and My Life (detail).
 *
 *   Home      meals 0–3 · water · exercise yes/no
 *   My Life   which meals (아침 / 점심 / 저녁) · exercise type, minutes, memo
 *
 * Both write the same record, so the two screens can never disagree:
 *   - setting a meal count that differs from the checked slots clears the slots (the count is what was said last);
 *   - checking slots sets the count to the number of checked slots;
 *   - turning exercise off clears its detail.
 * Plain counts the user sets. Nothing is evaluated, scored or compared with a target.
 */
import { SCHEMA_VERSION, isPlainObject } from './contracts.js';
import { normalizeDailyLife, normalizeMealSlots, countMeals, emptyDailyLife, pruneDays, LIFE_LIMITS, EXERCISE_TYPES } from './life-contracts.js';
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

  /*
   * patch (all optional): meals · mealSlots · water · exercise · exerciseType · exerciseMinutes · exerciseMemo
   * date defaults to the current local day. Out-of-range values are refused, never clamped.
   */
  function update(patch, date = today()) {
    const p = isPlainObject(patch) ? patch : {};
    if (!isDateKey(date)) return { ok: false, reason: 'INVALID_DATE' };
    if ('meals' in p && !(Number.isInteger(p.meals) && p.meals >= 0 && p.meals <= LIFE_LIMITS.meals)) return { ok: false, reason: 'INVALID_MEALS' };
    if ('mealSlots' in p && p.mealSlots !== null && !isPlainObject(p.mealSlots)) return { ok: false, reason: 'INVALID_MEALS' };
    if ('water' in p && !(Number.isInteger(p.water) && p.water >= 0 && p.water <= LIFE_LIMITS.water)) return { ok: false, reason: 'INVALID_WATER' };
    if ('exercise' in p && typeof p.exercise !== 'boolean') return { ok: false, reason: 'INVALID_EXERCISE' };
    if ('exerciseType' in p && p.exerciseType !== '' && !EXERCISE_TYPES.some((t) => t.id === p.exerciseType)) return { ok: false, reason: 'INVALID_EXERCISE_TYPE' };
    if ('exerciseMinutes' in p && p.exerciseMinutes !== null && !(Number.isInteger(p.exerciseMinutes) && p.exerciseMinutes >= 1 && p.exerciseMinutes <= LIFE_LIMITS.exerciseMinutes)) return { ok: false, reason: 'INVALID_MINUTES' };

    const current = get(date);
    const next = { ...current };
    if ('mealSlots' in p) {
      next.mealSlots = { ...(current.mealSlots || {}), ...(normalizeMealSlots(p.mealSlots) ? p.mealSlots : {}) };
      if (p.mealSlots === null) next.mealSlots = null;
      next.meals = next.mealSlots ? countMeals(normalizeMealSlots(next.mealSlots)) : current.meals;
    } else if ('meals' in p) {
      next.meals = p.meals;
      if (current.mealSlots && countMeals(current.mealSlots) !== p.meals) next.mealSlots = null;
    }
    for (const key of ['water', 'exercise', 'exerciseType', 'exerciseMinutes', 'exerciseMemo']) if (key in p) next[key] = p[key];
    /* giving a type, minutes or memo means the user did exercise */
    if (!('exercise' in p) && ['exerciseType', 'exerciseMinutes', 'exerciseMemo'].some((k) => k in p && p[k])) next.exercise = true;

    const record = normalizeDailyLife({ ...next, date, updatedAt: now() }, now());
    const items = pruneDays({ ...read(), [date]: record }, LIFE_LIMITS.days);
    return { ok: storage.set('dailyLife', { schemaVersion: SCHEMA_VERSION, items }), dailyLife: record };
  }

  /* days that hold a record, newest first — for "looking back" views */
  function recordedDates() {
    return Object.keys(read()).filter(isDateKey).sort().reverse();
  }

  return Object.freeze({ get, update, recordedDates, limits: LIFE_LIMITS });
}
