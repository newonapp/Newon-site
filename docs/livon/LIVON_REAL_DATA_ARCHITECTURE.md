# LIVON Real Data Integration V1 — 실제 데이터 공급망

작성일: 2026-10-01 · 브랜치: `livon-real-data-v1` (기준 `livon-data-screens-v1` · `6f3a781e3`)
테스트: `tests/livon/real-data.test.mjs` (RD-1 ~ RD-20) · 픽스처: `tests/livon/fixtures/upstream-fixtures.mjs` (테스트 전용, 배포되지 않음)
도구: `node scripts/livon-provider-status.mjs` (provider별 실제 요청·집계) · `node scripts/livon-data-quality.mjs` (품질 검사)

> **상태 (2026-10-01):**
> - 8개 provider는 코드, 정규화, 화면 연결, 테스트가 **모두 준비**되었습니다.
> - **8개 모두 API 키가 있어야 실제 데이터를 받을 수 있습니다.** 공식 endpoint는 모두 살아 있고, 키 없이 부르면 400/401이나 "인증키…" 메시지를 돌려줍니다(2026-10-01 확인).
> - 이 작업 환경에서는 키도 없고 해당 호스트로 나가는 네트워크도 막혀 있어 **실제로 받은 외부 데이터는 0건**입니다.
> - 외부 데이터는 **없어도 되는 보강**입니다. 0건이어도 curated 530건과 모든 화면이 그대로 동작합니다.

## 1. 공급망 구조

```
공식 API (온통청년 · 기업마당 · 공공데이터포털 · 한국관광공사 · 고용24 · Kakao)
   │  키는 서버(Vercel) 환경변수에만 있음
   ▼
server/livon/data/providers/*.mjs     Provider: 고정 endpoint, 페이지 제한, 응답 파싱 (Raw Data)
   ▼
server/livon/data/http.mjs            /api/livon/data?provider=…  서버 캐시 · 오류 코드 · 공유 스키마 검증
   ▼  (브라우저)
livon/data/livon-data-core.js         real-data layer: provider별 로드(실패는 그 provider만) · 캐시 · 자체 dedupe
   ▼
livon/data/livon-data-platform.js     normalize*() → canonicalize() → 교차 출처 dedupe/우선순위 → 만료 · 신선도
   ▼
livon/data/livon-screen-data.js       LivonScreenData + LivonDataGate: 화면에 보일지 결정 (만료 / 출처 없음 / 하위 중복 → 숨김)
   ▼
Today · Explore · Life Stage · Home · Search · LIVON AI(server tools)
```

- 외부 응답을 UI에 그대로 넘기지 않습니다. 모든 행은 공유 스키마 검증(서버·브라우저)과 platform `canonicalize()`를 거칩니다.
- 기존 real-data layer의 화면 연결(Explore 장소·관광·직업훈련 카드, Life Stage `realData`, Today `forToday`, 통합검색 `searchEntries`)은 **그대로 재사용**합니다. 이번 작업은 그 앞에 Data Platform gate(`LivonDataGate`)를 추가했습니다.

## 2. Providers (감사 결과)

