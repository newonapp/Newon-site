# ONGIL PHASE 3 — HEALTH + CHECK-IN V1

- 작성일: 2026-10-02
- Worktree: `~/Newon-ongil` · branch `ongil-foundation-v1` · Phase 2C 미커밋 상태 위에서 작업
- 상태: 구현 + 검증 완료, **미커밋** (git add / commit / push 하지 않음)
- 선행 문서: `PHASE_1_FOUNDATION_V1.md`, `PHASE_2A_HOME_V1.md`, `PHASE_2B_MY_LIFE_V1.md`, `PHASE_2C_INTEGRATION_V1.md`

## OBJECTIVE

건강 기록과 일상 체크인을 Home · 내 생활 위에 연결했다. **의료 기능이 아니다.** 질병·증상을 판단하지 않고,
위험도·점수·등급을 계산하지 않고, 약·복용량을 권하지 않으며, 증상을 적었다고 응급 안내를 띄우지 않는다.
사용자가 자기 상태·복약·증상·메모를 적어 두고 날짜별로 다시 보는 local-first 생활 기록이다.
ONGIL dark / film 디자인은 그대로이며(새 색·서체·컴포넌트 없음, 기존 카드·선택 버튼·목록·입력·날짜 막대 재사용) LIVON·shared root 파일은 건드리지 않았다.

## START CHECK

| 항목 | 결과 |
|---|---|
| PHASE 2A / 2B / 2C INCLUDED | YES (2C 문서·테스트 미커밋 상태로 존재, git status 로 확인) |
| HOME INTEGRATION / MY LIFE / LOCAL STORAGE | YES |
| 작업 전 테스트 | `node --test tests/ongil/*.test.mjs` → 131 / 131 PASS |

## AUDIT (작업 전)

| 대상 | 분류 | 내용 |
|---|---|---|
| check-in | EXISTS | `checkin.js` — 하루 1건, 기분(status) 4가지, Home "오늘의 안부". 오늘만 쓰기 가능 |
| medication | EXISTS | `medication.js` — 이름·시간·메모 + 날짜별 먹음 표시(`medicationLogs`, 120일) |
| medication 요일/이력/지난 날 수정 | PARTIAL | 요일 없음, 계획 수정 시 과거 표시 이름이 함께 바뀜, 이력 화면 없음 |
| daily (meal·water·exercise) / sleep | EXISTS | My Life 생활 탭 + 날짜 막대(`createDayNav`) |
| condition / 몸 상태 · 에너지 · 통증 | MISSING | |
| symptoms | MISSING | |
| health notes | MISSING | (journal 은 PRIVATE 일기 — 건강 메모로 재사용하지 않음) |
| health history | MISSING | |
| `#health` 건강·안부 영역 | PARTIAL | 화면 shell + "준비 중" slot 8개(안부·복약이 실제로는 Home 에 있는데도 준비 중으로 표시) |
| notification | EXISTS (shape only) | CHECK_IN / MEDICATION 알림 type 만 정의, 생성기 없음 — 변경하지 않음 |
| family | EXISTS (shell) | 공유 없음, `familySharingAllowed() === false` — 변경하지 않음 |
| date utility | EXISTS | `dates.js` 단일 — 재사용, 새 date utility 없음 |
| DUPLICATE | 없음 | 새 medication / check-in store 를 만들지 않았다 |

## ARCHITECTURE

```
Home (오늘의 안부 · 복약 · 오늘 남은 것)          내 생활 › 건강 (새 탭)
          │                                           │  안부와 몸 상태 · 증상 · 복약 · 내 약 목록 · 건강 메모 · 최근 건강 기록
          │                                           │  ← 생활 탭과 같은 날짜 막대(DOM 노드 하나를 두 탭 사이에서 옮김)
          └──────── 같은 store 객체 (app.js 에서 한 번 생성) ────────┘
     checkIn · medication · symptoms(신규) · healthNotes(신규)
                            │
                   storage.js  "ongil.v1.<collection>"  (localStorage, 이 기기만)
```

