# Newon Growth Metrics — Data Contract

Internal contract for public-site conversion measurement. Events are emitted by `/analytics.js` into `window.dataLayer` (GTM/GA4-ready). **No PII.**

## Source of Truth

| Layer | Location |
|-------|----------|
| Helper | `analytics.js` → `window.newonTrack`, `window.newonAnalyticsEvents` |
| Inquiry success | `business/inquiry.js` — success **only** after FormSubmit OK / local preview OK |
| Creative inquiry | `business-creative.js` — same taxonomy; no field values |
| Business service view | `business-service.js` |
| Store package map | Play package IDs inside `analytics.js` |

**Do not** call `gtag` directly from page scripts when `newonTrack` exists.

There is **no public GA4 measurement ID / GTM container in the website repo**. Events land in `dataLayer`. Provider connection = **MANUAL / UNKNOWN** until an ID is added deliberately. Do not invent a fake measurement ID.

(HQ `firebase-config.js` may contain a Firebase Analytics ID; that is **not** the public-site tag.)

## Environments

| Host | `environment` | Remote `gtag` |
|------|---------------|---------------|
| `localhost` / `127.0.0.1` | `development` | skipped (unless `?debug_analytics=1`) |
| `www.newon.app` / `newon.app` | `production` | forwarded **if** `gtag` already exists on the page |

## Canonical events

| Event | When |
|-------|------|
| `page_view` | Once per page load |
| `product_view` | Product section (home hash / visible shell) or portfolio case detail — **once per product_id per load** |
| `portfolio_view` | Portfolio hub or case detail |
| `business_service_view` | Business service detail |
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
| `external_link_click` | Reserved / legacy affiliate mapping |

Legacy names (`business_form_start`, `store_buy_click`, …) normalize to the canonical names above.

## Parameters (send only what is needed)

- `page_path`, `page_type`, `locale`, `environment`
- `product_id`, `service_id`
- `cta_id`, `cta_location`, `destination`, `platform`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` (URL or session-captured)
- `channel` — derived from `utm_source`: `threads` \| `instagram` \| `youtube` \| `tiktok` \| `naver` \| `google` \| `other` \| `direct_or_unknown`
- `from_page_type`, `from_path` — prior in-session page (internal attribution; sessionStorage only; no fingerprinting)

### Recommended `cta_location` values

`header` · `footer` · `home` · `home_hash` · `product` · `business` · `service` · `portfolio` · `pricing` · `inquiry_form` · `creative_form` · `hero`

### Recommended UTM (campaign links)

| Channel | Example |
|---------|---------|
| Threads | `utm_source=threads&utm_medium=social&utm_campaign=…` |
| Instagram | `utm_source=instagram&utm_medium=social&utm_campaign=…` |
| YouTube | `utm_source=youtube&utm_medium=social&utm_campaign=…` |
| TikTok | `utm_source=tiktok&utm_medium=social&utm_campaign=…` |
| Naver | `utm_source=naver&utm_medium=cpc\|social&utm_campaign=…` |
| Google | `utm_source=google&utm_medium=cpc\|organic&utm_campaign=…` |

## Never send

Name, email, phone, message, company contact fields, Firebase UID, HQ/contract/invoice data, form body, secrets.

## Product IDs (11 apps)

`ox-month`, `subping`, `savy`, `pillmate`, `babylog`, `petlog`, `piggyup`, `goalup`, `countup`, `newon-plus`, `myworld`

(`my-world` aliases to `myworld`.)

Home shells use hash ids (`#ox-month`, `#savy-app`, …) mapped to these product IDs in `analytics.js`.

## Funnel definitions

### Acquisition

- Sessions ≈ unique session `page_view` (GA, when connected)
- Split by `channel` / `utm_source` / `utm_campaign`

### Product

- `product_views` = `product_view`
- `store_clicks` = `app_store_click` + `play_store_click`
- `product_to_store_ctr` = store_clicks / product_views (by `product_id`)

### Business

- `business_views` ≈ `page_view` where `page_type=business`
- `service_views` = `business_service_view` by `service_id` (`web`, `app`, `mvp`, `internal-tools`, `ai-automation`, `design`, … — use live slugs)
- `inquiry_starts` / `inquiry_submits` / `inquiry_success`
- `business_to_inquiry_rate` ≈ (`business_to_inquiry` + inquiry CTAs) / service_views
- `inquiry_completion_rate` = `inquiry_success` / `inquiry_submit`

### Portfolio

- `portfolio_views` = `portfolio_view`
- `portfolio_to_inquiry` event (or inquiry with `from_page_type=portfolio*`)
- `portfolio_to_product` / store = portfolio `product_view` + store clicks with `cta_location=portfolio`

### Content

- Group conversions by `utm_source`, `utm_campaign`, `channel`
- Internal path: `from_page_type` / `from_path`

## Duplicate protection

- 600ms debounce key: event + destination + cta_id + product_id + service_id
- `product_view` once per `product_id` per page load
- `pricing_view` once per page (IntersectionObserver)
- Business CTA: `data-analytics` handled only by `analytics.js` (service script skips)

## Debug

`?debug_analytics=1` — console `[newonTrack]` logs; localhost still records to dataLayer.

## Privacy gap (site policy)

App-centric privacy pages do **not** yet fully describe public-website aggregate analytics / future GA cookies. Before enabling a third-party tag ID in production, align privacy copy (and consider CMP only if legally required). No cookie banner added in this phase.

## HQ compatibility

Stable event + parameter names are designed for a future **HQ Growth** dashboard. Do **not** replicate raw events into Firestore from the public site.
