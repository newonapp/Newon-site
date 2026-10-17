/**
 * Copy for the Business · Studio · Partnerships restructure (Oct 2026).
 *
 * Direction (owner brief, 2026-10-18):
 *  - Newon does NOT run as an outsourcing web/app agency, design agency or per-client contractor.
 *  - Business = Newon's own software products and automation solutions, sold repeatedly (subscription,
 *    licence, platform-linked revenue). Studio = Newon's own digital products, design assets and product R&D.
 *    Partnerships = one front door for individuals, sellers, companies, institutions and partners.
 *  - Never present an unreleased product as on sale, an unbuilt integration as connected, an unsigned public
 *    agreement as a track record, or investment as raised / officially open.
 *
 * Status words used on every product row (keep them honest):
 *   live      — publicly available today (only what the site already lists as live)
 *   preparing — being prepared; adoption talks only, not on sale
 *   planning  — direction set, not built yet
 * Body copy exists in Korean (source) and English (meaning-checked). Other locales use the English body,
 * the same convention as the rest of Newon Studio; menu labels are localized in locales/*.json.
 */

export const STATUS = {
  ko: { live: "공개 중", preparing: "준비 중 · 도입 상담 가능", planning: "기획 중" },
  en: { live: "Available now", preparing: "In preparation · adoption talks open", planning: "In planning" },
};

/** Labels for the product detail rows (bp-explore). */
export const ROW_LABELS = {
  ko: { who: "대상 고객", problem: "해결하는 문제", features: "주요 기능", status: "제공 상태", how: "도입 방식", ask: "문의", askBtn: "도입 문의 →", partnerBtn: "협력 문의 →" },
  en: { who: "Who it is for", problem: "Problem it solves", features: "Key features", status: "Status", how: "How it is adopted", ask: "Ask", askBtn: "Adoption inquiry →", partnerBtn: "Partnership inquiry →" },
};

/** Business inquiry types added to /business/inquiry/ (value → serviceMap key). */
export const BIZ_INQUIRY_TYPES = [
  { key: "product-adoption", value: "PRODUCT / Product adoption", ko: "제품 도입 문의", en: "Product adoption" },
  { key: "enterprise-solution", value: "PRODUCT / Enterprise solution", ko: "기업 솔루션 문의", en: "Enterprise solution" },
  { key: "automation-product", value: "PRODUCT / Automation product", ko: "자동화 상품 문의", en: "Automation product" },
  { key: "sales-distribution", value: "PRODUCT / Sales & distribution", ko: "판매·유통 협력", en: "Sales & distribution" },
  { key: "platform-integration", value: "PRODUCT / Platform integration", ko: "플랫폼 연계 문의", en: "Platform integration" },
  { key: "license", value: "PRODUCT / License", ko: "라이선스 문의", en: "Licensing" },
];

export const bizAsk = (key, source) => `business/inquiry/?category=Business&type=${key}&source=${source}#inquiry`;
export const partnerAsk = (type, source) => `partnerships/inquiry/?type=${type}&source=${source}#inquiry`;

/** The six flagship platforms (shared by Business · Platform Integration and Partnerships · Platform). */
export const PLATFORMS = [
  { id: "babylog", name: "BABYLOG", page: "portfolio/babylog/" },
  { id: "petlog", name: "PETLOG", page: "portfolio/petlog/" },
  { id: "myworld", name: "MY WORLD", page: "portfolio/myworld/" },
  { id: "shareon", name: "SHAREON", page: "shareon/" },
  { id: "livon", name: "LIVON", page: "lifestage/" },
  { id: "ongil", name: "ONGIL", page: "ongil/" },
];

/* ------------------------------------------------------------------------------------------------
 * Menus (also the order of the section cards at the foot of each page)
 * href is relative to /{lang}/
 * ---------------------------------------------------------------------------------------------- */
export const MENUS = {
  business: [
    { id: "overview", name: "Overview", href: "business/", koTitle: "개요", ko: "자체 제품 중심 사업 구조", en: "How the product business works" },
    { id: "automation", name: "Automation", href: "business/automation/", koTitle: "자동화", ko: "반복 업무를 줄이는 자동화 제품", en: "Automation products for repeated work" },
    { id: "solutions", name: "Solutions", href: "business/solutions/", koTitle: "솔루션", ko: "공통 제품 기반 솔루션", en: "Solutions on shared products" },
    { id: "digital-products", name: "Digital Products", href: "business/digital-products/", koTitle: "디지털 상품", ko: "구독 소프트웨어·도구·키트", en: "Software, tools and kits" },
    { id: "platforms", name: "Platform Integration", href: "business/platforms/", koTitle: "플랫폼 연계", ko: "6개 플랫폼과 연결되는 기회", en: "Opportunities across six platforms" },
    { id: "inquiry", name: "Business Inquiry", href: "business/inquiry/", koTitle: "비즈니스 문의", ko: "도입·라이선스·유통 문의", en: "Adoption, licensing, distribution" },
  ],
  studio: [
    { id: "overview", name: "Overview", href: "studio/", ko: "Studio의 목적과 제품 철학", en: "Purpose and product philosophy" },
    { id: "digital", name: "Digital Products", href: "studio/digital/", ko: "자체 디지털 제품과 리소스", en: "Own digital products and resources" },
    { id: "design-systems", name: "Design Systems", href: "studio/design-systems/", ko: "제품 디자인 원칙과 시스템", en: "Product design principles and systems" },
    { id: "projects", name: "Projects", href: "studio/projects/", ko: "직접 기획·개발하는 프로젝트", en: "Projects we plan and build ourselves" },
    { id: "partnerships", name: "Partnerships", href: "studio/partnerships/", ko: "제품 유통·라이선스 협력", en: "Distribution and licensing partnerships" },
  ],
  partnerships: [
    { id: "overview", name: "Partnership Overview", href: "partnerships/", koTitle: "파트너십 개요", ko: "협력 대상·방식·절차", en: "Who, how and the process" },
    { id: "corporate", name: "Corporate Partnerships", href: "partnerships/corporate/", koTitle: "기업 파트너십", ko: "기업·브랜드 제휴", en: "Companies and brands" },
    { id: "individuals", name: "Individuals & Sellers", href: "partnerships/individuals/", koTitle: "개인·판매자", ko: "개인·판매자·크리에이터", en: "Individuals, sellers, creators" },
    { id: "public", name: "Public & Institutional", href: "partnerships/public/", koTitle: "공공·기관", ko: "공공기관·지자체·교육·복지", en: "Public bodies, education, welfare" },
    { id: "platforms", name: "Platform Partnerships", href: "partnerships/platforms/", koTitle: "플랫폼 파트너십", ko: "6개 플랫폼별 협력", en: "Partnering on each platform" },
    { id: "strategic", name: "Strategic Partnerships", href: "partnerships/strategic/", koTitle: "전략적 파트너십", ko: "장기 제휴·기술·글로벌", en: "Long-term, technology, global" },
    { id: "inquiry", name: "Partnership Inquiry", href: "partnerships/inquiry/", koTitle: "제휴 문의", ko: "통합 제휴 문의", en: "One partnership inquiry form" },
  ],
};

export const SECTION_NAME = { business: "Business", studio: "Studio", partnerships: "Partnerships" };
export const OTHER_LABEL = {
  ko: { business: "NEWON BUSINESS", studio: "NEWON STUDIO", partnerships: "NEWON PARTNERSHIPS" },
  en: { business: "NEWON BUSINESS", studio: "NEWON STUDIO", partnerships: "NEWON PARTNERSHIPS" },
};

/** Six-step partnership process (information only; nothing is signed automatically). */
export const PARTNER_PROCESS = {
  ko: {
    label: "협력 절차",
    note: "각 단계는 안내용이며, 계약·협약은 양측 검토와 서면 합의로만 진행됩니다.",
    steps: [
      ["제안 접수", "문의 양식이나 이메일로 제안을 보내 주세요."],
      ["내부 검토", "관련 사업 담당이 제안 내용과 적합성을 검토합니다."],
      ["미팅 및 사업 협의", "필요하면 미팅으로 목표와 범위를 확인합니다."],
      ["협력 조건 조율", "역할, 기간, 수익 배분 등 조건을 정리합니다."],
      ["계약·협약", "합의된 내용으로 계약 또는 협약을 체결합니다."],
      ["협력 진행", "합의한 일정과 방식으로 협력을 시작합니다."],
    ],
  },
  en: {
    label: "HOW IT WORKS",
    note: "These steps are for orientation only. Agreements are made only after review by both sides and in writing.",
    steps: [
      ["Proposal", "Send your proposal through the form or by email."],
      ["Internal review", "The relevant business team reviews the proposal and fit."],
      ["Meeting", "If useful, we meet to confirm goals and scope."],
      ["Terms", "We work out roles, duration and revenue sharing."],
      ["Agreement", "We sign a contract or agreement on what was agreed."],
      ["Partnership", "We start on the agreed schedule and terms."],
    ],
  },
};

/* ------------------------------------------------------------------------------------------------
 * Pages. Each page: section, slug (path under /{lang}/), menu (active menu id), and ko/en bodies.
 * Body: title, desc, eyebrowName, h1 (may contain <br />), lead, primary/ghost [label, href],
 *       blocks: list | products | steps | cards | process | faq | form ; cta {label,title,lead,btn}
 * ---------------------------------------------------------------------------------------------- */

const P = (key) => bizAsk(key, "business");

