/**
 * Newon Naver Blog archive — curated from real posts on
 * https://m.blog.naver.com/PostList.naver?blogId=newonapp&tab=1
 *
 * Manual data (no client scraping). Add new posts here when published.
 * Do not invent titles, dates, or URLs.
 *
 * category: product | development | design | business | newon | note
 */

export const NAVER_BLOG_HOME =
  "https://m.blog.naver.com/PostList.naver?blogId=newonapp&tab=1";

/**
 * @typedef {object} NaverBlogPost
 * @property {string} id
 * @property {string} titleKo
 * @property {string} titleEn
 * @property {'product'|'development'|'design'|'business'|'newon'|'note'} category
 * @property {string} summaryKo
 * @property {string} summaryEn
 * @property {string} date  YYYY.MM.DD
 * @property {string} url
 * @property {string|null} thumbnail
 * @property {boolean} [featured]
 */

/** @type {NaverBlogPost[]} */
export const NAVER_BLOG_POSTS = [
  {
    id: "224396976295",
    titleKo: "개강 준비 끝! 대학생이라면 써볼 만한 필수 앱 추천",
    titleEn: "Semester ready: essential apps for campus life",
    category: "product",
    summaryKo:
      "새 학기 시간표·과제·목표·돈 관리까지. GoalUp, CountUp 등 개강 후 대학생활과 일상에 쓸 수 있는 Newon 앱을 소개합니다.",
    summaryEn:
      "Timetables, assignments, goals, and money for the new semester. GoalUp, CountUp, and more Newon apps for campus and everyday life.",
    date: "2026.09.01",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224396976295",
    thumbnail: "/blog-thumbs/nb-224396976295.jpg",
    featured: true,
  },
  {
    id: "224395763455",
    titleKo: "22살 1인 개발자, 6개월 만에 앱 11개를 개발하고 출시했습니다",
    titleEn: "Solo developer at 22: 11 apps shipped in 6 months",
    category: "newon",
    summaryKo:
      "약 6개월 전 처음 앱 개발을 시작해, 기획·디자인·개발·출시까지 혼자 반복한 결과 11개 앱이 되었습니다. My World부터 Newon+까지 만든 과정을 기록합니다.",
    summaryEn:
      "About six months after starting app development, 11 apps are live — planned, designed, built, and shipped solo. From My World to Newon+, a record of the build.",
    date: "2026.08.31",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224395763455",
    thumbnail: "/blog-thumbs/nb-224395763455.jpg",
  },
  {
    id: "224376811561",
    titleKo: "My World : 여행 기록 · 여행 지도 · AI 리포트",
    titleEn: "My World: Travel log · Map · AI report",
    category: "product",
    summaryKo:
      "여행 계획부터 기록까지 한 번에. 다녀온 국가와 도시의 순간을 기억만으로 두지 않고, My World에서 나만의 여행 세계로 정리합니다.",
    summaryEn:
      "Plan and record trips in one place. My World turns countries, cities, and moments into a travel world you can keep.",
    date: "2026.08.12",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224376811561",
    thumbnail: "/blog-thumbs/nb-224376811561.png",
  },
  {
    id: "224355286116",
    titleKo: "Newon: Newon+ & 앱 통합 관리",
    titleEn: "Newon: Newon+ & unified app membership",
    category: "product",
    summaryKo:
      "앱이 늘어날수록 회원가입·구독·로그인이 번거로워집니다. Newon Membership으로 하나의 계정에서 Newon 앱을 연결하는 스마트 멤버십을 소개합니다.",
    summaryEn:
      "More apps mean more sign-ups and subscriptions. Newon Membership connects Newon apps under one account.",
    date: "2026.07.23",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224355286116",
    thumbnail: "/blog-thumbs/nb-224355286116.jpg",
  },
  {
    id: "224355270833",
    titleKo: "CountUp: 카운트&목표 관리 앱",
    titleEn: "CountUp: Count & goal tracking app",
    category: "product",
    summaryKo:
      "운동, 공부, 독서, 금연·금주처럼 반복되는 기록을 기억에만 맡기지 마세요. 작은 기록이 모여 변화를 보여주는 CountUp을 소개합니다.",
    summaryEn:
      "Don’t leave workouts, study, reading, or streak habits to memory. CountUp turns small counts into visible progress.",
    date: "2026.07.23",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224355270833",
    thumbnail: "/blog-thumbs/nb-224355270833.jpg",
  },
  {
    id: "224355249438",
    titleKo: "GoalUp: 꾸준한 목표 관리 앱",
    titleEn: "GoalUp: Consistent goal management app",
    category: "product",
    summaryKo:
      "목표를 세우는 것은 쉽지만 끝까지 실천하기는 어렵습니다. 의지보다 시스템으로 꾸준히 성장하는 GoalUp을 소개합니다.",
    summaryEn:
      "Setting goals is easy; finishing them is hard. GoalUp helps you grow with systems, not willpower alone.",
    date: "2026.07.23",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224355249438",
    thumbnail: "/blog-thumbs/nb-224355249438.jpg",
  },
  {
    id: "224355222334",
    titleKo: "PiggyUp: AI 절약 관리 앱",
    titleEn: "PiggyUp: AI savings habit app",
    category: "product",
    summaryKo:
      "가계부만으로는 절약이 오래가기 어렵습니다. 소비 기록, 절약 금액, 챌린지와 AI 분석으로 절약 습관을 만드는 PiggyUp을 소개합니다.",
    summaryEn:
      "A ledger alone rarely sticks. PiggyUp builds savings habits with logs, challenges, and AI insights.",
    date: "2026.07.23",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224355222334",
    thumbnail: "/blog-thumbs/nb-224355222334.jpg",
  },
  {
    id: "224354838630",
    titleKo: "PetLog: AI 반려동물 케어 앱",
    titleEn: "PetLog: AI pet care app",
    category: "product",
    summaryKo:
      "식사, 건강, 산책, 가족 공유, AI 분석까지. 반려동물의 소중한 순간을 하나의 앱에서 기록하는 PetLog를 소개합니다.",
    summaryEn:
      "Meals, health, walks, family sharing, and AI insights — PetLog keeps your pet’s moments in one app.",
    date: "2026.07.22",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224354838630",
    thumbnail: "/blog-thumbs/nb-224354838630.jpg",
  },
  {
    id: "224354821529",
    titleKo: "BabyLog: AI 육아 관리 앱",
    titleEn: "BabyLog: AI baby care app",
    category: "product",
    summaryKo:
      "수유부터 성장·건강 기록, 가족 공유, AI 분석까지. 하루가 다르게 자라는 아이의 순간을 BabyLog에서 남깁니다.",
    summaryEn:
      "From feeding to growth, health, family sharing, and AI insights — BabyLog records the moments that grow every day.",
    date: "2026.07.22",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224354821529",
    thumbnail: "/blog-thumbs/nb-224354821529.jpg",
  },
  {
    id: "224354787176",
    titleKo: "Savy: AI 스마트 가계부",
    titleEn: "Savy: AI smart money tracker",
    category: "product",
    summaryKo:
      "지출·수입·구독을 한곳에서 보고 AI 소비 분석으로 돈 관리를 더 쉽게. SAVY로 똑똑한 가계 습관을 시작합니다.",
    summaryEn:
      "Track spending, income, and subscriptions — then use AI insights to build smarter money habits with SAVY.",
    date: "2026.07.22",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224354787176",
    thumbnail: "/blog-thumbs/nb-224354787176.jpg",
  },
  {
    id: "224354668231",
    titleKo: "Pillmate: 약 복용 알림 앱",
    titleEn: "Pillmate: Medication reminder app",
    category: "product",
    summaryKo:
      "약·영양제·건강 루틴을 한곳에서 관리하고 알림과 가족 공유로 복용을 이어갑니다. Pillmate로 건강 습관을 만듭니다.",
    summaryEn:
      "Manage meds, supplements, and routines with reminders and family sharing. Pillmate helps health habits stick.",
    date: "2026.07.22",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224354668231",
    thumbnail: "/blog-thumbs/nb-224354668231.jpg",
  },
  {
    id: "224354634930",
    titleKo: "SubPing: 구독 관리 앱",
    titleEn: "SubPing: Subscription manager",
    category: "product",
    summaryKo:
      "매달 빠져나가는 구독료를 한눈에. 스트리밍부터 SaaS·통신비까지 SubPing으로 구독을 정리하고 관리합니다.",
    summaryEn:
      "See recurring subscriptions at a glance — from streaming to SaaS and bills — and manage them with SubPing.",
    date: "2026.07.22",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224354634930",
    thumbnail: "/blog-thumbs/nb-224354634930.jpg",
  },
  {
    id: "224354526204",
    titleKo: "OX MONTH: AI 습관 관리 앱",
    titleEn: "OX MONTH: AI habit tracker",
    category: "product",
    summaryKo:
      "복잡한 계획보다 오늘의 O/X 한 번. 했는지 안 했는지만 기록해 꾸준한 습관을 만드는 OX MONTH를 소개합니다.",
    summaryEn:
      "Skip complex plans — mark today’s O/X. OX MONTH builds consistency with one simple daily record.",
    date: "2026.07.22",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224354526204",
    thumbnail: "/blog-thumbs/nb-224354526204.jpg",
  },
  {
    id: "224353748976",
    titleKo: "New(새로운)+On(켜다)",
    titleEn: "New + On — turning ideas on",
    category: "newon",
    summaryKo:
      "아이디어를 켜고 일상의 변화를 설계하는 Newon. 흩어진 앱 경험을 하나의 흐름으로 연결하려는 이야기에서 시작합니다.",
    summaryEn:
      "Newon turns ideas on and designs daily change — starting from connecting scattered app experiences into one flow.",
    date: "2026.07.22",
    url: "https://m.blog.naver.com/PostView.naver?blogId=newonapp&logNo=224353748976",
    thumbnail: "/blog-thumbs/nb-224353748976.png",
  },
];

export function getNaverBlogPosts() {
  return NAVER_BLOG_POSTS.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function getFeaturedNaverBlogPost() {
  const posts = getNaverBlogPosts();
  return posts.find((p) => p.featured) || posts[0] || null;
}
