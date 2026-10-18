# NEWON — Business · Studio 74페이지 분류 및 재구성 계획 (PHASE 03 CONTENT ALIGNMENT)

작성 기준: 브랜치 `work/phase03-content-recovery`. 사업 기준(확정): **Business = 자체 자동화 상품·업무 솔루션·판매자 도구·기업용 제품·제휴 / Studio = 자체 디지털 제품·핵심 플랫폼 연계 프로젝트·제휴**. 개별 고객의 개발·제작·외주·납품 사업이 아니다.

분류 기준: A = Newon 자체 제품·솔루션·플랫폼과 연결 가능 · B = 기술·디자인·운영 역량 설명 페이지로 전환 가능 · C = 개별 맞춤 제작·외주·납품만 설명 · D = 다른 영역과 중복되거나 실제 사업과 불일치.

**요약**: A 11 · B 30 · C 15 · D 18 · 합계 74 (ko 기준; 9개 언어 모두 동일 구조, 총 666개 파일)

## 처리 원칙

- **삭제·URL 변경 없음.** C·D 페이지는 그대로 유지하고, 상단에 안내문을 넣고 통합·리디렉션 **계획**만 기록한다. 실제 통합·리디렉션은 대체 문구/제품이 확정된 뒤 별도 승인 후 진행한다.
- **새 제품·사업 정보를 만들지 않았다.** 자체 제품으로 승격이 필요한 페이지(예: White Label, Automation 상품)는 "보류"로 표시했다.
- 모든 페이지에서 가격·견적·소요 기간 문구는 sanitizer(`scripts/business-model-sanitize.mjs`)가 제거하거나 "별도 협의/문의" 의미로 바꾼다. 전·후 의미 보존은 아래 "검증"에 기록.
- 안내문(`.bm-notice`)은 `scripts/business-model-reframe.mjs`가 삽입한다(멱등). ko/en은 번역문, 나머지 7개 언어는 영어 안내문을 `lang="en"` + `data-bm-untranslated`로 표시한다(번역 미검수).

안내문 문구:

| 종류 | ko | en |
|---|---|---|
| cap | 이 페이지는 Newon의 기술·디자인·운영 역량을 소개합니다. Newon은 개별 고객의 개발·제작 프로젝트를 수주하지 않으며, 협업은 제휴·도입 문의를 통해 검토합니다. | This page describes Newon's technology, design and operations capabilities. Newon does not take on custom development or production projects for individual clients; collaboration is reviewed through partnership and adoption inquiries. |
| legacy | 이 페이지는 사업 방향에 맞춰 정비 중입니다. Newon은 개별 고객의 맞춤 제작·외주·납품을 제공하지 않으며, 아래 내용은 기술·운영 역량을 설명하는 참고 자료입니다. 협업은 제휴·도입 문의를 통해 검토합니다. | This page is being reorganized to match our business direction. Newon does not offer custom production, outsourcing or delivery for individual clients; the content below is reference material on our technology and operations capabilities. Collaboration is reviewed through partnership and adoption inquiries. |
| inquiry | 문의는 제휴·도입·협업 목적으로 접수합니다. Newon은 개별 고객의 개발·제작 프로젝트를 수주하지 않습니다. | Inquiries are accepted for partnerships, adoption and collaboration. Newon does not take on custom development or production projects for individual clients. |

## 검증

- **링크 보존**: 666개 파일(74페이지 × 9언어) 전부 `dd8dd8f`(작업 전) 대비 **삭제된 href 0건** (`qa-artifacts/phase03-recovery/linkcheck-final.json`).
- **폼 보존**: 기준 시점의 폼 18개 — 폼 태그·필드 name/value/type/required/action 구조 **변경 0건**. 문의 폼 동작·카테고리 값 유지.
- **의미 보존**: 제거되는 것은 (1) 가격·견적·소요 기간 블록, (2) 해당 의미를 담은 단일 문장, (3) 가격 CTA 문구("견적 요청" → "문의"). 그 외 본문은 변경하지 않는다. 이전 단어 치환 방식에서 생긴 비문(예: "협의이", "scope and a scope")은 규칙 기반 재작성으로 교체했고 ko/en 잔여 0건을 확인했다.

## 페이지별 분류 (ko 경로 기준 · 다른 8개 언어도 동일 경로)

