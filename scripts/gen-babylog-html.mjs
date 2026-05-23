#!/usr/bin/env node
/**
 * One-shot: templates/savy-app-inc.html → templates/babylog-app-inc.html
 * (BabyLog flyout / mobile / ids / copy keys; 8-shot showcase strip like SAVY;
 * 8 features, 7 how-to steps, 6 premium cards.)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

let s = fs.readFileSync(path.join(ROOT, "templates", "savy-app-inc.html"), "utf8");

s = s.replace(/id="savy-app"/g, 'id="babylog-app"');
s = s.replace(/\{\{t:sv\./g, "{{t:bl.");
s = s.replace(/\{\{html:sv\./g, "{{html:bl.");
s = s.replace(/id="sv-/g, 'id="bl-');
s = s.replace(/href="#sv-main"/g, 'href="#bl-main"');
s = s.replace(/id="sv-main"/g, 'id="bl-main"');
s = s.replace(/apps-trigger-sv/g, "apps-trigger-bl");
s = s.replace(/apps-panel-sv/g, "apps-panel-bl");
s = s.replace(/aria-labelledby="apps-trigger-sv"/g, 'aria-labelledby="apps-trigger-bl"');
s = s.replace(/for="lang-select-sv"/g, 'for="lang-select-bl"');
s = s.replace(/id="lang-select-sv"/g, 'id="lang-select-bl"');
s = s.replace(/id="sv-theme"/g, 'id="bl-theme"');
s = s.replace(/id="sv-nav-toggle"/g, 'id="bl-nav-toggle"');
s = s.replace(/aria-controls="sv-mobile"/g, 'aria-controls="bl-mobile"');
s = s.replace(/id="sv-mobile"/g, 'id="bl-mobile"');

s = s.replace(
  /<a class="ox-brand" href="#sv-top"/g,
  '<a class="ox-brand" href="#bl-top"'
);

const flyoutSavyCurrent = `                <a
                  href="#sv-top"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="/savy-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">SAVY</span>
                    <span class="apps-flyout__desc">{{t:nav.savyDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

const flyoutSavyThenBabylog = `                <a href="#savy-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/savy-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">SAVY</span>
                    <span class="apps-flyout__desc">{{t:nav.savyDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
                <a
                  href="#bl-top"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="/babylog-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">BabyLog</span>
                    <span class="apps-flyout__desc">{{t:nav.babylogDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

if (!s.includes(flyoutSavyCurrent)) {
  console.error("gen-babylog-html: flyout block not found");
  process.exit(1);
}
s = s.replace(flyoutSavyCurrent, flyoutSavyThenBabylog);

const mobileSavyCurrent = `            <a href="#sv-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:bl.drawerSv}}</span>
              </span>
            </a>`;

const mobileSavyThenBabylog = `            <a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:bl.drawerSv}}</span>
              </span>
            </a>
            <a href="#bl-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/babylog-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">BabyLog</span>
                <span class="mobile-apps-drawer__hint">{{t:bl.drawerBl}}</span>
              </span>
            </a>`;

if (!s.includes(mobileSavyCurrent)) {
  console.error("gen-babylog-html: mobile block not found");
  process.exit(1);
}
s = s.replace(mobileSavyCurrent, mobileSavyThenBabylog);

s = s.replace(/<span>SAVY<\/span>/g, "<span>BabyLog</span>");
s = s.replace(/src="\/savy-logo.png"/g, 'src="/babylog-logo.png"');

const showcaseStart = `        <section
          id="bl-showcase-scroll"
          class="ox-section ox-reveal-on-scroll"
          aria-label="{{t:bl.showcaseCollageAria}}"
        >
          <div class="ox-container">
            <div class="sp-showcase-scroll" tabindex="0">
              <div class="sp-showcase-scroll__track">`;

const showcaseEnd = `              </div>
            </div>
          </div>
        </section>`;

const idxShow = s.indexOf(showcaseStart);
if (idxShow === -1) {
  console.error("gen-babylog-html: showcase start not found");
  process.exit(1);
}
const idxEnd = s.indexOf(showcaseEnd, idxShow);
if (idxEnd === -1) {
  console.error("gen-babylog-html: showcase end not found");
  process.exit(1);
}
const preview = `        <section
          id="bl-showcase-scroll"
          class="ox-section ox-reveal-on-scroll"
          aria-label="{{t:bl.showcaseCollageAria}}"
        >
          <div class="ox-container">
            <div class="sp-showcase-scroll" tabindex="0">
              <div class="sp-showcase-scroll__track">
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:bl-showcase-01.png]]"
                    alt="{{t:bl.imgShot1Alt}}"
                    width="520"
                    height="520"
                    loading="eager"
                    decoding="async"
                    fetchpriority="high"
                  />
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:bl-showcase-02.png]]"
                    alt="{{t:bl.imgShot2Alt}}"
                    width="520"
                    height="520"
                    loading="eager"
                    decoding="async"
                  />
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:bl-showcase-03.png]]"
                    alt="{{t:bl.imgShot3Alt}}"
                    width="520"
                    height="520"
                    loading="eager"
                    decoding="async"
                  />
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:bl-showcase-04.png]]"
                    alt="{{t:bl.imgShot4Alt}}"
                    width="520"
                    height="520"
                    loading="eager"
                    decoding="async"
                  />
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:bl-showcase-05.png]]"
                    alt="{{t:bl.imgShot5Alt}}"
                    width="520"
                    height="520"
                    loading="eager"
                    decoding="async"
                  />
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:bl-showcase-06.png]]"
                    alt="{{t:bl.imgShot6Alt}}"
                    width="520"
                    height="520"
                    loading="eager"
                    decoding="async"
                  />
                </figure>
                <figure class="sp-showcase-scroll__item">
                  <img
                    src="[[IMG:bl-showcase-07.png]]"
                    alt="{{t:bl.imgShot7Alt}}"
                    width="520"
                    height="520"
                    loading="eager"
                    decoding="async"
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>`;
s = s.slice(0, idxShow) + preview + s.slice(idxEnd + showcaseEnd.length);

const feat7Block = `              <article class="ox-feature-card">
                <span class="ox-feature-emoji" aria-hidden="true">🤖</span>
                <h3>{{t:bl.feat7Title}}</h3>
                <p class="ox-feature-lead">{{t:bl.feat7Lead}}</p>
                <p class="ox-feature-note">{{t:bl.feat7Note}}</p>
              </article>
            </div>`;

const feat8Block = `              <article class="ox-feature-card">
                <span class="ox-feature-emoji" aria-hidden="true">🤖</span>
                <h3>{{t:bl.feat7Title}}</h3>
                <p class="ox-feature-lead">{{t:bl.feat7Lead}}</p>
                <p class="ox-feature-note">{{t:bl.feat7Note}}</p>
              </article>
              <article class="ox-feature-card">
                <span class="ox-feature-emoji" aria-hidden="true">✨</span>
                <h3>{{t:bl.feat8Title}}</h3>
                <p class="ox-feature-lead">{{t:bl.feat8Lead}}</p>
                <p class="ox-feature-note">{{t:bl.feat8Note}}</p>
              </article>
            </div>`;

if (!s.includes(feat7Block)) {
  console.error("gen-babylog-html: feat7 block not found");
  process.exit(1);
}
s = s.replace(feat7Block, feat8Block);

const how6Block = `              <article class="ox-feature-card">
                <h3>{{t:bl.how6Title}}</h3>
                <p class="ox-feature-lead">{{t:bl.how6P}}</p>
              </article>
            </div>`;

const how7Block = `              <article class="ox-feature-card">
                <h3>{{t:bl.how6Title}}</h3>
                <p class="ox-feature-lead">{{t:bl.how6P}}</p>
              </article>
              <article class="ox-feature-card">
                <h3>{{t:bl.how7Title}}</h3>
                <p class="ox-feature-lead">{{t:bl.how7P}}</p>
              </article>
            </div>`;

if (!s.includes(how6Block)) {
  console.error("gen-babylog-html: how6 block not found");
  process.exit(1);
}
s = s.replace(how6Block, how7Block);

const prem5Block = `                  <article class="ox-premium-card">
                    <h4 class="ox-premium-card__title">
                      <span class="ox-premium-emoji" aria-hidden="true">🚫</span>
                      {{t:bl.prem5Title}}
                    </h4>
                    <p class="ox-premium-card__lead">{{t:bl.prem5Lead}}</p>
                    <p class="ox-premium-card__note">{{t:bl.prem5Note}}</p>
                  </article>
                </div>`;

const prem6Block = `                  <article class="ox-premium-card">
                    <h4 class="ox-premium-card__title">
                      <span class="ox-premium-emoji" aria-hidden="true">🚫</span>
                      {{t:bl.prem5Title}}
                    </h4>
                    <p class="ox-premium-card__lead">{{t:bl.prem5Lead}}</p>
                    <p class="ox-premium-card__note">{{t:bl.prem5Note}}</p>
                  </article>
                  <article class="ox-premium-card">
                    <h4 class="ox-premium-card__title">
                      <span class="ox-premium-emoji" aria-hidden="true">🚫</span>
                      {{t:bl.prem6Title}}
                    </h4>
                    <p class="ox-premium-card__lead">{{t:bl.prem6Lead}}</p>
                    <p class="ox-premium-card__note">{{t:bl.prem6Note}}</p>
                  </article>
                </div>`;

if (!s.includes(prem5Block)) {
  console.error("gen-babylog-html: prem5 block not found");
  process.exit(1);
}
s = s.replace(prem5Block, prem6Block);

fs.writeFileSync(path.join(ROOT, "templates", "babylog-app-inc.html"), s, "utf8");
console.log("gen-babylog-html: OK → templates/babylog-app-inc.html");
