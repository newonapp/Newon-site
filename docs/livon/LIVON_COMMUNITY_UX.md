# LIVON Community UX V1 + Onboarding Integration

Status: local prototype on branch `livon-community-onboarding-v1`, built on `b1f1324d4` (LIVON Onboarding V1, which
contains Admin Local V1 `e4c8e2f49` and Data Manager V1). Not deployed.

The community is anonymous and local-first: the only posts, comments, reactions and reports that exist are the ones
written in this browser. No sample posts, people, counts or popularity are generated. There is no community server.

| File | Role |
| --- | --- |
| `livon/community-service.js` | **new** — model, validation, search, For You rules, reports, related content, adapters. No DOM |
| `livon/community-page.js` | UI + `LivonCommunityRepo` (create / update / remove / comment / react / report / draft / reset) |
| `livon/community-data.js` | curated groups, challenges, post types, rules — unchanged |
| `livon/livon-personalization.js` | the onboarding profile; `textAgeOk()` added for free text |
| `livon/admin/*` | Community › Reports lists the local reports through the same model |
| `tests/livon/community-ux.test.mjs` | CU-1 … CU-45, isolation checks A–D |

## Audit

State of every community function before this work (at `b1f1324d4`) and after it.

| Function | Before | After | Note |
| --- | --- | --- | --- |
| Community Home | WORKING | WORKING | hero, section nav, feed, groups, challenges |
| For You | PARTIAL | WORKING | used stage + interests only; now Life Events, age context and a visible reason |
| 최신 | WORKING | WORKING | by stored `createdAt` |
| 팔로잉 | BACKEND_REQUIRED | BACKEND_REQUIRED | honest empty state; no simulated people |
| Post cards | WORKING | WORKING | + Life Event label, + reason line in For You; an unescaped id in the link was fixed |
| Post detail | WORKING | WORKING | + Life Event link, + linked LIVON information |
| Create | PARTIAL | WORKING | category was mandatory, no Life Event, invalid type silently became 일상; now type · title · body |
| Draft | PARTIAL | WORKING | only a manual "임시 저장"; now autosave, restore and discard as well |
| Edit | WORKING | WORKING | local posts only |
| Delete | PARTIAL | WORKING | a reaction could still be attached to a deleted post |
| Reaction | WORKING | WORKING | on / off, never a total |
| Save | WORKING | WORKING | shared `LivonPlatform` saves (My Life) |
| Comments | WORKING | WORKING | write, edit, delete |
| Replies | WORKING | WORKING | one level; narrower indent on phones |
| Search | PARTIAL | WORKING | no Life Stage / Life Event, spacing-sensitive (첫취업 ≠ 첫 취업) |
| Filters | PARTIAL | WORKING | type and Life Stage; Life Event added |
| Profile / local activity | WORKING | WORKING | uses the shared activity model; report list and local reset added |
| Follow | BACKEND_REQUIRED | BACKEND_REQUIRED | `adapter.follows()` → `ACCOUNT_REQUIRED` |
| Related content | PARTIAL | WORKING | only a text search link; now real Data Platform relations |
| Report | PARTIAL | WORKING | no dedupe, reasons differed from the spec, a missing target could be reported |
| Empty states | PARTIAL | WORKING | activity and related-content empty states added |
| Error states | PARTIAL | WORKING | a `null` entry in stored posts could throw; the store is now normalized on read |
| Storage | PARTIAL | WORKING | UI read the store itself; now UI → Repo → Service → Adapter |
| Deep links | WORKING | WORKING | `#cm-post-{id}`, friendly not-found |
| Mobile | WORKING | WORKING | checked at 320 / 390 / 768 / 1440 |
| Keyboard | WORKING | WORKING | tabs, dialogs, Escape, focus return |
| Accessibility | WORKING | WORKING | labels, live status, alert errors |

Nothing was PLACEHOLDER or BROKEN at the start except the two defects noted above (deleted-post reaction, unescaped id).

## Architecture

