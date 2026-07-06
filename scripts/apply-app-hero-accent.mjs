#!/usr/bin/env node
/** Apply ox-accent highlighter to hero subtitles (all apps). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  HERO_SUBTITLE,
  DATA_FILE_BY_NS,
  SP_FILE_BY_LANG,
  subtitleForLang,
} from "./app-hero-accent.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "locales");
const TPL = path.join(ROOT, "templates");
const SITE_LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

function patchDataSubtitle(filePath, koHtml, enHtml) {
  let s = fs.readFileSync(filePath, "utf8");
  for (const [lang, html] of [
    ["Ko", koHtml],
    ["En", enHtml],
  ]) {
    const re = new RegExp(
      `(export const \\w+${lang} = \\{[\\s\\S]*?subtitleHtml:\\s*\\n?\\s*)(?:\`[^\`]*\`|"[^"]*")`,
      "m"
    );
    if (re.test(s)) {
      s = s.replace(re, `$1\`${html}\``);
    }
  }
  fs.writeFileSync(filePath, s, "utf8");
}

for (const app of HERO_SUBTITLE) {
  const dataFile = DATA_FILE_BY_NS[app.ns];
  if (dataFile) patchDataSubtitle(path.join(ROOT, "scripts", dataFile), app.ko, app.en);
}

for (const lang of SITE_LANGS) {
  const subFor = (ns) => subtitleForLang(lang, HERO_SUBTITLE.find((a) => a.ns === ns));

  if (SP_FILE_BY_LANG[lang]) {
    const sp = JSON.parse(fs.readFileSync(path.join(LOCALES, SP_FILE_BY_LANG[lang]), "utf8"));
    sp.subtitle = subFor("sp");
    fs.writeFileSync(path.join(LOCALES, SP_FILE_BY_LANG[lang]), JSON.stringify(sp, null, 2) + "\n", "utf8");
  }

  const localePath = path.join(LOCALES, `${lang}.json`);
  if (!fs.existsSync(localePath)) continue;
  const j = JSON.parse(fs.readFileSync(localePath, "utf8"));
  for (const app of HERO_SUBTITLE) {
    if (!j[app.ns]) continue;
    if (app.ns === "ox") {
      j[app.ns].subtitleHtml = subFor("ox");
    } else if (app.ns === "sp") {
      j[app.ns].subtitle = subFor("sp");
    } else {
      j[app.ns].subtitleHtml = subFor(app.ns);
    }
  }
  fs.writeFileSync(localePath, JSON.stringify(j, null, 2) + "\n", "utf8");
}

const indexPath = path.join(TPL, "index.html");
let index = fs.readFileSync(indexPath, "utf8");
if (index.includes("{{t:ox.subtitle}}")) {
  index = index.replace("{{t:ox.subtitle}}", "{{html:ox.subtitleHtml}}");
  fs.writeFileSync(indexPath, index, "utf8");
}

console.log("apply-app-hero-accent: OK");
