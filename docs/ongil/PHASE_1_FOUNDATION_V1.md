# ONGIL PHASE 1 — FOUNDATION V1

- 작성일: 2026-10-02 (KST)
- Worktree: `~/Newon-ongil` · Branch: `ongil-foundation-v1` · Base: `07adb5275dcc2a36ddfcd3c3ef86de0cf15b49b3` (`origin/main`)
- 선행 문서: `MASTER_AUDIT_V1.md`, `PHASE_0_5_REPOSITORY_PLAN.md`
- 상태: 소스 작성·검증 완료, **commit 전** (commit은 사용자가 Mac 터미널에서 수행)

---

## OBJECTIVE

기능을 완성하는 단계가 아니다. 이후 모든 ONGIL 기능을 올릴 **기반**을 만든다.

- 단일 HTML에 섞여 있던 CSS·JS를 역할별 파일로 분리
- 8개 핵심 영역 + 저장·내 정보 화면, 통합검색·알림 패널
- local-first 저장 계층과 향후 계정 동기화가 붙을 경계
- Saved / Profile / Onboarding / Notification / Search의 실제 동작하는 기초
- 접근성 기초(시니어 기준)와 ONGIL 전용 테스트

디자인 원칙: 현재 `ongil-start`의 dark / film visual identity 유지. LIVON의 시각 디자인은 가져오지 않았다. LIVON에서 가져온 것은 패턴뿐이다(강요하지 않는 처음 설정 안내, 영상 멈춤 control, 정직한 빈 상태, local-first 저장 구조).

---

## FILES CREATED

```
ongil-start/
  styles/
    ongil-tokens.css     기존 디자인 값에 이름을 붙인 token
    ongil-shell.css      기존 inline CSS를 옮긴 것 (film, hero, chip, panel)
    ongil-app.css        Phase 1에서 추가한 component (폼, 목록, dialog, 상태)
  js/
    app.js               진입점, 조립
    storage.js           local-first 저장 계층 (ongil.v1.*)
    contracts.js         Profile · Preference · SavedItem · Notification 형식과 검증
    profile.js           Profile / Preferences 저장소
    saved.js             Saved 저장소
    onboarding.js        처음 설정 상태 (DOM 없음)
    notifications.js     알림 센터 기초
    account.js           계정 경계 (local mode, sync adapter 연결 지점)
    search.js            검색 기초 + provider 2개 (areas, saved)
    areas.js             정보 구조 정의 (8개 영역 + 저장 + 내 정보, module slot)
    router.js            hash router
    navigation.js        현재 메뉴 표시, 모바일 메뉴 닫기
    film.js              배경 영상 (필요할 때만 load, 멈춤 control)
    accessibility.js     글자 크기, skip link, 화면 전환 시 focus·title
    dom.js               DOM 생성 helper (textContent, safeHref)
    views.js             영역 화면 shell, region 상태(loading/empty/error)
    saved-view.js        저장 화면
    account-view.js      내 정보 화면
    onboarding-view.js   처음 설정 dialog, 홈 안내 카드
    panels.js            통합검색 · 알림 패널
tests/ongil/
  foundation-data.test.mjs    저장 namespace, contract, Saved (14)
  foundation-flows.test.mjs   Profile, Onboarding, 알림, 계정 경계, 검색, motion (16)
  shell.test.mjs              navigation, route, 접근성, 문구 정직성, 코드 위생 (25)
docs/ongil/
  PHASE_1_FOUNDATION_V1.md    이 문서
  MASTER_AUDIT_V1.md, PHASE_0_5_REPOSITORY_PLAN.md   (~/Newon에서 내용 변경 없이 복사)
```

## FILES MODIFIED

- `ongil-start/index.html` — 1개. inline `<style>` 약 290줄과 inline script 약 190줄 제거, 화면 구조 재작성(725줄 → 293줄).

수정하지 않은 것: `livon/`, `server/`, `api/`, `tests/livon/`, `newon-auth/`, 사이트 공용 CSS·JS, `scripts/`, `package.json`, `vercel.json`, 소개 페이지(`/{lang}/ongil/`).
`scripts/publish-site.mjs`는 `ongil-start/`를 하위 폴더까지 통째로 복사하므로(`copyDir`) 새 `styles/`, `js/`가 수정 없이 배포물에 들어간다.

