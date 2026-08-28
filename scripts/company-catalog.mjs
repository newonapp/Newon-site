/**
 * Company pages — local nav: About · Portfolio · News · Media · Contact
 * Ideas remains a route but is not a primary Company tab.
 */
export const COMPANY_PAGES = [
  { slug: "about", path: "about", navKey: "about", analytics: "company_about" },
  { slug: "portfolio", path: "portfolio", navKey: "portfolio", analytics: "company_portfolio" },
  { slug: "news", path: "news", navKey: "news", analytics: "company_news" },
  { slug: "media", path: "media", navKey: "media", analytics: "company_media" },
  { slug: "contact", path: "contact", navKey: "contact", analytics: "company_contact" },
];

export const COMPANY_NAV_LABELS = {
  about: { ko: "ABOUT", en: "ABOUT" },
  portfolio: { ko: "PORTFOLIO", en: "PORTFOLIO" },
  news: { ko: "NEWS", en: "NEWS" },
  media: { ko: "MEDIA", en: "MEDIA" },
  contact: { ko: "CONTACT", en: "CONTACT" },
  idea: { ko: "IDEA", en: "IDEA" },
};

/** /company/* → classic paths (meta-refresh). Details under portfolio/news stay original. */
export const COMPANY_HUB_REDIRECTS = [
  { from: "company", to: "about" },
  { from: "company/about", to: "about" },
  { from: "company/portfolio", to: "portfolio", indexOnly: true },
  { from: "company/news", to: "news", indexOnly: true },
  { from: "company/media", to: "media" },
  { from: "company/idea", to: "ideas" },
  { from: "company/contact", to: "contact" },
];

/** @deprecated kept for import safety — redirects now reverse */
export const COMPANY_LEGACY_REDIRECTS = COMPANY_HUB_REDIRECTS;
