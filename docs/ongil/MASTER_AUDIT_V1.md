# ONGIL MASTER AUDIT V1

- 작성일: 2026-10-02 (KST)
- 성격: Phase 0 — AUDIT ONLY. 소스 수정 0. 이 문서가 유일한 생성 파일.
- 방법: 정적 코드 분석 (STATIC ONLY). production 요청·DB 접근·침투 테스트 없음.
- 판정 어휘: DONE / PARTIAL / MOCK / PLACEHOLDER / BROKEN / MISSING / NOT VERIFIED
- 원칙: 이 문서에 적힌 모든 판정은 아래 근거 파일을 직접 읽은 결과다. 읽지 않은 것은 NOT VERIFIED로 적었다.

---

## 0. 한 줄 결론

**ONGIL은 현재 "앱"이 아니라 "소개 페이지 + 7개 화면의 빈 껍데기"다.**
`ongil-start/index.html` 한 파일이 제품 진입점이며, 7개 메뉴 각각은 영상 배경 + 슬로건만 있다.
데이터·상태·계정·API·DB를 쓰는 ONGIL 코드는 0줄이다. 따라서 Feature Matrix의 거의 전부가 MISSING 또는 PLACEHOLDER다.
반면 같은 repository의 LIVON은 local-first 데이터 계층, Newon+ 인증 계약, 계정 동기화 backend, 공공데이터 provider, AI, 422개 테스트를 갖추고 있어 재사용 기반이 충분하다.

---

## 1. Repository Map

| 항목 | 값 |
|---|---|
| REPOSITORY ROOT | `~/Newon` (package name `newon-site`) |
| BRANCH | `livon-v1-release` (origin 대비 11 commit ahead, 미push) |
| HEAD | `7fd6e02bf149656f198277addb3728ea66c7e548` — "Prepare LIVON API for a separate Vercel backend" |
| WORKTREE (감사 전) | DIRTY — 수정 41개(M), 미추적 14개(??) |
| REMOTE | `origin` |
| FRAMEWORK | 없음. Vanilla HTML/CSS/JS 정적 사이트 + Node 빌드 스크립트(`scripts/*.mjs`) + Vercel serverless functions(`api/*.mjs`) |
| PACKAGE MANAGER | npm (`package-lock.json`), Node >= 22 |
| TYPESCRIPT / LINT / FORMATTER | 없음 (tsconfig, eslint, prettier 설정 파일 없음) |
| DATABASE | PostgreSQL (`pg`), 테스트는 `@electric-sql/pglite`. HQ admin만 Firestore |
| AUTH | Firebase Auth ID token (Newon+ 전용 project) → 서버 검증(`firebase-admin`) |
| DEPLOYMENT | 정적 사이트 = GitHub Pages(`gh-pages`, `.github/workflows`, `main` push 시) / API = Vercel functions(별도 origin, `LIVON_API_ONLY`) |

### 주요 경로

| 역할 | 경로 | 확인 근거 |
|---|---|---|
| NEWON ROOT | `/` | `package.json`, `scripts/publish-site.mjs` |
| **ONGIL 제품 진입점** | `ongil-start/index.html` (725줄, 손으로 작성, `noindex`) | `scripts/publish-site.mjs:192` (`required: true`), `lang-nav.js:85` |
| ONGIL 소개 페이지 | `/{lang}/ongil/index.html` (생성물, 9개 언어) | `scripts/render-ongil.mjs` |
| ONGIL 소개 생성기 | `scripts/render-ongil.mjs`, `scripts/home-ongil-body.mjs`, `scripts/home-ongil-copy.mjs`, `scripts/home-ongil-i18n*.mjs` | import 체인 확인 |
| ONGIL 소개 스타일/스크립트 | `home-ongil.css`, `home-ongil-layout.css`, `home-ongil.js` | `render-ongil.mjs` EXTRA_CSS/EXTRA_SCRIPTS |
| ONGIL root redirect | `ongil/index.html` → `/{lang}/ongil/` | 파일 내용 |
| ONGIL asset | `assets/ongil-mark.svg`, `assets/hero-film/ongil-poster.jpg`, `assets/ongil-learn-zenith.mp4` | git ls-tree |
| LIVON frontend | `livon/` (index.html 3,330줄 + JS/CSS 약 38,000줄) | hash route `data-lv-screen` |
| LIVON data layer | `livon/data/*.js` | |
| SHARED/COMMON (사이트 chrome) | `styles.css`, `gnav-mega.css`, `site-dark.css`, `site-mobile.css`, `hover-contrast.css`, `site-chrome.js`, `lang-nav.js`, `lang-dropdown.js`, `theme-shell.js`, `film-keep.js`, `analytics.js` | `ongil-start/index.html` head/footer에서 직접 load |
| SHARED AUTH (client) | `newon-auth/` | |
| BACKEND/API entry | `api/health.mjs`, `api/livon/{chat,data,userdata}.mjs` | `vercel.json` functions |
| BACKEND 구현 | `server/livon/**`, `server/newon/auth/**` | |
| DATABASE/MIGRATION | `server/livon/userdata/migrations/001_account_sync.sql` (1개) | |
| TEST | `tests/livon/*.test.mjs` (28개 파일, 422 test). **ONGIL 테스트 0개** | |
| ADMIN (HQ, 사내용) | `admin/` + `firestore.rules` | 별도 보안 도메인 |
| 빌드 산출물 | `_publish/` (gitignore) | |

### ONGIL 후보가 2개인 문제 — 확정 내용

- `/{lang}/ongil/` = 사업 소개(마케팅). SEO 설명문에 "예약·결제·가입은 아직 연결되지 않았습니다"라고 명시 (`scripts/render-ongil.mjs` SEO.ko).
- `/ongil-start/` = 제품 shell. 목표 IA와 같은 메뉴(홈/내 생활/건강 관리/가족 연결/돌봄·생활 서비스/배움·여가/커뮤니티)와 검색·알림·마이 도구를 가진 유일한 파일.
- 결론: **ONGIL 개발 대상 = `ongil-start/`**. 소개 페이지는 유지 대상.

### 다른 branch 상태 (재사용 판단에 중요)

LIVON의 후속 작업은 현재 branch에 합쳐져 있지 않다. 각각 `livon-v1-release`에서 갈라진 형제 branch다(각 8~13 ahead / 15 behind).

`livon-accessibility-v1`, `livon-onboarding-v1`, `livon-community-onboarding-v1`, `livon-help-faq-v1`, `livon-seo-expansion-v1`, `livon-admin-local-v1`, `livon-content-quality-v1`, `livon-data-manager-v1`, `livon-account-backend-v1`(4 ahead / 0 behind)

