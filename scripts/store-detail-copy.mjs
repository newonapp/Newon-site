/**
 * Store product detail copy — Brand Strategy–quality narrative (KO/EN).
 * Hub card short blurbs stay in resources-data.mjs; this drives detail pages only.
 */

export const STORE_DETAIL_UI = {
  ko: {
    crumbResources: "리소스",
    crumbStore: "스토어",
    overviewEyebrow: "개요",
    whoEyebrow: "대상",
    whoTitle: "이런 분에게 필요합니다.",
    whatEyebrow: "구성 모듈",
    whatTitle: "무엇을 다룹니다.",
    includesEyebrow: "포함 내용",
    includesTitle: "기본 구성",
    includesLead: "제품에 포함된 핵심 항목입니다. 공개 시 세부 포맷은 조정될 수 있습니다.",
    outcomesEyebrow: "결과",
    outcomesTitle: "작업을 마치면 남습니다.",
    previewEyebrow: "미리보기",
    previewNote: "미리보기 · 실제 데이터 아님",
    howToEyebrow: "사용 방법",
    howToTitle: "이렇게 사용합니다.",
    formatEyebrow: "포맷",
    formatTitle: "제공 형식",
    faqEyebrow: "FAQ",
    faqTitle: "자주 묻는 질문",
    releaseEyebrow: "출시 알림",
    statusComingSoon: "COMING SOON",
    statusInDevelopment: "IN DEVELOPMENT",
    statusBody:
      "현재 Newon에서 제작 중인 리소스입니다.\n완성된 제품만 공개할 예정입니다.",
    backStore: "← 스토어로 돌아가기",
    prevProduct: "이전 제품",
    nextProduct: "다음 제품",
    heroIncludesCta: "구성 보기 ↓",
    heroNotifyCta: "출시 알림 받기 →",
    heroProcessCta: "사용 방법 보기 ↓",
    ctaSecondary: "스토어 보기 →",
    noticeEyebrow: "안내",
    comingSoonBadge: "COMING SOON",
    inDevBadge: "IN DEVELOPMENT",
    includesLabel: "Includes",
    formatLabel: "Format",
    forLabel: "For",
    statusLabel: "Status",
    finalTitle: "준비되는 대로\n알려드리겠습니다.",
    finalLead: "완성된 제품만 공개합니다. 이메일을 남겨 주시면 출시 시 안내드립니다.",
  },
  en: {
    crumbResources: "Resources",
    crumbStore: "Store",
    overviewEyebrow: "OVERVIEW",
    whoEyebrow: "WHO IT'S FOR",
    whoTitle: "Built for people who need clarity before they ship.",
    whatEyebrow: "MODULES",
    whatTitle: "What you work through.",
    includesEyebrow: "INCLUDED",
    includesTitle: "What's included",
    includesLead: "Core items in this product. Exact formats may refine before release.",
    outcomesEyebrow: "OUTCOMES",
    outcomesTitle: "What you leave with.",
    previewEyebrow: "PREVIEW",
    previewNote: "Preview · sample data only",
    howToEyebrow: "HOW TO USE",
    howToTitle: "How to use it.",
    formatEyebrow: "FORMAT",
    formatTitle: "Formats",
    faqEyebrow: "FAQ",
    faqTitle: "Frequently asked questions",
    releaseEyebrow: "GET NOTIFIED",
    statusComingSoon: "COMING SOON",
    statusInDevelopment: "IN DEVELOPMENT",
    statusBody:
      "This resource is currently being built at Newon.\nWe only publish finished products.",
    backStore: "← Back to Store",
    prevProduct: "Previous product",
    nextProduct: "Next product",
    heroIncludesCta: "What's included ↓",
    heroNotifyCta: "Get notified →",
    heroProcessCta: "How to use ↓",
    ctaSecondary: "View Store →",
    noticeEyebrow: "NOTICE",
    comingSoonBadge: "COMING SOON",
    inDevBadge: "IN DEVELOPMENT",
    includesLabel: "Includes",
    formatLabel: "Format",
    forLabel: "For",
    statusLabel: "Status",
    finalTitle: "We'll let you know\nwhen it's ready.",
    finalLead: "We only publish finished products. Leave your email and we'll notify you at launch.",
  },
};

