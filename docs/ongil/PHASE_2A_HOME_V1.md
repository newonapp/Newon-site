# ONGIL PHASE 2A — HOME V1

- 작성일: 2026-10-02 (KST)
- Worktree: `~/Newon-ongil` · Branch: `ongil-foundation-v1` · Base: `07adb5275` (`origin/main`)
- 선행 문서: `MASTER_AUDIT_V1.md`, `PHASE_0_5_REPOSITORY_PLAN.md`, `PHASE_1_FOUNDATION_V1.md`
- 상태: 소스 작성·검증 완료, **commit 전**. Phase 1 변경도 아직 commit되지 않은 상태에서 그 위에 작업했다.

---

## OBJECTIVE

Home을 "준비 중 목록"에서 **오늘 하루를 한 화면에서 보는 실제 화면**으로 바꾼다.
존재하지 않는 backend(가족, 건강, 알림 발송, 추천)는 흉내 내지 않는다.

## IMPLEMENTED MODULES

| # | Module | 수준 | 하는 일 | 하지 않는 일 |
|---|---|---|---|---|
| 1 | Hero / 인사 | hero | 시간대별 인사(아침·낮·저녁), 별명이 있으면 함께 표시, 오늘 날짜 | 이름을 요구하지 않음 |
| 2 | 오늘의 안부 | 1 | "오늘은 어떠세요?" 4개 중 선택, 바꾸기, 지우기. 오늘 날짜 기준 | 누구에게도 전달하지 않음. 안전·건강을 확인해 주지 않음 |
| 3 | 오늘 일정 | 1 | 추가, 끝냄 표시, 고치기, 지우기(확인 후). 시간은 선택 | 전체 캘린더는 Phase 2B |
| 4 | 복약 | 2 | 약 이름·시간·메모 추가, 오늘 먹은 약 표시, 고치기, 지우기(확인 후) | 복용량·상호작용·조언 없음 |
| 5 | 오늘의 생활 | 2 | 식사 0~3끼, 물 잔 수(0~20), 걷기·운동 했어요/아직이에요 | 점수·평가·목표 없음 |
| 6 | 가족 | 3 | 실제 상태("아직 연결된 가족이 없어요") + 가족 화면 이동 | 가짜 가족·메시지·알림 없음 |
| 7 | 오늘 뭐 하지? | 3 | 취미·배움·운동·문화·나들이 → 즐길거리 화면 | 가짜 프로그램·행사 없음 |
| 8 | 내 주변 | 4 | 사는 지역의 평생학습 강좌를 **버튼을 눌렀을 때만** 조회. 결과가 있으면 저장 가능 | 연결되지 않으면 그 사실만 표시. 가짜 장소 없음 |
| 9 | 빠른 실행 | 4 | 일정 추가, 약 추가(바로 실행) / 내 생활, 즐길거리, 가족, 돌봄·서비스(이동) | AI 버튼 없음 |

"도움이 필요해요"를 고르면 다음 안내만 나온다. 전화·문자·가족 알림은 실행되지 않는다.

> ONGIL은 이 선택을 다른 사람에게 알리지 않습니다. 도움이 필요하면 가까운 사람에게 직접 연락해 주세요. 위급할 때는 119에 직접 전화해 주세요.

정보 위계: 4개 수준을 surface와 글자 크기로 구분했다(1 = 가장 어두운 큰 카드와 큰 제목, 4 = 가는 외곽선). 데스크톱은 수준마다 2열, 860px 이하는 1열로 위에서부터 중요한 순서.

hero의 "시작하기": 처음 방문이면 처음 설정을 열고, 그 외에는 아래 "오늘" 영역으로 내려간다(이전에는 내 생활로 이동).

## FILES

Created (16)

