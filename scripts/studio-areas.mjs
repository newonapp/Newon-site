/**
 * Newon Studio areas — Partnerships · Digital Products · Projects · Contact.
 * (Original IP / Creative Lab was retired from Studio in Oct 2026; its old URLs redirect to the Studio hub.)
 *
 * Used by: studio-services-html.mjs (hub pillars), studio-explore-close.mjs (area cards),
 * render-studio-pillars.mjs (area cards on Brand/Digital/Content/Care + the three area pages below).
 * Page bodies exist in Korean and English; other locales reuse the English body, like the rest of Studio.
 */
import fs from "fs";
import path from "path";
import { LANGS, OG_LOCALE, SITE_ORIGIN, ROOT, escapeHtml, fontLinksHtml, hreflangBlock, loadJson, flatten, writeRootRedirect } from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";

export const STUDIO_AREA_IDS = ["partnerships", "digital", "projects", "contact"];
/** Area id → path under /{lang}/ (Digital Products keeps the existing /studio/digital/ URL). */
export const STUDIO_AREA_PATH = {
  partnerships: "studio/partnerships/",
  digital: "studio/digital/",
  projects: "studio/projects/",
  contact: "studio/contact/",
};
/**
 * Area pages rendered by renderStudioAreaPages. Since the Oct 2026 restructure, Partnerships and Projects
 * (and Digital Products, Design Systems) are written by render-bsp.mjs; only Contact is rendered here.
 */
export const STUDIO_AREA_PAGES = ["contact"];
/** Retired Studio IP paths (under /{lang}/studio/) → redirect to the Studio hub. */
export const RETIRED_STUDIO_PATHS = ["ip", "ip/character-lab", "ip/digital-stickers", "ip/newon-character", "ip/experimental-ip"];

export const AREA_NAMES = {
  partnerships: "Partnerships",
  digital: "Digital Products",
  projects: "Projects",
  contact: "Contact",
};

// Lead lines on the four "STUDIO AREAS" cards (newline = visual line break, as on the existing cards).
export const AREA_CARD = {
  ko: {
    partnerships: "브랜드와 오래\n함께 일합니다.",
    digital: "웹·앱과 디지털 제품을\n설계합니다.",
    projects: "직접 만들고\n운영합니다.",
    contact: "필요한 것을\n알려 주세요.",
  },
  en: {
    partnerships: "We work with brands\nfor the long run.",
    digital: "Design web, apps and\ndigital products.",
    projects: "We build and run\nour own products.",
    contact: "Tell us\nwhat you need.",
  },
};

const INQUIRY = "business/inquiry/?category=Studio#inquiry";
const MAIL = "mailto:newon@newon.app";

