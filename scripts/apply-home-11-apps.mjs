#!/usr/bin/env node
/**
 * Apply homepage “11 apps + My World” updates across locales.
 * Source of truth for counts, categories, travel copy, SEO keywords.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = path.join(ROOT, "locales");

const LOGO = (src) =>
  `<img class="co-product-card__logo" src="${src}" alt="" width="40" height="40" decoding="async" />`;

const LOGOS = {
  ox: LOGO("/ox-month-logo.png"),
  gu: LOGO("/goalup-logo.png"),
  cu: LOGO("/countup-logo.png"),
  savy: LOGO("/savy-logo.png"),
  sp: LOGO("/subping-logo.png"),
  pu: LOGO("/piggyup-logo.png"),
  pm: LOGO("/pillmate-logo.png"),
  bl: LOGO("/babylog-logo.png"),
  pl: LOGO("/petlog-logo.png"),
  mw: LOGO("/myworld-logo.png"),
  np: LOGO("/newon-plus-logo.png"),
};

const PRODUCT_HTML = {
  li0: (title) =>
    `<span class="co-product-card__title"><strong>${title}</strong></span><span class="co-product-card__logos">${LOGOS.ox}${LOGOS.gu}${LOGOS.cu}</span><span class="co-product-card__apps">OX MONTH · GoalUp · CountUp</span>`,
  li1: (title) =>
    `<span class="co-product-card__title"><strong>${title}</strong></span><span class="co-product-card__logos">${LOGOS.savy}${LOGOS.sp}${LOGOS.pu}</span><span class="co-product-card__apps">Savy · SubPing · PiggyUp</span>`,
  li2: (title) =>
    `<span class="co-product-card__title"><strong>${title}</strong></span><span class="co-product-card__logos">${LOGOS.pm}</span><span class="co-product-card__apps">Pillmate</span>`,
  li3: (title) =>
    `<span class="co-product-card__title"><strong>${title}</strong></span><span class="co-product-card__logos">${LOGOS.bl}${LOGOS.pl}${LOGOS.mw}</span><span class="co-product-card__apps">BabyLog · PetLog · My World</span>`,
  li4: (title) =>
    `<span class="co-product-card__title"><strong>${title}</strong></span><span class="co-product-card__logos co-product-card__logos--all">${LOGOS.ox}${LOGOS.gu}${LOGOS.cu}${LOGOS.savy}${LOGOS.sp}${LOGOS.pu}${LOGOS.pm}${LOGOS.bl}${LOGOS.pl}${LOGOS.mw}</span><span class="co-product-card__apps">OX MONTH · GoalUp · CountUp · Savy · SubPing · PiggyUp · Pillmate · BabyLog · PetLog · My World</span>`,
  li5: (title) =>
    `<span class="co-product-card__title"><strong>${title}</strong></span><span class="co-product-card__logos">${LOGOS.np}</span><span class="co-product-card__apps">Newon+</span>`,
};

const NEWON_PLUS_APPS =
  `<span class="co-newon-plus-apps"><span class="co-newon-plus-apps__line">OX MONTH · GoalUp · CountUp · Savy · SubPing</span><span class="co-newon-plus-apps__line">PiggyUp · Pillmate · BabyLog · PetLog · My World</span></span>`;

const APPS_LIST =
  "OX MONTH · GoalUp · CountUp · Savy · SubPing · PiggyUp · Pillmate · BabyLog · PetLog · My World";

/** Per-language home/meta/footer/about/np patches */
const LANG = {
  ko: {
    meta: {
      description:
        "Newon — 아이디어를 현실로 만드는 앱 스튜디오. 습관·목표·건강·금융·가족·여행 기록까지 11개 앱을 운영합니다. OX MONTH, GoalUp, CountUp, Savy, SubPing, PiggyUp, Pillmate, BabyLog, PetLog, My World, Newon+.",
      ogDescription:
        "Newon — 아이디어를 현실로 만드는 앱 스튜디오. 습관·목표·건강·금융·가족·여행 기록까지 11개 앱을 운영합니다.",
      twitterDescription:
        "Newon — 습관·목표·건강·금융·가족·여행 기록까지 11개 앱의 글로벌 라이프 플랫폼.",
      keywords:
        "Newon, 뉴온, newon.app, 앱 스튜디오, OX MONTH, GoalUp, CountUp, Savy, SubPing, PiggyUp, Pillmate, BabyLog, PetLog, My World, Newon+, 습관 기록 앱, 구독 관리 앱, 복약 관리 앱, 가계부 앱, 육아 기록 앱, 목표 관리 앱, 여행 기록, 방문 국가, 여행 지도, travel journal, travel tracker, visited countries, travel map, 생산성 앱",
      orgDescription: "아이디어를 현실로 만드는 앱 스튜디오 · 11개 라이프 앱",
    },
    about: {
      lead: "Newon은 생산성, 금융, 건강, 가족, 여행까지 일상을 돕는 앱 스튜디오입니다.",
      metaDescription:
        "Newon은 생산성·금융·건강·라이프스타일 앱을 만듭니다. 177개국·13개 언어, OX MONTH, GoalUp, CountUp, Savy, SubPing, PiggyUp, Pillmate, BabyLog, PetLog, My World, Newon+ 등 11개 앱.",
      statApps: "11개 앱 서비스 운영",
    },
    footer: { statLine3: "11개 앱 출시" },
    home: {
      heroLeadHtml:
        "Newon은 앱을 만드는 회사가 아닙니다.<br /><br />사람들의 일상 속 작은 문제를 발견하고, 오랫동안 사용되는 경험으로 바꾸는 글로벌 라이프 플랫폼입니다.<br /><br />습관, 목표, 건강, 금융, 가족 기록, 여행 기록까지.<br /><br />우리는 삶을 더 쉽고 지속 가능하게 만드는 서비스를 설계합니다.",
      heroStat0: "11+ 서비스",
      meaningCard0Html: '<span class="co-meaning-card__text">습관을 만들고</span>',
      meaningCard1Html: '<span class="co-meaning-card__text">목표를 이루고</span>',
      meaningCard2Html: '<span class="co-meaning-card__text">건강을 지키고</span>',
      meaningCard3Html: '<span class="co-meaning-card__text">여행을 기록하고</span>',
      meaningCard4Html: '<span class="co-meaning-card__text">가족의 추억을 남기고</span>',
      meaningCard5Html: '<span class="co-meaning-card__text">더 나은 삶을 연결합니다</span>',
      aboutLead:
        "Newon은 생산성, 건강, 금융, 목표 관리, 여행 기록, 가족 기록, 반려동물 관리까지 일상의 다양한 문제를 해결하는 글로벌 라이프 플랫폼입니다.",
      aboutCard0Html:
        '<span class="co-about-card__value">11+</span><span class="co-about-card__label">서비스 운영</span>',
      workCard0Html: '<span class="co-work-card__text">습관을 기록하고</span>',
      workCard1Html: '<span class="co-work-card__text">목표를 달성하고</span>',
      workCard2Html: '<span class="co-work-card__text">지출을 관리하며</span>',
      workCard3Html: '<span class="co-work-card__text">건강을 돌보고</span>',
      workCard4Html: '<span class="co-work-card__text">가족의 시간을 기록하고</span>',
      workCard5Html: '<span class="co-work-card__text">세상의 여행을 기록합니다</span>',
      productLi0: "습관 · 목표 · 성장",
      productLi1: "금융 · 소비 · 절약",
      productLi2: "건강 · 생활",
      productLi3: "가족 · 기록 · 케어",
      productLi4: "AI 기반 라이프 서비스",
      productLi5: "통합 생태계",
      productLi0Html: PRODUCT_HTML.li0("습관 · 목표 · 성장"),
      productLi1Html: PRODUCT_HTML.li1("금융 · 소비 · 절약"),
      productLi2Html: PRODUCT_HTML.li2("건강 · 생활"),
      productLi3Html: PRODUCT_HTML.li3("가족 · 기록 · 케어"),
      productLi4Html: PRODUCT_HTML.li4("AI 기반 라이프 서비스"),
      productLi5Html: PRODUCT_HTML.li5("통합 생태계"),
      productsExtraHtml: `현재 Newon은<br /><br />${APPS_LIST}<br /><br />그리고 Newon+로 모든 서비스를 연결하고 있습니다.`,
      visionP4Html:
        "11개의 앱에서 시작해 수십 개의 서비스가 연결되는 글로벌 라이프 플랫폼으로 성장하고 있습니다.",
      whyCard0Html:
        '<span class="co-stats-card__value">오래 사용하는 경험</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">유행하는 기능보다</span><span class="co-stats-card__label-line">습관·여행·가족 기록을 매일 열어보는 앱을 만듭니다.</span></span>',
      whyCard1Html:
        '<span class="co-stats-card__value">글로벌 서비스</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">177개국 · 13개 언어</span><span class="co-stats-card__label-line">여행 기록까지 세계와 연결합니다.</span></span>',
      whyCard2Html:
        '<span class="co-stats-card__value">연결되는 라이프 생태계</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">개별 앱을 넘어</span><span class="co-stats-card__label-line">습관부터 여행까지 하나의 플랫폼으로.</span></span>',
      statCard0Html:
        '<span class="co-stats-card__value">11+</span><span class="co-stats-card__label">서비스 운영</span>',
      statNewonPlusHtml: `<strong>Newon+</strong><br />하나의 구독으로<br />모든 Newon 앱을 이용하세요.<br /><br />${NEWON_PLUS_APPS}<br /><br />하나의 계정.<br />하나의 구독.<br />모든 일상을 연결합니다.`,
    },
    np: {
      heroReachSummary:
        "From productivity and health to parenting, finance, goals, and travel—experience Newon's premium apps with one membership.",
      imgShot1Alt: "Newon — Ideas into apps; a life platform with 11+ apps and one account",
      imgShot5Alt: "Newon — 11+ apps, 177 countries, 13 languages",
    },
  },
  en: {
    meta: {
      description:
        "Newon is an app studio that turns ideas into reality. 11 apps for productivity, health, finance, family, and travel—OX MONTH, GoalUp, CountUp, Savy, SubPing, PiggyUp, Pillmate, BabyLog, PetLog, My World, and Newon+.",
      ogDescription:
        "Newon builds 11 lifestyle apps—habits, goals, health, finance, family, and travel journals—across 177 countries and 13 languages.",
      twitterDescription:
        "Newon — 11 apps for habits, health, finance, family, and travel tracking worldwide.",
      keywords:
        "Newon, newon.app, app studio, OX MONTH, GoalUp, CountUp, Savy, SubPing, PiggyUp, Pillmate, BabyLog, PetLog, My World, Newon+, habit tracker, subscription manager, medication reminder, budgeting app, baby log, goal tracking, travel journal, travel tracker, visited countries, travel map, productivity apps",
      orgDescription: "App studio that turns ideas into reality · 11 life apps",
    },
    about: {
      lead: "Newon builds apps for productivity, finance, health, family, and travel.",
      metaDescription:
        "Newon builds productivity, finance, health, and lifestyle apps. 177 countries, 13 languages—OX MONTH, GoalUp, CountUp, Savy, SubPing, PiggyUp, Pillmate, BabyLog, PetLog, My World, Newon+.",
      statApps: "11 app services",
    },
    footer: { statLine3: "11 apps released" },
    home: {
      heroLeadHtml:
        "Newon is not a company that makes apps.<br /><br />We discover small problems in everyday life and turn them into experiences people keep using—a global life platform.<br /><br />Habits, goals, health, finance, family records, travel journals.<br /><br />We design services that make life easier and more sustainable.",
      heroStat0: "11+ services",
      meaningCard0Html: '<span class="co-meaning-card__text">build habits</span>',
      meaningCard1Html: '<span class="co-meaning-card__text">reach goals</span>',
      meaningCard2Html: '<span class="co-meaning-card__text">protect health</span>',
      meaningCard3Html: '<span class="co-meaning-card__text">record travel</span>',
      meaningCard4Html: '<span class="co-meaning-card__text">keep family memories</span>',
      meaningCard5Html: '<span class="co-meaning-card__text">connect a better life</span>',
      aboutLead:
        "Newon is a global life platform solving everyday problems across productivity, health, finance, goals, travel journals, family records, and pet care.",
      aboutCard0Html:
        '<span class="co-about-card__value">11+</span><span class="co-about-card__label">Services</span>',
      workCard0Html: '<span class="co-work-card__text">Record habits</span>',
      workCard1Html: '<span class="co-work-card__text">Reach goals</span>',
      workCard2Html: '<span class="co-work-card__text">Manage spending</span>',
      workCard3Html: '<span class="co-work-card__text">Care for health</span>',
      workCard4Html: '<span class="co-work-card__text">Capture family time</span>',
      workCard5Html: '<span class="co-work-card__text">Record journeys around the world</span>',
      productLi0: "Habits · Goals · Growth",
      productLi1: "Finance · Spending · Saving",
      productLi2: "Health · Daily life",
      productLi3: "Family · Records · Care",
      productLi4: "AI-powered life services",
      productLi5: "Unified ecosystem",
      productLi0Html: PRODUCT_HTML.li0("Habits · Goals · Growth"),
      productLi1Html: PRODUCT_HTML.li1("Finance · Spending · Saving"),
      productLi2Html: PRODUCT_HTML.li2("Health · Daily life"),
      productLi3Html: PRODUCT_HTML.li3("Family · Records · Care"),
      productLi4Html: PRODUCT_HTML.li4("AI-powered life services"),
      productLi5Html: PRODUCT_HTML.li5("Unified ecosystem"),
      productsExtraHtml: `Today, Newon includes<br /><br />${APPS_LIST}<br /><br />and Newon+ connects every service.`,
      visionP4Html:
        "Starting from 11 apps, we are growing into a global life platform where dozens of services connect.",
      whyCard0Html:
        '<span class="co-stats-card__value">Built to last</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">Not trendy features—</span><span class="co-stats-card__label-line">habits, travel, and family records people open every day.</span></span>',
      whyCard1Html:
        '<span class="co-stats-card__value">Global reach</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">177 countries · 13 languages</span><span class="co-stats-card__label-line">including travel journals worldwide.</span></span>',
      whyCard2Html:
        '<span class="co-stats-card__value">Connected life ecosystem</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">Beyond single apps—</span><span class="co-stats-card__label-line">from habits to travel, one platform.</span></span>',
      statCard0Html:
        '<span class="co-stats-card__value">11+</span><span class="co-stats-card__label">Services</span>',
      statNewonPlusHtml: `<strong>Newon+</strong><br />One subscription<br />for every Newon app.<br /><br />${NEWON_PLUS_APPS}<br /><br />One account.<br />One subscription.<br />Everyday life, connected.`,
    },
    np: {
      heroReachSummary:
        "From productivity and health to parenting, finance, goals, and travel—experience Newon's premium apps with one membership.",
      heroReachSummaryHtml:
        "From productivity and health to parenting, finance, goals, and travel—<br />experience Newon's premium apps<br />with one membership.",
      introHtml:
        '<p class="ox-app-intro__lead"><strong>Newon</strong> is</p><p>a unified membership platform that connects every Newon app with one account.</p><p>No separate subscriptions—one membership covers productivity, health, parenting, finance, pets, goals, travel, and lifestyle apps.</p><p>Manage installs, subscription status, premium benefits, family sharing, and usage stats in one place.</p><p>Newon Membership delivers a more convenient, more affordable subscription experience.</p>',
      imgShot1Alt: "Newon — Ideas into apps; a life platform with 11+ apps and one account",
      imgShot5Alt: "Newon — 11+ apps, 177 countries, 13 languages",
    },
  },
};

