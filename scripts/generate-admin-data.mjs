#!/usr/bin/env node
/**
 * Build-time admin snapshot + Newon HQ entry (Auth + Operations shell).
 * Operational CRUD data lives only in Firestore — never in these static files.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { allProducts } from "./products-data.mjs";
import { LABS_EXPERIMENTS } from "./labs-data.mjs";
import { STORE_PRODUCTS } from "./store-data.mjs";
import { TOOLS } from "./tools-data.mjs";
import { SERVICE_PRICING } from "./business-pricing.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "admin");

const snapshot = {
  generatedAt: new Date().toISOString(),
  note: "Business leads, waitlist, and newsletter submissions are collected via FormSubmit to newon@newon.app. Activate the inbox at formsubmit.co if not done yet.",
  products: allProducts("ko"),
  labs: LABS_EXPERIMENTS,
  store: STORE_PRODUCTS.filter((p) => p.listed !== false),
  tools: TOOLS.map((t) => ({ id: t.id, slug: t.slug, status: t.status || "live" })),
  growth: {
    metrics: [
      { id: "page_views", label: "Page views", value: null, source: null },
      { id: "store_views", label: "Store product views", value: null, source: null },
      { id: "insight_views", label: "Insight views", value: null, source: null },
      { id: "tool_starts", label: "Tool starts", value: null, source: null },
      { id: "creative_inquiries", label: "Creative inquiries", value: null, source: null },
      { id: "newsletter_signups", label: "Newsletter signups", value: null, source: null },
      { id: "experiment_views", label: "Experiment views", value: null, source: null },
      { id: "affiliate_clicks", label: "Affiliate clicks", value: null, source: null },
    ],
  },
};

/** Public product SoT for HQ Products panel (read-only catalog, not ops CRUD). */
const seen = new Set();
const catalog = [];
function pushCatalog(row) {
  if (!row.slug || seen.has(row.slug)) return;
  seen.add(row.slug);
  catalog.push(row);
}
for (const p of allProducts("ko")) {
  pushCatalog({
    slug: p.slug,
    name: p.name || p.slug,
    type: p.type || "other",
    platforms: Array.isArray(p.platforms) ? p.platforms.join(" / ") : p.platforms || "—",
    status: p.status || "—",
  });
}
for (const p of STORE_PRODUCTS.filter((x) => x.listed !== false)) {
  pushCatalog({
    slug: p.slug,
    name: p.name || p.title || p.slug,
    type: "store",
    platforms: "Digital",
    status: p.status || "—",
  });
}

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, "growth"), { recursive: true });
fs.writeFileSync(path.join(OUT, "data.json"), JSON.stringify(snapshot, null, 2));
fs.writeFileSync(path.join(OUT, "catalog.json"), JSON.stringify(catalog, null, 2));

/** HQ Project service types — derived from Business SERVICE_PRICING SoT. */
const serviceTypes = Object.entries(SERVICE_PRICING).map(([slug, cfg]) => ({
  value: slug,
  label: cfg.inquiryLabelEn || cfg.inquiryLabelKo || slug,
}));
serviceTypes.push({ value: "other", label: "Other" });
fs.writeFileSync(path.join(OUT, "service-types.json"), JSON.stringify(serviceTypes, null, 2));

const pricing = Object.fromEntries(
  Object.entries(SERVICE_PRICING).map(([slug, cfg]) => [
    slug,
    {
      amount: typeof cfg.amount === "number" ? cfg.amount : 0,
      label: cfg.inquiryLabelEn || cfg.inquiryLabelKo || slug,
      custom: !!cfg.custom,
    },
  ])
);
fs.writeFileSync(path.join(OUT, "pricing.json"), JSON.stringify(pricing, null, 2));

function navIcon(d) {
  return `<svg class="hq-nav__icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="${d}"/></svg>`;
}

function navBtn(id, label, path) {
  return `<button type="button" class="hq-nav__link" data-hq-nav="${id}">${navIcon(path)}<span>${label}</span></button>`;
}

