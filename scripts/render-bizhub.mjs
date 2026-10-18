#!/usr/bin/env node
/**
 * Business Hub — information-only pages (9 locales; ko + en copy, other locales reuse en):
 *   /{lang}/business-hub/            landing: Business (solutions for companies & sellers) + Studio (own digital products & brand partnerships)
 *   /{lang}/business/seller-center/  seller guidance + partnership info (no seller accounts, listings, trading or payment on the web)
 *   /{lang}/business/partners/       business / seller / institution partnership info
 * Existing Business and Studio pages and URLs are untouched. No forms, sign-in or service controls.
 */
import fs from "fs";
import path from "path";
import {
  LANGS, OG_LOCALE, SITE_ORIGIN, ROOT, escapeHtml, fontLinksHtml, hreflangBlock, loadJson, flatten, writeRootRedirect,
} from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { PARTNER_INQUIRY_PATH, copyLang } from "./six-businesses.mjs";

const esc = escapeHtml;
const pad2 = (n) => String(n).padStart(2, "0");
const CSS_VER = "20261017bi1";

/** page id → path under /{lang}/ */
export const BIZHUB_PAGES = {
  hub: "business-hub",
  seller: "business/seller-center",
  partners: "business/partners",
};

const COMMON = {
  ko: {
    home: "Newon", hub: "Business Hub",
    infoTitle: "이 웹사이트는 소개와 안내만 제공합니다",
    infoBody: "로그인, 서비스 이용, 예약, 거래, 결제, 판매자 관리 같은 실제 기능은 웹사이트에서 제공하지 않습니다. 앱 이용 안내, 제휴, 문의만 안내합니다.",
    contactLabel: "문의", contactTitle: "제휴·도입 문의를 받습니다",
    contactLead: "기업·판매자·기관과의 제휴, 도입, 협업 문의는 아래 문의 페이지로 보내 주세요. 조건은 문의 후 개별 협의합니다.",
    contactBtn: "제휴·도입 문의하기",
  },
  en: {
    home: "Newon", hub: "Business Hub",
    infoTitle: "This website is for information only",
    infoBody: "Service features such as sign-in, using services, booking, trading, payment and seller management are not provided on the website. It only offers app guidance, partnership info and inquiries.",
    contactLabel: "CONTACT", contactTitle: "Partnership and adoption inquiries are welcome",
    contactLead: "Send partnership, adoption and collaboration inquiries from businesses, sellers and institutions through the contact page. Terms are agreed individually after an inquiry.",
    contactBtn: "Send an inquiry",
  },
};

