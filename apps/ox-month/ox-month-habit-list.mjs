/**
 * Flutter MonthHabitListStorage-compatible habit titles helpers.
 * Titles are identity keys (no stable UUID). Values must be JSON strings in Sync.
 */

import {
  canonicalHabitTitleKey,
  cloneHabitCheckRoot,
  parseHabitCheckRoot,
  serializeHabitCheckRoot,
} from "./ox-month-habit-check.mjs";
import { monthKey, normalizeEmail, parseHabitTitles } from "./ox-month-parser.mjs";

/**
 * @param {unknown} email
 * @param {string} yyyyMm
 */
export function habitTitlesPrefsKey(email, yyyyMm) {
  const e = normalizeEmail(email) || "guest";
  const m = `${yyyyMm ?? ""}`.trim();
  if (!/^\d{4}-\d{2}$/.test(m)) {
    throw new Error("invalid_month_key");
  }
  return `ox_month_habit_titles_${e}_${m}`;
}

/**
 * @param {{ title: string, part?: number }[]} entries
 * @returns {string}
 */
export function serializeHabitTitles(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const out = [];
  for (const item of list) {
    const t = canonicalHabitTitleKey(item?.title);
    if (!t) continue;
    const p = Number(item?.part ?? 2);
    out.push({
      t,
      p: Number.isFinite(p) ? Math.trunc(p) : 2,
    });
  }
  return JSON.stringify(out);
}

/**
 * @param {unknown} raw
 * @returns {{ title: string, part: number }[]}
 */
export function cloneHabitTitles(raw) {
  return parseHabitTitles(raw).map((h) => ({ title: h.title, part: h.part }));
}

/**
 * @param {{ title: string, part: number }[]} entries
 * @param {string} title
 * @param {number} [part]
 */
export function addHabitEntry(entries, title, part = 2) {
  const t = canonicalHabitTitleKey(title);
  if (!t) throw new Error("invalid_habit_title");
  const next = cloneHabitTitles(entries);
  if (next.some((h) => canonicalHabitTitleKey(h.title) === t)) {
    throw new Error("duplicate_habit_title");
  }
  const p = Number(part);
  next.push({
    title: t,
    part: Number.isFinite(p) ? Math.trunc(p) : 2,
  });
  return next;
}

/**
 * @param {{ title: string, part: number }[]} entries
 * @param {string} title
 * @param {number} part
 */
export function setHabitPartEntry(entries, title, part) {
  const key = canonicalHabitTitleKey(title);
  const next = cloneHabitTitles(entries);
  const idx = next.findIndex((h) => canonicalHabitTitleKey(h.title) === key);
  if (idx < 0) throw new Error("habit_not_found");
  const p = Number(part);
  const clamped = Number.isFinite(p) ? Math.trunc(p) : 2;
  next[idx] = {
    title: next[idx].title,
    part: clamped === 0 || clamped === 1 || clamped === 2 ? clamped : 2,
  };
  return next;
}

/**
 * Rename in titles list. Does not touch check root (caller migrates checks).
 * @param {{ title: string, part: number }[]} entries
 * @param {string} oldTitle
 * @param {string} newTitle
 */
export function renameHabitEntry(entries, oldTitle, newTitle) {
  const from = canonicalHabitTitleKey(oldTitle);
  const to = canonicalHabitTitleKey(newTitle);
  if (!from || !to) throw new Error("invalid_habit_title");
  if (from === to) return cloneHabitTitles(entries);
  const next = cloneHabitTitles(entries);
  const idx = next.findIndex((h) => canonicalHabitTitleKey(h.title) === from);
  if (idx < 0) throw new Error("habit_not_found");
  if (
    next.some(
      (h, i) => i !== idx && canonicalHabitTitleKey(h.title) === to,
    )
  ) {
    throw new Error("duplicate_habit_title");
  }
  next[idx] = { title: to, part: next[idx].part };
  return next;
}

/**
 * @param {{ title: string, part: number }[]} entries
 * @param {string} title
 */
export function removeHabitEntry(entries, title) {
  const key = canonicalHabitTitleKey(title);
  if (!key) throw new Error("invalid_habit_title");
  const next = cloneHabitTitles(entries).filter(
    (h) => canonicalHabitTitleKey(h.title) !== key,
  );
  if (next.length === cloneHabitTitles(entries).length) {
    throw new Error("habit_not_found");
  }
  return next;
}

/**
 * Preserve O/X history across title rename (web improvement over Flutter,
 * which only rewrites the titles list). Compatible with Flutter title keys.
 *
 * @param {Record<string, Record<string, 'o'|'x'>>} root
 * @param {string} oldTitle
 * @param {string} newTitle
 */
export function renameHabitInCheckRoot(root, oldTitle, newTitle) {
  const from = canonicalHabitTitleKey(oldTitle);
  const to = canonicalHabitTitleKey(newTitle);
  if (!from || !to) throw new Error("invalid_habit_title");
  if (from === to) return cloneHabitCheckRoot(root);
  const next = cloneHabitCheckRoot(root);
  for (const date of Object.keys(next)) {
    const day = { ...next[date] };
    let mark = null;
    for (const k of Object.keys(day)) {
      if (canonicalHabitTitleKey(k) === from) {
        mark = day[k];
        delete day[k];
      }
    }
    if (mark) {
      for (const k of Object.keys(day)) {
        if (canonicalHabitTitleKey(k) === to) delete day[k];
      }
      day[to] = mark;
    }
    next[date] = day;
  }
  return next;
}

/**
 * Build local payload mutation for add/rename/delete habit in a month.
 *
 * @param {Record<string, unknown>} payload
 * @param {{
 *   email: string,
 *   month: string,
 *   action: 'add'|'rename'|'delete',
 *   title?: string,
 *   newTitle?: string,
 *   part?: number,
 * }} op
 */
export function applyHabitListMutation(payload, op) {
  const email = normalizeEmail(op.email);
  const month = op.month || monthKey(new Date());
  const titlesKey = habitTitlesPrefsKey(email, month);
  const checkKey = `ox_month_habit_check_${email || "guest"}_v2`;
  const prefs = { ...(payload || {}) };
  let entries = parseHabitTitles(prefs[titlesKey]);

  if (op.action === "add") {
    entries = addHabitEntry(entries, op.title, op.part ?? 2);
    prefs[titlesKey] = serializeHabitTitles(entries);
    return { payload: prefs, titlesKey, checkKey, checkChanged: false };
  }

  if (op.action === "rename") {
    const from = canonicalHabitTitleKey(op.title);
    const to = canonicalHabitTitleKey(op.newTitle);
    entries = renameHabitEntry(entries, from, to);
    prefs[titlesKey] = serializeHabitTitles(entries);
    const root = renameHabitInCheckRoot(
      parseHabitCheckRoot(prefs[checkKey]),
      from,
      to,
    );
    prefs[checkKey] = serializeHabitCheckRoot(root);
    return { payload: prefs, titlesKey, checkKey, checkChanged: true };
  }

  if (op.action === "delete") {
    entries = removeHabitEntry(entries, op.title);
    prefs[titlesKey] = serializeHabitTitles(entries);
    // Flutter leaves orphaned check keys; month UI only shows current titles.
    return { payload: prefs, titlesKey, checkKey, checkChanged: false };
  }

  if (op.action === "setPart") {
    entries = setHabitPartEntry(entries, op.title, op.part ?? 2);
    prefs[titlesKey] = serializeHabitTitles(entries);
    return { payload: prefs, titlesKey, checkKey, checkChanged: false };
  }

  throw new Error("invalid_habit_action");
}
