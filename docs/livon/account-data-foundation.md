# LIVON 계정·데이터 영속화 기반 (Account & Data Persistence Foundation V1)

작성: 2026-09-29 · 기준: cloud 작업본 (HEAD 9955f3065 + JOB TRAINING V1 + REAL DATA PROVIDERS INTEGRATION & OPERATIONS V1)

> **2026-09-30 갱신 — Account Backend & Sync V1:** 이 기반 위에 서버 API(`/api/livon/userdata`), PostgreSQL 스키마, 동기화 엔진(`livon/data/livon-sync.js`), 로그인·동의 UI가 추가되었습니다. 아래 본문 중 "endpoint 없음", "라우팅 안 됨", "V1은 `SYNC_NOT_AVAILABLE`"은 **코드 기본값(설정 전 상태)**에 대한 설명으로 읽어 주세요. 설정이 없으면 지금도 그대로 익명 모드이고 API는 503으로 닫혀 있습니다. 현재 구조와 상태: `docs/newon/newon-plus-account-backend.md`.

LIVON 사용자 데이터는 지금까지 브라우저 `localStorage`에만 있었습니다. 이 문서는 나중에 Newon+ 계정으로 서버에 저장할 수 있도록 만든 **기반**을 설명합니다.

- **익명(local-first) 모드가 기본이자 V1의 유일한 동작 모드입니다.** 로그인을 요구하지 않고, 기능도 줄지 않습니다.
- **실제 로그인·DB·원격 endpoint는 만들지 않았습니다.** 가짜 로그인 UI, 가짜 계정, 샘플 프로필도 없습니다. 원격 adapter는 `configured:false`이며, 모든 호출이 네트워크 없이 실패합니다(fail-closed).
- 기존 localStorage 키와 JSON 구조는 그대로입니다. 새로 쓰는 키는 `livon.userData.meta.v1` 하나입니다.
- 기존 사용자 데이터는 삭제하거나 초기화하지 않습니다.
- 구현 파일:
  - `livon/data/livon-user-data.js` (repository · adapter · 분류 · 추적 · export/merge · 진단)
  - `server/livon/userdata/contract.mjs` (향후 sync API 검증 계약, 라우팅 안 됨)
  - 테스트: `tests/livon/account-data.test.mjs`

## 1. 현재 저장소 inventory

코드(`livon/*.js`)에서 찾은 모든 키입니다. 기계가 읽을 수 있는 원본은 `LivonUserData.INVENTORY`이고, 테스트가 코드의 모든 `livon.*` 키가 분류되어 있는지 확인합니다.

### 1-1. 구조화 저장소 (localStorage)

| 키 | 소유 (read/write) | schema / version | migration | PII 가능성 |
|---|---|---|---|---|
| `livon.mlStore.v1` | life-now-page.js (쓰기) · service-*.js, life-hub.js, today-feed.js, home-page.js (읽기/일부 쓰기) | 객체, `v:2` | v1→v2 additive (goal status, AI todo 우선순위·source, journal 분류, checklist item id) | 일정·메모·건강·돈·일기 |
| `livon.platform.v1` | livon-platform.js | 객체, 기본값 병합 | legacy saves(`livon.tdSaved`, `livon.lifeSavedLocal`) → `saves` 병합 | 표시 이름, 지역(시/도·시군구·동) |
| `livon.cmStore.v1` | community-page.js (`LivonCommunityRepo`) | 객체, `v:2` | v1→v2 (category·lifeStage, 커뮤니티 저장 → 공용 saves) | 닉네임·글·댓글·신고 |
| `livon.aiStore.v1` | ai-page.js | `{threads, settings}` | 로드 시 정규화 | AI 대화 전문, 개인화 설정 |
| `livon.lifeEventProgress.v1` | livon-platform.js | `{eventId: areas}` | – | – |
| `livon.lifeHub.checklist.v1` | life-hub.js | `{topicId: checked[]}` | – | – |
| `livon.life.v1` | life-app.js (**livon/index.html에서 로드하지 않음**) | 객체 | – | – |

### 1-2. 단일 값 키 (localStorage)

