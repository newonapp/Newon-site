# Newon+ 계정 백엔드 · LIVON 동기화 V1 (Account Backend & Sync V1)

작성: 2026-09-30 · 선행 문서: `docs/newon/auth-architecture.md`, `docs/newon/newon-plus-auth-foundation.md`, `docs/livon/account-data-foundation.md`

> **상태: CODE READY / LIVE CONFIG REQUIRED / LIVE VERIFICATION REQUIRED.**
> 코드는 끝까지 연결되어 있고 테스트를 통과했습니다. 다만 Newon+ Firebase 프로젝트, PostgreSQL DB, Vercel 환경변수가 아직 없습니다. 그래서 운영 사이트는 지금도 **익명(이 기기 저장) 모드**로만 동작합니다. 로그인 버튼은 보이지 않고, 동기화 API는 503으로 닫혀 있습니다.
> "LIVE AUTH", "LIVE SYNC"가 아닙니다. 테스트에 쓴 토큰은 테스트 안에서 만든 임시 RSA 키로 서명했고, DB는 테스트용 PostgreSQL 16입니다.

## 1. 흐름

```
로그인(Google/Apple — 설정된 provider만)
  → Firebase ID 토큰 (브라우저 메모리, Newon 코드는 저장하지 않음)
  → GET/POST /api/livon/userdata   Authorization: Bearer <ID 토큰>
      서명(RS256, Google 공개 인증서) · iss · aud · exp · iat · auth_time · sub 검증
      → issuer 허용 목록 (HQ·OX 거부)
      → account_refs(issuer, subject) → 내부 계정 id "acct_" + 32 hex (첫 로그인 때 생성)
      → 계정별 요청 제한 → 입력 검증 → PostgreSQL
  → 기기: 서버 변경분 받기 → 비교 → 충돌 해결 → 병합 → 서버 반영 → 로컬 반영
```

## 2. 파일

| 파일 | 역할 |
|---|---|
| `api/livon/userdata.mjs` | Vercel 함수 진입점 (`createUserDataHandler()` 기본값 = PostgreSQL + Google 인증서 검증) |
| `server/livon/userdata/http.mjs` | 라우트: CORS → 메서드 → 켜짐 여부 → DB → 검증기 → 토큰 → 계정 → 요청 제한 → 검증 → 저장 |
| `server/livon/userdata/store.mjs` | PostgreSQL 저장소(운영) + 메모리 저장소(테스트 전용, 운영 경로에서 만들지 않음) |
| `server/livon/userdata/migrations/001_account_backend.sql` | 스키마. 여러 번 실행해도 안전합니다(`IF NOT EXISTS`). |
| `server/newon/auth/firebase-verifier.mjs` | Firebase 공식 "서드파티 JWT 라이브러리로 검증" 절차를 `node:crypto`로 수행합니다. 암호 알고리즘을 직접 구현하지 않았습니다. |
| `server/newon/auth/verify.mjs` | Bearer 파싱, URL 토큰 거부, 클레임 검사(서명 확인 전후 두 번) |
| `server/livon/ratelimit.mjs` | 계정별 요청 제한 (Upstash, 운영에서 미설정 시 503) |
| `livon/data/livon-sync.js` | 브라우저 동기화 엔진 (`window.LivonSync`) |
| `livon/livon-account-ui.js` | My Life › 설정의 계정 패널과 첫 로그인 동의 창 |
| `livon/data/livon-auth-bridge.js` | NewonAuth 상태 → LivonSync 연결 |
| `newon-auth/newon-auth*.js`, `scripts/newon-auth-config.mjs` | `NEWON_PLUS_AUTH_PROVIDERS`에 넣은 provider로만 로그인 |
| `tests/livon/account-backend.test.mjs`, `tests/livon/pg-harness.mjs` | 테스트 48개 (§12, §15) |

## 3. 인증

