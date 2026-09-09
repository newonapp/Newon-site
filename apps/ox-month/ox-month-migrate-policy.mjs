/**
 * Safe mobile → UID Sync migration policy (pure helpers).
 * Ownership is never email/userId — callers must PUT/PATCH with Firebase token uid only.
 */

export const SYNC_MIGRATION_META_KEY = "ox_month_sync_migration_meta_v1";

const USER_DATA_KEY_RES = [
  /^ox_month_habit_titles_.+_\d{4}-\d{2}$/,
  /^ox_month_habit_check_.+_v2$/,
  /^ox_month_habit_day_overlay_.+_v1$/,
  /^ox_month_streak_recovery_.+_v1$/,
  /^ox_month_streak_recovery_max_.+_v1$/,
  /^ox_month_streak_recovery_free_daily_.+_v1$/,
  /^ox_month_streak_recovery_free_daily_habit_.+$/,
  /^ox_month_goals_map_v1_.+$/,
];

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function hasNonEmptyPrefValue(value) {
  if (value == null) return false;
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return false;
    if (t === "{}" || t === "[]") return false;
    return true;
  }
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

/**
 * True when payload has real habit/record prefs (not just locale/settings).
 * @param {unknown} payload
 * @returns {boolean}
 */
export function syncPayloadHasUserData(payload) {
  if (payload == null || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }
  for (const [key, value] of Object.entries(payload)) {
    if (key === SYNC_MIGRATION_META_KEY) continue;
    if (!USER_DATA_KEY_RES.some((re) => re.test(key))) continue;
    if (hasNonEmptyPrefValue(value)) return true;
  }
  return false;
}

/**
 * @param {unknown} payload
 * @returns {'absent'|'empty'|'has_user_data'}
 */
export function classifySyncPayload(payload) {
  if (payload == null) return "absent";
  if (typeof payload !== "object" || Array.isArray(payload)) return "absent";
  if (syncPayloadHasUserData(payload)) return "has_user_data";
  return "empty";
}

/**
 * Stable fingerprint of prefs map (sorted keys, JSON stringify).
 * @param {Record<string, unknown>} payload
 * @returns {string}
 */
export function fingerprintPrefsPayload(payload) {
  const keys = Object.keys(payload || {}).sort();
  const ordered = {};
  for (const k of keys) {
    if (k === SYNC_MIGRATION_META_KEY) continue;
    ordered[k] = payload[k];
  }
  return JSON.stringify(ordered);
}

/**
 * @param {object} args
 * @param {'mobile_shared_preferences'|'legacy_email_backup'} args.source
 * @param {string} args.sourceFingerprint
 * @param {string} [args.migratedAt]
 * @param {number} [args.version]
 */
export function buildMigrationMeta(args) {
  return {
    source: args.source,
    version: args.version ?? 1,
    migratedAt: args.migratedAt || new Date().toISOString(),
    sourceFingerprint: args.sourceFingerprint,
  };
}

/**
 * @param {unknown} raw
 * @returns {null | { source: string, version: number, migratedAt: string, sourceFingerprint: string }}
 */
export function parseMigrationMeta(raw) {
  if (raw == null) return null;
  let obj = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) return null;
  const source = `${obj.source || ""}`.trim();
  const sourceFingerprint = `${obj.sourceFingerprint || ""}`.trim();
  const version = Number(obj.version ?? 1);
  if (!source || !sourceFingerprint) return null;
  if (!Number.isFinite(version) || version < 1) return null;
  return {
    source,
    version: Math.trunc(version),
    migratedAt: `${obj.migratedAt || ""}`,
    sourceFingerprint,
  };
}

/**
 * Decide whether a client may upload local prefs into Sync.
 * Never auto-overwrite non-empty Sync. Same fingerprint → idempotent no-op.
 *
 * @param {object} args
 * @param {boolean} args.syncDocExists
 * @param {unknown} [args.existingPayload]
 * @param {string} args.incomingFingerprint
 * @param {boolean} [args.userConfirmedMerge]
 * @returns {{ action: 'create'|'noop'|'merge_empty'|'blocked', reason: string }}
 */
export function decideMigrationAction(args) {
  const fingerprint = `${args.incomingFingerprint || ""}`.trim();
  if (!fingerprint || fingerprint === "{}") {
    return { action: "blocked", reason: "no_local_data" };
  }

  if (!args.syncDocExists) {
    return { action: "create", reason: "sync_absent" };
  }

  const existing = args.existingPayload;
  const class_ = classifySyncPayload(existing);
  const meta = parseMigrationMeta(
    existing && typeof existing === "object"
      ? existing[SYNC_MIGRATION_META_KEY]
      : null,
  );

  if (meta && meta.sourceFingerprint === fingerprint) {
    return { action: "noop", reason: "same_fingerprint" };
  }

  if (class_ === "has_user_data") {
    if (args.userConfirmedMerge === true) {
      return { action: "blocked", reason: "needs_deterministic_merge" };
    }
    return { action: "blocked", reason: "sync_has_user_data" };
  }

  // empty (locale-only / meta-only / truly empty)
  return { action: "merge_empty", reason: "sync_empty_safe" };
}
