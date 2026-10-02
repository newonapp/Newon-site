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

export const LIFE_LIMITS = Object.freeze({ eventTitle: 80, medicationName: 40, memo: 100, meals: 3, water: 20, events: 1000, medications: 50, days: 366, logDays: 120, exerciseMinutes: 600, taskTitle: 80, tasks: 500, routineTitle: 40, routines: 30, expenses: 2000, amount: 100000000, journalText: 1000, journalEntries: 300, checkinMemo: 200, medicationLogDays: 366, symptomOther: 40, symptomNote: 200, healthNoteText: 300, healthNotes: 700, healthNotesPerDay: 10 });

const ID_RE = /^[a-z]{2,4}_[a-z0-9]{6,40}$/;
const stamp = (value, fallback) => (Number.isSafeInteger(value) && value > 0 ? value : fallback);
const oneOf = (value, options, fallback = '') => (options.some((o) => o.id === value) ? value : fallback);
const intIn = (value, min, max, fallback) => (Number.isInteger(value) && value >= min && value <= max ? value : fallback);

export function newId(prefix, now = Date.now(), random = Math.random) {
  return `${prefix}_${now.toString(36)}${Math.floor(random() * 36 ** 6).toString(36).padStart(6, '0')}`;
}
export function isId(value) {
  return typeof value === 'string' && ID_RE.test(value);
}

/*
 * CheckIn — one record per local day.
 *   status   기분 (Phase 2A "오늘의 안부"): good · okay · hard · help
 * Phase 3 adds optional, self-reported detail. Each field is written only when the user chose it, so a
 * Phase 2A record (status only) is read unchanged and a Home-only check-in keeps exactly its old shape.
 *   body     몸 상태 (컨디션): good · okay · tired · low
 *   energy   에너지: enough · okay · low
 *   pain     통증이 있었는지: yes · no
 *   memo     짧은 메모
 * A record needs at least one of them. None of these is a measurement, a score or a judgement.
 */
export const CHECKIN_BODY = Object.freeze([opt('good', '좋아요'), opt('okay', '보통이에요'), opt('tired', '피곤해요'), opt('low', '컨디션이 떨어져요')]);
export const CHECKIN_ENERGY = Object.freeze([opt('enough', '충분해요'), opt('okay', '보통이에요'), opt('low', '부족해요')]);
export const CHECKIN_PAIN = Object.freeze([opt('no', '없어요'), opt('yes', '있어요')]);
export const CHECKIN_FIELDS = Object.freeze(['status', 'body', 'energy', 'pain', 'memo']);

