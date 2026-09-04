/**
 * Newon HQ Phase 2B / 2D.2 — Documents / Quote / Scope / Requirements / Contract / Invoice / Delivery
 * Installed into hq-app via installHqDocs(api). No Firestore schema migration.
 */

import {
  DOC_TYPES,
  DOC_STATUS,
  INVOICE_PAYMENT_TYPES,
  QUOTE_DISCLAIMER,
  QUOTE_VALID_DAYS_DEFAULT,
  EXTERNAL_COST_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  FEATURE_FLAG_OPTIONS,
  BUDGET_OPTIONS,
  START_OPTIONS,
  REQ_FIELDS,
  LEGACY_REQ_FIELDS,
  SCOPE_FIELDS,
  LEGACY_SCOPE_FIELDS,
  SCOPE_DEFAULTS,
  CONTRACT_FIELDS,
  CONTRACT_DEFAULTS,
  LEGACY_CONTRACT_KEYS,
  DELIVERY_TEMPLATE_GROUPS,
  DEFAULT_DELIVERY_ITEMS,
  MAINTENANCE_DEFAULTS,
  MAINTENANCE_FIELDS,
  CLIENT_FAQ_ITEMS,
  WORKFLOW_HINT,
  LEGAL_DISCLAIMER,
  makeDocNumber,
  addDaysYmd,
  formatFaqBody,
} from "./hq-doc-templates.js";

export { DOC_TYPES, DOC_STATUS };

const YES_NO_UNKNOWN = [
  { value: "", label: "—" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "Unknown", label: "Unknown" },
];

const REQ_SELECT = {
  serviceType: SERVICE_TYPE_OPTIONS,
  budgetRange: BUDGET_OPTIONS,
  preferredStart: START_OPTIONS,
};

const REQ_YN = new Set([
  "hasExistingDesign",
  "hasBrandGuide",
  "hasExistingService",
  "hasExistingCode",
  "hasDomain",
  "hasServer",
  "hasFirebase",
  "needsSourceCode",
  "needsStoreLaunch",
  "needsDomainDeploy",
  "needsMaintenance",
]);

const REQ_SHORT = new Set([
  "clientName",
  "companyName",
  "contactName",
  "email",
  "phone",
  "projectName",
  "oneLiner",
  "targetLaunch",
  "launchPlatforms",
]);

const CONTRACT_DATE = new Set(["startDate", "estimatedDelivery"]);
const CONTRACT_SHORT = new Set([
  "parties",
  "projectName",
  "scopeReference",
  "approvalStatus",
]);

function docTypeLabel(type) {
  const hit = DOC_TYPES.find((t) => t.value === type);
  return (hit && hit.label) || type || "—";
}

function asContent(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : { body: raw };
    } catch {
      return { body: raw };
    }
  }
  return {};
}

function fieldHasContent(val) {
  if (val == null || val === "") return false;
  if (Array.isArray(val)) return val.length > 0;
  return String(val).trim() !== "";
}

function displayFieldVal(val) {
  if (Array.isArray(val)) return val.join(", ");
  return val == null ? "" : String(val);
}

function docNumberFromContent(content) {
  return (
    (content && (content.quoteNumber || content.invoiceNumber || content.docNumber)) ||
    ""
  );
}

function calcQuoteTotals(items, discount, vatRate) {
  const lineItems = (items || []).map((row) => {
    const quantity = Math.max(0, Number(row.quantity) || 0);
    const unitPrice = Math.max(0, Number(row.unitPrice) || 0);
    return {
      service: String(row.service || ""),
      description: String(row.description || ""),
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
    };
  });
  const subtotal = lineItems.reduce((s, r) => s + r.amount, 0);
  const disc = Math.max(0, Number(discount) || 0);
  const base = Math.max(0, subtotal - disc);
  const vat = Math.round(base * (Number(vatRate) || 0));
  return { lineItems, subtotal, discount: disc, vat, total: base + vat };
}

