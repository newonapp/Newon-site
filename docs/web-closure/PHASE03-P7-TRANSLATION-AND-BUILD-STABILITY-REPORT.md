# PHASE03 P7 — 번역 정본·빌드 안정성·테스트 통합 개선 (최종 보고서)

- 브랜치: `work/phase03-p7-translation-source` (기준: `work/phase03-p6-deterministic-build` @ `c9cf2ce0b`)
- 상태: 로컬 커밋만. push / merge / 운영 배포 없음.
- 판정 표기: PASS / FAIL / NOT RUN / NOT VERIFIED.

## 1. 번역 정본 정책

| 항목 | 결과 |
|---|---|
| 우선순위 | 승인된 번역(`i18n-approved/<lang>.json`) → 없으면 영어 fallback |
| 번역 후보 | 189개 파일 / 12,723 레코드 무손실 보존 (`i18n-candidates/`는 변경 없음) |
| 미검수 번역 자동 승격 | 금지. 승인 항목은 reviewStatus·reviewer·reviewedAt·text·존재하는 키를 모두 요구하고, 하나라도 빠지면 빌드 실패 |
| 승인 항목 수 | 0 (7개 언어 모두 `entries: {}`) |
| `closingFoot` 영어 덮어쓰기 | **원인 확인·수정.** `locales/_sp.<lang>.json`(커밋된 번역 원본)을 빌드 단계가 제자리에서 영어로 바꾸고, 두 번째 빌드의 `merge-subping-locales`가 그 영어를 `locales/<lang>.json`에 복사하고 있었음. `run-all-locale-patches.mjs`가 실행 전 스냅샷 → 실행 후(실패 시에도) 복원. 의도적 갱신은 `NEWON_UPDATE_TRANSLATION_SOURCE=1` 또는 `--translate` |
| 운영 대조 | 운영(gh-pages) `de/index.html`은 독일어 `closingFoot`을 서빙 → 보존이 운영과 일치. 운영의 `_sp.de.json` 데이터 파일은 빌드로 오염된 영어 상태 (참고만, 변경 안 함) |
| 영어 잔여 분류 | `classify-english-remainder.mjs`. 합계가 `qa-lang-mix`와 정확히 일치 (ja 1077, hi 1077, pt-br 849, es 788, de 734, fr 728, id 729) |

상세: `PHASE03-P7-TRANSLATION-POLICY.md`, `PHASE03-P7-ENGLISH-REMAINDER-CLASSIFIED.md`.

## 2. 빌드 결정성

`scripts/qa-build-determinism.mjs` — 저장소 사본 두 개(A, B)에서 A1(깨끗한 빌드), A2(같은 트리 재빌드), B1(독립 깨끗한 빌드)을 `SOURCE_DATE_EPOCH=1792281600`으로 실행.

| 실행 | 파일 수 | 해시 |
|---|---|---|
| A1 | 7648 | a4ae8cb72d2fc69b |
| A2 | 7648 | a4ae8cb72d2fc69b |
| B1 | 7648 | a4ae8cb72d2fc69b |

- **PASS** — 보호된 번역 원본 변경 0건.
- 같은 입력에서 출력이 다르면 PASS가 아니도록 구현. 보호 코드를 제거한 변조 시험(scratch)에서 **FAIL**: 재빌드가 28개 파일 변경, `_sp` 7개 수정, A1≠A2 (B1==A1).
- 드리프트 기준선: `_sp` 7개가 더 이상 흔들리지 않아 189 → 182 (`PASS · drifted 182 (baseline 182)`).
- CI: `build-guards.yml`에 승인 번역 검사와 결정성 단계 추가, `qa-ci-workflows`가 필수 단계로 요구 (단계를 바꾼 변조 시험에서 FAIL 확인), `fast-check` 3e에 `approved-translations --check` 추가. 기존 CI·배포 워크플로의 다른 부분은 보존.
- 원인 기록: P6 문서의 "build 단계의 영어 덮어쓰기" 서술이 불완전했음. P5 문서에 정정 추가.

## 3. RC-1 / RC-41

독립 재현(전체 이력 클론):

- RC-1: `scripts/publish-site.mjs`, `scripts/livon-data-quality.mjs`, `tests/livon/data-manager.test.mjs`에서 실패. 뒤의 둘은 P6의 웹사이트 수정이므로 P6의 "기존 실패" 설명은 불완전했음.
- RC-41: 웹사이트 파일 전부와 위 3개에서 실패(게이트가 docs/tests 외 모든 파일을 LIVON 제품으로 취급).

조치: `scripts/qa-branch-scope.mjs` + `tests/web/branch-scope-gate.test.mjs`(BS-1..BS-6, 6/6 PASS). 테스트 삭제·무조건 SKIP 없음.

- 보호 경로(`livon/`, `server/`, `api/`, `scripts/livon-*`, `vercel.json`, `.env`, `.github/workflows/github-pages.yml` 등)는 그대로 실패.
- 웹사이트 도구 파일은 `WEBSITE_ANCHOR`(`b155c278…`) 이후 커밋이 모두 웹사이트 계보일 때만 예외.
- 변이 시험: `livon/today-feed.js`에 한 줄 추가 → RC-1, RC-41 모두 FAIL (게이트 유효).
- main 병합 정책: squash merge 시 앵커를 갱신해야 함. 문서 `PHASE03-P7-BRANCH-SCOPE-GATES.md`.

