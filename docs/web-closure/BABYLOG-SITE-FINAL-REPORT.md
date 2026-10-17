# BABYLOG 기업 웹사이트 — 최종 보고서

- 브랜치: `work/babylog-corporate-site` (기준: P7 `468cd1fea`). 로컬 커밋만. push / merge / 운영 배포 없음.
- 범위: 소개·사업 정보·파트너십·문의 콘텐츠만. 앱 개발, 육아 기록, 로그인, 결제, 거래, 예약, 교육 관리는 구현하지 않음.
- 판정 표기: PASS / FAIL / NOT RUN / NOT VERIFIED.

## 1. 결과물

5개 메뉴 × 9개 언어 = 45개 페이지.

| 메뉴 | 경로 | 내용 |
|---|---|---|
| 01 Overview 소개 | `/{lang}/babylog/` | Hero, Our Vision, Family Journey(6단계 탭), What We Connect(4), Our Ecosystem(4), Business Opportunities(6개 영역 링크), NEWON Connection, Next Step(CTA 3개) |
| 02 Platform 서비스 | `/{lang}/babylog/platform/` | Hero, 02~09 섹션(Growth Journey ~ Privacy & Trust), 10 App Access(검증된 스토어 링크 2개 + 계정 삭제 안내) |
| 03 Business 비즈니스 | `/{lang}/babylog/business/` | 대분류 A~F, 세부 사업 20개 칩, 영역마다 8개 항목(개요·고객·문제·가치·수익 모델·협력 대상·현재 상태·파트너십 CTA) + "외주·수탁·운영 대행 없음" 안내 |
| 04 Partnerships 파트너십 | `/{lang}/babylog/partnerships/` | 제안→검토→협의→계약→진행 5단계, 파트너 8유형(협력 대상·분야·수익 구조·조건·절차·문의 CTA), 앵커 이동 목록 |
| 05 Contact 문의 | `/{lang}/babylog/contact/` | 문의 8분류 → 기존 NEWON 문의 양식(`?category=Partnership&source=babylog-contact-<유형>#inquiry`) |

- 상위 메뉴는 5개만. 상세 사업·파트너 유형은 Business / Partnerships 내부 섹션.
- 문의: 새 개인정보 수집, DB, CRM, 메일 백엔드 없음. 기존 폼이 `category`·`source`를 이미 받아 전달함을 확인(`templates/business-inquiry.html`).
- 기존 BABYLOG 한 장짜리 페이지의 기능 설명과 스토어 링크는 Platform에 반영. `/babylog/delete-account/`(9개 언어 + 루트)는 그대로.

## 2. 디자인 보존

- Life Stage의 페이지 셸(`hub-shell`), 컴포넌트(`nls-*`), CSS·JS를 **수정 없이 재사용**. BABYLOG 전용 추가분은 `babylog-site.css`(`#lifestage-detail.nls[data-story="babylog"]`로만 한정). 흑백이며 핑크 브랜드색은 쓰지 않음.
- 헤더·로고·Apps 메뉴·푸터·언어/테마 전환: 기존 `renderStudioHeader/Footer` 그대로.
- 히어로: Life Stage 필름 히어로 구조에서 **영상·포스터를 제거**(외부 CDN 미사용), 어두운 단색 바탕 + 워드마크.
- Life Stage의 검색·플래너·입력·저장 기능은 복제하지 않음(`[data-nls-decade]` 탭 전환만 재사용).
- 검증(`qa-babylog-site.mjs --against <기준 커밋>`): 다른 플랫폼 페이지(petlog, myworld, shareon, lifestage, ongil, ai, business, studio, company, business-hub × 9개 언어)와 Life Stage 원본(CSS 2, JS 1, 렌더러, 본문·카피 모듈), 셸 템플릿, `site-chrome.mjs`, `render-business-intro.mjs`, `six-businesses.mjs`가 **바이트 단위 동일 — PASS**.
- 전체 빌드 비교: P7 빌드와 BABYLOG 빌드의 차이는 BABYLOG 페이지, 사이트맵, 변경한 스크립트뿐.

