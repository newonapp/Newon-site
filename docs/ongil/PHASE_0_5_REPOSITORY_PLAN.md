# ONGIL PHASE 0.5 — REPOSITORY PLAN

- 작성일: 2026-10-02 (KST)
- 선행 문서: `docs/ongil/MASTER_AUDIT_V1.md` (보존, 수정하지 않음)
- 성격: 조사·계획만. 소스 수정 0, merge/cherry-pick/checkout/stash/fetch/push 0.
- 모든 git 조사는 읽기 전용 명령으로, lock을 만들지 않는 방식(`GIT_OPTIONAL_LOCKS=0`)으로 실행했다.

---

## 0. 핵심 발견 3가지

1. **history가 두 갈래다.** 2026-09-25 commit `e8062007f`에서 갈라졌다.
   - A 라인(현재 작업 중): local `main` → `livon-v1-release`(HEAD `7fd6e02bf`) → 계정 backend 계열 branch
   - B 라인(배포 라인): `origin/main`(`07adb5275`) → LIVON 후속 작업 11개가 **일렬로** 쌓여 `livon-accessibility-v1`(`29628c2ef`)까지
   - A 라인의 LIVON 내용은 B 라인 첫 commit `12c1b4a6f`("Ship LIVON anonymous free mode on top of the current public site")로 옮겨져 있다. 즉 **B 라인이 A 라인의 상위 집합**이고, 가장 완성된 LIVON은 `livon-accessibility-v1`이다.
   - local `main`(`e3d7d1510`)은 `origin/main`과 갈라져 있다. local `main`을 기준으로 쓰면 안 된다.

2. **dirty worktree의 계정 backend는 이전 초안으로 보인다.** worktree의 미추적 파일(`postgres.mjs`, `runtime.mjs`, `service.mjs`, `001_account_sync.sql`, 2026-09-29 15시대 작성)과 별개로, 같은 기능이 다른 구조(`store.mjs`, `ratelimit.mjs`, `firebase-verifier.mjs`, `001_account_backend.sql`)로 2026-09-30에 commit되어 `origin/main`까지 들어가 있다. 두 구현은 파일 구성·schema·env key 이름(`NEWON_DATABASE_URL` vs `LIVON_DATABASE_URL`)이 다르다. worktree 쪽이 commit된 쪽의 초안인지는 작성 시각 순서로 추정한 것이며 확정은 사용자 판단이 필요하다.

3. **계정 인프라는 의도적으로 보류 상태다.** B 라인의 `docs/newon/livon-public-anonymous-mode.md`(결정 2026-09-30)가 Newon+ Firebase project 생성, 계정용 DB 생성, `/api/livon/userdata` 활성화를 "지금 하지 않는 것"으로 명시한다. Newon+는 ONGIL을 포함한 전체 서비스의 중앙 Identity로 따로 설계할 계획이라고 적혀 있다.

### MASTER_AUDIT_V1 정정 사항

감사 문서 §5·§6.2는 dirty worktree에 있던 **미commit 초안**(`postgres.mjs` 등)을 읽고 쓴 것이다. 기준이 되어야 할 구현은 commit된 쪽(`store.mjs` 등)이며 다음이 다르다.

| 항목 | 감사 문서 기록 (worktree 초안) | commit된 구현 (`origin/main` 이후) |
|---|---|---|
| table | `user_records` 1개 + view 3개 | `user_records`, `saved_items`, `calendar_items`, `preferences`, `sync_metadata`(기기별) |
| 민감 collection | 서버 sync에서 제외 | `journal`, `transactions`, `health_records`, `budgets` 포함, `sensitive` 열 + 동의 필요(`SENSITIVE_CONSENT_REQUIRED`) |
| DB env key | `NEWON_DATABASE_URL` | `LIVON_DATABASE_URL` + 활성 스위치 `LIVON_USERDATA_ENABLED` |
| 서명 검증 | `firebase-admin` 필수 | `node:crypto` 기반 자체 verifier(`firebase-verifier.mjs`), `firebase-admin` 경로도 지원 |
| dependency | `firebase-admin`, `pg`, `pglite` | `pg`만 |

"owner는 검증된 token에서만 정해진다"는 격리 원칙은 두 구현 모두 같다(commit된 `store.mjs` 주석: "Every statement is scoped by account_id taken from the verified session — never from the request"). commit된 구현의 전체 정독은 이번 단계에서 하지 않았다.

---

## 1. Repository 재확인

| 항목 | 값 |
|---|---|
| CURRENT BRANCH | `livon-v1-release` |
| HEAD | `7fd6e02bf149656f198277addb3728ea66c7e548` |
| UPSTREAM | `origin/livon-v1-release` — ahead 11 / behind 0 |
| MODIFIED | 41 |
| UNTRACKED | 15 (감사 때 14 + 감사 문서 폴더 `docs/ongil/`) |
| STAGED | 0 |
| STASH | 0 |
| WORKTREE 목록 | 1개(현재 폴더) |
| REMOTE | `origin` (GitHub `newonapp/Newon-site`) |

