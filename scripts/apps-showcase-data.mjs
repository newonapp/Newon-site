/**
 * Apps hub showcase metadata — extends APP_CATALOG + loadPortfolioApps.
 * Single source for /apps/ editorial layout (category, copy, tint, featured).
 */
import { APP_CATALOG, loadPortfolioApps } from "./portfolio-data.mjs";

/** @typedef {'productivity'|'finance'|'health'|'family'|'travel'|'lifestyle'} AppCategory */

export const APP_CATEGORIES = [
  { id: "all", labelKey: "studio.appsFilterAll", labelEn: "All" },
  { id: "productivity", labelKey: "studio.appsFilterProductivity", labelEn: "Productivity" },
  { id: "finance", labelKey: "studio.appsFilterFinance", labelEn: "Finance" },
  { id: "health", labelKey: "studio.appsFilterHealth", labelEn: "Health" },
  { id: "family", labelKey: "studio.appsFilterFamily", labelEn: "Family" },
  { id: "travel", labelKey: "studio.appsFilterTravel", labelEn: "Travel" },
  { id: "lifestyle", labelKey: "studio.appsFilterLifestyle", labelEn: "Lifestyle" },
];

/**
 * Editorial copy + taxonomy keyed by slug.
 * Store URLs resolved at runtime from locales via loadPortfolioApps.
 */
export const APPS_SHOWCASE_META = {
  "ox-month": {
    category: "productivity",
    categoryLabel: "Productivity",
    tint: "#ffffff",
    showcaseFeatured: false,
    taglineKo: "매일의 행동을 O/X로 기록하고 한 달의 변화를 확인하는 월간 기록 앱.",
    taglineEn: "Track daily actions with O/X and see a month of change at a glance.",
    featuresKo: ["습관", "월간 기록", "통계"],
    featuresEn: ["Habits", "Monthly log", "Stats"],
  },
  goalup: {
    category: "productivity",
    categoryLabel: "Productivity",
    tint: "#ffffff",
    showcaseFeatured: false,
    taglineKo: "목표를 계획하고 실행 과정을 기록하며 꾸준한 성장을 돕는 목표 관리 앱.",
    taglineEn: "Plan goals, log progress, and stay consistent with focused growth tracking.",
    featuresKo: ["목표", "챌린지", "성장 기록"],
    featuresEn: ["Goals", "Challenges", "Progress"],
  },
  countup: {
    category: "productivity",
    categoryLabel: "Productivity",
    tint: "#ffffff",
    showcaseFeatured: false,
    taglineKo: "중요한 숫자와 반복 기록을 간단하게 쌓아가는 카운트 기록 앱.",
    taglineEn: "Count what matters — simple tallies for habits, practice, and streaks.",
    featuresKo: ["카운트", "목표 추적", "기록"],
    featuresEn: ["Counting", "Targets", "Logs"],
  },
  savy: {
    category: "finance",
    categoryLabel: "Finance",
    tint: "#ffffff",
    showcaseFeatured: true,
    taglineKo: "소비 흐름을 기록하고 분석해 더 나은 소비 결정을 돕는 개인 금융 앱.",
    taglineEn: "Log spending and income, then understand your money with clear insights.",
    featuresKo: ["지출", "수입", "AI 분석"],
    featuresEn: ["Spending", "Income", "AI insights"],
    featuredBulletsKo: ["지출·수입 기록", "구독 파악", "AI 소비 인사이트"],
    featuredBulletsEn: ["Expense & income tracking", "Subscription awareness", "AI money insights"],
  },
  subping: {
    category: "finance",
    categoryLabel: "Finance",
    tint: "#ffffff",
    showcaseFeatured: false,
    taglineKo: "구독 서비스를 한곳에서 관리하고 결제 일정을 놓치지 않도록 돕는 구독 관리 앱.",
    taglineEn: "Manage subscriptions in one place and never miss a renewal date.",
    featuresKo: ["구독 관리", "결제 알림", "소비 인사이트"],
    featuresEn: ["Subscriptions", "Reminders", "Insights"],
  },
  piggyup: {
    category: "finance",
    categoryLabel: "Finance",
    tint: "#ffffff",
    showcaseFeatured: false,
    taglineKo: "절약 기록과 챌린지를 통해 저축 습관을 만드는 서비스.",
    taglineEn: "Build saving habits with challenges, logs, and gentle coaching.",
    featuresKo: ["절약", "챌린지", "저축 습관"],
    featuresEn: ["Saving", "Challenges", "Habits"],
  },
  pillmate: {
    category: "health",
    categoryLabel: "Health",
    tint: "#ffffff",
    showcaseFeatured: false,
    taglineKo: "복약 일정과 기록을 관리하고 꾸준한 복용을 돕는 건강 관리 앱.",
    taglineEn: "Medication schedules and reminders that help you stay consistent.",
    featuresKo: ["복약 알림", "건강 기록", "루틴"],
    featuresEn: ["Reminders", "Health log", "Routines"],
  },
  babylog: {
    category: "family",
    categoryLabel: "Family",
    tint: "#ffffff",
    showcaseFeatured: true,
    taglineKo: "아이의 성장과 가족의 순간을 함께 기록하는 육아 기록 서비스.",
    taglineEn: "Capture growth and family moments in one shared baby journal.",
    featuresKo: ["성장 기록", "가족 공유", "성장 리포트"],
    featuresEn: ["Growth log", "Family sharing", "Insights"],
    featuredBulletsKo: ["성장 기록", "가족 공유", "AI 인사이트"],
    featuredBulletsEn: ["Growth tracking", "Family sharing", "AI insights"],
  },
  petlog: {
    category: "family",
    categoryLabel: "Family",
    tint: "#ffffff",
    showcaseFeatured: false,
    taglineKo: "반려동물의 일상, 건강, 기록을 한곳에서 관리하는 반려생활 서비스.",
    taglineEn: "Daily care, health notes, and memories for the pets you love.",
    featuresKo: ["일상 기록", "건강 관리", "가족 공유"],
    featuresEn: ["Daily log", "Health", "Sharing"],
  },
  myworld: {
    category: "travel",
    categoryLabel: "Travel",
    tint: "#ffffff",
    showcaseFeatured: false,
    taglineKo: "여행한 국가와 도시, 추억과 기록을 나만의 세계 지도에 남기는 여행 기록 앱.",
    taglineEn: "Map countries, cities, and travel memories on your personal world map.",
    featuresKo: ["여행 지도", "여행 기록", "AI 리포트"],
    featuresEn: ["Travel map", "Journals", "AI reports"],
  },
  "newon-plus": {
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    tint: "#ffffff",
    showcaseFeatured: false,
    ecosystem: true,
    taglineKo: "Newon의 여러 서비스를 하나의 경험으로 연결하는 통합 서비스.",
    taglineEn: "Connect Newon services into one shared experience.",
    featuresKo: ["통합 계정", "앱 허브", "멤버십"],
    featuresEn: ["Shared account", "App hub", "Membership"],
  },
};

