#!/usr/bin/env node
/** Insert Newon+ nav entry after CountUp in every app flyout and mobile drawer. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const FLYOUT_NEWON = `
                <a href="#newon-plus-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/newon-plus-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">Newon</span>
                    <span class="apps-flyout__desc">{{t:nav.newonPlusDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

const MOBILE_NEWON = `
            <a href="#newon-plus-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/newon-plus-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">Newon</span>
                <span class="mobile-apps-drawer__hint">{{t:nav.mobileNewonPlusHint}}</span>
              </span>
            </a>`;

const FLYOUT_COUNTUP =
  /<a href="#countup-app" role="menuitem" class="apps-flyout__item">[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*<\/a>/g;

const FLYOUT_COUNTUP_CURRENT =
  /<a\s*\n\s*href="#cu-top"[\s\S]*?class="apps-flyout__item apps-flyout__item--current"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*<\/a>/g;

const MOBILE_COUNTUP =
  /<a href="#countup-app" class="mobile-apps-drawer__item">[\s\S]*?<span class="mobile-apps-drawer__hint">[\s\S]*?<\/span>\s*\n\s*<\/span>\s*\n\s*<\/a>/g;

const MOBILE_COUNTUP_CURRENT =
  /<a href="#cu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<span class="mobile-apps-drawer__hint">[\s\S]*?<\/span>\s*\n\s*<\/span>\s*\n\s*<\/a>/g;

function shouldSkipNewonInsert(after) {
  return (
    /^\s*<a[^>]*href="#newon-plus-app"/.test(after) ||
    /^\s*<a[^>]*href="#np-top"/.test(after)
  );
}

function insertAfterMatches(s, re, insert) {
  return s.replace(re, (block, offset, str) => {
    const end = offset + block.length;
    if (shouldSkipNewonInsert(str.slice(end, end + 160))) return block;
    return block + insert;
  });
}

function insertAfterCountupBlocks(s) {
  s = insertAfterMatches(s, FLYOUT_COUNTUP, FLYOUT_NEWON);
  s = insertAfterMatches(s, FLYOUT_COUNTUP_CURRENT, FLYOUT_NEWON);
  s = insertAfterMatches(s, MOBILE_COUNTUP, MOBILE_NEWON);
  s = insertAfterMatches(s, MOBILE_COUNTUP_CURRENT, MOBILE_NEWON);
  return s;
}

function cleanupNewonNav(s) {
  s = s.replace(/<a <a href="#newon-plus-app"/g, '<a href="#newon-plus-app"');
  s = s.replace(
    /(<a href="#newon-plus-app"[\s\S]*?<img src=")\/logo\.png/g,
    "$1/newon-plus-logo.png"
  );
  s = s.replace(
    /(<a\s*\n\s*href="#np-top"[\s\S]*?<img src=")\/logo\.png/g,
    "$1/newon-plus-logo.png"
  );
  return s;
}

function patchHtml(filePath) {
  let s = fs.readFileSync(filePath, "utf8");
  const before = (s.match(/href="#newon-plus-app"/g) || []).length;
  s = insertAfterCountupBlocks(s);
  s = cleanupNewonNav(s);
  const after = (s.match(/href="#newon-plus-app"/g) || []).length;

  if (!s.includes("{{t:nav.newonPlusDesc}}") && !s.includes('href="#newon-plus-app"')) {
    console.log(`skip (no CountUp nav): ${path.relative(ROOT, filePath)}`);
    return;
  }

  fs.writeFileSync(filePath, s, "utf8");
  console.log(
    `patched ${path.relative(ROOT, filePath)} (+${after - before} Newon links, total ${after})`
  );
}

const files = [
  path.join(ROOT, "templates", "index.html"),
  path.join(ROOT, "templates", "newon-plus-app-inc.html"),
  path.join(ROOT, "templates", "countup-app-inc.html"),
  path.join(ROOT, "templates", "goalup-app-inc.html"),
  path.join(ROOT, "templates", "petlog-app-inc.html"),
  path.join(ROOT, "templates", "piggyup-app-inc.html"),
  path.join(ROOT, "templates", "pillmate-app-inc.html"),
  path.join(ROOT, "templates", "savy-app-inc.html"),
  path.join(ROOT, "templates", "babylog-app-inc.html"),
  path.join(ROOT, "templates", "noting-app-inc.html"),
];

for (const f of files) {
  if (fs.existsSync(f)) patchHtml(f);
}

console.log("patch-index-newon-plus-nav: OK");
