/**
 * Portfolio app catalog — structural map onto existing Newon assets + locales/ko.json.
 * Copy, screenshots, and store URLs are resolved at generate time; no duplicated images.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Asset locations used on the live home pages. Copy comes from locales/ko.json. */
export const APP_CATALOG = [
  {
    slug: "newon-plus",
    ns: "np",
    name: "Newon+",
    label: "Newon+",
    icon: "/newon-plus-logo.png",
    homeHash: "#newon-plus-app",
    shotPrefix: "np",
    shotDir: "i18n-ko",
    featured: true,
    maxShots: 5,
    indexShots: 5,
  },
  {
    slug: "babylog",
    ns: "bl",
    name: "BabyLog",
    icon: "/babylog-logo.png",
    homeHash: "#babylog-app",
    shotPrefix: "bl",
    shotDir: "i18n-ko",
    featured: true,
    maxShots: 7,
    indexShots: 7,
  },
  {
    slug: "petlog",
    ns: "pl",
    name: "PetLog",
    icon: "/petlog-logo.png",
    homeHash: "#petlog-app",
    shotPrefix: "pl",
    shotDir: "i18n-ko",
    featured: true,
    maxShots: 7,
    indexShots: 7,
  },
  {
    slug: "myworld",
    ns: "mw",
    name: "My World",
    icon: "/myworld-logo.png",
    homeHash: "#myworld-app",
    shotPrefix: "mw",
    shotDir: "i18n-ko",
    featured: true,
    maxShots: 7,
    indexShots: 7,
  },
  {
    slug: "savy",
    ns: "sv",
    name: "SAVY",
    icon: "/savy-logo.png",
    homeHash: "#savy-app",
    shotPrefix: "sv",
    shotDir: "i18n-ko",
    featured: true,
    maxShots: 6,
    indexShots: 6,
  },
  {
    slug: "ox-month",
    ns: "ox",
    name: "OX MONTH",
    icon: "/ox-month-logo.png",
    homeHash: "#ox-month",
    shotPrefix: "ox",
    shotDir: "ox",
    featured: false,
    maxShots: 9,
    indexShots: 0,
  },
  {
    slug: "pillmate",
    ns: "pm",
    name: "Pillmate",
    icon: "/pillmate-logo.png",
    homeHash: "#pillmate-app",
    shotPrefix: "pm",
    shotDir: "subping",
    featured: false,
    maxShots: 7,
    indexShots: 0,
  },
  {
    slug: "goalup",
    ns: "gu",
    name: "GoalUp",
    icon: "/goalup-logo.png",
    homeHash: "#goalup-app",
    shotPrefix: "gu",
    shotDir: "i18n-ko",
    featured: false,
    maxShots: 7,
    indexShots: 0,
  },
  {
    slug: "countup",
    ns: "cu",
    name: "CountUp",
    icon: "/countup-logo.png",
    homeHash: "#countup-app",
    shotPrefix: "cu",
    shotDir: "i18n-ko",
    featured: false,
    maxShots: 6,
    indexShots: 0,
  },
  {
    slug: "subping",
    ns: "sp",
    name: "SubPing",
    icon: "/subping-logo.png",
    homeHash: "#subping-app",
    shotPrefix: "sp",
    shotDir: "subping",
    featured: false,
    maxShots: 7,
    indexShots: 0,
  },
  {
    slug: "piggyup",
    ns: "pu",
    name: "PiggyUp",
    icon: "/piggyup-logo.png",
    homeHash: "#piggyup-app",
    shotPrefix: "pu",
    shotDir: "i18n-ko",
    featured: false,
    maxShots: 7,
    indexShots: 0,
  },
];

/** Home hub app menu order (matches site index). */
export const NAV_FLYOUT_SLUGS = [
  "ox-month",
  "subping",
  "pillmate",
  "savy",
  "babylog",
  "petlog",
  "piggyup",
  "goalup",
  "countup",
  "newon-plus",
  "myworld",
];