// Card = [title, lead, href]; hrefs are relative to the language root (/xx/)
const COPY = {
  ko: {
    hub: {
      title: "Business Hub | Newon — 기업·판매자 솔루션과 자체 디지털 상품",
      desc: "Newon Business Hub. 기업·판매자 자동화 및 솔루션(Business)과 자체 디지털 상품·브랜드 파트너십(Studio)을 소개합니다. 이 웹사이트는 소개, 앱 이용 안내, 제휴·문의만 제공합니다.",
      h1: "기업과 판매자를 위한 솔루션,<br />함께 만드는 디지털 상품.",
      lead: "Business Hub는 Newon의 Business와 Studio를 한곳에서 안내합니다. 두 영역은 각각 그대로 유지되며, 필요한 곳으로 바로 이동할 수 있습니다.",
      areas: [
        {
          id: "business", label: "BUSINESS", title: "기업·판매자 자동화 및 솔루션",
          lead: "반복 업무를 줄이는 자동화, 판매자를 위한 안내, 기업 맞춤형 AI, 제휴를 소개합니다.",
          open: ["Business 전체 보기 →", "business/"],
          cards: [
            ["Automation", "반복 업무를 시스템으로 — 자동화 솔루션", "business/automation/"],
            ["Seller Center", "판매자를 위한 안내와 제휴", "business/seller-center/"],
            ["Business Tools", "설치 없이 쓰는 무료 웹 도구", "tools/"],
            ["Enterprise", "기업 맞춤형 AI와 업무 자동화", "ai/enterprise/"],
            ["Insights", "제품·소비자·시장 관찰", "resources/insights/"],
            ["Partners", "기업·판매자·기관 제휴 안내", "business/partners/"],
          ],
        },
        {
          id: "studio", label: "STUDIO", title: "자체 디지털 상품·브랜드 파트너십",
          lead: "Newon이 직접 만들고 운영하는 디지털 상품, 그리고 브랜드와 오래 함께하는 파트너십을 소개합니다.",
          open: ["Studio 전체 보기 →", "studio/"],
          cards: [
            ["Partnerships", "브랜드·기업과 장기적으로 함께합니다", "studio/partnerships/"],
            ["Digital Products", "웹·앱 화면과 디지털 상품을 설계합니다", "studio/digital/"],
            ["Projects", "Newon이 직접 만들고 운영하는 제품", "studio/projects/"],
            ["Contact", "프로젝트·파트너십 문의", "studio/contact/"],
          ],
        },
      ],
    },
    seller: {
      title: "Seller Center | Newon Business — 판매자 안내와 제휴",
      desc: "Newon Seller Center. Newon 앱 생태계에서 상품과 서비스를 소개하려는 판매자·사업자를 위한 안내와 제휴 문의 페이지입니다. 웹에서는 판매자 계정, 상품 등록, 거래, 결제를 제공하지 않습니다.",
      h1: "판매자를 위한<br />안내와 제휴.",
      lead: "Newon 앱 생태계에서 상품과 서비스를 소개하려는 판매자·사업자를 위한 안내 페이지입니다.",
      sections: [
        { id: "intro", label: "소개", lead: "Newon은 육아, 반려, 여행, 생활, 시니어 돌봄 같은 일상의 앱을 만듭니다. 이 앱들과 어울리는 상품과 서비스를 가진 판매자와 함께할 방법을 안내합니다.", cards: [
          ["제휴 중심", "판매자 등록 절차가 아니라 제휴 문의로 시작합니다. 범위와 방식은 문의 후 협의합니다."],
          ["앱에서 소개", "소개와 이용은 각 앱의 방식에 맞춰 협의합니다. 웹사이트는 안내만 제공합니다."],
          ["개별 협의", "수수료·가격·조건은 확정된 것이 없으며, 문의 후 개별 협의합니다."],
        ] },
        { id: "audience", label: "이런 분께", lead: "", cards: [
          ["개인·소상공인 판매자", "상품이나 서비스를 앱 이용자에게 소개하고 싶은 분."],
          ["브랜드·사업자", "육아·반려·생활·시니어 분야에서 협업하고 싶은 브랜드와 사업자."],
          ["서비스 제공자", "돌봄, 생활 서비스처럼 이용자에게 도움이 되는 서비스를 운영하는 사업자."],
        ] },
        { id: "apps", label: "관련 앱", lead: "각 앱 소개 페이지의 제휴 안내에서 분야별 협력 방식을 볼 수 있습니다.", link: true, cards: [
          ["BabyLog", "육아용품·육아 서비스 협업", "babylog/#partners"],
          ["PetLog", "반려 용품·서비스 협업", "petlog/#partners"],
          ["ShareOn", "물품·공간·서비스 나눔 (출시 준비 중)", "shareon/#partners"],
          ["LivOn", "생애 단계별 정보·서비스 협업", "lifestage/#bi-partners"],
          ["Ongil", "시니어 생활·돌봄 서비스 협업", "ongil/#bi-partners"],
        ] },
      ],
      notice: "현재 웹사이트에서는 판매자 계정, 상품 등록, 거래, 결제, 정산을 제공하지 않습니다.",
    },
    partners: {
      title: "Partners | Newon Business — 기업·판매자·기관 제휴 안내",
      desc: "Newon Partners. 기업, 판매자, 공공·지역 기관과의 제휴 유형과 진행 흐름을 안내합니다. 제휴 범위와 조건은 문의 후 개별 협의합니다.",
      h1: "함께 만드는<br />제휴.",
      lead: "Newon은 기업·판매자·기관과 각 사업에 맞는 방식으로 협력합니다. 제휴 유형과 진행 흐름을 안내합니다.",
      sections: [
        { id: "types", label: "제휴 유형", lead: "", cards: [
          ["기업", "자동화·AI 도입, 서비스 연계, 공동 사업을 함께 검토하는 기업."],
          ["판매자·사업자", "상품과 서비스를 Newon 앱 생태계에 소개하려는 판매자·브랜드."],
          ["공공·지역 기관", "육아, 생활, 시니어 지원 정보를 함께 안내할 기관."],
        ] },
        { id: "flow", label: "진행 흐름", lead: "", cards: [
          ["문의", "아래 문의 페이지로 제휴 내용을 보내 주세요."],
          ["검토", "목표와 현재 상황을 확인합니다."],
          ["협의", "협력 범위와 방식, 조건을 개별 협의합니다."],
        ] },
        { id: "areas", label: "사업별 제휴 안내", lead: "사업별 협력 방식은 각 소개 페이지에서 볼 수 있습니다.", cards: [
          ["BabyLog", "육아 생태계 제휴", "babylog/#partners"],
          ["PetLog", "반려 생태계 제휴", "petlog/#partners"],
          ["My World", "여행·장소 제휴", "myworld/#partners"],
          ["ShareOn", "나눔 생태계 제휴 (출시 준비 중)", "shareon/#partners"],
          ["LivOn", "생애 단계 정보·서비스 제휴", "lifestage/#bi-partners"],
          ["Ongil", "시니어 생활·돌봄 제휴", "ongil/#bi-partners"],
        ] },
      ],
      notice: "확정되지 않은 기업·기관명이나 로고는 게시하지 않습니다. 제휴 범위와 조건은 문의 후 개별 협의합니다.",
    },
  },
  en: {
    hub: {
      title: "Business Hub | Newon — Business solutions and our own digital products",
      desc: "Newon Business Hub. Automation and solutions for businesses and sellers (Business) and our own digital products and brand partnerships (Studio). This website only provides information, app guidance, partnerships and inquiries.",
      h1: "Solutions for businesses and sellers,<br />digital products built together.",
      lead: "Business Hub brings Newon’s Business and Studio together in one place. Both areas stay as they are, and you can go straight to what you need.",
      areas: [
        {
          id: "business", label: "BUSINESS", title: "Automation and solutions for businesses and sellers",
          lead: "Automation that reduces repetitive work, guidance for sellers, custom AI for companies, and partnerships.",
          open: ["View all of Business →", "business/"],
          cards: [
            ["Automation", "Turn repetitive work into systems", "business/automation/"],
            ["Seller Center", "Guidance and partnerships for sellers", "business/seller-center/"],
            ["Business Tools", "Free web tools that need no install", "tools/"],
            ["Enterprise", "Custom AI and work automation for companies", "ai/enterprise/"],
            ["Insights", "Product, consumer and market observations", "resources/insights/"],
            ["Partners", "Partnerships with businesses, sellers and institutions", "business/partners/"],
          ],
        },
        {
          id: "studio", label: "STUDIO", title: "Our own digital products and brand partnerships",
          lead: "The digital products Newon builds and runs itself, and long-term partnerships with brands.",
          open: ["View all of Studio →", "studio/"],
          cards: [
            ["Partnerships", "Long-term design partnerships with brands", "studio/partnerships/"],
            ["Digital Products", "Web and app design, plus digital goods", "studio/digital/"],
            ["Projects", "Products Newon builds and runs", "studio/projects/"],
            ["Contact", "Project and partnership inquiries", "studio/contact/"],
          ],
        },
      ],
    },
    seller: {
      title: "Seller Center | Newon Business — Seller guidance and partnerships",
      desc: "Newon Seller Center. Guidance and partnership inquiries for sellers and businesses that want to introduce products and services in the Newon app ecosystem. The web does not provide seller accounts, listings, trading or payment.",
      h1: "Guidance and partnerships<br />for sellers.",
      lead: "A guide for sellers and businesses that want to introduce products and services in the Newon app ecosystem.",
      sections: [
        { id: "intro", label: "Overview", lead: "Newon builds everyday apps for parenting, pets, travel, daily life and senior care. This page explains how sellers with fitting products and services can work with us.", cards: [
          ["Partnership first", "It starts with a partnership inquiry, not a seller sign-up. Scope and approach are agreed after the inquiry."],
          ["Introduced in the apps", "How things are introduced and used is agreed per app. The website only provides guidance."],
          ["Agreed individually", "Fees, prices and terms are not fixed; they are discussed individually after an inquiry."],
        ] },
        { id: "audience", label: "Who it is for", lead: "", cards: [
          ["Individual and small sellers", "Sellers who want to introduce products or services to app users."],
          ["Brands and businesses", "Brands and businesses that want to collaborate in parenting, pets, daily life and seniors."],
          ["Service providers", "Businesses that run helpful services such as care and living services."],
        ] },
        { id: "apps", label: "Related apps", lead: "Each app page has a partnership section describing how we work in that field.", link: true, cards: [
          ["BabyLog", "Parenting products and services", "babylog/#partners"],
          ["PetLog", "Pet products and services", "petlog/#partners"],
          ["ShareOn", "Sharing items, spaces and services (coming soon)", "shareon/#partners"],
          ["LivOn", "Life-stage information and services", "lifestage/#bi-partners"],
          ["Ongil", "Senior living and care services", "ongil/#bi-partners"],
        ] },
      ],
      notice: "The website does not currently provide seller accounts, product listing, trading, payment or settlement.",
    },
    partners: {
      title: "Partners | Newon Business — Partnerships with businesses, sellers and institutions",
      desc: "Newon Partners. Partnership types and process for businesses, sellers and public or local institutions. Scope and terms are agreed individually after an inquiry.",
      h1: "Partnerships<br />built together.",
      lead: "Newon works with businesses, sellers and institutions in the way that fits each business. Here are the partnership types and how it proceeds.",
      sections: [
        { id: "types", label: "Partnership types", lead: "", cards: [
          ["Businesses", "Companies that want to review automation, AI adoption, service links or joint ventures."],
          ["Sellers and operators", "Sellers and brands that want to introduce products and services in the Newon app ecosystem."],
          ["Public and local institutions", "Institutions that guide parenting, daily-life and senior-support information together."],
        ] },
        { id: "flow", label: "How it works", lead: "", cards: [
          ["Inquiry", "Send your partnership details through the contact page below."],
          ["Review", "We review your goals and context."],
          ["Discussion", "Scope, approach and terms are agreed individually."],
        ] },
        { id: "areas", label: "Partnerships by business", lead: "Each business page describes how we work with partners.", cards: [
          ["BabyLog", "Parenting ecosystem partnerships", "babylog/#partners"],
          ["PetLog", "Pet ecosystem partnerships", "petlog/#partners"],
          ["My World", "Travel and places partnerships", "myworld/#partners"],
          ["ShareOn", "Sharing ecosystem partnerships (coming soon)", "shareon/#partners"],
          ["LivOn", "Life-stage information and service partnerships", "lifestage/#bi-partners"],
          ["Ongil", "Senior living and care partnerships", "ongil/#bi-partners"],
        ] },
      ],
      notice: "We do not publish organization names or logos that are not confirmed. Scope and terms are agreed individually after an inquiry.",
    },
  },
};