---

## ARCHITECTURE

framework 없음. HTML + CSS + ES module. 새 dependency 없음, 새 외부 script 없음.

```
index.html ── styles/*.css
     └─ <script type="module" src="/ongil-start/js/app.js">
            │
            ├─ storage.js ──────────────── localStorage (막히면 memory)
            │     └─ subscribe(change) ─── account.js (sync adapter 연결 지점, 지금은 비어 있음)
            ├─ profile.js · saved.js · onboarding.js · notifications.js     ← 저장소 (DOM 없음)
            ├─ search.js  ← provider: areas, saved
            ├─ router.js  → navigation.js · film.js · accessibility.js
            └─ views.js · saved-view.js · account-view.js · onboarding-view.js · panels.js   ← 화면
```

규칙
1. 화면 코드는 `localStorage`를 직접 부르지 않는다. 저장소 → `storage.js`만 거친다(테스트 `OG-SEC-2`).
2. 화면 코드는 문자열로 markup을 만들지 않는다. `dom.js`의 `el()`만 쓴다(테스트 `OG-SEC-1`).
3. 저장소·계약·router·검색은 DOM 없이 동작한다. 그래서 dependency 없이 `node --test`로 검증된다.
4. ONGIL은 `livon/`, `server/livon/`을 import하지 않는다(테스트 `OG-SEC-3`).

제거한 것: 공용 `film-keep.js` load. 이 script는 멈춘 영상을 다시 재생시켜 멈춤 control과 양립할 수 없다. 공용 파일을 고치는 대신 ONGIL 전용 `film.js`로 대체했다.

### Design tokens

`ongil-tokens.css`는 기존 값에 이름만 붙였다. 새 색·글꼴·radius는 없다.

| 범주 | token (값) |
|---|---|
| background | `--og-bg` #000 · `--og-film-bg` #0a0a0a |
| surface | `--og-surface` #212121 · `--og-surface-deep` #101010 |
| text | `--og-ink` #e1e0cc · `--og-ink-soft` #dedbc8 · `--og-white` |
| muted | `--og-muted` #9ca3af |
| border | `--og-line`, `--og-line-strong` (ink의 투명도 변형. 폼·알림 상자용으로 추가) |
| accent | `--og-accent` #fff / `--og-accent-ink` #000 · `--og-glow` |
| radius | card 1.1rem · lg 1.5rem · panel 16px · input 10px · pill 9999px |
| shadow | wordmark / slogan / lead text-shadow, panel shadow |
| spacing | section 4.5rem · card 1rem · chip gap 0.7rem · wrap `min(1180px, 100% - 2rem)` |
| type | Almarai + Noto Sans KR · Instrument Serif(display) · hero / wordmark / slogan / h clamp 값 |
| control | `--og-control` 2.75rem(44px) · `--og-input` 3rem |
| transition | reveal 0.9s · hero 1s · press 0.2s |

### 기존 디자인에서 바뀐 것 (전부 접근성 목적, `ongil-shell.css`에 `[P1]` 주석)

| 항목 | 이전 | 이후 |
|---|---|---|
| 헤더 도구 버튼 크기 | 2.4rem (약 38px) | 44px |
| 헤더 도구 icon 색 | 본문 cream 색을 상속 → 흰 헤더 위에서 거의 안 보임 | 헤더 글자색(`--gnav-text-strong`) |
| hero 하단 문구 | 0.875rem / weight 300 / 흰색 75% | 1rem / 400 / 86% |
| film 설명문 최소 크기 | 0.9rem | 1rem |
| hero·film 버튼 글자 | 0.875rem | 1rem, 최소 높이 44px |
| panel 제목·설명 | 0.78rem / 0.82rem | 0.95rem |
| 배경 영상 | 7개 전부 자동 재생·미리 load, 멈춤 불가 | 보고 있는 화면 것만 load, 멈춤 버튼 |
| class 이름 | `livon-tool`, `livon-panel` | `og-tool`, `og-panel` (LIVON과 이름 충돌 제거) |
| 사용 안 하던 CSS | `.lm*`, `.noise-overlay`, `.og-about*` 등 | 제거 |

색, 글꼴, card·chip 모양, radius, film 구도, reveal animation은 그대로다.

---

## ROUTES

