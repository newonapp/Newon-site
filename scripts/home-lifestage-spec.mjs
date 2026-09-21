/**
 * Extra Life Stage detail content (10s, 12 sits, 15 fields, 3 lessons,
 * 3 planner projects, 6 flows, community, 5 revenue). Merged onto KO/EN.
 */
import { extraFirstPlanner, extraFirstPrompts, firstMoments } from "./home-lifestage-first.mjs";


function age10(lang) {
  const T = {
    ko: {
      age: "10대",
      name: "미래를 준비하는 첫걸음",
      intro: "학교생활과 진로를 고민하고, 미래를 탐색하며 성인 생활을 준비할 수 있는 시기.",
      topics: [
        "학교생활과 학습 습관",
        "내신·수능·입시 준비",
        "대학 및 학과 탐색",
        "진로와 직업 탐색",
        "자격증과 다양한 진로 선택",
        "첫 아르바이트와 근로계약",
        "금융과 소비 습관",
        "성인 준비와 생활 행정",
        "대학생활·취업·독립 준비",
      ],
      cases: [
        { q: "대학과 학과를 어떻게 선택해야 할까요?", a: "관심 분야와 배우고 싶은 내용을 먼저 정리한 뒤, 학과 교육과정과 공식 모집요강을 비교하는 흐름을 안내합니다." },
        { q: "곧 성인이 되는데 무엇부터 준비해야 할까요?", a: "생활 행정, 금융 기초, 근로계약, 독립 준비처럼 일상에서 필요한 기본 지식부터 살펴볼 수 있습니다." },
        { q: "첫 아르바이트를 시작하기 전에 무엇을 알아야 할까요?", a: "근로계약, 근무 조건, 급여와 휴게처럼 일을 시작하기 전 확인할 항목을 단계별로 정리합니다." },
      ],
    },
    en: {
      age: "Teens",
      name: "First steps toward the future",
      intro: "A time to navigate school and career questions, explore a future of your own, and prepare the basics of adult life.",
      topics: [
        "School life and study habits",
        "Grades, exams, and admissions prep",
        "Exploring universities and majors",
        "Career and job exploration",
        "Credentials and other pathways",
        "First part-time work and contracts",
        "Money and spending habits",
        "Adult-prep and everyday admin",
        "Campus, work, and moving-out prep",
      ],
      cases: [
        { q: "How should I choose a university and major?", a: "Start with what you want to learn, then compare program details and official admissions guides." },
        { q: "I’m becoming an adult soon. What should I prepare first?", a: "Begin with everyday admin, money basics, work contracts, and independent-living prep." },
        { q: "What should I know before my first part-time job?", a: "Review the work contract, hours, pay, and rest breaks before you start." },
      ],
    },
  };
  return { id: "10", ...(T[lang] || T.en) };
}

function extraSits(lang) {
  const T = {
    ko: [
      {
        id: "exam",
        title: "입시를 준비하고 있어요",
        desc: "대학과 전형의 기본 구조를 이해하고, 공식 자료를 기준으로 준비 일정을 정리하는 상황입니다.",
        knowledge: "대학·학과 탐색, 수시·정시 전형 이해, 공식 모집요강, 학습 일정",
        plan: "관심 전공 정리, 자료 확인 일정, 지원 준비 체크리스트",
        tools: "Life Knowledge, Life Planner",
        apps: "GoalUp, OX MONTH, CountUp",
        connect: "공식 입시 자료와 진로·교육 정보 탐색. 합격 예측은 하지 않습니다.",
      },
      {
        id: "major",
        title: "진로와 전공을 고민하고 있어요",
        desc: "관심 분야와 배우고 싶은 내용을 정리하고, 전공·직업·교육 경로를 비교하는 상황입니다.",
        knowledge: "직업과 직무 탐색, 전공과 진로의 연결, 필요한 역량과 교육",
        plan: "관심 분야 메모, 비교 항목, 상담·자료 확인 일정",
        tools: "Life Knowledge, Life AI, Life Career & Education",
        apps: "GoalUp, CountUp",
        connect: "진로 지식과 향후 교육·상담 연결 방향",
      },
      {
        id: "adult",
        title: "곧 성인이 돼요",
        desc: "생활 행정, 금융 기초, 근로계약, 독립처럼 성인이 되면 달라지는 절차를 미리 익히는 상황입니다.",
        knowledge: "성인 전환 준비, 생활 행정, 첫 아르바이트, 독립 준비",
        plan: "필수 행정 항목, 금융 기초 학습, 성인 전환 체크리스트",
        tools: "Life Knowledge, Life Planner",
        apps: "Savy, GoalUp",
        connect: "생활 행정 지식과 향후 전문가·공공 정보 연결",
      },
      {
        id: "parttime",
        title: "첫 아르바이트를 시작해요",
        desc: "일을 시작하기 전 근로계약과 근무 조건을 이해하고, 첫 급여를 어떻게 다루는지 준비하는 상황입니다.",
        knowledge: "근로계약, 근무 시간·휴게, 급여와 세금 기초",
        plan: "계약 확인 항목, 근무 일정, 첫 급여 관리 체크리스트",
        tools: "Life Knowledge, Life Planner, Life Finance & Housing",
        apps: "Savy, PiggyUp",
        connect: "근로·금융 기초 지식과 향후 상담 연결 방향",
      },
    ],
    en: [
      {
        id: "exam",
        title: "I’m preparing for university admissions",
        desc: "A moment to understand how admissions work and organize a plan from official materials — not predicted outcomes.",
        knowledge: "Universities and majors, admissions tracks, official guides, study calendar",
        plan: "Majors of interest, document dates, application checklist",
        tools: "Life Knowledge, Life Planner",
        apps: "GoalUp, OX MONTH, CountUp",
        connect: "Official admissions materials and career-education information. No admission predictions.",
      },
      {
        id: "major",
        title: "I’m choosing a path and a major",
        desc: "A moment to name what you want to learn and compare majors, jobs, and education routes.",
        knowledge: "Jobs and roles, linking majors to paths, skills and education needed",
        plan: "Interest notes, comparison points, counseling and research dates",
        tools: "Life Knowledge, Life AI, Life Career & Education",
        apps: "GoalUp, CountUp",
        connect: "Career knowledge and later education or counseling connections",
      },
      {
        id: "adult",
        title: "I’m becoming an adult soon",
        desc: "A moment to learn the admin, money, work-contract, and independent-living basics that change with adulthood.",
        knowledge: "Adult-prep, everyday admin, first work, moving-out prep",
        plan: "Required admin items, money basics, adult-transition checklist",
        tools: "Life Knowledge, Life Planner",
        apps: "Savy, GoalUp",
        connect: "Everyday-admin knowledge and later expert or public information",
      },
      {
        id: "parttime",
        title: "I’m starting my first part-time job",
        desc: "A moment to understand the work contract and how to handle a first paycheck before you start.",
        knowledge: "Work contracts, hours and breaks, pay and tax basics",
        plan: "Contract checks, work calendar, first-pay checklist",
        tools: "Life Knowledge, Life Planner, Life Finance & Housing",
        apps: "Savy, PiggyUp",
        connect: "Work and money basics, and later counseling connections",
      },
    ],
  };
  return T[lang] || T.en;
}

function extraFields(lang) {
  const T = {
    ko: [
      {
        id: "school",
        name: "학교생활·학습",
        points: ["학습 계획", "시간 관리", "학습 습관", "학교생활과 진로 활동"],
        topics: ["일주일 학습 계획 세우기", "시간 관리 기초", "진로 활동 기록하기"],
      },
      {
        id: "exam",
        name: "입시·진학",
        points: ["대학 및 학과 탐색", "수시·정시 전형 이해", "내신과 수능 준비", "공식 모집요강 확인", "장학금과 학비"],
        topics: ["모집요강 읽는 법", "전형 구조 이해하기", "학비와 장학금 정보 찾기"],
      },
      {
        id: "career-explore",
        name: "진로·직업 탐색",
        points: ["직업과 직무 탐색", "전공과 진로의 연결", "필요한 역량과 교육", "다양한 진로 선택"],
        topics: ["직무 탐색 기초", "전공-진로 연결 보기", "여러 경로 비교하기"],
      },
    ],
    en: [
      {
        id: "school",
        name: "School & study",
        points: ["Study plans", "Time management", "Study habits", "School and career activities"],
        topics: ["A weekly study plan", "Time-management basics", "Recording career activities"],
      },
      {
        id: "exam",
        name: "Admissions",
        points: ["Universities and majors", "Admissions tracks", "Grades and exams", "Official guides", "Scholarships and tuition"],
        topics: ["Reading an official guide", "Understanding tracks", "Finding tuition and aid"],
      },
      {
        id: "career-explore",
        name: "Career exploration",
        points: ["Jobs and roles", "Linking majors to paths", "Skills and education", "Other pathways"],
        topics: ["Exploring roles", "Major-to-path maps", "Comparing routes"],
      },
    ],
  };
  return T[lang] || T.en;
}

