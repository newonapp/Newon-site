#!/usr/bin/env node
/** Generate templates/newon-plus-app-inc.html from goalup template. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let s = fs.readFileSync(path.join(ROOT, "templates", "goalup-app-inc.html"), "utf8");

// Flyout + mobile nav (must run before href="#gu-" → "#np-" rewrite)
const flyCurrent =
  /<a\s*\n\s*href="#gu-top"[\s\S]*?class="apps-flyout__item apps-flyout__item--current"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>\s*\n\s*<a href="#countup-app" role="menuitem" class="apps-flyout__item">[\s\S]*?<\/a>\s*\n\s*(?:<a href="#newon-plus-app" role="menuitem" class="apps-flyout__item">[\s\S]*?<\/a>\s*\n\s*)?/;

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
                <a href="#countup-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/countup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">CountUp</span>
                    <span class="apps-flyout__desc">{{t:nav.countupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
                <a
                  href="#np-top"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="/newon-plus-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">Newon</span>
                    <span class="apps-flyout__desc">{{t:nav.newonPlusDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

if (!flyCurrent.test(s)) {
  console.error("gen-newon-plus-app-inc: flyout block not found");
  process.exit(1);
}
s = s.replace(flyCurrent, flyRep);

const mobilePat =
  /<a href="#gu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>\s*\n\s*<a href="#countup-app" class="mobile-apps-drawer__item">[\s\S]*?<\/a>\s*\n\s*(?:<a href="#newon-plus-app" class="mobile-apps-drawer__item">[\s\S]*?<\/a>\s*\n\s*)?/;

const mobileRep = `<a href="#goalup-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/goalup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">GoalUp</span>
                <span class="mobile-apps-drawer__hint">{{t:np.drawerGu}}</span>
              </span>
            </a>
            <a href="#countup-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/countup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">CountUp</span>
                <span class="mobile-apps-drawer__hint">{{t:np.drawerCu}}</span>
              </span>
            </a>
            <a href="#np-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/newon-plus-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">Newon</span>
                <span class="mobile-apps-drawer__hint">{{t:np.drawerNp}}</span>
              </span>
            </a>`;

if (!mobilePat.test(s)) {
  console.error("gen-newon-plus-app-inc: mobile block not found");
  process.exit(1);
}
s = s.replace(mobilePat, mobileRep);

s = s.replace(/\{\{t:gu\./g, "{{t:np.");
s = s.replace(/\{\{html:gu\./g, "{{html:np.");
s = s.replace(/id="gu-/g, 'id="np-');
s = s.replace(/href="#gu-/g, 'href="#np-');
s = s.replace(/aria-labelledby="gu-/g, 'aria-labelledby="np-');
s = s.replace(/id="goalup-app"/g, 'id="newon-plus-app"');
s = s.replace(/\/goalup-logo\.png/g, "/newon-plus-logo.png");
s = s.replace(/apps-trigger-gu/g, "apps-trigger-np");
s = s.replace(/apps-panel-gu/g, "apps-panel-np");
s = s.replace(/for="lang-select-gu"/g, 'for="lang-select-np"');
s = s.replace(/id="lang-select-gu"/g, 'id="lang-select-np"');
s = s.replace(/id="gu-theme"/g, 'id="np-theme"');
s = s.replace(/id="gu-nav-toggle"/g, 'id="np-nav-toggle"');
s = s.replace(/aria-controls="gu-mobile"/g, 'aria-controls="np-mobile"');
s = s.replace(/id="gu-mobile"/g, 'id="np-mobile"');
s = s.replace(/<span class="navbar-app-showcase__title">GoalUp<\/span>/g, '<span class="navbar-app-showcase__title">Newon</span>');
s = s.replace(
  /<span class="navbar-app-showcase__tagline">\{\{t:nav\.goalupDesc\}\}<\/span>/g,
  '<span class="navbar-app-showcase__tagline">{{t:nav.newonPlusDesc}}</span>'
);
s = s.replace(/\{\{t:gu\.drawer/g, "{{t:np.drawer");

// Remove duplicate #top / #newon-plus-app mobile links on this page
s = s.replace(/<a href="#top" class="mobile-apps-drawer__item">[\s\S]*?\{\{t:nav\.mobileNewonPlusHint\}\}[\s\S]*?<\/a>\s*\n\s*/g, "");
s = s.replace(
  /<a href="#newon-plus-app" class="mobile-apps-drawer__item">\s*\n\s*<span class="mobile-apps-drawer__icon">[\s\S]*?\{\{t:nav\.mobileNewonPlusHint\}\}[\s\S]*?<\/a>\s*\n\s*(?=<a href="#np-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">)/g,
  ""
);

// Hero summary line breaks (match GoalUp layout)
s = s.replace(
  '<p class="ox-hero-reach-summary">{{t:np.heroReachSummary}}</p>',
  '<p class="ox-hero-reach-summary">{{html:np.heroReachSummaryHtml}}</p>'
);

// Remove 7th feature card
s = s.replace(
  /\s*<article class="ox-feature-card">\s*<span class="ox-feature-emoji" aria-hidden="true">🎯<\/span>\s*<h3>\{\{t:np\.feat7Title\}\}<\/h3>[\s\S]*?<\/article>/,
  ""
);