```
ongil-start/js/
  dates.js            지역 시간 기준 날짜 key, 시간 형식, 인사말
  life-contracts.js   CheckIn · CalendarEvent · Medication · MedicationLog · DailyLife
  checkin.js          오늘의 안부 저장소
  schedule.js         일정 저장소
  medication.js       복약 저장소 + 날짜별 복용 표시
  daily-life.js       오늘의 생활 저장소
  data-source.js      외부 자료 source (ONGIL에서 network를 쓰는 유일한 module)
  home-view.js        Home 조립, 인사말, 날짜 변경 처리
  home-today.js       안부 · 일정 · 복약 · 생활 카드
  home-explore.js     가족 · 오늘 뭐 하지? · 내 주변 · 빠른 실행 카드
  home-list.js        편집 가능한 목록(추가·고치기·지우기 확인) — 일정과 복약이 공유
  home-ui.js          카드, 선택 버튼, 입력 필드
ongil-start/styles/ongil-home.css
tests/ongil/home-data.test.mjs   (16)
tests/ongil/home-view.test.mjs   (11)
docs/ongil/PHASE_2A_HOME_V1.md
```

Modified (Phase 1 파일)

| 파일 | 변경 |
|---|---|
| `ongil-start/index.html` | `ongil-home.css` link, hero 문장에 인사말 hook(`data-og-greeting`), `/livon/livon-api-config.js` load |
| `ongil-start/js/app.js` | Home 저장소·view 연결, 내 주변 source 주입, "시작하기" 동작, 날짜 변경 확인 |
| `ongil-start/js/areas.js` | Home module 9개 `available: true`, 이름·설명 갱신 |
| `ongil-start/js/storage.js` | collection 5개 추가 |
| `ongil-start/js/film.js` | `poster` 속성이 있으면 그림이 있는 것으로 취급 |
| `tests/ongil/*.test.mjs` 3개 | 아래 "TESTS" 참고 (assertion 5개 갱신) |

수정하지 않은 것: `livon/`, `server/`, `api/`, `tests/livon/`, 사이트 공용 파일, `package.json`, `vercel.json`, `~/Newon`.
`/livon/livon-api-config.js`는 **읽기만** 한다(script로 load). LIVON 파일을 고치거나 import하지 않았다.

## DATA CONTRACTS

`life-contracts.js`. Phase 2B(My Life)와 Phase 3(건강·안부)이 같은 형식을 쓴다.

| Contract | 필드 |
|---|---|
| CheckIn | `id`(`checkin:<date>`), `date`, `status`(good / okay / hard / help), `createdAt`, `updatedAt` |
| CalendarEvent | `id`, `title`(≤80), `date`, `time`(`HH:MM` 또는 빈 값), `completed`, `createdAt`, `updatedAt` |
| Medication | `id`, `name`(≤40), `time`(선택), `memo`(≤100), `createdAt`, `updatedAt` |
| MedicationLog | `medicationId`, `date`, `taken`, `updatedAt` |
| DailyLife | `date`, `meals`(0~3), `water`(0~20), `exercise`(boolean), `updatedAt` |

알 수 없는 필드는 버린다(복용량 등을 넣어도 저장되지 않음). 날짜는 **기기의 지역 날짜** `YYYY-MM-DD`이며 UTC를 쓰지 않는다.

## STORAGE KEYS

| Key | 내용 | 보존 |
|---|---|---|
| `ongil.v1.checkins` | `{ items: { <date>: CheckIn } }` | 최근 366일 |
| `ongil.v1.events` | `{ items: CalendarEvent[] }` | 최대 1,000개 |
| `ongil.v1.medications` | `{ items: Medication[] }` | 최대 50개 |
| `ongil.v1.medicationLogs` | `{ items: { <date>: { <medicationId>: { taken, updatedAt } } } }` | 최근 120일 |
| `ongil.v1.dailyLife` | `{ items: { <date>: DailyLife } }` | 최근 366일 |

