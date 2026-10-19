const SITE_LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

function langFromPath(pathname: string) {
  const m = /^\/([a-z]{2}(?:-[a-z]{2})?)(\/|$)/.exec(pathname);
  return m && SITE_LANGS.includes(m[1]) ? m[1] : "";
}

function parentLang() {
  try {
    return langFromPath(window.parent.location.pathname);
  } catch {
    return "";
  }
}

const pageLang = parentLang() || langFromPath(window.location.pathname);

export const isKo = pageLang === "ko" || new URLSearchParams(window.location.search).get("lang") === "ko";

/** Locale folder for site links: the parent page's language (all site pages exist in 9 locales). */
export const langDir = isKo ? "ko" : pageLang || "en";

export function siteHref(path: string) {
  return `/${langDir}/${path.replace(/^\//, "")}`;
}

export type Row = { n: string; title: string; body: string[]; links?: { label: string; href: string; external?: boolean }[] };
export type Step = { title: string; body: string };
export type Stat = { value: string; label: string; note: string };
export type PanelItem = { number: string; name: string; body: string[]; link?: { label: string; href: string } };
export type PlatformCopy = { id: string; type: string; name: string; summary: string; role: string; slogan: string[]; lead: string };

const STORE = {
  babylog: {
    ios: "https://apps.apple.com/kr/app/babylog-%EC%8A%A4%EB%A7%88%ED%8A%B8%ED%95%9C-ai-%EC%9C%A1%EC%95%84-%EA%B8%B0%EB%A1%9D/id6768019196",
    android: "https://play.google.com/store/apps/details?id=com.newon.babylog&pcampaignid=web_share",
  },
  petlog: {
    ios: "https://apps.apple.com/kr/app/petlog-%EC%8A%A4%EB%A7%88%ED%8A%B8%ED%95%9C-ai-%EB%B0%98%EB%A0%A4-%EA%B8%B0%EB%A1%9D/id6770971033",
    android: "https://play.google.com/store/apps/details?id=com.newon.petlog&pcampaignid=web_share",
  },
  myworld: {
    ios: "https://apps.apple.com/kr/app/my-world-%EC%97%AC%ED%96%89%EC%A7%80%EB%8F%84-%EB%B0%A9%EB%AC%B8%EA%B5%AD%EA%B0%80/id6792314945",
    android: "https://play.google.com/store/apps/details?id=com.newon.myworld&pcampaignid=web_share",
  },
  "ox-month": {
    ios: "https://apps.apple.com/kr/app/ox-month-ai-%EC%8A%B5%EA%B4%80-%EA%B4%80%EB%A6%AC/id6767996492",
    android: "https://play.google.com/store/apps/details?id=com.newon.ox.month&pcampaignid=web_share",
  },
  goalup: {
    ios: "https://apps.apple.com/kr/app/goalup-ai-%EB%AA%A9%ED%91%9C-%EA%B4%80%EB%A6%AC-%EC%B1%8C%EB%A6%B0%EC%A7%80/id6780510853",
    android: "https://play.google.com/store/apps/details?id=goalup.newon.app&pcampaignid=web_share",
  },
  countup: {
    ios: "https://apps.apple.com/kr/app/countup-%EC%B9%B4%EC%9A%B4%ED%8A%B8-%EB%AA%A9%ED%91%9C-%EA%B4%80%EB%A6%AC/id6786910628",
    android: "https://play.google.com/store/apps/details?id=com.newon.countup&pcampaignid=web_share",
  },
  savy: {
    ios: "https://apps.apple.com/kr/app/savy-%EC%8A%A4%EB%A7%88%ED%8A%B8-ai-%EA%B0%80%EA%B3%84%EB%B6%80/id6768017037",
    android: "https://play.google.com/store/apps/details?id=com.newon.savy&pcampaignid=web_share",
  },
  subping: {
    ios: "https://apps.apple.com/kr/app/subping-%EA%B5%AC%EB%8F%85-%EA%B4%80%EB%A6%AC/id6768013033",
    android: "https://play.google.com/store/apps/details?id=com.newon.subping&pcampaignid=web_share",
  },
  piggyup: {
    ios: "https://apps.apple.com/kr/app/piggyup-ai-%EC%A0%88%EC%95%BD-%EA%B4%80%EB%A6%AC-%EC%B1%8C%EB%A6%B0%EC%A7%80/id6772744969",
    android: "https://play.google.com/store/apps/details?id=com.newon.piggyup&pcampaignid=web_share",
  },
  pillmate: {
    ios: "https://apps.apple.com/kr/app/pillmate-%EC%8A%A4%EB%A7%88%ED%8A%B8%ED%95%9C-%EB%B3%B5%EC%95%BD-%EC%95%8C%EB%A6%BC/id6768017347",
    android: "https://play.google.com/store/apps/details?id=com.newon.pill.mate&pcampaignid=web_share",
  },
  "newon-plus": {
    ios: "",
    android: "https://play.google.com/store/apps/details?id=com.newon.newon&pcampaignid=web_share",
  },
} as const;

type StoreSlug = keyof typeof STORE;

function productLinks(slug: string, detail: string, store?: StoreSlug) {
  const links: { label: string; href: string; external?: boolean }[] = [{ label: detail, href: siteHref(`portfolio/${slug}/`) }];
  if (store && STORE[store].ios) links.push({ label: "App Store ↗", href: STORE[store].ios, external: true });
  if (store && STORE[store].android) links.push({ label: "Google Play ↗", href: STORE[store].android, external: true });
  return links;
}

/* Marquee film plates (unchanged strip under the hero). */
const filmSlogans = [
  ["Everyday apps you need,", "in one Newon."],
  ["Closer AI,", "for your everyday life."],
  ["At every stage of life,", "the next thing you need."],
  ["Warm connection,", "through the years of daily life."],
  ["Expanding what business can do,", "with technology."],
  ["From idea to reality,", "from experience to new value."],
  ["In a world of AI,", "hide that you are the last human."],
];

