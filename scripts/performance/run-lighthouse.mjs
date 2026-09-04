#!/usr/bin/env node
/**
 * Lab-only Lighthouse runner for Newon public routes.
 * Usage: node scripts/performance/run-lighthouse.mjs [--desktop]
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "reports/lighthouse");
const BASE = "https://www.newon.app";

const MOBILE_ROUTES = [
  ["/", "root"],
  ["/ko/", "ko"],
  ["/en/", "en"],
  ["/ko/products/", "ko-products"],
  ["/ko/ox-month/", "ko-ox-month"],
  ["/ko/myworld/", "ko-myworld"],
  ["/ko/business/", "ko-business"],
  ["/ko/studio/", "ko-studio"],
  ["/ko/portfolio/", "ko-portfolio"],
  ["/ko/store/", "ko-store"],
  ["/ko/tools/", "ko-tools"],
  ["/ko/contact/", "ko-contact"],
  ["/ko/business/inquiry/", "ko-inquiry"],
  ["/404.html", "404"],
];

const DESKTOP_ROUTES = [
  ["/ko/", "ko"],
  ["/ko/business/", "ko-business"],
  ["/ko/portfolio/", "ko-portfolio"],
  ["/ko/business/inquiry/", "ko-inquiry"],
];

fs.mkdirSync(OUT, { recursive: true });

const desktop = process.argv.includes("--desktop");
const routes = desktop ? DESKTOP_ROUTES : MOBILE_ROUTES;
const form = desktop ? "desktop" : "mobile";

function runOne(urlPath, name) {
  const outFile = path.join(OUT, `${form}-${name}.json`);
  const args = [
    "--yes",
    "lighthouse",
    `${BASE}${urlPath}`,
    "--only-categories=performance",
    `--form-factor=${form}`,
    `--screenEmulation.mobile=${form === "mobile"}`,
    "--throttling-method=simulate",
    "--chrome-flags=--headless --no-sandbox --disable-gpu",
    "--output=json",
    `--output-path=${outFile}`,
    "--quiet",
  ];
  console.log(`LH ${form} ${urlPath}`);
  const r = spawnSync("npx", args, { stdio: "inherit", env: process.env, cwd: ROOT });
  if (r.status !== 0) console.error(`FAIL ${form}-${name} status=${r.status}`);
}

for (const [p, name] of routes) runOne(p, name);

const files = fs.readdirSync(OUT).filter((f) => f.startsWith(`${form}-`) && f.endsWith(".json")).sort();
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(OUT, f), "utf8"));
  const a = j.audits || {};
  const n = (id) => (a[id]?.numericValue != null ? Math.round(a[id].numericValue) : "-");
  console.log(
    [
      f,
      `P=${Math.round((j.categories.performance.score || 0) * 100)}`,
      `LCP=${n("largest-contentful-paint")}`,
      `CLS=${Number(a["cumulative-layout-shift"]?.numericValue || 0).toFixed(3)}`,
      `TBT=${n("total-blocking-time")}`,
      `FCP=${n("first-contentful-paint")}`,
      `SI=${n("speed-index")}`,
      `kB=${Math.round((a["total-byte-weight"]?.numericValue || 0) / 1024)}`,
    ].join(" | ")
  );
}
