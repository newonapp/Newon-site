# LIVON V1 — Production Readiness (Release Candidate)

기준 커밋: `91362a7db` (livon-v1-release) · 점검일: 2026-09-29

> 이 문서는 LIVON V1을 production에 배포할 수 있는지 판단하기 위한 점검 결과입니다.
> 실제 API 호출 검증(LIVE VERIFIED)을 마친 provider는 없습니다. 실제 인증(LIVE AUTH)도 연결되지 않았습니다.

## 1. 배포 환경 (확인한 사실)

- `www.newon.app`은 **GitHub Pages**에서 응답합니다.
  - 확인: 응답 헤더 `server: GitHub.com`, `x-github-request-id` (2026-09-29, 브라우저에서 직접 요청)
  - 배포 파이프라인: `.github/workflows/github-pages.yml` — `main` push → `_publish/` 빌드 → `gh-pages` 브랜치
- GitHub Pages는 정적 호스팅입니다. `/api/*` 서버 함수가 없습니다.
  - 현재 `https://www.newon.app/api/health`, `/api/livon/data`는 **404 HTML**입니다.
- 결과: LIVON의 서버 기능(LIVON AI `api/livon/chat.mjs`, 공공데이터 8개 provider `api/livon/data.mjs`)은 Vercel 같은 **서버 함수 호스팅**에 배포되어야 동작합니다.
  - `vercel.json`의 함수 설정과 보안 헤더도 Vercel 배포에서만 적용됩니다.
- 정적 호스팅에서도 LIVON 화면은 깨지지 않습니다(§4). provider 영역은 표시되지 않고, LIVON AI는 "서버에 연결되어 있지 않습니다"라고 안내합니다.

## 2. Provider 상태

| provider | 상태 | 필요한 것 |
|---|---|---|
| `kr-youth-policy` | READY — KEY REQUIRED | `YOUTHCENTER_API_KEY` + 서버 함수 호스팅 |
| `kr-business-support` | READY — KEY REQUIRED | `BIZINFO_API_KEY` + 서버 함수 호스팅 |
| `kr-business-event` | READY — KEY REQUIRED | `BIZINFO_API_KEY` (행사정보 API 사용신청) + 서버 함수 호스팅 |
| `kr-kakao-place` | READY — KEY REQUIRED | `KAKAO_REST_API_KEY` + 서버 함수 호스팅 |
| `kr-tourapi` | READY — KEY REQUIRED | `TOURAPI_SERVICE_KEY` + 서버 함수 호스팅 |
| `kr-lifelong-class` | READY — KEY REQUIRED | `PUBLIC_DATA_SERVICE_KEY` (전국평생학습강좌표준데이터 활용신청) + 서버 함수 호스팅 |
| `kr-public-tax-expert` | READY — KEY REQUIRED | `PUBLIC_DATA_SERVICE_KEY` (대구 동구·인천 API 각각 활용신청) + 서버 함수 호스팅 |
| `kr-job-training` | READY — KEY REQUIRED | `WORK24_TRAINING_API_KEY` (고용24 기업회원, 심사) + 서버 함수 호스팅 |
| public-law-expert | BLOCKED (provider 아님) | 공식 원본 파일 다운로드 필요. `wip/livon-public-law-expert`에 보존 |

- LIVE VERIFIED: 0개 — 실제 키로 실제 호출한 적이 없습니다. 코드와 테스트는 문서화된 필드로 만든 [QA 픽스처]로 검증했습니다.
- MOCK/FALLBACK: 0개 — 키가 없으면 해당 provider 결과를 **표시하지 않습니다**. 샘플 데이터를 실제처럼 보여 주지 않습니다.

## 3. 환경변수 (서버 전용, 전부 `.env.example`에 있음)

