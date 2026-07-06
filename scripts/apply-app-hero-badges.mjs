#!/usr/bin/env node
/** Unify hero badge pills (BabyLog style) across all apps. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  HERO_BADGE_APPS,
  DATA_FILE_BY_NS,
  SP_FILE_BY_LANG,
  badgesForLang,
} from "./app-hero-badges.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "locales");
const TPL = path.join(ROOT, "templates");
const SITE_LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

function patchDataFile(filePath, ko, en) {
  let s = fs.readFileSync(filePath, "utf8");
  for (const [lang, data] of [
    ["Ko", ko],
    ["En", en],
  ]) {
    const badgeRe = new RegExp(
      `(export const \\w+${lang} = \\{[\\s\\S]*?badge: )"[^"]*"`,
      "m"
    );
    if (!badgeRe.test(s)) {
      console.warn(`apply-app-hero-badges: badge not found in ${path.basename(filePath)} (${lang})`);
    } else {
      s = s.replace(badgeRe, `$1"${data.badge}"`);
    }
  }
  fs.writeFileSync(filePath, s, "utf8");
}

for (const app of HERO_BADGE_APPS) {
  const dataFile = DATA_FILE_BY_NS[app.ns];
  if (dataFile) {
    patchDataFile(path.join(ROOT, "scripts", dataFile), app.ko, app.en);
  }
}

for (const lang of SITE_LANGS) {
  const fields = (ns) => badgesForLang(lang, HERO_BADGE_APPS.find((a) => a.ns === ns));

  const spFile = SP_FILE_BY_LANG[lang];
  if (spFile) {
    const p = path.join(LOCALES, spFile);
    const sp = JSON.parse(fs.readFileSync(p, "utf8"));
    const spFields = fields("sp");
    sp.badge = spFields.badge;
    fs.writeFileSync(p, JSON.stringify(sp, null, 2) + "\n", "utf8");
  }

  const localePath = path.join(LOCALES, `${lang}.json`);
  if (!fs.existsSync(localePath)) continue;
  const j = JSON.parse(fs.readFileSync(localePath, "utf8"));
  for (const app of HERO_BADGE_APPS) {
    if (!j[app.ns]) continue;
    const f = fields(app.ns);
    j[app.ns].badge = f.badge;
  }
  fs.writeFileSync(localePath, JSON.stringify(j, null, 2) + "\n", "utf8");
}

function stripSecondaryBadge(html) {
  return html.replace(
    /\n\s*<p class="ox-badge ox-badge--secondary">\{\{t:[a-z]+\.globalReachBadge\}\}<\/p>/g,
    ""
  );
}

for (const name of fs.readdirSync(TPL).filter((f) => f.endsWith(".html"))) {
  const p = path.join(TPL, name);
  let html = fs.readFileSync(p, "utf8");
  const next = stripSecondaryBadge(html);
  if (next !== html) fs.writeFileSync(p, next, "utf8");
}

console.log("apply-app-hero-badges: OK");
