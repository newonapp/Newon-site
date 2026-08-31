/**
 * Newon Media Hub data — Instagram + YouTube.
 *
 * Curated from real @newon.app / @newonapp content only.
 * Add items here when new videos ship. Do not invent titles, dates, or metrics.
 *
 * platform: youtube | instagram
 * category: PRODUCT | BUILD | DESIGN | NEWON
 * type (instagram): REEL | POST
 */

/** Clean profile URLs used across the Media hub (no tracking params). */
export const SOCIAL_LINKS = {
  ko: {
    instagram: "https://www.instagram.com/newon.app/",
    youtube: "https://www.youtube.com/@newonapp",
  },
  en: {
    instagram: "https://www.instagram.com/newon.app.global/",
    youtube: "https://www.youtube.com/@newonglobal",
  },
};

export function getSocialLinks(lang = "en") {
  return SOCIAL_LINKS[lang === "ko" ? "ko" : "en"];
}

/**
 * Series shown only when matching category items exist.
 */
export const MEDIA_SERIES_DEFS = [
  {
    id: "building-newon",
    category: "BUILD",
    titleKo: "BUILDING NEWON",
    titleEn: "BUILDING NEWON",
    descKo: "제품을 만드는 과정을 기록합니다.",
    descEn: "Documenting how Newon builds products.",
  },
  {
    id: "product-stories",
    category: "PRODUCT",
    titleKo: "PRODUCT STORIES",
    titleEn: "PRODUCT STORIES",
    descKo: "Newon 제품과 기능을 소개합니다.",
    descEn: "Newon products and features, on camera.",
  },
  {
    id: "behind-the-build",
    category: "DESIGN",
    titleKo: "BEHIND THE BUILD",
    titleEn: "BEHIND THE BUILD",
    descKo: "개발, 디자인, 실험 과정을 보여줍니다.",
    descEn: "Development, design, and experiments.",
  },
  {
    id: "updates",
    category: "NEWON",
    titleKo: "UPDATES",
    titleEn: "UPDATES",
    descKo: "Newon의 새로운 출시와 업데이트.",
    descEn: "Launches and updates from Newon.",
  },
];

/**
 * @typedef {object} MediaItem
 * @property {string} id
 * @property {'youtube'|'instagram'} platform
 * @property {'PRODUCT'|'BUILD'|'DESIGN'|'NEWON'} category
 * @property {string} titleKo
 * @property {string} titleEn
 * @property {string} descriptionKo
 * @property {string} descriptionEn
 * @property {string} date YYYY-MM-DD
 * @property {string} url
 * @property {string|null} embedUrl
 * @property {string|null} thumbnail
 * @property {string|null} duration display e.g. "1:24"
 * @property {number|null} [durationSeconds]
 * @property {boolean} [featured]
 * @property {'REEL'|'POST'} [igType]
 */