- 새 파일: `symptoms.js`, `health-notes.js` (store), `life-health.js` (화면).
- `createLifeView({ host, stores, health })` — 건강 store 는 `stores` 와 분리된 `health` 로 받는다. My Life 요약(`buildOverview`)은 건강 store 를 읽지 않는다.
- 새 `#health` 화면을 만들지 않았다. 기존 `#health` 건강·안부 영역은 "내 생활 › 건강 열기" 버튼으로 연결하고, 실제로 동작하는 slot(안부와 몸 상태 · 생활 체크 · 복약 · 증상·건강 메모)만 "사용할 수 있음"으로 바꿨다. 도움 요청 · 긴급 연락망 · 병원 · 검진은 계속 준비 중.

## DATA MODEL

collection 16 → **18** (`symptoms`, `healthNotes` 추가). 모두 HEALTH_ADJACENT.

| Collection | 모양 | 비고 |
|---|---|---|
| `checkins` | `{ items: { 'YYYY-MM-DD': { status?, body?, energy?, pain?, memo?, createdAt, updatedAt } } }` | 하루 1건. Phase 3 필드는 **고른 것만 저장**(sparse) → Phase 2A 기록(status 만)이 그대로 읽히고, Home 만 쓴 기록은 이전과 key 가 같다. 하나 이상 있어야 기록 |
| `symptoms` (신규) | `{ items: { 'YYYY-MM-DD': { symptoms[], other, intensity, note, createdAt, updatedAt } } }` | 하루 1건 aggregate |
| `healthNotes` (신규) | `{ items: [ { id 'hn_…', date, text ≤300, createdAt, updatedAt } ] }` | 하루 최대 10건, 전체 700건 |
| `medications` | `+ daysOfWeek[]` | 없거나 비면 매일 → 기존 기록 = 매일 |
| `medicationLogs` | `{ items: { date: { medId: { taken, updatedAt, name?, time? } } } }` | 표시할 때의 이름·시간 snapshot. 보관 120 → **366일** |

- 선택지(모두 스스로 고르는 말, 숫자 없음)
  - 기분: 좋아요 / 괜찮아요 / 조금 힘들어요 / 도움이 필요해요 (Phase 2A 그대로 = Home 오늘의 안부)
  - 몸 상태(컨디션): 좋아요 / 보통이에요 / 피곤해요 / 컨디션이 떨어져요
  - 에너지: 충분해요 / 보통이에요 / 부족해요 · 통증: 없어요 / 있어요
  - 증상: 두통 · 어지러움 · 기침 · 콧물 · 목 불편 · 복통 · 소화 불편 · 근육통 · 피로 · 기타(글 40자)
  - 느낌의 정도(스스로 고르기): 약하게 / 보통 / 강하게 — 의학적 severity 아님, 아무 판단에도 쓰지 않음
- **STORAGE VERSIONING**: key 는 `ongil.v1.*` 그대로, `schemaVersion` 1 그대로. 모든 변경이 추가형(optional field)이라 migration 이 필요 없다. 옛 모양은 읽을 때 기본값으로 정리된다(테스트 OG-HL-1).

### SAME-DAY POLICY (결정)

- **Check-in**: 날짜당 1건. 같은 날 다시 저장하면 그 기록을 고친다(`save(patch, date)` 는 바꾼 필드만 바꾸고 나머지 유지). 모든 필드를 지우면 그날 기록이 사라진다.
- **Symptoms**: 날짜당 1건 aggregate. 이유: 화면이 "그날 무엇을 느꼈나"를 한 번에 고르는 형태라 여러 entry 보다 단순하고, 날짜 막대·이력과 1:1 로 맞는다. 하루 안의 시간 순서가 필요하면 메모나 건강 메모에 적는다.
- **Health notes**: 하루 여러 건(최대 10). 각각 고치고 지울 수 있다.

### MEDICATION MODEL — plan / log 분리

