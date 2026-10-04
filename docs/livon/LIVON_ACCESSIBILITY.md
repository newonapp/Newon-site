# LIVON Accessibility Hardening V1

Branch `livon-accessibility-v1`, on top of LIVON SEO Expansion V1 (`0ef28b895`).

This document records an accessibility audit of the whole LIVON product and the fixes that followed.
The target is **WCAG 2.2 Level AA**. It is a target that was tested with static checks, browser
automation and keyboard walk-throughs. It is not a conformance claim and LIVON holds no accessibility
certificate. Everything that could not be verified is listed under **MANUAL REVIEW REQUIRED** instead of
being counted as a pass.

## 1. Scope

| Area | Screens |
| --- | --- |
| Public app (`/livon/`) | Home, Life Stage, Life Event, Life topic / search / service sub-views, Today (feed, detail), My Life (all panels, settings), Explore (search, filters, detail), Community (feed, search, composer, drafts, detail, comments, replies, report), LIVON AI, global search panel, onboarding, preferences, Help (home, category FAQ, search, article, troubleshooting, service status) |
| Static pages | Life Stage overview, 7 Life Stage pages, 56 topic pages, Life Event overview and 20 event pages, Help home and 39 Help articles (125 pages, one generator template) |
| Local tools | Admin (19 sections, record view, command palette, global search), Data Manager (17 views, record inspector) |

Print styles are out of scope.

## 2. Method

1. **Static checks** — `scripts/livon-accessibility-quality.mjs` (no browser, no dependency). It runs in the site
   build after the SEO check and in the test suite.
2. **Browser audit** — Chromium driven by Playwright at 320, 390, 768, 1024 and 1440 px over 21 app states,
   8 static pages and every Admin / Data Manager view. For each state: language, title, H1, heading order,
   landmarks, names of links, buttons and form controls, duplicate ids, ARIA references and roles, nested
   interactive elements, focusable content inside `aria-hidden`, target size with the WCAG spacing exception,
   text contrast of every rendered text node, form-field boundary contrast, page overflow.
3. **Keyboard** — a Tab walk of every page (each tab stop must be on screen, not covered by fixed or sticky
   chrome, and show a focus indicator), dialog containment and focus return, and eight user tasks done with the
   keyboard only.
4. **Adaptation** — text-spacing user stylesheet, 200% text, reduced motion, forced colors.
5. **Before / after** — full-page screenshots of 12 screens at 390 and 1440 px were compared pixel by pixel with
   the baseline commit to confirm that only the intended areas changed.

No accessibility library is bundled. `axe-core` was not available in the audit environment (the package
registry refused it), so the audit used its own deterministic checks. See section 22 for what that leaves out.

## 3. Result

| | Before | After |
| --- | --- | --- |
| BLOCKER | 0 | 0 |
| SERIOUS | 8 | 0 |
| MODERATE | 13 | 0 |
| MINOR | 12 | 4 |
| MANUAL REVIEW REQUIRED | — | 8 |

## 4. WCAG 2.2 matrix

| Criterion group | Status | Notes |
| --- | --- | --- |
| 1.1 Text Alternatives | Pass (tested) | Every `<img>` in markup and in script templates has `alt`; decorative images use `alt=""`; SVG icons are `aria-hidden`; icon-only buttons have a name. |
| 1.3 Adaptable | Pass (tested) | One `main`, named screens and navigation landmarks, one level-1 heading per screen and per page, headings in order, lists for comments and replies, labels tied to controls. |
| 1.4 Distinguishable | Pass (tested) with manual items | Text 4.5:1 and field boundaries 3:1 where the background is known; text over video or photos is MANUAL REVIEW. Reflow at 320 px, text spacing, 200% text and forced colors tested. |
| 2.1 Keyboard Accessible | Pass (tested) | Every control reached with Tab; eight tasks completed with the keyboard only; no trap. |
| 2.2 Enough Time | Pass (tested) | No time limit. Background films can be paused (2.2.2); they start paused when the system asks for reduced motion. |
| 2.3 Seizures and Physical Reactions | Pass (reviewed) | No flashing content. No `<marquee>` / `<blink>`. |
| 2.4 Navigable | Pass (tested) | Skip link, page titles per view, focus order follows the DOM, link purpose, headings and labels, visible focus. |
| 2.5 Input Modalities | Pass (tested) | No path-based or multi-point gesture, no drag and drop, label in name, targets ≥ 24 px or spaced. |
| 3.1 Readable | Pass with one minor item | `lang="ko"`; short English labels are marked `lang="en"`. Admin / Data Manager: see R-2. |
| 3.2 Predictable | Pass (tested) | No change of context on focus or input; navigation and Help are in the same place on every screen. |
| 3.3 Input Assistance | Pass (tested) | Errors in text, tied to the field, focus moves to the field; destructive actions ask first. |
| 4.1 Compatible | Pass (tested) | Unique ids, valid roles and references, name / role / value for custom controls, status messages in live regions. |