이 branch들의 코드는 이번 감사에서 **읽지 않았다 (NOT VERIFIED)**. ONGIL 파일 목록은 4개 branch(main, accessibility, admin-local, onboarding)에서 현재 branch와 동일함을 확인했다. 즉 어느 branch에도 추가 ONGIL 코드는 없다.

---

## 2. ONGIL Architecture (현재)

### 2.1 `ongil-start/index.html`

- 단일 HTML. CSS(`<style>` 약 290줄)와 JS(`<script>` 2개, 약 190줄)가 모두 inline.
- Routing: hash 기반. `location.hash` → `ogView()` → `html[data-og-view]` 값으로 `main > [data-og-screen]` 중 하나만 표시.
  - 실제 화면: `home`, `life`, `health`, `family`, `care`, `learn`, `community` (7개)
  - `#profile`, `#saved`, `#settings`, `#support` → 전부 `home`으로 매핑 (화면 없음)
  - `#share` → `family`
- 각 화면 내용: `<video autoplay muted loop>` + wordmark + h1 슬로건 + 설명 1~2줄. 그 외 UI 없음.
- 헤더 도구 3개:
  - 검색: form submit 시 항상 "‘{q}’에 대한 … 결과가 없습니다" 문구만 출력. 검색 대상 데이터 없음.
  - 알림: 고정 목록(일정/복약/가족 공유/서비스 이용) + "등록된 알림이 없습니다".
  - 마이: 4개 hash 링크 메뉴.
- State management: 없음. localStorage/sessionStorage/fetch 사용 0건.
- 외부 의존: 영상 7개를 외부 CDN(CloudFront)에서 `preload="auto"`로 load. Google Fonts.
- 클래스 이름이 `livon-tool`, `livon-panel`, `livon-search`로 LIVON과 겹친다(같은 이름을 이 파일 안에서 다시 정의).
- CSS에는 `og-about`, `og-chips`, `og-chip`, `og-grid`, `og-card`, `og-band`, `og-wrap`, `og-h`, `og-lead`가 정의되어 있으나 **HTML에서 사용되지 않는다**. 이전 버전의 잔재이거나 준비된 디자인 재료다.
- 언어 선택기는 있으나 본문은 한국어만 존재(`lang="ko"` 고정).

### 2.2 `/{lang}/ongil/` (소개)

- `templates/hub-shell.html` + `renderOngilSection()` 으로 9개 언어 생성. 사이트 공통 header/footer 사용.
- `home-ongil.js`: decade 탭 전환, hero node 선택, smooth scroll. 데이터 저장 없음.
- canonical, hreflang, OG locale, sitemap 반영 있음.

### 2.3 없는 것 (ONGIL 기준)

components 구조, hooks, services, API client, 인증 연결, 계정 UI, DB 사용, model, analytics 이벤트, 테스트, ONGIL 전용 build 단계 — 전부 없음.
`newon-auth/newon-auth.js`에 "ongil" 문자열이 있으나 ONGIL 화면이 NewonAuth를 load하지 않는다(`ongil-start/index.html`에 `newon-auth` script 없음).

---

## 3. Feature Matrix (ONGIL)

공통 근거: `ongil-start/index.html`. 별도 표기가 없으면 이 파일 하나가 근거의 전부다.

### 영역 요약

| 영역 | 판정 | 이유 |
|---|---|---|
| HOME | PLACEHOLDER | hero 영상 + 제목 + CTA 2개. 인사·안부·일정·복약 등 기능 요소 없음 |
| MY LIFE | PLACEHOLDER | `#life` 슬로건 화면만 |
| HEALTH / CHECK-IN | PLACEHOLDER | `#health` 슬로건 화면만. 안부 체크 개념 자체가 코드에 없음 |
| FAMILY | PLACEHOLDER | `#family` 슬로건만. "항목별 공유 범위를 직접 선택" 문구는 있으나 구현 없음 |
| CARE / SERVICES | PLACEHOLDER | `#care` 슬로건만 |
| ENJOY | PLACEHOLDER | `#learn`("배움·여가")가 대응. 목표 IA 이름(즐길거리)과 다름 |
| COMMUNITY | PLACEHOLDER | `#community` 슬로건만 |
| STORE | MISSING | 메뉴·화면·hash 모두 없음 |
| SEARCH | MOCK | 입력 UI 있음, 결과는 항상 "없습니다" 고정 문구 |
| SAVED | MISSING | `#saved` → home으로 매핑, 화면 없음 |
| NOTIFICATIONS | PLACEHOLDER | 고정 목록 + 빈 상태 문구 |
| ACCOUNT | MISSING | 마이 패널은 링크 4개. 로그인/프로필 없음 |
| ONBOARDING | MISSING | |
| ADMIN | MISSING | `admin/`은 Newon HQ 사내 도구이며 ONGIL과 무관 |
| PARTNER | MISSING | |
| ANALYTICS | MISSING | `ongil-start`는 `analytics.js`를 load하지 않음 |
| ONGIL AI | MISSING | |
| SEO (소개 페이지) | DONE | `scripts/render-ongil.mjs`: title/description/canonical/hreflang/sitemap |
| SEO (제품 shell) | 의도적 noindex | `<meta name="robots" content="noindex, nofollow">` |

### 세부 항목

아래 항목은 모두 코드가 존재하지 않아 **MISSING**이다. 슬로건 문구에 단어만 등장하는 것은 구현으로 치지 않았다.

- HOME: 오늘의 인사, 안부, 일정, 복약, 생활 체크, 가족 소식, 오늘 뭐 하지?, 주변 추천, 빠른 실행 — MISSING (빠른 실행만 CTA 2개 수준의 PLACEHOLDER)
- MY LIFE: 캘린더, 할 일, 루틴, 식사, 운동, 수면, 생활비, 기록, 저장 — MISSING
- HEALTH/CHECK-IN: 안부 체크, 생활 체크, 도움 요청, 긴급 연락망, 복약, 병원, 검진, 건강기록 — MISSING
- FAMILY: 가족 초대, 연결, 관계, Permission, Consent, 안부/일정/복약/병원 일정 공유, 사진, 메시지, 가족 캘린더, 도움 요청, 가족이 보내준 것 — MISSING
- CARE/SERVICES: 돌봄, 방문요양, 병원동행, 이동, 식사, 청소, 세탁, 장보기, 주거, 디지털 도움, 복지, 주변기관 — MISSING
- ENJOY: 취미, 배움, 운동, 문화, 나들이, 여행, 프로그램, 모임 — MISSING
- COMMUNITY: 추천, 최신, 내 동네, 팔로잉, 게시글, 이미지, 댓글, 답글, 공감, 저장, 팔로우, 프로필, 검색, 신고, 차단, 모임 — MISSING
- STORE: 카테고리, 상품목록, 검색, 필터, 정렬, 상품상세, 저장, 가족에게 보내기/부탁하기, 외부 구매처 — MISSING

