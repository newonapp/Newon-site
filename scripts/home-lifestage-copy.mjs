/**
 * LivOn detail-page copy. KO / EN are complete; other locales merge overlays onto EN.
 * First-moment / knowledge data files stay in the repo but are not shown on this intro page.
 */
import { LIFE_STAGE_I18N } from "./home-lifestage-i18n.mjs";
import { LIFE_STAGE_SCOPE_I18N } from "./home-lifestage-scope-i18n.mjs";

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
    back: "홈의 LivOn 소개로",
    planned: "향후 이용 흐름",
    expandNote: "현재 운영 현황이 아니라 향후 사업 확장 계획입니다.",
    conceptNote: "현재는 사업 소개입니다. 예약·결제·가입은 아직 연결되지 않았습니다.",
    plannedFlag: "도입 계획",
    journeyNote: "연령대별 주제는 일반적인 예시입니다. 삶의 속도와 필요한 정보는 사람마다 다를 수 있습니다.",
    ongilNote: "돌봄과 생활지원이 필요한 경우, 향후 Ongil과 연결하는 방향을 검토합니다. 현재 두 서비스는 연동되어 있지 않습니다.",
    areasNote: "아래 여섯 영역은 향후 사업 확장 계획입니다. 현재 운영 중인 기능처럼 보이지 않습니다.",
    relatedNote: "현재 다른 Newon 사업과 기술적으로 연동되거나 데이터가 자동 공유되지 않습니다. 아래는 향후 연결 방향입니다.",
    pillarsNote: "세 가지는 서로 다른 앱이나 브랜드가 아니라, 하나의 LivOn 플랫폼 안에서 넓혀 갈 사업 영역입니다.",
    firstNote: "아래 여덟 분야는 향후 사업 확장 계획입니다. 실제 이용 화면이나 신청 기능이 아닙니다.",
    changeNote: "인생의 변화는 향후 확장 계획입니다. 별도의 실행 화면이나 신청 기능이 아닙니다.",
  },
  hero: {
    kicker: "NEWON LivOn",
    brand: "LivOn",
    titleHtml: "삶의 모든 단계에,<br>필요한 다음을.",
    lead: "10대부터 70대까지. 생애 첫 경험과 인생의 변화까지 함께하는 생애주기 플랫폼.",
    ctaMain: "LivOn 살펴보기",
    ctaSub: "사업 문의",
    status: "현재는 사업 소개입니다.",
    pathLabel: "10대부터 70대까지",
  },
  why: {
    kicker: "Why LivOn",
    title: "삶이 달라질 때마다,\n필요한 정보도 달라집니다.",
    body: [
      "진학과 진로를 고민하는 순간부터 독립과 첫 직장, 주거와 가족, 은퇴 이후의 새로운 일상까지.",
      "삶의 단계가 달라질 때마다 마주하는 선택과 필요한 정보도 달라집니다.",
      "LivOn은 이러한 변화 속에서 자신의 상황에 맞는 정보와 서비스를 보다 쉽게 찾을 수 있도록 돕는 것을 목표로 합니다.",
    ],
  },
  journey: {
    kicker: "Life Journey",
    title: "10대부터 70대까지,\n이어지는 삶의 여정.",
    lead: "삶의 단계마다 달라지는 고민과 선택. LivOn은 각자의 현재에 필요한 정보와 서비스를 연결합니다.",
    items: [
      {
        id: "10",
        n: "01",
        age: "10대",
        name: "가능성을 발견하는 시기",
        lead: "진로와 진학, 새로운 경험을 통해 자신의 방향을 탐색하는 시기.",
        topics: ["진로 탐색", "입시·진학", "학습과 자기계발", "자격증", "금융 기초", "취미·동아리", "자립·사회 진출 준비"],
      },
      {
        id: "20",
        n: "02",
        age: "20대",
        name: "나만의 삶을 시작하는 시기",
        lead: "독립과 첫 직장, 새로운 생활을 시작하며 자신만의 기반을 만들어가는 시기.",
        topics: ["대학", "취업과 첫 직장", "자취·주거", "금융·자산관리", "자기계발", "연애·결혼 준비", "생활 서비스"],
      },
      {
        id: "30",
        n: "03",
        age: "30대",
        name: "삶의 기반을 넓혀가는 시기",
        lead: "일과 생활의 균형을 고민하고 주거, 관계, 가족 등 다양한 삶의 선택을 마주하는 시기.",
        topics: ["커리어 성장", "결혼·신혼", "주거 마련", "임신·출산·육아", "가계 관리", "보험·재무 설계", "가족 생활", "건강과 생활관리"],
      },
      {
        id: "40",
        n: "04",
        age: "40대",
        name: "삶의 균형을 만들어가는 시기",
        lead: "일과 가족, 개인의 목표를 함께 살피며 앞으로의 삶을 준비하는 시기.",
        topics: ["자녀 교육", "경력 관리·전환", "주택·자산관리", "건강검진", "부모 부양", "가족 여가", "노후 준비"],
      },
      {
        id: "50",
        n: "05",
        age: "50대",
        name: "새로운 가능성을 준비하는 시기",
        lead: "지금까지의 경험을 바탕으로 앞으로의 생활과 새로운 기회를 준비하는 시기.",
        topics: ["은퇴 설계", "재취업·제2의 직업", "연금·자산관리", "건강관리", "취미·여행", "자녀 독립", "부모 돌봄", "새로운 배움과 활동"],
      },
      {
        id: "60",
        n: "06",
        age: "60대",
        name: "새로운 일상을 시작하는 시기",
        lead: "은퇴 이후의 생활을 설계하고 새로운 활동과 관계를 만들어가는 시기.",
        topics: ["은퇴 후 생활", "재취업·사회활동", "건강·운동", "연금·복지", "여행·취미", "지역 모임", "디지털 생활 지원"],
      },
      {
        id: "70",
        n: "07",
        age: "70대",
        name: "나다운 일상을 이어가는 시기",
        lead: "자신의 생활 방식과 관심사에 맞춰 건강하고 활기찬 일상을 이어가는 시기.",
        topics: ["건강·안전", "생활 편의", "여가와 사회활동", "가족 소통", "주거 지원", "돌봄·복지 서비스 연결", "지역 생활 정보"],
      },
    ],
  },
  pillars: {
    kicker: "LivOn scope",
    title: "하나의 플랫폼에서,\n세 가지로 넓혀갑니다.",
    lead: "연령별 생애주기, 생애 첫 경험, 인생의 변화를 하나의 LivOn 안에서 연결합니다.",
    items: [
      {
        n: "01",
        name: "연령별 생애주기",
        lead: "10대부터 70대까지 각 생애 단계에 필요한 생활 정보와 서비스를 연결합니다.",
      },
      {
        n: "02",
        name: "생애 첫 경험",
        lead: "첫 성인, 첫 취업, 첫 경제활동, 첫 투자, 첫 독립, 첫 결혼, 첫 육아 등 인생에서 처음 경험하는 모든 순간을 지원합니다.",
        planned: true,
      },
      {
        n: "03",
        name: "인생의 변화",
        lead: "진학, 취업, 이직, 결혼, 출산, 육아, 은퇴 등 삶의 중요한 변화와 새로운 시작을 함께합니다.",
        planned: true,
      },
    ],
  },
  first: {
    kicker: "First experiences",
    title: "처음 마주하는 순간을,\n빠짐없이 연결합니다.",
    lead: "누구나 인생에서 처음 경험하는 순간에 필요한 정보와 생활 서비스를 연결하는 사업입니다. 연령에 관계없이 처음 경험하는 일을 지원하는 플랫폼으로 확장할 계획입니다.",
    items: [
      {
        n: "01",
        name: "첫 성인과 사회생활",
        lead: "성인이 되어 처음 마주하는 사회생활과 경제활동의 시작을 함께합니다.",
        topics: ["첫 성인", "첫 대학", "첫 아르바이트", "첫 근로계약", "첫 취업", "첫 직장", "첫 월급", "첫 퇴사·이직"],
      },
      {
        n: "02",
        name: "첫 경제와 금융",
        lead: "돈을 처음 벌고 관리하는 순간부터 저축과 투자, 자산 형성의 시작까지 연결합니다.",
        topics: ["첫 통장", "첫 체크카드", "첫 신용카드", "첫 저축", "첫 적금", "첫 투자", "첫 주식", "첫 대출", "첫 보험", "첫 세금 신고"],
      },
      {
        n: "03",
        name: "첫 독립과 주거",
        lead: "처음 집을 구하고 독립적인 생활을 시작하는 모든 과정을 함께합니다.",
        topics: ["첫 자취", "첫 독립", "첫 집 구하기", "첫 월세", "첫 전세", "첫 임대차계약", "첫 이사", "첫 자동차", "첫 주택 마련"],
      },
      {
        n: "04",
        name: "첫 연애와 가족",
        lead: "새로운 관계의 시작부터 결혼과 출산, 육아와 가족의 성장까지 함께합니다.",
        topics: ["첫 연애", "첫 동거", "첫 결혼", "첫 신혼집", "첫 임신", "첫 출산", "첫 육아", "첫 자녀 교육", "첫 반려동물"],
      },
      {
        n: "05",
        name: "첫 건강과 자기관리",
        lead: "건강한 생활을 처음 시작하는 순간부터 지속적인 자기관리까지 지원합니다.",
        topics: ["첫 운동", "첫 헬스장", "첫 러닝", "첫 건강검진", "첫 식단관리", "첫 병원 예약", "첫 심리상담"],
      },
      {
        n: "06",
        name: "첫 창업과 경제활동",
        lead: "새로운 경제활동과 사업을 시작하는 순간부터 성장의 과정까지 연결합니다.",
        topics: ["첫 부업", "첫 프리랜서", "첫 창업", "첫 사업자등록", "첫 매출", "첫 세금 신고", "첫 직원 채용", "첫 사업 확장"],
      },
      {
        n: "07",
        name: "첫 여행과 새로운 도전",
        lead: "처음 떠나는 여행부터 새로운 배움과 도전까지 다양한 경험의 시작을 함께합니다.",
        topics: ["첫 해외여행", "첫 여권", "첫 비행기", "첫 혼자 여행", "첫 유학", "첫 워킹홀리데이", "첫 취미", "첫 봉사활동"],
      },
      {
        n: "08",
        name: "첫 은퇴와 인생 2막",
        lead: "은퇴 이후 새로운 생활과 도전을 준비하고 인생의 다음 단계를 연결합니다.",
        topics: ["첫 은퇴", "첫 연금 수령", "첫 재취업", "첫 귀농·귀촌", "첫 시니어 교육", "첫 부모 돌봄", "첫 노후 생활 설계"],
      },
    ],
  },
  changes: {
    kicker: "Life changes",
    title: "중요한 변화의 순간마다,\n다음 생활을 잇습니다.",
    lead: "인생은 하나의 단계에 머무르지 않습니다. 새로운 시작과 중요한 변화의 순간마다 필요한 정보와 생활 서비스를 연결합니다.",
    items: [
      "진학과 새로운 배움",
      "취업과 이직",
      "독립과 주거 이동",
      "결혼과 가족 구성의 변화",
      "임신, 출산과 육아",
      "자녀의 성장과 교육",
      "건강과 생활 습관의 변화",
      "가족 돌봄과 부양",
      "은퇴와 새로운 사회활동",
      "새로운 지역과 생활환경으로의 이동",
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
        lead: "현재의 연령대와 생활 상황에 맞는 정보와 생활 주제를 탐색합니다.",
        topics: ["단계별 생활 정보", "주요 생활 절차", "제도·지원 정보"],
      },
      {
        id: "guide",
        n: "02",
        name: "개인 맞춤형 안내",
        lead: "관심사와 생활 상황에 맞는 정보를 더 쉽게 찾도록 맞춤 안내를 단계적으로 도입할 계획입니다.",
        planned: true,
        topics: ["관심사 반영", "상황별 안내", "다음 단계 추천"],
      },
      {
        id: "services",
        n: "03",
        name: "생활 서비스 연결",
        lead: "주거, 금융, 교육, 건강, 여가 등 외부 서비스와 정보를 탐색·연결하는 방향으로 확장합니다.",
        planned: true,
        topics: ["주거", "금융", "교육", "건강", "여가"],
      },
      {
        id: "experts",
        n: "04",
        name: "전문가 및 지역 서비스 탐색",
        lead: "필요한 상황에 따라 관련 전문가와 지역 기반 서비스를 찾는 기능을 단계적으로 확대할 계획입니다.",
        planned: true,
        topics: ["전문가 연결", "지역 서비스", "기관 정보"],
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
  areas: {
    kicker: "Business areas",
    title: "정보에서 연결까지,\n여섯 가지 확장 영역.",
    lead: "생활 정보에서 이벤트 관리, 전문가 연결, 커머스, 커뮤니티, AI까지 넓혀 가는 방향입니다.",
    items: [
      {
        n: "01",
        name: "생활 정보 및 가이드",
        lead: "생애 단계별 생활 정보와 주요 절차, 관련 제도·지원 정보를 안내합니다.",
        planned: true,
        topics: ["단계별 생활 정보", "주요 생활 절차", "맞춤형 가이드", "제도·지원 정보"],
      },
      {
        n: "02",
        name: "라이프 이벤트 관리",
        lead: "진학, 취업, 이사, 결혼, 출산, 육아, 은퇴처럼 주요 인생 이벤트의 준비 과정을 관리합니다.",
        planned: true,
        topics: ["진학", "취업", "이사", "결혼", "출산·육아", "은퇴"],
      },
      {
        n: "03",
        name: "전문가 및 생활 서비스 연결",
        lead: "교육, 주거, 재무, 가족, 건강, 생활 분야의 전문가와 관련 서비스를 연결합니다.",
        planned: true,
        topics: ["교육", "주거", "재무", "가족", "건강", "생활 서비스"],
      },
      {
        n: "04",
        name: "라이프 커머스",
        lead: "생애 단계에 필요한 상품과 서비스를 탐색·비교하고, 구매·예약으로 연결합니다.",
        planned: true,
        topics: ["상품 탐색", "서비스 비교", "추천", "구매·예약 연결"],
      },
      {
        n: "05",
        name: "커뮤니티",
        lead: "비슷한 생애 단계와 관심사를 가진 이용자가 경험과 지역 모임을 나눌 수 있는 공간입니다.",
        planned: true,
        topics: ["정보 공유", "경험 교류", "지역 모임", "관심사 커뮤니티"],
      },
      {
        n: "06",
        name: "맞춤형 AI",
        lead: "개인의 생애 단계와 생활 상황에 맞는 정보 탐색, 생활 계획, 서비스 안내를 돕습니다.",
        planned: true,
        topics: ["상황별 정보 탐색", "생활 계획", "서비스 안내"],
      },
    ],
  },
  related: {
    kicker: "NEWON",
    title: "Newon 안에서\nLivOn이 맡는 자리.",
    lead: "LivOn은 Newon 여섯 사업 가운데 생애주기 플랫폼입니다. 다른 사업의 기능을 직접 대신하지 않습니다.",
    items: [
      { n: "01", name: "Newon Consumer", body: "생애 단계별 필요한 생활 앱과 서비스 연결.", planned: true },
      { n: "02", name: "Newon AI", body: "개인 상황에 맞는 AI 기반 생활 지원.", planned: true },
      { n: "03", name: "Ongil", body: "시니어 생활·돌봄 서비스와 가족 연결.", planned: true },
      { n: "04", name: "Newon Business", body: "전문가, 기업 및 생활 서비스 제공자와의 사업적 연결.", planned: true },
      { n: "05", name: "Newon Commerce", body: "생애 단계별 상품과 생활 서비스의 탐색 및 구매 연결.", planned: true },
    ],
  },
  close: {
    kicker: "LivOn VISION",
    titleHtml: "삶이 달라져도,<br>연결은 이어집니다.",
    lead: "LivOn은 각자의 삶의 속도와 선택을 존중하며, 새로운 시작과 변화의 순간마다 필요한 정보와 서비스를 연결하는 플랫폼으로 성장해 나갑니다.",
    ctaMain: "사업 및 협업 문의",
    ctaSub: "Newon의 다른 사업 살펴보기",
  },
};

const EN = {
  ui: {
    back: "Back to LivOn on the homepage",
    planned: "Planned journey",
    expandNote: "A future expansion plan, not a claim of current operations.",
    conceptNote: "This page is a business introduction. Booking, payment, and sign-up are not connected yet.",
    plannedFlag: "Planned",
    journeyNote: "The themes for each decade are typical examples. Pace and needs differ from person to person.",
    ongilNote: "When care or living support is needed, we may later connect with Ongil. The two services are not linked today.",
    areasNote: "The six areas below are a later expansion plan, not live products.",
    relatedNote: "LivOn is not technically linked to other Newon businesses today, and data is not shared automatically. The links below are later directions.",
    pillarsNote: "These three are not separate apps or brands. They are expansion areas inside one LivOn platform.",
    firstNote: "The eight fields below are a later expansion plan, not a live product or apply flow.",
    changeNote: "Life changes are a later expansion plan, not a separate tool or application screen.",
  },
  hero: {
    kicker: "NEWON LivOn",
    brand: "LivOn",
    titleHtml: "At every stage of life,<br>the next thing you need.",
    lead: "From the teens through the 70s. A life-stage platform for first experiences, life changes, and new beginnings.",
    ctaMain: "Explore LivOn",
    ctaSub: "Business inquiry",
    status: "This page is a business introduction.",
    pathLabel: "Teens to 70s",
  },
  why: {
    kicker: "Why LivOn",
    title: "When life changes,\nthe information you need changes too.",
    body: [
      "From school and career questions to living on your own, a first job, a home, family, and a new daily life after work.",
      "Each stage brings different choices, and different information.",
      "LivOn aims to make it easier to find information and services that fit where you are.",
    ],
  },
  journey: {
    kicker: "Life Journey",
    title: "From the teens to the 70s,\none continuing journey.",
    lead: "Questions and choices shift with each stage. LivOn connects the information and services that fit the present.",
    items: [
      {
        id: "10",
        n: "01",
        age: "Teens",
        name: "A time to find possibility",
        lead: "Exploring direction through path, school, and new experience.",
        topics: ["Career exploration", "Exams and school", "Learning and growth", "Qualifications", "Money basics", "Hobbies and clubs", "Preparing to enter society"],
      },
      {
        id: "20",
        n: "02",
        age: "20s",
        name: "A time to begin a life of your own",
        lead: "Independence, a first job, and the start of a daily life you build yourself.",
        topics: ["University", "Job search and first work", "Living alone and housing", "Money and assets", "Self-development", "Relationships and marriage prep", "Living services"],
      },
      {
        id: "30",
        n: "03",
        age: "30s",
        name: "A time to widen life’s base",
        lead: "Work and living in balance, and choices around home, relationships, and family.",
        topics: ["Career growth", "Marriage and newlywed life", "Finding a home", "Pregnancy, birth, and parenting", "Household money", "Insurance and financial planning", "Family living", "Health and daily living"],
      },
      {
        id: "40",
        n: "04",
        age: "40s",
        name: "A time to find life’s balance",
        lead: "Work, family, and personal aims held together while looking ahead.",
        topics: ["Children’s education", "Career management and change", "Housing and assets", "Health checkups", "Supporting parents", "Family leisure", "Preparing for later years"],
      },
      {
        id: "50",
        n: "05",
        age: "50s",
        name: "A time to prepare new possibility",
        lead: "Using what you have learned to prepare the next chapter of living and new chances.",
        topics: ["Retirement planning", "Second careers", "Pensions and assets", "Health", "Hobbies and travel", "Children becoming independent", "Parent care", "New learning and activity"],
      },
      {
        id: "60",
        n: "06",
        age: "60s",
        name: "A time to start a new daily life",
        lead: "Designing life after work, and forming new activities and relationships.",
        topics: ["Life after work", "Work and community again", "Health and activity", "Pensions and welfare", "Travel and hobbies", "Local groups", "Digital living support"],
      },
      {
        id: "70",
        n: "07",
        age: "70s",
        name: "A time to keep living in your own way",
        lead: "Continuing a healthy, lively day that fits how you want to live.",
        topics: ["Health and safety", "Everyday convenience", "Leisure and community", "Family connection", "Housing support", "Care and welfare links", "Local living information"],
      },
    ],
  },
  pillars: {
    kicker: "LivOn scope",
    title: "One platform,\nthree directions to grow.",
    lead: "Age-based life stages, first experiences, and life changes — connected inside one LivOn.",
    items: [
      {
        n: "01",
        name: "Life stages by age",
        lead: "From the teens through the 70s, we connect living information and services for each chapter.",
      },
      {
        n: "02",
        name: "First experiences",
        lead: "First adulthood, first job, first money, first investing, first independence, first marriage, first parenting — every first in life.",
        planned: true,
      },
      {
        n: "03",
        name: "Life changes",
        lead: "School, work, job change, marriage, birth, parenting, retirement — the important turns and new starts.",
        planned: true,
      },
    ],
  },
  first: {
    kicker: "First experiences",
    title: "Every first moment,\nconnected.",
    lead: "A business that connects the information and living services people need the first time they face a new moment. We plan to grow this as a platform for firsts at any age.",
    items: [
      {
        n: "01",
        name: "First adulthood and work life",
        lead: "We walk with the first steps of adult social and working life.",
        topics: ["First adulthood", "First university", "First part-time job", "First work contract", "First hire", "First workplace", "First paycheck", "First resignation and job change"],
      },
      {
        n: "02",
        name: "First money and finance",
        lead: "From earning and managing money for the first time to saving, investing, and the start of building assets.",
        topics: ["First bank account", "First debit card", "First credit card", "First saving", "First installment saving", "First investment", "First stocks", "First loan", "First insurance", "First tax filing"],
      },
      {
        n: "03",
        name: "First independence and housing",
        lead: "We walk through finding a first home and starting an independent life.",
        topics: ["First living alone", "First independence", "First home search", "First monthly rent", "First jeonse", "First lease", "First move", "First car", "First home purchase"],
      },
      {
        n: "04",
        name: "First relationships and family",
        lead: "From a new relationship to marriage, birth, parenting, and a growing family.",
        topics: ["First relationship", "First living together", "First marriage", "First newlywed home", "First pregnancy", "First birth", "First parenting", "First child’s education", "First pet"],
      },
      {
        n: "05",
        name: "First health and self-care",
        lead: "From starting a healthier life to keeping up self-care over time.",
        topics: ["First exercise", "First gym", "First run", "First health checkup", "First meal plan", "First clinic booking", "First counseling"],
      },
      {
        n: "06",
        name: "First business and economic activity",
        lead: "From starting a new economic activity or business to the path of growth.",
        topics: ["First side job", "First freelance work", "First founding", "First business registration", "First revenue", "First tax filing", "First hire", "First business expansion"],
      },
      {
        n: "07",
        name: "First travel and new challenges",
        lead: "From a first trip to new learning and challenges — the start of many kinds of experience.",
        topics: ["First trip abroad", "First passport", "First flight", "First solo trip", "First study abroad", "First working holiday", "First hobby", "First volunteering"],
      },
      {
        n: "08",
        name: "First retirement and a second chapter",
        lead: "We help prepare a new life after work and connect the next chapter.",
        topics: ["First retirement", "First pension payment", "First return to work", "First rural move", "First senior learning", "First parent care", "First later-life plan"],
      },
    ],
  },
  changes: {
    kicker: "Life changes",
    title: "At every important turn,\nthe next chapter continues.",
    lead: "Life does not stay in one stage. At every new start and important change, we connect the information and living services that are needed.",
    items: [
      "School and new learning",
      "Work and job change",
      "Independence and moving home",
      "Marriage and family change",
      "Pregnancy, birth, and parenting",
      "Children growing and education",
      "Health and living-habit change",
      "Family care and support",
      "Retirement and new community life",
      "Moving to a new place and living environment",
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
        lead: "Browse information and living topics that fit age and situation.",
        topics: ["Living information by stage", "Key life procedures", "Support and policy notes"],
      },
      {
        id: "guide",
        n: "02",
        name: "Personal guidance",
        lead: "We plan to introduce tailored guidance so information that fits interests and situation is easier to find.",
        planned: true,
        topics: ["Interests", "Situation-based guidance", "Next-step suggestions"],
      },
      {
        id: "services",
        n: "03",
        name: "Living-service connections",
        lead: "We will expand toward browsing and connecting services in housing, money, learning, health, and leisure.",
        planned: true,
        topics: ["Housing", "Money", "Learning", "Health", "Leisure"],
      },
      {
        id: "experts",
        n: "04",
        name: "Experts and local services",
        lead: "We plan to widen the ability to find relevant experts and local services when they are needed.",
        planned: true,
        topics: ["Expert links", "Local services", "Organization information"],
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
  areas: {
    kicker: "Business areas",
    title: "From information to connection,\nsix expansion areas.",
    lead: "The direction is to grow from living information to event planning, experts, commerce, community, and AI.",
    items: [
      {
        n: "01",
        name: "Living information and guides",
        lead: "Living information, key procedures, and related support notes by life stage.",
        planned: true,
        topics: ["Information by stage", "Key procedures", "Tailored guides", "Support and policy"],
      },
      {
        n: "02",
        name: "Life-event management",
        lead: "Help manage the prep for school, work, moving, marriage, birth, parenting, and retirement.",
        planned: true,
        topics: ["School", "Work", "Moving", "Marriage", "Birth and parenting", "Retirement"],
      },
      {
        n: "03",
        name: "Experts and living services",
        lead: "Connect experts and services in learning, housing, money, family, health, and daily living.",
        planned: true,
        topics: ["Learning", "Housing", "Money", "Family", "Health", "Living services"],
      },
      {
        n: "04",
        name: "Life commerce",
        lead: "Browse and compare goods and services for each stage, then connect to buy or book.",
        planned: true,
        topics: ["Browse goods", "Compare services", "Recommendations", "Buy and book links"],
      },
      {
        n: "05",
        name: "Community",
        lead: "A place for people in similar stages and interests to share experience and local groups.",
        planned: true,
        topics: ["Sharing notes", "Experience", "Local groups", "Interest communities"],
      },
      {
        n: "06",
        name: "Personal AI",
        lead: "Help find information, plan living, and point to services that fit the person’s stage and situation.",
        planned: true,
        topics: ["Situation search", "Living plans", "Service guidance"],
      },
    ],
  },
  related: {
    kicker: "NEWON",
    title: "LivOn’s place\ninside Newon.",
    lead: "LivOn is the life-cycle platform among Newon’s six businesses. It does not replace the others.",
    items: [
      { n: "01", name: "Newon Consumer", body: "Connect living apps and services that fit each life stage.", planned: true },
      { n: "02", name: "Newon AI", body: "AI living support that fits the person’s situation.", planned: true },
      { n: "03", name: "Ongil", body: "Senior living and care, and family connection.", planned: true },
      { n: "04", name: "Newon Business", body: "Business links with experts, companies, and living-service providers.", planned: true },
      { n: "05", name: "Newon Commerce", body: "Browse and buy goods and living services by life stage.", planned: true },
    ],
  },
  close: {
    kicker: "LivOn VISION",
    titleHtml: "Even as life changes,<br>the connection continues.",
    lead: "LivOn respects each person’s pace and choices, and grows as a platform that connects the information and services needed at every new beginning and change.",
    ctaMain: "Business and partnership inquiry",
    ctaSub: "See Newon’s other businesses",
  },
};

export function getLifeStageCopy(lang) {
  if (lang === "ko") return KO;
  if (lang === "en") return EN;
  const over = LIFE_STAGE_I18N[lang];
  const scope = LIFE_STAGE_SCOPE_I18N[lang];
  let out = over ? deepMerge(EN, over) : { ...EN };
  if (scope) out = deepMerge(out, scope);
  return out;
}

export { KO, EN };
