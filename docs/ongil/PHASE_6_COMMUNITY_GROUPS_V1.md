# ONGIL PHASE 6 — COMMUNITY + GROUPS V1

Branch `ongil-foundation-v1` · base `ebc86bc73` · not committed (git add / commit / push not run).

## 1. OBJECTIVE

Turn `#community` from a placeholder into a working, honest, **local-first** community foundation:

- 내 글: write / 임시 저장 / edit / delete / detail / search / filter / save to 저장함 — on this device only.
- 모임 준비: group drafts and meetup drafts, with "내 일정에 추가" (preview + duplicate protection).
- 즐길거리 → 후기 쓰기: a review form prefilled from an Enjoy item, never saved automatically.
- Comments, replies, reactions, reports and blocks exist as **data contracts only**, ready for a future server.
- No fake people, comments, reactions, members, counts, popularity or notifications. No network.

## 2. AUDIT (before Phase 6)

| Item | Before |
|---|---|
| `#community` | Film + area modules; every module was a "준비 중" slot (feed, groups, mine, neighborhood) |
| Storage | 20 collections, none for community |
| Saved types | `POST` already existed in `SAVED_TYPES` (unused) |
| Search | 4 providers (areas, saved, care, enjoy) |
| Router | `#community` had no sections; app.js handled `community` through the generic shell loop |
| Latent bug found | app.js router: `enjoyView.show(section)` was duplicated inside the `sectionOnly` branch (one line mis-indented), and entering `#enjoy/<section>` from another view did not apply the section. Fixed in Phase 6 (see §15). |

## 3. COMMUNITY MODE

- `COMMUNITY_DELIVERY = { published: false, visibleToOthers: false, server: false }` (frozen).
- Every card says it plainly: "지금은 이 기기에만 저장돼요. 다른 사람에게 보이지 않아요." (`data-og-community-mode="local"`).
- Saving says "이 기기에 저장했어요. 다른 사람에게는 보이지 않아요." — never "게시", "공개", "올렸어요".
- Area notice (`areas.js`): "쓴 글과 모임 초안은 이 기기에만 저장되고 다른 사람에게 보이지 않습니다. 다른 사람의 글, 댓글, 공감, 신고는 아직 없습니다."
- Area modules: `groups` → live 모임 준비, `mine` → live 내가 쓴 글; `feed`, `neighborhood` remain honest "준비 중" slots.
- 공개 모임 찾기 card is an honest empty state (`data-og-community-empty="directory"`).

## 4. POST MODEL (`community-contracts.js › normalizePost`)

| Field | Rule |
|---|---|
| `id` | `cp_…` (`^[a-z]{2,4}_[a-z0-9]{6,40}$`) |
| `authorMode` | always `'SELF'` (any authorId/authorName input is dropped) |
| `type` | QUESTION 질문 · EXPERIENCE 경험 · INFORMATION 정보 · REVIEW 후기 · TIP 팁 · DAILY 일상 |
| `category` | LIFE 생활 · HEALTHY_LIVING 건강 생활 · HOBBY 취미 · LEARNING 배움 · CULTURE 문화 · OUTING 나들이 · LOCAL 지역 · DIGITAL 디지털 · OTHER 기타 |
| `title` | single line, ≤ 120 |
| `body` | multi-line, line breaks kept (max 2 in a row), control chars removed, ≤ 5000 |
| `status` | `DRAFT` (임시 저장) or `LOCAL` (이 기기에 저장); anything else → `LOCAL` |
| `source` | optional `{ sourceType: PROGRAM/CLASS/EVENT/PLACE, sourceId, sourceTitle ≤ 120 }`; invalid → dropped |
| `createdAt / updatedAt` | edit keeps id, createdAt, source |

Store (`community.js › createPostStore`): list (newest updated first), get, add, update, remove, count. Limit 500 posts. Reasons: `SENSITIVE_NUMBER`, `INVALID_*`, `NOT_FOUND`, `LIMIT`, `STORAGE_FULL`.

List: 20 per page + "더 보기" (no infinite scroll), type filter buttons, category select, search over title/body/type label/category label, summary ≤ 80 chars.

