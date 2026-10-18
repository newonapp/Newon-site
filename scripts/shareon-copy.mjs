/**
 * SHAREON — All-in-One Sharing & Rental Marketplace (Overview · Platform · Business · Partnerships · Contact).
 * Source: "SHAREON 최종 사업 확장 계획" (14 core businesses, 6 revenue axes, 5 website menus).
 * Business introduction only: no listing, search, booking, payment, deposit, settlement, chat or login on the web.
 *
 * Status rules: the SHAREON app is a pilot build — real trades, payment and booking confirmation are switched off
 * and it is not in the app stores. Nothing here is "available now".
 * V2 (owner brief "SHAREON OFFICIAL WEBSITE V2"): per-card status badges are no longer rendered; each page carries
 * one shared notice (statusNote) and the item copy itself says what is not operating (payment, deposits, etc.).
 * No user counts, volumes, partner names or fixed prices/fees. The revenue calculator is a hypothetical example the
 * visitor can change; the fee-rate field is left blank (rate not decided) for the visitor to fill in.
 * KO and EN are complete; other locales fall back to EN body text (as Ongil does) with localized SEO and hero lines.
 */

/* icon keys → scripts/shareon-icons.mjs */

const KO = {
  lang: "ko",
  brand: "SHAREON",
  positioning: "All-in-One Sharing & Rental Marketplace",
  statusLabel: "안내",
  statusNote:
    "SHAREON은 실물 자산 공유·대여를 기반으로 개인·기업 거래, 기업 솔루션과 다양한 자산 활용 분야로의 확장을 준비하고 있습니다. 소개된 사업과 기능 중 일부는 향후 개발 또는 운영 방향에 포함되며, 앱 출시 전인 지금은 실제 대여·예약 확정·결제·보증금·정산이 운영되지 않습니다.",
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
    seoTitle: "SHAREON | Newon — 실물 자산 공유·대여 마켓플레이스",
    seoDescription:
      "SHAREON은 개인과 기업이 보유한 물건·장비·공간 같은 실물 자산을 등록하고 필요한 이용자에게 대여할 수 있도록 연결하는 공유·대여 오픈 마켓플레이스를 지향합니다. 앱은 출시 전이며 실제 대여·결제는 아직 운영되지 않습니다.",
    hero: {
      kicker: "SHAREON — ASSET SHARING & RENTAL MARKETPLACE",
      title: "소유하지 않아도,\n필요한 순간에.",
      lead: "필요한 물건은 합리적으로 이용하고, 사용하지 않는 자산에는 새로운 가치를 더하는 방법. SHAREON은 개인과 기업이 실물 자산을 공유하고 대여할 수 있도록 연결하는 오픈 마켓플레이스를 지향합니다.",
      ctaMain: "플랫폼 살펴보기",
      ctaSub: "SHAREON 알아보기",
    },
    vision: {
      kicker: "ABOUT SHAREON · OUR MISSION",
      title: "모든 것을\n소유할 필요는 없습니다.",
      lead: "어떤 물건은 단 하루만 필요하고, 어떤 장비는 특정 프로젝트에만 쓰입니다. 반대로 누군가에게는 오랫동안 쓰지 않는 자산이 있습니다. SHAREON은 필요한 사람과 자산을 보유한 사람을 연결해 새로운 활용 기회를 만들고, 개인과 기업이 함께 참여하는 자산 공유·대여 생태계를 지향합니다. 자산의 가치는, 더 많이 활용될 때 커집니다.",
      points: [
        { n: "01", title: "Access — 필요한 순간의 접근성", body: "자주 쓰지 않지만 사기에는 부담스러운 물건을, 필요한 순간에 찾아 이용합니다. 캠핑 장비나 촬영 장비처럼 가끔 쓰는 물건이 대표적입니다." },
        { n: "02", title: "Sharing — 자산의 새로운 활용", body: "쓰지 않는 시간이 긴 물건·장비·공간을 다른 사람과 나눠, 보유한 자산이 다시 쓰이게 합니다." },
        { n: "03", title: "Flexibility — 필요한 기간만 이용", body: "구매 대신 필요한 기간만큼 빌리고, 공급자는 대여 조건과 이용 가능 기간을 직접 정합니다." },
        { n: "04", title: "Trust — 신뢰할 수 있는 거래", body: "등록부터 반납까지 거래가 안전하게 끝나는 구조를 먼저 설계합니다. 첫 출시는 대여·공간 중심으로, 공급자가 요청을 확인하고 수락하는 승인형 예약부터 준비합니다." },
        { n: "05", title: "Efficiency — 자산 활용 효율", body: "개인의 유휴 물품부터 기업의 장비·공간까지, 이미 있는 자산의 가동률을 높이는 방향입니다." },
        { n: "06", title: "Sustainability — 지속가능한 소비", body: "새로 사는 대신 이미 있는 자원을 순환시켜, 더 적게 소유하고 더 넓게 활용하는 소비를 지향합니다." },
      ],
    },
    share: {
      kicker: "WHAT WE SHARE",
      title: "물건부터 공간, 이동수단까지.",
      lead: "SHAREON이 공유·대여의 대상으로 검토하는 네 가지 실물 자산입니다. 서비스는 공간·장비 대여와 함께 제공되는 경우에 한해 등록 대상으로 검토하며, 일반 인력·용역 매칭은 SHAREON의 사업이 아닙니다.",
      items: [
        { icon: "everyday", en: "Things", title: "물건", body: "생활용품·전자기기·여행·캠핑·패션·행사 용품. 사기에는 부담스럽고 가끔만 필요한 물건을 필요한 기간만큼 빌리는 방식입니다.", chips: ["생활용품", "전자기기", "캠핑용품", "행사 용품"] },
        { icon: "camera", en: "Equipment", title: "장비", body: "카메라·촬영 장비부터 산업·사무 장비까지. 전문 장비는 상태 고지와 사용 자격, 안전 기준을 함께 확인합니다.", chips: ["촬영 장비", "스포츠 장비", "전문 장비", "사무 장비"] },
        { icon: "space", en: "Spaces", title: "공간", body: "회의실·스튜디오·연습실·작업실·전시 공간. 첫 출시의 중심 영역으로, 공간 운영과 함께 제공되는 서비스 등록도 검토합니다.", chips: ["회의실", "스튜디오", "작업실", "파티룸"] },
        { icon: "mobility", en: "Mobility", title: "이동수단", body: "자전거·이동 장비. 차량은 법적 요건이 엄격해 적격 사업자 연계만 장기적으로 검토합니다.", chips: ["자전거", "이동 장비", "적격 사업자 차량"] },
      ],
    },
    how: {
      kicker: "HOW SHAREON WORKS",
      title: "자산을 가진 사람과\n필요한 사람을 연결합니다.",
      lead: "탐색·등록·연결·대여·반납으로 이어지는, SHAREON이 목표로 하는 대여 흐름입니다. 앱은 출시 전이며, 결제·보증금·정산·분쟁 처리는 결제대행 계약과 책임·환불 규정을 함께 설계한 뒤 단계적으로 운영합니다.",
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
      kicker: "MARKETPLACE NETWORK",
      title: "개인과 기업이 자유롭게\n연결되는 마켓플레이스.",
      lead: "개인과 기업 모두 별도 제휴 계약 없이 직접 가입해 공급자이면서 이용자가 될 수 있는 구조를 지향합니다. 아래 네 가지는 공급자에서 이용자로 향하는 거래 구조이며, 모두 운영 중이라는 뜻은 아닙니다. 기업이 참여하는 거래는 사업자 확인을 마친 뒤 열립니다.",
      items: [
        { n: "01", en: "C2C", title: "개인 → 개인", body: "개인이 가진 물건이나 장비를 다른 개인에게 빌려줍니다. 이웃 간 근거리 대여가 기본 형태입니다." },
        { n: "02", en: "B2C", title: "기업 → 개인", body: "기업이 보유한 장비·공간·물품을 개인에게 빌려줍니다. 대여업체와 공간 운영자가 직접 등록합니다." },
        { n: "03", en: "C2B", title: "개인 → 기업", body: "기업이 개인 소유의 장비·물품을 업무·행사·프로젝트에 빌려 씁니다. 구인·요청 게시판이 아니라 개인이 공급자인 대여입니다." },
        { n: "04", en: "B2B", title: "기업 → 기업", body: "기업끼리 장비·물품·설비 같은 적격 자산을 빌려줍니다. 유휴 자산의 활용도를 높이는 방향입니다." },
        { n: "05", en: "For Individuals", title: "개인에게도, 새로운 선택지", body: "필요한 물건을 일정 기간만 이용하고, 보유한 자산을 대여해 활용할 수 있는 기회. 기본 등록과 거래는 구독 없이 이용하는 구조를 원칙으로 합니다." },
        { n: "06", en: "For Businesses", title: "기업에게도, 새로운 선택지", body: "장비·물품 등 보유 자산의 활용도를 높이고, 필요한 자산을 유연하게 확보할 수 있는 기회. 대여업체도 별도 제휴 없이 직접 입점합니다." },
      ],
    },
    trust: {
      kicker: "TRUST & RESPONSIBILITY",
      title: "공유의 시작은\n신뢰입니다.",
      lead: "대여는 물건이 다시 돌아와야 끝나는 거래입니다. SHAREON은 화면 기능보다 거래의 책임과 절차, 적격 거래와 관련 법규 준수를 먼저 설계합니다.",
      items: [
        { n: "01", title: "정확한 자산 정보", body: "등록 정보와 함께 인수·반납 때 상태와 구성품을 기록해, 반납 검수의 기준으로 삼는 방식을 준비합니다." },
        { n: "02", title: "투명한 대여 조건", body: "대여 기간·조건을 거래 전에 확인합니다. 보증금은 매출과 구분하며, 자체 에스크로 없이 결제대행사의 보증금 방식이 확정되고 법률 검토를 마친 뒤에만 운영합니다." },
        { n: "03", title: "거래 당사자 확인", body: "본인·사업자 확인과 품목별 자격을 확인합니다. 차량·전문 장비처럼 자격이 필요한 품목은 기준을 따로 둡니다." },
        { n: "04", title: "분쟁 대응 원칙", body: "파손·분실·연체에 대한 기준과 처리 절차를 마련하고, 법률 검토 후 약관과 함께 확정합니다." },
        { n: "05", title: "개인정보 보호", body: "정확한 주소는 거래 전에 공개하지 않고, 사진 위치 정보는 등록할 때 제거합니다." },
      ],
      note: "보증금 보관·보험·보상은 현재 제공하지 않으며, 보호나 보상을 약속하지 않습니다.",
    },
    eco: {
      kicker: "BEYOND RENTAL",
      title: "단순한 대여를 넘어,\n자산 활용의 생태계로.",
      lead: "SHAREON은 실물 자산 대여를 중심으로 다양한 자산 카테고리, 거래 지원, 기업 솔루션과 글로벌 공유경제 시장으로의 확장을 장기 방향으로 준비합니다. 기업 솔루션은 고객별 외주 개발이 아니라 자체 표준 솔루션입니다.",
      items: [
        { n: "01", title: "대여업체·기업 입점", body: "전문 대여업체와 기업이 별도 제휴 계약 없이 직접 등록하고 거래하는 구조입니다." },
        { n: "02", title: "기업 자산 활용", body: "쓰지 않는 장비·공간을 개인·기업과 나눠, 유휴 자산의 활용도를 높입니다." },
        { n: "03", title: "거래 지원·기업 SaaS", body: "예약·재고·CRM·정산 운영 도구와 거래 지원 구조. 현재 출시된 제품은 없습니다." },
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
      title: "더 적게 소유하고,\n더 넓게 활용하는 세상.",
      lead: "SHAREON은 개인과 기업이 직접 참여하는 실물 자산 공유·대여 오픈 마켓플레이스와, 대여업체를 위한 운영 SaaS로 성장하는 것을 목표로 합니다.",
      ctas: ["플랫폼 살펴보기", "사업 알아보기", "문의하기"],
    },
  },

  /* ─────────────── 02 Platform ─────────────── */
  platform: {
    seoTitle: "SHAREON 서비스 | 물건·장비·공간·이동수단 대여 — Newon",
    seoDescription:
      "생활용품, 전자기기, 촬영 장비, 캠핑, 패션·행사, 공간, 이동수단, 스포츠, 전문·사무 장비, 지역·기업 공유와 대여 거래 시스템까지. SHAREON의 18개 서비스 영역입니다.",
    hero: {
      kicker: "SHAREON / PLATFORM",
      title: "필요한 자산을 찾고,\n보유한 자산의 가치를 연결합니다.",
      lead: "SHAREON은 개인과 기업이 실물 자산을 등록하고 필요한 기간 동안 대여할 수 있도록 연결하는 공유·대여 마켓플레이스를 지향합니다. 준비 중인 열여덟 가지 서비스 영역과, 대여가 안전하게 끝나기 위한 거래 시스템을 소개합니다.",
      ctaMain: "비즈니스 살펴보기",
      ctaSub: "문의하기",
    },
    next: {
      kicker: "NEXT STEP",
      title: "필요한 순간의 연결이,\n자산의 새로운 가치가 됩니다.",
      lead: "실제 등록·탐색·대여 요청·채팅은 SHAREON 앱에서 제공하는 방향이며, 웹사이트는 소개와 안내만 합니다.",
    },
    indexTitle: "18개 서비스 한눈에 보기",
    groups: [
      { id: "a", kicker: "A · THINGS", title: "생활·개인 물품 대여", lead: "자주 쓰지 않지만 사기에는 부담스러운 물건들입니다." },
      { id: "b", kicker: "B · SPACE, MOBILITY & PRO", title: "공간·이동수단·전문 장비", lead: "규정·자격·안전 확인이 함께 필요한 영역입니다." },
      { id: "c", kicker: "C · SHARED RESOURCES", title: "공유 자원", lead: "가까운 지역과 기업의 유휴 자원을 연결합니다." },
      { id: "d", kicker: "D · RENTAL SYSTEM", title: "대여 거래 시스템", lead: "자산 탐색·등록, 대여 요청과 공급자·이용자 간 채팅, 반납, 신뢰까지. SHAREON은 단순한 상품 목록이 아니라 거래가 안전하게 완료되는 플랫폼을 지향합니다. 결제·정산·보증금·거래 보호·보험 연계는 향후 인프라이며, 실제 구현 상태에 맞춰 소개합니다." },
      { id: "e", kicker: "E · ACCESS", title: "앱과 접근성", lead: "" },
    ],
    services: [
      { n: "01", g: "a", icon: "everyday", en: "Everyday Rental", title: "생활용품 대여", body: "필요할 때 사기에는 부담스러운 생활 장비를 필요한 날만큼 빌립니다. 이사·대청소·집수리처럼 가끔 생기는 일에 맞춘 대여입니다.", chips: ["청소 장비", "공구", "고압세척기", "사다리", "생활 가전", "이사 도구"], consider: "기본 사용 안내와 구성품 확인이 필요합니다." },
      { n: "02", g: "a", icon: "electronics", en: "Electronics", title: "전자기기 대여", body: "노트북·태블릿·프로젝터·모니터·게임기 등 고가 기기를 단기간 이용합니다. 출장·행사·시험 사용처럼 잠시 필요한 경우를 위한 영역입니다.", chips: ["노트북", "태블릿", "프로젝터", "모니터", "게임기"], consider: "파손·분실·개인정보 유출 위험 때문에 기기 초기화, 상태 검수, 인수인계 절차가 필요합니다." },
      { n: "03", g: "a", icon: "camera", en: "Camera & Production", title: "카메라·촬영장비 대여", body: "개인 크리에이터부터 소규모 제작사·기업까지, 촬영에 필요한 장비를 빌립니다. 개인이 가진 장비를 기업이 빌리는 C2B 거래도 함께 검토합니다.", chips: ["카메라", "렌즈", "조명", "삼각대", "마이크", "영상 장비"], consider: "장비 상태 고지와 파손 기준 합의가 필요합니다." },
      { n: "04", g: "a", icon: "camping", en: "Travel & Camping", title: "여행·캠핑용품 대여", body: "여행과 캠핑에 필요한 장비를 짧게 빌려 씁니다. MY WORLD가 여행 계획·예약을 맡는다면, SHAREON은 장비 대여에 집중합니다.", chips: ["캐리어", "텐트", "캠핑 의자", "테이블", "침낭", "여행 액세서리"], consider: "계절별 수요와 세척·건조 상태 확인이 중요합니다." },
      { n: "05", g: "a", icon: "fashion", en: "Fashion & Events", title: "패션·행사용품 대여", body: "행사·촬영용 의상과 소품을 필요한 날 빌립니다. 위생과 진위 확인 기준이 마련된 품목부터 다룰 계획입니다.", chips: ["행사 의류", "촬영 의상", "가방", "액세서리", "파티 소품"], consider: "브랜드 상품의 진위, 위생·세탁, 훼손 책임, 대여 가능 여부를 확인해야 합니다." },
      { n: "06", g: "b", icon: "space", en: "Space Rental", title: "공간 대여", body: "회의실·스튜디오·연습실·작업실·파티룸·전시 공간을 시간·일·장기 단위로 이용하는 방식을 검토합니다. 첫 출시의 중심 영역이며, 공간 운영자가 공간 이용과 함께 제공하는 부대 서비스 등록도 검토합니다. 일반 인력·용역 매칭은 다루지 않습니다.", chips: ["회의실", "촬영 스튜디오", "연습실", "작업실", "파티룸", "전시 공간"], consider: "실제 사용 가능 용도, 소방·안전·영업 규정, 시설 운영자의 권한(임대·전대 포함)을 확인해야 합니다. 숙박·주차는 적법한 조건이 확인되기 전까지 다루지 않습니다." },
      { n: "07", g: "b", icon: "mobility", en: "Mobility", title: "차량·이동수단 대여", body: "자전거·전동 이동수단 등 이동 관련 자원의 대여를 검토합니다.", chips: ["자전거", "전동 이동수단", "이동 장비", "적격 사업자 차량"], consider: "자동차 유상 대여와 일부 이동수단은 법적 요건이 엄격합니다. 초기에는 적격 사업자 연계에 한정하며, 개인 간 무허가 차량 유상 대여는 허용하지 않습니다." },
      { n: "08", g: "b", icon: "sports", en: "Sports & Leisure", title: "스포츠·레저용품 대여", body: "스키·스노보드·골프·운동·아웃도어 장비를 빌립니다. 시즌마다 잠깐 필요한 장비를 사지 않고 이용하는 방식입니다.", chips: ["스키", "스노보드", "골프 장비", "운동 장비", "아웃도어 장비"], consider: "안전 상태, 보호장비, 사용 조건, 파손 책임이 중요합니다." },
      { n: "09", g: "b", icon: "pro", en: "Professional Equipment", title: "산업·전문 장비 대여", body: "건설·제조·촬영·측정·연구·현장 작업용 전문 장비를 기업과 적격 사업자에게 대여합니다.", chips: ["산업 장비", "측정 장비", "연구 장비", "현장 작업 장비"], consider: "장비별 사용 자격, 안전교육, 유지보수, 보험, 운송 조건을 검토해야 합니다." },
      { n: "10", g: "b", icon: "office", en: "Business Equipment", title: "사무·비즈니스 장비 대여", body: "프린터·복합기·프로젝터·회의·행사 장비·사무 가구·기업용 IT 장비를 대여합니다. 기업 고객의 반복·장기 대여를 장기 방향으로 검토합니다.", chips: ["복합기", "프로젝터", "회의 장비", "행사 장비", "사무 가구", "IT 장비"], consider: "기업 고객의 반복 거래와 장기 계약 조건을 함께 설계합니다." },
      { n: "11", g: "c", icon: "local", en: "Local Sharing", title: "지역 기반 공유", body: "동네에서 쓰지 않는 물품과 장비를 가까운 이웃과 나눕니다. 직접 등록하고, 근거리에서 찾고, 안전하게 주고받는 구조를 검토합니다.", chips: ["근거리 대여", "동네 자원", "지역 렌털 사업자", "안전한 인수·반납"], consider: "정확한 주소는 거래 전에 공개하지 않고, 안전한 전달 방식을 마련합니다." },
      { n: "12", g: "c", icon: "corporate", en: "Corporate Sharing", title: "기업 자산 공유", body: "기업의 유휴 장비와 공간을 다른 기업이나 개인 사업자에게 대여합니다. 쓰지 않는 자산의 가동률을 높이는 방향입니다.", chips: ["유휴 장비", "유휴 공간", "기업 간 장기 대여", "가동률 개선"], consider: "기업 내부 승인과 자산 관리 기준을 확인합니다." },
      { n: "13", g: "d", icon: "search", en: "Listings & Discovery", title: "등록과 탐색", body: "개인·기업이 실물 자산을 사진·대여 조건·이용 가능 기간과 함께 등록하고, 이용자는 카테고리·검색·위치 기반 탐색과 자산 상세정보로 찾습니다. 기본 등록은 구독 없이 이용하는 구조를 원칙으로 합니다.", chips: ["자산 등록", "사진 등록", "대여 조건", "카테고리·검색", "위치 기반 탐색"], consider: "사진의 위치 정보는 등록할 때 제거합니다." },
      { n: "14", g: "d", icon: "calendar", en: "Booking & Rental", title: "예약과 대여", body: "대여 가능 일정과 조건을 확인하고 예약을 요청하며, 일정·조건은 공급자와 이용자 간 채팅으로 협의합니다. 첫 출시는 공급자가 요청을 확인하고 수락하는 승인형 예약부터 준비하며, 즉시 예약은 이후 검토합니다.", chips: ["이용 가능 기간", "예약 요청", "승인형 예약", "채팅·일정 협의", "알림"], consider: "예약 요청과 채팅 화면은 앱에서 개발 중이며, 예약 확정은 아직 운영되지 않습니다." },
      { n: "15", g: "d", icon: "payment", en: "Payments & Deposits", title: "결제와 보증금", body: "적격 결제대행사를 통해 대여 대금과 보증금을 처리하는 구조를 준비합니다. SHAREON이 대금을 직접 보관하는 자체 에스크로는 만들지 않으며, 결제대행사의 보증금 처리 방식이 확정되기 전까지 결제·보증금은 운영하지 않습니다.", chips: ["대여 결제", "보증금", "환불 규정", "정산"], consider: "결제대행 계약, 거래 당사자 책임, 환불 규정, 손해배상을 함께 설계한 뒤에만 운영합니다. 보증금은 플랫폼 매출과 구분합니다." },
      { n: "16", g: "d", icon: "return", en: "Returns & Disputes", title: "반납과 분쟁", body: "반납 때 상태를 검수하고, 파손·분실·연체 문제를 정해진 절차로 처리합니다. 인수 때 남긴 사진·구성품 기록을 비교 기준으로 삼습니다.", chips: ["상태 검수", "구성품 확인", "파손·분실 기준", "연체 처리", "분쟁 대응"], consider: "처리 기준은 법률 검토 후 약관과 함께 확정합니다." },
      { n: "17", g: "d", icon: "trust", en: "Trust & Reviews", title: "신뢰와 후기", body: "거래 후 평가와 신고·차단으로 신뢰할 수 있는 이용 환경을 만듭니다. 광고·유료 노출은 항상 광고로 표시하는 원칙을 함께 적용합니다.", chips: ["이용자 확인", "사업자 확인", "거래 후기", "신고·차단"], consider: "신고 기능은 앱에서 개발 중이며, 후기는 실제 거래가 시작된 뒤 운영합니다." },
      { n: "18", g: "e", icon: "app", en: "App & Accessibility", title: "앱과 접근성", body: "SHAREON은 홈·탐색·등록·채팅·마이 다섯 개 탭으로 구성된 iOS·Android 앱으로 준비하고 있습니다. 실제 등록·대여·채팅은 앱에서만 제공하며, 웹사이트는 사업 소개와 안내만 합니다.", chips: ["iOS", "Android", "다크 모드", "큰 글자", "스크린리더"], consider: "아직 앱스토어에 출시되지 않아 다운로드 링크가 없습니다." },
    ],
  },

  /* ─────────────── 03 Business ─────────────── */
  business: {
    seoTitle: "SHAREON 비즈니스 | 14개 사업군·수익 모델·기업 SaaS — Newon",
    seoDescription:
      "SHAREON의 14개 공유·대여 사업군, 6개 수익원, 기업용 SaaS와 실행 단계를 소개합니다. 수수료와 가격은 확정되지 않았으며 계산 예시는 가상입니다.",
    hero: {
      kicker: "SHAREON / BUSINESS",
      title: "소유 중심의 시장에서,\n활용 중심의 경제로.",
      lead: "SHAREON은 개인과 기업의 실물 자산 공유·대여를 기반으로 다양한 자산 카테고리와 거래 지원, 기업 솔루션, 글로벌 공유경제 생태계로 확장하는 플랫폼을 지향합니다. 처음 검토한 20개 영역에서 공유·대여와 거리가 먼 6개를 덜어 내고, 14개 핵심 사업군으로 다시 짰습니다.",
      ctaMain: "파트너십 살펴보기",
      ctaSub: "사업 문의하기",
    },
    structure: {
      kicker: "BUSINESS STRUCTURE",
      title: "누구나 공급자이고,\n누구나 이용자입니다.",
      lead: "C2C·B2C·C2B·B2B는 공급자에서 이용자로 향하는 네 가지 거래 구조로, SHAREON이 지향하는 사업 방향입니다. 모두 운영 중이라는 뜻은 아니며, 기업이 참여하는 거래는 사업자 확인을 마친 뒤 열립니다.",
    },
    core: {
      kicker: "14 CORE BUSINESSES",
      title: "14개 핵심 사업군,\n6개 카테고리.",
      lead: "기존에 확정한 14개 사업군을 6개 카테고리로 정리했습니다. 카테고리를 선택하면 사업군별 대상·고객·수익 구조를 볼 수 있으며, 차량·전문 장비·공간처럼 법적 요건이 있는 영역은 운영 가능 여부를 먼저 확인합니다.",
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
        { n: "01", c: "c1", icon: "everyday", en: "Everyday Rental", title: "생활용품 대여", targets: "청소기·공구·가전·이사·집수리 등 생활 장비", customer: "개인·가정·소규모 사업자·지역 대여업체", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)" },
        { n: "02", c: "c1", icon: "electronics", en: "Electronics Rental", title: "전자기기 대여", targets: "노트북·태블릿·프로젝터·모니터", customer: "개인·기업", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)", consider: "기기 초기화·보증금·상태 검수·인수인계" },
        { n: "03", c: "c2", icon: "camera", en: "Camera & Production", title: "카메라·촬영장비 대여", targets: "카메라·렌즈·조명·마이크", customer: "개인 크리에이터·소규모 제작사·기업", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)" },
        { n: "04", c: "c2", icon: "camping", en: "Travel & Camping", title: "여행·캠핑용품 대여", targets: "캐리어·텐트·캠핑 장비", customer: "개인·가족·여행자", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)" },
        { n: "05", c: "c2", icon: "fashion", en: "Fashion & Events", title: "패션·행사용품 대여", targets: "의류·가방·액세서리·행사 소품", customer: "개인·행사 기획자·촬영팀", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)", consider: "진위·위생·세탁·훼손 책임" },
        { n: "08", c: "c2", icon: "sports", en: "Sports & Leisure", title: "스포츠·레저용품 대여", targets: "자전거 장비·스키·보드·운동용품", customer: "개인·동호회·레저 업체", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)", consider: "안전 상태·보호장비" },
        { n: "06", c: "c3", icon: "space", en: "Space Rental", title: "공간 대여", targets: "회의실·스튜디오·작업실·파티룸", customer: "공간 운영자·개인·기업", revenue: "완료된 공간 대여의 플랫폼 수수료(요율 미정)", consider: "소방·안전·영업 규정, 운영자 권한. 첫 출시의 중심 영역" },
        { n: "07", c: "c3", icon: "mobility", en: "Vehicle & Mobility", title: "차량·이동수단 대여", targets: "자동차·자전거·이동 장비", customer: "적격 이동수단 사업자·개인", revenue: "대여 거래 수수료·사업자 계약", consider: "적격 사업자 연계만, 개인 간 무허가 차량 유상 대여 불가" },
        { n: "09", c: "c4", icon: "pro", en: "Industrial & Professional", title: "산업·전문 장비 대여", targets: "산업장비·측정장비·업무용 장비", customer: "기업·적격 사업자", revenue: "대여 거래 수수료·기업 계약", consider: "사용 자격·안전교육·보험·운송" },
        { n: "10", c: "c4", icon: "office", en: "Office & Business", title: "사무·비즈니스 장비 대여", targets: "사무기기·행사 장비·기업용 설비", customer: "기업·기관", revenue: "기업 계약·반복 거래" },
        { n: "11", c: "c5", icon: "local", en: "Local Sharing", title: "지역 기반 공유", targets: "근거리 물품 대여·지역 자원 활용", customer: "지역 주민·지역 대여 사업자", revenue: "완료된 대여 거래의 플랫폼 수수료(요율 미정)" },
        { n: "12", c: "c5", icon: "corporate", en: "Corporate Asset Sharing", title: "기업 자산 공유", targets: "기업 간 유휴 장비·공간", customer: "기업·개인 사업자", revenue: "기업 계약·거래 수수료" },
        { n: "13", c: "c6", icon: "saas", en: "SHAREON Business SaaS", title: "기업 운영 SaaS", targets: "대여·예약·재고·고객·정산 운영", customer: "대여업체·공간 운영자·기업", revenue: "월·연 구독(가격 미정)", consider: "외주 개발이 아닌 자체 표준 솔루션. 기본 등록·거래에는 구독이 필요하지 않음" },
        { n: "14", c: "c6", icon: "global", en: "Public & Global Sharing", title: "공공·글로벌 공유", targets: "공공 자원 공유·해외 확장·라이선스", customer: "지자체·공공기관·해외 파트너", revenue: "기관 계약·라이선스" },
      ],
    },
    revenue: {
      kicker: "REVENUE MODEL",
      title: "여섯 개의 수익 축.",
      lead: "SHAREON의 핵심 수익모델은 실제 플랫폼 거래에서 발생하는 수수료입니다. 수수료율과 가격은 확정되지 않아 표시하지 않으며, 기본 등록과 거래는 구독 없이도 이용할 수 있는 구조를 원칙으로 합니다.",
      head: { n: "", name: "수익원", target: "대상", model: "수익 방식" },
      rows: [
        { n: "01", name: "플랫폼 거래 수수료", target: "개인·기업", model: "핵심 수익모델. 실제 완료된 적격 대여·공간 거래에 대한 플랫폼 수수료이며, 요율은 확정되지 않았습니다." },
        { n: "02", name: "기업용 SaaS 구독", target: "대여업체·기업", model: "운영 도구의 월·연 구독. 장기 사업 방향이며 출시된 제품은 없습니다." },
        { n: "03", name: "적격 부가서비스", target: "개인·기업", model: "선택형 고급 등록·관리 기능 같은 부가서비스. 기본 등록과 거래는 구독 없이 이용합니다." },
        { n: "04", name: "광고·프로모션", target: "대여업체·브랜드", model: "유료 노출·광고. 항상 광고로 표시하며, 계약하지 않은 업체를 파트너로 노출하지 않습니다." },
        { n: "05", name: "기업 거래관리·제휴", target: "기업", model: "대량·장기 대여, 기업 거래관리 솔루션과 적격 자산 관련 제휴 계약을 검토합니다." },
        { n: "06", name: "글로벌 플랫폼·라이선싱", target: "기관·해외 파트너", model: "공공 공유 사업 계약과 국가별 플랫폼·라이선스를 장기 방향으로 검토합니다." },
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
      cta: "도입 문의하기",
    },
    roadmap: {
      kicker: "EXECUTION ROADMAP",
      title: "카테고리보다,\n거래가 먼저입니다.",
      lead: "카테고리 수를 빠르게 늘리기보다, 특정 지역·카테고리에서 충분한 대여 물품과 이용자를 먼저 확보합니다.",
      steps: [
        { n: "01", title: "실물 자산 대여 마켓플레이스 기반", tag: "최우선", body: "개인·기업 등록, 물품 검색, 대여 요청, 채팅, 마이페이지, 기본 거래 흐름 안정화. 첫 출시는 대여·공간·서비스 중심, 승인형 예약부터 준비합니다." },
        { n: "02", title: "안전한 대여 거래·거래 지원", body: "결제·보증금·반납·상태 확인·후기·분쟁 정책 검증. 결제·보증금은 결제대행사의 보증금 방식이 확정된 뒤에만 운영합니다." },
        { n: "03", title: "카테고리·지역 확대", body: "생활용품·전자기기·카메라·캠핑·공간 등 수요가 높은 카테고리부터 확대. 지역과 카테고리를 좁혀 공급과 이용자를 먼저 확보합니다." },
        { n: "04", title: "개인·기업 거래 확대", body: "전문 대여업체 입점, 기업 자산 공유, 대량·장기 대여 같은 기업 거래 기능을 준비합니다." },
        { n: "05", title: "기업 SaaS 고도화·글로벌 확장", body: "대여업체 운영 솔루션, 공공 공유 사업, 국가별 제도에 맞춘 현지화·라이선스. 장기 사업 방향입니다." },
      ],
      now: "현재 위치: 1단계를 앱에서 시범 개발 중입니다.",
    },
    excluded: {
      kicker: "FOCUS",
      title: "공유·대여에 집중합니다.",
      lead: "처음 검토한 20개 영역 가운데 공유·대여와 거리가 먼 6개 영역은 SHAREON의 핵심 사업에서 덜어 냈습니다. 중고 물품 판매는 핵심 사업이 아니며, 일반 인력·용역 매칭 플랫폼이나 단순 기업 예약 연결 서비스도 지향하지 않습니다. 기존 앱 기능을 지우는 결정이 아니라, 사업의 중심을 실물 자산 공유·대여로 정한 것입니다.",
      points: [
        { n: "01", title: "실물 자산 공유·대여 오픈 마켓플레이스", body: "개인과 기업이 직접 입점해 물건·장비·공간을 빌려주고 빌리는 공유·대여 전문 마켓플레이스. 기업별 개별 제휴를 전제로 하지 않습니다." },
        { n: "02", title: "기업용 대여 운영 SaaS", body: "대여업체와 기업이 예약·재고·고객·정산을 관리하는 자체 표준 솔루션." },
        { n: "03", title: "작게 시작해 깊게", body: "양면 마켓플레이스이므로 특정 지역과 카테고리에서 공급과 이용자를 먼저 확보한 뒤 넓혀 갑니다." },
      ],
    },
    next: {
      kicker: "NEXT STEP",
      title: "자산을 소유하는 방식에서,\n활용하는 방식으로.",
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
      title: "자산의 새로운 가치를\n함께 만들어갑니다.",
      lead: "SHAREON은 개인과 기업이 보유한 자산을 더 효율적으로 활용할 수 있도록 다양한 사업자, 기술 기업과 기관의 참여를 지향합니다.",
      ctaMain: "파트너십 문의하기",
      ctaSub: "비즈니스 살펴보기",
    },
    open: {
      kicker: "OPEN MARKETPLACE",
      title: "제휴 계약 없이도,\n직접 등록하고 거래합니다.",
      lead: "SHAREON은 개별 기업 제휴 계약이 있어야만 거래할 수 있는 폐쇄형 플랫폼이 아닙니다. 적격 개인·기업이 직접 입점해 거래하는 오픈 마켓플레이스가 핵심이며, 일반 입점과 별도 파트너십 계약은 서로 다른 경로입니다.",
      points: [
        { n: "01", title: "일반 입점·거래 참여", body: "개인·기업 모두 별도 제휴 계약이나 구독 없이 직접 가입해 실물 자산을 등록하고 거래합니다. 품목별 자격·안전 기준을 확인하며, 차량·전문 장비처럼 법적 요건이 있는 품목은 적격 사업자만 다룹니다." },
        { n: "02", title: "기업용 플랫폼 솔루션", body: "대여업체·기업의 자산 활용과 거래 운영을 돕는 표준화된 SHAREON Business SaaS 도입 검토입니다. 현재 출시된 제품은 없습니다." },
        { n: "03", title: "전략적 사업 제휴", body: "기업 자산 활용, 공공 공유 사업처럼 별도 계약이 의미 있는 협력입니다. 계약 전에는 파트너로 표시하지 않습니다." },
        { n: "04", title: "기술·결제·보호 인프라 협력", body: "결제·정산·보험·물류 등 적격 사업자와의 거래 인프라 협력입니다. 결제·보증금은 결제대행사의 보증금 방식이 확정된 뒤에만 운영합니다." },
        { n: "05", title: "글로벌 확장 협력", body: "국가별 제도와 공유경제 시장에 맞춘 협력으로, 현지 법령과 라이선스 조건을 함께 확인합니다. 광고·유료 노출은 항상 광고로 표시하며, 계약하지 않은 업체를 파트너로 노출하지 않습니다." },
      ],
    },
    notice: "현재 SHAREON과 계약을 맺은 파트너사는 없습니다. 아래는 협력을 제안받고자 하는 유형이며, 특정 업체를 나타내지 않습니다.",
    types: {
      kicker: "14 PARTNER TYPES",
      title: "함께할 수 있는\n열네 가지 방법.",
      labels: { collab: "협력 내용", value: "SHAREON이 제공하려는 가치", terms: "확인 조건", route: "참여 경로" },
      items: [
        { n: "01", icon: "everyday", title: "생활용품 대여업체", collab: "생활 장비 대여", value: "새로운 고객 접점과 대여 관리", terms: "구성품·사용 안내 기준", route: "직접 입점·거래" },
        { n: "02", icon: "electronics", title: "전자기기 대여업체", collab: "IT 기기 대여", value: "단기 이용 수요 연결", terms: "기기 초기화·상태 검수 절차", route: "직접 입점·거래" },
        { n: "03", icon: "camera", title: "촬영장비 대여업체", collab: "카메라·영상 장비", value: "크리에이터·제작사 수요 연결", terms: "장비 상태 고지·파손 기준", route: "직접 입점·거래" },
        { n: "04", icon: "camping", title: "캠핑·여행 장비 업체", collab: "여행 장비 대여", value: "계절 장비의 활용도 향상", terms: "세척·위생 상태 기준", route: "직접 입점·거래" },
        { n: "05", icon: "fashion", title: "의류·행사용품 업체", collab: "패션·행사 대여", value: "행사·촬영 수요 연결", terms: "진위·위생·세탁 책임", route: "직접 입점·거래" },
        { n: "06", icon: "space", title: "공간 운영자", collab: "스튜디오·회의실", value: "비어 있는 시간의 활용", terms: "공간 사용 권한·안전 규정", route: "직접 입점·거래" },
        { n: "07", icon: "mobility", title: "적격 이동수단 사업자", collab: "차량·이동수단", value: "적법한 이동수단 대여 연계", terms: "관련 법령상 사업 자격", route: "적격 사업자 확인 후 입점" },
        { n: "08", icon: "sports", title: "스포츠·레저 업체", collab: "스포츠 장비", value: "시즌·지역 수요 연결", terms: "안전 상태·보호장비 기준", route: "직접 입점·거래" },
        { n: "09", icon: "pro", title: "산업·전문 장비 업체", collab: "산업 장비", value: "기업 고객의 단기 수요 연결", terms: "사용 자격·안전교육·보험", route: "적격 사업자 확인 후 입점" },
        { n: "10", icon: "office", title: "사무·기업 장비 업체", collab: "업무용 장비", value: "기업 반복 거래·장기 계약", terms: "기업 계약 조건", route: "직접 입점 · 기업 거래 협의" },
        { n: "11", icon: "corporate", title: "기업 자산 담당자", collab: "유휴 자산 활용", value: "유휴 자산의 수익화와 비용 절감", terms: "내부 승인·자산 관리 기준", route: "직접 입점 · 전략적 제휴" },
        { n: "12", icon: "payment", title: "결제·보험·물류 파트너", collab: "거래 인프라", value: "공유·대여에 맞는 거래 인프라 수요", terms: "관련 법령·계약 기준 충족", route: "인프라 협력(별도 계약)" },
        { n: "13", icon: "public", title: "지자체·공공기관", collab: "공공 공유 사업", value: "공공 자원의 활용도 향상", terms: "기관별 조달·계약 절차", route: "기관 협력(조달·계약 절차)" },
        { n: "14", icon: "global", title: "글로벌·기술 파트너", collab: "해외·SaaS", value: "검증된 공유·대여 운영 모델", terms: "현지 법령·라이선스 조건", route: "글로벌·기술 협력(별도 계약)" },
      ],
    },
    process: {
      kicker: "PARTNERSHIP PROCESS",
      title: "협력 절차.",
      lead: "일반 입점은 앱에서 직접 가입하는 것으로 충분하며 이 절차가 필요하지 않습니다. 아래는 전략적 제휴·인프라·기관·글로벌 협력 절차이며, 검토 결과와 일정은 제안 내용에 따라 달라집니다.",
      steps: [
        { n: "01", title: "제안 접수", body: "협력 내용과 보유 자원, 원하는 역할을 문의 양식으로 알려 주세요." },
        { n: "02", title: "사업 적합성 검토", body: "사업·법률·운영 조건과 품목별 자격을 확인합니다." },
        { n: "03", title: "협력 범위 협의", body: "역할과 책임, 운영 조건을 함께 정합니다." },
        { n: "04", title: "조건·계약 검토", body: "필요한 경우 계약을 맺습니다. 계약 전에는 파트너로 표시하지 않습니다." },
        { n: "05", title: "협력 진행", body: "작은 지역·카테고리부터 단계적으로 협력을 시작합니다." },
      ],
    },
    next: {
      kicker: "PARTNERSHIP",
      title: "SHAREON과 함께 자산 활용의\n새로운 가능성을 만들어갑니다.",
      ctas: ["파트너십 문의하기", "문의 유형 살펴보기"],
    },
  },

  /* ─────────────── 05 Contact ─────────────── */
  contact: {
    seoTitle: "SHAREON 문의 | 앱·거래·기업·제휴 문의 — Newon",
    seoDescription:
      "SHAREON 앱 이용, 개인·기업 대여와 등록, 공간·전문 장비, 결제·보증금, 반납·분쟁, 기업 SaaS, 공공기관·기술·글로벌 협력 문의를 NEWON 공식 문의 경로로 받습니다.",
    hero: {
      kicker: "SHAREON / CONTACT",
      title: "SHAREON과 새로운 가능성을\n이야기해 주세요.",
      lead: "플랫폼 이용 문의부터 개인·기업 입점, 자산 대여, 거래 인프라, 기업 솔루션과 글로벌 사업 제안까지. SHAREON에 관한 문의를 NEWON 공식 경로로 받습니다.",
      ctaMain: "문의 양식 열기",
      ctaSub: "이메일 보내기",
    },
    kicker: "INQUIRY TYPES",
    title: "문의 유형을\n선택해 주세요.",
    lead: "01–06은 앱 이용과 개인·기업 입점·대여 같은 이용·거래 문의, 07–10은 거래 인프라·기업 솔루션·기관·전략 제휴 같은 사업·파트너십 문의입니다. 각 유형은 NEWON 공식 문의 양식이나 공식 이메일로 연결되며, 회원가입은 필요하지 않습니다.",
    groups: { trade: "이용·거래", partner: "사업·파트너십" },
    formCta: "문의 양식",
    mailCta: "이메일",
    mailSubjectPrefix: "[SHAREON]",
    items: [
      { n: "01", g: "trade", icon: "app", title: "앱 이용", body: "앱 이용과 기술 관련 질문. 앱은 아직 앱스토어에 출시되지 않았습니다.", slug: "app" },
      { n: "02", g: "trade", icon: "everyday", title: "개인 자산 등록·대여", body: "개인으로 자산을 빌려주거나 빌리는 방법. 기본 등록은 구독 없이 이용하는 구조를 원칙으로 합니다.", slug: "personal" },
      { n: "03", g: "trade", icon: "corporate", title: "기업 입점·대여", body: "대여업체·기업의 자산 등록과 거래. 별도 제휴 계약 없이 직접 가입해 등록하는 구조입니다.", slug: "business" },
      { n: "04", g: "trade", icon: "space", title: "공간 대여", body: "공간 운영자 참여와 공간 대여, 공간 이용과 함께 제공하는 부대 서비스 등록. 첫 출시의 중심 영역입니다.", slug: "space" },
      { n: "05", g: "trade", icon: "pro", title: "전문 장비", body: "산업·촬영·사무 등 전문 장비 대여. 사용 자격·안전교육·보험 조건을 함께 검토합니다.", slug: "pro-equipment" },
      { n: "06", g: "trade", icon: "return", title: "반납·분쟁", body: "반납·상태 검수·분쟁 기준에 관한 의견. 기준은 법률 검토 후 약관과 함께 확정합니다.", slug: "returns" },
      { n: "07", g: "partner", icon: "payment", title: "결제·정산·보증금 인프라", body: "결제·정산·보증금 구조에 관한 적격 사업자 협력과 의견. 결제·보증금은 아직 운영되지 않습니다.", slug: "payments" },
      { n: "08", g: "partner", icon: "saas", title: "기업 솔루션·SaaS", body: "SHAREON Business SaaS와 기업 자산 활용 솔루션 도입 검토. 장기 사업 방향이며 출시된 제품은 없습니다.", slug: "saas" },
      { n: "09", g: "partner", icon: "public", title: "공공기관", body: "지자체·공공기관의 공유 사업 협력. 기관별 조달·계약 절차에 따라 검토합니다.", slug: "public" },
      { n: "10", g: "partner", icon: "global", title: "전략·기술·글로벌 제휴", body: "전략적 사업 제휴, 기술 협력, 해외 진출·라이선스. 현지 법령과 라이선스 조건을 함께 확인합니다.", slug: "global" },
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
  statusLabel: "Notice",
  statusNote:
    "Building on physical-asset sharing and rental, SHAREON is preparing to expand into trades between people and businesses, business solutions and many kinds of asset use. Some of the businesses and features introduced here are part of future development or operating plans; before the app launches, real rentals, booking confirmation, payment, deposits and settlement are not operating.",
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
    seoTitle: "SHAREON | Newon — Asset Sharing & Rental Marketplace",
    seoDescription:
      "SHAREON aims to be an open sharing and rental marketplace where people and businesses list physical assets — things, equipment and spaces — and rent them to those who need them. The app has not launched; real rentals and payments are not operating yet.",
    hero: {
      kicker: "SHAREON — ASSET SHARING & RENTAL MARKETPLACE",
      title: "No need to own it.\nJust when you need it.",
      lead: "A way to use what you need sensibly, and to add new value to assets you are not using. SHAREON aims to be an open marketplace that connects people and businesses to share and rent physical assets.",
      ctaMain: "Explore the platform",
      ctaSub: "Discover SHAREON",
    },
    vision: {
      kicker: "ABOUT SHAREON · OUR MISSION",
      title: "You don’t need\nto own everything.",
      lead: "Some things are needed for a single day; some equipment only for one project. Meanwhile, someone else has assets that sit unused for a long time. SHAREON connects the people who need things with the people who own them to create new ways to use them, aiming for an asset sharing and rental ecosystem that people and businesses join together. An asset grows in value the more it is used.",
      points: [
        { n: "01", title: "Access — when you need it", body: "Find and use things you rarely need but would hesitate to buy, right when you need them. Camping and production gear, used only now and then, are typical examples." },
        { n: "02", title: "Sharing — new uses for assets", body: "Things, equipment and spaces that sit idle for long periods are shared with others, so owned assets are used again." },
        { n: "03", title: "Flexibility — only for as long as needed", body: "Rent for just the period you need instead of buying; providers set their own rental terms and availability." },
        { n: "04", title: "Trust — rentals you can rely on", body: "A structure in which every rental, from listing to return, ends safely is designed first. The first launch centres on rentals and spaces, and is being prepared with approval-based booking, where the provider reviews and accepts each request." },
        { n: "05", title: "Efficiency — better use of assets", body: "From people’s idle items to companies’ equipment and spaces, the aim is to raise the utilisation of assets that already exist." },
        { n: "06", title: "Sustainability — consuming sustainably", body: "Circulating resources that already exist instead of buying new, for a way of living that owns less and uses more widely." },
      ],
    },
    share: {
      kicker: "WHAT WE SHARE",
      title: "From things to spaces and mobility.",
      lead: "The four kinds of physical assets SHAREON is considering for sharing and rental. Services are considered for listing only when offered together with a space or equipment rental; general labour or service matching is not SHAREON’s business.",
      items: [
        { icon: "everyday", en: "Things", title: "Things", body: "Household goods, electronics, travel, camping, fashion and event items — things you need only now and then, borrowed for as long as you need them.", chips: ["Household goods", "Electronics", "Camping gear", "Event items"] },
        { icon: "camera", en: "Equipment", title: "Equipment", body: "From cameras and production gear to industrial and office equipment. Professional gear comes with condition disclosure, qualifications and safety rules.", chips: ["Production gear", "Sports gear", "Professional gear", "Office equipment"] },
        { icon: "space", en: "Spaces", title: "Spaces", body: "Meeting rooms, studios, practice rooms, workshops and exhibition spaces. A focus area for the first launch, including services offered with a space.", chips: ["Meeting rooms", "Studios", "Workshops", "Party rooms"] },
        { icon: "mobility", en: "Mobility", title: "Mobility", body: "Bicycles and mobility gear. Cars are strictly regulated, so only qualified operators are considered, as a long-term direction.", chips: ["Bicycles", "Mobility gear", "Licensed operators’ vehicles"] },
      ],
    },
    how: {
      kicker: "HOW SHAREON WORKS",
      title: "Connecting people who own assets\nwith people who need them.",
      lead: "The rental flow SHAREON is aiming for — discover, list, connect, rent and return. The app has not launched; payment, deposits, settlement and disputes will be operated step by step, after payment-provider agreements and responsibility and refund rules are designed.",
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
      kicker: "MARKETPLACE NETWORK",
      title: "A marketplace where people\nand businesses connect freely.",
      lead: "People and businesses are meant to sign up directly, without a separate partnership contract, and be both providers and renters. The four below are trade structures from provider to renter; they do not mean all are operating. Trades involving a business open only after business verification.",
      items: [
        { n: "01", en: "C2C", title: "Person → person", body: "People lend their things or equipment to other people, mostly nearby between neighbours." },
        { n: "02", en: "B2C", title: "Business → person", body: "Businesses rent equipment, spaces and items to people. Rental companies and space operators list directly." },
        { n: "03", en: "C2B", title: "Person → business", body: "Businesses rent equipment or items owned by people for work, events or projects. Not a wanted-ads board: the person is the provider." },
        { n: "04", en: "B2B", title: "Business → business", body: "Companies rent qualified assets such as equipment, items and facilities to each other, making better use of idle assets." },
        { n: "05", en: "For Individuals", title: "A new option for individuals", body: "Use what you need for a set period, and put the assets you own to use by renting them out. Basic listing and renting are meant to work without a subscription." },
        { n: "06", en: "For Businesses", title: "A new option for businesses", body: "Raise the utilisation of owned equipment and items, and secure the assets you need flexibly. Rental companies also join directly, without a separate partnership." },
      ],
    },
    trust: {
      kicker: "TRUST & RESPONSIBILITY",
      title: "Sharing starts\nwith trust.",
      lead: "A rental only ends when the item comes back. SHAREON designs responsibilities and procedures, qualified trades and legal compliance before screens.",
      items: [
        { n: "01", title: "Accurate asset information", body: "Alongside the listing, recording condition and parts at pickup and return, as the reference for the return inspection, is being prepared." },
        { n: "02", title: "Clear rental terms", body: "Rental period and terms are confirmed before a rental. Deposits are kept apart from revenue; with no own escrow, they operate only after a payment provider’s deposit method is confirmed and legal review is done." },
        { n: "03", title: "Checks on both parties", body: "Identity, business registration and item-specific qualifications, with separate rules for items such as vehicles and professional equipment." },
        { n: "04", title: "Dispute principles", body: "Rules and procedures for damage, loss and late returns, fixed with the terms of use after legal review." },
        { n: "05", title: "Privacy", body: "Exact addresses are not shown before a rental; location data is removed from photos when they are added." },
      ],
      note: "Deposit holding, insurance and compensation are not offered today, and no protection or compensation is promised.",
    },
    eco: {
      kicker: "BEYOND RENTAL",
      title: "Beyond simple rental,\ntoward an ecosystem of asset use.",
      lead: "Centred on physical-asset rental, SHAREON is preparing — as a long-term direction — to expand into more asset categories, transaction support, business solutions and global sharing-economy markets. Business solutions are SHAREON’s own standard products, not custom builds.",
      items: [
        { n: "01", title: "Rental companies and businesses join", body: "Professional rental companies and businesses list and trade directly, without a separate partnership contract." },
        { n: "02", title: "Business asset use", body: "Unused equipment and spaces are shared with people and businesses, making better use of idle assets." },
        { n: "03", title: "Transaction support and business SaaS", body: "Booking, inventory, CRM and settlement tools and transaction support. No product has been released." },
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
      title: "A world that owns less\nand uses more widely.",
      lead: "SHAREON aims to grow into an open physical-asset sharing and rental marketplace that people and businesses join directly, together with operating SaaS for rental businesses.",
      ctas: ["Explore the platform", "Discover the business", "Contact us"],
    },
  },

  platform: {
    seoTitle: "SHAREON Platform | Renting things, equipment, spaces and mobility — Newon",
    seoDescription:
      "Household goods, electronics, production gear, camping, fashion and events, spaces, mobility, sports, professional and office equipment, local and corporate sharing, and the rental system. SHAREON’s 18 service areas.",
    hero: {
      kicker: "SHAREON / PLATFORM",
      title: "Find the assets you need,\nconnect the value of what you own.",
      lead: "SHAREON aims to be a sharing and rental marketplace where people and businesses list physical assets and rent them for the period needed. The eighteen service areas in preparation, and the rental system that lets each rental end safely.",
      ctaMain: "See the business",
      ctaSub: "Contact us",
    },
    next: {
      kicker: "NEXT STEP",
      title: "A connection at the right moment\nbecomes new value for an asset.",
      lead: "Real listing, discovery, rental requests and chat are meant to be in the SHAREON app; the website only introduces and guides.",
    },
    indexTitle: "All 18 services at a glance",
    groups: [
      { id: "a", kicker: "A · THINGS", title: "Everyday and personal items", lead: "Things you rarely use but would hesitate to buy." },
      { id: "b", kicker: "B · SPACE, MOBILITY & PRO", title: "Spaces, mobility and professional gear", lead: "Areas that also need rules, qualifications and safety checks." },
      { id: "c", kicker: "C · SHARED RESOURCES", title: "Shared resources", lead: "Connecting idle resources nearby and inside companies." },
      { id: "d", kicker: "D · RENTAL SYSTEM", title: "The rental system", lead: "Asset discovery and listing, rental requests and chat between providers and renters, returns and trust. SHAREON aims to be a platform where rentals complete safely, not a list of products. Payment, settlement, deposits, transaction protection and insurance links are future infrastructure, described as they actually stand." },
      { id: "e", kicker: "E · ACCESS", title: "App and accessibility", lead: "" },
    ],
    services: [
      { n: "01", g: "a", icon: "everyday", en: "Everyday Rental", title: "Everyday rental", body: "Borrow household equipment you would hesitate to buy, just for the days you need it — for occasional jobs such as moving, deep cleaning or home repairs.", chips: ["Cleaning gear", "Tools", "Pressure washers", "Ladders", "Appliances", "Moving tools"], consider: "Basic usage notes and a parts check are needed." },
      { n: "02", g: "a", icon: "electronics", en: "Electronics", title: "Electronics rental", body: "Use costly devices — laptops, tablets, projectors, monitors, consoles — for a short time, such as a business trip, an event or a trial.", chips: ["Laptops", "Tablets", "Projectors", "Monitors", "Consoles"], consider: "Because of damage, loss and data-leak risks, device reset, condition checks and handover steps are needed." },
      { n: "03", g: "a", icon: "camera", en: "Camera & Production", title: "Camera and production gear", body: "Shooting equipment for individual creators, small studios and companies. Businesses renting gear owned by individuals (C2B) is also being considered.", chips: ["Cameras", "Lenses", "Lighting", "Tripods", "Microphones", "Video gear"], consider: "Equipment condition disclosure and agreed damage rules." },
      { n: "04", g: "a", icon: "camping", en: "Travel & Camping", title: "Travel and camping gear", body: "Borrow gear for a trip or a camp. MY WORLD handles travel planning and booking; SHAREON focuses on gear rental.", chips: ["Suitcases", "Tents", "Camping chairs", "Tables", "Sleeping bags", "Travel accessories"], consider: "Seasonal demand, and cleaning and drying checks." },
      { n: "05", g: "a", icon: "fashion", en: "Fashion & Events", title: "Fashion and event items", body: "Borrow outfits and props for an event or a shoot. The plan is to start with items for which hygiene and authenticity rules are in place.", chips: ["Event wear", "Costumes", "Bags", "Accessories", "Party props"], consider: "Authenticity of branded items, hygiene and cleaning, damage responsibility and whether an item may be rented." },
      { n: "06", g: "b", icon: "space", en: "Space Rental", title: "Space rental", body: "Meeting rooms, studios, practice rooms, workshops, party rooms and exhibition spaces — by the hour, day or longer. A focus area for the first launch; listing ancillary services that operators offer with the use of a space is also being considered. General labour or service matching is not covered.", chips: ["Meeting rooms", "Photo studios", "Practice rooms", "Workshops", "Party rooms", "Exhibition spaces"], consider: "Permitted use, fire, safety and business rules, and the operator’s rights (including lease and sublease). Lodging and parking are not covered until lawful conditions are confirmed." },
      { n: "07", g: "b", icon: "mobility", en: "Mobility", title: "Vehicles and mobility", body: "Considering rental of bicycles, e-mobility and other mobility resources.", chips: ["Bicycles", "E-mobility", "Mobility gear", "Licensed operators’ vehicles"], consider: "Paid car rental and some mobility are strictly regulated. At first only qualified operators are considered; unlicensed paid car rental between individuals is not allowed." },
      { n: "08", g: "b", icon: "sports", en: "Sports & Leisure", title: "Sports and leisure gear", body: "Skis, snowboards, golf, fitness and outdoor equipment — gear needed for a season, used without buying it.", chips: ["Skis", "Snowboards", "Golf gear", "Fitness gear", "Outdoor gear"], consider: "Safety condition, protective gear, terms of use and damage responsibility matter." },
      { n: "09", g: "b", icon: "pro", en: "Professional Equipment", title: "Industrial and professional equipment", body: "Specialist equipment for construction, manufacturing, shooting, measurement, research and field work — for companies and qualified operators.", chips: ["Industrial equipment", "Measuring tools", "Research equipment", "Field equipment"], consider: "Operator qualifications, safety training, maintenance, insurance and transport." },
      { n: "10", g: "b", icon: "office", en: "Business Equipment", title: "Office and business equipment", body: "Printers, copiers, projectors, meeting and event equipment, office furniture and business IT. Repeat and long-term rental for companies is a long-term direction.", chips: ["Copiers", "Projectors", "Meeting gear", "Event gear", "Office furniture", "IT equipment"], consider: "Designed together with repeat business and long-term contract terms." },
      { n: "11", g: "c", icon: "local", en: "Local Sharing", title: "Local sharing", body: "Share unused items and gear with neighbours: list them yourself, find things nearby and hand them over safely.", chips: ["Nearby rental", "Neighbourhood resources", "Local rental businesses", "Safe handover"], consider: "Exact addresses are not shown before a rental; a safe handover method is provided." },
      { n: "12", g: "c", icon: "corporate", en: "Corporate Sharing", title: "Corporate asset sharing", body: "Companies rent idle equipment and spaces to other companies or sole traders, putting unused assets to better use.", chips: ["Idle equipment", "Idle spaces", "Long-term B2B rental", "Better utilisation"], consider: "Internal approval and asset management rules." },
      { n: "13", g: "d", icon: "search", en: "Listings & Discovery", title: "Listing and discovery", body: "People and businesses list physical assets with photos, rental terms and availability; renters find them through categories, search, location-based discovery and asset details. Basic listing is meant to work without a subscription.", chips: ["Asset listing", "Photos", "Rental terms", "Categories and search", "Location-based discovery"], consider: "Location data is removed from photos when they are added." },
      { n: "14", g: "d", icon: "calendar", en: "Booking & Rental", title: "Booking and rental", body: "Check availability and conditions and send a booking request; dates and terms are agreed in chat between provider and renter. The first launch is being prepared with approval-based booking, where the provider reviews and accepts each request; instant booking will be considered later.", chips: ["Available dates", "Booking requests", "Approval-based booking", "Chat and scheduling", "Notifications"], consider: "Booking-request and chat screens are being built in the app; booking confirmation is not operating yet." },
      { n: "15", g: "d", icon: "payment", en: "Payments & Deposits", title: "Payments and deposits", body: "Preparing to handle rental payments and deposits through a qualified payment provider. SHAREON will not build its own escrow to hold funds, and payments and deposits will not operate until the provider’s deposit method is confirmed.", chips: ["Rental payment", "Deposits", "Refund rules", "Settlement"], consider: "Operated only after the payment-provider agreement, party responsibilities, refund rules and damages are designed together. Deposits are kept apart from platform revenue." },
      { n: "16", g: "d", icon: "return", en: "Returns & Disputes", title: "Returns and disputes", body: "Inspect the condition at return, and handle damage, loss and late returns by set procedures, using the photos and parts recorded at pickup as the reference.", chips: ["Condition inspection", "Parts check", "Damage and loss rules", "Late returns", "Disputes"], consider: "Rules will be fixed with the terms of use after legal review." },
      { n: "17", g: "d", icon: "trust", en: "Trust & Reviews", title: "Trust and reviews", body: "Reviews after a rental, plus reporting and blocking, for a trustworthy place to rent. Ads and paid placement are always labelled as ads.", chips: ["User checks", "Business checks", "Reviews", "Reporting and blocking"], consider: "Reporting is being built in the app; reviews start once real rentals do." },
      { n: "18", g: "e", icon: "app", en: "App & Accessibility", title: "App and accessibility", body: "SHAREON is being prepared as an iOS and Android app with five tabs: Home, Explore, List, Chat and My. Real listing, rentals and chat will be in the app only; the website only introduces and guides.", chips: ["iOS", "Android", "Dark mode", "Large text", "Screen readers"], consider: "Not in the app stores yet, so there is no download link." },
    ],
  },

  business: {
    seoTitle: "SHAREON Business | 14 businesses, revenue model, business SaaS — Newon",
    seoDescription:
      "SHAREON’s 14 sharing and rental businesses, six revenue streams, business SaaS and execution stages. Fees and prices are not decided; the calculation is a hypothetical example.",
    hero: {
      kicker: "SHAREON / BUSINESS",
      title: "From an ownership-centred market\nto a usage-centred economy.",
      lead: "Built on physical-asset sharing and rental between people and businesses, SHAREON aims to be a platform that expands into more asset categories, transaction support, business solutions and a global sharing-economy ecosystem. From the 20 areas first considered, the six furthest from sharing and rental were set aside, leaving 14 core businesses.",
      ctaMain: "See partnerships",
      ctaSub: "Business inquiry",
    },
    structure: {
      kicker: "BUSINESS STRUCTURE",
      title: "Everyone a provider,\neveryone a renter.",
      lead: "C2C, B2C, C2B and B2B are four trade structures from provider to renter — the direction SHAREON is aiming for. They do not mean all are operating; trades involving a business open only after business verification.",
    },
    core: {
      kicker: "14 CORE BUSINESSES",
      title: "14 core businesses,\nsix categories.",
      lead: "The 14 core businesses already decided, arranged in six categories. Choose a category to see what is rented, who the customers are and how each business earns; for areas with legal requirements, such as vehicles, professional equipment and spaces, whether they can operate is checked first.",
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
        { n: "01", c: "c1", icon: "everyday", en: "Everyday Rental", title: "Everyday rental", targets: "Cleaners, tools, appliances, moving and repair equipment", customer: "Individuals, households, small businesses, local rental companies", revenue: "Platform fee on completed rentals (rate not decided)" },
        { n: "02", c: "c1", icon: "electronics", en: "Electronics Rental", title: "Electronics rental", targets: "Laptops, tablets, projectors, monitors", customer: "Individuals, businesses", revenue: "Platform fee on completed rentals (rate not decided)", consider: "Device reset, deposit, condition check, handover" },
        { n: "03", c: "c2", icon: "camera", en: "Camera & Production", title: "Camera and production gear", targets: "Cameras, lenses, lighting, microphones", customer: "Creators, small studios, companies", revenue: "Platform fee on completed rentals (rate not decided)" },
        { n: "04", c: "c2", icon: "camping", en: "Travel & Camping", title: "Travel and camping gear", targets: "Suitcases, tents, camping gear", customer: "Individuals, families, travellers", revenue: "Platform fee on completed rentals (rate not decided)" },
        { n: "05", c: "c2", icon: "fashion", en: "Fashion & Events", title: "Fashion and event items", targets: "Clothing, bags, accessories, event props", customer: "Individuals, event planners, shoot teams", revenue: "Platform fee on completed rentals (rate not decided)", consider: "Authenticity, hygiene, cleaning, damage responsibility" },
        { n: "08", c: "c2", icon: "sports", en: "Sports & Leisure", title: "Sports and leisure gear", targets: "Bike gear, skis, boards, fitness gear", customer: "Individuals, clubs, leisure businesses", revenue: "Platform fee on completed rentals (rate not decided)", consider: "Safety condition, protective gear" },
        { n: "06", c: "c3", icon: "space", en: "Space Rental", title: "Space rental", targets: "Meeting rooms, studios, workshops, party rooms", customer: "Space operators, individuals, businesses", revenue: "Platform fee on completed space rentals (rate not decided)", consider: "Fire, safety and business rules; operator rights. A focus area for the first launch" },
        { n: "07", c: "c3", icon: "mobility", en: "Vehicle & Mobility", title: "Vehicles and mobility", targets: "Cars, bicycles, mobility gear", customer: "Licensed mobility operators, individuals", revenue: "Rental fee, operator contracts", consider: "Qualified operators only; no unlicensed paid car rental between individuals" },
        { n: "09", c: "c4", icon: "pro", en: "Industrial & Professional", title: "Industrial and professional equipment", targets: "Industrial, measuring and work equipment", customer: "Companies, qualified operators", revenue: "Rental fee, business contracts", consider: "Qualifications, safety training, insurance, transport" },
        { n: "10", c: "c4", icon: "office", en: "Office & Business", title: "Office and business equipment", targets: "Office machines, event gear, business fixtures", customer: "Companies, institutions", revenue: "Business contracts, repeat business" },
        { n: "11", c: "c5", icon: "local", en: "Local Sharing", title: "Local sharing", targets: "Nearby rentals, local resources", customer: "Local residents, local rental businesses", revenue: "Platform fee on completed rentals (rate not decided)" },
        { n: "12", c: "c5", icon: "corporate", en: "Corporate Asset Sharing", title: "Corporate asset sharing", targets: "Idle equipment and spaces between companies", customer: "Companies, sole traders", revenue: "Business contracts, transaction fee" },
        { n: "13", c: "c6", icon: "saas", en: "SHAREON Business SaaS", title: "Business operating SaaS", targets: "Rental, booking, inventory, customer and settlement operations", customer: "Rental companies, space operators, businesses", revenue: "Monthly or annual subscription (price not decided)", consider: "Its own standard product, not custom development. No subscription needed for basic listing and renting" },
        { n: "14", c: "c6", icon: "global", en: "Public & Global Sharing", title: "Public and global sharing", targets: "Public resource sharing, expansion abroad, licensing", customer: "Local governments, public bodies, partners abroad", revenue: "Institutional contracts, licences" },
      ],
    },
    revenue: {
      kicker: "REVENUE MODEL",
      title: "Six revenue streams.",
      lead: "SHAREON’s core revenue model is the fee on real platform transactions. Fee rates and prices are not decided, so none are shown; basic listing and renting are meant to work without a subscription.",
      head: { n: "", name: "Stream", target: "From", model: "How it earns" },
      rows: [
        { n: "01", name: "Platform transaction fee", target: "People, businesses", model: "The core revenue model: a platform fee on real, completed qualified rental and space transactions. The rate is not decided." },
        { n: "02", name: "Business SaaS subscription", target: "Rental companies, businesses", model: "Monthly or annual subscription to operating tools. A long-term direction; no product is released." },
        { n: "03", name: "Qualified add-on services", target: "People, businesses", model: "Add-on services such as optional advanced listing and management tools. Basic listing and renting work without a subscription." },
        { n: "04", name: "Ads and promotion", target: "Rental companies, brands", model: "Paid placement and ads, always labelled as ads. Companies without a signed agreement are never shown as partners." },
        { n: "05", name: "Business trade management and alliances", target: "Companies", model: "Bulk and long-term rental, business trade-management solutions and qualified asset-related alliance contracts, under consideration." },
        { n: "06", name: "Global platform and licensing", target: "Institutions, partners abroad", model: "Public sharing contracts and country-specific platforms and licensing, as a long-term direction." },
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
      cta: "Ask about adoption",
    },
    roadmap: {
      kicker: "EXECUTION ROADMAP",
      title: "Rentals first,\ncategories second.",
      lead: "Rather than adding categories quickly, SHAREON first builds enough items and renters in a specific area and category.",
      steps: [
        { n: "01", title: "Physical-asset rental marketplace base", tag: "First", body: "Registration for people and businesses, search, rental requests, chat, my page and a stable basic flow. The first launch centres on rental, spaces and services, starting with approval-based booking." },
        { n: "02", title: "Safe rentals and transaction support", body: "Validating payment, deposits, returns, condition checks, reviews and dispute policy. Payments and deposits operate only after a payment provider’s deposit method is confirmed." },
        { n: "03", title: "More categories and regions", body: "Expanding from high-demand categories: household goods, electronics, cameras, camping, spaces — first building supply and renters in a narrow area and category." },
        { n: "04", title: "More trades between people and businesses", body: "Preparing professional rental companies joining, corporate asset sharing and business transactions such as bulk and long-term rental." },
        { n: "05", title: "Advanced business SaaS and global expansion", body: "Operating software for rental businesses, public sharing projects, and localisation and licensing fitted to each country’s rules — a long-term direction." },
      ],
      now: "Where it stands: stage 1 is in pilot development in the app.",
    },
    excluded: {
      kicker: "FOCUS",
      title: "Focused on sharing and rental.",
      lead: "Of the 20 areas first considered, the six furthest from sharing and rental were set aside from SHAREON’s core business. Selling used goods is not the core business, and SHAREON is not a general labour or service matching platform, nor a simple business booking service. No app feature is deleted by this; it sets physical-asset sharing and rental as the centre of the business.",
      points: [
        { n: "01", title: "An open physical-asset sharing and rental marketplace", body: "A marketplace dedicated to sharing and rental, where people and businesses join directly to lend and borrow things, equipment and spaces — not built on one-off partnerships with each company." },
        { n: "02", title: "Rental operating SaaS for businesses", body: "SHAREON’s own standard product for rental companies to manage bookings, inventory, customers and settlement." },
        { n: "03", title: "Start small, go deep", body: "As a two-sided marketplace, SHAREON first builds supply and renters in a specific area and category, then widens." },
      ],
    },
    next: {
      kicker: "NEXT STEP",
      title: "From owning assets\nto using them.",
      ctas: ["Explore partnerships", "Business inquiry"],
    },
  },

  partnerships: {
    seoTitle: "SHAREON Partnerships | Rental companies, businesses, public bodies, technology partners — Newon",
    seoDescription:
      "Rental companies, space operators, mobility and professional-equipment operators, payment, insurance and logistics partners, public bodies and global partners. SHAREON’s 14 partner types and process.",
    hero: {
      kicker: "SHAREON / PARTNERSHIPS",
      title: "Creating new value\nfor assets, together.",
      lead: "SHAREON welcomes businesses, technology companies and institutions that help people and businesses use the assets they own more efficiently.",
      ctaMain: "Partnership inquiry",
      ctaSub: "See the business",
    },
    open: {
      kicker: "OPEN MARKETPLACE",
      title: "No partnership contract needed —\nlist and rent directly.",
      lead: "SHAREON is not a closed platform where trading requires a partnership contract with each company. At its core is an open marketplace where qualified people and businesses join and trade directly; ordinary joining and a separate partnership agreement are different routes.",
      points: [
        { n: "01", title: "Joining and trading", body: "People and businesses sign up directly, without a partnership contract or subscription, to list and rent physical assets. Qualifications and safety are checked per item; items with legal requirements, such as vehicles and professional equipment, are handled only by qualified operators." },
        { n: "02", title: "Business platform solutions", body: "Considering the standard SHAREON Business SaaS, which helps rental companies and businesses use assets and run rentals. No product has been released." },
        { n: "03", title: "Strategic business alliances", body: "Collaboration where a separate agreement adds value, such as business asset use or public sharing projects. No one is shown as a partner before signing." },
        { n: "04", title: "Technology, payment and protection infrastructure", body: "Transaction-infrastructure work with qualified operators in payment, settlement, insurance and logistics. Payments and deposits operate only after a payment provider’s deposit method is confirmed." },
        { n: "05", title: "Global expansion", body: "Collaboration fitted to each country’s rules and sharing market, checked against local laws and licence terms. Ads and paid placement are always labelled as ads, and companies without a signed agreement are never shown as partners." },
      ],
    },
    notice: "SHAREON has no contracted partners yet. The types below are the kinds of collaboration we welcome; they do not refer to any specific company.",
    types: {
      kicker: "14 PARTNER TYPES",
      title: "Fourteen ways\nto work together.",
      labels: { collab: "Collaboration", value: "What SHAREON aims to offer", terms: "Conditions", route: "How to take part" },
      items: [
        { n: "01", icon: "everyday", title: "Household rental companies", collab: "Household equipment rental", value: "New customer reach and rental management", terms: "Parts and usage-note rules", route: "Join and trade directly" },
        { n: "02", icon: "electronics", title: "Electronics rental companies", collab: "IT device rental", value: "Connecting short-term demand", terms: "Device reset and condition checks", route: "Join and trade directly" },
        { n: "03", icon: "camera", title: "Production gear rental companies", collab: "Camera and video equipment", value: "Reaching creators and studios", terms: "Condition disclosure, damage rules", route: "Join and trade directly" },
        { n: "04", icon: "camping", title: "Camping and travel gear companies", collab: "Travel gear rental", value: "Better use of seasonal gear", terms: "Cleaning and hygiene rules", route: "Join and trade directly" },
        { n: "05", icon: "fashion", title: "Clothing and event item companies", collab: "Fashion and event rental", value: "Reaching event and shoot demand", terms: "Authenticity, hygiene, cleaning", route: "Join and trade directly" },
        { n: "06", icon: "space", title: "Space operators", collab: "Studios and meeting rooms", value: "Using idle hours", terms: "Right to use the space, safety rules", route: "Join and trade directly" },
        { n: "07", icon: "mobility", title: "Licensed mobility operators", collab: "Vehicles and mobility", value: "Connecting lawful mobility rental", terms: "Operator licence under the relevant law", route: "Join after operator checks" },
        { n: "08", icon: "sports", title: "Sports and leisure companies", collab: "Sports equipment", value: "Reaching seasonal and local demand", terms: "Safety condition, protective gear", route: "Join and trade directly" },
        { n: "09", icon: "pro", title: "Industrial equipment companies", collab: "Industrial equipment", value: "Reaching short-term business demand", terms: "Qualifications, training, insurance", route: "Join after operator checks" },
        { n: "10", icon: "office", title: "Office equipment companies", collab: "Business equipment", value: "Repeat business and long-term contracts", terms: "Business contract terms", route: "Join directly · business terms agreed" },
        { n: "11", icon: "corporate", title: "Corporate asset managers", collab: "Using idle assets", value: "Earning from idle assets, lowering costs", terms: "Internal approval, asset rules", route: "Join directly · strategic alliance" },
        { n: "12", icon: "payment", title: "Payment, insurance and logistics partners", collab: "Transaction infrastructure", value: "Demand suited to sharing and rental", terms: "Relevant laws and agreements", route: "Infrastructure work (separate agreement)" },
        { n: "13", icon: "public", title: "Local governments and public bodies", collab: "Public sharing projects", value: "Better use of public resources", terms: "Procurement and contract process", route: "Institutional work (procurement process)" },
        { n: "14", icon: "global", title: "Global and technology partners", collab: "Abroad and SaaS", value: "A proven sharing and rental model", terms: "Local laws, licence terms", route: "Global and technology work (separate agreement)" },
      ],
    },
    process: {
      kicker: "PARTNERSHIP PROCESS",
      title: "How it works.",
      lead: "Ordinary joining needs only a direct sign-up in the app, not this process. Below is the process for strategic, infrastructure, institutional and global partnerships; results and timing depend on the proposal.",
      steps: [
        { n: "01", title: "Proposal received", body: "Tell us through the inquiry form what you offer, your resources and the role you have in mind." },
        { n: "02", title: "Business fit review", body: "Business, legal and operating checks, plus item-specific qualifications." },
        { n: "03", title: "Scope discussion", body: "Agree roles, responsibilities and operating conditions together." },
        { n: "04", title: "Terms and contract review", body: "A contract where one is needed. No one is shown as a partner before signing." },
        { n: "05", title: "Collaboration begins", body: "Start step by step, from a small area and category." },
      ],
    },
    next: {
      kicker: "PARTNERSHIP",
      title: "Creating new possibilities\nfor using assets, with SHAREON.",
      ctas: ["Partnership inquiry", "See inquiry types"],
    },
  },

  contact: {
    seoTitle: "SHAREON Contact | App, rental, business and partnership inquiries — Newon",
    seoDescription:
      "Questions about the SHAREON app, renting and listing as a person or business, spaces and professional equipment, payment and deposits, returns and disputes, business SaaS, public bodies, technology and global work — through NEWON’s official channels.",
    hero: {
      kicker: "SHAREON / CONTACT",
      title: "Talk to SHAREON\nabout new possibilities.",
      lead: "From questions about using the platform to joining as a person or business, renting assets, transaction infrastructure, business solutions and global business proposals — SHAREON inquiries come through NEWON’s official channels.",
      ctaMain: "Open the inquiry form",
      ctaSub: "Send an email",
    },
    kicker: "INQUIRY TYPES",
    title: "Choose\nan inquiry type.",
    lead: "01–06 are usage and trade inquiries, such as using the app or joining and renting as a person or business; 07–10 are business and partnership inquiries, such as transaction infrastructure, business solutions, institutions and strategic alliances. Each type opens NEWON’s official inquiry form or official email; no sign-up is needed.",
    groups: { trade: "Usage & trade", partner: "Business & partnership" },
    formCta: "Inquiry form",
    mailCta: "Email",
    mailSubjectPrefix: "[SHAREON]",
    items: [
      { n: "01", g: "trade", icon: "app", title: "Using the app", body: "Questions about using the app and technical topics. The app is not in the app stores yet.", slug: "app" },
      { n: "02", g: "trade", icon: "everyday", title: "Personal listing and renting", body: "How to lend or borrow assets as an individual. Basic listing is meant to work without a subscription.", slug: "personal" },
      { n: "03", g: "trade", icon: "corporate", title: "Business joining and renting", body: "Asset listing and renting for rental companies and businesses, who sign up directly without a partnership contract.", slug: "business" },
      { n: "04", g: "trade", icon: "space", title: "Space rental", body: "Space operators, renting spaces and listing ancillary services offered with the use of a space. A focus area for the first launch.", slug: "space" },
      { n: "05", g: "trade", icon: "pro", title: "Professional equipment", body: "Industrial, production and office equipment rental, with qualifications, safety training and insurance considered.", slug: "pro-equipment" },
      { n: "06", g: "trade", icon: "return", title: "Returns and disputes", body: "Feedback on returns, inspection and dispute rules, which will be fixed with the terms of use after legal review.", slug: "returns" },
      { n: "07", g: "partner", icon: "payment", title: "Payment, settlement and deposit infrastructure", body: "Work with qualified operators and feedback on payment, settlement and deposits. Payments and deposits are not operating yet.", slug: "payments" },
      { n: "08", g: "partner", icon: "saas", title: "Business solutions and SaaS", body: "Considering SHAREON Business SaaS and business asset-use solutions. A long-term direction; no product has been released.", slug: "saas" },
      { n: "09", g: "partner", icon: "public", title: "Public bodies", body: "Sharing projects with local governments and public bodies, reviewed under each body’s procurement and contract process.", slug: "public" },
      { n: "10", g: "partner", icon: "global", title: "Strategic, technology and global alliances", body: "Strategic business alliances, technology partnerships, expansion abroad and licensing, checked against local laws and licence terms.", slug: "global" },
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
