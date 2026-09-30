# LIVON AI — Production Activation 아키텍처

작성일: 2026-09-30 · 브랜치: `livon-data-ai-v1` (기준 `07adb5275`)
테스트: `tests/livon/ai-activation.test.mjs` (AI-1 ~ AI-12). 기존 `chat / ai / live-backend` 테스트도 모두 유지합니다.

> **상태: 코드 준비 완료, 운영은 아직 연결되지 않았습니다.**
> Production(`www.newon.app`, GitHub Pages)에는 `/api`가 없어서 지금은 "LIVON AI 서버에 연결되어 있지 않습니다"가 표시됩니다.
> 실제로 켜려면 별도 API 배포(Vercel)와 서버 secret 입력, 그리고 저장소 변수 `LIVON_API_ORIGIN` 설정이 필요합니다(§8). 이 작업에서는 배포도, DNS 변경도 하지 않았습니다.

## 1. 전체 구조

```
브라우저 (GitHub Pages, 정적)                         LIVON API (Vercel, API 전용 프로젝트 LIVON_API_ONLY=1)
https://www.newon.app/livon/                         https://<LIVON API origin>
 ├ livon-api-config.js ── LivonApi.url() ──HTTPS──▶  GET  /api/health               상태(불리언만)
 │   (production / preview / local)                  GET  /api/livon/data/status    공공데이터 provider 설정 여부
 ├ ai-page.js ── POST /api/livon/chat ─────────────▶ POST /api/livon/chat  (= /api/livon/ai/chat)
 │   · 요청: 질문 + 최근 대화 + (선택)개인화 + 참고 항목     │ CORS allowlist → 입력 검증 → rate limit(Upstash, HMAC IP)
 │   · 오류 상태 구분 · 다시 시도                         │ → Data Platform 참고 항목(서버) → OpenAI Responses(store:false)
 └ My Life (localStorage) ◀── 사용자 승인 ── AI 제안    └ 저장·로그 없음
```

- GitHub Pages에 API를 억지로 넣지 않았습니다. 이미 있는 Vercel 구조(`api/*.mjs` + `server/livon/*`, `scripts/vercel-build.mjs`의 API 전용 모드)를 그대로 씁니다.
- 프론트엔드는 GitHub Pages에 남습니다. 빌드할 때 `LIVON_API_ORIGIN`이 `livon-api-config.js`에 들어가면 브라우저는 그 주소로 API를 부릅니다.

## 2. Frontend

- **`livon/livon-api-config.js`** (`scripts/livon-api-config.mjs`가 생성합니다. 이번에 환경 분리를 추가했습니다)

  | 환경 | 판정 (location.hostname) | API base |
  |---|---|---|
  | production | `www.newon.app`, `newon.app` (또는 location 없음) | `LIVON_API_ORIGIN` (없으면 같은 주소) |
  | preview | 그 밖의 호스트 (예: `*.vercel.app` 미리보기) | `LIVON_API_ORIGIN_PREVIEW` (없으면 같은 주소) |
  | local | `localhost`, `127.0.0.1`, `[::1]` | 항상 같은 주소 (`npm run dev:livon`이 `/api` 제공) |

  - https origin만 받습니다. 경로·쿼리·자격증명·`*`가 들어가면 무시하고 같은 주소로 둡니다.
  - 값은 공개 정보입니다. 키는 절대 넣지 않습니다(AI-11).
  - `api.newon.app`은 코드가 가정하지 않습니다. DNS를 만들기 전에는 Vercel 기본 도메인(`<project>.vercel.app`)을 그대로 쓰면 됩니다.
- **`livon/ai-page.js`** (기존 코드를 재사용하고, `offline` 상태 하나만 추가했습니다)

  | 상태 | 표시 |
  |---|---|
  | 연결되지 않음 (404/405, health 실패) | "LIVON AI 서버에 연결되어 있지 않습니다" |
  | 설정 미완료 (`AI_NOT_CONFIGURED`, 보호 미설정) | "LIVON AI 연결이 아직 완료되지 않았습니다" |
  | 사용량 많음 (429, `Retry-After`) | "요청이 많습니다. N초 뒤에 다시 시도해 주세요." |
  | 시간 초과 (504 / 브라우저 35초) | "답변 생성 시간이 초과되었습니다" |
  | 서버 오류 (5xx) | "LIVON AI 서버에서 오류가 발생했습니다" |
  | 잘못된 응답 (JSON 아님, 형식 오류) | "AI 응답을 해석하지 못했습니다" |
  | 오프라인 (`navigator.onLine === false`) | "인터넷에 연결되어 있지 않습니다" (**신규**) |

  - 모든 상태에서 "다시 시도" 버튼이 나오고, 페이지와 다른 메뉴는 그대로 동작합니다. 브라우저 QA에서 7가지 상태를 확인했습니다.
