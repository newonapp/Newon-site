/**
 * Newon — six representative businesses (information-only website).
 *
 *   BabyLog · PetLog · My World · ShareOn · LivOn · Ongil
 *
 * Principle (Oct 2026): the website only introduces the business, explains features, points to app
 * download / launch status, takes partnership and general inquiries and posts notices. The real
 * service (login, records, search, booking, trading, payment, seller tools, community) lives in each app.
 * No new web service feature may be added here.
 *
 * Used by: site-chrome.mjs / venture-studio-data.mjs (top-level menus), render-business-intro.mjs
 * (BabyLog / PetLog / My World / ShareOn pages), render-lifestage.mjs + render-ongil.mjs (LivOn / Ongil
 * keep their editorial pages and get the shared "partners" + "download" blocks).
 *
 * Copy exists in Korean and English; other locales reuse the English body (like the rest of Studio).
 */

/** Top-level menu ids for the six businesses, in menu order. */
export const SIX_IDS = ["ongil", "lifestage", "shareon", "babylog", "petlog", "myworld"];

/** Businesses whose intro page is rendered by render-business-intro.mjs. */
export const NEW_INTRO_IDS = ["babylog", "petlog", "myworld", "shareon"];

/** Nav id → URL slug under /{lang}/. */
export const SLUG = {
  babylog: "babylog",
  petlog: "petlog",
  myworld: "myworld",
  shareon: "shareon",
  lifestage: "lifestage",
  ongil: "ongil",
};

/**
 * Per business facts. `launch`:
 *   "stores"     – released in the App Store / Google Play (links below)
 *   "coming"     – app is being prepared; no store link may be shown
 * `webStart` (LivOn / Ongil only): the existing web experience stays online as a transition until the
 * app is released AND the migration is verified (see docs/web-closure/). Allowed values:
 *   "transition" – keep the 시작하기 entry (current state)
 *   "app-download" – replace it with the app download guide (after app release + verification)
 *   "removed"    – remove the entry (after the web UI is retired)
 */
export const BUSINESS = {
  babylog: {
    name: "BabyLog",
    accent: "#E8628E",
    launch: "stores",
    stores: {
      appStore: "https://apps.apple.com/kr/app/babylog-%EC%8A%A4%EB%A7%88%ED%8A%B8%ED%95%9C-ai-%EC%9C%A1%EC%95%84-%EA%B8%B0%EB%A1%9D/id6768019196",
      googlePlay: "https://play.google.com/store/apps/details?id=com.newon.babylog&pcampaignid=web_share",
    },
  },
  petlog: {
    name: "PetLog",
    accent: "#278A53",
    launch: "stores",
    stores: {
      appStore: "https://apps.apple.com/kr/app/petlog-%EC%8A%A4%EB%A7%88%ED%8A%B8%ED%95%9C-ai-%EB%B0%98%EB%A0%A4-%EA%B8%B0%EB%A1%9D/id6770971033",
      googlePlay: "https://play.google.com/store/apps/details?id=com.newon.petlog&pcampaignid=web_share",
    },
  },
  myworld: {
    name: "My World",
    accent: "#1769FF",
    launch: "stores",
    stores: {
      appStore: "https://apps.apple.com/kr/app/my-world-%EC%97%AC%ED%96%89%EC%A7%80%EB%8F%84-%EB%B0%A9%EB%AC%B8%EA%B5%AD%EA%B0%80/id6792314945",
      googlePlay: "https://play.google.com/store/apps/details?id=com.newon.myworld&pcampaignid=web_share",
    },
  },
  shareon: {
    name: "ShareOn",
    accent: "#7771E8",
    launch: "coming",
    stores: null,
  },
  lifestage: {
    name: "LivOn",
    accent: "#F6D76B",
    launch: "coming",
    stores: null,
    webStart: "removed", // owner 2026-10-26: no web preview is promoted; app launch in preparation
    webStartHref: "/livon/",
  },
  ongil: {
    name: "Ongil",
    accent: "#E99465",
    launch: "coming",
    stores: null,
    webStart: "removed", // owner 2026-10-26: no web preview is promoted; app launch in preparation
    webStartHref: "/ongil-start/",
  },
};

export function isTransitional(id) {
  return BUSINESS[id]?.webStart === "transition";
}

const INQUIRY = "business/inquiry/?category=Partnership#inquiry";
export const PARTNER_INQUIRY_PATH = INQUIRY;

