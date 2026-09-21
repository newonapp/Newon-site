#!/usr/bin/env node
/**
 * Render /{lang}/lifestage/ detail pages for all locales.
 * Does not restyle the homepage Life Stage story row.
 */
import fs from "fs";
import path from "path";
import {
  ROOT,
  LANGS,
  OG_LOCALE,
  SITE_ORIGIN,
  loadJson,
  flatten,
  fillMissing,
  applyTemplate,
  hreflangBlock,
  writeRootRedirect,
  ensureDir,
  escapeHtml,
  pick,
  fontLinksHtml,
} from "./hub-utils.mjs";
import { clampSeoDescription } from "./seo-meta.mjs";
import { renderStudioHeader, renderStudioFooter } from "./site-chrome.mjs";
import { renderLifeStageSection } from "./home-lifestage-body.mjs";
import { getLifeStageCopy } from "./home-lifestage-copy.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const NLS_VER = "20260921nls20";

const SEO = {
  ko: {
    title: "Life Stage | Newon — 인생의 새로운 순간마다, 필요한 정보를 연결합니다.",
    description:
      "진로와 취업, 독립과 가족, 건강과 은퇴까지. 삶의 변화 앞에서 필요한 정보와 서비스를 연결하는 생애주기 플랫폼을 소개합니다. 개인별 분석·AI 상담·예약은 아직 이용할 수 없습니다.",
  },
  en: {
    title: "Life Stage | Newon — At each new moment in life, we connect the information you need.",
    description:
      "Career and work, independence and family, health and retirement. An introduction to the lifecycle platform Newon is building. Personal analysis, AI advice, and booking are not live yet.",
  },
  ja: {
    title: "Life Stage | Newon — 人生の新しい瞬間ごとに、必要な情報をつなぎます。",
    description:
      "進路と就職、独立と家族、健康と退職まで。人生の変化の前で必要な情報とサービスをつなぐライフサイクル・プラットフォームの紹介です。個別分析・AI相談・予約はまだ利用できません。",
  },
  es: {
    title: "Life Stage | Newon — En cada momento nuevo de la vida, conectamos la información que necesitas.",
    description:
      "Carrera y trabajo, independencia y familia, salud y jubilación. Presentación de la plataforma de ciclo de vida que Newon está construyendo. El análisis personal, el consejo de IA y las reservas aún no están en vivo.",
  },
  "pt-br": {
    title: "Life Stage | Newon — A cada momento novo da vida, conectamos a informação de que você precisa.",
    description:
      "Carreira e trabalho, independência e família, saúde e aposentadoria. Apresentação da plataforma de ciclo de vida que a Newon está construindo. Análise pessoal, conselho de IA e reservas ainda não estão no ar.",
  },
  fr: {
    title: "Life Stage | Newon — À chaque nouveau moment de la vie, nous relions l’information dont vous avez besoin.",
    description:
      "Parcours et travail, indépendance et famille, santé et retraite. Présentation de la plateforme de cycle de vie que Newon construit. Analyse personnelle, conseil IA et réservations ne sont pas encore en ligne.",
  },
  de: {
    title: "Life Stage | Newon — In jedem neuen Lebensmoment verbinden wir die Information, die Sie brauchen.",
    description:
      "Beruf und Arbeit, Selbstständigkeit und Familie, Gesundheit und Ruhestand. Vorstellung der Lebensphasen-Plattform, die Newon aufbaut. Persönliche Analyse, KI-Beratung und Buchung sind noch nicht live.",
  },
  hi: {
    title: "Life Stage | Newon — जीवन के हर नए पल में, जरूरी जानकारी जोड़ते हैं।",
    description:
      "करियर और काम, स्वतंत्रता और परिवार, स्वास्थ्य और सेवानिवृत्ति। Newon जिस जीवन-चक्र मंच को बना रहा है, उसका परिचय। व्यक्तिगत विश्लेषण, AI सलाह और बुकिंग अभी लाइव नहीं हैं।",
  },
  id: {
    title: "Life Stage | Newon — Di setiap momen baru kehidupan, kami menghubungkan informasi yang Anda butuhkan.",
    description:
      "Karier dan kerja, kemandirian dan keluarga, kesehatan dan pensiun. Pengenalan platform siklus hidup yang sedang dibangun Newon. Analisis pribadi, saran AI, dan pemesanan belum live.",
  },
};

function localeFlat(lang) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en) };
}

function seoFor(dir) {
  return SEO[dir] || SEO.en;
}

function renderPage(lang) {
  const { flat, flatEn } = localeFlat(lang);
  const seo = seoFor(lang.dir);
  const copy = getLifeStageCopy(lang.dir);
  const header = renderStudioHeader(flat, flatEn, { activeNav: "lifestage", base: "../" });
  const footer = renderStudioFooter(flat, flatEn, { base: "../" });
  const canonical = `${SITE_ORIGIN}/${lang.dir}/lifestage/`;
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    LANG_DIR: lang.dir,
    FONT_LINKS: fontLinksHtml(lang.dir),
    TITLE: escapeHtml(seo.title),
    META_DESCRIPTION: escapeHtml(clampSeoDescription(seo.description)),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock("lifestage"),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: renderLifeStageSection(lang.dir, { detail: true }),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=${NLS_VER}" />`,
    EXTRA_SCRIPTS: `<script src="/home-lifestage.js?v=${NLS_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, "lifestage", "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  const ages = copy.ages.items.map((a) => a.id).join(",");
  console.log("render-lifestage:", lang.dir, "ages", ages, "sits", copy.sits.items.length, "fields", copy.knowledge.fields.length);
}

function patchHomeNav() {
  for (const lang of LANGS) {
    const file = path.join(ROOT, lang.dir, "index.html");
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, "utf8");
    const from = new RegExp(`href="/${lang.dir}/#story-lifestage"`, "g");
    const to = `href="/${lang.dir}/lifestage/"`;
    html = html.replace(from, to);
    fs.writeFileSync(file, html);
  }
  const root = path.join(ROOT, "index.html");
  if (fs.existsSync(root)) {
    let html = fs.readFileSync(root, "utf8");
    html = html.replace(/href="\/ko\/#story-lifestage"/g, 'href="/ko/lifestage/"');
    fs.writeFileSync(root, html);
  }
}

writeRootRedirect("lifestage");
for (const lang of LANGS) renderPage(lang);
patchHomeNav();
console.log("render-lifestage: OK", getLifeStageCopy("ko").hero.ctaMain);
