/**
 * /{lang}/business/inquiry/ — Business Inquiry copy (owner brief, Oct 2026).
 *
 * The page is a six-platform business · partnership inquiry page, not a production / outsourcing
 * request page. Korean is primary, English is written; the other seven locales reuse the English
 * copy (rendered with lang="en" on <main>), the same fallback the generator already used via pick().
 *
 * Rules: no invented response times, phone numbers, addresses, guarantees, prices or partner names.
 * Platform descriptions follow each platform's own /{lang}/{platform}/business/ page.
 * Privacy wording follows /{lang}/privacy/ (no retention period is stated there, so none is invented).
 */

/** Inquiry types — `value` is what the inbox receives in `type` (stable, English). */
export const INQ_TYPES = [
  { key: "platform-participation", value: "Platform Participation & Transactions" },
  { key: "brand-partnership", value: "Brand, Service & Content Partnership" },
  { key: "enterprise-adoption", value: "Enterprise Service Adoption" },
  { key: "public-partnership", value: "Public Sector & Organization Partnership" },
  { key: "tech-global", value: "Technology & Global Partnership" },
  { key: "other", value: "Other Business Inquiry" },
];

/** Related platform — `value` is what the inbox receives in `platform` (same values as /business/contact/). */
export const INQ_PLATFORMS = [
  { id: "babylog", value: "BABYLOG", name: "BABYLOG", href: "babylog/business/" },
  { id: "petlog", value: "PETLOG", name: "PETLOG", href: "petlog/business/" },
  { id: "myworld", value: "MY WORLD", name: "MY WORLD", href: "myworld/business/" },
  { id: "shareon", value: "SHAREON", name: "SHAREON", href: "shareon/business/" },
  { id: "livon", value: "LIVON", name: "LIVON", href: "livon/business/" },
  { id: "ongil", value: "ONGIL", name: "ONGIL", href: "ongil/business/" },
];
export const INQ_PLATFORM_EXTRA = [
  { id: "multiple", value: "Multiple Platforms" },
  { id: "undecided", value: "Not decided yet" },
];

/**
 * Legacy ?type= / ?service= / ?slug= values that other pages still send → new type value.
 * Anything not listed (old production / outsourcing / Studio values) leaves the select empty.
 */
export function inquiryTypeAliasMap() {
  const byKey = Object.fromEntries(INQ_TYPES.map((t) => [t.key, t.value]));
  const map = {};
  for (const t of INQ_TYPES) {
    map[t.key] = t.value;
    map[t.value] = t.value;
  }
  const alias = {
    // partnership / collaboration links (SHAREON, ONGIL contact, older Business pages)
    partnership: "brand-partnership",
    Partnership: "brand-partnership",
    "product-service-collaboration": "brand-partnership",
    service: "brand-partnership",
    "App Collaboration": "brand-partnership",
    "advertising-promotion": "brand-partnership",
    promotion: "brand-partnership",
    Advertising: "brand-partnership",
    // former product-business types (bsp-content BIZ_INQUIRY_TYPES keys and values)
    "product-adoption": "enterprise-adoption",
    "PRODUCT / Product adoption": "enterprise-adoption",
    "enterprise-solution": "enterprise-adoption",
    "PRODUCT / Enterprise solution": "enterprise-adoption",
    "automation-product": "enterprise-adoption",
    "PRODUCT / Automation product": "enterprise-adoption",
    "ai-automation": "enterprise-adoption",
    "AI Automation": "enterprise-adoption",
    "sales-distribution": "platform-participation",
    "PRODUCT / Sales & distribution": "platform-participation",
    "platform-integration": "tech-global",
    "PRODUCT / Platform integration": "tech-global",
    license: "tech-global",
    "PRODUCT / License": "tech-global",
    Other: "other",
  };
  for (const [k, v] of Object.entries(alias)) map[k] = byKey[v];
  return map;
}

