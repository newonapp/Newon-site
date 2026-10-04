# LIVON Community V2: local-first product, backend-ready architecture

Community V2 is built on branch `livon-community-v2` from `dd92aaa2d`. It is not deployed.

V2 completes the Community on top of V1 instead of replacing it. The flow it serves is
**Discover → Read → Write → Interact → Connect → Return**. There is still no Community server and no live Newon+
account, so V2 draws one line through every feature: what works **on this device today**, and what needs an
**account or a server**. The second group is a contract only: it never pretends to work.

There are no invented people, posts, comments, reaction totals, followers, views, popularity, notifications, online
status or server sync.

| File | Role in V2 |
| --- | --- |
| `livon/community-service.js` | V1 model, extended with delivery state, moderation states, feature map, factual sorts, the 내 활동 search, control-character validation, duplicate-id handling, and block / profile / notification answers |
| `livon/community-page.js` | V1 UI, extended with a delivery badge and note, a 정렬 control and a "저장한 글만" filter, 내 활동 search, a 차단 status, honest submit copy, draft protection on leave, and no AI hand-off for non-public posts |
| `livon/community-remote.js` | **new**. The remote contract (routes, identity, authorization, moderation) and `createRemoteRepository()`. The public page does **not** load it |
| `livon/community-page.css` | additions only: delivery badge, check control, 내 활동 search (no motion) |
| `livon/index.html` | safety section copy ("준비 중", "지금은 이 기기에 기록"), asset versions `?v=20261005cv2` |
| `tests/livon/community-v2.test.mjs` | CV2-01 … CV2-60 |

## 1. Existing audit

Each feature was classified before V2 (the V1 code at `dd92aaa2d`) and after it.

The classes are:

- **LIVE**: works against a server.
- **LOCAL**: works on this device.
- **PARTIAL**: works, but with a gap.
- **CONTRACT ONLY**: an interface or contract exists and answers honestly; nothing is simulated.
- **PLACEHOLDER**: copy only.
- **NOT IMPLEMENTED**: nothing exists.

Nothing is LIVE, because no Community server exists.

| Feature | Before V2 | After V2 | Note |
| --- | --- | --- | --- |
| Community main | LOCAL | LOCAL | hero, section nav, feed, groups, challenges, 나의 활동, 안전; empty state "아직 표시할 커뮤니티 글이 없어요." with 첫 글 작성하기 |
| Feed / list | LOCAL | LOCAL | For You (local profile rules, a reason on each card) · 최신 · 팔로잉 (honest empty); 10 per page with 더 보기 |
| Categories | LOCAL | LOCAL | existing 분야 chips and post types reused; no new taxonomy |
| Posts | PARTIAL | LOCAL | V1 said "게시" / "글을 게시했습니다" with no server; V2 shows the delivery state `LOCAL_ONLY` / `DRAFT` |
| Post detail | LOCAL | LOCAL | + delivery note, + "최근 수정" time, + saved state in the note |
| Write / edit / delete | PARTIAL | LOCAL | + control-character validation, + "이 기기에 저장" button, + leave protection while editing |
| Profile | PLACEHOLDER | CONTRACT ONLY | a device display name only; profile fields are defined in the contract |
| Comments | LOCAL | LOCAL | own comments only; + control-character validation |
| Replies | PARTIAL | LOCAL | one level; V1 accepted a missing or deleted parent and stored a root comment, V2 refuses it |
| Reactions | LOCAL | LOCAL | "내 반응" on / off only; no totals |
| Saved | LOCAL | LOCAL | the shared `LivonPlatform` saves (My Life); + "저장한 글만" feed filter |
| Report | LOCAL | LOCAL | recorded on this device, never described as sent; the future server taxonomy is mapped in the contract |
| Block | PLACEHOLDER | CONTRACT ONLY | V1 had an unused `blocked` list and "사용자 차단" copy; V2 shows "준비 중", and `block()` answers `ACCOUNT_REQUIRED` |
| Follow | CONTRACT ONLY | CONTRACT ONLY | `follows()` answers `ACCOUNT_REQUIRED`; 팔로잉 is honest-empty |
| Groups | LOCAL | LOCAL | curated groups and challenges; joining is recorded on this device |
| Notifications | NOT IMPLEMENTED | CONTRACT ONLY | no producer; the event names are defined; nothing is created |
| Search | PARTIAL | LOCAL | V1 searched only the feed; V2 adds 내 활동 search over my posts, drafts and comments |
| Routing / deep links | LOCAL | LOCAL | `#cm-home?…&sort=&saved=` added; unknown values fall back |
| Storage | PARTIAL | LOCAL | V1 kept duplicate ids; V2 drops later copies and counts them |
| Privacy | LOCAL | LOCAL | no personal field; My Life, health and AI data never enter the store |
| Moderation | NOT IMPLEMENTED | CONTRACT ONLY | server states defined; local records are always ACTIVE; the local Admin's marks stay in the Admin |
| Account hooks | CONTRACT ONLY | CONTRACT ONLY | `originOf()` / `canEdit()`; identity comes from a verified token (`identityFrom`) |
| Sync hooks | LOCAL | LOCAL | `livon.cmStore.v1` is `COMMUNITY_LOCAL` and is never part of the userdata sync |
| Server hooks | CONTRACT ONLY | CONTRACT ONLY | remote adapter → `BACKEND_REQUIRED`; `createRemoteRepository()` → `NOT_CONFIGURED` |
| AI hooks | PARTIAL | LOCAL | the hand-off happens only on a press; V2 removes it from private and members-only posts |
| Analytics | NOT IMPLEMENTED | NOT IMPLEMENTED | none, by design; no content is logged |
| Responsive | LOCAL | LOCAL | 320 / 390 / 768 / 1024 / 1440 and a 720 px layout at 200% zoom |
| Accessibility | LOCAL | LOCAL | labels, error association, focus trap and return, live status, 44 px targets |

