/**
 * Newon Resources — data only. No fake filler content.
 * Store/labs adapted from store-data.mjs & labs-data.mjs.
 */

/**
 * Public filter keys (UI). `all` is implied in the renderer.
 * @typedef {'templates'|'ai-code'|'business'|'design'|'publishing'|'reports'} StoreCategory
 */

/** Canonical store filter categories (excluding "all"). */
export const STORE_CATEGORIES = [
  "templates",
  "ai-code",
  "business",
  "design",
  "publishing",
  "reports",
];

/** Map legacy category ids → canonical category. */
export const STORE_CATEGORY_ALIASES = {
  prompts: "ai-code",
  development: "ai-code",
  developer: "ai-code",
  guides: "templates",
  free: "templates",
};

export function normalizeStoreCategory(cat) {
  const key = String(cat || "").toLowerCase();
  if (!key || key === "all") return key || "all";
  if (STORE_CATEGORIES.includes(key)) return key;
  return STORE_CATEGORY_ALIASES[key] || key;
}

/**
 * @type {Array<object>}
 * buyable:true + status:"live" = purchase inquiry CTA. buyable:false = waitlist.
 * free:true only when downloadable without charge.
 * collection: "publishing" | null — surfaces under Store ?cat=publishing
 */
export const STORE_PRODUCTS = [
  {
    id: "newon-project-starter-kit",
    slug: "newon-project-starter-kit",
    titleKo: "NEWON Project Starter Kit",
    titleEn: "NEWON Project Starter Kit",
    descKo: "프로젝트 시작에 필요한 요구사항·견적·범위·계약 초안·납품 체크리스트 5종 실무 문서 키트.",
    descEn: "A five-document business kit: requirements, quotation, scope, contract draft, and delivery checklist.",
    category: "business",
    collection: "publishing",
    type: "kit",
    price: "₩19,000",
    priceAmount: 19000,
    currency: "KRW",
    status: "live",
    buyable: true,
    free: false,
    featured: true,
    version: "1.0",
    updated: "2026-09",
    formats: ["DOCX", "PDF"],
    includesKo: [
      "프로젝트 요구사항 질문지",
      "프로젝트 견적서",
      "프로젝트 범위서",
      "프로젝트 계약서 초안",
      "납품 체크리스트",
    ],
    includesEn: [
      "Project Requirements",
      "Quotation",
      "Scope of Work",
      "Contract Draft",
      "Delivery Checklist",
    ],
    audienceKo: "프리랜서, 1인 개발자·디자이너, 소규모 스튜디오, 초기 창업자, 외주 프로젝트를 시작하는 사람",
    audienceEn: "Freelancers, solo builders, designers, small studios, early founders, and anyone starting client project work",
    deliveryKo: "구매 문의 확인 후 이메일로 DOCX·PDF 파일을 전달합니다. 즉시 다운로드는 제공하지 않습니다.",
    deliveryEn: "After your purchase inquiry is confirmed, DOCX and PDF files are delivered by email. Instant download is not available.",
    licenseKo:
      "구매자는 본인 또는 본인이 운영하는 사업·회사 프로젝트 업무에 문서를 수정하여 사용할 수 있습니다. 원본 파일의 재판매·재배포·공유, 상품 자체를 디지털 상품으로 판매하는 행위는 금지됩니다. 계약서 초안은 실무 참고용이며, 구체적인 거래와 법률관계에 따라 전문가 검토가 필요할 수 있습니다.",
    licenseEn:
      "Buyers may edit and use the documents for their own work or for projects run by their business. Reselling, redistributing, or sharing the original files — or selling the kit as your own digital product — is not allowed. The contract draft is a practical reference only; specific deals may require professional legal review.",
    locale: "all",
  },
  {
    id: "app-launch-kit",
    slug: "app-launch-kit",
    titleKo: "App Launch Kit",
    titleEn: "App Launch Kit",
    descKo: "앱 출시 전 체크리스트, 스토어 메타, 런칭 일정 템플릿.",
    descEn: "Pre-launch checklist, store metadata, and launch schedule templates.",
    category: "templates",
    collection: null,
    type: "kit",
    price: "COMING SOON",
    status: "building",
    buyable: false,
    free: false,
    featured: true,
    version: "0.1",
    updated: "2026-08",
    includesKo: ["출시 체크리스트", "스토어 리스팅 초안", "런칭 캘린더", "공지 문구 예시"],
    includesEn: ["Launch checklist", "Store listing draft", "Launch calendar", "Announcement copy samples"],
    audienceKo: "첫 앱을 출시하는 팀과 솔로 메이커",
    audienceEn: "Teams and solo makers shipping a first app",
    locale: "all",
  },
  {
    id: "mvp-planning-kit",
    slug: "mvp-planning-kit",
    titleKo: "MVP Planning Kit",
    titleEn: "MVP Planning Kit",
    descKo: "문제 정의부터 범위 결정까지 MVP 기획 워크시트.",
    descEn: "Worksheets from problem definition through MVP scope.",
    category: "templates",
    collection: null,
    type: "kit",
    price: "COMING SOON",
    status: "building",
    buyable: false,
    free: false,
    featured: true,
    version: "0.1",
    updated: "2026-08",
    includesKo: ["문제 정의 시트", "사용자·가설 정리", "기능 우선순위", "범위 컷 가이드"],
    includesEn: ["Problem brief", "User & hypothesis sheet", "Feature priority", "Scope cut guide"],
    audienceKo: "아이디어를 첫 제품으로 만드는 창업자·기획자",
    audienceEn: "Founders and PMs turning an idea into a first product",
    locale: "all",
  },
  {
    id: "cursor-prompt-pack",
    slug: "cursor-prompt-pack",
    titleKo: "Product Builder Prompt Pack",
    titleEn: "Product Builder Prompt Pack",
    descKo: "제품 기획부터 구현·QA까지 AI 기반 개발 환경용 프롬프트 워크플로 모음.",
    descEn: "Prompt workflow pack for planning, building, and QA in AI-assisted development environments.",
    category: "ai-code",
    collection: null,
    type: "pack",
    price: "COMING SOON",
    status: "building",
    buyable: false,
    free: false,
    featured: false,
    listed: false,
    version: "0.1",
    updated: "2026-08",
    includesKo: ["기획·스펙 프롬프트", "UI/UX 프롬프트", "구현·리팩터 프롬프트", "QA 체크 프롬프트"],
    includesEn: ["Spec prompts", "UI/UX prompts", "Build & refactor prompts", "QA check prompts"],
    audienceKo: "AI 기반 개발 환경에서 제품을 만드는 개발자·메이커",
    audienceEn: "Developers and makers building products in AI-assisted environments",
    locale: "all",
  },
  {
    id: "codex-builder-pack",
    slug: "codex-builder-pack",
    titleKo: "AI Product Builder Pack",
    titleEn: "AI Product Builder Pack",
    descKo: "에이전트형 AI 워크플로로 제품을 만드는 프롬프트·체크리스트 팩.",
    descEn: "Prompt and checklist pack for building products with agent-style AI workflows.",
    category: "ai-code",
    collection: null,
    type: "pack",
    price: "COMING SOON",
    status: "building",
    buyable: false,
    free: false,
    featured: false,
    listed: false,
    version: "0.1",
    updated: "2026-08",
    includesKo: ["에이전트 작업 분해", "스펙→코드 프롬프트", "리뷰 체크리스트", "릴리스 노트 골격"],
    includesEn: ["Agent task breakdown", "Spec→code prompts", "Review checklist", "Release-note outline"],
    audienceKo: "에이전트형 AI 워크플로로 제품을 만드는 팀",
    audienceEn: "Teams building products with agent-style AI workflows",
    locale: "all",
  },
  {
    id: "website-launch-checklist",
    slug: "website-launch-checklist",
    titleKo: "Website Launch Checklist",
    titleEn: "Website Launch Checklist",
    descKo: "웹사이트 런칭 전 SEO·성능·콘텐츠·법적 고지 체크리스트.",
    descEn: "Pre-launch checklist for SEO, performance, content, and legal notices.",
    category: "templates",
    collection: "publishing",
    type: "checklist",
    price: "COMING SOON",
    status: "building",
    buyable: false,
    free: false,
    featured: false,
    version: "0.1",
    updated: "2026-08",
    includesKo: ["런칭 체크리스트", "SEO 기본", "성능·접근성", "고지·문의 페이지"],
    includesEn: ["Launch checklist", "SEO basics", "Performance & a11y", "Legal & contact pages"],
    audienceKo: "웹사이트를 처음 출시하는 팀",
    audienceEn: "Teams launching a first website",
    locale: "all",
  },
  {
    id: "business-planning-workbook",
    slug: "business-planning-workbook",
    titleKo: "Business Planning Workbook",
    titleEn: "Business Planning Workbook",
    descKo: "문제·시장·모델·실행 계획을 한 권으로 정리하는 워크북.",
    descEn: "A workbook to structure problem, market, model, and execution plans.",
    category: "business",
    collection: "publishing",
    type: "workbook",
    price: "COMING SOON",
    status: "building",
    buyable: false,
    free: false,
    featured: false,
    version: "0.1",
    updated: "2026-08",
    includesKo: ["문제·고객 정의", "가치제안 시트", "모델 캔버스", "90일 실행 플랜"],
    includesEn: ["Problem & customer brief", "Value proposition sheet", "Model canvas", "90-day plan"],
    audienceKo: "초기 사업 계획을 정리하는 창업자",
    audienceEn: "Founders clarifying an early business plan",
    locale: "all",
  },
  {
    id: "product-research-template",
    slug: "product-research-template",
    titleKo: "Product Research Template",
    titleEn: "Product Research Template",
    descKo: "인터뷰·가설·경쟁 관찰을 정리하는 제품 리서치 템플릿.",
    descEn: "A product research template for interviews, hypotheses, and competitor notes.",
    category: "reports",
    collection: "publishing",
    type: "template",
    price: "COMING SOON",
    status: "building",
    buyable: false,
    free: false,
    featured: false,
    version: "0.1",
    updated: "2026-08",
    includesKo: ["가설 보드", "인터뷰 가이드", "경쟁 관찰 시트", "인사이트 요약"],
    includesEn: ["Hypothesis board", "Interview guide", "Competitor notes", "Insight summary"],
    audienceKo: "제품·리서치 담당자",
    audienceEn: "Product and research leads",
    locale: "all",
  },
  {
    id: "founder-dashboard",
    slug: "founder-dashboard",
    titleKo: "Founder Dashboard",
    titleEn: "Founder Dashboard",
    descKo: "지표·할 일·실험을 한곳에 모은 창업자용 대시보드 템플릿.",
    descEn: "A founder dashboard template for metrics, tasks, and experiments.",
    category: "business",
    collection: null,
    type: "template",
    price: "COMING SOON",
    status: "concept",
    buyable: false,
    free: false,
    featured: false,
    version: "0.1",
    updated: "2026-08",
    includesKo: ["주간 지표 보드", "실험 로그", "우선순위 백로그", "미팅 노트 레이아웃"],
    includesEn: ["Weekly metrics board", "Experiment log", "Priority backlog", "Meeting notes layout"],
    audienceKo: "초기 스타트업 창업자·운영 담당자",
    audienceEn: "Early-stage founders and operators",
    locale: "all",
  },
  {
    id: "product-roadmap",
    slug: "product-roadmap",
    titleKo: "Product Roadmap Template",
    titleEn: "Product Roadmap Template",
    descKo: "분기·테마 중심으로 로드맵을 정리하는 템플릿.",
    descEn: "A roadmap template organized by quarter and theme.",
    category: "templates",
    collection: null,
    type: "template",
    price: "COMING SOON",
    status: "concept",
    buyable: false,
    free: false,
    featured: false,
    version: "0.1",
    updated: "2026-08",
    includesKo: ["분기 로드맵", "테마 보드", "의존성 메모", "공유용 요약 슬라이드 골격"],
    includesEn: ["Quarterly roadmap", "Theme board", "Dependency notes", "Shareable summary outline"],
    audienceKo: "제품·엔지니어링 리드",
    audienceEn: "Product and engineering leads",
    locale: "all",
  },
];

