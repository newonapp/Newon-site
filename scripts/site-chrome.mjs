/**
 * Shared site chrome — global navigation + footer.
 * Linear / Vercel–style: brand left · text nav center · utilities right.
 */
import { escapeHtml, pick } from "./hub-utils.mjs";

const LANG_OPTIONS = [
  { dir: "ko", labelKey: "ui.langKo", short: "KO" },
  { dir: "en", labelKey: "ui.langEn", short: "EN" },
  { dir: "ja", labelKey: "ui.langJa", short: "JA" },
  { dir: "es", labelKey: "ui.langEs", short: "ES" },
  { dir: "pt-br", labelKey: "ui.langPtBr", short: "PT" },
  { dir: "fr", labelKey: "ui.langFr", short: "FR" },
  { dir: "de", labelKey: "ui.langDe", short: "DE" },
  { dir: "hi", labelKey: "ui.langHi", short: "HI" },
  { dir: "id", labelKey: "ui.langId", short: "ID" },
];

const PRODUCTS_MENU = [
  { labelKey: "nav.apps", descKey: "nav.appsMenuDesc", href: "products/?filter=apps" },
  { labelKey: "nav.ai", descKey: "nav.aiMenuDesc", href: "ai/" },
  { labelKey: "nav.saas", descKey: "nav.saasMenuDesc", href: "saas/" },
  { labelKey: "nav.newonPlus", descKey: "nav.newonPlusMenuDesc", href: "#newon-plus-app" },
];

const DESKTOP_LINKS = [
  { id: "products", labelKey: "nav.products", menu: "products" },
  { id: "business", labelKey: "nav.business", href: "business/" },
  { id: "games", labelKey: "nav.games", href: "games/" },
  { id: "tools", labelKey: "nav.tools", href: "tools/" },
  { id: "store", labelKey: "nav.store", href: "store/" },
  { id: "news", labelKey: "nav.newsUpdates", href: "news/" },
];

const MOBILE_SECTIONS = [
  {
    labelKey: "nav.products",
    items: PRODUCTS_MENU,
  },
  {
    labelKey: null,
    items: [
      { labelKey: "nav.business", href: "business/" },
      { labelKey: "nav.games", href: "games/" },
      { labelKey: "nav.tools", href: "tools/" },
      { labelKey: "nav.store", href: "store/" },
      { labelKey: "nav.newsUpdates", href: "news/" },
    ],
  },
  {
    labelKey: "nav.about",
    items: [
      { labelKey: "nav.aboutNewon", href: "about/" },
      { labelKey: "nav.portfolio", href: "portfolio/" },
      { labelKey: "nav.contact", href: "contact/" },
    ],
  },
];

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return v != null && v !== "" ? String(v) : fb;
}

function href(base, path) {
  if (!path) return base || "./";
  if (path.startsWith("#")) return path;
  return `${base}${path}`;
}

function productsDropdown(flat, flatEn, base, activeNav) {
  const label = escapeHtml(t(flat, flatEn, "nav.productsMenuLabel", "PRODUCTS"));
  const items = PRODUCTS_MENU.map((item) => {
    const title = escapeHtml(t(flat, flatEn, item.labelKey));
    const desc = escapeHtml(t(flat, flatEn, item.descKey));
    const h = href(base, item.href);
    return `<a class="gnav-dd__item" href="${h}" role="menuitem">
        <span class="gnav-dd__item-title">${title}</span>
        <span class="gnav-dd__item-desc">${desc}</span>
      </a>`;
  }).join("");
  const active = activeNav === "products" ? " gnav-dd--active" : "";
  return `<div class="gnav-dd${active}" data-gnav-dd>
    <button type="button" class="gnav__link gnav-dd__trigger" aria-expanded="false" aria-haspopup="true"${activeNav === "products" ? ' aria-current="page"' : ""}>
      ${escapeHtml(t(flat, flatEn, "nav.products"))}<span class="gnav-dd__chev" aria-hidden="true"></span>
    </button>
    <div class="gnav-dd__panel gnav-dd__panel--rich" role="menu" hidden>
      <p class="gnav-dd__kicker">${label}</p>
      ${items}
    </div>
  </div>`;
}

