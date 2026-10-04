# LIVON Onboarding V1 — Anonymous Personalization & First-Run Experience

Status: local prototype on branch `livon-onboarding-v1` (base `e4c8e2f49`, LIVON Admin Local V1). Not deployed.

LIVON asks three optional things — an age band, interests, and Life Events — and uses them, on the device only, to
put more relevant information first. There is no sign-up, no server profile, no AI call and no analytics transport.

| File | Role |
| --- | --- |
| `livon/livon-personalization.js` | `window.LivonPersonalization`: profile, first-run state, rule-based recommendation |
| `livon/livon-onboarding.js` | `window.LivonOnboarding`: arrival note and the 4-step dialog (UI only) |
| `livon/index.html`, `livon/life-page.css` | markup for the note and the dialog, `.lv-ob*` styles |
| `tests/livon/onboarding.test.mjs` | ON-1 … ON-41, persona QA, regressions |

## Flow

```
arrival ──► small note (never a dialog)
              NEW, empty device      "LIVON에 오신 걸 환영해요"  [나에게 맞게 시작하기] [먼저 둘러보기]
              NEW, device has data   "나에게 맞게 보기"          [맞춤 설정하기] [괜찮아요]
              IN_PROGRESS            "맞춤 설정을 이어서 할까요?" [이어서 하기] [그만두기]
              COMPLETED / SKIPPED    nothing

start   ──► dialog: 1 연령대 → 2 관심 분야 → 3 Life Event → 4 미리보기 → [이대로 시작하기]
```

- Every step can be passed with nothing chosen. "나중에 할게요" is on every step.
- States: `NEW` → `IN_PROGRESS` → `COMPLETED` or `SKIPPED`.
- × / Escape / backdrop closes and keeps the draft (`IN_PROGRESS`; the note offers to resume, also after a reload).
- "나중에 할게요", "먼저 둘러보기", "괜찮아요", "그만두기" set `SKIPPED`. Nothing is limited; the note is not shown again.
- Nothing is applied to the screens until the user presses "이대로 시작하기".
- A device that already has LIVON data (saves, to-dos, posts, AI threads, or existing preferences) is treated as an
  existing user: a short invitation only, existing preferences are the starting draft, and no stored data is changed.
- The older one-screen onboarding in `livon-platform.js` was removed; its flags (`onboarded`, `onboardSkipped` in
  `livon.platform.v1`) are still read, so a user who finished or skipped it is not asked again.

## Profile schema

`LivonPersonalization.getProfile()`:

```js
{
  version: 1,
  lifeStage: "20",                 // "10" … "70", or ""
  interests: ["주거", "금융"],      // ≤ 20 items, ≤ 20 characters each
  lifeEvents: ["first-job"],       // ≤ 8 ids from the Life Event catalog
  onboardingCompleted: true,
  state: "COMPLETED",              // NEW | IN_PROGRESS | COMPLETED | SKIPPED
  updatedAt: 1790000000000
}
```

`sanitizeProfile()` is applied on every read and write: unknown stages and event ids, duplicates, long strings and
any other field are dropped. A stored record with an unknown `version` is ignored (the user is treated as new); a
record without a version is migrated to version 1.

## Storage

No new profile store was added. The profile is the three preference keys every LIVON screen already reads.

| Key | Content | Class in `LivonUserData` |
| --- | --- | --- |
| `livon.lifeStage` | `"20"` | ACCOUNT_SYNC (existing) |
| `livon.lifeInterests` | `["주거"]` | ACCOUNT_SYNC (existing) |
| `livon.lifeEvents` | `["first-job"]` | ACCOUNT_SYNC (existing) |
| `livon.mlInterests` | Explore's mirror of interests, kept consistent | existing |
| `livon.platform.v1` | `onboarded` / `onboardSkipped` flags kept for older code | existing |
| `livon.personalization.v1` | `{version, state, step, draft, updatedAt}` — **the only new key** | DEVICE_LOCAL |

All reads and writes go through `LivonUserData.read / write`, and so through the storage guard.

## Privacy

- Asked: age band, interests, Life Events. Nothing else.
- Never asked, inferred or stored: name, birth date, phone, e-mail, address, employer, income, assets, health
  condition, illness, political view, religion, sexual information. The dialog has no free-text field.
