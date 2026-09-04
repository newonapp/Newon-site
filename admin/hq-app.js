/**
 * Newon HQ Operations V1 — ES module.
 * window.NEWON_HQ_APP = { start(ctx), stop() }
 */
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const HQ_VERSION = "1.1.0";
const COL = {
  tasks: "hq_tasks",
  releases: "hq_releases",
  leads: "hq_leads",
  finance: "hq_finance",
  productsMeta: "hq_products_meta",
};

const TASK_STATUS = ["todo", "doing", "done"];
const TASK_PRIORITY = ["low", "medium", "high"];
const RELEASE_PLATFORM = ["iOS", "Android", "Web", "Other"];
const RELEASE_STATUS = ["planned", "in_progress", "review", "released", "blocked"];
const LEAD_SOURCE = [
  "Business",
  "Studio",
  "Store",
  "Wishket",
  "Referral",
  "Instagram",
  "Threads",
  "Other",
];
const LEAD_STATUS = [
  "new",
  "reviewing",
  "contacted",
  "quoted",
  "contracted",
  "in_progress",
  "completed",
  "hold",
  "rejected",
];
const ACTIVE_LEAD = new Set([
  "new",
  "reviewing",
  "contacted",
  "quoted",
  "contracted",
  "in_progress",
]);
const FINANCE_TYPE = ["income", "expense"];
const OPS_STATUS = ["active", "review", "maintenance", "paused", "planned"];

const NAV_KEYS = [
  "dashboard",
  "tasks",
  "releases",
  "leads",
  "finance",
  "products",
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
  tasks: { status: "", priority: "", q: "" },
  releases: { status: "", product: "" },
  leads: { status: "", source: "", archived: "active" },
  finance: { month: "", type: "", archived: "active" },
  products: { status: "" },
};

const PAGE_META = {
  dashboard: {
    eyebrow: "Overview",
    title: "Dashboard",
    desc: "Operations overview across tasks, releases, leads, and cash flow.",
  },
  tasks: {
    eyebrow: "Operations",
    title: "Tasks",
    desc: "Track the work that keeps Newon shipping.",
  },
  releases: {
    eyebrow: "Operations",
    title: "Releases",
    desc: "Manual release log for apps and platforms.",
  },
  leads: {
    eyebrow: "Business",
    title: "Leads",
    desc: "Inbound inquiries and pipeline status.",
  },
  finance: {
    eyebrow: "Business",
    title: "Finance",
    desc: "Founder cash-flow ledger for income and expense.",
  },
  products: {
    eyebrow: "Operations",
    title: "Products",
    desc: "Catalog snapshot plus operational metadata.",
  },
  settings: {
    eyebrow: "System",
    title: "Settings",
    desc: "Account, environment, and session controls.",
  },
};
let saving = false;

function emptyCache() {
  return { tasks: [], releases: [], leads: [], finance: [], productsMeta: [] };
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

function openModal(title, bodyNode, actions) {
  const modal = $("hq-modal");
  const t = $("hq-modal-title");
  const b = $("hq-modal-body");
  const a = $("hq-modal-actions");
  if (!modal || !t || !b || !a) return;
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
  const label = s.replace(/_/g, " ");
  return badge(label, s);
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
  if (d < t) return badge("Overdue", "overdue");
  if (d === t) return badge("Due today", "due-today");
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
      return snapToList(await getDocs(query(ref, orderBy(orderField, "desc"))));
    }
    return snapToList(await getDocs(ref));
  } catch {
    try {
      return snapToList(await getDocs(ref));
    } catch {
      return [];
    }
  }
}