export const PAGES = [
  /* ============================== BUSINESS ============================== */
  {
    section: "business",
    slug: "business/automation",
    menu: "automation",
    ko: {
      title: "Automation | Newon Business",
      desc: "Newon이 자체 개발하는 업무·고객 응대·주문·예약·보고 자동화 제품군. 출시 전 제품은 도입 상담만 받습니다.",
      h1: "반복은 제품이 맡고,<br />사람은 성장에 집중합니다.",
      lead: "Newon Business의 자동화 제품군입니다. 고객마다 새로 만들어 주는 구축 대행이 아니라, 같은 문제를 가진 여러 사업자가 함께 쓰는 공통 제품으로 준비하고 있습니다.",
      primary: ["자동화 상품 문의 →", P("automation-product")],
      ghost: ["제품 보기 ↓", "#products"],
      blocks: [
        {
          type: "products",
          id: "products",
          label: "자동화 제품군",
          note: "아래 제품은 모두 출시 전입니다. 출시 일정과 가격은 확정되면 안내하며, 지금은 도입 상담만 받습니다.",
          items: [
            { tab: "WORK", name: "업무 자동화", summary: "팀이 매일 하는 업무 흐름을 규칙으로 정리해 자동으로 처리합니다.", who: "업무 흐름이 정해져 있는 소규모 팀과 기업", problem: "같은 확인·전달·기록을 사람이 반복하는 시간", features: "업무 규칙 설정 · 단계별 알림 · 처리 기록", status: "preparing", how: "구독형 제품으로 준비 중이며, 출시 전에는 도입 상담만 진행합니다.", ask: "automation-product" },
            { tab: "REPEAT", name: "반복 작업 자동화", summary: "복사·붙여넣기, 파일 정리 같은 단순 반복 작업을 줄입니다.", who: "스프레드시트와 여러 도구를 오가며 일하는 사업자", problem: "수작업 입력과 옮겨 적기에서 생기는 실수와 시간", features: "입력 정리 · 파일·데이터 이동 · 예약 실행", status: "preparing", how: "공통 템플릿 기반으로 제공할 예정입니다.", ask: "automation-product" },
            { tab: "CS", name: "고객 응대 자동화", summary: "자주 오는 문의를 분류하고 답변 초안을 준비합니다.", who: "문의가 많은 판매자·서비스 사업자", problem: "같은 질문에 반복해서 답하는 응대 부담", features: "문의 분류 · 답변 초안 · 담당자 전달", status: "preparing", how: "구독형 제품으로 준비 중입니다. 사람이 최종 확인하는 방식을 기본으로 합니다.", ask: "automation-product" },
            { tab: "ORDER", name: "판매·주문 운영 자동화", summary: "주문 확인부터 출고 안내까지 판매 운영의 반복 단계를 줄입니다.", who: "온라인 판매자와 소규모 쇼핑몰 운영자", problem: "주문·재고·배송 안내를 손으로 맞추는 운영 시간", features: "주문 정리 · 상태 알림 · 운영 요약", status: "planning", how: "판매자용 공통 제품으로 기획 중입니다.", ask: "automation-product" },
            { tab: "BOOKING", name: "예약·일정 자동화", summary: "예약 접수, 확인, 일정 알림을 한 흐름으로 정리합니다.", who: "예약으로 운영하는 매장·강의·상담 사업자", problem: "전화·메신저로 흩어진 예약과 노쇼 관리", features: "예약 접수 · 확인 알림 · 일정 관리", status: "preparing", how: "구독형 제품으로 준비 중입니다.", ask: "automation-product" },
            { tab: "REPORT", name: "데이터 정리 및 보고 자동화", summary: "흩어진 데이터를 모아 정기 보고서로 정리합니다.", who: "주간·월간 보고서를 수작업으로 만드는 팀", problem: "보고서 작성에 반복적으로 드는 시간", features: "데이터 수집 · 정리 규칙 · 정기 보고서", status: "preparing", how: "보고서 템플릿과 함께 제공할 예정입니다.", ask: "automation-product" },
            { tab: "AI", name: "AI 기반 업무 자동화", summary: "요약·분류·초안 작성처럼 판단이 필요한 업무를 AI로 돕습니다.", who: "문서·콘텐츠·문의 처리량이 많은 팀", problem: "읽고, 나누고, 초안을 쓰는 데 드는 시간", features: "요약 · 분류 · 초안 작성 · 사람 확인 단계", status: "preparing", how: "Newon AI와 연계한 제품으로 준비 중입니다.", ask: "automation-product" },
            { tab: "PLATFORM", name: "플랫폼 연계 자동화", summary: "Newon의 6개 플랫폼과 사업 운영을 잇는 자동화를 기획합니다.", who: "Newon 플랫폼 이용자와 연계하려는 사업자·기관", problem: "플랫폼과 사업 운영 사이의 수동 연결", features: "플랫폼별 연계 시나리오 (기획 단계)", status: "planning", how: "실제 API·계정 연동은 아직 구현되지 않았습니다. 연계 가능성을 함께 검토합니다.", ask: "platform-integration" },
          ],
        },
        {
          type: "faq",
          items: [
            ["고객사에 맞춰 새로 만들어 주나요?", "아니요. Newon은 고객별 맞춤 구축을 대행하지 않습니다. 같은 문제를 가진 여러 사업자가 함께 쓰는 공통 제품을 만들고, 설정과 도입을 돕습니다."],
            ["지금 바로 구매할 수 있나요?", "아직 판매 중인 자동화 제품은 없습니다. 출시 전에는 도입 상담만 받으며, 출시 일정과 가격은 확정되면 안내합니다."],
          ],
        },
      ],
      cta: { label: "AUTOMATION", title: "반복되는 업무를 알려 주세요.", lead: "어떤 반복이 가장 큰지 알려 주시면 준비 중인 제품과 맞는지 확인해 드립니다.", btn: ["자동화 상품 문의 →", P("automation-product")] },
    },
    en: {
      title: "Automation | Newon Business",
      desc: "Newon's own automation products for work, customer replies, orders, bookings and reports. Unreleased products take adoption talks only.",
      h1: "Products take the repetition,<br />people take on growth.",
      lead: "This is Newon Business's automation product line. It is not a build service for each client: we are preparing shared products that many businesses with the same problem can use.",
      primary: ["Ask about automation →", P("automation-product")],
      ghost: ["See products ↓", "#products"],
      blocks: [
        {
          type: "products",
          id: "products",
          label: "AUTOMATION PRODUCTS",
          note: "None of these products has launched yet. Launch timing and pricing will be announced when confirmed; for now we take adoption talks only.",
          items: [
            { tab: "WORK", name: "Work automation", summary: "Turns a team's daily workflow into rules that run on their own.", who: "Small teams and companies with set workflows", problem: "Time spent repeating the same checks, handoffs and records", features: "Workflow rules · step alerts · activity log", status: "preparing", how: "Being prepared as a subscription product; adoption talks only before launch.", ask: "automation-product" },
            { tab: "REPEAT", name: "Repetitive task automation", summary: "Cuts simple repeated tasks such as copy-paste and file sorting.", who: "Businesses juggling spreadsheets and several tools", problem: "Errors and time from manual entry and re-typing", features: "Input clean-up · file and data moves · scheduled runs", status: "preparing", how: "To be offered on shared templates.", ask: "automation-product" },
            { tab: "CS", name: "Customer reply automation", summary: "Sorts frequent questions and prepares reply drafts.", who: "Sellers and service businesses with many inquiries", problem: "Answering the same questions again and again", features: "Inquiry sorting · reply drafts · handoff to staff", status: "preparing", how: "Being prepared as a subscription product, with a person approving the final reply by default.", ask: "automation-product" },
            { tab: "ORDER", name: "Sales and order operations", summary: "Reduces the repeated steps from order check to shipping notice.", who: "Online sellers and small shop operators", problem: "Hours spent matching orders, stock and delivery notices by hand", features: "Order sorting · status alerts · daily summary", status: "planning", how: "Planned as a shared product for sellers.", ask: "automation-product" },
            { tab: "BOOKING", name: "Booking and schedule automation", summary: "Brings booking, confirmation and reminders into one flow.", who: "Shops, classes and consultants that run on bookings", problem: "Bookings scattered across calls and messengers, and no-shows", features: "Booking intake · confirmations · schedule view", status: "preparing", how: "Being prepared as a subscription product.", ask: "automation-product" },
            { tab: "REPORT", name: "Data and report automation", summary: "Collects scattered data into regular reports.", who: "Teams building weekly or monthly reports by hand", problem: "Time spent on recurring reports", features: "Data collection · clean-up rules · scheduled reports", status: "preparing", how: "To be offered with report templates.", ask: "automation-product" },
            { tab: "AI", name: "AI work automation", summary: "Uses AI for judgment-heavy work such as summaries, sorting and drafts.", who: "Teams handling many documents, content or inquiries", problem: "Time spent reading, sorting and drafting", features: "Summaries · sorting · drafts · human review step", status: "preparing", how: "Being prepared together with Newon AI.", ask: "automation-product" },
            { tab: "PLATFORM", name: "Platform-linked automation", summary: "Planning automation that links business operations to Newon's six platforms.", who: "Businesses and institutions working with Newon platform users", problem: "Manual links between a platform and day-to-day operations", features: "Per-platform scenarios (planning stage)", status: "planning", how: "No API or account integration is built yet; we review the possibilities together.", ask: "platform-integration" },
          ],
        },
        {
          type: "faq",
          items: [
            ["Do you build it from scratch for each client?", "No. Newon does not do custom builds for clients. We make shared products that many businesses with the same problem can use, and help with setup and adoption."],
            ["Can I buy now?", "No automation product is on sale yet. Before launch we take adoption talks only; launch timing and pricing will be announced when confirmed."],
          ],
        },
      ],
      cta: { label: "AUTOMATION", title: "Tell us what you repeat.", lead: "Tell us which repetition costs you most and we will check whether a product we are preparing fits.", btn: ["Ask about automation →", P("automation-product")] },
    },
  },
  {
    section: "business",
    slug: "business/solutions",
    menu: "solutions",
    ko: {
      title: "Solutions | Newon Business",
      desc: "개인 사업자, 판매자, 기업, 기관을 위한 Newon의 공통 제품 기반 솔루션. 고객별 외주 개발이 아닙니다.",
      h1: "같은 제품 위에서,<br />각자의 사업에 맞게.",
      lead: "Newon 솔루션은 고객마다 새로 개발하지 않습니다. 공통 제품을 바탕으로 사업 규모와 업종에 맞는 구성과 설정을 제공합니다.",
      primary: ["기업 솔루션 문의 →", P("enterprise-solution")],
      ghost: ["솔루션 보기 ↓", "#solutions"],
      blocks: [
        {
          type: "products",
          id: "solutions",
          label: "대상별 솔루션",
          note: "솔루션은 아래 자동화 제품과 디지털 제품을 조합해 구성합니다. 모두 출시 전이며 도입 상담만 받습니다.",
          items: [
            { tab: "SOLO", name: "개인 사업자 솔루션", summary: "혼자 운영하는 사업자를 위한 기본 운영 묶음입니다.", who: "1인 사업자, 프리랜서", problem: "운영·응대·정리를 혼자 감당하는 부담", features: "예약·일정 · 고객 응대 · 간단 보고", status: "preparing", how: "구독형 묶음으로 준비 중입니다.", ask: "enterprise-solution" },
            { tab: "SMALL", name: "소규모 사업자 솔루션", summary: "작은 팀이 함께 쓰는 운영 묶음입니다.", who: "직원 2~20명 규모의 매장·사무실", problem: "직원 간 업무 전달과 기록 누락", features: "업무 자동화 · 일정 공유 · 운영 보고", status: "preparing", how: "구독형 묶음으로 준비 중입니다.", ask: "enterprise-solution" },
            { tab: "SELLER", name: "판매자 솔루션", summary: "온라인 판매 운영의 반복을 줄이는 묶음입니다.", who: "온라인 판매자, 소규모 브랜드", problem: "주문·문의·재고 운영에 쓰는 시간", features: "주문 운영 · 고객 응대 · 판매 요약", status: "planning", how: "판매자용 공통 제품으로 기획 중입니다. 실제 거래 기능은 SHAREON 등 해당 앱에서 제공할 예정입니다.", ask: "enterprise-solution" },
            { tab: "COMPANY", name: "기업 운영 솔루션", summary: "부서 단위 반복 업무를 줄이는 기업용 구성입니다.", who: "반복 보고·승인·전달 업무가 많은 기업", problem: "부서 간 수작업 연결과 정기 보고", features: "업무 규칙 · 데이터 보고 · AI 업무 지원", status: "preparing", how: "공통 제품의 기업용 구성과 라이선스로 준비 중입니다.", ask: "enterprise-solution" },
            { tab: "PUBLIC", name: "기관 운영 솔루션", summary: "공공·교육·복지 기관의 안내와 운영을 돕는 구성입니다.", who: "지자체, 교육기관, 복지기관", problem: "반복 안내와 정보 정리 업무", features: "생활정보 안내 · 운영 보고 (기획 단계)", status: "planning", how: "기획 중입니다. 기관 협력은 Partnerships에서 함께 검토합니다.", ask: "enterprise-solution" },
            { tab: "PLATFORM", name: "플랫폼 연계 솔루션", summary: "Newon 6개 플랫폼 이용자와 사업을 잇는 구성입니다.", who: "육아·반려·생활·시니어 분야 사업자", problem: "플랫폼 이용자에게 닿는 경로 부족", features: "플랫폼별 협력 시나리오 (기획 단계)", status: "planning", how: "연동은 아직 구현되지 않았습니다. Platform Integration에서 분야별 기회를 확인하세요.", ask: "platform-integration" },
          ],
        },
      ],
      cta: { label: "SOLUTIONS", title: "사업 규모와 업종을 알려 주세요.", lead: "준비 중인 솔루션 중 맞는 구성이 있는지 확인해 드립니다.", btn: ["기업 솔루션 문의 →", P("enterprise-solution")] },
    },
    en: {
      title: "Solutions | Newon Business",
      desc: "Newon solutions for sole traders, sellers, companies and institutions, built on shared products rather than custom client development.",
      h1: "One product base,<br />set up for each business.",
      lead: "Newon does not develop a new solution for each client. We configure shared products to fit the size and type of each business.",
      primary: ["Ask about solutions →", P("enterprise-solution")],
      ghost: ["See solutions ↓", "#solutions"],
      blocks: [
        {
          type: "products",
          id: "solutions",
          label: "SOLUTIONS BY CUSTOMER",
          note: "Solutions combine the automation and digital products on these pages. None has launched yet; we take adoption talks only.",
          items: [
            { tab: "SOLO", name: "Sole trader solution", summary: "A basic operations bundle for people running a business alone.", who: "Sole traders and freelancers", problem: "Handling operations, replies and admin alone", features: "Bookings · customer replies · simple reports", status: "preparing", how: "Being prepared as a subscription bundle.", ask: "enterprise-solution" },
            { tab: "SMALL", name: "Small business solution", summary: "An operations bundle for small teams.", who: "Shops and offices with 2–20 people", problem: "Lost handoffs and records between staff", features: "Work automation · shared schedule · operations report", status: "preparing", how: "Being prepared as a subscription bundle.", ask: "enterprise-solution" },
            { tab: "SELLER", name: "Seller solution", summary: "A bundle that cuts repeated online-selling work.", who: "Online sellers and small brands", problem: "Time spent on orders, questions and stock", features: "Order operations · customer replies · sales summary", status: "planning", how: "Planned as a shared product for sellers. Actual trading will happen in apps such as SHAREON.", ask: "enterprise-solution" },
            { tab: "COMPANY", name: "Company operations solution", summary: "A company set-up that reduces department-level repetition.", who: "Companies with recurring reports, approvals and handoffs", problem: "Manual links between departments and recurring reports", features: "Workflow rules · data reports · AI work support", status: "preparing", how: "Being prepared as a company configuration and licence of the shared products.", ask: "enterprise-solution" },
            { tab: "PUBLIC", name: "Institution solution", summary: "A set-up that helps public, education and welfare bodies with guidance and operations.", who: "Local governments, schools, welfare organizations", problem: "Repeated guidance and information upkeep", features: "Everyday information guidance · operations reports (planning)", status: "planning", how: "In planning. Institutional partnerships are reviewed through Partnerships.", ask: "enterprise-solution" },
            { tab: "PLATFORM", name: "Platform-linked solution", summary: "A set-up that connects businesses with users of Newon's six platforms.", who: "Businesses in parenting, pets, everyday life and senior care", problem: "Few ways to reach platform users", features: "Per-platform partnership scenarios (planning)", status: "planning", how: "No integration is built yet. See Platform Integration for each field.", ask: "platform-integration" },
          ],
        },
      ],
      cta: { label: "SOLUTIONS", title: "Tell us your size and field.", lead: "We will check whether one of the solutions we are preparing fits.", btn: ["Ask about solutions →", P("enterprise-solution")] },
    },
  },
  {
    section: "business",
    slug: "business/digital-products",
    menu: "digital-products",
    ko: {
      title: "Digital Products | Newon Business",
      desc: "Newon의 구독형 소프트웨어, 업무용 디지털 도구, 템플릿, 운영 키트, 자동화 패키지, 디지털 가이드. 준비되지 않은 상품은 판매 중으로 표시하지 않습니다.",
      h1: "바로 쓰는 도구부터<br />구독형 소프트웨어까지.",
      lead: "Newon이 직접 만드는 디지털 상품입니다. 지금 공개된 것과 준비 중인 것을 구분해 안내합니다.",
      primary: ["제품 도입 문의 →", P("product-adoption")],
      ghost: ["상품 보기 ↓", "#products"],
      blocks: [
        {
          type: "products",
          id: "products",
          label: "디지털 상품",
          items: [
            { tab: "SAAS", name: "구독형 소프트웨어", summary: "자동화 제품군을 구독형으로 제공할 예정입니다.", who: "반복 업무를 줄이려는 사업자와 팀", problem: "필요한 기능만 꾸준히 쓰기 어려운 비용 구조", features: "Automation 제품군의 구독형 제공", status: "preparing", how: "구독 조건은 출시 시 안내합니다.", ask: "product-adoption", more: ["Automation 보기", "business/automation/"] },
            { tab: "TOOLS", name: "업무용 디지털 도구", summary: "QR 생성, D-day, 비밀번호 생성 등 무료 웹 도구 13종을 공개하고 있습니다.", who: "누구나", problem: "간단한 작업에 별도 프로그램을 설치하는 번거로움", features: "QR · 무작위 추첨 · 계산기 · UTM 등 13종", status: "live", how: "웹에서 바로 무료로 사용할 수 있습니다. 일부 도구는 준비 중입니다.", ask: "product-adoption", more: ["도구 보기", "tools/"] },
            { tab: "TEMPLATE", name: "템플릿", summary: "사업 기획과 제품 조사에 쓰는 템플릿을 준비하고 있습니다.", who: "사업 기획자, 1인 창업자", problem: "매번 빈 문서에서 시작하는 기획", features: "사업 계획 워크북 · 제품 조사 템플릿", status: "preparing", how: "Newon Store에서 출시할 예정입니다.", ask: "product-adoption", more: ["Store 보기", "resources/store/"] },
            { tab: "KIT", name: "운영 키트", summary: "프로젝트 시작에 필요한 문서를 묶은 Newon Project Starter Kit를 판매하고 있습니다.", who: "새 프로젝트를 시작하는 팀과 개인", problem: "시작 단계에서 빠뜨리기 쉬운 준비 항목", features: "프로젝트 시작 문서 묶음 (Store 상품 1종 공개)", status: "live", how: "Newon Store에서 구매할 수 있습니다. 앱 출시 키트 등 다른 키트는 준비 중입니다.", ask: "product-adoption", more: ["Store 보기", "resources/store/"] },
            { tab: "PACKAGE", name: "자동화 패키지", summary: "자주 쓰는 자동화 흐름을 패키지로 묶어 제공할 예정입니다.", who: "자동화를 처음 도입하는 사업자", problem: "어디서부터 자동화할지 정하기 어려움", features: "업종별 자동화 시나리오 묶음", status: "planning", how: "기획 중입니다.", ask: "automation-product" },
            { tab: "GUIDE", name: "디지털 가이드", summary: "제품 출시 체크리스트 등 실무 가이드를 준비하고 있습니다.", who: "웹·앱 출시를 준비하는 팀", problem: "출시 직전에 발견되는 누락 항목", features: "웹사이트 출시 체크리스트 · 운영 가이드", status: "preparing", how: "Newon Store에서 출시할 예정입니다.", ask: "product-adoption", more: ["Store 보기", "resources/store/"] },
          ],
        },
      ],
      cta: { label: "DIGITAL PRODUCTS", title: "대량 도입·라이선스도 문의하세요.", lead: "팀이나 기관 단위 도입, 라이선스, 유통 협력은 문의로 받습니다.", btn: ["라이선스 문의 →", P("license")] },
    },
    en: {
      title: "Digital Products | Newon Business",
      desc: "Newon's subscription software, work tools, templates, operations kits, automation packages and guides. Products that are not ready are never shown as on sale.",
      h1: "From ready-to-use tools<br />to subscription software.",
      lead: "Digital products Newon makes itself. We show clearly what is available now and what is still in preparation.",
      primary: ["Ask about adoption →", P("product-adoption")],
      ghost: ["See products ↓", "#products"],
      blocks: [
        {
          type: "products",
          id: "products",
          label: "DIGITAL PRODUCTS",
          items: [
            { tab: "SAAS", name: "Subscription software", summary: "The automation products are planned as subscriptions.", who: "Businesses and teams cutting repeated work", problem: "Paying for more than you use", features: "Automation products on subscription", status: "preparing", how: "Subscription terms will be announced at launch.", ask: "product-adoption", more: ["See Automation", "business/automation/"] },
            { tab: "TOOLS", name: "Work tools", summary: "13 free web tools are available now, including a QR maker, D-day counter and password generator.", who: "Anyone", problem: "Installing software for small tasks", features: "QR · random picker · calculators · UTM builder and more (13)", status: "live", how: "Free to use on the web. A few more tools are in preparation.", ask: "product-adoption", more: ["See tools", "tools/"] },
            { tab: "TEMPLATE", name: "Templates", summary: "Templates for business planning and product research are in preparation.", who: "Planners and solo founders", problem: "Starting every plan from a blank page", features: "Business planning workbook · product research template", status: "preparing", how: "To be released in the Newon Store.", ask: "product-adoption", more: ["See Store", "resources/store/"] },
            { tab: "KIT", name: "Operations kits", summary: "The Newon Project Starter Kit, a bundle of project kickoff documents, is on sale now.", who: "Teams and individuals starting a project", problem: "Kickoff items that are easy to miss", features: "Project kickoff document bundle (one Store product available)", status: "live", how: "Available in the Newon Store. Other kits, such as the app launch kit, are in preparation.", ask: "product-adoption", more: ["See Store", "resources/store/"] },
            { tab: "PACKAGE", name: "Automation packages", summary: "Common automation flows bundled as packages.", who: "Businesses adopting automation for the first time", problem: "Not knowing where to start", features: "Automation scenarios by industry", status: "planning", how: "In planning.", ask: "automation-product" },
            { tab: "GUIDE", name: "Digital guides", summary: "Practical guides such as launch checklists are in preparation.", who: "Teams preparing a web or app launch", problem: "Gaps found right before launch", features: "Website launch checklist · operations guide", status: "preparing", how: "To be released in the Newon Store.", ask: "product-adoption", more: ["See Store", "resources/store/"] },
          ],
        },
      ],
      cta: { label: "DIGITAL PRODUCTS", title: "Ask about volume adoption and licensing.", lead: "We take inquiries about team or institution adoption, licensing and distribution.", btn: ["Ask about licensing →", P("license")] },
    },
  },
  {
    section: "business",
    slug: "business/platforms",
    menu: "platforms",
    ko: {
      title: "Platform Integration | Newon Business",
      desc: "BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL — Newon 6개 플랫폼과 연결되는 비즈니스 기회. 실제 연동이 구현되지 않은 분야는 연동 완료로 표시하지 않습니다.",
      h1: "6개 플랫폼과<br />연결되는 비즈니스.",
      lead: "Newon은 육아, 반려동물, 콘텐츠, 거래, 생활정보, 시니어 돌봄 분야의 플랫폼을 직접 운영·개발합니다. 각 분야에서 사업자와 함께 만들 수 있는 기회를 소개합니다.",
      primary: ["플랫폼 연계 문의 →", P("platform-integration")],
      ghost: ["분야 보기 ↓", "#platforms"],
      blocks: [
        {
          type: "products",
          id: "platforms",
          label: "플랫폼별 연계 분야",
          note: "현재 외부 사업자와의 API·계정 연동은 구현되어 있지 않습니다. 아래는 연계를 검토할 수 있는 분야입니다.",
          items: [
            { tab: "BABYLOG", name: "BABYLOG · 육아·가족", summary: "아기 기록 앱 BABYLOG와 함께하는 육아·가족 분야 협력입니다.", who: "육아용품·교육·가족 서비스 사업자", problem: "부모에게 필요한 순간에 닿기 어려움", features: "육아 정보·제품 협력 검토", status: "planning", how: "협력 방식과 범위를 함께 검토합니다. 연동은 구현되지 않았습니다.", ask: "platform-integration", more: ["BABYLOG 보기", "portfolio/babylog/"] },
            { tab: "PETLOG", name: "PETLOG · 반려동물", summary: "반려동물 케어 앱 PETLOG와 함께하는 반려동물 분야 협력입니다.", who: "반려동물 용품·병원·케어 서비스 사업자", problem: "보호자의 케어 기록과 서비스 사이의 단절", features: "반려 케어 정보·제품 협력 검토", status: "planning", how: "협력 방식과 범위를 함께 검토합니다. 연동은 구현되지 않았습니다.", ask: "platform-integration", more: ["PETLOG 보기", "portfolio/petlog/"] },
            { tab: "MY WORLD", name: "MY WORLD · 콘텐츠·개인화", summary: "지도 기반 기록 앱 MY WORLD와 함께하는 콘텐츠·여행 분야 협력입니다.", who: "여행·지역·콘텐츠 사업자", problem: "개인의 경험 기록과 콘텐츠가 따로 노는 문제", features: "지역·여행 콘텐츠 협력 검토", status: "planning", how: "협력 방식과 범위를 함께 검토합니다. 연동은 구현되지 않았습니다.", ask: "platform-integration", more: ["MY WORLD 보기", "portfolio/myworld/"] },
            { tab: "SHAREON", name: "SHAREON · 개인·기업 거래", summary: "개발 중인 공유 마켓플레이스 SHAREON의 개인·기업 참여 분야입니다.", who: "물건·공간·서비스를 빌려주려는 개인과 기업", problem: "유휴 자산을 나눌 경로 부족", features: "입점·참여 방식 검토 (예약·결제·정산은 미운영)", status: "planning", how: "SHAREON은 개발 중이며 실제 거래 기능은 운영되지 않습니다.", ask: "platform-integration", more: ["SHAREON 보기", "shareon/"] },
            { tab: "LIVON", name: "LIVON · 생애주기·생활정보", summary: "생애주기별 생활정보 서비스 LIVON과 함께하는 정보 협력입니다.", who: "생활·금융·교육 정보 제공 기관과 사업자", problem: "필요한 시기에 맞는 정보 전달", features: "생활정보 콘텐츠·공공정보 협력 검토", status: "planning", how: "협력 방식과 범위를 함께 검토합니다. 연동은 구현되지 않았습니다.", ask: "platform-integration", more: ["LIVON 보기", "lifestage/"] },
            { tab: "ONGIL", name: "ONGIL · 시니어·돌봄", summary: "시니어 일상 서비스 ONGIL과 함께하는 돌봄 분야 협력입니다.", who: "돌봄·건강·지역 서비스 기관과 사업자", problem: "시니어와 가족이 쓰기 쉬운 서비스 연결", features: "돌봄 정보·지역 서비스 협력 검토", status: "planning", how: "협력 방식과 범위를 함께 검토합니다. 연동은 구현되지 않았습니다.", ask: "platform-integration", more: ["ONGIL 보기", "ongil/"] },
          ],
        },
      ],
      cta: { label: "PLATFORM INTEGRATION", title: "함께할 분야를 알려 주세요.", lead: "플랫폼별 협력은 Partnerships에서도 자세히 안내합니다.", btn: ["플랫폼 연계 문의 →", P("platform-integration")] },
    },
    en: {
      title: "Platform Integration | Newon Business",
      desc: "BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON and ONGIL — business opportunities linked to Newon's six platforms. Integrations that are not built are never shown as done.",
      h1: "Business linked to<br />six Newon platforms.",
      lead: "Newon runs and builds its own platforms in parenting, pets, content, trading, everyday information and senior care. Here are the opportunities to work on them with businesses.",
      primary: ["Ask about integration →", P("platform-integration")],
      ghost: ["See fields ↓", "#platforms"],
      blocks: [
        {
          type: "products",
          id: "platforms",
          label: "FIELDS BY PLATFORM",
          note: "No API or account integration with outside businesses is built today. These are the fields where we can review a link together.",
          items: [
            { tab: "BABYLOG", name: "BABYLOG · Parenting and family", summary: "Partnerships around BABYLOG, the baby-log app.", who: "Baby products, education and family services", problem: "Reaching parents at the moment they need something", features: "Parenting information and product partnerships (review)", status: "planning", how: "We review the approach and scope together. No integration is built.", ask: "platform-integration", more: ["See BABYLOG", "portfolio/babylog/"] },
            { tab: "PETLOG", name: "PETLOG · Pets", summary: "Partnerships around PETLOG, the pet-care app.", who: "Pet products, vets and care services", problem: "A gap between owners' care records and services", features: "Pet-care information and product partnerships (review)", status: "planning", how: "We review the approach and scope together. No integration is built.", ask: "platform-integration", more: ["See PETLOG", "portfolio/petlog/"] },
            { tab: "MY WORLD", name: "MY WORLD · Content and personalization", summary: "Partnerships around MY WORLD, the map-based record app.", who: "Travel, local and content businesses", problem: "Personal records and content living apart", features: "Local and travel content partnerships (review)", status: "planning", how: "We review the approach and scope together. No integration is built.", ask: "platform-integration", more: ["See MY WORLD", "portfolio/myworld/"] },
            { tab: "SHAREON", name: "SHAREON · Trading between people and businesses", summary: "Taking part in SHAREON, the sharing marketplace in development.", who: "People and businesses lending things, spaces or services", problem: "Few ways to share idle assets", features: "Ways to join (booking, payment and settlement are not operating)", status: "planning", how: "SHAREON is in development; no trading feature is operating.", ask: "platform-integration", more: ["See SHAREON", "shareon/"] },
            { tab: "LIVON", name: "LIVON · Life stages and everyday information", summary: "Information partnerships around LIVON, the life-stage information service.", who: "Bodies and businesses providing everyday, finance or education information", problem: "Getting information to people at the right time", features: "Everyday and public information partnerships (review)", status: "planning", how: "We review the approach and scope together. No integration is built.", ask: "platform-integration", more: ["See LIVON", "lifestage/"] },
            { tab: "ONGIL", name: "ONGIL · Seniors and care", summary: "Care partnerships around ONGIL, the senior everyday-life service.", who: "Care, health and local service organizations", problem: "Services that are easy for seniors and families to use", features: "Care information and local service partnerships (review)", status: "planning", how: "We review the approach and scope together. No integration is built.", ask: "platform-integration", more: ["See ONGIL", "ongil/"] },
          ],
        },
      ],
      cta: { label: "PLATFORM INTEGRATION", title: "Tell us the field you work in.", lead: "Partnerships also covers each platform in detail.", btn: ["Ask about integration →", P("platform-integration")] },
    },
  },

  /* ============================== STUDIO ============================== */
  {
    section: "studio",
    slug: "studio/digital",
    menu: "digital",
    ko: {
      title: "Digital Products | Newon Studio",
      desc: "Newon Studio의 자체 디지털 제품, 디자인 리소스, UI 키트, 템플릿, 디지털 에셋, 라이선스 상품.",
      h1: "Newon이 직접 만드는<br />디지털 제품.",
      lead: "Studio는 고객 디자인을 대신 만들지 않습니다. Newon의 제품을 만들며 쌓은 디자인을 리소스와 상품으로 정리합니다.",
      primary: ["라이선스·유통 문의 →", partnerAsk("studio", "studio-digital")],
      ghost: ["상품 보기 ↓", "#products"],
      blocks: [
        {
          type: "products",
          id: "products",
          label: "STUDIO 디지털 제품",
          note: "판매 중인 상품은 Newon Store에 있는 것만 해당합니다. 나머지는 준비 중입니다.",
          items: [
            { tab: "PRODUCT", name: "자체 디지털 제품", summary: "Newon 앱과 웹 서비스 자체가 Studio의 첫 번째 제품입니다.", who: "Newon 서비스 이용자", problem: "—", features: "BABYLOG · PETLOG · MY WORLD 등 Newon 앱", status: "live", how: "각 앱 페이지에서 확인할 수 있습니다.", ask: "studio", more: ["Apps 보기", "apps/"] },
            { tab: "RESOURCE", name: "디자인 리소스", summary: "제품을 만들며 정리한 아이콘·레이아웃 등 리소스입니다.", who: "디자이너, 개발자", problem: "작은 팀이 매번 기본 리소스를 새로 만드는 비용", features: "아이콘 · 레이아웃 · 그래픽 리소스", status: "planning", how: "공개 범위와 라이선스 조건을 정리하고 있습니다.", ask: "studio" },
            { tab: "UI KIT", name: "UI 키트", summary: "Newon 제품에 쓰는 화면 구성 요소를 키트로 정리합니다.", who: "앱·웹을 만드는 팀", problem: "기본 화면 구성 요소를 처음부터 만드는 시간", features: "버튼 · 입력 · 목록 · 내비게이션 컴포넌트", status: "planning", how: "기획 중입니다.", ask: "studio" },
            { tab: "TEMPLATE", name: "템플릿", summary: "기획·출시 실무에 쓰는 템플릿입니다.", who: "창업자, 기획자", problem: "빈 문서에서 시작하는 기획", features: "프로젝트 시작 키트 · 기획 템플릿", status: "live", how: "Newon Project Starter Kit 1종을 Store에서 판매 중이며, 나머지는 준비 중입니다.", ask: "studio", more: ["Store 보기", "resources/store/"] },
            { tab: "ASSET", name: "디지털 에셋", summary: "디지털 상품으로 판매할 수 있는 에셋을 준비합니다.", who: "개인과 팀", problem: "—", features: "디지털 상품 에셋", status: "preparing", how: "Newon Store를 통해 순차적으로 공개할 예정입니다.", ask: "studio", more: ["Store 보기", "resources/store/"] },
            { tab: "LICENSE", name: "라이선스 상품", summary: "Studio 자산을 다른 사업에서 쓸 수 있도록 라이선스로 제공합니다.", who: "Newon 자산을 활용하려는 기업과 파트너", problem: "—", features: "디자인 자산·제품 라이선스", status: "planning", how: "라이선스 조건은 개별 협의로 정합니다.", ask: "studio" },
          ],
        },
      ],
      cta: { label: "DIGITAL PRODUCTS", title: "Studio 자산이 필요하신가요?", lead: "라이선스와 유통 협력은 Partnerships 문의로 받습니다.", btn: ["협력 문의 →", partnerAsk("studio", "studio-digital")] },
    },
    en: {
      title: "Digital Products | Newon Studio",
      desc: "Newon Studio's own digital products, design resources, UI kits, templates, digital assets and licensed products.",
      h1: "Digital products<br />made by Newon.",
      lead: "Studio does not make designs for clients. It turns the design work behind Newon's own products into resources and products.",
      primary: ["Ask about licensing →", partnerAsk("studio", "studio-digital")],
      ghost: ["See products ↓", "#products"],
      blocks: [
        {
          type: "products",
          id: "products",
          label: "STUDIO DIGITAL PRODUCTS",
          note: "Only items in the Newon Store are on sale. Everything else is in preparation.",
          items: [
            { tab: "PRODUCT", name: "Own digital products", summary: "Newon's apps and web services are Studio's first products.", who: "People using Newon services", problem: "—", features: "Newon apps such as BABYLOG, PETLOG and MY WORLD", status: "live", how: "See each app's page.", ask: "studio", more: ["See Apps", "apps/"] },
            { tab: "RESOURCE", name: "Design resources", summary: "Icons, layouts and other resources gathered while building our products.", who: "Designers and developers", problem: "Small teams remaking basic resources every time", features: "Icons · layouts · graphic resources", status: "planning", how: "We are setting the scope and licence terms.", ask: "studio" },
            { tab: "UI KIT", name: "UI kits", summary: "The interface components used in Newon products, organized as a kit.", who: "Teams building apps and websites", problem: "Building basic interface parts from scratch", features: "Buttons · inputs · lists · navigation components", status: "planning", how: "In planning.", ask: "studio" },
            { tab: "TEMPLATE", name: "Templates", summary: "Templates for planning and launch work.", who: "Founders and planners", problem: "Planning from a blank page", features: "Project starter kit · planning templates", status: "live", how: "The Newon Project Starter Kit is on sale in the Store; the rest are in preparation.", ask: "studio", more: ["See Store", "resources/store/"] },
            { tab: "ASSET", name: "Digital assets", summary: "Assets prepared for sale as digital goods.", who: "Individuals and teams", problem: "—", features: "Digital goods assets", status: "preparing", how: "To be released step by step through the Newon Store.", ask: "studio", more: ["See Store", "resources/store/"] },
            { tab: "LICENSE", name: "Licensed products", summary: "Studio assets offered under licence for use in other businesses.", who: "Companies and partners using Newon assets", problem: "—", features: "Design asset and product licences", status: "planning", how: "Licence terms are agreed case by case.", ask: "studio" },
          ],
        },
      ],
      cta: { label: "DIGITAL PRODUCTS", title: "Looking for Studio assets?", lead: "Licensing and distribution go through the Partnerships inquiry.", btn: ["Partnership inquiry →", partnerAsk("studio", "studio-digital")] },
    },
  },
  {
    section: "studio",
    slug: "studio/design-systems",
    menu: "design-systems",
    ko: {
      title: "Design Systems | Newon Studio",
      desc: "Newon 자체 제품의 디자인 원칙과 디자인 시스템 — 브랜드 일관성, 사용자 경험, 접근성, 반응형, 컴포넌트, 제품별 디자인 언어.",
      h1: "여러 제품을<br />하나의 원칙으로.",
      lead: "Newon은 여러 앱과 웹 서비스를 같은 원칙으로 설계합니다. 공개할 수 있는 원칙을 소개하며, 내부 자산과 보안 정보는 공개하지 않습니다.",
      primary: ["Projects 보기 →", "studio/projects/"],
      ghost: ["원칙 보기 ↓", "#principles"],
      blocks: [
        {
          type: "list",
          id: "principles",
          label: "디자인 원칙",
          items: [
            ["브랜드 일관성", "흑백 기반의 절제된 Newon 브랜드를 모든 제품에서 같은 방식으로 씁니다."],
            ["사용자 경험", "처음 쓰는 사람도 설명 없이 다음 단계를 알 수 있게 만듭니다."],
            ["접근성", "큰 글씨, 키보드 탐색, 충분한 대비를 기본으로 점검합니다. ONGIL·LIVON은 큰 글씨 환경을 따로 검증합니다."],
            ["반응형 디자인", "휴대폰, 태블릿, PC에서 같은 정보를 같은 순서로 보여 줍니다."],
            ["디자인 컴포넌트", "번호, 목록형 행, 구분선, 화살표처럼 반복되는 요소를 공통 컴포넌트로 관리합니다."],
            ["제품별 디자인 언어", "BABYLOG, PETLOG 같은 각 제품은 공통 원칙 위에 자기 색과 말투를 가집니다."],
          ],
        },
        {
          type: "faq",
          items: [
            ["Newon 디자인 시스템을 받을 수 있나요?", "내부 디자인 자산은 공개하지 않습니다. 공개 가능한 리소스와 UI 키트는 Digital Products에서 준비하고 있습니다."],
            ["고객사 디자인 시스템도 만들어 주나요?", "아니요. Studio는 Newon 자체 제품의 디자인 시스템만 만듭니다."],
          ],
        },
      ],
      cta: { label: "DESIGN SYSTEMS", title: "원칙이 적용된 제품을 보세요.", lead: "Newon 앱과 Studio 프로젝트에서 이 원칙이 어떻게 쓰였는지 확인할 수 있습니다.", btn: ["Projects 보기 →", "studio/projects/"] },
    },
    en: {
      title: "Design Systems | Newon Studio",
      desc: "Design principles and systems behind Newon's own products: brand consistency, user experience, accessibility, responsive design, components and per-product design language.",
      h1: "Many products,<br />one set of principles.",
      lead: "Newon designs its apps and web services on shared principles. We share the principles we can; internal assets and security information stay private.",
      primary: ["See Projects →", "studio/projects/"],
      ghost: ["See principles ↓", "#principles"],
      blocks: [
        {
          type: "list",
          id: "principles",
          label: "PRINCIPLES",
          items: [
            ["Brand consistency", "The restrained black-and-white Newon brand is used the same way in every product."],
            ["User experience", "First-time users should know the next step without explanation."],
            ["Accessibility", "Large text, keyboard navigation and enough contrast are checked by default. ONGIL and LIVON are verified separately at large text sizes."],
            ["Responsive design", "Phones, tablets and computers show the same information in the same order."],
            ["Design components", "Repeated elements such as numbers, list rows, dividers and arrows are managed as shared components."],
            ["Per-product language", "Each product, such as BABYLOG or PETLOG, has its own colour and voice on top of the shared principles."],
          ],
        },
        {
          type: "faq",
          items: [
            ["Can I get the Newon design system?", "Internal design assets are not published. Resources and UI kits we can share are being prepared under Digital Products."],
            ["Will you build a design system for my company?", "No. Studio builds design systems only for Newon's own products."],
          ],
        },
      ],
      cta: { label: "DESIGN SYSTEMS", title: "See the principles in use.", lead: "Newon apps and Studio projects show how these principles are applied.", btn: ["See Projects →", "studio/projects/"] },
    },
  },
  {
    section: "studio",
    slug: "studio/projects",
    menu: "projects",
    ko: {
      title: "Projects | Newon Studio",
      desc: "Newon이 직접 기획하고 개발하는 자체 프로젝트 — 자체 제품 연구, UX 개선, 디자인 실험, 디지털 제품 개발, 플랫폼 경험 개선.",
      h1: "직접 기획하고,<br />직접 만듭니다.",
      lead: "Studio Projects는 고객 의뢰가 아니라 Newon이 스스로 정한 과제입니다. 제품을 연구하고, 실험하고, 개선합니다.",
      primary: ["Newon 앱 보기 →", "apps/"],
      ghost: ["프로젝트 보기 ↓", "#projects"],
      blocks: [
        {
          type: "rows",
          id: "projects",
          label: "프로젝트 영역",
          items: [
            ["자체 제품 연구", "BABYLOG, PETLOG 등 Newon 앱의 다음 방향을 연구합니다.", "apps/"],
            ["UX 개선", "이용 흐름을 다시 보고 더 쉬운 경로를 만듭니다.", "studio/design-systems/"],
            ["디자인 실험", "새 화면 구성과 표현 방식을 작게 시험합니다.", "studio/design-systems/"],
            ["디지털 제품 개발", "도구, 템플릿, 키트 같은 디지털 상품을 개발합니다.", "studio/digital/"],
            ["플랫폼 경험 개선", "LIVON, ONGIL 등 플랫폼의 웹 경험을 개선합니다.", "lifestage/"],
          ],
        },
      ],
      cta: { label: "PROJECTS", title: "함께 만들고 싶은 제품이 있나요?", lead: "공동 제품 기획과 자산 협력은 Studio Partnerships에서 안내합니다.", btn: ["Studio Partnerships →", "studio/partnerships/"] },
    },
    en: {
      title: "Projects | Newon Studio",
      desc: "Projects Newon plans and builds itself: product research, UX improvement, design experiments, digital product development and platform experience.",
      h1: "We plan it.<br />We build it.",
      lead: "Studio Projects are not client commissions. They are work Newon chooses for itself: researching, testing and improving its products.",
      primary: ["See Newon apps →", "apps/"],
      ghost: ["See projects ↓", "#projects"],
      blocks: [
        {
          type: "rows",
          id: "projects",
          label: "PROJECT AREAS",
          items: [
            ["Product research", "Researching where Newon apps such as BABYLOG and PETLOG go next.", "apps/"],
            ["UX improvement", "Re-examining user flows and making simpler paths.", "studio/design-systems/"],
            ["Design experiments", "Small tests of new layouts and expressions.", "studio/design-systems/"],
            ["Digital product development", "Building tools, templates and kits.", "studio/digital/"],
            ["Platform experience", "Improving the web experience of platforms such as LIVON and ONGIL.", "lifestage/"],
          ],
        },
      ],
      cta: { label: "PROJECTS", title: "A product to build together?", lead: "Joint product planning and asset partnerships are covered by Studio Partnerships.", btn: ["Studio Partnerships →", "studio/partnerships/"] },
    },
  },
  {
    section: "studio",
    slug: "studio/partnerships",
    menu: "partnerships",
    ko: {
      title: "Partnerships | Newon Studio",
      desc: "Newon Studio의 디지털 제품 유통, 제품 라이선스, 공동 제품 기획, 기술·디자인 자산 협력, 플랫폼 연계 협력.",
      h1: "Studio의 제품과 자산으로<br />함께합니다.",
      lead: "Studio 협력은 디자인 대행이 아니라 Newon의 제품과 자산을 중심으로 합니다. 유통, 라이선스, 공동 기획을 함께 검토합니다.",
      primary: ["협력 문의 →", partnerAsk("studio", "studio-partnerships")],
      ghost: ["협력 방식 보기 ↓", "#ways"],
      blocks: [
        {
          type: "rows",
          id: "ways",
          label: "협력 방식",
          items: [
            ["디지털 제품 유통", "Studio 디지털 상품을 다른 채널에서 판매·유통합니다.", partnerAsk("studio", "studio-partnerships-distribution")],
            ["제품 라이선스", "Newon 제품과 자산을 라이선스로 활용합니다.", partnerAsk("studio", "studio-partnerships-license")],
            ["공동 제품 기획", "서로의 강점을 합쳐 새 제품을 함께 기획합니다.", partnerAsk("strategic", "studio-partnerships-joint")],
            ["기술·디자인 자산 협력", "보유한 기술과 디자인 자산을 함께 활용합니다.", partnerAsk("studio", "studio-partnerships-assets")],
            ["플랫폼 연계 협력", "Newon 6개 플랫폼과 연계한 협력을 검토합니다.", "partnerships/platforms/"],
          ],
        },
        { type: "process" },
      ],
      cta: { label: "STUDIO PARTNERSHIPS", title: "제안을 보내 주세요.", lead: "모든 협력 문의는 Newon Partnerships 통합 창구에서 받습니다.", btn: ["협력 문의 →", partnerAsk("studio", "studio-partnerships")] },
    },
    en: {
      title: "Partnerships | Newon Studio",
      desc: "Newon Studio partnerships: digital product distribution, product licensing, joint product planning, technology and design assets, and platform-linked partnerships.",
      h1: "Partner with Studio's<br />products and assets.",
      lead: "Studio partnerships are about Newon's products and assets, not design services. We review distribution, licensing and joint planning together.",
      primary: ["Partnership inquiry →", partnerAsk("studio", "studio-partnerships")],
      ghost: ["Ways to partner ↓", "#ways"],
      blocks: [
        {
          type: "rows",
          id: "ways",
          label: "WAYS TO PARTNER",
          items: [
            ["Digital product distribution", "Selling and distributing Studio digital products through other channels.", partnerAsk("studio", "studio-partnerships-distribution")],
            ["Product licensing", "Using Newon products and assets under licence.", partnerAsk("studio", "studio-partnerships-license")],
            ["Joint product planning", "Planning a new product that combines both sides' strengths.", partnerAsk("strategic", "studio-partnerships-joint")],
            ["Technology and design assets", "Using technology and design assets together.", partnerAsk("studio", "studio-partnerships-assets")],
            ["Platform-linked partnerships", "Reviewing partnerships around Newon's six platforms.", "partnerships/platforms/"],
          ],
        },
        { type: "process" },
      ],
      cta: { label: "STUDIO PARTNERSHIPS", title: "Send us a proposal.", lead: "All partnership inquiries go through the single Newon Partnerships front door.", btn: ["Partnership inquiry →", partnerAsk("studio", "studio-partnerships")] },
    },
  },

  /* ============================== PARTNERSHIPS ============================== */
  {
    section: "partnerships",
    slug: "partnerships",
    menu: "overview",
    ko: {
      title: "Partnerships | Newon",
      desc: "개인, 판매자, 기업, 기관, 파트너가 Newon의 모든 사업과 협력하는 통합 창구. 협력 대상, 방식, 6개 플랫폼 분야, 진행 절차를 안내합니다.",
      eyebrowName: "OVERVIEW",
      markName: "OVERVIEW",
      h1: "Newon과 함께<br />사업을 넓혀 갑니다.",
      lead: "Newon Partnerships는 개인, 판매자, 기업, 기관이 Newon의 제품과 플랫폼을 바탕으로 협력하는 통합 창구입니다.",
      primary: ["제휴 문의 →", "partnerships/inquiry/#inquiry"],
      ghost: ["협력 대상 보기 ↓", "#who"],
      blocks: [
        {
          type: "rows",
          id: "who",
          label: "협력 대상",
          lead: "Newon은 자체 제품과 플랫폼을 바탕으로 협력합니다. 고객사 제작을 대신하는 외주 계약은 받지 않습니다.",
          items: [
            ["기업·브랜드", "사업 제휴, 제품 공급, 유통, 공동 마케팅", "partnerships/corporate/"],
            ["개인·판매자", "판매자 참여, 디지털 상품 판매, 크리에이터 협력", "partnerships/individuals/"],
            ["공공·기관", "생활정보, 공공데이터, 시니어 돌봄, 지역 서비스", "partnerships/public/"],
            ["플랫폼별 협력", "BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL", "partnerships/platforms/"],
            ["전략적 협력", "장기 제휴, 공동 제품, 기술, 글로벌 확장", "partnerships/strategic/"],
          ],
        },
        {
          type: "rows",
          id: "links",
          label: "AI · Business · Studio 연계",
          items: [
            ["Newon AI", "AI 제품과 기업용 AI 협력", "ai/enterprise/"],
            ["Newon Business", "자동화 제품·솔루션 도입과 라이선스", "business/"],
            ["Newon Studio", "디지털 제품 유통과 자산 라이선스", "studio/partnerships/"],
          ],
        },
        { type: "process" },
      ],
      cta: { label: "PARTNERSHIPS", title: "협력 제안을 기다립니다.", lead: "어떤 형태의 협력이든 하나의 양식으로 접수합니다.", btn: ["제휴 문의 →", "partnerships/inquiry/#inquiry"] },
    },
    en: {
      title: "Partnerships | Newon",
      desc: "One front door for individuals, sellers, companies, institutions and partners to work with every Newon business: who we partner with, how, the six platform fields and the process.",
      eyebrowName: "OVERVIEW",
      markName: "OVERVIEW",
      h1: "Grow your business<br />with Newon.",
      lead: "Newon Partnerships is one front door for individuals, sellers, companies and institutions to partner on Newon's products and platforms.",
      primary: ["Partnership inquiry →", "partnerships/inquiry/#inquiry"],
      ghost: ["Who we partner with ↓", "#who"],
      blocks: [
        {
          type: "rows",
          id: "who",
          label: "WHO WE PARTNER WITH",
          lead: "Newon partners through its own products and platforms. We do not take outsourced build contracts for clients.",
          items: [
            ["Companies and brands", "Business alliances, product supply, distribution, co-marketing", "partnerships/corporate/"],
            ["Individuals and sellers", "Seller participation, digital goods, creator partnerships", "partnerships/individuals/"],
            ["Public bodies and institutions", "Everyday information, public data, senior care, local services", "partnerships/public/"],
            ["By platform", "BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL", "partnerships/platforms/"],
            ["Strategic", "Long-term alliances, joint products, technology, global growth", "partnerships/strategic/"],
          ],
        },
        {
          type: "rows",
          id: "links",
          label: "AI · BUSINESS · STUDIO",
          items: [
            ["Newon AI", "AI products and enterprise AI partnerships", "ai/enterprise/"],
            ["Newon Business", "Adopting and licensing automation products and solutions", "business/"],
            ["Newon Studio", "Digital product distribution and asset licensing", "studio/partnerships/"],
          ],
        },
        { type: "process" },
      ],
      cta: { label: "PARTNERSHIPS", title: "We welcome your proposal.", lead: "Every kind of partnership goes through one form.", btn: ["Partnership inquiry →", "partnerships/inquiry/#inquiry"] },
    },
  },
  {
    section: "partnerships",
    slug: "partnerships/corporate",
    menu: "corporate",
    ko: {
      title: "Corporate Partnerships | Newon",
      desc: "기업과 브랜드를 위한 Newon 제휴 — 사업 제휴, 제품 공급·도입, 유통, 브랜드 협력, 공동 마케팅, 플랫폼 협력, 기업용 자동화 제품 도입, 전략적 협력.",
      h1: "기업·브랜드와<br />함께하는 방식.",
      lead: "Newon의 제품과 플랫폼을 중심으로 기업과 브랜드가 함께할 수 있는 방식을 안내합니다.",
      primary: ["기업 제휴 문의 →", partnerAsk("corporate", "partnerships-corporate")],
      ghost: ["협력 분야 보기 ↓", "#areas"],
      blocks: [
        {
          type: "rows",
          id: "areas",
          label: "협력 분야",
          items: [
            ["사업 제휴", "서로의 사업을 연결하는 제휴", partnerAsk("corporate", "corporate-alliance")],
            ["제품 공급·도입", "Newon 제품을 기업에 공급·도입", "business/digital-products/"],
            ["유통 협력", "Newon 상품을 다른 채널로 유통", partnerAsk("corporate", "corporate-distribution")],
            ["브랜드 협력", "브랜드 간 협업 기획", partnerAsk("corporate", "corporate-brand")],
            ["공동 마케팅", "공동 캠페인과 프로모션", partnerAsk("corporate", "corporate-marketing")],
            ["플랫폼 협력", "Newon 6개 플랫폼과 연계", "partnerships/platforms/"],
            ["기업용 자동화 제품 도입", "Business 자동화 제품의 기업 도입", "business/automation/"],
            ["전략적 사업 협력", "장기적인 공동 사업", "partnerships/strategic/"],
          ],
        },
        { type: "process" },
      ],
      cta: { label: "CORPORATE", title: "기업 제휴를 제안해 주세요.", lead: "제안 내용을 검토한 뒤 담당 사업에서 연락드립니다.", btn: ["기업 제휴 문의 →", partnerAsk("corporate", "partnerships-corporate")] },
    },
    en: {
      title: "Corporate Partnerships | Newon",
      desc: "Newon partnerships for companies and brands: alliances, product supply, distribution, brand collaboration, co-marketing, platform partnerships, enterprise automation and strategic cooperation.",
      h1: "How companies and brands<br />work with Newon.",
      lead: "Ways for companies and brands to work with Newon's products and platforms.",
      primary: ["Corporate inquiry →", partnerAsk("corporate", "partnerships-corporate")],
      ghost: ["See areas ↓", "#areas"],
      blocks: [
        {
          type: "rows",
          id: "areas",
          label: "AREAS",
          items: [
            ["Business alliances", "Alliances that connect both businesses", partnerAsk("corporate", "corporate-alliance")],
            ["Product supply and adoption", "Supplying Newon products to companies", "business/digital-products/"],
            ["Distribution", "Distributing Newon products through other channels", partnerAsk("corporate", "corporate-distribution")],
            ["Brand collaboration", "Collaborations between brands", partnerAsk("corporate", "corporate-brand")],
            ["Co-marketing", "Joint campaigns and promotions", partnerAsk("corporate", "corporate-marketing")],
            ["Platform partnerships", "Working with Newon's six platforms", "partnerships/platforms/"],
            ["Enterprise automation", "Adopting Business automation products", "business/automation/"],
            ["Strategic cooperation", "Long-term joint business", "partnerships/strategic/"],
          ],
        },
        { type: "process" },
      ],
      cta: { label: "CORPORATE", title: "Propose a corporate partnership.", lead: "After review, the relevant business team will contact you.", btn: ["Corporate inquiry →", partnerAsk("corporate", "partnerships-corporate")] },
    },
  },
  {
    section: "partnerships",
    slug: "partnerships/individuals",
    menu: "individuals",
    ko: {
      title: "Individuals & Sellers | Newon Partnerships",
      desc: "개인과 판매자를 위한 Newon 협력 — 개인 판매자·개인 사업자 참여, 디지털 상품 판매, 플랫폼 입점 안내, 크리에이터 협력, 제품·콘텐츠 유통.",
      h1: "개인과 판매자도<br />함께할 수 있습니다.",
      lead: "개인 판매자, 개인 사업자, 크리에이터가 Newon과 협력하는 방식을 안내합니다. 실제 거래와 입점은 SHAREON 등 해당 앱에서 제공할 예정입니다.",
      primary: ["참여 문의 →", partnerAsk("individual", "partnerships-individuals")],
      ghost: ["참여 방식 보기 ↓", "#ways"],
      blocks: [
        {
          type: "rows",
          id: "ways",
          label: "참여 방식",
          items: [
            ["개인 판매자 참여", "SHAREON 등 Newon 앱에서 판매자로 참여 (출시 후)", "shareon/"],
            ["개인 사업자 참여", "Business 제품을 활용한 운영 개선", "business/solutions/"],
            ["디지털 상품 판매 협력", "디지털 상품을 함께 만들고 판매", partnerAsk("individual", "individuals-digital")],
            ["플랫폼 입점 안내", "입점 조건과 일정은 각 앱 출시 시 안내", "partnerships/platforms/"],
            ["크리에이터 협력", "콘텐츠와 제품을 함께 기획", partnerAsk("individual", "individuals-creator")],
            ["제품·콘텐츠 유통 협력", "제품과 콘텐츠를 Newon 채널로 유통", partnerAsk("individual", "individuals-distribution")],
          ],
        },
        {
          type: "faq",
          items: [
            ["지금 SHAREON에 입점할 수 있나요?", "아직 아닙니다. SHAREON은 개발 중이며 예약·결제·정산은 운영되지 않습니다. 입점 조건은 출시 시 안내합니다."],
          ],
        },
      ],
      cta: { label: "INDIVIDUALS & SELLERS", title: "참여 의사를 남겨 주세요.", lead: "관심 분야를 알려 주시면 준비되는 대로 안내드립니다.", btn: ["참여 문의 →", partnerAsk("individual", "partnerships-individuals")] },
    },
    en: {
      title: "Individuals & Sellers | Newon Partnerships",
      desc: "Newon partnerships for individuals and sellers: seller and sole-trader participation, digital goods, platform onboarding, creator partnerships and product and content distribution.",
      h1: "Individuals and sellers<br />can partner too.",
      lead: "How individual sellers, sole traders and creators can work with Newon. Actual trading and onboarding will happen in apps such as SHAREON.",
      primary: ["Ask to take part →", partnerAsk("individual", "partnerships-individuals")],
      ghost: ["Ways to take part ↓", "#ways"],
      blocks: [
        {
          type: "rows",
          id: "ways",
          label: "WAYS TO TAKE PART",
          items: [
            ["Individual sellers", "Selling in Newon apps such as SHAREON (after launch)", "shareon/"],
            ["Sole traders", "Improving operations with Business products", "business/solutions/"],
            ["Digital goods", "Making and selling digital goods together", partnerAsk("individual", "individuals-digital")],
            ["Platform onboarding", "Terms and timing announced when each app launches", "partnerships/platforms/"],
            ["Creators", "Planning content and products together", partnerAsk("individual", "individuals-creator")],
            ["Product and content distribution", "Distributing products and content through Newon channels", partnerAsk("individual", "individuals-distribution")],
          ],
        },
        {
          type: "faq",
          items: [
            ["Can I join SHAREON now?", "Not yet. SHAREON is in development, and booking, payment and settlement are not operating. Onboarding terms will be announced at launch."],
          ],
        },
      ],
      cta: { label: "INDIVIDUALS & SELLERS", title: "Let us know you are interested.", lead: "Tell us your field and we will get in touch when it is ready.", btn: ["Ask to take part →", partnerAsk("individual", "partnerships-individuals")] },
    },
  },
  {
    section: "partnerships",
    slug: "partnerships/public",
    menu: "public",
    ko: {
      title: "Public & Institutional Partnerships | Newon",
      desc: "공공기관, 지자체, 교육기관, 복지기관을 위한 Newon 협력 — 생활정보, 공공데이터, 생애주기 지원 정보, 시니어 돌봄, 지역 서비스, 접근성 개선.",
      h1: "공공과 함께<br />생활을 더 쉽게.",
      lead: "LIVON과 ONGIL을 바탕으로 공공기관, 지자체, 교육·복지기관과 협력할 수 있는 분야를 안내합니다.",
      primary: ["기관 협력 문의 →", partnerAsk("public", "partnerships-public")],
      ghost: ["협력 분야 보기 ↓", "#areas"],
      blocks: [
        {
          type: "rows",
          id: "areas",
          label: "협력 분야",
          lead: "현재 체결된 공공 협약은 없습니다. 아래는 협력을 검토할 수 있는 분야입니다.",
          items: [
            ["생활정보 협력", "생활에 필요한 정보를 쉽게 전달", "lifestage/"],
            ["공공데이터 협력", "공공데이터를 활용한 정보 서비스", partnerAsk("public", "public-data")],
            ["생애주기 지원 정보", "시기별 지원 제도 안내", "lifestage/"],
            ["시니어 돌봄 협력", "시니어와 가족을 위한 돌봄 정보", "ongil/"],
            ["지역 서비스 협력", "지역 기반 생활 서비스 연결", partnerAsk("public", "public-local")],
            ["공공 서비스 접근성 개선", "큰 글씨·쉬운 말 등 접근성 개선", "studio/design-systems/"],
            ["교육·복지 분야 협력", "교육·복지기관과의 정보 협력", partnerAsk("public", "public-education")],
          ],
        },
        { type: "process" },
      ],
      cta: { label: "PUBLIC & INSTITUTIONAL", title: "기관 협력을 제안해 주세요.", lead: "기관명과 담당 부서, 제안 내용을 남겨 주세요.", btn: ["기관 협력 문의 →", partnerAsk("public", "partnerships-public")] },
    },
    en: {
      title: "Public & Institutional Partnerships | Newon",
      desc: "Newon partnerships for public bodies, local governments, schools and welfare organizations: everyday information, public data, life-stage support, senior care, local services and accessibility.",
      h1: "Making everyday life easier,<br />with the public sector.",
      lead: "Fields where public bodies, local governments, schools and welfare organizations can partner with Newon, building on LIVON and ONGIL.",
      primary: ["Institutional inquiry →", partnerAsk("public", "partnerships-public")],
      ghost: ["See areas ↓", "#areas"],
      blocks: [
        {
          type: "rows",
          id: "areas",
          label: "AREAS",
          lead: "No public agreement has been signed yet. These are the fields where partnership can be reviewed.",
          items: [
            ["Everyday information", "Making everyday information easy to find", "lifestage/"],
            ["Public data", "Information services built on public data", partnerAsk("public", "public-data")],
            ["Life-stage support", "Guidance on support programmes by life stage", "lifestage/"],
            ["Senior care", "Care information for seniors and families", "ongil/"],
            ["Local services", "Connecting local everyday services", partnerAsk("public", "public-local")],
            ["Accessible public services", "Large text, plain language and other accessibility work", "studio/design-systems/"],
            ["Education and welfare", "Information partnerships with schools and welfare bodies", partnerAsk("public", "public-education")],
          ],
        },
        { type: "process" },
      ],
      cta: { label: "PUBLIC & INSTITUTIONAL", title: "Propose an institutional partnership.", lead: "Leave your organization, department and proposal.", btn: ["Institutional inquiry →", partnerAsk("public", "partnerships-public")] },
    },
  },
  {
    section: "partnerships",
    slug: "partnerships/platforms",
    menu: "platforms",
    ko: {
      title: "Platform Partnerships | Newon",
      desc: "BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL — Newon 6개 플랫폼별 협력 안내.",
      h1: "6개 플랫폼,<br />각자의 협력 방식.",
      lead: "플랫폼마다 이용자와 협력 분야가 다릅니다. 함께하고 싶은 플랫폼을 선택하세요.",
      primary: ["플랫폼 협력 문의 →", partnerAsk("platform", "partnerships-platforms")],
      ghost: ["플랫폼 보기 ↓", "#platforms"],
      blocks: [{ type: "platforms", id: "platforms", label: "플랫폼" }, { type: "process" }],
      cta: { label: "PLATFORM PARTNERSHIPS", title: "함께할 플랫폼을 알려 주세요.", lead: "문의 양식에서 관심 플랫폼을 선택할 수 있습니다.", btn: ["플랫폼 협력 문의 →", partnerAsk("platform", "partnerships-platforms")] },
    },
    en: {
      title: "Platform Partnerships | Newon",
      desc: "Partnering on each of Newon's six platforms: BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON and ONGIL.",
      h1: "Six platforms,<br />six ways to partner.",
      lead: "Each platform has different users and partnership fields. Choose the one you want to work with.",
      primary: ["Platform inquiry →", partnerAsk("platform", "partnerships-platforms")],
      ghost: ["See platforms ↓", "#platforms"],
      blocks: [{ type: "platforms", id: "platforms", label: "PLATFORMS" }, { type: "process" }],
      cta: { label: "PLATFORM PARTNERSHIPS", title: "Tell us which platform.", lead: "You can choose the platform in the inquiry form.", btn: ["Platform inquiry →", partnerAsk("platform", "partnerships-platforms")] },
    },
  },
  {
    section: "partnerships",
    slug: "partnerships/strategic",
    menu: "strategic",
    ko: {
      title: "Strategic Partnerships | Newon",
      desc: "Newon 전략적 협력 — 장기 사업 제휴, 공동 제품 사업, 기술 협력, 국내외 유통, 글로벌 사업 확장, 투자 및 전략적 협력 문의.",
      h1: "길게 보고<br />함께 만듭니다.",
      lead: "장기 제휴, 공동 제품, 기술 협력, 국내외 유통처럼 오래 함께할 협력을 검토합니다.",
      primary: ["전략 협력 문의 →", partnerAsk("strategic", "partnerships-strategic")],
      ghost: ["협력 분야 보기 ↓", "#areas"],
      blocks: [
        {
          type: "rows",
          id: "areas",
          label: "협력 분야",
          items: [
            ["장기 사업 제휴", "여러 해에 걸친 사업 제휴", partnerAsk("strategic", "strategic-alliance")],
            ["공동 제품 사업", "제품을 함께 만들고 함께 판매", partnerAsk("strategic", "strategic-joint")],
            ["기술 협력", "AI·자동화·플랫폼 기술 협력", partnerAsk("strategic", "strategic-tech")],
            ["국내외 유통 협력", "국내외 채널을 통한 제품 유통", partnerAsk("strategic", "strategic-distribution")],
            ["글로벌 사업 확장", "9개 언어로 운영 중인 사이트를 바탕으로 해외 진출 협력", partnerAsk("strategic", "strategic-global")],
            ["투자 및 전략적 협력 문의", "투자·전략적 협력에 관한 문의 접수", partnerAsk("strategic", "strategic-investment")],
          ],
        },
        {
          type: "faq",
          items: [
            ["Newon이 투자를 유치하고 있나요?", "현재 공식적인 투자 모집을 진행하고 있지 않습니다. 투자와 전략적 협력에 관한 문의는 받으며, 검토 후 필요한 경우 연락드립니다."],
          ],
        },
        { type: "process" },
      ],
      cta: { label: "STRATEGIC", title: "장기 협력을 제안해 주세요.", lead: "제안 내용과 기대하는 협력 기간을 함께 알려 주세요.", btn: ["전략 협력 문의 →", partnerAsk("strategic", "partnerships-strategic")] },
    },
    en: {
      title: "Strategic Partnerships | Newon",
      desc: "Newon strategic partnerships: long-term alliances, joint products, technology, domestic and international distribution, global growth, and investment or strategic inquiries.",
      h1: "Built together,<br />for the long run.",
      lead: "We review long-term partnerships such as alliances, joint products, technology and distribution at home and abroad.",
      primary: ["Strategic inquiry →", partnerAsk("strategic", "partnerships-strategic")],
      ghost: ["See areas ↓", "#areas"],
      blocks: [
        {
          type: "rows",
          id: "areas",
          label: "AREAS",
          items: [
            ["Long-term alliances", "Business alliances over several years", partnerAsk("strategic", "strategic-alliance")],
            ["Joint products", "Building and selling a product together", partnerAsk("strategic", "strategic-joint")],
            ["Technology", "AI, automation and platform technology", partnerAsk("strategic", "strategic-tech")],
            ["Distribution at home and abroad", "Distributing products through domestic and international channels", partnerAsk("strategic", "strategic-distribution")],
            ["Global growth", "Expanding abroad, building on a site that runs in nine languages", partnerAsk("strategic", "strategic-global")],
            ["Investment and strategic inquiries", "We accept inquiries about investment and strategic cooperation", partnerAsk("strategic", "strategic-investment")],
          ],
        },
        {
          type: "faq",
          items: [
            ["Is Newon raising investment?", "Newon is not running an official investment round. We accept inquiries about investment and strategic cooperation and will reply after review where relevant."],
          ],
        },
        { type: "process" },
      ],
      cta: { label: "STRATEGIC", title: "Propose a long-term partnership.", lead: "Tell us your proposal and the length of partnership you have in mind.", btn: ["Strategic inquiry →", partnerAsk("strategic", "partnerships-strategic")] },
    },
  },
  {
    section: "partnerships",
    slug: "partnerships/inquiry",
    menu: "inquiry",
    form: true,
    ko: {
      title: "Partnership Inquiry | Newon",
      desc: "Newon 통합 제휴 문의. 개인, 개인 사업자, 기업, 기관 누구나 협력을 제안할 수 있습니다.",
      h1: "협력 제안을<br />보내 주세요.",
      lead: "개인, 개인 사업자, 기업, 기관 누구나 하나의 양식으로 제안할 수 있습니다. 필요한 정보만 받습니다.",
      primary: ["양식 작성 ↓", "#inquiry"],
      ghost: ["협력 절차 보기 ↓", "#process"],
      blocks: [{ type: "form", id: "inquiry" }, { type: "process" }],
    },
    en: {
      title: "Partnership Inquiry | Newon",
      desc: "One partnership inquiry form for Newon. Individuals, sole traders, companies and institutions can all propose a partnership.",
      h1: "Send us<br />your proposal.",
      lead: "Individuals, sole traders, companies and institutions can all use one form. We only ask for what we need.",
      primary: ["Fill in the form ↓", "#inquiry"],
      ghost: ["See the process ↓", "#process"],
      blocks: [{ type: "form", id: "inquiry" }, { type: "process" }],
    },
  },
];

