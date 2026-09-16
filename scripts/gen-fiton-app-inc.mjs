#!/usr/bin/env node
/** Generates templates/fiton-app-inc.html from templates/myworld-app-inc.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let s = fs.readFileSync(path.join(ROOT, "templates", "myworld-app-inc.html"), "utf8");

s = s.replace(/\{\{t:mw\./g, "{{t:fo.");
s = s.replace(/\{\{html:mw\./g, "{{html:fo.");
s = s.replace(/id="mw-/g, 'id="fo-');
s = s.replace(/href="#mw-/g, 'href="#fo-');
s = s.replace(/aria-labelledby="mw-/g, 'aria-labelledby="fo-');
s = s.replace(/id="myworld-app"/g, 'id="fiton-app"');
s = s.replace(/\/myworld-logo\.png/g, "/fiton-logo.png");
s = s.replace(/apps-trigger-mw/g, "apps-trigger-fo");
s = s.replace(/apps-panel-mw/g, "apps-panel-fo");
s = s.replace(/for="lang-select-mw"/g, 'for="lang-select-fo"');
s = s.replace(/id="lang-select-mw"/g, 'id="lang-select-fo"');
s = s.replace(/id="mw-theme"/g, 'id="fo-theme"');
s = s.replace(/id="mw-nav-toggle"/g, 'id="fo-nav-toggle"');
s = s.replace(/aria-controls="mw-mobile"/g, 'aria-controls="fo-mobile"');
s = s.replace(/id="mw-mobile"/g, 'id="fo-mobile"');
s = s.replace(/\{\{t:nav\.myworldDesc\}\}/g, "{{t:nav.fitonDesc}}");
s = s.replace(/\{\{t:nav\.mobileMyworldHint\}\}/g, "{{t:nav.mobileFitonHint}}");
s = s.replace(/\[\[IMG:mw-showcase-/g, "[[IMG:fo-showcase-");
s = s.replace(/href="myworld\/delete-account\/"/g, 'href="fiton/delete-account/"');
s = s.replace(/drawerMw/g, "drawerFo");
s = s.replace(/My World/g, "FitOn");

s = s.replace(
  /<span class="ox-app-intro__title-icon" aria-hidden="true">[^<]+<\/span>/,
  '<span class="ox-app-intro__title-icon" aria-hidden="true">🏃</span>'
);

const featureEmojis = ["🏃", "📊", "🤖", "💬", "🏆", "🎯", "🔥", "🛍️", "📈", "📅"];
let fi = 0;
s = s.replace(
  /<span class="ox-feature-emoji" aria-hidden="true">[^<]+<\/span>\s*\n\s*<h3>\{\{t:fo\.feat/g,
  () =>
    `<span class="ox-feature-emoji" aria-hidden="true">${featureEmojis[fi++ % featureEmojis.length]}</span>\n                <h3>{{t:fo.feat`
);

// Append feature cards 8–10 (MW base has 7)
if (!s.includes("{{t:fo.feat8Title}}")) {
  s = s.replace(
    /(<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">[^<]*<\/span>\s*\n\s*<h3>\{\{t:fo\.feat7Title\}\}<\/h3>\s*\n\s*<p class="ox-feature-lead">\{\{t:fo\.feat7Lead\}\}<\/p>\s*\n\s*<p class="ox-feature-note">\{\{t:fo\.feat7Note\}\}<\/p>\s*\n\s*<\/article>)/,
    `$1
              <article class="ox-feature-card">
                <span class="ox-feature-emoji" aria-hidden="true">🛍️</span>
                <h3>{{t:fo.feat8Title}}</h3>
                <p class="ox-feature-lead">{{t:fo.feat8Lead}}</p>
                <p class="ox-feature-note">{{t:fo.feat8Note}}</p>
              </article>
              <article class="ox-feature-card">
                <span class="ox-feature-emoji" aria-hidden="true">📈</span>
                <h3>{{t:fo.feat9Title}}</h3>
                <p class="ox-feature-lead">{{t:fo.feat9Lead}}</p>
                <p class="ox-feature-note">{{t:fo.feat9Note}}</p>
              </article>
              <article class="ox-feature-card">
                <span class="ox-feature-emoji" aria-hidden="true">📅</span>
                <h3>{{t:fo.feat10Title}}</h3>
                <p class="ox-feature-lead">{{t:fo.feat10Lead}}</p>
                <p class="ox-feature-note">{{t:fo.feat10Note}}</p>
              </article>`
  );
} else if (!s.includes("{{t:fo.feat9Title}}")) {
  s = s.replace(
    /(<article class="ox-feature-card">\s*\n\s*<span class="ox-feature-emoji" aria-hidden="true">[^<]*<\/span>\s*\n\s*<h3>\{\{t:fo\.feat8Title\}\}<\/h3>\s*\n\s*<p class="ox-feature-lead">\{\{t:fo\.feat8Lead\}\}<\/p>\s*\n\s*<p class="ox-feature-note">\{\{t:fo\.feat8Note\}\}<\/p>\s*\n\s*<\/article>)/,
    `$1
              <article class="ox-feature-card">
                <span class="ox-feature-emoji" aria-hidden="true">📈</span>
                <h3>{{t:fo.feat9Title}}</h3>
                <p class="ox-feature-lead">{{t:fo.feat9Lead}}</p>
                <p class="ox-feature-note">{{t:fo.feat9Note}}</p>
              </article>
              <article class="ox-feature-card">
                <span class="ox-feature-emoji" aria-hidden="true">📅</span>
                <h3>{{t:fo.feat10Title}}</h3>
                <p class="ox-feature-lead">{{t:fo.feat10Lead}}</p>
                <p class="ox-feature-note">{{t:fo.feat10Note}}</p>
              </article>`
  );
}

// Remove legacy standalone stats/calendar sections if present in source clone
s = s.replace(
  /\s*<section id="fo-stats" class="ox-section ox-reveal-on-scroll"[\s\S]*?<\/section>\s*(?=\s*<section id="fo-(?:calendar|how)")/,
  "\n"
);
s = s.replace(
  /\s*<section id="fo-calendar" class="ox-section ox-reveal-on-scroll"[\s\S]*?<\/section>\s*(?=\s*<section id="fo-how")/,
  "\n"
);

s = s.replace(
  /(<h2 id="fo-reco-title" class="ox-premium-heading">\s*\n\s*<span class="ox-premium-heading__spark" aria-hidden="true">)[^<]+(<\/span>)/,
  "$1🏃$2"
);

if (!s.includes("{{t:fo.reco8}}")) {
  s = s.replace(
    /(<li>\{\{t:fo\.reco7\}\}<\/li>)\s*\n(\s*<\/ul>)/,
    "$1\n              <li>{{t:fo.reco8}}</li>\n$2"
  );
}

s = s.replace(
  /(<p class="ox-premium-highlight__kicker">\s*\n\s*<span class="ox-premium-emoji" aria-hidden="true">)[^<]+(<\/span>)/,
  "$1🏃$2"
);

const premEmojis = ["🤖", "✨", "💾", "🚫", "🏆", "📊", "💬", "📄"];
{
  let i = 0;
  s = s.replace(
    /(<article class="ox-premium-card">\s*\n\s*<h4 class="ox-premium-card__title">\s*\n\s*<span class="ox-premium-emoji" aria-hidden="true">)[^<]+(<\/span>\s*\n\s*\{\{t:fo\.prem\dTitle\}\})/g,
    (_, a, b) => `${a}${premEmojis[i++ % premEmojis.length]}${b}`
  );
}

// Flyout: current = FitOn; include My World + EatOn as links
const flyCurrent =
  /<a\s*\n\s*href="#fo-top"\s*\n\s*role="menuitem"\s*\n\s*class="apps-flyout__item apps-flyout__item--current"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>(?:\s*\n\s*<a href="#(?:eaton-app|fiton-app|)"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>|\s*\n\s*<a href="[^"]*404-human[^"]*"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>)*/;

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
                <a href="#eaton-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/eaton-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">EatOn</span>
                    <span class="apps-flyout__desc">{{t:nav.eatonDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
                <a
                  href="#fo-top"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="/fiton-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">FitOn</span>
                    <span class="apps-flyout__desc">{{t:nav.fitonDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

if (!flyCurrent.test(s)) {
  console.error("gen-fiton-app-inc: flyout current block not found");
  process.exit(1);
}
s = s.replace(flyCurrent, flyRep);

const mobileCurrent =
  /<a href="#fo-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>(?:\s*\n\s*<a href="#(?:eaton-app|fiton-app)"[\s\S]*?<\/a>|\s*\n\s*<a href="[^"]*404-human[^"]*"[\s\S]*?<\/a>)*\s*\n\s*<\/details>/;

const mobileRep = `<a href="#myworld-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/myworld-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">My World</span>
                <span class="mobile-apps-drawer__hint">{{t:fo.drawerMw}}</span>
              </span>
            </a>
            <a href="#eaton-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/eaton-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">EatOn</span>
                <span class="mobile-apps-drawer__hint">{{t:fo.drawerEo}}</span>
              </span>
            </a>
            <a href="#fo-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/fiton-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">FitOn</span>
                <span class="mobile-apps-drawer__hint">{{t:fo.drawerFo}}</span>
              </span>
            </a>
          </details>`;

if (!mobileCurrent.test(s)) {
  console.error("gen-fiton-app-inc: mobile current block not found");
  process.exit(1);
}
s = s.replace(mobileCurrent, mobileRep);

// Hero: keep My World store-badge layout; only swap the release line to coming soon
s = s.replace(
  /\{\{t:ox\.storeReleaseLine\}\}/g,
  "{{t:fo.comingSoonLabel}}"
);

// Showcase: 5 phone-frame placeholders (screenshots pending)
const showcasePat =
  /<div class="sp-showcase-scroll__track">[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<\/section>/;

const showcaseRep = `<div class="sp-showcase-scroll__track">
                <figure class="sp-showcase-scroll__item">
                  <div class="sp-showcase-soon" role="img" aria-label="{{t:fo.imgShot1Alt}}">
                    <span class="sp-showcase-soon__label">{{t:fo.showcaseSoonLabel}}</span>
                    <span class="sp-showcase-soon__cap">{{t:fo.shot1Cap}}</span>
                  </div>
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <div class="sp-showcase-soon" role="img" aria-label="{{t:fo.imgShot2Alt}}">
                    <span class="sp-showcase-soon__label">{{t:fo.showcaseSoonLabel}}</span>
                    <span class="sp-showcase-soon__cap">{{t:fo.shot2Cap}}</span>
                  </div>
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <div class="sp-showcase-soon" role="img" aria-label="{{t:fo.imgShot3Alt}}">
                    <span class="sp-showcase-soon__label">{{t:fo.showcaseSoonLabel}}</span>
                    <span class="sp-showcase-soon__cap">{{t:fo.shot3Cap}}</span>
                  </div>
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <div class="sp-showcase-soon" role="img" aria-label="{{t:fo.imgShot4Alt}}">
                    <span class="sp-showcase-soon__label">{{t:fo.showcaseSoonLabel}}</span>
                    <span class="sp-showcase-soon__cap">{{t:fo.shot4Cap}}</span>
                  </div>
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <div class="sp-showcase-soon" role="img" aria-label="{{t:fo.imgShot5Alt}}">
                    <span class="sp-showcase-soon__label">{{t:fo.showcaseSoonLabel}}</span>
                    <span class="sp-showcase-soon__cap">{{t:fo.shot5Cap}}</span>
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </section>`;

if (!showcasePat.test(s)) {
  console.error("gen-fiton-app-inc: showcase track not found");
  process.exit(1);
}
s = s.replace(showcasePat, showcaseRep);

// Final CTA: coming soon instead of store buttons
const finalPat =
  /<div class="al-final-cta__actions" role="group" aria-label="\{\{t:fo\.finalCtaAppStore\}\}">[\s\S]*?<\/div>/;

const finalRep = `<p class="al-final-cta__soon">{{t:fo.comingSoonLabel}}</p>`;

if (!finalPat.test(s)) {
  console.error("gen-fiton-app-inc: final CTA actions not found");
  process.exit(1);
}
s = s.replace(finalPat, finalRep);

s = s.replace(
  /(<a[^>]*href="#fo-top"[^>]*apps-flyout__item--current[\s\S]*?<span class="apps-flyout__name">)[^<]+(<\/span>)/,
  "$1FitOn$2"
);
s = s.replace(
  /(<a href="#fo-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current"[\s\S]*?<span class="mobile-apps-drawer__name">)[^<]+(<\/span>)/,
  "$1FitOn$2"
);
s = s.replace(
  /(<a href="#fo-top" class="navbar-app-showcase"[^>]*>\s*<span class="navbar-app-showcase__icon">[\s\S]*?<span class="navbar-app-showcase__title">)[^<]+(<\/span>)/,
  "$1FitOn$2"
);
s = s.replace(/(<p class="al-final-cta__name">)[^<]+(<\/p>)/, "$1FitOn$2");

if (
  !s.includes('id="fiton-app"') ||
  !s.includes('href="#fo-top"') ||
  !s.includes("{{t:fo.comingSoonLabel}}") ||
  !s.includes('class="ox-store-badges"') ||
  !s.includes('class="ox-hero-visual"') ||
  !s.includes('ox-hero-frame--logo') ||
  !s.includes('class="al-final-cta__soon"') ||
  !s.includes("{{t:fo.feat8Title}}") ||
  !s.includes("{{t:fo.feat9Title}}") ||
  !s.includes("{{t:fo.feat10Title}}") ||
  s.includes('id="fo-stats"') ||
  s.includes('id="fo-calendar"') ||
  (s.match(/sp-showcase-scroll__item/g) || []).length !== 5 ||
  (s.match(/sp-showcase-soon/g) || []).length < 5
) {
  console.error("gen-fiton-app-inc: validation failed");
  process.exit(1);
}

fs.writeFileSync(path.join(ROOT, "templates", "fiton-app-inc.html"), s, "utf8");
console.log("gen-fiton-app-inc: OK → templates/fiton-app-inc.html");
