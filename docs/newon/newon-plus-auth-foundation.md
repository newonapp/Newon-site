# Newon+ 소비자 인증 기반 (Auth Foundation V1)

작성일: 2026-09-29 · 선행 문서: `docs/newon/auth-architecture.md`(인증 구조 조사, 이 문서의 근거)

> **상태: 기반 코드만 있습니다. 실제 인증은 연결되지 않았습니다.**
> Newon+ Firebase 프로젝트가 없어서 설정값이 비어 있습니다. 그래서 모든 Newon 웹 서비스(LIVON 포함)는 **익명 모드**로 동작합니다.
> 로그인 버튼, OAuth, 실제 사용자, DB, 동기화 endpoint는 **없습니다**. "LIVE AUTH"가 아닙니다.

> **2026-09-30 갱신 — Account Backend & Sync V1:** 로그인 버튼(설정된 provider만), 서버 토큰 검증(`server/newon/auth/firebase-verifier.mjs`, node:crypto로 Firebase 공식 절차 수행), `/api/livon/userdata`, PostgreSQL 저장소, 동기화 엔진이 추가되었습니다. **Newon+ Firebase 프로젝트·DB가 아직 없으므로 실제 인증은 여전히 연결되지 않았고 LIVE AUTH가 아닙니다.** 설정 전에는 버튼이 나타나지 않고 API는 503입니다. 상세: `docs/newon/newon-plus-account-backend.md`.

표기: **[확인]** 이 저장소 코드·테스트로 확인 · **[외부 문서 기준]** Firebase 공식 문서 기준(2026-09-29 조회) · **[TODO]** 외부 설정이 필요한 일

## 1. 구성

| 파일 | 역할 |
|---|---|
| `newon-auth/newon-auth-config.js` | 공개 Firebase **웹** 설정. 커밋본은 `null`입니다. 빌드가 env로 덮어씁니다(§5). |
| `newon-auth/newon-auth-firebase.js` | Firebase 어댑터. 유효한 설정이 있을 때만 SDK를 **동적으로** 불러옵니다. 설정이 없으면 SDK 다운로드와 네트워크 요청이 모두 0입니다. |
| `newon-auth/newon-auth.js` | `window.NewonAuth`: 상태, 이벤트, 세션 정규화, 토큰 접근(메모리) |
| `newon-auth/newon-auth-ui.js` | 계정 상태 UI 경계 컴포넌트입니다. **V1에서는 어느 페이지에도 붙이지 않았습니다.** |
| `livon/data/livon-auth-bridge.js` | LIVON이 인증 상태를 받는 **유일한** 지점. `LivonUserData.setAuthProvider`로 연결하고, 가져오기 동의를 관리합니다. |
| `server/newon/auth/verify.mjs` | 서버 ID 토큰 검증 계층. 기본값은 **비활성**이며, 어떤 route도 사용하지 않습니다. |
| `server/newon/auth/accounts.mjs` | `(issuer, subject) → account_refs → accountId` 매핑과 계정 연결 **계약** |
| `scripts/newon-auth-config.mjs` | 빌드 시 공개 설정 생성 (`scripts/publish-site.mjs`에서 사용) |
| `vercel.json` | 보안 헤더. 기본 헤더는 적용하고 CSP는 report-only입니다(§12). |
| `tests/livon/newon-auth.test.mjs` | 21개 테스트 (NA-1 ~ NA-21) |

로드 순서 (LIVON `livon/index.html`, 모두 동기 스크립트):

`livon-user-data.js` → `newon-auth-config.js` → `newon-auth-firebase.js` → `newon-auth.js` → `livon-auth-bridge.js`

## 2. 관리자 인증과 분리 [확인]

- `newon-hq`(HQ 관리자, Google 로그인 + Rules의 관리자 UID)와 `newon-oxmonth`(OX MONTH)은 **Newon+ 설정으로 쓸 수 없습니다.** 세 곳에서 모두 거부합니다.
  - 클라이언트: `validateConfig` → `CONFIG_FORBIDDEN_PROJECT`
  - 빌드: `newonAuthConfigFromEnv` → `null`
  - 서버: `configFromEnv` → `enabled:false`