function desktopNav(flat, flatEn, base, activeNav) {
  return DESKTOP_LINKS.map((item) => {
    if (item.menu === "products") return productsDropdown(flat, flatEn, base, activeNav);
    const label = escapeHtml(t(flat, flatEn, item.labelKey));
    const active = item.id === activeNav ? ' aria-current="page"' : "";
    return `<a class="gnav__link" href="${href(base, item.href)}"${active}>${label}</a>`;
  }).join("\n          ");
}

function langSelect(flat, flatEn, id) {
  const opts = LANG_OPTIONS.map(
    (l) =>
      `<option value="${l.dir}" data-short="${l.short}">${escapeHtml(t(flat, flatEn, l.labelKey, l.short))}</option>`
  ).join("");
  return `<div class="gnav__lang" data-lang-switcher>
    <label class="visually-hidden" for="${id}">${escapeHtml(t(flat, flatEn, "ui.language", "Language"))}</label>
    <select id="${id}" class="gnav__lang-select" data-lang-select data-lang-compact aria-label="${escapeHtml(t(flat, flatEn, "ui.language", "Language"))}">
      ${opts}
    </select>
  </div>`;
}

function mobileNav(flat, flatEn, base, suffix) {
  const home = escapeHtml(t(flat, flatEn, "nav.home", "Home"));
  const inquiry = escapeHtml(t(flat, flatEn, "nav.inquiryCta", "Contact"));
  const sections = MOBILE_SECTIONS.map((sec) => {
    const heading = sec.labelKey
      ? `<p class="gnav-mobile__label">${escapeHtml(t(flat, flatEn, sec.labelKey))}</p>`
      : "";
    const links = sec.items
      .map((item) => {
        const label = escapeHtml(t(flat, flatEn, item.labelKey));
        const h = href(base, item.href);
        const sub = item.descKey ? `<span class="gnav-mobile__desc">${escapeHtml(t(flat, flatEn, item.descKey))}</span>` : "";
        return `<a class="gnav-mobile__link" href="${h}"><span>${label}</span>${sub}</a>`;
      })
      .join("");
    return `${heading}${links}`;
  }).join("\n        ");
  return `<div id="gnav-mobile-${suffix}" class="gnav-mobile" hidden aria-hidden="true">
      <div class="gnav-mobile__panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(t(flat, flatEn, "nav.menuLabel", "Menu"))}">
        <div class="gnav-mobile__scroll">
          <a class="gnav-mobile__link gnav-mobile__link--home" href="${base || "./"}">${home}</a>
          ${sections}
          <a class="gnav-mobile__cta btn btn-primary" href="${href(base, "business/#inquiry")}">${inquiry}</a>
        </div>
      </div>
      <button type="button" class="gnav-mobile__backdrop" data-gnav-close tabindex="-1" aria-label="${escapeHtml(t(flat, flatEn, "common.close", "Close"))}"></button>
    </div>`;
}

export function renderGlobalHeader(flat, flatEn, { activeNav = "", base = "../", idSuffix = "hub" } = {}) {
  const brand = escapeHtml(t(flat, flatEn, "nav.brandName", "Newon"));
  const brandHref = base || "./";
  const langId = `lang-select-gnav-${idSuffix}`;
  const inquiry = escapeHtml(t(flat, flatEn, "nav.inquiryCta", "Contact"));
  const menuLabel = escapeHtml(t(flat, flatEn, "nav.menuLabel", "Menu"));
  const themeLabel = escapeHtml(t(flat, flatEn, "common.themeToDark", "Toggle theme"));
  const themeTitle = escapeHtml(t(flat, flatEn, "common.themeToggle", "Theme"));

  return `<header class="gnav site-header" data-gnav>
      <div class="gnav__bar">
        <div class="gnav__inner">
          <a class="gnav__brand" href="${brandHref}">
            <img class="gnav__logo" src="/logo.png" alt="Newon" width="36" height="36" decoding="async" />
            <span class="gnav__wordmark">${brand}</span>
          </a>
          <nav class="gnav__nav" aria-label="${escapeHtml(t(flat, flatEn, "nav.mainAria", "Main"))}">
            ${desktopNav(flat, flatEn, base, activeNav)}
          </nav>
          <div class="gnav__util">
            <a class="gnav__cta" href="${href(base, "business/#inquiry")}">${inquiry}</a>
            ${langSelect(flat, flatEn, langId)}
            <button type="button" class="gnav__theme" data-theme-toggle data-label-light="${escapeHtml(t(flat, flatEn, "common.themeToLight", ""))}" data-label-dark="${escapeHtml(t(flat, flatEn, "common.themeToDark", ""))}" title="${themeTitle}" aria-label="${themeLabel}">◐</button>
            <button type="button" class="gnav__menu-btn" data-gnav-toggle aria-expanded="false" aria-controls="gnav-mobile-${idSuffix}" aria-label="${menuLabel}">
              <span class="gnav__menu-icon" aria-hidden="true"><span></span><span></span></span>
            </button>
          </div>
        </div>
      </div>
      ${mobileNav(flat, flatEn, base, idSuffix)}
    </header>`;
}

