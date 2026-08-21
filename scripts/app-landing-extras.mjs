/**
 * Bilingual content and HTML helpers for the enhanced Newon app landings.
 *
 * Keep product claims here aligned with the existing app locale copy. In
 * particular, comparison rows intentionally avoid prices, ratings, download
 * counts, and undocumented free-tier limits.
 */

const text = (ko, en) => ({ ko, en });

const sharedFaq = [
  {
    q: text("무료로 사용할 수 있나요?", "Can I use the app for free?"),
    a: text(
      "네. 기본 기능은 무료로 사용할 수 있으며, 추가 기능은 Premium 섹션에서 확인할 수 있습니다.",
      "Yes. Basic features are free to use. See the Premium section for optional additional features.",
    ),
  },
  {
    q: text("어떤 기기에서 사용할 수 있나요?", "Which devices are supported?"),
    a: text(
      "App Store와 Google Play의 스토어 링크를 통해 iOS와 Android에서 이용할 수 있습니다.",
      "The app is available for iOS and Android through the App Store and Google Play links.",
    ),
  },
  {
    q: text("내 데이터는 어떻게 처리되나요?", "How is my data handled?"),
    a: text(
      "수집 항목과 처리 방식은 앱 및 기능에 따라 다를 수 있습니다. 자세한 내용은 개인정보 처리방침을 확인해 주세요.",
      "Data practices may vary by app and feature. Please review the Privacy Policy for details.",
    ),
  },
  {
    q: text("Premium에는 무엇이 포함되나요?", "What is included with Premium?"),
    a: text(
      "제공되는 Premium 기능은 이 페이지의 Premium 섹션에서 확인할 수 있습니다.",
      "The Premium features offered by this app are listed in the Premium section on this page.",
    ),
  },
  {
    q: text("구독은 어디에서 관리하나요?", "Where do I manage my subscription?"),
    a: text(
      "구독의 구매, 갱신, 해지는 결제에 사용한 App Store 또는 Google Play에서 관리합니다.",
      "Manage purchases, renewals, and cancellations through the App Store or Google Play account used for payment.",
    ),
  },
  {
    q: text("계정과 데이터를 삭제하려면 어떻게 하나요?", "How do I delete my account and data?"),
    a: text(
      "이 페이지의 계정 삭제 안내에서 앱별 삭제 절차를 확인해 주세요.",
      "Use the app-specific account deletion page linked here for deletion instructions.",
    ),
  },
  {
    q: text("도움이 필요하면 어디로 연락하나요?", "How can I contact support?"),
    a: text(
      "도움이 필요하면 newon@newon.app으로 문의해 주세요.",
      "For help, contact newon@newon.app.",
    ),
  },
];

export const UI = {
  ko: {
    glanceTitle: "한눈에 보기",
    glanceLabel: "OVERVIEW",
    glanceBestForLabel: "🎯 BEST FOR",
    glanceCoreLabel: "⚡ CORE EXPERIENCE",
    glancePlatformLabel: "📱 PLATFORM",
    glancePlatform: "iOS · Android",
    glanceLangLabel: "🌐 LANGUAGES",
    glanceLang: "13",
    glanceLangUnit: "언어",
    glanceAvailLabel: "🌍 AVAILABLE IN",
    glanceAvail: "177개국",
    glanceAvailNum: "177",
    glanceAvailUnit: "개국",
    glanceSnapshotEyebrow: "✨ PRODUCT SNAPSHOT",
    glanceFamilyLabel: "👨‍👩‍👧 FAMILY",
    glanceTravelLabel: "✈️ TRAVEL",
    glanceMembershipLabel: "🎫 MEMBERSHIP",
    valuesLabel: "핵심 가치",
    valuesTitle: "이 앱이 다른 이유",
    baLabel: "사용 전과 후",
    baTitle: "이렇게 달라집니다",
    before: "BEFORE",
    after: "AFTER",
    compareLabel: "플랜 비교",
    compareTitle: "무료 vs Premium",
    compareFeature: "기능",
    compareFree: "무료",
    comparePrem: "Premium",
    previewTitle: "앱 미리보기",
    previewLede: "직접 사용하게 될 주요 화면을 미리 확인하세요.",
    faqLabel: "도움말",
    faqTitle: "자주 묻는 질문",
    privacyLabel: "PRIVACY & CONTROL",
    privacyTitle: "내 정보와 이용 권한 관리",
    privacyPrivacy: "개인정보 처리방침",
    privacyTerms: "이용약관",
    privacyDelete: "계정 삭제 안내",
    privacySubscribe: "구독 관리 안내",
    relatedLabel: "앱 둘러보기",
    relatedTitle: "Newon의 다른 앱",
    finalCtaAppStore: "App Store에서 다운로드",
    finalCtaGooglePlay: "Google Play에서 다운로드",
    statusReleased: "출시됨",
  },
  en: {
    glanceTitle: "At a glance",
    glanceLabel: "OVERVIEW",
    glanceBestForLabel: "🎯 BEST FOR",
    glanceCoreLabel: "⚡ CORE EXPERIENCE",
    glancePlatformLabel: "📱 PLATFORM",
    glancePlatform: "iOS · Android",
    glanceLangLabel: "🌐 LANGUAGES",
    glanceLang: "13",
    glanceLangUnit: "languages",
    glanceAvailLabel: "🌍 AVAILABLE IN",
    glanceAvail: "177 Countries",
    glanceAvailNum: "177",
    glanceAvailUnit: "countries",
    glanceSnapshotEyebrow: "✨ PRODUCT SNAPSHOT",
    glanceFamilyLabel: "👨‍👩‍👧 FAMILY",
    glanceTravelLabel: "✈️ TRAVEL",
    glanceMembershipLabel: "🎫 MEMBERSHIP",
    valuesLabel: "Core value",
    valuesTitle: "What sets this app apart",
    baLabel: "The difference",
    baTitle: "How your experience changes",
    before: "BEFORE",
    after: "AFTER",
    compareLabel: "Plan comparison",
    compareTitle: "Free vs Premium",
    compareFeature: "Feature",
    compareFree: "Free",
    comparePrem: "Premium",
    previewTitle: "App preview",
    previewLede: "Preview the key screens you will use every day.",
    faqLabel: "Help",
    faqTitle: "FAQ",
    privacyLabel: "PRIVACY & CONTROL",
    privacyTitle: "Manage your information and access",
    privacyPrivacy: "Privacy Policy",
    privacyTerms: "Terms of Service",
    privacyDelete: "Account deletion",
    privacySubscribe: "Subscription management",
    relatedLabel: "Explore apps",
    relatedTitle: "More from Newon",
    finalCtaAppStore: "Download on the App Store",
    finalCtaGooglePlay: "Get it on Google Play",
    statusReleased: "Released",
  },
};

