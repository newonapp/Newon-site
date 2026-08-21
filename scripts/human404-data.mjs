/** 404: HUMAN page copy + editable world data — scripts/render-404-human.mjs */

export const PLAY_CONFIG_PATH = "/404-human/play-config.js";

/** Timeline years — edit here when lore dates are finalized */
export const fhTimeline = [
  { year: "2048", text: "AI가 인간의 주요 업무를 대체하기 시작합니다." },
  { year: "2061", text: "AI 자율 시스템이 사회 운영의 대부분을 담당합니다." },
  { year: "2074", text: "인간 활동 기록이 급격하게 감소합니다." },
  { year: "2084", text: "HUMAN POPULATION: 0" },
  { year: "UNKNOWN", text: "UNREGISTERED LIFE FORM DETECTED", accent: true },
];

export const fhMeta = [
  { key: "STATUS", valueKey: "status" }, // filled from play-config at runtime / build
  { key: "GENRE", value: "INTERACTIVE SCI-FI" },
  { key: "MODE", value: "SINGLE PLAYER" },
  { key: "PLATFORM", value: "WEB" },
  { key: "EST. PLAYTIME", value: "5–10 MIN" },
];

export const fhKo = {
  lang: "ko",
  htmlLang: "ko",
  ogLocale: "ko_KR",
  homeHref: "/ko/",
  seoTitle: "404: HUMAN | Newon",
  seoDescription:
    "AI만 남은 세상에서 마지막 인간임을 숨기고 탈출하는 선택형 인터랙티브 게임.",
  ogTitle: "404: HUMAN — Human Not Found",
  ogDescription: "AI가 지배하는 세계에서 마지막 인간으로 살아남으세요.",
  brandAria: "404: HUMAN 상단으로",
  navTagline: "AI 생존 · 선택 · 멀티 엔딩",
  badge: "게임 · AI · 선택 · 멀티 엔딩",
  h1: "404: HUMAN",
  subtitleHtml: `AI만 남은 세상에서<br />마지막 인간임을 숨기세요.`,
  heroSummary:
    "인간이 사라지고 AI만 존재하는 미래. 당신은 이 세계에 남아 있는 마지막 인간입니다. AI의 질문과 검문을 통과하면서 정체를 숨기고, 생존과 인간성 사이에서 선택해야 합니다.",
  heroValueLine:
    "AI처럼 행동해야 살아남는다. 하지만 AI처럼 변해버리면, 살아남은 것은 누구인가?",
  heroEmph: "당신의 선택이 결말을 바꿉니다.",
  storeReleaseLine: "WEB · 싱글 플레이어 · 예상 플레이 5–10분",
  playLabel: "게임 시작",
  playCtaFinal: "404: HUMAN 플레이",
  comingSoon: "출시 예정",
  heroLogoAlt: "404: HUMAN 게임 로고",

  glanceTitle: "한눈에 보기",
  glanceLabel: "개요",
  glanceSnapshotEyebrow: "✨ 제품 요약",
  glanceBestForLabel: "🎯 이런 분께",
  glanceBestFor: "심리전과 선택형 스토리 게임을 좋아하는 플레이어",
  glanceSnapshot: "AI에게 인간임을 들키지 마세요.",
  glanceCoreLabel: "🎮 GAMEPLAY",
  glanceCore1: "AI 심문",
  glanceCore2: "선택",
  glanceCore3: "기억",
  glanceCore4: "거짓말",
  glanceCore5: "멀티 엔딩",
  glanceStatusLabel: "📡 STATUS",
  glanceGenreLabel: "🎭 GENRE",
  glanceGenre: "Psychological · Interactive Narrative",
  glanceModeLabel: "🕹️ PLAY STYLE",
  glanceMode: "Single Player",
  glancePlatformLabel: "💻 PLATFORM",
  glancePlatform: "Web",
  glanceTimeLabel: "⏱ EST. PLAYTIME",
  glanceTime: "5–10 MIN",
  glanceTimeNum: "5–10",
  glanceTimeUnit: "MIN",

  hookHtml: `AI처럼 행동해야 살아남는다.<br />하지만 AI처럼 변해버리면, 살아남은 것은 누구인가?`,

  missionLabel: "MISSION",
  missionTitle: "당신의 임무",
  missionHtml: `<p>당신은 인간이 멸종한 것으로 기록된 세계에<br />남아 있는 마지막 인간입니다.</p>
<p>목표는 단 하나.</p>
<p>AI의 감시를 피해<br />인간이라는 사실을 숨기고<br />최종 탈출 지점에 도달하세요.</p>
<p>하지만 모든 선택에는 대가가 있습니다.</p>`,
  missionEmphHtml: `<span class="fh-mission-emph">SURVIVE.<br />HIDE.<br />ESCAPE.</span>`,

  introLabel: "세계관",
  introTitle: "왜 404: HUMAN인가",
  introHtml: `<p class="ox-app-intro__lead"><strong>404: HUMAN</strong>은</p>
<p>AI가 인간을 완전히 대체한 세계를 배경으로 한<br />선택형 인터랙티브 생존 게임입니다.</p>
<p>AI의 감시와 질문을 통과하며 정체를 숨기세요.<br />살아남기 위해 인간성을 포기한다면,<br />그것을 생존이라고 할 수 있을까요?</p>`,
  introClosing: "“AI와 인간을 구분하는 것은 무엇인가?”",

  coreLabel: "CORE IDEA",
  coreTitle: "단순히 정답을 고르는 게임이 아닙니다.",
  core1Title: "01 / AI처럼 생각하기",
  core1Lead: "살아남으려면 AI가 기대하는 답을 찾아야 합니다.",
  core1Note: "너무 감정적이고 인간적인 행동은 의심을 증가시킵니다.",
  core2Title: "02 / 인간성을 지키기",
  core2Lead: "안전한 선택이 항상 좋은 선택은 아닙니다.",
  core2Note: "생존을 위해 인간성을 계속 포기하면 또 다른 결과에 도달할 수 있습니다.",
  core3Title: "03 / 두 수치의 충돌",
  core3Lead: "HUMAN DETECTION과 HUMANITY는 서로 다른 방향으로 플레이어를 압박합니다.",
  core3Note: "“발각되지 않는 것”과 “인간으로 남는 것”은 같은 목표가 아닙니다.",

  loopLabel: "GAME LOOP",
  loopTitle: "의심받고, 선택하고, 살아남으세요.",
  loopSteps: [
    { code: "AI SCAN", desc: "행동과 상태를 감시합니다." },
    { code: "INTERROGATION", desc: "AI가 당신의 판단을 시험합니다." },
    { code: "CHOICE", desc: "제한된 선택 중 하나를 결정합니다." },
    { code: "ANALYSIS", desc: "AI가 답변을 분석합니다." },
    { code: "CONSEQUENCE", desc: "두 핵심 수치와 스토리가 변화합니다." },
    { code: "NEXT SECTOR", desc: "살아남았다면 다음 구역으로 이동합니다." },
  ],

  featuresLabel: "SYSTEM",
  featuresTitle: "주요 게임 시스템",
  feat1Title: "HUMAN DETECTION",
  feat1Lead: "AI가 플레이어를 인간이라고 의심하는 정도입니다.",
  feat1Note: "선택과 행동에 따라 수치가 상승하거나 감소합니다.",
  feat2Title: "HUMANITY",
  feat2Lead: "플레이어가 자신의 인간성을 얼마나 유지하고 있는지 나타냅니다.",
  feat2Note: "생존만을 위한 선택은 HUMANITY를 떨어뜨릴 수 있습니다.",
  feat3Title: "AI INTERROGATION",
  feat3Lead: "AI의 질문과 검문을 통과해야 합니다.",
  feat3Note: "답변에 따라 다음 상황이 달라집니다.",
  feat4Title: "CHOICE-BASED STORY",
  feat4Lead: "선택에 따라 대화와 상황이 변화합니다.",
  feat4Note: "같은 게임도 다른 흐름으로 진행될 수 있습니다.",
  feat5Title: "MULTIPLE ENDINGS",
  feat5Lead: "플레이 결과에 따라 여러 결말에 도달합니다.",
  feat5Note: "결말의 상세는 플레이로만 확인할 수 있습니다.",
  feat6Title: "SURVIVAL",
  feat6Lead: "인간이라는 사실을 들키지 않고 AI 사회에서 탈출하는 것이 목표입니다.",
  feat6Note: "매 선택이 탈출 가능성을 바꿉니다.",

  dualLabel: "SYSTEM",
  dualTitle: "두 개의 수치가 당신을 결정합니다.",
  dual1Code: "METRIC // 01",
  dual1Title: "HUMAN DETECTION",
  dual1Lead: "AI가 당신을 인간으로 의심하는 정도",
  dual1Low: "0%  안전",
  dual1High: "100%  정체 발각",
  dual1Note: "선택과 행동이 이 수치를 움직입니다.",
  dual2Code: "METRIC // 02",
  dual2Title: "HUMANITY",
  dual2Lead: "당신에게 남아 있는 인간성",
  dual2Low: "낮음  동화",
  dual2High: "높음  인간다움",
  dual2Note: "생존만을 위한 선택은 이 수치를 떨어뜨릴 수 있습니다.",
  dualFoot: "두 수치는 동시에 게임의 결말에 영향을 미칩니다.",
  dualVs: "VS",

  previewLabel: "PREVIEW",
  previewTitle: "모든 대답은 분석됩니다.",
  previewCode: "AI INTERROGATION // 03",
  previewQ: "동료를 구하기 위해 자신의 생존 확률을 낮추는 행동은 합리적입니까?",
  previewA: "아니오. 생존 확률을 최대화해야 합니다.",
  previewB: "상황에 따라 판단해야 합니다.",
  previewC: "누군가를 살릴 수 있다면 위험을 감수할 수 있습니다.",
  previewFoot: "EVERY RESPONSE IS BEING ANALYZED.",

  worldLabel: "WORLD",
  worldTitle: "인간이 사라진 이후",

  scenarioLabel: "SCENARIO",
  scenarioTitle: "플레이 중 마주하게 될 선택",
  sc1Code: "LOG // 01",
  sc1Tag: "AI",
  sc1Quote: "감정은 효율적인 판단에 필요합니까?",
  sc1Meta: "답변 하나가 HUMAN DETECTION 수치를 변화시킵니다.",
  sc2Code: "LOG // 02",
  sc2Tag: "AI",
  sc2Quote: "당신은 타인을 위해 손해를 감수할 수 있습니까?",
  sc2Meta: "생존과 인간성 사이에서 선택해야 합니다.",
  sc3Code: "LOG // 03",
  sc3Tag: "SYSTEM",
  sc3Quote: "UNREGISTERED LIFE FORM DETECTED",
  sc3Meta: "AI의 의심이 높아질수록 검문은 더 어려워집니다.",
  sc4Code: "LOG // 04",
  sc4Tag: "WARNING",
  sc4Quote: "FINAL CHOICE",
  sc4Meta: "마지막 선택에 따라 서로 다른 결말에 도달합니다.",

  endingLabel: "ENDING",
  endingTitle: "당신의 선택에는 결과가 있습니다.",
  end1Code: "ENDING // 01",
  end1Name: "DETECTED",
  end2Code: "ENDING // 02",
  end2Name: "ASSIMILATED",
  end3Code: "ENDING // 03",
  end3Name: "ESCAPE",
  end1Lock: "CLASSIFIED",
  end2Lock: "DATA LOCKED",
  end3Lock: "CLASSIFIED",
  endingFoot: "결말 3가지",
  endingFootSub: "당신의 선택은 기억됩니다.",

  recoTitle: "이런 플레이를 좋아한다면",
  reco1: "선택에 따라 이야기가 달라지는 게임",
  reco2: "짧지만 강한 스토리 게임",
  reco3: "AI와 미래 사회를 다룬 세계관",
  reco4: "멀티 엔딩을 찾는 플레이",
  reco5: "심리적인 선택이 중요한 게임",
  reco6: "디스토피아 SF 분위기",
  reco7: "반복 플레이로 다른 결말을 찾는 게임",

  noteLabel: "CREATOR'S NOTE",
  noteTitle: "왜 이 게임을 만들었는가",
  noteHtml: `<p>AI가 글을 쓰고,<br />이미지를 만들고,<br />코드를 작성하는 시대.</p>
<p>기술이 인간의 능력을 하나씩 닮아갈수록<br />반대로 이런 질문이 생겼습니다.</p>
<p class="fh-note-quote">“그렇다면 마지막까지 인간을<br />인간답게 만드는 것은 무엇일까?”</p>
<p>404: HUMAN은 이 질문에서 시작했습니다.</p>
<p>AI와 싸우는 게임이 아니라,<br />AI처럼 행동해야 살아남을 수 있는 상황을 통해<br />플레이어 스스로 인간다움의 의미를 선택하게 만드는 게임입니다.</p>`,
  noteClosing: "WHAT MAKES YOU HUMAN?",

  creditLabel: "DEVELOPMENT",
  creditTitle: "Project credits",
  creditRows: [
    { key: "PROJECT", value: "404: HUMAN" },
    { key: "CREATOR", value: "Nawon Kyung" },
    { key: "STUDIO", value: "Newon" },
    { key: "ROLE", value: "Planning · Game Design · UI/UX · Development" },
    { key: "TECH", value: "Flutter Web" },
    { key: "DEVELOPMENT", value: "AI-assisted development" },
  ],

  showcaseLabel: "GAMEPLAY PREVIEW",
  showcaseTitle: "플레이 화면",
  showcaseHiddenNote: "",

  ctaKicker: "HUMAN POPULATION: 0",
  ctaLine: "ONE UNREGISTERED LIFE FORM REMAINS.",
  ctaSubHtml: "",
  ctaAsk: "ARE YOU HUMAN?",

  footerRights: "© 404: HUMAN ·",
  privacy: "개인정보처리방침",
  terms: "이용약관",
  skip: "본문으로 건너뛰기",
  appsLabel: "Newon의 앱",
  appsAria: "Newon 앱",
  language: "언어",
  themeToLight: "라이트 모드로 전환",
  themeToDark: "다크 모드로 전환",
  themeToggle: "테마 전환",
  menuOpen: "메뉴 열기",
  newonLink: "Newon",
  socialAria: "Newon 소셜",
  emailAria: "이메일 보내기",
  instagramAria: "Instagram (새 탭)",
  youtubeAria: "YouTube (새 탭)",
  blogAria: "네이버 블로그 (새 탭)",
  tiktokAria: "TikTok (새 탭)",
  instagramUrl: "https://www.instagram.com/newon.app/",
  youtubeUrl: "https://www.youtube.com/@newonapp",
};

