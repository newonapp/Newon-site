/**
 * NEWON Business & Partnerships — copy and data for the five hub screens (/{lang}/business/…).
 *
 *   01 Overview         /{lang}/business/
 *   02 Our Platforms    /{lang}/business/platforms/
 *   03 Business Models  /{lang}/business/models/
 *   04 Partnerships     /{lang}/business/partnerships/
 *   05 Contact          /{lang}/business/contact/
 *
 * Source: the owner's "BUSINESS & PARTNERSHIPS — FINAL MASTER COMMAND" (2026-10-19), ko wording kept;
 * en is a meaning-checked draft (not native-reviewed); the other seven locales show the English body
 * inside lang="en" until reviewed translations exist.
 *
 * Honesty rules applied to every line here: no prices, customers, partner logos, contract or revenue
 * figures; models that are not running yet are written as direction ("지향합니다", "검토합니다");
 * one shared notice per page at the bottom of Business Models and Partnerships (no per-card badges).
 * NEWON does not take custom web/app/MVP builds, third-party maintenance or quotes.
 */

export const BP_SLUG = "business";

/** The five screens (order = sub-menu order). `sub` is relative to /{lang}/business/. */
export const BP_NAV = [
  { id: "overview", n: "01", en: "Overview", ko: "개요", sub: "" },
  { id: "platforms", n: "02", en: "Our Platforms", ko: "플랫폼", sub: "platforms" },
  { id: "models", n: "03", en: "Business Models", ko: "비즈니스 모델", sub: "models" },
  { id: "partnerships", n: "04", en: "Partnerships", ko: "파트너십", sub: "partnerships" },
  { id: "contact", n: "05", en: "Contact", ko: "문의", sub: "contact" },
];

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/";
/** First-screen films (owner, 2026-10-19): Studio film for Overview / Our Platforms / Business Models,
 *  the existing Partnerships film for Partnerships and Contact. */
export const BP_FILMS = {
  studio: `${CDN}hf_20260622_202655_a7f5aca0-2f80-4bc9-bcb5-96ac95662003.mp4`,
  partnerships: `${CDN}hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4`,
};
export const BP_PAGE_FILM = { overview: "studio", platforms: "studio", models: "studio", partnerships: "partnerships", contact: "partnerships" };

