/**
 * Reframes Business / Studio pages to the confirmed model (own products + partnerships, no per-client outsourcing).
 * Idempotent: inserts one .bm-notice per page (by classification) and rewrites a few hub sentences (ko/en).
 * Other languages get the English notice (lang="en") — flagged "translation not reviewed" in the report.
 * Never touches hrefs, forms or JSON data.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, NOTICE, pageKey } from "./business-model-pages.mjs";
import { removeByClass, dropEmptyElements, txt } from "./business-model-sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const LABEL = { ko: "안내", en: "Notice", ja: "お知らせ", es: "Aviso", "pt-br": "Aviso", fr: "Information", de: "Hinweis", hi: "सूचना", id: "Pemberitahuan" };
/** Notice text in the 7 non-ko/en locales was localized without native-speaker review. */
const NATIVE_REVIEWED = new Set(["ko", "en"]);

/** English CTA labels (en pages and the other 7 locales that reuse the English text). */
const EN_CTA = [
  [/\bWebsite project inquiry\b/g, "Website partnership inquiry"],
  [/\bCreative project inquiry\b/g, "Creative partnership inquiry"],
  [/\bProject inquiry\b/g, "Partnership inquiry"],
  [/\bproject inquiry\b/g, "partnership inquiry"],
  [/\bStart a project\b/g, "Partnership inquiry"],
];

const HUB_REWRITE = {
  ko: [
    [/필요한 디지털 제품·시스템과 SaaS·자동화를 구축합니다\./g, "디지털 제품·시스템과 SaaS·자동화에 대한 Newon의 구현 역량을 소개합니다."],
    [/브랜드의 시작부터 웹사이트와 앱 제작까지, 아이디어를 실제 디지털 제품으로 구현합니다\./g, "브랜드·웹·앱 디자인 역량을 바탕으로 Newon의 디지털 제품을 만들고, 브랜드·기업과의 제휴·협업을 검토합니다."],
    [/브랜드의 시작부터 웹·앱 경험 설계까지, 아이디어를 실제 디지털 제품으로 구현합니다\. 포트폴리오, 가격 안내, 프로젝트 문의가 가능합니다\./g, "브랜드·웹·앱 경험 설계 역량을 바탕으로 Newon의 디지털 제품을 만들고, 제휴·협업 문의를 받습니다."],
    [/프로젝트 문의/g, "제휴·협업 문의"],
    [/웹·앱·디지털 제품 제작/g, "웹·앱·디지털 제품 구현 역량"],
    [/기업 맞춤형 소프트웨어·SaaS/g, "소프트웨어·SaaS 구현 역량"],
    [/기존 기술을 활용한 맞춤형 제품/g, "기존 기술을 활용한 제품 구성"],
    [/목적·일정·예산 감을 남겨 주세요\./g, "협업 목적과 희망 일정을 남겨 주세요."],
  ],
  ja: [[/見積もりを依頼/g, "お問い合わせ"]],
  de: [[/vor dem Senden eines Angebots/g, "vor dem Senden"]],
  en: [
    [/Build the digital products, systems, SaaS and automation you need\./g, "Newon's capabilities in digital products, systems, SaaS and automation."],
  ],
};

/**
 * B-type (capability) pages: remove wording that reads as "send us your project and we build/deliver it for you".
 * Only neutral rewordings and removals — nothing here names a product, price or service that is not already on the page.
 * Remaining service-vendor phrasing is listed in docs/web-closure/PHASE03-P4-B-TYPE-AUDIT.md for an owner decision.
 */