- 화면 코드는 저장소만 부른다. `localStorage`는 여전히 `storage.js`에서만 쓴다.
- 날짜 처리: 조회는 항상 "지금의 오늘" 기준. 자정이 지나면 안부·복약 표시·생활 기록은 새 날로 비어서 시작하고, 전날 기록은 남는다. 페이지를 켜 둔 채 날이 바뀌면 1분 주기 확인과 화면 복귀 시점에 Home을 다시 그린다.
- 약을 지우면 그 약의 복용 표시도 함께 지운다.
- **계정 동기화 대상에서 제외**: 5개 collection 모두 `SYNCABLE_COLLECTIONS`에 넣지 않았다. 안부·복약은 민감할 수 있어 동의 설계(Phase 3) 전에는 어떤 adapter가 연결돼도 전달되지 않는다. 경계(`account.js`)는 그대로이므로 설계가 끝나면 목록에 추가하면 된다.

## INTERACTIONS

| 상태 | 처리 |
|---|---|
| EMPTY | 일정·복약: 빈 문구 + 추가 버튼. 안부: 4개 선택지. 가족: 연결 없음 문구 |
| FILLED | 목록, 선택 표시(✓ + pressed), 끝낸 항목은 취소선과 "(끝냄)" / "(먹었어요)" 글자 |
| SUCCESS | 카드마다 `role="status"` 문장("일정을 추가했습니다" 등) |
| ERROR | 입력 오류는 `role="alert"` + `aria-invalid` + 해당 칸으로 focus |
| 삭제 | 항상 확인 단계("…을(를) 지울까요? 되돌릴 수 없습니다."), 취소가 먼저, 취소하면 원래 버튼으로 focus 복귀 |
| LOADING / UNAVAILABLE | 내 주변만 해당. 연결되지 않은 경우는 오류가 아니라 일반 상태 문장으로 표시 |

## ACCESSIBILITY

Phase 1 기준 유지 + 추가분
- 카드마다 `section` + 제목(`h3`) 연결, 선택 묶음마다 이름 있는 `role="group"`
- 모든 입력에 label, 선택 사항은 "(선택)" 표기
- 선택 상태는 ✓ 표시와 `aria-pressed`, 완료 상태는 글자로도 표시 — 색만으로 구분하지 않음
- 물 조절 버튼에 "물 한 잔 빼기 / 더하기" 이름
- 조작 후 focus가 사라지지 않음(추가 폼 → 첫 칸, 저장 후 → 추가 버튼, 삭제 후 → 카드 제목)
- 조작 요소 44px 이상, 본문 16px 이상 — 세 화면 크기에서 측정해 미달 0건(장식용 영문 label 14.4px 제외)
- 빠른 실행의 이동은 '동작 줄이기' 설정이면 즉시 이동

NOT VERIFIED: 실제 screen reader, 영상 위 글자 대비.

## RESPONSIVE

headless Chromium, 1440×900 / 820×1100 / 390×800. 각 크기에서 빈 상태와 채운 상태 모두 확인.
- 가로 넘침 0건, 44px 미만 조작 요소 0건, console·page 오류 0건
- 안부 저장·변경, 일정 검증 오류·추가·끝냄·고치기·삭제 확인·취소, 빠른 실행으로 약 추가, 생활 기록, 내 주변 3개 상태, 저장 연결, 새로고침 후 유지, 기존 route 12개(이전 주소 포함) 동작 확인
- 390px에서 hero의 영상 버튼이 제목과 겹쳐 아래 모서리로 옮겼다(860px 이하). 삭제 확인 상자는 화면 안에 들어온다.
- 외부 영상·글꼴은 검증 환경에서 받을 수 없었다. 영상이 실제로 재생되는 모습은 확인하지 못했다.

## PUBLIC DATA STATUS