- 브라우저 요청에 들어가는 것:
  - 질문, 최근 대화(최대 12개 / 12,000자), 답변 길이
  - 개인화를 **켰을 때만** 사용자가 AI 설정에 직접 입력한 연령대·관심사·지역·목표
  - 화면 맥락(사용자가 지울 수 있음), 참고 항목(종류·제목·링크)

## 3. Backend / API

| 경로 | 파일 | 설명 |
|---|---|---|
| `GET /api/health` | `api/health.mjs` → `server/livon/health.mjs` | 상태·AI 준비 여부·provider 설정 여부. 키·URL·한도는 넣지 않음 |
| `GET /api/livon/data/status` | `api/livon/data/status.mjs` (**신규**) | `/api/livon/data?action=status`와 같은 내용, 역할별 경로 |
| `GET/POST /api/livon/data` | 기존 | 공공데이터 provider 프록시 + 캐시 |
| `POST /api/livon/ai/chat` | `api/livon/ai/chat.mjs` (**신규**) | 역할별 경로. `/api/livon/chat`과 같은 handler |
| `POST /api/livon/chat` | 기존 | 현재 프론트엔드가 쓰는 경로(호환 유지) |

- 향후 `POST /api/livon/ai/search`, `/api/livon/ai/plan`은 같은 handler 패턴(`server/livon/http.mjs`)과 `server/livon/ai/tools.mjs`를 재사용하면 됩니다. 이번에는 만들지 않았습니다.
- 로컬: `scripts/serve-publish.mjs`가 위 경로를 모두 제공합니다.
- Vercel: `vercel.json`의 `functions`에 새 경로를 등록했고, chat 함수에는 `includeFiles`로 큐레이션 데이터 파일을 함께 올립니다.

## 4. Security

- **Secret:** `OPENAI_API_KEY`, Upstash 토큰, `LIVON_RATE_LIMIT_SECRET`, 공공 API 키는 **Vercel 서버 환경변수에만** 둡니다.
  - HTML, JS, 공개 설정, GitHub Pages 산출물, 저장소에는 없습니다.
  - AI-11 테스트가 `livon/**`와 빌드된 `_publish/livon/**` 전체에서 키 패턴을 검사합니다.
  - `/api/health`는 불리언만 돌려줍니다.
- **입력:**
  - `Content-Type: application/json`이 아니면 415입니다.
  - 본문 64KB, 메시지 4,000자, 대화 12개 / 12,000자, 개인화 항목 300자, 참고 항목 6개(허용된 LIVON 경로나 https만)까지 받습니다.
  - role 위조와 알 수 없는 필드는 거부하거나 버립니다.
- **안전한 파싱:**
  - 요청 JSON이 깨지면 400 `INVALID_JSON`입니다.
  - OpenAI 응답이 JSON이 아니거나 형식이 다르면 502 `INVALID_AI_RESPONSE`입니다. 이번에 수정했습니다. 전에는 네트워크 오류로 잘못 분류됐습니다.
- **오류 응답:** 고정된 코드와 사용자용 문장만 보냅니다. upstream 본문, 스택, 키는 응답과 로그에 넣지 않습니다(AI-8).
- **Timeout:** OpenAI 25초, 제한 저장소 3초, 서버 참고 항목 조회 1.5초(넘으면 참고 항목 없이 답변), 브라우저 35초. 브라우저가 연결을 끊으면 upstream 요청도 취소합니다.
- **Abuse 방지:** CORS allowlist, 경로·메서드·헤더 제한, rate limit(§6), 사이트 전체 일일 상한(비용 차단기). IP는 Vercel 플랫폼 헤더(`x-vercel-forwarded-for`)만 믿습니다.

