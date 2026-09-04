/**
 * Newon HQ Phase 2C — Project operations (milestones, timeline, board, health).
 * Optional fields only. No migrations. Reuses existing Tasks/Finance/Documents cache.
 */

export const PROJECT_PHASE = [
  "discovery",
  "requirements",
  "proposal",
  "contract",
  "design",
  "development",
  "qa",
  "delivery",
  "completed",
  "paused",
];

export const PROJECT_PHASE_LABEL = {
  discovery: "Discovery",
  requirements: "요구사항",
  proposal: "견적",
  contract: "계약",
  design: "디자인",
  development: "개발",
  qa: "QA",
  delivery: "납품",
  completed: "완료",
  paused: "일시정지",
};

export const MILESTONE_STATUS = [
  "planned",
  "active",
  "completed",
  "delayed",
  "cancelled",
];

export const DEFAULT_MILESTONE_TITLES = [
  "Kickoff",
  "Requirements Confirmed",
  "Design Approved",
  "Development Complete",
  "QA Complete",
  "Client Review",
  "Final Delivery",
  "Final Payment",
];

export const BOARD_LANES = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

function daysUntil(due) {
  if (!due) return null;
  const d = typeof due === "string" ? new Date(due + "T12:00:00") : due;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return Math.round((x - today) / 86400000);
}

export function dueState(dueDate, done) {
  if (done) return "completed";
  const days = daysUntil(dueDate);
  if (days == null) return "on_track";
  if (days < 0) return "overdue";
  if (days <= 7) return "due_soon";
  return "on_track";
}

export function dueStateLabel(state) {
  return (
    {
      on_track: "On Track",
      due_soon: "Due Soon",
      overdue: "Overdue",
      completed: "Completed",
    }[state] || state
  );
}

function dueBadgeKind(state) {
  if (state === "overdue") return "overdue";
  if (state === "due_soon") return "due-today";
  if (state === "completed") return "completed";
  return "active";
}

export function taskLane(t) {
  if (t && t.lane && BOARD_LANES.some((l) => l.value === t.lane)) return t.lane;
  if (!t) return "todo";
  if (t.status === "done") return "done";
  if (t.status === "doing") return "in_progress";
  return "todo";
}

export function laneToTaskStatus(lane) {
  if (lane === "done") return "done";
  if (lane === "in_progress" || lane === "review") return "doing";
  return "todo";
}

