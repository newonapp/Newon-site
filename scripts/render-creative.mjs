#!/usr/bin/env node
/**
 * Render /{lang}/business/creative/ — Newon Creative (Building).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  LANGS,
  OG_LOCALE,
  SITE_ORIGIN,
  ROOT,
  escapeHtml,
  flatten,
  studioStatusBadge,
  ensureDir,
} from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8"));
}

function pageHtml(dir, htmlLang, flat, flatEn, creative, creativeEn) {
  const cr = creative || {};
  const crEn = creativeEn || {};
  const c = (key, fb = "") => {
    const v = cr[key];
    if (v != null && v !== "") return v;
    const e = crEn[key];
    if (e != null && e !== "") return e;
    return fb;
  };
  const canonical = `${SITE_ORIGIN}/${dir}/business/creative/`;
  const title = escapeHtml(c("seoTitle", "Newon Creative"));
  const desc = escapeHtml(c("metaDescription", ""));
  const og = OG_LOCALE[dir] || "en_US";
  const badge = studioStatusBadge("BUILDING", dir === "ko" ? "ko" : "en");
  const hreflang = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${SITE_ORIGIN}/${d}/business/creative/" />`
  ).join("\n");
  const xdef = `    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/business/creative/" />`;

  const brandItems = Array.isArray(c("brandItems")) ? c("brandItems") : ["Brand Strategy", "Naming", "Visual Identity", "Logo System"];
  const digitalItems = Array.isArray(c("digitalItems")) ? c("digitalItems") : ["Website Design", "Landing Page Design", "App UI/UX", "Product Interface"];
  const contentItems = Array.isArray(c("contentItems")) ? c("contentItems") : ["Social Visual", "Campaign Creative", "Product Content", "Digital Assets"];
  const process = Array.isArray(c("process")) ? c("process") : [
    { n: "01", t: "DISCOVER", d: "Understand the brand and the problem." },
    { n: "02", t: "DEFINE", d: "Set direction and core messages." },
    { n: "03", t: "DESIGN", d: "Shape identity and real experiences." },
    { n: "04", t: "DELIVER", d: "Hand over usable deliverables." },
  ];
  const typeOpts = Array.isArray(c("typeOptions")) ? c("typeOptions") : ["Brand", "Digital", "Content", "Full Creative", "Other"];
  const budgetOpts = Array.isArray(c("budgetOptions")) ? c("budgetOptions") : ["TBD"];
  const timelineOpts = Array.isArray(c("timelineOptions")) ? c("timelineOptions") : ["TBD"];
  const serviceOpts = Array.isArray(c("serviceOptions")) ? c("serviceOptions") : ["Brand Strategy", "Other"];

  const optHtml = (list) => list.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("");
  const listHtml = (list) => list.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  const stepsHtml = process
    .map(
      (s) => `<article class="cr-step">
      <span class="cr-step__n">${escapeHtml(s.n)}</span>
      <h3 class="cr-step__t">${escapeHtml(s.t)}</h3>
      <p class="cr-step__d">${escapeHtml(s.d)}</p>
    </article>`
    )
    .join("");
  const checks = serviceOpts
    .map((s) => `<label class="cr-check"><input type="checkbox" name="services" value="${escapeHtml(s)}" /> <span>${escapeHtml(s)}</span></label>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:locale" content="${og}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:site_name" content="Newon" />
  <meta property="og:image" content="https://www.newon.app/logo.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Newon Creative",
    "provider": { "@type": "Organization", "name": "Newon", "url": "https://www.newon.app" },
    "url": "${canonical}",
    "description": ${JSON.stringify(String(c("metaDescription", "")))},
    "areaServed": "Worldwide",
    "serviceType": "Brand and digital design"
  }
  </script>
${hreflang}
${xdef}
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" href="/logo.png" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css?v=20260904lang1" />
  <link rel="stylesheet" href="/hub-pages.css?v=20260826vs" />
  <link rel="stylesheet" href="/gnav-mega.css?v=20260904lang1" />
  <link rel="stylesheet" href="/business-type.css?v=20260827type4" />
  <link rel="stylesheet" href="/business-creative.css?v=20260827type1" />
  <script src="/theme-shell.js"></script>
  <script src="/lang-nav.js?v=20260825studio"></script>
  <script src="/analytics.js?v=20260826vs" defer></script>
</head>
<body class="hub-page cr-page">
  {{CHROME_HEADER}}
  <main id="main">
    <section class="cr-hero">
      <div class="cr-inner">
        <p class="cr-kicker">${escapeHtml(c("eyebrow", "NEWON CREATIVE"))} ${badge}</p>
        <h1 class="cr-title">${escapeHtml(c("heroTitle"))}</h1>
        <p class="cr-lead">${escapeHtml(c("heroLead"))}</p>
        <div class="cr-actions">
          <a class="btn btn-primary" href="#inquiry" data-analytics="creative_inquiry">${escapeHtml(c("ctaInquiry"))}</a>
          <a class="btn btn-ghost" href="#services">${escapeHtml(c("ctaServices"))}</a>
        </div>
      </div>
    </section>

    <section id="services" class="cr-section">
      <div class="cr-inner">
        <header class="cr-sec-head">
          <p class="cr-label">${escapeHtml(c("servicesLabel", "SERVICES"))}</p>
          <h2 class="cr-h2">${escapeHtml(c("servicesTitle"))}</h2>
        </header>
        <div class="cr-svc-grid">
          <article class="cr-svc" id="brand">
            <h3 class="cr-svc__label">${escapeHtml(c("brandLabel", "BRAND"))}</h3>
            <ul class="cr-svc__list">${listHtml(brandItems)}</ul>
          </article>
          <article class="cr-svc" id="digital">
            <h3 class="cr-svc__label">${escapeHtml(c("digitalLabel", "DIGITAL"))}</h3>
            <ul class="cr-svc__list">${listHtml(digitalItems)}</ul>
          </article>
          <article class="cr-svc" id="content">
            <h3 class="cr-svc__label">${escapeHtml(c("contentLabel", "CONTENT"))}</h3>
            <ul class="cr-svc__list">${listHtml(contentItems)}</ul>
          </article>
        </div>
      </div>
    </section>

    <section class="cr-section cr-section--off">
      <div class="cr-inner">
        <header class="cr-sec-head">
          <p class="cr-label">${escapeHtml(c("processLabel", "PROCESS"))}</p>
          <h2 class="cr-h2">${escapeHtml(c("processTitle"))}</h2>
        </header>
        <div class="cr-process">${stepsHtml}</div>
      </div>
    </section>

    <section id="inquiry" class="cr-section">
      <div class="cr-inner cr-inquiry">
        <header class="cr-sec-head">
          <p class="cr-label">${escapeHtml(c("formLabel", "INQUIRY"))}</p>
          <h2 class="cr-h2">${escapeHtml(c("formTitle"))}</h2>
          <p class="cr-form-lead">${escapeHtml(c("formLead"))}</p>
        </header>
        <form class="cr-form" id="cr-inquiry-form" novalidate data-analytics-form="creative_inquiry">
          <div class="cr-form__grid">
            <label class="cr-field">
              <span>${escapeHtml(c("fieldType"))}</span>
              <select name="type" required>
                <option value="">—</option>
                ${optHtml(typeOpts)}
              </select>
            </label>
            <label class="cr-field">
              <span>${escapeHtml(c("fieldCompany"))}</span>
              <input type="text" name="company" required autocomplete="organization" />
            </label>
            <fieldset class="cr-field cr-field--full">
              <legend>${escapeHtml(c("fieldServices"))}</legend>
              <div class="cr-checks">${checks}</div>
            </fieldset>
            <label class="cr-field">
              <span>${escapeHtml(c("fieldBudget"))}</span>
              <select name="budget">
                <option value="">—</option>
                ${optHtml(budgetOpts)}
              </select>
            </label>
            <label class="cr-field">
              <span>${escapeHtml(c("fieldTimeline"))}</span>
              <select name="timeline">
                <option value="">—</option>
                ${optHtml(timelineOpts)}
              </select>
            </label>
            <label class="cr-field cr-field--full">
              <span>${escapeHtml(c("fieldMessage"))}</span>
              <textarea name="message" rows="5" required></textarea>
            </label>
            <label class="cr-field">
              <span>${escapeHtml(c("fieldName"))}</span>
              <input type="text" name="name" required autocomplete="name" />
            </label>
            <label class="cr-field">
              <span>${escapeHtml(c("fieldEmail"))}</span>
              <input type="email" name="email" required autocomplete="email" />
            </label>
          </div>
          <button type="submit" class="btn btn-primary" data-analytics="creative_inquiry_submit">${escapeHtml(c("submit"))}</button>
          <p class="cr-form__note" id="cr-form-status" hidden></p>
        </form>
        <div class="cr-success" id="cr-success" hidden>
          <h3>${escapeHtml(c("successTitle"))}</h3>
          <p>${escapeHtml(c("successLead"))}</p>
        </div>
      </div>
    </section>
  </main>
  {{CHROME_FOOTER}}
  <script src="/site-chrome.js" defer></script>
  <script src="/lang-dropdown.js?v=20260904lang1" defer></script>
  <script src="/business-creative.js?v=20260826vs" defer></script>
</body>
</html>`;
}

export function renderCreative() {
  const enData = loadJson("en.json");
  const flatEn = flatten(enData);
  for (const { dir, file, htmlLang } of LANGS) {
    const data = loadJson(file);
    const flat = flatten(data);
    let html = pageHtml(dir, htmlLang, flat, flatEn, data.creative, enData.creative);
    html = injectSiteChrome(html, flat, flatEn, { activeNav: "business", base: "../../" });
    const out = path.join(ROOT, dir, "business", "creative", "index.html");
    ensureDir(out);
    fs.writeFileSync(out, html);
  }
  console.log(`render-creative: ${LANGS.length} langs`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("render-creative.mjs")) {
  renderCreative();
}