function lessons(lang) {
  const T = {
    ko: [
      {
        id: "exam",
        label: "대학 입시 준비",
        title: "대학 입시, 무엇부터 알아야 할까요?",
        lead: "관심 전공부터 공식 모집요강까지, 입시의 기본 구조를 단계로 익히는 학습 경험 미리보기입니다.",
        steps: [
          { n: "01", title: "진로와 관심 전공 탐색", body: "배우고 싶은 내용과 관심 분야를 먼저 정리합니다.", concept: "관심과 전공은 다를 수 있습니다.", term: "전공은 대학에서 깊게 배우는 학문 분야입니다.", case: "같은 관심이라도 학과마다 교육과정이 다릅니다.", quiz: "내가 알고 싶은 것과 하고 싶은 일을 구분해 보았나요?", checklist: "관심 키워드 3개 적기", source: "대학 공식 학과 소개, 교육과정 안내" },
          { n: "02", title: "대학과 학과 정보 확인", body: "공식 학과 소개와 교육과정을 비교합니다.", concept: "대학 이름은 학과 내용과 같지 않습니다.", term: "모집단위는 실제로 선발하는 단위입니다.", case: "같은 이름 학과라도 커리큘럼이 다를 수 있습니다.", quiz: "비교할 대학·학과를 두 곳 이상 골랐나요?", checklist: "공식 학과 페이지 저장", source: "대학 공식 홈페이지" },
          { n: "03", title: "수시·정시 전형의 기본 구조 이해", body: "전형 종류와 평가 요소의 큰 틀을 배웁니다.", concept: "전형은 선발 방식의 묶음입니다.", term: "수시와 정시는 지원 시기와 자료가 다릅니다.", case: "같은 대학도 전형마다 필요한 자료가 다릅니다.", quiz: "내가 보는 전형의 평가 요소를 말할 수 있나요?", checklist: "전형 종류 메모", source: "한국대학교육협의회 등 공식 안내" },
          { n: "04", title: "학년도별 공식 모집요강 확인", body: "해당 학년도 공식 문서를 기준으로 확인합니다.", concept: "입시 정보는 해마다 바뀔 수 있습니다.", term: "모집요강은 대학이 공개하는 공식 선발 안내입니다.", case: "지난해 요강만 보면 정원이나 전형이 달라질 수 있습니다.", quiz: "보고 있는 요강의 학년도를 확인했나요?", checklist: "해당 학년도 요강 다운로드", source: "대학 입학처 공식 게시" },
          { n: "05", title: "개인 학습 및 지원 준비 일정 정리", body: "학습과 서류 준비를 한 일정으로 모읍니다.", concept: "준비는 시험과 서류가 함께 움직입니다.", term: "원서 접수 기간은 전형마다 다릅니다.", case: "시험 일정과 서류 마감이 겹칠 수 있습니다.", quiz: "이번 달 우선 준비 항목이 있나요?", checklist: "월별 준비 칸 만들기", source: "공식 일정표" },
          { n: "06", title: "관련 공식 자료와 상담 기관 확인", body: "공식 자료와 학교·공공 상담 창구를 안내합니다.", concept: "예측이 아니라 확인 가능한 자료가 기준입니다.", term: "진로진학상담은 학교와 공공 기관에서 제공될 수 있습니다.", case: "온라인 소문보다 공식 게시가 우선입니다.", quiz: "공식 자료 출처를 북마크했나요?", checklist: "상담 창구와 자료 목록 정리", source: "학교, 대교협, 대학 입학처" },
        ],
      },
      {
        id: "adult",
        label: "성인 준비",
        title: "성인이 되기 전 알아야 할 생활 지식",
        lead: "생활 절차, 금융, 근로계약, 독립 준비를 한 흐름으로 살펴보는 학습 경험 미리보기입니다.",
        steps: [
          { n: "01", title: "성인이 되면 달라지는 주요 생활 절차", body: "행정과 계약에서 본인 책임이 커지는 지점을 정리합니다.", concept: "성인 전환은 권한이 늘어나는 만큼 책임도 늘어납니다.", term: "법정대리인 동의 없이 할 수 있는 절차가 늘어납니다.", case: "휴대폰, 은행, 근로계약처럼 본인 명의 절차가 늘 수 있습니다.", quiz: "내가 직접 해야 하는 행정 항목을 알고 있나요?", checklist: "본인 명의 필요 항목 목록", source: "정부 공식 생활 안내" },
          { n: "02", title: "은행 계좌와 예산 관리 기초", body: "수입·지출을 나누는 기초를 배웁니다.", concept: "예산은 쓰고 남은 돈이 아니라 미리 정한 사용 계획입니다.", term: "입출금 내역은 수입과 지출을 기록한 자료입니다.", case: "첫 용돈이나 급여를 항목별로 나눠 봅니다.", quiz: "한 달 필수 지출을 적어 보았나요?", checklist: "수입/필수/여유 칸 나누기", source: "금융교육 공식 자료" },
          { n: "03", title: "근로계약과 첫 아르바이트", body: "계약서에서 확인할 기본 항목을 익힙니다.", concept: "구두 약속만으로 근로 조건을 단정하지 않습니다.", term: "근로계약서는 일과 보수를 정한 문서입니다.", case: "근무 시간과 휴게, 급여 지급일을 확인합니다.", quiz: "계약서에서 볼 항목 세 가지를 말할 수 있나요?", checklist: "계약 확인 항목", source: "고용노동 관련 공식 안내" },
          { n: "04", title: "대학생활 및 독립 준비", body: "주거·생활비·일정처럼 독립 전에 볼 항목을 모읍니다.", concept: "독립은 이사만이 아니라 생활 운영입니다.", term: "생활비는 주거·식비·교통 등을 합한 일상 비용입니다.", case: "기숙사와 자취의 비용 구성을 비교합니다.", quiz: "한 달 생활비 항목을 나눠 보았나요?", checklist: "독립 전 확인 목록", source: "대학 생활 안내, 공공 주거 정보" },
          { n: "05", title: "주거와 생활 속 계약 기초", body: "일상 계약에서 반복되는 확인 습관을 배웁니다.", concept: "서명 전에 기간·금액·해지 조건을 봅니다.", term: "특약은 기본 계약 외에 당사자가 정한 추가 조건입니다.", case: "통신, 주거, 알바 계약에서 같은 확인 습관을 씁니다.", quiz: "계약서에서 금액과 기간을 찾았나요?", checklist: "계약 읽기 체크", source: "소비자 및 계약 관련 공식 안내" },
          { n: "06", title: "성인 전환 체크리스트 정리", body: "배운 내용을 실행 목록으로 바꿉니다.", concept: "지식은 목록이 되어야 준비로 이어집니다.", term: "체크리스트는 빠뜨리기 쉬운 항목을 확인하는 도구입니다.", case: "행정, 금융, 근로, 주거를 한 페이지로 모읍니다.", quiz: "이번 주에 끝낼 항목이 있나요?", checklist: "성인 전환 6항목", source: "학습 내용 요약" },
        ],
      },
      {
        id: "lease",
        label: "첫 독립",
        title: "처음 전월세 계약할 때 알아야 할 것",
        lead: "전월세 차이부터 계약 이후 절차까지 이어지는 학습 경험 미리보기입니다.",
        steps: [
          { n: "01", title: "전세와 월세의 차이", body: "보증금과 월 납부의 기본 구조를 정리합니다.", concept: "주거 형태에 따라 초기 비용과 월 부담이 달라집니다.", term: "보증금은 계약 기간 동안 맡기는 금액입니다.", case: "같은 집이어도 전세와 월세의 현금 흐름이 다릅니다.", quiz: "내가 감당할 초기 비용과 월 비용을 구분해 보았나요?", checklist: "주거 형태 비교표", source: "공공 주거 정보" },
          { n: "02", title: "보증금·관리비·계약금 이해", body: "집세 외에 나가는 돈을 항목별로 봅니다.", concept: "월 주거비는 월세만이 아닙니다.", term: "관리비는 건물 운영에 드는 비용입니다.", case: "관리비가 높은 집이 월세는 낮아 보일 수 있습니다.", quiz: "월 총액을 계산해 보았나요?", checklist: "보증금/월세/관리비 칸", source: "계약 전 안내 자료" },
          { n: "03", title: "주요 계약 서류 확인", body: "등기, 계약서, 신분증처럼 기본 서류를 확인합니다.", concept: "집의 권리 관계를 확인하는 것이 출발입니다.", term: "등기사항전부증명서는 부동산 권리 정보를 담습니다.", case: "집주인과 계약 당사자가 다른지 확인합니다.", quiz: "서류 이름을 세 가지 말할 수 있나요?", checklist: "서류 목록", source: "정부 부동산 정보" },
          { n: "04", title: "계약서에서 확인할 항목", body: "기간, 금액, 특약, 수리 책임을 차례로 봅니다.", concept: "서명 전 확인이 분쟁을 줄입니다.", term: "특약은 추가로 합의한 조건입니다.", case: "수리 범위와 퇴거 조건을 특약에 남기는 경우가 있습니다.", quiz: "특약에 남길 항목이 있나요?", checklist: "계약서 확인 항목", source: "표준 계약 안내" },
          { n: "05", title: "계약 이후 필요한 절차", body: "잔금, 전입, 확정일자처럼 계약 후 절차를 안내합니다.", concept: "계약서 작성이 끝이 아닙니다.", term: "확정일자는 주택임대차 보호와 관련된 절차입니다.", case: "이사 전에 전입과 확정일자를 함께 준비하는 경우가 많습니다.", quiz: "계약 후 할 일을 순서대로 적었나요?", checklist: "계약 후 절차", source: "주민센터 및 공식 안내" },
          { n: "06", title: "이사 준비 체크리스트", body: "일정, 짐, 공과금, 주소 변경을 목록으로 만듭니다.", concept: "이사는 일정과 비용이 함께 움직입니다.", term: "전입신고는 주소 변경을 공식으로 알리는 절차입니다.", case: "공과금 명의와 택배 주소를 빠뜨리기 쉽습니다.", quiz: "이사 당일 할 일을 적어 두었나요?", checklist: "이사 7일 전 목록", source: "생활 행정 안내" },
        ],
      },
    ],
    en: [
      {
        id: "exam",
        label: "Admissions prep",
        title: "University admissions: what should you learn first?",
        lead: "A learning-experience preview from interests to official admissions guides.",
        steps: [
          { n: "01", title: "Explore interests and possible majors", body: "Write down what you want to learn first.", concept: "Interest and a major are not always the same.", term: "A major is a field you study in depth.", case: "The same interest can sit in very different programs.", quiz: "Have you named what you want to know and what you want to do?", checklist: "Write three interest keywords", source: "Official department pages" },
          { n: "02", title: "Review universities and departments", body: "Compare official program pages.", concept: "A university name is not the curriculum.", term: "An admission unit is what a school actually selects.", case: "Same-named departments can teach different courses.", quiz: "Have you compared at least two programs?", checklist: "Save official pages", source: "University websites" },
          { n: "03", title: "Understand admissions tracks", body: "Learn the broad structure of tracks and review factors.", concept: "A track is a bundle of selection rules.", term: "Tracks may use different documents and calendars.", case: "One university can ask for different materials by track.", quiz: "Can you name the review factors of the track you are looking at?", checklist: "Note track types", source: "Official admissions councils and schools" },
          { n: "04", title: "Check the official guide for that year", body: "Use the document for the correct admissions year.", concept: "Admissions information can change by year.", term: "The official guide is the school’s published selection notice.", case: "Last year’s guide may show a different intake.", quiz: "Did you check the year on the guide?", checklist: "Download this year’s guide", source: "Admissions office posts" },
          { n: "05", title: "Organize study and application dates", body: "Put learning and documents on one calendar.", concept: "Exams and paperwork move together.", term: "Application windows differ by track.", case: "Test dates and document deadlines can overlap.", quiz: "Do you have a priority for this month?", checklist: "Make a monthly prep grid", source: "Official calendars" },
          { n: "06", title: "Find official materials and counseling", body: "Point to official sources and school or public counseling.", concept: "Verified documents come before rumors.", term: "Career counseling may be offered by schools and public offices.", case: "Official posts outrank unofficial threads.", quiz: "Have you bookmarked official sources?", checklist: "List offices and documents", source: "Schools and official admissions bodies" },
        ],
      },
      {
        id: "adult",
        label: "Adult prep",
        title: "Living knowledge before adulthood",
        lead: "A learning-experience preview of admin, money, work contracts, and moving-out prep.",
        steps: [
          { n: "01", title: "What changes in everyday procedures", body: "Note where personal responsibility grows.", concept: "More rights come with more responsibility.", term: "Some procedures no longer need a legal guardian.", case: "Phone, bank, and work contracts may move to your name.", quiz: "Do you know which admin items you must do yourself?", checklist: "List items that need your name", source: "Official civic guides" },
          { n: "02", title: "Bank accounts and budget basics", body: "Learn to split income and spending.", concept: "A budget is a plan, not leftover money.", term: "A statement records money in and out.", case: "Split a first allowance or paycheck into categories.", quiz: "Have you listed essential monthly costs?", checklist: "Income / must / extra columns", source: "Official money-education materials" },
          { n: "03", title: "Work contracts and first part-time jobs", body: "Learn the basic lines of a work contract.", concept: "Verbal promises are not the whole condition.", term: "A work contract sets work and pay.", case: "Check hours, breaks, and payday.", quiz: "Can you name three lines to check?", checklist: "Contract check items", source: "Official labor guides" },
          { n: "04", title: "Campus life and moving-out prep", body: "Gather housing, living-cost, and calendar items.", concept: "Independence is running a household, not only a move.", term: "Living costs combine rent, food, and transport.", case: "Compare dorm and rental cost structures.", quiz: "Have you split a monthly living-cost list?", checklist: "Pre-move list", source: "Campus and public housing info" },
          { n: "05", title: "Everyday contract basics", body: "Practice the same checks on daily contracts.", concept: "Read term, amount, and exit rules before signing.", term: "A special clause is an extra agreed condition.", case: "Phone, housing, and work contracts share the same habit.", quiz: "Did you find amount and term?", checklist: "Contract-reading check", source: "Consumer and contract guides" },
          { n: "06", title: "Build an adult-transition checklist", body: "Turn learning into an action list.", concept: "Knowledge becomes preparation when it is a list.", term: "A checklist catches easy-to-miss items.", case: "Put admin, money, work, and housing on one page.", quiz: "Is there an item to finish this week?", checklist: "Six adult-prep items", source: "Lesson summary" },
        ],
      },
      {
        id: "lease",
        label: "First move-out",
        title: "What to know before a first lease",
        lead: "A learning-experience preview from lease types to post-contract steps.",
        steps: [
          { n: "01", title: "Jeonse vs monthly rent", body: "Compare deposit-heavy and monthly structures.", concept: "Housing type changes upfront and monthly cost.", term: "A deposit is money held for the lease term.", case: "The same home can have very different cash flow.", quiz: "Have you split upfront vs monthly cost?", checklist: "Housing-type comparison", source: "Public housing information" },
          { n: "02", title: "Deposits, fees, and down payments", body: "See money beyond the advertised rent.", concept: "Monthly housing cost is not rent alone.", term: "Maintenance fees cover building operations.", case: "A low rent can hide a high fee.", quiz: "Have you added a monthly total?", checklist: "Deposit / rent / fee columns", source: "Pre-contract guides" },
          { n: "03", title: "Key documents", body: "Check registry, contract, and identity papers.", concept: "Rights in the property come first.", term: "A full registry extract shows property rights.", case: "Confirm the contracting party matches the owner.", quiz: "Can you name three documents?", checklist: "Document list", source: "Government property information" },
          { n: "04", title: "What to check in the contract", body: "Review term, amounts, clauses, and repair duties.", concept: "Checks before signing reduce later disputes.", term: "A special clause is an extra agreed term.", case: "Repair scope is often added in a clause.", quiz: "Is there a clause you want written down?", checklist: "Contract check items", source: "Standard lease guides" },
          { n: "05", title: "Steps after signing", body: "Cover remaining payment, move-in, and date-stamp steps.", concept: "Signing is not the last step.", term: "A confirmed date relates to lease protection.", case: "Move-in registration and date-stamp are often done together.", quiz: "Did you order the post-contract tasks?", checklist: "After-contract steps", source: "Community-center and official guides" },
          { n: "06", title: "Moving checklist", body: "List dates, belongings, utilities, and address changes.", concept: "A move is a calendar and a budget.", term: "Move-in registration officially changes your address.", case: "Utility names and parcel addresses are easy to miss.", quiz: "Have you written the moving-day list?", checklist: "7-day moving list", source: "Everyday admin guides" },
        ],
      },
    ],
  };
  return T[lang] || T.en;
}

