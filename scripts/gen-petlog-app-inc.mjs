#!/usr/bin/env node
/**
 * Generates templates/petlog-app-inc.html from templates/babylog-app-inc.html
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

let s = fs.readFileSync(path.join(ROOT, "templates", "babylog-app-inc.html"), "utf8");

s = s.replace(/\{\{t:bl\./g, "{{t:pl.");
s = s.replace(/\{\{html:bl\./g, "{{html:pl.");
s = s.replace(/id="bl-/g, 'id="pl-');
s = s.replace(/href="#bl-/g, 'href="#pl-');
s = s.replace(/aria-labelledby="bl-/g, 'aria-labelledby="pl-');
s = s.replace(/babylog-app/g, "petlog-app");
s = s.replace(/\/babylog-logo\.png/g, "/petlog-logo.png");
s = s.replace(/\[\[IMG:bl-showcase-/g, "[[IMG:pl-showcase-");
s = s.replace(/BabyLog/g, "PetLog");

s = s.replace(/apps-trigger-bl/g, "apps-trigger-pl");
s = s.replace(/apps-panel-bl/g, "apps-panel-pl");
s = s.replace(/for="lang-select-bl"/g, 'for="lang-select-pl"');
s = s.replace(/id="lang-select-bl"/g, 'id="lang-select-pl"');
s = s.replace(/id="bl-theme"/g, 'id="pl-theme"');
s = s.replace(/id="bl-nav-toggle"/g, 'id="pl-nav-toggle"');
s = s.replace(/aria-controls="bl-mobile"/g, 'aria-controls="pl-mobile"');
s = s.replace(/id="bl-mobile"/g, 'id="pl-mobile"');

const flyPat =
  /<a\s*\n\s*href="#pl-top"\s*\n\s*role="menuitem"\s*\n\s*class="apps-flyout__item apps-flyout__item--current"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>/;

const flyRep = `<a href="#babylog-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/babylog-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">BabyLog</span>
                    <span class="apps-flyout__desc">{{t:nav.babylogDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
                <a
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

if (!flyPat.test(s)) {
  console.error("gen-petlog-app-inc: flyout current block not found");
  process.exit(1);
}
s = s.replace(flyPat, flyRep);

const mobilePat =
  /<a href="#savy-app" class="mobile-apps-drawer__item">[\s\S]*?<\/a>\s*\n\s*<a href="#pl-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>/;

const mobileRep = `<a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:pl.drawerSv}}</span>
              </span>
            </a>
            <a href="#babylog-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/babylog-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">BabyLog</span>
                <span class="mobile-apps-drawer__hint">{{t:pl.drawerBl}}</span>
              </span>
            </a>
            <a href="#pl-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/petlog-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">PetLog</span>
                <span class="mobile-apps-drawer__hint">{{t:pl.drawerPl}}</span>
              </span>
            </a>`;

if (!mobilePat.test(s)) {
  console.error("gen-petlog-app-inc: mobile drawer block not found");
  process.exit(1);
}
s = s.replace(mobilePat, mobileRep);

for (const [a, b] of [
  ["🍼", "🍽️"],
  ["👶", "🐾"],
  ["📏", "💉"],
]) {
  s = s.split(`<span class="ox-feature-emoji" aria-hidden="true">${a}</span>`).join(
    `<span class="ox-feature-emoji" aria-hidden="true">${b}</span>`
  );
}

fs.writeFileSync(path.join(ROOT, "templates", "petlog-app-inc.html"), s, "utf8");
console.log("OK → templates/petlog-app-inc.html");