## 3. 콘텐츠 상태 표기 (미구현을 출시처럼 표시하지 않음)

- 라벨 3종: "앱 이용 중 · 스토어 소개 기준" / "방향 · 출시 일정 미정" / "검토 중". 모양(채움·점선·실선)으로도 구분.
- "앱 이용 중"은 **기존 스토어 소개 페이지에 이미 실린 앱 기능**(육아 기록, 아이 프로필, 성장·건강 기록, 일정, 성장 통계, 가족 공유, 참고용 AI)에만 사용.
- 청소년 독립 권한, 학습·독서·진로, 교육 콘텐츠·기관 연결, 사진·일기·성장 아카이브, 상품·서비스 탐색, SHAREON 거래 연계 등은 "방향" 또는 "검토 중".
- **NOT VERIFIED: 앱 코드와의 대조.** 이 환경에는 BabyLog 앱 저장소가 없어 실제 코드·출시 상태로 확인하지 못함. 기존 사업 소개 페이지의 문구를 기준으로 삼았음. 소유자 확인 필요.
- 파트너: "모집 안내이며 확정된 제휴가 아님"을 명시. 실제 파트너명·계약 표기 없음.
- 돌봄 서비스: NEWON이 직접 제공하지 않으며 제공자 자격 확인 기준은 미확정이라고 명시.

## 4. 수익 정책 공개/비공개

`BABYLOG-SITE-REVENUE-PUBLIC-PRIVATE.md` 참조. 공개 페이지에는 가격·수수료율·구독료·계약 금액대가 **없음**(구조 유형 문장만). 자동 검사 `revenue`(5×9 페이지)와 테스트 BL-2/BL-6이 막음. 이중 수수료는 "설계 원칙, 확정 정책 아님"으로만 서술. 웹에 결제·수수료 계산·판매자 등록 없음.

## 5. 다국어·SEO·접근성

- 번역: ko = 지시서 문구 + Claude가 작성한 연결 문장(**소유자 미검수**), en = 초안(**미검수**), ja·es·pt-br·fr·de·hi·id = 승인 번역 없음 → 영어 초안을 `lang="en"`으로 표시(P7 번역 정책). 상태는 `i18n-candidates/babylog-site-status.v1.json`. 헤더·푸터·메뉴 라벨은 기존 현지화 유지. 이 페이지들이 7개 언어의 "영어 잔여"로 집계될 수 있음(예상된 상태).
- SEO(페이지마다): 고유 title·description(언어별 5개 모두 고유), canonical, hreflang 9개 + x-default, Open Graph, WebPage + BreadcrumbList JSON-LD(콘텐츠에 맞는 것만), 사이트맵 36개 URL 추가(총 45), 내부 링크.
- 접근성: 제목 1개·단계 건너뜀 없음, nav·breadcrumb 라벨, 빈 링크·버튼 없음, 키보드 탭 이동으로 본문 14~27개 정지점 도달, `:focus-visible` 정의, 반응형(390/820/1440)에서 가로 스크롤 0, 모바일 메뉴는 가로 스크롤.

## 6. 검증 결과