## 5. COMMENTS FUTURE

`normalizeComment({ id, postId, authorId, body ≤ 1000, parentId|null, status visible/hidden/deleted })`. Replies = comments with `parentId` (self-parent refused). `authorId` comes from a future account server. No collection, no UI; the detail dialog says "댓글, 공감, 신고는 커뮤니티 서버와 운영 정책이 생기면 쓸 수 있어요."

## 6. REACTIONS FUTURE

`REACTION_TYPES` LIKE 좋아요 / HELPFUL 도움돼요; `normalizeReaction({ postId, userId, type })`. No collection, no counter, no UI.

## 7. SAVED

A post can be saved as Saved `POST` (`href: '#community'`, description "내 글 · <종류> · 이 기기에만 있어요"). Deleting a post also removes its Saved entry. Saved is SYNCABLE in principle (Phase 2 rule), but sync is not connected; when it is, POST entries must be excluded or consented (see §27).

## 8. SEARCH

Community posts, group drafts and meetup drafts are **not** registered as a global search provider (app.js still has exactly 4 `registerProvider` calls). Searching is only inside 내 글 ("내 글에서 찾기"). QA: global search for a saved post title returns 0 results.

## 9. PROFILE

No community profile, nickname, avatar or follower model. `authorMode: 'SELF'` is the only author form. A public profile needs an account server and a consent design (Phase 7+).

## 10. REPORT

Contract only: `REPORT_REASONS` SPAM · HARASSMENT · PRIVACY · MISINFORMATION · SCAM · OTHER; `REPORT_TARGETS` POST/COMMENT/GROUP/MEETUP/USER; `REPORT_STATUSES` submitted → reviewing → resolved/dismissed. A device never marks a report done; no UI claims "신고 접수".

## 11. BLOCK

Contract only: `normalizeBlock({ blockerUserId, blockedUserId })`, self-block refused (`SELF_BLOCK`). Must be enforced by the server on every read, not by hiding in a UI.

## 12. SAFETY

- Before save, `privacyCheck`: a resident registration number pattern **blocks** the save ("주민등록번호처럼 보이는 숫자가 있어 저장하지 않았어요."); a phone number or detailed address (동/호, 층/호) saves with a reminder.
- Every form shows "주소, 전화번호, 주민등록번호, 자세한 건강 정보는 적지 마세요."
- 함께 지킬 것 card: no addresses/numbers, meet first in busy public places, health records and family settings never go to community, "ONGIL은 아직 글을 자동으로 검사하거나 신고를 받지 않아요."
- This is a pattern check, not moderation, and the copy says so.

## 13. HEALTH BOUNDARY

Community code never imports or references symptoms, healthNotes, medication, checkIn. No "attach health record". `HEALTHY_LIVING` is a topic label only. Test OG-HL-25 / OG-CG-11.

## 14. FAMILY BOUNDARY

No family sharing of posts or drafts (`familySharingAllowed() === false`); community code never references familySharing/helpRequests.

## 15. ENJOY INTEGRATION

- Enjoy detail dialog: "후기 쓰기" button (`data-og-enjoy-review`) closes the dialog and calls `onReview({ type, id, title, category })` — nothing else leaves Enjoy.
- app.js: `pendingReview = reviewPrefill(item)` → `#community/write` → `communityView.startReview(prefill)`.
- `reviewPrefill` → `{ type: 'REVIEW', category: REVIEW_CATEGORY_OF[...] || 'OTHER', title: '<title> 후기', body: '', source: { sourceType, sourceId, sourceTitle } }` (HOBBY→HOBBY, LEARNING→LEARNING, EXERCISE→HEALTHY_LIVING, CULTURE→CULTURE, OUTING/TRAVEL→OUTING).
- **No auto-save**: the form opens; the post exists only after 저장/임시 저장. QA verified post count unchanged after opening.
- Router fix (needed for this flow): the view-change branch now calls `showCommunity(section)` and `enjoyView.show(section)` (only when a section is named, so returning to `#enjoy` keeps the previous category); the duplicated `enjoyView.show` in the `sectionOnly` branch was removed.

## 16. GROUP MODEL (`normalizeGroup`)

