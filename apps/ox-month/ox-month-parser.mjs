/**
 * OX MONTH Sync payload parser (prefs-style keys from Flutter SharedPreferences).
 * Safe for malformed JSON — never throws to callers for bad prefs values.
 */

/**
 * @param {unknown} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  return `${email ?? ""}`.trim().toLowerCase();
}

/**
 * @param {Date} [date]
 * @returns {string} YYYY-MM
 */
export function monthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * @param {Date} [date]
 * @returns {string} YYYY-MM-DD
 */
export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * @param {unknown} raw
 * @returns {unknown}
 */
function tryParseJson(raw) {
  if (raw == null) return null;
  if (typeof raw === "object") return raw;
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/**
 * Flutter canonicalHabitTitleKey — trim + collapse whitespace.
 * @param {unknown} title
 * @returns {string}
 */
export function canonicalHabitTitleKey(title) {
  return `${title ?? ""}`.trim().replace(/\s+/g, " ");
}

/**
 * @param {unknown} mark
 * @returns {'o'|'x'|null}
 */
export function parseOxMark(mark) {
  if (mark == null) return null;
  const s = String(mark).trim().toLowerCase();
  if (!s) return null;
  const head = s.charAt(0);
  if (head === "o") return "o";
  if (head === "x") return "x";
  return null;
}

/**
 * Flutter HabitStorage._rawMarkForTitle lookup.
 * @param {Record<string, 'o'|'x'>|null|undefined} dayMarks
 * @param {string} title
 * @returns {'o'|'x'|null}
 */
export function markForHabitTitle(dayMarks, title) {
  if (!dayMarks || typeof dayMarks !== "object") return null;
  const key = canonicalHabitTitleKey(title);
  if (!key) return null;
  if (Object.prototype.hasOwnProperty.call(dayMarks, key)) {
    return parseOxMark(dayMarks[key]);
  }
  for (const [k, v] of Object.entries(dayMarks)) {
    if (canonicalHabitTitleKey(k) === key) return parseOxMark(v);
  }
  return null;
}

/**
 * @param {unknown} rawTitles
 * @returns {{ title: string, part: number }[]}
 */
export function parseHabitTitles(rawTitles) {
  const parsed = tryParseJson(rawTitles);
  if (!Array.isArray(parsed)) return [];
  const out = [];
  for (const item of parsed) {
    if (typeof item === "string") {
      const t = item.trim().replace(/\s+/g, " ");
      if (t) out.push({ title: t, part: 2 });
      continue;
    }
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const t = `${item.t ?? item.title ?? ""}`.trim().replace(/\s+/g, " ");
      if (!t) continue;
      const p = Number(item.p ?? item.part ?? 2);
      out.push({
        title: t,
        part: Number.isFinite(p) ? Math.trunc(p) : 2,
      });
    }
  }
  return out;
}

/**
 * @param {unknown} rawCheck
 * @returns {Record<string, Record<string, 'o'|'x'>>}
 */
export function parseHabitCheckRoot(rawCheck) {
  const parsed = tryParseJson(rawCheck);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  /** @type {Record<string, Record<string, 'o'|'x'>>} */
  const root = {};
  for (const [date, dayData] of Object.entries(parsed)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (!dayData || typeof dayData !== "object" || Array.isArray(dayData)) {
      continue;
    }
    /** @type {Record<string, 'o'|'x'>} */
    const day = {};
    for (const [habit, mark] of Object.entries(dayData)) {
      const ox = parseOxMark(mark);
      if (ox) day[habit] = ox;
    }
    if (Object.keys(day).length) root[date] = day;
  }
  return root;
}

/**
 * Build a read-only view model from Sync GET payload.
 * Does not use premium/auth/session keys for entitlement.
 *
 * @param {unknown} payload
 * @param {{ email?: string|null, now?: Date }} [opts]
 */
