#!/usr/bin/env node
/**
 * Normalize every apps flyout + mobile drawer to the canonical 11-app order
 * (no duplicates, correct logos). Idempotent — safe to re-run on every build.
 *
 * Order: OX MONTH → SubPing → Pillmate → SAVY → BabyLog → PetLog →
 *        PiggyUp → GoalUp → CountUp → Newon → My World
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Canonical nav apps (href used when not current). */
const APPS = [
  {
    id: "ox",
    href: "#ox-month",
    top: "#ox-top",
    logo: "/ox-month-logo.png",
    name: "OX MONTH",
    desc: "{{t:nav.oxDesc}}",
    navHint: "{{t:nav.mobileOxHint}}",
    drawerKey: "drawerOx",
  },
  {
    id: "sp",
    href: "#subping-app",
    top: "#sp-top",
    logo: "/subping-logo.png",
    name: "SubPing",
    desc: "{{t:nav.subpingDesc}}",
    navHint: "{{t:nav.mobileSubpingHint}}",
    drawerKey: "drawerSp",
  },
  {
    id: "pm",
    href: "#pillmate-app",
    top: "#pm-top",
    logo: "/pillmate-logo.png",
    name: "Pillmate",
    desc: "{{t:nav.pillmateDesc}}",
    navHint: "{{t:nav.mobilePillmateHint}}",
    drawerKey: "drawerPm",
  },
  {
    id: "sv",
    href: "#savy-app",
    top: "#sv-top",
    logo: "/savy-logo.png",
    name: "SAVY",
    desc: "{{t:nav.savyDesc}}",
    navHint: "{{t:nav.mobileSavyHint}}",
    drawerKey: "drawerSv",
  },
  {
    id: "bl",
    href: "#babylog-app",
    top: "#bl-top",
    logo: "/babylog-logo.png",
    name: "BabyLog",
    desc: "{{t:nav.babylogDesc}}",
    navHint: "{{t:nav.mobileBabylogHint}}",
    drawerKey: "drawerBl",
  },
  {
    id: "pl",
    href: "#petlog-app",
    top: "#pl-top",
    logo: "/petlog-logo.png",
    name: "PetLog",
    desc: "{{t:nav.petlogDesc}}",
    navHint: "{{t:nav.mobilePetlogHint}}",
    drawerKey: "drawerPl",
  },
  {
    id: "pu",
    href: "#piggyup-app",
    top: "#pu-top",
    logo: "/piggyup-logo.png",
    name: "PiggyUp",
    desc: "{{t:nav.piggyupDesc}}",
    navHint: "{{t:nav.mobilePiggyupHint}}",
    drawerKey: "drawerPu",
  },
  {
    id: "gu",
    href: "#goalup-app",
    top: "#gu-top",
    logo: "/goalup-logo.png",
    name: "GoalUp",
    desc: "{{t:nav.goalupDesc}}",
    navHint: "{{t:nav.mobileGoalupHint}}",
    drawerKey: "drawerGu",
  },
  {
    id: "cu",
    href: "#countup-app",
    top: "#cu-top",
    logo: "/countup-logo.png",
    name: "CountUp",
    desc: "{{t:nav.countupDesc}}",
    navHint: "{{t:nav.mobileCountupHint}}",
    drawerKey: "drawerCu",
  },
  {
    id: "np",
    href: "#newon-plus-app",
    top: "#np-top",
    logo: "/newon-plus-logo.png",
    name: "Newon",
    desc: "{{t:nav.newonPlusDesc}}",
    navHint: "{{t:nav.mobileNewonPlusHint}}",
    drawerKey: "drawerNp",
  },
  {
    id: "mw",
    href: "#myworld-app",
    top: "#mw-top",
    logo: "/myworld-logo.png",
    name: "My World",
    desc: "{{t:nav.myworldDesc}}",
    navHint: "{{t:nav.mobileMyworldHint}}",
    drawerKey: "drawerMw",
  },
];

const PAGE_PREFIXES = ["ox", "sp", "pm", "sv", "bl", "pl", "pu", "gu", "cu", "np", "mw", "nt"];