export const APP_LANDING = [
  {
    ns: "ox",
    name: "OX MONTH",
    hash: "#ox-month",
    logo: "/ox-month-logo.png",
    deletePath: "oxmonth/delete-account/",
    status: "released",
    related: ["gu", "cu", "np"],
    heroValue: text(
      "하루 한 번 O/X로 만드는 가장 단순한 습관 관리",
      "The simplest habit tracker: one O/X check a day",
    ),
    glance: {
      accent: "ox",
      snapshot: text("매일 한 번의 체크로 습관의 흐름을 기록하세요.", "Track your habits with one check a day."),
      bestFor: text("부담 없이 습관을 이어가고 싶은 사람", "Anyone who wants low-friction habit tracking"),
      coreItems: [
        text("O/X 체크", "O/X check"),
        text("월간 기록", "Monthly record"),
        text("습관 통계", "Habit stats"),
      ],
      platforms: ["iOS", "Android"],
      showLang: true,
      showAvail: true,
    },
    values: [
      { title: text("판단은 단순하게", "A simple decision"), body: text("오늘 했는지만 O 또는 X로 남겨 기록의 부담을 줄입니다.", "Record only whether you did it today, with O or X.") },
      { title: text("한 달을 한눈에", "Your month at a glance"), body: text("매일의 체크를 월간 흐름으로 확인해 꾸준함을 눈에 보이게 합니다.", "Turn daily checks into a clear view of your consistency.") },
      { title: text("나에게 맞는 습관", "Habits that feel personal"), body: text("습관과 기록 화면을 원하는 방식으로 구성해 매일 다시 찾기 쉽게 만듭니다.", "Shape your habits and tracking view so returning each day feels natural.") },
    ],
    beforeAfter: [
      { before: text("복잡한 기록 방식 때문에 시작을 미룸", "Putting off a habit because tracking feels complicated"), after: text("O/X 한 번으로 오늘의 실천을 바로 기록", "Logging today with a single O/X check") },
      { before: text("며칠이나 꾸준했는지 기억에 의존", "Relying on memory to judge consistency"), after: text("월간 기록에서 흐름과 변화를 확인", "Seeing patterns and progress in the monthly view") },
    ],
    compareRows: [
      { feature: text("월간 습관 수", "Habits per month"), free: text("최대 5개", "Up to 5"), prem: text("무제한", "Unlimited") },
      { feature: text("O/X 컬러", "O/X colors"), free: text("고정 2색", "2 default colors"), prem: text("55색 팔레트", "55-color palette") },
    ],
    previewCaps: [
      text("오늘의 습관을 O/X로 빠르게 체크", "Check today's habits with O/X"),
      text("달력에서 한 달의 기록 확인", "Review a full month on the calendar"),
      text("통계로 꾸준함과 변화 파악", "See consistency and change in stats"),
      text("습관별 기록과 컬러 구성", "Organize habits and their colors"),
    ],
  },
  {
    ns: "sp",
    name: "SubPing",
    hash: "#subping-app",
    logo: "/subping-logo.png",
    deletePath: "subping/delete-account/",
    status: "released",
    related: ["sv", "pu", "np"],
    heroValue: text("놓치기 쉬운 구독과 결제일을 한곳에서", "Keep subscriptions and payment dates in one place"),
    glance: {
      accent: "sp",
      snapshot: text("구독과 결제일을 한곳에서 관리하세요.", "Keep subscriptions and payment dates in one place."),
      bestFor: text("여러 구독을 한곳에서 관리하고 싶은 사람", "Anyone who wants subscriptions in one place"),
      coreItems: [
        text("구독 관리", "Subscription list"),
        text("결제일 확인", "Payment dates"),
        text("비용 관리", "Cost overview"),
        text("결제 알림", "Payment reminders"),
      ],
      platforms: ["iOS", "Android"],
      showLang: true,
      showAvail: true,
    },
    values: [
      { title: text("반복 지출을 한곳에", "Recurring costs, together"), body: text("구독과 정기 결제를 한 목록으로 정리해 빠뜨리기 쉬운 지출을 드러냅니다.", "Bring subscriptions and recurring bills into one clear list.") },
      { title: text("결제 전에 확인", "Know before you pay"), body: text("다가오는 결제 일정을 확인하고 필요한 알림을 설정할 수 있습니다.", "See upcoming payment dates and set the reminders you need.") },
      { title: text("소비 흐름 이해", "Understand the flow"), body: text("반복 지출의 흐름을 살펴보고 계속 유지할 서비스를 판단하도록 돕습니다.", "Review recurring spending and decide which services still belong.") },
    ],
    beforeAfter: [
      { before: text("여러 서비스의 결제일을 따로 기억", "Remembering payment dates across many services"), after: text("하나의 타임라인에서 다음 결제를 확인", "Seeing the next payments on one timeline") },
      { before: text("잊고 있던 구독이 계속 결제됨", "Letting forgotten subscriptions keep renewing"), after: text("목록과 알림으로 반복 지출을 점검", "Reviewing recurring costs with a list and reminders") },
    ],
    compareRows: [
      { feature: text("결제 등록", "Payment entries"), free: text("최대 7개", "Up to 7"), prem: text("무제한", "Unlimited") },
      { feature: text("결제 알림", "Payment reminders"), free: text("기본 알림", "Basic reminders"), prem: text("고급 알림 설정", "Advanced reminder controls") },
      { feature: text("소비 분석", "Spending analysis"), free: text("기본 확인", "Basic overview"), prem: text("고급 분석·AI 리포트", "Advanced analysis and AI reports") },
    ],
    previewCaps: [
      text("구독과 정기 결제를 한눈에", "All subscriptions and recurring bills"),
      text("다가오는 결제 일정 타임라인", "Timeline of upcoming payments"),
      text("원하는 시점의 결제 알림", "Payment reminders on your schedule"),
      text("반복 지출 분석과 월간 리포트", "Recurring-spend analysis and monthly reports"),
    ],
  },
  {
    ns: "pm",
    name: "Pillmate",
    hash: "#pillmate-app",
    logo: "/pillmate-logo.png",
    deletePath: "pillmate/delete-account/",
    status: "released",
    related: ["bl", "pl", "np"],
    heroValue: text("매일의 복약을 놓치지 않도록", "Stay on top of every daily dose"),
    glance: {
      accent: "pm",
      snapshot: text("매일의 복약을 놓치지 않도록 도와줍니다.", "Stay on top of every daily dose."),
      bestFor: text("복약 일정과 기록을 놓치지 않고 관리하고 싶은 사람", "Anyone building a consistent medication routine"),
      coreItems: [
        text("복약 알림", "Dose reminders"),
        text("복용 기록", "Dose log"),
        text("복용률 확인", "Adherence view"),
        text("가족 관리", "Family care"),
      ],
      platforms: ["iOS", "Android"],
      showLang: true,
      showAvail: false,
      sideExtra: { key: "family", labelKey: "glanceFamilyLabel", value: text("일정 공유 지원", "Shared schedules") },
    },
    values: [
      { title: text("오늘 복용에 집중", "Focus on today's doses"), body: text("오늘 먹어야 할 약과 영양제를 시간대별로 확인하고 바로 체크합니다.", "See pills and supplements by time of day and check them off.") },
      { title: text("일정을 놓치지 않게", "Keep schedules visible"), body: text("설정한 시간의 알림으로 중요한 복용 일정을 다시 확인합니다.", "Use scheduled reminders to keep important doses visible.") },
      { title: text("기록으로 만드는 루틴", "Build a routine through logs"), body: text("복용 이력을 돌아보며 매일의 건강 루틴을 꾸준히 이어갑니다.", "Review dose history and keep a steady health routine.") },
    ],
    beforeAfter: [
      { before: text("약마다 다른 복용 시간을 기억", "Trying to remember a different time for every medication"), after: text("시간대별 일정과 알림으로 확인", "Following a time-based schedule with reminders") },
      { before: text("오늘 복용했는지 헷갈림", "Wondering whether today's dose was taken"), after: text("체크 기록에서 복용 상태를 바로 확인", "Checking today's status in the dose log") },
    ],
    compareRows: [
      { feature: text("약 등록", "Medication entries"), free: text("개수 제한", "Count limited"), prem: text("무제한", "Unlimited") },
      { feature: text("복약 관리", "Dose management"), free: text("기본 일정·알림", "Basic schedules and reminders"), prem: text("고급 알림·일정 관리", "Advanced reminders and scheduling") },
      { feature: text("인사이트와 보관", "Insights and records"), free: text("기본 복용 기록", "Basic dose history"), prem: text("AI 인사이트·고급 기록·백업", "AI insights, advanced records, and backup") },
    ],
    previewCaps: [
      text("오늘 먹을 약과 영양제 확인", "See today's pills and supplements"),
      text("아침부터 취침 전까지 일정 관리", "Manage schedules from morning to bedtime"),
      text("정해진 시간에 복용 알림", "Receive reminders at dose time"),
      text("날짜별 복용 이력 확인", "Review dose history by date"),
    ],
  },
  {
    ns: "sv",
    name: "SAVY",
    hash: "#savy-app",
    logo: "/savy-logo.png",
    deletePath: "savy/delete-account/",
    status: "released",
    related: ["sp", "pu", "np"],
    heroValue: text("기록을 넘어 소비 패턴까지 이해하는 가계부", "A budget app that goes beyond logs to reveal spending patterns"),
    glance: {
      accent: "sv",
      snapshot: text("기록을 넘어 소비 패턴까지 이해하세요.", "Go beyond logs to understand spending patterns."),
      bestFor: text("소비 패턴을 이해하고 지출을 관리하고 싶은 사람", "Anyone who wants to understand spending, not just record it"),
      coreItems: [
        text("수입·지출 기록", "Income & expense logs"),
        text("소비 분석", "Spending analysis"),
        text("통계", "Stats"),
        text("AI 인사이트", "AI insights"),
      ],
      platforms: ["iOS", "Android"],
      showLang: true,
      showAvail: true,
    },
    values: [
      { title: text("돈의 흐름을 한 화면에", "Your money flow in one view"), body: text("지출, 수입, 구독을 함께 기록해 일상의 재정 흐름을 정리합니다.", "Bring expenses, income, and subscriptions into one financial view.") },
      { title: text("기록에서 패턴으로", "From entries to patterns"), body: text("쌓인 기록을 통해 반복되는 소비와 변화의 흐름을 확인합니다.", "Use accumulated records to spot recurring spending and change.") },
      { title: text("더 나은 소비 판단", "Make more informed choices"), body: text("소비 인사이트를 바탕으로 줄일 지출과 유지할 우선순위를 살펴봅니다.", "Use spending insights to review costs and priorities.") },
    ],
    beforeAfter: [
      { before: text("지출을 적어도 전체 흐름은 보이지 않음", "Logging expenses without seeing the bigger picture"), after: text("수입·지출·구독을 함께 확인", "Viewing income, expenses, and subscriptions together") },
      { before: text("어디서 반복 소비하는지 막연함", "Guessing where spending repeats"), after: text("분석으로 소비 패턴과 개선 지점 확인", "Using analysis to find patterns and opportunities") },
    ],
    compareRows: [
      { feature: text("재정 기록", "Financial records"), free: text("기본 지출·수입·구독 기록", "Basic expense, income, and subscription logs"), prem: text("기본 기록 포함", "Basic records included") },
      { feature: text("소비 인사이트", "Spending insights"), free: text("기본 요약", "Basic summaries"), prem: text("고급 분석·AI 전략", "Advanced analysis and AI strategies") },
      { feature: text("리포트와 보관", "Reports and backup"), free: text("기본 기록 확인", "Basic record review"), prem: text("고급 리포트·백업", "Advanced reports and backup") },
    ],
    previewCaps: [
      text("지출과 수입을 빠르게 기록", "Log expenses and income quickly"),
      text("구독과 반복 지출 함께 관리", "Manage subscriptions and recurring costs"),
      text("카테고리별 소비 흐름 분석", "Analyze spending by category"),
      text("소비 인사이트와 월간 리포트", "Review insights and monthly reports"),
    ],
  },
  {
    ns: "bl",
    name: "BabyLog",
    hash: "#babylog-app",
    logo: "/babylog-logo.png",
    deletePath: "babylog/delete-account/",
    status: "released",
    related: ["pl", "pm", "np"],
    heroValue: text("아이의 성장 순간을 가족과 함께 기록", "Capture every stage of your child's growth with family"),
    glance: {
      accent: "bl",
      snapshot: text("아이의 성장 순간을 가족과 함께 기록하세요.", "Capture every stage of growth with family."),
      bestFor: text("아이의 성장과 가족의 기록을 함께 남기고 싶은 사람", "Families documenting a child's daily life and growth"),
      coreItems: [
        text("육아 기록", "Care logs"),
        text("성장 기록", "Growth records"),
        text("가족 공유", "Family sharing"),
        text("AI 인사이트", "AI insights"),
      ],
      platforms: ["iOS", "Android"],
      showLang: true,
      showAvail: false,
      sideExtra: { key: "family", labelKey: "glanceFamilyLabel", value: text("가족 공유 기록", "Shared family records") },
    },
    values: [
      { title: text("성장의 모든 순간", "Every stage of growth"), body: text("수유, 수면, 건강, 학습과 추억을 아이의 성장 기록으로 모읍니다.", "Bring feeding, sleep, health, learning, and memories into one story.") },
      { title: text("가족이 함께 기록", "Record together as a family"), body: text("가족과 아이의 일상 기록을 함께 확인하고 이어갈 수 있습니다.", "Let family members view and continue the child's shared record.") },
      { title: text("변화를 이해하는 기록", "Records that reveal change"), body: text("시간이 지나며 쌓인 성장 흐름과 생활 패턴을 돌아봅니다.", "Look back on growth and daily patterns as the record develops.") },
    ],
    beforeAfter: [
      { before: text("육아 기록과 사진이 여러 곳에 흩어짐", "Care notes and photos scattered across places"), after: text("아이별 성장 기록을 한곳에 정리", "Keeping each child's growth story together") },
      { before: text("가족마다 알고 있는 일정과 기록이 다름", "Family members holding different pieces of information"), after: text("공유된 기록으로 함께 확인", "Staying aligned through a shared record") },
    ],
    compareRows: [
      { feature: text("육아 기록", "Parenting records"), free: text("기본 성장·일상 기록", "Basic growth and daily logs"), prem: text("기본 기록 포함", "Basic records included") },
      { feature: text("성장 인사이트", "Growth insights"), free: text("기본 기록 확인", "Basic record review"), prem: text("고급 통계·AI 인사이트", "Advanced stats and AI insights") },
      { feature: text("공유와 보관", "Sharing and backup"), free: text("기본 기능", "Basic features"), prem: text("고급 공유·백업", "Advanced sharing and backup") },
    ],
    previewCaps: [
      text("수유·수면·건강 등 일상 기록", "Log feeding, sleep, health, and daily care"),
      text("아이의 성장 변화 확인", "Follow your child's growth"),
      text("사진과 메모로 추억 보관", "Keep memories with photos and notes"),
      text("가족과 기록을 함께 관리", "Manage records together as a family"),
    ],
  },
  {
    ns: "pl",
    name: "PetLog",
    hash: "#petlog-app",
    logo: "/petlog-logo.png",
    deletePath: "petlog/delete-account/",
    status: "released",
    related: ["bl", "pm", "np"],
    heroValue: text("반려동물의 하루와 건강을 한곳에서", "Your pet's daily life and health, all in one place"),
    glance: {
      accent: "pl",
      snapshot: text("반려동물의 하루와 건강을 한곳에서 기록하세요.", "Your pet's daily life and health, all in one place."),
      bestFor: text("반려동물의 일상과 건강을 체계적으로 기록하고 싶은 사람", "Families tracking a pet's daily life and health"),
      coreItems: [
        text("반려 기록", "Pet logs"),
        text("건강 관리", "Health tracking"),
        text("가족 공유", "Family sharing"),
        text("커뮤니티", "Community"),
      ],
      platforms: ["iOS", "Android"],
      showLang: true,
      showAvail: false,
      sideExtra: { key: "family", labelKey: "glanceFamilyLabel", value: text("가족 돌봄 공유", "Shared care records") },
    },
    values: [
      { title: text("하루부터 건강까지", "From daily life to health"), body: text("식사, 산책, 활동, 건강과 추억을 반려동물별로 기록합니다.", "Track meals, walks, activity, health, and memories for each pet.") },
      { title: text("변화를 놓치지 않게", "Notice what changes"), body: text("꾸준한 기록으로 생활과 건강 패턴의 변화를 돌아봅니다.", "Use consistent logs to review changes in behavior and health.") },
      { title: text("가족과 함께 돌봄", "Care together"), body: text("가족이 같은 기록과 일정을 확인하며 반려 생활을 함께 관리합니다.", "Help family members stay aligned on records and schedules.") },
    ],
    beforeAfter: [
      { before: text("산책·식사·건강 기록이 제각각", "Walk, meal, and health notes kept separately"), after: text("반려동물별 기록을 한곳에 정리", "Organizing each pet's records in one place") },
      { before: text("작은 생활 변화를 뒤늦게 알아챔", "Noticing small changes too late"), after: text("쌓인 기록에서 패턴과 변화 확인", "Reviewing patterns and changes over time") },
    ],
    compareRows: [
      { feature: text("반려 기록", "Pet records"), free: text("기본 생활·건강 기록", "Basic daily and health logs"), prem: text("기본 기록 포함", "Basic records included") },
      { feature: text("건강 인사이트", "Health insights"), free: text("기본 기록 확인", "Basic record review"), prem: text("고급 통계·AI 인사이트", "Advanced stats and AI insights") },
      { feature: text("공유와 보관", "Sharing and backup"), free: text("기본 기능", "Basic features"), prem: text("고급 공유·백업", "Advanced sharing and backup") },
    ],
    previewCaps: [
      text("식사·산책·활동을 매일 기록", "Log meals, walks, and activity"),
      text("건강과 병원 일정을 한곳에", "Keep health and clinic schedules together"),
      text("사진으로 반려 생활의 추억 보관", "Save everyday memories with photos"),
      text("가족과 돌봄 기록 공유", "Share care records with family"),
    ],
  },
  {
    ns: "pu",
    name: "PiggyUp",
    hash: "#piggyup-app",
    logo: "/piggyup-logo.png",
    deletePath: "piggyup/delete-account/",
    status: "released",
    related: ["sv", "sp", "np"],
    heroValue: text("작은 절약을 눈에 보이는 성취로", "Turn small savings into visible progress"),
    glance: {
      accent: "pu",
      snapshot: text("작은 절약을 눈에 보이는 성취로 만드세요.", "Turn small savings into visible progress."),
      bestFor: text("절약을 습관으로 만들고 싶은 사람", "Anyone turning small savings into a lasting habit"),
      coreItems: [
        text("절약 기록", "Savings logs"),
        text("소비 분석", "Spending analysis"),
        text("챌린지", "Challenges"),
        text("AI 코치", "AI coach"),
      ],
      platforms: ["iOS", "Android"],
      showLang: true,
      showAvail: true,
    },
    values: [
      { title: text("작은 절약도 기록", "Make small savings count"), body: text("하루의 작은 절약을 남겨 얼마나 모였는지 눈에 보이게 합니다.", "Log everyday savings and see how much they add up.") },
      { title: text("목표까지 이어지는 동기", "Motivation tied to a goal"), body: text("절약 목표와 챌린지로 기록을 꾸준한 행동으로 연결합니다.", "Use goals and challenges to turn logging into consistent action.") },
      { title: text("소비 습관 돌아보기", "Reflect on spending habits"), body: text("절약 기록과 소비 흐름을 살펴 더 나은 선택의 계기를 만듭니다.", "Review savings and spending patterns to support better choices.") },
    ],
    beforeAfter: [
      { before: text("아낀 돈이 얼마나 되는지 체감하기 어려움", "Losing sight of how small savings add up"), after: text("절약 기록에서 누적 성취 확인", "Seeing cumulative progress in your savings log") },
      { before: text("절약 목표가 금방 흐려짐", "Letting a savings goal fade"), after: text("목표와 챌린지로 실천을 이어감", "Staying engaged through goals and challenges") },
    ],
    compareRows: [
      { feature: text("절약 기록", "Savings logs"), free: text("기본 기록·목표", "Basic logs and goals"), prem: text("기본 기능 포함", "Basic features included") },
      { feature: text("챌린지", "Challenges"), free: text("기본 챌린지", "Basic challenges"), prem: text("무제한·고급 챌린지", "Unlimited and advanced challenges") },
      { feature: text("분석과 보관", "Insights and backup"), free: text("기본 요약", "Basic summaries"), prem: text("AI 분석·리포트·백업", "AI insights, reports, and backup") },
    ],
    previewCaps: [
      text("오늘의 절약을 간편하게 기록", "Log today's savings quickly"),
      text("목표까지 쌓인 금액 확인", "See progress toward your goal"),
      text("개인·그룹 절약 챌린지", "Take on personal and group challenges"),
      text("소비와 절약 패턴 분석", "Review spending and savings patterns"),
    ],
  },
  {
    ns: "gu",
    name: "GoalUp",
    hash: "#goalup-app",
    logo: "/goalup-logo.png",
    deletePath: "goalup/delete-account/",
    status: "released",
    related: ["ox", "cu", "np"],
    heroValue: text("목표를 계획에서 행동으로", "Move goals from plans into action"),
    glance: {
      accent: "gu",
      snapshot: text("목표를 계획에서 행동으로 이어가세요.", "Move goals from plans into action."),
      bestFor: text("목표를 세우고 꾸준히 실행하고 싶은 사람", "Anyone ready to turn goals into consistent action"),
      coreItems: [
        text("목표 관리", "Goal management"),
        text("챌린지", "Challenges"),
        text("진행률", "Progress"),
        text("성장 기록", "Growth records"),
      ],
      platforms: ["iOS", "Android"],
      showLang: true,
      showAvail: true,
    },
    values: [
      { title: text("목표를 구체적인 행동으로", "Turn goals into action"), body: text("하고 싶은 일을 목표와 실행 단계로 정리해 오늘의 행동을 분명하게 합니다.", "Break an ambition into goals and actions you can take today.") },
      { title: text("꾸준함을 보이는 기록", "Make consistency visible"), body: text("실행 기록과 성장 흐름으로 작은 성공이 쌓이는 과정을 확인합니다.", "See small wins accumulate through action and progress records.") },
      { title: text("함께 도전하는 힘", "The momentum of a challenge"), body: text("개인 또는 그룹 챌린지로 목표를 계속 이어갈 동기를 만듭니다.", "Use personal or group challenges to keep a goal moving.") },
    ],
    beforeAfter: [
      { before: text("목표를 세우고도 다음 행동이 막막함", "Setting a goal without knowing the next action"), after: text("실행 단계를 정하고 오늘 할 일을 시작", "Defining steps and starting today's action") },
      { before: text("진행 상황을 체감하지 못해 포기", "Giving up because progress feels invisible"), after: text("기록과 통계에서 성장 흐름 확인", "Seeing growth through records and stats") },
    ],
    compareRows: [
      { feature: text("목표 수", "Goals"), free: text("개수 제한", "Count limited"), prem: text("무제한", "Unlimited") },
      { feature: text("챌린지", "Challenges"), free: text("기본 이용", "Basic access"), prem: text("무제한 개인·그룹 챌린지", "Unlimited personal and group challenges") },
      { feature: text("성장 분석", "Growth analysis"), free: text("기본 진행 기록", "Basic progress records"), prem: text("고급 통계·AI 코치", "Advanced stats and AI coaching") },
    ],
    previewCaps: [
      text("목표와 실행 단계를 설정", "Set goals and action steps"),
      text("오늘의 행동을 기록", "Log today's actions"),
      text("챌린지로 꾸준함 유지", "Stay consistent with challenges"),
      text("성장 통계와 인사이트 확인", "Review growth stats and insights"),
    ],
  },
  {
    ns: "cu",
    name: "CountUp",
    hash: "#countup-app",
    logo: "/countup-logo.png",
    deletePath: "countup/delete-account/",
    status: "released",
    related: ["ox", "gu", "np"],
    heroValue: text("매일의 숫자가 성장 기록이 되는 곳", "Where everyday numbers become a record of growth"),
    glance: {
      accent: "cu",
      snapshot: text("매일의 숫자가 성장 기록이 됩니다.", "Everyday numbers become a record of growth."),
      bestFor: text("숫자로 목표와 성장을 기록하고 싶은 사람", "Anyone who tracks growth in numbers"),
      coreItems: [
        text("카운트 기록", "Counters"),
        text("목표 추적", "Goal progress"),
        text("연속 기록", "Streaks"),
        text("통계", "Stats"),
      ],
      platforms: ["iOS", "Android"],
      showLang: true,
      showAvail: true,
    },
    values: [
      { title: text("무엇이든 숫자로", "Count what matters"), body: text("운동, 독서, 공부와 반복 행동을 나만의 카운터로 기록합니다.", "Create counters for workouts, reading, study, and repeated actions.") },
      { title: text("작은 증가를 성장으로", "Turn increments into growth"), body: text("매일 쌓이는 숫자로 목표까지의 진행과 꾸준함을 확인합니다.", "Use daily numbers to see consistency and progress toward a goal.") },
      { title: text("패턴을 발견하는 통계", "Stats that reveal patterns"), body: text("기간과 행동별 기록을 돌아보며 나에게 맞는 루틴을 찾습니다.", "Review activity over time to discover routines that work for you.") },
    ],
    beforeAfter: [
      { before: text("운동·독서 횟수를 대략 기억", "Roughly remembering workouts or reading sessions"), after: text("카운터로 행동을 즉시 기록", "Logging each action with a counter") },
      { before: text("목표까지 얼마나 남았는지 막연함", "Guessing how far remains to a goal"), after: text("숫자와 통계로 진행 상황 확인", "Seeing progress in numbers and stats") },
    ],
    compareRows: [
      { feature: text("카운터 수", "Counters"), free: text("최대 5개", "Up to 5"), prem: text("무제한", "Unlimited") },
      { feature: text("통계", "Statistics"), free: text("기본 통계", "Basic stats"), prem: text("고급 기간·요일·시간대 분석", "Advanced period, weekday, and time analysis") },
      { feature: text("성장 인사이트", "Growth insights"), free: text("기본 진행 확인", "Basic progress view"), prem: text("AI 코치·성장 리포트", "AI coaching and growth reports") },
    ],
    previewCaps: [
      text("원하는 행동의 카운터 생성", "Create counters for any activity"),
      text("한 번의 탭으로 숫자 기록", "Log a count with one tap"),
      text("목표까지의 진행 상황 확인", "See progress toward your target"),
      text("기간별 통계와 성장 패턴", "Review trends and growth patterns"),
    ],
  },
  {
    ns: "np",
    name: "Newon",
    hash: "#newon-plus-app",
    logo: "/newon-plus-logo.png",
    deletePath: "newon/delete-account/",
    status: "released",
    related: ["ox", "sv", "mw"],
    heroValue: text("하나의 계정으로 Newon 서비스를 이어주는 허브", "The hub that connects Newon services through one account"),
    glance: {
      accent: "np",
      snapshot: text("하나의 계정으로 Newon 서비스를 이어 주세요.", "Connect Newon services through one account."),
      bestFor: text("Newon의 여러 서비스를 하나의 계정으로 이용하고 싶은 사람", "Anyone managing multiple Newon apps in one account"),
      coreItems: [
        text("통합 계정", "Unified account"),
        text("앱 허브", "App hub"),
        text("서비스 연결", "Service links"),
        text("Newon Membership", "Newon Membership"),
      ],
      platforms: ["iOS", "Android"],
      showLang: true,
      showAvail: false,
      sideExtra: { key: "membership", labelKey: "glanceMembershipLabel", value: text("패키지·혜택", "Packages & benefits") },
    },
    values: [
      { title: text("하나의 Newon 계정", "One Newon account"), body: text("여러 Newon 서비스를 하나의 계정으로 이어 이용 흐름을 단순하게 만듭니다.", "Connect Newon services with one account for a simpler experience.") },
      { title: text("앱과 혜택을 한곳에", "Apps and benefits together"), body: text("이용 중인 앱, 멤버십 상태와 제공되는 혜택을 한 화면에서 확인합니다.", "See your apps, membership status, and available benefits in one place.") },
      { title: text("필요에 맞는 패키지", "Packages that fit"), body: text("생산성, 웰빙, 패밀리 등 필요한 앱 구성을 멤버십으로 선택합니다.", "Choose membership packages across productivity, wellness, family, and more.") },
    ],
    beforeAfter: [
      { before: text("앱마다 계정과 이용 현황을 따로 확인", "Checking accounts and status app by app"), after: text("Newon 허브에서 연결된 서비스를 확인", "Viewing connected services in the Newon hub") },
      { before: text("각 앱의 Premium 혜택을 따로 탐색", "Reviewing Premium benefits separately"), after: text("멤버십 패키지와 혜택을 한곳에서 관리", "Managing membership packages and benefits together") },
    ],
    compareRows: [
      { feature: text("앱 이용", "App access"), free: text("각 앱의 기본 기능", "Basic features in each app"), prem: text("선택한 패키지의 Premium 기능", "Premium features in the selected package") },
      { feature: text("계정과 관리", "Account and management"), free: text("기본 계정 이용", "Basic account access"), prem: text("통합 계정·멤버십 현황", "Unified account and membership status") },
      { feature: text("멤버십 혜택", "Membership benefits"), free: text("포함되지 않음", "Not included"), prem: text("패키지·가족 공유·앱 혜택", "Packages, family sharing, and app benefits") },
    ],
    previewCaps: [
      text("Newon 앱과 서비스를 한눈에", "See Newon apps and services together"),
      text("하나의 계정으로 연결", "Connect with one account"),
      text("멤버십 패키지 선택", "Choose a membership package"),
      text("구독 상태와 혜택 확인", "Review membership status and benefits"),
    ],
  },
  {
    ns: "mw",
    name: "My World",
    hash: "#myworld-app",
    logo: "/myworld-logo.png",
    deletePath: "myworld/delete-account/",
    status: "released",
    related: ["np", "bl", "ox"],
    heroValue: text("여행한 세계가 나만의 지도가 됩니다", "Turn the world you have traveled into your own map"),
    glance: {
      accent: "mw",
      snapshot: text("여행한 세계가 나만의 지도가 됩니다.", "Turn the world you have traveled into your own map."),
      bestFor: text("여행의 모든 순간을 하나의 세계지도에 남기고 싶은 사람", "Travelers who want one map for places and memories"),
      coreItems: [
        text("여행 지도", "Travel map"),
        text("방문 국가·도시", "Countries & cities"),
        text("여행 기록", "Trip records"),
        text("AI 여행 리포트", "AI travel report"),
      ],
      platforms: ["iOS", "Android"],
      showLang: true,
      showAvail: false,
      sideExtra: { key: "travel", labelKey: "glanceTravelLabel", value: text("세계 지도 기록", "World map records") },
    },
    values: [
      { title: text("여행할수록 채워지는 지도", "A map that grows with you"), body: text("방문한 나라와 도시를 기록해 나만의 세계 지도를 완성합니다.", "Record countries and cities to build your personal world map.") },
      { title: text("한 여행의 모든 기록", "Everything from one trip"), body: text("일정, 사진과 메모를 여행별로 모아 추억을 다시 보기 쉽게 만듭니다.", "Keep itineraries, photos, and notes together for every trip.") },
      { title: text("여정을 돌아보는 통계", "Stats for looking back"), body: text("쌓인 여행 기록을 통해 방문 지역과 여행 흐름을 다양한 관점에서 확인합니다.", "Explore visited places and travel patterns from your accumulated records.") },
    ],
    beforeAfter: [
      { before: text("방문한 나라와 도시를 기억에 의존", "Relying on memory for countries and cities visited"), after: text("세계 지도에서 여행한 곳을 바로 확인", "Seeing visited places directly on your world map") },
      { before: text("일정·사진·메모가 여러 곳에 흩어짐", "Keeping itineraries, photos, and notes in different places"), after: text("여행별 기록을 하나의 스토리로 정리", "Organizing each trip into one story") },
    ],
    compareRows: [
      { feature: text("여행 기록", "Trips"), free: text("여행 제한", "Trip limited"), prem: text("무제한", "Unlimited") },
      { feature: text("여행 통계", "Travel stats"), free: text("기본 기록 확인", "Basic record view"), prem: text("고급 여행 통계", "Advanced travel stats") },
      { feature: text("리포트와 보관", "Reports and backup"), free: text("기본 지도·기록", "Basic map and records"), prem: text("AI 여행 리포트·백업", "AI travel reports and backup") },
    ],
    previewCaps: [
      text("방문한 나라와 도시를 지도에 기록", "Mark visited countries and cities"),
      text("여행 일정과 메모 관리", "Manage itineraries and notes"),
      text("사진으로 여행의 순간 보관", "Keep travel moments with photos"),
      text("방문 지역과 여행 통계 확인", "Explore visited places and travel stats"),
    ],
  },
];

