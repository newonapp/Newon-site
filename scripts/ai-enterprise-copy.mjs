/**
 * Newon AI — Enterprise AI page copy.
 * Business introduction and expansion direction. No live-product claims.
 */
import { REST } from "./ai-enterprise-i18n.mjs";

function deepMerge(base, over) {
  if (!over) return base;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
      out[k] = { ...base[k], ...v };
    } else {
      out[k] = v;
    }
  }
  return out;
}

const KO = {
  seoTitle: "기업 AI | Newon AI — 업무를 이해하고 실행까지 연결하는 AI",
  seoDescription:
    "기업 전용 AI Assistant, 업무 실행형 Agent, 시스템 연동과 AI 운영 플랫폼. 기업 AI 사업 소개이며 도입 범위는 상담으로 확인합니다.",
  switchAria: "Newon AI 영역",
  personal: "개인 AI",
  enterprise: "기업 AI",
  plannedFlag: "향후 확장 계획",
  kicker: "NEWON AI · ENTERPRISE",
  titleHtml: "기업의 업무를 이해하고,<br />실행까지 연결하는 AI.",
  lead: "기업의 데이터와 업무 환경에 맞는 AI Assistant부터 업무 실행형 AI Agent, 시스템 연동과 기업 전용 AI 플랫폼까지. 기업의 AI 도입과 업무 혁신을 위한 솔루션을 단계적으로 확장합니다.",
  status: "기업 AI 사업 소개입니다. 구축 가능한 범위와 장기 플랫폼 기능을 구분해 안내하며, 도입 범위는 상담으로 확인합니다.",
  why: {
    kicker: "Why Enterprise AI",
    title: "반복되는 업무를 넘어,\n기업의 일하는 방식을 연결합니다.",
    lead: "",
    body: [
      "기업의 정보와 업무는 다양한 문서, 부서, 시스템에 분산되어 있습니다. 직원은 필요한 정보를 찾고, 여러 시스템을 오가며 반복적인 업무를 처리해야 합니다.",
      "NEWON Enterprise AI는 기업의 업무 구조와 데이터 환경을 고려하여 정보 탐색, 업무 지원, 자동화 및 시스템 연결을 단계적으로 구축하는 것을 목표로 합니다.",
    ],
    items: [
      { n: "01", title: "분산된 사내 정보", body: "문서와 시스템에 흩어진 업무 정보를 필요한 순간에 탐색할 수 있도록 지원합니다." },
      { n: "02", title: "반복적인 업무", body: "문서 작성, 정보 정리, 업무 요청 처리 등 반복되는 업무의 자동화를 지원합니다." },
      { n: "03", title: "연결되지 않은 시스템", body: "기업이 사용하는 다양한 업무 도구와 데이터의 연결을 지원합니다." },
      { n: "04", title: "조직별로 다른 업무 방식", body: "기업 규모와 산업, 부서의 특성에 맞는 AI 도입 구조를 설계합니다." },
      { n: "05", title: "AI 도입 이후의 운영", body: "사용 현황, 품질, 비용, 보안 및 접근 권한을 지속적으로 관리하는 방향으로 확장합니다." },
    ],
  },
  areasKicker: "핵심 솔루션",
  areasTitle: "기업 AI 사업의\n네 가지 중심 구조.",
  areasLead: "챗봇 하나를 만드는 사업이 아닙니다. 상담으로 구축 범위를 정하고, 아직 없는 플랫폼 기능은 향후 계획으로 구분해 안내합니다.",
  areas: [
    {
      n: "01",
      en: "ASSISTANT",
      title: "기업 전용 AI Assistant",
      body: "사내 업무 지식과 문서를 바탕으로 직원의 질문에 답하고 필요한 정보를 탐색하도록 지원합니다. 도입 범위는 기업의 자료와 보안 요건을 검토한 뒤 정합니다.",
      uses: ["사내 규정 및 업무 매뉴얼 검색", "제품·서비스 정보 탐색", "프로젝트 문서 검색", "내부 업무 질문과 답변", "문서 요약 및 초안 작성", "신규 직원 업무 적응 지원"],
    },
    {
      n: "02",
      en: "AGENT",
      title: "업무 실행형 AI Agent",
      body: "질문과 답변을 넘어 여러 업무 단계를 연결하고, 필요한 도구로 업무를 지원합니다. 중요한 변경에는 권한 확인과 담당자 승인을 적용하는 방향으로 소개합니다.",
      uses: ["업무 요청 접수 및 분류", "필요한 정보 조회", "문서·보고서 초안 작성", "반복 데이터 정리", "업무 시스템 내 요청 처리", "담당자 승인 후 후속 작업"],
      planned: true,
    },
    {
      n: "03",
      en: "INTEGRATION",
      title: "기업 데이터 및 시스템 연동",
      body: "기존 데이터와 업무 시스템을 AI와 연결하는 영역입니다. 모든 시스템과 즉시 연동된다고 보지 않으며, API·권한·데이터 구조·보안을 검토한 뒤 결정합니다.",
      uses: ["내부 문서 저장소", "업무 데이터베이스", "ERP·CRM·그룹웨어", "고객관리 시스템", "사내 업무 도구", "기업별 API 및 외부 서비스"],
      planned: true,
    },
    {
      n: "04",
      en: "PLATFORM",
      title: "기업 AI 운영 플랫폼",
      body: "여러 AI Assistant와 Agent를 통합 운영·관리하는 플랫폼으로 확장하는 사업입니다. 아래 기능은 향후 확장 계획입니다.",
      uses: ["조직별 AI 서비스 관리", "Agent 실행 현황", "사용자·부서별 접근 권한", "승인 및 실행 기록", "사용량과 비용 관리", "품질·운영 상태 점검"],
      planned: true,
    },
  ],
  caps: {
    kicker: "Business capabilities",
    title: "세부 사업 영역으로\n범위를 넓혀갑니다.",
    lead: "핵심 네 구조를 실제 업무와 기능으로 나눈 확장 분야입니다. 구현되지 않은 항목은 향후 계획입니다.",
    items: [
      { n: "01", en: "ASSISTANT", title: "기업 전용 AI 어시스턴트", body: "사내 문서와 업무 지식을 바탕으로 정보 탐색, 질문과 답변, 문서 작성 및 직원 업무를 지원합니다." },
      { n: "02", en: "AI AGENT", title: "업무 실행형 AI Agent", body: "여러 업무 단계를 연결하고 반복 업무를 자동화하며, 필요한 경우 담당자 승인 아래 후속 작업을 실행합니다.", planned: true },
      { n: "03", en: "DATA", title: "기업 데이터 분석 AI", body: "매출·고객·재고·운영 정보 탐색과 보고서 작성을 지원합니다. 최종 경영 판단을 대신하지 않습니다.", planned: true },
      { n: "04", en: "CX", title: "고객 상담 및 영업 AI", body: "문의 응대, 상담 정리, 상품 안내, 영업 자료 작성과 고객관리 업무를 지원합니다.", planned: true },
      { n: "05", en: "BACK OFFICE", title: "경영지원 및 사무 자동화", body: "인사, 총무, 회계, 구매, 계약 및 사내 요청 처리 등 반복적인 경영지원 업무를 지원합니다.", planned: true },
      { n: "06", en: "INTEGRATION", title: "사내 시스템 및 데이터 연동", body: "ERP, CRM, 그룹웨어, 문서 저장소 등과 AI를 연결하여 정보 조회와 업무 흐름을 지원합니다.", planned: true },
      { n: "07", en: "DEV / IT", title: "개발 및 IT 운영 AI", body: "기술 문서 검색, 테스트 작성, 장애 분석, IT 문의 대응 등 개발·IT 운영 업무를 지원합니다.", planned: true },
      { n: "08", en: "INDUSTRY", title: "산업별 특화 AI", body: "제조, 유통, 물류, 교육, 숙박, 전문 서비스 등 산업별 업무 구조에 맞는 솔루션으로 확장합니다.", planned: true },
      { n: "09", en: "PRIVATE AI", title: "기업 전용 AI 인프라", body: "데이터 처리와 보안 요구에 맞춰 전용 환경, 접근 권한, 보관 정책을 검토합니다.", planned: true },
      { n: "10", en: "OPERATIONS", title: "AI 운영 및 관리 플랫폼", body: "여러 Agent의 실행, 사용량, 비용, 품질, 권한과 승인 내역을 통합 관리하는 방향으로 확장합니다.", planned: true },
    ],
  },
  depts: {
    kicker: "Department AI",
    title: "부서의 실제 업무에\n맞춰 활용합니다.",
    lead: "도입 사례나 성과가 아니라, 부서별 업무 상황에 따른 활용 방향입니다.",
    items: [
      { n: "01", title: "경영 및 전략", body: "기업 데이터 탐색, 보고서 작성, 회의자료 정리, 업무 현황 분석 지원." },
      { n: "02", title: "인사 및 총무", body: "사내 규정 검색, 직원 문의 대응, 내부 요청 처리, 문서 및 일정 관리 지원." },
      { n: "03", title: "재무 및 회계", body: "회계 자료 정리, 비용 데이터 분석, 보고서 초안 작성과 반복 업무 지원. 재무 판단을 대신하지 않습니다." },
      { n: "04", title: "영업 및 마케팅", body: "고객 정보 탐색, 영업 자료 작성, 캠페인 분석, 콘텐츠 제작 및 고객관리 지원." },
      { n: "05", title: "고객지원", body: "문의 분류, 상담 응대 지원, 상담 요약 및 관련 정보 검색." },
      { n: "06", title: "개발 및 IT", body: "기술 문서 탐색, 코드 검색, 테스트 지원, IT 문의 대응 및 운영 정보 정리." },
      { n: "07", title: "구매 및 운영", body: "구매 요청 정리, 재고·운영 데이터 탐색, 공급업체 정보 정리, 반복 업무 지원." },
      { n: "08", title: "법무 및 계약", body: "계약 관련 자료 탐색, 문서 비교, 초안 정리를 지원합니다. 법률 판단과 최종 검토는 담당자와 전문가가 수행합니다." },
    ],
  },
  scale: {
    kicker: "By organization size",
    title: "규모와 운영 환경에 따라\n도입 방식이 달라집니다.",
    lead: "모든 기업에 같은 솔루션을 적용한다고 보지 않습니다. 업무 범위, 데이터 환경, 보안 요건에 따라 설계합니다.",
    note: "실제 범위와 일정은 요구사항에 따라 달라질 수 있습니다.",
    items: [
      { n: "01", title: "소상공인 및 소규모 사업장", body: "고객 문의, 예약 안내, 상품 정보, 매출 자료 정리 등 일상 운영 업무를 지원하는 방향입니다." },
      { n: "02", title: "스타트업 및 중소기업", body: "영업, 마케팅, 경영지원, 사내 지식 검색과 여러 업무 도구 간 자동화를 지원하는 방향입니다." },
      { n: "03", title: "중견기업 및 대기업", body: "부서별 Agent, 내부 시스템 연동, 조직 단위 권한 관리와 전사 운영 체계를 검토합니다.", planned: true },
      { n: "04", title: "기관 및 공공 분야", body: "행정 업무, 문서 탐색, 민원 안내 등 운영 환경과 보안 요구를 고려한 활용을 검토합니다.", planned: true },
    ],
  },
  industry: {
    kicker: "Industry AI",
    title: "산업별 업무 구조에 맞는\n솔루션으로 확장합니다.",
    lead: "모두 구축 완료된 제품이 아닙니다. 기업별 업무와 데이터를 분석한 뒤 맞춤형으로 확장하는 방향입니다.",
    note: "헬스케어는 비진료 행정·안내 업무를 중심으로 검토하며, 진단·치료 판단을 자동 제공한다고 보지 않습니다.",
    items: [
      { n: "01", title: "제조", body: "생산 문서 탐색, 설비 운영정보 정리, 품질 관련 데이터 분석 및 업무 지원.", planned: true },
      { n: "02", title: "유통 및 커머스", body: "상품 정보 관리, 고객 문의, 판매 데이터 분석, 재고 및 운영 업무 지원.", planned: true },
      { n: "03", title: "물류", body: "운송·재고 정보 탐색, 운영 현황 정리, 반복적인 물류 업무 지원.", planned: true },
      { n: "04", title: "교육", body: "행정 업무, 학습자료 관리, 내부 지식 검색 및 교육 운영 지원.", planned: true },
      { n: "05", title: "숙박 및 서비스", body: "예약 문의, 고객 안내, 운영 매뉴얼 탐색 및 서비스 업무 지원.", planned: true },
      { n: "06", title: "전문 서비스", body: "기업 문서와 업무 지식을 활용한 자료 검색, 문서 작성 및 내부 업무 지원.", planned: true },
      { n: "07", title: "헬스케어 관련 기관", body: "일반 행정, 내부 문서 검색, 예약 및 안내 등 비진료 영역의 활용 가능성을 검토합니다.", planned: true },
    ],
  },
  arch: {
    kicker: "Enterprise architecture",
    title: "기업의 데이터와 업무 시스템을,\n하나의 AI 경험으로.",
    lead: "모든 데이터가 자동으로 제공되거나 모든 시스템에 자유롭게 접근하는 구조가 아닙니다. 권한과 보안 정책에 따라 필요한 범위만 연결합니다.",
    note: "연결 가능 여부는 시스템별 API, 접근 권한, 데이터 구조, 보안 요구를 검토한 뒤 결정합니다.",
    items: [
      { n: "01", title: "DATA", body: "내부 문서, 데이터베이스, 업무 매뉴얼 및 운영 데이터." },
      { n: "02", title: "KNOWLEDGE", body: "문서와 업무 정보를 AI가 검색·활용할 수 있도록 구성하는 지식 기반." },
      { n: "03", title: "AI ASSISTANT & AGENT", body: "정보 탐색, 업무 지원, 문서 작성 및 승인 기반 업무 실행." },
      { n: "04", title: "INTEGRATION", body: "ERP, CRM, 그룹웨어 및 업무 도구와의 연결." },
      { n: "05", title: "GOVERNANCE", body: "사용자 권한, 데이터 접근 정책, 실행 승인, 운영 기록, 비용 및 품질 관리." },
    ],
  },
  security: {
    kicker: "Security & governance",
    title: "권한, 승인, 운영을\n함께 설계합니다.",
    lead: "구현되지 않은 보안 기능이나 미취득 인증을 보유한 것처럼 소개하지 않습니다. 아래는 설계·검토 영역입니다.",
    note: "완벽한 보안, 모든 규제 준수, 데이터 외부 전송 없음, 국제 인증 완료와 같은 표현은 사용하지 않습니다. 기업별 보안 요구를 검토합니다.",
    items: [
      { n: "01", title: "접근 권한", body: "사용자 및 조직별 접근 권한, 데이터 접근 범위 관리." },
      { n: "02", title: "민감정보와 보관", body: "민감정보 처리, 데이터 보관 및 삭제 정책을 기업 요구에 맞춰 검토합니다." },
      { n: "03", title: "실행 전 승인", body: "중요한 업무 실행과 외부 시스템 변경 전에 담당자 승인을 적용하는 방향입니다." },
      { n: "04", title: "기록과 품질", body: "실행·변경 이력, 응답 품질 점검, 사용량과 비용 관리." },
      { n: "05", title: "연동 권한", body: "외부 시스템 연동 권한과 기업별 보안 요구사항을 검토합니다." },
    ],
  },
  process: {
    kicker: "Implementation",
    title: "진단에서 운영까지,\n단계적으로 구축합니다.",
    lead: "기업별 구축 범위와 일정은 실제 요구사항에 따라 달라질 수 있습니다.",
    note: "아래는 도입 과정 안내이며, 즉시 착수되는 표준 패키지가 아닙니다.",
    steps: [
      { n: "01", title: "업무 진단", body: "업무 환경, 반복 업무, 데이터 구조 및 AI 도입 목적을 파악합니다." },
      { n: "02", title: "도입 설계", body: "적용 범위, AI 기능, 데이터 접근 권한, 시스템 연동 및 운영 요건을 검토합니다." },
      { n: "03", title: "PoC 및 시범 구축", body: "제한된 업무 범위에서 기능을 구축하고 실제 업무에 적용할 수 있는지 검증합니다." },
      { n: "04", title: "실제 업무 연동", body: "검증된 기능을 기존 업무 도구·시스템과 연결하고 필요한 승인 절차를 구성합니다." },
      { n: "05", title: "운영 및 고도화", body: "사용 현황, 응답 품질, 비용, 보안, 업무 활용도를 점검하며 기능을 개선합니다." },
    ],
  },
  model: {
    kicker: "Business model",
    title: "검토 중인 수익화 방향.",
    lead: "향후 검토 가능한 사업 모델입니다. 확정되지 않은 가격, 구독료, 수수료, 계약 실적, 예상 매출은 표시하지 않습니다.",
    note: "이미 운영 중인 과금 체계가 아니라, 상담을 통해 적합한 방식을 검토합니다.",
    items: [
      { n: "01", title: "맞춤형 AI 구축", body: "업무 환경에 맞는 Assistant, Agent 및 자동화 구축 프로젝트.", planned: true },
      { n: "02", title: "기업용 SaaS 구독", body: "여러 기업이 공통으로 쓸 수 있는 기능을 표준화한 월간·연간 구독.", planned: true },
      { n: "03", title: "사용량 기반 과금", body: "처리량, 사용자 수, Agent 실행량 등 특성에 맞는 사용량 과금.", planned: true },
      { n: "04", title: "시스템 연동 및 고도화", body: "기존 시스템 연동, 추가 기능, 운영 환경 개선 및 유지관리.", planned: true },
      { n: "05", title: "기업 전용 AI 환경", body: "데이터 처리와 보안 요구를 고려한 전용 환경 구축과 운영.", planned: true },
      { n: "06", title: "산업별 특화 솔루션", body: "제조, 유통, 물류, 교육, 숙박 등 산업 업무 구조에 맞는 솔루션.", planned: true },
    ],
  },
  roadmap: {
    kicker: "Expansion roadmap",
    title: "개별 기능에서\n운영 플랫폼으로.",
    lead: "확정되지 않은 완료 시점, 출시 일정, 고객사 수, 매출 목표는 표시하지 않습니다.",
    note: "현재 운영 현황이 아니라 단계별 확장 방향입니다.",
    stages: [
      { n: "01", title: "기업 전용 AI Assistant", body: "사내 문서·업무 지식 검색, 질문과 답변, 문서 작성 등 정보 탐색과 업무 지원." },
      { n: "02", title: "업무 자동화 및 AI Agent", body: "반복 업무 자동화와 여러 업무 단계를 연결하는 Agent를 구축합니다." },
      { n: "03", title: "기업 시스템 및 데이터 연동", body: "내부 데이터와 ERP, CRM, 그룹웨어 등 기존 업무 시스템의 연결 범위를 확대합니다." },
      { n: "04", title: "기업 AI SaaS", body: "여러 기업이 공통으로 활용할 수 있는 기능을 표준화하여 구독형 서비스로 확장합니다." },
      { n: "05", title: "산업별 특화 AI", body: "제조, 유통, 물류, 교육, 숙박 및 전문 서비스 등 산업 업무 구조에 맞는 솔루션으로 확장합니다." },
      { n: "06", title: "기업 AI 운영 플랫폼", body: "여러 Assistant와 Agent의 실행 현황, 권한, 비용, 품질을 통합 관리하는 플랫폼으로 발전시킵니다." },
    ],
  },
  note: "기업 AI는 제품·기능·Agent를 설계합니다. Newon Business의 AI Automation은 업무 흐름에 AI를 적용하는 구축입니다. 두 사업은 수요와 기능을 주고받을 수 있으며, 현재 자동 연동되어 있지는 않습니다.",
  closeKicker: "NEWON AI · ENTERPRISE",
  closeTitleHtml: "조직에 맞는 AI를<br />함께 살펴보세요.",
  closeLead: "기업의 업무 환경과 도입 목적에 맞는 AI 활용 방안을 함께 검토합니다. 반복 업무 자동화부터 기업 전용 AI 시스템 구축까지, 필요한 업무 범위를 알려주세요.",
  closeTopics: [
    "기업 전용 AI Assistant",
    "업무 자동화 및 AI Agent",
    "사내 문서와 데이터 활용",
    "기존 업무 시스템 연동",
    "기업별 맞춤형 AI 구축",
    "산업별 AI 도입 검토",
    "기업 AI 장기 도입 및 확장 계획",
  ],
  ctaInquiry: "기업 AI 문의하기",
  ctaPersonal: "개인 AI 보기",
};

