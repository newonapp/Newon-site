#!/usr/bin/env node
/**
 * Phase 4 — lightweight public reliability audit (read-only scans + optional probes).
 * Usage:
 *   node scripts/production-reliability/audit.mjs
 *   node scripts/production-reliability/audit.mjs --probe
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const probe = process.argv.includes("--probe");

const findings = [];

function add(sev, area, msg, extra = {}) {
  findings.push({ severity: sev, area, message: msg, ...extra });
}

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function walkHtml(dir, out, depth = 0) {
  if (depth > 8 || out.length > 8000) return;
  let ents;
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of ents) {
    if (e.name.startsWith(".") || e.name === "node_modules" || e.name === "_publish" || e.name === "admin") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(full, out, depth + 1);
    else if (e.name.endsWith(".html")) out.push(full);
  }
}

/** Resolve internal href against page file under ROOT */
function resolveInternal(fromFile, href) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
    return { skip: true };
  }
  if (/^https?:\/\//i.test(href)) {
    try {
      const u = new URL(href);
      if (!/(^|\.)newon\.app$/i.test(u.hostname)) return { skip: true, external: true };
      href = u.pathname + (u.search || "");
    } catch {
      return { bad: true };
    }
  }
  if (href.includes("localhost") || href.includes("127.0.0.1")) {
    return { localhost: true };
  }
  let clean = href.split("#")[0].split("?")[0];
  if (!clean) return { skip: true };
  if (clean.endsWith("/")) clean += "index.html";
  else if (!path.extname(clean)) clean = clean.replace(/\/?$/, "/index.html");

  let abs;
  if (clean.startsWith("/")) {
    abs = path.join(ROOT, clean.slice(1));
  } else {
    abs = path.normalize(path.join(path.dirname(fromFile), clean));
  }
  return { abs, href: clean };
}

function auditLinks() {
  const files = [];
  for (const lang of ["ko", "en"]) {
    const d = path.join(ROOT, lang);
    if (exists(d)) walkHtml(d, files);
  }
  let broken = 0;
  let localhost = 0;
  let checked = 0;
  const samples = [];
  for (const file of files) {
    let html;
    try {
      html = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const re = /(?:href|src)=["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(html))) {
      const href = m[1];
      const r = resolveInternal(file, href);
      if (r.skip) continue;
      if (r.localhost) {
        localhost++;
        if (samples.length < 15) samples.push({ type: "localhost", file: path.relative(ROOT, file), href });
        continue;
      }
      if (r.bad) continue;
      if (r.external) continue;
      checked++;
      if (!exists(r.abs)) {
        // also try without forcing index.html for assets
        const alt = r.abs.replace(/\/index\.html$/, "");
        if (exists(alt) || exists(r.abs.replace(/\/index\.html$/, ".html"))) continue;
        broken++;
        if (samples.length < 40) {
          samples.push({ type: "missing", file: path.relative(ROOT, file), href: r.href });
        }
      }
    }
  }
  add(broken ? "P1" : "PASS", "routes", `Internal link check (ko/en): ${checked} targets, ${broken} missing, ${localhost} localhost`, {
    samples: samples.slice(0, 25),
  });
}

function auditRuntimeMarkers() {
  const htmlFiles = [];
  for (const lang of ["ko", "en"]) walkHtml(path.join(ROOT, lang), htmlFiles);
  let undef = 0;
  let rawKey = 0;
  let objObj = 0;
  const samples = [];
  for (const f of htmlFiles.slice(0, 2000)) {
    let t;
    try {
      t = fs.readFileSync(f, "utf8");
    } catch {
      continue;
    }
    if (/\bundefined\b/.test(t) && /<(?:p|h[1-6]|span|a|li|td)[^>]*>\s*undefined\s*</i.test(t)) {
      undef++;
      if (samples.length < 10) samples.push({ kind: "undefined", file: path.relative(ROOT, f) });
    }
    if (/\[object Object\]/.test(t)) {
      objObj++;
      if (samples.length < 12) samples.push({ kind: "object", file: path.relative(ROOT, f) });
    }
    if (/\{\{[a-z0-9_.]+\}\}/i.test(t) || /\bt:[a-z]+\.[a-z]/i.test(t)) {
      rawKey++;
      if (samples.length < 15) samples.push({ kind: "raw_key", file: path.relative(ROOT, f) });
    }
  }
  add(objObj || undef ? "P1" : "PASS", "i18n", `Runtime locale markers in ko/en HTML: undefined≈${undef}, [object Object]=${objObj}, raw templates≈${rawKey}`, {
    samples,
  });
}

function auditAssets() {
  const critical = [
    "analytics.js",
    "business/inquiry.js",
    "business-creative.js",
    "business-service.js",
    "waitlist.js",
    "site-chrome.js",
    ".nojekyll",
  ];
  for (const c of critical) {
    if (!exists(path.join(ROOT, c))) add("P0", "assets", `Missing critical file: ${c}`);
  }
  if (!exists(path.join(ROOT, "404.html"))) {
    add("P1", "fallback", "Root 404.html missing — GitHub Pages serves default 404 for unknown paths");
  }
  add("INFO", "headers", "GitHub Pages cannot serve custom CSP/HSTS via repo _headers; Access-Control-Allow-Origin is provided by GH/Fastly");
  add("INFO", "redirects", "_redirects is Netlify-style and is ignored on GitHub Pages");
}

async function probeProduction() {
  const urls = [
    "https://www.newon.app/ko/",
    "https://www.newon.app/en/",
    "https://www.newon.app/ko/business/",
    "https://www.newon.app/ko/business/inquiry/",
    "https://www.newon.app/ko/portfolio/",
    "https://www.newon.app/ko/tools/",
    "https://www.newon.app/analytics.js",
    "https://www.newon.app/business/inquiry.js",
    "https://www.newon.app/definitely-missing-route-xyz/",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "NewonReliabilityAudit/1.0" } });
      const expect404 = url.includes("definitely-missing");
      if (expect404) {
        add(res.status === 404 ? "PASS" : "P1", "fallback", `Production unknown path status ${res.status}`, { url });
      } else if (!res.ok) {
        add("P0", "routes", `Production URL not OK: ${res.status}`, { url });
      } else {
        add("PASS", "routes", `OK ${res.status}`, { url });
      }
    } catch (e) {
      add("P1", "network", `Probe failed: ${e.message}`, { url });
    }
  }
}

auditAssets();
auditLinks();
auditRuntimeMarkers();

if (probe) {
  await probeProduction();
}

const outDir = path.join(ROOT, "reports");
fs.mkdirSync(outDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  probe,
  findings,
  summary: {
    P0: findings.filter((f) => f.severity === "P0").length,
    P1: findings.filter((f) => f.severity === "P1").length,
    P2: findings.filter((f) => f.severity === "P2").length,
    PASS: findings.filter((f) => f.severity === "PASS").length,
  },
};
fs.writeFileSync(path.join(outDir, "production-reliability.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report.summary, null, 2));
for (const f of findings.filter((x) => x.severity === "P0" || x.severity === "P1" || x.severity === "INFO")) {
  console.log(`[${f.severity}] ${f.area}: ${f.message}`);
  if (f.samples) console.log("  samples:", JSON.stringify(f.samples.slice(0, 8)));
}
