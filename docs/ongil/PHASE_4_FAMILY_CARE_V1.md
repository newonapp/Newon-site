# ONGIL PHASE 4 — FAMILY + CARE COORDINATION V1

- 작성일: 2026-10-02
- Worktree: `~/Newon-ongil` · branch `ongil-foundation-v1` · Phase 2C · 3 미커밋 상태 위에서 작업
- 상태: 구현 + 검증 완료, **미커밋** (git add / commit / push 하지 않음)
- 선행 문서: `MASTER_AUDIT_V1.md`, `PHASE_0_5_REPOSITORY_PLAN.md`, `PHASE_1_FOUNDATION_V1.md`, `PHASE_2A_HOME_V1.md`, `PHASE_2B_MY_LIFE_V1.md`, `PHASE_2C_INTEGRATION_V1.md`, `PHASE_3_HEALTH_CHECKIN_V1.md`

## OBJECTIVE

가족(FAMILY)과 돌봄·서비스(CARE)를 shell 에서 실제로 쓸 수 있는 화면으로 바꿨다.
가족은 보호자·관리자가 아니라 **시니어가 골라서 연결하는 관계**다. 목표는 독립·연결·조율·동의이고, 감시가 아니다.

- 가족 backend 가 없으므로 가짜 연결·가짜 가족·가짜 초대·가짜 메시지·가짜 온라인 상태를 만들지 않았다. 사용자가 지금 할 수 있는 것은 "내가 공유할 내용"을 미리 정하고, 도움 요청을 적어 두는 것뿐이며, 화면이 그렇게 말한다.
- 돌봄은 이미 이 저장소에 있는 장소 검색 route 로 **가까운 기관 찾기**만 연결했다(키가 설정된 경우에만 결과). 돌봄 서비스·복지 혜택 자료는 출처가 없어서 "아직 연결되지 않았어요"라고 말한다. 가짜 기관·혜택·서비스·예약 없음.
- ONGIL dark / film 디자인 그대로(기존 카드·선택 버튼·목록·입력·dialog 재사용, 새 CSS 는 token 만 사용). LIVON·shared·server 파일은 건드리지 않았다.

## START CHECK

| 항목 | 결과 |
|---|---|
| Phase 1 · 2A · 2B · 2C · 3 | 포함 (문서 7개 확인, git status 로 미커밋 상태 확인) |
| 작업 전 테스트 | `node --test tests/ongil/*.test.mjs` → 171 / 171 PASS |

## AUDIT (작업 전)

| 대상 | 분류 | 내용 |
|---|---|---|
| family 화면 `#family` | PARTIAL | film hero + 일반 shell(준비 중 slot 5개) |
| Home 가족 카드 | EXISTS | "아직 연결된 가족이 없어요" 고정 문구 |
| familyIntent / `familyConnection()` | EXISTS | 처음 설정의 "지금 연결하고 싶어요" 기록만, 항상 `NOT_AVAILABLE` |
| share / permission / consent / revoke / audit | MISSING | `FUTURE_CONTRACTS` 에 FamilyConnection·FamilyPermission 이름만 |
| help request | MISSING | 오늘의 안부 "도움이 필요해요"는 기록만, 누구에게도 알리지 않음(유지) |
| care 화면 `#care` | PARTIAL | film hero + 일반 shell(준비 중 slot 11개) |
| care · service · benefit · facility 모델 | MISSING | `FUTURE_CONTRACTS` 에 CareService 이름만 |
| provider (ONGIL) | EXISTS | `data-source.js` 평생학습(kr-lifelong-class) 하나 |
| provider (repository, 읽기만) | EXISTS | `server/livon/data` — kr-kakao-place 등 8종, 모두 `liveVerified: false` |
| saved | EXISTS | SERVICE · BENEFIT · FACILITY type 이 Phase 1 부터 있음 → 그대로 재사용 |
| notification | EXISTS (shape) | FAMILY · SERVICE type 정의만, 생성기 없음 → 변경 없음 |
| profile / health / checkin / medication / schedule / task / routine | EXISTS | 변경 없음 (가족 쪽에서 읽지 않음) |
| DUPLICATE | 없음 | 새 saved type, 새 date utility, 새 provider·route 를 만들지 않았다 |

