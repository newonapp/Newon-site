/**
 * Newon HQ Operations V1 — ES module.
 * window.NEWON_HQ_APP = { start(ctx), stop() }
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { installHqDocs } from "./hq-docs.js";
import { installHqOps, PROJECT_PHASE, PROJECT_PHASE_LABEL, BOARD_LANES } from "./hq-ops.js";
import { installHqCrm } from "./hq-crm.js";
import { installHqHealth } from "./hq-health.js";
import { exportHqBackup, downloadJsonFile, validateBackupJson, HQ_BACKUP_COLLECTIONS } from "./hq-backup.js";
import {
  ANALYTICS_PERIODS,
  LEAD_OPS_PIPELINE,
  NOT_CONNECTED_KPIS,
  buildActivityItems,
  healthStatusKind,
  inquiryCounts,
  leadOpsBucket,
  maskEmail,
  systemHealthRows,
  evaluateArchiveSyncHealth,
  waitlistCounts,
} from "./hq-ops-dash.js";

const HQ_VERSION = "1.8.0";
const COL = {
  tasks: "hq_tasks",
  releases: "hq_releases",
  leads: "hq_leads",
  finance: "hq_finance",
  productsMeta: "hq_products_meta",
  projects: "hq_projects",
  documents: "hq_documents",
  milestones: "hq_milestones",
  clients: "hq_clients",
  companies: "hq_companies",
  waitlist: "hq_waitlist",
  syncState: "hq_sync_state",
};

/**
 * Flip to true only after waitlist server ingest is deployed.
 * Until then Waitlist KPI stays Not connected (do not imply live counts).
 */
const WAITLIST_PIPELINE_ENABLED = false;

const TASK_STATUS = ["todo", "doing", "done"];
const TASK_PRIORITY = ["low", "medium", "high"];
const RELEASE_PLATFORM = ["iOS", "Android", "Web", "Other"];
const RELEASE_STATUS = ["planned", "in_progress", "review", "released", "blocked"];
const RELEASE_STATUS_LABEL = {
  planned: "예정",
  in_progress: "진행",
  review: "검토",
  released: "출시",
  blocked: "차단",
};
const RELEASE_STATUS_RANK = {
  blocked: 0,
  in_progress: 1,
  review: 2,
  planned: 3,
  released: 90,
};
const LEAD_SOURCE = [
  "formsubmit_archive",
  "public_contact",
  "Business",
  "Studio",
  "Store",
  "Wishket",
  "Referral",
  "Instagram",
  "Threads",
  "Other",
];
const LEAD_SOURCE_LABEL = {
  formsubmit_archive: "FormSubmit archive",
  public_contact: "Public contact",
  Business: "Business",
  Studio: "Studio",
  Store: "Store",
  Wishket: "Wishket",
  Referral: "Referral",
  Instagram: "Instagram",
  Threads: "Threads",
  Other: "Other",
};
const LEAD_STATUS = [
  "new",
  "reviewing",
  "replied",
  "won",
  "lost",
  "spam",
  // Legacy values kept for existing Firestore docs
  "contacted",
  "quoted",
  "contracted",
  "in_progress",
  "completed",
  "hold",
  "rejected",
];
const LEAD_STATUS_LABEL = {
  new: "신규",
  reviewing: "확인",
  replied: "진행",
  won: "완료",
  lost: "실패",
  spam: "스팸",
  contacted: "진행 (레거시)",
  quoted: "진행 (레거시)",
  contracted: "진행 (레거시)",
  in_progress: "진행 (레거시)",
  completed: "완료 (레거시)",
  hold: "확인 (레거시)",
  rejected: "실패 (레거시)",
};
const ACTIVE_LEAD = new Set([
  "new",
  "reviewing",
  "replied",
  "contacted",
  "quoted",
  "contracted",
  "in_progress",
  "hold",
]);
const FINANCE_TYPE = ["income", "expense"];
const FINANCE_TYPE_LABEL = {
  income: "수입",
  expense: "지출",
};
const OPS_STATUS = ["active", "review", "maintenance", "paused", "planned"];

const PROJECT_STATUS = [
  "inquiry",
  "planning",
  "quoted",
  "contract",
  "active",
  "review",
  "completed",
  "on_hold",
  "cancelled",
];
const PROJECT_STATUS_LABEL = {
  inquiry: "문의",
  planning: "기획",
  quoted: "견적",
  contract: "계약",
  active: "진행 중",
  review: "검수",
  completed: "완료",
  on_hold: "보류",
  cancelled: "취소",
};
const DEFAULT_SERVICE_TYPES = [
  { value: "mvp", label: "MVP" },
  { value: "app", label: "App Prototype" },
  { value: "web", label: "Website Development" },
  { value: "landing", label: "Landing Page Development" },
  { value: "internal-tools", label: "Internal Tools" },
  { value: "ai-automation", label: "AI Automation" },
  { value: "workflow-automation", label: "Workflow Automation" },
  { value: "market-research", label: "Market Research" },
  { value: "other", label: "Other" },
];

const NAV_KEYS = [
  "dashboard",
  "tasks",
  "releases",
  "leads",
  "clients",
  "projects",
  "documents",
  "finance",
  "products",
  "health",
  "analytics",
  "settings",
];

/** @type {null | {
 *   user: import('firebase/auth').User,
 *   db: import('firebase/firestore').Firestore,
 *   auth: import('firebase/auth').Auth,
 *   signOutFn: () => Promise<void>
 * }} */
let ctx = null;
/** @type {Array<() => void>} */
let unsubs = [];
let cache = emptyCache();
let catalog = [];
let currentNav = "dashboard";
let filters = {
  tasks: { status: "open", priority: "", q: "" },
  releases: { status: "open", product: "" },
  leads: { status: "", source: "", archived: "active", q: "", ui: "" },
  projects: { status: "", service: "", priority: "", q: "", archived: "active" },
  finance: { month: "", type: "", archived: "active" },
  products: { status: "" },
};
/** @type {string|null} */
let projectDetailId = null;
/** @type {Array<{value:string,label:string}>} */
let serviceTypes = DEFAULT_SERVICE_TYPES.slice();
/** @type {Record<string, {amount?:number,label?:string,custom?:boolean}>} */
let pricingBySlug = {};
/** @type {Array<Record<string, unknown>>} */
let quotePackages = [];
/** @type {ReturnType<typeof installHqDocs>|null} */
let docsMod = null;
/** @type {ReturnType<typeof installHqOps>|null} */
let opsMod = null;
/** @type {ReturnType<typeof installHqCrm>|null} */
let crmMod = null;
/** @type {ReturnType<typeof installHqHealth>|null} */
let healthMod = null;

const PAGE_META = {
  dashboard: {
    eyebrow: "Overview",
    title: "Dashboard",
    desc: "오늘 확인할 문의·작업·프로젝트와 운영 현황을 한눈에 봅니다.",
  },
  tasks: {
    eyebrow: "Operations",
    title: "Tasks",
    desc: "기한·우선순위로 오늘 할 일을 추적합니다.",
  },
  releases: {
    eyebrow: "Operations",
    title: "Releases",
    desc: "예정·진행 중인 앱·플랫폼 릴리스를 먼저 확인합니다.",
  },
  leads: {
    eyebrow: "Business",
    title: "문의 관리",
    desc: "접수된 프로젝트 문의를 확인하고 상태를 관리합니다.",
  },
  clients: {
    eyebrow: "Business",
    title: "Clients",
    desc: "고객·회사를 찾고 상태·최근 활동을 확인합니다.",
  },
  projects: {
    eyebrow: "Projects",
    title: "Projects",
    desc: "클라이언트 프로젝트 진행·납품 상태.",
  },
  documents: {
    eyebrow: "Business",
    title: "Documents",
    desc: "견적, 범위, 요구사항, 계약, 인보이스.",
  },
  finance: {
    eyebrow: "Business",
    title: "Finance",
    desc: "수입·지출 캐시플로 (실제 장부만).",
  },
  products: {
    eyebrow: "Operations",
    title: "Products",
    desc: "Catalog snapshot plus operational metadata.",
  },
  health: {
    eyebrow: "System",
    title: "Health",
    desc: "Read-only production health snapshot from production-health.json.",
  },
  analytics: {
    eyebrow: "System",
    title: "Analytics",
    desc: "HQ analytics overview — only connected sources. No fabricated charts.",
  },
  settings: {
    eyebrow: "System",
    title: "Settings",
    desc: "Account, environment, and session controls.",
  },
};
let saving = false;
/** @type {{ status: "idle"|"loading"|"ok"|"error", permissionDenied: boolean, message: string, lastLoadedAt: number|null }} */
let dataState = {
  status: "idle",
  permissionDenied: false,
  message: "",
  lastLoadedAt: null,
};
let analyticsPeriod = "7d";

function emptyCache() {
  return {
    tasks: [],
    releases: [],
    leads: [],
    finance: [],
    productsMeta: [],
    projects: [],
    documents: [],
    milestones: [],
    clients: [],
    companies: [],
    waitlist: [],
    formsubmitSync: null,
  };
}

function $(id) {
  return document.getElementById(id);
}

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "text") node.textContent = String(v);
      else if (k === "className") node.className = v;
      else if (k === "dataset") {
        for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = String(dv);
      } else if (k.startsWith("on") && typeof v === "function") {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === "disabled" || k === "hidden" || k === "checked" || k === "selected") {
        node[k] = !!v;
      } else if (k === "value") node.value = v;
      else node.setAttribute(k, String(v));
    }
  }
  if (children) {
    for (const c of children) {
      if (c == null) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
  }
  return node;
}

function clear(node) {
  if (!node) return;
  while (node.firstChild) node.removeChild(node.firstChild);
}

function toast(msg, kind) {
  const t = $("hq-toast");
  if (!t) return;
  t.textContent = msg || "";
  t.className = "hq-toast" + (kind ? " hq-toast--" + kind : "");
  t.hidden = !msg;
  if (msg) {
    window.clearTimeout(toast._tid);
    toast._tid = window.setTimeout(() => {
      t.textContent = "";
      t.hidden = true;
    }, 3200);
  }
}

