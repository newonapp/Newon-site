/**
 * Per-experiment case study copy (KO/EN) for Labs detail pages.
 * Brand Strategy–quality narrative. No invented metrics.
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
      heroLead:
        "리뷰는 제품 팀에게 가장 직접적인 사용자 목소리입니다.\n\n하지만 양이 늘수록\n읽고, 분류하고, 우선순위를 정하는 비용이 커집니다.\n별점과 문장은 쌓이지만,\n결정에 쓸 신호는 잘 보이지 않습니다.\n\nReview AI는 리뷰를 요약하는 데서 멈추지 않습니다.\n반복되는 문제, 요청, 감정과 패턴을 구조화해\n제품 의사결정에 바로 붙일 수 있는 신호로 바꾸는 실험입니다.",
      overviewTitle: "별점과 문장 뒤에 있는\n제품 신호를 꺼냅니다.",
      overviewBody: [
        "사용자 리뷰에서 반복되는 문제와 요구를 찾아\n제품 개선에 필요한 신호로 구조화하는 실험입니다.",
        "핵심은 더 많은 리뷰를 읽는 것이 아닙니다.\n무엇이 반복되는지, 무엇이 결정에 필요한지,\n무엇을 먼저 고칠지를 보이게 만드는 일입니다.",
        "리뷰 → 신호 → 패턴 → 인사이트 → 결정.\n이 흐름이 실제로 제품 팀에 도움이 되는지 검증합니다.",
      ],
      description:
        "사용자 리뷰에서 반복되는 문제와 요구를 찾아\n제품 개선에 필요한 신호로 구조화하는 실험입니다.",
      whoTitle: "이런 팀에게 필요합니다.",
      who: [
        {
          t: "PRODUCT TEAMS",
          d: "앱스토어·스토어 리뷰가 쌓이지만\n매주 전부 읽고 우선순위를 정하기 어려운 제품 팀",
        },
        {
          t: "FOUNDERS",
          d: "사용자 목소리를 제품 결정에 반영하고 싶지만\n리뷰를 구조화할 시간이 부족한 초기 팀",
        },
        {
          t: "UX / RESEARCH",
          d: "정성 피드백을 테마로 묶어\n인터뷰·조사 가설의 출발점으로 쓰고 싶은 팀",
        },
        {
          t: "SUPPORT → PRODUCT",
          d: "고객지원에 쌓인 불만이\n제품 백로그로 잘 넘어가지 않는 조직",
        },
        {
          t: "MULTI-MARKET APPS",
          d: "언어·시장이 달라\n리뷰를 한 번에 비교하기 어려운 글로벌 제품",
        },
        {
          t: "BEFORE ROADMAP",
          d: "다음 스프린트·로드맵을 잡기 전에\n실제 사용자 반복 신호를 확인하고 싶은 경우",
        },
      ],
      question:
        "사용자 리뷰를 단순한 별점과 문장이 아니라\n제품 의사결정에 사용할 수 있는 신호로 바꿀 수 있을까?",
      questionContext:
        "리뷰는 가장 직접적인 사용자 목소리지만, 양이 늘수록 읽고 우선순위를 정하는 비용이 커집니다. 요약만으로는 결정이 되지 않습니다.",
      snapshot: {
        question: "리뷰를 제품 의사결정 신호로 구조화할 수 있는가",
        method: "리뷰 수집 → 신호 추출 → 패턴 그룹 → 인사이트",
        signal: "반복 불만, 기능 요청, 감정 패턴",
        outcome: "검증 진행 중",
      },
      whyTitle: "문제를 이렇게 봅니다.",
      why: {
        problem:
          "리뷰가 많아질수록 모든 의견을 직접 읽고\n반복되는 문제를 찾기 어렵습니다.\n팀은 느끼지만, 근거로 쓰기 힘듭니다.",
        hypothesis:
          "AI가 리뷰를 요약하는 데서 끝나지 않고\n반복되는 문제, 요구, 감정과 패턴을 구조화한다면\n제품 의사결정에 더 직접적으로 활용할 수 있습니다.",
        experiment: "Review → Signal → Pattern → Insight → Decision",
      },
      flowTitle: "신호로 바꾸는 흐름",
      flow: [
        { n: "01", label: "INPUT", desc: "사용자 리뷰·피드백 텍스트를 입력합니다." },
        { n: "02", label: "SIGNAL", desc: "핵심 문제, 요청, 감정 신호를 추출합니다." },
        { n: "03", label: "PATTERN", desc: "반복되는 의견을 하나의 패턴으로 묶습니다." },
        { n: "04", label: "INSIGHT", desc: "제품 관점에서 의미를 해석합니다." },
        { n: "05", label: "DECISION", desc: "개선 우선순위 판단을 지원합니다." },
      ],
      testingTitle: "지금 확인하고 있는 가설",
      testing: [
        {
          n: "01",
          title: "SIGNAL QUALITY",
          desc: "AI가 핵심 문제를 제대로 추출하는가.\n노이즈와 결정 신호를 구분할 수 있는가.",
        },
        {
          n: "02",
          title: "PATTERN DETECTION",
          desc: "표현이 달라도 같은 문제를\n하나의 패턴으로 묶을 수 있는가.",
        },
        {
          n: "03",
          title: "ACTIONABILITY",
          desc: "결과가 실제 제품 개선 결정·백로그에\n도움이 되는가.",
        },
        {
          n: "04",
          title: "INFORMATION DENSITY",
          desc: "많은 리뷰를 더 빠르게 이해할 수 있는가.\n팀이 다시 원문으로 돌아갈 필요가 줄어드는가.",
        },
      ],
      signalsTitle: "무엇을 보고 판단하는가",
      signals: [
        { type: "QUALITATIVE", desc: "리뷰 텍스트에서 반복되는 불만과 요청" },
        { type: "BEHAVIORAL", desc: "어떤 테마가 자주 등장하는지" },
        { type: "PRODUCT", desc: "개선 우선순위로 연결 가능한지" },
        { type: "DECISION", desc: "계속 만들지 / 수정할지 / 중단할지" },
      ],
      outcomesTitle: "검증이 끝나면 남기고 싶은 것",
      outcomes: [
        {
          t: "SIGNAL STRUCTURE",
          d: "리뷰를 결정용 신호로 읽는\n반복 가능한 구조",
        },
        {
          t: "PATTERN LANGUAGE",
          d: "팀이 공유할 수 있는\n문제·요청 패턴 언어",
        },
        {
          t: "PRIORITY LENS",
          d: "무엇을 먼저 고칠지 보는\n제품 관점의 렌즈",
        },
        {
          t: "CONTINUE / CUT RULE",
          d: "이 실험을 제품으로 이어갈지\n판단하는 기준",
        },
      ],
      includes: [
        "Review Intake",
        "Signal Extraction",
        "Theme Clustering",
        "Sentiment Pattern View",
        "Priority Summary",
        "Decision Notes",
        "Sample Review Sets",
        "Heuristic vs Model Compare",
      ],
      nextTitle: "다음에 확인할 것",
      nextSteps: [
        {
          t: "신호 그룹 정교화",
          d: "표현이 다른 동일 문제를\n더 안정적으로 묶는지 검증합니다.",
        },
        {
          t: "결정 요약 테스트",
          d: "제품 팀이 실제로 쓸 수 있는\n우선순위 요약 형태를 시험합니다.",
        },
        {
          t: "실제 샘플셋 비교",
          d: "앱스토어 리뷰 샘플로\n휴리스틱과 모델 품질을 비교합니다.",
        },
        {
          t: "사용 피드백 수집",
          d: "초기 사용자에게\n어떤 출력이 결정에 도움이 되는지 묻습니다.",
        },
      ],
      faq: [
        {
          q: "리뷰를 자동으로 요약만 해주나요?",
          a: "요약이 아니라 반복 문제·요청·패턴을 구조화하는 것이 목표입니다. 결정에 쓸 신호를 남기는지가 핵심입니다.",
        },
        {
          q: "지금 서비스로 바로 쓸 수 있나요?",
          a: "아닙니다. Newon Labs 실험 단계입니다. 검증이 끝나면 제품·서비스로 이어질 수 있습니다.",
        },
        {
          q: "어떤 리뷰 데이터를 쓰나요?",
          a: "실험용 샘플과 사용자가 직접 입력한 리뷰 텍스트를 기준으로 합니다. 공개된 가짜 수치나 보장된 정확도는 없습니다.",
        },
        {
          q: "다른 Labs 실험과 어떻게 연결되나요?",
          a: "리뷰에서 나온 문제는 AI Discovery·Form 등 다른 실험의 입력 신호로 이어질 수 있습니다.",
        },
      ],
      seoDescription:
        "사용자 리뷰에서 반복 문제와 요구를 찾아 제품 개선 신호로 구조화하는 Review AI 실험 — Newon Labs.",
    },
    en: {
      headline: "Not an AI that reads reviews.\nAn AI that supports product decisions.",
      heroLead:
        "Reviews are the most direct user voice a product team gets.\n\nBut as volume grows,\nthe cost of reading, sorting, and prioritizing grows with it.\nStars and sentences pile up —\nthe signals for decisions stay hard to see.\n\nReview AI does not stop at summaries.\nIt structures repeated problems, requests, sentiment, and patterns\ninto signals teams can use in product decisions.",
      overviewTitle: "Pull product signals\nout from behind stars and sentences.",
      overviewBody: [
        "An experiment that finds repeated issues and requests in user reviews and structures them as signals for product improvement.",
        "The point is not reading more reviews.\nIt is making repetition visible —\nwhat matters for decisions, and what to fix first.",
        "Review → signal → pattern → insight → decision.\nWe test whether that flow actually helps product teams.",
      ],
      description:
        "An experiment that finds repeated issues and requests in user reviews and structures them as signals for product improvement.",
      whoTitle: "Built for these teams.",
      who: [
        {
          t: "PRODUCT TEAMS",
          d: "Store reviews keep piling up,\nbut weekly full reads and prioritization do not scale",
        },
        {
          t: "FOUNDERS",
          d: "Want user voice in product decisions\nwithout hours spent structuring reviews",
        },
        {
          t: "UX / RESEARCH",
          d: "Need qualitative feedback clustered into themes\nas a starting point for interviews and studies",
        },
        {
          t: "SUPPORT → PRODUCT",
          d: "Support complaints do not cleanly\nbecome product backlog items",
        },
        {
          t: "MULTI-MARKET APPS",
          d: "Languages and markets differ —\ncomparing reviews in one pass is hard",
        },
        {
          t: "BEFORE ROADMAP",
          d: "Before the next sprint or roadmap,\nyou want real repeated user signals",
        },
      ],
      question:
        "Can user reviews become decision signals —\nnot just star ratings and sentences?",
      questionContext:
        "Reviews are the most direct user voice, but as volume grows, reading and prioritizing get expensive. Summary alone is not a decision.",
      snapshot: {
        question: "Can reviews become structured decision signals?",
        method: "Collect → extract signals → group patterns → insight",
        signal: "Repeated complaints, feature asks, sentiment patterns",
        outcome: "Validation in progress",
      },
      whyTitle: "How we frame the problem.",
      why: {
        problem:
          "As review volume grows, it is hard to read everything\nand spot repeated issues.\nTeams feel the pain — but struggle to use it as evidence.",
        hypothesis:
          "If AI goes beyond summarizing and structures repeated problems, requests, sentiment, and patterns, teams can use reviews more directly in product decisions.",
        experiment: "Review → Signal → Pattern → Insight → Decision",
      },
      flowTitle: "The flow that turns text into signal",
      flow: [
        { n: "01", label: "INPUT", desc: "Bring in user review and feedback text." },
        { n: "02", label: "SIGNAL", desc: "Extract core issues, requests, and sentiment signals." },
        { n: "03", label: "PATTERN", desc: "Group repeated opinions into patterns." },
        { n: "04", label: "INSIGHT", desc: "Interpret meaning through a product lens." },
        { n: "05", label: "DECISION", desc: "Support improvement priority judgments." },
      ],
      testingTitle: "Hypotheses under test",
      testing: [
        {
          n: "01",
          title: "SIGNAL QUALITY",
          desc: "Does AI extract the right core issues?\nCan it separate noise from decision signals?",
        },
        {
          n: "02",
          title: "PATTERN DETECTION",
          desc: "Can differently worded reviews\ncluster into one shared pattern?",
        },
        {
          n: "03",
          title: "ACTIONABILITY",
          desc: "Do results help real product decisions\nand backlog calls?",
        },
        {
          n: "04",
          title: "INFORMATION DENSITY",
          desc: "Can teams understand more reviews faster —\nwithout constantly returning to the raw text?",
        },
      ],
      signalsTitle: "Signals we watch",
      signals: [
        { type: "QUALITATIVE", desc: "Repeated complaints and requests in review text" },
        { type: "BEHAVIORAL", desc: "Which themes appear most often" },
        { type: "PRODUCT", desc: "Whether output maps to improvement priorities" },
        { type: "DECISION", desc: "Continue, revise, or stop" },
      ],
      outcomesTitle: "What we want to leave with",
      outcomes: [
        {
          t: "SIGNAL STRUCTURE",
          d: "A repeatable way to read reviews\nas decision signals",
        },
        {
          t: "PATTERN LANGUAGE",
          d: "A shared language for\nproblem and request patterns",
        },
        {
          t: "PRIORITY LENS",
          d: "A product lens for\nwhat to fix first",
        },
        {
          t: "CONTINUE / CUT RULE",
          d: "Criteria for whether this experiment\nshould become a product",
        },
      ],
      includes: [
        "Review Intake",
        "Signal Extraction",
        "Theme Clustering",
        "Sentiment Pattern View",
        "Priority Summary",
        "Decision Notes",
        "Sample Review Sets",
        "Heuristic vs Model Compare",
      ],
      nextTitle: "What comes next",
      nextSteps: [
        {
          t: "Refine signal grouping",
          d: "Test whether the same problems cluster stably\neven when wording differs.",
        },
        {
          t: "Test decision summaries",
          d: "Try priority summary shapes\nproduct teams can actually use.",
        },
        {
          t: "Compare on real samples",
          d: "Run heuristic vs model quality\non App Store review sample sets.",
        },
        {
          t: "Collect usage feedback",
          d: "Ask early users which outputs\nactually help decisions.",
        },
      ],
      faq: [
        {
          q: "Is this just automatic review summarization?",
          a: "No. The goal is structuring repeated problems, requests, and patterns — leaving signals teams can use in decisions.",
        },
        {
          q: "Can we use this as a product today?",
          a: "Not yet. It is a Newon Labs experiment. Validated work may graduate into products and services.",
        },
        {
          q: "What review data do you use?",
          a: "Experiment samples and text users paste in. There are no invented metrics or guaranteed accuracy claims.",
        },
        {
          q: "How does this connect to other Labs experiments?",
          a: "Problems surfaced from reviews can feed other experiments such as AI Discovery and Form.",
        },
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
      heroLead:
        "QR은 만들기 쉽습니다.\n명함, 포스터, 메뉴, 제품 —\n오프라인에 붙이면 끝처럼 보입니다.\n\n하지만 실제로 얼마나 스캔되는지,\n어디로 이어지는지, 어떤 맥락에서 반응하는지는\n잘 보이지 않습니다.\n\nNewon QR은 생성에서 끝나지 않습니다.\n배포 → 스캔 → 방문까지 연결해\n오프라인 접점을 관찰 가능한 디지털 신호로 바꾸는 실험입니다.",
      overviewTitle: "만든 뒤가 아니라,\n쓰인 뒤가 중요합니다.",
      overviewBody: [
        "QR 생성 이후 실제 스캔과 방문 흐름까지 연결해\n오프라인 접점을 측정 가능한 디지털 신호로 바꾸는 실험입니다.",
        "작은 팀에게 필요한 것은 복잡한 애널리틱스가 아닙니다.\n만들었는지, 스캔됐는지, 어디로 갔는지 —\n그 최소 흐름을 명확히 보는 일입니다.",
        "생성 → 배포 → 스캔 → 방문 → 관찰.\n오프라인 유입을 제품 신호로 읽을 수 있는지 검증합니다.",
      ],
      description:
        "QR 생성 이후 실제 스캔과 방문 흐름까지 연결해\n오프라인 접점을 측정 가능한 디지털 신호로 바꾸는 실험입니다.",
      whoTitle: "이런 팀에게 필요합니다.",
      who: [
        {
          t: "SMALL TEAMS",
          d: "이벤트·명함·메뉴에 QR을 쓰지만\n추적 도구는 과하게 복잡한 작은 팀",
        },
        {
          t: "FOUNDERS",
          d: "오프라인에서 제품·랜딩으로 보내는\n유입을 가볍게 확인하고 싶은 초기 팀",
        },
        {
          t: "BRAND / OPS",
          d: "인쇄물·공간에 QR을 배치하고\n다시 만들지 않고 목적지를 바꾸고 싶은 경우",
        },
        {
          t: "EVENTS",
          d: "현장 배포 후\n실제 스캔·방문이 일어났는지 보고 싶은 팀",
        },
        {
          t: "PRODUCT → OFFLINE",
          d: "디지털 제품을 오프라인 접점과\n연결해 테스트하려는 팀",
        },
        {
          t: "BEFORE BACKEND",
          d: "추적 백엔드를 크게 짓기 전에\n필요한 최소 측정 범위를 정하고 싶은 경우",
        },
      ],
      question:
        "QR을 단순한 링크 전달 도구가 아니라\n제품 유입을 관찰하는 접점으로 만들 수 있을까?",
      questionContext:
        "QR은 만들기 쉽지만, 실제로 얼마나 스캔되고 어디로 이어지는지 알기 어렵습니다. 생성 UX만으로는 제품 가치가 완성되지 않습니다.",
      snapshot: {
        question: "QR을 유입 관찰 접점으로 만들 수 있는가",
        method: "생성 → 배포 → 스캔 → 방문 → 관찰",
        signal: "스캔, 방문 흐름, 배포 맥락",
        outcome: "검증 진행 중",
      },
      whyTitle: "문제를 이렇게 봅니다.",
      why: {
        problem:
          "QR을 만들어도 실제로 얼마나 사용되는지 알기 어렵습니다.\n오프라인 접점이 디지털 신호로 남지 않습니다.",
        hypothesis:
          "생성 → 스캔 → 방문 흐름을 연결하면\n오프라인 유입을 더 명확하게 이해할 수 있습니다.\n작은 팀에는 최소 측정이면 충분할 수 있습니다.",
        experiment: "CREATE → SCAN → VISIT → SIGNAL",
      },
      flowTitle: "신호로 바꾸는 흐름",
      flow: [
        { n: "01", label: "CREATE", desc: "URL을 QR로 변환합니다." },
        { n: "02", label: "DISTRIBUTE", desc: "명함, 포스터, 제품 등에 배치합니다." },
        { n: "03", label: "SCAN", desc: "사용자가 스캔합니다." },
        { n: "04", label: "VISIT", desc: "연결 페이지로 이동합니다." },
        { n: "05", label: "OBSERVE", desc: "사용 흐름을 관찰합니다." },
      ],
      testingTitle: "지금 확인하고 있는 가설",
      testing: [
        {
          n: "01",
          title: "GENERATION SPEED",
          desc: "QR 생성이 충분히 빠른가.\n작은 팀이 막힘 없이 만들 수 있는가.",
        },
        {
          n: "02",
          title: "MOBILE SCAN UX",
          desc: "모바일 스캔 경험이 자연스러운가.\n현장에서 실패하지 않는가.",
        },
        {
          n: "03",
          title: "OFFLINE → ONLINE",
          desc: "오프라인 배포가 온라인 방문으로\n실제로 이어지는가.",
        },
        {
          n: "04",
          title: "SIMPLE MEASUREMENT",
          desc: "간단한 유입 측정이 가능한가.\n과도한 대시보드 없이도 가치가 있는가.",
        },
      ],
      signalsTitle: "무엇을 보고 판단하는가",
      signals: [
        { type: "BEHAVIORAL", desc: "스캔과 방문이 실제로 발생하는지" },
        { type: "PRODUCT", desc: "생성·관리 UX가 작은 팀에 맞는지" },
        { type: "QUALITATIVE", desc: "어떤 배포 맥락에서 쓰이는지" },
        { type: "DECISION", desc: "추적 백엔드 범위를 어디까지 할지" },
      ],
      outcomesTitle: "검증이 끝나면 남기고 싶은 것",
      outcomes: [
        {
          t: "MINIMAL CREATE FLOW",
          d: "작은 팀이 막힘 없이 쓰는\n최소 QR 생성 흐름",
        },
        {
          t: "EDITABLE DESTINATION",
          d: "QR을 다시 만들지 않고\n목적지를 바꾸는 방식",
        },
        {
          t: "OBSERVABLE PATH",
          d: "스캔 → 방문까지 보이는\n최소 관찰 경로",
        },
        {
          t: "BACKEND SCOPE RULE",
          d: "추적 백엔드를 어디까지 지을지\n정하는 기준",
        },
      ],
      includes: [
        "QR Generation",
        "Destination URL",
        "Editable Link Target",
        "Distribute Contexts",
        "Scan Path",
        "Visit Observation",
        "Scenario Tests",
        "MVP Backend Scope Notes",
      ],
      nextTitle: "다음에 확인할 것",
      nextSteps: [
        {
          t: "MVP 백엔드 범위 정의",
          d: "리다이렉트와 스캔 카운트 등\n최소 추적 범위를 확정합니다.",
        },
        {
          t: "첫 시나리오 테스트",
          d: "이벤트, 메뉴, 명함 맥락에서\n생성·스캔 경험을 시험합니다.",
        },
        {
          t: "목적지 변경 UX",
          d: "인쇄 후 URL을 바꿀 때\n팀이 실제로 쓰는 흐름인지 확인합니다.",
        },
        {
          t: "측정 최소 단위",
          d: "어떤 숫자·상태만 있어도\n의사결정에 충분한지 좁힙니다.",
        },
      ],
      faq: [
        {
          q: "일반 QR 생성기와 무엇이 다른가요?",
          a: "생성만이 아니라 스캔 이후 방문 흐름을 관찰 가능한 접점으로 만드는지를 실험합니다.",
        },
        {
          q: "지금 스캔 통계를 볼 수 있나요?",
          a: "실험 단계이며, 추적 백엔드 범위도 함께 정의 중입니다. 완성된 대시보드를 약속하지 않습니다.",
        },
        {
          q: "인쇄한 뒤 URL을 바꿀 수 있나요?",
          a: "그것이 핵심 가설 중 하나입니다. QR을 다시 만들지 않고 목적지를 바꿀 수 있어야 하는지 검증합니다.",
        },
        {
          q: "누구에게 맞는 실험인가요?",
          a: "복잡한 BI보다, 오프라인 → 온라인 최소 유입을 보고 싶은 작은 팀에 맞춰져 있습니다.",
        },
      ],
      seoDescription:
        "Newon QR — 링크 생성에서 스캔·방문 관찰까지 연결하는 유틸리티 실험. Newon Labs.",
    },
    en: {
      headline: "From a QR that makes links\nto a QR that reads response.",
      heroLead:
        "QR codes are easy to make.\nBusiness cards, posters, menus, packaging —\nit looks finished once they hit the offline world.\n\nBut how often they are scanned,\nwhere traffic goes, and in which context people respond\nstays hard to see.\n\nNewon QR does not end at generation.\nIt connects distribute → scan → visit\nand turns offline touchpoints into observable digital signals.",
      overviewTitle: "Not after you make it —\nafter it is used.",
      overviewBody: [
        "An experiment connecting QR creation to scan and visit flow — turning offline touchpoints into measurable digital signals.",
        "Small teams do not need heavy analytics.\nThey need a clear minimum path:\nwas it created, scanned, and where did it land?",
        "Create → distribute → scan → visit → observe.\nWe test whether offline intake can be read as a product signal.",
      ],
      description:
        "An experiment connecting QR creation to scan and visit flow — turning offline touchpoints into measurable digital signals.",
      whoTitle: "Built for these teams.",
      who: [
        {
          t: "SMALL TEAMS",
          d: "Use QR on events, cards, and menus —\nbut tracking tools feel too heavy",
        },
        {
          t: "FOUNDERS",
          d: "Want a light read on offline intake\ninto a product or landing page",
        },
        {
          t: "BRAND / OPS",
          d: "Place QR on print and in spaces,\nand want to change destinations without reprinting",
        },
        {
          t: "EVENTS",
          d: "Need to see whether field distribution\nactually produced scans and visits",
        },
        {
          t: "PRODUCT → OFFLINE",
          d: "Testing how a digital product\nconnects to offline touchpoints",
        },
        {
          t: "BEFORE BACKEND",
          d: "Want to define the minimum measurement scope\nbefore building a large tracking backend",
        },
      ],
      question:
        "Can a QR be an intake touchpoint —\nnot just a link delivery tool?",
      questionContext:
        "QRs are easy to create, but hard to know how often they are scanned and where traffic goes. Creation UX alone does not complete the product value.",
      snapshot: {
        question: "Can QR become an observable intake touchpoint?",
        method: "Create → distribute → scan → visit → observe",
        signal: "Scans, visit flow, distribution context",
        outcome: "Validation in progress",
      },
      whyTitle: "How we frame the problem.",
      why: {
        problem:
          "Even after creating a QR, it is hard to know how much it is used.\nOffline touchpoints do not become digital signals.",
        hypothesis:
          "Connecting create → scan → visit makes offline intake easier to understand.\nFor small teams, minimal measurement may be enough.",
        experiment: "CREATE → SCAN → VISIT → SIGNAL",
      },
      flowTitle: "The flow that turns print into signal",
      flow: [
        { n: "01", label: "CREATE", desc: "Turn a URL into a QR." },
        { n: "02", label: "DISTRIBUTE", desc: "Place it on cards, posters, products." },
        { n: "03", label: "SCAN", desc: "The user scans." },
        { n: "04", label: "VISIT", desc: "They land on the destination page." },
        { n: "05", label: "OBSERVE", desc: "Observe the usage flow." },
      ],
      testingTitle: "Hypotheses under test",
      testing: [
        {
          n: "01",
          title: "GENERATION SPEED",
          desc: "Is QR creation fast enough?\nCan a small team make one without friction?",
        },
        {
          n: "02",
          title: "MOBILE SCAN UX",
          desc: "Does mobile scan feel natural?\nDoes it hold up in the field?",
        },
        {
          n: "03",
          title: "OFFLINE → ONLINE",
          desc: "Does offline distribution\nactually convert into online visits?",
        },
        {
          n: "04",
          title: "SIMPLE MEASUREMENT",
          desc: "Can intake be measured simply?\nIs there value without a heavy dashboard?",
        },
      ],
      signalsTitle: "Signals we watch",
      signals: [
        { type: "BEHAVIORAL", desc: "Whether scans and visits actually happen" },
        { type: "PRODUCT", desc: "Whether create/manage UX fits small teams" },
        { type: "QUALITATIVE", desc: "Which deployment contexts get used" },
        { type: "DECISION", desc: "How far tracking backend should go" },
      ],
      outcomesTitle: "What we want to leave with",
      outcomes: [
        {
          t: "MINIMAL CREATE FLOW",
          d: "A create flow small teams can use\nwithout friction",
        },
        {
          t: "EDITABLE DESTINATION",
          d: "A way to change destinations\nwithout regenerating the QR",
        },
        {
          t: "OBSERVABLE PATH",
          d: "A minimum observable path\nfrom scan to visit",
        },
        {
          t: "BACKEND SCOPE RULE",
          d: "Criteria for how far\nthe tracking backend should go",
        },
      ],
      includes: [
        "QR Generation",
        "Destination URL",
        "Editable Link Target",
        "Distribute Contexts",
        "Scan Path",
        "Visit Observation",
        "Scenario Tests",
        "MVP Backend Scope Notes",
      ],
      nextTitle: "What comes next",
      nextSteps: [
        {
          t: "Define MVP backend scope",
          d: "Lock the minimum tracking scope —\nredirect and scan counts first.",
        },
        {
          t: "Test first scenarios",
          d: "Run create-and-scan in events,\nmenus, and business-card contexts.",
        },
        {
          t: "Destination edit UX",
          d: "Check whether teams actually use\npost-print URL changes.",
        },
        {
          t: "Minimum measurement unit",
          d: "Narrow which states alone\nare enough for decisions.",
        },
      ],
      faq: [
        {
          q: "How is this different from a normal QR generator?",
          a: "We experiment beyond generation — whether scan-to-visit can become an observable touchpoint.",
        },
        {
          q: "Can we see scan stats today?",
          a: "This is still an experiment, and backend tracking scope is being defined with it. We do not promise a finished dashboard.",
        },
        {
          q: "Can we change the URL after printing?",
          a: "That is one of the core hypotheses — whether destinations can change without regenerating the QR.",
        },
        {
          q: "Who is this for?",
          a: "Small teams that need offline → online minimum intake visibility more than heavy BI.",
        },
      ],
      seoDescription:
        "Newon QR — from link creation to observing scan and visit flow. A Newon Labs utility experiment.",
    },
  },

  "newon-form": {
    categoryKo: "UTILITY · INPUT",
    categoryEn: "UTILITY · INPUT",
    ko: {
      headline: "질문을 만드는 시간을 줄이고,\n답을 이해하는 데 집중합니다.",
      heroLead:
        "간단한 검증에도 폼은 무거워지기 쉽습니다.\n필드를 고르고, 공유하고, 응답을 정리하는 사이\n원래 확인하려던 질문이 흐려집니다.\n\nNewon Form은 더 많은 폼 기능을 쌓지 않습니다.\n가볍게 만들고, 빠르게 공유하며,\n응답을 제품 신호로 연결하는 짧은 입력 흐름을 실험합니다.\n\n만들기보다 이해하기.\n그 균형을 찾는 것이 목표입니다.",
      overviewTitle: "입력은 짧게,\n학습은 분명하게.",
      overviewBody: [
        "가볍게 만들고 빠르게 공유하며\n응답을 제품 신호로 연결하는 폼 경험을 탐구합니다.",
        "핵심은 더 많은 질문 유형이 아닙니다.\n최소 필드로도 충분한 답을 받고,\n그 답을 다시 제품 학습으로 넘기는 일입니다.",
        "만들기 → 공유 → 응답 → 정리 → 학습.\n폼 제작과 응답 분석을 하나의 단순 흐름으로 만들 수 있는지 검증합니다.",
      ],
      description:
        "가볍게 만들고 빠르게 공유하며\n응답을 제품 신호로 연결하는 폼 경험을 탐구합니다.",
      whoTitle: "이런 팀에게 필요합니다.",
      who: [
        {
          t: "EARLY VALIDATION",
          d: "아이디어·MVP를 빠르게 묻고 싶지만\n폼 설정에 시간을 쓰기 싫은 팀",
        },
        {
          t: "PRODUCT / UX",
          d: "짧은 질문으로 가설을 확인하고\n응답을 인사이트로 묶고 싶은 팀",
        },
        {
          t: "FOUNDERS",
          d: "복잡한 설문 도구 없이\n핵심만 물어보고 싶은 초기 팀",
        },
        {
          t: "INTERNAL OPS",
          d: "팀 내부 의견 수집을\n가볍게 돌리고 싶은 경우",
        },
        {
          t: "LABS → LEARNING",
          d: "다른 Labs 실험의 가설을\n짧은 입력으로 검증하려는 경우",
        },
        {
          t: "MOBILE FIRST",
          d: "모바일에서 응답이 끊기지 않는\n짧은 입력 경험이 중요한 팀",
        },
      ],
      question:
        "폼 제작과 응답 분석을\n더 단순한 하나의 흐름으로 만들 수 있을까?",
      questionContext:
        "간단한 사용자 검증에도 폼 설정과 응답 정리에 시간이 많이 듭니다. 질문이 늘수록 완료율과 학습 품질이 함께 흔들립니다.",
      snapshot: {
        question: "폼 제작과 응답을 하나의 흐름으로 단순화할 수 있는가",
        method: "만들기 → 공유 → 응답 → 정리 → 학습",
        signal: "완료율, 응답 품질, 질문 구성",
        outcome: "검증 진행 중",
      },
      whyTitle: "문제를 이렇게 봅니다.",
      why: {
        problem:
          "간단한 사용자 검증에도\n폼 설정과 응답 정리에 시간이 많이 필요합니다.\n도구가 무거워지면 질문이 늘고, 학습은 늦어집니다.",
        hypothesis:
          "폼 제작과 응답 구조화를 최소화하면\n더 빠르게 사용자 의견을 수집할 수 있습니다.\n짧은 입력이 더 좋은 신호를 만들 수 있습니다.",
        experiment: "CREATE → SHARE → RESPOND → ORGANIZE → LEARN",
      },
      flowTitle: "신호로 바꾸는 흐름",
      flow: [
        { n: "01", label: "CREATE", desc: "최소 질문을 구성합니다." },
        { n: "02", label: "SHARE", desc: "링크로 바로 공유합니다." },
        { n: "03", label: "RESPOND", desc: "응답을 수집합니다." },
        { n: "04", label: "ORGANIZE", desc: "응답을 구조화합니다." },
        { n: "05", label: "LEARN", desc: "제품 인사이트로 연결합니다." },
      ],
      testingTitle: "지금 확인하고 있는 가설",
      testing: [
        {
          n: "01",
          title: "BUILD SPEED",
          desc: "폼을 충분히 빠르게 만들 수 있는가.\n설정 비용이 검증을 막지 않는가.",
        },
        {
          n: "02",
          title: "QUESTION SIMPLICITY",
          desc: "질문 구성이 단순한가.\n최소 필드만으로도 학습이 가능한가.",
        },
        {
          n: "03",
          title: "MOBILE RESPONSE",
          desc: "모바일 응답 경험이 자연스러운가.\n중간에 이탈하지 않는가.",
        },
        {
          n: "04",
          title: "INSIGHT CONNECTION",
          desc: "응답을 제품 인사이트로\n연결하는 방식이 명확한가.",
        },
      ],
      signalsTitle: "무엇을 보고 판단하는가",
      signals: [
        { type: "BEHAVIORAL", desc: "응답 완료와 이탈 지점" },
        { type: "QUALITATIVE", desc: "응답 내용의 명확성" },
        { type: "PRODUCT", desc: "최소 필드로 충분한지" },
        { type: "DECISION", desc: "백엔드·알림 범위" },
      ],
      outcomesTitle: "검증이 끝나면 남기고 싶은 것",
      outcomes: [
        {
          t: "MINIMAL FIELD SET",
          d: "검증에 충분한\n최소 질문·필드 세트",
        },
        {
          t: "SHARE → RESPOND LOOP",
          d: "만들고 바로 공유·응답까지\n끊기지 않는 짧은 루프",
        },
        {
          t: "RESPONSE STRUCTURE",
          d: "응답을 제품 학습으로 넘기는\n정리 방식",
        },
        {
          t: "NOTIFY SCOPE",
          d: "제출 알림·백엔드를\n어디까지 둘지 정하는 기준",
        },
      ],
      includes: [
        "Form Builder Lite",
        "Question Templates",
        "Share Link",
        "Mobile Response View",
        "Response Organize",
        "Learning Notes",
        "Notification Prototype",
        "Field Set Lock",
      ],
      nextTitle: "다음에 확인할 것",
      nextSteps: [
        {
          t: "필드 세트 고정",
          d: "프로토타입에 넣을\n최소 필드와 알림 채널을 잠급니다.",
        },
        {
          t: "제출 → 알림 프로토타입",
          d: "응답 제출 후 이메일 등\n알림 흐름을 시험합니다.",
        },
        {
          t: "모바일 완료율",
          d: "짧은 폼이 모바일에서\n실제로 끝까지 가는지 확인합니다.",
        },
        {
          t: "학습 연결 형식",
          d: "응답이 제품 노트로\n어떻게 남아야 하는지 형태를 잡습니다.",
        },
      ],
      faq: [
        {
          q: "일반 설문 도구를 대체하나요?",
          a: "아니요. 긴 설문 플랫폼이 아니라, 짧은 검증용 입력 흐름을 실험합니다.",
        },
        {
          q: "어떤 질문 유형을 지원하나요?",
          a: "실험 단계에서는 최소 필드 세트를 우선합니다. 유형을 늘리기보다 학습 품질을 먼저 봅니다.",
        },
        {
          q: "응답 분석 AI가 들어가나요?",
          a: "지금은 만들기·공유·정리 흐름이 중심입니다. 인사이트 연결은 이후 Review AI 등과 이어질 수 있습니다.",
        },
        {
          q: "유료 서비스인가요?",
          a: "Newon Labs 실험입니다. 검증 후 제품화 여부가 결정됩니다.",
        },
      ],
      seoDescription:
        "Newon Form — 질문 제작부터 응답 정리까지 짧은 입력 흐름을 실험하는 Newon Labs 유틸리티.",
    },
    en: {
      headline: "Spend less time building questions.\nSpend more time understanding answers.",
      heroLead:
        "Even simple validation forms get heavy.\nWhile you pick fields, share links, and sort responses,\nthe original question blurs.\n\nNewon Form does not pile on more form features.\nIt experiments with a short input flow —\nbuild light, share fast, and connect answers to product signals.\n\nLess building. More understanding.\nThat balance is the goal.",
      overviewTitle: "Keep input short.\nKeep learning clear.",
      overviewBody: [
        "Exploring a lightweight form experience — build fast, share fast, connect responses to product signals.",
        "The point is not more question types.\nIt is getting enough answers with a minimal field set —\nand passing those answers into product learning.",
        "Create → share → respond → organize → learn.\nWe test whether form building and response analysis can live in one simpler flow.",
      ],
      description:
        "Exploring a lightweight form experience — build fast, share fast, connect responses to product signals.",
      whoTitle: "Built for these teams.",
      who: [
        {
          t: "EARLY VALIDATION",
          d: "Want to ask about an idea or MVP quickly\nwithout spending time on form setup",
        },
        {
          t: "PRODUCT / UX",
          d: "Need short questions to test a hypothesis\nand fold answers into insight",
        },
        {
          t: "FOUNDERS",
          d: "Want to ask only what matters\nwithout a heavy survey stack",
        },
        {
          t: "INTERNAL OPS",
          d: "Need lightweight internal input collection\nwithout process theater",
        },
        {
          t: "LABS → LEARNING",
          d: "Validating other Labs hypotheses\nwith short structured input",
        },
        {
          t: "MOBILE FIRST",
          d: "Need response experiences that hold up\non mobile without drop-off",
        },
      ],
      question:
        "Can form building and response analysis\nlive in one simpler flow?",
      questionContext:
        "Even simple user validation takes too long to set up forms and sort responses. As questions grow, completion and learning quality both wobble.",
      snapshot: {
        question: "Can form create and response live in one simpler flow?",
        method: "Create → share → respond → organize → learn",
        signal: "Completion, response quality, question design",
        outcome: "Validation in progress",
      },
      whyTitle: "How we frame the problem.",
      why: {
        problem:
          "Simple user validation still costs a lot of time\nin form setup and response sorting.\nHeavier tools invite more questions — and slower learning.",
        hypothesis:
          "Minimizing form build and response structure helps collect user input faster.\nShorter input can produce clearer signals.",
        experiment: "CREATE → SHARE → RESPOND → ORGANIZE → LEARN",
      },
      flowTitle: "The flow that turns answers into signal",
      flow: [
        { n: "01", label: "CREATE", desc: "Compose a minimal question set." },
        { n: "02", label: "SHARE", desc: "Share via link immediately." },
        { n: "03", label: "RESPOND", desc: "Collect responses." },
        { n: "04", label: "ORGANIZE", desc: "Structure what came back." },
        { n: "05", label: "LEARN", desc: "Connect to product insight." },
      ],
      testingTitle: "Hypotheses under test",
      testing: [
        {
          n: "01",
          title: "BUILD SPEED",
          desc: "Can a form be created fast enough?\nDoes setup cost block validation?",
        },
        {
          n: "02",
          title: "QUESTION SIMPLICITY",
          desc: "Is the question set minimal enough?\nCan learning happen with few fields?",
        },
        {
          n: "03",
          title: "MOBILE RESPONSE",
          desc: "Does mobile response feel natural?\nDo people finish without dropping off?",
        },
        {
          n: "04",
          title: "INSIGHT CONNECTION",
          desc: "Is the path from responses\nto product insight clear?",
        },
      ],
      signalsTitle: "Signals we watch",
      signals: [
        { type: "BEHAVIORAL", desc: "Completion and drop-off points" },
        { type: "QUALITATIVE", desc: "Clarity of response content" },
        { type: "PRODUCT", desc: "Whether minimal fields are enough" },
        { type: "DECISION", desc: "Backend and notification scope" },
      ],
      outcomesTitle: "What we want to leave with",
      outcomes: [
        {
          t: "MINIMAL FIELD SET",
          d: "A field set that is enough\nfor real validation",
        },
        {
          t: "SHARE → RESPOND LOOP",
          d: "A short unbroken loop\nfrom create to share to response",
        },
        {
          t: "RESPONSE STRUCTURE",
          d: "A way to pass responses\ninto product learning",
        },
        {
          t: "NOTIFY SCOPE",
          d: "Criteria for how far\nsubmit notifications and backend should go",
        },
      ],
      includes: [
        "Form Builder Lite",
        "Question Templates",
        "Share Link",
        "Mobile Response View",
        "Response Organize",
        "Learning Notes",
        "Notification Prototype",
        "Field Set Lock",
      ],
      nextTitle: "What comes next",
      nextSteps: [
        {
          t: "Lock the field set",
          d: "Freeze the minimum fields\nand notification channels for the prototype.",
        },
        {
          t: "Prototype submit → notify",
          d: "Test the flow from submit\nto email or other notification.",
        },
        {
          t: "Mobile completion",
          d: "Check whether short forms\nactually finish on mobile.",
        },
        {
          t: "Learning format",
          d: "Define how responses should remain\nas product notes.",
        },
      ],
      faq: [
        {
          q: "Does this replace survey platforms?",
          a: "No. It is not a long-form survey platform — it experiments with a short validation input flow.",
        },
        {
          q: "Which question types are supported?",
          a: "In the experiment phase we prioritize a minimal field set. Learning quality comes before adding types.",
        },
        {
          q: "Is there AI response analysis?",
          a: "The focus now is create → share → organize. Insight connection may later join experiments like Review AI.",
        },
        {
          q: "Is this a paid product?",
          a: "It is a Newon Labs experiment. Productization depends on validation.",
        },
      ],
      seoDescription:
        "Newon Form — a short input flow from building questions to organizing answers. A Newon Labs utility experiment.",
    },
  },

  "ai-experiment": {
    categoryKo: "AI · DISCOVERY",
    categoryEn: "AI · DISCOVERY",
    ko: {
      headline: "AI가 답을 만드는 것을 넘어,\n만들 가치가 있는 문제를 찾을 수 있을까?",
      heroLead:
        "아이디어는 많습니다.\nAI를 붙이고 싶은 자리도 많습니다.\n\n하지만 실제로 해결할 가치가 있는 문제인지,\nAI가 더 나은 해결인지,\n프로토타입으로 갈 만큼 강한 신호인지는\n따로 물어야 합니다.\n\nAI Discovery는 답을 생성하는 AI가 아닙니다.\n시장 신호와 사용자 문제를 구조화해\n만들 가치가 있는 기회를 찾는 탐색 실험입니다.",
      overviewTitle: "무엇을 만들 것인가를\n더 체계적으로.",
      overviewBody: [
        "시장 신호와 사용자 문제를 분석해\n새로운 제품 기회를 발견하는 AI 기반 탐색 실험입니다.",
        "핵심은 더 많은 아이디어를 뽑는 일이 아닙니다.\n문제 빈도, 대안, AI 적합성을 비교해\n남길 후보와 버릴 후보를 가르는 일입니다.",
        "문제 → 신호 → 패턴 → AI fit → 기회.\n제품 탐색 과정 자체를 체계화할 수 있는지 검증합니다.",
      ],
      description:
        "시장 신호와 사용자 문제를 분석해\n새로운 제품 기회를 발견하는 AI 기반 탐색 실험입니다.",
      whoTitle: "이런 팀에게 필요합니다.",
      who: [
        {
          t: "VENTURE / LABS",
          d: "여러 제품 후보를 비교하지만\n무엇을 남길지 기준이 흐린 팀",
        },
        {
          t: "FOUNDERS",
          d: "AI를 붙이고 싶지만\n문제가 AI에 맞는지부터 확인하고 싶은 경우",
        },
        {
          t: "PRODUCT STRATEGY",
          d: "아이디어 목록은 있는데\n우선순위와 탈락 기준이 없는 팀",
        },
        {
          t: "RESEARCH → BUILD",
          d: "리서치 신호를 프로토타입 범위로\n좁히고 싶은 팀",
        },
        {
          t: "MULTI-SIGNAL INPUT",
          d: "리뷰, 폼, 시장 메모 등\n여러 입력을 한 보드에서 보고 싶은 경우",
        },
        {
          t: "BEFORE PROTOTYPE",
          d: "만들기 전에\nAI fit과 기회 크기를 먼저 가르고 싶은 팀",
        },
      ],
      question:
        "AI를 이용해 \"무엇을 만들 것인가\"라는\n제품 탐색 과정 자체를 더 체계적으로 만들 수 있을까?",
      questionContext:
        "아이디어는 많지만, 실제로 해결할 가치가 있는 문제인지 판단하기 어렵습니다. AI를 붙이는 것과 문제를 찾는 것은 다른 일입니다.",
      snapshot: {
        question: "제품 탐색 과정을 AI로 체계화할 수 있는가",
        method: "문제 → 신호 → 패턴 → AI fit → 기회",
        signal: "문제 빈도, 대안, AI 적합성",
        outcome: "검증 진행 중",
      },
      whyTitle: "문제를 이렇게 봅니다.",
      why: {
        problem:
          "제품 아이디어는 많지만\n실제로 해결할 가치가 있는 문제인지 판단하기 어렵습니다.\nAI 가능성과 문제 가치가 섞여 버립니다.",
        hypothesis:
          "여러 시장 신호와 문제 패턴을 구조화하면\n제품 후보를 더 체계적으로 비교할 수 있습니다.\nAI fit을 별도로 보면 잘못된 빌드를 줄일 수 있습니다.",
        experiment: "PROBLEM → SIGNAL → PATTERN → AI FIT → OPPORTUNITY → PROTOTYPE",
      },
      flowTitle: "신호로 바꾸는 흐름",
      flow: [
        { n: "01", label: "PROBLEM", desc: "반복되는 사용자 문제를 모읍니다." },
        { n: "02", label: "SIGNAL", desc: "수요와 행동 신호를 확인합니다." },
        { n: "03", label: "PATTERN", desc: "문제 패턴을 클러스터로 묶습니다." },
        { n: "04", label: "AI FIT", desc: "AI가 더 나은 해결인지 판단합니다." },
        { n: "05", label: "OPPORTUNITY", desc: "제품 기회 후보와 최소 실험 범위를 정합니다." },
      ],
      testingTitle: "지금 확인하고 있는 가설",
      testing: [
        {
          n: "01",
          title: "PROBLEM SIGNAL",
          desc: "문제 신호를 제대로 포착하는가.\n노이즈와 반복 문제를 가를 수 있는가.",
        },
        {
          n: "02",
          title: "OPPORTUNITY CLUSTER",
          desc: "기회를 클러스터링할 수 있는가.\n비슷한 후보를 하나로 볼 수 있는가.",
        },
        {
          n: "03",
          title: "AI SUITABILITY",
          desc: "AI fit 판단이 유용한가.\n비-AI 대안과 비교가 되는가.",
        },
        {
          n: "04",
          title: "PROTOTYPE PRIORITY",
          desc: "프로토타입 우선순위를 정할 수 있는가.\n유지 / 프로토 / 패스가 가능한가.",
        },
      ],
      signalsTitle: "무엇을 보고 판단하는가",
      signals: [
        { type: "QUALITATIVE", desc: "문제 정의의 명확성" },
        { type: "BEHAVIORAL", desc: "문제 빈도와 대안 존재" },
        { type: "PRODUCT", desc: "AI fit vs 비-AI 대안" },
        { type: "DECISION", desc: "연구 유지 / 프로토 / 패스" },
      ],
      outcomesTitle: "검증이 끝나면 남기고 싶은 것",
      outcomes: [
        {
          t: "DISCOVERY BOARD",
          d: "문제·신호·기회를 한눈에 비교하는\n탐색 보드",
        },
        {
          t: "AI FIT LENS",
          d: "AI가 필요한 문제와\n아닌 문제를 가르는 렌즈",
        },
        {
          t: "KEEP / CUT RULE",
          d: "후보를 유지·축소·탈락시키는\n판단 기준",
        },
        {
          t: "PROTOTYPE SCOPE",
          d: "1–2개 시나리오로 좁힌\n최소 실험 범위",
        },
      ],
      includes: [
        "Problem Intake",
        "Market Signal Notes",
        "Pattern Clusters",
        "AI Fit Check",
        "Opportunity Board",
        "Prototype Scope Sheet",
        "Keep / Cut Rules",
        "Scenario Narrowing",
      ],
      nextTitle: "다음에 확인할 것",
      nextSteps: [
        {
          t: "후보 Keep / Cut",
          d: "리뷰 인텔리전스 외 후보 하나를\n유지할지 자를지 결정합니다.",
        },
        {
          t: "시나리오 축소",
          d: "1–2개 시나리오로 좁히고\n프로토타입 범위를 정의합니다.",
        },
        {
          t: "AI fit 기준 고정",
          d: "어떤 조건이면 AI가 더 나은 해결인지\n체크리스트로 고정합니다.",
        },
        {
          t: "입력 소스 연결",
          d: "Review AI·Form 신호를\n탐색 보드 입력으로 연결할지 시험합니다.",
        },
      ],
      faq: [
        {
          q: "아이디어를 자동으로 생성해주나요?",
          a: "아닙니다. 답을 만드는 AI가 아니라, 만들 가치가 있는 문제를 구조적으로 찾는 실험입니다.",
        },
        {
          q: "시장조사 서비스를 대체하나요?",
          a: "아니요. Labs 탐색 보드입니다. 깊은 시장·소비자 조사는 Business Research와 별개입니다.",
        },
        {
          q: "지금 어떤 단계인가요?",
          a: "신호 수집·후보 비교 단계입니다. 확정된 제품 로드맵이나 성과 수치는 없습니다.",
        },
        {
          q: "다른 실험과 어떻게 연결되나요?",
          a: "Review AI·Form에서 나온 문제 신호가 이 보드의 입력 후보가 될 수 있습니다.",
        },
      ],
      seoDescription:
        "AI Discovery — 만들 가치가 있는 문제를 찾는 Newon Labs AI 탐색 실험.",
    },
    en: {
      headline: "Beyond AI that generates answers —\ncan AI find problems worth building?",
      heroLead:
        "Ideas are plentiful.\nPlaces to attach AI are plentiful too.\n\nBut whether a problem is worth solving,\nwhether AI is the better solution,\nand whether the signal is strong enough to prototype\nhave to be asked separately.\n\nAI Discovery is not an answer-generating AI.\nIt is an exploration experiment that structures market signals and user problems\nto find opportunities worth building.",
      overviewTitle: "Make “what should we build?”\nmore systematic.",
      overviewBody: [
        "An AI-assisted exploration experiment that analyzes market signals and user problems to surface new product opportunities.",
        "The point is not generating more ideas.\nIt is comparing problem frequency, alternatives, and AI fit —\nand separating keepers from cuts.",
        "Problem → signal → pattern → AI fit → opportunity.\nWe test whether product exploration itself can be systematized.",
      ],
      description:
        "An AI-assisted exploration experiment that analyzes market signals and user problems to surface new product opportunities.",
      whoTitle: "Built for these teams.",
      who: [
        {
          t: "VENTURE / LABS",
          d: "Comparing many product candidates\nwithout clear keep/cut criteria",
        },
        {
          t: "FOUNDERS",
          d: "Want AI in the product —\nbut need to check whether the problem fits AI first",
        },
        {
          t: "PRODUCT STRATEGY",
          d: "Have idea lists\nwithout priority or kill criteria",
        },
        {
          t: "RESEARCH → BUILD",
          d: "Need to narrow research signals\ninto prototype scope",
        },
        {
          t: "MULTI-SIGNAL INPUT",
          d: "Want reviews, forms, and market notes\non one discovery board",
        },
        {
          t: "BEFORE PROTOTYPE",
          d: "Want to separate AI fit and opportunity size\nbefore building",
        },
      ],
      question:
        "Can AI make the \"what should we build?\"\nexploration process more systematic?",
      questionContext:
        "There are many ideas, but it is hard to judge which problems are worth solving. Attaching AI and finding the right problem are different jobs.",
      snapshot: {
        question: "Can product exploration be more systematic with AI?",
        method: "Problem → signal → pattern → AI fit → opportunity",
        signal: "Problem frequency, alternatives, AI suitability",
        outcome: "Validation in progress",
      },
      whyTitle: "How we frame the problem.",
      why: {
        problem:
          "Many product ideas — hard to tell which problems are actually worth solving.\nAI possibility and problem value get mixed together.",
        hypothesis:
          "Structuring market signals and problem patterns helps compare product candidates more systematically.\nSeparating AI fit can reduce the wrong builds.",
        experiment: "PROBLEM → SIGNAL → PATTERN → AI FIT → OPPORTUNITY → PROTOTYPE",
      },
      flowTitle: "The flow that turns problems into opportunities",
      flow: [
        { n: "01", label: "PROBLEM", desc: "Collect recurring user problems." },
        { n: "02", label: "SIGNAL", desc: "Check demand and behavior signals." },
        { n: "03", label: "PATTERN", desc: "Cluster problems into patterns." },
        { n: "04", label: "AI FIT", desc: "Judge whether AI is a better solution." },
        { n: "05", label: "OPPORTUNITY", desc: "Name candidates and minimum experiment scope." },
      ],
      testingTitle: "Hypotheses under test",
      testing: [
        {
          n: "01",
          title: "PROBLEM SIGNAL",
          desc: "Can we capture the right problem signals?\nCan we separate noise from repetition?",
        },
        {
          n: "02",
          title: "OPPORTUNITY CLUSTER",
          desc: "Can opportunities be clustered?\nCan similar candidates be seen as one?",
        },
        {
          n: "03",
          title: "AI SUITABILITY",
          desc: "Is AI fit scoring useful?\nDoes it compare cleanly to non-AI alternatives?",
        },
        {
          n: "04",
          title: "PROTOTYPE PRIORITY",
          desc: "Can we prioritize prototypes?\nKeep / prototype / pass — is it workable?",
        },
      ],
      signalsTitle: "Signals we watch",
      signals: [
        { type: "QUALITATIVE", desc: "Clarity of problem definition" },
        { type: "BEHAVIORAL", desc: "Problem frequency and alternatives" },
        { type: "PRODUCT", desc: "AI fit vs non-AI alternatives" },
        { type: "DECISION", desc: "Research / prototype / pass" },
      ],
      outcomesTitle: "What we want to leave with",
      outcomes: [
        {
          t: "DISCOVERY BOARD",
          d: "A board to compare problems,\nsignals, and opportunities together",
        },
        {
          t: "AI FIT LENS",
          d: "A lens that separates problems\nthat need AI from those that do not",
        },
        {
          t: "KEEP / CUT RULE",
          d: "Criteria to keep, shrink, or kill candidates",
        },
        {
          t: "PROTOTYPE SCOPE",
          d: "Minimum experiment scope\nnarrowed to 1–2 scenarios",
        },
      ],
      includes: [
        "Problem Intake",
        "Market Signal Notes",
        "Pattern Clusters",
        "AI Fit Check",
        "Opportunity Board",
        "Prototype Scope Sheet",
        "Keep / Cut Rules",
        "Scenario Narrowing",
      ],
      nextTitle: "What comes next",
      nextSteps: [
        {
          t: "Keep or cut a candidate",
          d: "Decide whether one non–review-intelligence candidate\nstays on the board.",
        },
        {
          t: "Narrow scenarios",
          d: "Reduce to 1–2 scenarios\nand define prototype scope.",
        },
        {
          t: "Lock AI fit criteria",
          d: "Freeze a checklist for when AI\nis the better solution.",
        },
        {
          t: "Connect input sources",
          d: "Test whether Review AI and Form signals\ncan feed the discovery board.",
        },
      ],
      faq: [
        {
          q: "Does this auto-generate product ideas?",
          a: "No. It is not an answer generator — it structures the search for problems worth building.",
        },
        {
          q: "Does this replace market research services?",
          a: "No. It is a Labs discovery board. Deeper market or consumer research sits with Business Research.",
        },
        {
          q: "What stage is this in?",
          a: "Signal collection and candidate comparison. There is no locked product roadmap or invented performance metrics.",
        },
        {
          q: "How does it connect to other experiments?",
          a: "Problem signals from Review AI and Form can become inputs on this board.",
        },
      ],
      seoDescription:
        "AI Discovery — finding problems worth building. A Newon Labs AI exploration experiment.",
    },
  },

  "game-experiment": {
    categoryKo: "GAME · INTERACTION",
    categoryEn: "GAME · INTERACTION",
    ko: {
      headline: "선택을 기억하는 게임은\n플레이어를 더 긴장하게 만들 수 있을까?",
      heroLead:
        "선택형 게임에서 버튼은 많지만,\n이전 선택이 결과에 남지 않으면\n선택의 무게는 약해집니다.\n\nGame Experiment는 화려한 콘텐츠 양보다\n기억과 결과에 집중합니다.\n플레이어의 선택과 행동을 기록하고,\n이후 상황에서 다시 참조해\n결과가 바뀌는 짧은 세션 시스템을 실험합니다.\n\n선택이 기억될 때,\n긴장감은 어떻게 달라지는가.",
      overviewTitle: "선택이 남는 게임,\n긴장감이 남는 플레이.",
      overviewBody: [
        "플레이어의 선택과 행동을 기억하고,\n그 기록이 이후 상황과 결과에 영향을 주는 게임 시스템을 실험합니다.",
        "핵심은 더 긴 스토리가 아닙니다.\n짧은 세션 안에서도\n선택 → 기억 → 참조 → 결과가 느껴지는지입니다.",
        "모순, 재플레이, 선택의 무게.\n기억하는 시스템이 몰입을 만드는지 검증합니다.",
      ],
      description:
        "플레이어의 선택과 행동을 기억하고,\n그 기록이 이후 상황과 결과에 영향을 주는 게임 시스템을 실험합니다.",
      whoTitle: "이런 팀에게 필요합니다.",
      who: [
        {
          t: "INTERACTIVE NARRATIVE",
          d: "선택형 스토리에서\n이전 결정이 실제로 남길 원하는 팀",
        },
        {
          t: "WEB GAME LAB",
          d: "짧은 웹 세션으로\n상호작용 가설을 빠르게 보고 싶은 팀",
        },
        {
          t: "PRODUCT / UX",
          d: "선택의 무게감이\n참여와 재방문을 바꾸는지 보고 싶은 팀",
        },
        {
          t: "CONTENT SYSTEMS",
          d: "콘텐츠 양보다\n시스템 규칙으로 긴장감을 만들고 싶은 경우",
        },
        {
          t: "IP × PLAY",
          d: "캐릭터·세계관과 연결된\n플레이 실험을 준비하는 팀",
        },
        {
          t: "BEFORE FULL BUILD",
          d: "큰 게임 제작 전에\n기억-결과 루프만 먼저 검증하고 싶은 경우",
        },
      ],
      question:
        "게임이 플레이어의 이전 행동을 기억하면\n선택의 긴장감과 몰입도가 높아질까?",
      questionContext:
        "선택형 게임에서 이전 선택이 실제로 영향을 주지 않으면 선택의 무게가 약해집니다. 기억 없는 선택은 장식에 가깝습니다.",
      snapshot: {
        question: "기억하는 선택이 긴장감을 높이는가",
        method: "선택 → 기억 → 참조 → 결과",
        signal: "재플레이, 모순 반응, 선택 무게",
        outcome: "검증 진행 중",
      },
      whyTitle: "문제를 이렇게 봅니다.",
      why: {
        problem:
          "선택형 게임에서 이전 선택이 실제로 영향을 주지 않으면\n선택의 무게가 약해집니다.\n플레이어는 고르지만, 기억하지 않습니다.",
        hypothesis:
          "게임이 행동을 기억하고 이후 상황에서 다시 참조한다면\n플레이어는 자신의 선택을 더 신중하게 생각하게 됩니다.\n짧은 세션에서도 긴장감이 생길 수 있습니다.",
        experiment: "CHOICE → MEMORY → REFERENCE → CONSEQUENCE",
      },
      flowTitle: "신호로 바꾸는 흐름",
      flow: [
        { n: "01", label: "CHOICE", desc: "플레이어가 결정합니다." },
        { n: "02", label: "MEMORY", desc: "시스템이 선택을 기록합니다." },
        { n: "03", label: "REFERENCE", desc: "이후 상황에서 다시 언급합니다." },
        { n: "04", label: "CONSEQUENCE", desc: "결과에 영향을 줍니다." },
      ],
      testingTitle: "지금 확인하고 있는 가설",
      testing: [
        {
          n: "01",
          title: "CHOICE WEIGHT",
          desc: "선택이 실제로 중요하다고 느껴지는가.\n고르기 전에 망설임이 생기는가.",
        },
        {
          n: "02",
          title: "MEMORY CALLBACKS",
          desc: "이전 행동 참조가 몰입을 높이는가.\n단순한 리마인드가 아닌가.",
        },
        {
          n: "03",
          title: "CONTRADICTION",
          desc: "이전 선택과 모순될 때\n긴장감이 생기는가.",
        },
        {
          n: "04",
          title: "REPLAY VARIATION",
          desc: "다시 플레이하고 싶어지는가.\n다른 선택이 다른 결과를 남기는가.",
        },
      ],
      signalsTitle: "무엇을 보고 판단하는가",
      signals: [
        { type: "BEHAVIORAL", desc: "재플레이와 선택 패턴" },
        { type: "QUALITATIVE", desc: "선택의 무게감" },
        { type: "PRODUCT", desc: "짧은 세션에서 작동하는가" },
        { type: "DECISION", desc: "마이크로 프로토타입 방향" },
      ],
      outcomesTitle: "검증이 끝나면 남기고 싶은 것",
      outcomes: [
        {
          t: "MEMORY LOOP",
          d: "선택 → 기억 → 참조 → 결과가\n한 세션에서 닫히는 루프",
        },
        {
          t: "TENSION DESIGN",
          d: "선택 전 긴장감을 만드는\n최소 디자인 규칙",
        },
        {
          t: "REPLAY HOOK",
          d: "다른 선택을 유도하는\n재플레이 훅",
        },
        {
          t: "MICRO PROTOTYPE",
          d: "큰 콘텐츠 없이 검증 가능한\n플레이어블 마이크로 프로토타입",
        },
      ],
      includes: [
        "Choice Nodes",
        "Memory Store",
        "Callback Lines",
        "Contradiction Beats",
        "Consequence Branches",
        "Short Session Shell",
        "Replay Hook",
        "Playtest Notes",
      ],
      nextTitle: "다음에 확인할 것",
      nextSteps: [
        {
          t: "플레이어블 마이크로 프로토타입",
          d: "한 세션 안에서 돌릴 수 있는\n최소 플레이 버전을 만듭니다.",
        },
        {
          t: "기억 → 모순 → 재플레이 연결",
          d: "세 요소를 하나의 세션 흐름으로\n붙입니다.",
        },
        {
          t: "짧은 세션 플레이테스트",
          d: "선택 무게와 재플레이 의향을\n관찰합니다.",
        },
        {
          t: "IP 연결 가능성",
          d: "Character Lab 세계관과\n붙일 여지가 있는지 검토합니다.",
        },
      ],
      faq: [
        {
          q: "완성된 게임을 출시하나요?",
          a: "아니요. 선택·기억·결과 루프를 검증하는 Labs 실험입니다. 출시형 타이틀을 약속하지 않습니다.",
        },
        {
          q: "긴 스토리 게임이 필요한가요?",
          a: "아닙니다. 짧은 세션에서도 루프가 느껴지는지가 핵심입니다.",
        },
        {
          q: "멀티플레이인가요?",
          a: "현재 초점은 단일 플레이어의 선택과 기억입니다.",
        },
        {
          q: "다른 Labs와 연결되나요?",
          a: "Character Lab의 IP·세계관과 붙일 가능성, AI Discovery의 상호작용 가설과 이어질 수 있습니다.",
        },
      ],
      seoDescription:
        "Game Experiment — 선택, 기억, 결과가 짧은 세션에서 작동하는지 검증하는 Newon Labs 실험.",
    },
    en: {
      headline: "Can a game that remembers choice\nmake players more tense?",
      heroLead:
        "Choice games offer many buttons.\nBut if past choices do not stay in the outcome,\ndecisions feel light.\n\nGame Experiment focuses on memory and consequence\nmore than content volume.\nIt records player choices and actions,\nreferences them later,\nand tests a short-session system where outcomes shift.\n\nWhen choice is remembered,\nhow does tension change?",
      overviewTitle: "A game that keeps choices.\nPlay that keeps tension.",
      overviewBody: [
        "An experiment in game systems that remember player choices and actions — and let that record shape later situations and outcomes.",
        "The point is not a longer story.\nIt is whether choice → memory → reference → consequence\ncan be felt inside a short session.",
        "Contradiction, replay, weight of choice.\nWe test whether a remembering system creates immersion.",
      ],
      description:
        "An experiment in game systems that remember player choices and actions — and let that record shape later situations and outcomes.",
      whoTitle: "Built for these teams.",
      who: [
        {
          t: "INTERACTIVE NARRATIVE",
          d: "Want past decisions to actually remain\nin choice-driven stories",
        },
        {
          t: "WEB GAME LAB",
          d: "Need short web sessions\nto test interaction hypotheses quickly",
        },
        {
          t: "PRODUCT / UX",
          d: "Want to see whether choice weight\nchanges engagement and return",
        },
        {
          t: "CONTENT SYSTEMS",
          d: "Prefer system rules for tension\nover raw content volume",
        },
        {
          t: "IP × PLAY",
          d: "Preparing play experiments\ntied to character or world IP",
        },
        {
          t: "BEFORE FULL BUILD",
          d: "Want to validate the memory–consequence loop\nbefore a large game build",
        },
      ],
      question:
        "If a game remembers prior player behavior,\ndoes choice feel heavier and more immersive?",
      questionContext:
        "In choice-driven games, when past choices do not matter, decisions feel weightless. Choice without memory is decoration.",
      snapshot: {
        question: "Does remembered choice increase tension?",
        method: "Choice → memory → reference → consequence",
        signal: "Replay, contradiction response, choice weight",
        outcome: "Validation in progress",
      },
      whyTitle: "How we frame the problem.",
      why: {
        problem:
          "When past choices do not actually affect outcomes, decisions feel weightless.\nPlayers pick — but the game does not remember.",
        hypothesis:
          "If the game remembers behavior and references it later, players think more carefully about each choice.\nTension can appear even in short sessions.",
        experiment: "CHOICE → MEMORY → REFERENCE → CONSEQUENCE",
      },
      flowTitle: "The flow that turns choice into signal",
      flow: [
        { n: "01", label: "CHOICE", desc: "The player decides." },
        { n: "02", label: "MEMORY", desc: "The system stores the choice." },
        { n: "03", label: "REFERENCE", desc: "It is mentioned again later." },
        { n: "04", label: "CONSEQUENCE", desc: "The outcome shifts." },
      ],
      testingTitle: "Hypotheses under test",
      testing: [
        {
          n: "01",
          title: "CHOICE WEIGHT",
          desc: "Do players feel choices matter?\nIs there hesitation before picking?",
        },
        {
          n: "02",
          title: "MEMORY CALLBACKS",
          desc: "Do memory callbacks deepen immersion —\nor feel like simple reminders?",
        },
        {
          n: "03",
          title: "CONTRADICTION",
          desc: "Does contradiction with a past choice\ncreate tension?",
        },
        {
          n: "04",
          title: "REPLAY VARIATION",
          desc: "Do players want to replay?\nDo different choices leave different outcomes?",
        },
      ],
      signalsTitle: "Signals we watch",
      signals: [
        { type: "BEHAVIORAL", desc: "Replay and choice patterns" },
        { type: "QUALITATIVE", desc: "Felt weight of decisions" },
        { type: "PRODUCT", desc: "Works in short sessions" },
        { type: "DECISION", desc: "Micro-prototype direction" },
      ],
      outcomesTitle: "What we want to leave with",
      outcomes: [
        {
          t: "MEMORY LOOP",
          d: "A loop that closes in one session:\nchoice → memory → reference → consequence",
        },
        {
          t: "TENSION DESIGN",
          d: "Minimum design rules\nthat create pre-choice tension",
        },
        {
          t: "REPLAY HOOK",
          d: "A replay hook that invites\na different choice",
        },
        {
          t: "MICRO PROTOTYPE",
          d: "A playable micro-prototype\nthat validates without heavy content",
        },
      ],
      includes: [
        "Choice Nodes",
        "Memory Store",
        "Callback Lines",
        "Contradiction Beats",
        "Consequence Branches",
        "Short Session Shell",
        "Replay Hook",
        "Playtest Notes",
      ],
      nextTitle: "What comes next",
      nextSteps: [
        {
          t: "One playable micro-prototype",
          d: "Build a minimum playable version\nthat runs inside one session.",
        },
        {
          t: "Connect memory → contradiction → replay",
          d: "Attach the three elements\ninto one session flow.",
        },
        {
          t: "Short-session playtest",
          d: "Observe choice weight\nand replay intent.",
        },
        {
          t: "IP connection",
          d: "Review whether Character Lab worlds\ncan attach to the loop.",
        },
      ],
      faq: [
        {
          q: "Are you shipping a finished game?",
          a: "No. This is a Labs experiment on choice, memory, and consequence — not a promised commercial title.",
        },
        {
          q: "Do you need a long story game?",
          a: "No. The core question is whether the loop can be felt in a short session.",
        },
        {
          q: "Is this multiplayer?",
          a: "The current focus is a single player’s choices and memory.",
        },
        {
          q: "Does it connect to other Labs work?",
          a: "It may connect to Character Lab IP/worlds, and to interaction hypotheses from AI Discovery.",
        },
      ],
      seoDescription:
        "Game Experiment — testing whether choice, memory, and consequence work in short sessions. A Newon Labs experiment.",
    },
  },

  "character-lab": {
    categoryKo: "IP · CHARACTER",
    categoryEn: "IP · CHARACTER",
    ko: {
      headline: "캐릭터 하나가 아니라,\n확장 가능한 IP 시스템을 만들 수 있을까?",
      heroLead:
        "캐릭터는 그림 한 장으로 끝나기 쉽습니다.\n표정, 포즈, 성격, 세계관, 사용 규칙이 없으면\n제품·콘텐츠·굿즈로 갈수록 흔들립니다.\n\nCharacter Lab은 마스코트 한 점을 그리는 실험이 아닙니다.\n정체성 → 형태 → 표현 → 세계 → 적용까지\n재사용 가능한 IP 시스템으로 묶는지를 봅니다.\n\n한 번 만든 캐릭터가\n여러 접점에서 같은 존재로 남을 수 있는가.",
      overviewTitle: "외형이 아니라,\n확장 규칙을 만듭니다.",
      overviewBody: [
        "캐릭터의 외형만 디자인하는 것이 아니라\n표정, 포즈, 성격, 세계관과 활용 규칙까지\n하나의 일관된 시스템으로 만드는 실험입니다.",
        "핵심은 예쁜 일러스트가 아닙니다.\n다른 매체에서도 같은 캐릭터로 인식되고,\n팀이 같은 규칙으로 확장할 수 있는지입니다.",
        "IDENTITY → FORM → EXPRESSION → WORLD → APPLICATION.\n확장 가능한 IP 기준을 남길 수 있는지 검증합니다.",
      ],
      description:
        "캐릭터의 외형만 디자인하는 것이 아니라\n표정, 포즈, 성격, 세계관과 활용 규칙까지\n하나의 일관된 시스템으로 만드는 실험입니다.",
      whoTitle: "이런 팀에게 필요합니다.",
      who: [
        {
          t: "BRAND IP",
          d: "마스코트는 있지만\n확장 규칙이 없는 브랜드·제품 팀",
        },
        {
          t: "CONTENT / SOCIAL",
          d: "채널마다 캐릭터 톤이 달라져\n일관성을 되찾고 싶은 팀",
        },
        {
          t: "PRODUCT + CHARACTER",
          d: "앱·웹·굿즈에 같은 캐릭터를\n붙이려는 팀",
        },
        {
          t: "STUDIO → IP",
          d: "단발 일러스트를\nIP 시스템으로 올리고 싶은 경우",
        },
        {
          t: "GAME / PLAY",
          d: "플레이 실험과 연결될\n캐릭터·세계관 기반이 필요한 팀",
        },
        {
          t: "BEFORE PUBLIC RELEASE",
          d: "공개 전에 내부 가이드와\n인식 가능성을 먼저 보고 싶은 경우",
        },
      ],
      question:
        "하나의 캐릭터를 제품, 콘텐츠, 굿즈와 브랜드로 확장할 수 있는\n재사용 가능한 IP 시스템으로 만들 수 있을까?",
      questionContext:
        "캐릭터를 만들어도 다른 매체에서 일관되게 확장하기 어렵습니다. 외형만 있으면 시스템은 아닙니다.",
      snapshot: {
        question: "확장 가능한 IP 시스템을 만들 수 있는가",
        method: "정체성 → 형태 → 표현 → 세계 → 적용",
        signal: "일관성, 인식 가능성, 확장성",
        outcome: "검증 진행 중",
      },
      whyTitle: "문제를 이렇게 봅니다.",
      why: {
        problem:
          "캐릭터 디자인은 만들어도\n다른 콘텐츠와 제품에서 일관되게 확장하기 어렵습니다.\n채널마다 다른 캐릭터가 됩니다.",
        hypothesis:
          "캐릭터의 시각적 규칙과 성격, 표현 체계를 먼저 시스템화하면\n다양한 매체에서도 일관성을 유지할 수 있습니다.\n가이드가 확장 속도를 만듭니다.",
        experiment: "IDENTITY → FORM → EXPRESSION → WORLD → APPLICATION → IP",
      },
      flowTitle: "신호로 바꾸는 흐름",
      flow: [
        { n: "01", label: "IDENTITY", desc: "캐릭터 정체성과 성격을 정의합니다." },
        { n: "02", label: "FORM", desc: "실루엣과 비율 규칙을 잡습니다." },
        { n: "03", label: "EXPRESSION", desc: "표정·포즈 체계를 만듭니다." },
        { n: "04", label: "WORLD", desc: "세계관과 사용 경계를 정합니다." },
        { n: "05", label: "APPLICATION", desc: "제품·콘텐츠 적용으로 확장성을 확인합니다." },
      ],
      testingTitle: "지금 확인하고 있는 가설",
      testing: [
        {
          n: "01",
          title: "VISUAL CONSISTENCY",
          desc: "시각적 일관성이 유지되는가.\n다른 장면에서도 같은 존재인가.",
        },
        {
          n: "02",
          title: "EXPRESSION SYSTEM",
          desc: "표정 시스템이 실제로 쓰이는가.\n팀이 같은 규칙으로 그릴 수 있는가.",
        },
        {
          n: "03",
          title: "RECOGNIZABILITY",
          desc: "캐릭터 인식 가능성이 높은가.\n실루엣만으로도 구분되는가.",
        },
        {
          n: "04",
          title: "CROSS-MEDIA",
          desc: "매체 간 적용이 가능한가.\n웹, 앱, 굿즈에서 깨지지 않는가.",
        },
      ],
      signalsTitle: "무엇을 보고 판단하는가",
      signals: [
        { type: "QUALITATIVE", desc: "가이드라인 준수 가능성" },
        { type: "PRODUCT", desc: "Newon 브랜드와의 정합" },
        { type: "BEHAVIORAL", desc: "내부 리뷰 반응" },
        { type: "DECISION", desc: "공개 여부" },
      ],
      outcomesTitle: "검증이 끝나면 남기고 싶은 것",
      outcomes: [
        {
          t: "IP SYSTEM BASELINE",
          d: "캐릭터 하나가 아니라\n확장 가능한 IP 기준선",
        },
        {
          t: "EXPRESSION GUIDE",
          d: "표정·포즈를 같은 규칙으로\n쓰는 표현 가이드",
        },
        {
          t: "WORLD RULES",
          d: "세계관과 사용 경계를\n적은 규칙 세트",
        },
        {
          t: "RELEASE DECISION",
          d: "내부 검증 후\n공개 여부를 가르는 기준",
        },
      ],
      includes: [
        "Identity Brief",
        "Silhouette Rules",
        "Expression Sheet",
        "Pose System",
        "World Rules",
        "Application Tests",
        "Guideline Draft",
        "Internal Review Notes",
      ],
      nextTitle: "다음에 확인할 것",
      nextSteps: [
        {
          t: "가이드라인 초안",
          d: "정체성·형태·표현 규칙을\n초안 문서로 정리합니다.",
        },
        {
          t: "내부 리뷰",
          d: "내부 캐릭터 컨셉 하나를\n리뷰하고 인식·일관성을 확인합니다.",
        },
        {
          t: "매체 적용 테스트",
          d: "웹·콘텐츠·간단 굿즈 맥락에서\n깨지는 지점을 찾습니다.",
        },
        {
          t: "공개 여부 결정",
          d: "검증 신호를 보고\n공개 릴리스 여부를 판단합니다.",
        },
      ],
      faq: [
        {
          q: "캐릭터 일러스트만 받아갈 수 있나요?",
          a: "이 실험의 목표는 단발 일러스트가 아니라 확장 가능한 IP 시스템입니다. 외형만 뽑는 작업과는 다릅니다.",
        },
        {
          q: "Studio의 캐릭터 서비스와 같나요?",
          a: "Studio는 의뢰형 서비스, Character Lab은 Newon 자체 IP 시스템을 검증하는 Labs 실험입니다.",
        },
        {
          q: "지금 공개된 캐릭터가 있나요?",
          a: "실험·내부 검증 단계입니다. 공개 여부는 가이드와 인식 검증 이후에 결정합니다.",
        },
        {
          q: "게임 실험과 연결되나요?",
          a: "가능합니다. Game Experiment의 플레이 루프에 붙일 캐릭터·세계관 기반으로 이어질 수 있습니다.",
        },
      ],
      seoDescription:
        "Character Lab — 단발 마스코트가 아닌 확장 가능한 캐릭터 IP 시스템을 검증하는 Newon Labs 실험.",
    },
    en: {
      headline: "Not one character —\ncan we build a scalable IP system?",
      heroLead:
        "A character is easy to leave as a single drawing.\nWithout expression, pose, personality, world rules, and usage guidelines,\nit wobbles as it moves into product, content, and merch.\n\nCharacter Lab is not an experiment in drawing one mascot.\nIt tests whether identity → form → expression → world → application\ncan become a reusable IP system.\n\nCan one character remain the same presence\nacross many touchpoints?",
      overviewTitle: "Not the look alone —\nthe rules for expansion.",
      overviewBody: [
        "An experiment to build a consistent system — not just a look — covering expression, pose, personality, world rules, and usage guidelines.",
        "The point is not prettier illustration.\nIt is whether the character stays recognizable across media —\nand whether a team can extend it with the same rules.",
        "IDENTITY → FORM → EXPRESSION → WORLD → APPLICATION.\nWe test whether a scalable IP baseline can be left behind.",
      ],
      description:
        "An experiment to build a consistent system — not just a look — covering expression, pose, personality, world rules, and usage guidelines.",
      whoTitle: "Built for these teams.",
      who: [
        {
          t: "BRAND IP",
          d: "Have a mascot\nbut no expansion rules",
        },
        {
          t: "CONTENT / SOCIAL",
          d: "Character tone drifts by channel\nand needs consistency again",
        },
        {
          t: "PRODUCT + CHARACTER",
          d: "Want the same character\nacross app, web, and merch",
        },
        {
          t: "STUDIO → IP",
          d: "Want to lift one-off illustration\ninto an IP system",
        },
        {
          t: "GAME / PLAY",
          d: "Need a character and world base\nfor play experiments",
        },
        {
          t: "BEFORE PUBLIC RELEASE",
          d: "Want internal guidelines and recognizability\nbefore going public",
        },
      ],
      question:
        "Can one character become a reusable IP system\nthat extends to product, content, merch, and brand?",
      questionContext:
        "Characters are often designed once but hard to extend consistently across media. A look alone is not a system.",
      snapshot: {
        question: "Can we build a scalable IP system?",
        method: "Identity → form → expression → world → application",
        signal: "Consistency, recognizability, scalability",
        outcome: "Validation in progress",
      },
      whyTitle: "How we frame the problem.",
      why: {
        problem:
          "Character design alone does not extend consistently across content and products.\nEach channel becomes a different character.",
        hypothesis:
          "Systematizing visual rules, personality, and expression first keeps consistency across media.\nGuidelines create expansion speed.",
        experiment: "IDENTITY → FORM → EXPRESSION → WORLD → APPLICATION → IP",
      },
      flowTitle: "The flow that turns character into IP",
      flow: [
        { n: "01", label: "IDENTITY", desc: "Define character identity and personality." },
        { n: "02", label: "FORM", desc: "Lock silhouette and proportion rules." },
        { n: "03", label: "EXPRESSION", desc: "Build expression and pose systems." },
        { n: "04", label: "WORLD", desc: "Set world rules and usage boundaries." },
        { n: "05", label: "APPLICATION", desc: "Test expansion in product and content." },
      ],
      testingTitle: "Hypotheses under test",
      testing: [
        {
          n: "01",
          title: "VISUAL CONSISTENCY",
          desc: "Does visual consistency hold?\nIs it the same presence in new scenes?",
        },
        {
          n: "02",
          title: "EXPRESSION SYSTEM",
          desc: "Is the expression system actually usable?\nCan the team draw with the same rules?",
        },
        {
          n: "03",
          title: "RECOGNIZABILITY",
          desc: "Is recognizability high?\nCan silhouette alone separate it?",
        },
        {
          n: "04",
          title: "CROSS-MEDIA",
          desc: "Does cross-media application hold?\nDoes it break on web, app, or merch?",
        },
      ],
      signalsTitle: "Signals we watch",
      signals: [
        { type: "QUALITATIVE", desc: "Guideline adherence potential" },
        { type: "PRODUCT", desc: "Fit with Newon brand" },
        { type: "BEHAVIORAL", desc: "Internal review response" },
        { type: "DECISION", desc: "Public release decision" },
      ],
      outcomesTitle: "What we want to leave with",
      outcomes: [
        {
          t: "IP SYSTEM BASELINE",
          d: "Not one character —\na scalable IP baseline",
        },
        {
          t: "EXPRESSION GUIDE",
          d: "An expression guide so pose and face\nfollow the same rules",
        },
        {
          t: "WORLD RULES",
          d: "A small rule set for world\nand usage boundaries",
        },
        {
          t: "RELEASE DECISION",
          d: "Criteria for whether to go public\nafter internal validation",
        },
      ],
      includes: [
        "Identity Brief",
        "Silhouette Rules",
        "Expression Sheet",
        "Pose System",
        "World Rules",
        "Application Tests",
        "Guideline Draft",
        "Internal Review Notes",
      ],
      nextTitle: "What comes next",
      nextSteps: [
        {
          t: "Guideline draft",
          d: "Document identity, form, and expression rules\nas a first draft.",
        },
        {
          t: "Internal review",
          d: "Review one internal character concept\nfor recognizability and consistency.",
        },
        {
          t: "Cross-media application test",
          d: "Find break points in web, content,\nand light merch contexts.",
        },
        {
          t: "Public release decision",
          d: "Use validation signals to decide\nwhether to release publicly.",
        },
      ],
      faq: [
        {
          q: "Can we just take character illustration?",
          a: "This experiment aims at a scalable IP system, not a one-off illustration deliverable.",
        },
        {
          q: "Is this the same as Studio character services?",
          a: "Studio is client service work. Character Lab is a Labs experiment validating Newon’s own IP system.",
        },
        {
          q: "Is there a public character already?",
          a: "This is still experiment and internal validation. Public release follows guideline and recognition checks.",
        },
        {
          q: "Does it connect to the game experiment?",
          a: "Yes, potentially — as a character and world base for Game Experiment play loops.",
        },
      ],
      seoDescription:
        "Character Lab — validating a scalable character IP system, not a single mascot. A Newon Labs experiment.",
    },
  },
};

export function getLabDetailContent(slug, lang = "ko") {
  const entry = LAB_DETAIL_CONTENT[slug];
  if (!entry) return null;
  const pack = lang === "ko" ? entry.ko : entry.en;
  return {
    category: lang === "ko" ? entry.categoryKo : entry.categoryEn,
    ...pack,
  };
}