/** Labels shared by every business page (nav rows, section labels, buttons). */
export const COMMON = {
  ko: {
    crumbHome: "Newon",
    sections: {
      intro: "사업 소개",
      problem: "해결하는 문제",
      features: "주요 기능",
      audience: "이용 대상",
      partners: "기업·판매자·기관 제휴",
      download: "앱 다운로드·출시 안내",
      contact: "문의",
    },
    statusStores: "iOS · Android 앱 출시",
    statusComing: "출시 준비 중",
    toDownload: "앱 다운로드 안내 →",
    toPartners: "제휴 안내 보기",
    appStore: "App Store",
    googlePlay: "Google Play",
    infoOnlyTitle: "이 웹사이트는 소개와 안내만 제공합니다",
    infoOnlyBody:
      "로그인, 기록 관리, 검색·이용, 예약, 거래, 결제, 판매자 관리, 커뮤니티 같은 실제 서비스 기능은 웹사이트에서 제공하지 않으며, 각 앱에서 이용합니다.",
    comingTitle: "앱 출시를 준비하고 있습니다",
    comingBody: "출시 일정과 이용 방법은 확정되는 대로 공지에 안내합니다. 웹사이트에서는 서비스 기능을 제공하지 않습니다.",
    newsLink: "공지 보기 →",
    contactLabel: "문의",
    contactTitle: "제휴·도입 문의를 받습니다",
    contactLead: "기업·판매자·기관과의 제휴, 도입, 협업 문의는 아래 문의 페이지로 보내 주세요. 조건은 문의 후 개별 협의합니다.",
    contactBtn: "제휴·도입 문의하기",
    partnersNote: "아직 확정되지 않은 기업·기관명이나 로고는 게시하지 않습니다. 제휴 범위와 조건은 문의 후 개별 협의합니다.",
    nav: {
      intro: "사업 소개",
      introDesc: "해결하는 문제와 이용 대상",
      features: "주요 기능",
      featuresDesc: "앱에서 이용하는 기능 설명",
      partners: "제휴 안내",
      partnersDesc: "기업·판매자·기관 제휴",
      download: "앱 다운로드 안내",
      downloadDesc: "다운로드 또는 출시 안내",
      comingDownload: "앱 출시 안내",
      comingDownloadDesc: "출시 준비 중 · 공지로 안내",
      webPreview: "웹 체험 (시작하기)",
      webPreviewDesc: "앱 출시 전까지 임시 제공",
    },
  },
  en: {
    crumbHome: "Newon",
    sections: {
      intro: "Overview",
      problem: "The problem we solve",
      features: "Key features",
      audience: "Who it is for",
      partners: "Business, seller & institution partnerships",
      download: "App download & launch",
      contact: "Contact",
    },
    statusStores: "Available on iOS · Android",
    statusComing: "Coming soon",
    toDownload: "App download info →",
    toPartners: "Partnership info",
    appStore: "App Store",
    googlePlay: "Google Play",
    infoOnlyTitle: "This website is for information only",
    infoOnlyBody:
      "Service features such as sign-in, record keeping, search and use, booking, trading, payment, seller tools and community are not provided on the website. You use them in each app.",
    comingTitle: "The app is being prepared",
    comingBody: "We will post the launch schedule and how to use it in the news section once confirmed. The website does not provide service features.",
    newsLink: "View news →",
    contactLabel: "CONTACT",
    contactTitle: "Partnership and adoption inquiries are welcome",
    contactLead: "Send partnership, adoption and collaboration inquiries from businesses, sellers and institutions through the contact page. Terms are agreed individually after an inquiry.",
    contactBtn: "Send an inquiry",
    partnersNote: "We do not publish organization names or logos that are not confirmed. Scope and terms are agreed individually after an inquiry.",
    nav: {
      intro: "Overview",
      introDesc: "The problem and who it is for",
      features: "Key features",
      featuresDesc: "What the app offers",
      partners: "Partnerships",
      partnersDesc: "Businesses, sellers and institutions",
      download: "App download",
      downloadDesc: "Download or launch info",
      comingDownload: "App launch info",
      comingDownloadDesc: "Coming soon · announced in News",
      webPreview: "Web preview (Start)",
      webPreviewDesc: "Temporary until the app launches",
    },
  },
};