const NAV_FLYOUT_META = {
  "ox-month": { descKey: "oxDesc", hintKey: "mobileOxHint" },
  subping: { descKey: "subpingDesc", hintKey: "mobileSubpingHint" },
  pillmate: { descKey: "pillmateDesc", hintKey: "mobilePillmateHint" },
  savy: { descKey: "savyDesc", hintKey: "mobileSavyHint" },
  babylog: { descKey: "babylogDesc", hintKey: "mobileBabylogHint" },
  petlog: { descKey: "petlogDesc", hintKey: "mobilePetlogHint" },
  piggyup: { descKey: "piggyupDesc", hintKey: "mobilePiggyupHint" },
  goalup: { descKey: "goalupDesc", hintKey: "mobileGoalupHint" },
  countup: { descKey: "countupDesc", hintKey: "mobileCountupHint" },
  "newon-plus": { descKey: "newonPlusDesc", hintKey: "mobileNewonPlusHint", menuName: "Newon" },
  myworld: { descKey: "myworldDesc", hintKey: "mobileMyworldHint" },
};

/** Extra apps shown on the Business ecosystem (not in the portfolio catalog). */
export const BUSINESS_APP_EXTRAS = [
  {
    slug: "404-human",
    name: "404: HUMAN",
    icon: "/404-human-logo.png",
    homeHash: "404-human/",
  },
];

/** Business page product groups — reuses APP_CATALOG icons + hashes. */
export const BUSINESS_ECOSYSTEM = [
  { titleKey: "business.catProductivity", slugs: ["ox-month", "goalup", "countup"] },
  { titleKey: "business.catFinance", slugs: ["savy", "subping", "piggyup"] },
  { titleKey: "business.catHealth", slugs: ["pillmate"] },
  { titleKey: "business.catFamily", slugs: ["babylog", "petlog", "myworld"] },
  { titleKey: "business.catGames", slugs: ["404-human"] },
  { titleKey: "business.catMembership", slugs: ["newon-plus"] },
];

export const FOUNDER_ROLES = [
  "제품 기획",
  "UI/UX",
  "개발",
  "앱 출시",
  "운영",
  "마케팅 & 홍보",
  "제품 관리",
];

export const ROLE_LINE = "기획 · UI/UX · 개발 · 출시 · 운영 · 마케팅";

export const WHAT_I_DO = [
  {
    title: "앱 기획",
    en: "Product Planning",
    body: "아이디어를 구체화하고 핵심 기능, 서비스 구조와 사용자 흐름을 직접 기획합니다.",
  },
  {
    title: "UI/UX 디자인",
    en: "UI/UX Design",
    body: "사용자 경험과 화면 구조를 설계하고 실제 제품의 인터페이스를 구성합니다.",
  },
  {
    title: "앱 개발",
    en: "App Development",
    body: "Flutter와 AI 기반 개발 도구를 활용해 iOS 및 Android 앱을 개발합니다.",
  },
  {
    title: "출시 및 운영",
    en: "Launch & Operation",
    body: "스토어 출시, 심사 대응, 업데이트, 기능 개선과 지속적인 서비스 운영을 관리합니다.",
  },
  {
    title: "마케팅 & 홍보",
    en: "Marketing & Promotion",
    body: "앱별 마케팅 전략을 기획하고 SNS, 홍보 영상, 블로그 등의 콘텐츠와 프로모션을 직접 제작하고 운영합니다.",
  },
  {
    title: "브랜드 & 제품 관리",
    en: "Brand & Product Management",
    body: "Newon의 여러 디지털 제품을 기획하고 각각의 서비스와 브랜드를 지속적으로 관리합니다.",
  },
];

export const PROCESS_STEPS = [
  { ko: "아이디어", en: "Idea" },
  { ko: "기획", en: "Planning" },
  { ko: "UI/UX", en: "UI/UX" },
  { ko: "개발", en: "Development" },
  { ko: "출시", en: "Launch" },
  { ko: "운영", en: "Operation" },
  { ko: "마케팅", en: "Marketing" },
];