## FAMILY ARCHITECTURE

```
가족 화면 (family-view.js)                    Home 가족 카드 (home-explore.js)
  연결 상태 · 내가 공유할 내용 · 미리 보기          "공유하도록 고른 항목 N개" · "적어 둔 도움 요청 N개 (보내지 않음)"
  도움 요청 · 가족이 보내준 것 · 가족 공유 약속
          │                                              │
          └──────── family.js (같은 store 객체, app.js 에서 한 번 생성) ───────┘
                 createFamilySharingStore → ongil.v1.familySharing   (PRIVATE)
                 createHelpRequestStore   → ongil.v1.helpRequests    (PRIVATE)
          family-contracts.js — FamilyConnection · FamilyPermission · Consent · AuditEntry · SharedItem · HelpRequest
                                (Connection·Permission·Consent·Audit·SharedItem 은 contract 만: 이 기기에서 만드는 코드 없음)
```

- 가족 화면은 건강 기록을 **읽지도 렌더하지도 않는다**(family.js / family-view.js 에 checkIn·medication·symptoms·healthNotes 참조 0, 테스트 OG-FM-7).

## CONNECTION MODEL (contract only)

`FamilyConnection { id, ownerUserId, memberUserId, relationship, status: pending | active | revoked, createdAt, updatedAt }`

- userId 는 미래 계정 서버가 발급한다. 이 기기에서 만들지 않는다(테스트 OG-FM-2: `normalizeFamilyConnection(` 호출 코드는 contract 파일 밖에 0).
- 화면: "아직 연결된 가족이 없어요." + "가족 연결 기능은 준비 중이에요. 연결하기 전에는 어떤 내용도 가족에게 가지 않아요." + 처음 설정에서 "지금 연결하고 싶어요"를 골랐다면 그 사실.
- Relationship: 배우자 · 자녀 · 형제·자매 · 부모 · 친척 · 기타. **관계는 권한을 정하지 않는다** — Permission contract 에 relationship 입력이 없다(OG-FM-4).

## PERMISSION MODEL

| 항목 | 고를 수 있는 수준 | 요약만 | 자세히 | 건강 관련 |
|---|---|---|---|---|
| 오늘의 안부 CHECK_IN | 안 함 / 요약 / 자세히 | 남겼는지만 | 고른 기분까지 | ✓ |
| 일정 SCHEDULE | 안 함 / 요약 / 자세히 | 개수만 | 이름과 시간 | |
| 할 일 TASK | 안 함 / 요약 / 자세히 | 남은 개수만 | 이름 | |
| 루틴 ROUTINE | 안 함 / 요약 / 자세히 | 한 개수만 | 이름과 한 것 | |
| 복약 MEDICATION | 안 함 / 요약 | 먹은 개수만(약 이름 안 보임) | — | ✓ |
| 몸 상태 HEALTH | 안 함 / 요약 | 적었는지만(증상·메모 안 보임) | — | ✓ |
| 생활 DAILY_LIFE | 안 함 / 요약 / 자세히 | 적었는지만 | 끼니·잔 수·운동 여부 | |
| 도움 요청 HELP_REQUEST | 안 함 / 자세히 | — | 보내기로 고른 요청(보낼 때마다 다시 확인) | |

- **기본값: 모두 공유 안 함.** 고른 것만 저장한다(NONE = 기록 없음).
- 건강 관련 3개는 "공유 안 함"에서 바꿀 때 한 번 더 묻는다("…볼 수 있게 할까요?" → 네 / 그대로 두기). 확인 전에는 저장되지 않는다(브라우저 확인).
- **공유할 수 없는 것**(카테고리 자체가 없음): 건강 메모 · 증상 내용 · 기록(일기) · 생활비.
- 지금 저장되는 것은 **선호(preference)**이지 동의(consent)가 아니다. 받을 사람이 없기 때문이다.

## CONSENT

`Consent { id, subject: 'self', scope { category, level }, grantee (connectionId), status: granted | revoked, createdAt, revokedAt }`

