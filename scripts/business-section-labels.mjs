/**
 * Korean section eyebrows for business service detail pages.
 * Applied when lang === "ko" so KO copy packs don't need duplicate label fields.
 */
const KO_EYEBROWS = {
  OVERVIEW: "개요",
  PROCESS: "진행 방식",
  PROBLEMS: "문제",
  "WHO IT'S FOR": "대상",
  "WHAT WE DO": "진행 작업",
  "USE CASES": "활용 예시",
  "WHAT'S INCLUDED": "포함 내용",
  DELIVERABLES: "결과물",
  "TIMELINE & PRICE": "기간 · 가격",
  "OPTIONAL / ADDITIONAL SCOPE": "선택 범위",
  FAQ: "FAQ",
  "PRICING FACTORS": "견적 요소",
  "STARTING AT": "시작가",
  TIMELINE: "예상 기간",
  "BEFORE → AFTER": "이전 → 이후",
  "NEXT STEP": "다음 단계",
  NOTICE: "안내",
  "EXPLORE BUSINESS": "비즈니스 탐색",
  "RELATED SERVICES": "관련 서비스",
  CAPABILITIES: "역량",
  METRICS: "지표",
  MEASUREMENT: "측정",
  PRINCIPLES: "원칙",
  REQUIREMENTS: "요구사항",
  SCOPE: "범위",
  DELIVERABLES: "결과물",
  "PROJECT REQUIREMENTS": "프로젝트 요구사항",
  "PRICING / STARTING POINT": "가격 / 시작점",
  CURRENT: "현재",
  "START A PROJECT": "프로젝트 시작",
  "DEVELOPMENT NEEDED?": "개발이 필요한가요?",
  BASE: "기준",
  "BEFORE / AFTER": "이전 / 이후",
  BEFORE: "이전",
  AFTER: "이후",
  "MVP DEVELOPMENT": "MVP 개발",
  BUILD: "구축",
  AUTOMATION: "자동화",
  RESEARCH: "리서치",
  SOLUTIONS: "솔루션",
  "USE CASES": "활용 예시",
  "EXAMPLE WORKFLOW": "예시 워크플로",
  "PROJECT INPUTS": "프로젝트 입력",
};

const LABEL_KEYS = [
  "overviewLabel",
  "processLabel",
  "problemsLabel",
  "whoLabel",
  "whatLabel",
  "useCasesLabel",
  "includedLabel",
  "deliverablesLabel",
  "timelineLabel",
  "priceLabel",
  "optionalLabel",
  "faqLabel",
  "exploreLabel",
  "relatedLabel",
  "capabilitiesLabel",
  "metricsLabel",
  "measurementLabel",
  "principlesLabel",
  "requirementsLabel",
  "scopeLabel",
  "ctaEyebrow",
  "developmentLabel",
  "priceFactorsLabel",
  "startingAtLabel",
  "timeLabel",
  "compareLabel",
  "nextStepsLabel",
  "noticesLabel",
  "beforeLabel",
  "afterLabel",
  "capsLabel",
  "getEyebrow",
  "eyebrow",
  "eyebrowSub",
  "subEyebrow",
  "baLabel",
  "sourcesLabel",
  "useLabel",
  "flowLabel",
];

const COPY_STRING_KEYS = [
  "eyebrow",
  "eyebrowSub",
  "subEyebrow",
  "beforeLabel",
  "afterLabel",
  "compareLabel",
  "capsLabel",
  "getEyebrow",
  "baLabel",
  "sourcesLabel",
  "useLabel",
  "flowLabel",
];

function koEyebrow(value) {
  if (typeof value !== "string" || !value) return value;
  return KO_EYEBROWS[value] ?? value;
}

export function applyKoSectionLabels(copy, lang) {
  if (!copy || lang !== "ko") return copy;
  const out = { ...copy };
  for (const key of LABEL_KEYS) {
    if (typeof out[key] === "string") out[key] = koEyebrow(out[key]);
  }
  for (const key of COPY_STRING_KEYS) {
    if (typeof out[key] === "string") out[key] = koEyebrow(out[key]);
  }
  if (typeof out.seoTitle === "string") {
    out.seoTitle = out.seoTitle.replace(/MVP DEVELOPMENT/g, "MVP 개발");
  }
  return out;
}
