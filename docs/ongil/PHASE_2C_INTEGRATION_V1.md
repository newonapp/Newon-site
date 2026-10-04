# ONGIL PHASE 2C — HOME + MY LIFE INTEGRATION V1

- 작성일: 2026-10-02
- Worktree: `~/Newon-ongil` · branch `ongil-foundation-v1` · base HEAD `0300c31a1` (ONGIL My Life V1)
- 상태: 구현 + 검증 완료, **미커밋** (git add / commit / push 하지 않음)
- 선행 문서: `PHASE_1_FOUNDATION_V1.md`, `PHASE_2A_HOME_V1.md`, `PHASE_2B_MY_LIFE_V1.md`

## OBJECTIVE

새 기능을 늘리는 단계가 아니라, Home 과 My Life 를 **하나의 생활 기록**으로 묶는 단계다.
Home 에 할 일·루틴을 연결하고, 물 기록을 My Life 에서도 다루고, 지난 날짜의 식사·운동을 고칠 수 있게 하고,
두 화면이 항상 같은 값을 보이도록 했다. 새 저장소는 만들지 않았다(collection 16개 그대로).
ONGIL dark / film 디자인은 그대로이며 LIVON·shared root 파일은 건드리지 않았다.

## HOME CHANGES

순서 (위에서 아래로, 시각적 무게는 내려갈수록 가벼워진다)

| 묶음 | level | 카드 |
|---|---|---|
| (요약) | — | 오늘 남은 것 — 있을 때만 |
| today | 1 | 오늘의 안부 · 오늘 일정 |
| plan | 2 | **오늘 할 일 · 오늘 루틴** (신규) |
| care | 2 | 복약 · 오늘의 생활 |
| connection | 3 | 가족 · 오늘 뭐 하지? |
| discovery | 4 | 내 주변 · 빠른 실행 |

- **오늘 할 일**: My Life 의 `tasks` 중 기한이 오늘인 것. Home 에서는 보기와 끝냄 표시만 한다.
  기한이 오늘이 아닌 남은 할 일은 "이 밖에 남은 할 일 N개" 한 줄로만 알린다. `할 일 추가`는 My Life 의 할 일 입력 양식을 연다(Home 에 별도 양식 없음). `할 일 모두 보기` → `#life/tasks`.
- **오늘 루틴**: `routines` 중 active 이고 오늘 요일인 것 + 오늘의 `routineLogs`. 보기와 표시만. `루틴 보기·고치기` → `#life/routines`.
- **오늘 남은 것(요약)**: 일정 / 오늘 할 일 / 루틴 / 약 — 적어 둔 것이 있는 종류만 "N개 남음" 또는 "모두 끝냈어요". 아무것도 없으면 요약 자체를 숨긴다. 점수·평가·건강 상태 문구 없음. 카드에서 표시를 바꾸면 즉시 갱신.
- **연결**: 오늘 일정 → `캘린더에서 다른 날 보기`, 오늘의 생활 → `끼니·운동 자세히, 지난 날 고치기`.
- **빠른 실행** (6개 유지): 일정 추가 · **할 일 추가**(신규) · 약 추가 · 내 생활 보기 · 즐길거리 찾기 · 돌봄·서비스 찾기. `가족 보기`는 뺐다(바로 위 가족 카드에 같은 연결이 있음). 죽은 버튼 없음.
- 다른 화면에 다녀오면 카드의 상태 문장(마지막 동작 안내)을 비운다 — 다른 화면에서 값이 바뀌었을 때 틀린 문장이 남지 않게.

## MY LIFE CHANGES

- **생활 탭 = 식사 · 물 · 운동 · 수면**, 하나의 **날짜 막대**(이전 날 · 날짜 · 다음 날 · 오늘)가 네 카드를 함께 움직인다.
- **물**(신규 section `water`): `dailyLife.water` 를 그대로 읽고 쓴다. 0–20잔. 마실 양 기준·평가 없음.
- **지난 날짜 식사**: 아침/점심/저녁을 고른 날짜에 대해 수정. Phase 2A 식 기록(끼니 수만 있음)은 그대로 읽히고, 끼니를 고르면 고른 내용으로 바뀐다.
- **지난 날짜 운동**: 여부·종류·시간·메모를 고른 날짜에 대해 수정. 지난 날의 "아니오"는 `안 했어요`, 오늘은 `아직이에요`.
- **수면**: 고른 날짜(일어난 날)의 기록 1건을 적고·고치고·지운다. 날짜 입력칸은 없앴다(날짜 막대가 정함).
- **최근 7일**: 날짜별로 적힌 내용(식사·물·운동·수면)을 한 줄로 보여주고, 날짜를 누르면 그날이 열린다. 평균·목표 없음.
- **요약 탭**: 물 타일 추가(10개).
- **주소**: `#life/water` 추가, 탭 이름 주소 `#life/plan` `#life/daily` `#life/records` 지원. 없는 section 은 요약을 보여주고 주소를 `#life` 로 고친다.
- 다른 화면에서 들어오면 날짜는 오늘로 돌아가고, My Life 안에서 탭을 오갈 때는 고른 날짜를 유지한다.