- Nothing leaves the browser. The two scripts contain no `fetch`, XHR, beacon or external URL.
- Copy shown on every step: "선택한 내용은 이 기기에서 LIVON을 맞춤 설정하는 데만 사용돼요. 회원가입 없이 쓸 수 있고, 언제든 바꾸거나 지울 수 있어요."
- Admin Local shows one status row (`Personalization Engine: LOCAL RULE-BASED`). Admin and Data Manager never read a
  visitor's profile; the Data Manager simulation runs on a profile typed into the tool.

## Life Stage

The seven bands of `LivonLifeData.stages` (10대 … 70대 이상). One choice, can be undone. No exact age or birth date.

## Interests

The existing list `LivonLifeData.interests`. An entry is offered only while it leads to at least one real record.
Interests the user typed earlier in My Life stay selectable so nothing is lost. No new category was added.

## Life Events

The existing catalog (`LivonLifeEvents.events`, 34 entries). Events of the chosen band are shown first; the others
are behind "다른 항목 더 보기". Up to 8.

Content gaps: `freelance`, `car`, `abroad` and `long-trip` have no guide in any band yet, and many other events have
guides only for some of their bands (for example `parent-care` has one for 40대 but not for 50·60대). When a chosen
event has nothing for the user's band, the preview says so ("‘프리랜서’ 안내는 아직 준비 중이에요…"), `recommend()`
lists it in `gaps`, and no row is presented as being about that event.

## Recommendation

`LivonPersonalization.recommend(profile, { limit, kinds })` — deterministic, local, engine `LOCAL RULE-BASED`.
Candidates come from the Data Platform repository (`LivonScreenData.repository().getRecommendations`).

| Signal | Weight | Reason shown to the user |
| --- | --- | --- |
| Life Event on the record | +4 | 선택한 ‘첫 취업’ 관련 |
| Record linked from a topic of that Life Event | +3 | 선택한 ‘첫 취업’ 관련 |
| Life Stage | +3 | 20대 주제 |
| Interest (at most two count) | +2 each | 관심사 ‘주거’ |
| Featured record | +0.5 | (not a reason) |

- Every item has `reasons[]` (`event` / `stage` / `interest` with the chosen value) and `why`, the first reason as a
  short sentence. A reason only states what the user chose — never popularity, never "AI".
- Age context: a record staged for other bands is never recommended. Unstaged records are excluded when their tags
  name another band, 청소년 (10대 only), 청년 (20·30대 only), the senior domain (50대+ only), or a family-formation event
  (육아·보육·출산·결혼) whose bands do not include the user's. This keeps `ex:ex-childcare` / `pol:pol-childcare` away
  from 70대 while they stay available to 20–40대.
- With other signals present, a non-topic row matching the stage alone is not treated as a recommendation.
- Returns `{ personalized, method: "rule-based", items, gaps }`. An empty profile returns no items.

`preview(profile)` groups a few items per kind (주제, 가이드, 정책·제도, 서비스, 프로그램, 오늘의 발견) for step 4.
`allowedIds(stage)` and `eventBoost(text, lifeEvents)` let a screen that ranks its own records apply the same rules.

## Home integration

`home-page.js` `renderMyStage`: when the profile has Life Events (or signals without a stage), the "추천 주제"
column is `recommend(profile, { kinds: ["topic"], limit: 3 })`, each with its reason. Otherwise Home is unchanged.
On finish the onboarding calls `LivonHome.render()`.

## Today / Explore integration

- Today (`today-feed.js`): the feed profile now includes Life Events; a matching item gets +2. Stage and interest
  scoring is unchanged.
- Explore (`explore-page.js`): "For You" uses `recommend()` for the reasons and `allowedIds(stage)` so a row of
  another age band is not recommended. Browsing, search and categories are not filtered.
- Life Stage (`life-page.js`): follows a newly chosen band unless the user is on a specific stage or topic URL.
- All screens listen for the `livon:personalization` document event and re-render.

## Community integration

Updated by LIVON Community + Onboarding Integration V1 (see `LIVON_COMMUNITY_UX.md`).

