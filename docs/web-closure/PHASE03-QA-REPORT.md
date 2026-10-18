# NEWON BUSINESS HUB PHASE 03 FINAL QA REPORT

작성일: 2026-10-17 · 브랜치 `work/phase03-qa` (로컬 전용) · push / main merge / 운영 배포: **수행하지 않음**

> PHASE 02(`b155c27`, Business·Studio 별도 메뉴 순서)와 PHASE 03(`dd8dd8f`, Business Hub 통합)이 함께 전달되었습니다.
> Business Hub 통합이 이후 승인된 기준이므로 **PHASE 03을 기준 보고서**로 하고, PHASE 02 요구 항목은 각 절과 부록에 포함했습니다.
> 상태 표기: PASS / FAIL / SKIP / NOT RUN / NOT VERIFIED

## 1. Git 기준선과 원본 보존

| 브랜치 | 커밋 | 상태 |
|---|---|---|
| `main` | `70a816a` (= origin/main) | 변경 없음 |
| `work/info-only-app-first` | `b155c27` | 변경 없음 (PHASE 02 기준) |
| `work/business-hub-integration` | `dd8dd8f` | 변경 없음 (PHASE 03 기준) |
| `work/phase03-qa` (신규, 현재) | `336c32d` (dd8dd8f 위 3커밋) | 이번 단계 로컬 검증 브랜치 |

- reset / clean / 강제 checkout / 일괄 삭제를 사용하지 않았습니다. stash 0건, 기존 `_restore_tmp`, `_publish`, 백업, 로그 보존.
- 앱 저장소, 운영 API·DB, 사용자 데이터, 기존 백업은 건드리지 않았습니다. `livon/`, `ongil-start/`, `api/`, `admin/`, `server/` 아래 변경 0건 (`git diff --name-only b155c27^ HEAD -- …` 결과 없음).
- 이번 단계 커밋 3건: 네비게이션 UX·문구 정리기(`3d2e0b7`), 루트 `index.html` 버전 갱신(`1aaaf40`), 접근성 대비·다크 테마(`336c32d`).

## 2. 메뉴 UX 개선

구조 유지: Apps · AI · BabyLog · PetLog · My World · ShareOn · LivOn · Ongil · Business Hub · Company, Business Hub 안에 Business / Studio 두 그룹.

| 항목 | 결과 |
|---|---|
| hover 후 화살표 클릭 시 닫힘 (AI 메뉴 포함, 기존 결함) | **수정**. 공통 `site-chrome.js`에 hover / pinned 모드 도입. 화살표 클릭은 hover로 열린 메뉴를 고정(pin)하고, 다시 클릭하면 닫힘 — PASS |
| Enter / Space / ArrowDown / Esc / Home / End / Tab | PASS (Esc 시 트리거로 포커스 복귀, Shift+Tab 복귀, 패널 끝 Tab 시 닫힘) |
| 외부 클릭, hover 이탈 | PASS |
| 터치(1366px 터치 컨텍스트) 탭 열림/외부 탭 닫힘 | PASS |
| 화면 크기 변경 | PASS (1440→1000 드롭다운 닫힘·햄버거 표시, 드로어 열린 채 1440 복귀 시 닫힘) |
| **1024px: 가로 스크롤 vs 접힘 메뉴** | **접힘(드로어) 방식 채택**. 가로 스크롤 바는 키보드·스크린리더에서 항목이 화면 밖에 숨고, 10개 상위 메뉴가 9개 언어에서 1260px 미만이면 넘침(de/fr/es/id/pt-br는 1441px에서도 넘침 → 글자 크기 고정 규칙으로 해결). 데스크톱 바 전환점 1280px, 그 미만은 드로어 |
| ARIA | 디스클로저 패턴: 트리거 `aria-expanded` / `aria-controls` / 이름("<메뉴> 하위 메뉴"), 패널 `role="region"`, `menu/menuitem` 역할 제거 |

1024px 캡처(닫힘/드로어 열림) 2장을 실제로 열어 확인했습니다 (가로 넘침 없음, 로고·언어·테마·햄버거 정상, 드로어에 10개 항목과 "제휴·도입 문의" CTA).