- 연결이 생기면, 사용자가 켠 항목마다 **그 연결 하나에 대해** 명시적으로 확인하고 Consent 를 만든다. 선호 → 동의가 자동으로 바뀌지 않는다.
- `NONE` 수준이나 카테고리가 허용하지 않는 수준(예: HEALTH DETAIL)의 consent 는 만들 수 없다.
- `consentAllows(consent, category, level)` — 동의한 카테고리, 동의한 수준 이하만 허용.

## REVOCATION

- `revokeConsent()` 는 언제든 가능, 즉시, 한 방향(revoked → granted 되돌리기 함수 없음; 다시 공유하려면 새 consent). 철회 기록은 감사용으로 남는다(OG-FM-10).
- "한 번 가족이면 영구 접근" 구조 없음: 접근 판단은 최신 consent 하나로만.
- 화면에서도 "모두 공유 안 함으로 되돌리기"로 선호를 즉시 초기화할 수 있다.

## AUDIT LOG (contract only)

`AuditEntry { id, actor ('self' | connectionId), action: view | change | grant | revoke, category, level, at }` — 누가 무엇을 언제 어떤 권한으로. 서버가 기록하고 시니어가 볼 수 있어야 한다. 이번 Phase 에서 가짜 열람 기록을 만들지 않는다.

## SHARE PREVIEW

- "가족에게 보일 내용 미리 보기": 고른 항목과 수준을 **말로만** 보여 준다(예: "일정 — 일정 이름과 시간"). 사용자 기록 값은 넣지 않는다(오늘 기분이 "조금 힘들어요"여도 미리 보기에 나오지 않음, OG-FM-11).
- 항상 함께: "**아직 아무에게도 공유되지 않았어요.** 가족 연결 후 선택한 항목만 공유할 수 있어요." — "공유되었습니다" 문구 없음.

## SHARED ITEMS ("가족이 보내준 것")

- `SharedItem { id, type: PROGRAM | PLACE | SERVICE | PRODUCT | SCHEDULE, sourceId, senderConnectionId, createdAt, status }` contract 만.
- 화면: "아직 받은 것이 없어요." + 연결되면 모이는 곳이라는 설명. 저장소 없음.

## HELP REQUEST

- `HelpRequest { id, category, message ≤300, status, createdAt, updatedAt, resolvedAt }`. 분류: 병원 동행 · 장보기 · 이동 · 집안일 · 기기 사용 · 기타.
- 적기·고치기·지우기(확인)·"해결됐어요" 표시. 각 항목에 "보내지 않음 · 이 기기에만 있어요".
- 상태는 이 기기에서 `draft` / `resolved` 만. `sent` 는 미래 backend 용 예약값이며, 저장소에 `sent` 가 있어도 `draft` 로 읽는다(가짜 "전송됨" 차단, OG-FM-16).
- 카드 아래 고정 안내: "도움 요청은 아직 가족에게 보내지지 않아요." / "도움 요청은 응급 신고가 아니에요. ONGIL은 신고나 출동을 대신하지 않아요. 위급할 때는 119에 직접 전화해 주세요."
- **HELP → CARE**: 보내지 않은 요청이 있으면 "병원 동행 정보 돌봄·서비스에서 보기" → `#care/hospital-escort`. 이동만 하고, 아무것도 신청하지 않는다.

## CARE ARCHITECTURE

```
돌봄·서비스 화면 (care-view.js)
  무엇이 필요하세요? (분류 11개 + 한 줄 뜻) · 가까운 기관 찾기 · 찾은 결과(종류 필터·결과 안 검색) · 자세히(dialog 1개)
          │ 버튼을 눌렀을 때만
  data-source.js  createFacilitySource ── GET /api/livon/data?action=status → provider=kr-kakao-place&query="<시·도> <기관 종류>"
                  createUnconnectedSource('services' | 'benefits') → 항상 unavailable / NOT_CONNECTED
          │
  care-contracts.js  CareService · PublicBenefit · Facility · sanitize · filter · detailRows · savedInputFor · familySendPreview
```

