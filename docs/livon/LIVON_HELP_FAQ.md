# LIVON Help & FAQ V1 — Help Center, Contextual Help, Troubleshooting

Status: local prototype on branch `livon-help-faq-v1`, built on `70b24646d` (Community + Onboarding V1, which contains
Onboarding V1, Admin Local V1 and Data Manager V1). Not deployed.

Help describes what LIVON does **today**. It never presents an account, sync, follow, a report server, a live AI
backend or an inquiry desk as available, because none of them exist in this build.

| File | Role |
| --- | --- |
| `livon/help-data.js` | **new** — all Help content as data: facts, categories, 68 articles, synonyms, service status, contextual map |
| `livon/help-page.js` | **new** — router, renderer, search, keyboard, `LivonHelp.link()` for contextual help |
| `livon/help-page.css` | **new** — styles scoped to `#help` |
| `livon/index.html` | `<section id="help">`, three asset tags, 도움말 in the profile menu and the mobile menu |
| `livon-onboarding.js`, `life-now-page.js`, `community-page.js`, `ai-page.js`, `life-hub.js` | contextual help links |
| `livon/admin/*` | three read-only System rows (Help Content, Help Verification, Support Backend) |
| `tests/livon/help.test.mjs` | HF-1 … HF-53, copy quality, performance |

## Audit

What a user could find about each topic before this work (in-screen notes, empty states, dialogs), and after.
EXISTS = already explained well enough in the screen · PARTIAL = a one-line note only · MISSING = nothing ·
OUTDATED = an explanation that no longer matched the feature · NOT APPLICABLE = not user help.

| Topic | Before | Where it was | After |
| --- | --- | --- | --- |
| No sign-up needed | PARTIAL | onboarding welcome note | `no-signup` |
| What LIVON is | PARTIAL | onboarding welcome note | `what-is-livon` |
| Login / NEWON+ status | MISSING | — | `account-status` |
| Where to send a question | MISSING | — | `contact-support` (says there is no inquiry channel) |
| Where my data is kept | PARTIAL | save dialog, community compose note | `local-data-storage` |
| What is kept / not on a server | MISSING | — | `what-is-stored` |
| Other device | PARTIAL | community not-found page | `other-device` |
| Clearing browser data | PARTIAL | save dialog | `clear-browser-data` |
| "Storage is blocked" notice | PARTIAL | onboarding foot note | `storage-blocked` |
| Moving to another device | MISSING | — | `move-device` |
| Future account | MISSING | — | `future-account` |
| How Save works | PARTIAL | save dialog | `save-items` |
| Why the three questions | PARTIAL | onboarding step leads | `why-ask-profile` |
| Where personalization is kept | PARTIAL | onboarding foot note | `personalization-storage` |
| Redo onboarding | PARTIAL | button in My Life settings | `onboarding-restart` |
| What reset clears | PARTIAL | confirmation dialog | `personalization-reset` |
| Recommendation reasons | MISSING | — | `recommendation-reason` |
| Life Event without a guide | PARTIAL | onboarding preview note | `life-event-no-guide` |
| Other age bands | MISSING | — | `other-life-stages` |
| Is AI used for recommendations | MISSING | — | `recommendation-ai` |
| How recommendations are decided | MISSING | — | `how-recommendation-works` |
| "나중에 할게요" | MISSING | — | `onboarding-skip` |
| Resume | PARTIAL | resume note | `onboarding-resume` |
| Where to change preferences | PARTIAL | My Life settings | `change-preferences` |
| What a Life Event is | MISSING | — | `what-is-life-event` |
| What Life Stage is | PARTIAL | Life Stage intro copy | `what-is-life-stage` |
| Topic pages | PARTIAL | checklist note | `life-stage-topics` |
| What Today is | PARTIAL | Today intro copy | `what-is-today` |
| Today and personalization | MISSING | — | `today-personalization` |
| What My Life is | PARTIAL | My Life intro copy | `what-is-my-life` |
| Reset / delete scopes | MISSING | — | `my-life-reset-scope` |
| What Explore searches | PARTIAL | Explore intro copy | `explore-search` |
| "공식 출처" badge | MISSING | — | `official-badge` |
| Two searches | MISSING | — | `search-difference` |
| Real-time public data | PARTIAL | "준비 중" empty states | `live-data` |
| Where posts are kept | PARTIAL | compose note | `community-post-storage` |
| No other people's posts | PARTIAL | feed empty state | `community-no-other-posts` |
| Following is empty | PARTIAL | following empty state | `community-following` |
| Does a report reach anyone | PARTIAL | report dialog | `community-report` |
| Reporting twice | MISSING | — | `community-report-duplicate` |
| Text closed while writing | PARTIAL | compose autosave line | `community-autosave` |
| Draft vs. autosave | MISSING | — | `community-draft-vs-autosave` |
| Deleting a post | PARTIAL | delete confirmation | `community-delete-post` |
| No reaction count | MISSING | — | `community-reaction-count` |
| For You order | PARTIAL | For You note | `community-for-you` |
| Shared link does not open | PARTIAL | share note, not-found page | `community-share-link` |
| What not to write | EXISTS | 커뮤니티 › 안전 guidelines | `community-guidelines` (links there) |
| Display name | PARTIAL | profile card | `community-display-name` |
| Clearing community data | PARTIAL | reset block | `community-reset` |
| "관련 LIVON 정보" | PARTIAL | empty-state sentence | `community-related-info` |
| Six post types | MISSING | — | `community-post-types` |
| Comments, replies, reaction, save | MISSING | — | `community-comments` |
| Finding posts | MISSING | — | `community-search-filter` |
| Is LIVON AI usable now | PARTIAL | AI connection note | `ai-status` |
| What AI uses | EXISTS | AI settings note | `ai-what-it-uses` (same facts) |
| AI saving to My Life | PARTIAL | approval dialog | `ai-save-to-my-life` |
| Personalization sent to AI | MISSING | — | `ai-personalization` |
| Troubleshooting (11 problems) | MISSING | — | `ts-*` |
| Service status overview | MISSING | — | `#help/status` |
| My Life data export | OUTDATED | a click handler exists but no button renders it | not offered in Help (see Known gaps) |
| Guide FAQ in `life-app.js` | NOT APPLICABLE | file not loaded by LIVON | — |
| Admin, Data Manager | NOT APPLICABLE | local tools, never published | — |