| 키 | 소유 | 값 |
|---|---|---|
| `livon.lifeStage` | life-page.js · platform | 연령대 문자열 |
| `livon.lifeInterests`, `livon.lifeSituations`, `livon.lifeGoals`, `livon.lifeEvents` | life-page.js · platform | 문자열 배열 |
| `livon.mlInterests` | life-now-page.js | 문자열 배열 |
| `livon.tdPrefs`, `livon.tdHidden` | today-feed.js / today-page.js | Today 취향·숨김 |
| `livon.exPrefRegion`, `livon.hmRegion` | explore-page.js / home-page.js | 시/도(·시군구) |
| `livon.today.recent.v1`, `livon.exRecent`, `livon.exViewed` | today-feed.js / explore-page.js | 최근 활동 |
| `livon.exCompare`, `livon.exTrackHistory`, `livon.exScroll`, `livon.today.tab`, `livon.lifeHub.saveAck`, `livon.lifeHub.lastHash` | 각 화면 | UI 상태 |
| `livon.tdSaved`, `livon.lifeSavedLocal`, `livon.exSaved`, `livon.cmJoined`, `livon.cmInterests` | legacy | 이전 저장 방식 (migration 원본) |
| `livon.data.v1:*` | livon-data-core.js | provider 응답 캐시 (TTL) |
| `livon.userData.meta.v1` | livon-user-data.js | sync metadata (신규) |

### 1-3. sessionStorage와 메모리

- **sessionStorage**
  - 화면 전달용: `livon.aiPrompt`, `livon.ai.prompt`(legacy), `livon.openLifeEvent`, `livon.mlGoto`, `livon.cmFeedScroll`
  - 서비스 초안·필터: `livon.studyPlanDraft`, `livon.majorCompare`, `livon.serviceFilters.*`, `livon.teenFilters.*`, `livon.serviceDraft.*`, `livon.youthDraft.*`
- **메모리**: LivonData repository session. Kakao·TourAPI·고용24의 이번 페이지 검색 결과입니다.

### 1-4. 요청하신 영역별 위치

| 영역 | 실제 저장 위치 |
|---|---|
| My Life 할 일 · 목표 · 기록 · 캘린더 | `livon.mlStore.v1`의 `todos`, `goals`, `journal`/`health`/`transactions`/`experiences`/`habits`, `events` |
| 예약 | 별도 저장 없음. `events` 중 `category: "예약"`만 있습니다(LIVON에는 예약 backend가 없음). |
| 공통 저장 (Today · Life Stage · Explore · 전문가 · 프로그램·직업훈련) | `livon.platform.v1.saves` (실데이터는 `ext:{provider}:{type}:{id}` + snapshot·provenance) |
| Life Stage 체크리스트 | `livon.lifeHub.checklist.v1`, `livon.mlStore.v1.checklists` |
| 관심사 | `livon.lifeInterests`, `livon.mlInterests`, `livon.aiStore.v1.settings.interests` |
| 최근 활동 | `livon.today.recent.v1`, `livon.exRecent`, `livon.exViewed`, `livon.platform.v1.recentSearches` |
| AI 기록 | `livon.aiStore.v1.threads` |
| AI → My Life 승인 | 승인된 항목만 `mlStore.todos`/`goals`에 `source: "livon-ai"`로 저장됩니다(미리보기 → 선택 → 승인). |
| Community | `livon.cmStore.v1` (글·댓글·반응·신고·참여·챌린지·초안·프로필) |

## 2. 데이터 분류

| 분류 | 뜻 | 대상 |
|---|---|---|
| `ACCOUNT_SYNC` | 나중에 계정에 둘 수 있는 사용자 소유 데이터 (사용자가 가져오기를 선택할 때만) | 할 일, 목표, 캘린더, 체크리스트, 습관(+기록), 프로젝트, 경험, 저장 항목·폴더, 알림 설정, 시/도·시군구, 연령대·관심사·상황·목표·Life Event 선택, Today 취향·숨김, 진행 체크 |
| `ACCOUNT_SYNC` + `sensitive` | 건강·돈·일기. **가져오기 기본값에서 제외**되고 사용자가 따로 선택해야 합니다. | `journal`, `transactions`, `budgets`, `health` |
| `DEVICE_LOCAL` | 이 기기에만 둡니다 | AI 대화·설정, 최근 활동, 최근 검색, 생성된 알림, 온보딩 플래그, 표시 이름·가족(계정이 소유할 영역), 동 단위 지역, UI 상태, sync metadata |
| `SESSION_ONLY` | 탭을 닫으면 사라집니다 | sessionStorage 전달값·초안·필터 |
| `SERVER_SOURCE_CACHE` | 사용자 데이터가 아닙니다 | `livon.data.v1:*`, 검색형 provider 세션 결과 |
| `COMMUNITY_LOCAL` | 향후 서버 Community와 별도 경계입니다 | `livon.cmStore.v1` 전체 |
| `LEGACY` | migration 읽기 전용입니다 | `livon.tdSaved`, `livon.lifeSavedLocal`, `livon.exSaved`, `livon.cmJoined`, `livon.cmInterests`, `livon.life.v1` |

