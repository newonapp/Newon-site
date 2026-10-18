/**
 * SHAREON — open sharing & rental marketplace (Overview · Platform · Business · Partnerships · Contact).
 * One topic per page: the Overview is the brand story only; services, business areas, partner types and inquiry types
 * each live on their own page.
 *
 * Owner-stated facts this copy must stay inside (2026-10-18):
 *  - SHAREON is a standalone Flutter app (iOS/Android) with five tabs: 홈 · 탐색 · 등록 · 채팅 · 마이.
 *  - Open marketplace: individuals and businesses sign up and list goods, spaces, mobility and services directly —
 *    no separate partnership contract is needed to list.
 *  - NEWON earns a platform transaction commission; the rate is NOT final, so no number is ever shown.
 *  - No self-built escrow. Rentals that need a deposit open only after a PG-supported deposit method is in place, so
 *    payment, deposits and settlement are not live.
 *  - First launch centres on rental / space / service, with approval-based booking first (instant booking later).
 *  - Used-goods sale exists in the app but is secondary.
 *  - Ads are always labelled; no unsigned partner is shown. Basic listing and trading work without a subscription;
 *    subscriptions for pros/businesses are under consideration (no prices).
 *  - Damage-report and trust/approval flows are being designed.
 *  - BABYLOG baby-goods rental and LIVON second-hand trading link to SHAREON.
 * The app is a pilot build and not in the app stores, so nothing here is marked "available now".
 *   dev    = being built in the app (pilot, not released)
 *   prep   = being prepared (needs PG, legal or operations work first)
 *   long   = expansion direction
 *   review = partnership area under review
 * No user counts, volumes, partner names, prices, fees or commission rates.
 * KO and EN are complete; other locales fall back to EN body text with localized SEO lines and the Overview hero line.
 */

/* icon keys → scripts/shareon-icons.mjs */

