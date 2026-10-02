# ONGIL PHASE 2B — MY LIFE V1

- 작성일: 2026-10-02
- Worktree: `~/Newon-ongil` · branch `ongil-foundation-v1` · base HEAD `be9b2bb8c` (ONGIL Foundation and Home V1)
- 상태: 구현 + 검증 완료, **미커밋** (git add / commit / push 하지 않음)
- 선행 문서: `PHASE_1_FOUNDATION_V1.md`, `PHASE_2A_HOME_V1.md`

## OBJECTIVE

"내 생활"을 안내 화면이 아니라 실제로 쓰는 개인 생활 허브로 만든다.
캘린더, 할 일, 루틴, 식사, 운동, 수면, 생활비, 기록을 이 기기 안에서 직접 적고 돌아본다.
Home V1에서 만든 일정·식사·운동 데이터는 같은 저장소를 그대로 쓴다(복사본 없음).
ONGIL dark / film 디자인은 유지하고, LIVON·shared root 파일은 건드리지 않는다.

## ARCHITECTURE

```
index.html ─ app.js (조립만 담당)
   ├─ router.js        #life, #life/<section>  (section 만 바뀌면 화면 전환 없이 탭만 교체)
   ├─ life-view.js     탭(요약/일정/생활/기록) + Overview. buildOverview() 는 DOM 없는 순수 함수
   │    ├─ life-plan.js     Calendar · Tasks · Routines
   │    ├─ life-daily.js    Meals · Exercise · Sleep
   │    └─ life-records.js  Expenses · Journal (PRIVATE)
   ├─ home-list.js / home-ui.js   Home 과 공용인 목록 카드·입력 필드 (일반화)
   └─ stores (DOM 없음, storage.js 위에서만 동작)
        schedule.js  daily-life.js            ← Phase 2A, 재사용
        tasks.js routines.js sleep.js expenses.js journal.js   ← 신규
        record-store.js   배열형 collection 공통 CRUD (손상·중복 항목 건너뜀)
        privacy.js        collection 분류 + sync/검색/공유 허용 판정
```

원칙
- UI 는 localStorage 를 직접 만지지 않는다. 모든 저장은 store → `storage.js` → `ongil.v1.<collection>`.
- DOM 은 `el()`(textContent) 로만 만든다. `innerHTML` / `insertAdjacentHTML` / `outerHTML` 0건.
- 날짜는 전부 **기기의 로컬 달력 날짜** `YYYY-MM-DD` (`dates.js`). UTC 변환으로 날짜가 밀리지 않는다.
- 자정이 지나면 `app.js` 가 Home 과 My Life 를 함께 새로 그린다.
- 화면 구성: 9개 section 을 4개 탭으로 묶었다 — 요약(overview) / 일정(calendar·tasks·routines) / 생활(meals·exercise·sleep) / 기록(expenses·journal). `#life/journal` 같은 deep link 는 해당 탭을 열고 그 카드 제목으로 초점을 옮긴다.

## FILES

신규 (12)
| 파일 | 역할 |
|---|---|
| `ongil-start/js/record-store.js` | 배열형 collection 공통 read/insert/patch/remove |
| `ongil-start/js/tasks.js` | Task store |
| `ongil-start/js/routines.js` | Routine + RoutineLog store |
| `ongil-start/js/sleep.js` | SleepRecord store (날짜당 1건) |
| `ongil-start/js/expenses.js` | ExpenseRecord store, `formatWon` |
| `ongil-start/js/journal.js` | JournalEntry store |
| `ongil-start/js/privacy.js` | 데이터 분류, `maySync` / `maySearchGlobally` / `familySharingAllowed` |
| `ongil-start/js/life-view.js` | My Life 화면, 탭, Overview |
| `ongil-start/js/life-plan.js` | Calendar / Tasks / Routines section |
| `ongil-start/js/life-daily.js` | Meals / Exercise / Sleep section |
| `ongil-start/js/life-records.js` | Expenses / Journal section |
| `ongil-start/styles/ongil-life.css` | 탭, 요약 타일, 달력 grid, 긴 글 줄바꿈 |