읽은 것: `server/livon/data/http.mjs`, `providers/lifelong-class.mjs`, `providers/tourapi.mjs`, `providers/kakao-local.mjs`(route 정의), `manifest.mjs`, `cache.mjs`, `livon/livon-api-config.js`, `scripts/livon-api-config.mjs`. base와 `livon-accessibility-v1`의 차이는 API 주소 설정 2개 파일뿐이고 provider 코드는 같다.

| Provider | 판단 | 이유 |
|---|---|---|
| `kr-lifelong-class` (평생학습 강좌) | **DIRECT REUSE (endpoint)** | 17개 시·도 이름이 ONGIL 지역 목록과 같고, 지역만으로 조회되며, key는 서버에만 있다 |
| `kr-tourapi` (관광) | 보류 | 지역 code가 7개 시·도만 정의되어 있고 code 재확인 필요 표기가 있다. 서버 저장 금지 조건도 있다 |
| `kr-kakao-place` (장소) | 보류 | 검색어 또는 위치 좌표가 필요하다. ONGIL은 아직 위치 권한을 요청하지 않는다 |
| 청년·기업·세무·직업훈련 | 대상 아님 | 시니어 대상이 아님 |

연결 방식: ONGIL → `GET <api>/api/livon/data` (이미 있는 route). 서버 코드는 한 줄도 바꾸지 않았다.
1. `?action=status`로 provider가 설정되어 있는지 먼저 확인(응답은 true/false만)
2. 설정되어 있을 때만 `?provider=kr-lifelong-class&region=<시·도>&status=open&limit=6`
3. 그 외 모든 경우(route 없음, key 없음, 시간 초과 8초, 형식 오류)는 `unavailable` — 화면에는 "주변 정보는 아직 연결되지 않았어요"

**PROVIDER STATUS = 운영에서 동작하는지 NOT VERIFIED.** manifest에 8개 provider 모두 `liveVerified: false`로 적혀 있고 이번에도 실제 호출은 하지 않았다. `ready` 화면은 검증용 가짜 응답으로만 확인했다(repository에는 넣지 않음). 운영 key가 없으면 사용자는 항상 "연결되지 않았어요"를 본다.

보내는 정보는 시·도 이름 하나이며 cookie·인증 정보는 보내지 않는다(`credentials: 'omit'`). 자동 호출은 없다.

## SEARCH / SAVED

- 검색: provider를 추가하지 않았다. 일정·약·안부는 검색되지 않는다(테스트 `OG-HM-11`). Home의 module 이름("오늘 일정" 등)은 기존 메뉴 provider로 찾아진다.
- 저장: 내 주변에서 실제 강좌가 조회된 경우에만 "저장" 버튼이 나온다(`PROGRAM` 유형). 그 외에는 저장 버튼을 붙이지 않았다.

## TESTS

```
node --test tests/ongil/*.test.mjs
```

5개 파일, **82 tests, 82 pass** (기존 55 + 신규 27). dependency 불필요.

신규: 날짜 key와 인사말, 안부 저장·변경·날짜 범위·"help"가 아무것도 보내지 않음, 일정 생성·끝냄·수정·삭제·검증·오늘만 보기, 복약 생성·수정·삭제·날짜별 표시·삭제 시 표시 정리, 생활 기록 저장·범위 거부·날짜 범위, 손상된 값 처리와 동기화 제외, 내 주변 source의 unavailable / ready / empty, Home module 존재와 위계, 가족 빈 상태, 즐길거리 연결, 빠른 실행 경로, 접근성 이름, 거짓 안전 문구·점수·조언 금지, 가짜 가족·프로그램 금지, 개인 데이터 검색 제외.

**기존 55개 중 5개는 assertion을 고쳤다.** Phase 1의 사실이 Phase 2A에서 의도적으로 바뀐 부분이며, 각 테스트에 이유를 주석으로 남겼다.