export function normalizeCheckIn(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_CHECKIN');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  const hasStatus = input.status !== undefined && input.status !== null && input.status !== '';
  if (hasStatus && !CHECKIN_STATUSES.some((s) => s.id === input.status)) throw new ContractError('INVALID_STATUS');
  const extra = {};
  const body = oneOf(input.body, CHECKIN_BODY);
  const energy = oneOf(input.energy, CHECKIN_ENERGY);
  const pain = oneOf(input.pain, CHECKIN_PAIN);
  const memo = safeText(input.memo, LIFE_LIMITS.checkinMemo);
  if (body) extra.body = body;
  if (energy) extra.energy = energy;
  if (pain) extra.pain = pain;
  if (memo) extra.memo = memo;
  /* an empty check-in is not a record: the old error code is kept for it */
  if (!hasStatus && Object.keys(extra).length === 0) throw new ContractError('INVALID_STATUS');
  return { schemaVersion: SCHEMA_VERSION, id: `checkin:${input.date}`, date: input.date, ...(hasStatus ? { status: input.status } : {}), ...extra, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
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
  /* Phase 3: the days it is taken (0 = Sunday … 6 = Saturday). Missing or empty = every day, so Phase 2A entries read as 매일. */
  const picked = Array.isArray(input.daysOfWeek) ? ALL_DAYS.filter((d) => input.daysOfWeek.includes(d)) : [];
  const daysOfWeek = picked.length ? picked : [...ALL_DAYS];
  const out = { schemaVersion: SCHEMA_VERSION, id: input.id, name, time, daysOfWeek, memo: safeText(input.memo, LIFE_LIMITS.memo), createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
  /* Phase 11: which days applied FROM which date, kept when the days are changed, so a past day is read with the
     days that were set then. Absent on entries that never changed (and on everything written before Phase 11). */
  const schedule = normalizeMedicationSchedule(input.schedule);
  if (schedule.length) out.schedule = schedule;
  return out;
}
export const MEDICATION_SCHEDULE_MAX = 24;
export function normalizeMedicationSchedule(value) {
  const seen = new Map();
  for (const step of Array.isArray(value) ? value : []) {
    if (!isPlainObject(step) || !isDateKey(step.from) || !Array.isArray(step.daysOfWeek)) continue;
    const days = ALL_DAYS.filter((d) => step.daysOfWeek.includes(d));
    if (days.length) seen.set(step.from, days);
  }
  return [...seen.keys()].sort().slice(-MEDICATION_SCHEDULE_MAX).map((from) => ({ from, daysOfWeek: seen.get(from) }));
}
/* the days that applied on `date`: the latest step that had started by then; before the first step, the first step's days */
export function medicationDaysOn(medication, date) {
  const steps = Array.isArray(medication.schedule) ? medication.schedule : [];
  if (!steps.length) return medication.daysOfWeek;
  let days = steps[0].daysOfWeek;
  for (const step of steps) if (step.from <= date) days = step.daysOfWeek;
  return days;
}
export const ALL_DAYS = Object.freeze([0, 1, 2, 3, 4, 5, 6]);

export function normalizeMedicationLog(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_LOG');
  if (!isId(input.medicationId)) throw new ContractError('INVALID_ID');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  /* Phase 3: the name and time as they were when the mark was made, so editing the medication later does not rewrite the past */
  const name = safeText(input.name, LIFE_LIMITS.medicationName);
  const time = isTime(input.time) ? input.time : '';
  return { medicationId: input.medicationId, date: input.date, taken: input.taken === true, ...(name ? { name, time } : {}), updatedAt: stamp(input.updatedAt, now) };
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

/* ───────── Phase 3: SymptomRecord · HealthNote ───────── */

/*
 * SymptomRecord — what the user felt on one local day, chosen from a short list or typed under 기타.
 * One record per day (the day's list is edited, not stacked). intensity is the user's own word for how it felt
 * (약하게 / 보통 / 강하게): it is not a medical severity and nothing is inferred from it.
 */
export const SYMPTOM_TYPES = Object.freeze([opt('headache', '두통'), opt('dizzy', '어지러움'), opt('cough', '기침'), opt('runnyNose', '콧물'), opt('throat', '목 불편'), opt('stomachache', '복통'), opt('digestion', '소화 불편'), opt('muscle', '근육통'), opt('fatigue', '피로'), opt('other', '기타')]);
export const SYMPTOM_FEELINGS = Object.freeze([opt('mild', '약하게'), opt('moderate', '보통'), opt('strong', '강하게')]);

export function normalizeSymptoms(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_SYMPTOMS');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  const list = Array.isArray(input.symptoms) ? SYMPTOM_TYPES.map((t) => t.id).filter((id) => input.symptoms.includes(id)) : [];
  const other = list.includes('other') ? safeText(input.other, LIFE_LIMITS.symptomOther) : '';
  const note = safeText(input.note, LIFE_LIMITS.symptomNote);
  if (list.length === 0 && !note) throw new ContractError('EMPTY_RECORD');
  return { schemaVersion: SCHEMA_VERSION, id: `symptoms:${input.date}`, date: input.date, symptoms: list, other, intensity: list.length ? oneOf(input.intensity, SYMPTOM_FEELINGS) : '', note, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
}

/* HealthNote — a free note for one local day ("병원 다녀옴"). Several per day are allowed; each is edited or removed on its own. */
export function normalizeHealthNote(input, now = Date.now()) {
  if (!isPlainObject(input)) throw new ContractError('INVALID_NOTE');
  if (!isId(input.id)) throw new ContractError('INVALID_ID');
  if (!isDateKey(input.date)) throw new ContractError('INVALID_DATE');
  const text = journalText(input.text).slice(0, LIFE_LIMITS.healthNoteText);
  if (!text) throw new ContractError('INVALID_TEXT');
  return { schemaVersion: SCHEMA_VERSION, id: input.id, date: input.date, text, createdAt: stamp(input.createdAt, now), updatedAt: stamp(input.updatedAt, now) };
}
