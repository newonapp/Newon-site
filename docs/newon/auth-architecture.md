# Newon+ 인증 구조 조사 · LIVON 연동 계획 (V1)

조사일: 2026-09-29 · 대상: Newon 사이트 저장소 (cloud 작업본 = HEAD 9955f3065 + LIVON 누적 작업, PUBLIC LAW EXPERT 제외)

표기

- **[확인]** 이 저장소의 코드·설정에서 import와 호출 흐름까지 확인한 사실입니다.
- **[미확인]** 이 저장소에 코드가 없어 확인할 수 없는 부분입니다.
- **[제안]** 조사 결과를 바탕으로 한 설계 제안입니다.
- **[외부 문서 기준]** 이 저장소가 아니라 제품의 공개 동작에 근거한 내용이며, 연결 전에 공식 문서로 다시 확인해야 합니다.

## 1. 요약

| 질문 | 답 |
|---|---|
| Newon+ 로그인이 이 저장소에 구현되어 있는가 | **아니요.** [확인] Newon+는 소개 페이지(`*/portfolio/newon-plus/`, Google Play 링크 `com.newon.newon`)로만 존재합니다. 로그인 코드는 없습니다. |
| Newon+ 앱 자체의 인증 | **[미확인]** Newon+ Android 앱 소스가 이 저장소에 없습니다(`scripts/production-health/config.mjs`에 "Flutter source lives outside this repo"로 적혀 있음). |
| 저장소 안의 실제 인증 | [확인] 두 곳에 있습니다. ① Newon HQ 관리자 콘솔(`admin/`): Firebase Auth + Google 로그인, 프로젝트 `newon-hq`. ② OX MONTH Web(`apps/ox-month/`): Firebase Auth 이메일/비밀번호, 프로젝트 `newon-oxmonth`. |
| 서버 측 토큰 검증 | [확인] 이 저장소의 서버 코드(`api/`, `server/`)에는 **토큰 검증이 없습니다.** OX MONTH Web은 Firebase ID 토큰을 `https://api.newon.app/api/sync/v1/ox_month`에 Bearer로 보냅니다. **이 API 서버 코드는 이 저장소에 없습니다(미확인).** |
| 후속: Auth Foundation V1 | 이 조사 뒤에 Newon+ 소비자 인증 **기반 코드**를 추가했습니다(`newon-auth/`, `server/newon/auth/`). 설정이 비어 있어 **실제 인증은 연결되지 않았습니다.** 상세: `docs/newon/newon-plus-auth-foundation.md`, 이 문서 §15 |
| LIVON | [확인] (조사 시점) 로그인이 없습니다. "로그인이 필요합니다 / 계정 연동은 준비 중" 안내 모달만 있습니다(인증이 아닌 UI). `life-hub.js`의 `Account.isSignedIn()`은 LivonUserData 모드를 따르며 항상 false입니다. |

## 2. 현재 구현 (코드 기준)

### 2-1. Newon HQ 관리자 콘솔 — `admin/`

- 설정 `admin/firebase-config.js` [확인]
  - Firebase **Web 클라이언트 설정**만 있습니다: apiKey, authDomain `newon-hq.firebaseapp.com`, projectId `newon-hq`, storageBucket, messagingSenderId, appId, measurementId.
  - 허용할 관리자 1명의 Auth UID(`ADMIN_UID`)가 있습니다.
  - 파일 주석에 "No service accounts, private keys, or Admin SDK"라고 적혀 있습니다.
- 인증 `admin/hq-auth.js` [확인]
  - `firebase-app` / `firebase-auth` / `firebase-firestore` 11.0.2를 gstatic CDN ES module로 가져옵니다.
  - `getAuth` → `GoogleAuthProvider`(`prompt: select_account`) → `signInWithPopup` 순서로 로그인합니다.
  - `onAuthStateChanged` → `applyUser`에서 `user.uid === ADMIN_UID`인지 확인합니다. 아니면 "Access denied"를 보여 줍니다.
  - 로그아웃은 `signOut(auth)`입니다.
