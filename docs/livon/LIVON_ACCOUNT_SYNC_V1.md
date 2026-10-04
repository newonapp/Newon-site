# LIVON Account + Sync V1

작성: 2026-10-04 · branch `livon-account-sync-v1` · 기준 `a58aba646` (Production main)

이 문서는 LIVON에 Newon+ 계정과 기기 간 동기화를 붙이는 V1의 **현재 상태**를 적습니다. 계정 backend와 동기화 엔진은
2026-09-30의 Account Backend & Sync V1(`docs/newon/newon-plus-account-backend.md`)에서 이미 만들어져 있었고, 이번 단계는
그 위에서 실제 코드를 감사하고 빠진 부분(재시도 한도, 항목별 상태, 만료된 로그인, 실패 문구)을 채운 것입니다.
새 인증 시스템, 새 endpoint, 새 저장소는 만들지 않았습니다.

**계정 동기화는 Production에서 켜져 있지 않습니다.** 코드가 준비된 것과 실제로 동작하는 것을 아래에서 구분합니다.

## 1. 현재 상태

분류: `LIVE` 실제 Production에서 동작 · `CODE READY` 코드와 테스트는 있으나 꺼져 있음 · `LOCAL ONLY` 이 기기에서만 동작 ·
`DISABLED` 의도적으로 꺼 둠 · `PLACEHOLDER` 자리만 있음 · `NOT IMPLEMENTED` 없음

| 영역 | 파일 | 상태 | 근거 |
|---|---|---|---|
| 비로그인 사용 (My Life · 저장 · 설정) | `livon/data/livon-user-data.js`, 각 화면 | LIVE · LOCAL ONLY | localStorage, 요청 없음 (AS-01) |
| 저장 차단·오류 대비 | `livon/data/livon-storage-guard.js` | LIVE | 탭 메모리로 대체 |
| Newon+ 인증 client | `newon-auth/newon-auth.js`, `newon-auth-firebase.js` | CODE READY | `newon-auth-config.js`가 비어 있음 → 항상 비로그인 |
| Newon+ 로그인 UI | `newon-auth/newon-auth-ui.js`, `livon/livon-account-ui.js` | CODE READY · DISABLED | `LIVON_ACCOUNT_SYNC_PUBLIC`가 설정된 곳 없음 (AS-31) |
| 인증 연결 지점 | `livon/data/livon-auth-bridge.js` | CODE READY · DISABLED | 위 switch가 꺼져 있으면 엔진을 부르지 않음 (AS-02) |
| 동기화 엔진 | `livon/data/livon-sync.js` | CODE READY | 실제 handler + 메모리 저장소로 테스트 |
| 서버 token 검증 | `server/newon/auth/*` | CODE READY | `NEWON_AUTH_VERIFY_ENABLED` 미설정 → 닫힘 |
| 사용자 데이터 API | `server/livon/userdata/http.mjs`, `/api/livon/userdata` | 배포됨 · DISABLED | Production 응답 503 `SYNC_NOT_AVAILABLE` |
| PostgreSQL 저장소·migration | `server/livon/userdata/store.mjs`, `migrations/001_account_backend.sql` | CODE READY | 실제 DB 없음. PostgreSQL 테스트는 `LIVON_TEST_PG`가 있을 때만 실행 |
| Firebase 프로젝트 | – | NOT IMPLEMENTED (외부 설정) | 프로젝트 자체가 아직 없음 |
| Community 서버 동기화 | – | NOT IMPLEMENTED | 글·댓글은 이 기기에만 (`COMMUNITY_LOCAL`) |
| 프로필(이름·사진) 서버 저장 | – | NOT IMPLEMENTED | 계정이 소유할 예정, 지금은 기기에만 |

Production `/api/health` (2026-10-04 확인): `userdata.enabled false`, `database false`, `auth false`, `ready false`.

## 2. 데이터 분류

