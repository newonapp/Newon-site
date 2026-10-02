# ONGIL PHASE 7 — STORE + PRODUCTS V1

Branch `ongil-foundation-v1` · base `6ca23e31e` (ONGIL Community and Groups V1) · not committed (git add / commit / push not run).

## 1. OBJECTIVE

Turn `#store` from a "준비 중" placeholder into a real **product discovery** screen: find everyday things, understand
them, save them, prepare to show them to family, and — when a seller exists — check them on the seller's own page.

ONGIL does not sell in V1. There is no cart, checkout, payment, order, shipping, inventory, return or review system,
and there is no product source connected in this repository, so production honestly shows
"아직 연결된 상품이 없어요." Nothing is invented: no catalog, price, rating, stock or discount.

## 2. AUDIT (before Phase 7)

| Item | State | Note |
|---|---|---|
| `#store` screen | PARTIAL | film hero + ten "준비 중" slots from `areas.js`; no view of its own |
| Product model / source / normalisation | MISSING | — |
| Saved `PRODUCT` type | EXISTS | in `SAVED_TYPES` since Phase 1, unused → reused |
| Saved collection sync policy | PARTIAL | whole `saved` collection was syncable although it can hold private `POST` items (Phase 6 known limitation) |
| Family preview pattern | EXISTS | Phase 4 (care) / Phase 5 (enjoy) "preview only, nothing sent" → reused |
| Detail `<dialog>` pattern | EXISTS | care / enjoy / community dialogs → same structure and CSS classes |
| URL validation | EXISTS | `contracts.js safeHref` → reused; Store adds https-only on top |
| Global Search | EXISTS | 4 providers (areas, saved, care, enjoy) → a 5th for loaded public products |
| Unconnected source object | EXISTS | `data-source.js createUnconnectedSource` → reused |
| Notifications | EXISTS (shape only) | nothing produces one; Store adds none |
| Account erase | EXISTS | Store adds no collection, so the existing erase already covers it |
| DUPLICATE | none | no second saved store, date utility, dialog system or URL validator was created |

## 3. STORE POSITIONING

Hero: "일상에 필요한 물건을 한곳에서 만나보세요." Lead: what it is, what it is for, who sells it; "ONGIL은 직접 팔지 않고,
결제와 주문 기능은 없습니다."

V1 does: DISCOVER · SEARCH · FILTER · COMPARE INFORMATION · SAVE · FAMILY PREVIEW · EXTERNAL SELLER LINK.
V1 does not: CART · CHECKOUT · PAYMENT · ORDER · SHIPPING · INVENTORY · RETURN · REVIEW.
`STORE_COMMERCE = { mode: 'EXTERNAL_LINK', cart: false, checkout: false, payment: false, order: false, shipping: false, inventory: false, reviews: false, alerts: false }` (frozen).

## 4. CATEGORY TAXONOMY

| id | label | route |
|---|---|---|
| SAFETY_LIVING | 생활·안전 | `#store/safety` |
| HEALTH_LIVING | 건강 생활 | `#store/health-living` |
| MEAL_KITCHEN | 식사·주방 | `#store/kitchen` |
| BATH_HOME | 욕실·주거 | `#store/bath-home` |
| MOBILITY | 이동 | `#store/mobility` |
| EXERCISE | 운동 | `#store/exercise` |
| HOBBY | 취미 | `#store/hobby` |
| DIGITAL | 디지털 | `#store/digital` |
| SMART_DEVICE | 스마트기기 | `#store/smart-device` |
| GIFT | 선물 | `#store/gift` |

HEALTH_LIVING is everyday living goods; its description says "의약품이나 치료 제품은 다루지 않아요". Each category has a
description and example *kinds* of things (search words), never products. The menu entries in `areas.js` use the same
slugs and labels (test OG-STO-57) and still say 준비 중 because no category has products yet. An unknown
`#store/<x>` falls back to `#store`.

## 5. PRODUCT MODEL

Required: `id`, `name`, `category`, `summary`. Optional (absent when the source did not give them):
`brand`, `priceText`, `imageUrl`, `sellerName`, `sellerUrl`, `sourceName`, `sourceUrl`, `features[]` (≤ 8), `updatedAt` (YYYY-MM-DD).