const I = {
  dashboard: "M3 12h7V3H3v9zm0 9h7v-7H3v7zm11 0h7V12h-7v9zm0-18v7h7V3h-7z",
  tasks: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  releases: "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8",
  leads: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  clients: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 11l2 2 4-4",
  projects: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  documents: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  finance: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  products: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
};

const panels = [
  "dashboard",
  "tasks",
  "releases",
  "leads",
  "clients",
  "projects",
  "documents",
  "finance",
  "products",
  "settings",
]
  .map(
    (id, i) =>
      `<section class="hq-panel-section" id="hq-panel-${id}" ${i === 0 ? "" : "hidden"} aria-label="${id}"></section>`
  )
  .join("\n          ");

const hqHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Newon HQ</title>
  <link rel="stylesheet" href="./hq.css?v=20260904hq2d" />
</head>
<body>
  <div class="hq hq--auth" id="hq-auth-wrap">
    <p class="hq__eyebrow">NEWON HQ</p>
    <h1 class="hq__title">Private Operations</h1>
    <p class="hq__lead">Internal operating console for Newon. Sign in with the authorized admin Google account.</p>
    <p class="hq-status" id="hq-live-status" role="status" aria-live="polite"></p>

    <section class="hq-view hq-panel" id="hq-view-loading" aria-label="Loading">
      <p class="hq-status">Checking authentication…</p>
    </section>

    <section class="hq-view hq-panel" id="hq-view-config" hidden aria-label="Firebase config required">
      <p class="hq__eyebrow">Setup</p>
      <h2 class="hq__title" style="font-size:1.15rem">Firebase config required</h2>
      <p class="hq-status hq-status--err">Missing: <span id="hq-config-missing"></span></p>
    </section>

    <section class="hq-view hq-panel" id="hq-view-signed-out" hidden aria-label="Sign in">
      <p class="hq__lead" style="margin-bottom:0">Authorized admin Google account only.</p>
      <div class="hq-actions">
        <button type="button" class="hq-btn" id="hq-login">Continue with Google</button>
      </div>
    </section>

    <section class="hq-view hq-panel" id="hq-view-denied" hidden aria-label="Access denied">
      <p class="hq__eyebrow">Access denied</p>
      <h2 class="hq__title" style="font-size:1.15rem">This account is not authorized for Newon HQ.</h2>
      <p class="hq__lead">Signed in as <span id="hq-denied-email">—</span></p>
      <div class="hq-actions">
        <button type="button" class="hq-btn hq-btn--ghost" data-hq-logout>Sign out</button>
      </div>
    </section>

    <section class="hq-view hq-panel" id="hq-view-error" hidden aria-label="Error">
      <p class="hq-status hq-status--err" id="hq-error-msg">Something went wrong.</p>
      <div class="hq-actions">
        <button type="button" class="hq-btn" id="hq-retry">Try again</button>
      </div>
    </section>
  </div>

  <div class="hq-shell" id="hq-view-authorized" hidden>
    <button type="button" class="hq-nav-toggle" id="hq-nav-toggle" aria-controls="hq-nav" aria-expanded="false">Menu</button>
    <div class="hq-shell-backdrop" id="hq-shell-backdrop" hidden></div>
    <aside class="hq-nav" id="hq-nav" aria-label="HQ navigation">
      <div class="hq-nav__brand">
        <span class="hq-nav__brand-name">Newon</span>
        <span class="hq-nav__brand-hq">HQ</span>
        <span class="hq-nav__brand-label">Private Operations</span>
      </div>
      <div class="hq-nav__scroll">
        <nav class="hq-nav__list" aria-label="Primary">
          <p class="hq-nav__group">Overview</p>
          ${navBtn("dashboard", "Dashboard", I.dashboard)}
          <p class="hq-nav__group">Operations</p>
          ${navBtn("tasks", "Tasks", I.tasks)}
          ${navBtn("releases", "Releases", I.releases)}
          ${navBtn("products", "Products", I.products)}
          <p class="hq-nav__group">Business</p>
          ${navBtn("leads", "Leads", I.leads)}
          ${navBtn("clients", "Clients", I.clients)}
          ${navBtn("projects", "Projects", I.projects)}
          ${navBtn("documents", "Documents", I.documents)}
          ${navBtn("finance", "Finance", I.finance)}
          <p class="hq-nav__group">System</p>
          ${navBtn("settings", "Settings", I.settings)}
        </nav>
      </div>
      <div class="hq-nav__footer">
        <div class="hq-nav__profile">
          <span class="hq-nav__avatar" aria-hidden="true">N</span>
          <div>
            <p class="hq-nav__email" id="hq-shell-email">—</p>
            <p class="hq-nav__role"><span class="hq-nav__dot" aria-hidden="true"></span> Admin</p>
          </div>
        </div>
        <button type="button" class="hq-btn hq-btn--ghost hq-btn--small" data-hq-logout>Sign out</button>
      </div>
    </aside>
    <main class="hq-main" id="hq-main">
      <div class="hq-main__inner">
        <p class="hq-toast" id="hq-toast" role="status" aria-live="polite" hidden></p>
        ${panels}
      </div>
    </main>
    <dialog class="hq-modal" id="hq-modal" aria-labelledby="hq-modal-title">
      <div class="hq-modal__inner">
        <h2 class="hq-modal__title" id="hq-modal-title">Modal</h2>
        <div class="hq-modal__body" id="hq-modal-body"></div>
        <div class="hq-modal__actions" id="hq-modal-actions"></div>
      </div>
    </dialog>
  </div>

  <script src="./firebase-config.js?v=20260904hq2d"></script>
  <script type="module" src="./hq-auth.js?v=20260904hq2d"></script>
  <script type="module" src="./hq-app.js?v=20260904hq2d"></script>