`{ id gd_…, name ≤ 80, category WALKING 걷기/READING 독서/PHOTO 사진/HOBBY 취미/LEARNING 배움/EXERCISE 운동/CULTURE 문화/LOCAL 동네/OTHER 기타, meetingStyle ONLINE/OFFLINE/BOTH, region ≤ 20, description ≤ 2000, status DRAFT }`. No members, no join, no chat, no listing. Limit 100. Deleting a group deletes its meetup drafts (calendar events already added stay — they belong to 내 일정).

## 17. MEETUP MODEL (`normalizeMeetup`)

`{ id mt_…, groupId, title ≤ 120, date YYYY-MM-DD (required), time HH:MM|'' , placeText ≤ 60, placeVisibility 'PRIVATE' (always), description ≤ 2000, status DRAFT }`. Limit 300. Place hint: "정확한 집 주소 대신 ‘○○공원 정문’처럼 공공장소 이름을 적어 주세요." ID prefix `mt` (not `md`, to avoid confusion with medication ids).

## 18. CALENDAR

"내 일정에 추가" opens a preview (`data-og-meetup-preview`: 일정 이름/날짜/시간) → "내 일정에 추가" → `schedule.add({ title, date, time })`. Duplicate = same title + date + time (`isMeetupInCalendar`), re-checked right before adding; the button then reads "이미 내 일정에 있어요" (disabled). Place and description are not copied.

## 19. PRIVACY

| Collection | Class | Sync | Global search | Family |
|---|---|---|---|---|
| communityPosts | PRIVATE | no | no | no |
| groupDrafts | PRIVATE | no | no | no |
| meetupDrafts | PRIVATE | no | no | no |

`CONTRACT_CLASSES`: CommunityPost, GroupDraft, MeetupDraft → PRIVATE. Account erase copy: "커뮤니티 글과 모임 초안도 함께 지웁니다."; erase re-renders the community view.

## 20. STORAGE

Keys `ongil.v1.communityPosts`, `ongil.v1.groupDrafts`, `ongil.v1.meetupDrafts` (`{ schemaVersion, items }`). Collections 20 → 23. Damaged JSON / wrong shapes / damaged items are skipped item by item, duplicates dropped; the user can write again. A write refused by the 400,000-char value limit returns `STORAGE_FULL` with a visible message.

## 21. SECURITY

DOM built with `el()` only (no innerHTML). Text normalised (control characters removed). No network APIs, no backend route, no API key, no Firebase/OpenAI/Newon+. Source ids validated by regex. No fixtures in production source.

## 22. ACCESSIBILITY

16px+ text, 44px+ targets (QA: 0 small, 0 tiny at 390/820/1440), labelled fields with hints, `aria-invalid` on the failing field + `role="alert"` error, focus moves to the first invalid field, type filter buttons are `aria-pressed`, dialog: `aria-labelledby`, Tab trap, Escape closes (native dialog), focus returns to the opener row ("자세히"). Delete asks for a confirm step.

## 23. RESPONSIVE

390 / 820 / 1440: no horizontal overflow in any community state (empty, filled, form, detail, group form/detail, meetup form, calendar preview, review). Long unbroken titles and bodies wrap (`.og-community-body { white-space: pre-wrap; overflow-wrap: anywhere }`, min-width 0 in rows).

## 24. PERFORMANCE

QA fixture (tests/QA only, seeded into localStorage): 500 posts + 100 groups + 200 meetups.

| Width | Rows rendered | DOM nodes in community | Search | Filter | 더 보기 | Longest task |
|---|---|---|---|---|---|---|
| 390 | 20 (40 after 더 보기) | 1060 | 7 ms | 18 ms | 30 ms | 119 ms |
| 1440 | 20 (40 after 더 보기) | 1060 | 7 ms | 20 ms | 35 ms | 119 ms |

Group drafts render all (bounded by the 100 limit).

## 25. TESTS

`node --test tests/ongil/*.test.mjs` → **332 / 332 pass** (271 before + 61 new in `tests/ongil/community-data.test.mjs`: OG-CM-1..30, OG-GR-1..15, OG-CG-1..16). No test deleted or skipped.