function detectCurrentId(block) {
  const m =
    block.match(/apps-flyout__item--current[\s\S]*?apps-flyout__name">([^<]+)/) ||
    block.match(/mobile-apps-drawer__item--current[\s\S]*?mobile-apps-drawer__name">([^<]+)/);
  if (!m) return null;
  const name = m[1].trim();
  const app = APPS.find((a) => a.name === name);
  return app ? app.id : null;
}

function detectDrawerPrefix(block) {
  const m = block.match(/\{\{t:(ox|sp|pm|sv|bl|pl|pu|gu|cu|np|mw|nt)\.drawer/);
  return m ? m[1] : null;
}

function flyoutItem(app, isCurrent) {
  const href = isCurrent ? app.top : app.href;
  if (isCurrent) {
    return `<a
                  href="${href}"
                  role="menuitem"
                  class="apps-flyout__item apps-flyout__item--current"
                  aria-current="page"
                >
                  <span class="apps-flyout__icon">
                    <img src="${app.logo}" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">${app.name}</span>
                    <span class="apps-flyout__desc">${app.desc}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;
  }
  return `<a href="${href}" role="menuitem" class="apps-flyout__item">
                  <span class="apps-flyout__icon">
                    <img src="${app.logo}" alt="" width="44" height="44" />
                  </span>
                  <span class="apps-flyout__meta">
                    <span class="apps-flyout__name">${app.name}</span>
                    <span class="apps-flyout__desc">${app.desc}</span>
                  </span>
                  <span class="apps-flyout__go" aria-hidden="true">→</span>
                </a>`;
}

function mobileHint(app, pagePrefix, isCurrent) {
  if (!pagePrefix) return app.navHint;
  // My World page has full drawer* keys including drawerNp / drawerMw
  if (pagePrefix === "mw") return `{{t:mw.${app.drawerKey}}}`;
  if (pagePrefix === "np") {
    if (app.id === "mw") return app.navHint; // np locale has no drawerMw
    return `{{t:np.${app.drawerKey}}}`;
  }
  if (isCurrent) return `{{t:${pagePrefix}.${app.drawerKey}}}`;
  const local = ["ox", "sp", "pm", "sv", "bl", "pl", "pu", "gu", "cu"];
  if (local.includes(pagePrefix) && local.includes(app.id)) {
    return `{{t:${pagePrefix}.${app.drawerKey}}}`;
  }
  return app.navHint;
}

function mobileItem(app, isCurrent, pagePrefix) {
  const href = isCurrent ? app.top : app.href;
  const cls = isCurrent
    ? "mobile-apps-drawer__item mobile-apps-drawer__item--current"
    : "mobile-apps-drawer__item";
  const hint = mobileHint(app, pagePrefix, isCurrent);
  return `<a href="${href}" class="${cls}">
              <span class="mobile-apps-drawer__icon">
                <img src="${app.logo}" alt="" width="36" height="36" />
              </span>
              <span class="mobile-apps-drawer__text">
                <span class="mobile-apps-drawer__name">${app.name}</span>
                <span class="mobile-apps-drawer__hint">${hint}</span>
              </span>
            </a>`;
}

function buildFlyoutInner(currentId) {
  return APPS.map((app) => flyoutItem(app, app.id === currentId)).join("\n");
}

function buildMobileInner(currentId, pagePrefix) {
  return APPS.map((app) => mobileItem(app, app.id === currentId, pagePrefix)).join("\n");
}

function normalizeFlyoutPanels(html) {
  return html.replace(
    /(<div\b[^>]*class="apps-flyout__panel"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/nav>)/g,
    (full, open, inner, close) => {
      const currentId = detectCurrentId(inner);
      return `${open}\n${buildFlyoutInner(currentId)}\n              ${close}`;
    }
  );
}

function normalizeMobileDrawers(html) {
  // Home-style: details.mobile-apps-drawer
  html = html.replace(
    /(<details class="mobile-apps-drawer">\s*<summary[\s\S]*?<\/summary>)([\s\S]*?)(<\/details>)/g,
    (full, open, inner, close) => {
      const currentId = detectCurrentId(inner);
      const prefix = detectDrawerPrefix(inner);
      return `${open}\n${buildMobileInner(currentId, prefix)}\n          ${close}`;
    }
  );
  // App-page style: div.ox-mobile-menu > details
  html = html.replace(
    /(<div class="ox-mobile-menu"[\s\S]*?<details class="mobile-apps-drawer">\s*<summary[\s\S]*?<\/summary>)([\s\S]*?)(<\/details>)/g,
    (full, open, inner, close) => {
      // Already handled by previous if nested the same — skip if already 11 unique
      const names = [...inner.matchAll(/mobile-apps-drawer__name">([^<]+)/g)].map((m) => m[1]);
      const unique = new Set(names);
      if (names.length === 11 && unique.size === 11) return full;
      const currentId = detectCurrentId(inner);
      const prefix = detectDrawerPrefix(inner);
      return `${open}\n${buildMobileInner(currentId, prefix)}\n          ${close}`;
    }
  );
  return html;
}

function patchHtml(filePath) {
  let s = fs.readFileSync(filePath, "utf8");
  if (!s.includes("apps-flyout__panel") && !s.includes("mobile-apps-drawer")) {
    console.log(`skip (no app nav): ${path.relative(ROOT, filePath)}`);
    return;
  }
  s = normalizeFlyoutPanels(s);
  s = normalizeMobileDrawers(s);
  fs.writeFileSync(filePath, s, "utf8");

  // Verify first flyout
  const m = s.match(/class="apps-flyout__panel"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/nav>/);
  if (m) {
    const names = [...m[1].matchAll(/apps-flyout__name">([^<]+)/g)].map((x) => x[1]);
    const logos = [...m[1].matchAll(/apps-flyout__icon">\s*<img src="([^"]+)"/g)].map((x) => x[1]);
    console.log(
      `patched ${path.relative(ROOT, filePath)} → [${names.join(", ")}]`
    );
    const mwIdx = names.indexOf("My World");
    if (mwIdx >= 0 && logos[mwIdx] && !logos[mwIdx].includes("myworld")) {
      console.error(`ERROR: My World logo wrong in ${filePath}: ${logos[mwIdx]}`);
      process.exitCode = 1;
    }
  } else {
    console.log(`patched ${path.relative(ROOT, filePath)}`);
  }
}

const files = [
  path.join(ROOT, "templates", "index.html"),
  path.join(ROOT, "templates", "myworld-app-inc.html"),
  path.join(ROOT, "templates", "newon-plus-app-inc.html"),
  path.join(ROOT, "templates", "countup-app-inc.html"),
  path.join(ROOT, "templates", "goalup-app-inc.html"),
  path.join(ROOT, "templates", "petlog-app-inc.html"),
  path.join(ROOT, "templates", "piggyup-app-inc.html"),
  path.join(ROOT, "templates", "pillmate-app-inc.html"),
  path.join(ROOT, "templates", "savy-app-inc.html"),
  path.join(ROOT, "templates", "babylog-app-inc.html"),
  path.join(ROOT, "templates", "noting-app-inc.html"),
];

for (const f of files) {
  if (fs.existsSync(f)) patchHtml(f);
}

console.log("patch-index-myworld-nav: OK");
