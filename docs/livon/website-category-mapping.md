# LIVON 웹사이트 40개 생활 분야 ↔ 기존 LIVON 데이터 대응표

> 생성: scripts/livon-site-data.mjs 기준 (2026-10-18, LIVON 최종 사업 확장 계획 반영). 기존 분류(livon/life-topics.json의 stages·categories·serviceTypes·policies)는 바꾸지 않았다.
> 상태 규칙: 기존 Life Stage 분야(categories)가 있으면 **web**, 서비스 안내·공식 포털만 있으면 **partial**, 없으면 **planned**.

## A. 교육·진로·취업·창업 (Education & Career, 01–08)

| # | 분야 | 세부 서비스 | 상태 | 기존 Life Stage 분야 | 서비스 안내 | 공식 포털 | 세부 주제 수 |
|---|---|---|---|---|---|---|---|
| 01 | 학교·교육 (School & Education) | 초중고 교육·진학·학교생활 | web | 10s.school, 10s.study, 10s.career, 10s.friends, 10s.support | study-plan | pol-cyber1388 | 7 |
| 02 | 대학·전공 (University & Major) | 대학 입시·전공·학사·장학금 | web | 10s.college, 20s.edu | education-course | pol-kosaf | 8 |
| 03 | 자격증·시험 (Certificates & Exams) | 국가자격증·민간자격·시험 일정 | web | 20s.growth | certificate | — | 8 |
| 04 | 어학·유학 (Languages & Study Abroad) | 영어·외국어·어학시험·유학 | planned | — | — | — | 7 |
| 05 | 취업·이직 (Employment & Career) | 채용·이력서·면접·직무 | web | 20s.job, 30s.change, 60s.job | job-search, resume, senior-job | pol-work24 | 8 |
| 06 | 직장·노동 (Work & Labor) | 근로계약·급여·휴가·노동권 | web | 20s.career, 30s.career, 10s.parttime | — | — | 9 |
| 07 | 창업·사업 (Startup & Business) | 사업자등록·창업 지원·사업 운영 | web | 20s.startup, 30s.startup | startup | pol-kstartup | 8 |
| 08 | 직업훈련·평생교육 (Vocational Training) | 국비교육·직업훈련·재교육 | web | 40s.shift, 50s.second | job-training, education-course | pol-hrd | 6 |

## B. 군대·운전·생활·행정 (Life Essentials, 09–16)