const relPrefix = (depth) => "../".repeat(depth);

function linkCards(cards, depth) {
  const pre = relPrefix(depth);
  return `<nav class="bp-other__grid" role="list">${cards
    .map(
      ([t, d, h], i) => `<a class="bp-other__card" role="listitem" href="${esc(pre + h)}">
      <span class="bp-other__top"><span class="bp-other__n">${pad2(i + 1)}</span><span class="bp-other__arrow" aria-hidden="true">→</span></span>
      <span class="bp-other__t">${esc(t)}</span>
      <span class="bp-other__lead">${esc(d)}</span>
    </a>`
    )
    .join("")}</nav>`;
}

function plainCards(cards) {
  return `<ul class="bi-grid bi-grid--3">${cards
    .map(
      ([t, d], i) => `<li class="bi-card"><span class="bi-card__n" aria-hidden="true">${pad2(i + 1)}</span><h3 class="bi-card__t">${esc(t)}</h3><p class="bi-card__d">${esc(d)}</p></li>`
    )
    .join("")}</ul>`;
}

const sec = (id, label, lead, inner, cls = "bp-sec bi-sec") => `<section id="${id}" class="${cls}" aria-labelledby="${id}-label">
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label" id="${id}-label">${esc(label)}</p>${lead ? `\n      <p class="bp-lead">${esc(lead)}</p>` : ""}
    </header>
    ${inner}
  </div>
</section>`;