WCAG 2.2 additions:

| Criterion | Status | Notes |
| --- | --- | --- |
| 2.4.11 Focus Not Obscured (Minimum) | Pass (tested) | `scroll-padding-top` under the fixed header; the tall sticky filter column scrolls on its own. Tab walk: 0 covered stops. |
| 2.4.12 Focus Not Obscured (Enhanced, AAA) | Reviewed | Not a target. The Tab walk checks the centre of each focused element, not every pixel. |
| 2.4.13 Focus Appearance (AAA) | Reviewed | Not a target. Rings are 2–3 px solid; a few inputs show the ring on their wrapper. |
| 2.5.7 Dragging Movements | N/A | LIVON has no drag interaction (no `draggable`, no drag handlers). |
| 2.5.8 Target Size (Minimum) | Pass (tested) | Undersized targets pass the spacing exception or were enlarged. |
| 3.2.6 Consistent Help | Pass (reviewed) | The Help link sits in the same place in the app chrome, and in the header and footer of every static page. |
| 3.3.7 Redundant Entry | N/A | No multi-step process asks for the same information twice; onboarding keeps its draft. |
| 3.3.8 Accessible Authentication (Minimum) | N/A | LIVON has no sign-in. Nothing is asked to be remembered, solved or transcribed. |

## 5. Issue register

Status after this phase: **Fixed** unless stated.

