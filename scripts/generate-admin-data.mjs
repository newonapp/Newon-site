#!/usr/bin/env node
/**
 * Build-time admin dashboard — read-only product/experiment snapshot (noindex).
 * Growth page shows metric cards with "No data source" — never fake zeros as real metrics.
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
  store: STORE_PRODUCTS,
  tools: TOOLS.map((t) => ({ id: t.id, slug: t.slug, status: t.status || "live" })),
  growth: {
    // Explicit null = no wired data source. Do not invent zeros.
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

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, "growth"), { recursive: true });
fs.writeFileSync(path.join(OUT, "data.json"), JSON.stringify(snapshot, null, 2));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Newon Admin — Read-only</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1.5rem; background: #111; color: #f5f5f5; }
    h1 { font-size: 1.25rem; }
    a { color: #ddd; }
    section { margin: 2rem 0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th, td { border: 1px solid #333; padding: 0.5rem; text-align: left; vertical-align: top; }
    th { background: #1a1a1a; }
    .note { color: #aaa; max-width: 48rem; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Newon Admin (read-only)</h1>
  <p><a href="./growth/">Growth metrics →</a></p>
  <p class="note" id="note"></p>
  <section><h2>Products</h2><div id="products"></div></section>
  <section><h2>Labs</h2><div id="labs"></div></section>
  <section><h2>Store</h2><div id="store"></div></section>
  <p class="note">Generated at build time. Leads are not stored here — check FormSubmit inbox.</p>
  <script>
    fetch('./data.json').then(function(r){return r.json();}).then(function(d){
      document.getElementById('note').textContent = d.note || '';
      function table(rows, cols){
        if(!rows.length) return '<p>Empty</p>';
        var h = '<table><thead><tr>' + cols.map(function(c){return '<th>'+c+'</th>';}).join('') + '</tr></thead><tbody>';
        rows.forEach(function(row){
          h += '<tr>' + cols.map(function(c){ return '<td>' + (row[c]!=null?row[c]:'') + '</td>'; }).join('') + '</tr>';
        });
        return h + '</tbody></table>';
      }
      document.getElementById('products').innerHTML = table(d.products||[], ['id','type','status','name']);
      document.getElementById('labs').innerHTML = table(d.labs||[], ['id','status']);
      document.getElementById('store').innerHTML = table(d.store||[], ['slug','status','paymentProvider']);
    });
  </script>
</body>
</html>`;

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
  <p><a href="../">← Admin</a></p>
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

fs.writeFileSync(path.join(OUT, "index.html"), html);
fs.writeFileSync(path.join(OUT, "growth", "index.html"), growthHtml);
console.log("generate-admin-data: wrote admin/ + admin/growth/");