/** Empty until real essays ship. Prefer empty hub empty-state. */
export const BLOG_POSTS = [];

/** Structure ready; empty = COMING SOON empty state. */
export const MEDIA_ITEMS = [];

export const MEDIA_SERIES = [
  { id: "newon-build", label: "NEWON BUILD" },
  { id: "product-demo", label: "PRODUCT DEMO" },
  { id: "newon-story", label: "NEWON STORY" },
];

export {
  LABS_EXPERIMENTS,
  LAB_STATUSES,
  LAB_PIPELINE,
  LAB_STATUS_MAP,
  VENTURE_STATUS_MAP,
  ventureStatusFor,
  getLabsExperiments,
  getLabExperiment,
  getLabStatusCounts,
  pipelineIndex,
} from "./lab-experiments.mjs";

import { LABS_EXPERIMENTS } from "./lab-experiments.mjs";
import { loadPublishedBlogRegistry } from "./blog-data.mjs";
import { getPublishedInsights } from "./insights-data.mjs";

/** Empty archive until issues ship. */
export const NEWSLETTER_ISSUES = [];

/** Free guide topics — track: guides | courses | workshops */
export const EDUCATION_TOPICS = [
  {
    id: "idea-to-mvp",
    slug: "idea-to-mvp",
    track: "guides",
    status: "coming_soon",
    titleKo: "FROM IDEA TO MVP",
    titleEn: "FROM IDEA TO MVP",
    bodyKo: "아이디어를 검증 가능한 최소 제품으로 좁히는 방법.",
    bodyEn: "How to narrow an idea into a testable minimum product.",
  },
  {
    id: "product-thinking",
    slug: "product-thinking",
    track: "guides",
    status: "coming_soon",
    titleKo: "PRODUCT THINKING",
    titleEn: "PRODUCT THINKING",
    bodyKo: "기능이 아니라 문제와 사용자 흐름으로 제품을 보는 관점.",
    bodyEn: "Seeing products through problems and user flows—not feature lists.",
  },
  {
    id: "building-with-ai",
    slug: "building-with-ai",
    track: "guides",
    status: "coming_soon",
    titleKo: "BUILDING WITH AI",
    titleEn: "BUILDING WITH AI",
    bodyKo: "AI를 보조로 쓰며 실제 제품을 만드는 실무 패턴.",
    bodyEn: "Practical patterns for shipping real products with AI as a partner.",
  },
  {
    id: "app-launch-basics",
    slug: "app-launch-basics",
    track: "courses",
    status: "coming_soon",
    titleKo: "APP LAUNCH BASICS",
    titleEn: "APP LAUNCH BASICS",
    bodyKo: "스토어 출시, 메타, 초기 피드백까지 런칭의 기본기.",
    bodyEn: "Launch fundamentals: store listing, metadata, and early feedback.",
  },
  {
    id: "validating-ideas",
    slug: "validating-ideas",
    track: "workshops",
    status: "coming_soon",
    titleKo: "VALIDATING IDEAS",
    titleEn: "VALIDATING IDEAS",
    bodyKo: "크게 만들기 전에 가설을 빠르게 확인하는 방법.",
    bodyEn: "Ways to test a hypothesis quickly before building big.",
  },
];

