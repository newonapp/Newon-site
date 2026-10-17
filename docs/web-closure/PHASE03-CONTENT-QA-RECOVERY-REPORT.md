# NEWON WEBSITE PHASE 03 CONTENT & QA RECOVERY REPORT

작성일: 2026-10-17 · 브랜치 `work/phase03-content-recovery` (로컬 전용, `work/phase03-qa` `5a3ed06` 위에서 분기) · **push / main merge / 운영 배포: 수행하지 않음**
상태 표기: PASS / FAIL / SKIP / NOT RUN / NOT VERIFIED

## 1. 안전 기준선과 원본 보존

| 브랜치 | 커밋 | 상태 |
|---|---|---|
| `main` | `70a816a` | 변경 없음 |
| `work/info-only-app-first` | `b155c27` | 변경 없음 |
| `work/business-hub-integration` | `dd8dd8f` | 변경 없음 |
| `work/phase03-qa` | `5a3ed06` | 변경 없음 (보존) |
| `work/phase03-content-recovery` (신규, 현재) | `5a3ed06` 위 로컬 커밋 | 이번 단계 |

- `main..5a3ed06` 로컬 커밋 8건 확인. reset / clean / 강제 checkout / 일괄 삭제 / stash 사용 없음. 기존 `_publish`, `_restore_tmp`, 백업, 로그 보존.
- 앱 저장소, 운영 API·DB, 사용자 데이터 변경 없음. `~/Newon`은 이 환경에 존재하지 않아 접근하지 않음.
- `main` 대비 `livon/ ongil/ ongil-start/ lifestage/ server/ api/ tests/livon tests/ongil` 커밋·작업트리 변경 **0건**. (`shareon/` 1파일 차이는 이전 승인 단계의 정보형 전환분.)
- LivOn / Ongil: 마크업 변경 없음. 작업트리에서 ongil·lifestage·shareon·petlog·babylog·myworld·media 페이지(언어별 9개)에서 바뀐 것은 `business-pillar.css?v=` 캐시 버전 문자열 1줄뿐이며, 웹 기능과 `시작하기` 버튼, 계정·API·데이터·흐름은 그대로.

## 2. Business · Studio 74페이지 분류 (A/B/C/D)

상세 표(페이지별 근거·계획·링크 보존): `docs/web-closure/PHASE03-CONTENT-PLAN.md`

| 분류 | 페이지 수 | 처리 |
|---|---|---|
| A 자체 제품·플랫폼·제휴 연결 | 11 | 허브 문구·CTA를 제휴·협업 중심으로 전환(적용) |
| B 역량 페이지 전환 | 30 | 역량 안내문 삽입, 가격·견적 제거 |
| C 개별 맞춤 제작·납품 서술 | 15 | URL 유지 + "정비 중" 안내문, 통합 계획만 기록 |
| D 중복·레거시·불일치 | 18 (stub 15 + 중복 3) | URL·리디렉션 스텁 유지, 통합 계획만 기록 |

- Business(Build·Automation·Solutions·Care·Insights·Tools)와 Studio(Partnerships·Digital Products·Projects·Contact) 체계 유지. 삭제·URL 변경 0건.
- 안내문 적용: 역량 안내 29 · 정비 중 안내 18 · 문의 목적 안내 1 = ko 기준 48페이지(×9언어).
- **링크 보존: 666파일 전부 작업 전(`dd8dd8f`) 대비 삭제된 href 0건 — PASS.**
- **문의 폼 보존: 기준 폼 18개, 태그·필드 name/value/type/required/action 변경 0건 — PASS.** 문의 CTA 라벨만 "제휴·도입(협업) 문의"로 변경.
- 새 제품·사업 정보는 만들지 않았고, 확정 정보가 필요한 부분은 "보류"로 기록(§9).

## 3. 다국어 정리

| 언어 | 상태 |
|---|---|
| ko, en (기준) | 가격·견적·외주·납품·"프로젝트 문의" 표현을 규칙 기반으로 재작성/삭제. 이전 치환 방식의 비문(예: "협의이", "scope and a scope") 잔여 0건. 용어 스캔(안내문 제외): ko 472→**잔여 10페이지 11건**("…부터 시작합니다" 일반 문장, 본문의 맞춤 개발·제작 문장), en 787→**363**(일반 동사 deliver 285, custom product 서술 42, 기타 36) |
| ja, es, pt-br, fr, de, hi, id | 문장 단위 가격·견적 삭제 + CTA 정리(ja "見積もりを依頼", de "Angebot 발송 전" 등). 안내문은 **영어 대체**(`lang="en"`, `data-bm-untranslated`) — **번역 미검수 7언어 × 48페이지** |
| 남은 일반 용어 | es "entrega", ja "納品", de "Angebot"(일반 '제안' 의미 포함)은 산출물 전달/일반 제안 의미일 수 있어 확인 없이 삭제하지 않음 — NOT VERIFIED |

