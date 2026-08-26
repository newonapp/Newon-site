/**
 * Company pages live at classic paths (about / portfolio / news / ideas / contact)
 * with company.css design. /company/* redirects here.
 */
export const COMPANY_PAGES = [
  { slug: "about", path: "about", navKey: "about", analytics: "company_about" },
  { slug: "portfolio", path: "portfolio", navKey: "portfolio", analytics: "company_portfolio" },
  { slug: "news", path: "news", navKey: "news", analytics: "company_news" },
  { slug: "idea", path: "ideas", navKey: "idea", analytics: "company_idea" },
  { slug: "contact", path: "contact", navKey: "contact", analytics: "company_contact" },
];

export const COMPANY_NAV_LABELS = {
  about: { ko: "ABOUT", en: "ABOUT" },
  portfolio: { ko: "PORTFOLIO", en: "PORTFOLIO" },
  news: { ko: "NEWS", en: "NEWS" },
  idea: { ko: "IDEA", en: "IDEA" },
  contact: { ko: "CONTACT", en: "CONTACT" },
};

/** /company/* → classic paths (meta-refresh). Details under portfolio/news stay original. */
export const COMPANY_HUB_REDIRECTS = [
  { from: "company", to: "about" },
  { from: "company/about", to: "about" },
  { from: "company/portfolio", to: "portfolio", indexOnly: true },
  { from: "company/news", to: "news", indexOnly: true },
  { from: "company/idea", to: "ideas" },
  { from: "company/contact", to: "contact" },
];

/** @deprecated kept for import safety — redirects now reverse */
export const COMPANY_LEGACY_REDIRECTS = COMPANY_HUB_REDIRECTS;