// Body copy (ko + en). `rel` paths are relative to the language root (/xx/).
export const BODY = {
  ko: {
    inquiryBtn: "프로젝트 문의 →",
    otherLabel: "STUDIO AREAS",
    hub: {
      title: "네 가지 영역으로 함께합니다",
      flow: "가능한 흐름이며 모든 프로젝트의 필수는 아닙니다. 문의 → 범위 정리 → 디자인 제작 → 지속적인 파트너십.",
      faq0From: "Brand · Digital Design · Content &amp; Campaign · Creative Lab · Design Care 등 전략·디자인·크리에이티브를",
      faq0To: "Partnerships · Digital Products · Projects 등 브랜드·디자인·크리에이티브를",
      pillars: {
        partnerships: {
          lead: "브랜드·기업과 장기적으로 함께하는 디자인 파트너십입니다.",
          items: [
            ["브랜드", "브랜드 전략·네이밍·아이덴티티·로고를 하나의 시스템으로.", "studio/brand/"],
            ["콘텐츠·캠페인", "SNS·캠페인·비주얼 콘텐츠 제작. 광고 집행은 별도.", "studio/content/"],
            ["월간 디자인 운영", "정기 디자인을 계약 범위에서 지원. 별도 견적.", "studio/care/monthly-design/"],
            ["기존 디자인 개선", "보유한 브랜드·웹·앱 디자인을 정리하고 개선. 별도 견적.", "studio/care/design-improvement/"],
          ],
        },
        digital: {
          lead: "웹·앱의 화면과 사용 경험, 디지털 상품을 설계합니다. (Design Only)",
          items: [
            ["웹 디자인", "웹사이트 구조와 화면을 설계합니다. (Design Only)", "studio/digital/web-design/"],
            ["앱 UI/UX", "앱의 핵심 흐름과 화면을 설계합니다. (Design Only)", "studio/digital/app-ui-ux/"],
            ["랜딩", "전환용 랜딩페이지 화면을 설계합니다. (Design Only)", "studio/digital/landing/"],
            ["제품 디자인", "제품 전체 UX와 UI 시스템을 설계합니다. (Design Only)", "studio/digital/product-design/"],
            ["스토어", "템플릿 · 가이드 · 디지털 상품", "resources/store/"],
          ],
        },
        projects: {
          lead: "Newon이 직접 만들고 운영하는 제품과 프로젝트 진행 방식입니다.",
          items: [
            ["Newon 제품", "Newon이 출시·운영 중인 앱과 서비스.", "studio/projects/#products"],
            ["프로젝트 진행 방식", "목표 정리부터 결과물 전달까지.", "studio/projects/#flow"],
            ["포트폴리오", "제품별 상세 소개.", "portfolio/"],
          ],
        },
        contact: {
          lead: "프로젝트와 파트너십 문의를 받습니다.",
          items: [
            ["프로젝트 문의", "목적·일정·예산 감을 남겨 주세요.", INQUIRY],
            ["파트너십 제안", "제휴와 협업 제안.", "business/collaboration/partnership/"],
            ["이메일", "newon@newon.app", MAIL],
          ],
        },
      },
    },
    digitalPage: {
      h1: "웹·앱과 디지털 제품을<br />설계합니다.",
      storeLabel: "DIGITAL GOODS",
      storeLead: "바로 활용할 수 있는 템플릿·가이드·키트는 스토어에서 확인할 수 있습니다.",
      storeCardLead: "템플릿 · 가이드 · 디지털 상품",
    },
    pages: {
      partnerships: {
        title: "Partnerships | Newon Studio",
        desc: "Newon Studio Partnerships — 브랜드 구축, 콘텐츠·캠페인, 월간 디자인 운영까지 기업·브랜드와 장기적으로 함께하는 디자인 파트너십.",
        h1: "브랜드와 오래<br />함께 일합니다.",
        lead: "한 번의 결과물보다 꾸준히 쌓이는 브랜드를 만듭니다.<br />브랜드 구축부터 콘텐츠와 디자인 운영까지 하나의 팀처럼 함께합니다.",
        primary: ["파트너십 문의 →", "studio/contact/"],
        ghost: ["협업 방식 보기 ↓", "#ways"],
        sections: [
          {
            id: "ways",
            label: "WAYS TO PARTNER",
            lead: "필요한 범위만 선택하거나 여러 영역을 묶어 진행할 수 있습니다. 범위와 금액은 상담 후 별도 견적입니다.",
            cards: [
              ["BRAND", "브랜드 전략·네이밍·아이덴티티·로고를\n하나의 시스템으로.", "studio/brand/"],
              ["CONTENT & CAMPAIGN", "SNS·캠페인·비주얼 콘텐츠를\n꾸준히 제작합니다.", "studio/content/"],
              ["MONTHLY DESIGN", "계약 범위의\n정기 디자인 운영.", "studio/care/monthly-design/"],
              ["DESIGN IMPROVEMENT", "보유한 브랜드·웹·앱 디자인을\n정리하고 개선합니다.", "studio/care/design-improvement/"],
            ],
          },
        ],
        process: {
          id: "process",
          steps: [
            ["TALK", "목표와 상황 공유"],
            ["SCOPE", "범위·일정·견적 합의"],
            ["MAKE", "디자인 제작과 피드백"],
            ["KEEP", "정기 운영과 개선"],
          ],
        },
        faq: [
          ["단기 프로젝트로 시작해도 되나요?", "가능합니다. 단일 프로젝트로 시작한 뒤 필요할 때 정기 운영으로 이어갈 수 있습니다."],
          ["월 단위 고정 상품이 있나요?", "아니요. 구성 예시만 안내하며 범위 상담 후 별도 견적으로 진행합니다."],
          ["개발이나 광고 집행도 포함되나요?", "디자인과 크리에이티브는 Studio에서, 개발·구축은 Newon Business로 연결합니다. 광고 집행은 포함되지 않습니다."],
        ],
        cta: {
          label: "LET'S PARTNER",
          title: "함께할 브랜드를 기다립니다.",
          lead: "아이디어 단계여도 괜찮습니다. 필요한 범위부터 함께 정리합니다.",
          btn: ["파트너십 문의 →", "studio/contact/"],
        },
      },
      projects: {
        title: "Projects | Newon Studio",
        desc: "Newon Studio Projects — Newon이 직접 기획·디자인·운영하는 앱과 서비스, 그리고 프로젝트 진행 방식.",
        h1: "직접 만들고<br />운영합니다.",
        lead: "Newon은 자체 앱과 서비스를 기획부터 디자인, 출시와 운영까지 직접 만들어 왔습니다.<br />그 경험을 그대로 프로젝트에 담습니다.",
        primary: ["프로젝트 문의 →", "studio/contact/"],
        ghost: ["포트폴리오 보기 →", "portfolio/"],
        sections: [
          {
            id: "products",
            label: "NEWON PRODUCTS",
            lead: "Newon이 직접 기획하고 디자인해 출시·운영 중인 제품입니다.",
            cards: [
              ["Newon+", "Newon 프리미엄 앱을\n하나로 묶은 멤버십.", "portfolio/newon-plus/"],
              ["OX MONTH", "하루 한 번 O/X 체크로\n만드는 습관.", "portfolio/ox-month/"],
              ["GoalUp", "목표 설정부터\n실행 관리까지.", "portfolio/goalup/"],
              ["Savy", "지출·수입·구독을\n하나로 정리하는 금융 앱.", "portfolio/savy/"],
              ["SubPing", "반복되는 정기 지출을\n한곳에서 관리.", "portfolio/subping/"],
              ["Pillmate", "약·영양제·건강 루틴을\n기록하고 관리.", "portfolio/pillmate/"],
            ],
          },
        ],
        process: {
          id: "flow",
          label: "PROJECT FLOW",
          steps: [
            ["BRIEF", "목표와 범위 정리"],
            ["DESIGN", "구조와 화면 설계"],
            ["HANDOFF", "결과물 전달"],
            ["BUILD", "필요 시 Business로 구현 연결"],
          ],
        },
        faq: [],
        cta: {
          label: "HAVE A PROJECT?",
          title: "다음 프로젝트를 함께 만듭니다.",
          lead: "아이디어 단계여도 괜찮습니다. 필요한 범위부터 함께 정리합니다.",
          btn: ["프로젝트 문의 →", "studio/contact/"],
        },
      },
      contact: {
        title: "Contact | Newon Studio",
        desc: "Newon Studio 문의 — 프로젝트, 파트너십, 디지털 제품 디자인 문의를 남겨 주세요.",
        h1: "필요한 것을<br />알려 주세요.",
        lead: "아이디어 단계여도 괜찮습니다.<br />목적과 대략적인 일정, 예산 감만 남겨 주시면 범위와 견적을 안내합니다.",
        primary: ["프로젝트 문의하기 →", INQUIRY],
        ghost: ["이메일 보내기 ↗", MAIL],
        sections: [
          {
            id: "channels",
            label: "HOW TO REACH US",
            lead: "",
            cards: [
              ["PROJECT", "프로젝트 문의 폼으로\n요청을 남깁니다.", INQUIRY],
              ["PARTNERSHIP", "제휴·협업 제안을\n보냅니다.", "business/collaboration/partnership/"],
              ["EMAIL", "newon@newon.app", MAIL],
              ["GENERAL", "그 밖의 문의는\n일반 문의로.", "contact/"],
            ],
          },
        ],
        process: {
          id: "brief",
          label: "WHAT TO INCLUDE",
          steps: [
            ["GOAL", "만들고 싶은 것과 목적"],
            ["SCOPE", "필요한 범위"],
            ["TIMELINE", "희망 일정"],
            ["BUDGET", "대략적인 예산 감"],
          ],
        },
        faq: [],
        cta: null,
      },
    },
    redirect: "Newon Studio로 이동합니다.",
    continueText: "계속",
  },
  en: {
    inquiryBtn: "Project inquiry →",
    otherLabel: "STUDIO AREAS",
    hub: {
      title: "Four ways to work with us",
      flow: "A possible path — not required for every project. Contact → scope → design → ongoing partnership.",
      faq0From: "Brand, Digital Design, Content &amp; Campaign, Creative Lab, and Design Care — strategy, design, and creative",
      faq0To: "Partnerships, Digital Products, and Projects — brand, design, and creative",
      pillars: {
        partnerships: {
          lead: "Long-term design partnerships with brands and companies.",
          items: [
            ["Brand", "Strategy, naming, identity and logo as one system.", "studio/brand/"],
            ["Content & Campaign", "Social, campaign and visual content. Media buying is separate.", "studio/content/"],
            ["Monthly design", "Recurring design support within an agreed scope. Quoted separately.", "studio/care/monthly-design/"],
            ["Design improvement", "Tidy up and improve existing brand, web and app design. Quoted separately.", "studio/care/design-improvement/"],
          ],
        },
        digital: {
          lead: "Screens and user experience for web and apps, plus digital goods. (Design only)",
          items: [
            ["Web design", "Website structure and screens. (Design only)", "studio/digital/web-design/"],
            ["App UI/UX", "Core app flows and screens. (Design only)", "studio/digital/app-ui-ux/"],
            ["Landing", "Conversion landing page screens. (Design only)", "studio/digital/landing/"],
            ["Product design", "End-to-end product UX and UI system. (Design only)", "studio/digital/product-design/"],
            ["Store", "Templates · guides · digital goods", "resources/store/"],
          ],
        },
        projects: {
          lead: "Products Newon builds and runs, and how our projects work.",
          items: [
            ["Newon products", "Apps and services Newon has launched and runs.", "studio/projects/#products"],
            ["How projects run", "From a clear brief to delivered files.", "studio/projects/#flow"],
            ["Portfolio", "Product-by-product details.", "portfolio/"],
          ],
        },
        contact: {
          lead: "Project and partnership inquiries.",
          items: [
            ["Project inquiry", "Share your goal, timing and rough budget.", INQUIRY],
            ["Partnership proposal", "Alliances and collaboration proposals.", "business/collaboration/partnership/"],
            ["Email", "newon@newon.app", MAIL],
          ],
        },
      },
    },
    digitalPage: {
      h1: "Design web, apps and<br />digital products.",
      storeLabel: "DIGITAL GOODS",
      storeLead: "Ready-to-use templates, guides and kits are available in the Store.",
      storeCardLead: "Templates · guides · digital goods",
    },
    pages: {
      partnerships: {
        title: "Partnerships | Newon Studio",
        desc: "Newon Studio Partnerships — long-term design partnerships with brands and companies, from brand building to content, campaigns and monthly design.",
        h1: "We work with brands<br />for the long run.",
        lead: "We build brands that grow over time, not one-off deliverables.<br />From brand building to content and ongoing design, we work like one team.",
        primary: ["Partnership inquiry →", "studio/contact/"],
        ghost: ["Ways to partner ↓", "#ways"],
        sections: [
          {
            id: "ways",
            label: "WAYS TO PARTNER",
            lead: "Pick only what you need or combine areas. Scope and price are quoted after a consultation.",
            cards: [
              ["BRAND", "Strategy, naming, identity and logo\nas one system.", "studio/brand/"],
              ["CONTENT & CAMPAIGN", "Social, campaign and visual content,\nmade consistently.", "studio/content/"],
              ["MONTHLY DESIGN", "Recurring design support\nwithin an agreed scope.", "studio/care/monthly-design/"],
              ["DESIGN IMPROVEMENT", "Tidy up and improve existing\nbrand, web and app design.", "studio/care/design-improvement/"],
            ],
          },
        ],
        process: {
          id: "process",
          steps: [
            ["TALK", "Share goals and context"],
            ["SCOPE", "Agree scope, timing and quote"],
            ["MAKE", "Design and feedback"],
            ["KEEP", "Ongoing design and improvement"],
          ],
        },
        faq: [
          ["Can we start with a short project?", "Yes. Start with a single project and continue into ongoing design when you need it."],
          ["Is there a fixed monthly plan?", "No. We share example setups only; scope and price are quoted after a consultation."],
          ["Are development and media buying included?", "Design and creative happen in Studio; development and build connect to Newon Business. Media buying is not included."],
        ],
        cta: {
          label: "LET'S PARTNER",
          title: "Let's build your brand together.",
          lead: "Early ideas are welcome. We'll shape the scope with you from there.",
          btn: ["Partnership inquiry →", "studio/contact/"],
        },
      },
      projects: {
        title: "Projects | Newon Studio",
        desc: "Newon Studio Projects — apps and services Newon plans, designs and runs itself, and how our projects work.",
        h1: "We build and run<br />our own products.",
        lead: "Newon has planned, designed, launched and operated its own apps and services.<br />We bring that experience to every project.",
        primary: ["Project inquiry →", "studio/contact/"],
        ghost: ["View portfolio →", "portfolio/"],
        sections: [
          {
            id: "products",
            label: "NEWON PRODUCTS",
            lead: "Products Newon planned and designed itself, now launched and running.",
            cards: [
              ["Newon+", "One membership for\nNewon's premium apps.", "portfolio/newon-plus/"],
              ["OX MONTH", "Habits built with\none O/X check a day.", "portfolio/ox-month/"],
              ["GoalUp", "From goal setting\nto follow-through.", "portfolio/goalup/"],
              ["Savy", "Spending, income and subscriptions\nin one place.", "portfolio/savy/"],
              ["SubPing", "Every recurring payment\nin one place.", "portfolio/subping/"],
              ["Pillmate", "Medications, supplements\nand health routines.", "portfolio/pillmate/"],
            ],
          },
        ],
        process: {
          id: "flow",
          label: "PROJECT FLOW",
          steps: [
            ["BRIEF", "Clarify goals and scope"],
            ["DESIGN", "Structure and screens"],
            ["HANDOFF", "Deliver the files"],
            ["BUILD", "Connect to Business when needed"],
          ],
        },
        faq: [],
        cta: {
          label: "HAVE A PROJECT?",
          title: "Let's make your next project together.",
          lead: "Early ideas are welcome. We'll shape the scope with you from there.",
          btn: ["Project inquiry →", "studio/contact/"],
        },
      },
      contact: {
        title: "Contact | Newon Studio",
        desc: "Contact Newon Studio — send us project, partnership and digital product design inquiries.",
        h1: "Tell us<br />what you need.",
        lead: "Early ideas are welcome.<br />Share your goal, rough timing and budget, and we'll come back with scope and a quote.",
        primary: ["Send a project inquiry →", INQUIRY],
        ghost: ["Email us ↗", MAIL],
        sections: [
          {
            id: "channels",
            label: "HOW TO REACH US",
            lead: "",
            cards: [
              ["PROJECT", "Leave a request through\nthe project inquiry form.", INQUIRY],
              ["PARTNERSHIP", "Send an alliance or\ncollaboration proposal.", "business/collaboration/partnership/"],
              ["EMAIL", "newon@newon.app", MAIL],
              ["GENERAL", "Anything else goes to\ngeneral contact.", "contact/"],
            ],
          },
        ],
        process: {
          id: "brief",
          label: "WHAT TO INCLUDE",
          steps: [
            ["GOAL", "What you want to make, and why"],
            ["SCOPE", "The scope you need"],
            ["TIMELINE", "Preferred timing"],
            ["BUDGET", "A rough budget"],
          ],
        },
        faq: [],
        cta: null,
      },
    },
    redirect: "Redirecting to Newon Studio.",
    continueText: "Continue",
  },
};

