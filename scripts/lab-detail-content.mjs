/**
 * Per-experiment case study copy (KO/EN) for Labs detail pages.
 * Headlines and structure from product spec; metrics stay null unless real data exists.
 */

export const LAB_DETAIL_RELATED = {
  "review-ai": ["newon-qr", "ai-experiment"],
  "newon-qr": ["review-ai", "newon-form"],
  "newon-form": ["newon-qr", "ai-experiment"],
  "ai-experiment": ["review-ai", "newon-form"],
  "game-experiment": ["character-lab", "ai-experiment"],
  "character-lab": ["game-experiment", "newon-form"],
};

/** @type {Record<string, { categoryKo: string, categoryEn: string, ko: object, en: object }>} */
export const LAB_DETAIL_CONTENT = {
  "review-ai": {
    categoryKo: "AI · PRODUCT INTELLIGENCE",
    categoryEn: "AI · PRODUCT INTELLIGENCE",
    ko: {
      headline: "리뷰를 읽는 AI가 아니라,\n제품 결정을 돕는 AI.",
      description:
        "사용자 리뷰에서 반복되는 문제와 요구를 찾아 제품 개선에 필요한 신호로 구조화하는 실험입니다.",
      question:
        "사용자 리뷰를 단순한 별점과 문장이 아니라\n제품 의사결정에 사용할 수 있는 신호로 바꿀 수 있을까?",
      questionContext:
        "리뷰는 제품 팀에게 가장 직접적인 사용자 목소리지만, 양이 늘수록 읽고 우선순위를 정하는 비용이 커집니다.",
      snapshot: {
        question: "리뷰를 제품 의사결정 신호로 구조화할 수 있는가",
        method: "리뷰 수집 → 신호 추출 → 패턴 그룹 → 인사이트",
        signal: "반복 불만, 기능 요청, 감정 패턴",
        outcome: "Validation in progress",
      },
      why: {
        problem: "리뷰가 많아질수록 모든 의견을 직접 읽고 반복되는 문제를 찾기 어렵습니다.",
        hypothesis:
          "AI가 리뷰를 요약하는 데서 끝나지 않고 반복되는 문제, 요구, 감정과 패턴을 구조화한다면 제품 의사결정에 더 직접적으로 활용할 수 있습니다.",
        experiment: "Review → Signal → Pattern → Insight → Decision",
      },
      flow: [
        { n: "01", label: "INPUT", desc: "사용자 리뷰 입력" },
        { n: "02", label: "SIGNAL", desc: "핵심 문제와 요구 추출" },
        { n: "03", label: "PATTERN", desc: "반복되는 의견 그룹화" },
        { n: "04", label: "INSIGHT", desc: "제품 관점에서 의미 해석" },
        { n: "05", label: "DECISION", desc: "개선 우선순위 판단 지원" },
      ],
      testing: [
        { n: "01", title: "SIGNAL QUALITY", desc: "AI가 핵심 문제를 제대로 추출하는가" },
        { n: "02", title: "PATTERN DETECTION", desc: "반복되는 리뷰를 하나의 패턴으로 묶을 수 있는가" },
        { n: "03", title: "ACTIONABILITY", desc: "결과가 실제 제품 개선 결정에 도움이 되는가" },
        { n: "04", title: "INFORMATION DENSITY", desc: "많은 리뷰를 더 빠르게 이해할 수 있는가" },
      ],
      signals: [
        { type: "QUALITATIVE", desc: "리뷰 텍스트에서 반복되는 불만과 요청" },
        { type: "BEHAVIORAL", desc: "어떤 테마가 자주 등장하는지" },
        { type: "PRODUCT", desc: "개선 우선순위로 연결 가능한지" },
        { type: "DECISION", desc: "계속 만들지 / 수정할지 / 중단할지" },
      ],
      nextSteps: [
        "Improve signal grouping",
        "Test decision summaries",
        "Collect more usage feedback",
      ],
      seoDescription:
        "사용자 리뷰에서 반복 문제와 요구를 찾아 제품 개선 신호로 구조화하는 Review AI 실험 — Newon Labs.",
    },
    en: {
      headline: "Not an AI that reads reviews.\nAn AI that supports product decisions.",
      description:
        "An experiment that finds repeated issues and requests in user reviews and structures them as signals for product improvement.",
      question:
        "Can user reviews become decision signals —\nnot just star ratings and sentences?",
      questionContext:
        "Reviews are the most direct user voice for product teams, but as volume grows, reading and prioritizing them gets expensive.",
      snapshot: {
        question: "Can reviews become structured decision signals?",
        method: "Collect → extract signals → group patterns → insight",
        signal: "Repeated complaints, feature asks, sentiment patterns",
        outcome: "Validation in progress",
      },
      why: {
        problem: "As review volume grows, it's hard to read everything and spot repeated issues.",
        hypothesis:
          "If AI goes beyond summarizing and structures repeated problems, requests, sentiment, and patterns, teams can use reviews more directly in product decisions.",
        experiment: "Review → Signal → Pattern → Insight → Decision",
      },
      flow: [
        { n: "01", label: "INPUT", desc: "User review input" },
        { n: "02", label: "SIGNAL", desc: "Extract core issues and requests" },
        { n: "03", label: "PATTERN", desc: "Group repeated opinions" },
        { n: "04", label: "INSIGHT", desc: "Interpret from a product lens" },
        { n: "05", label: "DECISION", desc: "Support improvement priorities" },
      ],
      testing: [
        { n: "01", title: "SIGNAL QUALITY", desc: "Does AI extract the right core issues?" },
        { n: "02", title: "PATTERN DETECTION", desc: "Can repeated reviews cluster into one pattern?" },
        { n: "03", title: "ACTIONABILITY", desc: "Do results help real product decisions?" },
        { n: "04", title: "INFORMATION DENSITY", desc: "Can teams understand more reviews faster?" },
      ],
      signals: [
        { type: "QUALITATIVE", desc: "Repeated complaints and requests in review text" },
        { type: "BEHAVIORAL", desc: "Which themes appear most often" },
        { type: "PRODUCT", desc: "Whether output maps to improvement priorities" },
        { type: "DECISION", desc: "Continue, revise, or stop" },
      ],
      nextSteps: [
        "Improve signal grouping",
        "Test decision summaries",
        "Collect more usage feedback",
      ],
      seoDescription:
        "Review AI — structuring user reviews into product decision signals. A Newon Labs experiment.",
    },
  },
  "newon-qr": {
    categoryKo: "UTILITY · DISTRIBUTION",
    categoryEn: "UTILITY · DISTRIBUTION",
    ko: {
      headline: "링크를 만드는 QR에서,\n반응을 이해하는 QR로.",
      description:
        "QR 생성 이후 실제 스캔과 방문 흐름까지 연결해 오프라인 접점을 측정 가능한 디지털 신호로 바꾸는 실험입니다.",
      question: "QR을 단순한 링크 전달 도구가 아니라\n제품 유입을 관찰하는 접점으로 만들 수 있을까?",
      questionContext: "QR은 만들기 쉽지만, 실제로 얼마나 스캔되고 어디로 이어지는지 알기 어렵습니다.",
      snapshot: {
        question: "QR을 유입 관찰 접점으로 만들 수 있는가",
        method: "생성 → 배포 → 스캔 → 방문 → 관찰",
        signal: "스캔 수, 방문 흐름, 전환",
        outcome: "Validation in progress",
      },
      why: {
        problem: "QR을 만들어도 실제로 얼마나 사용되는지 알기 어렵습니다.",
        hypothesis: "생성 → 스캔 → 방문 흐름을 연결하면 오프라인 유입을 더 명확하게 이해할 수 있습니다.",
        experiment: "CREATE → SCAN → VISIT → SIGNAL",
      },
      flow: [
        { n: "01", label: "CREATE", desc: "URL을 QR로 변환" },
        { n: "02", label: "DISTRIBUTE", desc: "명함, 포스터, 제품 등에 배치" },
        { n: "03", label: "SCAN", desc: "사용자 스캔" },
        { n: "04", label: "VISIT", desc: "연결 페이지 방문" },
        { n: "05", label: "OBSERVE", desc: "사용 흐름 관찰" },
      ],
      testing: [
        { n: "01", title: "GENERATION SPEED", desc: "QR 생성이 충분히 빠른가" },
        { n: "02", title: "MOBILE SCAN UX", desc: "모바일 스캔 경험이 자연스러운가" },
        { n: "03", title: "OFFLINE → ONLINE", desc: "오프라인에서 온라인으로 전환되는가" },
        { n: "04", title: "SIMPLE MEASUREMENT", desc: "간단한 유입 측정이 가능한가" },
      ],
      signals: [
        { type: "BEHAVIORAL", desc: "스캔과 방문이 실제로 발생하는지" },
        { type: "PRODUCT", desc: "생성·관리 UX가 작은 팀에 맞는지" },
        { type: "QUALITATIVE", desc: "어떤 배포 맥락에서 쓰이는지" },
        { type: "DECISION", desc: "추적 백엔드 범위를 어디까지 할지" },
      ],
      nextSteps: ["Define MVP backend scope: redirect + scan counts", "Test first scenarios: events, menus, business cards"],
      seoDescription: "Newon QR — from link QR to measurable scan and visit signals. A Newon Labs experiment.",
    },
    en: {
      headline: "From a QR that makes links\nto a QR that reads response.",
      description:
        "An experiment connecting QR creation to scan and visit flow — turning offline touchpoints into measurable digital signals.",
      question: "Can a QR be an intake touchpoint —\nnot just a link delivery tool?",
      questionContext: "QRs are easy to create, but hard to know how often they're scanned and where traffic goes.",
      snapshot: {
        question: "Can QR become an observable intake touchpoint?",
        method: "Create → distribute → scan → visit → observe",
        signal: "Scans, visit flow, conversion",
        outcome: "Validation in progress",
      },
      why: {
        problem: "Even after creating a QR, it's hard to know how much it's actually used.",
        hypothesis: "Connecting create → scan → visit makes offline intake easier to understand.",
        experiment: "CREATE → SCAN → VISIT → SIGNAL",
      },
      flow: [
        { n: "01", label: "CREATE", desc: "Turn URL into QR" },
        { n: "02", label: "DISTRIBUTE", desc: "Place on cards, posters, products" },
        { n: "03", label: "SCAN", desc: "User scans" },
        { n: "04", label: "VISIT", desc: "Destination page visit" },
        { n: "05", label: "OBSERVE", desc: "Observe usage flow" },
      ],
      testing: [
        { n: "01", title: "GENERATION SPEED", desc: "Is QR creation fast enough?" },
        { n: "02", title: "MOBILE SCAN UX", desc: "Does mobile scan feel natural?" },
        { n: "03", title: "OFFLINE → ONLINE", desc: "Does offline convert to online?" },
        { n: "04", title: "SIMPLE MEASUREMENT", desc: "Can intake be measured simply?" },
      ],
      signals: [
        { type: "BEHAVIORAL", desc: "Whether scans and visits actually happen" },
        { type: "PRODUCT", desc: "Whether create/manage UX fits small teams" },
        { type: "QUALITATIVE", desc: "Which deployment contexts get used" },
        { type: "DECISION", desc: "How far tracking backend should go" },
      ],
      nextSteps: ["Define MVP backend scope: redirect + scan counts", "Test first scenarios: events, menus, business cards"],
      seoDescription: "Newon QR — measuring scan and visit flow beyond link delivery. A Newon Labs experiment.",
    },
  },
  "newon-form": {
    categoryKo: "UTILITY · DATA COLLECTION",
    categoryEn: "UTILITY · DATA COLLECTION",
    ko: {
      headline: "질문을 만드는 시간을 줄이고,\n답을 이해하는 데 집중합니다.",
      description: "가볍게 만들고 빠르게 공유하며 응답을 제품 신호로 연결하는 폼 경험을 탐구합니다.",
      question: "폼 제작과 응답 분석을\n더 단순한 하나의 흐름으로 만들 수 있을까?",
      questionContext: "간단한 검증에도 폼 설정과 응답 정리에 시간이 많이 듭니다.",
      snapshot: {
        question: "폼 제작과 응답을 하나의 흐름으로 단순화할 수 있는가",
        method: "만들기 → 공유 → 응답 → 정리 → 학습",
        signal: "완료율, 응답 품질, 질문 구성",
        outcome: "Collecting signals",
      },
      why: {
        problem: "간단한 사용자 검증에도 폼 설정과 응답 정리에 시간이 많이 필요합니다.",
        hypothesis: "폼 제작과 응답 구조화를 최소화하면 더 빠르게 사용자 의견을 수집할 수 있습니다.",
        experiment: "CREATE → SHARE → RESPOND → ORGANIZE → LEARN",
      },
      flow: [
        { n: "01", label: "CREATE", desc: "질문 구성" },
        { n: "02", label: "SHARE", desc: "링크로 공유" },
        { n: "03", label: "RESPOND", desc: "응답 수집" },
        { n: "04", label: "ORGANIZE", desc: "응답 구조화" },
        { n: "05", label: "LEARN", desc: "제품 인사이트로 연결" },
      ],
      testing: [
        { n: "01", title: "BUILD SPEED", desc: "폼 생성 속도" },
        { n: "02", title: "QUESTION SIMPLICITY", desc: "질문 구성의 단순성" },
        { n: "03", title: "MOBILE RESPONSE", desc: "모바일 응답 경험" },
        { n: "04", title: "INSIGHT CONNECTION", desc: "응답을 제품 인사이트로 연결하는 방식" },
      ],
      signals: [
        { type: "BEHAVIORAL", desc: "응답 완료와 이탈 지점" },
        { type: "QUALITATIVE", desc: "응답 내용의 명확성" },
        { type: "PRODUCT", desc: "최소 필드로 충분한지" },
        { type: "DECISION", desc: "백엔드·알림 범위" },
      ],
      nextSteps: ["Lock a prototype field set and notification channels", "Prototype submit → email notification"],
      seoDescription: "Newon Form — lighter form flow from ask to organized response. A Newon Labs research experiment.",
    },
    en: {
      headline: "Spend less time building questions.\nSpend more time understanding answers.",
      description: "Exploring a lightweight form experience — build fast, share fast, connect responses to product signals.",
      question: "Can form building and response analysis\nlive in one simpler flow?",
      questionContext: "Even simple user validation takes too long to set up forms and sort responses.",
      snapshot: {
        question: "Can form create and response live in one simpler flow?",
        method: "Create → share → respond → organize → learn",
        signal: "Completion, response quality, question design",
        outcome: "Collecting signals",
      },
      why: {
        problem: "Simple user validation still costs a lot of time in form setup and response sorting.",
        hypothesis: "Minimizing form build and response structure helps collect user input faster.",
        experiment: "CREATE → SHARE → RESPOND → ORGANIZE → LEARN",
      },
      flow: [
        { n: "01", label: "CREATE", desc: "Compose questions" },
        { n: "02", label: "SHARE", desc: "Share via link" },
        { n: "03", label: "RESPOND", desc: "Collect responses" },
        { n: "04", label: "ORGANIZE", desc: "Structure responses" },
        { n: "05", label: "LEARN", desc: "Connect to product insight" },
      ],
      testing: [
        { n: "01", title: "BUILD SPEED", desc: "How fast can a form be created?" },
        { n: "02", title: "QUESTION SIMPLICITY", desc: "Is the question set minimal enough?" },
        { n: "03", title: "MOBILE RESPONSE", desc: "Mobile response experience" },
        { n: "04", title: "INSIGHT CONNECTION", desc: "How responses map to product insight" },
      ],
      signals: [
        { type: "BEHAVIORAL", desc: "Completion and drop-off points" },
        { type: "QUALITATIVE", desc: "Clarity of response content" },
        { type: "PRODUCT", desc: "Whether minimal fields are enough" },
        { type: "DECISION", desc: "Backend and notification scope" },
      ],
      nextSteps: ["Lock a prototype field set and notification channels", "Prototype submit → email notification"],
      seoDescription: "Newon Form — a lighter path from questions to organized responses. A Newon Labs research experiment.",
    },
  },
  "ai-experiment": {
    categoryKo: "AI · RESEARCH",
    categoryEn: "AI · RESEARCH",
    ko: {
      headline: "AI가 답을 만드는 것을 넘어,\n만들 가치가 있는 문제를 찾을 수 있을까?",
      description: "시장 신호와 사용자 문제를 분석해 새로운 제품 기회를 발견하는 AI 기반 탐색 실험입니다.",
      question: "AI를 이용해 \"무엇을 만들 것인가\"라는\n제품 탐색 과정 자체를 더 체계적으로 만들 수 있을까?",
      questionContext: "아이디어는 많지만, 실제로 해결할 가치가 있는 문제인지 판단하기 어렵습니다.",
      snapshot: {
        question: "제품 탐색 과정을 AI로 체계화할 수 있는가",
        method: "문제 → 신호 → 패턴 → AI fit → 기회",
        signal: "문제 빈도, 대안, AI 적합성",
        outcome: "Collecting signals",
      },
      why: {
        problem: "제품 아이디어는 많지만 실제로 해결할 가치가 있는 문제인지 판단하기 어렵습니다.",
        hypothesis: "여러 시장 신호와 문제 패턴을 구조화하면 제품 후보를 더 체계적으로 비교할 수 있습니다.",
        experiment: "PROBLEM → SIGNAL → PATTERN → AI FIT → OPPORTUNITY → PROTOTYPE",
      },
      flow: [
        { n: "01", label: "PROBLEM", desc: "반복되는 사용자 문제" },
        { n: "02", label: "SIGNAL", desc: "수요와 행동 신호" },
        { n: "03", label: "PATTERN", desc: "문제 패턴 클러스터" },
        { n: "04", label: "AI FIT", desc: "AI가 더 나은 해결인지" },
        { n: "05", label: "OPPORTUNITY", desc: "제품 기회 후보" },
        { n: "06", label: "PROTOTYPE", desc: "최소 실험 범위" },
      ],
      testing: [
        { n: "01", title: "PROBLEM SIGNAL", desc: "문제 신호를 제대로 포착하는가" },
        { n: "02", title: "OPPORTUNITY CLUSTER", desc: "기회를 클러스터링할 수 있는가" },
        { n: "03", title: "AI SUITABILITY", desc: "AI fit 판단이 유용한가" },
        { n: "04", title: "PROTOTYPE PRIORITY", desc: "프로토타입 우선순위를 정할 수 있는가" },
      ],
      signals: [
        { type: "QUALITATIVE", desc: "문제 정의의 명확성" },
        { type: "BEHAVIORAL", desc: "문제 빈도와 대안 존재" },
        { type: "PRODUCT", desc: "AI fit vs 비-AI 대안" },
        { type: "DECISION", desc: "연구 유지 / 프로토 / 패스" },
      ],
      nextSteps: ["Keep or cut one non–review-intelligence candidate on the board", "Narrow to 1–2 scenarios and define prototype scope"],
      seoDescription: "AI Product Discovery — finding problems worth building with AI. A Newon Labs research experiment.",
    },
    en: {
      headline: "Beyond AI that generates answers —\ncan AI find problems worth building?",
      description: "An AI-assisted exploration experiment that analyzes market signals and user problems to surface new product opportunities.",
      question: "Can AI make the \"what should we build?\"\nexploration process more systematic?",
      questionContext: "There are many ideas, but it's hard to judge which problems are worth solving.",
      snapshot: {
        question: "Can product exploration be more systematic with AI?",
        method: "Problem → signal → pattern → AI fit → opportunity",
        signal: "Problem frequency, alternatives, AI suitability",
        outcome: "Collecting signals",
      },
      why: {
        problem: "Many product ideas — hard to tell which problems are actually worth solving.",
        hypothesis: "Structuring market signals and problem patterns helps compare product candidates more systematically.",
        experiment: "PROBLEM → SIGNAL → PATTERN → AI FIT → OPPORTUNITY → PROTOTYPE",
      },
      flow: [
        { n: "01", label: "PROBLEM", desc: "Recurring user problems" },
        { n: "02", label: "SIGNAL", desc: "Demand and behavior signals" },
        { n: "03", label: "PATTERN", desc: "Problem pattern clusters" },
        { n: "04", label: "AI FIT", desc: "Is AI a better solution?" },
        { n: "05", label: "OPPORTUNITY", desc: "Product opportunity candidates" },
        { n: "06", label: "PROTOTYPE", desc: "Minimum experiment scope" },
      ],
      testing: [
        { n: "01", title: "PROBLEM SIGNAL", desc: "Can we capture the right problem signals?" },
        { n: "02", title: "OPPORTUNITY CLUSTER", desc: "Can opportunities be clustered?" },
        { n: "03", title: "AI SUITABILITY", desc: "Is AI fit scoring useful?" },
        { n: "04", title: "PROTOTYPE PRIORITY", desc: "Can we prioritize prototypes?" },
      ],
      signals: [
        { type: "QUALITATIVE", desc: "Clarity of problem definition" },
        { type: "BEHAVIORAL", desc: "Problem frequency and alternatives" },
        { type: "PRODUCT", desc: "AI fit vs non-AI alternatives" },
        { type: "DECISION", desc: "Research / prototype / pass" },
      ],
      nextSteps: ["Keep or cut one non–review-intelligence candidate on the board", "Narrow to 1–2 scenarios and define prototype scope"],
      seoDescription: "AI Product Discovery — finding problems worth building with AI. A Newon Labs research experiment.",
    },
  },
  "game-experiment": {
    categoryKo: "GAME · INTERACTION",
    categoryEn: "GAME · INTERACTION",
    ko: {
      headline: "선택을 기억하는 게임은\n플레이어를 더 긴장하게 만들 수 있을까?",
      description:
        "플레이어의 선택과 행동을 기억하고, 그 기록이 이후 상황과 결과에 영향을 주는 게임 시스템을 실험합니다.",
      question: "게임이 플레이어의 이전 행동을 기억하면\n선택의 긴장감과 몰입도가 높아질까?",
      questionContext: "선택형 게임에서 이전 선택이 실제로 영향을 주지 않으면 선택의 무게가 약해집니다.",
      snapshot: {
        question: "기억하는 선택이 긴장감을 높이는가",
        method: "선택 → 기억 → 참조 → 결과",
        signal: "재플레이, 모순 반응, 선택 무게",
        outcome: "Collecting signals",
      },
      why: {
        problem: "선택형 게임에서 이전 선택이 실제로 영향을 주지 않으면 선택의 무게가 약해집니다.",
        hypothesis:
          "게임이 행동을 기억하고 이후 상황에서 다시 참조한다면 플레이어는 자신의 선택을 더 신중하게 생각하게 됩니다.",
        experiment: "CHOICE → MEMORY → REFERENCE → CONSEQUENCE",
      },
      flow: [
        { n: "01", label: "CHOICE", desc: "플레이어 결정" },
        { n: "02", label: "MEMORY", desc: "시스템이 선택 기록" },
        { n: "03", label: "REFERENCE", desc: "이후 상황에서 다시 언급" },
        { n: "04", label: "CONSEQUENCE", desc: "결과에 영향" },
      ],
      testing: [
        { n: "01", title: "CHOICE WEIGHT", desc: "선택이 실제로 중요하다고 느껴지는가" },
        { n: "02", title: "MEMORY CALLBACKS", desc: "이전 행동 참조가 몰입을 높이는가" },
        { n: "03", title: "CONTRADICTION", desc: "모순될 때 긴장감이 생기는가" },
        { n: "04", title: "REPLAY VARIATION", desc: "다시 플레이하고 싶어지는가" },
        { n: "05", title: "PLAYER TENSION", desc: "선택 전 긴장감" },
      ],
      signals: [
        { type: "BEHAVIORAL", desc: "재플레이와 선택 패턴" },
        { type: "QUALITATIVE", desc: "선택의 무게감" },
        { type: "PRODUCT", desc: "짧은 세션에서 작동하는가" },
        { type: "DECISION", desc: "마이크로 프로토타입 방향" },
      ],
      nextSteps: ["One playable micro-prototype", "Connect memory → contradiction → replay into one session"],
      seoDescription: "Game Experiment — choice, memory, and consequence in short-session web games. A Newon Labs research experiment.",
    },
    en: {
      headline: "Can a game that remembers choice\nmake players more tense?",
      description:
        "An experiment in game systems that remember player choices and actions — and let that record shape later situations and outcomes.",
      question: "If a game remembers prior player behavior,\ndoes choice feel heavier and more immersive?",
      questionContext: "In choice-driven games, when past choices don't matter, decisions feel weightless.",
      snapshot: {
        question: "Does remembered choice increase tension?",
        method: "Choice → memory → reference → consequence",
        signal: "Replay, contradiction response, choice weight",
        outcome: "Collecting signals",
      },
      why: {
        problem: "When past choices don't actually affect outcomes, decisions feel weightless.",
        hypothesis:
          "If the game remembers behavior and references it later, players think more carefully about each choice.",
        experiment: "CHOICE → MEMORY → REFERENCE → CONSEQUENCE",
      },
      flow: [
        { n: "01", label: "CHOICE", desc: "Player decision" },
        { n: "02", label: "MEMORY", desc: "System stores the choice" },
        { n: "03", label: "REFERENCE", desc: "Mentioned again later" },
        { n: "04", label: "CONSEQUENCE", desc: "Shifts the outcome" },
      ],
      testing: [
        { n: "01", title: "CHOICE WEIGHT", desc: "Do players feel choices matter?" },
        { n: "02", title: "MEMORY CALLBACKS", desc: "Do memory callbacks deepen immersion?" },
        { n: "03", title: "CONTRADICTION", desc: "Does contradiction create tension?" },
        { n: "04", title: "REPLAY VARIATION", desc: "Do players want to replay?" },
        { n: "05", title: "PLAYER TENSION", desc: "Tension before choosing" },
      ],
      signals: [
        { type: "BEHAVIORAL", desc: "Replay and choice patterns" },
        { type: "QUALITATIVE", desc: "Felt weight of decisions" },
        { type: "PRODUCT", desc: "Works in short sessions" },
        { type: "DECISION", desc: "Micro-prototype direction" },
      ],
      nextSteps: ["One playable micro-prototype", "Connect memory → contradiction → replay into one session"],
      seoDescription: "Game Experiment — choice, memory, and consequence. A Newon Labs research experiment.",
    },
  },
  "character-lab": {
    categoryKo: "IP · VISUAL SYSTEM",
    categoryEn: "IP · VISUAL SYSTEM",
    ko: {
      headline: "캐릭터 하나가 아니라,\n확장 가능한 IP 시스템을 만들 수 있을까?",
      description:
        "캐릭터의 외형만 디자인하는 것이 아니라 표정, 포즈, 성격, 세계관과 활용 규칙까지 하나의 일관된 시스템으로 만드는 실험입니다.",
      question:
        "하나의 캐릭터를 제품, 콘텐츠, 굿즈와 브랜드로 확장할 수 있는\n재사용 가능한 IP 시스템으로 만들 수 있을까?",
      questionContext: "캐릭터를 만들어도 다른 매체에서 일관되게 확장하기 어렵습니다.",
      snapshot: {
        question: "확장 가능한 IP 시스템을 만들 수 있는가",
        method: "정체성 → 형태 → 표현 → 세계 → 적용",
        signal: "일관성, 인식 가능성, 확장성",
        outcome: "Collecting signals",
      },
      why: {
        problem: "캐릭터 디자인은 만들어도 다른 콘텐츠와 제품에서 일관되게 확장하기 어렵습니다.",
        hypothesis:
          "캐릭터의 시각적 규칙과 성격, 표현 체계를 먼저 시스템화하면 다양한 매체에서도 일관성을 유지할 수 있습니다.",
        experiment: "IDENTITY → FORM → EXPRESSION → WORLD → APPLICATION → IP",
      },
      flow: [
        { n: "01", label: "IDENTITY", desc: "캐릭터 정체성" },
        { n: "02", label: "FORM", desc: "실루엣과 비율" },
        { n: "03", label: "EXPRESSION", desc: "표정 체계" },
        { n: "04", label: "WORLD", desc: "세계관 규칙" },
        { n: "05", label: "APPLICATION", desc: "제품·콘텐츠 적용" },
        { n: "06", label: "IP", desc: "확장 가능한 IP" },
      ],
      testing: [
        { n: "01", title: "VISUAL CONSISTENCY", desc: "시각적 일관성" },
        { n: "02", title: "EXPRESSION SYSTEM", desc: "표정 시스템" },
        { n: "03", title: "RECOGNIZABILITY", desc: "캐릭터 인식 가능성" },
        { n: "04", title: "CROSS-MEDIA", desc: "매체 간 적용" },
        { n: "05", title: "IP SCALABILITY", desc: "IP 확장성" },
      ],
      signals: [
        { type: "QUALITATIVE", desc: "가이드라인 준수 가능성" },
        { type: "PRODUCT", desc: "Newon 브랜드와의 정합" },
        { type: "BEHAVIORAL", desc: "내부 리뷰 반응" },
        { type: "DECISION", desc: "공개 여부" },
      ],
      nextSteps: ["Guideline draft → internal review", "Validate one internal character concept, then decide on a public release"],
      seoDescription: "Character Lab — building a scalable character IP system, not a single mascot. A Newon Labs research experiment.",
    },
    en: {
      headline: "Not one character —\ncan we build a scalable IP system?",
      description:
        "An experiment to build a consistent system — not just a look — covering expression, pose, personality, world rules, and usage guidelines.",
      question:
        "Can one character become a reusable IP system\nthat extends to product, content, merch, and brand?",
      questionContext: "Characters are often designed once but hard to extend consistently across media.",
      snapshot: {
        question: "Can we build a scalable IP system?",
        method: "Identity → form → expression → world → application",
        signal: "Consistency, recognizability, scalability",
        outcome: "Collecting signals",
      },
      why: {
        problem: "Character design alone doesn't extend consistently across content and products.",
        hypothesis:
          "Systematizing visual rules, personality, and expression first keeps consistency across media.",
        experiment: "IDENTITY → FORM → EXPRESSION → WORLD → APPLICATION → IP",
      },
      flow: [
        { n: "01", label: "IDENTITY", desc: "Character identity" },
        { n: "02", label: "FORM", desc: "Silhouette and proportion" },
        { n: "03", label: "EXPRESSION", desc: "Expression system" },
        { n: "04", label: "WORLD", desc: "World rules" },
        { n: "05", label: "APPLICATION", desc: "Product and content use" },
        { n: "06", label: "IP", desc: "Scalable IP" },
      ],
      testing: [
        { n: "01", title: "VISUAL CONSISTENCY", desc: "Visual consistency" },
        { n: "02", title: "EXPRESSION SYSTEM", desc: "Expression system" },
        { n: "03", title: "RECOGNIZABILITY", desc: "Character recognizability" },
        { n: "04", title: "CROSS-MEDIA", desc: "Cross-media application" },
        { n: "05", title: "IP SCALABILITY", desc: "IP scalability" },
      ],
      signals: [
        { type: "QUALITATIVE", desc: "Guideline adherence potential" },
        { type: "PRODUCT", desc: "Fit with Newon brand" },
        { type: "BEHAVIORAL", desc: "Internal review response" },
        { type: "DECISION", desc: "Public release decision" },
      ],
      nextSteps: ["Guideline draft → internal review", "Validate one internal character concept, then decide on a public release"],
      seoDescription: "Character Lab — a scalable character IP system experiment at Newon Labs.",
    },
  },
};

export function getLabDetailContent(slug, lang) {
  const block = LAB_DETAIL_CONTENT[slug];
  if (!block) return null;
  const L = lang === "ko" ? "ko" : "en";
  return {
    category: L === "ko" ? block.categoryKo : block.categoryEn,
    ...block[L],
  };
}