- 데이터 [확인]
  - `admin/hq-app.js`, `hq-crm.js` 등이 Firestore 컬렉션(`hq_tasks`, `hq_releases`, `hq_leads`, `hq_finance`, `hq_projects` …)을 읽고 씁니다.
  - 서버 측 강제: `firestore.rules`가 `request.auth.uid == '<admin uid>'`일 때만 read/write를 허용합니다. 클라이언트의 UID 확인은 화면용이고, 실제 권한은 Rules가 결정합니다(올바른 구조).
- 세션·토큰 [확인]: Firebase Web SDK 기본 persistence를 씁니다(명시적인 `setPersistence`는 없음). 이 코드에는 LIVON이나 다른 서버로 ID 토큰을 보내는 호출이 없습니다.
- 운영 문서 [확인]: `docs/operations/*`에 FormSubmit 수집 Cloud Functions(`newon-hq`, 서버 비밀은 Secret Manager 사용)가 **계획/미배포**로 적혀 있습니다. `ingest/` 코드는 이 저장소(및 연결된 Mac 폴더)에 없습니다.

### 2-2. OX MONTH Web — `apps/ox-month/`

- 설정 `apps/ox-month/firebase-config.js` [확인]
  - 프로젝트 `newon-oxmonth`의 Web 클라이언트 설정입니다.
  - "NEVER use HQ (newon-hq) here"라고 적혀 있어, **제품별로 Firebase 프로젝트를 분리**하고 있습니다.
- 인증 `ox-month-web-app.js` [확인]
  - `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`(회원가입), `signOut`을 씁니다.
  - `setPersistence(auth, browserLocalPersistence)`로 로그인 상태를 브라우저에 유지합니다.
  - `onAuthStateChanged`에서 사용자가 있으면 `loadSync(user)`를 부릅니다.
  - Google·Apple·Kakao 로그인 코드는 **없습니다**.
- 서버 호출 `apps/ox-month/ox-month-sync.mjs` [확인]
  - `GET/PUT/PATCH https://api.newon.app/api/sync/v1/ox_month`를 호출합니다.
  - 헤더: `Authorization: Bearer <Firebase ID token>`. 토큰은 `user.getIdToken()`으로 매 요청 직전에 받습니다(SDK가 갱신 처리).
  - 본문·URL에 email/userId를 넣으면 **오류를 던집니다**(`assertNoClientIdentityInBody/Url`). 주석에 "Ownership is never email/userId — Firebase token uid only"라고 적혀 있습니다.
  - 동시성: `baseRevision` 낙관적 잠금이고, 충돌 시 `409 revision_conflict`입니다. 응답에는 `appId`, `revision`, `schemaVersion`, `updatedAt`, `payload`가 있습니다(`ox-month-parser.mjs`).
  - 처음 문서 생성(PUT baseRevision 0)은 사용자가 명시적으로 할 때만 합니다(GET 404에서 자동 생성 금지).
- `?mock=1`(또는 `window.OX_MONTH_WEB_MOCK`) 데모 모드 [확인]
  - 가짜 사용자(`demo@example.com`)와 가짜 토큰을 쓰고, 페이지 안의 fake fetch로만 동작합니다. 실제 API는 호출하지 않습니다.
  - 보안 문제는 아니지만, production에서도 URL 파라미터로 열립니다(참고 사항, LIVON 범위 밖이라 수정하지 않음).
- **`api.newon.app` 서버** [미확인]
  - 코드가 이 저장소에 없습니다. 토큰 검증 방식(서명·`aud`·`iss` 확인)과 저장소를 확인할 수 없습니다.
  - 클라이언트 계약상 **Firebase ID 토큰의 uid를 소유자로 쓰는 서버**가 전제되어 있습니다.
  - cloud 환경에서는 네트워크 정책으로 접속 확인도 할 수 없었습니다.

### 2-3. LIVON — `livon/`, `server/livon/`, `api/livon/`

- 인증 없음 [확인]
  - `/api/livon/chat`: IP 기반 레이트리밋(Upstash) + Origin 확인만 합니다.
  - `/api/livon/data`: 공개 데이터 프록시입니다.