| Provider | 데이터 | 공식 출처 / endpoint | 인증 | 페이지 | 호출 한도 | 갱신 | 상태 |
|---|---|---|---|---|---|---|---|
| `kr-youth-policy` | 청년정책 | 온통청년 `youthcenter.go.kr/go/ythip/getPlcy` | `apiKeyNm` (`YOUTHCENTER_API_KEY`) | ≤20×100 | 발급처 정책 | 정책별 수정일 | CODE READY · 키 필요 |
| `kr-business-support` | 지원사업 공고 | 기업마당 `bizinfo.go.kr/uss/rss/bizinfoApi.do` | `crtfcKey` (`BIZINFO_API_KEY`) | ≤10×100 | 발급처 정책 | 공고 등록일만 | CODE READY · 키 필요 |
| `kr-business-event` | 행사 | 기업마당 `…/bizinfoEventApi.do` | `crtfcKey` (같은 키, 행사 API 별도 신청) | ≤10×100 | 발급처 정책 | 등록일 | CODE READY · 키 필요 |
| `kr-kakao-place` | 장소 (민간 플랫폼) | Kakao Local `dapi.kakao.com/v2/local/search/*` | `Authorization: KakaoAK` (`KAKAO_REST_API_KEY`) | ≤45건 | 일일 쿼터 | 조회 시점만 | CODE READY · 키 필요 |
| `kr-tourapi` | 관광지·문화시설·축제 | 한국관광공사 `apis.data.go.kr/B551011/KorService2` | `serviceKey` (`TOURAPI_SERVICE_KEY`) | ≤50×20 | 개발계정 1,000/일 | 콘텐츠 수정일 | CODE READY · 키 필요 (캐시 금지 정책) |
| `kr-lifelong-class` | 평생학습 강좌 | 공공데이터포털 `api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api` | `serviceKey` (`PUBLIC_DATA_SERVICE_KEY`) | ≤3×1000 | 개발계정 10,000/일 | 데이터 기준일 | CODE READY · 키 필요 |
| `kr-public-tax-expert` | 마을세무사 (공공 지정) | `apis.data.go.kr/3420000/…` · `api.odcloud.kr/api/15029613/…` | `serviceKey` (같은 키, API마다 활용신청) | source별 | 발급처 정책 | 기준일 | CODE READY · 키 필요 |
| `kr-job-training` | 국민내일배움카드 훈련과정 | 고용24 `work24.go.kr/cm/openApi/call/hr/callOpenApiSvcInfo310L01.do` | `authKey` (`WORK24_TRAINING_API_KEY`) | ≤50×50 | 미공개 | 조회 시점 | CODE READY · 키 필요 · **기업회원 + 심사** |

분류:

- **A. 키 없이 바로 연결 가능:** 0개
- **B. 무료 키 발급만 하면 가능:** 7개. 온통청년, 기업마당(지원사업·행사), Kakao, TourAPI, 평생학습, 마을세무사(공공데이터포털 활용신청 2건)
- **C. 추가 승인 필요:** 1개. 고용24(기업회원 가입과 담당자 심사)

유료 계약이 필요한 provider는 없습니다.

## 3. 출처 계층 (Source Priority)

`SOURCE_PRIORITY` (`livon-data-platform.js`): 같은 대상이 여러 출처에서 들어오면 점수가 높은 쪽이 남습니다. 점수가 같으면 출처 수정일이나 확인일이 최신인 쪽이 남습니다.

| sourceType | 뜻 | 점수 |
|---|---|---|
| `official` | 정부·지자체 공식 페이지 | 100 |
| `public_api` | 공공기관 공개 API/데이터셋 | 80 |
| `partner` | 직접 검증한 파트너 | 60 |
| `internal` | Newon 자체 서비스 | 50 |
| `editorial` | LIVON 편집 | 40 |
| `platform` | 민간 플랫폼 API (Kakao) — 공식 데이터로 표시하지 않음 | 30 |
| `user` / `fixture` | 사용자 기기 데이터 / 테스트 전용 | 10 / 0 |

브라우저 real-data layer에도 provider별 `priority`가 있습니다(온통청년 90, 기업마당 85, TourAPI 75, 평생학습 70, Kakao 60 등). 같은 순서입니다.

## 4. 정규화

`normalizeEvent / Place / Program / Class / Policy / Expert / Service / Content`(+ `normalizeRealDataEntity`)가 real-data 스키마를 LIVON canonical로 바꿉니다.