Everything else in a source answer is dropped — rating, review count, stock, sales count, discount, list price,
delivery date never reach the view. Reserved names only (never filled in V1): `partnerId`, `commerceMode`,
`certification`, `deviceType`, `compatibility`.

## 6. SOURCE STRATEGY

`store-source.js createProductSource()` returns the shared unconnected source: `load()` answers
`{ state: 'unavailable', reason: 'NOT_CONNECTED' }`. There is no commerce API, affiliate API or catalog in the
repository. Fixtures exist only in `tests/ongil/store-data.test.mjs` and in the browser QA harness (outside the
repository), both labelled as test fixtures.

A future source keeps the shape `{ id, label, connected, load() → { state: 'ready' | 'empty' | 'unavailable', reason?, items } }`.

## 7. NORMALIZATION

`Source → normalizeProduct → Product → filter / search / sort → view`. The view never reads a raw payload.
`sanitizeProducts` skips damaged, unsafe-id, unknown-category and duplicate entries (never fatal), bounds every text
(name 120, summary 300, brand 60, price text 40, seller 60, feature 80), removes control characters and caps the list at 1,000.

## 8. SEARCH

Loaded products only. Fields: name, summary, brand, category label, features. Typing updates the list and the live
count in place and keeps focus in the field. No result → "조건에 맞는 상품이 없어요."

## 9. FILTER

CATEGORY always. BRAND and SELLER appear only when the loaded data has more than one of them. There is no price
filter: `priceText` is text from the source and is never parsed into a number.

## 10. SORT

가나다순 only (`PRODUCT_SORTS`). No 인기 / 추천 / 판매 / 베스트 order exists; no price order (no structured numeric price).

## 11. DETAIL

One `<dialog>`: category, name, a real image if the source gave one, rows for 분류 · 브랜드 · 자료에 적힌 소개 ·
판매처가 알린 가격 · 판매처 · 자료 출처 · 정보 갱신일 (missing rows are hidden), 자료에 적힌 특징, then 저장 · 비교에 담기 ·
가족에게 보여주기 · 닫기. The source's wording is labelled as the source's:
"소개와 특징은 판매처나 자료 출처가 적은 내용이에요. ONGIL이 평가하거나 보증하지 않아요."

Image: https only, no SVG, `alt="<name> 상품 사진"`, `referrerpolicy="no-referrer"`; if it fails to load it is removed
and the text card stays. There is no stock or placeholder image.

## 12. PRICE

Shown only when the source gave `priceText`, always as "판매처가 알린 가격", with
"판매처가 알려 준 가격이에요. 최신 가격은 판매처에서 확인하세요." No discount, list price or "최저가".

## 13. EXTERNAL SELLER

"판매처에서 보기 (새 창)" only when `sellerUrl` is a safe https URL: `target="_blank"`, `rel="noopener noreferrer"`,
an accessible name that says a new window opens, and the note
"ONGIL에서 사거나 결제하는 것이 아니에요. 판매처 페이지로 이동해 직접 확인하세요." Seller URL and source URL are separate
fields and separate buttons ("자료 출처 보기"). Without a URL the button does not exist.

## 14. SAVED

Existing Saved `PRODUCT` type, existing `saved` collection (no new collection). Snapshot = the SavedItem fields only:
type, id, title (name), description (category · brand · seller), href (seller URL → source URL → `#store/<slug>`),
source. Never the raw payload. Save / unsave from the detail; the list row says 저장함; the 저장한 상품 card counts them.
On the Saved screen an https link now opens in a new window with `noopener noreferrer` and is a 44px target.

## 15. SAVED SYNC POLICY

Closes the Phase 6 known limitation at contract level (nothing syncs in Phase 7).

- `SAVED_SYNC_POLICY` (machine readable, by type): SERVICE, BENEFIT, FACILITY, PROGRAM, PLACE, PRODUCT = `SYNCABLE`; **POST = `LOCAL_ONLY`**.
- Unknown types are `LOCAL_ONLY` (fail closed).
- `account.js syncChange(change)` filters a `saved` change item by item before any adapter receives it, so a private
  community post can never leave the device with the collection.