function plannerProjects(lang) {
  const T = {
    ko: [
      { id: "exam", title: "입시 준비", items: ["관심 전공 정리하기", "대학 및 학과 정보 확인하기", "공식 모집요강 확인하기", "학습 계획 세우기", "지원 일정 정리하기", "필요한 제출 서류 확인하기"] },
      { id: "adult", title: "성인 준비", items: ["기본 생활 행정 알아보기", "금융 기초 학습하기", "첫 아르바이트 관련 지식 확인하기", "대학 또는 취업 계획 정리하기", "독립 준비 항목 확인하기", "개인 예산 계획 세우기"] },
      { id: "move", title: "첫 독립 준비", items: ["주거 예산 정하기", "희망 지역 비교하기", "집 확인 항목 정리하기", "계약 관련 서류 확인하기", "이사 일정 계획하기", "생활 필수품 준비하기"] },
    ],
    en: [
      { id: "exam", title: "Admissions prep", items: ["List majors of interest", "Review universities and departments", "Check official guides", "Make a study plan", "Organize application dates", "Confirm required documents"] },
      { id: "adult", title: "Adult prep", items: ["Learn everyday admin", "Study money basics", "Review first-job knowledge", "Organize study or work plans", "Check moving-out items", "Draft a personal budget"] },
      { id: "move", title: "First move-out prep", items: ["Set a housing budget", "Compare areas", "List home-check items", "Review contract documents", "Plan moving dates", "Prepare essentials"] },
    ],
  };
  return T[lang] || T.en;
}

