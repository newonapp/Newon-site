# PHASE 03 P5 — C/D page analysis (analysis only, nothing deleted or redirected)

## 1. Inventory

33 pages are classed C (15) or D (18) in `scripts/business-model-pages.mjs`.

- 15 of the D pages are already meta-refresh stubs: `business/automation/{data-reporting,internal-tools}`, `business/build/{app,landing,mvp,website}`, `business/{development,partnership,promotion,service}`, `studio/ip` and `studio/ip/{character-lab,digital-stickers,experimental-ip,newon-character}`.
- 18 are real pages (C 15 + D 3): C = `app, booking, custom-product, improvement, internal-system, landing, maintenance, mvp, post-launch, product-launch, web, website-renewal`, `studio/care`, `studio/care/design-improvement`, `studio/care/monthly-design`; D = `creative, design, research`. Separately, the two hubs `business/build` and `business/solutions` are reworded in P5 and not redirected.
- `business/creative` is **not in `sitemap.xml`**; the other business C/D pages are (checked: `business/app/` appears 9 times, `business/creative` 0).

## 2. Evidence

| Evidence | Result |
|---|---|
| Inbound internal links | Each business C page is linked from about 24–29 pages (menus). `studio/care*` from 2–5. `business/research` from 9. Counts from the P5 census (relative links resolved), ko tree. |
| Chain risk | `business/build/mvp` redirects to `/ko/business/mvp/`, itself a C page. Redirecting the C pages later would create redirect chains. |
| Duplicate content | Sentence-level overlap with the likely redirect-target hubs is about 0 (Jaccard 0–0.06). The C pages are **unique**, not duplicates; redirecting would discard that text. |
| Search inflow | **NOT VERIFIED.** No Search Console or analytics access from here. |
| Redirect mechanism | The site is served by GitHub Pages: only a meta-refresh soft redirect, no HTTP 301/308. SEO equity transfer is weaker than a 301. |

All 18 real pages (ko) carry the capability notice (checked); price/timeline rows were removed from them in P5.

## 3. Options

| Option | Effect | Cost / risk |
|---|---|---|
| Keep as is (with notice) | No link or traffic loss | Pages still describe offer-like capability; B-type wording remains in 7 languages |
| Keep, `noindex`, remove from menus and sitemap | Stops promoting them, keeps URLs alive | Needs nav changes in every page (24–29 inbound each); traffic loss to be measured |
| Meta-refresh redirect to a hub | One destination | Soft redirect only; chains with the D stubs; loses unique content; needs owner mapping |
| Delete | Cleanest | Breaks 24–29 inbound links per page and any external links; irreversible in practice. **Not recommended.** |

## 4. Recommendation (decision is the owner's)

Staged: (1) keep everything now; (2) get 90 days of Search Console data per URL; (3) pages with no search inflow: `noindex` + menu/sitemap removal; (4) redirect only after the owner maps each page to a destination and the stub chains are collapsed; (5) no deletion.