---

## 4. Design System (현재 ONGIL)

ONGIL에는 시각 언어가 **두 개** 있다. Phase 1 전에 어느 쪽이 "현재 ONGIL 디자인"인지 확정이 필요하다(§12 Open Question 1).

### 4.1 제품 shell — `ongil-start/index.html` inline CSS (권장 기준)

| 항목 | 값 |
|---|---|
| COLORS | 배경 `#000` / 본문 ink `#E1E0CC` / 보조 `#DEDBC8` / muted `#9ca3af` / card `#212121` / 강조 card `#101010` / film 배경 `#0a0a0a` / panel은 흰 배경 `#fff` + `#111` |
| TYPOGRAPHY | 본문 `Almarai`, `Noto Sans KR` / display `Instrument Serif` italic, `Noto Serif KR` / wordmark `Noto Sans` 700 |
| TYPE SCALE | wordmark `clamp(4.8rem,16vw,11rem)` / slogan `clamp(1.45rem,3.2vw,2.35rem)` / lead `clamp(0.9rem,1.5vw,1.05rem)` / hero 보조문 `0.875rem` weight 300 / card 제목 1.05~1.55rem / card 본문 0.86rem |
| SPACING | section `4.5rem` 세로, wrap `min(1180px, 100% - 2rem)`, card padding `1rem`, grid gap `0.45~0.7rem` |
| RADIUS | card `1.1rem`, about card `1.5rem`, button pill `9999px`, panel input `10px` |
| CARDS | `og-card`(min-height 28rem, video 변형 있음), `og-chip`(min-height 7.5rem) — 정의만 있고 미사용 |
| BUTTONS | primary: 흰 배경 pill + hover scale 1.03 + glow / secondary: `og-liquid-glass`(blur + gradient border) |
| INPUTS | search input 높이 2.6rem, border 1px, radius 10px |
| ICONS | inline SVG, 24 viewBox, stroke 1.75, round cap, `currentColor` |
| LAYOUT | 화면당 100svh full-bleed film + 중앙 lockup. 상단 고정 gnav(`--gnav-h` 74px) |
| BREAKPOINTS | 1100px(4→2열), 860px(hero foot 세로), 700px(1열, 상단 nav 숨김 → 모바일 메뉴) |
| ANIMATION | fade-up 0.9~1s, stagger 0.12/0.3/0.48/0.64s, hover scale. `prefers-reduced-motion`에서 텍스트 transition 제거 |
| MOBILE PATTERNS | 햄버거 → `gnav-mobile` sheet(sublink 7개). 하단 tab bar 없음 |

### 4.2 소개 페이지 — `home-ongil.css` (`--nls-*` token)

monochrome. ink `#171717`, muted `#525252`, line `#ebebeb`, paper `#fff`, accent `#0a0a0a`, radius `2px`. dark 변형 있음(`--nls-ink: #f5f5f5` 등). breakpoint 640/720/760/800/860/900/960/1080/1100.

### 4.3 사이트 공통 — `styles.css`

`--bg`, `--bg-elevated`, `--font`(Noto Sans 계열), `--radius` 12px / `-sm` 10px / `-lg` 16px, `--gnav-h` 74px. light/dark theme(`theme-shell.js`).

### 4.4 설계상 주의점

- ONGIL 전용 token 파일이 없다. 값이 inline으로 흩어져 있어, 기능 화면을 늘리기 전에 **값은 그대로 두고 token으로 추출**하는 작업이 Phase 1에 필요하다(디자인 변경이 아니라 정리).
- 현재 디자인은 "영상 위 큰 글자" 중심이라, 목록·폼·상세 같은 정보 화면용 pattern(목록 행, 폼 필드, 빈 상태, 오류, 로딩)이 정의되어 있지 않다. 미사용 `og-card`/`og-chip`이 출발점이다.

### 4.5 LIVON에서 가져올 UX pattern (시각 디자인 제외)

- hash route + screen 격리 + 화면별 lazy mount (`livon/index.html` `data-lv-screen`)
- 정직한 빈 상태: 데이터가 없으면 지어내지 않고 빈 상태를 보여줌 (`livon/data/livon-data-core.js` 주석 및 구현)
- 저장 → 폴더, 알림 유형별 설정 (`livon/livon-platform.js`)
- 통합 검색: 유형 탭 + 카테고리 + 인기 검색어 (`livon/explore-search.js`)
- 계정 연결 시 "이 기기 데이터를 올릴까요?" 선택형 import (`livon/data/livon-sync-ui.js`)
- `role="status"`/`aria-live`로 상태 알림, dialog에 `aria-modal`

---

## 5. Backend / Data (repository 전체, 현재는 LIVON 전용)

| 항목 | 상태 | 근거 |
|---|---|---|
| AUTH | 코드 DONE, 운영 활성 여부 NOT VERIFIED | `server/newon/auth/verify.mjs`: Bearer만 허용, URL token 거부, issuer allowlist, aud/iss/exp/iat/auth_time/sub 검사, 서명은 `firebase-admin` `verifyIdToken(checkRevoked)`에 위임, 미설정 시 503 fail-closed. `newon-hq`/`newon-oxmonth` project 차단 |
| AUTH (client) | 코드 있음, 기본 비활성 | `newon-auth/newon-auth-config.js`: `NEWON_PLUS_AUTH_CONFIG = null`. 빌드 시 env 4개가 모두 있을 때만 주입 |
| ACCOUNT | PARTIAL | `server/newon/auth/accounts.mjs`: (issuer, subject) → 불투명 `acct_…`. email로 병합 안 함. account link 계약은 있으나 endpoint 없음. 프로필(이름, 생년, 연락처) 모델 없음 |
| DATABASE | PostgreSQL | `server/livon/userdata/postgres.mjs`, `runtime.mjs` (production에서 `sslmode=verify-full`, pool max 3) |
| SCHEMA | 4 table + 3 view | `user_accounts`, `account_refs`, `sync_metadata`, `user_records`(account_id, collection, record_id, server_rev, record jsonb ≤ 64KB) |
| MIGRATIONS | 1개, runner 없음 | `001_account_sync.sql`. 실행 스크립트·버전 관리 테이블 없음. 적용 여부 NOT VERIFIED |
| API | 4 route | `/api/health`, `/api/livon/chat`(POST), `/api/livon/data`, `/api/livon/userdata`(GET/POST) |
| STORAGE (파일/이미지) | MISSING | 업로드 경로 없음 |
| PUBLIC DATA | 코드 DONE, live 검증 없음 | `server/livon/data/manifest.mjs`: 8개 provider 전부 `liveVerified: false` |
| SEARCH | client index만 | `livon/explore-search.js`. 서버 검색 없음 |
| CACHE | 있음 | `server/livon/data/cache.mjs` (memory + Upstash) |
| RATE LIMIT | 있음 | AI: Upstash 기반 burst/minute/day (`server/livon/chat.mjs`). userdata: instance IP 180/분 + account 120/분(DB) |
| ANALYTICS | dataLayer helper | `analytics.js` (PII 없음 명시). ONGIL 미연결 |
| AI | DONE(LIVON) | `server/livon/chat.mjs`: OpenAI Responses API, key는 서버만, timeout 25s |
| CORS | 정확한 origin allowlist, `*` 없음 | `server/livon/cors.mjs`, `userdata/http.mjs` |
| SECURITY HEADERS | PARTIAL | `vercel.json`: nosniff, Referrer-Policy, Permissions-Policy. CSP는 **Report-Only**. GitHub Pages 쪽은 header 적용 불가(정적 호스팅) |
| DEPLOYMENT | Pages + Vercel 분리 | `.github/workflows`, `scripts/vercel-build.mjs` |