function infoBlock(C, notice) {
  return `<section class="bp-sec bi-sec" aria-labelledby="bh-info-label"><div class="bp-inner">
    <div class="bi-download" id="bh-info">
      <h2 class="bi-download__title" id="bh-info-label">${esc(C.infoTitle)}</h2>
      <p class="bi-download__body">${esc(C.infoBody)}</p>${notice ? `\n      <p class="bi-download__info">${esc(notice)}</p>` : ""}
    </div>
  </div></section>`;
}

function contactBlock(C, depth) {
  return `<section id="contact" class="bp-cta">
  <div class="bp-inner bp-cta__inner">
    <p class="bp-label">${esc(C.contactLabel)}</p>
    <h2 class="bp-cta__title">${esc(C.contactTitle)}</h2>
    <p class="bp-cta__lead">${esc(C.contactLead)}</p>
    <a class="bp-btn bp-btn--primary" href="${esc(relPrefix(depth) + PARTNER_INQUIRY_PATH)}" data-analytics="bizhub_contact">${esc(C.contactBtn)}</a>
  </div>
</section>`;
}

function crumb(C, depth, trail) {
  const pre = relPrefix(depth);
  const items = [`<li><a href="${pre}">${esc(C.home)}</a></li>`];
  if (trail.mid) items.push(`<li><a href="${pre}business-hub/">${esc(C.hub)}</a></li>`);
  items.push(`<li aria-current="page">${esc(trail.cur)}</li>`);
  return `<nav class="bp-crumb" aria-label="Breadcrumb"><div class="bp-inner"><ol class="bp-crumb__list">${items.join("")}</ol></div></nav>`;
}