## 2. Architecture

```
Community UI (community-page.js)
   ↓ LivonCommunityRepo
CommunityService (LivonCommunityService, community-service.js)
   ├─ LocalCommunityRepository   = Local Adapter (createLocalAdapter): livon.cmStore.v1 via LivonUserData → storage guard
   └─ RemoteCommunityRepository  = createRemoteRepository() in community-remote.js (not loaded; NOT_CONFIGURED)
```

V1 already had the adapter seam (`ADAPTER_METHODS`, `useAdapter`), so V2 does not refactor it. The remote repository
is promise-based and follows the route contract.

- When not configured, every call rejects with `NOT_CONFIGURED`.
- With a URL but no implementation, every call rejects with `NOT_IMPLEMENTED`.
- It never returns success, an empty list or a cached copy.

## 3. Local mode

Everything a person does is stored in this browser:

- posts and drafts
- comments and replies
- my reactions
- saves (shared with My Life)
- report records
- groups joined
- the display name

The page says this everywhere it matters: in the composer, in the detail note, on cards (`이 기기에만 저장됨`), in the
report dialog and in 나의 활동.

## 4. Future remote mode

These features are `ACCOUNT_REQUIRED` (see `FEATURES` in the service):

- public posts
- other people's comments
- reaction counts
- profiles
- follow
- block
- report delivery
- moderation
- notifications

Each has a route in the contract (section 15). They activate only when a verified Newon+ account and a Community server
exist.

## 5. Post model

The V1 fields are kept: `id, type, title, body, tags[], category, lifeStage, lifeEvent, lifeTopicId, visibility, image,
authorNick, authorId, draft, deleted, createdAt, updatedAt`.

**Delivery state** is derived, never stored: `deliveryOf(post)`.

| State | Meaning | Shown as |
| --- | --- | --- |
| `DRAFT` | saved as a draft | 임시 저장 · 이 기기 |
| `LOCAL_ONLY` | written here; nobody else can see it | 이 기기에만 저장됨 |
| `PENDING` | future: sent, waiting for the server | 전송 중 |
| `DELIVERED` | future: accepted by the server | 서버에 저장됨 |