/** @type {MediaItem[]} */
export const MEDIA_ITEMS_HUB = [
  /* —— YouTube (@newonapp) —— */
  {
    id: "yt-ZmCgR4M-WiA",
    platform: "youtube",
    category: "PRODUCT",
    titleKo: "나만 모르는 갓생 사는 가장 쉬운 방법",
    titleEn: "The easiest way to live a consistent day",
    descriptionKo: "OX MONTH — 성공은 O, 실패는 X. 하루의 습관을 가장 단순하게 기록합니다.",
    descriptionEn: "OX MONTH — mark the day with O or X. Habit tracking without the clutter.",
    date: "2026-08-14",
    url: "https://www.youtube.com/watch?v=ZmCgR4M-WiA",
    embedUrl: "https://www.youtube.com/embed/ZmCgR4M-WiA",
    thumbnail: "https://i.ytimg.com/vi/ZmCgR4M-WiA/hqdefault.jpg",
    duration: "1:21",
    durationSeconds: 81,
    featured: true,
  },
  {
    id: "yt-hbffiwR9XSk",
    platform: "youtube",
    category: "NEWON",
    titleKo: "6개월만에 앱 10개 만들었더니 생긴 문제..",
    titleEn: "What happened after shipping 10 apps in 6 months",
    descriptionKo: "앱이 늘어날수록 계정과 관리가 복잡해졌습니다. Newon+로 하나로 연결합니다.",
    descriptionEn: "More apps meant more friction. Newon+ connects them under one account.",
    date: "2026-08-14",
    url: "https://www.youtube.com/watch?v=hbffiwR9XSk",
    embedUrl: "https://www.youtube.com/embed/hbffiwR9XSk",
    thumbnail: "https://i.ytimg.com/vi/hbffiwR9XSk/hqdefault.jpg",
    duration: "1:10",
    durationSeconds: 70,
  },
  {
    id: "yt-pe0fDPR5rJo",
    platform: "youtube",
    category: "PRODUCT",
    titleKo: "22살이 만든 여행 필수 앱!",
    titleEn: "A travel app built at 22",
    descriptionKo: "My World — 여행 계획부터 기록, 경비, AI 리포트까지 한곳에서.",
    descriptionEn: "My World — plan, log, spend, and review trips in one place.",
    date: "2026-08-13",
    url: "https://www.youtube.com/watch?v=pe0fDPR5rJo",
    embedUrl: "https://www.youtube.com/embed/pe0fDPR5rJo",
    thumbnail: "https://i.ytimg.com/vi/pe0fDPR5rJo/hqdefault.jpg",
    duration: "1:24",
    durationSeconds: 84,
  },
  {
    id: "yt--fGlieGQkos",
    platform: "youtube",
    category: "PRODUCT",
    titleKo: "22살이 만든 11개 앱 중 1위 앱!?",
    titleEn: "Which of 11 apps came out on top?",
    descriptionKo: "Savy — AI가 소비 패턴을 분석하는 스마트 가계부.",
    descriptionEn: "Savy — an AI ledger that reads your spending patterns.",
    date: "2026-08-12",
    url: "https://www.youtube.com/watch?v=-fGlieGQkos",
    embedUrl: "https://www.youtube.com/embed/-fGlieGQkos",
    thumbnail: "https://i.ytimg.com/vi/-fGlieGQkos/hqdefault.jpg",
    duration: "0:57",
    durationSeconds: 57,
  },
  {
    id: "yt-aPW5t-dEw6A",
    platform: "youtube",
    category: "PRODUCT",
    titleKo: "6개월만에 앱 11개 만든 22살이 만든 미친 앱",
    titleEn: "A pill & supplement app from an 11-app sprint",
    descriptionKo: "Pillmate — 약·영양제 알림, 기록, 가족 복용 관리.",
    descriptionEn: "Pillmate — reminders, logs, and family dose tracking.",
    date: "2026-08-01",
    url: "https://www.youtube.com/watch?v=aPW5t-dEw6A",
    embedUrl: "https://www.youtube.com/embed/aPW5t-dEw6A",
    thumbnail: "https://i.ytimg.com/vi/aPW5t-dEw6A/hqdefault.jpg",
    duration: "1:22",
    durationSeconds: 82,
  },
  {
    id: "yt-6z19Pevw_b8",
    platform: "youtube",
    category: "PRODUCT",
    titleKo: "요즘 이 앱 다 쓴다며, 누가 안 써?",
    titleEn: "CountUp — track streaks and day counts",
    descriptionKo: "CountUp — 운동·공부·금연 등 쌓이는 기록을 한눈에.",
    descriptionEn: "CountUp — see how long your habits have been stacking.",
    date: "2026-08-01",
    url: "https://www.youtube.com/watch?v=6z19Pevw_b8",
    embedUrl: "https://www.youtube.com/embed/6z19Pevw_b8",
    thumbnail: "https://i.ytimg.com/vi/6z19Pevw_b8/hqdefault.jpg",
    duration: "0:43",
    durationSeconds: 43,
  },
  {
    id: "yt-JRJGbxB3z_I",
    platform: "youtube",
    category: "PRODUCT",
    titleKo: "요즘 엄마들 다 쓰는 임신~고등까지 우리 아이의 모든 기록 육아 관리 앱",
    titleEn: "BabyLog — growth records from pregnancy to school",
    descriptionKo: "BabyLog — 임신부터 고등학교까지 성장 기록을 한곳에.",
    descriptionEn: "BabyLog — keep every growth moment in one timeline.",
    date: "2026-08-01",
    url: "https://www.youtube.com/watch?v=JRJGbxB3z_I",
    embedUrl: "https://www.youtube.com/embed/JRJGbxB3z_I",
    thumbnail: "https://i.ytimg.com/vi/JRJGbxB3z_I/hqdefault.jpg",
    duration: "1:11",
    durationSeconds: 71,
  },
  {
    id: "yt-N0ZFrFMZTYM",
    platform: "youtube",
    category: "PRODUCT",
    titleKo: "모든 반려인 다 쓰는 필수 앱, 설마 아직도 안 쓰는 사람?",
    titleEn: "PetLog — lifelong records for pets",
    descriptionKo: "PetLog — 건강, 산책, 접종, 추억을 하나로 관리합니다.",
    descriptionEn: "PetLog — health, walks, vaccines, and memories together.",
    date: "2026-08-01",
    url: "https://www.youtube.com/watch?v=N0ZFrFMZTYM",
    embedUrl: "https://www.youtube.com/embed/N0ZFrFMZTYM",
    thumbnail: "https://i.ytimg.com/vi/N0ZFrFMZTYM/hqdefault.jpg",
    duration: "1:14",
    durationSeconds: 74,
  },
  {
    id: "yt-32pzTxTOEW8",
    platform: "youtube",
    category: "PRODUCT",
    titleKo: "목표만 정하면 꼭 성공 시켜주는 앱을 만든 22살 믿어보시겠어요?",
    titleEn: "GoalUp — goals you actually finish",
    descriptionKo: "GoalUp — 목표 체크, 스트릭, AI 인사이트로 끝까지.",
    descriptionEn: "GoalUp — check-ins, streaks, and AI insight to the finish.",
    date: "2026-08-01",
    url: "https://www.youtube.com/watch?v=32pzTxTOEW8",
    embedUrl: "https://www.youtube.com/embed/32pzTxTOEW8",
    thumbnail: "https://i.ytimg.com/vi/32pzTxTOEW8/hqdefault.jpg",
    duration: "1:24",
    durationSeconds: 84,
  },
  {
    id: "yt-JOCaKg_tlnk",
    platform: "youtube",
    category: "PRODUCT",
    titleKo: "이 앱 하나로 돈 아껴서 엽떡에 허니콤보까지 먹음!",
    titleEn: "SubPing — stop surprise subscription charges",
    descriptionKo: "SubPing — 결제일 알림과 구독료 한눈에 보기.",
    descriptionEn: "SubPing — renewals, alerts, and subscription spend in view.",
    date: "2026-08-01",
    url: "https://www.youtube.com/watch?v=JOCaKg_tlnk",
    embedUrl: "https://www.youtube.com/embed/JOCaKg_tlnk",
    thumbnail: "https://i.ytimg.com/vi/JOCaKg_tlnk/hqdefault.jpg",
    duration: "1:22",
    durationSeconds: 82,
  },
  {
    id: "yt-UqRtdw5Ryuc",
    platform: "youtube",
    category: "PRODUCT",
    titleKo: "22살이 만든 앱으로 갓생 사는 방법",
    titleEn: "Building a consistent life with OX MONTH",
    descriptionKo: "OX MONTH — O/X로 습관을 남기고 한 달을 채웁니다.",
    descriptionEn: "OX MONTH — fill the month with simple O / X check-ins.",
    date: "2026-08-01",
    url: "https://www.youtube.com/watch?v=UqRtdw5Ryuc",
    embedUrl: "https://www.youtube.com/embed/UqRtdw5Ryuc",
    thumbnail: "https://i.ytimg.com/vi/UqRtdw5Ryuc/hqdefault.jpg",
    duration: "1:20",
    durationSeconds: 80,
  },
  {
    id: "yt-W9mQpU73iP8",
    platform: "youtube",
    category: "NEWON",
    titleKo: "6개월만에 앱 10개 만들었더니 이런 문제가..",
    titleEn: "One Newon+ login for every Newon app",
    descriptionKo: "Newon+ — 한 번의 회원가입으로 모든 Newon 앱을 이용합니다.",
    descriptionEn: "Newon+ — sign up once, open every Newon app.",
    date: "2026-08-01",
    url: "https://www.youtube.com/watch?v=W9mQpU73iP8",
    embedUrl: "https://www.youtube.com/embed/W9mQpU73iP8",
    thumbnail: "https://i.ytimg.com/vi/W9mQpU73iP8/hqdefault.jpg",
    duration: "1:10",
    durationSeconds: 70,
  },
  {
    id: "yt-f32YEWd3v5Q",
    platform: "youtube",
    category: "BUILD",
    titleKo: "6개월만에 혼자 앱 10개 개발한 22살",
    titleEn: "10 apps in 6 months — solo build story",
    descriptionKo: "기획부터 출시까지 혼자 만든 Newon 앱들의 시작 이야기.",
    descriptionEn: "From idea to launch — the solo start of Newon’s apps.",
    date: "2026-07-23",
    url: "https://www.youtube.com/watch?v=f32YEWd3v5Q",
    embedUrl: "https://www.youtube.com/embed/f32YEWd3v5Q",
    thumbnail: "https://i.ytimg.com/vi/f32YEWd3v5Q/hqdefault.jpg",
    duration: "1:57",
    durationSeconds: 117,
  },

  /* —— Instagram (@newon.app) — thumbnail + external link (no embed) —— */
  {
    id: "ig-Dcrk3d7khFL",
    platform: "instagram",
    category: "PRODUCT",
    igType: "POST",
    titleKo: "개강한 대학생이라면 저장해두기 — 필수 앱 9개",
    titleEn: "Back-to-school picks: 9 apps for campus life",
    descriptionKo: "목표·카운트·습관·저축·구독·가계부 등 새 학기에 쓸 앱을 모았습니다.",
    descriptionEn: "Goals, counts, habits, savings, subscriptions, and more for the new semester.",
    date: "2026-08-31",
    url: "https://www.instagram.com/newon.app/p/Dcrk3d7khFL/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-Dcrk3d7khFL.jpg",
    duration: null,
  },
  {
    id: "ig-Dcqh5c2FAy2",
    platform: "instagram",
    category: "BUILD",
    igType: "POST",
    titleKo: "22살, 6개월 동안 만든 11개의 앱",
    titleEn: "Eleven apps built in six months at 22",
    descriptionKo: "일상에서 필요하다고 느낀 아이디어를 하나씩 실제 앱으로 만든 기록.",
    descriptionEn: "Turning everyday needs into real apps — one launch at a time.",
    date: "2026-08-30",
    url: "https://www.instagram.com/newon.app/p/Dcqh5c2FAy2/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-Dcqh5c2FAy2.jpg",
    duration: null,
  },
  {
    id: "ig-Db-RGaAR6JH",
    platform: "instagram",
    category: "PRODUCT",
    igType: "REEL",
    titleKo: "여행 좋아하면 이 앱은 꼭 써보세요!",
    titleEn: "If you travel, try My World",
    descriptionKo: "My World — 계획부터 추억까지 여행 기록 앱.",
    descriptionEn: "My World — trips from plan to memory.",
    date: "2026-08-13",
    url: "https://www.instagram.com/newon.app/reel/Db-RGaAR6JH/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-Db-RGaAR6JH.jpg",
    duration: null,
  },
  {
    id: "ig-DbkIlLCSj1v",
    platform: "instagram",
    category: "PRODUCT",
    igType: "REEL",
    titleKo: "아직도 가계부, 직접 적고만 있나요?",
    titleEn: "Still only logging expenses by hand?",
    descriptionKo: "Savy — AI 소비 분석 가계부.",
    descriptionEn: "Savy — AI spending insights.",
    date: "2026-08-02",
    url: "https://www.instagram.com/newon.app/reel/DbkIlLCSj1v/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-DbkIlLCSj1v.jpg",
    duration: null,
  },
  {
    id: "ig-DbhXBIGSxPP",
    platform: "instagram",
    category: "PRODUCT",
    igType: "REEL",
    titleKo: "영양제랑 약, 아직도 매번 까먹고 계신가요?",
    titleEn: "Still forgetting pills and supplements?",
    descriptionKo: "Pillmate — 복용 알림과 가족 관리.",
    descriptionEn: "Pillmate — dose reminders and family care.",
    date: "2026-08-01",
    url: "https://www.instagram.com/newon.app/reel/DbhXBIGSxPP/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-DbhXBIGSxPP.jpg",
    duration: null,
  },
  {
    id: "ig-DbhQMs5vIXC",
    platform: "instagram",
    category: "PRODUCT",
    igType: "REEL",
    titleKo: "엄마, 나 어릴 때 어땠어?",
    titleEn: "“What was I like when I was little?”",
    descriptionKo: "BabyLog — 임신부터 성장까지 육아 기록.",
    descriptionEn: "BabyLog — growth notes from pregnancy on.",
    date: "2026-08-01",
    url: "https://www.instagram.com/newon.app/reel/DbhQMs5vIXC/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-DbhQMs5vIXC.jpg",
    duration: null,
  },
  {
    id: "ig-DbhOyCTyURD",
    platform: "instagram",
    category: "PRODUCT",
    igType: "REEL",
    titleKo: "우리 반려동물의 모든 순간, 평생 기록하고 계신가요?",
    titleEn: "Keeping a lifelong pet journal?",
    descriptionKo: "PetLog — 건강·산책·추억을 한곳에.",
    descriptionEn: "PetLog — health, walks, and memories.",
    date: "2026-08-01",
    url: "https://www.instagram.com/newon.app/reel/DbhOyCTyURD/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-DbhOyCTyURD.jpg",
    duration: null,
  },
  {
    id: "ig-Dbf9SQQvJNu",
    platform: "instagram",
    category: "PRODUCT",
    igType: "REEL",
    titleKo: "오늘이 며칠째인지 알고 계신가요?",
    titleEn: "Do you know what day of the streak it is?",
    descriptionKo: "CountUp — 쌓이는 기록을 눈으로 확인.",
    descriptionEn: "CountUp — see the days stack up.",
    date: "2026-08-01",
    url: "https://www.instagram.com/newon.app/reel/Dbf9SQQvJNu/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-Dbf9SQQvJNu.jpg",
    duration: null,
  },
  {
    id: "ig-DbfuXBISue4",
    platform: "instagram",
    category: "PRODUCT",
    igType: "REEL",
    titleKo: "올해 초 세웠던 목표, 얼마나 이루셨나요?",
    titleEn: "How many of this year’s goals are done?",
    descriptionKo: "GoalUp — 목표를 끝까지 이어가는 앱.",
    descriptionEn: "GoalUp — finish the goals you set.",
    date: "2026-08-01",
    url: "https://www.instagram.com/newon.app/reel/DbfuXBISue4/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-DbfuXBISue4.jpg",
    duration: null,
  },
  {
    id: "ig-DbXx6s4SmiZ",
    platform: "instagram",
    category: "PRODUCT",
    igType: "REEL",
    titleKo: "매달 구독료로 얼마를 쓰는지 알고 계신가요?",
    titleEn: "Do you know your monthly subscription spend?",
    descriptionKo: "SubPing — 구독 결제와 알림을 한곳에서.",
    descriptionEn: "SubPing — subscriptions and renewals in one place.",
    date: "2026-07-29",
    url: "https://www.instagram.com/newon.app/reel/DbXx6s4SmiZ/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-DbXx6s4SmiZ.jpg",
    duration: null,
  },
  {
    id: "ig-DbWvYKNSSqr",
    platform: "instagram",
    category: "PRODUCT",
    igType: "REEL",
    titleKo: "꾸준하게 갓생 살고 싶은 사람!!",
    titleEn: "For anyone tired of three-day habits",
    descriptionKo: "OX MONTH — O와 X로 습관을 남깁니다.",
    descriptionEn: "OX MONTH — habits marked with O and X.",
    date: "2026-07-28",
    url: "https://www.instagram.com/newon.app/reel/DbWvYKNSSqr/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-DbWvYKNSSqr.jpg",
    duration: null,
  },
  {
    id: "ig-DbPMlR4S6Di",
    platform: "instagram",
    category: "NEWON",
    igType: "REEL",
    titleKo: "앱을 10개 만들었더니 오히려 불편했습니다…",
    titleEn: "Ten apps made login harder — so we fixed it",
    descriptionKo: "Newon+ — 한 계정으로 Newon 앱을 연결합니다.",
    descriptionEn: "Newon+ — one account across Newon apps.",
    date: "2026-07-25",
    url: "https://www.instagram.com/newon.app/reel/DbPMlR4S6Di/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-DbPMlR4S6Di.jpg",
    duration: null,
  },
  {
    id: "ig-DbJks79TfKj",
    platform: "instagram",
    category: "BUILD",
    igType: "REEL",
    titleKo: "22살 1인 개발자, 6개월 동안 혼자 앱 10개를 만들었습니다",
    titleEn: "Solo founder: 10 apps in six months",
    descriptionKo: "기획·디자인·개발·출시까지 혼자 만든 기록.",
    descriptionEn: "Idea, design, build, and launch — solo.",
    date: "2026-07-23",
    url: "https://www.instagram.com/newon.app/reel/DbJks79TfKj/",
    embedUrl: null,
    thumbnail: "/media-thumbs/ig-DbJks79TfKj.jpg",
    duration: null,
  },
];

function byDateDesc(a, b) {
  return String(b.date || "").localeCompare(String(a.date || ""));
}

export function getMediaHubItems() {
  return MEDIA_ITEMS_HUB.slice().sort(byDateDesc);
}

export function getFeaturedMediaItem() {
  const items = getMediaHubItems();
  return items.find((m) => m.featured) || items.find((m) => m.platform === "youtube") || items[0] || null;
}

export function getMediaByPlatform(platform) {
  return getMediaHubItems().filter((m) => m.platform === platform);
}

export function getActiveMediaSeries() {
  const cats = new Set(getMediaHubItems().map((m) => m.category));
  return MEDIA_SERIES_DEFS.filter((s) => cats.has(s.category));
}

/** ISO 8601 duration for VideoObject JSON-LD when seconds are known. */
export function iso8601Duration(seconds) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n <= 0) return null;
  const m = Math.floor(n / 60);
  const s = Math.floor(n % 60);
  if (m <= 0) return `PT${s}S`;
  return s > 0 ? `PT${m}M${s}S` : `PT${m}M`;
}