/* Platform partnership detail pages (/partnerships/platforms/{id}/). */
export const PLATFORM_PAGES = {
  babylog: {
    ko: { intro: "아기의 수유·수면·기저귀·성장을 기록하는 육아 앱입니다.", users: "영유아를 키우는 부모와 가족", areas: ["육아용품·식품 정보 협력", "육아 교육·콘텐츠 협력", "가족 서비스 제휴"], value: "부모가 기록하는 순간에 필요한 정보와 서비스를 연결합니다." },
    en: { intro: "A parenting app for logging a baby's feeds, sleep, diapers and growth.", users: "Parents and families with babies and toddlers", areas: ["Baby product and food information", "Parenting education and content", "Family service alliances"], value: "Connecting the information and services parents need at the moment they log." },
  },
  petlog: {
    ko: { intro: "반려동물의 건강과 일상을 기록하는 케어 앱입니다.", users: "반려동물 보호자", areas: ["반려용품·사료 정보 협력", "동물병원·케어 서비스 제휴", "반려 콘텐츠 협력"], value: "보호자의 케어 기록과 필요한 서비스를 가깝게 잇습니다." },
    en: { intro: "A care app for recording a pet's health and daily life.", users: "Pet owners", areas: ["Pet product and food information", "Vet and care service alliances", "Pet content partnerships"], value: "Bringing owners' care records closer to the services they need." },
  },
  myworld: {
    ko: { intro: "지도 위에 여행과 일상의 기록을 남기는 앱입니다.", users: "여행과 기록을 즐기는 개인", areas: ["지역·여행 콘텐츠 협력", "관광·지역 기관 제휴", "개인화 콘텐츠 협력"], value: "개인의 경험 기록과 지역 콘텐츠를 연결합니다." },
    en: { intro: "An app for keeping travel and everyday records on a map.", users: "People who enjoy travel and keeping records", areas: ["Local and travel content", "Tourism and local body alliances", "Personalized content partnerships"], value: "Connecting personal records with local content." },
  },
  shareon: {
    ko: { intro: "개인과 기업이 직접 참여해 물건·공간·서비스를 빌리고 빌려주는 공유 마켓플레이스입니다. 현재 개발 중이며 예약·결제·정산은 운영되지 않습니다.", users: "물건·공간·서비스를 나누려는 개인과 기업 (출시 후)", areas: ["판매자·기업 참여 협력 (출시 후)", "지역 공유 서비스 제휴", "공간·장비 보유 기업 협력"], value: "유휴 자산을 이웃과 지역에서 나눌 수 있게 합니다." },
    en: { intro: "A sharing marketplace where individuals and businesses lend and borrow things, spaces and services. It is in development; booking, payment and settlement are not operating.", users: "People and businesses sharing things, spaces or services (after launch)", areas: ["Seller and business participation (after launch)", "Local sharing service alliances", "Partnerships with businesses that own spaces or equipment"], value: "Letting idle assets be shared with neighbours and locally." },
  },
  livon: {
    ko: { intro: "생애주기에 맞는 생활정보와 할 일을 안내하는 서비스입니다.", users: "생애주기별 정보가 필요한 모든 세대", areas: ["생활·금융·교육 정보 협력", "공공 지원 제도 정보 협력", "기관 안내 콘텐츠 협력"], value: "필요한 시기에 맞는 정보를 쉽게 전달합니다." },
    en: { intro: "A service that guides everyday information and tasks for each life stage.", users: "People of every generation who need life-stage information", areas: ["Everyday, finance and education information", "Public support programme information", "Institutional guidance content"], value: "Getting the right information to people at the right time." },
  },
  ongil: {
    ko: { intro: "시니어와 가족의 일상을 돕는 생활·돌봄 서비스입니다.", users: "시니어와 그 가족, 돌봄 관계자", areas: ["돌봄·건강 정보 협력", "지역 돌봄 서비스 제휴", "접근성 개선 협력"], value: "시니어와 가족이 쓰기 쉬운 방식으로 서비스를 연결합니다." },
    en: { intro: "An everyday-life and care service for seniors and their families.", users: "Seniors, their families and carers", areas: ["Care and health information", "Local care service alliances", "Accessibility partnerships"], value: "Connecting services in ways seniors and families find easy." },
  },
};

