#!/usr/bin/env node
/**
 * Final chrome/nav consistency pass — keep selected-language UI unified.
 * Runs last in run-all-locale-patches so translate-cache cannot overwrite.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = path.join(ROOT, "locales");

const NAV = {
  ko: {
    home: "홈",
    business: "비즈니스",
    portfolio: "포트폴리오",
    about: "회사 소개",
    ideas: "아이디어",
    newsUpdates: "뉴스",
    projects: "프로젝트",
    contact: "연락처",
    intro: "소개",
    brandKicker: "Newon의 앱",
    appsLabel: "Newon의 앱",
  },
  en: {
    home: "Home",
    business: "Business",
    portfolio: "Portfolio",
    about: "About",
    ideas: "Ideas",
    newsUpdates: "News",
    projects: "Projects",
    contact: "Contact",
    intro: "About",
    brandKicker: "Apps by Newon",
    appsLabel: "Newon apps",
  },
  ja: {
    home: "ホーム",
    business: "ビジネス",
    portfolio: "ポートフォリオ",
    about: "会社紹介",
    ideas: "アイデア",
    newsUpdates: "ニュース",
    projects: "プロジェクト",
    contact: "お問い合わせ",
    intro: "紹介",
    brandKicker: "Newonのアプリ",
    appsLabel: "Newonのアプリ",
  },
  es: {
    home: "Inicio",
    business: "Business",
    portfolio: "Portafolio",
    about: "Acerca de",
    ideas: "Ideas",
    newsUpdates: "Noticias",
    projects: "Proyectos",
    contact: "Contacto",
    intro: "Acerca de",
    brandKicker: "Apps de Newon",
    appsLabel: "Apps de Newon",
  },
  "pt-br": {
    home: "Início",
    business: "Business",
    portfolio: "Portfólio",
    about: "Sobre",
    ideas: "Ideias",
    newsUpdates: "Notícias",
    projects: "Projetos",
    contact: "Contato",
    intro: "Sobre",
    brandKicker: "Apps da Newon",
    appsLabel: "Apps da Newon",
  },
  fr: {
    home: "Accueil",
    business: "Business",
    portfolio: "Portfolio",
    about: "À propos",
    ideas: "Idées",
    newsUpdates: "Actualités",
    projects: "Projets",
    contact: "Contact",
    intro: "À propos",
    brandKicker: "Apps Newon",
    appsLabel: "Apps Newon",
  },
  de: {
    home: "Startseite",
    business: "Business",
    portfolio: "Portfolio",
    about: "Über uns",
    ideas: "Ideen",
    newsUpdates: "News",
    projects: "Projekte",
    contact: "Kontakt",
    intro: "Über uns",
    brandKicker: "Apps von Newon",
    appsLabel: "Apps von Newon",
  },
  hi: {
    home: "होम",
    business: "बिज़नेस",
    portfolio: "पोर्टफोलियो",
    about: "परिचय",
    ideas: "आइडियाज़",
    newsUpdates: "न्यूज़",
    projects: "प्रोजेक्ट्स",
    contact: "संपर्क",
    intro: "परिचय",
    brandKicker: "Newon ऐप्स",
    appsLabel: "Newon के ऐप्स",
  },
  id: {
    home: "Beranda",
    business: "Bisnis",
    portfolio: "Portofolio",
    about: "Tentang",
    ideas: "Ide",
    newsUpdates: "Berita",
    projects: "Proyek",
    contact: "Kontak",
    intro: "Tentang",
    brandKicker: "Aplikasi Newon",
    appsLabel: "Aplikasi Newon",
  },
};

const SCROLL = {
  ko: "스크롤",
  en: "Scroll",
  ja: "スクロール",
  es: "Desplazarse",
  "pt-br": "Rolar",
  fr: "Défiler",
  de: "Scrollen",
  hi: "स्क्रॉल",
  id: "Gulir",
};

const IDEAS_NAV = {
  ko: { navSuggest: "제안하기", navHow: "진행 방법", navAria: "아이디어" },
  en: { navSuggest: "Suggest", navHow: "How it works", navAria: "Ideas" },
  ja: { navSuggest: "提案する", navHow: "進め方", navAria: "アイデア" },
  es: { navSuggest: "Proponer", navHow: "Cómo funciona", navAria: "Ideas" },
  "pt-br": { navSuggest: "Sugerir", navHow: "Como funciona", navAria: "Ideias" },
  fr: { navSuggest: "Proposer", navHow: "Comment ça marche", navAria: "Idées" },
  de: { navSuggest: "Vorschlagen", navHow: "So geht’s", navAria: "Ideen" },
  hi: { navSuggest: "सुझाएँ", navHow: "कैसे काम करता है", navAria: "आइडियाज़" },
  id: { navSuggest: "Usulkan", navHow: "Cara kerja", navAria: "Ide" },
};

const BIZ_NAV = {
  ko: {
    navAria: "비즈니스",
    navWork: "협업 방식",
    navCapabilities: "역량",
    navIndustries: "산업",
    navInquiry: "문의하기",
  },
  en: {
    navAria: "Business",
    navWork: "How we work",
    navCapabilities: "Capabilities",
    navIndustries: "Industries",
    navInquiry: "Inquire",
  },
  ja: {
    navAria: "ビジネス",
    navWork: "協業の形",
    navCapabilities: "できること",
    navIndustries: "業界",
    navInquiry: "お問い合わせ",
  },
  es: {
    navAria: "Business",
    navWork: "Colaboración",
    navCapabilities: "Capacidades",
    navIndustries: "Industrias",
    navInquiry: "Consultar",
  },
  "pt-br": {
    navAria: "Business",
    navWork: "Colaboração",
    navCapabilities: "Capacidades",
    navIndustries: "Setores",
    navInquiry: "Consultar",
  },
  fr: {
    navAria: "Business",
    navWork: "Collaboration",
    navCapabilities: "Capacités",
    navIndustries: "Secteurs",
    navInquiry: "Demander",
  },
  de: {
    navAria: "Business",
    navWork: "Zusammenarbeit",
    navCapabilities: "Leistungen",
    navIndustries: "Branchen",
    navInquiry: "Anfragen",
  },
  hi: {
    navAria: "बिज़नेस",
    navWork: "सहयोग",
    navCapabilities: "क्षमताएँ",
    navIndustries: "उद्योग",
    navInquiry: "पूछताछ",
  },
  id: {
    navAria: "Bisnis",
    navWork: "Kolaborasi",
    navCapabilities: "Kapabilitas",
    navIndustries: "Industri",
    navInquiry: "Tanya",
  },
};

const ABOUT_HUB = {
  ko: {
    nav1Title: "포트폴리오",
    nav2Title: "뉴스 & 업데이트",
    nav3Title: "Newon 아이디어",
    nav4Title: "Newon 비즈니스",
    finalPortfolio: "포트폴리오 →",
    finalIdeas: "아이디어 제안 →",
    finalBusiness: "비즈니스 →",
  },
  en: {
    nav1Title: "Portfolio",
    nav2Title: "News & Updates",
    nav3Title: "Newon Ideas",
    nav4Title: "Newon Business",
    finalPortfolio: "Portfolio →",
    finalIdeas: "Suggest an idea →",
    finalBusiness: "Business →",
  },
  ja: {
    nav1Title: "ポートフォリオ",
    nav2Title: "ニュースと最新情報",
    nav3Title: "Newon アイデア",
    nav4Title: "Newon ビジネス",
    finalPortfolio: "ポートフォリオ →",
    finalIdeas: "アイデアを提案 →",
    finalBusiness: "ビジネス →",
  },
  es: {
    nav1Title: "Portafolio",
    nav2Title: "Noticias y actualizaciones",
    nav3Title: "Newon Ideas",
    nav4Title: "Newon Business",
    finalPortfolio: "Portafolio →",
    finalIdeas: "Sugerir una idea →",
    finalBusiness: "Business →",
  },
  "pt-br": {
    nav1Title: "Portfólio",
    nav2Title: "Notícias e atualizações",
    nav3Title: "Newon Ideias",
    nav4Title: "Newon Business",
    finalPortfolio: "Portfólio →",
    finalIdeas: "Sugerir uma ideia →",
    finalBusiness: "Business →",
  },
  fr: {
    nav1Title: "Portfolio",
    nav2Title: "Actualités",
    nav3Title: "Newon Idées",
    nav4Title: "Newon Business",
    finalPortfolio: "Portfolio →",
    finalIdeas: "Proposer une idée →",
    finalBusiness: "Business →",
  },
  de: {
    nav1Title: "Portfolio",
    nav2Title: "News & Updates",
    nav3Title: "Newon Ideen",
    nav4Title: "Newon Business",
    finalPortfolio: "Portfolio →",
    finalIdeas: "Idee vorschlagen →",
    finalBusiness: "Business →",
  },
  hi: {
    nav1Title: "पोर्टफोलियो",
    nav2Title: "न्यूज़ और अपडेट",
    nav3Title: "Newon आइडियाज़",
    nav4Title: "Newon बिज़नेस",
    finalPortfolio: "पोर्टफोलियो →",
    finalIdeas: "आइडिया सुझाएँ →",
    finalBusiness: "बिज़नेस →",
  },
  id: {
    nav1Title: "Portofolio",
    nav2Title: "Berita & pembaruan",
    nav3Title: "Newon Ide",
    nav4Title: "Newon Bisnis",
    finalPortfolio: "Portofolio →",
    finalIdeas: "Usulkan ide →",
    finalBusiness: "Bisnis →",
  },
};

const BIZ_PAGES_COMMON = {
  ko: {
    breadcrumbBusiness: "비즈니스",
    aboutLabel: "개요",
    offerLabel: "범위",
    fitLabel: "추천",
    processLabel: "진행",
    faqLabel: "FAQ",
    ctaFinalBtn: "비즈니스 문의하기 →",
  },
  en: {
    breadcrumbBusiness: "Business",
    aboutLabel: "OVERVIEW",
    offerLabel: "SCOPE",
    fitLabel: "FIT",
    processLabel: "PROCESS",
    faqLabel: "FAQ",
    ctaFinalBtn: "Business inquiry →",
  },
  ja: {
    breadcrumbBusiness: "ビジネス",
    aboutLabel: "概要",
    offerLabel: "範囲",
    fitLabel: "おすすめ",
    processLabel: "進め方",
    faqLabel: "FAQ",
  },
  es: {
    breadcrumbBusiness: "Business",
    aboutLabel: "RESUMEN",
    offerLabel: "ALCANCE",
    fitLabel: "ENCAJE",
    processLabel: "PROCESO",
  },
  "pt-br": {
    breadcrumbBusiness: "Business",
    aboutLabel: "VISÃO GERAL",
    offerLabel: "ESCOPO",
    fitLabel: "ENCAIXE",
    processLabel: "PROCESSO",
  },
  fr: {
    breadcrumbBusiness: "Business",
    aboutLabel: "APERÇU",
    offerLabel: "PÉRIMÈTRE",
    fitLabel: "ADÉQUATION",
    processLabel: "PROCESSUS",
  },
  de: {
    breadcrumbBusiness: "Business",
    aboutLabel: "ÜBERBLICK",
    offerLabel: "UMFANG",
    fitLabel: "PASSUNG",
    processLabel: "ABLAUF",
  },
  hi: {
    breadcrumbBusiness: "बिज़नेस",
    aboutLabel: "अवलोकन",
    offerLabel: "दायरा",
    fitLabel: "उपयुक्त",
    processLabel: "प्रक्रिया",
  },
  id: {
    breadcrumbBusiness: "Bisnis",
    aboutLabel: "IKHTISAR",
    offerLabel: "CAKUPAN",
    fitLabel: "COCOK",
    processLabel: "PROSES",
  },
};

const GLANCE_KO = {
  glanceLabel: "개요",
  glanceSnapshotEyebrow: "✨ 제품 요약",
  glanceBestForLabel: "🎯 이런 분께",
  glanceCoreLabel: "⚡ 핵심 경험",
  glancePlatformLabel: "📱 플랫폼",
  glanceLangLabel: "🌐 언어",
  glanceAvailLabel: "🌍 이용 가능",
  glanceFamilyLabel: "👨‍👩‍👧 가족",
  glanceTravelLabel: "✈️ 여행",
  glanceMembershipLabel: "🎫 멤버십",
  privacyLabel: "개인정보 · 권한",
  before: "이전",
  after: "이후",
};

const EN_GLANCE = new Set([
  "OVERVIEW",
  "✨ PRODUCT SNAPSHOT",
  "🎯 BEST FOR",
  "⚡ CORE EXPERIENCE",
  "📱 PLATFORM",
  "🌐 LANGUAGES",
  "🌍 AVAILABLE IN",
  "👨‍👩‍👧 FAMILY",
  "✈️ TRAVEL",
  "🎫 MEMBERSHIP",
  "PRIVACY & CONTROL",
  "BEFORE",
  "AFTER",
]);

function patchGlanceKo(obj) {
  let n = 0;
  if (Array.isArray(obj)) {
    for (const item of obj) n += patchGlanceKo(item);
    return n;
  }
  if (!obj || typeof obj !== "object") return 0;
  for (const [k, v] of Object.entries(obj)) {
    if (k in GLANCE_KO && typeof v === "string" && EN_GLANCE.has(v)) {
      obj[k] = GLANCE_KO[k];
      n += 1;
    } else {
      n += patchGlanceKo(v);
    }
  }
  return n;
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

for (const lang of Object.keys(NAV)) {
  const file = path.join(LOCALES, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  data.nav = { ...(data.nav || {}), ...NAV[lang] };
  data.common = { ...(data.common || {}), scroll: SCROLL[lang] };
  data.ideas = { ...(data.ideas || {}), ...IDEAS_NAV[lang] };
  data.business = { ...(data.business || {}), ...BIZ_NAV[lang] };
  data.about = { ...(data.about || {}), ...ABOUT_HUB[lang] };

  if (lang === "ko") {
    data.home = {
      ...(data.home || {}),
      btnExploreNewonAria: "포트폴리오, 뉴스, 아이디어, 비즈니스 살펴보기",
    };
    if (data.business?.ok) {
      Object.assign(data.business.ok, {
        explorePortfolioTitle: "포트폴리오",
        explorePortfolioGo: "포트폴리오 →",
        exploreBusinessTitle: "비즈니스",
        ctaPortfolio: "포트폴리오 둘러보기 →",
        emptyTitle: "비즈니스 문의",
      });
    }
  }

  data.businessPages = data.businessPages || {};
  data.businessPages.common = {
    ...(data.businessPages.common || {}),
    ...BIZ_PAGES_COMMON[lang],
  };
  // Mirror common aboutLabel onto each detail page if present
  for (const slug of ["partnership", "promotion", "service", "development"]) {
    if (data.businessPages[slug] && typeof data.businessPages[slug] === "object") {
      if (BIZ_PAGES_COMMON[lang].aboutLabel) {
        data.businessPages[slug].aboutLabel = BIZ_PAGES_COMMON[lang].aboutLabel;
      }
    }
  }

  if (lang === "ko") {
    patchGlanceKo(data);
  }

  writeJson(file, data);
  console.log(`chrome i18n: ${lang}`);
}

const spKoPath = path.join(LOCALES, "_sp.ko.json");
if (fs.existsSync(spKoPath)) {
  const sp = JSON.parse(fs.readFileSync(spKoPath, "utf8"));
  for (const [k, v] of Object.entries(GLANCE_KO)) {
    if (Object.prototype.hasOwnProperty.call(sp, k)) sp[k] = v;
  }
  writeJson(spKoPath, sp);
  console.log("chrome i18n: _sp.ko");
}

console.log("apply-site-chrome-i18n: OK");