- plan = `medications` (이름·시간·요일·메모). log = `medicationLogs` (날짜별 표시 + 표시 순간의 이름·시간 snapshot).
- 약 이름·시간을 고쳐도 **이미 표시한 날**은 그때 이름·시간으로 보인다. 지난 날 표시를 고쳐도 그날 snapshot 은 유지된다.
- `historyForDate(date)`: 그날 표시한 약(snapshot) + 그날 요일에 해당하고 그날 이전에 적어 둔 약(표시 없음 = "표시하지 않았어요").
- 약을 **지우면** 그 약의 표시도 함께 지운다(Phase 2A 정책·테스트 OG-MD 유지). 대규모 rewrite 를 피하기 위해 바꾸지 않았다 → KNOWN LIMITATIONS.
- 요일을 바꾸면 표시가 없는 지난 날의 "예정"은 바뀐 요일 기준으로 보인다(계획 이력은 저장하지 않음) → KNOWN LIMITATIONS.

## CHECK-IN

- Home "오늘의 안부": 기분만 고른다(그대로). 같은 기록이므로 내 생활에서 적은 몸 상태·에너지·메모는 Home 에서 기분을 바꾸거나 지워도 유지된다(`set()` 은 status 만, `clear()` 는 다른 필드가 있으면 status 만 지움).
- 내 생활 › 건강 › 안부와 몸 상태: 기분 · 몸 상태 · 에너지 · 아픈 곳이 있었나요? — 큰 선택 버튼, 누르면 바로 저장, 다시 누르면 선택 취소. 메모(200자)는 "메모 저장". "도움이 필요해요"는 Home 과 같이 "ONGIL은 이 선택을 다른 사람에게 알리지 않습니다" 안내만.
- 지난 날 수정·삭제 가능(삭제는 확인 단계).

## SYMPTOMS

- 여러 개 선택 → 고르면 "느낌의 정도" 질문이 나타남 → 기타를 고르면 "기타 증상" 입력칸. 메모 200자.
- 증상 기록은 응급 안내·경고·원인 추정을 띄우지 않는다(브라우저: "어지러움 + 강하게"에서도 119/응급/위험 문구 0).

## MEDICATION

- **복약** 카드(고른 날): 그날 먹을 약 + 체크박스. 오늘 표시 안 한 약은 "아직 복용하지 않았어요", 지난 날은 "표시하지 않았어요" — 사실만. 지난 날 표시를 고칠 수 있다(미래 불가).
- **내 약 목록** 카드: 이름·먹는 시간·먹는 요일(요일 체크박스 fieldset, 비우면 매일)·메모. 추가·고치기·지우기(확인). 안내: "ONGIL은 약이나 복용량을 정하거나 권하지 않습니다. 고친 내용은 앞으로의 날에 쓰이고, 이미 표시한 날의 기록은 그대로 남습니다."
- 시간은 화면 표시용이다. OS 알림·push·setTimeout 을 만들지 않았다(테스트 OG-HL-40).

## HEALTH NOTES

- 고른 날짜의 메모 목록. "건강 메모 쓰기" → 300자 textarea. 줄바꿈 유지. 고치기·지우기(확인).

## HISTORY

- **최근 건강 기록** 카드: 최근 7일, 날짜마다 한 줄 — "안부 (기분 좋아요, 몸 피곤해요) · 증상 2가지 · 약 3개 중 2개 먹음 · 메모 1건". 메모 내용은 인용하지 않고 건수만. 날짜를 누르면 위 카드들이 그날로 바뀐다.
- **다른 날짜 열기**: `<input type="date" min max>` — 1년 전(연도 표기)부터 오늘까지. 범위 밖이면 오류 문장 + `aria-invalid`.
- 수백 건 전체 렌더 없음: 이력 7줄 + 고른 하루만 렌더(365일 fixture 에서 건강 패널 DOM 260 노드).

## HOME INTEGRATION

