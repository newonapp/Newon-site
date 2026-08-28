/**
 * Newon Labs — shared experiment registry.
 * Status: RESEARCH | PROTOTYPE | TESTING | VALIDATED | ARCHIVED
 * Pipeline: RESEARCH → PROTOTYPE → TESTING → VALIDATED → PRODUCT
 */

export const LAB_STATUSES = ["RESEARCH", "PROTOTYPE", "TESTING", "VALIDATED", "ARCHIVED"];

export const LAB_PIPELINE = ["RESEARCH", "PROTOTYPE", "TESTING", "VALIDATED", "PRODUCT"];

/** Map legacy admin statuses → public status */
export const LAB_STATUS_MAP = {
  building: "PROTOTYPE",
  exploring: "RESEARCH",
  concept: "RESEARCH",
  beta: "TESTING",
  prototype: "PROTOTYPE",
  PROTOTYPE: "PROTOTYPE",
  live: "VALIDATED",
  paused: "ARCHIVED",
  research: "RESEARCH",
  idea: "RESEARCH",
  IDEA: "RESEARCH",
  BUILDING: "PROTOTYPE",
};

/**
 * @typedef {object} LabExperiment
 * @property {string} experimentId
 * @property {string} id
 * @property {string} slug
 * @property {number} labNumber
 * @property {string} category
 * @property {string} status
 * @property {string} stage — current pipeline stage (may equal status, or PRODUCT)
 * @property {string} stageLabelKo
 * @property {string} stageLabelEn
 * @property {string} updatedAt — ISO date YYYY-MM-DD
 * @property {object|null} relatedProduct
 */

