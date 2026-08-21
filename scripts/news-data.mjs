/**
 * Official Newon News & Updates — single source of truth.
 *
 * Rules:
 * - Only published:true items appear on the live site.
 * - Do not invent store dates, versions, download counts, ratings, or features.
 * - Add articles here; run `node scripts/render-news.mjs` (or build-i18n).
 *
 * Article shape:
 * {
 *   id, slug, date (YYYY-MM-DD), category, published,
 *   featured?, includeInLatest?, relatedProduct?, product?,
 *   version?, imageFile?, imageAlt?, appStoreUrl?, googlePlayUrl?, productUrl?,
 *   activity?, showInTimeline?, copy: { ko, en, ... }
 * }
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { APP_CATALOG } from "./portfolio-data.mjs";

export {
  PRODUCT_HISTORY,
  historyFilterBucket,
  HISTORY_TYPE_FILTERS,
  buildTimelineEntries,
  groupTimelineEntries,
  formatHistoryDisplayDate,
  historyDatetimeAttr,
  historyTypeLabelKey,
} from "./product-history-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEWS_I18N_PATH = path.join(__dirname, "news-copy-i18n.json");

function loadNewsI18n() {
  try {
    if (fs.existsSync(NEWS_I18N_PATH)) {
      return JSON.parse(fs.readFileSync(NEWS_I18N_PATH, "utf8"));
    }
  } catch {
    /* ignore */
  }
  return {};
}

const NEWS_I18N = loadNewsI18n();

export const NEWS_CATEGORIES = ["all", "launch", "update", "feature", "company", "notice"];
export const NEWS_PAGE_SIZE = 9;
export const NEWS_TL_PREVIEW = 24;
export const NEW_BADGE_DAYS = 14;

/** Official developer store pages (verified). */
export const NEWS_STORE_DEV = {
  appStore: "https://apps.apple.com/developer/nawon-kyung/id1896528749",
  googlePlay: "https://play.google.com/store/apps/dev?id=8016507493063681249",
};

/** Real social profiles already used on newon.app — omit if a URL is retired. */
export const NEWS_SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/newon.app.global",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://youtube.com/@newonglobal",
  },
];

/**
 * Product filter + related-product map.
 * Order matches the News “제품별 보기” UI.
 * 404: HUMAN is included for filtering; results only appear when articles exist.
 */
export const NEWS_PRODUCTS = [
  { slug: "ox-month", name: "OX MONTH", icon: "/ox-month-logo.png", catalog: true },
  { slug: "subping", name: "SubPing", icon: "/subping-logo.png", catalog: true },
  { slug: "pillmate", name: "Pillmate", icon: "/pillmate-logo.png", catalog: true },
  { slug: "savy", name: "SAVY", icon: "/savy-logo.png", catalog: true },
  { slug: "babylog", name: "BabyLog", icon: "/babylog-logo.png", catalog: true },
  { slug: "petlog", name: "PetLog", icon: "/petlog-logo.png", catalog: true },
  { slug: "piggyup", name: "PiggyUp", icon: "/piggyup-logo.png", catalog: true },
  { slug: "goalup", name: "GoalUp", icon: "/goalup-logo.png", catalog: true },
  { slug: "countup", name: "CountUp", icon: "/countup-logo.png", catalog: true },
  { slug: "newon-plus", name: "Newon+", icon: "/newon-plus-logo.png", catalog: true },
  { slug: "myworld", name: "My World", icon: "/myworld-logo.png", catalog: true },
  {
    slug: "404-human",
    name: "404: HUMAN",
    icon: "/404-human-logo.png",
    catalog: false,
    pageHref: "/{{LANG}}/404-human/",
  },
];

/**
 * Optional highlight strip — product slugs only (no invented launch dates).
 * Leave empty to auto-fill from category:"launch" articles, or hide when none.
 */
export const NEWS_LATEST_PRODUCT_SLUGS = [];