/** @type {Record<string, object>} */
export const STORE_DETAILS = {
  "app-launch-kit": {
    preview: "launch-checklist",
    categoryEyebrow: "STORE · APP LAUNCH",
    title: "App Launch Kit",
    previewNameKo: "Launch Checklist Preview",
    previewNameEn: "Launch Checklist Preview",
    heroTitleKo: "출시 전에 해야 할 일을\n한 흐름으로 정리합니다.",
    heroTitleEn: "Organize everything before launch\ninto one clear flow.",
    heroLeadKo:
      "앱 출시는 기능을 끝내는 순간이 아닙니다.\n\n무엇을 출시할지 정의하고,\n스토어에 올릴 문장을 쓰고,\nQA와 마케팅, 출시 후 리뷰까지\n같은 체크리스트 위에서 움직여야 합니다.\n\nApp Launch Kit은 아이디어를 스토어에 올리기까지\n놓치기 쉬운 작업을 단계별로 붙잡아 둡니다.",
    heroLeadEn:
      "Shipping an app is not the moment coding stops.\n\nYou still need to define what ships,\nwrite store copy,\nrun QA, prepare early marketing,\nand review what happens after launch.\n\nApp Launch Kit holds those easy-to-miss steps\nin one practical flow — from idea to store.",
    overviewTitleKo: "만들기만 하면\n출시가 되지 않습니다.",
    overviewTitleEn: "Building is not the same\nas launching.",
    overviewBodyKo: [
      "많은 제품이 개발은 끝났는데도\n출시 준비에서 멈춥니다.",
      "계정, 정책, 메타데이터, 스크린샷, QA,\n공지 문구, 초기 채널 —\n각각은 작아 보이지만 빠지면 공개가 미뤄집니다.",
      "이 키트는 제품 정의부터 출시 후 리뷰까지\n하나의 출시 작업 흐름으로 묶어 줍니다.",
    ],
    overviewBodyEn: [
      "Many products finish building\nand still stall before going live.",
      "Accounts, policies, metadata, screenshots, QA,\nannouncement copy, early channels —\neach item looks small until one missing piece delays ship day.",
      "This kit binds product definition through post-launch review\ninto a single launch workflow.",
    ],
    whoTitleKo: "이런 사람과 팀에게 필요합니다.",
    whoTitleEn: "Who this kit is for.",
    whoKo: [
      {
        t: "INDIE MAKERS",
        d: "혼자 또는 소규모로 앱을 만들며\n출시 전에 무엇을 점검해야 할지\n기준이 필요한 경우",
      },
      {
        t: "FIRST-TIME SHIPPERS",
        d: "첫 앱스토어 등록을 앞두고\n메타데이터·정책·QA 순서를\n한 번에 보고 싶은 경우",
      },
      {
        t: "SMALL PRODUCT TEAMS",
        d: "개발·디자인·마케팅이 나뉘어 있어\n출시 전 할 일을\n공유 가능한 문서로 모아야 하는 경우",
      },
      {
        t: "SIDE PROJECT BUILDERS",
        d: "사이드 프로젝트라도\n스토어에 올리는 순간부터는\n제품처럼 다루고 싶은 경우",
      },
      {
        t: "PRE-LAUNCH FOUNDERS",
        d: "기능 목록은 있지만\n출시일·공지·초기 사용자 확보까지\n한 타임라인으로 묶지 못한 경우",
      },
      {
        t: "POST-BUILD TEAMS",
        d: "코드는 거의 끝났는데\n공개 전 체크리스트가 없어\n막연히 미루고 있는 경우",
      },
    ],
    whoEn: [
      {
        t: "INDIE MAKERS",
        d: "Building alone or in a tiny team\nand needing a clear pre-launch checklist\nbefore hitting submit",
      },
      {
        t: "FIRST-TIME SHIPPERS",
        d: "Facing a first store listing\nand wanting metadata, policy, and QA\nin one readable order",
      },
      {
        t: "SMALL PRODUCT TEAMS",
        d: "Split across build, design, and marketing\nand needing a shared launch document\neveryone can work from",
      },
      {
        t: "SIDE PROJECT BUILDERS",
        d: "Treating a side project seriously\nthe moment it enters an app store",
      },
      {
        t: "PRE-LAUNCH FOUNDERS",
        d: "With a feature list but no single timeline\nfor ship day, announcements, and early users",
      },
      {
        t: "POST-BUILD TEAMS",
        d: "Nearly done coding\nyet stalled without a concrete\npre-publish checklist",
      },
    ],
    whatTitleKo: "출시에 필요한 작업을\n모듈로 나눕니다.",
    whatTitleEn: "Launch work,\nbroken into modules.",
    whatKo: [
      {
        t: "PRODUCT DEFINITION",
        d: "아이디어, 문제, 사용자, 핵심 가치를\n출시 전에 한 장으로 고정합니다.\n무엇을 출시하는지 먼저 말하게 합니다.",
      },
      {
        t: "MVP SCOPE",
        d: "첫 출시에 넣을 것과\n다음으로 미룰 것을 분리합니다.\n범위가 흔들리면 출시일도 흔들립니다.",
      },
      {
        t: "PRE-LAUNCH CHECKLIST",
        d: "계정, 정책, 분석 도구, 테스트 계정 등\n공개 전에 끝나야 하는\n운영·설정 항목을 점검합니다.",
      },
      {
        t: "APP STORE METADATA",
        d: "앱 이름, Subtitle, Description, Keywords,\n스크린샷 구성까지\n스토어에 올릴 문장을 정리합니다.",
      },
      {
        t: "QA CHECKLIST",
        d: "기능, UI, 디바이스, 예외 상황을\n출시 기준으로 테스트합니다.\n‘대충 된다’를 없앱니다.",
      },
      {
        t: "LAUNCH TIMELINE",
        d: "출시 전·당일·이후 할 일을\n일정으로 배치합니다.\n누가 무엇을 언제 하는지 보이게 합니다.",
      },
      {
        t: "MARKETING STARTER",
        d: "SNS, 랜딩, 초기 사용자 확보를 위한\n최소 준비를 적습니다.\n출시와 알림이 동시에 가게 합니다.",
      },
      {
        t: "POST-LAUNCH REVIEW",
        d: "리뷰, 버그, 사용자 반응, 다음 업데이트를\n출시 직후 다시 모읍니다.\n출시는 끝이 아니라 다음 주기의 시작입니다.",
      },
    ],
    whatEn: [
      {
        t: "PRODUCT DEFINITION",
        d: "Lock idea, problem, user, and core value\non one page before launch.\nSay clearly what you are shipping.",
      },
      {
        t: "MVP SCOPE",
        d: "Separate must-ship features from later work.\nIf scope drifts, ship day drifts with it.",
      },
      {
        t: "PRE-LAUNCH CHECKLIST",
        d: "Accounts, policies, analytics, test accounts —\nthe operational setup that must finish\nbefore you go public.",
      },
      {
        t: "APP STORE METADATA",
        d: "Name, subtitle, description, keywords,\nand screenshot structure —\nthe copy that lives on the store page.",
      },
      {
        t: "QA CHECKLIST",
        d: "Function, UI, devices, and edge cases\nagainst a launch bar.\nRemove “it mostly works.”",
      },
      {
        t: "LAUNCH TIMELINE",
        d: "Place pre-launch, day-of, and post-launch work\non a shared schedule.\nMake ownership visible.",
      },
      {
        t: "MARKETING STARTER",
        d: "Minimum prep for social, landing,\nand early-user channels\nso launch and notice move together.",
      },
      {
        t: "POST-LAUNCH REVIEW",
        d: "Collect reviews, bugs, reactions, and next updates\nright after ship.\nLaunch is the start of the next cycle.",
      },
    ],
    includesKo: [
      "Product Definition Sheet",
      "MVP Scope Matrix",
      "Pre-launch Checklist",
      "App Store Metadata Draft",
      "QA Checklist",
      "Launch Timeline",
      "Marketing Starter Notes",
      "Post-launch Review Sheet",
      "Announcement Copy Outline",
      "Store Asset Checklist",
    ],
    includesEn: [
      "Product Definition Sheet",
      "MVP Scope Matrix",
      "Pre-launch Checklist",
      "App Store Metadata Draft",
      "QA Checklist",
      "Launch Timeline",
      "Marketing Starter Notes",
      "Post-launch Review Sheet",
      "Announcement Copy Outline",
      "Store Asset Checklist",
    ],
    outcomesTitleKo: "출시 준비가\n문서로 남습니다.",
    outcomesTitleEn: "Launch readiness\nas a working document.",
    outcomesKo: [
      {
        t: "SHIP DEFINITION",
        d: "이번 버전에 무엇을 내는지\n팀이 같은 문장으로 말할 수 있습니다.",
      },
      {
        t: "STORE-READY COPY",
        d: "스토어 메타와 공지 초안이\n흩어진 메모가 아니라 한곳에 모입니다.",
      },
      {
        t: "LAUNCH SEQUENCE",
        d: "출시 전후 할 일이 일정과 소유자로\n추적 가능한 상태가 됩니다.",
      },
      {
        t: "POST-SHIP LOOP",
        d: "출시 직후 리뷰·버그·다음 작업을\n바로 이어받을 기준이 생깁니다.",
      },
    ],
    outcomesEn: [
      {
        t: "SHIP DEFINITION",
        d: "The team can say, in one sentence,\nwhat this version ships.",
      },
      {
        t: "STORE-READY COPY",
        d: "Store metadata and announcement drafts\nlive in one place — not scattered notes.",
      },
      {
        t: "LAUNCH SEQUENCE",
        d: "Pre- and post-launch work becomes\ntrackable by schedule and owner.",
      },
      {
        t: "POST-SHIP LOOP",
        d: "You have a clear handoff into reviews, bugs,\nand the next update cycle.",
      },
    ],
    howToKo: [
      {
        n: "01",
        title: "출시 버전을 한 문장으로 쓰기",
        body: "이번 스토어 제출에 넣는 제품 범위와\n넣지 않는 범위를 Product Definition에 먼저 적습니다.",
      },
      {
        n: "02",
        title: "Must-ship만 남기기",
        body: "MVP Scope에서 기능을 걸러\n출시일에 반드시 필요한 것만 남깁니다.",
      },
      {
        n: "03",
        title: "스토어 문장부터 채우기",
        body: "이름·Subtitle·Description·Keywords를\n개발 막바지와 병렬로 작성합니다.",
      },
      {
        n: "04",
        title: "QA를 출시 기준으로 돌리기",
        body: "기기·예외·결제·온보딩을\n체크리스트에 맞춰 통과 여부를 기록합니다.",
      },
      {
        n: "05",
        title: "출시 당일과 다음 주를 배치하기",
        body: "Timeline에 공지·모니터링·리뷰 대응을 넣고\n출시 후 Review 시트로 바로 이어갑니다.",
      },
    ],
    howToEn: [
      {
        n: "01",
        title: "Write the ship sentence",
        body: "State what this store submission includes —\nand excludes — on the Product Definition sheet first.",
      },
      {
        n: "02",
        title: "Keep only must-ship",
        body: "Use MVP Scope to cut features\ndown to what must land on launch day.",
      },
      {
        n: "03",
        title: "Fill store copy early",
        body: "Draft name, subtitle, description, and keywords\nin parallel with late-stage build work.",
      },
      {
        n: "04",
        title: "Run QA against the launch bar",
        body: "Record pass/fail for devices, edge cases,\npayments, and onboarding on the checklist.",
      },
      {
        n: "05",
        title: "Place day-of and week-after",
        body: "Put announcements, monitoring, and review response\non the Timeline, then continue into the Review sheet.",
      },
    ],
    formatKo: ["Checklist", "Workspace Template", "Launch Timeline", "Planning Sheets"],
    formatEn: ["Checklist", "Workspace Template", "Launch Timeline", "Planning Sheets"],
    faqKo: [
      {
        q: "개발이 끝나지 않아도 쓸 수 있나요?",
        a: "가능합니다. 제품 정의와 범위, 스토어 메타는 개발 후반과 함께 채우는 것이 오히려 출시를 앞당깁니다.",
      },
      {
        q: "iOS와 Android 모두에 맞나요?",
        a: "공통 출시 흐름을 기준으로 구성합니다. 스토어별 세부 항목은 메타·정책 모듈에서 각각 점검할 수 있습니다.",
      },
      {
        q: "마케팅 대행이나 광고 세팅도 포함되나요?",
        a: "포함되지 않습니다. Marketing Starter는 초기 채널과 공지 준비를 위한 최소 골격입니다.",
      },
      {
        q: "팀이 여러 명이어도 같이 쓸 수 있나요?",
        a: "가능합니다. Timeline과 체크리스트를 공유 문서로 두고 소유자를 나누는 방식을 권장합니다.",
      },
    ],
    faqEn: [
      {
        q: "Can we use it before development is finished?",
        a: "Yes. Product definition, scope, and store copy often move faster when filled in parallel with late-stage build work.",
      },
      {
        q: "Does it cover both iOS and Android?",
        a: "It is built around a shared launch flow. Store-specific items can be checked separately in the metadata and policy modules.",
      },
      {
        q: "Does it include paid ads or agency marketing?",
        a: "No. Marketing Starter is a minimum skeleton for early channels and announcements.",
      },
      {
        q: "Can a multi-person team use it together?",
        a: "Yes. Share the timeline and checklists as a living document and assign owners per section.",
      },
    ],
  },

  "mvp-planning-kit": {
    preview: "mvp-flow",
    categoryEyebrow: "STORE · MVP",
    title: "MVP Planning Kit",
    previewNameKo: "MVP Flow Preview",
    previewNameEn: "MVP Flow Preview",
    heroTitleKo: "만들기 전에\n무엇을 만들지 정합니다.",
    heroTitleEn: "Decide what to build\nbefore you build it.",
    heroLeadKo:
      "아이디어가 있다고 바로 개발을 시작하면\n범위는 늘고 검증은 늦어집니다.\n\n문제가 무엇인지,\n누가 쓰는지,\n첫 버전에 무엇이 들어가야 하는지를\n먼저 문장으로 고정해야 합니다.\n\nMVP Planning Kit은 가설과 범위를\n코드보다 앞에 두는 기획 시스템입니다.",
    heroLeadEn:
      "Starting to build the moment you have an idea\nusually grows scope and delays learning.\n\nName the problem,\nname the user,\nand lock what belongs in version one —\nin sentences, before code.\n\nMVP Planning Kit puts hypotheses and scope\nahead of implementation.",
    overviewTitleKo: "MVP는 작은 기능 목록이 아닙니다.",
    overviewTitleEn: "An MVP is not a short feature list.",
    overviewBodyKo: [
      "MVP는 ‘조금만 만들기’가 아니라\n검증할 가설을 고르는 결정입니다.",
      "문제 → 사용자 → 가치 제안 → 핵심 흐름 →\n우선순위 → 범위 → 검증 기준까지\n순서가 있어야 첫 버전이 흔들리지 않습니다.",
      "이 키트는 그 순서를 워크시트로 고정해\n만들기에 들어가기 전 합의를 만듭니다.",
    ],
    overviewBodyEn: [
      "MVP is not “build less.”\nIt is choosing which hypothesis to test.",
      "Problem → user → value → core flow →\npriority → scope → validation criteria —\nthat order keeps version one from drifting.",
      "This kit locks that sequence into worksheets\nso the team agrees before build starts.",
    ],
    whoTitleKo: "이런 사람과 팀에게 필요합니다.",
    whoTitleEn: "Who this kit is for.",
    whoKo: [
      {
        t: "FOUNDERS",
        d: "아이디어는 있는데\n첫 제품에 무엇을 넣을지\n아직 한 문장으로 말하지 못하는 경우",
      },
      {
        t: "PRODUCT MANAGERS",
        d: "이해관계자마다 원하는 기능이 달라\n범위를 잘라낼 기준이 필요한 경우",
      },
      {
        t: "INDIE HACKERS",
        d: "혼자 만들더라도\n가설·범위·검증을\n문서로 남기고 싶은 경우",
      },
      {
        t: "DEVELOPERS",
        d: "구현을 시작하기 전에\n‘무엇을 만들지’가\n명세처럼 정리되길 원하는 경우",
      },
      {
        t: "EARLY TEAMS",
        d: "프로토타입과 MVP, V1이 섞여\n지금 단계의 목표가 흐려진 경우",
      },
      {
        t: "PIVOT MOMENTS",
        d: "방향을 바꾸려 할 때\n새 가설과 새 범위를\n다시 쓰고 싶은 경우",
      },
    ],
    whoEn: [
      {
        t: "FOUNDERS",
        d: "With an idea but no single sentence\nfor what belongs in the first product",
      },
      {
        t: "PRODUCT MANAGERS",
        d: "Balancing stakeholder feature requests\nand needing a fair way to cut scope",
      },
      {
        t: "INDIE HACKERS",
        d: "Building alone but still wanting\nhypothesis, scope, and validation\nwritten down",
      },
      {
        t: "DEVELOPERS",
        d: "Wanting “what we build”\nto read like a clear brief\nbefore implementation starts",
      },
      {
        t: "EARLY TEAMS",
        d: "Where prototype, MVP, and V1 blur\nand the current stage goal is unclear",
      },
      {
        t: "PIVOT MOMENTS",
        d: "Rewriting a new hypothesis and scope\nwhen direction needs to change",
      },
    ],
    whatTitleKo: "결정의 순서를\n워크시트로 만듭니다.",
    whatTitleEn: "A worksheet for\neach decision in order.",
    whatKo: [
      {
        t: "PROBLEM DEFINITION",
        d: "사용자가 실제로 해결하고 싶은 문제를\n추측이 아닌 문장으로 적습니다.\n문제가 흐리면 기능도 흐립니다.",
      },
      {
        t: "TARGET USER",
        d: "초기 핵심 사용자와\n사용이 일어나는 상황을 정리합니다.\n모두를 위한 제품은 첫 MVP가 되기 어렵습니다.",
      },
      {
        t: "VALUE PROPOSITION",
        d: "왜 이 제품을 써야 하는지\n한 문장으로 말합니다.\n차별은 기능 수가 아니라 약속입니다.",
      },
      {
        t: "CORE USER FLOW",
        d: "사용자가 제품에서 거치는\n핵심 경로만 설계합니다.\n부가 화면은 나중에 둡니다.",
      },
      {
        t: "FEATURE PRIORITIZATION",
        d: "Must / Should / Could로 나눠\n우선순위를 보이게 합니다.\n감정 대신 기준으로 자릅니다.",
      },
      {
        t: "MVP SCOPE",
        d: "첫 버전에 넣을 것과\n제외할 것을 명시적으로 결정합니다.\n제외 목록도 산출물입니다.",
      },
      {
        t: "VALIDATION PLAN",
        d: "출시 전후에 확인할 가설과\n관찰할 신호를 정합니다.\n‘만들었다’와 ‘검증했다’를 구분합니다.",
      },
      {
        t: "BUILD ROADMAP",
        d: "Prototype → MVP → V1 단계를\n한 줄로 이어 적습니다.\n지금이 어느 단계인지 보이게 합니다.",
      },
    ],
    whatEn: [
      {
        t: "PROBLEM DEFINITION",
        d: "Write the problem users actually want solved\nas a sentence — not a guess.\nBlurry problems make blurry features.",
      },
      {
        t: "TARGET USER",
        d: "Clarify early users and the situations\nwhere the product is used.\nA product for everyone rarely ships as a first MVP.",
      },
      {
        t: "VALUE PROPOSITION",
        d: "State why someone should use this product\nin one sentence.\nDifferentiation is a promise, not a feature count.",
      },
      {
        t: "CORE USER FLOW",
        d: "Design only the essential path\nthrough the product.\nSecondary screens wait.",
      },
      {
        t: "FEATURE PRIORITIZATION",
        d: "Rank work as Must / Should / Could\nso cuts follow criteria, not mood.",
      },
      {
        t: "MVP SCOPE",
        d: "Decide explicitly what ships in v1\nand what does not.\nThe exclusion list is a deliverable.",
      },
      {
        t: "VALIDATION PLAN",
        d: "Define hypotheses and signals\nto observe before and after launch.\nSeparate “we built it” from “we learned.”",
      },
      {
        t: "BUILD ROADMAP",
        d: "Outline Prototype → MVP → V1\nin one line of stages\nso the current stage stays visible.",
      },
    ],
    includesKo: [
      "Problem Definition Sheet",
      "Target User Sheet",
      "Value Proposition Card",
      "Core User Flow Map",
      "Priority Matrix",
      "MVP Scope Template",
      "Validation Plan",
      "Build Stage Roadmap",
      "Assumption Log",
      "Scope Cut Guide",
    ],
    includesEn: [
      "Problem Definition Sheet",
      "Target User Sheet",
      "Value Proposition Card",
      "Core User Flow Map",
      "Priority Matrix",
      "MVP Scope Template",
      "Validation Plan",
      "Build Stage Roadmap",
      "Assumption Log",
      "Scope Cut Guide",
    ],
    outcomesTitleKo: "첫 버전의 경계가\n분명해집니다.",
    outcomesTitleEn: "The boundary of version one\nbecomes clear.",
    outcomesKo: [
      {
        t: "SHARED PROBLEM",
        d: "팀이 같은 문제를 가리키며\n기능을 논의할 수 있습니다.",
      },
      {
        t: "CUT TABLE",
        d: "이번 MVP에 넣지 않는 항목이\n문서에 남아 재논의가 줄어듭니다.",
      },
      {
        t: "TESTABLE HYPOTHESIS",
        d: "무엇을 검증하려는지가\n구현 목표와 분리되어 적힙니다.",
      },
      {
        t: "STAGE AWARENESS",
        d: "지금이 Prototype인지 MVP인지\n다음 단계로 넘어갈 조건이 보입니다.",
      },
    ],
    outcomesEn: [
      {
        t: "SHARED PROBLEM",
        d: "The team debates features\nwhile pointing at the same problem.",
      },
      {
        t: "CUT TABLE",
        d: "What stays out of this MVP\nstays written — fewer re-litigated debates.",
      },
      {
        t: "TESTABLE HYPOTHESIS",
        d: "What you are trying to learn\nis written separately from build goals.",
      },
      {
        t: "STAGE AWARENESS",
        d: "You can see whether you are in Prototype or MVP\nand what must be true before the next stage.",
      },
    ],
    howToKo: [
      {
        n: "01",
        title: "문제 문장부터 쓰기",
        body: "기능 목록을 적기 전에\nProblem Definition에 사용자가 겪는 문제를 한 문장으로 고정합니다.",
      },
      {
        n: "02",
        title: "초기 사용자만 고르기",
        body: "Target User에서 ‘나중 고객’을 빼고\n첫 검증에 필요한 사람만 남깁니다.",
      },
      {
        n: "03",
        title: "가치 제안으로 걸러내기",
        body: "Value Proposition과 Core Flow에 맞지 않는 기능은\n우선순위 표에서 Must 밖으로 보냅니다.",
      },
      {
        n: "04",
        title: "제외 목록을 공개하기",
        body: "MVP Scope에 ‘이번에 안 함’을 명시해\n팀과 이해관계자가 같은 경계를 보게 합니다.",
      },
      {
        n: "05",
        title: "검증 신호 정하기",
        body: "Validation Plan에 관찰할 행동·피드백을 적은 뒤\nBuild Roadmap에서 현재 단계를 표시합니다.",
      },
    ],
    howToEn: [
      {
        n: "01",
        title: "Write the problem first",
        body: "Before any feature list,\nlock the user problem as one sentence on Problem Definition.",
      },
      {
        n: "02",
        title: "Keep only early users",
        body: "On Target User, remove “later customers”\nand keep the people needed for the first test.",
      },
      {
        n: "03",
        title: "Filter through value",
        body: "Anything that does not serve the Value Proposition\nor Core Flow leaves the Must column.",
      },
      {
        n: "04",
        title: "Publish the exclusion list",
        body: "On MVP Scope, write what you are not doing now\nso stakeholders see the same boundary.",
      },
      {
        n: "05",
        title: "Name validation signals",
        body: "List behaviors and feedback to watch on Validation Plan,\nthen mark the current stage on Build Roadmap.",
      },
    ],
    formatKo: ["Planning Sheets", "Priority Matrix", "Scope Template", "Validation Plan"],
    formatEn: ["Planning Sheets", "Priority Matrix", "Scope Template", "Validation Plan"],
    faqKo: [
      {
        q: "이미 개발 중이어도 쓸 수 있나요?",
        a: "가능합니다. 진행 중인 기능을 Scope와 Priority에 다시 올려 무엇을 남길지 재결정하는 용도로도 씁니다.",
      },
      {
        q: "와이어프레임이나 UI 시안도 포함되나요?",
        a: "포함되지 않습니다. 이 키트는 범위와 가설을 정하는 기획 레이어입니다.",
      },
      {
        q: "B2B와 B2C 모두에 맞나요?",
        a: "문제·사용자·검증 구조는 공통입니다. 고객 정의와 GTM 표현만 맥락에 맞게 채우면 됩니다.",
      },
      {
        q: "App Launch Kit과 무엇이 다른가요?",
        a: "MVP Planning Kit은 무엇을 만들지 정합니다. App Launch Kit은 정해진 제품을 스토어에 올리는 출시 작업을 다룹니다.",
      },
    ],
    faqEn: [
      {
        q: "Can we use it mid-build?",
        a: "Yes. Re-list in-progress features on Scope and Priority to decide what still belongs.",
      },
      {
        q: "Does it include wireframes or UI comps?",
        a: "No. This kit is the planning layer for scope and hypotheses.",
      },
      {
        q: "Does it work for both B2B and B2C?",
        a: "Yes. Problem, user, and validation structure are shared. Adapt customer definition and GTM language to your context.",
      },
      {
        q: "How is it different from App Launch Kit?",
        a: "MVP Planning Kit decides what to build. App Launch Kit covers shipping a defined product to the store.",
      },
    ],
  },

  "cursor-prompt-pack": {
    preview: "cursor-workflow",
    categoryEyebrow: "STORE · CURSOR",
    title: "Cursor Product Builder Pack",
    previewNameKo: "Cursor Workflow Preview",
    previewNameEn: "Cursor Workflow Preview",
    heroTitleKo: "한 번의 프롬프트가 아니라\n제품 제작 흐름을 만듭니다.",
    heroTitleEn: "Not one prompt —\na product-building workflow.",
    heroLeadKo:
      "AI에게 “앱 만들어줘”라고 맡기면\n구조 없는 코드와 다시 고칠 부채가 남습니다.\n\n제품 구조, UI 규칙, 기능 단위 구현,\n리팩터, 디버깅, QA, 배포 전 점검까지\n단계마다 다른 질문이 필요합니다.\n\nCursor Product Builder Pack은\nCursor 위에서 그 단계를 순서대로 돌리는\n프롬프트 워크플로입니다.",
    heroLeadEn:
      "Asking AI to “just build the app”\nusually leaves unstructured code and rework.\n\nProduct structure, UI rules, feature builds,\nrefactoring, debugging, QA, and pre-release checks\neach need a different kind of ask.\n\nCursor Product Builder Pack is a staged prompt workflow\nfor running that sequence inside Cursor.",
    overviewTitleKo: "프롬프트 모음이 아니라\n작업 순서입니다.",
    overviewTitleEn: "Not a prompt dump —\na work order.",
    overviewBodyKo: [
      "좋은 결과는 마법 문장이 아니라\n맥락을 나눠 주는 방식에서 나옵니다.",
      "요구사항을 명세로 바꾸고,\nUI 규칙을 고정한 뒤,\n기능을 하나씩 구현하고,\n깨진 부분을 같은 절차로 고칩니다.",
      "이 팩은 Cursor에서 그 절차를\n복사·붙여넣기 가능한 단계로 제공합니다.",
    ],
    overviewBodyEn: [
      "Good results come less from magic phrasing\nand more from how you split context.",
      "Turn requirements into a build spec,\nlock UI rules,\nimplement feature by feature,\nthen fix breakage with the same discipline.",
      "This pack gives that procedure to Cursor\nas copyable stages.",
    ],
    whoTitleKo: "이런 사람과 팀에게 필요합니다.",
    whoTitleEn: "Who this pack is for.",
    whoKo: [
      {
        t: "CURSOR USERS",
        d: "Cursor를 쓰지만\n매 작업마다 프롬프트를 즉흥으로 써서\n결과가 들쭉날쭉한 경우",
      },
      {
        t: "SOLO DEVELOPERS",
        d: "혼자 제품 전체를 만들며\n기획·UI·구현·QA를\n한 도구 안에서 이어가고 싶은 경우",
      },
      {
        t: "AI-ASSISTED BUILDERS",
        d: "AI 도움을 받되\n무분별한 생성보다\n통제된 단계가 필요한 경우",
      },
      {
        t: "EARLY PRODUCT TEAMS",
        d: "작은 팀이 Cursor로\n기능 단위 작업을 나누고\n같은 워크플로를 공유하고 싶은 경우",
      },
      {
        t: "PROTOTYPE TO PRODUCT",
        d: "프로토타입을 실제 제품 구조로\n안전하게 옮기려는 경우",
      },
      {
        t: "QA-MINDED MAKERS",
        d: "구현만큼 검증·배포 전 점검을\n프롬프트로 반복하고 싶은 경우",
      },
    ],
    whoEn: [
      {
        t: "CURSOR USERS",
        d: "Already in Cursor but improvising prompts\nand getting uneven results",
      },
      {
        t: "SOLO DEVELOPERS",
        d: "Building the whole product alone\nand wanting planning, UI, build, and QA\nto chain inside one tool",
      },
      {
        t: "AI-ASSISTED BUILDERS",
        d: "Using AI help with control —\nstaged work instead of unbounded generation",
      },
      {
        t: "EARLY PRODUCT TEAMS",
        d: "Small teams splitting feature work in Cursor\nand wanting a shared workflow",
      },
      {
        t: "PROTOTYPE TO PRODUCT",
        d: "Moving a prototype into real product structure\nwithout reckless rewrites",
      },
      {
        t: "QA-MINDED MAKERS",
        d: "Wanting verification and pre-release checks\nto be as repeatable as implementation",
      },
    ],
    whatTitleKo: "제품 제작 단계를\n프롬프트로 고정합니다.",
    whatTitleEn: "Product stages,\nfixed as prompts.",
    whatKo: [
      {
        t: "PROJECT SETUP",
        d: "프로젝트 구조와 기술 스택을\n먼저 합의하는 프롬프트입니다.\n폴더·규칙·제약을 초기에 심습니다.",
      },
      {
        t: "PRODUCT REQUIREMENT",
        d: "아이디어를 개발 가능한 명세로 바꿉니다.\n모호한 요청을 작업 단위로 쪼갭니다.",
      },
      {
        t: "UI SYSTEM",
        d: "디자인 시스템과 화면 규칙을 정의합니다.\n매 화면마다 스타일이 바뀌지 않게 합니다.",
      },
      {
        t: "FEATURE BUILD",
        d: "기능 단위로 구현하는 작업 흐름입니다.\n한 번에 전체를 만들지 않습니다.",
      },
      {
        t: "REFACTORING",
        d: "기존 코드를 안전하게 정리하는 방식입니다.\n동작 유지를 전제로 구조를 다듬습니다.",
      },
      {
        t: "DEBUGGING",
        d: "오류 원인 분석 → 수정 → 재검증\n순서를 지키는 디버깅 워크플로입니다.",
      },
      {
        t: "QA LIBRARY",
        d: "기능, UI, 반응형, 예외 상황을\n점검하는 프롬프트 모음입니다.",
      },
      {
        t: "PRODUCTION CHECK",
        d: "배포 전 확인해야 할 최종 항목을\n체크리스트로 돌립니다.",
      },
    ],
    whatEn: [
      {
        t: "PROJECT SETUP",
        d: "Agree on project structure and stack first.\nPlant folders, rules, and constraints early.",
      },
      {
        t: "PRODUCT REQUIREMENT",
        d: "Turn the idea into a buildable spec.\nSplit vague asks into work units.",
      },
      {
        t: "UI SYSTEM",
        d: "Define the design system and screen rules\nso style does not reinvent itself per view.",
      },
      {
        t: "FEATURE BUILD",
        d: "Implement feature by feature.\nDo not generate the whole product in one shot.",
      },
      {
        t: "REFACTORING",
        d: "Clean existing code safely,\npreserving behavior while improving structure.",
      },
      {
        t: "DEBUGGING",
        d: "Analyze → fix → re-verify.\nA debugging workflow that keeps that order.",
      },
      {
        t: "QA LIBRARY",
        d: "Prompt checks for function, UI,\nresponsive behavior, and edge cases.",
      },
      {
        t: "PRODUCTION CHECK",
        d: "Run the final pre-release items\nas a checklist before you ship.",
      },
    ],
    includesKo: [
      "Project Setup Prompt",
      "Product Requirement Prompt",
      "UI System Prompt",
      "Feature Build Workflow",
      "Refactoring Prompt",
      "Debugging Workflow",
      "QA Prompt Library",
      "Production Checklist",
      "Context Handoff Notes",
      "Safe Edit Patterns",
    ],
    includesEn: [
      "Project Setup Prompt",
      "Product Requirement Prompt",
      "UI System Prompt",
      "Feature Build Workflow",
      "Refactoring Prompt",
      "Debugging Workflow",
      "QA Prompt Library",
      "Production Checklist",
      "Context Handoff Notes",
      "Safe Edit Patterns",
    ],
    outcomesTitleKo: "Cursor 작업이\n반복 가능한 절차가 됩니다.",
    outcomesTitleEn: "Cursor work becomes\na repeatable procedure.",
    outcomesKo: [
      {
        t: "STAGED CONTEXT",
        d: "한 프롬프트에 모든 것을 넣지 않고\n단계별 맥락을 유지할 수 있습니다.",
      },
      {
        t: "FEATURE RHYTHM",
        d: "기능 단위 구현 → 검증 리듬이\n팀이나 개인 루틴으로 자리 잡습니다.",
      },
      {
        t: "SAFER CHANGES",
        d: "리팩터와 디버깅이\n즉흥 수정이 아니라 절차로 남습니다.",
      },
      {
        t: "PRE-SHIP GATE",
        d: "배포 전 QA·프로덕션 점검이\n습관적으로 끼어듭니다.",
      },
    ],
    outcomesEn: [
      {
        t: "STAGED CONTEXT",
        d: "You keep context per stage\ninstead of stuffing everything into one prompt.",
      },
      {
        t: "FEATURE RHYTHM",
        d: "Build → verify becomes a personal\nor team rhythm, not a scramble.",
      },
      {
        t: "SAFER CHANGES",
        d: "Refactoring and debugging stay procedural\ninstead of impulsive edits.",
      },
      {
        t: "PRE-SHIP GATE",
        d: "QA and production checks become\na habitual gate before release.",
      },
    ],
    howToKo: [
      {
        n: "01",
        title: "프로젝트 규칙을 먼저 심기",
        body: "Setup Prompt로 스택·폴더·금지 사항을 정한 뒤\n그 규칙을 이후 프롬프트의 전제로 둡니다.",
      },
      {
        n: "02",
        title: "명세로 쪼개기",
        body: "Requirement Prompt로 이번 기능을\n입력·출력·예외까지 짧게 명세화합니다.",
      },
      {
        n: "03",
        title: "UI 규칙을 고정한 채 구현",
        body: "UI System을 참조하게 한 다음\nFeature Build로 한 기능만 구현합니다.",
      },
      {
        n: "04",
        title: "깨지면 디버깅 순서로",
        body: "즉흥 수정보다 Debugging Workflow로\n재현 → 원인 → 수정 → 재검증을 돌립니다.",
      },
      {
        n: "05",
        title: "배포 전 QA 라이브러리",
        body: "QA Prompt와 Production Checklist로\n기능·반응형·예외·릴리스 항목을 통과시킵니다.",
      },
    ],
    howToEn: [
      {
        n: "01",
        title: "Plant project rules first",
        body: "Use Setup Prompt to lock stack, folders, and constraints,\nthen treat those rules as premises for later prompts.",
      },
      {
        n: "02",
        title: "Split into a short spec",
        body: "Use Requirement Prompt to specify this feature’s\ninputs, outputs, and edge cases briefly.",
      },
      {
        n: "03",
        title: "Build against UI rules",
        body: "Reference UI System, then run Feature Build\nfor one feature only.",
      },
      {
        n: "04",
        title: "Debug in order when it breaks",
        body: "Prefer Debugging Workflow over ad-hoc fixes:\nreproduce → cause → fix → re-verify.",
      },
      {
        n: "05",
        title: "Gate with QA before ship",
        body: "Run QA Prompts and the Production Checklist\nfor function, responsive, edge cases, and release items.",
      },
    ],
    formatKo: ["Prompt Library", "Workflow Guide", "QA Checklist", "Release Checklist"],
    formatEn: ["Prompt Library", "Workflow Guide", "QA Checklist", "Release Checklist"],
    faqKo: [
      {
        q: "Cursor 구독이나 특정 플랜이 필요한가요?",
        a: "Cursor를 사용할 수 있는 환경이면 됩니다. Newon은 Cursor와 무관한 독립 리소스이며, 플랜·요금은 Cursor 정책을 따릅니다.",
      },
      {
        q: "프롬프트만 복사하면 제품이 완성되나요?",
        a: "아닙니다. 판단·범위·검토는 사람이 합니다. 팩은 작업 순서를 안정적으로 만드는 도구입니다.",
      },
      {
        q: "기존 저장소에도 적용할 수 있나요?",
        a: "가능합니다. Setup과 Refactoring·Debugging 모듈을 기존 코드베이스 맥락에 맞게 쓰면 됩니다.",
      },
      {
        q: "Codex Builder Pack과 무엇이 다른가요?",
        a: "이 팩은 Cursor 중심의 대화형 제품 제작 흐름입니다. Codex Builder Pack은 에이전트형 작업 명세·멀티파일 변경·리뷰에 더 초점을 둡니다.",
      },
    ],
    faqEn: [
      {
        q: "Do I need a specific Cursor plan?",
        a: "Any environment where you can use Cursor works. This is an independent Newon resource; plans and pricing follow Cursor’s own policies.",
      },
      {
        q: "Will copying prompts finish my product?",
        a: "No. Judgment, scope, and review stay human. The pack stabilizes work order — it does not replace decisions.",
      },
      {
        q: "Can I apply it to an existing repo?",
        a: "Yes. Use Setup plus Refactoring and Debugging modules with your current codebase context.",
      },
      {
        q: "How is it different from Codex Builder Pack?",
        a: "This pack is a Cursor-centered conversational build flow. Codex Builder Pack focuses more on agent-style task specs, multi-file changes, and review.",
      },
    ],
    disclaimerKo:
      "이 리소스는 Newon이 제작한 독립 제품입니다.\nCursor 또는 Anysphere와 제휴·보증·공식 관계가 없습니다.",
    disclaimerEn:
      "This resource is an independent Newon product.\nIt is not affiliated with, endorsed by, or partnered with Cursor or Anysphere.",
  },

  "codex-builder-pack": {
    preview: "codex-workflow",
    categoryEyebrow: "STORE · CODEX",
    title: "Codex Builder Pack",
    previewNameKo: "Codex Workflow Preview",
    previewNameEn: "Codex Workflow Preview",
    heroTitleKo: "에이전트 작업을\n안전한 절차로 운영합니다.",
    heroTitleEn: "Run agent work\nas a safe procedure.",
    heroLeadKo:
      "에이전트에게 저장소를 맡기면\n빠른 변경과 함께 회귀 위험도 커집니다.\n\n먼저 구조를 읽고,\n작업 단위를 작게 쓰고,\n구현·리뷰·테스트·릴리스 준비를\n같은 리듬으로 돌려야 합니다.\n\nCodex Builder Pack은 Codex 스타일 에이전트 개발을\n체계적으로 운영하기 위한 실전 워크플로입니다.",
    heroLeadEn:
      "Handing a repo to an agent\nspeeds change — and raises regression risk.\n\nRead the structure first,\nwrite small task units,\nthen cycle implement → review → test → release prep\non the same rhythm.\n\nCodex Builder Pack is a practical workflow\nfor running Codex-style agent development with control.",
    overviewTitleKo: "속도보다 먼저\n작업의 경계를 만듭니다.",
    overviewTitleEn: "Draw the boundary of work\nbefore chasing speed.",
    overviewBodyKo: [
      "에이전트는 지시가 넓을수록\n관련 없는 파일까지 건드릴 수 있습니다.",
      "저장소 분석, 작업 명세, 멀티파일 변경 규칙,\n버그 재현, 코드 리뷰, 검증, 릴리스 준비 —\n각 단계에 멈출 지점이 필요합니다.",
      "이 팩은 그 멈출 지점을\n프롬프트와 체크리스트로 제공합니다.",
    ],
    overviewBodyEn: [
      "The wider the instruction,\nthe more an agent may touch unrelated files.",
      "Repo analysis, task specs, multi-file change rules,\nbug reproduction, review, validation, release prep —\neach stage needs a place to stop.",
      "This pack supplies those stop points\nas prompts and checklists.",
    ],
    whoTitleKo: "이런 사람과 팀에게 필요합니다.",
    whoTitleEn: "Who this pack is for.",
    whoKo: [
      {
        t: "DEVELOPERS",
        d: "에이전트로 구현 속도를 높이되\n리뷰와 테스트를 생략하지 않으려는 경우",
      },
      {
        t: "AI-ASSISTED BUILDERS",
        d: "멀티파일 변경을 맡기면서도\n변경 범위를 문서화하고 싶은 경우",
      },
      {
        t: "SOLO FOUNDERS",
        d: "혼자 저장소를 운영하며\n에이전트 작업을 반복 가능한 루틴으로\n만들고 싶은 경우",
      },
      {
        t: "PRODUCT TEAMS",
        d: "작업 티켓을 에이전트가 이해할\n명세 형태로 맞추고 싶은 경우",
      },
      {
        t: "LEGACY CODEBASES",
        d: "기존 코드가 있는 저장소에서\n분석 없이 바로 수정하지 않으려는 경우",
      },
      {
        t: "RELEASE-CAREFUL TEAMS",
        d: "배포 전 리뷰·테스트·릴리스 준비를\n에이전트 루틴에 포함하고 싶은 경우",
      },
    ],
    whoEn: [
      {
        t: "DEVELOPERS",
        d: "Using agents for speed\nwithout skipping review and tests",
      },
      {
        t: "AI-ASSISTED BUILDERS",
        d: "Delegating multi-file changes\nwhile still documenting change scope",
      },
      {
        t: "SOLO FOUNDERS",
        d: "Operating a repo alone\nand wanting agent work as a repeatable routine",
      },
      {
        t: "PRODUCT TEAMS",
        d: "Turning tickets into specs\nan agent can follow without guessing",
      },
      {
        t: "LEGACY CODEBASES",
        d: "Working in existing code\nand refusing to edit before analysis",
      },
      {
        t: "RELEASE-CAREFUL TEAMS",
        d: "Folding review, test, and release prep\ninto the agent loop before deploy",
      },
    ],
    whatTitleKo: "에이전트 루프를\n모듈로 나눕니다.",
    whatTitleEn: "The agent loop,\nsplit into modules.",
    whatKo: [
      {
        t: "REPOSITORY ANALYSIS",
        d: "기존 프로젝트 구조를 먼저 읽습니다.\n진입점, 모듈 경계, 테스트 위치를 파악합니다.",
      },
      {
        t: "TASK SPECIFICATION",
        d: "에이전트가 소화할 수 있는\n명확한 작업 단위로 지시를 씁니다.\n성공 조건과 비범위를 함께 적습니다.",
      },
      {
        t: "IMPLEMENTATION WORKFLOW",
        d: "분석 → 구현 → 검증 순서를 지킵니다.\n한 사이클에 한 목표만 넣습니다.",
      },
      {
        t: "MULTI-FILE CHANGE",
        d: "여러 파일을 건드릴 때의 규칙을 둡니다.\n관련 없는 리팩터를 같은 작업에 섞지 않습니다.",
      },
      {
        t: "BUG FIX WORKFLOW",
        d: "재현 → 원인 분석 → 수정 → 테스트\n순서로 버그를 다룹니다.",
      },
      {
        t: "CODE REVIEW",
        d: "변경의 문제점과 회귀 가능성을\n리뷰 프롬프트로 점검합니다.",
      },
      {
        t: "TEST & VALIDATION",
        d: "자동 테스트와 수동 확인 항목을\n같이 돌릴 목록으로 정리합니다.",
      },
      {
        t: "RELEASE PREPARATION",
        d: "배포 전 최종 검증과\n릴리스 노트 골격을 준비합니다.",
      },
    ],
    whatEn: [
      {
        t: "REPOSITORY ANALYSIS",
        d: "Read the existing project first.\nFind entry points, module boundaries, and tests.",
      },
      {
        t: "TASK SPECIFICATION",
        d: "Write agent-sized work units\nwith success criteria and non-goals together.",
      },
      {
        t: "IMPLEMENTATION WORKFLOW",
        d: "Keep analyze → implement → verify.\nOne goal per cycle.",
      },
      {
        t: "MULTI-FILE CHANGE",
        d: "Rules for touching many files.\nDo not mix unrelated refactors into the same task.",
      },
      {
        t: "BUG FIX WORKFLOW",
        d: "Reproduce → diagnose → fix → test.\nThat order for every bug.",
      },
      {
        t: "CODE REVIEW",
        d: "Check issues and regression risk\nwith a review prompt on the diff.",
      },
      {
        t: "TEST & VALIDATION",
        d: "Combine automated tests and manual checks\ninto one validation list.",
      },
      {
        t: "RELEASE PREPARATION",
        d: "Final pre-deploy validation\nand a release-note outline.",
      },
    ],
    includesKo: [
      "Repository Analysis Prompt",
      "Task Specification Template",
      "Implementation Workflow",
      "Multi-file Change Guide",
      "Bug Fix Workflow",
      "Code Review Prompt",
      "Test & Validation List",
      "Release Preparation Checklist",
      "Change Scope Log",
      "Regression Watch Notes",
    ],
    includesEn: [
      "Repository Analysis Prompt",
      "Task Specification Template",
      "Implementation Workflow",
      "Multi-file Change Guide",
      "Bug Fix Workflow",
      "Code Review Prompt",
      "Test & Validation List",
      "Release Preparation Checklist",
      "Change Scope Log",
      "Regression Watch Notes",
    ],
    outcomesTitleKo: "에이전트 변경이\n추적 가능해집니다.",
    outcomesTitleEn: "Agent changes become\ntraceable.",
    outcomesKo: [
      {
        t: "BOUNDED TASKS",
        d: "작업마다 성공 조건과 비범위가\n명세에 남습니다.",
      },
      {
        t: "VISIBLE DIFF INTENT",
        d: "멀티파일 변경의 의도가\n리뷰 전에 문서화됩니다.",
      },
      {
        t: "REVIEW GATE",
        d: "머지·배포 전에 리뷰·테스트 단계가\n루틴으로 끼어듭니다.",
      },
      {
        t: "RELEASE READY NOTES",
        d: "무엇을 바꿨는지 설명할\n릴리스 준비가 같이 끝납니다.",
      },
    ],
    outcomesEn: [
      {
        t: "BOUNDED TASKS",
        d: "Each task keeps success criteria\nand non-goals in the spec.",
      },
      {
        t: "VISIBLE DIFF INTENT",
        d: "Intent for multi-file changes\nis written before review.",
      },
      {
        t: "REVIEW GATE",
        d: "Review and test become a routine gate\nbefore merge or deploy.",
      },
      {
        t: "RELEASE READY NOTES",
        d: "You finish with release prep that can explain\nwhat changed and why.",
      },
    ],
    howToKo: [
      {
        n: "01",
        title: "저장소부터 읽히기",
        body: "Repository Analysis로 구조·진입점·테스트를\n에이전트와 함께 요약한 뒤 수정을 시작합니다.",
      },
      {
        n: "02",
        title: "작은 작업 명세 쓰기",
        body: "Task Spec에 목표, 성공 조건, 건드리면 안 되는 영역을\n짧게 적어 한 사이클에 넣습니다.",
      },
      {
        n: "03",
        title: "구현 후 바로 검증",
        body: "Implementation Workflow로 구현한 다음\n관련 테스트·수동 확인을 같은 사이클에서 끝냅니다.",
      },
      {
        n: "04",
        title: "멀티파일은 범위 로그",
        body: "여러 파일을 바꿀 때는 Change Scope Log에\n의도와 파일 목록을 남기고 Review Prompt를 돌립니다.",
      },
      {
        n: "05",
        title: "릴리스 준비로 닫기",
        body: "Release Preparation으로 최종 검증과\n릴리스 노트 골격을 채운 뒤 배포합니다.",
      },
    ],
    howToEn: [
      {
        n: "01",
        title: "Read the repo first",
        body: "Run Repository Analysis to summarize structure,\nentry points, and tests before any edit.",
      },
      {
        n: "02",
        title: "Write a small task spec",
        body: "Put goal, success criteria, and off-limits areas\non the Task Spec for a single cycle.",
      },
      {
        n: "03",
        title: "Verify in the same cycle",
        body: "After Implementation Workflow,\nfinish related tests and manual checks before the next task.",
      },
      {
        n: "04",
        title: "Log multi-file scope",
        body: "When many files change, record intent and paths\nin the Change Scope Log, then run Review Prompt.",
      },
      {
        n: "05",
        title: "Close with release prep",
        body: "Use Release Preparation for final validation\nand a release-note outline before deploy.",
      },
    ],
    formatKo: ["Workflow Guide", "Prompt Library", "Review Checklist", "Release Checklist"],
    formatEn: ["Workflow Guide", "Prompt Library", "Review Checklist", "Release Checklist"],
    faqKo: [
      {
        q: "OpenAI Codex 공식 제품인가요?",
        a: "아닙니다. Newon이 만든 독립 교육·실무 리소스이며 OpenAI와 제휴·보증 관계가 없습니다.",
      },
      {
        q: "특정 에이전트 도구에만 맞나요?",
        a: "Codex 스타일의 에이전트 작업 흐름을 기준으로 썼습니다. 비슷한 에이전트 환경에도 절차를 옮길 수 있습니다.",
      },
      {
        q: "테스트 코드 작성까지 자동화하나요?",
        a: "테스트 작성 지시와 검증 목록을 포함하지만, 무엇을 통과해야 하는지는 저장소와 팀이 정합니다.",
      },
      {
        q: "Cursor Product Builder Pack과 함께 써도 되나요?",
        a: "가능합니다. Cursor에서의 대화형 제작과 에이전트형 작업 루프를 역할에 맞게 나눠 쓰면 됩니다.",
      },
    ],
    faqEn: [
      {
        q: "Is this an official OpenAI Codex product?",
        a: "No. It is an independent educational and practical resource by Newon, not affiliated with or endorsed by OpenAI.",
      },
      {
        q: "Is it tied to one agent tool only?",
        a: "It is written around Codex-style agent workflows. You can adapt the procedure to similar agent environments.",
      },
      {
        q: "Does it auto-write all tests?",
        a: "It includes test-writing prompts and validation lists. Pass criteria still belong to your repo and team.",
      },
      {
        q: "Can I use it with Cursor Product Builder Pack?",
        a: "Yes. Use Cursor for conversational build flow and this pack for agent-style task loops as roles require.",
      },
    ],
    disclaimerKo:
      "이 리소스는 Newon이 제작한 독립 교육·실무 자료입니다.\nOpenAI와 제휴·보증·공식 관계가 없습니다.",
    disclaimerEn:
      "Independent educational and practical resource by Newon.\nNot affiliated with, endorsed by, or partnered with OpenAI.",
  },

  "website-launch-checklist": {
    preview: "web-checklist",
    categoryEyebrow: "STORE · WEB LAUNCH",
    title: "Website Launch Checklist",
    previewNameKo: "Website Launch Preview",
    previewNameEn: "Website Launch Preview",
    heroTitleKo: "공개 버튼을 누르기 전에\n한 번 더 확인합니다.",
    heroTitleEn: "One more pass\nbefore you hit publish.",
    heroLeadKo:
      "웹사이트는 디자인 완료와 함께 끝나지 않습니다.\n\n오탈자, 깨진 링크, 메타 태그,\n이미지 무게, 접근성, 법적 고지, 분석 태그 —\n공개 직전에야 보이는 구멍이 많습니다.\n\nWebsite Launch Checklist는\n그 구멍을 카테고리별로 막는 최종 점검 문서입니다.",
    heroLeadEn:
      "A website is not done when the design is done.\n\nTypos, broken links, meta tags,\nheavy images, accessibility, legal pages, analytics —\nmany gaps only show up right before publish.\n\nWebsite Launch Checklist is the final document\nthat closes those gaps by category.",
    overviewTitleKo: "런칭은 감각이 아니라\n점검입니다.",
    overviewTitleEn: "Launch is inspection,\nnot vibes.",
    overviewBodyKo: [
      "‘대충 괜찮아 보인다’는\n프로덕션 기준이 아닙니다.",
      "콘텐츠, 디자인, SEO, 성능, 접근성,\n법적 고지, 분석, 최종 QA를\n같은 체크리스트에서 통과시켜야 합니다.",
      "이 문서는 공개 전 팀이 함께 볼 수 있는\n마지막 공통 목록입니다.",
    ],
    overviewBodyEn: [
      "“Looks fine” is not a production bar.",
      "Content, design, SEO, performance, accessibility,\nlegal, analytics, and final QA\nshould pass on one shared checklist.",
      "This document is the last common list\nthe team can walk before going live.",
    ],
    whoTitleKo: "이런 사람과 팀에게 필요합니다.",
    whoTitleEn: "Who this checklist is for.",
    whoKo: [
      {
        t: "FOUNDERS",
        d: "회사·제품 사이트를 처음 공개하며\n무엇을 빠뜨렸는지 불안한 경우",
      },
      {
        t: "MARKETERS",
        d: "랜딩·캠페인 페이지를 올리기 전\nSEO·추적·CTA를 한 번에 점검하고 싶은 경우",
      },
      {
        t: "DESIGNERS",
        d: "시안은 끝났지만\n반응형·타이포·여백이\n실기기에서 무너지지 않는지 확인하고 싶은 경우",
      },
      {
        t: "WEB TEAMS",
        d: "개발·콘텐츠·법무 항목이 나뉘어\n런칭 전 소유가 흐려지는 경우",
      },
      {
        t: "RELAUNCH PROJECTS",
        d: "리뉴얼 공개 직전에\n리다이렉트·404·도메인을\n다시 점검해야 하는 경우",
      },
      {
        t: "SMALL AGENCIES",
        d: "클라이언트 인도 전\n최종 QA 목록을 표준화하고 싶은 경우",
      },
    ],
    whoEn: [
      {
        t: "FOUNDERS",
        d: "Publishing a first company or product site\nand uneasy about what was missed",
      },
      {
        t: "MARKETERS",
        d: "Wanting SEO, tracking, and CTAs\nchecked together before a landing or campaign page goes live",
      },
      {
        t: "DESIGNERS",
        d: "Comps are done — still needing proof that\nresponsive, type, and spacing hold on real devices",
      },
      {
        t: "WEB TEAMS",
        d: "Split across build, content, and legal\nwith ownership blurry before launch",
      },
      {
        t: "RELAUNCH PROJECTS",
        d: "Needing redirects, 404s, and domains\nre-checked right before a redesign ships",
      },
      {
        t: "SMALL AGENCIES",
        d: "Standardizing a final QA list\nbefore client handoff",
      },
    ],
    whatTitleKo: "공개 전 구멍을\n여덟 구역으로 막습니다.",
    whatTitleEn: "Eight zones that\ncatch pre-publish gaps.",
    whatKo: [
      {
        t: "CONTENT",
        d: "오탈자, 링크, CTA, 연락처, 정책 페이지.\n문장이 살아 있는지부터 확인합니다.",
      },
      {
        t: "DESIGN",
        d: "Desktop · Tablet · Mobile,\n타이포와 여백이 기기에 맞게 유지되는지 봅니다.",
      },
      {
        t: "SEO",
        d: "Page Title, Meta Description, Open Graph,\nSitemap, Robots를 점검합니다.",
      },
      {
        t: "PERFORMANCE",
        d: "이미지 최적화, 로딩, 폰트, JS 오류.\n무거운 첫 화면을 줄입니다.",
      },
      {
        t: "ACCESSIBILITY",
        d: "대비, Alt Text, 키보드 탐색, 폼 라벨.\n기본 접근성을 통과시킵니다.",
      },
      {
        t: "LEGAL",
        d: "Privacy Policy, Terms, Cookie Notice.\n공개에 필요한 고지를 확인합니다.",
      },
      {
        t: "ANALYTICS",
        d: "Analytics, 전환 이벤트, Search Console.\n측정을 켠 채로 출시합니다.",
      },
      {
        t: "FINAL QA",
        d: "폼, 404, 리다이렉트, 프로덕션 도메인.\n마지막 경로를 직접 밟아 봅니다.",
      },
    ],
    whatEn: [
      {
        t: "CONTENT",
        d: "Typos, links, CTAs, contact, policy pages.\nStart with whether the writing actually works.",
      },
      {
        t: "DESIGN",
        d: "Desktop · Tablet · Mobile —\ntype and spacing that hold across devices.",
      },
      {
        t: "SEO",
        d: "Page title, meta description, Open Graph,\nsitemap, robots — checked before index day.",
      },
      {
        t: "PERFORMANCE",
        d: "Image weight, load, fonts, JS errors.\nTrim a heavy first paint.",
      },
      {
        t: "ACCESSIBILITY",
        d: "Contrast, alt text, keyboard, form labels.\nClear a basic accessibility bar.",
      },
      {
        t: "LEGAL",
        d: "Privacy Policy, Terms, cookie notice.\nConfirm required notices for publish.",
      },
      {
        t: "ANALYTICS",
        d: "Analytics, conversion events, Search Console.\nShip with measurement on.",
      },
      {
        t: "FINAL QA",
        d: "Forms, 404s, redirects, production domain.\nWalk the live path yourself.",
      },
    ],
    includesKo: [
      "Content Checklist",
      "Design Device Pass",
      "SEO Basics Sheet",
      "Performance Checks",
      "Accessibility Basics",
      "Legal Pages Checklist",
      "Analytics Setup List",
      "Final QA Pass",
      "Launch Sign-off Row",
      "Post-publish Watch Notes",
    ],
    includesEn: [
      "Content Checklist",
      "Design Device Pass",
      "SEO Basics Sheet",
      "Performance Checks",
      "Accessibility Basics",
      "Legal Pages Checklist",
      "Analytics Setup List",
      "Final QA Pass",
      "Launch Sign-off Row",
      "Post-publish Watch Notes",
    ],
    outcomesTitleKo: "공개 전에\n합의된 통과 기준이 생깁니다.",
    outcomesTitleEn: "A shared pass bar\nbefore publish.",
    outcomesKo: [
      {
        t: "CATEGORY COVERAGE",
        d: "콘텐츠부터 최종 QA까지\n빠진 구역 없이 점검 기록이 남습니다.",
      },
      {
        t: "OWNER VISIBILITY",
        d: "항목별 담당을 나눠\n‘누가 봤는지’가 보이게 됩니다.",
      },
      {
        t: "FEWER HOTFIXES",
        d: "공개 직후 급하게 고치는\n기본 실수가 줄어듭니다.",
      },
      {
        t: "REPEATABLE LAUNCH",
        d: "다음 랜딩·리뉴얼에도\n같은 목록을 재사용할 수 있습니다.",
      },
    ],
    outcomesEn: [
      {
        t: "CATEGORY COVERAGE",
        d: "A record from content through final QA\nwith no silent blind spots.",
      },
      {
        t: "OWNER VISIBILITY",
        d: "Per-item owners make “who checked this”\nvisible to the team.",
      },
      {
        t: "FEWER HOTFIXES",
        d: "Fewer basic mistakes that force\nrushed fixes right after publish.",
      },
      {
        t: "REPEATABLE LAUNCH",
        d: "Reuse the same list for the next landing\nor redesign launch.",
      },
    ],
    howToKo: [
      {
        n: "01",
        title: "스테이징 URL로 시작",
        body: "프로덕션과 가까운 환경에서\nContent·Design부터 순서대로 표시합니다.",
      },
      {
        n: "02",
        title: "SEO와 성능을 같은 날에",
        body: "메타·OG·이미지·폰트를 묶어서 보고\n수치나 체감이 기준 미달이면 공개를 미룹니다.",
      },
      {
        n: "03",
        title: "법적 고지와 폼을 실클릭",
        body: "Privacy·Terms·문의 폼·쿠키 고지를\n실제 클릭 경로로 확인합니다.",
      },
      {
        n: "04",
        title: "분석 태그 점화 확인",
        body: "Analytics와 전환 이벤트가\n스테이징 또는 프로덕션에서 보이는지 검증합니다.",
      },
      {
        n: "05",
        title: "Final QA 후 서명",
        body: "404·리다이렉트·도메인을 통과시킨 뒤\nLaunch Sign-off에 담당·일시를 남깁니다.",
      },
    ],
    howToEn: [
      {
        n: "01",
        title: "Start on staging",
        body: "Walk Content and Design first\non an environment close to production.",
      },
      {
        n: "02",
        title: "Bundle SEO and performance",
        body: "Check meta, OG, images, and fonts together.\nIf they miss the bar, delay publish.",
      },
      {
        n: "03",
        title: "Click legal and forms for real",
        body: "Open Privacy, Terms, contact forms,\nand cookie notice along the live click path.",
      },
      {
        n: "04",
        title: "Prove analytics is firing",
        body: "Confirm analytics and conversion events\nshow on staging or production before launch.",
      },
      {
        n: "05",
        title: "Sign off after Final QA",
        body: "Pass 404s, redirects, and domain checks,\nthen record owner and time on Launch Sign-off.",
      },
    ],
    formatKo: ["Checklist Document", "Launch QA Sheet", "Category Groups"],
    formatEn: ["Checklist Document", "Launch QA Sheet", "Category Groups"],
    faqKo: [
      {
        q: "노션이나 스프레드시트로 쓰나요?",
        a: "공개 시 제공 포맷에 맞춰 문서·시트로 제공합니다. 팀 도구에 맞게 복사해 쓸 수 있도록 구성합니다.",
      },
      {
        q: "웹 접근성 인증까지 포함되나요?",
        a: "포함되지 않습니다. 기본 접근성 점검 항목을 다루며, 공식 인증·감사는 별도 범위입니다.",
      },
      {
        q: "이커머스 결제 테스트도 들어가나요?",
        a: "일반 사이트 런칭 기준입니다. 결제·재고 등 커머스 전용 항목은 필요 시 팀이 확장합니다.",
      },
      {
        q: "다국어 사이트에도 맞나요?",
        a: "가능합니다. 언어별로 Content·SEO·법적 고지 행을 복제해 점검하면 됩니다.",
      },
    ],
    faqEn: [
      {
        q: "Is it Notion or a spreadsheet?",
        a: "Formats will match the release package (doc/sheet). You can copy into your team tools.",
      },
      {
        q: "Does it include formal accessibility certification?",
        a: "No. It covers basic accessibility checks. Formal audits or certification are out of scope.",
      },
      {
        q: "Does it cover ecommerce checkout testing?",
        a: "It targets general site launch. Commerce-specific payment and inventory checks are team extensions.",
      },
      {
        q: "Does it work for multilingual sites?",
        a: "Yes. Duplicate Content, SEO, and legal rows per language and walk each locale.",
      },
    ],
  },

  "business-planning-workbook": {
    preview: "biz-flow",
    categoryEyebrow: "STORE · BUSINESS",
    title: "Business Planning Workbook",
    previewNameKo: "Business Plan Preview",
    previewNameEn: "Business Plan Preview",
    heroTitleKo: "막연한 아이디어를\n실행 가능한 계획으로 씁니다.",
    heroTitleEn: "Turn a vague idea\ninto an executable plan.",
    heroLeadKo:
      "사업 계획은 두꺼운 보고서가 아니어도 됩니다.\n\n누구의 어떤 문제를 풀고,\n어떻게 돈을 받으며,\n앞으로 90일 동안 무엇을 할지\n한 흐름으로 적혀 있으면 됩니다.\n\nBusiness Planning Workbook은\n아이디어에서 실행 계획까지 이끄는 10장 워크북입니다.",
    heroLeadEn:
      "A business plan does not need to be a thick report.\n\nIt needs a clear line from whose problem you solve,\nhow you get paid,\nand what you will do in the next 90 days.\n\nBusiness Planning Workbook is a ten-chapter path\nfrom idea to an executable plan.",
    overviewTitleKo: "계획의 목적은\n설득용 문장이 아니라 실행입니다.",
    overviewTitleEn: "Plans exist for execution,\nnot for decorative slides.",
    overviewBodyKo: [
      "아이디어·고객·문제·솔루션·시장·모델·\nGTM·운영·재무·90일 실행을\n한 권의 순서로 묶습니다.",
      "각 장은 짧게 채워도 됩니다.\n비어 있는 칸이 곧 다음 할 일입니다.",
      "투자 유치용 장문의 IR이 아니라\n창업자와 팀이 매주 열어보는 워크북을 목표로 합니다.",
    ],
    overviewBodyEn: [
      "Idea, customer, problem, solution, market, model,\nGTM, operations, finance, and a 90-day plan\nbound in one chapter order.",
      "Chapters can stay short.\nEmpty cells are the next work.",
      "The goal is a workbook founders reopen weekly —\nnot a long IR deck written once for show.",
    ],
    whoTitleKo: "이런 사람과 팀에게 필요합니다.",
    whoTitleEn: "Who this workbook is for.",
    whoKo: [
      {
        t: "FOUNDERS",
        d: "아이디어는 있으나\n고객·모델·실행이\n한 문서에 모이지 않은 경우",
      },
      {
        t: "OPERATORS",
        d: "이미 움직이고 있지만\n가격·채널·운영을\n다시 정리해야 하는 경우",
      },
      {
        t: "INDIE HACKERS",
        d: "작은 제품으로도\n사업 가설을 문장으로\n남기고 싶은 경우",
      },
      {
        t: "EARLY TEAMS",
        d: "공동창업자마다\n‘우리 사업’ 정의가 달라\n공통 워크북이 필요한 경우",
      },
      {
        t: "PRE-PITCH",
        d: "피치 전에\n숫자와 실행 우선순위를\n스스로 먼저 맞추고 싶은 경우",
      },
      {
        t: "SIDE TO SERIOUS",
        d: "사이드 프로젝트를\n사업처럼 다루기 시작할 때",
      },
    ],
    whoEn: [
      {
        t: "FOUNDERS",
        d: "With an idea but customer, model, and execution\nstill living in separate notes",
      },
      {
        t: "OPERATORS",
        d: "Already in motion and needing to rewrite\npricing, channels, and operations cleanly",
      },
      {
        t: "INDIE HACKERS",
        d: "Wanting business hypotheses written down\neven for a small product",
      },
      {
        t: "EARLY TEAMS",
        d: "Co-founders defining “our business” differently\nand needing one shared workbook",
      },
      {
        t: "PRE-PITCH",
        d: "Aligning numbers and priorities yourself\nbefore any external pitch",
      },
      {
        t: "SIDE TO SERIOUS",
        d: "Starting to treat a side project\nlike a real business",
      },
    ],
    whatTitleKo: "열 개 장으로\n사업을 한 줄에 이읍니다.",
    whatTitleEn: "Ten chapters that\nconnect into one line.",
    whatKo: [
      {
        t: "BUSINESS IDEA",
        d: "무엇을 만들고 왜 만드는지 정의합니다.\n동기와 결과물을 섞지 않습니다.",
      },
      {
        t: "CUSTOMER",
        d: "누가 돈을 지불할 고객인지 정리합니다.\n사용자와 구매자가 다르면 둘 다 적습니다.",
      },
      {
        t: "PROBLEM",
        d: "고객이 해결하고 싶은 문제를 정의합니다.\n우리 편의의 문제가 아니어야 합니다.",
      },
      {
        t: "SOLUTION",
        d: "제품 또는 서비스가 제공하는 해결책을 씁니다.\n기능 나열이 아니라 해결의 형태입니다.",
      },
      {
        t: "MARKET",
        d: "시장, 경쟁 제품, 기존 대안을 조사합니다.\n빈 시장이라는 문장은 검증이 필요합니다.",
      },
      {
        t: "BUSINESS MODEL",
        d: "누가 무엇에 얼마를 지불하는지 정리합니다.\n가격 가설을 명시합니다.",
      },
      {
        t: "GO-TO-MARKET",
        d: "초기 고객을 확보할 채널을 정의합니다.\n나중에 쓸 채널과 지금 쓸 채널을 나눕니다.",
      },
      {
        t: "OPERATIONS",
        d: "제품, 마케팅, 고객 관리의 운영 구조를 적습니다.\n누가 주당 무엇을 하는지 보이게 합니다.",
      },
      {
        t: "FINANCE",
        d: "비용, 가격, 매출 가설을 정리합니다.\n정교한 회계가 아니라 방향이 보이게 합니다.",
      },
      {
        t: "90-DAY ACTION PLAN",
        d: "실행 우선순위를 90일 단위로 정리합니다.\n계획이 주간 행동으로 내려오게 합니다.",
      },
    ],
    whatEn: [
      {
        t: "BUSINESS IDEA",
        d: "Define what you build and why.\nDo not mix motivation with deliverable.",
      },
      {
        t: "CUSTOMER",
        d: "Clarify who pays.\nIf user and buyer differ, write both.",
      },
      {
        t: "PROBLEM",
        d: "Define the problem customers want solved —\nnot a problem that is only convenient for you.",
      },
      {
        t: "SOLUTION",
        d: "Describe the product or service answer.\nShape of the fix, not a feature dump.",
      },
      {
        t: "MARKET",
        d: "Research market, competitors, and alternatives.\n“Empty market” needs evidence.",
      },
      {
        t: "BUSINESS MODEL",
        d: "Who pays for what, and how much.\nState the pricing hypothesis.",
      },
      {
        t: "GO-TO-MARKET",
        d: "Define early customer channels.\nSeparate channels for now from channels for later.",
      },
      {
        t: "OPERATIONS",
        d: "Write product, marketing, and support structure.\nMake weekly ownership visible.",
      },
      {
        t: "FINANCE",
        d: "Costs, pricing, and revenue hypotheses.\nDirection over ornate accounting.",
      },
      {
        t: "90-DAY ACTION PLAN",
        d: "Prioritize execution over 90 days\nso the plan drops into weekly action.",
      },
    ],
    includesKo: [
      "Business Idea Sheet",
      "Customer Definition",
      "Problem Brief",
      "Solution Sheet",
      "Market Notes",
      "Business Model Canvas Page",
      "Go-to-Market Plan",
      "Operations Outline",
      "Finance Hypotheses",
      "90-Day Action Plan",
    ],
    includesEn: [
      "Business Idea Sheet",
      "Customer Definition",
      "Problem Brief",
      "Solution Sheet",
      "Market Notes",
      "Business Model Canvas Page",
      "Go-to-Market Plan",
      "Operations Outline",
      "Finance Hypotheses",
      "90-Day Action Plan",
    ],
    outcomesTitleKo: "매주 열어볼\n실행 기준이 남습니다.",
    outcomesTitleEn: "An execution baseline\nyou reopen weekly.",
    outcomesKo: [
      {
        t: "ONE NARRATIVE",
        d: "고객·문제·모델이\n한 이야기로 이어집니다.",
      },
      {
        t: "PRICING HYPOTHESIS",
        d: "얼마를 받을지 가설이\n문서에 명시됩니다.",
      },
      {
        t: "CHANNEL FOCUS",
        d: "지금 쓸 채널이\n나중 채널과 분리됩니다.",
      },
      {
        t: "90-DAY FOCUS",
        d: "다음 분기가 아니라\n앞으로 90일의 행동이 보입니다.",
      },
    ],
    outcomesEn: [
      {
        t: "ONE NARRATIVE",
        d: "Customer, problem, and model\nread as one connected story.",
      },
      {
        t: "PRICING HYPOTHESIS",
        d: "What you charge is written\nas an explicit hypothesis.",
      },
      {
        t: "CHANNEL FOCUS",
        d: "Channels for now\nstay separate from channels for later.",
      },
      {
        t: "90-DAY FOCUS",
        d: "Actions for the next 90 days\nare visible — not a vague next year.",
      },
    ],
    howToKo: [
      {
        n: "01",
        title: "Idea → Customer → Problem 순으로",
        body: "솔루션을 먼저 쓰지 않습니다.\n누가 어떤 문제로 돈을 낼지 앞 장을 채웁니다.",
      },
      {
        n: "02",
        title: "시장과 대안을 짧게",
        body: "Market 장에 경쟁과 기존 대안을 적고\n‘없다’고 쓰지 않을 근거를 남깁니다.",
      },
      {
        n: "03",
        title: "모델과 가격을 한 장에",
        body: "Business Model에 지불 주체·가격·주기를 적어\n모호한 ‘나중에 정함’을 없앱니다.",
      },
      {
        n: "04",
        title: "GTM은 지금 채널만",
        body: "Go-to-Market에서 초기 90일에 실제로 쓸\n채널 2–3개만 고릅니다.",
      },
      {
        n: "05",
        title: "90일 계획을 주간으로 쪼개기",
        body: "Action Plan의 우선순위를\n주간 할 일로 내려 운영·재무 장과 맞춰 봅니다.",
      },
    ],
    howToEn: [
      {
        n: "01",
        title: "Idea → Customer → Problem first",
        body: "Do not start with Solution.\nFill who pays for which problem on the early chapters.",
      },
      {
        n: "02",
        title: "Keep market notes short",
        body: "List competitors and alternatives on Market,\nand leave evidence if you refuse to write “none.”",
      },
      {
        n: "03",
        title: "Model and price on one page",
        body: "On Business Model, write payer, price, and cadence.\nRemove vague “decide later.”",
      },
      {
        n: "04",
        title: "GTM: channels for now only",
        body: "On Go-to-Market, pick two or three channels\nyou will actually use in the first 90 days.",
      },
      {
        n: "05",
        title: "Break 90 days into weeks",
        body: "Drop Action Plan priorities into weekly work\nand align with Operations and Finance chapters.",
      },
    ],
    formatKo: ["Workbook", "Planning Sheets", "90-Day Plan"],
    formatEn: ["Workbook", "Planning Sheets", "90-Day Plan"],
    faqKo: [
      {
        q: "투자용 사업계획서를 대체하나요?",
        a: "목적이 다릅니다. 이 워크북은 실행용 정리입니다. IR·피치 자료는 여기서 정리된 내용을 바탕으로 별도 작성합니다.",
      },
      {
        q: "재무 모델링 도구가 포함되나요?",
        a: "포함되지 않습니다. 비용·가격·매출 가설을 적는 재무 장 수준이며, 스프레드시트 모델은 별도입니다.",
      },
      {
        q: "비어 있는 장이 있어도 되나요?",
        a: "가능합니다. 비어 있는 칸은 다음 조사·결정 과제로 남기고 90일 계획에 올리면 됩니다.",
      },
      {
        q: "MVP Planning Kit과 함께 쓰나요?",
        a: "가능합니다. 제품 범위는 MVP Kit, 사업·모델·GTM·90일은 이 워크북으로 나누면 역할이 분명합니다.",
      },
    ],
    faqEn: [
      {
        q: "Does it replace an investor business plan?",
        a: "Different purpose. This workbook is for execution. IR and pitch materials are written separately from what you clarify here.",
      },
      {
        q: "Does it include a financial model?",
        a: "No. Finance is hypothesis-level (costs, price, revenue). Spreadsheet models are separate.",
      },
      {
        q: "Can chapters stay empty?",
        a: "Yes. Empty cells become next research or decisions — put them on the 90-day plan.",
      },
      {
        q: "Should I use it with MVP Planning Kit?",
        a: "Yes if useful. Product scope in MVP Kit; business, model, GTM, and 90 days here — roles stay clear.",
      },
    ],
  },

  "product-research-template": {
    preview: "research-board",
    categoryEyebrow: "STORE · RESEARCH",
    title: "Product Research Template",
    previewNameKo: "Research Board Preview",
    previewNameEn: "Research Board Preview",
    heroTitleKo: "추측 대신\n근거로 제품 결정을 내립니다.",
    heroTitleEn: "Product decisions from evidence,\nnot guesses.",
    heroLeadKo:
      "리서치는 인터뷰를 많이 하는 일이 아닙니다.\n\n질문을 정하고,\n관찰을 기록하고,\n가설을 세우고,\n근거로 지지하거나 깨고,\n그 결과를 기능 결정으로 옮기는 일입니다.\n\nProduct Research Template는\n조사 결과를 제품 결정에 연결하는 보드입니다.",
    heroLeadEn:
      "Research is not “do more interviews.”\n\nIt is setting the question,\nrecording observation,\nforming hypotheses,\nsupporting or breaking them with evidence,\nand moving findings into product decisions.\n\nProduct Research Template is the board\nthat connects study results to what you build.",
    overviewTitleKo: "인사이트는\n메모 더미가 아닙니다.",
    overviewTitleEn: "Insight is not\na pile of notes.",
    overviewBodyKo: [
      "인터뷰·페인·대안·경쟁·리뷰·가설·근거·\n인사이트·결정이 한 흐름에 있어야\n조사가 제품으로 남습니다.",
      "근거 없는 ‘느낌’과\n근거 있는 발견을 칸으로 구분합니다.",
      "이 템플릿은 리서치를 보고서용 장식이 아니라\n다음 스프린트 입력으로 쓰게 합니다.",
    ],
    overviewBodyEn: [
      "Interview, pain, alternatives, competitors, reviews,\nhypothesis, evidence, insight, decision —\none flow so research survives into the product.",
      "Separate gut feel from evidenced findings\nby giving them different cells.",
      "This template turns research into sprint input,\nnot decorative report filler.",
    ],
    whoTitleKo: "이런 사람과 팀에게 필요합니다.",
    whoTitleEn: "Who this template is for.",
    whoKo: [
      {
        t: "PRODUCT MANAGERS",
        d: "기능 요청이 쌓일 때\n근거와 우선순위를\n같은 보드에서 보고 싶은 경우",
      },
      {
        t: "RESEARCHERS",
        d: "인터뷰·리뷰 분석을\n제품 결정 로그로\n넘기고 싶은 경우",
      },
      {
        t: "FOUNDERS",
        d: "초기 가정만으로 만들지 않고\n짧은 조사라도 기록으로 남기려는 경우",
      },
      {
        t: "DESIGNERS",
        d: "페인 포인트와 대안 행동을\n화면 결정 전에 정리하고 싶은 경우",
      },
      {
        t: "COMPETITIVE PASSES",
        d: "경쟁·리뷰 마이닝을\n일회성 슬라이드가 아니라\n재사용 보드로 쌓으려는 경우",
      },
      {
        t: "DECISION MEETINGS",
        d: "‘왜 이 기능인가’를\n근거 한 줄로 말하고 싶은 경우",
      },
    ],
    whoEn: [
      {
        t: "PRODUCT MANAGERS",
        d: "When feature requests pile up\nand evidence plus priority need one board",
      },
      {
        t: "RESEARCHERS",
        d: "Handing interview and review analysis\ninto a product decision log",
      },
      {
        t: "FOUNDERS",
        d: "Refusing to build on assumption alone\nand wanting even short studies written down",
      },
      {
        t: "DESIGNERS",
        d: "Clarifying pain points and alternatives\nbefore screen decisions",
      },
      {
        t: "COMPETITIVE PASSES",
        d: "Accumulating competitor and review mining\nas a reusable board, not a one-off slide",
      },
      {
        t: "DECISION MEETINGS",
        d: "Wanting “why this feature”\nto fit in one evidence-backed line",
      },
    ],
    whatTitleKo: "조사에서 결정까지\n칸을 이어 줍니다.",
    whatTitleEn: "Cells that connect\nstudy to decision.",
    whatKo: [
      {
        t: "RESEARCH QUESTION",
        d: "이번 조사에서 알고 싶은 핵심 질문.\n질문이 넓으면 발견도 흐려집니다.",
      },
      {
        t: "USER INTERVIEW",
        d: "사용자 인터뷰 기록.\n인용과 해석을 구분해 적습니다.",
      },
      {
        t: "PAIN POINT",
        d: "반복적으로 등장하는 문제.\n한 번의 불만과 패턴을 나눕니다.",
      },
      {
        t: "CURRENT ALTERNATIVE",
        d: "지금 사용자가 문제를 푸는 방식.\n우리 제품이 대체하려는 현실을 봅니다.",
      },
      {
        t: "COMPETITOR RESEARCH",
        d: "경쟁 제품 비교.\n기능 표보다 사용자가 고르는 이유를 봅니다.",
      },
      {
        t: "REVIEW MINING",
        d: "리뷰와 커뮤니티 반응 분석.\n칭찬·불만의 반복 언어를 모읍니다.",
      },
      {
        t: "HYPOTHESIS",
        d: "조사를 통해 만든 가설.\n검증 가능해야 가설입니다.",
      },
      {
        t: "EVIDENCE",
        d: "가설을 지지하거나 반박하는 근거.\n출처를 같이 남깁니다.",
      },
      {
        t: "INSIGHT",
        d: "제품에 적용할 핵심 발견.\n메모가 아니라 한 줄 결론입니다.",
      },
      {
        t: "PRODUCT DECISION",
        d: "조사 결과를 실제 기능·범위 결정으로 연결합니다.\n하지 않기로 한 것도 기록합니다.",
      },
    ],
    whatEn: [
      {
        t: "RESEARCH QUESTION",
        d: "The core question this study must answer.\nWide questions produce blurry findings.",
      },
      {
        t: "USER INTERVIEW",
        d: "Interview notes.\nKeep quote and interpretation separate.",
      },
      {
        t: "PAIN POINT",
        d: "Problems that keep appearing.\nSeparate one-off complaints from patterns.",
      },
      {
        t: "CURRENT ALTERNATIVE",
        d: "How users solve it today.\nSee the reality your product must replace.",
      },
      {
        t: "COMPETITOR RESEARCH",
        d: "Compare competing products.\nPrefer reasons people choose over feature grids.",
      },
      {
        t: "REVIEW MINING",
        d: "Analyze reviews and community signals.\nCollect repeating praise and complaint language.",
      },
      {
        t: "HYPOTHESIS",
        d: "Hypotheses formed from the research.\nIf it cannot be tested, it is not a hypothesis.",
      },
      {
        t: "EVIDENCE",
        d: "Evidence for or against each hypothesis,\nwith sources attached.",
      },
      {
        t: "INSIGHT",
        d: "Key findings to apply to the product —\none-line conclusions, not note dumps.",
      },
      {
        t: "PRODUCT DECISION",
        d: "Turn findings into feature and scope decisions.\nRecord what you chose not to do.",
      },
    ],
    includesKo: [
      "Research Question Card",
      "Interview Note Template",
      "Pain Point Board",
      "Alternatives Sheet",
      "Competitor Compare",
      "Review Mining Grid",
      "Hypothesis Log",
      "Evidence Log",
      "Insight Summary",
      "Decision Log",
    ],
    includesEn: [
      "Research Question Card",
      "Interview Note Template",
      "Pain Point Board",
      "Alternatives Sheet",
      "Competitor Compare",
      "Review Mining Grid",
      "Hypothesis Log",
      "Evidence Log",
      "Insight Summary",
      "Decision Log",
    ],
    outcomesTitleKo: "다음 빌드에 들어갈\n결정이 남습니다.",
    outcomesTitleEn: "Decisions that enter\nthe next build.",
    outcomesKo: [
      {
        t: "TRACEABLE WHY",
        d: "기능 결정 뒤에\n질문·근거·인사이트 경로가 남습니다.",
      },
      {
        t: "PATTERN VIEW",
        d: "한 명 의견과 반복 페인을\n구분해서 볼 수 있습니다.",
      },
      {
        t: "KILL LIST",
        d: "근거가 약한 아이디어를\n명시적으로 내려놓을 수 있습니다.",
      },
      {
        t: "SPRINT INPUT",
        d: "리서치 결과가 로드맵·백로그\n입력으로 바로 연결됩니다.",
      },
    ],
    outcomesEn: [
      {
        t: "TRACEABLE WHY",
        d: "Behind each feature decision:\na path of question, evidence, and insight.",
      },
      {
        t: "PATTERN VIEW",
        d: "See one-person opinions\nseparately from repeating pains.",
      },
      {
        t: "KILL LIST",
        d: "Explicitly drop weak ideas\ninstead of quietly carrying them.",
      },
      {
        t: "SPRINT INPUT",
        d: "Research feeds roadmap and backlog\nwithout a translation gap.",
      },
    ],
    howToKo: [
      {
        n: "01",
        title: "연구 질문을 좁히기",
        body: "Research Question에 ‘이번 주 조사로 답할 것’만 적고\n그 밖은 다음 라운드로 미룹니다.",
      },
      {
        n: "02",
        title: "인용과 해석 분리",
        body: "Interview와 Review Mining에서\n사용자가 한 말과 팀의 해석을 칸으로 나눕니다.",
      },
      {
        n: "03",
        title: "가설을 검증 가능하게",
        body: "Hypothesis에 참/거짓을 가르는 관찰을 적고\nEvidence에 지지·반박을 붙입니다.",
      },
      {
        n: "04",
        title: "인사이트를 한 줄로",
        body: "Insight에 긴 요약을 쓰지 않고\n제품에 적용할 결론만 남깁니다.",
      },
      {
        n: "05",
        title: "결정 로그로 닫기",
        body: "Product Decision에 할 일/하지 않을 일과\n연결된 근거 ID를 함께 기록합니다.",
      },
    ],
    howToEn: [
      {
        n: "01",
        title: "Narrow the research question",
        body: "On Research Question, write only what this round must answer.\nPark the rest for a later round.",
      },
      {
        n: "02",
        title: "Split quote from interpretation",
        body: "In Interview and Review Mining,\nkeep user words and team interpretation in separate cells.",
      },
      {
        n: "03",
        title: "Make hypotheses testable",
        body: "On Hypothesis, name the observation that would falsify it,\nthen attach support or pushback on Evidence.",
      },
      {
        n: "04",
        title: "Insight as one line",
        body: "Do not dump long summaries on Insight.\nLeave only conclusions that change the product.",
      },
      {
        n: "05",
        title: "Close with Decision Log",
        body: "On Product Decision, record do / do-not\nand the linked evidence IDs.",
      },
    ],
    formatKo: ["Research Board", "Interview Guide", "Decision Log"],
    formatEn: ["Research Board", "Interview Guide", "Decision Log"],
    faqKo: [
      {
        q: "대규모 설문이나 통계 분석도 포함되나요?",
        a: "포함되지 않습니다. 제품 결정을 위한 정성·관찰 중심 템플릿이며, 대규모 조사는 별도 범위입니다.",
      },
      {
        q: "인터뷰 스크립트 전체가 들어있나요?",
        a: "가이드와 기록 칸을 제공합니다. 산업별 장문 스크립트는 팀 맥락에 맞게 확장합니다.",
      },
      {
        q: "리서치 경험이 없어도 쓸 수 있나요?",
        a: "가능합니다. 질문 → 기록 → 가설 → 근거 → 결정 순서를 따라가면 됩니다.",
      },
      {
        q: "Newon Business Research와 관계가 있나요?",
        a: "스토어 템플릿은 스스로 정리하는 도구입니다. 심층 조사·대행이 필요하면 Business Research로 이어갈 수 있습니다.",
      },
    ],
    faqEn: [
      {
        q: "Does it include large surveys or statistics?",
        a: "No. It is a qualitative, observation-first template for product decisions. Large studies are out of scope.",
      },
      {
        q: "Is a full interview script included?",
        a: "You get a guide and note cells. Long industry scripts are extended for your context.",
      },
      {
        q: "Can non-researchers use it?",
        a: "Yes. Follow question → notes → hypothesis → evidence → decision.",
      },
      {
        q: "How does it relate to Newon Business Research?",
        a: "The Store template is a self-serve tool. For deeper or facilitated research, continue through Business Research.",
      },
    ],
  },

  "founder-dashboard": {
    preview: "founder-dash",
    categoryEyebrow: "STORE · DASHBOARD",
    title: "Founder Dashboard",
    previewNameKo: "Founder Dashboard Preview",
    previewNameEn: "Founder Dashboard Preview",
    heroTitleKo: "제품·성장·매출·운영을\n한 화면에서 봅니다.",
    heroTitleEn: "Product, growth, revenue, ops —\none operating screen.",
    heroLeadKo:
      "창업자의 하루는 탭과 채팅 사이를\n오가며 사라지기 쉽습니다.\n\n이번 주 우선순위,\n제품 상태, 성장 신호, 매출과 비용,\n고객 피드백, 내가 결정해야 할 일 —\n한곳에 모여 있어야 합니다.\n\nFounder Dashboard는\n주간 운영을 위한 대시보드 템플릿입니다.",
    heroLeadEn:
      "A founder’s day disappears easily\nbetween tabs and chat threads.\n\nWeekly priorities,\nproduct status, growth signals, revenue and cost,\ncustomer feedback, decisions you own —\nneed one place.\n\nFounder Dashboard is a template\nfor weekly operating clarity.",
    overviewTitleKo: "대시보드는 예쁜 숫자판이 아닙니다.",
    overviewTitleEn: "A dashboard is not\na pretty number wall.",
    overviewBodyKo: [
      "Overview, Product, Growth, Business,\nCustomers, Founder 영역을 한 화면에 모아\n이번 주 무엇을 할지 결정하게 합니다.",
      "모든 지표를 넣지 않습니다.\n의사결정에 쓰는 신호만 남깁니다.",
      "혼자 운영하는 창업자와 초기 팀이\n월요일에 열어보는 운영판을 목표로 합니다.",
    ],
    overviewBodyEn: [
      "Overview, Product, Growth, Business,\nCustomers, and Founder panels on one screen\nso you decide what this week is for.",
      "Not every metric —\nonly signals that change decisions.",
      "Built for solo founders and early teams\nwho open an ops board on Monday.",
    ],
    whoTitleKo: "이런 사람과 팀에게 필요합니다.",
    whoTitleEn: "Who this dashboard is for.",
    whoKo: [
      {
        t: "FOUNDERS",
        d: "제품과 매출, 고객 응대를\n혼자 넘나들며\n우선순위가 흐려지는 경우",
      },
      {
        t: "OPERATORS",
        d: "주간 지표와 할 일을\n같은 보드에서\n보고 싶은 경우",
      },
      {
        t: "SOLO BUILDERS",
        d: "사이드·본업을 함께 운영하며\n한 주의 초점을\n한 화면에 고정하고 싶은 경우",
      },
      {
        t: "EARLY STARTUP TEAMS",
        d: "툴이 늘어나 정보가 흩어져\n주간 싱크가 길어지는 경우",
      },
      {
        t: "MULTI-PRODUCT",
        d: "제품이 둘 이상일 때\n활성 제품과 실험을\n한눈에 보고 싶은 경우",
      },
      {
        t: "RUNWAY AWARE",
        d: "성장뿐 아니라\n비용·런웨이 신호를\n같은 리듬으로 보고 싶은 경우",
      },
    ],
    whoEn: [
      {
        t: "FOUNDERS",
        d: "Jumping between product, revenue, and support\nuntil weekly priority blurs",
      },
      {
        t: "OPERATORS",
        d: "Wanting weekly metrics and tasks\non the same board",
      },
      {
        t: "SOLO BUILDERS",
        d: "Running side and core work together\nand needing one screen for the week’s focus",
      },
      {
        t: "EARLY STARTUP TEAMS",
        d: "Tool sprawl scattering information\nand stretching weekly sync",
      },
      {
        t: "MULTI-PRODUCT",
        d: "More than one product —\nneeding active products and experiments in one view",
      },
      {
        t: "RUNWAY AWARE",
        d: "Watching cost and runway signals\non the same rhythm as growth",
      },
    ],
    whatTitleKo: "운영에 쓰는 패널만\n남깁니다.",
    whatTitleEn: "Only panels that\nchange how you operate.",
    whatKo: [
      {
        t: "OVERVIEW",
        d: "Revenue · Users · Conversion · Active Products.\n주간 상태를 한 줄로 읽습니다.",
      },
      {
        t: "PRODUCT",
        d: "Current Sprint · Roadmap · Bugs · Experiments.\n지금 만들고 고치는 것을 모읍니다.",
      },
      {
        t: "GROWTH",
        d: "Traffic · Acquisition · Activation · Retention.\n성장 파이프의 어디가 막혔는지 봅니다.",
      },
      {
        t: "BUSINESS",
        d: "Revenue · Expenses · MRR · Runway.\n돈이 들어오는 속도와 나가는 속도를 같이 봅니다.",
      },
      {
        t: "CUSTOMERS",
        d: "Feedback · Support · Feature Requests.\n고객 신호가 백로그로 들어가기 전 대기열입니다.",
      },
      {
        t: "FOUNDER",
        d: "Weekly Priorities · Decisions · Meetings · Notes.\n창업자 본인의 초점과 결정 로그입니다.",
      },
    ],
    whatEn: [
      {
        t: "OVERVIEW",
        d: "Revenue · Users · Conversion · Active Products.\nRead the week in one line.",
      },
      {
        t: "PRODUCT",
        d: "Current Sprint · Roadmap · Bugs · Experiments.\nWhat you are building and fixing now.",
      },
      {
        t: "GROWTH",
        d: "Traffic · Acquisition · Activation · Retention.\nSee where the growth pipe is stuck.",
      },
      {
        t: "BUSINESS",
        d: "Revenue · Expenses · MRR · Runway.\nMoney in and money out on the same rhythm.",
      },
      {
        t: "CUSTOMERS",
        d: "Feedback · Support · Feature Requests.\nA holding queue before signals enter the backlog.",
      },
      {
        t: "FOUNDER",
        d: "Weekly Priorities · Decisions · Meetings · Notes.\nYour personal focus and decision log.",
      },
    ],
    includesKo: [
      "Overview Panel",
      "Product Panel",
      "Growth Panel",
      "Business Panel",
      "Customers Panel",
      "Founder Focus Panel",
      "Weekly Priorities List",
      "Experiment Log",
      "Decision Log",
      "Meeting Notes Layout",
    ],
    includesEn: [
      "Overview Panel",
      "Product Panel",
      "Growth Panel",
      "Business Panel",
      "Customers Panel",
      "Founder Focus Panel",
      "Weekly Priorities List",
      "Experiment Log",
      "Decision Log",
      "Meeting Notes Layout",
    ],
    outcomesTitleKo: "한 주의 초점이\n화면에 고정됩니다.",
    outcomesTitleEn: "The week’s focus\nstays on screen.",
    outcomesKo: [
      {
        t: "SINGLE SOURCE WEEK",
        d: "지표·할 일·결정이\n여러 툴이 아니라 한 보드에 모입니다.",
      },
      {
        t: "PRIORITY LOCK",
        d: "이번 주 3가지가\nFounder 패널에 명시됩니다.",
      },
      {
        t: "SIGNAL FILTER",
        d: "고객·성장 신호가\n즉시 할 일과 나중에 볼 일로 갈립니다.",
      },
      {
        t: "RUNWAY AWARENESS",
        d: "성장 이야기와 별도로\n비용·런웨이 신호가 같은 주기에 보입니다.",
      },
    ],
    outcomesEn: [
      {
        t: "SINGLE SOURCE WEEK",
        d: "Metrics, tasks, and decisions\nlive on one board instead of many tools.",
      },
      {
        t: "PRIORITY LOCK",
        d: "This week’s top three\nare explicit on the Founder panel.",
      },
      {
        t: "SIGNAL FILTER",
        d: "Customer and growth signals split into\ndo-now versus review-later.",
      },
      {
        t: "RUNWAY AWARENESS",
        d: "Cost and runway stay visible\non the same cadence as growth talk.",
      },
    ],
    howToKo: [
      {
        n: "01",
        title: "월요일 Overview 채우기",
        body: "지난주 숫자와 Active Products만 먼저 갱신해\n주의 시작 상태를 고정합니다.",
      },
      {
        n: "02",
        title: "Founder 우선순위 3개",
        body: "Weekly Priorities에 이번 주 꼭 끝낼 일 3개만 적고\n나머지는 Parking으로 보냅니다.",
      },
      {
        n: "03",
        title: "Product·Growth 신호 읽기",
        body: "스프린트·버그·실험과 획득·활성화·리텐션을 보고\n우선순위를 바꿀지 결정합니다.",
      },
      {
        n: "04",
        title: "Business와 Customers 점검",
        body: "매출·비용·런웨이와 피드백·지원 대기열을 짧게 훑어\n긴급 이슈만 끌어올립니다.",
      },
      {
        n: "05",
        title: "금요 Decision Log",
        body: "이번 주 내린 결정과 보류한 실험을 기록하고\n다음 주 Overview로 넘깁니다.",
      },
    ],
    howToEn: [
      {
        n: "01",
        title: "Fill Overview on Monday",
        body: "Refresh last week’s numbers and Active Products first\nto lock the starting state of the week.",
      },
      {
        n: "02",
        title: "Three Founder priorities",
        body: "Write only three must-finish items on Weekly Priorities.\nPark everything else.",
      },
      {
        n: "03",
        title: "Read Product and Growth",
        body: "Scan sprint, bugs, experiments plus acquisition,\nactivation, retention — decide whether priorities shift.",
      },
      {
        n: "04",
        title: "Check Business and Customers",
        body: "Skim revenue, cost, runway, feedback, and support queues.\nPromote only urgent issues.",
      },
      {
        n: "05",
        title: "Friday Decision Log",
        body: "Record decisions and parked experiments,\nthen roll into next week’s Overview.",
      },
    ],
    formatKo: ["Dashboard Template", "Weekly Priorities", "Ops Board"],
    formatEn: ["Dashboard Template", "Weekly Priorities", "Ops Board"],
    faqKo: [
      {
        q: "실시간 데이터 연동이 포함되나요?",
        a: "템플릿 단계에서는 수동 입력·복사를 전제로 합니다. 연동은 팀 도구에 맞게 확장하는 범위입니다.",
      },
      {
        q: "투자자용 보드인가요?",
        a: "아닙니다. 창업자·초기 팀의 주간 운영용입니다.",
      },
      {
        q: "지표가 아직 거의 없어도 쓸 수 있나요?",
        a: "가능합니다. 비어 있는 칸은 ‘아직 측정 안 함’으로 두고 Founder 우선순위부터 채우면 됩니다.",
      },
      {
        q: "Product Roadmap Template과 어떻게 나뉘나요?",
        a: "대시보드는 주간 운영 화면입니다. 로드맵은 중장기 Now/Next/Later 방향 문서입니다.",
      },
    ],
    faqEn: [
      {
        q: "Does it include live data integrations?",
        a: "At template stage it assumes manual entry or copy. Integrations are a team-tool extension.",
      },
      {
        q: "Is it an investor board?",
        a: "No. It is for founders and early teams operating week to week.",
      },
      {
        q: "Can I use it with almost no metrics yet?",
        a: "Yes. Leave empty cells as “not measured yet” and start with Founder priorities.",
      },
      {
        q: "How does it differ from Product Roadmap Template?",
        a: "The dashboard is a weekly ops screen. The roadmap is a Now/Next/Later direction document.",
      },
    ],
  },

  "product-roadmap": {
    preview: "roadmap-cols",
    categoryEyebrow: "STORE · ROADMAP",
    title: "Product Roadmap Template",
    previewNameKo: "Roadmap Board Preview",
    previewNameEn: "Roadmap Board Preview",
    heroTitleKo: "할 일 나열이 아니라\n제품이 가는 방향을 보여줍니다.",
    heroTitleEn: "Not a task dump —\na direction the product is going.",
    heroLeadKo:
      "로드맵에 이슈를 잔뜩 올려 두면\n우선순위처럼 보이지만 방향은 없습니다.\n\nVision, Now, Next, Later,\nTheme, Initiatives, Metrics, Decisions —\n어디를 향해 가는지가 먼저여야 합니다.\n\nProduct Roadmap Template는\n제품의 이동을 보이게 하는 보드입니다.",
    heroLeadEn:
      "A roadmap packed with tickets\ncan look like priority without direction.\n\nVision, Now, Next, Later,\nthemes, initiatives, metrics, decisions —\nwhere you are going comes first.\n\nProduct Roadmap Template is the board\nthat makes product movement visible.",
    overviewTitleKo: "로드맵은 약속 목록이 아닙니다.",
    overviewTitleEn: "A roadmap is not\na promise list.",
    overviewBodyKo: [
      "날짜에 기능을 박아 넣는 대신\n지금·다음·나중에로 긴장감을 둡니다.",
      "테마와 이니셔티브로 목표를 묶고,\n지표로 성공을 정의하며,\n결정 로그로 왜 미뤘는지를 남깁니다.",
      "이 템플릿은 공유용 방향 문서와\n실행 팀의 공통 언어를 동시에 노립니다.",
    ],
    overviewBodyEn: [
      "Instead of pinning features to dates,\nhold tension across Now, Next, and Later.",
      "Themes and initiatives group goals,\nmetrics define success,\nand a decision log keeps why you deferred.",
      "The template aims at a shareable direction doc\nand a common language for the build team.",
    ],
    whoTitleKo: "이런 사람과 팀에게 필요합니다.",
    whoTitleEn: "Who this roadmap is for.",
    whoKo: [
      {
        t: "PRODUCT LEADS",
        d: "백로그는 있는데\n분기 방향이 한 장으로\n설명되지 않는 경우",
      },
      {
        t: "ENGINEERING LEADS",
        d: "의존성과 순서를\nNow/Next 관점에서\n정렬하고 싶은 경우",
      },
      {
        t: "FOUNDERS",
        d: "아이디어가 많아\n무엇을 나중에 둘지\n공개적으로 말하고 싶은 경우",
      },
      {
        t: "PMs",
        d: "이해관계자 요청을\n로드맵 결정으로\n기록하며 거절·연기하길 원하는 경우",
      },
      {
        t: "SMALL PRODUCT TEAMS",
        d: "툴마다 계획이 달라\n하나의 방향 보드가 필요한 경우",
      },
      {
        t: "POST-MVP",
        d: "첫 출시 이후\n다음 테마를 잡고\n실험과 확장을 나누려는 경우",
      },
    ],
    whoEn: [
      {
        t: "PRODUCT LEADS",
        d: "With a backlog but no one-page story\nfor quarterly direction",
      },
      {
        t: "ENGINEERING LEADS",
        d: "Wanting dependencies and sequence\naligned through Now / Next",
      },
      {
        t: "FOUNDERS",
        d: "With many ideas and a need to say publicly\nwhat waits for Later",
      },
      {
        t: "PMs",
        d: "Recording stakeholder asks as roadmap decisions —\ndefer and decline with a log",
      },
      {
        t: "SMALL PRODUCT TEAMS",
        d: "Plans differ by tool\nand one direction board is missing",
      },
      {
        t: "POST-MVP",
        d: "After first ship — setting the next theme\nand separating experiments from expansion",
      },
    ],
    whatTitleKo: "방향·시점·결정을\n같은 보드에 둡니다.",
    whatTitleEn: "Direction, timing, and decisions\non one board.",
    whatKo: [
      {
        t: "VISION",
        d: "제품이 장기적으로 해결하려는 문제.\n기능이 아니라 목적지입니다.",
      },
      {
        t: "NOW",
        d: "현재 가장 중요한 문제와 작업.\n이번 주기에 집중하는 것만 올립니다.",
      },
      {
        t: "NEXT",
        d: "다음 단계에서 검증할 기능과 개선.\n준비가 되면 Now로 이동합니다.",
      },
      {
        t: "LATER",
        d: "장기적으로 고려할 아이디어.\n버리지 않되 약속하지 않습니다.",
      },
      {
        t: "THEME",
        d: "분기 또는 기간별 핵심 목표.\n여러 이니셔티브를 묶는 제목입니다.",
      },
      {
        t: "INITIATIVES",
        d: "목표를 달성하기 위한 주요 프로젝트.\n티켓 뭉치가 아니라 결과 단위입니다.",
      },
      {
        t: "METRICS",
        d: "각 단계에서 확인할 성공 지표.\n완료와 성공을 구분합니다.",
      },
      {
        t: "DECISIONS",
        d: "무엇을 왜 연기하거나 제외했는지 기록.\n로드맵의 신뢰는 여기서 생깁니다.",
      },
    ],
    whatEn: [
      {
        t: "VISION",
        d: "The long-term problem the product solves.\nDestination, not a feature.",
      },
      {
        t: "NOW",
        d: "The most important current problems and work.\nOnly what this cycle focuses on.",
      },
      {
        t: "NEXT",
        d: "Features and improvements to validate next.\nThey move to Now when ready.",
      },
      {
        t: "LATER",
        d: "Ideas for the longer term.\nKept without being promised.",
      },
      {
        t: "THEME",
        d: "Core goals by quarter or period.\nTitles that bind initiatives.",
      },
      {
        t: "INITIATIVES",
        d: "Major projects that advance the goals.\nOutcome units, not ticket piles.",
      },
      {
        t: "METRICS",
        d: "Success metrics for each stage.\nSeparate done from successful.",
      },
      {
        t: "DECISIONS",
        d: "Record what was deferred or cut, and why.\nRoadmap trust is built here.",
      },
    ],
    includesKo: [
      "Vision Statement Card",
      "Now Column",
      "Next Column",
      "Later Column",
      "Theme Map",
      "Initiatives List",
      "Metrics Sheet",
      "Decision Log",
      "Dependency Notes",
      "Shareable Summary Outline",
    ],
    includesEn: [
      "Vision Statement Card",
      "Now Column",
      "Next Column",
      "Later Column",
      "Theme Map",
      "Initiatives List",
      "Metrics Sheet",
      "Decision Log",
      "Dependency Notes",
      "Shareable Summary Outline",
    ],
    outcomesTitleKo: "우선순위 논쟁이\n방향 대화로 바뀝니다.",
    outcomesTitleEn: "Priority fights become\ndirection conversations.",
    outcomesKo: [
      {
        t: "VISIBLE HORIZON",
        d: "Now / Next / Later가\n한눈에 구획됩니다.",
      },
      {
        t: "THEME ALIGNMENT",
        d: "개별 기능이 어떤 테마에 속하는지\n설명 가능해집니다.",
      },
      {
        t: "DECISION MEMORY",
        d: "연기·제외 이유가\n회의마다 다시 발명되지 않습니다.",
      },
      {
        t: "SHAREABLE DIRECTION",
        d: "팀 밖에도\n짧은 요약으로 방향을 전달할 수 있습니다.",
      },
    ],
    outcomesEn: [
      {
        t: "VISIBLE HORIZON",
        d: "Now / Next / Later\nread as clear zones.",
      },
      {
        t: "THEME ALIGNMENT",
        d: "You can explain which theme\neach feature belongs to.",
      },
      {
        t: "DECISION MEMORY",
        d: "Defer and cut reasons\nare not reinvented every meeting.",
      },
      {
        t: "SHAREABLE DIRECTION",
        d: "You can carry direction outside the team\nwith a short summary.",
      },
    ],
    howToKo: [
      {
        n: "01",
        title: "Vision 한 문장",
        body: "기능 목록을 옮기기 전에\n장기적으로 푸는 문제를 Vision에 고정합니다.",
      },
      {
        n: "02",
        title: "백로그를 Now/Next/Later로 분류",
        body: "모든 아이템을 세 열에 나누고\nNow에는 이번 주기 용량만 남깁니다.",
      },
      {
        n: "03",
        title: "테마로 묶기",
        body: "흩어진 이니셔티브를 Theme Map에 연결해\n‘왜 지금 이것들인지’를 말하게 합니다.",
      },
      {
        n: "04",
        title: "성공 지표 달기",
        body: "주요 Now·Next 항목에 Metrics를 붙여\n완료 체크와 성공 정의를 분리합니다.",
      },
      {
        n: "05",
        title: "결정 로그 습관화",
        body: "요청을 거절·연기할 때마다 Decisions에 이유를 남기고\n공유용 요약을 갱신합니다.",
      },
    ],
    howToEn: [
      {
        n: "01",
        title: "One Vision sentence",
        body: "Before moving feature lists,\nlock the long-term problem on Vision.",
      },
      {
        n: "02",
        title: "Sort backlog into Now / Next / Later",
        body: "Place every item in one of three columns.\nKeep only this cycle’s capacity in Now.",
      },
      {
        n: "03",
        title: "Bind with themes",
        body: "Connect initiatives on Theme Map\nso you can say why these items are together now.",
      },
      {
        n: "04",
        title: "Attach success metrics",
        body: "Add Metrics to major Now and Next items.\nSeparate checkbox-done from success.",
      },
      {
        n: "05",
        title: "Habitual Decision Log",
        body: "When you decline or defer, write why on Decisions\nand refresh the shareable summary.",
      },
    ],
    formatKo: ["Roadmap Board", "Theme Map", "Decision Log"],
    formatEn: ["Roadmap Board", "Theme Map", "Decision Log"],
    faqKo: [
      {
        q: "날짜가 있는 간트 차트인가요?",
        a: "기본은 Now / Next / Later 방향 보드입니다. 날짜 확정이 필요하면 팀이 별도로 얹습니다.",
      },
      {
        q: "Jira·Linear를 대체하나요?",
        a: "대체하지 않습니다. 이슈 트래커 위의 방향 문서 역할을 합니다.",
      },
      {
        q: "이해관계자에게 그대로 공유해도 되나요?",
        a: "가능합니다. Shareable Summary Outline으로 짧게 만든 뒤 상세 보드는 팀용으로 두는 방식을 권장합니다.",
      },
      {
        q: "Founder Dashboard와 함께 쓰나요?",
        a: "가능합니다. 로드맵은 중장기 방향, 대시보드는 주간 운영으로 역할을 나누면 됩니다.",
      },
    ],
    faqEn: [
      {
        q: "Is it a dated Gantt chart?",
        a: "By default it is a Now / Next / Later direction board. Add dates only if your team needs them.",
      },
      {
        q: "Does it replace Jira or Linear?",
        a: "No. It sits above issue trackers as a direction document.",
      },
      {
        q: "Can we share it with stakeholders as-is?",
        a: "Yes. Prefer a short Shareable Summary for outside the team and keep the full board for builders.",
      },
      {
        q: "Should we use it with Founder Dashboard?",
        a: "Yes if useful. Roadmap for mid/long direction; dashboard for weekly ops.",
      },
    ],
  },
};

export function getStoreDetail(slug) {
  return STORE_DETAILS[slug] || null;
}

export function getStoreDetailUi(lang) {
  return STORE_DETAIL_UI[lang === "ko" ? "ko" : "en"];
}