- 결과는 **메모리에만**, 이번 방문 동안만. 둘러본 기록을 저장하지 않는다. 쓰는 것은 "저장"(기존 Saved store) 하나뿐.
- `#care/<분류>` 주소로 분류를 연다(없는 분류는 `#care` 로 고침).

## CARE TYPES

| Type | 필드 | 비고 |
|---|---|---|
| CARE_SERVICE | id, title, category, summary, region, costText, hoursText, phone, sourceName, sourceUrl, updatedAt, bookingAvailable | `bookingAvailable` 은 항상 false (입력이 true 여도) |
| PUBLIC_BENEFIT | id, title, category, summary, eligibilityText, region, applicationText, sourceName(필수), sourceUrl, updatedAt, applicationAvailable | 대상 여부 판정 필드 없음, `applicationAvailable` 항상 false |
| FACILITY | id, name/title, kind, placeType, address, region, phone, sourceName(필수), sourceUrl, mapUrl, updatedAt | 지도 링크와 공식 출처를 구분 |

셋을 하나의 generic object 로 합치지 않았다. PROVIDER 는 이후 Phase 로 남겼다.

분류(11): 돌봄 · 생활지원 · 병원 동행 · 이동 · 식사 · 청소·세탁 · 장보기 · 주거·안전 · 디지털 도움 · 복지·공공지원 · 기관·시설.
기관 종류(5): 노인복지관 · 행정복지센터(주민센터) · 보건소 · 치매안심센터 · 장기요양기관. 병원은 넣지 않았다(새 병원 검색 없음).

## DATA SOURCE

- **재사용**: 이 저장소의 기존 data route `/api/livon/data` 와 기존 provider `kr-kakao-place`(Kakao Local). 새 server route·API key·외부 provider 추가 없음. server 파일은 읽기만 했다.
- Kakao 는 민간 플랫폼이라 출처를 "카카오 (Kakao Local)"로 쓰고, 안내 문구에 "민간 지도 서비스, 공식 기관 자료 아님"을 붙인다. 카카오맵 링크는 "카카오맵에서 위치 보기"이며 "공식 안내"가 아니다.
- 순서: `?action=status` 로 키 설정 여부(boolean)를 먼저 묻고, 설정이 안 되어 있으면 검색 요청 없이 unavailable. 보내는 것은 "<시·도> <기관 종류>"뿐, 버튼을 눌렀을 때만.
- `kr-kakao-place` 의 live key 검증은 manifest 상 아직 없다(`liveVerified: false`). 따라서 운영에서 실제 결과가 나오는지는 **NOT VERIFIED**. 결과 화면은 테스트 환경에서만 fixture 로 확인했다(production UI 에 fixture 없음).
- **CARE PUBLIC DATA (서비스·혜택) NOT CONNECTED.**

## SEARCH / FILTER

- 결과 안에서 찾기: 이름·설명·주소·출처로 거른다(불러온 항목만).
- 종류 필터: 전체 / 서비스 / 혜택·복지 / 기관·시설 — 불러온 자료에 없는 종류는 **비활성**(가짜 개수 없음).
- 분류 선택: 서비스·혜택은 해당 분류만, 기관은 문의처라서 계속 보인다.
- 지역: 기관 찾기 양식의 지역(기본값 = 내 정보의 지역).
- 전체 검색: 새 provider `care` — **화면에서 실제로 불러온 공공 항목만** 찾는다. 아무것도 불러오지 않았으면 0건. 개인 기록 저장소를 읽지 않는다.

## DETAIL

- native `<dialog>` 하나를 재사용, 닫으면 내용 비움(숨은 detail DOM 없음). Tab/Shift+Tab 은 dialog 안에서 돌고, Escape 로 닫히고, 연 버튼으로 초점이 돌아간다(브라우저 확인).
- 값이 있는 필드만 행으로(종류·분류·설명·대상·신청 방법(공식 안내 내용)·지역·비용·운영 시간·주소·전화·자료 출처·자료 날짜). 전화는 숫자·하이픈만 허용(형식이 틀리면 숨김).
- "공식 안내 보기"는 https + `.go.kr` / `.or.kr` 이고 계정·포트가 없을 때만. 지도 링크는 https `kakao.com` 만. `javascript:` 같은 링크는 버려진다(브라우저: 잘못된 지도 URL 항목은 지도 버튼 없음).
- 버튼: 저장 / 가족에게 보내기 / 닫기 + "예약, 신청, 결제는 ONGIL에서 할 수 없어요." 예약·신청·결제 버튼 없음.

