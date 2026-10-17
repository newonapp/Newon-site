# PHASE 03 P7 — RC-1·RC-41 브랜치 범위 게이트

## 독립 재현 (전체 히스토리 clone, P6 최종 트리 `c9cf2ce0b`)
| 테스트 | 결과 | 실패 파일 |
|---|---|---|
| RC-1 | FAIL (`LIVON tree = integration commit except …`) | `scripts/publish-site.mjs`, `scripts/livon-data-quality.mjs`, `tests/livon/data-manager.test.mjs` |
| RC-41 | FAIL (`product files changed without an RC fix entry`) | 웹사이트 파일 전체(페이지, css, locales, templates, 웹사이트 스크립트, `.github/workflows/build-guards.yml`)와 위 3개 |

두 게이트는 LIVON V1 제품을 지키려고 만들어졌고, 저장소 전체가 LIVON 라인이던 시절의 가정(docs/tests 밖 모든 파일 = 제품)을 담고 있다. 웹사이트 브랜치는 웹사이트 파일과 공용 도구 몇 개를 의도적으로 바꾼다. P6에서 만든 LIVON 도구/테스트 수리(`livon-data-quality.mjs` 고정 시계, `data-manager` 테스트)도 RC-1에 걸렸다. 이는 P6 보고서의 "RC-1·RC-41은 publish-site.mjs 때문"이라는 설명이 불완전했음을 뜻한다.

## 설계 (`scripts/qa-branch-scope.mjs`)
- **LIVON 보호 경로** — `livon/`, `server/`, `api/`, `scripts/livon-*`, `assets/livon-*`, `vercel.json`, 배포 워크플로 `github-pages.yml`, `scripts/publish-site.mjs`, `scripts/serve-publish.mjs`, `docs/livon/`, `tests/livon/`. 어떤 라인에서도 예외가 없다.
- **웹사이트 소유 경로** — 위를 제외한 모든 경로. 히스토리에 `WEBSITE_ANCHOR`(`b155c278…`, `work/info-only-app-first`의 첫 커밋)가 있는 라인에서만 면제된다.
- **공용 도구 5개**(`publish-site.mjs`, `livon-data-quality.mjs`, `data-manager`·`onboarding`·`release-candidate` 테스트)는 면제되려면 추가 조건이 있다: 기준 이후 그 파일을 건드린 **모든 커밋**이 앵커의 후손이어야 한다(`WEBSITE_ANCHOR^..HEAD`). LIVON 라인에서 같은 파일을 고치면 계속 실패한다.
- 앵커가 히스토리에 없는 라인(예: 웹사이트 브랜치를 squash로 main에 합친 경우)은 엄격한 기존 게이트가 그대로 적용된다.

기존 LIVON 허용 목록(이름 붙은 커밋, `RC_FIXES` 등)은 그대로이며, 새 규칙은 OR 조건으로만 추가되었다. 테스트 삭제·SKIP·기대값 완화는 없다.

## 검증
- 단위: `tests/web/branch-scope-gate.test.mjs` BS-1~BS-6(웹 파일 면제, LIVON·배포 워크플로 비면제, 앵커 없는 라인 비면제, 공용 도구의 후손 조건) — 6/6 PASS.
- 통합(전체 히스토리 worktree): P7 트리에서 RC-1 PASS, RC-41 PASS.
- 변조: 같은 worktree에서 `livon/today-feed.js`에 한 줄을 추가해 커밋하자 RC-1과 RC-41이 모두 FAIL(`+ 'livon/today-feed.js'`). 실제 LIVON 회귀는 여전히 걸린다. (이미 허용 목록에 있는 `livon/home-page.js`, `scripts/livon-seo-build.mjs`는 기존 설계상 허용되어 변조 대상에서 제외했다.)

## main 통합 시 적용되는 검증 정책
1. 웹사이트 브랜치를 히스토리를 유지한 채(merge commit) main에 합치면 앵커가 main 히스토리에 들어가므로, main에서도 위 범위 게이트가 그대로 동작한다. LIVON 보호 경로의 변경은 계속 이름 붙은 커밋 항목이 있어야 한다.
2. squash로 합치면 앵커가 사라져 RC-1·RC-41이 다시 실패한다. 같은 변경에서 `WEBSITE_ANCHOR`를 squash 커밋으로 바꿔야 한다(`scripts/qa-branch-scope.mjs` 머리 주석에 기록).
3. `WEBSITE_TOOLING`이나 `LIVON_PROTECTED`를 바꾸는 변경은 LIVON 소유자의 검토를 받는다. 두 목록은 게이트 자체의 정책이다.
4. 배포 워크플로 `github-pages.yml`은 어느 라인에서도 면제되지 않는다. 변경은 이름 붙은 항목이 필요하다.