function toDate(v) {
  if (!v) return null;
  if (typeof v.toDate === "function") return v.toDate();
  if (v instanceof Date) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ymd(d) {
  if (!d) return "";
  const x = toDate(d);
  if (!x) return "";
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayYmd() {
  return ymd(new Date());
}

function monthKey(d) {
  const x = toDate(d);
  if (!x) return "";
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`;
}

function formatKrw(n) {
  const num = Number(n) || 0;
  return "₩" + num.toLocaleString("ko-KR");
}

function uid() {
  return (ctx && ctx.user && ctx.user.uid) || "";
}

function isEmail(s) {
  if (!s) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
}

function bind(target, type, handler) {
  if (!target) return;
  target.addEventListener(type, handler);
  unsubs.push(() => target.removeEventListener(type, handler));
}

function setNavOpen(open) {
  const nav = $("hq-nav");
  const bd = $("hq-shell-backdrop");
  const toggle = $("hq-nav-toggle");
  if (nav) nav.classList.toggle("is-open", !!open);
  if (bd) bd.hidden = !open;
  if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
}

function showPanel(key) {
  if (key !== "projects") projectDetailId = null;
  if (key !== "documents" && docsMod) docsMod.clearDetail();
  currentNav = key;
  for (const k of NAV_KEYS) {
    const p = $("hq-panel-" + k);
    if (p) p.hidden = k !== key;
  }
  document.querySelectorAll("[data-hq-nav]").forEach((a) => {
    const active = a.getAttribute("data-hq-nav") === key;
    a.classList.toggle("is-active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  setNavOpen(false);
  renderCurrent();
}

function openModal(title, bodyNode, actions, opts) {
  const modal = $("hq-modal");
  const t = $("hq-modal-title");
  const b = $("hq-modal-body");
  const a = $("hq-modal-actions");
  if (!modal || !t || !b || !a) return;
  modal.classList.toggle("hq-modal--wide", !!(opts && opts.wide));
  t.textContent = title;
  clear(b);
  b.appendChild(bodyNode);
  clear(a);
  for (const act of actions || []) a.appendChild(act);
  if (bodyNode && bodyNode.tagName === "FORM" && !bodyNode.id) {
    bodyNode.id = "hq-modal-form";
  }
  if (bodyNode && bodyNode.id) {
    for (const act of actions || []) {
      if (act && act.tagName === "BUTTON" && act.type === "submit") {
        act.setAttribute("form", bodyNode.id);
      }
    }
  }
  if (typeof modal.showModal === "function") {
    if (!modal.open) modal.showModal();
  } else {
    modal.hidden = false;
    modal.removeAttribute("hidden");
  }
}

function closeModal() {
  const modal = $("hq-modal");
  if (!modal) return;
  modal.classList.remove("hq-modal--wide");
  if (typeof modal.close === "function" && modal.open) modal.close();
  else {
    modal.hidden = true;
    modal.setAttribute("hidden", "");
  }
}

function fieldRow(label, input) {
  return el("label", { className: "hq-field" }, [
    el("span", { className: "hq-field__label", text: label }),
    input,
  ]);
}

function input(attrs) {
  return el("input", Object.assign({ className: "hq-input", type: "text" }, attrs));
}

function textarea(attrs) {
  return el("textarea", Object.assign({ className: "hq-input hq-textarea", rows: "3" }, attrs));
}

function leadStatusOptions() {
  return LEAD_STATUS.map((v) => ({ value: v, label: LEAD_STATUS_LABEL[v] || v }));
}

function select(attrs, options, selected) {
  const s = el("select", Object.assign({ className: "hq-input" }, attrs));
  for (const opt of options) {
    const value = typeof opt === "string" ? opt : opt.value;
    const label = typeof opt === "string" ? opt : opt.label;
    s.appendChild(
      el("option", { value, text: label, selected: value === selected })
    );
  }
  return s;
}

function btn(label, opts) {
  return el(
    "button",
    Object.assign(
      { type: "button", className: "hq-btn", text: label },
      opts || {}
    )
  );
}

function emptyMsg(text) {
  return el("p", { className: "hq-empty", text: text || "No data yet." });
}

function emptyState(title, desc, cta) {
  const kids = [
    el("div", { className: "hq-empty-state__mark", text: "—" }),
    el("p", { className: "hq-empty-state__title", text: title }),
    el("p", { className: "hq-empty-state__desc", text: desc }),
  ];
  if (cta) kids.push(cta);
  return el("div", { className: "hq-empty-state" }, kids);
}

function toolbar(children) {
  return el("div", { className: "hq-toolbar" }, children);
}

function pageHeader(key, asideChildren) {
  const meta = PAGE_META[key] || { eyebrow: "HQ", title: key, desc: "" };
  const copy = el("div", { className: "hq-page-header__copy" }, [
    el("p", { className: "hq-eyebrow", text: meta.eyebrow }),
    el("h1", { className: "hq-page-header__title", text: meta.title }),
    el("p", { className: "hq-page-header__desc", text: meta.desc }),
  ]);
  const aside = el("div", { className: "hq-page-header__aside" }, asideChildren || []);
  return el("header", { className: "hq-page-header" }, [copy, aside]);
}

function formatLongDate(d) {
  const x = toDate(d) || new Date();
  try {
    return x.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return ymd(x);
  }
}

function card(label, value, caption) {
  const kids = [
    el("p", { className: "hq-card__label", text: label }),
    el("p", { className: "hq-card__value", text: String(value) }),
  ];
  if (caption) kids.push(el("p", { className: "hq-stat__caption", text: caption }));
  return el("div", { className: "hq-card hq-stat" }, kids);
}

function statCard(label, value, caption) {
  return card(label, value, caption);
}

function surfacePanel(title, bodyChildren, action) {
  const headKids = [el("h2", { className: "hq-surface-panel__title", text: title })];
  if (action) headKids.push(action);
  return el("section", { className: "hq-surface-panel" }, [
    el("div", { className: "hq-surface-panel__head" }, headKids),
    el("div", { className: "hq-surface-panel__body" }, bodyChildren),
  ]);
}

function table(headers, rows, emptyText) {
  const thead = el("thead", null, [
    el(
      "tr",
      null,
      headers.map((h) => el("th", { text: h }))
    ),
  ]);
  const tbody = el("tbody");
  if (!rows.length) {
    const tr = el("tr");
    const td = el("td", { colSpan: String(headers.length) });
    td.appendChild(emptyMsg(emptyText || "No data yet."));
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    for (const row of rows) tbody.appendChild(row);
  }
  return el("div", { className: "hq-table-wrap is-desktop-only" }, [
    el("table", { className: "hq-table" }, [thead, tbody]),
  ]);
}

function badge(text, kind) {
  return el("span", {
    className: "hq-badge" + (kind ? " hq-badge--" + kind : ""),
    text,
  });
}

function statusBadge(status) {
  const s = String(status || "").trim();
  if (!s) return badge("—");
  const kind = s.toLowerCase().replace(/\s+/g, "_");
  return badge(s, kind);
}

/** Map Firestore lead status → HQ inquiry UI bucket (신규/확인/진행/완료). */
function inquiryUiStatus(status) {
  const b = leadOpsBucket(status);
  if (b === "new") return { key: "new", label: "신규" };
  if (b === "reviewing") return { key: "reviewing", label: "확인" };
  if (b === "replied") return { key: "replied", label: "진행" };
  if (b === "won") return { key: "won", label: "완료" };
  if (b === "lost") return { key: "lost", label: "실패" };
  if (b === "spam") return { key: "spam", label: "스팸" };
  const raw = String(status || "").trim();
  return { key: "other", label: LEAD_STATUS_LABEL[raw] || raw || "—" };
}

function inquiryStatusBadge(status) {
  const ui = inquiryUiStatus(status);
  return badge(ui.label, ui.key);
}

/** Dashboard / strip counts from real hq_leads only (no fabricated data). */
function inquiryDashboardCounts(leads) {
  const active = (leads || []).filter((l) => !l.archived);
  let neu = 0;
  let progress = 0;
  let done = 0;
  for (const l of active) {
    const k = inquiryUiStatus(l.status).key;
    if (k === "new") neu += 1;
    else if (k === "reviewing" || k === "replied") progress += 1;
    else if (k === "won") done += 1;
  }
  return { total: active.length, neu, progress, done };
}

function leadInquiryType(l) {
  const meta = (l && l.metadata) || {};
  return (
    (l && (l.inquiryType || l.type_label || l.type)) ||
    meta.inquiryType ||
    meta.type_label ||
    meta.type ||
    LEAD_SOURCE_LABEL[(l && l.source) || ""] ||
    (l && l.source) ||
    "—"
  );
}

function leadServiceLabel(l) {
  const meta = (l && l.metadata) || {};
  return (
    (l && (l.service || l.project || l.product)) ||
    meta.service ||
    meta.project ||
    meta.product ||
    "—"
  );
}

function leadReceivedLabel(l) {
  const d = toDate((l && (l.providerSubmittedAt || l.createdAt)) || null);
  if (!d) return "—";
  try {
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ymd(d) || "—";
  }
}

function detailField(label, value) {
  return el("div", { className: "hq-detail-field" }, [
    el("p", { className: "hq-detail-field__label", text: label }),
    el("p", { className: "hq-detail-field__value", text: value == null || value === "" ? "—" : String(value) }),
  ]);
}

function priorityBadge(priority) {
  const p = String(priority || "").toLowerCase();
  const label = p ? p.charAt(0).toUpperCase() + p.slice(1) : "—";
  return badge(label, p || undefined);
}

function dueBadge(dueDate) {
  const d = ymd(dueDate);
  if (!d) return null;
  const t = todayYmd();
  if (d < t) return badge("지연", "overdue");
  if (d === t) return badge("오늘", "due-today");
  return null;
}

function pctBar(value, max, fillClass) {
  const m = Math.max(Number(max) || 0, 0);
  const v = Math.max(Number(value) || 0, 0);
  const pct = m > 0 ? Math.min(100, Math.round((v / m) * 100)) : 0;
  const fill = el("div", { className: fillClass || "hq-pipeline__fill" });
  fill.style.width = pct + "%";
  return el("div", { className: "hq-pipeline__track" }, [fill]);
}

function downloadCsv(filename, headers, rows) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(esc).join(",")].concat(
    rows.map((r) => r.map(esc).join(","))
  );
  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function snapToList(snap) {
  return snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
}

async function loadCol(name, orderField) {
  const db = ctx.db;
  const ref = collection(db, name);
  try {
    if (orderField) {
      return {
        ok: true,
        rows: snapToList(await getDocs(query(ref, orderBy(orderField, "desc")))),
      };
    }
    return { ok: true, rows: snapToList(await getDocs(ref)) };
  } catch (err) {
    const code = err && err.code ? String(err.code) : "";
    const permissionDenied = code === "permission-denied";
    if (orderField && !permissionDenied) {
      try {
        return { ok: true, rows: snapToList(await getDocs(ref)) };
      } catch (err2) {
        const code2 = err2 && err2.code ? String(err2.code) : code;
        return {
          ok: false,
          rows: [],
          permissionDenied: code2 === "permission-denied",
          message: code2 || (err2 && err2.message) || "load failed",
        };
      }
    }
    return {
      ok: false,
      rows: [],
      permissionDenied,
      message: code || (err && err.message) || "load failed",
    };
  }
}

async function loadSyncStateDoc() {
  try {
    const snap = await getDoc(doc(ctx.db, COL.syncState, "formsubmit"));
    if (!snap.exists()) return { ok: true, data: null, missing: true };
    return { ok: true, data: Object.assign({ id: snap.id }, snap.data()) };
  } catch (err) {
    const code = err && err.code ? String(err.code) : "";
    return {
      ok: false,
      data: null,
      permissionDenied: code === "permission-denied",
      message: code || (err && err.message) || "sync state load failed",
    };
  }
}

async function loadAll() {
  if (!ctx || !ctx.db) return;
  dataState = {
    status: "loading",
    permissionDenied: false,
    message: "",
    lastLoadedAt: dataState.lastLoadedAt,
  };
  const results = await Promise.all([
    loadCol(COL.tasks, "createdAt"),
    loadCol(COL.releases, "createdAt"),
    loadCol(COL.leads, "createdAt"),
    loadCol(COL.finance, "date"),
    loadCol(COL.productsMeta, null),
    loadCol(COL.projects, "updatedAt"),
    loadCol(COL.documents, "updatedAt"),
    loadCol(COL.milestones, null),
    loadCol(COL.clients, "updatedAt"),
    loadCol(COL.companies, "updatedAt"),
    WAITLIST_PIPELINE_ENABLED
      ? loadCol(COL.waitlist, "createdAt")
      : Promise.resolve({ ok: true, rows: [] }),
    loadSyncStateDoc(),
  ]);
  const keys = [
    "tasks",
    "releases",
    "leads",
    "finance",
    "productsMeta",
    "projects",
    "documents",
    "milestones",
    "clients",
    "companies",
    "waitlist",
  ];
  const next = emptyCache();
  let anyFail = false;
  let permissionDenied = false;
  let message = "";
  results.forEach((r, i) => {
    if (keys[i] === undefined) return;
    next[keys[i]] = r.rows || [];
    if (!r.ok) {
      anyFail = true;
      if (r.permissionDenied) permissionDenied = true;
      if (r.message) message = r.message;
    }
  });
  const syncResult = results[results.length - 1];
  if (syncResult && syncResult.ok) {
    next.formsubmitSync = syncResult.data || null;
  } else if (syncResult && !syncResult.ok) {
    // Missing sync doc is ok (Not configured); permission errors count
    if (syncResult.permissionDenied) {
      anyFail = true;
      permissionDenied = true;
      message = syncResult.message || message;
    }
    next.formsubmitSync = null;
  }
  cache = next;
  dataState = {
    status: anyFail ? "error" : "ok",
    permissionDenied,
    message: permissionDenied
      ? "Permission denied reading Firestore (check Auth UID / rules)."
      : message,
    lastLoadedAt: anyFail ? dataState.lastLoadedAt : Date.now(),
  };
  if (!anyFail) dataState.lastLoadedAt = Date.now();
}

async function loadCatalog() {
  try {
    const res = await fetch("./catalog.json", { cache: "no-store" });
    if (!res.ok) {
      catalog = [];
      return;
    }
    const data = await res.json();
    catalog = Array.isArray(data) ? data : [];
  } catch {
    catalog = [];
  }
}

async function loadServiceTypes() {
  try {
    const res = await fetch("./service-types.json", { cache: "no-store" });
    if (!res.ok) {
      serviceTypes = DEFAULT_SERVICE_TYPES.slice();
      return;
    }
    const data = await res.json();
    serviceTypes = Array.isArray(data) && data.length ? data : DEFAULT_SERVICE_TYPES.slice();
  } catch {
    serviceTypes = DEFAULT_SERVICE_TYPES.slice();
  }
}

async function loadPricing() {
  try {
    const res = await fetch("./pricing.json", { cache: "no-store" });
    if (!res.ok) {
      pricingBySlug = {};
      return;
    }
    const data = await res.json();
    pricingBySlug = data && typeof data === "object" ? data : {};
  } catch {
    pricingBySlug = {};
  }
}

async function loadQuotePackages() {
  try {
    const res = await fetch("./quote-packages.json", { cache: "no-store" });
    if (!res.ok) {
      quotePackages = [];
      return;
    }
    const data = await res.json();
    quotePackages = Array.isArray(data) ? data : [];
  } catch {
    quotePackages = [];
  }
}

function ensureDocsMod() {
  if (docsMod) return docsMod;
  docsMod = installHqDocs({
    el,
    btn,
    clear,
    toast,
    pageHeader,
    toolbar,
    table,
    emptyState,
    emptyMsg,
    surfacePanel,
    badge,
    select,
    input,
    textarea,
    fieldRow,
    openModal,
    closeModal,
    withSaving,
    confirmDelete,
    formatKrw,
    ymd,
    uid,
    serverTimestamp,
    collection,
    doc,
    addDoc,
    updateDoc,
    COL,
    getCache: () => cache,
    getCtx: () => ctx,
    projectById,
    projectOptions,
    serviceTypeLabel,
    getServiceTypes: () => serviceTypes,
    getPricing: () => pricingBySlug,
    getQuotePackages: () => quotePackages,
    refreshAndRender,
    showPanel,
    formatLongDate,
    openFinanceForm,
    clientById: (id) => (ensureCrmMod().clientById(id)),
    companyById: (id) => (ensureCrmMod().companyById(id)),
    openCrmDetail: (kind, id) => {
      ensureCrmMod().setDetail(kind, id);
      showPanel("clients");
    },
    setProjectDetailId: (id) => {
      projectDetailId = id;
    },
  });
  return docsMod;
}

function ensureOpsMod() {
  if (opsMod) return opsMod;
  opsMod = installHqOps({
    el,
    btn,
    clear,
    toast,
    pageHeader,
    toolbar,
    emptyState,
    emptyMsg,
    surfacePanel,
    badge,
    select,
    input,
    textarea,
    fieldRow,
    openModal,
    closeModal,
    withSaving,
    confirmDelete,
    formatKrw,
    ymd,
    uid,
    serverTimestamp,
    collection,
    doc,
    addDoc,
    updateDoc,
    COL,
    getCache: () => cache,
    getCtx: () => ctx,
    projectById,
    refreshAndRender,
    showPanel,
    openTaskForm,
    openProjectForm,
    openProjectStatusForm,
    financeTotals,
    openFinanceForm,
    ensureDocsMod,
    projectStatusBadge,
    priorityBadge,
    serviceTypeLabel,
    PROJECT_STATUS_LABEL,
    statusBadge,
    clearProjectDetail: () => {
      projectDetailId = null;
      if (opsMod) opsMod.resetTab();
    },
    setProjectDetailId: (id) => {
      projectDetailId = id;
    },
    crmLinkRow: (item) => ensureCrmMod().crmLinkRow(item),
  });
  return opsMod;
}

function ensureCrmMod() {
  if (crmMod) return crmMod;
  crmMod = installHqCrm({
    el,
    btn,
    clear,
    toast,
    pageHeader,
    toolbar,
    table,
    emptyState,
    emptyMsg,
    surfacePanel,
    badge,
    select,
    input,
    textarea,
    fieldRow,
    openModal,
    closeModal,
    withSaving,
    confirmDelete,
    formatKrw,
    ymd,
    uid,
    serverTimestamp,
    collection,
    doc,
    addDoc,
    updateDoc,
    COL,
    getCache: () => cache,
    getCtx: () => ctx,
    refreshAndRender,
    showPanel,
    openLeadForm,
    openProjectForm,
    ensureDocsMod,
    projectStatusBadge,
    statusBadge,
    inquiryStatusBadge,
    projectHealth: (p) => ensureOpsMod().projectHealth(p),
    dataStateBanner,
    getDataState: () => dataState,
    setProjectDetailId: (id) => {
      projectDetailId = id;
    },
    setDocumentDetailId: (id) => {
      ensureDocsMod().setDetailId(id);
    },
  });
  return crmMod;
}

function ensureHealthMod() {
  if (healthMod) return healthMod;
  healthMod = installHqHealth({
    el,
    btn,
    clear,
    pageHeader,
    emptyState,
    surfacePanel,
    badge,
    openModal,
    closeModal,
  });
  return healthMod;
}

async function refreshAndRender() {
  try {
    await loadAll();
    renderCurrent();
  } catch {
    toast("데이터 로드 실패", "err");
  }
}

function withSaving(fn) {
  return async (...args) => {
    if (saving) return;
    saving = true;
    const modal = $("hq-modal");
    modal &&
      modal.querySelectorAll("button[type='submit'], button[data-hq-save]").forEach((b) => {
        b.disabled = true;
      });
    try {
      await fn(...args);
    } finally {
      saving = false;
      modal &&
        modal.querySelectorAll("button[type='submit'], button[data-hq-save]").forEach((b) => {
          b.disabled = false;
        });
    }
  };
}

function confirmDelete(message, onYes) {
  const body = el("p", { text: message });
  openModal("확인", body, [
    btn("취소", { className: "hq-btn hq-btn--ghost", onClick: closeModal }),
    btn("삭제", {
      className: "hq-btn hq-btn--danger",
      onClick: withSaving(async () => {
        await onYes();
        closeModal();
      }),
    }),
  ]);
}


function projectById(id) {
  if (!id) return null;
  return cache.projects.find((p) => p.id === id) || null;
}

function projectOptions(selected) {
  const opts = [{ value: "", label: "None" }].concat(
    cache.projects
      .filter((p) => !p.archived)
      .map((p) => ({ value: p.id, label: p.name || p.id }))
  );
  return select({}, opts, selected || "");
}

function serviceTypeOptions(selected) {
  const opts = serviceTypes.map((s) =>
    typeof s === "string" ? { value: s, label: s } : s
  );
  return select({}, opts, selected || (opts[0] && opts[0].value) || "other");
}

function projectStatusBadge(status) {
  const s = String(status || "");
  const label = PROJECT_STATUS_LABEL[s] || s || "—";
  return badge(label, s);
}

function releaseStatusBadge(status) {
  const s = String(status || "");
  return badge(RELEASE_STATUS_LABEL[s] || s || "—", s || "other");
}

function financeTypeBadge(type) {
  const t = String(type || "");
  return badge(FINANCE_TYPE_LABEL[t] || t || "—", t || "other");
}

function releaseAttentionBadge(r) {
  if (!r || r.status === "released") return null;
  if (r.status === "blocked") return badge("주의", "blocked");
  const d = ymd(r.submittedAt) || ymd(r.releasedAt);
  if (d && d < todayYmd()) return badge("일정 지남", "overdue");
  return null;
}

function releaseSortDate(r) {
  if (r.status === "released") return ymd(r.releasedAt) || ymd(r.submittedAt) || "0000-00-00";
  return ymd(r.submittedAt) || ymd(r.releasedAt) || "9999-99-99";
}

function compareReleasesOps(a, b) {
  const ra = RELEASE_STATUS_RANK[a.status] != null ? RELEASE_STATUS_RANK[a.status] : 50;
  const rb = RELEASE_STATUS_RANK[b.status] != null ? RELEASE_STATUS_RANK[b.status] : 50;
  if (ra !== rb) return ra - rb;
  const da = releaseSortDate(a);
  const db = releaseSortDate(b);
  if (a.status === "released" || b.status === "released") {
    // released: newest first
    if (a.status === "released" && b.status === "released") {
      return db.localeCompare(da);
    }
  }
  // open: sooner date first
  if (da !== db) return da < db ? -1 : 1;
  return String(a.product || "").localeCompare(String(b.product || ""), "ko");
}

function serviceTypeLabel(value) {
  const hit = serviceTypes.find((s) => (s.value || s) === value);
  if (!hit) return value || "—";
  return hit.label || hit.value || value;
}

function opsKpiCard(label, value, caption, source, opts) {
  opts = opts || {};
  const display =
    dataState.status === "loading" && (value === 0 || value === "0")
      ? "—"
      : String(value);
  const kids = [
    el("p", { className: "hq-card__label", text: label }),
    el("p", { className: "hq-card__value", text: display }),
  ];
  if (caption) kids.push(el("p", { className: "hq-stat__caption", text: caption }));
  if (source) kids.push(el("p", { className: "hq-kpi-source", text: source }));
  const attrs = { className: "hq-card hq-stat" + (opts.onClick ? " hq-stat--clickable" : "") };
  if (opts.onClick) {
    attrs.style = "cursor:pointer";
    attrs.onClick = opts.onClick;
    attrs.role = "button";
    attrs.tabIndex = 0;
    attrs.onKeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        opts.onClick();
      }
    };
  }
  return el("div", attrs, kids);
}

function notConnectedKpi(label, reason) {
  return el("div", { className: "hq-card hq-stat hq-stat--muted" }, [
    el("p", { className: "hq-card__label", text: label }),
    el("p", { className: "hq-card__value", text: "—" }),
    el("p", { className: "hq-stat__caption", text: "Not connected" }),
    el("p", { className: "hq-kpi-source", text: reason }),
  ]);
}

function dataStateBanner() {
  if (dataState.status === "loading") {
    return el("div", { className: "hq-banner hq-banner--loading", role: "status" }, [
      el("p", { text: "Firestore 데이터를 불러오는 중…" }),
    ]);
  }
  if (dataState.status === "error") {
    const title = dataState.permissionDenied ? "권한 없음" : "데이터 로드 오류";
    return el("div", { className: "hq-banner hq-banner--error", role: "alert" }, [
      el("p", { className: "hq-banner__title", text: title }),
      el("p", {
        text:
          dataState.message ||
          "HQ 컬렉션 일부를 불러오지 못했습니다. 권한·네트워크를 확인하세요.",
      }),
    ]);
  }
  return null;
}

function renderSystemHealthPanel() {
  const healthMod = ensureHealthMod();
  const snapOk = !!(healthMod && healthMod.getReport && healthMod.getReport());
  let firestoreStatus = "Healthy";
  let firestoreDetail = "hq_* collections readable";
  if (dataState.status === "loading") {
    firestoreStatus = "Warning";
    firestoreDetail = "Load in progress";
  } else if (dataState.permissionDenied) {
    firestoreStatus = "Error";
    firestoreDetail = dataState.message || "Permission denied";
  } else if (dataState.status === "error") {
    firestoreStatus = "Warning";
    firestoreDetail = dataState.message || "Partial load failure";
  }
  const syncHealth = evaluateArchiveSyncHealth(cache.formsubmitSync);
  const rows = systemHealthRows({
    authOk: !!(ctx && ctx.user),
    firestore: firestoreStatus,
    firestoreDetail,
    analytics: "Not configured",
    formPipeline: syncHealth.status,
    formPipelineDetail: syncHealth.detail,
    healthSnapshot: snapOk ? "Healthy" : "Warning",
    lastLoadedAt: dataState.lastLoadedAt,
  });
  return el(
    "div",
    { className: "hq-health-grid" },
    rows.map((r) =>
      el("div", { className: "hq-health-row" }, [
        el("div", { className: "hq-health-row__main" }, [
          el("p", { className: "hq-health-row__label", text: r.label }),
          el("p", { className: "hq-health-row__detail", text: r.detail }),
        ]),
        badge(r.status, healthStatusKind(r.status)),
      ])
    )
  );
}

function renderActivityFeedPanel() {
  const items = buildActivityItems(cache, { limit: 16 });
  if (!items.length) {
    return el("div", { style: "padding:1rem 1.05rem" }, [
      emptyState(
        "최근 활동 없음",
        "문의·프로젝트·작업·릴리스·문서가 변경되면 여기에 표시됩니다.",
        null
      ),
    ]);
  }
  return el(
    "div",
    { className: "hq-activity" },
    items.map((it) => {
      const when = new Date(it.at);
      const stamp = Number.isFinite(when.getTime())
        ? when.toLocaleString()
        : "—";
      return el("div", { className: "hq-activity__row" }, [
        el("div", null, [
          el("p", { className: "hq-activity__event", text: it.event }),
          el("p", {
            className: "hq-activity__meta",
            text: `${it.category} · ${it.target}`,
          }),
        ]),
        el("time", { className: "hq-activity__time", text: stamp }),
      ]);
    })
  );
}

/* ---------- Dashboard ---------- */
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

function taskDueRank(t) {
  if (t.status === "done") return 90;
  const due = ymd(t.dueDate);
  if (!due) return 40;
  const tday = todayYmd();
  if (due < tday) return 0;
  if (due === tday) return 10;
  const ops = ensureOpsMod();
  const st = ops.dueState(due, false);
  if (st === "due_soon") return 20;
  return 30;
}

function compareTasksOps(a, b) {
  const ra = taskDueRank(a);
  const rb = taskDueRank(b);
  if (ra !== rb) return ra - rb;
  const pa = PRIORITY_RANK[a.priority] != null ? PRIORITY_RANK[a.priority] : 9;
  const pb = PRIORITY_RANK[b.priority] != null ? PRIORITY_RANK[b.priority] : 9;
  if (pa !== pb) return pa - pb;
  const da = ymd(a.dueDate) || "9999-99-99";
  const db = ymd(b.dueDate) || "9999-99-99";
  if (da !== db) return da < db ? -1 : 1;
  return String(a.title || "").localeCompare(String(b.title || ""), "ko");
}

function openTasksSorted(limit) {
  return cache.tasks
    .filter((t) => t.status !== "done")
    .slice()
    .sort(compareTasksOps)
    .slice(0, limit || 6);
}

/** Dashboard work queue: open tasks that are not already highlighted as overdue/today. */
function dashboardNextTasks(limit) {
  const tday = todayYmd();
  return cache.tasks
    .filter((t) => {
      if (t.status === "done") return false;
      const due = ymd(t.dueDate);
      if (due && due <= tday) return false;
      return true;
    })
    .slice()
    .sort(compareTasksOps)
    .slice(0, limit || 5);
}

const PROJECT_OPS_RANK = {
  active: 0,
  review: 1,
  contract: 2,
  planning: 3,
  quoted: 4,
  inquiry: 5,
  on_hold: 6,
  completed: 7,
  cancelled: 8,
};

function compareProjectsOps(a, b) {
  const ra = PROJECT_OPS_RANK[a.status] != null ? PROJECT_OPS_RANK[a.status] : 50;
  const rb = PROJECT_OPS_RANK[b.status] != null ? PROJECT_OPS_RANK[b.status] : 50;
  if (ra !== rb) return ra - rb;
  const da = ymd(a.targetDate) || "9999-99-99";
  const db = ymd(b.targetDate) || "9999-99-99";
  if (da !== db) return da < db ? -1 : 1;
  const pa = PRIORITY_RANK[a.priority] != null ? PRIORITY_RANK[a.priority] : 9;
  const pb = PRIORITY_RANK[b.priority] != null ? PRIORITY_RANK[b.priority] : 9;
  if (pa !== pb) return pa - pb;
  return String(a.name || "").localeCompare(String(b.name || ""), "ko");
}

function newInquiryItems(limit) {
  return cache.leads
    .filter((l) => !l.archived && inquiryUiStatus(l.status).key === "new")
    .slice()
    .sort((a, b) => {
      const am = toMillis(a.providerSubmittedAt || a.createdAt) || 0;
      const bm = toMillis(b.providerSubmittedAt || b.createdAt) || 0;
      return bm - am;
    })
    .slice(0, limit || 5);
}

function goLeadsFiltered(ui) {
  filters.leads.ui = ui || "";
  filters.leads.status = "";
  filters.leads.archived = "active";
  showPanel("leads");
}

function goTasksFiltered(status) {
  filters.tasks.status = status === undefined || status === null ? "open" : status;
  filters.tasks.priority = "";
  showPanel("tasks");
}

function goProjectsFiltered(status) {
  projectDetailId = null;
  filters.projects.status = status === undefined || status === null ? "active" : status;
  filters.projects.archived = "active";
  showPanel("projects");
}

function renderDashboardInquiryQueue() {
  const news = newInquiryItems(5);
  const kids = [];

  if (news.length) {
    for (const l of news) {
      const row = el("div", {
        className: "hq-row hq-table__row--clickable",
        style: "cursor:pointer",
        onClick: () => openLeadDetail(l),
      });
      row.appendChild(inquiryStatusBadge(l.status));
      const mid = el("div");
      mid.appendChild(el("p", { className: "hq-row__title", text: l.name || "—" }));
      mid.appendChild(
        el("p", {
          className: "hq-row__meta",
          text: `${leadReceivedLabel(l)} · ${leadInquiryType(l)} · ${leadServiceLabel(l)}`,
        })
      );
      row.appendChild(mid);
      kids.push(row);
    }
  } else {
    kids.push(
      el("div", { style: "padding:1rem 1.05rem" }, [
        emptyState(
          dataState.status === "loading" ? "문의 로딩 중" : "처리할 신규 문의 없음",
          dataState.status === "loading"
            ? "Firestore에서 문의 데이터를 불러오는 중입니다."
            : "신규 문의가 들어오면 여기에 바로 표시됩니다.",
          btn("문의 관리", {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: () => goLeadsFiltered(""),
          })
        ),
      ])
    );
  }

  return surfacePanel(
    "지금 처리할 문의",
    kids,
    el("div", { className: "hq-dash-actions" }, [
      btn("문의 전체", {
        className: "hq-btn hq-btn--small hq-btn--ghost",
        onClick: () => goLeadsFiltered(""),
      }),
      btn("신규만", {
        className: "hq-btn hq-btn--small hq-btn--ghost",
        onClick: () => goLeadsFiltered("new"),
      }),
    ])
  );
}

function renderDashboard(root) {
  clear(root);
  const month = monthKey(new Date());
  const openTasks = cache.tasks.filter((t) => t.status !== "done").length;
  const activeProjects = cache.projects.filter(
    (p) => !p.archived && p.status === "active"
  ).length;
  let income = 0;
  let expense = 0;
  for (const f of cache.finance) {
    if (f.archived) continue;
    if (monthKey(f.date) !== month) continue;
    const amt = Number(f.amount) || 0;
    if (f.type === "income") income += amt;
    else if (f.type === "expense") expense += amt;
  }
  const net = income - expense;
  const inqDash = inquiryDashboardCounts(cache.leads);
  const overdueTasks = cache.tasks.filter((t) => {
    if (t.status === "done") return false;
    return ensureOpsMod().dueState(t.dueDate, false) === "overdue";
  }).length;

  root.appendChild(
    pageHeader("dashboard", [
      el("span", { className: "hq-page-header__meta", text: formatLongDate(new Date()) }),
      el("span", {
        className: "hq-page-header__count",
        text: dataState.status === "ok" ? "Live Firestore" : dataState.status,
      }),
    ])
  );

  const banner = dataStateBanner();
  if (banner) root.appendChild(banner);

  root.appendChild(
    el("div", { className: "hq-stat-grid hq-stat-grid--compact" }, [
      opsKpiCard(
        "신규 문의",
        inqDash.neu,
        "바로 확인",
        "hq_leads",
        { onClick: () => goLeadsFiltered("new") }
      ),
      opsKpiCard(
        "열린 작업",
        openTasks,
        overdueTasks ? `지연 ${overdueTasks}` : "Todo + doing",
        "hq_tasks",
        { onClick: () => goTasksFiltered("open") }
      ),
      opsKpiCard(
        "진행 프로젝트",
        activeProjects,
        "status = active",
        "hq_projects",
        { onClick: () => goProjectsFiltered("active") }
      ),
      opsKpiCard(
        "이번 달 손익",
        formatKrw(net),
        month,
        "hq_finance",
        { onClick: () => showPanel("finance") }
      ),
    ])
  );
  root.appendChild(el("div", { style: "height:0.85rem" }));

  root.appendChild(renderDashboardInquiryQueue());
  root.appendChild(el("div", { style: "height:0.85rem" }));
  root.appendChild(
    surfacePanel("일정 · 리스크", [ensureOpsMod().renderDashboardOpsPanel()], null)
  );
  root.appendChild(el("div", { style: "height:0.85rem" }));

  root.appendChild(
    surfacePanel(
      "문의 현황",
      [
        el("div", { className: "hq-stat-grid hq-stat-grid--compact" }, [
          opsKpiCard("전체", inqDash.total, "보관 제외", "hq_leads", {
            onClick: () => goLeadsFiltered(""),
          }),
          opsKpiCard("신규", inqDash.neu, "상태 = 신규", "hq_leads", {
            onClick: () => goLeadsFiltered("new"),
          }),
          opsKpiCard("진행 중", inqDash.progress, "확인 + 진행", "hq_leads", {
            onClick: () => showPanel("leads"),
          }),
          opsKpiCard("완료", inqDash.done, "상태 = 완료", "hq_leads", {
            onClick: () => goLeadsFiltered("won"),
          }),
        ]),
      ],
      btn("문의 관리 →", {
        className: "hq-btn hq-btn--ghost hq-btn--small",
        onClick: () => goLeadsFiltered(""),
      })
    )
  );
  root.appendChild(el("div", { style: "height:0.85rem" }));

  if (WAITLIST_PIPELINE_ENABLED) {
    const since7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const w = waitlistCounts(cache.waitlist, since7);
    root.appendChild(
      surfacePanel(
        "Waitlist",
        [
          w.total
            ? el("div", { className: "hq-stat-grid hq-stat-grid--compact" }, [
                opsKpiCard("Total", w.total, "Not archived", "hq_waitlist"),
                opsKpiCard("Active", w.active, "status=active", "hq_waitlist"),
                opsKpiCard("Converted", w.converted, "status=converted", "hq_waitlist"),
                opsKpiCard("Signups (7D)", w.recent, "Last 7 days", "hq_waitlist"),
              ])
            : el("div", { style: "padding:1rem 1.05rem" }, [
                emptyState(
                  "Waitlist empty",
                  "hq_waitlist is connected but has no signups yet.",
                  null
                ),
              ]),
        ],
        null
      )
    );
    root.appendChild(el("div", { style: "height:0.85rem" }));
  }

  const taskPreview = dashboardNextTasks(5);
  const taskBody = [];
  if (!taskPreview.length) {
    taskBody.push(
      el("div", { style: "padding:1rem 1.05rem" }, [
        emptyState(
          dataState.status === "loading" ? "작업 로딩 중" : "다음 작업 없음",
          dataState.status === "loading"
            ? "Firestore에서 작업을 불러오는 중입니다."
            : "오늘·지연 일정은 위 ‘일정 · 리스크’에서 확인하고, 새 작업은 Tasks에서 추가하세요.",
          btn("Tasks →", {
            className: "hq-btn hq-btn--ghost hq-btn--small",
            onClick: () => goTasksFiltered("open"),
          })
        ),
      ])
    );
  } else {
    for (const t of taskPreview) {
      const row = el("div", {
        className: "hq-row hq-row--task" + (t.status === "done" ? " is-done" : ""),
        style: "cursor:pointer",
        onClick: () => openTaskForm(t),
      });
      row.appendChild(statusBadge(t.status));
      const mid = el("div");
      mid.appendChild(el("p", { className: "hq-row__title", text: t.title || "—" }));
      const metaBits = [t.priority || "", ymd(t.dueDate) || "기한 없음"]
        .filter(Boolean)
        .join(" · ");
      mid.appendChild(el("p", { className: "hq-row__meta", text: metaBits }));
      row.appendChild(mid);
      const due = dueBadge(t.dueDate);
      row.appendChild(due || el("span", { className: "hq-row__aside", text: "" }));
      row.appendChild(priorityBadge(t.priority));
      taskBody.push(row);
    }
  }

  const projectPreview = cache.projects
    .filter(
      (p) =>
        !p.archived &&
        (p.status === "active" || p.status === "review" || p.status === "contract")
    )
    .slice()
    .sort(compareProjectsOps)
    .slice(0, 5);
  const projectBody = [];
  if (!projectPreview.length) {
    projectBody.push(
      el("div", { style: "padding:1rem 1.05rem" }, [
        emptyState(
          dataState.status === "loading" ? "프로젝트 로딩 중" : "진행 중 프로젝트 없음",
          dataState.status === "loading"
            ? "Firestore에서 프로젝트를 불러오는 중입니다."
            : "진행·검수·계약 단계 프로젝트가 생기면 여기에 표시됩니다.",
          btn("Projects →", {
            className: "hq-btn hq-btn--ghost hq-btn--small",
            onClick: () => goProjectsFiltered(""),
          })
        ),
      ])
    );
  } else {
    for (const p of projectPreview) {
      const row = el("div", {
        className: "hq-row",
        style: "cursor:pointer",
        onClick: () => {
          projectDetailId = p.id;
          showPanel("projects");
        },
      });
      row.appendChild(projectStatusBadge(p.status));
      const mid = el("div");
      mid.appendChild(el("p", { className: "hq-row__title", text: p.name || "—" }));
      mid.appendChild(
        el("p", {
          className: "hq-row__meta",
          text: `${p.clientName || p.company || "—"} · ${ymd(p.targetDate) || "목표일 없음"}`,
        })
      );
      row.appendChild(mid);
      row.appendChild(priorityBadge(p.priority));
      projectBody.push(row);
    }
  }

  root.appendChild(
    el("div", { className: "hq-grid-2" }, [
      surfacePanel(
        "다음 작업",
        taskBody,
        el("button", {
          type: "button",
          className: "hq-surface-panel__link",
          text: "전체 보기",
          onClick: () => goTasksFiltered("open"),
        })
      ),
      surfacePanel(
        "진행 중 프로젝트",
        projectBody,
        el("button", {
          type: "button",
          className: "hq-surface-panel__link",
          text: "전체 보기",
          onClick: () => goProjectsFiltered("active"),
        })
      ),
    ])
  );
  root.appendChild(el("div", { style: "height:0.85rem" }));

  const finMax = Math.max(income, expense, 1);
  const finBars = el("div", { className: "hq-bar-pair" }, [
    el("div", { className: "hq-bar-pair__item" }, [
      el("div", { className: "hq-bar-pair__top" }, [
        el("span", { text: "수입" }),
        el("span", { className: "hq-bar-pair__val", text: formatKrw(income) }),
      ]),
      el("div", { className: "hq-bar-pair__track" }, [
        (() => {
          const f = el("div", { className: "hq-bar-pair__fill--income" });
          f.style.width = Math.round((income / finMax) * 100) + "%";
          return f;
        })(),
      ]),
    ]),
    el("div", { className: "hq-bar-pair__item" }, [
      el("div", { className: "hq-bar-pair__top" }, [
        el("span", { text: "지출" }),
        el("span", { className: "hq-bar-pair__val", text: formatKrw(expense) }),
      ]),
      el("div", { className: "hq-bar-pair__track" }, [
        (() => {
          const f = el("div", { className: "hq-bar-pair__fill--expense" });
          f.style.width = Math.round((expense / finMax) * 100) + "%";
          return f;
        })(),
      ]),
    ]),
    el("p", {
      className: "hq-stat__caption",
      text: `순손익 ${formatKrw(net)} · ${month}`,
    }),
  ]);

  const releasePreview = cache.releases
    .filter((r) => r.status !== "released")
    .concat(cache.releases.filter((r) => r.status === "released"))
    .slice(0, 5);
  const releaseBody = [];
  if (!releasePreview.length) {
    releaseBody.push(
      el("div", { style: "padding:1rem 1.05rem" }, [
        emptyMsg("등록된 릴리스가 없습니다."),
      ])
    );
  } else {
    for (const r of releasePreview) {
      const row = el("div", {
        className: "hq-row",
        style: "cursor:pointer",
        onClick: () => showPanel("releases"),
      });
      row.appendChild(releaseStatusBadge(r.status));
      const mid = el("div");
      mid.appendChild(
        el("p", {
          className: "hq-row__title",
          text: `${r.product || "—"} ${r.version || ""}`.trim(),
        })
      );
      mid.appendChild(
        el("p", {
          className: "hq-row__meta",
          text: `${r.platform || "—"} · ${ymd(r.releasedAt) || ymd(r.submittedAt) || "—"}`,
        })
      );
      row.appendChild(mid);
      releaseBody.push(row);
    }
  }

  root.appendChild(
    el("div", { className: "hq-grid-2--equal hq-grid-2" }, [
      surfacePanel(
        "이번 달 재무",
        [finBars],
        btn("Finance →", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: () => showPanel("finance"),
        })
      ),
      surfacePanel(
        "릴리스",
        releaseBody,
        btn("Releases →", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: () => showPanel("releases"),
        })
      ),
    ])
  );

  root.appendChild(el("div", { style: "height:0.85rem" }));
  root.appendChild(
    el("div", { className: "hq-grid-2" }, [
      surfacePanel("최근 활동", [renderActivityFeedPanel()]),
      surfacePanel("문서 · CRM", [
        ensureDocsMod().renderDashboardDocsPanel(),
        el("div", { style: "padding:0.5rem 1.05rem 0" }, [
          ensureCrmMod().renderDashboardCrmStrip(),
        ]),
        el("div", { style: "padding:0.75rem 1.05rem 1rem; display:flex; gap:0.5rem; flex-wrap:wrap" }, [
          btn("Documents", {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: () => showPanel("documents"),
          }),
          btn("Clients", {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: () => showPanel("clients"),
          }),
        ]),
      ]),
    ])
  );

  root.appendChild(el("div", { style: "height:0.85rem" }));
  root.appendChild(
    surfacePanel(
      "시스템",
      [
        renderSystemHealthPanel(),
        el("div", { style: "padding:0.75rem 1.05rem 0.25rem" }, [
          el("p", {
            className: "hq-stat__caption",
            text: "스토어·GA 등 미연결 지표는 Analytics에서 확인합니다. 허위 수치는 표시하지 않습니다.",
          }),
        ]),
        el("div", { style: "padding:0.5rem 1.05rem 1rem; display:flex; gap:0.5rem; flex-wrap:wrap" }, [
          btn("Health", {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: () => showPanel("health"),
          }),
          btn("Analytics", {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: () => showPanel("analytics"),
          }),
        ]),
      ],
      null
    )
  );
}

function filteredTasks() {
  const f = filters.tasks;
  const q = (f.q || "").trim().toLowerCase();
  const list = cache.tasks.filter((t) => {
    if (f.status === "open") {
      if (t.status === "done") return false;
    } else if (f.status && t.status !== f.status) {
      return false;
    }
    if (f.priority && t.priority !== f.priority) return false;
    if (q) {
      const hay = `${t.title || ""} ${t.description || ""} ${t.category || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  return list.slice().sort(compareTasksOps);
}

function openTaskForm(item, opts) {
  opts = opts || {};
  const isEdit = !!item;
  const prefProject = (item && item.projectId) || opts.projectId || "";
  const titleIn = input({ value: (item && item.title) || "", required: true });
  const descIn = textarea({ text: (item && item.description) || "" });
  descIn.value = (item && item.description) || "";
  const statusIn = select({}, TASK_STATUS, (item && item.status) || "todo");
  const priIn = select({}, TASK_PRIORITY, (item && item.priority) || "medium");
  const catIn = input({ value: (item && item.category) || "" });
  const dueIn = input({ type: "date", value: ymd(item && item.dueDate) });
  const assigneeIn = input({ value: (item && item.assignee) || "" });
  const projectIn = projectOptions(prefProject);
  const milestoneOpts = [{ value: "", label: "— None —" }].concat(
    (cache.milestones || [])
      .filter((m) => !m.archived && m.projectId === prefProject)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
      .map((m) => ({ value: m.id, label: m.title || m.id }))
  );
  const milestoneIn = select(
    {},
    milestoneOpts,
    (item && item.milestoneId) || opts.milestoneId || ""
  );
  const laneIn = select(
    {},
    BOARD_LANES,
    (item && item.lane) ||
      (item && item.status === "done"
        ? "done"
        : item && item.status === "doing"
          ? "in_progress"
          : "todo")
  );
  const form = el("form", { className: "hq-form" }, [
    fieldRow("제목 *", titleIn),
    fieldRow("설명", descIn),
    fieldRow("상태", statusIn),
    fieldRow("Board lane", laneIn),
    fieldRow("우선순위", priIn),
    fieldRow("카테고리", catIn),
    fieldRow("Assignee", assigneeIn),
    fieldRow("Project", projectIn),
    fieldRow("Milestone", milestoneIn),
    fieldRow("마감일", dueIn),
  ]);
  const saveBtn = btn("저장", { type: "submit", dataset: { hqSave: "1" } });
  const cancelBtn = btn("취소", {
    className: "hq-btn hq-btn--ghost",
    onClick: (e) => {
      e.preventDefault();
      closeModal();
    },
  });
  form.addEventListener(
    "submit",
    withSaving(async (e) => {
      e.preventDefault();
      const title = titleIn.value.trim();
      if (!title) {
        toast("제목은 필수입니다", "err");
        return;
      }
      if (!TASK_STATUS.includes(statusIn.value) || !TASK_PRIORITY.includes(priIn.value)) {
        toast("유효하지 않은 값", "err");
        return;
      }
      const lane = laneIn.value || null;
      let status = statusIn.value;
      if (lane === "done") status = "done";
      else if (lane === "in_progress" || lane === "review") {
        if (status === "done") status = "doing";
      }
      const payload = {
        title,
        description: descIn.value.trim(),
        status,
        priority: priIn.value,
        category: catIn.value.trim(),
        dueDate: dueIn.value || null,
        projectId: projectIn.value || null,
        milestoneId: milestoneIn.value || null,
        assignee: assigneeIn.value.trim() || null,
        lane: lane || null,
        updatedAt: serverTimestamp(),
        updatedBy: uid(),
      };
      try {
        if (isEdit) {
          await updateDoc(doc(ctx.db, COL.tasks, item.id), payload);
        } else {
          await addDoc(collection(ctx.db, COL.tasks), {
            ...payload,
            createdAt: serverTimestamp(),
            createdBy: uid(),
          });
        }
        closeModal();
        toast("저장됨", "ok");
        await refreshAndRender();
      } catch {
        toast("저장 실패", "err");
      }
    })
  );
  openModal(isEdit ? "할 일 수정" : "할 일 추가", form, [cancelBtn, saveBtn]);
}

function renderTasks(root) {
  clear(root);
  const openCount = cache.tasks.filter((t) => t.status !== "done").length;
  const overdueCount = cache.tasks.filter((t) => {
    if (t.status === "done") return false;
    const d = ymd(t.dueDate);
    return d && d < todayYmd();
  }).length;

  root.appendChild(
    pageHeader("tasks", [
      el("span", {
        className: "hq-page-header__count",
        text:
          dataState.status === "loading"
            ? "로딩 중…"
            : overdueCount
              ? `열림 ${openCount} · 지연 ${overdueCount}`
              : `열림 ${openCount}`,
      }),
      btn("+ 작업", { onClick: () => openTaskForm(null) }),
    ])
  );

  const banner = dataStateBanner();
  if (banner) root.appendChild(banner);

  const seg = el("div", { className: "hq-seg hq-seg--wrap" });
  for (const [val, label] of [
    ["open", "열림"],
    ["", "전체"],
    ["todo", "Todo"],
    ["doing", "Doing"],
    ["done", "Done"],
  ]) {
    seg.appendChild(
      el("button", {
        type: "button",
        className: "hq-seg__btn" + (filters.tasks.status === val ? " is-active" : ""),
        text: label,
        onClick: () => {
          filters.tasks.status = val;
          renderTasks(root);
        },
      })
    );
  }
  const priF = select(
    {
      onChange: (e) => {
        filters.tasks.priority = e.target.value;
        renderTasks(root);
      },
    },
    [{ value: "", label: "우선순위" }].concat(
      TASK_PRIORITY.map((p) => ({ value: p, label: p }))
    ),
    filters.tasks.priority
  );
  const search = input({
    className: "hq-input hq-input--search",
    placeholder: "작업 검색…",
    value: filters.tasks.q || "",
    "aria-label": "작업 검색",
    onInput: (e) => {
      filters.tasks.q = e.target.value;
      renderTasks(root);
    },
  });
  root.appendChild(toolbar([seg, priF, search]));

  if (dataState.status === "loading" && !cache.tasks.length) {
    root.appendChild(
      emptyState("작업 로딩 중", "Firestore에서 작업 목록을 불러오는 중입니다.", null)
    );
    return;
  }

  const list = filteredTasks();
  if (!list.length) {
    const hasAny = cache.tasks.length > 0;
    root.appendChild(
      emptyState(
        hasAny ? "조건에 맞는 작업 없음" : "아직 작업이 없습니다",
        hasAny
          ? "필터를 바꾸거나 검색어를 지워 보세요."
          : "운영 작업을 추가하면 기한·우선순위로 추적할 수 있습니다.",
        hasAny
          ? null
          : btn("+ 작업", { onClick: () => openTaskForm(null) })
      )
    );
    return;
  }

  const rows = list.map((t) => {
    const tr = el("tr", {
      className: "hq-table__row--clickable" + (t.status === "done" ? " is-done" : ""),
      style: "cursor:pointer",
      onClick: () => openTaskForm(t),
    });
    const titleTd = el("td");
    titleTd.appendChild(document.createTextNode(t.title || "—"));
    const b = dueBadge(t.dueDate);
    if (b) {
      titleTd.appendChild(document.createTextNode(" "));
      titleTd.appendChild(b);
    }
    tr.appendChild(el("td", null, [statusBadge(t.status)]));
    tr.appendChild(titleTd);
    tr.appendChild(el("td", null, [priorityBadge(t.priority)]));
    tr.appendChild(el("td", { text: ymd(t.dueDate) || "—" }));
    tr.appendChild(el("td", { text: ymd(t.updatedAt) || "—" }));
    const actions = el("td", { className: "hq-actions-cell" });
    actions.appendChild(
      btn("수정", {
        className: "hq-btn hq-btn--small",
        onClick: (e) => {
          e.stopPropagation();
          openTaskForm(t);
        },
      })
    );
    actions.appendChild(
      btn("삭제", {
        className: "hq-btn hq-btn--small hq-btn--ghost",
        onClick: (e) => {
          e.stopPropagation();
          confirmDelete("이 작업을 삭제할까요?", async () => {
            try {
              await deleteDoc(doc(ctx.db, COL.tasks, t.id));
              toast("삭제됨", "ok");
              await refreshAndRender();
            } catch {
              toast("삭제 실패", "err");
            }
          });
        },
      })
    );
    tr.appendChild(actions);
    return tr;
  });
  root.appendChild(
    table(["상태", "제목", "우선순위", "기한", "업데이트", ""], rows, "조건에 맞는 작업이 없습니다.")
  );

  const cards = el("div", { className: "hq-card-list is-mobile-only" });
  for (const t of list) {
    const cardEl = el("article", {
      className: "hq-item-card",
      style: "cursor:pointer",
      onClick: () => openTaskForm(t),
    });
    const top = el("div", { className: "hq-item-card__top" });
    top.appendChild(el("p", { className: "hq-item-card__title", text: t.title || "—" }));
    top.appendChild(statusBadge(t.status));
    cardEl.appendChild(top);
    const due = dueBadge(t.dueDate);
    const metaRow = el("div", { className: "hq-item-card__meta-row" });
    metaRow.appendChild(
      el("p", {
        className: "hq-item-card__meta",
        text: `${t.priority || "—"} · 기한 ${ymd(t.dueDate) || "없음"}`,
      })
    );
    if (due) metaRow.appendChild(due);
    cardEl.appendChild(metaRow);
    const acts = el("div", { className: "hq-item-card__actions" });
    acts.appendChild(
      btn("수정", {
        className: "hq-btn hq-btn--small",
        onClick: (e) => {
          e.stopPropagation();
          openTaskForm(t);
        },
      })
    );
    cardEl.appendChild(acts);
    cards.appendChild(cardEl);
  }
  root.appendChild(cards);
}

function filteredReleases() {
  const f = filters.releases;
  const q = (f.product || "").trim().toLowerCase();
  const list = cache.releases.filter((r) => {
    if (f.status === "open") {
      if (r.status === "released") return false;
    } else if (f.status && r.status !== f.status) {
      return false;
    }
    if (q && !(String(r.product || "").toLowerCase().includes(q))) return false;
    return true;
  });
  return list.slice().sort(compareReleasesOps);
}
function openReleaseForm(item) {
  const isEdit = !!item;
  const productIn = input({ value: (item && item.product) || "", required: true });
  const versionIn = input({ value: (item && item.version) || "", required: true });
  const platformIn = select({}, RELEASE_PLATFORM, (item && item.platform) || "iOS");
  const statusIn = select(
    {},
    RELEASE_STATUS.map((s) => ({ value: s, label: RELEASE_STATUS_LABEL[s] || s })),
    (item && item.status) || "planned"
  );
  const submittedIn = input({ type: "date", value: ymd(item && item.submittedAt) });
  const releasedIn = input({ type: "date", value: ymd(item && item.releasedAt) });
  const notesIn = textarea({});
  notesIn.value = (item && item.notes) || "";
  const form = el("form", { className: "hq-form" }, [
    fieldRow("제품 *", productIn),
    fieldRow("버전 *", versionIn),
    fieldRow("플랫폼", platformIn),
    fieldRow("상태", statusIn),
    fieldRow("제출일", submittedIn),
    fieldRow("출시일", releasedIn),
    fieldRow("메모", notesIn),
  ]);
  const saveBtn = btn("저장", { type: "submit", dataset: { hqSave: "1" } });
  const cancelBtn = btn("취소", {
    className: "hq-btn hq-btn--ghost",
    onClick: (e) => {
      e.preventDefault();
      closeModal();
    },
  });
  form.addEventListener(
    "submit",
    withSaving(async (e) => {
      e.preventDefault();
      const product = productIn.value.trim();
      const version = versionIn.value.trim();
      if (!product || !version) {
        toast("제품·버전은 필수입니다", "err");
        return;
      }
      if (
        !RELEASE_PLATFORM.includes(platformIn.value) ||
        !RELEASE_STATUS.includes(statusIn.value)
      ) {
        toast("유효하지 않은 값", "err");
        return;
      }
      const payload = {
        product,
        version,
        platform: platformIn.value,
        status: statusIn.value,
        submittedAt: submittedIn.value || null,
        releasedAt: releasedIn.value || null,
        notes: notesIn.value.trim(),
        updatedAt: serverTimestamp(),
        updatedBy: uid(),
      };
      try {
        if (isEdit) {
          await updateDoc(doc(ctx.db, COL.releases, item.id), payload);
        } else {
          await addDoc(collection(ctx.db, COL.releases), {
            ...payload,
            createdAt: serverTimestamp(),
            createdBy: uid(),
          });
        }
        closeModal();
        toast("저장됨", "ok");
        await refreshAndRender();
      } catch {
        toast("저장 실패", "err");
      }
    })
  );
  openModal(isEdit ? "릴리스 수정" : "릴리스 추가", form, [cancelBtn, saveBtn]);
}

function renderReleases(root) {
  clear(root);
  const openCount = cache.releases.filter((r) => r.status !== "released").length;
  const blockedCount = cache.releases.filter((r) => r.status === "blocked").length;
  root.appendChild(
    pageHeader("releases", [
      el("span", {
        className: "hq-page-header__count",
        text:
          dataState.status === "loading"
            ? "로딩 중…"
            : blockedCount
              ? `진행 ${openCount} · 차단 ${blockedCount}`
              : `진행 ${openCount}`,
      }),
      btn("+ 릴리스", { onClick: () => openReleaseForm(null) }),
    ])
  );
  const banner = dataStateBanner();
  if (banner) root.appendChild(banner);

  const statusF = select(
    {
      onChange: (e) => {
        filters.releases.status = e.target.value;
        renderReleases(root);
      },
    },
    [{ value: "open", label: "진행·예정" }, { value: "", label: "전체" }].concat(
      RELEASE_STATUS.map((s) => ({ value: s, label: RELEASE_STATUS_LABEL[s] || s }))
    ),
    filters.releases.status
  );
  const productF = input({
    className: "hq-input hq-input--search",
    placeholder: "제품 검색…",
    value: filters.releases.product || "",
    "aria-label": "릴리스 제품 검색",
    onInput: (e) => {
      filters.releases.product = e.target.value;
      renderReleases(root);
    },
  });
  root.appendChild(toolbar([statusF, productF]));

  if (dataState.status === "loading" && !cache.releases.length) {
    root.appendChild(
      emptyState("릴리스 로딩 중", "Firestore에서 릴리스 기록을 불러오는 중입니다.", null)
    );
    return;
  }

  const list = filteredReleases();
  if (!list.length) {
    const hasAny = cache.releases.length > 0;
    root.appendChild(
      emptyState(
        hasAny ? "조건에 맞는 릴리스 없음" : "아직 릴리스 기록이 없습니다",
        hasAny
          ? "필터를 바꾸거나 검색어를 지워 보세요."
          : "앱·플랫폼 릴리스를 시작하면 여기에 기록하세요.",
        hasAny ? null : btn("+ 릴리스", { onClick: () => openReleaseForm(null) })
      )
    );
    return;
  }

  const upcoming = list.filter((r) => r.status !== "released");
  const released = list.filter((r) => r.status === "released");

  function releaseRows(items) {
    return items.map((r) => {
      const tr = el("tr", {
        className: "hq-table__row--clickable",
        style: "cursor:pointer",
        onClick: () => openReleaseForm(r),
      });
      const nameTd = el("td");
      nameTd.appendChild(document.createTextNode(r.product || "—"));
      const attn = releaseAttentionBadge(r);
      if (attn) {
        nameTd.appendChild(document.createTextNode(" "));
        nameTd.appendChild(attn);
      }
      tr.appendChild(nameTd);
      tr.appendChild(el("td", { text: r.version || "—" }));
      tr.appendChild(el("td", { text: r.platform || "—" }));
      tr.appendChild(el("td", null, [releaseStatusBadge(r.status)]));
      tr.appendChild(el("td", { text: ymd(r.releasedAt) || ymd(r.submittedAt) || "—" }));
      tr.appendChild(el("td", { text: r.notes || "—" }));
      const actions = el("td", { className: "hq-actions-cell" });
      actions.appendChild(
        btn("수정", {
          className: "hq-btn hq-btn--small",
          onClick: (e) => {
            e.stopPropagation();
            openReleaseForm(r);
          },
        })
      );
      actions.appendChild(
        btn("삭제", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: (e) => {
            e.stopPropagation();
            confirmDelete("이 릴리스를 삭제할까요?", async () => {
              try {
                await deleteDoc(doc(ctx.db, COL.releases, r.id));
                toast("삭제됨", "ok");
                await refreshAndRender();
              } catch {
                toast("삭제 실패", "err");
              }
            });
          },
        })
      );
      tr.appendChild(actions);
      return tr;
    });
  }

  if (upcoming.length) {
    root.appendChild(
      el("h3", {
        className: "hq-surface-panel__title",
        text: "예정 · 진행",
        style: "margin:0 0 0.65rem",
      })
    );
    root.appendChild(
      table(
        ["제품", "버전", "플랫폼", "상태", "일정", "메모", ""],
        releaseRows(upcoming),
        "예정·진행 중인 릴리스가 없습니다."
      )
    );
    const cardsU = el("div", { className: "hq-card-list is-mobile-only" });
    for (const r of upcoming) {
      const cardEl = el("article", {
        className: "hq-item-card",
        style: "cursor:pointer",
        onClick: () => openReleaseForm(r),
      });
      const top = el("div", { className: "hq-item-card__top" });
      top.appendChild(
        el("p", {
          className: "hq-item-card__title",
          text: `${r.product || "—"} ${r.version || ""}`.trim(),
        })
      );
      top.appendChild(releaseStatusBadge(r.status));
      cardEl.appendChild(top);
      const metaRow = el("div", { className: "hq-item-card__meta-row" });
      metaRow.appendChild(
        el("p", {
          className: "hq-item-card__meta",
          text: `${r.platform || "—"} · ${ymd(r.releasedAt) || ymd(r.submittedAt) || "일정 없음"}`,
        })
      );
      const attn = releaseAttentionBadge(r);
      if (attn) metaRow.appendChild(attn);
      cardEl.appendChild(metaRow);
      cardsU.appendChild(cardEl);
    }
    root.appendChild(cardsU);
  }

  if (released.length) {
    if (upcoming.length) root.appendChild(el("div", { style: "height:1rem" }));
    root.appendChild(
      el("h3", {
        className: "hq-surface-panel__title",
        text: "출시 완료",
        style: "margin:0 0 0.65rem",
      })
    );
    root.appendChild(
      table(
        ["제품", "버전", "플랫폼", "상태", "일정", "메모", ""],
        releaseRows(released),
        "출시 완료 기록이 없습니다."
      )
    );
    const cardsR = el("div", { className: "hq-card-list is-mobile-only" });
    for (const r of released) {
      const cardEl = el("article", {
        className: "hq-item-card",
        style: "cursor:pointer",
        onClick: () => openReleaseForm(r),
      });
      const top = el("div", { className: "hq-item-card__top" });
      top.appendChild(
        el("p", {
          className: "hq-item-card__title",
          text: `${r.product || "—"} ${r.version || ""}`.trim(),
        })
      );
      top.appendChild(releaseStatusBadge(r.status));
      cardEl.appendChild(top);
      cardEl.appendChild(
        el("p", {
          className: "hq-item-card__meta",
          text: `${r.platform || "—"} · ${ymd(r.releasedAt) || ymd(r.submittedAt) || "—"}`,
        })
      );
      cardsR.appendChild(cardEl);
    }
    root.appendChild(cardsR);
  }
}

function filteredLeads() {
  const f = filters.leads;
  const q = String(f.q || "")
    .trim()
    .toLowerCase();
  return cache.leads.filter((l) => {
    if (f.archived === "active" && l.archived) return false;
    if (f.archived === "archived" && !l.archived) return false;
    if (f.status && l.status !== f.status) return false;
    if (f.source && l.source !== f.source) return false;
    if (f.ui) {
      const ui = inquiryUiStatus(l.status);
      if (ui.key !== f.ui) return false;
    }
    if (q) {
      const hay = [
        l.name,
        l.company,
        l.email,
        l.phone,
        l.message,
        l.notes,
        l.service,
        l.project,
        leadInquiryType(l),
        leadServiceLabel(l),
        LEAD_SOURCE_LABEL[l.source] || l.source,
        LEAD_STATUS_LABEL[l.status] || l.status,
      ]
        .map((x) => String(x || "").toLowerCase())
        .join(" ");
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function openLeadDetail(item) {
  if (!item) return;
  const ui = inquiryUiStatus(item.status);
  const meta = item.metadata || {};
  const body = el("div", { className: "hq-inquiry-detail" }, [
    el("div", { className: "hq-inquiry-detail__hero" }, [
      el("div", null, [
        el("p", { className: "hq-inquiry-detail__name", text: item.name || "—" }),
        el("p", {
          className: "hq-inquiry-detail__sub",
          text: `${leadReceivedLabel(item)} · ${LEAD_SOURCE_LABEL[item.source] || item.source || "—"}`,
        }),
      ]),
      inquiryStatusBadge(item.status),
    ]),
    el("section", { className: "hq-inquiry-detail__section" }, [
      el("h3", { className: "hq-inquiry-detail__h", text: "고객 정보" }),
      el("div", { className: "hq-inquiry-detail__grid" }, [
        detailField("고객명", item.name || "—"),
        detailField("회사", item.company || "—"),
        detailField("이메일", item.email || "—"),
        detailField("전화", item.phone || "—"),
      ]),
    ]),
    el("section", { className: "hq-inquiry-detail__section" }, [
      el("h3", { className: "hq-inquiry-detail__h", text: "문의 정보" }),
      el("div", { className: "hq-inquiry-detail__grid" }, [
        detailField("문의 유형", leadInquiryType(item)),
        detailField("프로젝트 / 서비스", leadServiceLabel(item)),
        detailField("상태", ui.label),
        detailField(
          "예상 금액",
          item.amountEstimate != null ? formatKrw(item.amountEstimate) : "—"
        ),
        detailField("출처", LEAD_SOURCE_LABEL[item.source] || item.source || "—"),
        detailField("로케일", item.locale || meta.locale || "—"),
      ]),
    ]),
    el("section", { className: "hq-inquiry-detail__section" }, [
      el("h3", { className: "hq-inquiry-detail__h", text: "문의 내용" }),
      el("div", {
        className: "hq-inquiry-detail__message",
        text: String(item.message || "").trim() || "내용이 없습니다.",
      }),
    ]),
    item.notes
      ? el("section", { className: "hq-inquiry-detail__section" }, [
          el("h3", { className: "hq-inquiry-detail__h", text: "내부 메모" }),
          el("div", {
            className: "hq-inquiry-detail__message hq-inquiry-detail__message--notes",
            text: String(item.notes),
          }),
        ])
      : null,
  ].filter(Boolean));

  const actions = [
    btn("닫기", {
      className: "hq-btn hq-btn--ghost",
      onClick: () => closeModal(),
    }),
    btn("상태 수정", {
      onClick: () => {
        closeModal();
        openLeadForm(item);
      },
    }),
  ];
  if (!item.archived) {
    actions.splice(
      1,
      0,
      btn("보관", {
        className: "hq-btn hq-btn--ghost",
        onClick: withSaving(async () => {
          try {
            await updateDoc(doc(ctx.db, COL.leads, item.id), {
              archived: true,
              updatedAt: serverTimestamp(),
              updatedBy: uid(),
            });
            closeModal();
            toast("보관됨", "ok");
            await refreshAndRender();
          } catch {
            toast("보관 실패", "err");
          }
        }),
      })
    );
  }
  openModal("문의 상세", body, actions, { wide: true });
}

function openLeadForm(item, opts) {
  opts = opts || {};
  const isEdit = !!item;
  const prefClient =
    (item && item.clientId) || opts.clientId || "";
  const prefCompany =
    (item && item.companyId) || opts.companyId || "";
  const nameIn = input({
    value: (item && item.name) || opts.name || "",
    required: true,
  });
  const companyIn = input({
    value: (item && item.company) || opts.company || "",
  });
  const emailIn = input({
    type: "email",
    value: (item && item.email) || opts.email || "",
  });
  const phoneIn = input({
    value: (item && item.phone) || opts.phone || "",
  });
  const sourceIn = select(
    {},
    LEAD_SOURCE.map((v) => ({ value: v, label: LEAD_SOURCE_LABEL[v] || v })),
    (item && item.source) || "Other"
  );
  const statusIn = select({}, leadStatusOptions(), (item && item.status) || "new");
  const amountIn = input({
    type: "number",
    min: "0",
    step: "1",
    value: item && item.amountEstimate != null ? String(item.amountEstimate) : "0",
  });
  const messageIn = textarea({});
  messageIn.value = (item && item.message) || "";
  const notesIn = textarea({});
  notesIn.value = (item && item.notes) || "";
  const serviceIn = input({
    value: (item && item.service) || (item && item.project) || "",
    placeholder: "서비스 / 프로젝트",
  });
  const clientIn = ensureCrmMod().clientOptions(prefClient);
  const companyIdIn = ensureCrmMod().companyOptions(prefCompany);
  clientIn.addEventListener("change", () => {
    const c = ensureCrmMod().clientById(clientIn.value);
    if (!c) return;
    ensureCrmMod().fillFromClient(c, {
      name: nameIn,
      email: emailIn,
      phone: phoneIn,
      company: companyIn,
      companyId: companyIdIn,
    });
  });
  const stageLabel =
    (LEAD_OPS_PIPELINE.find((x) => x.key === leadOpsBucket(item && item.status)) || {}).label ||
    (item && item.status) ||
    "—";
  const meta = (item && item.metadata) || {};
  const provenanceBits = [
    item && item.createdBy === "system" ? "ingest:system" : null,
    item && item.ingestVersion ? "v" + item.ingestVersion : null,
    (item && item.inquiryType) || meta.inquiryType || null,
    (item && item.page) || meta.page || null,
    (item && item.locale) || meta.locale || null,
  ].filter(Boolean);
  const form = el("form", { className: "hq-form" }, [
    item
      ? el("p", {
          className: "hq-stat__caption",
          text: `Received ${ymd(item.createdAt) || "—"} · Contact ${maskEmail(item.email)} · Stage ${stageLabel}${
            provenanceBits.length ? " · " + provenanceBits.join(" · ") : ""
          }`,
        })
      : null,
    fieldRow("CRM Client", clientIn),
    fieldRow("CRM Company", companyIdIn),
    fieldRow("이름 *", nameIn),
    fieldRow("회사", companyIn),
    fieldRow("이메일 (detail only)", emailIn),
    fieldRow("전화", phoneIn),
    fieldRow("출처 / 문의 유형", sourceIn),
    fieldRow("프로젝트 / 서비스", serviceIn),
    fieldRow("상태", statusIn),
    fieldRow("예상 금액", amountIn),
    fieldRow("메시지", messageIn),
    fieldRow("내부 메모", notesIn),
  ].filter(Boolean));
  const saveBtn = btn("저장", { type: "submit", dataset: { hqSave: "1" } });
  const cancelBtn = btn("취소", {
    className: "hq-btn hq-btn--ghost",
    onClick: (e) => {
      e.preventDefault();
      closeModal();
    },
  });
  form.addEventListener(
    "submit",
    withSaving(async (e) => {
      e.preventDefault();
      const name = nameIn.value.trim();
      if (!name) {
        toast("이름은 필수입니다", "err");
        return;
      }
      const email = emailIn.value.trim();
      if (!isEmail(email)) {
        toast("이메일 형식이 올바르지 않습니다", "err");
        return;
      }
      if (!LEAD_SOURCE.includes(sourceIn.value) || !LEAD_STATUS.includes(statusIn.value)) {
        toast("유효하지 않은 값", "err");
        return;
      }
      const amountEstimate = Number(amountIn.value);
      if (!Number.isFinite(amountEstimate) || amountEstimate < 0) {
        toast("예상 금액은 0 이상이어야 합니다", "err");
        return;
      }
      const payload = {
        name,
        company: companyIn.value.trim(),
        email,
        phone: phoneIn.value.trim(),
        source: sourceIn.value,
        status: statusIn.value,
        service: serviceIn.value.trim(),
        amountEstimate,
        message: messageIn.value.trim(),
        notes: notesIn.value.trim(),
        clientId: clientIn.value || null,
        companyId: companyIdIn.value || null,
        archived: !!(item && item.archived),
        updatedAt: serverTimestamp(),
        updatedBy: uid(),
      };
      try {
        if (isEdit) {
          await updateDoc(doc(ctx.db, COL.leads, item.id), payload);
        } else {
          await addDoc(collection(ctx.db, COL.leads), {
            ...payload,
            archived: false,
            createdAt: serverTimestamp(),
            createdBy: uid(),
          });
        }
        closeModal();
        toast("저장됨", "ok");
        await refreshAndRender();
      } catch {
        toast("저장 실패", "err");
      }
    })
  );
  openModal(isEdit ? "리드 수정" : "리드 추가", form, [cancelBtn, saveBtn]);
}

function exportLeadsCsv() {
  const rows = filteredLeads().map((l) => [
    l.name,
    l.company,
    l.email,
    l.phone,
    l.source,
    l.status,
    l.amountEstimate,
    l.notes,
    l.archived ? "1" : "0",
  ]);
  downloadCsv(
    "hq-leads.csv",
    [
      "name",
      "company",
      "email",
      "phone",
      "source",
      "status",
      "amountEstimate",
      "notes",
      "archived",
    ],
    rows
  );
}

function renderLeads(root) {
  clear(root);
  const summary = inquiryDashboardCounts(cache.leads);
  const hasAnyLeads = cache.leads.some((l) => !l.archived) || cache.leads.length > 0;

  root.appendChild(
    pageHeader("leads", [
      btn("CSV", { className: "hq-btn hq-btn--ghost", onClick: exportLeadsCsv }),
      btn("+ 문의 등록", { onClick: () => openLeadForm(null) }),
    ])
  );

  const banner = dataStateBanner();
  if (banner) root.appendChild(banner);

  root.appendChild(
    el("div", { className: "hq-summary-strip hq-summary-strip--inquiry" }, [
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "전체 문의" }),
        el("p", { className: "hq-summary-pill__value", text: String(summary.total) }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "신규" }),
        el("p", { className: "hq-summary-pill__value", text: String(summary.neu) }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "진행 중" }),
        el("p", { className: "hq-summary-pill__value", text: String(summary.progress) }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "완료" }),
        el("p", { className: "hq-summary-pill__value", text: String(summary.done) }),
      ]),
    ])
  );

  const searchIn = input({
    type: "search",
    className: "hq-input hq-input--search",
    placeholder: "이름, 회사, 내용, 서비스 검색…",
    value: filters.leads.q || "",
    "aria-label": "문의 검색",
  });
  searchIn.addEventListener("input", () => {
    filters.leads.q = searchIn.value;
    const caret = searchIn.selectionStart;
    renderLeads(root);
    const again = root.querySelector('input[type="search"]');
    if (again) {
      again.focus();
      try {
        const pos = typeof caret === "number" ? caret : again.value.length;
        again.setSelectionRange(pos, pos);
      } catch {
        /* ignore */
      }
    }
  });

  const uiF = select(
    {
      onChange: (e) => {
        filters.leads.ui = e.target.value;
        filters.leads.status = "";
        renderLeads(root);
      },
    },
    [
      { value: "", label: "상태 전체" },
      { value: "new", label: "신규" },
      { value: "reviewing", label: "확인" },
      { value: "replied", label: "진행" },
      { value: "won", label: "완료" },
      { value: "lost", label: "실패" },
      { value: "spam", label: "스팸" },
    ],
    filters.leads.ui
  );
  const sourceF = select(
    {
      onChange: (e) => {
        filters.leads.source = e.target.value;
        renderLeads(root);
      },
    },
    [{ value: "", label: "문의 유형 / 출처" }].concat(
      LEAD_SOURCE.map((v) => ({ value: v, label: LEAD_SOURCE_LABEL[v] || v }))
    ),
    filters.leads.source
  );
  const archF = select(
    {
      onChange: (e) => {
        filters.leads.archived = e.target.value;
        renderLeads(root);
      },
    },
    [
      { value: "active", label: "활성" },
      { value: "archived", label: "보관" },
      { value: "all", label: "전체" },
    ],
    filters.leads.archived
  );
  root.appendChild(toolbar([searchIn, uiF, sourceF, archF]));

  if (dataState.status === "loading" && !hasAnyLeads) {
    root.appendChild(
      el("div", { className: "hq-banner hq-banner--loading", role: "status" }, [
        el("p", { text: "문의 데이터를 불러오는 중…" }),
      ])
    );
    return;
  }

  if (dataState.status === "error" && !hasAnyLeads) {
    root.appendChild(
      emptyState(
        "문의를 불러오지 못했습니다",
        dataState.message || "Firestore 연결을 확인한 뒤 다시 시도해주세요.",
        null
      )
    );
    return;
  }

  const list = filteredLeads();
  const activeTotal = cache.leads.filter((l) => !l.archived).length;
  if (!list.length && activeTotal === 0 && filters.leads.archived === "active" && !filters.leads.q && !filters.leads.ui && !filters.leads.source) {
    root.appendChild(
      emptyState(
        "아직 접수된 문의가 없습니다",
        "공개 사이트나 FormSubmit으로 문의가 들어오면 이곳에서 확인하고 상태를 관리할 수 있습니다.",
        btn("+ 문의 등록", { onClick: () => openLeadForm(null) })
      )
    );
    return;
  }

  if (!list.length) {
    root.appendChild(
      emptyState(
        "검색 결과가 없습니다",
        "필터나 검색어를 바꿔 다시 확인해보세요.",
        null
      )
    );
    return;
  }

  const rows = list.map((l) => {
    const tr = el("tr", {
      className: "hq-table__row--clickable",
      style: "cursor:pointer",
      onClick: () => openLeadDetail(l),
    });
    tr.appendChild(el("td", { text: leadReceivedLabel(l) }));
    tr.appendChild(el("td", { text: l.name || "—" }));
    tr.appendChild(el("td", { text: leadInquiryType(l) }));
    tr.appendChild(el("td", { text: leadServiceLabel(l) }));
    tr.appendChild(el("td", null, [inquiryStatusBadge(l.status)]));
    const actions = el("td", {
      className: "hq-actions-cell",
      onClick: (e) => e.stopPropagation(),
    });
    actions.appendChild(
      btn("상세", {
        className: "hq-btn hq-btn--small",
        onClick: () => openLeadDetail(l),
      })
    );
    actions.appendChild(
      btn("수정", {
        className: "hq-btn hq-btn--small hq-btn--ghost",
        onClick: () => openLeadForm(l),
      })
    );
    if (!l.archived) {
      if (!l.clientId) {
        actions.appendChild(
          btn("고객 연결", {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: () => ensureCrmMod().openLinkClientModal(l),
          })
        );
      }
      actions.appendChild(
        btn("보관", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: withSaving(async () => {
            try {
              await updateDoc(doc(ctx.db, COL.leads, l.id), {
                archived: true,
                updatedAt: serverTimestamp(),
                updatedBy: uid(),
              });
              toast("보관됨", "ok");
              await refreshAndRender();
            } catch {
              toast("보관 실패", "err");
            }
          }),
        })
      );
    }
    tr.appendChild(actions);
    return tr;
  });
  root.appendChild(
    table(
      ["접수일", "고객명", "문의 유형", "프로젝트/서비스", "상태", ""],
      rows,
      "조건에 맞는 문의가 없습니다."
    )
  );

  const cards = el("div", { className: "hq-card-list is-mobile-only" });
  for (const l of list) {
    const cardEl = el("article", {
      className: "hq-item-card",
      style: "cursor:pointer",
      onClick: () => openLeadDetail(l),
    });
    const top = el("div", { className: "hq-item-card__top" });
    top.appendChild(el("p", { className: "hq-item-card__title", text: l.name || "—" }));
    top.appendChild(inquiryStatusBadge(l.status));
    cardEl.appendChild(top);
    cardEl.appendChild(
      el("p", {
        className: "hq-item-card__meta",
        text: `${leadReceivedLabel(l)} · ${leadInquiryType(l)} · ${leadServiceLabel(l)}`,
      })
    );
    const acts = el("div", {
      className: "hq-item-card__actions",
      onClick: (e) => e.stopPropagation(),
    });
    acts.appendChild(
      btn("상세", { className: "hq-btn hq-btn--small", onClick: () => openLeadDetail(l) })
    );
    acts.appendChild(
      btn("수정", {
        className: "hq-btn hq-btn--small hq-btn--ghost",
        onClick: () => openLeadForm(l),
      })
    );
    cardEl.appendChild(acts);
    cards.appendChild(cardEl);
  }
  root.appendChild(cards);
}

