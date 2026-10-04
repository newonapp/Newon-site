/* Verified feeds remain empty until an adapter supplies source/checkedAt. */
window.LivonYouthData = {
  regions: ['전국','서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주','온라인'],
  availability: { local: '직접 입력해서 이용', api: '공식 데이터 연결 예정', partner: '등록·제휴 정보 연결 필요' },
  feeds: { policies: [], housingpolicy: [], jobs: [], universities: [], education: [], events: [] },
  schemas: {
    policies: ['id','title','organization','target','age','region','conditions','benefits','applicationPeriod','documents','applicationMethod','officialUrl','checkedAt'],
    housingpolicy: ['id','title','organization','target','benefits','conditions','applicationPeriod','officialUrl','checkedAt'],
    jobs: ['id','company','title','employmentType','region','qualifications','duties','preferred','applicationPeriod','officialUrl','checkedAt'],
    universities: ['id','title','region','schoolType','majors','officialUrl','checkedAt'],
    education: ['id','title','category','provider','duration','mode','cost','officialUrl','checkedAt'],
    experts: ['id','name','specialty','career','job','mode','price','schedule','reviews','officialUrl','checkedAt'],
    products: ['id','title','price','size','features','space','runningCost','delivery','purpose','officialUrl','checkedAt']
  },
  budgetGroups: [
    ['01 월 수입', ['월 수입','아르바이트/부수입','기타 수입']],
    ['02 고정비', ['월세/관리비','통신비','구독','보험','교통','대출/할부','기타 고정비']],
    ['03 생활비', ['식비','카페/외식','쇼핑','문화/취미','데이트','여행비','기타 생활비']],
    ['04 저축 목표', ['월 저축 목표','비상금 목표','여행 목표','독립 목표','자동차 목표','주택 목표','기타 목표']]
  ],
  checklists: {
    resume: { '이력서':['기본 정보','학력','경력','프로젝트','활동','기술','자격','링크'], '자기소개서':['지원동기','경험','강점','문제 해결','입사 후 목표'], '포트폴리오':['소개','프로젝트','역할','문제','과정','결과'], '면접':['기본 질문','직무 질문','경험 질문','회사 질문','예상 질문'] },
    moving: { '이사 체크리스트':['계약 확인','주소 이전','전기','수도','가스','인터넷','이삿짐','청소','가구','생활용품'], '입주 준비':['필요한 가구','필요한 가전','생활용품','보안','관리비 확인'], '청소 서비스':[] }
  },
  categories: {
    policies: ['주거','취업','창업','교육','금융','생활','문화','복지'],
    housingpolicy: ['월세 지원','전세','공공임대','주거 금융','이사 지원','기타'],
    culture: ['여행','전시','공연','축제','팝업','체험','문화','무료 행사'],
    education: ['IT/개발','AI/데이터','디자인','마케팅','경영','금융','사무','외국어','국가자격','기타'],
    jobs: ['개발','디자인','기획','마케팅','영업','경영','금융','서비스','기타'],
    classes: ['요리','베이킹','공예','미술','사진','음악','운동','댄스','야외활동','기타'],
    services: ['청소','세탁','수리','설치','이사','보관','배송','반려동물','자동차','생활 편의']
  },
  mentorTopics: ['직무 선택','취업 준비','이력서','자기소개서','포트폴리오','면접','이직','커리어'],
  counselTopics: ['연애/관계','가족','친구','학교','직장','대인관계','기타']
};