function appFor(ns) {
  const app = APP_LANDING.find((entry) => entry.ns === ns);
  if (!app) throw new Error(`Unknown app namespace: ${ns}`);
  return app;
}

function token(ns, key) {
  return `{{t:${ns}.${key}}}`;
}

function sectionHead(ns, suffix, labelKey, titleKey, emoji = "") {
  const icon = emoji
    ? `<span class="ox-section-title-inline__icon" aria-hidden="true">${emoji}</span>\n          `
    : "";
  return `<header class="ox-section-head">
          <p class="ox-section-label">${token(ns, labelKey)}</p>
          <h2 id="${ns}-${suffix}-title" class="ox-section-title-inline">${icon}${token(ns, titleKey)}</h2>
        </header>`;
}

/**
 * Return the flat locale keys merged into an app namespace.
 * Languages other than Korean currently receive the English source strings.
 */
export function localeKeysForApp(lang, app) {
  const source = lang === "ko" ? "ko" : "en";
  const ui = UI[source];
  const pick = (value) => value[source];
  const keys = {
    heroValueLine: pick(app.heroValue),
    glanceTitle: ui.glanceTitle,
    glanceLabel: ui.glanceLabel,
    glanceSnapshotEyebrow: ui.glanceSnapshotEyebrow,
    glanceBestForLabel: ui.glanceBestForLabel,
    glanceBestFor: pick(app.glance.bestFor),
    glanceSnapshot: pick(app.glance.snapshot || app.heroValue),
    glanceCoreLabel: ui.glanceCoreLabel,
    glancePlatformLabel: ui.glancePlatformLabel,
    glancePlatform: (app.glance.platforms || ["iOS", "Android"]).join(" · "),
    glanceLangLabel: ui.glanceLangLabel,
    glanceLang: ui.glanceLang,
    glanceLangUnit: ui.glanceLangUnit,
    glanceAvailLabel: ui.glanceAvailLabel,
    glanceAvail: ui.glanceAvail,
    glanceAvailNum: ui.glanceAvailNum,
    glanceAvailUnit: ui.glanceAvailUnit,
    glanceFamilyLabel: ui.glanceFamilyLabel,
    glanceTravelLabel: ui.glanceTravelLabel,
    glanceMembershipLabel: ui.glanceMembershipLabel,
    valuesLabel: ui.valuesLabel,
    valuesTitle: ui.valuesTitle,
    baLabel: ui.baLabel,
    baTitle: ui.baTitle,
    baBefore: ui.before,
    baAfter: ui.after,
    compareLabel: ui.compareLabel,
    compareTitle: ui.compareTitle,
    compareFeature: ui.compareFeature,
    compareFree: ui.compareFree,
    comparePrem: ui.comparePrem,
    previewTitle: ui.previewTitle,
    previewLede: ui.previewLede,
    faqLabel: ui.faqLabel,
    faqTitle: ui.faqTitle,
    privacyLabel: ui.privacyLabel,
    privacyTitle: ui.privacyTitle,
    privacyPrivacy: ui.privacyPrivacy,
    privacyTerms: ui.privacyTerms,
    privacyDelete: ui.privacyDelete,
    privacySubscribe: ui.privacySubscribe,
    relatedLabel: ui.relatedLabel,
    relatedTitle: ui.relatedTitle,
    finalCtaAppStore: ui.finalCtaAppStore,
    finalCtaGooglePlay: ui.finalCtaGooglePlay,
    statusReleased: ui.statusReleased,
  };

  (app.glance.coreItems || []).forEach((item, index) => {
    keys[`glanceCore${index + 1}`] = pick(item);
  });
  if (app.glance.sideExtra) {
    const extra = app.glance.sideExtra;
    keys.glanceSideExtraLabel = ui[extra.labelKey] || pick(extra.label) || extra.key;
    keys.glanceSideExtraValue = pick(extra.value);
  }

  app.values.forEach((value, index) => {
    const n = index + 1;
    keys[`value${n}Title`] = pick(value.title);
    keys[`value${n}Body`] = pick(value.body);
  });
  app.beforeAfter.forEach((row, index) => {
    const n = index + 1;
    keys[`ba${n}Before`] = pick(row.before);
    keys[`ba${n}After`] = pick(row.after);
  });
  (app.compareRows || []).forEach((row, index) => {
    const n = index + 1;
    keys[`compareRow${n}Feature`] = pick(row.feature);
    keys[`compareRow${n}Free`] = pick(row.free);
    keys[`compareRow${n}Prem`] = pick(row.prem);
  });
  app.previewCaps.forEach((caption, index) => {
    keys[`previewCap${index + 1}`] = pick(caption);
  });
  [...sharedFaq, ...(app.faqExtra || [])].forEach((faq, index) => {
    keys[`faq${index + 1}Q`] = pick(faq.q);
    keys[`faq${index + 1}A`] = pick(faq.a);
  });
  return keys;
}