- 계정 기반(이전 단계에서 만든 것) [확인]
  - `livon/data/livon-user-data.js`: 익명 모드, `setAuthProvider`(호출하는 곳 없음), `configured:false` remote adapter
  - `server/livon/userdata/contract.mjs`: 라우팅되지 않은 검증 계약
  - 로그인 UI는 "준비 중" 안내 모달만 있습니다.

### 2-4. 그 밖에 검색한 것 [확인]

| 항목 | 결과 |
|---|---|
| Supabase, OAuth 라이브러리, Kakao 로그인, Apple 로그인, Google Identity Services, magic link, 자체 JWT 발급·검증 | 없음 |
| `document.cookie` 사용 | 없음 |
| Firebase Analytics / Storage / Messaging / Realtime Database / Functions SDK import | 없음. `measurementId`가 HQ 설정에 있지만 Analytics SDK는 import하지 않습니다. |
| 사이트 분석 `analytics.js` | gtag로 이벤트를 전달하는 코드이며, 이 저장소에는 GA4가 설정되어 있지 않습니다(`ga4ConfiguredInRepo: false`). Firebase와 무관합니다. |
| 사업 페이지의 "Firebase" | 가격표 문구일 뿐 코드가 아닙니다. |

## 3. 계정 모델 (실제로 있는 필드만)

| 위치 | 식별자·필드 | 비고 |
|---|---|---|
| HQ | Firebase `User.uid`, `User.email`(거부 화면 표시용) | 관리자 1명. 프로필 저장소 없음 |
| OX MONTH Web | Firebase `User.uid`(토큰 안), `User.email`(로컬 키 이름에 사용) | 서버 문서는 `appId`/`revision`/`schemaVersion`/`updatedAt`/`payload` |
| LIVON | 없음 (익명). `deviceId`(`dv_…`)는 동기화 메타데이터용 난수이며 계정이 아님 | – |

- 구독·멤버십·앱 권한(entitlement)·Newon+ 회원 정보 모델은 이 저장소에 **없습니다**.
- 소개 페이지의 "구독 상태, 패밀리 공유" 등은 앱 설명 문구입니다.

## 4. Newon+의 의미 (현재 코드 범위)

- 소개 문구: "하나의 계정으로 모든 Newon 앱에 로그인", "통합 멤버십". 이 저장소에서 확인되는 구현은 **없습니다**.
- 오히려 현재 코드는 제품마다 Firebase 프로젝트를 **분리**합니다(`newon-hq` ≠ `newon-oxmonth`).
  - Firebase uid는 발급한 프로젝트 안에서만 유일합니다. 따라서 **지금은 앱 간 공통 계정 ID가 없습니다.**
- 이 문서는 Newon+를 "통합 로그인(인증)"으로만 다룹니다.
  - 앱 간 데이터 자동 공유, 프로필 자동 공유, 자동 동의는 SSO와 별개입니다. 각 앱이 각자의 데이터를 소유하고, 공유가 필요하면 사용자 동의를 따로 받습니다.

## 5. Secret audit

| 검사 | 결과 |
|---|---|
| private key, service account JSON, `client_email …iam.gserviceaccount`, AWS/GitHub/Slack 토큰, OpenAI 키 패턴 (tracked 파일 전체 + 로컬 커밋 8개 diff) | **없음** |
| 저장소 내장 `scripts/production-health/lib/secrets-audit.mjs` 실행 | FAIL 1건: `tests/livon/chat.test.mjs`의 `OPENAI_API_KEY: 'test-placeholder-not-a-real-key'`. **오탐**(명시적 placeholder)입니다. WARN 1건: `firestore.rules`의 하드코딩 관리자 UID. |
| tracked `.env`, `.pem`, `.key`, keystore, `google-services.json`, `GoogleService-Info.plist` | 없음 (`.env.example`만 있음) |
| Firebase Web `apiKey` (`admin/firebase-config.js`, `apps/ox-month/firebase-config.js`) | **클라이언트 설정값이며 비밀이 아닙니다.** 공개되어도 권한을 주지 않습니다. 보호는 Auth와 Rules/서버 검증이 담당합니다. 값은 보고하지 않습니다. |
| 관리자 UID (`firestore.rules`, `admin/firebase-config.js`) | 식별자이며 비밀이 아닙니다. 권한은 Rules가 강제합니다. 값은 보고하지 않습니다. |
| git 전체 히스토리 | cloud 사본이 partial clone이라 **전체 히스토리 blob은 검사하지 않았습니다**(현재 트리와 로컬 커밋만 검사). |

