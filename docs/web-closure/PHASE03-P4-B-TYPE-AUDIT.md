# NEWON — Phase 03 P4: A/B 유형 페이지 "외주·맞춤 개발 제공" 오해 문구 전수 조사

대상: A 11 + B 30 페이지(ko·en 본문 전수, 안내문 제외). 나머지 7개 언어는 영어 본문을 그대로 쓰는 페이지에는 영어 규칙을 적용했고, 번역된 일부 문장은 개별 확인하지 않았다(NOT VERIFIED).
조사 방법: 문장 단위로 분리해 "우리가 설계·구축·제공합니다", "귀사/your project", "custom/맞춤", "계약·범위·산출물", "hire/의뢰" 계열 패턴을 모두 수집(`qa-artifacts/phase03-recovery/b-type-audit-remaining.json`)하고 분류했다.

## 1. 이번 단계에서 수정한 것 (의미를 새로 만들지 않는 중립화·삭제만)

| 변경 | 건수(ko+en, A·B 페이지) |
|---|---|
| "프로젝트 범위/계약된 프로젝트 범위/계약 전에" → "협업 범위/협의된 협업 범위/협의 단계에서" | ko 59 |
| "project scope / before contract" → "collaboration scope / during discussion" | en 31 |
| "START A PROJECT" → "GET IN TOUCH" | en 21 |
| "Project consultation →" → "Partnership inquiry →" | en 4 |
| "프로젝트 완료 후 제공되는 것 / What you receive when the project completes" → "제공되는 산출물 예시 / Typical outputs" | 해당 제목 전부 |
| 고객 구축 프로젝트 서술 문장 삭제("A client project that applies AI…", "this is a client implementation project", "고객사의 기존 도구…구축 프로젝트입니다") | 3 |
| "…계속 맡기고 싶은 팀" 항목 삭제 | 1 |
| 고용·위탁을 묻는 FAQ 삭제("Can I hire design only?", "개발도 함께 맡길 수 있나요?" 등) | 6 |
| 이전 단계(`business-model-sanitize`)의 가격·견적·소요 기간 제거 | 유지 |

이 변경은 `scripts/business-model-reframe.mjs`의 `cleanBType`(A·B 페이지 한정, 멱등)로 재현된다. 링크·폼 구조는 바꾸지 않았다.

## 2. 아직 남은 문구 (소유자 결정 필요 — 임의로 바꾸지 않음)

| 분류 | ko | en | 설명 |
|---|---|---|---|
| "우리가 설계·구축·제공합니다" 능력 서술 | 180 | 50 | 역량 설명이지만 문장 주어가 "Newon이 대신 만들어 줌"으로 읽힐 수 있음 |
| 범위·산출물·계약 | 24 | 15 | "Included / Deliverables / scope" 구조 자체가 의뢰 서비스 스펙 형식 |
| 귀사·your project 같은 2인칭 | 3 | 16 | 방문자 프로젝트를 전제 |
| custom / 맞춤 제공 | 2 | 1 | Solutions·Build 계열 |
| 기타 | 3 | 31 | 일반 서술(대부분 무해, 개별 확인 필요) |

문장이 많은 페이지(합계): `studio/digital/web-design` 32, `studio/digital/app-ui-ux` 32, `studio/digital/landing` 20, `studio/content/campaign` 20, `studio/content/visual` 19, `studio/digital/product-design` 15, `business/ai-automation` 14, `business/solutions` 14, `business/inquiry` 13, `studio/brand/logo` 13, `business/internal-tools` 12, `studio/digital` 12.

예시(en): 
- business/inquiry: 01 BUSINESS Explore Business See how we build products, automate work, research markets, and collaborate.
- business/inquiry: Partnership We create new services and business opportunities with brands and companies.
- business/ai-automation: Then we design classify, draft, summarize, and routing flows — with human-in-the-loop review and guardrails — 
- business/automation/workflow: Depending on scope, we deliver what you need from the list below.
- business/automation: 03 → SOLUTIONS We don’t force your project into a package.
- business/ai-automation: Scale Docs Phase 2 PROJECT INPUTS We combine the inputs your project needs.
- business/solutions: Custom software around requirements, permissions, data, and multiple system links.

### 소유자 결정이 필요한 이유와 선택지

1. **본문을 "역량 소개"로 다시 쓰려면** 어떤 역량·제품을 공식적으로 공개할지 확정되어야 한다(White Label Base 시스템, 자동화 상품, Solutions 구성은 현재 확정 정보 없음). 확정 없이 문장을 바꾸면 새 상품을 만드는 셈이므로 보류했다.
2. 선택지 A: 현재 안내문(역량 소개·제휴 문의 검토)으로 방향을 명시한 채 유지 — 운영 위험은 낮지만 본문 문구는 서비스 대행 형식.
3. 선택지 B: 해당 페이지를 허브로 통합하고 URL은 리디렉션 — 별도 승인 필요(이번 단계 금지).
4. 선택지 C: 확정 상품이 있는 페이지부터 본문 재작성(White Label, Automation 우선 후보).

## 3. 확정된 NEWON 자체 제품·플랫폼만 설명하는지 점검

- 확정 제품: BABYLOG, PETLOG, MYWORLD, SHAREON, LIVON, ONGIL(+사이트 허브), Business 하위 영역(Automation, Seller Center, Business Tools, Enterprise, Insights, Partners), Studio 4영역(Partnerships, Digital Products, Projects, Contact).
- A·B 페이지 영문 본문에서 `Newon <이름>` 형태 제품명 목록을 추출해 확인: 새 제품명을 발명한 문구는 **없음**. 발견된 `Newon Naming/Campaign/Identity/Logo Design/Web Design/App UI/Landing Page/Product Design/Visual Content`는 디자인 역량(산출물 이름)이고 `Newon AI`는 사이트의 AI 메뉴를 가리킨다.
- White Label / Automation / Solutions의 구체 상품·가격·구성은 이번 단계에서 새로 쓰지 않았다.