export function glanceHtml(ns) {
  const app = appFor(ns);
  const g = app.glance || {};
  const platforms = g.platforms || ["iOS", "Android"];
  const coreItems = g.coreItems || [];
  const accent = g.accent || ns;
  const platformRows = platforms
    .map((p) => `<span class="al-snap__plat">${escapeGlance(p)}</span>`)
    .join('<span class="al-snap__plat-sep" aria-hidden="true">·</span>');
  const coreLis = coreItems
    .map((_, i) => `<li>${token(ns, `glanceCore${i + 1}`)}</li>`)
    .join("\n              ");

  const sideBits = [];
  sideBits.push(`<div class="al-snap__meta-item">
            <dt>${token(ns, "glancePlatformLabel")}</dt>
            <dd class="al-snap__platforms">${platformRows}</dd>
          </div>`);
  if (g.showLang !== false) {
    sideBits.push(`<div class="al-snap__meta-item al-snap__meta-item--metric">
            <dt>${token(ns, "glanceLangLabel")}</dt>
            <dd>
              <span class="al-snap__figure">${token(ns, "glanceLang")}</span>
              <span class="al-snap__figure-unit">${token(ns, "glanceLangUnit")}</span>
            </dd>
          </div>`);
  }
  if (g.showAvail !== false) {
    sideBits.push(`<div class="al-snap__meta-item al-snap__meta-item--metric">
            <dt>${token(ns, "glanceAvailLabel")}</dt>
            <dd>
              <span class="al-snap__figure">${token(ns, "glanceAvailNum")}</span>
              <span class="al-snap__figure-unit">${token(ns, "glanceAvailUnit")}</span>
            </dd>
          </div>`);
  }
  if (g.sideExtra) {
    sideBits.push(`<div class="al-snap__meta-item">
            <dt>${token(ns, "glanceSideExtraLabel")}</dt>
            <dd>${token(ns, "glanceSideExtraValue")}</dd>
          </div>`);
  }

  return `<section id="${ns}-glance" class="ox-section al-glance ox-reveal-on-scroll" data-variant="app" data-accent="${escapeGlance(accent)}" aria-labelledby="${ns}-glance-title">
      <div class="ox-container">
        ${sectionHead(ns, "glance", "glanceLabel", "glanceTitle", "👀")}
        <div class="al-snap">
          <div class="al-snap__main">
            <div class="al-snap__brand">
              <span class="al-snap__icon-wrap" aria-hidden="true">
                <img class="al-snap__icon" src="${escapeGlance(app.logo)}" alt="" width="48" height="48" loading="lazy" decoding="async" />
              </span>
              <div class="al-snap__brand-text">
                <p class="al-snap__eyebrow">${token(ns, "glanceSnapshotEyebrow")}</p>
                <p class="al-snap__app-name">${escapeGlance(app.name)}</p>
              </div>
            </div>
            <p class="al-snap__line">${token(ns, "glanceSnapshot")}</p>
            <div class="al-snap__best">
              <p class="al-snap__kicker">${token(ns, "glanceBestForLabel")}</p>
              <p class="al-snap__best-text">${token(ns, "glanceBestFor")}</p>
            </div>
          </div>
          <dl class="al-snap__side">
            ${sideBits.join("\n            ")}
          </dl>
          <div class="al-snap__core">
            <p class="al-snap__kicker">${token(ns, "glanceCoreLabel")}</p>
            <ul class="al-snap__core-list">
              ${coreLis}
            </ul>
          </div>
        </div>
      </div>
    </section>`;
}

