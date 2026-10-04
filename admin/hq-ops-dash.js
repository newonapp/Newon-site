/**
 * Newon HQ Phase 11 — Operations dashboard helpers.
 * No fake metrics. Missing sources render Not connected / —.
 * Admin-session UI only; does not change AuthZ or Firestore rules.
 */

/** @param {{ seconds?: number, nanoseconds?: number }|Date|string|number|null|undefined} v */
export function toMillis(v) {
  if (v == null || v === "") return 0;
  if (typeof v.toMillis === "function") {
    try {
      return v.toMillis();
    } catch {
      /* fall through */
    }
  }
  if (typeof v === "object" && typeof v.seconds === "number") {
    return v.seconds * 1000 + Math.floor((v.nanoseconds || 0) / 1e6);
  }
  if (v instanceof Date) return v.getTime();
  const n = Date.parse(String(v));
  return Number.isFinite(n) ? n : 0;
}

export function maskEmail(email) {
  const s = String(email || "").trim();
  if (!s || !s.includes("@")) return s || "—";
  const [user, domain] = s.split("@");
  if (!domain) return "—";
  const u = user.length <= 2 ? user[0] + "*" : user.slice(0, 2) + "***";
  return `${u}@${domain}`;
}

/** Normalize lead status for ops pipeline buckets. */
export function leadOpsBucket(status) {
  const s = String(status || "").toLowerCase();
  if (s === "new") return "new";
  if (s === "reviewing" || s === "hold") return "reviewing";
  if (s === "replied" || s === "contacted" || s === "quoted" || s === "in_progress") return "replied";
  if (s === "won" || s === "contracted" || s === "completed") return "won";
  if (s === "lost" || s === "rejected" || s === "cancelled") return "lost";
  if (s === "spam") return "spam";
  return "other";
}

