# LIVON 10대 서비스 구현 · 디자인 검수

2026-09-26. 로컬 소스 및 8899 미리보기 반영. 운영 newon.app 미배포.

## 범위

10대 서비스 전체 12개. 기존 학습 플래너·진로 멘토링·취미 클래스·과목별 학습 정보·진학/전공·직업/적성 상세를 유지하고 남은 6개 전용 작업 화면을 공통 상세 시스템에 연결했다.

- 직업 체험: Discovery, `직업 체험 찾기`. 분야·유형·지역·날짜·연령·학년·비용·방식·모집 상태.
- 공모전/대회: Discovery, `공모전 찾기`. 분야·개인/팀·대상·지역·방식·비용·상태·마감일.
- 캠프/봉사활동: Discovery, `활동 찾기`. 별도 탭/분야, 지역·날짜·연령·시간·숙박·모집 상태.
- 지역 프로그램: Discovery, `지역 프로그램 찾기`. 시/도 선택 후 시/군/구 직접 입력, 시설·분야·조건. 위치 권한·지도는 미연결.
- 용돈/저축: Tool, `용돈 관리 시작하기`. 월별 3종 수입, 지출 기록, 월·주 집계, 최다 지출 분류, 실제 저축액, 단일 수정 가능한 저축 목표·진행률.
- 청소년 상담기관: Expert, `상담기관 찾기`. 주제/방식/지역 선택, 공식 청소년1388 연락 및 안내 경로. 지역 기관 목록 API는 미연결. 위기/괴롭힘 선택 시 일반 AI 이동보다 공식 도움을 우선한다.

## 디자인

기존 흑백·서체·헤더 구조를 유지했다. 공통 서비스 카드에 유형 아이콘, 일정한 제목/태그 간격, 전체 너비 CTA, 분리된 보조 액션, 절제된 hover를 적용했다. 10대 새 상세는 데스크톱에서 검색/결과 또는 입력/요약을 나란히 배치하고 모바일에서 한 열로 전환한다. 용돈 화면은 4칸 숫자 요약, 지출 목록, 저축 진행률을 제공한다. 480px 이하 Life Stage 헤더는 로고를 유지하고 글자 로고만 숨겨 검색 아이콘과 겹침을 해소한다. reduced-motion 설정을 존중한다.

## 공유 데이터와 실제 연동 범위

`LivonOpportunities`는 단일 공통 모델/검증/검색 계층이다. 지금은 빈 데이터이며 가짜 프로그램을 포함하지 않는다. 실제 어댑터에서 출처 검증 후 `replace(records)`로 주입한다. 오늘의 발견·탐색·AI에서 재사용할 수 있으며 화면별 중복 데이터는 만들지 않았다. 해당 메뉴의 실제 피드 통합과 서버 수집기는 후속 작업이다.

필수/공통 필드: id,type,title,category,description,organizer,targetAge,targetGrade,region,location,startDate,endDate,applicationStart,applicationEnd,price,status,online,source,sourceUrl,lastVerifiedAt. 유형은 experience/competition/camp/volunteer/local. targetAge는 [최소,최대] 숫자, targetGrade는 배열, 날짜는 YYYY-MM-DD, online은 boolean. subtype: programType,participation,audience,facility,district,overnight,hours,activities,preparation,applicationMethod,theme,deliverables,awards,notes,volunteerCredit,directionsUrl.

공식 기관/지자체/청소년 프로그램 API, 공모전 주최기관, 봉사 모집·시간 인정 데이터, 시설/지도 데이터가 필요하다. sourceUrl HTTPS·확인일·연령 정보가 없는 데이터는 노출하지 않는다. 코드 검증만으로 출처의 진위를 보장하지 않으므로 수집 어댑터의 승인된 출처 목록과 갱신 정책을 마련해야 한다.

상담 공식 출처:
- https://www.1388.go.kr/occ/YTOSP_SC_OCC_01 (상담 안내/연락처/온라인 운영 안내)
- https://www.1388.go.kr/sfi/YTOSP_SC_SSU_01 (기관/서비스 찾기)
확인일 2026-09-26. 주소·지역별 운영시간·예약 가능 여부는 만들지 않았다.

## 저장/일정/AI

기존 LivonPlatform 저장함 재사용: opportunity:{id}, teen-search:{service}.{kind}, official-1388 및 life-service:{id}. 검색 조건은 저장함 payload와 세션 초안으로 복원한다.

기존 `livon.mlStore.v1` 재사용: 용돈 income/expense는 transactions, 목표는 goals, 월별 저축액은 teenAllowance.months. unrelated records 보존. 수입은 월별 고정 ID로 재저장 시 수정한다. 지출 저장 후 폼을 초기화해 연속 클릭 중복을 방지한다. 목표는 단일 목표 수정 방식이며 다중 목표 UI는 후속 확장이다. My Life에서 목표 수정 시 금액 메타데이터도 보존한다. 기록 수정·삭제는 기존 My Life UI 사용.

일정은 확인된 프로그램 시작일 또는 공모전 접수 마감일만 사용한다. `opportunity:{id}:start|deadline` ID로 중복을 방지한다. 실제 데이터가 없으므로 운영 UI에서 일정 버튼은 아직 나타나지 않으며 fixture로 검증했다.

AI는 사용자가 눌렀을 때 초안으로 이동한다. 프로그램은 검증된 현재 항목/출처를, 빈 결과는 검색 조건 및 미연결 사실을 전달한다. 용돈은 집계만 전달하고 개별 메모·거래 전문은 제외한다. 사용자가 전송해야 API 요청이 발생한다. 기존 AI 키 설정/배포가 필요하며 실제 AI 응답은 이번 테스트에서 실행하지 않았다.

## 변경 파일

신규: livon/opportunities-data.js, livon/service-teen-data.js, livon/service-teen.js, tests/livon/teen.test.mjs, docs/livon/teen-services.md.
수정: livon/life-data.js (6개 타입/CTA/상세), service-details.js (확장/맥락/공통 카드 아이콘), service-youth.js (비활성 상세에서 change 처리 방지), life-now-page.js (저축 목표 메타데이터 보존), life-page.css (카드/상세/반응형), index.html (스크립트/캐시 버전). `_publish/livon`은 위 파일들을 복사해 미리보기만 갱신했다.

## 검증

`npm run test:livon` 32개 통과. UI/금액/필터 관련 변경 후 `node --test tests/livon/services.test.mjs tests/livon/teen.test.mjs` 19개 재통과.
자동: 전체 99개 ID/라우트, 10대12개 전용 상세/CTA, 무검증 데이터 차단, 연령·지역·조건 필터, 월별 수입 재저장, 금액 경계값, 주/월 경계 집계, 목표 수정, 기존 데이터 보존, 일정 중복/마감일, 기존 저장/공유/AI 초안.
브라우저: 새6개 CTA/상세, 용돈 수입110,000/지출5,000/저축20,000→잔액85,000, 목표25%, 새로고침 유지, AI 초안 실제 집계, 지역 서울/종로구 저장·복원, 캠프/봉사 탭 재접속, 위기 지원 공식 안내 우선, 단계 전환, 모바일390/태블릿768/데스크톱1280(및 실제 패널957) 가로 넘침 확인. 검증용 용돈 기록은 로컬 브라우저에만 남아 있으며 실제 금융 거래가 아니다.
운영 배포·실시간 모집 피드·계정 동기화·지역기관 검색 API·지도·실제 신청/예약·실제 AI 응답 테스트는 미실행.
