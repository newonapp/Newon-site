/**
 * Life Stage detail-page copy. KO / EN are complete; other locales merge overlays onto EN.
 * First-moment / knowledge data files stay in the repo but are not shown on this intro page.
 */
import { LIFE_STAGE_I18N } from "./home-lifestage-i18n.mjs";

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
    back: "홈의 Life Stage 소개로",
    planned: "향후 이용 흐름",
    expandNote: "현재 운영 현황이 아니라 향후 사업 확장 계획입니다.",
    conceptNote: "현재는 사업 소개입니다. 예약·결제·가입은 아직 연결되지 않았습니다.",
    plannedFlag: "도입 계획",
    journeyNote: "연령대별 주제는 일반적인 예시입니다. 삶의 속도와 필요한 정보는 사람마다 다를 수 있습니다.",
    ongilNote: "돌봄과 생활지원이 필요한 경우, 향후 Ongil과 연결하는 방향을 검토합니다. 현재 두 서비스는 연동되어 있지 않습니다.",
  },
  hero: {
    kicker: "NEWON LIFE STAGE",
    brand: "LIFE STAGE",
    titleHtml: "삶의 모든 단계에,<br>필요한 다음을.",
    lead: "10대부터 70대까지. 삶의 변화와 새로운 시작을 함께하는 생애주기 플랫폼.",
    ctaMain: "Life Stage 살펴보기",
    ctaSub: "사업 문의",
    status: "현재는 사업 소개입니다.",
    pathLabel: "10대부터 70대까지",
  },
  why: {
    kicker: "Why Life Stage",
    title: "삶이 달라질 때마다,\n필요한 정보도 달라집니다.",
    body: [
      "진학과 진로를 고민하는 순간부터 독립과 첫 직장, 주거와 가족, 은퇴 이후의 새로운 일상까지.",
      "삶의 단계가 달라질 때마다 마주하는 선택과 필요한 정보도 달라집니다.",
      "Life Stage는 이러한 변화 속에서 자신의 상황에 맞는 정보와 서비스를 보다 쉽게 찾을 수 있도록 돕는 것을 목표로 합니다.",
    ],
  },
  journey: {
    kicker: "Life Journey",
    title: "10대부터 70대까지,\n이어지는 삶의 여정.",
    lead: "삶의 단계마다 달라지는 고민과 선택. Life Stage는 각자의 현재에 필요한 정보와 서비스를 연결합니다.",
    items: [
      {
        id: "10",
        n: "01",
        age: "10대",
        name: "가능성을 발견하는 시기",
        lead: "진로와 진학, 새로운 경험을 통해 자신의 방향을 탐색하는 시기.",
        topics: ["진로 탐색", "진학 정보", "학습과 자기계발", "자립 준비"],
      },
      {
        id: "20",
        n: "02",
        age: "20대",
        name: "나만의 삶을 시작하는 시기",
        lead: "독립과 첫 직장, 새로운 생활을 시작하며 자신만의 기반을 만들어가는 시기.",
        topics: ["독립과 주거", "첫 직장과 사회생활", "생활 금융", "자기계발"],
      },
      {
        id: "30",
        n: "03",
        age: "30대",
        name: "삶의 기반을 넓혀가는 시기",
        lead: "일과 생활의 균형을 고민하고 주거, 관계, 가족 등 다양한 삶의 선택을 마주하는 시기.",
        topics: ["직장과 경력", "주거와 자산관리", "관계와 가족", "건강과 생활관리"],
      },
      {
        id: "40",
        n: "04",
        age: "40대",
        name: "삶의 균형을 만들어가는 시기",
        lead: "일과 가족, 개인의 목표를 함께 살피며 앞으로의 삶을 준비하는 시기.",
        topics: ["경력과 일", "가족과 생활", "자산관리", "건강과 자기계발"],
      },
      {
        id: "50",
        n: "05",
        age: "50대",
        name: "새로운 가능성을 준비하는 시기",
        lead: "지금까지의 경험을 바탕으로 앞으로의 생활과 새로운 기회를 준비하는 시기.",
        topics: ["인생 전환", "은퇴 및 노후 준비", "건강관리", "새로운 배움과 활동"],
      },
      {
        id: "60",
        n: "06",
        age: "60대",
        name: "새로운 일상을 시작하는 시기",
        lead: "은퇴 이후의 생활을 설계하고 새로운 활동과 관계를 만들어가는 시기.",
        topics: ["은퇴 후 생활", "여가와 취미", "건강한 일상", "사회활동"],
      },
      {
        id: "70",
        n: "07",
        age: "70대",
        name: "나다운 일상을 이어가는 시기",
        lead: "자신의 생활 방식과 관심사에 맞춰 건강하고 활기찬 일상을 이어가는 시기.",
        topics: ["건강한 생활", "여가와 사회활동", "지역 생활 정보", "필요한 생활지원 탐색"],
      },
    ],
  },
  platform: {
    kicker: "Platform",
    title: "삶의 단계에 맞춰,\n필요한 것을 연결합니다.",
    lead: "연령별 생활 지식을 모아 둔 사이트가 아니라, 정보 탐색에서 서비스 연결까지 넓혀 가는 종합 생활 플랫폼입니다.",
    items: [
      {
        id: "info",
        n: "01",
        name: "생애주기별 정보 탐색",
        lead: "현재의 연령대와 생활 상황에 맞는 정보와 생활 주제를 탐색할 수 있는 경험을 목표로 합니다.",
      },
      {
        id: "guide",
        n: "02",
        name: "개인 맞춤형 안내",
        lead: "개인의 관심사와 생활 상황을 바탕으로 필요한 정보를 더 쉽게 찾을 수 있도록 맞춤형 안내 기능을 단계적으로 도입할 계획입니다.",
        planned: true,
      },
      {
        id: "services",
        n: "03",
        name: "생활 서비스 연결",
        lead: "주거, 금융, 교육, 건강, 여가 등 생활과 관련된 다양한 외부 서비스와 정보를 탐색하고 연결하는 방향으로 확장합니다.",
        planned: true,
      },
      {
        id: "experts",
        n: "04",
        name: "전문가 및 지역 서비스 탐색",
        lead: "필요한 상황에 따라 관련 전문가와 지역 기반 서비스를 찾을 수 있는 기능을 단계적으로 확대할 계획입니다.",
        planned: true,
      },
    ],
  },
  how: {
    kicker: "How it works",
    title: "지금의 나에게 필요한,\n다음 단계를 찾아보세요.",
    note: "아래는 서비스 구상과 향후 이용 흐름입니다. 현재 연결된 신청·예약 절차가 아닙니다.",
    steps: [
      {
        n: "01",
        name: "현재의 생활 단계 선택",
        body: "자신의 연령대와 현재 관심 있는 생활 주제를 선택합니다.",
      },
      {
        n: "02",
        name: "필요한 정보 탐색",
        body: "선택한 생활 단계와 관심사에 맞는 정보 및 관련 서비스를 확인합니다.",
      },
      {
        n: "03",
        name: "다음 단계로 연결",
        body: "필요한 정보를 바탕으로 관련 서비스와 활동, 전문가 등을 탐색하고 다음 선택을 준비하는 것을 목표로 합니다.",
      },
    ],
  },
  expand: {
    kicker: "Business expansion",
    title: "삶의 모든 단계로,\n연결의 범위를 넓혀갑니다.",
    note: "확정되지 않은 제휴, 매출, 이용자 수, 서비스 제공 지역은 표시하지 않습니다.",
    stages: [
      {
        n: "01",
        name: "생애주기별 정보 플랫폼 구축",
        body: "10대부터 70대까지 각 생애주기에 필요한 생활 정보와 주요 서비스를 탐색할 수 있는 기반을 구축합니다.",
      },
      {
        n: "02",
        name: "개인 맞춤형 서비스 고도화",
        body: "연령대뿐 아니라 개인의 관심사와 생활 상황을 반영하여 필요한 정보를 더 쉽게 찾을 수 있도록 맞춤형 안내 기능을 발전시킵니다.",
      },
      {
        n: "03",
        name: "생활 서비스 및 전문가 연결 확대",
        body: "주거, 금융, 교육, 건강, 여가 등 다양한 생활 분야의 서비스와 전문가, 지역 기반 서비스의 연결 범위를 단계적으로 확대할 예정입니다.",
      },
      {
        n: "04",
        name: "전 생애주기 종합 플랫폼으로 확장",
        body: "삶의 단계가 변화해도 계속 이용할 수 있는 종합 생활 플랫폼으로 발전시키는 것을 목표로 합니다.",
      },
    ],
  },
  close: {
    kicker: "LIFE STAGE VISION",
    titleHtml: "삶이 달라져도,<br>연결은 이어집니다.",
    lead: "Life Stage는 각자의 삶의 속도와 선택을 존중하며, 새로운 시작과 변화의 순간마다 필요한 정보와 서비스를 연결하는 플랫폼으로 성장해 나갑니다.",
    ctaMain: "사업 및 협업 문의",
    ctaSub: "Newon의 다른 사업 살펴보기",
  },
};