### ENVIRONMENT — KEY NAME만 (`.env.example`에서 확인, 값은 읽거나 기록하지 않음)

`OPENAI_API_KEY`, `OPENAI_MODEL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `LIVON_RATE_LIMIT_SECRET`, `LIVON_DAILY_REQUEST_LIMIT`, `LIVON_AI_MINUTE_LIMIT`, `LIVON_AI_CLIENT_DAILY_LIMIT`, `YOUTHCENTER_API_KEY`, `BIZINFO_API_KEY`, `KAKAO_REST_API_KEY`, `TOURAPI_SERVICE_KEY`, `PUBLIC_DATA_SERVICE_KEY`, `WORK24_TRAINING_API_KEY`, `LIVON_DATA_DIAGNOSTICS`, `NEWON_PLUS_FIREBASE_API_KEY`, `NEWON_PLUS_FIREBASE_AUTH_DOMAIN`, `NEWON_PLUS_FIREBASE_PROJECT_ID`, `NEWON_PLUS_FIREBASE_APP_ID`, `NEWON_PLUS_AUTH_PERSISTENCE`, `NEWON_AUTH_VERIFY_ENABLED`, `NEWON_AUTH_ALLOWED_ISSUERS`, `LIVON_ALLOWED_ORIGINS`, `LIVON_API_ONLY`, `LIVON_API_ORIGIN`, `NEWON_DATABASE_URL`, `GOOGLE_APPLICATION_CREDENTIALS`

repository에 `.env` 파일은 없다(`.env.example`만 존재). `.gitignore`가 `.env`, key, credential 파일을 제외한다.

### ONGIL 관점의 backend 한계

1. `user_records.collection` CHECK 제약이 LIVON 11개 collection으로 고정 → ONGIL collection 추가는 migration 필요.
2. 민감 collection(`health_records`, `journal`, `transactions`)은 서버 sync에서 **의도적으로 제외**되어 있다(`service.mjs` `SYNC_COLLECTIONS`). ONGIL의 건강·복약·안부는 바로 이 민감 범주라, 별도 동의·저장 설계 없이 기존 경로에 얹으면 안 된다.
3. 데이터 모델이 "한 account = 한 owner"다. 다른 account에게 읽기 권한을 주는 개념이 전혀 없다(가족 공유 불가).
4. serverless 함수(최대 30~40초)만 있고 push 알림, 예약 실행(cron), 실시간 채널이 없다 → 안부 미응답 알림, 복약 알림은 새 인프라가 필요하다.

---

## 6. Family Privacy / Security

### 6.1 ONGIL

- ONGIL에는 사용자 데이터를 읽거나 쓰는 코드가 없다. 따라서 "A가 B의 데이터를 읽는 경로"는 현재 **존재하지 않음**(취약점이 없다는 뜻이 아니라, 기능 자체가 없다는 뜻).
- 가족 기능 전체 = MISSING.

### 6.2 기존 backend의 사용자 간 격리 (정적 분석)

| 질문 | 판정 | 근거 |
|---|---|---|
| client가 owner/userId를 지정할 수 있는가 | 불가 | `userdata/http.mjs`: query는 `collection`만 허용. `service.mjs`: op별 허용 필드 외 `UNKNOWN_FIELD`. `accounts.mjs` `assertIdentity`: `userId`/`accountId`/`email` 필드가 있으면 거부 |
| owner는 어디서 오는가 | 검증된 token → DB | `postgres.mjs`: transaction 안에서 `account_refs`를 조회해 `owner` 결정 |
| 모든 query에 owner 조건이 있는가 | 있음 | `postgres.mjs` `list`/`put` 모두 `account_id=$1` (owner) |
| resource ID를 알면 남의 record를 읽는가 | 불가 | primary key가 `(account_id, collection, record_id)`이고 조회가 owner로 한정 |
| 다른 Firebase project의 token | 거부 | issuer allowlist + `FORBIDDEN_PROJECTS` |
| DB 권한/RLS, 실제 배포 env, Firebase 콘솔 설정 | NOT VERIFIED | 코드로 확인 불가. 확인하려면 운영 DB role 설정과 Vercel env(값 제외, 설정 여부만) 점검 필요 |

결론: **현재 backend 코드는 사용자 간 접근을 막는 구조다.** 단, 이것은 "공유가 전혀 없는" 모델이기 때문이며, 가족 공유를 넣는 순간 가장 위험한 지점이 된다.

### 6.3 가족 기능에 필요한 신규 구조 (전부 MISSING)

`FamilyConnection`(초대·수락·해제, 양방향 확인), `FamilyPermission`(항목별: 안부/일정/복약/병원/사진), `Consent`(시니어 본인의 명시 동의, 시점·범위 기록), `ShareGrant`, `ShareRevocation`(즉시 효력), `AuditLog`(누가 언제 무엇을 봤는지 — 시니어가 볼 수 있어야 함).

설계 규칙(권고):
- 기본값은 **공유 안 함**. 가족 연결만으로는 어떤 데이터도 열리지 않는다.
- 권한 검사는 서버에서, 모든 읽기 query에 `owner = me OR 유효한 grant 존재` 조건으로. client 판단에 의존하지 않는다.
- 가족용 읽기는 owner 경로와 **별도 endpoint**로 분리해 기존 owner-only 경로의 단순함을 유지한다.
- 철회 후에는 cache·알림에도 남지 않게 한다.
- 건강 정보는 개인정보보호법상 민감정보에 해당할 수 있으므로 별도 동의 문구와 법률 검토가 필요하다(이 문서는 법률 판단을 하지 않는다).

### 6.4 기타 보안 관찰

- `firestore.rules`: HQ admin 단일 UID만 허용하는 catch-all. ONGIL과 무관하나, consumer 데이터에 Firestore를 쓰지 않는다는 점은 유지해야 한다.
- CSP가 Report-Only라 XSS 완화 효과가 없다. LIVON/ONGIL 모두 `innerHTML` 기반 렌더링이므로 escape 누락이 곧 XSS다(LIVON은 `esc()` 사용 확인. 전체 호출 지점 전수 검사는 NOT VERIFIED).
- GitHub Actions의 Node 버전은 20, `package.json` engines는 `>=22` — 불일치.

---

## 7. Accessibility (WCAG 2.2 AA 목표 대비, 정적 확인)

인증·적합성 여부는 판정하지 않는다. 실제 기기·보조기술 테스트는 수행하지 않았다.

| 항목 | `ongil-start` 상태 | 근거 / 메모 |
|---|---|---|
| lang | 있음 (`ko` 고정) | 언어 전환 UI는 있으나 번역본 없음 |
| skip link | 있음 | `.skip-link` → `#ongil-home`. 다른 화면에서는 대상이 숨겨져 동작 안 할 수 있음 |
| semantic HTML | PARTIAL | `header/nav/main/section` 사용. 화면마다 `h1` 1개(동시에 1개만 표시) |
| heading hierarchy | PARTIAL | h1만 있고 h2 이하 내용 없음 |
| labels | 있음 | 검색 input에 visually-hidden label |
| button names | 있음 | 도구 버튼 `aria-label`, `aria-expanded`, `aria-controls` |
| keyboard | PARTIAL | Escape로 panel 닫힘. panel 열릴 때 focus 이동은 input만. focus trap/복귀 없음 |
| focus 표시 | NOT VERIFIED | inline CSS에 `:focus-visible` 0건. 공통 `styles.css`(33건)에 의존 — 어두운 영상 위 대비는 실측 필요 |
| contrast | NOT VERIFIED (위험) | 영상 위 흰 글자 + text-shadow, home 제목은 영상 위 `#000`. 영상 프레임에 따라 달라져 정적 판정 불가 |
| 본문 크기 | 미달 우려 | hero 보조문 0.875rem·weight 300, card 본문 0.86rem — 시니어 대상으로 작고 가늘다 |
| touch target | 미달 | 도구 버튼 2.4rem(약 38px) < 44px 권장 (2.5.8 최소 24px은 충족) |
| 200% zoom / reflow | NOT VERIFIED | `100svh` 고정 + `overflow: hidden` + `white-space: nowrap` wordmark → 확대 시 잘릴 가능성 |
| reduced motion | PARTIAL | 텍스트 transition만 제거. **배경 영상은 계속 재생** |
| 움직이는 콘텐츠 정지 (2.2.2) | 미충족 | 자동 재생·반복 영상에 정지 버튼 없음. `film-keep.js`는 오히려 멈춘 영상을 다시 재생시킴 |
| form errors / live region | 없음 | `aria-live`, `role="status"`, `role="alert"` 0건. 검색 결과 문구가 보조기술에 전달되지 않음 |
| mobile usability | PARTIAL | 700px 이하에서 상단 nav 숨김 → 햄버거 의존 |