Totals: EXISTS 2 · PARTIAL 33 · MISSING 24 · OUTDATED 1 · NOT APPLICABLE 2. No existing help page or FAQ list existed,
so nothing was duplicated: the in-screen notes stay, and now link into Help where confusion is likely.

## Information architecture

```
Help Home (#help)
 ├─ search (#help/search?q=…)            results by relevance · zero-result guidance
 ├─ categories (#help/c/{id})            FAQ accordion: question → short answer → "자세히 보기"
 │    └─ article (#help/a/{id})          answer · explanation · steps · note · feature link · related help
 ├─ troubleshooting (#help/c/troubleshooting)   symptom · possible reasons · what to do
 └─ service status (#help/status)
contextual links on other screens ──► article
```

Every page has a way on: breadcrumb, Help Home, search, related help, the related LIVON screen.
Entry points: profile menu (도움말), mobile menu (도움말), My Life settings, and the contextual links below. Help is
not a top-level service in the main navigation.

## Categories

시작하기 (4) · 저장·데이터 (8) · 맞춤 설정 (13) · 라이프 스테이지 (2) · 오늘의 발견 (2) · 내 생활 (2) · 탐색·검색 (4) ·
커뮤니티 (18) · LIVON AI (4) · 문제 해결 (11) — 68 articles.

## Article schema

```js
{
  id: "community-following",          // stable, readable, used in the URL — never renumbered
  cat: "community",
  title: "팔로잉은 왜 비어 있나요?",
  short: "…",                          // the answer in one or two sentences (≤ 140 characters)
  body: ["…"], steps: ["…"], note: "…", // all optional: a short question stays short
  ts: { symptom, causes: [], fixes: [] }, // troubleshooting only
  related: ["…"],                      // 2–4 real article ids
  feature: ["커뮤니티 피드", "#cm-home"], // the LIVON screen this is about
  kw: ["팔로잉", "follow", …],          // search keywords
  v: "CODE_VERIFIED",                  // CODE_VERIFIED | DOC_VERIFIED | PRODUCT_POLICY — internal, never shown
  hf: "HF-16", popular: true
}
```

Numbers are not typed into the text: `{lifeStages}`, `{topics}`, `{postTypes}`, `{lifeEvents}` are filled from `facts`.

## Search

Runs in the browser over the bundled articles (`LivonHelp.search(q)`); nothing is requested and nothing is stored.