- 서버 계정 매핑은 HQ issuer(`https://securetoken.google.com/newon-hq`)를 `ADMIN_IDENTITY_NOT_ALLOWED`로 거부합니다.
- Firebase 앱 이름은 `newon-plus`로 따로 둡니다. HQ·OX 페이지와 SDK 상태를 공유하지 않습니다.
- `admin/`, `firestore.rules`, `apps/ox-month/`는 수정하지 않았습니다. NA-18이 확인합니다.

## 3. Adapter 계약 (provider 독립)

```
adapter.initialize()                       → Promise
adapter.onAuthStateChanged(cb, errCb)      → unsubscribe
adapter.getIdToken(forceRefresh)           → Promise<string|null>
adapter.signOut()                          → Promise
adapter.signIn(request)                    (선택 — V1 없음)
```

- Google/Apple/이메일 코드를 하드코딩하지 않습니다.
- 로그인 방식은 Newon+ 프로젝트가 켠 방식에 따라 다음 버전에서 `signIn(request)`로 연결합니다.
- V1의 `NewonAuth.signIn()`은 `SIGN_IN_NOT_CONFIGURED`를 반환합니다.

`NewonAuth` 공개 API:

- `initialize({config, adapterFactory})` — 한 번만 실행됩니다.
- `getState()`, `getSession()`
- `getIdToken({forceRefresh})`
- `authHeaders(url, {allowedOrigins})`
- `signIn`, `signOut`
- `subscribe(fn)` → unsubscribe
- `validateConfig`
- `create()` — 격리된 인스턴스

## 4. 인증 상태

| 상태 | 조건 |
|---|---|
| `loading` | 부팅 직후, 첫 판정 전 |
| `anonymous` | 설정 없음 / 잘못된 설정 / 로그아웃 상태. **V1 기본값** |
| `authenticated` | SDK가 사용자를 돌려주고, uid 형식이 맞을 때만 |
| `error` | SDK 로드 실패, 초기화 실패, 비정상 사용자 객체. 가짜 인증 상태로 대체하지 않습니다. |

세션으로 내보내는 필드는 `{issuer, subject, signInProvider}`뿐입니다. 이메일, 이름, 사진, 전화번호, 토큰은 포함하지 않습니다(NA-5).

## 5. 설정: 공개 값과 서버 비밀 구분

| 구분 | 변수 | 어디에 |
|---|---|---|
| **공개(빌드 시 브라우저로 전달)** | `NEWON_PLUS_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_APP_ID`, `NEWON_PLUS_AUTH_PERSISTENCE` | 호스팅 env → 빌드가 `_publish/newon-auth/newon-auth-config.js` 생성. **네 값이 모두 있을 때만** 생성 |
| **서버 전용** | `NEWON_AUTH_VERIFY_ENABLED`(기본 `false`), `NEWON_AUTH_ALLOWED_ISSUERS` | 서버 함수 env |
| **필요 없음** | 서비스 계정 / private key | ID 토큰 검증은 **프로젝트 ID만** 필요합니다 [외부 문서 기준]. 클라이언트 env로 요구하지 않습니다. 나중에 Admin 자격증명이 필요한 기능이 생기면 호스팅의 secret store에 두고, `NEWON_PLUS_FIREBASE_*` 이름은 쓰지 않습니다. |

Firebase 웹 API 키는 프로젝트 식별자이며 비밀이 아닙니다 [외부 문서 기준]. 보호는 Auth 허용 도메인, API 키 제한, 서버 검증으로 합니다.

클라이언트 `validateConfig`는 `private|secret|service|credential|client_email|password`가 들어간 키가 있으면 설정 전체를 거부합니다.

## 6. LIVON 연결

```
NewonAuth.subscribe ─→ LivonAuthBridge ─→ LivonUserData.setAuthProvider({getSession})
                                         remote adapter: 연결하지 않음 (SYNC_ENDPOINT_ENABLED=false, ENDPOINT_ENABLED=false)
```