export const PLATFORM_PAGE_LABELS = {
  ko: { aboutLabel: "플랫폼 개요", intro: "플랫폼 소개", users: "주요 이용자", areas: "협력 가능 분야", join: "참여 방법", joinText: "개인·기업·기관 모두 Partnership Inquiry에서 이 플랫폼을 선택해 제안할 수 있습니다.", value: "기대 가치", ask: "협력 문의", status: "현재 외부 협력사와의 연동은 구현되어 있지 않으며, 협력 방식은 개별 검토합니다.", h1: (n) => `${n}<br />협력 안내.`, lead: (n) => `${n} 협력 안내입니다.`, title: (n) => `${n} Partnerships | Newon`, desc: (n, intro) => `${n} 플랫폼 협력 안내 — ${intro}`, see: (n) => `${n} 보기 →` },
  en: { aboutLabel: "OVERVIEW", intro: "About the platform", users: "Main users", areas: "Partnership fields", join: "How to take part", joinText: "Individuals, businesses and institutions can choose this platform in the Partnership Inquiry form.", value: "Expected value", ask: "Partnership inquiry", status: "No integration with outside partners is built today; each partnership is reviewed individually.", h1: (n) => `Partner with<br />${n}.`, lead: (n) => `Partnering with ${n}.`, title: (n) => `${n} Partnerships | Newon`, desc: (n, intro) => `Partnering with ${n} — ${intro}`, see: (n) => `See ${n} →` },
};