## SAVED

- 기존 SavedItem type 재사용: CARE_SERVICE → SERVICE, PUBLIC_BENEFIT → BENEFIT, FACILITY → FACILITY. 새 type·migration 없음, 예전 PROGRAM·PLACE 저장 항목 그대로(OG-CR-15).
- 저장 화면에서 "서비스 / 혜택·복지 / 기관·시설"로 구분되어 보인다(브라우저 확인).

## FAMILY ↔ CARE COORDINATION

- 자세히 › **가족에게 보내기** → "가족 연결이 필요해요. 아직 연결된 가족이 없어서 보내지 않았어요. 가족 연결 기능이 열리면 아래 내용만 보낼 수 있어요." + 보내질 수 있는 항목(이름·종류·주소·전화·자료 출처) + "내 건강 기록이나 메모는 함께 보내지 않아요." — 저장소 쓰기 0, 네트워크 요청 0(브라우저 확인).
- 도움 요청 → 돌봄 분류 이동(위 HELP REQUEST).
- Home 가족 카드: 연결 없음 + 로컬 사실 두 가지(고른 공유 항목 수, 보내지 않은 도움 요청 수)만.

## PRIVACY

| Class | Collection | sync | 전체 검색 | 가족 공유 |
|---|---|---|---|---|
| PRIVATE | expenses, journal, **familySharing, helpRequests** | 제외 | 제외 | 없음 |
| HEALTH_ADJACENT | checkins, medications, medicationLogs, symptoms, healthNotes | 제외 | 제외 | 없음 (Health → Family 전송 0) |

- collection 18 → **20**. sync 목록은 그대로 `profile, preferences, saved, onboarding`.
- 건강 기록 자동 공유: 안부 0 · 증상 0 · 복약 0 · 건강 메모 0. 가족 화면은 건강 데이터를 렌더하지 않는다.
- 데이터 지우기: 새 collection 포함, LIVON·사이트 key 보존. 안내 문구에 "가족 공유 설정과 도움 요청도 함께 지웁니다." 추가.

## SECURITY

- 문자열로 markup 을 만들지 않는다(innerHTML 계열 0). 사용자 입력·외부 자료는 textContent 로만.
- 외부 URL: 공식 = https + 공공 도메인 allowlist, 지도 = https kakao.com 만. `rel="noopener noreferrer"`.
- enum 검증: 공유 카테고리·수준(카테고리별 허용 수준), 도움 요청 분류·상태, 관계, 연결 상태, consent 범위, 돌봄 type·분류·지역·기관 종류. 모르는 값은 버리거나 기본값.
- 외부 자료 정리: 이름·주소 길이 제한, 제어문자 제거, id 형식 검사, 전화 형식 검사, 중복 제거.
- **서버 권한 검사 필수(미래)**: 이 화면에서 숨기는 것은 보안이 아니다. 가족용 읽기는 owner 경로와 분리된 endpoint 에서, 요청마다 서버가 최신 consent 를 확인하고(없거나 revoked 면 거부), 모든 열람을 AuditEntry 로 남겨야 한다. 클라이언트가 보낸 수준·카테고리를 믿지 않는다.

## ACCESSIBILITY

