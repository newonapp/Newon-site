/**
 * Before → Process → After use-case flows for Automation-related services.
 * Merged at render time; keeps service copy files smaller.
 */
export const USE_CASE_FLOWS = {
  "ai-automation": {
    ko: [
      {
        t: "문의 자동 분류",
        before: "웹·메일·채팅 문의가 팀마다 흩어져 수동 분류",
        process: ["문의 수집", "AI 주제·긴급도 분류", "담당자 라우팅", "CRM 저장", "후속 알림"],
        after: "담당자가 맥락과 함께 CRM에서 바로 처리",
      },
      {
        t: "답장 초안 생성",
        before: "같은 유형 문의에 매번 비슷한 답변을 직접 작성",
        process: ["문의 내용 분석", "초안 생성", "Human 검수", "발송·기록", "템플릿 개선"],
        after: "검수 후 발송, 응답 시간 단축과 품질 유지",
      },
      {
        t: "리뷰·피드백 정리",
        before: "앱스토어·CS 리뷰를 시트에 복사해 수동 분류",
        process: ["리뷰 수집", "주제·감성 분류", "이슈 클러스터", "요약 리포트", "개선 항목 공유"],
        after: "팀이 우선 개선 포인트를 한 문서로 확인",
      },
      {
        t: "내부 문서 요약",
        before: "긴 회의록·문서를 읽고 핵심만 팀에 공유",
        process: ["문서 업로드", "핵심·액션 추출", "요약 생성", "검수", "Notion·Slack 전달"],
        after: "의사결정용 요약이 운영 채널에 자동 공유",
      },
    ],
    en: [
      {
        t: "Inquiry classification",
        before: "Inquiries scattered across channels with manual triage",
        process: ["Collect", "AI classify topic & urgency", "Route owner", "Save to CRM", "Notify follow-up"],
        after: "Owners work from CRM with full context",
      },
      {
        t: "Reply drafting",
        before: "Similar inquiries answered from scratch each time",
        process: ["Analyze inquiry", "Draft reply", "Human review", "Send & log", "Improve templates"],
        after: "Reviewed sends with faster response times",
      },
      {
        t: "Review synthesis",
        before: "Store and CS reviews copied into sheets manually",
        process: ["Collect reviews", "Topic & sentiment classify", "Cluster issues", "Summary report", "Share priorities"],
        after: "Team sees prioritized improvement themes in one doc",
      },
      {
        t: "Document summary",
        before: "Long notes read end-to-end before sharing highlights",
        process: ["Upload doc", "Extract actions", "Generate summary", "Review", "Post to Notion / Slack"],
        after: "Decision-ready summaries in ops channels",
      },
    ],
  },
  "workflow-automation": {
    ko: [
      {
        t: "고객 문의",
        before: "폼 제출 → 메일함 → 담당자 수동 배정",
        process: ["Form Trigger", "데이터 정리", "CRM 등록", "Slack 알림", "확인 메일", "Follow-up Task"],
        after: "누락 없이 CRM·알림·후속 Task까지 자동 연결",
      },
      {
        t: "주문 처리",
        before: "주문 알림을 보고 시트·DB에 수동 입력",
        process: ["New Order", "데이터 검증", "DB 기록", "내부 알림", "상태 업데이트", "고객 안내"],
        after: "주문 상태가 시스템과 고객 채널에 동기화",
      },
      {
        t: "주간 리포트",
        before: "매주 여러 서비스에서 데이터를 복사·취합",
        process: ["Schedule", "데이터 수집", "정리·계산", "리포트 생성", "메일·Slack 전송"],
        after: "정해진 시간에 리포트가 팀에 자동 전달",
      },
      {
        t: "콘텐츠 승인",
        before: "요청 메일·채팅으로 승인 흐름이 흩어짐",
        process: ["요청 접수", "Task 생성", "담당 배정", "초안·검토", "승인", "게시 알림"],
        after: "승인 이력과 상태가 한 Workflow로 추적",
      },
    ],
    en: [
      {
        t: "Customer inquiry",
        before: "Form → inbox → manual owner assignment",
        process: ["Form trigger", "Normalize data", "CRM entry", "Slack alert", "Confirm email", "Follow-up task"],
        after: "CRM, alerts, and tasks connected without gaps",
      },
      {
        t: "Order handling",
        before: "Orders manually copied into sheets and DB",
        process: ["New order", "Validate", "Record", "Notify team", "Update status", "Customer update"],
        after: "Order state synced across systems and channels",
      },
      {
        t: "Weekly report",
        before: "Weekly manual export from multiple tools",
        process: ["Schedule", "Collect", "Clean & calculate", "Generate report", "Deliver"],
        after: "Reports reach the team on a fixed cadence",
      },
      {
        t: "Content approval",
        before: "Approval requests scattered in mail and chat",
        process: ["Intake", "Create task", "Assign", "Draft & review", "Approve", "Publish notify"],
        after: "Approval history tracked in one workflow",
      },
    ],
  },
  "internal-tools": {
    ko: [
      {
        t: "승인·요청 관리",
        before: "승인 요청이 메일·채팅·시트에 흩어짐",
        process: ["요청 접수", "상태·담당 배정", "승인/반려", "이력 기록", "알림"],
        after: "요청→승인→완료가 한 도구에서 추적",
      },
      {
        t: "운영 대시보드",
        before: "지표를 매번 시트에서 수동 취합",
        process: ["데이터 연동", "지표 계산", "Dashboard 갱신", "역할별 뷰", "알림"],
        after: "팀이 실시간에 가까운 운영 지표 확인",
      },
      {
        t: "내부 CRM",
        before: "고객·리드 정보가 개인 시트에 분산",
        process: ["리드 등록", "상태 관리", "담당 배정", "활동 기록", "리포트"],
        after: "팀 공용 CRM에서 리드 파이프라인 운영",
      },
      {
        t: "재고·자산 관리",
        before: "입출고를 메신저와 시트로 이중 기록",
        process: ["입고/출고", "재고 갱신", "임계치 알림", "이력 조회", "월간 리포트"],
        after: "재고 상태와 이력이 시스템에 일원화",
      },
    ],
    en: [
      {
        t: "Approval & requests",
        before: "Requests spread across mail, chat, and sheets",
        process: ["Intake", "Assign & status", "Approve / reject", "Audit log", "Notify"],
        after: "Request → approval → done tracked in one tool",
      },
      {
        t: "Ops dashboard",
        before: "Metrics rebuilt manually in spreadsheets",
        process: ["Connect data", "Calculate KPIs", "Refresh dashboard", "Role-based views", "Alerts"],
        after: "Near real-time ops metrics for the team",
      },
      {
        t: "Internal CRM",
        before: "Leads stored in personal spreadsheets",
        process: ["Register lead", "Pipeline status", "Assign owner", "Activity log", "Report"],
        after: "Shared CRM for the whole team",
      },
      {
        t: "Inventory tracking",
        before: "Stock updates in chat and sheets twice",
        process: ["In / out", "Update stock", "Threshold alert", "History", "Monthly report"],
        after: "Inventory state centralized with history",
      },
    ],
  },
  "data-reporting": {
    ko: [
      {
        t: "주간 운영 리포트",
        before: "매주 CRM·시트·광고 데이터를 수동 취합",
        process: ["데이터 수집", "정리·정합", "지표 계산", "Dashboard·PDF", "Slack·메일 전송"],
        after: "월요일 아침 팀이 같은 리포트로 시작",
      },
      {
        t: "실시간 KPI",
        before: "핵심 숫자 확인에 여러 탭·툴 이동",
        process: ["API 연동", "스케줄 갱신", "Dashboard", "임계치 알림", "주간 요약"],
        after: "한 화면에서 KPI와 이상 징후 확인",
      },
      {
        t: "부서별 보고",
        before: "팀마다 다른 형식의 Excel 보고",
        process: ["소스 연결", "템플릿 매핑", "자동 생성", "검수", "배포"],
        after: "부서별 포맷을 유지한 채 자동 생성",
      },
      {
        t: "AI 요약 리포트",
        before: "방대한 로그·리뷰를 사람이 읽고 요약",
        process: ["데이터 수집", "AI 분류·요약", "Human 검수", "리포트 저장", "공유"],
        after: "긴 데이터에서 의사결정용 요약만 전달",
      },
    ],
    en: [
      {
        t: "Weekly ops report",
        before: "Weekly manual export from CRM, sheets, and ads",
        process: ["Collect", "Clean & align", "Calculate metrics", "Dashboard / PDF", "Deliver"],
        after: "Team starts Monday with the same report",
      },
      {
        t: "Live KPI board",
        before: "Key numbers checked across many tabs",
        process: ["API sync", "Scheduled refresh", "Dashboard", "Threshold alerts", "Weekly digest"],
        after: "KPIs and anomalies on one screen",
      },
      {
        t: "Department reports",
        before: "Each team submits Excel in a different format",
        process: ["Connect sources", "Map templates", "Auto generate", "Review", "Distribute"],
        after: "Auto-generated reports keep each team's format",
      },
      {
        t: "AI summary report",
        before: "Long logs and reviews summarized by hand",
        process: ["Collect", "AI classify & summarize", "Human review", "Save report", "Share"],
        after: "Decision-ready summaries from large datasets",
      },
    ],
  },
};

export const EXTERNAL_COST_SLUGS = new Set([
  "ai-automation",
  "data-reporting",
  "internal-tools",
  "workflow-automation",
  "mvp",
  "web",
  "landing",
  "app",
  "custom-product",
  "product-launch",
  "internal-system",
  "white-label",
]);