remote-tracking ref는 마지막 fetch(2026-10-02 오전) 시점 값이다. 이번에 fetch하지 않았으므로 그 이후 remote 변화는 반영되지 않았다.

### Git lock 상태

| 확인 | 결과 |
|---|---|
| `.git/index.lock` | 없음 |
| 다른 `*.lock` (`.git/`, `refs/heads/`) | 없음 |
| `.git/_to_delete/index.lock.20261002-audit` | 있음, 0 byte, 감사 때 옮긴 것 |
| `.git/_to_delete/` 나머지 | `maintenance.lock`(0 byte, 9/29), `pack-tmp/`, `tmp-objects/` — 감사 이전 세션의 잔여물 |
| git 명령 동작 | 정상 (`status`, `diff`, `log`, `for-each-ref` 모두 정상) |
| 실행 중인 git process | 조사 환경 안에는 없음. **Mac 본체의 process는 이 환경에서 보이지 않아 NOT VERIFIED** |

판정: `.git/_to_delete/` 는 git이 참조하지 않는 폴더이고 안의 lock 2개는 stale artifact다. **삭제 가능**. 이번 단계에서는 삭제하지 않았다. `pack-tmp/`, `tmp-objects/`는 이전 세션이 옮긴 것이라 내용 확인 없이 지우지 말고, git 작업이 모두 정상인 것을 확인한 뒤 사용자가 직접 지우는 것을 권한다.

---

## 2. Dirty Worktree Map

ONGIL 소스 변경은 **0건**이다(`docs/ongil/` 문서만 존재).

### 2.1 Modified 41

| 분류 | 수 | 파일 | 변경 성격 | 관련 기능 |
|---|---|---|---|---|
| SHARED (사이트 생성물) | 24 | `index.html`, `{de,en,es,fr,hi,id,ja,ko,pt-br}/index.html`, `templates/index.html`, `templates/*-app-inc.html` 11개, `templates/subping-page.html`, `sitemap.xml` | **빈 줄 추가뿐**(HTML), `lastmod` 날짜뿐(sitemap). 빌드 스크립트 재실행 부산물로 보임 | 없음 |
| LIVON frontend | 6 | `livon/ai-page.js`, `livon/community-page.js`, `livon/index.html`, `livon/life-now-page.js`, `livon/data/livon-auth-bridge.js`, `livon/data/livon-user-data.js` | 계정 전환·sync 연결 | Account sync |
| SHARED auth (client) | 1 | `newon-auth/newon-auth-firebase.js` | | Auth |
| BACKEND | 4 | `server/newon/auth/verify.mjs`, `server/livon/userdata/contract.mjs`, `vercel.json`, `scripts/serve-publish.mjs` | userdata route 추가 | Account backend |
| SHARED config | 3 | `.env.example`(+7줄), `package.json`, `package-lock.json`(+2,560줄) | `firebase-admin`·`pg`·`pglite` 추가, Node `>=22` | Account backend |
| TEST | 2 | `tests/livon/account-data.test.mjs`, `tests/livon/newon-auth.test.mjs` | | Account |
| ADMIN | 1 | `admin/data.json` | `generatedAt` 한 줄 | 없음 (생성 시각) |

### 2.2 Untracked 15

| 분류 | 수 | 경로 | 관련 기능 |
|---|---|---|---|
| BACKEND | 6 | `api/livon/userdata.mjs`, `server/livon/userdata/{http,postgres,runtime,service}.mjs`, `server/livon/userdata/migrations/`(`001_account_sync.sql`) | Account backend 초안 |
| LIVON frontend | 3 | `livon/data/livon-sync.js`, `livon-sync-ui.js`, `livon-sync.css` | Account sync UI |
| TEST | 2 | `tests/livon/account-backend.test.mjs`, `tests/livon/account-browser.mjs` | |
| DOCS | 3 | `docs/livon/life-topic-expansion.md`, `docs/newon/newon-plus-account-backend.md`, `docs/ongil/` | |
| OTHER | 1 | `Claude outputs/` (이미지 45개) | 작업 산출물 |

### 2.3 지정 항목 상세

| 경로 | TRACKED | 상태 | 관련 기능 | ONGIL을 여기서 시작할 때의 위험 |
|---|---|---|---|---|
| `server/livon/userdata/contract.mjs` | tracked | MODIFIED | sync 계약 | commit된 구현과 다른 내용. ONGIL commit에 섞이면 두 backend가 엉킨다 |
| `server/livon/userdata/{http,postgres,runtime,service}.mjs` | untracked | NEW | Account backend 초안 | B 라인의 `http.mjs`·`store.mjs`와 **파일 이름이 겹치거나 역할이 중복**. `git add -A` 한 번으로 ONGIL commit에 들어간다 |
| `server/livon/userdata/migrations/001_account_sync.sql` | untracked | NEW | schema 초안 | commit된 `001_account_backend.sql`과 **table 구조가 다르다**. 둘 다 적용하면 충돌 |
| `api/livon/userdata.mjs` | untracked | NEW | route entry | B 라인에 같은 경로가 이미 commit되어 있음 → base를 바꾸면 untracked 파일이 checkout을 막는다 |
| `newon-auth/newon-auth-firebase.js` | tracked | MODIFIED | Auth client | ONGIL이 그대로 load할 공용 모듈. 미commit 상태를 기준으로 삼으면 재현 불가 |
| `admin/data.json` | tracked | MODIFIED | HQ admin 생성 시각 | 테스트 `NA-18`이 이 변경 때문에 실패(421/422). 기능 위험은 없음 |