hash 기반(기존 방식 유지). `html[data-og-view]` + `main > [data-og-screen]`.

| View | 주소 | 이전 주소(계속 동작) | 화면 |
|---|---|---|---|
| HOME | `#ongil-home` | `#home`, `#support`, 주소 없음 | hero + 홈 shell |
| MY_LIFE | `#life` | | film + shell |
| HEALTH | `#health` | | film + shell |
| FAMILY | `#family` | `#share` | film + shell |
| CARE | `#care` | | film + shell |
| ENJOY | `#enjoy` | `#learn` | film + shell |
| COMMUNITY | `#community` | | film + shell |
| STORE | `#store` | (신규) | 영상 없는 film + shell |
| SAVED | `#saved` | (이전에는 홈으로 연결) | 저장 화면 |
| ACCOUNT | `#account` | `#profile`, `#settings` | 내 정보 화면 |

Overlay(화면이 아니라 패널): SEARCH, NOTIFICATIONS.
route가 아닌 hash는 현재 화면을 바꾸지 않는다. `index.html` 머리의 pre-paint map은 `router.js`의 표와 같아야 하며 테스트(`OG-RT-3`)가 확인한다.

메뉴 이름: 건강 관리 → **건강·안부**, 가족 연결 → **가족**, 돌봄·생활 서비스 → **돌봄·서비스**, 배움·여가 → **즐길거리**, **스토어** 추가.

### View shell 구성

각 영역 = film header(기존) → 영역 제목·설명 → 알림 문구(제약이 있는 영역) → 주 내용 region(빈 상태) → module slot 목록.
module slot은 전부 `available: false`이고 화면에 "준비 중"으로 표시된다. 가짜 데이터는 없다.

| 영역 | slot (`data-og-slot="<area>.<id>"`) |
|---|---|
| home (9) | greeting, check-in, schedule, medication, life-check, family-update, today, nearby, quick-actions |
| life (8) | calendar, tasks, routine, meals, exercise, sleep, expenses, journal |
| health (8) | check-in, life-check, help, contacts, medication, hospital, checkup, records |
| family (5) | connect, sharing, schedule, messages, requests |
| care (11) | care, visit, hospital-escort, mobility, meals, housekeeping, shopping, housing, digital, welfare, nearby |
| enjoy (8) | hobby, learning, exercise, culture, outing, travel, programs, groups |
| community (4) | feed, neighborhood, groups, mine |
| store (10 분류) | safety, health-living, kitchen, bath-home, walking, exercise, hobby, digital, smart-device, gift |

`views.js`의 `setRegionState(region, 'loading' | 'empty' | 'error' | 'ready', message)`가 모든 region의 공통 상태 표시다.

---

## STORAGE

- key: `ongil.v1.<collection>`. collection은 `profile`, `preferences`, `onboarding`, `saved`, `notifications` 5개. 그 외 이름은 거부한다(건강·가족 collection은 의도적으로 없음).
- API: `get(collection, fallback)`, `set`, `remove`, `list()`, `clear()`, `subscribe(fn)`.
- 깨진 값(JSON 오류, 객체가 아닌 값)은 없는 것으로 취급하고 다음 저장 때 덮어쓴다.
- `localStorage`가 막히거나 가득 차면 memory로 동작하고 `persistent: false`를 알린다(내 정보 화면에 안내 문구 표시).
- `clear()`는 ONGIL key만 지운다. `livon.*`, `newon*`는 건드리지 않는다.

### Data contracts

구현: `Profile`, `Preference`, `SavedItem`, `Notification`(형식만).
이름만 예약(`FUTURE_CONTRACTS`): CheckIn, CalendarEvent, Task, Routine, Medication, FamilyConnection, FamilyPermission, CareService, Program, Place, CommunityPost, Product, Notification.

- Profile: `nickname`(20자), `usageMode`, `ageRange`, `region`(17개 시·도), `interests[]`, `needs[]`, `familyIntent`. 실명·생년월일·전화·주소·건강 정보는 받지 않으며, 알 수 없는 필드는 버린다.
- Preference: `textSize`(default/large/xlarge), `motion`(system/on/off), `notifications`(9개 유형별 on/off, 기본 전부 off).
- SavedItem: `type`, `id`, `title`, `description`, `href`, `source`, `savedAt`. `href`는 앱 내 hash, 같은 사이트 경로, https만 허용.