## SYNC MATRIX

브라우저(Chromium headless)에서 1440 / 820 / 390 각각 실제 클릭으로 확인. 세 폭의 결과가 동일했다.

| 대상 | 동작 | 결과 |
|---|---|---|
| EVENT | Home 에서 만들기 → My Life 캘린더에 보임 | PASS |
| EVENT | My Life 에서 고치기 → Home 제목 바뀜 | PASS |
| EVENT | Home 에서 끝냄 → My Life 에서 끝냄 표시 | PASS |
| EVENT | My Life 에서 지우기 → Home 에서 사라짐 | PASS |
| TASK | My Life 에서 오늘 기한으로 만들기 → Home 에 보임 | PASS |
| TASK | Home 에서 끝냄 → My Life 완료 | PASS |
| TASK | My Life 에서 고치기 → Home 제목 바뀜 | PASS |
| TASK | My Life 에서 지우기 → Home 에서 사라짐 | PASS |
| ROUTINE | My Life 에서 만들기 → Home 에 보임 | PASS |
| ROUTINE | Home 에서 표시(키보드 Space) → My Life 표시됨 | PASS |
| ROUTINE | My Life 에서 표시 풀기 → Home 풀림 | PASS |
| MEALS | Home 2끼 → My Life 오늘 2끼 / My Life 끼니 선택 → Home 1끼 | PASS |
| WATER | Home 2잔 → My Life 2잔 / My Life +1 → Home 3잔 | PASS |
| EXERCISE | Home 했어요 → My Life 했어요 / My Life 아직 → Home 아직 | PASS |
| 새로고침 | 저장 값 전체가 새로고침 전후 동일, Home 표시 동일 | PASS |
| 지난 날 수정 | 어제 식사·물·운동·수면 수정 뒤 오늘 값과 Home 은 그대로 | PASS |

Cross-view refresh: Home 에 들어올 때 모든 카드와 요약을 저장소에서 다시 읽고, My Life 는 들어올 때와 탭을 바꿀 때 보이는 탭을 다시 읽는다. store 는 값을 따로 들고 있지 않다(테스트 OG-IV-3).

## DATE MODEL

- 날짜만 있는 값은 전부 **기기 로컬 날짜** `YYYY-MM-DD`. 모든 계산은 `ongil-start/js/dates.js` 한 곳에 있다(다른 파일에 날짜 키 계산이 없어 리팩터링하지 않았다. `dom.js` 의 저장 시각 표시와 Home 인사말의 시각 읽기만 예외이며 둘 다 로컬 시간이다).
- 하루 더하기/빼기는 로컬 정오 기준이라 서머타임 전환일에도 날짜가 겹치거나 건너뛰지 않는다. UTC 변환을 거치지 않는다.
- 생활 기록(식사·물·운동·수면)은 **있었던 일의 기록**이므로 미래 날짜를 고를 수 없다(`다음 날`은 오늘에서 비활성). 과거는 보관 범위인 365일 전까지.
- 일정과 할 일 기한은 미래 날짜가 당연히 가능하다(캘린더, 변경 없음).
- 날짜 막대는 "오늘"을 따라간다: 자정이 지나면 새 날로 넘어가고, 고른 지난 날은 그대로 유지된다.
- 테스트한 시간대: Asia/Seoul, America/Los_Angeles, Pacific/Kiritimati(+14), Pacific/Pago_Pago(−11), Europe/London, UTC.

## DATA MODEL

- collection **16개 그대로**. 새 저장 key 없음, 계약(schema) 변경 없음.
- Home 의 할 일·루틴은 `ongil.v1.tasks`, `ongil.v1.routines`, `ongil.v1.routineLogs` 를 My Life 와 같은 store 객체로 읽는다(`app.js` 에서 한 번만 생성).
- 물은 `ongil.v1.dailyLife` 의 `water`. 별도 WaterRecord 없음.
- 지난 날짜 수정은 기존 `dailyLife.update(patch, date)`, `sleep.save({ date, … })` 를 그대로 쓴다.
- 추가된 순수 함수(DOM 없음, 테스트 대상): `buildHomeSummary`, `resolveSection`, `dayState`, `clampDay`, `dayWord`, `describeDay`.