// Localized titles + body for remaining langs (product HTML logos shared)
const I18N_EXTRA = {
  ja: {
    meta: {
      description:
        "Newonはアイデアを現実にするアプリスタジオ。習慣・目標・健康・金融・家族・旅行記録まで11のアプリを展開。OX MONTH、GoalUp、CountUp、Savy、SubPing、PiggyUp、Pillmate、BabyLog、PetLog、My World、Newon+。",
      keywords:
        "Newon, newon.app, アプリスタジオ, OX MONTH, GoalUp, CountUp, Savy, SubPing, PiggyUp, Pillmate, BabyLog, PetLog, My World, 旅行記録, 訪問国, 旅行マップ, travel journal, travel tracker, visited countries",
      orgDescription: "アイデアを現実にするアプリスタジオ · 11のライフアプリ",
    },
    about: { statApps: "11アプリを運営", lead: "Newonは生産性・金融・健康・家族・旅行を支えるアプリスタジオです。" },
    footer: { statLine3: "11本のアプリ" },
    home: {
      heroLeadHtml:
        "Newonはアプリを作るだけの会社ではありません。<br /><br />日常の小さな課題を見つけ、長く使われる体験に変えるグローバルなライフプラットフォームです。<br /><br />習慣、目標、健康、金融、家族の記録、旅行の記録まで。<br /><br />人生をより簡単で持続可能にするサービスを設計します。",
      heroStat0: "11+ サービス",
      meaningCard0Html: '<span class="co-meaning-card__text">習慣をつくり</span>',
      meaningCard1Html: '<span class="co-meaning-card__text">目標を叶え</span>',
      meaningCard2Html: '<span class="co-meaning-card__text">健康を守り</span>',
      meaningCard3Html: '<span class="co-meaning-card__text">旅を記録し</span>',
      meaningCard4Html: '<span class="co-meaning-card__text">家族の思い出を残し</span>',
      meaningCard5Html: '<span class="co-meaning-card__text">より良い暮らしをつなぎます</span>',
      aboutLead:
        "Newonは生産性、健康、金融、目標管理、旅行記録、家族の記録、ペットケアまで、日常の課題を解決するグローバルなライフプラットフォームです。",
      aboutCard0Html:
        '<span class="co-about-card__value">11+</span><span class="co-about-card__label">サービス運営</span>',
      workCard0Html: '<span class="co-work-card__text">習慣を記録し</span>',
      workCard1Html: '<span class="co-work-card__text">目標を達成し</span>',
      workCard2Html: '<span class="co-work-card__text">支出を管理し</span>',
      workCard3Html: '<span class="co-work-card__text">健康をケアし</span>',
      workCard4Html: '<span class="co-work-card__text">家族の時間を残し</span>',
      workCard5Html: '<span class="co-work-card__text">世界の旅を記録します</span>',
      productLi0: "習慣 · 目標 · 成長",
      productLi1: "金融 · 消費 · 節約",
      productLi2: "健康 · 生活",
      productLi3: "家族 · 記録 · ケア",
      productLi4: "AIベースのライフサービス",
      productLi5: "統合エコシステム",
      productLi0Html: PRODUCT_HTML.li0("習慣 · 目標 · 成長"),
      productLi1Html: PRODUCT_HTML.li1("金融 · 消費 · 節約"),
      productLi2Html: PRODUCT_HTML.li2("健康 · 生活"),
      productLi3Html: PRODUCT_HTML.li3("家族 · 記録 · ケア"),
      productLi4Html: PRODUCT_HTML.li4("AIベースのライフサービス"),
      productLi5Html: PRODUCT_HTML.li5("統合エコシステム"),
      productsExtraHtml: `現在のNewonは<br /><br />${APPS_LIST}<br /><br />そしてNewon+ですべてのサービスをつなぎます。`,
      visionP4Html: "11本のアプリから始め、数十のサービスがつながるグローバルなライフプラットフォームへ成長しています。",
      whyCard0Html:
        '<span class="co-stats-card__value">長く使う体験</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">流行の機能より</span><span class="co-stats-card__label-line">習慣・旅行・家族の記録を毎日開くアプリを。</span></span>',
      whyCard1Html:
        '<span class="co-stats-card__value">グローバルサービス</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">177か国 · 13言語</span><span class="co-stats-card__label-line">旅行記録まで世界とつながります。</span></span>',
      whyCard2Html:
        '<span class="co-stats-card__value">つながるライフ生態系</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">単体アプリを超え</span><span class="co-stats-card__label-line">習慣から旅行まで一つのプラットフォーム。</span></span>',
      statCard0Html:
        '<span class="co-stats-card__value">11+</span><span class="co-stats-card__label">サービス運営</span>',
      statNewonPlusHtml: `<strong>Newon+</strong><br />ひとつのサブスクで<br />すべてのNewonアプリを。<br /><br />${NEWON_PLUS_APPS}<br /><br />ひとつのアカウント。<br />ひとつのサブスク。<br />日常をつなぎます。`,
    },
    np: {
      imgShot1Alt: "Newon — アイデアをアプリに。11+アプリと1アカウントのライフプラットフォーム",
      imgShot5Alt: "Newon — 11+アプリ、177か国、13言語",
    },
  },
  es: {
    meta: {
      description:
        "Newon es un estudio de apps que convierte ideas en realidad. 11 apps de productividad, salud, finanzas, familia y viajes—OX MONTH, GoalUp, CountUp, Savy, SubPing, PiggyUp, Pillmate, BabyLog, PetLog, My World y Newon+.",
      keywords:
        "Newon, newon.app, estudio de apps, OX MONTH, GoalUp, CountUp, Savy, SubPing, PiggyUp, Pillmate, BabyLog, PetLog, My World, diario de viajes, rastreador de viajes, países visitados, mapa de viajes, travel journal, travel tracker",
      orgDescription: "Estudio de apps que convierte ideas en realidad · 11 apps de vida",
    },
    about: { statApps: "11 servicios de apps", lead: "Newon crea apps de productividad, finanzas, salud, familia y viajes." },
    footer: { statLine3: "11 apps publicadas" },
    home: {
      heroLeadHtml:
        "Newon no es una empresa que solo hace apps.<br /><br />Descubrimos pequeños problemas de la vida diaria y los convertimos en experiencias que la gente sigue usando: una plataforma de vida global.<br /><br />Hábitos, metas, salud, finanzas, registros familiares y diarios de viaje.<br /><br />Diseñamos servicios que hacen la vida más fácil y sostenible.",
      heroStat0: "11+ servicios",
      meaningCard0Html: '<span class="co-meaning-card__text">crear hábitos</span>',
      meaningCard1Html: '<span class="co-meaning-card__text">alcanzar metas</span>',
      meaningCard2Html: '<span class="co-meaning-card__text">cuidar la salud</span>',
      meaningCard3Html: '<span class="co-meaning-card__text">registrar viajes</span>',
      meaningCard4Html: '<span class="co-meaning-card__text">guardar recuerdos familiares</span>',
      meaningCard5Html: '<span class="co-meaning-card__text">conectar una vida mejor</span>',
      aboutLead:
        "Newon es una plataforma de vida global que resuelve problemas cotidianos de productividad, salud, finanzas, metas, diarios de viaje, registros familiares y cuidado de mascotas.",
      aboutCard0Html:
        '<span class="co-about-card__value">11+</span><span class="co-about-card__label">Servicios</span>',
      workCard0Html: '<span class="co-work-card__text">Registrar hábitos</span>',
      workCard1Html: '<span class="co-work-card__text">Alcanzar metas</span>',
      workCard2Html: '<span class="co-work-card__text">Gestionar gastos</span>',
      workCard3Html: '<span class="co-work-card__text">Cuidar la salud</span>',
      workCard4Html: '<span class="co-work-card__text">Capturar tiempo en familia</span>',
      workCard5Html: '<span class="co-work-card__text">Registrar los viajes del mundo</span>',
      productLi0: "Hábitos · Metas · Crecimiento",
      productLi1: "Finanzas · Consumo · Ahorro",
      productLi2: "Salud · Vida diaria",
      productLi3: "Familia · Registros · Cuidado",
      productLi4: "Servicios de vida con IA",
      productLi5: "Ecosistema unificado",
      productLi0Html: PRODUCT_HTML.li0("Hábitos · Metas · Crecimiento"),
      productLi1Html: PRODUCT_HTML.li1("Finanzas · Consumo · Ahorro"),
      productLi2Html: PRODUCT_HTML.li2("Salud · Vida diaria"),
      productLi3Html: PRODUCT_HTML.li3("Familia · Registros · Cuidado"),
      productLi4Html: PRODUCT_HTML.li4("Servicios de vida con IA"),
      productLi5Html: PRODUCT_HTML.li5("Ecosistema unificado"),
      productsExtraHtml: `Hoy Newon incluye<br /><br />${APPS_LIST}<br /><br />y Newon+ conecta todos los servicios.`,
      visionP4Html:
        "Partiendo de 11 apps, crecemos como plataforma de vida global donde docenas de servicios se conectan.",
      whyCard0Html:
        '<span class="co-stats-card__value">Experiencia duradera</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">No funciones de moda—</span><span class="co-stats-card__label-line">hábitos, viajes y familia que se abren cada día.</span></span>',
      whyCard1Html:
        '<span class="co-stats-card__value">Servicio global</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">177 países · 13 idiomas</span><span class="co-stats-card__label-line">también diarios de viaje en todo el mundo.</span></span>',
      whyCard2Html:
        '<span class="co-stats-card__value">Ecosistema de vida conectado</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">Más allá de una sola app—</span><span class="co-stats-card__label-line">de hábitos a viajes, una plataforma.</span></span>',
      statCard0Html:
        '<span class="co-stats-card__value">11+</span><span class="co-stats-card__label">Servicios</span>',
      statNewonPlusHtml: `<strong>Newon+</strong><br />Una suscripción<br />para todas las apps Newon.<br /><br />${NEWON_PLUS_APPS}<br /><br />Una cuenta.<br />Una suscripción.<br />La vida diaria, conectada.`,
    },
    np: {
      imgShot1Alt: "Newon — Ideas en apps; plataforma de vida con 11+ apps y una cuenta",
      imgShot5Alt: "Newon — 11+ apps, 177 países, 13 idiomas",
    },
  },
  "pt-br": {
    meta: {
      description:
        "A Newon é um estúdio de apps que transforma ideias em realidade. 11 apps de produtividade, saúde, finanças, família e viagens—OX MONTH, GoalUp, CountUp, Savy, SubPing, PiggyUp, Pillmate, BabyLog, PetLog, My World e Newon+.",
      keywords:
        "Newon, newon.app, estúdio de apps, OX MONTH, GoalUp, CountUp, Savy, SubPing, PiggyUp, Pillmate, BabyLog, PetLog, My World, diário de viagem, rastreador de viagem, países visitados, mapa de viagem, travel journal, travel tracker",
      orgDescription: "Estúdio de apps que transforma ideias em realidade · 11 apps de vida",
    },
    about: { statApps: "11 serviços de apps", lead: "A Newon cria apps de produtividade, finanças, saúde, família e viagens." },
    footer: { statLine3: "11 apps lançados" },
    home: {
      heroLeadHtml:
        "A Newon não é uma empresa que só faz apps.<br /><br />Descobrimos pequenos problemas do dia a dia e os transformamos em experiências que as pessoas continuam usando—uma plataforma de vida global.<br /><br />Hábitos, metas, saúde, finanças, registros familiares e diários de viagem.<br /><br />Projetamos serviços que tornam a vida mais fácil e sustentável.",
      heroStat0: "11+ serviços",
      meaningCard0Html: '<span class="co-meaning-card__text">criar hábitos</span>',
      meaningCard1Html: '<span class="co-meaning-card__text">alcançar metas</span>',
      meaningCard2Html: '<span class="co-meaning-card__text">proteger a saúde</span>',
      meaningCard3Html: '<span class="co-meaning-card__text">registrar viagens</span>',
      meaningCard4Html: '<span class="co-meaning-card__text">guardar memórias da família</span>',
      meaningCard5Html: '<span class="co-meaning-card__text">conectar uma vida melhor</span>',
      aboutLead:
        "A Newon é uma plataforma de vida global que resolve problemas do dia a dia em produtividade, saúde, finanças, metas, diários de viagem, registros familiares e cuidados com pets.",
      aboutCard0Html:
        '<span class="co-about-card__value">11+</span><span class="co-about-card__label">Serviços</span>',
      workCard0Html: '<span class="co-work-card__text">Registrar hábitos</span>',
      workCard1Html: '<span class="co-work-card__text">Alcançar metas</span>',
      workCard2Html: '<span class="co-work-card__text">Gerenciar gastos</span>',
      workCard3Html: '<span class="co-work-card__text">Cuidar da saúde</span>',
      workCard4Html: '<span class="co-work-card__text">Capturar tempo em família</span>',
      workCard5Html: '<span class="co-work-card__text">Registrar as viagens do mundo</span>',
      productLi0: "Hábitos · Metas · Crescimento",
      productLi1: "Finanças · Consumo · Economia",
      productLi2: "Saúde · Vida diária",
      productLi3: "Família · Registros · Cuidado",
      productLi4: "Serviços de vida com IA",
      productLi5: "Ecossistema unificado",
      productLi0Html: PRODUCT_HTML.li0("Hábitos · Metas · Crescimento"),
      productLi1Html: PRODUCT_HTML.li1("Finanças · Consumo · Economia"),
      productLi2Html: PRODUCT_HTML.li2("Saúde · Vida diária"),
      productLi3Html: PRODUCT_HTML.li3("Família · Registros · Cuidado"),
      productLi4Html: PRODUCT_HTML.li4("Serviços de vida com IA"),
      productLi5Html: PRODUCT_HTML.li5("Ecossistema unificado"),
      productsExtraHtml: `Hoje a Newon inclui<br /><br />${APPS_LIST}<br /><br />e o Newon+ conecta todos os serviços.`,
      visionP4Html:
        "Começando com 11 apps, crescemos como plataforma de vida global onde dezenas de serviços se conectam.",
      whyCard0Html:
        '<span class="co-stats-card__value">Experiência duradoura</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">Não recursos da moda—</span><span class="co-stats-card__label-line">hábitos, viagens e família abertos todo dia.</span></span>',
      whyCard1Html:
        '<span class="co-stats-card__value">Serviço global</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">177 países · 13 idiomas</span><span class="co-stats-card__label-line">incluindo diários de viagem no mundo todo.</span></span>',
      whyCard2Html:
        '<span class="co-stats-card__value">Ecossistema de vida conectado</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">Além de um único app—</span><span class="co-stats-card__label-line">de hábitos a viagens, uma plataforma.</span></span>',
      statCard0Html:
        '<span class="co-stats-card__value">11+</span><span class="co-stats-card__label">Serviços</span>',
      statNewonPlusHtml: `<strong>Newon+</strong><br />Uma assinatura<br />para todos os apps Newon.<br /><br />${NEWON_PLUS_APPS}<br /><br />Uma conta.<br />Uma assinatura.<br />O dia a dia, conectado.`,
    },
    np: {
      imgShot1Alt: "Newon — Ideias em apps; plataforma de vida com 11+ apps e uma conta",
      imgShot5Alt: "Newon — 11+ apps, 177 países, 13 idiomas",
    },
  },
};