function extraFlows(lang) {
  const T = {
    ko: [
      {
        id: "exam",
        label: "입시 준비",
        steps: [
          { t: "상황 선택", d: "대학과 전공을 고민하고 있어요." },
          { t: "지식 학습", d: "전공, 대학, 입시 전형의 기본 구조를 배워요." },
          { t: "맞춤 안내", d: "관심 분야와 필요한 준비 항목을 정리해요." },
          { t: "계획 수립", d: "학습 계획과 공식 지원 일정을 정리해요." },
          { t: "실행 관리", d: "준비 항목과 제출 서류를 확인해요." },
          { t: "관련 서비스", d: "공식 입시 자료와 진로·교육 정보를 탐색해요." },
        ],
      },
      {
        id: "adult",
        label: "성인 준비",
        steps: [
          { t: "상황 선택", d: "곧 성인이 되어 생활 절차를 준비하고 있어요." },
          { t: "지식 학습", d: "행정, 금융, 근로계약, 독립 기초를 배워요." },
          { t: "맞춤 안내", d: "지금 필요한 준비 순서를 확인해요." },
          { t: "계획 수립", d: "성인 전환 체크리스트와 예산을 만들어요." },
          { t: "실행 관리", d: "행정과 계약 준비 항목을 점검해요." },
          { t: "관련 서비스", d: "공공 안내와 생활 지식을 이어서 찾아요." },
        ],
      },
    ],
    en: [
      {
        id: "exam",
        label: "Admissions prep",
        steps: [
          { t: "Choose a situation", d: "I’m deciding on a university and major." },
          { t: "Learn", d: "Learn majors, schools, and the basic admissions structure." },
          { t: "Get guidance", d: "Organize interests and the items you need to prepare." },
          { t: "Plan", d: "Build a study plan and official application calendar." },
          { t: "Do", d: "Track prep items and required documents." },
          { t: "Connect", d: "Explore official admissions materials and career-education information." },
        ],
      },
      {
        id: "adult",
        label: "Adult prep",
        steps: [
          { t: "Choose a situation", d: "I’m preparing everyday procedures before adulthood." },
          { t: "Learn", d: "Learn admin, money, work-contract, and moving-out basics." },
          { t: "Get guidance", d: "See the order of what you need now." },
          { t: "Plan", d: "Make an adult-transition checklist and budget." },
          { t: "Do", d: "Check admin and contract prep items." },
          { t: "Connect", d: "Continue with public guides and living knowledge." },
        ],
      },
    ],
  };
  return T[lang] || T.en;
}

function extraRevenue(lang) {
  const T = {
    ko: [
      { id: "education", title: "교육기관 대상", items: ["중·고등학생 진로 탐색 교육", "대학 입시 및 성인 준비 교육", "대학생 사회 진출 교육", "금융·주거·근로계약 등 생활 교육", "학교 및 대학용 학습 콘텐츠", "교육기관용 관리 시스템"] },
      { id: "company", title: "기업 대상", items: ["신입사원 생활·직장 교육", "임직원 생활·복지 콘텐츠", "결혼·육아·가족 돌봄 지원", "재취업 및 은퇴 준비 교육", "기업 복지 플랫폼 제휴"] },
      { id: "public", title: "공공기관 및 지자체 대상", items: ["청소년 진로·성인 준비 교육", "청년 독립 및 취업 지원 정보", "생애주기별 생활정보 안내", "중장년 재취업 및 은퇴 준비", "시니어 디지털 생활 교육", "지역 생활 서비스 연결"] },
    ],
    en: [
      { id: "education", title: "Education institutions", items: ["Career exploration for secondary students", "Admissions and adult-prep education", "Campus-to-work education", "Money, housing, and work-contract living education", "School and university learning content", "Institution admin tools"] },
      { id: "company", title: "Companies", items: ["New-hire living and workplace education", "Employee living and benefit content", "Marriage, parenting, and family-care support", "Return-to-work and later-life education", "Benefit-platform partnerships"] },
      { id: "public", title: "Public and local government", items: ["Youth career and adult-prep education", "Youth independence and work information", "Life-stage living information", "Mid-career return and later-life prep", "Senior digital-life education", "Local living-service connections"] },
    ],
  };
  return T[lang] || T.en;
}

function community(lang) {
  const T = {
    ko: {
      title: "Life Community",
      lead: "경험과 정보를 나누는 커뮤니티입니다. 현재는 서비스 콘셉트이며 실제 게시판이나 회원 기능은 아직 없습니다.",
      features: ["생활 주제별 게시판", "질문과 답변", "경험담 및 준비 과정 공유", "관심 주제 저장", "지역 기반 생활정보", "신고 및 콘텐츠 관리"],
      safety: "10대 대상 커뮤니티와 전문가 연결은 미성년자 보호, 개인정보 보호, 신고·차단 및 연령별 이용 조건을 고려한 향후 개발 계획입니다.",
    },
    en: {
      title: "Life Community",
      lead: "A place to share experience and information. This is a concept preview — there is no live board or membership yet.",
      features: ["Topic boards", "Questions and answers", "Stories and prep notes", "Saved topics", "Local living information", "Reporting and moderation"],
      safety: "Teen community and expert connections will be designed with child protection, privacy, reporting, blocking, and age-based rules.",
    },
  };
  return T[lang] || T.en;
}

function uiPatch(lang) {
  const T = {
    ko: {
      back: "사업 목록으로",
      teenNote: "10대 기능은 연령에 맞는 개인정보 보호와 안전한 이용 구조를 전제로 설계합니다. 미성년자에게 성인 대상 금융상품이나 부적절한 서비스를 추천하지 않습니다.",
      examNote: "입시 정보는 학년도·대학·모집단위·전형별로 달라지므로 공식 모집요강과 관련 기관 자료를 기준으로 제공합니다. 합격 가능성을 보장하거나 예측하지 않습니다.",
      aiPreview: "AI 서비스 콘셉트 미리보기",
      learnPreview: "학습 경험 미리보기",
      toolsLabel: "관련 Life Stage 기능",
      appsLabel: "연결 가능한 Newon 서비스",
      sitDesc: "현재 상황",
      caseLabel: "대표 질문",
      education: "교육기관 확장",
      public: "공공·지자체 확장",
      more: "자세히 보기",
      less: "접기",
      moreServices: "관련 서비스 더 보기",
      moreLearn: "더 알아보기",
      moreItems: "항목 더 보기",
      pickAge: "연령대를 선택하면 자세한 주제를 볼 수 있습니다.",
      pickSitCat: "카테고리를 선택하면 관련 상황이 나타납니다.",
      pickSit: "상황을 선택하면 필요한 지식과 준비 항목을 볼 수 있습니다.",
      pickKnow: "그룹을 선택한 뒤 지식 분야를 고르세요.",
      pickVenture: "사업명을 선택하면 자세한 설명을 볼 수 있습니다.",
      allStages: "모든 삶의 단계",
      allStagesSub: "10대부터 70대+",
      coreKicker: "03 · Core",
      learnKicker: "Learning",
      sitKicker: "04 · Situation",
      ecoKicker: "05 · Ecosystem",
      flowKicker: "06 · How it works",
      connectKicker: "07 · Connection",
      newonKicker: "08 · Newon",
      expandKicker: "09 · Expansion",
      roadKicker: "10 · Roadmap",
    },
    en: {
      back: "Back to businesses",
      teenNote: "Teen features will be designed with age-appropriate privacy and safety. We do not recommend adult financial products or unsuitable services to minors.",
      examNote: "Admissions information changes by year, school, unit, and track. Official guides are the source of record. Life Stage does not predict or guarantee admission.",
      aiPreview: "AI service concept preview",
      learnPreview: "Learning experience preview",
      toolsLabel: "Related Life Stage features",
      appsLabel: "Connectable Newon services",
      sitDesc: "This situation",
      caseLabel: "Typical questions",
      education: "Education expansion",
      public: "Public expansion",
      more: "See details",
      less: "Show less",
      moreServices: "See related services",
      moreLearn: "Learn more",
      moreItems: "More items",
      pickAge: "Select an age band to see its topics.",
      pickSitCat: "Choose a category to see related situations.",
      pickSit: "Select a situation to see what to learn and prepare.",
      pickKnow: "Choose a group, then a knowledge field.",
      pickVenture: "Select a service to read the full description.",
      allStages: "Every life stage",
      allStagesSub: "Teens through 70+",
      coreKicker: "03 · Core",
      learnKicker: "Learning",
      sitKicker: "04 · Situation",
      ecoKicker: "05 · Ecosystem",
      flowKicker: "06 · How it works",
      connectKicker: "07 · Connection",
      newonKicker: "08 · Newon",
      expandKicker: "09 · Expansion",
      roadKicker: "10 · Roadmap",
    },
  };
  return T[lang] || T.en;
}

