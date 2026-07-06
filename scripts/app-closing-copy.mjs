/** Unified closing block: headline · philosophy · CTA (3 paragraphs, SubPing style). */

function accentLine2(twoLineHtml) {
  const br = "<br />";
  const i = twoLineHtml.indexOf(br);
  if (i < 0) return twoLineHtml;
  const line1 = twoLineHtml.slice(0, i);
  const line2 = twoLineHtml.slice(i + br.length);
  if (line2.includes("ox-accent")) return twoLineHtml;
  return `${line1}${br}<span class="ox-accent">${line2}</span>`;
}

function closing(headline, philosophy, cta) {
  return `<p>${accentLine2(headline)}</p><p>${philosophy}</p><p>${accentLine2(cta)}</p>`;
}

export const CLOSING_COPY = [
  {
    ns: "ox",
    ko: closing(
      "오늘의 체크가<br />내일의 삶을 바꿉니다",
      "OX MONTH는 단순히 습관을 기록하는 앱이 아니라<br />원하는 삶을 꾸준히 만들어가는 공간입니다.",
      "작은 O 하나가 쌓여<br />더 나은 하루를 만들어갑니다."
    ),
    en: closing(
      "Today's check<br />Changes tomorrow's life",
      "OX MONTH isn't just a habit tracker—<br />it's a space to steadily build the life you want.",
      "Small O marks add up<br />to better days ahead."
    ),
  },
  {
    ns: "sp",
    ko: closing(
      "보이는 지출이<br />지갑을 바꿉니다",
      "SubPing은 지출을 줄이는 앱이 아니라<br />돈의 흐름을 이해하도록 돕는 플랫폼입니다.",
      "매달 반복되는 소비를<br />더 현명하게 관리해보세요."
    ),
    en: closing(
      "When spending is visible,<br />your wallet changes",
      "SubPing isn't built to cut spending—<br />it helps you understand how money flows.",
      "Manage recurring costs<br />more wisely every month."
    ),
  },
  {
    ns: "pm",
    ko: closing(
      "꾸준한 복용이<br />건강한 삶을 만듭니다",
      "Pillmate는 약을 알리는 앱이 아니라<br />건강한 루틴을 만들어가는 플랫폼입니다.",
      "하루의 작은 관리가<br />더 건강한 미래를 만듭니다."
    ),
    en: closing(
      "Steady doses<br />Build a healthier life",
      "Pillmate isn't just a reminder app—<br />it's a platform for healthy routines.",
      "Small daily care<br />creates a healthier future."
    ),
  },
  {
    ns: "sv",
    ko: closing(
      "보이는 소비가<br />더 현명한 선택을 만듭니다",
      "SAVY는 가계부 앱이 아니라<br />돈의 흐름을 이해하도록 돕는 플랫폼입니다.",
      "소비를 이해하는 순간<br />돈 관리가 훨씬 쉬워집니다."
    ),
    en: closing(
      "Visible spending<br />Smarter choices",
      "SAVY isn't a ledger app—<br />it's a platform to understand money flow.",
      "The moment you understand spending,<br />managing money gets easier."
    ),
  },
  {
    ns: "bl",
    ko: closing(
      "아이의 오늘이<br />평생의 추억이 됩니다",
      "BabyLog는 기록을 남기는 앱이 아니라<br />가족의 소중한 순간을 이어가는 공간입니다.",
      "빠르게 지나가는 성장의 시간을<br />오래 기억할 수 있도록 함께합니다."
    ),
    en: closing(
      "Today's moments<br />Become lifelong memories",
      "BabyLog isn't just for logging—<br />it's a space to keep your family's precious moments.",
      "We'll help you remember<br />how quickly they grow."
    ),
  },
  {
    ns: "pl",
    ko: closing(
      "함께한 하루가<br />소중한 추억이 됩니다",
      "PetLog는 반려동물을 관리하는 앱이 아니라<br />함께한 순간을 기록하는 공간입니다.",
      "사랑하는 가족과의 시간을<br />더 오래 기억해보세요."
    ),
    en: closing(
      "Days together<br />Become precious memories",
      "PetLog isn't just pet management—<br />it's a space to record moments together.",
      "Hold on to time with<br />the family you love."
    ),
  },
  {
    ns: "pu",
    ko: closing(
      "작은 절약이<br />더 큰 자유를 만듭니다",
      "PiggyUp은 돈을 아끼는 앱이 아니라<br />현명한 소비 습관을 만드는 플랫폼입니다.",
      "절약은 참는 것이 아니라<br />더 좋은 선택을 하는 경험입니다."
    ),
    en: closing(
      "Small savings<br />More freedom",
      "PiggyUp isn't just about saving money—<br />it's a platform for smarter spending habits.",
      "Saving isn't about deprivation—<br />it's choosing what matters most."
    ),
  },
  {
    ns: "gu",
    ko: closing(
      "작은 목표가<br />더 큰 성장을 만듭니다",
      "GoalUp은 목표를 적는 앱이 아니라<br />꾸준함을 성장으로 바꾸는 플랫폼입니다.",
      "오늘의 작은 실천이<br />미래의 큰 변화를 만들어갑니다."
    ),
    en: closing(
      "Small goals<br />Bigger growth",
      "GoalUp isn't for writing goals—<br />it's a platform that turns consistency into growth.",
      "Today's small steps<br />build tomorrow's big change."
    ),
  },
  {
    ns: "cu",
    ko: closing(
      "기록된 순간이<br />성장의 흔적이 됩니다",
      "CountUp은 숫자를 세는 앱이 아니라<br />나의 변화와 성취를 기록하는 공간입니다.",
      "하루의 작은 기록들이 모여<br />나만의 성장 이야기가 완성됩니다."
    ),
    en: closing(
      "Recorded moments<br />Traces of growth",
      "CountUp isn't just counting—<br />it's a space to record change and achievement.",
      "Small daily logs come together<br />into your growth story."
    ),
  },
  {
    ns: "np",
    ko: closing(
      "하나의 구독이<br />더 많은 가치를 만듭니다",
      "Newon은 여러 앱을 묶은 서비스가 아니라<br />삶을 더 편리하게 만드는 통합 플랫폼입니다.",
      "생산성부터 건강, 금융과 라이프스타일까지.<br />하나의 멤버십으로 더 많은 경험을 만나보세요."
    ),
    en: closing(
      "One membership<br />More value",
      "Newon isn't a bundle of apps—<br />it's an integrated platform for everyday life.",
      "From productivity to health, finance, and lifestyle—<br />discover more with one membership."
    ),
  },
  {
    ns: "nt",
    ko: closing(
      "좋은 문장이<br />오래 남는 생각이 됩니다",
      "Noting은 메모하는 앱이 아니라<br />독서와 사색을 이어가는 공간입니다.",
      "오늘 읽은 한 줄이<br />내일의 나를 바꿉니다."
    ),
    en: closing(
      "Good lines<br />Become lasting thoughts",
      "Noting isn't just note-taking—<br />it's a space to connect reading and reflection.",
      "One line today<br />can change you tomorrow."
    ),
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

export function closingForLang(lang, app) {
  if (lang === "ko") return app.ko;
  return app.en;
}