| 검사 | 결과 |
|---|---|
| `qa-babylog-site.mjs` (메뉴·섹션·SEO·a11y·info-only·revenue·status·links·stores·sitemap·scope, 340건) | PASS |
| 변조 시험 `tests/web/babylog-site.test.mjs` BL-1~6 | PASS (가격 삽입, 메뉴 누락, 폼 삽입, 비검증 스토어 URL 모두 FAIL로 잡힘) |
| 색 대비 스캔 (ko·en·de × 5페이지 × 1440/390 × 라이트/다크 = 60조합) | 기준 미달 0 |
| 라이트·다크 모드 / 모바일·태블릿·데스크톱 시각 확인 | ko 확인. 다크는 실제 테마 토글로 확인 |
| 단계 탭 동작(Family Journey) | PASS |
| 빌드 (`publish-site.mjs`, 클린 클론) | PASS |
| 빌드 결정성 A1=A2=B1 | PASS · 7737 파일 · `9d1b2c29983781d2` · 보호 번역 원본 변경 0 |
| 드리프트 가드 | PASS · 182/182 (사이트맵 URL 반영 후) |
| 번역 후보 검증 | PASS (후보 189 보존) |
| fast-check, qa-ci-workflows, qa-jsonld(1980 페이지, 파싱 불가 0), qa-lang-mix(누락 0) | PASS |
| 전체 테스트 | 아래 §7 |
| 실제 스크린 리더 | NOT VERIFIED |
| 다국어 시각 확인(ko 외 언어), 태블릿 외 기기 | NOT RUN (구조 검사로 대체) |
| 실제 앱 코드·출시 상태 대조 | NOT VERIFIED |
| 문의 폼 실제 제출·수신 | NOT RUN (폼은 변경하지 않음; 쿼리 전달만 정적 확인) |

## 7. 전체 테스트
TESTS_PLACEHOLDER

## 8. 변경 파일

- 신규: `scripts/render-babylog-site.mjs`, `scripts/babylog-site-copy.mjs`, `scripts/babylog-site-body.mjs`, `scripts/qa-babylog-site.mjs`, `babylog-site.css`, `tests/web/babylog-site.test.mjs`, `i18n-candidates/babylog-site-status.v1.json`, 이 문서와 수익 공개/비공개 문서.
- 수정(최소): `scripts/build-i18n.mjs`(렌더 단계 1줄 + 사이트맵 4개 경로), `scripts/publish-site.mjs`(CSS 허용 목록 1줄), `scripts/ci/fast-check.mjs`(검사 1개), `package.json`(스크립트 1개), `sitemap.xml`(BABYLOG 36 URL만 삽입).
- 재생성: `{9개 언어}/babylog/index.html`(기존 단일 페이지 → Overview), 신규 `{9개 언어}/babylog/{platform,business,partnerships,contact}/index.html` 36개, 루트 리다이렉트 4개.
- 수정하지 않음: Life Stage 원본, 다른 앱 소개 페이지, 헤더·푸터·내비, 데이터·API·DB·인증·앱 코드, 기존 CI·배포 워크플로.
- 기존 브랜치 불변: main, qa, business-hub, info-only, content-recovery, p4, p5, p6(P7 브랜치는 보고서 커밋만 추가).

## 9. 소유자 결정·확인 필요

1. 앱 코드/출시 상태와 "앱 이용 중" 라벨의 일치 확인(§3).
2. ko 연결 문장과 en 초안 검수, 7개 언어 번역 승인(`approve-translation-candidates.mjs`).
3. 6개 사업 영역·8개 파트너 유형의 "수익 모델" 서술 수준과 공개 시점(확정 요금은 승인 후).
4. 돌봄 서비스 제공자 자격 확인 기준, 판매자 확인 방식(미정으로 표기).
5. 상단 메뉴의 BabyLog 링크 도착 페이지는 이제 Overview. 기존 단일 페이지의 SEO 문구가 바뀌므로 검색 노출 영향 검토.
6. 모바일 5개 메뉴는 가로 스크롤 방식 — 디자인 확인.

## 10. 알려진 한계

- 기존 P6 빌드 결정성·번역 관련 미해결 사항(만료된 LIVON 기록, 번역 검수 0건 등)은 건드리지 않았고 정상 완료로 표시하지 않음. P7 보고서 참조.
- 전체 빌드는 기존에 커밋된 비영어 페이지와 182개 파일이 다르며(알려진 드리프트 기준선), 이번 변경으로 늘지 않음.