- Stored items are unchanged — the policy is derived from the type, never written — so saved data from earlier phases reads as before.

## 16. FAMILY

"가족에게 보여주기" opens a preview inside the same dialog: 가족 연결이 필요해요 / "아직 연결된 가족이 없어서 보내지 않았어요",
then exactly what could be shown — 상품 이름, 분류, 브랜드, 판매처, 판매처 주소, 자료 출처 (only those that exist).
`productFamilyPreview` → `{ sendable: false, reason: 'NO_FAMILY_CONNECTION', personalDataIncluded: false, addressIncluded: false, billingIncluded: false }`.
There is no send button and no success message. Gift order, address sharing and payment do not exist.

## 17. CARE BOUNDARY

Care = services, benefits, facilities. Store = physical products. Care code references no product and shows no
product advertisement; Store reads no care data. Linking "related products" from a care item is a future decision
that needs its own consent and labelling — nothing is wired.

## 18. HEALTH BOUNDARY

HEALTH-BASED PRODUCT RECOMMENDATION = NONE. Store code imports no health, medication, symptom, check-in or note
store; the view receives only `saved` and the product source. The screen says "내 건강 기록을 보고 상품을 고르지 않아요."
There is no recommendation of any kind.

## 19. SMART DEVICE FUTURE

SMART_DEVICE is a category only. `FUTURE_DEVICE_TYPES` (SENSOR, SOS_DEVICE, WATCH, SMART_LIGHT, SMART_PLUG, CAMERA,
MEDICATION_DEVICE) is a name list for a later ONGIL Home / IoT phase; CAMERA stays optional. No Device or
DeviceConnection storage, no pairing, nothing rendered as a product.

## 20. GLOBAL SEARCH

Fifth provider `store` (label 상품): public products actually loaded on the Store screen during this visit. A result
opens the Store at the product's category (`#store/<slug>`). With no product connected it returns nothing.
Community posts and personal records still have no provider.

## 21. COMPARISON

"비교에 담기" on rows and in the detail (`aria-pressed`, ✓ in the text). Two or three products side by side:
브랜드 · 분류 · 판매처가 알린 가격 · 특징 · 판매처, each value headed by the product name. Missing values say "정보 없음"
(italic + the words, never a fake "-"). A fourth is refused with "비교는 3개까지 할 수 있어요…". Selection is screen
state only: nothing is written to localStorage or sessionStorage and it is gone after a reload.

## 22. PRIVACY

No new collection (still 23). No browsing, search or click history; no behavioural profile; nothing sent anywhere.
Saved products are the only thing Store stores, in the existing `saved` collection. Family sharing is never automatic.

## 23. SECURITY

- DOM built with `el()` / textContent only; `innerHTML`-family = 0 in the whole app. Markup inside a product name,
  summary or feature is shown as text (browser check: 0 injected `<b>`, `<script>`, `<img>`).
- External links: `safeHref` + https only. `javascript:`, `data:`, `http:`, credentials and in-app paths are dropped;
  an unsafe seller URL never becomes a link or a saved href.
- Images: https only, SVG refused, removed on error.
- Ids must match `^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$`; unknown fields are not carried along.

## 24. ACCESSIBILITY

- Body text ≥ 16px and controls ≥ 44px at 390 / 820 / 1440 (measured; 0 below).
- Categories: `aria-pressed` + ✓, group named 상품 분류. Results: named region, `aria-busy` while loading, live count.
- Dialog: named by its title, focus goes to the title, Tab and Shift+Tab stay inside (checked with 30 Tab presses),
  Escape closes, focus returns to the row that opened it.
- Keyboard: Enter opens a detail, Space toggles comparison, 더 보기 moves focus to the first new row.
- Image alt text; notes use `role="note"`; state is never colour alone.
- Static screen-reader review only. **Actual screen reader (VoiceOver / TalkBack): NOT VERIFIED.**

## 25. RESPONSIVE

