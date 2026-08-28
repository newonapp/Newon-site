/** Korean eyebrows for Studio service detail pages (static EN labels in DETAIL). */
export const STUDIO_KO_EYEBROWS = {
  PROBLEMS: "문제",
  PRINCIPLES: "원칙",
  DIRECTIONS: "방향",
  "NAMING PRINCIPLES": "네이밍 원칙",
  "NAMING DIRECTIONS": "네이밍 방향",
  "IDENTITY PRINCIPLES": "아이덴티티 원칙",
  "LOGO PRINCIPLES": "로고 원칙",
  "LOGO TYPES": "로고 유형",
  "LOGO SYSTEM": "로고 시스템",
  "WEB DESIGN PRINCIPLES": "웹 디자인 원칙",
  "VISUAL SYSTEM": "비주얼 시스템",
  "VISUAL DIRECTION": "비주얼 방향",
  "PAGE TYPES": "페이지 유형",
  "HOMEPAGE STRUCTURE": "홈페이지 구조",
  "DIGITAL CHECK": "디지털 점검",
  "DIGITAL-FIRST CHECK": "디지털 우선 점검",
  "RESPONSIVE · UX": "반응형 · UX",
  "BEFORE → AFTER": "이전 → 이후",
  "CONCEPT → SYSTEM": "콘셉트 → 시스템",
  "LOGO vs IDENTITY": "로고 vs 아이덴티티",
  "DESIGN vs DEVELOPMENT": "디자인 vs 개발",
  "WEB EXPERIENCE": "웹 경험",
  TIMELINE: "예상 기간",
  "PROJECT SCOPE": "프로젝트 범위",
  "NEXT STEP": "다음 단계",
  "BRAND SYSTEM": "브랜드 시스템",
  "EXPLORE BRAND": "브랜드 탐색",
  "EXPLORE DIGITAL": "디지털 탐색",
  "EXPLORE CONTENT": "콘텐츠 탐색",
  "EXPLORE IP": "IP 탐색",
  "CONTENT SYSTEM": "콘텐츠 시스템",
  "CHARACTER FOUNDATION": "캐릭터 기반",
  "APP STRUCTURE": "앱 구조",
  "PRODUCT FLOW": "제품 흐름",
  "UI PATTERNS": "UI 패턴",
  "CAMPAIGN STRUCTURE": "캠페인 구조",
  "SOCIAL FORMATS": "소셜 형식",
  "VISUAL TYPES": "비주얼 유형",
  "STICKER SYSTEM": "스티커 시스템",
  "CHARACTER SYSTEM": "캐릭터 시스템",
  "EXPERIMENTAL IP": "실험 IP",
  "LOGO DESIGN": "로고 디자인",
};

export function applyStudioKoLabels(detail, pageLang) {
  if (!detail || pageLang !== "ko") return detail;
  const out = { ...detail };
  for (const [key, value] of Object.entries(out)) {
    if (key.endsWith("Label") && typeof value === "string") {
      out[key] = STUDIO_KO_EYEBROWS[value] ?? value;
    }
  }
  for (const key of ["eyebrowSub", "displayName"]) {
    if (typeof out[key] === "string") {
      out[key] = STUDIO_KO_EYEBROWS[out[key]] ?? out[key];
    }
  }
  return out;
}
