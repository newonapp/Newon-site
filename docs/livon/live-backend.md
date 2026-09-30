# LIVON Live Backend V1 — 별도 API 배포 구조

작성일: 2026-09-29 · 기준: `livon-v1-release` (2488777a5 이후)

> 상태: **코드와 설정 구조만 준비했습니다.** Vercel 프로젝트, 도메인, API 키는 아직 없습니다. 배포나 DNS 변경은 하지 않았습니다.
> 실제 API 호출 검증(LIVE VERIFIED)을 마친 provider는 없습니다.

## 1. 구조

현재 (확인한 사실, 2026-09-29):

```
www.newon.app ── GitHub Pages (정적) ── /livon/ 화면만 있음, /api/* 없음 (404)
```

권장 production 구조:

```
브라우저 ── https://www.newon.app/livon/        GitHub Pages (그대로 유지)
   │
   └─HTTPS─▶ https://<LIVON API 도메인>          Vercel 프로젝트 (API 전용, LIVON_API_ONLY=1)
               /api/health          상태 확인 (키 값 없음)
               /api/livon/data      공공데이터 8개 provider 프록시 + 서버 캐시
               /api/livon/chat      LIVON AI → 요청 제한(Upstash) → OpenAI
```

- 프론트엔드는 옮기지 않습니다. GitHub Pages 빌드가 `LIVON_API_ORIGIN` 값을 `livon/livon-api-config.js`에 넣으면 LIVON이 그 주소로 API를 호출합니다.
- `LIVON_API_ORIGIN`이 비어 있으면 지금과 같이 같은 주소의 `/api`를 부릅니다. GitHub Pages에는 없으므로 LIVON은 "연결되지 않음" 상태를 그대로 표시합니다.
- API 도메인은 두 가지 중에서 고릅니다.
  - Vercel 기본 도메인(`<project>.vercel.app`)
  - `api.newon.app` 같은 하위 도메인. 사용자의 DNS 설정이 필요합니다. 코드는 도메인 이름을 가정하지 않습니다.
- 브라우저가 OpenAI나 공공 API를 직접 부르는 경로는 없습니다. 키는 전부 Vercel 서버 환경변수에만 둡니다.

## 2. 이번에 추가·변경한 코드

| 파일 | 내용 |
|---|---|
| `server/livon/cors.mjs` | CORS 허용 목록(정확한 https origin만, `*` 금지, localhost는 production 외에서만). 허용 헤더는 `Content-Type`만, credentials 없음 |
| `server/livon/http.mjs` | AI endpoint가 CORS 규칙을 사용합니다. 기존의 "같은 주소만 허용"을 허용 목록 기반으로 바꿨고, OPTIONS를 처리합니다 |
| `server/livon/health.mjs`, `api/health.mjs` | `/api/health`: 상태, 서버 시각, AI 설정 여부, 8개 provider의 설정 여부(true/false)만 반환. 키·토큰·URL은 넣지 않음 |
| `server/livon/data/http.mjs` | data endpoint에 CORS와 OPTIONS 처리 추가 |
| `server/livon/chat.mjs` | AI 요청 제한 수치를 한 곳(`RATE_DEFAULTS`)에 모으고 환경변수로 바꿀 수 있게 함. 잘못된 값이면 요청을 막음(fail closed) |
| `scripts/livon-api-config.mjs`, `livon/livon-api-config.js` | 브라우저의 API 주소 설정 한 곳. https origin만 허용 |
| `livon/ai-page.js`, `livon/data/livon-data-config.js`, `livon/index.html` | 위 설정을 사용합니다. 기본값은 같은 주소입니다 |
| `scripts/publish-site.mjs`, `.github/workflows/github-pages.yml` | Pages 빌드가 저장소 **변수**(secret 아님) `LIVON_API_ORIGIN`을 읽음 |
| `scripts/vercel-build.mjs`, `vercel.json` | `LIVON_API_ONLY=1`이면 사이트 복사본 없이 noindex 안내 페이지와 `robots.txt`(Disallow)만 게시. 값이 없으면 기존 전체 빌드와 같음. `/api/*`에 `X-Robots-Tag: noindex` |
| `tests/livon/live-backend.test.mjs` | LB-1~LB-11 |

## 3. 환경변수