## 6. LIVON Foundation 호환성

| Foundation 요소 | Firebase ID 토큰 기반 인증과의 관계 | 판단 |
|---|---|---|
| `LivonUserData.setAuthProvider({getSession})` | Firebase `onAuthStateChanged`의 `user`로 `{ userId: user.uid, verified: true }`를 넘깁니다(클라이언트의 `verified`는 "SDK 로그인 상태" 의미). 실제 검증은 서버가 합니다. | 호환 |
| `createRemoteAdapter({endpoint, getAccessToken})` | `getAccessToken: () => user.getIdToken()`. Bearer 방식은 OX MONTH와 같습니다. 본문에 userId를 넣지 않습니다. | 호환 |
| remote endpoint 제한(같은 출처 `/api/…`) | LIVON 자체 API(Vercel)를 쓰면 그대로 됩니다. `api.newon.app` 같은 다른 출처를 쓰려면 origin allowlist와 CORS가 필요합니다. | 필요할 때 작은 수정 |
| 서버 계약 `prepareSyncRequest` | **이번에 수정했습니다.** 세션을 `{verified, issuer, subject, accountId}`로 받고, `allowedIssuers`에 없는 issuer(다른 앱의 Firebase 프로젝트) 토큰을 거부합니다. 행 소유자는 서버가 `(issuer, subject)`로 찾은 `accountId`입니다. | 호환 (수정 반영) |
| `account_refs` | `(provider, subject)` → **`(issuer, subject)`** 로 문서를 수정했습니다. 프로젝트마다 uid 공간이 달라서입니다. | 호환 (수정 반영) |
| `user_records`, `saved_items`, `calendar_items`, `preferences`, `sync_metadata` | 인증 방식과 무관한 소유자 키(`owner_id`) 구조입니다. | 유지 |
| Newon Sync API v1(`api.newon.app`, 문서 단위 + `baseRevision`) | LIVON 레코드 단위 sync와 모델이 다릅니다. Newon Sync API를 LIVON에도 쓰려면 LIVON 데이터를 `appId=livon` 문서 하나로 보내고, 409 때 `mergeCollection`으로 병합해 재시도하는 어댑터가 필요합니다. 서버 코드가 없어 지원 여부는 **미확인**입니다. | 선택지 (§10) |

## 7. Identity boundary

목표 흐름: Browser → Newon+ 세션/토큰 → LIVON 서버 → 서버가 토큰 검증 → 계정 확정 → DB

- **가능합니다.** 조건은 Newon+ 인증이 검증 가능한 토큰을 발급하는 것입니다.
  - Firebase Auth라면 [외부 문서 기준]: Firebase ID 토큰은 RS256 JWT입니다. 서버는 Google 공개 키로 서명을 확인하고 `aud = <projectId>`, `iss = https://securetoken.google.com/<projectId>`, `exp`/`iat`/`auth_time`, `sub`(uid)를 확인합니다.
  - 이 검증에는 service account가 필요하지 않고 project ID만 필요합니다. Vercel 서버 함수(Node)에서 할 수 있습니다.
- LIVON 쪽 준비 상태 [확인]
  - 계약이 클라이언트 userId를 거부하고 서버 세션만 신뢰합니다.
  - 쓰기 endpoint는 인증이 생길 때까지 없습니다(`ENDPOINT_ENABLED=false`, `api/`에 파일 없음).
- 막힌 점: **어떤 issuer(Firebase 프로젝트)가 Newon+ 계정인지 결정되지 않았습니다** [미확인].
  - `newon-hq`는 관리자 전용이라 소비자 계정으로 쓰면 안 됩니다.
  - `newon-oxmonth`는 OX MONTH 전용입니다.

## 8. Cross-app SSO

### 8-1. 현재

