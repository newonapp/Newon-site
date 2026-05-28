#!/usr/bin/env node
/** Insert PiggyUp nav entries after PetLog in templates/index.html (+ inc templates). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const FLYOUT_PIGGYUP = `                <a href="#piggyup-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/piggyup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">PiggyUp</span>
                    <span class="apps-flyout__desc">{{t:nav.piggyupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

const MOBILE_PIGGYUP = `            <a href="#piggyup-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/piggyup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">PiggyUp</span>
                <span class="mobile-apps-drawer__hint">{{t:nav.mobilePiggyupHint}}</span>
              </span>
            </a>`;

const FLYOUT_PETLOG_LINK = `                <a href="#petlog-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/petlog-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">PetLog</span>
                    <span class="apps-flyout__desc">{{t:nav.petlogDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

const FLYOUT_PETLOG_CURRENT = `                <a
                  href="#pl-top"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="/petlog-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">PetLog</span>
                    <span class="apps-flyout__desc">{{t:nav.petlogDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

function patchHtml(filePath) {
  let s = fs.readFileSync(filePath, "utf8");
  if (s.includes("piggyup-logo.png")) {
    console.log(`skip (already patched): ${path.relative(ROOT, filePath)}`);
    return;
  }
  if (!s.includes('href="#petlog-app"') && !s.includes('href="#pl-top"')) {
    console.log(`skip (no PetLog nav): ${path.relative(ROOT, filePath)}`);
    return;
  }

  const nFlyLink = (s.match(/href="#petlog-app" role="menuitem"/g) || []).length;
  s = s.split(FLYOUT_PETLOG_LINK).join(FLYOUT_PETLOG_LINK + "\n" + FLYOUT_PIGGYUP);

  if (s.includes(FLYOUT_PETLOG_CURRENT)) {
    s = s.replace(FLYOUT_PETLOG_CURRENT, FLYOUT_PETLOG_CURRENT + "\n" + FLYOUT_PIGGYUP);
  }

  const mobilePetlogRe =
    /<a href="#petlog-app" class="mobile-apps-drawer__item">[\s\S]*?<span class="mobile-apps-drawer__hint">[\s\S]*?<\/span>\s*\n\s*<\/span>\s*\n\s*<\/a>/g;
  const nMobile = (s.match(mobilePetlogRe) || []).length;
  s = s.replace(mobilePetlogRe, (block) => block + "\n" + MOBILE_PIGGYUP);

  const mobilePlCurrentRe =
    /(<a href="#pl-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>)(\s*\n\s*<\/details>)/;
  if (mobilePlCurrentRe.test(s)) {
    s = s.replace(mobilePlCurrentRe, `$1\n${MOBILE_PIGGYUP}$2`);
  }

  if (!s.includes("piggyup-logo.png")) {
    console.error(`patch failed: ${path.relative(ROOT, filePath)}`);
    process.exit(1);
  }

  fs.writeFileSync(filePath, s, "utf8");
  console.log(
    `patched ${path.relative(ROOT, filePath)} (flyout links: ${nFlyLink}, mobile petlog: ${nMobile})`
  );
}

patchHtml(path.join(ROOT, "templates", "index.html"));
for (const name of ["babylog-app-inc.html", "petlog-app-inc.html"]) {
  const p = path.join(ROOT, "templates", name);
  if (fs.existsSync(p)) patchHtml(p);
}

console.log("patch-index-piggyup-nav: OK");