// fr/de/hi/id: use English structure with localized numbers + product HTML + travel cards
function buildFromEn(localeOverrides) {
  const base = structuredClone(LANG.en);
  return deepMerge(base, localeOverrides);
}

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      target[k] = target[k] && typeof target[k] === "object" ? target[k] : {};
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

Object.assign(LANG, I18N_EXTRA);

LANG.fr = buildFromEn({
  meta: {
    description:
      "Newon est un studio d'apps qui transforme les idées en réalité. 11 apps pour la productivité, la santé, la finance, la famille et les voyages.",
    keywords:
      "Newon, journal de voyage, carte de voyage, pays visités, travel journal, travel tracker, My World, GoalUp, CountUp",
    orgDescription: "Studio d'apps qui transforme les idées en réalité · 11 apps de vie",
  },
  about: { statApps: "11 services d'apps" },
  footer: { statLine3: "11 apps publiées" },
  home: {
    heroStat0: "11+ services",
    aboutCard0Html:
      '<span class="co-about-card__value">11+</span><span class="co-about-card__label">Services</span>',
    meaningCard0Html: '<span class="co-meaning-card__text">créer des habitudes</span>',
    meaningCard1Html: '<span class="co-meaning-card__text">atteindre des objectifs</span>',
    meaningCard2Html: '<span class="co-meaning-card__text">protéger la santé</span>',
    meaningCard3Html: '<span class="co-meaning-card__text">enregistrer les voyages</span>',
    meaningCard4Html: '<span class="co-meaning-card__text">garder les souvenirs familiaux</span>',
    meaningCard5Html: '<span class="co-meaning-card__text">relier une vie meilleure</span>',
    workCard5Html: '<span class="co-work-card__text">Enregistrer les voyages du monde</span>',
    aboutLead:
      "Newon est une plateforme de vie mondiale qui résout les problèmes du quotidien : productivité, santé, finance, objectifs, journaux de voyage, famille et animaux.",
    heroLeadHtml:
      "Newon n'est pas une entreprise qui fait seulement des apps.<br /><br />Nous transformons de petits problèmes du quotidien en expériences durables—une plateforme de vie mondiale.<br /><br />Habitudes, objectifs, santé, finance, souvenirs familiaux, journaux de voyage.<br /><br />Nous concevons des services plus simples et durables.",
    productLi0Html: PRODUCT_HTML.li0("Habitudes · Objectifs · Croissance"),
    productLi1Html: PRODUCT_HTML.li1("Finance · Dépenses · Épargne"),
    productLi2Html: PRODUCT_HTML.li2("Santé · Vie quotidienne"),
    productLi3Html: PRODUCT_HTML.li3("Famille · Carnets · Soins"),
    productLi4Html: PRODUCT_HTML.li4("Services de vie IA"),
    productLi5Html: PRODUCT_HTML.li5("Écosystème unifié"),
    productLi2: "Santé · Vie quotidienne",
    productLi5: "Écosystème unifié",
    productsExtraHtml: `Aujourd'hui, Newon propose<br /><br />${APPS_LIST}<br /><br />et Newon+ relie tous les services.`,
    visionP4Html:
      "À partir de 11 apps, nous grandissons en plateforme de vie mondiale où des dizaines de services se connectent.",
    whyCard0Html:
      '<span class="co-stats-card__value">Expérience durable</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">Pas des fonctions à la mode—</span><span class="co-stats-card__label-line">habitudes, voyages et famille ouverts chaque jour.</span></span>',
    whyCard1Html:
      '<span class="co-stats-card__value">Portée mondiale</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">177 pays · 13 langues</span><span class="co-stats-card__label-line">y compris les journaux de voyage.</span></span>',
    whyCard2Html:
      '<span class="co-stats-card__value">Écosystème de vie connecté</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">Au-delà d\'une seule app—</span><span class="co-stats-card__label-line">des habitudes aux voyages, une plateforme.</span></span>',
    statCard0Html:
      '<span class="co-stats-card__value">11+</span><span class="co-stats-card__label">Services</span>',
    statNewonPlusHtml: `<strong>Newon+</strong><br />Un abonnement<br />pour toutes les apps Newon.<br /><br />${NEWON_PLUS_APPS}<br /><br />Un compte.<br />Un abonnement.<br />Le quotidien, connecté.`,
  },
  np: {
    imgShot1Alt: "Newon — Des idées en apps ; plateforme de vie avec 11+ apps et un compte",
    imgShot5Alt: "Newon — 11+ apps, 177 pays, 13 langues",
  },
});