- 카드 구성·순서·빠른 실행 6개 그대로(새 Quick Action 없음).
- 오늘의 안부 카드: "몸 상태·증상도 적기" → `#life/checkin` (체크인 CTA 를 기존 카드 안에 통합).
- 복약 카드: 오늘 요일의 약만 보인다. "요일 정하기, 지난 날 복약 보기" → `#life/medication`. 약이 있지만 오늘 해당이 없으면 "오늘 먹을 약으로 적어 둔 것이 없어요."
- 오늘 남은 것(요약): 기존 항목 + **오늘 안부: 남겼어요 / 아직 남기지 않았어요**. 오늘 적은 것이 하나라도 있을 때만 나타난다(아무것도 없으면 요약 숨김 — 2C 정책 유지). 건강 상태를 판단하는 문장은 없다(기분 값도 요약에 넣지 않음).

## MY LIFE INTEGRATION

- 탭 4 → **5** (요약 · 일정 · 생활 · 기록 · **건강**). 섹션 10 → 14 (`checkin`, `symptoms`, `medication`, `health-notes`). 주소 `#life/health` = 건강 탭.
- Daily Life(식사·물·운동·수면) 와 Health(안부·증상·복약·건강 메모)는 탭으로 나누고, **날짜 막대는 하나**를 공유한다: 생활 탭에서 고른 날짜는 건강 탭에서도 같은 날짜(브라우저 확인).
- 건강 탭 맨 위 안내 1회: "ONGIL의 건강 기록은 생활 기록을 위한 기능이며 의료 진단을 대신하지 않습니다. 이 기기에만 저장되고 다른 사람에게 보내지 않습니다." (카드마다 반복하지 않음)

## SYNC MATRIX (브라우저, 390 / 820 / 1440 모두 동일 결과)

| 대상 | 동작 | 결과 |
|---|---|---|
| CHECK-IN | 내 생활에서 기분·몸 상태 → Home 안부 선택 표시 | PASS |
| CHECK-IN | Home 에서 "조금 힘들어요" → 내 생활 기분 바뀜, 몸 상태 유지 | PASS |
| MEDICATION | 내 생활에서 약 추가·표시 → Home 목록·표시·요약 | PASS |
| MEDICATION | Home 에서 표시 → 내 생활 표시 | PASS |
| SYMPTOM | 내 생활 → 최근 건강 기록 줄 즉시 갱신 (Home 에는 표시하지 않음) | PASS |
| HEALTH NOTE | 내 생활 → 최근 건강 기록 건수 즉시 갱신 | PASS |
| 새로고침 | 저장값 전체 동일, 표시 상태 동일 | PASS |
| 지난 날 수정 | 어제 몸 상태 수정 → 오늘 값 그대로 | PASS |

## PRIVACY / LOCAL-ONLY

| Class | Collection | sync | 전체 검색 | 가족 공유 | Community |
|---|---|---|---|---|---|
| HEALTH_ADJACENT | checkins, medications, medicationLogs, **symptoms, healthNotes** | 제외 | 제외 | 없음 | 없음 |

- sync 가능 목록은 그대로 `profile, preferences, saved, onboarding`. 연결된 adapter 로 테스트해도 건강 기록 push 0건.
- 검색 provider 는 2개(메뉴, 저장한 것) 그대로. 약 이름·안부 메모·증상·기타·건강 메모로 검색 → **0건**(단위 테스트 + 브라우저).
- 건강 파일에는 fetch / XHR / beacon / WebSocket / Notification / 타이머가 없다.
- "이 기기의 ONGIL 데이터 지우기"가 새 collection 까지 지운다(storage.clear 가 COLLECTIONS 전체를 지움). 안내 문구에 "증상과 건강 메모도 함께 지웁니다." 추가. LIVON·사이트 key 는 보존.

## DATE HANDLING

