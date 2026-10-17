/**
 * PETLOG business website copy — /{lang}/petlog/ (Overview · Platform · Business · Partnerships · Contact).
 *
 * Owner brief (2026-10-18): PETLOG = All-in-One Pet Life Platform. The website introduces the business,
 * partnerships and contact only — no app features, booking, orders, payment, sign-in, seller sign-up,
 * posting or record entry on the web.
 *
 * Honesty rules for this copy:
 *  - Status on every service/business line: app (available in the PETLOG app today, per the existing
 *    PETLOG product page), prep (in preparation), plan (planned / under review), legal (decided only after
 *    legal review). Nothing planned is described as operating.
 *  - Prices and commission rates are internal hypotheses (brief §7) and are NEVER shown; only the type of
 *    revenue model is named, with "not decided".
 *  - No partner, contract, user count or revenue is claimed. SHAREON link is a direction, not a live integration.
 * Body copy: ko (source) + en (meaning-checked). Other locales show the English body (site convention).
 */

export const STATUS = {
  ko: { app: "앱에서 제공", prep: "준비 중", plan: "계획 · 검토 중", legal: "법률 검토 후 결정" },
  en: { app: "In the app today", prep: "In preparation", plan: "Planned · under review", legal: "Decided after legal review" },
};

/** Hero film (existing Newon film library; no dedicated pet film exists yet — swap here when one is made). */
export const PETLOG_FILM =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260330_153826_e9005cf7-a1c7-4c7d-886f-fea22d644a9c.mp4";

export const STORE = {
  ios: "https://apps.apple.com/kr/app/petlog-%EC%8A%A4%EB%A7%88%ED%8A%B8%ED%95%9C-ai-%EB%B0%98%EB%A0%A4-%EA%B8%B0%EB%A1%9D/id6770971033",
  android: "https://play.google.com/store/apps/details?id=com.newon.petlog&pcampaignid=web_share",
};

/** PETLOG local menu (also the PETLOG mega menu in the global business row). href relative to /{lang}/ */
export const PETLOG_MENU = [
  { id: "overview", n: "01", name: "Overview", href: "petlog/", ko: "소개", en: "About PETLOG" },
  { id: "platform", n: "02", name: "Platform", href: "petlog/platform/", ko: "서비스", en: "Services" },
  { id: "business", n: "03", name: "Business", href: "petlog/business/", ko: "비즈니스", en: "Business" },
  { id: "partnerships", n: "04", name: "Partnerships", href: "petlog/partnerships/", ko: "파트너십", en: "Partnerships" },
  { id: "contact", n: "05", name: "Contact", href: "petlog/contact/", ko: "문의", en: "Contact" },
];

const L = (ko, en) => ({ ko, en });