LIVON(현재 branch) 참고치: `aria-live` 18, `role="status"` 15, `role="alert"` 9, `aria-modal` 13, `:focus-visible` 53, reduced-motion 36건. 접근성 강화본은 `livon-accessibility-v1` branch에 있으며 이번에 읽지 않았다.

---

## 8. LIVON Reuse Map

LIVON은 vanilla JS IIFE 모듈이고 `livon.*` storage key와 `lv-` DOM에 묶여 있다. 그래서 frontend는 "그대로 복사"가 거의 불가능하고, 서버 쪽이 직접 재사용 대상이다. **아무것도 복사하지 않았다.**

| 기능 | LIVON source | 분류 | 예상 ONGIL target | 메모 |
|---|---|---|---|---|
| Token 검증 | `server/newon/auth/verify.mjs` | DIRECT REUSE | 동일 모듈 import | 이미 Newon 공용 설계 |
| Account 매핑 | `server/newon/auth/accounts.mjs` | DIRECT REUSE | 동일 | SHARED MODULE CANDIDATE |
| Client auth | `newon-auth/newon-auth*.js` | DIRECT REUSE | `ongil-start`에서 load | Newon+ project 설정 필요 |
| CORS / JSON helper | `server/livon/cors.mjs`, `server/livon/http.mjs` `json` | DIRECT REUSE | `server/shared/` 로 승격 후 사용 | SHARED MODULE CANDIDATE |
| API base 설정 | `livon/livon-api-config.js`, `scripts/livon-api-config.mjs` | ADAPT | `ongil/ongil-api-config.js` | 이름만 LIVON |
| 공공데이터 (장소·관광·평생교육) | `server/livon/data/providers/{kakao-local,tourapi,lifelong-class}.mjs`, `data/http.mjs`, `cache.mjs` | DIRECT REUSE (endpoint) | ONGIL에서 `/api/livon/data` 호출 또는 `/api/newon/data`로 일반화 | 주변기관·나들이·배움에 해당. live key 검증 전 |
| 공공데이터 (청년·기업·세무·직업훈련) | 같은 폴더 나머지 provider | NOT SUITABLE | — | 시니어 대상 아님. 노인복지·장기요양·보건소 provider는 신규 필요 |
| Local-first 저장소 | `livon/data/livon-user-data.js` | ADAPT | `ongil/data/ongil-user-data.js` | inventory·분류·tombstone·merge 구조 재사용, key/collection은 ONGIL용. SHARED MODULE CANDIDATE |
| 계정 sync 서버 | `server/livon/userdata/{contract,service,postgres,http,runtime}.mjs` | ADAPT | `server/ongil/userdata/` 또는 공용화 | collection allowlist·민감정보 정책이 LIVON 전용 |
| Sync UI / auth bridge | `livon/data/livon-sync*.js`, `livon-auth-bridge.js` | ADAPT | `ongil/data/` | 선택형 import 흐름 그대로 유용 |
| Search | `livon/explore-search.js` | ADAPT | `ongil/search.js` | 유형·카테고리를 시니어용으로 |
| Saved / 알림 설정 / 프로필 | `livon/livon-platform.js` | ADAPT | `ongil/ongil-platform.js` | 알림은 설정 UI뿐, 발송 없음 |
| Onboarding | `livon/livon-platform.js`(현재 branch), `livon-onboarding-v1` branch | REFERENCE ONLY | — | branch 미확인 |
| My Life (일정·할 일·습관) | `livon/life-now-page.js`, `life-now-data.js` | ADAPT | `ongil/life.js` | 가장 큰 재사용 덩어리(2,287줄). 시니어용 단순화 필요 |
| Community | `livon/community-page.js`, `community-data.js` | REFERENCE ONLY | — | **이 기기 안에서만** 동작하는 local 커뮤니티. 다중 사용자 서버 없음. ONGIL 커뮤니티는 서버·신고·차단·운영이 새로 필요 |
| Family | `livon/service-family.js` | REFERENCE ONLY | — | 1인용 체크리스트·가계 도구. 가족 연결 아님(파일 내 문구로 "가족 초대·계정 동기화 미연결" 명시) |
| AI server | `server/livon/chat.mjs`, `http.mjs` | ADAPT | `server/ongil/chat.mjs` | rate limit·timeout·오류 코드 구조 재사용, system prompt·안전 규칙은 시니어용 |
| AI UI | `livon/ai-page.js` | ADAPT | `ongil/ai.js` | "미리보기 → 선택 → 승인" 패턴 유용 |
| Admin | `admin/*` | NOT SUITABLE | — | HQ 사내 CRM, 별도 보안 도메인. `livon-admin-local-v1` branch는 미확인 |
| Analytics | `analytics.js` | DIRECT REUSE | script load + 이벤트 정의 | 건강·가족 데이터는 이벤트에 넣지 않는다 |
| Accessibility | `livon-accessibility-v1` branch | REFERENCE ONLY | — | 미확인 |
| SEO | `scripts/render-livon-*-routes.mjs`, `scripts/seo-meta.mjs`, `hub-utils.mjs` | ADAPT | `scripts/render-ongil-*.mjs` | 소개 페이지는 이미 사용 중 |
| Error / Loading / Empty | `livon/data/livon-data-core.js`, 각 page.js | REFERENCE ONLY | ONGIL 디자인으로 새로 | 원칙(지어내지 않기)만 가져옴 |
| Responsive | `livon/*.css` | REFERENCE ONLY | — | 시각 디자인이므로 복사 금지 |
| Testing | `tests/livon/*` (node:test, pglite, fake upstream) | ADAPT | `tests/ongil/*` | 방식 그대로 사용 가능 |
| Python 로컬 AI 서버 | `livon/ai_api_server.py` | NOT SUITABLE | — | |

