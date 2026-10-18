/**
 * SHAREON — All-in-One Sharing & Rental Marketplace (Overview · Platform · Business · Partnerships · Contact).
 * Source: "SHAREON 최종 사업 확장 계획" (14 core businesses, 6 revenue axes, 5 website menus).
 * Business introduction only: no listing, search, booking, payment, deposit, settlement, chat or login on the web.
 *
 * Status rules: the SHAREON app is a pilot build — real trades, payment and booking confirmation are switched off
 * and it is not in the app stores. Nothing here is "available now".
 *   dev  = being built in the app (pilot, not released)
 *   prep = being prepared (needs operations, legal, payment-provider or partner work first)
 *   long = long-term business direction
 * No user counts, volumes, partner names or fixed prices/fees. The revenue calculator is a hypothetical example the
 * visitor can change; the fee-rate field is left blank (rate not decided) for the visitor to fill in.
 * KO and EN are complete; other locales fall back to EN body text (as Ongil does) with localized SEO and hero lines.
 */

/* icon keys → scripts/shareon-icons.mjs */

const KO = {
  lang: "ko",
  brand: "SHAREON",
  positioning: "All-in-One Sharing & Rental Marketplace",
  status: { dev: "앱에서 개발 중", prep: "준비 중", long: "장기 사업 방향" },
  statusLabel: "진행 상태",
  statusNote:
    "SHAREON 앱은 현재 시범 개발 단계입니다. 실제 대여·예약 확정·결제·보증금·정산은 아직 운영되지 않으며, 이 페이지는 사업 방향과 준비 상황을 소개합니다.",
  subnavAria: "SHAREON 메뉴",
  subnav: [
    { id: "overview", n: "01", en: "Overview", label: "소개" },
    { id: "platform", n: "02", en: "Platform", label: "서비스" },
    { id: "business", n: "03", en: "Business", label: "비즈니스" },
    { id: "partnerships", n: "04", en: "Partnerships", label: "파트너십" },
    { id: "contact", n: "05", en: "Contact", label: "문의" },
  ],
  crumb: "SHAREON 소개로",
  inquiry: "문의하기",
  partnershipInquiry: "파트너십 문의하기",
  businessInquiry: "사업 문의하기",
  considerLabel: "확인할 점",
  targetsLabel: "주요 대상",
  customerLabel: "핵심 고객",
  revenueLabel: "수익 구조",
  stats: [
    { n: "14", label: "핵심 사업군" },
    { n: "6", label: "주요 수익원" },
    { n: "5", label: "웹사이트 메뉴" },
  ],
  statsNote: "숫자는 사업 계획의 구성이며, 이용자·거래 실적이 아닙니다.",
  matrix: { provider: "빌려주는 쪽", renter: "빌리는 쪽", person: "개인", business: "기업" },

  /* ─────────────── 01 Overview ─────────────── */
  overview: {
    seoTitle: "SHAREON | Newon — 공유·대여 마켓플레이스",
    seoDescription:
      "SHAREON은 개인과 기업이 보유한 물건·장비·공간·이동수단을 필요한 사람과 연결하는 공유·대여 마켓플레이스를 지향합니다. 앱은 시범 개발 중이며 실제 대여·결제는 아직 운영되지 않습니다.",
    hero: {
      kicker: "SHAREON / OVERVIEW",
      title: "소유하지 않아도,\n필요한 순간에.",
      lead: "SHAREON은 개인과 기업이 직접 가입해 보유한 물건·공간·이동수단과 서비스를 등록하고, 필요한 사람과 연결하는 공유·대여 오픈 마켓플레이스를 지향합니다.",
      ctaMain: "서비스 알아보기",
      ctaSub: "사업·제휴 문의",
    },
    vision: {
      kicker: "OUR VISION",
      title: "소유보다\n활용이 중요한 순간을 위해.",
      lead: "많은 물건과 공간은 쓰지 않는 시간에도 가치를 가지고 있습니다. SHAREON은 필요한 순간에 빌려 쓰고, 쓰지 않는 자원은 다른 사람과 나눌 수 있는 환경을 만들어 갑니다.",
      points: [
        { n: "01", body: "자주 쓰지 않지만 사기에는 부담스러운 물건을, 필요한 기간만큼 빌려 씁니다. 캠핑 장비나 촬영 장비처럼 가끔 쓰는 물건이 대표적입니다." },
        { n: "02", body: "개인과 기업 모두 별도 제휴 계약 없이 직접 가입해, 공급자이면서 동시에 이용자가 될 수 있습니다." },
        { n: "03", body: "등록부터 반납까지 거래가 안전하게 끝나는 구조를 함께 설계합니다. 첫 출시는 대여·공간·서비스 중심으로, 공급자가 요청을 확인하고 수락하는 승인형 예약부터 준비합니다." },
        { n: "04", body: "기본 등록과 거래는 구독 없이 이용할 수 있는 구조를 원칙으로 합니다. NEWON은 완료된 거래에 대한 플랫폼 수수료로 운영하며, 수수료율은 아직 확정되지 않았습니다." },
      ],
    },
    share: {
      kicker: "WHAT WE SHARE",
      title: "물건부터 공간, 이동수단까지.",
      lead: "SHAREON이 공유·대여의 대상으로 검토하는 네 가지 자원입니다. 공간·장비와 함께 제공되는 서비스도 등록 대상으로 함께 검토합니다.",
      items: [
        { icon: "everyday", en: "Things", title: "물건", body: "생활용품·전자기기·여행·캠핑·패션·행사 용품. 사기에는 부담스럽고 가끔만 필요한 물건을 필요한 기간만큼 빌리는 방식입니다.", chips: ["생활용품", "전자기기", "캠핑용품", "행사 용품"] },
        { icon: "camera", en: "Equipment", title: "장비", body: "카메라·촬영 장비부터 산업·사무 장비까지. 전문 장비는 상태 고지와 사용 자격, 안전 기준을 함께 확인합니다.", chips: ["촬영 장비", "스포츠 장비", "전문 장비", "사무 장비"] },
        { icon: "space", en: "Spaces", title: "공간", body: "회의실·스튜디오·연습실·작업실·전시 공간. 첫 출시의 중심 영역으로, 공간 운영과 함께 제공되는 서비스 등록도 검토합니다.", chips: ["회의실", "스튜디오", "작업실", "파티룸"] },
        { icon: "mobility", en: "Mobility", title: "이동수단", body: "자전거·이동 장비. 차량은 법적 요건이 엄격해 적격 사업자 연계만 장기적으로 검토합니다.", chips: ["자전거", "이동 장비", "적격 사업자 차량"] },
      ],
    },
    how: {
      kicker: "HOW IT WORKS",
      title: "등록에서 반납까지,\n하나의 대여 흐름.",
      lead: "SHAREON이 목표로 하는 대여 거래 흐름입니다. 결제·보증금·정산·분쟁 처리는 결제대행 계약과 책임·환불 규정을 함께 설계한 뒤 단계적으로 운영합니다.",
      steps: [
        { n: "01", en: "List", title: "등록", body: "개인·기업이 대여할 물품·공간·서비스를 사진과 조건으로 등록합니다." },
        { n: "02", en: "Discover", title: "탐색", body: "지역·카테고리·기간·가격으로 찾습니다. 정확한 주소는 거래 전에 공개하지 않습니다." },
        { n: "03", en: "Request", title: "예약 요청", body: "일정과 조건을 확인해 요청하면, 공급자가 검토 후 수락하는 승인형으로 준비합니다." },
        { n: "04", en: "Pay", title: "결제·보증금", body: "적격 결제대행사를 통해 처리하며, 보증금 처리 방식이 확정되기 전까지는 운영하지 않습니다." },
        { n: "05", en: "Pick up", title: "인수", body: "상태·구성품·인수 시점을 사진과 함께 기록하는 방식을 준비합니다." },
        { n: "06", en: "Use", title: "이용", body: "대여 기간·연장 요청·문의를 앱 안에서 관리하는 흐름입니다." },
        { n: "07", en: "Return", title: "반납", body: "인수 때의 기록과 비교해 상태를 검수하고, 문제는 정해진 절차로 처리합니다." },
        { n: "08", en: "Settle", title: "정산·후기", body: "보증금 처리·정산·상호 평가로 거래를 마무리하는 단계입니다." },
      ],
    },
    connect: {
      kicker: "WHO WE CONNECT",
      title: "개인과 기업,\n누구나 빌려주고 빌립니다.",
      lead: "SHAREON의 가장 큰 특징은 개인과 기업이 모두 공급자이면서 이용자가 될 수 있다는 점입니다. 아래 여섯 가지는 사업 구조와 수익화의 축이며, 모두 구현되었다는 뜻은 아닙니다.",
      items: [
        { n: "01", en: "C2C", title: "개인 간 공유·대여", body: "개인이 가진 물건이나 장비를 다른 개인에게. 이웃 간 근거리 대여가 기본 형태입니다." },
        { n: "02", en: "B2C", title: "기업에서 개인으로", body: "기업이 보유한 장비·공간·물품을 개인에게. 대여업체와 공간 운영자가 직접 등록합니다." },
        { n: "03", en: "C2B", title: "개인에서 기업으로", body: "기업이 개인 소유의 장비·물품을 빌립니다. 촬영·행사처럼 짧게 필요한 경우입니다." },
        { n: "04", en: "B2B", title: "기업 간 공유·대여", body: "기업끼리 장비·공간·자원을 빌려줍니다. 유휴 자산의 활용도를 높이는 방향입니다." },
        { n: "05", en: "Marketplace", title: "통합 거래", body: "등록·검색·예약·결제·보증금·정산·후기를 하나의 흐름으로 잇는 구조입니다." },
        { n: "06", en: "SaaS", title: "기업 운영 솔루션", body: "재고·예약·대여·반납·고객·운영 관리. 대여업체를 위한 장기 사업 방향입니다." },
      ],
    },
    trust: {
      kicker: "TRUST & SAFETY",
      title: "물건이 오가는 거래일수록,\n신뢰가 먼저입니다.",
      lead: "대여는 물건이 다시 돌아와야 끝나는 거래입니다. SHAREON은 화면 기능보다 거래의 책임과 절차를 먼저 설계합니다.",
      items: [
        { n: "01", title: "상태 확인", body: "인수·반납 때 물품 상태와 구성품을 기록해, 반납 검수의 기준으로 삼습니다." },
        { n: "02", title: "보증금 원칙", body: "보증금은 매출과 구분합니다. 자체 에스크로는 만들지 않으며, 결제대행사의 보증금 방식이 확정되고 법률 검토를 마친 뒤에만 운영합니다." },
        { n: "03", title: "이용자·사업자 확인", body: "본인·사업자 확인과 품목별 자격을 확인합니다. 차량·전문 장비처럼 자격이 필요한 품목은 기준을 따로 둡니다." },
        { n: "04", title: "분쟁 대응", body: "파손·분실·연체에 대한 기준과 처리 절차를 마련하고, 법률 검토 후 약관과 함께 확정합니다." },
        { n: "05", title: "개인정보 보호", body: "정확한 주소는 거래 전에 공개하지 않고, 사진 위치 정보는 등록할 때 제거합니다." },
      ],
      note: "보증금 보관·보상은 현재 제공하지 않으며, 보호나 보상을 약속하지 않습니다.",
    },
    eco: {
      kicker: "BUSINESS ECOSYSTEM",
      title: "대여업체와 기업을 위한\n운영의 기반까지.",
      lead: "SHAREON은 마켓플레이스와 함께, 대여업체·기업이 재고·예약·고객·정산을 관리할 수 있는 자체 SaaS를 장기 방향으로 준비합니다. 고객별 외주 개발이 아니라 표준 운영 솔루션입니다.",
      items: [
        { n: "01", title: "대여업체 입점", body: "전문 대여업체가 별도 제휴 계약 없이 직접 등록하고 거래하는 구조입니다." },
        { n: "02", title: "기업 자산 공유", body: "쓰지 않는 장비·공간을 다른 기업과 나눠, 유휴 자산의 활용도를 높입니다." },
        { n: "03", title: "SHAREON Business SaaS", body: "예약·재고·CRM·정산·자동화 운영 도구. 현재 출시된 제품은 없습니다." },
      ],
      cta: "비즈니스 자세히 보기",
    },
    newon: {
      kicker: "NEWON ECOSYSTEM",
      title: "NEWON 안에서\nSHAREON이 맡는 자리.",
      lead: "SHAREON은 물품을 빌리는 거래를, 다른 NEWON 서비스의 커머스는 해당 분야 상품을 사는 거래를 맡습니다. 현재 서비스 간 연동이나 데이터 공유는 없습니다.",
      items: [
        { name: "SHAREON", body: "물건·장비·공간의 공유·대여", self: true },
        { name: "MY WORLD", body: "여행 기록·계획·예약·상품 구매" },
        { name: "PETLOG", body: "반려동물 생활·건강·상품·서비스" },
        { name: "BABYLOG", body: "임신·출산·육아·아동 성장" },
        { name: "LIVON", body: "생애 단계별 정보·제도·생활 안내" },
        { name: "ONGIL", body: "시니어 생활·돌봄·복지" },
      ],
    },
    next: {
      kicker: "NEXT STEP",
      title: "필요한 순간,\nSHAREON의 가능성을 만나보세요.",
      lead: "SHAREON은 개인과 기업이 직접 참여하는 공유·대여 오픈 마켓플레이스와, 대여업체를 위한 운영 SaaS로 성장하는 것을 목표로 합니다.",
      ctas: ["서비스 알아보기", "파트너십 살펴보기", "문의하기"],
    },
  },

  /* ─────────────── 02 Platform ─────────────── */
  platform: {
    seoTitle: "SHAREON 서비스 | 물건·장비·공간·이동수단 대여 — Newon",
    seoDescription:
      "생활용품, 전자기기, 촬영 장비, 캠핑, 패션·행사, 공간, 이동수단, 스포츠, 전문·사무 장비, 지역·기업 공유와 대여 거래 시스템까지. SHAREON의 18개 서비스 영역입니다.",
    hero: {
      kicker: "SHAREON / PLATFORM",
      title: "물건부터 공간까지,\n필요한 순간에 연결합니다.",
      lead: "일상에서 필요한 물건부터 전문 장비와 공간까지. SHAREON이 준비하는 열여덟 가지 서비스 영역과, 대여가 안전하게 끝나기 위한 거래 시스템을 소개합니다.",
      ctaMain: "비즈니스 살펴보기",
      ctaSub: "문의하기",
    },
    indexTitle: "18개 서비스 한눈에 보기",
    groups: [
      { id: "a", kicker: "A · THINGS", title: "생활·개인 물품 대여", lead: "자주 쓰지 않지만 사기에는 부담스러운 물건들입니다." },
      { id: "b", kicker: "B · SPACE, MOBILITY & PRO", title: "공간·이동수단·전문 장비", lead: "규정·자격·안전 확인이 함께 필요한 영역입니다." },
      { id: "c", kicker: "C · SHARED RESOURCES", title: "공유 자원", lead: "가까운 지역과 기업의 유휴 자원을 연결합니다." },
      { id: "d", kicker: "D · RENTAL SYSTEM", title: "대여 거래 시스템", lead: "SHAREON은 단순한 상품 목록이 아니라, 거래가 안전하게 완료되는 플랫폼을 지향합니다. 결제·보증금·반납·분쟁 기능은 실제 구현 상태에 맞춰 소개합니다." },
      { id: "e", kicker: "E · ACCESS", title: "앱과 접근성", lead: "" },
    ],
    services: [
      { n: "01", g: "a", icon: "everyday", en: "Everyday Rental", title: "생활용품 대여", body: "필요할 때 사기에는 부담스러운 생활 장비를 필요한 날만큼 빌립니다. 이사·대청소·집수리처럼 가끔 생기는 일에 맞춘 대여입니다.", chips: ["청소 장비", "공구", "고압세척기", "사다리", "생활 가전", "이사 도구"], consider: "기본 사용 안내와 구성품 확인이 필요합니다.", status: "dev" },
      { n: "02", g: "a", icon: "electronics", en: "Electronics", title: "전자기기 대여", body: "노트북·태블릿·프로젝터·모니터·게임기 등 고가 기기를 단기간 이용합니다. 출장·행사·시험 사용처럼 잠시 필요한 경우를 위한 영역입니다.", chips: ["노트북", "태블릿", "프로젝터", "모니터", "게임기"], consider: "파손·분실·개인정보 유출 위험 때문에 기기 초기화, 상태 검수, 인수인계 절차가 필요합니다.", status: "prep" },
      { n: "03", g: "a", icon: "camera", en: "Camera & Production", title: "카메라·촬영장비 대여", body: "개인 크리에이터부터 소규모 제작사·기업까지, 촬영에 필요한 장비를 빌립니다. 개인이 가진 장비를 기업이 빌리는 C2B 거래도 함께 검토합니다.", chips: ["카메라", "렌즈", "조명", "삼각대", "마이크", "영상 장비"], consider: "장비 상태 고지와 파손 기준 합의가 필요합니다.", status: "dev" },
      { n: "04", g: "a", icon: "camping", en: "Travel & Camping", title: "여행·캠핑용품 대여", body: "여행과 캠핑에 필요한 장비를 짧게 빌려 씁니다. MY WORLD가 여행 계획·예약을 맡는다면, SHAREON은 장비 대여에 집중합니다.", chips: ["캐리어", "텐트", "캠핑 의자", "테이블", "침낭", "여행 액세서리"], consider: "계절별 수요와 세척·건조 상태 확인이 중요합니다.", status: "dev" },
      { n: "05", g: "a", icon: "fashion", en: "Fashion & Events", title: "패션·행사용품 대여", body: "행사·촬영용 의상과 소품을 필요한 날 빌립니다. 위생과 진위 확인 기준이 마련된 품목부터 다룰 계획입니다.", chips: ["행사 의류", "촬영 의상", "가방", "액세서리", "파티 소품"], consider: "브랜드 상품의 진위, 위생·세탁, 훼손 책임, 대여 가능 여부를 확인해야 합니다.", status: "prep" },
      { n: "06", g: "b", icon: "space", en: "Space Rental", title: "공간 대여", body: "회의실·스튜디오·연습실·작업실·파티룸·전시 공간을 시간·일·장기 단위로 이용하는 방식을 검토합니다. 첫 출시의 중심 영역이며, 공간 운영자가 함께 제공하는 서비스 등록도 검토합니다.", chips: ["회의실", "촬영 스튜디오", "연습실", "작업실", "파티룸", "전시 공간"], consider: "실제 사용 가능 용도, 소방·안전·영업 규정, 시설 운영자의 권한(임대·전대 포함)을 확인해야 합니다. 숙박·주차는 적법한 조건이 확인되기 전까지 다루지 않습니다.", status: "dev" },
      { n: "07", g: "b", icon: "mobility", en: "Mobility", title: "차량·이동수단 대여", body: "자전거·전동 이동수단 등 이동 관련 자원의 대여를 검토합니다.", chips: ["자전거", "전동 이동수단", "이동 장비", "적격 사업자 차량"], consider: "자동차 유상 대여와 일부 이동수단은 법적 요건이 엄격합니다. 초기에는 적격 사업자 연계에 한정하며, 개인 간 무허가 차량 유상 대여는 허용하지 않습니다.", status: "long" },
      { n: "08", g: "b", icon: "sports", en: "Sports & Leisure", title: "스포츠·레저용품 대여", body: "스키·스노보드·골프·운동·아웃도어 장비를 빌립니다. 시즌마다 잠깐 필요한 장비를 사지 않고 이용하는 방식입니다.", chips: ["스키", "스노보드", "골프 장비", "운동 장비", "아웃도어 장비"], consider: "안전 상태, 보호장비, 사용 조건, 파손 책임이 중요합니다.", status: "prep" },
      { n: "09", g: "b", icon: "pro", en: "Professional Equipment", title: "산업·전문 장비 대여", body: "건설·제조·촬영·측정·연구·현장 작업용 전문 장비를 기업과 적격 사업자에게 대여합니다.", chips: ["산업 장비", "측정 장비", "연구 장비", "현장 작업 장비"], consider: "장비별 사용 자격, 안전교육, 유지보수, 보험, 운송 조건을 검토해야 합니다.", status: "long" },
      { n: "10", g: "b", icon: "office", en: "Business Equipment", title: "사무·비즈니스 장비 대여", body: "프린터·복합기·프로젝터·회의·행사 장비·사무 가구·기업용 IT 장비를 대여합니다. 기업 고객의 반복·장기 대여를 장기 방향으로 검토합니다.", chips: ["복합기", "프로젝터", "회의 장비", "행사 장비", "사무 가구", "IT 장비"], consider: "기업 고객의 반복 거래와 장기 계약 조건을 함께 설계합니다.", status: "long" },
      { n: "11", g: "c", icon: "local", en: "Local Sharing", title: "지역 기반 공유", body: "동네에서 쓰지 않는 물품과 장비를 가까운 이웃과 나눕니다. 직접 등록하고, 근거리에서 찾고, 안전하게 주고받는 구조를 검토합니다.", chips: ["근거리 대여", "동네 자원", "지역 렌털 사업자", "안전한 인수·반납"], consider: "정확한 주소는 거래 전에 공개하지 않고, 안전한 전달 방식을 마련합니다.", status: "dev" },
      { n: "12", g: "c", icon: "corporate", en: "Corporate Sharing", title: "기업 자산 공유", body: "기업의 유휴 장비와 공간을 다른 기업이나 개인 사업자에게 대여합니다. 쓰지 않는 자산의 가동률을 높이는 방향입니다.", chips: ["유휴 장비", "유휴 공간", "기업 간 장기 대여", "가동률 개선"], consider: "기업 내부 승인과 자산 관리 기준을 확인합니다.", status: "long" },
      { n: "13", g: "d", icon: "search", en: "Listings & Discovery", title: "등록과 탐색", body: "개인·기업이 대여 물품·공간·서비스를 등록하고, 지역·카테고리·기간·가격으로 찾습니다. 기본 등록은 구독 없이 이용하는 구조를 원칙으로 합니다.", chips: ["물품 등록", "사진 등록", "카테고리", "지역 검색", "기간·가격 필터"], consider: "사진의 위치 정보는 등록할 때 제거합니다.", status: "dev" },
      { n: "14", g: "d", icon: "calendar", en: "Booking & Rental", title: "예약과 대여", body: "대여 가능 일정과 조건을 확인하고, 승인형으로 예약을 요청합니다. 첫 출시는 공급자가 요청을 확인하고 수락하는 승인형 예약부터 준비하며, 즉시 예약은 이후 검토합니다.", chips: ["이용 가능 기간", "예약 요청", "승인형 예약", "기간 연장", "일정 관리"], consider: "예약 요청 화면은 개발 중이며, 예약 확정은 아직 운영되지 않습니다.", status: "dev" },
      { n: "15", g: "d", icon: "payment", en: "Payments & Deposits", title: "결제와 보증금", body: "적격 결제대행사를 통해 대여 대금과 보증금을 처리하는 구조를 준비합니다. SHAREON이 대금을 직접 보관하는 자체 에스크로는 만들지 않으며, 결제대행사의 보증금 처리 방식이 확정되기 전까지 결제·보증금은 운영하지 않습니다.", chips: ["대여 결제", "보증금", "환불 규정", "정산"], consider: "결제대행 계약, 거래 당사자 책임, 환불 규정, 손해배상을 함께 설계한 뒤에만 운영합니다. 보증금은 플랫폼 매출과 구분합니다.", status: "prep" },
      { n: "16", g: "d", icon: "return", en: "Returns & Disputes", title: "반납과 분쟁", body: "반납 때 상태를 검수하고, 파손·분실·연체 문제를 정해진 절차로 처리합니다. 인수 때 남긴 사진·구성품 기록을 비교 기준으로 삼습니다.", chips: ["상태 검수", "구성품 확인", "파손·분실 기준", "연체 처리", "분쟁 대응"], consider: "처리 기준은 법률 검토 후 약관과 함께 확정합니다.", status: "prep" },
      { n: "17", g: "d", icon: "trust", en: "Trust & Reviews", title: "신뢰와 후기", body: "거래 후 평가와 신고·차단으로 신뢰할 수 있는 이용 환경을 만듭니다. 광고·유료 노출은 항상 광고로 표시하는 원칙을 함께 적용합니다.", chips: ["이용자 확인", "사업자 확인", "거래 후기", "신고·차단"], consider: "신고 기능은 앱에서 개발 중이며, 후기는 실제 거래가 시작된 뒤 운영합니다.", status: "dev" },
      { n: "18", g: "e", icon: "app", en: "App & Accessibility", title: "앱과 접근성", body: "SHAREON은 iOS·Android 앱으로 준비하고 있습니다. 실제 대여·예약은 앱에서만 제공하며, 웹사이트는 사업 소개만 합니다.", chips: ["iOS", "Android", "다크 모드", "큰 글자", "스크린리더"], consider: "아직 앱스토어에 출시되지 않아 다운로드 링크가 없습니다.", status: "dev" },
    ],
  },

  /* ─────────────── 03 Business ─────────────── */
  business: {
    seoTitle: "SHAREON 비즈니스 | 14개 사업군·수익 모델·기업 SaaS — Newon",
    seoDescription:
      "SHAREON의 14개 공유·대여 사업군, 6개 수익원, 기업용 SaaS와 실행 단계를 소개합니다. 수수료와 가격은 확정되지 않았으며 계산 예시는 가상입니다.",
    hero: {
      kicker: "SHAREON / BUSINESS",
      title: "공유·대여 전문 마켓플레이스와\n기업용 운영 SaaS.",
      lead: "SHAREON은 거래 성사와 반복 대여가 매출의 핵심인 양면 마켓플레이스입니다. 처음 검토한 20개 영역에서 공유·대여와 거리가 먼 6개를 덜어 내고, 14개 핵심 사업군으로 다시 짰습니다.",
      ctaMain: "파트너십 살펴보기",
      ctaSub: "사업 문의하기",
    },
    structure: {
      kicker: "BUSINESS STRUCTURE",
      title: "누구나 공급자이고,\n누구나 이용자입니다.",
      lead: "여섯 가지 축은 사업 구조와 수익화를 설명하며, 모두 구현되었다는 뜻은 아닙니다.",
    },
    core: {
      kicker: "14 CORE BUSINESSES",
      title: "14개 핵심 사업군,\n6개 카테고리.",
      lead: "카테고리를 선택하면 사업군별 대상·고객·수익 구조를 볼 수 있습니다.",
      tabsAria: "사업 카테고리",
      cats: [
        { id: "c1", n: "01", en: "Everyday & Electronics", title: "생활·전자기기" },
        { id: "c2", n: "02", en: "Travel, Fashion & Leisure", title: "여행·패션·레저" },
        { id: "c3", n: "03", en: "Space & Mobility", title: "공간·이동수단" },
        { id: "c4", n: "04", en: "Professional & Business", title: "전문·사무 장비" },
        { id: "c5", n: "05", en: "Local & Corporate Sharing", title: "지역·기업 공유" },
        { id: "c6", n: "06", en: "SaaS, Public & Global", title: "SaaS·공공·글로벌" },
      ],
      items: [
        { n: "01", c: "c1", icon: "everyday", en: "Everyday Rental", title: "생활용품 대여", targets: "청소기·공구·가전·이사·집수리 등 생활 장비", customer: "개인·가정·소규모 사업자·지역 대여업체", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)", status: "dev" },
        { n: "02", c: "c1", icon: "electronics", en: "Electronics Rental", title: "전자기기 대여", targets: "노트북·태블릿·프로젝터·모니터", customer: "개인·기업", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)", status: "prep", consider: "기기 초기화·보증금·상태 검수·인수인계" },
        { n: "03", c: "c2", icon: "camera", en: "Camera & Production", title: "카메라·촬영장비 대여", targets: "카메라·렌즈·조명·마이크", customer: "개인 크리에이터·소규모 제작사·기업", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)", status: "dev" },
        { n: "04", c: "c2", icon: "camping", en: "Travel & Camping", title: "여행·캠핑용품 대여", targets: "캐리어·텐트·캠핑 장비", customer: "개인·가족·여행자", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)", status: "dev" },
        { n: "05", c: "c2", icon: "fashion", en: "Fashion & Events", title: "패션·행사용품 대여", targets: "의류·가방·액세서리·행사 소품", customer: "개인·행사 기획자·촬영팀", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)", status: "prep", consider: "진위·위생·세탁·훼손 책임" },
        { n: "08", c: "c2", icon: "sports", en: "Sports & Leisure", title: "스포츠·레저용품 대여", targets: "자전거 장비·스키·보드·운동용품", customer: "개인·동호회·레저 업체", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)", status: "prep", consider: "안전 상태·보호장비" },
        { n: "06", c: "c3", icon: "space", en: "Space Rental", title: "공간 대여", targets: "회의실·스튜디오·작업실·파티룸", customer: "공간 운영자·개인·기업", revenue: "완료된 공간 대여의 플랫폼 수수료(요율 미정)", status: "dev", consider: "소방·안전·영업 규정, 운영자 권한. 첫 출시의 중심 영역" },
        { n: "07", c: "c3", icon: "mobility", en: "Vehicle & Mobility", title: "차량·이동수단 대여", targets: "자동차·자전거·이동 장비", customer: "적격 이동수단 사업자·개인", revenue: "대여 거래 수수료·사업자 계약", status: "long", consider: "적격 사업자 연계만, 개인 간 무허가 차량 유상 대여 불가" },
        { n: "09", c: "c4", icon: "pro", en: "Industrial & Professional", title: "산업·전문 장비 대여", targets: "산업장비·측정장비·업무용 장비", customer: "기업·적격 사업자", revenue: "대여 거래 수수료·기업 계약", status: "long", consider: "사용 자격·안전교육·보험·운송" },
        { n: "10", c: "c4", icon: "office", en: "Office & Business", title: "사무·비즈니스 장비 대여", targets: "사무기기·행사 장비·기업용 설비", customer: "기업·기관", revenue: "기업 계약·반복 거래", status: "long" },
        { n: "11", c: "c5", icon: "local", en: "Local Sharing", title: "지역 기반 공유", targets: "근거리 물품 대여·지역 자원 활용", customer: "지역 주민·지역 대여 사업자", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)", status: "dev" },
        { n: "12", c: "c5", icon: "corporate", en: "Corporate Asset Sharing", title: "기업 자산 공유", targets: "기업 간 유휴 장비·공간", customer: "기업·개인 사업자", revenue: "기업 계약·거래 수수료", status: "long" },
        { n: "13", c: "c6", icon: "saas", en: "SHAREON Business SaaS", title: "기업 운영 SaaS", targets: "대여·예약·재고·고객·정산 운영", customer: "대여업체·공간 운영자·기업", revenue: "월·연 구독(가격 미정)", status: "long", consider: "외주 개발이 아닌 자체 표준 솔루션. 기본 등록·거래에는 구독이 필요하지 않음" },
        { n: "14", c: "c6", icon: "global", en: "Public & Global Sharing", title: "공공·글로벌 공유", targets: "공공 자원 공유·해외 확장·라이선스", customer: "지자체·공공기관·해외 파트너", revenue: "기관 계약·라이선스", status: "long" },
      ],
    },
    revenue: {
      kicker: "REVENUE MODEL",
      title: "여섯 개의 수익 축.",
      lead: "수수료율과 가격은 확정되지 않았습니다. 기본 등록과 거래는 구독 없이도 이용할 수 있는 구조를 원칙으로 합니다.",
      head: { n: "", name: "수익원", target: "대상", model: "수익 방식" },
      rows: [
        { n: "01", name: "거래 수수료", target: "개인·기업", model: "완료된 대여·공간·서비스 거래에 대한 플랫폼 수수료. 요율은 확정되지 않았습니다." },
        { n: "02", name: "기업 SaaS", target: "대여업체·기업", model: "운영 도구의 월·연 구독. 장기 사업 방향이며 출시된 제품은 없습니다." },
        { n: "03", name: "프리미엄 판매자", target: "개인·기업", model: "선택형 고급 등록·관리 기능. 기본 등록과 거래는 구독 없이 이용합니다." },
        { n: "04", name: "광고·프로모션", target: "대여업체·브랜드", model: "유료 노출·광고. 항상 광고로 표시하며, 계약하지 않은 업체를 파트너로 노출하지 않습니다." },
        { n: "05", name: "기업 계약", target: "기업", model: "대량·장기 대여와 자산 공유 솔루션 계약을 검토합니다." },
        { n: "06", name: "공공·글로벌", target: "기관·해외 파트너", model: "공공 공유 사업 계약과 해외 라이선스를 장기 방향으로 검토합니다." },
      ],
      note: "보증금은 플랫폼 매출이 아니며 수익과 구분해 관리합니다. SHAREON은 자체 에스크로를 만들지 않고, 결제대행사의 보증금 방식이 확정된 뒤에만 결제·보증금을 운영합니다.",
    },
    calc: {
      kicker: "REVENUE EXAMPLE",
      title: "가상 거래 수익 계산기.",
      badge: "가상 계산 · 실제 확정 수수료 아님",
      lead: "값을 바꿔 보며 구조를 이해하기 위한 예시입니다. SHAREON의 수수료율은 확정되지 않아 비워 두었으며, 직접 가정한 값을 넣으면 계산됩니다.",
      fields: { count: "월 거래 건수", countUnit: "건", avg: "평균 거래금액", avgUnit: "원", rate: "플랫폼 수수료율(직접 입력)", rateUnit: "%" },
      defaults: { count: 1000, avg: 30000, rate: "" },
      out: { gmv: "월 총거래액 (GMV)", fee: "월 플랫폼 수수료 매출" },
      currency: "원",
      note: "결제 수수료, 환불, 보증금, 부가세, 분쟁 비용, 고객 확보 비용, 운영비를 빼기 전의 단순 계산입니다. 거래가 늘면 수수료 매출이 늘 수 있지만, 분실·파손과 분쟁 처리 비용도 함께 늘 수 있습니다.",
    },
    saas: {
      kicker: "SHAREON BUSINESS SAAS",
      title: "대여 사업의 운영을\n더 단순하게.",
      lead: "대여업체·기업을 위한 자체 표준 SaaS 구상입니다. 고객별 외주 개발이 아니며, 현재 출시된 제품은 없습니다.",
      items: [
        { name: "SHAREON Booking", body: "대여 예약·일정 관리. 승인형 예약 요청과 일정 충돌 확인을 다루는 구상입니다." },
        { name: "SHAREON Inventory", body: "재고·자산 관리. 보유 장비의 대여 가능 여부와 상태를 한곳에서 봅니다." },
        { name: "SHAREON CRM", body: "고객·거래 관리. 반복 고객과 기업 고객의 이력을 정리합니다." },
        { name: "SHAREON Rental", body: "대여·반납·상태 기록. 인수·반납 사진과 구성품 확인을 남깁니다." },
        { name: "SHAREON Finance", body: "거래·정산 현황. 보증금은 매출과 구분해 보여 주는 구조입니다." },
        { name: "SHAREON Automation", body: "알림·반복 업무 자동화. 반납 안내와 연체 알림 같은 일을 줄입니다." },
      ],
      status: "long",
      cta: "도입 문의하기",
    },
    roadmap: {
      kicker: "EXECUTION ROADMAP",
      title: "카테고리보다,\n거래가 먼저입니다.",
      lead: "카테고리 수를 빠르게 늘리기보다, 특정 지역·카테고리에서 충분한 대여 물품과 이용자를 먼저 확보합니다.",
      steps: [
        { n: "01", title: "핵심 마켓플레이스", tag: "최우선", body: "개인·기업 등록, 물품 검색, 대여 요청, 채팅, 마이페이지, 기본 거래 흐름 안정화. 첫 출시는 대여·공간·서비스 중심, 승인형 예약부터 준비합니다." },
        { n: "02", title: "안전한 대여 거래", body: "결제·보증금·반납·상태 확인·후기·분쟁 정책 검증. 결제·보증금은 결제대행사의 보증금 방식이 확정된 뒤에만 운영합니다." },
        { n: "03", title: "핵심 카테고리 확대", body: "생활용품·전자기기·카메라·캠핑·공간 등 수요가 높은 카테고리부터 확대. 지역과 카테고리를 좁혀 공급과 이용자를 먼저 확보합니다." },
        { n: "04", title: "기업 입점·B2B 거래", body: "전문 대여업체 입점, 기업 자산 공유, 대량·장기 대여 같은 기업 거래 기능을 준비합니다." },
        { n: "05", title: "기업 SaaS·공공·글로벌", body: "대여업체 운영 솔루션, 공공 공유 사업, 해외 현지화·라이선스. 장기 사업 방향입니다." },
      ],
      now: "현재 위치: 1단계를 앱에서 시범 개발 중입니다.",
    },
    excluded: {
      kicker: "FOCUS",
      title: "공유·대여에 집중합니다.",
      lead: "처음 검토한 20개 영역 가운데 공유·대여와 거리가 먼 6개 영역은 SHAREON의 핵심 사업에서 덜어 냈습니다. 기존 앱 기능을 지우는 결정이 아니라, 사업의 중심을 공유·대여로 정한 것입니다.",
      points: [
        { n: "01", title: "공유·대여 오픈 마켓플레이스", body: "개인과 기업이 직접 참여해 물건·장비·공간을 빌려주고 빌리는 공유·대여 전문 마켓플레이스." },
        { n: "02", title: "기업용 대여 운영 SaaS", body: "대여업체와 기업이 예약·재고·고객·정산을 관리하는 자체 표준 솔루션." },
        { n: "03", title: "작게 시작해 깊게", body: "양면 마켓플레이스이므로 특정 지역과 카테고리에서 공급과 이용자를 먼저 확보한 뒤 넓혀 갑니다." },
      ],
    },
    next: {
      kicker: "NEXT STEP",
      title: "SHAREON과 함께\n공유의 새로운 기회를 만들어 보세요.",
      ctas: ["파트너십 알아보기", "사업 문의하기"],
    },
  },

  /* ─────────────── 04 Partnerships ─────────────── */
  partnerships: {
    seoTitle: "SHAREON 파트너십 | 대여업체·기업·공공기관·기술 파트너 — Newon",
    seoDescription:
      "대여업체, 공간 운영자, 이동수단·전문 장비 사업자, 결제·보험·물류 파트너, 공공기관과 글로벌 파트너까지. SHAREON의 14개 파트너 유형과 협력 절차입니다.",
    hero: {
      kicker: "SHAREON / PARTNERSHIPS",
      title: "공유의 가치를 함께\n넓혀 갈 파트너를 찾습니다.",
      lead: "대여업체부터 기업, 공공기관, 기술 파트너까지. SHAREON은 더 많은 자원이 필요한 사람에게 닿도록 협력의 범위를 넓혀 갑니다.",
      ctaMain: "파트너십 문의하기",
      ctaSub: "비즈니스 살펴보기",
    },
    open: {
      kicker: "OPEN MARKETPLACE",
      title: "제휴 계약 없이도,\n직접 등록하고 거래합니다.",
      lead: "개별 제휴 계약이 있어야만 입점할 수 있는 폐쇄형 구조가 아니라, 적격 개인·기업이 플랫폼에 직접 등록하고 거래하는 오픈 마켓플레이스를 기본으로 합니다. 아래 유형은 별도 협력이 의미 있는 경우입니다.",
      points: [
        { n: "01", body: "개인·기업 모두 별도 제휴 계약 없이 직접 가입해 물건·공간·이동수단·서비스를 등록합니다." },
        { n: "02", body: "품목별 자격·안전 기준을 확인합니다. 차량·전문 장비처럼 법적 요건이 있는 품목은 적격 사업자만 다룹니다." },
        { n: "03", body: "결제·보험·물류 등 거래 인프라는 별도 협력 분야입니다. 결제·보증금은 결제대행사의 보증금 방식이 확정된 뒤에만 운영합니다." },
        { n: "04", body: "기본 등록과 거래는 구독이나 제휴 없이 이용하는 구조를 원칙으로 합니다." },
        { n: "05", body: "광고·유료 노출은 항상 광고로 표시하며, 계약하지 않은 업체를 파트너로 노출하지 않습니다." },
      ],
    },
    notice: "현재 SHAREON과 계약을 맺은 파트너사는 없습니다. 아래는 협력을 제안받고자 하는 유형이며, 특정 업체를 나타내지 않습니다.",
    types: {
      kicker: "14 PARTNER TYPES",
      title: "함께할 수 있는\n열네 가지 방법.",
      labels: { collab: "협력 내용", value: "SHAREON이 제공하려는 가치", terms: "확인 조건", status: "진행 상태" },
      items: [
        { n: "01", icon: "everyday", title: "생활용품 대여업체", collab: "생활 장비 대여", value: "새로운 고객 접점과 대여 관리", terms: "구성품·사용 안내 기준", status: "dev" },
        { n: "02", icon: "electronics", title: "전자기기 대여업체", collab: "IT 기기 대여", value: "단기 이용 수요 연결", terms: "기기 초기화·상태 검수 절차", status: "prep" },
        { n: "03", icon: "camera", title: "촬영장비 대여업체", collab: "카메라·영상 장비", value: "크리에이터·제작사 수요 연결", terms: "장비 상태 고지·파손 기준", status: "dev" },
        { n: "04", icon: "camping", title: "캠핑·여행 장비 업체", collab: "여행 장비 대여", value: "계절 장비의 활용도 향상", terms: "세척·위생 상태 기준", status: "dev" },
        { n: "05", icon: "fashion", title: "의류·행사용품 업체", collab: "패션·행사 대여", value: "행사·촬영 수요 연결", terms: "진위·위생·세탁 책임", status: "prep" },
        { n: "06", icon: "space", title: "공간 운영자", collab: "스튜디오·회의실", value: "비어 있는 시간의 활용", terms: "공간 사용 권한·안전 규정", status: "dev" },
        { n: "07", icon: "mobility", title: "적격 이동수단 사업자", collab: "차량·이동수단", value: "적법한 이동수단 대여 연계", terms: "관련 법령상 사업 자격", status: "long" },
        { n: "08", icon: "sports", title: "스포츠·레저 업체", collab: "스포츠 장비", value: "시즌·지역 수요 연결", terms: "안전 상태·보호장비 기준", status: "prep" },
        { n: "09", icon: "pro", title: "산업·전문 장비 업체", collab: "산업 장비", value: "기업 고객의 단기 수요 연결", terms: "사용 자격·안전교육·보험", status: "long" },
        { n: "10", icon: "office", title: "사무·기업 장비 업체", collab: "업무용 장비", value: "기업 반복 거래·장기 계약", terms: "기업 계약 조건", status: "long" },
        { n: "11", icon: "corporate", title: "기업 자산 담당자", collab: "유휴 자산 활용", value: "유휴 자산의 수익화와 비용 절감", terms: "내부 승인·자산 관리 기준", status: "long" },
        { n: "12", icon: "payment", title: "결제·보험·물류 파트너", collab: "거래 인프라", value: "공유·대여에 맞는 거래 인프라 수요", terms: "관련 법령·계약 기준 충족", status: "prep" },
        { n: "13", icon: "public", title: "지자체·공공기관", collab: "공공 공유 사업", value: "공공 자원의 활용도 향상", terms: "기관별 조달·계약 절차", status: "long" },
        { n: "14", icon: "global", title: "글로벌·기술 파트너", collab: "해외·SaaS", value: "검증된 공유·대여 운영 모델", terms: "현지 법령·라이선스 조건", status: "long" },
      ],
    },
    process: {
      kicker: "PROCESS",
      title: "협력 절차.",
      lead: "제안을 받은 뒤 사업·법률·운영 조건을 검토하고, 협의와 계약을 거쳐 운영을 시작합니다. 검토 결과와 일정은 제안 내용에 따라 달라집니다.",
      steps: [
        { n: "01", title: "제안", body: "협력 내용과 보유 자원, 원하는 역할을 문의 양식으로 알려 주세요." },
        { n: "02", title: "검토", body: "사업·법률·운영 조건과 품목별 자격을 확인합니다." },
        { n: "03", title: "협의", body: "역할과 책임, 운영 조건을 함께 정합니다." },
        { n: "04", title: "계약", body: "필요한 경우 계약을 맺습니다. 계약 전에는 파트너로 표시하지 않습니다." },
        { n: "05", title: "운영", body: "작은 지역·카테고리부터 단계적으로 운영을 시작합니다." },
      ],
    },
    next: {
      kicker: "PARTNERSHIP",
      title: "공유의 새로운 가능성을\n함께 만들어 갑니다.",
      ctas: ["파트너십 문의하기", "SHAREON 소개 보기"],
    },
  },

  /* ─────────────── 05 Contact ─────────────── */
  contact: {
    seoTitle: "SHAREON 문의 | 앱·거래·기업·제휴 문의 — Newon",
    seoDescription:
      "SHAREON 앱 이용, 개인·기업 대여와 등록, 공간·전문 장비, 결제·보증금, 반납·분쟁, 기업 SaaS, 공공기관·기술·글로벌 협력 문의를 NEWON 공식 문의 경로로 받습니다.",
    hero: {
      kicker: "SHAREON / CONTACT",
      title: "SHAREON과 함께할\n새로운 공유를 이야기해 주세요.",
      lead: "앱 이용부터 개인·기업 대여, 공간과 전문 장비, 기업 SaaS와 기관 협력까지. SHAREON에 관한 문의를 NEWON 공식 경로로 받습니다.",
      ctaMain: "문의 양식 열기",
      ctaSub: "이메일 보내기",
    },
    kicker: "INQUIRY TYPES",
    title: "문의 유형을\n선택해 주세요.",
    lead: "각 유형은 NEWON 공식 문의 양식이나 공식 이메일로 연결됩니다. 회원가입은 필요하지 않습니다.",
    formCta: "문의 양식",
    mailCta: "이메일",
    mailSubjectPrefix: "[SHAREON]",
    items: [
      { n: "01", icon: "app", title: "앱 이용", body: "시범 앱 이용과 기술 관련 질문. 앱은 아직 앱스토어에 출시되지 않았습니다.", slug: "app" },
      { n: "02", icon: "everyday", title: "개인 대여·등록", body: "개인으로 물건을 빌려주거나 빌리는 방법. 기본 등록은 구독 없이 이용하는 구조를 원칙으로 합니다.", slug: "personal" },
      { n: "03", icon: "corporate", title: "기업 대여·입점", body: "대여업체·기업의 등록과 거래. 별도 제휴 계약 없이 직접 가입해 등록하는 구조입니다.", slug: "business" },
      { n: "04", icon: "space", title: "공간 대여", body: "공간 운영자 참여와 공간 대여, 공간과 함께 제공하는 서비스 등록. 첫 출시의 중심 영역입니다.", slug: "space" },
      { n: "05", icon: "pro", title: "전문 장비", body: "산업·촬영·사무 등 전문 장비 대여. 사용 자격·안전교육·보험 조건을 함께 검토합니다.", slug: "pro-equipment" },
      { n: "06", icon: "payment", title: "결제·보증금", body: "결제·보증금 구조에 관한 의견과 제휴. 결제·보증금은 아직 운영되지 않습니다.", slug: "payments" },
      { n: "07", icon: "return", title: "반납·분쟁", body: "반납·상태 검수·분쟁 기준에 관한 의견. 기준은 법률 검토 후 약관과 함께 확정합니다.", slug: "returns" },
      { n: "08", icon: "saas", title: "기업 SaaS", body: "SHAREON Business SaaS 도입 검토. 장기 사업 방향이며 출시된 제품은 없습니다.", slug: "saas" },
      { n: "09", icon: "public", title: "공공기관", body: "지자체·공공기관의 공유 사업 협력. 기관별 조달·계약 절차에 따라 검토합니다.", slug: "public" },
      { n: "10", icon: "global", title: "기술·글로벌 협력", body: "기술 협력·해외 진출·라이선스. 현지 법령과 라이선스 조건을 함께 확인합니다.", slug: "global" },
    ],
    guide: {
      kicker: "BEFORE YOU WRITE",
      title: "문의 전에\n확인해 주세요.",
      items: [
        "회신에 필요한 최소한의 정보(이름·이메일·문의 내용)만 적어 주세요.",
        "카드 번호, 계좌 비밀번호, 신분증 번호 같은 민감한 결제·개인정보는 절대 적지 마세요.",
        "SHAREON 문의는 NEWON 공식 문의 양식과 공식 이메일(newon@newon.app)로만 받습니다.",
        "앱은 시범 개발 단계라 실제 대여·예약·결제·환불에 대한 고객 지원은 제공하지 않습니다.",
        "수수료율·이용 요금·출시 일정은 아직 확정되지 않아, 문의하셔도 구체적인 수치나 날짜는 안내해 드릴 수 없습니다.",
        "답변 시점은 문의 내용에 따라 다르며, 회신 기한을 보장하지 않습니다.",
      ],
      privacy: "개인정보 처리방침",
    },
  },
};