/** @type {LabExperiment[]} */
export const LABS_EXPERIMENTS = [
  {
    experimentId: "lab-01",
    id: "review-ai",
    slug: "review-ai",
    runnable: true,
    labNumber: 1,
    category: "ai",
    categoryLabel: "AI · PRODUCT INTELLIGENCE",
    status: "TESTING",
    stage: "TESTING",
    stageLabelKo: "02 / VALIDATION",
    stageLabelEn: "02 / VALIDATION",
    updatedAt: "2026-08-20",
    titleKo: "Review AI",
    titleEn: "Review AI",
    displayTitleKo: "Review AI",
    displayTitleEn: "Review AI",
    heroLeadKo: "수백 개의 리뷰에서\n제품이 놓치고 있는 신호를 찾습니다.",
    heroLeadEn: "Find the signals product teams miss\ninside hundreds of reviews.",
    listDescKo: "리뷰 분석 AI 실험",
    listDescEn: "Review-analysis AI experiment",
    hubLeadKo: "리뷰에서\n제품 신호를 찾습니다.",
    hubLeadEn: "Find product signals\ninside reviews.",
    hubTitleBreakKo: "REVIEW\nAI",
    hubTitleBreakEn: "REVIEW\nAI",
    descKo:
      "사용자 리뷰를 분석해 감정, 반복 문제, 기능 요청, 긍정 신호와 제품 개선 우선순위를 추출하는 AI 실험입니다.",
    descEn:
      "An AI experiment that extracts sentiment, repeated issues, feature requests, positive signals, and product priorities from user reviews.",
    questionKo: "리뷰만으로\n다음 제품 결정을 내릴 수 있을까?",
    questionEn: "Can reviews alone\ndrive the next product decision?",
    questionListKo: "앱·서비스 리뷰에서 개선 신호를 얼마나 빠르게 뽑을 수 있는가?",
    questionListEn: "How quickly can we surface improvement signals from app and service reviews?",
    hypothesisKo:
      "구조화된 요약과 테마 클러스터링이면 수동 분류보다 빠르게 우선순위를 잡을 수 있다.",
    hypothesisEn:
      "Structured summaries and theme clustering can prioritize issues faster than manual sorting.",
    buildKo: "리뷰 입력 → 테마 분류 → 요약 보드 프로토타입을 구축 중.",
    buildEn: "Building a prototype: review intake → theme classification → summary board.",
    resultKo: null,
    resultEn: null,
    findingsKo:
      "키워드·감정 휴리스틱만으로도 반복 불만과 기능 요청을 빠르게 표면화할 수 있다. 정확도는 실제 모델 연결이 필요하다.",
    findingsEn:
      "Even keyword/sentiment heuristics surface repeated complaints and requests quickly. Accuracy needs a real model connection.",
    nextKo: "실제 리뷰 샘플로 정확도와 운영 흐름을 검증.",
    nextEn: "Validate accuracy and ops flow with real review samples.",
    nextStepKo: "앱스토어 리뷰 샘플셋으로 휴리스틱 vs 모델 비교.",
    nextStepEn: "Compare heuristic vs model on a real App Store review sample set.",
    metrics: {
      reviewsAnalyzed: null,
      signalsFound: null,
      repeatedIssues: null,
    },
    relatedProduct: null,
  },
  {
    experimentId: "lab-02",
    id: "newon-qr",
    slug: "newon-qr",
    runnable: true,
    labNumber: 2,
    category: "saas",
    categoryLabel: "SAAS · QR",
    status: "TESTING",
    stage: "TESTING",
    stageLabelKo: "02 / VALIDATION",
    stageLabelEn: "02 / VALIDATION",
    updatedAt: "2026-08-18",
    titleKo: "Newon QR",
    titleEn: "Newon QR",
    displayTitleKo: "Newon QR",
    displayTitleEn: "Newon QR",
    heroLeadKo: "하나의 QR.\n그 이후까지 추적합니다.",
    heroLeadEn: "One QR.\nTrack what happens after.",
    listDescKo: "QR SaaS 실험",
    listDescEn: "QR SaaS experiment",
    hubLeadKo: "하나의 QR에서\n사용 이후까지.",
    hubLeadEn: "One QR.\nTrack what follows.",
    hubTitleBreakKo: "NEWON\nQR",
    hubTitleBreakEn: "NEWON\nQR",
    descKo:
      "브랜드 QR 생성부터 링크 관리, 스캔 분석까지 하나의 흐름으로 연결하는 QR SaaS 실험입니다.",
    descEn:
      "A QR SaaS experiment connecting branded QR creation, link management, and scan analytics in one flow.",
    questionListKo: "작은 팀이 QR을 만들고 추적하는 데 정말 필요한 기능은 무엇인가?",
    questionListEn: "What does a small team actually need to create and track branded QR codes?",
    questionKo: "작은 팀이 브랜드 QR을 만들고\n추적하는 최소 제품은 무엇인가?",
    questionEn: "What is the smallest useful product\nfor branded QR create-and-track?",
    hypothesisKo: "생성·목적지 변경·기본 스캔 추적이면 초기 수요를 확인할 수 있다.",
    hypothesisEn: "Create, destination edits, and basic scan tracking is enough to test early demand.",
    buildKo: "QR 생성기와 대시보드 프로토타입을 조립 중.",
    buildEn: "Assembling a QR generator with a dashboard prototype.",
    resultKo: null,
    resultEn: null,
    findingsKo: "생성 UX는 단순할수록 좋다. 추적 가치는 백엔드 없이 검증하기 어렵다.",
    findingsEn: "Creation UX should stay minimal. Tracking value is hard to prove without a backend.",
    nextKo: "첫 사용 시나리오(이벤트·메뉴·명함)로 테스트.",
    nextEn: "Test against first scenarios: events, menus, business cards.",
    nextStepKo: "리다이렉트 + 스캔 카운트 MVP 백엔드 스코프 정의.",
    nextStepEn: "Define MVP backend scope: redirect + scan counts.",
    metrics: { scans: null, activeQr: null },
    relatedProduct: null,
    hypotheses: [
      {
        n: "01",
        ko: "QR 생성은 매우 단순해야 한다.",
        en: "QR creation must stay extremely simple.",
      },
      {
        n: "02",
        ko: "QR을 다시 만들지 않고 목적지 URL을 변경할 수 있어야 한다.",
        en: "Destination URLs must be editable without regenerating the QR.",
      },
      {
        n: "03",
        ko: "스캔 이후 데이터가 실제 제품 가치를 만든다.",
        en: "Post-scan data is what creates real product value.",
      },
    ],
  },
  {
    experimentId: "lab-03",
    id: "newon-form",
    slug: "newon-form",
    runnable: true,
    labNumber: 3,
    category: "saas",
    categoryLabel: "SAAS · FORMS",
    status: "RESEARCH",
    stage: "RESEARCH",
    stageLabelKo: "01 / RESEARCH",
    stageLabelEn: "01 / RESEARCH",
    updatedAt: "2026-08-12",
    titleKo: "Newon Form",
    titleEn: "Newon Form",
    displayTitleKo: "Newon Form",
    displayTitleEn: "Newon Form",
    heroLeadKo: "질문을 만들고,\n답을 받는 가장 짧은 방법.",
    heroLeadEn: "The shortest path\nfrom question to answer.",
    listDescKo: "폼 SaaS 실험",
    listDescEn: "Form SaaS experiment",
    hubLeadKo: "질문에서\n답까지 가장 짧게.",
    hubLeadEn: "The shortest path\nfrom ask to answer.",
    hubTitleBreakKo: "NEWON\nFORM",
    hubTitleBreakEn: "NEWON\nFORM",
    descKo:
      "문의·대기자·피드백을 하나의 흐름으로 수집하고 관리하기 위한 lightweight form experiment.",
    descEn:
      "A lightweight form experiment for collecting inquiries, waitlists, and feedback in one flow.",
    questionListKo: "복잡한 설정 없이 질문을 만들고 답을 받을 수 있을까?",
    questionListEn: "Can we ask and collect without a complicated builder?",
    questionKo: "문의·대기자·피드백을 한 흐름으로 받는\n가벼운 폼이 필요한가?",
    questionEn: "Is there demand for a light form stack\nfor inquiry, waitlist, and feedback?",
    hypothesisKo: "스팸 방지와 알림만 잘 되면 복잡한 빌더 없이도 충분하다.",
    hypothesisEn: "Spam protection and notifications may be enough without a heavy form builder.",
    buildKo: "개념 정리 및 기존 waitlist/문의 흐름과의 차이를 정의 중.",
    buildEn: "Defining the concept and how it differs from existing waitlist/inquiry flows.",
    resultKo: null,
    resultEn: null,
    findingsKo: "빌더는 최소 필드 타입만으로도 체험이 가능하다. 응답 저장이 다음 병목이다.",
    findingsEn: "A minimal field set is enough for the experience. Response storage is the next bottleneck.",
    nextKo: "핵심 필드 세트와 알림 채널을 프로토타입으로 고정.",
    nextEn: "Lock a prototype field set and notification channels.",
    nextStepKo: "제출 → 이메일 알림 프로토타입.",
    nextStepEn: "Prototype submit → email notification.",
    metrics: { responses: null, completionRate: null },
    relatedProduct: null,
    principles: {
      ko: ["불필요한 설정 없음.", "복잡한 빌더 없음.", "묻고, 모은다."],
      en: ["No unnecessary setup.", "No complicated builder.", "Just ask and collect."],
    },
  },
  {
    experimentId: "lab-04",
    id: "ai-experiment",
    slug: "ai-experiment",
    runnable: true,
    legacySlugs: ["ai-service"],
    labNumber: 4,
    category: "ai",
    categoryLabel: "AI · DISCOVERY",
    status: "RESEARCH",
    stage: "RESEARCH",
    stageLabelKo: "01 / RESEARCH",
    stageLabelEn: "01 / RESEARCH",
    updatedAt: "2026-08-10",
    titleKo: "AI Product Discovery",
    titleEn: "AI Product Discovery",
    displayTitleKo: "AI Product Discovery",
    displayTitleEn: "AI Product Discovery",
    heroLeadKo: "AI를 붙이는 것이 아니라,\nAI가 필요한 문제를 찾습니다.",
    heroLeadEn: "We don't bolt on AI.\nWe find problems that need it.",
    listDescKo: "AI 제품 문제 발견 연구",
    listDescEn: "AI product problem discovery",
    hubLeadKo: "AI를 만들기 전에\n문제를 찾습니다.",
    hubLeadEn: "Find the problem\nbefore building AI.",
    hubTitleBreakKo: "AI Product\nDiscovery",
    hubTitleBreakEn: "AI Product\nDiscovery",
    descKo:
      "반복되는 문제를 발견하고 AI가 실제로 더 나은 해결책인지 검증하는 연구입니다.",
    descEn:
      "Research that finds recurring problems and tests whether AI is actually a better solution.",
    questionListKo: "Newon이 다음으로 해결할 AI 문제는 무엇인가?",
    questionListEn: "What AI problem should Newon solve next?",
    questionKo: "Newon이 직접 운영할\n다음 AI 제품의 문제는 무엇인가?",
    questionEn: "What problem should Newon's\nnext operated AI product solve?",
    hypothesisKo: "내부 도구로 먼저 검증한 뒤 외부 제품으로 확장하는 경로가 안전하다.",
    hypothesisEn: "Validating as an internal tool before an external product is the safer path.",
    buildKo: "후보 문제 공간과 기존 AI 제품과의 차별점을 조사 중.",
    buildEn: "Researching candidate problem spaces and differentiation from existing AI products.",
    resultKo: null,
    resultEn: null,
    findingsKo: "문제 정의가 모호하면 AI fit 점수가 항상 높게 나온다. 빈도·대안이 핵심 필터다.",
    findingsEn: "Vague problems always score high on AI fit. Frequency and alternatives are the real filters.",
    nextKo: "1~2개 시나리오를 좁혀 프로토타입 범위를 정한다.",
    nextEn: "Narrow to 1–2 scenarios and define prototype scope.",
    nextStepKo: "리뷰 인텔리전스 외 1개 후보를 보드에서 탈락/유지.",
    nextStepEn: "Keep or cut one non–review-intelligence candidate on the board.",
    metrics: { concepts: null, validated: null },
    relatedProduct: null,
    board: [
      {
        problemKo: "앱스토어 리뷰 우선순위 정리",
        problemEn: "Prioritizing App Store review themes",
        userKo: "제품 팀 / 솔로 메이커",
        userEn: "Product teams / solo makers",
        frequency: "HIGH",
        aiFit: "HIGH",
        potential: "MED",
        status: "RESEARCH",
      },
      {
        problemKo: "고객 문의 초안 분류",
        problemEn: "Drafting / routing support inquiries",
        userKo: "소규모 운영팀",
        userEn: "Small ops teams",
        frequency: "MED",
        aiFit: "MED",
        potential: "MED",
        status: "RESEARCH",
      },
      {
        problemKo: "실험 노트 → 제품 가설 변환",
        problemEn: "Turning lab notes into product hypotheses",
        userKo: "Newon 내부",
        userEn: "Newon internal",
        frequency: "LOW",
        aiFit: "MED",
        potential: "LOW",
        status: "RESEARCH",
      },
    ],
  },
  {
    experimentId: "lab-05",
    id: "game-experiment",
    slug: "game-experiment",
    runnable: true,
    labNumber: 5,
    category: "games",
    categoryLabel: "GAMES · SYSTEMS",
    status: "RESEARCH",
    stage: "RESEARCH",
    stageLabelKo: "01 / RESEARCH",
    stageLabelEn: "01 / RESEARCH",
    updatedAt: "2026-08-08",
    titleKo: "Game Experiment",
    titleEn: "Game Experiment",
    displayTitleKo: "GAME EXPERIMENT",
    displayTitleEn: "GAME EXPERIMENT",
    heroLeadKo: "선택을 기억하는 게임은\n플레이어를 어떻게 바꿀까?",
    heroLeadEn: "What happens when a game\nremembers your choices?",
    listDescKo: "선택·기억 게임 시스템 연구",
    listDescEn: "Choice-and-memory game systems",
    hubLeadKo: "선택을 기억하는\n게임을 실험합니다.",
    hubLeadEn: "Experiments in games\nthat remember choice.",
    hubTitleBreakKo: "GAME\nEXPERIMENT",
    hubTitleBreakEn: "GAME\nEXPERIMENT",
    descKo:
      "선택, 기억, 모순과 결과가 플레이어 경험을 어떻게 바꾸는지 연구합니다.",
    descEn:
      "Research into how choice, memory, contradiction, and consequence reshape player experience.",
    questionListKo: "웹에서 짧게 플레이할 수 있는 Newon 게임의 다음 형태는 무엇인가?",
    questionListEn: "What form should Newon's next short-session web game take?",
    questionKo: "웹에서 짧게 플레이 가능한\nNewon 게임의 다음 형태는?",
    questionEn: "What form should Newon's next\nshort-session web game take?",
    hypothesisKo: "시스템·선택 중심 메커닉이 브랜드와 맞는다.",
    hypothesisEn: "System- and choice-driven mechanics fit the brand.",
    buildKo: "메커닉 스케치와 세션 길이 가설을 정리 중.",
    buildEn: "Sketching mechanics and session-length hypotheses.",
    resultKo: null,
    resultEn: null,
    findingsKo: "이전 선택을 언급하는 순간 긴장감이 생긴다. 장편보다 30초 프로토가 가설 검증에 낫다.",
    findingsEn: "Naming a prior choice creates tension. A 30-second prototype beats a long draft for testing.",
    nextKo: "플레이어블 마이크로 프로토타입 1개.",
    nextEn: "One playable micro-prototype.",
    nextStepKo: "선택 기억 → 모순 → 재플레이 루프를 한 세션으로 연결.",
    nextStepEn: "Connect memory → contradiction → replay into one session.",
    metrics: { sessions: null, replayRate: null },
    relatedProduct: {
      slug: "404-human",
      hrefKo: "/ko/404-human/",
      hrefEn: "/en/404-human/",
      titleKo: "404: HUMAN",
      titleEn: "404: HUMAN",
      blurbKo: "AI만 남은 세계에서 마지막 인간임을 숨기세요.",
      blurbEn: "Hide that you're the last human in a world of AI.",
      labelKo: "EXPLORE A NEWON GAME",
      labelEn: "EXPLORE A NEWON GAME",
      noteKo: "이 Lab 실험과 동일한 제품은 아닙니다. 관련 게임 시스템 연구 참고용입니다.",
      noteEn: "Not the same as this lab — a related Newon game for context.",
    },
  },
  {
    experimentId: "lab-06",
    id: "character-lab",
    slug: "character-lab",
    labNumber: 6,
    category: "character",
    categoryLabel: "CHARACTER · IP",
    status: "RESEARCH",
    stage: "RESEARCH",
    stageLabelKo: "01 / RESEARCH",
    stageLabelEn: "01 / RESEARCH",
    updatedAt: "2026-08-26",
    titleKo: "Character Lab",
    titleEn: "Character Lab",
    displayTitleKo: "CHARACTER LAB",
    displayTitleEn: "CHARACTER LAB",
    heroLeadKo: "Newon 캐릭터 IP를\n실험하는 공간입니다.",
    heroLeadEn: "A space to experiment\nwith Newon character IP.",
    listDescKo: "캐릭터 IP 실험",
    listDescEn: "Character IP experiment",
    hubLeadKo: "캐릭터를\n만들고 검증합니다.",
    hubLeadEn: "Build and validate\ncharacters carefully.",
    hubTitleBreakKo: "CHARACTER\nLAB",
    hubTitleBreakEn: "CHARACTER\nLAB",
    descKo:
      "Newon 브랜드와 제품에 연결될 캐릭터 IP를 탐색합니다. 공개 가능한 캐릭터는 아직 없습니다.",
    descEn:
      "Exploring character IP that can connect to Newon brand and products. No public characters yet.",
    questionKo: "제품과 자연스럽게 이어지는\n캐릭터 IP의 형태는?",
    questionEn: "What form of character IP\nfits Newon products naturally?",
    questionListKo: "가짜 캐릭터를 올리지 않고, 검증된 IP만 공개할 수 있는가?",
    questionListEn: "Can we publish only validated IP — never fake characters?",
    hypothesisKo: "작은 캐릭터 시스템부터 검증하면 브랜드 일관성을 지킬 수 있다.",
    hypothesisEn: "Validating a small character system first keeps brand consistency.",
    buildKo: "캐릭터 가이드라인·톤·사용 규칙 초안을 정리 중. 다운로드 가능한 에셋은 아직 없음.",
    buildEn: "Drafting character guidelines, tone, and usage rules. No downloadable assets yet.",
    resultKo: null,
    resultEn: null,
    findingsKo: null,
    findingsEn: null,
    nextKo: "내부 캐릭터 컨셉 1종 검증 후 공개 여부 결정.",
    nextEn: "Validate one internal character concept, then decide on a public release.",
    nextStepKo: "가이드라인 초안 → 내부 리뷰.",
    nextStepEn: "Guideline draft → internal review.",
    metrics: { charactersPublished: null },
    relatedProduct: null,
  },
];