function heroClosePatch(lang) {
  const T = {
    ko: {
      hero: {
        lead: "진로와 취업, 독립과 가족, 건강과 은퇴까지. 삶의 변화 앞에서 필요한 정보와 서비스를 쉽게 찾을 수 있도록 연결하는 생애주기 플랫폼을 만들어갑니다.",
        ctaMain: "Life Stage 살펴보기",
        ctaSub: "핵심 서비스 알아보기",
      },
      core: {
        title: "안내받고, 계획하고, 실행합니다.",
        lead: "향후 제공하려는 방향입니다. Life AI 상담과 Life Planner 저장은 아직 이용할 수 없습니다.",
      },
      knowledge: {
        lead: "학교와 일, 주거와 가족, 다음 삶까지. 처음 겪는 순간에 필요한 생활 지식을 분야별로 배우고 준비할 수 있도록 돕습니다.",
        learnSectionTitle: "읽는 것을 넘어,\n이해하고 준비하는 학습.",
        learnSectionLead: "Life Knowledge의 실제 학습 경험을 보여주는 미리보기입니다. 강의 수나 수료증을 만들지 않습니다.",
        methods: ["핵심 개념", "쉬운 용어 설명", "실제 사례", "단계별 학습", "이해도 확인 퀴즈", "관련 체크리스트", "공식 자료와 출처"],
        metaNote: "실제 콘텐츠가 게시되면 작성일, 최종 검토일, 기준일, 공식 출처를 함께 관리합니다. 입시·법률·세금·건강·공공지원 정보는 변경될 수 있습니다.",
      },
      planner: {
        previewLabel: "플래너 기능 미리보기",
      },
      connect: {
        title: "필요한 순간,\n사람과 서비스를 연결합니다.",
        expertLead: "향후 관련 분야의 전문가를 탐색하고 연결하려는 방향입니다.",
        servicesLead: "향후 생활에 필요한 서비스를 찾고 비교하려는 방향입니다.",
        communityLead: "경험과 정보를 공유하는 공간을 만들어 가려는 방향입니다.",
      },
      revenue: {
        title: "개인의 일상에서,\n교육과 기업, 사회 전체로.",
        lead: "Life Stage는 개인 사용자를 시작으로 전문가·서비스 공급자, 교육기관, 기업, 공공기관으로 확장하는 구조를 검토합니다.",
      },
      close: {
        lead: "20대부터 70대까지, 삶의 변화 앞에서 필요한 정보와 서비스를 연결하는 생애주기 플랫폼을 만들어 갑니다. 현재 페이지는 사업 소개이며, 실제 상담·예약 서비스는 아직 없습니다.",
        ctaMain: "사업 및 협업 문의",
        ctaSub: "Newon의 다른 사업 살펴보기",
      },
    },
    en: {
      hero: {
        lead: "Career and work, independence and family, health and retirement. Life Stage is building a lifecycle platform that helps people find the information and services a life change requires.",
        ctaMain: "Explore Life Stage",
        ctaSub: "See core services",
      },
      core: {
        title: "Get guidance, plan, then do.",
        lead: "A future direction. Life AI advice and Life Planner saving are not available yet.",
      },
      knowledge: {
        lead: "School and work, housing and family, and the chapter after that. Life Knowledge helps people learn what first-time moments require.",
        learnSectionTitle: "Beyond reading:\nunderstand, then prepare.",
        learnSectionLead: "A preview of the Life Knowledge learning experience. No course counts or certificates.",
        methods: ["Core idea", "Plain terms", "A real case", "Step-by-step learning", "Check-your-understanding", "Related checklist", "Official sources"],
        metaNote: "When content is published, created and reviewed dates, as-of dates, and official sources will be kept together. Admissions, law, tax, health, and public-support facts can change.",
      },
      planner: {
        previewLabel: "Planner feature preview",
      },
      connect: {
        title: "When you need help,\npeople and services connect.",
        expertLead: "A future direction: explore specialists in the fields that matter.",
        servicesLead: "A future direction: find and compare living services a situation needs.",
        communityLead: "A future place to share experience and information.",
      },
      revenue: {
        title: "From one person’s day\nto schools, companies, and the public.",
        lead: "Life Stage is exploring a path from individuals to experts and services, then schools, companies, and public institutions.",
      },
      close: {
        lead: "A lifecycle platform we are building to connect information and services for life changes from the 20s through the 70s. This page is an introduction — advice and booking are not live yet.",
        ctaMain: "Business and partnership inquiry",
        ctaSub: "See Newon’s other businesses",
      },
    },
  };
  return T[lang] || T.en;
}