const EN = {
  lang: "en",
  brand: "SHAREON",
  positioning: "All-in-One Sharing & Rental Marketplace",
  status: { dev: "In development in the app", prep: "In preparation", long: "Long-term direction" },
  statusLabel: "Status",
  statusNote:
    "The SHAREON app is in pilot development. Real rentals, booking confirmation, payment, deposits and settlement are not operating yet; this page introduces the business direction and where it stands.",
  subnavAria: "SHAREON menu",
  subnav: [
    { id: "overview", n: "01", en: "Overview", label: "Overview" },
    { id: "platform", n: "02", en: "Platform", label: "Platform" },
    { id: "business", n: "03", en: "Business", label: "Business" },
    { id: "partnerships", n: "04", en: "Partnerships", label: "Partnerships" },
    { id: "contact", n: "05", en: "Contact", label: "Contact" },
  ],
  crumb: "Back to SHAREON",
  inquiry: "Contact us",
  partnershipInquiry: "Partnership inquiry",
  businessInquiry: "Business inquiry",
  considerLabel: "To check",
  targetsLabel: "What is rented",
  customerLabel: "Key customers",
  revenueLabel: "Revenue",
  stats: [
    { n: "14", label: "Core businesses" },
    { n: "6", label: "Revenue streams" },
    { n: "5", label: "Website menus" },
  ],
  statsNote: "These numbers describe the business plan, not users or transactions.",
  matrix: { provider: "Lends", renter: "Borrows", person: "Person", business: "Business" },

  overview: {
    seoTitle: "SHAREON | Newon — Sharing & Rental Marketplace",
    seoDescription:
      "SHAREON aims to connect the things, equipment, spaces and mobility that people and businesses own with the people who need them. The app is in pilot development; real rentals and payments are not operating yet.",
    hero: {
      kicker: "SHAREON / OVERVIEW",
      title: "No need to own it.\nJust when you need it.",
      lead: "SHAREON aims to be an open sharing and rental marketplace where people and businesses sign up directly to list things, spaces, mobility and services, and connect with the people who need them.",
      ctaMain: "Explore the platform",
      ctaSub: "Business & partnership inquiry",
    },
    vision: {
      kicker: "OUR VISION",
      title: "For the moments when\nusing matters more than owning.",
      lead: "Many things and spaces keep their value even while they sit unused. SHAREON is building a place to borrow what you need when you need it, and to share what you are not using.",
      points: [
        { n: "01", body: "Borrow things you rarely use but would hesitate to buy, for just as long as you need them. Camping and production gear, used only now and then, are typical examples." },
        { n: "02", body: "People and businesses sign up directly, without a separate partnership contract, and can be both providers and renters." },
        { n: "03", body: "Designing a flow in which every rental, from listing to return, ends safely. The first launch centres on rental, spaces and services, and is being prepared with approval-based booking, where the provider reviews and accepts each request." },
        { n: "04", body: "Basic listing and renting are meant to work without a subscription. NEWON is to earn a platform fee on completed transactions; the rate is not decided." },
      ],
    },
    share: {
      kicker: "WHAT WE SHARE",
      title: "From things to spaces and mobility.",
      lead: "The four kinds of resources SHAREON is considering for sharing and rental. Services offered together with spaces and equipment are also being considered for listing.",
      items: [
        { icon: "everyday", en: "Things", title: "Things", body: "Household goods, electronics, travel, camping, fashion and event items — things you need only now and then, borrowed for as long as you need them.", chips: ["Household goods", "Electronics", "Camping gear", "Event items"] },
        { icon: "camera", en: "Equipment", title: "Equipment", body: "From cameras and production gear to industrial and office equipment. Professional gear comes with condition disclosure, qualifications and safety rules.", chips: ["Production gear", "Sports gear", "Professional gear", "Office equipment"] },
        { icon: "space", en: "Spaces", title: "Spaces", body: "Meeting rooms, studios, practice rooms, workshops and exhibition spaces. A focus area for the first launch, including services offered with a space.", chips: ["Meeting rooms", "Studios", "Workshops", "Party rooms"] },
        { icon: "mobility", en: "Mobility", title: "Mobility", body: "Bicycles and mobility gear. Cars are strictly regulated, so only qualified operators are considered, as a long-term direction.", chips: ["Bicycles", "Mobility gear", "Licensed operators’ vehicles"] },
      ],
    },
    how: {
      kicker: "HOW IT WORKS",
      title: "From listing to return,\none rental flow.",
      lead: "The rental flow SHAREON is aiming for. Payment, deposits, settlement and disputes will be operated step by step, after payment-provider agreements and responsibility and refund rules are designed.",
      steps: [
        { n: "01", en: "List", title: "List", body: "People and businesses list items, spaces or services with photos and conditions." },
        { n: "02", en: "Discover", title: "Discover", body: "Search by area, category, dates and price. Exact addresses stay hidden before a rental." },
        { n: "03", en: "Request", title: "Request", body: "Check dates and conditions and send a request; the provider reviews and accepts it (approval-based)." },
        { n: "04", en: "Pay", title: "Pay & deposit", body: "Through a qualified payment provider, and not operated until its deposit method is confirmed." },
        { n: "05", en: "Pick up", title: "Pick up", body: "Recording condition, parts and handover time with photos is being prepared." },
        { n: "06", en: "Use", title: "Use", body: "The rental period, extension requests and questions are managed in the app." },
        { n: "07", en: "Return", title: "Return", body: "Inspect the condition against the pickup record and resolve issues by set procedures." },
        { n: "08", en: "Settle", title: "Settle & review", body: "Deposit handling, settlement and mutual reviews close the rental." },
      ],
    },
    connect: {
      kicker: "WHO WE CONNECT",
      title: "People and businesses —\nanyone can lend and borrow.",
      lead: "SHAREON’s key feature is that people and businesses can both be providers and renters. The six axes below describe the business structure and how it earns; they do not mean everything is built.",
      items: [
        { n: "01", en: "C2C", title: "Person to person", body: "People lend their things or equipment to other people, mostly nearby between neighbours." },
        { n: "02", en: "B2C", title: "Business to person", body: "Businesses rent equipment, spaces and items to people. Rental companies and space operators list directly." },
        { n: "03", en: "C2B", title: "Person to business", body: "Businesses rent equipment or items owned by people, for short needs such as shoots or events." },
        { n: "04", en: "B2B", title: "Business to business", body: "Companies rent equipment, spaces and resources to each other, making better use of idle assets." },
        { n: "05", en: "Marketplace", title: "One marketplace", body: "Listing, search, booking, payment, deposits, settlement and reviews joined in one flow." },
        { n: "06", en: "SaaS", title: "Operating software", body: "Inventory, booking, rental, returns, customers and operations — a long-term direction for rental businesses." },
      ],
    },
    trust: {
      kicker: "TRUST & SAFETY",
      title: "When things change hands,\ntrust comes first.",
      lead: "A rental only ends when the item comes back. SHAREON designs responsibilities and procedures before screens.",
      items: [
        { n: "01", title: "Condition checks", body: "Condition and parts are recorded at pickup and return, as the reference for the return inspection." },
        { n: "02", title: "Deposit principle", body: "Deposits are kept apart from revenue. SHAREON will not build its own escrow; deposits operate only after a payment provider’s deposit method is confirmed and legal review is done." },
        { n: "03", title: "User and business checks", body: "Identity, business registration and item-specific qualifications, with separate rules for items such as vehicles and professional equipment." },
        { n: "04", title: "Dispute handling", body: "Rules and procedures for damage, loss and late returns, fixed with the terms of use after legal review." },
        { n: "05", title: "Privacy", body: "Exact addresses are not shown before a rental; location data is removed from photos when they are added." },
      ],
      note: "Deposit holding and compensation are not offered today, and no protection or compensation is promised.",
    },
    eco: {
      kicker: "BUSINESS ECOSYSTEM",
      title: "Down to the operating base\nfor rental businesses.",
      lead: "Alongside the marketplace, SHAREON is preparing — as a long-term direction — its own SaaS for rental businesses to manage inventory, bookings, customers and settlement. A standard product, not custom builds.",
      items: [
        { n: "01", title: "Rental businesses join", body: "Professional rental companies list and trade directly, without a separate partnership contract." },
        { n: "02", title: "Corporate asset sharing", body: "Companies share unused equipment and spaces with other companies, making better use of idle assets." },
        { n: "03", title: "SHAREON Business SaaS", body: "Booking, inventory, CRM, finance and automation tools. No product has been released." },
      ],
      cta: "See the business in detail",
    },
    newon: {
      kicker: "NEWON ECOSYSTEM",
      title: "SHAREON’s place\nwithin NEWON.",
      lead: "SHAREON handles renting things; commerce in other NEWON services handles buying products in their field. There is no connection or data sharing between the services today.",
      items: [
        { name: "SHAREON", body: "Sharing and renting things, equipment and spaces", self: true },
        { name: "MY WORLD", body: "Travel records, planning, booking and shopping" },
        { name: "PETLOG", body: "Pet life, health, products and services" },
        { name: "BABYLOG", body: "Pregnancy, birth, parenting and child growth" },
        { name: "LIVON", body: "Life-stage information, programmes and guidance" },
        { name: "ONGIL", body: "Senior life, care and welfare" },
      ],
    },
    next: {
      kicker: "NEXT STEP",
      title: "When you need it,\ndiscover what SHAREON can do.",
      lead: "SHAREON aims to grow into an open sharing and rental marketplace that people and businesses join directly, together with operating SaaS for rental businesses.",
      ctas: ["Explore the platform", "See partnerships", "Contact us"],
    },
  },

  platform: {
    seoTitle: "SHAREON Platform | Renting things, equipment, spaces and mobility — Newon",
    seoDescription:
      "Household goods, electronics, production gear, camping, fashion and events, spaces, mobility, sports, professional and office equipment, local and corporate sharing, and the rental system. SHAREON’s 18 service areas.",
    hero: {
      kicker: "SHAREON / PLATFORM",
      title: "From things to spaces,\nconnected when you need them.",
      lead: "From everyday things to professional equipment and spaces. The eighteen service areas SHAREON is preparing, and the rental system that lets each rental end safely.",
      ctaMain: "See the business",
      ctaSub: "Contact us",
    },
    indexTitle: "All 18 services at a glance",
    groups: [
      { id: "a", kicker: "A · THINGS", title: "Everyday and personal items", lead: "Things you rarely use but would hesitate to buy." },
      { id: "b", kicker: "B · SPACE, MOBILITY & PRO", title: "Spaces, mobility and professional gear", lead: "Areas that also need rules, qualifications and safety checks." },
      { id: "c", kicker: "C · SHARED RESOURCES", title: "Shared resources", lead: "Connecting idle resources nearby and inside companies." },
      { id: "d", kicker: "D · RENTAL SYSTEM", title: "The rental system", lead: "SHAREON aims to be a platform where rentals complete safely, not a list of products. Payment, deposit, return and dispute features are described as they actually stand." },
      { id: "e", kicker: "E · ACCESS", title: "App and accessibility", lead: "" },
    ],
    services: [
      { n: "01", g: "a", icon: "everyday", en: "Everyday Rental", title: "Everyday rental", body: "Borrow household equipment you would hesitate to buy, just for the days you need it — for occasional jobs such as moving, deep cleaning or home repairs.", chips: ["Cleaning gear", "Tools", "Pressure washers", "Ladders", "Appliances", "Moving tools"], consider: "Basic usage notes and a parts check are needed.", status: "dev" },
      { n: "02", g: "a", icon: "electronics", en: "Electronics", title: "Electronics rental", body: "Use costly devices — laptops, tablets, projectors, monitors, consoles — for a short time, such as a business trip, an event or a trial.", chips: ["Laptops", "Tablets", "Projectors", "Monitors", "Consoles"], consider: "Because of damage, loss and data-leak risks, device reset, condition checks and handover steps are needed.", status: "prep" },
      { n: "03", g: "a", icon: "camera", en: "Camera & Production", title: "Camera and production gear", body: "Shooting equipment for individual creators, small studios and companies. Businesses renting gear owned by individuals (C2B) is also being considered.", chips: ["Cameras", "Lenses", "Lighting", "Tripods", "Microphones", "Video gear"], consider: "Equipment condition disclosure and agreed damage rules.", status: "dev" },
      { n: "04", g: "a", icon: "camping", en: "Travel & Camping", title: "Travel and camping gear", body: "Borrow gear for a trip or a camp. MY WORLD handles travel planning and booking; SHAREON focuses on gear rental.", chips: ["Suitcases", "Tents", "Camping chairs", "Tables", "Sleeping bags", "Travel accessories"], consider: "Seasonal demand, and cleaning and drying checks.", status: "dev" },
      { n: "05", g: "a", icon: "fashion", en: "Fashion & Events", title: "Fashion and event items", body: "Borrow outfits and props for an event or a shoot. The plan is to start with items for which hygiene and authenticity rules are in place.", chips: ["Event wear", "Costumes", "Bags", "Accessories", "Party props"], consider: "Authenticity of branded items, hygiene and cleaning, damage responsibility and whether an item may be rented.", status: "prep" },
      { n: "06", g: "b", icon: "space", en: "Space Rental", title: "Space rental", body: "Meeting rooms, studios, practice rooms, workshops, party rooms and exhibition spaces — by the hour, day or longer. A focus area for the first launch; listing services offered with a space is also being considered.", chips: ["Meeting rooms", "Photo studios", "Practice rooms", "Workshops", "Party rooms", "Exhibition spaces"], consider: "Permitted use, fire, safety and business rules, and the operator’s rights (including lease and sublease). Lodging and parking are not covered until lawful conditions are confirmed.", status: "dev" },
      { n: "07", g: "b", icon: "mobility", en: "Mobility", title: "Vehicles and mobility", body: "Considering rental of bicycles, e-mobility and other mobility resources.", chips: ["Bicycles", "E-mobility", "Mobility gear", "Licensed operators’ vehicles"], consider: "Paid car rental and some mobility are strictly regulated. At first only qualified operators are considered; unlicensed paid car rental between individuals is not allowed.", status: "long" },
      { n: "08", g: "b", icon: "sports", en: "Sports & Leisure", title: "Sports and leisure gear", body: "Skis, snowboards, golf, fitness and outdoor equipment — gear needed for a season, used without buying it.", chips: ["Skis", "Snowboards", "Golf gear", "Fitness gear", "Outdoor gear"], consider: "Safety condition, protective gear, terms of use and damage responsibility matter.", status: "prep" },
      { n: "09", g: "b", icon: "pro", en: "Professional Equipment", title: "Industrial and professional equipment", body: "Specialist equipment for construction, manufacturing, shooting, measurement, research and field work — for companies and qualified operators.", chips: ["Industrial equipment", "Measuring tools", "Research equipment", "Field equipment"], consider: "Operator qualifications, safety training, maintenance, insurance and transport.", status: "long" },
      { n: "10", g: "b", icon: "office", en: "Business Equipment", title: "Office and business equipment", body: "Printers, copiers, projectors, meeting and event equipment, office furniture and business IT. Repeat and long-term rental for companies is a long-term direction.", chips: ["Copiers", "Projectors", "Meeting gear", "Event gear", "Office furniture", "IT equipment"], consider: "Designed together with repeat business and long-term contract terms.", status: "long" },
      { n: "11", g: "c", icon: "local", en: "Local Sharing", title: "Local sharing", body: "Share unused items and gear with neighbours: list them yourself, find things nearby and hand them over safely.", chips: ["Nearby rental", "Neighbourhood resources", "Local rental businesses", "Safe handover"], consider: "Exact addresses are not shown before a rental; a safe handover method is provided.", status: "dev" },
      { n: "12", g: "c", icon: "corporate", en: "Corporate Sharing", title: "Corporate asset sharing", body: "Companies rent idle equipment and spaces to other companies or sole traders, putting unused assets to better use.", chips: ["Idle equipment", "Idle spaces", "Long-term B2B rental", "Better utilisation"], consider: "Internal approval and asset management rules.", status: "long" },
      { n: "13", g: "d", icon: "search", en: "Listings & Discovery", title: "Listing and discovery", body: "People and businesses list items, spaces and services; renters search by area, category, dates and price. Basic listing is meant to work without a subscription.", chips: ["Listing", "Photos", "Categories", "Area search", "Date and price filters"], consider: "Location data is removed from photos when they are added.", status: "dev" },
      { n: "14", g: "d", icon: "calendar", en: "Booking & Rental", title: "Booking and rental", body: "Check availability and conditions, then send an approval-based booking request. The first launch is being prepared with approval-based booking, where the provider reviews and accepts each request; instant booking will be considered later.", chips: ["Available dates", "Booking requests", "Approval-based booking", "Extensions", "Schedules"], consider: "Booking-request screens are being built; booking confirmation is not operating yet.", status: "dev" },
      { n: "15", g: "d", icon: "payment", en: "Payments & Deposits", title: "Payments and deposits", body: "Preparing to handle rental payments and deposits through a qualified payment provider. SHAREON will not build its own escrow to hold funds, and payments and deposits will not operate until the provider’s deposit method is confirmed.", chips: ["Rental payment", "Deposits", "Refund rules", "Settlement"], consider: "Operated only after the payment-provider agreement, party responsibilities, refund rules and damages are designed together. Deposits are kept apart from platform revenue.", status: "prep" },
      { n: "16", g: "d", icon: "return", en: "Returns & Disputes", title: "Returns and disputes", body: "Inspect the condition at return, and handle damage, loss and late returns by set procedures, using the photos and parts recorded at pickup as the reference.", chips: ["Condition inspection", "Parts check", "Damage and loss rules", "Late returns", "Disputes"], consider: "Rules will be fixed with the terms of use after legal review.", status: "prep" },
      { n: "17", g: "d", icon: "trust", en: "Trust & Reviews", title: "Trust and reviews", body: "Reviews after a rental, plus reporting and blocking, for a trustworthy place to rent. Ads and paid placement are always labelled as ads.", chips: ["User checks", "Business checks", "Reviews", "Reporting and blocking"], consider: "Reporting is being built in the app; reviews start once real rentals do.", status: "dev" },
      { n: "18", g: "e", icon: "app", en: "App & Accessibility", title: "App and accessibility", body: "SHAREON is being prepared as an iOS and Android app. Real rentals and booking will be in the app only; the website only introduces the business.", chips: ["iOS", "Android", "Dark mode", "Large text", "Screen readers"], consider: "Not in the app stores yet, so there is no download link.", status: "dev" },
    ],
  },

  business: {
    seoTitle: "SHAREON Business | 14 businesses, revenue model, business SaaS — Newon",
    seoDescription:
      "SHAREON’s 14 sharing and rental businesses, six revenue streams, business SaaS and execution stages. Fees and prices are not decided; the calculation is a hypothetical example.",
    hero: {
      kicker: "SHAREON / BUSINESS",
      title: "A sharing and rental marketplace,\nplus operating SaaS for businesses.",
      lead: "SHAREON is a two-sided marketplace whose revenue depends on completed and repeated rentals. From the 20 areas first considered, the six furthest from sharing and rental were set aside, leaving 14 core businesses.",
      ctaMain: "See partnerships",
      ctaSub: "Business inquiry",
    },
    structure: {
      kicker: "BUSINESS STRUCTURE",
      title: "Everyone a provider,\neveryone a renter.",
      lead: "The six axes describe the business structure and how it earns; they do not mean everything is built.",
    },
    core: {
      kicker: "14 CORE BUSINESSES",
      title: "14 core businesses,\nsix categories.",
      lead: "Choose a category to see what is rented, who the customers are and how each business earns.",
      tabsAria: "Business categories",
      cats: [
        { id: "c1", n: "01", en: "Everyday & Electronics", title: "Everyday & Electronics" },
        { id: "c2", n: "02", en: "Travel, Fashion & Leisure", title: "Travel, Fashion & Leisure" },
        { id: "c3", n: "03", en: "Space & Mobility", title: "Space & Mobility" },
        { id: "c4", n: "04", en: "Professional & Business", title: "Professional & Business" },
        { id: "c5", n: "05", en: "Local & Corporate Sharing", title: "Local & Corporate Sharing" },
        { id: "c6", n: "06", en: "SaaS, Public & Global", title: "SaaS, Public & Global" },
      ],
      items: [
        { n: "01", c: "c1", icon: "everyday", en: "Everyday Rental", title: "Everyday rental", targets: "Cleaners, tools, appliances, moving and repair equipment", customer: "Individuals, households, small businesses, local rental companies", revenue: "Platform fee on completed rentals (rate not decided)", status: "dev" },
        { n: "02", c: "c1", icon: "electronics", en: "Electronics Rental", title: "Electronics rental", targets: "Laptops, tablets, projectors, monitors", customer: "Individuals, businesses", revenue: "Platform fee on completed rentals (rate not decided)", status: "prep", consider: "Device reset, deposit, condition check, handover" },
        { n: "03", c: "c2", icon: "camera", en: "Camera & Production", title: "Camera and production gear", targets: "Cameras, lenses, lighting, microphones", customer: "Creators, small studios, companies", revenue: "Platform fee on completed rentals (rate not decided)", status: "dev" },
        { n: "04", c: "c2", icon: "camping", en: "Travel & Camping", title: "Travel and camping gear", targets: "Suitcases, tents, camping gear", customer: "Individuals, families, travellers", revenue: "Platform fee on completed rentals (rate not decided)", status: "dev" },
        { n: "05", c: "c2", icon: "fashion", en: "Fashion & Events", title: "Fashion and event items", targets: "Clothing, bags, accessories, event props", customer: "Individuals, event planners, shoot teams", revenue: "Platform fee on completed rentals (rate not decided)", status: "prep", consider: "Authenticity, hygiene, cleaning, damage responsibility" },
        { n: "08", c: "c2", icon: "sports", en: "Sports & Leisure", title: "Sports and leisure gear", targets: "Bike gear, skis, boards, fitness gear", customer: "Individuals, clubs, leisure businesses", revenue: "Platform fee on completed rentals (rate not decided)", status: "prep", consider: "Safety condition, protective gear" },
        { n: "06", c: "c3", icon: "space", en: "Space Rental", title: "Space rental", targets: "Meeting rooms, studios, workshops, party rooms", customer: "Space operators, individuals, businesses", revenue: "Platform fee on completed space rentals (rate not decided)", status: "dev", consider: "Fire, safety and business rules; operator rights. A focus area for the first launch" },
        { n: "07", c: "c3", icon: "mobility", en: "Vehicle & Mobility", title: "Vehicles and mobility", targets: "Cars, bicycles, mobility gear", customer: "Licensed mobility operators, individuals", revenue: "Rental fee, operator contracts", status: "long", consider: "Qualified operators only; no unlicensed paid car rental between individuals" },
        { n: "09", c: "c4", icon: "pro", en: "Industrial & Professional", title: "Industrial and professional equipment", targets: "Industrial, measuring and work equipment", customer: "Companies, qualified operators", revenue: "Rental fee, business contracts", status: "long", consider: "Qualifications, safety training, insurance, transport" },
        { n: "10", c: "c4", icon: "office", en: "Office & Business", title: "Office and business equipment", targets: "Office machines, event gear, business fixtures", customer: "Companies, institutions", revenue: "Business contracts, repeat business", status: "long" },
        { n: "11", c: "c5", icon: "local", en: "Local Sharing", title: "Local sharing", targets: "Nearby rentals, local resources", customer: "Local residents, local rental businesses", revenue: "Platform fee on completed rentals (rate not decided)", status: "dev" },
        { n: "12", c: "c5", icon: "corporate", en: "Corporate Asset Sharing", title: "Corporate asset sharing", targets: "Idle equipment and spaces between companies", customer: "Companies, sole traders", revenue: "Business contracts, transaction fee", status: "long" },
        { n: "13", c: "c6", icon: "saas", en: "SHAREON Business SaaS", title: "Business operating SaaS", targets: "Rental, booking, inventory, customer and settlement operations", customer: "Rental companies, space operators, businesses", revenue: "Monthly or annual subscription (price not decided)", status: "long", consider: "Its own standard product, not custom development. No subscription needed for basic listing and renting" },
        { n: "14", c: "c6", icon: "global", en: "Public & Global Sharing", title: "Public and global sharing", targets: "Public resource sharing, expansion abroad, licensing", customer: "Local governments, public bodies, partners abroad", revenue: "Institutional contracts, licences", status: "long" },
      ],
    },
    revenue: {
      kicker: "REVENUE MODEL",
      title: "Six revenue streams.",
      lead: "Fee rates and prices are not decided. Basic listing and renting are meant to work without a subscription.",
      head: { n: "", name: "Stream", target: "From", model: "How it earns" },
      rows: [
        { n: "01", name: "Transaction fee", target: "People, businesses", model: "A platform fee on completed rental, space and service transactions. The rate is not decided." },
        { n: "02", name: "Business SaaS", target: "Rental companies, businesses", model: "Monthly or annual subscription to operating tools. A long-term direction; no product is released." },
        { n: "03", name: "Premium sellers", target: "People, businesses", model: "Optional advanced listing and management tools. Basic listing and renting work without a subscription." },
        { n: "04", name: "Ads and promotion", target: "Rental companies, brands", model: "Paid placement and ads, always labelled as ads. Companies without a signed agreement are never shown as partners." },
        { n: "05", name: "Business contracts", target: "Companies", model: "Contracts for bulk and long-term rental and asset-sharing solutions, under consideration." },
        { n: "06", name: "Public and global", target: "Institutions, partners abroad", model: "Public sharing contracts and licensing abroad, as a long-term direction." },
      ],
      note: "Deposits are not platform revenue and are kept separate from it. SHAREON will not build its own escrow, and payments and deposits will operate only after a payment provider’s deposit method is confirmed.",
    },
    calc: {
      kicker: "REVENUE EXAMPLE",
      title: "A hypothetical revenue calculator.",
      badge: "Hypothetical · not a decided fee",
      lead: "An example for understanding the structure — change the values. SHAREON’s fee rate is not decided, so the rate is left blank; enter your own assumption to calculate.",
      fields: { count: "Rentals per month", countUnit: "", avg: "Average rental value", avgUnit: "KRW", rate: "Platform fee rate (your input)", rateUnit: "%" },
      defaults: { count: 1000, avg: 30000, rate: "" },
      out: { gmv: "Monthly gross value (GMV)", fee: "Monthly platform fee revenue" },
      currency: "KRW",
      note: "A simple calculation before payment fees, refunds, deposits, VAT, dispute costs, customer acquisition and operating costs. Fee revenue can grow with rentals, but so can loss, damage and dispute costs.",
    },
    saas: {
      kicker: "SHAREON BUSINESS SAAS",
      title: "Making rental operations\nsimpler.",
      lead: "A plan for SHAREON’s own standard SaaS for rental businesses and companies. Not custom development; no product has been released.",
      items: [
        { name: "SHAREON Booking", body: "Rental bookings and schedules, including approval-based requests and clash checks." },
        { name: "SHAREON Inventory", body: "Inventory and asset management: availability and condition of equipment in one place." },
        { name: "SHAREON CRM", body: "Customers and transactions, with the history of repeat and business customers." },
        { name: "SHAREON Rental", body: "Rental, return and condition records, with pickup and return photos and parts checks." },
        { name: "SHAREON Finance", body: "Transactions and settlement overview, showing deposits apart from revenue." },
        { name: "SHAREON Automation", body: "Notifications and routine automation, such as return reminders and late-return alerts." },
      ],
      status: "long",
      cta: "Ask about adoption",
    },
    roadmap: {
      kicker: "EXECUTION ROADMAP",
      title: "Rentals first,\ncategories second.",
      lead: "Rather than adding categories quickly, SHAREON first builds enough items and renters in a specific area and category.",
      steps: [
        { n: "01", title: "Core marketplace", tag: "First", body: "Registration for people and businesses, search, rental requests, chat, my page and a stable basic flow. The first launch centres on rental, spaces and services, starting with approval-based booking." },
        { n: "02", title: "Safe rentals", body: "Validating payment, deposits, returns, condition checks, reviews and dispute policy. Payments and deposits operate only after a payment provider’s deposit method is confirmed." },
        { n: "03", title: "Key categories", body: "Expanding from high-demand categories: household goods, electronics, cameras, camping, spaces — first building supply and renters in a narrow area and category." },
        { n: "04", title: "Businesses and B2B", body: "Preparing professional rental companies joining, corporate asset sharing and business transactions such as bulk and long-term rental." },
        { n: "05", title: "SaaS, public and global", body: "Operating software for rental businesses, public sharing projects, localisation and licensing abroad — a long-term direction." },
      ],
      now: "Where it stands: stage 1 is in pilot development in the app.",
    },
    excluded: {
      kicker: "FOCUS",
      title: "Focused on sharing and rental.",
      lead: "Of the 20 areas first considered, the six furthest from sharing and rental were set aside from SHAREON’s core business. No app feature is deleted by this; it sets sharing and rental as the centre of the business.",
      points: [
        { n: "01", title: "An open sharing and rental marketplace", body: "A marketplace dedicated to sharing and rental, where people and businesses lend and borrow things, equipment and spaces directly." },
        { n: "02", title: "Rental operating SaaS for businesses", body: "SHAREON’s own standard product for rental companies to manage bookings, inventory, customers and settlement." },
        { n: "03", title: "Start small, go deep", body: "As a two-sided marketplace, SHAREON first builds supply and renters in a specific area and category, then widens." },
      ],
    },
    next: {
      kicker: "NEXT STEP",
      title: "Create new sharing\nopportunities with SHAREON.",
      ctas: ["Explore partnerships", "Business inquiry"],
    },
  },

  partnerships: {
    seoTitle: "SHAREON Partnerships | Rental companies, businesses, public bodies, technology partners — Newon",
    seoDescription:
      "Rental companies, space operators, mobility and professional-equipment operators, payment, insurance and logistics partners, public bodies and global partners. SHAREON’s 14 partner types and process.",
    hero: {
      kicker: "SHAREON / PARTNERSHIPS",
      title: "Looking for partners\nto widen the value of sharing.",
      lead: "From rental companies to businesses, public bodies and technology partners, SHAREON is widening its collaboration so that more resources reach the people who need them.",
      ctaMain: "Partnership inquiry",
      ctaSub: "See the business",
    },
    open: {
      kicker: "OPEN MARKETPLACE",
      title: "No partnership contract needed —\nlist and rent directly.",
      lead: "Not a closed model where only contracted partners can join, but an open marketplace where qualified people and businesses list and rent directly. The types below are where a separate collaboration adds value.",
      points: [
        { n: "01", body: "People and businesses sign up directly, without a separate partnership contract, to list things, spaces, mobility and services." },
        { n: "02", body: "Qualifications and safety are checked per item. Items with legal requirements, such as vehicles and professional equipment, are handled only by qualified operators." },
        { n: "03", body: "Payment, insurance and logistics are areas for separate collaboration. Payments and deposits operate only after a payment provider’s deposit method is confirmed." },
        { n: "04", body: "Basic listing and renting are meant to work without a subscription or partnership." },
        { n: "05", body: "Ads and paid placement are always labelled as ads, and companies without a signed agreement are never shown as partners." },
      ],
    },
    notice: "SHAREON has no contracted partners yet. The types below are the kinds of collaboration we welcome; they do not refer to any specific company.",
    types: {
      kicker: "14 PARTNER TYPES",
      title: "Fourteen ways\nto work together.",
      labels: { collab: "Collaboration", value: "What SHAREON aims to offer", terms: "Conditions", status: "Status" },
      items: [
        { n: "01", icon: "everyday", title: "Household rental companies", collab: "Household equipment rental", value: "New customer reach and rental management", terms: "Parts and usage-note rules", status: "dev" },
        { n: "02", icon: "electronics", title: "Electronics rental companies", collab: "IT device rental", value: "Connecting short-term demand", terms: "Device reset and condition checks", status: "prep" },
        { n: "03", icon: "camera", title: "Production gear rental companies", collab: "Camera and video equipment", value: "Reaching creators and studios", terms: "Condition disclosure, damage rules", status: "dev" },
        { n: "04", icon: "camping", title: "Camping and travel gear companies", collab: "Travel gear rental", value: "Better use of seasonal gear", terms: "Cleaning and hygiene rules", status: "dev" },
        { n: "05", icon: "fashion", title: "Clothing and event item companies", collab: "Fashion and event rental", value: "Reaching event and shoot demand", terms: "Authenticity, hygiene, cleaning", status: "prep" },
        { n: "06", icon: "space", title: "Space operators", collab: "Studios and meeting rooms", value: "Using idle hours", terms: "Right to use the space, safety rules", status: "dev" },
        { n: "07", icon: "mobility", title: "Licensed mobility operators", collab: "Vehicles and mobility", value: "Connecting lawful mobility rental", terms: "Operator licence under the relevant law", status: "long" },
        { n: "08", icon: "sports", title: "Sports and leisure companies", collab: "Sports equipment", value: "Reaching seasonal and local demand", terms: "Safety condition, protective gear", status: "prep" },
        { n: "09", icon: "pro", title: "Industrial equipment companies", collab: "Industrial equipment", value: "Reaching short-term business demand", terms: "Qualifications, training, insurance", status: "long" },
        { n: "10", icon: "office", title: "Office equipment companies", collab: "Business equipment", value: "Repeat business and long-term contracts", terms: "Business contract terms", status: "long" },
        { n: "11", icon: "corporate", title: "Corporate asset managers", collab: "Using idle assets", value: "Earning from idle assets, lowering costs", terms: "Internal approval, asset rules", status: "long" },
        { n: "12", icon: "payment", title: "Payment, insurance and logistics partners", collab: "Transaction infrastructure", value: "Demand suited to sharing and rental", terms: "Relevant laws and agreements", status: "prep" },
        { n: "13", icon: "public", title: "Local governments and public bodies", collab: "Public sharing projects", value: "Better use of public resources", terms: "Procurement and contract process", status: "long" },
        { n: "14", icon: "global", title: "Global and technology partners", collab: "Abroad and SaaS", value: "A proven sharing and rental model", terms: "Local laws, licence terms", status: "long" },
      ],
    },
    process: {
      kicker: "PROCESS",
      title: "How it works.",
      lead: "After we receive a proposal we review the business, legal and operating conditions, then discuss and agree before starting. Results and timing depend on the proposal.",
      steps: [
        { n: "01", title: "Proposal", body: "Tell us through the inquiry form what you offer, your resources and the role you have in mind." },
        { n: "02", title: "Review", body: "Business, legal and operating checks, plus item-specific qualifications." },
        { n: "03", title: "Discussion", body: "Agree roles, responsibilities and operating conditions together." },
        { n: "04", title: "Agreement", body: "A contract where one is needed. No one is shown as a partner before signing." },
        { n: "05", title: "Operation", body: "Start step by step, from a small area and category." },
      ],
    },
    next: {
      kicker: "PARTNERSHIP",
      title: "Building new possibilities\nfor sharing, together.",
      ctas: ["Partnership inquiry", "SHAREON overview"],
    },
  },

  contact: {
    seoTitle: "SHAREON Contact | App, rental, business and partnership inquiries — Newon",
    seoDescription:
      "Questions about the SHAREON app, renting and listing as a person or business, spaces and professional equipment, payment and deposits, returns and disputes, business SaaS, public bodies, technology and global work — through NEWON’s official channels.",
    hero: {
      kicker: "SHAREON / CONTACT",
      title: "Tell us about new ways\nto share with SHAREON.",
      lead: "From using the app to rentals for people and businesses, spaces and professional equipment, business SaaS and work with institutions — SHAREON inquiries come through NEWON’s official channels.",
      ctaMain: "Open the inquiry form",
      ctaSub: "Send an email",
    },
    kicker: "INQUIRY TYPES",
    title: "Choose\nan inquiry type.",
    lead: "Each type opens NEWON’s official inquiry form or official email. No sign-up is needed.",
    formCta: "Inquiry form",
    mailCta: "Email",
    mailSubjectPrefix: "[SHAREON]",
    items: [
      { n: "01", icon: "app", title: "Using the app", body: "Questions about the pilot app and technical topics. The app is not in the app stores yet.", slug: "app" },
      { n: "02", icon: "everyday", title: "Personal renting and listing", body: "How to lend or borrow as an individual. Basic listing is meant to work without a subscription.", slug: "personal" },
      { n: "03", icon: "corporate", title: "Business rental and joining", body: "Registration and renting for rental companies and businesses, who sign up directly without a partnership contract.", slug: "business" },
      { n: "04", icon: "space", title: "Space rental", body: "Space operators, renting spaces and listing services offered with a space. A focus area for the first launch.", slug: "space" },
      { n: "05", icon: "pro", title: "Professional equipment", body: "Industrial, production and office equipment rental, with qualifications, safety training and insurance considered.", slug: "pro-equipment" },
      { n: "06", icon: "payment", title: "Payment and deposits", body: "Feedback and partnerships on payment and deposits. Payments and deposits are not operating yet.", slug: "payments" },
      { n: "07", icon: "return", title: "Returns and disputes", body: "Feedback on returns, inspection and dispute rules, which will be fixed with the terms of use after legal review.", slug: "returns" },
      { n: "08", icon: "saas", title: "Business SaaS", body: "Considering SHAREON Business SaaS. A long-term direction; no product has been released.", slug: "saas" },
      { n: "09", icon: "public", title: "Public bodies", body: "Sharing projects with local governments and public bodies, reviewed under each body’s procurement and contract process.", slug: "public" },
      { n: "10", icon: "global", title: "Technology and global work", body: "Technology partnerships, expansion abroad and licensing, checked against local laws and licence terms.", slug: "global" },
    ],
    guide: {
      kicker: "BEFORE YOU WRITE",
      title: "Please check\nbefore you write.",
      items: [
        "Include only what we need to reply: your name, email and your question.",
        "Never include card numbers, account passwords, ID numbers or other sensitive payment or personal information.",
        "SHAREON inquiries are received only through NEWON’s official inquiry form and official email (newon@newon.app).",
        "The app is in pilot development, so there is no customer support for real rentals, bookings, payments or refunds.",
        "Fee rates, prices and launch timing are not decided yet, so we cannot give specific figures or dates in reply to an inquiry.",
        "Response times depend on the inquiry; we cannot guarantee a reply time.",
      ],
      privacy: "Privacy Policy",
    },
  },
};