/** Map public lab status → legacy ventures strip label (unused on Labs hub) */
export const VENTURE_STATUS_MAP = {
  RESEARCH: "RESEARCH",
  PROTOTYPE: "PROTOTYPE",
  TESTING: "TESTING",
  VALIDATED: "VALIDATED",
  ARCHIVED: "ARCHIVED",
};

export function ventureStatusFor(exp) {
  if (exp && exp.ventureStatus) return exp.ventureStatus;
  return VENTURE_STATUS_MAP[exp?.status] || "IDEA";
}

export function getLabsExperiments() {
  return LABS_EXPERIMENTS.slice();
}

export function getLabExperiment(slug) {
  return (
    LABS_EXPERIMENTS.find((e) => e.slug === slug) ||
    LABS_EXPERIMENTS.find((e) => (e.legacySlugs || []).includes(slug)) ||
    null
  );
}

export function getLabStatusCounts() {
  const counts = { RESEARCH: 0, PROTOTYPE: 0, TESTING: 0, VALIDATED: 0, ARCHIVED: 0 };
  for (const e of LABS_EXPERIMENTS) {
    if (counts[e.status] != null) counts[e.status] += 1;
  }
  return counts;
}

export function pipelineIndex(stage) {
  const i = LAB_PIPELINE.indexOf(stage);
  return i < 0 ? 0 : i;
}