async function loadAll() {
  if (!ctx || !ctx.db) return;
  const [tasks, releases, leads, finance, productsMeta] = await Promise.all([
    loadCol(COL.tasks, "createdAt"),
    loadCol(COL.releases, "createdAt"),
    loadCol(COL.leads, "createdAt"),
    loadCol(COL.finance, "date"),
    loadCol(COL.productsMeta, null),
  ]);
  cache = { tasks, releases, leads, finance, productsMeta };
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

/* ---------- Dashboard ---------- */
function renderDashboard(root) {
  clear(root);
  const today = todayYmd();
  const month = monthKey(new Date());
  const openTasks = cache.tasks.filter((t) => t.status !== "done").length;
  const upcomingReleases = cache.releases.filter((r) => r.status !== "released").length;
  const activeLeads = cache.leads.filter(
    (l) => !l.archived && ACTIVE_LEAD.has(l.status)
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

  root.appendChild(
    pageHeader("dashboard", [
      el("span", { className: "hq-page-header__meta", text: formatLongDate(new Date()) }),
      el("span", { className: "hq-page-header__count", text: "Live data" }),
    ])
  );

  root.appendChild(
    el("div", { className: "hq-stat-grid" }, [
      statCard("Open tasks", openTasks, "Todo + doing"),
      statCard("Upcoming releases", upcomingReleases, "Not released"),
      statCard("Active leads", activeLeads, "In pipeline"),
      statCard("Month revenue", formatKrw(income), month),
      statCard("Month expense", formatKrw(expense), month),
      statCard("Net", formatKrw(net), "Income − expense"),
    ])
  );

  const taskPreview = cache.tasks
    .filter((t) => t.status !== "done")
    .slice(0, 6);
  const taskBody = [];
  if (!taskPreview.length) {
    taskBody.push(
      el("div", { style: "padding:1rem 1.05rem" }, [
        emptyMsg("No open tasks."),
      ])
    );
  } else {
    for (const t of taskPreview) {
      const row = el("div", {
        className: "hq-row hq-row--task" + (t.status === "done" ? " is-done" : ""),
      });
      row.appendChild(statusBadge(t.status));
      const mid = el("div");
      mid.appendChild(el("p", { className: "hq-row__title", text: t.title || "—" }));
      const metaBits = [t.priority || "", ymd(t.dueDate) || "No due date"]
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
  const releasePreview = cache.releases
    .filter((r) => r.status !== "released")
    .concat(cache.releases.filter((r) => r.status === "released"))
    .slice(0, 5);
  const releaseBody = [];
  if (!releasePreview.length) {
    releaseBody.push(
      el("div", { style: "padding:1rem 1.05rem" }, [
        emptyMsg("No releases yet."),
      ])
    );
  } else {
    for (const r of releasePreview) {
      const row = el("div", { className: "hq-row" });
      row.appendChild(statusBadge(r.status));
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
      row.appendChild(el("span", { className: "hq-row__aside", text: r.platform || "" }));
      releaseBody.push(row);
    }
  }

  root.appendChild(
    el("div", { className: "hq-grid-2" }, [
      surfacePanel(
        "Today / Tasks",
        taskBody,
        el("button", {
          type: "button",
          className: "hq-surface-panel__link",
          text: "View all",
          onClick: () => showPanel("tasks"),
        })
      ),
      surfacePanel(
        "Upcoming releases",
        releaseBody,
        el("button", {
          type: "button",
          className: "hq-surface-panel__link",
          text: "View all",
          onClick: () => showPanel("releases"),
        })
      ),
    ])
  );

  const leadBuckets = [
    ["new", "New"],
    ["contacted", "Contacted"],
    ["quoted", "Quote"],
    ["contracted", "Won"],
    ["rejected", "Lost"],
  ];
  const leadCounts = leadBuckets.map(([st, label]) => {
    const n = cache.leads.filter((l) => !l.archived && l.status === st).length;
    return { st, label, n };
  });
  const leadMax = Math.max(0, ...leadCounts.map((x) => x.n));
  const pipeRows = leadCounts.map((x) =>
    el("div", { className: "hq-pipeline__row" }, [
      el("p", { className: "hq-pipeline__label", text: x.label }),
      pctBar(x.n, leadMax || 1),
      el("p", { className: "hq-pipeline__count", text: String(x.n) }),
    ])
  );

  const finMax = Math.max(income, expense, 1);
  const finBars = el("div", { className: "hq-bar-pair" }, [
    el("div", { className: "hq-bar-pair__item" }, [
      el("div", { className: "hq-bar-pair__top" }, [
        el("span", { text: "Income" }),
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
        el("span", { text: "Expense" }),
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
      text: `Net ${formatKrw(net)} · ${month}`,
    }),
  ]);

  root.appendChild(
    el("div", { className: "hq-grid-2--equal hq-grid-2" }, [
      surfacePanel("Leads pipeline", [el("div", { className: "hq-pipeline" }, pipeRows)]),
      surfacePanel("Finance overview", [finBars]),
    ])
  );
}

function filteredTasks() {
  const f = filters.tasks;
  const q = (f.q || "").trim().toLowerCase();
  return cache.tasks.filter((t) => {
    if (f.status && t.status !== f.status) return false;
    if (f.priority && t.priority !== f.priority) return false;
    if (q) {
      const hay = `${t.title || ""} ${t.description || ""} ${t.category || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function openTaskForm(item) {
  const isEdit = !!item;
  const titleIn = input({ value: (item && item.title) || "", required: true });
  const descIn = textarea({ text: (item && item.description) || "" });
  descIn.value = (item && item.description) || "";
  const statusIn = select({}, TASK_STATUS, (item && item.status) || "todo");
  const priIn = select({}, TASK_PRIORITY, (item && item.priority) || "medium");
  const catIn = input({ value: (item && item.category) || "" });
  const dueIn = input({ type: "date", value: ymd(item && item.dueDate) });
  const form = el("form", { className: "hq-form" }, [
    fieldRow("제목 *", titleIn),
    fieldRow("설명", descIn),
    fieldRow("상태", statusIn),
    fieldRow("우선순위", priIn),
    fieldRow("카테고리", catIn),
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
      const payload = {
        title,
        description: descIn.value.trim(),
        status: statusIn.value,
        priority: priIn.value,
        category: catIn.value.trim(),
        dueDate: dueIn.value || null,
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
  root.appendChild(
    pageHeader("tasks", [
      el("span", { className: "hq-page-header__count", text: `${openCount} open` }),
      btn("+ New Task", { onClick: () => openTaskForm(null) }),
    ])
  );

  const seg = el("div", { className: "hq-seg" });
  for (const [val, label] of [
    ["", "All"],
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
    [{ value: "", label: "Priority" }].concat(
      TASK_PRIORITY.map((p) => ({ value: p, label: p }))
    ),
    filters.tasks.priority
  );
  const search = input({
    className: "hq-input hq-input--search",
    placeholder: "Search tasks",
    value: filters.tasks.q || "",
    onInput: (e) => {
      filters.tasks.q = e.target.value;
      renderTasks(root);
    },
  });
  root.appendChild(toolbar([seg, priF, search]));

  const list = filteredTasks();
  if (!list.length) {
    root.appendChild(
      emptyState(
        "No tasks yet",
        "Add the first operational task to start the board.",
        btn("+ New Task", { onClick: () => openTaskForm(null) })
      )
    );
    return;
  }

  const rows = list.map((t) => {
    const tr = el("tr", { className: t.status === "done" ? "is-done" : "" });
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
      btn("Edit", { className: "hq-btn hq-btn--small", onClick: () => openTaskForm(t) })
    );
    actions.appendChild(
      btn("Delete", {
        className: "hq-btn hq-btn--small hq-btn--ghost",
        onClick: () =>
          confirmDelete("Delete this task?", async () => {
            try {
              await deleteDoc(doc(ctx.db, COL.tasks, t.id));
              toast("Deleted", "ok");
              await refreshAndRender();
            } catch {
              toast("Delete failed", "err");
            }
          }),
      })
    );
    tr.appendChild(actions);
    return tr;
  });
  root.appendChild(
    table(["Status", "Title", "Priority", "Due", "Updated", ""], rows, "No matching tasks.")
  );

  const cards = el("div", { className: "hq-card-list is-mobile-only" });
  for (const t of list) {
    const cardEl = el("article", { className: "hq-item-card" });
    const top = el("div", { className: "hq-item-card__top" });
    top.appendChild(el("p", { className: "hq-item-card__title", text: t.title || "—" }));
    top.appendChild(statusBadge(t.status));
    cardEl.appendChild(top);
    cardEl.appendChild(
      el("p", {
        className: "hq-item-card__meta",
        text: `${t.priority || "—"} · due ${ymd(t.dueDate) || "—"}`,
      })
    );
    const acts = el("div", { className: "hq-item-card__actions" });
    acts.appendChild(
      btn("Edit", { className: "hq-btn hq-btn--small", onClick: () => openTaskForm(t) })
    );
    cardEl.appendChild(acts);
    cards.appendChild(cardEl);
  }
  root.appendChild(cards);
}

function filteredReleases() {
  const f = filters.releases;
  const q = (f.product || "").trim().toLowerCase();
  return cache.releases.filter((r) => {
    if (f.status && r.status !== f.status) return false;
    if (q && !(String(r.product || "").toLowerCase().includes(q))) return false;
    return true;
  });
}
function openReleaseForm(item) {
  const isEdit = !!item;
  const productIn = input({ value: (item && item.product) || "", required: true });
  const versionIn = input({ value: (item && item.version) || "", required: true });
  const platformIn = select({}, RELEASE_PLATFORM, (item && item.platform) || "iOS");
  const statusIn = select({}, RELEASE_STATUS, (item && item.status) || "planned");
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
  root.appendChild(
    pageHeader("releases", [
      btn("+ New Release", { onClick: () => openReleaseForm(null) }),
    ])
  );
  const statusF = select(
    {
      onChange: (e) => {
        filters.releases.status = e.target.value;
        renderReleases(root);
      },
    },
    [{ value: "", label: "Status" }].concat(RELEASE_STATUS),
    filters.releases.status
  );
  const productF = input({
    placeholder: "Filter product",
    value: filters.releases.product || "",
    onInput: (e) => {
      filters.releases.product = e.target.value;
      renderReleases(root);
    },
  });
  root.appendChild(toolbar([statusF, productF]));

  const list = filteredReleases();
  const upcoming = list.filter((r) => r.status !== "released");
  const released = list.filter((r) => r.status === "released");

  function releaseRows(items) {
    return items.map((r) => {
      const tr = el("tr");
      tr.appendChild(el("td", { text: r.product || "—" }));
      tr.appendChild(el("td", { text: r.version || "—" }));
      tr.appendChild(el("td", { text: r.platform || "—" }));
      tr.appendChild(el("td", null, [statusBadge(r.status)]));
      tr.appendChild(el("td", { text: ymd(r.releasedAt) || ymd(r.submittedAt) || "—" }));
      tr.appendChild(el("td", { text: r.notes || "—" }));
      const actions = el("td", { className: "hq-actions-cell" });
      actions.appendChild(
        btn("Edit", { className: "hq-btn hq-btn--small", onClick: () => openReleaseForm(r) })
      );
      actions.appendChild(
        btn("Delete", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: () =>
            confirmDelete("Delete this release?", async () => {
              try {
                await deleteDoc(doc(ctx.db, COL.releases, r.id));
                toast("Deleted", "ok");
                await refreshAndRender();
              } catch {
                toast("Delete failed", "err");
              }
            }),
        })
      );
      tr.appendChild(actions);
      return tr;
    });
  }

  if (!list.length) {
    root.appendChild(
      emptyState(
        "No release records",
        "Log the next app or platform release when you start work.",
        btn("+ New Release", { onClick: () => openReleaseForm(null) })
      )
    );
    return;
  }

  root.appendChild(el("h3", { className: "hq-surface-panel__title", text: "Upcoming", style: "margin:0 0 0.65rem" }));
  root.appendChild(
    table(
      ["Product", "Version", "Platform", "Status", "Date", "Notes", ""],
      releaseRows(upcoming),
      "No upcoming releases."
    )
  );
  root.appendChild(el("div", { style: "height:1rem" }));
  root.appendChild(el("h3", { className: "hq-surface-panel__title", text: "Released", style: "margin:0 0 0.65rem" }));
  root.appendChild(
    table(
      ["Product", "Version", "Platform", "Status", "Date", "Notes", ""],
      releaseRows(released),
      "No released items yet."
    )
  );
}

function filteredLeads() {
  const f = filters.leads;
  return cache.leads.filter((l) => {
    if (f.archived === "active" && l.archived) return false;
    if (f.archived === "archived" && !l.archived) return false;
    if (f.status && l.status !== f.status) return false;
    if (f.source && l.source !== f.source) return false;
    return true;
  });
}

function openLeadForm(item) {
  const isEdit = !!item;
  const nameIn = input({ value: (item && item.name) || "", required: true });
  const companyIn = input({ value: (item && item.company) || "" });
  const emailIn = input({ type: "email", value: (item && item.email) || "" });
  const phoneIn = input({ value: (item && item.phone) || "" });
  const sourceIn = select({}, LEAD_SOURCE, (item && item.source) || "Other");
  const statusIn = select({}, LEAD_STATUS, (item && item.status) || "new");
  const amountIn = input({
    type: "number",
    min: "0",
    step: "1",
    value: item && item.amountEstimate != null ? String(item.amountEstimate) : "0",
  });
  const notesIn = textarea({});
  notesIn.value = (item && item.notes) || "";
  const form = el("form", { className: "hq-form" }, [
    fieldRow("이름 *", nameIn),
    fieldRow("회사", companyIn),
    fieldRow("이메일", emailIn),
    fieldRow("전화", phoneIn),
    fieldRow("출처", sourceIn),
    fieldRow("상태", statusIn),
    fieldRow("예상 금액", amountIn),
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
        amountEstimate,
        notes: notesIn.value.trim(),
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
  const active = cache.leads.filter((l) => !l.archived);
  const counts = {
    new: active.filter((l) => l.status === "new").length,
    contacted: active.filter((l) => l.status === "contacted").length,
    quoted: active.filter((l) => l.status === "quoted").length,
    won: active.filter((l) => l.status === "contracted" || l.status === "completed").length,
    lost: active.filter((l) => l.status === "rejected").length,
  };
  root.appendChild(
    pageHeader("leads", [
      btn("CSV", { className: "hq-btn hq-btn--ghost", onClick: exportLeadsCsv }),
      btn("+ New Lead", { onClick: () => openLeadForm(null) }),
    ])
  );
  root.appendChild(
    el("div", { className: "hq-summary-strip" }, [
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "New" }),
        el("p", { className: "hq-summary-pill__value", text: String(counts.new) }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "Contacted" }),
        el("p", { className: "hq-summary-pill__value", text: String(counts.contacted) }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "Quote" }),
        el("p", { className: "hq-summary-pill__value", text: String(counts.quoted) }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "Won" }),
        el("p", { className: "hq-summary-pill__value", text: String(counts.won) }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "Lost" }),
        el("p", { className: "hq-summary-pill__value", text: String(counts.lost) }),
      ]),
    ])
  );

  const statusF = select(
    {
      onChange: (e) => {
        filters.leads.status = e.target.value;
        renderLeads(root);
      },
    },
    [{ value: "", label: "Status" }].concat(LEAD_STATUS),
    filters.leads.status
  );
  const sourceF = select(
    {
      onChange: (e) => {
        filters.leads.source = e.target.value;
        renderLeads(root);
      },
    },
    [{ value: "", label: "Source" }].concat(LEAD_SOURCE),
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
      { value: "active", label: "Active" },
      { value: "archived", label: "Archived" },
      { value: "all", label: "All" },
    ],
    filters.leads.archived
  );
  root.appendChild(toolbar([statusF, sourceF, archF]));

  const list = filteredLeads();
  if (!list.length) {
    root.appendChild(
      emptyState(
        "No leads yet",
        "Register inbound inquiries manually. FormSubmit sync is deferred.",
        btn("+ New Lead", { onClick: () => openLeadForm(null) })
      )
    );
    return;
  }

  const rows = list.map((l) => {
    const tr = el("tr");
    tr.appendChild(el("td", { text: l.name || "—" }));
    tr.appendChild(el("td", { text: l.company || "—" }));
    tr.appendChild(el("td", { text: l.source || "—" }));
    tr.appendChild(
      el("td", {
        text: l.amountEstimate != null ? formatKrw(l.amountEstimate) : "—",
      })
    );
    tr.appendChild(el("td", null, [statusBadge(l.status)]));
    tr.appendChild(el("td", { text: ymd(l.createdAt) || "—" }));
    const actions = el("td", { className: "hq-actions-cell" });
    actions.appendChild(
      btn("Edit", { className: "hq-btn hq-btn--small", onClick: () => openLeadForm(l) })
    );
    if (!l.archived) {
      actions.appendChild(
        btn("Archive", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: withSaving(async () => {
            try {
              await updateDoc(doc(ctx.db, COL.leads, l.id), {
                archived: true,
                updatedAt: serverTimestamp(),
                updatedBy: uid(),
              });
              toast("Archived", "ok");
              await refreshAndRender();
            } catch {
              toast("Archive failed", "err");
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
      ["Lead", "Company", "Source", "Budget", "Status", "Created", ""],
      rows,
      "No leads match filters."
    )
  );

  const cards = el("div", { className: "hq-card-list is-mobile-only" });
  for (const l of list) {
    const cardEl = el("article", { className: "hq-item-card" });
    const top = el("div", { className: "hq-item-card__top" });
    top.appendChild(el("p", { className: "hq-item-card__title", text: l.name || "—" }));
    top.appendChild(statusBadge(l.status));
    cardEl.appendChild(top);
    cardEl.appendChild(
      el("p", {
        className: "hq-item-card__meta",
        text: `${l.company || "—"} · ${l.source || "—"} · ${
          l.amountEstimate != null ? formatKrw(l.amountEstimate) : "—"
        }`,
      })
    );
    const acts = el("div", { className: "hq-item-card__actions" });
    acts.appendChild(
      btn("Edit", { className: "hq-btn hq-btn--small", onClick: () => openLeadForm(l) })
    );
    cardEl.appendChild(acts);
    cards.appendChild(cardEl);
  }
  root.appendChild(cards);
}

function filteredFinance() {
  const f = filters.finance;
  if (!f.month) f.month = monthKey(new Date());
  return cache.finance.filter((row) => {
    if (f.archived === "active" && row.archived) return false;
    if (f.archived === "archived" && !row.archived) return false;
    if (f.type && row.type !== f.type) return false;
    if (f.month && monthKey(row.date) !== f.month) return false;
    return true;
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

function openFinanceForm(item) {
  const isEdit = !!item;
  const typeIn = select({}, FINANCE_TYPE, (item && item.type) || "expense");
  const catIn = input({ value: (item && item.category) || "", required: true });
  const amountIn = input({
    type: "number",
    min: "1",
    step: "1",
    value: item && item.amount != null ? String(item.amount) : "",
    required: true,
  });
  const dateIn = input({
    type: "date",
    value: ymd(item && item.date) || todayYmd(),
    required: true,
  });
  const memoIn = textarea({});
  memoIn.value = (item && item.memo) || "";
  const projectIn = input({ value: (item && item.relatedProject) || "" });
  const form = el("form", { className: "hq-form" }, [
    fieldRow("유형", typeIn),
    fieldRow("카테고리 *", catIn),
    fieldRow("금액 *", amountIn),
    fieldRow("날짜 *", dateIn),
    fieldRow("관련 프로젝트", projectIn),
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
      const payload = {
        type: typeIn.value,
        category,
        amount,
        date,
        memo: memoIn.value.trim(),
        relatedProject: projectIn.value.trim(),
        archived: !!(item && item.archived),
        updatedAt: serverTimestamp(),
        updatedBy: uid(),
      };
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
  const monthRows = cache.finance.filter(
    (f) => !f.archived && monthKey(f.date) === month
  );
  const monthTotals = financeTotals(monthRows);
  const allActive = cache.finance.filter((f) => !f.archived);
  const allTime = financeTotals(allActive);

  root.appendChild(
    pageHeader("finance", [
      btn("CSV", { className: "hq-btn hq-btn--ghost", onClick: exportFinanceCsv }),
      btn("+ Add Entry", { onClick: () => openFinanceForm(null) }),
    ])
  );
  root.appendChild(
    el("div", { className: "hq-stat-grid" }, [
      statCard("This month income", formatKrw(monthTotals.income), month),
      statCard("This month expense", formatKrw(monthTotals.expense), month),
      statCard("Net", formatKrw(monthTotals.net), "Current month"),
      statCard("All-time net", formatKrw(allTime.net), "Active entries"),
      (() => {
        const max = Math.max(monthTotals.income, monthTotals.expense, 1);
        const wrap = el("div", { className: "hq-card hq-stat", style: "grid-column: span 2" });
        wrap.appendChild(el("p", { className: "hq-card__label", text: "Month mix" }));
        const bars = el("div", { className: "hq-bar-pair", style: "padding:0.55rem 0 0" });
        const inc = el("div", { className: "hq-bar-pair__fill--income" });
        inc.style.width = Math.round((monthTotals.income / max) * 100) + "%";
        const exp = el("div", { className: "hq-bar-pair__fill--expense" });
        exp.style.width = Math.round((monthTotals.expense / max) * 100) + "%";
        bars.appendChild(
          el("div", { className: "hq-bar-pair__item" }, [
            el("div", { className: "hq-bar-pair__top" }, [
              el("span", { text: "Income" }),
              el("span", { className: "hq-bar-pair__val", text: formatKrw(monthTotals.income) }),
            ]),
            el("div", { className: "hq-bar-pair__track" }, [inc]),
          ])
        );
        bars.appendChild(
          el("div", { className: "hq-bar-pair__item" }, [
            el("div", { className: "hq-bar-pair__top" }, [
              el("span", { text: "Expense" }),
              el("span", { className: "hq-bar-pair__val", text: formatKrw(monthTotals.expense) }),
            ]),
            el("div", { className: "hq-bar-pair__track" }, [exp]),
          ])
        );
        wrap.appendChild(bars);
        return wrap;
      })(),
    ])
  );

  const monthIn = input({
    type: "month",
    value: filters.finance.month,
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
    [{ value: "", label: "Type" }].concat(FINANCE_TYPE),
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
      { value: "active", label: "Active" },
      { value: "archived", label: "Archived" },
      { value: "all", label: "All" },
    ],
    filters.finance.archived
  );
  root.appendChild(toolbar([monthIn, typeF, archF]));

  const list = filteredFinance();
  if (!list.length) {
    root.appendChild(
      emptyState(
        "No transactions this month",
        "Add income or expense entries to build the cash-flow view.",
        btn("+ Add Entry", { onClick: () => openFinanceForm(null) })
      )
    );
    return;
  }

  const rows = list.map((f) => {
    const tr = el("tr");
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
    tr.appendChild(el("td", null, [statusBadge(f.type)]));
    const actions = el("td", { className: "hq-actions-cell" });
    actions.appendChild(
      btn("Edit", { className: "hq-btn hq-btn--small", onClick: () => openFinanceForm(f) })
    );
    if (!f.archived) {
      actions.appendChild(
        btn("Archive", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: withSaving(async () => {
            try {
              await updateDoc(doc(ctx.db, COL.finance, f.id), {
                archived: true,
                updatedAt: serverTimestamp(),
                updatedBy: uid(),
              });
              toast("Archived", "ok");
              await refreshAndRender();
            } catch {
              toast("Archive failed", "err");
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
      ["Date", "Category", "Description", "Amount", "Type", ""],
      rows,
      "No transactions."
    )
  );

  const cards = el("div", { className: "hq-card-list is-mobile-only" });
  for (const f of list) {
    const cardEl = el("article", { className: "hq-item-card" });
    const top = el("div", { className: "hq-item-card__top" });
    top.appendChild(el("p", { className: "hq-item-card__title", text: f.category || "—" }));
    top.appendChild(
      el("span", {
        className: f.type === "expense" ? "hq-amount--expense" : "hq-amount--income",
        text: (f.type === "expense" ? "−" : "+") + formatKrw(f.amount),
      })
    );
    cardEl.appendChild(top);
    cardEl.appendChild(
      el("p", {
        className: "hq-item-card__meta",
        text: `${ymd(f.date) || "—"} · ${f.memo || f.relatedProject || "—"}`,
      })
    );
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

function renderProducts(root) {
  clear(root);
  root.appendChild(pageHeader("products", []));
  root.appendChild(
    el("p", {
      className: "hq-catalog-note",
      text: "Catalog fields come from the public product SoT. Ops version / status / notes live only in Firestore meta.",
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
        text: "Updated " + (ymd(meta && meta.updatedAt) || "—"),
      })
    );
    grid.appendChild(cardBtn);
  }
  root.appendChild(grid);
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

function renderCurrent() {
  const map = {
    dashboard: renderDashboard,
    tasks: renderTasks,
    releases: renderReleases,
    leads: renderLeads,
    finance: renderFinance,
    products: renderProducts,
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
  ctx = null;
  saving = false;
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
    await Promise.all([loadAll(), loadCatalog()]);
    toast("");
    showPanel("dashboard");
  } catch {
    toast("초기 로드 실패", "err");
    showPanel("dashboard");
  }
}

window.NEWON_HQ_APP = { start, stop };