const B_REWRITE = {
  ko: [
    [/계약된 프로젝트 범위/g, "협의된 협업 범위"],
    [/계약 전에/g, "협의 단계에서"],
    [/프로젝트 완료 후 제공되는 것/g, "제공되는 산출물 예시"],
    [/프로젝트 범위/g, "협업 범위"],
  ],
  en: [
    [/What you receive when the project completes/g, "Typical outputs"],
    [/We deliver the items below as needed for your scope\./g, "The items below are provided as needed for the agreed scope."],
    [/\bproject scope\b/g, "collaboration scope"],
    [/\bProject scope\b/g, "Collaboration scope"],
    [/\bbefore contract\b/g, "during discussion"],
    [/Services & pricing/g, "Services"],
    [/Project consultation →/g, "Partnership inquiry →"],
    [/START A PROJECT/g, "GET IN TOUCH"],
    [/We don[’']t force your project into a package\./g, "We don’t force every collaboration into a package."],
  ],
};
/** Sentences / list items that describe a client-implementation engagement. Removed whole. */
const B_DROP = {
  ko: [/반복 업무를 분석하고, 고객사의 기존 도구·시스템·업무 흐름에 AI를 적용하는 구축 프로젝트입니다\.\s*/g, /운영 중인 웹·앱을 계속 맡기고 싶은 팀\./g],
  en: [/A client project that applies AI to[^.]*\.\s*/g, /Not a demo chatbot, and not the Newon AI product itself: this is a client implementation project\.\s*/g],
};
/** FAQ entries that ask whether Newon can be hired / handed work. */
const B_FAQ_DROP = {
  ko: /맡길 수 있나요|맡기고 싶|디자인만 또는 구현만|개발도 함께/,
  en: /\bhire\b|hand (?:it|development|work) (?:off|over)/i,
};

function cleanBType(html, lang) {
  let out = html;
  const l = lang === "ko" ? "ko" : "en";
  for (const [re, rep] of B_REWRITE[l]) out = out.replace(re, rep);
  for (const re of B_DROP[l]) out = out.replace(re, "");
  out = removeByClass(out, "div", "bs-faq-item", (b) => B_FAQ_DROP[l].test(txt(b)));
  out = removeByClass(out, "div", "bp-faq__item", (b) => B_FAQ_DROP[l].test(txt(b)));
  return dropEmptyElements(out);
}

function noticeHtml(kind, lang) {
  const n = NOTICE[kind];
  const useLang = n[lang] ? lang : "en";
  const label = LABEL[useLang] || LABEL.en;
  return `<aside class="bm-notice bm-notice--${kind}" role="note" data-bm-notice="${kind}"${useLang !== lang ? ' lang="en" data-bm-untranslated="1"' : ""}${useLang === lang && !NATIVE_REVIEWED.has(lang) ? ' data-bm-l10n="draft"' : ""}><strong class="bm-notice__label">${label}</strong><p>${n[useLang]}</p></aside>`;
}

export function reframeHtml(html, lang, key) {
  const meta = PAGES[key];
  let out = html;
  for (const [re, rep] of HUB_REWRITE[lang] || []) out = out.replace(re, rep);
  if (lang !== "ko") for (const [re, rep] of EN_CTA) out = out.replace(re, rep);
  // Inquiry-page hero CTA: align with the generator's current label (committed pages were stale).
  out = out.replace(/(href="#inquiry">)(?:프로젝트 문의하기|Start a project)/g, `$1${lang === "ko" ? "제휴·도입 문의하기" : "Partnership inquiry"}`);
  out = out.replace(/\n*<aside class="bm-notice[\s\S]*?<\/aside>/g, "");
  if (meta && (meta[0] === "B" || meta[0] === "A")) out = cleanBType(out, lang);
  if (meta && meta[2] !== "none") {
    const re = /(<main\b[^>]*>)/;
    if (re.test(out)) out = out.replace(re, `$1\n${noticeHtml(meta[2], lang)}`);
  }
  if (!/business-model-notice\.css/.test(out) && /<aside class="bm-notice/.test(out)) {
    out = out.replace(/<\/head>/, `<link rel="stylesheet" href="/business-model-notice.css?v=1" />\n</head>`);
  }
  return out;
}

export function reframeAll(root = ROOT) {
  let n = 0;
  for (const lang of LANGS) {
    for (const key of Object.keys(PAGES)) {
      const f = path.join(root, lang, key, "index.html");
      if (!fs.existsSync(f)) continue;
      const before = fs.readFileSync(f, "utf8");
      if (/http-equiv="refresh"/i.test(before) && !/<main\b/.test(before)) continue;
      const after = reframeHtml(before, lang, key);
      if (after !== before) { fs.writeFileSync(f, after); n++; }
    }
  }
  return n;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`business-model-reframe: updated ${reframeAll(process.argv[2] || ROOT)} files`);
}
