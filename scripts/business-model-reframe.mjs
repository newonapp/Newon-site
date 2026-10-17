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
    [/반복되는 일을 시스템에게 맡기세요\./g, "반복되는 일을 시스템으로 바꿉니다."],
    [/필요한 국가, 언어와 Localization 범위에 따라 프로젝트를 구성할 수 있습니다\./g, "필요한 국가, 언어와 Localization 범위에 따라 협업 범위를 구성할 수 있습니다."],
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
    [/Talk automation →/g, "Partnership inquiry →"],
    [/Start turning your idea into a product\./g, "Partnerships start with an inquiry."],
    [/Let(?:'|’)s shape how your brand and product show up in the world\./g, "Brand and product design, shaped together with partners."],
    [/We(?:'|’)ll confirm what to (research|compare) and how to structure the output\./g, "What to $1 and how to structure the output is agreed in discussion."],
    [/We combine the inputs your project needs\./g, "Inputs are combined as the collaboration requires."],
    [/We first check whether your existing tools can stay connected through APIs or webhooks\./g, "Existing tools can often stay connected through APIs or webhooks."],
    [/We analyze your current structure and tools, then define what can be improved\./g, "Current structure and tools are reviewed first, then improvements are defined."],
    [/We review source, environment, and access, then say whether we can take it\./g, "Source, environment, and access are reviewed before deciding whether it can be taken on."],
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


/* ---------------------------------------------------------------------------------------------
 * P5: hub offer wording (A/B pages). Language-neutral structural edits + ko/en text edits.
 * Nothing here names a product, price, deliverable or service that is not already on the page.
 * ------------------------------------------------------------------------------------------- */
const TAGLINE_REWRITE = {
  ko: [
    [/아이디어를 실제 제품으로(<br \/>|\n| )만듭니다\./g, "웹·앱 제품을$1기획하고 구현하는 역량."],
    [/정해진 서비스에(<br \/>|\n| )맞추지 않습니다\./g, "협업 주제를$1함께 검토합니다."],
  ],
  en: [
    [/We turn ideas into(<br \/>|\n| )real products\./g, "How Newon plans and$1builds products."],
    [/We don[’']t force your project(<br \/>|\n| )into a package\./g, "Collaboration topics$1we review with partners."],
  ],
};
const DETAIL_LABEL_REWRITE = {
  ko: [[/<dt>무엇을 만드나요<\/dt>/g, "<dt>역량 범위</dt>"]],
  en: [[/<dt>What we build<\/dt>/g, "<dt>Capability</dt>"]],
};
/** Hero lead of the two hubs whose lead reads as a sales pitch. Other locales: lead removed (the localized notice sits above). */
const HUB_LEAD = {
  "business/build": {
    ko: "Newon의 웹·앱 제품 기획·디자인·구현 역량을 소개합니다. 개별 제작 의뢰는 받지 않습니다.",
    en: "An overview of Newon's capabilities in planning, designing and building web and app products. Newon does not accept individual production commissions.",
  },
  "business/solutions": {
    ko: "Newon이 파트너와 함께 검토하는 협업 주제를 정리한 안내 페이지입니다. 개별 제작 의뢰는 받지 않습니다.",
    en: "A guide to the collaboration topics Newon reviews with partners. Newon does not accept individual production commissions.",
  },
};
const CTA_BLOCK = {
  ko: { label: "PARTNERSHIP", title: "협업을 제안하고 싶다면 문의해 주세요.", lead: "협업 가능 여부는 제휴·도입 문의를 통해 검토합니다. 개별 제작 의뢰는 받지 않습니다.", btn: "제휴·도입 문의하기 →" },
  en: { label: "PARTNERSHIP", title: "Interested in working together?", lead: "Collaboration is reviewed through partnership and adoption inquiries. Newon does not accept individual production commissions.", btn: "Partnership inquiry →" },
};
const HUB_PRIMARY_CTA = { ko: "제휴·도입 문의하기 →", en: "Partnership inquiry →" };

/** Keep only the first row ("capability") of each service card; "who it's for / included / deliverables / timeline" rows read as a service spec. */
function keepFirstDetailRow(html) {
  return html.replace(/(<dl class="bp-explore__detail">)([\s\S]*?)(<\/dl>)/g, (all, a, inner, c) => {
    const rows = inner.match(/<div>[\s\S]*?<\/div>/g);
    return rows && rows.length > 1 ? `${a}\n        ${rows[0]}\n        ${c}` : all;
  });
}

function rewriteCtaBlock(html, lang) {
  const t = CTA_BLOCK[lang === "ko" ? "ko" : "en"];
  const hint = lang !== "ko" && lang !== "en" ? ' lang="en"' : "";
  return html.replace(/<section class="bp-cta"[\s\S]*?<\/section>/, (block) => {
    // keep the original button tag (href, data-analytics) and replace only its label
    const btn = /<a class="bp-btn bp-btn--primary"([^>]*)>[^<]*<\/a>/.exec(block);
    if (!btn) return block;
    return `<section class="bp-cta" data-bp-reveal>\n  <div class="bp-inner bp-cta__inner">\n    <p class="bp-label"${hint}>${t.label}</p>\n    <h2 class="bp-cta__title"${hint}>${t.title}</h2>\n    <p class="bp-cta__lead"${hint}>${t.lead}</p>\n    <a class="bp-btn bp-btn--primary"${btn[1]}${hint}>${t.btn}</a>\n  </div>\n</section>`;
  });
}

function cleanHubOffer(html, lang, key) {
  let out = keepFirstDetailRow(html);
  const l = lang === "ko" ? "ko" : lang === "en" ? "en" : null;
  if (l) {
    for (const [re, rep] of TAGLINE_REWRITE[l]) out = out.replace(re, rep);
    for (const [re, rep] of DETAIL_LABEL_REWRITE[l]) out = out.replace(re, rep);
  }
  out = rewriteCtaBlock(out, lang);
  if (HUB_LEAD[key]) {
    const lead = HUB_LEAD[key][l];
    out = out.replace(/<p class="bp-hero__lead">[\s\S]*?<\/p>\s*/, lead ? `<p class="bp-hero__lead">${lead}</p>\n      ` : "");
    // Hub primary CTA in the hero and in each card
    // (other locales: English label with lang="en", same precedent as EN_CTA / the inquiry hero CTA)
    out = out.replace(/<a class="bp-btn bp-btn--(primary|ghost)"([^>]*data-analytics="business_pillar_cta"[^>]*)>([^<]*)<\/a>/g, (all, kind, attrs, label) => {
      if (kind !== "primary") return all;
      const text = HUB_PRIMARY_CTA[l || "en"];
      return `<a class="bp-btn bp-btn--primary"${attrs}${l ? "" : ' lang="en"'}>${text}</a>`;
    });
    // Client-targeting sections: "when to use", FAQ about hiring/maintenance
    out = removeByClass(out, "section", "bp-when");
    out = removeByClass(out, "section", "bp-faq");
  }
  return out;
}


/** meta / og / twitter / Service JSON-LD description of the two hubs: the localized "capability" notice text. */
function hubMeta(html, lang) {
  const plain = String(NOTICE.cap[NOTICE.cap[lang] ? lang : "en"]).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
  const attr = plain.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  let out = html.replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*(")/g, `$1${attr}$2`);
  out = out.replace(/("@type":\s*"Service"[\s\S]*?"description":\s*)"(?:[^"\\]|\\.)*"/, (m, a) => `${a}${JSON.stringify(plain)}`);
  return out;
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
  if (meta && (meta[0] === "B" || meta[0] === "A")) out = cleanHubOffer(cleanBType(out, lang), lang, key);
  if (meta && HUB_LEAD[key]) out = hubMeta(out, lang);
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