- Normalization: Unicode NFC, lower case, punctuation and repeated spaces removed; spacing inside words is ignored.
- Korean: common particles and endings are stripped to a stem (저장이 → 저장); question words are ignored; "안 돼요 /
  안됨 / 오류" style words are not topics but raise troubleshooting articles.
- Score: whole query in the title 40 · equal to a keyword 34 · inside a keyword 26 · in the short answer 12 · in the
  body 6; per word: title 10 · keyword 8 · category 4 · short answer 4 · feature 3 · body 2; a synonym match counts half.
- Articles matching every word come first. If none does, articles matching some words are shown and the page says so.
- 62 queries are checked in HF-9 (expected article within the top three, no zero result).

## Synonyms

29 groups built from the words the articles actually use — 계정/로그인/회원가입/NEWON+, 저장/보관, 기기/휴대폰/브라우저,
삭제/초기화/지우기, 추천/맞춤/개인화, 나이/연령대/Life Stage, 글쓰기/게시글/커뮤니티, 신고/report, AI/인공지능/챗봇,
찾기/검색/탐색, 팔로우/follow/구독 … A group with no matching article fails the tests.

Zero result: what to check, other words to try (real synonyms that do have results), and the category list. No article
is invented and there is no "send an inquiry" button.

## Contextual help

Eight entries, only where confusion is likely (`LivonHelp.link(id, label)`; nothing is rendered if Help is not loaded).

| Screen | Link text | Article |
| --- | --- | --- |
| Onboarding dialog | 맞춤 설정은 어디에 저장되나요? | `personalization-storage` |
| Onboarding, storage blocked | 저장이 막혀 있다는 뜻은? | `storage-blocked` |
| My Life › 설정 › 맞춤 설정 | 초기화하면 무엇이 지워지나요? | `personalization-reset` |
| Community › 팔로잉 (empty) | 팔로잉이 왜 비어 있나요? | `community-following` |
| Community › 신고 dialog | 신고가 운영자에게 전달되나요? | `community-report` |
| Community › 기록 지우기 | 자세히 | `community-reset` |
| LIVON AI connection warning | LIVON AI는 지금 사용할 수 있나요? | `ai-status` |
| Save confirmation | 내 정보는 어디에 저장되나요? | `local-data-storage` |

A link inside a dialog closes the dialog and keeps what was entered (the onboarding draft, for example).

## Troubleshooting

저장이 안 돼요 · 저장한 내용이 사라졌어요 · 다른 기기에서 내용이 안 보여요 · 추천이 나와 맞지 않아요 · 처음 설정 안내가 다시 안
떠요 · 커뮤니티 글이 안 보여요 · 보낸 커뮤니티 링크가 안 열려요 · 팔로잉이 비어 있어요 · 신고가 전송되지 않아요 · AI가 동작하지
않아요 · 검색 결과가 없어요. Each: 증상 → 가능한 이유 → 해결 방법.

## Service status

Plain Korean labels — 사용 가능 · 이 기기에서만 · 아직 연결 안 됨 — each row tied to a `fact`:

| Row | State | Fact |
| --- | --- | --- |
| LIVON 기본 기능 | 사용 가능 | help: READY |
| 맞춤 설정 | 이 기기에서만 | personalization: LOCAL_RULE_BASED |
| 저장·내 생활 | 이 기기에서만 | sync: NOT_CONNECTED |
| 커뮤니티 글·댓글 | 이 기기에서만 | communityPosts: LOCAL |
| 커뮤니티 팔로우 | 아직 연결 안 됨 | follow: ACCOUNT_REQUIRED |
| 커뮤니티 신고 | 이 기기에서만 | reports: LOCAL_ONLY |
| LIVON AI | 아직 연결 안 됨 | ai: NOT_CONNECTED |
| 실시간 공공 데이터 | 아직 연결 안 됨 | liveData: NOT_CONNECTED |
| 계정·기기 간 동기화 | 아직 연결 안 됨 | account: NOT_CONNECTED |
| 문의 접수 | 아직 연결 안 됨 | support: NOT_CONNECTED |

The page says it is a description of the current build, not a live health check. No request is made to compute it.

## Local data

Eight articles explain, without developer terms: everything chosen or written in LIVON is kept in this browser; no
server copy exists; clearing site data removes it for good; a blocked storage keeps things only until the window
closes; another device or browser starts empty; nothing can be moved or exported yet; a future account would not take
data without the user's choice.

## Personalization

