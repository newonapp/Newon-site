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

export const LIFE_LIMITS = Object.freeze({ eventTitle: 80, medicationName: 40, memo: 100, meals: 3, water: 20, events: 1000, medications: 50, days: 366, logDays: 120, exerciseMinutes: 600, taskTitle: 80, tasks: 500, routineTitle: 40, routines: 30, expenses: 2000, amount: 100000000, journalText: 1000, journalEntries: 300 });

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

/*
 * DailyLife — one record per local day.
 *   meals      0–3, the count Home sets (Phase 2A)
 *   mealSlots  optional detail from My Life (Phase 2B): which of breakfast / lunch / dinner. null = not said.
 *              When present, meals always equals the number of checked slots.
 *   water      0–20 glasses
 *   exercise   whether the user walked or exercised; exerciseType / exerciseMinutes / exerciseMemo are optional detail
 * A record written by Phase 2A (no mealSlots, no exercise detail) is read unchanged: the new fields default to
 * "not said". No migration is needed and nothing a Phase 2A reader relies on has changed.
 */
export const MEAL_SLOTS = Object.freeze([opt('breakfast', '아침'), opt('lunch', '점심'), opt('dinner', '저녁')]);
export const EXERCISE_TYPES = Object.freeze([opt('walk', '걷기'), opt('gymnastics', '체조'), opt('yoga', '요가'), opt('swim', '수영'), opt('hike', '등산'), opt('other', '기타')]);

export function emptyDailyLife(date) {
  return { schemaVersion: SCHEMA_VERSION, date, meals: 0, mealSlots: null, water: 0, exercise: false, exerciseType: '', exerciseMinutes: null, exerciseMemo: '', updatedAt: 0 };
}

export function normalizeMealSlots(input) {
  if (!isPlainObject(input)) return null;
  const out = {};
  for (const s of MEAL_SLOTS) out[s.id] = input[s.id] === true;
  return out;
}
export const countMeals = (slots) => (slots ? MEAL_SLOTS.filter((s) => slots[s.id]).length : 0);

export function normalizeDailyLife(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_DAILY_LIFE');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  const mealSlots = normalizeMealSlots(input.mealSlots);
  const exercise = input.exercise === true;
  return {
    schemaVersion: SCHEMA_VERSION,
    date: input.date,
    meals: mealSlots ? countMeals(mealSlots) : intIn(input.meals, 0, LIFE_LIMITS.meals, 0),
    mealSlots,
    water: intIn(input.water, 0, LIFE_LIMITS.water, 0),
    exercise,
    exerciseType: exercise && EXERCISE_TYPES.some((t) => t.id === input.exerciseType) ? input.exerciseType : '',
    exerciseMinutes: exercise && Number.isInteger(input.exerciseMinutes) && input.exerciseMinutes >= 1 && input.exerciseMinutes <= LIFE_LIMITS.exerciseMinutes ? input.exerciseMinutes : null,
    exerciseMemo: exercise ? safeText(input.exerciseMemo, LIFE_LIMITS.memo) : '',
    updatedAt: stamp(input.updatedAt, now),
  };
}

/* keep only the newest `max` day keys of a { 'YYYY-MM-DD': value } map */
export function pruneDays(map, max) {
  const keys = Object.keys(map).filter(isDateKey).sort();
  const keep = keys.slice(-max);
  return Object.fromEntries(keep.map((k) => [k, map[k]]));
}

/* ───────── Phase 2B: Task · Routine · RoutineLog · SleepRecord · ExpenseRecord · JournalEntry ───────── */

export const TASK_PRIORITIES = Object.freeze([opt('normal', '보통'), opt('important', '중요')]);
export const SLEEP_QUALITIES = Object.freeze([opt('good', '좋았어요'), opt('okay', '보통이에요'), opt('poor', '아쉬웠어요')]);
export const EXPENSE_CATEGORIES = Object.freeze([opt('food', '식비'), opt('living', '생활'), opt('transport', '교통'), opt('health', '건강'), opt('hobby', '취미'), opt('other', '기타')]);
export const JOURNAL_MOODS = Object.freeze([opt('good', '좋았어요'), opt('okay', '보통이에요'), opt('hard', '힘들었어요')]);