공통 위험: 이 폴더에서 `git add -A`(package.json의 `올리기` script가 정확히 이것을 한다)를 실행하면 55개 변경 전부가 한 commit에 들어간다.

---

## 3. LIVON Branch Inventory

네트워크 fetch 없이 local ref만 조사. ahead/behind는 현재 HEAD(`7fd6e02bf`) 기준.

### 3.1 구조

```
e8062007f (2026-09-25, 공통 조상)
├─ A 라인
│   3aea5667e … e3d7d1510  [main (local)]            ← Ongil 포함 6개 사업 통합
│   … 18579c5fb            [origin/livon-v1-release]
│   … 7fd6e02bf            [livon-v1-release] ◀ HEAD (+ 미commit 55)
│      ├─ 81a88e7f4 → 97c36f80c           [livon-account-backend-v1]
│      │     ├─ f648ceede                 [livon-anonymous-public]
│      │     │   └─ 3795c8e95             [livon-anonymous-v1]
│      │     └─ … 26b9a5043               [docs/livon-live-config]
│      └─ (9955f3065에서) 00011e6b9       [wip/livon-public-law-expert]
└─ B 라인
    12c1b4a6f  A 라인 LIVON을 공개 사이트 위로 이식
    07adb5275  [origin/main] [deploy/livon-anonymous-v1]   ← 배포 기준
    55be1ec29  [livon-data-ai-v1]
    6f3a781e3  [livon-data-screens-v1]
    75bd82eff  [livon-real-data-v1]
    ce95d33ce  [livon-content-quality-v1]
    437db6baa  [livon-data-manager-v1]
    e4c8e2f49  [livon-admin-local-v1]
    b1f1324d4  [livon-onboarding-v1]
    70b24646d  [livon-community-onboarding-v1]
    8802d6a21  [livon-help-faq-v1]
    0ef28b895  [livon-seo-expansion-v1]
    29628c2ef  [livon-accessibility-v1]                    ← LIVON 최신·최대
```

B 라인의 11개 branch는 각각이 앞 branch를 포함하는 일렬 구조임을 `merge-base --is-ancestor`로 확인했다. 감사 문서의 "서로 합쳐지지 않은 9개 branch"는 부정확했다 — 실제로는 **한 줄로 쌓인 stack**이며 `livon-accessibility-v1` 하나가 전부를 포함한다.

### 3.2 Branch별

| BRANCH | HEAD | 날짜 | ahead/behind | PRIMARY FEATURE (commit·diff 확인) | IMPORTANT PATHS |
|---|---|---|---|---|---|
| `livon-v1-release` | `7fd6e02bf` | 09-29 | 0/0 | LIVON V1 + 공공데이터 provider 8종 + Vercel API 분리 | `livon/`, `server/livon/`, `tests/livon/` |
| `main` (local) | `e3d7d1510` | 09-27 | 0/13 | 6개 사업 통합(Ongil 포함) | 사이트 전체 |
| `origin/main` = `deploy/livon-anonymous-v1` | `07adb5275` | 09-30 | 2/15 | LIVON 익명 무료 공개 + 계정 backend(commit판) | `server/livon/userdata/store.mjs`, `server/newon/auth/firebase-verifier.mjs`, `newon-auth/` |
| `livon-account-backend-v1` | `97c36f80c` | 09-30 | 4/0 | 계정 backend·sync 기초, 교차 계정 유출 방지 강화 | `server/livon/userdata/`, `server/livon/ratelimit.mjs`, `livon/livon-account-ui.js`, `tests/livon/pg-harness.mjs` |
| `livon-anonymous-public` | `f648ceede` | 09-30 | 5/0 | 로그인 없는 공개 | 위 + 익명 모드 |
| `livon-anonymous-v1` | `3795c8e95` | 09-30 | 6/0 | storage 차단·손상 시에도 동작 | `livon/data/` |
| `docs/livon-live-config` | `26b9a5043` | 09-30 | 7/0 | LIVE CONFIG runbook, Preview QA 도구(미적용) | `docs/newon/live-config/`, `docs/newon/live-qa/` |
| `wip/livon-public-law-expert` | `00011e6b9` | 09-29 | 1/3 | 법률 전문가 provider (BLOCKED) | `server/livon/data/providers/` |
| `livon-data-ai-v1` | `55be1ec29` | 09-30 | 3/15 | Data Platform V1 + AI 운영 활성 기초 | `livon/data/livon-data-platform.js`, `server/livon/ai/tools.mjs`, `api/livon/ai/chat.mjs`, `api/livon/data/status.mjs` |
| `livon-data-screens-v1` | `6f3a781e3` | 09-30 | 4/15 | 화면을 Data Platform으로 이전 | `livon/data/livon-screen-data.js` |
| `livon-real-data-v1` | `75bd82eff` | 10-01 | 5/15 | 공공데이터 공급 연결 | `livon/data/`, `scripts/livon-provider-status.mjs` |
| `livon-content-quality-v1` | `ce95d33ce` | 10-01 | 6/15 | 큐레이션 530건 품질 점검 | `livon/data/livon-content-quality.js` |
| `livon-data-manager-v1` | `437db6baa` | 10-01 | 7/15 | local 전용 읽기 data manager | `livon/admin/data/` |
| `livon-admin-local-v1` | `e4c8e2f49` | 10-01 | 8/15 | local 운영 console prototype | `livon/admin/admin-{app,service,store}.js` |
| `livon-onboarding-v1` | `b1f1324d4` | 10-02 | 9/15 | 익명·선택형·local-first 개인화 | `livon/livon-onboarding.js`, `livon/livon-personalization.js` |
| `livon-community-onboarding-v1` | `70b24646d` | 10-02 | 10/15 | Community UX + onboarding 연결 | `livon/community-service.js`, `livon/community-page.js` |
| `livon-help-faq-v1` | `8802d6a21` | 10-02 | 11/15 | Help Center, 맥락 도움말 | `livon/help-{data,page}.js` |
| `livon-seo-expansion-v1` | `0ef28b895` | 10-02 | 12/15 | 정적 landing, metadata, 구조화 데이터 | `scripts/livon-seo-build.mjs`, `livon/seo.css` |
| `livon-accessibility-v1` | `29628c2ef` | 10-02 | 13/15 | WCAG 2.2 AA 목표 점검·수정 | `livon/livon-a11y.{js,css}`, `scripts/livon-accessibility-quality.mjs`, `docs/livon/LIVON_ACCESSIBILITY.md` |
| `gh-pages` | — | — | 무관 | 배포 산출물(orphan) | |