function extraLessons(lang) {
  const T = {
    ko: [
      { id: "pay", label: "첫 월급 관리", title: "첫 월급, 어디에 얼마나 나눌까?", lead: "고정 생활비와 비상금, 목표 저축을 나누는 학습 경험 미리보기입니다.", steps: [
        { n: "01", title: "수입과 고정 지출 구분", body: "월급에서 매달 나가는 돈을 먼저 적습니다.", concept: "남는 돈이 예산이 아니라, 미리 나눈 계획이 예산입니다.", term: "고정 지출은 매달 비슷한 금액으로 나가는 비용입니다.", case: "월세·교통·통신을 먼저 모아 봅니다.", quiz: "한 달 고정 지출을 적었나요?", checklist: "수입/고정/여유 칸", source: "금융교육 공식 자료" },
        { n: "02", title: "비상금과 목표 저축", body: "갑자기 쓸 돈과 모을 돈을 나눕니다.", concept: "비상금은 목표 저축과 다릅니다.", term: "비상금은 예상하지 못한 지출을 위한 금액입니다.", case: "의료비나 수리비처럼 갑자기 생기는 지출을 대비합니다.", quiz: "비상금 목표액을 정했나요?", checklist: "비상금 칸 만들기", source: "생활 금융 안내" },
        { n: "03", title: "급여명세서 읽기", body: "공제 항목과 실수령액을 확인합니다.", concept: "세전 금액과 실제 받는 금액은 다릅니다.", term: "실수령액은 공제 후 실제로 받는 금액입니다.", case: "4대 보험과 세금이 빠져 나가는 구조를 봅니다.", quiz: "명세서에서 실수령액을 찾았나요?", checklist: "명세서 항목 메모", source: "근로·세금 공식 안내" },
        { n: "04", title: "한 달 예산 체크리스트", body: "배운 구분을 실행 목록으로 만듭니다.", concept: "지식은 목록이 되어야 관리로 이어집니다.", term: "예산은 항목별 한도를 정한 사용 계획입니다.", case: "주 단위로 지출을 점검하는 습관을 만듭니다.", quiz: "이번 주 한도를 정했나요?", checklist: "한 달 예산 6항목", source: "학습 내용 요약" },
      ] },
      { id: "wed", label: "결혼 준비", title: "결혼 준비는 어떤 순서로 볼까?", lead: "일정과 예산, 공동생활 결정을 나누는 학습 경험 미리보기입니다.", steps: [
        { n: "01", title: "일정과 예산을 먼저 맞추기", body: "날짜와 쓸 수 있는 금액을 함께 정합니다.", concept: "준비 항목은 예산 안에서 우선순위가 달라집니다.", term: "총예산은 예식·주거·행정 비용을 합한 금액입니다.", case: "같은 준비도 규모에 따라 비용이 크게 달라집니다.", quiz: "대략 예산을 적어 보았나요?", checklist: "일정/예산 칸", source: "생활 계획 안내" },
        { n: "02", title: "공동생활에서 결정할 항목", body: "주거, 생활비, 가족 역할을 목록으로 봅니다.", concept: "결혼 준비는 예식만이 아니라 이후 생활입니다.", term: "공동생활비는 두 사람이 나누어 쓰는 일상 비용입니다.", case: "주거 형태와 생활비 분담을 먼저 대화하는 경우가 많습니다.", quiz: "결정할 항목 세 가지를 적었나요?", checklist: "공동생활 결정 목록", source: "가족·생활 안내" },
        { n: "03", title: "행정과 주거 준비", body: "필요한 서류와 주거 일정을 확인합니다.", concept: "행정 일정과 주거 일정이 겹칠 수 있습니다.", term: "혼인신고는 혼인 사실을 공식으로 알리는 절차입니다.", case: "이사와 신고 날짜를 한 달력에 모읍니다.", quiz: "이번 달 행정 항목이 있나요?", checklist: "서류와 주거 일정", source: "공공 행정 안내" },
        { n: "04", title: "준비 체크리스트", body: "일정·예산·행정을 한 목록으로 모읍니다.", concept: "빠뜨리기 쉬운 항목을 먼저 적습니다.", term: "체크리스트는 준비 상태를 확인하는 도구입니다.", case: "예식, 주거, 행정을 세 칸으로 나눕니다.", quiz: "이번 주 끝낼 항목이 있나요?", checklist: "결혼 준비 6항목", source: "학습 내용 요약" },
      ] },
      { id: "care", label: "가족 돌봄", title: "가족 돌봄, 무엇부터 정리할까?", lead: "역할과 제도, 일정을 나누는 학습 경험 미리보기입니다.", steps: [
        { n: "01", title: "필요한 도움의 종류 정리", body: "일상 도움과 의료·행정 도움을 구분합니다.", concept: "돌봄은 한 가지 일이 아니라 여러 역할의 합입니다.", term: "일상 돌봄은 식사·이동·일정처럼 매일 필요한 도움입니다.", case: "가족의 하루 일과에서 도움이 필요한 지점을 적습니다.", quiz: "필요한 도움 세 가지를 적었나요?", checklist: "도움 종류 목록", source: "돌봄 제도 안내" },
        { n: "02", title: "역할과 일정 나누기", body: "가족 안에서 누가 무엇을 할지 봅니다.", concept: "한 사람에게 모든 역할을 맡기지 않습니다.", term: "역할 분담은 일정과 책임을 나누는 약속입니다.", case: "주중과 주말 역할을 다르게 정하는 경우가 있습니다.", quiz: "이번 주 역할을 나누었나요?", checklist: "역할 칸 만들기", source: "가족 지원 안내" },
        { n: "03", title: "제도와 서류 확인", body: "이용할 수 있는 제도와 필요 서류를 찾습니다.", concept: "지원 제도는 자격과 신청 절차가 있습니다.", term: "증빙 서류는 신청 자격을 확인하는 자료입니다.", case: "주민센터와 공식 안내에서 절차를 확인합니다.", quiz: "확인할 기관을 적었나요?", checklist: "제도와 서류 목록", source: "공공 돌봄 안내" },
        { n: "04", title: "돌봄 준비 체크리스트", body: "도움, 역할, 제도를 한 목록으로 모읍니다.", concept: "급한 일과 미리 할 일을 나눕니다.", term: "체크리스트는 빠뜨리기 쉬운 절차를 붙잡아 둡니다.", case: "의료 일정과 생활 일정을 한 달력에 둡니다.", quiz: "이번 주 우선 항목이 있나요?", checklist: "돌봄 준비 6항목", source: "학습 내용 요약" },
      ] },
      { id: "retire", label: "은퇴 이후 생활", title: "은퇴 이후, 어떤 일상을 만들까?", lead: "하루 일과와 배움, 관계를 정리하는 학습 경험 미리보기입니다.", steps: [
        { n: "01", title: "유지하고 싶은 일상 적기", body: "건강, 관계, 하루 리듬을 먼저 봅니다.", concept: "은퇴 준비는 생활비만이 아니라 일상의 설계입니다.", term: "생활 리듬은 하루를 보내는 반복된 흐름입니다.", case: "아침 시간, 이동, 사람을 만나는 패턴을 적습니다.", quiz: "유지하고 싶은 일상 세 가지를 적었나요?", checklist: "일상 목록", source: "은퇴 생활 안내" },
        { n: "02", title: "배우고 싶은 활동 탐색", body: "평생교육, 취미, 지역 프로그램을 비교합니다.", concept: "새로운 일은 취업만이 아니라 배움과 활동도 포함합니다.", term: "평생교육은 나이에 관계없이 이어가는 학습입니다.", case: "지역 센터와 온라인 강좌를 함께 봅니다.", quiz: "관심 활동 두 가지를 골랐나요?", checklist: "활동 후보 목록", source: "지역·교육 공식 안내" },
        { n: "03", title: "생활비와 일정 점검", body: "필요한 비용과 주간 일정을 맞춰 봅니다.", concept: "활동 계획은 생활비와 체력을 함께 봅니다.", term: "생활비는 주거·식비·건강·여가를 합한 일상 비용입니다.", case: "주 2회 활동과 휴식일을 나눠 봅니다.", quiz: "한 주 일정을 그려 보았나요?", checklist: "주간 일정과 비용", source: "생활 계획 안내" },
        { n: "04", title: "다음 일상 체크리스트", body: "일상, 활동, 비용을 한 목록으로 모읍니다.", concept: "작은 실험부터 일상에 넣습니다.", term: "체크리스트는 이번 달에 시도할 항목을 고정합니다.", case: "한 가지 배움과 한 가지 모임을 먼저 넣습니다.", quiz: "이번 달 시도 항목이 있나요?", checklist: "은퇴 이후 6항목", source: "학습 내용 요약" },
      ] },
    ],
    en: [
      { id: "pay", label: "First paycheck", title: "A first paycheck: how do you split it?", lead: "A learning-experience preview for essential costs, a buffer, and a savings goal.", steps: [
        { n: "01", title: "Split income and fixed costs", body: "Write down what leaves every month first.", concept: "A budget is a plan, not leftover money.", term: "Fixed costs are amounts that leave on a similar cycle.", case: "Start with rent, transport, and phone.", quiz: "Have you listed monthly fixed costs?", checklist: "Income / fixed / extra columns", source: "Official money-education materials" },
        { n: "02", title: "Buffer and savings goals", body: "Separate surprise money from money you mean to keep.", concept: "A buffer is not the same as a savings goal.", term: "A buffer covers costs you did not plan.", case: "Medical bills or repairs often arrive without warning.", quiz: "Have you set a buffer amount?", checklist: "Make a buffer box", source: "Everyday money guides" },
        { n: "03", title: "Read a payslip", body: "Find deductions and take-home pay.", concept: "Gross pay is not what arrives.", term: "Take-home pay is what you receive after deductions.", case: "Insurance and tax lines change the total.", quiz: "Did you find take-home pay on the slip?", checklist: "Note payslip lines", source: "Official work and tax guides" },
        { n: "04", title: "A one-month budget checklist", body: "Turn the split into an action list.", concept: "Knowledge becomes management when it is a list.", term: "A budget sets a limit per category.", case: "Check spending once a week.", quiz: "Have you set a limit for this week?", checklist: "Six monthly budget items", source: "Lesson summary" },
      ] },
      { id: "wed", label: "Marriage prep", title: "In what order should marriage prep go?", lead: "A learning-experience preview for dates, budget, and shared-life decisions.", steps: [
        { n: "01", title: "Align dates and budget first", body: "Set a date range and a spendable amount together.", concept: "Priorities change inside a budget.", term: "A total budget combines ceremony, housing, and admin costs.", case: "The same item can cost very different amounts at different scales.", quiz: "Have you written a rough budget?", checklist: "Date / budget boxes", source: "Life-planning guides" },
        { n: "02", title: "Decisions for shared living", body: "List housing, living costs, and family roles.", concept: "Prep is not only a ceremony — it is the life after.", term: "Shared living costs are everyday amounts two people split.", case: "Housing type and cost-sharing often come first in conversation.", quiz: "Have you listed three decisions?", checklist: "Shared-life decision list", source: "Family and living guides" },
        { n: "03", title: "Admin and housing prep", body: "Check documents and housing dates.", concept: "Admin dates and housing dates can overlap.", term: "A marriage registration makes the marriage official.", case: "Put a move and a filing on one calendar.", quiz: "Is there an admin item this month?", checklist: "Documents and housing dates", source: "Public admin guides" },
        { n: "04", title: "A prep checklist", body: "Gather dates, budget, and admin on one list.", concept: "Write the easy-to-miss items first.", term: "A checklist shows what is done.", case: "Split ceremony, housing, and admin into three columns.", quiz: "Is there an item to finish this week?", checklist: "Six marriage-prep items", source: "Lesson summary" },
      ] },
      { id: "care", label: "Family care", title: "Family care: what do you sort first?", lead: "A learning-experience preview for roles, systems, and calendars.", steps: [
        { n: "01", title: "Name the kinds of help needed", body: "Separate daily help from medical and admin help.", concept: "Care is several roles, not one task.", term: "Daily care is help with meals, movement, and calendars.", case: "Mark the points in a day where help is needed.", quiz: "Have you listed three kinds of help?", checklist: "Help-type list", source: "Care-system guides" },
        { n: "02", title: "Share roles and dates", body: "See who does what inside the family.", concept: "One person should not hold every role.", term: "Role-sharing is an agreement about time and responsibility.", case: "Weekday and weekend roles can differ.", quiz: "Have you split this week’s roles?", checklist: "Role columns", source: "Family-support guides" },
        { n: "03", title: "Check systems and documents", body: "Find programs you can use and papers they need.", concept: "Support programs have eligibility and filing steps.", term: "Evidence papers confirm eligibility.", case: "Confirm the steps at a community office or official guide.", quiz: "Have you named an office to check?", checklist: "Programs and documents", source: "Public care guides" },
        { n: "04", title: "A care-prep checklist", body: "Gather help, roles, and systems on one list.", concept: "Split urgent work from work you can plan.", term: "A checklist holds easy-to-miss steps.", case: "Put medical dates and living dates on one calendar.", quiz: "Is there a priority for this week?", checklist: "Six care-prep items", source: "Lesson summary" },
      ] },
      { id: "retire", label: "Life after work", title: "After work: what kind of everyday do you want?", lead: "A learning-experience preview for daily rhythm, learning, and relationships.", steps: [
        { n: "01", title: "Write the everyday you want to keep", body: "Start with health, relationships, and a daily rhythm.", concept: "Later-life prep is a design for days, not only money.", term: "A living rhythm is the repeated flow of a day.", case: "Note mornings, travel, and time with people.", quiz: "Have you listed three everyday things to keep?", checklist: "Everyday list", source: "Later-life living guides" },
        { n: "02", title: "Explore things you want to learn", body: "Compare lifelong learning, hobbies, and local programs.", concept: "New work includes learning and activity, not only a job.", term: "Lifelong learning continues at any age.", case: "Look at a local center and an online class together.", quiz: "Have you picked two activities?", checklist: "Activity shortlist", source: "Local and education guides" },
        { n: "03", title: "Check living costs and a weekly calendar", body: "Fit costs to a weekly rhythm.", concept: "Activity plans sit next to living costs and energy.", term: "Living costs combine housing, food, health, and leisure.", case: "Try two activity days and rest days.", quiz: "Have you sketched a week?", checklist: "Weekly calendar and costs", source: "Life-planning guides" },
        { n: "04", title: "A next-everyday checklist", body: "Gather days, activities, and costs on one list.", concept: "Start with a small experiment.", term: "A checklist fixes what you will try this month.", case: "Add one class and one gathering first.", quiz: "Is there a try-this-month item?", checklist: "Six later-life items", source: "Lesson summary" },
      ] },
    ],
  };
  return T[lang] || T.en;
}

