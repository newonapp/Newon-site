#!/usr/bin/env node
/**
 * Build-time admin dashboard — read-only product/experiment snapshot (noindex).
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
  tools: TOOLS.map((t) => ({ id: t.id, slug: t.slug })),
};

fs.mkdirSync(OUT, { recursive: true });
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
    section { margin: 2rem 0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th, td { border: 1px solid #333; padding: 0.5rem; text-align: left; vertical-align: top; }
    th { background: #1a1a1a; }
    .note { color: #aaa; max-width: 48rem; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Newon Admin (read-only)</h1>
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

fs.writeFileSync(path.join(OUT, "index.html"), html);
console.log("generate-admin-data: wrote admin/");