SHARED COMPONENT CANDIDATE: 사이트 gnav/panel(이미 공유 중), 도구 버튼+panel 패턴(현재 ONGIL이 `livon-*` 이름으로 중복 정의).
SHARED MODULE CANDIDATE: auth 2개, cors/json helper, user-data repository, userdata sync server, data provider/cache.

---

## 9. Future ONGIL Home / IoT

현재 architecture가 `Device`, `DeviceConnection`, `DeviceEvent`, `DevicePermission` 추가를 **막지 않는다.** 단, 그대로는 수용하지 못한다.

- 막지 않는 이유: account 모델이 불투명 `accountId` 기준이고, record 저장이 collection 기반이라 device 소유를 account에 연결하기 쉽다.
- 필요한 것:
  - `user_records`는 문서 동기화용(64KB, 계정당 10,000건, 1MB 상한)이라 **센서 이벤트 시계열에는 부적합** → 별도 table.
  - 기기 인증은 사용자 token과 다른 경로(device credential)가 필요.
  - serverless 요청-응답만 있어 상시 연결(MQTT 등)·실시간 알림은 별도 ingest 서비스 필요.
  - `DevicePermission`은 §6.3의 `FamilyPermission`과 같은 grant 모델을 공유하도록 지금 설계해 두면 나중에 다시 만들지 않아도 된다.
  - 카메라·문 센서는 "감시가 아니라 연결" 원칙과 직접 충돌할 수 있어 동의 모델이 먼저다.

---

## 10. Gap Analysis

| 기능 | CURRENT | TARGET | STATUS | GAP | DEPENDENCY | RISK | PHASE | PRIORITY |
|---|---|---|---|---|---|---|---|---|
| ONGIL 코드 구조 | 단일 HTML, inline CSS/JS | 모듈 구조 + token + 화면별 파일 | PLACEHOLDER | 전체 | 디자인 기준 확정 | 낮음 | 1 | HIGH |
| Account / Auth | ONGIL 미연결. Newon+ client config null | 로그인·프로필·탈퇴 | MISSING | 전체 | Newon+ Firebase project, DB | 운영 설정 미확인 | 1 | HIGH |
| Onboarding | 없음 | 큰 글자·짧은 단계 | MISSING | 전체 | Account | 낮음 | 1 | MEDIUM |
| Navigation | 7개 hash 화면 | 8개 영역 + global 5개 | PARTIAL | Store, Saved, Account 화면, 이름 정리(배움·여가→즐길거리) | — | 낮음 | 1 | HIGH |
| Home | hero만 | 오늘 중심 dashboard | PLACEHOLDER | 전체 | My Life 데이터 | 낮음 | 2A | HIGH |
| My Life | 슬로건 | 일정·할 일·루틴·기록 | PLACEHOLDER | 전체 | user-data 저장소 | 낮음 | 2B | HIGH |
| Health / Check-in | 슬로건 | 안부·복약·병원·기록 | PLACEHOLDER | 전체 | 민감정보 저장·동의 설계, 알림 인프라 | **높음** (민감정보) | 3 | HIGH |
| Family | 슬로건 | 연결·권한·동의·공유 | PLACEHOLDER | 전체 + 권한 모델 | Account, Health, grant schema | **높음** (사용자 간 접근) | 4 | HIGH |
| Care / Services | 슬로건 | 서비스 탐색·주변기관 | PLACEHOLDER | 전체, 시니어 공공데이터 provider | data API, live key | 데이터 출처 | 5 | MEDIUM |
| Enjoy | 슬로건 | 프로그램·나들이 | PLACEHOLDER | 전체 | tourapi/lifelong-class | 낮음 | 6 | MEDIUM |
| Community | 슬로건 | 다중 사용자 커뮤니티 | PLACEHOLDER | 서버·운영·신고·차단 전부 | Account, storage, 운영 정책 | 높음 (운영·안전) | 7 | MEDIUM |
| Store | 없음 | 탐색 + 외부 구매처 | MISSING | 전체 | 상품 데이터 출처 | 낮음 | 8 | LOW |
| Search | 고정 문구 | 통합검색 | MOCK | 전체 | 각 영역 데이터 | 낮음 | 9 | MEDIUM |
| Saved | 없음 | 저장·폴더 | MISSING | 전체 | user-data | 낮음 | 9 (기반은 2B) | MEDIUM |
| Notifications | 고정 목록 | 실제 알림 | PLACEHOLDER | 발송 인프라 없음 | push/cron | 중간 | 9 (기반은 3) | HIGH |
| Admin | 없음 | 운영 도구 | MISSING | 전체 | Community, 권한 | 중간 | 9 | MEDIUM |
| Analytics | 미연결 | 이벤트 정의 | MISSING | script + 이벤트 | — | 낮음 | 9 | LOW |
| ONGIL AI | 없음 | 시니어용 assistant | MISSING | 전체 | chat server 재사용 | 의료 조언 경계 | 10 | LOW |
| Accessibility | shell 수준, 영상 정지 불가 | WCAG 2.2 AA 목표 | PARTIAL | §7 | — | 시니어 서비스의 핵심 | 1부터 상시, 11에서 검증 | HIGH |
| SEO | 소개 DONE, shell noindex | 공개 화면 정적 route | PARTIAL | 제품 화면 SEO | — | 낮음 | 11 | LOW |
| Tests | ONGIL 0개 | 영역별 테스트 | MISSING | 전체 | — | 중간 | 1부터 | HIGH |
| CSP | Report-Only | Enforce | PARTIAL | 전환 | inline script 정리 | 중간 | 11 | MEDIUM |