## 3. Business·Studio 문구 정리 결과

원칙: Business = 자체 자동화 제품·비즈니스 솔루션·판매자 도구·기업용 제품·파트너십 / Studio = 자체 디지털 상품·핵심 플랫폼 연계 프로젝트·파트너십. **임의의 가격·수수료·일정을 만들지 않았고, 문의 페이지·폼·데이터·URL은 삭제하지 않았습니다.**

적용 방식: `scripts/business-model-sanitize.mjs` (멱등, `build-i18n.mjs`에 연결되어 빌드마다 적용; 9개 언어 `business/`, `studio/` 전체).

| 조치 | 내용 |
|---|---|
| 가격·기간 UI 숨김 | 시작가/PRICE/STARTING AT 행, 예상 기간/TIMELINE 행, 가격 패널·"시작가와 기본 범위" 섹션, `bp-explore__price`, 견적 산정(bp-quote)·가격(bp-pricing) 섹션, 가격·견적·기간을 말하는 FAQ, 메타 설명 속 시작가/기간, 본문 속 시작가·금액 문장 |
| CTA | "견적 문의→/제작 문의→/웹 프로젝트 문의→/프로젝트 상담하기→" → "문의하기→" (9개 언어 각각의 대응 문구) |
| 용어 | ko: 견적→협의, 외주→외부 개발, 납품→제공, 의뢰→문의 / en: quote→scope, outsourcing→external development |
| 보존 | 문의 폼, 문의 URL·쿼리, 예산 구간 선택지(방문자 입력값 "₩100만 이하" 등: 문의 데이터이므로 유지) |

잔여 용어 조사 (본문 기준, 정리 후): ko 0건 / en 0건 / ja 23(14쪽) / pt-br 16 / de 14 / fr 11 / hi 8 / id 5 / es 166(대부분 일반어 "entrega" 포함 추정). **ko·en 외 7개 언어의 견적·외주 표현은 번역 확정 없이 바꾸지 않아 번역 백로그로 남깁니다.**

**⚠ 해소되지 않은 개념 충돌 (사용자 결정 필요):** Business·Studio 상세 74쪽(ko 기준)은 여전히 "맞춤 제작·구축·BUILD·White Label·Custom Product"처럼 서비스 카탈로그 서술입니다. 가격·견적 UI와 외주식 어휘는 제거했지만, 페이지의 본질(고객별 제작 서비스 설명)은 확정된 제품 문구가 없어 다시 쓰지 않았습니다. 페이지별로 (a) 역량 소개로 유지 (b) noindex/비공개 (c) 제품 페이지로 재작성 중 선택이 필요합니다.

## 4. Business Hub 하위 페이지 검증

13개 대상 + 앱 소개 페이지 × 9개 언어 = 누락 0, `<title>`·description·canonical 전부 존재, 내부 링크 깨짐 0, `<h1>` 1개 — PASS (스크립트 `qa/pages.py`).

- `business-hub/`, `business/seller-center/`, `business/partners/`: 소개·사업 정보·제휴·문의 목적에 부합. 모두 "이 웹사이트는 소개와 안내만 제공합니다 (로그인, 서비스 이용, 예약, 거래, 결제, 판매자 관리 없음)" 고지 포함.
- **Seller Center**: "현재 웹사이트에서는 판매자 계정, 상품 등록, 거래, 결제, 정산을 제공하지 않습니다." 수수료·가격·조건은 확정된 것이 없고 문의 후 개별 협의로 표기 — PASS.
- `business/`, `business/automation/`, `tools/`, `ai/enterprise/`, `resources/insights/`, `studio/`, `studio/partnerships/`, `studio/digital/`, `studio/projects/`, `studio/contact/`: 존재·메타·링크 PASS. 위 3절의 개념 충돌은 `business/`·`studio/*` 하위에 해당.

## 5. 변경 파일 범위 분석