push 여부: `origin`에 있는 것은 `main`, `livon-v1-release`(11 뒤처짐), `deploy/livon-anonymous-v1`, `livon-data-ai-v1`, `livon-data-screens-v1`, `livon-real-data-v1`뿐이다. **`livon-content-quality-v1` 이후 8개 branch와 A 라인의 계정 계열 branch는 이 컴퓨터에만 있다.**

### 3.3 ONGIL 파일의 branch 간 동일성

| 파일 | HEAD | origin/main | accessibility | worktree |
|---|---|---|---|---|
| `ongil-start/index.html` | 동일 | 동일 | 동일 | 동일 |
| `home-ongil.css`, `home-ongil-layout.css`, `home-ongil.js` | 동일 | 동일 | 동일 | 동일 |
| `scripts/render-ongil.mjs`, `home-ongil-body.mjs` | 동일 | 동일 | 동일 | 동일 |
| 공용 chrome 9개(`styles.css`, `gnav-mega.css`, `site-dark.css`, `site-mobile.css`, `hover-contrast.css`, `site-chrome.js`, `lang-nav.js`, `lang-dropdown.js`, `theme-shell.js`), `film-keep.js`, `assets/ongil-mark.svg` | 동일 | 동일 | 동일 | 동일 |
| `scripts/home-ongil-copy.mjs`, `ko/ongil/index.html` (소개 문구) | A판 | B판 | B판 | A판 |
| `scripts/publish-site.mjs` | 서로 다름(3종) | | | |

→ **제품 shell과 그것이 load하는 공용 파일은 어느 기준을 골라도 byte 단위로 같다.** 차이는 소개 페이지 문구와 `publish-site.mjs`뿐이다.

---

## 4. LIVON Reuse Source Map

기준: 가장 완전한 구현이 있는 곳. B 라인이 일렬이므로 대부분 `livon-accessibility-v1 @ 29628c2ef`가 source다. "도입 commit"은 그 기능이 처음 들어온 commit이다. **실제 재사용 구현은 하지 않았다.**