const KO = {
  lang: "ko",
  brand: "SHAREON",
  status: { dev: "앱에서 개발 중", prep: "준비 중", long: "확장 방향", review: "협력 검토 분야" },
  statusLabel: "진행 상태",
  statusNote:
    "SHAREON 앱은 시범 개발 단계입니다. 실제 대여 확정·결제·보증금·정산은 아직 운영되지 않으며, 이 웹사이트는 소개와 안내만 합니다.",
  subnav: [
    { id: "overview", n: "01", en: "Overview", label: "소개" },
    { id: "platform", n: "02", en: "Platform", label: "서비스" },
    { id: "business", n: "03", en: "Business", label: "비즈니스" },
    { id: "partnerships", n: "04", en: "Partnerships", label: "파트너십" },
    { id: "contact", n: "05", en: "Contact", label: "문의" },
  ],
  considerLabel: "확인할 점",
  areasLabel: "주요 영역",
  partnershipInquiry: "이 유형으로 문의",
  matrix: { provider: "빌려주는 쪽", renter: "빌리는 쪽", person: "개인", business: "기업" },

  /* ─────────────── 01 Overview — brand story only ─────────────── */
  overview: {
    seoTitle: "SHAREON | Newon — 공유·대여 마켓플레이스",
    seoDescription:
      "SHAREON은 개인과 기업이 물건·공간·이동수단·서비스를 직접 등록하고 필요한 사람이 빌려 쓰는 공유·대여 마켓플레이스 앱입니다. 왜 시작했는지, 무엇을 지키는지 소개합니다. 앱은 시범 개발 중입니다.",
    hero: {
      title: "소유하지 않아도,\n필요한 순간에.",
      lead: "SHAREON은 개인과 기업이 가진 물건·공간·이동수단·서비스를 직접 등록하고, 필요한 사람이 필요한 만큼 빌려 쓰는 공유·대여 마켓플레이스입니다. NEWON이 iOS·Android 앱으로 만들고 있습니다.",
      ctaMain: "서비스 살펴보기",
      ctaSub: "문의하기",
    },
    why: {
      kicker: "WHY SHAREON",
      title: "집마다 한 번 쓰고 넣어 둔 물건이 있고,\n어딘가에는 지금 그 물건이 필요한 사람이 있습니다.",
      body: [
        "SHAREON은 그 둘을 잇기 위해 시작했습니다. 사기에는 부담스럽고 자주 쓰지는 않는 물건, 비어 있는 시간이 긴 공간, 필요할 때만 찾게 되는 서비스를 필요한 기간만큼 빌리고 빌려주는 곳입니다.",
        "소유를 줄이자는 이야기가 아닙니다. 이미 가진 것을 더 잘 쓰고, 꼭 필요한 순간에는 더 쉽게 구할 수 있게 하자는 이야기입니다.",
      ],
    },
    gap: {
      kicker: "THE GAP",
      title: "빌리는 일은\n왜 아직 번거로울까요.",
      lead: "SHAREON을 시작하며 정리한 네 가지 문제입니다. 서비스 하나하나보다 이 문제를 먼저 풀고 싶었습니다.",
      rows: [
        { title: "사기에는 아깝고, 빌릴 곳은 흩어져 있습니다", body: "캠핑 장비나 촬영 장비처럼 1년에 몇 번 쓰는 물건도 대개 사서 씁니다. 빌릴 수 있는 곳은 업체마다, 지역마다 따로 흩어져 있어 찾는 데부터 시간이 듭니다." },
        { title: "쓰지 않는 자원은 그대로 잠들어 있습니다", body: "집 안의 장비, 비어 있는 회의실과 작업실, 기업 창고의 유휴 장비는 쓰지 않는 동안에도 보관과 관리에 비용이 듭니다." },
        { title: "모르는 사람에게 맡기기는 망설여집니다", body: "상태가 어떤지, 제때 돌아올지, 망가지면 어떻게 할지에 대한 기준이 없으면 빌려주는 쪽도 빌리는 쪽도 선뜻 나서기 어렵습니다." },
        { title: "작은 사업자는 손님을 만날 창구가 부족합니다", body: "소규모 대여업체와 공간 운영자, 혼자 일하는 서비스 제공자에게는 따로 제휴하지 않고도 손님을 만날 수 있는 열린 창구가 필요합니다." },
      ],
    },
    mission: {
      kicker: "MISSION & VISION",
      items: [
        { k: "MISSION", title: "필요한 것을, 필요한 만큼,\n믿고 빌릴 수 있게.", body: "가까운 곳에서 찾고, 조건을 확인하고, 상태를 기록하고, 제때 돌려주는 일이 자연스러운 대여 경험을 만듭니다." },
        { k: "VISION", title: "누구나 공급자이고,\n누구나 이용자인 생태계.", body: "개인과 기업이 서로 빌려주고 빌리면서, 잠든 자원이 다시 쓰이는 열린 공유·대여 생태계를 그립니다." },
      ],
      line: "대여는 물건이 돌아와야 끝나는 거래입니다. SHAREON은 화면보다 반납까지의 책임과 절차를 먼저 설계합니다.",
    },
    journey: {
      kicker: "USER JOURNEY",
      title: "빌리는 사람과 빌려주는 사람,\n두 개의 여정이 만나는 곳.",
      lead: "SHAREON 앱에서 그리는 대여 여정입니다. 첫 출시는 빌려주는 사람이 요청을 확인하고 승인하는 방식으로 시작합니다. 보증금이 필요한 대여는 결제대행사(PG)가 지원하는 보증금 수단을 갖춘 뒤에 열립니다.",
      laneA: "빌리는 사람",
      laneB: "빌려주는 사람",
      steps: [
        { en: "Need", a: { title: "필요가 생깁니다", body: "주말 캠핑, 하루 촬영, 몇 시간의 회의 공간처럼 잠깐 필요한 순간." }, b: { title: "등록합니다", body: "등록 탭에서 사진·설명·대여 조건·인수 방법을 올립니다." } },
        { en: "Find", a: { title: "찾아봅니다", body: "홈과 탐색 탭에서 지역·카테고리·기간으로 둘러봅니다." }, b: { title: "노출됩니다", body: "가까운 곳에서 찾는 사람에게 등록한 물건이 보입니다." } },
        { en: "Request", a: { title: "요청을 보냅니다", body: "원하는 날짜와 조건을 정해 대여를 요청합니다." }, b: { title: "검토하고 승인합니다", body: "일정과 조건을 보고 직접 승인하거나 거절합니다." } },
        { en: "Talk", a: { title: "채팅으로 맞춥니다", body: "인수 시간과 방법, 궁금한 점을 채팅으로 정합니다." }, b: { title: "인계를 준비합니다", body: "구성품과 상태를 확인하고 약속한 방식으로 넘깁니다." } },
        { en: "Use", a: { title: "이용합니다", body: "받을 때 상태를 함께 확인하고, 기간 동안 씁니다." }, b: { title: "기다립니다", body: "대여 기간과 반납 일정을 마이 탭에서 확인합니다." } },
        { en: "Return", a: { title: "돌려줍니다", body: "반납하고 상태를 확인한 뒤 거래를 평가합니다." }, b: { title: "확인하고 마무리합니다", body: "돌아온 상태를 확인하고, 문제가 있으면 파손 신고 절차를 따릅니다." } },
      ],
    },
    people: {
      kicker: "WHO IT IS FOR",
      title: "SHAREON을\n함께 쓰게 될 사람들.",
      lead: "한 사람이 오늘은 빌리는 사람이고, 다음 주에는 빌려주는 사람이 될 수 있습니다.",
      items: [
        { en: "Occasional users", title: "가끔 필요한 사람", body: "1년에 한두 번 쓰는 물건을 사지 않고, 필요한 날만 빌려 쓰고 싶은 개인." },
        { en: "Neighbours who share", title: "가진 것을 나누는 사람", body: "집에 잠든 장비와 물건을 가까운 이웃에게 빌려주고 싶은 개인." },
        { en: "Small businesses", title: "손님을 찾는 사업자", body: "대여업체, 공간 운영자, 서비스 제공자처럼 따로 제휴하지 않고 바로 등록해 손님을 만나고 싶은 사업자." },
        { en: "Companies", title: "자원을 아끼려는 기업", body: "비어 있는 장비와 공간을 다른 곳과 나누거나, 필요한 장비를 짧게 빌리려는 기업." },
      ],
    },
    principles: {
      kicker: "PRINCIPLES",
      title: "SHAREON이 지키는\n여덟 가지 원칙.",
      lead: "기능이 늘어나도 바꾸지 않을 약속입니다.",
      items: [
        { title: "누구나 직접 참여합니다", body: "개인과 기업 누구나 앱에서 직접 가입해 등록합니다. 등록을 위해 따로 제휴 계약을 맺을 필요가 없습니다." },
        { title: "기본 거래는 구독 없이", body: "기본 등록과 거래는 구독하지 않아도 할 수 있어야 합니다." },
        { title: "승인형 예약부터", body: "처음에는 빌려주는 사람이 요청을 보고 직접 승인합니다. 즉시 예약은 신뢰 장치가 갖춰진 다음 단계입니다." },
        { title: "돈은 검증된 결제 수단으로", body: "보증금이 필요한 대여는 PG가 지원하는 보증금 수단을 갖춘 뒤에 엽니다. SHAREON이 직접 돈을 맡아 두는 에스크로는 만들지 않습니다." },
        { title: "광고는 언제나 광고로", body: "유료 노출과 광고에는 항상 광고임을 표시합니다." },
        { title: "계약하지 않은 이름은 쓰지 않습니다", body: "실제로 협력하지 않는 기업의 이름이나 로고를 파트너처럼 보여 주지 않습니다." },
        { title: "상태와 책임은 기록으로", body: "주고받을 때 상태를 남기고, 파손 신고와 확인 절차를 미리 정해 둡니다." },
        { title: "개인정보는 최소한으로", body: "정확한 주소는 거래가 정해지기 전까지 공개하지 않고, 사진의 위치 정보는 지웁니다." },
      ],
    },
    now: {
      kicker: "WHERE WE ARE",
      title: "지금 준비된 것과\n아직 열지 않은 것.",
      lead: "SHAREON은 시범 개발 단계입니다. 무엇이 준비 중이고 무엇이 아직 열리지 않았는지 숨기지 않고 정리했습니다.",
      head: { item: "구분", now: "지금", next: "다음" },
      rows: [
        { item: "앱", now: "iOS·Android 앱 시범 개발 중 · 앱스토어 미출시", next: "대여·공간·서비스 중심으로 첫 출시" },
        { item: "예약", now: "승인형 예약 요청을 개발 중 · 예약 확정은 미운영", next: "거래 경험이 쌓인 뒤 즉시 예약 검토" },
        { item: "결제·보증금·정산", now: "운영하지 않음", next: "PG가 지원하는 보증금 수단을 갖춘 뒤 대여 오픈" },
        { item: "파손 신고·승인 흐름", now: "설계 중", next: "법률 검토와 약관 확정 후 운영" },
        { item: "중고 판매", now: "앱에 있는 보조 기능", next: "중심은 계속 공유·대여" },
        { item: "구독", now: "전문가·사업자 대상 검토 중 · 가격 미정", next: "기본 등록과 거래는 구독 없이 유지" },
      ],
    },
    newon: {
      kicker: "INSIDE NEWON",
      title: "NEWON 안에서\nSHAREON이 맡는 일.",
      lead: "NEWON은 삶의 단계와 생활 영역마다 필요한 앱을 만듭니다. 그 안에서 SHAREON은 ‘빌리고 빌려주는 일’을 맡습니다.",
      items: [
        { name: "BABYLOG", link: "babylog", body: "아이가 자라며 금방 작아지는 육아용품의 대여는 SHAREON으로 이어집니다.", flow: true },
        { name: "LIVON", link: "livon", body: "생활 정보 속에서 생기는 중고 거래는 SHAREON으로 이어집니다.", flow: true },
        { name: "MY WORLD", link: "myworld", body: "여행 계획과 기록은 MY WORLD가, 여행·캠핑 장비 대여는 SHAREON이 맡습니다." },
        { name: "PETLOG · ONGIL", body: "반려동물과 시니어의 생활은 각 앱이 맡고, 공유·대여가 필요한 순간은 SHAREON이 맡습니다." },
      ],
      center: "공유·대여",
    },
    pages: {
      kicker: "MORE ABOUT SHAREON",
      title: "더 자세한 내용은\n각 메뉴에서.",
      items: [
        { id: "platform", body: "18개 서비스 영역과 대여 흐름" },
        { id: "business", body: "14개 사업군과 사업 모델" },
        { id: "partnerships", body: "14가지 협력 유형과 절차" },
        { id: "contact", body: "문의 유형과 공식 연락처" },
      ],
    },
  },

  /* ─────────────── 02 Platform ─────────────── */
  platform: {
    seoTitle: "SHAREON 서비스 | 18개 서비스 영역과 대여 흐름 — Newon",
    seoDescription:
      "물건·공간·서비스 대여부터 등록, 승인형 예약 요청, 채팅, 보증금, 반납·파손 신고, 앱의 다섯 탭까지. SHAREON 앱이 준비하는 18개 서비스 영역과 각 영역의 진행 상태입니다.",
    hero: {
      title: "빌리고 빌려주는 일을\n하나의 앱에서.",
      lead: "물건·공간·서비스 대여부터 등록·예약 요청·채팅·반납까지, SHAREON 앱이 준비하는 18개 서비스 영역입니다. 실제 이용은 앱에서 하며, 이 웹사이트는 소개만 합니다.",
      ctaMain: "비즈니스 살펴보기",
      ctaSub: "문의하기",
    },
    indexKicker: "18 SERVICES",
    indexTitle: "18개 서비스,\n네 개의 묶음.",
    indexLead: "항목을 누르면 해당 설명으로 이동합니다. 모든 서비스에는 지금의 진행 상태를 함께 표시했습니다.",
    groups: [
      { id: "a", kicker: "A · THINGS", title: "물건 대여", lead: "자주 쓰지는 않지만 사기에는 부담스러운 물건들입니다." },
      { id: "b", kicker: "B · SPACES, SERVICES & EQUIPMENT", title: "공간·서비스·장비", lead: "첫 출시에서 물건 대여와 함께 중심이 되는 공간과 서비스, 그리고 자격 확인이 필요한 장비와 이동수단입니다." },
      { id: "c", kicker: "C · RENTAL FLOW", title: "대여 흐름", lead: "목록을 보여 주는 데서 끝나지 않고, 대여가 반납까지 안전하게 끝나는 흐름을 만듭니다. 각 단계는 실제 구현 상태대로 표시합니다." },
      { id: "d", kicker: "D · TRUST & APP", title: "신뢰와 앱", lead: "믿고 거래할 수 있는 장치와, 이 모든 것을 담는 앱입니다." },
    ],
    services: [
      { n: "01", g: "a", icon: "everyday", en: "Everyday goods", title: "생활용품 대여", body: "청소 장비, 공구, 사다리, 이사 도구처럼 가끔 필요한 생활 장비를 필요한 날만큼 빌립니다.", areas: ["청소 장비", "공구", "고압세척기", "사다리", "생활 가전", "이사 도구"], note: "기본 사용 안내와 구성품 확인이 필요합니다.", status: "dev" },
      { n: "02", g: "a", icon: "electronics", en: "Electronics", title: "전자기기 대여", body: "노트북·태블릿·프로젝터·모니터·게임기처럼 값비싼 기기를 짧은 기간 씁니다.", areas: ["노트북", "태블릿", "프로젝터", "모니터", "게임기"], note: "기기 초기화와 상태 검수, 인수인계 절차가 먼저 갖춰져야 합니다.", status: "prep" },
      { n: "03", g: "a", icon: "camera", en: "Camera & production", title: "카메라·촬영장비 대여", body: "개인 크리에이터부터 작은 제작팀까지, 촬영에 필요한 장비를 하루 단위로 빌립니다.", areas: ["카메라", "렌즈", "조명", "삼각대", "마이크", "영상 장비"], note: "장비 상태 고지와 파손 기준에 대한 합의가 필요합니다.", status: "dev" },
      { n: "04", g: "a", icon: "camping", en: "Travel & camping", title: "여행·캠핑용품 대여", body: "캐리어·텐트·캠핑 의자·침낭처럼 여행과 캠핑에 필요한 장비를 짧게 빌립니다.", areas: ["캐리어", "텐트", "캠핑 의자", "테이블", "침낭", "여행 소품"], note: "계절별 수요가 크고, 세척·건조 상태 확인이 중요합니다.", status: "dev" },
      { n: "05", g: "a", icon: "fashion", en: "Fashion & events", title: "패션·행사용품 대여", body: "행사와 촬영에 필요한 의상·가방·소품을 그날만 빌립니다.", areas: ["행사 의류", "촬영 의상", "가방", "액세서리", "파티 소품"], note: "진품 여부, 위생·세탁, 훼손 책임을 먼저 정해야 합니다.", status: "prep" },
      { n: "06", g: "a", icon: "sports", en: "Sports & leisure", title: "스포츠·레저용품 대여", body: "스키·스노보드·골프·아웃도어 장비를 시즌에 맞춰 빌립니다.", areas: ["스키", "스노보드", "골프 장비", "운동 장비", "아웃도어 장비"], note: "안전 상태와 보호장비, 사용 조건을 확인해야 합니다.", status: "prep" },
      { n: "07", g: "b", icon: "space", en: "Spaces", title: "공간 대여", body: "회의실·스튜디오·연습실·작업실·파티룸을 시간이나 하루 단위로 빌려주고 빌립니다.", areas: ["회의실", "촬영 스튜디오", "연습실", "작업실", "파티룸", "전시 공간"], note: "공간을 빌려줄 권한과 소방·안전·영업 규정을 확인합니다. 숙박·주차는 적법한 조건이 확인되기 전까지 다루지 않습니다.", status: "dev" },
      { n: "08", g: "b", icon: "pro", en: "Services", title: "서비스 등록", body: "설치·조립, 촬영 보조, 운반 도움처럼 사람이 직접 제공하는 서비스를 등록하고 예약 요청을 받습니다.", areas: ["설치·조립", "촬영 보조", "운반 도움", "출장 서비스", "요청 승인"], note: "자격이 필요한 서비스는 자격 확인 기준을 함께 마련합니다. 의료·법률처럼 전문 자격이 필요한 영역은 다루지 않습니다.", status: "dev" },
      { n: "09", g: "b", icon: "office", en: "Professional equipment", title: "전문·사무 장비 대여", body: "측정·현장 작업 장비부터 복합기·회의·행사 장비까지, 사업자와 기업에 필요한 장비를 빌립니다.", areas: ["측정 장비", "현장 작업 장비", "복합기", "회의·행사 장비", "사무 가구"], note: "장비별 사용 자격, 안전교육, 운송·유지보수 조건을 검토해야 합니다.", status: "long" },
      { n: "10", g: "b", icon: "mobility", en: "Mobility", title: "이동수단 대여", body: "자전거와 이동 장비를 중심으로 검토하며, 차량은 자격을 갖춘 사업자를 통해서만 다룹니다.", areas: ["자전거", "이동 장비", "적격 사업자 차량"], note: "개인 간 무허가 차량 유상 대여는 허용하지 않습니다.", status: "long" },
      { n: "11", g: "c", icon: "search", en: "List & discover", title: "등록과 탐색", body: "등록 탭에서 사진·설명·대여 조건을 올리고, 홈과 탐색 탭에서 지역·카테고리·기간으로 찾습니다. 개인도 사업자도 따로 제휴하지 않고 직접 등록합니다.", areas: ["사진 등록", "카테고리", "대여 조건", "지역 검색", "기간 필터"], note: "사진의 위치 정보는 등록할 때 지웁니다. 유료 노출은 항상 광고로 표시합니다.", status: "dev" },
      { n: "12", g: "c", icon: "calendar", en: "Approval booking", title: "승인형 예약 요청", body: "원하는 날짜와 조건으로 요청하면, 빌려주는 사람이 확인하고 승인하거나 거절합니다. 즉시 예약은 다음 단계에서 검토합니다.", areas: ["이용 가능 기간", "예약 요청", "승인·거절", "일정 관리"], note: "요청 화면은 개발 중이며, 예약 확정은 아직 운영되지 않습니다.", status: "dev" },
      { n: "13", g: "c", icon: "chat", en: "Chat", title: "채팅과 일정 조율", body: "채팅 탭에서 궁금한 점을 묻고, 인수 시간과 방법을 맞춥니다.", areas: ["1:1 채팅", "인수 시간 조율", "인수 방법", "요청 알림"], note: "정확한 주소는 거래가 정해지기 전까지 공개하지 않습니다.", status: "dev" },
      { n: "14", g: "c", icon: "payment", en: "Payment & deposit", title: "결제와 보증금", body: "PG가 지원하는 보증금 수단을 갖춘 뒤에 보증금이 필요한 대여를 엽니다. SHAREON이 직접 돈을 맡아 두는 에스크로는 만들지 않습니다.", areas: ["대여 결제", "보증금", "환불 규정", "정산"], note: "지금은 결제·보증금·정산을 운영하지 않습니다. 보증금은 플랫폼 매출과 구분합니다.", status: "prep" },
      { n: "15", g: "c", icon: "return", en: "Return & damage report", title: "반납과 파손 신고", body: "반납할 때 상태를 함께 확인하고, 파손·분실·연체가 생기면 신고와 확인 절차로 처리하는 흐름을 설계하고 있습니다.", areas: ["상태 확인", "구성품 확인", "파손 신고", "연체 처리"], note: "처리 기준은 법률 검토를 거쳐 약관과 함께 정합니다.", status: "prep" },
      { n: "16", g: "d", icon: "trust", en: "Trust & approval", title: "신뢰·승인 흐름", body: "본인·사업자 확인, 품목별 등록 승인, 신고·차단, 거래 후기로 믿고 거래할 수 있는 환경을 만듭니다.", areas: ["본인 확인", "사업자 확인", "등록 승인", "신고·차단", "거래 후기"], note: "신고 기능은 앱에서 개발 중이고, 후기는 실제 거래가 시작된 뒤 운영합니다.", status: "prep" },
      { n: "17", g: "d", icon: "tag", en: "Used goods", title: "중고 판매", body: "더 이상 빌려줄 일이 없는 물건은 중고로 팔 수도 있습니다. 앱에 있는 보조 기능이며, SHAREON의 중심은 공유·대여입니다.", areas: ["중고 등록", "판매 채팅", "LIVON 중고 거래 연결"], note: "판매 대금 결제는 대여와 마찬가지로 아직 운영되지 않습니다.", status: "dev" },
      { n: "18", g: "d", icon: "app", en: "App & accessibility", title: "앱과 접근성", body: "iOS·Android 앱의 다섯 탭, 홈·탐색·등록·채팅·마이로 구성됩니다. 실제 이용은 앱에서만 합니다.", areas: ["홈", "탐색", "등록", "채팅", "마이", "다크 모드", "큰 글자"], note: "아직 앱스토어에 출시되지 않아 다운로드 링크가 없습니다.", status: "dev" },
    ],
    tabs: [
      { k: "홈", body: "주변의 새 등록과 추천" },
      { k: "탐색", body: "지역·카테고리·기간 검색" },
      { k: "등록", body: "물건·공간·서비스 올리기" },
      { k: "채팅", body: "요청과 인수 조율" },
      { k: "마이", body: "대여 내역과 설정" },
    ],
    launch: {
      kicker: "FIRST LAUNCH",
      title: "첫 출시는\n대여·공간·서비스부터.",
      lead: "한꺼번에 모든 것을 열지 않습니다. 처음 열 범위와 그다음에 검토할 범위를 나누었습니다.",
      head: { item: "구분", first: "첫 출시", later: "그다음" },
      rows: [
        { item: "대상", first: "물건 대여 · 공간 · 서비스", later: "전문 장비 · 기업 자산 · 이동수단 사업자 연계" },
        { item: "예약 방식", first: "빌려주는 사람이 승인하는 예약 요청", later: "즉시 예약 검토" },
        { item: "결제·보증금", first: "PG 보증금 수단을 갖춘 뒤 보증금 대여 오픈", later: "정산·환불 흐름 고도화" },
        { item: "거래 범위", first: "공유·대여 중심 · 중고 판매는 보조", later: "중심은 그대로 공유·대여" },
        { item: "이용 조건", first: "기본 등록과 거래는 구독 없이", later: "전문가·사업자용 구독 검토 (가격 미정)" },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "자주 묻는 질문.",
      items: [
        { q: "웹사이트에서 빌리거나 예약할 수 있나요?", a: "아니요. 웹사이트는 소개만 합니다. 등록·예약 요청·채팅은 SHAREON 앱에서 이용하며, 앱은 아직 시범 개발 단계라 앱스토어에 출시되지 않았습니다." },
        { q: "등록하려면 제휴 계약이 필요한가요?", a: "필요 없습니다. 개인과 사업자 누구나 앱에서 직접 가입해 등록하는 구조입니다. 다만 품목에 따라 자격이나 안전 기준을 확인할 수 있습니다." },
        { q: "구독해야 쓸 수 있나요?", a: "기본 등록과 거래는 구독 없이 할 수 있도록 설계합니다. 전문가·사업자를 위한 구독은 검토 중이며, 가격은 정해지지 않았습니다." },
        { q: "보증금은 어떻게 처리되나요?", a: "보증금이 필요한 대여는 PG가 지원하는 보증금 수단을 갖춘 뒤에 엽니다. SHAREON이 직접 돈을 맡아 두는 에스크로는 만들지 않으며, 지금은 결제·보증금·정산을 운영하지 않습니다." },
        { q: "왜 즉시 예약이 아니라 승인형인가요?", a: "처음에는 빌려주는 사람이 요청을 보고 직접 판단할 수 있어야 한다고 봅니다. 거래 경험이 쌓이고 신뢰 장치가 갖춰지면 즉시 예약을 검토합니다." },
        { q: "광고는 어떻게 보이나요?", a: "유료 노출이나 광고에는 항상 광고임을 표시합니다. 표시 없이 섞어 보여 주지 않습니다." },
      ],
    },
    next: {
      kicker: "NEXT",
      title: "이 서비스들이 모여\n어떤 사업이 되는지.",
      lead: "14개 사업군과 사업 모델, 수익 구조는 비즈니스 메뉴에서 정리했습니다.",
      ctas: ["비즈니스 살펴보기", "파트너십 살펴보기"],
    },
  },

  /* ─────────────── 03 Business ─────────────── */
  business: {
    seoTitle: "SHAREON 비즈니스 | 14개 사업군과 사업 모델 — Newon",
    seoDescription:
      "SHAREON의 14개 공유·대여 사업군, C2C·B2C·B2B·B2G 사업 모델, 수익 기회와 그 전제, 단계별 실행 계획을 소개합니다. 수수료율과 가격은 정해지지 않았습니다.",
    hero: {
      title: "빌려주고 빌리는 거래가\n이어지는 사업을 만듭니다.",
      lead: "SHAREON은 개인과 기업이 함께 공급자이자 이용자가 되는 양면 마켓플레이스입니다. 14개 사업군과 사업 모델, 수익 기회를 정직한 전제와 함께 정리했습니다.",
      ctaMain: "파트너십 살펴보기",
      ctaSub: "사업 문의하기",
    },
    structure: {
      kicker: "BUSINESS STRUCTURE",
      title: "누구나 공급자이고,\n누구나 이용자입니다.",
      lead: "빌려주는 쪽과 빌리는 쪽이 각각 개인일 수도, 기업일 수도 있습니다. 네 칸은 사업 구조를 설명하며, 모두 구현되었다는 뜻은 아닙니다.",
      items: [
        { en: "C2C", title: "개인 간 공유·대여", body: "개인이 가진 물건과 장비를 이웃에게 빌려줍니다. 첫 출시의 중심입니다." },
        { en: "C2B", title: "개인에서 기업으로", body: "행사·촬영에 필요한 개인 소유 장비를 기업이 빌립니다." },
        { en: "B2C", title: "기업에서 개인으로", body: "대여업체·공간 운영자·서비스 제공자가 개인 손님을 만납니다." },
        { en: "B2B", title: "기업 간 공유·대여", body: "기업끼리 유휴 장비와 공간을 빌려주고 빌립니다." },
      ],
    },
    areas: {
      kicker: "14 BUSINESS AREAS",
      title: "14개 사업군,\n여섯 개의 묶음.",
      lead: "왼쪽 목록은 묶음별 위치를 알려 줍니다. 각 사업군에는 대상, 핵심 고객, 수익 방식, 진행 상태를 함께 적었습니다.",
      labels: { targets: "대상", customer: "핵심 고객", revenue: "수익 방식" },
      groups: [
        { id: "g1", n: "01", en: "Everyday & electronics", title: "생활·전자", body: "가장 자주 찾게 될 생활 속 대여입니다." },
        { id: "g2", n: "02", en: "Leisure & creation", title: "여가·창작", body: "계절과 행사, 촬영처럼 기간이 분명한 대여입니다." },
        { id: "g3", n: "03", en: "Spaces & services", title: "공간·서비스", body: "첫 출시에서 물건 대여와 함께 중심이 되는 영역입니다." },
        { id: "g4", n: "04", en: "Pro equipment & mobility", title: "전문 장비·이동", body: "자격과 안전 확인이 먼저 필요한 영역입니다." },
        { id: "g5", n: "05", en: "Local & corporate sharing", title: "지역·기업 공유", body: "가까운 지역과 기업의 잠든 자원을 연결합니다." },
        { id: "g6", n: "06", en: "Operations & expansion", title: "운영·확장", body: "사업자를 위한 도구와 공공·해외로의 확장입니다." },
      ],
      items: [
        { n: "01", g: "g1", icon: "everyday", en: "Everyday goods rental", title: "생활용품 대여", body: "청소기·공구·생활 가전처럼 가끔 쓰는 생활 장비를 개인과 가정이 필요한 날만 빌립니다.", targets: ["청소 장비", "공구", "생활 가전", "이사 도구"], customer: "개인·가정·소규모 사업자", revenue: "거래 수수료", status: "dev" },
        { n: "02", g: "g1", icon: "electronics", en: "Electronics rental", title: "전자기기 대여", body: "노트북·태블릿·프로젝터를 시험 기간이나 출장, 행사 기간에만 씁니다. 기기 초기화와 상태 검수가 먼저 필요합니다.", targets: ["노트북", "태블릿", "프로젝터", "모니터"], customer: "개인·프리랜서·기업", revenue: "거래 수수료", status: "prep" },
        { n: "03", g: "g2", icon: "camera", en: "Camera & production", title: "카메라·촬영장비 대여", body: "크리에이터와 작은 제작팀이 촬영 일정에 맞춰 장비를 빌립니다. 장비를 가진 개인과 대여점이 함께 공급자가 됩니다.", targets: ["카메라", "렌즈", "조명", "음향 장비"], customer: "크리에이터·소규모 제작팀", revenue: "거래 수수료", status: "dev" },
        { n: "04", g: "g2", icon: "camping", en: "Travel & camping", title: "여행·캠핑용품 대여", body: "여행과 캠핑 시즌에 맞춰 장비를 빌립니다. 여행 계획은 MY WORLD가, 장비 대여는 SHAREON이 맡습니다.", targets: ["캐리어", "텐트", "캠핑 가구", "침낭"], customer: "개인·가족·여행자", revenue: "거래 수수료", status: "dev" },
        { n: "05", g: "g2", icon: "fashion", en: "Fashion & events", title: "패션·행사용품 대여", body: "행사·촬영용 의상과 소품을 하루 단위로 빌립니다. 진품 여부와 위생·세탁 기준을 먼저 정합니다.", targets: ["행사 의류", "가방", "액세서리", "파티 소품"], customer: "개인·행사 기획자·촬영팀", revenue: "거래 수수료", status: "prep" },
        { n: "06", g: "g2", icon: "sports", en: "Sports & leisure", title: "스포츠·레저용품 대여", body: "스키·골프·아웃도어 장비를 시즌과 지역에 맞춰 빌립니다. 안전 상태와 보호장비 기준이 중요합니다.", targets: ["스키·보드", "골프", "운동 장비", "아웃도어"], customer: "개인·동호회·레저 사업자", revenue: "거래 수수료", status: "prep" },
        { n: "07", g: "g3", icon: "space", en: "Space rental", title: "공간 대여", body: "회의실·스튜디오·작업실처럼 비어 있는 시간이 긴 공간을 시간 단위로 빌려줍니다. 운영자의 권한과 안전·영업 규정을 먼저 확인합니다.", targets: ["회의실", "스튜디오", "연습실", "파티룸"], customer: "공간 운영자·개인·기업", revenue: "거래 수수료 · 사업자 구독 검토", status: "dev" },
        { n: "08", g: "g3", icon: "pro", en: "Service marketplace", title: "서비스 연결", body: "설치·조립, 촬영 보조, 운반 도움처럼 사람이 제공하는 서비스를 등록하고 예약 요청을 받습니다. 전문 자격이 필요한 영역은 다루지 않습니다.", targets: ["설치·조립", "촬영 보조", "운반 도움"], customer: "1인 서비스 제공자·소상공인", revenue: "거래 수수료 · 사업자 구독 검토", status: "dev" },
        { n: "09", g: "g4", icon: "office", en: "Professional & office equipment", title: "전문·사무 장비 대여", body: "측정·현장 작업 장비와 복합기·회의·행사 장비를 기업과 사업자가 필요한 기간만 빌립니다. 사용 자격과 운송·보험 조건을 검토합니다.", targets: ["측정 장비", "현장 장비", "사무기기", "행사 장비"], customer: "기업·기관·적격 사업자", revenue: "거래 수수료 · 기업 계약", status: "long" },
        { n: "10", g: "g4", icon: "mobility", en: "Mobility partners", title: "이동수단 연계", body: "자전거와 이동 장비를 중심으로 하고, 차량은 자격을 갖춘 사업자 연계만 다룹니다. 개인 간 무허가 차량 유상 대여는 허용하지 않습니다.", targets: ["자전거", "이동 장비", "적격 사업자 차량"], customer: "적격 이동수단 사업자·개인", revenue: "거래 수수료 · 사업자 계약", status: "long" },
        { n: "11", g: "g5", icon: "local", en: "Local sharing", title: "지역 기반 공유", body: "같은 동네에서 쓰지 않는 물건을 가까운 이웃과 나눕니다. 짧은 거리가 인수·반납의 부담을 줄입니다.", targets: ["근거리 대여", "동네 자원", "지역 대여점"], customer: "지역 주민·지역 사업자", revenue: "거래 수수료", status: "dev" },
        { n: "12", g: "g5", icon: "corporate", en: "Corporate asset sharing", title: "기업 자산 공유", body: "기업의 유휴 장비와 공간을 다른 기업이나 개인 사업자에게 빌려줍니다. 내부 승인과 자산 관리 기준을 함께 설계합니다.", targets: ["유휴 장비", "유휴 공간", "장기 대여"], customer: "기업·개인 사업자", revenue: "기업 계약 · 거래 수수료", status: "long" },
        { n: "13", g: "g6", icon: "saas", en: "Tools for businesses", title: "사업자 운영 도구", body: "대여업체·공간 운영자를 위한 예약·재고·고객 관리 도구와 전문가·사업자용 구독을 검토합니다. 고객별 외주 개발이 아닌 자체 표준 제품입니다.", targets: ["예약 관리", "재고·자산", "고객 관리", "운영 리포트"], customer: "대여업체·공간 운영자·서비스 제공자", revenue: "구독 (검토 중 · 가격 미정)", status: "long" },
        { n: "14", g: "g6", icon: "global", en: "Public & global sharing", title: "공공·글로벌 공유", body: "지자체·공공기관의 공유 자원 사업과 해외 현지화를 장기적으로 검토합니다.", targets: ["공공 자원 공유", "해외 현지화", "라이선스"], customer: "지자체·공공기관·해외 파트너", revenue: "기관 계약 · 라이선스", status: "long" },
      ],
    },
    models: {
      kicker: "BUSINESS MODELS",
      title: "사업 모델 한눈에 보기.",
      lead: "누가 누구에게 빌려주는지에 따라 모델을 나누었습니다. 수익 방식은 구조를 설명할 뿐이며, 요율과 가격은 정해지지 않았습니다.",
      head: { model: "모델", flow: "거래 구조", example: "예시", revenue: "수익 방식", status: "상태" },
      rows: [
        { code: "C2C", flow: "개인 → 개인", example: "캠핑 장비, 생활 장비, 촬영 장비", revenue: "플랫폼 거래 수수료", status: "dev" },
        { code: "B2C", flow: "대여업체·공간 운영자·서비스 제공자 → 개인", example: "촬영 장비 대여점, 스튜디오, 설치 서비스", revenue: "거래 수수료 · 사업자 구독 검토", status: "dev" },
        { code: "C2B", flow: "개인 → 기업", example: "행사·촬영용 개인 장비", revenue: "거래 수수료", status: "long" },
        { code: "B2B", flow: "기업 ↔ 기업", example: "유휴 장비·공간 공유, 장기 대여", revenue: "기업 계약 · 거래 수수료", status: "long" },
        { code: "B2G", flow: "기업·플랫폼 ↔ 공공기관", example: "지자체 공유 자원 사업", revenue: "기관 계약", status: "long" },
        { code: "AD", flow: "대여업체·브랜드 → 이용자 노출", example: "광고로 표시된 유료 노출", revenue: "광고", status: "prep" },
        { code: "GLOBAL", flow: "SHAREON → 해외 파트너", example: "현지화, 운영 모델 라이선스", revenue: "라이선스", status: "long" },
      ],
    },
    revenue: {
      kicker: "REVENUE",
      title: "수익은 거래가\n끝난 뒤에 생깁니다.",
      paras: [
        "SHAREON의 기본 수익은 플랫폼에서 완료된 거래에 대해 NEWON이 받는 거래 수수료입니다. 수수료율은 아직 정하지 않았으며, 정해지면 앱과 약관에서 먼저 알립니다.",
        "그 위에 전문가·사업자를 위한 구독, 항상 광고로 표시되는 유료 노출, 기업·기관과의 계약이 더해질 수 있습니다. 그래도 기본 등록과 거래는 구독 없이 할 수 있어야 한다는 원칙은 바뀌지 않습니다.",
        "SHAREON은 자체 에스크로를 만들지 않습니다. 보증금은 PG를 통해 처리하며 플랫폼 매출로 잡지 않습니다.",
      ],
      caveatsTitle: "숫자보다 먼저 밝혀 둘 전제",
      caveats: [
        "결제·보증금·정산이 열리기 전까지 거래 수수료 매출은 생기지 않습니다.",
        "거래가 늘수록 파손·분실·분쟁 처리와 고객 지원 비용도 함께 늘어납니다.",
        "양면 마켓플레이스는 빌려줄 물건과 빌릴 사람이 함께 모일 때까지 시간이 걸립니다.",
        "구독·광고·기업 계약은 모두 검토 단계이며, 가격과 조건은 정해지지 않았습니다.",
        "이 페이지에는 매출 전망이나 이용자 수를 싣지 않습니다.",
      ],
    },
    roadmap: {
      kicker: "ROADMAP",
      title: "카테고리보다,\n거래가 먼저입니다.",
      lead: "카테고리를 빠르게 늘리기보다, 특정 지역과 카테고리에서 충분한 물건과 이용자를 먼저 모읍니다. 단계별 일정은 정하지 않았습니다.",
      now: "현재 위치: 1단계를 앱에서 시범 개발 중입니다.",
      steps: [
        { n: "01", title: "핵심 마켓플레이스", tag: "지금", body: "개인·사업자 가입과 등록, 탐색, 승인형 예약 요청, 채팅, 마이 탭의 기본 흐름을 다듬습니다." },
        { n: "02", title: "대여 열기", body: "PG가 지원하는 보증금 수단을 갖춘 뒤 보증금이 필요한 대여를 열고, 파손 신고와 승인 흐름을 운영합니다." },
        { n: "03", title: "카테고리와 지역 넓히기", body: "수요가 확인된 카테고리와 지역부터 넓히고, 즉시 예약을 검토합니다." },
        { n: "04", title: "사업자와 기업", body: "전문가·사업자용 구독과 운영 도구, 기업 자산 공유와 B2B 거래를 검토합니다." },
        { n: "05", title: "공공과 해외", body: "공공 자원 공유 사업과 해외 현지화를 장기적으로 검토합니다." },
      ],
    },
    focus: {
      kicker: "FOCUS",
      title: "공유·대여에 집중합니다.",
      lead: "할 수 있는 일은 많지만, SHAREON의 중심은 하나입니다.",
      points: [
        { n: "01", title: "중심은 공유·대여", body: "중고 판매는 앱에 있는 보조 기능입니다. 사업의 무게중심은 빌려주고 빌리는 거래에 둡니다." },
        { n: "02", title: "작게 시작해 깊게", body: "양면 마켓플레이스이므로 한 지역, 한 카테고리에서 공급과 이용자를 먼저 모은 뒤 넓힙니다." },
        { n: "03", title: "자체 제품으로", body: "사업자 운영 도구도 고객별 외주 개발이 아닌, SHAREON의 표준 제품으로 만듭니다." },
      ],
    },
    next: {
      kicker: "NEXT",
      title: "SHAREON과 함께\n공유의 기회를 만들어 보세요.",
      ctas: ["파트너십 살펴보기", "사업 문의하기"],
    },
  },

  /* ─────────────── 04 Partnerships ─────────────── */
  partnerships: {
    seoTitle: "SHAREON 파트너십 | 14가지 협력 유형과 절차 — Newon",
    seoDescription:
      "SHAREON은 제휴 계약 없이도 누구나 등록하는 열린 마켓플레이스입니다. 결제·보증금·보험·물류 같은 거래 인프라, 공급, 지역·기관 협력을 위한 14가지 협력 유형과 원칙, 절차를 소개합니다.",
    hero: {
      title: "누구나 직접 참여하고,\n필요할 때 함께 협력합니다.",
      lead: "SHAREON에 등록하는 데에는 제휴 계약이 필요 없습니다. 그 위에서 거래 인프라와 공급, 지역과 기관의 협력을 함께 만들 파트너를 찾습니다.",
      ctaMain: "파트너십 문의하기",
      ctaSub: "비즈니스 살펴보기",
    },
    open: {
      kicker: "OPEN MARKETPLACE",
      title: "등록은 직접,\n협력은 협의로.",
      lead: "개별 제휴가 있어야만 입점하는 폐쇄형 구조가 아닙니다. 아래 두 갈래를 구분해 주세요.",
      cols: [
        { k: "DIRECT", title: "직접 참여 · 계약 없이", items: ["개인과 사업자 누구나 앱에서 가입해 등록", "품목별 자격·안전 기준만 확인", "기본 등록과 거래는 구독 없이", "등록 순서나 노출을 계약으로 정하지 않음"] },
        { k: "PARTNER", title: "별도 협력 · 협의 후", items: ["결제·보증금·보험·물류 같은 거래 인프라", "대량 공급이나 기업 자산 공유", "지자체·공공기관 공유 사업", "광고·프로모션 — 항상 광고로 표시"] },
      ],
    },
    why: {
      kicker: "WHY PARTNER",
      title: "지금 함께하면\n좋은 이유.",
      lead: "SHAREON이 협력에서 만들고 싶은 가치입니다. 성과나 매출을 약속하는 내용은 아닙니다.",
      rows: [
        { title: "새로운 고객 접점", body: "따로 판매 채널을 만들지 않아도, 가까운 곳에서 빌릴 것을 찾는 사람을 만날 수 있는 창구를 지향합니다." },
        { title: "비어 있는 시간의 가치", body: "쓰지 않는 장비와 비어 있는 공간이 다시 쓰이도록, 유휴 자원을 거래로 잇습니다." },
        { title: "규칙을 함께 만드는 단계", body: "결제·보증금·파손 기준이 아직 설계 중이라, 업계의 경험을 처음부터 반영할 수 있습니다." },
        { title: "NEWON 생태계와의 연결", body: "BABYLOG의 육아용품 대여, LIVON의 중고 거래처럼 NEWON의 다른 앱에서 생기는 수요가 SHAREON으로 이어집니다." },
      ],
    },
    notice: "현재 SHAREON과 계약한 파트너사는 없습니다. 아래는 협력을 제안받고 싶은 유형이며, 특정 업체를 가리키지 않습니다.",
    types: {
      kicker: "14 PARTNER TYPES",
      title: "함께할 수 있는\n열네 가지 방법.",
      labels: { collab: "협력 내용", value: "함께 만들고 싶은 가치", terms: "먼저 확인할 조건", status: "상태" },
      items: [
        { n: "01", icon: "everyday", title: "생활용품 대여업체", collab: "생활 장비 공급과 대여", value: "새로운 손님과 대여 관리", terms: "구성품·사용 안내 기준" },
        { n: "02", icon: "camera", title: "촬영·전자기기 대여업체", collab: "카메라·영상·IT 기기", value: "크리에이터·단기 수요 연결", terms: "기기 초기화·상태 고지·파손 기준" },
        { n: "03", icon: "camping", title: "캠핑·레저 장비 업체", collab: "캠핑·스포츠 장비", value: "계절 장비의 활용도", terms: "세척·위생·안전 상태 기준" },
        { n: "04", icon: "fashion", title: "의류·행사용품 업체", collab: "의상·소품 대여", value: "행사·촬영 수요 연결", terms: "진품 여부·위생·세탁 책임" },
        { n: "05", icon: "space", title: "공간 운영자", collab: "스튜디오·회의실·작업실", value: "비어 있는 시간의 활용", terms: "공간 사용 권한·안전·영업 규정" },
        { n: "06", icon: "pro", title: "서비스 제공자", collab: "설치·촬영 보조·운반 서비스", value: "예약 요청으로 만나는 손님", terms: "서비스별 자격·책임 범위" },
        { n: "07", icon: "office", title: "전문·사무 장비 업체", collab: "산업·측정·사무 장비", value: "기업의 단기 수요 연결", terms: "사용 자격·안전교육·운송·보험" },
        { n: "08", icon: "mobility", title: "적격 이동수단 사업자", collab: "자전거·이동 장비·차량", value: "적법한 이동수단 대여 연계", terms: "관련 법령상 사업 자격" },
        { n: "09", icon: "corporate", title: "기업 자산 담당자", collab: "유휴 장비·공간 공유", value: "잠든 자산의 활용과 비용 절감", terms: "내부 승인·자산 관리 기준" },
        { n: "10", icon: "payment", title: "결제·보증금 파트너 (PG)", collab: "대여 결제와 보증금 수단", value: "공유·대여에 맞는 결제 흐름", terms: "관련 법령·결제대행 계약 기준" },
        { n: "11", icon: "trust", title: "보험·보상 파트너", collab: "파손·분실 대비 상품", value: "빌려주는 사람의 부담 완화", terms: "보험 관련 법령·상품 기준" },
        { n: "12", icon: "return", title: "물류·배송 파트너", collab: "인수·반납 배송", value: "먼 거리 대여의 가능성", terms: "운송 책임·파손 기준" },
        { n: "13", icon: "public", title: "지자체·공공기관", collab: "공공 공유 자원 사업", value: "공공 자원의 활용도", terms: "기관별 조달·계약 절차" },
        { n: "14", icon: "global", title: "기술·글로벌 파트너", collab: "기술 협력·해외 현지화", value: "공유·대여 운영 모델의 확장", terms: "현지 법령·라이선스 조건" },
      ],
    },
    principles: {
      kicker: "PRINCIPLES",
      title: "협력의 원칙.",
      items: [
        "계약하지 않은 기업의 이름과 로고는 쓰지 않습니다.",
        "광고·협찬·제휴 노출은 항상 그 사실을 표시합니다.",
        "협력을 이유로 이용자 개인정보를 넘기지 않는 것을 원칙으로 합니다.",
        "관련 법령과 자격 기준을 사업 조건보다 먼저 확인합니다.",
        "협력 파트너가 있어도 누구나 직접 등록하는 열린 구조는 그대로 둡니다.",
        "검토 결과와 일정, 수수료나 조건을 미리 약속하지 않습니다.",
      ],
    },
    process: {
      kicker: "PROCESS",
      title: "협력은 이렇게 진행됩니다.",
      lead: "제안을 받은 뒤 사업·법률·운영 조건을 검토하고, 협의와 계약을 거쳐 단계적으로 시작합니다. 검토 결과와 일정은 제안에 따라 달라집니다.",
      steps: [
        { n: "01", title: "제안", body: "협력하고 싶은 내용과 가진 자원을 문의 양식으로 보내 주세요." },
        { n: "02", title: "검토", body: "사업·법률·운영 조건과 이용자 안전을 확인합니다." },
        { n: "03", title: "협의", body: "역할과 책임, 표시 방식을 함께 정합니다." },
        { n: "04", title: "계약", body: "필요한 경우에만 계약을 맺습니다." },
        { n: "05", title: "시작", body: "작은 범위에서 시작해 단계적으로 넓힙니다." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "파트너가 자주 묻는 질문.",
      items: [
        { q: "제휴하지 않아도 등록할 수 있나요?", a: "네. 대여업체·공간 운영자·서비스 제공자 모두 앱에서 직접 가입해 등록하는 구조입니다. 별도 협력은 거래 인프라나 대량 공급처럼 협의가 필요한 경우에만 진행합니다." },
        { q: "지금 협력 중인 파트너가 있나요?", a: "없습니다. 이 페이지의 유형은 제안을 받고 싶은 분야이며, 특정 업체를 가리키지 않습니다." },
        { q: "파트너에게 수수료 우대나 조건이 있나요?", a: "수수료율이 아직 정해지지 않았기 때문에 조건을 미리 약속하지 않습니다. 협의 과정에서 함께 검토합니다." },
        { q: "결제·보험 회사로서 제안할 수 있나요?", a: "환영합니다. 특히 대여 보증금을 처리할 수 있는 결제 수단은 대여를 여는 데 꼭 필요한 조건입니다. SHAREON은 자체 에스크로를 만들지 않습니다." },
        { q: "검토에는 얼마나 걸리나요?", a: "제안 내용에 따라 다르며, 회신 기한을 보장하지 않습니다." },
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
    seoTitle: "SHAREON 문의 | 앱·등록·결제·협력 문의 — Newon",
    seoDescription:
      "SHAREON 앱 이용, 개인·사업자 등록, 공간·서비스, 결제·보증금, 반납·파손 기준, 광고, 기업·공공기관·기술 협력 문의를 NEWON 공식 문의 양식과 이메일(newon@newon.app)로 받습니다.",
    hero: {
      title: "SHAREON에 관한 이야기를\n들려주세요.",
      lead: "앱 이용부터 개인·사업자 등록, 공간과 서비스, 결제·보증금, 기업·기관 협력까지. 모든 문의는 NEWON 공식 문의 양식과 이메일로 받습니다.",
      ctaMain: "문의 양식 열기",
      ctaSub: "이메일 보내기",
    },
    types: {
      kicker: "INQUIRY TYPES",
      title: "어떤 이야기인가요?",
      lead: "유형을 고르면 NEWON 공식 문의 양식이나 이메일로 연결됩니다. 회원가입은 필요하지 않습니다.",
      head: { type: "문의 유형", about: "이런 내용을 보내 주세요", channel: "연결" },
      formCta: "문의 양식",
      mailCta: "이메일",
      mailSubjectPrefix: "[SHAREON]",
      items: [
        { n: "01", icon: "app", title: "앱 이용", body: "시범 앱 이용, 오류 제보, 기능 제안", slug: "app" },
        { n: "02", icon: "everyday", title: "개인 등록·대여", body: "개인으로 물건을 빌려주거나 빌리는 방법", slug: "personal" },
        { n: "03", icon: "corporate", title: "사업자 등록", body: "대여업체의 직접 등록과 거래 방식", slug: "business" },
        { n: "04", icon: "space", title: "공간 운영", body: "공간 운영자의 참여와 공간 대여 조건", slug: "space" },
        { n: "05", icon: "pro", title: "서비스 제공", body: "서비스 등록과 예약 요청 방식", slug: "service" },
        { n: "06", icon: "office", title: "전문 장비", body: "전문·사무 장비 대여와 자격 기준", slug: "pro-equipment" },
        { n: "07", icon: "payment", title: "결제·보증금", body: "보증금 구조에 관한 의견, PG 협력 제안", slug: "payments" },
        { n: "08", icon: "return", title: "반납·파손 기준", body: "반납·상태 확인·파손 신고 기준에 관한 의견", slug: "returns" },
        { n: "09", icon: "trust", title: "신뢰·안전", body: "본인 확인, 신고·차단, 안전 기준에 관한 의견", slug: "trust" },
        { n: "10", icon: "tag", title: "광고·프로모션", body: "광고로 표시되는 유료 노출에 관한 문의", slug: "ads" },
        { n: "11", icon: "saas", title: "사업자 구독·운영 도구", body: "검토 중인 구독과 운영 도구에 관한 의견", slug: "saas" },
        { n: "12", icon: "corporate", title: "기업 자산 공유", body: "유휴 장비·공간 공유, 기업 간 대여", slug: "corporate" },
        { n: "13", icon: "public", title: "공공기관", body: "지자체·공공기관의 공유 사업 협력", slug: "public" },
        { n: "14", icon: "global", title: "기술·글로벌 협력", body: "기술 협력, 해외 진출, 라이선스", slug: "global" },
        { n: "15", icon: "chat", title: "언론·기타", body: "보도 문의와 그 밖의 이야기", slug: "general" },
      ],
    },
    channel: {
      kicker: "OFFICIAL CHANNEL",
      title: "공식 연락처는\n한 곳입니다.",
      lead: "SHAREON 문의는 NEWON이 직접 받습니다. 아래 두 경로 밖의 연락처는 SHAREON의 공식 창구가 아닙니다.",
      rows: [
        { k: "운영", v: "NEWON" },
        { k: "이메일", v: "newon@newon.app", mail: true },
        { k: "문의 양식", v: "NEWON 공식 문의 양식", form: true },
        { k: "회신", v: "문의 내용에 따라 달라지며, 회신 기한을 보장하지 않습니다." },
      ],
    },
    guide: {
      kicker: "BEFORE YOU WRITE",
      title: "보내기 전에\n확인해 주세요.",
      items: [
        "회신에 필요한 최소한의 정보(이름·이메일·문의 내용)만 적어 주세요.",
        "카드 번호, 계좌 비밀번호, 신분증 번호 같은 민감한 결제·개인정보는 절대 적지 마세요.",
        "앱은 시범 개발 단계라 실제 대여·예약·결제·환불에 대한 고객 지원은 하지 않습니다.",
        "협력 제안이라면 회사 소개, 협력하고 싶은 내용, 가진 자원을 함께 적어 주시면 검토가 빨라집니다.",
        "파손·분쟁처럼 법적 판단이 필요한 일은 이 문의로 해결되지 않습니다. 필요하면 공식 기관이나 전문가와 상담해 주세요.",
        "SHAREON 문의는 NEWON 공식 문의 양식과 공식 이메일로만 받습니다.",
      ],
      privacy: "개인정보 처리방침",
    },
    scope: {
      kicker: "WHAT WE CAN ANSWER",
      title: "답할 수 있는 것과\n아직 답하기 어려운 것.",
      can: { title: "답할 수 있어요", items: ["SHAREON의 방향과 준비 상황", "협력 제안에 대한 검토 결과", "앱에 대한 의견과 제안 접수", "등록 가능한 품목과 기준의 방향"] },
      cannot: { title: "아직 어려워요", items: ["정확한 출시일", "수수료율과 구독 가격", "실제 거래·환불에 대한 고객 지원", "개별 분쟁에 대한 법률 판단"] },
    },
    close: { kicker: "NEWON · SHAREON", title: "newon@newon.app", lead: "보내 주신 이야기는 SHAREON을 만드는 데 소중하게 쓰겠습니다." },
  },
};

const EN = {
  lang: "en",
  brand: "SHAREON",
  status: { dev: "In development in the app", prep: "In preparation", long: "Expansion direction", review: "Area under review" },
  statusLabel: "Status",
  statusNote:
    "The SHAREON app is in pilot development. Confirmed rentals, payment, deposits and settlement are not operating yet; this website only introduces and guides.",
  subnav: [
    { id: "overview", n: "01", en: "Overview", label: "Overview" },
    { id: "platform", n: "02", en: "Platform", label: "Platform" },
    { id: "business", n: "03", en: "Business", label: "Business" },
    { id: "partnerships", n: "04", en: "Partnerships", label: "Partnerships" },
    { id: "contact", n: "05", en: "Contact", label: "Contact" },
  ],
  considerLabel: "To check",
  areasLabel: "Key areas",
  partnershipInquiry: "Inquire about this type",
  matrix: { provider: "Lends", renter: "Borrows", person: "Person", business: "Business" },

  overview: {
    seoTitle: "SHAREON | Newon — Sharing & Rental Marketplace",
    seoDescription:
      "SHAREON is a sharing and rental marketplace app where people and businesses list things, spaces, mobility and services directly, and others borrow what they need. Why we started it and what we stand by. The app is in pilot development.",
    hero: {
      title: "No need to own it.\nJust when you need it.",
      lead: "SHAREON is a sharing and rental marketplace where people and businesses list their things, spaces, mobility and services directly, and others borrow just what they need. NEWON is building it as an iOS and Android app.",
      ctaMain: "Explore the platform",
      ctaSub: "Contact us",
    },
    why: {
      kicker: "WHY SHAREON",
      title: "Every home has something used once and put away —\nand somewhere, someone needs it right now.",
      body: [
        "SHAREON started to connect the two. It is a place to borrow and lend, for just as long as needed, the things that are too costly to buy for occasional use, the spaces that sit empty most of the time, and the services you only look for now and then.",
        "This is not about owning less. It is about making better use of what already exists, and making it easier to get what you need at the moment you need it.",
      ],
    },
    gap: {
      kicker: "THE GAP",
      title: "Why is borrowing\nstill such a hassle?",
      lead: "The four problems we wrote down when SHAREON began. We wanted to solve these before thinking about individual features.",
      rows: [
        { title: "Too costly to buy, too scattered to rent", body: "Even things used a few times a year — camping or filming gear — are usually bought. Places to rent them are spread across different shops and areas, so just finding one takes time." },
        { title: "Unused resources sit idle", body: "Equipment at home, empty meeting rooms and workshops, idle machines in company storage all cost money to keep, even while unused." },
        { title: "Lending to strangers feels risky", body: "Without clear rules on condition, on-time return and what happens if something breaks, neither lender nor borrower wants to go first." },
        { title: "Small businesses lack a way to reach customers", body: "Small rental shops, space operators and independent service providers need an open channel to meet customers without signing a separate partnership." },
      ],
    },
    mission: {
      kicker: "MISSION & VISION",
      items: [
        { k: "MISSION", title: "What you need, as long as you need it —\nborrowed with confidence.", body: "We are building a rental experience where finding nearby, checking conditions, recording condition and returning on time all feel natural." },
        { k: "VISION", title: "An ecosystem where everyone\ncan lend and borrow.", body: "We picture an open sharing and rental ecosystem in which people and businesses lend to and borrow from each other, and idle resources are used again." },
      ],
      line: "A rental only ends when the item comes back. SHAREON designs the responsibilities and steps up to the return before it designs screens.",
    },
    journey: {
      kicker: "USER JOURNEY",
      title: "Two journeys —\nthe borrower’s and the lender’s — meet here.",
      lead: "The rental journey we are designing in the SHAREON app. The first launch starts with approval-based booking, where the lender reviews and approves each request. Rentals that need a deposit open only once a deposit method supported by a payment provider (PG) is in place.",
      laneA: "Borrower",
      laneB: "Lender",
      steps: [
        { en: "Need", a: { title: "A need comes up", body: "A weekend camping trip, a day of filming, a meeting room for a few hours." }, b: { title: "Lists an item", body: "Adds photos, a description, rental terms and handover options in the List tab." } },
        { en: "Find", a: { title: "Looks around", body: "Browses Home and Explore by area, category and dates." }, b: { title: "Gets found", body: "The listing shows up for people searching nearby." } },
        { en: "Request", a: { title: "Sends a request", body: "Chooses dates and terms and asks to rent." }, b: { title: "Reviews and approves", body: "Checks the dates and terms, then approves or declines." } },
        { en: "Talk", a: { title: "Arranges in chat", body: "Agrees handover time, method and any questions in chat." }, b: { title: "Prepares the handover", body: "Checks parts and condition, then hands over as agreed." } },
        { en: "Use", a: { title: "Uses it", body: "Checks condition together at pickup, then uses it for the period." }, b: { title: "Keeps track", body: "Sees the rental period and return date in the My tab." } },
        { en: "Return", a: { title: "Returns it", body: "Returns the item, checks condition and rates the rental." }, b: { title: "Checks and closes", body: "Checks the returned condition and follows the damage-report steps if needed." } },
      ],
    },
    people: {
      kicker: "WHO IT IS FOR",
      title: "The people who\nwill use SHAREON.",
      lead: "The same person can borrow today and lend next week.",
      items: [
        { en: "Occasional users", title: "People who need something now and then", body: "Individuals who would rather borrow for the day than buy something used once or twice a year." },
        { en: "Neighbours who share", title: "People with things to share", body: "Individuals who want to lend idle gear and things to people nearby." },
        { en: "Small businesses", title: "Businesses looking for customers", body: "Rental shops, space operators and service providers who want to list right away and meet customers, without a separate partnership." },
        { en: "Companies", title: "Companies using resources wisely", body: "Companies that want to share idle equipment and spaces, or borrow equipment for a short period." },
      ],
    },
    principles: {
      kicker: "PRINCIPLES",
      title: "Eight principles\nSHAREON stands by.",
      lead: "Promises that stay the same as features grow.",
      items: [
        { title: "Anyone can take part directly", body: "People and businesses sign up and list in the app themselves. No separate partnership contract is needed to list." },
        { title: "Basic trading without a subscription", body: "Basic listing and trading must work without subscribing." },
        { title: "Approval-based booking first", body: "At first, the lender reviews and approves each request. Instant booking comes once trust tools are in place." },
        { title: "Money through proven payment methods", body: "Rentals that need a deposit open only once a PG-supported deposit method is ready. SHAREON does not build its own escrow to hold money." },
        { title: "Ads are always labelled as ads", body: "Paid placements and ads are always marked as advertising." },
        { title: "No names without a contract", body: "We never show companies we do not actually work with as partners, by name or logo." },
        { title: "Condition and responsibility on record", body: "Condition is recorded at every handover, and damage-report and review steps are set in advance." },
        { title: "As little personal data as possible", body: "Exact addresses stay hidden until a rental is agreed, and location data is removed from photos." },
      ],
    },
    now: {
      kicker: "WHERE WE ARE",
      title: "What is being prepared,\nand what is not open yet.",
      lead: "SHAREON is in pilot development. Here, without hiding anything, is what is in progress and what has not opened yet.",
      head: { item: "Area", now: "Now", next: "Next" },
      rows: [
        { item: "App", now: "iOS and Android app in pilot development · not in the app stores", next: "First launch centred on rentals, spaces and services" },
        { item: "Booking", now: "Approval-based booking requests in development · confirmed bookings not operating", next: "Instant booking considered once rentals build up" },
        { item: "Payment, deposits, settlement", now: "Not operating", next: "Rentals open once a PG-supported deposit method is ready" },
        { item: "Damage reports & approval flow", now: "Being designed", next: "Operated after legal review and final terms" },
        { item: "Used-goods sale", now: "A secondary feature in the app", next: "The centre stays sharing and rental" },
        { item: "Subscription", now: "Under consideration for pros and businesses · no prices", next: "Basic listing and trading stay subscription-free" },
      ],
    },
    newon: {
      kicker: "INSIDE NEWON",
      title: "What SHAREON does\ninside NEWON.",
      lead: "NEWON builds apps for each stage of life and each part of daily life. Within that family, SHAREON takes care of borrowing and lending.",
      items: [
        { name: "BABYLOG", link: "babylog", body: "Renting baby goods that children outgrow quickly leads into SHAREON.", flow: true },
        { name: "LIVON", link: "livon", body: "Second-hand trading that comes up around life information leads into SHAREON.", flow: true },
        { name: "MY WORLD", link: "myworld", body: "MY WORLD handles travel plans and records; SHAREON handles renting travel and camping gear." },
        { name: "PETLOG · ONGIL", body: "Each app looks after pet life and senior life; SHAREON steps in when something needs to be shared or rented." },
      ],
      center: "Share & rent",
    },
    pages: {
      kicker: "MORE ABOUT SHAREON",
      title: "Find the details\nin each menu.",
      items: [
        { id: "platform", body: "18 service areas and the rental flow" },
        { id: "business", body: "14 business areas and business models" },
        { id: "partnerships", body: "14 partner types and the process" },
        { id: "contact", body: "Inquiry types and official contact" },
      ],
    },
  },

  platform: {
    seoTitle: "SHAREON Platform | 18 service areas and the rental flow — Newon",
    seoDescription:
      "From renting things, spaces and services to listing, approval-based booking requests, chat, deposits, returns and damage reports, and the app’s five tabs: the 18 service areas the SHAREON app is preparing, each with its current status.",
    hero: {
      title: "Lending and borrowing,\nin one app.",
      lead: "From renting things, spaces and services to listing, booking requests, chat and returns — the 18 service areas the SHAREON app is preparing. Real use happens in the app; this website only introduces it.",
      ctaMain: "See the business",
      ctaSub: "Contact us",
    },
    indexKicker: "18 SERVICES",
    indexTitle: "18 services,\nfour groups.",
    indexLead: "Select an item to jump to its description. Every service shows where it stands today.",
    groups: [
      { id: "a", kicker: "A · THINGS", title: "Renting things", lead: "Things you rarely use but would hesitate to buy." },
      { id: "b", kicker: "B · SPACES, SERVICES & EQUIPMENT", title: "Spaces, services & equipment", lead: "Spaces and services that sit at the centre of the first launch alongside things, plus equipment and mobility that need qualification checks." },
      { id: "c", kicker: "C · RENTAL FLOW", title: "The rental flow", lead: "Not just a list of items, but a flow in which every rental ends safely with the return. Each step is shown as it is actually built." },
      { id: "d", kicker: "D · TRUST & APP", title: "Trust & the app", lead: "The tools that make trading trustworthy, and the app that holds it all." },
    ],
    services: [
      { n: "01", g: "a", icon: "everyday", en: "Everyday goods", title: "Everyday goods rental", body: "Borrow occasional household gear — cleaning equipment, tools, ladders, moving kit — for just the days you need it.", areas: ["Cleaning gear", "Tools", "Pressure washers", "Ladders", "Appliances", "Moving kit"], note: "Basic instructions and a parts check are needed.", status: "dev" },
      { n: "02", g: "a", icon: "electronics", en: "Electronics", title: "Electronics rental", body: "Use expensive devices — laptops, tablets, projectors, monitors, consoles — for a short time.", areas: ["Laptops", "Tablets", "Projectors", "Monitors", "Consoles"], note: "Device reset, condition checks and handover steps must come first.", status: "prep" },
      { n: "03", g: "a", icon: "camera", en: "Camera & production", title: "Camera & production gear", body: "From solo creators to small production teams, borrow the gear a shoot needs, by the day.", areas: ["Cameras", "Lenses", "Lighting", "Tripods", "Microphones", "Video gear"], note: "Condition disclosure and an agreed damage standard are needed.", status: "dev" },
      { n: "04", g: "a", icon: "camping", en: "Travel & camping", title: "Travel & camping gear", body: "Borrow suitcases, tents, camping chairs and sleeping bags for a short trip.", areas: ["Suitcases", "Tents", "Camping chairs", "Tables", "Sleeping bags", "Travel accessories"], note: "Demand is seasonal, and cleaning and drying matter.", status: "dev" },
      { n: "05", g: "a", icon: "fashion", en: "Fashion & events", title: "Fashion & event items", body: "Borrow outfits, bags and props for an event or a shoot, just for the day.", areas: ["Event wear", "Costumes", "Bags", "Accessories", "Party props"], note: "Authenticity, hygiene, cleaning and damage responsibility come first.", status: "prep" },
      { n: "06", g: "a", icon: "sports", en: "Sports & leisure", title: "Sports & leisure gear", body: "Borrow ski, snowboard, golf and outdoor gear for the season.", areas: ["Ski", "Snowboard", "Golf", "Fitness gear", "Outdoor gear"], note: "Safety condition, protective gear and terms of use must be checked.", status: "prep" },
      { n: "07", g: "b", icon: "space", en: "Spaces", title: "Space rental", body: "Lend and borrow meeting rooms, studios, practice rooms, workshops and party rooms by the hour or day.", areas: ["Meeting rooms", "Studios", "Practice rooms", "Workshops", "Party rooms", "Exhibition spaces"], note: "We check the right to rent out the space and fire, safety and business rules. Lodging and parking are out of scope until lawful conditions are confirmed.", status: "dev" },
      { n: "08", g: "b", icon: "pro", en: "Services", title: "Service listings", body: "List services people provide in person — assembly, shoot assistance, help with moving — and receive booking requests.", areas: ["Assembly", "Shoot assistance", "Moving help", "On-site services", "Request approval"], note: "Services that need a qualification get qualification checks. Fields needing professional licences, such as medical or legal, are out of scope.", status: "dev" },
      { n: "09", g: "b", icon: "office", en: "Professional equipment", title: "Professional & office equipment", body: "From measuring and site equipment to printers, meeting and event gear — equipment businesses need, for as long as they need it.", areas: ["Measuring gear", "Site equipment", "Printers", "Meeting & event gear", "Office furniture"], note: "Operator qualifications, safety training, transport and maintenance terms must be reviewed.", status: "long" },
      { n: "10", g: "b", icon: "mobility", en: "Mobility", title: "Mobility rental", body: "Focused on bicycles and mobility gear; cars only through qualified operators.", areas: ["Bicycles", "Mobility gear", "Licensed operators’ vehicles"], note: "Unlicensed paid car rental between individuals is not allowed.", status: "long" },
      { n: "11", g: "c", icon: "search", en: "List & discover", title: "Listing & discovery", body: "Add photos, a description and rental terms in the List tab; find by area, category and dates in Home and Explore. People and businesses list directly, with no partnership needed.", areas: ["Photos", "Categories", "Rental terms", "Area search", "Date filters"], note: "Location data is removed from photos on upload. Paid placements are always labelled as ads.", status: "dev" },
      { n: "12", g: "c", icon: "calendar", en: "Approval booking", title: "Approval-based booking requests", body: "Ask for your dates and terms; the lender reviews and approves or declines. Instant booking is considered for a later stage.", areas: ["Availability", "Booking request", "Approve / decline", "Schedule"], note: "The request screen is in development; confirmed bookings are not operating yet.", status: "dev" },
      { n: "13", g: "c", icon: "chat", en: "Chat", title: "Chat & scheduling", body: "Ask questions and agree on handover time and method in the Chat tab.", areas: ["1:1 chat", "Handover time", "Handover method", "Request alerts"], note: "Exact addresses stay hidden until a rental is agreed.", status: "dev" },
      { n: "14", g: "c", icon: "payment", en: "Payment & deposit", title: "Payment & deposits", body: "Rentals that need a deposit open only once a PG-supported deposit method is ready. SHAREON does not build its own escrow.", areas: ["Rental payment", "Deposits", "Refund rules", "Settlement"], note: "Payment, deposits and settlement are not operating today. Deposits are kept apart from platform revenue.", status: "prep" },
      { n: "15", g: "c", icon: "return", en: "Return & damage report", title: "Returns & damage reports", body: "We are designing a flow where condition is checked together at return, and damage, loss or late returns go through report and review steps.", areas: ["Condition check", "Parts check", "Damage report", "Late returns"], note: "The rules will be set with the terms after legal review.", status: "prep" },
      { n: "16", g: "d", icon: "trust", en: "Trust & approval", title: "Trust & approval flow", body: "Identity and business checks, item approval, reporting and blocking, and reviews make trading trustworthy.", areas: ["Identity check", "Business check", "Listing approval", "Report & block", "Reviews"], note: "Reporting is in development in the app; reviews will run once real rentals begin.", status: "prep" },
      { n: "17", g: "d", icon: "tag", en: "Used goods", title: "Used-goods sale", body: "Things you no longer lend out can also be sold second-hand. This is a secondary feature in the app; SHAREON’s centre is sharing and rental.", areas: ["Used listings", "Sales chat", "LIVON second-hand link"], note: "As with rentals, payment for sales is not operating yet.", status: "dev" },
      { n: "18", g: "d", icon: "app", en: "App & accessibility", title: "App & accessibility", body: "The iOS and Android app has five tabs: Home, Explore, List, Chat and My. Real use happens only in the app.", areas: ["Home", "Explore", "List", "Chat", "My", "Dark mode", "Large text"], note: "It is not in the app stores yet, so there is no download link.", status: "dev" },
    ],
    tabs: [
      { k: "Home", body: "New listings and picks nearby" },
      { k: "Explore", body: "Search by area, category, dates" },
      { k: "List", body: "Post things, spaces, services" },
      { k: "Chat", body: "Requests and handovers" },
      { k: "My", body: "Rentals and settings" },
    ],
    launch: {
      kicker: "FIRST LAUNCH",
      title: "The first launch starts with\nrentals, spaces and services.",
      lead: "We are not opening everything at once. Here is what opens first, and what we consider next.",
      head: { item: "Area", first: "First launch", later: "Next" },
      rows: [
        { item: "Scope", first: "Things · spaces · services", later: "Professional equipment · corporate assets · licensed mobility operators" },
        { item: "Booking", first: "Requests the lender approves", later: "Instant booking considered" },
        { item: "Payment & deposits", first: "Deposit rentals open once a PG deposit method is ready", later: "Refined settlement and refunds" },
        { item: "Trading scope", first: "Sharing and rental first · used-goods sale is secondary", later: "The centre stays sharing and rental" },
        { item: "Terms of use", first: "Basic listing and trading without a subscription", later: "Subscription for pros and businesses considered (no prices)" },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Frequently asked questions.",
      items: [
        { q: "Can I rent or book on the website?", a: "No. The website only introduces SHAREON. Listing, booking requests and chat happen in the SHAREON app, which is still in pilot development and not in the app stores." },
        { q: "Do I need a partnership contract to list?", a: "No. Anyone — individual or business — signs up and lists directly in the app. Some items may need qualification or safety checks." },
        { q: "Do I need a subscription?", a: "Basic listing and trading are designed to work without one. A subscription for pros and businesses is under consideration, with no prices set." },
        { q: "How are deposits handled?", a: "Rentals that need a deposit open only once a PG-supported deposit method is ready. SHAREON does not build its own escrow, and payment, deposits and settlement are not operating today." },
        { q: "Why approval-based rather than instant booking?", a: "At first, we think lenders should be able to see each request and decide. Once rentals build up and trust tools are in place, we will consider instant booking." },
        { q: "How do ads appear?", a: "Paid placements and ads are always labelled as advertising, never mixed in unmarked." },
      ],
    },
    next: {
      kicker: "NEXT",
      title: "How these services\ncome together as a business.",
      lead: "The 14 business areas, business models and revenue structure are on the Business page.",
      ctas: ["See the business", "See partnerships"],
    },
  },

  business: {
    seoTitle: "SHAREON Business | 14 business areas and models — Newon",
    seoDescription:
      "SHAREON’s 14 sharing and rental business areas, C2C, B2C, B2B and B2G models, revenue opportunities and their caveats, and the staged plan. Commission rates and prices are not set.",
    hero: {
      title: "A business built on\nlending and borrowing.",
      lead: "SHAREON is a two-sided marketplace where people and businesses are both providers and renters. Here are its 14 business areas, business models and revenue opportunities, with honest caveats.",
      ctaMain: "See partnerships",
      ctaSub: "Business inquiry",
    },
    structure: {
      kicker: "BUSINESS STRUCTURE",
      title: "Everyone can lend,\neveryone can borrow.",
      lead: "Either side of a rental can be a person or a business. The four cells describe the structure; they do not mean everything is built.",
      items: [
        { en: "C2C", title: "Person to person", body: "People lend their things and gear to neighbours. The centre of the first launch." },
        { en: "C2B", title: "Person to business", body: "Companies borrow personally owned gear for events or shoots." },
        { en: "B2C", title: "Business to person", body: "Rental shops, space operators and service providers meet individual customers." },
        { en: "B2B", title: "Business to business", body: "Companies lend and borrow idle equipment and spaces." },
      ],
    },
    areas: {
      kicker: "14 BUSINESS AREAS",
      title: "14 business areas,\nsix groups.",
      lead: "The list on the left shows where each group sits. Each area lists what is rented, key customers, how it earns and its status.",
      labels: { targets: "What", customer: "Key customers", revenue: "Revenue" },
      groups: [
        { id: "g1", n: "01", en: "Everyday & electronics", title: "Everyday & electronics", body: "The everyday rentals people will look for most often." },
        { id: "g2", n: "02", en: "Leisure & creation", title: "Leisure & creation", body: "Rentals with a clear period — seasons, events and shoots." },
        { id: "g3", n: "03", en: "Spaces & services", title: "Spaces & services", body: "At the centre of the first launch, alongside things." },
        { id: "g4", n: "04", en: "Pro equipment & mobility", title: "Pro equipment & mobility", body: "Areas that need qualification and safety checks first." },
        { id: "g5", n: "05", en: "Local & corporate sharing", title: "Local & corporate sharing", body: "Connecting idle resources nearby and inside companies." },
        { id: "g6", n: "06", en: "Operations & expansion", title: "Operations & expansion", body: "Tools for businesses, and expansion to public and global." },
      ],
      items: [
        { n: "01", g: "g1", icon: "everyday", en: "Everyday goods rental", title: "Everyday goods rental", body: "People and households borrow occasional gear — vacuums, tools, appliances — for just the days they need it.", targets: ["Cleaning gear", "Tools", "Appliances", "Moving kit"], customer: "Individuals, households, small businesses", revenue: "Transaction commission", status: "dev" },
        { n: "02", g: "g1", icon: "electronics", en: "Electronics rental", title: "Electronics rental", body: "Laptops, tablets and projectors used only for exams, trips or events. Device resets and condition checks come first.", targets: ["Laptops", "Tablets", "Projectors", "Monitors"], customer: "Individuals, freelancers, companies", revenue: "Transaction commission", status: "prep" },
        { n: "03", g: "g2", icon: "camera", en: "Camera & production", title: "Camera & production gear", body: "Creators and small teams borrow gear around their shoot dates. Individuals who own gear and rental shops both supply.", targets: ["Cameras", "Lenses", "Lighting", "Audio gear"], customer: "Creators, small production teams", revenue: "Transaction commission", status: "dev" },
        { n: "04", g: "g2", icon: "camping", en: "Travel & camping", title: "Travel & camping gear", body: "Gear borrowed for travel and camping seasons. MY WORLD handles trip planning; SHAREON handles gear rental.", targets: ["Suitcases", "Tents", "Camp furniture", "Sleeping bags"], customer: "Individuals, families, travellers", revenue: "Transaction commission", status: "dev" },
        { n: "05", g: "g2", icon: "fashion", en: "Fashion & events", title: "Fashion & event items", body: "Outfits and props for events and shoots, by the day. Authenticity, hygiene and cleaning rules come first.", targets: ["Event wear", "Bags", "Accessories", "Party props"], customer: "Individuals, event planners, film crews", revenue: "Transaction commission", status: "prep" },
        { n: "06", g: "g2", icon: "sports", en: "Sports & leisure", title: "Sports & leisure gear", body: "Ski, golf and outdoor gear borrowed by season and region. Safety condition and protective gear rules matter.", targets: ["Ski & board", "Golf", "Fitness gear", "Outdoor"], customer: "Individuals, clubs, leisure businesses", revenue: "Transaction commission", status: "prep" },
        { n: "07", g: "g3", icon: "space", en: "Space rental", title: "Space rental", body: "Spaces that sit empty much of the time — meeting rooms, studios, workshops — rented by the hour. Operator rights and safety and business rules are checked first.", targets: ["Meeting rooms", "Studios", "Practice rooms", "Party rooms"], customer: "Space operators, individuals, companies", revenue: "Transaction commission · business subscription under consideration", status: "dev" },
        { n: "08", g: "g3", icon: "pro", en: "Service marketplace", title: "Service listings", body: "Services people provide in person — assembly, shoot assistance, moving help — listed to receive booking requests. Fields needing professional licences are out of scope.", targets: ["Assembly", "Shoot assistance", "Moving help"], customer: "Independent service providers, small businesses", revenue: "Transaction commission · business subscription under consideration", status: "dev" },
        { n: "09", g: "g4", icon: "office", en: "Professional & office equipment", title: "Professional & office equipment", body: "Measuring and site equipment, printers, meeting and event gear for businesses, for the period they need. Qualifications, transport and insurance terms are reviewed.", targets: ["Measuring gear", "Site equipment", "Office machines", "Event gear"], customer: "Companies, institutions, qualified operators", revenue: "Transaction commission · corporate contracts", status: "long" },
        { n: "10", g: "g4", icon: "mobility", en: "Mobility partners", title: "Mobility through operators", body: "Focused on bicycles and mobility gear; cars only via qualified operators. Unlicensed paid car rental between individuals is not allowed.", targets: ["Bicycles", "Mobility gear", "Licensed operators’ vehicles"], customer: "Qualified mobility operators, individuals", revenue: "Transaction commission · operator contracts", status: "long" },
        { n: "11", g: "g5", icon: "local", en: "Local sharing", title: "Local sharing", body: "Neighbours share things they are not using. Short distances make handover and return easier.", targets: ["Nearby rentals", "Neighbourhood resources", "Local rental shops"], customer: "Local residents, local businesses", revenue: "Transaction commission", status: "dev" },
        { n: "12", g: "g5", icon: "corporate", en: "Corporate asset sharing", title: "Corporate asset sharing", body: "Companies lend idle equipment and spaces to other companies or sole traders, with internal approval and asset rules designed in.", targets: ["Idle equipment", "Idle spaces", "Long-term rental"], customer: "Companies, sole traders", revenue: "Corporate contracts · transaction commission", status: "long" },
        { n: "13", g: "g6", icon: "saas", en: "Tools for businesses", title: "Tools for businesses", body: "Booking, inventory and customer tools for rental shops and space operators, and a subscription for pros and businesses, are under consideration. A standard SHAREON product, not custom development.", targets: ["Booking", "Inventory & assets", "Customers", "Reports"], customer: "Rental shops, space operators, service providers", revenue: "Subscription (under consideration · no prices)", status: "long" },
        { n: "14", g: "g6", icon: "global", en: "Public & global sharing", title: "Public & global sharing", body: "Public resource-sharing projects with local governments and localisation abroad, as a long-term direction.", targets: ["Public sharing", "Localisation", "Licensing"], customer: "Local governments, public bodies, overseas partners", revenue: "Institutional contracts · licensing", status: "long" },
      ],
    },
    models: {
      kicker: "BUSINESS MODELS",
      title: "Business models at a glance.",
      lead: "Models are split by who lends to whom. The revenue column describes the structure only; rates and prices are not set.",
      head: { model: "Model", flow: "Flow", example: "Examples", revenue: "Revenue", status: "Status" },
      rows: [
        { code: "C2C", flow: "Person → person", example: "Camping gear, household gear, filming gear", revenue: "Platform transaction commission", status: "dev" },
        { code: "B2C", flow: "Rental shops, space operators, service providers → person", example: "Camera rental shops, studios, assembly services", revenue: "Commission · business subscription under consideration", status: "dev" },
        { code: "C2B", flow: "Person → business", example: "Personal gear for events and shoots", revenue: "Transaction commission", status: "long" },
        { code: "B2B", flow: "Business ↔ business", example: "Sharing idle equipment and spaces, long-term rental", revenue: "Corporate contracts · commission", status: "long" },
        { code: "B2G", flow: "Platform ↔ public bodies", example: "Local-government resource sharing", revenue: "Institutional contracts", status: "long" },
        { code: "AD", flow: "Rental shops, brands → users", example: "Paid placements labelled as ads", revenue: "Advertising", status: "prep" },
        { code: "GLOBAL", flow: "SHAREON → overseas partners", example: "Localisation, licensing the operating model", revenue: "Licensing", status: "long" },
      ],
    },
    revenue: {
      kicker: "REVENUE",
      title: "Revenue comes\nafter a rental is done.",
      paras: [
        "SHAREON’s core revenue is a transaction commission NEWON earns on trades completed on the platform. The rate has not been decided; once it is, it will be announced in the app and the terms first.",
        "On top of that there may be a subscription for pros and businesses, paid placements that are always labelled as ads, and contracts with companies and institutions. The principle that basic listing and trading work without a subscription does not change.",
        "SHAREON does not build its own escrow. Deposits go through a payment provider and are not counted as platform revenue.",
      ],
      caveatsTitle: "Caveats that come before any number",
      caveats: [
        "There is no commission revenue until payment, deposits and settlement open.",
        "As trades grow, so do the costs of damage, loss, disputes and customer support.",
        "A two-sided marketplace takes time to gather both things to lend and people to borrow them.",
        "Subscriptions, ads and corporate contracts are all under consideration, with no prices or terms set.",
        "This page shows no revenue forecasts or user numbers.",
      ],
    },
    roadmap: {
      kicker: "ROADMAP",
      title: "Trades first,\ncategories second.",
      lead: "Rather than adding categories quickly, we first gather enough items and users in a specific area and category. No dates are set for the stages.",
      now: "Where we are: stage 1 is in pilot development in the app.",
      steps: [
        { n: "01", title: "Core marketplace", tag: "Now", body: "Refine sign-up and listing for people and businesses, discovery, approval-based booking requests, chat and the My tab." },
        { n: "02", title: "Opening rentals", body: "Open deposit rentals once a PG-supported deposit method is ready, and operate damage reports and approvals." },
        { n: "03", title: "More categories and areas", body: "Expand where demand is confirmed, and consider instant booking." },
        { n: "04", title: "Businesses and companies", body: "Consider subscriptions and tools for pros and businesses, corporate asset sharing and B2B trading." },
        { n: "05", title: "Public and global", body: "Consider public resource sharing and localisation abroad over the long term." },
      ],
    },
    focus: {
      kicker: "FOCUS",
      title: "Focused on sharing and rental.",
      lead: "There is a lot SHAREON could do, but its centre is one thing.",
      points: [
        { n: "01", title: "Sharing and rental at the centre", body: "Used-goods sale is a secondary feature in the app. The weight of the business sits on lending and borrowing." },
        { n: "02", title: "Start small, go deep", body: "As a two-sided marketplace, we gather supply and users in one area and category before widening." },
        { n: "03", title: "Our own product", body: "Even tools for businesses are built as a standard SHAREON product, not custom development for each client." },
      ],
    },
    next: {
      kicker: "NEXT",
      title: "Create new sharing\nopportunities with SHAREON.",
      ctas: ["See partnerships", "Business inquiry"],
    },
  },

  partnerships: {
    seoTitle: "SHAREON Partnerships | 14 partner types and the process — Newon",
    seoDescription:
      "SHAREON is an open marketplace anyone can list on without a partnership contract. Here are 14 partner types for transaction infrastructure such as payment, deposits, insurance and logistics, supply, and local and institutional work — with our principles and process.",
    hero: {
      title: "Anyone can take part directly —\nand we partner where it helps.",
      lead: "Listing on SHAREON needs no partnership contract. On top of that open base, we are looking for partners to build transaction infrastructure, supply, and local and institutional work together.",
      ctaMain: "Partnership inquiry",
      ctaSub: "See the business",
    },
    open: {
      kicker: "OPEN MARKETPLACE",
      title: "List directly,\npartner by agreement.",
      lead: "This is not a closed model where only contracted partners can join. Please tell the two paths apart.",
      cols: [
        { k: "DIRECT", title: "Direct · no contract", items: ["Any person or business signs up and lists in the app", "Only item-specific qualification and safety checks", "Basic listing and trading without a subscription", "No contract decides listing order or visibility"] },
        { k: "PARTNER", title: "Partnership · after agreement", items: ["Transaction infrastructure: payment, deposits, insurance, logistics", "Bulk supply or corporate asset sharing", "Sharing projects with local governments and public bodies", "Ads and promotions — always labelled as ads"] },
      ],
    },
    why: {
      kicker: "WHY PARTNER",
      title: "Why partnering now\nmakes sense.",
      lead: "The value SHAREON wants to create through partnerships. This is not a promise of results or revenue.",
      rows: [
        { title: "A new way to meet customers", body: "We aim to be a channel where you meet people nearby looking to borrow, without building your own sales channel." },
        { title: "Value in empty hours", body: "We connect idle resources to trades so unused equipment and empty spaces are used again." },
        { title: "Shaping the rules together", body: "Payment, deposit and damage rules are still being designed, so industry experience can shape them from the start." },
        { title: "Links across NEWON", body: "Demand from other NEWON apps — baby-goods rental in BABYLOG, second-hand trading in LIVON — leads into SHAREON." },
      ],
    },
    notice: "SHAREON has no contracted partners today. The types below are areas where we would welcome proposals; they do not refer to any specific company.",
    types: {
      kicker: "14 PARTNER TYPES",
      title: "Fourteen ways\nto work together.",
      labels: { collab: "What we would do", value: "Value we want to build", terms: "Checked first", status: "Status" },
      items: [
        { n: "01", icon: "everyday", title: "Household rental shops", collab: "Supplying and renting household gear", value: "New customers and rental management", terms: "Parts and instructions standards" },
        { n: "02", icon: "camera", title: "Camera & electronics rental shops", collab: "Camera, video and IT devices", value: "Reaching creators and short-term demand", terms: "Device reset, condition disclosure, damage rules" },
        { n: "03", icon: "camping", title: "Camping & leisure gear businesses", collab: "Camping and sports gear", value: "Better use of seasonal gear", terms: "Cleaning, hygiene and safety standards" },
        { n: "04", icon: "fashion", title: "Clothing & event-item businesses", collab: "Outfits and props", value: "Reaching event and shoot demand", terms: "Authenticity, hygiene, cleaning responsibility" },
        { n: "05", icon: "space", title: "Space operators", collab: "Studios, meeting rooms, workshops", value: "Using empty hours", terms: "Right to rent, safety and business rules" },
        { n: "06", icon: "pro", title: "Service providers", collab: "Assembly, shoot assistance, moving help", value: "Customers through booking requests", terms: "Qualifications and scope of responsibility" },
        { n: "07", icon: "office", title: "Professional & office equipment businesses", collab: "Industrial, measuring and office equipment", value: "Reaching short-term corporate demand", terms: "Qualifications, safety training, transport, insurance" },
        { n: "08", icon: "mobility", title: "Qualified mobility operators", collab: "Bicycles, mobility gear, vehicles", value: "Lawful mobility rental", terms: "Licences required by law" },
        { n: "09", icon: "corporate", title: "Corporate asset managers", collab: "Sharing idle equipment and spaces", value: "Using idle assets and cutting costs", terms: "Internal approval and asset rules" },
        { n: "10", icon: "payment", title: "Payment & deposit partners (PG)", collab: "Rental payment and deposit methods", value: "A payment flow suited to rentals", terms: "Applicable law and payment-provider agreements" },
        { n: "11", icon: "trust", title: "Insurance & protection partners", collab: "Cover for damage and loss", value: "Less burden on lenders", terms: "Insurance law and product standards" },
        { n: "12", icon: "return", title: "Logistics & delivery partners", collab: "Pickup and return delivery", value: "Making longer-distance rentals possible", terms: "Carrier responsibility and damage rules" },
        { n: "13", icon: "public", title: "Local governments & public bodies", collab: "Public resource-sharing projects", value: "Better use of public resources", terms: "Procurement and contracting procedures" },
        { n: "14", icon: "global", title: "Technology & global partners", collab: "Technology and localisation abroad", value: "Extending the rental operating model", terms: "Local law and licensing terms" },
      ],
    },
    principles: {
      kicker: "PRINCIPLES",
      title: "How we partner.",
      items: [
        "We never use the name or logo of a company we have no contract with.",
        "Ads, sponsorship and partner placements are always labelled as such.",
        "As a principle, we do not hand over users’ personal data because of a partnership.",
        "Applicable law and qualification rules are checked before business terms.",
        "Even with partners, the open structure in which anyone can list directly stays.",
        "We do not promise review results, timelines, fees or terms in advance.",
      ],
    },
    process: {
      kicker: "PROCESS",
      title: "How a partnership proceeds.",
      lead: "After a proposal arrives, we review business, legal and operating conditions, agree and contract, then start step by step. Results and timing depend on the proposal.",
      steps: [
        { n: "01", title: "Propose", body: "Send what you want to do together and the resources you have through the inquiry form." },
        { n: "02", title: "Review", body: "We check business, legal and operating conditions and user safety." },
        { n: "03", title: "Agree", body: "We settle roles, responsibilities and how it will be labelled." },
        { n: "04", title: "Contract", body: "A contract is signed only where needed." },
        { n: "05", title: "Start", body: "We start small and widen step by step." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Questions partners often ask.",
      items: [
        { q: "Can I list without partnering?", a: "Yes. Rental shops, space operators and service providers all sign up and list directly in the app. Separate partnerships are only for things that need agreement, such as transaction infrastructure or bulk supply." },
        { q: "Do you have partners today?", a: "No. The types on this page are areas where we welcome proposals; they do not refer to any company." },
        { q: "Do partners get preferential fees or terms?", a: "The commission rate is not set, so we do not promise terms in advance. They are reviewed together during discussions." },
        { q: "Can a payment or insurance company make a proposal?", a: "Yes, please. A payment method that can handle rental deposits is a precondition for opening rentals. SHAREON does not build its own escrow." },
        { q: "How long does a review take?", a: "It depends on the proposal, and we cannot guarantee a reply time." },
      ],
    },
    next: {
      kicker: "PARTNERSHIP",
      title: "Let’s build new possibilities\nfor sharing together.",
      ctas: ["Partnership inquiry", "Read the SHAREON overview"],
    },
  },

  contact: {
    seoTitle: "SHAREON Contact | App, listing, payment and partnership inquiries — Newon",
    seoDescription:
      "Questions about the SHAREON app, listing as a person or business, spaces and services, payment and deposits, return and damage rules, ads, and corporate, public and technology partnerships go through NEWON’s official form and email (newon@newon.app).",
    hero: {
      title: "Tell us what’s on your mind\nabout SHAREON.",
      lead: "From using the app to listing as a person or business, spaces and services, payment and deposits, and corporate or institutional work — every inquiry goes through NEWON’s official form and email.",
      ctaMain: "Open the inquiry form",
      ctaSub: "Send an email",
    },
    types: {
      kicker: "INQUIRY TYPES",
      title: "What would you like to talk about?",
      lead: "Each type opens NEWON’s official inquiry form or email. No sign-up is needed.",
      head: { type: "Inquiry type", about: "What to send us", channel: "Contact" },
      formCta: "Form",
      mailCta: "Email",
      mailSubjectPrefix: "[SHAREON]",
      items: [
        { n: "01", icon: "app", title: "Using the app", body: "The pilot app, bug reports, feature ideas", slug: "app" },
        { n: "02", icon: "everyday", title: "Listing & renting as a person", body: "How to lend or borrow as an individual", slug: "personal" },
        { n: "03", icon: "corporate", title: "Listing as a business", body: "Direct listing and trading for rental shops", slug: "business" },
        { n: "04", icon: "space", title: "Space operators", body: "Joining as a space operator and renting terms", slug: "space" },
        { n: "05", icon: "pro", title: "Service providers", body: "Listing services and how booking requests work", slug: "service" },
        { n: "06", icon: "office", title: "Professional equipment", body: "Professional and office equipment, qualification rules", slug: "pro-equipment" },
        { n: "07", icon: "payment", title: "Payment & deposits", body: "Feedback on deposits, payment-provider proposals", slug: "payments" },
        { n: "08", icon: "return", title: "Return & damage rules", body: "Feedback on returns, condition checks and damage reports", slug: "returns" },
        { n: "09", icon: "trust", title: "Trust & safety", body: "Feedback on identity checks, reporting and safety", slug: "trust" },
        { n: "10", icon: "tag", title: "Ads & promotion", body: "Paid placements labelled as ads", slug: "ads" },
        { n: "11", icon: "saas", title: "Subscriptions & business tools", body: "Feedback on the subscription and tools under consideration", slug: "saas" },
        { n: "12", icon: "corporate", title: "Corporate asset sharing", body: "Sharing idle equipment and spaces, B2B rental", slug: "corporate" },
        { n: "13", icon: "public", title: "Public bodies", body: "Sharing projects with local governments and public bodies", slug: "public" },
        { n: "14", icon: "global", title: "Technology & global", body: "Technology partnerships, expansion abroad, licensing", slug: "global" },
        { n: "15", icon: "chat", title: "Press & other", body: "Media inquiries and anything else", slug: "general" },
      ],
    },
    channel: {
      kicker: "OFFICIAL CHANNEL",
      title: "There is one\nofficial contact.",
      lead: "NEWON handles SHAREON inquiries directly. Contacts other than the two below are not official SHAREON channels.",
      rows: [
        { k: "Operated by", v: "NEWON" },
        { k: "Email", v: "newon@newon.app", mail: true },
        { k: "Inquiry form", v: "NEWON official inquiry form", form: true },
        { k: "Replies", v: "Depend on the inquiry; we cannot guarantee a reply time." },
      ],
    },
    guide: {
      kicker: "BEFORE YOU WRITE",
      title: "Please check\nbefore you send.",
      items: [
        "Include only what we need to reply: your name, email and your question.",
        "Never include card numbers, account passwords, ID numbers or other sensitive payment or personal information.",
        "The app is in pilot development, so there is no customer support for real rentals, bookings, payments or refunds.",
        "For partnership proposals, a short company introduction, what you would like to do and the resources you have help us review faster.",
        "Matters that need a legal judgement, such as damage or disputes, cannot be settled through this inquiry. Please consult official bodies or professionals where needed.",
        "SHAREON inquiries are received only through NEWON’s official inquiry form and official email.",
      ],
      privacy: "Privacy Policy",
    },
    scope: {
      kicker: "WHAT WE CAN ANSWER",
      title: "What we can answer,\nand what we can’t yet.",
      can: { title: "We can answer", items: ["SHAREON’s direction and progress", "Our review of partnership proposals", "Feedback and ideas about the app", "The direction of listable items and rules"] },
      cannot: { title: "Not yet", items: ["An exact launch date", "Commission rates and subscription prices", "Support for real rentals or refunds", "Legal judgements on individual disputes"] },
    },
    close: { kicker: "NEWON · SHAREON", title: "newon@newon.app", lead: "Everything you send helps us build SHAREON." },
  },
};

/* Other locales: EN body with localized page titles, descriptions and the Overview hero line (no new locales added). */
const LOCAL = {
  ja: {
    overview: { seoTitle: "SHAREON | Newon — シェア・レンタルマーケットプレイス", seoDescription: "SHAREONは、個人と企業がモノ・空間・移動手段・サービスを直接登録し、必要な人が借りて使うシェア・レンタルのマーケットプレイスアプリです。アプリは試験開発中で、実際のレンタルや決済はまだ運営していません。", hero: { title: "所有しなくても、\n必要なときに。" } },
    platform: { seoTitle: "SHAREON プラットフォーム | 18のサービス領域 — Newon", seoDescription: "モノ・空間・サービスのレンタルから、登録、承認型の予約リクエスト、チャット、保証金、返却・破損報告まで。SHAREONアプリが準備する18のサービス領域です。" },
    business: { seoTitle: "SHAREON ビジネス | 14の事業領域とビジネスモデル — Newon", seoDescription: "SHAREONの14のシェア・レンタル事業領域、C2C・B2C・B2B・B2Gのモデル、収益の機会とその前提、段階的な計画を紹介します。手数料率と価格は未確定です。" },
    partnerships: { seoTitle: "SHAREON パートナーシップ — Newon", seoDescription: "提携契約なしで誰でも登録できるオープンなマーケットプレイス。決済・保証金・保険・物流などの取引インフラ、供給、地域・公共機関との協力のための14の類型と協力の流れです。" },
    contact: { seoTitle: "SHAREON お問い合わせ — Newon", seoDescription: "SHAREONに関するお問い合わせは、NEWONの公式お問い合わせフォームと公式メールで受け付けています。" },
  },
  es: {
    overview: { seoTitle: "SHAREON | Newon — Marketplace de uso compartido y alquiler", seoDescription: "SHAREON es una app de marketplace donde personas y empresas publican directamente objetos, espacios, movilidad y servicios, y otros alquilan lo que necesitan. La app está en desarrollo piloto; aún no hay alquileres ni pagos reales.", hero: { title: "Sin tenerlo en propiedad.\nJusto cuando lo necesitas." } },
    platform: { seoTitle: "SHAREON Plataforma | 18 áreas de servicio — Newon", seoDescription: "Del alquiler de objetos, espacios y servicios a la publicación, las solicitudes de reserva con aprobación, el chat, los depósitos y las devoluciones: las 18 áreas de servicio que prepara la app SHAREON." },
    business: { seoTitle: "SHAREON Negocio | 14 áreas de negocio y modelos — Newon", seoDescription: "Las 14 áreas de negocio de SHAREON, los modelos C2C, B2C, B2B y B2G, las oportunidades de ingresos con sus salvedades y el plan por etapas. Las comisiones y precios no están decididos." },
    partnerships: { seoTitle: "SHAREON Alianzas — Newon", seoDescription: "Un marketplace abierto en el que cualquiera publica sin contrato de alianza. Los 14 tipos de socios de SHAREON, sus principios y el proceso de colaboración." },
    contact: { seoTitle: "SHAREON Contacto — Newon", seoDescription: "Consultas sobre SHAREON a través del formulario y el correo oficiales de NEWON." },
  },
  "pt-br": {
    overview: { seoTitle: "SHAREON | Newon — Marketplace de compartilhamento e aluguel", seoDescription: "O SHAREON é um app de marketplace onde pessoas e empresas anunciam diretamente objetos, espaços, mobilidade e serviços, e outros alugam o que precisam. O app está em desenvolvimento piloto; ainda não há aluguéis ou pagamentos reais.", hero: { title: "Sem precisar ter.\nNa hora em que você precisa." } },
    platform: { seoTitle: "SHAREON Plataforma | 18 áreas de serviço — Newon", seoDescription: "Do aluguel de objetos, espaços e serviços ao anúncio, pedidos de reserva com aprovação, chat, depósitos e devoluções: as 18 áreas de serviço que o app SHAREON está preparando." },
    business: { seoTitle: "SHAREON Negócios | 14 áreas de negócio e modelos — Newon", seoDescription: "As 14 áreas de negócio do SHAREON, os modelos C2C, B2C, B2B e B2G, as oportunidades de receita com suas ressalvas e o plano por etapas. Comissões e preços não estão definidos." },
    partnerships: { seoTitle: "SHAREON Parcerias — Newon", seoDescription: "Um marketplace aberto em que qualquer pessoa anuncia sem contrato de parceria. Os 14 tipos de parceiros do SHAREON, seus princípios e o processo de colaboração." },
    contact: { seoTitle: "SHAREON Contato — Newon", seoDescription: "Dúvidas sobre o SHAREON pelos canais oficiais de contato da NEWON." },
  },
  fr: {
    overview: { seoTitle: "SHAREON | Newon — Place de marché de partage et de location", seoDescription: "SHAREON est une application de place de marché où particuliers et entreprises publient directement objets, espaces, mobilité et services, et où d’autres louent ce dont ils ont besoin. L’app est en développement pilote ; aucune location ni aucun paiement réels pour l’instant.", hero: { title: "Pas besoin de posséder.\nJuste quand il le faut." } },
    platform: { seoTitle: "SHAREON Plateforme | 18 domaines de service — Newon", seoDescription: "De la location d’objets, d’espaces et de services à la publication, aux demandes de réservation avec validation, au chat, aux dépôts et aux retours : les 18 domaines de service que prépare l’app SHAREON." },
    business: { seoTitle: "SHAREON Business | 14 activités et modèles — Newon", seoDescription: "Les 14 activités de SHAREON, les modèles C2C, B2C, B2B et B2G, les opportunités de revenus et leurs réserves, et le plan par étapes. Les commissions et les prix ne sont pas fixés." },
    partnerships: { seoTitle: "SHAREON Partenariats — Newon", seoDescription: "Une place de marché ouverte où chacun publie sans contrat de partenariat. Les 14 types de partenaires de SHAREON, ses principes et le processus de collaboration." },
    contact: { seoTitle: "SHAREON Contact — Newon", seoDescription: "Questions sur SHAREON via le formulaire et l’e-mail officiels de NEWON." },
  },
  de: {
    overview: { seoTitle: "SHAREON | Newon — Marktplatz für Teilen und Mieten", seoDescription: "SHAREON ist eine Marktplatz-App, in der Privatpersonen und Unternehmen Dinge, Räume, Mobilität und Dienstleistungen direkt einstellen und andere mieten, was sie brauchen. Die App ist in der Pilotentwicklung; echte Vermietungen und Zahlungen laufen noch nicht.", hero: { title: "Nicht besitzen müssen.\nGenau dann, wenn man es braucht." } },
    platform: { seoTitle: "SHAREON Plattform | 18 Servicebereiche — Newon", seoDescription: "Von der Miete von Dingen, Räumen und Dienstleistungen über Einstellen, Buchungsanfragen mit Freigabe, Chat und Kaution bis zur Rückgabe: die 18 Servicebereiche, die die SHAREON-App vorbereitet." },
    business: { seoTitle: "SHAREON Business | 14 Geschäftsfelder und Modelle — Newon", seoDescription: "Die 14 Geschäftsfelder von SHAREON, die Modelle C2C, B2C, B2B und B2G, Erlöschancen mit ihren Vorbehalten und der Stufenplan. Provisionen und Preise sind nicht festgelegt." },
    partnerships: { seoTitle: "SHAREON Partnerschaften — Newon", seoDescription: "Ein offener Marktplatz, auf dem jeder ohne Partnervertrag einstellen kann. Die 14 Partnertypen von SHAREON, die Grundsätze und der Ablauf der Zusammenarbeit." },
    contact: { seoTitle: "SHAREON Kontakt — Newon", seoDescription: "Anfragen zu SHAREON über das offizielle Kontaktformular und die offizielle E-Mail von NEWON." },
  },
  hi: {
    overview: { seoTitle: "SHAREON | Newon — साझा और किराये का मार्केटप्लेस", seoDescription: "SHAREON एक मार्केटप्लेस ऐप है जहाँ लोग और व्यवसाय चीज़ें, जगहें, आवागमन के साधन और सेवाएँ सीधे सूचीबद्ध करते हैं और ज़रूरतमंद उन्हें किराए पर लेते हैं। ऐप पायलट विकास में है; असली किराया और भुगतान अभी शुरू नहीं हुए हैं।", hero: { title: "मालिक बने बिना,\nठीक ज़रूरत के समय।" } },
    platform: { seoTitle: "SHAREON प्लेटफ़ॉर्म | 18 सेवा क्षेत्र — Newon", seoDescription: "चीज़ों, जगहों और सेवाओं के किराये से लेकर लिस्टिंग, स्वीकृति-आधारित बुकिंग अनुरोध, चैट, जमा राशि और वापसी तक — SHAREON ऐप के 18 सेवा क्षेत्र।" },
    business: { seoTitle: "SHAREON बिज़नेस | 14 व्यवसाय क्षेत्र और मॉडल — Newon", seoDescription: "SHAREON के 14 व्यवसाय क्षेत्र, C2C, B2C, B2B और B2G मॉडल, आय के अवसर और उनकी शर्तें, और चरणबद्ध योजना। कमीशन और कीमतें तय नहीं हैं।" },
    partnerships: { seoTitle: "SHAREON साझेदारी — Newon", seoDescription: "एक खुला मार्केटप्लेस जहाँ कोई भी बिना साझेदारी अनुबंध के सूचीबद्ध कर सकता है। SHAREON के 14 साझेदार प्रकार, सिद्धांत और सहयोग की प्रक्रिया।" },
    contact: { seoTitle: "SHAREON संपर्क — Newon", seoDescription: "SHAREON से जुड़े सवाल NEWON के आधिकारिक फ़ॉर्म और ईमेल से भेजें।" },
  },
  id: {
    overview: { seoTitle: "SHAREON | Newon — Marketplace berbagi dan sewa", seoDescription: "SHAREON adalah aplikasi marketplace tempat perorangan dan bisnis mendaftarkan barang, ruang, sarana mobilitas, dan layanan secara langsung, dan orang lain menyewa yang mereka butuhkan. Aplikasi masih uji coba; sewa dan pembayaran nyata belum berjalan.", hero: { title: "Tak perlu memiliki.\nTepat saat dibutuhkan." } },
    platform: { seoTitle: "SHAREON Platform | 18 bidang layanan — Newon", seoDescription: "Dari sewa barang, ruang, dan layanan hingga pendaftaran, permintaan pemesanan dengan persetujuan, chat, deposit, dan pengembalian: 18 bidang layanan yang disiapkan aplikasi SHAREON." },
    business: { seoTitle: "SHAREON Bisnis | 14 bidang bisnis dan model — Newon", seoDescription: "14 bidang bisnis SHAREON, model C2C, B2C, B2B, dan B2G, peluang pendapatan beserta catatannya, dan rencana bertahap. Komisi dan harga belum ditetapkan." },
    partnerships: { seoTitle: "SHAREON Kemitraan — Newon", seoDescription: "Marketplace terbuka tempat siapa pun dapat mendaftar tanpa kontrak kemitraan. 14 jenis mitra SHAREON, prinsip, dan proses kerja samanya." },
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

/**
 * Areas kept out of SHAREON's core business (plan §3). Used-goods sale exists in the app as a secondary feature and is
 * described as such; these terms must never appear as core SHAREON business areas.
 */
export const EXCLUDED_BUSINESS_TERMS = {
  ko: ["신상품 쇼핑", "공동구매", "디지털 상품"],
  en: ["New-product shopping", "Group buying", "Digital goods"],
};

export { KO, EN };
