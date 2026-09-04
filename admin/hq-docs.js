/**
 * Newon HQ Phase 2B — Documents / Quote / Scope / Requirements / Contract / Invoice / Delivery
 * Installed into hq-app via installHqDocs(api). No Firestore schema migration.
 */

export const DOC_TYPES = [
  { value: "quote", label: "Quote / 견적서" },
  { value: "scope", label: "Scope of Work / 작업 범위서" },
  { value: "requirements", label: "Requirements / 요구사항" },
  { value: "contract", label: "Contract / 계약서" },
  { value: "invoice", label: "Invoice / 청구서" },
  { value: "delivery", label: "Delivery / 납품 문서" },
  { value: "meeting", label: "Meeting Note / 미팅 기록" },
  { value: "other", label: "Other" },
];

export const DOC_STATUS = ["draft", "sent", "approved", "signed", "completed"];

export const DEFAULT_DELIVERY_ITEMS = [
  "Final build",
  "Source files",
  "Production deployment",
  "Domain",
  "Analytics",
  "Admin account",
  "Documentation",
  "Store submission",
  "Client acceptance",
  "Final payment",
  "Backup",
  "Handover",
];

const SCOPE_FIELDS = [
  ["overview", "Project Overview"],
  ["objectives", "Objectives"],
  ["deliverables", "Deliverables"],
  ["included", "Included"],
  ["excluded", "Excluded"],
  ["milestones", "Milestones"],
  ["clientResponsibilities", "Client Responsibilities"],
  ["newonResponsibilities", "Newon Responsibilities"],
  ["revisionPolicy", "Revision Policy"],
  ["timeline", "Timeline"],
  ["acceptanceCriteria", "Acceptance Criteria"],
  ["additionalNotes", "Additional Notes"],
];

