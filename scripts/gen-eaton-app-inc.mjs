#!/usr/bin/env node
/** Generates templates/eaton-app-inc.html from templates/myworld-app-inc.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let s = fs.readFileSync(path.join(ROOT, "templates", "myworld-app-inc.html"), "utf8");

s = s.replace(/\{\{t:mw\./g, "{{t:eo.");
s = s.replace(/\{\{html:mw\./g, "{{html:eo.");
s = s.replace(/id="mw-/g, 'id="eo-');
s = s.replace(/href="#mw-/g, 'href="#eo-');
s = s.replace(/aria-labelledby="mw-/g, 'aria-labelledby="eo-');
s = s.replace(/id="myworld-app"/g, 'id="eaton-app"');
s = s.replace(/\/myworld-logo\.png/g, "/eaton-logo.png");
s = s.replace(/apps-trigger-mw/g, "apps-trigger-eo");
s = s.replace(/apps-panel-mw/g, "apps-panel-eo");
s = s.replace(/for="lang-select-mw"/g, 'for="lang-select-eo"');
s = s.replace(/id="lang-select-mw"/g, 'id="lang-select-eo"');
s = s.replace(/id="mw-theme"/g, 'id="eo-theme"');
s = s.replace(/id="mw-nav-toggle"/g, 'id="eo-nav-toggle"');
s = s.replace(/aria-controls="mw-mobile"/g, 'aria-controls="eo-mobile"');
s = s.replace(/id="mw-mobile"/g, 'id="eo-mobile"');
s = s.replace(/\{\{t:nav\.myworldDesc\}\}/g, "{{t:nav.eatonDesc}}");
s = s.replace(/\{\{t:nav\.mobileMyworldHint\}\}/g, "{{t:nav.mobileEatonHint}}");
s = s.replace(/\[\[IMG:mw-showcase-/g, "[[IMG:eo-showcase-");
s = s.replace(/href="myworld\/delete-account\/"/g, 'href="eaton/delete-account/"');
s = s.replace(/drawerMw/g, "drawerEo");
s = s.replace(/My World/g, "EatOn");

s = s.replace(
  /<span class="ox-app-intro__title-icon" aria-hidden="true">[^<]+<\/span>/,
  '<span class="ox-app-intro__title-icon" aria-hidden="true">🍴</span>'
);

const featureEmojis = ["🍳", "▶️", "🤖", "🛒", "🍽️", "🛵", "🔎"];
let fi = 0;
s = s.replace(
  /<span class="ox-feature-emoji" aria-hidden="true">[^<]+<\/span>\s*\n\s*<h3>\{\{t:eo\.feat/g,
  () =>
    `<span class="ox-feature-emoji" aria-hidden="true">${featureEmojis[fi++ % featureEmojis.length]}</span>\n                <h3>{{t:eo.feat`
);

s = s.replace(
  /(<h2 id="eo-reco-title" class="ox-premium-heading">\s*\n\s*<span class="ox-premium-heading__spark" aria-hidden="true">)[^<]+(<\/span>)/,
  "$1🍴$2"
);

// Keep MW 7-item reco list shape; append 8th EatOn recommendation.
if (!s.includes("{{t:eo.reco8}}")) {
  s = s.replace(
    /(<li>\{\{t:eo\.reco7\}\}<\/li>)\s*\n(\s*<\/ul>)/,
    "$1\n              <li>{{t:eo.reco8}}</li>\n$2"
  );
}

s = s.replace(
  /(<p class="ox-premium-highlight__kicker">\s*\n\s*<span class="ox-premium-emoji" aria-hidden="true">)[^<]+(<\/span>)/,
  "$1🍴$2"
);

const premEmojis = ["🤖", "✨", "💾", "🚫", "📊", "📚", "☁️", "📄"];
{
  let i = 0;
  s = s.replace(
    /(<article class="ox-premium-card">\s*\n\s*<h4 class="ox-premium-card__title">\s*\n\s*<span class="ox-premium-emoji" aria-hidden="true">)[^<]+(<\/span>\s*\n\s*\{\{t:eo\.prem\dTitle\}\})/g,
    (_, a, b) => `${a}${premEmojis[i++ % premEmojis.length]}${b}`
  );
}

// Flyout: after mw→eo rewrite, former My World "current" item is EatOn on #eo-top.
// Rebuild trailing items as My World (link) + EatOn (current). Drop any trailing
// EatOn / 404 duplicate that may already exist from a prior nav patch.
const flyCurrent =
  /<a\s*\n\s*href="#eo-top"\s*\n\s*role="menuitem"\s*\n\s*class="apps-flyout__item apps-flyout__item--current"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>(?:\s*\n\s*<a href="#(?:eaton-app|)"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>|\s*\n\s*<a href="[^"]*404-human[^"]*"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>)*/;