- 로그인해도 `LivonUserData.mode()`는 `anonymous`로 유지됩니다. remote adapter가 없기 때문입니다. 데이터는 계속 이 기기에만 있습니다.
- 브리지에 넘기는 `userId`는 "이 탭에 누가 로그인했는지"를 표시하는 클라이언트 값입니다.
  - 서버는 이 값을 믿지 않습니다.
  - 소유자는 Bearer 토큰 → `(issuer, subject)` → `account_refs` → `accountId`로 서버가 정합니다.
- 로그인하면 자동으로 업로드되는 동작은 없습니다(NA-9).

## 7. 동의 흐름 (로그인 ≠ 업로드)

```
로그인 → 계정 확인 → 기기 데이터 발견 → offerImport() (개수만) → 사용자 선택 → approveImport() → [V2] 동기화
```

- `offerImport()`: 로그인 상태에서만 동작합니다. `planLoginImport()`의 개수를 보여 줍니다.
  - `requiresUserChoice:true`, `autoUpload:false`
- `approveImport()`: 제안(offer)이 먼저 있어야 합니다. 없으면 `NOT_OFFERED`입니다.
  - V1은 계정 저장소가 없으므로 `{status:"SYNC_NOT_AVAILABLE", uploaded:0}`을 반환하고, 아무것도 보내지 않습니다.
- 민감 데이터(건강, 돈, 일기)는 `includeSensitive === true`를 따로 선택해야만 포함합니다. 기본값은 제외입니다.
- 동의 상태는 페이지 세션 메모리에만 둡니다. 저장하지 않습니다. 로그아웃하면 초기화됩니다.
- 로그아웃해도 기기 데이터는 삭제하지 않습니다(NA-9).

## 8. 서버 토큰 검증 (`server/newon/auth/verify.mjs`)

순서: Bearer 파싱 → URL 토큰 거부 → claim 사전 검사 → **서명 검증(위임)** → claim 재검사 → 신원 반환

| 검사 | 규칙 | 실패 |
|---|---|---|
| Bearer | `Authorization` 헤더 정확히 1개, `Bearer <jwt>` 형식, 최대 4096자 | 401 `NO_TOKEN` / 400 `MALFORMED_TOKEN` |
| URL | `?id_token=`, `access_token`, `token`, `jwt` 등 | 400 `TOKEN_IN_URL` |
| header | `alg = RS256`, `kid`가 있어야 함 | 401 `INVALID_TOKEN` |
| `iss` | `https://securetoken.google.com/<projectId>` | 401 |
| issuer allowlist | `NEWON_AUTH_ALLOWED_ISSUERS`(기본값은 프로젝트 issuer) | 403 `ISSUER_NOT_ALLOWED` |
| `aud` | `<projectId>` | 401 |
| `exp` / `iat` / `auth_time` | exp는 미래, iat와 auth_time은 과거. 허용 오차 60초 | 401 `TOKEN_EXPIRED` / `INVALID_TOKEN` |
| `sub` | 비어 있지 않고 `[A-Za-z0-9_-]{6,128}` | 401 |
| 서명 | `verifySignature` 위임: Firebase Admin SDK `verifyIdToken` 또는 관리되는 JWKS 라이브러리 | 401 `INVALID_TOKEN` (라이브러리 오류 문구는 밖으로 내보내지 않음) |

- 반환값: `Object.freeze({verified:true, issuer, subject, authTime, signInProvider})`. 이메일은 포함하지 않습니다.
- 기본값은 비활성(fail closed)입니다. env가 꺼져 있거나, 프로젝트가 없거나 금지 프로젝트이거나, 검증기가 없으면 토큰을 보기 전에 503 `AUTH_NOT_CONFIGURED`를 반환합니다.
- **JWT 암호를 직접 구현하지 않았습니다.** 프로덕션 코드에는 서명 연산이 없습니다(NA-15가 검사).
  - 테스트는 매 실행마다 새로 만든 RSA 키로 실제 RS256 서명을 만들고, 테스트 전용 검증 함수로 확인합니다.