## TYPOGRAPHY

읽어야 하는 글은 16px(1rem) 미만이 없도록 올렸다. 색·굵기·서체는 그대로다.

| 대상 | 이전 | 이후 |
|---|---|---|
| 카드 보조 설명 `.og-home-note` | 0.95rem | 1rem |
| 입력 도움말 `.og-field__hint` | 0.95rem | 1rem |
| 저장 항목 종류 `.og-item__type` | 0.95rem | 1rem |
| 처음 설정 진행 표시 `.og-dialog__progress` | 0.95rem | 1rem |
| 준비 중 표시 `.og-chip__status` | 0.95rem | 1rem |
| 검색·알림 패널 안내 `.og-panel__note` | 0.95rem | 1rem |
| 검색 결과 설명 `.og-panel__result-desc` | 0.9rem | 1rem |

1rem 미만으로 남긴 것(문장이 아닌 것만, 테스트 OG-IV-10 에 목록으로 고정): 제목 위 영문 라벨(`MY LIFE`), 헤더 메뉴(공용 헤더 크기), 선택 표시 ✓ 글리프, 패널 제목·그룹 제목.
ONGIL 화면 CSS 에 얇은 글씨(font-weight 300 이하)는 없다.

## ACCESSIBILITY

- **터치**: Home·My Life 의 모든 조작 요소 44px 이상. 세 폭에서 실제 측정 미달 0건, CSS 규칙도 테스트로 고정(OG-IV-9). 체크박스는 같은 줄 label 전체가 터치 영역이다.
- **키보드**: Tab / Shift+Tab 순서대로 이동, Enter·Space 로 버튼·체크박스 동작(루틴 표시를 Space 로 확인), 날짜 막대 Enter 확인, 탭은 ←→·Home·End, 달력은 방향키·PageUp/Down.
- **대화상자**: 처음 설정은 native `<dialog>` modal — Tab 을 25회 누른 뒤에도 초점이 dialog 안에 있음, Escape 로 닫힘, 닫은 뒤 연 버튼으로 초점 복귀(브라우저 확인). 검색·알림 패널은 Escape 로 닫히고 버튼으로 복귀.
- **초점 유지**: 표시를 바꾼 뒤 같은 체크박스에 초점이 남는다. `다음 날`이 비활성으로 바뀌면 초점은 날짜 글자로 옮긴다(사라지지 않음).
- **상태를 글로도**: 끝낸 할 일 "(끝냄)", 한 루틴 "(했어요)", 안부·끼니·운동은 `aria-pressed` + ✓, 탭은 `aria-selected` + 밑줄, 최근 7일에서 고른 날은 `aria-pressed` + ✓. 색만으로 구분하는 상태 없음.
- **알림**: 각 카드의 `role="status"` 문장, 날짜 막대의 날짜는 `aria-live="polite"`.
- **이름**: 모든 카드는 제목으로 이름 붙은 region, 그룹에는 `aria-label`(오늘 남은 것, 기록할 날짜, 오늘 마신 물 등), 삭제는 항상 확인 단계.
- **화면낭독기 정적 검토**: landmark, heading, label, aria-live, dialog 이름, 버튼 이름, 선택/펼침 상태를 소스에서 확인(OG-IV-11).
- **실제 화면낭독기(VoiceOver / TalkBack) 청취: NOT VERIFIED.** 실제 기기 터치: NOT VERIFIED.

## RESPONSIVE

Headless Chromium, 1440 / 820 / 390. Home: EMPTY / PARTIAL(일정만) / FILLED. My Life: 요약 · 캘린더 · 할 일 · 루틴 · 생활(오늘/지난 날) · 수면 · 생활비 · 기록.

| 확인 | 1440 | 820 | 390 |
|---|---|---|---|
| 가로 넘침 | 0 | 0 | 0 |
| 44px 미만 조작 요소 | 0 | 0 | 0 |
| 16px 미만 글(라벨·글리프 제외) | 0 | 0 | 0 |
| console error / page error | 0 | 0 | 0 |
| 삭제 확인 영역 잘림 | 없음 | 없음 | 없음 |

