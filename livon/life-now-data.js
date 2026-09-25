window.LivonMyLifeData = {
  modules: [
    { id: "calendar", title: "통합 일정", desc: "월·주·일 캘린더와 예약·기념일", kicker: "01" },
    { id: "todos", title: "할 일·체크리스트", desc: "일상 할 일과 단계별 준비", kicker: "02" },
    { id: "goals", title: "목표·습관", desc: "진행률과 실천 기록", kicker: "03" },
    { id: "money", title: "생활비·예산", desc: "수입·지출·저축 목표", kicker: "04" },
    { id: "health", title: "건강·생활 루틴", desc: "운동·수면·수분 등 직접 기록", kicker: "05" },
    { id: "saved", title: "저장함", desc: "발견·탐색·스테이지 저장 항목", kicker: "06" },
    { id: "experiences", title: "나의 경험", desc: "관심·계획·완료 활동", kicker: "07" },
    { id: "family", title: "가족 생활", desc: "공유는 백엔드 준비 후 제공", kicker: "08" },
    { id: "journal", title: "나의 기록", desc: "일기·메모·기분 기록", kicker: "09" },
    { id: "projects", title: "생애 전환 준비", desc: "독립·취업·은퇴 등 프로젝트", kicker: "10" },
    { id: "report", title: "생활 리포트", desc: "실제 데이터 기반 요약", kicker: "11" },
    { id: "settings", title: "개인 설정", desc: "스테이지·관심사·표시 설정", kicker: "12" }
  ],
  eventCategories: ["개인", "업무", "가족", "건강", "여가", "예약", "기념일"],
  todoPriorities: ["높음", "보통", "낮음"],
  todoCategories: ["일상", "업무", "학습", "건강", "가정", "기타"],
  goalCategories: ["학습", "운동", "저축", "자기계발", "생활 개선", "커리어", "기타"],
  habitPresets: ["운동", "독서", "공부", "외국어", "수분 섭취", "산책", "명상", "정리 정돈", "일찍 자기"],
  moneyCategories: ["식비", "교통", "주거", "쇼핑", "문화", "건강", "교육", "저축", "급여", "기타"],
  healthKinds: ["운동", "수면", "수분", "식생활", "산책", "마음 챙김"],
  experienceStatuses: ["관심 있음", "계획 중", "참여 예정", "경험 완료", "취소"],
  journalMoods: ["좋음", "보통", "피곤", "설렘", "차분", "기타"],
  checklistTemplates: [
    {
      id: "tpl-indep",
      title: "첫 독립 준비",
      desc: "자취를 위한 기본 체크리스트",
      items: ["예산 정하기", "주거 조건 정리", "매물 탐색", "계약 확인", "이사·입주", "생활 루틴"]
    },
    {
      id: "tpl-job",
      title: "취업 준비",
      desc: "서류부터 면접까지",
      items: ["목표 직무", "이력서·포트폴리오", "채용 탐색", "면접 준비", "입사 체크"]
    },
    {
      id: "tpl-move",
      title: "이사 준비",
      desc: "이사 전후 할 일",
      items: ["일정 확정", "업체 비교", "주소 변경", "정리·포장", "입주 청소", "공과금 연결"]
    },
    {
      id: "tpl-travel",
      title: "여행 준비",
      desc: "짧은 여행 준비",
      items: ["일정", "교통·숙소", "예산", "짐 싸기", "필수 서류"]
    },
    {
      id: "tpl-wedding",
      title: "결혼 준비",
      desc: "기본 준비 항목",
      items: ["일정", "예산", "장소", "청첩", "신혼 생활 세팅"]
    },
    {
      id: "tpl-baby",
      title: "육아 시작",
      desc: "정보·시설·용품",
      items: ["정보 확인", "보육·교육", "용품", "지원 제도", "가족 일정"]
    },
    {
      id: "tpl-care",
      title: "가족 돌봄 준비",
      desc: "필요 파악과 연결",
      items: ["필요 정리", "기관·정보", "일정 공유", "Ongil 연결 검토"]
    },
    {
      id: "tpl-retire",
      title: "은퇴 준비",
      desc: "생활·재무·건강",
      items: ["생활 목표", "연금·생활비", "건강 점검", "여가·배움"]
    }
  ],
  projectTemplates: [
    { id: "proj-college", title: "진학", steps: ["관심 전공", "일정 확인", "상담·체험", "체크리스트"] },
    { id: "proj-job", title: "취업", steps: ["서류", "채용 탐색", "면접", "입사"] },
    { id: "proj-indep", title: "첫 독립", steps: ["예산", "주거", "이사", "생활 루틴"] },
    { id: "proj-move", title: "이사", steps: ["일정", "업체", "포장", "입주"] },
    { id: "proj-career", title: "이직", steps: ["목표", "이직 준비", "면접", "전환"] },
    { id: "proj-marry", title: "결혼", steps: ["일정", "예산", "준비", "신혼"] },
    { id: "proj-baby", title: "육아 시작", steps: ["정보", "시설", "용품", "일정"] },
    { id: "proj-care", title: "가족 돌봄", steps: ["필요", "정보", "일정", "전문 연결"] },
    { id: "proj-retire", title: "은퇴 준비", steps: ["목표", "재무", "건강", "여가"] },
    { id: "proj-after", title: "은퇴 후 새로운 생활", steps: ["루틴", "배움", "사회 연결", "취미"] }
  ],
  stages: {
    "10": { age: "10대", name: "성장과 발견" },
    "20": { age: "20대", name: "독립과 도전" },
    "30": { age: "30대", name: "성장과 균형" },
    "40": { age: "40대", name: "안정과 확장" },
    "50": { age: "50대", name: "전환과 재발견" },
    "60": { age: "60대", name: "새로운 시작" },
    "70": { age: "70대 이상", name: "여유와 연결" }
  },
  interestOptions: ["교육", "진로", "일자리", "주거", "금융", "건강", "가족", "관계", "여행", "문화", "취미", "생활 편의", "지역 생활"],
  situations: ["학생·진학", "취업·이직", "독립·자취", "직장생활", "결혼·동거", "임신·육아", "가족 돌봄", "은퇴 준비", "은퇴 후 생활", "새로운 도전"]
};
