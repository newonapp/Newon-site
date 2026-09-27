# LIVON AI 구현 및 운영 안내

## 현재 상태 (2026-09-26)

- Newon/LIVON은 정적 HTML/CSS/JavaScript 사이트다. 별도 `nawon-portfolio`에 Vite가 있지만 LIVON 실행 구조와 무관하다.
- 실제 `www.newon.app/livon/` 응답 헤더는 `server: GitHub.com`이다. GitHub Actions가 `_publish`를 `gh-pages`에 올린다. 운영 `/api/health`는 404다.
- 기존 `livon/ai_api_server.py`는 로컬 전용 Python 프록시였다. 새 UI는 이 서버나 방문자의 localhost를 호출하지 않는다. 파일은 기존 도구 호환을 위해 남겨두었지만 공개 배포하지 않는다.
- Vercel 설정은 있었지만 AI Function은 없었다. 이번 구현은 정적 사이트와 Node Functions를 같은 Vercel 프로젝트에서 제공하는 구성을 사용한다.
- LIVON/Newon+를 위한 실제 서버 인증·계정 동기화는 확인되지 않았다. admin 및 OX Month의 별도 Firebase 인증은 수정하지 않았다. 브라우저의 userId를 인증으로 신뢰하지 않는다.
- **코드와 로컬 테스트 완료 ≠ 운영 서비스 활성화.** 실제 OpenAI 키, Upstash 연결, Vercel 프로젝트/도메인 설정은 사용자가 직접 완료해야 한다. 실제 OpenAI 응답·실제 Redis·Vercel Production 통합 테스트는 아직 수행하지 않았다.

## 요청 흐름

`livon/ai-page.js → POST /api/livon/chat → 입력/출처 검증 → 공유 Rate Limit → OpenAI Responses API → JSON 응답 → 기존 대화 화면`

서버에서만 `OPENAI_API_KEY`를 읽는다. 브라우저 요청에는 키가 없다. 키·대화·개인정보·상류 응답 전문을 로그에 기록하지 않는다. 개발 환경에서는 고정 오류 코드/HTTP 상태만 출력한다.

기본 모델은 `gpt-4.1-mini`, 변경 지점은 `OPENAI_MODEL`이다. 서버 기본값은 `server/livon/chat.mjs` 한 곳에 있다. API는 `https://api.openai.com/v1/responses`, `store: false`를 사용한다. 이는 응답 상태 저장을 끄며 OpenAI의 모든 보관 정책을 무효화하는 것은 아니다.

첫 버전은 일반 JSON 응답이다. 기존 전체 답변 기반 로컬 저장/계획 추출/다시 생성 흐름과 오류 처리를 먼저 검증했다. 스트리밍과 중간 답변 저장/취소/복구는 후속 단계다. 가짜 타이핑 애니메이션은 추가하지 않았다.

## API 계약

POST `/api/livon/chat` (`Content-Type: application/json`):

```json
{"message":"실내로만 해줘.","conversation":[{"role":"user","content":"서울 데이트 추천"},{"role":"assistant","content":"전시와 산책을 제안합니다."}],"context":{"answerLength":"balanced","personalize":false}}
```

성공: `{"success":true,"message":"...","truncated":false}`

실패: `{"success":false,"error":"사용자용 메시지","code":"TIMEOUT"}`

429에는 `Retry-After` 헤더와 `retryAfter` 초가 포함된다. 주요 코드: `EMPTY_MESSAGE`, `MESSAGE_TOO_LONG`, `INVALID_HISTORY`, `INVALID_JSON`, `AI_NOT_CONFIGURED`, `AI_AUTH_ERROR`, `UPSTREAM_ERROR`, `UPSTREAM_RATE_LIMIT`, `RATE_LIMIT`, `TIMEOUT`, `PROTECTION_NOT_CONFIGURED`, `PROTECTION_UNAVAILABLE`.

GET `/api/health`: `{"status":"ok","aiConfigured":true,"protectionConfigured":true}`. 설정 존재 여부만 확인하며 키 유효성/외부 서비스 정상 여부를 보증하지 않는다. 모델·키 값·호스트 정보는 반환하지 않는다. 응답은 캐시하지 않는다.