| 기준 | 총 파일 | 메뉴·푸터(+CSS 버전)만 변경 HTML | 본문 변경 HTML | 신규 페이지 | 소스 | 번역(locales) | 생성(sitemap) |
|---|---|---|---|---|---|---|---|
| `b155c27`..HEAD | 1,371 | 875 | 432 | 30 | 24 | 9 | 1 |
| `dd8dd8f`..HEAD (이번 단계) | 1,228 | 766 | 432 | 0 | 21 | 9 | 0 |

- 432개 본문 변경은 **모두 `{언어}/business|studio/` 아래**이며 3절 문구 정리기의 의도된 결과입니다. 그 밖의 HTML 본문은 자동 비교(`qa/scope.py`: 헤더·푸터·`?v=` 제거 후 비교)에서 동일합니다. 삭제 파일 0.
- **불필요한 빌드 차이 원인**: 전체 빌드는 번역 캐시 없이 페이지를 재생성하므로 ko·en 이외 7개 언어에서 번역이 영어로 되돌아갑니다(`apply-translate-cache` "still missing ~3,250/locale"). 그래서 빌드 후 변경 HTML마다 커밋된 본문을 복원하고 새 헤더/푸터·버전만 반영하는 절차(`qa/finish.py`)를 사용했습니다. 템플릿·`admin/data.json`·locales·`_sp.*` 빌드 드리프트도 복원했습니다.
- 루트 `index.html` 변경은 nav 에셋 버전 갱신(72줄)뿐입니다.
- 정리기를 빌드에 연결했으므로, 번역 캐시 없는 전체 재빌드 후에는 본문 복원 절차를 먼저 적용하세요.

## 6. 다국어 검증

- 9개 언어 메뉴: `nav.*` 276개 키가 9개 언어에 모두 존재 (누락 0).
- **번역 아님(영어 문구가 그대로인 항목)**: ja 74 / es 73 / pt-br 74 / fr 80 / de 81 / hi 78 / id 78개 `nav.*` 키가 영어와 동일. 이는 번역 완료가 아니라 영어 대체입니다 (목록: `qa/nav-en-fallback-keys.json`, 대표: `nav.bizInternalSystem`, `nav.megaBuildDesc`, `nav.studioMenuLead`, `nav.aiMenuDesc`, `nav.businessInquiryCta` …).
- 페이지 본문 영어 동일 비율(문장 단위 휴리스틱, ja·es·pt-br·fr·de·hi·id): 

| 페이지 | 영어 동일 |
|---|---|
| business-hub, seller-center, partners, studio/projects, tools, babylog, petlog, myworld, shareon, about | 100% (신규 소개 페이지·Hub 전부 영어 대체) |
| ai/enterprise | 95–98% |
| studio, studio/partnerships, studio/contact | 83–92% |
| business | 68–82% |
| lifestage, ongil | es·pt-br·fr·de·id 9–29% / ja·hi 38–93% |
| business/automation, studio/digital | 6–38% |

- **번역 우선순위**: (1) 메뉴 `bizHub*`, `bh*`, `six*` + 하위 메뉴 설명, "제휴·도입 문의" CTA (2) business-hub·seller-center·partners·6개 앱 소개 페이지의 "웹은 안내만 제공/출시 준비 중" 고지문 (3) business·studio 허브 본문 (4) 상세 페이지의 견적·외주 잔여 표현(3절) — 사업 문구는 의미 확정 후 번역합니다.
- 언어 전환: ko→en/ja/es/pt-br/fr/de/hi/id 8개 모두 같은 경로로 이동 (business-hub, seller-center) — PASS.

## 7. PC·태블릿·모바일 QA / 접근성

실행: Chromium(Playwright). 14페이지 × 6뷰포트(1440/1280/1024/768/390/320) = 84건.

