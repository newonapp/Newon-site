/**
 * Ongil detail-page copy. KO / EN are complete; other locales merge overlays onto EN.
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
  ui: {
    back: "홈의 Ongil 소개로",
    planned: "향후 이용 흐름",
    expandNote: "현재 운영 현황이 아니라 향후 사업 확장 계획입니다.",
    conceptNote: "현재는 사업 소개입니다. 예약·결제·가입은 아직 연결되지 않았습니다.",
    features: "대표 방향",
  },
  hero: {
    kicker: "NEWON ONGIL",
    brandEn: "ONGIL",
    brandKo: "온길",
    titleHtml: "나이 들어가는 일상에도,<br>따뜻한 연결을.",
    lead: "시니어의 일상과 필요한 돌봄, 가족의 안심을 연결하는 생활 플랫폼.",
    visualLine: "스스로 이어가는 일상, 필요할 때 이어지는 돌봄.",
    ctaMain: "온길 살펴보기",
    ctaSub: "사업 문의",
    status: "현재는 사업 소개입니다.",
  },
  why: {
    kicker: "Why Ongil",
    title: "일상의 도움이 필요한 순간,\n온길이 함께합니다.",
    body: [
      "나이가 들면서 생활에 필요한 정보와 서비스가 달라질 수 있습니다.",
      "건강, 이동, 식사, 일상생활, 지역 활동처럼 필요한 도움을 여러 곳에서 각각 찾아야 하는 불편함이 생길 수 있습니다.",
      "가족 역시 어떤 서비스가 필요한지, 어디에서 찾아야 하는지 확인하는 데 어려움을 겪을 수 있습니다.",
      "온길은 이러한 정보와 서비스를 하나의 생활 플랫폼에서 보다 쉽게 탐색하고 연결할 수 있도록 돕는 것을 목표로 합니다.",
    ],
  },
  services: {
    kicker: "Core Services",
    title: "온길이 연결하는 일상",
    lead: "일상생활부터 건강과 돌봄, 가족과 지역사회까지. 필요한 순간에 필요한 서비스를 찾을 수 있도록 돕습니다.",
    aiNote: "개인의 상황과 필요에 맞는 정보를 더 쉽게 찾을 수 있도록 맞춤형 안내 기능을 단계적으로 도입할 계획입니다.",
    items: [
      {
        id: "daily",
        n: "01",
        name: "일상생활 지원",
        lead: "식사, 이동, 가사, 생활 편의 등 일상에 필요한 도움을 탐색하고 연결하는 영역입니다.",
        features: [
          "식사 및 생활 편의 서비스 탐색",
          "이동 및 외출 관련 서비스 안내",
          "가사 및 일상생활 지원 서비스 연결",
          "개인 상황에 맞는 생활 정보 제공",
        ],
      },
      {
        id: "care",
        n: "02",
        name: "건강과 돌봄",
        lead: "건강 관련 정보를 확인하고, 필요한 돌봄 서비스를 탐색하고 연결하는 영역입니다.",
        features: [
          "건강 및 생활관리 관련 정보 안내",
          "돌봄 서비스 탐색",
          "전문 기관 및 서비스 제공자 정보 확인",
          "개인 상황에 맞는 돌봄 서비스 연결",
        ],
        note: "의료 상담·진단·치료를 직접 제공하지 않으며, 건강 정보 안내와 돌봄 서비스 연결을 중심으로 준비합니다.",
      },
      {
        id: "family",
        n: "03",
        name: "가족 연결",
        lead: "시니어와 가족이 필요한 정보를 공유하고 소통할 수 있도록 돕는 영역입니다.",
        features: [
          "가족 간 소통",
          "필요한 생활 정보 공유",
          "돌봄 관련 일정 및 정보 확인",
          "가족이 함께 필요한 서비스 탐색",
        ],
        note: "시니어 본인의 동의와 선택을 존중합니다. 건강·생활 정보가 가족에게 자동으로 공유되지 않습니다.",
      },
      {
        id: "local",
        n: "04",
        name: "지역 생활",
        lead: "거주 지역을 중심으로 생활 정보와 다양한 활동 및 서비스를 탐색하는 영역입니다.",
        features: [
          "지역 복지시설 및 생활 서비스 정보",
          "문화·여가·취미 활동 탐색",
          "지역 커뮤니티 및 프로그램 안내",
          "가까운 생활지원 서비스 탐색",
        ],
      },
    ],
  },
  how: {
    kicker: "How it works",
    title: "필요한 도움을 찾는\n더 쉬운 방법",
    note: "아래는 서비스 구상과 향후 이용 흐름입니다. 현재 연결된 신청·예약 절차가 아닙니다.",
    steps: [
      {
        n: "01",
        name: "필요한 도움 선택",
        body: "생활, 건강과 돌봄, 가족, 지역 생활 중 현재 필요한 영역을 선택합니다.",
      },
      {
        n: "02",
        name: "정보와 서비스 탐색",
        body: "선택한 영역과 개인 상황에 맞는 정보 및 서비스를 확인합니다.",
      },
      {
        n: "03",
        name: "서비스 확인 및 연결",
        body: "서비스 제공 내용과 이용 조건을 확인하고 필요한 서비스로 연결되는 것을 목표로 합니다.",
      },
    ],
  },
  expand: {
    kicker: "Business expansion",
    title: "일상에서 시작해,\n더 넓은 연결로.",
    note: "확정되지 않은 제휴, 매출, 이용자 수, 서비스 제공 지역은 표시하지 않습니다.",
    stages: [
      {
        n: "01",
        name: "시니어 생활 정보와 서비스 탐색",
        body: "시니어와 가족이 필요한 생활 정보 및 서비스를 한곳에서 쉽게 찾을 수 있는 기반을 구축합니다.",
      },
      {
        n: "02",
        name: "지역 서비스 및 전문기관 연결 확대",
        body: "지역별 생활지원 서비스, 돌봄 제공자, 전문기관 등과의 연결 범위를 단계적으로 확대할 예정입니다.",
      },
      {
        n: "03",
        name: "가족 연계 및 개인 맞춤 기능 고도화",
        body: "시니어 본인의 선택과 동의를 바탕으로 가족 간 소통과 정보 공유 기능을 발전시키고, 개인의 필요에 맞는 서비스 탐색 경험을 고도화합니다.",
      },
      {
        n: "04",
        name: "종합 시니어 생활 플랫폼으로 확장",
        body: "일상생활, 돌봄, 지역 활동, 생활 서비스를 연결하는 종합 플랫폼으로 발전시키는 것을 목표로 합니다.",
      },
    ],
  },
  close: {
    kicker: "ONGIL VISION",
    titleHtml: "더 편안한 일상,<br>더 든든한 연결.",
    lead: "온길은 시니어가 자신의 일상을 주도적으로 이어가고, 가족이 필요한 순간에 함께할 수 있도록 생활과 돌봄의 연결을 넓혀갑니다.",
    ctaMain: "사업 및 협업 문의",
    ctaSub: "Newon의 다른 사업 살펴보기",
  },
};

const EN = {
  ui: {
    back: "Back to Ongil on the homepage",
    planned: "Planned journey",
    expandNote: "A future expansion plan, not a claim of current operations.",
    conceptNote: "This page is a business introduction. Booking, payment, and sign-up are not connected yet.",
    features: "Direction",
  },
  hero: {
    kicker: "NEWON ONGIL",
    brandEn: "ONGIL",
    brandKo: "Ongil",
    titleHtml: "Warm connection,<br>through the years of daily life.",
    lead: "A living platform that connects seniors’ daily lives, the care they need, and peace of mind for families.",
    visualLine: "A life led on one’s own terms — care that joins when it is needed.",
    ctaMain: "Explore Ongil",
    ctaSub: "Business inquiry",
    status: "This page is a business introduction.",
  },
  why: {
    kicker: "Why Ongil",
    title: "When daily life needs a hand,\nOngil is there.",
    body: [
      "As people grow older, the information and services daily life needs can change.",
      "Help with health, getting around, meals, living at home, and local activities can mean searching in many separate places.",
      "Families can also find it hard to know which services are needed, and where to look.",
      "Ongil aims to make it easier to browse and connect that information and those services in one living platform.",
    ],
  },
  services: {
    kicker: "Core Services",
    title: "The daily life Ongil connects",
    lead: "From living support to health and care, family, and the local community. Helping people find the service they need, when they need it.",
    aiNote: "We plan to introduce tailored guidance step by step, so information that fits each person’s situation is easier to find.",
    items: [
      {
        id: "daily",
        n: "01",
        name: "Daily living support",
        lead: "Browse and connect help for meals, getting around, housework, and everyday convenience.",
        features: [
          "Find meal and living-convenience services",
          "Guidance on getting around and going out",
          "Connect housework and daily-living support",
          "Living information that fits the person’s situation",
        ],
      },
      {
        id: "care",
        n: "02",
        name: "Health and care",
        lead: "Check health-related information, and browse and connect the care services that are needed.",
        features: [
          "Health and daily-management information",
          "Browse care services",
          "Information on specialist organizations and providers",
          "Connect care that fits the person’s situation",
        ],
        note: "Ongil does not provide medical advice, diagnosis, or treatment. We are preparing around health information and care connections.",
      },
      {
        id: "family",
        n: "03",
        name: "Family connection",
        lead: "Help seniors and families share the information they need and stay in touch.",
        features: [
          "Family conversation",
          "Share living information that is needed",
          "See care-related dates and notes",
          "Browse services together as a family",
        ],
        note: "The senior’s consent and choice come first. Health and living information is not shared with family automatically.",
      },
      {
        id: "local",
        n: "04",
        name: "Local life",
        lead: "Browse living information, activities, and services around where people live.",
        features: [
          "Local welfare and living-service information",
          "Culture, leisure, and hobby activities",
          "Local community and program guides",
          "Nearby living-support services",
        ],
      },
    ],
  },
  how: {
    kicker: "How it works",
    title: "An easier way\nto find the help you need",
    note: "This is a planned journey, not a live apply-and-book flow.",
    steps: [
      {
        n: "01",
        name: "Choose the help you need",
        body: "Pick daily living, health and care, family, or local life.",
      },
      {
        n: "02",
        name: "Browse information and services",
        body: "See information and services that fit the area you chose and the person’s situation.",
      },
      {
        n: "03",
        name: "Review and connect",
        body: "The aim is to review what a service offers and how it works, then connect to the help that is needed.",
      },
    ],
  },
  expand: {
    kicker: "Business expansion",
    title: "Start with daily life,\nthen a wider connection.",
    note: "Unconfirmed partners, revenue, user counts, and service areas are not shown.",
    stages: [
      {
        n: "01",
        name: "Find senior living information and services",
        body: "Build a base so seniors and families can find the living information and services they need in one place.",
      },
      {
        n: "02",
        name: "Widen local services and specialist links",
        body: "We plan to expand connections with local living-support services, care providers, and specialist organizations step by step.",
      },
      {
        n: "03",
        name: "Family links and more personal guidance",
        body: "With the senior’s choice and consent, grow family conversation and information sharing, and make service browsing fit each person’s needs more closely.",
      },
      {
        n: "04",
        name: "A full senior living platform",
        body: "The aim is to grow into a platform that connects daily living, care, local activity, and living services.",
      },
    ],
  },
  close: {
    kicker: "ONGIL VISION",
    titleHtml: "A more comfortable day,<br>a steadier connection.",
    lead: "Ongil is widening the link between living and care so seniors can keep leading their own days, and families can be there when it matters.",
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
