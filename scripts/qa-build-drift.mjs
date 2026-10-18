#!/usr/bin/env node
/**
 * Build drift guard.
 *
 * `node scripts/publish-site.mjs` rewrites tracked files in place (generated pages, templates/, locales/).
 * A build from a clean checkout is reproducible, but the result differs from what is committed in a known
 * set of files (see docs/web-closure/PHASE03-P5-BUILD-DRIFT.md). This check makes that set explicit:
 *
 *   node scripts/qa-build-drift.mjs            run AFTER a build, in a git work tree; fails on unintended drift
 *   node scripts/qa-build-drift.mjs --all       list every error, not just the first 40
 *   node scripts/qa-build-drift.mjs --update   rewrite the baseline from the current work tree (deliberate act)
 *
 * What counts as drift: a tracked file whose built content differs from HEAD beyond whitespace/blank lines.
 * What fails:
 *   - a drifted file that is not in the baseline          (unintended new change)
 *   - a drifted file whose built content hash differs     (the generated content changed)
 *   - a new untracked file outside _publish               (the build created an unexpected file)
 * Baseline entries that no longer drift are reported but do not fail (the drift got fixed).
 * Timestamps are masked: sitemap <lastmod>, admin/data.json generatedAt.
 *
 * Run it after ONE build from a clean checkout (what CI does). A second build in the same tree is not idempotent
 * (the pre-build patch scripts rewrite tracked templates/locales in place), so it is expected to report drift.
 *
 * Exit 0 = PASS, 1 = FAIL, 2 = NOT RUN (not a git work tree).
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = path.join(ROOT, "docs", "web-closure", "build-drift-baseline.json");
const update = process.argv.includes("--update");
const showAll = process.argv.includes("--all");

function git(args, opts = {}) {
  const r = spawnSync("git", args, { cwd: ROOT, encoding: "buffer", maxBuffer: 1 << 28, ...opts });
  return r;
}

const inside = git(["rev-parse", "--is-inside-work-tree"]);
if (inside.status !== 0 || String(inside.stdout).trim() !== "true") {
  console.log("build-drift: NOT RUN (not a git work tree)");
  process.exit(2);
}

function normalize(rel, buf) {
  let s = buf.toString("utf8");
  if (rel === "sitemap.xml") s = s.replace(/<lastmod>[^<]*<\/lastmod>/g, "<lastmod>-</lastmod>");
  if (rel === "admin/data.json") s = s.replace(/"generatedAt":\s*"[^"]*"/g, '"generatedAt": "-"');
  return s
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .filter((l) => l.trim() !== "")
    .join("\n");
}
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

const modified = String(git(["ls-files", "-m", "-z"]).stdout).split("\0").filter(Boolean);
const untracked = String(git(["ls-files", "-o", "--exclude-standard", "-z"]).stdout)
  .split("\0")
  .filter((f) => f && !f.startsWith("_publish/") && !f.startsWith("node_modules/"));

const drift = {};
let whitespaceOnly = 0;
for (const rel of modified) {
  if (rel.startsWith("node_modules/")) continue;
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const now = normalize(rel, fs.readFileSync(abs));
  const head = git(["show", `HEAD:${rel}`]);
  if (head.status === 0 && normalize(rel, head.stdout) === now) {
    whitespaceOnly += 1;
    continue;
  }
  drift[rel] = sha(now);
}

if (update) {
  const out = {
    note: "Files that a clean `node scripts/publish-site.mjs` changes beyond whitespace. Value = sha256 of the normalised built content.",
    baseCommit: String(git(["rev-parse", "--short", "HEAD"]).stdout).trim(),
    count: Object.keys(drift).length,
    files: Object.fromEntries(Object.entries(drift).sort(([a], [b]) => a.localeCompare(b))),
  };
  fs.writeFileSync(BASELINE, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`build-drift: baseline written, ${out.count} file(s); ${whitespaceOnly} whitespace-only change(s) ignored`);
  process.exit(0);
}

if (!fs.existsSync(BASELINE)) {
  console.log("build-drift: FAIL (baseline missing: run with --update after a clean build)");
  process.exit(1);
}
const base = JSON.parse(fs.readFileSync(BASELINE, "utf8")).files || {};
const errors = [];
for (const [rel, h] of Object.entries(drift)) {
  if (!(rel in base)) errors.push(`new drift: ${rel}`);
  else if (base[rel] !== h) errors.push(`changed drift: ${rel}`);
}
for (const rel of untracked) errors.push(`unexpected new file: ${rel}`);
const fixed = Object.keys(base).filter((rel) => !(rel in drift));

const cap = showAll ? errors.length : 40;
for (const e of errors.slice(0, cap)) console.error(`build-drift: ${e}`);
if (errors.length > cap) console.error(`build-drift: ... ${errors.length - 40} more`);
console.log(
  `build-drift: ${errors.length ? "FAIL" : "PASS"} · drifted ${Object.keys(drift).length} (baseline ${Object.keys(base).length}), ` +
    `whitespace-only ${whitespaceOnly}, no-longer-drifting ${fixed.length}, errors ${errors.length}`,
);
process.exit(errors.length ? 1 : 0);