/* Other locales: EN body with localized page titles, descriptions and hero lines (no new locales added). */
const LOCAL = {
  ja: {
    overview: { seoTitle: "SHAREON | Newon — シェア・レンタルマーケットプレイス", seoDescription: "SHAREONは、個人と企業が持つモノ・機材・空間・移動手段を必要な人とつなぐシェア・レンタルのマーケットプレイスを目指しています。アプリは試験開発中で、実際のレンタルや決済はまだ運営していません。", hero: { title: "所有しなくても、\n必要なときに。" } },
    platform: { seoTitle: "SHAREON プラットフォーム | 18のサービス領域 — Newon", seoDescription: "生活用品、電子機器、撮影機材、キャンプ、空間、移動手段、専門機材、地域・企業シェア、そしてレンタル取引の仕組み。SHAREONの18のサービス領域です。" },
    business: { seoTitle: "SHAREON ビジネス | 14の事業と収益モデル — Newon", seoDescription: "SHAREONの14のシェア・レンタル事業、6つの収益源、企業向けSaaS、実行段階を紹介します。手数料と価格は未確定で、計算例は仮のものです。" },
    partnerships: { seoTitle: "SHAREON パートナーシップ — Newon", seoDescription: "レンタル事業者、空間運営者、決済・保険・物流パートナー、公共機関・海外パートナーまで。14のパートナー類型と協力の流れです。" },
    contact: { seoTitle: "SHAREON お問い合わせ — Newon", seoDescription: "SHAREONに関するお問い合わせは、NEWONの公式お問い合わせフォームと公式メールで受け付けています。" },
  },
  es: {
    overview: { seoTitle: "SHAREON | Newon — Marketplace de uso compartido y alquiler", seoDescription: "SHAREON quiere conectar objetos, equipos, espacios y movilidad de personas y empresas con quien los necesita. La app está en desarrollo piloto; aún no hay alquileres ni pagos reales.", hero: { title: "Sin tenerlo en propiedad.\nJusto cuando lo necesitas." } },
    platform: { seoTitle: "SHAREON Plataforma | 18 áreas de servicio — Newon", seoDescription: "Hogar, electrónica, equipos de producción, camping, espacios, movilidad, equipos profesionales, uso compartido local y empresarial, y el sistema de alquiler." },
    business: { seoTitle: "SHAREON Negocio | 14 negocios y modelo de ingresos — Newon", seoDescription: "Los 14 negocios de SHAREON, seis fuentes de ingresos, SaaS para empresas y etapas de ejecución. Las tarifas no están decididas; el cálculo es hipotético." },
    partnerships: { seoTitle: "SHAREON Alianzas — Newon", seoDescription: "Los 14 tipos de socios de SHAREON y el proceso de colaboración." },
    contact: { seoTitle: "SHAREON Contacto — Newon", seoDescription: "Consultas sobre SHAREON a través del formulario y el correo oficiales de NEWON." },
  },
  "pt-br": {
    overview: { seoTitle: "SHAREON | Newon — Marketplace de compartilhamento e aluguel", seoDescription: "O SHAREON quer conectar objetos, equipamentos, espaços e mobilidade de pessoas e empresas a quem precisa. O app está em desenvolvimento piloto; ainda não há aluguéis ou pagamentos reais.", hero: { title: "Sem precisar ter.\nNa hora em que você precisa." } },
    platform: { seoTitle: "SHAREON Plataforma | 18 áreas de serviço — Newon", seoDescription: "Casa, eletrônicos, equipamentos de produção, camping, espaços, mobilidade, equipamentos profissionais, compartilhamento local e corporativo e o sistema de aluguel." },
    business: { seoTitle: "SHAREON Negócios | 14 negócios e modelo de receita — Newon", seoDescription: "Os 14 negócios do SHAREON, seis fontes de receita, SaaS para empresas e etapas de execução. As tarifas não estão definidas; o cálculo é hipotético." },
    partnerships: { seoTitle: "SHAREON Parcerias — Newon", seoDescription: "Os 14 tipos de parceiros do SHAREON e o processo de colaboração." },
    contact: { seoTitle: "SHAREON Contato — Newon", seoDescription: "Dúvidas sobre o SHAREON pelos canais oficiais de contato da NEWON." },
  },
  fr: {
    overview: { seoTitle: "SHAREON | Newon — Place de marché de partage et de location", seoDescription: "SHAREON veut relier les objets, équipements, espaces et moyens de mobilité des particuliers et des entreprises à ceux qui en ont besoin. L’app est en développement pilote ; aucune location ni aucun paiement réels pour l’instant.", hero: { title: "Pas besoin de posséder.\nJuste quand il le faut." } },
    platform: { seoTitle: "SHAREON Plateforme | 18 domaines de service — Newon", seoDescription: "Maison, électronique, matériel de production, camping, espaces, mobilité, équipements professionnels, partage local et entre entreprises, et le système de location." },
    business: { seoTitle: "SHAREON Business | 14 activités et modèle de revenus — Newon", seoDescription: "Les 14 activités de SHAREON, six sources de revenus, un SaaS pour les entreprises et les étapes d’exécution. Les tarifs ne sont pas fixés ; le calcul est hypothétique." },
    partnerships: { seoTitle: "SHAREON Partenariats — Newon", seoDescription: "Les 14 types de partenaires de SHAREON et le processus de collaboration." },
    contact: { seoTitle: "SHAREON Contact — Newon", seoDescription: "Questions sur SHAREON via le formulaire et l’e-mail officiels de NEWON." },
  },
  de: {
    overview: { seoTitle: "SHAREON | Newon — Marktplatz für Teilen und Mieten", seoDescription: "SHAREON will Dinge, Geräte, Räume und Mobilität von Privatpersonen und Unternehmen mit denen verbinden, die sie brauchen. Die App ist in der Pilotentwicklung; echte Vermietungen und Zahlungen laufen noch nicht.", hero: { title: "Nicht besitzen müssen.\nGenau dann, wenn man es braucht." } },
    platform: { seoTitle: "SHAREON Plattform | 18 Servicebereiche — Newon", seoDescription: "Haushalt, Elektronik, Produktionstechnik, Camping, Räume, Mobilität, Profigeräte, lokales und betriebliches Teilen und das Mietsystem." },
    business: { seoTitle: "SHAREON Business | 14 Geschäftsfelder und Erlösmodell — Newon", seoDescription: "Die 14 Geschäftsfelder von SHAREON, sechs Erlösquellen, SaaS für Unternehmen und Umsetzungsphasen. Gebühren sind nicht festgelegt; die Rechnung ist ein Beispiel." },
    partnerships: { seoTitle: "SHAREON Partnerschaften — Newon", seoDescription: "Die 14 Partnertypen von SHAREON und der Ablauf der Zusammenarbeit." },
    contact: { seoTitle: "SHAREON Kontakt — Newon", seoDescription: "Anfragen zu SHAREON über das offizielle Kontaktformular und die offizielle E-Mail von NEWON." },
  },
  hi: {
    overview: { seoTitle: "SHAREON | Newon — साझा और किराये का मार्केटप्लेस", seoDescription: "SHAREON लोगों और व्यवसायों की चीज़ों, उपकरणों, जगहों और आवागमन के साधनों को ज़रूरतमंद लोगों से जोड़ना चाहता है। ऐप पायलट विकास में है; असली किराया और भुगतान अभी शुरू नहीं हुए हैं।", hero: { title: "मालिक बने बिना,\nठीक ज़रूरत के समय।" } },
    platform: { seoTitle: "SHAREON प्लेटफ़ॉर्म | 18 सेवा क्षेत्र — Newon", seoDescription: "घरेलू सामान, इलेक्ट्रॉनिक्स, प्रोडक्शन उपकरण, कैंपिंग, जगहें, आवागमन, पेशेवर उपकरण, स्थानीय और कॉर्पोरेट साझा और किराये की प्रणाली।" },
    business: { seoTitle: "SHAREON बिज़नेस | 14 व्यवसाय और आय मॉडल — Newon", seoDescription: "SHAREON के 14 व्यवसाय, छह आय स्रोत, व्यवसायों के लिए SaaS और कार्यान्वयन चरण। शुल्क तय नहीं हैं; गणना काल्पनिक उदाहरण है।" },
    partnerships: { seoTitle: "SHAREON साझेदारी — Newon", seoDescription: "SHAREON के 14 साझेदार प्रकार और सहयोग की प्रक्रिया।" },
    contact: { seoTitle: "SHAREON संपर्क — Newon", seoDescription: "SHAREON से जुड़े सवाल NEWON के आधिकारिक फ़ॉर्म और ईमेल से भेजें।" },
  },
  id: {
    overview: { seoTitle: "SHAREON | Newon — Marketplace berbagi dan sewa", seoDescription: "SHAREON ingin menghubungkan barang, peralatan, ruang, dan sarana mobilitas milik perorangan dan bisnis dengan orang yang membutuhkannya. Aplikasi masih uji coba; sewa dan pembayaran nyata belum berjalan.", hero: { title: "Tak perlu memiliki.\nTepat saat dibutuhkan." } },
    platform: { seoTitle: "SHAREON Platform | 18 bidang layanan — Newon", seoDescription: "Rumah tangga, elektronik, peralatan produksi, berkemah, ruang, mobilitas, peralatan profesional, berbagi lokal dan antarperusahaan, serta sistem sewa." },
    business: { seoTitle: "SHAREON Bisnis | 14 bisnis dan model pendapatan — Newon", seoDescription: "14 bisnis SHAREON, enam sumber pendapatan, SaaS untuk bisnis, dan tahap pelaksanaan. Biaya belum ditetapkan; perhitungannya hanya contoh." },
    partnerships: { seoTitle: "SHAREON Kemitraan — Newon", seoDescription: "14 jenis mitra SHAREON dan proses kerja samanya." },
    contact: { seoTitle: "SHAREON Kontak — Newon", seoDescription: "Pertanyaan tentang SHAREON melalui formulir dan email resmi NEWON." },
  },
};