/** The six flagship platforms. `slug` = their own site folder (/{lang}/{slug}/business/ and /partnerships/). */
export const BP_PLATFORMS = [
  {
    id: "babylog",
    slug: "babylog",
    name: "BABYLOG",
    category: "Parenting & Family",
    ko: {
      headline: "아이와 가족의 성장을 연결합니다.",
      desc: "임신·출산·육아·성장과 가족생활을 아우르는 플랫폼.",
      keywords: ["육아 브랜드", "교육", "가족생활", "돌봄", "기업 솔루션"],
      title: "가족의 성장과 함께하는 비즈니스.",
      lead: "육아·가족 관련 브랜드, 교육·돌봄 사업자, 기업과 기관이 연결될 수 있는 플랫폼 생태계를 지향합니다.",
      areas: ["육아·가족생활", "교육", "돌봄", "가족 관련 상품", "기업 솔루션"],
      partners: ["육아 브랜드", "교육 사업자", "가족 서비스", "기관 협력"],
      find: "육아·가족·교육·돌봄 협력",
    },
    en: {
      headline: "Connecting the growth of children and families.",
      desc: "A platform covering pregnancy, birth, parenting, growth and family life.",
      keywords: ["Parenting brands", "Education", "Family life", "Care", "Business solutions"],
      title: "Business that grows with families.",
      lead: "Aims to be an ecosystem where parenting and family brands, education and care providers, companies and institutions can connect.",
      areas: ["Parenting & family life", "Education", "Care", "Family products", "Business solutions"],
      partners: ["Parenting brands", "Education providers", "Family services", "Institutions"],
      find: "Parenting, family, education and care",
    },
  },
  {
    id: "petlog",
    slug: "petlog",
    name: "PETLOG",
    category: "Pet Life",
    ko: {
      headline: "반려동물과 함께하는 삶을 연결합니다.",
      desc: "반려동물의 일상과 건강 관련 정보, 생활·돌봄 서비스를 아우르는 플랫폼.",
      keywords: ["반려동물 브랜드", "커머스", "생활 서비스", "돌봄", "기업 솔루션"],
      title: "반려생활의 새로운 가치를 연결합니다.",
      lead: "반려동물 브랜드와 생활 서비스, 돌봄 사업자, 기업 솔루션의 다양한 협력 기회를 지향합니다.",
      areas: ["반려동물 생활", "커머스", "건강 관련 정보", "돌봄", "기업 솔루션"],
      partners: ["반려동물 브랜드", "생활 서비스", "돌봄 사업자", "기관 협력"],
      find: "반려동물·생활 서비스·커머스 협력",
    },
    en: {
      headline: "Connecting life with pets.",
      desc: "A platform covering pets' everyday life, health-related information and life and care services.",
      keywords: ["Pet brands", "Commerce", "Life services", "Care", "Business solutions"],
      title: "Connecting new value in life with pets.",
      lead: "Aims for a range of partnerships with pet brands, life services, care providers and business solutions.",
      areas: ["Pet life", "Commerce", "Health-related information", "Care", "Business solutions"],
      partners: ["Pet brands", "Life services", "Care providers", "Institutions"],
      find: "Pets, life services and commerce",
    },
  },
  {
    id: "myworld",
    slug: "myworld",
    name: "MY WORLD",
    category: "Travel & Experience",
    ko: {
      headline: "여행의 모든 순간에서 새로운 기회를 발견합니다.",
      desc: "여행의 발견·계획·경험·기록을 연결하는 플랫폼.",
      keywords: ["관광", "숙박", "여행 브랜드", "체험", "기업·기관 솔루션"],
      title: "여행의 모든 순간에서 새로운 기회를.",
      lead: "여행 브랜드와 관광·숙박·체험 사업자, 지역 및 기관을 연결하는 여행 생태계를 지향합니다.",
      areas: ["여행 정보", "관광", "숙박", "체험", "기업·기관 솔루션"],
      partners: ["관광 사업자", "여행 브랜드", "숙박·체험 사업자", "지역 협력"],
      find: "여행·관광·숙박·체험 협력",
    },
    en: {
      headline: "Finding new opportunities in every moment of travel.",
      desc: "A platform that connects discovering, planning, experiencing and recording travel.",
      keywords: ["Tourism", "Stays", "Travel brands", "Experiences", "Business & institution solutions"],
      title: "New opportunities in every moment of travel.",
      lead: "Aims for a travel ecosystem that connects travel brands, tourism, stay and experience providers, regions and institutions.",
      areas: ["Travel information", "Tourism", "Stays", "Experiences", "Business & institution solutions"],
      partners: ["Tourism providers", "Travel brands", "Stay & experience providers", "Regional partners"],
      find: "Travel, tourism, stays and experiences",
    },
  },
  {
    id: "shareon",
    slug: "shareon",
    name: "SHAREON",
    category: "Asset Sharing & Rental",
    ko: {
      headline: "소유를 넘어, 자산의 활용 가치를 연결합니다.",
      desc: "개인과 기업이 실물 자산을 공유하고 대여할 수 있도록 연결하는 오픈 마켓플레이스.",
      keywords: ["자산 공급", "대여 거래", "기업 자산 활용", "거래 지원", "SaaS"],
      title: "자산의 활용 가치를 넓히는 마켓플레이스.",
      lead: "개인과 기업이 실물 자산을 공유하고 대여할 수 있는 거래 생태계와 기업 솔루션을 지향합니다.",
      areas: ["실물 자산 대여", "기업 자산 활용", "거래 지원", "기업 SaaS"],
      partners: ["개인 공급자", "기업 공급자", "대여 사업자", "거래 인프라 파트너"],
      find: "개인·기업 자산 공급 및 대여 생태계",
    },
    en: {
      headline: "Beyond ownership: connecting the value of using assets.",
      desc: "An open marketplace that lets people and businesses share and rent physical assets.",
      keywords: ["Asset supply", "Rental transactions", "Business asset use", "Transaction support", "SaaS"],
      title: "A marketplace that widens what assets can do.",
      lead: "Aims for a transaction ecosystem and business solutions where people and businesses share and rent physical assets.",
      areas: ["Physical asset rental", "Business asset use", "Transaction support", "Business SaaS"],
      partners: ["Individual suppliers", "Business suppliers", "Rental businesses", "Transaction infrastructure partners"],
      find: "Asset supply and rental by people and businesses",
    },
  },
  {
    id: "livon",
    slug: "livon",
    name: "LIVON",
    category: "Life Stage",
    ko: {
      headline: "인생의 다양한 단계에 필요한 기회를 연결합니다.",
      desc: "교육·진로·취업·창업·주거·가족·복지·은퇴 등 생애주기 전반을 아우르는 플랫폼.",
      keywords: ["교육", "채용", "생활정보", "기업 복지", "공공기관 솔루션"],
      title: "인생의 다양한 단계에 필요한 연결.",
      lead: "교육·진로·취업·창업·주거·복지 등 생애주기별 정보와 기업·기관 솔루션을 연결합니다.",
      areas: ["교육", "취업", "창업", "생활정보", "기업 복지", "공공기관 솔루션"],
      partners: ["교육기관", "기업", "생활 서비스 사업자", "공공기관"],
      find: "교육·진로·취업·창업·생활·복지 협력",
    },
    en: {
      headline: "Connecting the opportunities each stage of life needs.",
      desc: "A platform across the whole life cycle: education, careers, jobs, start-ups, housing, family, welfare and retirement.",
      keywords: ["Education", "Hiring", "Everyday information", "Employee benefits", "Public-sector solutions"],
      title: "Connections for every stage of life.",
      lead: "Connects life-stage information on education, careers, jobs, start-ups, housing and welfare with business and institution solutions.",
      areas: ["Education", "Jobs", "Start-ups", "Everyday information", "Employee benefits", "Public-sector solutions"],
      partners: ["Education institutions", "Companies", "Life service providers", "Public bodies"],
      find: "Education, careers, jobs, start-ups, life and welfare",
    },
  },
  {
    id: "ongil",
    slug: "ongil",
    name: "ONGIL",
    category: "Senior Life",
    ko: {
      headline: "시니어의 더 나은 일상과 가능성을 연결합니다.",
      desc: "시니어의 일상·가족 연결·건강 관련 정보·돌봄·복지·사회참여를 아우르는 플랫폼.",
      keywords: ["시니어 생활", "가족 지원", "돌봄·복지", "기관 솔루션", "SaaS"],
      title: "더 나은 시니어의 일상을 위한 연결.",
      lead: "시니어 생활 서비스와 가족 지원, 돌봄·복지기관, 기업·공공 솔루션의 협력 기회를 지향합니다.",
      areas: ["시니어 생활", "가족 연결", "건강 관련 정보", "돌봄·복지", "기업·기관 솔루션"],
      partners: ["시니어 생활 사업자", "돌봄·복지기관", "기업", "공공기관"],
      find: "시니어 생활·돌봄·복지·기관 협력",
    },
    en: {
      headline: "Connecting better days and new possibilities for seniors.",
      desc: "A platform covering seniors' everyday life, family connection, health-related information, care, welfare and social participation.",
      keywords: ["Senior life", "Family support", "Care & welfare", "Institution solutions", "SaaS"],
      title: "Connections for better senior days.",
      lead: "Aims for partnerships with senior life services, family support, care and welfare institutions, and business and public solutions.",
      areas: ["Senior life", "Family connection", "Health-related information", "Care & welfare", "Business & institution solutions"],
      partners: ["Senior life providers", "Care & welfare institutions", "Companies", "Public bodies"],
      find: "Senior life, care, welfare and institutions",
    },
  },
];

/** Contact: the ten inquiry types (value = what reaches the inbox; code = ?type= preselection). */
export const BP_INQUIRY_TYPES = [
  { code: "general", value: "General Business Inquiry", ko: ["일반 사업 문의", "NEWON의 사업 전반에 관한 문의"], en: ["General business inquiry", "Questions about NEWON's business in general"] },
  { code: "participation", value: "Platform Participation", ko: ["플랫폼 참여·입점", "적격 개인·기업의 플랫폼 참여와 입점"], en: ["Platform participation", "Joining or listing on a platform as an eligible person or business"] },
  { code: "commerce", value: "Transaction & Commerce", ko: ["거래·커머스 협력", "상품·서비스·실물 자산 거래 관련 협력"], en: ["Transaction & commerce", "Partnerships around trading goods, services and assets"] },
  { code: "saas", value: "Enterprise SaaS", ko: ["기업용 SaaS 도입", "NEWON 자체 제품과 표준 솔루션 도입"], en: ["Enterprise SaaS", "Adopting NEWON's own products and standard solutions"] },
  { code: "institution", value: "Institutional Solutions", ko: ["기관용 솔루션", "교육·복지기관 등을 위한 표준 솔루션"], en: ["Institutional solutions", "Standard solutions for education, welfare and other institutions"] },
  { code: "brand", value: "Brand Partnerships", ko: ["브랜드·서비스 제휴", "플랫폼 이용자와 관련된 브랜드·서비스 제휴"], en: ["Brand partnerships", "Brand and service partnerships relevant to platform users"] },
  { code: "technology", value: "Technology Partnerships", ko: ["기술 협력", "기술 연동·데이터 보호·인프라 협력"], en: ["Technology partnerships", "Integration, data protection and infrastructure"] },
  { code: "public", value: "Public Sector", ko: ["공공기관 협력", "지자체·공공기관과의 협력 제안"], en: ["Public sector", "Proposals with local governments and public bodies"] },
  { code: "global", value: "Global Partnerships", ko: ["글로벌 협력", "해외 시장과 글로벌 확장 협력"], en: ["Global partnerships", "Overseas markets and global expansion"] },
  { code: "other", value: "Other Business Proposals", ko: ["기타 사업 제안", "위 유형에 해당하지 않는 사업 제안"], en: ["Other business proposals", "Proposals that fit none of the types above"] },
];

