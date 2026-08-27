#!/usr/bin/env node
/**
 * QA pass for Business hub + service detail pages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BUSINESS_SERVICE_PAGES } from "./business-service-catalog.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

const SERVICE_SECTIONS = [
  { id: "use", patterns: ["USE CASES", "bs-use-title", "bs-uc-flows", "bs-wf-cases"] },
  { id: "deliverables", patterns: ["DELIVERABLES", "bs-deliver", "bs-get-title"] },
  { id: "process", patterns: ["PROCESS", "bs-process", "bs-proc-title"] },
  { id: "faq", patterns: ["FAQ", "bs-faq", "bs-faq-q"] },
  { id: "priceDisclaimer", patterns: ["bs-price__disclaimers", "Final quotes vary", "최종 견적이 달라질 수 있습니다"] },
];

const HUB_CHECKS = [
  { id: "inquiryForm", patterns: ["bz-inquiry-form", 'name="service"', 'name="features"', 'name="reference"', 'name="notes"'] },
];

function readSafe(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function hasAny(html, patterns) {
  return patterns.some((p) => html.includes(p));
}

function checkServicePage(lang, page) {
  const route = page.routePath || page.slug;
  const file = path.join(ROOT, lang, "business", route, "index.html");
  const issues = [];
  const html = readSafe(file);
  if (!html) {
    issues.push({ level: "error", msg: `missing file: ${file}` });
    return issues;
  }
  if (html.includes("{{")) {
    issues.push({ level: "error", msg: "unresolved template placeholder" });
  }
  for (const sec of SERVICE_SECTIONS) {
    if (!hasAny(html, sec.patterns)) {
      issues.push({ level: "error", msg: `missing section: ${sec.id}` });
    }
  }
  if (!html.includes("#inquiry") && !html.includes("/business/#inquiry")) {
    issues.push({ level: "warn", msg: "no inquiry CTA link found" });
  }
  if (html.includes('href=""') || html.includes('href="#"')) {
    issues.push({ level: "warn", msg: "empty or hash-only href detected" });
  }
  return issues;
}

function checkHub(lang) {
  const file = path.join(ROOT, lang, "business", "index.html");
  const issues = [];
  const html = readSafe(file);
  if (!html) {
    issues.push({ level: "error", msg: `missing hub: ${file}` });
    return issues;
  }
  for (const chk of HUB_CHECKS) {
    if (!hasAny(html, chk.patterns)) {
      issues.push({ level: "error", msg: `hub missing: ${chk.id}` });
    }
  }
  return issues;
}

function main() {
  let errors = 0;
  let warns = 0;

  for (const lang of LANGS) {
    const hubIssues = checkHub(lang);
    for (const i of hubIssues) {
      const tag = i.level === "error" ? "ERROR" : "WARN";
      console.log(`[${tag}] ${lang}/business/ — ${i.msg}`);
      if (i.level === "error") errors++;
      else warns++;
    }

    for (const page of BUSINESS_SERVICE_PAGES) {
      const route = page.routePath || page.slug;
      const issues = checkServicePage(lang, page);
      for (const i of issues) {
        const tag = i.level === "error" ? "ERROR" : "WARN";
        console.log(`[${tag}] ${lang}/business/${route}/ — ${i.msg}`);
        if (i.level === "error") errors++;
        else warns++;
      }
    }
  }

  console.log(`\nQA complete: ${errors} error(s), ${warns} warning(s).`);
  process.exit(errors ? 1 : 0);
}

main();
