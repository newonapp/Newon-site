/**
 * Shared site chrome — Global Navigation with editorial mega menus.
 * Top-level: Products · Business · Studio · Resources · Company
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { MEGA_DESTINATIONS, TOP_NAV } from "./venture-studio-data.mjs";

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
  studio: "Studio",
  resources: "Resources",
  company: "Company",
};

const MENU_META = {
  products: { kicker: "nav.productsMenuLabel", lead: "nav.productsMenuLead", footHref: "products/", footKey: "nav.viewAllProducts", footFb: "View all products →" },
  business: { kicker: "nav.businessMenuLabel", lead: "nav.businessMenuLead", footHref: "business/", footKey: "nav.businessExploreCta", footFb: "Explore Business →" },
  studio: { kicker: "nav.studioMenuLabel", lead: "nav.studioMenuLead", footHref: "studio/", footKey: "nav.studioExploreCta", footFb: "Explore Studio →" },
  resources: { kicker: "nav.resourcesMenuLabel", lead: "nav.resourcesMenuLead", footHref: "resources/", footKey: "nav.resourcesExploreCta", footFb: "Explore Resources →" },
  company: { kicker: "nav.companyMenuLabel", lead: "nav.companyMenuLead", footHref: "about/", footKey: "nav.companyExploreCta", footFb: "About Newon →" },
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
  const parts = p.split("/").filter(Boolean);
  const seg = parts[0] || "";
  if (["products", "apps", "ai", "saas", "games", "tools"].includes(seg)) return "products";
  if (seg === "business") {
    // creative stays under Studio in nav, but URL preserved
    if (parts[1] === "creative" || parts[1] === "design") return "studio";
    return "business";
  }
  if (seg === "studio") return "studio";
  if (seg === "resources" || ["store", "blog", "media", "labs", "market"].includes(seg)) return "resources";
  if (seg === "company" || ["about", "portfolio", "news", "ideas", "contact"].includes(seg)) return "company";
  return "";
}

const CHEVRON_SVG = `<svg class="gnav-dd__chev-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const MOON_SVG = `<svg class="gnav__theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** Editorial mega: max 4 numbered destinations */
function editorialMega(flat, flatEn, base, menuId) {
  const meta = MENU_META[menuId];
  const kicker = escapeHtml(t(flat, flatEn, meta.kicker, menuId.toUpperCase()));
  const lead = escapeHtml(t(flat, flatEn, meta.lead));
  const foot = escapeHtml(t(flat, flatEn, meta.footKey, meta.footFb));
  const items = (MEGA_DESTINATIONS[menuId] || []).slice(0, 4);
  const rows = items
    .map((item, i) => {
      const title = escapeHtml(t(flat, flatEn, item.titleKey, item.titleFb));
      const desc = escapeHtml(t(flat, flatEn, item.descKey));
      const n = String(i + 1).padStart(2, "0");
      return `<a class="gnav-mega__row" href="${href(base, item.href)}" role="menuitem">
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
    <div class="gnav-mega__list gnav-mega__list--editorial" role="none">
      ${rows}
    </div>
    <p class="gnav-mega__foot"><a class="gnav-mega__foot-link" href="${href(base, meta.footHref)}">${foot}</a></p>`;
}

const MEGA_RENDERERS = Object.fromEntries(TOP_NAV.map((id) => [id, (f, fe, b) => editorialMega(f, fe, b, id)]));

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
  return TOP_NAV.map((id) => navMegaItem(flat, flatEn, base, activeNav, id)).join("\n          ");
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

/** Mobile: 5 accordions × max 4 destinations */
const MOBILE_MENUS = Object.fromEntries(
  TOP_NAV.map((id) => [
    id,
    (MEGA_DESTINATIONS[id] || []).slice(0, 4).map((d) => ({
      labelKey: d.titleKey,
      href: d.href,
      titleFb: d.titleFb,
    })),
  ])
);

function mobileNav(flat, flatEn, base, suffix) {
  const projectInquiry = escapeHtml(t(flat, flatEn, "nav.businessInquiryCtaMobile", "Project inquiry"));
  const themeLabel = escapeHtml(t(flat, flatEn, "common.themeToggle", "Theme"));

  const sections = TOP_NAV.map((id) => {
    const label = NAV_LABELS[id];
    const items = MOBILE_MENUS[id] || [];
    const links = items
      .map((item) => {
        const labelText = escapeHtml(t(flat, flatEn, item.labelKey, item.titleFb || ""));
        return `<a class="gnav-mobile__sublink" href="${href(base, item.href)}">${labelText}</a>`;
      })
      .join("");
    return `<div class="gnav-mobile__acc" data-gnav-acc>
        <button type="button" class="gnav-mobile__acc-trigger" aria-expanded="false">${label}${CHEVRON_SVG}</button>
        <div class="gnav-mobile__acc-panel" hidden>${links}</div>
      </div>`;
  }).join("\n        ");

  return `<div id="gnav-mobile-${suffix}" class="gnav-mobile" hidden aria-hidden="true">
      <div class="gnav-mobile__panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(t(flat, flatEn, "nav.menuLabel", "Menu"))}">
        <div class="gnav-mobile__scroll">
          ${sections}
          <div class="gnav-mobile__divider" aria-hidden="true"></div>
          <a class="gnav-mobile__cta btn btn-primary" href="${href(base, "business/inquiry/")}">${projectInquiry}</a>
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

  return `<header class="gnav site-header gnav--five" data-gnav>
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
            <a class="gnav__cta" href="${href(base, "business/inquiry/")}">${inquiry}</a>
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

/** Sticky company sub-nav — company info only */
export function renderCompanySwitcher(flat, flatEn, { active = "about", base = "../" } = {}) {
  const items = [
    { id: "about", path: "about/", label: "ABOUT" },
    { id: "portfolio", path: "portfolio/", label: "PORTFOLIO" },
    { id: "news", path: "news/", label: "NEWS" },
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
  const col = (titleKey, links, titleFb) => `<div class="studio-footer__col">
      <p class="studio-footer__title">${tf(titleKey, titleFb || titleKey)}</p>
      <ul class="studio-footer__list">${links.map(([k, h, fb]) => `<li><a href="${resolve(h)}">${tf(k, fb || k)}</a></li>`).join("")}</ul>
    </div>`;

  return `<footer class="site-footer studio-footer">
      <div class="container studio-footer__grid studio-footer__grid--five">
        ${col("footer.colProducts", [
          ["footer.linkApps", "../apps/", "Apps"],
          ["footer.linkAi", "../ai/", "AI"],
          ["footer.linkGames", "../games/", "Games"],
          ["footer.linkTools", "../tools/", "Tools"],
        ], "PRODUCTS")}
        ${col("footer.colBusiness", [
          ["footer.linkBuild", "../business/build/", "Build"],
          ["footer.linkAutomation", "../business/automation/", "Automation"],
          ["footer.linkResearch", "../business/research/", "Research"],
          ["footer.linkSolutions", "../business/solutions/", "Solutions"],
        ], "BUSINESS")}
        ${col("footer.colStudio", [
          ["footer.linkBrand", "../studio/brand/", "Brand"],
          ["footer.linkDigital", "../studio/digital/", "Digital"],
          ["footer.linkContent", "../studio/content/", "Content"],
          ["footer.linkIp", "../studio/ip/", "IP"],
        ], "STUDIO")}
        ${col("footer.colResources", [
          ["footer.linkStore", "../resources/store/", "Store"],
          ["footer.linkInsights", "../resources/insights/", "Insights"],
          ["footer.linkBlog", "../resources/blog/", "Blog"],
          ["footer.linkLabs", "../resources/labs/", "Labs"],
        ], "RESOURCES")}
        ${col("footer.colCompany", [
          ["footer.about", "../about/", "About"],
          ["footer.portfolio", "../portfolio/", "Portfolio"],
          ["nav.newsUpdates", "../news/", "News"],
          ["nav.contact", "../contact/", "Contact"],
        ], "COMPANY")}
      </div>
      <div class="container studio-footer__bottom studio-footer__bottom--brand">
        <div class="studio-footer__brand-row">
          <img class="studio-footer__logo" src="/logo.png" alt="" width="28" height="28" decoding="async" />
          <div>
            <p class="studio-footer__brand-name">Newon</p>
            <p class="studio-footer__tagline">${tf("footer.taglineStudio", "Product & Venture Studio")}</p>
          </div>
          <div class="studio-footer__legal-inline">
            <a href="${resolve("../privacy/")}">${tf("footer.privacy", "Privacy")}</a>
            <a href="${resolve("../terms/")}">${tf("footer.terms", "Terms")}</a>
            <a class="studio-footer__email" href="mailto:newon@newon.app">newon@newon.app</a>
          </div>
        </div>
        <p>© ${new Date().getFullYear()} Newon · ${tf("footer.rights", "All rights reserved.")}</p>
      </div>
    </footer>`;
}

export function renderHomeNavExtras() {
  return "";
}
