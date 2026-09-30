# LIVON 공개 익명 모드 (로그인 없는 무료 서비스)

결정: 2026-09-30

## 정책

LIVON은 **회원가입·로그인 없이 누구나 무료로 바로 쓰는 서비스**로 먼저 공개합니다.

NEWON+ 로그인은 나중에 LIVON, 11개 앱, ONGIL, SHAREON, Newon AI, 이후 Newon 서비스 전체를 잇는 **중앙 Identity**로 따로 설계합니다. 그래서 LIVON 전용 Firebase 인증을 지금 LIVE로 연결하지 않습니다.

## 지금 하지 않는 것 (보류)

- Newon+ Firebase 프로젝트 생성, Firebase Authentication LIVE 연결
- 계정용 Neon DB 생성
- `/api/livon/userdata` 활성화(`LIVON_USERDATA_ENABLED`는 Production에서 계속 true가 아님)
- 계정 동기화 LIVE, 로그인 공개
- GitHub Actions의 `NEWON_PLUS_*` Variables 입력

기존 LIVON AI 인프라(Vercel API, Upstash 등)는 그대로 둡니다. 계정·동기화용 **신규** 인프라만 보류합니다.

## 사용자 경험

- **접속하면 바로 이용**: 로그인·회원가입·결제 wall이 없습니다(코드 점검 + 테스트 AN-2 + 브라우저 QA).
- **개인 저장은 local-first**: 저장, 관심 항목, 체크리스트, 할 일·목표·일정, 설정, AI에서 저장한 계획이 이 브라우저의 localStorage에 저장됩니다. 서버 accountId를 요구하지 않습니다.
- **민감 정보**: 건강, 가계부, 일기, 예산, 개인 일정, 가족 정보는 이 기기에만 저장합니다. 로그인 없는 상태에서 서버에 사용자별로 영구 저장하지 않습니다.
- **저장 안내**: 저장 기능 첫 사용 시 **세션당 한 번**만 다음 문구를 보여 줍니다.
  > 현재 이 기기에 저장됩니다. 브라우저 데이터를 삭제하거나 다른 기기에서 이용하면 저장 내용이 유지되지 않을 수 있습니다.
- 기존 설정·폼 화면의 "이 기기에 저장됩니다" 안내 문구는 그대로 둡니다. 디자인은 바꾸지 않았습니다.

## 이번에 바꾼 것 (최소 수정)

| 파일 | 변경 |
|---|---|
| `livon/life-hub.js` | 저장 전 모달의 "Newon+ 로그인이 필요해요" 안내와 "Newon+ 알아보기" 링크 → 이 기기 저장 안내로 바꿈. 세션당 1회는 기존과 같음 |
| `livon/life-page.js` | 관심 서비스 저장 시 매번 뜨던 안내 → 세션당 1회(같은 세션 키 공유), 문구를 위 안내로 바꿈 |
| `livon/index.html` | 안내 모달 두 곳의 제목 "로그인이 필요합니다" → "안내", 기본 문구를 위 안내로 바꿈. 스크립트 캐시 버전 갱신 |
| `livon/data/livon-auth-bridge.js` | **출시 스위치** `window.LIVON_ACCOUNT_SYNC_PUBLIC === true`일 때만 계정 동기화 시작(기본 꺼짐) |
| `livon/livon-account-ui.js` | 같은 스위치가 꺼져 있으면 계정 패널과 동의 창을 그리지 않음 |
| `tests/livon/account-backend.test.mjs` | AB-28/AB-29는 스위치를 켠 출시 상태로 기존 검증 유지. AN-1(스위치 꺼짐 = 동기화·UI 없음), AN-2(로그인·결제 wall 없음, 저장 안내 세션 1회) 추가 |

**스위치를 둔 이유**
- 지금도 Newon+ 웹 설정이 없으면 로그인 UI가 나타나지 않습니다(기존 조건부 노출).
- 그런데 NEWON+가 공통 Identity가 되어 사이트 전체에 웹 설정이 들어가는 순간, LIVON에도 로그인 버튼과 동기화가 자동으로 켜질 수 있습니다.
- 스위치는 이를 막고, LIVON 출시를 **별도 결정**으로 남깁니다.
- 스위치는 코드에서 켜지 않습니다(테스트로 확인). 출시 때 빌드 설정으로 켜는 것은 후속 작업입니다.

## 그대로 보존한 것 (재설계·폐기 없음)

`livon-account-backend-v1` / `97c36f80c` 전체를 그대로 둡니다.
- **서버**: 계정 API, PostgreSQL 스키마(migration 001), Firebase 토큰 검증기(Google 인증서 RS256), `(issuer, subject)` → 서버 소유 accountId
- **클라이언트**: 동의 창, 민감 정보 opt-in, 동기화 엔진, 계정 분리(보관함 교체·세대 번호·세션 고정), tombstone과 revision 충돌 제어
- **QA·문서**: QA 도구와 LIVE CONFIG 문서(`docs/livon-live-config` 브랜치)

## 향후 NEWON+ 연결 경로

익명 로컬 데이터를 NEWON+ 계정으로 옮기는 경로는 그대로 쓸 수 있습니다.

1. **첫 로그인**: 이 기기 데이터 개수만 보여 줍니다(`planLoginImport`). 자동 업로드는 없습니다.
2. **사용자 선택**: 일반 항목은 기본 체크, 민감 항목은 해제 상태로 시작합니다. 직접 고른 것만 올라갑니다(`approveImport`).
3. **보관**: 익명 데이터는 `livon.vault.anon.v1`에 남고, 로그아웃하면 복원됩니다.
4. **동기화**: 계정 데이터는 서버 소유 accountId로 저장되고 동기화됩니다.

기존 localStorage 키와 구조를 바꾸지 않았으므로, 지금 쌓이는 익명 데이터도 그대로 이 경로를 탑니다.

## 확인 결과 (2026-09-30)

- **Firebase 없이**: 설정이 `null`이면 SDK를 불러오지 않고, Firebase·토큰 요청이 0건입니다. 오류도 없습니다.
- **Neon 없이**: 페이지는 `/api/livon/userdata`를 호출하지 않습니다(0건). 직접 호출하면 503 `SYNC_NOT_AVAILABLE`(fail-closed)입니다.
- **계정용 Upstash 없이**: 익명 이용과 무관합니다. 계정 라우트가 꺼져 있어 제한 저장소를 사용하지 않습니다.
- **새로고침 유지**: 할 일, 라이프 스테이지 허브 저장이 새로고침 후에도 남습니다(Chromium 320/390/768/1440, 모바일 에뮬레이션).
- **Safari·실기기**: 이 환경에 WebKit이 없어 확인하지 못했습니다. 공개 전에 Safari(macOS·iOS)에서 한 번 확인이 필요합니다.
