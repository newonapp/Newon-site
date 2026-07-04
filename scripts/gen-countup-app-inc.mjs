#!/usr/bin/env node
/** Generates templates/countup-app-inc.html from templates/goalup-app-inc.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let s = fs.readFileSync(path.join(ROOT, "templates", "goalup-app-inc.html"), "utf8");

s = s.replace(/\{\{t:gu\./g, "{{t:cu.");
s = s.replace(/\{\{html:gu\./g, "{{html:cu.");
s = s.replace(/id="gu-/g, 'id="cu-');
s = s.replace(/href="#gu-/g, 'href="#cu-');
s = s.replace(/aria-labelledby="gu-/g, 'aria-labelledby="cu-');
s = s.replace(/id="goalup-app"/g, 'id="countup-app"');
s = s.replace(/\/goalup-logo\.png/g, "/countup-logo.png");
s = s.replace(/apps-trigger-gu/g, "apps-trigger-cu");
s = s.replace(/apps-panel-gu/g, "apps-panel-cu");
s = s.replace(/for="lang-select-gu"/g, 'for="lang-select-cu"');
s = s.replace(/id="lang-select-gu"/g, 'id="lang-select-cu"');
s = s.replace(/id="gu-theme"/g, 'id="cu-theme"');
s = s.replace(/id="gu-nav-toggle"/g, 'id="cu-nav-toggle"');
s = s.replace(/aria-controls="gu-mobile"/g, 'aria-controls="cu-mobile"');
s = s.replace(/id="gu-mobile"/g, 'id="cu-mobile"');
s = s.replace(/<span class="apps-flyout__name">GoalUp<\/span>/g, '<span class="apps-flyout__name">CountUp</span>');
s = s.replace(/<span class="navbar-app-showcase__title">GoalUp<\/span>/g, '<span class="navbar-app-showcase__title">CountUp</span>');
s = s.replace(/\{\{t:nav\.goalupDesc\}\}/g, "{{t:nav.countupDesc}}");
s = s.replace(/\{\{t:gu\.drawer/g, "{{t:cu.drawer");
s = s.replace(/<span class="mobile-apps-drawer__name">GoalUp<\/span>/g, '<span class="mobile-apps-drawer__name">CountUp</span>');
s = s.replace(/\{\{t:nav\.mobileGoalupHint\}\}/g, "{{t:nav.mobileCountupHint}}");

// Flyout: goalup current + countup link → goalup link + countup current
const flyPat =
  /<a\s*\n\s*href="#cu-top"\s*\n\s*role="menuitem"\s*\n\s*class="apps-flyout__item apps-flyout__item--current"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>\s*\n\s*<a href="#countup-app"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>/;

const flyRep = `<a href="#goalup-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/goalup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">GoalUp</span>
                    <span class="apps-flyout__desc">{{t:nav.goalupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
                <a
                  href="#cu-top"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="/countup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">CountUp</span>
                    <span class="apps-flyout__desc">{{t:nav.countupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

if (!flyPat.test(s)) {
  console.error("gen-countup-app-inc: flyout block not found");
  process.exit(1);
}
s = s.replace(flyPat, flyRep);

// Mobile drawer
const mobilePat =
  /<a href="#cu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>\s*\n\s*<a href="#countup-app"[\s\S]*?<\/a>\s*\n\s*<\/details>/;

const mobileRep = `<a href="#goalup-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/goalup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">GoalUp</span>
                <span class="mobile-apps-drawer__hint">{{t:cu.drawerGu}}</span>
              </span>
            </a>
            <a href="#cu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/countup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">CountUp</span>
                <span class="mobile-apps-drawer__hint">{{t:cu.drawerCu}}</span>
              </span>
            </a>
          </details>`;

if (!mobilePat.test(s)) {
  console.error("gen-countup-app-inc: mobile block not found");
  process.exit(1);
}
s = s.replace(mobilePat, mobileRep);

// Feature emojis
const featureEmojis = ["🔢", "🎯", "🔥", "🔔", "📊", "📈", "🤖"];
let fi = 0;
s = s.replace(
  /<span class="ox-feature-emoji" aria-hidden="true">[^<]+<\/span>\s*\n\s*<h3>\{\{t:cu\.feat/g,
  () =>
    `<span class="ox-feature-emoji" aria-hidden="true">${featureEmojis[fi++]}</span>\n                <h3>{{t:cu.feat`
);

// Reco heading emoji
s = s.replace(
  /<span class="ox-premium-heading__spark" aria-hidden="true">🎯<\/span>\s*\n\s*\{\{t:cu\.recoTitle\}\}/,
  '<span class="ox-premium-heading__spark" aria-hidden="true">🔢</span>\n              {{t:cu.recoTitle}}'
);

// Premium: fix prem3 span + add prem5 widget + prem6 ads
const premFrom3 =
  /<article class="ox-premium-card">\s*\n\s*<h4 class="ox-premium-card__title">\s*\n\s*<span class="ox-premium-emoji" aria-hidden="true">🎯[\s\S]*?<\/article>\s*\n\s*<\/div>\s*\n\s*<\/section>/;

const premRep = `<article class="ox-premium-card">
                    <h4 class="ox-premium-card__title">
                      <span class="ox-premium-emoji" aria-hidden="true">🎯</span>
                      {{t:cu.prem3Title}}
                    </h4>
                    <p class="ox-premium-card__lead">{{t:cu.prem3Lead}}</p>
                    <p class="ox-premium-card__note">{{t:cu.prem3Note}}</p>
                  </article>
                  <article class="ox-premium-card">
                    <h4 class="ox-premium-card__title">
                      <span class="ox-premium-emoji" aria-hidden="true">📈</span>
                      {{t:cu.prem4Title}}
                    </h4>
                    <p class="ox-premium-card__lead">{{t:cu.prem4Lead}}</p>
                    <p class="ox-premium-card__note">{{t:cu.prem4Note}}</p>
                  </article>
                  <article class="ox-premium-card">
                    <h4 class="ox-premium-card__title">
                      <span class="ox-premium-emoji" aria-hidden="true">🧩</span>
                      {{t:cu.prem5Title}}
                    </h4>
                    <p class="ox-premium-card__lead">{{t:cu.prem5Lead}}</p>
                    <p class="ox-premium-card__note">{{t:cu.prem5Note}}</p>
                  </article>
                  <article class="ox-premium-card">
                    <h4 class="ox-premium-card__title">
                      <span class="ox-premium-emoji" aria-hidden="true">🚫</span>
                      {{t:cu.prem6Title}}
                    </h4>
                    <p class="ox-premium-card__lead">{{t:cu.prem6Lead}}</p>
                    <p class="ox-premium-card__note">{{t:cu.prem6Note}}</p>
                  </article>
                </div>
              </section>`;

if (!premFrom3.test(s)) {
  console.error("gen-countup-app-inc: premium block not found");
  process.exit(1);
}
s = s.replace(premFrom3, premRep);

s = s.replace(/\[\[IMG:gu-showcase-\d+\.png\]\]/g, "/countup-logo.png");
s = s.replace(/src="\/goalup-logo\.png"/g, 'src="/countup-logo.png"');
s = s.replace(
  /(<a href="#goalup-app" role="menuitem" class="apps-flyout__item">[\s\S]*?<img src=")\/countup-logo\.png/g,
  "$1/goalup-logo.png"
);
s = s.replace(
  /(<a href="#piggyup-app" role="menuitem" class="apps-flyout__item">[\s\S]*?<img src=")\/countup-logo\.png/g,
  "$1/piggyup-logo.png"
);
s = s.replace(
  /(<a href="#goalup-app" class="mobile-apps-drawer__item">[\s\S]*?<img src=")\/countup-logo\.png/g,
  "$1/goalup-logo.png"
);
s = s.replace(
  /(<a href="#piggyup-app" class="mobile-apps-drawer__item">[\s\S]*?<img src=")\/countup-logo\.png/g,
  "$1/piggyup-logo.png"
);

if (!s.includes('id="countup-app"')) {
  console.error("gen-countup-app-inc: validation failed");
  process.exit(1);
}

fs.writeFileSync(path.join(ROOT, "templates", "countup-app-inc.html"), s, "utf8");
console.log("gen-countup-app-inc: OK → templates/countup-app-inc.html");