export function buildOxMonthViewModel(payload, opts = {}) {
  const now = opts.now instanceof Date ? opts.now : new Date();
  const email = normalizeEmail(opts.email);
  const month = monthKey(now);
  const today = dayKey(now);

  /** @type {Record<string, unknown>} */
  const prefs =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? /** @type {Record<string, unknown>} */ (payload)
      : {};

  const titlesKey = email
    ? `ox_month_habit_titles_${email}_${month}`
    : null;
  const checkKey = email ? `ox_month_habit_check_${email}_v2` : null;

  const titles = titlesKey ? parseHabitTitles(prefs[titlesKey]) : [];
  const checkRoot = checkKey ? parseHabitCheckRoot(prefs[checkKey]) : {};
  const todayMarks = checkRoot[today] || {};

  const habitsToday = titles.map((h) => ({
    title: h.title,
    part: h.part,
    mark: markForHabitTitle(todayMarks, h.title),
  }));

  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  /** @type {{ day: number, dateKey: string, marks: Record<string, 'o'|'x'> }[]} */
  const monthDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${month}-${String(d).padStart(2, "0")}`;
    monthDays.push({
      day: d,
      dateKey,
      marks: checkRoot[dateKey] || {},
    });
  }

  return {
    month,
    today,
    habitsToday,
    monthDays,
    habitTitles: titles,
    checkKey,
    checkRoot,
    hasTitles: titles.length > 0,
    hasAnyChecks: Object.keys(checkRoot).length > 0,
  };
}

/**
 * @param {unknown} body
 * @returns {{ ok: true, revision: number, updatedAt: string, schemaVersion: number } | { ok: false }}
 */
export function parseSyncPutResponse(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false };
  }
  if (body.ok !== true) return { ok: false };
  const revision = Number(body.revision);
  const schemaVersion = Number(body.schemaVersion ?? 1);
  const updatedAt = `${body.updatedAt ?? ""}`.trim();
  if (!Number.isFinite(revision) || revision < 1) return { ok: false };
  if (!Number.isFinite(schemaVersion) || schemaVersion < 1) return { ok: false };
  if (!updatedAt) return { ok: false };
  return {
    ok: true,
    revision: Math.trunc(revision),
    schemaVersion: Math.trunc(schemaVersion),
    updatedAt,
  };
}

/**
 * @param {unknown} body
 * @returns {{ ok: true, revision: number, updatedAt: string, appliedCount: number } | { ok: false }}
 */
export function parseSyncPatchResponse(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false };
  }
  if (body.ok !== true) return { ok: false };
  const revision = Number(body.revision);
  const appliedCount = Number(body.appliedCount);
  const updatedAt = `${body.updatedAt ?? ""}`.trim();
  if (!Number.isFinite(revision) || revision < 1) return { ok: false };
  if (!Number.isFinite(appliedCount) || appliedCount < 0) return { ok: false };
  if (!updatedAt) return { ok: false };
  return {
    ok: true,
    revision: Math.trunc(revision),
    updatedAt,
    appliedCount: Math.trunc(appliedCount),
  };
}

/**
 * @param {unknown} body
 * @returns {{ ok: true, appId: string, revision: number, schemaVersion: number, updatedAt: string, payload: object } | { ok: false }}
 */
export function parseSyncGetResponse(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false };
  }
  const appId = `${body.appId ?? ""}`.trim();
  const revision = Number(body.revision);
  const schemaVersion = Number(body.schemaVersion);
  const updatedAt = `${body.updatedAt ?? ""}`.trim();
  const payload = body.payload;
  if (!appId) return { ok: false };
  if (!Number.isFinite(revision) || revision < 1) return { ok: false };
  if (!Number.isFinite(schemaVersion) || schemaVersion < 1) return { ok: false };
  if (!updatedAt) return { ok: false };
  if (payload == null || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false };
  }
  return {
    ok: true,
    appId,
    revision: Math.trunc(revision),
    schemaVersion: Math.trunc(schemaVersion),
    updatedAt,
    payload,
  };
}