- **Bearer ID 토큰만** 받습니다. URL(`?token=`, `?id_token=` 등), 본문, 쿠키의 토큰은 읽지 않거나 거부합니다.
- 서명: 헤더 `alg`는 RS256만, `kid`는 Google 공개 인증서(`securetoken@system.gserviceaccount.com`)에 있어야 합니다. 인증서는 `Cache-Control max-age`만큼 캐시하고(1분~24시간), 모르는 `kid`면 한 번 다시 받습니다(키 교체 대응). 인증서를 못 받으면 401이며, 통과시키지 않습니다.
- 클레임: `iss = https://securetoken.google.com/<Newon+ 프로젝트>`, `aud = 프로젝트 id`, `exp` 미래, `iat`·`auth_time` 과거(허용 오차 60초), `sub` 형식.
- **HQ(`newon-hq`)와 OX(`newon-oxmonth`)는 소비자 계정이 될 수 없습니다.** 프로젝트 id로 설정하면 검증기가 꺼지고, 토큰은 iss/aud가 달라 거부되며, 라우트에서도 한 번 더 막습니다.
- 다른 앱 issuer를 `NEWON_AUTH_ALLOWED_ISSUERS`에 넣어도 **새 계정을 만들 수 없습니다**(명시적 연결 전에는 `ISSUER_NOT_ALLOWED`). 계정 생성은 Newon+ 기본 issuer만 가능합니다.
- email은 신원이 아닙니다. 저장하지 않고, email이 같아도 계정을 합치지 않습니다.
- 서비스 계정·private key가 필요 없습니다. 검증에는 공개 인증서와 프로젝트 id만 씁니다.
- `firebase-admin`을 나중에 설치하면 `firebaseAdminVerifier()`로 바꿀 수 있습니다.

## 4. 계정 id

- `(issuer, subject)` → `account_refs` → `user_accounts.account_id` (`acct_` + 32 hex, 무작위).
- `account_refs`의 기본 키가 `(issuer, subject)`라서 한 신원이 두 계정에 속할 수 없습니다.
- 첫 로그인이 동시에 두 번 와도 계정은 하나입니다. ref를 먼저 넣고, 그 삽입이 이긴 경우에만 계정 행을 만듭니다. 진 쪽은 기존 계정을 씁니다.
- OX uid나 Firebase uid는 계정 id로 쓰지 않습니다. 브라우저의 로컬 범위 키도 `(issuer, subject)`의 해시입니다.

## 5. 데이터베이스 (PostgreSQL, 특정 업체에 묶이지 않음)

| 테이블 | 내용 |
|---|---|
| `user_accounts` | account_id, created_at, server_rev(계정별 변경 번호), status(active/disabled) |
| `account_refs` | issuer, subject → account_id |
| `user_records` | 할 일·목표·체크리스트·습관·프로젝트·경험 + 민감(일기·가계부·건강·예산, `sensitive=true`) |
| `saved_items` | 저장 항목 (생성 열: item_type, folder, provider — 출처 정보 유지) |
| `calendar_items` | 일정 (생성 열: event_date, start_time) |
| `preferences` | 관심사·설정·저장 폴더·라이프 이벤트 진행 |
| `sync_metadata` | 기기별 마지막 동기화, 충돌 수, 가져오기 결정 시각 |