- 제품별 Firebase 프로젝트로 계정이 분리되어 있습니다. 공통 issuer, 공통 audience, 공통 세션이 없어 **SSO가 없습니다** [확인].
- 웹 세션 저장: Firebase Web SDK는 로그인 상태를 origin별 브라우저 저장소에 둡니다(OX는 `browserLocalPersistence`). 쿠키가 아니므로 `*.newon.app` 사이에서 자동으로 공유되지 않습니다.
- 사이트 도메인: `www.newon.app`(CNAME). API: `api.newon.app`(다른 origin).
- 로그아웃은 각 앱에서만 됩니다(`signOut`). 앱 간 전파는 없습니다.

### 8-2. 필요한 구조 [제안]

| 항목 | 요구 |
|---|---|
| issuer | Newon+ 계정용 **단일 issuer** (한 개의 소비자 Firebase 프로젝트, 또는 Newon 자체 OIDC `auth.newon.app`) |
| audience | 서비스별 audience(또는 서버에서 `allowedIssuers` + 서비스별 권한 확인). 한 서비스용 토큰을 다른 서비스가 그대로 쓰지 못하게 합니다. |
| web | 같은 issuer의 Web SDK를 각 앱 origin에서 쓰거나, `auth.newon.app` 리디렉션 로그인(OIDC code + PKCE)을 씁니다. 쿠키를 쓴다면 `Domain` 범위, `SameSite`, CSRF 설계가 필요합니다. |
| mobile (Flutter) | 같은 Firebase 프로젝트의 Android/iOS 앱으로 등록하거나, 시스템 브라우저 기반 OIDC를 씁니다. 앱 간 자동 로그인은 플랫폼 기능(계정 공유)이 필요하고 별도 설계 대상입니다. |
| refresh | Firebase는 SDK가 refresh token으로 ID 토큰(1시간)을 갱신합니다 [외부 문서 기준]. 서버는 매 요청 ID 토큰만 받고 refresh token은 다루지 않습니다. |
| logout 전파 | 즉시 전체 로그아웃이 필요하면 서버에서 refresh token을 폐기하고, 민감한 작업은 `checkRevoked` 검증을 합니다. 아니면 ID 토큰 만료(≤1시간)까지 유효합니다. |
| 계정 연결 | 기존 앱별 uid(`newon-oxmonth` 등)를 Newon+ 계정에 붙이려면 **명시적인 연결 절차**(로그인 증명 두 개)가 필요합니다. 이메일이 같다는 이유만으로 자동 병합하지 않습니다. |
| 데이터 | SSO는 로그인만 공유합니다. 앱 데이터·프로필 공유는 앱별 동의 후에만 합니다. |

## 9. 인증 방식 비교

가격 숫자는 넣지 않았습니다. 요금 구조만 적었으며, 계약 전에 공식 페이지에서 확인해야 합니다.

| 기준 | A. Firebase Auth (기존 활용) | B. 별도 Newon Auth 서비스 (자체 OIDC) | C. Supabase Auth | D. Firebase Auth → Newon 서버 세션 교환 |
|---|---|---|---|---|
| 기존 코드 재사용 | **높음.** HQ·OX가 이미 사용 중이고, OX는 Bearer ID 토큰 패턴까지 있음 [확인] | 낮음 (새로 구축) | 낮음 (새 SDK) | 높음 (A 위에 얹음) |
| web | Web SDK | 직접 구현 | JS SDK | A + 서버 쿠키 |
| 향후 Flutter 앱 | `firebase_auth` 공식 플러그인 [외부 문서 기준]. production-health 도구도 `firebase_auth` 사용을 전제로 검사 | 직접 구현 | 공식 Flutter SDK 있음 | A와 같음 |
| Google / Apple / 이메일 | 모두 제공 (Apple은 Apple 개발자 설정 필요) | 직접 구현 | 제공 | A와 같음 |
| 서버 토큰 검증 | JWT 공개 키 검증, service account 불필요 | 자체 | JWT 검증 | 서버 세션 |
| Newon+ SSO | 단일 소비자 프로젝트로 모으면 가능. 지금의 제품별 분리와 충돌하므로 마이그레이션 필요 | 설계 자유도 가장 큼 | 단일 프로젝트로 가능 | A와 같음 |
| Postgres 연동 | 분리 구조 (uid → account_refs) | 자유 | **같은 제품 안**(RLS) | 분리 구조 |
| 보안 | 검증된 SDK, 토큰은 브라우저 저장 (XSS 주의) | 구현 품질에 의존 | 검증된 SDK | HttpOnly 쿠키로 XSS 노출 감소, CSRF 대책 필요 |
| migration | 기존 계정 유지 | 전체 이전 | 전체 이전 | 기존 계정 유지 |
| 운영 복잡도 | 낮음 | 높음 | 중간 | 중간 |
| lock-in | 중간 (계정 export 가능 [외부 문서 기준]) | 낮음 | 중간 | 중간 |
| 비용 구조 | 활성 사용자·인증 방식별 과금 구간 있음 (전화 인증 등 별도) | 인프라 + 인력 | 요금제 단위 | A + 서버 비용 |