/** Per business page copy for BabyLog / PetLog / My World / ShareOn (cards are [title, lead]). */
export const PAGES = {
  babylog: {
    ko: {
      title: "BabyLog | Newon — 아이의 성장 순간을 가족과 함께 기록하는 육아 기록 앱",
      desc: "BabyLog 사업 소개. 육아 기록, 성장·건강 기록, 가족 공유를 앱에서 이용합니다. 이 웹사이트는 소개, 앱 다운로드 안내, 제휴·문의만 제공합니다.",
      h1: "아이의 성장 순간을,<br />가족과 함께 기록합니다.",
      lead: "BabyLog는 임신부터 청소년기까지 아이의 일상과 성장을 한곳에 기록하고 가족과 나누는 육아 기록 앱입니다.",
      intro: {
        lead: "하루의 작은 기록이 쌓여 아이의 성장 이야기가 됩니다. 기록, 성장, 가족 공유를 하나의 앱에서 이어갑니다.",
        cards: [
          ["기록", "수유·수면·배변·식사·놀이처럼 매일 반복되는 순간을 간편하게 남깁니다."],
          ["성장", "키·몸무게와 예방접종 같은 건강 이력을 시간 순서로 모아 봅니다."],
          ["가족", "보호자와 가족이 같은 기록을 함께 확인하고 이어갑니다."],
        ],
      },
      problem: {
        lead: "육아 기록이 흩어지면 아이의 변화를 놓치기 쉽습니다.",
        cards: [
          ["흩어진 기록", "수유·수면 메모, 사진, 병원 일정이 여러 앱과 메모장에 나뉘어 있습니다."],
          ["가족마다 다른 정보", "보호자가 여럿이면 같은 아이에 대해 서로 다른 정보를 알게 됩니다."],
          ["지나가는 시간", "빠르게 크는 시기의 변화를 나중에 되돌아보기 어렵습니다."],
        ],
      },
      features: {
        lead: "아래 기능은 BabyLog 앱에서 이용합니다. 웹사이트에서는 제공하지 않습니다.",
        cards: [
          ["육아 기록", "수유, 수면, 배변, 식사, 놀이, 감정 상태를 간편하게 기록합니다."],
          ["아이 프로필", "성장 단계, 건강 정보, 기본 일정을 아이별로 관리합니다."],
          ["성장·건강 기록", "키, 몸무게, 예방접종과 건강 이력을 기록합니다."],
          ["일정 관리", "병원 방문, 예방접종, 학교·학원 행사와 가족 일정을 모아 봅니다."],
          ["성장 통계", "성장 추이와 생활 패턴을 그래프로 확인합니다."],
          ["가족 공유와 AI 분석", "가족과 기록을 나누고, 패턴을 참고용으로 정리해 줍니다. 의료 진단이 아닙니다."],
        ],
      },
      audience: {
        lead: "아이의 성장을 꾸준히 기록하고 싶은 분들을 위한 앱입니다.",
        cards: [
          ["부모·보호자", "아이의 하루와 성장을 한곳에 정리하고 싶은 분."],
          ["가족 돌봄 참여자", "조부모, 배우자 등 함께 돌보며 기록을 나누고 싶은 분."],
          ["예비 부모", "임신 시기부터 기록을 시작하고 싶은 분."],
        ],
      },
      partners: {
        lead: "육아 생태계를 함께 만들 기업·판매자·기관의 제휴 문의를 받습니다.",
        cards: [
          ["육아용품·브랜드 판매자", "육아·출산 용품을 판매하거나 소개하려는 개인·사업자·브랜드와의 협업."],
          ["육아·교육·생활 서비스 사업자", "아이와 가족을 위한 서비스를 운영하는 사업자와의 정보 연계 협업."],
          ["지자체·공공·육아 지원 기관", "육아 지원 정보 안내를 함께 만드는 기관과의 협력."],
        ],
      },
      download: {
        lead: "BabyLog는 iOS와 Android 앱으로 이용합니다.",
      },
    },
    en: {
      title: "BabyLog | Newon — A baby-care log app to record your child's growth with family",
      desc: "BabyLog business overview. Use baby-care records, growth and health logs and family sharing in the app. This website only provides information, app download guidance, partnerships and inquiries.",
      h1: "Record your child's growth<br />together with your family.",
      lead: "BabyLog is a baby-care log app that keeps a child's daily life and growth from pregnancy to the teen years in one place and shares it with family.",
      intro: {
        lead: "Small daily records add up to a child's growth story. Records, growth and family sharing in one app.",
        cards: [
          ["Record", "Easily log everyday moments such as feeding, sleep, diapers, meals and play."],
          ["Growth", "Keep height, weight and health history such as vaccinations in one timeline."],
          ["Family", "Parents and family members see and continue the same records together."],
        ],
      },
      problem: {
        lead: "When baby-care records are scattered, it is easy to miss how a child changes.",
        cards: [
          ["Scattered records", "Feeding and sleep notes, photos and clinic visits live in different apps and notes."],
          ["Different information per person", "With several caregivers, everyone knows something different about the same child."],
          ["Time moves fast", "Changes in the fastest-growing years are hard to look back on later."],
        ],
      },
      features: {
        lead: "The features below are used in the BabyLog app. They are not provided on the website.",
        cards: [
          ["Baby-care log", "Log feeding, sleep, diapers, meals, play and mood with a few taps."],
          ["Child profile", "Manage growth stage, health information and basic schedule per child."],
          ["Growth and health records", "Record height, weight, vaccinations and health history."],
          ["Schedule", "See clinic visits, vaccinations, school events and family plans together."],
          ["Growth statistics", "See growth trends and daily patterns in charts."],
          ["Family sharing and AI insights", "Share records with family and get patterns summarized for reference. Not a medical diagnosis."],
        ],
      },
      audience: {
        lead: "For people who want to keep recording a child's growth.",
        cards: [
          ["Parents and guardians", "Anyone who wants a child's days and growth organized in one place."],
          ["Family caregivers", "Grandparents, partners and others who share the care and the records."],
          ["Expecting parents", "Those who want to start recording during pregnancy."],
        ],
      },
      partners: {
        lead: "We welcome partnership inquiries from businesses, sellers and institutions that want to build the parenting ecosystem together.",
        cards: [
          ["Baby product sellers and brands", "Collaboration with individuals, businesses and brands that sell or introduce baby and maternity products."],
          ["Parenting, education and lifestyle services", "Information-linking collaboration with businesses that run services for children and families."],
          ["Local government, public and parenting support bodies", "Cooperation with institutions that help provide parenting support information."],
        ],
      },
      download: {
        lead: "BabyLog is used as an iOS and Android app.",
      },
    },
  },

  petlog: {
    ko: {
      title: "PetLog | Newon — 반려동물의 하루와 건강을 기록하는 반려 기록 앱",
      desc: "PetLog 사업 소개. 반려동물 기록, 건강 관리, 가족 공유를 앱에서 이용합니다. 이 웹사이트는 소개, 앱 다운로드 안내, 제휴·문의만 제공합니다.",
      h1: "반려동물의 하루와 건강을,<br />한곳에서 기록합니다.",
      lead: "PetLog는 반려동물의 일상, 건강, 추억을 기록하고 가족과 함께 돌보는 반려 기록 앱입니다.",
      intro: {
        lead: "식사와 산책부터 병원 기록까지, 우리 아이의 하루가 한 권의 기록이 됩니다.",
        cards: [
          ["일상", "식사, 산책, 활동량을 반려동물별로 기록합니다."],
          ["건강", "예방접종, 병원 방문, 복약과 체중 변화를 이력으로 남깁니다."],
          ["가족", "같이 돌보는 가족이 같은 기록과 일정을 확인합니다."],
        ],
      },
      problem: {
        lead: "반려동물의 건강 기록이 흩어지면 작은 변화를 놓치기 쉽습니다.",
        cards: [
          ["흩어진 건강 이력", "접종 날짜, 병원 기록, 복약 정보가 여러 곳에 나뉘어 있습니다."],
          ["뒤늦게 알게 되는 변화", "체중과 활동량의 변화를 눈에 보이는 기록으로 보기 어렵습니다."],
          ["함께 돌볼 때의 혼선", "가족마다 먹이고 산책한 기록을 따로 기억합니다."],
        ],
      },
      features: {
        lead: "아래 기능은 PetLog 앱에서 이용합니다. 웹사이트에서는 제공하지 않습니다.",
        cards: [
          ["식사 기록", "사료, 간식, 급수량을 기록합니다."],
          ["산책 기록", "산책 시간과 활동량 흐름을 관리합니다."],
          ["건강 기록", "예방접종, 병원 방문, 복약 기록과 건강 이력을 저장합니다."],
          ["일정 관리", "병원 예약, 접종, 미용·정기 검진 일정을 관리합니다."],
          ["통계와 사진 보관", "생활 패턴과 체중 추이를 보고, 사진과 추억을 모아 둡니다."],
          ["가족 공유와 AI 분석", "가족과 기록을 나누고, 패턴을 참고용으로 정리합니다. 의료 진단이나 치료가 아닙니다."],
        ],
      },
      audience: {
        lead: "반려동물과 함께 사는 분들을 위한 앱입니다.",
        cards: [
          ["반려인", "반려동물의 일상과 건강을 꾸준히 기록하고 싶은 분."],
          ["가족 보호자", "함께 돌보며 기록과 일정을 나누고 싶은 분."],
          ["추억을 남기고 싶은 분", "사진과 함께 반려동물의 성장 이야기를 남기고 싶은 분."],
        ],
      },
      partners: {
        lead: "반려 생태계를 함께 만들 기업·판매자·기관의 제휴 문의를 받습니다.",
        cards: [
          ["반려용품·브랜드 판매자", "반려동물 용품을 판매하거나 소개하려는 개인·사업자·브랜드와의 협업."],
          ["반려 서비스 사업자", "미용, 호텔, 훈련, 돌봄 등 반려 서비스를 운영하는 사업자와의 정보 연계 협업."],
          ["동물병원·단체·기관", "건강 생활 정보 안내를 함께 만드는 기관·단체와의 협력. 진료·진단은 제공하지 않습니다."],
        ],
      },
      download: {
        lead: "PetLog는 iOS와 Android 앱으로 이용합니다.",
      },
    },
    en: {
      title: "PetLog | Newon — A pet log app for your pet's daily life and health",
      desc: "PetLog business overview. Use pet records, health management and family sharing in the app. This website only provides information, app download guidance, partnerships and inquiries.",
      h1: "Your pet's days and health,<br />recorded in one place.",
      lead: "PetLog is a pet log app that records a pet's daily life, health and memories so the family can care together.",
      intro: {
        lead: "From meals and walks to clinic visits, your pet's days become one record.",
        cards: [
          ["Daily life", "Record meals, walks and activity per pet."],
          ["Health", "Keep vaccinations, clinic visits, medication and weight changes as history."],
          ["Family", "Everyone who helps care sees the same records and schedule."],
        ],
      },
      problem: {
        lead: "When pet health records are scattered, small changes are easy to miss.",
        cards: [
          ["Scattered health history", "Vaccination dates, clinic records and medication notes live in several places."],
          ["Changes noticed late", "Changes in weight and activity are hard to see as a record."],
          ["Confusion when caring together", "Each family member remembers feeding and walks separately."],
        ],
      },
      features: {
        lead: "The features below are used in the PetLog app. They are not provided on the website.",
        cards: [
          ["Meal log", "Record food, treats and water."],
          ["Walk log", "Manage walk time and activity trends."],
          ["Health records", "Store vaccinations, clinic visits, medication and health history."],
          ["Schedule", "Manage clinic appointments, vaccinations, grooming and check-ups."],
          ["Statistics and photo storage", "See daily patterns and weight trends, and keep photos and memories."],
          ["Family sharing and AI insights", "Share records with family and get patterns summarized for reference. Not a medical diagnosis or treatment."],
        ],
      },
      audience: {
        lead: "For people who live with pets.",
        cards: [
          ["Pet owners", "Anyone who wants to keep recording a pet's daily life and health."],
          ["Family caregivers", "People who share care, records and schedules."],
          ["Memory keepers", "Those who want to keep a pet's story together with photos."],
        ],
      },
      partners: {
        lead: "We welcome partnership inquiries from businesses, sellers and institutions that want to build the pet ecosystem together.",
        cards: [
          ["Pet product sellers and brands", "Collaboration with individuals, businesses and brands that sell or introduce pet products."],
          ["Pet service businesses", "Information-linking collaboration with grooming, hotel, training and care providers."],
          ["Vet clinics, groups and institutions", "Cooperation on health-living information. We do not provide examination or diagnosis."],
        ],
      },
      download: {
        lead: "PetLog is used as an iOS and Android app.",
      },
    },
  },

  myworld: {
    ko: {
      title: "My World | Newon — 여행한 세계를 나만의 지도로 기록하는 여행 기록 앱",
      desc: "My World 사업 소개. 방문 국가·도시 지도, 여행 기록, AI 여행 리포트를 앱에서 이용합니다. 이 웹사이트는 소개, 앱 다운로드 안내, 제휴·문의만 제공합니다.",
      h1: "여행한 세계가,<br />나만의 지도가 됩니다.",
      lead: "My World는 방문한 나라와 도시, 일정과 사진을 세계 지도 위에 기록하는 지도 기반 여행 기록 앱입니다.",
      intro: {
        lead: "여행을 많이 할수록 나만의 세계 지도가 채워집니다.",
        cards: [
          ["지도", "방문한 국가와 도시를 세계 지도에서 한눈에 확인합니다."],
          ["기록", "일정, 사진, 메모를 여행별로 모아 둡니다."],
          ["돌아보기", "여행 통계와 AI 리포트로 나의 여행을 돌아봅니다."],
        ],
      },
      problem: {
        lead: "여행의 기억은 여러 곳에 흩어지기 쉽습니다.",
        cards: [
          ["흩어진 여행 기록", "일정, 사진, 메모가 여러 앱과 앨범에 나뉘어 있습니다."],
          ["어디를 다녀왔는지 흐릿함", "방문한 나라와 도시를 한눈에 보기 어렵습니다."],
          ["돌아볼 기준이 없음", "나의 여행 스타일과 변화를 되짚어 볼 방법이 부족합니다."],
        ],
      },
      features: {
        lead: "아래 기능은 My World 앱에서 이용합니다. 웹사이트에서는 제공하지 않습니다.",
        cards: [
          ["여행 지도", "방문 국가와 도시를 세계 지도에 기록합니다."],
          ["여행 일정", "계획부터 완료된 일정까지 캘린더로 관리합니다."],
          ["여행 기록", "사진, 메모, 여행 노트를 함께 보관합니다."],
          ["여행 통계", "방문 국가 수, 여행일, 거리, 대륙 달성률을 확인합니다."],
          ["AI 여행 리포트", "여행 패턴을 정리해 여행 스타일과 요약을 보여 줍니다."],
          ["여행 목표", "가고 싶은 나라와 목표를 정하고 지도를 채워 갑니다."],
        ],
      },
      audience: {
        lead: "여행의 순간을 오래 남기고 싶은 분들을 위한 앱입니다.",
        cards: [
          ["여행을 자주 다니는 분", "방문한 곳을 하나의 지도에 쌓아 가고 싶은 분."],
          ["기록을 좋아하는 분", "사진과 메모로 여행을 정리하고 싶은 분."],
          ["목표를 세워 여행하는 분", "방문 국가 목표를 세우고 달성 현황을 보고 싶은 분."],
        ],
      },
      partners: {
        lead: "여행 생태계를 함께 만들 기업·판매자·기관의 제휴 문의를 받습니다.",
        cards: [
          ["여행 서비스·콘텐츠 사업자", "여행 정보와 콘텐츠를 제공하는 사업자와의 협업."],
          ["지역·관광 기관", "지역 여행 정보를 소개하는 관광 기관·지자체와의 협력."],
          ["여행 상품·브랜드", "여행 상품과 용품을 소개하려는 판매자·브랜드와의 협업. 제휴 계약이 확정되기 전에는 상품 예약·결제를 연결하지 않습니다."],
        ],
      },
      download: {
        lead: "My World는 iOS와 Android 앱으로 이용합니다.",
      },
    },
    en: {
      title: "My World | Newon — A travel log app that turns the world you have visited into your own map",
      desc: "My World business overview. Use the visited country and city map, travel records and AI travel reports in the app. This website only provides information, app download guidance, partnerships and inquiries.",
      h1: "The world you travel<br />becomes your own map.",
      lead: "My World is a map-based travel log app that records the countries and cities you visit, with your itinerary and photos, on a world map.",
      intro: {
        lead: "The more you travel, the more of your own world map fills in.",
        cards: [
          ["Map", "See the countries and cities you have visited on a world map."],
          ["Record", "Keep itineraries, photos and notes together per trip."],
          ["Look back", "Review your travel with statistics and an AI report."],
        ],
      },
      problem: {
        lead: "Travel memories are easily scattered.",
        cards: [
          ["Scattered trip records", "Itineraries, photos and notes sit in different apps and albums."],
          ["Where you have been is blurry", "It is hard to see every country and city you have visited at a glance."],
          ["No way to look back", "There is little to help you review your travel style and how it changes."],
        ],
      },
      features: {
        lead: "The features below are used in the My World app. They are not provided on the website.",
        cards: [
          ["Travel map", "Record visited countries and cities on the world map."],
          ["Trip schedule", "Manage plans and completed trips in a calendar."],
          ["Travel records", "Keep photos, notes and travel journals together."],
          ["Travel statistics", "See countries visited, travel days, distance and continent progress."],
          ["AI travel report", "Summarizes your travel patterns, style and highlights."],
          ["Travel goals", "Set the countries you want to visit and fill in the map."],
        ],
      },
      audience: {
        lead: "For people who want to keep their travel moments for a long time.",
        cards: [
          ["Frequent travelers", "Those who want to build every place they visit on one map."],
          ["Record keepers", "Those who like to organize trips with photos and notes."],
          ["Goal-driven travelers", "Those who set country goals and want to see progress."],
        ],
      },
      partners: {
        lead: "We welcome partnership inquiries from businesses, sellers and institutions that want to build the travel ecosystem together.",
        cards: [
          ["Travel service and content providers", "Collaboration with businesses that provide travel information and content."],
          ["Regional and tourism bodies", "Cooperation with tourism organizations and local governments that introduce regional travel information."],
          ["Travel products and brands", "Collaboration with sellers and brands that introduce travel products. Booking and payment are not connected until partnership contracts are confirmed."],
        ],
      },
      download: {
        lead: "My World is used as an iOS and Android app.",
      },
    },
  },

  shareon: {
    ko: {
      title: "ShareOn | Newon — 개인과 사업자가 물품·공간·서비스를 나누는 앱 (출시 준비 중)",
      desc: "ShareOn 사업 소개. 개인과 사업자가 물품, 공간, 서비스를 등록하고 연결되는 앱을 준비하고 있습니다. 이 웹사이트는 소개, 출시 안내, 제휴·문의만 제공합니다.",
      h1: "필요한 것을 나누고,<br />가까운 사람과 연결됩니다.",
      lead: "ShareOn은 개인과 사업자가 물품, 공간, 서비스를 등록하고 필요한 사람과 연결되는 앱입니다. 현재 출시를 준비하고 있습니다.",
      intro: {
        lead: "쓰지 않는 물건, 비어 있는 공간, 가진 기술을 필요한 사람과 이어 주는 것을 목표로 합니다.",
        cards: [
          ["물품", "쓰지 않는 물건을 필요한 사람에게 연결합니다."],
          ["공간", "비어 있는 공간을 필요한 시간만큼 나눕니다."],
          ["서비스", "개인과 사업자가 가진 서비스를 소개하고 연결합니다."],
        ],
      },
      problem: {
        lead: "필요한 것을 찾고 나누는 일이 여전히 번거롭습니다.",
        cards: [
          ["흩어진 거래 경로", "물품, 공간, 서비스를 찾으려면 여러 곳을 따로 둘러봐야 합니다."],
          ["개인과 사업자의 진입 장벽", "작은 판매자와 사업자가 직접 등록하고 알리기 어렵습니다."],
          ["신뢰", "처음 보는 상대와 안전하게 연결되는 방법이 필요합니다."],
        ],
      },
      features: {
        lead: "아래는 앱에서 제공하려는 방향입니다. 출시 전이며, 세부 기능은 확정되는 대로 공지에 안내합니다. 웹사이트에서는 제공하지 않습니다.",
        cards: [
          ["등록", "개인과 사업자가 물품, 공간, 서비스를 직접 등록합니다."],
          ["탐색", "원하는 물품·공간·서비스를 찾아봅니다."],
          ["연결", "필요한 상대와 대화하고 약속을 정합니다."],
          ["안내", "결제·정산·수수료 정책은 출시 전에 확정해 공지합니다."],
        ],
      },
      audience: {
        lead: "ShareOn은 이런 분들을 위해 준비하고 있습니다.",
        cards: [
          ["개인", "쓰지 않는 물건이나 공간을 나누고 싶은 분."],
          ["소상공인·사업자", "작은 규모로 물품·공간·서비스를 알리고 연결하고 싶은 분."],
          ["필요한 것을 찾는 분", "가까운 곳에서 필요한 것을 빌리거나 구하려는 분."],
        ],
      },
      partners: {
        lead: "ShareOn에서 판매·제공하려는 기업·판매자·기관의 문의를 받습니다.",
        cards: [
          ["개인·소상공인 판매자", "직접 등록해 판매하거나 대여하려는 분. 앱 출시 후 등록 방식과 기준을 안내합니다."],
          ["사업자·브랜드", "물품·공간·서비스를 제공하려는 사업자와 브랜드와의 협업."],
          ["지역·공공 기관", "지역 공유 문화를 함께 만들 기관·단체와의 협력."],
        ],
      },
      download: {
        lead: "ShareOn은 출시를 준비 중입니다.",
      },
    },
    en: {
      title: "ShareOn | Newon — An app for individuals and businesses to share goods, spaces and services (coming soon)",
      desc: "ShareOn business overview. We are preparing an app where individuals and businesses list goods, spaces and services and connect with people who need them. This website only provides information, launch notices, partnerships and inquiries.",
      h1: "Share what you have,<br />and connect with people nearby.",
      lead: "ShareOn is an app where individuals and businesses list goods, spaces and services and connect with people who need them. It is being prepared for launch.",
      intro: {
        lead: "Our goal is to connect unused items, empty spaces and skills with the people who need them.",
        cards: [
          ["Goods", "Connect items you no longer use with people who need them."],
          ["Spaces", "Share an empty space for the time it is needed."],
          ["Services", "Individuals and businesses introduce and connect their services."],
        ],
      },
      problem: {
        lead: "Finding and sharing what you need is still a hassle.",
        cards: [
          ["Scattered channels", "Goods, spaces and services have to be searched for in different places."],
          ["A high bar for individuals and small businesses", "It is hard for small sellers to list and promote on their own."],
          ["Trust", "People need a way to connect safely with someone they do not know yet."],
        ],
      },
      features: {
        lead: "Below is the direction we plan to offer in the app. It is not launched yet; details will be posted in the news section once confirmed. They are not provided on the website.",
        cards: [
          ["Listing", "Individuals and businesses list goods, spaces and services themselves."],
          ["Browse", "Look for the goods, spaces and services you want."],
          ["Connect", "Talk to the other person and agree on the arrangement."],
          ["Guidance", "Payment, settlement and fee policies will be confirmed and announced before launch."],
        ],
      },
      audience: {
        lead: "We are preparing ShareOn for these people.",
        cards: [
          ["Individuals", "People who want to share items or space they do not use."],
          ["Small businesses", "Small sellers who want to introduce and connect goods, spaces and services at their own scale."],
          ["People looking for something", "Those who want to borrow or find what they need nearby."],
        ],
      },
      partners: {
        lead: "We welcome inquiries from businesses, sellers and institutions that want to sell or offer on ShareOn.",
        cards: [
          ["Individual and small-business sellers", "Those who want to list and sell or lend directly. Listing methods and criteria will be announced after the app launches."],
          ["Businesses and brands", "Collaboration with businesses and brands that offer goods, spaces or services."],
          ["Local and public bodies", "Cooperation with institutions and groups that build a local sharing culture."],
        ],
      },
      download: {
        lead: "ShareOn is being prepared for launch.",
      },
    },
  },
};

