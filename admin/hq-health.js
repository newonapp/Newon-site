/**
 * Newon HQ — Product Health snapshot (read-only).
 * Source of truth: ./production-health.json (copied from reports/ by health check).
 * No Firestore writes. No live health-check execution from HQ.
 */

const CELL_KEYS = [
  ["build", "Build"],
  ["firebase", "Firebase"],
  ["auth", "Auth"],
  ["security", "Security"],
  ["payment", "Payment"],
  ["analytics", "Analytics"],
  ["crash", "Crash"],
  ["store", "Store"],
  ["privacy", "Privacy"],
];

const STATUS_DEFS = [
  {
    key: "HEALTHY",
    text: "HEALTHY — 검사 가능한 핵심 항목 정상",
  },
  {
    key: "INCOMPLETE",
    text: "INCOMPLETE — 소스 또는 외부 시스템 미연결로 판단 불완전",
  },
  {
    key: "AT_RISK",
    text: "AT_RISK — 실제 운영 리스크 존재",
  },
  {
    key: "UNKNOWN",
    text: "UNKNOWN — 코드만으로 판단 불가",
  },
];

const CONTEXT_NOTE =
  "현재 Health Check는 public website repo 기준입니다. Flutter source가 연결되지 않은 제품은 INCOMPLETE로 표시됩니다.";

/** Map health cell/status → existing hq-badge kinds */
function healthBadgeKind(value) {
  const v = String(value || "").toUpperCase();
  if (v === "PASS" || v === "HEALTHY") return "completed";
  if (v === "WARN" || v === "WATCH" || v === "WARNING") return "review";
  if (v === "FAIL" || v === "AT_RISK") return "blocked";
  if (v === "INCOMPLETE" || v === "UNKNOWN" || v === "N/A") return "planned";
  return "planned";
}

