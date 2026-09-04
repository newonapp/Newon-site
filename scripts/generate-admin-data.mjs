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

const nav = [
  ["dashboard", "Dashboard"],
  ["tasks", "Tasks"],
  ["releases", "Releases"],
  ["leads", "Leads"],
  ["finance", "Finance"],
  ["products", "Products"],
  ["settings", "Settings"],
]
  .map(
    ([id, label]) =>
      `<button type="button" class="hq-nav__link" data-hq-nav="${id}">${label}</button>`
  )
  .join("\n        ");

const panels = [
  "dashboard",
  "tasks",
  "releases",
  "leads",
  "finance",
  "products",
  "settings",
]
  .map(
    (id, i) =>
      `<section class="hq-panel-section" id="hq-panel-${id}" ${i === 0 ? "" : "hidden"} aria-label="${id}"></section>`
  )
  .join("\n        ");

const hqHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Newon HQ</title>
  <link rel="stylesheet" href="./hq.css?v=20260904hq1c" />
</head>
<body>
  <div class="hq hq--auth" id="hq-auth-wrap">
    <p class="hq__eyebrow">NEWON HQ</p>
    <h1 class="hq__title">Private Operations</h1>
    <p class="hq__lead">Internal console for Newon. Sign in with the admin Google account.</p>
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
        <button type="button" class="hq-btn" id="hq-login">Google 계정으로 로그인</button>
      </div>
    </section>

    <section class="hq-view hq-panel" id="hq-view-denied" hidden aria-label="Access denied">
      <p class="hq__eyebrow">Access denied</p>
      <h2 class="hq__title" style="font-size:1.15rem">This account is not authorized for Newon HQ.</h2>
      <p class="hq__lead">Signed in as <span id="hq-denied-email">—</span></p>
      <div class="hq-actions">
        <button type="button" class="hq-btn hq-btn--ghost" data-hq-logout>로그아웃</button>
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
      <p class="hq-nav__brand">NEWON HQ</p>
      <nav class="hq-nav__list">
        ${nav}
      </nav>
      <button type="button" class="hq-btn hq-btn--ghost hq-btn--small hq-nav__logout" data-hq-logout>로그아웃</button>
    </aside>
    <main class="hq-main" id="hq-main">
      <p class="hq-toast" id="hq-toast" role="status" aria-live="polite" hidden></p>
      ${panels}
    </main>
    <dialog class="hq-modal" id="hq-modal" aria-labelledby="hq-modal-title">
      <div class="hq-modal__inner">
        <h2 class="hq-modal__title" id="hq-modal-title">Modal</h2>
        <div class="hq-modal__body" id="hq-modal-body"></div>
        <div class="hq-modal__actions" id="hq-modal-actions"></div>
      </div>
    </dialog>
  </div>

  <script src="./firebase-config.js?v=20260904hq1c"></script>
  <script type="module" src="./hq-auth.js?v=20260904hq1c"></script>
  <script type="module" src="./hq-app.js?v=20260904hq1c"></script>
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
console.log("generate-admin-data: wrote HQ shell + catalog.json + data.json + growth/");
