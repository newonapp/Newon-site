# PHASE 03 P4 — Service structured data: analysis and proposals

Status: **analysis only. No JSON-LD was modified in P4.**

## Current state (measured on the P4 branch)

- 107 `"@type": "Service"` JSON-LD blocks across the 9 languages. ko has 11 and the other 8 languages have 12 each.
- Four generators emit them:
  - `scripts/render-business-pillars.mjs` (`jsonLd`)
  - `scripts/render-creative.mjs`
  - `scripts/render-studio-pillars.mjs`
  - `scripts/studio-areas.mjs`
- Every block has `provider: Organization Newon` and `areaServed: "Worldwide"`.
- `name` and `description` come from each page's SEO/meta copy, so they track the page copy.

## Findings

1. **`business/build` and `business/solutions`** (C/D-class pages, not yet redirected) still describe an outsourcing or custom-development offer in `description`.
   - ko build: "…아이디어를 실제 제품으로 설계하고 구현합니다."
   - ko solutions: "White-label, 맞춤 제품, 출시 패키지, 내부 시스템…"
   - en solutions: "white-label, custom products, launch programs, internal systems."
   - This is inconsistent with the Info-only/App-first policy and the unconfirmed-business-model rule. Those pages are outside the P4 edit scope (no C/D redirects, no page changes), so this is recorded as a blocker.
2. `name` is inconsistent in form: "AUTOMATION", "Newon Creative", "기획·진단", "Partnerships". A few are uppercase labels, not names.
3. There is no `serviceType` on most blocks, and no `Offer`/price. The absence of price/Offer is correct, because ShareOn commission and prices are not final.
4. `areaServed: "Worldwide"` is an unconfirmed claim and could be dropped or kept at the owner's discretion.
5. A "Service" type for informational Studio/Business partnership pages can imply a bookable commercial service. `Organization`+`WebPage`/`CollectionPage` may be more accurate.

## Proposals (not applied)

| # | Proposal | Scope | Risk |
|---|----------|-------|------|
| P-1 | Change `@type` from `Service` to `WebPage` (or `CollectionPage` for hubs) with `about: Organization Newon` for A/B pages. | 4 generators | Possible loss of the Service rich-result eligibility, which is not used today. |
| P-2 | If `Service` is kept: set `description` to the page's reframed lead (already cleaned of outsourcing wording by the B-type pass) and add `serviceType` such as "Partnership inquiry". | B-type generators | Low |
| P-3 | Drop `areaServed` unless the owner confirms the regions. | 4 generators | Low |
| P-4 | When C/D pages are redirected, remove their Service blocks together with the pages. | C/D | Needs the owner's redirect decision |
| P-5 | Add a QA step that fails if Service `description` matches the outsourcing term list used in `qa-business-i18n`. | scripts/ci | Low |

Decision needed from the owner: P-1 versus P-2, and the C/D timing for finding 1.