const KO = {
  seoTitle: "사업 문의 | NEWON",
  metaDescription:
    "NEWON의 여섯 개 디지털 플랫폼(BABYLOG·PETLOG·MY WORLD·SHAREON·LIVON·ONGIL)에 관한 입점, 사업 제휴, 기업용 서비스 도입, 기관 협력 문의를 받습니다.",

  heroCrumbLeft: "Business & Partnerships",
  heroCrumbRight: "INQUIRY",
  heroLabel: "BUSINESS INQUIRY",
  heroRole: "사업·파트너십 문의",
  heroTitleHtml: "새로운 비즈니스의<br />가능성을 연결합니다.",
  heroLead: "NEWON의 여섯 개 디지털 플랫폼을 기반으로 입점, 사업 제휴, 기업용 서비스 도입, 기관 협력에 관한 문의를 받습니다.",
  heroDomainsAria: "문의 분야",
  heroDomains: ["입점·거래", "사업 제휴", "기업 도입", "기관 협력"],
  heroCta: "사업 문의하기",
  heroBack: "Business & Partnerships 보기 →",

  catLabel: "INQUIRY CATEGORIES",
  catTitle: "어떤 문의를 준비하고 계신가요?",
  catLead: "문의 유형은 여섯 가지입니다. 고객별 웹·앱 제작, 맞춤 개발, 디자인 대행, 제작 견적 요청은 받지 않습니다.",
  cats: [
    {
      title: "플랫폼 입점 및 거래 참여",
      body: "판매자·브랜드, 서비스 사업자, 대여업체·공간 운영자가 NEWON 플랫폼에 상품·서비스·자산을 등록하고 거래에 참여하는 방안을 문의합니다. 입점과 거래 기능은 플랫폼별 출시 단계와 사업자 확인 절차에 따라 열립니다.",
      keys: "판매자 · 서비스 사업자 · 대여업체",
    },
    {
      title: "브랜드·서비스·콘텐츠 제휴",
      body: "플랫폼 이용자와 관련된 브랜드 캠페인, 서비스 연계, 전문가·크리에이터 콘텐츠 협력을 제안합니다. 제휴 방식과 조건은 플랫폼별 운영 기준에 맞춰 협의합니다.",
      keys: "브랜드 캠페인 · 서비스 연계 · 콘텐츠",
    },
    {
      title: "기업용 서비스 도입",
      body: "보육·교육기관 SaaS, 요양·복지기관 SaaS, 기업 가족복지 솔루션처럼 플랫폼별로 준비 중인 표준화된 자체 제품의 도입을 문의합니다. 고객별 맞춤 개발이 아닌 표준 제품을 기준으로 검토합니다.",
      keys: "기관 SaaS · 기업 복지 · 사업자 도구",
    },
    {
      title: "공공기관·단체 협력",
      body: "지자체, 공공기관, 복지·교육기관과 단체가 공공 정보 안내, 지역 프로그램, 공익 협력을 제안합니다. 공공 사업은 관련 법령과 조달·계약 절차를 따릅니다.",
      keys: "지자체 · 공공기관 · 복지·교육기관",
    },
    {
      title: "기술·글로벌 파트너십",
      body: "기술 연동, 데이터 보호·인프라 협력, 해외 시장 현지화와 라이선싱처럼 플랫폼 확장을 위한 협력을 문의합니다.",
      keys: "기술 연동 · 현지화 · 라이선싱",
    },
    {
      title: "기타 사업 문의",
      body: "위 유형에 해당하지 않는 NEWON 사업 관련 제안을 남겨 주세요. 외주 개발·제작 의뢰는 이 유형으로도 접수하지 않습니다.",
      keys: "NEWON 사업 전반",
    },
  ],

  platLabel: "SIX PLATFORMS",
  platTitle: "플랫폼별 사업 분야",
  platLead: "문의는 NEWON의 여섯 개 플랫폼을 기준으로 검토합니다. 소개된 사업 분야 중 상당수는 준비·검토 단계이며, 현재 상태는 각 플랫폼의 비즈니스 페이지에서 확인할 수 있습니다.",
  platMore: "비즈니스 페이지 보기 →",
  plats: {
    babylog: "임신·출산·육아·성장 기록 앱을 중심으로 보육·교육기관 SaaS, 육아 브랜드·기업 가족복지 솔루션, 공공 육아지원 정보, 육아 상품·서비스 연결, 해외 라이선싱으로 확장하는 패밀리 라이프 플랫폼입니다.",
    petlog: "반려동물의 일상·건강 기록을 기반으로 커뮤니티·커머스, 동물병원·미용·돌봄 등 적격 사업자 연결, 반려동물 사업자용 SaaS, 동물복지 공공 협력과 글로벌 라이선싱으로 확장하는 반려생활 플랫폼입니다.",
    myworld: "세계지도 기반 여행 기록에서 출발해 숙박·교통·패키지·액티비티 예약 제휴, 여행 커머스, 기업 출장·여행업체 SaaS, 지역 관광·관광기관 협력으로 넓혀 가는 여행 플랫폼입니다.",
    shareon: "개인과 기업의 실물 자산 공유·대여(C2C·B2C·C2B·B2B)를 기반으로 대여업체·공간 운영자 입점, 기업 자산 공유, SaaS·공공·글로벌 분야로 확장을 준비하는 공유경제 플랫폼입니다. 앱 출시 전으로 실제 대여·결제·정산은 운영되지 않습니다.",
    livon: "교육·커리어·주거·금융교육 등 생애 단계별 정보와 서비스를 연결하는 플랫폼입니다. 상품 직접 판매보다 정보·사용자 경험·기업용 솔루션 중심의 사업을 지향하며, 대부분의 사업 영역은 준비 또는 구상 단계입니다. 현재 앱 출시를 준비하고 있습니다.",
    ongil: "시니어의 일상, 가족 연결, 건강 생활, 돌봄·복지 정보를 기반으로 돌봄 사업자 도구, 요양·복지기관 SaaS, 기업 임직원 가족 돌봄 복지, 공공·지자체 협력, 글로벌 라이선스로 확장하는 시니어 라이프 플랫폼입니다.",
  },

  whoLabel: "WHO CAN INQUIRE",
  whoTitle: "문의할 수 있는 대상",
  who: [
    { title: "개인 사업자·전문가·크리에이터", body: "플랫폼 입점, 서비스 제공, 콘텐츠 협력을 검토하는 개인 사업자와 전문가, 크리에이터. 일부 영역은 사업자·자격 확인이 필요합니다." },
    { title: "기업·브랜드", body: "입점과 거래 참여, 브랜드·서비스 제휴, 기업용 서비스 도입을 검토하는 기업과 브랜드, 판매자." },
    { title: "공공기관·단체", body: "지자체와 공공기관, 보육·교육·복지기관, 비영리 단체 등 공공 정보와 공익 협력을 제안하는 기관." },
    { title: "기술·글로벌 파트너", body: "기술 연동과 인프라 협력을 제안하는 기술 기업, 현지화·라이선싱을 검토하는 해외 기업·기관." },
  ],

  procLabel: "INQUIRY PROCESS",
  procTitle: "문의 절차",
  procLead: "보내 주신 문의는 아래 순서로 검토합니다. 검토에 걸리는 시간은 문의 내용에 따라 다릅니다.",
  procMeta: "STEPS",
  steps: [
    { title: "문의 접수", body: "아래 양식이나 이메일로 보내 주신 문의는 NEWON 공식 문의 메일로 접수됩니다." },
    { title: "제안 내용 확인", body: "문의 유형과 관련 플랫폼, 제안 내용을 플랫폼별 사업 방향과 운영 기준에 비추어 확인합니다." },
    { title: "필요시 추가 정보 요청", body: "검토에 필요한 경우 입력하신 이메일로 추가 자료나 정보를 요청드립니다." },
    { title: "협력 가능성 및 조건 협의", body: "협력 가능성이 있는 경우 범위와 조건을 협의합니다. 문의가 제휴 승인이나 계약 체결을 보장하지는 않습니다." },
  ],

  formTitle: "사업 문의",
  formLead: "필수 항목(*)을 입력해 주세요. 보내 주신 내용은 NEWON 공식 문의 메일(newon@newon.app)로 전달됩니다.",
  formReq: "* 표시는 필수 항목입니다.",
  optional: "선택",
  labelName: "담당자 이름",
  phName: "이름을 입력해 주세요",
  labelEmail: "이메일",
  phEmail: "name@company.com",
  labelCompany: "기업·기관명",
  phCompany: "해당하는 경우 입력해 주세요",
  labelPhone: "연락처",
  phPhone: "연락 가능한 번호",
  labelType: "문의 유형",
  typePlaceholder: "문의 유형을 선택해 주세요",
  types: {
    "platform-participation": "플랫폼 입점 및 거래 참여",
    "brand-partnership": "브랜드·서비스·콘텐츠 제휴",
    "enterprise-adoption": "기업용 서비스 도입",
    "public-partnership": "공공기관·단체 협력",
    "tech-global": "기술·글로벌 파트너십",
    other: "기타 사업 문의",
  },
  labelPlatform: "관련 플랫폼",
  platformPlaceholder: "선택해 주세요",
  platformExtra: { multiple: "복수 플랫폼", undecided: "아직 정하지 않음" },
  labelWebsite: "회사·서비스 웹사이트",
  phWebsite: "https://",
  labelMessage: "문의 내용",
  phMessage: "제안하려는 내용과 협력 방식, 관련 플랫폼, 기업·기관 소개를 적어 주세요. 민감한 개인정보는 적지 말아 주세요.",
  consent: "[필수] 개인정보 수집·이용에 동의합니다.",
  consentHint:
    "수집 목적: 사업 문의 확인 및 회신 · 수집 항목: 이름, 이메일, 문의 유형, 문의 내용(입력한 경우 기업·기관명, 연락처, 관련 플랫폼, 웹사이트) · 보유 기간: 문의 확인과 회신에 필요한 기간 동안 보관하며, 열람·삭제 등을 요청하시면 관련 법령에 따라 조치합니다. 그 밖의 사항은 개인정보처리방침을 따릅니다.",
  privacyLink: "개인정보처리방침",
  submit: "문의 보내기 →",
  submitting: "문의 보내는 중...",
  mailSubject: "NEWON 사업 문의",
  storeTitle: "구매 문의",
  storeLead: "상품과 연락처를 남겨 주시면 확인 후 이메일로 안내드립니다.",
  storeSelected: "선택한 상품",
  storeTypeHint: "문의 유형",
  storeSelectPh: "선택해 주세요",
  storeSubject: "NEWON 스토어 구매 문의",
  storePh: "구매하려는 상품과 문의 내용을 적어 주세요.",
  storeOption: "스토어 상품 구매 문의",
  fail: "문의를 보내지 못했습니다. 잠시 후 다시 시도하거나 newon@newon.app으로 직접 보내 주세요.",

  faqLabel: "FAQ",
  faqTitle: "사업 문의 안내",
  faq: [
    {
      q: "개인도 사업 문의가 가능한가요?",
      a: "네. 개인 사업자, 전문가, 크리에이터도 입점·서비스 제공·콘텐츠 협력을 문의할 수 있습니다. 전문 서비스나 차량·공간 대여처럼 사업자·자격 확인이 필요한 영역이 있습니다. 앱 이용에 관한 문의는 각 플랫폼의 문의 페이지를 이용해 주세요.",
    },
    {
      q: "어떤 플랫폼에 관한 문의를 할 수 있나요?",
      a: "BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL 여섯 개 플랫폼에 관한 입점·제휴·도입·협력 문의를 받습니다. 플랫폼별 사업 분야와 현재 상태는 각 플랫폼의 비즈니스 페이지에서 확인할 수 있습니다.",
    },
    {
      q: "여러 플랫폼을 함께 제안할 수 있나요?",
      a: "네. '관련 플랫폼'에서 '복수 플랫폼'을 선택하고, 문의 내용에 함께 제안하려는 플랫폼과 연결 방식을 적어 주세요. 아직 정하지 않았다면 '아직 정하지 않음'을 선택해도 됩니다.",
    },
    {
      q: "입점과 파트너십은 어떻게 다른가요?",
      a: "입점은 판매자·서비스 사업자가 플랫폼에 상품·서비스·자산을 등록하고 이용자와 거래하는 참여 방식입니다. 파트너십은 브랜드 캠페인, 서비스 연계, 콘텐츠, 기술, 공공 협력처럼 NEWON과 범위와 조건을 따로 협의해 진행하는 협력입니다.",
    },
    {
      q: "기업용 서비스 도입을 문의할 수 있나요?",
      a: "네. 보육·교육기관 SaaS, 요양·복지기관 SaaS, 기업 가족복지 솔루션처럼 플랫폼별 표준 제품의 도입을 문의할 수 있습니다. 대부분 준비·검토 단계이며, 요금과 제공 범위는 출시와 확정 이후에 안내합니다.",
    },
    {
      q: "공공기관도 협력을 제안할 수 있나요?",
      a: "네. 지자체, 공공기관, 복지·교육기관이 공공 정보 안내, 지역 프로그램, 공익 협력을 제안할 수 있습니다. 공공 사업은 관련 법령과 조달·계약 절차에 따라 진행합니다.",
    },
    {
      q: "문의 후에는 어떤 절차가 진행되나요?",
      a: "문의 접수, 제안 내용 확인, 필요시 추가 정보 요청, 협력 가능성 및 조건 협의 순서로 진행합니다. 검토 결과는 입력하신 이메일로 안내하며, 문의가 제휴 승인이나 계약 체결을 보장하지는 않습니다.",
    },
    {
      q: "외주 웹·앱 제작도 의뢰할 수 있나요?",
      a: "아니요. NEWON은 고객별 외주 웹·앱 제작, 맞춤 개발, 디자인 대행 서비스를 운영하지 않습니다. NEWON은 여섯 개 플랫폼과 자체 제품을 중심으로 사업하며, 이 페이지에서는 해당 플랫폼과 관련된 입점·제휴·도입·협력 문의만 받습니다.",
    },
  ],

  contactLabel: "DIRECT CONTACT",
  contactTitle: "이메일로도 문의할 수 있습니다.",
  contactLead: "양식 대신 newon@newon.app으로 보내 주셔도 됩니다. 기업·기관명, 관련 플랫폼, 문의 유형을 함께 적어 주시면 검토에 도움이 됩니다.",
  contactEmailCta: "newon@newon.app 이메일 보내기 →",
};