function hero(P, eyebrow, anchors) {
  return `<section class="bp-hero" aria-labelledby="bp-hero-title">
  <div class="bp-inner bp-hero__grid">
    <div class="bp-hero__copy">
      <p class="bp-eyebrow">${esc(eyebrow)}</p>
      <h1 class="bp-hero__title" id="bp-hero-title">${P.h1}</h1>
      <p class="bp-hero__lead">${esc(P.lead)}</p>${anchors ? `\n      <div class="bp-hero__actions">${anchors}</div>` : ""}
    </div>
  </div>
</section>`;
}

function hubBody(cl) {
  const P = COPY[cl].hub, C = COMMON[cl], depth = 1;
  const anchors = P.areas
    .map((a, i) => `<a class="bp-btn ${i === 0 ? "bp-btn--primary" : "bp-btn--ghost"}" href="#${a.id}">${esc(a.label)}</a>`)
    .join("");
  const areas = P.areas
    .map((a) =>
      sec(a.id, a.label, `${a.title}`, `<p class="bp-lead">${esc(a.lead)}</p>\n    ${linkCards(a.cards, depth)}\n    <p class="bi-note"><a class="bp-btn bp-btn--ghost" href="${esc(relPrefix(depth) + a.open[1])}">${esc(a.open[0])}</a></p>`, "bp-sec bp-other bi-sec")
    )
    .join("\n");
  return `${crumb(C, depth, { cur: C.hub })}
${hero(P, "NEWON · BUSINESS HUB", anchors)}
${areas}
${infoBlock(C, "")}
${contactBlock(C, depth)}`;
}

