/**
 * Extra Life Stage detail content (10s, 12 sits, 15 fields, 3 lessons,
 * 3 planner projects, 6 flows, community, 5 revenue). Merged onto KO/EN.
 */

function age10(lang) {
  const T = {
    ko: {
      age: "10대",
      name: "미래를 준비하는 첫걸음",
      intro: "학교생활과 진로를 고민하고, 나만의 미래를 탐색하며 성인이 되기 위한 기초를 준비하는 시기.",
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
      intro: "A time to navigate school and career questions, explore a future of your own, and prepare the basics of becoming an adult.",
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
      { id: "move", title: "첫 독립", items: ["주거 예산 정하기", "희망 지역 비교하기", "집 확인 항목 정리하기", "계약 관련 서류 확인하기", "이사 일정 계획하기", "생활 필수품 준비하기"] },
    ],
    en: [
      { id: "exam", title: "Admissions prep", items: ["List majors of interest", "Review universities and departments", "Check official guides", "Make a study plan", "Organize application dates", "Confirm required documents"] },
      { id: "adult", title: "Adult prep", items: ["Learn everyday admin", "Study money basics", "Review first-job knowledge", "Organize study or work plans", "Check moving-out items", "Draft a personal budget"] },
      { id: "move", title: "First move-out", items: ["Set a housing budget", "Compare areas", "List home-check items", "Review contract documents", "Plan moving dates", "Prepare essentials"] },
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
    },
  };
  return T[lang] || T.en;
}

