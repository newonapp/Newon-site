# Newon 클라이언트 프로젝트 운영 문서

외주·클라이언트 프로젝트를 **발견 → 문의 → 상담 → 견적 → 계약 → 제작 → 수정 → 납품**까지 운영하기 위한 실무 템플릿입니다.

이 문서는 **운영 가이드·양식**이며, 법률 자문이나 계약의 법적 효력을 대신하지 않습니다. 실제 계약 문구·세금·개인정보 처리 등은 프로젝트 조건과 필요 시 전문가 검토를 반영하세요.

**오늘 문의가 들어왔다면:** 먼저 [00-first-client-runbook.md](./00-first-client-runbook.md) (내부 런북)를 연다.

**기본 운영 정책:** Newon Studio 기본값은 [09-policy-decision-sheet.md](./09-policy-decision-sheet.md)에 기록되어 있다. 프로젝트별 예외는 견적·SoW·계약에 명시한다.

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
| [00-first-client-runbook.md](./00-first-client-runbook.md) | **내부** — 첫 문의 당일 실행 · HQ 매핑 · 기본 정책 요약 | 내부만 |
| [01-requirements-questionnaire.md](./01-requirements-questionnaire.md) | 고객 요구사항 질문지 | 고객 |
| [02-quote-template.md](./02-quote-template.md) | 견적서 템플릿 (결제·외부비용·유효기간) | 고객 |
| [03-scope-of-work.md](./03-scope-of-work.md) | 프로젝트 범위서 (SoW) | 합의 |
| [04-pre-contract-checklist.md](./04-pre-contract-checklist.md) | 계약 전 체크리스트 | 내부 |
| [05-project-guide.md](./05-project-guide.md) | 프로젝트 진행 안내서 | 고객 |
| [06-change-request-policy.md](./06-change-request-policy.md) | 수정·Change Request **상세** 기준 | 합의 |
| [07-delivery-checklist.md](./07-delivery-checklist.md) | 납품 전 내부 체크리스트 | 내부 |
| [08-acceptance-form.md](./08-acceptance-form.md) | 완료·인수 확인서 | 고객+Newon |
| [09-policy-decision-sheet.md](./09-policy-decision-sheet.md) | **내부** — 기본 정책 결정 기록 | 내부만 |
| [10-client-project-agreement-template.md](./10-client-project-agreement-template.md) | 기본 계약/합의 템플릿 **초안** (법률 검토 전) | 합의(조정·검토 후) |
| [11-mid-project-update.md](./11-mid-project-update.md) | **중간 진행 공유** · 피드백·승인 기록 | 고객↔Newon |

---

## 기본 정책 요약 (상세는 09 · 각 문서)

| 주제 | 기본값 | 주 문서 |
|------|--------|---------|
| 결제 (소규모) | 총액 300만원 미만 **AND** 예상 4주 이하 → 계약금 50% / 잔금 50% | 02 · 10 |
| 결제 (중·대형/장기) | 300만원 이상 **또는** 4주 초과 **또는** 중간 마일스톤 필요 → 40% / 30% / 30% | 02 · 10 |
| 착수 | 계약금 입금 확인 후 | 02 · 05 · 10 |
| 인계 | 잔금 입금 확인 후 합의 최종 산출물 | 02 · 03 · 08 · 10 |
| 수정 | 기본 2회 (취합 피드백 1묶음 = 1회). Newon 구현 오류는 차감 없음 | **06** · 03 |
| 검수 | 기본 5영업일. 무응답 ≠ 자동 승인 | 03 · 05 |
| 30일 오류 대응 | 인수 확인일 다음날부터 30일, Newon 구현 오류만. SLA/24h 아님 | 03 · 08 · 06 |
| 견적 유효 | 기본 14일 | 02 |
| 무응답 | 5영업일 안내 → 10영업일 보류 가능 → 30일+ 종료·정산 **검토** (자동 종료 아님) | 05 · 00 · 10 |
| 포트폴리오 | 명시 동의 전 **비공개** | 03 · 08 · 10 |
| Design → Build | Design Only에 개발 자동 포함 안 됨 | 03 · 05 |
| 외부 비용 | 고객 부담 기본 (제작비와 운영비 구분) | **02** |

프로젝트별 예외·특약은 견적·SoW·계약에 명시. 취소/환불·IP·세무·개인정보는 **전문가 검토가 필요할 수 있음** → [09](./09-policy-decision-sheet.md) · [10](./10-client-project-agreement-template.md).

---

## 운영 흐름 (요약)

```
공개 Studio/Business → 문의 폼
  → newon@newon.app 수신 확인 (HQ 자동 적재 가정 금지 · 00)
  → (선택) HQ 문의 수동 등록
  → 상담 · 01 요구사항
  → 02 견적 → 03 SoW → 04 착수 점검 → 10 합의(해당 시 · 초안)
  → 계약·계약금 확인 · 착수 · HQ Project / Tasks · 05 안내
  → 제작 · **11 중간 공유** · (변경 시 06)
  → 07 QA → 고객 검수 → 08 인수
  → 잔금 확인 · 최종 산출물 인계
  → 30일 Newon 구현 오류 대응 (이후 유지보수는 별도 합의)
```

상세 체크리스트·HQ 매핑: [00 런북](./00-first-client-runbook.md).

---

## 첫 고객 시 문서 사용 순서

1. **00 런북**으로 당일 액션 확인 (`newon@newon.app` 우선)  
2. 문의 접수 후 **01 질문지**로 요구사항 정리 (또는 상담 후 Newon 초안 → 고객 확인)  
3. **05 진행 안내서**를 고객에게 공유해 단계·역할 정렬 (견적 전·후에도 가능)  
4. 범위가 보이면 **02 견적서** 작성·전달  
5. 합의 직전 **03 범위서** + **04 계약 전 체크리스트** + 필요 시 **10 합의 초안** (법률 검토 전)  
6. 계약·계약금 확인 후 착수. HQ Project/Tasks. 진행 중 **11 중간 공유**. 변경은 **06** 기준  
7. 납품 직전 **07** 통과 → **08** 인수 · 잔금 후 인계 · 30일 대응 시작일 기록  

---

## 문서 역할 (중복 방지)

| 주제 | 상세를 두는 곳 | 다른 문서 |
|------|----------------|-----------|
| 수정 / CR | **06** | 02·03·05는 요약+링크 |
| Scope | **03** | — |
| 외부 비용 | **02** | 04 체크, 10 요약 |
| 계약 조항 | **10** | 02·03은 범위·금액 중심 |
| 정책 결정 상태 | **09** | README·00 요약 |
| 고객 협업 설명 | **05** | — |
| 중간 공유 | **11** | SoW 기준 · CR은 **06** |
| 내부 실행 | **00** · **04** | — |

---

## 플레이스홀더

`[대괄호]` 항목은 프로젝트마다 채웁니다. 사업자번호·주소·계좌·개인 연락처 등 민감 정보는 저장소에 넣지 말고, 실제 전달 문서에만 기입하세요.
