/**
 * Ongil detail-page copy. KO / EN are complete; other locales merge overlays onto EN.
 * Business introduction — no live-product, partner, or revenue claims.
 */
import { ONGIL_I18N } from "./home-ongil-i18n.mjs";

function deepMerge(base, over) {
  if (over == null) return base;
  if (Array.isArray(base) || Array.isArray(over)) return over;
  if (typeof base !== "object" || typeof over !== "object") return over;
  const out = { ...base };
  for (const k of Object.keys(over)) {
    out[k] = k in base ? deepMerge(base[k], over[k]) : over[k];
  }
  return out;
}

const KO = {
  seoTitle: "Ongil | Newon — 시니어 종합 생활·돌봄 플랫폼",
  seoDescription:
    "시니어의 일상과 건강, 필요한 돌봄부터 가족과 지역사회까지. 종합 생활 플랫폼 사업 소개이며, 예약·결제·가입은 아직 연결되지 않았습니다.",
  ui: {
    back: "홈의 Ongil 소개로",
    planned: "향후 이용 흐름",
    plannedFlag: "향후 확장 계획",
    expandNote: "현재 운영 현황이 아니라 향후 사업 확장 계획입니다.",
    conceptNote: "현재는 사업 소개입니다. 예약·결제·가입은 아직 연결되지 않았습니다.",
    features: "대표 방향",
    situationsLead: "향후 함께 이용하는 예시입니다. 가족이 일상을 감시하거나 대신 결정하는 구조가 아닙니다.",
  },
  hero: {
    kicker: "NEWON ONGIL",
    brandEn: "ONGIL",
    brandKo: "온길",
    titleHtml: "나이 들어가는 일상에도,<br>따뜻한 연결을.",
    lead: "시니어의 일상과 건강, 필요한 돌봄부터 가족과 지역사회까지. 더 편안하고 주도적인 삶을 위한 종합 생활 플랫폼.",
    visualLine: "스스로 이어가는 일상, 필요할 때 이어지는 연결.",
    ctaMain: "온길 살펴보기",
    ctaSub: "사업 문의",
    status: "현재는 사업 소개입니다.",
  },
  why: {
    kicker: "Why Ongil",
    title: "일상의 도움이 필요한 순간,\n온길이 함께합니다.",
    body: [
      "나이가 들면서 생활에 필요한 정보와 서비스가 달라질 수 있습니다. 건강, 이동, 식사, 주거, 여가, 지역 활동처럼 필요한 도움을 여러 곳에서 각각 찾아야 하는 불편함이 생길 수 있습니다.",
      "온길은 시니어를 일방적으로 보호받거나 관리받는 대상으로 보지 않습니다. 독립적인 생활부터 지속적인 돌봄이 필요한 상황까지, 본인의 선택과 자율을 존중하며 필요한 연결을 돕는 것을 목표로 합니다.",
      "한 사람이 생활 상황에 따라 여러 영역을 이용할 수 있습니다. 대상 집단을 완전히 나누지 않고, 하나의 플랫폼에서 필요한 서비스가 이어지도록 설계합니다.",
    ],
  },
  who: {
    kicker: "Who Ongil is for",
    title: "다양한 생활 상황에서,\n필요한 연결을 이어갑니다.",
    lead: "특정 연령이나 건강 상태만을 위한 서비스가 아닙니다. 생활이 달라져도 같은 온길에서 필요한 영역을 선택할 수 있도록 준비합니다.",
    items: [
      { n: "01", name: "독립적인 생활을 이어가는 시니어", lead: "건강한 일상, 취미, 여가, 새로운 배움, 지역 활동과 생활 편의를 탐색하는 이용자." },
      { n: "02", name: "일상생활에 일부 도움이 필요한 시니어", lead: "식사, 이동, 가사, 외출 등 필요한 생활지원을 탐색하는 이용자." },
      { n: "03", name: "건강과 돌봄 정보가 필요한 시니어", lead: "건강한 생활을 위한 정보와, 필요한 돌봄·전문기관을 탐색하는 이용자." },
      { n: "04", name: "부모님의 생활을 함께 살피는 가족", lead: "본인의 동의와 선택을 존중하며 생활정보와 서비스를 함께 살펴보려는 가족." },
      { n: "05", name: "지역에서 시니어 서비스를 제공하는 기관과 사업자", lead: "생활 서비스, 지역 프로그램, 전문 지원을 제공하거나 연결하는 기관과 사업자." },
    ],
  },
  services: {
    kicker: "Core Services",
    title: "온길이 연결하는 일상",
    lead: "열두 가지 영역을 따로 나열하는 사업이 아닙니다. 일상·건강·돌봄·가족·지역이 한 플랫폼에서 개인의 상황에 따라 이어지도록 설계합니다. 아래는 현재 소개하는 중심 방향입니다.",
    items: [
      {
        id: "daily",
        n: "01",
        name: "일상생활 지원",
        lead: "식사, 이동, 가사, 생활 편의처럼 하루에 필요한 도움을 찾고 연결하는 방향입니다.",
        features: ["생활에 필요한 정보 탐색", "지역 생활지원 연결 검토", "개인 상황에 맞는 안내"],
      },
      {
        id: "care",
        n: "02",
        name: "건강과 돌봄",
        lead: "건강한 생활을 위한 정보와, 필요할 때 돌봄·전문기관을 탐색하는 방향입니다.",
        features: ["건강 생활 정보 안내", "돌봄·기관 정보 탐색", "의료 진단·치료를 직접 제공하지 않음"],
        note: "의료 상담·진단·치료를 직접 제공하지 않으며, 관련 기능은 구현 범위와 규제 검토가 필요합니다.",
      },
      {
        id: "family",
        n: "03",
        name: "가족 연결",
        lead: "시니어와 가족이 필요한 순간에 소통하고, 동의를 바탕으로 생활정보를 나눌 수 있도록 돕는 방향입니다.",
        features: ["선택적 정보 공유", "함께 서비스 탐색", "감시·통제가 아닌 존중"],
        note: "시니어 본인의 동의와 선택을 존중합니다. 건강·위치·생활기록이 가족에게 자동으로 공유되지 않습니다.",
      },
      {
        id: "local",
        n: "04",
        name: "지역 생활",
        lead: "거주 지역을 중심으로 시설, 프로그램, 여가와 사람 사이의 연결을 탐색하는 방향입니다.",
        features: ["지역 정보 탐색", "여가·배움·모임", "커뮤니티는 보호 체계를 마련한 뒤 확대"],
      },
    ],
  },
  domains: {
    kicker: "Living areas",
    title: "생활의 여러 결을,\n하나의 온길에서.",
    lead: "중심 네 방향을 실제 생활 영역으로 나눈 확장 분야입니다. 온길이 직접 운영하지 않는 서비스는 탐색·연결 계획으로 구분해 안내합니다.",
    items: [
      {
        n: "01",
        name: "일상의 작은 순간부터, 필요한 도움까지.",
        lead: "시니어가 일상에서 필요한 정보와 서비스를 더 쉽게 찾도록 돕는 것을 목표로 합니다. 직접 제공하지 않는 도움은 지역 사업자 탐색·연결 계획입니다.",
        planned: true,
        features: ["식사·식생활 지원 탐색", "장보기와 생필품", "가사·청소·세탁 연결", "생활용품·편의시설 정보", "상황에 맞는 서비스 안내"],
        note: "이동·병원 방문 지원의 상세는 아래 이동 영역에서 다룹니다.",
      },
      {
        n: "02",
        name: "건강한 일상을 위한, 생활 속의 연결.",
        lead: "자신의 건강과 생활 습관을 이해하고 필요한 정보를 탐색하도록 돕습니다. 의료 전문가의 판단을 대체하지 않습니다.",
        planned: true,
        features: ["건강한 식생활 정보", "운동·신체활동 프로그램 탐색", "수면·생활 습관 안내", "지역 건강 프로그램", "관심사에 맞는 건강 콘텐츠"],
        note: "복약 알림, 건강검진 안내, 건강정보 분석은 구현 범위와 규제 검토가 필요한 기능입니다. 진단·치료를 직접 제공하지 않습니다.",
      },
      {
        n: "03",
        name: "도움이 필요한 순간, 적절한 돌봄을 찾을 수 있도록.",
        lead: "생활 상황에 따라 돌봄 서비스와 전문기관을 탐색·연결하는 플랫폼으로 확장하는 것을 목표로 합니다. 온길은 돌봄 인력을 직접 고용하거나 전문 돌봄을 직접 제공하지 않습니다.",
        planned: true,
        features: ["방문 돌봄·재가 생활지원 정보", "주간보호 등 시설 정보", "장기요양 관련 일반 정보", "제공 내용·이용 조건 비교", "가족을 위한 돌봄 안내"],
        note: "상담·예약 연결과 이용 후 일정 관리는 검토 중입니다. 확정되지 않은 제휴·인력 현황, 인허가 완료처럼 보이지 않습니다. 자격·인허가가 필요한 서비스는 요건 확인 후 추진합니다.",
      },
      {
        n: "04",
        name: "서로의 일상을 존중하며, 가족을 더 가깝게.",
        lead: "필요한 순간에 소통하고 생활정보를 나누도록 돕습니다. 정보 공유 범위와 접근 권한은 본인이 선택할 수 있는 구조를 장기 설계 원칙으로 둡니다.",
        planned: true,
        features: ["가족 간 소통", "생활 일정·서비스 정보 공유", "함께 생활지원 탐색", "역할과 일정 조율", "중요한 정보의 선택적 공유"],
        situationsLead: "향후 함께 이용하는 예시입니다. 가족이 일상을 감시하거나 대신 결정하는 구조가 아닙니다.",
        situations: [
          "지역 문화 프로그램에 참여하고 싶을 때 관련 정보를 함께 찾아볼 수 있습니다.",
          "일상 도움이 필요할 때 서비스 내용과 이용 조건을 함께 확인할 수 있습니다.",
          "돌봄 일정이 필요할 때, 당사자 동의를 바탕으로 필요한 정보를 나누고 일정을 조율할 수 있습니다.",
          "생활환경이 달라졌을 때 주거·생활 편의 서비스를 함께 탐색할 수 있습니다.",
        ],
        note: "메시지·알림 등 가족 연동 기능은 아직 구현되지 않았으며 향후 계획입니다. 건강·위치·생활기록의 자동 공유는 하지 않습니다.",
      },
      {
        n: "05",
        name: "익숙한 공간에서, 더 편안한 생활을.",
        lead: "생활 방식과 필요에 맞는 주거·생활환경 정보를 탐색하도록 돕습니다. 입주나 전문 개조를 온길이 직접 제공하지 않습니다.",
        planned: true,
        features: ["시니어 친화 주거환경 정보", "집 안 안전·편의 정보", "생활환경 개선 서비스 탐색", "가정 내 편의용품 탐색", "지역 주거지원 정보"],
        note: "스마트홈·편의 기술 연계는 검토 중입니다. 관련 사업자·전문기관 정보를 탐색하고 연결하는 방향입니다.",
      },
      {
        n: "06",
        name: "가고 싶은 곳으로, 이어지는 일상.",
        lead: "이동과 외출에 맞는 교통·지원 정보를 찾기 쉽게 하는 것을 목표로 합니다. 차량이나 이동지원을 직접 운영하지 않습니다.",
        planned: true,
        features: ["대중교통·이동 정보", "교통약자 이동 서비스 정보", "병원 방문 이동지원 탐색", "외출·동행 서비스 탐색", "문화·여가시설 방문 정보"],
        note: "이동 예약 연결과 개인 상황별 편의 안내는 이동지원 사업자·관련 기관과의 연결을 중심으로 검토합니다.",
      },
      {
        n: "07",
        name: "새로운 즐거움과 배움이, 계속되는 일상.",
        lead: "관심사에 따라 활동과 경험을 탐색하도록 돕습니다. 온길을 건강·돌봄에만 머무는 서비스로 보지 않습니다.",
        planned: true,
        features: ["취미와 문화생활", "평생교육과 새로운 배움", "여행·체험 프로그램", "운동·여가·동호회", "자원봉사와 세대 교류"],
        note: "지역 프로그램·행사와 디지털 교육은 여가·배움의 연장으로 안내하며, 시설 목록을 이 화면에서 나열하지 않습니다.",
      },
      {
        n: "08",
        name: "가까운 곳에서 시작되는, 새로운 연결.",
        lead: "거주 지역을 중심으로 정보와 사람, 시설·프로그램을 탐색하는 지역 기반 생활 플랫폼으로 확장하는 것을 목표로 합니다.",
        planned: true,
        features: ["지역 복지·문화·체육시설", "주민센터·공공 프로그램", "지역 행사와 관심사 모임", "자원봉사·세대 교류", "지역 생활 서비스 제공자 탐색"],
        note: "커뮤니티 기능은 운영 정책과 이용자 보호 체계를 마련한 뒤 단계적으로 확대할 예정입니다. 일상·건강·돌봄의 상세는 각 영역에서 다룹니다.",
      },
      {
        n: "09",
        name: "디지털이 더 쉬워지는, 편안한 일상.",
        lead: "여러 디지털 서비스를 더 쉽게 쓰도록 돕는 공통 기반입니다. 별도의 복잡한 기술 교육 플랫폼이 아닙니다.",
        planned: true,
        features: ["스마트폰·기기 사용 안내", "온라인 예약·공공 서비스 안내", "일상 디지털 환경·금융 기초 정보", "온라인 안전·사기 예방", "지역 디지털 교육 연결"],
        note: "큰 글씨, 명확한 버튼, 쉬운 안내, 음성 지원 등 접근성을 고려해 설계하는 방향입니다. 음성 기반 탐색은 검토 중입니다.",
      },
    ],
  },
  ai: {
    kicker: "Personal AI",
    title: "나에게 필요한 정보를,\n더 쉽게 찾을 수 있도록.",
    lead: "관심사와 생활 상황에 맞는 정보를 찾기 쉽도록 AI 안내를 단계적으로 도입하는 것을 목표로 합니다. 온길의 여러 영역을 받치는 공통 기술이며, 각 생활 영역마다 같은 설명을 반복하지 않습니다.",
    note: "AI는 선택을 돕는 탐색·안내 도구입니다. 의료·법률 판단을 대신하거나 중요한 결정을 자동으로 내리지 않습니다.",
    planned: true,
    items: [
      { n: "01", name: "대화형 생활정보 탐색", lead: "쉬운 언어로 필요한 정보를 묻고 찾을 수 있도록 검토합니다." },
      { n: "02", name: "상황에 맞는 서비스 안내", lead: "생활 상황과 지역을 반영한 안내를 목표로 합니다." },
      { n: "03", name: "일정·알림과 관심 활동", lead: "생활 일정과 여가 정보를 찾아보는 도움을 검토합니다." },
      { n: "04", name: "가족과 나눌 정보 정리", lead: "본인이 선택한 범위에서 공유할 내용을 정리하는 방향을 검토합니다." },
    ],
  },
  commerce: {
    kicker: "Senior life commerce",
    title: "일상에 필요한 상품과 서비스를,\n한곳에서.",
    lead: "생활 방식에 맞는 상품·서비스를 탐색하고 연결하는 커머스 영역으로 확장하는 것을 목표로 합니다. 쇼핑몰이나 판매 기능을 이미 운영하지 않습니다.",
    planned: true,
    note: "의료기기, 건강기능식품 등 별도 규제·전문 검토가 필요한 상품을 무분별하게 판매하는 구조로 소개하지 않습니다.",
    models: ["상품 탐색", "가격·서비스 비교", "제휴 판매", "구매 연결", "생활 서비스 예약", "지역 서비스 중개", "정기 생활 편의"],
    items: [
      { n: "01", name: "생활·식생활·편의용품", lead: "일상과 식생활, 집 안 편의에 쓰는 상품을 탐색하는 방향입니다." },
      { n: "02", name: "운동·취미·주거 개선", lead: "활동과 생활환경을 위한 일반 소비재·용품을 연결하는 방향입니다." },
      { n: "03", name: "이동·디지털·체험", lead: "외출 용품, 디지털 편의, 여행·문화 체험의 탐색을 검토합니다." },
      { n: "04", name: "생활지원 예약과 지역 상품", lead: "서비스 예약·연결과 지역 기반 상품을 중개하는 모델을 검토합니다." },
    ],
  },
  how: {
    kicker: "How it works",
    title: "필요한 순간마다,\n하나의 온길에서.",
    note: "아래는 향후 이용 경험의 구상입니다. 현재 연결된 신청·예약 절차가 아닙니다.",
    steps: [
      {
        n: "01",
        name: "나의 생활 상황 선택",
        body: "일상, 건강, 돌봄, 가족, 여가처럼 지금 필요한 생활 영역을 선택합니다.",
      },
      {
        n: "02",
        name: "정보와 서비스 탐색",
        body: "상황과 관심사에 맞는 정보, 지역 서비스, 관련 프로그램을 확인합니다.",
      },
      {
        n: "03",
        name: "비교·연결하고 계속 이용",
        body: "내용과 이용 조건을 확인한 뒤 기관·제공자로 연결되는 것을 목표로 합니다. 생활이 달라져도 새로 필요한 정보를 같은 온길에서 이어서 찾을 수 있습니다.",
      },
    ],
  },
  ecosystem: {
    kicker: "Partners",
    title: "지역과 전문 기관이\n이어지는 생태계.",
    lead: "장기적으로 생활 서비스 제공자, 돌봄 기관, 문화·교육, 이동, 주거, 공공·기업 복지 등과 연결을 검토합니다. 확정되지 않은 기관명이나 로고는 넣지 않습니다.",
    note: "현재 제휴하지 않은 대상은 향후 협력·연결 가능 분야입니다. 공공·돌봄 관련 협력은 자격, 계약, 운영 요건을 확인한 뒤 추진합니다.",
    items: [
      "지역 생활지원 제공자",
      "돌봄·복지 기관",
      "문화·평생교육 기관",
      "이동·외출지원 제공자",
      "주거·생활환경 사업자",
      "식사·생활 편의 제공자",
      "건강 생활 프로그램 운영",
      "여행·여가 서비스",
      "시니어 생활용품 판매",
      "공공·지역사회 조직",
      "기업 복지·가족지원",
    ],
  },
  model: {
    kicker: "Business model",
    title: "지속 가능한 시니어 생활 플랫폼을 향해.",
    lead: "향후 검토 가능한 수익화 방향입니다. 이미 운영 중인 과금이 아니며, 구독료·수수료·매출·이용자 수·계약 실적은 표시하지 않습니다.",
    note: "중개·공공·돌봄 관련 모델은 관련 법규와 운영 요건을 검토한 뒤 추진하는 방향입니다.",
    items: [
      { n: "01", name: "개인 프리미엄 구독", body: "맞춤 생활정보, 추가 AI 편의, 개인 생활관리 기능을 중심으로 프리미엄을 검토합니다." },
      { n: "02", name: "가족 연계 서비스", body: "일정 관리, 선택적 정보 공유, 생활지원 공동 탐색 등 가족 편의 구독을 검토합니다." },
      { n: "03", name: "생활·돌봄 서비스 중개", body: "연결 과정에서 법규와 운영 요건을 확인한 뒤 적절한 중개 모델을 검토합니다." },
      { n: "04", name: "시니어 라이프 커머스", body: "생활·편의·취미 상품과 생활 서비스의 제휴 판매·구매 연결을 검토합니다." },
      { n: "05", name: "지역 서비스 파트너십", body: "지역 제공자와의 제휴로 탐색·예약·연결 범위를 넓히는 모델을 검토합니다." },
      { n: "06", name: "기업·기관 대상 서비스", body: "임직원 가족지원, 기관의 시니어 생활 안내 등 플랫폼 제공을 검토합니다." },
      { n: "07", name: "지역사회·공공 협력", body: "지자체·공공의 시니어 생활지원 사업과 협력할 수 있는 모델을 검토합니다." },
    ],
  },
  expand: {
    kicker: "Business expansion",
    title: "일상에서 시작해,\n더 넓은 연결로.",
    note: "확정되지 않은 출시 일정, 제휴, 매출, 이용자 수, 서비스 제공 지역은 표시하지 않습니다.",
    stages: [
      {
        n: "01",
        name: "시니어 생활정보 플랫폼",
        body: "일상, 건강한 생활, 지역 활동, 생활 편의 정보를 한곳에서 탐색할 수 있는 기반을 구축합니다.",
      },
      {
        n: "02",
        name: "맞춤 안내와 지역·돌봄 연결",
        body: "생활 상황과 관심사에 맞는 안내를 단계적으로 도입하고, 지역 생활지원·돌봄·전문기관 정보의 연결 범위를 확대할 예정입니다.",
      },
      {
        n: "03",
        name: "가족 연계, 커뮤니티, 라이프 커머스",
        body: "본인의 선택과 동의를 바탕으로 가족 소통과 정보 공유를 발전시키고, 지역 커뮤니티와 상품·생활 서비스 탐색을 넓혀갑니다.",
      },
      {
        n: "04",
        name: "기업·기관 협력과 종합 플랫폼",
        body: "기업, 지역·공공기관과 협력할 수 있는 모델을 검토하며, 일상·건강·돌봄·가족·지역·커머스를 잇는 종합 플랫폼으로 발전시키는 것을 목표로 합니다.",
      },
    ],
  },
  related: {
    kicker: "NEWON",
    title: "Newon 안에서\n온길이 맡는 자리.",
    lead: "온길은 Newon 여섯 사업 가운데 시니어 생활과 돌봄에 특화된 사업입니다. 장기적으로 협력할 수 있으나, 현재 기술적으로 연동되거나 데이터가 자동 공유되지 않습니다.",
    items: [
      { n: "01", name: "Life Stage", body: "10대부터 70대까지 생애주기의 변화와 새로운 시작을 돕는 종합 플랫폼. 온길의 시니어 특화 돌봄·생활을 대체하지 않습니다." },
      { n: "02", name: "Ongil", body: "시니어의 일상과 돌봄, 가족·지역사회 연결에 특화된 플랫폼." },
      { n: "03", name: "NEWON AI", body: "맞춤 생활정보 탐색과 안내에 활용할 수 있는 AI 기술·서비스." },
      { n: "04", name: "Consumer · Business · Commerce", body: "일상 앱 생태계, 기업·기관 솔루션, 상품·생활 서비스 거래를 각각 담당합니다. 상세 기능은 각 사업 화면에서 안내합니다." },
    ],
  },
  close: {
    kicker: "ONGIL VISION",
    titleHtml: "더 편안한 일상,<br>더 든든한 연결.",
    lead: "온길은 시니어가 자신의 일상을 주도적으로 이어가고, 필요할 때 가족과 지역, 생활 서비스와 전문적인 도움이 이어지도록 종합 생활·돌봄 플랫폼을 넓혀갑니다.",
    ctaMain: "사업 및 협업 문의",
    ctaSub: "Newon의 다른 사업 살펴보기",
  },
};

