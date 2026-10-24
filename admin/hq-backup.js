/**
 * Newon HQ — read-only Firestore backup export (admin session only).
 * Does not write to Firestore. Does not upload anywhere. Browser download only.
 */

/** Collections that exist in HQ COL map (actual names). */
export const HQ_BACKUP_COLLECTIONS = [
  "hq_projects",
  "hq_tasks",
  "hq_leads",
  "hq_clients",
  "hq_companies",
  "hq_documents",
  "hq_finance",
  "hq_milestones",
  "hq_releases",
  "hq_products_meta",
];

/**
 * Serialize Firestore / JS values for JSON (type-preserving where useful).
 * @param {unknown} value
 * @param {number} [depth]
 */
export function serializeHqValue(value, depth) {
  const d = depth || 0;
  if (d > 40) return { __type: "truncated", reason: "max_depth" };
  if (value === undefined) return { __type: "undefined" };
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : { __type: "number", value: String(value) };

  if (typeof value === "object") {
    // Firestore Timestamp (client SDK)
    if (typeof value.toDate === "function" && typeof value.seconds === "number") {
      let iso = "";
      try {
        iso = value.toDate().toISOString();
      } catch {
        iso = "";
      }
      return {
        __type: "timestamp",
        seconds: value.seconds,
        nanoseconds: value.nanoseconds || 0,
        iso,
      };
    }
    // GeoPoint
    if (typeof value.latitude === "number" && typeof value.longitude === "number" && value.constructor && value.constructor.name === "GeoPoint") {
      return { __type: "geopoint", latitude: value.latitude, longitude: value.longitude };
    }
    // DocumentReference
    if (typeof value.path === "string" && typeof value.id === "string" && value.firestore) {
      return { __type: "reference", path: value.path, id: value.id };
    }
    if (Array.isArray(value)) {
      return value.map((v) => serializeHqValue(v, d + 1));
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = serializeHqValue(v, d + 1);
    }
    return out;
  }

  return { __type: "unknown", value: String(value) };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

export function backupFilename(date) {
  const d = date || new Date();
  return (
    "newon-hq-backup-" +
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "-" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    ".json"
  );
}

/**
 * @param {object} opts
 * @param {import('firebase/firestore').Firestore} opts.db
 * @param {(name: string) => import('firebase/firestore').CollectionReference} opts.collectionFn
 * @param {(q: unknown) => Promise<import('firebase/firestore').QuerySnapshot>} opts.getDocsFn
 * @param {string[]} [opts.collectionNames]
 */
export async function exportHqBackup(opts) {
  const db = opts.db;
  const collectionFn = opts.collectionFn;
  const getDocsFn = opts.getDocsFn;
  const names = opts.collectionNames || HQ_BACKUP_COLLECTIONS;

  const collections = {};
  const collectionCounts = {};
  const errors = [];

  for (const name of names) {
    try {
      const snap = await getDocsFn(collectionFn(db, name));
      const docs = [];
      snap.forEach((docSnap) => {
        docs.push({
          id: docSnap.id,
          data: serializeHqValue(docSnap.data()),
        });
      });
      collections[name] = docs;
      collectionCounts[name] = docs.length;
    } catch (e) {
      collections[name] = [];
      collectionCounts[name] = 0;
      errors.push({ collection: name, message: (e && e.message) || "read_failed" });
    }
  }

  const generatedAt = new Date().toISOString();
  const payload = {
    schemaVersion: 1,
    kind: "newon-hq-firestore-backup",
    generatedAt,
    warning: "Contains private business data. Do not commit, email publicly, or upload to public storage.",
    collectionCounts,
    collections,
    errors: errors.length ? errors : undefined,
  };

  return {
    filename: backupFilename(new Date(generatedAt)),
    payload,
    json: JSON.stringify(payload, null, 2),
    collectionCounts,
    errors,
  };
}

export function downloadJsonFile(filename, jsonText) {
  const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 2000);
}

/**
 * Lightweight validation for an export JSON string (no content deep-compare).
 */
export function validateBackupJson(jsonText) {
  const data = JSON.parse(jsonText);
  if (!data || typeof data !== "object") throw new Error("invalid_root");
  if (data.schemaVersion !== 1) throw new Error("unsupported_schema");
  if (!data.generatedAt) throw new Error("missing_generatedAt");
  if (!data.collections || typeof data.collections !== "object") throw new Error("missing_collections");
  if (!data.collectionCounts || typeof data.collectionCounts !== "object") throw new Error("missing_counts");
  return {
    ok: true,
    generatedAt: data.generatedAt,
    collectionCounts: data.collectionCounts,
    collectionNames: Object.keys(data.collections),
  };
}
