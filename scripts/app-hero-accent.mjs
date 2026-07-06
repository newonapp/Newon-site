/** Hero subtitle point lines with ox-accent highlighter. */

export const HERO_SUBTITLE = [
  {
    ns: "ox",
    ko: '<span class="ox-accent">작은 기록이 큰 변화를 만듭니다</span>',
    en: '<span class="ox-accent">Small logs create big change</span>',
  },
  {
    ns: "sp",
    ko: '<span class="ox-accent">구독을 관리하면,<br />돈이 남습니다</span>',
    en: '<span class="ox-accent">Manage subscriptions—<br />keep more money</span>',
  },
  {
    ns: "pm",
    ko: '<span class="ox-accent">오늘의 복용을 더 쉽고<br />꾸준하게 이어가세요</span>',
    en: '<span class="ox-accent">Make today\'s doses easier<br />and stay consistent</span>',
  },
  {
    ns: "sv",
    ko: '<span class="ox-accent">돈의 흐름을 한눈에 확인하세요</span>',
    en: '<span class="ox-accent">See your money flow at a glance</span>',
  },
  {
    ns: "bl",
    ko: '<span class="ox-accent">아이의 모든 순간을 하나의 이야기로 기록하세요</span>',
    en: '<span class="ox-accent">Turn every moment into one growth story</span>',
  },
  {
    ns: "pl",
    ko: '<span class="ox-accent">반려동물의 모든 순간을<br />하나의 이야기로 기록하세요</span>',
    en: '<span class="ox-accent">Turn every pet moment into<br />one life story</span>',
  },
  {
    ns: "pu",
    ko: '<span class="ox-accent">작은 절약이 모여 더 큰 변화를 만듭니다</span>',
    en: '<span class="ox-accent">Small savings add up to bigger change</span>',
  },
  {
    ns: "gu",
    ko: '<span class="ox-accent">작은 목표가 모여 더 큰 성장을 만듭니다</span>',
    en: '<span class="ox-accent">Small goals add up to bigger growth</span>',
  },
  {
    ns: "cu",
    ko: '<span class="ox-accent">작은 기록이 모여<br />더 큰 변화를 만듭니다</span>',
    en: '<span class="ox-accent">Small logs add up to<br />bigger change</span>',
  },
  {
    ns: "nt",
    ko: '<span class="ox-accent">좋은 문장을 오래 기억하세요</span>',
    en: '<span class="ox-accent">Remember good sentences longer</span>',
  },
  {
    ns: "np",
    ko: '<span class="ox-accent">하나의 계정으로<br />모든 Newon 서비스를 이용하세요</span>',
    en: '<span class="ox-accent">One account for<br />all Newon services</span>',
  },
];

export function subtitleForLang(lang, app) {
  if (lang === "ko") return app.ko;
  return app.en;
}

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

export const SP_FILE_BY_LANG = {
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