| 기능 | SOURCE BRANCH @ COMMIT | 도입 commit | SOURCE PATH | REUSE TYPE | WHY |
|---|---|---|---|---|---|
| AUTH | `origin/main` @ `07adb5275` | `12c1b4a6f` | `server/newon/auth/verify.mjs`, `server/newon/auth/firebase-verifier.mjs`, `newon-auth/*.js` | DIRECT REUSE | 처음부터 Newon 공용으로 설계. `origin/main` 이후 변경 없음(diff 0) |
| ACCOUNT | `origin/main` @ `07adb5275` | `12c1b4a6f` | `server/newon/auth/accounts.mjs`, `livon/livon-account-ui.js` | mapping = DIRECT REUSE / UI = ADAPT | (issuer, subject) → 불투명 accountId. UI는 LIVON markup |
| USERDATA | `origin/main` @ `07adb5275` | `12c1b4a6f` (원본 `81a88e7f4`·`e7b49c15e`) | `server/livon/userdata/{contract,http,store}.mjs`, `migrations/001_account_backend.sql`, `server/livon/ratelimit.mjs`, `livon/data/livon-user-data.js` | ADAPT | collection 목록·table이 LIVON 전용. worktree 초안이 아니라 **이쪽이 기준** |
| ONBOARDING | `livon-accessibility-v1` @ `29628c2ef` | `b1f1324d4` | `livon/livon-onboarding.js`, `livon/livon-personalization.js`, `docs/livon/LIVON_ONBOARDING.md` | ADAPT | 익명·선택형·local-first 원칙이 ONGIL과 맞음. 질문 내용은 시니어용으로 |
| SEARCH | `livon-accessibility-v1` @ `29628c2ef` | A 라인 원본, `6f3a781e3`에서 Data Platform 연결 | `livon/explore-search.js`, `livon/data/livon-screen-data.js` | ADAPT | index 구조 재사용, 유형·카테고리 교체 |
| SAVED | `livon-accessibility-v1` @ `29628c2ef` | A 라인 원본 | `livon/livon-platform.js`, `livon/data/livon-user-data.js`(`saved_items`, `save_folders`) | ADAPT | 저장·폴더 모델 |
| NOTIFICATION | `livon-accessibility-v1` @ `29628c2ef` | A 라인 원본 | `livon/livon-platform.js`(알림 유형·설정) | REFERENCE ONLY | 설정 UI뿐, 발송 없음. ONGIL은 발송 인프라가 새로 필요 |
| COMMUNITY | `livon-accessibility-v1` @ `29628c2ef` | `70b24646d` | `livon/community-service.js`, `livon/community-page.js`, `docs/livon/LIVON_COMMUNITY_UX.md` | REFERENCE ONLY | service 계층이 분리되었으나 다중 사용자 서버 여부는 이번에 미확인(NOT VERIFIED). UX만 참고 |
| ADMIN | `livon-accessibility-v1` @ `29628c2ef` | `437db6baa`, `e4c8e2f49` | `livon/admin/**`, `docs/livon/LIVON_ADMIN_LOCAL.md` | REFERENCE ONLY | local 전용 prototype. root `admin/`(HQ)은 대상 아님 |
| AI | `livon-accessibility-v1` @ `29628c2ef` | A 라인 원본 + `55be1ec29` | `server/livon/chat.mjs`, `server/livon/ai/tools.mjs`, `api/livon/ai/chat.mjs`, `livon/ai-page.js`, `docs/livon/LIVON_AI_ARCHITECTURE.md` | ADAPT | 서버 구조 재사용, prompt·안전 규칙은 시니어용 |
| PUBLIC DATA | `livon-accessibility-v1` @ `29628c2ef` | A 라인 provider + `55be1ec29`·`75bd82eff` | `server/livon/data/**`, `livon/data/livon-data-platform.js`, `docs/livon/LIVON_REAL_DATA_ARCHITECTURE.md` | endpoint = DIRECT REUSE / 화면 연결 = ADAPT | 장소·관광·평생교육은 그대로 쓸 수 있음. 시니어 복지 provider는 신규 |
| ANALYTICS | `origin/main` @ `07adb5275` | 기존 | `analytics.js` | DIRECT REUSE | 사이트 공용, 전 branch 동일 |
| ACCESSIBILITY | `livon-accessibility-v1` @ `29628c2ef` | `29628c2ef` | `livon/livon-a11y.js`, `livon/livon-a11y.css`, `scripts/livon-accessibility-quality.mjs`, `tests/livon/accessibility.test.mjs`, `docs/livon/LIVON_ACCESSIBILITY.md` | 유틸 JS·점검 script = ADAPT / CSS = REFERENCE ONLY | 점검 script는 ONGIL에도 돌릴 수 있는 형태일 가능성. CSS는 시각 디자인 |
| SEO | `livon-accessibility-v1` @ `29628c2ef` | `0ef28b895` | `scripts/livon-seo-build.mjs`, `scripts/livon-seo-quality.mjs`, `docs/livon/LIVON_SEO.md` | ADAPT | 정적 landing 생성 방식 |
| TEST INFRA | `livon-accessibility-v1` @ `29628c2ef` | 누적 | `tests/livon/*.test.mjs`(43개 파일), `tests/livon/pg-harness.mjs`, `tests/livon/fixtures/` | ADAPT | `node:test` + fake upstream + fixture. `tests/ongil/`에 같은 방식 |

읽지 않은 것: 위 B 라인 파일들은 **존재·경로·도입 commit·commit 설명**까지만 확인했고 본문 정독은 하지 않았다(계정 backend의 migration·`store.mjs` 머리말·verifier 머리말 제외). 재사용 직전에 각 파일을 읽어야 한다.

---

## 5. Shared Code Boundary

**ONGIL이 `livon/` 또는 `server/livon/` 파일을 직접 import하는 것은 권하지 않는다.**
- LIVON 수정이 ONGIL을 깨뜨리고 그 반대도 성립한다.
- browser 쪽 LIVON 모듈은 `window.Livon*` 전역과 `livon.*` storage key에 묶여 있어 import해도 그대로 쓸 수 없다.
- 예외: 이미 이름과 위치가 공용인 것(`server/newon/`, `newon-auth/`, root의 사이트 공용 파일)은 직접 사용한다.

