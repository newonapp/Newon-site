/**
 * Studio service detail page content (Business service layout).
 * Prices/timelines come from studio-pricing.mjs — do not hardcode amounts here.
 */
import {
  STUDIO_SERVICE_PRICING,
  STUDIO_PILLAR_SERVICE_SLUGS,
  studioServicePagePath,
} from "./studio-pricing.mjs";
import { STUDIO_DETAIL_ENRICHMENTS, mergeStudioDetail } from "./studio-service-detail-enrichments.mjs";

const CAT = {
  brand: { ko: "BRAND", en: "BRAND" },
  digital: { ko: "DIGITAL", en: "DIGITAL" },
  content: { ko: "CONTENT", en: "CONTENT" },
  ip: { ko: "IP", en: "IP" },
};

/** @param {'ko'|'en'} lang */
function L(lang, ko, en) {
  return lang === "ko" ? ko : en;
}

/**
 * Shared UI labels for detail pages.
 * @param {'ko'|'en'} lang
 */
export function studioDetailUi(lang = "ko") {
  const ko = lang === "ko";
  return {
    crumbStudio: "STUDIO",
    back: ko ? "← Studio로 돌아가기" : "← Back to Studio",
    backCategory: ko ? "← 카테고리로" : "← Back to category",
    overview: "OVERVIEW",
    overviewTitle: ko ? "프로젝트를 시작하기 전에\n먼저 정리하는 것들." : "What we clarify\nbefore the work begins.",
    problems: "PROBLEMS",
    problemsTitle: ko ? "이런 상황에서 도움이 됩니다." : "Situations where this helps.",
    who: "WHO IT'S FOR",
    whoTitle: ko ? "이런 팀·브랜드에 적합합니다." : "Teams and brands this fits.",
    whatWeDo: "WHAT WE DO",
    whatWeDoTitle: ko ? "프로젝트에서 진행하는 작업." : "Work we run on this project.",
    useCases: "USE CASES",
    useCasesTitle: ko ? "이런 결과물·적용 예시." : "Examples of what we can shape.",
    included: "WHAT'S INCLUDED",
    includedTitle: ko ? "기본 범위에 포함됩니다." : "Included in the base scope.",
    deliverables: "DELIVERABLES",
    deliverablesTitle: ko ? "프로젝트 종료 시 받게 되는 결과물." : "What you receive at delivery.",
    deliverablesLead: ko
      ? "협의된 범위 기준이며, 프로젝트 규모에 따라 세부 항목은 조정될 수 있습니다."
      : "Based on agreed scope — details may adjust with project scale.",
    process: "PROCESS",
    processTitle: ko ? "프로젝트는 이렇게 진행됩니다." : "How the project runs.",
    timelinePrice: ko ? "TIMELINE & PRICE" : "TIMELINE & PRICE",
    priceTitle: ko ? "예상 기간과 시작가." : "Timeline and starting price.",
    priceFactorsLabel: ko ? "견적에 영향을 주는 요소" : "PRICING FACTORS",
    startingAt: ko ? "시작가" : "STARTING AT",
    timeline: ko ? "예상 기간" : "TIMELINE",
    optional: ko ? "OPTIONAL / ADDITIONAL SCOPE" : "OPTIONAL / ADDITIONAL SCOPE",
    optionalTitle: ko ? "필요 시 추가할 수 있는 범위." : "Optional add-ons when needed.",
    faq: "FAQ",
    faqTitle: "FAQ",
    explore: "EXPLORE STUDIO",
    exploreLead: ko ? "같은 영역의 다른 Studio 서비스" : "Other services in this Studio area",
    exploreTitle: ko ? "같은 영역의 다른 서비스" : "More in this Studio area",
    current: ko ? "CURRENT" : "CURRENT",
    ctaEyebrow: "START A PROJECT",
    ctaTitle: ko
      ? "브랜드와 제품에 필요한 것을 이야기해주세요."
      : "Tell us what your brand and product need.",
    ctaLead: ko
      ? "아직 정확한 범위가 정해지지 않아도 괜찮습니다. 현재 단계와 목표를 확인한 뒤 필요한 Studio 작업 범위를 정리합니다."
      : "Even if scope is not final yet — we clarify your stage and goals, then define the Studio work you need.",
    ctaBtn: ko ? "프로젝트 문의 →" : "Project inquiry →",
    priceNote: ko
      ? "표시된 금액은 기본 범위 기준 시작가입니다. 프로젝트 규모, 제작 범위, 결과물 수 및 요구사항에 따라 최종 견적이 달라질 수 있습니다."
      : "Listed amounts are starting prices for a basic scope. Final quotes may vary with project scale, production scope, deliverable count, and requirements.",
    developmentNeeded: "DEVELOPMENT NEEDED?",
    exploreBusiness: ko ? "Explore Newon Business →" : "Explore Newon Business →",
    prevService: ko ? "이전 서비스" : "PREVIOUS SERVICE",
    nextService: ko ? "다음 서비스" : "NEXT SERVICE",
  };
}

