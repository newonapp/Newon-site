/**
 * SHAREON — sharing & rental platform pages (Overview · Platform · Business · Partnerships · Contact).
 * Business introduction only: no listing, search, booking, payment, settlement, chat, login or deposit on the web.
 *
 * Status rules (website brief §10): the SHAREON app is a pilot build — real trades, payment and booking
 * confirmation are switched off and it is not in the app stores. Nothing here is "available now".
 *   dev  = being built in the app (pilot, not released)
 *   prep = being prepared (needs operations, legal or partner work first)
 *   long = long-term business direction
 * No user counts, volumes, partner names, contract counts or fixed prices/fees are stated.
 * KO and EN are complete; other locales fall back to EN (as Ongil does) with localized SEO/hero lines.
 */

const KO = {
  lang: "ko",
  brand: "SHAREON",
  positioning: "Sharing & Rental Platform",
  status: {
    dev: "앱에서 개발 중",
    prep: "준비 중",
    long: "장기 사업 방향",
  },
  statusNote:
    "SHAREON 앱은 현재 시범 개발 단계입니다. 실제 대여·예약 확정·결제·정산은 아직 운영되지 않으며, 이 페이지는 사업 방향과 준비 상황을 소개합니다.",
  subnavAria: "SHAREON 메뉴",
  subnav: [
    { id: "overview", n: "01", en: "Overview", label: "소개" },
    { id: "platform", n: "02", en: "Platform", label: "서비스" },
    { id: "business", n: "03", en: "Business", label: "비즈니스" },
    { id: "partnerships", n: "04", en: "Partnerships", label: "파트너십" },
    { id: "contact", n: "05", en: "Contact", label: "문의" },
  ],
  crumbHome: "NEWON",
  inquiry: "문의하기",
  partnershipInquiry: "파트너십 문의하기",
  businessInquiry: "사업 문의하기",
  statusLabel: "진행 상태",

  overview: {
    seoTitle: "SHAREON | Newon — 공유·대여·렌털 플랫폼",
    seoDescription:
      "SHAREON은 개인과 기업의 물건·장비·공간을 연결하고 대여부터 반납까지 지원하는 공유·렌털 플랫폼을 지향합니다. 앱은 시범 개발 중이며 실제 대여·결제는 아직 운영되지 않습니다.",
    hero: {
      kicker: "SHARING & RENTAL PLATFORM",
      title: "소유하지 않아도,\n필요한 순간에.",
      lead: "SHAREON은 개인과 기업의 물건·장비·공간을 연결하고, 대여부터 반납까지 공유의 모든 과정을 지원하는 종합 공유·렌털 플랫폼을 지향합니다.",
      sub: "필요한 사람에게는 더 많은 선택을, 자원을 보유한 사람과 기업에게는 새로운 활용 기회를.",
      ctaMain: "서비스 알아보기",
      ctaSub: "비즈니스 살펴보기",
    },
    vision: {
      kicker: "OUR VISION",
      title: "소유보다 활용이 중요한 순간을 위해.",
      lead: "많은 물건과 공간은 사용하지 않는 시간에도 가치를 가지고 있습니다. SHAREON은 필요한 순간에 자원을 이용하고, 사용하지 않는 자원을 다른 사람과 공유할 수 있는 환경을 지향합니다. 개인과 기업의 자원을 더 효율적으로 연결하는 것이 SHAREON의 목표입니다.",
      values: [
        { en: "ACCESS", body: "필요한 자원에 더 쉽게 접근하는 경험." },
        { en: "UTILIZATION", body: "사용하지 않는 물건과 공간의 활용 가능성 확대." },
        { en: "TRUST", body: "예약부터 반납까지 신뢰할 수 있는 대여 경험." },
      ],
    },
    how: {
      kicker: "HOW IT WORKS",
      title: "대여의 시작부터 반납까지, 하나의 흐름으로.",
      lead: "SHAREON이 목표로 하는 이용 흐름입니다. 예약 확정·결제·반납 처리는 아직 운영되지 않으며, 앱에서 단계적으로 준비하고 있습니다.",
      steps: [
        { n: "01", en: "Discover", body: "필요한 물건·장비·공간을 탐색합니다." },
        { n: "02", en: "Select", body: "이용 조건과 대여 가능 기간을 확인합니다." },
        { n: "03", en: "Reserve", body: "대여 일정과 거래 조건을 확인합니다." },
        { n: "04", en: "Use", body: "약속된 기간 동안 자원을 이용합니다." },
        { n: "05", en: "Return", body: "반납과 거래 마무리 과정을 진행합니다." },
      ],
    },
    share: {
      kicker: "WHAT WE SHARE",
      title: "다양한 자원, 하나의 공유 경험.",
      items: [
        { n: "01", en: "Everyday Items", body: "생활용품·공구·취미용품." },
        { n: "02", en: "Cameras & Equipment", body: "카메라·렌즈·촬영 장비." },
        { n: "03", en: "Outdoor & Travel", body: "캠핑·스포츠·여행 장비." },
        { n: "04", en: "Business Assets", body: "기업 장비·행사·전시 자산." },
        { n: "05", en: "Spaces", body: "스튜디오·회의실·연습실·작업 공간." },
        { n: "06", en: "Long-Term Rental", body: "장기·정기 이용과 기업 렌털." },
      ],
    },
    market: {
      kicker: "OPEN MARKETPLACE",
      title: "개인과 기업 모두가 참여하는 렌털 생태계.",
      lead: "SHAREON은 특정 기업과의 개별 제휴에만 의존하지 않고, 개인과 기업이 직접 참여하는 오픈 렌털 마켓플레이스를 지향합니다. 개인과 기업은 모두 대여 공급자가 될 수도, 이용자가 될 수도 있습니다.",
      types: [
        { en: "PERSONAL", body: "개인이 자신의 물건을 대여 자원으로 활용하는 모델." },
        { en: "BUSINESS", body: "렌털 업체와 기업이 장비·공간을 제공하는 모델." },
        { en: "ENTERPRISE", body: "기업 간 유휴 자산을 공유하고 활용하는 모델." },
      ],
      note: "개인·사업자 참여 구조는 앱에서 개발 중이며, 기업 간 자원 공유는 장기 사업 방향입니다.",
    },
    eco: {
      kicker: "RENTAL ECOSYSTEM",
      title: "대여를 넘어, 운영의 전 과정까지.",
      lead: "대여 한 건이 원활하게 끝나려면 등록부터 분쟁 대응까지 여러 과정이 함께 움직여야 합니다. SHAREON은 이 과정을 하나의 흐름으로 연결하는 방향으로 준비하고 있습니다.",
      items: [
        "자원 등록·관리 방향",
        "예약·일정 관리",
        "이용 조건·보증금 정책",
        "대여·반납 관리",
        "배송·수거 연계",
        "후기·신뢰·분쟁 대응",
        "사업자 운영 도구",
      ],
    },
    biz: {
      kicker: "BUSINESS OPPORTUNITIES",
      title: "개인의 공유에서 기업의 자산 운영까지.",
      items: [
        { en: "Personal Rental", body: "개인 간 물품 대여." },
        { en: "Business Rental", body: "기업 장비·자산 렌털과 기업 간 공유." },
        { en: "Space Sharing", body: "개인·기업 공간 공유와 대여." },
        { en: "Rental SaaS", body: "예약·보증금·반납·신뢰·운영을 돕는 사업자 도구." },
      ],
      cta: "비즈니스 자세히 보기",
    },
    newon: {
      kicker: "NEWON ECOSYSTEM",
      title: "NEWON의 다양한 생활 영역과 연결되는 공유 경험.",
      lead: "다른 NEWON 서비스와의 연계는 장기 방향이며, 현재 연동되어 제공되는 기능은 없습니다.",
      items: [
        { name: "BABYLOG", body: "육아용품 대여와 가족 생활 관련 공유 기회." },
        { name: "PETLOG", body: "반려동물 용품 대여와 관련 공유 기회." },
        { name: "MY WORLD", body: "여행·캠핑 장비 대여와 관련 공유 기회." },
      ],
    },
    next: {
      title: "필요한 순간, SHAREON의 가능성을 만나보세요.",
      ctas: ["서비스 알아보기", "파트너십 살펴보기", "문의하기"],
    },
  },

  platform: {
    seoTitle: "SHAREON 서비스 | 물건·장비·공간 대여 — Newon",
    seoDescription:
      "개인 물품, 촬영·아웃도어 장비, 기업 장비, 공간, 장기 렌털까지. SHAREON이 준비하는 공유·렌털 서비스 영역을 소개합니다. 실제 대여·예약·결제는 아직 운영되지 않습니다.",
    hero: {
      kicker: "SHAREON PLATFORM",
      title: "물건부터 공간까지,\n필요한 순간에 연결합니다.",
      lead: "일상에서 필요한 물건부터 전문 장비와 공간까지. SHAREON은 다양한 자원을 더 효율적으로 활용할 수 있는 공유·렌털 경험을 지향합니다.",
    },
    sections: [
      { n: "01", en: "PERSONAL ITEM RENTAL", title: "필요한 물건을, 필요한 기간만큼.", body: "개인이 보유한 물건을 다른 사람에게 대여하거나 필요한 물건을 빌리는 공유 모델입니다.", items: ["생활용품", "공구·수리 장비", "카메라·렌즈", "캠핑용품", "스포츠 장비", "여행용품", "취미용품", "행사 용품"], status: "dev" },
      { n: "02", en: "CAMERA & CREATIVE EQUIPMENT", title: "전문 장비를 더 유연하게 이용할 수 있도록.", body: "구매하기 부담스러운 촬영·제작 장비를 필요한 기간만 이용하는 모델입니다.", items: ["카메라", "렌즈", "조명", "삼각대", "영상 장비", "음향 장비", "촬영 액세서리", "제작 장비"], status: "dev" },
      { n: "03", en: "OUTDOOR & LEISURE RENTAL", title: "새로운 경험을 위해, 모든 장비를 소유할 필요는 없습니다.", body: "가끔 쓰는 야외·레저 장비를 빌려 쓰고, 보유한 장비를 다른 사람과 나누는 모델입니다.", items: ["캠핑", "등산", "스포츠", "레저", "여행", "행사", "취미", "야외 활동"], status: "dev" },
      { n: "04", en: "BUSINESS EQUIPMENT RENTAL", title: "기업의 장비 활용을 더 효율적으로.", body: "렌털 업체와 기업이 장비를 제공하고, 기업과 개인이 필요한 기간만 이용하는 모델입니다.", items: ["사무 장비", "행사 장비", "전시 장비", "촬영 장비", "교육 장비", "상업용 집기", "전문 장비", "단기 프로젝트 장비"], status: "dev", note: "사업자 등록 기반 참여 구조를 앱에서 개발 중입니다." },
      { n: "05", en: "SPACE SHARING", title: "비어 있는 공간을 새로운 가능성으로.", body: "비어 있는 시간의 공간을 필요한 사람과 기업에게 연결하는 모델입니다.", items: ["촬영 스튜디오", "회의실", "세미나실", "연습실", "작업실", "공유오피스", "행사 공간", "팝업·전시 공간"], status: "dev", note: "공간 등록과 둘러보기를 앱에서 개발 중이며, 공간 예약은 준비 중입니다. 숙박·주차 등 별도 인허가가 필요한 영역은 적법한 운영 조건이 확인되기 전까지 제공하지 않습니다." },
      { n: "06", en: "LONG-TERM RENTAL", title: "한 번의 이용부터 장기 렌털까지.", body: "하루 단위 대여부터 월 단위·정기 이용까지 이용 기간을 넓히는 모델입니다.", items: ["일 단위 대여", "주 단위 대여", "월 단위 대여", "정기 이용", "기업 장기 렌털", "장기 공간 이용", "기간 연장", "반복 예약"], status: "prep" },
      { n: "07", en: "LOCAL SHARING", title: "가까운 곳에서 시작되는 공유.", body: "가까운 지역의 자원을 먼저 찾고, 동네 안에서 빌리고 돌려주는 모델입니다.", items: ["지역 물품 대여", "근거리 자원 탐색", "지역 렌털 사업자", "동네 공유 자원", "지역별 대여 정보", "지역 기반 이용 후기"], status: "dev", note: "정확한 위치 대신 지역 단위로 보여 주는 방식을 기본으로 하며, 사진의 위치 정보는 등록 시 제거합니다. 대면 거래 안전 안내를 함께 준비하고 있습니다." },
      { n: "08", en: "BUSINESS-TO-BUSINESS SHARING", title: "기업의 유휴 자산을 새로운 자원으로.", body: "기업이 보유한 장비·공간·자산을 다른 기업과 나누어 쓰는 모델입니다.", items: ["기업 간 장비 공유", "유휴 사무 자산", "행사·전시 자산", "기업 간 공간 이용", "단기 자산 활용", "장기 렌털", "기업 공급자 관리", "기업 이용자 관리"], status: "long" },
      { n: "09", en: "RENTAL SCHEDULING", title: "대여 가능일부터 반납 일정까지.", body: "대여가 겹치지 않도록 이용 가능 기간과 예약 상태를 한곳에서 관리하는 기능입니다.", items: ["이용 가능 기간", "대여 일정", "예약 상태", "이용 기간 변경", "반납 예정일", "예약 중복 방지", "정기 예약", "일정 알림"], status: "dev", note: "일정 화면과 승인형 예약 요청을 앱에서 개발 중이며, 예약 확정은 아직 운영되지 않습니다." },
      { n: "10", en: "TRUST & SAFETY", title: "안심할 수 있는 대여 경험을 위해.", body: "대여 전후의 조건과 책임을 분명히 하고, 문제가 생겼을 때 대응할 수 있는 구조를 준비합니다.", items: ["이용자 확인", "사업자 확인", "이용 조건", "보증금 정책", "파손·분실 대응", "거래 후기", "신고·차단", "분쟁 대응"], status: "prep", note: "보증금 보관·결제·보상 구조는 실제 운영과 법률 검토가 끝나기 전까지 제공하지 않으며, 보호나 보상을 약속하지 않습니다." },
      { n: "11", en: "DELIVERY & RETURNS", title: "빌리는 순간부터 돌려주는 순간까지.", body: "직접 수령부터 배송·수거까지, 대여 물품이 오가는 과정을 연결하는 방향입니다.", items: ["직접 수령", "택배 배송", "방문 수거", "장비 회수", "반납 일정", "배송 추적 연계", "반납 상태 확인", "물류 파트너 연계"], status: "long", note: "물류 파트너와의 계약은 아직 없습니다." },
      { n: "12", en: "RENTAL BUSINESS TOOLS", title: "렌털 사업자를 위한 운영 도구.", body: "렌털 사업자가 자산·예약·고객·반납을 한곳에서 관리할 수 있는 도구를 지향합니다.", items: ["자산·재고 관리", "예약 관리", "대여 일정", "고객 관리", "반납 관리", "정산 리포트", "운영 자동화", "사업 현황 분석"], status: "long", note: "앱 안의 판매자 센터를 개발 중이며, 별도 SaaS 제품은 아직 출시되지 않았습니다." },
    ],
    app: {
      n: "13",
      en: "APP & ACCESS",
      title: "공유와 대여의 경험을 하나의 앱에서.",
      body: "SHAREON은 iOS·Android용 모바일 앱으로 준비하고 있습니다. 실제 대여와 예약은 앱에서만 제공될 예정이며, 웹사이트에서는 등록·검색·예약·결제를 제공하지 않습니다.",
      status: "dev",
      note: "아직 앱스토어에 출시되지 않아 다운로드 링크가 없습니다. 출시 소식은 공식 채널로 안내드립니다.",
      platforms: ["iOS", "Android"],
    },
  },

  business: {
    seoTitle: "SHAREON 비즈니스 | 공유·렌털 사업 구조 — Newon",
    seoDescription:
      "개인 물품 대여, 기업 장비 렌털, 공간 공유, 장기 렌털, 렌털 사업자 도구, 기관·글로벌 협력까지. SHAREON의 공유·렌털 사업 구조와 진행 상태를 소개합니다.",
    hero: {
      kicker: "SHAREON BUSINESS",
      title: "개인의 공유에서\n기업의 자산 운영까지.",
      lead: "SHAREON은 개인과 기업의 유휴 자원을 연결하는 렌털 마켓플레이스를 기반으로, 예약·운영·반납·신뢰 관리와 기업용 솔루션까지 확장하는 공유경제 비즈니스를 지향합니다.",
    },
    overview: {
      kicker: "BUSINESS OVERVIEW",
      title: "여섯 개의 사업 영역.",
      items: [
        { en: "Personal Rental", body: "개인 간 물품 대여." },
        { en: "Business Rental", body: "기업 장비·자산 렌털." },
        { en: "Space Sharing", body: "공간 공유와 대여." },
        { en: "Rental Operations", body: "예약·일정·반납·신뢰 운영." },
        { en: "Business Solutions", body: "렌털 사업자용 운영 제품." },
        { en: "Institutions & Global", body: "기관 협력과 해외 확장." },
      ],
    },
    core: {
      kicker: "12 CORE BUSINESSES",
      title: "SHAREON의 열두 가지 사업.",
      lead: "각 사업의 고객·대상·수익 구조입니다. 수익 구조는 방향이며, 수수료율과 가격은 확정되지 않았습니다.",
      labels: { customer: "고객", target: "대상", revenue: "수익 구조" },
      items: [
        { n: "01", title: "개인 물품 대여", customer: "개인 대여자·이용자", target: "생활·취미·여행·스포츠·촬영 용품", revenue: "대여 거래 수수료", status: "dev" },
        { n: "02", title: "기업 장비 렌털", customer: "렌털 업체·기업·사업자", target: "촬영·행사·사무·전문 장비", revenue: "대여 거래 수수료·기업 계약", status: "dev" },
        { n: "03", title: "공간 공유·대여", customer: "공간 운영자·개인·기업", target: "스튜디오·회의실·연습실·행사 공간", revenue: "공간 예약·대여 수수료", status: "dev" },
        { n: "04", title: "장기·정기 렌털", customer: "개인·기업·렌털 업체", target: "정기 대여·장기 장비·공간 이용", revenue: "계약별·정기 이용 거래", status: "prep" },
        { n: "05", title: "지역 기반 공유", customer: "지역 주민·지역 렌털 사업자", target: "동네 물건·근거리 대여", revenue: "대여 거래 수수료", status: "dev" },
        { n: "06", title: "기업 간 자원 공유", customer: "기업·기관·사업자", target: "유휴 장비·공간·기업 자산", revenue: "기업 간 거래·계약별", status: "long" },
        { n: "07", title: "렌털 예약·일정 관리", customer: "대여 공급자·렌털 업체", target: "예약·일정·반납 관리", revenue: "사업자용 운영 제품·구독", status: "dev" },
        { n: "08", title: "거래 신뢰·안전", customer: "대여 공급자·이용자", target: "신원·조건·보증금·분쟁 정책", revenue: "적법한 선택형 서비스 또는 운영 솔루션", status: "prep", note: "안전·보호 관련 유료 상품은 법률 검토 전까지 정하지 않습니다." },
        { n: "09", title: "배송·수거·반납", customer: "개인·기업·물류 파트너", target: "배송·회수·반납 지원", revenue: "제휴·계약별", status: "long" },
        { n: "10", title: "렌털 사업자 SaaS", customer: "렌털 업체·공간 운영자·기업", target: "SHAREON Rental · Booking · Inventory · Business · Automation", revenue: "월·연 구독·라이선스", status: "long", note: "고객별 외주 제작은 하지 않습니다." },
        { n: "11", title: "기관·공공 공유경제", customer: "지자체·공공기관·교육기관", target: "공유 자원·공공 장비·지역 공유 프로그램", revenue: "기관 계약·플랫폼 라이선스", status: "long" },
        { n: "12", title: "글로벌·라이선스", customer: "해외 렌털 사업자·기업", target: "해외 렌털 생태계·표준 운영 제품", revenue: "라이선스·기업 계약", status: "long" },
      ],
    },
    revenue: {
      kicker: "REVENUE MODEL",
      title: "거래와 운영에서 함께 만드는 가치.",
      lead: "SHAREON의 수익은 대여 거래 수수료, 기업·기관 계약, 사업자용 도구 구독과 라이선스로 구성될 예정입니다. 수수료율과 가격은 내부 검토 중이며 확정되지 않았습니다.",
      rows: [
        { area: "개인 물품 대여", model: "대여 거래 수수료" },
        { area: "기업 장비 렌털", model: "대여 거래 수수료" },
        { area: "공간 대여", model: "공간 예약·대여 수수료" },
        { area: "장기·정기 렌털", model: "계약별" },
        { area: "기업 간 자원 공유", model: "계약별" },
        { area: "렌털 SaaS", model: "월·연 구독" },
        { area: "기관 라이선스", model: "계약별" },
        { area: "글로벌 라이선스", model: "계약별" },
      ],
      head: { area: "영역", model: "수익 구조" },
      note: "보증금은 플랫폼 매출이 아니며, 수익과 구분해 관리합니다. 보증금 수납 방식은 결제 사업자 계약과 법률 검토 후 정합니다.",
    },
    solutions: {
      kicker: "BUSINESS SOLUTIONS",
      title: "대여 사업의 운영을 더 단순하게.",
      lead: "렌털 사업자를 위한 다섯 가지 운영 제품을 장기 방향으로 설계하고 있습니다. 현재 출시된 제품은 없으며, 도입을 검토하는 사업자의 의견을 듣고 있습니다.",
      labels: { target: "대상 고객", features: "주요 기능", value: "기대 가치" },
      items: [
        { name: "SHAREON Rental", lead: "대여 상품·자산 관리.", target: "렌털 업체·장비 보유 기업", features: "대여 상품 등록·가격·이용 조건 관리", value: "흩어진 대여 상품 정보를 한곳에서 관리" },
        { name: "SHAREON Booking", lead: "예약·일정 관리.", target: "공간 운영자·렌털 업체", features: "이용 가능 기간·예약 요청·일정 관리", value: "예약 중복과 일정 누락 감소" },
        { name: "SHAREON Inventory", lead: "재고·자산·이용 상태 관리.", target: "장비·자산이 많은 사업자", features: "재고·자산 상태·대여 이력 관리", value: "자산 가동률과 상태를 한눈에 확인" },
        { name: "SHAREON Business", lead: "렌털 사업 운영 관리.", target: "렌털 사업자·기업", features: "고객·거래·반납·정산 리포트", value: "운영 현황 파악과 의사결정 지원" },
        { name: "SHAREON Automation", lead: "반복 업무 자동화.", target: "운영 인력이 적은 사업자", features: "안내·알림·반복 처리 자동화", value: "반복 업무 시간 절감" },
      ],
      status: "long",
      cta: "도입 문의하기",
    },
    models: {
      kicker: "BUSINESS MODELS",
      title: "고객 유형별 사업 모델.",
      items: [
        { en: "C2C", body: "개인 간 대여." },
        { en: "B2C", body: "기업의 개인 대상 렌털." },
        { en: "C2B", body: "개인의 기업 대상 자원 제공." },
        { en: "B2B", body: "기업 간 장비·공간 공유." },
        { en: "B2G", body: "기업·기관 공유경제 협력." },
        { en: "SaaS", body: "렌털 사업자용 표준 운영 제품." },
      ],
    },
    next: {
      title: "SHAREON과 함께 공유의 새로운 기회를 만들어보세요.",
      ctas: ["파트너십 알아보기", "사업 문의하기"],
    },
  },

  partnerships: {
    seoTitle: "SHAREON 파트너십 | 공유·렌털 협력 — Newon",
    seoDescription:
      "개인 대여자, 렌털 업체, 공간 운영자, 물류·결제 파트너, 기관과 글로벌 파트너까지. SHAREON의 공유·렌털 생태계에 함께할 협력 유형과 절차를 소개합니다.",
    hero: {
      kicker: "SHAREON PARTNERSHIPS",
      title: "공유의 가치를 함께\n확장할 파트너를 찾습니다.",
      lead: "개인 대여자부터 렌털 업체, 공간 운영자, 기업과 기관까지. SHAREON은 다양한 자원이 더 효율적으로 활용될 수 있도록 협력의 기회를 넓혀갑니다.",
    },
    notice: "현재 SHAREON과 계약을 맺은 파트너사는 없습니다. 아래는 협력을 제안받고자 하는 유형이며, 특정 업체를 나타내지 않습니다.",
    typesKicker: "PARTNER TYPES",
    typesTitle: "함께할 수 있는 열두 가지 방법.",
    labels: {
      who: "협력 대상",
      resources: "공유·대여 자원",
      services: "협력 가능한 서비스",
      value: "SHAREON이 제공하려는 가치",
      revenue: "수익 구조",
      terms: "운영·자격 조건",
      status: "진행 상태",
    },
    types: [
      { n: "01", title: "개인 대여자", lead: "개인 물품 대여 참여.", who: "물건을 대여하려는 개인", resources: "생활·취미·촬영·캠핑 용품", services: "물품 등록·대여 일정·이용 조건 설정", value: "쓰지 않는 물건의 새로운 활용 기회", revenue: "대여 거래 수수료(요율 미확정)", terms: "본인 확인과 대여 가능 품목 기준 준수", status: "dev" },
      { n: "02", title: "렌털 전문업체", lead: "기존 렌털 상품·장비 공급.", who: "렌털 사업을 운영하는 사업자", resources: "보유 렌털 상품·장비", services: "사업자 참여·상품 노출·예약 관리", value: "새로운 고객 접점과 운영 도구", revenue: "대여 거래 수수료·기업 계약", terms: "사업자 확인과 업종별 자격 확인", status: "dev" },
      { n: "03", title: "촬영·장비 공급자", lead: "카메라·조명·영상·음향 장비.", who: "촬영·제작 장비 보유 개인·사업자", resources: "카메라·렌즈·조명·영상·음향 장비", services: "장비 대여·기간별 이용 조건", value: "고가 장비의 가동률 향상", revenue: "대여 거래 수수료", terms: "장비 상태 고지와 파손 기준 합의", status: "dev" },
      { n: "04", title: "캠핑·레저 공급자", lead: "캠핑·스포츠·아웃도어 장비.", who: "아웃도어 장비 보유 개인·사업자", resources: "캠핑·등산·스포츠·레저 장비", services: "시즌별 대여·지역 기반 대여", value: "계절 장비의 비수기 활용", revenue: "대여 거래 수수료", terms: "안전 관련 품목 기준 준수", status: "dev" },
      { n: "05", title: "공간 운영자", lead: "스튜디오·회의실·연습실·행사 공간.", who: "공간을 운영하는 개인·사업자", resources: "스튜디오·회의실·연습실·행사 공간", services: "공간 소개·이용 가능 시간 관리", value: "비어 있는 시간의 활용", revenue: "공간 예약·대여 수수료", terms: "공간 사용 권한 확인(임대·전대 권한 포함)", status: "dev" },
      { n: "06", title: "기업 자산 관리자", lead: "기업 장비·공간·유휴 자산.", who: "유휴 자산을 보유한 기업", resources: "사무·행사·전시 장비와 공간", services: "기업 자산 대여·기업 간 공유", value: "유휴 자산의 수익화와 비용 절감", revenue: "기업 간 거래·계약별", terms: "기업 내부 승인과 자산 관리 기준", status: "long" },
      { n: "07", title: "장기 렌털 사업자", lead: "정기·장기 대여 상품.", who: "장기·정기 렌털을 운영하는 사업자", resources: "월 단위·정기 이용 상품", services: "장기 계약·기간 연장·반복 예약", value: "안정적인 장기 이용 고객 연결", revenue: "계약별·정기 이용 거래", terms: "장기 계약 조건과 해지 기준 명시", status: "prep" },
      { n: "08", title: "물류·회수 파트너", lead: "배송·수거·반납.", who: "배송·수거 서비스를 제공하는 사업자", resources: "배송·방문 수거·회수 역량", services: "대여 물품 배송·반납 수거 연계", value: "대여 물품 물류 수요", revenue: "제휴·계약별", terms: "물품 파손·분실 책임 기준 합의", status: "long" },
      { n: "09", title: "결제·정산 파트너", lead: "대여 결제·보증금·정산 인프라.", who: "결제·정산 서비스 사업자", resources: "결제·보증금 처리·정산 인프라", services: "대여 결제와 정산 연동", value: "공유·렌털 거래에 맞는 결제 수요", revenue: "제휴·계약별", terms: "관련 법령과 결제 사업자 계약 기준 충족", status: "prep" },
      { n: "10", title: "렌털 SaaS 고객", lead: "운영·예약·자산 관리 제품.", who: "운영 도구가 필요한 렌털 사업자", resources: "예약·자산·고객 데이터", services: "SHAREON 사업자용 운영 제품", value: "운영 업무의 표준화와 자동화", revenue: "월·연 구독·라이선스", terms: "제품 출시 후 이용 약관 기준", status: "long" },
      { n: "11", title: "공공기관·지자체", lead: "지역 공유경제·공공 자원.", who: "지자체·공공기관·교육기관", resources: "공공 장비·공간·지역 공유 자원", services: "지역 공유 프로그램 운영 협력", value: "공공 자원의 활용도 향상", revenue: "기관 계약·플랫폼 라이선스", terms: "기관별 조달·계약 절차", status: "long" },
      { n: "12", title: "글로벌 파트너", lead: "해외 렌털·라이선스.", who: "해외 렌털 사업자·기업", resources: "해외 렌털 생태계", services: "표준 운영 제품 라이선스·현지화 협력", value: "검증된 공유·렌털 운영 모델", revenue: "라이선스·기업 계약", terms: "현지 법령과 계약 조건", status: "long" },
    ],
    process: {
      kicker: "PROCESS",
      title: "협력 절차.",
      steps: [
        { n: "01", en: "Proposal", label: "제안" },
        { n: "02", en: "Review", label: "검토" },
        { n: "03", en: "Discussion", label: "협의" },
        { n: "04", en: "Agreement", label: "계약" },
        { n: "05", en: "Operation", label: "운영" },
      ],
      lead: "제안을 받은 뒤 사업·법률·운영 조건을 검토하고, 협의와 계약을 거쳐 운영을 시작합니다. 검토 결과와 일정은 제안 내용에 따라 달라집니다.",
    },
    next: {
      title: "공유의 새로운 가능성을 함께 만들어갑니다.",
      cta: "파트너십 문의하기",
    },
  },

  contact: {
    seoTitle: "SHAREON 문의 | 공유·렌털 협력 문의 — Newon",
    seoDescription:
      "SHAREON 앱 이용, 물품·장비·공간 대여, 렌털 사업자 도구, 물류·결제 제휴, 기관·글로벌 협력 문의를 NEWON 공식 문의 경로로 받습니다.",
    hero: {
      kicker: "SHAREON CONTACT",
      title: "SHAREON과 함께할\n새로운 공유의 가능성을\n이야기해 주세요.",
      lead: "서비스 이용부터 물품·장비·공간 대여, 기업용 렌털 솔루션과 기관 협력까지. SHAREON과 관련된 다양한 문의를 기다립니다.",
    },
    kicker: "INQUIRY TYPES",
    title: "문의 유형을 선택해 주세요.",
    lead: "각 유형은 NEWON 공식 문의 양식이나 공식 이메일로 연결됩니다. 별도의 회원가입은 필요하지 않습니다.",
    formCta: "문의 양식",
    mailCta: "이메일",
    mailSubjectPrefix: "[SHAREON]",
    items: [
      { n: "01", title: "앱 이용·기술 지원", body: "시범 앱 이용과 기술 관련 질문.", slug: "app-support" },
      { n: "02", title: "개인 물품 대여", body: "개인 대여 참여와 이용 방식.", slug: "personal-rental" },
      { n: "03", title: "기업 장비 렌털", body: "기업·렌털 업체의 장비 대여 참여.", slug: "business-rental" },
      { n: "04", title: "공간 공유·대여", body: "공간 운영자 참여와 공간 대여.", slug: "space-sharing" },
      { n: "05", title: "장기·정기 렌털", body: "장기·정기 이용 상품 협력.", slug: "long-term-rental" },
      { n: "06", title: "예약·반납·이용 조건", body: "예약·반납 방식과 이용 조건 관련 의견.", slug: "booking-return" },
      { n: "07", title: "렌털 사업자 SaaS", body: "사업자용 운영 제품 도입 검토.", slug: "rental-saas" },
      { n: "08", title: "배송·수거·물류 제휴", body: "배송·수거·반납 물류 협력.", slug: "logistics" },
      { n: "09", title: "결제·정산 인프라 제휴", body: "대여 결제·정산 인프라 협력.", slug: "payments" },
      { n: "10", title: "기업 간 자원 공유", body: "기업 유휴 자산 공유 협력.", slug: "b2b-sharing" },
      { n: "11", title: "공공기관·지자체 협력", body: "지역 공유경제·공공 자원 협력.", slug: "public-sector" },
      { n: "12", title: "글로벌·전략적 협력", body: "해외 진출·라이선스·전략 협력.", slug: "global" },
    ],
    guide: {
      kicker: "BEFORE YOU WRITE",
      title: "문의 전에 확인해 주세요.",
      items: [
        "문의에는 회신에 필요한 최소한의 정보(이름·이메일·문의 내용)만 적어 주세요.",
        "카드 번호, 계좌 비밀번호, 신분증 번호 등 민감한 결제·개인정보는 절대 적지 마세요.",
        "SHAREON 관련 문의는 NEWON 공식 문의 양식과 공식 이메일(newon@newon.app)로만 받습니다.",
        "현재 앱은 시범 개발 단계로, 실제 대여·예약·결제·환불에 대한 고객 지원은 제공하지 않습니다.",
        "답변 시점은 문의 내용에 따라 달라지며, 회신 기한을 보장하지 않습니다.",
      ],
      privacy: "개인정보 처리방침",
    },
  },
};

