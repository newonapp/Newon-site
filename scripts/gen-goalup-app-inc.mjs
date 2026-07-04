#!/usr/bin/env node
/** Generates templates/goalup-app-inc.html from templates/piggyup-app-inc.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let s = fs.readFileSync(path.join(ROOT, "templates", "piggyup-app-inc.html"), "utf8");

s = s.replace(/\{\{t:pu\./g, "{{t:gu.");
s = s.replace(/\{\{html:pu\./g, "{{html:gu.");
s = s.replace(/id="pu-/g, 'id="gu-');
s = s.replace(/href="#pu-/g, 'href="#gu-');
s = s.replace(/aria-labelledby="pu-/g, 'aria-labelledby="gu-');
s = s.replace(/id="piggyup-app"/g, 'id="goalup-app"');
s = s.replace(/\/piggyup-logo\.png/g, "/goalup-logo.png");
s = s.replace(/apps-trigger-pu/g, "apps-trigger-gu");
s = s.replace(/apps-panel-pu/g, "apps-panel-gu");
s = s.replace(/for="lang-select-pu"/g, 'for="lang-select-gu"');
s = s.replace(/id="lang-select-pu"/g, 'id="lang-select-gu"');
s = s.replace(/id="pu-theme"/g, 'id="gu-theme"');
s = s.replace(/id="pu-nav-toggle"/g, 'id="gu-nav-toggle"');
s = s.replace(/aria-controls="pu-mobile"/g, 'aria-controls="gu-mobile"');
s = s.replace(/id="pu-mobile"/g, 'id="gu-mobile"');
s = s.replace(/<span class="apps-flyout__name">PiggyUp<\/span>/g, '<span class="apps-flyout__name">GoalUp</span>');
s = s.replace(/<span class="navbar-app-showcase__title">PiggyUp<\/span>/g, '<span class="navbar-app-showcase__title">GoalUp</span>');
s = s.replace(/\{\{t:nav\.piggyupDesc\}\}/g, "{{t:nav.goalupDesc}}");
s = s.replace(/\{\{t:pu\.drawer/g, "{{t:gu.drawer");
s = s.replace(/<span class="mobile-apps-drawer__name">PiggyUp<\/span>/g, '<span class="mobile-apps-drawer__name">GoalUp</span>');
s = s.replace(/\{\{t:nav\.mobilePiggyupHint\}\}/g, "{{t:nav.mobileGoalupHint}}");

// Flyout: piggyup current → piggyup link + goalup current + countup link
const flyCurrentPat =
  /<a\s*\n\s*href="#gu-top"\s*\n\s*role="menuitem"\s*\n\s*class="apps-flyout__item apps-flyout__item--current"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>\s*\n\s*<a href="#goalup-app"/;

const flyRep = `<a href="#piggyup-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/piggyup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">PiggyUp</span>
                    <span class="apps-flyout__desc">{{t:nav.piggyupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
                <a
                  href="#gu-top"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="/goalup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">GoalUp</span>
                    <span class="apps-flyout__desc">{{t:nav.goalupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
                <a href="#countup-app"`;

if (!flyCurrentPat.test(s)) {
  console.error("gen-goalup-app-inc: flyout current block not found");
  process.exit(1);
}
s = s.replace(flyCurrentPat, flyRep);

// Remove duplicate goalup link after countup block start was wrong - fix double goalup
s = s.replace(
  /<a href="#countup-app" role="menuitem" class="apps-flyout__item">\s*\n\s*<span class="apps-flyout__icon">\s*\n\s*<img src="\/goalup-logo\.png"[\s\S]*?<\/a>\s*\n\s*<a href="#countup-app"/,
  '<a href="#countup-app"'
);

// Mobile: pu-top current → piggyup link + gu current + countup
const mobilePat =
  /<a href="#gu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>\s*\n\s*<a href="#goalup-app"/;

const mobileRep = `<a href="#piggyup-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/piggyup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">PiggyUp</span>
                <span class="mobile-apps-drawer__hint">{{t:gu.drawerPu}}</span>
              </span>
            </a>
            <a href="#gu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/goalup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">GoalUp</span>
                <span class="mobile-apps-drawer__hint">{{t:gu.drawerGu}}</span>
              </span>
            </a>
            <a href="#countup-app"`;

if (!mobilePat.test(s)) {
  console.error("gen-goalup-app-inc: mobile current block not found");
  process.exit(1);
}
s = s.replace(mobilePat, mobileRep);

s = s.replace(
  /<a href="#countup-app" class="mobile-apps-drawer__item">[\s\S]*?mobileGoalupHint[\s\S]*?<\/a>\s*\n\s*<a href="#countup-app"/,
  '<a href="#countup-app"'
);

// Feature emojis
const emojiReplacements = [
  [/<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">💸<\/span>/, "🎯"],
  [/<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">🐷<\/span>/, "🏆"],
  [/<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">🔔<\/span>/, "🔔"],
  [/<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">📊<\/span>/, "📊"],
  [/<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">📈<\/span>/, "📈"],
  [/<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">🤖<\/span>/, "🤖"],
  [/<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">🎯<\/span>/, "🔥"],
];
for (const [re, emoji] of emojiReplacements) {
  s = s.replace(re, `<article class="ox-feature-card">\n                <span class="ox-feature-emoji" aria-hidden="true">${emoji}</span>`);
}

// Premium prem3 emoji 🎯 instead of 🔔
s = s.replace(
  /<article class="ox-premium-card">\s*\n\s*<h4 class="ox-premium-card__title">\s*\n\s*<span class="ox-premium-emoji" aria-hidden="true">🔔<\/span>/,
  `<article class="ox-premium-card">
                    <h4 class="ox-premium-card__title">
                      <span class="ox-premium-emoji" aria-hidden="true">🎯`
);

s = s.replace(/\[\[IMG:pu-showcase-(\d+)\.png\]\]/g, "[[IMG:gu-showcase-$1.png]]");

if (!s.includes('id="goalup-app"') || !s.includes("ox-store-badge")) {
  console.error("gen-goalup-app-inc: validation failed");
  process.exit(1);
}

fs.writeFileSync(path.join(ROOT, "templates", "goalup-app-inc.html"), s, "utf8");
console.log("gen-goalup-app-inc: OK → templates/goalup-app-inc.html");
