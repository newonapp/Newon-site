# ONGIL PHASE 5 — ENJOY + LOCAL DISCOVERY V1

- 작성일: 2026-10-03
- Worktree: `~/Newon-ongil` · branch `ongil-foundation-v1` · HEAD `4ccb41b50`(ONGIL Health and Check-in V1) 위, Phase 4 미커밋 상태 위에서 작업
- 상태: 구현 + 검증 완료, **미커밋** (git add / commit / push 하지 않음)
- 선행 문서: `MASTER_AUDIT_V1.md` … `PHASE_4_FAMILY_CARE_V1.md` (8개)

## OBJECTIVE

`#enjoy` 안내 화면을 **실제로 찾아보는 화면**으로 바꿨다. 시니어가 무엇을 배우고, 어떤 취미를 해 보고, 어디에 가 볼지를
지역 기준으로 찾는다. 자료는 이 저장소에 이미 있는 data route 와 provider 3개만 다시 쓴다.

- 가짜 강좌·행사·장소·가격·모집 기간·기관 0. 결과는 사용자가 "찾기"를 눌렀을 때 연결된 자료에서만 나온다.
- 추천 없음: "추천순" 같은 정렬도, 맞춤 추천 문구도 없다. Home 은 "추천이 아니라 즐길거리 화면에서 찾아 본 것"이라고 말한다.
- 예약·신청·결제·숙박·교통 없음. 위치 권한을 묻지 않는다(지역 이름 기준).
- 새 backend·API key·server route·provider·collection 없음. ONGIL dark / film 디자인 그대로(새 stylesheet 없음, 기존 카드·선택 버튼·목록·dialog 재사용). LIVON·shared·server 파일은 읽기만 했다.

## START CHECK

| 항목 | 결과 |
|---|---|
| Phase 1 ~ 4 | 포함. HEAD 는 `4ccb41b50`(Phase 3 까지 커밋됨, 사용자가 커밋), Phase 4 는 미커밋으로 존재 |
| 작업 전 테스트 | 221 / 221 PASS |

## AUDIT (작업 전)

| 대상 | 분류 | 내용 |
|---|---|---|
| `#enjoy` 화면 | PARTIAL | film hero + 일반 shell(준비 중 slot 8개) |
| Home "오늘 뭐 하지?" | PARTIAL | 분류 5개 링크(모두 `#enjoy`), 내용 없음 |
| Home "내 주변" | EXISTS | kr-lifelong-class, 버튼을 눌러야 요청, `data-source.js` 의 `cleanProgram` 으로 따로 정리 |
| kr-lifelong-class | EXISTS (server) | query·region·status 필터, `liveVerified: false` |
| kr-kakao-place | EXISTS (server) | keyword 검색, Phase 4 기관 찾기에서 재사용 중, `liveVerified: false` |
| kr-tourapi | EXISTS (server) | 관광지·문화시설·레포츠·숙박·쇼핑·음식점(행사·코스는 place 가 아님), region 은 7개 시·도만, `liveVerified: false` |
| program / class / event / place 모델 | MISSING | `FUTURE_CONTRACTS` 에 Program·Place 이름만 |
| saved | EXISTS | PROGRAM · PLACE type 이 Phase 1 부터 있음 (CLASS·EVENT 없음) |
| calendar | EXISTS | `CalendarEvent` (`schedule.add({ title, date, time })`) |
| family preview / care | EXISTS | Phase 4 패턴(preview 만, 전송 0) |
| search | EXISTS | areas · saved · care provider |
| DUPLICATE | 없음 | provider·route·saved type·collection·stylesheet 를 새로 만들지 않았다 |

## CATEGORY TAXONOMY