| 테스트 | 이전 | 이후 |
|---|---|---|
| `OG-ST-2` | collection은 5개 | 10개. 가족·건강 기록 collection은 여전히 없음을 추가 확인 |
| `OG-SE-2` | "복약" 검색 결과는 전부 "준비 중" | Home의 복약은 준비 중이 아님, 나머지는 준비 중 |
| `OG-VW-1` | 모든 module이 unavailable | Home만 available |
| `OG-SEC-2` | network 호출 0건 | `app.js`가 fetch를 1번 주입하고 `data-source.js`만 사용 |
| `OG-SEC-3` | `livon` 문자열 0건 | `data-source.js`의 route 경로와 `app.js`의 `LivonApi` 두 곳만 허용. import는 여전히 0건 |

`tests/livon`은 실행하지 않았다(`node_modules` 없음). LIVON 파일은 수정하지 않았다.

## LIMITATIONS

| 항목 | 상태 |
|---|---|
| Family backend | 없음. 연결·공유·알림 없음. Home은 "연결 없음"만 표시 |
| Health backend | 없음. 안부·복약·생활은 이 기기에만 저장 |
| Public data | 평생학습 강좌 1종만 연결. 운영 key 유효성 미확인 |
| AI | 없음. 버튼도 없음 |
| Poster / video | poster 이미지 없음. `<video>`에 `poster="…"`를 넣으면 바로 쓰이도록만 준비. 영상 재생 모습 미확인 |
| 알림 | 일정·복약 시간이 되어도 알림은 오지 않는다(발송 기능 없음) |
| 반복 일정 | 없음. 일정은 하루짜리 |
| 복약 | 약 하나에 시간 하나. 하루 여러 번 먹는 약은 따로 추가해야 한다 |
| 지난 날짜 | 저장은 되지만 볼 화면이 없다(Phase 2B) |
| 안부 "도움" | 안내 문구만. 실제 도움 요청은 Phase 3·4 |
| 기존 contract 목록 | `contracts.js`의 `FUTURE_CONTRACTS`에 CheckIn 등이 아직 "예약"으로 남아 있다(구현은 `life-contracts.js`). Phase 2B에서 정리 |
| commit | Phase 1과 2A가 모두 미commit 상태다. 한 번에 또는 두 번에 나눠 commit할 수 있다 |

## PHASE 2B HANDOFF — MY LIFE V1

그대로 쓸 수 있는 것
- `schedule.js` — `listForDate(date)`가 이미 임의 날짜를 받는다. 캘린더는 같은 `events` collection을 읽으면 Home과 자동으로 맞는다.
- `daily-life.js` / `medication.js` — `get(date)`, `listForDate(date)`, `isTaken(id, date)`로 지난 날짜 조회 가능.
- `home-list.js` — 추가·고치기·지우기 확인 목록. 할 일·루틴에 재사용 가능(카드만 넘기면 된다).
- `home-ui.js`의 `createCard`, `choiceButton`, `textField`, `views.js`의 `setRegionState`.
- `dates.js` — 날짜 key, 시간 표기.

Phase 2B에서 정할 것
1. 할 일(Task)을 일정과 같은 collection에 둘지 따로 둘지.
2. 식사·운동을 횟수(`DailyLife`)에서 기록 단위(`MealRecord`, `ExerciseRecord`)로 넓힐 때, 기존 횟수를 어떻게 옮길지.
3. 수면·생활비·기록(일기)의 collection 이름과 민감도 분류 — 일기와 생활비는 LIVON에서도 민감 정보로 분류한다.
4. 내 생활 화면이 생기면 Home의 "내 생활 보기"와 각 카드에 "전체 보기" 링크를 추가.

Mac에서 할 일

```bash
cd ~/Newon-ongil
node --test tests/ongil/*.test.mjs
python3 -m http.server 8765      # http://localhost:8765/ongil-start/
git add ongil-start tests/ongil docs/ongil
git commit -m "ONGIL Foundation V1 + Home V1"
git push -u origin ongil-foundation-v1
```