수정 (13)
| 파일 | 변경 |
|---|---|
| `ongil-start/index.html` | `ongil-life.css` 추가, pre-paint view 계산을 첫 path segment 로, `?v=20261002l1` |
| `js/app.js` | 신규 store 생성, life view 연결, section 라우팅, 지우기·날짜 변경 시 life 새로 그림 |
| `js/router.js` | `#view/section` 지원 (`sectionOf`, `sectionOnly`) |
| `js/areas.js` | life 모듈을 실제 사용 가능 상태로 표시 |
| `js/storage.js` | COLLECTIONS 10 → 16 |
| `js/account.js` | sync 대상 판정을 `privacy.maySync` 로 |
| `js/account-view.js` | "모두 지우기" 안내문에 새 데이터 종류 명시 |
| `js/dates.js` | 월·주 계산 helper 추가 |
| `js/life-contracts.js` | DailyLife 확장, Task/Routine/RoutineLog/Sleep/Expense/Journal normalize |
| `js/daily-life.js` | 끼니별 기록·운동 상세, 날짜 지정 update |
| `js/schedule.js` | `countsForMonth` |
| `js/home-ui.js` | `createCard` 일반화, `makeField` (date/amount/select/textarea/days) |
| `js/home-list.js` | 목록 카드 일반화 (체크 가능 여부, 추가/수정 가능 여부, 머리말, 변경 후 hook) |

테스트: 신규 `tests/ongil/life-data.test.mjs`, `life-view.test.mjs`, `life-privacy.test.mjs` / 수정 `foundation-data`, `home-data`, `shell` (TESTS 참고)

## DATA CONTRACTS

모든 normalize 는 `life-contracts.js` 에 있고, 형식이 맞지 않으면 `null` 을 돌려 저장하지 않는다.

| Contract | 필드 |
|---|---|
| CalendarEvent (2A, 재사용) | id, title, date, time, completed, createdAt, updatedAt |
| Task | schemaVersion, id, title(≤80), dueDate(`''` = 기한 없음), priority(`normal`/`important`), completed, createdAt, updatedAt |
| Routine | schemaVersion, id, title(≤40), daysOfWeek(0=일 … 6=토, 1개 이상), time(선택), active, createdAt, updatedAt |
| RoutineLog | `{ items: { 'YYYY-MM-DD': { routineId: { completed, updatedAt } } } }` |
| DailyLife (확장) | date, meals(0–3), **mealSlots**(null 또는 {breakfast,lunch,dinner}), water, exercise, **exerciseType**, **exerciseMinutes**(1–600), **exerciseMemo**, mood, updatedAt |
| SleepRecord | date(일어난 날, 날짜당 1건), bedTime, wakeTime, quality(`good`/`okay`/`poor`/`''`), memo, updatedAt — 네 값이 모두 비면 저장하지 않음 |
| ExpenseRecord | schemaVersion, id, date, category(food/living/transport/health/hobby/other), amount(1–100,000,000 정수 원), memo, createdAt, updatedAt |
| JournalEntry | schemaVersion, id, date, text(≤1000, 줄바꿈 유지), mood(good/okay/hard/`''`), createdAt, updatedAt |

DailyLife 하위 호환: Phase 2A 로 저장된 기록(mealSlots 없음)은 `mealSlots: null` 로 읽히고 끼니 수는 그대로 유지된다.
화면은 "홈에서 N끼로 적었어요"라고만 알리고 어느 끼니인지 임의로 채우지 않는다.

## STORAGE KEYS

| Key | 내용 | Phase |
|---|---|---|
| `ongil.v1.events` | CalendarEvent | 2A (재사용) |
| `ongil.v1.dailyLife` | DailyLife | 2A (확장) |
| `ongil.v1.tasks` | Task | 2B |
| `ongil.v1.routines` | Routine | 2B |
| `ongil.v1.routineLogs` | RoutineLog | 2B |
| `ongil.v1.sleepRecords` | SleepRecord | 2B |
| `ongil.v1.expenses` | ExpenseRecord | 2B |
| `ongil.v1.journal` | JournalEntry | 2B |

손상된 JSON, 형식이 틀린 항목, 중복 id 는 읽을 때 건너뛴다. 저장 공간이 차면 저장하지 않고 화면에 알린다.
"이 기기의 내 정보 모두 지우기"는 `ongil.v1.*` 16개만 지우고 다른 key(`newon-app-theme` 등)는 남긴다.

## PRIVACY CLASSIFICATION

