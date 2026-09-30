# LIVON 실제 데이터 공급자 (Real Data Layer)

갱신: 2026-09-29 · 기준: Integration & Operations V1 (clean 작업본, HEAD 9955f3065 + JOB TRAINING V1)

## 현재 구현 요약

- 서버 route `/api/livon/data`에 **8개 provider**가 연결되어 있습니다. 키는 서버 환경변수에만 있고 브라우저는 정규화된 엔티티만 받습니다.
- **실제 API 호출 검증(LIVE VERIFIED)을 마친 provider는 없습니다.** 아래의 "검증"은 모두 코드·fixture(문서에 적힌 필드로 만든 [QA 픽스처]) 기준입니다.
- 사실 정보의 기준 파일은 `server/livon/data/manifest.mjs`입니다. 테스트가 manifest, route allowlist, adapter, `.env.example`, 브라우저 registry의 일치를 확인합니다.
- PUBLIC LAW EXPERT(마을변호사)는 이 작업본에 없습니다. 상태는 **BLOCKED: OFFICIAL SOURCE DOWNLOAD REQUIRED**입니다.

### Provider 표

| id | 엔티티 | 출처 기관 | 출처 종류 | env | 방식 | 필터 | 상세 | 캐시 | 날짜 의미 |
|---|---|---|---|---|---|---|---|---|---|
| `kr-youth-policy` | policy | 한국고용정보원 (온통청년) | 공공 | `YOUTHCENTER_API_KEY` | 목록 창 (≤20×100) | – | – | 24시간 | 최종수정일 = 출처 업데이트, 최초등록일 = 공고 등록 |
| `kr-business-support` | policy | 중소벤처기업부 (기업마당) | 공공 | `BIZINFO_API_KEY` | 목록 창 (≤10×100) | 분야·지역 | – | 24시간 (필터별) | 공고 등록일만 |
| `kr-business-event` | event | 중소벤처기업부 (기업마당) | 공공 | `BIZINFO_API_KEY` | 목록 창 (≤10×100) | 분야·지역 | – | 6시간 (필터별) | 등록일만 |
| `kr-kakao-place` | place | 카카오 (Kakao Local) | **민간 플랫폼** | `KAKAO_REST_API_KEY` | 사용자 검색 시 | 검색어·카테고리·내 위치(POST)·정렬 | – | 검색어 1시간 / 위치 5분(인스턴스 메모리) | 없음 (LIVON 수집 시각만) |
| `kr-tourapi` | place | 한국관광공사 | 공공 | `TOURAPI_SERVICE_KEY` | 사용자 검색 시 | 검색어·지역·유형·내 위치(POST) | 있음 (+사진) | **없음** (저작권 정책), 동시 요청만 합침 | modifiedtime = 출처 업데이트 |
| `kr-lifelong-class` | program | 교육부·지자체/교육청 (공공데이터포털) | 공공 | `PUBLIC_DATA_SERVICE_KEY` | 목록 창 (≤3×1000) + 서버 필터 | 검색어·지역·방식·접수중 | – | 24시간 (창 1개) | 데이터 기준일 |
| `kr-public-tax-expert` | expert | 대구 동구·인천 (공공데이터포털) | 공공 | `PUBLIC_DATA_SERVICE_KEY` | source별 목록 + 서버 필터 | 지역·검색어 | – | 7일 (일부 source 실패 시 1시간) | 데이터 기준일/수정일 |
| `kr-job-training` | program | 한국고용정보원 (고용24) | 공공 | `WORK24_TRAINING_API_KEY` | 사용자 검색 시 | 과정명·기관명·지역·훈련구분·훈련유형·시작일 범위 | 있음 | 목록 6시간 / 상세 24시간 | 없음 (LIVON 수집 시각만) |

### 환경변수 (서버 전용)

| env | 쓰는 provider | 발급처 |
|---|---|---|
| `YOUTHCENTER_API_KEY` | kr-youth-policy | 온통청년 오픈API |
| `BIZINFO_API_KEY` | kr-business-support, kr-business-event | 기업마당 (API별 사용신청 확인) |
| `KAKAO_REST_API_KEY` | kr-kakao-place | Kakao Developers |
| `TOURAPI_SERVICE_KEY` | kr-tourapi | 공공데이터포털 (한국관광공사 국문 관광정보) |
| `PUBLIC_DATA_SERVICE_KEY` | kr-lifelong-class, kr-public-tax-expert | 공공데이터포털 (API마다 활용신청) |
| `WORK24_TRAINING_API_KEY` | kr-job-training | 고용24 OPEN-API (기업회원, 심사) |
| `LIVON_DATA_DIAGNOSTICS` | (선택) 진단 출력 | `1`이면 production이 아닌 환경에서만 `?action=diagnostics` 허용 |

- 키가 없거나 8자 미만이면 `configured=false`입니다. upstream 호출은 0회이고 화면은 기존 LIVON 그대로입니다. 샘플 데이터는 보여 주지 않습니다.
- 브라우저 파일과 빌드 결과(`_publish`)에는 키 이름·키 값·upstream 인증 파라미터가 없습니다(테스트로 확인).

### 공통 운영 규칙

- **상태(운영용)**: `unconfigured`, `configured`(아직 요청 없음), `available`, `temporarily_failed`(timeout·네트워크·5xx), `rate_limited`(호출 한도), `invalid_response`(파싱 실패·스키마 불일치), `rejected`(인증·요청 거부 4xx).
  - 사용자에게는 고정 코드(`NOT_CONFIGURED`, `TIMEOUT`, `UPSTREAM_ERROR`, `UPSTREAM_LIMIT`)와 짧은 한국어 문구만 보냅니다. upstream 원문, 키, stack trace는 응답과 로그에 남지 않습니다.
- **오류 격리**: provider별로 따로 실패합니다. 목록형은 repository가 provider 단위로 실패를 잡고, 검색형은 각 섹션이 자기 오류 문구만 보여 줍니다.
- **스키마 불일치**: upstream 행이 있는데 공용 스키마를 하나도 통과하지 못하면 "0건"이 아니라 `invalid_response`(502)입니다. 캐시하지 않습니다.
- **0건**: 정상 응답입니다(`available`). 캐시할 수 있습니다.
- **캐시**: provider마다 TTL이 다릅니다(위 표). 공통 규칙은 실패 응답 캐시 금지, 같은 키의 동시 요청은 upstream 1회, 메모리 캐시 개수 상한(공유 50 / 위치 검색 200), 검색형 캐시 키는 해시입니다. Upstash가 설정되면 공유 캐시를 씁니다(값 900KB 초과 시 저장 안 함).
  - 응답의 `fetchedAt`은 캐시에 저장된 원래 수집 시각입니다. `cached: true`와 함께 보면 캐시 나이를 알 수 있습니다.
- **날짜 의미**: 출처 업데이트(`source.updatedAt`) · 공고 등록(`metadata.registeredAt`) · 데이터 기준일/수정일(`metadata.referenceDate`) · LIVON 수집(`source.fetchedAt`)을 구분합니다.
  - "최근 확인"(fresh)은 사람의 확인일이나 출처 업데이트일로만 계산합니다. LIVON 수집 시각은 "LIVON 수집 YYYY.MM.DD"로만 씁니다.
- **출처 표시**: 각 카드에 provider의 출처 문구를 그대로 씁니다. Kakao는 "민간 지도 플랫폼 · 공공기관 공식 데이터가 아님"을 함께 표시합니다. "LIVON 검증" 표현은 쓰지 않습니다.
- **My Life**: 저장·할 일 추가는 사용자가 누를 때만 합니다. 스냅샷에 `provenance`(provider, 출처 종류, 출처 문구, 각 날짜의 의미, `verifiedBy`)를 함께 저장합니다.
  - 취업률·만족도·수강신청 인원·담당자 개인정보 같은 필드는 처음부터 저장하지 않습니다.
- **AI**: 참고 항목은 `{kind, title, href}`(https 또는 LIVON 경로)만 보냅니다. 자격 충족, 지원금 수령, 예약 가능성, 전문가 검증, 취업 가능성을 단정하지 않도록 지시문에 적었습니다.
- **진단**: `createDataHandler().diagnostics()`는 provider id, configured, 상태, 마지막 오류 분류, 마지막 시각, 요청·캐시 hit/miss·upstream load 횟수만 돌려줍니다. HTTP로는 `LIVON_DATA_DIAGNOSTICS=1`이고 production이 아닐 때만 열립니다.

### Production readiness (사실 기준)

| provider | 상태 |
|---|---|
| kr-youth-policy | CODE READY · LIVE KEY REQUIRED · LIVE VERIFICATION REQUIRED |
| kr-business-support | CODE READY · LIVE KEY REQUIRED · LIVE VERIFICATION REQUIRED |
| kr-business-event | CODE READY · LIVE KEY REQUIRED · LIVE VERIFICATION REQUIRED |
| kr-kakao-place | CODE READY · LIVE KEY REQUIRED · LIVE VERIFICATION REQUIRED |
| kr-tourapi | CODE READY · LIVE KEY REQUIRED · LIVE VERIFICATION REQUIRED |
| kr-lifelong-class | CODE READY · LIVE KEY REQUIRED · LIVE VERIFICATION REQUIRED |
| kr-public-tax-expert | CODE READY · LIVE KEY REQUIRED · LIVE VERIFICATION REQUIRED |
| kr-job-training | CODE READY · LIVE KEY REQUIRED · LIVE VERIFICATION REQUIRED |
| public-law-expert (provider 아님) | BLOCKED: OFFICIAL SOURCE DOWNLOAD REQUIRED |

- 검증 상태: 8개 모두 **코드/fixture 검증 완료**, **실제 API 호출 검증 미완료**입니다. 키 없이 확인한 것은 고용24의 오류 응답 형식뿐입니다.
- LIVE VERIFICATION 방법: Preview에 키를 넣고 `?action=status` → provider별 `limit=5` 요청 → 응답 필드·날짜 형식을 이 문서의 해당 절과 대조합니다.

