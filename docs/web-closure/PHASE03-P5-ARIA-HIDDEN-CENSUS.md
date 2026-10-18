# PHASE 03 P5 — aria-hidden: what was fixed and what is left

Follow-up to `PHASE03-P4-ARIA-HIDDEN-CLASSIFICATION.md`.

## Fixed (clear defect)

- `bs-flow-stage-grid` (business/automation/workflow, internal-tools and others that use `flowStageGridHtml`): the stage order was carried only by the `aria-hidden` numerals, and the container was a plain `<div>` of `<article>`s. The grid is now `role="list"` and each stage `role="listitem"`, so order and count ("1 of 5") are announced. The numeral itself stays `aria-hidden`: on the business pages it is an outlined ghost numeral (transparent fill, 14% stroke) that cannot meet 4.5:1 and is decoration once the list semantics exist.
- A first attempt removed `aria-hidden` from the numeral. The P5 light scan showed 223 failures (transparent text, ratio 1.0), so it was reverted in favour of list semantics.
- Dark-mode number colour on the active/hover item raised (alpha 0.55 → 0.68).

## Census of the rest (ko; evidence, no change)

- Index numerals outside an `<ol>` (`bs-get`, `bs-deliver`, `bs-areas`, `bs-use-board` and similar): unordered enumerations, decorative.
- Mock-UI blocks that contain unique text: `bs-dr-connect` (tool names), `bs-dr-output`, `bs-visual`, `bp-custom__brief` and the phone mock. Whether they are illustration or content is a **design/owner decision**; they also touch the offer-wording question. Not changed.