const flyRep = `<a href="#myworld-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/myworld-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">My World</span>
                    <span class="apps-flyout__desc">{{t:nav.myworldDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
                <a
                  href="#eo-top"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="/eaton-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">EatOn</span>
                    <span class="apps-flyout__desc">{{t:nav.eatonDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

if (!flyCurrent.test(s)) {
  console.error("gen-eaton-app-inc: flyout current block not found");
  process.exit(1);
}
s = s.replace(flyCurrent, flyRep);

// Mobile drawer: same reshape
const mobileCurrent =
  /<a href="#eo-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>(?:\s*\n\s*<a href="#eaton-app"[\s\S]*?<\/a>|\s*\n\s*<a href="[^"]*404-human[^"]*"[\s\S]*?<\/a>)*\s*\n\s*<\/details>/;

const mobileRep = `<a href="#myworld-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/myworld-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">My World</span>
                <span class="mobile-apps-drawer__hint">{{t:eo.drawerMw}}</span>
              </span>
            </a>
            <a href="#eo-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/eaton-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">EatOn</span>
                <span class="mobile-apps-drawer__hint">{{t:eo.drawerEo}}</span>
              </span>
            </a>
          </details>`;

if (!mobileCurrent.test(s)) {
  console.error("gen-eaton-app-inc: mobile current block not found");
  process.exit(1);
}
s = s.replace(mobileCurrent, mobileRep);

// Hero: keep My World store-badge layout; only swap the release line to coming soon
s = s.replace(
  /\{\{t:ox\.storeReleaseLine\}\}/g,
  "{{t:eo.comingSoonLabel}}"
);

// Showcase: 4 phone-frame placeholders (screenshots pending)
const showcasePat =
  /<div class="sp-showcase-scroll__track">[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<\/section>/;

const showcaseRep = `<div class="sp-showcase-scroll__track">
                <figure class="sp-showcase-scroll__item">
                  <div class="sp-showcase-soon" role="img" aria-label="{{t:eo.imgShot1Alt}}">
                    <span class="sp-showcase-soon__label">{{t:eo.showcaseSoonLabel}}</span>
                    <span class="sp-showcase-soon__cap">{{t:eo.shot1Cap}}</span>
                  </div>
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <div class="sp-showcase-soon" role="img" aria-label="{{t:eo.imgShot2Alt}}">
                    <span class="sp-showcase-soon__label">{{t:eo.showcaseSoonLabel}}</span>
                    <span class="sp-showcase-soon__cap">{{t:eo.shot2Cap}}</span>
                  </div>
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <div class="sp-showcase-soon" role="img" aria-label="{{t:eo.imgShot3Alt}}">
                    <span class="sp-showcase-soon__label">{{t:eo.showcaseSoonLabel}}</span>
                    <span class="sp-showcase-soon__cap">{{t:eo.shot3Cap}}</span>
                  </div>
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <div class="sp-showcase-soon" role="img" aria-label="{{t:eo.imgShot4Alt}}">
                    <span class="sp-showcase-soon__label">{{t:eo.showcaseSoonLabel}}</span>
                    <span class="sp-showcase-soon__cap">{{t:eo.shot4Cap}}</span>
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </section>`;

if (!showcasePat.test(s)) {
  console.error("gen-eaton-app-inc: showcase track not found");
  process.exit(1);
}
s = s.replace(showcasePat, showcaseRep);

// Final CTA: coming soon instead of store buttons
const finalPat =
  /<div class="al-final-cta__actions" role="group" aria-label="\{\{t:eo\.finalCtaAppStore\}\}">[\s\S]*?<\/div>/;

const finalRep = `<p class="al-final-cta__soon">{{t:eo.comingSoonLabel}}</p>`;

if (!finalPat.test(s)) {
  console.error("gen-eaton-app-inc: final CTA actions not found");
  process.exit(1);
}
s = s.replace(finalPat, finalRep);

// Ensure EatOn is labeled correctly on the current nav rows
s = s.replace(
  /(<a[^>]*href="#eo-top"[^>]*apps-flyout__item--current[\s\S]*?<span class="apps-flyout__name">)[^<]+(<\/span>)/,
  "$1EatOn$2"
);
s = s.replace(
  /(<a href="#eo-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current"[\s\S]*?<span class="mobile-apps-drawer__name">)[^<]+(<\/span>)/,
  "$1EatOn$2"
);
s = s.replace(
  /(<a href="#eo-top" class="navbar-app-showcase"[^>]*>\s*<span class="navbar-app-showcase__icon">[\s\S]*?<span class="navbar-app-showcase__title">)[^<]+(<\/span>)/,
  "$1EatOn$2"
);
s = s.replace(
  /(<p class="al-final-cta__name">)[^<]+(<\/p>)/,
  "$1EatOn$2"
);

if (
  !s.includes('id="eaton-app"') ||
  !s.includes('href="#eo-top"') ||
  !s.includes("{{t:eo.comingSoonLabel}}") ||
  !s.includes('class="ox-store-badges"') ||
  !s.includes('class="ox-hero-visual"') ||
  !s.includes('ox-hero-frame--logo') ||
  !s.includes('class="al-final-cta__soon"') ||
  (s.match(/sp-showcase-scroll__item/g) || []).length !== 4 ||
  (s.match(/sp-showcase-soon/g) || []).length < 4
) {
  console.error("gen-eaton-app-inc: validation failed");
  process.exit(1);
}

fs.writeFileSync(path.join(ROOT, "templates", "eaton-app-inc.html"), s, "utf8");
console.log("gen-eaton-app-inc: OK → templates/eaton-app-inc.html");