## 3. Repository 구조

```
UI (My Life · Platform · Community · AI · services)
   └─ readJSON / writeJSON (각 파일의 기존 helper) ─→ LivonUserData.read / write
         ├─ LocalAdapter (localStorage)   ← 항상 사용 (local-first)
         ├─ change tracking               ← localRev, tombstone (livon.userData.meta.v1)
         └─ RemoteAdapter (contract)      ← V1: configured:false · fail-closed
```

- 점진 전환: My Life(`life-now-page.js`), Platform saves(`livon-platform.js`), Community(`community-page.js`), AI(`ai-page.js`), 서비스 도구(`service-details.js`의 `ui.read/write` → service-tools/teen/youth/family)가 repository를 거칩니다.
  - 키와 JSON은 그대로이고, repository가 없으면 예전처럼 직접 읽고 씁니다.
- 아직 직접 접근하는 곳: today-page/today-feed, explore-page/explore-search, life-hub, life-page, home-page의 **단일 값 키와 UI 상태**. 모두 분류는 되어 있고, 다음 단계에서 같은 helper로 옮깁니다.
- 기존 테스트 harness(My Life · Community · AI · Home · Life Stage · integration)가 repository를 로드한 상태로 360개 테스트를 모두 통과합니다.

### Anonymous / Account 모드

- `mode()`는 `authenticated` 세션과 `configured` 원격 adapter가 **둘 다** 있을 때만 `"account"`입니다. V1에서는 항상 `"anonymous"`입니다.
- `setAuthProvider(p)`: 향후 Newon+ 연동이 `{ getSession() → { userId, verified: true } }`를 넘깁니다.
  - 검증되지 않았거나 형식이 잘못된 세션은 익명으로 처리합니다.
  - userId는 UI 코드에 노출되지 않습니다(`auth()`는 `{status}`만 반환).
  - V1 코드는 이 함수를 호출하지 않습니다.
- userId는 localStorage, URL, 입력값에서 절대 읽지 않습니다.

### Remote adapter 계약 (vendor 중립)

| operation | 의미 |
|---|---|
| `get(collection, id)` | 한 레코드 |
| `list(collection, {sinceServerRev})` | 변경분 |
| `upsert(record)` / `batch(records ≤ 500)` | 쓰기 |
| `delete(collection, id, deletedAt)` | tombstone 쓰기 |
| `syncMeta()` | `{serverRev, lastSyncAt}` |

- 전송 형식: 같은 출처의 `/api/...` 경로에 `POST`, `Authorization: Bearer <세션 토큰>`, 본문은 `{op, payload}`입니다.
- 본문에 **userId가 없습니다**. 사용자는 서버가 세션으로 결정합니다.
- 보내기 전에 브라우저에서 같은 검증 규칙을 적용합니다. 잘못된 payload는 전송되지 않습니다.
- endpoint나 토큰 getter가 없으면 `configured:false`입니다. 모든 호출이 `REMOTE_NOT_CONFIGURED`로 실패하고 네트워크 요청은 0건입니다.

## 4. Sync 모델

레코드(`validateRecord`가 강제하는 필드만 허용):

```
{ id, collection, schemaVersion: 1, createdAt, updatedAt, deletedAt | null, localRev, serverRev?, data }
```

- **id**: 기존 id(`todo_…`, `ext:{provider}:{type}:{id}` 등)를 그대로 씁니다.
  - id가 없는 옛 항목은 내용 해시로 결정적인 id를 만듭니다(export 때만, 저장소에는 쓰지 않음).
  - 단일 값 키는 키 이름이 id입니다(`livon.lifeStage`).