- 공유 설정: 항목마다 `fieldset` + `legend`, native radio, 각 줄 전체가 `label`(44px 이상), "지금: 요약만"처럼 현재 선택을 글로도 표시, 선택 줄은 굵게+테두리(색만으로 구분 없음). 방향키로 선택 이동 확인.
- 건강 관련 확인 단계: `role="group"` 이름 있음, 초점이 "그대로 두기"로 이동.
- 돌봄: 분류·종류 버튼 `aria-pressed` + ✓, 비활성 종류 `disabled`, 검색칸 label, 결과 수 `aria-live`, 자세히 버튼 `aria-haspopup="dialog"`, 저장 버튼 `aria-pressed`.
- 측정(세 폭, 가족 EMPTY / 공유 설정 / 도움 요청, 돌봄 EMPTY / 결과 / 필터 / 자세히, Home 가족 카드): 44px 미만 0, 16px 미만 글 0.
- **STATIC SCREEN READER REVIEW: PASS** (OG-FC-3). **ACTUAL SCREEN READER (VoiceOver / TalkBack): NOT VERIFIED.**

## RESPONSIVE

Headless Chromium, 외부 요청 차단, 돌봄 결과는 테스트 전용 route fixture.

| 상태 | 1440 | 820 | 390 |
|---|---|---|---|
| 가족 EMPTY · PERMISSION · HELP REQUEST, 돌봄 EMPTY · RESULTS · FILTER · DETAIL · 가족에게 보내기, Home 가족 카드 | 넘침 0 | 넘침 0 | 넘침 0 |
| console error / page error | 0 | 0 | 0 |
| 화면 안 "null" / "undefined" 글자 | 0 | 0 | 0 |

- 이번에 찾아 고친 문제 2가지: (1) 카드에 `null` 글자가 찍힘(조건부 자식을 DOM `append` 로 넘김) → null 을 건너뛰는 `put()` 으로 교체, 테스트 OG-FC-8 로 고정. (2) 390 에서 공백 없는 긴 기관 이름이 dialog 밖으로 넘침 + Tab 이 dialog 밖으로 나감 → 제목 `overflow-wrap`, 자식 `min-width: 0`, Tab 순환 처리.
- 긴 이름(공백 없는 영문 40자+한글), 300자 도움 요청 모두 줄바꿈.

## TESTS

`node --test tests/ongil/*.test.mjs` → **221 tests / 221 pass / 0 fail / 0 skip**

- 기존 171: 전부 유지, 삭제·skip 없음.
- 신규 50: `family-data.test.mjs` (OG-FM-1 … 20), `care-data.test.mjs` (OG-CR-1 … 20, OG-FC-1 … 10).

기존 assertion 변경 — 모두 의도된 제품 변화, 테스트 파일에 이유 주석, 확인 범위를 줄이지 않음:

| Test | BEFORE | AFTER | WHY |
|---|---|---|---|
| OG-ST-2 (foundation-data) | collection 18개 목록 | 20개(+familySharing, helpRequests). 가족 구성원·연결·권한 collection 거부는 그대로 | 새 local collection |
| OG-PV-1 (life-privacy) | PRIVATE 2개, contract 13개 | PRIVATE 4개, contract 15개(+FamilySharingPreference, HelpRequest) | 분류 |
| OG-IV-8 (integration-view) | PRIVATE 2개 | 4개, sync 목록 동일 확인 유지 | 분류 |
| OG-IV-1 (integration-view) / OG-IN-14 (integration-data) | 18 / "all eighteen" | 20 / "all twenty" | collection 수 |
| OG-HM-11 (home-view), OG-IV-7 (integration-view), OG-PV-3 (life-privacy), OG-HL-40 (health-view) | `registerProvider` 2회 | 3회 + 세 번째가 `createCareProvider(() => care.items())` 인지 확인 + 건강 provider 없음 확인 | 공공 돌봄 항목 검색(요구사항 27·38) |
| OG-HL-26 (health-data) | 이름에 family 가 들어간 collection 0 | `familySharing` 하나만(사용자 자신의 선택), 연결·권한·구성원·받은 것 collection 0 | 가족 선호 저장 |
| OG-HL-40 (health-view) | 지우기 문구 "증상과 건강 메모도 함께 지웁니다" | "…가족 공유 설정과 도움 요청도 함께 지웁니다" | 같은 문장 확장 |
| OG-LF-1 (life-view) | shell loop 가 home·life 를 건너뜀 | + family·care | 두 화면이 자체 view 를 가짐 |
| OG-VW-1 (shell) | 건강 4개 외 available 금지 | + 가족 2개(sharing, requests), 돌봄 1개(nearby). 가족의 연결·일정·소식은 준비 중 고정 확인 | 정직한 상태 표시 |
| OG-SEC-2 (shell) | 변경 없음 | — | fetch 주입을 `dataApi` 하나로 공유해 그대로 통과 |

