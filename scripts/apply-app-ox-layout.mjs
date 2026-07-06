#!/usr/bin/env node
/** Unify app page layout / typography / boxes to match OX MONTH. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  SP_FILE_BY_LANG,
  SP_FEATURES_SECTION,
  migrateSpFeatures,
} from "./app-ox-layout.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "locales");
const TPL = path.join(ROOT, "templates");

for (const [lang, file] of Object.entries(SP_FILE_BY_LANG)) {
  const p = path.join(LOCALES, file);
  if (!fs.existsSync(p)) continue;
  const sp = JSON.parse(fs.readFileSync(p, "utf8"));
  migrateSpFeatures(sp, lang);
  fs.writeFileSync(p, JSON.stringify(sp, null, 2) + "\n", "utf8");
}

function patchSpFeaturesSection(html) {
  const re = /<section id="sp-features"[\s\S]*?<\/section>/m;
  if (!re.test(html)) return html;
  return html.replace(re, SP_FEATURES_SECTION);
}

function patchIntroClosingInsideBody(html) {
  return html
    .replace(
      /(<div class="ox-app-intro__body">\{\{html:([a-z]+)\.introHtml\}\}<\/div>\s*)<p class="ox-app-intro__closing">\{\{t:\2\.introClosing\}\}<\/p>/g,
      '<div class="ox-app-intro__body">{{html:$2.introHtml}}<p class="ox-app-intro__closing">{{t:$2.introClosing}}</p></div>'
    )
    .replace(
      /(<div class="ox-app-intro__body">\{\{html:np\.introHtml\}\}<\/div>\s*)\{\{html:np\.introClosingBlock\}\}/g,
      '<div class="ox-app-intro__body">{{html:np.introHtml}}{{html:np.introClosingBlock}}</div>'
    );
}

function patchHeroLogoSize(html) {
  return html.replace(/width="940"\s+height="940"/g, 'width="512" height="512"');
}

function patchPremiumLockEmoji(html) {
  return html.replace(
    /(<h3 id="[^"]+-premium-features-heading" class="ox-premium-block__title">\s*<span class="ox-premium-emoji" aria-hidden="true">)🔒(<\/span>)/g,
    "$1🔓$2"
  );
}

function patchRecoListMargin(html) {
  return html.replace(/<ul class="co-build-list" style="margin-top: 1rem">/g, '<ul class="co-build-list">');
}

function patchSectionSpacing(html) {
  return html.replace(/<\/section><section id="sp-reviews"/g, '</section>\n\n        <section id="sp-reviews"');
}

for (const name of fs.readdirSync(TPL).filter((f) => f.endsWith(".html"))) {
  const p = path.join(TPL, name);
  let html = fs.readFileSync(p, "utf8");
  const steps = [
    patchSpFeaturesSection,
    patchIntroClosingInsideBody,
    patchHeroLogoSize,
    patchPremiumLockEmoji,
    patchRecoListMargin,
    patchSectionSpacing,
  ];
  for (const step of steps) {
    html = step(html);
  }
  fs.writeFileSync(p, html, "utf8");
}

console.log("apply-app-ox-layout: OK");
