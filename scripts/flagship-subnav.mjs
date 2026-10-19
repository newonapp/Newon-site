/**
 * Shared five-menu bar for the six flagship business sites
 * (BABYLOG · PETLOG · MY WORLD · SHAREON · LIVON · ONGIL).
 *
 *   01 Overview 개요 · 02 Platform 플랫폼 · 03 Business 비즈니스 · 04 Partnerships 파트너십 · 05 Contact 문의
 *
 * One markup + one stylesheet (/flagship-subnav.css) for every business, placed directly under
 * each page's first screen (hero). Only the point colour differs per business (data-biz).
 * Korean sub-labels are shown on Korean pages only.
 * Also used by the NEWON Business & Partnerships hub (biz: "bizpart", its own five screens; see BIZPART_PAGES)
 * and by NEWON Studio (biz: "studio", its own five screens; see STUDIO_PAGES).
 */

export const FLAGSHIP_SUBNAV_CSS = "/flagship-subnav.css?v=20261018fsn2";

const SLUG = { babylog: "babylog", petlog: "petlog", myworld: "myworld", shareon: "shareon", livon: "livon", ongil: "ongil", bizpart: "business", studio: "studio" };
const BRAND = { babylog: "BABYLOG", petlog: "PETLOG", myworld: "MY WORLD", shareon: "SHAREON", livon: "LIVON", ongil: "ONGIL", bizpart: "BUSINESS & PARTNERSHIPS", studio: "NEWON STUDIO" };
/** Korean aria label for the menu (the six businesses use "<BRAND> 메뉴"). */
const BRAND_KO = { bizpart: "비즈니스·파트너십", studio: "NEWON 스튜디오" };

export const FLAGSHIP_PAGES = [
  { id: "overview", n: "01", en: "Overview", ko: "개요", sub: "" },
  { id: "platform", n: "02", en: "Platform", ko: "플랫폼", sub: "platform/" },
  { id: "business", n: "03", en: "Business", ko: "비즈니스", sub: "business/" },
  { id: "partnerships", n: "04", en: "Partnerships", ko: "파트너십", sub: "partnerships/" },
  { id: "contact", n: "05", en: "Contact", ko: "문의", sub: "contact/" },
];

/**
 * NEWON Business & Partnerships hub (/{lang}/business/, 2026-10-19) uses the same bar with its own five screens.
 * Selected with biz: "bizpart"; the six businesses keep FLAGSHIP_PAGES (their output is unchanged).
 */
export const BIZPART_PAGES = [
  { id: "overview", n: "01", en: "Overview", ko: "개요", sub: "" },
  { id: "platforms", n: "02", en: "Our Platforms", ko: "플랫폼", sub: "platforms/" },
  { id: "models", n: "03", en: "Business Models", ko: "비즈니스 모델", sub: "models/" },
  { id: "partnerships", n: "04", en: "Partnerships", ko: "파트너십", sub: "partnerships/" },
  { id: "contact", n: "05", en: "Contact", ko: "문의", sub: "contact/" },
];
/**
 * NEWON Studio (/{lang}/studio/, 2026-10-19): five screens; the six platform product pages
 * (/{lang}/studio/platforms/{id}/) show this bar with "Our Platforms" active.
 */
export const STUDIO_PAGES = [
  { id: "overview", n: "01", en: "Overview", ko: "개요", sub: "" },
  { id: "store", n: "02", en: "Digital Store", ko: "스토어", sub: "store/" },
  { id: "platforms", n: "03", en: "Our Platforms", ko: "플랫폼", sub: "platforms/" },
  { id: "business", n: "04", en: "Business Products", ko: "기업용 제품", sub: "business/" },
  { id: "contact", n: "05", en: "Contact", ko: "문의", sub: "contact/" },
];
const PAGES_FOR = { bizpart: BIZPART_PAGES, studio: STUDIO_PAGES };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Page id aliases used by the individual renderers. */
const ALIAS = { index: "overview", "": "overview", home: "overview" };

/**
 * @param {{ biz: keyof typeof SLUG, lang: string, active: string }} o
 * @returns {string} <nav class="fsn"> markup
 */
export function renderFlagshipSubnav({ biz, lang, active }) {
  const cur = ALIAS[active] ?? active;
  const ko = lang === "ko";
  const items = (PAGES_FOR[biz] || FLAGSHIP_PAGES).map((p) => {
    const on = p.id === cur;
    return `<li><a class="fsn__a" href="/${esc(lang)}/${SLUG[biz]}/${p.sub}"${on ? ' aria-current="page"' : ""}><span class="fsn__n">${p.n}</span><span class="fsn__en">${p.en}</span>${ko ? `<span class="fsn__ko">${p.ko}</span>` : ""}</a></li>`;
  }).join("");
  const label = ko ? `${BRAND_KO[biz] || BRAND[biz]} 메뉴` : `${BRAND[biz]} menu`;
  return `<nav class="fsn" data-biz="${biz}" aria-label="${esc(label)}">
  <div class="fsn__in">
    <a class="fsn__brand" href="/${esc(lang)}/${SLUG[biz]}/"><span class="fsn__dot" aria-hidden="true"></span>${esc(BRAND[biz])}</a>
    <ol class="fsn__list">${items}</ol>
  </div>
</nav>`;
}