Changed assertions (intended product changes only):

| Test | WHY | BEFORE | AFTER |
|---|---|---|---|
| care-data OG-FC-1 | 3 new collections | 20 collections | 23 |
| care-data OG-FC-10 | loop over views now also skips `community` (own renderer) | regex listed home/life/family/care/enjoy | regex also allows `community` |
| enjoy-data OG-EN-11 | same shell-loop change | loop regex without community | with community |
| enjoy-data OG-EN-34 | community collections now exist on purpose | "no community collection exists" | community collections are exactly communityPosts/groupDrafts/meetupDrafts and Enjoy view/contracts never reference them |
| enjoy-data OG-EN-48 | collection count | 20 | 23 |
| life-view OG-LF-1 | shell-loop change | loop regex without community | with community |
| foundation-data OG-ST-2 | collection list | 20 names | + communityPosts, groupDrafts, meetupDrafts |
| health-data OG-HL-25 | community modules now live | community: no available modules | available modules = ['groups','mine'] and community-view has no health refs |
| integration-data OG-IN-14 | collection count | "all twenty" / 20 | "all twenty-three" / 23 |
| integration-view OG-IV-1 | collection count | 20 | 23 |
| integration-view OG-IV-8 | PRIVATE list | without community | + communityPosts, groupDrafts, meetupDrafts |
| life-privacy OG-PV-1 | PRIVATE list + contract classes | without community | + 3 collections, + CommunityPost/GroupDraft/MeetupDraft |
| shell OG-VW-1 | community live modules | COMMUNITY_LIVE = [] (all unavailable) | ['groups','mine']; unavailable = ['feed','neighborhood'] |

Browser QA (Playwright, 390/820/1440, QA harness outside the repo): community empty/filled, post create (RRN blocked, phone/address reminder), draft, edit, detail (Tab trap, focus return), search/filter, saved POST, global search 0, group empty/draft/edit/detail, meetup create, calendar preview/add/duplicate, group delete cascade, post delete removes Saved, Enjoy → review prefill (REVIEW/OUTING/"… 후기", no auto-save, source saved), corrupted storage, erase (only ONGIL keys removed), regression screens (home, life, health, family, care, enjoy, store, account, saved) — 0 overflow, 0 console errors. Phase 4/5 QA scripts re-run: same results (timing noise only).

## 26. KNOWN LIMITATIONS

- Nothing is shared: no other people, feed, comments, reactions, reports, blocks, members, joining or messaging.
- Privacy check is a regex pattern check (RRN blocked; phone/address warn), not moderation.
- All posts live in one storage key: very long posts can hit the 400,000-char limit before 500 posts (`STORAGE_FULL` shown).
- Meetup calendar link is one-way: editing/deleting a meetup does not change an event already added.
- Group list is not paged (max 100).
- Saved POST entries are in the `saved` collection, which is syncable by contract; must be excluded when sync is built.

## 27. BACKEND MIGRATION

1. Account server issues `userId`; `authorMode: 'SELF'` posts become `authorId`-owned only on explicit "공개하기" per post (default private).
2. Server collections: posts, comments (parentId), reactions (unique postId+userId), reports (moderation queue, status lifecycle), blocks (applied server-side to every read), groups, memberships, meetups (placeVisibility PRIVATE → MEMBERS only by explicit choice).
3. Moderation & operating policy (신고 처리, 운영 정책, 연령/사기 보호) before any public feed.
4. Exclude Saved `POST` and all PRIVATE community collections from sync until a consent screen exists.
5. Keep contracts in `community-contracts.js` as the shared validation layer.

## 28. PHASE 7 HANDOFF

- Next: **ONGIL PHASE 7 — STORE + PRODUCTS V1** (`#store` is still a placeholder; Saved type `PRODUCT` exists, unused).
- Reuse patterns: local stores with damaged-item skipping and limits, detail dialog with Tab trap/focus return, Saved integration, honest empty states, no fake counts/ratings/reviews.
- Community review flow can later accept `PRODUCT` sources only after a product contract exists (not in `SOURCE_TYPES` today).
- Collections now 23; any new collection must be classified in privacy.js and listed in the count tests.