- **의존성 결정:** `firebase-admin`은 **설치하지 않았습니다.** `firebaseAdminVerifier()`는 동적 import를 시도하고, 설치되어 있지 않으면 503 `VERIFIER_NOT_INSTALLED`를 반환합니다.
  - 이유: 검증할 프로젝트가 아직 없습니다. `firebase-admin`은 Vercel 함수 번들 크기와 cold start에 영향을 줍니다.
  - 연결 단계에서 `firebase-admin`과 `jose`(JWKS) 중 하나를 고릅니다.
- 공개 키: `https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`. `Cache-Control max-age`만큼 캐시합니다 [외부 문서 기준].
- 폐기(revocation): `verifyIdToken`은 기본적으로 폐기 여부를 확인하지 않습니다 [외부 문서 기준]. 계정 삭제 같은 민감 작업에서는 `checkRevoked=true`를 씁니다(Admin 자격증명 필요 — 서버 secret store).

## 9. 계정 매핑 (`server/newon/auth/accounts.mjs`)

```
verified identity (issuer, subject) → account_refs → accountId ("acct_" + 32 hex, 불투명)
```

- Firebase uid를 내부 id로 쓰지 않습니다.
  - uid는 프로젝트 안에서만 고유합니다. 같은 uid가 다른 프로젝트(OX)에서 다른 사람일 수 있습니다.
- 새 계정은 Newon+ 주 issuer(`allowedPrimaryIssuers`)로만 만들 수 있습니다. OX 신원만으로는 Newon+ 계정을 만들 수 없습니다(`ISSUER_NOT_PRIMARY`).
- 신원 객체에 `email`, `emailVerified`, `userId`, `accountId`가 있으면 거부합니다(`UNEXPECTED_IDENTITY_FIELD`).
- 저장소 계약: `find`, `create`, `addLink`. 메모리 구현은 테스트 전용이고, route에 연결하지 않았습니다.
- DB 초안은 `docs/livon/account-data-foundation.md` §12입니다. `account_refs`의 unique 키는 `(issuer, subject)`입니다.

## 10. 계정 연결 계약 (endpoint 없음)

`planAccountLink({primary, secondary, userConfirmed}, repo, {allowedPrimaryIssuers, linkableIssuers})`

1. 두 신원 모두 서버 검증을 통과해야 합니다. 각각 5분 이내에 **다시 로그인**한 상태여야 합니다(`auth_time`). 아니면 `REAUTH_REQUIRED`입니다.
2. 사용자가 명시적으로 확인해야 합니다. 아니면 `CONFIRMATION_REQUIRED`입니다.
3. 두 신원의 issuer가 같으면 `SAME_ISSUER`로 거부합니다. 관리자 issuer는 거부합니다.
4. 상대 신원이 이미 다른 계정에 연결되어 있으면 409 `LINK_COLLISION`입니다. **병합하지 않습니다.**
5. 결과는 `{action:"link", accountId, issuer, subject, dataLinked:false}`입니다. 앱 데이터는 계정 연결과 별도로, 앱마다 사용자 선택으로 연결합니다.

**이메일이 같다고 자동으로 병합하지 않습니다.** 이메일은 신원 필드로 받지도 않습니다(NA-17).

## 11. 세션 보안

- 토큰은 Newon 코드가 저장하지 않습니다.
  - localStorage, sessionStorage, cookie, IndexedDB, URL, console을 사용하지 않습니다. NA-6이 정적 검사와 실행 검사로 확인합니다.
  - `getIdToken()`은 매번 SDK에 요청합니다.
- SDK 자체의 로그인 상태 저장 위치는 명시적으로 정합니다.
  - `session`(기본, 이 탭만), `local`, `memory` 중 하나입니다.
  - SDK가 내부적으로 IndexedDB나 sessionStorage에 두는 것은 SDK의 경계입니다 [외부 문서 기준].