- **createdAt / updatedAt**: 기존 필드를 씁니다. 없으면 export 시각입니다.
- **deletedAt(tombstone)**: 필요합니다. 기기에서 지운 항목이 계정 병합 때 되살아나지 않게 합니다.
  - repository를 거친 쓰기에서 사라진 id를 `livon.userData.meta.v1.tombstones`(최대 1000개)에 남깁니다.
  - 대상은 mlStore의 목록 10종과 platform saves입니다.
- **localRev**: 저장소별 쓰기 횟수입니다(`meta.stores[key].localRev`). **serverRev**는 서버가 부여합니다(향후).
- **deviceId**: `dv_…` 난수이며 개인정보가 아닙니다.
- CRDT는 쓰지 않습니다. 레코드 단위 병합과 유형별 정책(아래)만 씁니다.

## 5. Conflict 정책

무조건 마지막 쓰기가 이기는 방식(last-write-wins)은 쓰지 않습니다. `mergeCollection(local, remote, {lastSyncedAt})`:

| collection | 정책 |
|---|---|
| `saved_items` | stable id 기준 **합집합**. 같은 id면 더 최근 것을 남깁니다(snapshot·provenance 포함). |
| `save_folders` | 값 합집합 |
| `tasks`, `goals`, `checklists`, `habits`, `projects`, `journal`, `transactions`, `health_records`, `experiences` | 마지막 동기화 이후 한쪽만 바뀌었으면 그쪽을 씁니다. **양쪽 다 바뀌었으면** 원격이 원래 id에 남고, 로컬 버전은 `conflictOf`가 붙은 **복사본으로 보존**합니다(사용자가 정리). |
| `calendar_items` | record 규칙에 더해, 제목·날짜·시작 시각이 같은 **완전 중복**은 하나로 합칩니다. 다른 id는 `mergedIds`에 기록합니다. |
| AI 승인 (`data.source = "livon-ai"`, 미완료) | 같은 제목이면 하나로 합칩니다 (**idempotent**). 수동 할 일은 건드리지 않습니다. |
| `preferences`, `life_progress`, `budgets` | 더 최근 값을 쓰되, 값이 달랐다는 사실을 conflict로 보고합니다. |
| 삭제 | tombstone은 **삭제 이후 수정이 없을 때만** 이깁니다. 삭제 뒤에 수정이 있었으면 수정본을 남깁니다(`edit-after-delete`). |

사용자 데이터가 조용히 사라지는 경로는 없습니다(테스트 UD-10·11).

## 6. Migration

- `LivonUserData.migrate()`는 **additive · idempotent · non-destructive**입니다.
  - 자기 metadata 키(`livon.userData.meta.v1`) 하나만 씁니다. 다른 키는 한 바이트도 바꾸지 않습니다(테스트로 확인).
  - 다시 실행하면 변경 없음(`changed:false`)입니다.
  - 쓰기에 실패하면(용량 초과 등) 원본은 그대로 두고 `lastErrorCategory`만 기록합니다.
- 기존 저장소별 migration은 repository를 거쳐 그대로 동작합니다: mlStore v1→v2, cmStore v1→v2, platform legacy saves.
- **로그인 migration 기반**: `planLoginImport()`
  - 이 기기 데이터를 계정으로 가져올 때의 **개수만** 돌려줍니다.
  - `autoUpload:false`, `requiresUserChoice:true`, 민감 데이터는 기본 제외입니다.
  - 실제 선택 UI는 로그인이 생길 때 만듭니다. V1에서는 노출하지 않고, 자동 업로드도 없습니다.

## 7. 개인정보

- **계정 export에서 항상 빠지는 것**
  - AI 대화·설정, 최근 활동·최근 검색, 생성된 알림, 온보딩 플래그
  - Community 전체, 표시 이름·가족, **동 단위 지역**(시/도·시군구만)
  - provider 캐시, 세션 초안
- **키 이름으로 빠지는 것**: `nearby`, `origin`, `coords`, `position`, `token`, `authKey`, `serviceKey`, `apiKey`, `password`, `secret`, `raw`, `request*` 키는 레코드 어디에 있든 제거합니다.
  - 저장한 **장소 자체의 좌표**(공개 장소 정보)는 snapshot에 남습니다. 사용자 위치는 원래 어디에도 저장되지 않습니다.