- `community-page.js` `userSignals()` reads the profile through `LivonPersonalization.getProfile()`. The community
  store (`livon.cmStore.v1`) holds no copy of Life Stage, interests or Life Events, and no second profile exists.
- `community-service.js` `forYou(post, signals)` ranks the For You tab: the post's Life Event chosen by the reader
  +4, Life Event words in the post +2 (`eventBoost`), same Life Stage +3, category of an interest +2, interest word +1,
  category of a joined group +1. Every boosted card shows the first reason ("선택한 ‘육아’ 관련", "30대 글", "관심사 ‘가족’").
- Age context: a post written for another band, a post whose Life Event does not belong to the reader's band, and a
  post about 육아·보육·출산·결혼 outside those bands (`textAgeOk`) is never boosted. It stays readable in 최신.
- Without a profile the For You tab is the latest order and says so, with a button that opens this onboarding.
- Ownership: Community only reads the profile. `Repo.resetLocal()` (커뮤니티 기록 지우기) clears community data only;
  `LivonPersonalization.reset()` clears the three preference keys only. Each is tested against the other.

## Settings

My Life → 개인 설정 (`#ml-settings`) shows the band, interests and Life Events by name, each with "변경"
(`data-lv-onboard-edit="stage|interests|events"`, opens the dialog at that step in edit mode) and "맞춤 설정 다시 하기".
In edit mode the secondary action is "바꾸지 않고 닫기"; leaving an edit never undoes a finished setup.
`LivonPersonalization.update(patch)` saves a change at once.

## Reset

"맞춤 설정 초기화" (with a confirmation) calls `reset()`: it clears Life Stage, interests and Life Events only and sets
the state to `SKIPPED`. Saves, to-dos, goals, journal, posts, comments and AI threads are not touched.

## Fallback

| Situation | Behaviour |
| --- | --- |
| Nothing chosen / skipped | Default screens, default order. Nothing is hidden. |
| Storage blocked by the browser | The storage guard's in-memory store is used; the dialog adds "창을 닫으면 선택한 내용이 사라질 수 있어요". |
| Damaged stored values | Sanitized on read; an unreadable record means a first-visit state. No error. |
| Data Platform not loaded | `recommend()` returns no items; the steps still work with the taxonomy files. |
| Chosen Life Event has no content | Reported in `gaps`; other signals still apply. |
| Scripts missing | `LivonPlatform.openOnboarding()` does nothing; the page works as before. |

## Future NEWON+ migration

Not built. `exportForAccount()` returns `{ version, lifeStage, interests, lifeEvents, updatedAt }` for a later,
explicit import. The three keys are already classified `ACCOUNT_SYNC`, so the existing
`LivonUserData.planLoginImport` path applies: nothing is uploaded automatically, and only after the user agrees.
`livon.personalization.v1` is `DEVICE_LOCAL` and never syncs. `aiContext()` exists as an interface for a future
LIVON AI; nothing calls it.

## Analytics schema

Names only, defined in `ANALYTICS_EVENTS`; no transport exists:

`onboarding_started`, `stage_selected`, `interest_selected`, `life_event_selected`, `onboarding_completed`,
`onboarding_skipped`, `personalization_updated`

`_log()` keeps at most 50 in-memory entries of `{ event, step, at }` for tests. Chosen values are never recorded.
A consent step is required before any of this may be sent anywhere.

## Accessibility

- The arrival note is a labelled `region`, not a dialog: it takes no focus and blocks nothing.
- Dialog: `role="dialog"`, `aria-modal`, labelled by the step heading; focus moves to the heading on every step;
  Tab is trapped; Escape closes; focus returns to the opener (or to `<main>`).
- Choices are real `<button>`s with `aria-pressed`; groups are labelled; the "더 보기" toggle has `aria-expanded`.
- Progress is a `progressbar` with `aria-valuetext` ("4단계 중 2단계, 관심 분야"); selection changes are announced
  through a polite `status` line.
- Touch targets are at least 2.75rem high; visible `:focus-visible` outlines; `prefers-reduced-motion` removes the
  progress transition. Checked at 320, 390, 768 and 1440 px without horizontal scrolling.

## Verification

```
node --test tests/livon/onboarding.test.mjs
node --test tests/livon/*.test.mjs
node scripts/publish-site.mjs
```