## 5. Privacy

- 서버는 질문·답변을 **저장하지 않고**, production에서는 본문 로그도 남기지 않습니다. OpenAI에는 `store: false`로 보냅니다.
  - AI-12 테스트: 요청 1건이 닿는 곳은 OpenAI와 제한 저장소 두 곳뿐입니다.
- 건강·가족·금융 등 민감한 내용을 계정 프로필이나 서버에 영구 저장하는 기능은 없습니다. 계정 백엔드(`userdata`)와도 연결하지 않았습니다.
- My Life 데이터(`livon.mlStore.v1`)는 AI 요청에 자동으로 들어가지 않습니다. `requestPayload`는 My Life 저장소를 읽지 않습니다(테스트로 확인).
- 개인화를 끄면 연령대·지역·목표 같은 설정값도 서버가 버립니다.
- 대화 기록은 기존처럼 사용자 브라우저에만 저장됩니다. 대화 삭제 기능이 있습니다.
- 서버의 참고 항목 조회는 메모리에서만 이뤄지고 아무것도 기록하지 않습니다.

## 6. Rate limiting (기존 Upstash 코드 재사용)

- `server/livon/chat.mjs`의 `checkRateLimit`: EVAL 한 번으로 여러 한도를 원자적으로 검사합니다.
  - 익명 클라이언트는 `HMAC(LIVON_RATE_LIMIT_SECRET, IP)`로만 구분하고, IP 원문은 저장하지 않습니다. 키는 기간이 끝나면 사라집니다.
- 기본값:
  - 3초에 1회, 분당 6회, 클라이언트당 하루 50회
  - 사이트 전체 하루 500회
  - `LIVON_AI_MINUTE_LIMIT`, `LIVON_AI_CLIENT_DAILY_LIMIT`, `LIVON_DAILY_REQUEST_LIMIT`로 바꿀 수 있습니다. 잘못된 값이면 요청을 막습니다(fail closed).
- production에서 Upstash가 설정되지 않았거나 응답하지 않으면 503을 돌려주고 OpenAI를 부르지 않습니다(fail closed). 로컬에서는 메모리 제한을 씁니다.
- 계정 백엔드와 묶여 있지 않습니다. `userdata`의 제한은 `server/livon/ratelimit.mjs`의 별도 scope를 씁니다.

## 7. CORS

- `server/livon/cors.mjs`(기존)
  - production 기본 허용 목록은 `https://www.newon.app`, `https://newon.app`입니다.
  - `LIVON_ALLOWED_ORIGINS`(쉼표 구분, https만)로 바꿀 수 있습니다. 목록을 지정하면 기본값을 **대체**합니다.
- `*`와 credentials는 쓰지 않습니다. preflight는 `Content-Type` 헤더만 허용합니다. 허용되지 않은 origin은 upstream을 부르기 전에 403으로 막습니다.
- Preview는 `LIVON_ALLOWED_ORIGINS`에 preview 주소를 넣고, Local(`localhost`)은 production이 아닐 때만 허용합니다(AI-10).

## 8. 환경변수 · 활성화 절차

| 변수 | 어디에 | 공개 | 용도 |
|---|---|---|---|
| `OPENAI_API_KEY` | Vercel API 프로젝트 → Settings → Environment Variables (Production) | **secret** | LIVON AI 답변 생성 |
| `OPENAI_MODEL` | Vercel | 서버 | 선택. 기본값 `gpt-4.1-mini` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Vercel | **secret** | AI rate limit(필수, 없으면 production에서 AI가 막힘) + 공공데이터 공유 캐시 |
| `LIVON_RATE_LIMIT_SECRET` | Vercel | **secret** | IP HMAC용. 32자 이상(`openssl rand -hex 32`) |
| `LIVON_API_ONLY` | Vercel | 서버 | `1` → API 전용 배포(사이트 복제 없음, noindex) |
| `LIVON_ALLOWED_ORIGINS` | Vercel | 서버 | 선택. 비우면 www.newon.app, newon.app |
| `LIVON_AI_SERVER_REFS` | Vercel | 서버 | 선택. `0`이면 서버 참고 항목을 끔 |
| `LIVON_API_ORIGIN` | GitHub 저장소 → Settings → Secrets and variables → Actions → **Variables** | 공개 | Pages 빌드가 API 주소를 `livon-api-config.js`에 씀 |
| `LIVON_API_ORIGIN_PREVIEW` | 미리보기 빌드 환경 | 공개 | 선택 |
| 공공데이터 키 (`YOUTHCENTER_API_KEY` 등 6개) | Vercel | **secret** | 선택. `docs/livon/live-backend.md` §5 |

