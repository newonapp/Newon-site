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

const HQ_VERSION = "1.0.0";
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
  tasks: { status: "", priority: "" },
  releases: { status: "", product: "" },
  leads: { status: "", source: "", archived: "active" },
  finance: { month: "", type: "", archived: "active" },
  products: { status: "" },
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
  return el("p", { className: "hq-empty", text: text || "데이터가 없습니다." });
}

function toolbar(children) {
  return el("div", { className: "hq-toolbar" }, children);
}

function card(label, value) {
  return el("div", { className: "hq-card" }, [
    el("p", { className: "hq-card__label", text: label }),
    el("p", { className: "hq-card__value", text: String(value) }),
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
    td.appendChild(emptyMsg(emptyText || "아직 데이터가 없습니다."));
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    for (const row of rows) tbody.appendChild(row);
  }
  return el("div", { className: "hq-table-wrap" }, [
    el("table", { className: "hq-table" }, [thead, tbody]),
  ]);
}

function badge(text, kind) {
  return el("span", {
    className: "hq-badge" + (kind ? " hq-badge--" + kind : ""),
    text,
  });
}

function dueBadge(dueDate) {
  const d = ymd(dueDate);
  if (!d) return null;
  const t = todayYmd();
  if (d < t) return badge("기한 초과", "overdue");
  if (d === t) return badge("오늘 마감", "due-today");
  return null;
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
  const todayTasks = cache.tasks.filter((t) => ymd(t.dueDate) === today).length;
  const doingTasks = cache.tasks.filter((t) => t.status === "doing").length;
  const newLeads = cache.leads.filter((l) => !l.archived && l.status === "new").length;
  const activeLeads = cache.leads.filter(
    (l) => !l.archived && ACTIVE_LEAD.has(l.status)
  ).length;
  const recentReleases = cache.releases.slice(0, 3);
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

  root.appendChild(el("h2", { className: "hq-section-title", text: "Dashboard" }));
  root.appendChild(
    el("div", { className: "hq-cards" }, [
      card("오늘 할 일", todayTasks),
      card("진행 중 할 일", doingTasks),
      card("신규 문의", newLeads),
      card("진행 중 문의", activeLeads),
      card("최근 릴리즈", recentReleases.length),
      card("이번 달 수입", formatKrw(income)),
      card("이번 달 지출", formatKrw(expense)),
      card("이번 달 순현금흐름", formatKrw(net)),
    ])
  );

  root.appendChild(el("h3", { className: "hq-section-title", text: "최근 릴리즈" }));
  if (!recentReleases.length) root.appendChild(emptyMsg("아직 데이터가 없습니다."));
  else {
    const ul = el("ul", { className: "hq-recent-list" });
    for (const r of recentReleases) {
      const li = el("li");
      li.appendChild(
        document.createTextNode(
          `${r.product || "—"} ${r.version || ""} · ${r.platform || ""} · ${r.status || ""}`
        )
      );
      ul.appendChild(li);
    }
    root.appendChild(ul);
  }

  root.appendChild(el("h3", { className: "hq-section-title", text: "최근 할 일" }));
  const recentTasks = cache.tasks.slice(0, 5);
  if (!recentTasks.length) root.appendChild(emptyMsg("아직 데이터가 없습니다."));
  else {
    const ul = el("ul", { className: "hq-recent-list" });
    for (const t of recentTasks) {
      const li = el("li");
      li.appendChild(
        document.createTextNode(
          `${t.title || "—"} · ${t.status || ""} · ${t.priority || ""}`
        )
      );
      const b = dueBadge(t.dueDate);
      if (b) {
        li.appendChild(document.createTextNode(" "));
        li.appendChild(b);
      }
      ul.appendChild(li);
    }
    root.appendChild(ul);
  }

  root.appendChild(el("h3", { className: "hq-section-title", text: "최근 문의" }));
  const recentLeads = cache.leads.filter((l) => !l.archived).slice(0, 5);
  if (!recentLeads.length) root.appendChild(emptyMsg("아직 데이터가 없습니다."));
  else {
    const ul = el("ul", { className: "hq-recent-list" });
    for (const l of recentLeads) {
      ul.appendChild(
        el("li", {
          text: `${l.name || "—"} · ${l.company || ""} · ${l.status || ""}`,
        })
      );
    }
    root.appendChild(ul);
  }
}

/* ---------- Tasks ---------- */
function filteredTasks() {
  const f = filters.tasks;
  return cache.tasks.filter((t) => {
    if (f.status && t.status !== f.status) return false;
    if (f.priority && t.priority !== f.priority) return false;
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
  const statusF = select(
    {
      onChange: (e) => {
        filters.tasks.status = e.target.value;
        renderTasks(root);
      },
    },
    [{ value: "", label: "상태 전체" }].concat(TASK_STATUS),
    filters.tasks.status
  );
  const priF = select(
    {
      onChange: (e) => {
        filters.tasks.priority = e.target.value;
        renderTasks(root);
      },
    },
    [{ value: "", label: "우선순위 전체" }].concat(TASK_PRIORITY),
    filters.tasks.priority
  );
  root.appendChild(el("h2", { className: "hq-section-title", text: "Tasks" }));
  root.appendChild(
    toolbar([
      statusF,
      priF,
      btn("+ 새 할 일", { onClick: () => openTaskForm(null) }),
    ])
  );
  const rows = filteredTasks().map((t) => {
    const tr = el("tr");
    const titleTd = el("td");
    titleTd.appendChild(document.createTextNode(t.title || "—"));
    const b = dueBadge(t.dueDate);
    if (b) {
      titleTd.appendChild(document.createTextNode(" "));
      titleTd.appendChild(b);
    }
    tr.appendChild(titleTd);
    tr.appendChild(el("td", { text: t.status || "" }));
    tr.appendChild(el("td", { text: t.priority || "" }));
    tr.appendChild(el("td", { text: t.category || "" }));
    tr.appendChild(el("td", { text: ymd(t.dueDate) || "—" }));
    const actions = el("td", { className: "hq-actions-cell" });
    actions.appendChild(btn("수정", { className: "hq-btn hq-btn--small", onClick: () => openTaskForm(t) }));
    actions.appendChild(
      btn("삭제", {
        className: "hq-btn hq-btn--small hq-btn--ghost",
        onClick: () =>
          confirmDelete("이 할 일을 삭제할까요?", async () => {
            try {
              await deleteDoc(doc(ctx.db, COL.tasks, t.id));
              toast("삭제됨", "ok");
              await refreshAndRender();
            } catch {
              toast("삭제 실패", "err");
            }
          }),
      })
    );
    tr.appendChild(actions);
    return tr;
  });
  root.appendChild(
    table(
      ["제목", "상태", "우선순위", "카테고리", "마감", ""],
      rows,
      "첫 할 일을 추가하세요."
    )
  );
}

/* ---------- Releases ---------- */
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
  root.appendChild(el("h2", { className: "hq-section-title", text: "Releases" }));
  const statusF = select(
    {
      onChange: (e) => {
        filters.releases.status = e.target.value;
        renderReleases(root);
      },
    },
    [{ value: "", label: "상태 전체" }].concat(RELEASE_STATUS),
    filters.releases.status
  );
  const productF = input({
    placeholder: "제품 필터",
    value: filters.releases.product || "",
    onInput: (e) => {
      filters.releases.product = e.target.value;
      renderReleases(root);
    },
  });
  root.appendChild(
    toolbar([
      statusF,
      productF,
      btn("추가", { onClick: () => openReleaseForm(null) }),
    ])
  );
  const rows = filteredReleases().map((r) => {
    const tr = el("tr");
    tr.appendChild(el("td", { text: r.product || "—" }));
    tr.appendChild(el("td", { text: r.version || "" }));
    tr.appendChild(el("td", { text: r.platform || "" }));
    tr.appendChild(el("td", { text: r.status || "" }));
    tr.appendChild(el("td", { text: ymd(r.submittedAt) || "—" }));
    tr.appendChild(el("td", { text: ymd(r.releasedAt) || "—" }));
    const actions = el("td", { className: "hq-actions-cell" });
    actions.appendChild(
      btn("수정", { className: "hq-btn hq-btn--small", onClick: () => openReleaseForm(r) })
    );
    actions.appendChild(
      btn("삭제", {
        className: "hq-btn hq-btn--small hq-btn--ghost",
        onClick: () =>
          confirmDelete("이 릴리즈를 삭제할까요?", async () => {
            try {
              await deleteDoc(doc(ctx.db, COL.releases, r.id));
              toast("삭제됨", "ok");
              await refreshAndRender();
            } catch {
              toast("삭제 실패", "err");
            }
          }),
      })
    );
    tr.appendChild(actions);
    return tr;
  });
  root.appendChild(
    table(
      ["제품", "버전", "플랫폼", "상태", "제출", "출시", ""],
      rows,
      "아직 릴리즈 기록이 없습니다."
    )
  );
}

/* ---------- Leads ---------- */
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
  root.appendChild(el("h2", { className: "hq-section-title", text: "Leads" }));
  const statusF = select(
    {
      onChange: (e) => {
        filters.leads.status = e.target.value;
        renderLeads(root);
      },
    },
    [{ value: "", label: "상태 전체" }].concat(LEAD_STATUS),
    filters.leads.status
  );
  const sourceF = select(
    {
      onChange: (e) => {
        filters.leads.source = e.target.value;
        renderLeads(root);
      },
    },
    [{ value: "", label: "출처 전체" }].concat(LEAD_SOURCE),
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
  root.appendChild(
    toolbar([
      statusF,
      sourceF,
      archF,
      btn("추가", { onClick: () => openLeadForm(null) }),
      btn("CSV", { className: "hq-btn hq-btn--ghost", onClick: exportLeadsCsv }),
    ])
  );
  const rows = filteredLeads().map((l) => {
    const tr = el("tr");
    tr.appendChild(el("td", { text: l.name || "—" }));
    tr.appendChild(el("td", { text: l.company || "" }));
    tr.appendChild(el("td", { text: l.status || "" }));
    tr.appendChild(el("td", { text: l.source || "" }));
    tr.appendChild(
      el("td", {
        text:
          l.amountEstimate != null ? formatKrw(l.amountEstimate) : "—",
      })
    );
    const actions = el("td", { className: "hq-actions-cell" });
    actions.appendChild(
      btn("수정", { className: "hq-btn hq-btn--small", onClick: () => openLeadForm(l) })
    );
    if (!l.archived) {
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
      ["이름", "회사", "상태", "출처", "예상", ""],
      rows,
      "아직 등록된 문의가 없습니다."
    )
  );
}

/* ---------- Finance ---------- */
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
  root.appendChild(el("h2", { className: "hq-section-title", text: "Finance" }));
  if (!filters.finance.month) filters.finance.month = monthKey(new Date());
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
    [{ value: "", label: "유형 전체" }].concat(FINANCE_TYPE),
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
      { value: "active", label: "활성" },
      { value: "archived", label: "보관" },
      { value: "all", label: "전체" },
    ],
    filters.finance.archived
  );
  const list = filteredFinance();
  const totals = financeTotals(list);
  root.appendChild(
    toolbar([
      monthIn,
      typeF,
      archF,
      btn("추가", { onClick: () => openFinanceForm(null) }),
      btn("CSV", { className: "hq-btn hq-btn--ghost", onClick: exportFinanceCsv }),
    ])
  );
  root.appendChild(
    el("div", { className: "hq-cards" }, [
      card("수입", formatKrw(totals.income)),
      card("지출", formatKrw(totals.expense)),
      card("순익", formatKrw(totals.net)),
    ])
  );
  const rows = list.map((f) => {
    const tr = el("tr");
    tr.appendChild(el("td", { text: f.type || "" }));
    tr.appendChild(el("td", { text: f.category || "" }));
    tr.appendChild(el("td", { text: formatKrw(f.amount) }));
    tr.appendChild(el("td", { text: ymd(f.date) || "—" }));
    tr.appendChild(el("td", { text: f.relatedProject || "" }));
    tr.appendChild(el("td", { text: f.memo || "" }));
    const actions = el("td", { className: "hq-actions-cell" });
    actions.appendChild(
      btn("수정", { className: "hq-btn hq-btn--small", onClick: () => openFinanceForm(f) })
    );
    if (!f.archived) {
      actions.appendChild(
        btn("보관", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: withSaving(async () => {
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
          }),
        })
      );
    }
    tr.appendChild(actions);
    return tr;
  });
  root.appendChild(
    table(["유형", "카테고리", "금액", "날짜", "프로젝트", "메모", ""], rows, "이번 달 거래 내역이 없습니다.")
  );
}