/* ------------------------------------------------------------------ Overview */
export const OVERVIEW = {
  ko: {
    title: "PETLOG | Newon — 반려동물의 모든 순간을, 하나의 연결로",
    desc: "PETLOG는 반려동물의 일상과 건강, 성장과 돌봄을 연결하는 종합 반려생활 플랫폼을 지향합니다. 기록 앱은 운영 중이며, 쇼핑·예약 등 확장 서비스는 준비·검토 단계입니다.",
    heroTitle: "반려동물의 모든 순간을,<br>하나의 연결로.",
    heroLead: "PETLOG는 반려동물의 일상과 건강, 성장과 돌봄을 연결하는 종합 반려생활 플랫폼을 지향합니다. 기록에서 시작해 쇼핑, 중고거래, 공동구매, 예약, 커뮤니티, 교육, 여행, 기업·기관 협력까지 반려생활의 다양한 영역을 연결합니다.",
    ctaMain: "PETLOG 알아보기",
    ctaSub: "협력 문의",
    statusNote: "현재 PETLOG 앱은 기록·건강 관리 중심으로 운영 중입니다. 쇼핑, 중고거래, 공동구매, 예약 등은 준비·검토 단계이며 웹에서는 소개만 제공합니다.",
    vision: {
      kicker: "OUR VISION",
      title: "기록에서 시작해,\n반려생활 전체를 연결합니다.",
      body: [
        "반려동물과의 하루는 기록, 건강, 쇼핑, 돌봄, 커뮤니티가 따로따로 흩어져 있습니다.",
        "PETLOG는 매일 쌓이는 기록을 중심에 두고, 필요한 정보와 서비스를 한 흐름으로 잇는 것을 목표로 합니다.",
        "강아지·고양이에서 시작해 다른 반려동물로 넓혀 갑니다.",
        "보호자의 기록과 개인정보는 보호자의 것입니다. 동의 없이 판매자나 업체와 공유하지 않습니다.",
      ],
    },
    journey: {
      kicker: "PET LIFE JOURNEY",
      title: "첫 만남부터 추억까지,\n반려생활의 여섯 시기.",
      lead: "시기마다 필요한 기록과 정보, 서비스가 다릅니다.",
      note: "각 시기의 서비스는 순차적으로 준비합니다. 현재 앱은 기록·건강 관리 중심입니다.",
      items: [
        { id: "meet", n: "01", age: "MEET", name: "첫 만남과 적응", lead: "입양·분양 직후, 새 가족이 서로에게 익숙해지는 시기입니다.", topics: ["기본 정보 등록", "첫 예방접종", "생활 준비물"] },
        { id: "grow", n: "02", age: "GROW", name: "성장과 배움", lead: "몸과 습관이 자라는 시기, 교육과 사회화가 중요합니다.", topics: ["성장 기록", "기본 훈련", "사회화"] },
        { id: "daily", n: "03", age: "DAILY", name: "함께하는 일상", lead: "산책, 식사, 놀이가 쌓여 일상이 됩니다.", topics: ["식사·산책", "가족 공유", "외출·여행"] },
        { id: "care", n: "04", age: "CARE", name: "건강과 돌봄", lead: "정기 검진과 돌봄이 필요한 순간을 놓치지 않도록 돕습니다.", topics: ["건강 기록", "병원 일정", "돌봄·미용"] },
        { id: "senior", n: "05", age: "SENIOR", name: "시니어 라이프", lead: "나이 든 반려동물의 컨디션 변화를 세심하게 살핍니다.", topics: ["컨디션 변화", "시니어 케어", "생활 환경"] },
        { id: "memory", n: "06", age: "MEMORY", name: "추억과 기억", lead: "함께한 시간을 기록으로 남기고 오래 기억합니다.", topics: ["사진·성장 앨범", "추모", "가족 기록"] },
      ],
    },
    connect: {
      kicker: "WHAT WE CONNECT",
      title: "PETLOG가 연결하는 것",
      lead: "기록을 중심으로 정보와 서비스, 사람을 잇습니다.",
      items: [
        { n: "01", name: "기록과 건강", lead: "식사, 산책, 체중, 예방접종, 병원 기록을 한곳에." },
        { n: "02", name: "쇼핑과 거래", lead: "반려용품 발견, 중고거래, 공동구매 (준비·검토 중)." },
        { n: "03", name: "예약과 돌봄", lead: "미용, 호텔, 유치원, 훈련, 돌봄 업체 연결 (검토 중)." },
        { n: "04", name: "커뮤니티와 배움", lead: "보호자 간 경험 공유와 교육 콘텐츠 (준비 중)." },
        { n: "05", name: "기업과 기관", lead: "업체용 도구, 브랜드 협력, 보호단체·기관 협력 (계획)." },
        { n: "06", name: "Newon 생태계", lead: "SHAREON, LIVON, ONGIL 등 Newon 서비스와의 연계 (검토)." },
      ],
    },
    ecosystem: {
      kicker: "PET ECOSYSTEM",
      title: "반려생활에 참여하는 모두",
      lead: "보호자만이 아니라 반려생활을 함께 만드는 사람과 기관이 연결됩니다.",
      items: [
        { n: "01", name: "보호자와 가족", lead: "기록하고, 공유하고, 필요한 서비스를 찾습니다.", topics: ["기록", "가족 공유"] },
        { n: "02", name: "동물병원·돌봄 업체", lead: "미용, 호텔, 유치원, 훈련, 펫시터 등 반려 서비스 사업자.", topics: ["예약 (검토)", "업체 도구 (계획)"] },
        { n: "03", name: "브랜드·판매자", lead: "반려용품 브랜드와 개인 판매자, 크리에이터.", topics: ["쇼핑 (준비)", "공동구매 (검토)"] },
        { n: "04", name: "보호단체·기관", lead: "입양·보호, 실종 지원, 공공 반려 정책 관련 기관.", topics: ["입양·보호 (계획)"] },
      ],
    },
    biz: {
      kicker: "BUSINESS OPPORTUNITIES",
      title: "반려생활 산업을 잇는 사업 기회",
      lead: "PETLOG는 개인 이용자와 사업자 모두를 위한 플랫폼으로 설계합니다.",
      items: [
        { n: "01", name: "개인 구독", lead: "핵심 기록은 무료로 두고, 고급 기능을 구독으로 제공하는 방향을 검토합니다." },
        { n: "02", name: "거래·공동구매", lead: "상품 발견은 PETLOG, 거래·결제·정산 인프라는 SHAREON과 연계하는 방향입니다." },
        { n: "03", name: "예약·서비스", lead: "반려 서비스 업체 예약 연결을 법률·안전 검토 후 단계적으로 검토합니다." },
        { n: "04", name: "기업·기관", lead: "업체용 SaaS, 자동화, 기업 복지, 기관 라이선스를 검토합니다." },
      ],
      cta: "비즈니스 자세히 보기",
    },
    newon: {
      kicker: "NEWON ECOSYSTEM",
      title: "Newon의 다른 서비스와\n함께 성장합니다.",
      lead: "PETLOG는 Newon의 6개 핵심 플랫폼 중 하나입니다.",
      items: [
        { n: "01", name: "SHAREON", body: "반려용품 거래·결제·정산 인프라 연계 방향 (개발 중, 연동 미구현)", href: "shareon/" },
        { n: "02", name: "BABYLOG", body: "아이와 반려동물이 함께 사는 가족의 기록", href: "portfolio/babylog/" },
        { n: "03", name: "LIVON", body: "생애주기 생활정보와 반려생활 정보", href: "lifestage/" },
        { n: "04", name: "ONGIL", body: "시니어 보호자와 반려동물의 일상", href: "ongil/" },
        { n: "05", name: "MY WORLD", body: "반려동물과 함께한 여행·외출 기록", href: "portfolio/myworld/" },
      ],
    },
    close: {
      kicker: "NEXT STEP",
      titleHtml: "더 나은 반려생활을<br>함께 만들어 가요.",
      lead: "PETLOG 앱을 사용해 보거나, 사업 협력을 제안해 주세요.",
      ctaMain: "협력 문의",
      ctaSub: "PETLOG 앱 보기",
    },
  },
  en: {
    title: "PETLOG | Newon — Every moment with your pet, in one connection",
    desc: "PETLOG aims to be an all-in-one pet life platform connecting daily life, health, growth and care. The record app is live; shopping, booking and other services are in preparation or review.",
    heroTitle: "Every moment with your pet,<br>in one connection.",
    heroLead: "PETLOG aims to be an all-in-one pet life platform that connects pets' daily life, health, growth and care. Starting from records, it connects shopping, secondhand trading, group buying, booking, community, education, travel and partnerships with businesses and institutions.",
    ctaMain: "Explore PETLOG",
    ctaSub: "Partnership inquiry",
    statusNote: "Today the PETLOG app focuses on records and health. Shopping, secondhand trading, group buying and booking are in preparation or review; this website only introduces them.",
    vision: {
      kicker: "OUR VISION",
      title: "Starting from records,\nconnecting all of pet life.",
      body: [
        "Life with a pet is scattered across records, health, shopping, care and community.",
        "PETLOG puts the records you keep every day at the centre and aims to connect the information and services you need in one flow.",
        "We start with dogs and cats and will expand to other pets.",
        "Owners' records and personal data belong to owners. They are never shared with sellers or businesses without consent.",
      ],
    },
    journey: {
      kicker: "PET LIFE JOURNEY",
      title: "From first meeting to memories:\nsix stages of pet life.",
      lead: "Each stage needs different records, information and services.",
      note: "Services for each stage will be prepared step by step. Today the app focuses on records and health.",
      items: [
        { id: "meet", n: "01", age: "MEET", name: "First meeting", lead: "Right after adoption, when a new family gets used to each other.", topics: ["Basic profile", "First vaccinations", "Supplies"] },
        { id: "grow", n: "02", age: "GROW", name: "Growing and learning", lead: "Bodies and habits grow; training and socialisation matter.", topics: ["Growth records", "Basic training", "Socialisation"] },
        { id: "daily", n: "03", age: "DAILY", name: "Everyday life together", lead: "Walks, meals and play add up to daily life.", topics: ["Meals and walks", "Family sharing", "Outings"] },
        { id: "care", n: "04", age: "CARE", name: "Health and care", lead: "Helping you not miss check-ups and moments that need care.", topics: ["Health records", "Vet schedule", "Care and grooming"] },
        { id: "senior", n: "05", age: "SENIOR", name: "Senior life", lead: "Watching closely for changes in older pets.", topics: ["Condition changes", "Senior care", "Home setup"] },
        { id: "memory", n: "06", age: "MEMORY", name: "Memories", lead: "Keeping the time you shared as records to remember.", topics: ["Photos and albums", "Memorials", "Family records"] },
      ],
    },
    connect: {
      kicker: "WHAT WE CONNECT",
      title: "What PETLOG connects",
      lead: "Records at the centre, linked to information, services and people.",
      items: [
        { n: "01", name: "Records and health", lead: "Meals, walks, weight, vaccinations and vet records in one place." },
        { n: "02", name: "Shopping and trading", lead: "Finding pet goods, secondhand trading, group buying (in preparation / review)." },
        { n: "03", name: "Booking and care", lead: "Grooming, hotels, daycare, training and care providers (under review)." },
        { n: "04", name: "Community and learning", lead: "Owners sharing experience, plus education content (in preparation)." },
        { n: "05", name: "Businesses and institutions", lead: "Tools for providers, brand partnerships, shelters and institutions (planned)." },
        { n: "06", name: "Newon ecosystem", lead: "Links with SHAREON, LIVON, ONGIL and other Newon services (review)." },
      ],
    },
    ecosystem: {
      kicker: "PET ECOSYSTEM",
      title: "Everyone in pet life",
      lead: "Not only owners, but the people and organisations who make pet life work.",
      items: [
        { n: "01", name: "Owners and families", lead: "Keep records, share them and find the services they need.", topics: ["Records", "Family sharing"] },
        { n: "02", name: "Vets and care providers", lead: "Grooming, hotels, daycare, trainers, pet sitters and more.", topics: ["Booking (review)", "Provider tools (planned)"] },
        { n: "03", name: "Brands and sellers", lead: "Pet brands, individual sellers and creators.", topics: ["Shopping (prep)", "Group buying (review)"] },
        { n: "04", name: "Shelters and institutions", lead: "Adoption, protection, lost-pet support and public pet policy bodies.", topics: ["Adoption (planned)"] },
      ],
    },
    biz: {
      kicker: "BUSINESS OPPORTUNITIES",
      title: "Business across the pet industry",
      lead: "PETLOG is designed as a platform for both individual users and businesses.",
      items: [
        { n: "01", name: "Personal subscription", lead: "Core records stay free; a subscription for advanced features is under review." },
        { n: "02", name: "Trading and group buying", lead: "Discovery happens in PETLOG; trading, payment and settlement are planned to link with SHAREON." },
        { n: "03", name: "Booking and services", lead: "Booking links to pet service providers will be reviewed step by step after legal and safety review." },
        { n: "04", name: "Businesses and institutions", lead: "Provider SaaS, automation, employee benefits and institutional licences are under review." },
      ],
      cta: "See PETLOG Business",
    },
    newon: {
      kicker: "NEWON ECOSYSTEM",
      title: "Growing with the rest\nof Newon.",
      lead: "PETLOG is one of Newon's six flagship platforms.",
      items: [
        { n: "01", name: "SHAREON", body: "Planned link for trading, payment and settlement of pet goods (in development, not integrated)", href: "shareon/" },
        { n: "02", name: "BABYLOG", body: "Records for families raising children and pets together", href: "portfolio/babylog/" },
        { n: "03", name: "LIVON", body: "Life-stage information, including pet life", href: "lifestage/" },
        { n: "04", name: "ONGIL", body: "Everyday life of senior owners and their pets", href: "ongil/" },
        { n: "05", name: "MY WORLD", body: "Travel and outing records with your pet", href: "portfolio/myworld/" },
      ],
    },
    close: {
      kicker: "NEXT STEP",
      titleHtml: "Let's make pet life<br>better together.",
      lead: "Try the PETLOG app, or propose a partnership.",
      ctaMain: "Partnership inquiry",
      ctaSub: "See the PETLOG app",
    },
  },
};