- 모든 날짜 키는 `dates.js` 의 로컬 `YYYY-MM-DD`. 새 날짜 유틸 없음. 쓰기 가능 범위 검사는 `checkin.js` 의 `writableDay(date, today)` 하나를 증상·메모·복약이 함께 쓴다.
- 미래 날짜 금지(FUTURE_DATE), 365일 전보다 오래된 날 금지(TOO_OLD), 오래된 기록은 다음 저장 때 정리.
- 테스트한 시간대: Asia/Seoul, America/Los_Angeles, Pacific/Kiritimati(+14), Pacific/Pago_Pago(−11), Europe/London, UTC — 자정 직전/직후, 월말, 연말, 윤일(2028-02-29), 3월 1일.

## ACCESSIBILITY

- 선택 버튼: `aria-pressed` + ✓ 글리프(색만으로 구분 없음). 각 질문은 보이는 제목(h4)으로 이름 붙은 `role="group"` (fieldset/legend 와 같은 의미, 기존 Home/생활 패턴과 동일). 요일 선택은 `fieldset` + `legend`.
- 입력: 모두 `label for`, 선택 항목 "(선택)" 표시, 도움말 `aria-describedby`, 오류는 `role="alert"` + `aria-invalid` + 초점 이동.
- 삭제: 항상 확인 단계, 여는 버튼 `aria-expanded`, 취소하면 초점 복귀(키보드 Enter 로 확인).
- 날짜: 날짜 막대 글자 "10월 2일 금요일 (오늘)" + `aria-live="polite"`. 최근 건강 기록의 날짜 버튼은 "10월 1일 목요일 건강 기록 보기", 고른 날은 `aria-pressed="true"` + `aria-current="date"` + ✓.
- 키보드: 선택 버튼 Space 로 선택(초점 유지 확인), 탭 ←/→/Home/End, 처음 설정 dialog Tab 25회 후에도 내부·Escape 닫힘·초점 복귀, 검색·알림 패널 Escape 후 버튼 복귀.
- 측정(세 폭, 건강 EMPTY/FILLED/약 입력 양식, Home EMPTY/FILLED): 44px 미만 조작 요소 **0**, 16px 미만 글 **0**(영문 라벨·헤더 메뉴 제외, 2C 기준 동일).
- **STATIC SCREEN READER REVIEW: PASS** (위 role/aria/label 구조, 테스트 OG-HL-32).
- **ACTUAL SCREEN READER (VoiceOver / TalkBack): NOT VERIFIED.**

## PERFORMANCE (365일 fixture)

- fixture: check-in 365 · 증상 365일 · 약 3개 × 365일 표시 · 건강 메모 365건(브라우저), 단위 테스트는 메모 300자 × 365.
- 저장 크기: checkins 43k · symptoms 45k · medicationLogs 89k · healthNotes 71k chars (값 한도 400k 이내, 단위 테스트는 최대치 fixture 로 확인).
- 건강 탭 진입 후 DOM: 패널 260 노드 / 페이지 1,545 노드. 이력 7줄, 메모 카드는 고른 날 것만.
- 날짜 이동(이전 날) 22ms, 300일 전 날짜 열기 33ms. Long task 최대 59ms(fixture 를 읽어 들이는 진입 시점) — 눈에 띄는 멈춤 없음.

## RESPONSIVE

Headless Chromium, 외부 요청 차단(웹폰트·영상은 QA 환경에서 불가 — 2C 와 같음).

| 상태 | 1440 | 820 | 390 |
|---|---|---|---|
| 건강 EMPTY / FILLED, 안부·증상 양식, 약 입력 양식, 복약 표시, 건강 메모 양식, 최근 기록, Home EMPTY / FILLED | 넘침 0 | 넘침 0 | 넘침 0 |
| console error / page error | 0 | 0 | 0 |

- 긴 약 이름(공백 없는 31자 영문+한글 9자), 200자 메모, 공백 없는 300자 건강 메모 모두 줄바꿈(390 확인).
- 390 에서 탭 5개는 각 65px 폭, 한 줄.

## TESTS