export function getAllStoreProducts() {
  return STORE_PRODUCTS.slice();
}

/** Public store catalog (excludes listed:false). */
export function getStoreProducts() {
  return STORE_PRODUCTS.filter((p) => p.listed !== false);
}

export function getStoreProduct(slug) {
  return STORE_PRODUCTS.find((p) => p.slug === slug) || null;
}

export function getFeaturedStoreProducts(limit = 3) {
  const publicProducts = getStoreProducts();
  const featured = publicProducts.filter((p) => p.featured);
  const list = featured.length ? featured : publicProducts;
  return list.slice(0, limit);
}

export function getPublishedBlogPosts() {
  return loadPublishedBlogRegistry();
}

export function getBlogPost(slug) {
  return loadPublishedBlogRegistry().find((p) => p.slug === slug) || null;
}

export function getMediaItems() {
  return MEDIA_ITEMS.slice();
}

export function getPublishedMediaItems() {
  return MEDIA_ITEMS.filter((m) => m && m.status === "published");
}

export function getMediaItem(slug) {
  return MEDIA_ITEMS.find((m) => m.slug === slug) || null;
}

export function getNewsletterIssues() {
  return NEWSLETTER_ISSUES.slice();
}

export function getEducationTopics() {
  return EDUCATION_TOPICS.slice();
}