const REQ_FIELDS = [
  ["businessBackground", "Business Background"],
  ["problem", "Problem"],
  ["targetUsers", "Target Users"],
  ["platforms", "Platforms"],
  ["requiredFeatures", "Required Features"],
  ["optionalFeatures", "Optional Features"],
  ["authentication", "Authentication"],
  ["payment", "Payment"],
  ["admin", "Admin"],
  ["backend", "Backend"],
  ["externalApis", "External APIs"],
  ["designRequirements", "Design Requirements"],
  ["localization", "Localization"],
  ["analytics", "Analytics"],
  ["notifications", "Notifications"],
  ["securityPrivacy", "Security / Privacy"],
  ["deliveryRequirements", "Delivery Requirements"],
  ["otherNotes", "Other Notes"],
];

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
    refreshAndRender,
    showPanel,
    formatLongDate,
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
      (d) => d.type === "contract" && (d.status === "signed" || d.status === "completed")
    );
    const steps = [
      { key: "lead", label: "Lead", done: !!project.leadId },
      { key: "project", label: "Project", done: true },
      { key: "requirements", label: "Requirements", done: hasDocType(pid, "requirements") },
      { key: "quote", label: "Quote", done: hasDocType(pid, "quote") },
      { key: "contract", label: "Contract", done: signedContract || hasDocType(pid, "contract") },
      {
        key: "development",
        label: "Development",
        done: ["active", "review", "completed"].includes(project.status),
        current: project.status === "active",
      },
      { key: "delivery", label: "Delivery", done: deliveryDone || hasDocType(pid, "delivery") },
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
      node.appendChild(el("span", { className: "hq-progress__mark", text: mark }));
      node.appendChild(el("span", { className: "hq-progress__label", text: s.label }));
      wrap.appendChild(node);
      if (i < steps.length - 1) {
        wrap.appendChild(el("span", { className: "hq-progress__sep", text: "→" }));
      }
    });
    return wrap;
  }

  function ensureDeliveryChecklist(project) {
    if (Array.isArray(project.deliveryChecklist) && project.deliveryChecklist.length) {
      return project.deliveryChecklist.map((i, idx) => ({
        id: i.id || "item-" + idx,
        label: i.label || String(i),
        done: !!i.done,
      }));
    }
    return DEFAULT_DELIVERY_ITEMS.map((label, idx) => ({
      id: "def-" + idx,
      label,
      done: false,
    }));
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

  function baseMetaFromProject(project, type) {
    return {
      projectId: project ? project.id : null,
      leadId: project ? project.leadId || null : null,
      clientName: project ? project.clientName || "" : "",
      company: project ? project.company || "" : "",
      type,
      status: "draft",
      version: "1.0",
    };
  }

  function openGenericDocForm(item, opts) {
    opts = opts || {};
    const project = opts.project || (item && item.projectId && projectById(item.projectId));
    const type = (item && item.type) || opts.type || "other";
    const isEdit = !!item;
    const content = asContent(item && item.content);

    const titleIn = input({
      value:
        (item && item.title) ||
        (project ? `${project.name || "Project"} — ${docTypeLabel(type)}` : ""),
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
    const projectIn = projectOptions((item && item.projectId) || (project && project.id) || "");
    const clientIn = input({
      value: (item && item.clientName) || (project && project.clientName) || "",
    });
    const companyIn = input({
      value: (item && item.company) || (project && project.company) || "",
    });
    const notesIn = textarea({});
    notesIn.value = (item && item.internalNotes) || "";

    const fields = [fieldRow("Title *", titleIn), fieldRow("Type", typeIn), fieldRow("Status", statusIn), fieldRow("Version", versionIn), fieldRow("Project", projectIn), fieldRow("Client", clientIn), fieldRow("Company", companyIn)];

    let contentCollectors = () => ({ body: "" });

    if (type === "meeting" || type === "other" || type === "delivery") {
      const bodyIn = textarea({});
      bodyIn.value = content.body || "";
      bodyIn.rows = 8;
      fields.push(fieldRow("Content", bodyIn));
      contentCollectors = () => ({ body: bodyIn.value.trim() });
    } else if (type === "scope") {
      const map = {};
      for (const [key, label] of SCOPE_FIELDS) {
        const ta = textarea({});
        ta.value = content[key] || "";
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
      for (const [key, label] of REQ_FIELDS) {
        const ta = textarea({});
        ta.value = content[key] || "";
        fields.push(fieldRow(label, ta));
        map[key] = ta;
      }
      contentCollectors = () => {
        const out = {};
        for (const [key] of REQ_FIELDS) out[key] = map[key].value.trim();
        return out;
      };
    } else if (type === "contract") {
      const amountIn = input({
        type: "number",
        min: "0",
        value: content.contractAmount != null ? String(content.contractAmount) : String((project && project.budget) || 0),
      });
      const startIn = input({ type: "date", value: content.startDate || ymd(project && project.startDate) || "" });
      const endIn = input({ type: "date", value: content.endDate || ymd(project && project.targetDate) || "" });
      const termsIn = textarea({});
      termsIn.value = content.paymentTerms || "";
      const cNotes = textarea({});
      cNotes.value = content.notes || "";
      fields.push(
        fieldRow("Contract amount", amountIn),
        fieldRow("Start date", startIn),
        fieldRow("End date", endIn),
        fieldRow("Payment terms", termsIn),
        fieldRow("Notes", cNotes)
      );
      contentCollectors = () => ({
        contractAmount: Math.max(0, Number(amountIn.value) || 0),
        startDate: startIn.value || null,
        endDate: endIn.value || null,
        paymentTerms: termsIn.value.trim(),
        notes: cNotes.value.trim(),
        client: clientIn.value.trim(),
      });
    } else if (type === "invoice") {
      const numIn = input({
        value: content.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      });
      const issueIn = input({ type: "date", value: content.issueDate || ymd(new Date()) });
      const dueIn = input({ type: "date", value: content.dueDate || "" });
      const subIn = input({
        type: "number",
        min: "0",
        value: content.subtotal != null ? String(content.subtotal) : String((project && project.budget) || 0),
      });
      const taxIn = input({
        type: "number",
        min: "0",
        value: content.tax != null ? String(content.tax) : "0",
      });
      const paidIn = input({ type: "date", value: content.paidAt || "" });
      const iNotes = textarea({});
      iNotes.value = content.notes || "";
      fields.push(
        fieldRow("Invoice number", numIn),
        fieldRow("Issue date", issueIn),
        fieldRow("Due date", dueIn),
        fieldRow("Subtotal", subIn),
        fieldRow("Tax", taxIn),
        fieldRow("Paid at", paidIn),
        fieldRow("Notes", iNotes)
      );
      contentCollectors = () => {
        const subtotal = Math.max(0, Number(subIn.value) || 0);
        const tax = Math.max(0, Number(taxIn.value) || 0);
        return {
          invoiceNumber: numIn.value.trim(),
          issueDate: issueIn.value || null,
          dueDate: dueIn.value || null,
          subtotal,
          tax,
          total: subtotal + tax,
          paidAt: paidIn.value || null,
          notes: iNotes.value.trim(),
          client: clientIn.value.trim(),
        };
      };
    }

    fields.push(fieldRow("Internal notes", notesIn));
    const form = el("form", { className: "hq-form" }, fields);
    const saveBtn = btn(isEdit ? "Save" : "Create", { type: "submit", dataset: { hqSave: "1" } });
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
        const payload = {
          title,
          type: t,
          status: statusIn.value,
          version: versionIn.value.trim() || "1.0",
          projectId: projectIn.value || null,
          leadId: projectById(projectIn.value)?.leadId || (project && project.leadId) || null,
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
    openModal(isEdit ? "Edit Document" : "New Document", form, [cancelBtn, saveBtn]);
    const modal = document.getElementById("hq-modal");
    if (modal) modal.classList.add("hq-modal--wide");
  }

  function openQuoteBuilder(item, opts) {
    opts = opts || {};
    const project = opts.project || (item && item.projectId && projectById(item.projectId));
    const isEdit = !!item;
    const content = asContent(item && item.content);
    const pricing = getPricing() || {};
    const services = getServiceTypes() || [];

    const titleIn = input({
      value:
        (item && item.title) ||
        (project ? `${project.name || "Project"} — Quote` : "Quote"),
    });
    const statusIn = select({}, DOC_STATUS, (item && item.status) || "draft");
    const versionIn = input({ value: (item && item.version) || "1.0" });
    const projectIn = projectOptions((item && item.projectId) || (project && project.id) || "");
    const clientIn = input({
      value: (item && item.clientName) || (project && project.clientName) || "",
    });
    const companyIn = input({
      value: (item && item.company) || (project && project.company) || "",
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
    const notesIn = textarea({});
    notesIn.value = (item && item.internalNotes) || "";

    const linesWrap = el("div", { className: "hq-quote-lines" });
    let lines = Array.isArray(content.lineItems) && content.lineItems.length
      ? content.lineItems.map((r) => ({ ...r }))
      : [
          {
            service: (project && project.serviceType) || "",
            description: serviceTypeLabel((project && project.serviceType) || "") || "",
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
            service: (linesWrap.querySelector(`[data-s="${i}"]`) || {}).value || row.service,
            description: (linesWrap.querySelector(`[data-d="${i}"]`) || {}).value || row.description,
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
        const block = el("div", { className: "hq-quote-line" });
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
            onClick: () => {
              lines.splice(i, 1);
              if (!lines.length) {
                lines.push({ service: "", description: "", quantity: 1, unitPrice: 0 });
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

    const form = el("form", { className: "hq-form" }, [
      fieldRow("Title *", titleIn),
      fieldRow("Status", statusIn),
      fieldRow("Version", versionIn),
      fieldRow("Project", projectIn),
      fieldRow("Client", clientIn),
      fieldRow("Company", companyIn),
      el("p", { className: "hq-summary-pill__label", text: "Line items" }),
      linesWrap,
      btn("+ Line", {
        className: "hq-btn hq-btn--small hq-btn--ghost",
        onClick: () => {
          lines.push({ service: "", description: "", quantity: 1, unitPrice: 0 });
          renderLines();
        },
      }),
      fieldRow("Discount (KRW)", discountIn),
      fieldRow("VAT rate (e.g. 0.1)", vatIn),
      totalsEl,
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
            service: (linesWrap.querySelector(`[data-s="${i}"]`) || {}).value || "",
            description: (linesWrap.querySelector(`[data-d="${i}"]`) || {}).value || "",
            quantity: (linesWrap.querySelector(`[data-q="${i}"]`) || {}).value || 0,
            unitPrice: (linesWrap.querySelector(`[data-u="${i}"]`) || {}).value || 0,
          });
        });
        const totals = calcQuoteTotals(collected, discountIn.value, vatIn.value);
        if (!totals.lineItems.length || totals.total < 0) {
          toast("Invalid quote lines", "err");
          return;
        }
        const payload = {
          title,
          type: "quote",
          status: statusIn.value,
          version: versionIn.value.trim() || "1.0",
          projectId: projectIn.value || null,
          leadId: projectById(projectIn.value)?.leadId || (project && project.leadId) || null,
          clientName: clientIn.value.trim(),
          company: companyIn.value.trim(),
          content: {
            currency: "KRW",
            lineItems: totals.lineItems,
            discount: totals.discount,
            vatRate: Number(vatIn.value) || 0,
            subtotal: totals.subtotal,
            vat: totals.vat,
            total: totals.total,
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

    openModal(isEdit ? "Edit Quote" : "Create Quote", form, [cancelBtn, saveBtn]);
    const modal = document.getElementById("hq-modal");
    if (modal) modal.classList.add("hq-modal--wide");
  }

  function openDocCreator(type, project) {
    if (type === "quote") openQuoteBuilder(null, { project });
    else openGenericDocForm(null, { type, project, lockType: true });
  }

  function printDocument(d) {
    const content = asContent(d.content);
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) {
      toast("Allow popups to print", "err");
      return;
    }
    const docEl = w.document;
    docEl.open();
    docEl.write(
      "<!DOCTYPE html><html><head><meta charset='utf-8'><title></title><style>body{font-family:system-ui,sans-serif;padding:32px;color:#111;max-width:800px;margin:0 auto}h1{font-size:22px;margin:0 0 8px}h2{font-size:14px;letter-spacing:.08em;text-transform:uppercase;margin:24px 0 8px;color:#555}.meta{color:#555;font-size:13px;margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{color:#555;font-size:11px;text-transform:uppercase}.total{font-weight:700;font-size:16px;margin-top:12px}pre{white-space:pre-wrap;font-family:inherit;font-size:13px;line-height:1.5}</style></head><body></body></html>"
    );
    docEl.close();
    const body = docEl.body;
    const h1 = docEl.createElement("h1");
    h1.textContent = d.title || "Document";
    body.appendChild(h1);
    const addMeta = (label, val) => {
      const p = docEl.createElement("p");
      p.className = "meta";
      p.textContent = `${label}: ${val || "—"}`;
      body.appendChild(p);
    };
    addMeta("Type", docTypeLabel(d.type));
    addMeta("Status", d.status);
    addMeta("Client", d.clientName);
    addMeta("Company", d.company);
    addMeta("Version", d.version);
    addMeta("Updated", ymd(d.updatedAt));

    if (d.type === "quote" && Array.isArray(content.lineItems)) {
      const h2 = docEl.createElement("h2");
      h2.textContent = "Quote lines";
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
        [row.service, row.description, row.quantity, row.unitPrice, row.amount].forEach((v) => {
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
      total.textContent = `Total ${formatKrw(content.total || 0)} (VAT ${formatKrw(
        content.vat || 0
      )})`;
      body.appendChild(total);
    } else if (d.type === "invoice") {
      addMeta("Invoice #", content.invoiceNumber);
      addMeta("Issue", content.issueDate);
      addMeta("Due", content.dueDate);
      addMeta("Subtotal", formatKrw(content.subtotal || 0));
      addMeta("Tax", formatKrw(content.tax || 0));
      addMeta("Total", formatKrw(content.total || 0));
    } else if (d.type === "contract") {
      addMeta("Amount", formatKrw(content.contractAmount || 0));
      addMeta("Start", content.startDate);
      addMeta("End", content.endDate);
      addMeta("Payment terms", content.paymentTerms);
    } else {
      const fields =
        d.type === "scope" ? SCOPE_FIELDS : d.type === "requirements" ? REQ_FIELDS : null;
      if (fields) {
        fields.forEach(([key, label]) => {
          if (!content[key]) return;
          const h2 = docEl.createElement("h2");
          h2.textContent = label;
          body.appendChild(h2);
          const pre = docEl.createElement("pre");
          pre.textContent = content[key];
          body.appendChild(pre);
        });
      } else if (content.body) {
        const pre = docEl.createElement("pre");
        pre.textContent = content.body;
        body.appendChild(pre);
      }
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
      el("div", { className: "hq-surface-panel", style: "margin-bottom:0.85rem" }, [
        el("div", { className: "hq-surface-panel__body", style: "padding:1.1rem 1.05rem" }, [
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
          ]),
        ]),
      ])
    );

    root.appendChild(
      el("div", { className: "hq-grid-2--equal hq-grid-2" }, [
        surfacePanel("Overview", [
          el("div", { className: "hq-pipeline" }, [
            el("p", { className: "hq-row__meta", text: `Type: ${docTypeLabel(d.type)}` }),
            el("p", { className: "hq-row__meta", text: `Status: ${d.status || "—"}` }),
            el("p", { className: "hq-row__meta", text: `Version: ${d.version || "—"}` }),
          ]),
        ]),
        surfacePanel("Client", [
          el("div", { className: "hq-pipeline" }, [
            el("p", { className: "hq-row__meta", text: `Name: ${d.clientName || "—"}` }),
            el("p", { className: "hq-row__meta", text: `Company: ${d.company || "—"}` }),
          ]),
        ]),
      ])
    );

    root.appendChild(el("div", { style: "height:0.85rem" }));
    const contentKids = [];
    if (d.type === "quote" && Array.isArray(content.lineItems)) {
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
        table(["Service", "Description", "Qty", "Unit", "Amount"], rows, "No lines")
      );
      contentKids.push(
        el("p", {
          className: "hq-row__meta",
          style: "padding:0.75rem 1rem",
          text: `Subtotal ${formatKrw(content.subtotal || 0)} · Discount ${formatKrw(
            content.discount || 0
          )} · VAT ${formatKrw(content.vat || 0)} · Total ${formatKrw(content.total || 0)}`,
        })
      );
    } else {
      const fields =
        d.type === "scope" ? SCOPE_FIELDS : d.type === "requirements" ? REQ_FIELDS : null;
      if (fields) {
        fields.forEach(([key, label]) => {
          contentKids.push(
            el("div", { style: "padding:0.55rem 1.05rem" }, [
              el("p", { className: "hq-summary-pill__label", text: label }),
              el("p", { className: "hq-row__meta", text: content[key] || "—" }),
            ])
          );
        });
      } else if (d.type === "contract" || d.type === "invoice") {
        Object.keys(content).forEach((k) => {
          let val = content[k];
          if (typeof val === "number" && /amount|total|subtotal|tax/i.test(k)) {
            val = formatKrw(val);
          }
          contentKids.push(
            el("p", {
              className: "hq-row__meta",
              style: "padding:0.35rem 1.05rem",
              text: `${k}: ${val == null || val === "" ? "—" : val}`,
            })
          );
        });
      } else {
        contentKids.push(
          el("p", {
            className: "hq-row__meta",
            style: "padding:1rem 1.05rem;white-space:pre-wrap",
            text: content.body || "No content",
          })
        );
      }
    }
    root.appendChild(surfacePanel("Content", contentKids));

    root.appendChild(el("div", { style: "height:0.85rem" }));
    root.appendChild(
      el("div", { className: "hq-grid-2--equal hq-grid-2" }, [
        surfacePanel("Project", [
          el("div", { className: "hq-pipeline" }, [
            el("p", {
              className: "hq-row__meta",
              text: project ? project.name || project.id : d.projectId || "Not linked",
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
            el("p", { className: "hq-row__meta", text: `Created: ${ymd(d.createdAt) || "—"}` }),
            el("p", { className: "hq-row__meta", text: `Updated: ${ymd(d.updatedAt) || "—"}` }),
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

    if (!d.archived) {
      root.appendChild(
        el("div", { className: "hq-session-box" }, [
          el("p", { className: "hq-session-box__title", text: "Archive" }),
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

    root.appendChild(
      pageHeader("documents", [
        btn("+ New Document", { onClick: () => openGenericDocForm(null) }),
        btn("+ Quote", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => openQuoteBuilder(null),
        }),
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
    ]) {
      seg.appendChild(
        el("button", {
          type: "button",
          className: "hq-seg__btn" + (filters.status === val ? " is-active" : ""),
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
        className: "hq-seg__btn" + (filters.archived === "archived" ? " is-active" : ""),
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

    const list = filteredDocuments().slice().sort((a, b) => {
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
      tr.appendChild(el("td", { text: (proj && proj.name) || d.projectId || "—" }));
      tr.appendChild(el("td", null, [badge(d.status || "—", d.status)]));
      tr.appendChild(el("td", { text: ymd(d.updatedAt) || ymd(d.createdAt) || "—" }));
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
      top.appendChild(el("p", { className: "hq-item-card__title", text: d.title || "—" }));
      top.appendChild(badge(d.status || "—", d.status));
      card.appendChild(top);
      card.appendChild(
        el("p", {
          className: "hq-item-card__meta",
          text: `${docTypeLabel(d.type)} · ${d.clientName || "—"} · ${ymd(d.updatedAt) || "—"}`,
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
        mid.appendChild(el("p", { className: "hq-row__title", text: d.title || "—" }));
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

    function redraw() {
      clear(body);
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
        row.appendChild(el("span", { className: "hq-row__title", text: item.label }));
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
    redraw();

    const addIn = input({ placeholder: "Add checklist item" });
    const wrap = el("div", null, [
      body,
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
      (d) => d.type === "contract" && ["draft", "sent", "approved"].includes(d.status)
    ).length;
    const unpaid = docs.filter(
      (d) => d.type === "invoice" && ["draft", "sent", "approved"].includes(d.status)
    ).length;
    const upcoming = (cache().projects || []).filter((p) => {
      if (p.archived) return false;
      const cl = Array.isArray(p.deliveryChecklist) ? p.deliveryChecklist : [];
      return cl.length > 0 && cl.some((i) => !i.done);
    }).length;
    return { draft, quotesWaiting, contractsWaiting, unpaid, upcoming };
  }

  function renderDashboardDocsPanel() {
    const s = dashboardDocStats();
    return el("div", { className: "hq-summary-strip" }, [
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "Draft docs" }),
        el("p", { className: "hq-summary-pill__value", text: String(s.draft) }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "Quotes awaiting" }),
        el("p", { className: "hq-summary-pill__value", text: String(s.quotesWaiting) }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "Contracts awaiting" }),
        el("p", { className: "hq-summary-pill__value", text: String(s.contractsWaiting) }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "Unpaid invoices" }),
        el("p", { className: "hq-summary-pill__value", text: String(s.unpaid) }),
      ]),
      el("div", { className: "hq-summary-pill" }, [
        el("p", { className: "hq-summary-pill__label", text: "Upcoming deliveries" }),
        el("p", { className: "hq-summary-pill__value", text: String(s.upcoming) }),
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
    getDetailId() {
      return documentDetailId;
    },
  };
}