const EN = {
  lang: "en",
  brand: "SHAREON",
  positioning: "Sharing & Rental Platform",
  status: {
    dev: "In development in the app",
    prep: "In preparation",
    long: "Long-term direction",
  },
  statusNote:
    "The SHAREON app is in pilot development. Real rentals, booking confirmation, payment and settlement are not operating yet; this page introduces the business direction and where it stands.",
  subnavAria: "SHAREON menu",
  subnav: [
    { id: "overview", n: "01", en: "Overview", label: "Overview" },
    { id: "platform", n: "02", en: "Platform", label: "Platform" },
    { id: "business", n: "03", en: "Business", label: "Business" },
    { id: "partnerships", n: "04", en: "Partnerships", label: "Partnerships" },
    { id: "contact", n: "05", en: "Contact", label: "Contact" },
  ],
  crumbHome: "NEWON",
  inquiry: "Contact us",
  partnershipInquiry: "Partnership inquiry",
  businessInquiry: "Business inquiry",
  statusLabel: "Status",

  overview: {
    seoTitle: "SHAREON | Newon — Sharing & Rental Platform",
    seoDescription:
      "SHAREON aims to connect the things, equipment and spaces of people and businesses, and to support every step from rental to return. The app is in pilot development; real rentals and payments are not operating yet.",
    hero: {
      kicker: "SHARING & RENTAL PLATFORM",
      title: "No need to own it.\nJust when you need it.",
      lead: "SHAREON aims to be a full sharing and rental platform that connects the things, equipment and spaces of individuals and businesses, and supports every step of sharing — from rental to return.",
      sub: "More choice for people who need something; new ways to use what people and businesses already own.",
      ctaMain: "Explore the platform",
      ctaSub: "See the business",
    },
    vision: {
      kicker: "OUR VISION",
      title: "For the moments when using matters more than owning.",
      lead: "Many things and spaces keep their value even while they sit unused. SHAREON aims to make it easy to use resources when they are needed, and to share resources that are not in use. Connecting the resources of people and businesses more efficiently is SHAREON’s goal.",
      values: [
        { en: "ACCESS", body: "Easier access to the resources you need." },
        { en: "UTILIZATION", body: "More ways to use idle things and spaces." },
        { en: "TRUST", body: "A rental experience you can rely on, from booking to return." },
      ],
    },
    how: {
      kicker: "HOW IT WORKS",
      title: "From the first rental to the return, in one flow.",
      lead: "This is the flow SHAREON is aiming for. Booking confirmation, payment and return handling are not operating yet and are being prepared step by step in the app.",
      steps: [
        { n: "01", en: "Discover", body: "Find the things, equipment or spaces you need." },
        { n: "02", en: "Select", body: "Check the conditions and the available rental period." },
        { n: "03", en: "Reserve", body: "Confirm the rental dates and terms." },
        { n: "04", en: "Use", body: "Use the resource for the agreed period." },
        { n: "05", en: "Return", body: "Return it and close the rental." },
      ],
    },
    share: {
      kicker: "WHAT WE SHARE",
      title: "Many kinds of resources, one sharing experience.",
      items: [
        { n: "01", en: "Everyday Items", body: "Household goods, tools and hobby gear." },
        { n: "02", en: "Cameras & Equipment", body: "Cameras, lenses and shooting equipment." },
        { n: "03", en: "Outdoor & Travel", body: "Camping, sports and travel gear." },
        { n: "04", en: "Business Assets", body: "Company equipment and event or exhibition assets." },
        { n: "05", en: "Spaces", body: "Studios, meeting rooms, practice rooms and workspaces." },
        { n: "06", en: "Long-Term Rental", body: "Long-term and recurring use, and business rental." },
      ],
    },
    market: {
      kicker: "OPEN MARKETPLACE",
      title: "A rental ecosystem open to people and businesses alike.",
      lead: "Rather than depending on one-off deals with selected companies, SHAREON aims to be an open rental marketplace that people and businesses join directly. Both can be providers, and both can be renters.",
      types: [
        { en: "PERSONAL", body: "People turning their own things into rentable resources." },
        { en: "BUSINESS", body: "Rental companies and businesses offering equipment and spaces." },
        { en: "ENTERPRISE", body: "Companies sharing and using each other’s idle assets." },
      ],
      note: "Participation by individuals and registered businesses is being built in the app; sharing between companies is a long-term direction.",
    },
    eco: {
      kicker: "RENTAL ECOSYSTEM",
      title: "Beyond the rental, across the whole operation.",
      lead: "For a single rental to go smoothly, many steps — from listing to dispute handling — have to work together. SHAREON is preparing to connect them in one flow.",
      items: [
        "Listing and managing resources",
        "Booking and schedules",
        "Terms of use and deposit policy",
        "Rental and return management",
        "Delivery and pickup links",
        "Reviews, trust and dispute handling",
        "Tools for rental businesses",
      ],
    },
    biz: {
      kicker: "BUSINESS OPPORTUNITIES",
      title: "From personal sharing to company asset operations.",
      items: [
        { en: "Personal Rental", body: "Rentals between individuals." },
        { en: "Business Rental", body: "Company equipment and asset rental, and sharing between companies." },
        { en: "Space Sharing", body: "Sharing and renting personal and business spaces." },
        { en: "Rental SaaS", body: "Tools for booking, deposits, returns, trust and operations." },
      ],
      cta: "See the business in detail",
    },
    newon: {
      kicker: "NEWON ECOSYSTEM",
      title: "A sharing experience that connects with NEWON’s life services.",
      lead: "Links with other NEWON services are a long-term direction; no connected features are offered today.",
      items: [
        { name: "BABYLOG", body: "Sharing opportunities around baby gear rental and family life." },
        { name: "PETLOG", body: "Sharing opportunities around pet gear rental." },
        { name: "MY WORLD", body: "Sharing opportunities around travel and camping gear rental." },
      ],
    },
    next: {
      title: "When you need it, discover what SHAREON can do.",
      ctas: ["Explore the platform", "See partnerships", "Contact us"],
    },
  },

  platform: {
    seoTitle: "SHAREON Platform | Renting things, equipment and spaces — Newon",
    seoDescription:
      "Personal items, camera and outdoor gear, business equipment, spaces and long-term rental. The sharing and rental areas SHAREON is preparing. Real rentals, booking and payment are not operating yet.",
    hero: {
      kicker: "SHAREON PLATFORM",
      title: "From things to spaces,\nconnected when you need them.",
      lead: "From everyday things to professional equipment and spaces. SHAREON aims for a sharing and rental experience that helps all kinds of resources get used more efficiently.",
    },
    sections: [
      { n: "01", en: "PERSONAL ITEM RENTAL", title: "What you need, for as long as you need it.", body: "A sharing model where people lend things they own or borrow the things they need.", items: ["Household goods", "Tools and repair gear", "Cameras and lenses", "Camping gear", "Sports equipment", "Travel gear", "Hobby gear", "Event supplies"], status: "dev" },
      { n: "02", en: "CAMERA & CREATIVE EQUIPMENT", title: "Professional gear, used more flexibly.", body: "A model for using shooting and production equipment that is costly to buy, only for as long as it is needed.", items: ["Cameras", "Lenses", "Lighting", "Tripods", "Video equipment", "Audio equipment", "Shooting accessories", "Production gear"], status: "dev" },
      { n: "03", en: "OUTDOOR & LEISURE RENTAL", title: "You don’t have to own every piece of gear for a new experience.", body: "A model for borrowing outdoor and leisure gear you use only now and then, and sharing the gear you own.", items: ["Camping", "Hiking", "Sports", "Leisure", "Travel", "Events", "Hobbies", "Outdoor activities"], status: "dev" },
      { n: "04", en: "BUSINESS EQUIPMENT RENTAL", title: "Making better use of company equipment.", body: "A model where rental companies and businesses offer equipment, and companies and individuals use it for the period they need.", items: ["Office equipment", "Event equipment", "Exhibition equipment", "Shooting equipment", "Training equipment", "Commercial fixtures", "Specialist equipment", "Short-project equipment"], status: "dev", note: "Participation for registered businesses is being built in the app." },
      { n: "05", en: "SPACE SHARING", title: "Turning empty space into new possibilities.", body: "A model that connects spaces in their idle hours with the people and businesses who need them.", items: ["Photo studios", "Meeting rooms", "Seminar rooms", "Practice rooms", "Workshops", "Shared offices", "Event spaces", "Pop-up and exhibition spaces"], status: "dev", note: "Listing and browsing spaces is being built in the app; space booking is in preparation. Areas that need separate licences, such as lodging or parking, will not be offered until lawful operating conditions are confirmed." },
      { n: "06", en: "LONG-TERM RENTAL", title: "From a single use to long-term rental.", body: "A model that widens the rental period from a day to monthly and recurring use.", items: ["Daily rental", "Weekly rental", "Monthly rental", "Recurring use", "Long-term business rental", "Long-term space use", "Extensions", "Repeat bookings"], status: "prep" },
      { n: "07", en: "LOCAL SHARING", title: "Sharing that starts close to home.", body: "A model for finding nearby resources first, and borrowing and returning them within the neighbourhood.", items: ["Local item rental", "Nearby resource search", "Local rental businesses", "Neighbourhood resources", "Rental information by area", "Area-based reviews"], status: "dev", note: "The default is to show an area rather than an exact location, and location data is removed from photos when they are added. In-person safety guidance is being prepared too." },
      { n: "08", en: "BUSINESS-TO-BUSINESS SHARING", title: "Turning a company’s idle assets into new resources.", body: "A model for companies to share their equipment, spaces and assets with other companies.", items: ["Equipment sharing between companies", "Idle office assets", "Event and exhibition assets", "Space use between companies", "Short-term asset use", "Long-term rental", "Business supplier management", "Business renter management"], status: "long" },
      { n: "09", en: "RENTAL SCHEDULING", title: "From available dates to the return date.", body: "Managing availability and booking status in one place so that rentals don’t overlap.", items: ["Available periods", "Rental schedules", "Booking status", "Changing the rental period", "Expected return date", "Preventing double booking", "Recurring bookings", "Schedule reminders"], status: "dev", note: "Schedule screens and approval-based booking requests are being built in the app; booking confirmation is not operating yet." },
      { n: "10", en: "TRUST & SAFETY", title: "For a rental experience you can feel safe about.", body: "Preparing clear terms and responsibilities before and after a rental, and a way to respond when something goes wrong.", items: ["User verification", "Business verification", "Terms of use", "Deposit policy", "Damage and loss handling", "Reviews", "Reporting and blocking", "Dispute handling"], status: "prep", note: "Deposit holding, payment and compensation will not be offered until operations and legal review are complete, and no protection or compensation is promised." },
      { n: "11", en: "DELIVERY & RETURNS", title: "From the moment you borrow to the moment you return.", body: "A direction for connecting how rented items travel — from pickup in person to delivery and collection.", items: ["Pickup in person", "Parcel delivery", "Home collection", "Equipment recovery", "Return schedules", "Delivery tracking links", "Return condition checks", "Logistics partner links"], status: "long", note: "There are no logistics partner agreements yet." },
      { n: "12", en: "RENTAL BUSINESS TOOLS", title: "Operating tools for rental businesses.", body: "Aiming for tools that let rental businesses manage assets, bookings, customers and returns in one place.", items: ["Asset and inventory management", "Booking management", "Rental schedules", "Customer management", "Return management", "Settlement reports", "Operations automation", "Business analytics"], status: "long", note: "A seller centre inside the app is being built; no separate SaaS product has been released." },
    ],
    app: {
      n: "13",
      en: "APP & ACCESS",
      title: "Sharing and renting, in one app.",
      body: "SHAREON is being prepared as a mobile app for iOS and Android. Real rentals and booking will be offered in the app only; the website does not offer listing, search, booking or payment.",
      status: "dev",
      note: "The app is not in the app stores yet, so there is no download link. Launch news will be shared through official channels.",
      platforms: ["iOS", "Android"],
    },
  },

  business: {
    seoTitle: "SHAREON Business | Sharing and rental business structure — Newon",
    seoDescription:
      "Personal item rental, business equipment rental, space sharing, long-term rental, tools for rental businesses, and work with institutions and global partners. SHAREON’s business structure and where each part stands.",
    hero: {
      kicker: "SHAREON BUSINESS",
      title: "From personal sharing\nto company asset operations.",
      lead: "Built on a rental marketplace that connects the idle resources of people and businesses, SHAREON aims for a sharing-economy business that grows into booking, operations, returns, trust management and solutions for companies.",
    },
    overview: {
      kicker: "BUSINESS OVERVIEW",
      title: "Six business areas.",
      items: [
        { en: "Personal Rental", body: "Rentals between individuals." },
        { en: "Business Rental", body: "Company equipment and asset rental." },
        { en: "Space Sharing", body: "Sharing and renting spaces." },
        { en: "Rental Operations", body: "Booking, schedules, returns and trust." },
        { en: "Business Solutions", body: "Operating products for rental businesses." },
        { en: "Institutions & Global", body: "Work with institutions and expansion abroad." },
      ],
    },
    core: {
      kicker: "12 CORE BUSINESSES",
      title: "SHAREON’s twelve businesses.",
      lead: "Customers, scope and revenue structure for each business. Revenue structures are a direction; fee rates and prices are not decided.",
      labels: { customer: "Customers", target: "Scope", revenue: "Revenue structure" },
      items: [
        { n: "01", title: "Personal item rental", customer: "Individual lenders and renters", target: "Everyday, hobby, travel, sports and camera gear", revenue: "Rental transaction fee", status: "dev" },
        { n: "02", title: "Business equipment rental", customer: "Rental companies, businesses", target: "Shooting, event, office and specialist equipment", revenue: "Rental transaction fee, business contracts", status: "dev" },
        { n: "03", title: "Space sharing and rental", customer: "Space operators, individuals, businesses", target: "Studios, meeting rooms, practice rooms, event spaces", revenue: "Space booking and rental fee", status: "dev" },
        { n: "04", title: "Long-term and recurring rental", customer: "Individuals, businesses, rental companies", target: "Recurring rentals, long-term equipment and space use", revenue: "Per contract, recurring transactions", status: "prep" },
        { n: "05", title: "Local sharing", customer: "Local residents, local rental businesses", target: "Neighbourhood items, nearby rentals", revenue: "Rental transaction fee", status: "dev" },
        { n: "06", title: "Resource sharing between companies", customer: "Companies, institutions, businesses", target: "Idle equipment, spaces and company assets", revenue: "Business-to-business deals, per contract", status: "long" },
        { n: "07", title: "Booking and schedule management", customer: "Rental providers and companies", target: "Booking, schedule and return management", revenue: "Operating products for businesses, subscription", status: "dev" },
        { n: "08", title: "Trust and safety", customer: "Rental providers and renters", target: "Identity, terms, deposit and dispute policies", revenue: "Lawful optional services or operating solutions", status: "prep", note: "Paid safety or protection products will not be decided before legal review." },
        { n: "09", title: "Delivery, pickup and return", customer: "Individuals, businesses, logistics partners", target: "Delivery, collection and return support", revenue: "Partnership, per contract", status: "long" },
        { n: "10", title: "SaaS for rental businesses", customer: "Rental companies, space operators, businesses", target: "SHAREON Rental · Booking · Inventory · Business · Automation", revenue: "Monthly or annual subscription, licence", status: "long", note: "No custom build work for individual clients." },
        { n: "11", title: "Public-sector sharing economy", customer: "Local governments, public bodies, schools", target: "Shared resources, public equipment, local sharing programmes", revenue: "Institutional contracts, platform licence", status: "long" },
        { n: "12", title: "Global and licensing", customer: "Rental businesses and companies abroad", target: "Rental ecosystems abroad, standard operating products", revenue: "Licences, business contracts", status: "long" },
      ],
    },
    revenue: {
      kicker: "REVENUE MODEL",
      title: "Value created together in transactions and operations.",
      lead: "SHAREON’s revenue is planned to come from rental transaction fees, contracts with companies and institutions, and subscriptions and licences for business tools. Fee rates and prices are under internal review and not decided.",
      rows: [
        { area: "Personal item rental", model: "Rental transaction fee" },
        { area: "Business equipment rental", model: "Rental transaction fee" },
        { area: "Space rental", model: "Space booking and rental fee" },
        { area: "Long-term and recurring rental", model: "Per contract" },
        { area: "Resource sharing between companies", model: "Per contract" },
        { area: "Rental SaaS", model: "Monthly or annual subscription" },
        { area: "Institutional licence", model: "Per contract" },
        { area: "Global licence", model: "Per contract" },
      ],
      head: { area: "Area", model: "Revenue structure" },
      note: "Deposits are not platform revenue and are kept separate from it. How deposits are collected will be decided after payment-provider agreements and legal review.",
    },
    solutions: {
      kicker: "BUSINESS SOLUTIONS",
      title: "Making rental operations simpler.",
      lead: "Five operating products for rental businesses are being designed as a long-term direction. None has been released yet, and we are listening to businesses considering them.",
      labels: { target: "Customers", features: "Key features", value: "Expected value" },
      items: [
        { name: "SHAREON Rental", lead: "Rental items and assets.", target: "Rental companies, equipment owners", features: "Listing items, prices and terms of use", value: "Rental item information managed in one place" },
        { name: "SHAREON Booking", lead: "Bookings and schedules.", target: "Space operators, rental companies", features: "Availability, booking requests, schedules", value: "Fewer double bookings and missed dates" },
        { name: "SHAREON Inventory", lead: "Inventory, assets and usage status.", target: "Businesses with many assets", features: "Inventory, asset condition, rental history", value: "Asset use and condition at a glance" },
        { name: "SHAREON Business", lead: "Running a rental business.", target: "Rental businesses, companies", features: "Customers, transactions, returns, settlement reports", value: "A clear view of operations to support decisions" },
        { name: "SHAREON Automation", lead: "Automating repetitive work.", target: "Businesses with small teams", features: "Automated notices, reminders and routine steps", value: "Less time on repetitive tasks" },
      ],
      status: "long",
      cta: "Ask about adoption",
    },
    models: {
      kicker: "BUSINESS MODELS",
      title: "Business models by customer type.",
      items: [
        { en: "C2C", body: "Rentals between individuals." },
        { en: "B2C", body: "Business rentals to individuals." },
        { en: "C2B", body: "Individuals providing resources to businesses." },
        { en: "B2B", body: "Equipment and space sharing between companies." },
        { en: "B2G", body: "Sharing-economy work with public institutions." },
        { en: "SaaS", body: "Standard operating products for rental businesses." },
      ],
    },
    next: {
      title: "Create new sharing opportunities with SHAREON.",
      ctas: ["Explore partnerships", "Business inquiry"],
    },
  },

  partnerships: {
    seoTitle: "SHAREON Partnerships | Sharing and rental partners — Newon",
    seoDescription:
      "Individual lenders, rental companies, space operators, logistics and payment partners, institutions and global partners. The ways to join SHAREON’s sharing and rental ecosystem and how the process works.",
    hero: {
      kicker: "SHAREON PARTNERSHIPS",
      title: "Looking for partners\nto grow the value of sharing.",
      lead: "From individual lenders to rental companies, space operators, businesses and institutions, SHAREON is widening the chances to work together so that all kinds of resources are used more efficiently.",
    },
    notice: "SHAREON has no contracted partners yet. The types below are the kinds of collaboration we welcome; they do not refer to any specific company.",
    typesKicker: "PARTNER TYPES",
    typesTitle: "Twelve ways to work together.",
    labels: {
      who: "Who",
      resources: "Resources shared",
      services: "Possible services",
      value: "What SHAREON aims to offer",
      revenue: "Revenue structure",
      terms: "Operating and eligibility conditions",
      status: "Status",
    },
    types: [
      { n: "01", title: "Individual lenders", lead: "Joining personal item rental.", who: "Individuals who want to lend things", resources: "Everyday, hobby, camera and camping gear", services: "Listing items, rental dates and terms", value: "New uses for things that sit idle", revenue: "Rental transaction fee (rate not decided)", terms: "Identity check and allowed-item rules", status: "dev" },
      { n: "02", title: "Rental companies", lead: "Supplying existing rental items and equipment.", who: "Businesses running a rental operation", resources: "Existing rental items and equipment", services: "Business participation, listing, booking management", value: "New customer reach and operating tools", revenue: "Rental transaction fee, business contracts", terms: "Business verification and sector-specific qualifications", status: "dev" },
      { n: "03", title: "Camera and equipment suppliers", lead: "Camera, lighting, video and audio equipment.", who: "People and businesses with production gear", resources: "Cameras, lenses, lighting, video and audio gear", services: "Equipment rental with period-based terms", value: "Higher use of costly equipment", revenue: "Rental transaction fee", terms: "Equipment condition disclosure and agreed damage rules", status: "dev" },
      { n: "04", title: "Camping and leisure suppliers", lead: "Camping, sports and outdoor gear.", who: "People and businesses with outdoor gear", resources: "Camping, hiking, sports and leisure gear", services: "Seasonal and local rentals", value: "Using seasonal gear off-season", revenue: "Rental transaction fee", terms: "Rules for safety-related items", status: "dev" },
      { n: "05", title: "Space operators", lead: "Studios, meeting rooms, practice rooms and event spaces.", who: "People and businesses operating spaces", resources: "Studios, meeting rooms, practice rooms, event spaces", services: "Presenting spaces and managing available hours", value: "Using idle hours", revenue: "Space booking and rental fee", terms: "Proof of the right to use the space (including lease and sublease rights)", status: "dev" },
      { n: "06", title: "Company asset managers", lead: "Company equipment, spaces and idle assets.", who: "Companies with idle assets", resources: "Office, event and exhibition equipment and spaces", services: "Renting company assets, sharing between companies", value: "Earning from idle assets and lowering costs", revenue: "Business-to-business deals, per contract", terms: "Internal approval and asset management rules", status: "long" },
      { n: "07", title: "Long-term rental businesses", lead: "Recurring and long-term rental products.", who: "Businesses offering long-term or recurring rental", resources: "Monthly and recurring products", services: "Long-term agreements, extensions, repeat bookings", value: "Reaching stable long-term customers", revenue: "Per contract, recurring transactions", terms: "Clear long-term terms and cancellation rules", status: "prep" },
      { n: "08", title: "Logistics and collection partners", lead: "Delivery, pickup and return.", who: "Delivery and collection service providers", resources: "Delivery, home collection and recovery capacity", services: "Delivering rented items and collecting returns", value: "Logistics demand from rentals", revenue: "Partnership, per contract", terms: "Agreed responsibility for damage and loss", status: "long" },
      { n: "09", title: "Payment and settlement partners", lead: "Rental payment, deposit and settlement infrastructure.", who: "Payment and settlement service providers", resources: "Payment, deposit handling and settlement infrastructure", services: "Connecting rental payments and settlement", value: "Payment demand suited to sharing and rental", revenue: "Partnership, per contract", terms: "Meeting the relevant laws and payment-provider agreements", status: "prep" },
      { n: "10", title: "Rental SaaS customers", lead: "Operations, booking and asset management products.", who: "Rental businesses that need operating tools", resources: "Booking, asset and customer data", services: "SHAREON operating products for businesses", value: "Standardised and automated operations", revenue: "Monthly or annual subscription, licence", terms: "Terms of use after product launch", status: "long" },
      { n: "11", title: "Public bodies and local governments", lead: "Local sharing economy and public resources.", who: "Local governments, public bodies, schools", resources: "Public equipment, spaces, local shared resources", services: "Co-running local sharing programmes", value: "Better use of public resources", revenue: "Institutional contracts, platform licence", terms: "Each institution’s procurement and contract process", status: "long" },
      { n: "12", title: "Global partners", lead: "Rental and licensing abroad.", who: "Rental businesses and companies abroad", resources: "Rental ecosystems abroad", services: "Licensing standard operating products, localisation", value: "A proven sharing and rental operating model", revenue: "Licences, business contracts", terms: "Local laws and contract terms", status: "long" },
    ],
    process: {
      kicker: "PROCESS",
      title: "How it works.",
      steps: [
        { n: "01", en: "Proposal", label: "Proposal" },
        { n: "02", en: "Review", label: "Review" },
        { n: "03", en: "Discussion", label: "Discussion" },
        { n: "04", en: "Agreement", label: "Agreement" },
        { n: "05", en: "Operation", label: "Operation" },
      ],
      lead: "After we receive a proposal we review the business, legal and operating conditions, then discuss and agree before starting. Results and timing depend on the proposal.",
    },
    next: {
      title: "Building new possibilities for sharing, together.",
      cta: "Partnership inquiry",
    },
  },

  contact: {
    seoTitle: "SHAREON Contact | Sharing and rental inquiries — Newon",
    seoDescription:
      "Questions about the SHAREON app, renting items, equipment or spaces, tools for rental businesses, logistics and payment partnerships, and work with institutions or global partners — through NEWON’s official contact channels.",
    hero: {
      kicker: "SHAREON CONTACT",
      title: "Tell us about new\npossibilities for sharing\nwith SHAREON.",
      lead: "From using the service to renting items, equipment and spaces, business rental solutions and work with institutions — we welcome all kinds of SHAREON inquiries.",
    },
    kicker: "INQUIRY TYPES",
    title: "Choose an inquiry type.",
    lead: "Each type opens NEWON’s official inquiry form or official email. No sign-up is needed.",
    formCta: "Inquiry form",
    mailCta: "Email",
    mailSubjectPrefix: "[SHAREON]",
    items: [
      { n: "01", title: "App use and technical support", body: "Questions about the pilot app and technical topics.", slug: "app-support" },
      { n: "02", title: "Personal item rental", body: "Joining as an individual and how rental works.", slug: "personal-rental" },
      { n: "03", title: "Business equipment rental", body: "Equipment rental by companies and rental businesses.", slug: "business-rental" },
      { n: "04", title: "Space sharing and rental", body: "Space operators and space rental.", slug: "space-sharing" },
      { n: "05", title: "Long-term and recurring rental", body: "Long-term and recurring rental products.", slug: "long-term-rental" },
      { n: "06", title: "Booking, returns and terms", body: "Feedback on booking, returns and terms of use.", slug: "booking-return" },
      { n: "07", title: "SaaS for rental businesses", body: "Considering operating products for businesses.", slug: "rental-saas" },
      { n: "08", title: "Delivery, pickup and logistics", body: "Delivery, collection and return logistics.", slug: "logistics" },
      { n: "09", title: "Payment and settlement infrastructure", body: "Rental payment and settlement infrastructure.", slug: "payments" },
      { n: "10", title: "Resource sharing between companies", body: "Sharing companies’ idle assets.", slug: "b2b-sharing" },
      { n: "11", title: "Public bodies and local governments", body: "Local sharing economy and public resources.", slug: "public-sector" },
      { n: "12", title: "Global and strategic partnership", body: "Expansion abroad, licensing and strategic work.", slug: "global" },
    ],
    guide: {
      kicker: "BEFORE YOU WRITE",
      title: "Please check before you write.",
      items: [
        "Include only what we need to reply: your name, email and your question.",
        "Never include card numbers, account passwords, ID numbers or other sensitive payment or personal information.",
        "SHAREON inquiries are received only through NEWON’s official inquiry form and official email (newon@newon.app).",
        "The app is in pilot development, so there is no customer support for real rentals, bookings, payments or refunds.",
        "Response times depend on the inquiry; we cannot guarantee a reply time.",
      ],
      privacy: "Privacy Policy",
    },
  },
};

