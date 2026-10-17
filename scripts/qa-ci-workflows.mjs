#!/usr/bin/env node
/**
 * Static check of the GitHub workflows (no YAML library: the repo builds with the Node standard library only).
 *   - build-guards.yml must be read-only and must not run on push, so it can never start a production deploy;
 *   - github-pages.yml (the deploy) keeps its triggers (push to main, manual) and does not reference build-guards.
 * Exit 0 = PASS, 1 = FAIL.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WF = path.join(ROOT, ".github", "workflows");
const errors = [];

function block(text, key) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => new RegExp(`^${key}:`).test(l));
  if (start < 0) return null;
  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^\S/.test(lines[i]) && !/^#/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out;
}
const triggers = (text) => (block(text, "on") || []).map((l) => /^ {2}([a-z_]+):/.exec(l)?.[1]).filter(Boolean);
const code = (text) => text.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");

const guardsPath = path.join(WF, "build-guards.yml");
const deployPath = path.join(WF, "github-pages.yml");
if (!fs.existsSync(guardsPath)) errors.push("build-guards.yml is missing");
else {
  const g = fs.readFileSync(guardsPath, "utf8");
  const t = triggers(g);
  if (t.includes("push")) errors.push("build-guards.yml must not run on push");
  if (t.includes("schedule")) errors.push("build-guards.yml must not run on a schedule");
  if (!t.length || t.some((x) => !["pull_request", "workflow_dispatch"].includes(x))) errors.push(`build-guards.yml triggers must be pull_request/workflow_dispatch only, got [${t.join(", ")}]`);
  const perms = (block(g, "permissions") || []).join("\n");
  if (!/contents:\s*read/.test(perms) || /write/.test(perms)) errors.push("build-guards.yml permissions must be contents: read only");
  const c = code(g);
  for (const need of ["qa-build-determinism.mjs", "apply-approved-translations.mjs --check", "qa-build-drift.mjs"]) if (!c.includes(need)) errors.push(`build-guards.yml must keep the step: ${need}`);
  for (const bad of [/peaceiris/i, /gh-pages/i, /git\s+push/i, /force_orphan/i, /secrets\./i, /GITHUB_TOKEN/i, /\bcname\b/i]) if (bad.test(c)) errors.push(`build-guards.yml contains a publish/secret construct: ${bad}`);
}
if (!fs.existsSync(deployPath)) errors.push("github-pages.yml is missing");
else {
  const d = fs.readFileSync(deployPath, "utf8");
  const t = triggers(d).sort().join(",");
  if (t !== "push,workflow_dispatch") errors.push(`github-pages.yml triggers changed: [${t}]`);
  if (/build-guards/.test(d)) errors.push("github-pages.yml must not depend on build-guards");
}
for (const e of errors) console.error(`ci-workflows: ${e}`);
console.log(`ci-workflows: ${errors.length ? "FAIL" : "PASS"} · errors ${errors.length}`);
process.exit(errors.length ? 1 : 0);