const EN = {
  seoTitle: "Ongil | Newon — A full living and care platform for seniors.",
  seoDescription:
    "From daily life and health to care, family, and community. A business introduction — booking, payment, and sign-up are not connected yet.",
  ui: {
    back: "Back to Ongil on the homepage",
    planned: "Planned journey",
    plannedFlag: "Later expansion",
    expandNote: "A future expansion plan, not a claim of current operations.",
    conceptNote: "This page is a business introduction. Booking, payment, and sign-up are not connected yet.",
    features: "Direction",
    situationsLead: "Examples of a later shared experience. Families do not watch or decide in place of the person.",
  },
  hero: {
    kicker: "NEWON ONGIL",
    brandEn: "ONGIL",
    brandKo: "Ongil",
    titleHtml: "Warm connection,<br>through the years of daily life.",
    lead: "From daily life and health to the care that is needed, family, and the local community. A full living platform for a more comfortable, self-directed life.",
    visualLine: "A life led on one’s own terms — connection that joins when it is needed.",
    ctaMain: "Explore Ongil",
    ctaSub: "Business inquiry",
    status: "This page is a business introduction.",
  },
  why: {
    kicker: "Why Ongil",
    title: "When daily life needs a hand,\nOngil is there.",
    body: [
      "As people grow older, the information and services daily life needs can change. Help with health, getting around, meals, housing, leisure, and local activities can mean searching in many separate places.",
      "Ongil does not treat seniors as people to be watched or managed. From independent living to ongoing care, the aim is to respect choice and autonomy, and to help with the links that are needed.",
      "One person may use several areas as life changes. We do not split users into sealed groups. The design is one platform where the services that are needed can connect.",
    ],
  },
  who: {
    kicker: "Who Ongil is for",
    title: "Across different living situations,\nthe links that are needed.",
    lead: "Not a service for one age or one health state. As life changes, people should be able to choose the areas they need on the same Ongil.",
    items: [
      { n: "01", name: "Seniors living independently", lead: "People exploring a healthy day, hobbies, leisure, new learning, local activity, and everyday convenience." },
      { n: "02", name: "Seniors who need some daily help", lead: "People exploring living support for meals, getting around, housework, and going out." },
      { n: "03", name: "Seniors looking for health and care information", lead: "People exploring healthy-living information and, when needed, care and specialist organizations." },
      { n: "04", name: "Families looking after a parent’s days", lead: "Families who want to browse living information and services together, while respecting the person’s consent and choice." },
      { n: "05", name: "Local organizations and providers", lead: "Groups that offer or connect living services, local programs, and specialist support for seniors." },
    ],
  },
  services: {
    kicker: "Core Services",
    title: "The daily life Ongil connects",
    lead: "This is not twelve separate products. Daily living, health, care, family, and local life are designed to connect on one platform, according to the person’s situation. The four below are the directions we introduce today.",
    items: [
      {
        id: "daily",
        n: "01",
        name: "Daily living support",
        lead: "Find and connect help that a day may need — meals, getting around, housework, and convenience.",
        features: ["Browse living information", "Review links to local living support", "Guidance that fits the situation"],
      },
      {
        id: "care",
        n: "02",
        name: "Health and care",
        lead: "Browse healthy-living information and, when needed, care and specialist organizations.",
        features: ["Healthy-living information", "Browse care and organizations", "No medical diagnosis or treatment by Ongil"],
        note: "Ongil does not provide medical advice, diagnosis, or treatment. Related features need a review of scope and rules.",
      },
      {
        id: "family",
        n: "03",
        name: "Family connection",
        lead: "Help seniors and families talk when it matters, and share living information with consent.",
        features: ["Sharing by choice", "Browse services together", "Respect, not watching or control"],
        note: "The senior’s consent and choice come first. Health, location, and living records are not shared with family automatically.",
      },
      {
        id: "local",
        n: "04",
        name: "Local life",
        lead: "Browse facilities, programs, leisure, and people around where someone lives.",
        features: ["Local information", "Leisure, learning, and groups", "Community grows after protection rules are in place"],
      },
    ],
  },
  domains: {
    kicker: "Living areas",
    title: "Many sides of living,\non one Ongil.",
    lead: "How the four directions extend into real life. Services Ongil does not run itself are described as plans to browse and connect.",
    items: [
      {
        n: "01",
        name: "From small daily moments to the help that is needed.",
        lead: "The aim is to make living information and services easier to find. Help Ongil does not provide is a plan to browse and connect local providers.",
        planned: true,
        features: ["Meals and eating support", "Shopping and daily goods", "Housework, cleaning, laundry", "Household goods and nearby amenities", "Guidance that fits the situation"],
        note: "Getting around and hospital visits are covered in the mobility area below.",
      },
      {
        n: "02",
        name: "Connection in daily life, for healthier days.",
        lead: "Help people understand health and habits, and find information. This does not replace a clinician’s judgment.",
        planned: true,
        features: ["Healthy eating information", "Activity programs", "Sleep and habit guidance", "Local health programs", "Health content by interest"],
        note: "Medication reminders, checkup information, and health analysis need a review of scope and rules. Ongil does not diagnose or treat.",
      },
      {
        n: "03",
        name: "When help is needed, a way to find fitting care.",
        lead: "The aim is a platform that browses and connects care and specialist organizations. Ongil does not hire care workers or provide specialist care itself.",
        planned: true,
        features: ["Home-visit and at-home living support", "Day-care and related facilities", "General long-term care information", "Compare what is offered and how it works", "Care guidance for families"],
        note: "Consultation, booking links, and later schedule tools are under review. We do not show unconfirmed partners, staffing, or licenses as if they were live. Services that need qualifications proceed after those requirements are checked.",
      },
      {
        n: "04",
        name: "Closer as a family, while respecting each day.",
        lead: "Help people talk and share living information when it is needed. How much is shared, and who can see it, is a long-term design principle the person should choose.",
        planned: true,
        features: ["Family conversation", "Share dates and service notes", "Browse living support together", "Coordinate roles and schedules", "Share important information by choice"],
        situationsLead: "Examples of a later shared experience. Families do not watch or decide in place of the person.",
        situations: [
          "Look up a local culture program together when a parent wants to join.",
          "Review what a living-support service offers, and how it works, when daily help is needed.",
          "With the person’s consent, share what is needed and coordinate dates when care schedules matter.",
          "Browse housing and living-convenience services together when the home situation changes.",
        ],
        note: "Family messaging and alerts are not built yet — a later plan. Health, location, and living records are not shared automatically.",
      },
      {
        n: "05",
        name: "A more comfortable life in a familiar place.",
        lead: "Help people browse housing and living-environment information that fits how they live. Ongil does not provide moves into facilities or specialist home conversion.",
        planned: true,
        features: ["Senior-friendly housing information", "Safety and convenience at home", "Browse home-improvement services", "Household convenience goods", "Local housing-support information"],
        note: "Smart-home and convenience-tech links are under review. The direction is to browse and connect providers and specialists.",
      },
      {
        n: "06",
        name: "Daily life that still goes where you want to go.",
        lead: "Make transport and going-out information easier to find. Ongil does not run vehicles or mobility services itself.",
        planned: true,
        features: ["Public transport and travel information", "Mobility services for people who need them", "Transport for hospital visits", "Going-out and accompaniment", "Visits to culture and leisure places"],
        note: "Booking links and situation-based convenience are reviewed around connections with mobility providers and related organizations.",
      },
      {
        n: "07",
        name: "New enjoyment and learning, still part of the day.",
        lead: "Help people explore activity and experience by interest. Ongil is not only a health-and-care service.",
        planned: true,
        features: ["Hobbies and culture", "Lifelong learning", "Travel and experience programs", "Activity, leisure, and clubs", "Volunteering and meeting across ages"],
        note: "Local programs, events, and digital learning are introduced as part of leisure and learning. This page does not list venues.",
      },
      {
        n: "08",
        name: "New connection that starts nearby.",
        lead: "The aim is a local living platform to browse information, people, places, and programs around where someone lives.",
        planned: true,
        features: ["Local welfare, culture, and sports places", "Community-center and public programs", "Local events and interest groups", "Volunteering and meeting across ages", "Local living-service providers"],
        note: "Community features are planned to grow after operating policy and user-protection rules are in place. Daily living, health, and care details stay in those areas.",
      },
      {
        n: "09",
        name: "A calmer day, as digital gets easier.",
        lead: "A shared base so people can use digital services more easily — not a separate, complex training platform.",
        planned: true,
        features: ["Guidance for phones and devices", "Online booking and public services", "Everyday digital settings and basic finance information", "Online safety and fraud awareness", "Links to local digital learning"],
        note: "Design aims include larger type, clear buttons, plain guidance, and voice support. Voice browsing is under review.",
      },
    ],
  },
  ai: {
    kicker: "Personal AI",
    title: "Make the information you need\neasier to find.",
    lead: "The aim is to introduce AI guidance step by step so information fits interests and living situations. It is shared technology under Ongil, not a long repeat in every living area.",
    note: "AI is a search and guidance tool that supports choice. It does not replace medical or legal judgment, or take important decisions automatically.",
    planned: true,
    items: [
      { n: "01", name: "Conversational living information", lead: "Ask and find what is needed in plain language." },
      { n: "02", name: "Guidance that fits the situation", lead: "Aim to reflect living situation and locality." },
      { n: "03", name: "Dates, reminders, and interests", lead: "Help looking up living dates and leisure." },
      { n: "04", name: "Notes to share with family", lead: "Review a way to tidy what the person chooses to share." },
    ],
  },
  commerce: {
    kicker: "Senior life commerce",
    title: "Goods and services for daily life,\nin one place.",
    lead: "The aim is a commerce area to browse and connect goods and services that fit how seniors live. A shop or checkout is not running today.",
    planned: true,
    note: "We do not present a structure that sells medical devices or health-functional foods without the reviews those products need.",
    models: ["Browse goods", "Compare price and service", "Partner sales", "Purchase links", "Book living services", "Local service matching", "Recurring convenience"],
    items: [
      { n: "01", name: "Living, food, and convenience", lead: "Browse goods for the day, eating, and the home." },
      { n: "02", name: "Activity, hobby, and the home", lead: "Connect everyday goods for movement and living environment." },
      { n: "03", name: "Getting around, digital, experiences", lead: "Review going-out goods, digital convenience, travel and culture." },
      { n: "04", name: "Living-support booking and local goods", lead: "Review booking, connection, and local goods matching." },
    ],
  },
  how: {
    kicker: "How it works",
    title: "When it is needed,\non one Ongil.",
    note: "A planned experience, not a live apply-and-book flow.",
    steps: [
      {
        n: "01",
        name: "Choose your living situation",
        body: "Pick the area you need now — daily living, health, care, family, leisure, and similar.",
      },
      {
        n: "02",
        name: "Browse information and services",
        body: "See information, local services, and programs that fit the situation and interests.",
      },
      {
        n: "03",
        name: "Compare, connect, and keep using",
        body: "The aim is to review what is offered and how it works, then connect to an organization or provider. As life changes, new needs can still be found on the same Ongil.",
      },
    ],
  },
  ecosystem: {
    kicker: "Partners",
    title: "An ecosystem of local\nand specialist organizations.",
    lead: "Later we may review links with living-support providers, care, culture and learning, mobility, housing, public bodies, and workplace family support. Unconfirmed names and logos are not shown.",
    note: "Organizations we do not partner with today are possible later fields of cooperation. Public and care-related work proceeds after qualifications, contracts, and operating requirements are checked.",
    items: [
      "Local living-support providers",
      "Care and welfare organizations",
      "Culture and lifelong-learning bodies",
      "Mobility and going-out support",
      "Housing and living-environment firms",
      "Meals and living convenience",
      "Healthy-living programs",
      "Travel and leisure services",
      "Senior living-goods sellers",
      "Public and community groups",
      "Workplace welfare and family support",
    ],
  },
  model: {
    kicker: "Business model",
    title: "Toward a lasting senior living platform.",
    lead: "Revenue directions under review. Not live charging. Unconfirmed prices, fees, revenue, user counts, and contracts are not shown.",
    note: "Matching, public, and care-related models proceed after the relevant rules and operating requirements are reviewed.",
    items: [
      { n: "01", name: "Personal premium", body: "Review premium around tailored living information, extra AI convenience, and personal living tools." },
      { n: "02", name: "Family-linked service", body: "Review a subscription around schedules, sharing by choice, and browsing living support together." },
      { n: "03", name: "Living and care matching", body: "After checking rules and operating needs, review a fitting matching model for connections." },
      { n: "04", name: "Senior life commerce", body: "Review partner sales and purchase links for living, convenience, hobby goods, and living services." },
      { n: "05", name: "Local service partnerships", body: "Review a model that widens browse, booking, and connection with local providers." },
      { n: "06", name: "Services for companies and institutions", body: "Review a platform for employee family support and senior living guidance for organizations." },
      { n: "07", name: "Community and public cooperation", body: "Review a model that can work with local-government and public senior living programs." },
    ],
  },
  expand: {
    kicker: "Business expansion",
    title: "Start with daily life,\nthen a wider connection.",
    note: "Unconfirmed launch dates, partners, revenue, user counts, and service areas are not shown.",
    stages: [
      {
        n: "01",
        name: "A senior living-information platform",
        body: "Build a base to browse daily living, healthier living, local activity, and convenience information in one place.",
      },
      {
        n: "02",
        name: "Personal guidance and local care links",
        body: "Introduce guidance that fits living situations step by step, and widen links to local living support, care, and specialist information.",
      },
      {
        n: "03",
        name: "Family links, community, and life commerce",
        body: "With the person’s choice and consent, grow family conversation and sharing, and widen local community plus goods and living-service browsing.",
      },
      {
        n: "04",
        name: "Company and public cooperation, and a full platform",
        body: "Review models that can work with companies and local or public bodies, aiming to grow into a platform that connects daily living, health, care, family, community, and commerce.",
      },
    ],
  },
  related: {
    kicker: "NEWON",
    title: "Ongil’s place\ninside Newon.",
    lead: "Ongil is the Newon business focused on senior living and care. Cooperation is possible later. Today the products are not technically linked, and data is not shared automatically.",
    items: [
      { n: "01", name: "Life Stage", body: "A platform for life changes and new starts from the teens through the seventies. It does not replace Ongil’s senior living and care focus." },
      { n: "02", name: "Ongil", body: "A platform focused on seniors’ daily life and care, and on family and community connection." },
      { n: "03", name: "NEWON AI", body: "AI technology and services that can support tailored living information and guidance." },
      { n: "04", name: "Consumer · Business · Commerce", body: "Everyday apps, solutions for companies and institutions, and trade in goods and living services. Details stay on those pages." },
    ],
  },
  close: {
    kicker: "ONGIL VISION",
    titleHtml: "A more comfortable day,<br>a steadier connection.",
    lead: "Ongil is widening a full living-and-care platform so seniors can keep leading their own days, and so family, community, living services, and specialist help can join when they are needed.",
    ctaMain: "Business and partnership inquiry",
    ctaSub: "See Newon’s other businesses",
  },
};

export function getOngilCopy(lang) {
  if (lang === "ko") return KO;
  if (lang === "en") return EN;
  const over = ONGIL_I18N[lang];
  return over ? deepMerge(EN, over) : EN;
}

export { KO, EN };