## 환경변수

`.env.example`을 참고한다. 실제 `.env`는 Git 제외 대상이며 공개 산출물에도 복사하지 않는다.

- `OPENAI_API_KEY`: 서버 전용 키. 프론트엔드 접두사 `VITE_`, `NEXT_PUBLIC_` 사용 금지.
- `OPENAI_MODEL`: 기본 `gpt-4.1-mini`. 계정에서 사용 가능한 Responses 호환 모델을 입력한다.
- `UPSTASH_REDIS_REST_URL`: Upstash Redis의 HTTPS REST URL.
- `UPSTASH_REDIS_REST_TOKEN`: 읽기/쓰기 및 EVAL 가능한 서버 전용 토큰.
- `LIVON_RATE_LIMIT_SECRET`: IP를 HMAC 해시할 고정 비밀값. 32자 이상. 로컬에서 `openssl rand -hex 32`로 생성한 값을 직접 설정한다. 자주 바꾸면 IP별 카운터가 초기화되므로 유지한다.
- `LIVON_DAILY_REQUEST_LIMIT`: 사이트 전체 rolling 24시간 요청 상한. 기본 500, 허용 1~10000.

Vercel: 해당 프로젝트 → **Settings → Environment Variables**에 위 값을 추가하고 Production에 적용한다. Preview를 테스트하려면 Preview에도 별도 키/Redis/비밀값을 설정한다. **환경변수 변경 후 Redeploy가 필요하다.** 키를 채팅에 보내지 않는다.

## 배포

1. Vercel에서 이 저장소 루트를 Import한다. Framework Preset은 Other를 사용한다. 별도 Vite 프로젝트를 선택하지 않는다.
2. 저장소의 `vercel.json`이 Build Command `node scripts/publish-site.mjs`, Output Directory `_publish`, chat 최대 실행 시간 40초를 설정한다. Node.js 22 또는 24를 권장한다.
3. Upstash Redis 인스턴스를 준비하고 위 환경변수를 등록한다. 모든 Vercel 환경에서는 공유 제한 저장소가 없거나 응답하지 않으면 요청을 차단한다. 로컬 개발에서만 메모리 제한을 사용한다.
4. Vercel Preview URL에서 아래 운영 테스트를 먼저 한다.
5. `www.newon.app`을 Vercel 프로젝트에 연결하고 Vercel이 표시하는 DNS 값으로 변경해야 같은 도메인의 `/api`가 작동한다. 현재 GitHub Pages 연결 상태에서 단순 git push는 API를 배포하지 않는다. 도메인 변경은 이 작업에서 수행하지 않았다.
6. 기존 GitHub Pages workflow는 유지했다. 호스팅 전환 뒤 Pages용 workflow의 필요 여부를 결정한다. GitHub Pages를 계속 사용하려면 `/api`를 Vercel로 전달할 별도 reverse proxy 구성이 필요하다. 브라우저의 cross-origin 우회나 키 삽입으로 해결하지 않는다.

## 로컬 실행

Node.js 22/24에서:

```sh
cp .env.example .env
# 편집기에서 .env의 OPENAI_API_KEY를 직접 입력
npm run dev:livon
```

터미널에 나온 주소의 `/livon/#ai-chat`을 연다(기본 `http://127.0.0.1:8899/livon/#ai-chat`). 로컬에서는 Redis 없이 제한 기능을 사용할 수 있다. 기존 Python 서버나 단순 Python 정적 서버는 새 API를 실행하지 않는다. `npm run serve`를 쓰는 경우 환경변수를 별도로 export해야 한다.

```sh
npm run test:livon
npm run check:fast:publish
```

브라우저 테스트는 별도로 설치된 Playwright와 Chrome을 사용한다. 미리보기 서버를 먼저 실행하고 `node tests/livon/browser.mjs`를 실행한다. 설치 경로가 별도면 `PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs`, Chrome 경로가 다르면 `CHROME_PATH=...`를 지정한다. 브라우저 테스트 응답은 mock이며 실제 AI 사용 가능 여부를 검증하지 않는다.