/**
 * Portfolio proof metrics. Only provided values are shown.
 * Set visible:true and a real value to add a card (e.g. downloads).
 * Age is intentionally omitted as a primary figure.
 */
export const PORTFOLIO_STATS = {
  label: "Newon in Numbers",
  title: "숫자로 보는 Newon",
  headline: "6개월, 12개의 앱.",
  supporting:
    "아이디어부터 기획, UI/UX, 개발, 출시, 운영, 마케팅까지 직접 진행했습니다.",
  items: [
    {
      id: "apps",
      value: "11",
      valueKind: "number",
      title: "개발한 앱",
      note: "6개월 동안 12개의 앱을 직접 기획하고 개발했습니다.",
      noteShort: "6개월 동안 기획·개발",
      href: "#projects",
      visible: true,
    },
    {
      id: "languages",
      value: "13",
      valueKind: "number",
      title: "지원 언어",
      note: "Newon 서비스 최대 13개 언어 지원",
      visible: true,
    },
    {
      id: "countries",
      value: "177",
      valueKind: "number",
      title: "출시 국가",
      note: "Newon의 앱을 전 세계 177개국에 출시했습니다.",
      noteShort: "전 세계 177개국 출시",
      visible: true,
    },
    {
      id: "newon-plus",
      value: "Newon+",
      valueKind: "text",
      title: "통합 앱 관리",
      note: "여러 Newon 앱과 서비스를 하나의 앱에서 통합 관리합니다.",
      noteShort: "여러 앱을 하나의 앱에서 통합 관리",
      visible: true,
    },
    {
      id: "downloads",
      labelEn: "Total Downloads",
      value: null,
      valueKind: "number",
      title: "누적 다운로드",
      note: "",
      visible: false,
    },
  ],
};

export function visibleStats(stats = PORTFOLIO_STATS) {
  return stats.items.filter((item) => item.visible && item.value);
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .replace(/([A-Za-z0-9+])\s+(는|은|이|가|을|를|의|와|과)/g, "$1$2")
    .trim();
}

