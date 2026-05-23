#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const idxPath = path.join(ROOT, "templates", "index.html");
const fragPath = path.join(ROOT, "templates", "pillmate-app-inc.html");

let idx = fs.readFileSync(idxPath, "utf8");
if (idx.includes('id="pillmate-app"')) {
  console.log("inject-pillmate-html: already present, skip");
  process.exit(0);
}
const frag = fs.readFileSync(fragPath, "utf8");
const needle = '    <div id="subping-app" class="ox-page site-shell" data-theme="light" hidden>';
if (!idx.includes(needle)) {
  console.error("inject-pillmate-html: needle not found");
  process.exit(1);
}
idx = idx.replace(needle, frag + "\n\n" + needle);
fs.writeFileSync(idxPath, idx, "utf8");
console.log("inject-pillmate-html: OK");