| 항목 | 규칙 |
|---|---|
| 정책 | 제목·요약·대상(`target`)·연령(공식 min/max가 있을 때만 `lifeStages`)·지역·지원 내용(`benefits`)·신청 기간(`applicationStart/End`)·신청 방법(`applyMethod`)·담당 기관(`agency`)·공식 링크·출처·마지막 확인일 |
| 행사 | 제목·설명·분류·시작/종료·장소·지역·좌표(실제 값만)·가격·공식 링크·이미지·출처·수집 시각 |
| 교육·프로그램 | 제목·운영 기관·분류·대상·지역·온/오프라인(공식 방식 문구가 있을 때만)·시작/종료·접수 마감·가격·공식 링크·출처 |
| 장소 | 이름·분류·주소·지역·좌표·공식 링크(지도 페이지는 공식 링크가 아님)·시설 전화·운영 시간·출처 |
| 전문가 | 공공기관이 지정하고 공개한 역할만 다룹니다(마을세무사). 연락처는 기관이 공개한 **업무 상담 번호**(`workPhone`)만 둡니다. 피드는 `partner_verified`가 될 수 없습니다. 그 밖의 전문가 프로필은 만들지 않고, 기존 빈 상태를 유지합니다. |
| 지역 | `서울특별시 → 서울` 같은 공식 긴 이름을 짧은 이름으로 통일합니다 |
| 날짜 | `YYYYMMDD`, `YYYY-MM-DD`, `YYYY.MM.DD`, ISO. 날짜만 있으면 한국 시간 하루 전체, 마감일은 23:59:59까지입니다. 시간대가 없는 일시는 KST로 봅니다. 잘못된 날짜는 null로 두고 경고합니다. |
| Life Stage | 공식 연령(min/max)으로만 정합니다. 예: 19–34 → 10·20·30대. 연령 정보가 없으면 어느 스테이지에도 넣지 않습니다. |
| Life Event | 공식 분류명으로만 정합니다(`CATEGORY_LIFE_EVENTS`: 창업→startup, 주거→independent·move, 일자리→first-job·job-change …). 자유 텍스트로 추측하지 않습니다. |

## 5. Provenance

모든 외부 행이 가지는 필드:

- `sourceName`, `sourceType`
- `sourceId`: `provider:원본 ID`
- `sourceUrl` / `officialUrl`: 있을 때만
- `retrievedAt`: LIVON이 가져온 시각
- `sourceUpdatedAt`: 출처가 스스로 밝힌 수정일
- `lastCheckedAt`: 사람이나 작업이 확인한 날
- `verificationStatus`

규칙:

- **추적 가능 조건:** 출처 링크가 있거나, **출처 이름과 원본 ID**가 있어야 합니다. 둘 다 없는 사실형 데이터는 `provenanceMissing`으로 두고 표시하지 않습니다.
- **공식 표시:** `official_source`("official")는 `official`이나 `public_api` 출처에만 붙습니다. Kakao(`platform`)는 `source_linked`입니다.
- **확인 시각:** 수집 시각(`retrievedAt`)은 확인으로 치지 않습니다.
- **curated 레코드:** 각 파일의 `checkedAt`을 `lastCheckedAt`으로 씁니다.

## 6. 신선도 (Freshness)

`freshnessStatus(e)` → `fresh | stale | expired | unknown`

- 기준일은 `max(lastCheckedAt, sourceUpdatedAt)`입니다. 기준일이 없으면 `unknown`입니다(Kakao처럼 조회 시각만 있는 경우).
- 만료(`expired`)는 다른 상태보다 우선합니다.

| 유형 | fresh 유지 기간 |
|---|---|
| 행사 | 7일 (자주 갱신) |
| 프로그램·클래스 | 14일 |
| 정책·지원사업 | 30일 (공식 업데이트 확인, 신청 기간 중심) |
| 전문가 | 90일 (검증일 필요) |
| 장소·기관·서비스 | 180일 |
| 콘텐츠 | 365일 |
| Life Stage / Life Event / 커뮤니티 | 해당 없음 (`unknown`) |

검색 결과에는 `freshness`, `sourceType`, `retrievedAt`, `lastCheckedAt`, `officialUrl`이 함께 들어갑니다. 화면 디자인은 그대로이고, 상세 화면에서 이 정보를 보여줄 수 있는 구조만 준비했습니다.

## 7. 만료 (Expiry Engine)

`effectiveEnd` + `lifecycleStatus`:

| 유형 | 만료 기준 |
|---|---|
| 행사 | 행사가 끝남 (`endDate`, 없으면 시작일) |
| 정책·지원사업 | 신청 마감 (`applicationEnd`, 없으면 `endDate`) |
| 프로그램·클래스 | 과정 종료 (`endDate`), 또는 **접수가 마감되고 이미 시작함** |
| 공고 전체 | `expiresAt` |

- 만료는 **삭제가 아닙니다.** 데이터는 남고, 추천·검색·Today·Explore·Life Stage·AI 참고 항목에서만 빠집니다(`includeExpired`로 운영 조회 가능).
- 날짜가 없는 일반 가이드는 만료되지 않습니다. 시간 개념이 있지만 날짜가 없는 curated 30건은 공식 포털과 일반 가이드입니다(§11). 날짜는 **추측하지 않았습니다.**