---

## 초기 조사 기록 (2026-09-29, 연결 전 후보 목록)

아래 표와 절은 연결 전에 쓴 조사 기록입니다. 구현된 provider의 현재 동작은 위 요약과 각 "구현 상태" 절이 기준입니다.

표기: 공식 = 정부·지자체·공공기관, 민간 = 기업 서비스 · 적합도 ★(낮음)–★★★(높음)

---

## <a id="policy"></a>1. 정책·지원

| provider | 데이터 종류 | 공식/민간 | API 여부 | 인증 | 비용 | 약관·라이선스 | LIVON 적합도 | 연결 전 필요한 작업 |
|---|---|---|---|---|---|---|---|---|
| 공공데이터포털 (data.go.kr) — 중앙부처·공공기관 제공 데이터셋 | 정책·공공서비스·기관 정보 (데이터셋별 상이) | 공식 | 데이터셋별 Open API/파일 | 활용신청 후 인증키 | 대부분 무료로 알려짐 — **확인 필요** | 데이터셋별 이용허락 조건 **확인 필요** | ★★★ | 사용할 데이터셋 선정 → 활용신청 → 트래픽 한도·갱신 주기 확인 → 서버 route 구현 |
| 공공서비스(보조금) 정보 — 정부24/보조금24 계열 데이터 | 중앙·지자체 공공서비스·지원사업 | 공식 | 공공데이터포털 경유 제공 여부 **확인 필요** | 인증키 (예상) | **확인 필요** | **확인 필요** | ★★★ | 제공 범위(지자체 포함 여부)·필드 확인, 신청기간 필드 매핑 |
| 온통청년 (youthcenter.go.kr, 한국고용정보원) — **구현됨: `kr-youth-policy`** | 청년정책 | 공식 | 있음 (HTTPS, `rtnType` xml/json) — 공식 문서 확인 2026-09-29 | 회원가입 → 마이페이지 › OPEN API에서 인증키 신청 → 담당자 승인 후 발급 | 공식 문서에 명시 없음 — **확인 필요** | 이용 조건·출처 표시 방식 **확인 필요** | ★★★ (10·20·30대) | 인증키 발급 → Vercel에 `YOUTHCENTER_API_KEY` 입력 → 실제 응답 형식 1회 확인 (아래 참고) |
| 복지로 계열 복지서비스 정보 | 복지 서비스 | 공식 | 공공데이터포털 경유 여부 **확인 필요** | **확인 필요** | **확인 필요** | **확인 필요** | ★★★ (돌봄·시니어·육아) | 대상 조건 문구를 LIVON이 "판단"하지 않도록 원문 그대로 표시 |
| 기업마당 지원사업정보 (bizinfo.go.kr, 중소벤처기업부) — **구현됨: `kr-business-support`** | 기업 지원사업 공고 | 공식 | 있음 (GET, JSON / XML(RSS)) — 공식 문서 확인 2026-09-29 | 기업마당에서 `사용신청` 후 인증키(`crtfcKey`) 발급 — 승인 절차 **확인 필요** | 공식 문서에 명시 없음 — **확인 필요** | 이용 조건 **확인 필요** | ★★ (창업 주제) | 인증키 발급 → Vercel에 `BIZINFO_API_KEY` 입력 → 실제 응답 1회 확인 |
| K-Startup 등 기타 창업 공고 | 창업 지원 공고 | 공식 | **확인 필요** | **확인 필요** | **확인 필요** | **확인 필요** | ★★ | 기업마당과 중복 가능성 → dedupe 규칙(제목+기관+공식 URL) 확인 |
| 지자체 열린데이터 (예: 서울 열린데이터광장) | 지역 정책·서비스 | 공식 | 지자체별 상이 | 인증키 (지자체별) | **확인 필요** | **확인 필요** | ★★ | 지역 필터(`location.region`)와 연결, 지자체별 adapter |

정책 공통 규칙 (코드에 반영됨)

- 공식 출처 URL(`officialSource`)이 없으면 저장소에 넣지 않습니다.
- `lastVerifiedAt`이 없으면 freshness를 "확인 시점 미상"으로 둡니다. `fetchedAt`만으로 "유효"라고 표시하지 않습니다.
- 신청기간이 끝나면 `expired`가 되고, "신청" 버튼 대신 "공식 안내 보기"만 보여 줍니다.

## <a id="events"></a>2. 행사

| provider | 데이터 종류 | 공식/민간 | API 여부 | 인증 | 비용 | 약관·라이선스 | 적합도 | 연결 전 필요한 작업 |
|---|---|---|---|---|---|---|---|---|
| 한국관광공사 관광정보 (TourAPI 계열) | 축제·행사·관광지 | 공식 | Open API — 세부 **확인 필요** | 인증키 | **확인 필요** | 출처 표시 조건 **확인 필요** | ★★★ | 행사 기간 필드 매핑, 이미지 사용 조건 확인 |
| 공연·전시 정보 (문화 관련 공공 데이터, 예: KOPIS 등) | 공연·전시 | 공식 | **확인 필요** | 인증키 (예상) | **확인 필요** | **확인 필요** | ★★ | 예매는 외부 링크만 ("예매 페이지로 이동") |
| 지자체 문화행사 데이터 (예: 서울 열린데이터광장 문화행사) | 지역 행사 | 공식 | 지자체별 | 인증키 | **확인 필요** | **확인 필요** | ★★★ | 지역별 adapter, 취소·연기 상태 매핑(`eventStatus`) |
| 기관 공식 발표 (도서관·문화센터 등) | 기관 행사 | 공식 | 대부분 API 없음 | — | — | 기관별 **확인 필요** | ★ | 파트너 직접 등록(아래 5번) 방식이 더 적합 |

## <a id="places"></a>3. 장소

| provider | 데이터 종류 | 공식/민간 | API 여부 | 인증 | 비용 | 약관·라이선스 | 적합도 | 연결 전 필요한 작업 |
|---|---|---|---|---|---|---|---|---|
| 공공데이터포털 시설 데이터 (도서관·체육시설·복지관 등) | 공공 시설 | 공식 | 데이터셋별 | 인증키 | **확인 필요** | **확인 필요** | ★★★ | 좌표계 확인 후 WGS84 변환, 운영시간 원문 유지 |
| 한국관광공사 관광정보 | 관광지·문화시설 | 공식 | Open API | 인증키 | **확인 필요** | **확인 필요** | ★★ | 행사 provider와 중복(dedupe) 규칙 확인 |
| 지도/장소 검색 API (카카오·네이버 등) | 상업 장소 검색 | 민간 | 있음 | 앱 키 | 무료 한도·유료 조건 **확인 필요** | **저장·캐시·재배포 제한 가능성 높음 — 약관 확인 필수** | ★ (V1) | 캐시·저장이 허용되는지 먼저 확인. 허용되지 않으면 실시간 검색 보조 용도로만 사용 |

## <a id="classes"></a>4. 클래스·프로그램

| provider | 데이터 종류 | 공식/민간 | API 여부 | 인증 | 비용 | 약관·라이선스 | 적합도 | 연결 전 필요한 작업 |
|---|---|---|---|---|---|---|---|---|
| 직업훈련 과정 (고용24/HRD 계열) | 직업훈련·국비과정 | 공식 | Open API 제공 여부·방식 **확인 필요** | 인증키 (예상) | **확인 필요** | **확인 필요** | ★★★ (커리어) | 모집 기간 → `registrationStart/End` 매핑 |
| 평생교육 강좌 (국가·지자체 평생학습 포털) | 평생교육 강좌 | 공식 | **확인 필요** | **확인 필요** | **확인 필요** | **확인 필요** | ★★ (50·60·70대) | 지역·온라인 구분 매핑 |
| 지자체 공공서비스 예약 (강좌·체험) | 지역 강좌·체험 | 공식 | 지자체별 | 인증키 | **확인 필요** | **확인 필요** | ★★ | 예약은 외부 링크만 ("예약 페이지로 이동") |
| 파트너 직접 등록 (`partner-programs`) | 클래스 | 민간 파트너 | LIVON 입력 도구 (미구현) | 파트너 계정 | 정책 결정 필요 | 파트너 약관 작성 필요 | ★★★ | 등록 검수 절차, 광고 표기 기준, 파트너 약관 |

## <a id="experts"></a>5. 전문가

| provider | 데이터 종류 | 공식/민간 | API 여부 | 인증 | 비용 | 약관·라이선스 | 적합도 | 연결 전 필요한 작업 |
|---|---|---|---|---|---|---|---|---|
| 파트너 직접 등록 (`partner-experts`) | 상담·서비스 제공자 | 민간 파트너 | LIVON 입력 도구 (미구현) | 파트너 계정 | 정책 결정 필요 | 파트너 약관·개인정보 처리방침 필요 | ★★★ | 본인 확인·자격 확인 절차 설계 전까지 "LIVON 인증" 표현 금지 |
| 공공 상담 기관 (고용센터·복지 상담 등) | 기관 (개인 아님) | 공식 | 기관 목록 데이터 여부 **확인 필요** | — | — | **확인 필요** | ★★ | 개인 전문가가 아니라 "기관"으로 표시 |
| 전문직 단체 공개 검색 (변호사·세무사 등) | 자격자 검색 | 공식 단체 | 대부분 API 없음 — **확인 필요** | — | — | **재사용 허용 여부 확인 필수** | ★ | 현재처럼 공식 검색 페이지로 연결만 유지 |

전문가 공통 규칙 (코드에 반영됨)

- `verifiedByLivon`은 항상 `false`입니다.
- 공급자가 보낸 자격 정보는 텍스트로만 보관하고 배지로 표시하지 않습니다.
- 카드에는 "LIVON이 검증한 전문가가 아닙니다" 안내가 붙습니다.

## 6. 공공데이터 (범용)

`public` 유형은 위 분류에 딱 맞지 않는 공공 정보(기관 안내, 통계 요약 등)를 위한 자리입니다.

