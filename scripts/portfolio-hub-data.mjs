/**
 * Portfolio hub data — shared with Home / Labs / company metrics.
 * Keeps portfolio stats, “now” items, and case studies in sync with site sources.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getCompanyMetrics } from "./company-metrics.mjs";
import { getLabsExperiments } from "./lab-experiments.mjs";
import { PORTFOLIO_STATS, visibleStats } from "./portfolio-data.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export const COMPANY_TAGLINE = {
  ko: "Product & Venture Studio",
  en: "Product & Venture Studio",
};

function readLocale(lang) {
  const file = path.join(ROOT, "locales", `${lang}.json`);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function homeT(lang, key, fallback = "") {
  const en = readLocale("en");
  const loc = lang === "en" ? en : { ...en, ...readLocale(lang) };
  const home = loc.home || {};
  return home[key] || (en.home || {})[key] || fallback;
}

/** Editorial metrics for portfolio #numbers — sourced from company metrics + portfolio stats. */
export function getPortfolioHubMetrics(lang = "ko") {
  const m = getCompanyMetrics();
  const isKo = lang === "ko";
  const months = visibleStats(PORTFOLIO_STATS).find((s) => s.id === "months");
  return [
    {
      id: "products",
      value: m.products,
      label: isKo ? "개발한 제품" : "PRODUCTS BUILT",
      note: isKo ? "6개월 동안 기획·개발" : "Planned and built in 6 months",
    },
    {
      id: "months",
      value: months?.value || "06",
      label: isKo ? "개월" : "MONTHS",
      note: isKo ? "아이디어에서 출시까지" : "From idea to launch",
    },
    {
      id: "languages",
      value: m.languages,
      label: isKo ? "지원 언어" : "LANGUAGES",
      note: isKo ? "Newon 서비스 다국어" : "Newon service locales",
    },
    {
      id: "countries",
      value: m.countries,
      label: isKo ? "출시 국가" : "COUNTRIES",
      note: isKo ? "앱 스토어 글로벌 출시" : "Global app store reach",
    },
  ];
}

/**
 * Mirrors templates/index.html #hs-now — same links and labels as Home.
 * @returns {Array<{ status: string, statusHint: string, items: Array<{ title: string, href: string, category?: string }> }>}
 */
export function getPortfolioNowGroups(lang = "ko") {
  const prefix = `/${lang}/`;
  return [
    {
      status: homeT(lang, "nowBuilding", "BUILDING"),
      statusHint: homeT(lang, "nowBuildingHint", ""),
      items: [
        { title: homeT(lang, "nowItemReviewAi", "Review AI"), href: `${prefix}resources/labs/review-ai/`, category: "LABS" },
        { title: homeT(lang, "nowItemQr", "Newon QR"), href: `${prefix}resources/labs/newon-qr/`, category: "LABS" },
      ],
    },
    {
      status: homeT(lang, "nowTesting", "TESTING"),
      statusHint: homeT(lang, "nowTestingHint", ""),
      items: [
        { title: homeT(lang, "nowItemContentAi", "Newon Content AI"), href: `${prefix}resources/labs/`, category: "LABS" },
      ],
    },
    {
      status: homeT(lang, "nowExploring", "EXPLORING"),
      statusHint: homeT(lang, "nowExploringHint", ""),
      items: [
        { title: homeT(lang, "nowItemCharacter", "Character Lab"), href: `${prefix}resources/labs/character-lab/`, category: "LABS" },
        { title: homeT(lang, "nowItemCreative", "Newon Studio"), href: `${prefix}business/creative/`, category: "STUDIO" },
      ],
    },
  ];
}

function labField(exp, lang, field) {
  return lang === "ko" ? exp[`${field}Ko`] : exp[`${field}En`];
}

/** Case studies from Labs registry — only entries with challenge, decision, build, learn. */
export function getPortfolioCaseStudies(lang = "ko") {
  const isKo = lang === "ko";
  const bySlug = Object.fromEntries(getLabsExperiments().map((e) => [e.slug, e]));
  const picks = ["review-ai", "newon-qr", "character-lab"];
  const out = [];

  for (const slug of picks) {
    const exp = bySlug[slug];
    if (!exp) continue;
    const challenge = labField(exp, lang, "questionList") || labField(exp, lang, "question");
    const decision = labField(exp, lang, "hypothesis");
    const build = labField(exp, lang, "build");
    const learn = labField(exp, lang, "findings") || labField(exp, lang, "next");
    if (!challenge || !decision || !build || !learn) continue;
    out.push({
      slug,
      project: isKo ? exp.titleKo : exp.titleEn,
      challenge,
      decision,
      build,
      learn,
      href: `/${lang}/resources/labs/${slug}/`,
      status: exp.status || exp.stage,
    });
    if (out.length >= 3) break;
  }
  return out;
}

/** Beyond Apps index — real Newon surfaces only. */
export function getPortfolioBeyondItems(lang = "ko") {
  const isKo = lang === "ko";
  const p = `/${lang}/`;
  return [
    {
      n: "01",
      tag: isKo ? "GAME" : "GAME",
      title: "404: HUMAN",
      body: isKo
        ? "AI 세계에서 마지막 인간이라는 인터랙티브 게임 실험."
        : "An interactive game experiment — the last human in an AI world.",
      status: "LIVE",
      href: `${p}404-human/`,
      cta: isKo ? "플레이 ↗" : "Play ↗",
    },
    {
      n: "02",
      tag: "LABS",
      title: "Newon Labs",
      body: isKo
        ? "AI, SaaS, Tools, Character IP 등 제품이 되기 전 아이디어를 빠르게 실험합니다."
        : "Fast experiments in AI, SaaS, tools, and character IP before they become products.",
      status: isKo ? "ACTIVE" : "ACTIVE",
      href: `${p}resources/labs/`,
      cta: isKo ? "Labs 보기 ↗" : "View Labs ↗",
    },
    {
      n: "03",
      tag: "WEB",
      title: isKo ? "Newon Web" : "Newon Web",
      body: isKo
        ? "Products, Business, Studio, Resources를 연결하는 Newon의 디지털 비즈니스 플랫폼."
        : "Newon's digital platform connecting Products, Business, Studio, and Resources.",
      status: "",
      href: `${p}`,
      cta: isKo ? "Newon 보기 ↗" : "Explore Newon ↗",
    },
    {
      n: "04",
      tag: isKo ? "BUSINESS / STUDIO" : "BUSINESS / STUDIO",
      title: isKo ? "Business & Studio" : "Business & Studio",
      body: isKo
        ? "기업과 창업자의 아이디어를 제품과 브랜드로 구축하는 영역."
        : "Building products and brands with companies and founders.",
      status: "",
      href: `${p}business/`,
      cta: isKo ? "Business ↗" : "Business ↗",
      hrefSecondary: `${p}studio/`,
      ctaSecondary: isKo ? "Studio ↗" : "Studio ↗",
    },
  ];
}
