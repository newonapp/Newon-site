# ONGIL Family Connection V1

가족 연결 · 동의 · 공유의 기반. 기준 커밋 `a58aba64652f6896334701d33c3403d919fadcad`, 브랜치 `ongil-family-connection-v1`.

## 1. 한 줄 요약

ONGIL을 쓰는 본인(OWNER)이 **누구에게, 무엇을, 언제까지** 보여 줄지 직접 정한다. 가족이 어르신을 지켜보는 기능이 아니다.
V1은 **한 기기 안(LOCAL)** 에서 실제로 동작하고, 기기 사이 연결은 **계정이 필요(ACCOUNT REQUIRED)** 하며 아직 열려 있지 않다. 화면도 그렇게 말한다.

## 2. 기능 상태 (거짓 LIVE 없음)

| 기능 | 상태 | 설명 |
| --- | --- | --- |
| 가족 그룹, 초대 만들기·취소·만료, 초대 받기·거절 | LOCAL | 이 기기에 저장. 코드는 본인이 직접 알려 준다 (ONGIL은 문자·카카오톡을 보내지 않는다) |
| 구성원별 공유 설정, 민감 정보 동의, 공유 미리보기 | LOCAL | 저장 전 미리보기와 저장 후 화면이 같은 권한 모델에서 나온다 |
| 공유 중단(항목·구성원·전체), 연결 해제 | LOCAL | 즉시 적용 |
| 가족에게 보이는 화면 (Family View) | LOCAL | 같은 기기에서 "가족 역할"로 열어 본다. 다른 기기에는 전달되지 않는다 |
| 도움 요청과 상태 | LOCAL (`LOCAL_IN_APP`) | push·SMS·서버 전달 없음 |
| 활동 기록 | LOCAL | 행동만 기록, 값은 기록하지 않음 |
| FamilyRepository 추상화, 원격 계약(`FAMILY_REMOTE_CONTRACT`), 권한 엔진 | BACKEND READY | 서버가 생기면 같은 규칙으로 서버에서 필터링 |
| 다른 기기의 가족과 연결 | ACCOUNT REQUIRED | Newon+ 계정과 가족 서버가 필요. 프로덕션에 둘 다 없음 |
| RemoteFamilyRepository | FUTURE (disabled) | 모든 호출이 `ACCOUNT_REQUIRED`로 거절. 네트워크 요청 없음 |
| 실제 알림(문자·카카오톡·push) | FUTURE | 구현하지 않음 |
| LIVE | 없음 | 이 기능에는 서버를 거치는 부분이 없다 |

## 3. 파일

| 파일 | 역할 |
| --- | --- |
| `ongil-start/js/family-domain.js` | 모델, 상수, 정규화, 무작위 id·초대 코드 |
| `ongil-start/js/family-permissions.js` | 중앙 권한 엔진 (기본 거부) |
| `ongil-start/js/family-repository.js` | `LocalFamilyRepository`, 비활성 `RemoteFamilyRepository`, 원격 계약 |
| `ongil-start/js/family-service.js` | 초대·연결·공유·미리보기·가족 화면·도움 요청·활동 기록 |
| `ongil-start/js/family-connect-view.js` | 가족 화면의 연결 UI (기존 ONGIL 카드·필드·버튼만 사용) |
| `ongil-start/js/family-view.js`, `app.js`, `home-explore.js`, `account-view.js`, `storage.js`, `privacy.js` | 연결 지점 |
| `ongil-start/styles/ongil-care.css` | 초대 코드 줄바꿈 규칙 1개 (색·글꼴·크기 변경 없음) |
| `tests/ongil/family-connection.test.mjs` | FC-01 … FC-33 |

## 4. 모델

모든 기록은 PRIVATE 컬렉션 `family` 한 문서에 들어 있다 (동기화·검색·통계 대상 아님).

- **FamilyGroup** `fg_…` — 소유자 `ownerUserId`(`local_…`)
- **FamilyMember** `fm_…` — 이름, 관계, 역할(`FAMILY` / `CAREGIVER`), 상태(`ACTIVE` / `DISCONNECTED`)
- **FamilyInvitation** `fi_…` — 코드, 만료(하루 / 7일), 상태(`PENDING` → `ACCEPTED` / `DECLINED` / `EXPIRED` / `REVOKED`)
- **FamilyConnection** `fc_…` — 구성원과의 연결 (`ACTIVE` / `DISCONNECTED`)
- **SharingPermission** `fp_…` — 구성원 × 항목 × 수준(`SUMMARY` / `DETAIL`). 기록이 없으면 공유하지 않는 것
- **SharingConsent** `fs_…` — 민감 항목에 대한 본인의 동의 (`GRANTED` / `WITHDRAWN`)
- **SharingSnapshot** — 저장하지 않는다. `familyView(memberId)`가 그때그때 권한으로 만들어 낸다
- **HelpRequest** `fr_…` — `REQUESTED` → `SEEN` → `ACCEPTED` → `COMPLETED`, 또는 `CANCELLED`
- **FamilyActivityLog** `fa_…` — 행동, 행위자, 구성원, 항목, 수준, 상태만. 최근 200개

공유 항목 10가지: 안부, 일정, 복약*, 건강 기록*, 병원·검진 일정*, 활동, 식사, 수면, 도움 요청, 비상 연락 정보*
(* 민감 항목 — 항목마다, 구성원마다 따로 동의). 건강 메모·증상 내용·기록(일기)·생활비는 어떤 설정으로도 공유되지 않는다.