`privacy.js` 가 단일 기준이다. 분류되지 않은 collection 이 생기면 테스트(OG-PV-1)가 실패한다.

| Class | Collection | 계정 sync | 전체 검색 | 가족 공유 |
|---|---|---|---|---|
| APP | profile, preferences, onboarding, saved | 가능(연결 시) | saved 만 | 없음 |
| APP | notifications | 제외(기기 전용) | 제외 | 없음 |
| STANDARD | events, tasks, routines, routineLogs, dailyLife, sleepRecords | **제외** | **제외** | 없음 |
| PRIVATE | expenses, journal | **제외** | **제외** | 없음 |
| HEALTH_ADJACENT | checkins, medications, medicationLogs | **제외** | **제외** | 없음 |

- `maySync(collection)`: APP class 중 `SYNCABLE_COLLECTIONS`(profile, preferences, saved, onboarding)만 true. `account.js` 는 이 함수를 통해서만 sync 대상을 정한다.
- `maySearchGlobally(collection)`: `saved` 만 true.
- `familySharingAllowed()`: 항상 false (Phase 2B 에 가족 공유 없음).
- Saved 는 외부 콘텐츠 전용이다. Task / Journal / Expense / Routine 은 Saved 가 될 수 없다(OG-LF-6).
- Overview 는 PRIVATE 데이터의 내용을 보여주지 않는다 — 생활비는 "이번 달 N건", 기록은 "오늘 남겼어요 / 아직" 뿐이다.
- 생활비·기록 카드에는 "이 기기에만 저장됩니다. 다른 사람에게 전달되지 않고, 검색에도 나오지 않습니다."를 표시한다.

## CALENDAR

- 월 달력(`role="grid"`), 이전 달 / 다음 달 / 오늘로 가기, 날짜를 고르면 그날 일정 목록.
- 일정이 있는 날은 점 + 화면낭독기용 "일정 N개" 텍스트로 표시(색만으로 구분하지 않음). 오늘은 `aria-current="date"`, 선택한 날은 `aria-pressed`.
- 키보드: ←→ 하루, ↑↓ 한 주, Home/End 주의 처음/끝, PageUp/PageDown 달 이동. roving tabindex.
- 일정 추가/고치기/끝냄 표시/지우기(확인 후). 새 일정의 기본 날짜는 선택한 날.
- 그날이 기한인 할 일은 "이 날까지 할 일: …" 한 줄로만 보여준다. 할 일은 일정으로 복사되지 않는다.
- Home 의 "오늘 일정"과 같은 `ongil.v1.events` 를 쓴다.

## TASKS

- 추가 / 고치기 / 끝냄 표시 / 지우기(확인 후). 제목(필수), 기한(선택), 중요 표시(선택).
- 필터: 전체 / 할 일 / 완료 (개수 표시, `aria-pressed`).
- 정렬: 남은 일 먼저 → 기한 빠른 순 → 기한 없는 것.
- 끝낸 일은 취소선 + "(끝냄)" 글자로 표시.

## ROUTINES

- 루틴은 사용자가 만든 것만 있다(기본 루틴 없음).
- "내 루틴": 만들기 / 고치기 / 지우기. 이름, 요일(1개 이상), 시간(선택).
- "오늘 루틴": 오늘 요일에 해당하는 루틴만 보이고, 했는지 표시만 한다. 표시는 날짜별 RoutineLog 로 저장.
- 루틴을 지우면 그 루틴의 log 도 함께 지운다.
- 연속 기록(streak), 달성률, 점수는 만들지 않았다.

## MEALS

- 아침 / 점심 / 저녁을 각각 표시. 끼니 수는 표시한 끼니에서 계산.
- Home 의 "식사 0–3끼"와 같은 DailyLife 기록. Home 에서 숫자만 바꾸면 끼니별 표시는 지우고(추측하지 않음) 숫자만 유지한다.
- 최근 7일을 적힌 그대로 보여준다. 평균, 목표, 열량, 식단 평가 없음.

## EXERCISE

- 했어요 / 아직이에요. 했을 때만 종류(걷기·체조·요가·수영·등산·기타), 시간(1–600분), 메모를 선택으로 적는다.
- "아직이에요"로 바꾸면 상세도 지운다. 상세를 적으면 "했어요"로 된다.
- Home 의 "움직임"과 같은 기록. 운동량 평가, 열량 추정, 권장량 없음.