### 이슈 목록

**BLOCKER — 0건**
build 불가, 인증 결함, 사용자 간 데이터 접근, 데이터 손상 경로는 발견되지 않았다. 미구현은 BLOCKER로 치지 않았다.

**HIGH — 6건**
1. H1. worktree가 dirty한 상태에서 미push commit 11개 + 미commit 55개 변경이 `livon-v1-release`에 쌓여 있다. 계정 backend 핵심 파일(`server/livon/userdata/{http,postgres,runtime,service}.mjs`, `migrations/`, `api/livon/userdata.mjs`)이 **미추적(untracked)** 상태다. ONGIL Phase 1을 이 위에서 시작하면 LIVON 변경과 섞인다. → Phase 1 전에 LIVON 변경을 commit/정리하고 ONGIL 전용 branch를 만든다.
2. H2. LIVON 후속 작업 9개 branch가 서로 합쳐지지 않았다. ONGIL이 재사용할 "기준 LIVON"이 어느 branch인지 정해야 한다.
3. H3. Newon+ 인증의 운영 활성 여부가 NOT VERIFIED(client config 기본 null, 서버 fail-closed). Account 없이는 Phase 1의 Account/Onboarding이 local-only로 제한된다.
4. H4. 민감정보(건강·복약·안부) 저장 경로와 동의 모델이 없다. 기존 sync는 민감 collection을 일부러 제외한다. Phase 3 전에 설계 확정 필요.
5. H5. 가족 공유 권한 모델이 없다(§6.3). Phase 4의 선행 조건.
6. H6. 접근성: 자동 재생 영상 정지 불가, 작은·가는 본문, 영상 위 대비 미확인, live region 없음. 시니어 서비스에서 기능 화면을 얹기 전에 바로잡아야 한다.

**MEDIUM — 6건**
1. M1. ONGIL 시각 언어가 2개(§4). 기준 미확정.
2. M2. ONGIL 스타일·스크립트가 inline이며 `livon-*` class 이름을 중복 정의.
3. M3. migration runner 없음, 적용 상태 미확인.
4. M4. 알림 발송·예약 실행·파일 저장 인프라 없음.
5. M5. CSP Report-Only. 정적 호스팅(GitHub Pages)에서는 보안 header를 걸 수 없다.
6. M6. 테스트 1건 실패(§11) — 미commit된 `admin/data.json` 변경 때문.

**LOW — 4건**
1. L1. CI Node 20 vs engines `>=22`.
2. L2. `ongil-start` 영상 7개를 `preload="auto"`로 받음(모바일 데이터·성능).
3. L3. 미사용 CSS(`og-card` 등)와 미사용 hash(`#profile` 등).
4. L4. 언어 선택기는 있으나 제품 shell 번역 없음.

---

## 11. Non-destructive Verification 결과

| 검사 | 결과 | 내용 |
|---|---|---|
| BUILD | NOT RUN (의도적) | `scripts/publish-site.mjs`가 `render-*.mjs`를 실행해 추적 중인 HTML·`sitemap.xml`을 다시 쓴다. "소스 수정 0" 규칙과 충돌하므로 실행하지 않았다 |
| TYPECHECK | N/A | TypeScript 없음 |
| LINT | N/A | lint 설정·도구 없음 |
| SYNTAX | PASS | `node --check`: `home-ongil.js`, `scripts/render-ongil.mjs`, `scripts/home-ongil-body.mjs`, `scripts/home-ongil-copy.mjs` |
| TESTS | 421 pass / 1 fail (총 422) | `node --test tests/livon/*.test.mjs`. 네트워크 없이 127.0.0.1 fake 서버와 pglite만 사용 |

실패 1건: `NA-18 HQ admin + OX MONTH code is untouched…` (`tests/livon/newon-auth.test.mjs:381`). 이 테스트는 `git status`로 `admin/` 변경을 감지하는 guard이며, 감사 **이전부터** 있던 미commit 변경 `admin/data.json` 때문에 실패한다. 코드 결함이 아니고 이번 감사로 생긴 것도 아니다.

ONGIL 테스트는 존재하지 않는다.

### 감사 중 발생한 부작용 (정직한 기록)

- 첫 `git status` 실행 때 git이 `.git/index.lock`(0 byte)을 만들었고, 이 환경에서는 삭제 권한이 없어 남았다. 그대로 두면 사용자의 git 명령이 막히므로 `.git/_to_delete/index.lock.20261002-audit` 로 **이동**했다(같은 폴더에 이전 세션의 동일한 잔여물이 이미 있음). 이후 git은 lock을 만들지 않는 방식으로만 실행했다.
- 같은 명령에서 git이 `.git/index`의 stat cache를 갱신했다. 추적 내용·staging 상태는 바뀌지 않았다(전후 `git status --porcelain` 동일 확인).
- `.git/_to_delete/` 폴더는 직접 삭제해도 안전하다.

---

## 12. Open Questions (Phase 1 전에 사용자 결정 필요)