/* ------------------------------------------------------------------ Platform (16) */
// [label, ko title, en title, ko lead, en lead, ko features[], en features[], status, related href]
const P = (label, koT, enT, koL, enL, koF, enF, status, href) => ({ label, t: L(koT, enT), lead: L(koL, enL), f: L(koF, enF), status, href });
export const PLATFORM = {
  meta: {
    ko: {
      title: "PETLOG Platform | 기록부터 쇼핑과 돌봄까지",
      desc: "PETLOG 서비스 16개 영역 — 기록, 건강, 산책, 가족 공유부터 쇼핑, 중고거래, 공동구매, 예약, 커뮤니티, 교육, 여행, 입양, 시니어까지. 영역별 제공 상태를 함께 안내합니다.",
      heroTitle: "기록부터 쇼핑과 돌봄까지,<br>반려생활의 모든 경험.",
      heroLead: "PETLOG가 연결하려는 16개 서비스 영역입니다. 영역마다 지금 앱에서 제공하는지, 준비 중인지 표시했습니다. 앱 기능은 웹에서 제공하지 않습니다.",
      kicker: "PLATFORM",
      listTitle: "16개 서비스 영역",
      listLead: "‘앱에서 제공’은 현재 PETLOG 앱 기준이며, 나머지는 준비·검토 단계입니다.",
      featuresLabel: "핵심 기능·가치",
      cta: "관련 문의",
      appCta: "앱에서 보기",
    },
    en: {
      title: "PETLOG Platform | From records to shopping and care",
      desc: "The 16 PETLOG service areas — records, health, walks and family sharing through shopping, secondhand, group buying, booking, community, education, travel, adoption and senior care — with the status of each.",
      heroTitle: "From records to shopping and care,<br>every part of pet life.",
      heroLead: "The 16 service areas PETLOG aims to connect, each marked with whether it is in the app today or still in preparation. App features are not offered on the web.",
      kicker: "PLATFORM",
      listTitle: "16 service areas",
      listLead: "“In the app today” reflects the current PETLOG app; everything else is in preparation or review.",
      featuresLabel: "Key features and value",
      cta: "Ask about this",
      appCta: "Open in the app",
    },
  },
  items: [
    P("Daily Records", "일상 기록", "Daily records", "식사, 간식, 급수, 체중 등 매일의 생활을 기록합니다.", "Record meals, treats, water and weight every day.", ["식사·간식·급수", "체중 변화", "생활 통계"], ["Meals, treats, water", "Weight trend", "Daily statistics"], "app", "app"),
    P("Health & Wellness", "건강 관리", "Health & wellness", "예방접종, 병원 방문, 복약, 검사 이력을 보관합니다.", "Keep vaccinations, vet visits, medication and test history.", ["예방접종·복약", "병원 일정", "건강 이력"], ["Vaccinations and medication", "Vet schedule", "Health history"], "app", "app"),
    P("Walk & Activity", "산책·활동", "Walks & activity", "산책 시간과 거리, 활동량을 관리합니다.", "Track walk time, distance and activity.", ["산책 기록", "활동량", "운동 패턴"], ["Walk records", "Activity", "Exercise patterns"], "app", "app"),
    P("Family Sharing", "가족 공유", "Family sharing", "가족 구성원과 반려동물의 기록을 함께 봅니다.", "Share your pet's records with family members.", ["가족 초대", "공동 기록", "역할 나누기"], ["Invite family", "Shared records", "Split care tasks"], "app", "app"),
    P("Memories", "추억 기록", "Memories", "사진과 성장 순간을 모아 추억으로 남깁니다.", "Collect photos and milestones as memories.", ["사진 기록", "성장 앨범 (검토)", "기념일"], ["Photo records", "Growth albums (review)", "Anniversaries"], "prep", "contact"),
    P("Smart Assistance", "스마트 어시스턴트", "Smart assistance", "쌓인 기록으로 생활 패턴과 변화를 이해하도록 돕습니다. 진단을 대신하지 않습니다.", "Helps you understand patterns and changes from your records. It does not replace a vet's diagnosis.", ["생활 패턴 요약", "변화 알림", "AI 인사이트"], ["Pattern summaries", "Change alerts", "AI insights"], "prep", "contact"),
    P("Pet Shopping", "반려용품 쇼핑", "Pet shopping", "반려동물에게 맞는 용품을 발견하도록 돕습니다.", "Helps you discover goods that suit your pet.", ["상품 발견", "브랜드 입점 (검토)", "맞춤 추천 (검토)"], ["Product discovery", "Brand listings (review)", "Recommendations (review)"], "prep", "contact"),
    P("Secondhand Market", "중고거래·나눔", "Secondhand market", "쓰지 않는 반려용품을 이웃과 나누고 거래합니다.", "Share and trade pet goods you no longer use.", ["개인 간 거래", "나눔", "거래 안전 정책"], ["Person-to-person trading", "Giving away", "Safety policy"], "plan", "contact"),
    P("Group Buying", "공동구매", "Group buying", "보호자들이 함께 모여 더 좋은 조건으로 구매합니다.", "Owners buy together on better terms.", ["공동구매 모집", "판매자 자격 확인", "규제 품목 제한"], ["Group campaigns", "Seller eligibility check", "Regulated items excluded"], "plan", "contact"),
    P("Booking & Care", "예약·돌봄", "Booking & care", "미용, 호텔, 유치원, 훈련, 돌봄 업체를 찾고 예약하는 흐름을 검토합니다.", "Reviewing a flow to find and book grooming, hotels, daycare, training and care.", ["업체 탐색", "예약 (검토)", "적격 업체 검증"], ["Find providers", "Booking (review)", "Provider checks"], "legal", "contact"),
    P("Community", "커뮤니티", "Community", "보호자들이 경험을 나누고 질문합니다.", "Owners share experience and ask questions.", ["질문·답변", "이야기 공유", "신고·차단 정책"], ["Q&A", "Stories", "Report and block policy"], "prep", "contact"),
    P("Education", "교육", "Education", "훈련, 건강, 생활 정보를 배울 수 있는 콘텐츠를 준비합니다.", "Preparing content on training, health and daily care.", ["훈련 가이드", "건강 정보", "전문가 콘텐츠 (검토)"], ["Training guides", "Health information", "Expert content (review)"], "plan", "contact"),
    P("Travel & Outings", "여행·외출", "Travel & outings", "반려동물과 함께 갈 수 있는 곳과 준비를 안내합니다.", "Places to go with your pet and how to prepare.", ["동반 장소 정보", "외출 준비", "MY WORLD 기록 연계 (검토)"], ["Pet-friendly places", "Outing checklist", "MY WORLD link (review)"], "plan", "contact"),
    P("Adoption & Protection", "입양·보호", "Adoption & protection", "입양 정보와 보호단체, 실종 지원을 연결합니다.", "Connecting adoption information, shelters and lost-pet support.", ["입양 정보", "보호단체 협력 (계획)", "실종 지원"], ["Adoption information", "Shelter partnerships (planned)", "Lost-pet support"], "plan", "partnerships"),
    P("Senior & Memorial", "시니어·추모", "Senior & memorial", "나이 든 반려동물의 돌봄과 이별 이후의 기억을 함께합니다.", "Care for older pets, and remembering them after farewell.", ["시니어 케어 정보", "추모 기록", "장례 정보 (적법성 검토)"], ["Senior care information", "Memorial records", "Funeral information (legality review)"], "plan", "contact"),
    P("App & Trust", "앱과 신뢰", "App & trust", "PETLOG 앱을 다운로드하고, 개인정보와 기록을 안전하게 관리합니다.", "Download the PETLOG app; records and personal data are handled safely.", ["App Store·Google Play", "개인정보·위치정보 보호", "기록은 보호자의 것"], ["App Store and Google Play", "Privacy and location protection", "Records belong to owners"], "app", "app"),
  ],
};