/** Hub / subpages — same header, relative links from locale root */
export function renderStudioHeader(flat, flatEn, opts = {}) {
  return renderGlobalHeader(flat, flatEn, { ...opts, base: "../", idSuffix: opts.idSuffix || "hub" });
}

export function renderStudioFooter(flat, flatEn) {
  const tf = (k, fb) => escapeHtml(pick(flat, flatEn, k) || fb);
  const col = (titleKey, links) => `<div class="studio-footer__col">
      <p class="studio-footer__title">${tf(titleKey, titleKey)}</p>
      <ul class="studio-footer__list">${links.map(([k, h]) => `<li><a href="${h}">${tf(k, k)}</a></li>`).join("")}</ul>
    </div>`;

  return `<footer class="site-footer studio-footer">
      <div class="container studio-footer__grid">
        ${col("footer.colProducts", [
          ["footer.linkApps", "../products/?filter=apps"],
          ["footer.linkAi", "../ai/"],
          ["footer.linkSaas", "../saas/"],
          ["footer.linkGames", "../games/"],
          ["footer.linkNewonPlus", "../#newon-plus-app"],
        ])}
        ${col("footer.colBusiness", [
          ["footer.linkMvp", "../business/#svc-mvp"],
          ["footer.linkWebsite", "../business/#svc-website"],
          ["footer.linkAiAuto", "../business/#svc-ai"],
          ["footer.linkWhitelabel", "../business/#svc-whitelabel"],
          ["footer.linkDesign", "../business/#svc-design"],
        ])}
        ${col("footer.colResources", [
          ["footer.linkTools", "../tools/"],
          ["footer.linkStore", "../store/"],
          ["footer.linkBlog", "../blog/"],
          ["footer.linkMedia", "../media/"],
        ])}
        ${col("footer.colCompany", [
          ["footer.about", "../about/"],
          ["footer.portfolio", "../portfolio/"],
          ["nav.newsUpdates", "../news/"],
          ["nav.ideas", "../ideas/"],
          ["nav.contact", "../contact/"],
        ])}
        ${col("footer.colLegal", [
          ["footer.privacy", "../privacy/"],
          ["footer.terms", "../terms/"],
          ["footer.linkDelete", "../oxmonth/delete-account/"],
          ["footer.linkSubscription", "../#newon-plus-app"],
        ])}
        <div class="studio-footer__col studio-footer__col--contact">
          <p class="studio-footer__title">${tf("footer.colContact", "Contact")}</p>
          <a class="studio-footer__email" href="mailto:newon@newon.app">newon@newon.app</a>
          <p class="studio-footer__tagline">${tf("footer.taglineStudio", tf("footer.tagline", ""))}</p>
        </div>
      </div>
      <div class="container studio-footer__bottom">
        <p>© Newon · ${tf("footer.rights", "All rights reserved.")}</p>
      </div>
    </footer>`;
}

/** @deprecated Home inline nav — use renderGlobalHeader via {{GLOBAL_HEADER}} */
export function renderHomeNavExtras() {
  return "";
}