A local record is always `LOCAL_ONLY`, whatever a stored field claims. No copy says "PUBLISHED", "공개됨" or
"게시했습니다". The submit button reads **이 기기에 저장**. Visibility (전체 / 가입 커뮤니티 / 비공개) is kept as the
author's intent, with the note "공개 범위는 커뮤니티 서버가 준비되면 적용됩니다".

**Moderation state** is `moderationOf(record)`: ACTIVE · UNDER_REVIEW · HIDDEN · REMOVED. It is decided by the server
only; a local record is always ACTIVE.

## 6. Write, validation and draft safety

**Validation** (`validatePost`, `validateComment`):

- type: must be a known type
- title: not empty or whitespace, at most 80 characters
- body: not empty, at most 5000 characters
- tags: at most 8, each at most 20 characters, letters, digits and spaces only
- control characters are rejected: C0 except line break and tab, DEL, and the bidi overrides U+202A–202E and
  U+2066–2069

Markup is not rejected. It is stored as text and always rendered escaped.

**Draft safety.** At least one of the two required mechanisms exists, and V2 has both:

1. **Autosave** (V1). A new post is kept in `store.compose` 0.5 s after each change, when the dialog closes, and (V2)
   on `pagehide` / `beforeunload`. It is restored as "작성하던 내용을 불러왔어요". The slot is cleared only by a
   successful save or by **지우고 새로 쓰기**.
2. **Unsaved-change warning.** While a saved post is being edited, closing the dialog asks "수정 중인 내용이 있어요",
   and leaving the page triggers the browser's leave prompt (V2).

Named drafts (임시 저장) are posts with `draft: true`. They are listed in 나의 활동 and never shown in the feed or in
any search other than 내 활동.

## 7. Comments and replies decision

There is a local self-comment model, because it has product value on its own: notes on your own questions, replies to
yourself, and the same shape a server will use.

- The page says **이 기기에만 저장됩니다**; the comment box says "개인정보는 적지 마세요".
- Only your own comments can be written, edited or deleted. A non-local comment is `forbidden`.
- Replies are one level deep. The parent must exist on the same post and must not be deleted (new in V2).
- Deleting a post deletes its comments, replies and comment reactions.
- No comment by anyone else exists.

## 8. Reaction decision

**Option B**: "내 반응" is a local on / off preference, stored as a timestamp. No total is stored or shown, and no
other person's reaction exists. `reactionTotals` stays `ACCOUNT_REQUIRED`.

## 9. Profile

A device display name only: "이 기기에서 쓰는 이름입니다. 계정이 아니며, 프로필 사진·팔로워 기능은 준비 중입니다." No
sensitive field is asked for.

The remote profile contract is:

- `displayName`: required, 1–20 characters
- `avatar`: optional, an image URL from the server
- `bio`: optional, at most 160 characters
- `interests`: optional, at most 10 ids

## 10. Follow

`follows()` returns `{ available: false, status: "ACCOUNT_REQUIRED", list: [] }`. 팔로잉 shows "아직 팔로우한
사용자가 없습니다. 다른 사용자 프로필과 팔로우는 준비 중입니다." There is no follower or following count.

## 11. Block

`block()` returns `{ status: "unavailable", reason: "ACCOUNT_REQUIRED" }`. 나의 활동 says no user is blocked and that
nothing is treated as blocked on this device.

- **Contract:** `{ blocker, blocked, createdAt }`, with `PUT` / `DELETE /blocks/:accountId`.
- **Block must be server-enforced.** The server hides the blocked account's posts and comments from the blocker and
  refuses its replies, follows and mentions. A browser list cannot do this.

## 12. Report

A report is recorded on this device as `{ id, target, reason, reasonId, at, status: "local-only" }`. The UI says
"신고를 이 기기에 기록했습니다. 운영자나 서버로 전송되지는 않습니다." The same target with the same reason is recorded
once.

**Targets.** Today a report can target a post or a comment. Profile reports are part of the server contract (a
`profile:` target in `POST /reports`), because no profiles exist yet.