## KNOWN LIMITATIONS

| 항목 | 상태 |
|---|---|
| FAMILY BACKEND | NONE — NO REAL FAMILY CONNECTION |
| REMOTE SHARING | NONE — 선호만 이 기기에 저장, 전송 0 |
| INVITATION | NONE — NO REAL INVITATION (SMS·email·링크 없음) |
| SERVER AUTHORIZATION | NONE — 미래 필수(위 SECURITY) |
| CARE DATA | 서비스·혜택: CARE PUBLIC DATA NOT CONNECTED. 기관: 기존 Kakao route 재사용, 운영 키·live 검증 NOT VERIFIED |
| BOOKING | NONE — NO REAL CARE BOOKING |
| PAYMENT | NONE — NO REAL CARE PAYMENT |
| EMERGENCY | NONE — NO EMERGENCY DISPATCH (도움 요청 ≠ 응급, 119 직접 전화 안내) |

- 실제 화면낭독기·실제 기기 터치·웹폰트·영상 위 대비: NOT VERIFIED.
- 처음 설정 dialog 의 Tab 순환은 브라우저 기본 동작에 기대고 있다(2C 확인 그대로). 돌봄 dialog 에는 명시적 순환을 넣었다.
- 기관 검색 결과는 15개, 1쪽만. 더 보기·거리순·지도 표시는 없다.
- 돌봄 "분류"는 서비스·혜택 자료가 연결될 때 의미가 커진다. 지금은 뜻 설명과 "연결되지 않음" 안내, 기관 찾기 안내가 전부다.

## BACKEND MIGRATION

1. 계정(Newon+) 연결 후 `FamilyConnection` 을 서버가 발급: 초대 → 상대 수락 → `active`. 양쪽 모두 언제든 `revoked`.
2. 사용자의 `familySharing` 선호는 **자동으로 consent 가 되지 않는다.** 연결된 가족마다, 켠 항목마다 확인 화면 → `Consent(granted)` 생성.
3. 가족용 읽기 endpoint 는 owner 경로와 분리. 요청마다 서버가 최신 consent 확인 + 수준에 맞게 **서버에서** 요약/자세히를 만들어 보냄(클라이언트가 걸러내지 않음) + AuditEntry 기록.
4. `helpRequests` 의 `draft` 는 사용자가 "보내기"를 누를 때만 서버로, 그때 상태 `sent`. 응급 기능과 섞지 않는다.
5. `SharedItem` 은 서버가 만들고, 받은 사람이 `seen / saved / dismissed` 로 바꾼다.
6. 돌봄 서비스·혜택은 공공 provider(복지로 등)를 server 에 추가한 뒤 `createUnconnectedSource` 자리를 교체. 화면·contract 는 그대로.
7. `familySharing` · `helpRequests` 의 sync 는 별도 동의 설계 전까지 금지(OG-FM-19 가 막는다).

## PHASE 5 HANDOFF

Phase 5 = ENJOY + LOCAL DISCOVERY V1

- 재사용할 것: `data-source.js` 의 status-first source 패턴(평생학습·기관), `care-contracts.js` 의 link 검증(officialUrl / mapUrl)과 sanitize 패턴, 결과 dialog 패턴, Saved type(PROGRAM · PLACE), 전체 검색 provider 패턴(불러온 공공 항목만).
- 가족에게 보내기는 같은 preview 방식으로 — 연결 전에는 보내지 않는다.
- 남은 미확인: 운영 data route 의 키 설정과 live 검증(kr-lifelong-class, kr-kakao-place, kr-tourapi).

Mac 에서 확인
```
cd ~/Newon-ongil
node --test tests/ongil/*.test.mjs        # 221 pass
python3 -m http.server 8765               # http://localhost:8765/ongil-start/#family , #care
git status                                # ongil-start/ tests/ongil/ docs/ongil/ 만 변경
```