LANG.de = buildFromEn({
  meta: {
    description:
      "Newon ist ein App-Studio, das Ideen Wirklichkeit werden lässt. 11 Apps für Produktivität, Gesundheit, Finanzen, Familie und Reisen.",
    keywords:
      "Newon, Reisetagebuch, Reise-Tracker, besuchte Länder, travel journal, travel tracker, My World, GoalUp, CountUp",
    orgDescription: "App-Studio, das Ideen Wirklichkeit werden lässt · 11 Life-Apps",
  },
  about: { statApps: "11 App-Dienste" },
  footer: { statLine3: "11 Apps veröffentlicht" },
  home: {
    heroStat0: "11+ Dienste",
    aboutCard0Html:
      '<span class="co-about-card__value">11+</span><span class="co-about-card__label">Dienste</span>',
    meaningCard0Html: '<span class="co-meaning-card__text">Gewohnheiten aufbauen</span>',
    meaningCard1Html: '<span class="co-meaning-card__text">Ziele erreichen</span>',
    meaningCard2Html: '<span class="co-meaning-card__text">Gesundheit schützen</span>',
    meaningCard3Html: '<span class="co-meaning-card__text">Reisen festhalten</span>',
    meaningCard4Html: '<span class="co-meaning-card__text">Familienerinnerungen bewahren</span>',
    meaningCard5Html: '<span class="co-meaning-card__text">ein besseres Leben verbinden</span>',
    workCard5Html: '<span class="co-work-card__text">Reisen der Welt festhalten</span>',
    aboutLead:
      "Newon ist eine globale Life-Plattform für Produktivität, Gesundheit, Finanzen, Ziele, Reisetagebücher, Familienaufzeichnungen und Haustiere.",
    heroLeadHtml:
      "Newon ist kein Unternehmen, das nur Apps baut.<br /><br />Wir verwandeln kleine Alltagsprobleme in Erfahrungen, die bleiben—eine globale Life-Plattform.<br /><br />Gewohnheiten, Ziele, Gesundheit, Finanzen, Familienaufzeichnungen, Reisetagebücher.<br /><br />Wir gestalten Dienste, die das Leben einfacher und nachhaltiger machen.",
    productLi0Html: PRODUCT_HTML.li0("Gewohnheiten · Ziele · Wachstum"),
    productLi1Html: PRODUCT_HTML.li1("Finanzen · Ausgaben · Sparen"),
    productLi2Html: PRODUCT_HTML.li2("Gesundheit · Alltag"),
    productLi3Html: PRODUCT_HTML.li3("Familie · Aufzeichnungen · Care"),
    productLi4Html: PRODUCT_HTML.li4("KI-gestützte Life-Dienste"),
    productLi5Html: PRODUCT_HTML.li5("Vereintes Ökosystem"),
    productLi2: "Gesundheit · Alltag",
    productLi5: "Vereintes Ökosystem",
    productsExtraHtml: `Heute umfasst Newon<br /><br />${APPS_LIST}<br /><br />und Newon+ verbindet alle Dienste.`,
    visionP4Html:
      "Ausgehend von 11 Apps wachsen wir zu einer globalen Life-Plattform, in der Dutzende Dienste verbunden sind.",
    whyCard0Html:
      '<span class="co-stats-card__value">Langlebige Erfahrung</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">Keine Trend-Features—</span><span class="co-stats-card__label-line">Gewohnheiten, Reisen und Familie, die man täglich öffnet.</span></span>',
    whyCard1Html:
      '<span class="co-stats-card__value">Globale Reichweite</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">177 Länder · 13 Sprachen</span><span class="co-stats-card__label-line">inklusive Reisetagebüchern weltweit.</span></span>',
    whyCard2Html:
      '<span class="co-stats-card__value">Verbundenes Life-Ökosystem</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">Mehr als eine App—</span><span class="co-stats-card__label-line">von Gewohnheiten bis Reisen, eine Plattform.</span></span>',
    statCard0Html:
      '<span class="co-stats-card__value">11+</span><span class="co-stats-card__label">Dienste</span>',
    statNewonPlusHtml: `<strong>Newon+</strong><br />Ein Abo<br />für alle Newon-Apps.<br /><br />${NEWON_PLUS_APPS}<br /><br />Ein Konto.<br />Ein Abo.<br />Der Alltag, verbunden.`,
  },
  np: {
    imgShot1Alt: "Newon — Ideen zu Apps; Life-Plattform mit 11+ Apps und einem Konto",
    imgShot5Alt: "Newon — 11+ Apps, 177 Länder, 13 Sprachen",
  },
});

