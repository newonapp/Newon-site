/**
 * Month O/X stats from Sync habit_check payload (Flutter MonthHabitStats-lite).
 */
import { parseHabitCheckRoot } from "./ox-month-habit-check.mjs";
import { parseHabitTitles, monthKey as toMonthKey } from "./ox-month-parser.mjs";

/**
 * @param {unknown} checkRaw
 * @param {unknown} titlesRaw
 * @param {Date|string} month
 */
export function computeMonthStats(checkRaw, titlesRaw, month) {
  const mk =
    typeof month === "string" ? month : toMonthKey(month || new Date());
  const [ys, ms] = mk.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const habits = parseHabitTitles(titlesRaw).map((h) => h.title);
  const root = parseHabitCheckRoot(checkRaw);
  let totalO = 0;
  let totalX = 0;
  const per = Object.fromEntries(habits.map((t) => [t, { o: 0, x: 0 }]));
  const daysInMonth = new Date(y, m, 0).getDate();
  let daysWithAny = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dk = `${ys}-${ms}-${`${d}`.padStart(2, "0")}`;
    const day = root[dk];
    if (!day || typeof day !== "object") continue;
    let any = false;
    for (const title of habits) {
      const mark = day[title];
      if (mark === "o") {
        totalO += 1;
        per[title].o += 1;
        any = true;
      } else if (mark === "x") {
        totalX += 1;
        per[title].x += 1;
        any = true;
      }
    }
    if (any) daysWithAny += 1;
  }

  const ranked = habits
    .map((title) => ({
      title,
      oCount: per[title].o,
      xCount: per[title].x,
      rate:
        per[title].o + per[title].x > 0
          ? per[title].o / (per[title].o + per[title].x)
          : null,
    }))
    .sort((a, b) => b.oCount - a.oCount || a.title.localeCompare(b.title));

  const marked = totalO + totalX;
  return {
    monthKey: mk,
    habitCount: habits.length,
    totalO,
    totalX,
    oRatio: marked > 0 ? totalO / marked : null,
    daysWithAnyMark: daysWithAny,
    ranked,
    best: ranked.find((r) => r.rate != null) || null,
    worst:
      [...ranked].reverse().find((r) => r.rate != null) || null,
  };
}

export function goalsPrefsKey(email) {
  const e = `${email || ""}`.trim().toLowerCase() || "guest";
  return `ox_month_goals_map_v1_${e}`;
}

export function goalsStorageMonthKey(d = new Date()) {
  return `${d.getFullYear()}_${d.getMonth() + 1}`;
}

export function parseGoalsMap(raw) {
  if (raw == null || raw === "") return {};
  try {
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const n = Number(v);
      if (Number.isFinite(n)) out[k] = Math.trunc(n);
    }
    return out;
  } catch {
    return {};
  }
}

export function serializeGoalsMap(map) {
  return JSON.stringify(map || {});
}