function subBody(cl, key) {
  const P = COPY[cl][key], C = COMMON[cl], depth = 2;
  const secs = P.sections
    .map((s) =>
      s.cards[0].length === 3
        ? sec(s.id, s.label, s.lead, linkCards(s.cards, depth), "bp-sec bp-other bi-sec")
        : sec(s.id, s.label, s.lead, plainCards(s.cards))
    )
    .join("\n");
  return `${crumb(C, depth, { mid: true, cur: key === "seller" ? "Seller Center" : "Partners" })}
${hero(P, key === "seller" ? "NEWON · SELLER CENTER" : "NEWON · PARTNERS", "")}
${secs}
${infoBlock(C, P.notice)}
${contactBlock(C, depth)}`;
}

function jsonLd(lang, rel, P, names) {
  const url = `${SITE_ORIGIN}/${lang}/${rel}/`;
  const page = { "@context": "https://schema.org", "@type": "WebPage", name: P.title, description: P.desc, url, publisher: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN } };
  const crumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: names.map((n, i) => ({ "@type": "ListItem", position: i + 1, name: n[0], item: n[1] })) };
  return `    <script type="application/ld+json">${JSON.stringify(page)}</script>
    <script type="application/ld+json">${JSON.stringify(crumb)}</script>`;
}

export function renderBizHubPages() {
  const template = fs.readFileSync(path.join(ROOT, "templates", "business-pillar.html"), "utf8");
  const flatEn = flatten(loadJson("en.json"));
  const written = [];
  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(loadJson(file));
    const cl = copyLang(dir);
    for (const [key, rel] of Object.entries(BIZHUB_PAGES)) {
      const P = COPY[cl][key];
      const depth = rel.split("/").length;
      const home = [`Newon`, `${SITE_ORIGIN}/${dir}/`];
      const hubCrumb = ["Business Hub", `${SITE_ORIGIN}/${dir}/business-hub/`];
      const names = key === "hub" ? [home, hubCrumb] : [home, hubCrumb, [key === "seller" ? "Seller Center" : "Partners", `${SITE_ORIGIN}/${dir}/${rel}/`]];
      const slug = rel.replace(/\//g, "-");
      let html = template;
      html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
      html = html.replace(/\{\{FONT_LINKS\}\}/g, fontLinksHtml(dir));
      html = html.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
      html = html.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/${rel}/`);
      html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock(rel));
      html = html.replace(/\{\{JSON_LD\}\}/g, () => jsonLd(dir, rel, P, names));
      html = html.replace(/\{\{SEO_TITLE\}\}/g, () => esc(P.title));
      html = html.replace(/\{\{META_DESCRIPTION\}\}/g, () => esc(P.desc));
      html = html.replace(/\{\{PILLAR_SLUG\}\}/g, slug);
      html = html.replace(/\{\{PAGE_BODY\}\}/g, () => (key === "hub" ? hubBody(cl) : subBody(cl, key)));
      html = html.replace(`class="bp-page bp--${slug}"`, `class="bp-page bi-page bp--${slug}"`);
      html = html.replace(/(\s*<link rel="stylesheet" href="\/business-pillar\.css[^>]*>)/, `$1\n    <link rel="stylesheet" href="/business-intro.css?v=${CSS_VER}" />`);
      html = injectSiteChrome(html, flat, flatEn, { activeNav: "bizhub", base: relPrefix(depth) });
      const out = path.join(dir, rel, "index.html");
      fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
      fs.writeFileSync(path.join(ROOT, out), html);
      written.push(out);
    }
  }
  for (const rel of Object.values(BIZHUB_PAGES)) {
    writeRootRedirect(rel);
    written.push(path.join(rel, "index.html"));
  }
  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const rel of written) {
      const dest = path.join(pub, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(ROOT, rel), dest);
    }
  }
  console.log(`render-bizhub: wrote ${written.length} files (${Object.values(BIZHUB_PAGES).join(", ")})`);
}

if (import.meta.url === `file://${process.argv[1]}`) renderBizHubPages();