LANG.hi = buildFromEn({
  meta: {
    description:
      "Newon एक ऐप स्टूडियो है जो विचारों को वास्तविकता बनाता है। उत्पादकता, स्वास्थ्य, वित्त, परिवार और यात्रा के लिए 11 ऐप्स।",
    keywords:
      "Newon, यात्रा जर्नल, यात्रा ट्रैकर, देखे गए देश, travel journal, travel tracker, My World",
    orgDescription: "विचारों को वास्तविकता बनाने वाला ऐप स्टूडियो · 11 लाइफ ऐप्स",
  },
  about: { statApps: "11 ऐप सेवाएँ" },
  footer: { statLine3: "11 ऐप्स जारी" },
  home: {
    heroStat0: "11+ सेवाएँ",
    aboutCard0Html:
      '<span class="co-about-card__value">11+</span><span class="co-about-card__label">सेवाएँ</span>',
    meaningCard0Html: '<span class="co-meaning-card__text">आदतें बनाना</span>',
    meaningCard1Html: '<span class="co-meaning-card__text">लक्ष्य पूरा करना</span>',
    meaningCard2Html: '<span class="co-meaning-card__text">स्वास्थ्य बचाना</span>',
    meaningCard3Html: '<span class="co-meaning-card__text">यात्राएँ लिखना</span>',
    meaningCard4Html: '<span class="co-meaning-card__text">पारिवारिक यादें रखना</span>',
    meaningCard5Html: '<span class="co-meaning-card__text">बेहतर जीवन जोड़ना</span>',
    workCard5Html: '<span class="co-work-card__text">दुनिया की यात्राएँ दर्ज करना</span>',
    aboutLead:
      "Newon एक वैश्विक लाइफ प्लेटफ़ॉर्म है—उत्पादकता, स्वास्थ्य, वित्त, लक्ष्य, यात्रा जर्नल, परिवार और पालतू देखभाल।",
    heroLeadHtml:
      "Newon केवल ऐप बनाने वाली कंपनी नहीं है।<br /><br />हम रोज़मर्रा की छोटी समस्याओं को लंबे समय तक चलने वाले अनुभवों में बदलते हैं—एक वैश्विक लाइफ प्लेटफ़ॉर्म।<br /><br />आदतें, लक्ष्य, स्वास्थ्य, वित्त, पारिवारिक रिकॉर्ड, यात्रा जर्नल।<br /><br />हम जीवन को आसान और टिकाऊ बनाने वाली सेवाएँ डिज़ाइन करते हैं।",
    productLi0Html: PRODUCT_HTML.li0("आदत · लक्ष्य · विकास"),
    productLi1Html: PRODUCT_HTML.li1("वित्त · खर्च · बचत"),
    productLi2Html: PRODUCT_HTML.li2("स्वास्थ्य · दैनिक जीवन"),
    productLi3Html: PRODUCT_HTML.li3("परिवार · रिकॉर्ड · देखभाल"),
    productLi4Html: PRODUCT_HTML.li4("AI जीवन सेवाएँ"),
    productLi5Html: PRODUCT_HTML.li5("एकीकृत पारिस्थितिकी"),
    productLi2: "स्वास्थ्य · दैनिक जीवन",
    productLi5: "एकीकृत पारिस्थितिकी",
    productsExtraHtml: `आज Newon में<br /><br />${APPS_LIST}<br /><br />और Newon+ सभी सेवाओं को जोड़ता है।`,
    visionP4Html:
      "11 ऐप्स से शुरू करके हम एक वैश्विक लाइफ प्लेटफ़ॉर्म बन रहे हैं जहाँ दर्जनों सेवाएँ जुड़ती हैं।",
    whyCard0Html:
      '<span class="co-stats-card__value">टिकाऊ अनुभव</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">ट्रेंडी फीचर नहीं—</span><span class="co-stats-card__label-line">आदत, यात्रा और परिवार जो रोज़ खुलते हैं।</span></span>',
    whyCard1Html:
      '<span class="co-stats-card__value">वैश्विक पहुँच</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">177 देश · 13 भाषाएँ</span><span class="co-stats-card__label-line">यात्रा जर्नल सहित।</span></span>',
    whyCard2Html:
      '<span class="co-stats-card__value">जुड़ा लाइफ इकोसिस्टम</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">एक ऐप से आगे—</span><span class="co-stats-card__label-line">आदत से यात्रा तक, एक प्लेटफ़ॉर्म।</span></span>',
    statCard0Html:
      '<span class="co-stats-card__value">11+</span><span class="co-stats-card__label">सेवाएँ</span>',
    statNewonPlusHtml: `<strong>Newon+</strong><br />एक सब्सक्रिप्शन<br />सभी Newon ऐप्स के लिए।<br /><br />${NEWON_PLUS_APPS}<br /><br />एक खाता।<br />एक सब्सक्रिप्शन।<br />रोज़ की ज़िंदगी, जुड़ी हुई।`,
  },
  np: {
    imgShot1Alt: "Newon — विचारों से ऐप; 11+ ऐप और एक खाते वाला लाइफ प्लेटफ़ॉर्म",
    imgShot5Alt: "Newon — 11+ ऐप, 177 देश, 13 भाषाएँ",
  },
});

