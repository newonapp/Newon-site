import fs from "fs";
import path from "path";
import { REPO_ROOT, SITE_SCOPE } from "../config.mjs";
import { STATUS } from "./status.mjs";

function groupByStatus(findings) {
  const g = { PASS: [], WARN: [], FAIL: [], UNKNOWN: [], "N/A": [], MANUAL: [] };
  for (const f of findings) {
    if (f.manual) g.MANUAL.push(f);
    const bucket = g[f.status] || g.UNKNOWN;
    bucket.push(f);
  }
  return g;
}

export function writeJsonReport(report, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const safe = JSON.parse(JSON.stringify(report));
  // Belt-and-suspenders: strip anything that looks like a secret field
  stripSecrets(safe);
  fs.writeFileSync(outPath, JSON.stringify(safe, null, 2) + "\n", "utf8");
}

function stripSecrets(obj) {
  if (!obj || typeof obj !== "object") return;
  for (const k of Object.keys(obj)) {
    const lk = k.toLowerCase();
    if (
      /(secret|password|private_key|api[_-]?key|token|credential|admin_uid)/i.test(lk) &&
      typeof obj[k] === "string" &&
      obj[k].length > 8
    ) {
      obj[k] = "[REDACTED]";
    } else if (typeof obj[k] === "object") {
      stripSecrets(obj[k]);
    }
  }
}

export function writeMarkdownReport(report, outPath) {
  const lines = [];
  lines.push("# NEWON 11 APPS — Production Health Report");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Scope: ${SITE_SCOPE.note}`);
  lines.push("");
  lines.push("## Overall matrix");
  lines.push("");
  lines.push(
    "| Product | Platform | Build | Firebase | Auth | Security | Payment | Analytics | Crash | Store | Privacy | Critical Flow | Score | Status |"
  );
  lines.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const a of report.apps) {
    const m = a.matrix;
    lines.push(
      `| ${a.name} | ${m.platform} | ${m.build} | ${m.firebase} | ${m.auth} | ${m.security} | ${m.payment} | ${m.analytics} | ${m.crash} | ${m.store} | ${m.privacy} | ${m.criticalFlow} | ${a.score ?? "—"} | ${a.status} |`
    );
  }
  lines.push("");
  lines.push("## Repository note");
  lines.push("");
  lines.push(SITE_SCOPE.note);
  lines.push("");
  lines.push(
    `HQ Firebase (\`${SITE_SCOPE.hqFirebase.projectIdHint}\`) rules file \`${SITE_SCOPE.hqFirebase.rulesFile}\`: ${SITE_SCOPE.hqFirebase.appliesTo}.`
  );
  lines.push("");

  for (const a of report.apps) {
    lines.push(`## ${a.name}`);
    lines.push("");
    lines.push(`**Status:** ${a.status}  `);
    lines.push(`**Score:** ${a.score == null ? "N/A (insufficient signals)" : a.score}`);
    lines.push("");
    lines.push(`- Source path: \`${a.inventory.sourcePath}\``);
    lines.push(`- Android applicationId: \`${a.inventory.androidApplicationId}\``);
    lines.push(`- iOS bundle id: \`${a.inventory.iosBundleId}\``);
    lines.push(`- App Store: ${a.inventory.stores.appStoreUrl || "(none)"}`);
    lines.push(`- Google Play: ${a.inventory.stores.googlePlayUrl || "(none)"}`);
    lines.push("");

    const g = groupByStatus(a.findings);
    for (const key of ["FAIL", "WARN", "PASS", "UNKNOWN"]) {
      if (!g[key].length) continue;
      lines.push(`### ${key}`);
      lines.push("");
      for (const f of g[key]) {
        lines.push(`- \`[${f.code}]\` ${f.message}${f.path ? ` (\`${f.path}\`)` : ""}${f.priority ? ` — ${f.priority}` : ""}`);
      }
      lines.push("");
    }
    if (g.MANUAL.length) {
      lines.push("### MANUAL CHECK");
      lines.push("");
      for (const f of g.MANUAL) {
        lines.push(`- \`[${f.code}]\` ${f.message}`);
      }
      lines.push("");
    }
    if (a.recommendedActions?.length) {
      lines.push("### Recommended actions");
      lines.push("");
      for (const r of a.recommendedActions) lines.push(`- ${r}`);
      lines.push("");
    }
  }

  if (report.repoFindings?.length) {
    lines.push("## Repository-wide findings");
    lines.push("");
    for (const f of report.repoFindings) {
      lines.push(`- **${f.status}** \`[${f.code}]\` ${f.message}${f.path ? ` (\`${f.path}\`)` : ""}`);
    }
    lines.push("");
  }

  lines.push("## Priority rollup");
  lines.push("");
  for (const p of ["P0", "P1", "P2", "P3"]) {
    const items = report.priorities[p] || [];
    lines.push(`### ${p} (${items.length})`);
    lines.push("");
    if (!items.length) {
      lines.push("_None_");
      lines.push("");
      continue;
    }
    for (const i of items) {
      lines.push(`- **${i.app}**: \`[${i.code}]\` ${i.message}`);
    }
    lines.push("");
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
}

export function recommendedActions(appResult) {
  const actions = [];
  const fails = appResult.findings.filter((f) => f.status === STATUS.FAIL);
  const warns = appResult.findings.filter((f) => f.status === STATUS.WARN);
  if (!appResult.inventory.flutterRoot) {
    actions.push("Point NEWON_APPS_ROOT (or FLUTTER_ROOTS) at the Flutter monorepo/clone to unlock build/Firebase/Auth/payment static audits.");
  }
  for (const f of fails.slice(0, 5)) {
    actions.push(`Fix FAIL ${f.code}: ${f.message}`);
  }
  for (const f of warns.filter((w) => w.manual).slice(0, 4)) {
    actions.push(`Manual: ${f.code} — ${f.message}`);
  }
  return actions;
}
