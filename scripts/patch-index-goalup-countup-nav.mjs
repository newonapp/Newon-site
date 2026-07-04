#!/usr/bin/env node
/** Insert GoalUp + CountUp nav entries after PiggyUp in templates. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const FLYOUT_GOALUP = `                <a href="#goalup-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/goalup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">GoalUp</span>
                    <span class="apps-flyout__desc">{{t:nav.goalupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

const FLYOUT_COUNTUP = `                <a href="#countup-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/countup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">CountUp</span>
                    <span class="apps-flyout__desc">{{t:nav.countupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

const MOBILE_GOALUP = `            <a href="#goalup-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/goalup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">GoalUp</span>
                <span class="mobile-apps-drawer__hint">{{t:nav.mobileGoalupHint}}</span>
              </span>
            </a>`;

const MOBILE_COUNTUP = `            <a href="#countup-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/countup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">CountUp</span>
                <span class="mobile-apps-drawer__hint">{{t:nav.mobileCountupHint}}</span>
              </span>
            </a>`;

const FLYOUT_AFTER = "\n" + FLYOUT_GOALUP + "\n" + FLYOUT_COUNTUP;
const MOBILE_AFTER = "\n" + MOBILE_GOALUP + "\n" + MOBILE_COUNTUP;

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
  if (s.includes("goalup-logo.png")) {
    console.log(`skip (already patched): ${path.relative(ROOT, filePath)}`);
    return;
  }
  if (!s.includes('href="#piggyup-app"') && !s.includes('href="#pu-top"')) {
    console.log(`skip (no PiggyUp nav): ${path.relative(ROOT, filePath)}`);
    return;
  }

  const nFlyLink = (s.match(/href="#piggyup-app" role="menuitem"/g) || []).length;
  s = s.split(FLYOUT_PIGGYUP_LINK).join(FLYOUT_PIGGYUP_LINK + FLYOUT_AFTER);

  if (s.includes(FLYOUT_PIGGYUP_CURRENT)) {
    s = s.replace(FLYOUT_PIGGYUP_CURRENT, FLYOUT_PIGGYUP_CURRENT + FLYOUT_AFTER);
  }

  const mobilePiggyupRe =
    /<a href="#piggyup-app" class="mobile-apps-drawer__item">[\s\S]*?<span class="mobile-apps-drawer__hint">[\s\S]*?<\/span>\s*\n\s*<\/span>\s*\n\s*<\/a>/g;
  const nMobile = (s.match(mobilePiggyupRe) || []).length;
  s = s.replace(mobilePiggyupRe, (block) => block + MOBILE_AFTER);

  const mobilePuCurrentRe =
    /(<a href="#pu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>)(\s*\n\s*<\/details>)/;
  if (mobilePuCurrentRe.test(s)) {
    s = s.replace(mobilePuCurrentRe, `$1${MOBILE_AFTER}$2`);
  }

  if (!s.includes("goalup-logo.png") || !s.includes("countup-logo.png")) {
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

console.log("patch-index-goalup-countup-nav: OK");
