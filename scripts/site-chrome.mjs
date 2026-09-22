/**
 * Shared site chrome — Global Navigation with editorial mega menus.
 * Top-level: Consumer · AI · Livon · Ongil · Business · Studio · Company
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

const NAV_LABEL_KEYS = {
  consumer: "nav.topConsumer",
  ai: "nav.topAi",
  lifestage: "nav.topLifeStage",
  ongil: "nav.topOngil",
  business: "nav.topBusiness",
  studio: "nav.topStudio",
  company: "nav.topCompany",
};

const NAV_LABEL_FB = {
  consumer: "Consumer",
  ai: "AI",
  lifestage: "Livon",
  ongil: "Ongil",
  business: "Business",
  studio: "Studio",
  company: "Company",
};

function navTopLabel(flat, flatEn, id) {
  return escapeHtml(t(flat, flatEn, NAV_LABEL_KEYS[id], NAV_LABEL_FB[id]));
}

const MENU_META = {
  consumer: {
    kicker: "nav.consumerMenuLabel",
    lead: "nav.consumerMenuLead",
    footHref: "products/",
    footKey: "nav.viewAllProducts",
    footFb: "View all products →",
  },
  ai: {
    kicker: "nav.aiMenuLabel",
    lead: "nav.aiMenuLead",
    footHref: "ai/",
    footKey: "nav.aiExploreCta",
    footFb: "Explore Newon AI →",
  },
  lifestage: {
    kicker: "nav.lifeStageMenuLabel",
    lead: "nav.lifeStageMenuLead",
    footHref: "lifestage/",
    footKey: "nav.lifeStageExploreCta",
    footFb: "View Livon →",
  },
  ongil: {
    kicker: "nav.ongilMenuLabel",
    lead: "nav.ongilMenuLead",
    footHref: "ongil/",
    footKey: "nav.ongilExploreCta",
    footFb: "View Ongil →",
  },
  business: {
    kicker: "nav.businessMenuLabel",
    lead: "nav.businessMenuLead",
    footHref: "business/",
    footKey: "nav.businessExploreCta",
    footFb: "Explore Business →",
  },
  studio: {
    kicker: "nav.studioMenuLabel",
    lead: "nav.studioMenuLead",
    footHref: "studio/",
    footKey: "nav.studioExploreCta",
    footFb: "Explore Studio →",
  },
  company: {
    kicker: "nav.companyMenuLabel",
    lead: "nav.companyMenuLead",
    footHref: "about/",
    footKey: "nav.companyExploreCta",
    footFb: "About Newon →",
  },
};

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return v != null && v !== "" ? String(v) : fb;
}

function href(base, path, langDir = "") {
  if (!path) {
    if (langDir && (!base || base === "./")) return `/${langDir}/`;
    return base || "./";
  }
  if (path.startsWith("#")) {
    const home = langDir && (!base || base === "./") ? `/${langDir}/` : base || "./";
    if (!home || home === "./") return path;
    return `${home.replace(/\/?$/, "/")}#${path.slice(1)}`;
  }
  if (path.startsWith("/") || /^https?:/.test(path)) return path;
  const clean = path.replace(/^\.\//, "");
  if ((!base || base === "./") && langDir) return `/${langDir}/${clean}`;
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
  if (seg === "ai") return "ai";
  if (seg === "lifestage") return "lifestage";
  if (seg === "ongil") return "ongil";
  if (["products", "apps", "saas", "games", "tools", "ecosystem"].includes(seg)) return "consumer";
  if (seg === "business") {
    if (parts[1] === "creative" || parts[1] === "design") return "studio";
    return "business";
  }
  if (seg === "studio") return "studio";
  if (seg === "store" || (seg === "resources" && parts[1] === "store")) return "studio";
  if (seg === "labs" || (seg === "resources" && parts[1] === "labs")) return "studio";
  if (seg === "insights" || (seg === "resources" && parts[1] === "insights")) return "business";
  if (seg === "media" || (seg === "resources" && parts[1] === "media")) return "company";
  if (
    seg === "resources" ||
    seg === "company" ||
    ["about", "portfolio", "news", "ideas", "contact", "blog", "market"].includes(seg)
  ) {
    return "company";
  }
  return "";
}

const CHEVRON_SVG = `<svg class="gnav-dd__chev-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const MOON_SVG = `<svg class="gnav__theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function megaItemLimit(menuId) {
  if (menuId === "company") return 12;
  if (menuId === "consumer" || menuId === "ai" || menuId === "business" || menuId === "studio") return 8;
  return 4;
}

function isKoLocale(langDir = "") {
  return langDir === "ko";
}

function megaHead(flat, flatEn, menuId) {
  const meta = MENU_META[menuId];
  const kicker = escapeHtml(t(flat, flatEn, meta.kicker, menuId.toUpperCase()));
  const lead = escapeHtml(t(flat, flatEn, meta.lead));
  return `<div class="gnav-mega__head">
      <p class="gnav-mega__kicker">${kicker}</p>
      <p class="gnav-mega__lead">${lead}</p>
    </div>`;
}

function megaFoot(flat, flatEn, base, menuId, langDir = "") {
  const meta = MENU_META[menuId];
  const foot = escapeHtml(t(flat, flatEn, meta.footKey, meta.footFb));
  return `<p class="gnav-mega__foot"><a class="gnav-mega__foot-link" href="${href(base, meta.footHref, langDir)}">${foot}</a></p>`;
}

function editorialMega(flat, flatEn, base, menuId, langDir = "") {
  const items = (MEGA_DESTINATIONS[menuId] || []).slice(0, megaItemLimit(menuId));
  const many = items.length > 4 ? " gnav-mega__list--many" : "";
  const rows = items
    .map((item, i) => {
      const title = escapeHtml(t(flat, flatEn, item.titleKey, item.titleFb));
      const desc = escapeHtml(t(flat, flatEn, item.descKey));
      const n = String(i + 1).padStart(2, "0");
      return `<a class="gnav-mega__row" href="${href(base, item.href, langDir)}" role="menuitem">
      <span class="gnav-mega__row-n" aria-hidden="true">${n}</span>
      <span class="gnav-mega__row-main">
        <span class="gnav-mega__row-title">${title}</span>
        <span class="gnav-mega__row-desc">${desc}</span>
      </span>
      <span class="gnav-mega__row-arrow" aria-hidden="true">→</span>
    </a>`;
    })
    .join("");
  return `${megaHead(flat, flatEn, menuId)}
    <div class="gnav-mega__list gnav-mega__list--editorial${many}" role="none">
      ${rows}
    </div>
    ${megaFoot(flat, flatEn, base, menuId, langDir)}`;
}

const MEGA_RENDERERS = {
  consumer: (f, fe, b, ld) => editorialMega(f, fe, b, "consumer", ld),
  ai: (f, fe, b, ld) => editorialMega(f, fe, b, "ai", ld),
  lifestage: (f, fe, b, ld) => editorialMega(f, fe, b, "lifestage", ld),
  ongil: (f, fe, b, ld) => editorialMega(f, fe, b, "ongil", ld),
  business: (f, fe, b, ld) => editorialMega(f, fe, b, "business", ld),
  studio: (f, fe, b, ld) => editorialMega(f, fe, b, "studio", ld),
  company: (f, fe, b, ld) => editorialMega(f, fe, b, "company", ld),
};

function navMegaItem(flat, flatEn, base, activeNav, id) {
  const label = navTopLabel(flat, flatEn, id);
  const active = activeNav === id ? " gnav-dd--active" : "";
  const openAttr = activeNav === id ? ' aria-current="page"' : "";
  return `<div class="gnav-dd${active}" data-gnav-dd data-gnav-menu="${id}">
    <button type="button" class="gnav__link gnav-dd__trigger" aria-expanded="false" aria-haspopup="true"${openAttr}>
      ${label}${CHEVRON_SVG}
    </button>
  </div>`;
}

function navMegaPanel(flat, flatEn, base, id, langDir = "") {
  const body = MEGA_RENDERERS[id](flat, flatEn, base, langDir);
  return `<div class="gnav-mega" data-gnav-mega="${id}" role="menu" hidden>
      <div class="gnav-mega__panel">
        <div class="gnav-mega__inner">${body}</div>
      </div>
    </div>`;
}

function desktopNav(flat, flatEn, base, activeNav, langDir = "") {
  const triggers = TOP_NAV.map((id) => navMegaItem(flat, flatEn, base, activeNav, id)).join("\n            ");
  const panels = TOP_NAV.map((id) => navMegaPanel(flat, flatEn, base, id, langDir)).join("\n          ");
  return `<div class="gnav__nav-scroller">
            ${triggers}
          </div>
          ${panels}`;
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

function flattenMobileItems(menuId) {
  return (MEGA_DESTINATIONS[menuId] || []).slice(0, megaItemLimit(menuId)).map((d) => ({
    labelKey: d.titleKey,
    href: d.href,
    titleFb: d.titleFb,
  }));
}

function mobileNav(flat, flatEn, base, suffix, langDir = "") {
  const projectInquiry = escapeHtml(t(flat, flatEn, "nav.businessInquiryCtaMobile", "Project inquiry"));
  const themeLabel = escapeHtml(t(flat, flatEn, "common.themeToggle", "Theme"));
  const ko = isKoLocale(langDir);

  const sections = TOP_NAV.map((id) => {
    const label = navTopLabel(flat, flatEn, id);
    const hubHref = href(base, MENU_META[id].footHref, langDir);
    const items = flattenMobileItems(id);
    const links = items
      .map((item) => {
        const labelText = escapeHtml(
          ko && item.titleKo ? item.titleKo : t(flat, flatEn, item.labelKey, item.titleFb || "")
        );
        return `<a class="gnav-mobile__sublink" href="${href(base, item.href, langDir)}">${labelText}</a>`;
      })
      .join("");
    return `<div class="gnav-mobile__acc" data-gnav-acc>
        <div class="gnav-mobile__acc-head">
          <a class="gnav-mobile__acc-link" href="${hubHref}">${label}</a>
          <button type="button" class="gnav-mobile__acc-toggle" aria-expanded="false" aria-label="${label}">${CHEVRON_SVG}</button>
        </div>
        <div class="gnav-mobile__acc-panel" hidden>${links}</div>
      </div>`;
  }).join("\n        ");

  return `<div id="gnav-mobile-${suffix}" class="gnav-mobile" hidden aria-hidden="true">
      <button type="button" class="gnav-mobile__backdrop" data-gnav-close tabindex="-1" aria-label="${escapeHtml(t(flat, flatEn, "common.close", "Close"))}"></button>
      <div class="gnav-mobile__panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(t(flat, flatEn, "nav.menuLabel", "Menu"))}">
        <div class="gnav-mobile__scroll">
          <div class="gnav-mobile__util-row">
            ${langSelect(flat, flatEn, `lang-select-mobile-${suffix}`)}
            <button type="button" class="gnav__theme gnav__theme--mobile" data-theme-toggle data-label-light="${escapeHtml(t(flat, flatEn, "common.themeToLight", ""))}" data-label-dark="${escapeHtml(t(flat, flatEn, "common.themeToDark", ""))}" title="${themeLabel}" aria-label="${themeLabel}">${MOON_SVG}</button>
          </div>
          <div class="gnav-mobile__divider" aria-hidden="true"></div>
          ${sections}
          <div class="gnav-mobile__divider" aria-hidden="true"></div>
          <a class="gnav-mobile__cta btn btn-primary" href="${href(base, "business/inquiry/", langDir)}">${projectInquiry}</a>
        </div>
      </div>
    </div>`;
}

export function renderGlobalHeader(flat, flatEn, { activeNav = "", base = "../", idSuffix = "hub", langDir = "" } = {}) {
  const brand = escapeHtml(t(flat, flatEn, "nav.brandName", "Newon"));
  const brandHref = langDir && (!base || base === "./") ? `/${langDir}/` : base || "./";
  const langId = `lang-select-gnav-${idSuffix}`;
  const inquiry = escapeHtml(t(flat, flatEn, "nav.inquiryCta", "Contact"));
  const menuLabel = escapeHtml(t(flat, flatEn, "nav.menuLabel", "Menu"));
  const themeLabel = escapeHtml(t(flat, flatEn, "common.themeToDark", "Toggle theme"));
  const themeTitle = escapeHtml(t(flat, flatEn, "common.themeToggle", "Theme"));

  return `<header class="gnav site-header gnav--five" data-gnav>
      <div class="gnav__bar">
        <div class="gnav__inner">
          <a class="gnav__brand" href="${brandHref}" aria-label="${brand}">
            <img class="gnav__logo" src="/logo-nav.png" alt="" width="40" height="40" decoding="async" />
            <span class="gnav__wordmark">${brand}</span>
          </a>
          <nav class="gnav__nav" aria-label="${escapeHtml(t(flat, flatEn, "nav.mainAria", "Main"))}">
            ${desktopNav(flat, flatEn, base, activeNav, langDir)}
          </nav>
          <div class="gnav__util">
            <a class="gnav__cta" href="${href(base, "business/inquiry/", langDir)}">${inquiry}</a>
            ${langSelect(flat, flatEn, langId)}
            <button type="button" class="gnav__theme" data-theme-toggle data-label-light="${escapeHtml(t(flat, flatEn, "common.themeToLight", ""))}" data-label-dark="${escapeHtml(t(flat, flatEn, "common.themeToDark", ""))}" title="${themeTitle}" aria-label="${themeLabel}">${MOON_SVG}</button>
            <button type="button" class="gnav__menu-btn" data-gnav-toggle aria-expanded="false" aria-controls="gnav-mobile-${idSuffix}" aria-label="${menuLabel}">
              <span class="gnav__menu-icon" aria-hidden="true"><span></span><span></span></span>
            </button>
          </div>
        </div>
      </div>
      ${mobileNav(flat, flatEn, base, idSuffix, langDir)}
    </header>`;
}

export function renderStudioHeader(flat, flatEn, opts = {}) {
  return renderGlobalHeader(flat, flatEn, {
    base: "../",
    ...opts,
    idSuffix: opts.idSuffix || "hub",
  });
}

/** Sticky company sub-nav — disabled (global header only). */
export function renderCompanySwitcher(_flat, _flatEn, _opts = {}) {
  return "";
}