의미를 확장하지 않았고, 번역 대체 안내문은 ko/en 안내문의 직역 범위만 담는다.

## 4. 가격 QA (`qa-business-pricing`) 전·후

정책: 공개 가격이 없는 페이지는 `no-public-price`로 통과(단, 가격 문구 잔존·빈 가격 셸 검사), 가격을 표시하는 페이지는 기존 검사(원천 `SERVICE_PRICING`, 표시값, 통화 KRW, 일관성) 전부 유지. 검사는 삭제·무조건 통과가 아니며 모든 페이지를 `price-shown`/`no-public-price`로 분류해 집계한다.

| 구분 | 이전 스크립트 | 새 스크립트 |
|---|---|---|
| 작업 전 트리(`dd8dd8f`, 가격 표시) | 0 error | 0 error · price-shown 207 |
| 현재 트리(가격 숨김) | **158 error** (expected canonical amount 112 / price 32 / custom label 14) | **0 error** · no-public-price 207 |

원인: 가격 숨김이 의도된 변경인데 검사가 "가격이 반드시 보여야 함"을 가정했기 때문. 새 스크립트가 무력화되지 않았음은 변이 시험으로 확인: 작업 전 트리에서 금액을 `₩999,999`로 바꾸면 FAIL(`unexpected price`), 현재 트리 페이지에 "Starting at 시작가"를 넣으면 FAIL(`price wording remains`).
출력: `qa-artifacts/phase03-recovery/pricing-*.txt`

## 5. 빌드·테스트

| 항목 | 결과 |
|---|---|
| 전체 빌드 `publish-site.mjs` (스크래치 복사본) | **PASS** (exit 0, 사이트맵 1288 URL, verify OK) |
| `check:fast` (빌드 내 + 단독 + `--publish-root`) | **PASS** (Pricing QA 0 error) |
| 저장소 ↔ 신규 빌드 비교 (666 페이지) | 의미 차이 0 (공백·기존 푸터 차이만) |
| livon·ongil·ox-month 테스트 86파일 | 개별 실행 기준 통과 2405 / 실패 6 (아래 분류) |

**실패 분류 — 신규 0건**

| 테스트 | 판정 | 근거 |
|---|---|---|
| DM-11 (data-manager) | 기존 | `b155c27^`에서도 재현 |
| ON-35 (onboarding) | 기존 | `b155c27^`에서도 재현 |
| RC-14 (release-candidate) | 기존 | 작업 전 `dd8dd8f`에서도 `stale 13 !== 0`(날짜 경과 기반) |
| RC-1 (release-candidate) | 기존·환경 | 요구 커밋 `12c1b4a6f`가 이 저장소 이력에 없음 |
| CV2-60 (community-v2) | 기존·환경 | 아래 참조 |
| A11Y-B7/B8/B9, RC 타임아웃 | 부하 flaky | 병렬 4개 실행 시 실패, **단독 재실행 시 accessibility 76/76 PASS**, RC는 RC-1·RC-14만 실패 |

**CV2-60 판단**: "LIVON Community V2" 커밋 `d0c93dd`가 이 저장소의 **루트 커밋**(부모 없음, 전체 사이트를 포함)이라 `d0c93dd^`를 계산할 수 없고, 루트 커밋은 정의상 `livon/` 밖 파일도 포함한다. 이력 구성(환경) 문제이며 코드 회귀가 아니다. 테스트는 **수정하지 않았다**(검증 범위 유지, 기대치 하향 없음). 대신 같은 의도를 독립 검증: main 대비 ongil·shareon(서버)·server·api·livon 변경 0건(§1). 미커밋 작업이 있을 때는 test가 pending 파일도 포함하므로 추가로 실패한다.

## 6. CSS · 접근성 검증

방법: 자체 작성 computed-style 대비 스크립트(axe-core는 npm 차단으로 사용 불가), 라이트/다크 × 1440/390.

