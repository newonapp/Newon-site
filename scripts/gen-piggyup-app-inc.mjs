#!/usr/bin/env node
/**
 * Generates templates/piggyup-app-inc.html from the savy-app block in templates/index.html
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(ROOT, "templates", "index.html");
const idx = fs.readFileSync(indexPath, "utf8");

const start = idx.indexOf('<div id="savy-app"');
const end = idx.indexOf('<div id="babylog-app"');
if (start < 0 || end < 0) {
  console.error("gen-piggyup-app-inc: savy-app block not found");
  process.exit(1);
}

let s = idx.slice(start, end);

s = s.replace(/\{\{t:sv\./g, "{{t:pu.");
s = s.replace(/\{\{html:sv\./g, "{{html:pu.");
s = s.replace(/id="sv-/g, 'id="pu-');
s = s.replace(/href="#sv-/g, 'href="#pu-');
s = s.replace(/aria-labelledby="sv-/g, 'aria-labelledby="pu-');
s = s.replace(/id="savy-app"/g, 'id="piggyup-app"');
s = s.replace(/\/savy-logo\.png/g, "/piggyup-logo.png");
s = s.replace(/apps-trigger-sv/g, "apps-trigger-pu");
s = s.replace(/apps-panel-sv/g, "apps-panel-pu");
s = s.replace(/for="lang-select-sv"/g, 'for="lang-select-pu"');
s = s.replace(/id="lang-select-sv"/g, 'id="lang-select-pu"');
s = s.replace(/id="sv-theme"/g, 'id="pu-theme"');
s = s.replace(/id="sv-nav-toggle"/g, 'id="pu-nav-toggle"');
s = s.replace(/aria-controls="sv-mobile"/g, 'aria-controls="pu-mobile"');
s = s.replace(/id="sv-mobile"/g, 'id="pu-mobile"');
s = s.replace(/<span class="apps-flyout__name">SAVY<\/span>/g, '<span class="apps-flyout__name">PiggyUp</span>');
s = s.replace(/<span class="navbar-app-showcase__title">SAVY<\/span>/g, '<span class="navbar-app-showcase__title">PiggyUp</span>');
s = s.replace(/\{\{t:nav\.savyDesc\}\}/g, "{{t:nav.piggyupDesc}}");
s = s.replace(/\{\{t:sv\.drawer/g, "{{t:pu.drawer");
s = s.replace(/<span class="mobile-apps-drawer__name">SAVY<\/span>/g, '<span class="mobile-apps-drawer__name">PiggyUp</span>');

// Feature card emojis (text-only change)
s = s.replace(
  /<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">💳<\/span>/,
  '<article class="ox-feature-card">\n                <span class="ox-feature-emoji" aria-hidden="true">💸</span>'
);
s = s.replace(
  /<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">💰<\/span>/,
  '<article class="ox-feature-card">\n                <span class="ox-feature-emoji" aria-hidden="true">🐷</span>'
);
s = s.replace(
  /<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">📋<\/span>/,
  '<article class="ox-feature-card">\n                <span class="ox-feature-emoji" aria-hidden="true">🔔</span>'
);
s = s.replace(
  /<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">📉<\/span>/,
  '<article class="ox-feature-card">\n                <span class="ox-feature-emoji" aria-hidden="true">📊</span>'
);
s = s.replace(
  /<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">📊<\/span>/,
  '<article class="ox-feature-card">\n                <span class="ox-feature-emoji" aria-hidden="true">📈</span>'
);
s = s.replace(
  /<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">🔔<\/span>/,
  '<article class="ox-feature-card">\n                <span class="ox-feature-emoji" aria-hidden="true">🤖</span>'
);
s = s.replace(
  /<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">🤖<\/span>/,
  '<article class="ox-feature-card">\n                <span class="ox-feature-emoji" aria-hidden="true">🎯</span>'
);

const flyCurrentPat =
  /<a\s*\n\s*href="#pu-top"\s*\n\s*role="menuitem"\s*\n\s*class="apps-flyout__item apps-flyout__item--current"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>\s*\n\s*<a href="#babylog-app"/;

const flyRep = `<a href="#savy-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/savy-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">SAVY</span>
                    <span class="apps-flyout__desc">{{t:nav.savyDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
                <a href="#babylog-app"`;

if (!flyCurrentPat.test(s)) {
  console.error("gen-piggyup-app-inc: flyout current block not found");
  process.exit(1);
}
s = s.replace(flyCurrentPat, flyRep);

// Remove duplicate piggyup link; add current piggyup after petlog
const flyTailPat =
  /(<a href="#petlog-app" role="menuitem" class="apps-flyout__item">[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>)\s*\n\s*<a href="#piggyup-app" role="menuitem" class="apps-flyout__item">[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>/;

const flyTailRep = `$1
                <a
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

if (!flyTailPat.test(s)) {
  console.error("gen-piggyup-app-inc: flyout tail not found");
  process.exit(1);
}
s = s.replace(flyTailPat, flyTailRep);

const mobilePat =
  /<a href="#petlog-app" class="mobile-apps-drawer__item">[\s\S]*?<\/a>\s*\n\s*<a href="#piggyup-app" class="mobile-apps-drawer__item">[\s\S]*?<\/a>\s*\n\s*<\/details>/;

const mobileRep = `<a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerSv}}</span>
              </span>
            </a>
            <a href="#babylog-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/babylog-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">BabyLog</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerBl}}</span>
              </span>
            </a>
            <a href="#petlog-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/petlog-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">PetLog</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerPl}}</span>
              </span>
            </a>
            <a href="#pu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/piggyup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">PiggyUp</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerPu}}</span>
              </span>
            </a>
          </details>`;

// Mobile drawer in savy block may differ — try simpler pattern
const mobileSimplePat =
  /<a href="#pillmate-app" class="mobile-apps-drawer__item">[\s\S]*?<\/a>\s*\n\s*<a href="#pu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>\s*\n\s*<a href="#babylog-app"/;

if (mobileSimplePat.test(s)) {
  const mobileSimpleRep = `<a href="#pillmate-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/pillmate-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">Pillmate</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerPm}}</span>
              </span>
            </a>
            <a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerSv}}</span>
              </span>
            </a>
            <a href="#babylog-app"`;
  s = s.replace(mobileSimplePat, mobileSimpleRep);
} else if (mobilePat.test(s)) {
  s = s.replace(mobilePat, mobileRep);
} else {
  // Full mobile rebuild from pillmate onward
  const mobileFullPat =
    /<a href="#pillmate-app" class="mobile-apps-drawer__item">[\s\S]*?<\/details>/;
  if (!mobileFullPat.test(s)) {
    console.error("gen-piggyup-app-inc: mobile drawer block not found");
    process.exit(1);
  }
  s = s.replace(
    mobileFullPat,
    `<a href="#pillmate-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/pillmate-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">Pillmate</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerPm}}</span>
              </span>
            </a>
            <a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerSv}}</span>
              </span>
            </a>
            <a href="#babylog-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/babylog-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">BabyLog</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerBl}}</span>
              </span>
            </a>
            <a href="#petlog-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/petlog-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">PetLog</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerPl}}</span>
              </span>
            </a>
            <a href="#pu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/piggyup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">PiggyUp</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerPu}}</span>
              </span>
            </a>
          </details>`
  );
}

fs.writeFileSync(path.join(ROOT, "templates", "piggyup-app-inc.html"), s, "utf8");
console.log("gen-piggyup-app-inc: OK → templates/piggyup-app-inc.html");
