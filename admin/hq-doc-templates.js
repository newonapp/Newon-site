/**
 * Newon HQ Phase 2D.2 — Client operations document templates.
 * Field keys are additive/optional — never migrate existing Firestore docs.
 */

export const DOC_TYPES = [
  { value: "quote", label: "Quote / 견적서" },
  { value: "scope", label: "Scope of Work / 작업 범위서" },
  { value: "requirements", label: "Requirements / 요구사항" },
  { value: "contract", label: "Contract / 계약서" },
  { value: "invoice", label: "Invoice / 청구서" },
  { value: "delivery", label: "Delivery / 납품 문서" },
  { value: "maintenance", label: "Maintenance / 유지보수 안내" },
  { value: "faq", label: "Client FAQ / 고객 FAQ" },
  { value: "meeting", label: "Meeting Note / 미팅 기록" },
  { value: "other", label: "Other" },
];

export const DOC_STATUS = [
  "draft",
  "sent",
  "approved",
  "signed",
  "completed",
  "overdue",
  "cancelled",
];

export const INVOICE_PAYMENT_TYPES = [
  { value: "deposit", label: "Deposit / 착수금" },
  { value: "milestone", label: "Milestone / 중간" },
  { value: "final", label: "Final / 잔금" },
  { value: "maintenance", label: "Maintenance / 유지보수" },
  { value: "other", label: "Other" },
];

export const QUOTE_DISCLAIMER =
  "본 견적은 현재 확인된 프로젝트 범위를 기준으로 작성되었으며, 기능 추가, 요구사항 변경, 외부 시스템 연동 등에 따라 최종 금액 및 일정이 변경될 수 있습니다.";

export const QUOTE_VALID_DAYS_DEFAULT = 14;

export const EXTERNAL_COST_OPTIONS = [
  "Domain",
  "Hosting",
  "Server",
  "Paid API",
  "External SaaS",
  "Cloud usage",
  "Firebase usage beyond free tier",
  "Apple Developer Account",
  "Google Play Developer Account",
  "Third-party licenses",
];

export const SERVICE_TYPE_OPTIONS = [
  "Web",
  "App",
  "MVP",
  "Internal Tool",
  "Automation",
  "Design",
  "Other",
];

export const FEATURE_FLAG_OPTIONS = [
  "Authentication",
  "Database",
  "Admin",
  "Payment",
  "Subscription",
  "AI/API",
  "Community",
  "Chat",
  "Push Notification",
  "Map/Location",
  "File Upload",
  "Analytics",
  "External API",
  "Multilingual",
  "Other",
];

export const BUDGET_OPTIONS = [
  "Under ₩1M",
  "₩1M–₩3M",
  "₩3M–₩5M",
  "₩5M–₩10M",
  "₩10M+",
  "Not sure",
];

export const START_OPTIONS = [
  "ASAP",
  "Within 2 weeks",
  "Within 1 month",
  "1–3 months",
  "Flexible",
];

