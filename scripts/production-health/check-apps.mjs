#!/usr/bin/env node
/**
 * NEWON production health check — read-only / static analysis.
 *
 * Usage:
 *   node scripts/production-health/check-apps.mjs
 *   node scripts/production-health/check-apps.mjs --probe-store
 *   NEWON_APPS_ROOT=/path/to/apps node scripts/production-health/check-apps.mjs
 *
 * Outputs:
 *   reports/production-health.json
 *   reports/production-health.md
 */

import path from "path";
import { APPS, REPO_ROOT, SITE_SCOPE } from "./config.mjs";
import { buildInventory } from "./lib/inventory.mjs";
import { auditFlutterApp } from "./lib/flutter-audit.mjs";
import { auditWebsiteSurface, probeStoreUrls } from "./lib/website-audit.mjs";
import { auditSecrets } from "./lib/secrets-audit.mjs";
import { computeHealthScore } from "./lib/score.mjs";
import { STATUS, rollup, overallFromScore } from "./lib/status.mjs";
import { writeJsonReport, writeMarkdownReport, recommendedActions } from "./lib/report.mjs";

const args = new Set(process.argv.slice(2));
const probeStore = args.has("--probe-store");
const jsonOnly = args.has("--json-only");

async function main() {
  const generatedAt = new Date().toISOString();
  const inventory = buildInventory();
  const flutterRoots = inventory.map((i) => i.flutterRoot).filter(Boolean);
  const repoFindings = auditSecrets(flutterRoots);

  const repoSecurityStatus = rollup(repoFindings.map((f) => f.status));

  const appsOut = [];
  const priorities = { P0: [], P1: [], P2: [], P3: [] };

  for (const app of APPS) {
    const inv = inventory.find((i) => i.id === app.id);
    const web = auditWebsiteSurface(app);
    const flutter = auditFlutterApp(app, inv.flutterRoot);

    let storeProbeFindings = [];
    if (probeStore) {
      storeProbeFindings = await probeStoreUrls(web.stores);
    }

    const findings = [
      ...web.findings,
      ...flutter.findings,
      ...storeProbeFindings,
      // Attach repo security as shared context (not duplicated FAIL spam): one summary per app
      findingSummary(repoSecurityStatus),
    ].filter(Boolean);

    const authStatus = flutter.dims.auth ?? STATUS.UNKNOWN;
    const analyticsStatus = flutter.dims.analytics ?? STATUS.UNKNOWN;
    const crashStatus = flutter.dims.errorMonitoring ?? STATUS.UNKNOWN;

    const securityStatus = rollup([
      repoSecurityStatus === STATUS.PASS ? STATUS.PASS : repoSecurityStatus,
      ...findings.filter((f) => f.category === "security").map((f) => f.status),
    ]);

    const storeStatus = rollup([
      web.dims.store,
      ...storeProbeFindings.map((f) => f.status),
    ]);

    const paymentStatus = flutter.dims.payments ?? STATUS.UNKNOWN;
    const buildStatus = flutter.dims.build ?? STATUS.UNKNOWN;
    const firebaseStatus = flutter.dims.firebase ?? STATUS.UNKNOWN;
    const coreFlowStatus = flutter.dims.coreFlow ?? STATUS.UNKNOWN;
    const privacyStatus = web.dims.privacy ?? STATUS.UNKNOWN;

    const scoreDims = {
      build: buildStatus,
      firebase: firebaseStatus,
      security: securityStatus,
      coreFlow: coreFlowStatus,
      payments: paymentStatus,
      errorMonitoring: crashStatus,
      privacy: privacyStatus,
      store: storeStatus,
    };

    const { score } = computeHealthScore(scoreDims);
    const hasFail = findings.some((f) => f.status === STATUS.FAIL);
    const status = overallFromScore(score, hasFail, {
      flutterSourceFound: !!inv.flutterRoot,
    });

    const appResult = {
      id: app.id,
      name: app.name,
      status,
      score,
      inventory: {
        sourcePath: inv.sourcePath,
        flutterRoot: inv.flutterRoot,
        androidApplicationId: inv.androidApplicationId,
        iosBundleId: inv.iosBundleId,
        stores: {
          appStoreUrl: inv.stores.appStoreUrl || null,
          googlePlayUrl: inv.stores.googlePlayUrl || null,
          appStoreIsDeveloper: inv.stores.appStoreIsDeveloper,
          playPackageId: inv.stores.playPackageId,
          appStoreId: inv.stores.appStoreId,
        },
        websiteDeleteAccount: !!inv.website.localeDeleteAccountKo,
        firebase: inv.firebase,
        criticalFlows: inv.criticalFlows,
        sensitiveData: inv.sensitiveData,
      },
      matrix: {
        platform: inv.flutterRoot ? "Flutter" : "Flutter (source UNKNOWN)",
        build: buildStatus,
        firebase: firebaseStatus,
        auth: authStatus,
        security: securityStatus,
        payment: paymentStatus,
        analytics: analyticsStatus,
        crash: crashStatus,
        store: storeStatus,
        privacy: privacyStatus,
        criticalFlow: coreFlowStatus,
      },
      scoreDims,
      findings: findings.map(sanitizeFinding),
      recommendedActions: [],
    };
    appResult.recommendedActions = recommendedActions(appResult);
    appsOut.push(appResult);

    for (const f of findings) {
      if (!f.priority) continue;
      const bucket = priorities[f.priority];
      if (bucket) bucket.push({ app: app.name, code: f.code, message: f.message, status: f.status });
    }
  }

  // Deduplicate priority rows that are repo-wide (same code for every app)
  for (const p of Object.keys(priorities)) {
    priorities[p] = dedupePriorities(priorities[p]);
  }

  const report = {
    schemaVersion: 1,
    generatedAt,
    repo: {
      path: REPO_ROOT,
      kind: "newon-public-website",
      note: SITE_SCOPE.note,
      hqFirebase: SITE_SCOPE.hqFirebase,
      websiteAnalytics: SITE_SCOPE.websiteAnalytics,
      appsRootEnv: process.env.NEWON_APPS_ROOT || null,
      probeStore,
    },
    appsDetected: appsOut.map((a) => ({
      id: a.id,
      name: a.name,
      flutterSourceFound: !!a.inventory.flutterRoot,
      androidApplicationId: a.inventory.androidApplicationId,
    })),
    apps: appsOut,
    repoFindings: repoFindings.map(sanitizeFinding),
    priorities,
    hqCompatibility: {
      intendedReaders: ["HQ → Products → Health", "HQ → Operations → Product Health"],
      wiredToHq: false,
    },
  };

  const jsonPath = path.join(REPO_ROOT, "reports/production-health.json");
  const hqJsonPath = path.join(REPO_ROOT, "admin/production-health.json");
  const mdPath = path.join(REPO_ROOT, "reports/production-health.md");
  writeJsonReport(report, jsonPath);
  // HQ SoT copy: same report, absolute machine path redacted for public /admin/ hosting
  const hqReport = JSON.parse(JSON.stringify(report));
  if (hqReport.repo) hqReport.repo.path = ".";
  writeJsonReport(hqReport, hqJsonPath);
  if (!jsonOnly) writeMarkdownReport(report, mdPath);

  console.log(`Production health check complete.`);
  console.log(`  Apps: ${appsOut.length}`);
  console.log(`  Flutter sources found: ${flutterRoots.length}/${appsOut.length}`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  HQ JSON: ${hqJsonPath}`);
  if (!jsonOnly) console.log(`  Markdown: ${mdPath}`);
  console.log(`  P0: ${priorities.P0.length}  P1: ${priorities.P1.length}  P2: ${priorities.P2.length}  P3: ${priorities.P3.length}`);

  const matrixLines = appsOut.map(
    (a) =>
      `${a.name} | ${a.matrix.platform} | ${a.matrix.build} | ${a.matrix.firebase} | ${a.matrix.auth} | ${a.matrix.security} | ${a.matrix.payment} | ${a.matrix.analytics} | ${a.matrix.crash} | ${a.matrix.store} | ${a.matrix.privacy} | ${a.matrix.criticalFlow} | ${a.score ?? "—"} | ${a.status}`
  );
  console.log("\nMatrix:");
  for (const line of matrixLines) console.log(line);

  // Exit non-zero only on P0 FAIL in findings (website secrets etc.)
  const p0fail = priorities.P0.some((x) => x.status === STATUS.FAIL);
  process.exitCode = p0fail ? 2 : 0;
}

function findingSummary(repoSecurityStatus) {
  if (repoSecurityStatus === STATUS.PASS) {
    return {
      status: STATUS.PASS,
      code: "REPO_SECURITY_CONTEXT",
      message: "Repository secrets scan: no privileged credential FAIL signals.",
      category: "security",
      priority: null,
      manual: false,
    };
  }
  return {
    status: repoSecurityStatus,
    code: "REPO_SECURITY_CONTEXT",
    message: "See repository-wide findings (shared website/HQ scan).",
    category: "security",
    priority: repoSecurityStatus === STATUS.FAIL ? "P0" : "P2",
    manual: false,
  };
}

function sanitizeFinding(f) {
  return {
    status: f.status,
    code: f.code,
    message: f.message,
    priority: f.priority || null,
    category: f.category || null,
    path: f.path || null,
    manual: !!f.manual,
  };
}

function dedupePriorities(items) {
  const seen = new Set();
  const out = [];
  for (const i of items) {
    const key = `${i.code}::${i.message}`;
    // Keep first app mention for shared codes
    if (seen.has(key) && i.code === "REPO_SECURITY_CONTEXT") continue;
    if (seen.has(key) && i.code.startsWith("HQ_")) continue;
    if (seen.has(key)) {
      // collapse identical messages across apps for shared repo issues only
      continue;
    }
    seen.add(key);
    out.push(i);
  }
  // Actually for per-app issues we should NOT dedupe across apps. Fix logic:
  return items.filter((i, idx) => {
    if (i.code === "REPO_SECURITY_CONTEXT" || String(i.code).startsWith("HQ_") || i.code === "SECRETS_SCAN_CLEAN") {
      return items.findIndex((x) => x.code === i.code && x.message === i.message) === idx;
    }
    return true;
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