/* ------------------------------------------------------------------ Business */
export const BUSINESS = {
  meta: {
    ko: {
      title: "PETLOG Business | 반려생활 산업을 연결하는 비즈니스",
      desc: "PETLOG 비즈니스 8개 카테고리와 16개 사업군. 사업별 고객, 가치, 수익 모델 유형, 협력 대상, 진행 상태를 안내합니다. 요금과 수수료는 확정되지 않았습니다.",
      heroTitle: "반려생활의 모든 산업을<br>연결하는 비즈니스 생태계.",
      heroLead: "PETLOG는 개인 이용자와 반려 산업의 사업자, 기관을 함께 연결하는 플랫폼으로 설계합니다. 아래 사업은 대부분 준비·검토 단계입니다.",
      catKicker: "CATEGORIES",
      catTitle: "대표 카테고리",
      unitKicker: "BUSINESS LINES",
      unitTitle: "16개 사업군",
      unitLead: "수익 모델은 유형만 안내합니다. 요금·수수료는 확정되지 않았으며 출시 전에 별도로 안내합니다.",
      labels: { customers: "주요 고객", value: "제공 가치", revenue: "수익 모델", partners: "협력 대상" },
      cta: "사업 문의",
      shareon: {
        kicker: "SHAREON",
        title: "상품 발견은 PETLOG,\n거래 인프라는 SHAREON.",
        body: [
          "PETLOG는 반려용품·중고거래·공동구매를 발견하는 곳입니다.",
          "거래·결제·정산은 Newon의 SHAREON 인프라와 연계하는 방향입니다. SHAREON은 개발 중이며 현재 연동은 구현되지 않았습니다.",
          "같은 거래에 PETLOG와 SHAREON이 수수료를 이중으로 받지 않는 것을 원칙으로 합니다.",
          "예약 결제 연계는 별도 검증 대상으로, 법률·PG 계약·보안 검토 후 결정합니다.",
        ],
      },
      trust: {
        kicker: "TRUST",
        title: "법률과 신뢰 원칙",
        items: [
          "동물병원 진료·광고·중개는 관련 법률 검토 후 모델을 결정합니다.",
          "보험 정보는 모집·추천·수수료 규제를 검토한 범위에서만 제공합니다.",
          "입양·보호는 동물보호 관련 법률을 준수합니다.",
          "돌봄·호텔·미용 사업자는 적격성을 확인한 뒤 연결합니다.",
          "장례 업체는 적법성을 검토한 경우에만 안내합니다.",
          "개인정보와 위치정보는 최소한으로 수집하고 보호합니다.",
          "커뮤니티는 신고·차단 정책을 운영합니다.",
          "확보하지 않은 파트너, 실적, 매출은 표시하지 않습니다.",
        ],
      },
    },
    en: {
      title: "PETLOG Business | Connecting the pet industry",
      desc: "PETLOG's 8 business categories and 16 business lines, with customers, value, revenue model type, partners and status. Prices and fees are not decided.",
      heroTitle: "A business ecosystem connecting<br>every part of the pet industry.",
      heroLead: "PETLOG is designed to connect individual users with pet businesses and institutions. Most of the lines below are in preparation or review.",
      catKicker: "CATEGORIES",
      catTitle: "Main categories",
      unitKicker: "BUSINESS LINES",
      unitTitle: "16 business lines",
      unitLead: "Only the type of revenue model is shown. Prices and fees are not decided and will be announced before launch.",
      labels: { customers: "Customers", value: "Value", revenue: "Revenue model", partners: "Partners" },
      cta: "Business inquiry",
      shareon: {
        kicker: "SHAREON",
        title: "Discover in PETLOG,\ntrade on SHAREON.",
        body: [
          "PETLOG is where owners discover pet goods, secondhand items and group buys.",
          "Trading, payment and settlement are planned to run on Newon's SHAREON infrastructure. SHAREON is in development and no integration exists today.",
          "PETLOG and SHAREON will not both charge a fee on the same transaction.",
          "Payment for bookings is a separate case, decided only after legal, PG contract and security review.",
        ],
      },
      trust: {
        kicker: "TRUST",
        title: "Legal and trust principles",
        items: [
          "Vet treatment, advertising and brokerage models are decided only after legal review.",
          "Insurance information is offered only within reviewed rules on solicitation, referral and fees.",
          "Adoption and protection follow animal-protection law.",
          "Care, hotel and grooming providers are checked for eligibility before being connected.",
          "Funeral providers are listed only after a legality review.",
          "Personal and location data are collected minimally and protected.",
          "The community runs a report-and-block policy.",
          "No unsecured partner, track record or revenue is ever shown.",
        ],
      },
    },
  },
  categories: [
    ["Pet Care & Health", "반려 돌봄·건강", "Care and health"],
    ["Shopping & Resale", "쇼핑·중고", "Shopping and resale"],
    ["Group Buying", "공동구매", "Group buying"],
    ["Booking & Services", "예약·서비스", "Booking and services"],
    ["Community & Content", "커뮤니티·콘텐츠", "Community and content"],
    ["Travel & Lifestyle", "여행·라이프스타일", "Travel and lifestyle"],
    ["Business Solutions", "비즈니스 솔루션", "Business solutions"],
    ["Institutions & Global", "기관·글로벌", "Institutions and global"],
  ],
  // [ko name, en name, ko overview, en overview, ko customers, en customers, ko value, en value, ko revenue, en revenue, ko partners, en partners, status]
  units: [
    ["기록·생애 관리", "Records & life management", "반려동물의 평생 기록을 관리하는 PETLOG의 핵심입니다.", "The core of PETLOG: a lifelong record of each pet.", "모든 보호자", "All owners", "흩어진 기록을 한곳에", "Scattered records in one place", "무료 핵심 기능 + 프리미엄 구독 (요금 미정)", "Free core + premium subscription (price not decided)", "—", "—", "app"],
    ["건강·의료 정보", "Health & medical information", "건강 기록과 신뢰할 수 있는 건강 정보를 연결합니다. 진료를 대신하지 않습니다.", "Linking health records with reliable information. It does not replace treatment.", "보호자", "Owners", "변화를 빨리 알아차리기", "Noticing changes early", "프리미엄 구독 · 제휴 (법률 검토 후)", "Premium subscription · partnerships (after legal review)", "동물병원·수의사", "Vets", "legal"],
    ["종합 쇼핑", "Pet shopping", "반려동물에 맞는 용품을 발견하는 쇼핑 영역입니다.", "A shopping area for discovering suitable goods.", "보호자", "Owners", "맞는 상품을 쉽게", "The right products, easily", "기업 상품 판매 수수료 (요율 미정)", "Commission on brand sales (rate not decided)", "펫 브랜드", "Pet brands", "prep"],
    ["중고거래·나눔", "Secondhand & sharing", "쓰지 않는 반려용품을 이웃과 거래하고 나눕니다.", "Trading and giving away unused pet goods.", "보호자", "Owners", "자원 순환과 절약", "Reuse and savings", "초기 무수수료 검토, 이후 결정", "No fee at first (under review)", "SHAREON (연계 방향)", "SHAREON (planned link)", "plan"],
    ["공동구매", "Group buying", "보호자가 함께 모여 좋은 조건으로 구매합니다.", "Owners buying together on better terms.", "보호자·판매자", "Owners and sellers", "더 나은 가격과 품질", "Better price and quality", "판매자 수수료 (요율 미정)", "Seller commission (rate not decided)", "브랜드·개인 판매자", "Brands and individual sellers", "plan"],
    ["예약·서비스", "Booking & services", "미용, 호텔, 유치원, 훈련, 돌봄 예약 연결을 검토합니다.", "Reviewing booking links for grooming, hotels, daycare, training and care.", "보호자·서비스 업체", "Owners and providers", "믿을 수 있는 업체를 쉽게", "Trusted providers, easily", "예약 수수료 (업종별, 미정)", "Booking fee by category (not decided)", "미용·호텔·유치원·훈련·돌봄 업체", "Grooming, hotels, daycare, trainers, carers", "legal"],
    ["커뮤니티·소셜", "Community & social", "보호자들이 경험을 나누는 공간입니다.", "A space for owners to share experience.", "보호자", "Owners", "혼자가 아닌 반려생활", "Not raising a pet alone", "광고·제휴 콘텐츠 (정책 수립 후)", "Ads and sponsored content (after policy)", "크리에이터", "Creators", "prep"],
    ["교육·훈련", "Education & training", "훈련과 생활 교육 콘텐츠를 제공합니다.", "Training and care education content.", "보호자", "Owners", "올바른 반려 지식", "Sound pet knowledge", "교육 콘텐츠 수수료 (미정)", "Education content commission (not decided)", "훈련사·교육 기관", "Trainers and schools", "plan"],
    ["여행·외출", "Travel & outings", "반려동물 동반 여행과 외출 정보를 연결합니다.", "Connecting travel and outing information with pets.", "보호자", "Owners", "함께 갈 수 있는 곳", "Places to go together", "제휴·예약 수수료 (미정)", "Partnership or booking fee (not decided)", "숙소·관광 사업자", "Lodging and tourism businesses", "plan"],
    ["AI 반려생활", "AI pet life", "기록을 바탕으로 생활 패턴을 요약하고 변화를 알려 줍니다.", "Summarising patterns and flagging changes from records.", "보호자", "Owners", "기록을 이해로", "From records to understanding", "프리미엄 구독 (요금 미정)", "Premium subscription (price not decided)", "Newon AI", "Newon AI", "prep"],
    ["보험·금융 정보", "Insurance & finance information", "반려동물 보험 등 금융 정보를 안내합니다.", "Information on pet insurance and finance.", "보호자", "Owners", "필요한 보장을 이해하기", "Understanding cover", "제휴 (모집·추천 규제 검토 후)", "Partnerships (after solicitation rules review)", "보험사", "Insurers", "legal"],
    ["입양·보호·실종 지원", "Adoption, protection & lost pets", "입양 정보, 보호단체, 실종 지원을 연결합니다.", "Connecting adoption, shelters and lost-pet support.", "보호자·보호단체", "Owners and shelters", "더 많은 생명이 가족을 찾도록", "Helping more animals find homes", "공익 협력 (수익 목적 아님)", "Public-interest partnership (not for profit)", "보호단체·지자체", "Shelters and local governments", "plan"],
    ["시니어·장례·추모", "Senior, funeral & memorial", "시니어 케어와 이별 이후의 추모를 돕습니다.", "Senior care and remembrance after farewell.", "보호자", "Owners", "마지막까지 함께하기", "Together to the end", "추모 기록 · 제휴 (적법성 검토 후)", "Memorial records · partnerships (after legality review)", "적법한 장례 업체", "Licensed funeral providers", "plan"],
    ["개인 판매자·크리에이터", "Individual sellers & creators", "개인 판매자와 크리에이터가 상품과 콘텐츠를 선보입니다.", "Individual sellers and creators offering goods and content.", "개인 판매자·크리에이터", "Individual sellers and creators", "작은 판매자의 기회", "Opportunity for small sellers", "판매·디지털 상품 수수료 (미정)", "Sales and digital goods commission (not decided)", "개인 판매자 (자격 확인)", "Individual sellers (eligibility checked)", "plan"],
    ["기업 SaaS·자동화", "Business SaaS & automation", "반려 서비스 업체를 위한 운영 도구와 자동화를 제공합니다.", "Operations tools and automation for pet service providers.", "반려 서비스 업체", "Pet service providers", "예약·고객 관리 부담 줄이기", "Less booking and customer admin", "업체 SaaS 구독 (요금 미정)", "Provider SaaS subscription (price not decided)", "Newon Business", "Newon Business", "plan"],
    ["기관·글로벌", "Institutions & global", "기관 라이선스와 해외 파트너 협력을 검토합니다.", "Reviewing institutional licences and international partners.", "기관·해외 파트너", "Institutions and international partners", "검증된 반려생활 플랫폼", "A proven pet life platform", "기관·글로벌 라이선스 (계약별)", "Institutional and global licences (per contract)", "기관·해외 파트너", "Institutions and international partners", "plan"],
  ],
};

