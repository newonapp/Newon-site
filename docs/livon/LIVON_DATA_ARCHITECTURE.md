# LIVON Data Platform V1 — 데이터 아키텍처

작성일: 2026-09-30 · 브랜치: `livon-data-ai-v1` (기준 `07adb5275`, Production Anonymous V1)
코드: `livon/data/livon-data-platform.js` · 테스트: `tests/livon/data-platform.test.mjs` (D-1 ~ D-10)

> **상태:** 코드와 테스트는 준비되었습니다. 이번 단계는 **추가만** 한 것이라 기존 화면(Home · Life Stage · Today · Explore · Community · My Life · AI)은 여전히 자기 데이터 파일을 직접 읽습니다. 화면별 전환은 다음 단계에서 하나씩 진행합니다.

## 1. 구조

```
External / Public Data          Curated LIVON files            Partner (향후)      LIVON Admin/DB (향후)
(공공데이터포털·온통청년·기업마당   (life-topics.json, life-data,  PartnerAdapter      InternalAdapter
 고용24·TourAPI·Kakao Local)      life-events, today, explore,
 └ /api/livon/data (서버, 키 보관)   community)
        │ PublicDataAdapter          │ StaticAdapter
        └──────────────┬─────────────┘
                 normalize*()  → canonicalize()  (정제 · 검증 · 출처 · 상태)
                       │
                 Repository  (createRepository)
       ┌───────────┬──────────┼───────────┬──────────┬──────────────┐
      Home     Life Stage    Today      Explore     Search     LIVON AI (server/livon/ai/tools.mjs)
                       │
                My Life (local-first, 사용자 승인 후에만 저장)
                       │
             향후 NEWON+ · Booking · Partner · App
```

- 같은 파일이 브라우저(`window.LivonDataPlatform`)와 Node(`globalThis.LivonDataPlatform`)에서 그대로 동작합니다. AI 서버도 이 파일을 불러 씁니다.
- 파일 안에는 키·토큰·엔드포인트가 없고, storage나 DOM도 쓰지 않습니다(테스트로 확인).
- 브라우저에서는 `LivonDataPlatform.shared()`를 부를 때 처음 만들어집니다. 그 전에는 아무 일도 하지 않고, 네트워크 요청도 새로 만들지 않습니다.

## 2. Entities (12)

| type | 한글 | V1 데이터 원천 | 비고 |
|---|---|---|---|
| `content` | 콘텐츠 | Life Stage 주제 228개(`topic:`), Today 가이드·에디토리얼(`td:`) | `contentKind`: topic / guide / editorial |
| `lifeStage` | 라이프 스테이지 | 10대 ~ 70대+ 7개(`stage:`) | `ageMin/ageMax`, 대표 주제 연결 |
| `lifeEvent` | 라이프 이벤트 | 34개(`le:`) | checklist · needs · situations |
| `place` | 장소 | Today 장소, Explore 장소, (공공) Kakao/TourAPI | `officialUrl`에 지도 페이지는 넣지 않음 |
| `event` | 행사 | (공공) 기업마당 행사 | 시작일 없으면 거부. Today의 "행사 찾는 법"은 날짜가 없는 **가이드**라 `content`로 둠 |
| `program` | 프로그램 | Explore 프로그램, Today 배움, (공공) 평생학습·직업훈련 | 신청 기간 → 만료 처리 |
| `policy` | 정책·지원 | 공식 포털 17개(`pol:`), (공공) 온통청년·기업마당 | 공식 URL 없으면 거부 |
| `expert` | 전문가 | (공공) 마을세무사만 | 큐레이션 파일로 전문가 프로필을 만들지 않음 |
| `provider` | 기관·제공자 | Explore "전문가" 항목(고용24 등 공식 기관) + Explore 제공 기관 | `providerKind: institution` |
| `service` | 서비스 | 서비스 유형 38개(`svc:`), 스테이지별 도구(`tool:`), Explore 서비스 | booking 필드만 준비 |
| `class` | 클래스 | Today 체험, (향후) 파트너 클래스 | |
| `communityContent` | 커뮤니티 | 커뮤니티 21개(`cm:`), 챌린지 5개(`ch:`) | 설명만 있음. 게시글은 기기에만 저장(서버 없음) |