const en = {
  htmlLang: "en",
  title: "Portfolio — NEWON",
  heroTitle: "Hi, i'm nawon",
  viewWork: "View my work",
  contactMe: "Contact me",
  selectedWork: "Selected work",
  portraitAlt: "Nawon",
  filmSlogans,

  /* 01 · HERO statement */
  introHeading: "Our work",
  introText:
    "From ideas to products, from products to everyday change. These are the digital platforms and products NEWON plans and builds itself — problems found in everyday life, turned into real services that open new possibilities.",
  introCta: "See the six platforms",

  /* 02 · PORTFOLIO OVERVIEW */
  overviewHeading: "Overview",
  overviewTitle: "Many problems, each solved as one product experience.",
  overviewLead:
    "Everything here is a product NEWON owns, plans and builds itself. Nothing on this page is client work or a commissioned project.",
  overview: [
    { number: "01", name: "Six core platforms", body: ["BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON and ONGIL. Six areas of daily life — parenting, pets, travel, sharing, life stages and senior life — each run as its own platform."] },
    { number: "02", name: "Standalone apps", body: ["Mobile apps that each focus on one everyday problem in habits and goals, money or health: OX MONTH, GoalUp, CountUp, SAVY, SubPing, PiggyUp, Pillmate and the membership app Newon+."], link: { label: "All NEWON apps →", href: siteHref("apps/") } },
    { number: "03", name: "Digital software", body: ["Free web tools such as a QR code generator, a D-day calculator and a character counter that run in the browser with no install or sign-up."], link: { label: "Newon Tools →", href: siteHref("tools/") } },
    { number: "04", name: "Games", body: ["404: HUMAN is a choice-driven interactive game about surviving as the last human in an AI-only world, playable on the web."], link: { label: "Newon Games →", href: siteHref("games/") } },
    { number: "05", name: "Studio digital products", body: ["NEWON Studio plans templates, productivity tools, software and standard business products. The free web tools and the NEWON Project Starter Kit are available today; the other product families are still being planned."] },
    { number: "06", name: "Building and shipping products", body: ["NEWON planned, designed and built 11 mobile apps and released them on the App Store and Google Play, and keeps updating them after launch."] },
  ] as PanelItem[],

  /* 03 · SIX CORE PLATFORMS */
  platformsHeading: "Platforms",
  platformsTitle: "Six areas of everyday life, connected.",
  platformsLead:
    "Each platform focuses on one area of life. The status on every card follows the platform's own page: three apps are released, LIVON is free on the web, ONGIL is a web preview, and the SHAREON, LIVON and ONGIL apps are in preparation.",
  platformCta: "View platform",
  platforms: [
    {
      id: "babylog",
      type: "App released · iOS · Android",
      name: "BABYLOG",
      summary:
        "Parenting & family. From preparing for pregnancy to birth, parenting, growth records and family life, BABYLOG brings a child's and a family's records together instead of leaving them scattered across notes, photos and chats.",
      role: "For parents-to-be, families raising children and carers · Parenting records · Growth & health · Family sharing",
      slogan: ["Every moment of your child,", "as one growth story."],
      lead: "Today the iOS and Android app offers parenting records, growth and health records, schedules and family sharing. Partnerships in education and care are a future direction.",
    },
    {
      id: "petlog",
      type: "App released · iOS · Android",
      name: "PETLOG",
      summary:
        "Pet life. PETLOG reduces the problem of a pet's daily life, health history and vet dates being split across different owners in the same family.",
      role: "For pet owners and their families · Daily & health records · Vaccination & vet schedules · Shared family care",
      slogan: ["A pet's day and health,", "recorded together as a family."],
      lead: "Today the PETLOG app offers profiles, daily and health records, vaccination and vet schedules and shared family care. Pet life information and a community are in preparation.",
    },
    {
      id: "myworld",
      type: "App released · iOS · Android",
      name: "MY WORLD",
      summary:
        "Travel. Discovery, planning, booking, records and sharing are spread across many services. MY WORLD starts with the record: the countries and cities you have visited, on a world map.",
      role: "For travellers · World-map travel records · Routes & photos · Travel stats · AI travel report",
      slogan: ["Every place you have been,", "on your own world map."],
      lead: "Today the MY WORLD app records visited countries and cities, routes and photos, travel stats and an AI travel report. Booking, commerce and a traveller community are being prepared in stages.",
    },
    {
      id: "shareon",
      type: "App in preparation",
      name: "SHAREON",
      summary:
        "Sharing & rental. Things used rarely but too costly to buy, and equipment and spaces that sit idle. SHAREON aims to connect people who want to borrow for just the time they need with individuals and businesses that own them.",
      role: "For borrowers and owners of items, equipment and spaces · Items · Equipment · Spaces · Mobility",
      slogan: ["Borrow only what you need,", "share what you are not using."],
      lead: "The SHAREON app has not launched: no real rentals, confirmed bookings, payments, deposits or settlements run today. The first launch is being prepared around rentals and spaces with approval-based booking.",
    },
    {
      id: "livon",
      type: "Free on the web · App in preparation",
      name: "LIVON",
      summary:
        "Life stage. Education, careers, jobs, military service, money, housing, marriage, birth, health, welfare and retirement information is scattered. LIVON starts from your current life stage, from the teens to 70 and over.",
      role: "For people from their teens to 70+ · Life-stage information · Public programmes · Life records",
      slogan: ["At every stage of life,", "the next thing you need."],
      lead: "LIVON is free on the web today with no sign-up, and public programmes are shown with their official source and reference date. The LIVON app is in preparation.",
    },
    {
      id: "ongil",
      type: "Web preview · App in preparation for Korea",
      name: "ONGIL",
      summary:
        "Senior life. ONGIL connects everyday information, family connection and care and welfare information so seniors can carry on their lives at their own pace.",
      role: "For seniors and their families · Daily life · Health records · Family connection · Care & welfare guides",
      slogan: ["Warm connection,", "through the years of daily life."],
      lead: "Some features run today as a web preview that needs no sign-in and stores data on this device only. The iOS and Android app is being prepared for its first release in Korea; no institution has a confirmed partnership yet.",
    },
  ] as PlatformCopy[],

  /* 04 · OUR PRODUCTS */
  productsHeading: "Products",
  productsTitle: "Products we built and keep improving.",
  productsLead:
    "Release status is taken from the store links on each product page. Released means the app has an App Store or Google Play listing; in preparation means there is no store listing yet.",
  products: [
    { n: "01", title: "BabyLog", body: ["A growth-record app from pregnancy to the teen years. It replaces parenting records scattered across notes, photos and chats with one timeline.", "Parenting records · Growth & health · Schedules · Growth stats · Family sharing · AI parenting insights", "iOS · Android · Released — the base of the BABYLOG platform"], links: productLinks("babylog", "Product page →", "babylog") },
    { n: "02", title: "PetLog", body: ["A pet-record app for daily life, health and memories. Meals, walks, health records and vet dates are kept in one record the family shares.", "Meal & walk logs · Health records · Schedules · Stats · Family sharing · AI health insights", "iOS · Android · Released — the base of the PETLOG platform"], links: productLinks("petlog", "Product page →", "petlog") },
    { n: "03", title: "My World", body: ["A travel-record app that marks visited countries and cities on a world map, so visits, itineraries and photos stay in one place.", "Travel map · Visited countries · Itineraries · Travel journal · Travel stats · AI travel report", "iOS · Android · Released — the base of the MY WORLD platform"], links: productLinks("myworld", "Product page →", "myworld") },
    { n: "04", title: "OX MONTH", body: ["A monthly habit app built on one O/X check a day, for people who want to keep going without a heavy tracking app.", "Today's check · Monthly calendar · Goals · Quick start · Stats · Reminders · Widgets", "iOS · Android · Released"], links: productLinks("ox-month", "Product page →", "ox-month") },
    { n: "05", title: "GoalUp", body: ["A goal app from setting goals to carrying them out, so goals do not stop at the plan.", "Goal management · Challenges · Goal reminders · Growth analysis · Streaks · AI growth insights", "iOS · Android · Released"], links: productLinks("goalup", "Product page →", "goalup") },
    { n: "06", title: "CountUp", body: ["A counting app that turns repeated actions — workouts, study, reading, quitting smoking — into numbers and a visible trend.", "Count logging · Goals · Streaks · Milestones · Charts · AI insights", "iOS · Android · Released"], links: productLinks("countup", "Product page →", "countup") },
    { n: "07", title: "SAVY", body: ["A money app that brings spending, income and subscriptions together when they are scattered across apps and card statements.", "Expenses · Income · Subscriptions · Spending analysis · Smart alerts · AI spending insights", "iOS · Android · Released"], links: productLinks("savy", "Product page →", "savy") },
    { n: "08", title: "SubPing", body: ["A subscription app for every recurring charge — streaming, phone bills, insurance, rent, tuition — so no payment is missed.", "Recurring charges · Payment reminders · Spending insights · Widgets", "iOS · Android · Released"], links: productLinks("subping", "Product page →", "subping") },
    { n: "09", title: "PiggyUp", body: ["A saving-habit app: log daily spending lightly, spot where money leaks and turn it into savings goals.", "Spending log · Savings goals · Savings alerts · Spending analysis · Goal progress · AI savings insights", "iOS · Android · Released"], links: productLinks("piggyup", "Product page →", "piggyup") },
    { n: "10", title: "Pillmate", body: ["A medication app for pills, supplements and health routines, with reminders and logs that keep doses from being missed.", "Today's doses · Time-of-day schedules · Dose reminders · Dose history · Family medication care · Home widget", "iOS · Android · Released"], links: productLinks("pillmate", "Product page →", "pillmate") },
    { n: "11", title: "Newon+", body: ["A membership app that brings NEWON apps under one account and one membership. The unified account and membership are being built, and app connections expand in stages.", "App package subscription · Benefits center · Unified login · Membership status", "Android (Google Play) · Released"], links: productLinks("newon-plus", "Product page →", "newon-plus") },
    { n: "12", title: "EatOn", body: ["A food app for recipes, dining out and delivery in one search.", "Popular recipes · AI recipe summary · Dining out · Delivery discovery", "In preparation — no store listing yet"], links: productLinks("eaton", "Product page →") },
    { n: "13", title: "FitOn", body: ["A sports and fitness app to explore and log many kinds of workouts and sports.", "Workout discovery · Workout logging · AI workout analysis · Challenges", "In preparation — no store listing yet"], links: productLinks("fiton", "Product page →") },
    { n: "14", title: "404: HUMAN", body: ["A choice-driven interactive game: answer questions, choose actions and avoid the suspicion of an AI-only world.", "Web · Playable"], links: [{ label: "Play 404: HUMAN →", href: siteHref("404-human/") }] },
  ] as Row[],

  /* 05 · PRODUCT DEVELOPMENT */
  processHeading: "Process",
  processTitle: "From an idea to a real product.",
  processLead: "Every NEWON product goes through the same seven steps, from the first problem to updates after launch.",
  process: [
    { title: "Problem", body: "Find a repeated everyday inconvenience and who meets it, in which situation." },
    { title: "Experience", body: "Decide the users, the core flow and the features that must come first." },
    { title: "Structure", body: "Design screens, data, record types and how products connect." },
    { title: "UI/UX", body: "Design the interface so recording and checking flow naturally." },
    { title: "Build", body: "Build iOS and Android apps with Flutter and the website with Node.js scripts." },
    { title: "Test", body: "Check links, screens and languages with automated tests and browser checks." },
    { title: "Launch", body: "Release on the App Store, Google Play and the web, then update from feedback." },
  ] as Step[],
  workflowTitle: "AI speeds the work. Judgment stays human.",
  workflowBody:
    "AI tools speed up research, writing, development and QA. Problem definition, priorities and the final call stay with NEWON's product judgment.",

  /* 06 · PRODUCT HIGHLIGHTS */
  highlightsHeading: "Highlights",
  highlightsTitle: "A closer look at the product experience.",
  highlightsLead: "Three released products, each with what is built today kept apart from what is still planned.",
  highlights: [
    {
      number: "01",
      name: "BabyLog",
      body: [
        "Product overview — A growth-record app from pregnancy to the teen years, and the base of the BABYLOG platform.",
        "Problem — Parenting records end up scattered across notes, photos and chats and are hard to find again.",
        "Approach — Growth and daily records are brought into one timeline that the whole family can see.",
        "Core features — Parenting records, child profiles, growth and health records, schedules, growth stats, family sharing and AI parenting insights.",
        "User experience — Screens are organised around the timeline and record types so daily logging keeps going.",
        "Development — An iOS and Android app built with Flutter: record types, timeline, sharing and multiple languages.",
        "Current status — Released on the App Store and Google Play. Partnerships in education and care are planned, not running.",
      ],
      link: { label: "BabyLog product page →", href: siteHref("portfolio/babylog/") },
    },
    {
      number: "02",
      name: "My World",
      body: [
        "Product overview — A travel-record app that marks visited countries and cities on a world map, and the starting point of the MY WORLD platform.",
        "Problem — Visited places, itineraries and photos are spread out and hard to see in one place.",
        "Approach — The travel map, itineraries, photos and stats are joined into one record.",
        "Core features — Travel map, visited countries, itineraries, travel journal, travel stats, AI travel report and travel goals.",
        "User experience — The main screens follow map → records → report so the travel story stays continuous.",
        "Development — An iOS and Android app built with Flutter: travel map, itinerary and photo records, reports and multiple languages.",
        "Current status — Released on the App Store and Google Play. Booking, commerce and a traveller community are in preparation.",
      ],
      link: { label: "My World product page →", href: siteHref("portfolio/myworld/") },
    },
    {
      number: "03",
      name: "OX MONTH",
      body: [
        "Product overview — A monthly habit app built on one O/X check a day.",
        "Problem — Goals are easy to set but hard to keep daily, and heavy tracking apps feel like too much.",
        "Approach — A minimal flow focused on one daily decision: record only whether you did it today.",
        "Core features — Today's check, monthly calendar, goals, quick start, stats, reminders and widgets.",
        "User experience — Screens stay simple so the daily record remains the focus.",
        "Development — An iOS and Android app built with Flutter: onboarding, logging flow, reminders and a multilingual UI.",
        "Current status — Released on the App Store and Google Play.",
      ],
      link: { label: "OX MONTH product page →", href: siteHref("portfolio/ox-month/") },
    },
  ] as PanelItem[],

  /* 07 · PROGRESS & MILESTONES */
  milestonesHeading: "Milestones",
  milestonesTitle: "A record of products completed one by one.",
  milestonesLead:
    "Dates come from the official website's history and published news. Where an exact date cannot be confirmed, only the year is shown.",
  stats: [
    { value: "6", label: "Core platforms", note: "BABYLOG to ONGIL." },
    { value: "11", label: "Released apps", note: "On the App Store and Google Play." },
    { value: "9", label: "Site languages", note: "The official website's locales." },
    { value: "2", label: "Web platforms", note: "LIVON web and the ONGIL web preview." },
  ] as Stat[],
  milestones: [
    { n: "2026.04", title: "Official website", body: ["The first version of the newon.app website went live and began introducing NEWON's services."] },
    { n: "2026", title: "11 mobile apps released", body: ["11 apps NEWON built itself, including BABYLOG, PETLOG and MY WORLD, were released on the App Store and Google Play."] },
    { n: "2026.09", title: "LIVON and ONGIL", body: ["The life-stage platform LIVON and the senior-life platform ONGIL were introduced on the website, and LIVON opened free on the web."] },
    { n: "NOW", title: "Six core platforms", body: ["NEWON is organised around six platforms, with Business & Partnerships and NEWON Studio alongside. The SHAREON, LIVON and ONGIL apps are in preparation."] },
  ] as Row[],

  /* 08 · TECHNOLOGY & CAPABILITIES */
  capabilitiesHeading: "Capabilities",
  capabilitiesTitle: "The capability to turn ideas into real services.",
  capabilitiesLead: "Only technology used in NEWON's own products is listed here, with the role it plays.",
  capabilities: [
    { n: "01", title: "Mobile app development", body: ["NEWON apps are built with Flutter, one codebase for iOS and Android, and released on the App Store and Google Play."] },
    { n: "02", title: "Web service development", body: ["The official website is generated as prebuilt HTML pages by Node.js scripts from shared data and templates. LIVON web has its own server API for data and conversation features."] },
    { n: "03", title: "UI/UX design", body: ["Each platform's screens are designed around its users and their record flow, while the official site and platform pages share one design system."] },
    { n: "04", title: "Multilingual service", body: ["The website is generated in nine languages — Korean, English, Japanese, Spanish, Portuguese (Brazil), French, German, Hindi and Indonesian — each with its own URLs and hreflang."] },
    { n: "05", title: "Data integration", body: ["Product names, descriptions and store links are kept in one data source, so the home page, product pages and this portfolio show the same information."] },
    { n: "06", title: "Service operation", body: ["Operational check scripts review the public product pages and app status after release."] },
    { n: "07", title: "Testing and quality", body: ["Node tests, link checks and Playwright browser checks cover desktop and mobile layouts and every language before a release."] },
  ] as Row[],

  /* 09 · EXPLORE NEWON */
  exploreHeading: "Explore NEWON.",
  exploreLead: "Meet NEWON's next possibilities.",
  exploreCtas: [
    { label: "Explore the six platforms", href: siteHref("business/platforms/") },
    { label: "NEWON Studio", href: siteHref("studio/") },
    { label: "Business & Partnerships", href: siteHref("business/") },
  ],
  card: "Card",
  ir: "Newon IR",
  blog: "Blog",
};

