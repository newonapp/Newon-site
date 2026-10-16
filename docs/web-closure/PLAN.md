# NEWON 웹사이트 — Information Only / App First 전환 계획

> 상태: 계획서 (2026-10-17 작성). 이 저장소(newonapp/Newon-site, 브랜치 `newon-site-studio-v1` 기반)에서는 **웹사이트 소개 구조·콘텐츠만** 변경한다. 앱 저장소는 수정하지 않았다.

## 1. 확정 원칙

웹사이트는 기업 소개, 6개 대표 사업 소개, 기능 설명, 앱 다운로드 안내, 기업·판매자·기관 제휴 안내, 공지·문의만 담당한다. 로그인, 사용자 대시보드, 서비스 검색·이용, 기록 관리, 예약, 거래, 결제, 판매자 관리, 커뮤니티는 웹에 **새로 구현하지 않는다.** 실제 서비스는 BABYLOG, PETLOG, MY WORLD, SHAREON, LIVON, ONGIL 각 앱에서 제공한다.

## 2. 이번에 적용한 웹사이트 변경

| 구분 | 내용 |
|---|---|
| 최상위 메뉴 | Consumer(Apps) · AI · **BabyLog · PetLog · My World · ShareOn · LivOn · Ongil** · Business · Studio · Company |
| 신규 소개 페이지 | `/{lang}/babylog/`, `/petlog/`, `/myworld/`, `/shareon/` (9개 언어, ko·en 본문 / 나머지 언어는 en 본문) |
| 공통 구조 | 사업 소개 → 해결하는 문제 → 주요 기능 → 이용 대상 → 기업·판매자·기관 제휴 → 앱 다운로드·출시 안내 → 문의 (id: intro/problem/features/audience/partners/download/contact) |
| LivOn / Ongil | 기존 소개 페이지 유지 + 하단에 `#bi-partners`(제휴), `#bi-download`(출시 안내), 웹 체험 임시 제공 안내 추가 |
| 시작하기 | LivOn/Ongil 메뉴의 "시작하기"는 **전환 상태(transition)** 로 유지. 설명을 "앱 출시 전까지 임시 제공"으로 변경 |
| Business | 메뉴·허브 상단 문구·CTA를 "Newon 자체 제품 · 자동화 솔루션 · 파트너십"으로 변경 (ko/en). 하위 상세·가격 페이지는 §6 인벤토리 참고 |
| Studio | 이미 4개 영역(Partnerships · Digital Products · Projects · Contact) 구조. 문구는 §6 참고 |

신규 4개 페이지에는 폼·입력창·로그인·서비스 컨트롤이 없다. 제휴 문의는 기존 문의 페이지(`business/inquiry/?category=Partnership#inquiry`)로 연결한다.

앱 스토어 링크는 BabyLog·PetLog·My World만 표시한다(저장소에 이미 있던 공식 링크). ShareOn·LivOn·Ongil은 "출시 준비 중"이며 스토어 링크를 표시하지 않는다.

## 3. 시작하기 상태 전환 규칙

`scripts/six-businesses.mjs`의 `webStart` 값으로 관리한다.

| 상태 | 조건 | 표시 |
|---|---|---|
| `transition` (현재) | 앱 이전·출시 미확인 | 기존 "시작하기"(→ `/livon/`, `/ongil-start/`) 유지 + "앱 출시 전까지 임시 제공" |
| `app-download` | 앱 출시 + 해당 기능 이전·데이터 보존 검증 완료 | "시작하기"를 앱 다운로드 안내로 교체 |
| `removed` | 웹 UI 종료 승인 | 항목 제거, 소개 페이지로 대체 |

## 4. 웹 기능 종료 원칙 (게이트)

아래 **모든 조건이 문서로 확인되기 전에는** 웹 기능·API·DB·사용자 데이터·공통 코드를 삭제하지 않는다.

1. 앱에서 동일 기능이 실제로 정상 동작 (기기 실측 포함)
2. 사용자 데이터 이전·보존 경로 검증 (내보내기/가져오기 또는 동기화, 롤백 포함)
3. 앱이 스토어에 출시되어 다운로드 가능
4. 담당자 승인 (main 머지·운영 배포는 별도 승인)

기능 단위로 판정하며, **앱 이전이 확인되지 않은 기능은 종료하지 않는다.**

## 5. 공유 코드 — 삭제 금지 목록

LivOn과 Ongil이 함께 쓰므로 한쪽 종료 때도 삭제하지 않는다.

- `server/livon/*`(http, cors, ratelimit, chat, userdata/store), `api/livon/*`, `api/health.mjs`
- `livon/livon-api-config.js`, `/api/livon/data` (Ongil도 호출)
- `server/newon/auth/*`, `newon-auth/*`
- `scripts/publish-site.mjs`가 필수로 요구하는 `livon/`, `ongil-start/`, `ongil/`, `assets/ongil-mark.svg`
- `ongil-start/js` 중 서버가 참조하는 계약 파일, `scripts/ongil-module-versions.mjs`
- `tests/ongil/*`(35개), `docs/ongil/*`
- PostgreSQL: `user_accounts`, `account_refs`, `user_records`, `saved_items`, `calendar_items`, `preferences`, `sync_metadata`, `ongil_family_*`

상세 기능 매핑은 [FEATURE-MAPPING.md](./FEATURE-MAPPING.md) 참고.

## 6. Business / Studio 외주·수탁 표현 — 처리 범위와 남은 작업

**이번에 변경(ko/en):** Business 메뉴 열 이름·설명·리드, 문의 CTA("제휴·도입 문의"), Business 허브 리드 문구. 다른 7개 언어의 같은 키는 영어 문구로 대체되도록 제거했다.

**아직 남은 항목 (미수정, 후속 작업 필요):** Business 하위 수백 개 페이지(9개 언어)에 "시작가·견적·납품·프로젝트 문의" 중심 문구가 남아 있다. 주요 위치:

- `scripts/studio-service-detail-data.mjs`, `business-new-services-copy.mjs`, `business-pillar-copy.mjs`, `studio-pillar-copy.mjs`
- `business-pricing.mjs`, `store-detail-copy.mjs`, `pillar-service-copy.mjs`
- 문의 폼(`templates/business-inquiry.html`)과 `locales/*`의 inquiry/budget/quote 계열 키

이 부분은 가격·서비스 구조까지 바뀌는 콘텐츠 재설계라서 별도 단계에서 문구 승인을 받고 진행하는 것을 권장한다. **현재 상태에서는 Business 하위 페이지에 외주형 표현이 남아 있다.**

## 7. 앱 저장소·권한·데이터 의존성 보고

| 대상 | 확인 상태 |
|---|---|
| BabyLog / PetLog / My World | 스토어 링크는 확인(사이트 저장소 내). 앱 저장소는 접근하지 않음 |
| ShareOn | 사이트에 페이지 없었음. 로컬에 `~/Newon-shareon-app` 존재 언급 — 이 세션에서는 접근 못 함. 출시 일정·수수료·가격 미확정 → 사이트에 기재하지 않음 |
| Ongil | `newonapp/ongil-mobile`(비공개) 존재 확인. 이 세션은 읽기 전용이며 열람하지 않음 |
| LivOn | 앱 저장소 위치 **미확인** → 담당자 확인 필요 |
| 운영 환경 | `/api/ongil/family`, `/api/livon/userdata` 배포 상태, 운영 환경 변수·제공기관 API 키, Newon+ Firebase 프로젝트 — **미검증** |
