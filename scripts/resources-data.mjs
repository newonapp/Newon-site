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
 * buyable:false until payment wired. free:true only when downloadable without charge.
 * collection: "publishing" | null — surfaces under Store ?cat=publishing
 */
export const STORE_PRODUCTS = [
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
    titleKo: "Cursor Product Builder Pack",
    titleEn: "Cursor Product Builder Pack",
    descKo: "제품 기획부터 구현·QA까지 Cursor 워크플로 프롬프트 모음.",
    descEn: "Cursor workflow prompts from product planning through build and QA.",
    category: "ai-code",
    collection: null,
    type: "pack",
    price: "COMING SOON",
    status: "building",
    buyable: false,
    free: false,
    featured: true,
    version: "0.1",
    updated: "2026-08",
    includesKo: ["기획·스펙 프롬프트", "UI/UX 프롬프트", "구현·리팩터 프롬프트", "QA 체크 프롬프트"],
    includesEn: ["Spec prompts", "UI/UX prompts", "Build & refactor prompts", "QA check prompts"],
    audienceKo: "Cursor로 제품을 만드는 개발자·메이커",
    audienceEn: "Developers and makers building with Cursor",
    locale: "all",
  },
  {
    id: "codex-builder-pack",
    slug: "codex-builder-pack",
    titleKo: "Codex Builder Pack",
    titleEn: "Codex Builder Pack",
    descKo: "Codex/에이전트 워크플로로 제품을 만드는 프롬프트·체크리스트 팩.",
    descEn: "Prompt and checklist pack for building products with Codex-style agent workflows.",
    category: "ai-code",
    collection: null,
    type: "pack",
    price: "COMING SOON",
    status: "building",
    buyable: false,
    free: false,
    featured: false,
    version: "0.1",
    updated: "2026-08",
    includesKo: ["에이전트 작업 분해", "스펙→코드 프롬프트", "리뷰 체크리스트", "릴리스 노트 골격"],
    includesEn: ["Agent task breakdown", "Spec→code prompts", "Review checklist", "Release-note outline"],
    audienceKo: "AI 코딩 에이전트로 제품을 만드는 팀",
    audienceEn: "Teams building products with AI coding agents",
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
import { getPublishedInsights } from "./insights-data.mjs";

/** Empty archive until issues ship. */
export const NEWSLETTER_ISSUES = [];

/** Exploring topics — not confirmed courses. */
export const EDUCATION_TOPICS = [
  {
    id: "idea-to-mvp",
    slug: "idea-to-mvp",
    titleKo: "FROM IDEA TO MVP",
    titleEn: "FROM IDEA TO MVP",
    bodyKo: "아이디어를 검증 가능한 최소 제품으로 좁히는 방법.",
    bodyEn: "How to narrow an idea into a testable minimum product.",
  },
  {
    id: "product-thinking",
    slug: "product-thinking",
    titleKo: "PRODUCT THINKING",
    titleEn: "PRODUCT THINKING",
    bodyKo: "기능이 아니라 문제와 사용자 흐름으로 제품을 보는 관점.",
    bodyEn: "Seeing products through problems and user flows—not feature lists.",
  },
  {
    id: "building-with-ai",
    slug: "building-with-ai",
    titleKo: "BUILDING WITH AI",
    titleEn: "BUILDING WITH AI",
    bodyKo: "AI를 보조로 쓰며 실제 제품을 만드는 실무 패턴.",
    bodyEn: "Practical patterns for shipping real products with AI as a partner.",
  },
  {
    id: "app-launch-basics",
    slug: "app-launch-basics",
    titleKo: "APP LAUNCH BASICS",
    titleEn: "APP LAUNCH BASICS",
    bodyKo: "스토어 출시, 메타, 초기 피드백까지 런칭의 기본기.",
    bodyEn: "Launch fundamentals: store listing, metadata, and early feedback.",
  },
  {
    id: "validating-ideas",
    slug: "validating-ideas",
    titleKo: "VALIDATING IDEAS",
    titleEn: "VALIDATING IDEAS",
    bodyKo: "크게 만들기 전에 가설을 빠르게 확인하는 방법.",
    bodyEn: "Ways to test a hypothesis quickly before building big.",
  },
];

export function getStoreProducts() {
  return STORE_PRODUCTS.slice();
}

export function getStoreProduct(slug) {
  return STORE_PRODUCTS.find((p) => p.slug === slug) || null;
}

export function getFeaturedStoreProducts(limit = 3) {
  const featured = STORE_PRODUCTS.filter((p) => p.featured);
  const list = featured.length ? featured : STORE_PRODUCTS;
  return list.slice(0, limit);
}

export function getPublishedBlogPosts() {
  return BLOG_POSTS.filter((p) => p && p.status === "published");
}

export function getBlogPost(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}

export function getMediaItems() {
  return MEDIA_ITEMS.slice();
}

export function getPublishedMediaItems() {
  return MEDIA_ITEMS.filter((m) => m && m.status === "published");
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
    items.push({
      type: "store",
      title: isKo ? p.titleKo : p.titleEn,
      description: isKo ? p.descKo : p.descEn,
      url: `store/${p.slug}/`,
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