| id | 화면 | 하위 분류 (검색어 예시일 뿐, 프로그램처럼 그리지 않음) |
|---|---|---|
| HOBBY | 취미 | 미술 · 서예 · 사진 · 음악·악기 · 원예 · 요리 · 공예 · 독서 |
| LEARNING | 배움 | 스마트폰 · 키오스크 · AI · 외국어 · 금융 · 디지털 · 평생교육 |
| EXERCISE | 운동 | 걷기 · 체조 · 요가 · 수영 · 등산 |
| CULTURE | 문화 | 영화 · 공연 · 전시 · 박물관 |
| OUTING | 나들이 | 공원 · 관광지 · 지역 행사 |
| TRAVEL | 여행 | 당일치기 · 국내여행 · 지역 관광 |

주소: `#enjoy`, `#enjoy/hobby` … `#enjoy/travel`(없는 분류는 `#enjoy` 로 고침).

## CONTENT TYPES

| type | 뜻 | 자료 |
|---|---|---|
| PROGRAM | 누군가 기간을 두고 운영하는 프로그램 | 연결된 자료 없음 (모델만) |
| CLASS | 회차가 있는 강좌 | 평생학습 강좌 (kr-lifelong-class) |
| EVENT | 날짜가 있는 공연·행사 | **연결된 자료 없음** (TourAPI 의 행사(15)는 route 가 place 로 받지 않음) |
| PLACE | 갈 수 있는 곳 | 관광 정보 (kr-tourapi), 지도 검색 (kr-kakao-place) |
| TRIP · GROUP | 이후 Phase | 코드가 만들지 않음 |

PROGRAM·CLASS·EVENT 는 의미가 거의 같아 **모양 하나**(`normalizeProgram`)를 쓰고 type 으로 구분한다. EVENT 는 모집·정원·대상·회차 필드를 비운다. PLACE 는 따로(`normalizePlace`).

## DATA CONTRACTS

- Program/Class/Event: `type, id, title, category, summary, organization, region, location, startDate, endDate, scheduleText, startTime, costText, targetText, recruitmentText, capacityText, sourceName, sourceUrl, linkKind, updatedAt`
- Place: `type, id, name/title, category, placeType, summary, region, address, phone, latitude, longitude, sourceName, sourceUrl, linkKind, updatedAt`
- 규칙: 없는 값은 빈 값(화면에 행이 생기지 않음). 날짜는 실제 날짜만(`2026-02-30` 버림, 끝이 시작보다 앞이면 끝을 버림). 좌표는 source 가 위도·경도를 **둘 다** 숫자로 줄 때만. 전화는 숫자·하이픈만. 예약·신청·가격 필드 없음.

## PROVIDERS

| provider | ONGIL source | 보내는 것 | 결과 |
|---|---|---|---|
| kr-lifelong-class | `createLifelongClassSource` (Home 내 주변과 **같은 객체**) | 시·도 이름 (+ 강좌 이름에 들어갈 말) | CLASS, 최대 20 (Home 은 6) |
| kr-tourapi | `createTourPlaceSource` | 시·도 이름 + 관광지(12)·문화시설(14)·레포츠(28) | PLACE, 최대 20. 숙박·쇼핑·음식점은 묻지 않음. 서울·부산·대구·인천·광주·대전·경기 외 지역은 요청 없이 "아직 찾을 수 없음" |
| kr-kakao-place | `createEnjoyPlaceSource` | "<시·도> <검색어>" (공원·박물관·미술관·공연장·영화관·수영장·체육관·도서관) | PLACE, 최대 15. 민간 지도 서비스로 표시 |

- 모두 기존 `/api/livon/data` route. 먼저 `?action=status` 로 키 설정 여부(boolean)만 묻고, 없으면 검색 요청 없이 "이 자료는 아직 연결되지 않았어요".
- fetch 주입은 여전히 `app.js` 의 `dataApi` 한 곳(OG-SEC-2), 네트워크 코드는 `data-source.js` 안에만(공통 `dataClient` 로 정리).
- **PRODUCTION LIVE VERIFIED: NO** — 세 provider 모두 manifest 상 `liveVerified: false`. 결과 화면은 테스트 fixture 로만 확인했다.

## NORMALIZATION

