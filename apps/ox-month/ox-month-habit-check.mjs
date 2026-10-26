/**
 * Flutter HabitStorage-compatible habit_check v2 helpers (Web).
 * Source of truth: OX MONTH HabitStorage + TodayCheckScreen._onPick
 * — tap sets O or X; re-tapping the same value does NOT clear.
 */

import {
  canonicalHabitTitleKey,
  markForHabitTitle,
  normalizeEmail,
  parseHabitCheckRoot,
  parseOxMark,
} from "./ox-month-parser.mjs";

export {
  canonicalHabitTitleKey,
  markForHabitTitle,
  parseHabitCheckRoot,
  parseOxMark,
};

/**
 * @param {unknown} email
 * @returns {string}
 */
export function habitCheckPrefsKey(email) {
  const e = normalizeEmail(email);
  return `ox_month_habit_check_${e || "guest"}_v2`;
}

/**
 * Flutter TodayCheckScreen._onPick: next mark is always the pick (never null).
 * @param {'o'|'x'|null|undefined} _current
 * @param {'o'|'x'} pick
 * @returns {'o'|'x'}
 */
export function nextMarkFromPick(_current, pick) {
  const p = parseOxMark(pick);
  if (p !== "o" && p !== "x") {
    throw new Error("invalid_ox_pick");
  }
  return p;
}

/**
 * Deep-clone a parsed habit_check root.
 * @param {Record<string, Record<string, 'o'|'x'>>} root
 */
export function cloneHabitCheckRoot(root) {
  /** @type {Record<string, Record<string, 'o'|'x'>>} */
  const out = {};
  if (!root || typeof root !== "object") return out;
  for (const [date, day] of Object.entries(root)) {
    if (!day || typeof day !== "object") continue;
    out[date] = { ...day };
  }
  return out;
}

/**
 * Apply a single O/X intention onto a habit_check root.
 * Preserves other dates and other habits on the same day.
 *
 * @param {Record<string, Record<string, 'o'|'x'>>} root
 * @param {{ dateKey: string, habitTitle: string, mark: 'o'|'x' }} intention
 * @returns {Record<string, Record<string, 'o'|'x'>>}
 */
export function applyOxIntention(root, intention) {
  const dateKey = `${intention?.dateKey ?? ""}`.trim();
  const mark = parseOxMark(intention?.mark);
  const ckey = canonicalHabitTitleKey(intention?.habitTitle);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new Error("invalid_date_key");
  }
  if (!ckey || (mark !== "o" && mark !== "x")) {
    throw new Error("invalid_ox_intention");
  }

  const next = cloneHabitCheckRoot(root);
  /** @type {Record<string, 'o'|'x'>} */
  const day = { ...(next[dateKey] || {}) };
  for (const k of Object.keys(day)) {
    if (canonicalHabitTitleKey(k) === ckey) delete day[k];
  }
  day[ckey] = mark;
  next[dateKey] = day;
  return next;
}

/**
 * Serialize habit_check root the way Flutter SharedPreferences stores it.
 * @param {Record<string, Record<string, 'o'|'x'>>} root
 * @returns {string}
 */
export function serializeHabitCheckRoot(root) {
  /** @type {Record<string, Record<string, string>>} */
  const out = {};
  const dates = Object.keys(root || {}).sort();
  for (const date of dates) {
    const day = root[date];
    if (!day || typeof day !== "object") continue;
    /** @type {Record<string, string>} */
    const dayOut = {};
    for (const [habit, mark] of Object.entries(day)) {
      const ox = parseOxMark(mark);
      if (!ox) continue;
      dayOut[canonicalHabitTitleKey(habit) || habit] = ox;
    }
    if (Object.keys(dayOut).length) out[date] = dayOut;
  }
  return JSON.stringify(out);
}

/**
 * Build PATCH body for a single habit_check prefs key.
 * @param {{ baseRevision: number, checkKey: string, checkJson: string, schemaVersion?: number }} args
 */
export function buildHabitCheckPatchBody(args) {
  const baseRevision = Number(args.baseRevision);
  const checkKey = `${args.checkKey ?? ""}`;
  const checkJson = `${args.checkJson ?? ""}`;
  const schemaVersion =
    args.schemaVersion == null ? 1 : Number(args.schemaVersion);
  if (!Number.isInteger(baseRevision) || baseRevision < 1) {
    throw new Error("invalid_base_revision");
  }
  if (!checkKey || !checkKey.startsWith("ox_month_habit_check_")) {
    throw new Error("invalid_check_key");
  }
  return {
    baseRevision: Math.trunc(baseRevision),
    schemaVersion: schemaVersion === 1 ? 1 : Math.trunc(schemaVersion),
    patch: {
      [checkKey]: checkJson,
    },
  };
}

/**
 * Parse raw prefs string → root, apply intention, return JSON string + root.
 * @param {unknown} rawCheck
 * @param {{ dateKey: string, habitTitle: string, mark: 'o'|'x' }} intention
 */
export function buildPatchedHabitCheckJson(rawCheck, intention) {
  const root = parseHabitCheckRoot(rawCheck);
  const next = applyOxIntention(root, intention);
  return {
    root: next,
    json: serializeHabitCheckRoot(next),
  };
}
