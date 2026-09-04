/**
 * Newon HQ Phase 2D — Clients & Companies CRM (Customer 360).
 * Optional ID refs only. No migration. String client fields remain fallback.
 */

export const CRM_STATUS = ["prospect", "active", "inactive", "past"];
export const CRM_STATUS_LABEL = {
  prospect: "Prospect",
  active: "Active",
  inactive: "Inactive",
  past: "Past",
};

function normEmail(v) {
  return String(v || "")
    .trim()
    .toLowerCase();
}

function normPhone(v) {
  return String(v || "").replace(/\D/g, "");
}

function parseTags(raw) {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean);
  }
  return String(raw || "")
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function tagsText(tags) {
  return parseTags(tags).join(", ");
}

export function installHqCrm(api) {
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
    refreshAndRender,
    showPanel,
    openLeadForm,
    openProjectForm,
    ensureDocsMod,
    projectStatusBadge,
    statusBadge,
    projectHealth,
  } = api;

  let mode = "people"; // people | companies
  let detailKind = null; // client | company | null
  let detailId = null;
  let clientTab = "overview";
  let companyTab = "overview";
  let filters = {
    people: { status: "", companyId: "", tag: "", q: "", archived: "active", sort: "name" },
    companies: { status: "", industry: "", tag: "", q: "", archived: "active", sort: "name" },
  };

  function cache() {
    return getCache();
  }
  function ctx() {
    return getCtx();
  }

  function clientsList() {
    return cache().clients || [];
  }
  function companiesList() {
    return cache().companies || [];
  }

  function clientById(id) {
    if (!id) return null;
    return clientsList().find((c) => c.id === id) || null;
  }
  function companyById(id) {
    if (!id) return null;
    return companiesList().find((c) => c.id === id) || null;
  }

  function companyOptions(selected, includeEmpty) {
    const opts = (includeEmpty !== false ? [{ value: "", label: "— None —" }] : []).concat(
      companiesList()
        .filter((c) => !c.archived)
        .slice()
        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
        .map((c) => ({ value: c.id, label: c.name || c.id }))
    );
    return select({}, opts, selected || "");
  }

  function clientOptions(selected) {
    const opts = [{ value: "", label: "— None —" }].concat(
      clientsList()
        .filter((c) => !c.archived)
        .slice()
        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
        .map((c) => {
          const co = c.companyId ? companyById(c.companyId) : null;
          const label = co
            ? `${c.name || c.id} · ${co.name || ""}`
            : c.name || c.id;
          return { value: c.id, label };
        })
    );
    return select({}, opts, selected || "");
  }

  function findDuplicateClients(email, phone, excludeId) {
    const em = normEmail(email);
    const ph = normPhone(phone);
    return clientsList().filter((c) => {
      if (excludeId && c.id === excludeId) return false;
      if (c.archived) return false;
      const sameEmail = em && normEmail(c.email) === em;
      const samePhone = ph && ph.length >= 7 && normPhone(c.phone) === ph;
      return sameEmail || samePhone;
    });
  }

  function findDuplicateCompanies(name, excludeId) {
    const n = String(name || "")
      .trim()
      .toLowerCase();
    if (!n) return [];
    return companiesList().filter((c) => {
      if (excludeId && c.id === excludeId) return false;
      if (c.archived) return false;
      return String(c.name || "")
        .trim()
        .toLowerCase() === n;
    });
  }

  function lastActivityYmd(dates) {
    const list = dates.filter(Boolean).map((d) => ymd(d)).filter(Boolean);
    if (!list.length) return null;
    return list.sort().reverse()[0];
  }

  function projectsForClient(clientId) {
    return (cache().projects || []).filter(
      (p) => !p.archived && p.clientId === clientId
    );
  }
  function projectsForCompany(companyId) {
    return (cache().projects || []).filter(
      (p) => !p.archived && p.companyId === companyId
    );
  }
  function leadsForClient(clientId) {
    return (cache().leads || []).filter(
      (l) => !l.archived && l.clientId === clientId
    );
  }
  function leadsForCompany(companyId) {
    return (cache().leads || []).filter(
      (l) => !l.archived && l.companyId === companyId
    );
  }
  function docsForClient(clientId) {
    return (cache().documents || []).filter(
      (d) => !d.archived && d.clientId === clientId
    );
  }
  function docsForCompany(companyId) {
    return (cache().documents || []).filter(
      (d) => !d.archived && d.companyId === companyId
    );
  }

  function relatedProjectIds(kind, id) {
    const projects =
      kind === "client" ? projectsForClient(id) : projectsForCompany(id);
    return new Set(projects.map((p) => p.id));
  }

  function financeForEntity(kind, id) {
    const pids = relatedProjectIds(kind, id);
    return (cache().finance || []).filter((f) => {
      if (f.archived) return false;
      if (kind === "client" && f.clientId === id) return true;
      if (kind === "company" && f.companyId === id) return true;
      if (f.projectId && pids.has(f.projectId)) return true;
      return false;
    });
  }

  function invoicesForEntity(kind, id) {
    const pids = relatedProjectIds(kind, id);
    const direct =
      kind === "client" ? docsForClient(id) : docsForCompany(id);
    const byProject = (cache().documents || []).filter(
      (d) =>
        !d.archived &&
        d.type === "invoice" &&
        d.projectId &&
        pids.has(d.projectId)
    );
    const map = new Map();
    [...direct.filter((d) => d.type === "invoice"), ...byProject].forEach((d) =>
      map.set(d.id, d)
    );
    return [...map.values()];
  }

  function revenueStats(kind, id) {
    const fin = financeForEntity(kind, id);
    let recorded = 0;
    fin.forEach((f) => {
      if (f.type === "income") recorded += Number(f.amount) || 0;
    });
    let outstanding = 0;
    let paid = 0;
    invoicesForEntity(kind, id).forEach((inv) => {
      const c = inv.content && typeof inv.content === "object" ? inv.content : {};
      const total = Number(c.total) || Number(c.amount) || 0;
      if (inv.status === "completed") paid += total;
      else outstanding += total;
    });
    const projects =
      kind === "client" ? projectsForClient(id) : projectsForCompany(id);
    const projectValue = projects.reduce(
      (s, p) => s + (Number(p.budget) || 0),
      0
    );
    return { recorded, outstanding, paid, projectValue };
  }

  function entityLastActivity(kind, id) {
    const dates = [];
    const push = (rows, keys) => {
      rows.forEach((r) => keys.forEach((k) => dates.push(r[k])));
    };
    if (kind === "client") {
      const c = clientById(id);
      if (c) dates.push(c.updatedAt, c.createdAt);
      push(leadsForClient(id), ["updatedAt", "createdAt"]);
      push(projectsForClient(id), ["updatedAt", "createdAt"]);
      push(docsForClient(id), ["updatedAt", "createdAt"]);
      push(financeForEntity("client", id), ["date", "updatedAt", "createdAt"]);
    } else {
      const c = companyById(id);
      if (c) dates.push(c.updatedAt, c.createdAt);
      push(leadsForCompany(id), ["updatedAt", "createdAt"]);
      push(projectsForCompany(id), ["updatedAt", "createdAt"]);
      push(docsForCompany(id), ["updatedAt", "createdAt"]);
      push(clientsList().filter((x) => x.companyId === id && !x.archived), [
        "updatedAt",
        "createdAt",
      ]);
      push(financeForEntity("company", id), ["date", "updatedAt", "createdAt"]);
    }
    return lastActivityYmd(dates);
  }

  function openCompanyForm(item, opts) {
    opts = opts || {};
    const isEdit = !!item;
    const nameIn = input({
      value: (item && item.name) || opts.name || "",
      required: true,
    });
    const websiteIn = input({ value: (item && item.website) || "" });
    const industryIn = input({ value: (item && item.industry) || "" });
    const sizeIn = input({ value: (item && item.size) || "" });
    const emailIn = input({ type: "email", value: (item && item.email) || "" });
    const phoneIn = input({ value: (item && item.phone) || "" });
    const addressIn = textarea({});
    addressIn.value = (item && item.address) || "";
    const statusIn = select(
      {},
      CRM_STATUS.map((s) => ({ value: s, label: CRM_STATUS_LABEL[s] || s })),
      (item && item.status) || "prospect"
    );
    const tagsIn = input({
      value: tagsText(item && item.tags),
      placeholder: "VIP, Startup, SMB…",
    });
    const notesIn = textarea({});
    notesIn.value = (item && item.notes) || "";
    const warn = el("p", { className: "hq-row__meta", text: "" });

    const form = el("form", { className: "hq-form" }, [
      fieldRow("Company name *", nameIn),
      fieldRow("Website", websiteIn),
      fieldRow("Industry", industryIn),
      fieldRow("Size", sizeIn),
      fieldRow("Email", emailIn),
      fieldRow("Phone", phoneIn),
      fieldRow("Address", addressIn),
      fieldRow("Status", statusIn),
      fieldRow("Tags", tagsIn),
      fieldRow("Notes", notesIn),
      warn,
    ]);

    const checkDup = () => {
      const dups = findDuplicateCompanies(nameIn.value, item && item.id);
      warn.textContent = dups.length
        ? `Possible duplicate company: ${dups
            .slice(0, 3)
            .map((d) => d.name)
            .join(", ")}`
        : "";
    };
    nameIn.addEventListener("input", checkDup);
    checkDup();

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
          toast("Company name required", "err");
          return;
        }
        if (!CRM_STATUS.includes(statusIn.value)) {
          toast("Invalid status", "err");
          return;
        }
        const payload = {
          name,
          website: websiteIn.value.trim(),
          industry: industryIn.value.trim(),
          size: sizeIn.value.trim(),
          email: emailIn.value.trim(),
          phone: phoneIn.value.trim(),
          address: addressIn.value.trim(),
          status: statusIn.value,
          tags: parseTags(tagsIn.value),
          notes: notesIn.value.trim(),
          archived: !!(item && item.archived),
          updatedAt: serverTimestamp(),
          updatedBy: uid(),
        };
        try {
          let id = item && item.id;
          if (isEdit) {
            await updateDoc(doc(ctx().db, COL.companies, item.id), payload);
          } else {
            const ref = await addDoc(collection(ctx().db, COL.companies), {
              ...payload,
              archived: false,
              createdAt: serverTimestamp(),
              createdBy: uid(),
            });
            id = ref.id;
          }
          closeModal();
          toast(isEdit ? "Company saved" : "Company created", "ok");
          if (typeof opts.onCreated === "function") opts.onCreated(id, payload);
          if (!opts.skipRefresh) await refreshAndRender();
        } catch {
          toast("Save failed", "err");
        }
      })
    );
    openModal(isEdit ? "Edit Company" : "New Company", form, [cancelBtn, saveBtn]);
  }

  function openClientForm(item, opts) {
    opts = opts || {};
    const isEdit = !!item;
    const lead = opts.lead || null;
    const nameIn = input({
      value: (item && item.name) || (lead && lead.name) || opts.name || "",
      required: true,
    });
    const emailIn = input({
      type: "email",
      value: (item && item.email) || (lead && lead.email) || opts.email || "",
    });
    const phoneIn = input({
      value: (item && item.phone) || (lead && lead.phone) || opts.phone || "",
    });
    const jobIn = input({ value: (item && item.jobTitle) || "" });
    const companyIn = companyOptions(
      (item && item.companyId) ||
        (lead && lead.companyId) ||
        opts.companyId ||
        ""
    );
    const statusIn = select(
      {},
      CRM_STATUS.map((s) => ({ value: s, label: CRM_STATUS_LABEL[s] || s })),
      (item && item.status) || "prospect"
    );
    const sourceIn = input({
      value: (item && item.source) || (lead && lead.source) || "",
    });
    const tagsIn = input({
      value: tagsText(item && item.tags),
      placeholder: "VIP, Startup, Design…",
    });
    const notesIn = textarea({});
    notesIn.value = (item && item.notes) || (lead && lead.notes) || "";
    const warn = el("p", { className: "hq-row__meta", text: "" });

    const form = el("form", { className: "hq-form" }, [
      fieldRow("Name *", nameIn),
      fieldRow("Email", emailIn),
      fieldRow("Phone", phoneIn),
      fieldRow("Job title", jobIn),
      fieldRow("Company", companyIn),
      el("div", { className: "hq-toolbar", style: "margin:0 0 0.75rem" }, [
        btn("Create New Company", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          type: "button",
          onClick: (e) => {
            e.preventDefault();
            openCompanyForm(null, {
              name: lead && lead.company ? lead.company : "",
              skipRefresh: true,
              onCreated: (id, payload) => {
                companyIn.appendChild(
                  el("option", {
                    value: id,
                    text: (payload && payload.name) || id,
                    selected: true,
                  })
                );
                companyIn.value = id;
              },
            });
          },
        }),
      ]),
      fieldRow("Status", statusIn),
      fieldRow("Source", sourceIn),
      fieldRow("Tags", tagsIn),
      fieldRow("Notes", notesIn),
      warn,
    ]);

    const checkDup = () => {
      const dups = findDuplicateClients(
        emailIn.value,
        phoneIn.value,
        item && item.id
      );
      warn.textContent = dups.length
        ? `Possible duplicate client: ${dups
            .slice(0, 3)
            .map((d) => d.name || d.email || d.id)
            .join(", ")}`
        : "";
    };
    emailIn.addEventListener("input", checkDup);
    phoneIn.addEventListener("input", checkDup);
    checkDup();

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
          toast("Name required", "err");
          return;
        }
        if (!CRM_STATUS.includes(statusIn.value)) {
          toast("Invalid status", "err");
          return;
        }
        const payload = {
          name,
          email: emailIn.value.trim(),
          phone: phoneIn.value.trim(),
          jobTitle: jobIn.value.trim(),
          companyId: companyIn.value || null,
          status: statusIn.value,
          source: sourceIn.value.trim(),
          tags: parseTags(tagsIn.value),
          notes: notesIn.value.trim(),
          archived: !!(item && item.archived),
          updatedAt: serverTimestamp(),
          updatedBy: uid(),
        };
        try {
          let id = item && item.id;
          if (isEdit) {
            await updateDoc(doc(ctx().db, COL.clients, item.id), payload);
          } else {
            const ref = await addDoc(collection(ctx().db, COL.clients), {
              ...payload,
              archived: false,
              createdAt: serverTimestamp(),
              createdBy: uid(),
            });
            id = ref.id;
          }
          if (lead && lead.id && id) {
            const leadPatch = {
              clientId: id,
              updatedAt: serverTimestamp(),
              updatedBy: uid(),
            };
            if (payload.companyId) leadPatch.companyId = payload.companyId;
            await updateDoc(doc(ctx().db, COL.leads, lead.id), leadPatch);
          }
          closeModal();
          toast(isEdit ? "Client saved" : "Client created", "ok");
          if (typeof opts.onCreated === "function") opts.onCreated(id);
          detailKind = "client";
          detailId = id;
          mode = "people";
          await refreshAndRender();
          showPanel("clients");
        } catch {
          toast("Save failed", "err");
        }
      })
    );
    openModal(
      isEdit ? "Edit Client" : lead ? "Create Client from Lead" : "New Client",
      form,
      [cancelBtn, saveBtn]
    );
  }

  function openLinkClientModal(lead) {
    const clientIn = clientOptions(lead.clientId || "");
    const form = el("form", { className: "hq-form" }, [
      el("p", {
        className: "hq-row__meta",
        text: `Link an existing client to ${lead.name || "this lead"}. Lead status will not change.`,
      }),
      fieldRow("Client", clientIn),
    ]);
    const saveBtn = btn("Link", { type: "submit", dataset: { hqSave: "1" } });
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
        const clientId = clientIn.value || null;
        if (!clientId) {
          toast("Select a client", "err");
          return;
        }
        const c = clientById(clientId);
        try {
          await updateDoc(doc(ctx().db, COL.leads, lead.id), {
            clientId,
            companyId: (c && c.companyId) || lead.companyId || null,
            updatedAt: serverTimestamp(),
            updatedBy: uid(),
          });
          closeModal();
          toast("Client linked", "ok");
          await refreshAndRender();
        } catch {
          toast("Link failed", "err");
        }
      })
    );
    openModal("Link Client", form, [cancelBtn, saveBtn]);
  }

  function fillFromClient(client, fields) {
    if (!client || !fields) return;
    // Prefill only; caller owns inputs — set values so user can edit before save.
    if (fields.name) fields.name.value = client.name || fields.name.value;
    if (fields.email) fields.email.value = client.email || fields.email.value;
    if (fields.phone) fields.phone.value = client.phone || fields.phone.value;
    if (fields.company) {
      const co = client.companyId ? companyById(client.companyId) : null;
      if (co) fields.company.value = co.name || fields.company.value;
    }
    if (fields.clientEmail) fields.clientEmail.value = client.email || fields.clientEmail.value;
    if (fields.clientPhone) fields.clientPhone.value = client.phone || fields.clientPhone.value;
    if (fields.clientName) fields.clientName.value = client.name || fields.clientName.value;
    if (fields.companyId && client.companyId) fields.companyId.value = client.companyId;
  }

  function renderModeTabs() {
    const wrap = el("div", { className: "hq-seg" });
    [
      ["people", "People"],
      ["companies", "Companies"],
    ].forEach(([id, label]) => {
      wrap.appendChild(
        el("button", {
          type: "button",
          className: "hq-seg__btn" + (mode === id ? " is-active" : ""),
          text: label,
          onClick: () => {
            mode = id;
            detailKind = null;
            detailId = null;
            renderClients(document.getElementById("hq-panel-clients"));
          },
        })
      );
    });
    return wrap;
  }

  function renderDetailTabs(active, onChange, items) {
    const wrap = el("div", { className: "hq-tabs" });
    items.forEach(([id, label]) => {
      wrap.appendChild(
        el("button", {
          type: "button",
          className: "hq-tabs__btn" + (active === id ? " is-active" : ""),
          text: label,
          onClick: () => onChange(id),
        })
      );
    });
    return wrap;
  }

  function linkBtn(label, onClick) {
    return btn(label, {
      className: "hq-btn hq-btn--small hq-btn--ghost",
      onClick,
    });
  }

  function renderPeopleList(root) {
    const f = filters.people;
    let list = clientsList().filter((c) => {
      if (f.archived === "active" && c.archived) return false;
      if (f.archived === "archived" && !c.archived) return false;
      if (f.status && c.status !== f.status) return false;
      if (f.companyId && c.companyId !== f.companyId) return false;
      if (f.tag) {
        const tags = parseTags(c.tags).map((t) => t.toLowerCase());
        if (!tags.includes(f.tag.toLowerCase())) return false;
      }
      if (f.q) {
        const q = f.q.toLowerCase();
        const co = c.companyId ? companyById(c.companyId) : null;
        const hay = `${c.name || ""} ${c.email || ""} ${c.phone || ""} ${
          (co && co.name) || ""
        } ${tagsText(c.tags)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = list.slice().sort((a, b) => {
      if (f.sort === "revenue") {
        return (
          revenueStats("client", b.id).recorded -
          revenueStats("client", a.id).recorded
        );
      }
      if (f.sort === "activity") {
        return String(entityLastActivity("client", b.id) || "").localeCompare(
          String(entityLastActivity("client", a.id) || "")
        );
      }
      return String(a.name || "").localeCompare(String(b.name || ""));
    });

    const allTags = new Set();
    clientsList().forEach((c) => parseTags(c.tags).forEach((t) => allTags.add(t)));

    root.appendChild(
      pageHeader("clients", [
        el("span", {
          className: "hq-page-header__count",
          text: `${list.length} shown`,
        }),
        btn("+ Client", { onClick: () => openClientForm(null) }),
        btn("+ Company", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => openCompanyForm(null),
        }),
      ])
    );
    root.appendChild(renderModeTabs());
    root.appendChild(el("div", { style: "height:0.65rem" }));

    const statusF = select(
      {
        onChange: (e) => {
          f.status = e.target.value;
          renderClients(root);
        },
      },
      [{ value: "", label: "All statuses" }].concat(
        CRM_STATUS.map((s) => ({ value: s, label: CRM_STATUS_LABEL[s] }))
      ),
      f.status
    );
    const companyF = companyOptions(f.companyId);
    companyF.addEventListener("change", () => {
      f.companyId = companyF.value;
      renderClients(root);
    });
    const tagF = select(
      {
        onChange: (e) => {
          f.tag = e.target.value;
          renderClients(root);
        },
      },
      [{ value: "", label: "All tags" }].concat(
        [...allTags].sort().map((t) => ({ value: t, label: t }))
      ),
      f.tag
    );
    const sortF = select(
      {
        onChange: (e) => {
          f.sort = e.target.value;
          renderClients(root);
        },
      },
      [
        { value: "name", label: "Sort: Name" },
        { value: "revenue", label: "Sort: Revenue" },
        { value: "activity", label: "Sort: Activity" },
      ],
      f.sort
    );
    const qIn = input({
      value: f.q,
      placeholder: "Search name / email / phone / company",
    });
    qIn.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        f.q = qIn.value.trim();
        renderClients(root);
      }
    });
    root.appendChild(
      toolbar([
        statusF,
        companyF,
        tagF,
        sortF,
        qIn,
        btn("Search", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => {
            f.q = qIn.value.trim();
            renderClients(root);
          },
        }),
        btn(f.archived === "archived" ? "Active" : "Archived", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => {
            f.archived = f.archived === "archived" ? "active" : "archived";
            renderClients(root);
          },
        }),
      ])
    );

    if (!clientsList().length && f.archived === "active") {
      root.appendChild(
        emptyState(
          "No clients yet",
          "Create a client or convert a lead into a CRM contact.",
          btn("+ Client", { onClick: () => openClientForm(null) })
        )
      );
      return;
    }
    if (!list.length) {
      root.appendChild(
        el("div", { style: "padding:1rem 0" }, [
          emptyMsg("No clients match filters."),
        ])
      );
      return;
    }

    const rows = list.map((c) => {
      const co = c.companyId ? companyById(c.companyId) : null;
      const projects = projectsForClient(c.id);
      const activeProjects = projects.filter((p) => p.status === "active").length;
      const rev = revenueStats("client", c.id).recorded;
      const tr = el("tr", {
        style: "cursor:pointer",
        onClick: () => {
          detailKind = "client";
          detailId = c.id;
          clientTab = "overview";
          renderClients(root);
        },
      });
      tr.appendChild(el("td", { text: c.name || "—" }));
      tr.appendChild(el("td", { text: (co && co.name) || "—" }));
      tr.appendChild(el("td", { text: c.email || "—" }));
      tr.appendChild(el("td", { text: c.phone || "—" }));
      tr.appendChild(el("td", null, [badge(CRM_STATUS_LABEL[c.status] || c.status || "—", c.status)]));
      tr.appendChild(el("td", { text: String(activeProjects) }));
      tr.appendChild(el("td", { text: formatKrw(rev) }));
      tr.appendChild(el("td", { text: entityLastActivity("client", c.id) || "—" }));
      const acts = el("td", { className: "hq-actions-cell" });
      acts.appendChild(
        btn("Edit", {
          className: "hq-btn hq-btn--small",
          onClick: (e) => {
            e.stopPropagation();
            openClientForm(c);
          },
        })
      );
      if (!c.archived) {
        acts.appendChild(
          btn("Archive", {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: (e) => {
              e.stopPropagation();
              confirmDelete("Archive this client?", async () => {
                try {
                  await updateDoc(doc(ctx().db, COL.clients, c.id), {
                    archived: true,
                    updatedAt: serverTimestamp(),
                    updatedBy: uid(),
                  });
                  toast("Archived", "ok");
                  await refreshAndRender();
                } catch {
                  toast("Archive failed", "err");
                }
              });
            },
          })
        );
      }
      tr.appendChild(acts);
      return tr;
    });
    root.appendChild(
      table(
        [
          "Name",
          "Company",
          "Email",
          "Phone",
          "Status",
          "Active Projects",
          "Total Revenue",
          "Last Activity",
          "",
        ],
        rows,
        "No clients"
      )
    );

    const cards = el("div", { className: "hq-card-list is-mobile-only" });
    list.forEach((c) => {
      const co = c.companyId ? companyById(c.companyId) : null;
      const card = el("article", {
        className: "hq-item-card",
        style: "cursor:pointer",
        onClick: () => {
          detailKind = "client";
          detailId = c.id;
          clientTab = "overview";
          renderClients(root);
        },
      });
      const top = el("div", { className: "hq-item-card__top" });
      top.appendChild(el("p", { className: "hq-item-card__title", text: c.name || "—" }));
      top.appendChild(badge(CRM_STATUS_LABEL[c.status] || c.status || "—", c.status));
      card.appendChild(top);
      card.appendChild(
        el("p", {
          className: "hq-item-card__meta",
          text: `${(co && co.name) || "—"} · ${c.email || "—"} · ${formatKrw(
            revenueStats("client", c.id).recorded
          )}`,
        })
      );
      cards.appendChild(card);
    });
    root.appendChild(cards);
  }

  function renderCompaniesList(root) {
    const f = filters.companies;
    let list = companiesList().filter((c) => {
      if (f.archived === "active" && c.archived) return false;
      if (f.archived === "archived" && !c.archived) return false;
      if (f.status && c.status !== f.status) return false;
      if (f.industry && String(c.industry || "") !== f.industry) return false;
      if (f.tag) {
        const tags = parseTags(c.tags).map((t) => t.toLowerCase());
        if (!tags.includes(f.tag.toLowerCase())) return false;
      }
      if (f.q) {
        const q = f.q.toLowerCase();
        const hay = `${c.name || ""} ${c.industry || ""} ${c.email || ""} ${tagsText(
          c.tags
        )}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = list.slice().sort((a, b) => {
      if (f.sort === "revenue") {
        return (
          revenueStats("company", b.id).recorded -
          revenueStats("company", a.id).recorded
        );
      }
      return String(a.name || "").localeCompare(String(b.name || ""));
    });

    const industries = [
      ...new Set(
        companiesList()
          .map((c) => c.industry)
          .filter(Boolean)
      ),
    ].sort();
    const allTags = new Set();
    companiesList().forEach((c) => parseTags(c.tags).forEach((t) => allTags.add(t)));

    root.appendChild(
      pageHeader("clients", [
        el("span", {
          className: "hq-page-header__count",
          text: `${list.length} companies`,
        }),
        btn("+ Company", { onClick: () => openCompanyForm(null) }),
        btn("+ Client", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => openClientForm(null),
        }),
      ])
    );
    root.appendChild(renderModeTabs());
    root.appendChild(el("div", { style: "height:0.65rem" }));

    const statusF = select(
      {
        onChange: (e) => {
          f.status = e.target.value;
          renderClients(root);
        },
      },
      [{ value: "", label: "All statuses" }].concat(
        CRM_STATUS.map((s) => ({ value: s, label: CRM_STATUS_LABEL[s] }))
      ),
      f.status
    );
    const indF = select(
      {
        onChange: (e) => {
          f.industry = e.target.value;
          renderClients(root);
        },
      },
      [{ value: "", label: "All industries" }].concat(
        industries.map((i) => ({ value: i, label: i }))
      ),
      f.industry
    );
    const tagF = select(
      {
        onChange: (e) => {
          f.tag = e.target.value;
          renderClients(root);
        },
      },
      [{ value: "", label: "All tags" }].concat(
        [...allTags].sort().map((t) => ({ value: t, label: t }))
      ),
      f.tag
    );
    const qIn = input({ value: f.q, placeholder: "Search companies" });
    root.appendChild(
      toolbar([
        statusF,
        indF,
        tagF,
        qIn,
        btn("Search", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => {
            f.q = qIn.value.trim();
            renderClients(root);
          },
        }),
        btn(f.archived === "archived" ? "Active" : "Archived", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => {
            f.archived = f.archived === "archived" ? "active" : "archived";
            renderClients(root);
          },
        }),
      ])
    );

    if (!companiesList().length && f.archived === "active") {
      root.appendChild(
        emptyState(
          "No companies yet",
          "Create a company to group clients and projects.",
          btn("+ Company", { onClick: () => openCompanyForm(null) })
        )
      );
      return;
    }
    if (!list.length) {
      root.appendChild(
        el("div", { style: "padding:1rem 0" }, [
          emptyMsg("No companies match filters."),
        ])
      );
      return;
    }

    const rows = list.map((c) => {
      const contacts = clientsList().filter(
        (x) => !x.archived && x.companyId === c.id
      ).length;
      const activeProjects = projectsForCompany(c.id).filter(
        (p) => p.status === "active"
      ).length;
      const rev = revenueStats("company", c.id).recorded;
      const tr = el("tr", {
        style: "cursor:pointer",
        onClick: () => {
          detailKind = "company";
          detailId = c.id;
          companyTab = "overview";
          renderClients(root);
        },
      });
      tr.appendChild(el("td", { text: c.name || "—" }));
      tr.appendChild(el("td", { text: c.industry || "—" }));
      tr.appendChild(el("td", null, [badge(CRM_STATUS_LABEL[c.status] || c.status || "—", c.status)]));
      tr.appendChild(el("td", { text: String(contacts) }));
      tr.appendChild(el("td", { text: String(activeProjects) }));
      tr.appendChild(el("td", { text: formatKrw(rev) }));
      tr.appendChild(el("td", { text: entityLastActivity("company", c.id) || "—" }));
      const acts = el("td", { className: "hq-actions-cell" });
      acts.appendChild(
        btn("Edit", {
          className: "hq-btn hq-btn--small",
          onClick: (e) => {
            e.stopPropagation();
            openCompanyForm(c);
          },
        })
      );
      if (!c.archived) {
        acts.appendChild(
          btn("Archive", {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: (e) => {
              e.stopPropagation();
              confirmDelete("Archive this company?", async () => {
                try {
                  await updateDoc(doc(ctx().db, COL.companies, c.id), {
                    archived: true,
                    updatedAt: serverTimestamp(),
                    updatedBy: uid(),
                  });
                  toast("Archived", "ok");
                  await refreshAndRender();
                } catch {
                  toast("Archive failed", "err");
                }
              });
            },
          })
        );
      }
      tr.appendChild(acts);
      return tr;
    });
    root.appendChild(
      table(
        [
          "Company",
          "Industry",
          "Status",
          "Contacts",
          "Active Projects",
          "Total Revenue",
          "Last Activity",
          "",
        ],
        rows,
        "No companies"
      )
    );

    const cards = el("div", { className: "hq-card-list is-mobile-only" });
    list.forEach((c) => {
      const card = el("article", {
        className: "hq-item-card",
        style: "cursor:pointer",
        onClick: () => {
          detailKind = "company";
          detailId = c.id;
          companyTab = "overview";
          renderClients(root);
        },
      });
      const top = el("div", { className: "hq-item-card__top" });
      top.appendChild(el("p", { className: "hq-item-card__title", text: c.name || "—" }));
      top.appendChild(badge(CRM_STATUS_LABEL[c.status] || c.status || "—", c.status));
      card.appendChild(top);
      card.appendChild(
        el("p", {
          className: "hq-item-card__meta",
          text: `${c.industry || "—"} · ${formatKrw(
            revenueStats("company", c.id).recorded
          )}`,
        })
      );
      cards.appendChild(card);
    });
    root.appendChild(cards);
  }

  function renderActivityFeed(events) {
    events.sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
    const wrap = el("div", { className: "hq-timeline" });
    if (!events.length) {
      wrap.appendChild(emptyMsg("No activity yet."));
      return wrap;
    }
    events.slice(0, 50).forEach((ev) => {
      const row = el("div", { className: "hq-timeline__item" });
      row.appendChild(el("div", { className: "hq-timeline__dot" }));
      const body = el("div");
      body.appendChild(el("p", { className: "hq-timeline__date", text: ev.at || "—" }));
      body.appendChild(el("p", { className: "hq-row__title", text: ev.text }));
      row.appendChild(body);
      wrap.appendChild(row);
    });
    return wrap;
  }

  function renderClientDetail(root, client) {
    const co = client.companyId ? companyById(client.companyId) : null;
    const stats = revenueStats("client", client.id);
    const projects = projectsForClient(client.id);
    const leads = leadsForClient(client.id);
    const docs = docsForClient(client.id);
    // Also include docs from linked projects
    const pids = new Set(projects.map((p) => p.id));
    (cache().documents || []).forEach((d) => {
      if (!d.archived && d.projectId && pids.has(d.projectId)) {
        if (!docs.find((x) => x.id === d.id)) docs.push(d);
      }
    });

    clear(root);
    root.appendChild(
      pageHeader("clients", [
        btn("← Back", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => {
            detailKind = null;
            detailId = null;
            renderClients(root);
          },
        }),
        btn("Edit", { onClick: () => openClientForm(client) }),
        btn("Create Lead", {
          className: "hq-btn hq-btn--ghost",
          onClick: () =>
            openLeadForm(null, {
              clientId: client.id,
              companyId: client.companyId || "",
              name: client.name,
              email: client.email,
              phone: client.phone,
              company: (co && co.name) || "",
            }),
        }),
        btn("Create Project", {
          className: "hq-btn hq-btn--ghost",
          onClick: () =>
            openProjectForm(null, {
              clientId: client.id,
              companyId: client.companyId || "",
              clientName: client.name,
              company: (co && co.name) || "",
              clientEmail: client.email,
              clientPhone: client.phone,
            }),
        }),
        btn("Create Document", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => ensureDocsMod().openDocCreator("quote", null),
        }),
        btn("Add Note", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => openClientForm(client),
        }),
      ])
    );

    const head = el("div", { className: "hq-surface-panel hq-project-hero" });
    head.appendChild(
      el("div", { className: "hq-surface-panel__body", style: "padding:1.1rem 1.05rem" }, [
        el("p", { className: "hq-eyebrow", text: "Client 360" }),
        el("h2", {
          className: "hq-page-header__title",
          style: "margin:0.2rem 0 0.35rem;font-size:1.65rem",
          text: client.name || "—",
        }),
        el("p", {
          className: "hq-page-header__desc",
          text: [
            co ? co.name : null,
            client.email,
            client.phone,
          ]
            .filter(Boolean)
            .join(" · ") || "—",
        }),
        el("div", { className: "hq-product-card__ops", style: "margin-top:0.75rem" }, [
          badge(CRM_STATUS_LABEL[client.status] || client.status || "—", client.status),
          ...parseTags(client.tags).map((t) => badge(t)),
          co
            ? linkBtn(co.name, () => {
                detailKind = "company";
                detailId = co.id;
                companyTab = "overview";
                renderClients(root);
              })
            : null,
        ].filter(Boolean)),
      ])
    );
    root.appendChild(head);
    root.appendChild(el("div", { style: "height:0.85rem" }));

    root.appendChild(
      renderDetailTabs(clientTab, (id) => {
        clientTab = id;
        renderClientDetail(root, clientById(client.id) || client);
      }, [
        ["overview", "Overview"],
        ["leads", "Leads"],
        ["projects", "Projects"],
        ["documents", "Documents"],
        ["finance", "Finance"],
        ["activity", "Activity"],
      ])
    );
    root.appendChild(el("div", { style: "height:0.85rem" }));

    if (clientTab === "leads") {
      if (!leads.length) root.appendChild(emptyMsg("No linked leads."));
      else {
        leads.forEach((l) => {
          const row = el("div", { className: "hq-row" });
          row.appendChild(statusBadge(l.status));
          const mid = el("div");
          mid.appendChild(el("p", { className: "hq-row__title", text: l.name || "—" }));
          mid.appendChild(
            el("p", {
              className: "hq-row__meta",
              text: `${l.source || ""} · ${ymd(l.createdAt) || ""}`,
            })
          );
          row.appendChild(mid);
          root.appendChild(row);
        });
      }
    } else if (clientTab === "projects") {
      const active = projects.filter((p) => p.status !== "completed" && p.status !== "cancelled");
      const done = projects.filter((p) => p.status === "completed");
      root.appendChild(
        surfacePanel(
          "Active / In progress",
          active.length
            ? active.map((p) => {
                const row = el("div", {
                  className: "hq-row",
                  style: "cursor:pointer",
                  onClick: () => {
                    api.setProjectDetailId(p.id);
                    showPanel("projects");
                  },
                });
                row.appendChild(projectStatusBadge(p.status));
                const mid = el("div");
                mid.appendChild(el("p", { className: "hq-row__title", text: p.name || "—" }));
                mid.appendChild(
                  el("p", {
                    className: "hq-row__meta",
                    text: `Progress ${p.progress != null ? p.progress : 0}% · Health ${
                      typeof projectHealth === "function" ? projectHealth(p) : "—"
                    }`,
                  })
                );
                row.appendChild(mid);
                return row;
              })
            : [el("div", { style: "padding:0.85rem 1.05rem" }, [emptyMsg("None")])]
        )
      );
      root.appendChild(el("div", { style: "height:0.85rem" }));
      root.appendChild(
        surfacePanel(
          "Completed",
          done.length
            ? done.map((p) => {
                const row = el("div", { className: "hq-row" });
                row.appendChild(projectStatusBadge(p.status));
                row.appendChild(
                  el("div", null, [
                    el("p", { className: "hq-row__title", text: p.name || "—" }),
                  ])
                );
                return row;
              })
            : [el("div", { style: "padding:0.85rem 1.05rem" }, [emptyMsg("None")])]
        )
      );
    } else if (clientTab === "documents") {
      if (!docs.length) root.appendChild(emptyMsg("No linked documents."));
      else {
        docs.forEach((d) => {
          const row = el("div", {
            className: "hq-row",
            style: "cursor:pointer",
            onClick: () => {
              if (typeof api.setDocumentDetailId === "function") {
                api.setDocumentDetailId(d.id);
              }
              showPanel("documents");
            },
          });
          row.appendChild(badge(d.type || "doc"));
          const mid = el("div");
          mid.appendChild(el("p", { className: "hq-row__title", text: d.title || "—" }));
          mid.appendChild(
            el("p", {
              className: "hq-row__meta",
              text: `${d.status || ""} · ${ymd(d.updatedAt) || ""}`,
            })
          );
          row.appendChild(mid);
          root.appendChild(row);
        });
      }
    } else if (clientTab === "finance") {
      root.appendChild(
        el("div", { className: "hq-stat-grid" }, [
          el("div", { className: "hq-card hq-stat" }, [
            el("p", { className: "hq-card__label", text: "Recorded revenue" }),
            el("p", { className: "hq-card__value", text: formatKrw(stats.recorded) }),
          ]),
          el("div", { className: "hq-card hq-stat" }, [
            el("p", { className: "hq-card__label", text: "Paid invoices" }),
            el("p", { className: "hq-card__value", text: formatKrw(stats.paid) }),
          ]),
          el("div", { className: "hq-card hq-stat" }, [
            el("p", { className: "hq-card__label", text: "Outstanding invoices" }),
            el("p", { className: "hq-card__value", text: formatKrw(stats.outstanding) }),
          ]),
          el("div", { className: "hq-card hq-stat" }, [
            el("p", { className: "hq-card__label", text: "Project value (budgets)" }),
            el("p", { className: "hq-card__value", text: formatKrw(stats.projectValue) }),
          ]),
        ])
      );
      root.appendChild(
        el("p", {
          className: "hq-stat__caption",
          style: "margin-top:0.75rem",
          text: "Budget, invoice amounts, and recorded revenue are shown separately.",
        })
      );
    } else if (clientTab === "activity") {
      const events = [];
      events.push({
        at: ymd(client.updatedAt) || ymd(client.createdAt),
        text: "Client updated",
      });
      leads.forEach((l) =>
        events.push({
          at: ymd(l.updatedAt) || ymd(l.createdAt),
          text: `Lead · ${l.name || "—"} (${l.status || ""})`,
        })
      );
      projects.forEach((p) =>
        events.push({
          at: ymd(p.updatedAt) || ymd(p.createdAt),
          text: `Project · ${p.name || "—"} (${p.status || ""})`,
        })
      );
      docs.forEach((d) =>
        events.push({
          at: ymd(d.updatedAt) || ymd(d.createdAt),
          text: `Document · ${d.type} · ${d.title || "—"}`,
        })
      );
      financeForEntity("client", client.id).forEach((f) =>
        events.push({
          at: ymd(f.date) || ymd(f.updatedAt),
          text: `Finance · ${f.type} ${formatKrw(f.amount)}`,
        })
      );
      root.appendChild(renderActivityFeed(events));
    } else {
      root.appendChild(
        el("div", { className: "hq-grid-2" }, [
          surfacePanel("Contact", [
            el("div", { className: "hq-pipeline" }, [
              el("p", { className: "hq-row__meta", text: `Email: ${client.email || "—"}` }),
              el("p", { className: "hq-row__meta", text: `Phone: ${client.phone || "—"}` }),
              el("p", {
                className: "hq-row__meta",
                text: `Job title: ${client.jobTitle || "—"}`,
              }),
              el("p", {
                className: "hq-row__meta",
                text: `Source: ${client.source || "—"}`,
              }),
              el("p", {
                className: "hq-row__meta",
                text: `Status: ${CRM_STATUS_LABEL[client.status] || client.status || "—"}`,
              }),
            ]),
          ]),
          surfacePanel("Company", [
            el("div", { className: "hq-pipeline" }, [
              el("p", {
                className: "hq-row__meta",
                text: co ? co.name : "Not linked",
              }),
              co
                ? btn("Open company", {
                    className: "hq-btn hq-btn--small",
                    onClick: () => {
                      detailKind = "company";
                      detailId = co.id;
                      renderClients(root);
                    },
                  })
                : null,
            ].filter(Boolean)),
          ]),
        ])
      );
      root.appendChild(el("div", { style: "height:0.85rem" }));
      root.appendChild(
        surfacePanel("Notes", [
          el("p", {
            className: "hq-row__meta",
            style: "padding:1rem 1.05rem;white-space:pre-wrap",
            text: client.notes || "—",
          }),
        ])
      );
      root.appendChild(el("div", { style: "height:0.85rem" }));
      root.appendChild(
        el("div", { className: "hq-stat-grid" }, [
          el("div", { className: "hq-card hq-stat" }, [
            el("p", { className: "hq-card__label", text: "Projects" }),
            el("p", { className: "hq-card__value", text: String(projects.length) }),
          ]),
          el("div", { className: "hq-card hq-stat" }, [
            el("p", { className: "hq-card__label", text: "Recorded revenue" }),
            el("p", { className: "hq-card__value", text: formatKrw(stats.recorded) }),
          ]),
          el("div", { className: "hq-card hq-stat" }, [
            el("p", { className: "hq-card__label", text: "Outstanding" }),
            el("p", { className: "hq-card__value", text: formatKrw(stats.outstanding) }),
          ]),
        ])
      );
    }

    if (!client.archived) {
      root.appendChild(
        el("div", { className: "hq-session-box" }, [
          el("p", { className: "hq-session-box__title", text: "Archive" }),
          btn("Archive Client", {
            className: "hq-btn hq-btn--ghost",
            onClick: () =>
              confirmDelete("Archive this client?", async () => {
                try {
                  await updateDoc(doc(ctx().db, COL.clients, client.id), {
                    archived: true,
                    updatedAt: serverTimestamp(),
                    updatedBy: uid(),
                  });
                  toast("Archived", "ok");
                  detailKind = null;
                  detailId = null;
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

  function renderCompanyDetail(root, company) {
    const contacts = clientsList().filter(
      (c) => !c.archived && c.companyId === company.id
    );
    const projects = projectsForCompany(company.id);
    const leads = leadsForCompany(company.id);
    const docs = docsForCompany(company.id);
    const pids = new Set(projects.map((p) => p.id));
    (cache().documents || []).forEach((d) => {
      if (!d.archived && d.projectId && pids.has(d.projectId)) {
        if (!docs.find((x) => x.id === d.id)) docs.push(d);
      }
    });
    const stats = revenueStats("company", company.id);

    clear(root);
    root.appendChild(
      pageHeader("clients", [
        btn("← Back", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => {
            detailKind = null;
            detailId = null;
            mode = "companies";
            renderClients(root);
          },
        }),
        btn("Edit", { onClick: () => openCompanyForm(company) }),
        btn("+ Contact", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => openClientForm(null, { companyId: company.id }),
        }),
        btn("Create Project", {
          className: "hq-btn hq-btn--ghost",
          onClick: () =>
            openProjectForm(null, {
              companyId: company.id,
              company: company.name,
            }),
        }),
      ])
    );

    const head = el("div", { className: "hq-surface-panel hq-project-hero" });
    head.appendChild(
      el("div", { className: "hq-surface-panel__body", style: "padding:1.1rem 1.05rem" }, [
        el("p", { className: "hq-eyebrow", text: "Company 360" }),
        el("h2", {
          className: "hq-page-header__title",
          style: "margin:0.2rem 0 0.35rem;font-size:1.65rem",
          text: company.name || "—",
        }),
        el("p", {
          className: "hq-page-header__desc",
          text: [company.industry, company.website, company.email]
            .filter(Boolean)
            .join(" · ") || "—",
        }),
        el("div", { className: "hq-product-card__ops", style: "margin-top:0.75rem" }, [
          badge(CRM_STATUS_LABEL[company.status] || company.status || "—", company.status),
          ...parseTags(company.tags).map((t) => badge(t)),
        ]),
      ])
    );
    root.appendChild(head);
    root.appendChild(el("div", { style: "height:0.85rem" }));
    root.appendChild(
      renderDetailTabs(companyTab, (id) => {
        companyTab = id;
        renderCompanyDetail(root, companyById(company.id) || company);
      }, [
        ["overview", "Overview"],
        ["contacts", "Contacts"],
        ["leads", "Leads"],
        ["projects", "Projects"],
        ["documents", "Documents"],
        ["finance", "Finance"],
        ["activity", "Activity"],
      ])
    );
    root.appendChild(el("div", { style: "height:0.85rem" }));

    if (companyTab === "contacts") {
      if (!contacts.length) root.appendChild(emptyMsg("No contacts linked."));
      else
        contacts.forEach((c) => {
          const row = el("div", {
            className: "hq-row",
            style: "cursor:pointer",
            onClick: () => {
              detailKind = "client";
              detailId = c.id;
              mode = "people";
              renderClients(root);
            },
          });
          row.appendChild(badge(CRM_STATUS_LABEL[c.status] || c.status || "—", c.status));
          const mid = el("div");
          mid.appendChild(el("p", { className: "hq-row__title", text: c.name || "—" }));
          mid.appendChild(
            el("p", {
              className: "hq-row__meta",
              text: `${c.email || "—"} · ${c.phone || "—"}`,
            })
          );
          row.appendChild(mid);
          root.appendChild(row);
        });
    } else if (companyTab === "leads") {
      if (!leads.length) root.appendChild(emptyMsg("No linked leads."));
      else
        leads.forEach((l) => {
          const row = el("div", { className: "hq-row" });
          row.appendChild(statusBadge(l.status));
          row.appendChild(
            el("div", null, [
              el("p", { className: "hq-row__title", text: l.name || "—" }),
            ])
          );
          root.appendChild(row);
        });
    } else if (companyTab === "projects") {
      if (!projects.length) root.appendChild(emptyMsg("No linked projects."));
      else
        projects.forEach((p) => {
          const row = el("div", {
            className: "hq-row",
            style: "cursor:pointer",
            onClick: () => {
              api.setProjectDetailId(p.id);
              showPanel("projects");
            },
          });
          row.appendChild(projectStatusBadge(p.status));
          row.appendChild(
            el("div", null, [
              el("p", { className: "hq-row__title", text: p.name || "—" }),
              el("p", {
                className: "hq-row__meta",
                text: `Budget ${formatKrw(p.budget || 0)}`,
              }),
            ])
          );
          root.appendChild(row);
        });
    } else if (companyTab === "documents") {
      if (!docs.length) root.appendChild(emptyMsg("No linked documents."));
      else
        docs.forEach((d) => {
          const row = el("div", { className: "hq-row" });
          row.appendChild(badge(d.type || "doc"));
          row.appendChild(
            el("div", null, [
              el("p", { className: "hq-row__title", text: d.title || "—" }),
            ])
          );
          root.appendChild(row);
        });
    } else if (companyTab === "finance") {
      root.appendChild(
        el("div", { className: "hq-stat-grid" }, [
          el("div", { className: "hq-card hq-stat" }, [
            el("p", { className: "hq-card__label", text: "Total revenue (recorded)" }),
            el("p", { className: "hq-card__value", text: formatKrw(stats.recorded) }),
          ]),
          el("div", { className: "hq-card hq-stat" }, [
            el("p", { className: "hq-card__label", text: "Paid invoices" }),
            el("p", { className: "hq-card__value", text: formatKrw(stats.paid) }),
          ]),
          el("div", { className: "hq-card hq-stat" }, [
            el("p", { className: "hq-card__label", text: "Outstanding" }),
            el("p", { className: "hq-card__value", text: formatKrw(stats.outstanding) }),
          ]),
          el("div", { className: "hq-card hq-stat" }, [
            el("p", { className: "hq-card__label", text: "Project value" }),
            el("p", { className: "hq-card__value", text: formatKrw(stats.projectValue) }),
          ]),
        ])
      );
    } else if (companyTab === "activity") {
      const events = [];
      events.push({
        at: ymd(company.updatedAt) || ymd(company.createdAt),
        text: "Company updated",
      });
      contacts.forEach((c) =>
        events.push({
          at: ymd(c.updatedAt) || ymd(c.createdAt),
          text: `Contact · ${c.name || "—"}`,
        })
      );
      leads.forEach((l) =>
        events.push({
          at: ymd(l.updatedAt) || ymd(l.createdAt),
          text: `Lead · ${l.name || "—"}`,
        })
      );
      projects.forEach((p) =>
        events.push({
          at: ymd(p.updatedAt) || ymd(p.createdAt),
          text: `Project · ${p.name || "—"}`,
        })
      );
      docs.forEach((d) =>
        events.push({
          at: ymd(d.updatedAt) || ymd(d.createdAt),
          text: `Document · ${d.type} · ${d.title || "—"}`,
        })
      );
      financeForEntity("company", company.id).forEach((f) =>
        events.push({
          at: ymd(f.date) || ymd(f.updatedAt),
          text: `Finance · ${f.type} ${formatKrw(f.amount)}`,
        })
      );
      root.appendChild(renderActivityFeed(events));
    } else {
      root.appendChild(
        surfacePanel("Overview", [
          el("div", { className: "hq-pipeline" }, [
            el("p", { className: "hq-row__meta", text: `Website: ${company.website || "—"}` }),
            el("p", { className: "hq-row__meta", text: `Industry: ${company.industry || "—"}` }),
            el("p", { className: "hq-row__meta", text: `Size: ${company.size || "—"}` }),
            el("p", { className: "hq-row__meta", text: `Email: ${company.email || "—"}` }),
            el("p", { className: "hq-row__meta", text: `Phone: ${company.phone || "—"}` }),
            el("p", { className: "hq-row__meta", text: `Address: ${company.address || "—"}` }),
          ]),
        ])
      );
      root.appendChild(el("div", { style: "height:0.85rem" }));
      root.appendChild(
        surfacePanel("Notes", [
          el("p", {
            className: "hq-row__meta",
            style: "padding:1rem 1.05rem;white-space:pre-wrap",
            text: company.notes || "—",
          }),
        ])
      );
    }

    if (!company.archived) {
      root.appendChild(
        el("div", { className: "hq-session-box" }, [
          el("p", { className: "hq-session-box__title", text: "Archive" }),
          btn("Archive Company", {
            className: "hq-btn hq-btn--ghost",
            onClick: () =>
              confirmDelete("Archive this company?", async () => {
                try {
                  await updateDoc(doc(ctx().db, COL.companies, company.id), {
                    archived: true,
                    updatedAt: serverTimestamp(),
                    updatedBy: uid(),
                  });
                  toast("Archived", "ok");
                  detailKind = null;
                  detailId = null;
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

  function renderClients(root) {
    if (!root) return;
    clear(root);
    if (detailKind === "client" && detailId) {
      const c = clientById(detailId);
      if (c) {
        renderClientDetail(root, c);
        return;
      }
      detailKind = null;
      detailId = null;
    }
    if (detailKind === "company" && detailId) {
      const c = companyById(detailId);
      if (c) {
        renderCompanyDetail(root, c);
        return;
      }
      detailKind = null;
      detailId = null;
    }
    if (mode === "companies") renderCompaniesList(root);
    else renderPeopleList(root);
  }

  function renderDashboardCrmStrip() {
    const clients = clientsList().filter((c) => !c.archived);
    const companies = companiesList().filter((c) => !c.archived);
    const activeClients = clients.filter((c) => c.status === "active").length;
    const prospects = clients.filter((c) => c.status === "prospect").length;
    const activeCompanies = companies.filter((c) => c.status === "active").length;
    const withProjects = clients.filter(
      (c) => projectsForClient(c.id).some((p) => p.status === "active")
    ).length;
    return el("div", { className: "hq-stat-grid" }, [
      el("div", { className: "hq-card hq-stat" }, [
        el("p", { className: "hq-card__label", text: "Active clients" }),
        el("p", { className: "hq-card__value", text: String(activeClients) }),
      ]),
      el("div", { className: "hq-card hq-stat" }, [
        el("p", { className: "hq-card__label", text: "Prospects" }),
        el("p", { className: "hq-card__value", text: String(prospects) }),
      ]),
      el("div", { className: "hq-card hq-stat" }, [
        el("p", { className: "hq-card__label", text: "Active companies" }),
        el("p", { className: "hq-card__value", text: String(activeCompanies) }),
      ]),
      el("div", { className: "hq-card hq-stat" }, [
        el("p", { className: "hq-card__label", text: "Clients w/ active projects" }),
        el("p", { className: "hq-card__value", text: String(withProjects) }),
      ]),
    ]);
  }

  function crmLinkRow(projectOrLead) {
    const client = projectOrLead.clientId
      ? clientById(projectOrLead.clientId)
      : null;
    const company = projectOrLead.companyId
      ? companyById(projectOrLead.companyId)
      : null;
    if (!client && !company) return null;
    const wrap = el("div", { className: "hq-product-card__ops", style: "margin-top:0.5rem" });
    if (client) {
      wrap.appendChild(
        btn(client.name || "Client", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: () => {
            detailKind = "client";
            detailId = client.id;
            mode = "people";
            showPanel("clients");
          },
        })
      );
    }
    if (company) {
      wrap.appendChild(
        btn(company.name || "Company", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: () => {
            detailKind = "company";
            detailId = company.id;
            mode = "companies";
            showPanel("clients");
          },
        })
      );
    }
    return wrap;
  }

  return {
    renderClients,
    renderDashboardCrmStrip,
    openClientForm,
    openCompanyForm,
    openLinkClientModal,
    clientOptions,
    companyOptions,
    clientById,
    companyById,
    fillFromClient,
    crmLinkRow,
    revenueStats,
    setDetail(kind, id) {
      detailKind = kind;
      detailId = id;
      if (kind === "company") mode = "companies";
      else mode = "people";
    },
    clearDetail() {
      detailKind = null;
      detailId = null;
    },
  };
}