---

## SAVED

- 유형: SERVICE, BENEFIT, FACILITY, PROGRAM, PLACE, POST, PRODUCT
- 동작: `save`, `unsave`, `toggle`, `isSaved`, `list({ type })`, `count`, `counts` — 최신순, 중복 방지(key = `type:id`), 최대 500개
- 화면(`#saved`): 유형별 필터(개수 표시), 항목 목록, 저장 취소, 빈 상태
- **한계**: Phase 1에는 저장할 대상(서비스·프로그램 등)이 아직 없어 화면에서 무언가를 저장하는 버튼이 없다. 저장 기능 자체는 동작하며(테스트 + 브라우저에서 `Ongil.saved.save(...)`로 확인), 이후 Phase에서 각 항목 카드가 `saved.toggle()`을 부르면 된다.

## ACCOUNT MODE

**LOCAL-FIRST / ANONYMOUS-CAPABLE.** 로그인 없음, 서버 호출 없음.

- 내 정보 화면이 "이 기기에서만 사용 중"임과 Newon+ 계정 연결이 아직 없음을 문장으로 밝힌다.
- `account.js`가 유일한 계정 연결 지점이다. `connectSyncAdapter({ id, isConfigured(), push(change) })`
  - 형식이 틀리거나 `isConfigured()`가 true가 아니면 거부(fail-closed) → local mode 유지
  - 연결돼도 **이미 기기에 있던 데이터는 올리지 않는다.** 이후 변경만 전달. 첫 import는 사용자 선택으로 따로 설계해야 한다.
  - adapter가 실패해도 local 동작은 계속된다.
- `newon-auth/`는 load하지 않았다. Newon+가 준비되면 `newon-auth`의 인증 상태를 adapter로 감싸 여기에 연결한다. 화면은 다시 만들 필요가 없다.

내 정보 화면 구성: 사용 상태 · 내 정보(별명, 사용자, 연령대, 지역, 관심, 필요한 도움) · 보기 설정(글자 크기, 배경 영상) · 알림 설정 · 가족 연결(준비 중 안내) · 처음 설정 다시 하기 · 이 기기의 ONGIL 데이터 지우기(확인 단계 있음).

## ONBOARDING

- 흐름: 환영 → 누가 사용 → 연령대 → 지역 → 관심 → 필요한 도움 → 알림 → 가족 연결 → 완료. 한 화면에 질문 하나, 질문 7개.
- 강제 dialog가 아니다. 홈의 안내 카드, 첫 방문 시 hero의 "시작하기", 내 정보에서만 열린다.
- 모든 질문은 답하지 않고 넘어갈 수 있다. "나중에 하기"와 Esc로 언제든 나가며 초안은 보존된다.
- 답은 마지막에만 Profile / Preferences에 반영된다. 완료 후에도 다시 할 수 있고 내 정보에서 항목별로 고칠 수 있다.
- **가족 연결**: "지금 연결하고 싶어요"를 골라도 연결되지 않는다. 원한다는 것만 `familyIntent`에 기록하고, 질문 화면과 완료 화면 모두 그 사실을 문장으로 알린다. `familyConnection()`은 항상 `NOT_AVAILABLE`.
- 알림 질문에도 "알림 보내기는 아직 연결되지 않았다"는 문구가 있다.

## SEARCH / NOTIFICATIONS

- 검색: 고정 응답("결과 없음" 문구)을 제거하고 provider 구조로 교체. provider = `{ id, label, search(query) }`.
  - 현재 provider: `areas`(ONGIL 메뉴와 그 안의 항목), `saved`(저장한 항목). 둘 다 실제 local 데이터.
  - 결과가 없으면 없다고 말하고 지금 무엇을 찾을 수 있는지 알린다. 준비 중인 항목은 결과에 "(준비 중)"으로 표시.
  - provider 하나가 실패해도 나머지는 동작. 결과의 제목·링크는 검증 후 표시.
- 알림: 목록(현재 비어 있음), 읽음 처리, 유형별 설정 9개(CHECK_IN, SCHEDULE, MEDICATION, FAMILY, SERVICE, PROGRAM, COMMUNITY, STORE, SYSTEM). push·서버 알림 없음(`DELIVERY = { push: false, server: false }`)이며 패널과 설정 화면이 이를 알린다. 가짜 알림을 만드는 코드는 없다.
- ONGIL AI: UI 없음. `areas.js`의 `GLOBAL_ENTRIES`에 `assistant`가 `enabled: false`로 예약되어 있다.