function deepMerge(base, over) {
  if (!over || typeof over !== "object" || Array.isArray(over)) return over === undefined ? base : over;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = deepMerge(base ? base[k] : undefined, v);
  return out;
}

/** Full copy for a locale; `contentLang` tells the renderer which language the body text is in. */
export function getShareonCopy(lang) {
  if (lang === "ko") return { ...KO, contentLang: "ko" };
  if (lang === "en") return { ...EN, contentLang: "en" };
  const over = LOCAL[lang];
  const heroLang = {};
  for (const [id, v] of Object.entries(over || {})) if (v && v.hero && v.hero.title) heroLang[id] = lang;
  return { ...(over ? deepMerge(EN, over) : EN), lang, contentLang: "en", heroLang };
}

export const SHAREON_PAGES = [
  { id: "overview", path: "shareon" },
  { id: "platform", path: "shareon/platform" },
  { id: "business", path: "shareon/business" },
  { id: "partnerships", path: "shareon/partnerships" },
  { id: "contact", path: "shareon/contact" },
];

/** Areas removed from SHAREON's core business (plan §3). Never rendered; used by checks to make sure they stay off the pages. */
export const EXCLUDED_BUSINESS_TERMS = {
  ko: ["중고거래", "신상품 쇼핑", "공동구매", "생활 서비스 예약", "클래스", "디지털 상품"],
  en: ["Second-hand trading", "New-product shopping", "Group buying", "Life-service booking", "Classes", "Digital goods"],
};

export { KO, EN };
