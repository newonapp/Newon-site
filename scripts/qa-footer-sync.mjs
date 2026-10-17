#!/usr/bin/env node
/**
 * QA — every brand footer in the committed HTML must carry the link set that renderStudioFooter()
 * (FOOTER_MENUS + privacy + terms) produces. Catches generated pages that were committed before a
 * menu change and so stay stale until someone rebuilds (10 Business/Studio hub pages + games × 9 languages did).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FOOTER_MENUS } from "./site-chrome.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["_publish", "_restore_tmp", "node_modules", ".git", "templates"]);
const NAV_RE = /<footer class="site-footer site-footer--brand[^"]*"[^>]*>[\s\S]*?<nav class="site-foot__nav"[^>]*>([\s\S]*?)<\/nav>/;
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

const expected = [...FOOTER_MENUS.map(([, p]) => p), "privacy/", "terms/"];
const norm = (h) => h.replace(/^(?:\.\.\/)+/, "").replace(/^\//, "").replace(new RegExp(`^(?:${LANGS.join("|")})/`), "");

const errors = [];
let checked = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) { walk(rel); continue; }
    if (!e.name.endsWith(".html")) continue;
    const m = fs.readFileSync(path.join(ROOT, rel), "utf8").match(NAV_RE);
    if (!m) continue;
    checked++;
    const got = [...m[1].matchAll(/href="([^"]*)"/g)].map((x) => norm(x[1]));
    if (JSON.stringify(got) !== JSON.stringify(expected)) {
      errors.push(`${rel}: footer links [${got.join(", ")}] != expected [${expected.join(", ")}]`);
    }
  }
})(".");

errors.slice(0, 20).forEach((e) => console.log(`[ERROR] ${e}`));
console.log(`\nFooter sync QA: ${checked} page(s) checked, ${errors.length} error(s).`);
process.exit(errors.length ? 1 : 0);