LANG.id = buildFromEn({
  meta: {
    description:
      "Newon adalah studio aplikasi yang mewujudkan ide. 11 aplikasi untuk produktivitas, kesehatan, keuangan, keluarga, dan perjalanan.",
    keywords:
      "Newon, jurnal perjalanan, pelacak perjalanan, negara dikunjungi, travel journal, travel tracker, My World",
    orgDescription: "Studio aplikasi yang mewujudkan ide · 11 aplikasi kehidupan",
  },
  about: { statApps: "11 layanan aplikasi" },
  footer: { statLine3: "11 aplikasi dirilis" },
  home: {
    heroStat0: "11+ layanan",
    aboutCard0Html:
      '<span class="co-about-card__value">11+</span><span class="co-about-card__label">Layanan</span>',
    meaningCard0Html: '<span class="co-meaning-card__text">membangun kebiasaan</span>',
    meaningCard1Html: '<span class="co-meaning-card__text">mencapai tujuan</span>',
    meaningCard2Html: '<span class="co-meaning-card__text">menjaga kesehatan</span>',
    meaningCard3Html: '<span class="co-meaning-card__text">mencatat perjalanan</span>',
    meaningCard4Html: '<span class="co-meaning-card__text">menyimpan kenangan keluarga</span>',
    meaningCard5Html: '<span class="co-meaning-card__text">menghubungkan hidup yang lebih baik</span>',
    workCard5Html: '<span class="co-work-card__text">Mencatat perjalanan dunia</span>',
    aboutLead:
      "Newon adalah platform kehidupan global yang menyelesaikan masalah sehari-hari: produktivitas, kesehatan, keuangan, tujuan, jurnal perjalanan, catatan keluarga, dan perawatan hewan.",
    heroLeadHtml:
      "Newon bukan perusahaan yang hanya membuat aplikasi.<br /><br />Kami mengubah masalah kecil sehari-hari menjadi pengalaman yang terus dipakai—platform kehidupan global.<br /><br />Kebiasaan, tujuan, kesehatan, keuangan, catatan keluarga, jurnal perjalanan.<br /><br />Kami merancang layanan yang membuat hidup lebih mudah dan berkelanjutan.",
    productLi0Html: PRODUCT_HTML.li0("Kebiasaan · Tujuan · Pertumbuhan"),
    productLi1Html: PRODUCT_HTML.li1("Keuangan · Pengeluaran · Hemat"),
    productLi2Html: PRODUCT_HTML.li2("Kesehatan · Kehidupan sehari-hari"),
    productLi3Html: PRODUCT_HTML.li3("Keluarga · Catatan · Perawatan"),
    productLi4Html: PRODUCT_HTML.li4("Layanan kehidupan berbasis AI"),
    productLi5Html: PRODUCT_HTML.li5("Ekosistem terpadu"),
    productLi2: "Kesehatan · Kehidupan sehari-hari",
    productLi5: "Ekosistem terpadu",
    productsExtraHtml: `Hari ini Newon mencakup<br /><br />${APPS_LIST}<br /><br />dan Newon+ menghubungkan semua layanan.`,
    visionP4Html:
      "Mulai dari 11 aplikasi, kami tumbuh menjadi platform kehidupan global di mana puluhan layanan saling terhubung.",
    whyCard0Html:
      '<span class="co-stats-card__value">Pengalaman yang bertahan</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">Bukan fitur tren—</span><span class="co-stats-card__label-line">kebiasaan, perjalanan, dan keluarga yang dibuka setiap hari.</span></span>',
    whyCard1Html:
      '<span class="co-stats-card__value">Jangkauan global</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">177 negara · 13 bahasa</span><span class="co-stats-card__label-line">termasuk jurnal perjalanan di seluruh dunia.</span></span>',
    whyCard2Html:
      '<span class="co-stats-card__value">Ekosistem kehidupan terhubung</span><span class="co-stats-card__label"><span class="co-stats-card__label-line">Lebih dari satu aplikasi—</span><span class="co-stats-card__label-line">dari kebiasaan hingga perjalanan, satu platform.</span></span>',
    statCard0Html:
      '<span class="co-stats-card__value">11+</span><span class="co-stats-card__label">Layanan</span>',
    statNewonPlusHtml: `<strong>Newon+</strong><br />Satu langganan<br />untuk semua aplikasi Newon.<br /><br />${NEWON_PLUS_APPS}<br /><br />Satu akun.<br />Satu langganan.<br />Kehidupan sehari-hari, terhubung.`,
  },
  np: {
    imgShot1Alt: "Newon — Ide jadi app; platform kehidupan dengan 11+ app dan satu akun",
    imgShot5Alt: "Newon — 11+ app, 177 negara, 13 bahasa",
  },
});