```
route 응답 (provider entity) ─ data-source.js (raw 그대로 또는 lifelong 만 정규화)
   → enjoy-contracts.js  fromLifelong · fromTourPlace · fromKakaoPlace   ← provider 필드 이름은 이 파일에만
   → normalizeProgram / normalizePlace  → sanitizeEnjoyItems (불량 제거·중복 제거, "고치지" 않음)
   → filterEnjoy / sortEnjoy → enjoy-view.js
```

- Home 내 주변과 즐길거리는 같은 `fromLifelong` + `normalizeProgram` 을 쓴다. Home 카드가 쓰던 표시용 이름(href·organizer·venue·period·days·attribution)은 정규화된 항목에서 파생만 한다(예전 `cleanProgram` 제거). Home 요청 URL 은 그대로(OG-NB-2 무변경 통과).
- 정규화는 idempotent: 이미 정규화된 항목을 다시 넣어도 링크와 그 종류가 유지된다(QA 에서 찾아 고친 버그 — 첫 QA 때 평생학습 강좌의 운영기관 누리집 링크가 두 번째 정규화에서 사라졌음, OG-EN-10 으로 고정).

## DISCOVERY

화면 순서: 안내(ONGIL 이 운영하지 않음, 신청·예약·결제는 기관에서) → **무엇을 해볼까요?**(분류 6개 + 뜻 + 하위 분류 예시) → **지역에서 찾아보기**(지역 · 무엇을 찾을까요? · 강좌 이름에 들어갈 말(강좌일 때만) · 찾기 + 자료별 상태) → **찾은 즐길거리**(필터·정렬·검색·목록) → **저장한 즐길거리**(개수 + 저장 화면 링크).

- 분류를 고르면 그 분류에서 찾을 수 있는 자료만 "무엇을 찾을까요?"에 나온다(예: 여행 → 관광지(한국관광공사)만).
- 상태: EMPTY("아직 찾은 것이 없어요"), LOADING(자료 영역 `aria-busy`, 버튼 비활성), UNAVAILABLE(자료별 문장), RESULTS.
- **FAILURE ISOLATION**: 자료마다 마지막 상태를 따로 보여 준다("평생학습 강좌 — 이 자료는 아직 연결되지 않았어요", "공원 (지도 검색) — 서울에서 6건 찾았어요"). 한 검색은 같은 자료로 찾았던 이전 결과만 바꾸고 다른 자료의 결과는 남긴다. 늦게 온 이전 응답은 새 응답을 덮지 못한다.
- 결과는 이번 방문 동안 메모리에만. 둘러본 기록·검색어를 저장하지 않는다.

## SEARCH / FILTER / SORT

- 찾은 것 안에서 찾기: 이름 · 소개 · 기관 · 장소 · 주소 · 분류 이름.
- 종류(전체·프로그램·강좌·행사·장소)와 분류(전체 + 6개): 불러온 자료에 없는 선택지는 **비활성**, 개수 표시 없음.
- 지역 좁히기: 결과가 두 지역 이상일 때만 나온다. 찾을 때의 기본 지역은 "내 정보에 설정한 지역"(내 위치라고 말하지 않음).
- 정렬: 가나다순, 시작일순(시작일이 있는 항목이 있을 때만). 추천순·인기순·거리순 없음(좌표가 있어도 거리를 계산하지 않음).

## DETAIL

- dialog 하나를 재사용, 닫으면 내용 비움. Tab/Shift+Tab 순환, Escape, 연 버튼으로 초점 복귀.
- 행 순서(값이 있는 것만): 종류 · 분류 · 소개 · 운영 기관 · 장소 · 주소 · 기간 · 일정 · 비용 · 대상 · 모집 · 정원 · 전화 · 자료 출처 · 자료 날짜 — "무엇인지 → 어디서 → 언제 → 얼마 → 누가 → 어떻게 확인".
- 링크 이름은 정직하게: 공공 도메인(https `.go.kr`/`.or.kr`)이면 "공식 페이지에서 확인", 운영기관 누리집이면 "운영기관 누리집 보기", 카카오맵이면 "카카오맵에서 위치 보기". 그 밖의 링크(`javascript:`, http, 계정 포함 등)는 버린다.
- 버튼: 저장 · 내 일정에 추가(시작일이 있을 때만) · 가족에게 보내기 · 닫기 + "ONGIL이 운영하는 프로그램이 아니에요. 신청, 예약, 결제는 운영 기관이나 공식 페이지에서 직접 확인하세요."
- 사진: 이번 자료 경로에서는 사진을 받지 않아 표시하지 않는다.