function stripEmoji(s) {
  return String(s || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim();
}

function shotCandidates(entry, n, lang = "ko") {
  const file = `${entry.shotPrefix}-showcase-${String(n).padStart(2, "0")}.png`;
  const p = entry.shotPrefix;
  const list = [];
  if (p === "ox") {
    if (lang === "ko") list.push(`/i18n-img/ko/${file}`, `/i18n-img/ja/${file}`);
    else list.push(`/i18n-img/en/${file}`);
    list.push(`/i18n-img/${lang}/${file}`, `/ox-img/${file}`);
  } else if (p === "pm" || p === "sp") {
    if (lang === "ko") list.push(`/subping-img/${file}`);
    if (lang === "ja" || lang === "es" || lang === "pt-br") list.push(`/i18n-img/${lang}/${file}`);
    list.push(`/i18n-img/en/${file}`, `/subping-img/${file}`);
  } else {
    list.push(`/i18n-img/${lang}/${file}`, `/i18n-img/en/${file}`, `/i18n-img/ko/${file}`);
    if (p === "mw") list.push(`/myworld-img/${file}`);
  }
  return list;
}

function firstExistingShot(entry, n, lang = "ko") {
  for (const web of shotCandidates(entry, n, lang)) {
    if (fs.existsSync(path.join(ROOT, web.replace(/^\//, "")))) return web;
  }
  return "";
}

function shotAlt(loc, n, name) {
  return (
    loc[`imgShot${n}Alt`] ||
    loc[`imgShowcase${String(n).padStart(2, "0")}Alt`] ||
    `${name} 앱 화면`
  );
}

function ideaParagraphs(loc) {
  if (loc.introHtml) {
    const matches = String(loc.introHtml).match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
    const paras = matches.map(stripHtml).filter(Boolean);
    if (paras.length) return paras.slice(0, 4);
    const one = stripHtml(loc.introHtml);
    return one ? [one] : [];
  }
  return [loc.introLeadHtml, loc.introP1, loc.introP2, loc.globalReachDescription]
    .map(stripHtml)
    .filter(Boolean)
    .slice(0, 4);
}

function featuresFromLocale(loc) {
  const feats = [];
  const seen = new Set();
  const add = (title, lead) => {
    const t = String(title || "").trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    feats.push({ title: t, lead: stripHtml(lead) });
  };
  for (let i = 1; i <= 8; i++) {
    add(loc[`feat${i}Title`], [loc[`feat${i}Lead`], loc[`feat${i}Note`]].filter(Boolean).join(" "));
  }
  for (const key of Object.keys(loc)) {
    if (key === "featuresTitle" || !/^feat[A-Za-z].*Title$/.test(key)) continue;
    const stem = key.slice(4, -5);
    add(loc[key], [loc[`feat${stem}Lead`], loc[`feat${stem}Note`]].filter(Boolean).join(" "));
  }
  return feats;
}

function readLocale(lang) {
  const file = path.join(ROOT, "locales", `${lang}.json`);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function loadPortfolioApps(lang = "ko") {
  const en = readLocale("en");
  const locFile = lang === "en" ? en : { ...en, ...readLocale(lang) };
  return APP_CATALOG.map((entry) => {
    const loc = { ...(en[entry.ns] || {}), ...(locFile[entry.ns] || {}) };
    const shots = [];
    for (let n = 1; n <= entry.maxShots; n++) {
      const src = firstExistingShot(entry, n, lang);
      if (!src) continue;
      shots.push({ src, alt: shotAlt(loc, n, loc.h1 || entry.name) });
    }
    const summary =
      stripHtml(loc.heroReachSummaryHtml) ||
      loc.heroReachSummary ||
      loc.globalReachSummary ||
      stripHtml(loc.subtitle) ||
      "";
    const paras = ideaParagraphs(loc);
    const iconOk = fs.existsSync(path.join(ROOT, entry.icon.replace(/^\//, "")));
    return {
      ...entry,
      displayName: entry.name || loc.h1,
      icon: iconOk ? entry.icon : "",
      iconAlt: loc.heroLogoAlt || `${entry.name || loc.h1} app icon`,
      summary,
      ideaParagraphs: paras,
      oneLiner: stripEmoji(loc.badge) || stripHtml(loc.subtitleHtml || loc.subtitle),
      features: featuresFromLocale(loc),
      appStoreUrl: loc.appStoreUrl || "",
      googlePlayUrl: loc.googlePlayUrl || "",
      homeUrl: `https://www.newon.app/${lang}/${entry.homeHash}`,
      shots,
      indexShotsList: shots.slice(0, entry.indexShots || 0),
    };
  });
}

export function featuredApps(apps) {
  return apps.filter((a) => a.featured);
}

export function moreApps(apps) {
  return apps.filter((a) => !a.featured);
}

export function loadNavFlyout(lang = "ko") {
  const en = readLocale("en");
  const locFile = lang === "en" ? en : { ...en, ...readLocale(lang) };
  const nav = { ...(en.nav || {}), ...(locFile.nav || {}) };
  const bySlug = Object.fromEntries(APP_CATALOG.map((e) => [e.slug, e]));

  const apps = NAV_FLYOUT_SLUGS.map((slug) => {
    const entry = bySlug[slug];
    const meta = NAV_FLYOUT_META[slug];
    if (!entry || !meta) return null;
    const iconOk = fs.existsSync(path.join(ROOT, entry.icon.replace(/^\//, "")));
    return {
      name: meta.menuName || entry.name,
      icon: iconOk ? entry.icon : "",
      desc: nav[meta.descKey] || "",
      hint: nav[meta.hintKey] || "",
      href: `/${lang}/${entry.homeHash}`,
    };
  }).filter(Boolean);

  return {
    apps,
    label: nav.appsLabel || nav.appsAria || "Newon apps",
    appsAria: nav.appsAria || nav.appsLabel || "Newon apps",
    mobileSummary: nav.mobileSummary || nav.appsLabel || "Newon apps",
  };
}