판정: `SYNCABLE` 계정에 저장 가능 · `SYNCABLE (선택)` 사용자가 직접 켜야만 · `LOCAL ONLY` 기기에만 ·
`PRIVATE LOCAL` 민감해서 올리지 않음 · `SERVER REQUIRED` 서버 기능이 따로 필요

| 데이터 | 저장 위치 | 판정 | 충돌 처리 |
|---|---|---|---|
| 할 일 · 목표 · 체크리스트 · 습관 · 프로젝트 · 경험 기록 | `livon.mlStore.v1` | SYNCABLE | 두 버전 모두 보존 |
| 일정 | `livon.mlStore.v1` `events` | SYNCABLE | 같은 일정은 하나로, 다르면 둘 다 |
| 저장한 항목 · 저장 폴더 | `livon.platform.v1` `saves`, `folders` | SYNCABLE | 합집합 (삭제는 삭제 기록으로) |
| 알림 설정 · 지역(시/도·시군구) · My Life 설정 · 관심사 · Life Stage · Today 취향 | `livon.platform.v1`, `livon.life*`, `livon.td*` | SYNCABLE | 더 최근 값 + 차이 보고 |
| Life Event 진행 · 체크리스트 진행 | `livon.lifeEventProgress.v1`, `livon.lifeHub.checklist.v1` | SYNCABLE | 더 최근 값 |
| 일기 · 가계부 · 건강 기록 · 예산 | `livon.mlStore.v1` | SYNCABLE (선택) | 두 버전 모두 보존 |
| 지역의 동 · 프로필 · 가족 | `livon.platform.v1` | PRIVATE LOCAL | – |
| LIVON AI 대화 | `livon.aiStore.v1` | PRIVATE LOCAL | – |
| 최근 본 것 · 최근 검색 · 비교함 · 화면 상태 | `livon.today.recent.v1`, `livon.exRecent` 등 | LOCAL ONLY | – |
| 온보딩 진행 상태·초안 | `livon.personalization.v1` | LOCAL ONLY (결과인 Life Stage·관심사는 SYNCABLE) | – |
| Community 글 · 댓글 · 닉네임 | `livon.cmStore.v1` | SERVER REQUIRED (지금은 LOCAL ONLY) | – |
| 공공 데이터 응답 캐시 | `livon.data.v1:*` | LOCAL ONLY (사용자 데이터 아님) | – |
| 사용자 위치 · token · 원본 응답 | – | 전송 금지 (client와 server 모두 거부) | – |

## 3. 동기화 상태

쓰기는 항상 이 기기에 먼저 저장됩니다. 로그인한 경우에만, 4초 뒤 한 번에 묶어서 올립니다.

```
기기에 저장 → 대기 → (로그인됨) 받아오기 → 비교·병합 → 올리기 → 서버 확인
```

항목별 상태 (`LivonSync.queue()`; 내용은 담지 않고 종류·id·상태·시각만):

| 상태 | 뜻 |
|---|---|
| `LOCAL` | 이 기기에만 있음 (비로그인, 또는 켜지 않은 민감 기록) |
| `PENDING` | 이 기기에서 바뀌었고 아직 서버가 확인하지 않음 |
| `SYNCING` | 지금 올리는 중 |
| `SYNCED` | 서버가 같은 버전을 가지고 있음 |
| `FAILED` | 마지막 시도가 실패. 변경은 이 기기에 그대로 있음 |
| `CONFLICT` | 두 기기에서 같이 고쳐서 두 번째 버전을 따로 남김 |

각 항목이 가진 값: `localUpdatedAt`(기기에서 고친 시각), `serverRev`(서버 revision), 계정별 `lastSyncedAt`.
"바뀌었는지"는 기기 시계가 아니라 **마지막으로 확인된 revision + 내용 hash**로 판단합니다.

엔진 상태: `idle` · `unavailable` · `waiting-consent` · `syncing` · `synced` · `offline` · `error`.

## 4. 재시도

