// Re-derive every business/studio page from the pre-sanitizer base commit with the current sanitizer,
// keeping the CURRENT header / footer / asset versions.  usage: node rebuild-from-base.mjs <base> [--apply]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { sanitizeBusinessHtml } from "/home/claude/newonapp/newon-site/scripts/business-model-sanitize.mjs";
const base = process.argv[2];
const apply = process.argv.includes("--apply");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const H = /<header class="(?:site-header gnav|gnav site-header)[\s\S]*?<\/header>/;
const F = /<footer[\s\S]*?<\/footer>/;
const walk = (d, o = []) => { if (!fs.existsSync(d)) return o; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, o) : e.name === "index.html" && o.push(p); } return o; };
let changed = 0, same = 0, skipped = 0;
for (const lang of LANGS) for (const area of ["business", "studio"]) for (const f of walk(path.join(lang, area))) {
  let old;
  try { old = execFileSync("git", ["show", `${base}:${f}`], { encoding: "utf8", maxBuffer: 1 << 26 }); } catch { skipped++; continue; }
  const cur = fs.readFileSync(f, "utf8");
  if (old.length < 600 && /http-equiv="refresh"/i.test(old)) { skipped++; continue; }
  let next = sanitizeBusinessHtml(old, lang);
  const ch = H.exec(cur), cf = F.exec(cur);
  if (ch) next = next.replace(H, () => ch[0]);
  if (cf) next = next.replace(F, () => cf[0]);
  const vm = new Map(); for (const m of cur.matchAll(/([\w./:@-]+)\?v=([A-Za-z0-9._-]+)/g)) vm.set(m[1], m[2]);
  next = next.replace(/([\w./:@-]+)\?v=([A-Za-z0-9._-]+)/g, (m, u) => (vm.has(u) ? `${u}?v=${vm.get(u)}` : m));
  if (next === cur) { same++; continue; }
  changed++;
  if (apply) fs.writeFileSync(f, next);
}
console.log(JSON.stringify({ changed, same, skipped, apply }));