## 8. 중복 제거 (Dedupe)

두 단계로 이뤄집니다.

1. **real-data layer (`livon-data-core.js`, 기존):** 같은 provider와 같은 원본 ID면 최신 것만 남깁니다. 서로 다른 provider 사이에서는 같은 제목에 신호 2개 이상(기관·장소·날짜·URL, 장소는 전화·좌표 추가)이 맞아야 합칩니다. 사람은 이름만 같아서는 합치지 않습니다.
2. **Data Platform (`crossSourceDedupe`, 신규):** 아래 중 하나에 해당하면 같은 대상으로 봅니다.
   - 같은 `officialId`
   - 같은 **상세 공식 URL** (호스트+경로, 홈페이지 루트는 제외)
   - 같은 정규화 제목 + {시작일, 주소, 기관, 공식 URL, 좌표(≈100 m), 시설 전화} 중 **2개 이상**

   | 결과 | 처리 |
   |---|---|
   | 우선순위가 높은 행 | 남고, 다른 출처는 `alsoFrom`에 기록됩니다 |
   | 우선순위가 낮은 행 | `duplicateOf`로 숨겨집니다 (삭제하지 않음) |

   - **제목만 같으면 합치지 않습니다.**
   - curated끼리는 합치지 않습니다. 연령대별로 제목이 같은 LIVON 가이드 16건은 의도된 구성이라 그대로 유지합니다.
   - 같은 provider의 행끼리도 합치지 않습니다.

## 9. 캐시

| 위치 | 동작 |
|---|---|
| 서버 | `server/livon/data/cache.mjs`(기존): 메모리 캐시를 쓰고, `UPSTASH_*`가 설정되면 공유 캐시(Upstash)를 추가로 씁니다. **Upstash는 아직 연결되지 않았으므로 현재는 인스턴스별 메모리 캐시만 씁니다.** TTL: 정책 24시간, 행사 6시간, 전문가 7일, Kakao 1시간(위치 검색 5분), 평생학습 24시간, 고용24 목록 6시간·상세 24시간. 실패는 캐시하지 않습니다. TourAPI는 저작권 정책 때문에 캐시하지 않고, 같은 요청이 동시에 오면 한 번만 부릅니다. |
| 브라우저 | 같은 TTL로 localStorage에 저장하므로 화면을 열 때마다 외부 API를 부르지 않습니다. |
| stale-while-revalidate | 아직 없습니다. Upstash가 연결되면 서버 캐시 계층에 추가하는 것을 권장합니다. |

## 10. 장애 격리

| 위치 | 동작 |
|---|---|
| 서버 | provider마다 요청이 따로입니다. 오류는 고정 코드(`NOT_CONFIGURED` / `UPSTREAM_ERROR` / `TIMEOUT` / `UPSTREAM_LIMIT` / `INVALID_RESPONSE`)로 돌려줍니다. |
| 브라우저 | `loadProvider()`가 provider마다 `catch → []`로 끝납니다. `Promise.all`로 묶여 있어도 전체가 함께 실패하지 않습니다. |
| Data Platform | adapter 하나가 throw해도 `failed: true`만 표시하고 나머지를 불러옵니다. |

실제 브라우저 QA에서 키를 넣고 upstream이 모두 실패하게 했습니다. 7개 메뉴, Life Stage 주제, 검색이 모두 정상이었고 JS 오류는 0건이었습니다. provider 상태는 각각 `HTTP_5XX`로 기록됐습니다.

## 11. 화면 연결