export function installHqOps(api) {
  const {
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
    getCache,
    getCtx,
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
    crmLinkRow,
  } = api;

  let projectTab = "overview";

  function cache() {
    return getCache();
  }
  function ctx() {
    return getCtx();
  }

  function milestonesFor(projectId) {
    return (cache().milestones || [])
      .filter((m) => m.projectId === projectId && !m.archived)
      .slice()
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }

  function tasksFor(projectId) {
    return (cache().tasks || []).filter((t) => t.projectId === projectId);
  }

  function docsFor(projectId) {
    return (cache().documents || []).filter(
      (d) => d.projectId === projectId && !d.archived
    );
  }

  function financeFor(projectId) {
    return (cache().finance || []).filter(
      (f) => f.projectId === projectId && !f.archived
    );
  }

  function suggestedProgress(project) {
    const ms = milestonesFor(project.id);
    const tasks = tasksFor(project.id);
    const total = ms.length + tasks.length;
    if (!total) return null;
    const done =
      ms.filter((m) => m.status === "completed").length +
      tasks.filter((t) => t.status === "done").length;
    return Math.round((done / total) * 100);
  }

  function projectHealth(project) {
    const tasks = tasksFor(project.id);
    const ms = milestonesFor(project.id);
    const overdue =
      tasks.some((t) => dueState(t.dueDate, t.status === "done") === "overdue") ||
      ms.some((m) => dueState(m.dueDate, m.status === "completed") === "overdue");
    const targetOverdue =
      project.targetDate &&
      dueState(project.targetDate, project.status === "completed" || project.phase === "completed") ===
        "overdue";
    const targetSoon =
      project.targetDate &&
      dueState(project.targetDate, project.status === "completed") === "due_soon";
    const progress = Number(project.progress);
    const lowProgressNearEnd =
      Number.isFinite(progress) && progress < 40 && targetSoon;

    if (overdue || targetOverdue) return "at_risk";
    if (targetSoon || lowProgressNearEnd) return "attention";
    return "healthy";
  }

  function healthBadge(h) {
    const label =
      h === "at_risk" ? "At Risk" : h === "attention" ? "Attention" : "Healthy";
    return badge(label, h === "at_risk" ? "overdue" : h === "attention" ? "due-today" : "active");
  }

  function nextMilestone(project) {
    const ms = milestonesFor(project.id).filter((m) => m.status !== "completed" && m.status !== "cancelled");
    if (!ms.length) return null;
    const withDue = ms.filter((m) => m.dueDate).sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
    return withDue[0] || ms[0];
  }

  function openMilestoneForm(item, project) {
    const isEdit = !!item;
    const titleIn = input({ value: (item && item.title) || "", required: true });
    const descIn = textarea({});
    descIn.value = (item && item.description) || "";
    const statusIn = select({}, MILESTONE_STATUS, (item && item.status) || "planned");
    const priIn = select({}, ["low", "medium", "high"], (item && item.priority) || "medium");
    const dueIn = input({ type: "date", value: ymd(item && item.dueDate) });
    const form = el("form", { className: "hq-form" }, [
      fieldRow("Title *", titleIn),
      fieldRow("Description", descIn),
      fieldRow("Status", statusIn),
      fieldRow("Priority", priIn),
      fieldRow("Due date", dueIn),
    ]);
    const saveBtn = btn(isEdit ? "Save" : "Add", { type: "submit", dataset: { hqSave: "1" } });
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
        if (!MILESTONE_STATUS.includes(statusIn.value)) {
          toast("Invalid status", "err");
          return;
        }
        const order =
          item && item.order != null
            ? item.order
            : milestonesFor(project.id).length + 1;
        const payload = {
          projectId: project.id,
          title,
          description: descIn.value.trim(),
          status: statusIn.value,
          priority: priIn.value,
          dueDate: dueIn.value || null,
          order,
          completedAt:
            statusIn.value === "completed"
              ? (item && item.completedAt) || ymd(new Date())
              : null,
          archived: false,
          updatedAt: serverTimestamp(),
          updatedBy: uid(),
        };
        try {
          if (isEdit) {
            await updateDoc(doc(ctx().db, COL.milestones, item.id), payload);
          } else {
            await addDoc(collection(ctx().db, COL.milestones), {
              ...payload,
              createdAt: serverTimestamp(),
              createdBy: uid(),
            });
          }
          closeModal();
          toast("Milestone saved", "ok");
          await refreshAndRender();
        } catch {
          toast("Save failed", "err");
        }
      })
    );
    openModal(isEdit ? "Edit Milestone" : "Add Milestone", form, [cancelBtn, saveBtn]);
  }

  async function applyDefaultMilestones(project) {
    const existing = milestonesFor(project.id);
    if (existing.length) {
      toast("Milestones already exist", "err");
      return;
    }
    try {
      for (let i = 0; i < DEFAULT_MILESTONE_TITLES.length; i++) {
        await addDoc(collection(ctx().db, COL.milestones), {
          projectId: project.id,
          title: DEFAULT_MILESTONE_TITLES[i],
          description: "",
          status: "planned",
          priority: "medium",
          dueDate: null,
          order: i + 1,
          completedAt: null,
          archived: false,
          createdAt: serverTimestamp(),
          createdBy: uid(),
          updatedAt: serverTimestamp(),
          updatedBy: uid(),
        });
      }
      toast("Default milestones applied", "ok");
      await refreshAndRender();
    } catch {
      toast("Apply failed", "err");
    }
  }

  async function reorderMilestone(m, dir) {
    const list = milestonesFor(m.projectId);
    const idx = list.findIndex((x) => x.id === m.id);
    const swap = list[idx + dir];
    if (!swap) return;
    try {
      await updateDoc(doc(ctx().db, COL.milestones, m.id), {
        order: Number(swap.order) || idx + dir + 1,
        updatedAt: serverTimestamp(),
        updatedBy: uid(),
      });
      await updateDoc(doc(ctx().db, COL.milestones, swap.id), {
        order: Number(m.order) || idx + 1,
        updatedAt: serverTimestamp(),
        updatedBy: uid(),
      });
      await refreshAndRender();
    } catch {
      toast("Reorder failed", "err");
    }
  }

  function openProgressForm(project) {
    const suggested = suggestedProgress(project);
    const progIn = input({
      type: "number",
      min: "0",
      max: "100",
      value: project.progress != null ? String(project.progress) : "0",
    });
    const phaseIn = select(
      {},
      PROJECT_PHASE.map((p) => ({
        value: p,
        label: PROJECT_PHASE_LABEL[p] || p,
      })),
      project.phase || "discovery"
    );
    const form = el("form", { className: "hq-form" }, [
      fieldRow("Manual progress (0–100)", progIn),
      el("p", {
        className: "hq-row__meta",
        text:
          suggested == null
            ? "Suggested: — (no tasks/milestones yet)"
            : `Suggested (reference only): ${suggested}%`,
      }),
      fieldRow("Phase", phaseIn),
    ]);
    const saveBtn = btn("Save", { type: "submit", dataset: { hqSave: "1" } });
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
        const progress = Number(progIn.value);
        if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
          toast("Progress must be 0–100", "err");
          return;
        }
        if (!PROJECT_PHASE.includes(phaseIn.value)) {
          toast("Invalid phase", "err");
          return;
        }
        try {
          await updateDoc(doc(ctx().db, COL.projects, project.id), {
            progress,
            phase: phaseIn.value,
            updatedAt: serverTimestamp(),
            updatedBy: uid(),
          });
          closeModal();
          toast("Progress updated", "ok");
          await refreshAndRender();
        } catch {
          toast("Update failed", "err");
        }
      })
    );
    openModal("Update Progress", form, [cancelBtn, saveBtn]);
  }

  function renderTabs(active, onChange) {
    const wrap = el("div", { className: "hq-tabs" });
    [
      ["overview", "Overview"],
      ["milestones", "Milestones"],
      ["board", "Board"],
      ["timeline", "Timeline"],
      ["activity", "Activity"],
    ].forEach(([id, label]) => {
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

  function financeSummary(project) {
    const fin = financeTotals(financeFor(project.id));
    const invoices = docsFor(project.id).filter((d) => d.type === "invoice");
    let outstanding = 0;
    let paid = 0;
    invoices.forEach((inv) => {
      const c = inv.content && typeof inv.content === "object" ? inv.content : {};
      const total = Number(c.total) || 0;
      if (inv.status === "completed") paid += total;
      else if (!["cancelled"].includes(inv.status)) outstanding += total;
    });
    return {
      budget: Number(project.budget) || 0,
      revenue: fin.income,
      expense: fin.expense,
      outstanding,
      paid,
      remaining: Math.max(0, (Number(project.budget) || 0) - fin.income),
    };
  }

  function renderOverview(project) {
    const tasks = tasksFor(project.id);
    const overdueTasks = tasks.filter(
      (t) => dueState(t.dueDate, t.status === "done") === "overdue"
    );
    const upcomingTasks = tasks
      .filter((t) => {
        const s = dueState(t.dueDate, t.status === "done");
        return s === "due_soon" || s === "on_track";
      })
      .filter((t) => t.status !== "done")
      .slice(0, 5);
    const nm = nextMilestone(project);
    const docs = docsFor(project.id);
    const fs = financeSummary(project);
    const suggested = suggestedProgress(project);
    const wrap = el("div", { className: "hq-detail-stack" });

    wrap.appendChild(
      el("div", { className: "hq-stat-grid" }, [
        el("div", { className: "hq-card hq-stat" }, [
          el("p", { className: "hq-card__label", text: "Manual progress" }),
          el("p", {
            className: "hq-card__value",
            text: `${project.progress != null ? project.progress : 0}%`,
          }),
          el("p", {
            className: "hq-stat__caption",
            text:
              suggested == null ? "Suggested: —" : `Suggested: ${suggested}%`,
          }),
        ]),
        el("div", { className: "hq-card hq-stat" }, [
          el("p", { className: "hq-card__label", text: "Phase" }),
          el("p", {
            className: "hq-card__value",
            style: "font-size:1.1rem",
            text: PROJECT_PHASE_LABEL[project.phase] || project.phase || "—",
          }),
        ]),
        el("div", { className: "hq-card hq-stat" }, [
          el("p", { className: "hq-card__label", text: "Next milestone" }),
          el("p", {
            className: "hq-card__value",
            style: "font-size:1rem",
            text: (nm && nm.title) || "—",
          }),
          el("p", {
            className: "hq-stat__caption",
            text: nm ? ymd(nm.dueDate) || "No due date" : "",
          }),
        ]),
        el("div", { className: "hq-card hq-stat" }, [
          el("p", { className: "hq-card__label", text: "Target" }),
          el("p", {
            className: "hq-card__value",
            style: "font-size:1.1rem",
            text: ymd(project.targetDate) || "—",
          }),
          el("p", {
            className: "hq-stat__caption",
            text: dueStateLabel(
              dueState(
                project.targetDate,
                project.status === "completed" || project.phase === "completed"
              )
            ),
          }),
        ]),
        el("div", { className: "hq-card hq-stat" }, [
          el("p", { className: "hq-card__label", text: "Overdue tasks" }),
          el("p", { className: "hq-card__value", text: String(overdueTasks.length) }),
        ]),
        el("div", { className: "hq-card hq-stat" }, [
          el("p", { className: "hq-card__label", text: "Documents" }),
          el("p", { className: "hq-card__value", text: String(docs.length) }),
        ]),
      ])
    );

    wrap.appendChild(el("div", { style: "height:0.85rem" }));
    wrap.appendChild(
      el("div", { className: "hq-grid-2" }, [
        surfacePanel("Upcoming tasks", [
          upcomingTasks.length
            ? el(
                "div",
                null,
                upcomingTasks.map((t) => {
                  const row = el("div", { className: "hq-row" });
                  row.appendChild(
                    badge(
                      dueStateLabel(dueState(t.dueDate, false)),
                      dueBadgeKind(dueState(t.dueDate, false))
                    )
                  );
                  const mid = el("div");
                  mid.appendChild(el("p", { className: "hq-row__title", text: t.title || "—" }));
                  mid.appendChild(
                    el("p", {
                      className: "hq-row__meta",
                      text: ymd(t.dueDate) || "No due",
                    })
                  );
                  row.appendChild(mid);
                  return row;
                })
              )
            : el("div", { style: "padding:1rem" }, [emptyMsg("No upcoming tasks.")]),
        ]),
        surfacePanel("Finance status", [
          el("div", { className: "hq-pipeline" }, [
            el("p", { className: "hq-row__meta", text: `Budget: ${formatKrw(fs.budget)}` }),
            el("p", { className: "hq-row__meta", text: `Recorded revenue: ${formatKrw(fs.revenue)}` }),
            el("p", { className: "hq-row__meta", text: `Outstanding invoices: ${formatKrw(fs.outstanding)}` }),
            el("p", { className: "hq-row__meta", text: `Paid (invoices marked completed): ${formatKrw(fs.paid)}` }),
            el("p", { className: "hq-row__meta", text: `Remaining vs budget: ${formatKrw(fs.remaining)}` }),
            btn("+ Finance entry", {
              className: "hq-btn hq-btn--small",
              style: "margin-top:0.5rem",
              onClick: () => openFinanceForm(null, { projectId: project.id }),
            }),
          ]),
        ]),
      ])
    );

    wrap.appendChild(el("div", { style: "height:0.85rem" }));
    const delivery = Array.isArray(project.deliveryChecklist)
      ? project.deliveryChecklist
      : [];
    const deliveryDone =
      delivery.length > 0 && delivery.every((i) => i && i.done);
    wrap.appendChild(
      el("div", { className: "hq-grid-2" }, [
        surfacePanel("Documents status", [
          el("div", { className: "hq-pipeline" }, [
            el("p", {
              className: "hq-row__meta",
              text: `Quotes: ${docs.filter((d) => d.type === "quote").length}`,
            }),
            el("p", {
              className: "hq-row__meta",
              text: `Contracts: ${docs.filter((d) => d.type === "contract").length}`,
            }),
            el("p", {
              className: "hq-row__meta",
              text: `Invoices: ${docs.filter((d) => d.type === "invoice").length}`,
            }),
          ]),
        ]),
        surfacePanel("Delivery status", [
          el("div", { className: "hq-pipeline" }, [
            el("p", {
              className: "hq-row__meta",
              text: delivery.length
                ? `${delivery.filter((i) => i.done).length}/${delivery.length} checklist done`
                : "No checklist yet",
            }),
            el("p", {
              className: "hq-row__meta",
              text: deliveryDone ? "Ready for handover" : "In progress",
            }),
          ]),
        ]),
      ])
    );

    wrap.appendChild(el("div", { style: "height:0.85rem" }));
    wrap.appendChild(
      surfacePanel("Pipeline", [
        el("div", { style: "padding:0.75rem 1.05rem" }, [
          ensureDocsMod().renderProgressStrip(project),
        ]),
      ])
    );

    wrap.appendChild(el("div", { style: "height:0.85rem" }));
    wrap.appendChild(
      surfacePanel("Notes", [
        el("div", { className: "hq-pipeline" }, [
          el("p", { className: "hq-summary-pill__label", text: "Description" }),
          el("p", {
            className: "hq-row__meta",
            text: project.description || "—",
          }),
          el("p", {
            className: "hq-summary-pill__label",
            style: "margin-top:0.75rem",
            text: "Internal notes",
          }),
          el("p", {
            className: "hq-row__meta",
            text: project.internalNotes || "—",
          }),
        ]),
      ])
    );

    wrap.appendChild(el("div", { style: "height:0.85rem" }));
    wrap.appendChild(ensureDocsMod().renderProjectDocumentsSection(project));
    wrap.appendChild(el("div", { style: "height:0.85rem" }));
    wrap.appendChild(ensureDocsMod().renderDeliverySection(project));
    return wrap;
  }

  function renderMilestonesTab(project) {
    const list = milestonesFor(project.id);
    const wrap = el("div", null, [
      toolbar([
        btn("+ Milestone", { onClick: () => openMilestoneForm(null, project) }),
        btn("Apply Default Milestones", {
          className: "hq-btn hq-btn--ghost",
          onClick: () =>
            confirmDelete(
              "Create the default milestone template for this project?",
              async () => applyDefaultMilestones(project)
            ),
        }),
      ]),
    ]);
    if (!list.length) {
      wrap.appendChild(
        emptyState(
          "No milestones yet",
          "Add milestones or apply the default delivery template.",
          btn("+ Milestone", { onClick: () => openMilestoneForm(null, project) })
        )
      );
      return wrap;
    }
    list.forEach((m, idx) => {
      const row = el("div", { className: "hq-row" });
      row.appendChild(badge(m.status || "planned", m.status));
      const mid = el("div");
      mid.appendChild(el("p", { className: "hq-row__title", text: m.title || "—" }));
      mid.appendChild(
        el("p", {
          className: "hq-row__meta",
          text: `${ymd(m.dueDate) || "No due"} · ${dueStateLabel(
            dueState(m.dueDate, m.status === "completed")
          )}`,
        })
      );
      row.appendChild(mid);
      const acts = el("div", { className: "hq-actions-cell" });
      acts.appendChild(
        btn("↑", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          disabled: idx === 0,
          onClick: () => reorderMilestone(m, -1),
        })
      );
      acts.appendChild(
        btn("↓", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          disabled: idx === list.length - 1,
          onClick: () => reorderMilestone(m, 1),
        })
      );
      acts.appendChild(
        btn("Edit", {
          className: "hq-btn hq-btn--small",
          onClick: () => openMilestoneForm(m, project),
        })
      );
      if (m.status !== "completed") {
        acts.appendChild(
          btn("Complete", {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: withSaving(async () => {
              try {
                await updateDoc(doc(ctx().db, COL.milestones, m.id), {
                  status: "completed",
                  completedAt: ymd(new Date()),
                  updatedAt: serverTimestamp(),
                  updatedBy: uid(),
                });
                toast("Completed", "ok");
                await refreshAndRender();
              } catch {
                toast("Update failed", "err");
              }
            }),
          })
        );
      }
      acts.appendChild(
        btn("Archive", {
          className: "hq-btn hq-btn--small hq-btn--ghost",
          onClick: () =>
            confirmDelete("Archive this milestone?", async () => {
              try {
                await updateDoc(doc(ctx().db, COL.milestones, m.id), {
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
      row.appendChild(acts);
      wrap.appendChild(row);
    });
    return wrap;
  }

  function renderBoardTab(project) {
    const tasks = tasksFor(project.id);
    const wrap = el("div", null, [
      toolbar([
        btn("+ Task", {
          onClick: () => openTaskForm(null, { projectId: project.id }),
        }),
      ]),
    ]);
    const board = el("div", { className: "hq-board" });
    BOARD_LANES.forEach((lane) => {
      const col = el("div", { className: "hq-board__col" });
      col.appendChild(el("p", { className: "hq-board__title", text: lane.label }));
      const items = tasks.filter((t) => taskLane(t) === lane.value);
      if (!items.length) col.appendChild(el("p", { className: "hq-empty", text: "—" }));
      items.forEach((t) => {
        const card = el("div", { className: "hq-board__card" });
        card.appendChild(el("p", { className: "hq-row__title", text: t.title || "—" }));
        card.appendChild(
          el("p", {
            className: "hq-row__meta",
            text: `${ymd(t.dueDate) || "No due"} · ${dueStateLabel(
              dueState(t.dueDate, t.status === "done")
            )}`,
          })
        );
        const laneSel = select(
          {
            onChange: withSaving(async (e) => {
              const next = e.target.value;
              try {
                await updateDoc(doc(ctx().db, COL.tasks, t.id), {
                  lane: next,
                  status: laneToTaskStatus(next),
                  updatedAt: serverTimestamp(),
                  updatedBy: uid(),
                });
                toast("Updated", "ok");
                await refreshAndRender();
              } catch {
                toast("Update failed", "err");
              }
            }),
          },
          BOARD_LANES,
          taskLane(t)
        );
        card.appendChild(laneSel);
        card.appendChild(
          btn("Edit", {
            className: "hq-btn hq-btn--small",
            style: "margin-top:0.35rem",
            onClick: () => openTaskForm(t),
          })
        );
        col.appendChild(card);
      });
      board.appendChild(col);
    });
    wrap.appendChild(board);
    return wrap;
  }

  function renderTimelineTab(project) {
    const items = [];
    milestonesFor(project.id).forEach((m) => {
      items.push({
        kind: "milestone",
        title: m.title,
        date: m.dueDate || m.completedAt || ymd(m.updatedAt),
        status: m.status,
        done: m.status === "completed",
      });
    });
    tasksFor(project.id).forEach((t) => {
      items.push({
        kind: "task",
        title: t.title,
        date: t.dueDate || ymd(t.updatedAt),
        status: t.status,
        done: t.status === "done",
      });
    });
    items.sort((a, b) => String(a.date || "9999").localeCompare(String(b.date || "9999")));
    const wrap = el("div", { className: "hq-timeline" });
    if (!items.length) {
      wrap.appendChild(emptyMsg("No timeline items yet."));
      return wrap;
    }
    items.forEach((it) => {
      const row = el("div", { className: "hq-timeline__item" });
      row.appendChild(el("div", { className: "hq-timeline__dot" + (it.done ? " is-done" : "") }));
      const body = el("div");
      body.appendChild(
        el("p", {
          className: "hq-timeline__date",
          text: `${ymd(it.date) || "—"} · ${it.kind}`,
        })
      );
      body.appendChild(el("p", { className: "hq-row__title", text: it.title || "—" }));
      body.appendChild(
        el("p", {
          className: "hq-row__meta",
          text: dueStateLabel(dueState(it.date, it.done)),
        })
      );
      row.appendChild(body);
      wrap.appendChild(row);
    });
    return wrap;
  }

  function renderActivityTab(project) {
    const events = [];
    events.push({
      at: ymd(project.updatedAt) || ymd(project.createdAt),
      text: "Project updated",
    });
    docsFor(project.id).forEach((d) => {
      events.push({
        at: ymd(d.updatedAt) || ymd(d.createdAt),
        text: `${d.type || "Document"} · ${d.title || "untitled"} (${d.status || ""})`,
      });
    });
    tasksFor(project.id).forEach((t) => {
      events.push({
        at: ymd(t.updatedAt) || ymd(t.createdAt),
        text: `Task · ${t.title || "—"} (${t.status || ""})`,
      });
    });
    milestonesFor(project.id).forEach((m) => {
      events.push({
        at: ymd(m.updatedAt) || ymd(m.completedAt) || ymd(m.createdAt),
        text: `Milestone · ${m.title || "—"} (${m.status || ""})`,
      });
    });
    financeFor(project.id).forEach((f) => {
      events.push({
        at: ymd(f.date) || ymd(f.updatedAt),
        text: `Finance · ${f.type} ${formatKrw(f.amount)} · ${f.category || ""}`,
      });
    });
    events.sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
    const wrap = el("div", { className: "hq-timeline" });
    if (!events.length) {
      wrap.appendChild(emptyMsg("No activity yet."));
      return wrap;
    }
    events.slice(0, 40).forEach((ev) => {
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

  function renderProjectDetail(root, project) {
    clear(root);
    const health = projectHealth(project);
    const suggested = suggestedProgress(project);

    root.appendChild(
      pageHeader("projects", [
        btn("← Back", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => {
            api.clearProjectDetail();
            showPanel("projects");
          },
        }),
        btn("Add Task", {
          onClick: () => openTaskForm(null, { projectId: project.id }),
        }),
        btn("Add Milestone", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => openMilestoneForm(null, project),
        }),
        btn("Create Document", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => ensureDocsMod().openDocCreator("quote", project),
        }),
        btn("Update Progress", {
          className: "hq-btn hq-btn--ghost",
          onClick: () => openProgressForm(project),
        }),
      ])
    );

    const head = el("div", { className: "hq-surface-panel hq-project-hero" });
    head.appendChild(
      el("div", { className: "hq-surface-panel__body", style: "padding:1.1rem 1.05rem" }, [
        el("p", { className: "hq-eyebrow", text: "Project operations" }),
        el("h2", {
          className: "hq-page-header__title",
          style: "margin:0.2rem 0 0.35rem;font-size:1.65rem",
          text: project.name || "—",
        }),
        el("p", {
          className: "hq-page-header__desc",
          text: `${project.clientName || "—"} · ${project.company || "—"}`,
        }),
        typeof crmLinkRow === "function" ? crmLinkRow(project) : null,
        el("div", { className: "hq-product-card__ops", style: "margin-top:0.75rem" }, [
          projectStatusBadge(project.status),
          badge(PROJECT_PHASE_LABEL[project.phase] || project.phase || "No phase"),
          badge(`${project.progress != null ? project.progress : 0}%`),
          healthBadge(health),
          priorityBadge(project.priority),
          badge(serviceTypeLabel(project.serviceType)),
        ]),
        el("p", {
          className: "hq-row__meta",
          style: "margin-top:0.65rem",
          text: `Target ${ymd(project.targetDate) || "—"} · ${dueStateLabel(
            dueState(
              project.targetDate,
              project.status === "completed" || project.phase === "completed"
            )
          )}${suggested != null ? ` · Suggested ${suggested}%` : ""}`,
        }),
        el("div", { className: "hq-toolbar", style: "margin-top:0.75rem;margin-bottom:0" }, [
          btn("Edit", {
            className: "hq-btn hq-btn--small",
            onClick: () => openProjectForm(project),
          }),
          btn("Change Status", {
            className: "hq-btn hq-btn--small hq-btn--ghost",
            onClick: () => openProjectStatusForm(project),
          }),
        ]),
      ])
    );
    root.appendChild(head);
    root.appendChild(el("div", { style: "height:0.85rem" }));

    root.appendChild(
      renderTabs(projectTab, (id) => {
        projectTab = id;
        renderProjectDetail(root, projectById(project.id) || project);
      })
    );
    root.appendChild(el("div", { style: "height:0.85rem" }));

    const fresh = projectById(project.id) || project;
    if (projectTab === "milestones") root.appendChild(renderMilestonesTab(fresh));
    else if (projectTab === "board") root.appendChild(renderBoardTab(fresh));
    else if (projectTab === "timeline") root.appendChild(renderTimelineTab(fresh));
    else if (projectTab === "activity") root.appendChild(renderActivityTab(fresh));
    else root.appendChild(renderOverview(fresh));

    if (!fresh.archived) {
      root.appendChild(
        el("div", { className: "hq-session-box" }, [
          el("p", { className: "hq-session-box__title", text: "Archive" }),
          el("p", {
            className: "hq-session-box__desc",
            text: "Archiving hides this project. Related records are not deleted.",
          }),
          btn("Archive Project", {
            className: "hq-btn hq-btn--ghost",
            onClick: () =>
              confirmDelete("Archive this project?", async () => {
                try {
                  await updateDoc(doc(ctx().db, COL.projects, fresh.id), {
                    archived: true,
                    updatedAt: serverTimestamp(),
                    updatedBy: uid(),
                  });
                  toast("Archived", "ok");
                  api.clearProjectDetail();
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

  function collectDeadlineItems() {
    const today = [];
    const week = [];
    const overdue = [];
    const todayY = ymd(new Date());
    (cache().tasks || []).forEach((t) => {
      if (t.status === "done") return;
      const due = ymd(t.dueDate);
      if (!due) return;
      const st = dueState(due, false);
      const row = {
        kind: "task",
        title: t.title,
        due,
        projectId: t.projectId,
      };
      if (due === todayY) today.push(row);
      if (st === "overdue") overdue.push(row);
      else if (st === "due_soon") week.push(row);
    });
    (cache().milestones || []).forEach((m) => {
      if (m.archived || m.status === "completed" || m.status === "cancelled") return;
      const due = ymd(m.dueDate);
      if (!due) return;
      const st = dueState(due, false);
      const row = {
        kind: "milestone",
        title: m.title,
        due,
        projectId: m.projectId,
      };
      if (due === todayY) today.push(row);
      if (st === "overdue") overdue.push(row);
      else if (st === "due_soon") week.push(row);
    });
    const atRisk = (cache().projects || []).filter((p) => {
      if (p.archived) return false;
      return projectHealth(p) === "at_risk" || projectHealth(p) === "attention";
    });
    return { today, week, overdue, atRisk };
  }

  function renderDeadlineRows(items) {
    if (!items.length) return el("div", { style: "padding:0.85rem 1.05rem" }, [emptyMsg("None")]);
    return el(
      "div",
      null,
      items.slice(0, 6).map((it) => {
        const row = el("div", { className: "hq-row" });
        row.appendChild(badge(it.kind));
        const mid = el("div");
        mid.appendChild(el("p", { className: "hq-row__title", text: it.title || "—" }));
        const proj = it.projectId ? projectById(it.projectId) : null;
        mid.appendChild(
          el("p", {
            className: "hq-row__meta",
            text: `${it.due} · ${(proj && proj.name) || it.projectId || "—"}`,
          })
        );
        row.appendChild(mid);
        return row;
      })
    );
  }

  function renderDashboardOpsPanel() {
    const { today, week, overdue, atRisk } = collectDeadlineItems();
    return el("div", { className: "hq-grid-2" }, [
      surfacePanel("Due today", [renderDeadlineRows(today)]),
      surfacePanel("This week", [renderDeadlineRows(week)]),
      surfacePanel("Overdue", [renderDeadlineRows(overdue)]),
      surfacePanel(
        "Projects at risk",
        atRisk.length
          ? el(
              "div",
              null,
              atRisk.slice(0, 6).map((p) => {
                const row = el("div", {
                  className: "hq-row",
                  style: "cursor:pointer",
                  onClick: () => {
                    api.setProjectDetailId(p.id);
                    showPanel("projects");
                  },
                });
                row.appendChild(healthBadge(projectHealth(p)));
                const mid = el("div");
                mid.appendChild(el("p", { className: "hq-row__title", text: p.name || "—" }));
                mid.appendChild(
                  el("p", {
                    className: "hq-row__meta",
                    text: `Target ${ymd(p.targetDate) || "—"}`,
                  })
                );
                row.appendChild(mid);
                return row;
              })
            )
          : el("div", { style: "padding:0.85rem 1.05rem" }, [emptyMsg("None")])
      ),
    ]);
  }

  return {
    renderProjectDetail,
    renderDashboardOpsPanel,
    openProgressForm,
    openMilestoneForm,
    projectHealth,
    suggestedProgress,
    dueState,
    dueStateLabel,
    PROJECT_PHASE,
    PROJECT_PHASE_LABEL,
    setTab(tab) {
      projectTab = tab || "overview";
    },
    resetTab() {
      projectTab = "overview";
    },
  };
}
