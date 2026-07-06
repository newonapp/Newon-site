#!/usr/bin/env node
/** Unify app intro headers: Brand label + Why {App} title (all locales). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  INTRO_APPS,
  INTRO_LABEL,
  DATA_FILE_BY_NS,
  introTitle,
} from "./app-intro-branding.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "locales");
const TPL = path.join(ROOT, "templates");

const SITE_LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const SP_FILE_BY_LANG = {
  ko: "_sp.ko.json",
  en: "_sp.en.json",
  ja: "_sp.ja.json",
  es: "_sp.es.json",
  "pt-br": "_sp.pt-br.json",
  fr: "_sp.fr.json",
  de: "_sp.de.json",
  hi: "_sp.hi.json",
  id: "_sp.id.json",
};

function patchDataExports(filePath, appName) {
  let s = fs.readFileSync(filePath, "utf8");
  for (const lang of ["Ko", "En"]) {
    const lkey = lang === "Ko" ? "ko" : "en";
    const label = INTRO_LABEL[lkey];
    const title = introTitle(lkey, appName);
    const blockRe = new RegExp(
      `(export const \\w+${lang} = \\{[\\s\\S]*?introLabel: )"[^"]*"(,\\s*\\n\\s*introTitle: )"[^"]*"`,
      "m"
    );
    if (!blockRe.test(s)) {
      console.warn(`apply-app-intro-branding: intro block not found in ${path.basename(filePath)} (${lang})`);
      continue;
    }
    s = s.replace(blockRe, `$1"${label}"$2"${title}"`);
  }
  fs.writeFileSync(filePath, s, "utf8");
}

for (const app of INTRO_APPS) {
  const dataFile = DATA_FILE_BY_NS[app.ns];
  if (dataFile) {
    patchDataExports(path.join(ROOT, "scripts", dataFile), app.name);
  }
}

for (const lang of SITE_LANGS) {
  const spFile = SP_FILE_BY_LANG[lang];
  if (spFile) {
    const p = path.join(LOCALES, spFile);
    const sp = JSON.parse(fs.readFileSync(p, "utf8"));
    sp.introLabel = INTRO_LABEL[lang];
    sp.introTitle = introTitle(lang, "SubPing");
    delete sp.introHeadline;
    fs.writeFileSync(p, JSON.stringify(sp, null, 2) + "\n", "utf8");
  }

  const localePath = path.join(LOCALES, `${lang}.json`);
  if (!fs.existsSync(localePath)) continue;
  const j = JSON.parse(fs.readFileSync(localePath, "utf8"));
  for (const app of INTRO_APPS) {
    if (!j[app.ns]) continue;
    j[app.ns].introLabel = INTRO_LABEL[lang];
    j[app.ns].introTitle = introTitle(lang, app.name);
    delete j[app.ns].introHeadline;
  }
  fs.writeFileSync(localePath, JSON.stringify(j, null, 2) + "\n", "utf8");
}

function patchIntroEmoji(html, sectionId, emoji) {
  const re = new RegExp(
    `(id="${sectionId}"[\\s\\S]*?<span class="ox-app-intro__title-icon" aria-hidden="true">)[^<]+(</span>)`,
    "m"
  );
  if (!re.test(html)) return html;
  return html.replace(re, `$1${emoji}$2`);
}

function patchSpIntroTitle(html) {
  return html.replace(/\{\{t:sp\.introHeadline\}\}/g, "{{t:sp.introTitle}}");
}

const introSections = INTRO_APPS.map((a) => ({
  id: `${a.ns}-intro`,
  emoji: a.emoji,
}));

for (const name of fs.readdirSync(TPL).filter((f) => f.endsWith("-app-inc.html") || f === "index.html" || f === "subping-page.html")) {
  const p = path.join(TPL, name);
  let html = fs.readFileSync(p, "utf8");
  let changed = false;
  for (const { id, emoji } of introSections) {
    const next = patchIntroEmoji(html, id, emoji);
    if (next !== html) {
      html = next;
      changed = true;
    }
  }
  const nextSp = patchSpIntroTitle(html);
  if (nextSp !== html) {
    html = nextSp;
    changed = true;
  }
  if (changed) fs.writeFileSync(p, html, "utf8");
}

console.log("apply-app-intro-branding: OK");