function escapeGlance(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function valuesHtml(ns) {
  const app = appFor(ns);
  return `<section id="${ns}-values" class="ox-section al-values ox-reveal-on-scroll" aria-labelledby="${ns}-values-title">
      <div class="ox-container">
        ${sectionHead(ns, "values", "valuesLabel", "valuesTitle", "💎")}
        <div class="ox-features al-values__grid">
${app.values.map((_, index) => {
    const n = index + 1;
    return `          <article class="ox-feature-card al-values__card"><h3>${token(ns, `value${n}Title`)}</h3><p class="ox-feature-lead">${token(ns, `value${n}Body`)}</p></article>`;
  }).join("\n")}
        </div>
      </div>
    </section>`;
}

export function beforeAfterHtml(ns) {
  const app = appFor(ns);
  return `<section id="${ns}-ba" class="ox-section al-ba ox-reveal-on-scroll" aria-labelledby="${ns}-ba-title">
      <div class="ox-container">
        ${sectionHead(ns, "ba", "baLabel", "baTitle", "🔄")}
        <div class="al-ba__grid">
${app.beforeAfter.map((_, index) => {
    const n = index + 1;
    return `          <article class="al-ba__row"><div class="al-ba__before"><span>${token(ns, "baBefore")}</span><p>${token(ns, `ba${n}Before`)}</p></div><div class="al-ba__after"><span>${token(ns, "baAfter")}</span><p>${token(ns, `ba${n}After`)}</p></div></article>`;
  }).join("\n")}
        </div>
      </div>
    </section>`;
}

export function compareHtml(ns) {
  const app = appFor(ns);
  if (!app.compareRows?.length) return "";
  return `<section id="${ns}-compare" class="ox-section al-compare ox-reveal-on-scroll" aria-labelledby="${ns}-compare-title">
      <div class="ox-container">
        ${sectionHead(ns, "compare", "compareLabel", "compareTitle")}
        <div class="al-compare__scroll">
          <table class="al-compare__table">
            <thead><tr><th scope="col">${token(ns, "compareFeature")}</th><th scope="col">${token(ns, "compareFree")}</th><th scope="col">${token(ns, "comparePrem")}</th></tr></thead>
            <tbody>
${app.compareRows.map((_, index) => {
    const n = index + 1;
    return `              <tr><th scope="row">${token(ns, `compareRow${n}Feature`)}</th><td>${token(ns, `compareRow${n}Free`)}</td><td>${token(ns, `compareRow${n}Prem`)}</td></tr>`;
  }).join("\n")}
            </tbody>
          </table>
        </div>
      </div>
    </section>`;
}

export function faqHtml(ns) {
  const app = appFor(ns);
  const count = sharedFaq.length + (app.faqExtra?.length || 0);
  return `<section id="${ns}-faq" class="ox-section al-faq ox-reveal-on-scroll" aria-labelledby="${ns}-faq-title">
      <div class="ox-container">
        ${sectionHead(ns, "faq", "faqLabel", "faqTitle", "❓")}
        <div class="al-faq__list">
${Array.from({ length: count }, (_, index) => {
    const n = index + 1;
    return `          <details class="al-faq__item"><summary><span class="al-faq__q">${token(ns, `faq${n}Q`)}</span><span class="al-faq__chev" aria-hidden="true"></span></summary><div class="al-faq__answer"><p>${token(ns, `faq${n}A`)}</p></div></details>`;
  }).join("\n")}
        </div>
      </div>
    </section>`;
}

export function privacyHtml(ns) {
  const app = appFor(ns);
  return `<section id="${ns}-privacy" class="ox-section al-privacy ox-reveal-on-scroll" aria-labelledby="${ns}-privacy-title">
      <div class="ox-container">
        ${sectionHead(ns, "privacy", "privacyLabel", "privacyTitle", "🔒")}
        <nav class="al-privacy__links" aria-label="${token(ns, "privacyTitle")}">
          <a href="privacy/">${token(ns, "privacyPrivacy")}</a>
          <a href="terms/">${token(ns, "privacyTerms")}</a>
          <a href="${app.deletePath}">${token(ns, "privacyDelete")}</a>
          <a href="#${ns}-premium">${token(ns, "privacySubscribe")}</a>
        </nav>
      </div>
    </section>`;
}

export function relatedHtml(ns, appsByNs) {
  const app = appFor(ns);
  const resolve = (relatedNs) => {
    if (appsByNs instanceof Map) return appsByNs.get(relatedNs);
    if (Array.isArray(appsByNs)) return appsByNs.find((entry) => entry.ns === relatedNs);
    return appsByNs?.[relatedNs];
  };
  const related = app.related.map((relatedNs) => resolve(relatedNs) || appFor(relatedNs));
  return `<section id="${ns}-related" class="ox-section al-related ox-reveal-on-scroll" aria-labelledby="${ns}-related-title">
      <div class="ox-container">
        ${sectionHead(ns, "related", "relatedLabel", "relatedTitle", "📲")}
        <div class="al-related__grid">
${related.map((entry) => `          <a class="al-related__card" href="${entry.hash}"><img src="${entry.logo}" alt="" width="64" height="64" loading="lazy" decoding="async" /><span class="al-related__copy"><strong>${entry.name}</strong><span>${token(entry.ns, "heroValueLine")}</span></span><span class="al-related__go" aria-hidden="true">→</span></a>`).join("\n")}
        </div>
      </div>
    </section>`;
}

export function finalCtaHtml(ns) {
  const app = appFor(ns);
  return `<section id="${ns}-final-cta" class="ox-section al-final-cta ox-reveal-on-scroll" aria-labelledby="${ns}-final-cta-title">
      <div class="ox-container al-final-cta__inner">
        <img class="al-final-cta__logo" src="${app.logo}" alt="" width="96" height="96" loading="lazy" decoding="async" />
        <p class="al-final-cta__name">${app.name}</p>
        <h2 id="${ns}-final-cta-title" class="al-final-cta__headline">${token(ns, "heroValueLine")}</h2>
        <div class="al-final-cta__actions" role="group" aria-label="${token(ns, "finalCtaAppStore")}">
          <a class="al-final-cta__btn" href="{{html:${ns}.appStoreUrl}}" target="_blank" rel="noopener noreferrer">${token(ns, "finalCtaAppStore")}</a>
          <a class="al-final-cta__btn" href="{{html:${ns}.googlePlayUrl}}" target="_blank" rel="noopener noreferrer">${token(ns, "finalCtaGooglePlay")}</a>
        </div>
      </div>
    </section>`;
}

export function showcaseHeadHtml(ns) {
  appFor(ns);
  return `<header class="al-showcase-head" aria-labelledby="${ns}-preview-title">
      <h2 id="${ns}-preview-title"><span class="ox-section-title-inline__icon" aria-hidden="true">📱</span> ${token(ns, "previewTitle")}</h2>
      <p>${token(ns, "previewLede")}</p>
    </header>`;
}