**Reasons.** The local reasons stay as in V1. Their mapping to the future server taxonomy is:

| Local reason | Server reason |
| --- | --- |
| spam | spam |
| harassment | harassment |
| misinformation | misinformation |
| inappropriate | other (re-classified by a moderator) |
| other | other |

The server taxonomy is: spam, harassment, privacy, misinformation, illegal, other. There is no free-text field, so no
sensitive narrative is collected.

## 13. Moderation

There is no remote moderation. The local Admin's report review and its marks (V1) remain Admin-only and never change
the Community store.

Future server states are ACTIVE, UNDER_REVIEW, HIDDEN and REMOVED. They are set by `PATCH /moderation/:target`, which
only the `community-moderator` role may call. A moderator hides content but cannot rewrite it.

## 14. Search, filters, sort

- **Feed search** covers title, body, type label, category label, tags, Life Stage and Life Event. It is Korean
  partial and whitespace-insensitive, and every word must match.
- **내 활동 search** (V2) covers my posts, my drafts and my comments on this device, showing the first 20 results per
  kind.
- **Separation.**
  - The LIVON-wide searches (Explore, Life Stage, the home preview) read `searchablePosts()`: public, non-draft,
    non-deleted local posts, labelled "커뮤니티 · 이 기기".
  - Drafts, private and members-only posts are never in them.
  - `search-index.json` (the build index) contains no user content.
- **Filters:** type, 분야, Life Stage, Life Event, and "저장한 글만" (V2). They combine with each other and round-trip
  through the URL: `#cm-home?tab=&cat=&type=&stage=&event=&q=&sort=&saved=`.
- **Sort:** 최신순 (`createdAt`) and 최근 수정순 (`updatedAt`) only. There is no popularity, trending, engagement or
  view ranking. For You orders by the reader's own onboarding profile and shows the reason on each card.

## 15. Remote contract

The contract lives in `livon/community-remote.js` (`REMOTE_CONTRACT`). Version 1 has these routes:

```
GET    /api/livon/community/posts                  (optional auth, cursor-paginated, moderation-filtered)
POST   /api/livon/community/posts
GET    /api/livon/community/posts/:id
PATCH  /api/livon/community/posts/:id              author-only
DELETE /api/livon/community/posts/:id              author-only
GET    /api/livon/community/posts/:id/comments     (paginated)
POST   /api/livon/community/posts/:id/comments
POST   /api/livon/community/comments/:id/replies
PATCH  /api/livon/community/comments/:id           author-only
DELETE /api/livon/community/comments/:id           author-only
PUT    /api/livon/community/posts/:id/reaction
DELETE /api/livon/community/posts/:id/reaction
GET    /api/livon/community/profiles/:id
PATCH  /api/livon/community/profiles/me            self-only
PUT    /api/livon/community/follows/:accountId
DELETE /api/livon/community/follows/:accountId
PUT    /api/livon/community/blocks/:accountId
DELETE /api/livon/community/blocks/:accountId
POST   /api/livon/community/reports
PATCH  /api/livon/community/moderation/:target     community-moderator role
```

The rules that apply to every route:

- **Auth:** every write requires a verified token. Reads of public content may be anonymous.
- **Pagination:** cursor-based (`cursor`, `limit` ≤ 50).
- **Rate limits:** every write is limited per account and per IP, and answers 429 with `Retry-After`. Reads are
  limited per IP.
- **Errors:** UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, VALIDATION, RATE_LIMITED, BLOCKED, BACKEND_REQUIRED.
- **Moderation:** lists and reads return only ACTIVE content to other people.

No route is implemented in this phase, and `server/` is unchanged.

## 16. Authorization model

These rules are a reference implementation in `community-remote.js`. The server must enforce them; client checks are
advisory.

- **Identity** = the account id in a verified token (`identityFrom(token, body)`). Any `authorId`, `userId` or `role`
  in a request body is ignored.
- **Edit and delete** are author only. `authorize(action, actor, record)` compares `record.authorAccountId` with the
  token's account, so guessing another post's id gets FORBIDDEN (no IDOR).
