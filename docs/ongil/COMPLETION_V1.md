# ONGIL COMPLETION V1 — real product completion audit + 건강 수치

- 작성일: 2026-10-04 (KST) · branch `ongil-foundation-v1` · 시작 HEAD `eb8f972fe` (worktree clean, ONGIL 697/697)
- 범위: ONGIL만. LIVON · shared · server · Vercel · GitHub Pages · 환경변수 변경 없음.
- 판정 어휘: READY / PARTIAL / BLOCKED / NEEDS EXTERNAL CONFIG. LIVE VERIFIED 주장 없음 (실제 provider 요청은 하지 않았다).

## 1. Audit 방법

| 검사 | 방법 | 결과 |
|---|---|---|
| route 전수 | 59개 hash route (10 view + life 14 · care 11 · enjoy 6 · community 2 · store 10 · admin 4 섹션) × 320/360/390/430/768/1024/1280/1440 | page error 0, console error 0, 가로 overflow 0, 이름 없는 버튼/링크 0, 빈/`javascript:` 링크 0, label 없는 입력 0, 화면당 h1 1개, `undefined/null/NaN` 노출 0, fake-success 문구 0 |
| dead button | 390px에서 화면별 보이는 버튼 190종(같은 이름은 1회)을 하나씩 클릭 → DOM·hash·focus·열린 패널·localStorage·scroll 변화 비교 | 반응 없는 버튼 0, native alert/confirm 0 |
| 상태 일관성 | 즐길거리 상세 저장 → 저장 화면 → 저장 화면에서 빼기 → 목록·상세 다시 열기; 할 일 추가 → Home/내 생활; 개인 기록 검색; 전체 삭제 후 각 화면 | 상세 버튼·저장 수·저장 화면 일치, 지운 글은 저장 화면에 "원래 글이 지워져" 표시, 개인 기록 검색 결과 0, 전체 삭제 후 ONGIL key 0 · 화면 빈 상태 |
| 키보드·모달 | 즐길거리/돌봄 상세(Enter로 열기 → Tab 25회 → Escape), 검색·알림·도우미 패널, skip link | 상세: focus가 제목 → Tab이 밖으로 나가지 않음 → Escape 시 연 버튼으로 복귀. 패널: 입력칸/첫 링크로 focus, Escape 시 도구 버튼으로 복귀. 첫 Tab = "본문으로 건너뛰기" → `#og-main` |
| 데이터 연결 | 실제 route 코드(`server/livon/data/http.mjs`)를 가짜 upstream으로 띄운 로컬 서버 | 평생학습·Kakao·TourAPI 결과가 화면·상세·저장까지 이어짐 (mock — LIVE 아님) |

이전 Phase 11·12·hardening이 대부분을 이미 막아 두었다. 이번 감사에서 **HIGH / MEDIUM 결함은 발견되지 않았다.**

### 남은 LOW

- 내 생활 월 달력의 날짜 버튼이 320px에서 약 38×38px (7칸 고정). WCAG 2.2 AA 2.5.8(24px)은 충족, ONGIL 자체 기준 44px에는 못 미친다. 360px 이상에서는 44px 이상.
- 캐시 버전(`?v=20261003r11`)은 테스트가 고정해 둔 값이라 이번에도 올리지 않았다. 모듈은 상대 경로로 불러 기본 재검증되지만, 다음 배포에서 버전을 함께 올리는 것을 권장.

## 2. 기능 인벤토리 (실제 코드 기준)

| 영역 | 상태 | 비고 |
|---|---|---|
| 홈 (인사·안부·일정·복약·생활 체크·할 일·오늘 뭐 하지·주변 추천·빠른 실행) | READY | 할 일 카드는 "오늘까지"만 보이고 나머지는 개수로 안내 (설계대로) |
| 내 생활 (월 달력·일정·할 일·루틴·식사·물·운동·수면·생활비·기록·기분) | READY / PARTIAL | 주·일 달력 보기 없음(월만), 사진 없음 |
| 건강·안부 (안부·몸 상태·증상·복약 계획/기록·건강 메모·**건강 수치**) | READY | 병원 일정·검진·도움 요청·긴급 연락망은 "준비 중" 표시(available:false). 긴급 연락망은 `tel:`/자동 전화 금지 규칙(OG-NF-3) 때문에 설계 결정이 먼저 필요 |
| 가족 | PARTIAL (local) / BLOCKED (원격) | 공유 범위 선택·도움 요청 메모만 이 기기에 저장. 연결·권한·동의·공유·철회·감사 로그는 contract만 있고 실제 가족 계정 연결은 없음 — UI도 연결된 척하지 않음. 원격 연결은 Newon+ 계정 + backend 필요 |
| 돌봄·서비스 (11개 분류) | READY (facility: provider) / PARTIAL | 시설 찾기는 Kakao provider. 예약 기능 없음, "예약 완료" 문구 없음 |
| 즐길거리 (취미·배움·운동·문화·외출·여행) | READY | 평생학습 · TourAPI · Kakao. 상세: 출처·공식 링크·저장·일정 추가·가족에게 보낼 문장 |
| 커뮤니티 | PARTIAL (local) / BLOCKED | 내 글·그룹/모임 초안은 이 기기에만. 피드·댓글·공감·팔로우·신고는 contract만 — 원격 커뮤니티 backend 없음 |
| 스토어 (10개 분류) | NEEDS EXTERNAL CONFIG | 상품 source 미연결 → 모든 분류가 정직한 빈 상태. checkout·결제·재고·배송 없음 (STORE_COMMERCE guard 유지) |
| 통합검색 · 저장 · 알림 | READY | 저장 7종. 개인 기록은 검색 대상 아님. 알림은 이 기기 안의 목록일 뿐 push가 아님(화면에 명시) |
| 계정 / Newon+ | BLOCKED | anonymous/local-first 유지. 가짜 로그인 없음 |
| ONGIL AI | READY (local) | deterministic, 쓰기는 확인 후 1회 (이중 확인 방지 검증됨). LLM 없음 |
| 관리 / 분석 | READY (local only) | 이 기기의 운영 화면일 뿐 production admin 아님. auth + RBAC 전에는 공개하지 않음 |
| 공공데이터 | NEEDS EXTERNAL CONFIG | 코드 READY. `LIVON_API_ORIGIN` + Vercel 키가 있어야 실제 데이터 |