function filteredFinance() {
  const f = filters.finance;
  if (!f.month) f.month = monthKey(new Date());
  const list = cache.finance.filter((row) => {
    if (f.archived === "active" && row.archived) return false;
    if (f.archived === "archived" && !row.archived) return false;
    if (f.type && row.type !== f.type) return false;
    if (f.month && monthKey(row.date) !== f.month) return false;
    return true;
  });
  return list.slice().sort((a, b) => {
    const da = ymd(a.date) || "";
    const db = ymd(b.date) || "";
    if (da !== db) return db.localeCompare(da);
    const ta = a.type === "income" ? 0 : 1;
    const tb = b.type === "income" ? 0 : 1;
    if (ta !== tb) return ta - tb;
    return (Number(b.amount) || 0) - (Number(a.amount) || 0);
  });
}

function financeTotals(list) {
  let income = 0;
  let expense = 0;
  for (const f of list) {
    const amt = Number(f.amount) || 0;
    if (f.type === "income") income += amt;
    else if (f.type === "expense") expense += amt;
  }
  return { income, expense, net: income - expense };
}

function openFinanceForm(item, opts) {
  opts = opts || {};
  const isEdit = !!item;
  const prefProject = (item && item.projectId) || opts.projectId || "";
  const typeIn = select(
    {},
    FINANCE_TYPE.map((t) => ({ value: t, label: FINANCE_TYPE_LABEL[t] || t })),
    (item && item.type) || opts.type || "expense"
  );
  const catIn = input({
    value: (item && item.category) || opts.category || "",
    required: true,
  });
  const amountIn = input({
    type: "number",
    min: "1",
    step: "1",
    value:
      item && item.amount != null
        ? String(item.amount)
        : opts.amount != null
          ? String(opts.amount)
          : "",
    required: true,
  });
  const dateIn = input({
    type: "date",
    value: ymd(item && item.date) || todayYmd(),
    required: true,
  });
  const memoIn = textarea({});
  memoIn.value = (item && item.memo) || opts.memo || "";
  const projectIn = projectOptions(prefProject);
  const labelIn = input({
    value: (item && item.relatedProject) || opts.relatedProject || "",
  });
  const invoiceIdPref = (item && item.invoiceId) || opts.invoiceId || null;
  const crmClientIn = ensureCrmMod().clientOptions(
    (item && item.clientId) || opts.clientId || ""
  );
  const crmCompanyIn = ensureCrmMod().companyOptions(
    (item && item.companyId) || opts.companyId || ""
  );
  const form = el("form", { className: "hq-form" }, [
    fieldRow("유형", typeIn),
    fieldRow("카테고리 *", catIn),
    fieldRow("금액 *", amountIn),
    fieldRow("날짜 *", dateIn),
    fieldRow("프로젝트", projectIn),
    fieldRow("CRM 고객", crmClientIn),
    fieldRow("CRM 회사", crmCompanyIn),
    fieldRow("관련 라벨", labelIn),
    fieldRow("메모", memoIn),
  ]);
  const saveBtn = btn("저장", { type: "submit", dataset: { hqSave: "1" } });
  const cancelBtn = btn("취소", {
    className: "hq-btn hq-btn--ghost",
    onClick: (e) => {
      e.preventDefault();
      closeModal();
    },
  });
  form.addEventListener(
    "submit",
    withSaving(async (e) => {
      e.preventDefault();
      const category = catIn.value.trim();
      const amount = Number(amountIn.value);
      const date = dateIn.value;
      if (!category || !date) {
        toast("카테고리·날짜는 필수입니다", "err");
        return;
      }
      if (!FINANCE_TYPE.includes(typeIn.value)) {
        toast("유효하지 않은 유형", "err");
        return;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        toast("금액은 0보다 커야 합니다", "err");
        return;
      }
      const projectId = projectIn.value || null;
      let relatedProject = labelIn.value.trim();
      if (!relatedProject && projectId) {
        const p = projectById(projectId);
        relatedProject = (p && p.name) || "";
      }
      let clientId = crmClientIn.value || null;
      let companyId = crmCompanyIn.value || null;
      if (projectId && (!clientId || !companyId)) {
        const p = projectById(projectId);
        if (p) {
          if (!clientId) clientId = p.clientId || null;
          if (!companyId) companyId = p.companyId || null;
        }
      }
      const payload = {
        type: typeIn.value,
        category,
        amount,
        date,
        memo: memoIn.value.trim(),
        relatedProject,
        projectId,
        clientId,
        companyId,
        archived: !!(item && item.archived),
        updatedAt: serverTimestamp(),
        updatedBy: uid(),
      };
      if (invoiceIdPref) payload.invoiceId = invoiceIdPref;
      try {
        if (isEdit) {
          await updateDoc(doc(ctx.db, COL.finance, item.id), payload);
        } else {
          await addDoc(collection(ctx.db, COL.finance), {
            ...payload,
            archived: false,
            createdAt: serverTimestamp(),
            createdBy: uid(),
          });
        }
        closeModal();
        toast("저장됨", "ok");
        await refreshAndRender();
      } catch {
        toast("저장 실패", "err");
      }
    })
  );
  openModal(isEdit ? "재무 수정" : "재무 추가", form, [cancelBtn, saveBtn]);
}

