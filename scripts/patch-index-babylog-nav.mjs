#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, "..", "templates", "index.html");
let i = fs.readFileSync(p, "utf8");

const BF = `                <a href="#babylog-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/babylog-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">BabyLog</span>
                    <span class="apps-flyout__desc">{{t:nav.babylogDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>
`;

const BM = `            <a href="#babylog-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/babylog-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">BabyLog</span>
                <span class="mobile-apps-drawer__hint">{{t:nav.mobileBabylogHint}}</span>
              </span>
            </a>
`;

const savyFlyNonCurrent = `                <a href="#savy-app" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="/savy-logo.png" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">SAVY</span>
                    <span class="apps-flyout__desc">{{t:nav.savyDesc}}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;

const savyFlyWithBaby = `${savyFlyNonCurrent}
${BF}`;

const nFly = i.split(savyFlyNonCurrent).length - 1;
if (nFly !== 4) {
  console.error("patch-index-babylog-nav: expected 4 savy flyout matches, got", nFly);
  process.exit(1);
}
i = i.split(savyFlyNonCurrent).join(savyFlyWithBaby);

const homeMobile = `            <a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:nav.mobileSavyHint}}</span>
              </span>
            </a>
          </details>
        </div>
      </header>

      <main id="main">`;

const homeMobileBaby = `            <a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:nav.mobileSavyHint}}</span>
              </span>
            </a>
${BM}          </details>
        </div>
      </header>

      <main id="main">`;

if (!i.includes(homeMobile)) {
  console.error("patch-index-babylog-nav: home mobile tail not found");
  process.exit(1);
}
i = i.replace(homeMobile, homeMobileBaby);

const oxMobileEnd = `            <a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:ox.mobileSavyHint}}</span>
              </span>
            </a>
          </details>`;

const oxMobileBaby = `            <a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:ox.mobileSavyHint}}</span>
              </span>
            </a>
${BM}          </details>`;

if (!i.includes(oxMobileEnd)) {
  console.error("patch-index-babylog-nav: ox mobile tail not found");
  process.exit(1);
}
i = i.replace(oxMobileEnd, oxMobileBaby);

const pmMobileEnd = `            <a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:pm.mobileSavyHint}}</span>
              </span>
            </a>
          </details>`;

const pmMobileBaby = `            <a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:pm.mobileSavyHint}}</span>
              </span>
            </a>
${BM}          </details>`;

if (!i.includes(pmMobileEnd)) {
  console.error("patch-index-babylog-nav: pillmate mobile tail not found");
  process.exit(1);
}
i = i.replace(pmMobileEnd, pmMobileBaby);

const spMobileEnd = `            <a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:sp.mobileSavyHint}}</span>
              </span>
            </a>
          </details>`;

const spMobileBaby = `            <a href="#savy-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:sp.mobileSavyHint}}</span>
              </span>
            </a>
${BM}          </details>`;

if (!i.includes(spMobileEnd)) {
  console.error("patch-index-babylog-nav: subping mobile tail not found");
  process.exit(1);
}
i = i.replace(spMobileEnd, spMobileBaby);

const savyFlyCurrent = `                <a
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
                </a>
              </div>`;

const savyFlyCurrentPlusBaby = `                <a
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
                </a>
${BF}              </div>`;

if (!i.includes(savyFlyCurrent)) {
  console.error("patch-index-babylog-nav: savy flyout current not found");
  process.exit(1);
}
i = i.replace(savyFlyCurrent, savyFlyCurrentPlusBaby);

const savyMobilePillBaby = `            <a href="#pillmate-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/pillmate-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">Pillmate</span>
                <span class="mobile-apps-drawer__hint">{{t:sv.drawerPm}}</span>
              </span>
            </a>
            <a href="#babylog-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/babylog-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">BabyLog</span>
                <span class="mobile-apps-drawer__hint">{{t:sv.mobileBabylogHint}}</span>
              </span>
            </a>
            <a href="#sv-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:sv.drawerSv}}</span>
              </span>
            </a>
          </details>`;

const savyMobilePillOnly = `            <a href="#pillmate-app" class="mobile-apps-drawer__item">
              <span class="mobile-apps-drawer__icon">
                <img src="/pillmate-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">Pillmate</span>
                <span class="mobile-apps-drawer__hint">{{t:sv.drawerPm}}</span>
              </span>
            </a>
            <a href="#sv-top" class="mobile-apps-drawer__item mobile-apps-drawer__item--current">
              <span class="mobile-apps-drawer__icon">
                <img src="/savy-logo.png" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">SAVY</span>
                <span class="mobile-apps-drawer__hint">{{t:sv.drawerSv}}</span>
              </span>
            </a>
          </details>`;

if (!i.includes(savyMobilePillOnly)) {
  console.error("patch-index-babylog-nav: savy mobile (pillmate→current) not found");
  process.exit(1);
}
i = i.replace(savyMobilePillOnly, savyMobilePillBaby);

fs.writeFileSync(p, i, "utf8");
console.log("patch-index-babylog-nav: OK");