export const LEAD_OPS_PIPELINE = [
  { key: "new", label: "New" },
  { key: "reviewing", label: "Reviewing" },
  { key: "replied", label: "Replied" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
  { key: "spam", label: "Spam" },
];

/**
 * Build recent activity from existing hq_* caches only.
 * @param {object} cache
 * @param {{ limit?: number }} [opts]
 */
export function buildActivityItems(cache, opts = {}) {
  const limit = opts.limit || 18;
  /** @type {Array<{ id: string, event: string, category: string, target: string, at: number }>} */
  const items = [];

  for (const l of cache.leads || []) {
    if (l.archived) continue;
    const at = toMillis(l.updatedAt) || toMillis(l.createdAt);
    if (!at) continue;
    items.push({
      id: "lead-" + l.id,
      event:
        toMillis(l.createdAt) === at
          ? l.source === "formsubmit_archive" ||
            l.source === "public_contact" ||
            l.createdBy === "system"
            ? "New public inquiry"
            : "New inquiry / lead"
          : "Lead updated",
      category: "Inquiry",
      target: String(l.name || l.company || "Lead"),
      at,
    });
  }
  for (const p of cache.projects || []) {
    if (p.archived) continue;
    const at = toMillis(p.updatedAt) || toMillis(p.createdAt);
    if (!at) continue;
    items.push({
      id: "proj-" + p.id,
      event: "Project updated",
      category: "Project",
      target: String(p.name || "Project"),
      at,
    });
  }
  for (const t of cache.tasks || []) {
    const at = toMillis(t.updatedAt) || toMillis(t.createdAt);
    if (!at) continue;
    items.push({
      id: "task-" + t.id,
      event: t.status === "done" ? "Task completed" : "Task activity",
      category: "Ops",
      target: String(t.title || "Task"),
      at,
    });
  }
  for (const r of cache.releases || []) {
    const at = toMillis(r.updatedAt) || toMillis(r.createdAt) || toMillis(r.releasedAt);
    if (!at) continue;
    items.push({
      id: "rel-" + r.id,
      event: r.status === "released" ? "Release shipped" : "Release updated",
      category: "Product",
      target: `${r.product || "App"} ${r.version || ""}`.trim(),
      at,
    });
  }
  for (const d of cache.documents || []) {
    const at = toMillis(d.updatedAt) || toMillis(d.createdAt);
    if (!at) continue;
    items.push({
      id: "doc-" + d.id,
      event: "Document updated",
      category: "Documents",
      target: String(d.title || d.type || "Document"),
      at,
    });
  }

  items.sort((a, b) => b.at - a.at);
  return items.slice(0, limit);
}

/**
 * System health rows — only statuses we can actually observe.
 * @param {{
 *   authOk: boolean,
 *   firestore: "Healthy"|"Warning"|"Error"|"Not configured",
 *   firestoreDetail: string,
 *   analytics: "Healthy"|"Warning"|"Error"|"Not configured",
 *   formPipeline: "Healthy"|"Warning"|"Error"|"Not configured"|"Stale",
 *   formPipelineDetail?: string,
 *   healthSnapshot: "Healthy"|"Warning"|"Error"|"Not configured",
 *   lastLoadedAt: number|null,
 * }} s
 */
export function systemHealthRows(s) {
  return [
    {
      label: "Firebase Auth",
      status: s.authOk ? "Healthy" : "Error",
      detail: s.authOk ? "Admin session active" : "Not signed in",
    },
    {
      label: "Firestore",
      status: s.firestore,
      detail: s.firestoreDetail,
    },
    {
      label: "Analytics ingestion",
      status: s.analytics,
      detail: "No HQ analytics store. Public events use dataLayer only.",
    },
    {
      label: "FormSubmit archive sync",
      status: s.formPipeline,
      detail:
        s.formPipelineDetail ||
        (s.formPipeline === "Not configured"
          ? "FormSubmit → email only. Archive sync not deployed (Phase 15)."
          : "See hq_sync_state/formsubmit"),
    },
    {
      label: "Product health snapshot",
      status: s.healthSnapshot,
      detail:
        s.healthSnapshot === "Healthy"
          ? "production-health.json loaded"
          : "Snapshot missing or invalid",
    },
    {
      label: "Last successful data update",
      status: s.lastLoadedAt ? "Healthy" : "Warning",
      detail: s.lastLoadedAt ? new Date(s.lastLoadedAt).toISOString() : "No successful load yet",
    },
  ];
}

export function healthStatusKind(status) {
  const s = String(status || "");
  if (s === "Healthy") return "completed";
  if (s === "Warning" || s === "Stale") return "review";
  if (s === "Error") return "blocked";
  return "planned";
}

/**
 * HQ health for FormSubmit archive sync state doc (mirrors ingest evaluateArchiveSyncHealth).
 * @param {Record<string, unknown>|null|undefined} state
 * @param {{ nowMs?: number, staleAfterMs?: number }} [opts]
 */
export function evaluateArchiveSyncHealth(state, opts = {}) {
  if (!state || typeof state !== "object") {
    return {
      status: "Not configured",
      detail: "FormSubmit archive sync not deployed / no hq_sync_state/formsubmit",
    };
  }
  const nowMs = opts.nowMs != null ? opts.nowMs : Date.now();
  const staleAfter = opts.staleAfterMs != null ? opts.staleAfterMs : 2 * 30 * 60 * 1000;
  const st = String(state.status || "");
  if (st === "error") {
    return {
      status: "Error",
      detail: String(state.lastErrorCode || "last sync error"),
    };
  }
  const lastOk = state.lastSuccessfulSyncAt
    ? Date.parse(String(state.lastSuccessfulSyncAt))
    : NaN;
  if (!Number.isFinite(lastOk)) {
    return { status: "Warning", detail: "Sync state present but no successful sync yet" };
  }
  if (nowMs - lastOk > staleAfter) {
    return {
      status: "Stale",
      detail: `Last success ${new Date(lastOk).toISOString()}`,
    };
  }
  if (st === "partial") {
    return { status: "Warning", detail: "Last sync completed with partial errors" };
  }
  return { status: "Healthy", detail: `Last success ${new Date(lastOk).toISOString()}` };
}

/**
 * Counts for inquiry ops strip.
 * @param {Array<{status?: string, archived?: boolean, createdAt?: unknown}>} leads
 * @param {number} sinceMs — inclusive lower bound for "new in period"
 */
export function inquiryCounts(leads, sinceMs) {
  const active = (leads || []).filter((l) => !l.archived);
  const buckets = { new: 0, reviewing: 0, replied: 0, won: 0, lost: 0, spam: 0, other: 0 };
  let open = 0;
  let newInPeriod = 0;
  for (const l of active) {
    const b = leadOpsBucket(l.status);
    if (buckets[b] != null) buckets[b] += 1;
    else buckets.other += 1;
    if (b === "new" || b === "reviewing" || b === "replied") open += 1;
    const created = toMillis(l.createdAt);
    if (sinceMs && created >= sinceMs) newInPeriod += 1;
  }
  return { buckets, open, newInPeriod, total: active.length };
}

/**
 * Waitlist KPIs — only call when WAITLIST_PIPELINE_ENABLED and collection is loaded.
 * @param {Array<{status?: string, archived?: boolean, createdAt?: unknown}>} rows
 * @param {number} [sinceMs]
 */
export function waitlistCounts(rows, sinceMs) {
  const list = (rows || []).filter((r) => !r.archived);
  let active = 0;
  let converted = 0;
  let invited = 0;
  let recent = 0;
  for (const r of list) {
    const s = String(r.status || "active").toLowerCase();
    if (s === "active") active += 1;
    else if (s === "converted") converted += 1;
    else if (s === "invited") invited += 1;
    const created = toMillis(r.createdAt);
    if (sinceMs && created >= sinceMs) recent += 1;
  }
  return { total: list.length, active, converted, invited, recent };
}

export const ANALYTICS_PERIODS = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "7D", days: 7 },
  { id: "30d", label: "30D", days: 30 },
  { id: "90d", label: "90D", days: 90 },
];

export const NOT_CONNECTED_KPIS = [
  {
    label: "Total Users",
    reason: "No consumer user DB in HQ Firestore",
  },
  {
    label: "New Users",
    reason: "App analytics not connected to HQ",
  },
  {
    label: "Active Users",
    reason: "App analytics not connected to HQ",
  },
  {
    label: "App Installs",
    reason: "Store consoles not connected",
  },
  {
    label: "Paid Subscribers",
    reason: "Store / IAP not connected",
  },
  {
    label: "MRR",
    reason: "Subscription billing not connected",
  },
  {
    label: "Conversion Rate",
    reason: "Funnel analytics not connected",
  },
  {
    label: "Waitlist",
    reason: "FormSubmit only — hq_waitlist ingest not live (Phase 13 schema ready)",
  },
  {
    label: "Website Traffic",
    reason: "GA4/GTM not wired into HQ",
  },
];
