/**
 * Company Portfolio projects — built from APP_CATALOG + real game project.
 * No invented downloads, ratings, or ship-day dates.
 */
import { APP_CATALOG, loadPortfolioApps } from "./portfolio-data.mjs";
import { PRODUCT_HISTORY } from "./product-history-data.mjs";

const YEAR_BY_SLUG = (() => {
  const map = {};
  for (const h of PRODUCT_HISTORY) {
    if (!h.product || !h.date) continue;
    const y = String(h.date).slice(0, 4);
    if (/^\d{4}$/.test(y) && !map[h.product]) map[h.product] = y;
  }
  return map;
})();

const CATEGORY_META = {
  app: { ko: "APP", en: "APP", filter: "app" },
  game: { ko: "GAME", en: "GAME", filter: "game" },
};

/** Extra non-app projects with verified public pages. */
const EXTRA_PROJECTS = [
  {
    slug: "404-human",
    name: "404: HUMAN",
    category: "game",
    featured: true,
    status: { ko: "프로젝트", en: "Project" },
    platform: { ko: "Web", en: "Web" },
    icon: "/404-human-logo.png",
    pageHref: "/{{LANG}}/404-human/",
    playHref: "/{{LANG}}/404-human/",
    tags: ["GAME", "AI", "INTERACTIVE"],
    copy: {
      ko: {
        oneLiner: "AI만 남은 세계에서 마지막 인간임을 숨기고 탈출하는 인터랙티브 게임.",
        summary: "AI 시대의 마지막 인간을 다루는 Newon Games 인터랙티브 프로젝트.",
        overview: "404: HUMAN은 AI만 남은 세계를 배경으로, 플레이어가 인간임을 숨기며 이야기를 이어 가는 인터랙티브 게임입니다.",
        idea: "AI와 인간의 경계가 흐려진 세계에서 ‘인간다움’을 질문하는 경험을 만들고자 했습니다.",
        problem: "단순한 장식형 AI 데모가 아니라, 선택의 무게가 느껴지는 인터랙티브 서사가 필요했습니다.",
        product: ["인터랙티브 내러티브", "선택 기반 진행", "AI 테마의 세계관"],
        design: "긴장감과 여백을 살린 UI로 플레이어가 이야기에 집중하도록 구성합니다.",
        build: "웹에서 바로 플레이할 수 있는 인터랙티브 경험으로 구현합니다.",
        launch: "Newon Games 프로젝트 페이지에서 공개·진행 중입니다.",
        learnings: "게임형 제품은 스토리·선택·인터페이스가 한 흐름으로 설계되어야 합니다.",
        next: "플레이 피드백을 반영해 서사와 인터랙션을 다듬습니다.",
      },
      en: {
        oneLiner: "An interactive escape game where you hide being the last human in an AI world.",
        summary: "A Newon Games interactive project about the last human in the age of AI.",
        overview: "404: HUMAN is an interactive game set in a world of AI — where you hide that you are human and keep the story moving.",
        idea: "We wanted an experience that asks what ‘being human’ means when AI fills the world.",
        problem: "Not a decorative AI demo — a narrative where choices carry weight.",
        product: ["Interactive narrative", "Choice-driven play", "AI-era worldbuilding"],
        design: "UI stays quiet so tension and story lead.",
        build: "Built as a web-playable interactive experience.",
        launch: "Available as a Newon Games project page.",
        learnings: "Game products need story, choice, and interface as one system.",
        next: "Iterate narrative and interaction from play feedback.",
      },
    },
  },
];

function pickCopy(block, lang) {
  if (!block) return {};
  return lang === "ko" ? block.ko || block.en || {} : block.en || block.ko || {};
}

function caseFromApp(app, lang) {
  const paras = app.ideaParagraphs || [];
  const features = (app.features || []).map((f) => f.title).filter(Boolean);
  const overview = app.summary || paras[0] || app.oneLiner || "";
  const idea = paras[0] || app.oneLiner || "";
  const problem = paras[1] || "";
  const design = lang === "ko"
    ? "Newon이 제품 UI/UX를 직접 설계하고 화면 구조를 잡습니다."
    : "Newon designs product UI/UX and screen structure in-house.";
  const build = lang === "ko"
    ? "기획부터 개발·출시까지 Newon이 직접 진행합니다."
    : "Newon owns planning through development and launch.";
  const launchParts = [];
  if (app.appStoreUrl) launchParts.push("App Store");
  if (app.googlePlayUrl) launchParts.push("Google Play");
  const launch = launchParts.length
    ? lang === "ko"
      ? `${launchParts.join(" · ")}에 출시되어 운영 중입니다.`
      : `Live on ${launchParts.join(" · ")}.`
    : lang === "ko"
      ? "Newon 제품으로 공개·운영 중입니다."
      : "Published as a Newon product.";
  const learnings = lang === "ko"
    ? "실제 출시와 운영을 통해 다음 제품의 기획·구조를 개선합니다."
    : "Live launches feed the next product’s planning and structure.";
  const next = lang === "ko"
    ? "사용자 피드백을 반영해 기능을 다듬고 업데이트를 이어 갑니다."
    : "Continue updates from user feedback.";

  return {
    overview,
    idea,
    problem,
    product: features.slice(0, 6),
    design,
    build,
    launch,
    learnings,
    next,
  };
}

