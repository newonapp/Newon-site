#!/usr/bin/env node
/** Generates templates/noting-app-inc.html from templates/piggyup-app-inc.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcPath = path.join(ROOT, "templates", "piggyup-app-inc.html");
let s = fs.readFileSync(srcPath, "utf8");

const WEB_CTA = `              <div class="ox-store-release" role="status" aria-live="polite">
                <p class="ox-store-release__label">{{t:nt.webReleaseLabel}}</p>
                <div class="ox-web-cta-wrap">
                  <a
                    class="ox-web-cta btn btn-primary"
                    href="{{html:nt.webUrl}}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="{{t:nt.webCtaAria}}"
                  >{{t:nt.webCtaBtn}}</a>
                </div>
              </div>`;

const FLY_PU_CURRENT = `                <a
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

const FLY_PU_LINK = `                <a href="#piggyup-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/piggyup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">PiggyUp</span>
                    <span class="apps-flyout__desc">{{t:nav.piggyupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

const FLY_NT_CURRENT = `                <a
                  href="#nt-top"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="/noting-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">Noting</span>
                    <span class="apps-flyout__desc">{{t:nav.notingDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

const FLY_NT_LINK = `                <a href="#noting-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/noting-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">Noting</span>
                    <span class="apps-flyout__desc">{{t:nav.notingDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

if (!s.includes(FLY_PU_CURRENT)) {
  console.error("gen-noting-app-inc: piggyup flyout current not found");
  process.exit(1);
}
s = s.replace(FLY_PU_CURRENT + "\n" + FLY_NT_LINK, FLY_PU_LINK + "\n" + FLY_NT_CURRENT);

const MOBILE_PU_CURRENT = `            <a href="#pu-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/piggyup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">PiggyUp</span>
                <span class="mobile-apps-drawer__hint">{{t:pu.drawerPu}}</span>
              </span>
            </a>`;

const MOBILE_PU_LINK = `            <a href="#piggyup-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/piggyup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">PiggyUp</span>
                <span class="mobile-apps-drawer__hint">{{t:nt.drawerPu}}</span>
              </span>
            </a>`;

const MOBILE_NT_CURRENT = `            <a href="#nt-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/noting-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">Noting</span>
                <span class="mobile-apps-drawer__hint">{{t:nt.drawerNt}}</span>
              </span>
            </a>`;

const MOBILE_NT_LINK = `            <a href="#noting-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/noting-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">Noting</span>
                <span class="mobile-apps-drawer__hint">{{t:nav.mobileNotingHint}}</span>
              </span>
            </a>`;

if (s.includes(MOBILE_NT_LINK + "\n" + MOBILE_PU_CURRENT)) {
  s = s.replace(MOBILE_NT_LINK + "\n" + MOBILE_PU_CURRENT, MOBILE_PU_LINK + "\n" + MOBILE_NT_CURRENT);
} else if (s.includes(MOBILE_PU_CURRENT)) {
  s = s.replace(MOBILE_PU_CURRENT, MOBILE_NT_CURRENT);
  if (s.includes(MOBILE_NT_LINK)) {
    s = s.replace(MOBILE_NT_LINK, MOBILE_PU_LINK);
  }
}

s = s.replace(
  'id="piggyup-app" class="ox-page site-shell" data-theme="light" hidden',
  'id="noting-app" class="ox-page site-shell ox-page--noting" data-theme="light" hidden'
);
s = s.replace(/\{\{t:pu\./g, "{{t:nt.");
s = s.replace(/\{\{html:pu\./g, "{{html:nt.");
s = s.replace(/id="pu-/g, 'id="nt-');
s = s.replace(/href="#pu-/g, 'href="#nt-');
s = s.replace(/aria-labelledby="pu-/g, 'aria-labelledby="nt-');
s = s.replace(/apps-trigger-pu/g, "apps-trigger-nt");
s = s.replace(/apps-panel-pu/g, "apps-panel-nt");
s = s.replace(/for="lang-select-pu"/g, 'for="lang-select-nt"');
s = s.replace(/id="lang-select-pu"/g, 'id="lang-select-nt"');
s = s.replace(/id="pu-theme"/g, 'id="nt-theme"');
s = s.replace(/id="pu-nav-toggle"/g, 'id="nt-nav-toggle"');
s = s.replace(/aria-controls="pu-mobile"/g, 'aria-controls="nt-mobile"');
s = s.replace(/id="pu-mobile"/g, 'id="nt-mobile"');
s = s.replace(/\{\{t:pu\.drawer/g, "{{t:nt.drawer");

s = s.replace(
  `<a href="#nt-top" class="navbar-app-showcase" aria-label="{{t:nt.brandAria}}">
              <span class="navbar-app-showcase__icon">
                <img class="navbar-app-showcase__icon-img" src="/piggyup-logo.png" alt="" width="56" height="56" decoding="async" />
              </span>
              <span class="navbar-app-showcase__title">PiggyUp</span>
              <span class="navbar-app-showcase__tagline">{{t:nav.piggyupDesc}}</span>
            </a>`,
  `<a href="#nt-top" class="navbar-app-showcase" aria-label="{{t:nt.brandAria}}">
              <span class="navbar-app-showcase__icon">
                <img class="navbar-app-showcase__icon-img" src="/noting-logo.png" alt="" width="56" height="56" decoding="async" />
              </span>
              <span class="navbar-app-showcase__title">Noting</span>
              <span class="navbar-app-showcase__tagline">{{t:nav.notingDesc}}</span>
            </a>`
);

s = s.replace(
  /src="\/piggyup-logo\.png"\s*\n\s*alt="\{\{t:nt\.heroLogoAlt\}\}"/,
  'src="/noting-logo.png"\n                  alt="{{t:nt.heroLogoAlt}}"'
);

s = s.replace(
  /<div class="ox-store-release" role="status" aria-live="polite">[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n\s*<div class="ox-hero-visual">/,
  WEB_CTA + "\n            </div>\n            <div class=\"ox-hero-visual\">"
);

s = s.replace(/\[\[IMG:pu-showcase-\d+\.png\]\]/g, "/noting-logo.png");

const SHOWCASE_ITEMS = [1, 2, 3, 4, 5, 6]
  .map((n, i) => {
    const loading = i === 0 ? "eager" : "lazy";
    const priority = i === 0 ? "\n                    fetchpriority=\"high\"" : "";
    return `                <figure class="sp-showcase-scroll__item">
                  <img
                    src="/noting-logo.png"
                    alt="{{t:nt.imgShot${n}Alt}}"
                    width="520"
                    height="520"
                    loading="${loading}"
                    decoding="async"${priority}
                  />
                </figure>`;
  })
  .join("\n");

s = s.replace(
  /<div class="sp-showcase-scroll__track">[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<\/section>/,
  `<div class="sp-showcase-scroll__track">\n${SHOWCASE_ITEMS}\n              </div>\n            </div>\n          </div>\n        </section>`
);

const featEmojis = ["📖", "📚", "🏷️", "🔍", "✍️", "🎨", "✨"];
let fi = 0;
s = s.replace(
  /<span class="ox-feature-emoji" aria-hidden="true">[^<]+<\/span>\s*\n\s*<h3>\{\{t:nt\.feat\d+Title\}\}<\/h3>/g,
  () => {
    const em = featEmojis[fi++] || "📖";
    const n = fi;
    return `<span class="ox-feature-emoji" aria-hidden="true">${em}</span>\n                <h3>{{t:nt.feat${n}Title}}</h3>`;
  }
);

s = s.replace(
  /<span class="ox-premium-emoji" aria-hidden="true">🔥<\/span>/,
  '<span class="ox-premium-emoji" aria-hidden="true">📚</span>'
);

s = s.replace(
  /<section class="ox-closing ox-reveal-on-scroll" aria-label="\{\{t:nt\.closingAria\}\}">\s*\n\s*<div class="ox-closing__stack">\{\{html:nt\.closingHtml\}\}<\/div>\s*\n\s*<\/section>/,
  `<section class="ox-closing ox-reveal-on-scroll" aria-label="{{t:nt.closingAria}}">
          <div class="ox-closing__stack">{{html:nt.closingHtml}}</div>
          <p class="ox-closing__cta">
            <a
              class="ox-web-cta btn btn-primary"
              href="{{html:nt.webUrl}}"
              target="_blank"
              rel="noopener noreferrer"
            >{{t:nt.closingCtaBtn}}</a>
          </p>
        </section>`
);

if (!s.includes('id="noting-app"') || !s.includes("ox-web-cta")) {
  console.error("gen-noting-app-inc: validation failed");
  process.exit(1);
}

const showcaseCount = (s.match(/sp-showcase-scroll__item/g) || []).length;
if (showcaseCount !== 6) {
  console.error(`gen-noting-app-inc: expected 6 showcase items, got ${showcaseCount}`);
  process.exit(1);
}

fs.writeFileSync(path.join(ROOT, "templates", "noting-app-inc.html"), s, "utf8");
console.log("gen-noting-app-inc: OK → templates/noting-app-inc.html");