// Replace showcase with 5 Korean app screenshots
const showcasePat = /<section\s*\n\s*id="np-showcase-scroll"[\s\S]*?<\/section>\s*\n\s*<section id="np-features"/;
const showcaseRep = `<section
          id="np-showcase-scroll"
          class="ox-section ox-reveal-on-scroll"
          aria-label="{{t:np.showcaseCollageAria}}"
        >
          <div class="ox-container">
            <div class="sp-showcase-scroll" tabindex="0">
              <div class="sp-showcase-scroll__track">
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:np-showcase-01.png]]"
                    alt="{{t:np.imgShot1Alt}}"
                    width="576"
                    height="1024"
                    loading="eager"
                    decoding="async"
                    fetchpriority="high"
                  />
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:np-showcase-02.png]]"
                    alt="{{t:np.imgShot2Alt}}"
                    width="576"
                    height="1024"
                    loading="eager"
                    decoding="async"
                  />
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:np-showcase-03.png]]"
                    alt="{{t:np.imgShot3Alt}}"
                    width="576"
                    height="1024"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:np-showcase-04.png]]"
                    alt="{{t:np.imgShot4Alt}}"
                    width="576"
                    height="1024"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:np-showcase-05.png]]"
                    alt="{{t:np.imgShot5Alt}}"
                    width="576"
                    height="1024"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>

        <section id="np-features"`;

if (!showcasePat.test(s)) {
  console.error("gen-newon-plus-app-inc: showcase section not found");
  process.exit(1);
}
s = s.replace(showcasePat, showcaseRep);

// Update feature emojis
s = s.replace(
  `<article class="ox-feature-card">
                <span class="ox-feature-emoji" aria-hidden="true">🔥</span>
                <h3>{{t:np.feat1Title}}</h3>`,
  `<article class="ox-feature-card">
                <span class="ox-feature-emoji" aria-hidden="true">📦</span>
                <h3>{{t:np.feat1Title}}</h3>`
);
s = s.replace(
  `<span class="ox-feature-emoji" aria-hidden="true">🏆</span>
                <h3>{{t:np.feat2Title}}</h3>`,
  `<span class="ox-feature-emoji" aria-hidden="true">⭐</span>
                <h3>{{t:np.feat2Title}}</h3>`
);
s = s.replace(
  `<span class="ox-feature-emoji" aria-hidden="true">🔔</span>
                <h3>{{t:np.feat3Title}}</h3>`,
  `<span class="ox-feature-emoji" aria-hidden="true">🔄</span>
                <h3>{{t:np.feat3Title}}</h3>`
);
s = s.replace(
  `<span class="ox-feature-emoji" aria-hidden="true">📈</span>
                <h3>{{t:np.feat5Title}}</h3>`,
  `<span class="ox-feature-emoji" aria-hidden="true">🌎</span>
                <h3>{{t:np.feat5Title}}</h3>`
);
s = s.replace(
  `<span class="ox-feature-emoji" aria-hidden="true">🤖</span>
                <h3>{{t:np.feat6Title}}</h3>`,
  `<span class="ox-feature-emoji" aria-hidden="true">🔒</span>
                <h3>{{t:np.feat6Title}}</h3>`
);

// Premium card emojis
s = s.replace(
  `<span class="ox-premium-emoji" aria-hidden="true">🎯
                      {{t:np.prem3Title}}`,
  `<span class="ox-premium-emoji" aria-hidden="true">🔓</span>
                      {{t:np.prem3Title}}`
);
s = s.replace(
  `<span class="ox-premium-emoji" aria-hidden="true">📈</span>
                      {{t:np.prem4Title}}`,
  `<span class="ox-premium-emoji" aria-hidden="true">☁️</span>
                      {{t:np.prem4Title}}`
);

// Hide intro closing if empty
s = s.replace(
  `<p class="ox-app-intro__closing">{{t:np.introClosing}}</p>`,
  `{{html:np.introClosingBlock}}`
);

// Remove duplicate/broken flyout tail after np-top current
s = s.replace(
  /(<a\s*\n\s*href="#np-top"[\s\S]*?apps-flyout__item--current"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>) role="menuitem" class="apps-flyout__item">[\s\S]*?(?=<\/div>\s*\n\s*<\/div>\s*\n\s*<\/nav>)/,
  "$1\n                "
);
s = s.replace(
  /(<a href="#np-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>)<\/details>/,
  "$1\n          </details>"
);

// Closing highlight emoji + html subline
s = s.replace(
  /(<section\s*\n\s*id="np-closing-highlight"[\s\S]*?<span class="ox-premium-emoji" aria-hidden="true">)[^<]+(<\/span>)/,
  "$1📦$2"
);
s = s.replace("{{t:np.premHiSub}}", "{{html:np.premHiSub}}");

// Keep GoalUp icons in app-menu links after global logo swap
s = s.replace(
  /(<a href="#goalup-app"[\s\S]*?<img src=")\/newon-plus-logo\.png/g,
  "$1/goalup-logo.png"
);

// Remove duplicate mobile Newon link on this page (keep #np-top current only)
s = s.replace(
  /<a href="#newon-plus-app" class="mobile-apps-drawer__item">[\s\S]*?\{\{t:nav\.mobileNewonPlusHint\}\}[\s\S]*?<\/a>\s*\n\s*(?=<a href="#np-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">)/g,
  ""
);

s = s.replace(/href="goalup\/delete-account\/"/g, 'href="newon/delete-account/"');

fs.writeFileSync(path.join(ROOT, "templates", "newon-plus-app-inc.html"), s, "utf8");
console.log("gen-newon-plus-app-inc: OK");