- 실패하면 5초 → 30초 → 2분 → 10분 → 30분 뒤에 다시 시도합니다. **자동 재시도는 다섯 번까지**입니다.
- 그 뒤에는 스스로 시도하지 않습니다. 다시 시작하는 경우: 사용자가 "다시 동기화"를 누름, 연결이 돌아옴(`online`), 화면을 다시 봄.
- 실패한 동안에는 60초 주기 받아오기도 멈춥니다. 글을 쓰는 동안 기다리는 시간이 짧아지지도 않습니다(서버가 내려가 있을 때 입력할 때마다 요청하지 않음).
- 다시 시도해도 소용없는 실패는 재시도하지 않습니다: 로그인 만료(401), 거부된 요청, 계정이 바뀐 경우, 저장 공간 부족.
- 실패해도 이 기기의 데이터는 바뀌지 않습니다.

## 5. 충돌

| 종류 | 처리 |
|---|---|
| 기록(할 일·목표·일기 등)을 두 기기에서 고침 | 서버 버전을 두고, 이 기기 버전을 별도 항목으로 남김 (`conflictOf`). 어느 쪽도 사라지지 않음 |
| 한쪽은 지우고 한쪽은 그 뒤에 고침 | 고친 쪽이 남음 |
| 저장한 항목 · 폴더 | 합침 |
| 설정 | 더 최근에 바꾼 값. 차이는 기록됨 |
| 같은 일정 · 같은 제목의 LIVON AI 제안 | 하나로 합침 (모든 기기가 같은 것을 남김) |

시각만 보고 사용자 기록을 지우지 않습니다.

## 6. 삭제

삭제는 서버에 **삭제 기록**(내용 없는 tombstone)으로 남습니다. 오래 꺼져 있던 기기나 오프라인이던 기기가 돌아와도
지운 항목을 되살리지 못합니다. 지운 뒤 같은 id로 다시 만든 항목은 새 항목으로 살아남습니다.

## 7. 첫 로그인

1. 로그인만으로는 아무것도 올라가지 않습니다.
2. 이 기기에 데이터가 있으면 종류별 개수를 보여 주고 고르게 합니다. 일기·가계부·건강·예산은 기본으로 꺼져 있습니다.
3. "이 기기에만 두기"를 고르거나 창을 닫으면 올리지 않습니다.
4. 고른 것만 계정에 올라갑니다. 고르지 않은 것은 이 기기에 그대로 남습니다.
5. 로그인했다고 localStorage를 지우지 않습니다. 로그인 중에는 이 기기의 데이터가 따로 보관되고, 로그아웃하면 그대로 돌아옵니다.
6. 같은 계정으로 이 기기에서 다시 로그인하면 다시 묻지 않습니다.

## 8. 개인정보

- 일기·가계부·건강·예산은 사용자가 켰을 때만 전송됩니다. 끄면 그 뒤로 올라가지 않습니다.
- AI 대화, Community 글, 최근 활동, 위치, 동, 프로필, 가족 정보는 동기화 대상이 아닙니다.
- 서버 로그에는 요청 번호·경로·상태·시간만 남습니다. 기록 내용, token, 계정 id는 남지 않습니다.
- 브라우저 쪽 엔진과 화면은 console에 아무것도 쓰지 않습니다.
- token은 `Authorization` header로만, `/api/livon/userdata`에만 갑니다. URL·저장소·화면에 들어가지 않습니다.
- 한 기기를 두 사람이 쓰면 계정마다 데이터가 분리됩니다.

## 9. 화면

위치는 한 곳입니다: 내 생활 › 설정. 기존 My Life component만 사용합니다. 지금은 숨겨져 있습니다.

