# Newon Growth Metrics — Data Contract

Internal contract for public-site analytics. Events are emitted by `/analytics.js` into `window.dataLayer` (GTM/GA4-ready). No PII.

## Source of Truth

- Implementation: `analytics.js` (`window.newonTrack`, `window.newonAnalyticsEvents`)
- Form success path: `business/inquiry.js` (success only after FormSubmit OK / local preview ok)
- Store package → product map: Play package IDs inside `analytics.js`

There is **no GA4 measurement ID / GTM container in the repo today**. Events land in `dataLayer`. When a GA/GTM ID is added later, reuse this taxonomy — do not invent parallel event names.

## Environments

| Host | `environment` param | Remote `gtag` |
|------|---------------------|---------------|
| `localhost` / `127.0.0.1` | `development` | skipped (unless `?debug_analytics=1`) |
| `www.newon.app` / `newon.app` | `production` | forwarded if `gtag` exists |

## Canonical events

| Event | When |
|-------|------|
| `page_view` | Once per page load |
| `product_view` | Product detail (`/{lang}/{product-slug}/`) |
| `portfolio_view` | Portfolio hub or case detail |
| `business_service_view` | Business service detail (`business-service.js`) |
| `pricing_view` | Pricing / product-matrix section enters viewport (once) |
| `cta_click` | Named CTA / inquiry CTA |
| `business_to_inquiry` | Business/Studio → inquiry |
| `portfolio_to_inquiry` | Portfolio → inquiry |
| `inquiry_start` | First focus inside inquiry form |
| `inquiry_submit` | Valid submit attempt (not success) |
| `inquiry_success` | FormSubmit (or local preview) succeeded |
| `inquiry_error` | Submit failed |
| `app_store_click` | Click App Store URL |
| `play_store_click` | Click Google Play URL |
| `store_click` | Digital store purchase inquiry CTA |
| `service_select` | (reserved; type select can adopt later) |
| `external_link_click` | Reserved / legacy affiliate mapping |

Legacy names (`business_form_start`, `store_buy_click`, …) normalize to the canonical names above.

## Common parameters (safe)

- `page_path`, `page_type`, `locale`, `environment`
- `product_id`, `service_id`
- `cta_id`, `cta_location`, `destination`, `platform`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` (from URL or session capture)

## Never send

Name, email, phone, message, company contact fields, Firebase UID, HQ/contract data, form body.

## Product IDs (11 apps)

Use existing route slugs:

`ox-month`, `subping`, `savy`, `pillmate`, `babylog`, `petlog`, `piggyup`, `goalup`, `countup`, `newon-plus`, `myworld`

(`my-world` aliases to `myworld` when seen.)

## Funnel definitions (for future HQ / BI)

### Acquisition

- Sessions ≈ unique `page_view` sessions (GA)
- `product_view` count
- `app_store_click` + `play_store_click` count

### Business

- `business_service_view` by `service_id`
- `pricing_view` by `service_id`
- `inquiry_start` / `inquiry_submit` / `inquiry_success` by `service_id`

### Conversion rates

- Product → store CTR = store clicks / `product_view`
- Business → inquiry = (`business_to_inquiry` + inquiry CTAs) / `business_service_view`
- Inquiry completion = `inquiry_success` / `inquiry_submit`

### Content attribution

Group by `utm_source` / `utm_campaign` (session-preserved from first landing).

## Debug

Append `?debug_analytics=1` — events log to the console and localhost still records them.

## Privacy note

Site analytics are aggregate interaction events only. Align any future GA/cookie banner with `privacy` pages before enabling a third-party tag ID in production.