## 3. 이번에 만든 것 — 건강 수치 (Health measures)

인벤토리에서 요청 범위 중 "사용자가 직접 입력한 건강 기록 — 체중·혈압·혈당"이 **MISSING** 이었다. backend 없이 이 기기만으로 완성할 수 있어 이것을 먼저 했다.

- 위치: 내 생활 › 건강 › **건강 수치** (`#life/measures`). 건강·안부 메뉴와 내 생활 메뉴에서도 연결.
- 종류: 체중(kg, 소수 1자리) · 혈압(mmHg, "120/80") · 혈당(mg/dL) · 맥박(회/분). 선택: 언제 쟀는지(아침에 일어나서 / 식사 전 / 식사 후 / 자기 전 / 그 밖의 때), 잰 시간, 메모.
- 날짜: 생활·건강 공통 날짜 막대의 날. 오늘과 지난날(1년)만, 미래 불가. 하루 20건.
- 입력 검사: 타이핑 실수만 잡는다(예: 체중 1200, 혈압 80/120). 오류 문구는 예시와 함께, 해당 칸 `aria-invalid` + `role="alert"`.
- 고치기 / 지우기(확인 후) / 최근에 적은 수치(종류별 5개, 최신순, 숫자만).
- **판단하지 않는다**: 정상 범위·높음/낮음·색·점수·목표·조언 없음. 카드 안내: "적은 숫자를 그대로 보관합니다. 높고 낮음을 판단하지 않아요. 수치가 걱정되면 의료진과 상담하세요."
- 최근 건강 기록(7일) 줄에는 "수치 N건"만 — 숫자는 인용하지 않는다.
- 개인정보: 새 collection `healthMeasures` = HEALTH_ADJACENT. sync·검색·가족 공유·커뮤니티·분석·도우미·알림 어디에도 연결되지 않음(테스트 OG-HM-4). 전체 삭제 시 함께 지워짐.

### 브라우저 QA (로컬, 320 / 390 / 1280)

| 단계 | 결과 |
|---|---|
| 빈 상태 | "오늘 적은 건강 수치가 없어요." |
| 혈압 80/120 저장 | 저장 안 됨, 예시가 있는 오류 + `aria-invalid="true"` |
| 혈압 128/82 · 아침에 일어나서 · 07:30 | "혈압 128/82 mmHg · 오전 7:30 · 아침에 일어나서" |
| 체중 62.5 추가 → 61.8로 고치기 | 목록·최근 목록 즉시 반영 |
| 혈압 지우기 | 확인 질문 후 삭제 |
| 최근 건강 기록 | "10월 4일 일요일 (오늘) 수치 2건" |
| 검색 "61.8", "체중" | 결과 0 |
| 도우미 "체중 알려줘" | 처리하지 않음 (건강 수치를 읽지 않음) |
| 분석 counter | 숫자·종류 흔적 없음 |
| overflow / page error | 없음 (320–1440 8개 폭) |

## 4. 테스트

- 새 파일 `tests/ongil/health-measures.test.mjs` — OG-HM-1 ~ OG-HM-6 (contract, store, 한도·손상·저장 실패, 개인정보, 판단 없는 문구, 연결).
- collection 수·module 수·My Life 섹션·HEALTH_ADJACENT 목록을 고정해 둔 기존 테스트는 **값만** 갱신했다(24→25 collection, 68→69 module, 섹션 +`measures`, 테스트 파일 23→24). 규칙을 약하게 바꾼 테스트는 없다.
- 결과: ONGIL 703/703, LIVON 477 pass / 0 fail / 1 skip(기존 PostgreSQL, `LIVON_TEST_PG` 미설정).

## 5. backend / 외부 설정이 필요한 것

- 원격 가족 연결·공유·철회 감사 로그 → Newon+ 계정 + 서버 저장소 + 동의 설계 (BLOCKED)
- 원격 커뮤니티(피드·댓글·신고·차단·운영) → backend + 운영 정책 (BLOCKED)
- 스토어 상품 → 제휴/상품 source 연결 (NEEDS EXTERNAL CONFIG)
- 공공데이터 실데이터 → `LIVON_API_ORIGIN` + Vercel 키 (NEEDS EXTERNAL CONFIG; 공유 `/api/livon/data` 재사용, backend contract 변경 불필요)
- push 알림 → 서버 + 권한 설계 (BLOCKED)