function buildAppProject(app, index, lang) {
  const year = YEAR_BY_SLUG[app.slug] || "";
  const platforms = [];
  if (app.appStoreUrl) platforms.push("iOS");
  if (app.googlePlayUrl) platforms.push("Android");
  const platform =
    platforms.length > 0
      ? platforms.join(" · ")
      : lang === "ko"
        ? "App"
        : "App";
  const caseStudy = caseFromApp(app, lang);
  return {
    id: app.slug,
    slug: app.slug,
    index: index + 1,
    name: app.displayName || app.name,
    category: "app",
    categoryLabel: CATEGORY_META.app[lang === "ko" ? "ko" : "en"],
    filter: "app",
    tags: ["APP", ...(app.featured ? ["FEATURED"] : [])],
    year,
    platform,
    status: lang === "ko" ? "Live" : "Live",
    featured: !!app.featured,
    icon: app.icon || "",
    oneLiner: app.oneLiner || "",
    summary: app.summary || app.oneLiner || "",
    appStoreUrl: app.appStoreUrl || "",
    googlePlayUrl: app.googlePlayUrl || "",
    pageHref: "",
    playHref: "",
    caseStudy,
    shots: (app.shots || []).slice(0, 3),
  };
}

function buildExtraProject(extra, index, lang) {
  const c = pickCopy(extra.copy, lang);
  const year = YEAR_BY_SLUG[extra.slug] || "";
  return {
    id: extra.slug,
    slug: extra.slug,
    index: index + 1,
    name: extra.name,
    category: extra.category,
    categoryLabel: CATEGORY_META[extra.category]?.[lang === "ko" ? "ko" : "en"] || extra.category.toUpperCase(),
    filter: CATEGORY_META[extra.category]?.filter || extra.category,
    tags: extra.tags || [],
    year,
    platform: pickCopy({ ko: extra.platform?.ko, en: extra.platform?.en }, lang) || extra.platform?.en || "",
    status: pickCopy({ ko: extra.status?.ko, en: extra.status?.en }, lang) || "",
    featured: !!extra.featured,
    icon: extra.icon || "",
    oneLiner: c.oneLiner || "",
    summary: c.summary || c.oneLiner || "",
    appStoreUrl: "",
    googlePlayUrl: "",
    pageHref: (extra.pageHref || "").replace("{{LANG}}", lang === "ko" ? "ko" : lang),
    playHref: (extra.playHref || "").replace("{{LANG}}", lang === "ko" ? "ko" : lang),
    caseStudy: {
      overview: c.overview || "",
      idea: c.idea || "",
      problem: c.problem || "",
      product: c.product || [],
      design: c.design || "",
      build: c.build || "",
      launch: c.launch || "",
      learnings: c.learnings || "",
      next: c.next || "",
    },
    shots: [],
  };
}

/**
 * @param {string} langDir locale dir
 * @returns {object[]}
 */
export function getCompanyProjects(langDir = "ko") {
  const lang = langDir === "ko" ? "ko" : "en";
  const apps = loadPortfolioApps(lang);
  const projects = [];
  // Featured game first among extras, then featured apps, then rest
  const extras = EXTRA_PROJECTS.map((e, i) => buildExtraProject(e, i, lang));
  const appProjects = apps.map((a, i) => buildAppProject(a, i, lang));

  const featured = [...extras.filter((p) => p.featured), ...appProjects.filter((p) => p.featured)];
  const rest = [...extras.filter((p) => !p.featured), ...appProjects.filter((p) => !p.featured)];
  const ordered = [...featured, ...rest];
  return ordered.map((p, i) => ({ ...p, index: i + 1 }));
}

export function getCompanyProjectBySlug(slug, langDir = "ko") {
  return getCompanyProjects(langDir).find((p) => p.slug === slug) || null;
}

export function getPortfolioFilters(projects) {
  const set = new Set(projects.map((p) => p.filter));
  const all = [{ id: "all", label: "ALL" }];
  if (set.has("app")) all.push({ id: "app", label: "APP" });
  if (set.has("game")) all.push({ id: "game", label: "GAME" });
  return all;
}

export { CATEGORY_META };