## 4. LIVON 만료 기록 13건

- `scripts/qa-livon-expired-records.mjs`(읽기 전용). 날짜 연장 없음, 출처·상태 확인 시도.
- 공식 출처 7곳 WebFetch는 권한 응답이 없어 실패 → **전부 NOT VERIFIED**. 확인되지 않은 기록은 만료 상태 유지.
- 편집 기록 6건과 공식 출처 7건 모두 stale. `lastCheckedAt`의 `2026-09-24T15:00Z`는 KST 2026-09-25 (P6이 UTC 날짜를 기록).
- 공개 노출: 현재 "확인 필요" 라벨로 노출(숨김 아님). 노출 정책(a/b/c)은 **정책 결정 사항**이라 적용하지 않음.
- RC-14b는 의도된 TODO로 유지.

## 5. 비즈니스 표현 현지화

- 확정 표현 기준: ko/en (`scripts/business-model-reframe.mjs` 정규식 계층). 7개 언어는 MT 오버레이 — 덮어쓰지 않음.
- 후보: `i18n-candidates/business-wording-candidates.v1.json` — 31개 역할 × 7개 언어 = 217건, 전부 `candidate-unreviewed`. 현재 상태: 현지화 100 / 영어 fallback 70 / 없음 47.
- 발견: 7개 언어의 build 페이지는 카드 4개 / 50 요소(ko·en 7개 / 68), hero lede 없음, `care` 전체 영어 fallback, 오래된 견적형 헤드라인, en 문법 오류("Product development are discussed separately"), ko "서비스 안내" ↔ en "Services & pricing" 불일치, 상세 페이지의 white-label·custom·internal 표현 잔존.
- 결정 필요: Solutions 4유형, CARE 문구, "Services & pricing" 라벨, 상세 CTA, MT 오버레이 교체. 상세: `PHASE03-P7-BUSINESS-WORDING-REVIEW.md`.

## 6. 최종 검증 (P7 커밋 `c105b614b`, 깨끗한 클론)

| 검사 | 결과 |
|---|---|
| 결정성 (A1/A2/B1) | PASS |
| 빌드 (`publish-site.mjs`) | PASS (rc 0) |
| 드리프트 가드 | PASS · 182/182 |
| 번역 후보 검증 | PASS · 182 파일, 11,988 레코드, 보존 189, 오류 0 |
| fast-check | PASS (가격 QA, 푸터, 비즈니스 i18n, lang-mix, JSON-LD, ci-workflows, approved-translations 포함) |
| qa-ci-workflows | PASS |
| qa-lang-mix | 666 페이지 · 누락 0 · 잘못된 `<html lang>` 0 |
| qa-jsonld | PASS · 1944 페이지, 파싱 불가 0 |
| 전체 테스트(86개 파일, 최초 실행) | pass 2439 · fail 3 · skipped 11 · todo 1 |
| 재실행 | release-candidate 63 pass / 0 fail / 1 todo(RC-14b), accessibility 76/0, `tests/web` 6/6 |
| 색 대비·JSON-LD 시각 스캔 | P6 결과 승계 — P6 이후 HTML/CSS/템플릿/livon/ongil/js 입력이 바이트 단위로 동일해 재실행하지 않음 (NOT RUN, 입력 동일) |
| 실제 스크린 리더 | NOT VERIFIED |

최초 실행의 실패 3건: RC-1·RC-41은 P7에서 새로 추가한 파일(`scripts/livon-expired-records.mjs`, `tests/livon/branch-scope-gate.test.mjs`)이 LIVON 보호 경로에 있어서 발생 → `scripts/qa-livon-expired-records.mjs`, `tests/web/`로 이동 후 통과. A11Y-B7(탭 이동)은 다른 CPU 부하 작업과 동시에 실행될 때 한 번 실패, 재실행 통과 → **타이밍 의존 불안정 테스트로 기록**(수정하지 않음).

## 7. 변경 파일·커밋

- `23197fb38` 번역 원본 보호 + 승인 오버레이
- `5ce968582` 게이트, 결정성, 만료 기록 보고, 문구 후보
- `c105b614b` 새 파일을 LIVON 보호 경로 밖으로 이동
- 보고서 커밋(이 문서). 31개 파일 변경(+10,491/−15): 스크립트 12, 테스트 2, 워크플로 1, 문서 5+, 후보/승인 JSON 8, 산출물 JSON 3 (+ 이 보고서의 검증 로그).
- 기존 브랜치 불변: main 70a816aa, work/phase03-qa 5a3ed06f, work/business-hub-integration dd8dd8fb, work/info-only-app-first b155c278, work/phase03-content-recovery 6be14756, work/phase03-p4-content-i18n abe3ab22, work/phase03-p5-build-repro fb21e4ca, work/phase03-p6-deterministic-build c9cf2ce0.

## 8. 남은 정책 결정 / 릴리스 차단 요소

정책 결정: (1) LIVON 만료 기록 노출 방식 a/b/c, (2) 비즈니스 문구 5건(§5), (3) main 병합 방식(squash 시 앵커 갱신), (4) 승인 번역 검수자 지정.
릴리스 차단: LIVON 공식 출처 7곳의 실제 확인(NOT VERIFIED), 7개 언어 번역 검수(승인 0건), 실제 스크린 리더 시험.