### 공통 Base Entity

`id, type, title, summary, description, category, subCategory, tags, domains, targetAges{min,max}, lifeStages, lifeEvents, location{address,city,district}, region, coordinates{lat,lng}, online, price{amount,currency,label}, priceType, startDate, endDate, applicationStart, applicationEnd, image, sourceName, sourceType, sourceUrl, officialUrl, bookingUrl, bookingType, availabilityType, providerId, verificationStatus, verified, status, publishedAt, updatedAt, retrievedAt, expiresAt, href, relations{…Ids}, sample, provenanceMissing, meta{}`

### Entity별 필드 (`TYPE_FIELDS`)

| type | 추가 필드 |
|---|---|
| content | contentKind, body, checklist, points |
| lifeStage | label, heroTitle, focus, ageMin, ageMax |
| lifeEvent | situation, checklist, needs, situations |
| place | placeType, openingHours, indoorOutdoor, address, facilities |
| event | organizer, venue, eventStatus |
| program | organizer, eligibility, format, duration, audience |
| policy | agency, eligibility, benefits, jurisdiction, policyKind, periodText |
| expert | name, organization, trustLevel, role, specialties, consultationMethods |
| provider | providerKind, audience, offers |
| service | serviceGroup, audience, forWhom, process, prepare, features |
| class | organizer, difficulty, duration, format, capacity |
| communityContent | communityKind, interest, join, days |

- 필드 값은 모두 정제됩니다. 태그·script 제거, 제어·bidi 문자 제거, http(s)만 허용, 자격증명이 들어간 URL 거부, 날짜 형식 검사, 좌표 범위 검사.
- 없는 값은 `null`로 둡니다. 카드를 채우려고 값을 만들어 넣지 않습니다.
- **Booking 준비:** `bookingType`(none / external / inquiry / partner), `bookingUrl`, `availabilityType`(always / scheduled / on_request / unknown) 필드만 있습니다. 예약 DB·결제·정산은 없습니다.

## 3. Relationships

- **명시적 관계:** `relations.{topicIds, lifeEventIds, contentIds, placeIds, policyIds, serviceIds, classIds, programIds, expertIds, providerIds, communityIds, eventIds}`
  - 출처: `life-topics.json`의 `related*Ids`, Today의 `lifeTopicIds / exploreIds / serviceIds / policyIds`, 서비스 유형의 `relatedExploreIds / relatedToolIds`
  - Repository가 역방향 인덱스를 만들므로 양방향으로 찾을 수 있습니다.
- **추론 관계 (규칙):**
  - Life Event ↔ 주제: 같은 스테이지이고 주제 제목·분류에 이벤트 이름이 들어 있으면 연결합니다(`meta.topicLinks = "inferred"`).
  - 예: 20대 → 독립 → 첫 독립 준비 · 독립 예산 만들기 · 이사 준비 · 독립 후 생활비 관리
- **`getLifeStageGraph(stage)`:** LifeStage → LifeEvents → (주제 → 정책·서비스·콘텐츠·장소·클래스) + 관심사가 같은 커뮤니티
  - 연결된 항목이 없는 칸은 이벤트 이름으로 검색해서 채우고, `via: "search"`로 표시합니다.
- **`getRelatedItems(id)`:** 명시적 링크(+10), 같은 Life Event(+4), 태그(+2씩, 최대 3), 도메인(+1씩, 최대 2), 스테이지(+1), 같은 분류(+2). 이유(`reasons`)를 함께 돌려줍니다.
- 알 수 없는 id는 연결하지 않습니다. 현재 파일 기준 명시적 링크의 85% 이상이 실제 항목으로 연결됩니다(D-1 테스트).

## 4. Repository

`createRepository({ adapters, now, includeSamples })` → `load()` 한 번 뒤로는 동기 API입니다.

| 메서드 | 설명 |
|---|---|
| `getContents / getLifeStages / getLifeEvents / getPlaces / getEvents / getPrograms / getPolicies / getExperts / getProviders / getServices / getClasses / getCommunityContents (filters)` | 타입별 목록 (공통 필터 적용) |
| `getById(id, {any})` | 보이는 항목만. `any:true`는 운영·테스트용 |
| `search(query, filters)` | 통합 검색 (§7) |
| `explore(filters)` | Explore용 목록 + facets (type / domain / region / priceType) |
| `getRelatedItems(id, opts)` · `getLifeEventContext(idOrQuery)` · `getLifeStageGraph(stage)` | 관계 |
| `getTodayFeed({region, interests, lifeStage, date})` · `getRecommendations(ctx)` | 규칙 기반 추천 (§8) |
| `report()` | adapter별 accepted / rejected / duplicates / warnings / failed |