## 10. DB 선택 (Auth와 분리)

- Auth와 DB는 같은 제품일 필요가 없습니다.
- LIVON 데이터(할 일·목표·캘린더·저장 snapshot·설정·sync metadata)는 소유자별 조회, 중복 방지, 연결 관계, tombstone이 필요합니다. 그래서 **관계형(Postgres)** 이 가장 잘 맞습니다(Account Foundation §12 schema).
- 검토한 조합

| 조합 | 판단 |
|---|---|
| **Firebase Auth + Postgres (Vercel 서버 함수)** | 권장. 인증은 기존 방식을 그대로 쓰고, 데이터는 관계형 + 이식성을 얻습니다. |
| Firebase Auth + Firestore | 이미 HQ에서 쓰는 조합이라 도구는 익숙합니다. 하지만 레코드 단위 sync, 중복 방지, 쿼리 제약, 읽기/쓰기 과금 변동 때문에 차선입니다. |
| Firebase Auth + 기존 Newon Sync API(`api.newon.app`) | 서버 코드를 확인할 수 없어 **미확인**입니다. 확인되면 문서 단위 동기화로 재사용할 수 있습니다(LIVON 쪽 409 → merge 어댑터 필요). |
| Supabase (Auth + Postgres) | 새로 시작한다면 간단합니다. 하지만 기존 Firebase 계정과 이중 계정 문제가 생깁니다. |

## 11. 권장 구조 [제안]

```
Newon+ 계정 = 소비자 전용 Firebase 프로젝트 1개 (issuer 하나, HQ와 분리)
   ├─ Web (LIVON, OX MONTH Web …): Firebase Web SDK 로그인 → getIdToken()
   └─ Flutter 앱: firebase_auth → getIdToken()
          │  Authorization: Bearer <ID token>        (쿠키 없음 → CSRF 대상 아님)
          ▼
LIVON 서버 (Vercel /api/livon/userdata — 인증 연결 후에만 생성)
   ├─ ID 토큰 검증: 서명(Google 공개 키) · aud=<project> · iss · exp · sub
   ├─ allowedIssuers = [Newon+ 프로젝트 issuer]
   ├─ (issuer, sub) → account_refs → accountId
   └─ contract.prepareSyncRequest(body, session) → Postgres (owner_id = accountId)
```

근거 [확인]:

- Newon은 이미 Firebase Auth를 두 곳(HQ Google 로그인, OX 이메일 로그인)에서 쓰고 있습니다.
- OX MONTH가 "Firebase ID 토큰 Bearer → 서버가 uid로 소유자 결정"이라는 같은 패턴을 쓰고, 클라이언트 identity를 금지합니다.
- LIVON Foundation의 인터페이스(`getSession`/`getAccessToken`/계약)가 이 흐름과 맞습니다.

결정이 필요한 것 [미확인·차단 요소]:

1. Newon+ 앱(`com.newon.newon`)이 실제로 어떤 인증을 쓰는지 (Firebase 프로젝트 ID, 로그인 방식)
2. 소비자 계정을 어느 Firebase 프로젝트로 모을지. 기존 `newon-oxmonth` 계정의 연결·이전 방안 포함
3. `api.newon.app` 서버의 소스·검증 방식·운영 주체. LIVON이 재사용할지, LIVON 자체 API로 갈지

