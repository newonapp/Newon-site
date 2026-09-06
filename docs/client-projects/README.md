# Newon 클라이언트 프로젝트 운영 문서

외주·클라이언트 프로젝트를 **발견 → 문의 → 상담 → 견적 → 계약 → 제작 → 수정 → 납품**까지 운영하기 위한 실무 템플릿입니다.

이 문서는 **운영 가이드·양식**이며, 법률 자문이나 계약의 법적 효력을 대신하지 않습니다. 실제 계약 문구·세금·개인정보 처리 등은 프로젝트 조건과 필요 시 전문가 검토를 반영하세요.

**오늘 문의가 들어왔다면:** 먼저 [00-first-client-runbook.md](./00-first-client-runbook.md) (내부 런북)를 연다.

---

## 서비스 구조 참고

| 영역 | 역할 | 예시 |
|------|------|------|
| **Newon Studio** | 브랜드·디자인·콘텐츠·IP (Digital은 Design Only 가능) | Brand Strategy, Identity, Logo, Web/App UI, Landing, Social, Campaign, Visual, Character Lab, Experimental IP |
| **Newon Business · BUILD** | MVP·웹·랜딩·앱 **구현** | `/business/mvp/`, `/web/`, `/landing/`, `/app/` 등 |
| **Newon Business · AUTOMATION** | AI·워크플로·내부 도구 | AI 자동화, 워크플로, 내부 툴 |
| **Newon Business · RESEARCH / SOLUTIONS** | 리서치·맞춤 솔루션 | 시장·경쟁·UX 진단, 화이트라벨, 커스텀 등 |

공개 유입: Studio/Business 페이지 CTA → `/business/inquiry/` (Studio는 `?category=Studio`).  
가격은 사이트에 게시된 **시작가·별도 견적** 체계를 따르며, 이 폴더에서 금액을 새로 정하지 않습니다. 견적서에는 프로젝트별로 확정한 금액만 기입합니다.

---

## 문서 목록

| 파일 | 용도 | 공개 |
|------|------|------|
| [00-first-client-runbook.md](./00-first-client-runbook.md) | **내부** — 첫 문의 당일 실행 순서 · HQ 매핑 · 미결정 정책 | 내부만 |
| [01-requirements-questionnaire.md](./01-requirements-questionnaire.md) | 고객 요구사항 질문지 | 고객 |
| [02-quote-template.md](./02-quote-template.md) | 견적서 템플릿 | 고객 |
| [03-scope-of-work.md](./03-scope-of-work.md) | 프로젝트 범위서 (SoW) | 합의 |
| [04-pre-contract-checklist.md](./04-pre-contract-checklist.md) | 계약 전 체크리스트 | 내부 |
| [05-project-guide.md](./05-project-guide.md) | 프로젝트 진행 안내서 | 고객 |
| [06-change-request-policy.md](./06-change-request-policy.md) | 수정·변경 요청 정책 템플릿 | 합의 |
| [07-delivery-checklist.md](./07-delivery-checklist.md) | 납품 전 내부 체크리스트 | 내부 |
| [08-acceptance-form.md](./08-acceptance-form.md) | 완료·인수 확인서 | 고객+Newon |
| [09-policy-decision-sheet.md](./09-policy-decision-sheet.md) | **내부** — 미확정 사업 정책 선택지·영향 (값 미확정) | 내부만 |

---

## 운영 흐름 (요약)

```
공개 Studio/Business → 문의 폼
  → HQ 문의
  → 상담 · 01 요구사항
  → 02 견적 → 03 SoW → 04 착수 점검
  → 계약·착수 · HQ Project / Tasks · 05 안내
  → 제작 · (변경 시 06)
  → 07 QA → 고객 검수 → 08 인수
  → 완료 (유지보수는 별도 합의 시에만)
```

상세 체크리스트·HQ 매핑: [00 런북](./00-first-client-runbook.md).

---

## 첫 고객 시 문서 사용 순서

1. **00 런북**으로 당일 액션 확인  
2. 문의 접수 후 **01 질문지**로 요구사항 정리 (또는 상담 후 Newon 초안 → 고객 확인)  
3. **05 진행 안내서**를 고객에게 공유해 단계·역할 정렬 (견적 전·후에도 가능)  
4. 범위가 보이면 **02 견적서** 작성·전달  
5. 합의 직전 **03 범위서** + **04 계약 전 체크리스트**로 누락 확인  
6. 계약·착수 후 HQ Project/Tasks. 변경은 **06** 기준으로 기록  
7. 납품 직전 **07** 통과 → **08** 인수 기록  

---

## 결정이 필요한 사업 정책 (임의 확정 금지)

아래는 템플릿에 **숫자를 고정하지 않는다.** 결정 후 해당 프로젝트의 견적·SoW·계약에만 기입한다.

- 결제 비율·시점  
- 기본 수정 횟수·라운드  
- 고객 검수 기간  
- 견적 유효기간  
- 유지보수 포함 여부  
- 계약 형식·세금계산서  
- 개인정보·고객 데이터 역할  
- 계정·Secret 인계 방식  
- Studio Design Only → Business BUILD 전환 조건  

상세 표: [00 런북 §4](./00-first-client-runbook.md#4-아직-확정하지-않은-사업-정책-임의-기입-금지).  
선택지·장단점·문서 연결: [09 정책 결정표](./09-policy-decision-sheet.md).

---

## 플레이스홀더

`[대괄호]` 항목은 프로젝트마다 채웁니다. 사업자번호·주소·계좌·개인 연락처 등 민감 정보는 저장소에 넣지 말고, 실제 전달 문서에만 기입하세요.
