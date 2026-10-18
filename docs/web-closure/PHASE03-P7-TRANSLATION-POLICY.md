# PHASE 03 P7 — 번역 정본 정책과 구현

## 정책 (사용자 지시)
1. 검토·승인된 현지어 번역이 우선한다.
2. 승인된 번역이 없을 때만 영어 폴백을 쓴다.
3. 후보 파일 189개·레코드 12,723개는 무손실로 보존한다(`i18n-candidates/translation-candidates.v1.json`, 변경 없음).
4. 미검토 번역을 정본으로 자동 승격하지 않는다.
5. 반복 빌드에서 번역이 영어로 덮이는 원인을 고친다.

## 계층 (구현)
| 계층 | 위치 | 상태 |
|---|---|---|
| 승인된 현지어 번역 | `i18n-approved/<lang>.json` (ja es pt-br fr de hi id) | 현재 **승인 0건** (파일은 비어 있음) |
| 영어 폴백 | 기존 `apply-*` 단계가 쓰는 영어 | 승인이 없는 모든 키에서 그대로 유지 |
| 후보 (미검토) | `i18n-candidates/*.json` | 어떤 빌드도 읽지 않음 |

- `scripts/apply-approved-translations.mjs`는 로케일 패치의 **마지막 단계**로 실행되어, 승인 항목이 앞선 모든 영어 폴백을 이긴다.
- 항목은 `reviewStatus: "approved"`, `reviewer`, `reviewedAt`, 비어 있지 않은 `text`가 모두 있어야 하고, 대상 키가 `locales/en.json`에 문자열로 있어야 한다. 하나라도 어기면 **빌드가 실패**한다(조용히 건너뛰지 않음). 새 키는 만들 수 없다.
- 승인은 사람이 `scripts/approve-translation-candidates.mjs --lang <l> --id <후보 id> --reviewer <이름>`으로만 기록한다. 이 도구는 빌드·CI가 호출하지 않으며 JSON 키 후보(`locales/_sp.<lang>.json`, 키 `x` → 로케일 키 `sp.x`)만 승인할 수 있다. HTML 후보는 하나의 로케일 키로 매핑된 뒤에야 승인할 수 있다.
- CI(`build-guards.yml`)가 `apply-approved-translations.mjs --check`로 승인 파일의 유효성을 검사한다.

## 반복 빌드에서 번역이 바뀌던 원인과 수정
**원인.** `locales/_sp.<lang>.json`은 커밋된 언어별 SubPing 문구(번역 소스)인데, 빌드 단계(`apply-app-closing-copy`, `apply-delete-account-locales`, `apply-app-reviews` 등)가 이 파일을 제자리에서 영어로 다시 썼다. 빌드 한 번에 7개 파일(de es fr hi id ja pt-br)이 각각 약 110개 키씩 영어로 바뀌었다. 같은 작업 트리에서 두 번째 빌드를 하면 시작 단계 `merge-subping-locales`가 바뀐 `_sp` 파일을 `locales/<lang>.json`으로 복사해, 그 단계 이후에는 다시 쓰이지 않는 `sp.closingFoot`이 독일어(운영 값)에서 영어로 바뀌었다. 클린 체크아웃에서는 `_sp`가 아직 원본이라 같은 키가 첫 빌드에서는 독일어로 나온다.

**수정.** `scripts/run-all-locale-patches.mjs`가 시작 시 `locales/_sp.*.json`을 읽어 두고, 실행이 끝나면(실패 시에도) 원래 내용으로 되돌린다. 빌드 중간 단계가 쓰는 값은 그 실행 안에서 그대로 쓰이므로 첫 빌드의 출력은 달라지지 않고, 다음 빌드는 항상 원본에서 시작한다. 의도적으로 소스를 갱신할 때는 `NEWON_UPDATE_TRANSLATION_SOURCE=1`(또는 `--translate`)로 보호를 끈다.

**결과.**
- 같은 작업 트리 반복 빌드: 모든 파일 해시 동일(`qa-build-determinism`, 아래 표).
- 독립 클린 빌드 2회: 동일.
- `closingFoot`: 첫 빌드와 반복 빌드 모두 독일어 등 현재 운영 값을 유지한다(영어로 바꾸지 않음).
- 모든 HTML 페이지와 `locales/<lang>.json`은 P6 클린 빌드(독립 빌드 D1)의 결과와 바이트 단위로 같다(그 뒤 P6에서 고친 `business-service.css` 대비 수정만 제외). 달라진 것은 공개되는 원시 데이터 파일 `locales/_sp.<lang>.json` 7개뿐이다(영어로 덮인 값 → 커밋된 원본 값). 운영(gh-pages)의 `_sp.de.json`에는 현재 영어 값이 들어 있다. 어떤 페이지도 이 파일을 읽지 않는다. 공개 파일 목록에서 빼는 것은 별도 결정 항목이다.
- `build-drift-baseline.json`: 189 → 182개 파일. 제외된 7개는 위 `_sp` 파일이다.

## 실제 콘텐츠 변경과 생성물 변경의 구분
| 구분 | 이번 변경 |
|---|---|
| 실제 콘텐츠(페이지에 보이는 문구) | 없음 |
| 생성물/데이터 | 공개 `_sp.<lang>.json` 7개(위), 빌드 시각은 `SOURCE_DATE_EPOCH`로 고정 가능 |
| 소스(스크립트·정책) | 로케일 패치 보호, 승인 계층, 승인 도구 |
