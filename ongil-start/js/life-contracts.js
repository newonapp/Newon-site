/*
 * Daily-life contracts introduced with Home V1 (Phase 2A) and shared with My Life (Phase 2B) and
 * Health / Check-in (Phase 3):  CheckIn · CalendarEvent · Medication · MedicationLog · DailyLife
 *
 * Deliberately small. These are things the user writes down for themselves:
 *   - a check-in is a self-reported mood for one day. It is not a safety or health confirmation.
 *   - a medication is a name, a time and a memo typed by the user. No dose, no advice, no interaction data.
 *   - daily life is three plain counts. Nothing is scored or evaluated.
 */
import { SCHEMA_VERSION, ContractError, isPlainObject, safeText } from './contracts.js';
import { isDateKey, isTime } from './dates.js';

const opt = (id, label) => Object.freeze({ id, label });

export const CHECKIN_STATUSES = Object.freeze([opt('good', '좋아요'), opt('okay', '괜찮아요'), opt('hard', '조금 힘들어요'), opt('help', '도움이 필요해요')]);

export const LIFE_LIMITS = Object.freeze({ eventTitle: 80, medicationName: 40, memo: 100, meals: 3, water: 20, events: 1000, medications: 50, days: 366, logDays: 120 });

const ID_RE = /^[a-z]{2,4}_[a-z0-9]{6,40}$/;
const stamp = (value, fallback) => (Number.isSafeInteger(value) && value > 0 ? value : fallback);
const intIn = (value, min, max, fallback) => (Number.isInteger(value) && value >= min && value <= max ? value : fallback);

export function newId(prefix, now = Date.now(), random = Math.random) {
  return `${prefix}_${now.toString(36)}${Math.floor(random() * 36 ** 6).toString(36).padStart(6, '0')}`;
}
export function isId(value) {
  return typeof value === 'string' && ID_RE.test(value);
}

export function normalizeCheckIn(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_CHECKIN');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  if (!CHECKIN_STATUSES.some((s) => s.id === input.status)) throw new ContractError('INVALID_STATUS');
  return { schemaVersion: SCHEMA_VERSION, id: `checkin:${input.date}`, date: input.date, status: input.status, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
}

export function normalizeEvent(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_EVENT');
  if (!isId(input.id)) throw new ContractError('INVALID_ID');
  const title = safeText(input.title, LIFE_LIMITS.eventTitle);
  if (!title) throw new ContractError('INVALID_TITLE');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  const time = input.time === undefined || input.time === null || input.time === '' ? '' : input.time;
  if (time !== '' && !isTime(time)) throw new ContractError('INVALID_TIME');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, title, date: input.date, time, completed: input.completed === true, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
}

export function normalizeMedication(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_MEDICATION');
  if (!isId(input.id)) throw new ContractError('INVALID_ID');
  const name = safeText(input.name, LIFE_LIMITS.medicationName);
  if (!name) throw new ContractError('INVALID_NAME');
  const time = input.time === undefined || input.time === null || input.time === '' ? '' : input.time;
  if (time !== '' && !isTime(time)) throw new ContractError('INVALID_TIME');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, name, time, memo: safeText(input.memo, LIFE_LIMITS.memo), createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
}

export function normalizeMedicationLog(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_LOG');
  if (!isId(input.medicationId)) throw new ContractError('INVALID_ID');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  return { medicationId: input.medicationId, date: input.date, taken: input.taken === true, updatedAt: stamp(input.updatedAt, now) };
}

export function emptyDailyLife(date) {
  return { schemaVersion: SCHEMA_VERSION, date, meals: 0, water: 0, exercise: false, updatedAt: 0 };
}

export function normalizeDailyLife(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_DAILY_LIFE');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  return {
    schemaVersion: SCHEMA_VERSION,
    date: input.date,
    meals: intIn(input.meals, 0, LIFE_LIMITS.meals, 0),
    water: intIn(input.water, 0, LIFE_LIMITS.water, 0),
    exercise: input.exercise === true,
    updatedAt: stamp(input.updatedAt, now),
  };
}

/* keep only the newest `max` day keys of a { 'YYYY-MM-DD': value } map */
export function pruneDays(map, max) {
  const keys = Object.keys(map).filter(isDateKey).sort();
  const keep = keys.slice(-max);
  return Object.fromEntries(keep.map((k) => [k, map[k]]));
}