---

## ACCESSIBILITY

적용
- `lang="ko"`, 영문 wordmark에 `lang="en"`
- landmark: `header`, `nav`(이름 있음), `main` 1개, skip link(route를 바꾸지 않고 본문으로 이동)
- 화면마다 `h1` 1개, 이후 `h2 → h3 → h4`
- 모든 버튼·링크에 이름, 모든 입력에 label, 장식 icon은 `aria-hidden`
- 화면 전환 시 document title 변경, 해당 화면 제목으로 focus 이동
- dialog는 native `<dialog>`(focus가 안에 머물고 닫으면 연 곳으로 복귀), 패널은 Esc로 닫히고 focus 복귀
- 상태 알림: 검색 결과 수, 저장·설정 변경 결과가 `role="status"`로 전달
- 배경 영상: markup에 autoplay 없음, 영상마다 "영상 멈춤 / 영상 재생" 버튼, 기기의 '동작 줄이기' 설정이면 처음부터 정지. 선택은 저장됨
- 글자 크기 설정(기본 / 크게 112.5% / 아주 크게 125%) — 페이지 전체가 함께 커짐
- 조작 요소 최소 44px, 본문 최소 16px·regular
- 선택 상태를 색으로만 표시하지 않음(체크 표시, native checkbox·radio 노출, 현재 메뉴 밑줄)
- focus 표시: 어두운 배경 위 흰색 3px outline

확인하지 못한 것 (NOT VERIFIED)
- 실제 screen reader(VoiceOver, TalkBack) 사용 확인
- 영상 위 글자의 명도 대비 — 영상 프레임에 따라 달라지며, 검증 환경에서는 외부 영상을 받을 수 없었다
- 200% 확대에서의 실제 사용성(가로 넘침이 없다는 것만 확인)
- WCAG 2.2 AA 적합 여부 자체는 판정하지 않는다

## RESPONSIVE

기존 breakpoint 유지(1100 / 860 / 700px). headless Chromium으로 1440×900, 820×1100, 390×800에서 10개 화면 전부 확인:
- 가로 넘침 0건, 44px 미만 조작 요소 0건, console·page 오류 0건
- 700px 이하: 상단 메뉴는 햄버거 sheet(8개 영역 + 저장 + 내 정보), 헤더에는 검색·알림만, 패널은 화면 폭에 맞춰 고정
- 모바일 sheet에서 메뉴를 고르면 sheet가 닫힌다(기존에는 열린 채로 남았다)
- onboarding dialog, 내 정보 폼, 저장 목록이 390px에서 한 열로 정리됨

---

## TESTS

```
node --test tests/ongil/*.test.mjs
```

- 3개 파일, **55 tests, 55 pass**. dependency 불필요(Node 내장 test runner만 사용).
- 범위: 저장 namespace와 실패 처리, contract 검증, Saved 동작, Onboarding 상태, 알림, 계정 local mode와 adapter 경계, 검색, 8개 영역·route·pre-paint map 일치, landmark·중복 id·aria 참조·이름 없는 control, 영상 autoplay 금지, 디자인 token 값, 거짓 문구 금지, 스토어에 결제 관련 코드 없음, 건강·가족 자동화 코드 없음, innerHTML 금지, storage 직접 접근 금지, network 호출 금지, import 경로.
- 브라우저 확인(위 RESPONSIVE 항목)은 임시 script로 수행했고 repository에는 넣지 않았다(Playwright dependency를 추가하지 않기 위해).
- `tests/livon`은 실행하지 않았다: 이 worktree에 `node_modules`가 없다(`pg` 필요). LIVON 파일은 수정하지 않았다.

---

## KNOWN LIMITATIONS