function safeText(value, fallback) {
  if (value == null || value === "") return fallback || "—";
  const s = String(value);
  // Never surface credential-like blobs in UI
  if (
    /BEGIN [A-Z ]*PRIVATE KEY|sk_live_|sk_test_|whsec_|AIza[0-9A-Za-z_-]{20,}/i.test(s) ||
    /["']type["']\s*:\s*["']service_account["']/i.test(s)
  ) {
    return "[redacted]";
  }
  // Long opaque tokens / UIDs
  if (/^[A-Za-z0-9_-]{28,}$/.test(s.trim())) return "[redacted]";
  return s.length > 400 ? s.slice(0, 400) + "…" : s;
}

function isValidHealthReport(data) {
  if (!data || typeof data !== "object") return false;
  if (data.schemaVersion !== 1) return false;
  if (!Array.isArray(data.apps)) return false;
  return true;
}

function summarize(report) {
  const apps = report.apps || [];
  const byStatus = (st) => apps.filter((a) => String(a.status || "").toUpperCase() === st).length;
  const priorities = report.priorities || {};
  return {
    total: apps.length,
    healthy: byStatus("HEALTHY"),
    incomplete: byStatus("INCOMPLETE"),
    warning: byStatus("WATCH") + byStatus("WARNING"),
    atRisk: byStatus("AT_RISK"),
    p0: Array.isArray(priorities.P0) ? priorities.P0.length : 0,
    p1: Array.isArray(priorities.P1) ? priorities.P1.length : 0,
  };
}

function groupFindings(app) {
  const list = Array.isArray(app.findings) ? app.findings : [];
  const buckets = { PASS: [], WARN: [], FAIL: [], UNKNOWN: [] };
  for (const f of list) {
    const st = String(f.status || "UNKNOWN").toUpperCase();
    const key = buckets[st] ? st : "UNKNOWN";
    buckets[key].push(f);
  }
  return buckets;
}

function prioritiesForApp(report, appName) {
  const out = { P0: [], P1: [], P2: [], P3: [] };
  const priorities = report.priorities || {};
  for (const p of Object.keys(out)) {
    const items = Array.isArray(priorities[p]) ? priorities[p] : [];
    out[p] = items.filter((i) => i && i.app === appName);
  }
  return out;
}

/**
 * @param {object} api — UI helpers from hq-app
 */
export function installHqHealth(api) {
  const {
    el,
    clear,
    pageHeader,
    emptyState,
    surfacePanel,
    badge,
    openModal,
    btn,
  } = api;

  let report = null;
  let loadError = null; // "missing" | "parse" | "schema" | "network" | null
  let loaded = false;

  async function load() {
    loadError = null;
    report = null;
    try {
      const res = await fetch("./production-health.json", { cache: "no-store" });
      if (!res.ok) {
        loadError = "missing";
        loaded = true;
        return;
      }
      let data;
      try {
        data = await res.json();
      } catch {
        loadError = "parse";
        loaded = true;
        return;
      }
      if (!isValidHealthReport(data)) {
        loadError = "schema";
        loaded = true;
        return;
      }
      report = data;
      loaded = true;
    } catch {
      loadError = "network";
      loaded = true;
    }
  }

  function cellBadge(value) {
    const label = safeText(value, "—");
    return badge(label, healthBadgeKind(value));
  }

  function openDetail(app) {
    const body = el("div", { className: "hq-health-detail" });
    body.appendChild(
      el("p", {
        className: "hq-health-detail__lead",
        text: `Score ${app.score == null ? "—" : app.score} · Status ${safeText(app.status)}`,
      })
    );

    const matrix = app.matrix || {};
    const grid = el("div", { className: "hq-health-detail__cells" });
    for (const [key, label] of CELL_KEYS) {
      const row = el("div", { className: "hq-health-detail__cell" }, [
        el("span", { className: "hq-health-detail__cell-label", text: label }),
        cellBadge(matrix[key]),
      ]);
      grid.appendChild(row);
    }
    body.appendChild(grid);

    const buckets = groupFindings(app);
    for (const st of ["FAIL", "WARN", "PASS", "UNKNOWN"]) {
      const items = buckets[st];
      if (!items.length) continue;
      const list = el("ul", { className: "hq-health-detail__list" });
      for (const f of items) {
        const code = safeText(f.code, "");
        const msg = safeText(f.message, "");
        const path = f.path ? ` (${safeText(f.path)})` : "";
        list.appendChild(
          el("li", {
            text: code ? `[${code}] ${msg}${path}` : `${msg}${path}`,
          })
        );
      }
      body.appendChild(
        el("section", { className: "hq-health-detail__section" }, [
          el("h3", { className: "hq-health-detail__h", text: st }),
          list,
        ])
      );
    }

    const pri = prioritiesForApp(report, app.name);
    for (const p of ["P0", "P1", "P2", "P3"]) {
      const items = pri[p];
      if (!items.length) continue;
      const list = el("ul", { className: "hq-health-detail__list" });
      for (const i of items) {
        list.appendChild(
          el("li", {
            text: `[${safeText(i.code)}] ${safeText(i.message)}`,
          })
        );
      }
      body.appendChild(
        el("section", { className: "hq-health-detail__section" }, [
          el("h3", { className: "hq-health-detail__h", text: p }),
          list,
        ])
      );
    }

    const manuals = (app.findings || []).filter((f) => f && f.manual);
    if (manuals.length) {
      const list = el("ul", { className: "hq-health-detail__list" });
      for (const f of manuals) {
        list.appendChild(
          el("li", {
            text: `[${safeText(f.code)}] ${safeText(f.message)}`,
          })
        );
      }
      body.appendChild(
        el("section", { className: "hq-health-detail__section" }, [
          el("h3", { className: "hq-health-detail__h", text: "Manual Checks" }),
          list,
        ])
      );
    }

    const actions = Array.isArray(app.recommendedActions) ? app.recommendedActions : [];
    if (actions.length) {
      const list = el("ul", { className: "hq-health-detail__list" });
      for (const a of actions) {
        list.appendChild(el("li", { text: safeText(a) }));
      }
      body.appendChild(
        el("section", { className: "hq-health-detail__section" }, [
          el("h3", { className: "hq-health-detail__h", text: "Recommended Actions" }),
          list,
        ])
      );
    }

    openModal(safeText(app.name, "Product"), body, [
      btn("Close", { className: "hq-btn hq-btn--ghost", onClick: () => api.closeModal() }),
    ]);
  }

  function renderUnavailable(root) {
    const titles = {
      missing: "Health report unavailable",
      parse: "Health report unavailable",
      schema: "Health report unavailable",
      network: "Health report unavailable",
    };
    const descs = {
      missing: "production-health.json was not found. Run npm run health:apps and ensure the report is published under /admin/.",
      parse: "production-health.json could not be parsed.",
      schema: "production-health.json schema is unsupported or incomplete (expected schemaVersion 1 with apps[]).",
      network: "Could not load production-health.json.",
    };
    root.appendChild(
      emptyState(titles[loadError] || "Health report unavailable", descs[loadError] || "Unknown error.", null)
    );
  }

  function render(root) {
    clear(root);
    root.appendChild(pageHeader("health", []));

    if (!loaded) {
      root.appendChild(el("p", { className: "hq-empty", text: "Loading health report…" }));
      return;
    }
    if (loadError || !report) {
      renderUnavailable(root);
      return;
    }

    root.appendChild(
      el("p", {
        className: "hq-health-context",
        text: CONTEXT_NOTE,
      })
    );

    const generatedAt = report.generatedAt ? safeText(report.generatedAt) : "—";
    root.appendChild(
      el("p", {
        className: "hq-catalog-note",
        text: `Generated at ${generatedAt} · Source of truth: production-health.json (read-only). Refresh by re-running npm run health:apps outside HQ.`,
      })
    );

    const defs = el("ul", { className: "hq-health-defs" });
    for (const d of STATUS_DEFS) {
      defs.appendChild(
        el("li", { className: "hq-health-defs__item" }, [
          badge(d.key, healthBadgeKind(d.key)),
          el("span", { text: d.text.replace(d.key + " — ", "— ") }),
        ])
      );
    }
    root.appendChild(defs);

    const sum = summarize(report);
    const stats = el("div", { className: "hq-stat-grid hq-health-stats" }, [
      el("div", { className: "hq-card hq-stat" }, [
        el("p", { className: "hq-card__label", text: "Total Products" }),
        el("p", { className: "hq-card__value", text: String(sum.total) }),
      ]),
      el("div", { className: "hq-card hq-stat" }, [
        el("p", { className: "hq-card__label", text: "Healthy" }),
        el("p", { className: "hq-card__value", text: String(sum.healthy) }),
      ]),
      el("div", { className: "hq-card hq-stat" }, [
        el("p", { className: "hq-card__label", text: "Incomplete" }),
        el("p", { className: "hq-card__value", text: String(sum.incomplete) }),
      ]),
      el("div", { className: "hq-card hq-stat" }, [
        el("p", { className: "hq-card__label", text: "Warning" }),
        el("p", { className: "hq-card__value", text: String(sum.warning) }),
      ]),
      el("div", { className: "hq-card hq-stat" }, [
        el("p", { className: "hq-card__label", text: "At Risk" }),
        el("p", { className: "hq-card__value", text: String(sum.atRisk) }),
      ]),
      el("div", { className: "hq-card hq-stat" }, [
        el("p", { className: "hq-card__label", text: "P0" }),
        el("p", { className: "hq-card__value", text: String(sum.p0) }),
      ]),
      el("div", { className: "hq-card hq-stat" }, [
        el("p", { className: "hq-card__label", text: "P1" }),
        el("p", { className: "hq-card__value", text: String(sum.p1) }),
      ]),
    ]);
    root.appendChild(stats);

    const headers = [
      "Product",
      "Status",
      "Score",
      "Build",
      "Firebase",
      "Auth",
      "Security",
      "Payment",
      "Analytics",
      "Crash",
      "Store",
      "Privacy",
    ];

    const thead = el(
      "thead",
      null,
      [
        el(
          "tr",
          null,
          headers.map((h, i) =>
            el("th", {
              text: h,
              className: i >= 3 ? "hq-health-col--desk" : "",
            })
          )
        ),
      ]
    );
    const tbody = el("tbody");
    for (const app of report.apps) {
      const m = app.matrix || {};
      const tr = el("tr", {
        className: "hq-health-row",
        tabIndex: 0,
        role: "button",
        onClick: () => openDetail(app),
        onKeydown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDetail(app);
          }
        },
      });
      const cells = [
        { text: safeText(app.name), desk: false },
        { node: cellBadge(app.status), desk: false },
        { text: app.score == null ? "—" : String(app.score), desk: false },
        { node: cellBadge(m.build), desk: true },
        { node: cellBadge(m.firebase), desk: true },
        { node: cellBadge(m.auth), desk: true },
        { node: cellBadge(m.security), desk: true },
        { node: cellBadge(m.payment), desk: true },
        { node: cellBadge(m.analytics), desk: true },
        { node: cellBadge(m.crash), desk: true },
        { node: cellBadge(m.store), desk: true },
        { node: cellBadge(m.privacy), desk: true },
      ];
      for (const c of cells) {
        const td = el("td", { className: c.desk ? "hq-health-col--desk" : "" });
        if (c.node) td.appendChild(c.node);
        else td.textContent = c.text;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    const tableWrap = el("div", { className: "hq-table-wrap hq-health-table-wrap" }, [
      el("table", { className: "hq-table hq-health-table" }, [thead, tbody]),
    ]);
    root.appendChild(
      surfacePanel("Product matrix", [tableWrap], el("p", {
        className: "hq-health-hint",
        text: "Row click opens detail",
      }))
    );

    root.appendChild(
      el("p", {
        className: "hq-health-mobile-hint",
        text: "Mobile: Status and Score shown here. Open a row for the full matrix.",
      })
    );
  }

  return {
    load,
    render,
    getReport: () => report,
    getLoadError: () => loadError,
  };
}