- 390 에서 날짜 막대는 날짜 한 줄 + 버튼 세 개 한 줄.
- 긴 할 일 제목(끊김 없는 42자 영문 포함), 긴 루틴 이름, 99,999,999원, 1,000자 기록 모두 줄바꿈된다.
- **이번에 찾아 고친 문제**: 끊김 없는 긴 할 일 제목이 캘린더의 "이 날까지 할 일" 줄에서 줄바꿈되지 않아 390 에서 달력이 카드 밖으로 밀렸다. 카드 본문 자식에 `min-width: 0`, 보조 설명에 `overflow-wrap: anywhere` 를 넣어 해결.
- QA 환경은 외부 영상·웹폰트가 차단되어 film hero 는 검은 배경으로만 확인했다(영상 위 대비는 Mac 에서 확인 필요).

## PRIVACY

분류 변경 없음(`privacy.js`).

| Class | Collection | sync | 전체 검색 | 가족 공유 |
|---|---|---|---|---|
| PRIVATE | expenses, journal | 제외 | 제외 | 없음 |
| HEALTH_ADJACENT | checkins, medications, medicationLogs | 제외 | 제외 | 없음 |
| STANDARD | events, tasks, routines, routineLogs, dailyLife, sleepRecords | 제외 | 제외 | 없음 |

- sync 가능한 것은 여전히 profile, preferences, saved, onboarding 뿐.
- Home 이 할 일·루틴을 보여주게 되었지만 검색 provider 는 2개(메뉴, 저장한 것) 그대로다. 할 일·루틴 제목으로 검색해도 결과 0건(브라우저 확인).
- Home 요약은 개수만 담고, 사용자가 적은 글은 담지 않는다. My Life 요약도 생활비·기록은 건수/여부만.
- 화면 코드는 네트워크로 아무것도 보내지 않는다. 내 주변만 버튼을 눌렀을 때 지역 이름을 보낸다(2A 그대로).

## TESTS

`node --test tests/ongil/*.test.mjs` → **131 tests / 131 pass / 0 fail / 0 skip**

- 기존 105개: 전부 유지. 삭제·skip 없음.
- 신규 26개
  - `integration-data.test.mjs` (14): Home 할 일 표시·완료·양방향, Home 루틴 표시·완료·양방향, 물 읽기·수정·양방향, 지난 날 식사/운동 수정과 오늘 불변, 최근 7일, Home 요약, 자정(6개 시간대), 월말·연말·윤일·서머타임(800일 연속), 날짜 막대 규칙, 손상된 저장소(16 collection × 13가지 손상), 전체 지우기와 다른 데이터 보존.
  - `integration-view.test.mjs` (12): Home 카드가 My Life store 를 쓰는지, 할 일 추가 연결, cross-view refresh, listener 누적 없음, deep link 유효/fallback, 검색 제외, sync 제외, 터치 영역, 본문 글자 크기, 화면낭독기 정적 검토, 거짓 건강·안전 문구 없음.

기존 assertion 을 바꾼 곳 — 모두 의도한 제품 동작 변경이고, 약화하지 않았으며, 테스트 파일에 이유를 주석으로 남겼다.

| Test | 이전 | 이후 | 이유 |
|---|---|---|---|
| OG-HM-1 (`home-view`) | Home 모듈 9개 | 11개(목록 정확히 일치) | 오늘 할 일·오늘 루틴 추가 |
| OG-HM-2 (`home-view`) | 4줄 | 5줄 + 묶음 이름 + "아래로 갈수록 무게가 커지지 않는다" 추가 확인 | plan 줄 추가 |
| OG-HM-7 (`home-view`) | action 2 + route 4 | action 3 + route 3, 각 action 이 연결됐는지 추가 확인 | 할 일 추가 신설, 가족 보기 제외 |
| OG-LF-1 (`life-view`) | section 9개 | 10개 | 물 추가 |
| OG-LF-7 (`life-privacy`) | 그룹 이름 "오늘 먹은 끼니", "오늘 걷기·운동" 고정 | 날짜가 들어가는 이름 + 물·날짜 막대 이름까지 확인 | 지난 날짜 수정 |
| OG-VW-1 (`shell`) | Home 9 / My Life 8 모듈 | Home 11 / My Life 9 | 위와 같음 |

## REGRESSIONS

브라우저에서 세 폭 모두 확인. Phase 2A·2B 검증 스크립트도 다시 돌렸다(오류 0).