function exportFinanceCsv() {
  const rows = filteredFinance().map((f) => [
    f.type,
    f.category,
    f.amount,
    ymd(f.date),
    f.memo,
    f.relatedProject,
    f.archived ? "1" : "0",
  ]);
  downloadCsv(
    "hq-finance.csv",
    ["type", "category", "amount", "date", "memo", "relatedProject", "archived"],
    rows
  );
}

function renderFinance(root) {
  clear(root);
  if (!filters.finance.month) filters.finance.month = monthKey(new Date());
  const month = filters.finance.month;
  const loadingEmpty =
    dataState.status === "loading" && !cache.finance.length;
  const monthRows = cache.finance.filter(
    (f) => !f.archived && monthKey(f.date) === month
  );
  const monthTotals = financeTotals(monthRows);
  const allActive = cache.finance.filter((f) => !f.archived);
  const allTime = financeTotals(allActive);
  const money = (n) => (loadingEmpty ? "—" : formatKrw(n));

  root.appendChild(
    pageHeader("finance", [
      el("span", {
        className: "hq-page-header__count",
        text: loadingEmpty ? "로딩 중…" : month,
      }),
      btn("CSV", { className: "hq-btn hq-btn--ghost", onClick: exportFinanceCsv }),
      btn("+ 기록", { onClick: () => openFinanceForm(null) }),
    ])
  );
  const banner = dataStateBanner();
  if (banner) root.appendChild(banner);

  root.appendChild(
    el("div", { className: "hq-stat-grid hq-stat-grid--compact" }, [
      opsKpiCard("이번 달 수입", money(monthTotals.income), month, "hq_finance"),
      opsKpiCard("이번 달 지출", money(monthTotals.expense), month, "hq_finance"),
      opsKpiCard("이번 달 손익", money(monthTotals.net), "수입 − 지출", "hq_finance"),
      opsKpiCard("누적 손익", money(allTime.net), "보관 제외", "hq_finance"),
    ])
  );
  root.appendChild(
    el("p", {
      className: "hq-stat__caption",
      style: "margin:0.35rem 0 0.85rem",
      text: "현재 스키마는 수입/지출 장부만 지원합니다. 미수·세금계산서는 Documents/인보이스 연동 TODO.",
    })
  );

  if (!loadingEmpty) {
    const max = Math.max(monthTotals.income, monthTotals.expense, 1);
    const wrap = el("div", { className: "hq-card hq-stat", style: "margin-bottom:0.85rem" });
    wrap.appendChild(el("p", { className: "hq-card__label", text: "이번 달 구성" }));
    const bars = el("div", { className: "hq-bar-pair", style: "padding:0.55rem 0 0" });
    const inc = el("div", { className: "hq-bar-pair__fill--income" });
    inc.style.width = Math.round((monthTotals.income / max) * 100) + "%";
    const exp = el("div", { className: "hq-bar-pair__fill--expense" });
    exp.style.width = Math.round((monthTotals.expense / max) * 100) + "%";
    bars.appendChild(
      el("div", { className: "hq-bar-pair__item" }, [
        el("div", { className: "hq-bar-pair__top" }, [
          el("span", { text: "수입" }),
          el("span", { className: "hq-bar-pair__val", text: formatKrw(monthTotals.income) }),
        ]),
        el("div", { className: "hq-bar-pair__track" }, [inc]),
      ])
    );
    bars.appendChild(
      el("div", { className: "hq-bar-pair__item" }, [
        el("div", { className: "hq-bar-pair__top" }, [
          el("span", { text: "지출" }),
          el("span", { className: "hq-bar-pair__val", text: formatKrw(monthTotals.expense) }),
        ]),
        el("div", { className: "hq-bar-pair__track" }, [exp]),
      ])
    );
    wrap.appendChild(bars);
    root.appendChild(wrap);
  }

  const monthIn = input({
    type: "month",
    value: filters.finance.month,
    "aria-label": "재무 월 선택",
    onChange: (e) => {
      filters.finance.month = e.target.value;
      renderFinance(root);
    },
  });
  const typeF = select(
    {
      onChange: (e) => {
        filters.finance.type = e.target.value;
        renderFinance(root);
      },
    },
    [{ value: "", label: "유형 전체" }].concat(
      FINANCE_TYPE.map((t) => ({ value: t, label: FINANCE_TYPE_LABEL[t] || t }))
    ),
    filters.finance.type
  );
  const archF = select(
    {
      onChange: (e) => {
        filters.finance.archived = e.target.value;
        renderFinance(root);
      },
    },
    [
      { value: "active", label: "운영 목록" },
      { value: "archived", label: "보관" },
      { value: "all", label: "전체 포함" },
    ],
    filters.finance.archived
  );
  root.appendChild(toolbar([monthIn, typeF, archF]));

  if (loadingEmpty) {
    root.appendChild(
      emptyState("재무 로딩 중", "Firestore에서 수입·지출 기록을 불러오는 중입니다.", null)
    );
    return;
  }

  const list = filteredFinance();
  if (!list.length) {
    const hasMonthData = monthRows.length > 0;
    const hasAny = allActive.length > 0;
    root.appendChild(
      emptyState(
        hasAny || hasMonthData
          ? "조건에 맞는 기록이 없습니다"
          : "이달 재무 기록이 없습니다",
        hasAny || hasMonthData
          ? "월·유형·보관 필터를 바꿔 보세요."
          : "수입 또는 지출을 추가하면 캐시플로를 추적할 수 있습니다. 샘플 금액은 표시하지 않습니다.",
        btn("+ 기록", { onClick: () => openFinanceForm(null) })
      )
    );
    return;
  }

  const rows = list.map((f) => {
    const tr = el("tr", {
      className: "hq-table__row--clickable",
      style: "cursor:pointer",
      onClick: () => openFinanceForm(f),
    });
    tr.appendChild(el("td", { text: ymd(f.date) || "—" }));
    tr.appendChild(el("td", { text: f.category || "—" }));
    tr.appendChild(el("td", { text: f.memo || f.relatedProject || "—" }));
    const amt =
      f.type === "expense"
        ? el("td", {
            className: "hq-amount--expense",
            text: "−" + formatKrw(f.amount),
          })
        : el("td", {
            className: "hq-amount--income",
            text: "+" + formatKrw(f.amount),
          });
    tr.appendChild(amt);
    tr.appendChild(el("td", null, [financeTypeBadge(f.type)]));
    const actions = el("td", { className: "hq-actions-cell" });
    actions.appendChild(
      btn("수정", {
        className: "hq-btn hq-btn--small",
        onClick: (e) => {
          e.stopPropagation();
          openFinanceForm(f);
        },
      })
    );
    if (!f.archived) {
      actions.appendChild(
        btn("보관", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: (e) => {
            e.stopPropagation();
            withSaving(async () => {
              try {
                await updateDoc(doc(ctx.db, COL.finance, f.id), {
                  archived: true,
                  updatedAt: serverTimestamp(),
                  updatedBy: uid(),
                });
                toast("보관됨", "ok");
                await refreshAndRender();
              } catch {
                toast("보관 실패", "err");
              }
            })();
          },
        })
      );
    }
    tr.appendChild(actions);
    return tr;
  });
  root.appendChild(
    table(["날짜", "카테고리", "설명", "금액", "유형", ""], rows, "조건에 맞는 기록이 없습니다.")
  );

  const cards = el("div", { className: "hq-card-list is-mobile-only" });
  for (const f of list) {
    const cardEl = el("article", {
      className: "hq-item-card",
      style: "cursor:pointer",
      onClick: () => openFinanceForm(f),
    });
    const top = el("div", { className: "hq-item-card__top" });
    top.appendChild(el("p", { className: "hq-item-card__title", text: f.category || "—" }));
    top.appendChild(
      el("span", {
        className: f.type === "expense" ? "hq-amount--expense" : "hq-amount--income",
        text: (f.type === "expense" ? "−" : "+") + formatKrw(f.amount),
      })
    );
    cardEl.appendChild(top);
    const metaRow = el("div", { className: "hq-item-card__meta-row" });
    metaRow.appendChild(
      el("p", {
        className: "hq-item-card__meta",
        text: `${ymd(f.date) || "—"} · ${f.memo || f.relatedProject || "—"}`,
      })
    );
    metaRow.appendChild(financeTypeBadge(f.type));
    cardEl.appendChild(metaRow);
    cards.appendChild(cardEl);
  }
  root.appendChild(cards);
}