| 범주 | 현재 위치 | 판정 |
|---|---|---|
| **NEWON SHARED (이미 공용)** | `server/newon/auth/{verify,accounts,firebase-verifier}.mjs`, `newon-auth/*.js`, `analytics.js`, 사이트 chrome(`styles.css`, `gnav-mega.css`, `site-chrome.js`, `lang-nav.js`, `theme-shell.js`, `film-keep.js`), `scripts/hub-utils.mjs`, `scripts/seo-meta.mjs` | ONGIL이 직접 사용 |
| **SHARED CANDIDATE (지금은 LIVON 이름)** | `server/livon/cors.mjs`, `server/livon/http.mjs`의 `json`/body reader, `server/livon/ratelimit.mjs`, `server/livon/data/cache.mjs`, `server/livon/data/providers/{kakao-local,tourapi,lifelong-class}.mjs`, `livon/livon-api-config.js` + `scripts/livon-api-config.mjs`, `livon/data/livon-user-data.js`의 repository 골격(분류·tombstone·merge), `livon/livon-a11y.js`, 오류 코드 class 패턴(`AuthError`/`SyncError`/`ChatError`) | 이번에는 이동하지 않음. Phase 1에서는 **ONGIL 쪽에 얇은 사본 또는 wrapper**로 시작하고, LIVON stack이 main에 합쳐진 뒤 `server/newon/`·`newon-shared/`로 승격을 별도 작업으로 |
| **LIVON DOMAIN** | `livon/**`의 화면·데이터·문구, `server/livon/chat.mjs`의 prompt, `server/livon/userdata/`의 collection 목록·migration, 청년·기업·세무·직업훈련 provider, `livon/admin/**` | ONGIL이 건드리지 않음 |
| **ONGIL DOMAIN (신규)** | `ongil-start/`(또는 `ongil/`) 하위 전체, `server/ongil/**`, `api/ongil/**`, `tests/ongil/**`, `docs/ongil/**` | Phase 1부터 |

후보별 한 줄 판단:
- Auth, Account mapping — 이미 shared. 그대로.
- CORS/JSON — shared candidate. 가장 먼저 승격할 가치가 있다(작고 의존성 없음).
- API client — `livon-api-config.js`는 이름만 LIVON. ONGIL용 설정 파일을 따로 두는 편이 안전(같은 API origin을 가리키더라도).
- Analytics — 이미 shared.
- Public Data provider — endpoint를 공유(`/api/livon/data` 호출)하는 것이 코드 공유보다 간단.
- Search / Saved primitives — 골격만 참고해 ONGIL domain에 새로 작성. 공용화는 두 제품에서 모양이 안정된 뒤.
- Accessibility utilities — shared candidate. 본문 확인 후 결정.
- Error handling — 패턴 통일만, 코드 공유는 불필요.

---

## 6. Firebase / PostgreSQL 구성 상태

값은 읽지 않았다. key 이름과 코드 참조만 기록한다. repository에 `.env` 파일은 없다.

### 6.1 Firebase (Newon+ 인증)

| 항목 | 상태 | 근거 |
|---|---|---|
| client 설정 코드 | 있음 | `newon-auth/newon-auth-config.js` — 기본값 `NEWON_PLUS_AUTH_CONFIG = null` |
| build 시 주입 | 있음 | `scripts/newon-auth-config.mjs`, `scripts/publish-site.mjs` — env 4개가 모두 있을 때만 `_publish`에 기록 |
| client 통합 | 있음 | `newon-auth/newon-auth.js`, `newon-auth-firebase.js`, `newon-auth-ui.js`, `livon/data/livon-auth-bridge.js` |
| 서버 token 검증 | 있음 | `server/newon/auth/verify.mjs` + `firebase-verifier.mjs`(Google 공개 인증서, RS256) |
| 금지 project | 코드로 차단 | `newon-hq`, `newon-oxmonth` |
| CI 변수 참조 | 있음 (B 라인) | `.github/workflows/github-pages.yml` — repository **Variables**(secret 아님)로 참조 |
| domain 참조 | 있음 | `vercel.json` CSP `connect-src`/`frame-src`에 `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`, `*.firebaseapp.com` |
| 기대 env key | `NEWON_PLUS_FIREBASE_API_KEY`, `NEWON_PLUS_FIREBASE_AUTH_DOMAIN`, `NEWON_PLUS_FIREBASE_PROJECT_ID`, `NEWON_PLUS_FIREBASE_APP_ID`, `NEWON_PLUS_AUTH_PERSISTENCE`, `NEWON_PLUS_AUTH_PROVIDERS`, `NEWON_AUTH_VERIFY_ENABLED`, `NEWON_AUTH_ALLOWED_ISSUERS` | `.env.example` |