/** Raw detail content keyed by pricing slug. */
const DETAIL = {
  "brand-strategy": {
    pageKind: "service",
    displayName: "BRAND STRATEGY",
    seoTitle: { ko: "Brand Strategy | Newon Studio", en: "Brand Strategy | Newon Studio" },
    meta: {
      ko: "브랜드 전략 — 포지셔닝, 고객, 메시지와 톤을 정의해 네이밍·아이덴티티로 이어지는 방향을 설계합니다.",
      en: "Brand Strategy — define positioning, audience, message, and tone as the foundation for naming and identity.",
    },
    headline: {
      ko: "브랜드가 어디로 가야 하는지부터 정합니다.",
      en: "We start by deciding where the brand should go.",
    },
    description: {
      ko: "브랜드 디자인을 시작하기 전에 누구를 위한 브랜드인지, 시장에서 어떤 위치를 가져야 하는지, 어떤 메시지로 기억되어야 하는지를 정의합니다. 제품과 시장, 경쟁 환경과 고객을 분석해 이후 네이밍, 아이덴티티, 웹과 콘텐츠까지 이어질 수 있는 브랜드의 기본 방향을 설계합니다.",
      en: "Before design begins, we define who the brand is for, where it sits in the market, and how it should be remembered. We analyze product, market, competition, and customers to set a direction that can carry into naming, identity, web, and content.",
    },
    overview: {
      title: {
        ko: "보이는 것을 만들기 전에 방향부터 정리합니다.",
        en: "Clarify direction before shaping what people see.",
      },
      body: {
        ko: "브랜드 전략은 로고나 컬러를 선택하는 작업이 아닙니다. 브랜드가 해결하는 문제, 핵심 고객, 경쟁 환경, 차별점과 메시지를 정리하고 모든 브랜드 활동의 기준이 되는 방향을 만드는 과정입니다.",
        en: "Brand strategy is not picking a logo or color. It clarifies the problem the brand solves, core customers, competitive context, differentiation, and message — the reference for every brand activity.",
      },
    },
    bestFor: {
      ko: [
        "새로운 브랜드를 시작하는 팀",
        "제품은 있지만 브랜드 방향이 명확하지 않은 팀",
        "브랜드 메시지가 채널마다 달라지는 경우",
        "리브랜딩을 준비하는 브랜드",
        "여러 제품을 하나의 브랜드 아래 정리하려는 팀",
      ],
      en: [
        "Teams starting a new brand",
        "Teams with a product but unclear brand direction",
        "Brands whose message shifts by channel",
        "Brands preparing a rebrand",
        "Teams organizing multiple products under one brand",
      ],
    },
    whatWeDo: {
      ko: [
        { t: "MARKET CONTEXT", d: "브랜드가 속한 시장과 경쟁 환경을 확인합니다." },
        { t: "AUDIENCE", d: "핵심 고객과 고객이 원하는 가치를 정의합니다." },
        { t: "POSITIONING", d: "경쟁 브랜드와 구별되는 위치를 설정합니다." },
        { t: "BRAND VALUE", d: "브랜드가 지켜야 할 핵심 가치를 정리합니다." },
        { t: "MESSAGE", d: "브랜드를 설명하는 핵심 메시지를 만듭니다." },
        { t: "TONE", d: "브랜드가 어떤 방식으로 말하고 보여야 하는지 정의합니다." },
      ],
      en: [
        { t: "MARKET CONTEXT", d: "Understand the market and competitive landscape." },
        { t: "AUDIENCE", d: "Define core customers and the value they seek." },
        { t: "POSITIONING", d: "Set a distinct position versus competitors." },
        { t: "BRAND VALUE", d: "Clarify the values the brand must hold." },
        { t: "MESSAGE", d: "Craft the core message that explains the brand." },
        { t: "TONE", d: "Define how the brand should speak and appear." },
      ],
    },
    included: {
      ko: [
        "Current Brand Review",
        "Competitor Review",
        "Target Audience",
        "Positioning",
        "Core Value",
        "Brand Keywords",
        "Core Message",
        "Tone & Manner Direction",
      ],
      en: [
        "Current Brand Review",
        "Competitor Review",
        "Target Audience",
        "Positioning",
        "Core Value",
        "Brand Keywords",
        "Core Message",
        "Tone & Manner Direction",
      ],
    },
    deliverables: {
      ko: [
        "Brand Strategy Document",
        "Positioning Statement",
        "Audience Definition",
        "Core Message",
        "Brand Keywords",
        "Tone & Manner Guide",
      ],
      en: [
        "Brand Strategy Document",
        "Positioning Statement",
        "Audience Definition",
        "Core Message",
        "Brand Keywords",
        "Tone & Manner Guide",
      ],
    },
    process: {
      ko: [
        { t: "DISCOVER", d: "현재 브랜드와 제품 이해" },
        { t: "RESEARCH", d: "시장·고객·경쟁 환경 확인" },
        { t: "DEFINE", d: "포지셔닝과 브랜드 방향 정의" },
        { t: "STRUCTURE", d: "핵심 가치와 메시지 정리" },
        { t: "DELIVER", d: "브랜드 전략 문서 전달" },
      ],
      en: [
        { t: "DISCOVER", d: "Understand current brand and product" },
        { t: "RESEARCH", d: "Review market, customers, and competition" },
        { t: "DEFINE", d: "Define positioning and brand direction" },
        { t: "STRUCTURE", d: "Structure core values and messages" },
        { t: "DELIVER", d: "Hand over the brand strategy document" },
      ],
    },
    optionalScope: {
      ko: ["Naming", "Identity", "Logo", "Website / App UI", "Content Direction"],
      en: ["Naming", "Identity", "Logo", "Website / App UI", "Content Direction"],
    },
    faqs: {
      ko: [
        {
          q: "로고 제작도 포함되나요?",
          a: "Brand Strategy는 브랜드 방향을 정의하는 서비스이며 로고·아이덴티티 제작은 별도 Studio 서비스입니다.",
        },
        {
          q: "기존 브랜드도 가능한가요?",
          a: "가능합니다. 기존 브랜드의 문제와 현재 시장 상황을 분석해 새로운 방향을 정의할 수 있습니다.",
        },
        {
          q: "시장조사도 포함되나요?",
          a: "브랜드 전략에 필요한 기본적인 경쟁·시장 분석은 포함될 수 있지만, 대규모 Market Research는 Newon Business Research와 별도 범위입니다.",
        },
        {
          q: "프로젝트 기간은 어떻게 결정되나요?",
          a: "기본 범위 기준 예상 기간은 1–3주입니다. 자료 전달·피드백 일정과 범위에 따라 달라질 수 있습니다.",
        },
        {
          q: "추가 작업도 가능한가요?",
          a: "가능합니다. Naming, Identity, Logo 등 필요한 Studio 서비스로 이어서 진행할 수 있습니다.",
        },
      ],
      en: [
        {
          q: "Is logo design included?",
          a: "Brand Strategy defines brand direction. Logo and identity production are separate Studio services.",
        },
        {
          q: "Can you work on an existing brand?",
          a: "Yes. We analyze current issues and market context, then define a clearer direction.",
        },
        {
          q: "Is market research included?",
          a: "Basic competitive and market review for strategy can be included. Large-scale market research sits in Newon Business Research as a separate scope.",
        },
        {
          q: "How is timeline decided?",
          a: "The estimated range for a basic scope is 1–3 weeks. Timing shifts with materials, feedback, and scope.",
        },
        {
          q: "Can we add more work later?",
          a: "Yes — Naming, Identity, Logo, and other Studio services can follow as needed.",
        },
      ],
    },
  },

  naming: {
    pageKind: "service",
    displayName: "NAMING",
    seoTitle: { ko: "Naming | Newon Studio", en: "Naming | Newon Studio" },
    meta: {
      ko: "네이밍 — 브랜드·제품 성격과 확장성을 바탕으로 기억하기 쉬운 이름을 개발합니다.",
      en: "Naming — develop memorable names grounded in brand character and expandability.",
    },
    headline: {
      ko: "좋은 이름은 브랜드의 첫 번째 자산입니다.",
      en: "A strong name is the brand’s first asset.",
    },
    description: {
      ko: "브랜드와 제품의 성격, 타깃과 확장 가능성을 바탕으로 기억하기 쉽고 실제 브랜드로 발전할 수 있는 이름을 개발합니다.",
      en: "We develop memorable names that can grow into a real brand — based on brand character, audience, and expandability.",
    },
    bestFor: {
      ko: ["새로운 회사", "신규 브랜드", "앱 / SaaS / 디지털 제품", "신규 서비스", "기존 브랜드명 변경", "새로운 제품 라인"],
      en: ["New companies", "New brands", "Apps / SaaS / digital products", "New services", "Brand renames", "New product lines"],
    },
    whatWeDo: {
      ko: [
        { t: "BRAND ANALYSIS", d: "브랜드·제품 성격과 목표를 파악합니다." },
        { t: "NAMING DIRECTION", d: "네이밍 방향을 정의합니다." },
        { t: "KEYWORD DEVELOPMENT", d: "키워드와 의미 축을 개발합니다." },
        { t: "NAMING EXPLORATION", d: "다양한 네이밍 방향을 탐색합니다." },
        { t: "CANDIDATE DEVELOPMENT", d: "후보 이름을 구체화합니다." },
        { t: "MEANING & PRONUNCIATION", d: "의미·발음·확장성을 기본 검토합니다." },
      ],
      en: [
        { t: "BRAND ANALYSIS", d: "Understand brand and product character and goals." },
        { t: "NAMING DIRECTION", d: "Define naming direction." },
        { t: "KEYWORD DEVELOPMENT", d: "Develop keywords and meaning axes." },
        { t: "NAMING EXPLORATION", d: "Explore naming directions." },
        { t: "CANDIDATE DEVELOPMENT", d: "Develop name candidates." },
        { t: "MEANING & PRONUNCIATION", d: "Review meaning, pronunciation, and expandability." },
      ],
    },
    included: {
      ko: ["Brand Analysis", "Naming Direction", "Keyword Development", "Candidate Development", "Meaning Review", "Pronunciation Review", "Brand Expansion Review"],
      en: ["Brand Analysis", "Naming Direction", "Keyword Development", "Candidate Development", "Meaning Review", "Pronunciation Review", "Brand Expansion Review"],
    },
    deliverables: {
      ko: ["Naming Direction", "Naming Candidate List", "Candidate Meaning", "Candidate Rationale", "Recommended Names", "Basic Naming Usage Guide"],
      en: ["Naming Direction", "Naming Candidate List", "Candidate Meaning", "Candidate Rationale", "Recommended Names", "Basic Naming Usage Guide"],
    },
    process: {
      ko: [
        { t: "UNDERSTAND", d: "브랜드와 목표 이해" },
        { t: "KEYWORDS", d: "키워드·의미 축 정리" },
        { t: "DIRECTIONS", d: "네이밍 방향 설정" },
        { t: "GENERATE", d: "후보 개발" },
        { t: "REVIEW", d: "의미·발음·확장성 검토" },
        { t: "SELECT", d: "추천안 정리·전달" },
      ],
      en: [
        { t: "UNDERSTAND", d: "Understand brand and goals" },
        { t: "KEYWORDS", d: "Build keywords and meaning axes" },
        { t: "DIRECTIONS", d: "Set naming directions" },
        { t: "GENERATE", d: "Generate candidates" },
        { t: "REVIEW", d: "Review meaning, sound, expandability" },
        { t: "SELECT", d: "Recommend and deliver" },
      ],
    },
    notices: {
      ko: [
        "Newon의 네이밍 서비스는 이름의 전략·창작·기본 검토를 제공하며 상표 등록 가능성을 보장하지 않습니다. 최종 상표 출원 전 전문 변리사를 통한 확인을 권장합니다.",
      ],
      en: [
        "Newon’s naming service covers strategy, creative development, and basic review. It does not guarantee trademark registrability. We recommend attorney review before filing.",
      ],
    },
    faqs: {
      ko: [
        {
          q: "상표 등록도 해주나요?",
          a: "아니요. 의미·발음·확장성 등 기본 검토는 하지만 상표 등록·법적 보장은 제공하지 않습니다. 최종 확인은 전문 변리사를 권장합니다.",
        },
        {
          q: "도메인 확인도 가능한가요?",
          a: "주요 후보에 대해 기본적인 가용성 참고는 가능하지만, 도메인 확보·구매는 별도 범위입니다.",
        },
        {
          q: "몇 개의 이름 후보를 받나요?",
          a: "프로젝트 범위와 방향 수에 따라 달라집니다. 착수 전 필요한 방향과 검토 깊이를 함께 정합니다.",
        },
        {
          q: "앱 이름도 가능한가요?",
          a: "가능합니다. 앱·SaaS·디지털 제품 네이밍에 맞게 진행합니다.",
        },
        {
          q: "영문/글로벌 네이밍도 가능한가요?",
          a: "가능합니다. 발음·의미·확장성을 함께 검토합니다. 글로벌 상표 검토는 별도 전문 영역입니다.",
        },
      ],
      en: [
        {
          q: "Do you handle trademark registration?",
          a: "No. We provide creative development and basic review, not legal clearance or registration. Final trademark review needs an IP attorney.",
        },
        {
          q: "Can you check domains?",
          a: "We can do a basic availability check for leading candidates. Domain purchase is out of scope.",
        },
        {
          q: "How many name candidates do we get?",
          a: "It depends on agreed directions and depth. We confirm scope before kickoff — we don’t promise a fixed candidate count.",
        },
        {
          q: "Can you name an app?",
          a: "Yes — including apps, SaaS, and digital products.",
        },
        {
          q: "English / global naming?",
          a: "Yes. We review pronunciation, meaning, and expandability. Global trademark clearance remains a separate specialist scope.",
        },
      ],
    },
  },

  identity: {
    pageKind: "service",
    displayName: "IDENTITY",
    seoTitle: { ko: "Identity | Newon Studio", en: "Identity | Newon Studio" },
    meta: {
      ko: "아이덴티티 — 컬러·타이포·그래픽을 하나의 시각 시스템으로 설계합니다.",
      en: "Identity — design color, type, and graphic language as one visual system.",
    },
    headline: {
      ko: "어디에서 보아도 같은 브랜드로 느껴지도록.",
      en: "So it feels like the same brand, wherever it appears.",
    },
    description: {
      ko: "컬러, 타이포그래피, 그래픽과 이미지 스타일을 하나의 시각 시스템으로 정리해 브랜드가 웹, 앱, SNS와 다양한 채널에서 일관되게 보이도록 설계합니다.",
      en: "We organize color, typography, graphics, and image style into one visual system so the brand stays consistent across web, app, social, and other channels.",
    },
    bestFor: {
      ko: ["신규 브랜드", "브랜드 리뉴얼", "제품 브랜드", "디지털 브랜드", "여러 채널의 디자인을 통일하려는 팀"],
      en: ["New brands", "Brand renewals", "Product brands", "Digital brands", "Teams unifying design across channels"],
    },
    whatWeDo: {
      ko: [
        { t: "VISUAL DIRECTION", d: "브랜드 시각 방향을 정의합니다." },
        { t: "COLOR SYSTEM", d: "컬러 시스템을 설계합니다." },
        { t: "TYPOGRAPHY", d: "타이포그래피 시스템을 정리합니다." },
        { t: "GRAPHIC LANGUAGE", d: "그래픽 언어와 요소를 만듭니다." },
        { t: "IMAGE DIRECTION", d: "이미지·비주얼 방향을 정의합니다." },
        { t: "USAGE RULES", d: "디지털 적용과 사용 규칙을 정리합니다." },
      ],
      en: [
        { t: "VISUAL DIRECTION", d: "Define visual direction." },
        { t: "COLOR SYSTEM", d: "Design the color system." },
        { t: "TYPOGRAPHY", d: "Structure typography." },
        { t: "GRAPHIC LANGUAGE", d: "Build graphic language and elements." },
        { t: "IMAGE DIRECTION", d: "Define image and visual direction." },
        { t: "USAGE RULES", d: "Document digital application and usage rules." },
      ],
    },
    included: {
      ko: ["Visual Direction", "Color System", "Typography System", "Graphic Language", "Image Direction", "Layout Direction", "Digital Application", "Brand Usage Rules"],
      en: ["Visual Direction", "Color System", "Typography System", "Graphic Language", "Image Direction", "Layout Direction", "Digital Application", "Brand Usage Rules"],
    },
    deliverables: {
      ko: ["Visual Identity Guide", "Color Palette", "Typography System", "Graphic Elements", "Image Direction", "Basic Application Examples", "Brand Usage Guide"],
      en: ["Visual Identity Guide", "Color Palette", "Typography System", "Graphic Elements", "Image Direction", "Basic Application Examples", "Brand Usage Guide"],
    },
    process: {
      ko: [
        { t: "DISCOVER", d: "브랜드와 사용 환경 이해" },
        { t: "DIRECTION", d: "비주얼 방향 설정" },
        { t: "SYSTEM", d: "컬러·타이포·그래픽 시스템화" },
        { t: "APPLICATION", d: "주요 적용 예시" },
        { t: "GUIDE", d: "가이드 전달" },
      ],
      en: [
        { t: "DISCOVER", d: "Understand brand and usage contexts" },
        { t: "DIRECTION", d: "Set visual direction" },
        { t: "SYSTEM", d: "Systematize color, type, graphics" },
        { t: "APPLICATION", d: "Build key application examples" },
        { t: "GUIDE", d: "Deliver the guide" },
      ],
    },
    faqs: {
      ko: [
        { q: "로고도 포함되나요?", a: "Identity는 시각 시스템 중심입니다. 로고 제작이 필요하면 Logo Design을 함께 진행할 수 있습니다." },
        { q: "웹·앱에도 바로 쓸 수 있나요?", a: "디지털 적용 예시와 사용 규칙을 포함해, 이후 UI 작업으로 이어질 수 있게 정리합니다." },
        { q: "수정은 몇 회 가능한가요?", a: "합의된 라운드 안에서 수정합니다. 범위 밖 변경은 일정·견적에 반영합니다." },
        { q: "파일 형식은 무엇인가요?", a: "가이드와 함께 실제 작업에 쓰는 컬러·타이포·그래픽 자산을 전달합니다. 형식은 프로젝트에 맞춰 정합니다." },
      ],
      en: [
        { q: "Is the logo included?", a: "Identity focuses on the visual system. Logo production can run via Logo Design when needed." },
        { q: "Can we use it on web/app?", a: "Yes — we include digital application examples and rules so UI work can continue from the system." },
        { q: "How many revision rounds?", a: "Within the agreed rounds. Out-of-scope changes affect timeline and quote." },
        { q: "What file formats?", a: "We deliver guide assets plus working color, type, and graphic files. Formats are confirmed per project." },
      ],
    },
  },

  "logo-design": {
    pageKind: "service",
    displayName: "LOGO DESIGN",
    seoTitle: { ko: "Logo Design | Newon Studio", en: "Logo Design | Newon Studio" },
    meta: {
      ko: "로고 디자인 — 웹·앱·콘텐츠에서 쓸 수 있는 로고와 기본 사용 시스템을 제작합니다.",
      en: "Logo Design — create a logo and basic usage system for web, app, and content.",
    },
    headline: {
      ko: "브랜드의 성격을 가장 간결한 형태로 만듭니다.",
      en: "We shape brand character into its clearest form.",
    },
    description: {
      ko: "브랜드 방향과 사용 환경을 바탕으로 실제 웹, 앱, 콘텐츠와 다양한 매체에서 사용할 수 있는 로고와 기본 사용 시스템을 제작합니다.",
      en: "Based on brand direction and usage contexts, we design a logo and basic usage system ready for web, app, content, and other media.",
    },
    whatWeDo: {
      ko: [
        { t: "LOGO DIRECTION", d: "로고 방향을 정의합니다." },
        { t: "CONCEPT EXPLORATION", d: "콘셉트를 탐색합니다." },
        { t: "PRIMARY LOGO", d: "Primary 로고를 제작합니다." },
        { t: "VARIATIONS", d: "Secondary·모노크롬 등 변형을 정리합니다." },
        { t: "COLOR VERSIONS", d: "기본 컬러 버전을 만듭니다." },
        { t: "USAGE RULES", d: "기본 사용 규칙을 정리합니다." },
      ],
      en: [
        { t: "LOGO DIRECTION", d: "Define logo direction." },
        { t: "CONCEPT EXPLORATION", d: "Explore concepts." },
        { t: "PRIMARY LOGO", d: "Design the primary logo." },
        { t: "VARIATIONS", d: "Build secondary and monochrome variations." },
        { t: "COLOR VERSIONS", d: "Create basic color versions." },
        { t: "USAGE RULES", d: "Document basic usage rules." },
      ],
    },
    included: {
      ko: ["Logo Direction", "Concept Exploration", "Primary Logo", "Secondary Variation", "Monochrome Version", "Basic Color Version", "Basic Usage Rules"],
      en: ["Logo Direction", "Concept Exploration", "Primary Logo", "Secondary Variation", "Monochrome Version", "Basic Color Version", "Basic Usage Rules"],
    },
    deliverables: {
      ko: ["Primary Logo", "Logo Variations", "Vector Files", "Raster Files", "Color Versions", "Basic Logo Guide"],
      en: ["Primary Logo", "Logo Variations", "Vector Files", "Raster Files", "Color Versions", "Basic Logo Guide"],
    },
    process: {
      ko: [
        { t: "DISCOVER", d: "브랜드·사용 환경 이해" },
        { t: "DIRECTION", d: "로고 방향" },
        { t: "CONCEPT", d: "콘셉트 탐색" },
        { t: "REFINE", d: "선정·정제" },
        { t: "SYSTEM", d: "변형·가이드" },
        { t: "DELIVER", d: "파일 전달" },
      ],
      en: [
        { t: "DISCOVER", d: "Understand brand and usage" },
        { t: "DIRECTION", d: "Set logo direction" },
        { t: "CONCEPT", d: "Explore concepts" },
        { t: "REFINE", d: "Select and refine" },
        { t: "SYSTEM", d: "Variations and guide" },
        { t: "DELIVER", d: "Hand over files" },
      ],
    },
    optionalScope: {
      ko: ["App Icon", "Favicon", "Social Profile", "Extended Identity", "Brand Guidelines"],
      en: ["App Icon", "Favicon", "Social Profile", "Extended Identity", "Brand Guidelines"],
    },
    faqs: {
      ko: [
        { q: "아이덴티티 전체도 포함되나요?", a: "기본은 로고와 사용 시스템입니다. 컬러·타이포 전체 시스템은 Identity로 확장할 수 있습니다." },
        { q: "제공 파일 형식은?", a: "벡터·래스터 등 실사용 형식으로 전달합니다. 필요한 포맷은 착수 전 확인합니다." },
        { q: "앱 아이콘도 가능한가요?", a: "Optional Scope로 추가할 수 있습니다." },
        { q: "최종 사용권은 어떻게 되나요?", a: "계약에 따라 사용 범위와 권리를 정합니다. 모든 권리가 자동 양도된다고 일률적으로 보장하지 않습니다." },
      ],
      en: [
        { q: "Is full identity included?", a: "Default scope is the logo and basic usage system. Full color/type systems expand via Identity." },
        { q: "What file formats?", a: "Practical vector and raster formats. Exact formats are confirmed at kickoff." },
        { q: "App icon too?", a: "Yes — available as optional scope." },
        { q: "What about usage rights?", a: "Rights and usage scope follow the project agreement. We don’t claim automatic full assignment for every project." },
      ],
    },
  },

  "web-design": {
    pageKind: "service",
    displayName: "WEB DESIGN",
    typeLabel: { ko: "DESIGN ONLY", en: "DESIGN ONLY" },
    seoTitle: { ko: "Web Design | Newon Studio", en: "Web Design | Newon Studio" },
    meta: {
      ko: "웹 디자인 — 정보 구조부터 UI·반응형까지 Design Only. 개발은 Business BUILD 연계.",
      en: "Web Design — IA to UI and responsive, design only. Build via Business BUILD.",
    },
    headline: {
      ko: "브랜드와 비즈니스를 제대로 보여주는 웹 경험을 설계합니다.",
      en: "We design web experiences that present brand and business clearly.",
    },
    description: {
      ko: "웹사이트의 정보 구조부터 사용자 흐름, 화면과 반응형 경험까지 설계합니다. 개발 전에 웹 전체의 구조와 디자인을 명확하게 만드는 디자인 서비스입니다.",
      en: "From information architecture and flows to screens and responsive experience — a design service that clarifies structure before development.",
    },
    notices: {
      ko: ["본 서비스 가격은 웹 디자인 기준입니다. 실제 개발이 필요한 경우 Newon Business BUILD와 연계하여 별도 견적을 제공합니다."],
      en: ["Pricing is for web design only. Projects that need implementation are quoted separately through Newon Business BUILD."],
    },
    whatWeDo: {
      ko: [
        { t: "SITEMAP", d: "사이트맵을 구성합니다." },
        { t: "INFORMATION ARCHITECTURE", d: "정보 구조를 설계합니다." },
        { t: "USER FLOW", d: "핵심 사용자 흐름을 정의합니다." },
        { t: "WIREFRAME", d: "페이지 구조와 와이어프레임을 만듭니다." },
        { t: "UI DESIGN", d: "UI를 설계합니다." },
        { t: "RESPONSIVE", d: "반응형·컴포넌트를 정리합니다." },
      ],
      en: [
        { t: "SITEMAP", d: "Define the sitemap." },
        { t: "INFORMATION ARCHITECTURE", d: "Design information architecture." },
        { t: "USER FLOW", d: "Map key user flows." },
        { t: "WIREFRAME", d: "Structure pages and wireframes." },
        { t: "UI DESIGN", d: "Design the UI." },
        { t: "RESPONSIVE", d: "Define responsive layouts and components." },
      ],
    },
    included: {
      ko: ["Sitemap", "Information Architecture", "User Flow", "Page Structure", "Wireframe", "UI Design", "Responsive Design", "Component Design"],
      en: ["Sitemap", "Information Architecture", "User Flow", "Page Structure", "Wireframe", "UI Design", "Responsive Design", "Component Design"],
    },
    deliverables: {
      ko: ["Sitemap", "Wireframes", "Desktop UI", "Tablet / Mobile UI", "Component System", "Development Handoff"],
      en: ["Sitemap", "Wireframes", "Desktop UI", "Tablet / Mobile UI", "Component System", "Development Handoff"],
    },
    process: {
      ko: [
        { t: "DISCOVER", d: "목표·콘텐츠 이해" },
        { t: "STRUCTURE", d: "IA·사이트맵" },
        { t: "WIREFRAME", d: "구조 확정" },
        { t: "UI", d: "비주얼 UI" },
        { t: "RESPONSIVE", d: "디바이스 대응" },
        { t: "HANDOFF", d: "개발 전달" },
      ],
      en: [
        { t: "DISCOVER", d: "Goals and content" },
        { t: "STRUCTURE", d: "IA and sitemap" },
        { t: "WIREFRAME", d: "Lock structure" },
        { t: "UI", d: "Visual UI" },
        { t: "RESPONSIVE", d: "Device layouts" },
        { t: "HANDOFF", d: "Dev handoff" },
      ],
    },
    developmentCta: {
      href: "../../../business/build/",
      title: { ko: "DEVELOPMENT NEEDED?", en: "DEVELOPMENT NEEDED?" },
      body: {
        ko: "디자인뿐 아니라 실제 웹 구축이 필요하다면 Newon Business에서 개발까지 진행할 수 있습니다.",
        en: "If you need implementation as well as design, Newon Business can take you through build.",
      },
      label: { ko: "Explore Newon Business →", en: "Explore Newon Business →" },
    },
    faqs: {
      ko: [
        { q: "개발도 포함되나요?", a: "아니요. Studio Web Design은 Design Only입니다. 구축은 Newon Business BUILD로 연계합니다." },
        { q: "반응형도 포함되나요?", a: "포함됩니다. Desktop과 Mobile UI를 함께 설계합니다." },
        { q: "기존 사이트 개선도 가능한가요?", a: "가능합니다. 현재 구조와 목표를 확인한 뒤 범위를 제안합니다." },
        { q: "프로젝트 기간은?", a: "기본 범위 기준 2–5주입니다. 페이지 수와 피드백 일정에 따라 달라질 수 있습니다." },
      ],
      en: [
        { q: "Is development included?", a: "No. Studio Web Design is design only. Implementation continues through Newon Business BUILD." },
        { q: "Is responsive included?", a: "Yes — desktop and mobile UI together." },
        { q: "Can you improve an existing site?", a: "Yes. We review current structure and goals, then propose scope." },
        { q: "What’s the timeline?", a: "About 2–5 weeks for a basic scope, depending on page count and feedback." },
      ],
    },
  },

  "app-ui-ux": {
    pageKind: "service",
    displayName: "APP UI/UX",
    typeLabel: { ko: "UI / UX DESIGN", en: "UI / UX DESIGN" },
    seoTitle: { ko: "App UI/UX Design | Newon Studio", en: "App UI/UX Design | Newon Studio" },
    meta: {
      ko: "앱 UI/UX — 핵심 흐름부터 화면·프로토타입·핸드오프까지 Design Only.",
      en: "App UI/UX — flows, screens, prototype, and handoff. Design only.",
    },
    headline: {
      ko: "앱의 기능을 사용자가 자연스럽게 경험하도록 설계합니다.",
      en: "We design so people experience your app’s features naturally.",
    },
    description: {
      ko: "핵심 사용자 흐름부터 정보 구조, 화면 설계와 인터랙션까지 앱 전체의 사용자 경험을 설계합니다.",
      en: "From core user flows and information architecture to screens and interaction — we design the app experience end to end.",
    },
    notices: {
      ko: [
        "₩800,000부터는 제한된 기본 범위 기준입니다. 화면 수가 많거나 복잡한 제품 전체 디자인은 별도 견적이 될 수 있습니다.",
        "본 서비스는 UI/UX 디자인 기준이며 앱 개발은 포함되지 않습니다.",
      ],
      en: [
        "From ₩800,000 covers a limited basic scope. Larger screen counts or full-product complexity may quote higher.",
        "This service is UI/UX design only — app development is not included.",
      ],
    },
    whatWeDo: {
      ko: [
        { t: "PRODUCT UNDERSTANDING", d: "제품 목표와 기능을 이해합니다." },
        { t: "USER FLOW", d: "핵심 사용자 흐름을 설계합니다." },
        { t: "INFORMATION ARCHITECTURE", d: "정보 구조를 정리합니다." },
        { t: "WIREFRAME & UI", d: "핵심 화면과 UI를 설계합니다." },
        { t: "COMPONENTS", d: "컴포넌트 시스템을 만듭니다." },
        { t: "PROTOTYPE & HANDOFF", d: "프로토타입과 개발 전달을 준비합니다." },
      ],
      en: [
        { t: "PRODUCT UNDERSTANDING", d: "Understand product goals and features." },
        { t: "USER FLOW", d: "Design core user flows." },
        { t: "INFORMATION ARCHITECTURE", d: "Structure information architecture." },
        { t: "WIREFRAME & UI", d: "Design core screens and UI." },
        { t: "COMPONENTS", d: "Build a component system." },
        { t: "PROTOTYPE & HANDOFF", d: "Prototype and prepare developer handoff." },
      ],
    },
    included: {
      ko: ["Product Understanding", "User Flow", "Information Architecture", "Core Screen Definition", "Wireframe", "UI Design", "Component System", "Prototype", "Developer Handoff"],
      en: ["Product Understanding", "User Flow", "Information Architecture", "Core Screen Definition", "Wireframe", "UI Design", "Component System", "Prototype", "Developer Handoff"],
    },
    deliverables: {
      ko: ["User Flow", "Wireframes", "High-fidelity UI", "Responsive / Device States", "Components", "Interactive Prototype", "Handoff Package"],
      en: ["User Flow", "Wireframes", "High-fidelity UI", "Responsive / Device States", "Components", "Interactive Prototype", "Handoff Package"],
    },
    process: {
      ko: [
        { t: "DISCOVER", d: "제품·사용자 이해" },
        { t: "FLOW", d: "핵심 흐름" },
        { t: "STRUCTURE", d: "IA·와이어" },
        { t: "UI", d: "하이파이 UI" },
        { t: "PROTOTYPE", d: "인터랙션" },
        { t: "HANDOFF", d: "개발 전달" },
      ],
      en: [
        { t: "DISCOVER", d: "Product and users" },
        { t: "FLOW", d: "Core flows" },
        { t: "STRUCTURE", d: "IA and wireframes" },
        { t: "UI", d: "High-fidelity UI" },
        { t: "PROTOTYPE", d: "Interaction" },
        { t: "HANDOFF", d: "Dev handoff" },
      ],
    },
    optionalScope: {
      ko: ["Design System", "Additional Screen", "Tablet Layout", "App Icon", "UX Audit", "Development (via Business)"],
      en: ["Design System", "Additional Screen", "Tablet Layout", "App Icon", "UX Audit", "Development (via Business)"],
    },
    developmentCta: {
      href: "../../../business/app/",
      title: { ko: "DEVELOPMENT NEEDED?", en: "DEVELOPMENT NEEDED?" },
      body: {
        ko: "디자인뿐 아니라 앱 구현이 필요하다면 Newon Business에서 이어갈 수 있습니다.",
        en: "If you need app implementation as well, continue through Newon Business.",
      },
      label: { ko: "Explore Newon Business →", en: "Explore Newon Business →" },
    },
    faqs: {
      ko: [
        { q: "개발도 포함되나요?", a: "아니요. App UI/UX는 디자인·프로토타입·핸드오프까지입니다." },
        { q: "화면이 많으면요?", a: "시작가는 기본 범위 기준입니다. 화면 수·복잡도 증가 시 별도 견적입니다." },
        { q: "디자인 시스템도 가능한가요?", a: "Optional Scope로 추가할 수 있습니다." },
        { q: "예상 기간은?", a: "기본 범위 기준 3–6주입니다." },
      ],
      en: [
        { q: "Is development included?", a: "No — design, prototype, and handoff only." },
        { q: "What if we need many screens?", a: "Starting price is basic scope. More screens or complexity quote separately." },
        { q: "Design system?", a: "Available as optional scope." },
        { q: "Timeline?", a: "About 3–6 weeks for a basic scope." },
      ],
    },
  },

  "landing-page-design": {
    pageKind: "service",
    displayName: "LANDING PAGE DESIGN",
    typeLabel: { ko: "DESIGN ONLY", en: "DESIGN ONLY" },
    seoTitle: { ko: "Landing Page Design | Newon Studio", en: "Landing Page Design | Newon Studio" },
    meta: {
      ko: "랜딩페이지 디자인 — 전환 중심 한 페이지 UX/UI. Design Only.",
      en: "Landing Page Design — conversion-focused one-page UX/UI. Design only.",
    },
    headline: {
      ko: "한 페이지 안에서 제품의 가치를 이해시키고 행동으로 연결합니다.",
      en: "Help people understand value on one page — and take action.",
    },
    description: {
      ko: "메시지 구조, CTA, 섹션과 모바일 UI까지 전환을 위한 랜딩 경험을 설계합니다. 실제 웹 제작은 포함되지 않습니다.",
      en: "We design conversion-focused landing experiences — message structure, CTAs, sections, and mobile UI. Live build is not included.",
    },
    notices: {
      ko: ["본 서비스 가격은 랜딩페이지 디자인 기준입니다. 실제 구현이 필요하면 Newon Business Landing으로 연계합니다."],
      en: ["Pricing is for landing page design. Implementation continues through Newon Business Landing."],
    },
    bestFor: {
      ko: ["Product Launch", "MVP Validation", "Pre-registration", "Campaign", "New Service", "Promotion"],
      en: ["Product Launch", "MVP Validation", "Pre-registration", "Campaign", "New Service", "Promotion"],
    },
    whatWeDo: {
      ko: [
        { t: "CONTENT STRUCTURE", d: "콘텐츠 구조를 잡습니다." },
        { t: "VALUE PROPOSITION", d: "핵심 가치를 정리합니다." },
        { t: "CONVERSION FLOW", d: "전환 흐름과 CTA를 설계합니다." },
        { t: "WIREFRAME & UI", d: "와이어프레임과 UI를 만듭니다." },
        { t: "RESPONSIVE UI", d: "모바일 UI를 함께 설계합니다." },
      ],
      en: [
        { t: "CONTENT STRUCTURE", d: "Shape content structure." },
        { t: "VALUE PROPOSITION", d: "Clarify the value proposition." },
        { t: "CONVERSION FLOW", d: "Design conversion flow and CTAs." },
        { t: "WIREFRAME & UI", d: "Build wireframes and UI." },
        { t: "RESPONSIVE UI", d: "Design mobile UI together." },
      ],
    },
    included: {
      ko: ["Content Structure", "Value Proposition", "Conversion Flow", "Section Architecture", "CTA Strategy", "Wireframe", "UI Design", "Responsive UI"],
      en: ["Content Structure", "Value Proposition", "Conversion Flow", "Section Architecture", "CTA Strategy", "Wireframe", "UI Design", "Responsive UI"],
    },
    deliverables: {
      ko: ["Landing Structure", "Wireframe", "Desktop UI", "Mobile UI", "CTA System", "Development-ready Design"],
      en: ["Landing Structure", "Wireframe", "Desktop UI", "Mobile UI", "CTA System", "Development-ready Design"],
    },
    process: {
      ko: [
        { t: "DISCOVER", d: "목표·오퍼 이해" },
        { t: "STRUCTURE", d: "메시지·섹션" },
        { t: "WIREFRAME", d: "흐름 확정" },
        { t: "UI", d: "비주얼 디자인" },
        { t: "HANDOFF", d: "전달" },
      ],
      en: [
        { t: "DISCOVER", d: "Goals and offer" },
        { t: "STRUCTURE", d: "Message and sections" },
        { t: "WIREFRAME", d: "Lock the flow" },
        { t: "UI", d: "Visual design" },
        { t: "HANDOFF", d: "Deliver" },
      ],
    },
    developmentCta: {
      href: "../../../business/landing/",
      title: { ko: "DEVELOPMENT NEEDED?", en: "DEVELOPMENT NEEDED?" },
      body: {
        ko: "실제 구현까지 필요하다면 Newon Business Landing Page로 연결합니다.",
        en: "For live build, continue with Newon Business Landing Page.",
      },
      label: { ko: "Explore Business Landing →", en: "Explore Business Landing →" },
    },
    faqs: {
      ko: [
        { q: "개발도 포함되나요?", a: "아니요. Design Only입니다. 구현은 Business Landing으로 연계합니다." },
        { q: "광고 랜딩도 가능한가요?", a: "가능합니다. 캠페인·사전예약·출시 목적에 맞춰 설계합니다." },
        { q: "예상 기간은?", a: "기본 범위 기준 1–3주입니다." },
      ],
      en: [
        { q: "Is development included?", a: "No — design only. Build continues via Business Landing." },
        { q: "Ad landings?", a: "Yes — for campaigns, waitlists, and launches." },
        { q: "Timeline?", a: "About 1–3 weeks for a basic scope." },
      ],
    },
  },

  "product-design": {
    pageKind: "service",
    displayName: "PRODUCT DESIGN",
    typeLabel: { ko: "DESIGN ONLY", en: "DESIGN ONLY" },
    seoTitle: { ko: "Product Design | Newon Studio", en: "Product Design | Newon Studio" },
    meta: {
      ko: "제품 디자인 — 제품 구조·UX·UI·디자인 시스템을 하나로 설계합니다.",
      en: "Product Design — structure, UX, UI, and design system as one experience.",
    },
    headline: {
      ko: "하나의 화면이 아니라 제품 전체의 경험을 설계합니다.",
      en: "We design the whole product experience — not only screens.",
    },
    description: {
      ko: "서비스의 구조, 주요 사용자 흐름과 디자인 시스템을 하나로 연결해 제품 전체가 일관되게 작동하도록 설계합니다.",
      en: "We connect product structure, key flows, and design system so the whole product works consistently.",
    },
    notices: {
      ko: ["본 서비스는 제품 UX/UI·디자인 시스템 기준이며 개발·구축은 포함되지 않습니다."],
      en: ["This service covers product UX/UI and design system — not development or build."],
    },
    whatWeDo: {
      ko: [
        { t: "PRODUCT STRUCTURE", d: "제품 구조를 정의합니다." },
        { t: "UX ARCHITECTURE", d: "UX 아키텍처를 설계합니다." },
        { t: "USER FLOW", d: "핵심 사용자 흐름을 잡습니다." },
        { t: "UI SYSTEM", d: "UI·디자인 시스템을 만듭니다." },
        { t: "PROTOTYPE", d: "프로토타입으로 검증합니다." },
        { t: "HANDOFF", d: "개발 전달을 준비합니다." },
      ],
      en: [
        { t: "PRODUCT STRUCTURE", d: "Define product structure." },
        { t: "UX ARCHITECTURE", d: "Design UX architecture." },
        { t: "USER FLOW", d: "Map core user flows." },
        { t: "UI SYSTEM", d: "Build UI and design system." },
        { t: "PROTOTYPE", d: "Validate with prototype." },
        { t: "HANDOFF", d: "Prepare developer handoff." },
      ],
    },
    included: {
      ko: ["Product Structure", "UX Architecture", "User Flow", "Information Architecture", "Core Experience", "UI System", "Design System", "Prototype", "Development Handoff"],
      en: ["Product Structure", "UX Architecture", "User Flow", "Information Architecture", "Core Experience", "UI System", "Design System", "Prototype", "Development Handoff"],
    },
    deliverables: {
      ko: ["Product UX Architecture", "Core User Flows", "High-fidelity UI", "Design System", "Interactive Prototype", "Developer Handoff"],
      en: ["Product UX Architecture", "Core User Flows", "High-fidelity UI", "Design System", "Interactive Prototype", "Developer Handoff"],
    },
    process: {
      ko: [
        { t: "DISCOVER", d: "제품·목표" },
        { t: "ARCHITECTURE", d: "구조·흐름" },
        { t: "SYSTEM", d: "UI·DS" },
        { t: "PROTOTYPE", d: "검증" },
        { t: "HANDOFF", d: "전달" },
      ],
      en: [
        { t: "DISCOVER", d: "Product and goals" },
        { t: "ARCHITECTURE", d: "Structure and flows" },
        { t: "SYSTEM", d: "UI and design system" },
        { t: "PROTOTYPE", d: "Validate" },
        { t: "HANDOFF", d: "Deliver" },
      ],
    },
    developmentCta: {
      href: "../../../business/mvp/",
      title: { ko: "DEVELOPMENT NEEDED?", en: "DEVELOPMENT NEEDED?" },
      body: {
        ko: "디자인 이후 실제 제품 구축이 필요하면 Newon Business MVP / BUILD로 연결합니다.",
        en: "After design, continue build through Newon Business MVP / BUILD.",
      },
      label: { ko: "Explore Newon Business →", en: "Explore Newon Business →" },
    },
    faqs: {
      ko: [
        { q: "화면 단위 디자인과 뭐가 다른가요?", a: "단일 화면이 아니라 제품 구조·흐름·시스템을 함께 설계합니다." },
        { q: "개발도 포함되나요?", a: "아니요. Design Only이며 구축은 Business로 연계합니다." },
        { q: "예상 기간은?", a: "기본 범위 기준 4–8주입니다." },
      ],
      en: [
        { q: "How is this different from screen design?", a: "We design product structure, flows, and system — not isolated screens." },
        { q: "Is development included?", a: "No — design only; build via Business." },
        { q: "Timeline?", a: "About 4–8 weeks for a basic scope." },
      ],
    },
  },

  "social-content": {
    pageKind: "service",
    displayName: "SOCIAL CONTENT",
    seoTitle: { ko: "Social Content | Newon Studio", en: "Social Content | Newon Studio" },
    meta: {
      ko: "소셜 콘텐츠 — 콘텐츠 방향과 제한된 범위의 디자인 제작. 월 운영대행 아님.",
      en: "Social Content — content direction and limited design. Not monthly social ops.",
    },
    headline: {
      ko: "브랜드가 꾸준히 이야기할 수 있는 콘텐츠 구조를 만듭니다.",
      en: "Build a content structure your brand can speak from consistently.",
    },
    description: {
      ko: "채널 리뷰부터 콘텐츠 방향, 필러, 포맷·템플릿과 채널 가이드까지 만듭니다. 월간 SNS 운영대행 전체는 포함되지 않습니다.",
      en: "From channel review to content direction, pillars, formats/templates, and channel guides. Full monthly social management is not included.",
    },
    notices: {
      ko: [
        "₩300,000부터는 기본 콘텐츠 전략 및 제한된 범위의 제작 기준입니다. 월간 SNS 운영대행 전체 가격이 아닙니다.",
        "지속적인 월 운영이 필요하면 MONTHLY CONTENT MANAGEMENT — 별도 견적입니다.",
      ],
      en: [
        "From ₩300,000 covers content strategy plus a limited production set — not full monthly social ops.",
        "Ongoing monthly management is MONTHLY CONTENT MANAGEMENT — custom quote.",
      ],
    },
    whatWeDo: {
      ko: [
        { t: "CHANNEL REVIEW", d: "채널 현황을 확인합니다." },
        { t: "CONTENT DIRECTION", d: "콘텐츠 방향을 정의합니다." },
        { t: "CONTENT PILLARS", d: "콘텐츠 필러를 구성합니다." },
        { t: "FORMAT & TEMPLATE", d: "포맷과 비주얼 템플릿을 만듭니다." },
        { t: "COPY DIRECTION", d: "카피 방향을 정리합니다." },
        { t: "CHANNEL GUIDE", d: "채널 가이드를 전달합니다." },
      ],
      en: [
        { t: "CHANNEL REVIEW", d: "Review current channels." },
        { t: "CONTENT DIRECTION", d: "Define content direction." },
        { t: "CONTENT PILLARS", d: "Build content pillars." },
        { t: "FORMAT & TEMPLATE", d: "Design formats and visual templates." },
        { t: "COPY DIRECTION", d: "Set copy direction." },
        { t: "CHANNEL GUIDE", d: "Deliver a channel guide." },
      ],
    },
    included: {
      ko: ["Channel Review", "Content Direction", "Content Pillars", "Format Design", "Copy Direction", "Visual Template", "Channel Guide"],
      en: ["Channel Review", "Content Direction", "Content Pillars", "Format Design", "Copy Direction", "Visual Template", "Channel Guide"],
    },
    deliverables: {
      ko: ["Content Direction", "Content Pillars", "Social Templates", "Copy Direction", "Channel Guide", "Sample Contents"],
      en: ["Content Direction", "Content Pillars", "Social Templates", "Copy Direction", "Channel Guide", "Sample Contents"],
    },
    process: {
      ko: [
        { t: "DISCOVER", d: "브랜드·채널" },
        { t: "DEFINE", d: "방향·필러" },
        { t: "CREATE", d: "템플릿·샘플" },
        { t: "DELIVER", d: "가이드 전달" },
      ],
      en: [
        { t: "DISCOVER", d: "Brand and channels" },
        { t: "DEFINE", d: "Direction and pillars" },
        { t: "CREATE", d: "Templates and samples" },
        { t: "DELIVER", d: "Hand over guide" },
      ],
    },
    optionalScope: {
      ko: ["MONTHLY CONTENT MANAGEMENT (별도 견적)", "Campaign", "Visual Content"],
      en: ["MONTHLY CONTENT MANAGEMENT (custom quote)", "Campaign", "Visual Content"],
    },
    faqs: {
      ko: [
        { q: "월간 운영이 포함되나요?", a: "아니요. 시작가는 방향·제한된 제작 기준이며 월 운영은 별도 견적입니다." },
        { q: "샘플 콘텐츠도 받나요?", a: "범위에 따라 샘플 콘텐츠를 포함합니다. 개수는 착수 전 합의합니다." },
        { q: "예상 기간은?", a: "기본 범위 기준 1–3주입니다." },
      ],
      en: [
        { q: "Is monthly ops included?", a: "No. Starting price is direction plus limited production; monthly ops are a custom quote." },
        { q: "Do we get sample posts?", a: "Samples can be included by scope — count is agreed at kickoff." },
        { q: "Timeline?", a: "About 1–3 weeks for a basic scope." },
      ],
    },
  },

  campaign: {
    pageKind: "service",
    displayName: "CAMPAIGN",
    seoTitle: { ko: "Campaign | Newon Studio", en: "Campaign | Newon Studio" },
    meta: {
      ko: "캠페인 — 출시·프로모션을 하나의 메시지와 비주얼로 연결합니다.",
      en: "Campaign — connect launches and promotions with one message and visual.",
    },
    headline: {
      ko: "제품과 브랜드가 주목받아야 할 순간을 하나의 캠페인으로 만듭니다.",
      en: "Turn moments that need attention into one campaign.",
    },
    description: {
      ko: "캠페인 목표와 콘셉트, 키 메시지·키 비주얼, 채널 에셋까지 구성합니다.",
      en: "We shape campaign objective, concept, key message and visual, plus channel assets.",
    },
    bestFor: {
      ko: ["Product Launch", "Brand Campaign", "Promotion", "Event", "Seasonal Campaign"],
      en: ["Product Launch", "Brand Campaign", "Promotion", "Event", "Seasonal Campaign"],
    },
    whatWeDo: {
      ko: [
        { t: "CAMPAIGN OBJECTIVE", d: "목표를 정의합니다." },
        { t: "CONCEPT", d: "캠페인 콘셉트를 만듭니다." },
        { t: "KEY MESSAGE", d: "키 메시지를 정리합니다." },
        { t: "KEY VISUAL", d: "키 비주얼 방향을 설계합니다." },
        { t: "CHANNEL PLAN", d: "채널 플랜과 에셋을 구성합니다." },
      ],
      en: [
        { t: "CAMPAIGN OBJECTIVE", d: "Define the objective." },
        { t: "CONCEPT", d: "Build the campaign concept." },
        { t: "KEY MESSAGE", d: "Clarify the key message." },
        { t: "KEY VISUAL", d: "Design key visual direction." },
        { t: "CHANNEL PLAN", d: "Plan channels and assets." },
      ],
    },
    included: {
      ko: ["Campaign Objective", "Campaign Concept", "Key Message", "Copy Direction", "Key Visual Direction", "Channel Plan", "Campaign Assets"],
      en: ["Campaign Objective", "Campaign Concept", "Key Message", "Copy Direction", "Key Visual Direction", "Channel Plan", "Campaign Assets"],
    },
    deliverables: {
      ko: ["Campaign Concept", "Key Message", "Key Visual", "Digital Assets", "Social Assets", "Campaign Guide"],
      en: ["Campaign Concept", "Key Message", "Key Visual", "Digital Assets", "Social Assets", "Campaign Guide"],
    },
    process: {
      ko: [
        { t: "DISCOVER", d: "목표·오퍼" },
        { t: "CONCEPT", d: "콘셉트" },
        { t: "CREATE", d: "KV·에셋" },
        { t: "DELIVER", d: "가이드" },
      ],
      en: [
        { t: "DISCOVER", d: "Goals and offer" },
        { t: "CONCEPT", d: "Concept" },
        { t: "CREATE", d: "KV and assets" },
        { t: "DELIVER", d: "Guide" },
      ],
    },
    faqs: {
      ko: [
        { q: "영상도 포함되나요?", a: "Simple motion은 협의 가능합니다. 장편 영상은 기본 범위에 없습니다." },
        { q: "미디어 집행도 하나요?", a: "캠페인 크리에이티브·가이드 중심이며 광고 집행은 기본 범위에 없습니다." },
        { q: "예상 기간은?", a: "기본 범위 기준 2–4주입니다." },
      ],
      en: [
        { q: "Is video included?", a: "Simple motion by agreement. Long-form video is not default scope." },
        { q: "Do you run media?", a: "We focus on creative and guides — media buying is out of default scope." },
        { q: "Timeline?", a: "About 2–4 weeks for a basic scope." },
      ],
    },
  },

  "visual-content": {
    pageKind: "service",
    displayName: "VISUAL CONTENT",
    seoTitle: { ko: "Visual Content | Newon Studio", en: "Visual Content | Newon Studio" },
    meta: {
      ko: "비주얼 콘텐츠 — 웹·SNS·프로모션용 브랜드 비주얼 에셋을 제작합니다.",
      en: "Visual Content — brand visuals for web, social, and promotions.",
    },
    headline: {
      ko: "브랜드 메시지를 실제 비주얼로 만듭니다.",
      en: "Turn brand messages into real visuals.",
    },
    description: {
      ko: "Visual Direction부터 제품·웹·소셜·프로모션 에셋과 채널별 사이즈 변환까지 제작합니다.",
      en: "From visual direction to product, web, social, and promo assets — including channel size variants.",
    },
    whatWeDo: {
      ko: [
        { t: "VISUAL DIRECTION", d: "비주얼 방향을 정의합니다." },
        { t: "PRODUCT VISUAL", d: "제품 비주얼을 제작합니다." },
        { t: "WEB / SOCIAL", d: "웹·소셜 비주얼을 만듭니다." },
        { t: "PROMO ASSET", d: "프로모션 에셋을 제작합니다." },
        { t: "CHANNEL ADAPTATION", d: "채널별 사이즈로 변환합니다." },
      ],
      en: [
        { t: "VISUAL DIRECTION", d: "Define visual direction." },
        { t: "PRODUCT VISUAL", d: "Create product visuals." },
        { t: "WEB / SOCIAL", d: "Produce web and social visuals." },
        { t: "PROMO ASSET", d: "Build promotional assets." },
        { t: "CHANNEL ADAPTATION", d: "Adapt sizes per channel." },
      ],
    },
    included: {
      ko: ["Visual Direction", "Product Visual", "Web Visual", "Social Visual", "Promotional Asset", "Channel Adaptation"],
      en: ["Visual Direction", "Product Visual", "Web Visual", "Social Visual", "Promotional Asset", "Channel Adaptation"],
    },
    deliverables: {
      ko: ["Digital Visual Assets", "Social Assets", "Web Assets", "Campaign Assets", "Size Variations"],
      en: ["Digital Visual Assets", "Social Assets", "Web Assets", "Campaign Assets", "Size Variations"],
    },
    process: {
      ko: [
        { t: "DISCOVER", d: "브랜드·용도" },
        { t: "DIRECTION", d: "비주얼 방향" },
        { t: "CREATE", d: "에셋 제작" },
        { t: "ADAPT", d: "사이즈 변환" },
        { t: "DELIVER", d: "전달" },
      ],
      en: [
        { t: "DISCOVER", d: "Brand and use cases" },
        { t: "DIRECTION", d: "Visual direction" },
        { t: "CREATE", d: "Produce assets" },
        { t: "ADAPT", d: "Size variants" },
        { t: "DELIVER", d: "Hand over" },
      ],
    },
    faqs: {
      ko: [
        { q: "사진 촬영도 포함되나요?", a: "기본은 디지털 비주얼 제작입니다. 촬영이 필요하면 별도 협의입니다." },
        { q: "채널별 사이즈도 맞춰주나요?", a: "포함됩니다." },
        { q: "예상 기간은?", a: "기본 범위 기준 1–3주입니다." },
      ],
      en: [
        { q: "Is photography included?", a: "Default is digital visual production. Shoots are scoped separately." },
        { q: "Channel sizes?", a: "Yes — included." },
        { q: "Timeline?", a: "About 1–3 weeks for a basic scope." },
      ],
    },
  },

  "character-lab": {
    pageKind: "service",
    displayName: "CHARACTER LAB",
    statusLabel: { ko: "EXPERIMENTAL", en: "EXPERIMENTAL" },
    seoTitle: { ko: "Character Lab | Newon Studio", en: "Character Lab | Newon Studio" },
    meta: {
      ko: "Character Lab — 캐릭터 콘셉트와 비주얼 방향을 실험하는 Experimental IP 서비스.",
      en: "Character Lab — experimental character concept and visual direction.",
    },
    headline: {
      ko: "작은 캐릭터 아이디어에서 새로운 IP의 가능성을 찾습니다.",
      en: "Find IP potential in a small character idea.",
    },
    description: {
      ko: "캐릭터의 성격, 역할, 비주얼과 기본 세계관을 설계하고 디지털 콘텐츠와 브랜드 자산으로 발전할 수 있는 가능성을 실험합니다.",
      en: "We design personality, role, visuals, and a basic world — then experiment how it can grow into digital content and brand assets.",
    },
    notices: {
      ko: [
        "Character Lab은 현재 Experimental 서비스입니다. 대형 캐릭터 라이선싱 사업이나 완성된 IP 에이전시처럼 제공하지 않습니다.",
      ],
      en: [
        "Character Lab is an Experimental service — not a full licensing agency or finished IP business offering.",
      ],
    },
    whatWeDo: {
      ko: [
        { t: "CHARACTER CONCEPT", d: "캐릭터 콘셉트를 정의합니다." },
        { t: "PERSONALITY", d: "성격과 역할을 만듭니다." },
        { t: "VISUAL DIRECTION", d: "비주얼 방향을 설계합니다." },
        { t: "EXPRESSION STUDY", d: "표정·표현을 실험합니다." },
        { t: "WORLD SETTING", d: "기본 세계관을 정리합니다." },
        { t: "USAGE DIRECTION", d: "디지털 사용 방향을 제안합니다." },
      ],
      en: [
        { t: "CHARACTER CONCEPT", d: "Define the character concept." },
        { t: "PERSONALITY", d: "Shape personality and role." },
        { t: "VISUAL DIRECTION", d: "Design visual direction." },
        { t: "EXPRESSION STUDY", d: "Study expressions." },
        { t: "WORLD SETTING", d: "Outline a basic world." },
        { t: "USAGE DIRECTION", d: "Suggest digital usage directions." },
      ],
    },
    included: {
      ko: ["Character Concept", "Personality", "Role", "Visual Direction", "Expression Study", "Basic World Setting", "Digital Usage Direction"],
      en: ["Character Concept", "Personality", "Role", "Visual Direction", "Expression Study", "Basic World Setting", "Digital Usage Direction"],
    },
    deliverables: {
      ko: ["Character Concept Sheet", "Personality Profile", "Visual Direction", "Expression Set", "Basic World Guide", "Usage Concept"],
      en: ["Character Concept Sheet", "Personality Profile", "Visual Direction", "Expression Set", "Basic World Guide", "Usage Concept"],
    },
    process: {
      ko: [
        { t: "EXPLORE", d: "가능성 탐색" },
        { t: "CONCEPT", d: "콘셉트" },
        { t: "CHARACTER", d: "캐릭터" },
        { t: "EXPRESSIONS", d: "표현" },
        { t: "WORLD", d: "세계관" },
        { t: "TEST", d: "사용 실험" },
      ],
      en: [
        { t: "EXPLORE", d: "Explore potential" },
        { t: "CONCEPT", d: "Concept" },
        { t: "CHARACTER", d: "Character" },
        { t: "EXPRESSIONS", d: "Expressions" },
        { t: "WORLD", d: "World" },
        { t: "TEST", d: "Usage tests" },
      ],
    },
    faqs: {
      ko: [
        { q: "완성된 IP를 판매하나요?", a: "아니요. 실험·콘셉트 개발 중심이며 완성된 상용 IP 에이전시 서비스가 아닙니다." },
        { q: "스티커까지 이어지나요?", a: "Digital Stickers는 Coming Soon입니다. Character Lab에서 가능성을 먼저 실험합니다." },
        { q: "예상 기간은?", a: "기본 범위 기준 2–4주입니다." },
      ],
      en: [
        { q: "Do you sell finished IP?", a: "No — this is experimental concept work, not a commercial IP agency product." },
        { q: "Does it include stickers?", a: "Digital Stickers is Coming Soon. Character Lab explores potential first." },
        { q: "Timeline?", a: "About 2–4 weeks for a basic scope." },
      ],
    },
  },

  "digital-stickers": {
    pageKind: "comingSoon",
    displayName: "DIGITAL STICKERS",
    statusLabel: { ko: "COMING SOON", en: "COMING SOON" },
    seoTitle: { ko: "Digital Stickers | Newon Studio", en: "Digital Stickers | Newon Studio" },
    meta: {
      ko: "Digital Stickers — Coming Soon. 캐릭터 감정을 디지털 표현으로 확장하는 영역.",
      en: "Digital Stickers — Coming Soon. Extending character emotion into digital expressions.",
    },
    headline: {
      ko: "캐릭터의 성격과 감정을 디지털 표현으로 확장합니다.",
      en: "Extend character personality and emotion into digital expressions.",
    },
    description: {
      ko: "현재 준비 중입니다. 판매·운영 중인 상용 서비스가 아닙니다.",
      en: "Still in progress — not sold or operated as a live commercial service yet.",
    },
    altCtas: {
      ko: [
        { href: "../character-lab/", label: "Character Lab 보기 →" },
        { href: "../../", label: "Newon Studio 보기 →" },
      ],
      en: [
        { href: "../character-lab/", label: "View Character Lab →" },
        { href: "../../", label: "View Newon Studio →" },
      ],
    },
  },

  "newon-character": {
    pageKind: "internal",
    displayName: "NEWON CHARACTER",
    statusLabel: { ko: "INTERNAL PROJECT", en: "INTERNAL PROJECT" },
    seoTitle: { ko: "Newon Character | Newon Studio", en: "Newon Character | Newon Studio" },
    meta: {
      ko: "Newon Character — Newon 자체 브랜드용 내부 IP 프로젝트. 외부 의뢰 서비스 아님.",
      en: "Newon Character — internal Newon brand IP project. Not a client service.",
    },
    headline: {
      ko: "Newon 자체 브랜드를 위한 캐릭터 IP를 만듭니다.",
      en: "Building character IP for the Newon brand.",
    },
    description: {
      ko: "Newon 자체 브랜드를 위한 캐릭터와 시각적 IP를 개발하는 내부 프로젝트입니다. 현재 외부 의뢰 서비스가 아닙니다.",
      en: "An internal project developing character and visual IP for Newon. Not offered as a client service.",
    },
    altCtas: {
      ko: [
        { href: "../../", label: "VIEW STUDIO →" },
        { href: "../../../resources/labs/", label: "FOLLOW THE PROJECT →" },
      ],
      en: [
        { href: "../../", label: "VIEW STUDIO →" },
        { href: "../../../resources/labs/", label: "FOLLOW THE PROJECT →" },
      ],
    },
  },

  "experimental-ip": {
    pageKind: "exploring",
    displayName: "EXPERIMENTAL IP",
    statusLabel: { ko: "EXPLORING", en: "EXPLORING" },
    typeLabel: { ko: "EXPERIMENTAL / CUSTOM", en: "EXPERIMENTAL / CUSTOM" },
    seoTitle: { ko: "Experimental IP | Newon Studio", en: "Experimental IP | Newon Studio" },
    meta: {
      ko: "Experimental IP — 새로운 IP 형태를 탐색. 고정 가격 없음, 별도 견적.",
      en: "Experimental IP — exploring new IP forms. No fixed price; custom quote.",
    },
    headline: {
      ko: "새로운 형태의 IP 가능성을 탐색합니다.",
      en: "Explore new forms of IP potential.",
    },
    description: {
      ko: "캐릭터, 콘텐츠, 게임, 디지털 제품 등에서 시작할 수 있는 새로운 형태의 IP를 탐색합니다. 아직 표준화된 서비스가 아니므로 고정 가격을 표시하지 않습니다.",
      en: "We explore new IP forms that may start from characters, content, games, or digital products. Not a standardized service — no fixed price.",
    },
    faqs: {
      ko: [
        { q: "바로 구매할 수 있나요?", a: "아니요. 탐색·맞춤 프로젝트 영역이며 표준 패키지로 판매하지 않습니다." },
        { q: "어떻게 시작하나요?", a: "짧은 브리핑으로 실험 범위를 정한 뒤 별도 견적으로 진행합니다." },
      ],
      en: [
        { q: "Can we buy this as a package?", a: "No — it’s an exploration / custom area, not a standard product." },
        { q: "How do we start?", a: "A short brief sets experiment scope, then we quote custom." },
      ],
    },
  },
};