/**
 * Search index items for resources hub (type, title, description, url).
 * Relative to /{lang}/resources/
 */
export function buildSearchIndex(lang = "en") {
  const isKo = lang === "ko";
  const items = [];

  for (const p of STORE_PRODUCTS) {
    if (p.listed === false) continue;
    items.push({
      type: "store",
      title: isKo ? p.titleKo : p.titleEn,
      description: isKo ? p.descKo : p.descEn,
      url: `store/${p.slug}/`,
      tags: [p.category, p.type, "store"],
      category: p.category || "",
    });
  }
  for (const a of getPublishedInsights()) {
    items.push({
      type: "insights",
      title: isKo ? a.titleKo : a.titleEn,
      description: isKo ? a.descKo || "" : a.descEn || "",
      url: `insights/${a.slug}/`,
    });
  }
  for (const post of getPublishedBlogPosts()) {
    items.push({
      type: "blog",
      title: isKo ? post.titleKo : post.titleEn,
      description: isKo ? post.descKo || "" : post.descEn || "",
      url: `blog/${post.slug}/`,
    });
  }
  for (const m of getPublishedMediaItems()) {
    items.push({
      type: "media",
      title: isKo ? m.titleKo : m.titleEn,
      description: isKo ? m.descKo || "" : m.descEn || "",
      url: `media/${m.slug}/`,
    });
  }
  for (const e of LABS_EXPERIMENTS) {
    items.push({
      type: "labs",
      title: isKo ? e.titleKo : e.titleEn,
      description: isKo ? e.descKo : e.descEn,
      url: `labs/${e.slug}/`,
    });
  }
  for (const t of EDUCATION_TOPICS) {
    items.push({
      type: "education",
      title: isKo ? t.titleKo : t.titleEn,
      description: isKo ? t.bodyKo : t.bodyEn,
      url: `education/#${t.slug}`,
    });
  }

  return items;
}