| # | 경로 | 제목 | 분류 | 유형 | 안내문 | 판단 근거 | 계획 | 링크 보존 |
|---|---|---|---|---|---|---|---|---|
| 1 | `/ko/business/` | Newon Business / 기업·소상공인 SaaS · AI | A | 허브 | 없음 | Newon 자체 제품·자동화 솔루션·제휴를 소개하는 허브 | 소개 문구의 '구축·제작' 표현을 '구현 역량 소개'로 전환(적용). 카드는 역량 페이지 링크로 유지 | 9/9 PASS |
| 2 | `/ko/business/partners/` | Partners | A | 허브 | 없음 | 제휴 유형과 진행 흐름 안내 | 변경 없음 | 9/9 PASS |
| 3 | `/ko/business/seller-center/` | Seller Center | A | 허브 | 없음 | 판매자 안내·제휴(웹 계정·거래 기능 없음 고지) | 변경 없음 | 9/9 PASS |
| 4 | `/ko/business/inquiry/` | 제휴·협업 문의 | B | 문의 | 문의 목적 안내 | 문의 폼(데이터·URL 보존 대상) | 폼·카테고리 값·URL 유지. 문의 목적(제휴·도입·협업) 안내만 추가 | 9/9 PASS |
| 5 | `/ko/business/inquiry/success/` | 문의 접수 | B | 시스템 | 없음 | 문의 접수 완료 화면 | 변경 없음 | 9/9 PASS |
| 6 | `/ko/business/automation/` | AUTOMATION | B | 허브 | 역량 안내 | 자동화 역량 허브 | 역량 안내 추가. 자체 자동화 상품이 확정되면 상품 소개로 승격(보류) | 9/9 PASS |
| 7 | `/ko/business/ai-automation/` | AI AUTOMATION | B | 상세 | 역량 안내 | AI 업무 자동화 역량(고객사 구축 프로젝트 서술 포함) | 역량 안내 추가. 고객사 구축 서술은 상품 확정 후 재작성(보류) | 9/9 PASS |
| 8 | `/ko/business/automation/workflow/` | Workflow Automation | B | 상세 | 역량 안내 | SaaS·업무 연결 자동화 역량 | 역량 안내 추가 | 9/9 PASS |
| 9 | `/ko/business/data-reporting/` | DATA &amp; REPORTING | B | 상세 | 역량 안내 | 데이터 수집·리포트 자동화 역량 | 역량 안내 추가 | 9/9 PASS |
| 10 | `/ko/business/internal-tools/` | INTERNAL TOOLS | B | 상세 | 역량 안내 | 내부 도구 구현 역량 | 역량 안내 추가 | 9/9 PASS |
| 11 | `/ko/business/booking/` | Booking &amp; Customer Management | C | 상세 | 정비 중 안내 | 예약·문의·고객 이력을 고객별로 새로 구축하는 서비스 | Automation 허브의 '예약·문의 자동화' 한 줄 역량으로 통합 후 리디렉션 후보. 대체 문구는 확정 필요(보류) | 9/9 PASS |
| 12 | `/ko/business/build/` | BUILD | B | 허브 | 역량 안내 | 제품 구현 역량 허브 | 역량 안내 추가. 하위 C 페이지의 통합 목적지 후보 | 9/9 PASS |
| 13 | `/ko/business/mvp/` | MVP 개발 | C | 상세 | 정비 중 안내 | 고객 아이디어를 MVP로 구축해 인도 | Build 허브 '구현 역량' 요약으로 통합, URL은 허브로 리디렉션 후보 | 9/9 PASS |
| 14 | `/ko/business/landing/` | LANDING PAGE | C | 상세 | 정비 중 안내 | 고객 제품용 랜딩페이지 제작 | Build 허브로 통합, 리디렉션 후보 | 9/9 PASS |
| 15 | `/ko/business/web/` | WEB DEVELOPMENT | C | 상세 | 정비 중 안내 | 고객 브랜드 웹사이트 제작 | Build 허브로 통합, 리디렉션 후보 | 9/9 PASS |
| 16 | `/ko/business/app/` | APP PROTOTYPE | C | 상세 | 정비 중 안내 | 고객 앱 프로토타입 제작 | Build 허브로 통합, 리디렉션 후보 | 9/9 PASS |
| 17 | `/ko/business/website-renewal/` | Website Renewal | C | 상세 | 정비 중 안내 | 고객 기존 웹사이트 리뉴얼 | Build 허브로 통합, 리디렉션 후보 | 9/9 PASS |
| 18 | `/ko/business/improvement/` | Web &amp; App Improvement | C | 상세 | 정비 중 안내 | 고객 웹·앱 부분 개선 | Care 허브로 통합, 리디렉션 후보 | 9/9 PASS |
| 19 | `/ko/business/care/` | CARE | B | 허브 | 역량 안내 | 운영·유지 관리 체계 허브 | 역량 안내 추가 | 9/9 PASS |
| 20 | `/ko/business/maintenance/` | Monthly Maintenance | C | 상세 | 정비 중 안내 | 고객 웹·앱 월간 유지보수 계약 | Care 허브로 통합, 리디렉션 후보 | 9/9 PASS |
| 21 | `/ko/business/post-launch/` | Post-launch Support | C | 상세 | 정비 중 안내 | 고객 제품 출시 직후 지원 | Care 허브로 통합, 리디렉션 후보 | 9/9 PASS |
| 22 | `/ko/business/solutions/` | SOLUTIONS | B | 허브 | 역량 안내 | 솔루션 구성 방식 허브 | 역량 안내 추가 | 9/9 PASS |
| 23 | `/ko/business/white-label/` | WHITE-LABEL | A | 상세 | 역량 안내 | 검증된 자체 시스템(Base)을 브랜드에 맞게 제공하는 제품형 모델 | Base 시스템의 실제 제품 목록 확인 후 자체 제품 소개로 재작성(보류). 그 전까지 역량 안내 표시 | 9/9 PASS |
| 24 | `/ko/business/custom-product/` | CUSTOM PRODUCT | C | 상세 | 정비 중 안내 | 문제에 맞춘 고객별 맞춤 제품 구축 | Solutions 허브로 통합, 리디렉션 후보 | 9/9 PASS |
| 25 | `/ko/business/internal-system/` | INTERNAL SYSTEM | C | 상세 | 정비 중 안내 | 고객사 내부 시스템 구축 | Solutions 허브로 통합, 리디렉션 후보 | 9/9 PASS |
| 26 | `/ko/business/product-launch/` | PRODUCT LAUNCH | C | 상세 | 정비 중 안내 | 고객 제품 출시 준비 프로젝트 | Solutions 허브로 통합, 리디렉션 후보 | 9/9 PASS |
| 27 | `/ko/business/research/` | 기획·진단 | D | 허브 | 정비 중 안내 | '기획·진단' 고객 서비스 프레임, resources/insights와 기능 중복 | resources/insights(Insights)로 통합·리디렉션 후보 | 9/9 PASS |
| 28 | `/ko/business/market-research/` | MARKET RESEARCH | B | 상세 | 역량 안내 | 시장 조사 방법론 | 역량 안내 추가. Insights 연계 | 9/9 PASS |
| 29 | `/ko/business/competitor-analysis/` | COMPETITOR ANALYSIS | B | 상세 | 역량 안내 | 경쟁 분석 방법론 | 역량 안내 추가. Insights 연계 | 9/9 PASS |
| 30 | `/ko/business/consumer-research/` | CONSUMER RESEARCH | B | 상세 | 역량 안내 | 소비자 조사 방법론 | 역량 안내 추가. Insights 연계 | 9/9 PASS |
| 31 | `/ko/business/trend-research/` | TREND RESEARCH | B | 상세 | 역량 안내 | 트렌드 조사 방법론 | 역량 안내 추가. Insights 연계 | 9/9 PASS |
| 32 | `/ko/business/ux-audit/` | UX AUDIT | B | 상세 | 역량 안내 | UX 진단 방법론 | 역량 안내 추가. Insights 연계 | 9/9 PASS |
| 33 | `/ko/business/design/` | Design &amp; Branding | D | 상세 | 정비 중 안내 | Studio Digital Products·Brand와 중복(디자인 서비스 설명) | Studio로 통합·리디렉션 후보 | 9/9 PASS |
| 34 | `/ko/business/creative/` | Newon Creative / Brand · Web · App · Con | D | 허브 | 정비 중 안내 | Studio Brand·Content와 중복 | Studio로 통합·리디렉션 후보 | 9/9 PASS |
| 35 | `/ko/business/collaboration/partnership/` | Newon 파트너십 / 비즈니스 협업 | A | 상세 | 없음 | Newon 제품·기술·브랜드와 기업의 협업 | 변경 없음 | 9/9 PASS |
| 36 | `/ko/business/collaboration/product-service/` | 앱·서비스 협업 | A | 상세 | 없음 | Newon 앱·서비스에 콘텐츠·기능·브랜드를 연결하는 협업 | 변경 없음 | 9/9 PASS |
| 37 | `/ko/business/collaboration/promotion/` | 광고·프로모션 | A | 상세 | 없음 | Newon 제품 경험에 연결되는 브랜드 프로모션 | 변경 없음 | 9/9 PASS |
| 38 | `/ko/business/collaboration/development/` | 개발 협업 | B | 상세 | 역량 안내 | 공동 제품 개발 협업 역량 | 역량 안내 추가. '디지털 제품 제작의 전 과정' 서술은 파트너십 범위 확정 후 재작성(보류) | 9/9 PASS |
| 39 | `/ko/studio/` | Newon Studio / 브랜드 · 웹 · 앱 제작 | A | 허브 | 없음 | 자체 디지털 제품·디자인 파트너십 허브 | 소개 문구·CTA를 제휴·협업 중심으로 전환(적용) | 9/9 PASS |
| 40 | `/ko/studio/partnerships/` | Partnerships | A | 허브 | 없음 | 브랜드·기업과 장기 협업 | 프로젝트 문구를 제휴·협업 문구로 전환(적용) | 9/9 PASS |
| 41 | `/ko/studio/projects/` | Projects | A | 허브 | 없음 | Newon이 직접 만들고 운영하는 제품 | 프로젝트 문의를 제휴·협업 문의로 전환(적용) | 9/9 PASS |
| 42 | `/ko/studio/contact/` | Contact | A | 허브 | 없음 | 제휴·협업 문의 진입 | CTA를 제휴·협업 문의로 전환(적용), 폼·URL 유지 | 9/9 PASS |
| 43 | `/ko/studio/digital/` | DIGITAL PRODUCTS | B | 허브 | 역량 안내 | 웹·앱 디자인 역량 허브(Design Only) | 역량 안내 추가. 자체 디지털 상품 콘텐츠는 확정 후 추가(보류) | 9/9 PASS |
| 44 | `/ko/studio/digital/web-design/` | Web Design | B | 상세 | 역량 안내 | 웹 디자인 접근법·기준 | 역량 안내 추가 | 9/9 PASS |
| 45 | `/ko/studio/digital/app-ui-ux/` | App UI/UX Design | B | 상세 | 역량 안내 | 앱 UI/UX 접근법·기준 | 역량 안내 추가 | 9/9 PASS |
| 46 | `/ko/studio/digital/landing/` | Landing Page Design | B | 상세 | 역량 안내 | 랜딩 디자인 접근법·기준 | 역량 안내 추가 | 9/9 PASS |
| 47 | `/ko/studio/digital/product-design/` | Product Design | B | 상세 | 역량 안내 | 제품 디자인 접근법·기준 | 역량 안내 추가 | 9/9 PASS |
| 48 | `/ko/studio/brand/` | BRAND | B | 허브 | 역량 안내 | 브랜드 디자인 역량 허브 | 역량 안내 추가 | 9/9 PASS |
| 49 | `/ko/studio/brand/identity/` | Identity | B | 상세 | 역량 안내 | 아이덴티티 설계 기준 | 역량 안내 추가 | 9/9 PASS |
| 50 | `/ko/studio/brand/logo/` | Logo Design | B | 상세 | 역량 안내 | 로고 설계 기준 | 역량 안내 추가 | 9/9 PASS |
| 51 | `/ko/studio/brand/naming/` | Naming | B | 상세 | 역량 안내 | 네이밍 기준 | 역량 안내 추가 | 9/9 PASS |
| 52 | `/ko/studio/brand/strategy/` | Brand Strategy | B | 상세 | 역량 안내 | 브랜드 전략 접근법 | 역량 안내 추가 | 9/9 PASS |
| 53 | `/ko/studio/content/` | CONTENT &amp; CAMPAIGN | B | 허브 | 역량 안내 | 콘텐츠·캠페인 역량 허브 | 역량 안내 추가 | 9/9 PASS |
| 54 | `/ko/studio/content/campaign/` | Campaign | B | 상세 | 역량 안내 | 캠페인 설계 기준 | 역량 안내 추가 | 9/9 PASS |
| 55 | `/ko/studio/content/social/` | Social Content | B | 상세 | 역량 안내 | 소셜 콘텐츠 구조 | 역량 안내 추가 | 9/9 PASS |
| 56 | `/ko/studio/content/visual/` | Visual Content | B | 상세 | 역량 안내 | 비주얼 콘텐츠 기준 | 역량 안내 추가 | 9/9 PASS |
| 57 | `/ko/studio/care/` | DESIGN CARE | C | 허브 | 정비 중 안내 | 고객 브랜드·화면의 월간 디자인 운영 계약 | Studio Partnerships로 통합, 리디렉션 후보 | 9/9 PASS |
| 58 | `/ko/studio/care/monthly-design/` | 월간 디자인 운영 | C | 상세 | 정비 중 안내 | 월 계약 디자인 지원 | Studio Partnerships로 통합, 리디렉션 후보 | 9/9 PASS |
| 59 | `/ko/studio/care/design-improvement/` | 기존 디자인 개선 | C | 상세 | 정비 중 안내 | 고객 기존 디자인 일회성 개선 | Studio Partnerships로 통합, 리디렉션 후보 | 9/9 PASS |
| 60 | `/ko/business/automation/data-reporting/` | → /business/data-reporting/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 61 | `/ko/business/automation/internal-tools/` | → /business/internal-tools/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 62 | `/ko/business/build/app/` | → /business/app/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 63 | `/ko/business/build/landing/` | → /business/landing/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 64 | `/ko/business/build/mvp/` | → /business/mvp/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 65 | `/ko/business/build/website/` | → /business/web/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 66 | `/ko/business/development/` | → /business/collaboration/development/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 67 | `/ko/business/partnership/` | → /business/collaboration/partnership/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 68 | `/ko/business/promotion/` | → /business/collaboration/promotion/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 69 | `/ko/business/service/` | → /business/collaboration/product-service/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 70 | `/ko/studio/ip/` | → /studio/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 71 | `/ko/studio/ip/character-lab/` | → /studio/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 72 | `/ko/studio/ip/digital-stickers/` | → /studio/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 73 | `/ko/studio/ip/experimental-ip/` | → /studio/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |
| 74 | `/ko/studio/ip/newon-character/` | → /studio/ | D | 리디렉션 스텁 | 없음 | 레거시 URL 별칭 | 기존 URL 보존용 별칭(리디렉션 스텁). 변경하지 않습니다. | 9/9 PASS |

