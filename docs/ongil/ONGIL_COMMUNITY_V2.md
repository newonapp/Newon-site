# ONGIL Community V2 — a local-first place to share, ask and plan, said truthfully

Status in one line: **LOCAL. Not a social network yet.** Everything below works on this device and nobody else sees it.
Publishing, comments, reactions, profiles, follows, blocks, reports and group membership need a Newon+ account on the
ONGIL page and a community server with moderation. Neither exists, so none of them is shown as if it worked.

```
COMMUNITY LOCAL      = LIVE (this device)
COMMUNITY REMOTE     = NOT IMPLEMENTED (contract only, refuses REMOTE_NOT_CONFIGURED)
NEWON+ IN COMMUNITY  = NO (ONGIL does not load Newon+ sign-in)
FAKE SOCIAL DATA     = NONE (no other author, count, ranking or notification exists)
```

## 1. Existing audit

Phase 6 (Community + Groups V1) was already local-first and honest. V2 keeps every store, collection, design part and
route and adds what was missing. State of each part before → after V2:

| Part | V1 | V2 |
|---|---|---|
| Community home | LOCAL (내 글 · 모임 준비 · 공개 모임 찾기 · 함께 지킬 것) | LOCAL + 내 활동 + 앞으로 열릴 기능 |
| Posts: write · edit · delete | LOCAL | LOCAL (ID / card numbers refused) |
| Drafts (임시 저장) | LOCAL | LOCAL + 작성 중인 글 kept automatically |
| Post detail | LOCAL (dialog) | LOCAL + 공개 상태 line + health boundary + own address |
| Categories / types | LOCAL (6 types, 9 categories) | unchanged |
| Search / filters | LOCAL (type, category, words) | + 상태, 순서, group drafts found by the same words |
| Saved | LOCAL (Saved POST → `#community`) | Saved POST → `#community/post-<id>` |
| Groups / group drafts / meetup drafts | LOCAL | unchanged (+ address `#community/group-<id>`) |
| Comments · replies | CONTRACT ONLY | CONTRACT ONLY (REMOTE_REQUIRED) |
| Reactions | CONTRACT ONLY | CONTRACT ONLY (REMOTE_REQUIRED) |
| Report · block | CONTRACT ONLY | CONTRACT ONLY + senior-safety reasons |
| Profile · follow | NOT IMPLEMENTED | CONTRACT ONLY (ACCOUNT_REQUIRED / REMOTE_REQUIRED) |
| Moderation | NOT IMPLEMENTED | taxonomy + rules for the future server |
| Notifications | none (correct) | none (correct) |
| Deep links | `#community`, `/write`, `/groups` | + `/activity`, `/post-<id>`, `/edit-<id>`, `/group-<id>` |
| Local storage | communityPosts · groupDrafts · meetupDrafts (PRIVATE) | the same three; the compose draft lives inside communityPosts |
| Account hooks · Family · AI · public data · analytics | none / content-free counter | unchanged |
| Accessibility · responsive | done in Phase 6 / 11 | re-checked at 320–1440 px, 200 % text, keyboard |

## 2. Product purpose

A place for everyday stories and experiences, questions, hobbies and learning, local life, and — later — finding
people with the same interests and real local activities. It is the person's own social life, separate from family.
It is not a place to compete: there is no ranking, popularity, follower number or view count, now or by design.

## 3. Senior UX principles

Large targets (44 px and up, checked at every width), one primary action per card, plain Korean, one error line next to
the field that needs it, nothing typed is ever lost without a question, no markdown editor, no infinite scroll (20 at a
time with 더 보기), no hidden gestures, the same cards and colours as the rest of ONGIL.

## 4. Local mode

What works today, on this device only: write / edit / delete posts, 임시 저장, the kept compose draft, search, filters,
Saved, 내 활동, group drafts and meetup drafts (and adding a meetup to 내 일정). The screen says on every card that
nothing is visible to anyone else (`LOCAL_NOTE`, `deliveryState`).

## 5. Remote mode

`createRemoteCommunityRepository()` implements every operation of the remote contract by refusing with
`REMOTE_NOT_CONFIGURED`; `selectCommunityRepository()` always gives the local stores. So no screen can show
"공개됐어요", "신고가 접수됐어요" or "차단했어요". `COMMUNITY_FEATURES` lists each feature with its mode:
LOCAL · ACCOUNT_REQUIRED (needs Newon+ sign-in on the page) · REMOTE_REQUIRED (needs Newon+ and a community server).