const EN = {
  seoTitle: "Business Inquiry | NEWON",
  metaDescription:
    "Inquiries about joining, partnering with, adopting enterprise services from, or collaborating with NEWON's six digital platforms: BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON and ONGIL.",

  heroCrumbLeft: "Business & Partnerships",
  heroCrumbRight: "INQUIRY",
  heroLabel: "BUSINESS INQUIRY",
  heroRole: "Business & partnership inquiries",
  heroTitleHtml: "Connecting new<br />business possibilities.",
  heroLead: "Built on NEWON's six digital platforms, we take inquiries about platform participation, business partnerships, enterprise service adoption and institutional collaboration.",
  heroDomainsAria: "Inquiry areas",
  heroDomains: ["Participation", "Partnerships", "Enterprise", "Institutions"],
  heroCta: "Make a business inquiry",
  heroBack: "View Business & Partnerships →",

  catLabel: "INQUIRY CATEGORIES",
  catTitle: "What would you like to discuss?",
  catLead: "There are six inquiry types. We do not take custom web or app production, custom development, design agency work or production quotes.",
  cats: [
    {
      title: "Platform participation & transactions",
      body: "For sellers and brands, service providers, rental businesses and space operators who want to list products, services or assets on a NEWON platform and take part in transactions. Listing and transaction features open according to each platform's launch stage and business verification.",
      keys: "Sellers · Service providers · Rental businesses",
    },
    {
      title: "Brand, service & content partnerships",
      body: "Propose brand campaigns, service integrations, or expert and creator content relevant to platform users. Partnership format and terms are agreed according to each platform's operating standards.",
      keys: "Brand campaigns · Service links · Content",
    },
    {
      title: "Enterprise service adoption",
      body: "Ask about adopting NEWON's standardized products being prepared on each platform, such as SaaS for childcare and education institutions, SaaS for care and welfare facilities, or employee family-welfare solutions. We review against standard products, not custom development.",
      keys: "Institution SaaS · Employee welfare · Provider tools",
    },
    {
      title: "Public sector & organization collaboration",
      body: "Local governments, public agencies, welfare and education institutions and organizations can propose public information services, local programs and public-interest collaboration. Public projects follow the applicable laws and procurement and contracting procedures.",
      keys: "Local government · Public agencies · Institutions",
    },
    {
      title: "Technology & global partnerships",
      body: "Ask about collaboration that helps the platforms grow, such as technical integration, data protection and infrastructure, localization for overseas markets, and licensing.",
      keys: "Integration · Localization · Licensing",
    },
    {
      title: "Other business inquiries",
      body: "Send any NEWON business proposal that does not fit the types above. Outsourced development or production requests are not accepted under this type either.",
      keys: "NEWON business in general",
    },
  ],

  platLabel: "SIX PLATFORMS",
  platTitle: "Business areas by platform",
  platLead: "Inquiries are reviewed against NEWON's six platforms. Many of the business areas described are still in preparation or under review; each platform's business page shows the current status.",
  platMore: "View business page →",
  plats: {
    babylog: "A family-life platform built around an app for pregnancy, birth, parenting and growth records, expanding into SaaS for childcare and education institutions, parenting-brand and employee family-welfare solutions, public parenting-support information, parenting products and services, and overseas licensing.",
    petlog: "A pet-life platform built on daily and health records for pets, expanding into community and commerce, connections with qualified providers such as vets, groomers and carers, SaaS for pet businesses, public animal-welfare collaboration and global licensing.",
    myworld: "A travel platform that starts from map-based travel records and extends toward booking partnerships for stays, transport, packages and activities, travel commerce, SaaS for business travel and travel companies, and local tourism and tourism-agency collaboration.",
    shareon: "A sharing-economy platform for renting and sharing physical assets between individuals and businesses (C2C, B2C, C2B, B2B), preparing to expand into rental-business and space-operator listings, business asset sharing, SaaS, public and global areas. The app has not launched, so no rentals, payments or settlements are operating yet.",
    livon: "A platform connecting life-stage information and services such as education, careers, housing and financial education. Rather than selling products directly, it focuses on information, user experience and solutions for organizations; most business areas are in preparation or at the concept stage. The app is being prepared for launch.",
    ongil: "A senior-life platform built on seniors' daily life, family connection, healthy living, and care and welfare information, expanding into tools for care providers, SaaS for care and welfare facilities, employee family-care welfare, public and local-government collaboration, and global licensing.",
  },

  whoLabel: "WHO CAN INQUIRE",
  whoTitle: "Who can send an inquiry",
  who: [
    { title: "Sole traders, experts & creators", body: "Individual business owners, experts and creators considering platform listings, service provision or content collaboration. Some areas require business or qualification checks." },
    { title: "Companies & brands", body: "Companies, brands and sellers considering participation and transactions, brand and service partnerships, or enterprise service adoption." },
    { title: "Public bodies & organizations", body: "Local governments, public agencies, childcare, education and welfare institutions, and non-profits proposing public information or public-interest collaboration." },
    { title: "Technology & global partners", body: "Technology companies proposing integration or infrastructure collaboration, and overseas companies and institutions considering localization or licensing." },
  ],

  procLabel: "INQUIRY PROCESS",
  procTitle: "How inquiries are handled",
  procLead: "Inquiries are reviewed in the order below. How long a review takes depends on the inquiry.",
  procMeta: "STEPS",
  steps: [
    { title: "Inquiry received", body: "Inquiries sent with the form below or by email arrive at NEWON's official inquiry mailbox." },
    { title: "Proposal review", body: "We check the inquiry type, related platform and proposal against each platform's business direction and operating standards." },
    { title: "Further information if needed", body: "If the review needs it, we ask for more material or information by email." },
    { title: "Discussing fit and terms", body: "Where there is potential to work together, we discuss scope and terms. An inquiry does not guarantee partnership approval or a contract." },
  ],

  formTitle: "Business inquiry",
  formLead: "Please fill in the required fields (*). Your inquiry is delivered to NEWON's official inquiry mailbox (newon@newon.app).",
  formReq: "Required fields are marked with an asterisk.",
  optional: "Optional",
  labelName: "Contact name",
  phName: "Enter your name",
  labelEmail: "Email",
  phEmail: "name@company.com",
  labelCompany: "Company or organization",
  phCompany: "If applicable",
  labelPhone: "Phone",
  phPhone: "A number we can reach",
  labelType: "Inquiry type",
  typePlaceholder: "Select an inquiry type",
  types: {
    "platform-participation": "Platform participation & transactions",
    "brand-partnership": "Brand, service & content partnership",
    "enterprise-adoption": "Enterprise service adoption",
    "public-partnership": "Public sector & organization collaboration",
    "tech-global": "Technology & global partnership",
    other: "Other business inquiry",
  },
  labelPlatform: "Related platform",
  platformPlaceholder: "Please select",
  platformExtra: { multiple: "Multiple platforms", undecided: "Not decided yet" },
  labelWebsite: "Company or service website",
  phWebsite: "https://",
  labelMessage: "Inquiry details",
  phMessage: "Describe your proposal, how you would like to work together, the related platform, and your company or organization. Please do not include sensitive personal information.",
  consent: "[Required] I agree to the collection and use of my personal information.",
  consentHint:
    "Purpose: reviewing and replying to your business inquiry · Items: name, email, inquiry type, inquiry details (and, if entered, company or organization, phone, related platform, website) · Retention: kept for as long as needed to review and reply to your inquiry; requests for access or deletion are handled in line with applicable law. Everything else follows the Privacy Policy.",
  privacyLink: "Privacy Policy",
  submit: "Send inquiry →",
  submitting: "Sending inquiry...",
  mailSubject: "NEWON business inquiry",
  storeTitle: "Purchase inquiry",
  storeLead: "Leave the product and your contact details and we will reply by email after checking.",
  storeSelected: "Selected product",
  storeTypeHint: "Inquiry type",
  storeSelectPh: "Please select",
  storeSubject: "NEWON store purchase inquiry",
  storePh: "Tell us which product you would like and your question.",
  storeOption: "Store product purchase",
  fail: "Your inquiry could not be sent. Please try again in a moment or email newon@newon.app directly.",

  faqLabel: "FAQ",
  faqTitle: "About business inquiries",
  faq: [
    {
      q: "Can individuals send a business inquiry?",
      a: "Yes. Sole traders, experts and creators can ask about listings, providing services or content collaboration. Some areas, such as professional services or vehicle and space rental, require business or qualification checks. For questions about using an app, please use that platform's contact page.",
    },
    {
      q: "Which platforms can I ask about?",
      a: "We take participation, partnership, adoption and collaboration inquiries about six platforms: BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON and ONGIL. Each platform's business page shows its business areas and current status.",
    },
    {
      q: "Can I propose something across several platforms?",
      a: "Yes. Choose \"Multiple platforms\" under Related platform and describe which platforms you have in mind and how they would connect. If you have not decided yet, choose \"Not decided yet\".",
    },
    {
      q: "How is participation different from a partnership?",
      a: "Participation means sellers or service providers listing products, services or assets on a platform and transacting with its users. A partnership is a collaboration whose scope and terms are agreed separately with NEWON, such as a brand campaign, service integration, content, technology or public-sector collaboration.",
    },
    {
      q: "Can I ask about adopting an enterprise service?",
      a: "Yes. You can ask about adopting standard products on each platform, such as SaaS for childcare and education institutions, SaaS for care and welfare facilities, or employee family-welfare solutions. Most are in preparation or under review; pricing and scope are shared after launch and confirmation.",
    },
    {
      q: "Can public bodies propose a collaboration?",
      a: "Yes. Local governments, public agencies and welfare or education institutions can propose public information services, local programs and public-interest collaboration. Public projects follow the applicable laws and procurement and contracting procedures.",
    },
    {
      q: "What happens after I send an inquiry?",
      a: "The inquiry is received, the proposal is reviewed, further information is requested if needed, and fit and terms are discussed. We reply to the email address you entered. An inquiry does not guarantee partnership approval or a contract.",
    },
    {
      q: "Can I commission outsourced web or app production?",
      a: "No. NEWON does not operate client-specific outsourced web or app production, custom development or design agency services. NEWON's business centers on its six platforms and its own products, and this page only takes participation, partnership, adoption and collaboration inquiries related to those platforms.",
    },
  ],

  contactLabel: "DIRECT CONTACT",
  contactTitle: "Or email us directly.",
  contactLead: "Instead of the form, you can write to newon@newon.app. Including your company or organization, the related platform and the inquiry type helps the review.",
  contactEmailCta: "Email newon@newon.app →",
};

/** Korean and English are written; the other locales reuse English (returned with fallback=true). */
export function inquiryCopy(lang) {
  if (lang === "ko") return { c: KO, fallback: false };
  if (lang === "en") return { c: EN, fallback: false };
  return { c: EN, fallback: true };
}