| 항목 | 결과 |
|---|---|
| 가로 넘침(페이지·메뉴 바) | PASS 0건 |
| 1280↑ 바 표시 / 1280↓ 햄버거 | PASS |
| 드롭다운 위치(뷰포트 내) | PASS |
| 이미지 로딩, h1, canonical, title, JS 오류, HTTP≥400(외부 폰트 제외) | PASS 0건 |
| 버튼·링크 이름 / 트리거 `aria-expanded` `aria-controls` | PASS |
| 키보드 초점 표시(첫 14개 탭 정지) | PASS 14/14 |
| 모바일 터치 | PASS (터치 컨텍스트 탭) |
| **색 대비(WCAG AA 계산, 8쪽×라이트 1440/390 + 다크 1440)** | 발견 후 **수정**: 라이트 `--bp-faint #a1a1a6`(2.57:1)·`--bz-soft #8a8a8a`(3.45:1)·푸터 회색 → `#6e6e73`(5.07:1). 새 소개·Hub 페이지는 다크 테마에서 흰 카드에 밝은 글자(글자 안 보임)였던 결함 수정. 결과 라이트 0건, 다크 0건. 이미지·그라디언트 위 텍스트 4건(ongil)은 **NOT VERIFIED** |
| 404 | 로컬 `http.server`는 기본 404 응답(404.html 미적용)이라 **NOT VERIFIED**; `404.html` 파일 존재 확인, 존재하지 않는 경로 HTTP 404 확인 |
| 스크린리더(NVDA/VoiceOver) 실제 낭독 | **NOT RUN** |
| Safari / iOS / Android 실기기 | **NOT RUN** |
| 외부 도구(axe-core) | **NOT RUN** (npm 접근 불가, 자체 대비·ARIA 점검으로 대체) |

## 8. 전체 테스트 결과

| 항목 | 결과 |
|---|---|
| 전체 빌드 `node scripts/publish-site.mjs` (복사본에서 실행) | PASS (sitemap 1,288 URL, 404-human 검증 OK, 완료까지 약 2분) |
| `check:fast` | **FAIL — 1건**: `qa-business-pricing` "pricing SoT vs rendered HTML drift" 158건 전부 "expected canonical amount ₩…". **원인: 3절에서 가격을 의도적으로 숨겼기 때문**(이 검사는 가격이 표시되어야 통과). 기대값을 낮춰 통과시키지 않았습니다. 가격 비공개 방침이 확정되면 이 검사를 해당 정책에 맞게 바꾸는 별도 승인이 필요합니다. 다른 모든 fast-check 항목은 통과 |
| `tests/livon` 50개 파일 (파일별 240초 제한·4병렬, 로그 보관) | 47파일 PASS · 3파일 FAIL (원 실행 subtests 1,243 pass / 4 fail, 그중 LS2-10은 실제 저장소에서 PASS로 재확인) |
| 　DM-11 `data-manager` | FAIL — **기준 커밋 `b155c27^`에서도 동일 재현**(사전 존재, 이번 변경과 무관) |
| 　ON-35 `onboarding` | FAIL — 부동소수점(`1.9999999999999998 !== 2`), **기준 커밋에서도 동일 재현** |
| 　CV2-60 `community-v2` | FAIL — 저장소 최초 커밋 `d0c93dd`가 부모 없는 루트 커밋이라 `git diff-tree d0c93dd^`가 실패(히스토리 의존). 사전 존재, **그 내용 자체는 NOT VERIFIED** |
| 　LS2-10 `life-stage-v2` | 복사본(.git 없음)에서 FAIL → **실제 저장소에서 PASS** (git diff 기반 검사) |
| `apps/ox-month` 웹 테스트 | PASS 38/38 |
| `ingest/test` | NOT VERIFIED (실행 시 0건 수집) |
| 실제 `tests/livon` 단일 실행 | **완료되지 않았던 원인**: 50파일 누적 실행 시간 약 1,300초(accessibility 199s, life-stage-v2 161s, saved-v2 142s 등)에 Chromium 기반 테스트가 샌드박스 프록시가 막는 구글 서비스로 수백 건의 연결 재시도(실행 중 570건 거부)를 해 더 느려짐 → 단일 명령은 수십 분. 테스트 자체의 무한 대기는 아님 |

이전에 통과했던 결과(PHASE 01~03 빌드·네비 QA)는 변경하지 않았고, 이번에 새로 PASS 항목이 추가되었습니다.

## 9. 남은 결함