function metaForSlug(slug) {
  return (
    cache.productsMeta.find((m) => m.id === slug || m.productSlug === slug) ||
    null
  );
}

function openProductMetaForm(product) {
  const meta = metaForSlug(product.slug);
  const verIn = input({ value: (meta && meta.currentVersion) || "" });
  const opsDefault =
    (meta && meta.opsStatus) ||
    (OPS_STATUS.includes(product.status) ? product.status : "active");
  const opsIn = select({}, OPS_STATUS, opsDefault);
  const notesIn = textarea({});
  notesIn.value = (meta && meta.notes) || "";
  const form = el("form", { className: "hq-form" }, [
    fieldRow("제품", el("p", { text: product.name || product.slug })),
    fieldRow("현재 버전", verIn),
    fieldRow("운영 상태", opsIn),
    fieldRow("메모", notesIn),
  ]);
  const saveBtn = btn("저장", { type: "submit", dataset: { hqSave: "1" } });
  const cancelBtn = btn("취소", {
    className: "hq-btn hq-btn--ghost",
    onClick: (e) => {
      e.preventDefault();
      closeModal();
    },
  });
  form.addEventListener(
    "submit",
    withSaving(async (e) => {
      e.preventDefault();
      if (!OPS_STATUS.includes(opsIn.value)) {
        toast("유효하지 않은 상태", "err");
        return;
      }
      const payload = {
        productSlug: product.slug,
        currentVersion: verIn.value.trim(),
        opsStatus: opsIn.value,
        notes: notesIn.value.trim(),
        updatedAt: serverTimestamp(),
        updatedBy: uid(),
      };
      try {
        if (meta && meta.id) {
          await updateDoc(doc(ctx.db, COL.productsMeta, meta.id), payload);
        } else {
          await setDoc(doc(ctx.db, COL.productsMeta, product.slug), {
            ...payload,
            createdAt: serverTimestamp(),
            createdBy: uid(),
          });
        }
        closeModal();
        toast("저장됨", "ok");
        await refreshAndRender();
      } catch {
        toast("저장 실패", "err");
      }
    })
  );
  openModal("제품 메타", form, [cancelBtn, saveBtn]);
}

