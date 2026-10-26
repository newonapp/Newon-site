# NEWON contact unification: survey of the inquiry pages (spec 2 §1)

Branch `ct-unified`, surveyed 2026-10-26 against the built HTML at base `ef7b2ce79`, before any change.
Every form described here sends through **FormSubmit AJAX** (`https://formsubmit.co/ajax/newon@newon.app`), which
delivers the submission as an e-mail to newon@newon.app. None of them uses a server, database, receipt number, status
tracking or auto-reply.

## 1. Inquiry pages and forms

| URL (all 9 locales unless noted) | Renderer | Form / JS | Fields (required in **bold**) | Validation, consent, spam defence | Languages |
|---|---|---|---|---|---|
| `/{lang}/contact/` (unified page) | `render-company.mjs` + `contact-page-body.mjs` / `contact-page-copy.mjs` | `#ct-form` + `/contact/contact-page.js` | persona (personal/organization radio, default personal), **inquiry_type** (6 categories), organization, business_purpose, website (only for organizations), **name**, **email**, phone, platform (8), **subject**, **message** (10–3000 characters), reference_url, **privacy_consent** | per-field errors with aria-describedby, error summary, email/URL/phone format checks, success only after `success:true`, 15 s timeout, mailto fallback, honeypot `_honey`, 3 s minimum fill time, consent notice (purpose, items, FormSubmit 30-day retention, refusal right) | ko + en written; the other 7 use English copy marked `lang="en"` |
| `/{lang}/business/contact/` (B&P 05 Contact) | `render-bizpart.mjs` | `#bz-inquiry-form` + `/business/inquiry.js` | **name**, company, **email**, **platform** (6 + multiple + general), **type** (10 codes: general, participation, commerce, saas, institution, brand, technology, public, global, other), **message** (≤4000), **consent**, hidden `category`, `source` from the URL | inquiry.js: required checks, honeypot, redirect to `/business/inquiry/success/`, mailto fallback; consent is a one-line checkbox only | ko + en, others English |
| `/{lang}/studio/contact/` (Studio 05 Contact) | `render-studio-site.mjs` | `#bz-inquiry-form` + `/business/inquiry.js` | **name**, company, **email**, **area** (Studio in general, Digital Store, 6 platform products, business products), **type** (product, purchase, usage, business, license, support), **message**, **consent** | same as above | ko + en, others English |
| `/{lang}/business/inquiry/` (+ `/success/`) | `render-business-hub.mjs` + `templates/business-inquiry.html` | `#bz-inquiry-form` + `/business/inquiry.js` | company, platform, name, email, phone, website, type, message, consent and store-specific product/price fields | noindex; an inline script already forwarded every visit to `/business/contact/` (or `/studio/contact/` for `category=Studio`), **except the store purchase inflow `?category=Store`**, which still uses this form and the success page | 9 |
| `/{lang}/company/contact/` | `render-company.mjs` (`COMPANY_HUB_REDIRECTS`) | none | none | meta refresh to `/{lang}/contact/`, query string dropped | 9 |
| `/{lang}/petlog/contact/` | PETLOG renderer (agent P) | `#bz-inquiry-form` + `/business/inquiry.js` | name, company, email, type, participant, interest, message, consent | as above | outside this scope (agent P) |
| `/ir/` (unlisted, `Disallow` in robots.txt, not linked) | static `ir/index.html` | `#ir-form` + `ir/ir-cinema.js` (FormSubmit) | name, organization, inquiry_type (investment / partnership / materials / meeting), interested businesses, … privacy | own checks + honeypot | ko/en toggle |
| `/{lang}/ideas/` | `render-company.mjs` | idea submission form (`ideas.js`), not an inquiry | — | — | 9 |
| `/{lang}/partnerships/…` | — | none (redirect stubs to `/{lang}/business/partnerships/`, since 2026-10-19) | — | — | 9 |

How it works on mobile: every form is a single column below 640 px. The unified page's form card is a white card on the
dark band. The Business and Studio forms use the shared `bz-form` styles.

## 2. Entry points (before the change)

| Where | Target |
|---|---|
| Header black "문의하기" CTA, mobile drawer CTA, Company mega menu "문의" | `/{lang}/contact/` (already correct) |
| Header mega menu: Business & Partnerships "Contact", Studio "Contact" | `business/contact/`, `studio/contact/` |
| B&P sub-menu bar "05 Contact" | `/{lang}/business/contact/` |
| B&P screens' buttons (Overview / Platforms / Models / Partnerships closing and per-type buttons) | `/{lang}/business/contact/?type=…#bpt-form` |
| Studio screens' buttons (Store, Platforms, platform product pages, Business Products) | `/{lang}/studio/contact/?type=…&area=…#sts-form` |
| Home "04 / PARTNERSHIPS & CONTACT": 파트너십 문의하기 / 문의하기 / 사업 문의 | `business/collaboration/partnership/` (a stub), `contact/`, `business/inquiry/` |
| About "협력 문의하기" | `../business/contact/` |
| Footer | no contact-page link (only the mailto address) |
| Investment / IR buttons | none on public pages (the contact page's own "투자 문의" card only); `/ir/` is private |
| Older pages (AI hub, Insights, portfolio, retired service pages) | `business/inquiry/?category=…` (forwarded) |
| Six platform pages | their own `/{lang}/{biz}/contact/` pages (agent P's scope) |

## 3. Gaps found when the Business and Studio forms are compared with the unified form

- **Company name**: the unified form already has it (`organization`), but only for "organization" persona. It is kept and becomes required for companies, institutions and press.
- **Platform**: present in both. Business "multiple" / "general" map to `newon` (NEWON 전체).
- **Business type codes** (10) and **Studio type codes** (6) / **area**: there were no matching values in the unified form, so they are now mapped into the new three-level taxonomy (`LEGACY_BUSINESS_TYPES`, `LEGACY_STUDIO_TYPES`, NEWON topics `newon-business`, `newon-saas`, `newon-global`, `newon-studio*`). The Studio product area goes into `source`. Unmapped values go into `legacy`.
- **`source`**: the Business and Studio forms passed `?source=` into the e-mail. The unified form did not, and now does.
- **Phone, website, reference URL**: already in the unified form (optional).
- **Store purchase flow** (`?category=Store&product=…&price=…`): this is a purchase request, not a general inquiry. It is **kept on `/business/inquiry/`** with its success page, so the purchase flow does not break.
- The unified consent notice is fuller than the one-line consent on the Business and Studio forms. It is kept and extended with the new fields.