const oneOf = (value, options, fallback = '') => (options.some((o) => o.id === value) ? value : fallback);
const optionalTime = (value, code) => {
  if (value === undefined || value === null || value === '') return '';
  if (!isTime(value)) throw new ContractError(code);
  return value;
};

export function normalizeTask(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_TASK');
  if (!isId(input.id)) throw new ContractError('INVALID_ID');
  const title = safeText(input.title, LIFE_LIMITS.taskTitle);
  if (!title) throw new ContractError('INVALID_TITLE');
  const dueDate = input.dueDate === undefined || input.dueDate === null || input.dueDate === '' ? '' : input.dueDate;
  if (dueDate !== '' && !isDateKey(dueDate)) throw new ContractError('INVALID_DATE');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, title, dueDate, priority: oneOf(input.priority, TASK_PRIORITIES, 'normal'), completed: input.completed === true, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
}

/* daysOfWeek: 0 = Sunday … 6 = Saturday, at least one */
export function normalizeRoutine(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_ROUTINE');
  if (!isId(input.id)) throw new ContractError('INVALID_ID');
  const title = safeText(input.title, LIFE_LIMITS.routineTitle);
  if (!title) throw new ContractError('INVALID_TITLE');
  const days = Array.isArray(input.daysOfWeek) ? [0, 1, 2, 3, 4, 5, 6].filter((d) => input.daysOfWeek.includes(d)) : [];
  if (days.length === 0) throw new ContractError('INVALID_DAYS');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, title, daysOfWeek: days, time: optionalTime(input.time, 'INVALID_TIME'), active: input.active !== false, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
}

export function normalizeRoutineLog(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_LOG');
  if (!isId(input.routineId)) throw new ContractError('INVALID_ID');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  return { routineId: input.routineId, date: input.date, completed: input.completed === true, updatedAt: stamp(input.updatedAt, now) };
}

/* date = the morning the user woke up ("last night's sleep" belongs to today). quality is how it felt, not a score. */
export function normalizeSleep(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_SLEEP');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  const bedTime = optionalTime(input.bedTime, 'INVALID_BED_TIME');
  const wakeTime = optionalTime(input.wakeTime, 'INVALID_WAKE_TIME');
  const quality = oneOf(input.quality, SLEEP_QUALITIES);
  const memo = safeText(input.memo, LIFE_LIMITS.memo);
  if (!bedTime && !wakeTime && !quality && !memo) throw new ContractError('EMPTY_RECORD');
  return { schemaVersion: SCHEMA_VERSION, date: input.date, bedTime, wakeTime, quality, memo, updatedAt: stamp(input.updatedAt, now) };
}

/* amount: whole won, 1 … 100,000,000. Accepts a number or a digit string ("12,000" / "12000"). */
export function parseAmount(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? value : NaN;
  if (typeof value !== 'string') return NaN;
  const cleaned = value.replace(/[,\s원]/g, '');
  return /^\d{1,9}$/.test(cleaned) ? Number(cleaned) : NaN;
}

export function normalizeExpense(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_EXPENSE');
  if (!isId(input.id)) throw new ContractError('INVALID_ID');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  if (!EXPENSE_CATEGORIES.some((c) => c.id === input.category)) throw new ContractError('INVALID_CATEGORY');
  const amount = parseAmount(input.amount);
  if (!(amount >= 1 && amount <= LIFE_LIMITS.amount)) throw new ContractError('INVALID_AMOUNT');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, date: input.date, category: input.category, amount, memo: safeText(input.memo, LIFE_LIMITS.memo), createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
}

/* journal text keeps its line breaks; only control characters are removed */
export function journalText(value) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, LIFE_LIMITS.journalText);
}

export function normalizeJournal(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_JOURNAL');
  if (!isId(input.id)) throw new ContractError('INVALID_ID');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  const text = journalText(input.text);
  if (!text) throw new ContractError('INVALID_TEXT');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, date: input.date, text, mood: oneOf(input.mood, JOURNAL_MOODS), createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
}
