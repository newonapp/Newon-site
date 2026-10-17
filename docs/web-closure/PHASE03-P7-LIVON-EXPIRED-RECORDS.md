# PHASE 03 P7 — LIVON 만료 기록 13건

`node scripts/qa-livon-expired-records.mjs --now=2026-10-18T00:00:00Z` (읽기 전용). 기계 판독본: `qa-artifacts/phase03-p7/livon-expired-records.json`.

**조치: 없음 (날짜 연장 없음, 데이터 수정 없음).** 13건 전부 `lastCheckedAt`을 그대로 두었고 만료(`stale`) 상태를 유지합니다.

## 기록별 상태
`lastCheckedAt`은 모두 `2026-09-24T15:00Z`(= 한국 시간 2026-09-25)입니다. P6 문서의 "2026-09-24"는 UTC 표기였습니다. 열 이름의 "창"은 유형별 신선도 기준(일)입니다.

| 기록 | 유형 | 출처 종류 | 확인할 공식 출처 | 창 | 이번 세션 검증 |
|---|---|---|---|---|---|
| `ex:ex-allilearn` 늘배움 포털 | program | 공식 | https://www.lifelongedu.go.kr/ | 14 | NOT VERIFIED |
| `ex:ex-hrdkorea` HRD-Net | program | 공식 | https://www.hrd.go.kr/ | 14 | NOT VERIFIED |
| `ex:ex-lifelong` 국가평생교육진흥원 | program | 공식 | https://www.nile.or.kr/ | 14 | NOT VERIFIED |
| `ex:ex-qnet` 큐넷 | program | 공식 | https://www.q-net.or.kr/ | 14 | NOT VERIFIED |
| `ex:ex-senior-job` 노인일자리 | program | 공식 | https://www.kordi.or.kr/ | 14 | NOT VERIFIED |
| `ex:ex-worknet-job` 직업심리검사·진로 | program | 공식 | https://www.work24.go.kr/ | 14 | NOT VERIFIED |
| `td:learn-kmooc` K-MOOC | program | 공식 | https://www.kmooc.kr/ | 14 | NOT VERIFIED |
| `td:exp-baking` 베이킹 입문 | class | 자체 편집 가이드 | 외부 출처 없음 | 기본 | NOT VERIFIED |
| `td:exp-photo` 거리 사진 | class | 자체 편집 가이드 | 외부 출처 없음 | 기본 | NOT VERIFIED |
| `td:exp-pottery` 도자기 원데이 | class | 자체 편집 가이드 | 외부 출처 없음 | 기본 | NOT VERIFIED |
| `td:exp-yoga` 요가·스트레칭 | class | 자체 편집 가이드 | 외부 출처 없음 | 기본 | NOT VERIFIED |
| `td:learn-digital-senior` 스마트폰·키오스크 | program | 자체 편집 가이드 | 외부 출처 없음 | 14 | NOT VERIFIED |
| `td:learn-finance` 생활 금융 기초 | program | 자체 편집 가이드 | 외부 출처 없음 | 14 | NOT VERIFIED |

## 왜 NOT VERIFIED인가
- 공식 출처 7곳은 이 세션에서 열어 볼 수 없었습니다. 웹 조회 권한 요청이 응답되지 않아 거부되었고, 작업 환경의 셸은 허용 목록 밖 사이트에 접속할 수 없습니다.
- 사이트에 접속된다 해도 홈페이지가 열리는 것은 "프로그램·일정·요금이 맞다"는 확인이 아닙니다. 기록 본문은 일정·요금·접수를 "공식 사이트에서 확인하세요"라고만 안내하므로, 확인할 대상은 안내 문구와 링크가 지금도 맞는지입니다.
- 편집 가이드 6건에는 외부 출처가 없어 편집자의 내용 검토만 가능합니다.

## 갱신 근거로 필요한 것 (갱신 가능 여부)
1. 공식 7건: 담당자가 각 링크를 열어 ① 사이트가 같은 기관이 맞는지 ② 기록의 소개 문구가 여전히 맞는지 ③ 링크가 유효한지 확인하고, 확인한 날짜로 `checkedAt`을 갱신합니다.
2. 편집 6건: 편집자가 본문(`points`, 안전 안내 문구 포함)을 검토하고 날짜를 갱신합니다.
3. 갱신은 확인 이후에만 하며, 확인 근거(날짜·확인자)는 커밋 메시지나 별도 기록에 남깁니다.

## 사용자에게 보이는 방식 (공개 노출 정책 검토, 변경 없음)
- 만료 기록은 숨겨지지 않고 "확인 필요" 표시와 함께 노출됩니다(`hiddenReason` 없음, `FRESH_LABEL.stale`).
- `program` 유형 기준이 14일이라 공식 프로그램 기록은 2주마다 재확인하지 않으면 계속 만료됩니다. 현재 검토 주기(마지막 일괄 확인 2026-09-25, 이후 23일)와 기준이 맞지 않습니다.
- 정책 결정 항목(이번에 적용하지 않음): (a) 지금처럼 "확인 필요" 표시로 노출 유지, (b) 만료 N일 초과 기록은 목록에서 내리고 상세만 유지, (c) 편집 가이드는 공식 프로그램과 다른 기준(예: 90일) 적용. 어느 쪽이든 기준을 바꾸면 RC-14b와 `STALE_REVIEW_REQUIRED` 의미가 달라지므로 승인이 필요합니다.

## 테스트
고정 시계 RC-14·DM-11은 통과하고, 실시계 RC-14b는 `todo`로 남아 매 실행에서 보고됩니다. 위 재확인이 끝나면 별도 수정 없이 통과로 바뀝니다.
