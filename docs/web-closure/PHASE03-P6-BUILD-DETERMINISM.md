# PHASE 03 P6 — 빌드 결정성

## 원인과 수정
| 원인 | 증상 | 조치 |
|---|---|---|
| `patch-index-home-studio.mjs`가 매 실행마다 선행 공백 보존 | 실행마다 빈 줄 2개 증가 | `after`의 선행 공백 제거 후 고정 구분자 사용 |
| `apply-app-landing-extras.mjs`의 삽입/삭제 후 공백 잔존 | 템플릿 13개가 실행마다 빈 줄 증가 | 끝에서 3회 이상 연속 빈 줄 정규화, 13개 템플릿은 공백만 정규화 |
| 빌드 시각(generatedAt, deploy-marker, sitemap lastmod) | 빌드마다 값 변경 | `SOURCE_DATE_EPOCH` 지원, 미설정 시 기존 동작 |

## 해시 비교
- 같은 입력, 같은 `SOURCE_DATE_EPOCH`로 독립 클린 빌드 2회: 7,590개 파일, 트리 해시 동일(`95b832ee2f066cd8`), 차이 0.
- 환경변수 없이: `admin/data.json`(타임스탬프)만 다름.

## 미해결 (정책 결정 필요)
같은 트리에서 두 번째 빌드를 하면 7개 언어의 `locales/<lang>.json` `sp.closingFoot`가 독일어에서 잘린 영어로 바뀝니다(`merge-subping-locales`가 `apply-app-closing-copy`보다 먼저 실행되며 `_sp.<lang>.json`에서 복사). 첫 빌드의 출시 콘텐츠를 바꾸게 되므로 고치지 않았습니다. 번역 정본 결정과 함께 처리해야 합니다.

## 사용법
`SOURCE_DATE_EPOCH=<epoch> node scripts/publish-site.mjs`
