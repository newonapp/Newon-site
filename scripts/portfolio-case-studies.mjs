/**
 * Portfolio Product Case Study overlays for featured apps.
 * Reuses verified copy from business-case-studies / locales — no invented metrics.
 */
import { BUSINESS_CASE_STUDIES } from "./business-case-studies.mjs";
import { PRODUCT_HISTORY } from "./product-history-data.mjs";

/** Featured Product Case Study order (Phase 1). */
export const CASE_STUDY_SLUGS = ["babylog", "savy", "myworld", "pillmate", "ox-month"];

const YEAR_BY_SLUG = (() => {
  const map = {};
  for (const h of PRODUCT_HISTORY) {
    if (!h.product || !h.date) continue;
    const y = String(h.date).slice(0, 4);
    if (/^\d{4}$/.test(y) && !map[h.product]) map[h.product] = y;
  }
  return map;
})();

/**
 * Locale-grounded Problem/Solution for products missing or inaccurate in business-case-studies.
 * My World business entry previously described "personal space" — travel copy used instead.
 */
const PORTFOLIO_CASE_COPY = {
  babylog: {
    category: { ko: "육아 · 성장 기록", en: "Parenting · Growth records" },
    ko: {
      problem: "육아 기록이 메모·사진·채팅에 흩어져 다시 찾기 어려운 경우",
      solution: "성장·일상 기록을 타임라인 중심으로 통합",
      product:
        "임신부터 성장까지 기록을 쌓고, 가족이 함께 볼 수 있는 성장 아카이브로 구성합니다.",
      uiux: "타임라인과 기록 유형을 중심으로, 일상 기록이 이어지도록 화면을 구성합니다.",
      built: "모바일 앱, 기록 타입, 타임라인, 공유, 다국어",
    },
    en: {
      problem: "Parenting logs scattered across notes, photos, and chat",
      solution: "Timeline-first home for growth and daily records",
      product: "A growth archive that collects records over time and can be shared with family.",
      uiux: "Screens are organized around a timeline and record types so daily logging can continue.",
      built: "Mobile app, record types, timeline, sharing, i18n",
    },
  },
  savy: {
    category: { ko: "금융 · 지출 관리", en: "Finance · Spend tracking" },
    ko: {
      problem: "구독·반복 지출이 여러 앱과 카드 명세에 흩어져 파악이 어려운 경우",
      solution: "지출·수입·구독을 한곳에서 정리하는 구조",
      product: "흩어진 돈의 흐름을 한 화면에 모으고, 소비 습관을 파악할 수 있도록 구성합니다.",
      uiux: "지출·수입·구독 정보를 한눈에 훑을 수 있도록 정보 구조를 단순하게 잡습니다.",
      built: "iOS/Android 앱, 구독·지출 관리, 알림, 카테고리, 다국어",
    },
    en: {
      problem: "Subscriptions and recurring spend scattered across apps and statements",
      solution: "One place to organize spending, income, and subscriptions",
      product: "Bring money flows into one view so spending patterns are easier to see.",
      uiux: "Keep spend, income, and subscriptions scannable with a simple information structure.",
      built: "iOS/Android app, subscription and spend tracking, alerts, categories, i18n",
    },
  },
  myworld: {
    category: { ko: "여행 · 기록", en: "Travel · Journals" },
    ko: {
      problem: "방문한 나라·도시와 여행 일정·사진이 흩어져 한곳에서 보기 어려운 경우",
      solution: "여행 지도·일정·사진·통계를 모은 올인원 여행 기록",
      product: "방문 기록과 일정·사진을 연결해 여행 경험을 한 제품 안에서 이어 가도록 구성합니다.",
      uiux: "지도와 기록·리포트 흐름이 이어지도록 주요 화면을 구성합니다.",
      built: "모바일 앱, 여행 지도, 일정·사진 기록, 리포트, 다국어",
    },
    en: {
      problem: "Visited places, itineraries, and photos are hard to see in one place",
      solution: "All-in-one travel logging with maps, plans, photos, and stats",
      product: "Connect visits, plans, and photos so the travel story stays in one product.",
      uiux: "Major screens follow map → records → report so the travel flow stays continuous.",
      built: "Mobile app, travel map, itinerary and photo logs, reports, i18n",
    },
  },
  pillmate: {
    category: { ko: "건강 · 복약 관리", en: "Health · Medication" },
    ko: {
      problem: "약·영양제·건강 루틴을 여러 곳에서 관리하다 꾸준히 이어가기 어려운 경우",
      solution: "복용 알림과 기록을 한곳에서 이어 가는 구조",
      product: "복약·영양제·루틴을 기록하고 알림으로 이어지도록 구성합니다.",
      uiux: "오늘의 복용과 기록이 바로 보이도록 일상 루틴 중심으로 화면을 잡습니다.",
      built: "모바일 앱, 복약 알림, 건강 기록, 가족 공유, 다국어",
    },
    en: {
      problem: "Medications, supplements, and health routines are hard to keep consistent across tools",
      solution: "One place for reminders and logs that keep the routine going",
      product: "Log medications, supplements, and routines — with reminders that help follow-through.",
      uiux: "Screens prioritize today’s doses and logs so the daily routine stays visible.",
      built: "Mobile app, medication reminders, health logs, family sharing, i18n",
    },
  },
  "ox-month": {
    category: { ko: "습관 · 월간 기록", en: "Habits · Monthly logs" },
    ko: {
      problem: "매일 반복되는 선택과 기록을 가볍게 유지하고 싶지만, 복잡한 앱은 부담스러운 경우",
      solution: "하루 단위 선택과 기록에 집중한 미니멀 UX",
      product: "O/X 체크와 월간 기록으로 핵심만 남긴 습관 관리 흐름을 구성합니다.",
      uiux: "하루 기록에 집중하도록 화면을 단순하게 유지합니다.",
      built: "모바일 앱, 온보딩, 기록 플로우, 알림, 다국어 UI",
    },
    en: {
      problem: "Daily choices and logs should stay light — heavy apps feel like too much",
      solution: "Minimal UX focused on daily decisions and records",
      product: "A habit flow kept to essentials with O/X checks and monthly logs.",
      uiux: "Keep screens simple so daily logging stays the focus.",
      built: "Mobile app, onboarding, logging flows, notifications, multilingual UI",
    },
  },
};

