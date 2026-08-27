/**
 * Supplemental high-quality content merged into Studio service detail pages.
 * Prices/timelines remain in studio-pricing.mjs only.
 */

/** Deep-merge enrichment fields into base detail (enrichment wins on conflict). */
export function mergeStudioDetail(base, slug, enrichment) {
  const extra = enrichment[slug];
  if (!extra || !base) return base;
  const out = { ...base };
  for (const [key, val] of Object.entries(extra)) {
    if (val && typeof val === "object" && !Array.isArray(val) && (val.ko != null || val.en != null)) {
      out[key] = val;
    } else if (Array.isArray(val) || typeof val === "string") {
      out[key] = val;
    } else if (val && typeof val === "object") {
      out[key] = { ...(out[key] || {}), ...val };
    } else {
      out[key] = val;
    }
  }
  return out;
}

export const STUDIO_DETAIL_ENRICHMENTS = {
  "brand-strategy": {
    overview: {
      body: {
        ko: [
          "브랜드 전략은 로고나 컬러를 선택하는 작업이 아닙니다. 브랜드가 해결하는 문제, 핵심 고객, 경쟁 환경, 차별점과 메시지를 정리하고 모든 브랜드 활동의 기준이 되는 방향을 만드는 과정입니다.",
          "전략이 없으면 네이밍·아이덴티티·웹·콘텐츠가 각각 다른 방향으로 흩어집니다. Brand Strategy는 이후 Studio 작업과 Business BUILD까지 이어질 수 있는 공통 기준을 만듭니다.",
        ],
        en: [
          "Brand strategy is not picking a logo or color. It clarifies the problem the brand solves, core customers, competitive context, differentiation, and message — the reference for every brand activity.",
          "Without strategy, naming, identity, web, and content drift apart. Brand Strategy creates the shared baseline that can carry into later Studio work and Business BUILD.",
        ],
      },
    },
    problems: {
      ko: [
        { t: "NO CLEAR DIRECTION", d: "제품은 있지만 브랜드가 무엇을 의미하는지 설명하기 어려운 경우." },
        { t: "MIXED MESSAGES", d: "채널마다 톤과 메시지가 달라지는 경우." },
        { t: "COMMODITY FEEL", d: "경쟁사와 구별되지 않아 가격·기능만으로만 비교되는 경우." },
        { t: "REBRAND UNCERTAINTY", d: "리브랜딩을 해야 하지만 무엇을 바꿔야 할지 모르는 경우." },
        { t: "MULTI-PRODUCT CHAOS", d: "여러 제품·서비스가 하나의 브랜드 아래 정리되지 않은 경우." },
        { t: "DESIGN WITHOUT STRATEGY", d: "디자인을 시작했지만 방향 합의가 없어 수정이 반복되는 경우." },
      ],
      en: [
        { t: "NO CLEAR DIRECTION", d: "You have a product but struggle to explain what the brand stands for." },
        { t: "MIXED MESSAGES", d: "Tone and message shift by channel." },
        { t: "COMMODITY FEEL", d: "You look like competitors — compared only on price or features." },
        { t: "REBRAND UNCERTAINTY", d: "Rebrand is needed but the change is unclear." },
        { t: "MULTI-PRODUCT CHAOS", d: "Multiple products don’t sit under one brand story." },
        { t: "DESIGN WITHOUT STRATEGY", d: "Design started without alignment — revisions keep looping." },
      ],
    },
    useCases: {
      ko: [
        { t: "NEW BRAND LAUNCH", d: "신규 브랜드·스타트업의 첫 방향 설정." },
        { t: "REPOSITIONING", d: "시장 변화에 맞춘 포지셔닝 재정의." },
        { t: "MULTI-PRODUCT BRAND", d: "여러 SKU·서비스를 하나의 브랜드로 정리." },
        { t: "PRE-IDENTITY", d: "Identity·Logo 작업 전 필수 기준 수립." },
      ],
      en: [
        { t: "NEW BRAND LAUNCH", d: "First direction for a new brand or startup." },
        { t: "REPOSITIONING", d: "Reposition as the market shifts." },
        { t: "MULTI-PRODUCT BRAND", d: "Unify multiple SKUs or services under one brand." },
        { t: "PRE-IDENTITY", d: "Set the baseline before Identity or Logo work." },
      ],
    },
    deliverables: {
      ko: [
        { t: "Brand Strategy Document", d: "포지셔닝·고객·메시지·톤을 정리한 핵심 전략 문서." },
        { t: "Positioning Statement", d: "내부·외부 커뮤니케이션에 쓸 수 있는 포지셔닝 문장." },
        { t: "Audience Definition", d: "핵심 고객과 그들이 원하는 가치 정의." },
        { t: "Core Message", d: "브랜드를 설명하는 핵심 메시지." },
        { t: "Brand Keywords", d: "브랜드 방향을 상징하는 키워드 세트." },
        { t: "Tone & Manner Guide", d: "말투·비주얼 톤의 기본 가이드." },
      ],
      en: [
        { t: "Brand Strategy Document", d: "Core strategy doc covering positioning, audience, message, and tone." },
        { t: "Positioning Statement", d: "A positioning line usable internally and externally." },
        { t: "Audience Definition", d: "Core customers and the value they seek." },
        { t: "Core Message", d: "The message that explains the brand." },
        { t: "Brand Keywords", d: "Keywords that symbolize brand direction." },
        { t: "Tone & Manner Guide", d: "Baseline guide for voice and visual tone." },
      ],
    },
  },

  naming: {
    overview: {
      title: {
        ko: "이름은 브랜드의 첫 번째\n인상이자 자산입니다.",
        en: "A name is the brand’s\nfirst impression and asset.",
      },
      body: {
        ko: [
          "좋은 이름은 기억하기 쉽고, 발음하기 쉽고, 브랜드가 성장해도 확장할 수 있어야 합니다. Naming은 감각적인 네이밍만이 아니라 브랜드 방향·키워드·의미 축을 바탕으로 후보를 개발하고 검토하는 과정입니다.",
          "상표 등록 가능성을 보장하지는 않지만, 이후 Identity·Logo·웹 작업으로 자연스럽게 이어질 수 있는 이름을 목표로 합니다.",
        ],
        en: [
          "A strong name should be memorable, easy to say, and able to grow with the brand. Naming is not random creativity — we develop and review candidates from brand direction, keywords, and meaning axes.",
          "We don’t guarantee trademark registrability, but we aim for names that can carry naturally into Identity, Logo, and web work.",
        ],
      },
    },
    problems: {
      ko: [
        { t: "BLANK SLATE", d: "브랜드 방향은 있는데 이름이 떠오르지 않는 경우." },
        { t: "TOO GENERIC", d: "검색·도메인·앱스토어에서 묻히는 평범한 이름." },
        { t: "HARD TO SAY", d: "발음·표기가 어렵거나 해외 확장에 불리한 경우." },
        { t: "RENAME NEEDED", d: "기존 이름이 제품·시장과 맞지 않는 경우." },
      ],
      en: [
        { t: "BLANK SLATE", d: "Direction exists but no name emerges." },
        { t: "TOO GENERIC", d: "Names that disappear in search, domains, or app stores." },
        { t: "HARD TO SAY", d: "Hard to pronounce, spell, or expand globally." },
        { t: "RENAME NEEDED", d: "Current name no longer fits product or market." },
      ],
    },
    optionalScope: {
      ko: ["Identity", "Logo Design", "Domain Strategy", "Global Naming Review", "Tagline Development"],
      en: ["Identity", "Logo Design", "Domain Strategy", "Global Naming Review", "Tagline Development"],
    },
  },

  identity: {
    overview: {
      title: { ko: "보이는 모든 접점에서\n같은 브랜드로 느껴지게.", en: "Feel like the same brand\neverywhere it appears." },
      body: {
        ko: [
          "Identity는 로고 하나가 아니라 컬러·타이포·그래픽·이미지 스타일을 하나의 시각 시스템으로 정리하는 작업입니다. 웹, 앱, SNS, 오프라인까지 브랜드가 일관되게 보이도록 합니다.",
          "Brand Strategy나 Naming 이후, 또는 Logo Design과 병행해 진행할 수 있습니다.",
        ],
        en: [
          "Identity is not one logo — it organizes color, typography, graphics, and image style into one visual system across web, app, social, and offline.",
          "It can follow Brand Strategy or Naming, or run alongside Logo Design.",
        ],
      },
    },
    problems: {
      ko: [
        { t: "INCONSISTENT LOOK", d: "채널마다 색·폰트·스타일이 다른 경우." },
        { t: "NO SYSTEM", d: "디자인 파일은 있지만 팀이 재사용할 시스템이 없는 경우." },
        { t: "REBRAND VISUAL", d: "리브랜딩 후 시각 언어를 새로 정립해야 하는 경우." },
        { t: "DIGITAL GAP", d: "인쇄물 가이드만 있고 디지털 적용 기준이 없는 경우." },
      ],
      en: [
        { t: "INCONSISTENT LOOK", d: "Color, type, and style differ by channel." },
        { t: "NO SYSTEM", d: "Design files exist but no reusable system for the team." },
        { t: "REBRAND VISUAL", d: "Visual language must be rebuilt after rebrand." },
        { t: "DIGITAL GAP", d: "Print guidelines exist but digital rules don’t." },
      ],
    },
    optionalScope: {
      ko: ["Logo Design", "Brand Guidelines (Extended)", "Social Template System", "Web UI Direction", "Motion Direction"],
      en: ["Logo Design", "Brand Guidelines (Extended)", "Social Template System", "Web UI Direction", "Motion Direction"],
    },
  },

  "logo-design": {
    overview: {
      title: { ko: "브랜드의 성격을\n가장 간결한 형태로.", en: "Brand character in\nits clearest form." },
      body: {
        ko: [
          "로고는 브랜드를 가장 자주 마주치는 심볼입니다. 사용 환경(웹, 앱, SNS, 파비콘)을 고려해 Primary·변형·모노크롬 버전과 기본 사용 규칙까지 정리합니다.",
          "전체 Identity 시스템이 필요하면 Identity 서비스로 확장할 수 있습니다.",
        ],
        en: [
          "The logo is the symbol people meet most often. We consider usage contexts (web, app, social, favicon) and deliver primary, variant, monochrome versions plus basic usage rules.",
          "Full visual systems expand through Identity when needed.",
        ],
      },
    },
    bestFor: {
      ko: ["신규 브랜드", "리브랜딩", "앱·SaaS 로고", "스타트업", "제품 브랜드", "서비스 런칭"],
      en: ["New brands", "Rebrands", "App / SaaS logos", "Startups", "Product brands", "Service launches"],
    },
    problems: {
      ko: [
        { t: "NO LOGO YET", d: "브랜드는 시작했지만 공식 로고가 없는 경우." },
        { t: "OUTDATED MARK", d: "오래된 로고가 현재 제품·시장과 맞지 않는 경우." },
        { t: "MULTI-VERSION CHAOS", d: "파일마다 다른 로고가 쓰이는 경우." },
        { t: "SMALL SIZE FAIL", d: "앱 아이콘·파비콘에서 깨지거나 인식이 어려운 경우." },
      ],
      en: [
        { t: "NO LOGO YET", d: "Brand started but no official mark." },
        { t: "OUTDATED MARK", d: "Old logo no longer fits product or market." },
        { t: "MULTI-VERSION CHAOS", d: "Different logos used across files and channels." },
        { t: "SMALL SIZE FAIL", d: "Mark breaks or fails at app icon / favicon size." },
      ],
    },
  },

  "web-design": {
    overview: {
      title: { ko: "개발 전에 웹 전체의\n구조와 경험을 명확히.", en: "Clarify web structure\nand experience before build." },
      body: {
        ko: [
          "Web Design은 실제 코드를 작성하는 서비스가 아닙니다. 사이트맵·정보 구조·와이어프레임·UI·반응형까지 Design Only로 설계하고, 개발팀 또는 Newon Business BUILD로 넘길 수 있는 형태로 전달합니다.",
          "브랜드 Identity가 있다면 이를 웹 경험에 맞게 적용하고, 없다면 웹 작업 범위 내에서 기본 UI 방향을 함께 정리할 수 있습니다.",
        ],
        en: [
          "Web Design does not write production code. We design sitemap, IA, wireframes, UI, and responsive layouts — design only — ready for your dev team or Newon Business BUILD.",
          "If brand Identity exists, we apply it to the web experience; if not, we can set basic UI direction within web scope.",
        ],
      },
    },
    bestFor: {
      ko: ["기업·서비스 웹사이트", "스타트업 홈페이지", "제품 소개 사이트", "리뉴얼 전 설계", "개발 착수 전 IA·UI"],
      en: ["Company/service websites", "Startup homepages", "Product sites", "Pre-redesign planning", "IA/UI before dev kickoff"],
    },
    problems: {
      ko: [
        { t: "BUILD WITHOUT PLAN", d: "개발부터 시작해 구조·화면이 계속 바뀌는 경우." },
        { t: "CONTENT CHAOS", d: "페이지는 많지만 정보 구조가 없는 경우." },
        { t: "MOBILE AFTERthought", d: "데스크톱만 있고 모바일 경험이 없는 경우." },
        { t: "BRAND MISMATCH", d: "브랜드와 웹 경험이 따로 노는 경우." },
      ],
      en: [
        { t: "BUILD WITHOUT PLAN", d: "Development started without structure — screens keep changing." },
        { t: "CONTENT CHAOS", d: "Many pages but no information architecture." },
        { t: "MOBILE AFTERthought", d: "Desktop only — no mobile experience." },
        { t: "BRAND MISMATCH", d: "Web experience doesn’t match the brand." },
      ],
    },
    optionalScope: {
      ko: ["Additional Pages", "Design System", "CMS Structure Guide", "Development (via Business BUILD)", "Landing Page (single)"],
      en: ["Additional Pages", "Design System", "CMS Structure Guide", "Development (via Business BUILD)", "Landing Page (single)"],
    },
    useCases: {
      ko: [
        { t: "CORPORATE SITE", d: "회사·서비스 소개 5–10페이지급 웹." },
        { t: "PRODUCT SITE", d: "제품 기능·가치 중심 사이트." },
        { t: "REBRAND WEB", d: "리브랜딩에 맞춘 웹 리디자인 설계." },
        { t: "DEV HANDOFF", d: "내부·외주 개발팀 전달용 UI 패키지." },
      ],
      en: [
        { t: "CORPORATE SITE", d: "Company/service site around 5–10 pages." },
        { t: "PRODUCT SITE", d: "Product value and feature focused site." },
        { t: "REBRAND WEB", d: "Web redesign aligned to rebrand." },
        { t: "DEV HANDOFF", d: "UI package for internal or vendor dev." },
      ],
    },
  },

  "app-ui-ux": {
    overview: {
      title: { ko: "앱의 핵심 흐름부터\n화면·프로토타입까지.", en: "From core app flows\nto screens and prototype." },
      body: {
        ko: [
          "App UI/UX는 제품 목표와 핵심 기능을 이해한 뒤, 사용자가 목표를 달성하는 경로를 설계합니다. 와이어프레임·하이파이 UI·컴포넌트·인터랙티브 프로토타입·개발 핸드오프까지 Design Only 범위입니다.",
          "시작가는 제한된 기본 범위 기준이며, 화면 수와 복잡도에 따라 견적이 달라질 수 있습니다.",
        ],
        en: [
          "App UI/UX starts from product goals and core features, then designs the path users take to succeed. Scope is design only: wireframes, high-fidelity UI, components, interactive prototype, and dev handoff.",
          "Starting price reflects a limited basic scope — quotes shift with screen count and complexity.",
        ],
      },
    },
    bestFor: {
      ko: ["모바일 앱", "SaaS 제품", "신규 앱 MVP UI", "앱 리디자인", "웹앱·PWA", "내부 도구 앱"],
      en: ["Mobile apps", "SaaS products", "New app MVP UI", "App redesign", "Web apps / PWA", "Internal tool apps"],
    },
    problems: {
      ko: [
        { t: "FEATURE LIST ONLY", d: "기능 목록만 있고 화면·흐름이 없는 경우." },
        { t: "HIGH DROP-OFF", d: "특정 단계에서 이탈이 높은 경우." },
        { t: "INCONSISTENT UI", d: "화면마다 다른 패턴·컴포넌트." },
        { t: "DEV BLOCKED", d: "디자인 없이 개발이 멈추거나 방향이 갈라지는 경우." },
      ],
      en: [
        { t: "FEATURE LIST ONLY", d: "Feature list exists but no screens or flows." },
        { t: "HIGH DROP-OFF", d: "Users drop off at specific steps." },
        { t: "INCONSISTENT UI", d: "Different patterns and components per screen." },
        { t: "DEV BLOCKED", d: "Development stalls or diverges without design." },
      ],
    },
  },

  "landing-page-design": {
    overview: {
      title: { ko: "한 페이지 안에서\n가치를 전달하고 전환으로.", en: "One page to explain value\nand drive conversion." },
      body: {
        ko: [
          "랜딩페이지는 메시지 구조·가치 제안·CTA·섹션 흐름이 핵심입니다. Desktop과 Mobile UI를 함께 설계하고, Business Landing으로 실제 구현까지 연계할 수 있습니다.",
        ],
        en: [
          "Landing pages live on message structure, value proposition, CTAs, and section flow. We design desktop and mobile UI together; live build continues through Business Landing.",
        ],
      },
    },
    problems: {
      ko: [
        { t: "LOW CONVERSION", d: "트래픽은 있지만 전환이 낮은 경우." },
        { t: "UNCLEAR MESSAGE", d: "한 glance에 무엇을 하는 서비스인지 전달되지 않는 경우." },
        { t: "CAMPAIGN READY", d: "출시·캠페인용 페이지가 급히 필요한 경우." },
      ],
      en: [
        { t: "LOW CONVERSION", d: "Traffic exists but conversion is low." },
        { t: "UNCLEAR MESSAGE", d: "Offer isn’t clear at a glance." },
        { t: "CAMPAIGN READY", d: "Launch or campaign page needed quickly." },
      ],
    },
  },

  "product-design": {
    overview: {
      title: { ko: "화면 단위가 아니라\n제품 전체의 경험.", en: "The whole product experience\n—not isolated screens." },
      body: {
        ko: [
          "Product Design은 제품 구조·UX 아키텍처·핵심 흐름·UI 시스템·디자인 시스템·프로토타입을 하나로 연결합니다. Web Design이나 App UI/UX보다 넓은 제품 단위 설계입니다.",
        ],
        en: [
          "Product Design connects structure, UX architecture, core flows, UI system, design system, and prototype — broader than single web or app UI scopes.",
        ],
      },
    },
    bestFor: {
      ko: ["SaaS 제품", "플랫폼형 서비스", "복잡한 B2B 제품", "멀티 역할 제품", "제품 리디자인", "DS 구축"],
      en: ["SaaS products", "Platform services", "Complex B2B products", "Multi-role products", "Product redesign", "Design system build"],
    },
    problems: {
      ko: [
        { t: "FRAGMENTED UX", d: "기능은 많지만 제품 전체 흐름이 끊기는 경우." },
        { t: "NO DESIGN SYSTEM", d: "팀·외주가 같은 UI 언어를 쓰지 못하는 경우." },
        { t: "SCALE PAIN", d: "기능 추가마다 UX·UI가 무너지는 경우." },
      ],
      en: [
        { t: "FRAGMENTED UX", d: "Many features but broken end-to-end flow." },
        { t: "NO DESIGN SYSTEM", d: "Team and vendors don’t share one UI language." },
        { t: "SCALE PAIN", d: "UX/UI breaks every time features ship." },
      ],
    },
    optionalScope: {
      ko: ["Extended Screens", "Design System Docs", "User Research", "Development (via Business MVP/BUILD)"],
      en: ["Extended Screens", "Design System Docs", "User Research", "Development (via Business MVP/BUILD)"],
    },
  },

  "social-content": {
    overview: {
      title: { ko: "꾸준히 말할 수 있는\n콘텐츠 구조를 만듭니다.", en: "A content structure\nyour brand can speak from." },
      body: {
        ko: [
          "Social Content는 채널 리뷰·콘텐츠 방향·필러·템플릿·카피 방향·채널 가이드를 만듭니다. 월간 SNS 운영대행 전체는 포함되지 않으며, 지속 운영은 별도 견적입니다.",
        ],
        en: [
          "Social Content covers channel review, direction, pillars, templates, copy direction, and channel guide. Full monthly social ops is not included — ongoing management is a custom quote.",
        ],
      },
    },
    bestFor: {
      ko: ["브랜드 SNS 시작", "콘텐츠 방향 재정립", "런칭 전 SNS 준비", "템플릿·가이드 필요 팀", "인하우스 디자이너 있는 팀"],
      en: ["Starting brand social", "Resetting content direction", "Pre-launch social prep", "Teams needing templates/guides", "Teams with in-house designers"],
    },
    problems: {
      ko: [
        { t: "RANDOM POSTS", d: "매번 다른 톤·형식으로 올리는 경우." },
        { t: "NO PILLARS", d: "무엇을 말해야 할지 기준이 없는 경우." },
        { t: "TEMPLATE GAP", d: "디자이너 없이도 쓸 템플릿이 없는 경우." },
      ],
      en: [
        { t: "RANDOM POSTS", d: "Different tone and format every post." },
        { t: "NO PILLARS", d: "No baseline for what to say." },
        { t: "TEMPLATE GAP", d: "No templates the team can reuse without a designer." },
      ],
    },
  },

  campaign: {
    overview: {
      title: { ko: "한 번의 캠페인으로\n메시지와 비주얼을 연결.", en: "One campaign connecting\nmessage and visual." },
      body: {
        ko: [
          "Campaign은 출시·프로모션·이벤트 등 주목이 필요한 순간을 하나의 콘셉트·키 메시지·키 비주얼·채널 에셋으로 묶습니다. 미디어 집행은 기본 범위에 포함되지 않습니다.",
        ],
        en: [
          "Campaign bundles launch, promo, or event moments into one concept, key message, key visual, and channel assets. Media buying is not in default scope.",
        ],
      },
    },
    problems: {
      ko: [
        { t: "LAUNCH NOISE", d: "출시인데 메시지·비주얼이 흩어진 경우." },
        { t: "CHANNEL MISMATCH", d: "채널마다 다른 캠페인 톤." },
        { t: "SHORT DEADLINE", d: "짧은 일정에 맞춘 캠페인 크리에이티브가 필요한 경우." },
      ],
      en: [
        { t: "LAUNCH NOISE", d: "Launch moment but scattered message and visual." },
        { t: "CHANNEL MISMATCH", d: "Different campaign tone per channel." },
        { t: "SHORT DEADLINE", d: "Campaign creative needed on a tight timeline." },
      ],
    },
    useCases: {
      ko: [
        { t: "PRODUCT LAUNCH", d: "신제품·신서비스 출시 캠페인." },
        { t: "SEASONAL PROMO", d: "시즌·프로모션 KV·에셋." },
        { t: "EVENT", d: "이벤트·컨퍼런스 홍보 세트." },
      ],
      en: [
        { t: "PRODUCT LAUNCH", d: "New product or service launch." },
        { t: "SEASONAL PROMO", d: "Seasonal or promo KV and assets." },
        { t: "EVENT", d: "Event or conference promotion set." },
      ],
    },
  },

  "visual-content": {
    overview: {
      title: { ko: "메시지를 실제\n비주얼 에셋으로.", en: "Turn messages into\nreal visual assets." },
      body: {
        ko: [
          "Visual Content는 Visual Direction부터 제품·웹·소셜·프로모션용 에셋과 채널별 사이즈 변환까지 제작합니다. 촬영이 필요한 경우 별도 협의입니다.",
        ],
        en: [
          "Visual Content covers direction through product, web, social, and promo assets — including channel size variants. Photography is scoped separately when needed.",
        ],
      },
    },
    bestFor: {
      ko: ["제품 비주얼", "SNS 에셋", "웹·배너", "프로모션 그래픽", "캠페인 서포트 비주얼"],
      en: ["Product visuals", "Social assets", "Web/banners", "Promo graphics", "Campaign support visuals"],
    },
    problems: {
      ko: [
        { t: "STOCK FEEL", d: "스톡 이미지만으로는 브랜드感이 없는 경우." },
        { t: "SIZE CHAOS", d: "채널마다 사이즈를 매번 새로 만드는 경우." },
        { t: "INCONSISTENT VISUAL", d: "에셋마다 스타일이 다른 경우." },
      ],
      en: [
        { t: "STOCK FEEL", d: "Stock alone doesn’t feel on-brand." },
        { t: "SIZE CHAOS", d: "Recreating sizes for every channel." },
        { t: "INCONSISTENT VISUAL", d: "Different style per asset." },
      ],
    },
    optionalScope: {
      ko: ["Motion Graphics", "Photography Direction", "Campaign Bundle", "Monthly Visual Retainer (별도 견적)"],
      en: ["Motion Graphics", "Photography Direction", "Campaign Bundle", "Monthly Visual Retainer (custom quote)"],
    },
  },

  "character-lab": {
    overview: {
      title: { ko: "작은 아이디어에서\nIP 가능성을 실험.", en: "Experiment IP potential\nfrom a small idea." },
      body: {
        ko: [
          "Character Lab은 Experimental 서비스입니다. 캐릭터 콘셉트·성격·비주얼·표정·기본 세계관을 설계하고, 디지털 콘텐츠·브랜드 자산으로 확장할 수 있는지 실험합니다.",
          "완성된 상용 IP 라이선싱·대형 캐릭터 사업 형태가 아닙니다.",
        ],
        en: [
          "Character Lab is Experimental — we design concept, personality, visuals, expressions, and a basic world, then test expansion into digital content and brand assets.",
          "This is not a finished commercial IP licensing or large character business offering.",
        ],
      },
    },
    bestFor: {
      ko: ["캐릭터 IP 탐색", "브랜드 마스코트 실험", "콘텐츠·게임 캐릭터 초기", "스티커·굿즈 전 단계"],
      en: ["Character IP exploration", "Brand mascot experiments", "Early content/game characters", "Pre-sticker/merch stage"],
    },
    problems: {
      ko: [
        { t: "CHARACTER IDEA ONLY", d: "아이디어만 있고 구체화가 안 된 경우." },
        { t: "NO USAGE PATH", d: "캐릭터를 어디에 쓸지 모르는 경우." },
        { t: "BRAND MASCOT", d: "브랜드 대표 캐릭터가 필요한 경우." },
      ],
      en: [
        { t: "CHARACTER IDEA ONLY", d: "Idea exists but isn’t shaped." },
        { t: "NO USAGE PATH", d: "Unclear where the character lives." },
        { t: "BRAND MASCOT", d: "Need a brand mascot direction." },
      ],
    },
    optionalScope: {
      ko: ["Extended Expression Set", "Sticker Concept", "Merch Mockup", "Experimental IP (custom)"],
      en: ["Extended Expression Set", "Sticker Concept", "Merch Mockup", "Experimental IP (custom)"],
    },
  },

  "digital-stickers": {
    overview: {
      title: { ko: "캐릭터 감정을\n디지털 표현으로.", en: "Character emotion as\ndigital expression." },
      body: {
        ko: [
          "Digital Stickers는 Character Lab에서 다루는 캐릭터·감정을 메신저·SNS 등 디지털 채널용 표현으로 확장하는 영역입니다. 현재 준비 중이며, 판매·운영 중인 상용 서비스가 아닙니다.",
        ],
        en: [
          "Digital Stickers extends character and emotion from Character Lab into messenger and social expressions. Still in progress — not sold or operated as a live commercial service yet.",
        ],
      },
    },
    whatWeDo: {
      ko: [
        { t: "CHARACTER EMOTION", d: "캐릭터의 감정·표정 범위를 정의합니다. (예정)" },
        { t: "STICKER FORMAT", d: "메신저·SNS용 스티커 포맷을 설계합니다. (예정)" },
        { t: "PACK STRUCTURE", d: "스티커 팩 구성과 사용 맥락을 정리합니다. (예정)" },
      ],
      en: [
        { t: "CHARACTER EMOTION", d: "Define emotion and expression range. (Planned)" },
        { t: "STICKER FORMAT", d: "Design sticker formats for messenger/social. (Planned)" },
        { t: "PACK STRUCTURE", d: "Structure packs and usage context. (Planned)" },
      ],
    },
    faqs: {
      ko: [
        { q: "지금 의뢰할 수 있나요?", a: "아니요. Coming Soon 상태이며 상용 의뢰를 받지 않습니다. Character Lab에서 IP 가능성을 먼저 실험할 수 있습니다." },
        { q: "Character Lab과 무슨 관계인가요?", a: "Character Lab에서 만든 캐릭터·감정을 디지털 스티커로 확장하는 후속 영역으로 준비 중입니다." },
        { q: "가격은 언제 공개되나요?", a: "서비스가 정식 오픈될 때 범위와 함께 안내합니다. 현재는 가격을 표시하지 않습니다." },
      ],
      en: [
        { q: "Can we commission it now?", a: "No — Coming Soon. We don’t take commercial requests yet. Try Character Lab to explore IP potential first." },
        { q: "How does it relate to Character Lab?", a: "Planned as a follow-on from Character Lab — extending character emotion into digital stickers." },
        { q: "When will pricing be published?", a: "When the service opens with defined scope. No price is shown while in preparation." },
      ],
    },
  },

  "newon-character": {
    overview: {
      title: { ko: "Newon 자체 브랜드\n캐릭터 IP.", en: "Character IP for\nthe Newon brand." },
      body: {
        ko: [
          "Newon Character는 Newon 자체 브랜드를 위한 캐릭터·시각 IP를 개발하는 내부 프로젝트입니다. 외부 의뢰·커스텀 제작 서비스가 아닙니다.",
          "진행 상황은 Labs·News 등 채널을 통해 공유될 수 있습니다.",
        ],
        en: [
          "Newon Character is an internal project developing character and visual IP for Newon — not a client commission service.",
          "Progress may be shared through Labs, News, and similar channels.",
        ],
      },
    },
    whatWeDo: {
      ko: [
        { t: "BRAND CHARACTER", d: "Newon 브랜드에 맞는 캐릭터 방향을 탐색합니다." },
        { t: "VISUAL IP", d: "제품·콘텐츠에 쓸 수 있는 시각 IP를 실험합니다." },
        { t: "INTERNAL USE", d: "내부 브랜드·제품 경험에 적용 가능성을 검토합니다." },
      ],
      en: [
        { t: "BRAND CHARACTER", d: "Explore character direction for the Newon brand." },
        { t: "VISUAL IP", d: "Experiment with visual IP for products and content." },
        { t: "INTERNAL USE", d: "Review fit for internal brand and product experience." },
      ],
    },
    faqs: {
      ko: [
        { q: "외부 의뢰가 가능한가요?", a: "아니요. Internal Project이며 클라이언트 서비스가 아닙니다." },
        { q: "Character Lab과 다른가요?", a: "Character Lab은 Experimental 클라이언트 서비스입니다. Newon Character는 Newon 자체 IP 프로젝트입니다." },
        { q: "진행 상황은 어디서 보나요?", a: "Labs·News 등 Newon 채널을 통해 공유될 수 있습니다." },
      ],
      en: [
        { q: "Can clients commission this?", a: "No — internal project, not a client service." },
        { q: "How is it different from Character Lab?", a: "Character Lab is an Experimental client service. Newon Character is Newon’s own IP project." },
        { q: "Where can we follow progress?", a: "Through Newon channels such as Labs and News when shared." },
      ],
    },
  },

  "experimental-ip": {
    overview: {
      title: { ko: "표준 패키지 밖\nIP 가능성 탐색.", en: "Explore IP potential\noutside standard packages." },
      body: {
        ko: [
          "Experimental IP는 캐릭터·콘텐츠·게임·디지털 제품 등에서 시작할 수 있는 새로운 IP 형태를 탐색합니다. 고정 가격·표준 패키지가 없으며, 짧은 브리핑 후 실험 범위를 정하고 별도 견적으로 진행합니다.",
        ],
        en: [
          "Experimental IP explores new IP forms that may start from characters, content, games, or digital products. No fixed price or standard package — a short brief sets experiment scope, then we quote custom.",
        ],
      },
    },
    bestFor: {
      ko: ["새 IP 형태 실험", "캐릭터·세계관 확장", "게임·콘텐츠 IP 초기", "브랜드 자산 실험", "Character Lab 이후 확장"],
      en: ["New IP form experiments", "Character/world expansion", "Early game/content IP", "Brand asset experiments", "Post–Character Lab expansion"],
    },
    whatWeDo: {
      ko: [
        { t: "SCOPE BRIEF", d: "실험 목표와 범위를 짧게 정의합니다." },
        { t: "IP HYPOTHESIS", d: "IP가 성립할 수 있는 가설을 세웁니다." },
        { t: "CONCEPT TEST", d: "콘셉트·비주얼·사용 맥락을 실험합니다." },
        { t: "NEXT STEP", d: "확장·보류·다른 Studio/Business 연계를 제안합니다." },
      ],
      en: [
        { t: "SCOPE BRIEF", d: "Define experiment goals and scope briefly." },
        { t: "IP HYPOTHESIS", d: "Set hypotheses for viable IP." },
        { t: "CONCEPT TEST", d: "Test concept, visual, and usage context." },
        { t: "NEXT STEP", d: "Recommend expand, pause, or link to other Studio/Business work." },
      ],
    },
    process: {
      ko: [
        { t: "BRIEF", d: "목표·제약·참고 자료" },
        { t: "SCOPE", d: "실험 범위·일정·견적 합의" },
        { t: "EXPLORE", d: "콘셉트·비주얼 실험" },
        { t: "REVIEW", d: "결과·다음 단계 정리" },
      ],
      en: [
        { t: "BRIEF", d: "Goals, constraints, references" },
        { t: "SCOPE", d: "Agree experiment scope, timeline, quote" },
        { t: "EXPLORE", d: "Concept and visual experiments" },
        { t: "REVIEW", d: "Summarize results and next steps" },
      ],
    },
    deliverables: {
      ko: [
        { t: "Experiment Summary", d: "실험 목표·범위·결과 요약." },
        { t: "Concept Artifacts", d: "합의된 범위의 콘셉트·비주얼 산출물." },
        { t: "Next-Step Recommendation", d: "확장·Character Lab·Business 연계 제안." },
      ],
      en: [
        { t: "Experiment Summary", d: "Summary of goals, scope, and outcomes." },
        { t: "Concept Artifacts", d: "Concept/visual outputs within agreed scope." },
        { t: "Next-Step Recommendation", d: "Recommendations for expansion, Character Lab, or Business." },
      ],
    },
    faqs: {
      ko: [
        { q: "바로 구매할 수 있나요?", a: "아니요. 탐색·맞춤 프로젝트 영역이며 표준 패키지로 판매하지 않습니다." },
        { q: "어떻게 시작하나요?", a: "짧은 브리핑으로 실험 범위를 정한 뒤 별도 견적으로 진행합니다." },
        { q: "Character Lab과 다른가요?", a: "Character Lab은 캐릭터 중심 Experimental 패키지입니다. Experimental IP는 더 넓은 IP 형태 탐색입니다." },
        { q: "가격은 어떻게 정해지나요?", a: "실험 범위·기간·산출물에 따라 프로젝트별 견적입니다." },
      ],
      en: [
        { q: "Can we buy this as a package?", a: "No — exploration/custom area, not a standard product." },
        { q: "How do we start?", a: "A short brief sets experiment scope, then custom quote." },
        { q: "Different from Character Lab?", a: "Character Lab is character-focused Experimental package. Experimental IP explores broader IP forms." },
        { q: "How is price set?", a: "Per-project quote based on experiment scope, timeline, and deliverables." },
      ],
    },
  },
};