export function installHqDocs(api) {
  const {
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
    getCache,
    getCtx,
    projectById,
    projectOptions,
    serviceTypeLabel,
    getServiceTypes,
    getPricing,
    getQuotePackages,
    refreshAndRender,
    showPanel,
    formatLongDate,
    openFinanceForm,
    clientById,
    companyById,
    openCrmDetail,
  } = api;

  let documentDetailId = null;
  let filters = {
    status: "",
    type: "",
    projectId: "",
    q: "",
    archived: "active",
  };

  function cache() {
    return getCache();
  }
  function ctx() {
    return getCtx();
  }

  function docsList() {
    return cache().documents || [];
  }

  function docById(id) {
    return docsList().find((d) => d.id === id) || null;
  }

  function docsForProject(projectId) {
    return docsList().filter((d) => !d.archived && d.projectId === projectId);
  }

  function hasDocType(projectId, type) {
    return docsForProject(projectId).some((d) => d.type === type);
  }

  function quotePackages() {
    if (typeof getQuotePackages === "function") {
      const list = getQuotePackages();
      return Array.isArray(list) ? list : [];
    }
    return [];
  }

  function projectProgress(project) {
    const pid = project.id;
    const checklist = Array.isArray(project.deliveryChecklist)
      ? project.deliveryChecklist
      : [];
    const deliveryDone =
      checklist.length > 0 && checklist.every((i) => i && i.done);
    const paidInvoice = docsForProject(pid).some(
      (d) => d.type === "invoice" && d.status === "completed"
    );
    const signedContract = docsForProject(pid).some(
      (d) =>
        d.type === "contract" &&
        (d.status === "signed" || d.status === "completed")
    );
    const steps = [
      { key: "lead", label: "Lead", done: !!project.leadId },
      { key: "project", label: "Project", done: true },
      {
        key: "requirements",
        label: "Requirements",
        done: hasDocType(pid, "requirements"),
      },
      { key: "quote", label: "Quote", done: hasDocType(pid, "quote") },
      { key: "scope", label: "Scope", done: hasDocType(pid, "scope") },
      {
        key: "contract",
        label: "Contract",
        done: signedContract || hasDocType(pid, "contract"),
      },
      {
        key: "development",
        label: "Development",
        done: ["active", "review", "completed"].includes(project.status),
        current: project.status === "active",
      },
      {
        key: "delivery",
        label: "Delivery",
        done: deliveryDone || hasDocType(pid, "delivery"),
      },
      { key: "payment", label: "Payment", done: paidInvoice },
    ];
    return steps;
  }

  function renderProgressStrip(project) {
    const steps = projectProgress(project);
    const wrap = el("div", { className: "hq-progress" });
    steps.forEach((s, i) => {
      const mark = s.done ? "✓" : s.current ? "●" : "○";
      const node = el("div", {
        className:
          "hq-progress__step" +
          (s.done ? " is-done" : "") +
          (s.current ? " is-current" : ""),
      });
      node.appendChild(
        el("span", { className: "hq-progress__mark", text: mark })
      );
      node.appendChild(
        el("span", { className: "hq-progress__label", text: s.label })
      );
      wrap.appendChild(node);
      if (i < steps.length - 1) {
        wrap.appendChild(
          el("span", { className: "hq-progress__sep", text: "→" })
        );
      }
    });
    return wrap;
  }

  /** Saved checklist only — never auto-write DEFAULT_DELIVERY_ITEMS to Firestore. */
  function ensureDeliveryChecklist(project) {
    if (
      Array.isArray(project.deliveryChecklist) &&
      project.deliveryChecklist.length
    ) {
      return project.deliveryChecklist.map((i, idx) => ({
        id: i.id || "item-" + idx,
        label: i.label || String(i),
        done: !!i.done,
      }));
    }
    return [];
  }

  async function saveDocument(item, payload) {
    const db = ctx().db;
    if (item && item.id) {
      await updateDoc(doc(db, COL.documents, item.id), payload);
      return item.id;
    }
    const ref = await addDoc(collection(db, COL.documents), {
      ...payload,
      archived: false,
      createdAt: serverTimestamp(),
      createdBy: uid(),
    });
    return ref.id;
  }

  function makeFeatureFlagsControl(selected) {
    const selectedSet = new Set(
      Array.isArray(selected)
        ? selected
        : String(selected || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
    );
    const wrap = el("div", {
      className: "hq-check-grid",
      style:
        "display:flex;flex-wrap:wrap;gap:0.35rem 0.85rem;padding:0.25rem 0",
    });
    const boxes = [];
    FEATURE_FLAG_OPTIONS.forEach((opt) => {
      const lab = el("label", {
        style: "display:inline-flex;align-items:center;gap:0.3rem;font-size:0.85rem",
      });
      const cb = input({ type: "checkbox", checked: selectedSet.has(opt) });
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(opt));
      wrap.appendChild(lab);
      boxes.push({ opt, cb });
    });
    return {
      el: wrap,
      getValue() {
        return boxes.filter((b) => b.cb.checked).map((b) => b.opt);
      },
    };
  }

  function makeExternalCostsControl(current) {
    const selectedSet = new Set(
      String(current || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    const wrap = el("div", {
      style:
        "display:flex;flex-wrap:wrap;gap:0.35rem 0.85rem;padding:0.25rem 0",
    });
    const boxes = [];
    EXTERNAL_COST_OPTIONS.forEach((opt) => {
      const lab = el("label", {
        style: "display:inline-flex;align-items:center;gap:0.3rem;font-size:0.85rem",
      });
      const cb = input({ type: "checkbox", checked: selectedSet.has(opt) });
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(opt));
      wrap.appendChild(lab);
      boxes.push({ opt, cb });
    });
    return {
      el: wrap,
      getValue() {
        return boxes
          .filter((b) => b.cb.checked)
          .map((b) => b.opt)
          .join(", ");
      },
    };
  }

  function openGenericDocForm(item, opts) {
    opts = opts || {};
    const project =
      opts.project || (item && item.projectId && projectById(item.projectId));
    const type = (item && item.type) || opts.type || "other";
    const isEdit = !!item;
    const content = asContent(item && item.content);

    const titleIn = input({
      value:
        (item && item.title) ||
        (project
          ? `${project.name || "Project"} — ${docTypeLabel(type)}`
          : ""),
      required: true,
    });
    const typeIn = select(
      {},
      DOC_TYPES.map((t) => ({ value: t.value, label: t.label })),
      type
    );
    if (opts.lockType) typeIn.disabled = true;
    const statusIn = select({}, DOC_STATUS, (item && item.status) || "draft");
    const versionIn = input({ value: (item && item.version) || "1.0" });
    const projectIn = projectOptions(
      (item && item.projectId) || (project && project.id) || ""
    );

    let clientPrefill =
      (item && item.clientName) || (project && project.clientName) || "";
    let companyPrefill =
      (item && item.company) || (project && project.company) || "";
    if (!isEdit && type === "requirements" && project) {
      clientPrefill = project.clientName || clientPrefill;
      companyPrefill = project.company || companyPrefill;
    }

    const clientIn = input({ value: clientPrefill });
    const companyIn = input({ value: companyPrefill });
    const notesIn = textarea({});
    notesIn.value = (item && item.internalNotes) || "";

    const fields = [
      fieldRow("Title *", titleIn),
      fieldRow("Type", typeIn),
      fieldRow("Status", statusIn),
      fieldRow("Version", versionIn),
      fieldRow("Project", projectIn),
      fieldRow("Client", clientIn),
      fieldRow("Company", companyIn),
    ];

    let contentCollectors = () => ({ body: "" });

    if (type === "meeting" || type === "other" || type === "delivery") {
      const bodyIn = textarea({});
      bodyIn.value = content.body || "";
      bodyIn.rows = 8;
      fields.push(fieldRow("Content", bodyIn));
      contentCollectors = () => ({ body: bodyIn.value.trim() });
    } else if (type === "faq") {
      const bodyIn = textarea({});
      bodyIn.rows = 14;
      bodyIn.value =
        content.body ||
        (!isEdit ? formatFaqBody(CLIENT_FAQ_ITEMS) : "");
      fields.push(fieldRow("FAQ body", bodyIn));
      contentCollectors = () => ({ body: bodyIn.value.trim() });
    } else if (type === "maintenance") {
      const map = {};
      for (const [key, label] of MAINTENANCE_FIELDS) {
        const ta = textarea({});
        ta.rows = key === "notes" ? 3 : 5;
        ta.value =
          content[key] != null && content[key] !== ""
            ? content[key]
            : !isEdit
              ? MAINTENANCE_DEFAULTS[key] || ""
              : "";
        fields.push(fieldRow(label, ta));
        map[key] = ta;
      }
      contentCollectors = () => {
        const out = {};
        for (const [key] of MAINTENANCE_FIELDS) {
          out[key] = map[key].value.trim();
        }
        return out;
      };
    } else if (type === "scope") {
      const map = {};
      for (const [key, label] of SCOPE_FIELDS) {
        const ta = textarea({});
        ta.rows = 4;
        ta.value =
          content[key] != null && content[key] !== ""
            ? content[key]
            : !isEdit
              ? SCOPE_DEFAULTS[key] || ""
              : "";
        fields.push(fieldRow(label, ta));
        map[key] = ta;
      }
      contentCollectors = () => {
        const out = {};
        for (const [key] of SCOPE_FIELDS) out[key] = map[key].value.trim();
        return out;
      };
    } else if (type === "requirements") {
      const map = {};
      let featureFlagsCtrl = null;
      for (const [key, label] of REQ_FIELDS) {
        if (key === "featureFlags") {
          featureFlagsCtrl = makeFeatureFlagsControl(content.featureFlags);
          fields.push(fieldRow(label, featureFlagsCtrl.el));
          map[key] = featureFlagsCtrl;
          continue;
        }
        if (REQ_SELECT[key]) {
          const optsList = [{ value: "", label: "—" }].concat(
            REQ_SELECT[key].map((v) => ({ value: v, label: v }))
          );
          let pref = content[key] || "";
          if (!isEdit && key === "serviceType" && project && project.serviceType) {
            const st = serviceTypeLabel(project.serviceType) || project.serviceType;
            if (REQ_SELECT.serviceType.includes(st)) pref = st;
            else if (REQ_SELECT.serviceType.includes(project.serviceType)) {
              pref = project.serviceType;
            }
          }
          const sel = select({}, optsList, pref);
          fields.push(fieldRow(label, sel));
          map[key] = sel;
          continue;
        }
        if (REQ_YN.has(key)) {
          const sel = select({}, YES_NO_UNKNOWN, content[key] || "");
          fields.push(fieldRow(label, sel));
          map[key] = sel;
          continue;
        }
        if (REQ_SHORT.has(key)) {
          let val = content[key] || "";
          if (!isEdit && project) {
            if (key === "clientName" && !val) val = project.clientName || "";
            if (key === "companyName" && !val) val = project.company || "";
            if (key === "projectName" && !val) val = project.name || "";
          }
          const inp = input({ value: val });
          fields.push(fieldRow(label, inp));
          map[key] = inp;
          continue;
        }
        const ta = textarea({});
        ta.rows = 3;
        ta.value = content[key] || "";
        fields.push(fieldRow(label, ta));
        map[key] = ta;
      }
      contentCollectors = () => {
        const out = {};
        for (const [key] of REQ_FIELDS) {
          if (key === "featureFlags") {
            out.featureFlags = featureFlagsCtrl
              ? featureFlagsCtrl.getValue()
              : [];
            continue;
          }
          const ctrl = map[key];
          out[key] = ctrl && ctrl.value != null ? String(ctrl.value).trim() : "";
        }
        return out;
      };
    } else if (type === "contract") {
      const map = {};
      let externalCtrl = null;
      for (const [key, label] of CONTRACT_FIELDS) {
        if (key === "externalCosts") {
          const initial =
            content.externalCosts != null && content.externalCosts !== ""
              ? content.externalCosts
              : !isEdit
                ? CONTRACT_DEFAULTS.externalCosts || ""
                : "";
          externalCtrl = makeExternalCostsControl(initial);
          const free = textarea({});
          free.rows = 2;
          free.value = typeof initial === "string" ? initial : "";
          free.placeholder = "Or edit free-text (saved as string)";
          const wrap = el("div", null, [externalCtrl.el, free]);
          fields.push(fieldRow(label, wrap));
          map[key] = { free, externalCtrl };
          continue;
        }
        if (key === "contractAmount") {
          const amountIn = input({
            type: "number",
            min: "0",
            value:
              content.contractAmount != null
                ? String(content.contractAmount)
                : !isEdit
                  ? String((project && project.budget) || 0)
                  : "0",
          });
          fields.push(fieldRow(label, amountIn));
          map[key] = amountIn;
          continue;
        }
        if (CONTRACT_DATE.has(key)) {
          let dateVal = content[key] || "";
          if (!isEdit && !dateVal) {
            if (key === "startDate") {
              dateVal = ymd(project && project.startDate) || "";
            }
            if (key === "estimatedDelivery") {
              dateVal =
                ymd(project && project.targetDate) ||
                content.endDate ||
                "";
            }
          }
          const dateIn = input({ type: "date", value: dateVal });
          fields.push(fieldRow(label, dateIn));
          map[key] = dateIn;
          continue;
        }
        const isShort = CONTRACT_SHORT.has(key);
        const ctrl = isShort ? input({}) : textarea({});
        if (!isShort) ctrl.rows = 3;
        const def = !isEdit ? CONTRACT_DEFAULTS[key] || "" : "";
        ctrl.value =
          content[key] != null && content[key] !== ""
            ? content[key]
            : def;
        if (!isEdit && key === "projectName" && !ctrl.value && project) {
          ctrl.value = project.name || "";
        }
        if (!isEdit && key === "parties" && !ctrl.value) {
          const partyBits = [
            "Newon",
            clientPrefill || (project && project.clientName) || "",
            companyPrefill || (project && project.company) || "",
          ].filter(Boolean);
          ctrl.value = partyBits.join(" / ");
        }
        fields.push(fieldRow(label, ctrl));
        map[key] = ctrl;
      }
      // Preserve visibility of legacy fields when editing older docs
      if (isEdit) {
        for (const key of LEGACY_CONTRACT_KEYS) {
          if (!fieldHasContent(content[key])) continue;
          if (key === "paymentTerms" || key === "endDate" || key === "client") {
            const legacyIn =
              key === "endDate"
                ? input({ type: "date", value: content[key] || "" })
                : textarea({});
            if (key !== "endDate") {
              legacyIn.value = content[key] || "";
              legacyIn.rows = 3;
            }
            fields.push(fieldRow(`(Legacy) ${key}`, legacyIn));
            map["__legacy_" + key] = legacyIn;
          }
        }
      }
      fields.push(
        el("p", {
          className: "hq-row__meta",
          style: "font-size:0.78rem;opacity:0.85;padding:0.25rem 0",
          text: LEGAL_DISCLAIMER,
        })
      );
      contentCollectors = () => {
        const out = {};
        for (const [key] of CONTRACT_FIELDS) {
          if (key === "externalCosts") {
            const fromChecks =
              map.externalCosts && map.externalCosts.externalCtrl
                ? map.externalCosts.externalCtrl.getValue()
                : "";
            const free =
              map.externalCosts && map.externalCosts.free
                ? map.externalCosts.free.value.trim()
                : "";
            // Prefer free-text if user edited it; else checkbox selection
            out.externalCosts = free || fromChecks;
            continue;
          }
          if (key === "contractAmount") {
            out.contractAmount = Math.max(
              0,
              Number(map.contractAmount.value) || 0
            );
            continue;
          }
          const ctrl = map[key];
          out[key] =
            ctrl && ctrl.value != null ? String(ctrl.value).trim() : "";
        }
        // Keep legacy keys if present on edit so we don't drop them
        if (isEdit) {
          for (const key of LEGACY_CONTRACT_KEYS) {
            const legacyCtrl = map["__legacy_" + key];
            if (legacyCtrl) {
              out[key] =
                key === "endDate"
                  ? legacyCtrl.value || null
                  : legacyCtrl.value.trim();
            } else if (fieldHasContent(content[key])) {
              out[key] = content[key];
            }
          }
        }
        return out;
      };
    } else if (type === "invoice") {
      const numIn = input({
        value: content.invoiceNumber || (!isEdit ? makeDocNumber("I") : ""),
      });
      const issueIn = input({
        type: "date",
        value: content.issueDate || ymd(new Date()),
      });
      const dueIn = input({ type: "date", value: content.dueDate || "" });
      const descIn = textarea({});
      descIn.rows = 2;
      descIn.value = content.description || "";
      const subIn = input({
        type: "number",
        min: "0",
        value:
          content.subtotal != null
            ? String(content.subtotal)
            : "0",
      });
      const taxIn = input({
        type: "number",
        min: "0",
        value: content.tax != null ? String(content.tax) : "0",
      });
      const totalEl = el("p", { className: "hq-row__meta" });
      function syncInvoiceTotal() {
        const subtotal = Math.max(0, Number(subIn.value) || 0);
        const tax = Math.max(0, Number(taxIn.value) || 0);
        totalEl.textContent = `Total (auto): ${formatKrw(subtotal + tax)}`;
      }
      subIn.addEventListener("input", syncInvoiceTotal);
      taxIn.addEventListener("input", syncInvoiceTotal);
      syncInvoiceTotal();
      const payTypeIn = select(
        {},
        INVOICE_PAYMENT_TYPES.map((t) => ({
          value: t.value,
          label: t.label,
        })),
        content.paymentType || "deposit"
      );
      const paidIn = input({ type: "date", value: content.paidAt || "" });
      const iNotes = textarea({});
      iNotes.value = content.notes || "";
      const depositBtn = btn("Fill deposit 50% of contract/budget", {
        className: "hq-btn hq-btn--small hq-btn--ghost",
        type: "button",
        onClick: (e) => {
          e.preventDefault();
          const base =
            Number(project && project.budget) ||
            0;
          if (!base) {
            toast("No project budget available", "err");
            return;
          }
          const half = Math.round(base * 0.5);
          if (
            !window.confirm(
              `Set subtotal to deposit 50% (${formatKrw(half)}) of budget ${formatKrw(base)}?`
            )
          ) {
            return;
          }
          subIn.value = String(half);
          payTypeIn.value = "deposit";
          syncInvoiceTotal();
        },
      });
      fields.push(
        fieldRow("Invoice number", numIn),
        fieldRow("Issue date", issueIn),
        fieldRow("Due date", dueIn),
        fieldRow("Description", descIn),
        fieldRow("Subtotal", subIn),
        fieldRow("Tax / VAT", taxIn),
        totalEl,
        fieldRow("Payment type", payTypeIn),
        fieldRow("Paid at", paidIn),
        fieldRow("Notes", iNotes),
        depositBtn
      );
      contentCollectors = () => {
        const subtotal = Math.max(0, Number(subIn.value) || 0);
        const tax = Math.max(0, Number(taxIn.value) || 0);
        return {
          invoiceNumber: numIn.value.trim(),
          issueDate: issueIn.value || null,
          dueDate: dueIn.value || null,
          description: descIn.value.trim(),
          subtotal,
          tax,
          total: subtotal + tax,
          paymentType: payTypeIn.value || "other",
          paidAt: paidIn.value || null,
          notes: iNotes.value.trim(),
          client: clientIn.value.trim(),
        };
      };
    }

    fields.push(fieldRow("Internal notes", notesIn));
    const form = el("form", { className: "hq-form" }, fields);
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
        const title = titleIn.value.trim();
        if (!title) {
          toast("Title required", "err");
          return;
        }
        if (!DOC_STATUS.includes(statusIn.value)) {
          toast("Invalid status", "err");
          return;
        }
        const t = typeIn.value;
        if (!DOC_TYPES.some((x) => x.value === t)) {
          toast("Invalid type", "err");
          return;
        }
        const linkedProj = projectById(projectIn.value) || project;
        const payload = {
          title,
          type: t,
          status: statusIn.value,
          version: versionIn.value.trim() || "1.0",
          projectId: projectIn.value || null,
          leadId: (linkedProj && linkedProj.leadId) || null,
          clientId:
            (item && item.clientId) ||
            (linkedProj && linkedProj.clientId) ||
            null,
          companyId:
            (item && item.companyId) ||
            (linkedProj && linkedProj.companyId) ||
            null,
          clientName: clientIn.value.trim(),
          company: companyIn.value.trim(),
          content: contentCollectors(),
          internalNotes: notesIn.value.trim(),
          archived: !!(item && item.archived),
          updatedAt: serverTimestamp(),
          updatedBy: uid(),
        };
        try {
          const id = await saveDocument(item, payload);
          closeModal();
          toast("Saved", "ok");
          documentDetailId = id;
          await refreshAndRender();
          showPanel("documents");
        } catch {
          toast("Save failed", "err");
        }
      })
    );
    openModal(isEdit ? "Edit Document" : "New Document", form, [
      cancelBtn,
      saveBtn,
    ]);
    const modal = document.getElementById("hq-modal");
    if (modal) modal.classList.add("hq-modal--wide");
  }

  function openQuoteBuilder(item, opts) {
    opts = opts || {};
    const project =
      opts.project || (item && item.projectId && projectById(item.projectId));
    const isEdit = !!item;
    const content = asContent(item && item.content);
    const pricing = getPricing() || {};
    const services = getServiceTypes() || [];
    const packages = quotePackages();

    const titleIn = input({
      value:
        (item && item.title) ||
        (project ? `${project.name || "Project"} — Quote` : "Quote"),
    });
    const statusIn = select({}, DOC_STATUS, (item && item.status) || "draft");
    const versionIn = input({ value: (item && item.version) || "1.0" });
    const projectIn = projectOptions(
      (item && item.projectId) || (project && project.id) || ""
    );
    const clientIn = input({
      value:
        (item && item.clientName) || (project && project.clientName) || "",
    });
    const companyIn = input({
      value: (item && item.company) || (project && project.company) || "",
    });

    const quoteNumIn = input({
      value: content.quoteNumber || (!isEdit ? makeDocNumber("Q") : ""),
    });
    const issueIn = input({
      type: "date",
      value: content.issueDate || ymd(new Date()),
    });
    const validIn = input({
      type: "date",
      value:
        content.validUntil ||
        (!isEdit
          ? addDaysYmd(
              content.issueDate || ymd(new Date()),
              QUOTE_VALID_DAYS_DEFAULT
            )
          : ""),
    });
    issueIn.addEventListener("change", () => {
      if (!isEdit || !content.validUntil) {
        if (issueIn.value) {
          validIn.value = addDaysYmd(issueIn.value, QUOTE_VALID_DAYS_DEFAULT);
        }
      }
    });

    const summaryService = input({
      value:
        (content.projectSummary && content.projectSummary.service) ||
        (project &&
          (serviceTypeLabel(project.serviceType) || project.serviceType)) ||
        "",
    });
    const summaryDesc = textarea({});
    summaryDesc.rows = 2;
    summaryDesc.value =
      (content.projectSummary && content.projectSummary.description) ||
      (project && project.description) ||
      "";
    const summaryTimeline = input({
      value:
        (content.projectSummary && content.projectSummary.estimatedTimeline) ||
        "",
    });

    const discountIn = input({
      type: "number",
      min: "0",
      value: content.discount != null ? String(content.discount) : "0",
    });
    const vatIn = input({
      type: "number",
      min: "0",
      step: "0.01",
      value: content.vatRate != null ? String(content.vatRate) : "0.1",
    });
    const disclaimerIn = textarea({});
    disclaimerIn.rows = 3;
    disclaimerIn.value = content.disclaimer || QUOTE_DISCLAIMER;
    const notesIn = textarea({});
    notesIn.value = (item && item.internalNotes) || "";

    const linesWrap = el("div", { className: "hq-quote-lines" });
    let lines =
      Array.isArray(content.lineItems) && content.lineItems.length
        ? content.lineItems.map((r) => ({ ...r }))
        : [
            {
              service: (project && project.serviceType) || "",
              description:
                serviceTypeLabel((project && project.serviceType) || "") || "",
              quantity: 1,
              unitPrice:
                (project &&
                  project.serviceType &&
                  pricing[project.serviceType] &&
                  pricing[project.serviceType].amount) ||
                Number(project && project.budget) ||
                0,
            },
          ];
    let selectedLineIdx = 0;

    const totalsEl = el("p", { className: "hq-row__meta" });

    function syncTotals() {
      const t = calcQuoteTotals(
        lines.map((row, i) => {
          const q = linesWrap.querySelector(`[data-q="${i}"]`);
          const u = linesWrap.querySelector(`[data-u="${i}"]`);
          return {
            ...row,
            quantity: q ? q.value : row.quantity,
            unitPrice: u ? u.value : row.unitPrice,
            service:
              (linesWrap.querySelector(`[data-s="${i}"]`) || {}).value ||
              row.service,
            description:
              (linesWrap.querySelector(`[data-d="${i}"]`) || {}).value ||
              row.description,
          };
        }),
        discountIn.value,
        vatIn.value
      );
      totalsEl.textContent = `Subtotal ${formatKrw(t.subtotal)} · Discount ${formatKrw(
        t.discount
      )} · VAT ${formatKrw(t.vat)} · Total ${formatKrw(t.total)}`;
      return t;
    }

    function renderLines() {
      clear(linesWrap);
      lines.forEach((row, i) => {
        const block = el("div", {
          className:
            "hq-quote-line" + (i === selectedLineIdx ? " is-selected" : ""),
          style: i === selectedLineIdx ? "outline:1px solid #888" : "",
        });
        block.addEventListener("click", () => {
          selectedLineIdx = i;
          renderLines();
        });
        const svc = select(
          { "data-s": String(i), onChange: syncTotals },
          [{ value: "", label: "Service" }].concat(
            services.map((s) =>
              typeof s === "string" ? { value: s, label: s } : s
            )
          ),
          row.service || ""
        );
        svc.setAttribute("data-s", String(i));
        const desc = input({ value: row.description || "" });
        desc.setAttribute("data-d", String(i));
        const qty = input({
          type: "number",
          min: "0",
          step: "1",
          value: String(row.quantity != null ? row.quantity : 1),
          onInput: syncTotals,
        });
        qty.setAttribute("data-q", String(i));
        const unit = input({
          type: "number",
          min: "0",
          step: "1",
          value: String(row.unitPrice != null ? row.unitPrice : 0),
          onInput: syncTotals,
        });
        unit.setAttribute("data-u", String(i));
        svc.addEventListener("change", () => {
          const slug = svc.value;
          if (pricing[slug] && pricing[slug].amount != null) {
            unit.value = String(pricing[slug].amount);
          }
          if (!desc.value && slug) desc.value = serviceTypeLabel(slug);
          syncTotals();
        });
        block.appendChild(fieldRow("Service", svc));
        block.appendChild(fieldRow("Description", desc));
        block.appendChild(fieldRow("Qty", qty));
        block.appendChild(fieldRow("Unit price", unit));
        block.appendChild(
          btn("Remove", {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: (e) => {
              e.stopPropagation();
              lines.splice(i, 1);
              if (!lines.length) {
                lines.push({
                  service: "",
                  description: "",
                  quantity: 1,
                  unitPrice: 0,
                });
              }
              if (selectedLineIdx >= lines.length) {
                selectedLineIdx = lines.length - 1;
              }
              renderLines();
              syncTotals();
            },
          })
        );
        linesWrap.appendChild(block);
      });
      syncTotals();
    }

    renderLines();
    discountIn.addEventListener("input", syncTotals);
    vatIn.addEventListener("input", syncTotals);

    // Package picker — apply only on button click
    const pkgGroups = {};
    packages.forEach((p) => {
      const g = p.group || p.category || "Other";
      if (!pkgGroups[g]) pkgGroups[g] = [];
      pkgGroups[g].push(p);
    });
    const pkgOpts = [{ value: "", label: "Select package…" }];
    Object.keys(pkgGroups)
      .sort()
      .forEach((g) => {
        pkgOpts.push({ value: `__g:${g}`, label: `── ${g} ──`, disabled: true });
        pkgGroups[g].forEach((p, idx) => {
          const id = p.id || `${g}:${idx}:${p.label || p.name || ""}`;
          pkgOpts.push({
            value: id,
            label: `${p.label || p.name || "Package"}${
              p.amount != null ? " · " + formatKrw(p.amount) : ""
            }`,
          });
        });
      });
    const pkgById = {};
    packages.forEach((p, idx) => {
      const g = p.group || p.category || "Other";
      const id = p.id || `${g}:${idx}:${p.label || p.name || ""}`;
      pkgById[id] = p;
    });
    const pkgSelect = select({}, pkgOpts, "");
    // Remove disabled group headers if select helper doesn't support disabled
    Array.from(pkgSelect.options || []).forEach((opt) => {
      if (String(opt.value).startsWith("__g:")) opt.disabled = true;
    });
    const applyPkgBtn = btn("Apply package to line", {
      className: "hq-btn hq-btn--small",
      type: "button",
      onClick: (e) => {
        e.preventDefault();
        const id = pkgSelect.value;
        if (!id || String(id).startsWith("__g:")) {
          toast("Select a package first", "err");
          return;
        }
        const pkg = pkgById[id];
        if (!pkg) {
          toast("Package not found", "err");
          return;
        }
        const target =
          lines[selectedLineIdx] ||
          lines[lines.length - 1] ||
          null;
        const payload = {
          service: pkg.serviceSlug || pkg.service || "",
          description: pkg.label || pkg.name || pkg.description || "",
          quantity: 1,
          unitPrice: Number(pkg.amount) || 0,
        };
        if (target && !(target.description || target.service || target.unitPrice)) {
          Object.assign(target, payload);
        } else if (
          target &&
          window.confirm("Overwrite selected line with package?")
        ) {
          Object.assign(target, payload);
        } else {
          lines.push(payload);
          selectedLineIdx = lines.length - 1;
        }
        renderLines();
        syncTotals();
      },
    });

    const form = el("form", { className: "hq-form" }, [
      fieldRow("Title *", titleIn),
      fieldRow("Status", statusIn),
      fieldRow("Version", versionIn),
      fieldRow("Project", projectIn),
      fieldRow("Client", clientIn),
      fieldRow("Company", companyIn),
      fieldRow("Quote number", quoteNumIn),
      fieldRow("Issue date", issueIn),
      fieldRow("Valid until", validIn),
      el("p", {
        className: "hq-summary-pill__label",
        text: "Project summary",
      }),
      fieldRow("Service", summaryService),
      fieldRow("Description", summaryDesc),
      fieldRow("Estimated timeline", summaryTimeline),
      el("p", { className: "hq-summary-pill__label", text: "Package" }),
      fieldRow("Quote package", pkgSelect),
      applyPkgBtn,
      el("p", { className: "hq-summary-pill__label", text: "Line items" }),
      linesWrap,
      btn("+ Line", {
        className: "hq-btn hq-btn--small hq-btn--ghost",
        onClick: () => {
          lines.push({
            service: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
          });
          selectedLineIdx = lines.length - 1;
          renderLines();
        },
      }),
      fieldRow("Discount (KRW)", discountIn),
      fieldRow("VAT rate (e.g. 0.1)", vatIn),
      totalsEl,
      fieldRow("Disclaimer", disclaimerIn),
      fieldRow("Internal notes", notesIn),
    ]);

    const saveBtn = btn(isEdit ? "Save Quote" : "Create Quote", {
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
        const title = titleIn.value.trim();
        if (!title) {
          toast("Title required", "err");
          return;
        }
        const collected = [];
        lines.forEach((row, i) => {
          collected.push({
            service:
              (linesWrap.querySelector(`[data-s="${i}"]`) || {}).value || "",
            description:
              (linesWrap.querySelector(`[data-d="${i}"]`) || {}).value || "",
            quantity:
              (linesWrap.querySelector(`[data-q="${i}"]`) || {}).value || 0,
            unitPrice:
              (linesWrap.querySelector(`[data-u="${i}"]`) || {}).value || 0,
          });
        });
        const totals = calcQuoteTotals(
          collected,
          discountIn.value,
          vatIn.value
        );
        if (!totals.lineItems.length || totals.total < 0) {
          toast("Invalid quote lines", "err");
          return;
        }
        const linkedProj = projectById(projectIn.value) || project;
        const payload = {
          title,
          type: "quote",
          status: statusIn.value,
          version: versionIn.value.trim() || "1.0",
          projectId: projectIn.value || null,
          leadId: (linkedProj && linkedProj.leadId) || null,
          clientId:
            (item && item.clientId) ||
            (linkedProj && linkedProj.clientId) ||
            null,
          companyId:
            (item && item.companyId) ||
            (linkedProj && linkedProj.companyId) ||
            null,
          clientName: clientIn.value.trim(),
          company: companyIn.value.trim(),
          content: {
            quoteNumber: quoteNumIn.value.trim(),
            issueDate: issueIn.value || null,
            validUntil: validIn.value || null,
            projectSummary: {
              service: summaryService.value.trim(),
              description: summaryDesc.value.trim(),
              estimatedTimeline: summaryTimeline.value.trim(),
            },
            currency: "KRW",
            lineItems: totals.lineItems,
            discount: totals.discount,
            vatRate: Number(vatIn.value) || 0,
            subtotal: totals.subtotal,
            vat: totals.vat,
            total: totals.total,
            disclaimer: disclaimerIn.value.trim() || QUOTE_DISCLAIMER,
          },
          internalNotes: notesIn.value.trim(),
          archived: !!(item && item.archived),
          updatedAt: serverTimestamp(),
          updatedBy: uid(),
        };
        try {
          const id = await saveDocument(item, payload);
          closeModal();
          toast("Quote saved", "ok");
          documentDetailId = id;
          await refreshAndRender();
          showPanel("documents");
        } catch {
          toast("Save failed", "err");
        }
      })
    );

    openModal(isEdit ? "Edit Quote" : "Create Quote", form, [
      cancelBtn,
      saveBtn,
    ]);
    const modal = document.getElementById("hq-modal");
    if (modal) modal.classList.add("hq-modal--wide");
  }

  function openDocCreator(type, project) {
    if (type === "quote") openQuoteBuilder(null, { project });
    else openGenericDocForm(null, { type, project, lockType: true });
  }

  function relatedDocuments(d) {
    return docsList().filter((x) => {
      if (!x || x.id === d.id || x.archived) return false;
      if (d.projectId && x.projectId === d.projectId) return true;
      if (d.leadId && x.leadId === d.leadId) return true;
      if (d.clientId && x.clientId === d.clientId) return true;
      return false;
    });
  }

  function renderContentFieldBlocks(contentKids, fieldList, content, skipEmpty) {
    (fieldList || []).forEach(([key, label]) => {
      const val = content[key];
      if (skipEmpty && !fieldHasContent(val)) return;
      contentKids.push(
        el("div", { style: "padding:0.55rem 1.05rem" }, [
          el("p", { className: "hq-summary-pill__label", text: label }),
          el("p", {
            className: "hq-row__meta",
            style: "white-space:pre-wrap",
            text: fieldHasContent(val) ? displayFieldVal(val) : "—",
          }),
        ])
      );
    });
  }

  function printDocument(d) {
    const content = asContent(d.content);
    const project = d.projectId ? projectById(d.projectId) : null;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) {
      toast("Allow popups to print", "err");
      return;
    }
    const docEl = w.document;
    docEl.open();
    docEl.write(
      "<!DOCTYPE html><html><head><meta charset='utf-8'><title></title>" +
        "<style>" +
        "@page{size:A4;margin:18mm 16mm}" +
        "body{font-family:Georgia,'Times New Roman',serif;padding:0;color:#111;max-width:100%;margin:0;line-height:1.45}" +
        ".brand{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#444;margin:0 0 4px}" +
        "h1{font-size:22px;margin:0 0 4px;font-weight:700}" +
        "h2{font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin:22px 0 8px;color:#555;border-bottom:1px solid #ddd;padding-bottom:4px}" +
        ".meta{color:#555;font-size:12px;margin:0 0 3px}" +
        "table{width:100%;border-collapse:collapse;margin-top:10px}" +
        "th,td{border-bottom:1px solid #ddd;padding:7px 6px;text-align:left;font-size:12px}" +
        "th{color:#555;font-size:10px;text-transform:uppercase}" +
        ".total{font-weight:700;font-size:15px;margin-top:12px}" +
        "pre{white-space:pre-wrap;font-family:inherit;font-size:12px;line-height:1.5;margin:0}" +
        ".disclaimer,.legal{font-size:10px;color:#666;margin-top:28px;border-top:1px solid #ddd;padding-top:10px}" +
        ".type-title{font-size:13px;color:#333;margin:0 0 16px}" +
        "</style></head><body></body></html>"
    );
    docEl.close();
    const body = docEl.body;

    const brand = docEl.createElement("p");
    brand.className = "brand";
    brand.textContent =
      d.type === "quote" ? "NEWON PROJECT QUOTATION" : "NEWON";
    body.appendChild(brand);

    const h1 = docEl.createElement("h1");
    h1.textContent = d.title || "Document";
    body.appendChild(h1);

    const typeTitle = docEl.createElement("p");
    typeTitle.className = "type-title";
    typeTitle.textContent = docTypeLabel(d.type);
    body.appendChild(typeTitle);

    const addMeta = (label, val) => {
      const p = docEl.createElement("p");
      p.className = "meta";
      p.textContent = `${label}: ${val || "—"}`;
      body.appendChild(p);
    };
    const num = docNumberFromContent(content);
    if (num) addMeta("Document #", num);
    addMeta("Status", d.status);
    addMeta("Client", d.clientName);
    addMeta("Company", d.company);
    if (project) addMeta("Project", project.name || project.id);
    addMeta("Version", d.version);
    addMeta("Updated", ymd(d.updatedAt));

    const printFieldBlock = (fields, skipEmpty) => {
      (fields || []).forEach(([key, label]) => {
        const val = content[key];
        if (skipEmpty && !fieldHasContent(val)) return;
        const h2 = docEl.createElement("h2");
        h2.textContent = label;
        body.appendChild(h2);
        const pre = docEl.createElement("pre");
        pre.textContent = displayFieldVal(val) || "—";
        body.appendChild(pre);
      });
    };

    if (d.type === "quote") {
      if (content.issueDate) addMeta("Issue date", content.issueDate);
      if (content.validUntil) addMeta("Valid until", content.validUntil);
      const ps = content.projectSummary || {};
      if (ps.service || ps.description || ps.estimatedTimeline) {
        const h2 = docEl.createElement("h2");
        h2.textContent = "Project summary";
        body.appendChild(h2);
        if (ps.service) addMeta("Service", ps.service);
        if (ps.description) {
          const pre = docEl.createElement("pre");
          pre.textContent = ps.description;
          body.appendChild(pre);
        }
        if (ps.estimatedTimeline) {
          addMeta("Estimated timeline", ps.estimatedTimeline);
        }
      }
      if (Array.isArray(content.lineItems)) {
        const h2 = docEl.createElement("h2");
        h2.textContent = "Estimate";
        body.appendChild(h2);
        const tableEl = docEl.createElement("table");
        const thead = docEl.createElement("thead");
        const hr = docEl.createElement("tr");
        ["Service", "Description", "Qty", "Unit", "Amount"].forEach((t) => {
          const th = docEl.createElement("th");
          th.textContent = t;
          hr.appendChild(th);
        });
        thead.appendChild(hr);
        tableEl.appendChild(thead);
        const tbody = docEl.createElement("tbody");
        content.lineItems.forEach((row) => {
          const tr = docEl.createElement("tr");
          [
            row.service,
            row.description,
            row.quantity,
            row.unitPrice,
            row.amount,
          ].forEach((v) => {
            const td = docEl.createElement("td");
            td.textContent = v == null ? "" : String(v);
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        tableEl.appendChild(tbody);
        body.appendChild(tableEl);
        const total = docEl.createElement("p");
        total.className = "total";
        total.textContent = `Subtotal ${formatKrw(content.subtotal || 0)} · Discount ${formatKrw(
          content.discount || 0
        )} · VAT ${formatKrw(content.vat || 0)} · Total ${formatKrw(
          content.total || 0
        )}`;
        body.appendChild(total);
      }
      const disc = docEl.createElement("p");
      disc.className = "disclaimer";
      disc.textContent = content.disclaimer || QUOTE_DISCLAIMER;
      body.appendChild(disc);
    } else if (d.type === "invoice") {
      addMeta("Invoice #", content.invoiceNumber);
      addMeta("Issue", content.issueDate);
      addMeta("Due", content.dueDate);
      if (content.description) addMeta("Description", content.description);
      addMeta("Payment type", content.paymentType);
      addMeta("Status", d.status);
      addMeta("Subtotal", formatKrw(content.subtotal || 0));
      addMeta("Tax / VAT", formatKrw(content.tax || 0));
      addMeta("Total", formatKrw(content.total || 0));
      if (content.paidAt) addMeta("Paid at", content.paidAt);
      if (content.notes) {
        const h2 = docEl.createElement("h2");
        h2.textContent = "Notes";
        body.appendChild(h2);
        const pre = docEl.createElement("pre");
        pre.textContent = content.notes;
        body.appendChild(pre);
      }
    } else if (d.type === "contract") {
      printFieldBlock(CONTRACT_FIELDS, true);
      LEGACY_CONTRACT_KEYS.forEach((key) => {
        if (!fieldHasContent(content[key])) return;
        const h2 = docEl.createElement("h2");
        h2.textContent = key;
        body.appendChild(h2);
        const pre = docEl.createElement("pre");
        pre.textContent =
          key === "contractAmount" || /amount/i.test(key)
            ? formatKrw(content[key] || 0)
            : displayFieldVal(content[key]);
        body.appendChild(pre);
      });
      if (fieldHasContent(content.contractAmount)) {
        // already in CONTRACT_FIELDS
      }
      const legal = docEl.createElement("p");
      legal.className = "legal";
      legal.textContent = LEGAL_DISCLAIMER;
      body.appendChild(legal);
    } else if (d.type === "requirements") {
      printFieldBlock(REQ_FIELDS, true);
      printFieldBlock(LEGACY_REQ_FIELDS, true);
    } else if (d.type === "scope") {
      printFieldBlock(SCOPE_FIELDS, true);
      printFieldBlock(LEGACY_SCOPE_FIELDS, true);
    } else if (d.type === "maintenance") {
      printFieldBlock(MAINTENANCE_FIELDS, true);
    } else if (d.type === "faq") {
      const pre = docEl.createElement("pre");
      pre.textContent = content.body || formatFaqBody(CLIENT_FAQ_ITEMS);
      body.appendChild(pre);
    } else if (content.body) {
      const pre = docEl.createElement("pre");
      pre.textContent = content.body;
      body.appendChild(pre);
    }
    w.focus();
    w.print();
  }

  function filteredDocuments() {
    const q = (filters.q || "").trim().toLowerCase();
    return docsList().filter((d) => {
      if (filters.archived === "active" && d.archived) return false;
      if (filters.archived === "archived" && !d.archived) return false;
      if (filters.status && d.status !== filters.status) return false;
      if (filters.type && d.type !== filters.type) return false;
      if (filters.projectId && d.projectId !== filters.projectId) return false;
      if (q) {
        const hay = `${d.title || ""} ${d.clientName || ""} ${d.company || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderDocumentDetail(root, d) {
    clear(root);
    const project = d.projectId ? projectById(d.projectId) : null;
    const content = asContent(d.content);
    const docNum = docNumberFromContent(content);
    root.appendChild(
      pageHeader("documents", [
        btn("← Back", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => {
            documentDetailId = null;
            renderDocuments(root);
          },
        }),
        btn("Edit", {
          onClick: () =>
            d.type === "quote" ? openQuoteBuilder(d) : openGenericDocForm(d),
        }),
        btn("Print / PDF", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => printDocument(d),
        }),
      ])
    );

    root.appendChild(
      el("div", {
        className: "hq-surface-panel",
        style: "margin-bottom:0.85rem",
      }, [
        el(
          "div",
          {
            className: "hq-surface-panel__body",
            style: "padding:1.1rem 1.05rem",
          },
          [
            el("p", { className: "hq-eyebrow", text: "Document" }),
            el("h2", {
              className: "hq-page-header__title",
              style: "margin:0.2rem 0 0.45rem;font-size:1.65rem",
              text: d.title || "—",
            }),
            el("div", { className: "hq-product-card__ops" }, [
              badge(docTypeLabel(d.type)),
              badge(d.status || "—", d.status),
              badge("v" + (d.version || "—")),
              docNum ? badge(docNum) : null,
            ].filter(Boolean)),
            el("p", {
              className: "hq-row__meta",
              style: "margin-top:0.65rem;font-size:0.8rem;white-space:pre-wrap;opacity:0.85",
              text: WORKFLOW_HINT,
            }),
          ]
        ),
      ])
    );

    root.appendChild(
      el("div", { className: "hq-grid-2--equal hq-grid-2" }, [
        surfacePanel("Overview", [
          el("div", { className: "hq-pipeline" }, [
            el("p", {
              className: "hq-row__meta",
              text: `Type: ${docTypeLabel(d.type)}`,
            }),
            el("p", {
              className: "hq-row__meta",
              text: `Status: ${d.status || "—"}`,
            }),
            el("p", {
              className: "hq-row__meta",
              text: `Version: ${d.version || "—"}`,
            }),
            docNum
              ? el("p", {
                  className: "hq-row__meta",
                  text: `Document #: ${docNum}`,
                })
              : null,
          ].filter(Boolean)),
        ]),
        surfacePanel("Client", [
          el("div", { className: "hq-pipeline" }, [
            el("p", {
              className: "hq-row__meta",
              text: `Name: ${d.clientName || "—"}`,
            }),
            el("p", {
              className: "hq-row__meta",
              text: `Company: ${d.company || "—"}`,
            }),
            d.clientId && typeof openCrmDetail === "function"
              ? btn("Open CRM client", {
                  className: "hq-btn hq-btn--small",
                  onClick: () => openCrmDetail("client", d.clientId),
                })
              : null,
            d.companyId && typeof openCrmDetail === "function"
              ? btn("Open CRM company", {
                  className: "hq-btn hq-btn--small hq-btn--ghost",
                  onClick: () => openCrmDetail("company", d.companyId),
                })
              : null,
            !d.clientId &&
            project &&
            project.clientId &&
            typeof openCrmDetail === "function"
              ? btn("Open project client", {
                  className: "hq-btn hq-btn--small hq-btn--ghost",
                  onClick: () => openCrmDetail("client", project.clientId),
                })
              : null,
          ].filter(Boolean)),
        ]),
      ])
    );

    root.appendChild(el("div", { style: "height:0.85rem" }));
    const contentKids = [];

    if (d.type === "quote") {
      if (content.issueDate || content.validUntil) {
        contentKids.push(
          el("p", {
            className: "hq-row__meta",
            style: "padding:0.55rem 1.05rem 0",
            text: `Issue ${content.issueDate || "—"} · Valid until ${
              content.validUntil || "—"
            }`,
          })
        );
      }
      const ps = content.projectSummary || {};
      if (ps.service || ps.description || ps.estimatedTimeline) {
        contentKids.push(
          el("div", { style: "padding:0.55rem 1.05rem" }, [
            el("p", {
              className: "hq-summary-pill__label",
              text: "Project summary",
            }),
            el("p", {
              className: "hq-row__meta",
              text: `Service: ${ps.service || "—"}`,
            }),
            el("p", {
              className: "hq-row__meta",
              style: "white-space:pre-wrap",
              text: ps.description || "—",
            }),
            el("p", {
              className: "hq-row__meta",
              text: `Timeline: ${ps.estimatedTimeline || "—"}`,
            }),
          ])
        );
      }
      if (Array.isArray(content.lineItems)) {
        const rows = content.lineItems.map((row) => {
          const tr = el("tr");
          tr.appendChild(el("td", { text: row.service || "—" }));
          tr.appendChild(el("td", { text: row.description || "—" }));
          tr.appendChild(el("td", { text: String(row.quantity ?? "") }));
          tr.appendChild(el("td", { text: formatKrw(row.unitPrice || 0) }));
          tr.appendChild(el("td", { text: formatKrw(row.amount || 0) }));
          return tr;
        });
        contentKids.push(
          table(
            ["Service", "Description", "Qty", "Unit", "Amount"],
            rows,
            "No lines"
          )
        );
        contentKids.push(
          el("p", {
            className: "hq-row__meta",
            style: "padding:0.75rem 1rem",
            text: `Subtotal ${formatKrw(content.subtotal || 0)} · Discount ${formatKrw(
              content.discount || 0
            )} · VAT ${formatKrw(content.vat || 0)} · Total ${formatKrw(
              content.total || 0
            )}`,
          })
        );
      }
      contentKids.push(
        el("div", { style: "padding:0.55rem 1.05rem 1rem" }, [
          el("p", {
            className: "hq-summary-pill__label",
            text: "Disclaimer",
          }),
          el("p", {
            className: "hq-row__meta",
            style: "white-space:pre-wrap;font-size:0.85rem",
            text: content.disclaimer || QUOTE_DISCLAIMER,
          }),
        ])
      );
    } else if (d.type === "requirements") {
      renderContentFieldBlocks(contentKids, REQ_FIELDS, content, false);
      renderContentFieldBlocks(contentKids, LEGACY_REQ_FIELDS, content, true);
    } else if (d.type === "scope") {
      renderContentFieldBlocks(contentKids, SCOPE_FIELDS, content, false);
      renderContentFieldBlocks(contentKids, LEGACY_SCOPE_FIELDS, content, true);
    } else if (d.type === "contract") {
      renderContentFieldBlocks(contentKids, CONTRACT_FIELDS, content, false);
      LEGACY_CONTRACT_KEYS.forEach((key) => {
        if (!fieldHasContent(content[key])) return;
        let val = content[key];
        if (typeof val === "number") val = formatKrw(val);
        contentKids.push(
          el("div", { style: "padding:0.55rem 1.05rem" }, [
            el("p", {
              className: "hq-summary-pill__label",
              text: `(Legacy) ${key}`,
            }),
            el("p", {
              className: "hq-row__meta",
              style: "white-space:pre-wrap",
              text: String(val),
            }),
          ])
        );
      });
      contentKids.push(
        el("p", {
          className: "hq-row__meta",
          style: "padding:0.55rem 1.05rem 1rem;font-size:0.78rem;opacity:0.85",
          text: LEGAL_DISCLAIMER,
        })
      );
    } else if (d.type === "invoice") {
      [
        ["invoiceNumber", "Invoice #"],
        ["issueDate", "Issue date"],
        ["dueDate", "Due date"],
        ["description", "Description"],
        ["paymentType", "Payment type"],
        ["subtotal", "Subtotal"],
        ["tax", "Tax / VAT"],
        ["total", "Total"],
        ["paidAt", "Paid at"],
        ["notes", "Notes"],
      ].forEach(([key, label]) => {
        let val = content[key];
        if (
          typeof val === "number" ||
          (val != null && /subtotal|tax|total/i.test(key))
        ) {
          val = formatKrw(Number(val) || 0);
        }
        contentKids.push(
          el("p", {
            className: "hq-row__meta",
            style: "padding:0.35rem 1.05rem",
            text: `${label}: ${val == null || val === "" ? "—" : val}`,
          })
        );
      });
    } else if (d.type === "maintenance") {
      renderContentFieldBlocks(contentKids, MAINTENANCE_FIELDS, content, false);
    } else if (d.type === "faq") {
      contentKids.push(
        el("p", {
          className: "hq-row__meta",
          style: "padding:1rem 1.05rem;white-space:pre-wrap",
          text: content.body || "No content",
        })
      );
    } else {
      contentKids.push(
        el("p", {
          className: "hq-row__meta",
          style: "padding:1rem 1.05rem;white-space:pre-wrap",
          text: content.body || "No content",
        })
      );
    }
    root.appendChild(surfacePanel("Content", contentKids));

    const related = relatedDocuments(d);
    if (related.length) {
      root.appendChild(el("div", { style: "height:0.85rem" }));
      const relKids = related.slice(0, 20).map((rd) => {
        const row = el("div", {
          className: "hq-row",
          style: "cursor:pointer",
          onClick: () => {
            documentDetailId = rd.id;
            renderDocuments(root);
          },
        });
        row.appendChild(badge(docTypeLabel(rd.type)));
        const mid = el("div");
        mid.appendChild(
          el("p", { className: "hq-row__title", text: rd.title || "—" })
        );
        mid.appendChild(
          el("p", {
            className: "hq-row__meta",
            text: `${rd.status || "—"} · ${ymd(rd.updatedAt) || "—"}`,
          })
        );
        row.appendChild(mid);
        return row;
      });
      root.appendChild(surfacePanel("Related documents", relKids));
    }

    root.appendChild(el("div", { style: "height:0.85rem" }));
    root.appendChild(
      el("div", { className: "hq-grid-2--equal hq-grid-2" }, [
        surfacePanel("Project", [
          el("div", { className: "hq-pipeline" }, [
            el("p", {
              className: "hq-row__meta",
              text: project
                ? project.name || project.id
                : d.projectId || "Not linked",
            }),
            project
              ? btn("Open project", {
                  className: "hq-btn hq-btn--small",
                  onClick: () => {
                    api.setProjectDetailId(project.id);
                    showPanel("projects");
                  },
                })
              : null,
          ].filter(Boolean)),
        ]),
        surfacePanel("History", [
          el("div", { className: "hq-pipeline" }, [
            el("p", {
              className: "hq-row__meta",
              text: `Created: ${ymd(d.createdAt) || "—"}`,
            }),
            el("p", {
              className: "hq-row__meta",
              text: `Updated: ${ymd(d.updatedAt) || "—"}`,
            }),
          ]),
        ]),
      ])
    );

    root.appendChild(el("div", { style: "height:0.85rem" }));
    root.appendChild(
      surfacePanel("Internal Notes", [
        el("p", {
          className: "hq-row__meta",
          style: "padding:1rem 1.05rem;white-space:pre-wrap",
          text: d.internalNotes || "—",
        }),
      ])
    );

    root.appendChild(el("div", { style: "height:0.85rem" }));
    const actions = [];
    if (d.type === "quote" && d.status === "approved" && project) {
      const total = Number(content.total) || 0;
      actions.push(
        btn("Use Quote Total as Project Budget", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => {
            const current = Number(project.budget) || 0;
            const msg =
              current > 0 && current !== total
                ? `Overwrite project budget ${formatKrw(current)} with quote total ${formatKrw(total)}?`
                : `Set project budget to ${formatKrw(total)}?`;
            confirmDelete(msg, async () => {
              try {
                await updateDoc(doc(ctx().db, COL.projects, project.id), {
                  budget: total,
                  updatedAt: serverTimestamp(),
                  updatedBy: uid(),
                });
                toast("Project budget updated", "ok");
                await refreshAndRender();
              } catch {
                toast("Budget update failed", "err");
              }
            });
          },
        })
      );
    }
    if (d.type === "invoice" && d.status === "completed") {
      const paidAmt =
        Number(content.total) ||
        Number(content.amount) ||
        Number(content.subtotal) ||
        0;
      const already = (getCache().finance || []).some(
        (f) => !f.archived && f.invoiceId === d.id
      );
      actions.push(
        btn(
          already
            ? "Payment already in Finance"
            : "Record Payment in Finance",
          {
            className: "hq-btn hq-btn--ghost",
            disabled: already || paidAmt <= 0,
            onClick: () => {
              if (already) {
                toast("Already recorded for this invoice", "err");
                return;
              }
              if (typeof openFinanceForm === "function") {
                openFinanceForm(null, {
                  type: "income",
                  category: "Invoice payment",
                  amount: paidAmt,
                  projectId: d.projectId || "",
                  relatedProject:
                    (project && project.name) || d.company || "",
                  memo: `Invoice ${content.invoiceNumber || d.title || d.id}`,
                  invoiceId: d.id,
                  clientId: d.clientId || (project && project.clientId) || "",
                  companyId:
                    d.companyId || (project && project.companyId) || "",
                });
              } else {
                toast("Finance form unavailable", "err");
              }
            },
          }
        )
      );
    }
    if (actions.length) {
      root.appendChild(
        surfacePanel("Integrations", [
          el(
            "div",
            {
              className: "hq-pipeline",
              style: "display:flex;flex-wrap:wrap;gap:0.5rem",
            },
            actions
          ),
        ])
      );
      root.appendChild(el("div", { style: "height:0.85rem" }));
    }

    if (!d.archived) {
      root.appendChild(
        el("div", { className: "hq-session-box" }, [
          el("p", {
            className: "hq-session-box__title",
            text: "Archive",
          }),
          btn("Archive Document", {
            className: "hq-btn hq-btn--ghost",
            onClick: () =>
              confirmDelete("Archive this document?", async () => {
                try {
                  await updateDoc(doc(ctx().db, COL.documents, d.id), {
                    archived: true,
                    updatedAt: serverTimestamp(),
                    updatedBy: uid(),
                  });
                  toast("Archived", "ok");
                  documentDetailId = null;
                  await refreshAndRender();
                } catch {
                  toast("Archive failed", "err");
                }
              }),
          }),
        ])
      );
    }
  }

  function renderDocuments(root) {
    clear(root);
    const modal = document.getElementById("hq-modal");
    if (modal) modal.classList.remove("hq-modal--wide");

    if (documentDetailId) {
      const d = docById(documentDetailId);
      if (d) {
        renderDocumentDetail(root, d);
        return;
      }
      documentDetailId = null;
    }

    const quickTypes = [
      ["requirements", "+Requirements"],
      ["scope", "+Scope"],
      ["contract", "+Contract"],
      ["invoice", "+Invoice"],
      ["maintenance", "+Maintenance"],
      ["faq", "+FAQ"],
    ];

    root.appendChild(
      pageHeader("documents", [
        btn("+ New Document", { onClick: () => openGenericDocForm(null) }),
        btn("+ Quote", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => openQuoteBuilder(null),
        }),
        ...quickTypes.map(([type, label]) =>
          btn(label, {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: () => openDocCreator(type, null),
          })
        ),
      ])
    );

    const seg = el("div", { className: "hq-seg" });
    for (const [val, label] of [
      ["", "All"],
      ["draft", "Draft"],
      ["sent", "Sent"],
      ["approved", "Approved"],
      ["signed", "Signed"],
      ["completed", "Completed"],
      ["overdue", "Overdue"],
      ["cancelled", "Cancelled"],
    ]) {
      seg.appendChild(
        el("button", {
          type: "button",
          className:
            "hq-seg__btn" + (filters.status === val ? " is-active" : ""),
          text: label,
          onClick: () => {
            filters.status = val;
            filters.archived = "active";
            renderDocuments(root);
          },
        })
      );
    }
    seg.appendChild(
      el("button", {
        type: "button",
        className:
          "hq-seg__btn" +
          (filters.archived === "archived" ? " is-active" : ""),
        text: "Archived",
        onClick: () => {
          filters.archived = "archived";
          filters.status = "";
          renderDocuments(root);
        },
      })
    );

    const typeF = select(
      {
        onChange: (e) => {
          filters.type = e.target.value;
          renderDocuments(root);
        },
      },
      [{ value: "", label: "Type" }].concat(DOC_TYPES),
      filters.type
    );
    const projectF = projectOptions(filters.projectId);
    projectF.addEventListener("change", () => {
      filters.projectId = projectF.value;
      renderDocuments(root);
    });
    const search = input({
      className: "hq-input hq-input--search",
      placeholder: "Search title / client / company",
      value: filters.q || "",
      onInput: (e) => {
        filters.q = e.target.value;
        renderDocuments(root);
      },
    });
    root.appendChild(toolbar([seg, typeF, projectF, search]));

    const list = filteredDocuments()
      .slice()
      .sort((a, b) => {
        const da = ymd(a.updatedAt) || ymd(a.createdAt) || "";
        const db = ymd(b.updatedAt) || ymd(b.createdAt) || "";
        return db.localeCompare(da);
      });

    if (!list.length) {
      root.appendChild(
        emptyState(
          "No documents yet",
          "Create quotes, scope, requirements, contracts, and invoices for client projects.",
          btn("+ New Document", { onClick: () => openGenericDocForm(null) })
        )
      );
      return;
    }

    const rows = list.map((d) => {
      const tr = el("tr", {
        style: "cursor:pointer",
        onClick: () => {
          documentDetailId = d.id;
          renderDocuments(root);
        },
      });
      tr.appendChild(el("td", { text: d.title || "—" }));
      tr.appendChild(el("td", null, [badge(docTypeLabel(d.type))]));
      tr.appendChild(
        el("td", {
          text: `${d.clientName || "—"}${d.company ? " · " + d.company : ""}`,
        })
      );
      const proj = d.projectId ? projectById(d.projectId) : null;
      tr.appendChild(
        el("td", { text: (proj && proj.name) || d.projectId || "—" })
      );
      tr.appendChild(el("td", null, [badge(d.status || "—", d.status)]));
      tr.appendChild(
        el("td", { text: ymd(d.updatedAt) || ymd(d.createdAt) || "—" })
      );
      return tr;
    });
    root.appendChild(
      table(
        ["Document", "Type", "Client", "Project", "Status", "Updated"],
        rows,
        "No documents"
      )
    );

    const cards = el("div", { className: "hq-card-list is-mobile-only" });
    list.forEach((d) => {
      const card = el("article", {
        className: "hq-item-card",
        style: "cursor:pointer",
        onClick: () => {
          documentDetailId = d.id;
          renderDocuments(root);
        },
      });
      const top = el("div", { className: "hq-item-card__top" });
      top.appendChild(
        el("p", { className: "hq-item-card__title", text: d.title || "—" })
      );
      top.appendChild(badge(d.status || "—", d.status));
      card.appendChild(top);
      card.appendChild(
        el("p", {
          className: "hq-item-card__meta",
          text: `${docTypeLabel(d.type)} · ${d.clientName || "—"} · ${
            ymd(d.updatedAt) || "—"
          }`,
        })
      );
      cards.appendChild(card);
    });
    root.appendChild(cards);
  }

  function renderProjectDocumentsSection(project) {
    const list = docsForProject(project.id);
    const kids = [];
    const actions = el("div", {
      className: "hq-toolbar",
      style: "margin:0.65rem 1.05rem 0.35rem",
    });
    [
      ["quote", "Quote"],
      ["scope", "Scope"],
      ["requirements", "Requirements"],
      ["contract", "Contract"],
      ["invoice", "Invoice"],
      ["delivery", "Delivery"],
      ["maintenance", "Maintenance"],
      ["faq", "FAQ"],
    ].forEach(([type, label]) => {
      actions.appendChild(
        btn("+ " + label, {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: () => openDocCreator(type, project),
        })
      );
    });
    kids.push(actions);

    if (!list.length) {
      kids.push(
        el("div", { style: "padding:0.85rem 1.05rem" }, [
          emptyMsg("No documents linked yet."),
        ])
      );
    } else {
      list.forEach((d) => {
        const row = el("div", {
          className: "hq-row",
          style: "cursor:pointer",
          onClick: () => {
            documentDetailId = d.id;
            showPanel("documents");
          },
        });
        row.appendChild(badge(docTypeLabel(d.type)));
        const mid = el("div");
        mid.appendChild(
          el("p", { className: "hq-row__title", text: d.title || "—" })
        );
        mid.appendChild(
          el("p", {
            className: "hq-row__meta",
            text: `${d.status || "—"} · ${ymd(d.updatedAt) || "—"}`,
          })
        );
        row.appendChild(mid);
        kids.push(row);
      });
    }
    return surfacePanel("Documents", kids);
  }

  function renderDeliverySection(project) {
    let items = ensureDeliveryChecklist(project);
    const body = el("div", { className: "hq-pipeline" });
    const hint = el("p", {
      className: "hq-row__meta",
      style: "font-size:0.85rem;opacity:0.85",
      text: "",
    });

    function redraw() {
      clear(body);
      if (!items.length) {
        hint.textContent =
          "Checklist empty — use Apply template… below (nothing is written until you apply and save).";
        body.appendChild(hint);
      } else {
        hint.textContent = "";
        items.forEach((item, idx) => {
          const row = el("label", {
            className: "hq-row",
            style: "cursor:pointer;grid-template-columns:auto 1fr auto",
          });
          const cb = input({ type: "checkbox", checked: !!item.done });
          cb.addEventListener("change", () => {
            items[idx] = { ...items[idx], done: cb.checked };
          });
          row.appendChild(cb);
          row.appendChild(
            el("span", { className: "hq-row__title", text: item.label })
          );
          row.appendChild(
            btn("×", {
              className: "hq-btn hq-btn--small hq-btn--ghost",
              onClick: (e) => {
                e.preventDefault();
                items = items.filter((_, i) => i !== idx);
                redraw();
              },
            })
          );
          body.appendChild(row);
        });
      }
    }
    redraw();

    const groupChecks = {};
    const groupWrap = el("div", {
      style:
        "display:flex;flex-wrap:wrap;gap:0.35rem 0.85rem;padding:0.35rem 0",
    });
    DELIVERY_TEMPLATE_GROUPS.forEach((g) => {
      const lab = el("label", {
        style:
          "display:inline-flex;align-items:center;gap:0.3rem;font-size:0.85rem",
      });
      const cb = input({ type: "checkbox" });
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(g.label));
      groupWrap.appendChild(lab);
      groupChecks[g.id] = cb;
    });

    function mergeTemplateLabels(labels) {
      const existing = new Set(items.map((i) => i.label));
      let added = 0;
      labels.forEach((label) => {
        if (existing.has(label)) return;
        items.push({
          id: "tpl-" + Date.now() + "-" + added,
          label,
          done: false,
        });
        existing.add(label);
        added += 1;
      });
      return added;
    }

    const addIn = input({ placeholder: "Add checklist item" });
    const wrap = el("div", null, [
      body,
      el("p", {
        className: "hq-summary-pill__label",
        style: "margin-top:0.65rem",
        text: "Apply template…",
      }),
      groupWrap,
      el("div", { className: "hq-toolbar", style: "padding:0.35rem 0 0" }, [
        btn("Apply selected groups", {
          className: "hq-btn hq-btn--small",
          onClick: () => {
            const labels = [];
            DELIVERY_TEMPLATE_GROUPS.forEach((g) => {
              if (groupChecks[g.id] && groupChecks[g.id].checked) {
                g.items.forEach((label) => {
                  labels.push(`${g.label}: ${label}`);
                });
              }
            });
            if (!labels.length) {
              toast("Select at least one group", "err");
              return;
            }
            const added = mergeTemplateLabels(labels);
            toast(
              added ? `Added ${added} item(s)` : "No new items (already present)",
              added ? "ok" : "err"
            );
            redraw();
          },
        }),
        btn("Apply full template", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: () => {
            if (
              items.length &&
              !window.confirm(
                "Merge full delivery template into checklist? Existing items are kept; duplicates skipped."
              )
            ) {
              return;
            }
            if (
              !items.length &&
              !window.confirm("Apply full delivery template to empty checklist?")
            ) {
              return;
            }
            const added = mergeTemplateLabels(DEFAULT_DELIVERY_ITEMS);
            toast(
              added ? `Added ${added} item(s)` : "No new items",
              added ? "ok" : "err"
            );
            redraw();
          },
        }),
      ]),
      el("div", { className: "hq-toolbar", style: "padding:0.5rem 0 0" }, [
        addIn,
        btn("Add", {
          className: "hq-btn hq-btn--small",
          onClick: () => {
            const label = addIn.value.trim();
            if (!label) return;
            items.push({ id: "c-" + Date.now(), label, done: false });
            addIn.value = "";
            redraw();
          },
        }),
        btn("Save checklist", {
          className: "hq-btn hq-btn--small",
          onClick: withSaving(async () => {
            try {
              await updateDoc(doc(ctx().db, COL.projects, project.id), {
                deliveryChecklist: items,
                updatedAt: serverTimestamp(),
                updatedBy: uid(),
              });
              toast("Checklist saved", "ok");
              await refreshAndRender();
            } catch {
              toast("Save failed", "err");
            }
          }),
        }),
      ]),
    ]);
    return surfacePanel("Delivery checklist", [wrap]);
  }

  function dashboardDocStats() {
    const docs = docsList().filter((d) => !d.archived);
    const draft = docs.filter((d) => d.status === "draft").length;
    const quotesWaiting = docs.filter(
      (d) => d.type === "quote" && (d.status === "sent" || d.status === "draft")
    ).length;
    const contractsWaiting = docs.filter(
      (d) =>
        d.type === "contract" &&
        ["draft", "sent", "approved"].includes(d.status)
    ).length;
    const unpaid = docs.filter(
      (d) =>
        d.type === "invoice" &&
        ["draft", "sent", "approved", "overdue"].includes(d.status)
    ).length;
    const upcoming = (cache().projects || []).filter((p) => {
      if (p.archived) return false;
      const cl = Array.isArray(p.deliveryChecklist)
        ? p.deliveryChecklist
        : [];
      return cl.length > 0 && cl.some((i) => !i.done);
    }).length;
    return { draft, quotesWaiting, contractsWaiting, unpaid, upcoming };
  }

  function renderDashboardDocsPanel() {
    const s = dashboardDocStats();
    return el("div", { className: "hq-summary-strip" }, [
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "Draft docs" }),
        el("p", {
          className: "hq-summary-pill__value",
          text: String(s.draft),
        }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", {
          className: "hq-summary-pill__label",
          text: "Quotes awaiting",
        }),
        el("p", {
          className: "hq-summary-pill__value",
          text: String(s.quotesWaiting),
        }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", {
          className: "hq-summary-pill__label",
          text: "Contracts awaiting",
        }),
        el("p", {
          className: "hq-summary-pill__value",
          text: String(s.contractsWaiting),
        }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", {
          className: "hq-summary-pill__label",
          text: "Unpaid invoices",
        }),
        el("p", {
          className: "hq-summary-pill__value",
          text: String(s.unpaid),
        }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", {
          className: "hq-summary-pill__label",
          text: "Upcoming deliveries",
        }),
        el("p", {
          className: "hq-summary-pill__value",
          text: String(s.upcoming),
        }),
      ]),
    ]);
  }

  return {
    renderDocuments,
    renderProjectDocumentsSection,
    renderDeliverySection,
    renderProgressStrip,
    renderDashboardDocsPanel,
    openDocCreator,
    openQuoteBuilder,
    clearDetail() {
      documentDetailId = null;
    },
    setDetailId(id) {
      documentDetailId = id;
    },
    getDetailId() {
      return documentDetailId;
    },
  };
}