function applyPatch(obj, patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      obj[k] = obj[k] && typeof obj[k] === "object" ? obj[k] : {};
      applyPatch(obj[k], v);
    } else {
      obj[k] = v;
    }
  }
}

for (const lang of Object.keys(LANG)) {
  const file = path.join(LOCALES, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  applyPatch(j, LANG[lang]);
  // Keep og/twitter titles in sync with description updates where we set them
  if (LANG[lang].meta?.ogDescription) {
    j.meta.ogDescription = LANG[lang].meta.ogDescription;
  }
  if (LANG[lang].meta?.twitterDescription) {
    j.meta.twitterDescription = LANG[lang].meta.twitterDescription;
  }
  if (LANG[lang].meta?.description && !LANG[lang].meta?.ogDescription) {
    j.meta.ogDescription = LANG[lang].meta.description;
  }
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
  console.log("apply-home-11-apps:", lang);
}

// Residual 10→11 sweep for fields not explicitly patched
const residual = [
  [/10\+/g, "11+"],
  [/Starting from 10 apps/g, "Starting from 11 apps"],
  [/• 10 /g, "• 11 "],
  [/Partiendo de 10 apps/g, "Partiendo de 11 apps"],
  [/À partir de 10 apps/g, "À partir de 11 apps"],
  [/Começando com 10 apps/g, "Começando com 11 apps"],
  [/Mit 10 Apps/g, "Mit 11 Apps"],
  [/Dari 10 aplikasi/g, "Dari 11 aplikasi"],
  [/10 ऐप से/g, "11 ऐप से"],
  [/10개의 앱/g, "11개의 앱"],
  [/10개 앱/g, "11개 앱"],
  [/10本/g, "11本"],
  [/\b10 apps\b/g, "11 apps"],
];
function fixStr(str) {
  let out = str;
  for (const [re, to] of residual) out = out.replace(re, to);
  return out;
}
function deepFix(obj) {
  if (typeof obj === "string") return fixStr(obj);
  if (Array.isArray(obj)) return obj.map(deepFix);
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) obj[k] = deepFix(obj[k]);
  }
  return obj;
}
for (const lang of Object.keys(LANG)) {
  const file = path.join(LOCALES, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  deepFix(j);
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
}
console.log("Residual 10→11 sweep: OK");

console.log("apply-home-11-apps: OK");