/* Inquiry form copy. */
export const FORM = {
  ko: {
    label: "PARTNERSHIP INQUIRY",
    title: "통합 제휴 문의",
    lead: "* 표시는 필수 항목입니다. 접수 후 검토하여 이메일로 회신드립니다.",
    participant: "참여 주체",
    participants: [["individual", "개인"], ["sole-trader", "개인 사업자"], ["company", "기업"], ["institution", "기관"]],
    name: "이름 또는 담당자명",
    org: "기업·기관명",
    orgHint: "기업·기관인 경우에만 입력해 주세요.",
    email: "이메일",
    type: "협력 유형",
    choose: "선택해 주세요",
    types: [["corporate", "기업·브랜드 제휴"], ["individual", "개인·판매자 참여"], ["public", "공공·기관 협력"], ["platform", "플랫폼 협력"], ["strategic", "전략적 협력·투자 문의"], ["studio", "Studio 제품·자산 협력"], ["business", "Business 제품 도입·라이선스"], ["other", "기타"]],
    interest: "관심 플랫폼 또는 사업 영역",
    interests: [["BABYLOG", "BABYLOG"], ["PETLOG", "PETLOG"], ["MY WORLD", "MY WORLD"], ["SHAREON", "SHAREON"], ["LIVON", "LIVON"], ["ONGIL", "ONGIL"], ["AI", "Newon AI"], ["Business", "Newon Business"], ["Studio", "Newon Studio"], ["Not sure", "아직 정하지 않음"]],
    message: "제안 내용",
    messagePh: "협력하고 싶은 내용과 기대하는 방식을 적어 주세요.",
    optional: "선택",
    consent: "문의 회신을 위해 이름, 이메일, 기업·기관명, 제안 내용을 수집·이용하는 데 동의합니다. 회신 목적 외에는 사용하지 않습니다.",
    privacy: "개인정보 처리방침",
    submit: "제안 보내기",
    submitting: "보내는 중…",
    fail: "전송하지 못했습니다. 잠시 후 다시 시도하거나 아래 링크로 이메일을 보내 주세요.",
    direct: "이메일로 직접 보내셔도 됩니다:",
    subject: "Newon 제휴 문의",
  },
  en: {
    label: "PARTNERSHIP INQUIRY",
    title: "Partnership inquiry",
    lead: "Fields marked * are required. We review each proposal and reply by email.",
    participant: "You are",
    participants: [["individual", "An individual"], ["sole-trader", "A sole trader"], ["company", "A company"], ["institution", "An institution"]],
    name: "Name or contact person",
    org: "Company or organization",
    orgHint: "Only if you are a company or institution.",
    email: "Email",
    type: "Partnership type",
    choose: "Please choose",
    types: [["corporate", "Company or brand partnership"], ["individual", "Individual or seller participation"], ["public", "Public or institutional partnership"], ["platform", "Platform partnership"], ["strategic", "Strategic partnership or investment"], ["studio", "Studio products and assets"], ["business", "Business product adoption or licensing"], ["other", "Other"]],
    interest: "Platform or business area",
    interests: [["BABYLOG", "BABYLOG"], ["PETLOG", "PETLOG"], ["MY WORLD", "MY WORLD"], ["SHAREON", "SHAREON"], ["LIVON", "LIVON"], ["ONGIL", "ONGIL"], ["AI", "Newon AI"], ["Business", "Newon Business"], ["Studio", "Newon Studio"], ["Not sure", "Not sure yet"]],
    message: "Your proposal",
    messagePh: "Tell us what you would like to do together and how.",
    optional: "optional",
    consent: "I agree that Newon collects and uses my name, email, organization and proposal to reply to this inquiry, and for no other purpose.",
    privacy: "Privacy policy",
    submit: "Send proposal",
    submitting: "Sending…",
    fail: "We could not send your proposal. Please try again later or email us with the link below.",
    direct: "You can also email us directly:",
    subject: "Newon partnership inquiry",
  },
};