| ID | Severity | Screen | WCAG | Problem | Fix |
| --- | --- | --- | --- | --- | --- |
| A-01 | SERIOUS | Every app view | 2.4.1 | The skip link pointed at `#livon-home`. From any other view it switched to Home and left focus on the page body. | The link now moves focus to the screen that is showing (`livon-a11y.js`). |
| A-02 | SERIOUS | Every app view | 2.4.2 | Today, My Life, Explore and LIVON AI shared the Home title. A detail title set in one view stayed after moving to another. | A title per view (`탐색 · LIVON` …), My Life panels included; stale titles are replaced; Explore details name the item. |
| A-03 | SERIOUS | Film headers on 7 views, service cards | 2.2.2 | Eight looping background videos started on their own and could not be paused; the film keeper restarts a paused video. | A pause control on every film header freezes all background videos (`playbackRate = 0`), keeps the choice, and starts paused under "reduce motion". |
| A-04 | SERIOUS | Today → 이번 주 | 4.1.2, 1.3.1 | The week list was rendered into the first filter button ("전체"): cards and buttons sat inside a button and the titles were unreadable. | The list has its own container; the filter group is named and exposes pressed state. |
| A-05 | SERIOUS | Mobile menu, Life Stage picker | 2.4.3 | In these modal dialogs Tab moved to the page behind. | Tab now wraps inside any open modal that does not handle it itself. |
| A-06 | SERIOUS | Home, ≤ 860 px | 1.4.10 | Two captions and the buttons in the hero overlapped; the text could not be read. | They stack on narrow screens. |
| A-07 | SERIOUS | Home AI input, Life Stage picker | 2.4.7 | No visible focus indicator. | Focus rings added. |
| A-08 | SERIOUS | Life Stage cards | 4.1.2 | Buttons carried `role="listitem"`, so they were not announced as buttons. | Native buttons in a named group. |
| M-01 | MODERATE | Forms in every view, Admin, Data Manager | 1.4.11 | Field boundaries were 1.3:1 against the background. | `#858585` / `#85827a` (3.7:1). |
| M-02 | MODERATE | Community, AI, Explore, Home search | 1.4.3 | Grey text at 4.48:1 (`#777`) and 3.54:1 (`#888`) on white. | `#737373` (4.74:1). |
| M-03 | MODERATE | Life, Today, Home, search panel | 4.1.2, 1.4.1 | Selected chips and filters were marked only with a CSS class. | `aria-pressed` in the renderers and kept in sync; section links use `aria-current`. |
| M-04 | MODERATE | Explore results | 4.1.3 | The whole results region was a live region. | Only the result count is a status message. |
| M-05 | MODERATE | Explore detail | 2.4.3 | Opening a detail left focus on the page body. | Focus moves to the detail heading. |
| M-06 | MODERATE | Life Stage picker, search panel, language menu, onboarding | 2.4.3 | Closing left focus on the page body. | Focus returns to the opener, or to the screen when the opener was re-rendered. |
| M-07 | MODERATE | Explore results, ≥ 960 px | 2.4.11 | The sticky filter column was taller than the window; its lower filters could not be brought into view. | The column scrolls on its own. |
| M-08 | MODERATE | Every app view | 2.4.11 | Focused elements could scroll under the fixed header. | `scroll-padding-top`. |
| M-09 | MODERATE | My Life → 설정 | 3.3.2 | Ten checkboxes were all labelled "받기". | Each label names its alert. |
| M-10 | MODERATE | Admin, Data Manager | 4.1.3 | `aria-live` wrapped the whole application: every render was announced in full. | One status line (page name and record count). |
| M-11 | MODERATE | Every app view | 1.4.11 | In forced-colors mode the selected tab / chip was not distinguishable. | System `Highlight` outline. |
| M-12 | MODERATE | Life topic, Life search, Today detail | 1.3.1 | No level-1 heading (the view's H1 is hidden in these sub-views). | The sub-view title is level 1 and the headings below follow. |
| M-13 | MODERATE | Life setup, Today setup, Home tab lists | 2.1.1 | `role="tab"` without arrow-key support. | Arrow, Home and End keys. |
| N-01 | MINOR | Life, Today, Explore | 2.4.4 | "자세히 보기", "전체 보기", "저장하기" repeated without their subject. | Hidden subject text or a named group. |
| N-02 | MINOR | Life search | 1.3.1 | Results jumped from H2 to H4. | A results heading. |
| N-03 | MINOR | Community detail | 1.3.1, 3.3.1 | Comment and reply lists had no name; the comment error was not tied to its field. | Labelled lists; `aria-describedby`. |
| N-04 | MINOR | Life / My Life dialogs | 2.4.3 | The full-screen backdrop was a tab stop. | `tabindex="-1"`. |
| N-05 | MINOR | Admin review queue | 4.1.1 | Ids contained spaces. | Valid generated ids. |
| N-06 | MINOR | Admin, Data Manager | 2.5.8 | Priority links 17×16 px; link buttons 20 px high. | 24 px. |
| N-07 | MINOR | Admin, Data Manager | 1.3.1 | Two navigation landmarks named "Pages". | Distinct names. |
| N-08 | MINOR | Onboarding | 4.1.3 | Finishing gave no confirmation to a screen reader. | A status message. |
| N-09 | MINOR | Every app view | 3.1.2 | Short English labels were not marked. | `lang="en"` (83 in markup; script-rendered ones at run time). |
| N-10 | MINOR | Every app view | 2.3.3 | No global rule for reduced motion (transitions, spinners). | Global rule. |
| N-11 | MINOR | Admin | 2.4.11 | Focus could land under the sticky top bar. | `scroll-padding-top`. |
| N-12 | MINOR | Today | 1.3.1 | Filter groups had no name. | `role="group"` with a label. |

## 6. Remaining issues

| ID | Severity | Where | Why it stays |
| --- | --- | --- | --- |
| R-1 | MINOR | Three simple tab lists (Life setup, Today setup, Home) | Arrow keys work, but every tab is still in the Tab order and there is no `tabpanel` relationship. Making them full tab widgets means changing how those modules render; it was left out to keep the change small. |
| R-2 | MINOR | Admin, Data Manager | `lang="ko"` with English interface labels and Korean data. These are local tools and an existing test pins the language. English labels are not marked. |
| R-3 | MINOR | App | Product terms inside Korean sentences ("Life Event", "For You") are not marked as English. Treated as names. |
| R-4 | MINOR | Today cards | Teaser text is clamped to a few lines at every text size. The full text is on the detail page. |

**MANUAL REVIEW REQUIRED**

| ID | What | Why it cannot be passed automatically |
| --- | --- | --- |
| MR-1 | Text over video and photographs (hero captions, cards with image backgrounds) | Contrast depends on the frame behind the text. About 56 text nodes per view. |
| MR-2 | 44 declared greys that pass only on a dark background | The background is not known statically. Every rendered text node was measured in the browser (0 failures over about 5,000 nodes per view), but states that were not rendered were not measured. |
| MR-3 | Screen readers | VoiceOver, NVDA, JAWS and TalkBack were not run. Names, roles and states were checked in the DOM only. |
| MR-4 | The video pause on Safari and iOS, with the real films | The audit environment blocks the video host; a local WebM clip in Chromium was used. `playbackRate = 0` is standard, but real devices were not tested. |
| MR-5 | 400% zoom and 200% text on a phone-sized window | 200% text at 1280 px and reflow at 320 px pass. Doubling `rem` text at 390 px pushes some horizontal card rows wider than the window. |
| MR-6 | Forced colors | Checked through Chromium emulation (computed outlines). Not checked on Windows High Contrast. |
| MR-7 | Voice control and switch access | Not tested. |
| MR-8 | External official sites | Linked pages are outside LIVON. |

## 7. What changed

New files:

- `livon/livon-a11y.js` — loaded last. Skip link, titles, route status, dialog containment and focus return,
  disclosure focus return, arrow keys for simple tab lists, chip state, heading levels in sub-views, language of
  short English labels, the background-video control. It sends nothing and keeps one local preference,
  `livon.a11y.motion.v1`.
- `livon/livon-a11y.css` — loaded last. Focus placement and rings, field boundaries, the Home hero on narrow
  screens, the pause control, reduced motion, forced colors.
- `scripts/livon-accessibility-quality.mjs`, `tests/livon/accessibility.test.mjs`, this document.

The page's inline scripts are unchanged (their CSP hashes still match `vercel.json`).

## 8. Keyboard

Eight tasks, keyboard only, at 390 and 1440 px:

| Task | Result |
| --- | --- |
| TASK 1 First visit → finish onboarding | Pass. Focus lands on each step title; the result is announced; focus is not lost when the dialog closes. |
| TASK 2 Life Stage → topic → detail | Pass. Focus moves to the topic title and to the detail heading. |
| TASK 3 Explore search → filter → detail → save | Pass. The count is announced; the first save asks where it is stored (focus on the confirm button) and returns focus. |
| TASK 4 Community search → post → comment → reply → save | Pass. |
| TASK 5 Community write → edit → report → delete | Pass. An empty submit marks the title, explains it and focuses it. Delete asks first, with focus on "취소". |
| TASK 6 Help search → article → related article | Pass. Focus lands on the H1 of each. |
| TASK 7 My Life → settings → change interests | Pass. |
| TASK 8 LIVON AI → ready and error state | Pass. The error is an alert with a retry button that receives focus. |

Tab walk (17 pages × 320 / 768 / 1440 px, up to 260 stops each): every stop was on screen, uncovered and had a
visible indicator.

## 9. Focus

- Rings: 2 px solid in the app and static pages, 3 px in Admin / Data Manager. Where an input has no ring of its
  own the wrapper shows it (`:focus-within`).
- Programmatic focus targets (headings, screens) take focus without a ring.
- `scroll-padding-top` keeps the focused element below the fixed header and sticky sub-navigation.

## 10. Contrast

- Known pairs (14) are checked in the build: body, secondary, muted and meta text, text on ink, error text, field
  boundaries, focus rings.
- Rendered text was measured in the browser for 25 states with seeded content (a post with tags, a comment, a
  to-do, an AI message): 0 failures after the fixes.
- Text over media and greys on unknown backgrounds: MR-1 and MR-2.

## 11. Forms

Every control has a label (wrapped, `for`, or `aria-label`). Placeholders are hints only. Required fields use
`required` / `aria-required`. Errors are text, set `aria-invalid`, are referenced with `aria-describedby`, and the
field takes focus. No personal-data fields exist, so no `autocomplete` tokens were added.

## 12. Dialogs

All dialogs have `role="dialog"` or `alertdialog`, `aria-modal`, a name, an initial focus target, Escape, a close
control and focus return. Containment is done by each dialog's script, or by the layer when a script does not do
it. At 320 and 390 px the panels stay inside the window and scroll inside.

## 13. Search

Explore, Community, Help, Life, Today and the global panel: labelled input, `role="search"` where it is a form,
result count as a status message, an empty-result message, a clear control with a name.

## 14. Community

Feed tabs are real tabs (roving tabindex, arrow keys, tab panel). Filters expose pressed state. The composer is a
dialog with labelled fields, counters hidden from assistive technology, and an autosave status. Comments are a
labelled list; replies are a nested labelled list, one level. Report and delete are alert dialogs.

## 15. Onboarding and personalization

A progress bar with text ("4단계 중 2단계, 관심 분야"), a focusable step title, chips with pressed state, a status
line for the selection, back / next / later. Recommendation reasons are written out ("이유 · …").

## 16. Help

One H1 per Help view (it takes focus), a search landmark, FAQ buttons inside headings with `aria-expanded` and
`aria-controls`, related links with full titles, service status as text plus a label. Consistent Help: see 3.2.6.

## 17. Admin

Skip link, one main, status line, tables with caption and `scope`, labelled filters, a combobox search with
`aria-activedescendant`, a native `<dialog>` command palette. Focus moves to main on navigation.

## 18. Data Manager

The same pattern: skip link, status line, labelled filters and sorting, captioned tables, a native `<dialog>`
record inspector with focus return.

## 19. Static pages

One template, so one fix reaches all 125 pages. The build checks each page: language, title, one H1, heading
order, one main, named navigation landmarks, breadcrumb with `aria-current`, link text, unique ids, no script,
"새 창" on links that open a new window.

## 20. Responsive, text resize, text spacing

- 320, 390, 768, 1024, 1440 px: no horizontal page scrolling on 18 screens.
- 200% text at 1280 px: no clipped text and no page overflow.
- `line-height: 1.5`, paragraph spacing 2em, `letter-spacing: .12em`, `word-spacing: .16em` at 320 px: no clipped
  text and no page overflow.

## 21. Reduced motion and forced colors

With "reduce motion": background films start paused, reveal animations do not run, smooth scrolling is off, and a
global rule cuts animations and transitions. With forced colors: selected items and focus use `Highlight`.

## 22. Limits of the automated checks

The static script reads markup and CSS. It does not lay out the page, so it cannot see focus order, covered
elements, real target sizes, or the background behind a colour; it does not read templates that build labels
through helper functions. The browser checks cover those for the states that were opened, in Chromium only.
Nothing here replaces testing with assistive technology and with disabled users.

## 23. Deployment notes

`node scripts/publish-site.mjs` runs the accessibility check and stops the build on an error. After a deploy,
check on real devices: the pause control with the real films (Safari, iOS, Android), a screen reader pass of the
eight tasks, and Windows High Contrast.