function healthStatusForSlug(slug) {
  const report = ensureHealthMod().getReport && ensureHealthMod().getReport();
  if (!report || !Array.isArray(report.apps)) return null;
  const hit = report.apps.find(
    (a) =>
      a &&
      (a.id === slug ||
        a.slug === slug ||
        a.portfolioSlug === slug ||
        (a.name && String(a.name).toLowerCase().includes(String(slug || "").toLowerCase())))
  );
  return hit ? hit.status || null : null;
}

function renderProducts(root) {
  clear(root);
  root.appendChild(pageHeader("products", []));
  root.appendChild(
    el("p", {
      className: "hq-catalog-note",
      text: "Product Overview uses catalog.json + hq_products_meta + optional production-health.json. User / subscriber / revenue columns stay Not connected until store billing is wired.",
    })
  );
  if (!catalog.length) {
    root.appendChild(emptyState("Catalog unavailable", "catalog.json is missing or empty.", null));
    return;
  }
  const statusF = select(
    {
      onChange: (e) => {
        filters.products.status = e.target.value;
        renderProducts(root);
      },
    },
    [{ value: "", label: "Ops status" }].concat(OPS_STATUS),
    filters.products.status
  );
  root.appendChild(toolbar([statusF]));
  const list = catalog.filter((p) => {
    if (!filters.products.status) return true;
    const meta = metaForSlug(p.slug);
    return (meta && meta.opsStatus) === filters.products.status;
  });
  if (!list.length) {
    root.appendChild(emptyMsg("No products match this ops status."));
    return;
  }

  const rows = list.map((p) => {
    const meta = metaForSlug(p.slug);
    const platforms = Array.isArray(p.platforms)
      ? p.platforms.join(" / ")
      : p.platforms || "—";
    const health = healthStatusForSlug(p.slug || p.id);
    const tr = el("tr", {
      style: "cursor:pointer",
      onClick: () => openProductMetaForm(p),
    });
    tr.appendChild(el("td", { text: p.name || p.slug || "—" }));
    tr.appendChild(el("td", { text: platforms }));
    tr.appendChild(el("td", null, [statusBadge((meta && meta.opsStatus) || "unset")]));
    tr.appendChild(el("td", { text: "—" })); // users
    tr.appendChild(el("td", { text: "—" })); // subscribers
    tr.appendChild(el("td", { text: "—" })); // revenue
    tr.appendChild(el("td", { text: ymd(meta && meta.updatedAt) || "—" }));
    tr.appendChild(
      el("td", null, [
        health
          ? badge(String(health), healthStatusKind(health === "HEALTHY" ? "Healthy" : health === "AT_RISK" ? "Error" : "Warning"))
          : el("span", { className: "hq-kpi-source", text: "Not connected" }),
      ])
    );
    return tr;
  });

  root.appendChild(
    table(
      ["Product", "Platform", "Status", "Users", "Subscribers", "Revenue", "Updated", "Health"],
      rows,
      "No products"
    )
  );

  root.appendChild(el("div", { style: "height:0.85rem" }));
  const grid = el("div", { className: "hq-product-grid" });
  for (const p of list) {
    const meta = metaForSlug(p.slug);
    const platforms = Array.isArray(p.platforms)
      ? p.platforms.join(" / ")
      : p.platforms || "—";
    const cardBtn = el("button", {
      type: "button",
      className: "hq-product-card",
      onClick: () => openProductMetaForm(p),
    });
    cardBtn.appendChild(
      el("p", { className: "hq-product-card__name", text: p.name || p.slug || "—" })
    );
    cardBtn.appendChild(
      el("p", {
        className: "hq-product-card__meta",
        text: `${p.type || "—"} · ${platforms}`,
      })
    );
    const ops = el("div", { className: "hq-product-card__ops" });
    ops.appendChild(
      badge((meta && meta.currentVersion) || "No version", meta && meta.currentVersion ? "active" : "")
    );
    ops.appendChild(statusBadge((meta && meta.opsStatus) || "unset"));
    cardBtn.appendChild(ops);
    cardBtn.appendChild(
      el("p", {
        className: "hq-product-card__note",
        text: (meta && meta.notes) || "No ops notes",
      })
    );
    cardBtn.appendChild(
      el("p", {
        className: "hq-product-card__meta",
        text:
          "Users/Subs/Revenue: Not connected · Updated " +
          (ymd(meta && meta.updatedAt) || "—"),
      })
    );
    grid.appendChild(cardBtn);
  }
  root.appendChild(grid);
}