const ko: typeof en = {
  htmlLang: "ko",
  title: "Portfolio — NEWON",
  heroTitle: "Hi, i'm nawon",
  viewWork: "View my work",
  contactMe: "Contact me",
  selectedWork: "Selected work",
  portraitAlt: "경나원",
  filmSlogans,

  introHeading: "Our work",
  introText:
    "아이디어를 제품으로, 제품을 일상의 변화로. NEWON이 직접 기획하고 개발한 디지털 플랫폼과 제품을 소개합니다. 일상에서 발견한 문제를 실제 서비스로 구현하며 새로운 가능성을 만들어갑니다.",
  introCta: "6개 플랫폼 보기",

  overviewHeading: "Overview",
  overviewTitle: "다양한 문제를 하나의 제품 경험으로.",
  overviewLead: "이 페이지의 모든 제품은 NEWON이 직접 소유하고 기획·개발한 것입니다. 고객별 외주 프로젝트나 제작 대행 실적은 포함하지 않습니다.",
  overview: [
    { number: "01", name: "6개 핵심 플랫폼", body: ["BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL. 육아·반려생활·여행·공유·생애주기·시니어 라이프의 여섯 영역을 각각의 플랫폼으로 직접 기획하고 운영합니다."] },
    { number: "02", name: "독립형 앱", body: ["습관·목표, 금융, 건강처럼 일상의 한 가지 문제에 집중한 모바일 앱입니다. OX MONTH, GoalUp, CountUp, SAVY, SubPing, PiggyUp, Pillmate와 멤버십 앱 Newon+가 있습니다."], link: { label: "NEWON 앱 전체 보기 →", href: siteHref("apps/") } },
    { number: "03", name: "디지털 소프트웨어", body: ["QR 코드 생성기, 디데이 계산기, 글자 수 세기처럼 설치와 가입 없이 브라우저에서 바로 쓰는 무료 웹 도구를 만듭니다."], link: { label: "Newon Tools →", href: siteHref("tools/") } },
    { number: "04", name: "게임", body: ["404: HUMAN은 AI만 남은 세계에서 마지막 인간으로 살아남는 선택형 인터랙티브 게임으로, 웹에서 바로 플레이할 수 있습니다."], link: { label: "Newon Games →", href: siteHref("games/") } },
    { number: "05", name: "Studio 디지털 상품", body: ["NEWON Studio는 템플릿, 생산성 도구, 소프트웨어, 기업용 표준 제품을 직접 기획합니다. 지금은 무료 웹 도구와 NEWON Project Starter Kit을 이용할 수 있고, 나머지 제품군은 기획 중입니다."] },
    { number: "06", name: "제품 개발과 출시 경험", body: ["모바일 앱 11개를 직접 기획·디자인·개발해 App Store와 Google Play에 출시했고, 출시 후에도 이용 흐름과 의견을 바탕으로 업데이트합니다."] },
  ],

  platformsHeading: "Platforms",
  platformsTitle: "일상의 여섯 가지 영역을 연결합니다.",
  platformsLead:
    "플랫폼마다 한 영역에 집중합니다. 카드의 상태는 각 플랫폼 페이지의 표기를 그대로 따릅니다. 앱 3개는 출시되었고, LIVON은 웹에서 무료로, ONGIL은 웹 체험판으로 제공하며, SHAREON·LIVON·ONGIL 앱은 준비 중입니다.",
  platformCta: "플랫폼 보기",
  platforms: [
    {
      id: "babylog",
      type: "앱 출시 · iOS · Android",
      name: "BABYLOG",
      summary:
        "육아·가족 플랫폼. 임신 준비부터 출산, 육아, 성장 기록과 가족생활까지 메모·사진·채팅에 흩어지기 쉬운 아이와 가족의 기록과 정보를 하나로 잇습니다.",
      role: "예비 부모, 아이를 키우는 가족, 함께 돌보는 보호자 · 육아 기록 · 성장·건강 기록 · 가족 공유",
      slogan: ["아이의 모든 순간을,", "하나의 성장 이야기로."],
      lead: "지금 iOS·Android 앱에서 육아 기록, 성장·건강 기록, 일정 관리, 가족 공유를 제공합니다. 교육·돌봄 분야의 제휴는 앞으로의 협력 방향입니다.",
    },
    {
      id: "petlog",
      type: "앱 출시 · iOS · Android",
      name: "PETLOG",
      summary: "반려생활 플랫폼. 반려동물의 일상과 건강 이력, 예방접종·병원 일정이 보호자마다 따로 흩어지는 문제를 줄입니다.",
      role: "반려동물 보호자와 가족 · 일상·건강 기록 · 예방접종·병원 일정 · 가족 공동 관리",
      slogan: ["반려동물의 하루와 건강을,", "가족이 함께 기록합니다."],
      lead: "지금 PETLOG 앱에서 프로필, 일상·건강 기록, 예방접종·병원 일정, 가족 공동 관리를 이용할 수 있습니다. 반려생활 정보와 커뮤니티는 준비 중입니다.",
    },
    {
      id: "myworld",
      type: "앱 출시 · iOS · Android",
      name: "MY WORLD",
      summary:
        "여행 플랫폼. 여행의 탐색·계획·예약·기록·공유가 여러 서비스에 흩어진 문제에서 출발해, 방문한 국가와 도시를 세계지도에 남기는 여행 기록부터 제공합니다.",
      role: "여행자 · 세계지도 여행 기록 · 이동 경로·사진 · 여행 통계 · AI 여행 리포트",
      slogan: ["다녀온 모든 곳을,", "나만의 세계지도로."],
      lead: "지금 MY WORLD 앱에서 방문 국가·도시 기록, 이동 경로·사진, 여행 통계와 AI 여행 리포트를 제공합니다. 예약·커머스·여행자 커뮤니티는 단계적으로 준비하고 있습니다.",
    },
    {
      id: "shareon",
      type: "앱 출시 준비 중",
      name: "SHAREON",
      summary:
        "자산 공유·대여 플랫폼. 자주 쓰지 않지만 사기엔 부담스러운 물건, 쓰지 않는 시간이 긴 장비와 공간의 문제를 다루며, 필요한 기간만 빌리려는 이용자와 개인·기업 공급자를 잇는 마켓플레이스를 지향합니다.",
      role: "빌리려는 이용자와 물건·장비·공간을 가진 개인·기업 · 물건 · 장비 · 공간 · 이동수단",
      slogan: ["필요한 만큼만 빌리고,", "쓰지 않을 때는 나눕니다."],
      lead: "SHAREON 앱은 출시 전입니다. 지금은 실제 대여·예약 확정·결제·보증금·정산이 운영되지 않으며, 첫 출시는 대여·공간 중심의 승인형 예약으로 준비하고 있습니다.",
    },
    {
      id: "livon",
      type: "웹 무료 공개 · 앱 준비 중",
      name: "LIVON",
      summary:
        "생애주기 플랫폼. 교육·진로·취업·군 복무·금융·주거·결혼·출산·건강·복지·은퇴까지 삶의 단계마다 흩어진 정보를 지금의 생애 단계에서 출발해 정리합니다.",
      role: "10대부터 70대 이상까지 · 생애 단계별 정보 · 공공 제도 안내 · 생활 기록",
      slogan: ["삶의 단계마다,", "다음에 필요한 것을."],
      lead: "지금 LIVON 웹을 회원가입 없이 무료로 이용할 수 있고, 공공 제도는 공식 출처와 기준일을 함께 표시합니다. LIVON 앱은 출시 준비 중입니다.",
    },
    {
      id: "ongil",
      type: "웹 체험판 · 앱 국내 출시 준비 중",
      name: "ONGIL",
      summary: "시니어 라이프 플랫폼. 시니어가 자신의 속도와 방식으로 일상을 이어 갈 수 있도록 생활정보와 가족 연결, 돌봄·복지 정보를 잇습니다.",
      role: "시니어 본인과 가족 · 일상생활 · 건강 기록 · 가족 연결 · 돌봄·복지 안내",
      slogan: ["따뜻한 연결로,", "일상의 시간을 잇습니다."],
      lead: "지금은 로그인 없이 이 기기에만 저장되는 웹 체험판으로 일부 기능을 제공하고, iOS·Android 앱은 국내 첫 출시를 준비 중입니다. 공식 제휴가 확정된 기관은 아직 없습니다.",
    },
  ],

  productsHeading: "Products",
  productsTitle: "직접 만들고 발전시켜 온 제품들.",
  productsLead:
    "출시 상태는 각 제품 페이지의 스토어 링크로 확인했습니다. 출시는 App Store 또는 Google Play에 등록된 앱이고, 준비 중은 아직 스토어에 등록되지 않은 제품입니다.",
  products: [
    { n: "01", title: "BabyLog", body: ["임신부터 청소년기까지 아이의 성장과 일상을 기록하는 성장 기록 앱입니다. 메모·사진·채팅에 흩어진 육아 기록을 하나의 타임라인으로 모읍니다.", "육아 기록 · 성장·건강 기록 · 일정 관리 · 성장 통계 · 가족 공유 · AI 육아 분석", "iOS · Android · 출시 — BABYLOG 플랫폼의 기반 앱"], links: productLinks("babylog", "제품 상세 →", "babylog") },
    { n: "02", title: "PetLog", body: ["반려동물의 일상·건강·추억을 쌓는 반려 기록 앱입니다. 식사·산책·건강 기록과 병원 일정을 가족이 함께 쓰는 하나의 기록으로 모읍니다.", "식사·산책 기록 · 건강 기록 · 일정 관리 · 통계 · 가족 공유 · AI 건강 분석", "iOS · Android · 출시 — PETLOG 플랫폼의 기반 앱"], links: productLinks("petlog", "제품 상세 →", "petlog") },
    { n: "03", title: "My World", body: ["방문한 나라와 도시를 세계지도에 남기는 여행 기록 앱입니다. 흩어진 방문 기록·여행 일정·사진을 한곳에서 봅니다.", "여행 지도 · 방문 국가 · 여행 일정 · 여행 기록 · 여행 통계 · AI 여행 리포트", "iOS · Android · 출시 — MY WORLD 플랫폼의 기반 앱"], links: productLinks("myworld", "제품 상세 →", "myworld") },
    { n: "04", title: "OX MONTH", body: ["하루 한 번의 O/X 체크로 습관을 이어 가는 월간 습관 앱입니다. 복잡한 기록 앱 없이 매일의 실천을 가볍게 남기고 싶은 사람을 위해 만들었습니다.", "오늘 기록하기 · 월간 캘린더 · 목표 설정 · 빠른 시작 · 통계 분석 · 알림 · 위젯", "iOS · Android · 출시"], links: productLinks("ox-month", "제품 상세 →", "ox-month") },
    { n: "05", title: "GoalUp", body: ["목표 설정부터 실행 관리와 챌린지까지 이어 주는 목표 관리 앱입니다. 세운 목표가 계획에서 멈추지 않도록 돕습니다.", "목표 관리 · 챌린지 · 목표 알림 · 성장 분석 · 연속 기록 · AI 성장 분석", "iOS · Android · 출시"], links: productLinks("goalup", "제품 상세 →", "goalup") },
    { n: "06", title: "CountUp", body: ["운동·공부·독서·금연처럼 반복되는 행동을 숫자로 기록하고 성장 흐름을 확인하는 카운팅 앱입니다.", "카운트 기록 · 목표 설정 · 연속 기록 · 마일스톤 · 그래프 시각화 · AI 인사이트", "iOS · Android · 출시"], links: productLinks("countup", "제품 상세 →", "countup") },
    { n: "07", title: "SAVY", body: ["여러 앱과 카드 명세에 흩어진 지출·수입·구독을 한곳에 정리하는 금융 관리 앱입니다.", "지출 기록 · 수입 기록 · 구독 관리 · 소비 분석 · 스마트 알림 · AI 소비 분석", "iOS · Android · 출시"], links: productLinks("savy", "제품 상세 →", "savy") },
    { n: "08", title: "SubPing", body: ["OTT부터 통신비·보험료·월세·학원비까지 반복되는 정기 지출을 한곳에서 정리하고, 결제를 놓치지 않게 알려 주는 구독 관리 앱입니다.", "정기 지출 관리 · 결제 알림 · 소비 인사이트 · 위젯", "iOS · Android · 출시"], links: productLinks("subping", "제품 상세 →", "subping") },
    { n: "09", title: "PiggyUp", body: ["매일의 지출을 가볍게 기록하고 돈이 새는 패턴을 찾아 절약 목표로 잇는 절약 습관 앱입니다.", "소비 기록 · 절약 목표 · 절약 알림 · 소비 분석 · 목표 달성 추적 · AI 절약 분석", "iOS · Android · 출시"], links: productLinks("piggyup", "제품 상세 →", "piggyup") },
    { n: "10", title: "Pillmate", body: ["약·영양제·건강 루틴을 한곳에서 기록하고, 알림과 기록으로 복용 일정을 놓치지 않게 돕는 복약 관리 앱입니다.", "오늘 복용 체크 · 시간대별 복용 관리 · 복용 알림 · 복용 기록 · 가족 복약 공유 · 홈 위젯", "iOS · Android · 출시"], links: productLinks("pillmate", "제품 상세 →", "pillmate") },
    { n: "11", title: "Newon+", body: ["NEWON 앱을 하나의 계정과 멤버십으로 잇는 멤버십 앱입니다. 통합 계정과 멤버십은 구축 중이며, 앱 연동은 단계적으로 확장합니다.", "앱 패키지 구독 · 혜택 센터 · 통합 로그인 · 멤버십 현황", "Android(Google Play) · 출시"], links: productLinks("newon-plus", "제품 상세 →", "newon-plus") },
    { n: "12", title: "EatOn", body: ["레시피·외식·배달 정보를 한곳에서 탐색하는 푸드 앱입니다.", "인기 레시피 · AI 레시피 요약 · 외식 맛집 · 배달 탐색", "준비 중 — 아직 스토어에 등록되지 않았습니다"], links: productLinks("eaton", "제품 상세 →") },
    { n: "13", title: "FitOn", body: ["다양한 운동과 스포츠를 탐색하고 기록하는 스포츠·피트니스 앱입니다.", "운동 탐색 · 운동 기록 · AI 운동 분석 · 챌린지", "준비 중 — 아직 스토어에 등록되지 않았습니다"], links: productLinks("fiton", "제품 상세 →") },
    { n: "14", title: "404: HUMAN", body: ["질문에 답하고 행동을 선택하며 AI의 의심을 피하는 선택형 인터랙티브 게임입니다.", "웹 · 웹 공개(플레이 가능)"], links: [{ label: "404: HUMAN 플레이 →", href: siteHref("404-human/") }] },
  ],

  processHeading: "Process",
  processTitle: "아이디어에서 실제 제품까지.",
  processLead: "NEWON의 제품은 첫 문제 발견부터 출시 후 업데이트까지 같은 일곱 단계를 거칩니다.",
  process: [
    { title: "문제 발견", body: "일상에서 반복되는 불편과, 누가 어떤 상황에서 겪는지 정리합니다." },
    { title: "사용자 경험 기획", body: "이용 대상과 핵심 흐름, 먼저 필요한 기능을 정합니다." },
    { title: "제품 구조 설계", body: "화면, 데이터, 기록 유형과 제품 사이의 연결 구조를 설계합니다." },
    { title: "UI·UX 설계", body: "기록과 확인이 자연스럽게 이어지도록 화면을 설계합니다." },
    { title: "개발과 구현", body: "Flutter로 iOS·Android 앱을, Node.js 스크립트로 웹사이트를 만듭니다." },
    { title: "테스트 및 검증", body: "자동 테스트와 브라우저 검사로 링크·화면·다국어를 확인합니다." },
    { title: "출시와 개선", body: "App Store·Google Play와 웹에 공개하고 반응을 보고 업데이트합니다." },
  ],
  workflowTitle: "AI speeds the work. Judgment stays human.",
  workflowBody: "조사, 작성, 개발, QA는 AI 도구로 속도를 냅니다. 문제 정의, 우선순위, 최종 판단은 NEWON의 제품 기준으로 직접 합니다.",

  highlightsHeading: "Highlights",
  highlightsTitle: "제품의 경험을 자세히 살펴보세요.",
  highlightsLead: "출시된 대표 제품 세 가지를, 지금 구현된 기능과 준비 중인 기능을 나누어 소개합니다.",
  highlights: [
    {
      number: "01",
      name: "BabyLog",
      body: [
        "Product Overview — 임신부터 청소년기까지 아이의 성장과 일상을 기록하는 성장 기록 앱이자 BABYLOG 플랫폼의 기반입니다.",
        "Problem — 육아 기록이 메모·사진·채팅에 흩어져 다시 찾기 어렵습니다.",
        "Approach — 성장·일상 기록을 타임라인 중심으로 통합하고, 가족이 같은 기록을 함께 보도록 구성했습니다.",
        "Core Features — 육아 기록, 아이 프로필, 성장·건강 기록, 일정 관리, 성장 통계, 가족 공유, AI 육아 분석.",
        "User Experience — 타임라인과 기록 유형을 중심으로, 일상 기록이 끊기지 않고 이어지도록 화면을 구성했습니다.",
        "Development — Flutter로 만든 iOS·Android 앱으로 기록 타입, 타임라인, 공유, 다국어를 구현했습니다.",
        "Current Status — App Store·Google Play 출시. 교육·돌봄 분야 제휴는 계획 단계이며 운영 중이 아닙니다.",
      ],
      link: { label: "BabyLog 제품 상세 →", href: siteHref("portfolio/babylog/") },
    },
    {
      number: "02",
      name: "My World",
      body: [
        "Product Overview — 방문한 국가와 도시를 세계지도에 기록하는 여행 기록 앱이자 MY WORLD 플랫폼의 출발점입니다.",
        "Problem — 방문한 나라·도시와 여행 일정·사진이 흩어져 한곳에서 보기 어렵습니다.",
        "Approach — 여행 지도·일정·사진·통계를 하나의 기록으로 연결했습니다.",
        "Core Features — 여행 지도, 방문 국가, 여행 일정, 여행 기록, 여행 통계, AI 여행 리포트, 여행 목표.",
        "User Experience — 지도 → 기록 → 리포트로 이어지는 흐름으로 주요 화면을 구성했습니다.",
        "Development — Flutter로 만든 iOS·Android 앱으로 여행 지도, 일정·사진 기록, 리포트, 다국어를 구현했습니다.",
        "Current Status — App Store·Google Play 출시. 예약·커머스·여행자 커뮤니티는 준비 중입니다.",
      ],
      link: { label: "My World 제품 상세 →", href: siteHref("portfolio/myworld/") },
    },
    {
      number: "03",
      name: "OX MONTH",
      body: [
        "Product Overview — 하루 한 번의 O/X 체크로 습관을 이어 가는 월간 습관 앱입니다.",
        "Problem — 목표는 세우지만 매일 이어 가기 어렵고, 복잡한 기록 앱은 부담스럽습니다.",
        "Approach — 하루 단위 선택과 기록에 집중한 미니멀 UX로 「오늘 했는지」만 남기게 했습니다.",
        "Core Features — 오늘 기록하기, 월간 캘린더, 목표 설정, 빠른 시작, 통계 분석, 알림, 위젯.",
        "User Experience — 하루 기록에 집중하도록 화면을 단순하게 유지했습니다.",
        "Development — Flutter로 만든 iOS·Android 앱으로 온보딩, 기록 플로우, 알림, 다국어 UI를 구현했습니다.",
        "Current Status — App Store·Google Play 출시.",
      ],
      link: { label: "OX MONTH 제품 상세 →", href: siteHref("portfolio/ox-month/") },
    },
  ],

  milestonesHeading: "Milestones",
  milestonesTitle: "하나씩 완성해 온 제품의 기록.",
  milestonesLead: "날짜는 공식 웹사이트 기록과 공개된 소식으로 확인한 범위에서만 표기하고, 정확한 날짜를 확인할 수 없는 항목은 연도만 적습니다.",
  stats: [
    { value: "6", label: "핵심 플랫폼", note: "BABYLOG부터 ONGIL까지." },
    { value: "11", label: "출시 앱", note: "App Store·Google Play에 출시." },
    { value: "9", label: "웹사이트 언어", note: "공식 웹사이트의 언어 수." },
    { value: "2", label: "웹 공개 플랫폼", note: "LIVON 웹, ONGIL 웹 체험판." },
  ],
  milestones: [
    { n: "2026.04", title: "공식 웹사이트 시작", body: ["newon.app 공식 웹사이트의 첫 버전을 만들고, NEWON의 서비스를 소개하기 시작했습니다."] },
    { n: "2026", title: "모바일 앱 11개 출시", body: ["BABYLOG, PETLOG, MY WORLD를 포함해 NEWON이 직접 만든 모바일 앱 11개를 App Store와 Google Play에 출시했습니다."] },
    { n: "2026.09", title: "LIVON·ONGIL 공개", body: ["생애주기 플랫폼 LIVON과 시니어 라이프 플랫폼 ONGIL을 웹사이트에 소개하고, LIVON 웹을 무료로 열었습니다."] },
    { n: "NOW", title: "6개 핵심 플랫폼 체계", body: ["여섯 개의 핵심 플랫폼을 중심으로 Business & Partnerships와 NEWON Studio를 함께 전개합니다. SHAREON·LIVON·ONGIL 앱은 준비 중입니다."] },
  ],

  capabilitiesHeading: "Capabilities",
  capabilitiesTitle: "아이디어를 실제 서비스로 구현하는 역량.",
  capabilitiesLead: "NEWON의 실제 제품에서 쓰고 있는 기술만, 제품 구현에서 맡은 역할과 함께 적었습니다.",
  capabilities: [
    { n: "01", title: "모바일 앱 개발", body: ["NEWON 앱은 Flutter로 iOS와 Android를 하나의 코드로 함께 개발하고, App Store와 Google Play에 출시합니다."] },
    { n: "02", title: "웹 서비스 개발", body: ["공식 웹사이트는 Node.js 스크립트가 공통 데이터와 템플릿으로 정적 페이지를 생성하는 구조입니다. LIVON 웹은 데이터와 대화 기능을 위한 서버 API를 따로 갖추고 있습니다."] },
    { n: "03", title: "UI·UX 설계", body: ["플랫폼마다 이용 대상과 기록 흐름에 맞춰 화면을 설계하고, 공식 사이트와 플랫폼 페이지는 하나의 디자인 시스템을 공유합니다."] },
    { n: "04", title: "다국어 서비스", body: ["공식 웹사이트는 한국어·영어·일본어·스페인어·포르투갈어(브라질)·프랑스어·독일어·힌디어·인도네시아어 9개 언어로 생성되며, 언어마다 주소와 hreflang을 따로 둡니다."] },
    { n: "05", title: "데이터 연동", body: ["제품 이름, 설명, 스토어 링크를 한 곳의 데이터에서 관리해 홈, 제품 페이지, 포트폴리오에 같은 정보를 보여 줍니다."] },
    { n: "06", title: "서비스 운영", body: ["출시 후에는 운영 점검 스크립트로 공개된 제품 페이지와 앱 상태를 확인합니다."] },
    { n: "07", title: "테스트 및 품질 관리", body: ["Node 테스트, 링크 검사, Playwright 브라우저 검사로 데스크톱·모바일 화면과 모든 언어 페이지를 확인한 뒤 배포합니다."] },
  ],

  exploreHeading: "Explore NEWON.",
  exploreLead: "NEWON의 다음 가능성을 만나보세요.",
  exploreCtas: [
    { label: "6개 플랫폼 살펴보기", href: siteHref("business/platforms/") },
    { label: "NEWON Studio", href: siteHref("studio/") },
    { label: "Business & Partnerships", href: siteHref("business/") },
  ],
  card: "명함",
  ir: "Newon IR",
  blog: "블로그",
};

export const t = isKo ? ko : en;