## 6. Post model

Unchanged stored shape: `id, authorMode (SELF), type, category, title, body, status (DRAFT | LOCAL), source?,
createdAt, updatedAt`. V2 derives `deliveryState(post)`: `LOCAL_DRAFT` / `LOCAL_ONLY`; `REMOTE_REQUIRED` and
`REMOTE_PUBLISHED` are reserved for a server's answer. Tags were considered and not added (no schema change was needed).

## 7. Drafts

Two kinds, both on this device:
- **임시 저장** — a post with status DRAFT (unchanged).
- **작성 중인 글** — what is in the write form, saved automatically 0.7 s after typing stops (`posts.compose`), in the
  same communityPosts document (no new collection). After a reload, or after leaving the screen, the screen offers it
  back (이어서 쓰기 / 버리기). It is removed only when the post is saved or the user confirms 버리기. 취소 with typed text
  asks first ("계속 쓰기" has focus; Escape keeps writing). A new form never overwrites a kept draft. An edit draft of a
  post that was deleted meanwhile is offered as a new post. ID and card numbers are never kept, in a draft either.

## 8. Comments and replies — decision

**REMOTE_REQUIRED.** A comment on one's own post, on one device, would be a note to oneself dressed as a conversation.
No local comment store was added. The contract (`normalizeComment`) keeps the author from the server, replies by
`parentId`, never self-parented; the remote route checks the parent is on the same post; deleting a post deletes its
comments on the server.

## 9. Reactions — decision

**REMOTE_REQUIRED.** No reaction or count is stored or shown. The future server stores the caller's own reaction only and
returns no counts of other people.

## 10. Profile

Contract only (`normalizeProfile`): `displayName`, `avatarUrl` (https only), `bio`, `interests` — any other key
(birth date, address, phone, health, user id …) is refused whole. No profile is created today: "Newon+ 연결 후 사용할 수
있어요."

## 11. Follow

Contract only (`normalizeFollow`), REMOTE_REQUIRED. No relation or number is stored. Called "이웃 맺기" in the copy.

## 12. Block

Contract only, REMOTE_REQUIRED, server-authoritative: the server hides both ways on every read (feeds, comments,
groups, profiles). The screen never says it blocked anyone.

## 13. Report

Contract only, REMOTE_REQUIRED. Targets: POST, COMMENT, GROUP, MEETUP, USER (a profile is reported as its account).
Reasons: V1 (`SPAM`, `HARASSMENT`, `PRIVACY`, `MISINFORMATION`, `SCAM`, `OTHER`) + senior safety (`IMPERSONATION`,
`FINANCIAL_SOLICITATION`, `CREDENTIAL_REQUEST`, `OFF_PLATFORM_CONTACT`, `UNSAFE_HEALTH_ADVICE`, `ILLEGAL_SALE`), each
with a severity for a future review queue. Nothing is "접수" on this device.

## 14. Moderation