/** Contact: platform select (value = what reaches the inbox; code = ?platform= preselection). */
export const BP_INQUIRY_PLATFORMS = [
  ...BP_PLATFORMS.map((p) => ({ code: p.id, value: p.name, ko: p.name, en: p.name })),
  { code: "multiple", value: "Multiple Platforms", ko: "여러 플랫폼", en: "Multiple platforms" },
  { code: "general", value: "General NEWON Business", ko: "NEWON 전체 사업", en: "General NEWON business" },
];

const KO = {
  ui: {
    menuLabel: "비즈니스·파트너십 메뉴",
    crumb: "비즈니스·파트너십",
    eyebrow: "NEWON BUSINESS & PARTNERSHIPS",
    infoOnly: "NEWON 웹사이트는 회사와 사업을 소개하는 정보 제공용 사이트입니다. 로그인·결제·예약 기능은 제공하지 않습니다.",
    notice: "NEWON은 자체 플랫폼을 기반으로 다양한 비즈니스 모델을 발전시키고 있습니다. 실제 제공 서비스와 계약 조건은 플랫폼 및 운영 단계에 따라 달라질 수 있습니다.",
    toBusiness: "Business 자세히 보기",
    toPartnerships: "Partnerships 자세히 보기",
    platformBusiness: (n) => `${n} Business`,
    platformPartnerships: (n) => `${n} Partnerships`,
    categoryLabel: "카테고리",
    keywordsLabel: "사업 키워드",
    areasLabel: "주요 사업 분야",
    partnersLabel: "협력 대상",
    applicationsLabel: "적용 가능 분야",
    railLabel: "플랫폼 바로가기",
    askType: "이 유형으로 문의하기",
  },
  seo: {
    overview: { title: "NEWON Business & Partnerships | 플랫폼 비즈니스·기업 제휴", desc: "NEWON의 6개 플랫폼을 기반으로 한 기업사업, SaaS, 거래 수수료, 기업·기관 계약과 파트너십 기회를 살펴보세요." },
    platforms: { title: "Our Platforms | NEWON Business & Partnerships", desc: "BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL의 플랫폼별 사업 분야와 기업·기관 협력 기회를 확인하세요." },
    models: { title: "Business Models | NEWON", desc: "NEWON의 플랫폼 기반 거래 수수료, 기업용 SaaS, 기업·기관 계약, 제휴와 자체 제품 라이선싱 사업모델을 소개합니다." },
    partnerships: { title: "Partnerships | NEWON", desc: "NEWON의 6개 플랫폼과 관련된 기업 입점, 브랜드·서비스 제휴, 기관 협력과 기술·글로벌 파트너십을 살펴보세요." },
    contact: { title: "Business Contact | NEWON", desc: "NEWON 플랫폼 입점, 기업용 SaaS 도입, 브랜드·서비스 제휴와 기관 협력에 관한 비즈니스 문의를 접수합니다." },
  },
  overview: {
    hero: {
      eyebrow: "NEWON BUSINESS & PARTNERSHIPS",
      wordmark: "Business",
      titleHtml: "여섯 개의 플랫폼,<br>더 넓은 비즈니스의 가능성.",
      lead: "NEWON은 육아·반려생활·여행·자산 공유·생애주기·시니어 라이프 분야의 자체 디지털 플랫폼을 개발하고 운영합니다. 각 플랫폼의 전문성을 기반으로 개인과 기업, 기관이 연결되는 새로운 비즈니스 생태계를 만들어갑니다.",
      ctaMain: "6개 플랫폼 살펴보기",
      ctaSub: "비즈니스 모델 알아보기",
    },
    about: {
      kicker: "01 · ABOUT OUR BUSINESS",
      title: "제품을 넘어,\n플랫폼의 가치를 확장합니다.",
      lines: [
        "NEWON은 고객별 외주 제작이 아닌 자체 플랫폼과 디지털 제품을 중심으로 사업을 전개합니다.",
        "서로 다른 생활 영역에 집중하는 여섯 개의 플랫폼을 통해 기업 참여, 적격 거래, 서비스 협력, 기업용 솔루션과 기관 협력의 기회를 확대하고자 합니다.",
        "각 플랫폼의 사업 방향과 협력 가능성은 해당 플랫폼의 상세 페이지에서 확인할 수 있습니다.",
      ],
    },
    platforms: {
      kicker: "02 · SIX CORE PLATFORMS",
      title: "서로 다른 일상,\n하나의 NEWON 생태계.",
      lead: "각자의 삶에 필요한 플랫폼에서 새로운 연결과 사업 기회를 발견할 수 있습니다.",
    },
    approach: {
      kicker: "03 · OUR BUSINESS APPROACH",
      title: "플랫폼을 중심으로\n확장되는 비즈니스.",
      lead: "",
      items: [
        { n: "01", en: "Marketplace & Transactions", lead: "적격 개인과 기업이 플랫폼에서 거래에 참여하고, 플랫폼별 조건에 따른 거래 기반 수익모델을 발전시키는 방향." },
        { n: "02", en: "SaaS & Enterprise", lead: "기업과 기관이 NEWON의 자체 제품과 표준화된 솔루션을 활용할 수 있는 구독·계약 기반 사업모델." },
        { n: "03", en: "Partnerships & Ecosystem", lead: "브랜드·기업·기관·기술 파트너와 각 플랫폼의 특성에 맞는 협력 기회를 만들어가는 방향." },
        { n: "04", en: "Digital Products & Licensing", lead: "NEWON이 직접 개발하고 소유하는 디지털 제품과 솔루션을 상품화하고 라이선싱하는 방향." },
      ],
      cta: "비즈니스 모델 자세히 보기",
    },
    ecosystem: {
      kicker: "04 · OUR ECOSYSTEM",
      title: "개인부터\n기업과 기관까지.",
      lead: "NEWON의 플랫폼은 서로 다른 참여자가 각자의 방식으로 연결되는 구조를 지향합니다.",
      items: [
        { n: "01", name: "개인 판매자·자산 공급자", lead: "상품·서비스·실물 자산을 플랫폼에서 직접 제공하는 개인." },
        { n: "02", name: "소상공인·사업자", lead: "지역과 업종에 맞는 방식으로 플랫폼 이용자와 만나는 사업자." },
        { n: "03", name: "브랜드·기업", lead: "플랫폼 이용자의 생활과 관련된 상품·서비스를 가진 브랜드와 기업." },
        { n: "04", name: "교육·생활 서비스 사업자", lead: "교육·돌봄·생활 분야에서 필요한 정보와 서비스를 제공하는 사업자." },
        { n: "05", name: "기관·지자체", lead: "생활 서비스 접근성과 정보 연결을 함께 검토할 수 있는 기관과 지자체." },
        { n: "06", name: "기술·글로벌 파트너", lead: "기술 연동, 데이터 보호, 해외 확장을 함께 검토할 수 있는 파트너." },
      ],
      note: "위 대상은 NEWON이 협력을 지향하는 참여자 유형이며, 실제 계약이나 제휴 관계를 뜻하지 않습니다.",
    },
    close: {
      kicker: "NEXT STEP",
      titleHtml: "NEWON의 플랫폼에서<br>새로운 기회를 발견하세요.",
      lead: "사업 분야에 맞는 플랫폼을 살펴보고, NEWON과의 협력 가능성을 확인해 보세요.",
      ctaMain: "플랫폼별 사업 살펴보기",
      ctaSub: "협력 문의하기",
    },
  },
  platforms: {
    hero: {
      eyebrow: "OUR PLATFORMS",
      wordmark: "Business",
      titleHtml: "여섯 개의 플랫폼,<br>여섯 개의 비즈니스 생태계.",
      lead: "NEWON의 각 플랫폼은 서로 다른 생활 영역에 집중합니다. 기업과 파트너는 사업 분야에 맞는 플랫폼을 선택하고, 해당 플랫폼의 Business와 Partnerships 페이지에서 상세 내용을 확인할 수 있습니다.",
      ctaMain: "플랫폼 보기",
      ctaSub: "비즈니스 모델",
    },
    list: {
      kicker: "01 · SIX PLATFORMS",
      title: "사업 분야에 맞는\n플랫폼을 선택하세요.",
      lead: "각 플랫폼의 사업 분야와 협력 대상을 요약했습니다. 상세 내용은 각 플랫폼의 Business와 Partnerships 페이지에서 소개합니다.",
    },
    close: {
      kicker: "PLATFORM DETAILS",
      titleHtml: "더 자세한 사업과 협력 기회는<br>각 플랫폼에서 확인하세요.",
      lead: "NEWON 본사는 전체 사업을 연결하고, 각 플랫폼은 해당 분야의 전문적인 사업과 파트너십을 소개합니다.",
      ctaMain: "비즈니스 모델 보기",
      ctaSub: "협력 문의하기",
    },
  },
  models: {
    hero: {
      eyebrow: "BUSINESS MODELS",
      wordmark: "Business",
      titleHtml: "플랫폼의 성장과 함께<br>확장되는 수익모델.",
      lead: "NEWON은 자체 플랫폼과 디지털 제품을 기반으로 거래, 구독, 기업 솔루션, 기관 계약, 제휴 및 라이선싱 등 다양한 수익모델을 발전시키고 있습니다.",
      ctaMain: "사업모델 보기",
      ctaSub: "파트너십",
    },
    list: {
      kicker: "01 · SIX BUSINESS MODELS",
      title: "여섯 가지 방향으로\n확장되는 사업모델.",
      lead: "모든 모델은 고객별 주문형 개발이 아니라 NEWON이 직접 만들고 운영하는 플랫폼과 제품을 기준으로 합니다.",
    },
    items: [
      {
        code: "01",
        category: "MARKETPLACE",
        name: "플랫폼 거래 수수료",
        body: ["적격 개인과 기업이 플랫폼에서 상품·서비스·실물 자산 거래에 참여하고, 실제 거래 구조에 따라 수수료를 적용하는 사업모델입니다."],
        apps: ["SHAREON 자산 대여 거래", "PETLOG 관련 커머스", "BABYLOG 관련 커머스", "MY WORLD 적격 여행·체험 거래", "기타 적격 플랫폼 거래"],
        note: "여행·의료·보험·돌봄 등 규제 분야는 관련 자격과 법적 요건을 확인한 뒤 검토합니다.",
      },
      {
        code: "02",
        category: "SAAS",
        name: "기업용 SaaS 구독",
        body: [
          "기업과 기관이 NEWON의 자체 디지털 제품과 표준화된 솔루션을 구독 형태로 이용하는 사업모델입니다.",
          "고객별 주문형 개발이 아니라 반복 제공 가능한 자체 제품을 중심으로 운영합니다.",
        ],
        apps: ["육아·가족 사업자 솔루션", "반려동물 사업자 솔루션", "관광 사업자 솔루션", "기업 자산 관리", "기업 복지·생애주기 솔루션", "시니어 생활·돌봄 사업자 솔루션"],
        note: "업무·고객 응대·주문·예약·보고 자동화 등 준비 중인 자체 제품은 출시가 확정되면 안내합니다.",
      },
      {
        code: "03",
        category: "ENTERPRISE",
        name: "기업·기관 계약",
        body: [
          "기업, 교육기관, 복지기관과 공공기관 등이 NEWON의 자체 플랫폼과 표준 솔루션을 도입하는 계약 기반 사업모델입니다.",
          "계약은 제품 이용 범위, 라이선스, 지원 조건과 실제 제공 기능을 기준으로 구성하며, 고객별 외주 웹·앱 개발 계약과 구분합니다.",
        ],
      },
      {
        code: "04",
        category: "PARTNERSHIPS",
        name: "브랜드·서비스 제휴",
        body: [
          "각 플랫폼의 이용자 경험과 관련된 브랜드, 상품, 콘텐츠와 서비스를 연결하는 협력 기반 사업모델입니다.",
          "제휴 수익과 계약 조건은 실제 협의와 적격성 검토에 따라 결정됩니다.",
        ],
      },
      {
        code: "05",
        category: "DIGITAL PRODUCTS",
        name: "자체 디지털 제품과 라이선싱",
        body: [
          "NEWON이 직접 개발하고 소유하는 소프트웨어, 디지털 제품과 표준 솔루션을 판매·구독·라이선스 형태로 제공하는 사업모델입니다.",
          "고객별 납품형 외주 개발과 구분합니다.",
        ],
        links: "tools",
      },
      {
        code: "06",
        category: "GLOBAL",
        name: "글로벌 플랫폼 확장",
        body: ["국가별 언어와 시장환경에 맞춰 자체 플랫폼과 디지털 솔루션의 확장 가능성을 검토하는 사업 방향입니다."],
        note: "해외 고객·계약·매출 실적은 확인된 사실만 표시합니다.",
      },
    ],
    now: {
      kicker: "02 · AVAILABLE TODAY",
      title: "지금 이용할 수 있는\n자체 디지털 제품.",
      lead: "NEWON이 직접 만들어 공개하고 있는 디지털 제품입니다. 준비 중인 제품은 공개 중으로 표시하지 않습니다.",
      items: [
        { n: "01", name: "무료 웹 도구 13종", lead: "QR 생성, D-day, 비밀번호 생성 등 바로 쓰는 업무용 웹 도구를 공개하고 있습니다.", href: "tools/", go: "Tools 보기" },
        { n: "02", name: "디지털 상품", lead: "기획·운영에 쓰는 문서 키트와 템플릿 등 NEWON의 디지털 상품을 Store에서 소개합니다.", href: "resources/store/", go: "Store 보기" },
      ],
    },
    principles: {
      kicker: "03 · BUSINESS PRINCIPLES",
      title: "우리가 사업을\n확장하는 방식.",
      lead: "",
      items: [
        { n: "01", name: "자체 플랫폼 중심", body: "NEWON이 직접 만들고 운영하는 플랫폼과 제품을 사업의 중심에 둡니다." },
        { n: "02", name: "표준화된 제품과 솔루션", body: "고객마다 새로 개발하지 않고, 여러 고객이 함께 쓰는 표준 제품으로 제공합니다." },
        { n: "03", name: "반복 가능한 수익구조", body: "거래·구독·계약·라이선스처럼 반복해서 제공할 수 있는 구조를 지향합니다." },
        { n: "04", name: "적격 거래와 투명한 계약", body: "참여 자격과 계약 조건을 분명히 하고, 확인되지 않은 조건은 약속하지 않습니다." },
        { n: "05", name: "사용자 신뢰와 개인정보 보호", body: "이용자의 신뢰를 우선하며, 필요한 정보만 다룹니다." },
        { n: "06", name: "지속 가능한 플랫폼 생태계", body: "이용자와 파트너가 함께 오래 머물 수 있는 생태계를 만들어갑니다." },
      ],
    },
    close: {
      kicker: "NEXT STEP",
      titleHtml: "NEWON의 플랫폼에서<br>새로운 사업 기회를 확인하세요.",
      lead: "플랫폼별 사업 분야를 살펴보고, 사업모델에 맞는 협력 가능성을 문의해 주세요.",
      ctaMain: "6개 플랫폼 보기",
      ctaSub: "사업 문의하기",
    },
  },
  partnerships: {
    hero: {
      eyebrow: "PARTNERSHIPS",
      wordmark: "Partnerships",
      titleHtml: "서로 다른 가능성을<br>연결하는 파트너십.",
      lead: "NEWON은 여섯 개 플랫폼을 기반으로 개인·브랜드·기업·기관·기술 파트너와 새로운 사업 기회를 만들어가는 협력 생태계를 지향합니다.",
      ctaMain: "협력 유형 보기",
      ctaSub: "파트너십 문의",
    },
    types: {
      kicker: "01 · PARTNERSHIP TYPES",
      title: "여섯 가지\n협력 방식.",
      lead: "협력 방식은 플랫폼과 사업 분야에 따라 달라집니다. 일반적인 플랫폼 참여와 별도 전략적 제휴 계약은 구분합니다.",
      items: [
        { code: "01", type: "participation", en: "PLATFORM PARTICIPATION", name: "플랫폼 참여와 입점", body: ["적격 개인과 기업이 NEWON의 플랫폼에 참여하여 상품·서비스·실물 자산을 제공하거나 이용하는 협력 형태입니다.", "SHAREON은 개인과 기업이 직접 참여하는 오픈 마켓플레이스 구조를 지향합니다."] },
        { code: "02", type: "commerce", en: "BRAND & COMMERCE", name: "브랜드와 커머스 협력", body: ["육아, 반려생활, 여행 등 플랫폼별 이용자와 관련된 상품·브랜드·서비스를 연결하는 협력입니다.", "브랜드 캠페인이나 제휴 판매는 실제 계약과 서비스 운영 가능성을 확인한 후 진행합니다."] },
        { code: "03", type: "brand", en: "SERVICE & CONTENT", name: "서비스와 콘텐츠 협력", body: ["교육·생활·여행·돌봄·복지 등 이용자에게 필요한 정보와 서비스를 연결하는 협력입니다.", "관련 업종의 자격·허가·규제 요건을 준수합니다."] },
        { code: "04", type: "saas", en: "BUSINESS SOLUTIONS", name: "기업용 솔루션 협력", body: ["기업과 기관이 NEWON의 자체 플랫폼과 표준화된 SaaS를 도입하거나 관련 생태계에 참여하는 협력입니다.", "주문형 웹·앱 외주 개발은 제공하지 않습니다."] },
        { code: "05", type: "public", en: "PUBLIC & INSTITUTIONS", name: "공공·기관 협력", body: ["교육기관, 복지기관, 지자체와 공공기관 등을 대상으로 생활 서비스 접근성, 정보 연결과 적격 디지털 솔루션 활용 기회를 검토합니다.", "체결하지 않은 공공기관 협약이나 인증은 표시하지 않습니다."] },
        { code: "06", type: "technology", en: "TECHNOLOGY & GLOBAL", name: "기술·글로벌 협력", body: ["기술 연동, 데이터 보호, 결제·정산 인프라와 해외 시장 확장 등 자체 플랫폼의 발전을 위한 협력을 검토합니다.", "현재 외부 사업자와의 API·계정 연동 기능은 제공하지 않으며, 연동 범위는 검토 단계에서 확인합니다."] },
      ],
    },
    find: {
      kicker: "02 · FIND YOUR PLATFORM",
      title: "어떤 분야의 협력을\n찾고 계신가요?",
      lead: "각 플랫폼의 Partnerships 페이지에서 협력 대상과 방식을 자세히 소개합니다.",
    },
    process: {
      kicker: "03 · HOW WE CONNECT",
      title: "협력은 이렇게\n시작됩니다.",
      lead: "",
      items: [
        { n: "01", en: "Explore", name: "탐색", body: "협력 분야와 플랫폼을 확인합니다." },
        { n: "02", en: "Contact", name: "문의", body: "협력 목적과 제안 내용을 전달합니다." },
        { n: "03", en: "Review", name: "검토", body: "사업 적합성과 운영 가능성을 검토합니다." },
        { n: "04", en: "Discuss", name: "협의", body: "협력 범위와 조건을 협의합니다." },
        { n: "05", en: "Proceed", name: "진행", body: "필요한 계약과 절차를 거쳐 진행합니다." },
      ],
      note: "위 흐름은 일반적인 제안 검토 과정이며, 문의나 검토가 계약 체결을 보장하지 않습니다.",
    },
    channels: {
      kicker: "04 · OTHER NEWON CHANNELS",
      title: "AI와 디지털 제품\n협력 창구.",
      lead: "플랫폼 밖의 협력은 해당 메뉴에서 안내합니다.",
      items: [
        { n: "01", name: "Newon AI", lead: "AI 제품과 기업용 AI 협력", href: "ai/enterprise/" },
        { n: "02", name: "Newon Studio", lead: "디지털 제품 유통과 자산 라이선스 협력", href: "studio/partnerships/" },
      ],
    },
    close: {
      kicker: "PARTNERSHIPS",
      titleHtml: "NEWON과 함께<br>새로운 가능성을 만들어가세요.",
      lead: "각 플랫폼의 전문성과 파트너의 역량이 만나는 지점에서 새로운 사업 기회가 시작됩니다.",
      ctaMain: "파트너십 문의하기",
      ctaSub: "6개 플랫폼 보기",
    },
  },
  contact: {
    hero: {
      eyebrow: "BUSINESS CONTACT",
      wordmark: "Partnerships",
      titleHtml: "NEWON과 새로운 비즈니스를<br>이야기해 주세요.",
      lead: "플랫폼 참여, 기업용 솔루션 도입, 브랜드·서비스 제휴, 기관 협력과 글로벌 사업 제안까지. NEWON의 여섯 개 플랫폼과 관련된 비즈니스 문의를 접수합니다.",
      ctaMain: "문의 작성하기",
      ctaSub: "파트너십 보기",
    },
    types: {
      kicker: "01 · INQUIRY TYPES",
      title: "어떤 문의를\n준비하고 계신가요?",
      lead: "유형을 선택하면 아래 문의 양식에 바로 반영됩니다. 고객별 웹·앱 제작, 맞춤 개발, 타사 유지보수 의뢰는 받지 않습니다.",
      go: "이 유형으로 작성하기 →",
    },
    form: {
      kicker: "02 · INQUIRY FORM",
      title: "비즈니스 문의",
      lead: "필수 항목을 입력해 주세요. 제출한 내용은 NEWON 공식 문의 메일로 전달됩니다.",
      name: "이름",
      company: "기업·기관명",
      companyHint: "해당하는 경우에만 입력해 주세요.",
      email: "이메일",
      platform: "문의 대상 플랫폼",
      type: "문의 유형",
      message: "제안 내용",
      messagePh: "협력 목적, 대상 플랫폼, 제안 내용을 간단히 적어 주세요. 건강정보 등 민감한 개인정보는 적지 말아 주세요.",
      choose: "선택해 주세요",
      optional: "선택",
      consent: "문의 처리를 위해 이름·이메일·문의 내용을 수집·이용하는 데 동의합니다. (필수)",
      privacy: "개인정보처리방침",
      submit: "문의 보내기",
      submitting: "보내는 중…",
      fail: "문의를 보내지 못했습니다. 잠시 후 다시 시도하거나 아래 이메일로 직접 보내 주세요.",
      direct: "이메일로 직접 문의:",
      subject: "NEWON Business & Partnerships inquiry",
      contactLabel: "CONTACT",
      contactName: "NEWON",
    },
    guide: {
      kicker: "03 · BEFORE YOU WRITE",
      title: "문의 전에\n알아 두세요.",
      items: [
        { n: "01", name: "검토 범위", body: "NEWON의 여섯 개 플랫폼과 자체 제품에 관련된 사업·제휴 문의를 검토합니다. 외주 제작·견적 요청은 받지 않습니다." },
        { n: "02", name: "개인정보", body: "문의 처리에 필요한 이름·이메일·문의 내용만 받습니다. 민감한 개인정보는 적지 말아 주세요." },
        { n: "03", name: "답변 안내", body: "내용을 검토한 뒤 이메일로 안내합니다. 문의가 협력이나 계약 체결을 보장하지는 않습니다." },
      ],
      privacyNote: "문의 내용은 NEWON 공식 문의 양식으로 전달되며, 개인정보는 개인정보처리방침에 따라 처리됩니다.",
      privacyLink: "개인정보처리방침",
    },
    close: {
      kicker: "BUSINESS CONTACT",
      titleHtml: "여섯 개 플랫폼에서 시작되는<br>새로운 가능성.",
      lead: "NEWON의 플랫폼과 사업 방향에 맞는 협력 제안을 기다립니다.",
      ctaMain: "6개 플랫폼 보기",
      ctaSub: "파트너십 보기",
    },
  },
};