Matches `livon-personalization.js`: three optional choices; Life Event first, then Life Stage, then interests; reasons
state only what the user chose; no AI and no server; another age band's content is never promoted but never hidden;
change per item or redo in My Life › 설정; reset clears only the three choices. The four Life Events without any guide
are described as "아직 연결된 안내가 충분하지 않을 수 있어요", without internal wording.

## Community

All 28 inventory topics (HF-1 … HF-28 in `LIVON_COMMUNITY_UX.md`) plus post types, comments/replies/reaction/save and
finding posts. Reports are described as a record in this browser; following as unavailable; reaction counts as not
shown; shared links as not opening on other devices; privacy guidance is short and without scare wording.

## AI

`livon-api-config.js` has no API origin configured, so Help says LIVON AI cannot answer yet and points to the
connection state shown on the AI screen. It also states what a request would contain (the question, the screen context
the user brought, a few related LIVON items, recent conversation, and the AI page's own 개인화 설정 when enabled), that
My Life and community data are not attached automatically, that the onboarding profile is not sent, and that plans
reach My Life only after preview → select → approve.

## Deep links

`#help` · `#help/c/{categoryId}` · `#help/a/{articleId}` · `#help/search?q=…` · `#help/status` ·
`#help/troubleshooting`. Unknown ids and paths show "도움말을 찾을 수 없어요" with search and categories.

Routing: the page's inline router knows seven views and treats any other hash as Home. `help-page.js` adds the Help
view on top of it (`route()` runs right after the inline router on every hash change). The inline script was left
untouched on purpose: it is pinned by CSP hashes in `vercel.json`, and this phase does not change deployment
configuration. When a deployment is approved, the two lines can be folded into the inline router and the hash updated.

## Accessibility

One `h1` per page with focus moved to it on navigation; `h2` sections; labelled search (`role="search"`, visible
button, hidden label); FAQ accordion as a button inside a heading with `aria-expanded` / `aria-controls` and a labelled
region; breadcrumb `nav` with `aria-current`; a polite status line announces result counts and not-found; all targets
≥ 44px; visible focus outlines; no animation or transition. Keyboard: Enter searches, Escape clears the box and then
returns to Help Home, Arrow keys move between the box and the results. Checked at 320 / 390 / 768 / 1440.

## Offline

Content is a script bundled with the page. Help Home, categories, articles, search and status work with no network.
No font, image or request is added by Help.

## Content verification

Each article carries `v`: `CODE_VERIFIED` (checked against the code in this branch), `DOC_VERIFIED`, or
`PRODUCT_POLICY` (a stated intention, e.g. what would happen with a future account). The label is internal and never
rendered. The Local Admin's System view shows the article count and the verification breakdown, read-only.
Help is its own content domain: it is not part of the 530 curated records and is not loaded by the Data Manager.

## Consistency testing

`facts` in `help-data.js` is compared with the code on every test run:

| Fact | Checked against |
| --- | --- |
| lifeStages 7 · topics 228 · lifeEvents 34 | `LivonLifeData.stages`, life topics, Life Event catalog |
| postTypes 6, type labels, report reasons, name length | `LivonCommunityService` |
| account / sync NOT_CONNECTED | `LivonUserData.auth()` is anonymous, no remote adapter, logout hidden |
| personalization LOCAL_RULE_BASED, order of signals, reason texts | `LivonPersonalization` |
| follow ACCOUNT_REQUIRED · reports LOCAL_ONLY · posts LOCAL | community adapter |
| ai / liveData NOT_CONNECTED | `livon-api-config.js` has no configured origin |
| skip allowed · reset keeps other data | run against the real functions |
| every UI label Help quotes | present in the screen's source |
| My Life export | Help may mention it only if a button renders it |

Also checked: forbidden wording (완벽하게, 실시간 동기화, AI가 알아서, 운영팀이 …, 팔로우할 수 있어요 …), no
technical state words on the status page, every placeholder filled, every related / contextual / status id exists.

## Known gaps

- My Life has click handlers for "export" and "delete everything" but no button renders them, so those actions are not
  reachable. Help therefore says there is no export or backup. Adding the buttons is a product decision outside Help.
- Help text is Korean only, like the rest of the LIVON page content.

## Future support backend

```
Help UI (help-page.js)  →  Help Content (help-data.js)      READY, bundled
Support (inquiry · ticket · account support)                 NOT CONNECTED — no UI, no endpoint
```

Help never offers a "send" action. When a support backend exists it should be a separate module with its own adapter;
`facts.support` and the `contact-support` article are the two places to update, and the tests will require both.