`node --test tests/ongil/*.test.mjs` → **171 tests / 171 pass / 0 fail / 0 skip**

- 기존 131: 전부 유지, 삭제·skip 없음.
- 신규 40 (`health-data.test.mjs` 31, `health-view.test.mjs` 9): OG-HL-1 … OG-HL-40.

기존 assertion 변경 — 모두 의도된 제품 변화, 테스트 파일에 이유를 주석으로 남김, 확인 범위를 줄이지 않음:

| Test | 이전 | 이후 | 이유 |
|---|---|---|---|
| OG-ST-2 (foundation-data) | collection 16개 목록 | 18개 목록(+symptoms, healthNotes). `healthRecords`·family 거부는 그대로 | 새 collection |
| OG-PV-1 (life-privacy) | HEALTH_ADJACENT 3개, contract 11개 | 5개, contract 13개 | 새 collection 분류 |
| OG-IV-8 (integration-view) | HEALTH_ADJACENT 3개 | 5개, sync 목록 동일 확인 유지 | 같음 |
| OG-IV-1 (integration-view) | `COLLECTIONS.length === 16` | 18 (Home 전용 collection 없음 확인 유지) | 같음 |
| OG-IN-14 (integration-data) | "all sixteen" | "all eighteen", 외부 key 보존 확인 그대로 | 같음 |
| OG-MD-1 (home-data) | key: createdAt,id,memo,name,schemaVersion,time,updatedAt | + daysOfWeek, 기본 매일 확인, dose/interactions 없음 명시 확인 추가 | 복약 요일 |
| OG-IN-9 (integration-data) | 요약 항목 기대값 | + `['checkin', '아직 남기지 않았어요']`, 빈 Home 요약 없음 확인 유지 | Home 요약에 체크인 |
| OG-IV-5 (integration-view) | 9개 섹션·alias 3개 | 13개 섹션·alias 4개(+`#life/health`) | 건강 탭 |
| OG-LF-1 (life-view) | 10 섹션 / 4 탭 | 14 섹션 / 5 탭 | 건강 탭 |
| OG-LF-7 (life-privacy) | `repeat(4, …)` | `repeat(5, …)` (가로 스크롤 없는 grid 유지, 390 브라우저 확인) | 5번째 탭 |
| OG-VW-1 (shell) | Home·My Life 만 available | + 건강·안부의 실제 동작 4개만 available, 나머지 4개 준비 중 고정 확인, link 확인 | 정직한 상태 표시 |
| OG-SE-2 (foundation-flows) | 건강·안부 복약 "준비 중" | 복약은 준비 중 아님, 미완성 섹션(병원)은 준비 중 확인 | 같음 |

## REGRESSIONS (브라우저, 세 폭)

| 대상 | 결과 |
|---|---|
| Home | 카드 구성·순서·빠른 실행 6개 그대로, 넘침 0 |
| My Life | 요약·일정·생활·기록 탭 정상, 생활 날짜 막대 동작 그대로 |
| Search | 개인 기록 0건, Escape 후 버튼 복귀 |
| Saved / Account / Store / Family / Care / Enjoy / Community | 화면 정상, 넘침 0 |
| Notification | 패널 `aria-expanded` 정상, 새 알림 생성 없음 |
| Onboarding | dialog 초점 가둠·Escape·초점 복귀 정상, 건강 단계 추가 없음 |
| 손상된 저장소 | 건강 collection 5개 손상 + 새로고침 → 카드 6개 정상, 오류 0, 다시 쓰기 가능, 외부 key 보존 |
| 지우기 | `ongil.*` 0개, `livon.keep`/`newon-other` 보존, 건강 카드 빈 상태 |
| Nearby provider | 변경 없음(파일 수정 없음). 실제 API: NOT VERIFIED (2C 와 같음) |

## FILES