const EN = {
  seoTitle: "Enterprise AI | Newon AI — AI that understands work and connects to action",
  seoDescription:
    "Company AI assistants, work agents, system integration, and an AI operations platform. A business introduction — scope is confirmed through inquiry.",
  switchAria: "Newon AI sections",
  personal: "Personal AI",
  enterprise: "Enterprise AI",
  plannedFlag: "Later expansion",
  kicker: "NEWON AI · ENTERPRISE",
  titleHtml: "AI that understands company work<br />and connects it to action.",
  lead: "From an AI assistant shaped to your data and work environment, to work-running agents, system integration, and a company AI platform. We expand solutions for AI adoption step by step.",
  status: "This page introduces the Enterprise AI business. We separate what can be scoped through inquiry from later platform features. Scope is confirmed through inquiry.",
  why: {
    kicker: "Why Enterprise AI",
    title: "Beyond repeat tasks,\nconnecting how the company works.",
    lead: "",
    body: [
      "Company information and work sit across documents, teams, and systems. People hunt for answers and move between tools to finish repeat work.",
      "NEWON Enterprise AI aims to build information search, work support, automation, and system links step by step, around how the company actually operates and stores data.",
    ],
    items: [
      { n: "01", title: "Scattered internal information", body: "Help people find work information that lives in documents and systems when they need it." },
      { n: "02", title: "Repeat work", body: "Support automation of drafting, sorting information, and handling routine requests." },
      { n: "03", title: "Unconnected systems", body: "Support linking the work tools and data a company already uses." },
      { n: "04", title: "Different ways of working", body: "Design an AI approach that fits size, industry, and how each team works." },
      { n: "05", title: "Running AI after launch", body: "Expand toward ongoing management of use, quality, cost, security, and access." },
    ],
  },
  areasKicker: "Core solutions",
  areasTitle: "Four pillars of\nthe Enterprise AI business.",
  areasLead: "This is not a one-chatbot build. Scope is set through inquiry. Unbuilt platform features are marked as later plans.",
  areas: [
    {
      n: "01",
      en: "ASSISTANT",
      title: "Company AI assistant",
      body: "Answers staff questions and finds information from internal knowledge and documents. Scope is set after reviewing materials and security needs.",
      uses: ["Policies and manuals", "Product and service lookup", "Project documents", "Internal Q&A", "Summaries and drafts", "Support for new staff"],
    },
    {
      n: "02",
      en: "AGENT",
      title: "Work-running AI agent",
      body: "Goes beyond Q&A to link work steps and use tools. Sensitive changes are designed with permission checks and owner approval.",
      uses: ["Intake and sorting of requests", "Looking up needed information", "Drafts of documents and reports", "Repeat data cleanup", "Requests inside work systems", "Follow-up after approval"],
      planned: true,
    },
    {
      n: "03",
      en: "INTEGRATION",
      title: "Company data and systems",
      body: "Connect existing data and work systems to AI. We do not claim instant links to every system — API, access, data shape, and security are reviewed first.",
      uses: ["Internal document stores", "Work databases", "ERP, CRM, groupware", "Customer systems", "Internal work tools", "Company APIs and outside services"],
      planned: true,
    },
    {
      n: "04",
      en: "PLATFORM",
      title: "Company AI operations platform",
      body: "A later expansion to run and manage several assistants and agents in one place. Features below are planned.",
      uses: ["AI services by team", "Agent run status", "User and department access", "Approval and run history", "Usage and cost", "Quality and health checks"],
      planned: true,
    },
  ],
  caps: {
    kicker: "Business capabilities",
    title: "A wider set of\nwork areas.",
    lead: "How the four pillars extend into real work. Unbuilt items are later plans.",
    items: [
      { n: "01", en: "ASSISTANT", title: "Company AI assistant", body: "Search, Q&A, drafting, and staff support from internal documents and work knowledge." },
      { n: "02", en: "AI AGENT", title: "Work-running agent", body: "Link work steps, automate repeats, and run follow-up under owner approval when needed.", planned: true },
      { n: "03", en: "DATA", title: "Company data intelligence", body: "Help explore sales, customer, stock, and operations data and draft reports. It does not replace management judgment.", planned: true },
      { n: "04", en: "CX", title: "Customer and sales AI", body: "Support replies, call notes, product guidance, sales materials, and customer work.", planned: true },
      { n: "05", en: "BACK OFFICE", title: "Back-office automation", body: "Support repeat HR, admin, accounting, purchasing, contracts, and internal requests.", planned: true },
      { n: "06", en: "INTEGRATION", title: "Systems and data links", body: "Connect AI to ERP, CRM, groupware, and document stores for lookup and work flow.", planned: true },
      { n: "07", en: "DEV / IT", title: "Engineering and IT AI", body: "Support tech-doc search, tests, incident notes, and IT questions.", planned: true },
      { n: "08", en: "INDUSTRY", title: "Industry AI", body: "Expand toward manufacturing, retail, logistics, education, hospitality, and professional services.", planned: true },
      { n: "09", en: "PRIVATE AI", title: "Private AI environment", body: "Review dedicated environments, access, and retention around data and security needs.", planned: true },
      { n: "10", en: "OPERATIONS", title: "AI operations platform", body: "Expand toward unified management of runs, usage, cost, quality, access, and approvals.", planned: true },
    ],
  },
  depts: {
    kicker: "Department AI",
    title: "Used around\nhow each team works.",
    lead: "Directions by department — not client stories or results.",
    items: [
      { n: "01", title: "Leadership and strategy", body: "Explore company data, draft reports, tidy meeting notes, and support status reviews." },
      { n: "02", title: "People and admin", body: "Policy search, staff questions, internal requests, documents, and schedules." },
      { n: "03", title: "Finance and accounting", body: "Tidy accounting files, explore cost data, draft reports. Does not replace financial judgment." },
      { n: "04", title: "Sales and marketing", body: "Customer lookup, sales materials, campaign notes, content, and customer work." },
      { n: "05", title: "Customer support", body: "Sort questions, support replies, summarize conversations, and find related information." },
      { n: "06", title: "Engineering and IT", body: "Tech docs, code search, test help, IT questions, and operations notes." },
      { n: "07", title: "Purchasing and operations", body: "Purchase requests, stock and operations lookup, supplier notes, repeat work." },
      { n: "08", title: "Legal and contracts", body: "Find contract files, compare documents, tidy drafts. Legal judgment and final review stay with people." },
    ],
  },
  scale: {
    kicker: "By organization size",
    title: "Adoption changes\nwith size and setting.",
    lead: "We do not apply one solution to every company. Design follows work scope, data, and security.",
    note: "Actual scope and timing depend on requirements.",
    items: [
      { n: "01", title: "Small businesses", body: "Support everyday operations: questions, booking guidance, product information, and sales notes." },
      { n: "02", title: "Startups and SMEs", body: "Support sales, marketing, back office, internal search, and automation across work tools." },
      { n: "03", title: "Mid-size and large companies", body: "Review department agents, internal system links, org-level access, and company-wide operations.", planned: true },
      { n: "04", title: "Institutions and public bodies", body: "Review admin work, document search, and public guidance with their operating and security needs.", planned: true },
    ],
  },
  industry: {
    kicker: "Industry AI",
    title: "Toward solutions that fit\nhow each industry works.",
    lead: "These are not finished products. We expand after looking at each company’s work and data.",
    note: "Healthcare is reviewed around non-clinical admin and guidance. We do not present automatic diagnosis or treatment.",
    items: [
      { n: "01", title: "Manufacturing", body: "Production documents, equipment notes, quality data, and work support.", planned: true },
      { n: "02", title: "Retail and commerce", body: "Product information, customer questions, sales data, stock and operations.", planned: true },
      { n: "03", title: "Logistics", body: "Transport and stock lookup, operations notes, repeat logistics work.", planned: true },
      { n: "04", title: "Education", body: "Admin work, learning materials, internal search, and education operations.", planned: true },
      { n: "05", title: "Hospitality and services", body: "Booking questions, guest guidance, operations manuals, and service work.", planned: true },
      { n: "06", title: "Professional services", body: "Search and drafting from firm documents and work knowledge.", planned: true },
      { n: "07", title: "Healthcare organizations", body: "Review non-clinical admin, internal search, booking and guidance.", planned: true },
    ],
  },
  arch: {
    kicker: "Enterprise architecture",
    title: "Company data and work systems,\nas one AI experience.",
    lead: "Not a structure where every dataset is fed in automatically or every system is open. Access stays limited by permission and security policy.",
    note: "Whether a link is possible is decided after reviewing APIs, access, data shape, and security needs.",
    items: [
      { n: "01", title: "DATA", body: "Internal documents, databases, manuals, and operations data." },
      { n: "02", title: "KNOWLEDGE", body: "A knowledge base so AI can search and use company documents and work information." },
      { n: "03", title: "AI ASSISTANT & AGENT", body: "Search, work support, drafting, and approval-based action." },
      { n: "04", title: "INTEGRATION", body: "Links to ERP, CRM, groupware, and work tools." },
      { n: "05", title: "GOVERNANCE", body: "User access, data policy, run approval, records, cost, and quality." },
    ],
  },
  security: {
    kicker: "Security & governance",
    title: "Designed with access,\napproval, and operations.",
    lead: "We do not claim unbuilt security features or certifications we do not hold. The list below is design and review work.",
    note: "We do not use claims such as perfect security, full regulatory coverage, no data leaving the company, or completed international certification. We review each company’s security needs.",
    items: [
      { n: "01", title: "Access", body: "User and organization access, and the range of data that can be used." },
      { n: "02", title: "Sensitive data and retention", body: "Review handling of sensitive information, retention, and deletion against company needs." },
      { n: "03", title: "Approval before action", body: "Sensitive runs and outside-system changes are designed with owner approval." },
      { n: "04", title: "Records and quality", body: "Run and change history, quality checks, usage, and cost." },
      { n: "05", title: "Integration rights", body: "Review rights to link outside systems and each company’s security requirements." },
    ],
  },
  process: {
    kicker: "Implementation",
    title: "From diagnosis to operations,\nbuilt in stages.",
    lead: "Scope and timing can change with real requirements.",
    note: "A guide to the introduction path — not a standard package that starts on request.",
    steps: [
      { n: "01", title: "Work diagnosis", body: "Understand the work environment, repeat tasks, data, and the aim of introducing AI." },
      { n: "02", title: "Adoption design", body: "Review work scope, AI features, data access, system links, and operating needs." },
      { n: "03", title: "PoC and limited build", body: "Build in a limited work area and check whether it can be used in real work." },
      { n: "04", title: "Link to live work", body: "Connect proven features to existing tools and set needed approval steps." },
      { n: "05", title: "Operate and improve", body: "Review use, quality, cost, security, and usefulness, then improve." },
    ],
  },
  model: {
    kicker: "Business model",
    title: "Revenue directions\nunder review.",
    lead: "Possible models later. Unconfirmed prices, fees, contracts, and revenue are not shown.",
    note: "Not a live pricing system. Fit is reviewed through inquiry.",
    items: [
      { n: "01", title: "Tailored AI build", body: "Projects for assistants, agents, and automation matched to the work environment.", planned: true },
      { n: "02", title: "Company SaaS subscription", body: "Shared features offered as a monthly or yearly subscription.", planned: true },
      { n: "03", title: "Usage-based charging", body: "Charging by volume, seats, or agent runs, matched to the service.", planned: true },
      { n: "04", title: "Integration and improvement", body: "Links to existing systems, extra features, environment work, and upkeep.", planned: true },
      { n: "05", title: "Private AI environment", body: "Dedicated environments and operations around data and security needs.", planned: true },
      { n: "06", title: "Industry solutions", body: "Solutions shaped to manufacturing, retail, logistics, education, hospitality, and similar work.", planned: true },
    ],
  },
  roadmap: {
    kicker: "Expansion roadmap",
    title: "From single features\nto an operations platform.",
    lead: "Unconfirmed finish dates, launch dates, client counts, and revenue targets are not shown.",
    note: "A staged expansion direction, not a claim of current operations.",
    stages: [
      { n: "01", title: "Company AI assistant", body: "Document and knowledge search, Q&A, and drafting to support information work." },
      { n: "02", title: "Automation and agents", body: "Build agents that automate repeats and link work steps." },
      { n: "03", title: "Systems and data", body: "Widen links to internal data and ERP, CRM, groupware, and other work systems." },
      { n: "04", title: "Company AI SaaS", body: "Standardize shared features into a subscription service." },
      { n: "05", title: "Industry AI", body: "Expand toward manufacturing, retail, logistics, education, hospitality, and professional services." },
      { n: "06", title: "AI operations platform", body: "Grow into a platform that manages runs, access, cost, and quality across assistants and agents." },
    ],
  },
  note: "Enterprise AI designs products, features, and agents. Newon Business AI Automation applies AI to a company’s work flow. The two can share demand and capabilities. They are not technically linked today.",
  closeKicker: "NEWON AI · ENTERPRISE",
  closeTitleHtml: "Let’s look at AI<br />that fits the work.",
  closeLead: "We review AI options that fit the work environment and the aim of adoption. Tell us the work range you need, from repeat-task automation to a company AI system.",
  closeTopics: [
    "Company AI assistant",
    "Automation and AI agents",
    "Using internal documents and data",
    "Linking existing work systems",
    "A tailored company AI build",
    "Industry AI review",
    "A longer Enterprise AI adoption plan",
  ],
  ctaInquiry: "Inquire about Enterprise AI",
  ctaPersonal: "See Personal AI",
};

export function getAiEnterpriseCopy(lang) {
  if (lang === "ko") return KO;
  const rest = REST[lang];
  return rest ? deepMerge(EN, rest) : EN;
}

export { KO, EN };