## SAVED

- 기존 Saved type 재사용(**A안**): PLACE → PLACE, PROGRAM·CLASS·EVENT → PROGRAM. 새 type 없음, migration 없음. 설명 맨 앞에 실제 종류를 적어 구분("강좌 · 구립도서관 · 2026-11-03").
- 저장 내용은 snapshot 9개 필드(type·id·title·description·href·source·savedAt·key·schemaVersion)뿐, provider payload 를 저장하지 않는다.
- Home 내 주변에서 저장한 강좌와 즐길거리의 같은 강좌는 같은 key → 어느 쪽에서 보든 "저장함".

## CALENDAR

- "내 일정에 추가"는 실제 시작일이 있는 PROGRAM·CLASS·EVENT 에만. 장소에는 없음.
- 먼저 미리 보기: 일정 이름 · 날짜(시작일) · 시간(있을 때) + "신청이나 예약이 되는 것은 아니에요." → 사용자가 "내 일정에 추가"를 눌러야 저장.
- 기존 `CalendarEvent` 그대로: title(80자) · date · time 만. URL·id·HTML·metadata 를 복사하지 않는다.
- **중복 방지**: 같은 날 같은 제목·같은 시간의 일정이 있으면 버튼이 "이미 내 일정에 있어요"로 비활성. 일정 schema 를 바꾸지 않으려고 출처 id 대신 제목·날짜·시간을 비교했다(같은 강좌를 다른 이름으로 직접 적어 둔 경우는 구분하지 못함 → KNOWN LIMITATIONS).

## FAMILY

- "가족에게 보내기" → "가족 연결이 필요해요. 아직 연결된 가족이 없어서 보내지 않았어요." + 보내질 수 있는 공개 정보(이름·종류·운영 기관·장소·기간·자료 출처) + "내 일정이나 건강 기록은 함께 보내지 않아요." 저장소 쓰기 0, 네트워크 0(브라우저 확인).

## HOME

- 오늘 뭐 하지?: 분류 6개(여행 추가), 각각 `#enjoy/<분류>` 로. 즐길거리에서 이번 방문에 실제로 찾은 것이 있으면 최대 3개를 그대로 보여 주고 "추천이 아니라 즐길거리 화면에서 찾아 본 것 가운데 몇 가지예요"라고 말한다. 순위·점수·개인화 없음.
- 아무것도 찾지 않았으면 분류 링크와 안내 한 줄만.

## NEARBY

- Home 내 주변의 동작·문구·요청 URL 은 그대로. 같은 source 객체와 같은 정규화를 쓰게 바꿨다(OG-EN-30).

## GLOBAL SEARCH

- 새 provider `enjoy` — 즐길거리 화면에서 실제로 불러온 공공 항목만, 종류 이름("강좌 · 구립도서관 · …")과 함께. 결과 링크는 `#enjoy/<분류>`. provider 는 4개(메뉴·저장·돌봄·즐길거리), 개인 기록 검색 0.

## CARE SEPARATION

- 돌봄(CARE_SERVICE·PUBLIC_BENEFIT·FACILITY, 기관 찾기)과 즐길거리(PROGRAM·CLASS·EVENT·PLACE)는 type·분류·화면이 다르다. 같은 Kakao route 를 쓰지만 즐길거리 검색어에는 복지관·보건소 같은 돌봄 기관이 없고, 돌봄 분류로 즐길거리 장소를 만들 수 없다(OG-EN-33).

## COMMUNITY BOUNDARY