/* ---------- Products ---------- */
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
  root.appendChild(el("h2", { className: "hq-section-title", text: "Products" }));
  if (!catalog.length) {
    root.appendChild(emptyMsg("catalog.json 없음 또는 비어 있음"));
    return;
  }
  const statusF = select(
    {
      onChange: (e) => {
        filters.products.status = e.target.value;
        renderProducts(root);
      },
    },
    [{ value: "", label: "상태 전체" }].concat(OPS_STATUS),
    filters.products.status
  );
  root.appendChild(toolbar([statusF]));
  const list = catalog.filter((p) => {
    if (!filters.products.status) return true;
    const meta = metaForSlug(p.slug);
    const st = (meta && meta.opsStatus) || "";
    return st === filters.products.status;
  });
  const rows = list.map((p) => {
    const meta = metaForSlug(p.slug);
    const platforms = Array.isArray(p.platforms)
      ? p.platforms.join(" / ")
      : p.platforms || "—";
    const tr = el("tr");
    tr.appendChild(el("td", { text: p.name || p.slug || "—" }));
    tr.appendChild(el("td", { text: p.type || "—" }));
    tr.appendChild(el("td", { text: platforms || "—" }));
    tr.appendChild(el("td", { text: (meta && meta.currentVersion) || "—" }));
    tr.appendChild(el("td", { text: (meta && meta.opsStatus) || "—" }));
    tr.appendChild(el("td", { text: (meta && meta.notes) || "—" }));
    const actions = el("td", { className: "hq-actions-cell" });
    actions.appendChild(
      btn("메타", {
        className: "hq-btn hq-btn--small",
        onClick: () => openProductMetaForm(p),
      })
    );
    tr.appendChild(actions);
    return tr;
  });
  root.appendChild(
    table(
      ["Product", "Type", "Platform", "Current version", "Ops status", "Notes", ""],
      rows,
      "표시할 제품이 없습니다."
    )
  );
}