export function buildAppsShowcase(lang = "ko") {
  const isKo = lang === "ko" || lang === "ko-KR";
  const loaded = loadPortfolioApps(lang);
  const bySlug = Object.fromEntries(loaded.map((a) => [a.slug, a]));

  return APP_CATALOG.map((entry) => {
    const meta = APPS_SHOWCASE_META[entry.slug] || {};
    const live = bySlug[entry.slug] || {};
    const tagline = isKo ? meta.taglineKo : meta.taglineEn;
    const features = isKo ? meta.featuresKo : meta.featuresEn;
    const featuredBullets = isKo
      ? meta.featuredBulletsKo || features
      : meta.featuredBulletsEn || features;

    return {
      slug: entry.slug,
      name: entry.name,
      icon: entry.icon,
      homeHash: entry.homeHash,
      category: meta.category || "lifestyle",
      categoryLabel: meta.categoryLabel || "Apps",
      tint: meta.tint || "#ffffff",
      showcaseFeatured: Boolean(meta.showcaseFeatured),
      ecosystem: Boolean(meta.ecosystem),
      tagline: tagline || live.oneLiner || entry.name,
      features: features || [],
      featuredBullets: featuredBullets || [],
      detailUrl: `../portfolio/${entry.slug}/`,
      homeUrl: `../${entry.homeHash}`,
      portfolioUrl: `../portfolio/${entry.slug}/`,
      appStoreUrl: live.appStoreUrl || "",
      googlePlayUrl: live.googlePlayUrl || "",
      status: "live",
    };
  });
}

/** All Newon apps in the showcase grid (11 including Newon+). */
export function appsForGrid(apps) {
  return apps;
}

export function appsFeatured(apps) {
  return apps.filter((a) => a.showcaseFeatured && !a.ecosystem);
}

export function appsEcosystem(apps) {
  return apps.find((a) => a.ecosystem) || null;
}

/** Sibling apps for Newon+ orbit visual (excludes Newon+ itself). */
export function appsForOrbit(apps) {
  return apps.filter((a) => !a.ecosystem);
}

export function appsCountLabel(apps) {
  return `${appsForGrid(apps).length}+`;
}