- 자동 게시·후기·모임 생성/가입 없음. TRIP·GROUP 은 type 이름만 예약(`FUTURE_ENJOY_TYPES`). 즐길거리 영역의 "모임" slot 은 준비 중 그대로. Phase 6 에서 후기·모임을 붙일 때 Saved key(type+id)를 연결점으로 쓸 수 있다.

## PRIVACY

- 새 collection 없음(20개 그대로). 저장은 기존 `saved`, 일정은 기존 `events` 에만, 둘 다 사용자가 누를 때만.
- 둘러보기·검색어·필터 선택을 기록하지 않는다. 위치 권한·geolocation 호출 0.
- 보내는 것은 시·도 이름과 고른 검색어뿐, 버튼을 눌렀을 때만.

## SECURITY

- markup 문자열 생성 0, 외부 글은 textContent 로만.
- URL: https 만, 공식 = 공공 도메인 allowlist, 지도 = kakao.com, 운영기관 누리집 = https + `safeHref`. 이미 정규화된 항목도 다시 검사.
- enum 검증: 분류·type·지역·TourAPI 종류(12/14/28)·Kakao 검색어(한글 2~10자)·정렬.
- provider 응답: 모양이 틀리면 unavailable, 항목 단위로 버림, 길이 제한(제목 120 · 소개 300 · 기관 80 · 장소 160 · 출처 120).

## ACCESSIBILITY

- 분류·종류·분류 필터: `role="group"` + 보이는 제목, `aria-pressed` + ✓, 비활성은 `disabled` + `aria-disabled`.
- 모든 입력은 `makeField`(label for, 도움말 `aria-describedby`), 결과 수 `aria-live`, "자세히" `aria-haspopup="dialog"`, 저장 `aria-pressed`.
- 키보드: 필터를 누른 뒤 같은 버튼에 초점 유지, "더 보기" 뒤 첫 새 항목으로 초점, dialog Tab 순환·Escape·초점 복귀(브라우저 확인).
- 측정(세 폭, 아래 상태 전부): 44px 미만 0, 16px 미만 글 0, 화면 안 "null/undefined" 0.
- **STATIC SCREEN READER REVIEW: PASS** (OG-EN-39). **ACTUAL SCREEN READER: NOT VERIFIED.**

## RESPONSIVE

Headless Chromium, 외부 요청 차단, route 응답은 테스트 전용 fixture.

| 상태 | 1440 | 820 | 390 |
|---|---|---|---|
| ENJOY EMPTY · LOADING · UNAVAILABLE · RESULTS · CATEGORY FILTER · TYPE FILTER · SEARCH · DETAIL · SAVE · CALENDAR PREVIEW · FAMILY PREVIEW, HOME 오늘 뭐 하지? · 내 주변 | 넘침 0 | 넘침 0 | 넘침 0 |
| console error / page error | 0 | 0 | 0 |

- 긴 강좌 이름(공백 없는 영문 45자+한글), 긴 기관 이름, 공백 없는 긴 주소 모두 줄바꿈.

## PERFORMANCE

- 400개 fixture(강좌 200 + 장소 200, QA 전용 harness 페이지 — 저장소에 없음): 처음 그리는 행 30개, "더 보기" 후 60개, 즐길거리 영역 DOM 약 590 노드, dialog 0개(열 때만 1개). 검색 2~3ms, 종류 필터 15~16ms, 더 보기 21~23ms, long task 0.
- 단위 테스트(OG-EN-37): 400개에 대해 필터+검색+정렬 한 번 < 50ms.
- 실제 자료 한도: 한 번 찾을 때 강좌 20 · 관광 20 · 지도 15건.

## TESTS

`node --test tests/ongil/*.test.mjs` → **271 tests / 271 pass / 0 fail / 0 skip**

- 기존 221: 전부 유지, 삭제·skip 없음.
- 신규 50: `enjoy-data.test.mjs` (OG-EN-1 … OG-EN-50).