## C·D 대체 콘텐츠 / 통합 계획 (적용 전 승인 필요)

| 대상(C·D) | 통합 목적지 | 필요한 확정 정보(없으면 보류) |
|---|---|---|
| business/mvp, landing, web, app, website-renewal | business/build (구현 역량 허브) | Newon이 공개할 구현 역량 설명 문구 |
| business/improvement, maintenance, post-launch | business/care (운영·유지 체계) | 자체 서비스 운영 지원 범위 |
| business/custom-product, internal-system, product-launch | business/solutions | 자체 솔루션 목록(제품명·범위) |
| business/booking | business/automation | 자체 예약·문의 자동화 상품 여부 |
| business/research | resources/insights | Insights 연계 구조 |
| business/design, business/creative | studio/ | Studio 디자인 역량 문구 |
| studio/care, care/monthly-design, care/design-improvement | studio/partnerships | 디자인 파트너십 범위 |
| redirect stub(15) | 현재 목적지 유지 | 위 통합 후 최종 목적지로 **체인 평탄화**(stub → 최종 URL) |

> 현재 stub 중 `business/build/app|landing|mvp|website`는 C 페이지(`business/app|landing|mvp|website-renewal`)로 연결된다. C 페이지를 build 허브로 통합하면 stub도 허브로 바꿔야 리디렉션 체인이 생기지 않는다.

## 보류 항목 (임의 작성하지 않음)

1. 자체 자동화 상품·솔루션 목록이 확정되면 A/B 페이지(white-label, automation, ai-automation)의 본문을 제품 소개로 재작성.
2. B 페이지 본문 일부에 남은 "우리가 맞춤 웹/앱을 설계·구축한다" 류 문장(예: AI 자동화 '고객 프로젝트' 서술, Solutions 'custom product build')은 상단 안내문으로 방향을 명시했으나 본문 재작성은 보류.
3. `Service` JSON-LD(provider=Newon, areaServed=Worldwide)가 있는 페이지의 스키마 타입 조정은 SEO 영향이 있어 보류하고 보고서에 기록.
4. 7개 언어(ja, es, pt-br, fr, de, hi, id)의 안내문 번역.
5. 일부 언어 본문의 일반 용어 "납품/entrega/Angebot" 등은 단순 산출물 전달·일반 제안 의미인 경우가 있어 확인 없이 삭제하지 않았다.