const EN = {
  ui: {
    menuLabel: "Business & Partnerships menu",
    crumb: "Business & Partnerships",
    eyebrow: "NEWON BUSINESS & PARTNERSHIPS",
    infoOnly: "The NEWON website introduces the company and its businesses for information only. It has no login, payment or booking features.",
    notice: "NEWON is developing a range of business models on its own platforms. The services actually offered and contract terms may vary by platform and stage of operation.",
    toBusiness: "Business details",
    toPartnerships: "Partnerships details",
    platformBusiness: (n) => `${n} Business`,
    platformPartnerships: (n) => `${n} Partnerships`,
    categoryLabel: "Category",
    keywordsLabel: "Business keywords",
    areasLabel: "Business areas",
    partnersLabel: "Partnership opportunities",
    applicationsLabel: "Potential applications",
    railLabel: "Jump to a platform",
    askType: "Inquire about this type",
  },
  seo: {
    overview: { title: "NEWON Business & Partnerships | Platform business and partnerships", desc: "Explore business, SaaS, transaction fees, enterprise and institutional contracts and partnership opportunities built on NEWON's six platforms." },
    platforms: { title: "Our Platforms | NEWON Business & Partnerships", desc: "Business areas and partnership opportunities for companies and institutions on BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON and ONGIL." },
    models: { title: "Business Models | NEWON", desc: "NEWON's platform business models: transaction fees, enterprise SaaS, enterprise and institutional contracts, partnerships and licensing of its own products." },
    partnerships: { title: "Partnerships | NEWON", desc: "Platform participation, brand and service partnerships, institutional, technology and global partnerships around NEWON's six platforms." },
    contact: { title: "Business Contact | NEWON", desc: "Business inquiries about platform participation, enterprise SaaS, brand and service partnerships and institutional cooperation with NEWON." },
  },
  overview: {
    hero: {
      eyebrow: "NEWON BUSINESS & PARTNERSHIPS",
      wordmark: "Business",
      titleHtml: "Six platforms,<br>wider business possibilities.",
      lead: "NEWON builds and runs its own digital platforms for parenting, life with pets, travel, asset sharing, life stages and senior life. On each platform's expertise we are building a new business ecosystem that connects people, companies and institutions.",
      ctaMain: "Explore the six platforms",
      ctaSub: "See business models",
    },
    about: {
      kicker: "01 · ABOUT OUR BUSINESS",
      title: "Beyond products,\nwe grow the value of platforms.",
      lines: [
        "NEWON builds its business on its own platforms and digital products, not on outsourced work for individual clients.",
        "Through six platforms that each focus on a different part of everyday life, we aim to widen opportunities for business participation, eligible transactions, service partnerships, business solutions and work with institutions.",
        "Each platform's business direction and partnership options are described on that platform's own pages.",
      ],
    },
    platforms: {
      kicker: "02 · SIX CORE PLATFORMS",
      title: "Different days,\none NEWON ecosystem.",
      lead: "Find new connections and business opportunities on the platform that fits each part of life.",
    },
    approach: {
      kicker: "03 · OUR BUSINESS APPROACH",
      title: "Business that grows\naround platforms.",
      lead: "",
      items: [
        { n: "01", en: "Marketplace & Transactions", lead: "Eligible people and businesses take part in transactions on the platforms, and we develop transaction-based revenue models under each platform's terms." },
        { n: "02", en: "SaaS & Enterprise", lead: "A subscription and contract model in which companies and institutions use NEWON's own products and standard solutions." },
        { n: "03", en: "Partnerships & Ecosystem", lead: "Building partnerships with brands, companies, institutions and technology partners that fit each platform." },
        { n: "04", en: "Digital Products & Licensing", lead: "Turning digital products and solutions that NEWON builds and owns into products and licences." },
      ],
      cta: "Business models in detail",
    },
    ecosystem: {
      kicker: "04 · OUR ECOSYSTEM",
      title: "From individuals\nto companies and institutions.",
      lead: "NEWON's platforms aim for a structure where different participants connect in their own way.",
      items: [
        { n: "01", name: "Individual sellers & asset suppliers", lead: "People who offer goods, services or physical assets directly on a platform." },
        { n: "02", name: "Small businesses", lead: "Businesses that meet platform users in a way that fits their area and trade." },
        { n: "03", name: "Brands & companies", lead: "Brands and companies with products and services relevant to platform users' lives." },
        { n: "04", name: "Education & life service providers", lead: "Providers of information and services in education, care and everyday life." },
        { n: "05", name: "Institutions & local governments", lead: "Bodies that can review access to life services and information with us." },
        { n: "06", name: "Technology & global partners", lead: "Partners who can review integration, data protection and overseas expansion with us." },
      ],
      note: "These are the kinds of participants NEWON aims to work with; they do not describe existing contracts or partnerships.",
    },
    close: {
      kicker: "NEXT STEP",
      titleHtml: "Discover new opportunities<br>on NEWON's platforms.",
      lead: "Look at the platform that fits your field and see how you could work with NEWON.",
      ctaMain: "Business by platform",
      ctaSub: "Partnership inquiry",
    },
  },
  platforms: {
    hero: {
      eyebrow: "OUR PLATFORMS",
      wordmark: "Business",
      titleHtml: "Six platforms,<br>six business ecosystems.",
      lead: "Each NEWON platform focuses on a different part of everyday life. Companies and partners choose the platform that fits their field and find the details on that platform's Business and Partnerships pages.",
      ctaMain: "See the platforms",
      ctaSub: "Business models",
    },
    list: {
      kicker: "01 · SIX PLATFORMS",
      title: "Choose the platform\nthat fits your field.",
      lead: "A short summary of each platform's business areas and partners. The details are on each platform's Business and Partnerships pages.",
    },
    close: {
      kicker: "PLATFORM DETAILS",
      titleHtml: "Find detailed business and partnership<br>opportunities on each platform.",
      lead: "NEWON connects the whole business; each platform presents the business and partnerships of its own field.",
      ctaMain: "See business models",
      ctaSub: "Partnership inquiry",
    },
  },
  models: {
    hero: {
      eyebrow: "BUSINESS MODELS",
      wordmark: "Business",
      titleHtml: "Revenue models that grow<br>with the platforms.",
      lead: "On its own platforms and digital products, NEWON is developing revenue models such as transactions, subscriptions, business solutions, institutional contracts, partnerships and licensing.",
      ctaMain: "See the models",
      ctaSub: "Partnerships",
    },
    list: {
      kicker: "01 · SIX BUSINESS MODELS",
      title: "Business models that grow\nin six directions.",
      lead: "Every model is based on platforms and products that NEWON builds and runs itself, not on custom development for individual clients.",
    },
    items: [
      {
        code: "01",
        category: "MARKETPLACE",
        name: "Platform transaction fees",
        body: ["A model in which eligible people and businesses trade goods, services or physical assets on a platform, with fees applied according to the actual transaction structure."],
        apps: ["SHAREON asset rental transactions", "PETLOG-related commerce", "BABYLOG-related commerce", "Eligible MY WORLD travel and experience transactions", "Other eligible platform transactions"],
        note: "Regulated fields such as travel, medical, insurance and care are reviewed only after the required qualifications and legal requirements are confirmed.",
      },
      {
        code: "02",
        category: "SAAS",
        name: "Enterprise SaaS subscriptions",
        body: [
          "A model in which companies and institutions subscribe to NEWON's own digital products and standard solutions.",
          "It runs on our own products that can be offered again and again, not on custom development for each client.",
        ],
        apps: ["Solutions for parenting and family businesses", "Solutions for pet businesses", "Solutions for tourism businesses", "Business asset management", "Employee benefits and life-stage solutions", "Solutions for senior life and care providers"],
        note: "Own products in preparation, such as work, customer reply, order, booking and report automation, will be announced once their launch is confirmed.",
      },
      {
        code: "03",
        category: "ENTERPRISE",
        name: "Enterprise and institutional contracts",
        body: [
          "A contract model in which companies, education and welfare institutions and public bodies adopt NEWON's own platforms and standard solutions.",
          "Contracts are set by product scope, licence, support terms and the features actually provided, and are kept separate from custom web or app development contracts.",
        ],
      },
      {
        code: "04",
        category: "PARTNERSHIPS",
        name: "Brand and service partnerships",
        body: [
          "A partnership model that connects brands, products, content and services relevant to each platform's user experience.",
          "Partnership revenue and terms are decided through actual negotiation and eligibility review.",
        ],
      },
      {
        code: "05",
        category: "DIGITAL PRODUCTS",
        name: "Own digital products and licensing",
        body: [
          "A model in which software, digital products and standard solutions that NEWON builds and owns are offered for sale, subscription or licence.",
          "It is kept separate from custom development delivered to individual clients.",
        ],
        links: "tools",
      },
      {
        code: "06",
        category: "GLOBAL",
        name: "Global platform expansion",
        body: ["A direction in which we review expanding our own platforms and digital solutions to each country's language and market."],
        note: "Overseas customers, contracts and revenue are shown only when confirmed.",
      },
    ],
    now: {
      kicker: "02 · AVAILABLE TODAY",
      title: "Own digital products\nyou can use today.",
      lead: "Digital products NEWON has built and published itself. Products in preparation are never shown as available.",
      items: [
        { n: "01", name: "13 free web tools", lead: "Ready-to-use web tools for work, such as a QR maker, D-day counter and password generator.", href: "tools/", go: "See Tools" },
        { n: "02", name: "Digital products", lead: "Document kits, templates and other NEWON digital products presented in the Store.", href: "resources/store/", go: "See the Store" },
      ],
    },
    principles: {
      kicker: "03 · BUSINESS PRINCIPLES",
      title: "How we grow\nthe business.",
      lead: "",
      items: [
        { n: "01", name: "Our own platforms first", body: "Platforms and products that NEWON builds and runs are at the centre of the business." },
        { n: "02", name: "Standard products and solutions", body: "We do not build anew for each client; we offer standard products that many customers share." },
        { n: "03", name: "Repeatable revenue", body: "We aim for structures that can be offered again and again: transactions, subscriptions, contracts and licences." },
        { n: "04", name: "Eligible transactions, clear contracts", body: "Eligibility and terms are stated clearly, and terms that are not confirmed are not promised." },
        { n: "05", name: "User trust and privacy", body: "User trust comes first, and we handle only the information we need." },
        { n: "06", name: "A sustainable ecosystem", body: "We build an ecosystem where users and partners can stay together for the long term." },
      ],
    },
    close: {
      kicker: "NEXT STEP",
      titleHtml: "See new business opportunities<br>on NEWON's platforms.",
      lead: "Look at each platform's business areas and ask about the partnership that fits a model.",
      ctaMain: "See the six platforms",
      ctaSub: "Business inquiry",
    },
  },
  partnerships: {
    hero: {
      eyebrow: "PARTNERSHIPS",
      wordmark: "Partnerships",
      titleHtml: "Partnerships that connect<br>different possibilities.",
      lead: "On its six platforms, NEWON aims for a partnership ecosystem that creates new business opportunities with individuals, brands, companies, institutions and technology partners.",
      ctaMain: "See partnership types",
      ctaSub: "Partnership inquiry",
    },
    types: {
      kicker: "01 · PARTNERSHIP TYPES",
      title: "Six ways\nto partner.",
      lead: "How we partner depends on the platform and field. Ordinary platform participation is kept separate from strategic partnership contracts.",
      items: [
        { code: "01", type: "participation", en: "PLATFORM PARTICIPATION", name: "Platform participation and listing", body: ["Eligible people and businesses join a NEWON platform to offer or use goods, services or physical assets.", "SHAREON aims to be an open marketplace that people and businesses join directly."] },
        { code: "02", type: "commerce", en: "BRAND & COMMERCE", name: "Brand and commerce partnerships", body: ["Connecting products, brands and services relevant to each platform's users, such as parenting, pets and travel.", "Brand campaigns and partner sales go ahead only after actual contracts and service operations are confirmed."] },
        { code: "03", type: "brand", en: "SERVICE & CONTENT", name: "Service and content partnerships", body: ["Connecting information and services users need in education, everyday life, travel, care and welfare.", "We follow the qualification, licence and regulatory requirements of each field."] },
        { code: "04", type: "saas", en: "BUSINESS SOLUTIONS", name: "Business solution partnerships", body: ["Companies and institutions adopt NEWON's own platforms and standard SaaS, or take part in their ecosystems.", "We do not offer custom web or app development."] },
        { code: "05", type: "public", en: "PUBLIC & INSTITUTIONS", name: "Public and institutional partnerships", body: ["With education and welfare institutions, local governments and public bodies, we review access to life services, information links and the use of eligible digital solutions.", "We never show public agreements or certifications that have not been signed."] },
        { code: "06", type: "technology", en: "TECHNOLOGY & GLOBAL", name: "Technology and global partnerships", body: ["We review partnerships that help our own platforms grow, such as integration, data protection, payment and settlement infrastructure and overseas markets.", "API or account integration with outside businesses is not offered today; the scope of any integration is confirmed during review."] },
      ],
    },
    find: {
      kicker: "02 · FIND YOUR PLATFORM",
      title: "What kind of partnership\nare you looking for?",
      lead: "Each platform's Partnerships page describes its partners and ways of working in detail.",
    },
    process: {
      kicker: "03 · HOW WE CONNECT",
      title: "How a partnership\nstarts.",
      lead: "",
      items: [
        { n: "01", en: "Explore", name: "Explore", body: "Check the field and the platform." },
        { n: "02", en: "Contact", name: "Contact", body: "Tell us the purpose and your proposal." },
        { n: "03", en: "Review", name: "Review", body: "We review business fit and feasibility." },
        { n: "04", en: "Discuss", name: "Discuss", body: "We discuss scope and terms." },
        { n: "05", en: "Proceed", name: "Proceed", body: "We go ahead through the necessary contract and steps." },
      ],
      note: "This is a general review flow; an inquiry or review does not guarantee a contract.",
    },
    channels: {
      kicker: "04 · OTHER NEWON CHANNELS",
      title: "AI and digital product\npartnerships.",
      lead: "Partnerships outside the platforms are covered on their own menus.",
      items: [
        { n: "01", name: "Newon AI", lead: "AI products and enterprise AI partnerships", href: "ai/enterprise/" },
        { n: "02", name: "Newon Studio", lead: "Digital product distribution and asset licensing", href: "studio/partnerships/" },
      ],
    },
    close: {
      kicker: "PARTNERSHIPS",
      titleHtml: "Create new possibilities<br>with NEWON.",
      lead: "New business opportunities start where each platform's expertise meets a partner's strengths.",
      ctaMain: "Partnership inquiry",
      ctaSub: "See the six platforms",
    },
  },
  contact: {
    hero: {
      eyebrow: "BUSINESS CONTACT",
      wordmark: "Partnerships",
      titleHtml: "Talk to NEWON about<br>new business.",
      lead: "Platform participation, business solutions, brand and service partnerships, institutional cooperation and global proposals: we take business inquiries related to NEWON's six platforms.",
      ctaMain: "Write an inquiry",
      ctaSub: "See partnerships",
    },
    types: {
      kicker: "01 · INQUIRY TYPES",
      title: "What would you\nlike to discuss?",
      lead: "Choosing a type fills it in on the form below. We do not take custom web or app builds, custom development or third-party maintenance requests.",
      go: "Write with this type →",
    },
    form: {
      kicker: "02 · INQUIRY FORM",
      title: "Business inquiry",
      lead: "Please fill in the required fields. Your message is sent to NEWON's official inquiry inbox.",
      name: "Name",
      company: "Company or institution",
      companyHint: "Only if it applies.",
      email: "Email",
      platform: "Platform",
      type: "Inquiry type",
      message: "Your proposal",
      messagePh: "Briefly describe the purpose, the platform and your proposal. Please do not include sensitive personal data such as health information.",
      choose: "Please choose",
      optional: "optional",
      consent: "I agree to the collection and use of my name, email and message to handle this inquiry. (Required)",
      privacy: "Privacy Policy",
      submit: "Send inquiry",
      submitting: "Sending…",
      fail: "Your inquiry could not be sent. Please try again later or email us directly.",
      direct: "Email us directly:",
      subject: "NEWON Business & Partnerships inquiry",
      contactLabel: "CONTACT",
      contactName: "NEWON",
    },
    guide: {
      kicker: "03 · BEFORE YOU WRITE",
      title: "Good to know\nbefore you write.",
      items: [
        { n: "01", name: "What we review", body: "Business and partnership inquiries about NEWON's six platforms and own products. We do not take outsourcing or quote requests." },
        { n: "02", name: "Personal data", body: "We ask only for the name, email and message needed to handle the inquiry. Please leave out sensitive personal data." },
        { n: "03", name: "Replies", body: "We reply by email after review. An inquiry does not guarantee a partnership or contract." },
      ],
      privacyNote: "Your message is sent through NEWON's official inquiry form, and personal data is handled under the Privacy Policy.",
      privacyLink: "Privacy Policy",
    },
    close: {
      kicker: "BUSINESS CONTACT",
      titleHtml: "New possibilities that start<br>on six platforms.",
      lead: "We look forward to proposals that fit NEWON's platforms and business direction.",
      ctaMain: "See the six platforms",
      ctaSub: "See partnerships",
    },
  },
};

/** Copy language for a locale: ko and en have their own copy; the other seven show English (lang="en"). */
export const bpCopyLang = (lang) => (lang === "ko" ? "ko" : "en");
export function getBizpartCopy(lang) {
  return bpCopyLang(lang) === "ko" ? KO : EN;
}