- **민감 데이터**: 건강·돈·일기는 사용자가 명시적으로 선택할 때만 포함됩니다.
- **진단**: 레코드 개수, 버전, conflict 개수, 오류 분류만 기록합니다. 사용자 콘텐츠 원문은 없습니다.

## 8. 보안

향후 원격 API 계약 (`server/livon/userdata/contract.mjs`, 브라우저와 같은 검증 함수 사용):

- **사용자 식별**: 서버가 검증한 세션(`session.userId`, `verified: true`)만 씁니다. 본문이나 payload의 `userId`/`user`/`ownerId`는 **거부**합니다.
- **권한 경계**: 저장 행은 `(owner_id = session.userId, collection, record_id)`입니다. 요청이 다른 소유자를 지정할 방법이 없습니다.
- **입력 검증**
  - 알려진 collection만 허용하고, id는 안전한 문자·길이만 허용합니다. `schemaVersion`과 timestamp를 검사합니다.
  - 레코드 64KB, batch 500개/1MB 상한이 있습니다.
- **mass assignment 방지**: 허용 필드 외의 레코드 필드는 거부합니다.
- **prototype pollution 방지**: `__proto__`/`constructor`/`prototype` 키는 거부하고, 깊은 복사로 정리합니다.
- **safe text**: 제어 문자·양방향 제어 문자를 제거합니다.
- **endpoint**: `api/livon/userdata.mjs`가 있습니다(2026-09-30). 단, `LIVON_USERDATA_ENABLED=true` + DB + Newon+ 토큰 검증이 모두 설정되기 전에는 인증·DB 작업 전에 503으로 닫힙니다(테스트 UD-4/UD-18, AB-1). `contract.mjs`의 `ENDPOINT_ENABLED = false`는 코드 기본값입니다.

## 9. 향후 인증 연결

> 2026-09-29 Newon+ Auth Foundation V1: 1·2·3(브라우저 쪽 auth provider 연결)과 4(동의 계약)의 **기반 코드**가 생겼습니다.
> - 브라우저: `newon-auth/newon-auth.js` → `livon/data/livon-auth-bridge.js`가 `LivonUserData.setAuthProvider()`를 호출합니다. remote adapter는 붙이지 않습니다.
> - 서버: `server/newon/auth/verify.mjs`(검증, 비활성), `server/newon/auth/accounts.mjs`(account_refs 매핑).
> - 설정이 비어 있어 LIVON은 계속 익명 모드이며, 로그인해도 `mode()`는 `anonymous`입니다(endpoint 없음). 상세: `docs/newon/newon-plus-auth-foundation.md`.

1. Newon+ 인증 방식을 확정합니다. Newon+ Android 앱의 인증 backend는 이 저장소에서 **확인되지 않습니다(확인 필요)**.
2. 서버에서 Newon+ ID 토큰(OIDC/JWT)을 검증하는 함수를 만듭니다. 결과 `{userId, verified:true}`만 신뢰합니다.
3. 브라우저에서 `LivonUserData.setAuthProvider()`와 `setRemoteAdapter(createRemoteAdapter({endpoint, getAccessToken}))`를 연결합니다.
4. 첫 로그인 때 `planLoginImport()` 결과를 보여 주고, 사용자가 가져올 범위(민감 데이터 포함 여부)를 고릅니다. 그다음 `collectAccountRecords` → `batch`로 보냅니다.
5. 원격 변경분을 `list` → `mergeCollection` → 로컬 반영합니다. conflict 복사본은 My Life에서 사용자가 정리합니다.

## 10. Backend 비교

현재 구조: 사이트는 Vercel(`vercel.json`, `api/livon/*.mjs` serverless)이고, 레이트리밋 저장소로 Upstash Redis를 씁니다. 별도로 Newon HQ가 Firebase(Auth + Firestore, 프로젝트 `newon-hq`, 관리자 전용 규칙)를 씁니다. 아래 비교는 구조적 특성이며, **가격·한도는 계약 전에 공식 페이지에서 다시 확인해야 합니다.**

