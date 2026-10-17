#!/usr/bin/env node
/**
 * Build determinism check (PHASE 03 P7). A build that gives a different result for the same input is a FAIL.
 *
 * Copies the repository (tracked + untracked, not ignored) into two scratch trees and runs the real site build
 * (scripts/publish-site.mjs) with a fixed SOURCE_DATE_EPOCH:
 *   A1  clean build in tree A
 *   A2  second build in the SAME tree A      -> must equal A1  (repeat build)
 *   B1  clean build in an independent tree B -> must equal A1  (independent clean build)
 * It also verifies that the build left the protected translation sources untouched
 * (locales/_sp.*.json, i18n-approved/, i18n-candidates/) and reports every differing file with its group.
 *
 *   node scripts/qa-build-determinism.mjs [--keep] [--json out.json]
 *
 * Nothing is written to the repository and nothing is published.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const keep = argv.includes("--keep");
const jsonOut = argv.includes("--json") ? argv[argv.indexOf("--json") + 1] : null;
const EPOCH = "1792281600";
const PROTECTED = [/^locales\/_sp\..+\.json$/, /^i18n-approved\//, /^i18n-candidates\//];

function walkFiles(dir, rel = "") {
  const out = [];
  for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    if ([".git", "node_modules", "_publish"].includes(e.name) && !rel) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walkFiles(dir, r));
    else if (e.isFile()) out.push(r);
  }
  return out;
}
function listSource() {
  const r = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, maxBuffer: 1 << 28 });
  // not a git checkout (an exported or copied tree): use every file except .git, node_modules and the _publish output
  const files = r.status === 0 ? r.stdout.toString("utf8").split("\0").filter(Boolean) : walkFiles(ROOT);
  return files.filter((f) => fs.existsSync(path.join(ROOT, f)));
}
function copyTree(files, dest) {
  for (const f of files) {
    const to = path.join(dest, f);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(ROOT, f), to);
  }
  if (fs.existsSync(path.join(ROOT, "node_modules"))) fs.symlinkSync(path.join(ROOT, "node_modules"), path.join(dest, "node_modules"));
}
function snapshot(dir) {
  const out = new Map();
  (function walk(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === ".git" || e.name === "node_modules") continue;
      const p = path.join(d, e.name), r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(p, r);
      else if (e.isFile()) out.set(r, crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"));
    }
  })(dir, "");
  return out;
}
function treeHash(snap) {
  const h = crypto.createHash("sha256");
  for (const k of [...snap.keys()].sort()) h.update(`${k}\0${snap.get(k)}\n`);
  return h.digest("hex").slice(0, 16);
}
function diff(a, b) {
  const ks = new Set([...a.keys(), ...b.keys()]);
  return [...ks].filter((k) => a.get(k) !== b.get(k)).sort();
}
function group(f) {
  if (/^admin\//.test(f)) return "admin-data";
  if (/\/index\.html$|^index\.html$/.test(f)) return "page";
  if (/^locales\//.test(f) || /^_publish\/locales\//.test(f)) return "locale-data";
  if (/sitemap/.test(f)) return "sitemap";
  return "other";
}
function build(dir, label) {
  const t = Date.now();
  const r = spawnSync(process.execPath, ["scripts/publish-site.mjs"], {
    cwd: dir, env: { ...process.env, SOURCE_DATE_EPOCH: EPOCH }, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 28,
  });
  console.log(`determinism: ${label} build rc=${r.status} (${Math.round((Date.now() - t) / 1000)}s)`);
  if (r.status !== 0) { console.error(String(r.stderr).slice(-1500)); process.exit(2); }
}

const files = listSource();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "newon-determinism-"));
const A = path.join(tmp, "A"), B = path.join(tmp, "B");
copyTree(files, A);
copyTree(files, B);
const before = snapshot(A);
build(A, "A1 clean");
const a1 = snapshot(A);
build(A, "A2 repeat (same tree)");
const a2 = snapshot(A);
build(B, "B1 clean (independent tree)");
const b1 = snapshot(B);

const errors = [];
const repeat = diff(a1, a2), indep = diff(a1, b1);
const touched = diff(before, a1).filter((f) => PROTECTED.some((re) => re.test(f)));
if (repeat.length) errors.push(`repeat build changed ${repeat.length} file(s)`);
if (indep.length) errors.push(`independent clean builds differ in ${indep.length} file(s)`);
if (touched.length) errors.push(`build modified protected translation sources: ${touched.join(", ")}`);
const groups = (list) => list.reduce((o, f) => ((o[group(f)] = (o[group(f)] || 0) + 1), o), {});
const result = {
  files: a1.size, hashA1: treeHash(a1), hashA2: treeHash(a2), hashB1: treeHash(b1),
  repeatDiff: repeat.slice(0, 50), repeatGroups: groups(repeat), independentDiff: indep.slice(0, 50), independentGroups: groups(indep),
  protectedSourcesTouched: touched, epoch: EPOCH, errors,
};
if (jsonOut) fs.writeFileSync(jsonOut, `${JSON.stringify(result, null, 1)}\n`);
if (!keep) fs.rmSync(tmp, { recursive: true, force: true }); else console.log(`determinism: kept ${tmp}`);
console.log(`determinism: ${errors.length ? "FAIL" : "PASS"} · ${a1.size} files · A1 ${result.hashA1} · A2 ${result.hashA2} · B1 ${result.hashB1} · protected sources touched ${touched.length}`);
for (const e of errors) console.error(`determinism: ${e}`);
for (const f of repeat.slice(0, 10)) console.error(`determinism: repeat diff ${f} [${group(f)}]`);
for (const f of indep.slice(0, 10)) console.error(`determinism: independent diff ${f} [${group(f)}]`);
process.exit(errors.length ? 1 : 0);