- 모든 행은 `account_id`를 가지며, 값은 서버가 토큰에서 정합니다. 요청에 `userId`/`ownerId`/`accountId`가 있으면 400입니다.
- 삭제는 tombstone(`deleted_at`, `data = null`)입니다. 동기화가 행을 지우지 않습니다.
- 운영 연결: `LIVON_DATABASE_URL`(postgres://…) + `pg` 드라이버(`package.json` dependencies에 추가). TLS 인증서를 항상 검증하고, 운영에서는 `sslmode=disable/allow/prefer/no-verify`인 URL을 거부합니다(503). 연결 풀은 함수당 3개, 연결 5초·쿼리 8초 제한입니다(§15).
- DB가 없으면 `SERVER_NOT_CONFIGURED`(503)입니다. 가짜 저장소로 대신하지 않습니다.

## 6. API — `/api/livon/userdata`

| 요청 | 결과 |
|---|---|
| `GET ?since=&limit=&collection=` | `{records, hasMore, nextSince, serverRev}` (최대 500개, 이 세 가지 외 쿼리는 400) |
| `POST {op:"batch", payload:{records:[…≤500], sensitive?:true}}` | 레코드별 `applied`(새 serverRev) / `conflict`(현재 서버 사본) / `rejected`(`SENSITIVE_CONSENT_REQUIRED`) |
| `POST {op:"syncMeta"}` | `{serverRev}` |
| `POST {op:"device", payload:{deviceId, lastServerRev, conflicts, importDecided}}` | 기기 메타데이터 |

- 레코드 형식은 그대로입니다: `{id, collection, schemaVersion, createdAt, updatedAt, deletedAt, localRev, serverRev, data}`. 그 밖의 필드는 거부합니다.
- 제한: 레코드 64KB, 요청 1MB(초과 시 413), 배치 500개, 중복 레코드 거부, `__proto__`/`constructor`/`prototype` 키 거부, 컬렉션 허용 목록.
- 낙관적 동시성: `serverRev`는 클라이언트가 마지막으로 본 서버 번호입니다. 서버 값과 같을 때만 쓰고, 다르면 현재 사본을 돌려줍니다. 같은 요청을 다시 보내도 두 번 적용되지 않습니다.
- 오류는 `{ok:false, code, error}`(한국어 문구)입니다. 401에는 `WWW-Authenticate: Bearer`를 붙이고, 모든 응답에 `X-Request-Id`를 붙입니다.

## 7. 동기화 범위

- **동기화함 (ACCOUNT_SYNC)**: 저장 항목·폴더, 할 일, 목표, 일정, 체크리스트, 습관(기록 포함), 프로젝트, 경험, 관심사·설정, 알림 선호, 시/도·시/군/구, 라이프 이벤트 진행.
- **동기화 안 함**: AI 대화, 최근 활동·검색, 초안, 동(洞) 단위 지역·위치, 데이터 캐시, 토큰·키, 원본 API 응답, 커뮤니티(기기 로컬), 동기화 상태 자체(`livon.vault.*`, `livon.sync.v1:*`, `livon.activeProfile.v1`은 DEVICE_LOCAL).
- **민감 정보(일기·가계부·건강·예산)**: 설정의 "민감한 기록 동기화"를 직접 켜야 올라갑니다. 서버도 `sensitive:true` 없이 온 민감 레코드는 거부합니다.

## 8. 첫 로그인 가져오기 (동의)

- 로그인만으로는 **아무것도 올라가지 않습니다.**
- 이 기기에 데이터가 있으면 "이 기기의 데이터를 계정에 저장할까요?" 창에 항목별 개수를 보여줍니다.
  - 일반 항목은 체크된 상태로, 민감 항목은 체크 해제 상태로 시작합니다("(민감 정보)" 표시).
  - 두 버튼("선택한 항목 계정에 저장", "이 기기에만 두기")은 같은 모양입니다. 창을 닫거나 ESC를 누르면 아무것도 정하지 않습니다.
- "이 기기에만 두기": 아무것도 올리지 않습니다. 계정 데이터만 내려받고, 이 기기 데이터는 따로 보관합니다.
- 결정은 계정·기기별로 한 번입니다. 다시 로그인해도 다시 묻지 않습니다.

## 9. 동기화 동작

1. 서버 변경분 받기(`serverRev > 커서`, 페이지 반복).
2. 로컬과 비교합니다. 로컬 변경 여부는 "마지막 동기화 때의 내용 해시와 다른가", 서버 변경 여부는 "기억한 revision과 다른가"로 판단합니다. 기기 시계에 의존하지 않습니다.
3. 충돌을 해결합니다(`mergeCollection`):

| 대상 | 규칙 |
|---|---|
| 저장 항목 | 합집합. 같은 항목은 최신 것 |
| 저장 폴더 | 값 합집합 |
| 할 일·목표 등 | 한쪽만 바뀌면 그쪽. 둘 다 바뀌면 서버 버전 + 이 기기 버전의 **사본**(`conflictOf`, 별도 id) |
| 일정 | 위 규칙 + 제목·날짜·시작 시간이 같은 중복은 하나로 합칩니다(`mergedIds`). 모든 기기가 같은 항목을 남깁니다(생성 시각·id 순). |
| LIVON AI 승인 | 열린 할 일·목표의 제목이 같으면 하나만 남깁니다(기기가 달라도). |
| 설정 | 최신 값. 값이 달랐다는 기록은 충돌 수로 남깁니다. |
| 삭제 | 삭제 뒤에 수정했다면 수정이 이깁니다. 그렇지 않으면 tombstone이 이기고, 다시 살아나지 않습니다. |

4. 병합 결과를 로컬에 반영하고, 서버에 올립니다. 서버 충돌이 나면 다시 병합합니다(최대 3회).
5. 네트워크나 서버 오류가 나도 로컬 데이터는 그대로입니다. 상태는 "오프라인" 또는 "동기화 오류"가 됩니다.
6. 온라인 복귀, 탭 복귀(1분 경과), 로컬 저장(4초 모아서) 때 다시 동기화합니다.
7. tombstone은 기존 상한(1,000개)을 유지합니다.

## 10. 로그아웃 · 계정 전환

- 저장소 키는 그대로 두고, "지금 어느 프로필의 데이터인가"를 바꿉니다(`livon.activeProfile.v1`).
  - 로그인 중에는 이 기기 데이터를 `livon.vault.anon.v1`에 보관합니다.
  - 로그아웃하면 계정 사본을 `livon.vault.acct.<해시>.v1`에 보관하고, 이 기기 데이터를 되돌립니다.
- 로그아웃은 짧게(최대 4초) 마지막 동기화를 한 뒤 이 기기 데이터로 돌아갑니다. **아무것도 지우지 않습니다.**
  - "이 기기에 남은 계정 사본도 지우기"를 체크했을 때만 로컬 계정 사본과 동기화 커서를 지웁니다. 서버 데이터는 남습니다.
- 계정 A에서 B로 바꾸면 A 데이터를 먼저 A의 보관함으로 옮깁니다. B 화면에 A 데이터가 보이거나 B 계정으로 올라가지 않습니다(테스트 AB-26).
- 프로필이 바뀌면 화면을 한 번 새로고침합니다.

## 11. 보안 · 운영

- **CORS**: `https://www.newon.app`, `https://newon.app`만 허용합니다(`LIVON_ALLOWED_ORIGINS`로 변경 가능). localhost는 운영이 아닐 때만 허용하고, `*`는 쓰지 않으며, credentials도 쓰지 않습니다. 이 라우트만 `Authorization` 헤더를 허용합니다.
- **로그**: 요청 id, 라우트, 메서드, 상태, 코드, 지연 시간만 남깁니다(운영에서는 콘솔 출력 없음). 토큰, subject, 계정 id, 내용은 남기지 않습니다.
- **요청 제한**: 계정별 분당 60회, 하루 3,000회(`LIVON_USERDATA_MINUTE_LIMIT`, `LIVON_USERDATA_DAILY_LIMIT`). 한 번 동기화하면 요청이 3회쯤 나가므로 정상 사용에는 여유가 있습니다.
  - 초과하면 429와 `Retry-After`를 돌려줍니다.
  - 운영에서 Upstash가 없으면 503(`PROTECTION_NOT_CONFIGURED`)이며, `/api/health`의 `userdata.ready`도 false입니다.
- **검증 순서**: 설정 확인 → 토큰 → 계정 → 제한 → 입력 순서입니다. 설정이 없으면 토큰을 보기 전에 닫힙니다.
- **멤버십·결제 권한**: 이 작업과 분리했습니다. 계정이 있다고 유료 기능이 열리지 않습니다.
- **다른 앱과 데이터 공유**: 하지 않습니다. 계정 테이블은 LIVON 데이터만 담습니다.

## 12. 테스트 · 검증 (2026-09-30, cloud 작업본)

- `tests/livon/account-backend.test.mjs` 48개(V1 30 + 보강 18)가 실제 운영 코드 경로를 검사합니다.
  - 라우트, 검증기(X.509 인증서 + 키 교체 + 장애), 클레임, HQ/OX 거부, 계정 매핑, IDOR, 입력 한도, 오염, 민감 동의, 동시성, tombstone, CORS, 요청 제한, 로그 내용.
  - 저장소 계약(메모리 + **실제 PostgreSQL 16**).
  - 기기 두 대 시나리오: 가져오기 동의, 전파, 충돌 사본, 삭제 후 수정, 합집합, 일정 중복, AI 중복, 민감 제외, 오프라인·오류, 로그아웃·재로그인, 계정 전환.
  - 패널과 동의 창.
- PostgreSQL 묶음(AB-17)은 `LIVON_TEST_PG`가 있을 때만 실행합니다. 이 환경(PostgreSQL 16)에서는 실행해 통과했고, 없으면 "skipped"로 표시합니다.
- `npm run test:livon`: PostgreSQL 포함 시 460/460, PostgreSQL 없이 459 통과 + 1 skip.
- 빌드(`scripts/publish-site.mjs`)와 `check:fast`(저장소·_publish 모두) 통과.
- 헤드리스 Chromium 회귀 (320/390/768/1440px):
  - 익명 LIVON 9개 화면: 가로 넘침 없음, 저장 → 새로고침 유지, JS 오류 없음, CSP report-only 위반 없음.
  - 계정 UI와 동기화 요청 없음. API는 503, health는 not ready.
  - [QA 스텁] 상태로 패널과 동의 창을 그려 기본 체크, 포커스, ESC 동작을 확인했습니다.
- 알려진 한계:
  - `package-lock.json`: pg 하위 트리 14개 항목을 레지스트리 해석 결과(무결성 해시 포함) 그대로 반영했습니다(§15). Vercel 설치 결과 확인은 LIVE 단계에서 합니다.
  - 동시 첫 로그인 경쟁은 "이미 ref가 있으면 기존 계정 반환" 경로로 확인했습니다. 실제 병렬 트랜잭션 부하 시험은 하지 않았습니다.
  - 서버 tombstone 정리(보존 기간)와 "계정 데이터 전체 삭제" API는 아직 없습니다.

## 13. 상태

| 구분 | 항목 |
|---|---|
| **CODE READY** | 토큰 검증, 계정 매핑, 스키마, 저장소, API, 요청 제한, CORS, 동기화 엔진, 동의·로그아웃·전환, UI, 테스트, 문서 |
| **LIVE CONFIG REQUIRED** | Newon+ Firebase 프로젝트와 로그인 provider, Vercel 환경변수, PostgreSQL DB와 migration, Upstash |
| **LIVE VERIFICATION REQUIRED** | 실제 Google/Apple 로그인, Vercel에서 `pg` 설치·DB 연결·SSL, 두 실제 기기 간 동기화, 운영 CORS, 요청 제한 수치 |

## 14. 켜는 순서 [USER ACTION REQUIRED]

1. Firebase에 **Newon+ 전용 프로젝트**를 만듭니다(HQ·OX 재사용 금지). Authentication에서 Google(필요하면 Apple)을 켜고, 승인 도메인에 `newon.app`, `www.newon.app`을 넣습니다.
2. 웹 앱 공개 설정값을 GitHub › Settings › Secrets and variables › Actions › **Variables**에 넣습니다: `NEWON_PLUS_FIREBASE_API_KEY`, `NEWON_PLUS_FIREBASE_AUTH_DOMAIN`, `NEWON_PLUS_FIREBASE_PROJECT_ID`, `NEWON_PLUS_FIREBASE_APP_ID`, `NEWON_PLUS_AUTH_PROVIDERS=google.com`(선택: `NEWON_PLUS_AUTH_PERSISTENCE`). Pages 워크플로가 이 값만 빌드에 넘깁니다(§15).
3. PostgreSQL을 만들고 `server/livon/userdata/migrations/001_account_backend.sql`을 한 번 실행합니다(Neon·Supabase·RDS 등 어디든 됩니다).
4. Vercel 환경변수를 넣습니다: `LIVON_DATABASE_URL`, `NEWON_AUTH_VERIFY_ENABLED=true`, `NEWON_PLUS_FIREBASE_PROJECT_ID`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `LIVON_RATE_LIMIT_SECRET`. 마지막에 `LIVON_USERDATA_ENABLED=true`를 넣습니다.
5. Vercel 빌드 로그에서 `pg`가 설치되었는지 확인합니다(lockfile에는 반영됨). 선택: DB 역할에 서버 측 `statement_timeout`을 설정합니다(예: `ALTER ROLE <앱 역할> SET statement_timeout = '8s'`).
6. 배포 후 `/api/health`에서 `userdata.ready: true`를 확인하고, 두 기기로 실제 로그인·동기화를 확인합니다.

값(키·토큰·비밀번호)은 채팅이나 저장소에 넣지 않습니다.

## 15. V1.1 보강 (2026-09-30)

WIP 비교에서 찾은 결함을 고치고 방어를 보강했습니다. 결함마다 먼저 실패하는 회귀 테스트로 재현했고, 수정 후 통과를 확인했습니다.

| 결함 | 수정 | 회귀 테스트 |
|---|---|---|
| D1 `toString`·`constructor` 같은 컬렉션, `__proto__` 같은 id가 통과 | 컬렉션은 자기 소유 키만 인정(`isCollection`), `Object.prototype` 이름 id 거부, 병합 맵은 `Object.create(null)`, 저장소 `tableFor`도 자기 소유 키만 인정 | D1 |
| D2 깊이 13 이상의 객체와 그 안의 `__proto__` 통과 | 최대 깊이(12)를 넘으면 거부 | D2 |
| D3 삭제 후 같은 id로 다시 저장하면 동기화 때 다시 삭제됨 | 로컬에 살아 있는 레코드가 있으면 tombstone을 내보내지 않음, 재생성 시 tombstone 정리 | D3 (+ PostgreSQL) |
| D4 150자 이상 id의 충돌 사본이 원본과 같은 id | 접미사를 먼저 만들고 id를 잘라 붙임(원본 id + 내용 해시) | D4 |
| D5 로그아웃 중 늦게 온 A 응답이 B 프로필·계정에 들어감 | 동기화 세대 번호(계정·프로필이 바뀌면 이전 회차는 적용·저장·전송 모두 중단), 원격 어댑터를 신원에 고정(토큰의 iss/sub가 다르면 `SESSION_CHANGED`로 아무것도 보내지 않음), 세대가 다르면 새 동기화를 따로 시작 | D5, D5b |
| D6 요청 중 편집이 충돌 병합 결과에 덮어써짐 | 적용 직전 레코드가 이번 회차에 읽은 내용과 같을 때만 덮어씀. 다르면 다음 회차에서 병합 | D6 (+ PostgreSQL) |

추가 방어:

- **민감·비밀 필드**: 비밀·토큰·원본 응답·위치 필드 목록을 넓혔습니다(authorization, idToken, refreshToken, private_key, cookie 등). 브라우저와 서버가 같은 규칙으로 거부합니다(`record:private-field`).
- **단일 레코드 id**: preferences / save_folders / life_progress / budgets는 LIVON이 쓰는 id만 허용합니다. `data.id`는 레코드 id와 같아야 합니다. tombstone에는 data가 없어야 합니다.
- **토큰 클레임**: `iat>0`, `auth_time>0`, `exp>iat`, `auth_time<=iat`를 추가로 검사합니다.
- **HTTP**: Authorization 헤더가 여러 개면 400입니다. 선언된 크기가 한도를 넘으면 토큰 검증 전에 413입니다.
- **PostgreSQL**:
  - 운영에서는 TLS를 약하게 만드는 sslmode를 거부하고, URL의 sslmode는 무시한 채 인증서 검증을 켭니다.
  - 연결 5초·쿼리 8초 제한을 둡니다(PgBouncer에서도 동작하는 클라이언트 측 제한).
  - 유휴 연결 오류로 함수가 종료되지 않게 막습니다.
  - DB 오류 메시지는 밖으로 내보내지 않습니다(`STORE_UNAVAILABLE`).
- **migration**:
  - 한 트랜잭션으로 실행합니다.
  - CHECK를 추가했습니다: data는 객체(256KB 이하), 살아 있는 행은 data 있음 / tombstone은 data 없음, 예약 id 금지. 테이블별 컬렉션 CHECK는 기존대로입니다.
  - DB 쪽 256KB는 한글 UTF-8 바이트 수를 고려한 최종 방어선이고, 레코드 크기 64KB 제한은 앱에서 겁니다.
- **브라우저 요청**: 쿠키를 보내지 않고, 리다이렉트를 거부하며(리다이렉트된 응답도 거부), 요청당 25초 제한을 둡니다.
- **주기 동기화**: 로그인 상태이고 화면이 보이며 온라인일 때 60초마다 받아 옵니다.
- **설정 시각**: 설정 레코드의 시각은 해당 저장소가 실제로 바뀐 시각입니다.
- **세션 초안**: SESSION_ONLY 초안(AI 입력, 서비스 초안, 필터)은 프로필별로 `livon.sessionVault.*`에 보관·복원합니다. B는 A의 초안을 보지 못합니다.
- **저장 공간 부족**: 로그인 때 저장 공간이 부족하면 아무것도 바꾸지 않고 오류 상태만 표시합니다.

적용하지 않은 것:

- 계정당 레코드 상한(I18): 실제 사용량과 DB 비용을 본 뒤 할당량 정책으로 따로 설계합니다.
- firebase-admin·ADC, pglite, Node ≥22 강제는 결정대로 넣지 않았습니다.

로그인 방식:

- V1은 팝업이 기본입니다. 팝업이 막히면 redirect로 넘어가는 동작은 남겨 두었고, 호환성 과제로 따로 관리합니다.
- 실제 Firebase 프로젝트를 연결한 뒤 다음을 검증합니다: Safari macOS·iOS, Chrome, 팝업 차단, redirect 대체, 사용자 지정 인증 도메인 필요 여부.
- 검증 전에는 사용자 지정 인증 도메인을 추가하지 않습니다.

GitHub Pages 빌드:

- `.github/workflows/github-pages.yml`이 공개 웹 설정만 Actions **Variables**에서 넘깁니다: `NEWON_PLUS_FIREBASE_API_KEY`, `NEWON_PLUS_FIREBASE_AUTH_DOMAIN`, `NEWON_PLUS_FIREBASE_PROJECT_ID`, `NEWON_PLUS_FIREBASE_APP_ID`, `NEWON_PLUS_AUTH_PROVIDERS`, `NEWON_PLUS_AUTH_PERSISTENCE`.
- 서버 비밀(DB, Upstash, rate-limit secret)은 Vercel 환경변수에만 둡니다.

lockfile:

- `pg` 8.23.0과 하위 13개(pg-pool, pg-protocol, pg-types, pg-connection-string, pgpass, pg-int8, postgres-array, postgres-bytea, postgres-date, postgres-interval, split2, xtend, 선택 의존성 pg-cloudflare)를 반영했습니다.
- 값은 레지스트리 해석 결과(resolved·integrity)를 그대로 옮겼고, Mac 설치본의 기록(`node_modules/.package-lock.json`)과 14개 모두 일치합니다.

## 17. 공개 익명 모드 결정 (2026-09-30)

LIVON은 로그인 없는 무료 서비스로 먼저 공개합니다. 이 문서의 계정 백엔드는 **보존하되 LIVE 연결은 보류**합니다(Production `LIVON_USERDATA_ENABLED` 비활성 유지, 출시 스위치 `LIVON_ACCOUNT_SYNC_PUBLIC` 기본 꺼짐). 상세: `docs/newon/livon-public-anonymous-mode.md`