- `authHeaders(url)`는 HTTPS이고 허용 origin(기본 same-origin)일 때만 Bearer 헤더를 만듭니다. `user:pw@` URL은 거부합니다. 쿼리 문자열로는 절대 보내지 않습니다.
- 로그아웃: SDK 호출이 실패해도 로컬 인증 상태를 지우고 `signed-out`을 보냅니다(`SIGN_OUT_FAILED` 코드 기록). 브리지는 `setAuthProvider(null)`을 호출하고 동의 상태를 초기화합니다.
- 쿠키 세션이 없으므로 CSRF 대상이 아닙니다. 쿠키 세션을 도입하면 SameSite 설정과 CSRF 토큰이 필요합니다.

## 12. CSP · 보안 헤더

### 12-1. 외부 의존성 inventory [확인 — 저장소 전체 검색]

| 종류 | 호스트 |
|---|---|
| 폰트 CSS / 파일 | fonts.googleapis.com, fonts.gstatic.com, db.onlinewebfonts.com, fonts.cdnfonts.com |
| 스크립트 | cdn.jsdelivr.net (LIVON gsap), www.gstatic.com (HQ, OX, 향후 Newon+의 Firebase SDK) |
| 영상 | d8j0ntlcm91z4.cloudfront.net, YouTube embed (www.youtube.com / youtube.com) |
| 이미지 | images.higgs.ai, i.ytimg.com, api.qrserver.com, TourAPI `http(s)://tong.visitkorea.or.kr` |
| API / 폼 | api.newon.app (OX), formsubmit.co, same-origin `/api/*` |
| 향후 Firebase Auth | identitytoolkit.googleapis.com, securetoken.googleapis.com, `*.firebaseapp.com` (frame) |
| 권한 API | `navigator.geolocation`(LIVON 주변 찾기) → `geolocation=(self)`. 카메라, 마이크, 결제, USB는 사용하지 않습니다. |

LIVON 첫 페이지: inline script 4개, inline 이벤트 핸들러 0개, style 속성 27개.

`/livon/life/*` route 페이지(빌드 산출물 기준 271개)는 각각 inline redirect 스크립트 1줄을 가집니다.

### 12-2. 적용 내용 (`vercel.json`)

- **적용(enforce)**: 사이트를 깨뜨릴 수 없는 헤더만 적용합니다.
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin` (브라우저 기본값과 같음, YouTube embed 유지)
  - `Permissions-Policy: camera=(), microphone=(), payment=(), usb=(), geolocation=(self)`
- **CSP는 `Content-Security-Policy-Report-Only`만** 적용합니다. 차단하지 않고 콘솔에만 보고합니다.
  - 사이트 전체(`/((?!livon/?$).*)`): 위 inventory의 호스트를 허용합니다. inline 스크립트가 많아 `'unsafe-inline'`을 허용합니다. `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`, `form-action 'self' https://formsubmit.co`.
  - LIVON 첫 페이지(`/livon`, `/livon/`): script-src는 **inline 스크립트 4개의 sha256 hash**, gstatic, jsdelivr만 허용합니다. `'unsafe-inline'`은 없습니다. Firebase Auth 연결 호스트를 미리 포함했습니다.
  - `livon/index.html`의 inline 스크립트를 바꾸면 hash가 달라집니다. NA-21이 실패하며 재계산할 hash를 알려 줍니다.
- `report-uri`/`report-to`는 두지 않았습니다. 수집 endpoint를 만들지 않았기 때문입니다. 위반은 브라우저 콘솔 `[Report Only]`로 확인합니다.

### 12-3. GitHub Pages와 Vercel 차이

- `vercel.json` 헤더는 **Vercel 배포에만** 적용됩니다.
- GitHub Pages(`_publish/`, Actions 배포)는 사용자 정의 응답 헤더를 지원하지 않습니다.
  - `<meta http-equiv="Content-Security-Policy">`로는 report-only와 `frame-ancestors`를 쓸 수 없습니다.
  - 그래서 meta CSP는 넣지 않았습니다.