## 5. 권한 규칙

`family-permissions.js`만 "이 구성원이 이것을 볼 수 있는가"에 답한다. 화면에는 조건이 없다.

1. 기본은 거부. 다음이 **모두** 참일 때만 허용
   - 그룹이 있고 읽을 수 있다
   - 구성원이 `ACTIVE`이고 `ACTIVE` 연결이 있다
   - 그 구성원·항목의 권한 기록이 정확히 하나이고, 수준이 그 항목이 제공하는 수준이다
   - 민감 항목이면 그 구성원·항목에 대한 `GRANTED` 동의가 정확히 하나이고 수준을 덮는다
2. 연결 ≠ 공유. 초대를 받아 연결해도 권한 기록은 만들어지지 않는다
3. 구성원마다 독립. 한 구성원의 설정은 다른 구성원에게 영향을 주지 않는다
4. 가족 관리(초대, 공유, 중단, 해제)는 OWNER만. 구성원의 역할로는 통과하지 못한다
5. 손상되었거나, 다른 그룹·구성원을 가리키거나, 중복된 기록은 읽을 때 버려진다 → 공유되지 않은 것으로 처리
6. 공유되지 않은 항목은 가족 화면에 **없다** (흐림 처리 없음, 개수·이름 노출 없음). 서비스는 허용된 항목의 원본만 읽는다

민감 항목은 값이 아니라 사실만 나간다: 복약은 개수, 건강 기록은 "적었다/적지 않았다", 병원·검진은 날짜와 종류, 비상 연락은 인원수.
안부는 "안부를 남겼다"는 사실이며 안전이나 건강 상태에 대한 판단이 아니다.

## 6. 초대 코드

- `crypto.getRandomValues`로 만든 20자 (32자 알파벳, 100비트). 안전한 난수원이 없으면 초대를 만들지 않는다
- 헷갈리는 글자(0, 1, O, I) 없음. 표시는 `XXXXX-XXXXX-XXXXX-XXXXX`
- 한 번만 쓸 수 있고, 만료·취소·거절된 코드는 연결되지 않는다
- 코드는 `family` 문서에만 있다. 활동 기록, 주소(URL), 콘솔, 통계 어디에도 남지 않는다

## 7. 공유 중단과 연결 해제

| 행동 | 권한 | 동의 | 연결 | 열린 도움 요청 |
| --- | --- | --- | --- | --- |
| 항목 끄기 | 그 항목 삭제 | 그 항목 철회 | 유지 | 유지 |
| 이 가족과 공유 중단 | 그 구성원 전부 삭제 | 전부 철회 | 유지 | 유지 (가족은 더 이상 볼 수 없음) |
| 전체 공유 중단 | 모두 삭제 | 모두 철회 | 유지 | 유지 |
| 연결 해제 | 그 구성원 전부 삭제 | 전부 철회 | 종료 | 취소 |

## 8. 저장소와 서버 계약

`FamilyRepository { kind, mode, available, load(), save(state), clear() }`

- `createLocalFamilyRepository(storage)` — 지금 쓰는 것
- `createRemoteFamilyRepository()` — `available: false`. 모든 호출이 `FamilyRepositoryUnavailable (ACCOUNT_REQUIRED)`
- `selectFamilyRepository()` — 오늘은 항상 local
- `FAMILY_REMOTE_CONTRACT` — `status: NOT_IMPLEMENTED`, `/api/ongil/family/…` 12개 경로. 서버는 같은 권한 규칙으로 **응답 전에** 필터링해야 한다

서버를 붙일 때 필요한 것 (NEWON+ 의존): 프로덕션 계정 인증, 가족 데이터 저장소, 소유자와 구성원이 서로 다른 계정이라는 확인, 초대 코드의 서버 측 해시 저장과 시도 횟수 제한.

## 9. 검증

- `tests/ongil/family-connection.test.mjs` FC-01 … FC-33
- 브라우저 확인 (Chromium, 로컬 서버): 320 / 390 / 768 / 1440px, 720×450(200% 확대 상당) — 가로 넘침 0, 44px 미만 조작 요소 0, 16px 미만 글씨 0, 라벨 없는 입력 0, 콘솔 오류 0, 네트워크 요청 0
- 키보드: 폼 열면 첫 입력으로 초점, 오류 시 해당 입력으로 초점과 `aria-invalid`·`aria-describedby`, Escape로 폼·확인 닫기와 초점 복귀
- 확인하지 못한 것: 실제 화면낭독기(VoiceOver / TalkBack), 실제 iPhone Safari / Android 기기

## 10. 알려진 한계

- 가족 쪽 화면(초대 받기, 가족 화면, 도움 요청 응답)은 같은 기기에서만 열 수 있다
- 기기를 바꾸거나 브라우저 데이터를 지우면 가족 연결도 사라진다 (계정 동기화 대상 아님)
- 한 기기 안의 권한 검사는 서버의 접근 통제를 대신하지 못한다. 기기 저장소를 직접 여는 사람에게는 원본이 보인다
- 예전 "내가 공유할 내용" 설정은 그대로 남아 있으나 연결된 가족에게 자동으로 적용되지 않는다. 가족이 연결되면 그 카드는 숨겨진다