function extraPlanner(lang) {
  const T = {
    ko: [
      { id: "firstjob", title: "첫 취업", items: ["관심 직무 정리하기", "채용 일정 확인하기", "이력서 점검하기", "면접 준비 항목 정리하기", "근로계약 확인 포인트 적기", "첫 출근 준비 목록 만들기"] },
      { id: "wed", title: "결혼 준비", items: ["일정과 예산 맞추기", "공동생활 결정 항목 적기", "행정 서류 확인하기", "주거 일정 정리하기", "가족 역할 나누기", "준비 우선순위 정하기"] },
      { id: "baby", title: "첫 육아", items: ["출산 준비 항목 확인하기", "가족 일정 나누기", "초기 생활비 정리하기", "지원 제도 찾아보기", "준비물 목록 만들기", "돌봄 역할 정하기"] },
      { id: "care", title: "가족 돌봄", items: ["필요한 도움 종류 적기", "가족 역할 나누기", "주간 일정 만들기", "관련 제도 확인하기", "필요 서류 목록 정리하기", "긴급 연락망 적기"] },
      { id: "retire", title: "은퇴 준비", items: ["유지하고 싶은 일상 적기", "관심 활동 고르기", "주간 리듬 그려보기", "생활비 항목 점검하기", "지역 프로그램 찾아보기", "이번 달 시도 항목 정하기"] },
    ],
    en: [
      { id: "firstjob", title: "First job", items: ["List roles of interest", "Check hiring dates", "Review a resume", "List interview prep items", "Note work-contract checks", "Make a first-day list"] },
      { id: "wed", title: "Marriage prep", items: ["Align dates and budget", "List shared-life decisions", "Check admin documents", "Organize housing dates", "Share family roles", "Set prep priorities"] },
      { id: "baby", title: "First child", items: ["Check birth-prep items", "Share a family calendar", "Sketch early living costs", "Find support programs", "Make a supplies list", "Agree care roles"] },
      { id: "care", title: "Family care", items: ["List kinds of help needed", "Share family roles", "Make a weekly calendar", "Check related programs", "List required documents", "Write an emergency list"] },
      { id: "retire", title: "Life after work", items: ["Write everyday things to keep", "Pick activities of interest", "Sketch a weekly rhythm", "Check living-cost lines", "Find local programs", "Choose a try-this-month item"] },
    ],
  };
  return T[lang] || T.en;
}

function sitCats(lang) {
  const T = {
    ko: [
      { id: "study", n: "A", title: "학업과 사회 진출", blurb: "입시 · 진로 · 성인 준비 · 아르바이트 · 첫 취업", sitIds: ["exam", "major", "adult", "parttime", "firstjob"] },
      { id: "life", n: "B", title: "독립과 생활", blurb: "첫 독립 · 결혼 준비 · 첫 육아", sitIds: ["independent", "marriage", "baby"] },
      { id: "work", n: "C", title: "일과 새로운 도전", blurb: "이직 · 경력 전환", sitIds: ["career", "startup"] },
      { id: "family", n: "D", title: "가족과 다음 삶", blurb: "가족 돌봄 · 은퇴 이후", sitIds: ["care", "retire"] },
    ],
    en: [
      { id: "study", n: "A", title: "Study and starting out", blurb: "Admissions · path · adult prep · first work", sitIds: ["exam", "major", "adult", "parttime", "firstjob"] },
      { id: "life", n: "B", title: "Independence and living", blurb: "Moving out · marriage · first child", sitIds: ["independent", "marriage", "baby"] },
      { id: "work", n: "C", title: "Work and new challenges", blurb: "Job change · career turn", sitIds: ["career", "startup"] },
      { id: "family", n: "D", title: "Family and the next chapter", blurb: "Family care · life after work", sitIds: ["care", "retire"] },
    ],
  };
  return T[lang] || T.en;
}

function knowGroups(lang) {
  const T = {
    ko: [
      { id: "study", n: "01", title: "학업·진로", fieldIds: ["school", "exam", "career-explore", "learn"] },
      { id: "work", n: "02", title: "일·경제", fieldIds: ["social", "work", "finance", "biz"] },
      { id: "home", n: "03", title: "주거·생활", fieldIds: ["housing", "health", "law"] },
      { id: "rel", n: "04", title: "관계·가족", fieldIds: ["relation", "parenting", "family"] },
      { id: "later", n: "05", title: "다음 삶", fieldIds: ["retire"] },
    ],
    en: [
      { id: "study", n: "01", title: "Study & path", fieldIds: ["school", "exam", "career-explore", "learn"] },
      { id: "work", n: "02", title: "Work & money", fieldIds: ["social", "work", "finance", "biz"] },
      { id: "home", n: "03", title: "Home & living", fieldIds: ["housing", "health", "law"] },
      { id: "rel", n: "04", title: "Bonds & family", fieldIds: ["relation", "parenting", "family"] },
      { id: "later", n: "05", title: "Next chapter", fieldIds: ["retire"] },
    ],
  };
  return T[lang] || T.en;
}

function ageHighlights(lang) {
  const T = {
    ko: {
      10: { name: "미래를 탐색하는 시기", highlights: ["학교생활", "진로·입시", "성인 준비"] },
      20: { name: "새로운 시작", highlights: ["독립", "첫 직장", "금융 기초"] },
      30: { name: "삶의 기반", highlights: ["커리어", "주거·재무", "가족생활"] },
      40: { name: "일과 삶의 균형", highlights: ["커리어 전환", "자녀 교육", "가족 돌봄"] },
      50: { name: "새로운 전환", highlights: ["일과 생활 변화", "은퇴 준비", "건강·여가"] },
      60: { name: "다음 일상", highlights: ["평생교육", "사회활동", "은퇴 이후 생활"] },
      70: { name: "나다운 삶", highlights: ["디지털 생활", "여가·관계", "생활 지원"] },
    },
    en: {
      10: { name: "A time to explore the future", highlights: ["School life", "Path & admissions", "Adult prep"] },
      20: { name: "A new start", highlights: ["Independence", "First job", "Money basics"] },
      30: { name: "Building a base", highlights: ["Career", "Housing & money", "Family life"] },
      40: { name: "Work-life balance", highlights: ["Career shifts", "Children’s education", "Family care"] },
      50: { name: "A new turn", highlights: ["Work-life change", "Later-life prep", "Health & leisure"] },
      60: { name: "The next everyday", highlights: ["Lifelong learning", "Community", "Life after work"] },
      70: { name: "A life in your way", highlights: ["Digital life", "Leisure & bonds", "Living support"] },
    },
  };
  return T[lang] || T.en;
}

function orderById(list, ids) {
  const map = Object.fromEntries((list || []).filter((x) => x && x.id != null).map((x) => [x.id, x]));
  const out = [];
  ids.forEach((id) => {
    if (map[id]) out.push(map[id]);
  });
  (list || []).forEach((x) => {
    if (x && x.id != null && !ids.includes(x.id)) out.push(x);
  });
  return out;
}

