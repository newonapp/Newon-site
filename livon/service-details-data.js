/* Editorial examples, NOT a school/admissions database or live provider inventory. */
window.LivonServiceDetailsData = {
  types: { Tool: '도구', Guide: '가이드', Expert: '전문가·기관', Discovery: '활동·콘텐츠', AI: 'AI 상담' },
  sources: { career: 'https://www.career.go.kr/', admission: 'https://www.adiga.kr/', learning: 'https://www.ebs.co.kr/' },
  fields: ['IT', 'AI', '경영', '디자인', '의료', '교육', '공학', '자연과학', '인문', '사회', '예체능', '기타'],
  subjects: {
    '국어': ['글의 중심 내용 정리', '문학·비문학 읽기', '근거를 찾아 답하기', '시간을 정해 지문 풀기'],
    '영어': ['기본 어휘 복습', '문장 구조 이해', '듣기·읽기 연습', '틀린 표현 다시 써 보기'],
    '수학': ['선행 개념 확인', '개념을 말로 설명', '기본 유형 풀기', '오답 원인별 재풀이'],
    '사회': ['핵심 용어 정리', '사건·개념 연결', '지도·도표 해석', '단원별 문제 점검'],
    '과학': ['기본 원리 이해', '실험 과정 정리', '자료·그래프 해석', '원리를 적용해 설명'],
    '기타': ['현재 수준 점검', '목표 단원 정하기', '기초에서 응용 순으로 연습', '피드백 후 계획 조정']
  },
  majors: [
    { id: 'software', title: '소프트웨어학과', fields: ['IT', 'AI', '공학'], intro: '컴퓨터로 문제를 해결하는 방법을 배우는 전공의 일반적인 예시입니다.', learns: ['프로그래밍', '자료구조', '소프트웨어 설계'], interests: ['논리적 문제 해결', '만들고 개선하기'], jobs: ['소프트웨어 개발자', '품질 관리'], related: ['컴퓨터공학', '정보보안'], schools: null, admission: null, source: 'career' },
    { id: 'business', title: '경영학과', fields: ['경영', '사회'], intro: '조직과 사업의 운영을 배우는 전공의 일반적인 예시입니다.', learns: ['조직 관리', '마케팅', '회계 기초'], interests: ['협업', '자료 분석'], jobs: ['서비스 기획', '마케팅'], related: ['경제학', '회계학'], schools: null, admission: null, source: 'career' },
    { id: 'design', title: '시각디자인학과', fields: ['디자인', '예체능'], intro: '시각적 표현으로 정보를 전달하는 전공의 일반적인 예시입니다.', learns: ['타이포그래피', '시각 표현', '디자인 프로젝트'], interests: ['관찰', '시각적 의사소통'], jobs: ['시각 디자이너', '콘텐츠 디자이너'], related: ['산업디자인', '디지털미디어'], schools: null, admission: null, source: 'career' }
  ],
  careers: [
    { id: 'developer', title: '소프트웨어 개발자', fields: ['IT', 'AI', '공학'], intro: '사용자의 문제를 소프트웨어로 해결하고 개선하는 직무를 소개하는 일반 가이드입니다.', skills: ['문제 분석', '프로그래밍', '테스트', '협업'], majors: ['소프트웨어', '컴퓨터공학'], tools: ['프로그래밍 언어', '버전 관리'], path: ['기초 학습', '작은 프로젝트', '포트폴리오 정리', '공식 채용 정보 확인'], related: ['웹 개발', '앱 개발', '품질 관리'], source: 'career' },
    { id: 'designer', title: '시각 디자이너', fields: ['디자인', '예체능'], intro: '목적에 맞는 시각 표현을 설계하는 직무의 일반 가이드입니다.', skills: ['관찰', '구성', '피드백 반영'], majors: ['시각디자인', '디지털미디어'], tools: ['디자인 편집 도구'], path: ['기본 원리 학습', '주제별 작품', '포트폴리오 정리'], related: ['브랜드 디자인', '콘텐츠 디자인'], source: 'career' }
  ],
  // Future adapters must populate only verified data; null means not connected.
  expertSchema: { specialty: null, introduction: null, career: null, consultationMode: null, price: null, availability: null, reviews: null, bookingUrl: null },
  classSchema: { image: null, title: null, introduction: null, location: null, schedule: null, duration: null, price: null, supplies: null, provider: null, reviews: null, officialUrl: null }
};