const esc = escapeHtml;
const pad2 = (n) => String(n).padStart(2, "0");
const bodyLang = (lang) => (lang === "ko" ? "ko" : "en");
/** Lang-root-relative path → href from a page `depth` folders below /{lang}/. */
function rel(depth, p) {
  return /^(mailto:|https?:|#)/.test(p) ? p : "../".repeat(depth) + p;
}

/** Four area cards ("STUDIO AREAS" grid). `depth` = folders below /{lang}/ of the page that shows them. */
export function studioAreaCardsHtml(lang, depth, activeId = null) {
  const lead = AREA_CARD[bodyLang(lang)];
  return STUDIO_AREA_IDS.map((id, i) => {
    const on = id === activeId;
    return `<a class="bp-other__card${on ? " is-active" : ""}" href="${rel(depth, STUDIO_AREA_PATH[id])}"${on ? ' aria-current="page"' : ""}>
      <span class="bp-other__top">
        <span class="bp-other__n">${pad2(i + 1)}</span>
        <span class="bp-other__arrow" aria-hidden="true">${on ? "·" : "→"}</span>
      </span>
      <span class="bp-other__t">${esc(AREA_NAMES[id].toUpperCase())}</span>
      <span class="bp-other__lead">${esc(lead[id])}</span>
    </a>`;
  }).join("");
}

export function studioAreasSectionHtml(lang, depth, activeId = null, extraClass = "", labelId = "") {
  const label = BODY[bodyLang(lang)].otherLabel;
  const cls = extraClass ? ` ${extraClass}` : "";
  const aria = labelId ? ` aria-labelledby="${labelId}"` : "";
  const pid = labelId ? ` id="${labelId}"` : "";
  return `<section class="bp-sec bp-other${cls}" data-bp-reveal${aria}>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label"${pid}>${label}</p>
    </header>
    <nav class="bp-other__grid" aria-label="${label}">${studioAreaCardsHtml(lang, depth, activeId)}</nav>
  </div>
</section>`;
}

/** Studio hub (/{lang}/studio/) copy + pillar blocks. */
export function studioHubCopy(lang) {
  return BODY[bodyLang(lang)].hub;
}

export function studioHubPillarsHtml(lang) {
  const b = BODY[bodyLang(lang)].hub.pillars;
  const more = lang === "ko" ? "자세히 보기 →" : "Learn more →";
  return STUDIO_AREA_IDS.map((id, i) => {
    const p = b[id];
    const hub = STUDIO_AREA_PATH[id].replace(/^studio\//, "");
    const items = p.items
      .map(
        ([t, d, h]) => `<a class="bz-pillar__item" href="${esc(rel(1, h))}" role="listitem" data-analytics="studio_service_view">
    <div class="bz-pillar__item-copy">
      <span class="bz-pillar__item-title">${esc(t)}</span>
      <span class="bz-pillar__item-desc">${esc(d)}</span>
    </div>
    <span class="bz-pillar__item-meta"><span class="bz-pillar__arrow" aria-hidden="true">→</span></span>
  </a>`
      )
      .join("\n");
    return `<article class="bz-pillar" id="${id}">
  <header class="bz-pillar__head">
    <span class="bz-pillar__n" aria-hidden="true">${pad2(i + 1)}</span>
    <div class="bz-pillar__intro">
      <h3 class="bz-pillar__title"><a class="bz-pillar__title-link" href="${hub}">${esc(AREA_NAMES[id])}</a></h3>
      <p class="bz-pillar__lead">${esc(p.lead)}</p>
    </div>
    <a class="bz-pillar__more" href="${hub}">${more}</a>
  </header>
  <div class="bz-pillar__list" role="list">${items}</div>
</article>`;
  }).join("\n");
}

/** Extra section on the Digital Products page: link to the Store (digital goods). */
export function studioDigitalGoodsHtml(lang) {
  const dp = BODY[bodyLang(lang)].digitalPage;
  return `<section id="digital-goods" class="bp-sec bp-other" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">${dp.storeLabel}</p>
      <p class="bp-lead">${esc(dp.storeLead)}</p>
    </header>
    <nav class="bp-other__grid" aria-label="${dp.storeLabel}"><a class="bp-other__card" href="../../resources/store/">
      <span class="bp-other__top">
        <span class="bp-other__n">01</span>
        <span class="bp-other__arrow" aria-hidden="true">→</span>
      </span>
      <span class="bp-other__t">STORE</span>
      <span class="bp-other__lead">${esc(dp.storeCardLead)}</span>
    </a></nav>
  </div>
</section>`;
}

export function studioDigitalHeadline(lang) {
  return BODY[bodyLang(lang)].digitalPage.h1;
}

function areaPageBody(lang, slug) {
  const p = BODY[bodyLang(lang)].pages[slug];
  const D = 2; // /{lang}/studio/{slug}/
  const name = AREA_NAMES[slug];
  const sections = p.sections
    .map((s) => {
      const cards = s.cards
        .map(
          ([t, lead, h], i) => `<a class="bp-other__card" href="${esc(rel(D, h))}">
      <span class="bp-other__top">
        <span class="bp-other__n">${pad2(i + 1)}</span>
        <span class="bp-other__arrow" aria-hidden="true">${/^mailto:/.test(h) ? "↗" : "→"}</span>
      </span>
      <span class="bp-other__t">${esc(t)}</span>
      <span class="bp-other__lead">${esc(lead)}</span>
    </a>`
        )
        .join("");
      return `<section id="${s.id}" class="bp-sec bp-other" data-bp-reveal aria-labelledby="${s.id}-label">
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label" id="${s.id}-label">${esc(s.label)}</p>${s.lead ? `\n      <p class="bp-lead">${esc(s.lead)}</p>` : ""}
    </header>
    <nav class="bp-other__grid" aria-label="${esc(s.label)}">${cards}</nav>
  </div>
</section>`;
    })
    .join("\n");
  const pr = p.process;
  const proc = `<section id="${pr.id}" class="bp-sec bp-process" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">${esc(pr.label || "PROCESS")}</p>
    </header>
    <ol class="bp-proc" style="--bp-proc-n:${pr.steps.length}">${pr.steps
      .map(
        ([t, d], i) => `<li class="bp-proc__step" style="--i:${i}">
      <span class="bp-proc__n" aria-hidden="true">${pad2(i + 1)}</span>
      <span class="bp-proc__label">${pad2(i + 1)}</span>
      <span class="bp-proc__t">${esc(t)}</span>
      <span class="bp-proc__d">${esc(d)}</span>
    </li>`
      )
      .join("")}</ol>
  </div>
</section>`;
  const faq = p.faq.length
    ? `<section id="faq" class="bp-sec bp-faq" data-bp-reveal>
  <div class="bp-inner">
    <header class="bp-sec__head">
      <p class="bp-label">FAQ</p>
    </header>
    <div class="bp-faq__list">${p.faq
      .map(
        ([q, a], i) => `<div class="bp-faq__item">
      <button type="button" class="bp-faq__q" aria-expanded="false" id="bp-faq-q-${i}" aria-controls="bp-faq-a-${i}">
        <span class="bp-faq__q-text">${esc(q)}</span>
        <span class="bp-faq__icon" aria-hidden="true"></span>
      </button>
      <div class="bp-faq__a" id="bp-faq-a-${i}" role="region" aria-labelledby="bp-faq-q-${i}" hidden>
        <div class="bp-faq__a-inner"><p>${esc(a)}</p></div>
      </div>
    </div>`
      )
      .join("")}</div>
  </div>
</section>`
    : "";
  const cta = p.cta
    ? `<section class="bp-cta" data-bp-reveal>
  <div class="bp-inner bp-cta__inner">
    <p class="bp-label">${esc(p.cta.label)}</p>
    <h2 class="bp-cta__title">${esc(p.cta.title)}</h2>
    <p class="bp-cta__lead">${esc(p.cta.lead)}</p>
    <a class="bp-btn bp-btn--primary" href="${esc(rel(D, p.cta.btn[1]))}" data-analytics="studio_area_cta">${esc(p.cta.btn[0])}</a>
  </div>
</section>`
    : "";
  return `<nav class="bp-crumb" aria-label="Breadcrumb">
  <div class="bp-inner">
    <ol class="bp-crumb__list">
      <li><a href="../">Studio</a></li>
      <li aria-current="page">${esc(name)}</li>
    </ol>
  </div>
</nav>
<section class="bp-hero" data-bp-reveal aria-labelledby="bp-hero-title">
  <div class="bp-inner bp-hero__grid">
    <div class="bp-hero__copy">
      <p class="bp-eyebrow">NEWON STUDIO · ${esc(name.toUpperCase())}</p>
      <h1 class="bp-hero__title" id="bp-hero-title">${p.h1}</h1>
      <p class="bp-hero__lead">${p.lead}</p>
      <div class="bp-hero__actions">
        <a class="bp-btn bp-btn--primary" href="${esc(rel(D, p.primary[1]))}" data-analytics="studio_area_cta">${esc(p.primary[0])}</a>
        <a class="bp-btn bp-btn--ghost" href="${esc(rel(D, p.ghost[1]))}">${esc(p.ghost[0])}</a>
      </div>
    </div>
    <aside class="bp-hero__visual bp-hero__visual--mark" aria-hidden="true">
    <p class="bp-mark bp-mark--stack">
      <span class="bp-mark__line">STUDIO</span>
      <span class="bp-mark__dot"></span>
      <span class="bp-mark__line">${esc(name.toUpperCase())}</span>
    </p>
  </aside>
  </div>
</section>
${sections}
${proc}
${studioAreasSectionHtml(lang, D, slug)}
${faq}
${cta}`;
}

function areaJsonLd(lang, slug, p) {
  const url = `${SITE_ORIGIN}/${lang}/studio/${slug}/`;
  const service = {
    "@context": "https://schema.org",
    "@type": slug === "contact" ? "ContactPage" : "Service",
    name: p.title,
    description: p.desc,
    ...(slug === "contact" ? {} : { provider: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN }, areaServed: "Worldwide" }),
    url,
  };
  const crumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Newon", item: `${SITE_ORIGIN}/${lang}/` },
      { "@type": "ListItem", position: 2, name: "Studio", item: `${SITE_ORIGIN}/${lang}/studio/` },
      { "@type": "ListItem", position: 3, name: AREA_NAMES[slug], item: url },
    ],
  };
  return `    <script type="application/ld+json">${JSON.stringify(service)}</script>
    <script type="application/ld+json">${JSON.stringify(crumb)}</script>`;
}