1. (결정 필요) Business·Studio 상세 74쪽의 "고객별 맞춤 제작" 서술 본질 — 3절.
2. (결정 필요) `qa-business-pricing` FAIL — 가격 비공개 정책과 기존 가격 정합성 검사 충돌.
3. ko·en 외 7개 언어: 영어 대체 문구, 견적·외주 잔여 표현 — 6절·3절 백로그.
4. 다른 `bp-*` 필러 페이지(예: business/automation, business/web)는 다크 테마에서 대비 미달(사전 존재). 이번에는 `business-intro.css`를 쓰는 소개·Hub 페이지만 수정했습니다.
5. 변경한 CSS(`business-pillar.css`, `business-page.css`, `business-hub.css`, `newon-studio.css`, `hub-pages.css`)는 `?v=` 캐시 버전을 올리지 않았습니다. 배포 시 캐시 무효화 필요.
6. 앱 스토어 링크: BabyLog·PetLog·My World는 저장소 전체(포트폴리오 데이터 등)의 링크와 24곳 일치. 실제 스토어 응답은 프록시 차단으로 **NOT VERIFIED**. ShareOn·LivOn·Ongil은 "출시 준비 중"(링크 없음). BabyLog/PetLog 소개의 기능 서술이 실제 앱 구현과 일치하는지는 앱 저장소 접근 금지 범위라 **NOT VERIFIED**.
7. `business/automation/workflow` pt-br·id·hi의 `#escopo`, `#ruang lingkup`, `#स्कोप` 앵커가 대상 id 없음(번역된 앵커; 사전 존재로 추정).
8. 로컬 서버 404 페이지, 실제 Safari·실기기, 스크린리더, axe-core는 미실행.

## 10. 원격 push 가능 여부

**기술적으로는 가능하나 승인 전이라 수행하지 않았고, 권장하지 않습니다 — 아래 결정(9-1, 9-2)과 `check:fast` 통과 후 승인 요청.** 이 환경의 원격은 읽기 전용이기도 합니다. 로컬에서 push·merge·deploy 명령을 실행하지 않았습니다.

## 11. 운영 배포 가능 여부

**불가(NO).** 차단 요인: (1) `check:fast` FAIL (2) Business·Studio 모델 결정 미완 (3) 7개 언어 영어 대체 (4) Safari·실기기·스크린리더 NOT RUN (5) 캐시 버전 (6) 스토어 링크 실응답 NOT VERIFIED (7) LIVON·ONGIL 웹 "시작하기" 제거 조건(앱 동등성, 실사용자 데이터, 데이터 이전 검증, 계정·API 의존성, 앱 출시, 롤백 계획, 별도 승인)이 미충족이라 웹 기능은 그대로 유지.

---

## 부록 A. PHASE 02 요구 항목 대응

1. **변경 파일 분류**: 5절 표 (소스 24 / 신규 소개·Hub 페이지 30 / 번역 9 / 빌드·자동생성(sitemap) 1 / 메뉴·푸터 875 / 본문 변경 432(전부 business·studio) / 예기치 않은 변경 0).
2. **6개 앱 소개**: BabyLog·PetLog·My World는 App Store·Google Play 링크 + "소개·안내만 제공" 고지, ShareOn은 "출시 준비 중", LivOn·Ongil은 "시작하기(앱 출시 전까지 임시 제공)"와 "출시 준비 중" 병기. 소개 페이지에 로그인·기록·거래·결제·커뮤니티 기능 없음. 결제·수수료는 "출시 전 확정 후 공지"로만 표기(ShareOn), 구독료·수수료·매출은 표시하지 않음(Ongil).
3. **LivOn·Ongil 웹 기능**: `/livon/`, `/ongil-start/` 시작하기 진입과 "앱 출시 전까지 임시 제공" 안내 유지. API·DB·공통 코드·사용자 데이터 변경 0. 제거 조건 목록은 `docs/web-closure/PLAN.md`.
4. **다국어**: 6절. **브라우저 QA(1440/1024/390)**: 7절. **테스트 상태 분류**: 8절.
