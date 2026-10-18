/**
 * Shared five-menu bar for the six flagship business sites
 * (BABYLOG · PETLOG · MY WORLD · SHAREON · LIVON · ONGIL).
 *
 *   01 Overview 개요 · 02 Platform 플랫폼 · 03 Business 비즈니스 · 04 Partnerships 파트너십 · 05 Contact 문의
 *
 * One markup + one stylesheet (/flagship-subnav.css) for every business, placed directly under
 * each page's first screen (hero). Only the point colour differs per business (data-biz).
 * Korean sub-labels are shown on Korean pages only.
 */

export const FLAGSHIP_SUBNAV_CSS = "/flagship-subnav.css?v=20261018fsn2";

const SLUG = { babylog: "babylog", petlog: "petlog", myworld: "myworld", shareon: "shareon", livon: "livon", ongil: "ongil" };
const BRAND = { babylog: "BABYLOG", petlog: "PETLOG", myworld: "MY WORLD", shareon: "SHAREON", livon: "LIVON", ongil: "ONGIL" };

export const FLAGSHIP_PAGES = [
  { id: "overview", n: "01", en: "Overview", ko: "개요", sub: "" },
  { id: "platform", n: "02", en: "Platform", ko: "플랫폼", sub: "platform/" },
  { id: "business", n: "03", en: "Business", ko: "비즈니스", sub: "business/" },
  { id: "partnerships", n: "04", en: "Partnerships", ko: "파트너십", sub: "partnerships/" },
  { id: "contact", n: "05", en: "Contact", ko: "문의", sub: "contact/" },
];

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
  const items = FLAGSHIP_PAGES.map((p) => {
    const on = p.id === cur;
    return `<li><a class="fsn__a" href="/${esc(lang)}/${SLUG[biz]}/${p.sub}"${on ? ' aria-current="page"' : ""}><span class="fsn__n">${p.n}</span><span class="fsn__en">${p.en}</span>${ko ? `<span class="fsn__ko">${p.ko}</span>` : ""}</a></li>`;
  }).join("");
  const label = ko ? `${BRAND[biz]} 메뉴` : `${BRAND[biz]} menu`;
  return `<nav class="fsn" data-biz="${biz}" aria-label="${esc(label)}">
  <div class="fsn__in">
    <a class="fsn__brand" href="/${esc(lang)}/${SLUG[biz]}/"><span class="fsn__dot" aria-hidden="true"></span>${BRAND[biz]}</a>
    <ol class="fsn__list">${items}</ol>
  </div>
</nav>`;
}