```
Community UI (community-page.js)
   ↓ LivonCommunityRepo
LivonCommunityService (community-service.js)
   ↓
Community Adapter            ADAPTER_METHODS: info · loadStore · saveStore · follows · setFollow · submitReport
   ├─ Local Adapter          today — "livon.cmStore.v1" via LivonUserData → storage guard; memory if storage is refused
   └─ Remote Adapter         future NEWON+ Community API; every call throws BACKEND_REQUIRED until it exists
```

The UI never reads or writes the store directly. `LivonCommunityService.useAdapter(adapter)` swaps the adapter; the UI
code does not change (tested with an in-memory adapter).

## Data model

| Origin | What | Changed by a user action? |
| --- | --- | --- |
| CURATED | groups, challenges, post types, rules (`community-data.js`); Life Stage, Life Events, topics | never |
| LOCAL | posts, comments, reactions, reports, joins, display name, unsent draft (`livon.cmStore.v1`) | yes, in this browser |
| REMOTE | other people's posts | none exist; `originOf()` treats any non-local record as read-only |

`originOf(record)` / `canEdit(record)` decide every update and delete. Post fields: `id, type, title, body, tags[],
category, lifeStage, lifeEvent, lifeTopicId, visibility, image, authorNick, authorId, draft, createdAt, updatedAt`.
`lifeEvent` (one id from the Life Event catalog) and `store.compose` (the autosaved text) are the only additions; the
store version stays 2 and old records are read as they are.

## Feed

- **For You** — local rules over the onboarding profile, see Onboarding integration. No profile → latest order, said on the page.
- **최신** — `createdAt` descending; undated legacy posts last.
- **팔로잉** — needs accounts. Shows "아직 팔로우한 사용자가 없습니다 … 준비 중입니다" and links to 최신. Nothing is simulated.

## Onboarding integration

Community reads `LivonPersonalization.getProfile()` and stores no profile of its own.

| Signal | Weight | Reason on the card |
| --- | --- | --- |
| the post's Life Event is one the reader chose | +4 | 선택한 ‘육아’ 관련 |
| words of a chosen Life Event in the title or tags | +2 | 선택한 ‘육아’ 관련 |
| the post's Life Stage is the reader's | +3 | 30대 글 |
| the post's category matches an interest | +2 | 관심사 ‘가족’ |
| an interest word in the title or tags | +1 | 관심사 ‘가족’ |
| the category of a joined group | +1 | 가입한 커뮤니티 주제 |

A post is never boosted when it was written for another band, when its Life Event does not belong to the reader's band,
or when it is about 육아·보육·출산·결혼 and the reader's band is outside those events (`textAgeOk`). It is not hidden.

## Post creation

Required: type (질문 · 경험 공유 · 생활 정보 · 후기 · 생활 팁 · 일상 이야기), title (≤ 80), body (≤ 5000).
Optional: 분야, Life Stage, Life Event, related topic, tags (≤ 8, ≤ 20 characters, letters · digits · spaces), and the
existing visibility / group / region / image options.

Validation (`validatePost`): empty, whitespace only, too long, unknown type, malformed tag. An unknown Life Stage,
Life Event or topic id is dropped rather than stored. Errors are announced (`role="alert"`) and focus moves to the field.

## Draft

- Autosave: while a new post is written, the form is kept in `store.compose` 0.5 s after the last change and when the
  dialog closes. One slot; never in the feed or in search.