For the future server: reports are accepted and tracked server-side; HIGH-severity safety reasons are reviewed first;
moderation actions are a server role, never a client decision; no AI moderation is faked today ("ONGIL은 아직 글을 자동
으로 검사하거나 신고를 받지 않아요").

## 15. Scam safety

`safetyCheck()` (on top of the V1 `privacyCheck`, whose answer is unchanged): a resident registration number or a
payment card number is refused; words scams use (인증번호, 비밀번호, OTP, 보안카드, 계좌번호, 카드번호, 공인인증서, 원격 제어 앱)
give a reminder after saving. The safety card says: 계좌번호·카드번호·인증번호·비밀번호는 누구에게도 알려 주거나 묻지 마세요.
The system never asks for such data anywhere.

## 16. Medical-content boundary

Community is not a medical service. 건강 생활 posts show "한 사람의 경험이에요. ONGIL의 의료 조언이 아니며, 진료와 약은
의사·약사와 상의하세요." ONGIL never writes treatment or medication advice itself; `UNSAFE_HEALTH_ADVICE` is a HIGH report
reason for the future server.

## 17. Groups

Group drafts and meetup drafts are unchanged and fully working (create, edit, delete, delete cascade to meetup drafts,
add to 내 일정). No member, organiser, attendance or join exists; the public directory is an honest empty state. Future
group contract: profile, owner, members, join requests (`groupJoinRequest`), leave, roles, posts, events — server side.

## 18. Meeting safety

The place of a meetup is short text, `placeVisibility: PRIVATE` by default, with the hint to use a public place name
instead of a home address; the safety card says to meet first in busy public places and not to give a home address.

## 19. Region privacy

No geolocation anywhere in community. A group's region is a coarse area chosen from a list; nothing from Health,
Family or 내 주변 location is ever attached.

## 20. Family boundary

No family member, permission, consent, snapshot, help request or activity row reaches community, and Family V2 code has
no community reference (tests both ways). Nothing moves between them without an explicit user action.

## 21. Health boundary

Medications, measurements, appointments, screenings, check-ins and emergency contacts never appear in community and are
never in its search.

## 22. My Life boundary

Journal, expenses, sleep, meals, tasks, routines and schedule are not read by community. The one link is the user's
own action: a meetup draft can be added to 내 일정 after a preview.

## 23. Search

Local only: posts by title, body, type and category; group drafts by name, description, region, category and meeting
style (at most five shown with 열기). Community data is PRIVATE: never in global search, never synced; a saved post is
LOCAL_ONLY and never searched.

## 24. Saved

The existing Saved store. A saved post links to `#community/post-<id>`; deleting the post unsaves it; a saved post
whose post is gone is shown as gone (`origins.POST`).

## 25. Notifications

None. No comment, reply, reaction, follow or invite notification is produced because no such event exists.

## 26. Newon+ boundary

The same Newon+ identity Family V2 uses (verified ID token, server-derived account) is the intended identity. No
Firebase, auth env or sign-in was added. Community remote stays OFF.

## 27. AI boundary

The ONGIL helper cannot write community data (`NO_WRITE_AREAS`), community never calls the helper, and private posts
are never given to it. Any future public-content integration needs its own consent and provenance.

## 28. Analytics and log privacy

One content-free counter (`community_post_saved`, no properties). No title, body, comment, bio, search text, location,
health or family data in any counter or log; community code has no `console` and no `track` call of its own.

## 29. Remote contract

`COMMUNITY_REMOTE_CONTRACT` — base `<api>/ongil/community`, cursor pages ≤ 50, newest first: posts (list, create, read,
update, delete), comments (list, create, delete), reaction (own), profiles (read, update own), follows, blocks, reports,
groups (list, join request). Content limits are `COMMUNITY_LIMITS`; plain text only; per-account rate limits on writes,
reports and searches; no counts of other people's activity in any answer.

## 30. Authorization

- Identity: the verified Newon+ ID token in the Authorization header.
- A client-sent `userId`, `authorId`, `memberId` or `ownerId` is refused, never trusted.
- A post or comment is changed or deleted by its author only (`AUTHOR` operations).
- Group moderation by a group role the server holds; platform moderation by a server-side role.
- An id the caller may not use answers exactly like an id that does not exist (no IDOR, no enumeration).
- Blocks are enforced in every read, server-side.

## 31. Addresses

`#community` · `#community/write` · `#community/groups` · `#community/activity` · `#community/post-<id>` ·
`#community/edit-<id>` · `#community/group-<id>`. The router's section pattern was widened from letters and "-" to
letters, digits, "-" and "_" (61 characters) so a local id fits; each screen still checks its own sections and anything
unknown falls back to the screen. An open post is named in the address by replacing it (no history entry is pushed);
leaving the address closes the post. An address of a post or group draft that is not on this device says so.

## 32. Known limitations

- Everything is on one device; clearing ONGIL data clears it (the account screen says so).
- No comments, reactions, profiles, follows, blocks, reports, public posts or group membership (REMOTE_REQUIRED).
- Real Safari, iPhone and Android were not tested (Chromium only).
- The automatic draft keeps one form at a time.

## 33. Activation roadmap

1. Newon+ sign-in loaded on the ONGIL page (shared with Family V2's activation).
2. Community server: posts, comments, reactions, profiles, follows, blocks, reports, groups — the contract above, with
   per-account rate limits, content limits and server-side block enforcement.
3. Moderation operations: a review queue (safety reasons first), roles, audit, response times, an appeal path.
4. A publish step that copies one chosen local post to the server, with its own confirmation (never automatic).
5. Notifications only for real server events.
6. Group directory and join requests; meetups with public places only.
7. Only then change the screen copy from LOCAL to the real state, feature by feature.