| 항목 | 상태 |
|---|---|
| Account backend | 없음. local mode만. Newon+ 인프라가 보류 상태(`docs/newon/livon-public-anonymous-mode.md`) |
| Family backend | 없음. 연결·공유·권한 전부 미구현. shell과 안내 문구만 |
| Health backend | 없음. 건강·안부 데이터를 저장하는 collection 자체가 없다 |
| Notifications backend | 없음. push·서버 발송·예약 없음. 설정과 빈 목록만 |
| Store checkout | 없음. 결제·주문·배송·재고·가격 코드 없음. 분류 slot과 빈 상태만 |
| AI | 없음. entry 예약만 |
| Search | 메뉴와 저장 항목만. 서비스·프로그램·장소 provider는 이후 Phase |
| Saved | 저장할 대상이 아직 없어 화면에 저장 버튼이 없다 |
| 다국어 | 언어 선택기는 남아 있으나 제품 shell은 한국어만 |
| 홈 제목 | 검은 글자라 영상 프레임이 그려지기 전에는 ink 색으로 대체한다. 홈 영상의 poster 이미지가 repository에 없어 정지 화면은 브라우저가 첫 프레임을 그려 주는지에 달려 있다 |
| 영상 복구 | `film-keep.js`의 재생 복구(정지·끊김 시 재시도)를 쓰지 않는다. 화면 전환·탭 복귀 때만 다시 재생을 시도한다 |
| cache | `app.js`에만 `?v=`가 붙는다. 하위 module은 브라우저 cache 정책을 따른다. module을 고치면 `index.html`의 `?v=`를 올려도 하위 파일은 즉시 갱신되지 않을 수 있다 |
| 헤더 | 사이트 공용 gnav(밝은 테마)를 그대로 쓴다. 어두운 본문과의 대비는 기존 디자인 그대로 |
| `window.Ongil` | 저장소·router handle을 노출한다(확인·이후 Phase 연결용). 같은 origin의 script는 원래 localStorage에 접근할 수 있으므로 새 권한은 아니다 |

SHARED CHANGE REQUIRED: 없음. 권장(선택)만 있다.
- `package.json`에 `"test:ongil": "node --test tests/ongil/*.test.mjs"` 추가
- `scripts/ci/fast-check.mjs`가 `tests/ongil`도 돌리도록
- `vercel.json` CSP는 Report-Only이며 ONGIL은 `'self'` script만 추가했다(변경 불필요)

---

## 사용자가 Mac에서 할 일

```bash
cd ~/Newon-ongil

# 1. 테스트 (dependency 불필요)
node --test tests/ongil/*.test.mjs

# 2. 화면 확인
python3 -m http.server 8765
#    → http://localhost:8765/ongil-start/

# 3. commit
git status
git add ongil-start tests/ongil docs/ongil
git commit -m "ONGIL Foundation V1: app structure, 8 areas, local-first storage, saved, account, onboarding, accessibility base"

# 4. push (upstream이 origin/main으로 잡혀 있으므로 대상을 명시)
git push -u origin ongil-foundation-v1

# (선택) LIVON 테스트까지 돌리려면
npm ci && npm run test:livon
```

---

## PHASE 2A HANDOFF — HOME V1

채울 자리
- `[data-og-modules="home"]` 안의 `[data-og-region="primary"]` — 지금은 빈 상태. `setRegionState(region, 'ready')` 후 내용을 넣는다.
- `[data-og-slot="home.<id>"]` 9개 — 구현되면 `areas.js`에서 해당 slot의 `available`을 true로 바꾸고 slot 자리를 실제 module로 교체한다.
- `[data-og-extra="home"]` — 처음 설정 안내 카드가 쓰는 자리.

이미 쓸 수 있는 것
- `profile.getProfile()`의 `nickname`, `region`, `interests`, `needs` → 오늘의 인사, 주변 추천, 오늘 뭐 하지?의 입력
- `saved` 저장소 → 빠른 실행, 저장 버튼
- `search.registerProvider()` → 새 데이터가 생기면 검색에 연결
- `notifications.add()` → 일정·복약 알림(앱 안 표시)

Phase 2A 전에 정할 것
1. 새 collection 이름(예: `tasks`, `calendar`) — `storage.js`의 `COLLECTIONS`와 `contracts.js`에 추가. My Life(2B)와 공유되므로 2A에서 함께 정한다.
2. 안부(check-in)를 Phase 2A에 넣을지, 민감정보 설계가 끝나는 Phase 3로 미룰지.
3. 홈 영상의 poster 이미지 제공 여부.
4. 주변 추천의 데이터 출처(기존 `/api/livon/data`의 장소·평생교육 provider 사용 여부. 실제 key 검증 전).
