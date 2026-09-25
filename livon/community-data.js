window.LivonCommunityData = {
  typeLabels: {
    story: "일상 이야기",
    question: "질문",
    experience: "경험 공유",
    review: "후기",
    info: "생활 정보",
    meetup: "모임 관련"
  },
  questionFields: [
    "교육·진로", "취업·커리어", "독립·주거", "생활비·금융", "가족·육아",
    "건강·운동", "취미·여가", "여행·문화", "지역 생활", "시니어 생활", "기타"
  ],
  interests: [
    "일상·생활", "교육·배움", "취업·커리어", "주거·독립", "생활비·절약",
    "가족·육아", "건강·운동", "취미·창작", "여행·문화", "음식·요리",
    "반려동물", "지역 생활", "시니어 생활", "새로운 도전"
  ],
  regions: ["전국", "서울", "경기", "인천", "부산", "대구", "광주", "대전", "온라인"],
  communities: [
    { id: "c-daily", name: "일상·생활 이야기", interest: "일상·생활", desc: "오늘의 소소한 일과 생활 팁을 나눕니다.", join: "open", img: "/livon/assets/topics/friends.jpg" },
    { id: "c-edu", name: "교육·배움", interest: "교육·배움", desc: "공부, 자격, 평생학습 경험을 나눕니다.", join: "open", img: "/livon/assets/topics/study.jpg" },
    { id: "c-career", name: "취업·커리어", interest: "취업·커리어", desc: "취업·이직·경력 전환 질문을 나눕니다.", join: "open", img: "/livon/assets/topics/career.jpg" },
    { id: "c-home", name: "주거·독립", interest: "주거·독립", desc: "자취, 이사, 주거 준비 경험을 나눕니다.", join: "open", img: "/livon/assets/topics/housing.jpg" },
    { id: "c-money", name: "생활비·절약", interest: "생활비·절약", desc: "예산·저축·소비 습관 이야기를 나눕니다.", join: "open", img: "/livon/assets/topics/finance.jpg" },
    { id: "c-family", name: "가족·육아", interest: "가족·육아", desc: "가족 생활과 육아 경험을 나눕니다.", join: "open", img: "/livon/assets/topics/family.jpg" },
    { id: "c-health", name: "건강·운동", interest: "건강·운동", desc: "운동·생활 습관 이야기를 나눕니다.", join: "open", img: "/livon/assets/topics/fitness.jpg" },
    { id: "c-hobby", name: "취미·창작", interest: "취미·창작", desc: "취미와 창작 활동을 나눕니다.", join: "open", img: "/livon/assets/topics/hobby.jpg" },
    { id: "c-travel", name: "여행·문화", interest: "여행·문화", desc: "여행·전시·공연 경험을 나눕니다.", join: "open", img: "/livon/assets/topics/travel.jpg" },
    { id: "c-food", name: "음식·요리", interest: "음식·요리", desc: "요리·맛집 경험을 나눕니다.", join: "open", img: "/livon/assets/topics/cooking.jpg" },
    { id: "c-pet", name: "반려동물", interest: "반려동물", desc: "반려동물과 함께하는 일상을 나눕니다.", join: "open", img: "/livon/assets/topics/pets.jpg" },
    { id: "c-local", name: "지역 생활", interest: "지역 생활", desc: "동네 소식과 지역 활동을 나눕니다.", join: "open", img: "/livon/assets/topics/local.jpg" },
    { id: "c-senior", name: "시니어 생활", interest: "시니어 생활", desc: "은퇴 후 활동·배움을 나눕니다.", join: "open", img: "/livon/assets/topics/senior.jpg" },
    { id: "c-challenge", name: "새로운 도전", interest: "새로운 도전", desc: "새 습관·챌린지 이야기를 나눕니다.", join: "open", img: "/livon/assets/topics/study.jpg" },
    { id: "stage-10", name: "10대 커뮤니티", interest: "교육·배움", stage: "10대", desc: "학교생활·진로·취미 이야기를 나눕니다.", join: "open", img: "/livon/assets/topics/students.jpg" },
    { id: "stage-20", name: "20대 커뮤니티", interest: "취업·커리어", stage: "20대", desc: "대학·취업·독립 이야기를 나눕니다.", join: "open", img: "/livon/assets/topics/twenties.jpg" },
    { id: "stage-30", name: "30대 커뮤니티", interest: "주거·독립", stage: "30대", desc: "커리어·주거·가족 이야기를 나눕니다.", join: "open", img: "/livon/assets/topics/housing.jpg" },
    { id: "stage-40", name: "40대 커뮤니티", interest: "가족·육아", stage: "40대", desc: "일과 생활·가족·건강 이야기를 나눕니다.", join: "open", img: "/livon/assets/topics/childcare.jpg" },
    { id: "stage-50", name: "50대 커뮤니티", interest: "새로운 도전", stage: "50대", desc: "경력 전환·여가·건강 이야기를 나눕니다.", join: "open", img: "/livon/assets/topics/fifties.jpg" },
    { id: "stage-60", name: "60대 커뮤니티", interest: "시니어 생활", stage: "60대", desc: "은퇴 준비·배움·지역 활동을 나눕니다.", join: "open", img: "/livon/assets/topics/senior.jpg" },
    { id: "stage-70", name: "70대 이상 커뮤니티", interest: "시니어 생활", stage: "70대 이상", desc: "일상·취미·가족·지역 활동을 나눕니다.", join: "open", img: "/livon/assets/topics/senior.jpg" }
  ],
  challenges: [
    { id: "ch-read", title: "한 달 독서", goal: "한 달 동안 책 읽기 실천", days: 30, field: "독서", desc: "하루 한 번 독서 여부를 기록합니다." },
    { id: "ch-walk", title: "매일 걷기", goal: "매일 산책·걷기 실천", days: 21, field: "산책", desc: "무리하지 않는 선에서 실천을 기록합니다." },
    { id: "ch-tidy", title: "정리 정돈", goal: "주 3회 이상 정리", days: 14, field: "정리 정돈", desc: "작은 정리부터 기록합니다." },
    { id: "ch-lang", title: "외국어 습관", goal: "매일 짧은 외국어 학습", days: 21, field: "외국어", desc: "학습 시간을 스스로 기록합니다." },
    { id: "ch-save", title: "절약 챌린지", goal: "불필요한 지출 줄이기", days: 30, field: "절약", desc: "민감 금액은 공개하지 않고 실천 여부만 기록합니다." }
  ],
  rules: [
    "서로를 존중하는 말투를 사용합니다.",
    "허위 정보·스팸·혐오 표현은 신고 대상입니다.",
    "개인정보(연락처·주소·실명)를 게시하지 마세요.",
    "의료·법률·금융 조언은 일반 경험과 구분하고, 필요 시 탐색의 전문 서비스를 이용하세요.",
    "미성년자 관련 콘텐츠는 별도 안전 규칙을 따릅니다."
  ]
};