## 12. Migration 단계

| 단계 | 내용 | 기존 local data |
|---|---|---|
| A. Auth 확인 | Newon+ issuer 확정. 서버에 ID 토큰 검증 함수 추가(테스트용 JWKS, 실제 키·계정 없이 단위 테스트). `allowedIssuers` 설정 | 영향 없음 |
| B. 계정 매핑 | `account_refs (issuer, subject)`. 앱별 기존 uid 연결은 명시적 연결 절차로만 | 영향 없음 |
| C. DB | Postgres 선택·생성 (사용자 승인 후). Foundation §12 schema. 소유자 조건이 없는 쿼리는 금지 | 영향 없음 |
| D. Sync API | `/api/livon/userdata`: 검증 → `prepareSyncRequest` → upsert/list(sinceServerRev). `ENDPOINT_ENABLED=true`는 A–C 완료 후에만 | 영향 없음 |
| E. 로그인·가져오기 동의 | 로그인 UI(Newon+). 첫 로그인 때 `planLoginImport()` 개수를 보여 주고 사용자가 범위를 선택(민감 데이터는 기본 제외) → 업로드 | **local 원본은 유지**(업로드 후에도 삭제하지 않음) |
| F. 기기 간 동기화 | `list` → `mergeCollection` → local 반영. conflict 복사본은 사용자가 정리 | 병합만 하고 조용한 삭제 없음 |

## 13. 보안 위협 검토

| 위협 | 현재 코드 (확인 결과) | 대책 / 설계 |
|---|---|---|
| 토큰 탈취 | LIVON은 토큰이 없습니다. OX·HQ는 Firebase SDK가 브라우저 저장소에 토큰을 둡니다(SDK 표준 동작). | 짧은 ID 토큰, HTTPS, 서버 검증. 민감 작업은 revocation 확인 |
| XSS로 토큰 노출 | 저장소에 **CSP 설정이 없습니다**(`vercel.json`에 보안 헤더 없음, meta CSP 없음). LIVON 렌더링은 escape를 적용하고 테스트로 검증합니다. | 로그인 도입 전에 CSP(script-src 제한) 추가를 권장합니다. 토큰을 localStorage에 직접 저장하지 않습니다(SDK에 맡김). |
| CSRF | 쿠키 인증이 없으므로 현재 해당 없음 | Bearer 헤더 방식 유지. 쿠키 세션(D안)을 쓰면 SameSite + CSRF 토큰 |
| session fixation | 자체 세션이 없습니다. Firebase가 로그인 때 새 토큰을 발급합니다. | 서버 세션 교환 시 로그인마다 새 세션 ID |
| client 제공 userId | LIVON 계약이 거부합니다 [확인·테스트]. OX 클라이언트도 금지합니다 [확인]. | 서버는 토큰의 `sub`만 사용 |
| IDOR / broken access control | LIVON에 사용자 데이터 API가 없습니다. HQ는 Rules로 강제합니다 [확인]. | 모든 쿼리에 `owner_id = accountId`. record id만으로 조회하는 API 금지 |
| refresh token 처리 | 서버가 refresh token을 받지 않는 설계 | SDK가 갱신. 서버는 ID 토큰만 |
| 로그아웃 무효화 | `signOut`은 기기 로컬만 무효화합니다(HQ·OX) | 전체 로그아웃이 필요하면 서버에서 revoke + `checkRevoked` |
| 앱 간 토큰 오용 | 프로젝트가 분리되어 있어 `aud`가 다릅니다 | LIVON 계약의 `allowedIssuers`로 다른 프로젝트 토큰을 거부합니다(이번 수정, 테스트 포함). 서버는 `aud`도 검증 |
| mass assignment | LIVON 계약이 허용 필드 외를 거부합니다 [확인·테스트] | 유지 |
| 계정 연결 충돌 | 같은 이메일, 다른 프로젝트 uid 문제 | 자동 병합 금지, `(issuer, subject)` 단위, 명시적 연결 |
| 참고: HQ 관리자 UID 하드코딩 | Rules와 설정 파일에 식별자가 있습니다(비밀 아님) | 관리자 교체 시 두 곳을 함께 수정 (운영 문서에 기록됨) |
| 참고: OX `?mock=1` | production에서 데모 화면을 열 수 있습니다. 실제 API는 호출하지 않습니다. | 필요하면 비공개 빌드로 제한 (LIVON 범위 밖) |