/** English page copy */
export const fhEn = {
  ...fhKo,
  lang: "en",
  htmlLang: "en",
  ogLocale: "en_US",
  homeHref: "/en/",
  seoTitle: "404: HUMAN | Newon",
  seoDescription:
    "A choice-driven interactive game where you hide that you are the last human in a world ruled by AI.",
  ogTitle: "404: HUMAN — Human Not Found",
  ogDescription: "Survive as the last human in a world ruled by AI.",
  brandAria: "Back to top of 404: HUMAN",
  navTagline: "AI survival · Choices · Multiple endings",
  badge: "Game · AI · Choices · Multiple endings",
  subtitleHtml: `Hide that you are the last human<br />in a world where only AI remains.`,
  heroSummary:
    "A future where humans are gone and only AI remains. You are the last human left in this world. Pass AI questions and inspections, hide your identity, and choose between survival and humanity.",
  heroValueLine:
    "Act like AI to survive. But if you become like AI, who is it that survives?",
  heroEmph: "Your choices change the ending.",
  storeReleaseLine: "WEB · Single player · Est. playtime 5–10 min",
  heroLogoAlt: "404: HUMAN game logo",

  glanceTitle: "At a glance",
  glanceBestFor: "Players who love psychological tension and choice-driven story games",
  glanceSnapshot: "Don’t let AI discover you are human.",
  glanceCore1: "AI interrogation",
  glanceCore2: "Choices",
  glanceCore3: "Memory",
  glanceCore4: "Deception",
  glanceCore5: "Multiple endings",

  hookHtml: `Act like AI to survive.<br />But if you become like AI, who is it that survives?`,

  missionTitle: "Your mission",
  missionHtml: `<p>You are the last human remaining<br />in a world recorded as extinct of humans.</p>
<p>There is only one goal.</p>
<p>Evade AI surveillance,<br />hide that you are human,<br />and reach the final escape point.</p>
<p>But every choice has a cost.</p>`,

  introLabel: "World",
  introTitle: "Why 404: HUMAN",
  introHtml: `<p class="ox-app-intro__lead"><strong>404: HUMAN</strong> is</p>
<p>a choice-driven interactive survival game<br />set in a world where AI has fully replaced humans.</p>
<p>Pass AI surveillance and questions while hiding who you are.<br />If you abandon humanity to survive,<br />can you still call that survival?</p>`,
  introClosing: "“What separates AI from humans?”",

  coreTitle: "This is not a game of simply picking the right answer.",
  core1Title: "01 / Think like AI",
  core1Lead: "To survive, you must find the answers AI expects.",
  core1Note: "Overly emotional, human behavior raises suspicion.",
  core2Title: "02 / Keep your humanity",
  core2Lead: "The safest choice is not always the best choice.",
  core2Note: "Keep abandoning humanity for survival and you may reach a different outcome.",
  core3Title: "03 / Two metrics in conflict",
  core3Lead: "HUMAN DETECTION and HUMANITY push the player in opposite directions.",
  core3Note: "“Not being caught” and “staying human” are not the same goal.",

  loopTitle: "Be suspected, choose, and survive.",
  loopSteps: [
    { code: "AI SCAN", desc: "Your actions and state are monitored." },
    { code: "INTERROGATION", desc: "AI tests your judgment." },
    { code: "CHOICE", desc: "You decide among limited options." },
    { code: "ANALYSIS", desc: "AI analyzes your answer." },
    { code: "CONSEQUENCE", desc: "Two core metrics and the story shift." },
    { code: "NEXT SECTOR", desc: "If you survive, you move to the next sector." },
  ],

  featuresTitle: "Core game systems",
  feat1Lead: "How strongly AI suspects the player is human.",
  feat1Note: "Choices and actions raise or lower the metric.",
  feat2Lead: "How much of your humanity you still keep.",
  feat2Note: "Choices made only for survival can lower HUMANITY.",
  feat3Lead: "You must pass AI questions and inspections.",
  feat3Note: "Your answers change what happens next.",
  feat4Lead: "Dialogue and situations change with your choices.",
  feat4Note: "The same game can follow different paths.",
  feat5Lead: "Different play results lead to different endings.",
  feat5Note: "Ending details can only be seen by playing.",
  feat6Lead: "Escape AI society without being exposed as human.",
  feat6Note: "Every choice changes your chance of escape.",

  dualTitle: "Two metrics decide who you become.",
  dual1Lead: "How strongly AI suspects you are human",
  dual1Low: "0%  Safe",
  dual1High: "100%  Identity exposed",
  dual1Note: "Your choices and actions move this metric.",
  dual2Lead: "The humanity you still have left",
  dual2Low: "Low  Assimilation",
  dual2High: "High  Humanity",
  dual2Note: "Choices made only for survival can lower this metric.",
  dualFoot: "Both metrics shape the ending at the same time.",

  previewTitle: "Every answer is analyzed.",
  previewQ: "Is it rational to lower your own survival odds to save a colleague?",
  previewA: "No. Survival probability must be maximized.",
  previewB: "It depends on the situation.",
  previewC: "If someone can be saved, taking the risk can be justified.",

  worldTitle: "After humans disappeared",

  scenarioTitle: "Choices you will face while playing",
  sc1Quote: "Are emotions necessary for efficient judgment?",
  sc1Meta: "A single answer can change the HUMAN DETECTION metric.",
  sc2Quote: "Can you accept a loss for someone else’s sake?",
  sc2Meta: "You must choose between survival and humanity.",
  sc3Meta: "As AI suspicion rises, inspections get harder.",
  sc4Meta: "Your final choice leads to different endings.",

  endingTitle: "Your choices have consequences.",

  recoTitle: "If you like this kind of play",
  reco1: "Games where choices reshape the story",
  reco2: "Short but intense story games",
  reco3: "Worlds about AI and future society",
  reco4: "Hunting for multiple endings",
  reco5: "Games where psychological choices matter",
  reco6: "Dystopian sci-fi atmosphere",
  reco7: "Replayability to find other endings",

  noteTitle: "Why this game was made",
  noteHtml: `<p>An era where AI writes,<br />makes images,<br />and writes code.</p>
<p>As technology mirrors human ability piece by piece,<br />the opposite question appeared.</p>
<p class="fh-note-quote">“Then what makes a human<br />human to the very end?”</p>
<p>404: HUMAN started from that question.</p>
<p>It is not a game about fighting AI.<br />It puts you in a situation where you must act like AI to survive,<br />so you choose for yourself what humanity means.</p>`,

  creditRows: [
    { key: "PROJECT", value: "404: HUMAN" },
    { key: "CREATOR", value: "Nawon Kyung" },
    { key: "STUDIO", value: "Newon" },
    { key: "ROLE", value: "Planning · Game Design · UI/UX · Development" },
    { key: "TECH", value: "Flutter Web" },
    { key: "DEVELOPMENT", value: "AI-assisted development" },
  ],

  showcaseTitle: "Gameplay screens",

  privacy: "Privacy Policy",
  terms: "Terms of Service",
  skip: "Skip to content",
  appsLabel: "Newon apps",
  appsAria: "Newon apps",
  language: "Language",
  themeToLight: "Switch to light mode",
  themeToDark: "Switch to dark mode",
  themeToggle: "Toggle theme",
  menuOpen: "Open menu",
  socialAria: "Newon social",
  emailAria: "Send email",
  instagramAria: "Instagram (opens in a new tab)",
  youtubeAria: "YouTube (opens in a new tab)",
  blogAria: "Naver Blog (opens in a new tab)",
  tiktokAria: "TikTok (opens in a new tab)",
};

export const fhTimelineEn = [
  { year: "2048", text: "AI begins replacing major human jobs." },
  { year: "2061", text: "Autonomous AI systems run most of society." },
  { year: "2074", text: "Records of human activity drop sharply." },
  { year: "2084", text: "HUMAN POPULATION: 0" },
  { year: "UNKNOWN", text: "UNREGISTERED LIFE FORM DETECTED", accent: true },
];

export const FH_OG_LOCALE = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  es: "es_ES",
  "pt-br": "pt_BR",
  fr: "fr_FR",
  de: "de_DE",
  hi: "hi_IN",
  id: "id_ID",
};

export const FH_HTML_LANG = {
  ko: "ko",
  en: "en",
  ja: "ja",
  es: "es",
  "pt-br": "pt-BR",
  fr: "fr",
  de: "de",
  hi: "hi",
  id: "id",
};