순서:

1. Vercel에서 이 저장소를 **API 전용 프로젝트**로 가져옵니다(Framework: Other, `vercel.json` 그대로). 그리고 `LIVON_API_ONLY=1`을 설정합니다.
2. Upstash Redis를 만들고, 위 secret들을 **Production**에 입력한 뒤 Redeploy합니다.
3. `https://<project>.vercel.app/api/health`에서 `ai.ready: true`인지 확인합니다.
4. GitHub 저장소 Variables에 `LIVON_API_ORIGIN = https://<project>.vercel.app`(또는 DNS를 연결한 `https://api.newon.app`)를 추가합니다.
5. main 배포 때 Pages 빌드가 API 주소를 반영합니다(이번 작업에서는 배포하지 않았습니다). 이후 `/livon/#ai-chat`에서 실제 답변과 429 동작을 확인합니다.

- `api.newon.app`은 DNS 레코드를 만들어야 존재합니다. 이 작업에서는 확인하지도, 만들지도 않았습니다.
- `vercel.json`의 LIVON CSP(`connect-src`)는 **Vercel이 프론트엔드를 서비스할 때만** 적용됩니다. GitHub Pages는 헤더를 보내지 않습니다. 나중에 프론트엔드를 Vercel로 옮기면 API origin을 추가해야 합니다.

## 9. Data Platform 연동 (AI가 단순 wrapper가 아니도록)

`server/livon/ai/tools.mjs`는 브라우저와 **같은** `livon-data-platform.js`와 큐레이션 파일을 격리된 vm에 불러 Repository를 만듭니다. 인스턴스당 한 번만 불러옵니다.

| 도구 | 반환 |
|---|---|
| `searchLivonData(query, filters)` | 타입이 붙은 항목 목록 (모든 entity 타입) |
| `getLifeEventContext(idOrQuery, {lifeStage})` | Life Event + 체크리스트 + 주제 + 관련 정책·서비스·콘텐츠·커뮤니티 |
| `getRelatedServices(idOrQuery)` · `getRelatedPolicies(idOrQuery)` | 명시적 링크를 우선하고, 그다음 규칙으로 찾은 관련 서비스·공식 정책 포털 |
| `groundingRefs(input)` | chat 요청 한 건의 참고 항목(최대 6개, `REF_HREF`를 통과한 것만) |

- chat handler는 `withServerRefs`로 **클라이언트 참고 항목을 먼저 두고**, 남은 칸만 서버 검색 결과로 채웁니다. 결과는 기존 "LIVON 참고 항목" 블록으로 모델에 전달됩니다. 기존 지침은 이 항목만 LIVON 링크로 쓰게 하고, 없는 콘텐츠를 만들지 못하게 되어 있습니다.
- 게시되고, 출처가 있고, 샘플이 아니고, 만료되지 않은 항목만 참고 항목이 됩니다. 조회가 1.5초를 넘거나 실패하면 참고 항목 없이 답합니다.
- 향후 tool-calling(모델이 직접 도구를 고르는 방식)으로 확장할 때도 위 함수 계약을 그대로 쓰면 됩니다.

## 10. My Life 승인 흐름 (기존 코드 재사용, 변경 없음)

```
AI 답변 (계획/체크리스트 JSON 블록은 제안일 뿐)
  → "내 생활에 추가" → 미리보기 모달 (항목 선택·문구 수정, 중복 표시)
  → 사용자가 "승인하고 추가"를 누름
  → LivonMyLife.api.saveTodo / saveGoal (localStorage, source: "livon-ai")
```

- 승인하기 전에는 아무것도 저장되지 않습니다. 저장 호출은 승인 handler 안에만 있습니다(AI-12 테스트).
- 서버는 My Life에 쓸 수 없습니다.