function upsertById(list, extras, prepend = false) {
  const out = Array.isArray(list) ? [...list] : [];
  const missing = (extras || []).filter((item) => item && item.id != null && !out.some((x) => x && x.id === item.id));
  return prepend ? [...missing, ...out] : [...out, ...missing];
}

function putAgeFirst(items, teen) {
  const rest = (items || []).filter((x) => x.id !== "10");
  return [teen, ...rest];
}

/** @param {object} copy @param {string} lang */
export function enrichLifeStage(copy, lang) {
  const L = lang === "ko" ? "ko" : "en";
  const next = structuredClone(copy);
  Object.assign(next.ui, uiPatch(L));
  const hc = heroClosePatch(L);
  next.hero = { ...next.hero, ...hc.hero };
  next.knowledge = { ...next.knowledge, ...hc.knowledge };
  next.planner = { ...next.planner, ...hc.planner };
  next.connect = { ...next.connect, ...hc.connect };
  next.revenue = { ...next.revenue, ...hc.revenue };
  next.close = { ...next.close, ...hc.close };
  next.core = { ...(next.core || {}), ...(hc.core || {}) };

  next.ages.items = putAgeFirst(next.ages.items, age10(L));
  const highlights = ageHighlights(L);
  next.ages.items = next.ages.items.map((a) => {
    const patch = highlights[a.id];
    return patch ? { ...a, ...patch } : a;
  });
  const teen = next.ages.items.find((a) => a.id === "10");
  if (teen && !teen.note) teen.note = next.ui.examNote;

  next.sits.items = upsertById(next.sits.items, extraSits(L), true);
  next.sits.kLabel = L === "ko" ? "핵심 지식" : "What to learn first";
  next.sits.gLabel = L === "ko" ? "준비 항목" : "What to prepare";
  next.sits.cLabel = L === "ko" ? "연결 방향" : "Later connections";

  const existingSits = Object.fromEntries((copy.sits.items || []).map((s) => [s.id, s]));
  next.sits.items = next.sits.items.map((s) => {
    const extra = extraSits(L).find((x) => x.id === s.id);
    const base = existingSits[s.id] || {};
    if (extra) return { ...base, ...extra };
    return {
      ...s,
      desc: s.desc || (L === "ko" ? `${s.title} 상황에서 먼저 알아야 할 지식과 준비 항목을 정리합니다.` : `Knowledge and prep items for: ${s.title}`),
      tools: s.tools || "Life Knowledge, Life Planner, Life AI",
      apps: s.apps || (s.id === "baby" ? "BabyLog, Pillmate" : s.id === "retire" || s.id === "care" ? "Ongil, Pillmate" : "Savy, GoalUp"),
    };
  });

  next.knowledge.fields = upsertById(next.knowledge.fields, extraFields(L), true);
  next.knowGroups = knowGroups(L);
  next.sitCats = sitCats(L);
  next.knowledge.lessons = orderById([...lessons(L), ...extraLessons(L)], ["lease", "exam", "pay", "wed", "care", "retire", "adult"]);
  next.planner.projects = orderById(
    upsertById([...plannerProjects(L), ...extraPlanner(L)], extraFirstPlanner(L)),
    ["move", "exam", "firstjob", "wed", "baby", "care", "retire", "adult"]
  );
  next.community = community(L);
  next.flow.cases = orderById(upsertById(next.flow.cases, extraFlows(L), false), ["independent", "job", "baby", "retire", "exam", "adult"]);
  next.revenue.pillars = next.revenue.pillars.filter((p) => p.id !== "org");
  next.revenue.pillars = upsertById(next.revenue.pillars, extraRevenue(L));

  const org = (copy.revenue.pillars || []).find((p) => p.id === "org");
  if (org && !next.revenue.pillars.some((p) => p.id === "company")) {
    next.revenue.pillars.push({ ...org, id: "company" });
  }

  next.ai.prompts = L === "ko"
    ? [
        { id: "move", label: "첫 독립", q: "처음 독립하는데 무엇부터 준비해야 할까요?", a: "먼저 주거 예산과 이사 일정을 정리해 보세요. 이후 원하는 지역과 주거 형태를 비교하고, 계약 전 확인할 항목을 준비할 수 있습니다." },
        { id: "job", label: "첫 직장", q: "첫 직장에서 알아야 할 것은 무엇인가요?", a: "채용 절차와 근로계약, 급여명세서처럼 일을 시작하기 전 확인할 항목부터 살펴볼 수 있습니다. 관심 직무를 고르면 준비 순서를 단계별로 정리할 수 있습니다." },
        { id: "wed", label: "결혼 준비", q: "결혼 준비는 어떤 순서로 해야 하나요?", a: "일정과 예산을 먼저 맞춘 뒤, 공동생활에서 결정할 항목과 행정·주거 준비를 나눠 보세요. 각 단계는 지식 콘텐츠와 체크리스트로 이어질 수 있습니다." },
        { id: "care", label: "가족 돌봄", q: "부모님 돌봄을 어떻게 준비해야 하나요?", a: "일상에서 필요한 도움의 종류를 먼저 적고, 가족 역할과 일정을 나눈 뒤 관련 제도와 서류를 확인할 수 있습니다." },
        { id: "retire", label: "은퇴 이후", q: "은퇴 후 새로운 일을 시작하고 싶어요.", a: "유지하고 싶은 일상과 관심 분야를 정리한 뒤, 관련 교육과 재취업·사회활동 정보를 탐색할 수 있습니다." },
        { id: "exam", label: "대학·전공", q: "대학과 전공을 어떻게 탐색해야 하나요?", a: "먼저 관심 분야와 배우고 싶은 내용을 정리해 보세요. 이후 관련 학과의 교육과정과 진로 정보를 비교하고, 관심 대학의 공식 모집요강을 확인할 수 있습니다." },
        { id: "adult", label: "성인 준비", q: "곧 성인이 되는데 무엇부터 준비해야 할까요?", a: "금융과 생활 행정, 근로계약, 독립 준비처럼 일상에서 필요한 기본 지식부터 살펴볼 수 있습니다." },
      ]
    : [
        { id: "move", label: "First move-out", q: "I’m moving out for the first time. What should I prepare first?", a: "Start with a housing budget and a moving calendar. Then compare areas and housing types, and list what to check before you sign." },
        { id: "job", label: "First job", q: "What should I know at a first job?", a: "Begin with hiring steps, the work contract, and a payslip. Pick a role of interest and turn prep into a step-by-step list." },
        { id: "wed", label: "Marriage prep", q: "In what order should marriage prep go?", a: "Align dates and a budget first, then split shared-life decisions from admin and housing. Each step can connect to knowledge and a checklist." },
        { id: "care", label: "Family care", q: "How should I prepare to support a parent?", a: "Name the kinds of daily help needed, share family roles and dates, then check related programs and documents." },
        { id: "retire", label: "After work", q: "I want to start something new after work.", a: "Write the everyday you want to keep and the fields you care about, then explore related education, return-to-work, and community programs." },
        { id: "exam", label: "University & major", q: "How should I explore universities and majors?", a: "Start with the fields and subjects you want to learn. Then compare program details and career notes, and read the official admissions guide for schools you care about." },
        { id: "adult", label: "Adult prep", q: "I’m becoming an adult soon. What should I prepare first?", a: "Begin with everyday money, admin, work contracts, and moving-out basics." },
      ];

  next.ai.prompts = upsertById(next.ai.prompts, extraFirstPrompts(L));
  next.firstMoments = firstMoments(L);

  return next;
}

export function mergeArraysById(base, over) {
  if (!Array.isArray(base)) return over;
  if (!Array.isArray(over)) return base;
  const overMap = new Map();
  over.forEach((x, i) => {
    const id = x && x.id != null ? x.id : `__i${i}`;
    overMap.set(id, x);
  });
  const used = new Set();
  const out = [];
  for (const b of base) {
    const id = b && b.id != null ? b.id : null;
    if (id != null && overMap.has(id)) {
      out.push(deepMergePlain(b, overMap.get(id)));
      used.add(id);
    } else {
      out.push(b);
    }
  }
  over.forEach((x, i) => {
    const id = x && x.id != null ? x.id : `__i${i}`;
    if (!used.has(id) && !(x && x.id != null && base.some((b) => b && b.id === x.id))) {
      if (x && x.id != null && !base.some((b) => b && b.id === x.id)) out.push(x);
    }
  });
  return out;
}

export function deepMergePlain(base, over) {
  if (Array.isArray(over)) {
    if (Array.isArray(base) && ((over[0] && over[0].id != null) || (base[0] && base[0].id != null))) {
      return mergeArraysById(base, over);
    }
    return over;
  }
  if (over && typeof over === "object") {
    const out = { ...(base && typeof base === "object" ? base : {}) };
    for (const k of Object.keys(over)) {
      out[k] = deepMergePlain(base ? base[k] : undefined, over[k]);
    }
    return out;
  }
  return over;
}