| 기준 | Vercel + Postgres 계열 (Marketplace Postgres 등) | Supabase (Postgres + Auth) | Firebase (Auth + Firestore) |
|---|---|---|---|
| 인증 호환 | 인증은 별도입니다. Newon+ 토큰을 서버 함수에서 검증하면 어떤 인증 방식과도 맞습니다. | 자체 Auth가 있습니다. 외부 인증(Newon+)을 쓰면 JWT 연동 설정이 필요합니다. | Firebase Auth와 가장 자연스럽습니다. Newon+가 Firebase Auth라면 유리합니다(HQ가 이미 사용). |
| 관계형 데이터 | 강함 (SQL, 제약조건, 트랜잭션) | 강함 (Postgres) | 문서형. 조인·트랜잭션 범위에 제약이 있습니다. |
| realtime 필요성 | V1 동기화는 요청/응답이면 충분합니다(필요 낮음). | 기본 제공 (필요 이상) | 기본 제공 (필요 이상) |
| 비용 구조 | DB 사용량 과금. 기존 Vercel과 한 곳에서 관리합니다. | 프로젝트 단위 요금제 | 읽기/쓰기 단위 과금. sync 패턴에 따라 변동이 큽니다. |
| vendor lock-in | 낮음 (표준 Postgres, SQL dump) | 중간 (Postgres 자체는 이식 가능, Auth·RLS 설정은 종속) | 높음 (Firestore 데이터 모델·규칙) |
| migration | SQL 마이그레이션 도구로 관리 | SQL 마이그레이션 + 대시보드 | 스키마가 없어 코드로 관리해야 합니다. |
| 보안 | 서버 함수가 owner 조건을 강제합니다 (위 contract). | RLS로 DB 단에서 강제 가능합니다. | Security Rules로 강제합니다. |
| Newon+ 통합 로그인 | 토큰 검증만 붙이면 됩니다. 인증 vendor와 저장소가 분리됩니다. | Newon+를 Supabase Auth로 옮기거나 외부 JWT를 연동해야 합니다. | Newon+가 Firebase Auth면 가장 짧습니다. 아니면 custom token이 필요합니다. |

## 11. 권장 구조

- **권장: 인증은 Newon+가 정한 방식 그대로 쓰고, LIVON 데이터는 Vercel 서버 함수 + Postgres에 저장합니다.**
  - LIVON 데이터는 관계형입니다(할 일↔목표, 저장 항목↔폴더, 사용자별 조회·중복 방지).
  - 기존 Vercel serverless 구조와 같은 곳에 둘 수 있습니다.
  - 인증 vendor와 저장소를 분리하면 lock-in이 가장 낮습니다.
- Newon+가 Firebase Auth로 확인되면: 서버에서 Firebase ID 토큰을 검증하고, 저장은 여전히 Postgres가 적합합니다. Firestore는 쿼리·트랜잭션 제약과 과금 변동 때문에 LIVON sync 저장소로는 차선입니다.
- Supabase는 인증과 DB를 한 번에 새로 시작할 때 유리합니다. 이미 Newon+ 계정이 있으므로 이점이 줄어듭니다.
- **이번 작업에서는 어떤 서비스에도 가입·설치·결제하지 않았고, DB도 만들지 않았습니다.**

## 12. DB schema 초안

모든 것을 JSON 한 덩어리로 두지도 않고, 테이블을 과도하게 쪼개지도 않았습니다. 조회·중복 방지가 필요한 것은 테이블로, 형태가 자주 바뀌는 세부 항목은 `data jsonb`로 둡니다.