function renderAnalytics(root) {
  clear(root);
  root.appendChild(
    pageHeader("analytics", [
      el("span", {
        className: "hq-page-header__count",
        text: "Not connected",
      }),
    ])
  );

  const seg = el("div", { className: "hq-seg", role: "group", "aria-label": "Period" });
  for (const p of ANALYTICS_PERIODS) {
    seg.appendChild(
      el("button", {
        type: "button",
        className: "hq-seg__btn" + (analyticsPeriod === p.id ? " is-active" : ""),
        text: p.label,
        onClick: () => {
          analyticsPeriod = p.id;
          renderAnalytics(root);
        },
      })
    );
  }
  root.appendChild(toolbar([seg]));

  const period = ANALYTICS_PERIODS.find((p) => p.id === analyticsPeriod) || ANALYTICS_PERIODS[1];
  root.appendChild(
    emptyState(
      "No analytics series for " + period.label,
      "HQ does not store page views, sessions, CTA clicks, store clicks, or traffic sources. Public analytics.js pushes to dataLayer only — no Firestore analytics collection. Charts are omitted until a real connected source exists.",
      btn("Open Dashboard", {
        className: "hq-btn hq-btn--ghost",
        onClick: () => showPanel("dashboard"),
      })
    )
  );

  root.appendChild(el("div", { style: "height:0.85rem" }));
  root.appendChild(
    surfacePanel("Connected inquiry signal (hq_leads only)", [
      (() => {
        const days = period.days || 7;
        const since = Date.now() - days * 24 * 60 * 60 * 1000;
        const inq = inquiryCounts(cache.leads, since);
        return el("div", { className: "hq-stat-grid" }, [
          opsKpiCard("New leads in period", inq.newInPeriod, period.label, "Source: hq_leads"),
          opsKpiCard("Open inquiries", inq.open, "Now", "Source: hq_leads"),
          opsKpiCard("Total active leads", inq.total, "Not archived", "Source: hq_leads"),
          notConnectedKpi("Page views", "Website analytics not in HQ"),
          notConnectedKpi("Unique sessions", "Website analytics not in HQ"),
          notConnectedKpi("CTA / store clicks", "Event store not connected"),
        ]);
      })(),
    ])
  );
}

function renderSettings(root) {
  clear(root);
  root.appendChild(pageHeader("settings", []));
  const u = ctx && ctx.user;
  const projectId =
    (window.NEWON_HQ_FIREBASE &&
      window.NEWON_HQ_FIREBASE.config &&
      window.NEWON_HQ_FIREBASE.config.projectId) ||
    "—";

  function settingsCard(title, rows) {
    return el("section", { className: "hq-settings-card" }, [
      el("h2", { className: "hq-settings-card__title", text: title }),
      el(
        "dl",
        { className: "hq-dl" },
        rows.map(([k, v]) =>
          el("div", { className: "hq-dl__row" }, [
            el("dt", { className: "hq-dl__label", text: k }),
            el("dd", { className: "hq-dl__value", text: v }),
          ])
        )
      ),
    ]);
  }

  root.appendChild(
    el("div", { className: "hq-settings-grid" }, [
      settingsCard("Account", [
        ["Display name", (u && u.displayName) || "—"],
        ["Email", (u && u.email) || "—"],
        ["Role", "Administrator"],
      ]),
      settingsCard("Firebase", [
        ["Project", projectId],
        ["Authentication", "Connected"],
        ["Database", "Firestore"],
      ]),
      settingsCard("HQ", [
        ["Version", HQ_VERSION],
        ["Environment", "Production"],
      ]),
      settingsCard("Security", [
        ["Admin access", "UID allowlist"],
        ["Google Authentication", "Enabled"],
        ["Firestore Rules", "Admin-only"],
      ]),
    ])
  );

  const backupStatus = el("p", {
    className: "hq-session-box__desc",
    text: "Read-only export of HQ Firestore collections. Contains private business data — do not commit or share publicly.",
  });
  const backupBtn = btn("Export HQ backup", {
    className: "hq-btn",
    onClick: () => {
      openModal(
        "Export HQ backup",
        el("div", null, [
          el("p", {
            className: "hq-session-box__desc",
            text: "This backup may include clients, projects, documents, and finance records. It downloads only to this device. Restore remains a manual Console/admin procedure — this action does not write to Firestore.",
          }),
          el("p", {
            className: "hq-session-box__desc",
            text: "Collections: " + HQ_BACKUP_COLLECTIONS.join(", "),
          }),
        ]),
        [
          btn("Cancel", { className: "hq-btn hq-btn--ghost", onClick: () => closeModal() }),
          btn("Export JSON", {
            className: "hq-btn",
            "data-hq-save": "1",
            onClick: withSaving(async () => {
              if (!ctx || !ctx.db) {
                toast("HQ context missing", "err");
                return;
              }
              try {
                backupStatus.textContent = "Exporting (read-only)…";
                const result = await exportHqBackup({
                  db: ctx.db,
                  collectionFn: collection,
                  getDocsFn: getDocs,
                });
                validateBackupJson(result.json);
                downloadJsonFile(result.filename, result.json);
                const total = Object.values(result.collectionCounts).reduce((a, b) => a + b, 0);
                backupStatus.textContent =
                  "Downloaded " +
                  result.filename +
                  " · " +
                  total +
                  " docs · " +
                  Object.keys(result.collectionCounts).length +
                  " collections. Store privately.";
                toast("Backup downloaded", "ok");
                closeModal();
              } catch (e) {
                backupStatus.textContent = "Export failed.";
                toast("Backup export failed", "err");
              }
            }),
          }),
        ]
      );
    },
  });
  root.appendChild(
    el("div", { className: "hq-session-box" }, [
      el("p", { className: "hq-session-box__title", text: "Backup" }),
      backupStatus,
      backupBtn,
    ])
  );

  const signOut = btn("Sign out", {
    className: "hq-btn hq-btn--ghost",
    onClick: async () => {
      if (ctx && typeof ctx.signOutFn === "function") {
        try {
          await ctx.signOutFn();
        } catch {
          toast("Sign out failed", "err");
        }
      }
    },
  });
  root.appendChild(
    el("div", { className: "hq-session-box" }, [
      el("p", { className: "hq-session-box__title", text: "Session" }),
      el("p", {
        className: "hq-session-box__desc",
        text: "Sign out ends this HQ session on this browser.",
      }),
      signOut,
    ])
  );
}


