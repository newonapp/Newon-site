/** BabyLog-style hero pills: primary badge (emoji + keywords) + secondary dashed badge. */

export const HERO_BADGE_APPS = [
  {
    ns: "ox",
    ko: {
      badge: "🚀 습관 관리 · 월간 기록 · O/X 체크",
      globalReachBadge: "매일 한 번 체크 · 177개국 서비스",
    },
    en: {
      badge: "🚀 Habit tracking · Monthly logs · O/X check",
      globalReachBadge: "One check a day · 177 countries",
    },
  },
  {
    ns: "sp",
    ko: {
      badge: "🔔 구독 관리 · 정기 지출 · 결제 알림 · 소비 인사이트",
      globalReachBadge: "반복 지출부터 · 전 세계 서비스",
    },
    en: {
      badge: "🔔 Subscriptions · Recurring bills · Payment alerts · Spending insights",
      globalReachBadge: "From recurring costs · Worldwide service",
    },
  },
  {
    ns: "pm",
    ko: {
      badge: "💊 복약 알림 · 건강 기록 · 가족 공유 · 데일리 루틴",
      globalReachBadge: "오늘의 복용부터 · 전 세계 서비스",
    },
    en: {
      badge: "💊 Med reminders · Health logs · Family sharing · Daily routine",
      globalReachBadge: "From today's dose · Worldwide service",
    },
  },
  {
    ns: "sv",
    ko: {
      badge: "💳 지출 관리 · 수입 기록 · 구독 관리 · AI 분석",
      globalReachBadge: "돈의 흐름부터 · 전 세계 서비스",
    },
    en: {
      badge: "💳 Spending · Income · Subscriptions · AI analysis",
      globalReachBadge: "From money flow · Worldwide service",
    },
  },
  {
    ns: "bl",
    ko: {
      badge: "👶 육아 기록 · 성장 관리 · 가족 공유 · AI 분석",
      globalReachBadge: "임신부터 성장까지 · 전 세계 서비스",
    },
    en: {
      badge: "👶 Childcare logs · Growth · Family sharing · AI analysis",
      globalReachBadge: "From pregnancy to growth · Worldwide service",
    },
  },
  {
    ns: "pl",
    ko: {
      badge: "🐾 반려동물 기록 · 건강 관리 · 가족 공유 · AI 분석",
      globalReachBadge: "반려 생활을 하나의 앱으로",
    },
    en: {
      badge: "🐾 Pet logs · Health · Family sharing · AI analysis",
      globalReachBadge: "One app for everyday life with pets",
    },
  },
  {
    ns: "pu",
    ko: {
      badge: "💰 절약 습관 · 소비 분석 · AI 절약 코치",
      globalReachBadge: "작은 절약부터 · 전 세계 서비스",
    },
    en: {
      badge: "💰 Saving habits · Spending analysis · AI savings coach",
      globalReachBadge: "From small savings · Worldwide service",
    },
  },
  {
    ns: "gu",
    ko: {
      badge: "🎯 목표 관리 · 챌린지 · AI 성장 코치",
      globalReachBadge: "작은 목표부터 · 전 세계 서비스",
    },
    en: {
      badge: "🎯 Goal tracking · Challenges · AI growth coach",
      globalReachBadge: "From small goals · Worldwide service",
    },
  },
  {
    ns: "cu",
    ko: {
      badge: "🔢 카운트 기록 · 목표 추적 · AI 인사이트",
      globalReachBadge: "작은 기록부터 · 전 세계 서비스",
    },
    en: {
      badge: "🔢 Count tracking · Goal progress · AI insights",
      globalReachBadge: "From small counts · Worldwide service",
    },
  },
  {
    ns: "nt",
    ko: {
      badge: "📚 필사 기록 · 독서 노트 · 명언 저장",
      globalReachBadge: "독서 기록부터 · 전 세계 서비스",
    },
    en: {
      badge: "📚 Transcription · Reading notes · Quote saving",
      globalReachBadge: "From reading logs · Worldwide service",
    },
  },
  {
    ns: "np",
    ko: {
      badge: "📦 Newon Membership · 통합 계정 · 앱 허브",
      globalReachBadge: "하나의 구독으로 · 177개국 서비스",
    },
    en: {
      badge: "📦 Newon Membership · Unified account · App hub",
      globalReachBadge: "One membership · 177 countries",
    },
  },
];

export const DATA_FILE_BY_NS = {
  pm: "pm-data.mjs",
  sv: "savy-data.mjs",
  bl: "babylog-data.mjs",
  pl: "petlog-data.mjs",
  pu: "piggyup-data.mjs",
  gu: "goalup-data.mjs",
  cu: "countup-data.mjs",
  nt: "noting-data.mjs",
  np: "newon-plus-data.mjs",
};

const SP_FILE_BY_LANG = {
  ko: "_sp.ko.json",
  en: "_sp.en.json",
  ja: "_sp.ja.json",
  es: "_sp.es.json",
  "pt-br": "_sp.pt-br.json",
  fr: "_sp.fr.json",
  de: "_sp.de.json",
  hi: "_sp.hi.json",
  id: "_sp.id.json",
};

export { SP_FILE_BY_LANG };

/** Fallback for ja, es, … — keeps emoji; uses EN copy until translated. */
export function badgesForLang(lang, app) {
  if (lang === "ko") return app.ko;
  if (lang === "en") return app.en;
  return app.en;
}