function retiredStub(lang) {
  const target = `/${lang}/studio/`;
  const b = BODY[bodyLang(lang)];
  const htmlLang = LANGS.find((l) => l.dir === lang)?.htmlLang || lang;
  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
<meta charset="UTF-8" />
<meta name="robots" content="noindex, follow" />
<meta http-equiv="refresh" content="0;url=${target}" />
<link rel="canonical" href="${SITE_ORIGIN}${target}" />
<script>location.replace(${JSON.stringify(target)});</script>
<title>Newon Studio</title>
</head>
<body><p>${esc(b.redirect)} <a href="${target}">${esc(b.continueText)}</a></p></body>
</html>
`;
}

/** Write /{lang}/studio/{partnerships,projects,contact}/ + retired IP redirects (+ copies into _publish when present). */
export function renderStudioAreaPages() {
  const template = fs.readFileSync(path.join(ROOT, "templates", "business-pillar.html"), "utf8");
  const flatEn = flatten(loadJson("en.json"));
  const written = [];
  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(loadJson(file));
    for (const slug of STUDIO_AREA_PAGES) {
      const p = BODY[bodyLang(dir)].pages[slug];
      let html = template;
      html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
      html = html.replace(/\{\{FONT_LINKS\}\}/g, fontLinksHtml(dir));
      html = html.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
      html = html.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/studio/${slug}/`);
      html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock(`studio/${slug}`));
      html = html.replace(/\{\{JSON_LD\}\}/g, areaJsonLd(dir, slug, p));
      html = html.replace(/\{\{SEO_TITLE\}\}/g, esc(p.title));
      html = html.replace(/\{\{META_DESCRIPTION\}\}/g, esc(p.desc));
      html = html.replace(/\{\{PILLAR_SLUG\}\}/g, slug);
      html = html.replace(/\{\{PAGE_BODY\}\}/g, () => areaPageBody(dir, slug));
      html = injectSiteChrome(html, flat, flatEn, { activeNav: "studio", base: "../../" });
      const rel = path.join(dir, "studio", slug, "index.html");
      fs.mkdirSync(path.dirname(path.join(ROOT, rel)), { recursive: true });
      fs.writeFileSync(path.join(ROOT, rel), html);
      written.push(rel);
    }
    for (const retired of RETIRED_STUDIO_PATHS) {
      const rel = path.join(dir, "studio", retired, "index.html");
      fs.mkdirSync(path.dirname(path.join(ROOT, rel)), { recursive: true });
      fs.writeFileSync(path.join(ROOT, rel), retiredStub(dir));
      written.push(rel);
    }
  }
  for (const slug of STUDIO_AREA_PAGES) {
    writeRootRedirect(`studio/${slug}`);
    written.push(path.join("studio", slug, "index.html"));
  }
  for (const retired of RETIRED_STUDIO_PATHS) {
    writeRootRedirect(`studio/${retired}`);
    // root /studio/ip/... → language Studio hub
    const f = path.join(ROOT, "studio", retired, "index.html");
    fs.writeFileSync(f, fs.readFileSync(f, "utf8").split(`/studio/${retired}/`).join("/studio/"));
    written.push(path.join("studio", retired, "index.html"));
  }
  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const rel of written) {
      const dest = path.join(pub, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(ROOT, rel), dest);
    }
  }
  console.log(`render-studio-areas: wrote ${written.length} files (areas ${STUDIO_AREA_PAGES.join(", ")} + retired IP redirects)`);
}
