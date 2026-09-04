#!/usr/bin/env node
/**
 * Fast pre-deploy / local CI checks (no network, no Lighthouse, no store probes).
 *
 * FAIL = build must not ship
 * WARN = printed but does not fail (unless --strict-warn)
 *
 * Usage:
 *   node scripts/ci/fast-check.mjs
 *   node scripts/ci/fast-check.mjs --publish-root _publish
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

const PLACEHOLDER_RE = /\{\{[A-Z][A-Z0-9_]+\}\}/g;

/** Critical surfaces — unresolved tokens here are FAIL. */
const CRITICAL_HTML = [
  "ko/index.html",
  "en/index.html",
  "ko/products/index.html",
  "ko/business/index.html",
  "ko/business/inquiry/index.html",
  "ko/contact/index.html",
  "ko/portfolio/index.html",
  "admin/index.html",
];

/** Paths that must never appear inside a Pages artifact. */
const FORBIDDEN_PUBLISH_TOP = [
  "reports",
  "docs",
  "scripts",
  ".github",
  "node_modules",
  "backup",
  "backups",
  "_restore_tmp",
];

function parseArgs(argv) {
  const opts = { publishRoot: null, strictWarn: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--publish-root" && argv[i + 1]) opts.publishRoot = path.resolve(argv[++i]);
    else if (argv[i] === "--strict-warn") opts.strictWarn = true;
  }
  return opts;
}

function read(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8");
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const errors = [];
  const warns = [];

  // 1) Critical files exist
  for (const rel of CRITICAL_HTML) {
    if (!fs.existsSync(path.join(ROOT, rel))) {
      errors.push(`missing critical file: ${rel}`);
    }
  }

  // 2) Unresolved generator placeholders on critical pages
  for (const rel of CRITICAL_HTML) {
    const html = read(rel);
    if (!html) continue;
    const found = html.match(PLACEHOLDER_RE) || [];
    if (found.length) {
      errors.push(`${rel}: unresolved placeholders ${[...new Set(found)].slice(0, 5).join(", ")}`);
    }
  }

  // 3) Business pricing drift (SoT → rendered HTML)
  const pricing = spawnSync(process.execPath, [path.join(ROOT, "scripts", "qa-business-pricing.mjs")], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (pricing.status !== 0) {
    errors.push("qa-business-pricing failed (pricing SoT vs rendered HTML drift)");
    if (pricing.stdout) console.log(pricing.stdout.trim());
    if (pricing.stderr) console.error(pricing.stderr.trim());
  } else {
    const line = (pricing.stdout || "").trim().split("\n").pop();
    console.log(`fast-check: ${line || "pricing QA OK"}`);
  }

  // 4) Core SoT modules load
  for (const mod of ["scripts/business-pricing.mjs", "scripts/studio-pricing.mjs", "scripts/seo-meta.mjs"]) {
    const r = spawnSync(process.execPath, ["--check", path.join(ROOT, mod)], {
      cwd: ROOT,
      encoding: "utf8",
    });
    // --check works for .js; for .mjs may still parse
    if (r.status !== 0) {
      // Fallback: dynamic import syntax check via node -e
      const imp = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", `import ${JSON.stringify("./" + mod)}`],
        { cwd: ROOT, encoding: "utf8" }
      );
      if (imp.status !== 0) {
        errors.push(`SoT module failed to load: ${mod}`);
      }
    }
  }

  // 5) Publish artifact hygiene (when provided)
  if (opts.publishRoot) {
    if (!fs.existsSync(opts.publishRoot)) {
      errors.push(`publish root missing: ${opts.publishRoot}`);
    } else {
      for (const name of FORBIDDEN_PUBLISH_TOP) {
        const p = path.join(opts.publishRoot, name);
        if (fs.existsSync(p)) {
          errors.push(`forbidden path in publish artifact: ${name}/`);
        }
      }
      for (const must of ["index.html", "ko/index.html", "sitemap.xml", "robots.txt", "admin/index.html"]) {
        if (!fs.existsSync(path.join(opts.publishRoot, must))) {
          errors.push(`publish artifact missing: ${must}`);
        }
      }
    }
  }

  // 6) Soft: tracked archive smell (informational)
  const trackedZips = ["Newon-site-upload.zip", "newon-site.zip"];
  for (const z of trackedZips) {
    if (fs.existsSync(path.join(ROOT, z))) {
      // After hygiene untrack they may still exist locally ignored — WARN only if git tracks
      const ls = spawnSync("git", ["ls-files", "--error-unmatch", z], {
        cwd: ROOT,
        encoding: "utf8",
      });
      if (ls.status === 0) {
        warns.push(`${z} is still git-tracked (prefer untrack; keep local only)`);
      }
    }
  }

  for (const w of warns) console.warn(`fast-check WARN: ${w}`);
  for (const e of errors) console.error(`fast-check FAIL: ${e}`);

  if (errors.length) {
    console.error(`fast-check: ${errors.length} failure(s)`);
    process.exit(1);
  }
  if (opts.strictWarn && warns.length) {
    console.error(`fast-check: ${warns.length} warning(s) with --strict-warn`);
    process.exit(1);
  }
  console.log("fast-check: PASS");
  process.exit(0);
}

main();
