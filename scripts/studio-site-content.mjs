/**
 * NEWON Studio — shared data for the eleven Studio screens (/{lang}/studio/…).
 *
 *   01 Overview            /{lang}/studio/
 *   02 Digital Store       /{lang}/studio/store/
 *   03 Our Platforms       /{lang}/studio/platforms/
 *        + six platform product pages /{lang}/studio/platforms/{babylog,petlog,myworld,shareon,livon,ongil}/
 *   04 Business Products   /{lang}/studio/business/
 *   05 Contact             /{lang}/studio/contact/
 *
 * Source: the owner's "NEWON STUDIO — CONTENT DEPTH EXPANSION" brief (2026-10-19). Copy lives in
 * studio-site-copy-ko.mjs (ko) and studio-site-copy-en.mjs (en, meaning-checked draft, not native-reviewed);
 * the other seven locales show the English body inside lang="en" until reviewed translations exist.
 *
 * Facts used for "available today" (everything else is a 기획 후보 / planned product family):
 *   - 13 free web tools: scripts/tools-data.mjs (status "live") → /{lang}/tools/
 *   - NEWON Project Starter Kit: scripts/resources-data.mjs (status "live", buyable) → /{lang}/resources/store/newon-project-starter-kit/
 *     (purchase by inquiry, DOCX/PDF delivered by e-mail; the price is shown only on its own Store page)
 * No prices, customers, reviews or revenue figures appear on the Studio screens. No refund policy is
 * invented: visitors are pointed to the conditions shown on each product page / at purchase.
 */
import { STUDIO_PAGE_FILM_SRC } from "./studio-film-copy.mjs";
import { STUDIO_PAGES } from "./flagship-subnav.mjs";

export const ST_SLUG = "studio";
/** The five screens (order = sub-menu order). `sub` relative to /{lang}/studio/ (no trailing slash). */
export const ST_NAV = STUDIO_PAGES.map((p) => ({ ...p, sub: p.sub.replace(/\/$/, "") }));
/** First-screen film of every Studio screen (owner choice 2026-10-19; constant owned by studio-film-copy.mjs). */
export const ST_FILM = STUDIO_PAGE_FILM_SRC;

/** The six platforms (order = NEWON business row). `site` = the platform's own website folder. */
export const ST_PLATFORMS = [
  { id: "babylog", name: "BABYLOG", site: "babylog", category: "Parenting & Family" },
  { id: "petlog", name: "PETLOG", site: "petlog", category: "Pet Life" },
  { id: "myworld", name: "MY WORLD", site: "myworld", category: "Travel & Experience" },
  { id: "shareon", name: "SHAREON", site: "shareon", category: "Asset Sharing & Rental" },
  { id: "livon", name: "LIVON", site: "livon", category: "Life Stage" },
  { id: "ongil", name: "ONGIL", site: "ongil", category: "Senior Life" },
];

/** Products that really exist today (see header). `href` is below /{lang}/. */
export const ST_AVAILABLE = [
  { id: "tools", href: "tools/", kind: "free" },
  { id: "starter-kit", href: "resources/store/newon-project-starter-kit/", kind: "store" },
];
/** The Newon Store (existing catalogue; purchases happen there, never on the Studio screens). */
export const ST_STORE_HREF = "resources/store/";

/** Contact: the six inquiry types (value = what reaches the inbox; code = ?type= preselection). */
export const ST_INQUIRY_TYPES = [
  { code: "product", value: "STUDIO / Product information", ko: ["제품 정보 문의", "구매 전 구성·형식·호환 확인"], en: ["Product information", "Contents, format and fit before buying"] },
  { code: "purchase", value: "STUDIO / Purchase & download", ko: ["구매·다운로드 문의", "구매 절차, 파일 전달, 재전달"], en: ["Purchase & download", "Buying steps, file delivery, re-sending"] },
  { code: "usage", value: "STUDIO / Software usage", ko: ["소프트웨어 사용 문의", "설치·기능·사용 방법"], en: ["Software usage", "Setup, features and how to use"] },
  { code: "business", value: "STUDIO / Business products", ko: ["기업용 제품 문의", "업종별 표준 제품 도입 검토"], en: ["Business products", "Reviewing standard products for your organisation"] },
  { code: "license", value: "STUDIO / Product licence", ko: ["라이선스 문의", "개인·상업·팀·기업 이용 범위"], en: ["Product licence", "Personal, commercial, team and business use"] },
  { code: "support", value: "STUDIO / Technical support", ko: ["기술 지원 문의", "오류, 파일 열람, 브라우저 문제"], en: ["Technical support", "Errors, opening files, browser issues"] },
];
/** Contact: product area select (value = inbox label; code = ?area= preselection). */
export const ST_INQUIRY_AREAS = [
  { code: "general", value: "Studio (general)", ko: "Studio 전반", en: "Studio in general" },
  { code: "store", value: "Digital Store", ko: "디지털 스토어 제품", en: "Digital Store products" },
  ...ST_PLATFORMS.map((p) => ({ code: p.id, value: `${p.name} products`, ko: `${p.name} 연계 제품`, en: `${p.name} products` })),
  { code: "business", value: "Business products", ko: "기업용 제품", en: "Business products" },
];