## 사용량·개인정보 보호

- 메시지 4,000자, 최근 history 12개/합계 12,000자, context 각 항목 300자, 본문 64KB, 최대 출력 1,200토큰.
- 오래된 대화를 서버에 보내지 않는다. 자동 요약을 위한 추가 AI 호출은 아직 하지 않는다.
- IP당 3초 1회, 분당 6회, rolling 24시간 50회. 사이트 전체 rolling 24시간 기본 500회. OpenAI 실패/사용자 취소도 차감하며 자동 재시도하지 않는다.
- Redis EVAL로 여러 한도를 원자적으로 검사/증가시킨다. 원문 IP나 메시지를 Redis에 저장하지 않고 HMAC 키와 TTL 카운터만 저장한다.
- Vercel에서는 플랫폼이 제공하는 `x-vercel-forwarded-for`만 사용한다. 일반 `X-Forwarded-For`나 클라이언트 userId는 신뢰하지 않는다. 다른 reverse proxy 환경으로 옮길 때는 검증된 IP 추출기를 별도로 구현해야 한다.
- OpenAI 요청 timeout 25초, 제한 저장소 timeout 3초, 브라우저 timeout 35초. 브라우저 연결이 끊기면 상류 요청 취소를 시도한다. 이미 생성된 토큰 비용까지 취소된다고 보장하지 않는다.
- 중복 전송은 UI에서 막고, 실패 재시도는 동일한 메시지/history/context 스냅샷을 사용하며 사용자 메시지를 중복 추가하지 않는다.
- 사용자 대화는 기존처럼 해당 브라우저 localStorage에 저장된다. 공용 기기에서는 전체 삭제 기능을 사용한다. 클라우드/계정 보관, 암호화 저장, 보관기간 정책은 후속 작업이다.
- `shareLifeData` 체크박스는 아직 연결하지 않았다. 개인화 허용 시 사용자가 입력한 stage/interests/region/goal만 보낸다. 일정·건강·결제 데이터는 자동으로 보내지 않는다.
- 시스템 지침에 데이터 미연결·실행하지 않은 예약/주문/결제 주장 금지를 넣었다. 모델 환각을 완전히 보장해서 막는 것은 아니므로 중요한 사실은 확인해야 한다.

## 검증 결과와 운영 테스트

자동 API 테스트: 정상·연속 대화, 빈/긴 메시지, history/role 위조, JSON/본문/출처 제한, 키 없음, 401/403/429/500, timeout/network/잘못된 응답, 모델 변경, refusal/출력 제한, 공유 제한 실패 시 차단, 동시 요청, IP 신뢰 경계. 외부 API/Redis는 테스트 대역을 사용한다.

운영 환경에서 반드시 추가 확인:

1. `/api/health`에 두 configured 값이 true인지 확인한다.
2. “이번 주말 서울에서 데이트하고 싶어.” 다음 “실내로만 해줘.”를 보내 맥락을 확인한다.
3. 모바일·데스크톱에서 전송 중 비활성화, 새로고침 후 로컬 대화, 오류 후 다시 시도를 확인한다.
4. DevTools Network에서 요청 대상이 동일 도메인 `/api/livon/chat`이며 키가 없음을 확인한다.
5. 빠르게 반복하면 429/Retry-After가 오는지 확인한다. 실제 한도에 포함되므로 테스트 횟수를 제한한다.
6. Preview에서 키 미설정/잘못된 키/Redis 미설정·오류를 테스트한다. 운영 키를 일부러 망가뜨리지 않는다.
7. OpenAI Usage에서 실제 모델·토큰 사용과 비용을 확인한다. health만으로 실제 응답 성공을 판단하지 않는다.
8. `/ko/`, `/en/`, LIVON의 다른 메뉴와 기존 정적 자산 경로를 확인한다.

## 후속 기능과 비용

