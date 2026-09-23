/**
 * Apps shown on the ecosystem page.
 * EatOn and FitOn are health apps in the ecosystem. They are not Newon+ package members.
 */
import { APP_CATALOG } from "./portfolio-data.mjs";
import { APPS_SHOWCASE_META } from "./apps-showcase-data.mjs";
import { PLUS_MEMBER_APPS } from "./newon-plus-packages.mjs";

export const ECO_PLUS_SLUG = "newon-plus";
const plusHealthAt = PLUS_MEMBER_APPS.indexOf("pillmate");
export const ECO_MEMBER_SLUGS = [
  ...PLUS_MEMBER_APPS.slice(0, plusHealthAt + 1),
  "eaton",
  "fiton",
  ...PLUS_MEMBER_APPS.slice(plusHealthAt + 1),
];
export const ECO_ALL_SLUGS = [ECO_PLUS_SLUG, ...ECO_MEMBER_SLUGS];

export const ECO_GROUPS = [
  { id: "goals", slugs: ["goalup", "ox-month", "countup"] },
  { id: "money", slugs: ["savy", "subping", "piggyup"] },
  { id: "care", slugs: ["pillmate", "eaton", "fiton", "babylog", "petlog"] },
  { id: "travel", slugs: ["myworld"] },
];

const ROLES = {
  ko: {
    "newon-plus": "통합 계정 · 앱 허브 · 멤버십",
    "ox-month": "습관 기록 · 월간 목표 · 일상 체크",
    goalup: "목표 설정 · 실천 계획 · 성장 관리",
    countup: "횟수 기록 · 목표 수치 추적 · 진행 현황",
    savy: "수입·지출 기록 · 소비 관리 · 금융 생활",
    subping: "구독 관리 · 정기결제 일정 · 결제 알림",
    piggyup: "절약 목표 · 소비 습관 · 절약 챌린지",
    pillmate: "복약 일정 · 복약 알림 · 건강 생활 기록",
    eaton: "식사 · 요리 · 외식 · 건강 식생활",
    fiton: "운동 · 스포츠 · 건강 활동",
    babylog: "육아 기록 · 아이 성장 관리 · 가족 공유",
    petlog: "반려동물 생활 기록 · 건강 관리 · 가족 공유",
    myworld: "여행 기록 · 여행 지도 · 여행 경험 관리",
  },
  en: {
    "newon-plus": "Shared account · app hub · membership",
    "ox-month": "Habit log · monthly goals · daily check",
    goalup: "Goal setting · action plans · growth",
    countup: "Count tracking · targets · progress",
    savy: "Income & spending · money habits",
    subping: "Subscriptions · billing dates · reminders",
    piggyup: "Saving goals · spending habits · challenges",
    pillmate: "Medication schedule · reminders · health log",
    eaton: "Meals · cooking · dining · healthy eating",
    fiton: "Workouts · sports · healthy activity",
    babylog: "Parenting log · growth · family sharing",
    petlog: "Pet daily log · health · family sharing",
    myworld: "Travel journal · travel map · memories",
  },
};

const bySlug = Object.fromEntries(APP_CATALOG.map((a) => [a.slug, a]));

export function ecoApp(slug, lang = "en", index = 0) {
  const entry = bySlug[slug];
  if (!entry) throw new Error(`Unknown ecosystem app: ${slug}`);
  const roles = ROLES[lang] || ROLES.en;
  const meta = APPS_SHOWCASE_META[slug] || {};
  const isKo = lang === "ko";
  return {
    n: String(index + 1).padStart(2, "0"),
    slug,
    name: entry.name,
    icon: entry.icon,
    href: `../portfolio/${slug}/`,
    role: roles[slug] || "",
    tagline: (isKo ? meta.taglineKo : meta.taglineEn) || roles[slug] || "",
  };
}

export function getEcoApps(lang = "en") {
  return ECO_ALL_SLUGS.map((slug, i) => ecoApp(slug, lang, i));
}

export function getOrbitApps(lang = "en") {
  return ECO_MEMBER_SLUGS.map((slug, i) => ecoApp(slug, lang, i + 1));
}

export function appBySlug(slug, lang = "en") {
  const i = ECO_ALL_SLUGS.indexOf(slug);
  return ecoApp(slug, lang, i < 0 ? 0 : i);
}