## SLEEP

- 일어난 날 기준으로 날짜당 1건. 잠든 시간, 일어난 시간, 느낌(좋았어요/보통이에요/아쉬웠어요), 메모 — 모두 선택이지만 하나는 있어야 저장.
- 추가 / 고치기 / 지우기. 수면 시간 계산, 점수, 수면 상태 판단, 조언 없음.

## EXPENSES

- PRIVATE. 날짜, 금액(1원–1억 원, 정수), 분류(식비·생활·교통·건강·취미·기타), 메모.
- 월 이동 + 그 달 합계와 건수. 추가 / 고치기 / 지우기(확인 후).
- 금액 검증: 빈 값, 0, 음수, 소수, 범위 초과, 숫자가 아닌 값은 저장하지 않고 이유를 알린다. "12,000" 처럼 쉼표가 있어도 받는다.
- 예산, 지출 평가, 재무 조언, 은행 연동 없음.

## JOURNAL

- PRIVATE. 날짜, 글(1,000자까지, 줄바꿈 유지), 그날 느낌(선택).
- 최근 20건을 보여준다. 추가 / 고치기 / 지우기(확인 후).
- 글은 항상 텍스트로만 그린다(`<b>`, `<script>` 를 써도 글자로 보임). 감정 분석, AI 요약, cloud 저장 없음.

## HOME INTEGRATION

| 데이터 | Home | My Life | 저장소 |
|---|---|---|---|
| 일정 | 오늘 일정 | 캘린더 | `events` (동일) |
| 식사 | 0–3끼 | 아침/점심/저녁 | `dailyLife` (동일) |
| 운동 | 움직였어요 | 했어요 + 상세 | `dailyLife` (동일) |
| 물 | Home 에만 | — | `dailyLife` |

한쪽에서 만들고·고치고·끝내고·지운 것이 다른 쪽에 그대로 보인다(브라우저에서 양방향 확인).
Home 의 구성·문구·동작은 바꾸지 않았다. 할 일·루틴·수면·생활비·기록은 아직 Home 에 나오지 않는다(Phase 2C).

## ACCESSIBILITY

- 탭: `role="tablist"` / `tab` / `tabpanel`, `aria-selected`, ←→·Home·End 로 이동. 선택 표시는 밑줄 + 배경(색만 아님).
- 달력: grid + roving tabindex + 키보드 이동, 날짜 버튼의 이름에 요일·일정 수 포함.
- 모든 조작 요소 44px 이상 (1440 / 820 / 390 에서 측정, 미달 0건).
- 상태는 글자로도 표시: "(끝냄)", "(했어요)", 체크 표시.
- 저장·삭제·오류 결과는 카드 아래 `aria-live` 문장으로 알린다. 입력 오류는 해당 입력에 `aria-invalid` + 설명 연결.
- 지우기는 항상 확인 단계를 거친다.
- Deep link / "보기" 버튼으로 이동하면 해당 카드 제목으로 초점 이동. 탭을 키보드로 넘길 때는 초점을 빼앗지 않는다.
- 본문 최소 글자 0.95rem(15.2px, Phase 1 기준 그대로): 보조 설명(`.og-home-note`)과 입력 hint 에만 쓰인다.
- 확인하지 못한 것: 실제 화면낭독기(VoiceOver/TalkBack) 청취, 실제 기기 터치.

## RESPONSIVE

Headless Chromium 으로 1440 / 820 / 390 에서 빈 상태와 채운 상태를 모두 확인.

| 확인 | 결과 |
|---|---|
| 가로 넘침 (scrollWidth > innerWidth) | 3개 폭 모두 없음 |
| 44px 미만 조작 요소 | 없음 |
| 대화상자(지우기 확인) 잘림 | 없음 |
| 390 달력 7열 | 넘침 없음, 날짜 버튼 44px 이상 |
| 긴 할 일 제목(끊김 없는 영문 포함) | 줄바꿈됨 |
| 큰 금액 99,999,999원 / 합계 100,001,499원 | 줄바꿈·넘침 없음 |
| 긴 기록(1,000자, 끊김 없는 단어, 마크업 문자열) | 텍스트로 표시, 줄바꿈됨 |
| console / page error | 0 |