| 변수 | 사용처 | 발급처 | 필수 | 없을 때 | production |
|---|---|---|---|---|---|
| `OPENAI_API_KEY` | LIVON AI | OpenAI Platform | AI 사용 시 필수 | AI가 "연결이 아직 완료되지 않았습니다" 안내 | 필요 |
| `OPENAI_MODEL` | LIVON AI | – | 선택 (기본 `gpt-4.1-mini`) | 기본 모델 | 선택 |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | LIVON AI 요청 제한 | Upstash | production AI 필수 | production에서 AI가 fail closed(503) | 필요 |
| `LIVON_RATE_LIMIT_SECRET` | LIVON AI 요청 제한 | 직접 생성 (`openssl rand -hex 32`) | production AI 필수 | 위와 같음 | 필요 |
| `LIVON_DAILY_REQUEST_LIMIT` | LIVON AI | – | 선택 (기본 500) | 기본값 | 선택 |
| `YOUTHCENTER_API_KEY` | kr-youth-policy | 온통청년 오픈API | provider 사용 시 | 해당 결과 미표시 | 필요 |
| `BIZINFO_API_KEY` | kr-business-support, kr-business-event | 기업마당 API (API별 사용신청) | provider 사용 시 | 해당 결과 미표시 | 필요 |
| `KAKAO_REST_API_KEY` | kr-kakao-place | Kakao Developers (REST API 키) | provider 사용 시 | 장소 검색 영역 미표시 | 필요 |
| `TOURAPI_SERVICE_KEY` | kr-tourapi | 공공데이터포털 (한국관광공사 국문 관광정보) | provider 사용 시 | 관광정보 영역 미표시 | 필요 |
| `PUBLIC_DATA_SERVICE_KEY` | kr-lifelong-class, kr-public-tax-expert | 공공데이터포털 (API마다 활용신청) | provider 사용 시 | 해당 결과 미표시 | 필요 |
| `WORK24_TRAINING_API_KEY` | kr-job-training | 고용24 OPEN-API (기업회원 → 신청 → 심사) | provider 사용 시 | 직업훈련 영역 미표시 | 필요 |
| `LIVON_DATA_DIAGNOSTICS` | 진단 | – | 선택 | 진단 HTTP 비활성 | 비워 둠 |
| `NEWON_PLUS_FIREBASE_*` 4개, `NEWON_PLUS_AUTH_PERSISTENCE` | Newon+ 인증 (공개 웹 설정, 빌드 시) | Newon+ Firebase 프로젝트 (미생성) | 선택 | 익명 모드 | V1 불필요 |
| `NEWON_AUTH_VERIFY_ENABLED`, `NEWON_AUTH_ALLOWED_ISSUERS` | 서버 토큰 검증 | – | 선택 | 검증 비활성 | V1 불필요 (`false`) |

키 값은 저장소 어디에도 없습니다. 호스팅의 환경변수(secret)로만 넣습니다.

## 4. 실패 안전성 (확인 결과)

- 서버: 8개 provider 모두에 대해 아래 상황을 테스트했습니다(OPS-4, OPS-5, OPS-19).
  - timeout, network 실패, HTTP 400/401/403/404/429/500/502/503, 빈 본문, HTML 응답, 잘못된 JSON, 형식 불일치, 키 없음, 결과 0건
  - 결과는 고정 코드(`NOT_CONFIGURED`/`TIMEOUT`/`UPSTREAM_ERROR`/`UPSTREAM_LIMIT`)로만 나가고, 원문·키·stack은 노출되지 않습니다. 결과 0건은 정상 응답(200, 빈 목록)입니다.
- 브라우저: `/api/*`를 404 HTML(GitHub Pages), 네트워크 끊김, 잘못된 JSON, 429, 500, 25초 지연으로 바꿔 확인했습니다.
  - 7개 화면과 탐색의 정책·클래스·직업훈련·장소·전문가 탭 모두 JS 오류 0, 기술 문구 노출 0, 무한 로딩 0입니다.
  - LIVON AI는 오류 안내를 표시하고 입력창을 다시 쓸 수 있습니다.

## 5. 이번 RC에서 바꾼 것

- `livon/data/livon-data-providers.js`: 서버 provider를 켤 때 캐시를 무시하고 다시 불러오던 동작을 고쳤습니다.
  - 이전에는 새로고침할 때마다 `/api/livon/data`를 provider 수만큼(6회) 호출했습니다. 이제 캐시 유효 기간 안에서는 상태 확인 1회만 호출합니다.
- `.env.example`: `LIVON_DATA_DIAGNOSTICS`(선택)를 추가했습니다.
- 테스트 추가: OPS-19(실패 조합 전체), OPS-20(부팅 시 캐시 유지).
- 이 문서를 추가했습니다.

> 후속: 별도 API 배포 구조는 `docs/livon/live-backend.md`를 봅니다.

## 6. 남은 blocker와 V1.1

- **Blocker**
  1. 서버 함수 호스팅이 필요합니다. 현재 `www.newon.app`(GitHub Pages)에는 `/api`가 없습니다.
  2. 호스팅 환경에 API 키와 AI 보호 설정을 넣어야 합니다(§3).
  3. 개인정보 처리방침에 LIVON AI 처리 내용(질문이 외부 AI 제공자에게 전달됨)을 반영해야 합니다. 현재 Newon 처리방침에는 LIVON 관련 항목이 없고, LIVON 앱 화면에서 처리방침으로 가는 링크도 없습니다.
- **V1.1**
  - `/api/livon/data`의 클라이언트별 요청 제한. 현재는 서버 캐시만 있어, 반복 검색으로 공공 API 쿼터가 소진될 수 있습니다. 쿼터가 소진되면 화면은 "불러오지 못했습니다" 상태가 됩니다(장애는 아님).
  - 주제 이미지 최적화: 300–740KB JPEG. 오늘의 발견 첫 화면에서 이미지만 약 6MB입니다.
  - CSP enforce 전환(현재 report-only), Newon+ LIVE AUTH, 계정 동기화 endpoint.