/** New requirements fields (create/edit). Legacy keys still render if present. */
export const REQ_FIELDS = [
  ["clientName", "Client name / 고객명"],
  ["companyName", "Company / 회사명"],
  ["contactName", "Contact / 담당자"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["projectName", "Project name / 프로젝트명"],
  ["serviceType", "Service type / 서비스 유형"],
  ["oneLiner", "One-line description / 한 문장 설명"],
  ["purpose", "Purpose / 프로젝트 목적"],
  ["problem", "Problem / 해결하려는 문제"],
  ["targetUsers", "Primary users / 주요 사용자"],
  ["requiredFeatures", "Required features / 필수 기능"],
  ["optionalFeatures", "Optional features / 선택 기능"],
  ["futureFeatures", "Future features / 향후 기능"],
  ["featureFlags", "Feature checklist / 기능 여부"],
  ["hasExistingDesign", "Existing design / 기존 디자인"],
  ["hasBrandGuide", "Brand guide / 브랜드 가이드"],
  ["referenceServices", "Reference services / 참고 서비스"],
  ["designDirection", "Design direction / 원하는 방향"],
  ["designAvoid", "Design to avoid / 피하고 싶은 디자인"],
  ["hasExistingService", "Existing service / 기존 서비스"],
  ["hasExistingCode", "Existing code / 기존 코드"],
  ["hasDomain", "Domain / 도메인"],
  ["hasServer", "Server / 서버"],
  ["hasFirebase", "Firebase/backend"],
  ["externalApis", "External APIs"],
  ["budgetRange", "Budget / 예산"],
  ["preferredStart", "Preferred start / 희망 시작"],
  ["targetLaunch", "Target launch / 희망 출시일"],
  ["launchPlatforms", "Launch platforms / 출시 플랫폼"],
  ["deliverablesNeeded", "Deliverables needed / 필요한 납품물"],
  ["needsSourceCode", "Source code needed / 소스코드"],
  ["needsStoreLaunch", "Store launch / 스토어 출시"],
  ["needsDomainDeploy", "Domain/deploy support"],
  ["needsMaintenance", "Ops/maintenance needed"],
  ["otherNotes", "Other requirements / 기타 요구사항"],
];

/** Shown in detail/print when old docs still have these keys. */
export const LEGACY_REQ_FIELDS = [
  ["businessBackground", "Business Background"],
  ["platforms", "Platforms"],
  ["authentication", "Authentication"],
  ["payment", "Payment"],
  ["admin", "Admin"],
  ["backend", "Backend"],
  ["designRequirements", "Design Requirements"],
  ["localization", "Localization"],
  ["analytics", "Analytics"],
  ["notifications", "Notifications"],
  ["securityPrivacy", "Security / Privacy"],
  ["deliveryRequirements", "Delivery Requirements"],
];

export const SCOPE_FIELDS = [
  ["overview", "Project Overview / 프로젝트 개요"],
  ["purpose", "Purpose / 목적"],
  ["included", "In Scope / 포함 범위"],
  ["deliverables", "Deliverables / 납품물"],
  ["excluded", "Out of Scope / 제외 범위"],
  ["techStack", "Tech Stack (optional)"],
  ["milestones", "Milestones / 마일스톤"],
  ["timeline", "Timeline / 일정"],
  ["revisionPolicy", "Revisions / 수정 정책"],
  ["changeRequestPolicy", "Change Request / 변경 요청"],
  ["clientResponsibilities", "Client Responsibilities / 고객 책임"],
  ["externalCosts", "External costs (if any) / 외부 비용"],
  ["additionalNotes", "Additional Notes"],
];

export const LEGACY_SCOPE_FIELDS = [
  ["objectives", "Objectives"],
  ["newonResponsibilities", "Newon Responsibilities"],
  ["acceptanceCriteria", "Acceptance Criteria"],
];

export const SCOPE_DEFAULTS = {
  revisionPolicy:
    "기본 프로젝트 범위 내 수정 2회. 프로젝트별 조건으로 override 가능.",
  changeRequestPolicy:
    "기존 합의 범위를 넘는 신규 기능, 구조 변경, 추가 화면, 새로운 외부 API, 새로운 플랫폼 등은 Change Request / 추가 견적 대상입니다.",
  clientResponsibilities:
    "콘텐츠, 이미지, 브랜드 자료, API 계정, 피드백, 스토어 계정 및 기타 필요한 자료를 적시에 제공합니다.",
  deliverables:
    "- Source Code\n- Web Build\n- iOS App\n- Android App\n- Admin\n- Design Files\n- Documentation\n- Deployment",
};

export const CONTRACT_FIELDS = [
  ["parties", "Parties / 계약 당사자"],
  ["projectName", "Project name / 프로젝트명"],
  ["scopeReference", "Scope reference / Scope 문서 참조"],
  ["contractAmount", "Contract amount / 총 계약금액"],
  ["vatNote", "VAT / 부가세"],
  ["paymentSchedule", "Payment schedule / 결제 일정"],
  ["startDate", "Start date / 착수일"],
  ["estimatedDelivery", "Estimated delivery / 예상 납품"],
  ["revisionPolicy", "Revision policy"],
  ["changeRequestPolicy", "Change request policy"],
  ["clientResponsibilities", "Client responsibilities"],
  ["externalCosts", "External costs"],
  ["ipSourceCode", "IP / Source code"],
  ["confidentiality", "Confidentiality"],
  ["termination", "Termination"],
  ["maintenance", "Maintenance"],
  ["approvalStatus", "Sign/Approval status"],
  ["notes", "Notes"],
];

export const CONTRACT_DEFAULTS = {
  paymentSchedule:
    "소규모: 착수금 50% / 최종 납품 전 50%\n대규모: 착수 30% / 중간 40% / 최종 30% (프로젝트별 수정)",
  revisionPolicy: "기본 범위 내 수정 2회 (프로젝트별 상이할 수 있음).",
  changeRequestPolicy:
    "Scope 밖 기능·구조 변경은 Change Request 및 추가 견적으로 처리합니다.",
  externalCosts:
    "Domain, Hosting, Server, Paid API, SaaS, Cloud/Firebase 초과 사용, 스토어 개발자 계정, 제3자 라이선스 등은 개발비와 별도일 수 있습니다.",
  ipSourceCode:
    "지적재산권 및 소스코드 제공 범위는 계약 조건과 잔금 완료 후 합의된 납품 범위에 따릅니다.",
  confidentiality: "양 당사자는 프로젝트 관련 비공개 정보를 제3자에게 무단 공개하지 않습니다.",
  termination: "중도 해지 시 완료된 작업 범위와 지급된 대금을 기준으로 정산합니다.",
  maintenance:
    "납품 후 계약 범위 내 오류 수정은 기본 14일(프로젝트별 수정 가능). 장기 유지보수는 별도 계약.",
  vatNote: "VAT 별도 여부 — 견적/청구서에 명시",
};

/** Legacy contract keys still shown if present. */
export const LEGACY_CONTRACT_KEYS = ["paymentTerms", "endDate", "client"];

export const DELIVERY_TEMPLATE_GROUPS = [
  {
    id: "project",
    label: "PROJECT",
    items: [
      "요구사항 최종 확인",
      "Scope 완료",
      "주요 기능 구현 완료",
      "내부 QA 완료",
      "고객 검수 완료",
    ],
  },
  {
    id: "web",
    label: "WEB",
    items: [
      "Production build",
      "Responsive 확인",
      "Domain",
      "SSL",
      "SEO",
      "Analytics",
      "Forms",
      "Deployment",
    ],
  },
  {
    id: "app",
    label: "APP",
    items: [
      "Release build",
      "iOS 확인",
      "Android 확인",
      "App icon",
      "Splash",
      "Store metadata",
      "Privacy",
      "Store submission",
    ],
  },
  {
    id: "backend",
    label: "BACKEND",
    items: [
      "Production config",
      "Authentication",
      "Database",
      "Security Rules",
      "Environment variables",
      "Backup/ownership 확인",
    ],
  },
  {
    id: "handover",
    label: "HANDOVER",
    items: [
      "Source Code",
      "Credentials ownership 확인",
      "Documentation",
      "Design assets",
      "Deployment information",
    ],
  },
  {
    id: "payment",
    label: "PAYMENT",
    items: ["Final Invoice", "Final Payment Confirmed"],
  },
  {
    id: "close",
    label: "CLOSE",
    items: ["Client acceptance", "Maintenance 안내", "Project archive 준비"],
  },
];

/** Flat list for empty projects that have never saved a checklist (preview only until Apply). */
export const DEFAULT_DELIVERY_ITEMS = DELIVERY_TEMPLATE_GROUPS.flatMap((g) =>
  g.items.map((label) => `${g.label}: ${label}`)
);

export const MAINTENANCE_DEFAULTS = {
  whatIncluded:
    "납품 후 계약 범위 내 오류(버그) 수정.\n기본 지원 기간: 납품 후 14일 (프로젝트별 수정 가능).",
  notIncluded:
    "- 신규 기능\n- 신규 화면\n- 디자인 전면 변경\n- 외부 서비스 정책 변경 대응\n- 새로운 플랫폼 추가\n- 새로운 API 추가\n\n위 작업은 추가 개발 견적 대상입니다.",
  ongoing:
    "장기 유지보수·운영 지원이 필요하면 별도 유지보수 계약으로 협의합니다.",
  supportRequest:
    "지원 요청 시 포함해 주세요:\n- 문제 설명\n- 발생 환경\n- 재현 방법\n- 스크린샷/영상\n- 긴급도",
};

export const MAINTENANCE_FIELDS = [
  ["whatIncluded", "What is included / 포함"],
  ["notIncluded", "Not included / 미포함"],
  ["ongoing", "Ongoing maintenance / 장기 유지보수"],
  ["supportRequest", "Support request guide / 지원 요청"],
  ["notes", "Notes"],
];

export const CLIENT_FAQ_ITEMS = [
  {
    q: "가격은 어떻게 결정되나요?",
    a: "프로젝트 범위, 기능 복잡도, 외부 연동 및 일정에 따라 결정됩니다.",
  },
  {
    q: "표시된 가격은 고정인가요?",
    a: "아닙니다. 공개된 금액은 시작 가격이며, 최종 견적은 범위 확인 후 안내합니다.",
  },
  {
    q: "제작 기간은 언제부터 계산하나요?",
    a: "요구사항·범위 확정 및 착수 이후부터 계산합니다.",
  },
  {
    q: "수정은 몇 번 가능한가요?",
    a: "기본 범위 내 2회를 기준으로 하되, 계약별로 다를 수 있습니다.",
  },
  {
    q: "기능을 중간에 추가할 수 있나요?",
    a: "가능하지만 Scope 밖의 기능은 추가 견적 및 일정 조정이 필요할 수 있습니다.",
  },
  {
    q: "서버 비용도 포함되나요?",
    a: "외부 서비스(도메인, 호스팅, 유료 API, 클라우드 등) 비용은 별도일 수 있습니다.",
  },
  {
    q: "앱스토어 출시도 해주나요?",
    a: "프로젝트 범위에 따라 출시 지원이 가능합니다. 스토어 심사 기간은 개발 일정과 별도입니다.",
  },
  {
    q: "소스코드를 받을 수 있나요?",
    a: "계약 조건 및 잔금 완료 후, 합의된 납품 범위에 따라 제공합니다.",
  },
  {
    q: "유지보수도 가능한가요?",
    a: "가능합니다. 장기 유지보수는 별도 협의입니다.",
  },
];

export const WORKFLOW_HINT =
  "Lead → Requirements → Quote → Scope → Contract → Project → Invoice → Delivery → Maintenance\n(프로젝트에 따라 일부 문서는 생략 가능. 강제 워크플로가 아닙니다.)";

export const LEGAL_DISCLAIMER =
  "본 문서는 Newon HQ의 프로젝트 조건 기록 및 문서 작성 보조용입니다. 법률 자문이 아니며, 법적으로 완벽한 계약서를 의미하지 않습니다.";

/**
 * Readable document number without global counters.
 * Format: NEWON-{prefix}-YYYYMM-{timeSuffix}
 */
export function makeDocNumber(prefix) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().slice(2, 4);
  return `NEWON-${prefix}-${y}${m}-${t}${r}`;
}

export function addDaysYmd(baseYmd, days) {
  const d = baseYmd ? new Date(baseYmd + "T12:00:00") : new Date();
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + (Number(days) || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatFaqBody(items) {
  return (items || CLIENT_FAQ_ITEMS)
    .map((it, i) => `Q${i + 1}. ${it.q}\nA. ${it.a}`)
    .join("\n\n");
}