- Restore: opening 글쓰기 again brings the text back with "작성하던 내용을 불러왔어요 · 지우고 새로 쓰기".
- Discard: that button, publishing, or saving as a named draft empties the slot.
- "임시 저장" still creates a named draft post (listed under 나의 활동 › 임시 저장 글).
- Storage blocked: the storage guard (or the adapter's memory mode) keeps the draft for the tab.

## Detail, edit, delete

`#cm-post-{id}`. Edit and delete appear only on LOCAL posts; anything else is read-only. Deleting a post removes it
from the feed and search, removes its comments, reactions and comment reactions, and removes it from the shared saves.
Reports about it remain as records and are shown as "삭제된 글". A reaction or comment cannot be added to a deleted post.

## Reaction and save

Reaction is an on / off flag with a timestamp; no total is shown or stored. Save uses the shared `LivonPlatform` store
(`life-hub:community:cm:{postId}`), so saved posts appear in My Life › 저장. Both survive a reload.

## Comments and replies

Local comments: write, edit, delete (≤ 1000 characters, not empty). Replies are one level: a reply to a reply joins the
same thread. A deleted comment with replies stays as "삭제된 댓글입니다". No curated comments exist or were added.

## Search

`matchesQuery`: title, body, tags, type label, category label, Life Stage label ("30대"), Life Event title.
Unicode-normalized, case-insensitive, whitespace-normalized; every word must match; spaces inside words are ignored
(첫취업 = 첫 취업). 36 queries are checked in CU-19. No result → an empty state, never invented content.

## Filters

Post type, Life Stage, Life Event (the events of the chosen band), plus the topic chips. They combine with each other
and with search, and round-trip through the URL: `#cm-home?tab=&cat=&type=&stage=&event=&q=`. Unknown values fall back.

## Local activity

나의 활동 shows what was done in this browser: 내가 작성한 글, 임시 저장 글, 저장한 글, 공감한 글, 내가 작성한 댓글, 신고 기록, and
the display name. It says it is not an account. No real name, photo or follower number is asked for or made up.

## Follow

`adapter.follows()` → `{ available: false, status: "ACCOUNT_REQUIRED", list: [] }`; `setFollow()` → `unavailable`.
No local follow list is simulated. A remote adapter can implement both without UI changes.

## Related content

`relatedContent(post)` uses relations that exist in the Data Platform only:
the post's topic and what that topic links to (가이드 · 정책·제도 · 서비스 · 프로그램), and the topics written for the post's
Life Event in the post's band. Nothing is inferred from the text. No relation → "이 글에 연결된 LIVON 정보가 없습니다."
Links are internal `#…` or official `https://` only.

## Report

Reasons: 스팸 · 부적절한 콘텐츠 · 괴롭힘/비방 · 잘못된 정보 · 기타. A report is `{ id, target, reason, reasonId, at, status:
"local-only" }` — no personal data. The dialog and the confirmation both say it is recorded on this device and not sent
to an operator or a server. The same target with the same reason is recorded once (`duplicate`). Reasons recorded by
the earlier build are still understood.

## Admin moderation

Local Admin › Community › Reports reads this browser's community store through `LivonCommunityService.snapshot()` —
the same model the Community uses — and lists each report with its reason, time and whether the item still exists. A
local moderation mark (FLAGGED · HIDDEN_LOCAL · NEEDS_REVIEW · RESOLVED_LOCAL) can be set per reported post or comment.
The mark is stored in the Admin only; the Admin never writes the community store, and there is no server.

## Empty states

Feed, 팔로잉, search with no result, saved, my posts, comments, related content, activity — each has a sentence and,
where it helps, an action. No blank screen.

## Error and recovery

| Situation | Behaviour |
| --- | --- |
| Storage blocked | storage guard / adapter memory mode: works for the tab |
| Storage full | the write fails and the user is told; nothing is silently dropped |
| Malformed store | `normalizeStore` repairs on read: unreadable entries are dropped and counted, valid ones kept |
| Missing or deleted post | "글을 찾을 수 없습니다" with a way back |
| Invalid filter, query, Life Stage, Life Event, relation | ignored; the rest of the page works |

## Security

All user text is escaped on output. Stored ids must look like ids; an image must be an embedded bitmap; links from
related content must be `#…` or `https://`. Tags reject markup characters. No personal information is requested.

## Deep links

`#cm-post-{id}` opens the post. An unknown id — including a local post opened in another browser — shows the
not-found page. Sharing says the link works only on the device that holds the post.

## Guidelines

Six short lines in 커뮤니티 › 안전 (`GUIDELINES`): 존중, 개인정보, 스팸, 불법·유해 콘텐츠, 잘못된 정보, 신고. Linked from 글쓰기.

## Data ownership

| Action | Clears | Never touches |
| --- | --- | --- |
| 커뮤니티 기록 지우기 (`Repo.resetLocal`) | community store, community saves | onboarding profile, My Life, other saves, AI |
| 맞춤 설정 초기화 (`LivonPersonalization.reset`) | Life Stage, interests, Life Events | community posts, comments, reactions, saves, to-dos, goals |
| Admin moderation mark | Admin's own store | community store, curated data |

## Help & FAQ topic inventory

For LIVON Help & FAQ V1. Each topic is something the current UI can make a user wonder about.

| ID | Area | Question | Answer source |
| --- | --- | --- | --- |
| HF-1 | 시작 | 회원가입 없이 왜 쓸 수 있나요? | anonymous, local-first design |
| HF-2 | 시작 | 내 정보는 어디에 저장되나요? | this browser only (localStorage) |
| HF-3 | 시작 | 다른 기기나 브라우저에서는 왜 안 보이나요? | no account, no sync |
| HF-4 | 시작 | 브라우저 기록을 지우면 어떻게 되나요? | local data is removed with it |
| HF-5 | 시작 | "저장이 막혀 있어요" 안내는 무슨 뜻인가요? | storage guard: kept for the tab only |
| HF-6 | 맞춤 설정 | 연령대·관심 분야·Life Event는 왜 묻나요? | used for ordering only, on the device |
| HF-7 | 맞춤 설정 | 맞춤 설정은 어디에 저장되나요? | three preference keys in this browser |
| HF-8 | 맞춤 설정 | 온보딩을 다시 하려면? | 내 생활 › 개인 설정 › 맞춤 설정 다시 하기 |
| HF-9 | 맞춤 설정 | 맞춤 설정을 초기화하면 무엇이 지워지나요? | the three choices only |
| HF-10 | 맞춤 설정 | "선택한 ‘첫 취업’ 관련"은 무슨 뜻인가요? | recommendation reasons |
| HF-11 | 맞춤 설정 | 고른 Life Event에 안내가 없다고 나와요 | content gaps per event and band |
| HF-12 | 맞춤 설정 | 연령대를 고르면 다른 연령대 정보는 못 보나요? | nothing is hidden; only order changes |
| HF-13 | 맞춤 설정 | 추천에 AI가 쓰이나요? | no — local rules |
| HF-14 | 커뮤니티 | 내가 쓴 글은 어디에 저장되나요? | this browser only |
| HF-15 | 커뮤니티 | 다른 사람 글은 왜 없나요? | no community server yet |
| HF-16 | 커뮤니티 | 팔로잉은 왜 비어 있나요? | needs accounts; not available yet |
| HF-17 | 커뮤니티 | 신고하면 운영자에게 전달되나요? | no — recorded on this device only |
| HF-18 | 커뮤니티 | 같은 글을 두 번 신고할 수 있나요? | once per reason |
| HF-19 | 커뮤니티 | 쓰다가 닫은 글은 어떻게 되나요? | autosave and restore |
| HF-20 | 커뮤니티 | 임시 저장과 자동 보관의 차이는? | named draft vs. unsent text |
| HF-21 | 커뮤니티 | 글을 삭제하면 댓글과 저장은 어떻게 되나요? | removed together |
| HF-22 | 커뮤니티 | 공감 수는 왜 안 보이나요? | one device, so on / off only |
| HF-23 | 커뮤니티 | For You 순서는 어떻게 정해지나요? | profile rules and reasons |
| HF-24 | 커뮤니티 | 글 링크를 보냈는데 상대가 못 열어요 | device-local posts |
| HF-25 | 커뮤니티 | 어떤 내용을 쓰면 안 되나요? | guidelines; no personal information |
| HF-26 | 커뮤니티 | 표시 이름은 실명인가요? | a device nickname, not an account |
| HF-27 | 커뮤니티 | 커뮤니티 기록을 지우면 맞춤 설정도 지워지나요? | no — separate ownership |
| HF-28 | 커뮤니티 | "관련 LIVON 정보"는 어떻게 고르나요? | the post's topic and Life Event |
