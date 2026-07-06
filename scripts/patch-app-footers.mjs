#!/usr/bin/env node
/** Insert OX MONTH-style delete-account footer row on every app screen. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DELETE_ACCOUNT_APPS } from "./delete-account-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TPL = path.join(ROOT, "templates");

const INC_FILES = [
  { file: "pillmate-app-inc.html", ns: "pm", slug: "pillmate" },
  { file: "savy-app-inc.html", ns: "sv", slug: "savy" },
  { file: "babylog-app-inc.html", ns: "bl", slug: "babylog" },
  { file: "petlog-app-inc.html", ns: "pl", slug: "petlog" },
  { file: "piggyup-app-inc.html", ns: "pu", slug: "piggyup" },
  { file: "goalup-app-inc.html", ns: "gu", slug: "goalup" },
  { file: "countup-app-inc.html", ns: "cu", slug: "countup" },
  { file: "newon-plus-app-inc.html", ns: "np", slug: "newon" },
  { file: "noting-app-inc.html", ns: "nt", slug: "noting" },
];

const INDEX_APP_IDS = [
  { id: "pillmate-app", ns: "pm", slug: "pillmate" },
  { id: "savy-app", ns: "sv", slug: "savy" },
  { id: "babylog-app", ns: "bl", slug: "babylog" },
  { id: "petlog-app", ns: "pl", slug: "petlog" },
  { id: "piggyup-app", ns: "pu", slug: "piggyup" },
  { id: "goalup-app", ns: "gu", slug: "goalup" },
  { id: "countup-app", ns: "cu", slug: "countup" },
  { id: "newon-plus-app", ns: "np", slug: "newon" },
  { id: "noting-app", ns: "nt", slug: "noting" },
];

function deleteAccountBlock(ns, slug) {
  return `          <p class="ox-footer-delete-account">
            <a class="footer-legal" href="${slug}/delete-account/">{{t:${ns}.deleteAccountLink}}</a>
          </p>
`;
}

function patchFooterHtml(html, ns, slug) {
  if (html.includes(`href="${slug}/delete-account/"`)) return html;
  const re =
    /(<div class="footer-legal-links footer-legal-links--ox">[\s\S]*?<\/div>\n)([\s]*<div class="footer-icon-row footer-icon-row--ox")/;
  if (!re.test(html)) {
    console.warn(`patch-app-footers: footer pattern not found for ${ns}`);
    return html;
  }
  return html.replace(re, `$1${deleteAccountBlock(ns, slug)}$2`);
}

function patchIndexSection(html, appId, ns, slug) {
  const start = html.indexOf(`id="${appId}"`);
  if (start < 0) return html;
  const nextIds = INDEX_APP_IDS.map((a) => a.id).filter((id) => id !== appId);
  let end = html.length;
  for (const nid of nextIds) {
    const i = html.indexOf(`id="${nid}"`, start + 1);
    if (i >= 0 && i < end) end = i;
  }
  const chunk = html.slice(start, end);
  if (chunk.includes(`href="${slug}/delete-account/"`)) return html;
  const patched = patchFooterHtml(chunk, ns, slug);
  if (patched === chunk) return html;
  return html.slice(0, start) + patched + html.slice(end);
}

let changed = 0;

for (const { file, ns, slug } of INC_FILES) {
  const p = path.join(TPL, file);
  const before = fs.readFileSync(p, "utf8");
  const after = patchFooterHtml(before, ns, slug);
  if (after !== before) {
    fs.writeFileSync(p, after, "utf8");
    changed++;
    console.log(`patched ${file}`);
  }
}

const indexPath = path.join(TPL, "index.html");
let index = fs.readFileSync(indexPath, "utf8");
for (const { id, ns, slug } of INDEX_APP_IDS) {
  const next = patchIndexSection(index, id, ns, slug);
  if (next !== index) {
    index = next;
    changed++;
    console.log(`patched index.html section ${id}`);
  }
}

if (index !== fs.readFileSync(indexPath, "utf8")) {
  fs.writeFileSync(indexPath, index, "utf8");
}

console.log(`patch-app-footers: OK (${changed} updates)`);