/* Hub (overview) copy for /business/ and /studio/. */
export const HUBS = {
  business: {
    ko: {
      label: "NEWON BUSINESS",
      title: "비즈니스의 반복을 줄이고,\n성장의 가능성을 넓힙니다.",
      lead: "Newon Business는 개인 사업자, 판매자, 기업이 쓸 수 있는 자체 소프트웨어 제품과 자동화 솔루션을 개발·공급합니다. 고객별 맞춤 제작이나 구축 대행은 하지 않습니다.",
      facts: [
        ["주요 고객", "개인 사업자 · 판매자 · 기업 · 기관"],
        ["핵심 가치", "반복 업무를 줄이고, 같은 제품으로 더 많은 사업을 돕습니다."],
        ["사업 구조", "자체 제품 개발 → 공통 제품으로 공급 → 설정과 도입 지원"],
        ["수익 모델", "구독 · 제품 라이선스 · 디지털 상품 판매 · 플랫폼 연계 수익"],
      ],
      factsLabel: "사업 개요",
      menuLabel: "BUSINESS MENU",
      filmCta: ["제품 살펴보기 ↓", "#overview"],
      filmCta2: ["도입 문의 ↗", "inquiry/"],
      cta: { label: "BUSINESS INQUIRY", title: "제품 도입을 검토하고 계신가요?", lead: "도입, 기업 솔루션, 라이선스, 유통 협력 문의를 받습니다.", btn: ["Business Inquiry →", "business/inquiry/"] },
    },
    en: {
      label: "NEWON BUSINESS",
      title: "Less repetition in business,\nmore room to grow.",
      lead: "Newon Business develops and supplies its own software products and automation solutions for sole traders, sellers and companies. We do not do custom builds or build-for-hire.",
      facts: [
        ["Customers", "Sole traders · sellers · companies · institutions"],
        ["Core value", "Cut repeated work, and help more businesses with the same products."],
        ["How it works", "Build our own products → supply them as shared products → help with setup and adoption"],
        ["Revenue model", "Subscriptions · product licences · digital product sales · platform-linked revenue"],
      ],
      factsLabel: "OVERVIEW",
      menuLabel: "BUSINESS MENU",
      filmCta: ["Explore products ↓", "#overview"],
      filmCta2: ["Adoption inquiry ↗", "inquiry/"],
      cta: { label: "BUSINESS INQUIRY", title: "Considering one of our products?", lead: "We take inquiries about adoption, company solutions, licensing and distribution.", btn: ["Business Inquiry →", "business/inquiry/"] },
    },
  },
  studio: {
    ko: {
      label: "NEWON STUDIO",
      title: "아이디어를 Newon만의\n디지털 제품으로 발전시킵니다.",
      lead: "Newon Studio는 Newon 자체 디지털 제품과 디자인 자산, 제품 연구·개발 프로젝트를 맡습니다. 고객별 디자인·브랜드·웹·앱·영상 제작 대행은 하지 않습니다.",
      facts: [
        ["목적", "Newon 제품을 더 쓰기 쉽고 일관되게 만듭니다."],
        ["제품 철학", "작게 만들고, 직접 쓰고, 계속 고칩니다."],
        ["만드는 것", "자체 디지털 제품 · 디자인 리소스 · UI 키트 · 템플릿"],
        ["협력 방식", "디지털 제품 유통 · 라이선스 · 공동 제품 기획"],
      ],
      factsLabel: "STUDIO 개요",
      menuLabel: "STUDIO MENU",
      filmCta: ["Studio 살펴보기 ↓", "#overview"],
      filmCta2: ["Studio 협력 문의 ↗", "partnerships/"],
      cta: { label: "STUDIO PARTNERSHIPS", title: "Studio 제품과 자산으로 함께하세요.", lead: "유통, 라이선스, 공동 기획 협력을 받습니다.", btn: ["Studio Partnerships →", "studio/partnerships/"] },
    },
    en: {
      label: "NEWON STUDIO",
      title: "Turning ideas into\nNewon's own digital products.",
      lead: "Newon Studio looks after Newon's own digital products, design assets and product R&D. It does not make designs, brands, websites, apps or videos for clients.",
      facts: [
        ["Purpose", "Make Newon products easier to use and more consistent."],
        ["Product philosophy", "Build small, use it ourselves, keep improving."],
        ["What we make", "Own digital products · design resources · UI kits · templates"],
        ["How to partner", "Digital product distribution · licensing · joint product planning"],
      ],
      factsLabel: "OVERVIEW",
      menuLabel: "STUDIO MENU",
      filmCta: ["Explore Studio ↓", "#overview"],
      filmCta2: ["Studio partnerships ↗", "partnerships/"],
      cta: { label: "STUDIO PARTNERSHIPS", title: "Partner with Studio's products and assets.", lead: "We take distribution, licensing and joint planning partnerships.", btn: ["Studio Partnerships →", "studio/partnerships/"] },
    },
  },
};