**FIREBASE = CONFIGURED IN CODE** / 운영 값 설정 = **NOT VERIFIED**
단, repository 문서(`docs/newon/livon-public-anonymous-mode.md`, 2026-09-30)는 Newon+ Firebase project를 **아직 만들지 않았다**고 적고 있다. 그 이후 변경 여부는 repository로 확인할 수 없다.

### 6.2 PostgreSQL

| 항목 | 상태 | 근거 |
|---|---|---|
| 연결 코드 | 있음 | `server/livon/userdata/store.mjs`(commit판) / `postgres.mjs`·`runtime.mjs`(worktree 초안) |
| 기대 env key | `LIVON_DATABASE_URL`, `LIVON_USERDATA_ENABLED`, `LIVON_USERDATA_MINUTE_LIMIT`, `LIVON_USERDATA_DAILY_LIMIT` (commit판) / `NEWON_DATABASE_URL`, `GOOGLE_APPLICATION_CREDENTIALS` (worktree 초안) | 각 `.env.example` |
| migration | 1개씩, **서로 다른 2종** | commit판 `001_account_backend.sql` / 초안 `001_account_sync.sql` |
| migration runner | 없음 | 수동 적용 전제("Apply once to the production database"). `docs/livon-live-config` branch에 `neon-setup.sql`, `neon-verify.sql`, `check-neon-setup.mjs` 준비물 있음(미적용 표기) |
| repository layer | 있음 | `store.mjs`: `findAccount`, `createAccount`, `pull`, `write`, `serverRev`, `touchDevice` + 테스트용 in-memory 구현 |
| account mapping | 있음 | `account_refs(issuer, subject) → user_accounts.account_id` |
| LIVON userdata schema | 있음 | `user_accounts`, `account_refs`, `user_records`, `saved_items`, `calendar_items`, `preferences`, `sync_metadata` |
| ONGIL용 schema | 없음 | collection CHECK 제약이 LIVON 목록으로 고정 |

**POSTGRESQL = CONFIGURED IN CODE** / **MIGRATIONS = PARTIAL**(파일은 있으나 runner 없음, 2종 병존, 적용 여부 미확인) / 운영 DB 존재·적용 = **NOT VERIFIED**
같은 문서가 계정용 DB를 **아직 만들지 않았다**고 적고 있다.

### 6.3 ONGIL에 주는 의미

- Phase 1의 Account는 **실제 로그인 없이 local-first(익명)로 설계**해야 한다. 로그인은 "설정되면 켜지는" 선택 기능으로 둔다(LIVON과 같은 방식).
- Newon+가 중앙 Identity로 따로 설계될 예정이므로, ONGIL이 자체 인증을 만들면 안 된다.
- 건강·가족 데이터의 서버 저장은 계정 인프라가 열린 뒤의 일이다. Phase 3·4의 서버 부분은 이 결정에 묶여 있다.

---

## 7. ONGIL Isolation Plan

### 7.1 권장

| 항목 | 값 |
|---|---|
| RECOMMENDED ONGIL BASE | `07adb5275dcc2a36ddfcd3c3ef86de0cf15b49b3` = `origin/main` (local branch `deploy/livon-anonymous-v1`과 같은 commit) |
| RECOMMENDED ONGIL BRANCH | `ongil-foundation-v1` |
| RECOMMENDED WORKTREE STRATEGY | repository 밖 형제 폴더에 별도 git worktree: `~/Newon-ongil` |

WHY
1. **ONGIL shell 포함**: `ongil-start/index.html`과 그것이 load하는 공용 파일이 현재 HEAD와 byte 단위로 같다(§3.3). 감사 결과가 그대로 유효하다.
2. **필요한 shared infrastructure 포함**: `newon-auth/`, `server/newon/auth/`(자체 verifier 포함), commit된 계정 backend, 공공데이터 API, `analytics.js`, `tests/livon` 28개 파일.
3. **dirty 변경 미포함**: 미commit 55건이 전혀 섞이지 않는다.
4. **LIVON과 충돌 최소**: ONGIL은 `ongil-start/`, `server/ongil/`, `tests/ongil/`, `docs/ongil/`만 만진다. LIVON stack(B 라인)과 겹치는 파일은 `scripts/publish-site.mjs`, `vercel.json`, `package.json` 정도다.
5. **merge 가능한 history**: 배포가 `main` push로 일어나므로 `origin/main`에서 갈라진 branch가 가장 자연스럽게 돌아간다. LIVON stack은 `origin/main`의 직계 후손이라, 그것이 main에 합쳐지면 ONGIL branch는 main을 다시 받아오기만 하면 된다.

기각한 대안
- `7fd6e02bf`(현재 HEAD): `origin/main`에 없는 commit 15개 위에 서게 되어 main으로 돌아갈 때 A/B 라인 충돌을 ONGIL이 떠안는다.
- `29628c2ef`(`livon-accessibility-v1`): 가장 풍부하지만 push되지 않은 LIVON commit 11개에 ONGIL을 묶는다. LIVON이 수정·재작성되면 ONGIL history도 흔들린다. 참고용으로는 `git show livon-accessibility-v1:<path>`로 언제든 읽을 수 있어 base로 삼을 필요가 없다.
- local `main`: `origin/main`과 갈라져 있음.