기존 assertion 변경 — 모두 의도된 제품 변화, 테스트 파일에 이유 주석:

| Test | BEFORE | AFTER | WHY |
|---|---|---|---|
| OG-HM-5 (home-view) | 분류 5개, 모두 `#enjoy`, `createEnjoyCard()` 무인자, "추천할 프로그램은 아직 준비 중" | 분류 6개(+여행), `#enjoy/<분류>`, `createEnjoyCard({ loaded: enjoyLoaded })`, "추천이 아니라 … 찾아 본 것" 문구. 지어낸 내용 금지 목록 확인은 그대로 | 즐길거리 연결 |
| OG-HM-11 (home-view), OG-IV-7 (integration-view), OG-PV-3 (life-privacy), OG-HL-40 (health-view) | `registerProvider` 3회 | 4회 + 네 번째가 `createEnjoyProvider(() => enjoyView.items())` 인지 확인 | 공공 즐길거리 검색(요구사항 30) |
| OG-VW-1 (shell) | 즐길거리 module 전부 준비 중 | 분류 6개 + 지역 프로그램 available, **모임만 준비 중** 고정 | 정직한 상태 표시 |
| OG-LF-1 (life-view), OG-FC-10 (care-data) | shell loop 가 home·life·family·care 를 건너뜀 | + enjoy | 즐길거리가 자체 view 를 가짐 |
| OG-NB-1 / OG-NB-2 (home-data) | — | 변경 없음 | Home 요청 URL·결과 모양 그대로 통과 |

## KNOWN LIMITATIONS

| 항목 | 상태 |
|---|---|
| LIFELONG LIVE | NOT VERIFIED (`liveVerified: false`, 운영 키 미확인) |
| KAKAO LIVE | NOT VERIFIED |
| TOUR LIVE | NOT VERIFIED. 지역 7개만 지원(route 의 REGION_CODES) |
| EVENT DATA | 연결된 자료 없음 (모델만) |
| BOOKING / PAYMENT | 없음 |
| FAMILY SEND | 없음 (preview 만) |
| GROUPS / MEETUPS | 없음 (type 이름만 예약) |
| AI RECOMMENDATION | 없음 |

- 평생학습 강좌 자료에는 분류가 없어서, 결과의 분류는 "사용자가 찾은 분류"(취미에서 찾으면 취미)다.
- 일정 중복 방지는 제목·날짜·시간 비교라서, 같은 강좌를 다른 이름으로 직접 적어 둔 일정은 구분하지 못한다.
- 결과는 한 번에 한 쪽(page 1)만. 다음 쪽 불러오기 없음. 거리·지도 표시 없음.
- 사진, 상세 소개(TourAPI detailCommon2) 는 아직 불러오지 않는다.
- 실제 화면낭독기·기기 터치·웹폰트·영상 위 대비: NOT VERIFIED.

## PHASE 6 HANDOFF

Phase 6 = COMMUNITY + GROUPS V1

- 연결점: 저장한 강좌·장소(Saved key = type + id)에 후기를 붙일 수 있다. 즐길거리 항목은 공공 자료이고 후기는 사용자 글이므로 분류(PRIVATE / 공개 범위)를 먼저 정해야 한다.
- GROUP·MEETUP 은 `FUTURE_ENJOY_TYPES` 로만 남겨 두었다. 실제 모임은 계정·서버·신고/차단·운영 정책이 먼저다.
- 즐길거리의 가족에게 보내기, 돌봄의 가족에게 보내기, 가족 화면의 "가족이 보내준 것"(SharedItem: PROGRAM·PLACE)이 같은 contract 로 이어지게 되어 있다.
- 남은 운영 과제: 세 provider 의 운영 키 설정과 live 검증.

Mac 에서 확인
```
cd ~/Newon-ongil
node --test tests/ongil/*.test.mjs        # 271 pass
python3 -m http.server 8765               # http://localhost:8765/ongil-start/#enjoy
git status                                # ongil-start/ tests/ongil/ docs/ongil/ 만 변경
```
