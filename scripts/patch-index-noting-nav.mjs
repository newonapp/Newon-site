#!/usr/bin/env node
/** Insert Noting nav entries after PiggyUp in templates/index.html (+ inc templates). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const FLYOUT_NOTING = `                <a href="#noting-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/noting-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">Noting</span>
                    <span class="apps-flyout__desc">{{t:nav.notingDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

const MOBILE_NOTING = `            <a href="#noting-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/noting-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">Noting</span>
                <span class="mobile-apps-drawer__hint">{{t:nav.mobileNotingHint}}</span>
              </span>
            </a>`;

const FLYOUT_PIGGYUP_LINK = `                <a href="#piggyup-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/piggyup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">PiggyUp</span>
                    <span class="apps-flyout__desc">{{t:nav.piggyupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

const FLYOUT_PIGGYUP_CURRENT = `                <a
                  href="#pu-top"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="/piggyup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">PiggyUp</span>
                    <span class="apps-flyout__desc">{{t:nav.piggyupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

function patchHtml(filePath) {
  let s = fs.readFileSync(filePath, "utf8");
  if (s.includes("noting-logo.png")) {
    console.log(`skip (already patched): ${path.relative(ROOT, filePath)}`);
    return;
  }
  if (!s.includes('href="#piggyup-app"') && !s.includes('href="#pu-top"')) {
    console.log(`skip (no PiggyUp nav): ${path.relative(ROOT, filePath)}`);
    return;
  }

  const nFlyLink = (s.match(/href="#piggyup-app" role="menuitem"/g) || []).length;
  s = s.split(FLYOUT_PIGGYUP_LINK).join(FLYOUT_PIGGYUP_LINK + "\n" + FLYOUT_NOTING);

  if (s.includes(FLYOUT_PIGGYUP_CURRENT)) {
    s = s.replace(FLYOUT_PIGGYUP_CURRENT, FLYOUT_PIGGYUP_CURRENT + "\n" + FLYOUT_NOTING);
  }

  const mobilePiggyupRe =
    /<a href="#piggyup-app" class="mobile-apps-drawer__item">[\s\S]*?<span class="mobile-apps-drawer__hint">[\s\S]*?<\/span>\s*\n\s*<\/span>\s*\n\s*<\/a>/g;
  const nMobile = (s.match(mobilePiggyupRe) || []).length;
  s = s.replace(mobilePiggyupRe, (block) => block + "\n" + MOBILE_NOTING);

  const mobilePuCurrentRe =
    /(<a href="#pu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>)(\s*\n\s*<\/details>)/;
  if (mobilePuCurrentRe.test(s)) {
    s = s.replace(mobilePuCurrentRe, `$1\n${MOBILE_NOTING}$2`);
  }

  if (!s.includes("noting-logo.png")) {
    console.error(`patch failed: ${path.relative(ROOT, filePath)}`);
    process.exit(1);
  }

  fs.writeFileSync(filePath, s, "utf8");
  console.log(
    `patched ${path.relative(ROOT, filePath)} (flyout links: ${nFlyLink}, mobile piggyup: ${nMobile})`
  );
}

patchHtml(path.join(ROOT, "templates", "index.html"));
for (const name of ["petlog-app-inc.html", "piggyup-app-inc.html"]) {
  const p = path.join(ROOT, "templates", name);
  if (fs.existsSync(p)) patchHtml(p);
}

console.log("patch-index-noting-nav: OK");
