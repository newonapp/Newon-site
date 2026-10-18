# PHASE 03 P4 — aria-hidden decorative elements: classification

Basis: the low-contrast text items found by the computed-style scan (ko light, ko dark, en dark; 1440 and 390 px). Every one of them sits inside `aria-hidden="true"`; none is exposed to assistive technology. WCAG 1.4.3 exempts pure decoration, but not text that carries information, so each class is sorted by whether it carries information.

## Class A — decorative or duplicated elsewhere (treated as exempt, no change)

| Class | Text | Why it carries no information |
|---|---|---|
| `bp-mark__line` | BUSINESS / AUTOMATION / BRAND… | Hero watermark. It repeats the page name, which is in the visible `<h1>`. |
| `bp-proc__n` | 01–06 | The visible sibling `.bp-proc__label` has the same number, inside an `<ol>`. |
| `bp-lflow__n` | 01–06 | The visible sibling `.bp-lflow__label` has the same number, inside an `<ol>`. |
| `bz-process__n`, `bz-process__meta` | 01–05, "05 STEPS" | The step order and count come from the `<ol>`. |
| `bz-inq-explore__n` | 01–03 | Card index only. The cards are links with their own titles. |
| `bs-use-board__n` | 01–08 | Index of an example board. Each item has its own title and tag. |
| `bp-when__ghost` | 01–05 | Ghost numerals behind the cards. |

## Class B — needs a judgment call (not changed)

| Class | Pages | Question |
|---|---|---|
| `bs-flow-stage-grid__n` (01–05) | business/automation/workflow, business/internal-tools | The number marks the order of TRIGGER→… stages. The container is a `<div>` of `<article>`s, not an `<ol>`, so the order is not announced. Options: convert it to `<ol>`, or expose the number. |
| `bp-custom__brief` (QUESTION / CONTEXT / SCOPE / OUTPUT, "REPORT STRUCTURE PREVIEW") | business/research | The whole mock brief is hidden. Its field names are not repeated in the visible prose. If they are meant as content, un-hide them. If they are illustration, leave them. |
| `bs-sv-biz-app__*` (phone mock: "CORE TASK", Onboard/Home/Action, "Continue", "TODAY") | business/app, business/mvp, business/ai-automation | UI mockup text. It reads as an illustration, but it shows what a delivered app would look like, so it hints at an app-building offer. This is a wording question (see the B-type audit), not an accessibility question. |
| `bs-sv__k`, `bs-sv-app__kicker` | same | Labels inside the phone mock. They follow the previous row. |
| Un-classed `SPAN`/`EM` ("Convert", "Review", "Running", "EST. 2026", "P2") | business/design, internal-system, landing, workflow, ux-audit, inquiry | Mock-UI chips. Treated like the phone mock. |

## Result

- Items scanned: 109 (ko light), 66 (ko dark), 57 (en dark). Aria-hidden ones: all of them. Non-aria-hidden contrast failures: **0**.
- No visible, exposed text failed WCAG AA 4.5:1 (3:1 large) in the scanned configurations.
- Class B is the open list for the owner and design. No change was made without a decision.
