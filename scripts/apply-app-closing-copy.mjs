#!/usr/bin/env node
/** Apply unified closing copy (headline · philosophy · CTA) to all apps. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  CLOSING_COPY,
  DATA_FILE_BY_NS,
  SP_FILE_BY_LANG,
  closingForLang,
} from "./app-closing-copy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "locales");
const TPL = path.join(ROOT, "templates");
const SITE_LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

function patchDataClosing(filePath, koHtml, enHtml) {
  let s = fs.readFileSync(filePath, "utf8");
  const blocks = [
    { lang: "Ko", html: koHtml },
    { lang: "En", html: enHtml },
  ];
  for (const { lang, html } of blocks) {
    const blockRe = new RegExp(
      `(export const \\w+${lang} = \\{[\\s\\S]*?)(closingHtml:[\\s\\S]*?)(\\n  closing(?:Aria)?:|\\n  footerRights:)`,
      "m"
    );
    const replacement = `$1closingHtml:\n    \`${html}\`,$3`;
    if (blockRe.test(s)) {
      s = s.replace(blockRe, replacement);
      continue;
    }
    const legacyRe = new RegExp(
      `(export const \\w+${lang} = \\{[\\s\\S]*?)(closing: "[^"]*",)(\\n  footerRights:)`,
      "m"
    );
    if (legacyRe.test(s)) {
      s = s.replace(
        legacyRe,
        `$1closingHtml:\n    \`${html}\`,\n  closing: "",$3`
      );
    }
  }
  fs.writeFileSync(filePath, s, "utf8");
}

for (const app of CLOSING_COPY) {
  const dataFile = DATA_FILE_BY_NS[app.ns];
  if (dataFile) patchDataClosing(path.join(ROOT, "scripts", dataFile), app.ko, app.en);
}

for (const lang of SITE_LANGS) {
  const htmlFor = (ns) => closingForLang(lang, CLOSING_COPY.find((a) => a.ns === ns));

  const spFile = SP_FILE_BY_LANG[lang];
  if (spFile && CLOSING_COPY.some((a) => a.ns === "sp")) {
    const p = path.join(LOCALES, spFile);
    const sp = JSON.parse(fs.readFileSync(p, "utf8"));
    sp.closingHtml = htmlFor("sp");
    sp.closingFoot = sp.closingHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);
    fs.writeFileSync(p, JSON.stringify(sp, null, 2) + "\n", "utf8");
  }

  const localePath = path.join(LOCALES, `${lang}.json`);
  if (!fs.existsSync(localePath)) continue;
  const j = JSON.parse(fs.readFileSync(localePath, "utf8"));
  for (const app of CLOSING_COPY) {
    if (!j[app.ns]) continue;
    j[app.ns].closingHtml = htmlFor(app.ns);
  }
  fs.writeFileSync(localePath, JSON.stringify(j, null, 2) + "\n", "utf8");
}

const PM_CLOSING_OLD = `<section class="ox-closing ox-reveal-on-scroll" aria-label="{{t:pm.closing}}">
          <div class="ox-closing__stack"><p>{{t:pm.closing}}</p></div>
        </section>`;
const PM_CLOSING_NEW = `<section class="ox-closing ox-reveal-on-scroll" aria-label="{{t:pm.closingAria}}">
          <div class="ox-closing__stack">{{html:pm.closingHtml}}</div>
        </section>`;

for (const name of ["pillmate-app-inc.html", "index.html"]) {
  const p = path.join(TPL, name);
  let html = fs.readFileSync(p, "utf8");
  if (html.includes(PM_CLOSING_OLD)) {
    html = html.replace(PM_CLOSING_OLD, PM_CLOSING_NEW);
    fs.writeFileSync(p, html, "utf8");
  }
}

console.log("apply-app-closing-copy: OK");