/* ------------------------------------------------------------------ Partnerships (12) */
export const PARTNERS = {
  meta: {
    ko: {
      title: "PETLOG Partnerships | 함께할 파트너를 찾습니다",
      desc: "동물병원, 미용, 펫호텔, 유치원, 훈련사, 돌봄, 브랜드, 판매자, 크리에이터, 보험사, 보호단체, 글로벌 파트너를 위한 PETLOG 협력 안내. 현재 확정된 파트너십은 없습니다.",
      heroTitle: "더 나은 반려생활을 함께<br>만들어갈 파트너를 찾습니다.",
      heroLead: "PETLOG와 협력할 수 있는 12개 파트너 유형입니다. 현재 체결된 파트너십은 없으며, 모든 협력은 검토와 서면 계약으로만 진행됩니다.",
      kicker: "PARTNER TYPES",
      listTitle: "12개 파트너 유형",
      labels: { who: "협력 대상", value: "제공 가치", how: "협력 방식", revenue: "수익 구조", terms: "협력 조건" },
      cta: "협력 문의",
      processKicker: "PROCESS",
      processTitle: "협력 절차",
      processNote: "각 단계는 안내용이며 계약을 자동으로 체결하지 않습니다.",
      steps: [["제안", "문의 양식으로 제안을 보내 주세요."], ["검토", "PETLOG 팀이 적합성과 법률 요건을 검토합니다."], ["협의", "범위, 역할, 일정을 함께 정합니다."], ["계약", "합의 내용을 서면 계약으로 체결합니다."], ["진행", "합의한 방식으로 협력을 시작합니다."]],
    },
    en: {
      title: "PETLOG Partnerships | Looking for partners",
      desc: "PETLOG partnerships for vets, groomers, pet hotels, daycare, trainers, carers, brands, sellers, creators, insurers, shelters and global partners. No partnership has been signed yet.",
      heroTitle: "Looking for partners to make<br>pet life better together.",
      heroLead: "Twelve kinds of partners PETLOG can work with. No partnership has been signed yet, and every partnership goes through review and a written agreement.",
      kicker: "PARTNER TYPES",
      listTitle: "12 partner types",
      labels: { who: "Who", value: "Value", how: "How we work", revenue: "Revenue structure", terms: "Conditions" },
      cta: "Partnership inquiry",
      processKicker: "PROCESS",
      processTitle: "How it works",
      processNote: "These steps are for orientation; nothing is signed automatically.",
      steps: [["Proposal", "Send your proposal through the form."], ["Review", "The PETLOG team reviews fit and legal requirements."], ["Discussion", "Agree scope, roles and timing."], ["Agreement", "Sign a written agreement."], ["Start", "Start on the agreed terms."]],
    },
  },
  // [ko name, en name, ko who, en who, ko value, en value, ko how, en how, ko revenue, en revenue, ko terms, en terms]
  items: [
    ["동물병원", "Veterinary clinics", "동물병원·수의사", "Clinics and vets", "보호자 기록을 바탕으로 한 정확한 소통", "Clearer communication based on owners' records", "건강 정보 협력 (진료·광고·중개는 법률 검토 후)", "Health information partnership (treatment, ads and brokerage after legal review)", "법률 검토 후 결정", "Decided after legal review", "관련 법률 준수, 보호자 동의 기반 정보 공유", "Legal compliance; data shared only with owner consent"],
    ["미용업체", "Grooming salons", "반려동물 미용업체", "Pet groomers", "새 고객과의 연결", "Reaching new customers", "업체 소개·예약 연결 (검토)", "Listing and booking links (review)", "예약 수수료 (요율 미정)", "Booking fee (rate not decided)", "사업자 적격성 확인", "Business eligibility check"],
    ["펫호텔", "Pet hotels", "펫호텔·위탁 시설", "Pet hotels and boarding", "신뢰할 수 있는 이용자 연결", "Connecting trusted customers", "시설 소개·예약 연결 (검토)", "Listing and booking links (review)", "예약 수수료 (요율 미정)", "Booking fee (rate not decided)", "시설·사업자 적격성 확인", "Facility and business checks"],
    ["유치원", "Daycare", "반려동물 유치원", "Pet daycare", "정기 이용 고객 연결", "Regular customers", "프로그램 소개·예약 연결 (검토)", "Programme listing and booking (review)", "예약 수수료 (요율 미정)", "Booking fee (rate not decided)", "사업자 적격성 확인", "Business eligibility check"],
    ["훈련사", "Trainers", "반려동물 훈련사·교육 기관", "Trainers and training schools", "교육 콘텐츠와 수강생 연결", "Content and students", "훈련 예약·교육 콘텐츠 (검토)", "Training bookings and content (review)", "예약·콘텐츠 수수료 (미정)", "Booking or content fee (not decided)", "자격·경력 확인", "Qualification checks"],
    ["펫시터·돌봄업체", "Pet sitters & care", "펫시터·방문 돌봄 업체", "Pet sitters and home care", "필요한 보호자와 연결", "Reaching owners who need care", "돌봄 예약 연결 (검토)", "Care booking links (review)", "예약 수수료 (요율 미정)", "Booking fee (rate not decided)", "신원·자격 확인, 안전 정책 동의", "Identity and qualification checks, safety policy"],
    ["펫 브랜드", "Pet brands", "반려용품 브랜드", "Pet goods brands", "보호자에게 맞는 상품 발견", "Being discovered by the right owners", "입점·공동구매·공동 마케팅 (준비·검토)", "Listings, group buys, co-marketing (prep / review)", "판매 수수료 (요율 미정)", "Sales commission (rate not decided)", "규제 품목 제한, 정확한 표시", "Regulated items excluded, accurate labelling"],
    ["개인 판매자", "Individual sellers", "반려용품 개인 판매자", "Individual sellers of pet goods", "작은 판매의 기회", "A place for small sellers", "판매 참여 (출시 후, SHAREON 연계 방향)", "Selling after launch (planned SHAREON link)", "판매 수수료 (요율 미정)", "Sales commission (rate not decided)", "본인·자격 확인 후 판매", "Identity and eligibility check before selling"],
    ["크리에이터", "Creators", "반려 콘텐츠 크리에이터", "Pet content creators", "콘텐츠로 보호자와 연결", "Reaching owners through content", "콘텐츠·교육 협력 (검토)", "Content and education partnerships (review)", "콘텐츠 수익 배분 (미정)", "Content revenue share (not decided)", "커뮤니티 정책 준수", "Community policy"],
    ["보험사", "Insurers", "반려동물 보험사", "Pet insurers", "보장 정보를 이해하기 쉽게", "Making cover easy to understand", "보험 정보 제공 (규제 검토 후)", "Insurance information (after regulatory review)", "규제 검토 후 결정", "Decided after regulatory review", "모집·추천·수수료 규제 준수", "Solicitation, referral and fee rules"],
    ["보호단체·기관", "Shelters & institutions", "보호단체·지자체·공공기관", "Shelters, local governments, public bodies", "입양과 실종 지원 확대", "More adoptions and lost-pet support", "입양·보호 정보 협력 (계획)", "Adoption and protection information (planned)", "공익 협력 (수익 목적 아님)", "Public interest (not for profit)", "동물보호 관련 법률 준수", "Animal-protection law"],
    ["글로벌 파트너", "Global partners", "해외 반려 플랫폼·유통사", "International pet platforms and distributors", "검증된 반려생활 플랫폼", "A proven pet life platform", "현지화·라이선스·유통 협력 (계획)", "Localisation, licensing, distribution (planned)", "라이선스 계약 (계약별)", "Licence agreement (per contract)", "현지 법률 준수", "Local law"],
  ],
};