- `load()`는 실패하지 않습니다. 한 adapter가 throw나 reject를 해도 그 adapter만 `failed:true`가 되고 나머지는 정상적으로 불러옵니다(D-9).
- id가 겹치면 먼저 불러온 adapter의 항목을 씁니다. 큐레이션 데이터를 외부 데이터가 덮어쓰지 못하게 하기 위해서입니다.
- 공통 필터: `type/types, category(도메인 id 또는 분류), tags, region(+nationwide), lifeStage(+strictLifeStage), lifeEvent, priceType, online, verified, date, target`

## 5. Adapters

| Adapter | 상태 | 설명 |
|---|---|---|
| `StaticAdapter({lifeTopics})` | **사용 중** | 사이트에 이미 있는 파일을 그대로 읽습니다. 530개 항목, 거부 0건, 경고 0건 |
| `PublicDataAdapter({entities\|load})` | 준비됨 | 브라우저에서는 기존 real-data layer(`LivonData.repository`, 서버 `/api/livon/data` 경유)를 읽습니다. provider 키가 없으면 `[]`. 테스트는 fixture로 검증했습니다 |
| `PartnerAdapter({load})` | 계약만 | 입점 파트너 피드가 생기기 전까지 `[]`, `status().planned = true` |
| `InternalAdapter({records\|load})` | 계약만 | 향후 Admin/DB. V1에서는 호스트가 넘겨주는 레코드만 받습니다 |

Adapter 계약은 `{ id, kind, sourceType, status(), load(ctx) → Promise<raw[]> }`입니다.

새 공급원(서울 열린데이터, 문화·관광 API, 지도 API 등)은 서버 provider(`server/livon/data/providers/*`)를 추가한 뒤, `PublicDataAdapter` + `normalize*()`로 들어옵니다. 키는 항상 서버에만 둡니다.

## 6. Normalization / Provenance / Status

- **`normalizeEvent / Place / Program / Class / Policy / Expert / Service / Content`**
  - real-data layer 스키마(`source.providerName`, `schedule.startAt`, `location.latitude`…)와 느슨한 외부 형식을 모두 LIVON canonical 입력으로 바꿉니다.
  - 지도 페이지는 `sourceUrl`로만 두고 `officialUrl`에는 넣지 않습니다.
  - 데이터 피드가 전문가를 `partner_verified`로 만들 수 없습니다.
- **`sourceType`:** `official · public_api · partner · editorial · internal · user · fixture`
  - Newon 자체 서비스 링크(`/ongil-start/…`)는 `internal`로 둡니다. 공식 외부 페이지로 취급하지 않습니다.
- **`verificationStatus`:** `unverified · editorial · source_linked · official_source · partner_verified · needs_review`
  - `verified = official_source || partner_verified`이고, 샘플은 절대 verified가 되지 않습니다.
  - 링크 없이 "official"이라고 할 수 없고, `partner`가 아닌 원천은 `partner_verified`가 될 수 없습니다.
- **출처 규칙:**
  - `sourceName`이 없으면 거부합니다.
  - 정책은 공식 URL이 없으면 거부합니다.
  - 사실형 타입(place, event, program, policy, expert, provider, class, service)이 editorial / internal / user / fixture가 아닌데 링크가 없으면 `provenanceMissing:true`, `unverified`로 두고 **기본 결과에서 뺍니다**(D-10). 운영 화면은 `includeUnsourced:true`로 볼 수 있습니다.
  - `retrievedAt · updatedAt · expiresAt`을 보관합니다.