미구현: streaming, 오래된 대화 자동 요약, Newon+ 서버 인증/사용자별 quota, 계정별 대화 저장, 실제 생활 데이터 조회, 검색·예약·주문·결제 도구, 모델 자동 라우팅.

공개 서비스 추가 보호 권장: Vercel WAF/봇 방어 또는 CAPTCHA, 검증된 로그인 기반 일일 한도, OpenAI 프로젝트별 사용량 알림/예산 설정, Redis/Vercel 사용량 모니터링. CORS/출처 검사는 인증을 대체하지 않는다. IP 제한만으로 분산 공격을 완전히 막을 수 없으므로 전체 일일 상한도 적용했다.

비용은 질문뿐 아니라 최근 대화·context·시스템 지침과 출력 토큰에서 발생한다. 다시 생성/다시 시도도 새 요청이다. 기본 전체 상한에서 출력은 하루 최대 약 600,000토큰이며 입력/인프라/Redis 비용은 별도다. 요청 수 제한은 정확한 금액 제한이 아니다. 모델 변경·한도 증가·장문 대화·향후 검색/요약 추가 시 비용이 증가한다.

공식 참고: [Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses), [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini), [Vercel Node Functions](https://vercel.com/docs/functions/runtimes/node-js), [Upstash REST](https://upstash.com/docs/redis/features/restapi).

### 이 작업에서 실제 실행한 결과

- `npm run test:livon`: 13/13 통과.
- `node scripts/publish-site.mjs`: 전체 빌드·산출물 검증 통과. 빌드가 재생성한 무관한 소스 변경은 되돌렸다.
- `npm run check:fast:publish`: 통과.
- Chrome 1440×1000 / 390×844: 연속 대화, 빠른 중복 호출, 실패 재시도 스냅샷, 새로고침, 입력 길이 제한, 네트워크 실패, 대화방 전환, HTML 출력 이스케이프, 가로 넘침 검사 통과. 브라우저 AI 응답은 테스트용 대역이다.
- 실제 로컬 HTTP API: 키 미설정 503/AI_NOT_CONFIGURED, health 200, Newon 한국어·영어·LIVON 페이지 200 확인.
- 기존 `livon/life-now-page.js`가 정의되지 않은 `initHero()`를 호출하는 오류가 발견되었다(변경 전 HEAD에도 존재). AI 코드 오류와 구분하여 보고하며, 기존 사용자 수정 파일이라 이번 작업에서 임의 수정하지 않았다. 따라서 전체 사이트가 오류 없이 동작한다고 주장하지 않는다.
- 실제 OpenAI 키, Redis 설정, Vercel 배포 연결은 이 실행 환경에 없었다. 실제 AI 답변과 Production 배포 후 검증은 위 절차로 별도 진행해야 한다.

### 파일 변경 목록

생성: `api/livon/chat.mjs`, `api/health.mjs`, `server/livon/chat.mjs`, `server/livon/http.mjs`, `.env.example`, `tests/livon/chat.test.mjs`, `tests/livon/browser.mjs`, 이 문서.

수정: `livon/ai-page.js`(요청·history·재시도·상태), `livon/index.html`(스크립트 버전과 개인정보/미연결 안내 문구만), `scripts/serve-publish.mjs`(로컬 API), `scripts/publish-site.mjs`(Python/환경변수 파일 공개 제외), `package.json`(개발·테스트 명령), `vercel.json`(빌드/Function 설정).

작업 시작 전부터 있던 `livon/index.html`의 안내 문단 제거, `livon/life-now-page.js` 변경, `docs/strategy/` 등 사용자 변경은 보존했다. CSS 파일 변경은 없다.

### 후속 복구 (2026-09-26)

위에 기록한 내 생활 초기화 오류는 후속 요청에서 수정했다. 이전 버전에서 누락된 initHero/initReveal, 대시보드 갱신, 항목 조회·삭제, 스테이지 창 함수를 복구했다. 12개 관리 메뉴의 내용 표시와 할 일 추가 창 열기를 브라우저에서 확인했다. 기존 저장 데이터와 디자인은 유지했다.