- CREATED: `ongil-start/js/symptoms.js`, `ongil-start/js/health-notes.js`, `ongil-start/js/life-health.js`, `tests/ongil/health-data.test.mjs`, `tests/ongil/health-view.test.mjs`, `docs/ongil/PHASE_3_HEALTH_CHECKIN_V1.md`
- MODIFIED (Phase 3): `ongil-start/index.html`(캐시 버전), `js/app.js`, `js/storage.js`, `js/privacy.js`, `js/life-contracts.js`, `js/checkin.js`, `js/medication.js`, `js/life-view.js`, `js/life-daily.js`, `js/home-view.js`, `js/home-today.js`, `js/areas.js`, `js/views.js`, `js/account-view.js`, `styles/ongil-life.css`; tests `foundation-data`, `foundation-flows`, `home-data`, `integration-data`, `integration-view`, `life-privacy`, `life-view`, `shell`
- LIVON MODIFIED: NO · SHARED MODIFIED: NO · `~/Newon` 원본: 수정 없음

## KNOWN LIMITATIONS

- 이 기기·이 브라우저에만 저장. 서버 sync, 가족 공유, 백업, 내보내기, AI, 알림(push/OS) 없음.
- 약을 지우면 그 약의 지난 표시도 함께 지워진다(Phase 2A 정책 유지).
- 약의 요일을 바꾸면, 표시하지 않은 지난 날의 "예정" 목록은 바뀐 요일 기준으로 보인다(계획 변경 이력은 저장하지 않음). 표시한 날은 그대로.
- 증상은 하루 1건 묶음이라 하루 안의 시간대별 기록은 메모로 남긴다.
- Home 에서는 기분만 고른다(몸 상태·증상은 내 생활 › 건강).
- 날짜 이동은 날짜 막대(하루씩)·최근 7일·날짜 입력. 달력형 건강 이력은 없다.
- 실제 화면낭독기, 실제 기기 터치, 영상 위 대비, 실제 웹폰트 렌더: NOT VERIFIED.
- `Home ↔ 내 생활` 상태 문장(마지막 동작 안내)은 화면 이동 시 지워진다(2C 와 같음).

## FUTURE BACKEND MIGRATION

- 구조: UI → store(`checkin/medication/symptoms/health-notes`) → `storage.js` → backend. backend 를 붙일 때 store API(`get/save/remove/add/update/listForDate/historyForDate/recordedDates`)는 그대로 두고 storage adapter 만 바꾼다.
- `account.js` 의 sync 는 `SYNCABLE_COLLECTIONS` ∩ `maySync()`(APP 등급만) 이중 잠금이다. 건강 기록을 sync 하려면 **별도의 명시적 동의(explicit consent)** 설계가 먼저 필요하다: 항목별 선택, 언제든 철회, 기기 밖 저장 위치 고지, 가족 공유와 분리. 동의 없이 HEALTH_ADJACENT 를 `SYNCABLE_COLLECTIONS` 에 넣는 변경은 OG-PV-1 / OG-HL-27 이 실패시킨다.
- 첫 업로드는 사용자가 직접 고르는 import 로만(Phase 1 원칙 유지). 이번 Phase 에서는 구현하지 않았다.

## PHASE 4 HANDOFF

Phase 4 = FAMILY + CARE COORDINATION V1

- 가족에게 무엇을 보일지는 항목별 동의가 먼저다. 건강 기록(HEALTH_ADJACENT)은 기본 비공개, 자동 공유 금지.
- "도움이 필요해요"는 지금도 아무에게 알리지 않는다. 알림을 만든다면 Family backend + 동의 + 실패 시 안내까지 함께 설계.
- 복약 snapshot·체크인 sparse 모델은 공유 시 "무엇을 보여 주는가"를 필드 단위로 고르기 좋게 되어 있다.

Mac 에서 확인
```
cd ~/Newon-ongil
node --test tests/ongil/*.test.mjs        # 171 pass
python3 -m http.server 8765               # http://localhost:8765/ongil-start/#life/health
git status                                # ongil-start/ tests/ongil/ docs/ongil/ 만 변경
```