| 변수 | 어디에 | 공개 여부 | 설명 |
|---|---|---|---|
| `LIVON_API_ORIGIN` | GitHub 저장소 **Variables** (Actions) | 공개 | API 도메인 (예: `https://<project>.vercel.app`) |
| `LIVON_API_ONLY` | Vercel API 프로젝트 | 서버 | `1` |
| `LIVON_ALLOWED_ORIGINS` | Vercel | 서버 | 비우면 `https://www.newon.app,https://newon.app` |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Vercel | **secret** | LIVON AI |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Vercel | **secret** | AI 요청 제한 + 공공데이터 공유 캐시 |
| `LIVON_RATE_LIMIT_SECRET` | Vercel | **secret** | 32자 이상 (`openssl rand -hex 32`) |
| `LIVON_AI_MINUTE_LIMIT`, `LIVON_AI_CLIENT_DAILY_LIMIT`, `LIVON_DAILY_REQUEST_LIMIT` | Vercel | 서버 | 선택. 기본값 6/분, 50/일(사용자당), 500/일(사이트 전체) |
| provider 키 6개 | Vercel | **secret** | §5 |

## 4. 보안

- **CORS**
  - 허용 목록에 있는 origin에는 그 origin만 돌려줍니다. `*`와 credentials는 쓰지 않습니다.
  - 허용되지 않은 origin은 403 `ORIGIN_NOT_ALLOWED`입니다. upstream(OpenAI·공공 API) 호출 전에 막습니다.
  - preflight는 `Content-Type` 헤더만 허용합니다. `Authorization`은 Newon+ 인증이 연결될 때 추가합니다.
- **AI 요청 제한 (Upstash)**
  - 익명 사용자는 IP의 HMAC(`LIVON_RATE_LIMIT_SECRET`)으로만 구분합니다. IP 원문은 저장하지 않습니다.
  - 키는 제한 기간(3초, 1분, 1일)이 지나면 자동으로 사라집니다.
  - 사이트 전체 하루 상한으로 OpenAI 비용을 묶어 둡니다.
  - production에서 Upstash가 없거나 응답하지 않으면 AI는 503을 반환하고 OpenAI를 호출하지 않습니다.
- **로그**: production에서 AI·data 라우트는 로그를 남기지 않습니다. 개발 환경에서도 고정 코드와 상태만 남깁니다.
- **OpenAI**: 요청에 `store: false`, 출력 1,200 토큰 상한, 25초 timeout을 둡니다. 401/403/429/5xx, 잘못된 응답, 네트워크 오류는 각각 고정 코드로 처리합니다.

## 5. Provider 활성화 체크리스트

공통 확인 방법:

- 테스트 endpoint: `GET https://<API 도메인>/api/livon/data?provider=<id>[&query=…]`
- 성공 판정:
  - 200, `ok:true`, `items` 1건 이상
  - 각 항목에 실제 출처(`source.providerName`)가 있음
  - `/api/health`에서 해당 provider가 `configured:true`
  - 화면에 [QA 픽스처]가 아닌 실제 데이터가 보임
- 실패 시 동작: 고정 코드(`NOT_CONFIGURED`/`TIMEOUT`/`UPSTREAM_ERROR`/`UPSTREAM_LIMIT`)를 반환하고, 화면은 해당 영역을 숨기거나 "불러오지 못했습니다"로 표시합니다. 다른 provider에는 영향이 없습니다.

| provider | API / 발급처 | 환경변수 | 승인 | 테스트 요청 | 캐시 (서버) | 호출 한도 |
|---|---|---|---|---|---|---|
| kr-youth-policy | 온통청년 청년정책 Open API | `YOUTHCENTER_API_KEY` | 사이트 신청·승인 | `?provider=kr-youth-policy` | 정책 24시간 | 발급처 정책 확인 |
| kr-business-support | 기업마당 지원사업정보 API | `BIZINFO_API_KEY` | API 사용신청 | `?provider=kr-business-support` | 24시간 | 발급처 정책 확인 |
| kr-business-event | 기업마당 행사정보 API | `BIZINFO_API_KEY` (행사정보 API 별도 사용신청) | 사용신청 | `?provider=kr-business-event` | 6시간 | 발급처 정책 확인 |
| kr-kakao-place | Kakao Local REST (키워드·카테고리) | `KAKAO_REST_API_KEY` | 앱 생성 후 REST API 키 (콘솔의 로컬 API 사용 설정 확인) | `?provider=kr-kakao-place&query=도서관` | 검색 1시간, 위치 검색 5분 (메모리 전용) | 카카오 일일 쿼터 |
| kr-tourapi | 공공데이터포털 한국관광공사 국문 관광정보(GW) | `TOURAPI_SERVICE_KEY` | 활용신청 (자동승인 여부 확인) | `?provider=kr-tourapi&query=경복궁` | **없음** (저작권 정책, 동시 요청만 합침) | 개발계정 1,000/일 (문서 기준) |
| kr-lifelong-class | 공공데이터포털 전국평생학습강좌표준데이터 | `PUBLIC_DATA_SERVICE_KEY` | 활용신청 | `?provider=kr-lifelong-class` | 24시간 | 개발계정 10,000/일 (문서 기준) |
| kr-public-tax-expert | 공공데이터포털 대구 동구 마을세무사 + 인천 마을세무사(odcloud) | `PUBLIC_DATA_SERVICE_KEY` | API마다 활용신청 | `?provider=kr-public-tax-expert` | 7일 (일부 source 실패 시 1시간) | 발급처 정책 확인 |
| kr-job-training | 고용24 OPEN-API 국민내일배움카드 훈련과정 (310L01/310L02) | `WORK24_TRAINING_API_KEY` | 기업회원, 신청, 담당자 심사 | `?provider=kr-job-training&query=웹` | 목록 6시간 / 상세 24시간 | 미공개 |