/* ---------- Settings ---------- */
function renderSettings(root) {
  clear(root);
  root.appendChild(el("h2", { className: "hq-section-title", text: "Settings" }));
  const u = ctx && ctx.user;
  const projectId =
    (window.NEWON_HQ_FIREBASE &&
      window.NEWON_HQ_FIREBASE.config &&
      window.NEWON_HQ_FIREBASE.config.projectId) ||
    "—";
  const dl = el("dl", { className: "hq-dl" }, [
    el("div", { className: "hq-dl__row" }, [
      el("dt", { className: "hq-dl__label", text: "Display name" }),
      el("dd", { className: "hq-dl__value", text: (u && u.displayName) || "—" }),
    ]),
    el("div", { className: "hq-dl__row" }, [
      el("dt", { className: "hq-dl__label", text: "Email" }),
      el("dd", { className: "hq-dl__value", text: (u && u.email) || "—" }),
    ]),
    el("div", { className: "hq-dl__row" }, [
      el("dt", { className: "hq-dl__label", text: "Project ID" }),
      el("dd", { className: "hq-dl__value", text: projectId }),
    ]),
    el("div", { className: "hq-dl__row" }, [
      el("dt", { className: "hq-dl__label", text: "HQ version" }),
      el("dd", { className: "hq-dl__value", text: HQ_VERSION }),
    ]),
  ]);
  root.appendChild(dl);
  const logout = btn("로그아웃", {
    className: "hq-btn hq-btn--ghost",
    dataset: { hqLogout: "1" },
    onClick: async () => {
      if (ctx && typeof ctx.signOutFn === "function") {
        try {
          await ctx.signOutFn();
        } catch {
          toast("로그아웃 실패", "err");
        }
      }
    },
  });
  root.appendChild(el("div", { className: "hq-actions" }, [logout]));
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
    toast("컨텍스트가 없습니다", "err");
    return;
  }
  bindShell();
  toast("로딩 중…");
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