function bizBySlug(slug) {
  return BUSINESS_CASE_STUDIES.find((c) => c.slug === slug) || null;
}

function pickLang(block, lang) {
  if (!block) return {};
  return lang === "ko" ? block.ko || block.en || {} : block.en || block.ko || {};
}

export function isCaseStudySlug(slug) {
  return CASE_STUDY_SLUGS.includes(slug);
}

/**
 * Enrich a portfolio app with case-study fields when featured.
 * Non-featured apps get badge + detailUrl only (caller).
 */
export function enrichCaseStudy(app, lang = "ko") {
  const slug = app.slug;
  const overlay = PORTFOLIO_CASE_COPY[slug];
  if (!overlay) {
    return {
      ...app,
      isCaseStudy: false,
      productBadge: "NEWON PRODUCT",
      builtByLabel: lang === "ko" ? "BUILT BY NEWON" : "BUILT BY NEWON",
    };
  }

  const biz = bizBySlug(slug);
  const bizCopy = pickLang(biz, lang);
  const local = pickLang(overlay, lang);
  const category =
    (lang === "ko" ? overlay.category?.ko : overlay.category?.en) ||
    app.oneLiner ||
    "";

  const platforms = [];
  if (app.appStoreUrl) platforms.push("iOS");
  if (app.googlePlayUrl) platforms.push("Android");

  const year = YEAR_BY_SLUG[slug] || "";
  const status =
    app.appStoreUrl || app.googlePlayUrl
      ? lang === "ko"
        ? "Live"
        : "Live"
      : "";

  // Verified stack only: Flutter is Newon public capability; platforms from store links.
  const tech = ["Flutter", ...platforms].filter(Boolean);

  return {
    ...app,
    isCaseStudy: true,
    productBadge: "NEWON PRODUCT",
    builtByLabel: "BUILT BY NEWON",
    caseCategory: category,
    caseProblem: local.problem || bizCopy.problem || "",
    caseSolution: local.solution || bizCopy.solution || "",
    caseProduct: local.product || "",
    caseUiux: local.uiux || "",
    caseBuilt: local.built || bizCopy.built || "",
    casePlatform: platforms.join(" · "),
    caseStatus: status,
    caseRelease: year,
    caseTech: tech,
    caseType: "NEWON PRODUCT",
  };
}

export function portfolioInquiryHref(lang, slug, { service = "mvp" } = {}) {
  const params = new URLSearchParams({
    category: "Business",
    area: "BUILD",
    source: `portfolio-${slug}`,
  });
  if (service === "mvp") {
    params.set("service", "MVP");
    params.set("slug", "mvp");
  }
  return `/${lang}/business/inquiry/?${params.toString()}#inquiry`;
}