- **샘플:** `sourceType:"fixture"` → `sample:true` → `includeSamples` 없이는 보이지 않고, 게시할 수도 없습니다. 테스트 fixture는 `tests/livon/fixtures/`에만 있으며, 이 폴더는 배포되지 않습니다.
- **상태:** `draft → review → published → expired / archived`
  - 허용 전이: draft→review/archived, review→draft/published/archived, published→expired/archived/review, expired→archived/review, archived→draft
  - `createDraft`, `validateForPublish`(요약·출처·샘플·이미 만료 검사), `transition`(원본은 바꾸지 않음)이 Admin의 기반입니다. Admin UI는 다음 단계입니다.

## 7. Search V1

- 인덱스 하나로 모든 entity 타입을 검색합니다. 결과마다 `type, typeLabel, title, summary, href, sourceName, verificationStatus, score, matched`가 들어 있습니다.
- **필드 가중치:** title 6, tags 3, category 2, summary 1.5, subCategory 1, sourceName 1, description 0.5, 기타(기관·지역·체크리스트) 0.8
- **단어 시작 일치:** "이사"는 "이사준비"와는 맞고 "아이사랑"과는 맞지 않습니다. 단어 중간 일치는 3글자 이상 토큰일 때만, 절반 가중치로 셉니다.
- 모든 토큰이 맞는 결과를 먼저 찾고, 없으면 하나라도 맞는 결과를 돌려줍니다. 작은 동의어 표(이사↔독립·자취·주거 등)는 0.5 가중치입니다.
- 예: "이사" → 라이프 이벤트 "이사", 콘텐츠 "이사 준비 체크리스트", 서비스 "이사·입주 청소", 정책 포털 …
  - 전문가·장소는 해당 데이터가 들어오면 같은 결과에 함께 나옵니다.
- 현재 규모(약 530건)에서는 메모리 스캔으로 충분합니다. 수만 건이 되면 §10의 서버 검색으로 바꿉니다.

## 8. Recommendation (rule-based — AI 아님)

- **`getTodayFeed({region, interests, lifeStage, date, perCategory, limit})`** → `{ method:"rule-based", season, items[{entity, score, reasons}], byCategory{place, experience, learn, together, season, life, editorial, event} }`
  - 점수:
    - 지역 일치 +3, 전국·온라인 +1, 다른 지역 −3
    - 관심사 태그 +2씩(최대 3)
    - 스테이지 +2
    - 계절(한국 시간 기준) +2
    - featured +1
    - 14일 안의 일정 +2
  - 날짜가 있는 공공 행사·클래스·프로그램은 30일 안에 시작하고 아직 끝나지 않았을 때만 Today에 들어옵니다.
  - Today 8개 섹션(장소 · 체험 · 배움 · 함께 · 계절 · 일상 · 이야기 · 행사)의 구조와 UI는 그대로입니다.
- **`getRecommendations(ctx)`:** verified, featured, 스테이지, 관심사, 지역 규칙으로 점수를 매깁니다. `method:"rule-based"`

## 9. Expiry

- `effectiveEnd(e) = expiresAt || (시간 제한 타입: applicationEnd || endDate || 행사 startDate)`
- `lifecycleStatus`는 게시된 항목이라도 이 날짜가 지나면 `expired`로 봅니다. 저장된 상태값은 바꾸지 않습니다.
- 만료된 항목은 검색·Explore·Today·관계·AI 참고 항목 어디에도 나오지 않습니다. `includeExpired:true`는 운영용입니다(D-3).
- 날짜만 있는 값은 한국 시간 하루 전체로 봅니다. 마감일은 23:59:59까지입니다.

## 10. 향후 DB 이전

1. `InternalAdapter`의 `load`를 REST(`/api/livon/content?updatedSince=…`)나 DB 쿼리로 바꿉니다. 스키마는 `canonicalize()` 출력 그대로 저장합니다(JSON 컬럼 + 인덱스: type, status, region, lifeStages, expiresAt).
2. Admin은 `createDraft → transition(review) → validateForPublish → transition(published)` 흐름을 그대로 서버에서 실행합니다.
3. 검색을 서버로 옮길 때는 같은 `search(query, filters)` 계약을 `/api/livon/search`로 노출하고, 브라우저 Repository가 그 결과를 받게 합니다. UI 코드는 바꾸지 않습니다.
4. 화면 전환 순서(권장): Today(`getTodayFeed`) → Explore(`explore`) → Life Stage(`getLifeStageGraph`) → 통합 검색(`search`). 한 화면씩 진행하며 디자인은 그대로 둡니다.