- **Profile update** targets the token's own account, never an id from the URL.
- **Moderation** requires the server role `community-moderator`.
- **Block** is enforced by the server.
- **Report** requires an authenticated account.
- **Self-follow / self-block** returns VALIDATION.

## 17. Saved

The shared `LivonPlatform` store is the only Saved store. Saves use the id `life-hub:community:cm:{postId}` and type
`life-community`. The community store keeps no saved list of its own: V1 migrated any old list into the shared store.

Deleting a post removes its save, so no orphan is left. Editing a post updates the saved title.

## 18. Notifications

There is no producer. Writing, replying, reacting and reporting create no notification, and `notifications()` returns
`{ available: false, producer: "NONE", status: "ACCOUNT_REQUIRED", list: [] }`.

The future server events are `COMMENT_CREATED`, `REPLY_CREATED`, `FOLLOWED`, `REACTION_RECEIVED` and
`REPORT_RESOLVED`. They will be produced by the server only, for the target account.

## 19. Privacy

The Community never reads or shows any of these:

- My Life journal, health, expenses, budget, schedules, tasks or goals
- family data
- private saved records
- AI conversations

The only My Life read is the one-time V1 migration of the legacy `savedCommunity` list. Sharing happens only through
text the person types and confirms. There is no My Life → Community bridge.

Other protections:

- **No personal fields:** nothing asks for a real name, phone, email, address or birth date.
- **Rendering:** every user string is escaped. Links in related content must be `#…` or `https://`. Images must be
  embedded bitmaps.

## 20. AI boundary

- LIVON AI code is unchanged, and it never reads `livon.cmStore.v1`.
- The Community never calls the AI.
- A post is handed to LIVON AI only when the person presses **LIVON AI에게 물어보기**. The hand-off carries the title,
  type and a 100-character excerpt as a draft the person sees and can remove.
- V2 removes the button from private and members-only posts.
- A future public Community search must not feed AI without its own permission and provenance.

## 21. Sync boundary

- `livon-account-sync-v1` is not merged.
- `livon.cmStore.v1` is classified `COMMUNITY_LOCAL` in the storage inventory. It is not a userdata collection and is
  never uploaded by the generic My Life sync.
- A future Community backend will have its own routes (section 15). Community social data must never be stored inside
  the userdata blob.

## 22. Analytics and logs

There is no analytics in the Community. The page and service contain no `console.*` calls and no tracking calls. Post
titles, bodies, comments, display names and search queries are never logged or sent. If analytics is added later, only
event types and counts may be recorded.

## 23. Known limitations

- Nothing is shared with anyone: a post exists only in the browser that wrote it, and a post link opens only there.
- Clearing browser data removes the community data.
- Reports are not reviewed by anyone outside this browser.
- Profiles, follow, block, notifications, other people's comments and reaction totals do not exist.
- Visibility is recorded but has no effect until a server exists.
- The leave prompt for unsaved edits uses the browser's own dialog text.
- Not verified on real Safari, iPhone or Android devices; only Chromium was tested.

## 24. Activation roadmap

1. Newon+ verified sign-in, which provides the token identity.
2. The Community server: implement section 15 with server-side validation, authorization (section 16), rate limits,
   moderation states and audit.
3. A `RemoteCommunityRepository` implementation. The UI switches from `createLocalAdapter` to it through
   `useAdapter`; local posts remain local until the author chooses to upload each one.
4. Report delivery and a moderator console, which replaces the Admin's local marks.
5. Block and follow, with server enforcement; then notifications from server events.
6. A public Community search with its own index: public, ACTIVE posts only, no drafts or private posts, and AI access
   only with permission and provenance.

## 25. Tests

`node --test tests/livon/community-v2.test.mjs` runs CV2-01 … CV2-60. The browser tests (320 / 390 / 768 / 1024 /
1440, keyboard, focus, 200% zoom) need a local Chromium (`CHROME_PATH`, `PLAYWRIGHT_MODULE`).