/* ------------------------------------------------------------------ Contact */
export const CONTACT = {
  ko: {
    title: "PETLOG Contact | PETLOG 문의",
    desc: "PETLOG 앱 지원, 쇼핑·중고거래, 공동구매, 예약 업체, 브랜드 제휴, 콘텐츠·교육, 기업 SaaS, 기관·공공, 글로벌 협력 문의. Newon 공식 문의 시스템으로 접수합니다.",
    heroTitle: "PETLOG와 함께할<br>새로운 가능성을 이야기해 주세요.",
    heroLead: "문의 유형을 선택해 보내 주세요. Newon 공식 문의 창구로 접수되며, 이메일로 회신드립니다.",
    kicker: "INQUIRY TYPES",
    listTitle: "문의 유형",
    formTitle: "PETLOG 문의",
    subject: "PETLOG 문의",
    typeLabel: "문의 유형",
    messageLabel: "문의 내용",
    messagePh: "문의하실 내용을 적어 주세요. 앱 오류라면 기기와 앱 버전도 알려 주세요.",
    types: [
      ["app-support", "앱 지원", "PETLOG 앱 사용 중 궁금한 점"],
      ["shopping", "쇼핑·중고거래", "반려용품 쇼핑과 중고거래 관련 (준비 중)"],
      ["group-buying", "공동구매", "공동구매 참여·판매 관련 (검토 중)"],
      ["booking-provider", "예약 업체", "미용·호텔·유치원·훈련·돌봄 업체"],
      ["brand", "브랜드 제휴", "반려용품 브랜드 협력"],
      ["content", "콘텐츠·교육", "크리에이터·훈련·교육 콘텐츠"],
      ["saas", "기업 SaaS·자동화", "업체용 운영 도구와 자동화"],
      ["public", "기관·공공 협력", "보호단체·지자체·공공기관"],
      ["global", "글로벌·전략적 협력", "해외 진출·라이선스·전략 제휴"],
    ],
  },
  en: {
    title: "PETLOG Contact | Contact PETLOG",
    desc: "Contact PETLOG about app support, shopping and secondhand, group buying, booking providers, brand partnerships, content and education, business SaaS, public bodies and global partnerships — through Newon's official inquiry channel.",
    heroTitle: "Tell us about<br>what we could do with PETLOG.",
    heroLead: "Choose an inquiry type and send it. It goes to Newon's official inquiry channel and we reply by email.",
    kicker: "INQUIRY TYPES",
    listTitle: "Inquiry types",
    formTitle: "PETLOG inquiry",
    subject: "PETLOG inquiry",
    typeLabel: "Inquiry type",
    messageLabel: "Your message",
    messagePh: "Tell us what you need. For app issues, please include your device and app version.",
    types: [
      ["app-support", "App support", "Questions about using the PETLOG app"],
      ["shopping", "Shopping & secondhand", "Pet shopping and secondhand (in preparation)"],
      ["group-buying", "Group buying", "Joining or selling in group buys (under review)"],
      ["booking-provider", "Booking providers", "Grooming, hotels, daycare, trainers, care"],
      ["brand", "Brand partnerships", "Pet goods brands"],
      ["content", "Content & education", "Creators, training and education content"],
      ["saas", "Business SaaS & automation", "Operations tools and automation for providers"],
      ["public", "Public & institutional", "Shelters, local governments, public bodies"],
      ["global", "Global & strategic", "International expansion, licensing, strategic alliances"],
    ],
  },
};
