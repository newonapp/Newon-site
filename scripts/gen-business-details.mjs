#!/usr/bin/env node
/**
 * Generates /{lang}/business/{slug}/ and root /business/{slug}/ redirects.
 * Also merges KO/EN copy into locales/*.json.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BUSINESS_PAGES_I18N } from "./business-pages-i18n.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SITE_ORIGIN = "https://www.newon.app";

export const BUSINESS_DETAIL_PAGES = [
  { slug: "partnership", titleKey: "business.cardPartnershipTitle", bodyKey: "business.cardPartnershipBody", type: "Partnership", kind: "partnership" },
  { slug: "service", titleKey: "business.cardCollabTitle", bodyKey: "business.cardCollabBody", type: "App Collaboration", kind: "service" },
  { slug: "promotion", titleKey: "business.cardAdsTitle", bodyKey: "business.cardAdsBody", type: "Advertising", kind: "promotion" },
  { slug: "development", titleKey: "business.cardDevTitle", bodyKey: "business.cardDevBody", type: "Development", kind: "development" },
];

const LANGS = [
  { dir: "ko", file: "ko.json", htmlLang: "ko", hreflang: "ko" },
  { dir: "en", file: "en.json", htmlLang: "en", hreflang: "en" },
  { dir: "ja", file: "ja.json", htmlLang: "ja", hreflang: "ja" },
  { dir: "es", file: "es.json", htmlLang: "es", hreflang: "es" },
  { dir: "pt-br", file: "pt-br.json", htmlLang: "pt-BR", hreflang: "pt-BR" },
  { dir: "fr", file: "fr.json", htmlLang: "fr", hreflang: "fr" },
  { dir: "de", file: "de.json", htmlLang: "de", hreflang: "de" },
  { dir: "hi", file: "hi.json", htmlLang: "hi", hreflang: "hi" },
  { dir: "id", file: "id.json", htmlLang: "id", hreflang: "id" },
];

const OG_LOCALE = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  es: "es_ES",
  "pt-br": "pt_BR",
  fr: "fr_FR",
  de: "de_DE",
  hi: "hi_IN",
  id: "id_ID",
};

function flatten(obj, prefix = "") {
  const out = {};
  if (obj == null) return out;
  if (typeof obj !== "object" || Array.isArray(obj)) {
    if (prefix) out[prefix] = obj;
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pick(flat, flatEn, key) {
  let val = flat[key];
  if (val === undefined || val === null || val === "") val = flatEn[key];
  return val;
}

function applyTemplate(template, flat, flatEn) {
  let out = template.replace(/\{\{t:([^}]+)\}\}/g, (_, key) => {
    const val = pick(flat, flatEn, key);
    if (val === undefined || val === null) return "";
    return escapeHtml(String(val));
  });
  return out;
}

function t(flat, flatEn, key) {
  return escapeHtml(String(pick(flat, flatEn, key) || ""));
}

function withBp(flat, slug) {
  const out = { ...flat };
  const commonPrefix = "businessPages.common.";
  const pagePrefix = `businessPages.${slug}.`;
  for (const [k, v] of Object.entries(flat)) {
    if (k.startsWith(commonPrefix)) out["bp." + k.slice(commonPrefix.length)] = v;
  }
  for (const [k, v] of Object.entries(flat)) {
    if (k.startsWith(pagePrefix)) out["bp." + k.slice(pagePrefix.length)] = v;
  }
  return out;
}

function n(i) {
  return String(i).padStart(2, "0");
}

function offersHtml(flat, flatEn) {
  const items = [1, 2, 3, 4]
    .map(
      (i) => `<article class="bz-card">
              <span class="bz-card__n">${n(i)}</span>
              <h3>${t(flat, flatEn, `bp.offer${i}Title`)}</h3>
              <p>${t(flat, flatEn, `bp.offer${i}Body`)}</p>
            </article>`
    )
    .join("\n            ");
  return `<div class="bz-grid bz-grid--4">${items}</div>`;
}

function fitsHtml(slug, flat, flatEn) {
  if (slug === "promotion") {
    const items = [];
    for (let i = 1; i <= 5; i++) {
      const text = pick(flat, flatEn, `bp.fit${i}`);
      if (!text) continue;
      items.push(`<li>${escapeHtml(String(text))}</li>`);
    }
    return `<ul class="bd-tags">${items.join("")}</ul>`;
  }
  const items = [];
  for (let i = 1; i <= 5; i++) {
    const text = pick(flat, flatEn, `bp.fit${i}`);
    if (!text) continue;
    items.push(
      `<li class="bd-check"><span class="bd-check__mark" aria-hidden="true"></span><p>${escapeHtml(String(text))}</p></li>`
    );
  }
  return `<ul class="bd-checks">${items.join("")}</ul>`;
}

function stepsHtml(flat, flatEn) {
  const items = [1, 2, 3, 4, 5]
    .map(
      (i) => `<li class="bd-step">
              <span class="bd-step__n">${n(i)}</span>
              <h3>${t(flat, flatEn, `bp.process${i}Title`)}</h3>
              <p>${t(flat, flatEn, `bp.process${i}Body`)}</p>
            </li>`
    )
    .join("");
  return `<ol class="bd-steps">${items}</ol>`;
}

function faqHtml(flat, flatEn) {
  const parts = [];
  for (let i = 1; i <= 5; i++) {
    const q = pick(flat, flatEn, `bp.faq${i}Q`);
    const a = pick(flat, flatEn, `bp.faq${i}A`);
    if (!q) continue;
    parts.push(`<div class="bz-faq-item">
              <button type="button" class="bz-faq-q" aria-expanded="false">
                <span>${escapeHtml(String(q))}</span>
                <span class="bz-faq-icon" aria-hidden="true"></span>
              </button>
              <div class="bz-faq-a"><p>${escapeHtml(String(a || ""))}</p></div>
            </div>`);
  }
  return `<div class="bz-faq">${parts.join("")}</div>`;
}

function heroPanel(slug, flat, flatEn) {
  if (slug === "development") {
    return `<aside class="bd-panel bd-panel--dev" aria-hidden="true">
            <p class="bd-panel__kicker">${t(flat, flatEn, "bp.panelKicker")}</p>
            <p class="bd-panel__chain">IDEA<span>→</span>PLAN<span>→</span>DESIGN<span>→</span>BUILD<span>→</span>LAUNCH</p>
            <p class="bd-panel__note">${t(flat, flatEn, "bp.panelNote")}</p>
          </aside>`;
  }
  const mod = slug === "promotion" ? " bd-panel--promo" : slug === "service" ? " bd-panel--service" : "";
  return `<aside class="bd-panel${mod}" aria-hidden="true">
            <p class="bd-panel__kicker">${t(flat, flatEn, "bp.panelKicker")}</p>
            <p class="bd-panel__line">${t(flat, flatEn, "bp.panel1")}</p>
            <p class="bd-panel__line">${t(flat, flatEn, "bp.panel2")}</p>
            <p class="bd-panel__line">${t(flat, flatEn, "bp.panel3")}</p>
            <p class="bd-panel__note">${t(flat, flatEn, "bp.panelNote")}</p>
          </aside>`;
}

function principlesHtml(slug, flat, flatEn) {
  if (slug !== "promotion") return "";
  const lis = [1, 2, 3, 4].map((i) => `<li>${t(flat, flatEn, `bp.prin${i}`)}</li>`).join("");
  return `<div class="bd-principles">
            <h3>${t(flat, flatEn, "bp.principlesTitle")}</h3>
            <p>${t(flat, flatEn, "bp.principlesLead")}</p>
            <ul>${lis}</ul>
          </div>`;
}

function launchHtml(slug, flat, flatEn) {
  if (slug !== "development") return "";
  const items = [1, 2, 3, 4, 5]
    .map(
      (i) => `<li>
              <strong>${t(flat, flatEn, `bp.launch${i}Title`)}</strong>
              <span>${t(flat, flatEn, `bp.launch${i}Ko`)}</span>
              <p>${t(flat, flatEn, `bp.launch${i}Body`)}</p>
            </li>`
    )
    .join("");
  return `<section id="launch" class="bd-launch bz-reveal" aria-labelledby="bd-launch-title">
        <div class="bz-inner">
          <p class="bz-label">${t(flat, flatEn, "bp.launchLabel")}</p>
          <h2 class="bz-title" id="bd-launch-title">${t(flat, flatEn, "bp.launchTitle")}</h2>
          <ol class="bd-launch-track">${items}</ol>
        </div>
      </section>`;
}

function prepHtml(slug, flat, flatEn) {
  if (slug !== "development") return "";
  const cards = [1, 2, 3, 4, 5]
    .map((i) => `<div class="bd-prep-card"><p>${t(flat, flatEn, `bp.prep${i}`)}</p></div>`)
    .join("");
  return `<section class="bz-section bz-reveal" aria-labelledby="bd-prep-title">
        <div class="bz-inner">
          <h2 class="bz-title" id="bd-prep-title">${t(flat, flatEn, "bp.prepTitle")}</h2>
          <p class="bz-lead">${t(flat, flatEn, "bp.prepLead")}</p>
          <div class="bz-grid bz-grid--3" style="margin-top:1.75rem">${cards}</div>
          <p class="bd-fit-note">${t(flat, flatEn, "bp.prepNote")}</p>
        </div>
      </section>`;
}

function fitNote(slug, flat, flatEn) {
  const note = pick(flat, flatEn, "bp.fitNote");
  if (!note) return "";
  return `<p class="bd-fit-note">${escapeHtml(String(note))}</p>`;
}

function formControls(flat, flatEn) {
  return `<div class="bz-hp" aria-hidden="true">
              <input name="_honey" tabindex="-1" autocomplete="off" />
            </div>
            <button class="btn btn-primary" type="submit" id="bz-submit">
              <span class="bz-submit-spin" aria-hidden="true"></span>
              <span class="bz-submit-label">${t(flat, flatEn, "business.submit")}</span>
            </button>
          </form>
          <p class="bz-fail" id="bz-fail" role="alert" hidden>${t(flat, flatEn, "business.fail")}</p>`;
}

function simpleForm(flat, flatEn, type) {
  const typeLabel =
    type === "Partnership"
      ? t(flat, flatEn, "business.typePartnership")
      : type === "App Collaboration"
        ? t(flat, flatEn, "business.typeCollab")
        : type === "Advertising"
          ? t(flat, flatEn, "business.typeAdvertising")
          : type === "Development"
            ? t(flat, flatEn, "business.typeDevelopment")
            : t(flat, flatEn, "business.typeOther");
  return `<form class="bz-form" id="bz-inquiry-form" novalidate data-submit="${t(flat, flatEn, "business.submit")}" data-submitting="${t(flat, flatEn, "business.submitting")}" data-subject="${t(flat, flatEn, "business.mailSubject")}">
            <input type="hidden" name="type" id="bz-type" value="${escapeHtml(type)}" data-label="${typeLabel}" />
            <div class="bz-field">
              <label for="bz-name">${t(flat, flatEn, "business.labelName")}<span class="bz-req" aria-hidden="true">*</span></label>
              <input id="bz-name" name="name" type="text" required autocomplete="name" placeholder="${t(flat, flatEn, "business.phName")}" />
            </div>
            <div class="bz-field">
              <label for="bz-email">${t(flat, flatEn, "business.labelEmail")}<span class="bz-req" aria-hidden="true">*</span></label>
              <input id="bz-email" name="email" type="email" required autocomplete="email" inputmode="email" placeholder="${t(flat, flatEn, "business.phEmail")}" />
            </div>
            <div class="bz-field">
              <label for="bz-company">${t(flat, flatEn, "business.labelCompany")} <span class="bz-opt">(${t(flat, flatEn, "business.optional")})</span></label>
              <input id="bz-company" name="company" type="text" autocomplete="organization" placeholder="${t(flat, flatEn, "business.phCompany")}" />
            </div>
            <div class="bz-field">
              <label for="bz-message">${t(flat, flatEn, "business.labelMessage")}<span class="bz-req" aria-hidden="true">*</span></label>
              <textarea id="bz-message" name="message" required placeholder="${t(flat, flatEn, "business.phMessage")}"></textarea>
            </div>
            ${formControls(flat, flatEn)}`;
}

function devForm(flat, flatEn) {
  return `<form class="bz-form" id="bz-inquiry-form" novalidate data-submit="${t(flat, flatEn, "business.submit")}" data-submitting="${t(flat, flatEn, "business.submitting")}" data-subject="${t(flat, flatEn, "bp.mailSubject")}">
            <input type="hidden" name="type" id="bz-type" value="Development" data-label="${t(flat, flatEn, "business.typeDevelopment")}" />
            <div class="bz-field">
              <label for="bz-name">${t(flat, flatEn, "bp.labelName")}<span class="bz-req" aria-hidden="true">*</span></label>
              <input id="bz-name" name="name" type="text" required autocomplete="name" placeholder="${t(flat, flatEn, "bp.phName")}" />
            </div>
            <div class="bz-field">
              <label for="bz-email">${t(flat, flatEn, "bp.labelEmail")}<span class="bz-req" aria-hidden="true">*</span></label>
              <input id="bz-email" name="email" type="email" required autocomplete="email" inputmode="email" placeholder="${t(flat, flatEn, "bp.phEmail")}" />
            </div>
            <div class="bz-field">
              <label for="bz-team">${t(flat, flatEn, "bp.labelTeam")}</label>
              <input id="bz-team" name="team" type="text" autocomplete="organization" placeholder="${t(flat, flatEn, "bp.phTeam")}" />
            </div>
            <div class="bz-field">
              <label for="bz-project-type">${t(flat, flatEn, "bp.labelProjectType")}<span class="bz-req" aria-hidden="true">*</span></label>
              <select id="bz-project-type" name="projectType" required>
                <option value="" disabled selected>${t(flat, flatEn, "business.selectPlaceholder")}</option>
                <option value="${t(flat, flatEn, "bp.typeMobile")}">${t(flat, flatEn, "bp.typeMobile")}</option>
                <option value="${t(flat, flatEn, "bp.typeWeb")}">${t(flat, flatEn, "bp.typeWeb")}</option>
                <option value="${t(flat, flatEn, "bp.typeMvp")}">${t(flat, flatEn, "bp.typeMvp")}</option>
                <option value="${t(flat, flatEn, "bp.typeImprove")}">${t(flat, flatEn, "bp.typeImprove")}</option>
                <option value="${t(flat, flatEn, "bp.typeUnset")}">${t(flat, flatEn, "bp.typeUnset")}</option>
              </select>
            </div>
            <div class="bz-field">
              <label for="bz-summary">${t(flat, flatEn, "bp.labelSummary")}<span class="bz-req" aria-hidden="true">*</span></label>
              <textarea id="bz-summary" name="summary" required placeholder="${t(flat, flatEn, "bp.phSummary")}"></textarea>
            </div>
            <div class="bz-field">
              <label for="bz-features">${t(flat, flatEn, "bp.labelFeatures")}</label>
              <textarea id="bz-features" name="features" placeholder="${t(flat, flatEn, "bp.phFeatures")}"></textarea>
            </div>
            <div class="bz-field">
              <label for="bz-timeline">${t(flat, flatEn, "bp.labelTimeline")}</label>
              <select id="bz-timeline" name="timeline">
                <option value="">${t(flat, flatEn, "business.selectPlaceholder")}</option>
                <option value="${t(flat, flatEn, "business.timeAsap")}">${t(flat, flatEn, "business.timeAsap")}</option>
                <option value="${t(flat, flatEn, "business.time1to3")}">${t(flat, flatEn, "business.time1to3")}</option>
                <option value="${t(flat, flatEn, "business.time3to6")}">${t(flat, flatEn, "business.time3to6")}</option>
                <option value="${t(flat, flatEn, "business.time6plus")}">${t(flat, flatEn, "business.time6plus")}</option>
                <option value="${t(flat, flatEn, "business.timeUnset")}">${t(flat, flatEn, "business.timeUnset")}</option>
              </select>
            </div>
            <div class="bz-field">
              <label for="bz-budget">${t(flat, flatEn, "bp.labelBudget")}</label>
              <select id="bz-budget" name="budget">
                <option value="">${t(flat, flatEn, "business.selectPlaceholder")}</option>
                <option value="${t(flat, flatEn, "bp.budgetDiscuss")}">${t(flat, flatEn, "bp.budgetDiscuss")}</option>
                <option value="${t(flat, flatEn, "bp.budgetUnder1")}">${t(flat, flatEn, "bp.budgetUnder1")}</option>
                <option value="${t(flat, flatEn, "bp.budget1to3")}">${t(flat, flatEn, "bp.budget1to3")}</option>
                <option value="${t(flat, flatEn, "bp.budget3to5")}">${t(flat, flatEn, "bp.budget3to5")}</option>
                <option value="${t(flat, flatEn, "bp.budget5to10")}">${t(flat, flatEn, "bp.budget5to10")}</option>
                <option value="${t(flat, flatEn, "bp.budget10plus")}">${t(flat, flatEn, "bp.budget10plus")}</option>
              </select>
            </div>
            <div class="bz-field">
              <label for="bz-ref">${t(flat, flatEn, "bp.labelRef")}</label>
              <input id="bz-ref" name="reference" type="url" inputmode="url" placeholder="${t(flat, flatEn, "bp.phRef")}" />
            </div>
            <div class="bz-field">
              <label for="bz-extra">${t(flat, flatEn, "bp.labelExtra")}</label>
              <textarea id="bz-extra" name="extra" placeholder="${t(flat, flatEn, "bp.phExtra")}"></textarea>
            </div>
            ${formControls(flat, flatEn)}`;
}

function otherHtml(currentSlug, flat, flatEn) {
  const cards = BUSINESS_DETAIL_PAGES.filter((p) => p.slug !== currentSlug)
    .map(
      (p) => `<a class="bz-card" href="../${p.slug}/">
              <h3>${t(flat, flatEn, p.titleKey)}</h3>
              <p>${t(flat, flatEn, p.bodyKey)}</p>
              <span class="bz-card__more">${t(flat, flatEn, "bp.otherMore")}<span aria-hidden="true"> →</span></span>
            </a>`
    )
    .join("");
  return `<div class="bz-grid bz-grid--3">${cards}</div>`;
}

function hreflangBlock(slug) {
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${SITE_ORIGIN}/${d}/business/${slug}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/business/${slug}/" />`);
  return lines.join("\n");
}

export function mergeBusinessPagesLocales() {
  for (const { file, dir } of LANGS) {
    const locPath = path.join(ROOT, "locales", file);
    const loc = JSON.parse(fs.readFileSync(locPath, "utf8"));
    if (dir === "ko") loc.businessPages = BUSINESS_PAGES_I18N.ko;
    else if (dir === "en") loc.businessPages = BUSINESS_PAGES_I18N.en;
    else {
      loc.businessPages = fillMissing(loc.businessPages, BUSINESS_PAGES_I18N.en);
    }
    fs.writeFileSync(locPath, JSON.stringify(loc, null, 2) + "\n");
  }
}

function fillMissing(target, source) {
  if (source == null || typeof source !== "object" || Array.isArray(source)) return source;
  const out = target && typeof target === "object" && !Array.isArray(target) ? { ...target } : {};
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) out[k] = fillMissing(out[k], v);
    else if (out[k] === undefined || out[k] === null || out[k] === "") out[k] = v;
  }
  return out;
}

function patchBusinessHubLinks() {
  const replacements = [
    ['href="#inquiry" data-inquiry-type="Partnership"', "href=\"partnership/\""],
    ['href="#inquiry" data-inquiry-type="App Collaboration"', "href=\"service/\""],
    ['href="#inquiry" data-inquiry-type="Advertising"', "href=\"promotion/\""],
    ['href="#inquiry" data-inquiry-type="Development"', "href=\"development/\""],
  ];
  for (const { dir } of LANGS) {
    const file = path.join(ROOT, dir, "business", "index.html");
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, "utf8");
    for (const [from, to] of replacements) html = html.split(from).join(to);
    fs.writeFileSync(file, html);
  }
}

function hreflangSuccess() {
  const lines = LANGS.map(
    ({ dir: d, hreflang: h }) =>
      `    <link rel="alternate" hreflang="${h}" href="${SITE_ORIGIN}/${d}/business/inquiry/success/" />`
  );
  lines.push(
    `    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/business/inquiry/success/" />`
  );
  return lines.join("\n");
}

export function writeInquirySuccessPages() {
  const tpl = fs.readFileSync(path.join(ROOT, "templates", "business-inquiry-success.html"), "utf8");
  const enLoc = JSON.parse(fs.readFileSync(path.join(ROOT, "locales", "en.json"), "utf8"));
  const flatEn = flatten(enLoc);

  for (const { dir, file, htmlLang } of LANGS) {
    const loc = JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8"));
    loc.business = loc.business || {};
    loc.business.ok = fillMissing(loc.business.ok, enLoc.business.ok);
    const flat = flatten(loc);
    let html = tpl
      .replace(/\{\{LANG_DIR\}\}/g, dir)
      .replace(/\{\{HTML_LANG\}\}/g, htmlLang)
      .replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US")
      .replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/business/inquiry/success/`)
      .replace("{{HREFLANG_BLOCK}}", hreflangSuccess());
    html = applyTemplate(html, flat, flatEn);
    if (html.includes("{{")) {
      const leftover = html.match(/\{\{[^}]+\}\}/g);
      throw new Error(`Unreplaced tokens in ${dir}/business/inquiry/success: ${leftover && leftover.join(", ")}`);
    }
    const outDir = path.join(ROOT, dir, "business", "inquiry", "success");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html);
  }

  const list = JSON.stringify(LANGS.map((l) => l.dir));
  const redir = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex, nofollow"/><link rel="canonical" href="${SITE_ORIGIN}/en/business/inquiry/success/"/><title>Newon — Business</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/business/inquiry/success/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/business/inquiry/success/">Continue</a></p></body></html>`;
  const redirDir = path.join(ROOT, "business", "inquiry", "success");
  fs.mkdirSync(redirDir, { recursive: true });
  fs.writeFileSync(path.join(redirDir, "index.html"), redir);

  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    const jsSrc = path.join(ROOT, "business", "inquiry.js");
    if (fs.existsSync(jsSrc)) {
      fs.mkdirSync(path.join(pub, "business"), { recursive: true });
      fs.copyFileSync(jsSrc, path.join(pub, "business", "inquiry.js"));
    }
    for (const { dir } of LANGS) {
      const src = path.join(ROOT, dir, "business", "inquiry", "success", "index.html");
      const destDir = path.join(pub, dir, "business", "inquiry", "success");
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, path.join(destDir, "index.html"));
    }
    fs.mkdirSync(path.join(pub, "business", "inquiry", "success"), { recursive: true });
    fs.copyFileSync(path.join(redirDir, "index.html"), path.join(pub, "business", "inquiry", "success", "index.html"));
  }
}

export function generateBusinessDetails() {
  mergeBusinessPagesLocales();
  const tpl = fs.readFileSync(path.join(ROOT, "templates", "business-detail.html"), "utf8");
  const flatEn = flatten(JSON.parse(fs.readFileSync(path.join(ROOT, "locales", "en.json"), "utf8")));

  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8")));
    for (const page of BUSINESS_DETAIL_PAGES) {
      const bp = withBp(flat, page.slug);
      const bpEn = withBp(flatEn, page.slug);
      let html = tpl
        .replace(/\{\{LANG_DIR\}\}/g, dir)
        .replace(/\{\{HTML_LANG\}\}/g, htmlLang)
        .replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US")
        .replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/business/${page.slug}/`)
        .replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock(page.slug))
        .replace(/\{\{BP_SLUG\}\}/g, page.slug)
        .replace(/\{\{BP_PROCESS_HREF\}\}/g, page.slug === "development" ? "#launch" : "#process");
      html = html
        .replace("{{BP_HERO_PANEL}}", heroPanel(page.slug, bp, bpEn))
        .replace("{{BP_OFFERS}}", offersHtml(bp, bpEn))
        .replace("{{BP_PRINCIPLES}}", principlesHtml(page.slug, bp, bpEn))
        .replace("{{BP_LAUNCH}}", launchHtml(page.slug, bp, bpEn))
        .replace("{{BP_FITS}}", fitsHtml(page.slug, bp, bpEn))
        .replace("{{BP_FIT_NOTE}}", fitNote(page.slug, bp, bpEn))
        .replace("{{BP_PREP}}", prepHtml(page.slug, bp, bpEn))
        .replace("{{BP_STEPS}}", stepsHtml(bp, bpEn))
        .replace("{{BP_FAQ}}", faqHtml(bp, bpEn))
        .replace("{{BP_FORM}}", page.slug === "development" ? devForm(bp, bpEn) : simpleForm(bp, bpEn, page.type))
        .replace("{{BP_OTHER}}", otherHtml(page.slug, bp, bpEn));
      html = applyTemplate(html, bp, bpEn);
      if (html.includes("{{")) {
        const leftover = html.match(/\{\{[^}]+\}\}/g);
        throw new Error(`Unreplaced tokens in ${dir}/business/${page.slug}: ${leftover && leftover.join(", ")}`);
      }
      const outDir = path.join(ROOT, dir, "business", page.slug);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html);
    }
  }

  const list = JSON.stringify(LANGS.map((l) => l.dir));
  for (const page of BUSINESS_DETAIL_PAGES) {
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${SITE_ORIGIN}/en/business/${page.slug}/"/><title>Newon — Business</title><script>(function(){var L=${list};var d="en";try{var v=localStorage.getItem("newon-lang-dir");if(v&&L.indexOf(v)!==-1)d=v;}catch(e){}location.replace("/"+d+"/business/${page.slug}/"+(location.hash||""));})();</script></head><body style="font-family:system-ui,sans-serif;padding:1.5rem"><p><a href="/en/business/${page.slug}/">Continue</a></p></body></html>`;
    const dir = path.join(ROOT, "business", page.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html);
  }
  patchBusinessHubLinks();
  writeInquirySuccessPages();
  console.log("gen-business-details: OK");
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) generateBusinessDetails();
