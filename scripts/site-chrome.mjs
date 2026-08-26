/**
 * Shared site chrome — Global Navigation with premium mega menus.
 * Top-level: Products · Business · Resources · Company (English labels always)
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

const NAV_LABELS = {
  products: "Products",
  business: "Business",
  resources: "Resources",
  company: "Company",
};

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return v != null && v !== "" ? String(v) : fb;
}

function href(base, path) {
  if (!path) return base || "./";
  if (path.startsWith("#")) {
    const home = base || "./";
    if (!home || home === "./") return path;
    return `${home.replace(/\/?$/, "/")}${path.slice(1)}`;
  }
  return `${base}${path}`;
}

/** Map URL path segment to active top-level nav id */
export function resolveActiveNav(pathname = "") {
  const p = String(pathname)
    .replace(/^\/(ko|en|ja|es|pt-br|fr|de|hi|id)(?=\/|$)/, "")
    .replace(/^\//, "")
    .toLowerCase();
  const seg = p.split("/")[0] || "";
  if (["products", "apps", "ai", "saas", "games", "tools"].includes(seg)) return "products";
  if (seg === "business") return "business";
  if (seg === "resources" || ["store", "blog", "media", "labs", "market"].includes(seg)) return "resources";
  if (seg === "company" || ["about", "portfolio", "news", "ideas", "contact", "studio"].includes(seg))
    return "company";
  return "";
}

const CHEVRON_SVG = `<svg class="gnav-dd__chev-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const MOON_SVG = `<svg class="gnav__theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const SUN_SVG = `<svg class="gnav__theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`;

function megaCell(flat, flatEn, base, { titleKey, descKey, hrefPath, titleFb = "", withArrow = false }) {
  const title = escapeHtml(t(flat, flatEn, titleKey, titleFb));
  const desc = escapeHtml(t(flat, flatEn, descKey));
  const arrow = withArrow
    ? `<span class="gnav-mega__cell-arrow" aria-hidden="true">→</span>`
    : "";
  return `<a class="gnav-mega__cell${withArrow ? " gnav-mega__cell--arrow" : ""}" href="${href(base, hrefPath)}" role="menuitem">
    <span class="gnav-mega__cell-title">${title}${arrow}</span>
    <span class="gnav-mega__cell-desc">${desc}</span>
  </a>`;
}

function megaSoon(flat, flatEn, { titleKey, descKey, titleFb = "" }) {
  const title = escapeHtml(t(flat, flatEn, titleKey, titleFb));
  const desc = escapeHtml(t(flat, flatEn, descKey));
  const badge = escapeHtml(t(flat, flatEn, "nav.comingSoon", "Coming Soon"));
  return `<div class="gnav-mega__cell gnav-mega__cell--soon" role="presentation">
    <span class="gnav-mega__cell-title">${title}<span class="gnav-mega__badge">${badge}</span></span>
    <span class="gnav-mega__cell-desc">${desc}</span>
  </div>`;
}

function productsMega(flat, flatEn, base) {
  const kicker = escapeHtml(t(flat, flatEn, "nav.productsMenuLabel", "PRODUCTS"));
  const lead = escapeHtml(t(flat, flatEn, "nav.productsMenuLead"));
  const viewAll = escapeHtml(t(flat, flatEn, "nav.viewAllProducts", "View all products →"));
  const items = [
    { titleKey: "nav.apps", descKey: "nav.appsMenuDesc", hrefPath: "apps/" },
    { titleKey: "nav.ai", descKey: "nav.aiMenuDesc", hrefPath: "ai/" },
    { titleKey: "nav.saas", descKey: "nav.saasMenuDesc", hrefPath: "saas/" },
    { titleKey: "nav.games", descKey: "nav.gamesMenuDesc", hrefPath: "games/" },
    { titleKey: "nav.tools", descKey: "nav.toolsMenuDesc", hrefPath: "tools/" },
  ]
    .map((item, i) => {
      const title = escapeHtml(t(flat, flatEn, item.titleKey));
      const desc = escapeHtml(t(flat, flatEn, item.descKey));
      const n = String(i + 1).padStart(2, "0");
      return `<a class="gnav-mega__row" href="${href(base, item.hrefPath)}" role="menuitem">
      <span class="gnav-mega__row-n" aria-hidden="true">${n}</span>
      <span class="gnav-mega__row-main">
        <span class="gnav-mega__row-title">${title}</span>
        <span class="gnav-mega__row-desc">${desc}</span>
      </span>
      <span class="gnav-mega__row-arrow" aria-hidden="true">→</span>
    </a>`;
    })
    .join("");
  return `<div class="gnav-mega__head">
      <p class="gnav-mega__kicker">${kicker}</p>
      <p class="gnav-mega__lead">${lead}</p>
    </div>
    <div class="gnav-mega__list" role="none">
      ${items}
    </div>
    <p class="gnav-mega__foot"><a class="gnav-mega__foot-link" href="${href(base, "products/")}">${viewAll}</a></p>`;
}

function businessMega(flat, flatEn, base) {
  const kicker = escapeHtml(t(flat, flatEn, "nav.businessMenuLabel", "BUSINESS"));
  const lead = escapeHtml(t(flat, flatEn, "nav.businessMenuLead"));
  const explore = escapeHtml(t(flat, flatEn, "nav.businessExploreCta", "Learn about Business →"));
  const inquiry = escapeHtml(t(flat, flatEn, "nav.businessInquiryCta", "Project inquiry →"));
  return `<div class="gnav-mega__head">
      <p class="gnav-mega__kicker">${kicker}</p>
      <p class="gnav-mega__lead">${lead}</p>
      <p class="gnav-mega__subkicker">${escapeHtml(t(flat, flatEn, "nav.servicesLabel", "Services"))}</p>
    </div>
    <div class="gnav-mega__grid gnav-mega__grid--business">
      ${megaCell(flat, flatEn, base, { titleKey: "nav.bizMvp", descKey: "nav.bizMvpDesc", hrefPath: "business/mvp/" })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.bizWeb", descKey: "nav.bizWebDesc", hrefPath: "business/web/" })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.bizApp", descKey: "nav.bizAppDesc", hrefPath: "business/app/" })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.bizAi", descKey: "nav.bizAiDesc", hrefPath: "business/ai-automation/" })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.bizWhitelabel", descKey: "nav.bizWhitelabelDesc", hrefPath: "business/white-label/" })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.bizDesign", descKey: "nav.bizDesignDesc", hrefPath: "business/design/" })}
    </div>
    <div class="gnav-mega__foot gnav-mega__foot--split">
      <a class="gnav-mega__foot-link" href="${href(base, "business/")}">${explore}</a>
      <a class="gnav-mega__foot-link gnav-mega__foot-link--strong" href="${href(base, "business/#inquiry")}">${inquiry}</a>
    </div>`;
}

function resourcesMega(flat, flatEn, base) {
  const kicker = escapeHtml(t(flat, flatEn, "nav.resourcesMenuLabel", "RESOURCES"));
  const lead = escapeHtml(t(flat, flatEn, "nav.resourcesMenuLead"));
  return `<div class="gnav-mega__head">
      <p class="gnav-mega__kicker">${kicker}</p>
      <p class="gnav-mega__lead">${lead}</p>
    </div>
    <div class="gnav-mega__grid gnav-mega__grid--resources">
      ${megaCell(flat, flatEn, base, { titleKey: "nav.store", descKey: "nav.storeMenuDesc", hrefPath: "resources/store/" })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.blog", descKey: "nav.blogMenuDesc", hrefPath: "resources/blog/" })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.media", descKey: "nav.mediaMenuDesc", hrefPath: "resources/media/" })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.labs", descKey: "nav.labsMenuDesc", hrefPath: "resources/labs/" })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.newsletter", descKey: "nav.newsletterMenuDesc", hrefPath: "resources/newsletter/" })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.education", descKey: "nav.educationMenuDesc", hrefPath: "resources/education/" })}
    </div>`;
}

function companyMega(flat, flatEn, base) {
  const kicker = escapeHtml(t(flat, flatEn, "nav.companyMenuLabel", "COMPANY"));
  const lead = escapeHtml(t(flat, flatEn, "nav.companyMenuLead"));
  const tag = escapeHtml(t(flat, flatEn, "nav.companyFooterTag", "NEWON"));
  const tagline = escapeHtml(t(flat, flatEn, "nav.companyFooterLine", "Digital Product Studio"));
  return `<div class="gnav-mega__head">
      <p class="gnav-mega__kicker">${kicker}</p>
      <p class="gnav-mega__lead">${lead}</p>
    </div>
    <div class="gnav-mega__grid gnav-mega__grid--company">
      ${megaCell(flat, flatEn, base, { titleKey: "nav.aboutNewon", descKey: "nav.aboutMenuDesc", hrefPath: "about/", withArrow: true })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.portfolio", descKey: "nav.portfolioMenuDesc", hrefPath: "portfolio/", withArrow: true })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.newsUpdates", descKey: "nav.newsMenuDesc", hrefPath: "news/", withArrow: true })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.ideas", descKey: "nav.ideasMenuDesc", hrefPath: "ideas/", withArrow: true })}
      ${megaCell(flat, flatEn, base, { titleKey: "nav.contact", descKey: "nav.contactMenuDesc", hrefPath: "contact/", withArrow: true })}
    </div>
    <div class="gnav-mega__brand">
      <p class="gnav-mega__brand-name">${tag}</p>
      <p class="gnav-mega__brand-line">${tagline}</p>
      <a class="gnav-mega__brand-email" href="mailto:newon@newon.app">newon@newon.app</a>
    </div>`;
}

const MEGA_RENDERERS = {
  products: productsMega,
  business: businessMega,
  resources: resourcesMega,
  company: companyMega,
};

function navMegaItem(flat, flatEn, base, activeNav, id) {
  const label = NAV_LABELS[id];
  const active = activeNav === id ? " gnav-dd--active" : "";
  const openAttr = activeNav === id ? ' aria-current="page"' : "";
  const body = MEGA_RENDERERS[id](flat, flatEn, base);
  return `<div class="gnav-dd${active}" data-gnav-dd data-gnav-menu="${id}">
    <button type="button" class="gnav__link gnav-dd__trigger" aria-expanded="false" aria-haspopup="true"${openAttr}>
      ${label}${CHEVRON_SVG}
    </button>
    <div class="gnav-mega" role="menu" hidden>
      <div class="gnav-mega__panel">
        <div class="gnav-mega__inner">${body}</div>
      </div>
    </div>
  </div>`;
}

function desktopNav(flat, flatEn, base, activeNav) {
  return ["products", "business", "resources", "company"]
    .map((id) => navMegaItem(flat, flatEn, base, activeNav, id))
    .join("\n          ");
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

const MOBILE_MENUS = {
  products: [
    { labelKey: "nav.apps", href: "apps/" },
    { labelKey: "nav.ai", href: "ai/" },
    { labelKey: "nav.saas", href: "saas/" },
    { labelKey: "nav.games", href: "games/" },
    { labelKey: "nav.tools", href: "tools/" },
    { labelKey: "nav.allProducts", href: "products/" },
  ],
  business: [
    { labelKey: "nav.bizMvp", href: "business/mvp/" },
    { labelKey: "nav.bizWeb", href: "business/web/" },
    { labelKey: "nav.bizApp", href: "business/app/" },
    { labelKey: "nav.bizAi", href: "business/ai-automation/" },
    { labelKey: "nav.bizWhitelabel", href: "business/white-label/" },
    { labelKey: "nav.bizDesign", href: "business/design/" },
  ],
  resources: [
    { labelKey: "nav.store", href: "resources/store/" },
    { labelKey: "nav.blog", href: "resources/blog/" },
    { labelKey: "nav.media", href: "resources/media/" },
    { labelKey: "nav.labs", href: "resources/labs/" },
    { labelKey: "nav.newsletter", href: "resources/newsletter/" },
    { labelKey: "nav.education", href: "resources/education/" },
  ],
  company: [
    { labelKey: "nav.aboutNewon", href: "about/" },
    { labelKey: "nav.portfolio", href: "portfolio/" },
    { labelKey: "nav.newsUpdates", href: "news/" },
    { labelKey: "nav.ideas", href: "ideas/" },
    { labelKey: "nav.contact", href: "contact/" },
  ],
};

function mobileNav(flat, flatEn, base, suffix) {
  const inquiry = escapeHtml(t(flat, flatEn, "nav.inquiryCta", "Contact"));
  const projectInquiry = escapeHtml(t(flat, flatEn, "nav.businessInquiryCtaMobile", "Project inquiry"));
  const soon = escapeHtml(t(flat, flatEn, "nav.comingSoon", "Coming Soon"));
  const themeLabel = escapeHtml(t(flat, flatEn, "common.themeToggle", "Theme"));

  const sections = Object.entries(MOBILE_MENUS)
    .map(([id, items]) => {
      const label = NAV_LABELS[id];
      const links = items
        .map((item) => {
          const labelText = escapeHtml(t(flat, flatEn, item.labelKey));
          if (item.soon) {
            return `<span class="gnav-mobile__sublink gnav-mobile__sublink--soon">${labelText}<span class="gnav-mega__badge">${soon}</span></span>`;
          }
          return `<a class="gnav-mobile__sublink" href="${href(base, item.href)}">${labelText}</a>`;
        })
        .join("");
      return `<div class="gnav-mobile__acc" data-gnav-acc>
        <button type="button" class="gnav-mobile__acc-trigger" aria-expanded="false">${label}${CHEVRON_SVG}</button>
        <div class="gnav-mobile__acc-panel" hidden>${links}</div>
      </div>`;
    })
    .join("\n        ");

  return `<div id="gnav-mobile-${suffix}" class="gnav-mobile" hidden aria-hidden="true">
      <div class="gnav-mobile__panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(t(flat, flatEn, "nav.menuLabel", "Menu"))}">
        <div class="gnav-mobile__scroll">
          ${sections}
          <div class="gnav-mobile__divider" aria-hidden="true"></div>
          <a class="gnav-mobile__cta btn btn-primary" href="${href(base, "business/#inquiry")}">${projectInquiry}</a>
          <div class="gnav-mobile__util-row">
            ${langSelect(flat, flatEn, `lang-select-mobile-${suffix}`)}
            <button type="button" class="gnav__theme gnav__theme--mobile" data-theme-toggle data-label-light="${escapeHtml(t(flat, flatEn, "common.themeToLight", ""))}" data-label-dark="${escapeHtml(t(flat, flatEn, "common.themeToDark", ""))}" title="${themeLabel}" aria-label="${themeLabel}">${MOON_SVG}</button>
          </div>
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
            <img class="gnav__logo" src="/logo.png" alt="Newon" width="40" height="40" decoding="async" />
            <span class="gnav__wordmark">${brand}</span>
          </a>
          <nav class="gnav__nav" aria-label="${escapeHtml(t(flat, flatEn, "nav.mainAria", "Main"))}">
            ${desktopNav(flat, flatEn, base, activeNav)}
          </nav>
          <div class="gnav__util">
            <a class="gnav__cta" href="${href(base, "business/#inquiry")}">${inquiry}</a>
            ${langSelect(flat, flatEn, langId)}
            <button type="button" class="gnav__theme" data-theme-toggle data-label-light="${escapeHtml(t(flat, flatEn, "common.themeToLight", ""))}" data-label-dark="${escapeHtml(t(flat, flatEn, "common.themeToDark", ""))}" title="${themeTitle}" aria-label="${themeLabel}">${MOON_SVG}</button>
            <button type="button" class="gnav__menu-btn" data-gnav-toggle aria-expanded="false" aria-controls="gnav-mobile-${idSuffix}" aria-label="${menuLabel}">
              <span class="gnav__menu-icon" aria-hidden="true"><span></span><span></span></span>
            </button>
          </div>
        </div>
      </div>
      ${mobileNav(flat, flatEn, base, idSuffix)}
    </header>`;
}

export function renderStudioHeader(flat, flatEn, opts = {}) {
  return renderGlobalHeader(flat, flatEn, {
    base: "../",
    ...opts,
    idSuffix: opts.idSuffix || "hub",
  });
}

/** Sticky company sub-nav (ABOUT · PORTFOLIO · NEWS · IDEAS · CONTACT), same pattern as Resources. */
export function renderCompanySwitcher(flat, flatEn, { active = "about", base = "../" } = {}) {
  const items = [
    { id: "about", path: "about/", label: "ABOUT" },
    { id: "portfolio", path: "portfolio/", label: "PORTFOLIO" },
    { id: "news", path: "news/", label: "NEWS" },
    { id: "ideas", path: "ideas/", label: "IDEAS" },
    { id: "contact", path: "contact/", label: "CONTACT" },
  ];
  const links = items
    .map((it) => {
      const isActive = it.id === active;
      const url = isActive ? "#" : href(base, it.path);
      return `<a class="co-switch__link${isActive ? " is-active" : ""}" href="${url}"${
        isActive ? ' aria-current="page"' : ""
      }>${it.label}</a>`;
    })
    .join("");
  const aria = escapeHtml(t(flat, flatEn, "nav.company", "Company"));
  return `<nav class="co-switch" aria-label="${aria}">
    <div class="co-switch__inner">
      <div class="co-switch__track">${links}</div>
    </div>
  </nav>`;
}

export function renderStudioFooter(flat, flatEn, { base = "../" } = {}) {
  const tf = (k, fb) => escapeHtml(pick(flat, flatEn, k) || fb);
  const b = base || "../";
  const resolve = (h) => (h.startsWith("../") ? b + h.slice(3) : h);
  const col = (titleKey, links) => `<div class="studio-footer__col">
      <p class="studio-footer__title">${tf(titleKey, titleKey)}</p>
      <ul class="studio-footer__list">${links.map(([k, h]) => `<li><a href="${resolve(h)}">${tf(k, k)}</a></li>`).join("")}</ul>
    </div>`;

  return `<footer class="site-footer studio-footer">
      <div class="container studio-footer__grid">
        ${col("footer.colProducts", [
          ["footer.linkApps", "../apps/"],
          ["footer.linkAi", "../ai/"],
          ["footer.linkSaas", "../saas/"],
          ["footer.linkGames", "../games/"],
          ["footer.linkTools", "../tools/"],
        ])}
        ${col("footer.colBusiness", [
          ["footer.linkMvp", "../business/mvp/"],
          ["footer.linkWebsite", "../business/web/"],
          ["footer.linkAppDev", "../business/app/"],
          ["footer.linkAiAuto", "../business/ai-automation/"],
          ["footer.linkWhitelabel", "../business/white-label/"],
          ["footer.linkDesign", "../business/design/"],
        ])}
        ${col("footer.colResources", [
          ["footer.linkStore", "../resources/store/"],
          ["footer.linkBlog", "../resources/blog/"],
          ["footer.linkMedia", "../resources/media/"],
          ["footer.linkLabs", "../resources/labs/"],
          ["nav.newsletter", "../resources/newsletter/"],
          ["nav.education", "../resources/education/"],
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
        ])}
        <div class="studio-footer__col studio-footer__col--contact">
          <p class="studio-footer__title">${tf("footer.colContact", "Contact")}</p>
          <a class="studio-footer__email" href="mailto:newon@newon.app">newon@newon.app</a>
          <p class="studio-footer__tagline">${tf("footer.taglineStudio", tf("footer.tagline", ""))}</p>
        </div>
      </div>
      <div class="container studio-footer__bottom">
        <p>© ${new Date().getFullYear()} Newon · ${tf("footer.rights", "All rights reserved.")}</p>
      </div>
    </footer>`;
}

export function renderHomeNavExtras() {
  return "";
}