/* Other locales: EN content with localized page titles, descriptions and hero lines (no new locales added). */
const LOCAL = {
  ja: {
    overview: { seoTitle: "SHAREON | Newon — シェア・レンタルプラットフォーム", seoDescription: "SHAREONは、個人と企業のモノ・機材・空間をつなぎ、貸し出しから返却までを支えるシェア・レンタルプラットフォームを目指しています。アプリは試験開発中で、実際のレンタルや決済はまだ運営していません。", hero: { title: "所有しなくても、\n必要なときに。" } },
    platform: { seoTitle: "SHAREON プラットフォーム | モノ・機材・空間のレンタル — Newon", seoDescription: "個人のモノ、撮影・アウトドア機材、企業の機材、空間、長期レンタルまで。SHAREONが準備しているシェア・レンタルの領域を紹介します。" },
    business: { seoTitle: "SHAREON ビジネス | シェア・レンタル事業 — Newon", seoDescription: "個人レンタル、企業機材レンタル、空間シェア、長期レンタル、レンタル事業者向けツール、機関・海外との協力。SHAREONの事業構造と進捗を紹介します。" },
    partnerships: { seoTitle: "SHAREON パートナーシップ — Newon", seoDescription: "個人の貸し手、レンタル事業者、空間運営者、物流・決済パートナー、機関・海外パートナーまで。SHAREONとの協力の形と流れを紹介します。" },
    contact: { seoTitle: "SHAREON お問い合わせ — Newon", seoDescription: "SHAREONに関するお問い合わせは、NEWONの公式お問い合わせフォームと公式メールで受け付けています。" },
  },
  es: {
    overview: { seoTitle: "SHAREON | Newon — Plataforma de uso compartido y alquiler", seoDescription: "SHAREON quiere conectar objetos, equipos y espacios de personas y empresas, y acompañar todo el proceso del alquiler a la devolución. La app está en desarrollo piloto; aún no hay alquileres ni pagos reales.", hero: { title: "Sin tenerlo en propiedad.\nJusto cuando lo necesitas." } },
    platform: { seoTitle: "SHAREON Plataforma | Alquiler de objetos, equipos y espacios — Newon", seoDescription: "Objetos personales, equipos de foto y aire libre, equipos de empresa, espacios y alquiler a largo plazo: las áreas que prepara SHAREON." },
    business: { seoTitle: "SHAREON Negocio | Estructura del negocio — Newon", seoDescription: "Alquiler entre personas, equipos de empresa, espacios, largo plazo, herramientas para empresas de alquiler y colaboración con instituciones y socios globales." },
    partnerships: { seoTitle: "SHAREON Alianzas — Newon", seoDescription: "Tipos de colaboración y proceso para unirse al ecosistema de uso compartido y alquiler de SHAREON." },
    contact: { seoTitle: "SHAREON Contacto — Newon", seoDescription: "Consultas sobre SHAREON a través del formulario y el correo oficiales de NEWON." },
  },
  "pt-br": {
    overview: { seoTitle: "SHAREON | Newon — Plataforma de compartilhamento e aluguel", seoDescription: "O SHAREON quer conectar objetos, equipamentos e espaços de pessoas e empresas e apoiar todo o processo, do aluguel à devolução. O app está em desenvolvimento piloto; ainda não há aluguéis ou pagamentos reais.", hero: { title: "Sem precisar ter.\nNa hora em que você precisa." } },
    platform: { seoTitle: "SHAREON Plataforma | Aluguel de objetos, equipamentos e espaços — Newon", seoDescription: "Objetos pessoais, equipamentos de foto e ao ar livre, equipamentos de empresas, espaços e aluguel de longo prazo: as áreas que o SHAREON está preparando." },
    business: { seoTitle: "SHAREON Negócios — Newon", seoDescription: "A estrutura de negócio do SHAREON em compartilhamento e aluguel, e em que ponto cada parte está." },
    partnerships: { seoTitle: "SHAREON Parcerias — Newon", seoDescription: "Formas de colaborar com o ecossistema de compartilhamento e aluguel do SHAREON e como funciona o processo." },
    contact: { seoTitle: "SHAREON Contato — Newon", seoDescription: "Dúvidas sobre o SHAREON pelos canais oficiais de contato da NEWON." },
  },
  fr: {
    overview: { seoTitle: "SHAREON | Newon — Plateforme de partage et de location", seoDescription: "SHAREON veut relier les objets, équipements et espaces des particuliers et des entreprises, et accompagner chaque étape, de la location au retour. L’app est en développement pilote ; aucune location ni aucun paiement réels pour l’instant.", hero: { title: "Pas besoin de posséder.\nJuste quand il le faut." } },
    platform: { seoTitle: "SHAREON Plateforme | Location d’objets, d’équipements et d’espaces — Newon", seoDescription: "Objets personnels, matériel photo et plein air, équipements d’entreprise, espaces et location longue durée : les domaines que prépare SHAREON." },
    business: { seoTitle: "SHAREON Business — Newon", seoDescription: "La structure du modèle d’affaires de SHAREON dans le partage et la location, et l’état d’avancement de chaque volet." },
    partnerships: { seoTitle: "SHAREON Partenariats — Newon", seoDescription: "Les types de collaboration et le processus pour rejoindre l’écosystème de partage et de location de SHAREON." },
    contact: { seoTitle: "SHAREON Contact — Newon", seoDescription: "Questions sur SHAREON via le formulaire et l’e-mail officiels de NEWON." },
  },
  de: {
    overview: { seoTitle: "SHAREON | Newon — Plattform für Teilen und Mieten", seoDescription: "SHAREON will Dinge, Geräte und Räume von Privatpersonen und Unternehmen verbinden und jeden Schritt von der Miete bis zur Rückgabe unterstützen. Die App ist in der Pilotentwicklung; echte Vermietungen und Zahlungen laufen noch nicht.", hero: { title: "Nicht besitzen müssen.\nGenau dann, wenn man es braucht." } },
    platform: { seoTitle: "SHAREON Plattform | Dinge, Geräte und Räume mieten — Newon", seoDescription: "Private Gegenstände, Kamera- und Outdoor-Ausrüstung, Firmengeräte, Räume und Langzeitmiete: die Bereiche, die SHAREON vorbereitet." },
    business: { seoTitle: "SHAREON Business — Newon", seoDescription: "Die Geschäftsstruktur von SHAREON rund um Teilen und Mieten und der Stand der einzelnen Bereiche." },
    partnerships: { seoTitle: "SHAREON Partnerschaften — Newon", seoDescription: "Formen der Zusammenarbeit und Ablauf für Partner im Teil- und Miet-Ökosystem von SHAREON." },
    contact: { seoTitle: "SHAREON Kontakt — Newon", seoDescription: "Anfragen zu SHAREON über das offizielle Kontaktformular und die offizielle E-Mail von NEWON." },
  },
  hi: {
    overview: { seoTitle: "SHAREON | Newon — साझा और किराये का प्लेटफ़ॉर्म", seoDescription: "SHAREON लोगों और व्यवसायों की चीज़ों, उपकरणों और जगहों को जोड़कर किराये से वापसी तक हर कदम में मदद करने वाला प्लेटफ़ॉर्म बनना चाहता है। ऐप पायलट विकास में है; असली किराया और भुगतान अभी शुरू नहीं हुए हैं।", hero: { title: "मालिक बने बिना,\nठीक ज़रूरत के समय।" } },
    platform: { seoTitle: "SHAREON प्लेटफ़ॉर्म — Newon", seoDescription: "निजी सामान, कैमरा और आउटडोर उपकरण, व्यावसायिक उपकरण, जगहें और लंबी अवधि का किराया — SHAREON जिन क्षेत्रों की तैयारी कर रहा है।" },
    business: { seoTitle: "SHAREON बिज़नेस — Newon", seoDescription: "साझा और किराये में SHAREON की व्यावसायिक संरचना और हर हिस्से की मौजूदा स्थिति।" },
    partnerships: { seoTitle: "SHAREON साझेदारी — Newon", seoDescription: "SHAREON के साझा और किराये के इकोसिस्टम में जुड़ने के तरीके और प्रक्रिया।" },
    contact: { seoTitle: "SHAREON संपर्क — Newon", seoDescription: "SHAREON से जुड़े सवाल NEWON के आधिकारिक फ़ॉर्म और ईमेल से भेजें।" },
  },
  id: {
    overview: { seoTitle: "SHAREON | Newon — Platform berbagi dan sewa", seoDescription: "SHAREON ingin menghubungkan barang, peralatan, dan ruang milik perorangan dan bisnis, serta mendukung setiap langkah dari sewa hingga pengembalian. Aplikasi masih dalam pengembangan uji coba; sewa dan pembayaran nyata belum berjalan.", hero: { title: "Tak perlu memiliki.\nTepat saat dibutuhkan." } },
    platform: { seoTitle: "SHAREON Platform | Sewa barang, peralatan, dan ruang — Newon", seoDescription: "Barang pribadi, peralatan kamera dan luar ruang, peralatan bisnis, ruang, dan sewa jangka panjang: bidang yang sedang disiapkan SHAREON." },
    business: { seoTitle: "SHAREON Bisnis — Newon", seoDescription: "Struktur bisnis SHAREON dalam berbagi dan sewa, serta status setiap bagiannya." },
    partnerships: { seoTitle: "SHAREON Kemitraan — Newon", seoDescription: "Bentuk kerja sama dan proses untuk bergabung dengan ekosistem berbagi dan sewa SHAREON." },
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
  return { ...(over ? deepMerge(EN, over) : EN), lang, contentLang: "en" };
}

export const SHAREON_PAGES = [
  { id: "overview", path: "shareon" },
  { id: "platform", path: "shareon/platform" },
  { id: "business", path: "shareon/business" },
  { id: "partnerships", path: "shareon/partnerships" },
  { id: "contact", path: "shareon/contact" },
];

/** Former SHAREON positioning that must not appear on these pages (website brief §2.1). */
export const EXCLUDED_BUSINESS_TERMS = {
  ko: ["중고거래", "중고 거래", "신상품", "소상공인 쇼핑", "공동구매", "단체 구매", "생활 서비스 예약", "체험", "클래스", "이벤트 예약", "디지털 상품"],
  en: ["second-hand", "secondhand", "used goods", "used-goods", "new products", "small-business shopping", "group buying", "group purchase", "group-buy", "life service booking", "classes", "experiences", "digital goods", "digital products"],
};

export { KO, EN };