| # | 분야 | 세부 서비스 | 상태 | 기존 Life Stage 분야 | 서비스 안내 | 공식 포털 | 세부 주제 수 |
|---|---|---|---|---|---|---|---|
| 09 | 병역·군 복무 (Military Service) | 입영·훈련소·복무·전역·예비군 | planned | — | — | — | 12 |
| 10 | 운전면허 (Driver's License) | 필기·기능·도로주행·면허 갱신 | planned | — | — | — | 6 |
| 11 | 자동차 생활 (Car Life) | 차량 구매·유지비·검사·보험 | planned | — | — | — | 8 |
| 12 | 대중교통 (Public Transportation) | 버스·지하철·철도·교통카드 | partial | — | mobility | — | 8 |
| 13 | 여권·출입국 (Passport & Immigration) | 여권·비자·체류·해외 이동 | planned | — | — | — | 7 |
| 14 | 민원·행정 (Civil Administration) | 주민등록·증명서·전입신고 | partial | — | public-docs | pol-gov24 | 6 |
| 15 | 법률·권리 (Legal Rights) | 생활법률·계약·소비자 권리 | partial | — | contract-check, legal-pro | — | 6 |
| 16 | 재난·안전 (Disaster & Safety) | 응급대응·재난정보·생활안전 | partial | — | home-safety | — | 7 |

## C. 경제·금융·보험·부동산 (Finance & Housing, 17–24)

| # | 분야 | 세부 서비스 | 상태 | 기존 Life Stage 분야 | 서비스 안내 | 공식 포털 | 세부 주제 수 |
|---|---|---|---|---|---|---|---|
| 17 | 경제·금융교육 (Economy & Financial Literacy) | 경제 기초·물가·금리·금융 상식 | web | 10s.money, 20s.money | budget, finance-info | pol-kinfa | 8 |
| 18 | 저축·자산관리 (Savings & Asset Management) | 예산·적금·청약·재무 계획 | web | 30s.asset, 40s.asset, 50s.asset, 60s.asset | pension | pol-nps | 7 |
| 19 | 투자·증권 (Investment & Securities) | 주식·ETF·채권·투자 기초 | web | 40s.invest | — | — | 7 |
| 20 | 대출·신용 (Loans & Credit) | 신용점수·대출·상환·금리 | partial | — | finance-consult | pol-kinfa | 7 |
| 21 | 보험 (Insurance) | 건강·자동차·실손·생명보험 | partial | — | — | pol-nhis | 8 |
| 22 | 세금·연말정산 (Tax & Year-End Settlement) | 소득세·종합소득세·부가세·공제 | partial | — | — | pol-hometax | 7 |
| 23 | 부동산·주택 (Housing & Real Estate) | 전월세·매매·청약·주거 정책 | web | 20s.housing, 30s.housing, 40s.housing, 50s.housing, 60s.housing, 70s.housing | house-search, housing-info | pol-myhome | 8 |
| 24 | 이사·독립 (Moving & Independent Living) | 자취·전입·공과금·생활 준비 | web | 20s.indep | moving, cleaning, storage, internet, utilities, furniture | — | 7 |

## D. 연애·결혼·임신·출산·가족 (Family & Relationships, 25–32)

| # | 분야 | 세부 서비스 | 상태 | 기존 Life Stage 분야 | 서비스 안내 | 공식 포털 | 세부 주제 수 |
|---|---|---|---|---|---|---|---|
| 25 | 연애·인간관계 (Relationships) | 관계·소통·갈등·생활 정보 | web | 20s.love, 30s.relation, 10s.friends | community-join | — | 6 |
| 26 | 결혼·신혼 (Marriage & Newlyweds) | 결혼 준비·혼인신고·신혼 지원 | web | 30s.marriage | wedding | — | 6 |
| 27 | 임신 준비 (Pregnancy Planning) | 임신 전 건강·검사·지원 제도 | planned | — | — | — | 6 |
| 28 | 임신·출산 (Pregnancy & Birth) | 임신 주차·출산 준비·출산 지원 | web | 30s.birth | — | pol-childcare | 8 |
| 29 | 육아·양육 (Parenting) | 육아휴직·보육·양육 지원 | web | 30s.parenting, 40s.kids | childcare | pol-childcare | 9 |
| 30 | 가족 생활 (Family Life) | 가족 행정·생활·복지·지원 | web | 30s.family, 40s.family, 50s.kids, 60s.family, 70s.family | — | — | 8 |
| 31 | 반려동물 (Pet Life) | 입양·등록·건강·반려생활 정보 | planned | — | — | — | 7 |
| 32 | 가족 돌봄 (Family Caregiving) | 부모 돌봄·간병·돌봄 지원 제도 | web | 40s.care, 50s.care, 60s.care, 70s.care | parent-care | pol-longtermcare | 8 |

## E. 건강·여가·복지·노후 (Wellness & Later Life, 33–40)

| # | 분야 | 세부 서비스 | 상태 | 기존 Life Stage 분야 | 서비스 안내 | 공식 포털 | 세부 주제 수 |
|---|---|---|---|---|---|---|---|
| 33 | 건강·의료생활 (Health & Medical Life) | 건강검진·병원 이용·의료 제도 | web | 10s.health, 20s.health, 30s.health, 40s.checkup, 50s.health, 60s.health, 70s.health, 70s.medical | health-checkup | pol-nhis | 7 |
| 34 | 정신건강·상담 (Mental Health & Counseling) | 스트레스·상담·지원기관 | partial | — | mental-health | pol-mentalhealth, pol-cyber1388 | 6 |
| 35 | 운동·영양 (Exercise & Nutrition) | 운동 습관·영양·건강생활 | web | 40s.exercise, 50s.exercise, 60s.exercise, 70s.exercise | exercise | — | 6 |
| 36 | 문화·여가 (Culture & Leisure) | 취미·공연·전시·문화생활 | web | 10s.hobby, 20s.hobby, 40s.leisure, 50s.hobby, 60s.hobby, 70s.hobby, 60s.digital, 70s.digital | culture, hobby-class, digital-help | — | 7 |
| 37 | 여행·해외생활 (Travel & Overseas Life) | 여행 준비·해외생활·여행 안전 | web | 20s.travel, 30s.travel, 50s.travel, 60s.travel, 70s.travel | travel-plan | — | 6 |
| 38 | 복지·정부지원 (Welfare & Government Support) | 지원금·바우처·복지 제도 | web | 20s.public, 10s.support, 70s.welfare, 70s.support | welfare | pol-bokjiro, pol-youthcenter, pol-gov24, pol-kordi | 8 |
| 39 | 은퇴·시니어 (Retirement & Senior Life) | 연금·퇴직·노후 준비 | web | 40s.retire, 50s.retire, 50s.pension, 60s.after, 60s.pension, 70s.pension, 50s.social, 60s.social, 70s.social | pension, senior-job | pol-nps, pol-kordi | 8 |
| 40 | 상속·장례 (Inheritance & Funeral) | 상속 절차·유언·장례 행정 | planned | — | — | — | 8 |

## 합계

- 분야 40, 세부 주제 294
- web 24 · partial 8 · planned 8

## Life Event Explorer 예시 연결 (13개)

| 사건 | 연결 분야 |
|---|---|
| 군 입대 | 09, 18, 05, 14 |
| 첫 취업 | 05, 06, 17, 22 |
| 독립·이사 | 24, 23, 14, 15 |
| 결혼 준비 | 26, 23, 18, 14 |
| 임신·출산 | 27, 28, 29, 06 |
| 은퇴 준비 | 39, 18, 33, 38 |
| 대학 진학 | 02, 01, 38 |
| 자격증 취득 | 03, 08, 05 |
| 운전면허 취득 | 10, 11, 21 |
| 창업 | 07, 22, 20 |
| 첫 주택 구매 | 23, 18, 20, 22 |
| 이직 | 05, 06, 08 |
| 가족 돌봄 | 32, 33, 38 |

> Life Event Explorer는 웹사이트에서 구조를 보여 주는 예시이며 앱 기능이 아니다. 입력 저장·개인 결과 계산 없음.