주의: `origin/main` 값은 마지막 fetch 시점 기준이다. 만들기 직전에 `git fetch origin`으로 갱신해 최신 `origin/main`을 base로 쓰는 것이 좋다(fetch는 working tree를 바꾸지 않는다).

### 7.2 자동 생성하지 않은 이유

이번 단계에서 branch·worktree를 **만들지 않았다.**
- 이 세션은 Mac의 `~/Newon`을 격리된 환경에 다른 경로로 mount해서 본다. `git worktree add`는 **절대 경로**를 `.git/worktrees/`에 기록하므로, 여기서 만들면 Mac에서는 존재하지 않는 경로를 가리키는 깨진 worktree가 된다.
- 이 환경은 파일 삭제 권한이 없어 git이 lock 파일을 지우지 못한다(감사 때 `index.lock`이 남은 원인). ref를 쓰는 명령도 같은 문제를 일으킬 수 있다.
- 접근이 승인된 폴더는 `~/Newon` 하나라 형제 폴더를 만들 수 없다.

### 7.3 사용자가 Mac 터미널에서 실행할 명령

```bash
cd ~/Newon
git fetch origin                                   # 선택. working tree는 바뀌지 않음
git worktree add -b ongil-foundation-v1 ../Newon-ongil origin/main
```

이 명령은 `~/Newon`의 branch·파일·미commit 변경을 건드리지 않는다. 새 폴더 `~/Newon-ongil`에 `ongil-foundation-v1` branch가 깨끗한 상태로 checkout된다.

확인:

```bash
git -C ~/Newon-ongil status --short        # 출력 없음이어야 함
git -C ~/Newon-ongil log -1 --oneline      # 07adb52… (fetch 후 달라졌으면 최신 origin/main)
ls ~/Newon-ongil/ongil-start/index.html
git -C ~/Newon status --short | wc -l      # 56 그대로 (41 + 15)
```

그 다음:
- 새 폴더에는 `node_modules`가 없다. 테스트를 돌리려면 `~/Newon-ongil`에서 `npm ci` (base의 dependency는 `pg`와 번역 도구뿐).
- `docs/ongil/`의 두 문서는 `~/Newon`에 미추적 상태로 있어 새 worktree에는 없다. Phase 1 첫 작업으로 두 파일을 `~/Newon-ongil/docs/ongil/`에 복사해 첫 commit으로 넣는다.
- Claude 세션에 `~/Newon-ongil` 폴더를 연결한다. LIVON 참고는 그 폴더에서 `git show livon-accessibility-v1:<path>`로 읽는다(checkout 불필요).

### 7.4 하지 않을 것

stash, 현재 폴더에서의 branch 전환, `git add -A`, dirty 변경의 새 branch 이동 — 모두 하지 않는다. `~/Newon`의 미commit 변경 처리는 ONGIL과 별개의 LIVON 작업으로 남긴다.

---

## 8. Phase 1 Prerequisites

필수
1. §7.3 명령으로 worktree 생성 (사용자 실행).
2. 세션에 `~/Newon-ongil` 연결.

권장 (Phase 1을 막지는 않음)
3. `~/Newon`의 계정 backend 초안(미추적 6건 + 관련 수정)을 유지할지, commit된 구현으로 대체된 것으로 보고 정리할지 결정. **지우기 전에 반드시 내용 비교.**
4. 이 컴퓨터에만 있는 branch 10여 개를 remote에 올려 보존할지 결정(디스크 고장 시 LIVON 작업 전체가 사라진다).
5. LIVON stack(`livon-accessibility-v1`)을 main에 합칠 시점 결정. ONGIL이 a11y 유틸·onboarding을 "참고"가 아니라 "직접 사용"하려면 이것이 먼저다.
6. `.git/_to_delete/` 정리.

확정된 결정 (사용자)
- 디자인 기준 = `ongil-start`의 dark / film visual identity. 소개 페이지의 monochrome로 교체하지 않는다. LIVON visual은 복사하지 않는다.
- LIVON 재사용 기준 = 기능별 source(§4). 특정 branch를 일괄 최신으로 가정하지 않는다.
- Firebase / PostgreSQL = 운영 설정 완료로 가정하지 않는다 → Phase 1 Account는 local-first.

---

## 9. Verification (이 단계 종료 시점)

| 확인 | 결과 |
|---|---|
| 원래 branch | `livon-v1-release` 그대로 |
| 원래 HEAD | `7fd6e02bf…` 그대로 |
| `git status --porcelain` 전후 | 동일 (41 M + 15 ??). 새 문서는 이미 미추적인 `docs/ongil/` 안에 있어 항목 수 불변 |
| staged | 0 |
| stash | 0 |
| branch / worktree 생성 | 없음 |
| commit / push / fetch / merge / checkout | 없음 |
| `.git/` 안 변경 | 없음 (lock 없음) |
| 생성 파일 | `docs/ongil/PHASE_0_5_REPOSITORY_PLAN.md` 1개 |
| secret 값 | 읽지 않음, 기록하지 않음 |
