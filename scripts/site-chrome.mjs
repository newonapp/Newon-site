/**
 * Shared site chrome — Global Navigation with editorial mega menus.
 * Top-level: Consumer · AI · LivOn · Ongil · Business · Studio · Company
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
  consumer: "Apps",
  ai: "AI",
  lifestage: "LivOn",
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
    footFb: "View LivOn →",
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
  if (["products", "apps", "saas", "games", "ecosystem"].includes(seg)) return "consumer";
  if (seg === "tools") return "business";
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

function navMegaItem(flat, flatEn, base, activeNav, id, langDir = "") {
  const label = navTopLabel(flat, flatEn, id);
  const active = activeNav === id ? " gnav-dd--active" : "";
  const openAttr = activeNav === id ? ' aria-current="page"' : "";
  if (id === "lifestage" || id === "ongil") {
    const dest = href(base, id === "lifestage" ? "lifestage/" : "ongil/", langDir);
    return `<div class="gnav-dd${active}" data-gnav-dd data-gnav-menu="${id}">
    <a class="gnav__link gnav-dd__label" href="${dest}"${openAttr}>${label}</a>
    <button type="button" class="gnav__link gnav-dd__trigger" aria-expanded="false" aria-haspopup="true" aria-label="${label}">
      ${CHEVRON_SVG}
    </button>
  </div>`;
  }
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
  const triggers = TOP_NAV.map((id) => navMegaItem(flat, flatEn, base, activeNav, id, langDir)).join("\n            ");
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

const FOOTER_MENUS = [
  ["consumer", "products/"],
  ["ai", "ai/"],
  ["lifestage", "lifestage/"],
  ["ongil", "ongil/"],
  ["business", "business/"],
  ["studio", "studio/"],
  ["company", "about/"],
];

const FOOT_SVG_OPEN = `<svg class="site-foot__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">`;

function footIcon(url, label, inner, { external = true } = {}) {
  const extra = external ? ` target="_blank" rel="noopener noreferrer"` : "";
  return `<a class="site-foot__icon" href="${escapeHtml(url)}" aria-label="${escapeHtml(label)}"${extra}>${FOOT_SVG_OPEN}${inner}</svg></a>`;
}

export function renderStudioFooter(flat, flatEn, { base = "../", langDir = "" } = {}) {
  const brand = escapeHtml(t(flat, flatEn, "nav.brandName", "Newon"));
  const tagline = escapeHtml(t(flat, flatEn, "footer.tagline", "Connecting ideas to reality—and making everyday life easier as a global life platform."));
  const rights = escapeHtml(t(flat, flatEn, "footer.rights", "All rights reserved."));
  const resolve = (p) => href(base, p, langDir);
  const menuLinks = FOOTER_MENUS.map(([id, path]) => `<a href="${resolve(path)}">${navTopLabel(flat, flatEn, id)}</a>`).join("");
  const privacy = `<a href="${resolve("privacy/")}">${escapeHtml(t(flat, flatEn, "footer.privacy", "Privacy Policy"))}</a>`;
  const terms = `<a href="${resolve("terms/")}">${escapeHtml(t(flat, flatEn, "footer.terms", "Terms of Service"))}</a>`;
  const icons = [
    footIcon(
      "mailto:newon@newon.app",
      t(flat, flatEn, "footer.emailAria", "Email newon@newon.app"),
      `<path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" points="22,6 12,13 2,6"/>`,
      { external: false }
    ),
    footIcon(
      t(flat, flatEn, "footer.instagramUrl", "https://www.instagram.com/newon.app"),
      t(flat, flatEn, "footer.instagramAria", "Newon Instagram"),
      `<path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>`
    ),
    footIcon(
      t(flat, flatEn, "footer.youtubeUrl", "https://www.youtube.com/@newonapp"),
      t(flat, flatEn, "footer.youtubeAria", "Newon YouTube"),
      `<path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>`
    ),
    footIcon(
      t(flat, flatEn, "footer.threadsUrl", FOOTER_THREADS_URL),
      t(flat, flatEn, "footer.threadsAria", "Newon Threads"),
      `<path fill="currentColor" d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z"/>`
    ),
    footIcon(
      FOOTER_BLOG_URL,
      t(flat, flatEn, "footer.blogAria", "Newon Blog"),
      `<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M5 2H19A3 3 0 0 1 22 5V19A3 3 0 0 1 19 22H5A3 3 0 0 1 2 19V5A3 3 0 0 1 5 2ZM8 6.5H10.2V10.5H16V17.5H8ZM11.8 12.7H14.2V15.3H11.8Z"/>`
    ),
    footIcon(
      t(flat, flatEn, "footer.tiktokUrl", FOOTER_TIKTOK_URL),
      t(flat, flatEn, "footer.tiktokAria", "Newon TikTok"),
      `<path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.28v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>`
    ),
  ].join("");
  return `<footer class="site-footer site-footer--brand studio-footer--compact" data-site-footer>
    <div class="container site-foot">
      <a class="site-foot__brand" href="${resolve("")}">
        <img src="/logo-nav.png" alt="" width="34" height="34" />
        <span>${brand}</span>
      </a>
      <a class="site-foot__url" href="https://newon.app">https://newon.app</a>
      <p class="site-foot__tagline">${tagline}</p>
      <nav class="site-foot__nav" aria-label="Footer">${menuLinks}${privacy}${terms}</nav>
      <div class="site-foot__icons" role="group" aria-label="${escapeHtml(t(flat, flatEn, "footer.socialAria", "Contact and social"))}">${icons}</div>
      <p class="site-foot__copy">© 2026 ${brand}. ${rights}</p>
    </div>
  </footer>`;
}

export function renderHomeNavExtras() {
  return "";
}