| 항목 | 결과 |
|---|---|
| 근본 원인 발견 | `--bp-*` 토큰의 다크 값이 `.rs-page`에만 있어 `.bp-page`(Business·Studio 필라 페이지)가 다크에서 라이트 잉크 유지 → 흰 바탕 섹션에 흰 글씨. `business-pillar.css`에 `.bp-page` 다크 토큰 + 하드코딩 흰 섹션 다크 대응 추가 |
| `.is-on` 데모 항목 | 다크에서 ink 배경이 밝아지는데 자식 글자가 흰색 고정 → `business-service.css`에 다크 전용 글자색 규칙(66개 선택자) |
| 문의 페이지 라이트 | 소형 글자 대비 4.5:1로 상향(`business-page.css`, `business/inquiry-success.css` 토큰) |
| 안내문 `.bm-notice` | 라이트·다크 모두 AA, 320/390/768/1440 가로 스크롤·잘림 0 (48 조합 PASS) |
| 최종 대비 스캔 (대화형 텍스트, WCAG AA 4.5:1 / 큰 글자 3:1) | **ko 다크** 1440+390: 118 page-viewport 중 16개에서 66건 미달 — 전부 `aria-hidden` 장식, 실제 텍스트 미달 **0**. **ko 라이트** 1440+390: 34개에서 109건 — 전부 `aria-hidden` 장식, 실제 **0**. **en 다크** 1440: 59 중 15개 — 전부 장식, 실제 **0**. (수정 전 ko 다크 70 page-viewport 실패.) 미검사: ja·es·pt-br·fr·de·hi·id 대비(레이아웃·CSS 동일, 개별 스캔 NOT RUN), en 라이트·모바일 |
| 기준 미달로 남은 항목 | 모두 `aria-hidden` 장식(유령 숫자 `bp-proc__n`·`bs-flow-stage-grid__n` 등, 외곽선 워터마크 `bp-mark__line`, 모형 UI 라벨). 비율이 1.0~3.6으로 WCAG 기준 **미달이 맞고**, 장식 예외로 분류했을 뿐이다. 보조기기에 노출되지 않는 순수 장식으로 분류(WCAG 예외 해석 — 사람 검토 필요) |
| 캐시 버전 | `business-pillar.css`, `business-service.css`, `business-page.css`, `inquiry-success.css` → `?v=20261017dark1` (HTML 및 생성 스크립트 동기화), 신규 `business-model-notice.css`는 `publish-site.mjs` 화이트리스트에 추가(누락 버그 발견·수정) |
| 네비게이션 회귀 (1024px 드로어, 키보드, 터치, hover, 모바일 320/390/768) | **PASS** — 매트릭스 84항목 이슈 0, hover/click/Esc/Home/End/Tab/터치/리사이즈 시나리오 PASS, 페이지 오류 0 (CSS 변경 전후 영향 없는 영역; 최종 색상 CSS 이후 재실행하지 않음 — 네비 CSS 미변경) |
| Safari / 실기기 / 스크린리더 | **NOT RUN** |

## 7. 원본·브랜치 보존

§1 참조. 이번 단계의 모든 변경은 `work/phase03-content-recovery`의 로컬 커밋이며 다른 브랜치·원격·백업은 변경하지 않았다.

## 8. 운영 배포 전 남은 차단 요소

1. **push / PR / main 병합 / 배포 승인 없음** (사용자 승인 필요).
2. 빌드 파이프라인이 일부 허브 페이지(언어별 10개)에서 **푸터 링크 세트를 구버전(BabyLog·PetLog·My World·ShareOn·Business Hub)으로 재생성**한다. 작업 전(`dd8dd8f`) 빌드에서도 동일하게 재현되는 기존 문제 — `publish-site` 실행 시 커밋된 푸터가 덮어써진다. 생성기 템플릿 수정 필요.
3. 7개 언어 안내문 번역 미검수(영어 대체), 일부 언어의 일반 용어(납품/entrega/Angebot) 검수.
4. C·D 페이지의 실제 통합·리디렉션(대체 콘텐츠 확정 후), A/B 페이지의 자체 상품 본문 재작성(상품 정보 확정 필요).
5. `Service` JSON-LD(provider=Newon, Worldwide)가 남은 페이지의 SEO 스키마 조정 — 보류.
6. B 페이지 본문 일부의 "맞춤 웹/앱 설계·구축" 문장 재작성 — 보류(안내문으로 방향 명시).
7. 기존 실패 테스트(DM-11, ON-35, RC-14, RC-1, CV2-60)의 원인 정리(데이터 날짜, 저장소 이력).
8. Safari·실기기·스크린리더 검증, 장식 요소 대비 예외의 사람 검토.

## 9. 보류(임의 작성하지 않은 항목)

자체 자동화 상품·솔루션 목록, White Label Base 시스템 제품명, 파트너십 범위, 대체 통합 문구, 7개 언어 번역문 — 모두 확정 정보 필요.

## 부록: 이번 단계 변경 요약

- 신규: `scripts/business-model-pages.mjs`(74페이지 분류표), `scripts/business-model-reframe.mjs`(안내문·허브 문구·CTA, 멱등), `business-model-notice.css`, `docs/web-closure/PHASE03-CONTENT-PLAN.md`, `qa-artifacts/phase03-recovery/*`
- 수정: `scripts/business-model-sanitize.mjs`, `scripts/qa-business-pricing.mjs`, `scripts/build-i18n.mjs`(reframe 단계), `scripts/publish-site.mjs`, 렌더 스크립트·템플릿의 CSS 버전, CSS 4종, Business·Studio 666 페이지