- 키가 없는 provider는 `READY — KEY REQUIRED` 상태로 둡니다. 가짜 키로 시험하지 않습니다.
- **공유 캐시**: Upstash가 설정되면 서버 캐시가 인스턴스 간에 공유됩니다(메모리 → Upstash). 설정이 없으면 인스턴스별 메모리 캐시만 씁니다. 캐시 장애는 요청 실패로 이어지지 않습니다.
- **브라우저 캐시**: 같은 TTL로 localStorage에도 저장합니다. 새로고침할 때마다 provider를 다시 부르지 않습니다(RC에서 수정).

## 6. 개인정보 처리방침에 필요한 기술적 사실 (코드 기준 — 법률 문구 아님)

| 항목 | 사실 |
|---|---|
| 기기 저장 | LIVON의 할 일·목표·일정·저장 항목·관심사·연령대·커뮤니티 글·AI 대화는 **사용자 브라우저 localStorage에만** 저장됩니다. 계정과 서버 저장소는 없습니다(V1). 브라우저 데이터를 지우거나 AI 화면에서 대화를 삭제하면 사라집니다. |
| LIVON AI → LIVON 서버 | 전송: 질문, 최근 대화(최대 12개, 12,000자), 답변 길이 설정, 사용자가 AI 설정에 직접 입력한 연령대·관심사·지역·목표(개인화가 켜져 있고 값이 있을 때만), 사용자가 제거하지 않은 화면 맥락(주제 제목 등), LIVON 참고 항목(제목·종류·링크). 내 생활·커뮤니티 기록은 자동으로 보내지 않습니다. |
| LIVON 서버 → OpenAI | 위 내용과 서비스 지침을 OpenAI Responses API로 전달합니다(`store: false`). OpenAI 쪽 보관 정책(남용 모니터링 목적 보관 등)과 국외 이전 여부는 **OpenAI 공식 정책 확인이 필요합니다**. |
| LIVON 서버 저장·로그 | 질문과 답변을 저장하지 않고, production에서 본문 로그도 남기지 않습니다. 요청 제한용으로 IP의 HMAC 값을 Upstash에 최대 1일(키 만료) 보관합니다. 호스팅(Vercel)의 요청 로그 보관은 **Vercel 정책 확인이 필요합니다**. |
| 공공데이터 검색 | 검색어·지역·필터를 LIVON 서버를 거쳐 해당 기관 API로 전달합니다. 결과는 서버 캐시에 보관하지만 사용자 식별 정보는 없습니다. 검색어는 GET 주소에 포함되므로 호스팅 요청 로그에 남을 수 있습니다. |
| 위치 | "가까운 장소" 기능은 사용자가 누를 때만 브라우저 위치를 요청합니다. 좌표는 소수점 3자리(약 100m)로 줄여 POST 본문으로 보내며, Kakao/한국관광공사 API에 전달합니다. 결과는 서버 메모리에 5분만 보관하고 공유 캐시에는 넣지 않습니다. |
| 쿠키·추적 | LIVON API는 쿠키를 쓰지 않습니다(CORS credentials 없음). |
| 처리방침 접근 | 현재 LIVON 앱 화면에는 처리방침 링크가 없습니다. 처리방침 문구가 확정되면 최소 변경으로 아래 두 곳에 텍스트 링크 1개씩을 넣는 것을 권장합니다. 디자인 변경은 없습니다. |

- AI 화면의 개인정보 안내 문구 옆(`#lv-ai-privacy`)
- 내 생활 › 알림·개인정보 설정(`#ml-settings`)

## 7. 남은 것 (V1.1)

- `/api/livon/data` 사용자별 요청 제한: 현재는 캐시만으로 보호합니다. TourAPI는 캐시가 없으므로 개발계정 1,000/일을 넘으면 `UPSTREAM_LIMIT`가 됩니다. 이때 화면은 "불러오지 못했습니다"로 표시됩니다.
- Vercel에서 프론트엔드까지 서비스하게 되면 LIVON CSP의 `connect-src`에 API 도메인을 추가해야 합니다. GitHub Pages는 헤더를 지원하지 않아 현재는 적용되지 않습니다.