/* ---------- Projects ---------- */
function filteredProjects() {
  const f = filters.projects;
  const q = (f.q || "").trim().toLowerCase();
  const list = cache.projects.filter((p) => {
    if (f.archived === "active" && p.archived) return false;
    if (f.archived === "archived" && !p.archived) return false;
    if (f.status === "active" && p.status !== "active") return false;
    else if (f.status === "review" && p.status !== "review") return false;
    else if (f.status === "completed" && p.status !== "completed") return false;
    else if (f.status === "on_hold" && p.status !== "on_hold") return false;
    else if (f.status && !["active", "review", "completed", "on_hold", ""].includes(f.status)) {
      if (p.status !== f.status) return false;
    }
    if (f.service && p.serviceType !== f.service) return false;
    if (f.priority && p.priority !== f.priority) return false;
    if (q) {
      const hay = `${p.name || ""} ${p.clientName || ""} ${p.company || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  return list.slice().sort(compareProjectsOps);
}

function openProjectForm(item, opts) {
  opts = opts || {};
  const lead = opts.lead || null;
  const isEdit = !!item;
  const nameIn = input({
    value:
      (item && item.name) ||
      (lead ? `${lead.company || lead.name || "Client"} Project` : ""),
    required: true,
  });
  const clientIn = input({
    value:
      (item && item.clientName) ||
      opts.clientName ||
      (lead && lead.name) ||
      "",
  });
  const companyIn = input({
    value:
      (item && item.company) ||
      opts.company ||
      (lead && lead.company) ||
      "",
  });
  const emailIn = input({
    type: "email",
    value:
      (item && item.clientEmail) ||
      opts.clientEmail ||
      (lead && lead.email) ||
      "",
  });
  const phoneIn = input({
    value:
      (item && item.clientPhone) ||
      opts.clientPhone ||
      (lead && lead.phone) ||
      "",
  });
  const crmClientIn = ensureCrmMod().clientOptions(
    (item && item.clientId) ||
      opts.clientId ||
      (lead && lead.clientId) ||
      ""
  );
  const crmCompanyIn = ensureCrmMod().companyOptions(
    (item && item.companyId) ||
      opts.companyId ||
      (lead && lead.companyId) ||
      ""
  );
  crmClientIn.addEventListener("change", () => {
    const c = ensureCrmMod().clientById(crmClientIn.value);
    if (!c) return;
    ensureCrmMod().fillFromClient(c, {
      clientName: clientIn,
      clientEmail: emailIn,
      clientPhone: phoneIn,
      company: companyIn,
      companyId: crmCompanyIn,
    });
  });
  const serviceIn = serviceTypeOptions(
    (item && item.serviceType) || "other"
  );
  const statusIn = select(
    {},
    PROJECT_STATUS.map((s) => ({
      value: s,
      label: `${PROJECT_STATUS_LABEL[s] || s} (${s})`,
    })),
    (item && item.status) || "inquiry"
  );
  const phaseIn = select(
    {},
    [{ value: "", label: "— (unset) —" }].concat(
      PROJECT_PHASE.map((p) => ({
        value: p,
        label: PROJECT_PHASE_LABEL[p] || p,
      }))
    ),
    (item && item.phase) || ""
  );
  const progIn = input({
    type: "number",
    min: "0",
    max: "100",
    value: item && item.progress != null ? String(item.progress) : "",
  });
  const priIn = select({}, TASK_PRIORITY, (item && item.priority) || "medium");
  const budgetIn = input({
    type: "number",
    min: "0",
    step: "1",
    value:
      item && item.budget != null
        ? String(item.budget)
        : lead && lead.amountEstimate != null
          ? String(lead.amountEstimate)
          : "0",
  });
  const startIn = input({ type: "date", value: ymd(item && item.startDate) });
  const targetIn = input({ type: "date", value: ymd(item && item.targetDate) });
  const descIn = textarea({});
  descIn.value = (item && item.description) || "";
  const notesIn = textarea({});
  notesIn.value = (item && item.internalNotes) || "";
  const form = el("form", { className: "hq-form" }, [
    fieldRow("Project Name *", nameIn),
    fieldRow("CRM Client", crmClientIn),
    fieldRow("CRM Company", crmCompanyIn),
    fieldRow("Client Name", clientIn),
    fieldRow("Company", companyIn),
    fieldRow("Email", emailIn),
    fieldRow("Phone", phoneIn),
    fieldRow("Service Type *", serviceIn),
    fieldRow("Status *", statusIn),
    fieldRow("Phase", phaseIn),
    fieldRow("Progress (0–100)", progIn),
    fieldRow("Priority", priIn),
    fieldRow("Budget (KRW)", budgetIn),
    fieldRow("Start Date", startIn),
    fieldRow("Target Date", targetIn),
    fieldRow("Description", descIn),
    fieldRow("Internal Notes", notesIn),
  ]);
  const saveBtn = btn(isEdit ? "Save" : "Create", {
    type: "submit",
    dataset: { hqSave: "1" },
  });
  const cancelBtn = btn("Cancel", {
    className: "hq-btn hq-btn--ghost",
    onClick: (e) => {
      e.preventDefault();
      closeModal();
    },
  });
  form.addEventListener(
    "submit",
    withSaving(async (e) => {
      e.preventDefault();
      const name = nameIn.value.trim();
      if (!name) {
        toast("Project name is required", "err");
        return;
      }
      if (!serviceIn.value || !PROJECT_STATUS.includes(statusIn.value)) {
        toast("Invalid service or status", "err");
        return;
      }
      const email = emailIn.value.trim();
      if (!isEmail(email)) {
        toast("Invalid email", "err");
        return;
      }
      const budget = Number(budgetIn.value || 0);
      if (!Number.isFinite(budget) || budget < 0) {
        toast("Budget must be 0 or greater", "err");
        return;
      }
      if (startIn.value && targetIn.value && targetIn.value < startIn.value) {
        toast("Target date is before start date", "err");
        return;
      }
      if (!TASK_PRIORITY.includes(priIn.value)) {
        toast("Invalid priority", "err");
        return;
      }
      let progress = null;
      if (progIn.value !== "") {
        progress = Number(progIn.value);
        if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
          toast("Progress must be 0–100", "err");
          return;
        }
      }
      if (phaseIn.value && !PROJECT_PHASE.includes(phaseIn.value)) {
        toast("Invalid phase", "err");
        return;
      }
      const leadId =
        (item && item.leadId) || (lead && lead.id) || null;
      const payload = {
        name,
        clientName: clientIn.value.trim(),
        company: companyIn.value.trim(),
        clientEmail: email,
        clientPhone: phoneIn.value.trim(),
        serviceType: serviceIn.value,
        status: statusIn.value,
        priority: priIn.value,
        budget,
        currency: "KRW",
        startDate: startIn.value || null,
        targetDate: targetIn.value || null,
        description: descIn.value.trim(),
        internalNotes: notesIn.value.trim(),
        leadId,
        clientId: crmClientIn.value || null,
        companyId: crmCompanyIn.value || null,
        archived: !!(item && item.archived),
        updatedAt: serverTimestamp(),
        updatedBy: uid(),
      };
      if (phaseIn.value) payload.phase = phaseIn.value;
      else if (isEdit && item && item.phase) payload.phase = null;
      if (progress != null) payload.progress = progress;
      else if (isEdit && item && item.progress != null) payload.progress = null;
      try {
        let projectId = item && item.id;
        if (isEdit) {
          await updateDoc(doc(ctx.db, COL.projects, item.id), payload);
        } else {
          const ref = await addDoc(collection(ctx.db, COL.projects), {
            ...payload,
            archived: false,
            createdAt: serverTimestamp(),
            createdBy: uid(),
          });
          projectId = ref.id;
          if (leadId) {
            await updateDoc(doc(ctx.db, COL.leads, leadId), {
              projectId,
              updatedAt: serverTimestamp(),
              updatedBy: uid(),
            });
          }
        }
        closeModal();
        toast(isEdit ? "Saved" : "Project created", "ok");
        projectDetailId = projectId || null;
        currentNav = "projects";
        await refreshAndRender();
        showPanel("projects");
      } catch {
        toast("Save failed", "err");
      }
    })
  );
  openModal(isEdit ? "Edit Project" : "New Project", form, [cancelBtn, saveBtn]);
}

function openProjectStatusForm(item) {
  const statusIn = select(
    {},
    PROJECT_STATUS.map((s) => ({
      value: s,
      label: `${PROJECT_STATUS_LABEL[s] || s} (${s})`,
    })),
    item.status || "inquiry"
  );
  const form = el("form", { className: "hq-form" }, [
    fieldRow("Status", statusIn),
  ]);
  const saveBtn = btn("Update", { type: "submit", dataset: { hqSave: "1" } });
  const cancelBtn = btn("Cancel", {
    className: "hq-btn hq-btn--ghost",
    onClick: (e) => {
      e.preventDefault();
      closeModal();
    },
  });
  form.addEventListener(
    "submit",
    withSaving(async (e) => {
      e.preventDefault();
      if (!PROJECT_STATUS.includes(statusIn.value)) {
        toast("Invalid status", "err");
        return;
      }
      try {
        await updateDoc(doc(ctx.db, COL.projects, item.id), {
          status: statusIn.value,
          updatedAt: serverTimestamp(),
          updatedBy: uid(),
        });
        closeModal();
        toast("Status updated", "ok");
        await refreshAndRender();
      } catch {
        toast("Update failed", "err");
      }
    })
  );
  openModal("Change Status", form, [cancelBtn, saveBtn]);
}

function renderProjectDetail(root, project) {
  ensureOpsMod().renderProjectDetail(root, project);
}

function renderProjects(root) {
  clear(root);
  if (projectDetailId) {
    const project = projectById(projectDetailId);
    if (project) {
      renderProjectDetail(root, project);
      return;
    }
    projectDetailId = null;
  }

  const activeList = cache.projects.filter((p) => !p.archived);
  const total = activeList.length;
  const active = activeList.filter((p) => p.status === "active").length;
  const review = activeList.filter((p) => p.status === "review").length;
  const completed = activeList.filter((p) => p.status === "completed").length;
  const budgetSum = activeList.reduce((s, p) => s + (Number(p.budget) || 0), 0);

  root.appendChild(
    pageHeader("projects", [
      el("span", {
        className: "hq-page-header__count",
        text:
          dataState.status === "loading"
            ? "로딩 중…"
            : `진행 ${active} · 전체 ${total}`,
      }),
      btn("+ 프로젝트", { onClick: () => openProjectForm(null) }),
    ])
  );

  const banner = dataStateBanner();
  if (banner) root.appendChild(banner);

  root.appendChild(
    el("div", { className: "hq-stat-grid hq-stat-grid--compact" }, [
      statCard("전체", total, "보관 제외"),
      statCard("진행 중", active, "active"),
      statCard("검수", review, "review"),
      statCard("완료", completed, "completed"),
      statCard("예산 합계", formatKrw(budgetSum), "budget sum"),
      statCard("보관", cache.projects.filter((p) => p.archived).length, "기본 숨김"),
    ])
  );

  const seg = el("div", { className: "hq-seg hq-seg--wrap" });
  for (const [val, label] of [
    ["", "전체"],
    ["active", "진행 중"],
    ["review", "검수"],
    ["completed", "완료"],
    ["on_hold", "보류"],
  ]) {
    seg.appendChild(
      el("button", {
        type: "button",
        className:
          "hq-seg__btn" + (filters.projects.status === val ? " is-active" : ""),
        text: label,
        onClick: () => {
          filters.projects.status = val;
          renderProjects(root);
        },
      })
    );
  }
  const serviceF = select(
    {
      onChange: (e) => {
        filters.projects.service = e.target.value;
        renderProjects(root);
      },
    },
    [{ value: "", label: "서비스" }].concat(
      serviceTypes.map((s) =>
        typeof s === "string" ? { value: s, label: s } : s
      )
    ),
    filters.projects.service
  );
  const priF = select(
    {
      onChange: (e) => {
        filters.projects.priority = e.target.value;
        renderProjects(root);
      },
    },
    [{ value: "", label: "우선순위" }].concat(TASK_PRIORITY),
    filters.projects.priority
  );
  const archF = select(
    {
      onChange: (e) => {
        filters.projects.archived = e.target.value;
        renderProjects(root);
      },
    },
    [
      { value: "active", label: "운영 목록" },
      { value: "archived", label: "보관" },
      { value: "all", label: "전체 포함" },
    ],
    filters.projects.archived
  );
  const search = input({
    className: "hq-input hq-input--search",
    placeholder: "이름 / 고객 / 회사 검색…",
    value: filters.projects.q || "",
    "aria-label": "프로젝트 검색",
    onInput: (e) => {
      filters.projects.q = e.target.value;
      renderProjects(root);
    },
  });
  root.appendChild(toolbar([seg, serviceF, priF, archF, search]));

  if (dataState.status === "loading" && !cache.projects.length) {
    root.appendChild(
      emptyState(
        "프로젝트 로딩 중",
        "Firestore에서 프로젝트 목록을 불러오는 중입니다.",
        null
      )
    );
    return;
  }

  const list = filteredProjects();
  if (!list.length) {
    const hasAny = cache.projects.some((p) =>
      filters.projects.archived === "archived" ? p.archived : !p.archived
    );
    root.appendChild(
      emptyState(
        hasAny ? "조건에 맞는 프로젝트 없음" : "아직 프로젝트가 없습니다",
        hasAny
          ? "필터를 바꾸거나 검색어를 지워 보세요."
          : "클라이언트 프로젝트를 추가하면 일정·작업·매출을 함께 관리합니다.",
        hasAny ? null : btn("+ 프로젝트", { onClick: () => openProjectForm(null) })
      )
    );
    return;
  }

  const rows = list.map((p) => {
    const tr = el("tr", {
      className: "hq-table__row--clickable",
      style: "cursor:pointer",
      onClick: () => {
        projectDetailId = p.id;
        renderProjects(root);
      },
    });
    const nameTd = el("td");
    nameTd.appendChild(el("div", { className: "hq-row__title", text: p.name || "—" }));
    nameTd.appendChild(
      el("div", {
        className: "hq-row__meta",
        text: p.priority ? `우선순위 ${p.priority}` : "",
      })
    );
    tr.appendChild(nameTd);
    tr.appendChild(
      el("td", {
        text: `${p.clientName || "—"}${p.company ? " · " + p.company : ""}`,
      })
    );
    tr.appendChild(el("td", { text: serviceTypeLabel(p.serviceType) }));
    tr.appendChild(el("td", null, [projectStatusBadge(p.status)]));
    tr.appendChild(el("td", { text: formatKrw(p.budget || 0) }));
    tr.appendChild(el("td", { text: ymd(p.targetDate) || "—" }));
    tr.appendChild(el("td", { text: ymd(p.updatedAt) || "—" }));
    const actions = el("td", { className: "hq-actions-cell" });
    actions.appendChild(
      btn("열기", {
        className: "hq-btn hq-btn--small",
        onClick: (e) => {
          e.stopPropagation();
          projectDetailId = p.id;
          renderProjects(root);
        },
      })
    );
    tr.appendChild(actions);
    return tr;
  });
  root.appendChild(
    table(
      ["프로젝트", "고객", "서비스", "상태", "예산", "목표일", "업데이트", ""],
      rows,
      "조건에 맞는 프로젝트가 없습니다."
    )
  );

  const cards = el("div", { className: "hq-card-list is-mobile-only" });
  for (const p of list) {
    const cardEl = el("article", {
      className: "hq-item-card",
      style: "cursor:pointer",
      onClick: () => {
        projectDetailId = p.id;
        renderProjects(root);
      },
    });
    const top = el("div", { className: "hq-item-card__top" });
    top.appendChild(el("p", { className: "hq-item-card__title", text: p.name || "—" }));
    top.appendChild(projectStatusBadge(p.status));
    cardEl.appendChild(top);
    cardEl.appendChild(
      el("p", {
        className: "hq-item-card__meta",
        text: `${p.clientName || p.company || "—"} · ${formatKrw(p.budget || 0)} · 목표 ${
          ymd(p.targetDate) || "없음"
        }`,
      })
    );
    cards.appendChild(cardEl);
  }
  root.appendChild(cards);
}

function renderCurrent() {
  const map = {
    dashboard: renderDashboard,
    tasks: renderTasks,
    releases: renderReleases,
    leads: renderLeads,
    clients: (root) => ensureCrmMod().renderClients(root),
    projects: renderProjects,
    documents: (root) => ensureDocsMod().renderDocuments(root),
    finance: renderFinance,
    products: renderProducts,
    health: (root) => ensureHealthMod().render(root),
    analytics: renderAnalytics,
    settings: renderSettings,
  };
  const root = $("hq-panel-" + currentNav);
  const fn = map[currentNav];
  if (root && fn) fn(root);
}

function bindShell() {
  document.querySelectorAll("[data-hq-nav]").forEach((node) => {
    bind(node, "click", (e) => {
      e.preventDefault();
      const key = node.getAttribute("data-hq-nav");
      if (NAV_KEYS.includes(key)) showPanel(key);
    });
  });
  bind($("hq-nav-toggle"), "click", () => {
    const nav = $("hq-nav");
    setNavOpen(!(nav && nav.classList.contains("is-open")));
  });
  bind($("hq-shell-backdrop"), "click", () => setNavOpen(false));
  const modal = $("hq-modal");
  if (modal) {
    bind(modal, "cancel", (e) => {
      e.preventDefault();
      closeModal();
    });
  }
}

function stop() {
  for (const u of unsubs) {
    try {
      u();
    } catch {
      /* ignore */
    }
  }
  unsubs = [];
  cache = emptyCache();
  catalog = [];
  serviceTypes = DEFAULT_SERVICE_TYPES.slice();
  pricingBySlug = {};
  projectDetailId = null;
  docsMod = null;
  opsMod = null;
  crmMod = null;
  healthMod = null;
  ctx = null;
  saving = false;
  dataState = {
    status: "idle",
    permissionDenied: false,
    message: "",
    lastLoadedAt: null,
  };
  analyticsPeriod = "7d";
  closeModal();
  setNavOpen(false);
  toast("");
}

async function start(startCtx) {
  stop();
  ctx = startCtx || null;
  if (!ctx || !ctx.db || !ctx.user) {
    toast("Missing HQ context", "err");
    return;
  }
  const emailEl = $("hq-shell-email");
  if (emailEl) emailEl.textContent = ctx.user.email || "—";
  const avatar = document.querySelector(".hq-nav__avatar");
  if (avatar) {
    const ch = (ctx.user.email || "N").trim().charAt(0).toUpperCase();
    avatar.textContent = ch || "N";
  }
  bindShell();
  toast("Loading…");
  try {
    await Promise.all([
      loadAll(),
      loadCatalog(),
      loadServiceTypes(),
      loadPricing(),
      loadQuotePackages(),
      ensureHealthMod().load(),
    ]);
    ensureDocsMod();
    ensureOpsMod();
    ensureCrmMod();
    toast("");
    showPanel("dashboard");
  } catch {
    toast("초기 로드 실패", "err");
    showPanel("dashboard");
  }
}

window.NEWON_HQ_APP = { start, stop };