function heroClosePatch(lang) {
  const T = {
    ko: {
      hero: {
        lead: "입시와 진로를 고민하는 순간부터 첫 독립과 취업, 결혼과 육아, 가족 돌봄과 은퇴 이후의 삶까지. Life Stage는 삶의 새로운 단계마다 필요한 지식을 배우고, 계획하고, 실행할 수 있도록 돕는 종합 라이프 플랫폼입니다.",
        ctaMain: "Life Stage 살펴보기",
        ctaSub: "핵심 서비스 알아보기",
      },
      knowledge: {
        lead: "입시와 진로를 고민할 때부터 첫 월급을 받고, 집을 계약하고, 새로운 가족을 맞이하고, 은퇴 이후의 삶을 준비하는 순간까지. 누구나 처음 겪는 일에 필요한 지식을 쉽고 체계적으로 배울 수 있도록 돕습니다.",
        learnSectionTitle: "읽는 것을 넘어,\n이해하고 준비하는 학습.",
        learnSectionLead: "Life Knowledge의 실제 학습 경험을 보여주는 미리보기입니다. 강의 수나 수료증을 만들지 않습니다.",
        methods: ["핵심 개념", "쉬운 용어 설명", "실제 사례", "단계별 학습", "이해도 확인 퀴즈", "관련 체크리스트", "공식 자료와 출처"],
        metaNote: "실제 콘텐츠가 게시되면 작성일, 최종 검토일, 기준일, 공식 출처를 함께 관리합니다. 입시·법률·세금·건강·공공지원 정보는 변경될 수 있습니다.",
      },
      planner: {
        previewLabel: "플래너 기능 미리보기",
      },
      connect: {
        title: "혼자 고민하지 않도록,\n경험과 도움을 연결합니다.",
      },
      revenue: {
        title: "개인의 일상에서,\n교육과 기업, 사회 전체로.",
        lead: "Life Stage는 개인 사용자를 시작으로 전문가·서비스 공급자, 교육기관, 기업, 공공기관으로 확장하는 구조를 검토합니다.",
      },
      close: {
        lead: "입시와 진로를 고민하는 순간부터 새로운 삶을 준비하는 순간까지. Life Stage는 필요한 지식과 도움을 찾고, 스스로 다음 단계를 준비할 수 있는 플랫폼을 만들어 갑니다.",
        ctaMain: "사업 및 협업 문의",
        ctaSub: "Newon의 다른 사업 살펴보기",
      },
    },
    en: {
      hero: {
        lead: "From exams and career questions to a first home, a first job, family, caregiving, and life after work. Life Stage is a life platform for learning, planning, and acting at every new chapter.",
        ctaMain: "Explore Life Stage",
        ctaSub: "See core services",
      },
      knowledge: {
        lead: "From admissions and career questions to a first paycheck, a first lease, a new family, and later life. Life Knowledge helps people learn what first-time moments require.",
        learnSectionTitle: "Beyond reading:\nunderstand, then prepare.",
        learnSectionLead: "A preview of the Life Knowledge learning experience. No course counts or certificates.",
        methods: ["Core idea", "Plain terms", "A real case", "Step-by-step learning", "Check-your-understanding", "Related checklist", "Official sources"],
        metaNote: "When content is published, created and reviewed dates, as-of dates, and official sources will be kept together. Admissions, law, tax, health, and public-support facts can change.",
      },
      planner: {
        previewLabel: "Planner feature preview",
      },
      connect: {
        title: "So you do not have to\nfigure it out alone.",
      },
      revenue: {
        title: "From one person’s day\nto schools, companies, and the public.",
        lead: "Life Stage is exploring a path from individuals to experts and services, then schools, companies, and public institutions.",
      },
      close: {
        lead: "From exams and career questions to preparing a new life. Life Stage is building a platform where people can find knowledge and help, and prepare the next step themselves.",
        ctaMain: "Business and partnership inquiry",
        ctaSub: "See Newon’s other businesses",
      },
    },
  };
  return T[lang] || T.en;
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

  next.ages.items = putAgeFirst(next.ages.items, age10(L));
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
  next.knowledge.lessons = lessons(L);
  next.planner.projects = plannerProjects(L);
  next.community = community(L);
  next.flow.cases = upsertById(next.flow.cases, extraFlows(L), true);
  next.revenue.pillars = next.revenue.pillars.filter((p) => p.id !== "org");
  next.revenue.pillars = upsertById(next.revenue.pillars, extraRevenue(L));

  const org = (copy.revenue.pillars || []).find((p) => p.id === "org");
  if (org && !next.revenue.pillars.some((p) => p.id === "company")) {
    next.revenue.pillars.push({ ...org, id: "company" });
  }

  next.ai.prompts = L === "ko"
    ? [
        { id: "exam", label: "대학·학과 선택", q: "대학과 학과를 어떻게 선택해야 할지 모르겠어요.", a: "먼저 관심 분야와 배우고 싶은 내용을 정리해 보세요. 이후 관련 학과의 교육과정과 진로 정보를 비교하고, 관심 대학의 공식 모집요강을 확인할 수 있습니다." },
        { id: "adult", label: "성인 준비", q: "곧 성인이 되는데 무엇부터 준비해야 할까요?", a: "금융과 생활 행정, 근로계약, 독립 준비처럼 일상에서 필요한 기본 지식부터 살펴볼 수 있습니다. 관심 있는 주제를 선택하면 준비 항목을 단계별로 정리할 수 있습니다." },
        { id: "move", label: "첫 독립", q: "다음 달에 처음 독립하는데 무엇부터 준비해야 할까요?", a: "먼저 주거 예산과 이사 일정을 정리해 보세요. 이후 원하는 지역과 주거 형태를 비교하고, 계약 전 확인할 항목을 준비할 수 있습니다." },
        { id: "retire", label: "은퇴 이후", q: "은퇴 이후 새로운 일을 시작하고 싶어요.", a: "관심 분야와 이전 경험을 정리하고, 관련 교육과 재취업·창업 지원 프로그램을 탐색할 수 있습니다." },
      ]
    : [
        { id: "exam", label: "Choosing a major", q: "I don’t know how to choose a university and major.", a: "Start with the fields and subjects you want to learn. Then compare program details and career notes, and read the official admissions guide for schools you care about." },
        { id: "adult", label: "Adult prep", q: "I’m becoming an adult soon. What should I prepare first?", a: "Begin with everyday money, admin, work contracts, and moving-out basics. Pick a topic and turn it into a step-by-step list." },
        { id: "move", label: "First move-out", q: "I’m moving out next month. What should I prepare first?", a: "Start with a housing budget and a moving calendar. Then compare areas and housing types, and list what to check before you sign." },
        { id: "retire", label: "After work", q: "I want to start something new after work.", a: "Gather your interests and past experience, then explore related education and return-to-work or startup-support programs." },
      ];

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