| 화면 | 실제 데이터가 들어가는 곳 (디자인 변경 없음) |
|---|---|
| Today | `LivonData.forToday()`로 오늘 콘텐츠에 연결된 실제 행사·장소·클래스가 들어갑니다. `repository.getTodayFeed()`의 `byCategory.event/place/learn`에도 들어갑니다(규칙 기반, 끝났거나 30일 넘게 남은 항목 제외). 8개 섹션 구성은 그대로입니다. |
| Explore | 실제 정책·프로그램·장소·전문가가 같은 filter/search 체계에 들어갑니다. 장소, 관광, 직업훈련 카드는 기존 real-data 렌더링을 씁니다. |
| Life Stage | `forTopic()`으로 연령과 분류가 맞는 실제 정책·프로그램·장소·전문가가 주제 화면에 들어갑니다. 예: 20대 첫 독립 → 청년 월세 정책. 공식 연령이 없으면 억지로 배정하지 않습니다. |
| Search | `searchEntries()`로 통합검색에 들어갑니다. 만료·중복·출처 없는 행은 빠집니다. |
| Home | 같은 repository와 real-data layer를 거쳐 기존 카드에 연결됩니다. |
| LIVON AI | 서버 도구(`server/livon/ai/tools.mjs`)가 같은 platform을 씁니다. **현재는 curated 데이터만 씁니다.** 실제 데이터를 쓰려면 `loadCatalog({ adapters })`에 서버 provider 캐시를 `PublicDataAdapter`로 넘기면 됩니다(키 연결 후 단계). |

- 좌표가 있는 실제 행(TourAPI, Kakao)만 지도 대상입니다. 지도 UI를 가짜 데이터로 채우지 않습니다.
- **개인정보:** 공공 데이터에서는 서비스에 필요한 업무용 공개 정보만 남깁니다(시설 전화, 공공 지정 상담 번호). 개인 연락처와 식별 정보는 저장하지 않고, 원문 응답을 통째로 저장하지도 않습니다.

## 12. 필요한 API 키 (값은 Vercel 서버 환경변수에만)

| 환경변수 | 서비스 | 발급처 | 무료 | 필요한 이유 |
|---|---|---|---|---|
| `YOUTHCENTER_API_KEY` | 온통청년 청년정책 API | youthcenter.go.kr › 오픈API 신청 | 무료 | 청년 정책 (Life Stage 10–30대, 독립·취업) |
| `BIZINFO_API_KEY` | 기업마당 지원사업정보 + 행사정보 API | bizinfo.go.kr › 정책정보 개방 › API 사용신청 (행사 API 별도 신청) | 무료 | 창업·사업 지원 공고, 행사 |
| `PUBLIC_DATA_SERVICE_KEY` | 공공데이터포털 (평생학습강좌 표준데이터, 대구 동구·인천 마을세무사) | data.go.kr › 각 데이터 활용신청 | 무료 | 평생교육, 공공 세무 상담 |
| `TOURAPI_SERVICE_KEY` | 한국관광공사 국문 관광정보 (KorService2) | data.go.kr › 한국관광공사 국문 관광정보 서비스 활용신청 | 무료 (개발 1,000/일) | 문화·관광 장소·축제 |
| `KAKAO_REST_API_KEY` | Kakao Local | developers.kakao.com › 앱 생성 › REST API 키 (로컬 사용 설정) | 무료 쿼터 | 장소 검색·가까운 장소 (민간 플랫폼, 공식 표시 없음) |
| `WORK24_TRAINING_API_KEY` | 고용24 국민내일배움카드 훈련과정 | work24.go.kr › OPEN-API 신청 (기업회원·심사) | 무료 (승인 필요) | 직업훈련 (20대 취업, 60대+ 재취업) |

키를 넣은 뒤 `node --env-file=.env scripts/livon-provider-status.mjs`를 실행하면 provider별로 실제 요청과 집계(Fetched / Accepted / Rejected / Duplicate / Expired / Error)를 합니다. 키 값은 출력하지 않습니다.

## 13. 향후 Admin 연결

| 기능 | 준비된 것 |
|---|---|
| provider 상태 | `LivonScreenData.providerHealth()` → provider, status, lastSuccess, lastFailure, lastFetch, fetched, accepted, rejected, duplicates, expired, recordCount, errorType. 서버 쪽은 `createDataHandler().diagnostics()`(비운영 환경에서만). |
| 데이터 품질 | `scripts/livon-data-quality.mjs`: missing ID, duplicate ID, duplicate source ID, invalid URL, missing source, invalid date, end<start, expired, stale, orphan relation, invalid type, unsupported category, missing title, malformed coordinates, 날짜 없는 시간형 curated 목록 |
| 편집 흐름 | `createDraft → transition(review) → validateForPublish → transition(published)` (Data Platform V1). 만료나 중복 판정도 같은 필드를 씁니다. |