</body>
</html>
`;

const growthHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Newon Admin — Growth</title>
  <style>
    body { font-family: "IBM Plex Sans", system-ui, sans-serif; margin: 0; padding: 1.5rem; background: #0a0a0a; color: #f5f5f5; }
    h1 { font-size: 1.25rem; letter-spacing: 0.04em; text-transform: uppercase; }
    a { color: #ccc; }
    .note { color: #888; max-width: 40rem; line-height: 1.55; margin: 0.75rem 0 1.5rem; }
    .grid { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    .card { border: 1px solid #2a2a2a; padding: 1rem 1.1rem; background: #111; }
    .card__label { font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: #777; }
    .card__value { font-size: 1.5rem; margin: 0.55rem 0 0.35rem; font-variant-numeric: tabular-nums; }
    .card__src { font-size: 0.75rem; color: #666; }
    .card.is-empty .card__value { color: #555; font-size: 0.95rem; }
  </style>
</head>
<body>
  <p><a href="../">← Newon HQ</a></p>
  <h1>Growth</h1>
  <p class="note">Metrics stay blank until a real analytics source is wired. Empty cards mean “No data source” — not zero traffic.</p>
  <div class="grid" id="metrics"></div>
  <script>
    fetch('../data.json').then(function(r){return r.json();}).then(function(d){
      var metrics = (d.growth && d.growth.metrics) || [];
      var root = document.getElementById('metrics');
      if (!metrics.length) {
        root.innerHTML = '<p class="note">No metrics configured.</p>';
        return;
      }
      root.innerHTML = metrics.map(function(m){
        var has = m.value != null && m.source;
        var value = has ? String(m.value) : 'No data source';
        var src = has ? ('Source: ' + m.source) : 'Not connected';
        return '<article class="card' + (has ? '' : ' is-empty') + '">' +
          '<p class="card__label">' + (m.label || m.id) + '</p>' +
          '<p class="card__value">' + value + '</p>' +
          '<p class="card__src">' + src + '</p>' +
        '</article>';
      }).join('');
    }).catch(function(){
      document.getElementById('metrics').innerHTML = '<p class="note">Could not load data.json</p>';
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(OUT, "index.html"), hqHtml);
fs.writeFileSync(path.join(OUT, "growth", "index.html"), growthHtml);
console.log(
  "generate-admin-data: wrote HQ shell + catalog + service-types + pricing + data + growth"
);