- 공급자 원본(raw payload)은 UI로 넘기지 않습니다.
- 스키마 필드와 평탄한 `metadata`(문자열·숫자·불리언)만 남깁니다.

---

## 연결 순서 제안

1. **서버 route 준비** — `/api/livon/data`를 Vercel Serverless로 구현합니다. provider별 서버 adapter가 키로 호출하고, 정규화된 JSON만 반환합니다. 이 단계는 Vercel 배포가 필요하므로, 현재 보류 중인 AI 연결과 같은 시점에 하는 것이 효율적입니다.
2. **공식 공공데이터 1종부터** — 예: 공공데이터포털의 정책/공공서비스 데이터셋 하나를 연결합니다.
   - 활용신청과 키 발급은 사용자가 직접 해야 합니다.
   - 키는 채팅에 붙여넣지 말고 Vercel 환경변수에만 입력합니다.
3. **행사 1종** — 지역 행사 데이터로 `expired`·`cancelled` 처리를 실제 데이터로 검증합니다.
4. **파트너 등록** — 전문가·클래스는 검수 절차와 약관을 먼저 정한 뒤에 합니다.

## 사용자가 직접 해야 하는 일 (연결 시점)

- 공급자별 이용 신청과 API 키 발급 (공공데이터포털 회원가입·활용신청 등)
- 각 공급자의 이용약관 확인
  - 출처 표시 방식
  - 캐시·저장 허용 여부
  - 상업적 이용 가능 여부
- 서버 환경변수 등록 (키 값은 Git·채팅·로그에 남기지 않음)
- 파트너 데이터를 받을 경우 파트너 약관과 개인정보 처리방침 작성

---

## 온통청년 청년정책 provider (`kr-youth-policy`) — 구현 상태

### 공식 문서 확인 내용 (2026-09-29)