- `www.newon.app`이 실제로 어느 호스팅에서 응답하는지는 [TODO] 운영 확인 항목입니다.
- Vercel `source` 패턴은 path-to-regexp 문법입니다. 로컬에서는 같은 의미의 JS 정규식으로만 검증했습니다(NA-21). Vercel 매칭 자체는 배포 후 확인해야 합니다.
- 강제(enforce) 전환 순서: report-only 배포 → 콘솔/리포트에서 위반 0건 확인 → LIVON부터 enforce → 사이트 전체.

## 13. 이벤트

- 이벤트는 `ready`, `signed-in`, `signed-out`, `error` 4종입니다. `NewonAuth.subscribe` 한 곳으로만 받습니다.
- `window` 전역 이벤트 버스나 CustomEvent는 쓰지 않습니다.
- 늦게 구독한 쪽은 `ready`를 한 번 받습니다.
- listener에서 예외가 나도 다른 listener에는 영향이 없습니다.
- LIVON에서는 `livon-auth-bridge.js`만 구독합니다.

## 14. Flutter (Newon+ 앱) 호환 경로

Newon+ 앱 소스는 이 저장소에 없습니다 [미확인]. 아래는 설계입니다.

| 공유 | 내용 |
|---|---|
| issuer | 같은 Newon+ Firebase 프로젝트에 Android, iOS, Web 앱을 등록합니다. 토큰의 `iss`와 `aud`가 같습니다. |
| identity 모델 | `(issuer, subject)`. 웹과 앱에서 같은 사용자는 같은 uid입니다(같은 프로젝트). |
| 서버 검증 | 같은 `verify.mjs`. 앱은 `FirebaseAuth.instance.currentUser.getIdToken()` → `Authorization: Bearer`로 보냅니다. |
| 계정 매핑 | 같은 `account_refs` → 같은 `accountId` |
| 토큰 보관 | Flutter SDK의 기본 보관 방식(플랫폼 보안 저장소)을 따릅니다. 앱 코드에서 따로 저장하지 않습니다. |

앱에서 쓰는 로그인 방식(Google, Apple 등)은 프로젝트 설정으로 켭니다. 서버와 계정 매핑 쪽은 로그인 방식과 무관합니다.

## 15. OX MONTH 이전 (설계만, OX 코드 변경 없음)

현재 [확인]:

- OX MONTH는 `newon-oxmonth` 프로젝트에서 이메일/비밀번호로 로그인합니다.
- `browserLocalPersistence`를 씁니다.
- 동기화는 `api.newon.app`로 Bearer 토큰을 보냅니다. 이 서버의 소스는 저장소에 없습니다.

선택지:

1. **연결(권장, 단계적)**: OX 계정을 그대로 둡니다. Newon+ 계정으로 로그인한 사용자가 OX 계정으로도 다시 로그인하면 `planAccountLink`로 연결합니다. OX 데이터는 사용자 선택으로 가져옵니다.
2. **이전**: Firebase Auth 사용자 내보내기/가져오기로 Newon+ 프로젝트로 옮깁니다. uid와 비밀번호 hash 처리, `api.newon.app` 서버 변경이 필요합니다. 영향이 커서 별도 승인이 필요합니다.
3. **유지**: OX는 독립 서비스로 둡니다.

어느 쪽이든 이메일이 같다는 이유로 자동 병합하지 않습니다. `newon-oxmonth` issuer는 `linkableIssuers`로만 다룹니다.

## 16. 멤버십 · 권한(entitlement)은 인증과 분리

- 인증은 "누구인가"(accountId)만 답합니다.
- 멤버십과 구독은 별도 테이블(`entitlements(account_id, product, plan, status, source, period_end)`)과 서버 결정으로 다룹니다.
  - 결제 영수증 검증: Google Play, App Store, 웹 결제
- 토큰 custom claim에 구독 상태를 넣지 않습니다(갱신이 느리고 폐기가 어렵습니다).
- V1에는 구독, 요금제, "Plus 회원" 표시가 **없습니다.** 가짜 구독 상태도 만들지 않았습니다.

## 17. 외부 설정 체크리스트 [TODO — 지금 할 일 아님]

