# PHASE 03 P6 — English text left on non-English pages (9-language census)

Source: `node scripts/qa-lang-mix.mjs --json …` on the P6 tree (666 classified Business/Studio pages). A "line" is a body text line of ≥25 characters that reads as English on a page whose language is not English. Lines in blocks marked `lang="en"` are intended fallbacks and are counted separately. Page class: A = confirmed public pages (11), B = confirmed pages reframed to the partnership model (30), C/D = held pages (33; keep, no change until the owner decides, see the C/D census).

| Language | English lines (A+B) | Class A | Class B | Class C/D (held) | Pages with English lines | `lang="en"`-marked lines |
|---|---|---|---|---|---|---|
| ja | 770 | 92 | 678 | 307 | 54 of 74 | 18 |
| hi | 770 | 92 | 678 | 307 | 54 of 74 | 18 |
| pt-br | 600 | 67 | 533 | 249 | 55 of 74 | 18 |
| es | 558 | 65 | 493 | 230 | 55 of 74 | 18 |
| de | 523 | 66 | 457 | 211 | 48 of 74 | 18 |
| fr | 520 | 64 | 456 | 208 | 46 of 74 | 18 |
| id | 520 | 64 | 456 | 209 | 47 of 74 | 18 |

ko: 2 lines on 2 pages; en is the source.

## Review priority for the 7 languages

The ranking is by volume on confirmed pages (A+B) only. **No traffic or search data exists here (NOT VERIFIED), so no ranking by audience is claimed.**

1. **Class A pages first**, in every language: they are the public entry points (Business hub, Partners, Seller Center, Inquiry). Translate these before anything else.
2. **Class B pages second**, starting with the languages that have the most A+B lines (table order).
3. **Class C/D pages last and only after the owner's disposition**: translating pages that may be redirected or `noindex`-ed would be wasted.
4. Native review applies to everything already written by a person or machine: the 7-language notices (`data-bm-l10n="draft"`) and the hub CTA labels. Machine output must not be accepted as canonical without a reviewer.

## Largest pages per language (class in brackets)

- **ja**: `studio/digital/app-ui-ux` [B] 71, `studio/content/visual` [B] 71, `studio/digital/product-design` [B] 70, `business/landing` [C] 69, `studio/content/campaign` [B] 69, `studio/digital/landing` [B] 67, `studio/brand/logo` [B] 64, `studio/digital/web-design` [B] 62
- **hi**: `studio/digital/app-ui-ux` [B] 71, `studio/content/visual` [B] 71, `studio/digital/product-design` [B] 70, `business/landing` [C] 69, `studio/content/campaign` [B] 69, `studio/digital/landing` [B] 67, `studio/brand/logo` [B] 64, `studio/digital/web-design` [B] 62
- **pt-br**: `studio/digital/landing` [B] 58, `studio/digital/product-design` [B] 52, `studio/content/campaign` [B] 52, `studio/digital/app-ui-ux` [B] 50, `studio/brand/logo` [B] 49, `studio/digital/web-design` [B] 48, `studio/content/visual` [B] 46, `business/landing` [C] 45
- **es**: `studio/digital/landing` [B] 53, `studio/digital/product-design` [B] 49, `studio/brand/logo` [B] 47, `studio/digital/app-ui-ux` [B] 46, `studio/content/campaign` [B] 46, `business/landing` [C] 45, `studio/digital/web-design` [B] 45, `studio/content/visual` [B] 44
- **de**: `studio/digital/landing` [B] 52, `studio/digital/product-design` [B] 48, `studio/brand/logo` [B] 46, `studio/digital/app-ui-ux` [B] 45, `business/landing` [C] 44, `studio/digital/web-design` [B] 43, `studio/content/campaign` [B] 43, `studio/content/visual` [B] 43
- **fr**: `studio/digital/landing` [B] 52, `studio/digital/product-design` [B] 48, `studio/brand/logo` [B] 46, `studio/digital/app-ui-ux` [B] 45, `business/landing` [C] 44, `studio/digital/web-design` [B] 43, `studio/content/campaign` [B] 43, `studio/content/visual` [B] 43
- **id**: `studio/digital/landing` [B] 52, `studio/digital/product-design` [B] 48, `studio/brand/logo` [B] 46, `studio/digital/app-ui-ux` [B] 45, `business/landing` [C] 44, `studio/digital/web-design` [B] 43, `studio/content/campaign` [B] 43, `studio/content/visual` [B] 43
