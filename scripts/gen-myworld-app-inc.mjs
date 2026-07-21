#!/usr/bin/env node
/** Generates templates/myworld-app-inc.html from templates/countup-app-inc.html */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let s = fs.readFileSync(path.join(ROOT, "templates", "countup-app-inc.html"), "utf8");

s = s.replace(/\{\{t:cu\./g, "{{t:mw.");
s = s.replace(/\{\{html:cu\./g, "{{html:mw.");
s = s.replace(/id="cu-/g, 'id="mw-');
s = s.replace(/href="#cu-/g, 'href="#mw-');
s = s.replace(/aria-labelledby="cu-/g, 'aria-labelledby="mw-');
s = s.replace(/id="countup-app"/g, 'id="myworld-app"');
s = s.replace(/\/countup-logo\.png/g, "/myworld-logo.png");
s = s.replace(/apps-trigger-cu/g, "apps-trigger-mw");
s = s.replace(/apps-panel-cu/g, "apps-panel-mw");
s = s.replace(/for="lang-select-cu"/g, 'for="lang-select-mw"');
s = s.replace(/id="lang-select-cu"/g, 'id="lang-select-mw"');
s = s.replace(/id="cu-theme"/g, 'id="mw-theme"');
s = s.replace(/id="cu-nav-toggle"/g, 'id="mw-nav-toggle"');
s = s.replace(/aria-controls="cu-mobile"/g, 'aria-controls="mw-mobile"');
s = s.replace(/id="cu-mobile"/g, 'id="mw-mobile"');
s = s.replace(/\{\{t:nav\.countupDesc\}\}/g, "{{t:nav.myworldDesc}}");
s = s.replace(/\{\{t:nav\.mobileCountupHint\}\}/g, "{{t:nav.mobileMyworldHint}}");
s = s.replace(/\[\[IMG:cu-showcase-/g, "[[IMG:mw-showcase-");
s = s.replace(/href="countup\/delete-account\/"/g, 'href="myworld/delete-account/"');

// Feature emojis (keep 7 cards like CountUp for identical grid)
const featureEmojis = ["🗺️", "📍", "📅", "📸", "📊", "🤖", "🧳"];
let fi = 0;
s = s.replace(
  /<span class="ox-feature-emoji" aria-hidden="true">[^<]+<\/span>\s*\n\s*<h3>\{\{t:mw\.feat/g,
  () =>
    `<span class="ox-feature-emoji" aria-hidden="true">${featureEmojis[fi++ % featureEmojis.length]}</span>\n                <h3>{{t:mw.feat`
);

// (keep feat7 card — same layout as CountUp)

s = s.replace(
  /<span class="ox-app-intro__title-icon" aria-hidden="true">[^<]+<\/span>/,
  '<span class="ox-app-intro__title-icon" aria-hidden="true">🌍</span>'
);

s = s.replace(
  /(<h2 id="mw-reco-title" class="ox-premium-heading">\s*\n\s*<span class="ox-premium-heading__spark" aria-hidden="true">)[^<]+(<\/span>)/,
  "$1✈️$2"
);

s = s.replace(
  /(<p class="ox-premium-highlight__kicker">\s*\n\s*<span class="ox-premium-emoji" aria-hidden="true">)[^<]+(<\/span>)/,
  "$1🗺️$2"
);

const premEmojis = ["🌍", "📊", "🤖", "📝", "🗺️", "☁️", "📄", "🚫"];
{
  let i = 0;
  s = s.replace(
    /(<article class="ox-premium-card">\s*\n\s*<h4 class="ox-premium-card__title">\s*\n\s*<span class="ox-premium-emoji" aria-hidden="true">)[^<]+(<\/span>\s*\n\s*\{\{t:mw\.prem\dTitle\}\})/g,
    (_, a, b) => `${a}${premEmojis[i++ % premEmojis.length]}${b}`
  );
}

// Flyout: make CountUp a normal link, My World current
const flyPat =
  /<a\s*\n\s*href="#mw-top"\s*\n\s*role="menuitem"\s*\n\s*class="apps-flyout__item apps-flyout__item--current"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>\s*\n\s*<a href="#newon-plus-app"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>\s*\n\s*<a href="#myworld-app"[\s\S]*?<span class="apps-flyout__go" aria-hidden="true">→<\/span>\s*\n\s*<\/a>/;

const flyRep = `<a href="#countup-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/countup-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">CountUp</span>
                    <span class="apps-flyout__desc">{{t:nav.countupDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
                <a href="#newon-plus-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/newon-plus-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">Newon</span>
                    <span class="apps-flyout__desc">{{t:nav.newonPlusDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
                <a
                  href="#mw-top"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="/myworld-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">My World</span>
                    <span class="apps-flyout__desc">{{t:nav.myworldDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

if (!flyPat.test(s)) {
  // Fallback: current block may still say CountUp name if only ids changed
  const flyPat2 =
    /<a\s*\n\s*href="#mw-top"[\s\S]*?class="apps-flyout__item apps-flyout__item--current"[\s\S]*?<\/a>\s*\n\s*<a href="#newon-plus-app"[\s\S]*?<\/a>\s*\n\s*<a href="#myworld-app"[\s\S]*?<\/a>/;
  if (!flyPat2.test(s)) {
    console.error("gen-myworld-app-inc: flyout block not found");
    process.exit(1);
  }
  s = s.replace(flyPat2, flyRep);
} else {
  s = s.replace(flyPat, flyRep);
}

// Navbar showcase title
s = s.replace(
  /<span class="navbar-app-showcase__title">CountUp<\/span>/g,
  '<span class="navbar-app-showcase__title">My World</span>'
);
s = s.replace(
  /<span class="apps-flyout__name">CountUp<\/span>/g,
  (m, offset, str) => {
    // Only replace remaining CountUp names that are current My World wrongly — skip countup-app links
    const before = str.slice(Math.max(0, offset - 200), offset);
    if (before.includes('href="#countup-app"') || before.includes("/countup-logo.png")) return m;
    if (before.includes('href="#mw-top"') || before.includes("apps-flyout__item--current")) {
      return '<span class="apps-flyout__name">My World</span>';
    }
    return m;
  }
);

// Mobile drawer: CountUp current → CountUp link + Newon + My World current
const mobilePat =
  /<a href="#mw-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">[\s\S]*?<\/a>\s*\n\s*<a href="#newon-plus-app"[\s\S]*?<\/a>\s*\n\s*<a href="#myworld-app"[\s\S]*?<\/a>\s*\n\s*<\/details>/;

const mobileRep = `<a href="#countup-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/countup-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">CountUp</span>
                <span class="mobile-apps-drawer__hint">{{t:mw.drawerCu}}</span>
              </span>
            </a>
            <a href="#newon-plus-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/newon-plus-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">Newon</span>
                <span class="mobile-apps-drawer__hint">{{t:mw.drawerNp}}</span>
              </span>
            </a>
            <a href="#mw-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/myworld-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">My World</span>
                <span class="mobile-apps-drawer__hint">{{t:mw.drawerMw}}</span>
              </span>
            </a>
          </details>`;

if (!mobilePat.test(s)) {
  console.error("gen-myworld-app-inc: mobile block not found");
  process.exit(1);
}
s = s.replace(mobilePat, mobileRep);

// Fix any leftover CountUp branding on this page chrome
s = s.replace(
  /(<a class="navbar-app-showcase[\s\S]*?<span class="navbar-app-showcase__title">)CountUp(<\/span>)/,
  "$1My World$2"
);
s = s.replace(
  /(<span class="mobile-apps-drawer__name">)CountUp(<\/span>\s*\n\s*<span class="mobile-apps-drawer__hint">\{\{t:mw\.drawerMw\}\})/,
  "$1My World$2"
);

// Ensure countup logo restored on countup links (global logo replace may have hit them)
s = s.replace(
  /(<a href="#countup-app"[^>]*>\s*<span class="[^"]*__icon">\s*<img src=")\/myworld-logo\.png/g,
  "$1/countup-logo.png"
);

// Force My World logo only on the *current* My World nav rows (tight: same <a> block)
s = s.replace(
  /(<a[^>]*href="#mw-top"[^>]*apps-flyout__item--current[^>]*>\s*<span class="apps-flyout__icon">\s*<img src=")[^"]+/g,
  "$1/myworld-logo.png"
);
s = s.replace(
  /(<a[^>]*apps-flyout__item--current[^>]*href="#mw-top"[^>]*>\s*<span class="apps-flyout__icon">\s*<img src=")[^"]+/g,
  "$1/myworld-logo.png"
);
s = s.replace(
  /(<a href="#mw-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">\s*<span class="mobile-apps-drawer__icon">\s*<img src=")[^"]+/g,
  "$1/myworld-logo.png"
);
s = s.replace(
  /(<a href="#mw-top" class="navbar-app-showcase"[^>]*>\s*<span class="navbar-app-showcase__icon">\s*<img[^>]*src=")[^"]+/g,
  "$1/myworld-logo.png"
);

// CountUp has 6 shots; My World uses 7 store screenshots
if (!s.includes("[[IMG:mw-showcase-07.png]]")) {
  s = s.replace(
    `                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:mw-showcase-06.png]]"
                    alt="{{t:mw.imgShot6Alt}}"
                    width="520"
                    height="520"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>`,
    `                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:mw-showcase-06.png]]"
                    alt="{{t:mw.imgShot6Alt}}"
                    width="520"
                    height="520"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:mw-showcase-07.png]]"
                    alt="{{t:mw.imgShot7Alt}}"
                    width="520"
                    height="520"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>`
  );
}

if (!s.includes('id="myworld-app"') || !s.includes("[[IMG:mw-showcase-01.png]]") || !s.includes("[[IMG:mw-showcase-07.png]]")) {
  console.error("gen-myworld-app-inc: validation failed");
  process.exit(1);
}

fs.writeFileSync(path.join(ROOT, "templates", "myworld-app-inc.html"), s, "utf8");
console.log("gen-myworld-app-inc: OK → templates/myworld-app-inc.html");