const FOOTER_THREADS_URL = "https://www.threads.com/@newon.app.dev?invite=0";
const FOOTER_BLOG_URL = "https://m.blog.naver.com/newonapp";
const FOOTER_TIKTOK_URL = "https://www.tiktok.com/@newon.app?_r=1&_t=ZS-95LGrSuOcfF";

export function renderStudioFooter(flat, flatEn, { base = "../", langDir = "" } = {}) {
  const brand = escapeHtml(t(flat, flatEn, "nav.brandName", "Newon"));
  const line = escapeHtml(t(flat, flatEn, "nav.companyFooterLine", "Digital product studio"));
  const resolve = (p) => href(base, p, langDir);
  return `<footer class="site-footer studio-footer--compact" data-site-footer>
    <div class="container studio-footer__inner">
      <div class="studio-footer__brand">
        <a class="studio-footer__logo" href="${resolve("")}">${brand}</a>
        <p class="studio-footer__tag">${line}</p>
      </div>
      <div class="studio-footer__links">
        <a href="${resolve("about/")}">${escapeHtml(t(flat, flatEn, "nav.aboutNewon", "About"))}</a>
        <a href="${resolve("business/")}">${escapeHtml(t(flat, flatEn, "nav.topBusiness", "Business"))}</a>
        <a href="${resolve("studio/")}">${escapeHtml(t(flat, flatEn, "nav.topStudio", "Studio"))}</a>
        <a href="${resolve("business/inquiry/")}">${escapeHtml(t(flat, flatEn, "nav.contact", "Contact"))}</a>
      </div>
      <div class="studio-footer__social">
        <a href="${FOOTER_THREADS_URL}" rel="noopener noreferrer" target="_blank">Threads</a>
        <a href="${FOOTER_BLOG_URL}" rel="noopener noreferrer" target="_blank">Blog</a>
        <a href="${FOOTER_TIKTOK_URL}" rel="noopener noreferrer" target="_blank">TikTok</a>
      </div>
      <p class="studio-footer__legal">
        <a class="footer-legal" href="${resolve("privacy/")}">Privacy</a>
        <a class="footer-legal" href="${resolve("terms/")}">Terms</a>
        <a class="footer-legal" href="${resolve("products/")}">Products</a>
      </p>
    </div>
  </footer>`;
}

export function renderHomeNavExtras() {
  return "";
}
