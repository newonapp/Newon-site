# PHASE 03 P7 — 비즈니스 문구 현지화 검토 (후보만, 운영 번역 변경 없음)

기준: 확정된 ko/en 문구(제휴·도입 문의 중심, 개별 제작 의뢰를 받지 않는 모델). 대상: `business/build`, `business/solutions`, `business/care`.
산출물: `i18n-candidates/business-wording-candidates.v1.json`(31개 역할 × 7개 언어 = 217건, 전부 `candidate-unreviewed`), `qa-artifacts/phase03-p7/business-wording-scan.json`. **어떤 페이지나 번역도 바꾸지 않았고 어떤 빌드도 이 후보 파일을 읽지 않는다.**

## 1. 외주·수탁·화이트라벨로 읽힐 수 있는 표현의 위치
`node scripts/qa-business-wording-scan.mjs`(읽기 전용)가 7개 페이지(build, solutions, care, white-label, custom-product, internal-system, product-launch) × 9개 언어에서 용어군별 위치를 모은다. 언어별 검토 줄 수: ko 100 · en 98 · ja 88 · es 77 · pt-br 71 · fr 52 · de 73 · hi 100 · id 67. 히트는 "검토할 위치"이지 판정이 아니다. 확정 문구 자체(`개별 제작 의뢰는 받지 않습니다`)도 "의뢰" 용어에 걸린다.

**확정된 ko/en 페이지에 남아 있는 표현**(소유자 결정 대상):
- `business/white-label`: `White-label inquiry →`, "proven product structure to your brand" 계열 21줄(en). CTA가 제휴 문의로 바뀌지 않았다.
- `business/solutions`: 유형 이름 WHITE-LABEL / CUSTOM PRODUCT / PRODUCT LAUNCH / INTERNAL SYSTEM, "From problem framing to custom product build."
- `business/build`: en 라벨 "Services & pricing"(ko는 "서비스 안내"), 카드 이름 MVP DEVELOPMENT·WEBSITE·LANDING PAGE 등 서비스 메뉴 형태.
- `business/care`: "within an agreed range", "Ongoing care inside a contract", "Products built by someone else?", `Inquire about care →`(ko: 유지보수 문의).
- en `solutions` 유형 3: "Product development are discussed separately." (문법 오류, 의도는 "…is discussed separately").

## 2. 7개 언어 페이지의 현재 상태
- 구조 차이: `build` 페이지가 ko/en은 카드 7개·요소 68개, 7개 언어는 카드 4개·요소 50개이며 히어로 설명문이 없다. 원인은 7개 언어의 `scripts/i18n/packs/<lang>/business-pillar.json`이 `services[]` 배열을 통째로 덮어쓰는 구형 MT 오버레이이기 때문이다(배열은 병합되지 않는다). `solutions`는 ja 49개, 나머지 50개.
- 7개 언어 `build` 페이지에는 ko/en에 없는 영어 문장 "Final quotes may vary with collaboration scope, feature complexity, integrations, and timeline."이 있다(가격 견적 안내처럼 읽힌다).
- 헤드라인이 구형 제안형 번역이다. 예: build — de "Wir machen aus Ideen echte Produkte.", es "Convertimos ideas en productos reales."; solutions — es "No forzamos tu proyecto en un paquete."(확정 en: "Collaboration topics we review with partners.").
- `care` 페이지는 7개 언어 모두 영어 폴백이다(요소 56개 전부 영어).
- 확정 ko/en 문구와 같은 뜻으로 번역된 것은 `meta description`(7개 언어 모두 번역됨)과 `partnership` 블록 일부뿐이다.

후보 217건의 `currentState` 분포(언어당): 기존 번역 있음 14~15, 영어 폴백 10, 페이지에 없음 6~7.

## 3. 후보 (일부, 전체는 JSON)
| 역할 | 확정 en | 후보 (de) | 후보 (ja) |
|---|---|---|---|
| build.h1 | How Newon plans and builds products. | Wie Newon Produkte plant und baut. | Newonがプロダクトを企画し、つくる方法。 |
| solutions.h1 | Collaboration topics we review with partners. | Kooperationsthemen, die wir gemeinsam mit Partnern prüfen. | パートナーと一緒に検討する協業テーマ。 |
| care.h1 | Keep the product running within an agreed range. | Auch nach dem Aufbau betreuen wir, was nötig ist. | つくったあとも、必要な範囲で管理します。 |
| shared.cta.partnership | Partnership inquiry → | Partnerschaftsanfrage → | 提携・導入のお問い合わせ → |

작성 원칙: ko/en의 의미를 따른다(en 표현이 ko와 다를 때는 이유를 `note`에 기록). 새로운 사업 상품·가격·기간·약속을 더하지 않았다. 고유명·제품명은 번역하지 않았다. `care`는 계약처럼 읽히는 en보다 ko("필요한 범위에서 관리합니다")의 뜻을 따랐다. 위험 분류(`risk`): `outsourcing-like` 3, `contract-like` 4, `price-menu` 1, `grammar` 1 (언어당).

## 4. 정책 결정 (이번에 적용하지 않음)
1. **Solutions 4유형**(WHITE-LABEL / CUSTOM PRODUCT / PRODUCT LAUNCH / INTERNAL SYSTEM): 유형 이름 자체가 맞춤 제작·납품으로 읽힌다. 이름과 구조를 유지할지, "협업 주제"에 맞게 바꿀지 결정이 필요하다.
2. **CARE 문구**: 유지보수 계약처럼 읽히는 문구("agreed range", "inside a contract", "Inquire about care")와 타사 제작물 수용 FAQ를 파트너십 모델과 어떻게 맞출지, 또는 별도 서비스로 둘지 결정이 필요하다.
3. en "Services & pricing" → ko와 같은 "서비스 안내" 성격으로 맞출지.
4. `white-label`·`custom-product`·`internal-system` 상세 페이지의 CTA와 본문(ko/en 확정 문구에도 남아 있음).
5. 7개 언어 `build` 구조 차이(카드 4개 vs 7개)를 고치려면 구형 MT 오버레이를 교체해야 하며, 이는 번역 대량 변경이므로 승인 후 진행한다.
6. 후보 승인 방법: 검토자가 후보를 확인한 뒤 `i18n-approved/<lang>.json`에 기록해야만 반영된다. 이 후보 파일은 로케일 키가 아니라 페이지 역할 단위이므로 승인 전에 `business-pillar` 키로 매핑하는 단계가 먼저 필요하다.