export const NEWS_ARTICLES = [
  {
    id: "petlog-community-update",
    slug: "petlog-community-update",
    date: "2026-08-19",
    category: "update",
    featured: true,
    includeInLatest: true,
    published: true,
    relatedProduct: "petlog",
    showInTimeline: true,
    imageFile: "pl-showcase-04.png",
    imageAlt: {
      ko: "PetLog 커뮤니티 화면",
      en: "PetLog community screen",
    },
    activity: {
      area: { ko: "Community", en: "Community" },
      label: { ko: "커뮤니티 경험 개선", en: "Community experience improved" },
      verb: "UPDATED",
    },
    copy: {
      ko: {
        title: "PetLog 커뮤니티가 새로워졌습니다.",
        titleHtml: "PetLog 커뮤니티가<br />새로워졌습니다.",
        latestTitle: "PetLog의 새로운 커뮤니티를 만나보세요.",
        summary:
          "사용자들이 더 편리하게 이야기를 나누고 필요한 정보를 발견할 수 있도록 PetLog의 커뮤니티 경험을 개선했습니다.",
        lead:
          "더 편리하게 이야기를 나누고 필요한 정보를 발견할 수 있도록 커뮤니티 경험을 개선했습니다.",
        timelineLabel: "커뮤니티 경험 개선",
        featureName: "",
        paragraphs: [
          "PetLog 커뮤니티를 더 읽고, 남기고, 이어가기 쉽게 다듬었습니다.",
          "반려 생활의 작은 기록과 질문을 다른 보호자와 나누는 흐름이 부드러워졌고, 게시글을 찾고 이어 읽는 경험도 함께 정리했습니다.",
        ],
        whatsNew: [
          {
            title: "새로운 커뮤니티",
            body: "사용자들이 자유롭게 이야기를 나눌 수 있는 커뮤니티 경험을 개선했습니다.",
          },
          {
            title: "게시글 경험 개선",
            body: "글을 읽고 남기는 흐름을 더 단순하게 정리했습니다.",
          },
          {
            title: "사용성 개선",
            body: "커뮤니티를 오가는 기본 동작을 더 빠르고 분명하게 맞췄습니다.",
          },
        ],
      },
      en: {
        title: "PetLog community, renewed.",
        titleHtml: "PetLog community,<br />renewed.",
        latestTitle: "Meet the new PetLog community.",
        summary:
          "We improved PetLog community so people can share more comfortably and discover what they need.",
        lead:
          "Community is easier to read, post, and follow — so pet owners can share more comfortably.",
        timelineLabel: "Community experience improved",
        featureName: "",
        paragraphs: [
          "We refined PetLog community so it is easier to read, write, and continue a conversation.",
          "Sharing everyday pet-care notes and questions with other owners should feel simpler, and finding a post to keep reading should feel clearer too.",
        ],
        whatsNew: [
          {
            title: "A clearer community",
            body: "We improved the community so people can share more freely.",
          },
          {
            title: "Better posting",
            body: "Reading and writing posts follows a simpler path.",
          },
          {
            title: "Usability",
            body: "Moving through community is faster and more obvious.",
          },
        ],
      },
    },
  },
];

export function productBySlug(slug) {
  if (!slug) return null;
  const newsProduct = NEWS_PRODUCTS.find((p) => p.slug === slug);
  const catalog = APP_CATALOG.find((a) => a.slug === slug) || null;
  if (!newsProduct && !catalog) return null;
  return {
    slug,
    name: (catalog && catalog.name) || (newsProduct && newsProduct.name) || slug,
    icon: (catalog && catalog.icon) || (newsProduct && newsProduct.icon) || "/logo.png",
    ns: catalog ? catalog.ns : null,
    pageHref: newsProduct && newsProduct.pageHref ? newsProduct.pageHref : null,
    catalog: !!(catalog || (newsProduct && newsProduct.catalog)),
  };
}

export function articleProductSlug(article) {
  return article?.relatedProduct || article?.product || "";
}

export function publishedArticles() {
  return NEWS_ARTICLES.filter((a) => a.published).sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0
  );
}

export function formatNewsDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  return iso.replace(/-/g, ".");
}

export function formatTimelineDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const [, m, d] = iso.split("-");
  return `${months[parseInt(m, 10) - 1] || m} ${parseInt(d, 10)}`;
}

export function monthKeyFromDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  return iso.slice(0, 7);
}

export function monthLabelFromDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const m = parseInt(iso.slice(5, 7), 10);
  return months[m - 1] || iso.slice(5, 7);
}

export function yearFromDate(iso) {
  return iso && iso.length >= 4 ? iso.slice(0, 4) : "";
}

export function articleCopy(article, lang) {
  const pack = article.copy || {};
  const overlay = NEWS_I18N.articles?.[article.id]?.[lang];
  if (overlay) return overlay;
  return pack[lang] || pack.en || pack.ko || {};
}

export function imageAltFor(article, lang) {
  const overlay = NEWS_I18N.imageAlt?.[article.id]?.[lang];
  if (overlay) return overlay;
  const a = article.imageAlt || {};
  return a[lang] || a.en || a.ko || "";
}

export function historyEntryCopy(entry, lang) {
  const overlay = NEWS_I18N.history?.[entry.id]?.[lang];
  if (overlay) return overlay;
  const pack = entry.copy || {};
  return pack[lang] || pack.en || pack.ko || {};
}

export function activityCopy(article, lang) {
  const act = article.activity || {};
  const overlay = NEWS_I18N.activity?.[article.id] || {};
  const pick = (field) => {
    if (overlay[field]?.[lang]) return overlay[field][lang];
    const v = act[field];
    if (!v) return "";
    if (typeof v === "string") return v;
    return v[lang] || v.en || v.ko || "";
  };
  return {
    area: pick("area"),
    label: pick("label"),
    verb: act.verb || "UPDATED",
  };
}

export function isNewArticle(article, now = new Date()) {
  if (!article?.date) return false;
  const pub = new Date(`${article.date}T00:00:00`);
  const diff = now.getTime() - pub.getTime();
  return diff >= 0 && diff <= NEW_BADGE_DAYS * 86400000;
}

export function featuredArticle(articles = publishedArticles()) {
  const featured = articles.filter((a) => a.featured);
  if (featured.length) return featured[0];
  return articles[0] || null;
}

/** Latest products: explicit slugs, else launch articles, else empty. */
export function latestProductSlugs(articles = publishedArticles()) {
  if (NEWS_LATEST_PRODUCT_SLUGS.length) {
    return NEWS_LATEST_PRODUCT_SLUGS.slice(0, 3);
  }
  const fromLaunch = [];
  for (const a of articles) {
    if (a.category !== "launch") continue;
    const slug = articleProductSlug(a);
    if (!slug || fromLaunch.includes(slug)) continue;
    fromLaunch.push(slug);
    if (fromLaunch.length >= 3) break;
  }
  return fromLaunch;
}
