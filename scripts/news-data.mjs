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

export const NEWS_CATEGORIES = ["all", "launch", "update", "feature", "ai", "games", "business", "company", "notice"];
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
 * Official Newon app launch / lineup order (earliest → latest within the year line).
 * Shared with Company About product strip — do not invent ship days.
 */
export const NEWS_LAUNCH_ORDER = [
  "ox-month",
  "goalup",
  "savy",
  "babylog",
  "myworld",
  "newon-plus",
  "countup",
  "subping",
  "piggyup",
  "petlog",
  "pillmate",
  "404-human",
];

/**
 * Optional highlight strip — product slugs only (no invented launch dates).
 * Leave empty to auto-fill from category:"launch" articles, or hide when none.
 */
export const NEWS_LATEST_PRODUCT_SLUGS = [];

const PUBLISHED = "2026-09-24";

function businessArticle(entry) {
  return {
    date: PUBLISHED,
    category: "company",
    featured: false,
    includeInLatest: true,
    published: true,
    showInTimeline: false,
    brandIcon: "/logo.png",
    ...entry,
  };
}

export const NEWS_ARTICLES = [
  businessArticle({
    id: "six-business-structure",
    slug: "six-business-structure",
    featured: true,
    categoryLabel: "COMPANY NEWS",
    brandName: "Newon",
    linkHref: "/{{LANG}}/",
    imageAlt: {
      ko: "Newon 로고",
      en: "Newon logo",
    },
    copy: {
      ko: {
        title: "Newon, 6개 사업 체계로 확장… 생활 앱부터 AI·시니어 플랫폼까지",
        titleHtml: "Newon, 6개 사업 체계로 확장…<br />생활 앱부터 AI·시니어 플랫폼까지",
        summary:
          "Newon이 기존 모바일 앱 사업을 기반으로 AI, 생애주기 플랫폼, 시니어 생활·돌봄, 기업용 솔루션, 커머스 등 6개 사업 분야를 중심으로 사업 구조를 정비했습니다.",
        lead:
          "Newon이 다양한 생활 영역을 연결하는 디지털 서비스 기업으로의 확장을 위해 새로운 6개 사업 체계를 공개했습니다.",
        linkLabel: "Newon 사업 소개 보기",
        blocks: [
          {
            type: "p",
            text: "Newon이 다양한 생활 영역을 연결하는 디지털 서비스 기업으로의 확장을 위해 새로운 6개 사업 체계를 공개했습니다.",
          },
          {
            type: "p",
            text: "이번 사업 구조는 기존 모바일 앱 개발·운영 경험을 기반으로 개인의 일상부터 가족, 시니어, 기업까지 다양한 고객의 필요를 해결하는 서비스를 단계적으로 구축하기 위한 방향입니다.",
          },
          { type: "p", text: "Newon의 새로운 사업 체계는 다음과 같습니다." },
          {
            type: "ol",
            items: [
              "Newon Consumer — 모바일 앱 및 소비자 서비스",
              "Newon AI — 개인·기업 AI 서비스",
              "LivOn — 생애주기 플랫폼",
              "Ongil — 시니어 생활·돌봄 플랫폼",
              "Newon Business — 기업용 SaaS·AI 및 디지털 서비스",
              "Newon Commerce — 커머스 및 생활서비스 연결",
            ],
          },
          {
            type: "p",
            text: "Newon은 기존에 운영 중인 앱과 현재 제공 가능한 서비스를 지속적으로 개선하는 동시에, 신규 플랫폼과 확장 사업을 단계적으로 준비할 계획입니다.",
          },
          {
            type: "p",
            text: "이번 사업 구조 개편은 모든 사업의 출시나 기술적 연동이 완료되었다는 의미는 아닙니다. 각 사업은 현재 운영 현황과 개발 단계에 따라 순차적으로 추진됩니다.",
          },
        ],
      },
      en: {
        title: "Newon sets out six businesses, from everyday apps to AI and a senior platform",
        titleHtml: "Newon sets out six businesses,<br />from everyday apps to AI and a senior platform",
        summary:
          "Newon has organized its work around six areas, building on its mobile apps: AI, a life-stage platform, senior living and care, business solutions, and commerce.",
        lead:
          "Newon has published a six-business structure as it extends from mobile apps into digital services that connect more of everyday life.",
        linkLabel: "See Newon's businesses",
        blocks: [
          {
            type: "p",
            text: "Newon has published a six-business structure as it extends into digital services that connect more of everyday life.",
          },
          {
            type: "p",
            text: "The structure builds on Newon's experience developing and operating mobile apps. It is a direction for services that can, over time, meet needs from personal life and family to seniors and companies.",
          },
          { type: "p", text: "The six businesses are:" },
          {
            type: "ol",
            items: [
              "Newon Consumer — mobile apps and consumer services",
              "Newon AI — AI services for people and companies",
              "LivOn — a life-stage platform",
              "Ongil — a senior living and care platform",
              "Newon Business — SaaS, AI, and digital services for companies",
              "Newon Commerce — commerce and everyday-service connections",
            ],
          },
          {
            type: "p",
            text: "Newon will keep improving the apps and services it can offer today, and prepare new platforms and expansions in stages.",
          },
          {
            type: "p",
            text: "Publishing this structure does not mean every business has launched or that the products are technically connected. Each business moves according to what is operating now and what is still in development.",
          },
        ],
      },
    },
  }),
  businessArticle({
    id: "newon-consumer-apps",
    slug: "newon-consumer-apps",
    categoryLabel: "BUSINESS",
    brandName: "Newon Consumer",
    linkHref: "/{{LANG}}/apps/",
    imageAlt: { ko: "Newon 로고", en: "Newon logo" },
    copy: {
      ko: {
        title: "Newon Consumer, 일상을 위한 모바일 앱 생태계 확장",
        titleHtml: "Newon Consumer,<br />일상을 위한 모바일 앱 생태계 확장",
        summary:
          "Newon이 개발·운영하는 생활 앱을 중심으로 개인의 일상과 자기관리, 금융 생활, 가족을 위한 디지털 서비스를 지속적으로 개선합니다.",
        lead:
          "Newon Consumer는 개인과 가족의 일상에 필요한 모바일 앱을 개발하고 운영하는 소비자 서비스 사업입니다.",
        linkLabel: "Apps 소개 보기",
        blocks: [
          {
            type: "p",
            text: "Newon Consumer는 개인과 가족의 일상에 필요한 모바일 앱을 개발하고 운영하는 소비자 서비스 사업입니다.",
          },
          {
            type: "p",
            text: "일정과 목표 관리, 생활비와 정기결제 관리, 가족 및 반려동물 관련 서비스 등 다양한 생활 영역에서 사용자의 편의성을 높이는 것을 목표로 합니다.",
          },
          {
            type: "p",
            text: "Newon은 기존 출시 앱의 사용 경험과 운영 품질을 개선하고, 서비스별 특성에 맞는 기능 확장과 구독 모델을 검토하고 있습니다.",
          },
          {
            type: "p",
            text: "Newon+를 중심으로 통합 로그인과 서비스 연결 구조를 구축하고 있으며, 앱별 기능과 데이터 연동은 실제 구현 상태와 이용자 동의에 따라 단계적으로 확장할 계획입니다.",
          },
        ],
      },
      en: {
        title: "Newon Consumer extends the mobile apps for everyday life",
        titleHtml: "Newon Consumer extends<br />the mobile apps for everyday life",
        summary:
          "Newon keeps improving the everyday apps it develops and operates, across personal life, self-management, money, and family.",
        lead:
          "Newon Consumer develops and operates the mobile apps people and families use in daily life.",
        linkLabel: "See Apps",
        blocks: [
          {
            type: "p",
            text: "Newon Consumer develops and operates the mobile apps people and families use in daily life.",
          },
          {
            type: "p",
            text: "The aim is to make everyday areas easier to use, including schedules and goals, living costs and recurring payments, and services for family and pets.",
          },
          {
            type: "p",
            text: "Newon is improving the experience and operating quality of apps already on the stores, and reviewing feature expansions and subscription models that fit each service.",
          },
          {
            type: "p",
            text: "Newon+ is where a shared sign-in and service connection is being built. Features and data links between apps will expand in stages, according to what is actually implemented and what people agree to share.",
          },
        ],
      },
    },
  }),
  businessArticle({
    id: "newon-ai-services",
    slug: "newon-ai-services",
    categoryLabel: "BUSINESS",
    brandName: "Newon AI",
    linkHref: "/{{LANG}}/ai/",
    imageAlt: { ko: "Newon 로고", en: "Newon logo" },
    copy: {
      ko: {
        title: "Newon AI, 개인과 기업을 위한 AI 서비스 확대 추진",
        titleHtml: "Newon AI,<br />개인과 기업을 위한 AI 서비스 확대 추진",
        summary:
          "개인의 일상과 기업의 업무를 지원하는 AI 서비스 및 자동화 솔루션을 중심으로 사업 영역을 확장합니다.",
        lead:
          "Newon AI는 개인의 생활과 기업의 업무에 AI 기술을 적용하여 반복적인 작업을 줄이고 필요한 정보를 효율적으로 활용할 수 있도록 지원하는 사업입니다.",
        linkLabel: "Newon AI 소개 보기",
        blocks: [
          {
            type: "p",
            text: "Newon AI는 개인의 생활과 기업의 업무에 AI 기술을 적용하여 반복적인 작업을 줄이고 필요한 정보를 효율적으로 활용할 수 있도록 지원하는 사업입니다.",
          },
          {
            type: "p",
            text: "개인 AI 서비스와 기업용 AI, 업무 자동화 및 AI Agent를 주요 사업 방향으로 설정하고 있습니다.",
          },
          {
            type: "p",
            text: "Newon은 현재 제공 가능한 AI 서비스와 향후 개발할 기능을 구분하여 소개하고, 실제 고객의 필요와 활용 사례를 바탕으로 사업을 단계적으로 확장할 계획입니다.",
          },
        ],
      },
      en: {
        title: "Newon AI is extending AI services for people and companies",
        titleHtml: "Newon AI is extending<br />AI services for people and companies",
        summary:
          "Newon is extending AI services and automation that support everyday life and company work.",
        lead:
          "Newon AI applies AI to personal life and company work so repetitive tasks can take less time and needed information is easier to use.",
        linkLabel: "See Newon AI",
        blocks: [
          {
            type: "p",
            text: "Newon AI applies AI to personal life and company work so repetitive tasks can take less time and needed information is easier to use.",
          },
          {
            type: "p",
            text: "Personal AI, AI for companies, work automation, and AI agents are the directions for this business.",
          },
          {
            type: "p",
            text: "Newon separates the AI it can offer now from functions still to be built, and plans to extend the business in stages from real customer needs and use.",
          },
        ],
      },
    },
  }),
  businessArticle({
    id: "livon-life-stage",
    slug: "livon-life-stage",
    categoryLabel: "FUTURE BUSINESS",
    brandName: "LivOn",
    linkHref: "/{{LANG}}/lifestage/",
    imageAlt: { ko: "Newon 로고", en: "Newon logo" },
    copy: {
      ko: {
        title: "LivOn, 삶의 변화에 필요한 서비스를 연결하는 생애주기 플랫폼 구상",
        titleHtml: "LivOn, 삶의 변화에 필요한 서비스를<br />연결하는 생애주기 플랫폼 구상",
        summary: "10대부터 70대까지 생애 단계별로 달라지는 생활의 필요를 연결하는 플랫폼을 준비합니다.",
        lead: "LivOn은 인생의 각 단계에서 필요한 정보와 서비스를 하나의 흐름으로 연결하는 생애주기 플랫폼입니다.",
        linkLabel: "LivOn 소개 보기",
        blocks: [
          {
            type: "p",
            text: "LivOn은 인생의 각 단계에서 필요한 정보와 서비스를 하나의 흐름으로 연결하는 생애주기 플랫폼입니다.",
          },
          {
            type: "p",
            text: "진로와 학업, 취업과 경제생활, 독립과 주거, 가족과 중장년기, 은퇴 이후의 생활 등 생애 단계에 따라 달라지는 필요를 고려하여 서비스를 구성할 계획입니다.",
          },
          {
            type: "p",
            text: "Newon은 각 연령대의 실제 생활 문제와 사용자 경험을 검토하며, 핵심 서비스부터 단계적으로 구현하는 방향을 준비하고 있습니다.",
          },
          {
            type: "p",
            text: "현재 LivOn은 향후 사업 계획에 포함된 플랫폼이며, 구체적인 기능과 출시 일정은 개발 및 검증 상황에 따라 확정할 예정입니다.",
          },
        ],
      },
      en: {
        title: "LivOn is a life-stage platform in preparation, connecting services as life changes",
        titleHtml: "LivOn is a life-stage platform in preparation,<br />connecting services as life changes",
        summary:
          "Newon is preparing a platform that connects the different needs of life from the teens through the seventies.",
        lead:
          "LivOn is a life-stage platform meant to connect the information and services each stage of life needs.",
        linkLabel: "See LivOn",
        blocks: [
          {
            type: "p",
            text: "LivOn is a life-stage platform meant to connect the information and services each stage of life needs.",
          },
          {
            type: "p",
            text: "The plan is to shape services around how needs change: study and direction, work and money, independence and housing, family and midlife, and life after retirement.",
          },
          {
            type: "p",
            text: "Newon is reviewing the real living problems and experiences of each age group, and preparing to build from a core service in stages.",
          },
          {
            type: "p",
            text: "LivOn is part of the plan ahead. Specific functions and a launch date will be set as development and validation proceed. It is not a launched service.",
          },
        ],
      },
    },
  }),
  businessArticle({
    id: "ongil-senior-care",
    slug: "ongil-senior-care",
    categoryLabel: "FUTURE BUSINESS",
    brandName: "Ongil",
    linkHref: "/{{LANG}}/ongil/",
    imageAlt: { ko: "Newon 로고", en: "Newon logo" },
    copy: {
      ko: {
        title: "Ongil, 시니어와 가족을 위한 종합 생활·돌봄 플랫폼 준비",
        titleHtml: "Ongil, 시니어와 가족을 위한<br />종합 생활·돌봄 플랫폼 준비",
        summary:
          "시니어의 독립적인 일상과 가족 간 연결을 지원하고, 지역 생활서비스와 돌봄을 연계하는 플랫폼을 구상합니다.",
        lead:
          "Ongil은 시니어가 자신의 일상을 주도적으로 이어가면서 필요할 때 가족과 지역 생활지원 서비스를 연결할 수 있도록 돕는 플랫폼입니다.",
        linkLabel: "Ongil 소개 보기",
        blocks: [
          {
            type: "p",
            text: "Ongil은 시니어가 자신의 일상을 주도적으로 이어가면서 필요할 때 가족과 지역 생활지원 서비스를 연결할 수 있도록 돕는 플랫폼입니다.",
          },
          {
            type: "p",
            text: "시니어 친화적인 사용 경험을 기반으로 가족 간 소통과 안부 확인, 생활지원 서비스 정보, 지역 서비스 연결 등 다양한 기능을 단계적으로 검토하고 있습니다.",
          },
          {
            type: "p",
            text: "Newon은 시니어와 가족의 실제 필요를 바탕으로 서비스 범위를 구체화하고, 향후 관련 기관 및 전문 서비스와의 협력 가능성도 검토할 계획입니다.",
          },
          {
            type: "p",
            text: "현재 Ongil은 사업 준비 단계이며, 모든 생활지원 및 돌봄 서비스가 실제 제공되고 있는 것은 아닙니다.",
          },
        ],
      },
      en: {
        title: "Ongil is in preparation as a living and care platform for seniors and families",
        titleHtml: "Ongil is in preparation as a living<br />and care platform for seniors and families",
        summary:
          "Newon is shaping a platform to support an independent daily life for seniors, family connection, and links to local living and care services.",
        lead:
          "Ongil is a platform meant to help seniors keep directing their own day, and connect with family and local living support when they need it.",
        linkLabel: "See Ongil",
        blocks: [
          {
            type: "p",
            text: "Ongil is a platform meant to help seniors keep directing their own day, and connect with family and local living support when they need it.",
          },
          {
            type: "p",
            text: "Newon is reviewing, in stages, a senior-friendly experience that could include family contact and check-ins, information on living support, and links to local services.",
          },
          {
            type: "p",
            text: "The service scope will be set from what seniors and families actually need. Cooperation with related organizations and specialist services is something to review later.",
          },
          {
            type: "p",
            text: "Ongil is in preparation. Living-support and care services are not all being provided today.",
          },
        ],
      },
    },
  }),
  businessArticle({
    id: "newon-business-services",
    slug: "newon-business-services",
    categoryLabel: "BUSINESS",
    brandName: "Newon Business",
    linkHref: "/{{LANG}}/business/",
    imageAlt: { ko: "Newon 로고", en: "Newon logo" },
    copy: {
      ko: {
        title: "Newon Business, 기업을 위한 디지털 서비스와 AI 솔루션 확장",
        titleHtml: "Newon Business,<br />기업을 위한 디지털 서비스와 AI 솔루션 확장",
        summary:
          "기업과 소상공인을 대상으로 웹·앱 개발, 디지털 서비스, SaaS 및 AI 기반 업무 솔루션을 제공하고 사업 영역을 확장합니다.",
        lead: "Newon Business는 기업과 소상공인의 디지털 서비스 구축과 업무 효율화를 지원하는 사업입니다.",
        linkLabel: "Newon Business 소개 보기",
        blocks: [
          {
            type: "p",
            text: "Newon Business는 기업과 소상공인의 디지털 서비스 구축과 업무 효율화를 지원하는 사업입니다.",
          },
          {
            type: "p",
            text: "현재 제공 가능한 웹·앱 개발 및 디지털 서비스와 함께, 기업용 SaaS와 AI 기반 업무 자동화 솔루션의 확장을 추진합니다.",
          },
          {
            type: "p",
            text: "고객의 사업 규모와 실제 업무 환경에 맞는 서비스를 설계하고, 향후 반복적으로 활용할 수 있는 기업용 솔루션과 구독형 서비스를 단계적으로 개발할 계획입니다.",
          },
          {
            type: "p",
            text: "현재 제공 가능한 서비스와 향후 개발할 SaaS 및 AI 기능은 명확하게 구분하여 안내합니다.",
          },
        ],
      },
      en: {
        title: "Newon Business is extending digital services and AI solutions for companies",
        titleHtml: "Newon Business is extending digital services<br />and AI solutions for companies",
        summary:
          "Newon offers web and app development and digital services for companies and small businesses, and is extending SaaS and AI tools for their work.",
        lead:
          "Newon Business helps companies and small businesses build digital services and work more efficiently.",
        linkLabel: "See Newon Business",
        blocks: [
          {
            type: "p",
            text: "Newon Business helps companies and small businesses build digital services and work more efficiently.",
          },
          {
            type: "p",
            text: "Alongside the web, app, and digital services that can be offered now, Newon is extending company SaaS and AI automation for work.",
          },
          {
            type: "p",
            text: "Services are shaped to the size of the business and how the work actually runs. Company solutions and subscriptions that can be used again are planned in stages.",
          },
          {
            type: "p",
            text: "What can be offered now is kept separate from SaaS and AI functions still to be built.",
          },
        ],
      },
    },
  }),
  businessArticle({
    id: "newon-commerce",
    slug: "newon-commerce",
    categoryLabel: "BUSINESS",
    brandName: "Newon Commerce",
    linkHref: "/{{LANG}}/ecosystem/",
    imageAlt: { ko: "Newon 로고", en: "Newon logo" },
    copy: {
      ko: {
        title: "Newon Commerce, 일상과 연결되는 커머스·생활서비스 사업 확대 구상",
        titleHtml: "Newon Commerce,<br />일상과 연결되는 커머스·생활서비스 사업 확대 구상",
        summary:
          "Newon의 소비자 서비스와 연결되는 상품, 생활서비스 및 새로운 거래 플랫폼을 중심으로 커머스 사업을 준비합니다.",
        lead: "Newon Commerce는 개인과 가족의 생활에 필요한 상품과 서비스를 연결하는 커머스 사업입니다.",
        linkLabel: "Newon Commerce 소개 보기",
        blocks: [
          {
            type: "p",
            text: "Newon Commerce는 개인과 가족의 생활에 필요한 상품과 서비스를 연결하는 커머스 사업입니다.",
          },
          {
            type: "p",
            text: "기존 Newon 서비스와 연계할 수 있는 상품 및 생활서비스를 검토하고, 향후 다양한 거래와 서비스 연결이 가능한 플랫폼으로 확장하는 방향을 구상하고 있습니다.",
          },
          {
            type: "p",
            text: "신규 사업 후보인 ShareOn은 사용하지 않는 물건을 가까운 이웃에게 빌려주고 필요한 물건을 지역에서 대여할 수 있도록 하는 공유경제 플랫폼으로 검토 중입니다.",
          },
          {
            type: "p",
            text: "ShareOn은 현재 사업 구상 단계이며, 실제 대여·예약·결제 서비스가 운영되고 있다는 의미는 아닙니다.",
          },
          {
            type: "p",
            text: "Newon Commerce는 실제 운영 중인 서비스와 향후 추진할 사업을 구분하여 단계적으로 확장할 계획입니다.",
          },
        ],
      },
      en: {
        title: "Newon Commerce is shaping commerce and everyday services connected to daily life",
        titleHtml: "Newon Commerce is shaping commerce<br />and everyday services connected to daily life",
        summary:
          "Newon is preparing a commerce business around goods, everyday services, and future transaction platforms that can connect with its consumer services.",
        lead:
          "Newon Commerce is the commerce business for connecting goods and services people and families need.",
        linkLabel: "See Newon Commerce",
        blocks: [
          {
            type: "p",
            text: "Newon Commerce is the commerce business for connecting goods and services people and families need.",
          },
          {
            type: "p",
            text: "Newon is reviewing goods and living services that could sit alongside existing Newon services, and a later direction where more kinds of transactions and services can connect.",
          },
          {
            type: "p",
            text: "ShareOn, a candidate for a new business, is under review as a sharing platform where unused things could be lent to nearby neighbors and needed things rented locally.",
          },
          {
            type: "p",
            text: "ShareOn is still a concept. It does not mean rental, booking, or payment is operating.",
          },
          {
            type: "p",
            text: "Newon Commerce will keep what is operating separate from what comes later, and extend in stages.",
          },
        ],
      },
    },
  }),
  {
    id: "petlog-community-update",
    slug: "petlog-community-update",
    date: "2026-08-19",
    category: "update",
    featured: false,
    includeInLatest: false,
    published: false,
    relatedProduct: "petlog",
    showInTimeline: false,
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