| 상태 | 문구 |
|---|---|
| 로그인 안 함 | 로그인하면 할 일·목표·일정·저장한 항목을 여러 기기에서 이어서 쓸 수 있습니다. 로그인만으로는 아무것도 업로드되지 않습니다. |
| 동기화됨 | 동기화됨 · 마지막 14:05 |
| 동기화 중 | 동기화 중… |
| 실패 | 지금은 동기화하지 못했습니다. 기록은 이 기기에 안전하게 저장되어 있습니다. 잠시 후 자동으로 다시 시도합니다. |
| 재시도 끝 | … 자동으로 다시 시도하지 않으니 ‘다시 동기화’를 눌러 주세요. |
| 오프라인 | 오프라인입니다. 연결되면 다시 동기화합니다. 이 기기의 기록은 그대로 사용할 수 있습니다. |
| 로그인 만료 | 로그인이 만료되었습니다. 다시 로그인하면 이어서 동기화합니다. 기록은 이 기기에 안전하게 저장되어 있습니다. |
| 아직 못 씀 | 계정 동기화를 아직 사용할 수 없습니다. 데이터는 이 기기에 그대로 있습니다. |
| 기다리는 변경 | 아직 계정에 저장되지 않은 변경 2개가 이 기기에 있습니다. |
| 두 버전 보존 | 두 기기에서 함께 고친 항목 1개는 두 버전을 모두 남겼습니다. 내 생활에서 확인해 주세요. |

버튼: 다시 동기화 · 가져오기 선택 · 새로고침 · 로그아웃. 이름·이메일·id는 표시하지 않습니다.

## 10. 켜는 데 필요한 것

모두 외부 설정입니다. 하나라도 없으면 계정 기능은 꺼진 채로 남습니다.

1. Newon+ Firebase 프로젝트 (HQ·OX 프로젝트와 별도) + 로그인 방식 활성화
2. GitHub 저장소 변수 `NEWON_PLUS_FIREBASE_*` → build가 `newon-auth-config.js`를 채움
3. PostgreSQL 데이터베이스 + `001_account_backend.sql` 적용
4. Vercel 환경 변수: `LIVON_USERDATA_ENABLED`, `LIVON_DATABASE_URL`, `NEWON_AUTH_VERIFY_ENABLED`, `NEWON_PLUS_FIREBASE_PROJECT_ID` (+ 이미 있는 요청 제한 설정)
5. `/api/health`의 `userdata.ready`가 `true`인지 확인
6. 출시 결정 후 `LIVON_ACCOUNT_SYNC_PUBLIC`를 켜는 build 변경 (지금 저장소 어디에도 켜져 있지 않음)
7. 실제 두 기기로 확인: 로그인, 가져오기, 양방향 수정, 삭제, 로그아웃

자세한 순서: `docs/newon/newon-plus-account-backend.md` 14절.

## 11. 알려진 한계

- 실제 Firebase 프로젝트·데이터베이스로 검증한 적이 없습니다. 기기 간 동기화는 테스트 안에서만 확인됐습니다.
- 다른 기기의 변경을 받으면 화면에 반영하려면 새로고침이 필요합니다(패널이 알려 줍니다).
- 두 버전이 남은 항목을 하나로 합치는 화면은 없습니다. 내 생활 목록에서 직접 하나를 지워야 합니다.
- 로그인이 만료됐을 때 패널에서 바로 다시 로그인하는 버튼은 없습니다. 인증 상태가 비로그인으로 바뀌면 로그인 버튼이 나옵니다.
- Community와 프로필은 계정에 저장되지 않습니다.
- 계정 삭제(서버 데이터 전체 삭제) 요청 흐름은 이 단계에 없습니다.
- 재시도가 끝난 뒤에는 탭이 계속 보이는 상태로 열려 있으면 사용자가 누르기 전까지 다시 시도하지 않습니다.

## 12. 테스트

`tests/livon/account-sync.test.mjs` — AS-01 … AS-32 (실제 engine, 실제 handler, 메모리 저장소, 임시 서명 키).
하위 계약(SQL, 인증서, CORS, 요청 제한)은 `tests/livon/account-backend.test.mjs`, 저장소 분류는 `account-data.test.mjs`.