```sql
-- 외부 계정 참조 (Newon+ subject). 프로필·비밀번호는 저장하지 않음
create table account_refs (
  id uuid primary key default gen_random_uuid(),
  issuer text not null,                  -- 검증된 토큰의 iss (예: https://securetoken.google.com/<firebase-project-id>)
  subject text not null,                 -- 검증된 토큰의 sub (Firebase uid는 발급 project 안에서만 유일)
  created_at timestamptz not null default now(),
  unique (issuer, subject)
);

-- 공통 레코드 (tasks, goals, checklists, habits, projects, experiences, journal, transactions, health_records, budgets, life_progress)
create table user_records (
  owner_id uuid not null references account_refs(id) on delete cascade,
  collection text not null check (collection in ('tasks','goals','checklists','habits','projects','experiences','journal','transactions','health_records','budgets','life_progress')),
  record_id text not null,
  schema_version int not null,
  data jsonb,                             -- deleted면 null
  sensitive boolean not null default false,
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz,   -- tombstone
  server_rev bigint not null, device_rev int not null default 0,
  primary key (owner_id, collection, record_id)
);
create index on user_records (owner_id, server_rev);

-- 캘린더: 중복 방지를 위해 날짜/시각을 컬럼으로
create table calendar_items (
  owner_id uuid not null references account_refs(id) on delete cascade,
  record_id text not null,
  title text not null, date date not null, start_time text, all_day boolean not null default false,
  data jsonb, created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz, server_rev bigint not null,
  primary key (owner_id, record_id)
);
create index on calendar_items (owner_id, date);

-- 저장 항목: provider snapshot + provenance를 원본 그대로 보존
create table saved_items (
  owner_id uuid not null references account_refs(id) on delete cascade,
  record_id text not null,               -- 예: ext:kr-job-training:program:AIG…
  item_type text not null, folder text, title text not null,
  provider text,                          -- ext 저장일 때
  snapshot jsonb,                         -- 저장 당시 정보 (provider가 나중에 삭제해도 유지)
  saved_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz, server_rev bigint not null,
  primary key (owner_id, record_id)
);

-- 설정·선택 (연령대, 관심사, 알림 설정, 시/도·시군구, 폴더 목록 …)
create table preferences (
  owner_id uuid not null references account_refs(id) on delete cascade,
  pref_id text not null, value jsonb not null,
  updated_at timestamptz not null, server_rev bigint not null,
  primary key (owner_id, pref_id)
);

-- 기기별 동기화 상태 (콘텐츠 없음)
create table sync_metadata (
  owner_id uuid not null references account_refs(id) on delete cascade,
  device_id text not null,
  last_sync_at timestamptz, last_server_rev bigint not null default 0, schema_version int not null,
  conflict_count int not null default 0, last_error_category text,
  primary key (owner_id, device_id)
);
```

- `tasks`/`goals`를 별도 테이블로 두지 않은 이유: 지금 코드의 할 일·목표 필드가 자주 바뀌고, 필요한 질의가 소유자별 변경분 조회뿐이기 때문입니다. 할 일↔목표 연결(`goalId`)은 `data`에 둡니다.
  - 필요해지면 `user_records`에서 분리하는 migration으로 충분합니다.
- Community(글·댓글·반응·신고)는 공개 콘텐츠와 모더레이션이 필요한 **별도 서비스**입니다. 이 schema에 넣지 않습니다.

## 13. Newon+ 통합 경로

1. Newon+ 인증 방식 확인 (토큰 형식, 발급자, 검증 키)
2. 서버: 토큰 검증(서명·`aud`·`iss`·`exp`) → `(issuer, subject)`로 `account_refs` 조회·생성 → `session = {verified, issuer, subject, accountId}` → `contract.mjs`의 `prepareSyncRequest(body, session, {allowedIssuers})` → DB. 허용되지 않은 issuer(다른 앱의 Firebase project) 토큰은 거부합니다. 인증 구조 조사 결과는 `docs/newon/auth-architecture.md`를 봅니다.
3. 운영 준비가 끝나면 `ENDPOINT_ENABLED`를 켜고 `api/livon/userdata.mjs`를 추가합니다(인증 없이는 추가하지 않음).
4. 브라우저: 로그인 연결 → 첫 로그인 가져오기 선택 UI(`planLoginImport`) → 사용자 승인 후 업로드
5. 이후: 앱 시작 시 `list(sinceServerRev)` → `mergeCollection` → 로컬 반영, 로컬 변경은 `batch`

### 13-1. Auth Foundation V1 이후 남은 일

- 1(인증 방식)과 2(검증·매핑)는 코드 계약이 준비됐습니다. Newon+ 프로젝트 생성과 검증기 설치는 [TODO]입니다.
- 4(동의): `LivonAuthBridge.offerImport()` → 사용자 선택 → `approveImport({includeSensitive})`. V1은 `SYNC_NOT_AVAILABLE`(업로드 0)을 반환합니다.
- 3·5는 DB와 route가 생긴 뒤에 진행합니다.

## 14. 진단

`LivonUserData.diagnostics()`가 돌려주는 값:

- `mode`, `remoteConfigured`, `migrationVersion`
- `recordCounts`(collection별 개수), `tombstones` 개수, `lastSync`, `conflictCount`, `lastErrorCategory`

사용자 콘텐츠 원문, 제목, id 목록은 포함하지 않습니다. 화면에 노출하지 않습니다.
