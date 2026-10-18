# PHASE 03 P7 — 영어 잔존 문구의 출처별 분류

`node scripts/classify-english-remainder.mjs --json …` (읽기 전용). "영어 줄"의 정의와 합계는 `qa-lang-mix.mjs`와 같다(언어별 합계가 P6 보고서의 A+B와 C/D를 합친 값과 일치). 출처는 아래 순서로 판정하며, 어떤 분류도 번역 품질 판정이나 승인이 아니다.

| 분류 | 의미 |
|---|---|
| reframe-notice | 확정 모델 계층이 7개 언어에 의도적으로 영어로 쓰는 안내·CTA (원어민 검토 대기) |
| english-in-pack | 해당 언어 팩(`scripts/i18n/packs/<lang>`)에 같은 영어가 들어 있음 = 번역 단계가 영어를 돌려줬거나 번역되지 않음 |
| english-source-only | 영어 원문은 카피 스크립트에 있고 해당 언어 팩에 항목이 없음 = 순수 영어 폴백 |
| unknown-source | 추적 소스에서 찾지 못함 = 템플릿·다른 계층이 만든 문구, 추적 필요 |

| 언어 | 합계 | A | B | C/D(보류) | reframe-notice | english-in-pack | english-source-only | unknown-source |
|---|---|---|---|---|---|---|---|---|
| ja | 1077 | 92 | 678 | 307 | 3 | 2 | 983 | 89 |
| hi | 1077 | 92 | 678 | 307 | 3 | 2 | 983 | 89 |
| pt-br | 849 | 67 | 533 | 249 | 3 | 73 | 660 | 113 |
| es | 788 | 65 | 493 | 230 | 3 | 14 | 660 | 111 |
| de | 734 | 66 | 457 | 211 | 3 | 7 | 660 | 64 |
| fr | 728 | 64 | 456 | 208 | 3 | 1 | 660 | 64 |
| id | 729 | 64 | 456 | 209 | 3 | 2 | 660 | 64 |

(ko는 2줄. ja·hi는 영어 판정 기준이 더 느슨해 보이는 줄이 더 많다.)

## 읽는 법
- 영어 줄의 대부분(de·fr·id·es·pt-br 660줄, ja·hi 983줄)은 **영어 원문이 카피 스크립트에만 있고 언어 팩에 번역 항목이 없는 순수 폴백**이다. 번역이 깨진 것이 아니라 아직 없다. 가장 큰 출처: `studio-service-detail-data.mjs`(ja 580·de 396), `business-new-services-copy.mjs`(90·62), `business-service-copy.mjs`, `studio-care-detail-data.mjs`, `business-service-landing-copy.mjs`, `studio-areas.mjs`.
- **pt-br의 english-in-pack 73줄**은 팩 `studio-service-details.json` 등에 영어가 그대로 들어 있는 경우다. 팩을 다시 번역해야 하는 후보다.
- **unknown-source(64~113줄)**는 소스를 특정하지 못한 문구다. 이 줄들은 번역 전에 어느 템플릿이 만드는지 추적해야 한다.
- 번역 우선순위는 P6 문서와 같다: A 페이지 → B 페이지 → 보류된 C/D 페이지(소유자 결정 후). 트래픽 데이터가 없어 대상 사용자 수 기준 순위는 주장하지 않는다(NOT VERIFIED).

원본 JSON: `qa-artifacts/phase03-p7/english-remainder-classified.json` (페이지별·출처 파일별 줄 수 포함).