1. Newon+ 소비자 전용 Firebase 프로젝트를 만듭니다. `newon-hq`, `newon-oxmonth`와는 별도입니다.
2. 그 프로젝트에 Web 앱을 등록합니다 → 공개 설정 4개를 호스팅 env `NEWON_PLUS_FIREBASE_*`에 넣습니다.
3. Authentication에서 로그인 방식을 켜고, 허용 도메인(`www.newon.app`, 미리보기 도메인)을 정리합니다.
4. Google Cloud에서 API 키에 HTTP referrer 제한과 API 제한을 겁니다.
5. 서버 검증기를 고르고(firebase-admin 또는 jose) 설치합니다 → `NEWON_AUTH_VERIFY_ENABLED=true`.
6. DB를 고르고 만듭니다(`account_refs`, `user_records` …). 소유자 조건 테스트를 갖춥니다.
7. `/api/livon/userdata` route를 추가하고 `ENDPOINT_ENABLED=true`로 켭니다(3~6 완료 후).
8. 로그인 UI 흐름을 만들고 `NewonAuthUI`를 붙입니다. 가져오기 동의 화면도 만듭니다.
9. Newon+ Flutter 앱을 같은 프로젝트에 연결합니다(Android SHA 지문, iOS bundle id).
10. CSP report-only 결과를 확인한 뒤 enforce로 전환합니다. `www.newon.app`의 실제 호스팅(Vercel/GitHub Pages)도 확인합니다.
11. 개인정보처리방침에 계정 데이터, 동기화, 보관 기간을 반영합니다.
12. OX 연결/이전 방식을 결정합니다(§15).

## 18. 테스트 (`tests/livon/newon-auth.test.mjs`)

| ID | 내용 |
|---|---|
| NA-1 | 설정 없음 → anonymous. SDK, 네트워크, 저장소 사용 0 |
| NA-2 | 설정 검증: HQ/OX 프로젝트 거부, 서버 자격증명 필드 거부, 형식 오류 거부 |
| NA-3 | 상태와 이벤트 (ready / signed-in / signed-out), 한 번만 초기화, 외부 로그아웃 |
| NA-4 | error 상태 (SDK 실패, 비정상 사용자, 어댑터 누락, 금지 프로젝트) |
| NA-5 | 세션 정규화 (개인정보 없음) |
| NA-6 | 토큰 비저장, 로그 없음, Bearer는 HTTPS와 허용 origin만 |
| NA-7 | SDK 실패 시에도 로그아웃 처리 |
| NA-8 | Firebase 어댑터 계약 (가짜 SDK): 앱 이름, 공개 설정만, persistence, 로그인 방식 하드코딩 없음 |
| NA-9 | LIVON 브리지: 로그인 ≠ 업로드, 가져오기 제안과 승인, 네트워크 0, local data 유지 |
| NA-10 | 민감 데이터는 별도 선택, 동의 상태 비저장 |
| NA-11 | LIVON 스크립트 순서와 동기 로드, 정적 SDK 없음, UI 미장착 |
| NA-12 | UI 경계 (가짜 provider 버튼 없음) |
| NA-13 | Bearer 파싱, URL 토큰 거부 |
| NA-14 | 검증기 fail closed, 새 의존성 없음 |
| NA-15 | 실제 RS256 서명으로 iss, allowlist, aud, exp, iat, auth_time, sub, alg, 변조 검증. client userId 무시 |
| NA-16 | account_refs 매핑, uid ≠ accountId, OX/HQ 제한 |
| NA-17 | 계정 연결: 확인, 재인증, 충돌, 이메일 자동 병합 금지 |
| NA-18 | HQ/OX 파일 변경 없음, 상호 참조 없음 |
| NA-19 | 빌드 공개 설정 생성 (부분 설정, 금지 프로젝트, 서버 값 유출 방지) |
| NA-20 | `.env.example` 공개/서버 구분, 값 없음 |
| NA-21 | 보안 헤더, CSP report-only, LIVON hash 일치, 경로 매칭 |