## 14. 이번 단계의 코드 변경

- `server/livon/userdata/contract.mjs`
  - 세션을 `{verified, issuer, subject, accountId}`로 바꿨습니다.
  - `allowedIssuers` 검사(다른 앱 프로젝트 토큰 거부)와 `resolveOwner`/`accountRefKey`를 추가했습니다.
  - 여전히 `ENDPOINT_ENABLED=false`이고 라우팅되지 않습니다.
- `docs/livon/account-data-foundation.md`: `account_refs`를 `(issuer, subject)`로 고치고, 서버 흐름을 보강했습니다.
- `tests/livon/account-data.test.mjs`: 새 세션 계약(발급자 불일치 403, 계정 미연결, userId만 있는 세션 401)을 테스트합니다.
- 로그인 UI, 가짜 계정, DB, 인증 제공자 가입, production API는 **만들지 않았습니다**.

## 15. 후속 — Newon+ Auth Foundation V1 (2026-09-29)

§11 권장 구조의 A·B 단계를 **코드 기반까지만** 진행했습니다. 외부 설정이 없어서 실제 인증은 연결되지 않았습니다.

| §12 단계 | 상태 |
|---|---|
| A. Auth 확인 | 서버 검증 계층 `server/newon/auth/verify.mjs`를 만들었습니다. 기본값은 비활성이고, 서명 검증은 공식 SDK/JWKS에 위임합니다. 의존성은 설치하지 않았습니다. **Newon+ 프로젝트는 아직 없습니다 [TODO].** |
| B. 계정 매핑 | `server/newon/auth/accounts.mjs`: `(issuer, subject) → account_refs → accountId` 매핑과 연결 계약(재인증, 확인, 충돌 거부, 이메일 병합 금지). DB는 없습니다. |
| C. DB | 진행하지 않았습니다. |
| D. Sync API | 진행하지 않았습니다(`ENDPOINT_ENABLED=false`). |
| E. 로그인·가져오기 동의 | 클라이언트 `NewonAuth`와 LIVON 브리지의 동의 계약(`offerImport`/`approveImport`)을 만들었습니다. 로그인 UI는 붙이지 않았고, 업로드는 `SYNC_NOT_AVAILABLE`을 반환합니다. |
| F. 동기화 | 진행하지 않았습니다. |

§13 위협 표 갱신:

- XSS: `vercel.json`에 기본 보안 헤더와 CSP **report-only**를 추가했습니다(Vercel에만 적용, GitHub Pages는 적용 불가).
- 토큰 탈취: Newon 코드는 토큰을 저장하지 않습니다. SDK persistence 기본값은 `session`입니다.
- 앱 간 토큰 오용: `newon-hq`와 `newon-oxmonth`는 클라이언트, 빌드, 서버 세 곳에서 거부합니다.

HQ(`admin/`), OX(`apps/ox-month/`) 코드는 변경하지 않았습니다.

## 16. 후속 — LIVON Account Backend & Sync V1 (2026-09-30)

- §11 권장 구조(Firebase ID 토큰 검증 + Postgres 저장)를 코드로 구현했습니다: `/api/livon/userdata`, `server/livon/userdata/{http,store}.mjs`, `migrations/001_account_backend.sql`, `livon/data/livon-sync.js`.
- 경계는 그대로입니다: HQ(`newon-hq`)·OX(`newon-oxmonth`) 토큰은 소비자 계정이 될 수 없고, email로 계정을 합치지 않으며, OX uid는 Newon 계정 id가 아닙니다(`acct_` + 32 hex, `account_refs(issuer, subject)`로만 연결).
- 실제 Newon+ 프로젝트·DB가 없으므로 상태는 CODE READY / LIVE CONFIG REQUIRED입니다. 상세: `docs/newon/newon-plus-account-backend.md`.