function pickLang(obj, lang) {
  if (!obj) return null;
  if (typeof obj === "string") return obj;
  if (Array.isArray(obj)) return obj;
  if (obj.ko != null || obj.en != null) return lang === "ko" ? obj.ko ?? obj.en : obj.en ?? obj.ko;
  return obj;
}

export function listStudioDetailSlugs() {
  return Object.keys(DETAIL);
}

export function getStudioServiceDetail(slug, lang = "ko") {
  const raw = mergeStudioDetail(DETAIL[slug], slug, STUDIO_DETAIL_ENRICHMENTS);
  const pricing = STUDIO_SERVICE_PRICING[slug];
  if (!raw || !pricing) return null;
  const pageLang = lang === "ko" ? "ko" : "en";
  const ui = studioDetailUi(pageLang);
  const categoryLabel = CAT[pricing.category]?.[pageLang] || pricing.category.toUpperCase();

  return {
    slug,
    pagePath: studioServicePagePath(slug),
    category: pricing.category,
    categoryLabel,
    displayName: raw.displayName,
    pageKind: raw.pageKind || "service",
    seoTitle: pickLang(raw.seoTitle, pageLang),
    metaDescription: pickLang(raw.meta, pageLang),
    eyebrow: `NEWON STUDIO · ${categoryLabel}`,
    headline: pickLang(raw.headline, pageLang),
    description: pickLang(raw.description, pageLang),
    typeLabel: pickLang(raw.typeLabel, pageLang) || "",
    statusLabel: pickLang(raw.statusLabel, pageLang) || pricing.status || "",
    overview: raw.overview
      ? {
          title: pickLang(raw.overview.title, pageLang) || ui.overviewTitle,
          body: pickLang(raw.overview.body, pageLang),
        }
      : null,
    problems: pickLang(raw.problems, pageLang) || [],
    useCases: pickLang(raw.useCases, pageLang) || [],
    priceFactors: pickLang(raw.priceFactors, pageLang) || [],
    bestFor: pickLang(raw.bestFor, pageLang) || [],
    whatWeDo: pickLang(raw.whatWeDo, pageLang) || [],
    included: pickLang(raw.included, pageLang) || [],
    deliverables: pickLang(raw.deliverables, pageLang) || [],
    process: pickLang(raw.process, pageLang) || [],
    optionalScope: pickLang(raw.optionalScope, pageLang) || [],
    notices: pickLang(raw.notices, pageLang) || [],
    faqs: pickLang(raw.faqs, pageLang) || [],
    developmentCta: raw.developmentCta
      ? {
          href: raw.developmentCta.href,
          title: pickLang(raw.developmentCta.title, pageLang),
          body: pickLang(raw.developmentCta.body, pageLang),
          label: pickLang(raw.developmentCta.label, pageLang),
        }
      : null,
    altCtas: pickLang(raw.altCtas, pageLang) || [],
    relatedSlugs: (STUDIO_PILLAR_SERVICE_SLUGS[pricing.category] || []).filter((s) => s !== slug),
    siblingSlugs: STUDIO_PILLAR_SERVICE_SLUGS[pricing.category] || [],
    ui,
    pricing,
    _pageLang: pageLang,
  };
}