const EN = {
  ui: {
    back: "Back to Life Stage on the homepage",
    planned: "Planned journey",
    expandNote: "A future expansion plan, not a claim of current operations.",
    conceptNote: "This page is a business introduction. Booking, payment, and sign-up are not connected yet.",
    plannedFlag: "Planned",
    journeyNote: "The themes for each decade are typical examples. Pace and needs differ from person to person.",
    ongilNote: "When care or living support is needed, we may later connect with Ongil. The two services are not linked today.",
  },
  hero: {
    kicker: "NEWON LIFE STAGE",
    brand: "LIFE STAGE",
    titleHtml: "At every stage of life,<br>the next thing you need.",
    lead: "From the teens through the 70s. A life-stage platform for change and new beginnings.",
    ctaMain: "Explore Life Stage",
    ctaSub: "Business inquiry",
    status: "This page is a business introduction.",
    pathLabel: "Teens to 70s",
  },
  why: {
    kicker: "Why Life Stage",
    title: "When life changes,\nthe information you need changes too.",
    body: [
      "From school and career questions to living on your own, a first job, a home, family, and a new daily life after work.",
      "Each stage brings different choices, and different information.",
      "Life Stage aims to make it easier to find information and services that fit where you are.",
    ],
  },
  journey: {
    kicker: "Life Journey",
    title: "From the teens to the 70s,\none continuing journey.",
    lead: "Questions and choices shift with each stage. Life Stage connects the information and services that fit the present.",
    items: [
      {
        id: "10",
        n: "01",
        age: "Teens",
        name: "A time to find possibility",
        lead: "Exploring direction through path, school, and new experience.",
        topics: ["Career exploration", "School information", "Learning and growth", "Preparing to stand on your own"],
      },
      {
        id: "20",
        n: "02",
        age: "20s",
        name: "A time to begin a life of your own",
        lead: "Independence, a first job, and the start of a daily life you build yourself.",
        topics: ["Independence and housing", "First work and adult life", "Everyday money", "Self-development"],
      },
      {
        id: "30",
        n: "03",
        age: "30s",
        name: "A time to widen life’s base",
        lead: "Work and living in balance, and choices around home, relationships, and family.",
        topics: ["Work and career", "Housing and money", "Relationships and family", "Health and daily living"],
      },
      {
        id: "40",
        n: "04",
        age: "40s",
        name: "A time to find life’s balance",
        lead: "Work, family, and personal aims held together while looking ahead.",
        topics: ["Career and work", "Family and living", "Money management", "Health and growth"],
      },
      {
        id: "50",
        n: "05",
        age: "50s",
        name: "A time to prepare new possibility",
        lead: "Using what you have learned to prepare the next chapter of living and new chances.",
        topics: ["Life transitions", "Preparing for later years", "Health", "New learning and activity"],
      },
      {
        id: "60",
        n: "06",
        age: "60s",
        name: "A time to start a new daily life",
        lead: "Designing life after work, and forming new activities and relationships.",
        topics: ["Life after work", "Leisure and hobbies", "A healthy day", "Social activity"],
      },
      {
        id: "70",
        n: "07",
        age: "70s",
        name: "A time to keep living in your own way",
        lead: "Continuing a healthy, lively day that fits how you want to live.",
        topics: ["Healthy living", "Leisure and community", "Local living information", "Finding living support when needed"],
      },
    ],
  },
  platform: {
    kicker: "Platform",
    title: "Matched to the stage you are in,\nconnecting what you need.",
    lead: "Not a site that only collects tips by age, but a living platform that grows from finding information to connecting services.",
    items: [
      {
        id: "info",
        n: "01",
        name: "Browse by life stage",
        lead: "The aim is an experience for browsing information and living topics that fit age and situation.",
      },
      {
        id: "guide",
        n: "02",
        name: "Personal guidance",
        lead: "We plan to introduce tailored guidance step by step, so information that fits interests and living situation is easier to find.",
        planned: true,
      },
      {
        id: "services",
        n: "03",
        name: "Living-service connections",
        lead: "We will expand toward browsing and connecting outside services and information in housing, money, learning, health, and leisure.",
        planned: true,
      },
      {
        id: "experts",
        n: "04",
        name: "Experts and local services",
        lead: "We plan to widen, step by step, the ability to find relevant experts and local services when they are needed.",
        planned: true,
      },
    ],
  },
  how: {
    kicker: "How it works",
    title: "Find the next step\nthat fits you now.",
    note: "This is a planned journey, not a live apply-and-book flow.",
    steps: [
      {
        n: "01",
        name: "Choose your living stage",
        body: "Pick your age range and the living topics you care about now.",
      },
      {
        n: "02",
        name: "Browse what you need",
        body: "See information and related services that fit the stage and interests you chose.",
      },
      {
        n: "03",
        name: "Connect to the next step",
        body: "The aim is to browse related services, activities, and experts, and prepare the next choice.",
      },
    ],
  },
  expand: {
    kicker: "Business expansion",
    title: "Toward every stage of life,\na wider connection.",
    note: "Unconfirmed partners, revenue, user counts, and service areas are not shown.",
    stages: [
      {
        n: "01",
        name: "A life-stage information platform",
        body: "Build a base so people from the teens through the 70s can browse living information and key services for each stage.",
      },
      {
        n: "02",
        name: "More personal guidance",
        body: "Grow tailored guidance that reflects interests and living situation, not only age.",
      },
      {
        n: "03",
        name: "Wider living services and experts",
        body: "We plan to expand connections with services, experts, and local offers in housing, money, learning, health, and leisure.",
      },
      {
        n: "04",
        name: "A full life-stage platform",
        body: "The aim is a living platform people can keep using as their stage of life changes.",
      },
    ],
  },
  close: {
    kicker: "LIFE STAGE VISION",
    titleHtml: "Even as life changes,<br>the connection continues.",
    lead: "Life Stage respects each person’s pace and choices, and grows as a platform that connects the information and services needed at every new beginning and change.",
    ctaMain: "Business and partnership inquiry",
    ctaSub: "See Newon’s other businesses",
  },
};

export function getLifeStageCopy(lang) {
  if (lang === "ko") return KO;
  if (lang === "en") return EN;
  const over = LIFE_STAGE_I18N[lang];
  return over ? deepMerge(EN, over) : EN;
}

export { KO, EN };
