# NEWON WEBSITE PHASE 03 P6 DETERMINISTIC BUILD AND TEST REPAIR REPORT

브랜치 `work/phase03-p6-deterministic-build` (P5 `fb21e4ca`에서 분기). push·merge·deploy 없음.

## A. 보존 결과
- 기존 브랜치 불변(main 70a816aa, p5 fb21e4ca 등). 페이지 삭제·리디렉션·noindex 없음, LIVON/ONGIL 시작하기 버튼 유지.
- 측정치: 언어별 index.html 216개 × 9 = 1,944, sitemap 1,162 loc. 요청서의 "772 pages"는 이 수치와 맞출 수 없어 실측치를 기록했습니다.
- 백업 태그 `backup/studio-v1-aa57632-20261017` 존재. apphash(135개 파일) 변화 없음.

## B. 빌드 비결정성 원인과 수정
`PHASE03-P6-BUILD-DETERMINISM.md` 참고. 요약: 두 스크립트의 비멱등 공백 삽입 수정, 템플릿 13개 공백 정규화, `SOURCE_DATE_EPOCH` 지원. 같은 입력 독립 클린 빌드 2회에서 7,590개 파일 해시 동일.
미해결: 같은 트리 재빌드 시 `sp.closingFoot` 7개 언어 독일어→영어 전환(정책 항목).

## C. 번역 후보와 손실 방지
- `i18n-candidates/translation-candidates.v1.json/.tsv`: 189개 파일, 12,723 레코드, 재구성 189/189 무손실, 전부 `unreviewed`. 정본 전환 없음.
- 추적 소스 안 4,653 / 커밋된 페이지에만 4,696 / 너무 짧음 2,639 / json 키 735.
- P5 정정: "도출 불가"는 과했음. 절반 가량은 `_sp.<lang>.json`에 있으나 빌드가 영어로 덮어씀. 운영(gh-pages)은 영어 폴백을 배포 중인 것으로 확인.
- `--verify` 변조 테스트: 변조/신규 drift는 FAIL, 정상은 PASS.

## D. 기존 테스트 5건
| 테스트 | 결과 | 조치 |
|---|---|---|
| CV2-60 | 전체 히스토리 PASS | 얕은 clone 환경 한계 |
| ON-35 | PASS | 일일 지터로 인한 부동소수 오차에 허용오차 적용 |
| DM-11 | PASS | 고정 시계 일관 적용 |
| RC-14 | PASS(고정 시계) | `--now` 지원. 실시계 만료는 RC-14b(todo)로 가시화, 데이터 연장 안 함. 13건은 `PHASE03-P6-LIVON-CONTENT-REVIEW.md` |
| RC-1 | FAIL | 웹사이트 브랜치가 `publish-site.mjs`를 의도적으로 변경. LIVON RC 브랜치 범위 게이트 → main 병합 시 정책 결정 필요. main에서는 PASS |
(RC-41도 같은 이유로 FAIL, main에서 PASS. 테스트는 수정하지 않음.)

전체 재실행(전체 히스토리 clone, 커밋된 트리): LIVON 50 + ONGIL 35 파일, pass 2434 / fail 2(RC-1, RC-41) / skipped 11 / todo 1(RC-14b).

## E. CI 가드
`.github/workflows/build-guards.yml`: pull_request/workflow_dispatch만, 읽기 전용, 비밀·배포 단계 없음. 배포 워크플로 `github-pages.yml` 불변. `qa-ci-workflows.mjs`가 이를 정적 검사(변조 시 FAIL, 정상 PASS). 커밋된 트리 클린 빌드 후 drift 가드 PASS(189/189), candidates verify PASS.

## F. 다국어·접근성·JSON-LD
- 영어 잔존(A+B 줄): ja 770, hi 770, pt-br 600, es 558, de 523, fr 520, id 520, ko 2. 우선순위는 `PHASE03-P6-I18N-ENGLISH-REMAINDER.md`.
- 1440px 대비(나머지 7개 언어, 라이트/다크): 0건. 이미지/그라디언트 대비(ko,en): `ai-automation`의 `bs-use-board__tag` 3.71:1 → 글자색 알파 0.5→0.72로 수정, 재스캔 0건. 다크 및 390px 0건.
- 단계 흐름: `role=list` + 항목 구조 확인. 실제 스크린리더 검증은 NOT VERIFIED.
- JSON-LD: 1,944 페이지, 504 블록 파싱 오류 0, Service 108. 아웃소싱 표현 2건(부정문 안내, 정보성).
- `fast-check` PASS.

## G. 남은 정책 결정
1. 번역 정본 소스(영어 폴백 vs 커밋된 현지어) 및 `closingFoot` 순서 의존.
2. RC-1/RC-41 브랜치 범위 게이트 처리.
3. LIVON 만료 13건 콘텐츠 갱신.
4. 7개 언어 `business/build`·`solutions`의 구 제안형 H1/태그라인, Solutions 4유형·CARE 문구(확정 ko/en 기준 번역 필요). 신규 상품·가격·기간 추가 없음.

## H. 변경 파일과 로컬 커밋
커밋 `b1888711b` + 보고서 커밋. 스크립트 수정 6, 테스트 3, 템플릿 13(공백만), CSS 1, 신규 스크립트 3, 워크플로 1, i18n-candidates, 문서·QA 산출물.

## I. 릴리스 블로커
- 배포 HOLD 유지: 번역 정본 결정 전에는 빌드가 커밋된 현지어를 영어로 덮음.
- RC-1/RC-41 범위 결정.
- 운영 배포·push·merge는 하지 않았고 승인이 필요합니다.