QA 환경에서는 외부 영상·웹폰트가 차단되어 film hero 는 검은 배경으로만 확인했다(영상 위 대비는 Mac 에서 눈으로 확인 필요).

## TESTS

`node --test tests/ongil/*.test.mjs` → **105 tests / 105 pass / 0 fail**

- 기존 82개: 모두 유지. 삭제·skip 없음.
- 신규 23개: `life-data`(11) 날짜·Task·Routine·Sleep·Expense·Journal·손상 복구 / `life-view`(6) 라우팅·Overview·Home 연동·하위 호환 / `life-privacy`(6) 분류·sync 제외·검색 제외·지우기·키보드·금지 표현.

기존 assertion 을 바꾼 3곳 (모두 실제 제품 동작 변경이며, 약화하지 않았고, 테스트 파일에 이유를 주석으로 남김)

| Test | 이전 | 이후 | 이유 |
|---|---|---|---|
| OG-ST-2 (`foundation-data`) | collection 10개 | 16개 정확히 일치 | 2B 에서 collection 6개 추가 |
| OG-DL-1 (`home-data`) | DailyLife key 6개 | key 10개 + 새 필드 기본값까지 확인 | DailyLife 에 끼니별·운동 상세 추가 |
| OG-VW-1 (`shell`) | home 만 available | home 과 life 만 available | 내 생활이 실제 기능이 됨 |

## LIMITATIONS

- **Server sync 없음**: 모든 생활 데이터는 이 기기·이 브라우저에만 있다. 브라우저 데이터를 지우면 사라진다.
- **Family sharing 없음**, **Cloud backup 없음**, **AI 없음**, **Bank integration 없음**, 알림(push) 없음.
- 내보내기/가져오기 없음 → 기기를 바꾸면 옮길 방법이 아직 없다.
- 물 기록은 Home 에만 있다.
- 지난 날짜의 식사·운동은 My Life 에서 볼 수만 있고 고칠 수 없다(store 는 날짜 지정을 지원).
- 루틴에 시작일·종료일이 없다. 반복 일정(매주 반복 CalendarEvent)은 없다.
- 기록은 최근 20건만 보인다(저장은 300건까지). 지난 기록 검색·날짜 이동 없음.
- 생활비는 월 합계만 있고 분류별 합계는 없다.
- Home 에 My Life 로 가는 "전체 보기" 연결이 아직 없다.
- `contracts.js` 의 `FUTURE_CONTRACTS` 목록은 Phase 1 그대로라 2B 에서 실제로 구현된 계약을 반영하지 않는다(동작에는 영향 없음).
- JS module 은 `app.js?v=` 만 버전이 붙는다. 배포 시 하위 module 캐시 정책은 별도로 정해야 한다.
- `~/Newon/.git/objects/maintenance.lock` (2026-09-30 생성, 0 byte) 이 남아 있다. 이번 작업에서 만든 것이 아니며 건드리지 않았다.

## PHASE 2C HANDOFF

Phase 2C = HOME + MY LIFE INTEGRATION / POLISH

1. Home 에 오늘 기한인 할 일, 오늘 루틴을 요약으로 보여주고 My Life 로 연결(`lifeHash(section)` 사용).
2. Home 각 카드에 "내 생활에서 보기" 연결, My Life Overview 에서 Home 안부·복약으로 돌아가는 연결.
3. 지난 날짜 식사·운동 고치기(달력에서 날짜 선택 → DailyLife), 물 기록을 My Life 에도.
4. 기록·생활비 내보내기(기기에 파일로 저장) — server 없이 backup 수단 제공.
5. `FUTURE_CONTRACTS` 정리, module 캐시 버전 전략.
6. 실제 기기(iPhone/Android/iPad) + 화면낭독기 점검, film hero 대비 확인.

유지할 경계: PRIVATE / HEALTH_ADJACENT 는 sync·검색·공유 제외(`privacy.js`), Saved 는 외부 콘텐츠 전용, 새 collection 은 반드시 `privacy.js` 에 분류.

Mac 에서 확인
```
cd ~/Newon-ongil
node --test tests/ongil/*.test.mjs        # 105 pass
python3 -m http.server 8765               # http://localhost:8765/ongil-start/#life
git status                                # ongil-start/ tests/ongil/ docs/ongil/ 만 변경
```