출처:
- [OPEN API 제공목록](https://www.youthcenter.go.kr/cmnFooter/openapiIntro/oaiDoc)
- [OPEN API 이용안내](https://www.youthcenter.go.kr/cmnFooter/openapiIntro/oaiGuide)

**요청**

- 요청 URL: `https://www.youthcenter.go.kr/go/ythip/getPlcy`
- 요청 파라미터 (문서 그대로):
  - 필수: `apiKeyNm`
  - 선택: `pageNum`, `pageSize`, `pageType`(1 목록 / 2 상세), `plcyNo`, `rtnType`(xml/json), `plcyKywdNm`, `plcyExplnCn`, `plcyNm`, `zipCd`, `lclsfNm`, `mclsfNm`

**출력**

- 목록 요소: `youthPolicyList`
- 사용하는 필드:
  - 정책 기본: `plcyNo`, `plcyNm`, `plcyKywdNm`, `plcyExplnCn`, `lclsfNm`, `mclsfNm`, `plcySprtCn`
  - 기관: `sprvsnInstCdNm`, `operInstCdNm`, `rgtrInstCdNm`
  - 링크: `aplyUrlAddr`, `refUrlAddr1`, `refUrlAddr2`
  - 대상 연령: `sprtTrgtMinAge`, `sprtTrgtMaxAge`, `sprtTrgtAgeLmtYn`
  - 자격 조건: `earnEtcCn`, `addAplyQlfcCndCn`, `ptcpPrpTrgtCn`
  - 기간·신청 방법: `aplyYmd`, `bizPrdBgngYmd`, `bizPrdEndYmd`, `plcyAplyMthdCn`, `sbmsnDcmntCn`
  - 지역: `zipCd`
  - 등록·수정일: `frstRegDt`, `lastMdfcnDt`
- 조회수(`inqCnt`)와 각종 `*Cd` 코드는 가져오지 않고 화면에도 표시하지 않습니다.

**아직 확인하지 못한 것** (인증키가 있어야 볼 수 있음)

- `youthPolicyList`를 감싸는 JSON/XML 구조와 전체 건수 필드 이름
- `aplyYmd` 등 날짜 문자열 형식
- 공식 코드정의서(`API코드정보.xlsx`)의 코드값 의미

지금 코드는 이 부분을 다음과 같이 방어적으로 처리합니다.

- 응답 어디에 있든 `youthPolicyList`를 찾아 읽습니다.
- 날짜는 두 개가 명확히 읽힐 때만 신청기간으로 씁니다.
- 예상과 다른 형식의 응답은 "0건"이 아니라 오류로 처리합니다. 오류는 캐시에 남지 않습니다.

### 구조

```
브라우저 (livon/data/livon-data-providers.js)
  └─ GET /api/livon/data?action=status   → { "kr-youth-policy": { configured: true/false } }  (키 값 없음)
  └─ GET /api/livon/data?provider=kr-youth-policy&page=n&limit=100 → 검증된 LIVON policy entity만
서버 (server/livon/data/http.mjs, Vercel: api/livon/data.mjs)
  └─ 허용 목록(provider allowlist) · GET only · page ≤ 50 · limit ≤ 100 · 알 수 없는 파라미터 거부
  └─ server/livon/data/providers/youthcenter.mjs → 고정 URL 호출 (8초 timeout, 전체 25초 예산)
  └─ 공용 스키마(livon-data-schema.js)로 재검증 → cache.mjs (메모리 + Upstash 설정 시 공유 캐시)
```

### 연결 순서 (사용자 작업)

1. 온통청년에 회원가입하고 로그인합니다.
2. 마이페이지 › 오픈(OPEN) API에서 인증키를 신청합니다. 담당자 승인 후 발급됩니다.
3. 발급된 키는 채팅·Git·로그에 남기지 않습니다. Vercel 프로젝트 › Settings › Environment Variables에 `YOUTHCENTER_API_KEY`로 직접 입력합니다.
   - Production과 Preview에 입력하고, Secret 설정합니다.
4. Preview 배포 후 아래 두 가지를 확인합니다.
   - `/api/livon/data?action=status`에서 `configured: true`인지 확인
   - `/api/livon/data?provider=kr-youth-policy&limit=5`의 응답 확인
   - 응답이 `UPSTREAM_ERROR`면 실제 응답 구조가 문서와 다른 것입니다. 이 경우 키 없이 응답 형식(필드·날짜 형식)만 공유해 주시면 parser를 맞춥니다.

---

## 기업마당 지원사업정보 provider (`kr-business-support`) — 구현 상태

### 공식 문서 확인 내용 (2026-09-29)

출처: [지원사업정보 API](https://www.bizinfo.go.kr/apiDetail.do?id=bizinfoApi) (페이지 수정일 2025.10.22)

**요청**

- URL: `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do`
- 방식: GET
- 형식: JSON / XML(RSS)
- 요청 파라미터:
  - 필수: `crtfcKey`
  - 선택: `dataType`(rss/json), `searchCnt`, `searchLclasId`, `hashtags`, `pageUnit`, `pageIndex`
- `searchCnt`가 0이거나 비어 있으면 전체 데이터를 제공합니다. 그래서 LIVON은 항상 상한값을 보내고, 요청당 최대 10페이지 × 100건만 받습니다.

**코드**

- 분야(`searchLclasId`): 01 금융, 02 기술, 03 인력, 04 수출, 05 내수, 06 창업, 07 경영, 09 기타
- 해시태그(`hashtags`): 분야명 8개와 지역 16개
  - 지역: 서울, 부산, 대구, 인천, 전남광주, 대전, 울산, 세종, 경기, 강원, 충북, 충남, 전북, 경북, 경남, 제주
  - `전남광주`는 공식 값이 하나로 묶여 있어 LIVON에서도 나누지 않습니다.

**응답**

- JSON 예시: `{"jsonArray":{ … "item":[ … ] }}`
- XML 예시: `<rss><channel> … <item>`
- 사용하는 item 필드:
  - 공고: `pblancId`/`seq`, `pblancNm`/`title`, `pblancUrl`/`link`, `bsnsSumryCn`/`description`
  - 기관·분야·대상: `jrsdInsttNm`/`author`, `excInsttNm`, `pldirSportRealmLclasCodeNm`/`lcategory`, `trgetNm`, `hashTags`
  - 신청: `reqstBeginEndDe`/`reqstDt`, `rceptEngnHmpgUrl`, `reqstMthPapersCn`
  - 등록일: `creatPnttm`/`pubDate`
  - 전체 건수: `totCnt`
- 사용하지 않는 필드:
  - 조회수(`inqireCo`)
  - 첨부파일 경로(`flpthNm`, `printFlpthNm` 등)
  - 문의처(`refrncNm`)
- 연령, 지원금액, 구조화된 자격 조건 필드는 없습니다. LIVON은 이런 값을 본문에서 추정하지 않습니다.
  - 지원 대상은 `trgetNm` 원문 그대로 "지원 대상: …"으로만 표시합니다.

### LIVON 연결 규칙

- entity 유형은 `policy`(정책·지원)입니다. 새 유형을 만들지 않았습니다.
- 연령 조건이 없으므로 `lifeStages`는 비워 둡니다.
  - Life Stage 주제에는 분야가 주제 분류와 정확히 같을 때만 붙습니다(예: 창업 → 창업 주제).
  - Home에는 사용자의 관심사가 맞을 때만 보입니다.
- 신청기간 문자열 형식은 `YYYYMMDD ~ YYYYMMDD`입니다.
  - 이 형식일 때만 마감을 판단하고, 마감이 지나면 "공식 안내 보기"만 보여 줍니다.
  - "상시", "예산 소진 시" 같은 문구는 메모로만 남기고 만료로 판단하지 않습니다.
- 출처는 "출처: 기업마당"으로 표시하고, 공고 원문(`pblancUrl`)과 신청 URL을 함께 유지합니다.
- 온통청년 등 다른 제공처와 같은 사업이면 합칩니다. 조건은 제목, 기관, 공식 URL이 모두 같을 때뿐입니다.

### 연결 순서 (사용자 작업)

1. 기업마당에 로그인합니다.
2. 정책정보 개방 › 지원사업정보 API에서 `사용신청`을 합니다.
3. 발급된 인증키를 Vercel 환경변수 `BIZINFO_API_KEY`에 직접 입력합니다.
   - Production과 Preview에 입력하고, Secret 설정합니다.
   - 채팅·Git에는 남기지 않습니다.
4. Preview 배포 후 아래 두 가지를 확인합니다.
   - `/api/livon/data?action=status`에서 `configured: true`인지 확인
   - `/api/livon/data?provider=kr-business-support&limit=5`의 응답 확인
5. 기업마당 행사정보 API는 별도 provider(`kr-business-event`)로 구현되어 있습니다(아래 절).

## 기업마당 행사정보 provider (`kr-business-event`) — 구현 상태

### 공식 문서 확인 내용 (2026-09-29)

- 문서: 기업마당 정책정보 개방 › 행사정보 API (`apiDetail.do?id=bizinfoEventApi`, 등록일 2023.08.02, 수정일 2025.09.08)
- URL: `https://www.bizinfo.go.kr/uss/rss/bizinfoEventApi.do` · GET · JSON / XML(RSS)
- 설명: 중소기업이 참여 가능한 교육, 세미나, 전시회 정보
- 요청 파라미터는 지원사업정보 API와 같습니다: `crtfcKey`, `dataType`, `searchCnt`, `searchLclasId`, `hashtags`, `pageUnit`, `pageIndex`.
  - `crtfcKey` 설명도 같습니다("기업마당에서 발급받은 서비스 인증키"). 그래서 같은 `BIZINFO_API_KEY`를 씁니다.
  - 다만 API 페이지마다 `사용신청` 버튼이 따로 있습니다. 같은 키로 행사정보 API가 바로 열리는지, 행사정보 API를 따로 신청해야 하는지는 **확인 필요**입니다.
  - `searchCnt`는 0이나 빈 값이면 전체 데이터를 줍니다. LIVON은 항상 상한값(1000)을 보냅니다.
- 응답 항목: `seq`/`eventInfoId`, `title`/`nttNm`, `areaNm`, `eventType`/`eventInfoTyNm`, `description`/`nttCn`, `originOrg`/`originEngnNm`, `rceptPd`, `originUrl`/`originUrlAdres`, `eventPeriod`/`BeginEndDe`, `inqireCo`, `lcategory`/`pldirSportRealmLclasCodeNm`, `bizinfoUrl`, `registDe`, 첨부 파일 4종, `hashTags`, `totCnt`
- 신청 URL 필드가 **없습니다**. 그래서 이 provider의 행사에는 "신청 페이지로 이동"이 나오지 않고 "공식 안내 보기"만 나옵니다.
- 공식 샘플의 `bizinfoUrl`은 `?eventInfoId=?eventInfoId=…`처럼 쿼리가 중복되어 있습니다. LIVON은 이 형태만 `?eventInfoId=…`로 고치고, bizinfo.go.kr 주소만 받습니다. 실제 응답 형태는 키 발급 후 **확인 필요**입니다.
- 목록 URL은 공식 샘플의 채널 `link` 값(`…/S1T122C128/AS/74/list.do`)을 그대로 씁니다. 실제로 행사 목록 페이지인지도 **확인 필요**입니다.

### 정규화

- `type: event`. 제목, 설명, 분야, 태그, 지역, 주최 기관(`organizer`), 행사유형(`eventType`, 원문 그대로)을 담습니다.
- 행사 기간(`eventPeriod`)은 `YYYYMMDD ~ YYYYMMDD` 형식일 때만 날짜로 씁니다. 날짜만 있으므로 시작은 그날 0시, 종료는 그날 23:59:59(KST)입니다.
  - 형식이 다르면 행사 날짜를 추측하지 않고, 그 행은 스키마 검증에서 제외됩니다.
- 접수 기간(`rceptPd`)도 정확한 범위 형식일 때만 `registrationStart`/`registrationEnd`가 됩니다. 원문은 항상 `metadata.registrationNote`에 남습니다.
- 지역은 `areaNm`을 먼저 씁니다. '전국'은 그대로 두고, 공식 지역 하나일 때만 `location.region`이 됩니다. 여러 지역이나 비정형 값은 태그/텍스트로만 둡니다.
- 분야 `경영@창업`은 두 분야를 모두 유지합니다(`metadata.fields = "경영,창업"`, 태그와 관심사 모두).
- 만들지 않는 값: 가격, 정원, 평점, 인기도, 참가자 수, 주소, 좌표, 이미지. `inqireCo`(조회수)와 첨부파일은 쓰지 않습니다.
- 서버 캐시 TTL은 설정의 `ttlByType.event`(6시간)를 따릅니다.

### LIVON 연결 규칙

- 행사가 끝난 뒤에만 만료입니다. 접수 마감은 "접수 마감"으로만 표시하며 행사를 끝난 것으로 보지 않습니다.
- 설명 문구로 취소·연기를 판단하지 않습니다(`eventStatus: unknown`).
- CTA: 공식 신청 URL이 있고 접수 중일 때만 "신청 페이지로 이동". 그 외에는 "공식 안내 보기".
- 출처 표시: "기관: {주최 기관} / 데이터 출처: 기업마당".
- Explore: 제목, 설명, 기관, 행사유형, 분야, 지역, 태그로 찾을 수 있습니다. 끝난 행사는 제외합니다.
- Life Stage: 주제 분류가 공식 분야와 정확히 같을 때만 붙습니다. 연령으로 붙이지 않습니다.
- Today: 콘텐츠의 분류/태그가 공식 분야 이름과 같을 때만 보입니다.
- Home: "관련 행사"(관심사가 맞을 때만). "내 주변"이라는 표현은 쓰지 않습니다.
- My Life 저장: 제목, 기관, 행사유형, 지역, 행사 기간, 접수 기간(원문 포함), 출처, 원문/기관 URL, 등록일을 스냅샷으로 남깁니다.
- 다른 제공처와 합치는 조건: 제목과 시작일이 같고, 기관·장소·공식 URL 중 추가 근거가 있을 때만입니다.

### 연결 순서 (사용자 작업)

1. 기업마당 › 정책정보 개방 › 행사정보 API에서 `사용신청` 여부를 확인합니다. 지원사업정보 키로 되는지 먼저 확인하세요.
2. 새 키가 필요 없으면 할 일이 없습니다. `BIZINFO_API_KEY` 하나로 두 provider가 함께 켜집니다.
3. Preview에서 `/api/livon/data?provider=kr-business-event&limit=5`를 확인합니다.

## Kakao Local 장소 provider (`kr-kakao-place`) — 구현 상태

### 공식 문서 확인 내용 (2026-09-29, `developers.kakao.com/docs/ko/local/dev-guide`)

- 키워드로 장소 검색: `GET https://dapi.kakao.com/v2/local/search/keyword.json`
- 카테고리로 장소 검색: `GET https://dapi.kakao.com/v2/local/search/category.json`
- 인증 헤더: `Authorization: KakaoAK ${REST_API_KEY}`. LIVON은 서버 환경변수 `KAKAO_REST_API_KEY`만 사용합니다.
- 키워드 검색 파라미터: `query`(필수), `category_group_code`, `x`(경도), `y`(위도), `radius`, `rect`, `page`, `size`, `sort`.
  - `radius`는 미터 단위, 0~20000입니다.
  - `page`는 1~45, `size`는 1~15입니다.
  - `sort`는 `accuracy`(기본) 또는 `distance`입니다. `distance`는 `x`,`y`가 필요합니다.
- 카테고리 검색은 `category_group_code`가 필수입니다. 중심 좌표+반경 또는 `rect` 중 하나도 필수입니다.
- 응답 `meta`: `total_count`, `pageable_count`(노출 가능 문서 수, 최대 45), `is_end`, `same_name`.
- 응답 문서 필드: `id`, `place_name`, `category_name`, `category_group_code`, `category_group_name`, `phone`, `address_name`, `road_address_name`, `x`, `y`, `place_url`, `distance`.
  - `distance`는 `x`,`y`를 보냈을 때만 옵니다.
- 영업시간, 평점, 리뷰, 가격, 사진, 설명, 수정일 필드는 **없습니다**. LIVON도 만들지 않습니다.
- `place_url`은 카카오맵 장소 페이지입니다. 사업자의 공식 홈페이지가 아니므로 "카카오맵에서 보기"로만 표시합니다.
- `address.json`(주소→좌표)은 문서로 확인했지만 V1에서는 쓰지 않습니다. 주소 입력 흐름이 아직 없기 때문입니다.
- **확인 필요**: 결과 저장·캐시 허용 범위(카카오 이용약관 / 쿼터 정책). V1은 짧은 캐시만 씁니다(아래).

### 서버 route

- `GET /api/livon/data?provider=kr-kakao-place&query=도서관&page=1&limit=15`
- 위치 검색: `&lat=..&lng=..&radius=5000&sort=distance`
  - 반경은 500, 1000, 3000, 5000, 10000, 20000만 허용합니다. 모두 공식 최대 20000 이하입니다.
- 카테고리: `&category=CT1`. 공식 CategoryGroupCode 18개만 허용합니다.
  - 카테고리만으로 찾을 때는 실제 좌표가 필요합니다. 좌표를 임의로 만들지 않습니다.
- 한 요청에 upstream 호출은 한 번뿐입니다. `limit`은 15로 제한합니다.
  - 45개 노출 창을 넘는 페이지는 호출하지 않고 빈 결과를 돌려줍니다.
- `query`는 50자 이하이고 제어문자와 `<>`는 거부합니다. 모르는 파라미터나 다른 provider 전용 파라미터가 오면 400입니다.
- 오류 코드는 기존과 같습니다: NOT_CONFIGURED 503, TIMEOUT 504, UPSTREAM_ERROR 502, BAD_REQUEST 400.
  - 카카오 오류 본문은 버립니다. 키는 응답에도 로그에도 남지 않습니다.

### 위치 개인정보

- 사용자가 "내 위치 기준으로 찾기"를 누를 때만 브라우저 위치를 한 번 요청합니다.
- 좌표는 소수 3자리(약 100m)로 줄인 뒤 전송합니다. 서버도 다시 반올림합니다.
- 좌표는 localStorage·sessionStorage·엔티티·My Life 저장·로그 어디에도 남지 않습니다. `distance`만 결과에 붙습니다.
- 위치 검색 결과는 서버 인스턴스 메모리에만 5분 캐시합니다. 키는 salt를 섞은 해시입니다. Upstash에는 보내지 않습니다.
- 키워드 검색은 공유 캐시를 1시간 씁니다. 키는 해시여서 검색어가 평문으로 남지 않습니다.
- 응답은 `Cache-Control: no-store`입니다.
- (2026-09-29 갱신) LIVON 화면은 위치 검색을 `POST /api/livon/data` 본문(`{provider, action:"nearby", lat, lng, …}`)으로 보냅니다. 좌표가 URL·접근 로그 경로에 들어가지 않습니다.
  - 호환을 위해 Kakao의 GET `lat`/`lng`는 아직 받습니다. LIVON 코드는 더 이상 쓰지 않으며, 다음 정리 단계에서 제거 대상입니다.

### 정규화

- `type: place`, id는 `kr-kakao-place:place:{카카오 id}`입니다.
- `placeType`에 카카오 `category_name`을 원문 그대로 넣습니다. 구분자 `>`만 `›`로 표시합니다.
  - `metadata.categoryGroupCode`/`categoryGroupName`/`categoryName`도 보존합니다.
- LIVON 카테고리는 명확한 경우만 붙입니다: CT1→취미, AT4→여행, HP8·PM9→건강, AC5·SC4→배움, PS3→육아.
  - 음식점·카페·마트 등은 카카오 분류만 유지합니다.
- `location.address`는 `address_name`, `location.roadAddress`는 `road_address_name`입니다. 화면에는 도로명을 먼저 보여 줍니다.
  - `region`은 주소 첫 토큰이 시/도 이름일 때만 채우고, 아니면 null입니다.
- `x`는 경도, `y`는 위도입니다. 범위를 벗어나거나 숫자가 아니면 두 값 모두 버립니다.
- `contact.phone`은 전화번호가 있을 때만 채웁니다. `mapUrl`은 kakao.com 도메인일 때만 씁니다.
  - `distanceMeters`는 위치 검색일 때 카카오가 준 값만 씁니다.
- `source.fetchedAt`은 "가져온 시각"일 뿐입니다. freshness는 `unknown`이며 "최근 확인"으로 표시하지 않습니다.

### LIVON 연결

- 일괄 로딩하지 않습니다(`onDemand`). 정적 Explore 색인, Home, 주제 목록에 자동으로 섞이지 않습니다.
- Explore 장소 탭(`type=place`)에서 검색어가 있거나 `pcat`(카카오 카테고리)가 있을 때 "장소 검색" 블록이 보입니다. provider가 켜져 있을 때만입니다.
  - 카드에는 장소명, 카테고리, 주소, 전화, 거리(위치 검색일 때만), "카카오맵에서 보기", 저장 버튼이 있습니다.
- Life Stage와 Today는 명확한 분류일 때만 "장소 검색" 링크를 보여 줍니다. 자동 호출은 하지 않습니다.
  - Life Stage 주제: 창업→‘창업지원센터’, 건강→병원(위치 동의 필요), 여행→관광명소, 취미/문화→문화시설
  - Today 콘텐츠: 창업, 도서관, 문화 행사, 미술관, 지역별 하루 여행, 건강
- Home에는 장소 칼럼이 없으므로 추가하지 않았습니다. "내 주변" 표현도 쓰지 않습니다.
- My Life 저장 스냅샷: 제목, provider, 카테고리, 지번·도로명 주소, 전화, **장소** 좌표, 카카오맵 URL. 거리와 사용자 좌표는 저장하지 않습니다.
- 다른 provider와 합치는 조건: 제목 + 주소 + (전화 또는 약 100m 격자 좌표)가 모두 같을 때만입니다. 제목만 같으면 합치지 않습니다.

### TourAPI 준비

- place 스키마에는 이미 `summary`/`description`, `media`(thumbnail·images), `openingHours`, `facilities`, `officialUrl`, `location.*`가 있습니다. 관광지·문화시설·레포츠·숙박 상세를 추가 필드 없이 담을 수 있습니다.
- 카카오 결과와 TourAPI 결과를 합치는 일은 위 dedupe 규칙에 맡깁니다. 설명이나 사진을 보강하는 enrichment는 다음 단계입니다.

### 연결 순서 (사용자 작업)

1. Kakao Developers에서 앱을 만들고 REST API 키를 확인합니다. 카카오맵(로컬) API 사용 설정이 필요한지 앱 설정에서 확인하세요.
2. Vercel 환경변수 `KAKAO_REST_API_KEY`에 직접 입력합니다(Production/Preview, Secret). 채팅·Git에는 남기지 않습니다.
3. Preview에서 `/api/livon/data?action=status`와 `/api/livon/data?provider=kr-kakao-place&query=도서관&limit=5`를 확인합니다.

## 한국관광공사 TourAPI provider (`kr-tourapi`) — 구현 상태

### 공식 문서 확인 내용 (2026-09-29)

- 공공데이터포털 「한국관광공사_국문 관광정보 서비스_GW」: https://www.data.go.kr/data/15101578/openapi.do (수정일 2026-02-26)
  - Base URL은 `https://apis.data.go.kr/B551011/KorService2`, 명세 버전은 1.0.0입니다. REST이고 JSON+XML을 지원합니다(`_type=json`, 기본값은 XML).
  - 심의 유형: 개발단계는 자동승인, 운영단계는 심의승인입니다.
  - 트래픽: 개발계정은 하루 1,000건입니다. 운영계정은 활용사례를 등록하고 신청하면 늘릴 수 있습니다.
  - 비용은 무료이고, 이용허락범위는 "제한 없음"입니다.
  - 서비스키는 공공데이터포털 인증키입니다. 한국관광콘텐츠랩 안내에 따르면 1인당 하나이며 모든 OpenAPI에 공통으로 쓰입니다.
- 공통 필수 파라미터: `serviceKey`, `MobileOS`(IOS/AND/WEB/ETC), `MobileApp`(서비스명). LIVON은 `WEB`과 `LIVON`을 보냅니다.
  - 운영계정 승인 요건에 "MobileApp 값의 서비스 고유명 확인"이 있습니다.
- 사용하는 operation: `searchKeyword2`, `areaBasedList2`, `locationBasedList2`, `detailCommon2`, `detailIntro2`, `detailImage2`.
- `areaCode`, `sigunguCode`, `cat1~3`은 명세에 "미사용항목(삭제예정)"으로 표기되어 있어 쓰지 않습니다.
  - 대신 법정동 코드 `lDongRegnCd`/`lDongSignguCd`와 분류체계 `lclsSystm1~3`을 씁니다.
- 좌표: `mapX`는 WGS84 경도, `mapY`는 WGS84 위도입니다. `radius`는 미터 단위로 최대 20000입니다. 위치 검색은 `arrange=E`(거리순)입니다.
- contentTypeId (명세 원문)

| contentTypeId | 명세 이름 | LIVON 처리 | LIVON 카테고리 |
|---|---|---|---|
| 12 | 관광지 | place | 여행 |
| 14 | 문화시설 | place | 취미 |
| 15 | 축제공연행사 | place 아님 (event는 V1.1 후보) | — |
| 25 | 여행코스 | place 아님 | — |
| 28 | 레포츠 | place | (없음 — 단일 카테고리가 명확하지 않음) |
| 32 | 숙박 | place | 여행 |
| 38 | 쇼핑 | place (기술 지원, 화면에서 권하지 않음) | — |
| 39 | 음식점 | place (기술 지원, 화면에서 권하지 않음) | — |

- 오류 코드(포털 안내): APPLICATION_ERROR(01), HTTP_ERROR(04), SERVICETIMEOUT_ERROR(05), INVALID_REQUEST_PARAMETER_ERROR(10), NO_OPENAPI_SERVICE_ERROR(12), SERVICE_KEY_IS_NULL/PERMISSION_DENIED(20), LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR(22), …PER_SECOND…(23), BLACKLIST_IP_ACCESS_ERROR(29).
  - 인증 오류: SERVICE_ACCESS_DENIED_ERROR(20), SERVICE_KEY_IS_NOT_REGISTERED_ERROR(30), DEADLINE_HAS_EXPIRED_ERROR(31).
  - LIVON 코드 대응: 호출 한도(22·23)는 503 `UPSTREAM_LIMIT`, 타임아웃(05)은 504 `TIMEOUT`, 나머지는 502 `UPSTREAM_ERROR`입니다. 원문은 버립니다.
- 한국관광콘텐츠랩 저작권 정책: https://api.visitkorea.or.kr/#/useServiceGuide/2
  - 출처 표기: "출처 : ⓒ한국관광콘텐츠랩 또는 ⓒ한국관광공사". 사진은 "데이터 제공: ⓒ한국관광콘텐츠랩"입니다.
  - 사진: 피사체 명예훼손·인격권 침해 용도와 기업 CI/BI 이용을 금지합니다.
  - 공공누리 제1유형은 출처표시(상업 이용·변경 가능)입니다. 제3유형은 출처표시에 변경금지가 더해집니다. 명세 `cpyrhtDivCd`는 Type1 또는 Type3입니다.
  - **콘텐츠 캐싱(로컬서버 저장방식) 금지**입니다.
  - 외부 활용 시 저작권 정책 안내 링크를 함께 제공해야 합니다.
- **확인 필요**:
  - 성공 `resultCode` 값(LIVON은 `0000`/`00`/`0`을 성공으로 봄)
  - `numOfRows` 최대값(LIVON은 20으로 제한)
  - 초당 호출 한도 수치
  - 법정동 시도코드 실제 값(`ldongCode2`로 확인)
  - 활용매뉴얼 zip의 세부 규칙

### 서버 route

- 키워드: `GET /api/livon/data?provider=kr-tourapi&query=경복궁[&region=서울][&type=12]&page=1&limit=20`
  - 명세의 `searchKeyword2`에는 contentTypeId가 없어서, `type`은 받아 온 뒤 걸러냅니다.
- 지역: `?provider=kr-tourapi&region=서울` 또는 `&area=11[&sigungu=110]` → `areaBasedList2`.
  - `region` 이름을 코드로 바꾸는 표는 법정동 표준 코드입니다. `ldongCode2`로 재확인해야 합니다.
- 위치: **POST만** 받습니다. `{provider:"kr-tourapi", action:"nearby", lat, lng, radius, type}` → `locationBasedList2`.
  - GET에 `lat`/`lng`/`radius`가 있으면 400입니다.
- 상세: `?provider=kr-tourapi&id=<contentId>` → `detailCommon2`와 그 contentTypeId의 `detailIntro2`, 2회 호출입니다. 사용자가 상세를 열 때만 부릅니다.
- 사진: `?provider=kr-tourapi&id=<contentId>&view=images` → `detailImage2`. 사용자가 "사진 더 보기"를 누를 때만 부릅니다.
- 목록 한 번에 upstream 호출은 1회입니다. 목록 항목마다 상세나 사진을 부르지 않습니다(N+1 없음).
- 캐시는 **없습니다**(저작권 정책). 동시에 들어온 같은 요청만 호출 1회로 합칩니다. 인-플라이트 키는 salt를 섞은 해시입니다.

### 정규화

- id는 `kr-tourapi:place:{contentid}`, 엔티티는 `place`입니다.
  - `placeType`은 contentTypeId 이름입니다. metadata에 contentId, contentTypeId, lDong 코드, lclsSystm1~3, zipcode, createdtime, modifiedtime을 보존합니다.
- 주소: `location.address`는 addr1, `location.detailAddress`는 addr2입니다. 화면에는 둘을 이어서 보여 줍니다.
  - `region`은 addr1 첫 토큰이 시/도 이름일 때만 채웁니다. 공식 코드는 metadata에 남깁니다.
- 좌표: mapx는 경도, mapy는 위도입니다. 범위를 벗어나거나 숫자가 아니면 두 값 모두 버립니다. 주소로 좌표를 찾거나 Kakao로 보완하지 않습니다.
- 상세: `description`은 overview입니다. `<br>`은 " / "로 바꾸고 태그와 스크립트는 제거합니다.
  - `homepageUrl`은 homepage 마크업에서 첫 http(s) URL만 뽑고 안전 검사를 거칩니다. 표시는 "관광정보에 기재된 홈페이지"입니다. "공식 홈페이지"라고 쓰지 않습니다.
  - `info`는 contentTypeId별 소개정보 중 값이 있는 행만 담습니다. 라벨은 명세 표기를 그대로 씁니다.
  - 숙박 `reservationurl`은 "예약 안내 페이지" 링크로만 보여 줍니다. 예약 버튼, 가격, 객실 가능 여부는 없습니다.
- 사진: 목록의 firstimage와 detailImage2는 `cpyrhtDivCd`가 Type1/Type3일 때만 `photos`에 넣습니다.
  - 각 사진은 URL, 썸네일, 이름, 유형, 크레딧을 보존합니다. 유형이 없는 사진은 URL만 metadata에 남기고 표시하지 않습니다.
  - visitkorea.or.kr 호스트만 허용합니다.
  - 화면에서는 자르지 않고(`object-fit: contain`) 크레딧, 공공누리 유형, 저작권 정책 링크를 함께 보여 줍니다.
- 신선도: modifiedtime은 `source.updatedAt`("출처 업데이트")입니다. LIVON이 검증한 날짜가 아니므로 freshness는 `unknown`입니다.
- 접근성: 이 API의 소개정보에는 장애인 편의 필드가 없어 만들지 않습니다(유모차·반려동물 항목은 원문 그대로).

### LIVON 연결

- Explore 장소 탭에서 Kakao "장소 검색" 블록 아래에 별도 "관광정보" 블록을 둡니다. 합치지 않습니다.
  - Kakao는 위치·거리·카카오맵, TourAPI는 소개·이용 정보·사진을 맡습니다.
  - 카드의 "상세 정보"를 누르면 상세를 불러오고, "사진 더 보기"를 누르면 사진을 불러옵니다.
- Life Stage: 여행 주제는 관광지, 취미/문화 주제는 문화시설 링크를 보여 줍니다. 연령 기준은 없고 자동 호출도 없습니다.
- Today: 미술관 콘텐츠는 ‘미술관’ 검색, 문화 행사는 문화시설, 지역별 하루 여행은 관광지 링크를 보여 줍니다.
- Home은 변경하지 않았습니다.
- My Life 저장: 제목, provider, contentId(providerRef), contentTypeId, 카테고리, 주소, 상세주소, 전화, **장소** 좌표, 출처 표기를 남깁니다. 사진과 사용자 좌표는 저장하지 않습니다.
- dedupe: 기존 규칙(제목 + 주소·전화·약 100m 좌표 중 2개 이상 일치)을 그대로 씁니다. Kakao와 TourAPI는 주소 표기가 달라(서울/서울특별시) 대부분 따로 남습니다.
- 자동 enrichment는 하지 않습니다(Kakao 결과로 TourAPI를 부르지 않고, 반대도 마찬가지).

### TourAPI 행사(V1.1) 준비

- `searchFestival2`(eventStartDate 필수, eventEndDate, 법정동/분류 필터)와 detailIntro2 15형 필드(eventstartdate, eventenddate, eventplace, sponsor1, eventhomepage, playtime, usetimefestival…)가 있습니다.
- 목록 필드 `progresstype`(취소·행사연기)과 `festivaltype`(상시·온라인·격년제)는 기존 event 스키마의 `eventStatus`/일정에 대응시킬 수 있습니다. 이번 V1에서는 구현하지 않았습니다.

### 연결 순서 (사용자 작업)

1. 공공데이터포털에서 「한국관광공사_국문 관광정보 서비스_GW」를 활용신청합니다. 개발계정은 자동승인입니다.
2. 마이페이지의 일반 인증키(Decoding)를 Vercel `TOURAPI_SERVICE_KEY`에 직접 입력합니다. Encoding 키를 넣어도 서버가 한 번 디코딩합니다.
3. Preview에서 `/api/livon/data?action=status`와 `/api/livon/data?provider=kr-tourapi&query=경복궁&limit=5`를 확인합니다. 법정동 코드는 `ldongCode2`로 확인합니다.
4. 서비스 운영 전 운영계정을 신청합니다. 필요 사항은 테스트 이력, MobileApp=LIVON, 활용사례입니다.

## 전국평생학습강좌 provider (`kr-lifelong-class`) — 구현 상태

### 공식 문서 확인 내용 (2026-09-29)

- 공공데이터포털 「전국평생학습강좌표준데이터」: https://www.data.go.kr/data/15013110/standard.do
  - 소관기관은 교육부, 제공기관은 지방자치단체·교육청(348개 기관)입니다.
  - 갱신주기는 분기, 수정일은 2026-09-03입니다. "개별 기관 등록 데이터는 매월 초 병합하여 전국 단위로 제공"됩니다.
- OpenAPI 요청주소: `https://api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api`
  - 활용승인은 개발단계와 운영단계 모두 **자동승인**입니다.
  - 트래픽: 개발계정 10,000. 운영계정은 활용사례를 등록하면 증가 신청이 가능합니다.
- 요청변수: `serviceKey`, `pageNo`, `numOfRows`(최대 1000), `type`(xml/json), 그리고 모든 출력 항목(선택 필터)입니다.
  - 필터가 부분 일치인지 완전 일치인지는 명세에 없습니다(**확인 필요**). 그래서 LIVON은 upstream 필터를 쓰지 않습니다.
- 출력 항목:
  - 강좌·강사: lctreNm, instrctrNm, lctreCo
  - 교육 일정: edcStartDay, edcEndDay, edcStartTime, edcColseTime, operDay
  - 대상·방법: edcTrgetType, edcMthType
  - 장소·기관: edcPlace, edcRdnmadr, operInstitutionNm, operPhoneNumber, homepageUrl
  - 정원·수강료: psncpa, lctreCost
  - 접수: rceptStartDate, rceptEndDate, rceptMthType, slctnMthType
  - 인정 여부: oadtCtLctreYn, pntBankAckestYn, lrnAcnutAckestYn
  - 기준·제공기관: referenceDate, instt_code
- 에러코드: 00 NORMAL_CODE, 03 NODATA_ERROR, 05 SERVICETIMEOUT_ERROR, 10/11 파라미터, 12 서비스 없음, 20·21·30·31·32·33 인증/접근, 22 호출 한도 초과, 99 기타.
- **데이터에 없는 것**: 강좌 ID, 분류(카테고리) 필드, 신청 URL, 좌표, 잔여석, 평점·후기.
- 이용허락범위: 데이터셋 페이지에 따로 표시되지 않습니다(메타데이터 license는 포털 정책 페이지). **확인 필요**
  - 캐싱을 금지하는 조항은 찾지 못했습니다.
- 인증키: 한국관광콘텐츠랩 안내상 공공데이터포털 인증키는 1인당 하나이고 모든 OpenAPI에 쓰입니다.
  - 그래도 provider별 의미가 분명하도록 별도 환경변수 `PUBLIC_DATA_SERVICE_KEY`를 씁니다. 값은 TourAPI 키와 같아도 됩니다.

### 서버

- 목록: `GET /api/livon/data?provider=kr-lifelong-class[&query=요가][&region=서울][&method=online|offline|both][&status=open]&page=1&limit=20`
  - 한 번에 최대 3페이지×1000건을 읽습니다. 교육종료일이 지난 강좌는 버리고, 시작일 순으로 최대 500건을 1일 캐시합니다.
  - 필터는 이 캐시 창에서 서버가 적용합니다. 필터마다 upstream을 다시 부르지 않습니다.
  - `status=open`은 접수 시작·종료일이 실제로 있고 오늘이 그 사이일 때만 해당합니다.
- **한계**: 전국 전체 강좌가 아니라 upstream이 준 앞쪽 창(최대 3,000건) 안에서의 검색입니다. upstream 정렬 기준도 명세에 없습니다.

### 정규화 (`program` 엔티티 재사용)

- id: 공식 ID가 없으므로 제공기관코드·운영기관·강좌명·교육시작일·시작시각·장소·요일의 SHA-256 앞 24자리입니다. 강사명(개인정보)은 넣지 않습니다.
- 필드 대응: organizer는 운영기관명, instructor는 강사명, eligibility는 교육대상 원문입니다.
  - format은 교육방법 원문, venue는 교육장소, days는 운영요일, timeText는 시작~종료 시각입니다.
- 일정: schedule은 교육시작·종료일(날짜만)이고, registrationStart/End는 접수일자입니다.
  - 모집예정·모집중·모집종료는 이 날짜로만 계산하고, 날짜가 없으면 상태를 표시하지 않습니다.
- 정원·수강료: capacity는 강좌정원수입니다.
  - pricing.amount는 수강료 숫자입니다. "0"도 0원으로만 보여 주고 "무료"라고 단정하지 않습니다. 숫자가 아니면 원문 메모로만 남깁니다.
- 연결 정보: contact.website는 홈페이지주소입니다. `http(s)://`로 시작할 때만 쓰고, 아니면 텍스트 메모로 남깁니다.
  - CTA는 "공식 안내 보기"이고, URL이 없으면 버튼을 만들지 않습니다.
- 지역: 도로명주소 첫 토큰(서울특별시 등)을 LIVON 지역 이름(서울 등)으로 바꿉니다. 표기만 바꾸는 매핑입니다.
- 카테고리와 연령: 분류 필드가 없어 LIVON 카테고리를 붙이지 않습니다. lifeStages도 비워 둡니다(교육대상은 자유 텍스트).
- 신선도: referenceDate는 "데이터 기준일"로 표시하고, "최근 확인"으로 표시하지 않습니다.

### LIVON 연결

- Explore 클래스 탭: 실제 강좌가 통합 검색에 들어갑니다.
  - 지역·온라인/오프라인 필터는 기존 칩을 씁니다. 카드에는 접수 상태를 보여 주고, "상세 정보"를 펼치면 값이 있는 항목만 나옵니다.
  - 저장 버튼과 "공식 안내 보기"가 있습니다. 끝난 강좌는 제외됩니다.
- Life Stage와 Today: 명확한 키워드 쌍일 때만 "관련 강좌 찾기" 링크(Explore 검색)를 보여 줍니다. 자동으로 섞지 않습니다.
  - Life Stage: 디지털 생활·디지털 도움 → ‘스마트폰’
  - Today: 요가, 베이킹, 사진, 도자기, 시니어 디지털 교육
- Home: 분류가 없어 기존 "추천 클래스·프로그램" 칸에 들어가지 않습니다. Home은 변경하지 않았습니다.
- My Life: 공유 저장에 강좌 스냅샷을 남깁니다. 사용자가 누를 때만 "접수 마감일/교육 시작일을 할 일에 추가"를 하고, 중복은 My Life 규칙이 막습니다.
- AI: 기존 검색 기반 참고 항목(kind·title·href)만 전달합니다. 서버가 받지 않는 http 링크는 참고 항목에서 뺍니다.
- 기업마당 행사와는 타입이 달라(event/program) 합치지 않습니다. Kakao·TourAPI와도 합치지 않습니다.

### 참고: 다음 후보

- 전국평생교육시설정보표준데이터는 기관 주소·홈페이지 보강 후보로만 기록합니다(자동 결합 없음).
- 직업훈련(고용24/HRD) 과정 API: 아래 보고서 참고.

### 연결 순서 (사용자 작업)

1. 공공데이터포털에서 「전국평생학습강좌표준데이터」 OpenAPI를 활용신청합니다(자동승인).
2. 마이페이지의 일반 인증키(Decoding)를 Vercel `PUBLIC_DATA_SERVICE_KEY`에 직접 입력합니다.
3. Preview에서 `/api/livon/data?provider=kr-lifelong-class&limit=5`를 확인합니다. 필터 부분 일치 여부와 응답 `resultCode`(00)도 확인합니다.

## 공공 전문가 provider (`kr-public-tax-expert`) — 마을세무사 V1

### 조사 결과 (2026-09-29, 공공데이터포털 "마을세무사")

- **전국 통합 인물 API 없음**: 검색 결과는 지역별 파일데이터 20건, OpenAPI 2건입니다.
  - OpenAPI 중 행정안전부_통계연보_마을세무사는 통계라 사람 정보가 아닙니다.
- V1에 연결한 source는 공식 계약과 컬럼을 직접 확인한 두 곳입니다.

| source id | 공개 기관 | 형태 | 공식 필드 | 기준일 | 전화 |
|---|---|---|---|---|---|
| `daegu-donggu` | 대구광역시 동구 | OpenAPI `apis.data.go.kr/3420000/villageTaxAccountantService/getVillageTaxAccountant` (REST·JSON, 자동승인/자동승인, 개발 10,000, 이용허락범위 제한 없음, 수정일 2025-08-28) | EMD_NM(읍면동 명), LNDCTN_NM(세무사 명), TELNO(전화번호) | API에 날짜 필드 없음 → 데이터셋 수정일 | 설명에 "전화번호로 … 상담 예약이나 문의"라고 되어 있어 **공개 상담 연락처**로 표시. 사무실/휴대전화 여부는 알 수 없음(기록만) |
| `incheon` | 인천광역시 | 파일데이터 자동변환 API `api.odcloud.kr/api/15029613/v1/uddi:54dc07f0-…` (연간, 수정일 2026-03-09, 제한 없음) | 구분(군·구), 세무사명, 활동마을 | 파일명 `_20260228` | 20260228판에는 전화번호 컬럼이 **없음** → 표시하지 않음 |

- 인천 자동변환 API는 해마다 새 uddi로 바뀝니다. 과거판(2021~2025)에는 전화번호가 있었지만 최신판에서 빠졌습니다.
  - LIVON은 최신판 uddi 하나만 고정해 씁니다. 새 파일이 올라오면 uddi와 컬럼을 다시 확인해야 합니다.
- 자동변환 API의 심의유형과 트래픽은 페이지에 표시되지 않아 **확인 필요**입니다.

### 신뢰 모델 (`expert.trustLevel`)

- `public_designated` (V1 사용): 공공기관이 공적 상담 역할의 담당자로 공개한 경우입니다.
  - 화면 표시는 "공공기관 공개 정보 · 마을세무사 · 공개: ○○"입니다.
- `registered_professional` (미사용): 공식 등록 데이터에서 현재 등록 상태를 직접 확인할 수 있을 때만 씁니다.
- `partner_verified` (미사용): LIVON 파트너 검증을 마쳤을 때만 씁니다. 데이터 feed로는 설정할 수 없습니다(스키마가 막음).
- `business_listing` (미사용): 사업장 정보일 뿐인 경우입니다. 전문가로 쓰지 않습니다.
- "LIVON 인증", "검증된 전문가", "공인 전문가" 표현은 쓰지 않습니다. 마을세무사 명단에 있다는 것은 "○○이 공개한 마을세무사 지정 정보"라는 뜻일 뿐, 세무사 자격 검증이 아닙니다.

### 정규화와 규칙

- `expert` 엔티티를 재사용합니다. 추가 필드는 role, trustLevel, sourceOrganization, sourceDataset, designationStart/End입니다.
  - metadata에 sourceId, referenceDate/Kind, phonePurpose, semantics를 담습니다.
- 채우지 않는 값: credentials, specialties, 경력, 학력, 평점, 후기, 상담 건수, 가격, 예약 가능 시간, 사진, 성별, 나이.
- 카테고리는 `세무`입니다. 세부 전문 분야(부가세 전문 등)는 붙이지 않습니다.
- ID는 `tx` + sha256(source, dataset, 이름, 담당지역)입니다. 같은 source에 이름·지역이 같은 행이 둘이면 순번으로 구분합니다.
  - 동명이인이 합쳐지지 않게 합니다. 다른 provider와는 연락처와 담당지역이 모두 같을 때만 합칩니다.
- 지역은 source의 시도·시군구·읍면동 수준까지만 씁니다. 좌표를 만들지 않고 Kakao를 호출하지 않습니다.
- 지정 기간: 두 source 모두 기간 필드가 없어 표시하지 않습니다. 현재 활동 여부를 단정하지 않습니다.
  - 종료일이 있는 source라면 종료 후 만료(기본 목록 제외)입니다.
- 날짜 표시: "데이터 기준일"(인천) 또는 "데이터 수정일"(대구 동구)입니다. "최근 검증"이라고 쓰지 않습니다.
- CTA: 공개 목적이 상담인 전화번호만 "전화 문의"(tel:) 버튼으로 둡니다. 데이터셋 페이지는 "데이터 출처 보기"입니다.
  - 예약, 가격, 상담 가능 여부는 없습니다. 마을세무사 무료 상담은 제도 설명 수준으로만 다루고 개인 상담료 0원을 만들지 않습니다.
- 검색: 이름, 담당지역, 역할, 공개기관, 카테고리로만 찾습니다. 전화번호는 검색하지 않고, 서버 필터도 숫자 3자리 이상을 거부합니다.
- 캐시: 기존 expert TTL(7일)입니다. source 하나라도 실패하면 1시간만 캐시합니다.
  - 모든 source가 실패할 때만 오류로 응답합니다(Promise.allSettled).
- 연결: Explore 전문가 탭(연결된 지역 안내 문구 포함), 명확한 세무 관련 Life Stage 주제와 Today 콘텐츠의 "세무 상담 정보 찾기" 링크, My Life 저장("저장 당시 공개 정보" 표시)입니다.
  - AI 참고 항목에는 이름·역할·지역·공개기관·출처 링크만 들어갑니다. Home은 변경하지 않았습니다.

### 다음 후보 조사

- **소상공인시장진흥공단_상가(상권)정보_API** (`apis.data.go.kr/B553077/api/open/sdsc2`, 자동/자동, 개발 10,000, 제한 없음, 수정일 2026-08-14)
  - 상호·업종·주소·좌표를 담은 사업장 데이터입니다. 개인 자격 데이터가 아닙니다.
  - 향후 `professional_business`/`service_provider` 후보로만 두고, expert에 섞지 않습니다.
- **Realtor**: 「전국공인중개사사무소표준데이터」 (국토교통부 소관·지자체 제공 154곳, 연간, 수정일 2026-09-22)
  - OpenAPI: `api.data.go.kr/openapi/tn_pubr_public_med_office_api` (numOfRows 최대 1000)
  - 항목: 중개사무소명, 개설등록번호, 개업공인중개사종별구분, 소재지도로명·지번주소, 전화번호, 개설등록일자, 공제가입유무, 대표자명, 위도·경도, 중개보조원수, 소속공인중개사수, 홈페이지주소
  - 영업상태 항목은 표준 항목 목록에 없습니다. 사무소 등록 정보이지 개인 전문성 검증이 아닙니다.
- **Village lawyer**: 「법무부_마을변호사 지역별 현황」 OpenAPI (`apis.data.go.kr/1270000/mojmabyun/mabyun`, REST·XML, 자동/심의, 개발 10,000, 제한 없음, 수정일 2026-05-21)
  - 전국 단위 API가 있습니다. 항목: State, City, Village, AreaNote, 담당 공무원·직책, Attorney(마을변호사), AttorneyNote
  - 제도상 서울·대전·광주에는 위촉하지 않습니다. 담당 공무원 이름 필드는 LIVON에 표시하지 않는 쪽이 안전합니다.
  - 다음 expert source 1순위 후보입니다.

### LIVON Expert Partner (향후 설계만)

- 흐름: 전문가 회원가입 → 본인확인 → 자격·등록정보 제출 → 운영 검수 → `partner_verified` → 상담 서비스 등록 → 일정 설정 → 예약 → 결제 → 상담 → 리뷰
- 공공데이터 expert(`public_designated`)와 파트너 expert(`partner_verified`)는 provider와 trustLevel로 분리합니다. 화면에서도 근거를 따로 보여 줍니다.
- 리뷰와 별점은 LIVON에서 실제로 완료된 예약에 대해서만 "verified review"로 받습니다. V1에는 후기, 별점, 리뷰 수, 상담 건수가 없습니다.

## 직업훈련 provider (`kr-job-training`) — 구현 상태 {#job-training}

### 공식 문서 확인 내용 (2026-09-29)

- 공공데이터포털 「한국고용정보원_직업훈련_국민내일배움카드 훈련과정」: https://www.data.go.kr/data/15109032/openapi.do
  - 제공기관 한국고용정보원, API 유형 **LINK**(실제 API는 고용24), 데이터포맷 XML, 수정일 2025-07-18.
  - 이용허락범위 제한 없음, 비용 무료. 심의유형: 개발단계 자동승인 / 운영단계 심의승인.
  - 신청 가능 트래픽: "해당 기관의 정책에 따라 상이" — **숫자가 공개되어 있지 않습니다.**
- 고용24 OPEN-API (국민내일배움카드 훈련과정): https://www.work24.go.kr/cm/e/a/0110/selectOpenApiSvcInfo.do
  - 이용절차: 고용24 **기업회원** 가입 → OPEN-API 인증키 신청 → **담당자 심사 후 발급**. 결과는 XML(UTF-8).
  - 목록: `https://www.work24.go.kr/cm/openApi/call/hr/callOpenApiSvcInfo310L01.do`
    - 필수: `authKey`, `returnType`(XML|JSON), `outType`=1, `pageNum`(최대 1000), `pageSize`(최대 100), `srchTraStDt`/`srchTraEndDt`(훈련시작일 From/To), `sort`, `sortCol`.
    - 선택: `srchTraArea1`(지역 대분류: 11 서울, 12 전남광주, 26 부산 …), `crseTracseSe`(훈련유형 C0061 …), `srchTraGbn`(훈련구분 M1001 일반/M1005 인터넷/M1010 혼합/M1014 스마트혼합), `srchTraProcessNm`(과정명), `srchTraOrganNm`(기관명), `wkendSe`, `srchNcs1-4`.
    - 출력: `scn_cnt`, `scn_list`{address, certificate, courseMan(수강비), realMan(실제 훈련비), subTitle(부 제목), telNo, title, titleLink(제목 링크), traStartDate/traEndDate, trainTarget(훈련대상), trainTargetCd(훈련구분), trainstCstId(훈련기관ID), trprId, trprDegr, wkendSe, yardMan(정원), ncsCd, instCd, trngAreaCd, 그리고 취업률·만족도·등급·수강신청 인원}.
  - 과정/기관정보: `https://www.work24.go.kr/cm/openApi/call/hr/callOpenApiSvcInfo310L02.do` (`srchTrprId`, `srchTrprDegr`, `srchTorgId` 필수)
    - 출력: inoNm(훈련기관명), addr1/addr2, hpAddr, trtm(총 훈련시간), trDcnt(총 훈련일수), instPerTrco(실제 훈련비), perTrco(정부지원금), tgcrGnrlTrneOwepAllt(본인부담액), ncsNm, govBusiNm … (+ 담당자 이름/이메일/전화, 시설·장비).
  - 키 없이 호출하면 HTTP 200 + `<GO24><error>인증키가 존재하지 않습니다</error></GO24>` (JSON이면 `{"error": …}`).
- **API에 없는 것**: 모집·신청 기간, 신청 URL, 잔여석, 후기·평점, 데이터 기준일/수정일.

### LIVON 구현

- 서버: `server/livon/data/providers/job-training.mjs`, 키 `WORK24_TRAINING_API_KEY`(서버 전용). 고정 endpoint 2개, `returnType=XML`(문서화된 형식), `sort=ASC&sortCol=2`(훈련시작일).
- 요청은 **on demand** 전용: 사용자가 검색할 때 목록 1페이지(≤50행, ≤50페이지), 사용자가 과정을 열 때 과정/기관정보 1건. 대량 수집 없음.
- 허용 파라미터: `query`(과정명) · `org`(기관명) · `region`(LIVON 지역 → 공식 대분류 코드) · `method`(offline/online/blended/smart → M 코드) · `type`(공식 훈련유형 코드) · `period`(30/90/180일, 오늘 KST부터의 훈련시작일 범위) · `page` · `limit` · `id`(`trprId_회차_훈련기관ID`, 엄격 파싱).
- 저장·전달하지 않는 필드: 취업률/취업인원, 만족도, 등급, 수강신청 인원, contents/titleIcon(의미 미기재), 담당자 개인정보, 시설·장비.
- 엔티티: 기존 `program` 재사용. ID = 공식 `trprId` + `trprDegr` + `trainstCstId`. 훈련기관명은 과정/기관정보(inoNm)에서만 표시하고, 목록의 subTitle은 라벨 없이 그대로 표시합니다.
- 상태: 훈련시작일·훈련종료일과 오늘(KST) 날짜만으로 "훈련 시작 전 / 훈련 중 / 훈련 종료". 모집중·접수중은 표시하지 않습니다.
- 비용: 수강비·실제 훈련비·정부지원금·본인부담액을 **공식 이름 그대로** 표시. 0은 "0원"이며 "무료"로 바꾸지 않습니다. 개인별 부담액·지원 여부는 계산하지 않습니다.
- CTA: titleLink(고용24/HRD-Net 호스트만)는 "고용24 과정 상세 보기". "신청하기"는 쓰지 않습니다.
- Freshness: 출처 기준일이 없으므로 `source.updatedAt=null`, `metadata.freshness=fetched-only`. LIVON 조회 시각(`fetchedAt`)은 "LIVON 조회"로만 표시합니다.
- 캐시: 트래픽 한도가 공개되지 않아 목록 6시간 / 상세 24시간 서버 캐시(키는 해시, 날짜 창 포함). 동일 요청은 upstream 1회 공유. 실패 응답은 캐시하지 않습니다.
- Explore: `클래스` 탭 안의 "직업훈련 과정 · 국민내일배움카드" 섹션(`#ex-results?type=class&jobs=1`). 검색 대상(과정명/기관명), 훈련유형, 훈련구분, 훈련 시작일 범위, 기존 지역 필터(서울·경기·인천·부산·대구·광주·대전; 광주는 공식 코드상 전남광주).
- Life Stage 링크: 20s.first-job, 20s.course-choice, 30s.job-change-30, 40s.career-shift-40, 40s.retraining-choice, 50s.second-career-50, 50s.work-options. Today 링크: td-youth-policy. Home: 변경 없음.
- My Life: 저장(스냅샷 `trainingCourse`)과 "훈련 시작일을 할 일에 추가"는 사용자가 누를 때만. 중복 방지는 My Life 규칙.
- AI: 이번 페이지에서 사용자가 조회한 과정만 `{kind, title, href}`(https)로 전달. 취업·합격·지원금 수령 가능성 추론 금지 지시 추가.
- Dedupe: 공식 ID 기준. 평생학습강좌 등 다른 provider와는 공유 ID가 없어 병합하지 않습니다.

### 외부 설정 필요

1. 고용24 기업회원 가입 후 OPEN-API "국민내일배움카드 훈련과정" 인증키를 신청합니다(담당자 심사).
2. 발급된 키를 Vercel `WORK24_TRAINING_API_KEY`에 넣습니다.
3. Preview에서 `/api/livon/data?action=status`, `/api/livon/data?provider=kr-job-training&query=데이터&limit=5`를 확인하고, 실제 응답의 `traStartDate` 형식·`titleLink` 호스트·`trainTargetCd` 값을 이 문서와 대조합니다.