| 대상 | 결과 |
|---|---|
| Search | 메뉴 검색 동작("오늘 할 일" → 홈 › 오늘 할 일), 개인 기록 0건, Escape 후 버튼으로 초점 복귀 |
| Saved | 화면 정상, 내 주변에서 저장(검증용 응답) 동작 |
| Notification | 패널 열림(`aria-expanded`) 정상, 오류 없음 |
| Account | 화면 정상, 지우기 동작 |
| Onboarding | dialog 열림, 초점 가둠, Escape, 초점 복귀, 지운 뒤 초대 다시 표시 |
| Store / Family / Care / Enjoy / Community / Health shell | 화면 전환·제목 정상, 넘침 없음 |
| 옛 주소 | `#learn` → 즐길거리, `#profile` → 내 정보 |
| Nearby provider | 구조 변경 없음. 검증용 응답으로 ready / empty / unavailable 상태 확인. **실제 API·key 로의 요청: NOT VERIFIED** |

손상된 저장소: 16개 key 를 5가지 방식으로 망가뜨린 뒤 새로고침 — Home 카드 10개 정상 표시, 오류 0, 손대지 않은 key 는 그대로, 다시 쓰기 가능.
지우기: `ongil.*` key 0개, `livon.keep` / `newon-other` / `newon-app-theme` 그대로, Home·My Life·Saved 가 빈 상태로 돌아옴.
반복 이동: Home ↔ My Life 45회 이동 뒤 체크 한 번 = 저장 1회, 카드 10개·탭 4개·날짜 막대 1개 그대로(handler 누적 없음).

## KNOWN LIMITATIONS

- 이 기기·이 브라우저에만 저장된다. Server sync, 가족 공유, cloud backup, 내보내기, AI, 알림(push), 은행 연동 없음.
- 실제 화면낭독기, 실제 기기 터치, 영상 위 글자 대비, 실제 내 주변 API 는 확인하지 못했다.
- Home 에서 할 일·루틴을 만들거나 고칠 수 없다(의도: My Life 로 연결).
- 기한이 지난 미완료 할 일은 Home 에 따로 강조하지 않고 "이 밖에 남은 할 일" 개수에 포함된다.
- 생활 기록은 365일 전까지만 열 수 있다(DailyLife 보관 범위 366일).
- 수면 기록을 다른 날짜로 옮기는 기능은 없다(그 날짜에서 지우고 다른 날짜에 다시 적는다).
- 지난 날짜의 루틴 표시는 고칠 수 없다(오늘만).
- 기록(일기)은 최근 20건만 보이고, 생활비는 분류별 합계가 없다(2B 그대로).
- `contracts.js` 의 `FUTURE_CONTRACTS` 목록은 Phase 1 그대로다(동작 영향 없음).
- JS module 은 `app.js?v=` 만 버전이 붙는다. 배포 캐시 정책은 따로 정해야 한다.
- `~/Newon/.git/objects/maintenance.lock` (2026-09-30, 0 byte)은 이 작업과 무관하며 건드리지 않았다.

## PHASE 3 HANDOFF

Phase 3 = HEALTH + CHECK-IN V1

이미 있는 것 (그대로 재사용)
- `checkins` (오늘의 안부, 하루 1건), `medications` / `medicationLogs` (복약 메모와 날짜별 표시), `sleepRecords`, `dailyLife`.
- 날짜 막대(`createDayNav`), 목록 카드(`createListCard`), 카드·입력 필드(`home-ui.js`), 날짜 계산(`dates.js`).
- 분류(`privacy.js`): 건강 관련 collection 은 HEALTH_ADJACENT — sync·검색·공유 제외.

Phase 3 에서 지킬 것
1. 새 collection 은 `storage.js` COLLECTIONS 와 `privacy.js` 에 함께 등록(누락 시 OG-PV-1 실패).
2. 안부·복약의 지난 날짜 보기는 날짜 막대 패턴을 쓴다(새 날짜 UI 를 만들지 않는다).
3. Home 요약(`buildHomeSummary`)에 항목을 더할 때는 개수만. 평가·점수·건강 판단 문구 금지(OG-IV-12, OG-HM-9, OG-LF-8).
4. "도움이 필요해요"는 지금 아무에게도 알리지 않는다. 가족 알림은 Family backend 가 생기기 전까지 만들지 않는다.
5. 날짜만 있는 값은 계속 로컬 `YYYY-MM-DD`.

Mac 에서 확인
```
cd ~/Newon-ongil
node --test tests/ongil/*.test.mjs        # 131 pass
python3 -m http.server 8765               # http://localhost:8765/ongil-start/
git status                                # ongil-start/ tests/ongil/ docs/ongil/ 만 변경
```