Headless Chromium at 390 / 820 / 1440, 15 states each: production empty, loading, unavailable (+ retry), empty,
results, category, search with no match, long row, detail (long), detail (minimal), family preview, detail,
compare, global search, saved. Horizontal overflow 0, controls under 44px 0, text under 16px 0, console errors 0,
page errors 0. Long unbroken product name, brand, seller, feature and a very long seller URL all wrap at 390.
Comparison is columns on wide screens and stacked on phones.
External images are blocked in the QA environment, so the image path was verified as "fails → removed, text card
stays"; an image that loads was not seen.

## 26. PERFORMANCE

QA fixture: 500 valid products + 8 damaged entries (skipped). 24 rows in the DOM at a time (+24 per 더 보기);
Store subtree 288 nodes with 500 products loaded; one detail in the DOM only while open (0 nodes after closing).
Full re-render 2–3 ms; no long task (> 50 ms) recorded during search, filter, sort, compare or render.

## 27. TESTS

`node --test tests/ongil/*.test.mjs` → **390 / 390 pass, 0 skip.** Old 332 kept; new 58 in `store-data.test.mjs`
(OG-STO-1 … 56 as specified, plus OG-STO-57 menu/hero/taxonomy agreement and OG-STO-58 saved link safety).

Existing assertions changed (intended behaviour only; each has a comment in the test):

| Test file | BEFORE | AFTER | WHY |
|---|---|---|---|
| health-view, home-view, integration-view, life-privacy, community-data | 4 `search.registerProvider(` calls | 5 | public product provider added; still none for personal data |
| care-data, enjoy-data, life-view | shell loop skips home…community | also skips `store` | Store has its own view |
| community-data OG-CG-16 | version `community-v1`, `?v=20261003c6` | `store-v1`, `?v=20261003s7` | version moved on |
| shell (commerce words) | no file may contain checkout / cart / payment / price / stock / orderId / shipping | same rule, except the `STORE_COMMERCE` declaration (all false) and the tokens `priceText` / `PRICE_NOTE` in the two store files | the Product contract carries the source's price text |

## 28. REGRESSION

Browser sweep at all three widths: Home (10 cards, 6 quick actions, check-in works), My Life (calendar, daily,
check-in, journal), Health, Family, Care, Enjoy, Community, Saved, Account, Search, Notification panel, Onboarding
dialog — no error, no overflow. Erase removes every `ongil.*` key and keeps other keys.

## 29. KNOWN LIMITATIONS

- PRODUCT DATA: none connected. Production shows the honest empty state only.
- AFFILIATE / CART / CHECKOUT / PAYMENT / ORDER / SHIPPING / INVENTORY: not built.
- FAMILY SEND: preview only (no family backend).
- IOT: taxonomy names only.
- A loaded product image, a real seller page and a real screen reader were not verified.
- Search results link to the product's category, not straight to its detail.
- Saved products keep a snapshot; if a source later changes or removes the product the saved entry is not updated.
- Opening and closing the detail returns focus on the dialog's `close` event; typing in the same instant is a
  harness-only race (seen once in automation, not reproducible by hand).
- The work in this phase was started in another session and finished here; the whole diff was reviewed and re-verified in this one.

## 30. COMMERCE ROADMAP

`commerceMode` (reserved): EXTERNAL_LINK (now) → AFFILIATE → MARKETPLACE → ONGIL_CHECKOUT. Each step needs, in order:
a real source behind `createProductSource`, disclosure copy for paid links, a structured numeric price (only then a
price filter / sort), seller and partner identity (`partnerId`), `certification`, and for devices `deviceType` /
`compatibility`. Reviews, alerts, cart and orders each need a backend and their own privacy classification first.

## 31. PHASE 8 HANDOFF

Phase 8 = SEARCH + SAVED + NOTIFICATIONS INTEGRATION V1.

- Search: five providers (areas, saved, care, enjoy, store); care / enjoy / store are "loaded this visit" only.
- Saved: seven types, one collection, item-level sync policy in `contracts.js`; `POST` is LOCAL_ONLY.
- Notifications: shape only, nothing produces one; any new producer must stay local and must not use private records.
- Keep: no new collection without `storage.js` + `privacy.js` registration; no personal record in global search.