1. "현재 ONGIL 디자인"의 기준은 `ongil-start`의 어두운 film 스타일인가, 소개 페이지의 monochrome(`--nls-*`)인가? (이 문서는 전자를 가정)
2. 재사용 기준이 될 LIVON branch는 무엇인가? 9개 branch 병합이 먼저인가?
3. Newon+ Firebase project와 PostgreSQL은 운영에 설정되어 있는가?
4. ONGIL은 `ongil-start/` 경로를 유지하는가, `/ongil/app/` 등으로 옮기는가?
5. ONGIL의 건강·안부 데이터를 서버에 저장할 것인가, 1차는 기기 저장(local-first)만 할 것인가?

---

## 13. Implementation Roadmap

기본 순서(Phase 1 → 12)를 유지하되 **세 가지를 조정**한다.

- 조정 A — **Phase 0.5 (신규, 코드 작성 전)**: LIVON 미commit 변경 정리, 기준 branch 확정, ONGIL branch 생성, Open Question 1~5 답변. 이유: H1, H2.
- 조정 B — 접근성 기초를 Phase 11에서 **Phase 1로 당긴다**(영상 정지 control, 본문 크기, touch target, live region, focus). Phase 11은 검증·보완으로 남긴다. 이유: 모든 화면이 이 기초 위에 만들어지므로 나중에 고치면 전부 다시 손봐야 한다.
- 조정 C — Saved의 저장소와 Notification의 **데이터 구조**는 Phase 2B/3에서 먼저 만든다(통합 UI만 Phase 9). 이유: Home·My Life·복약이 이를 전제로 한다.

| Phase | 내용 | 주요 재사용 |
|---|---|---|
| 0.5 | repository 정리, 결정 사항 확정 | — |
| 1 | Foundation / Account / Onboarding / Navigation + 접근성 기초 | newon-auth, verify, accounts, user-data(ADAPT) |
| 2A | Home | — |
| 2B | My Life (+ Saved 저장소) | life-now(ADAPT) |
| 2C | Home + My Life 통합 | — |
| 3 | Health / Check-in (+ 알림 데이터 구조, 민감정보 동의) | userdata sync(ADAPT) |
| 4 | Family / Permission / Consent | 신규 schema |
| 5 | Care / Services / Public Data / Local | data providers |
| 6 | Enjoy / Programs / Activities | tourapi, lifelong-class |
| 7 | Community / Groups | 서버 신규 |
| 8 | Store | — |
| 9 | Search / Saved UI / Notification 발송 / Admin / Analytics | explore-search, platform |
| 10 | ONGIL AI | chat server |
| 11 | Accessibility 검증 / Security / Performance / SEO | — |
| 12 | Production / E2E / Release | — |

---

## 14. Phase 1 Scope

### 수정 대상 (기존)
- `ongil-start/index.html` — shell 구조 분리, 화면 추가(Store, Saved, Account), script/style 외부화
- `scripts/publish-site.mjs` — ONGIL 신규 파일을 `_publish`에 복사하도록 목록 추가
- `vercel.json` — ONGIL 경로 CSP(필요 시)
- `lang-nav.js` — 경로가 바뀔 경우에만

### 신규 (예상)
- `ongil/` 또는 `ongil-start/` 하위: `ongil-tokens.css`(현재 값 그대로 추출), `ongil-app.css`, `ongil-app.js`(router), `ongil-platform.js`, `data/ongil-user-data.js`, `data/ongil-auth-bridge.js`
- `tests/ongil/*.test.mjs`
- `docs/ongil/` 설계 문서(데이터 분류, 동의 모델 초안)

### 건드리지 않는 것
- `livon/**`, `server/livon/**`, `tests/livon/**`, `admin/**`, `firestore.rules`
- `/{lang}/ongil/` 소개 페이지와 그 생성기
- 현재 ONGIL의 색·글꼴·간격·radius·버튼·애니메이션 값

### Phase 1 완료 조건(제안)
- 8개 영역 + Saved/Account 화면이 hash route로 열리고 각 화면에 정직한 빈 상태가 있다.
- 로그인 없이 동작(local-first), Newon+ 설정 시 로그인·로그아웃 가능.
- 영상 정지 control, 본문 최소 크기, 44px touch target, live region 적용.
- `tests/ongil` 통과, `tests/livon` 결과 변화 없음.

---

## 15. Risks

1. **가족 공유 = 사용자 간 접근 통로.** 권한 검사가 한 곳이라도 빠지면 건강 정보가 노출된다. 서버 강제 + 테스트로 "권한 없는 접근 거부"를 먼저 작성한다.
2. **민감정보 처리.** 동의·보관·삭제 정책 없이 저장을 시작하면 되돌리기 어렵다.
3. **안부/긴급 기능의 신뢰성.** 알림 인프라가 없는 상태에서 "도움 요청"을 UI만 만들면 사용자가 실제로 작동한다고 믿을 수 있다. 연결 전에는 명확히 표시한다.
4. **디자인과 가독성의 충돌.** 현재 film 스타일은 정보 밀도가 높은 화면·시니어 가독성과 긴장 관계다. 디자인을 유지하되 본문 크기·대비 기준을 token으로 못 박아야 한다.
5. **LIVON 결합.** LIVON 모듈을 직접 고쳐 쓰면 LIVON이 깨진다. 공용화는 "복사 후 ONGIL용 수정" 또는 "shared로 승격 + LIVON 테스트 통과" 둘 중 하나로만 한다.
6. **Community 운영 부담.** 신고·차단·검수 체계 없이 열 수 없다.
7. **공공데이터.** 8개 provider 전부 실제 key 검증 전이며 시니어 전용 데이터 출처는 아직 없다.

---

## 16. READY FOR PHASE 1

| # | 조건 | 결과 |
|---|---|---|
| 1 | ONGIL source path | 확인 — `ongil-start/index.html` |
| 2 | framework | 확인 — 없음(vanilla + Node scripts) |
| 3 | routing | 확인 — hash, `data-og-view` |
| 4 | auth/account | 확인 — 코드 있음, ONGIL 미연결, 운영 활성 NOT VERIFIED |
| 5 | backend/database | 확인 — Vercel functions + PostgreSQL |
| 6 | ONGIL design system | 확인 — §4 (기준 2개 중 선택 필요) |
| 7 | major blockers | BLOCKER 0, HIGH 6 |
| 8 | LIVON reuse candidates | 확인 — §8 |
| 9 | Phase 1 affected scope | 확인 — §14 |
| 10 | source code modification = 0 | 확인 |

**READY FOR PHASE 1 = YES** (단, Phase 0.5의 repository 정리와 Open Question 1~3 답변을 먼저 권고)