/** Closing blocks appended to the existing LivOn / Ongil editorial pages (ko + en). */
export const LIFE_BLOCKS = {
  lifestage: {
    ko: {
      partnersLead: "LivOn은 삶의 단계마다 필요한 정보와 서비스를 연결하는 사업입니다. 정보를 제공하는 기업·기관과 서비스·상품을 제공하는 판매자의 제휴 문의를 받습니다.",
      partnersCards: [
        ["정보·콘텐츠 제공 기관", "교육, 진로, 취업, 금융 등 생활 정보를 제공하는 기관·기업과의 협력."],
        ["서비스·상품 판매자", "생애 단계에 맞는 서비스와 상품을 제공하려는 사업자와 판매자."],
        ["공공·지역 기관", "청년·가족·은퇴 등 지원 정보를 함께 안내할 공공·지역 기관."],
      ],
      downloadLead: "LivOn은 iOS · Android 앱으로 출시를 준비하고 있습니다.",
    },
    en: {
      partnersLead: "LivOn connects the information and services people need at each life stage. We welcome partnership inquiries from organizations that provide information and sellers that provide services and products.",
      partnersCards: [
        ["Information and content providers", "Cooperation with organizations and companies that provide life information such as education, career, jobs and finance."],
        ["Service and product sellers", "Businesses and sellers that offer services and products suited to each life stage."],
        ["Public and local bodies", "Public and local organizations that guide support information for youth, families and retirement together."],
      ],
      downloadLead: "LivOn is being prepared for launch as an iOS and Android app.",
    },
  },
  ongil: {
    ko: {
      partnersLead: "Ongil은 시니어의 일상과 돌봄, 가족과 지역을 잇는 사업입니다. 돌봄·생활 서비스를 제공하는 기업·판매자와 지역·복지 기관의 제휴 문의를 받습니다.",
      partnersCards: [
        ["생활·돌봄 서비스 사업자", "식사, 이동, 가사, 돌봄 등 생활 서비스를 제공하는 사업자. 자격과 운영 요건 확인 후 협의합니다."],
        ["시니어 용품·서비스 판매자", "시니어 생활에 필요한 상품과 서비스를 소개하려는 판매자."],
        ["복지·지역 기관", "공공·지역 복지, 문화·평생교육 기관과의 협력."],
      ],
      downloadLead: "Ongil은 iOS · Android 앱으로 출시를 준비하고 있습니다.",
    },
    en: {
      partnersLead: "Ongil connects seniors' daily life and care with family and community. We welcome partnership inquiries from businesses and sellers that provide care and living services, and from local and welfare institutions.",
      partnersCards: [
        ["Living and care service providers", "Businesses that provide meals, mobility, housework and care. Terms are discussed after checking qualifications and operating requirements."],
        ["Senior product and service sellers", "Sellers that introduce products and services seniors need in daily life."],
        ["Welfare and local institutions", "Cooperation with public and local welfare, culture and lifelong-learning institutions."],
      ],
      downloadLead: "Ongil is being prepared for launch as an iOS and Android app.",
    },
  },
  transition: {
    ko: {
      title: "현재 제공 중인 웹 체험 버전",
      body: "앱이 출시되고 기능 이전과 데이터 보존이 확인되기 전까지는 기존 웹 체험 버전을 그대로 유지합니다. 앱이 출시되면 이 안내가 앱 다운로드 안내로 바뀝니다.",
      btn: "웹 체험 버전 열기 →",
    },
    en: {
      title: "Web preview available for now",
      body: "Until the app is released and the move of features and preservation of data are verified, the existing web preview stays online. Once the app is released, this notice is replaced with an app download guide.",
      btn: "Open web preview →",
    },
  },
};

export function copyLang(lang) {
  return lang === "ko" ? "ko" : "en";
}
