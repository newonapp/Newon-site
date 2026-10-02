# LIVON SEO Expansion V1 — Discoverability, Static Pages, Structured Metadata

Status: local prototype on branch `livon-seo-expansion-v1`, built on `8802d6a21` (Help & FAQ V1, which contains
Community + Onboarding, Admin Local and Data Manager). Not deployed. Nothing was submitted to any search engine.

LIVON is a single-page app: almost everything is a `#hash` route, which a search engine does not treat as a page. This
phase adds real, static, crawlable pages for the public content that has search value, generated at build time from the
app's own data, and leaves the application UX as it is.

| File | Role |
| --- | --- |
| `scripts/livon-seo-build.mjs` | **new** — generator: sources → manifest → static HTML + sitemap entries |
| `scripts/livon-seo-quality.mjs` | **new** — checks a built site against its manifest (run by the build) |
| `livon/seo.css` | **new** — stylesheet of the static pages |
| `livon/help-data.js` | `seoIndexable`: which Help articles also get a static page |
| `livon/index.html` | title, description, canonical, robots, Open Graph, social card, JSON-LD, `<noscript>` links, one line of links |
| `scripts/publish-site.mjs` | runs the generator and the quality check |
| `tests/livon/seo.test.mjs` | SEO-1 … SEO-58, intent QA |

## Audit

State at `8802d6a21`, before this work.

| Item | State | Finding |
| --- | --- | --- |
| /livon/ title | PARTIAL | `LivOn` only — does not say what the service is |
| /livon/ description | MISSING | no meta description |
| /livon/ robots | SHOULD NOT INDEX | `noindex, nofollow` (pre-launch setting) — the whole app was closed to search |
| /livon/ canonical | MISSING | none |
| /livon/ Open Graph | MISSING | none |
| /livon/ social card | MISSING | none |
| /livon/ JSON-LD | MISSING | none |
| /livon/ lang | GOOD | `<html lang="ko">` |
| /livon/ headings | PARTIAL | one `h1` per screen, seven screens in one document |
| /livon/ without JavaScript | PARTIAL | the home sections are in the HTML, but no route works |
| Life Stage hash routes | NOT INDEXABLE | `#life/20s/first-job` is not a URL for a search engine |
| /livon/life/… stubs | WRONG | 236 pages: unique title and canonical pointing to themselves, but `noindex` + instant redirect — a canonical on a redirecting, non-indexable page |
| Life Event routes | NOT INDEXABLE | `#life-events` only |
| Help hash routes | NOT INDEXABLE | `#help/a/{id}` — 68 articles invisible to search |
| Today hash routes | NOT INDEXABLE | `#today/{id}` |
| /livon/today/… stubs | SHOULD NOT INDEX | 35 redirect stubs, `noindex` — kept as they are |
| Explore | SHOULD NOT INDEX | records are pointers to official sites; search result states |
| Curated community content | SHOULD NOT INDEX | group and challenge names only |
| Local community posts | SHOULD NOT INDEX | exist only in the writer's browser |
| My Life | SHOULD NOT INDEX | personal data in the browser |
| Onboarding, preferences | SHOULD NOT INDEX | personal state |
| LIVON AI | SHOULD NOT INDEX | interactive tool, no public content |
| Search and filter states | SHOULD NOT INDEX | `?q=` style hash parameters |
| Admin | SHOULD NOT INDEX | local tool; removed from the build (and `noindex`, and disallowed) |
| Data Manager | SHOULD NOT INDEX | local tool; removed from the build |
| sitemap.xml | PARTIAL | 1,117 URLs, valid — none for LIVON |
| robots.txt | GOOD | sitemap declared, `/admin/` disallowed |
| Canonical domain | GOOD | `https://www.newon.app` (CNAME `www.newon.app`), https, www |
| hreflang | GOOD | used on the Newon site where translations exist; none on LIVON, which is Korean only |
| Internal links to LIVON | PARTIAL | `/ko/` links to `/livon/`; inside LIVON every link is a hash |
| 404 handling | GOOD | `404.html` at the root: GitHub Pages answers unknown URLs with a 404 status |
| Build and publish | GOOD | `publish-site.mjs` → `_publish` → `gh-pages`; verifies sitemap and robots |
| CSP | GOOD | report-only; the app's four inline scripts are pinned by hashes in `vercel.json` |

Totals: GOOD 7 · PARTIAL 5 · MISSING 5 · WRONG 1 · NOT INDEXABLE 4 · SHOULD NOT INDEX 11.

## Indexability policy

Indexed: public content with search value. Everything else stays in the app.

| Area | Pages | Decision |
| --- | --- | --- |
| LIVON main (`/livon/`) | 1 | index |
| Life Stage overview | 1 | index |
| Life Stages | 7 | index |
| Topics | 56 of 228 | index the featured topics that pass the content rule; 172 are grouped on their stage page |
| Life Event overview | 1 | index |
| Life Events | 20 of 34 | index events with ≥ 3 related topics; 10 are listed only; 4 have no guide yet and are named as such |
| Help home | 1 | index |
| Help articles | 39 of 68 | index questions people ask before or while using LIVON; 29 stay in the interactive Help |
| Today (34 items) | 0 | not indexed: places and seasonal picks with hours, prices and dates that change; existing `noindex` stubs kept |
| Explore records | 0 | not indexed: the official site is the right search result |
| Community | 0 | never: local posts are private browser data; curated groups are too thin |
| My Life, onboarding, preferences, AI, search states | 0 | never |
| Admin, Data Manager | 0 | never: not in the published site |

Indexable: **126** URLs (125 static pages + `/livon/`). Listed as excluded in the manifest: 215 items and 11 areas.

**Pre-launch switch.** `LIVON_SEO_INDEX=off node scripts/publish-site.mjs` keeps LIVON closed: every static page is
`noindex, follow`, `/livon/` is `noindex, nofollow`, and no LIVON URL is added to the sitemap. The default is ON.
Deploying this branch as it is therefore opens LIVON to search engines for the first time — that is a launch decision.

## URL architecture

```
/livon/                              the app (SPA)                          index
/livon/life/                         Life Stage overview                    index
/livon/life/{10s…70s}/               one page per age band                  index
/livon/life/{stage}/{topic}/         56 featured topics                     index
/livon/life/{stage}/{topic}/         172 other topics: existing stub        noindex, redirects into the app
/livon/life-events/                  Life Event overview                    index
/livon/life-events/{event}/          20 events                              index
/livon/help/                         Help home                              index
/livon/help/{article-id}/            39 articles                            index
/livon/today/…                       existing stubs                         noindex, redirect into the app
```

- Slugs are the stable ids already in the data (`20s` / `first-job`, Life Event ids, Help article ids): lowercase ASCII,
  never derived from a title or a position. The `/livon/life/…` paths are the ones the app already used.
- A duplicate or unsafe path stops the build. If an id ever has to change, keep the old directory as a redirect stub.
- Every page is a real directory with `index.html`; nothing depends on rewrites.

## Static generator

`node scripts/livon-seo-build.mjs --out _publish` (run by `publish-site.mjs` after the route stubs).

```
life-topics.json · life-data.js · life-events-data.js · help-data.js
   → loadSources()      curated files only, through the same loader the tests use
   → buildManifest()    pages, titles, descriptions, index policy, exclusions
   → renderPages()      complete HTML
   → _publish/livon/…/index.html · _publish/livon/seo-manifest.json · _publish/sitemap.xml (LIVON block)
```

- No sentence is written for SEO: page text is the curated topic, Life Event and Help content.
- Deterministic: the same sources give byte-identical output. No build date is used.
- Generated files are not committed; they exist in `_publish` only.
- The generator reads no browser storage, no visitor profile, no community store and nothing from the Admin.

## Manifest

`/livon/seo-manifest.json`: `{ version, site, indexing, pages[], excluded[], excludedAreas[] }`.
Each page: `type, sourceId, slug, path, url, title, description, canonical, h1, breadcrumbs[], index, lastmod`.
Each excluded item: `type, sourceId, reason, where` (where the content can be found instead).

## Life Stage strategy

Seven pages (`10s` … `70s`): H1 `20대 · 독립과 도전`, the stage's own intro, the eight featured topics with their
descriptions, every topic of the band by category, the band's Life Events, the official portals its topics refer to,
the other bands, and a link into the app (`/livon/#life/20s`).

## Topic strategy

228 topics exist. A topic gets its own indexable page only when it is one of the eight featured topics of its band
**and** has ≥ 2 knowledge notes, ≥ 3 guide steps, ≥ 3 checklist items, ≥ 2 real relations and ≥ 250 characters of own
text: 56 pages. The other 172 are grouped: named on their stage page and linked into the app; their existing redirect
stubs stay `noindex`. Nine topics fail the content rule on relations and could not be pages even if featured.

A topic page shows: what to know, the step-by-step guide, the checklist, official information (provider, summary,
date checked, link marked as an external official site), related LIVON records, related topics and Life Events.

## Life Event strategy

34 events. A page is generated when the event has ≥ 3 related topics (through the Data Platform relation the app
uses), a checklist and a description: 20 pages. Ten events with one or two topics are listed on the overview without a
page. 프리랜서, 차량 구매, 해외생활 and 장기여행 have no guide yet: no page, not indexed, named on the overview under
"안내를 준비 중인 Life Event".

## Help strategy

`help-data.js` is the single source for both the interactive Help (`#help/…`) and the static pages.
`seoIndexable` lists 39 articles (INDEXABLE_HELP); the remaining 29 explain a button or a state inside the app and stay
INTERNAL_HELP_ONLY. A static article links to "LIVON 도움말에서 보기" (`/livon/#help/a/{id}`); search, troubleshooting
lists and service status remain in the app. The interactive Help and its routing (`help-page.js`) are unchanged.

## Community policy

Local posts, comments, drafts, reports and the display name are private data in one browser: the generator has no
access to them and no page can be produced from them. Curated community data is group and challenge names only — too
thin to index. No community page exists in the build and none is in the sitemap.

## Canonical

Every static page is canonical to itself on `https://www.newon.app` (https, www, trailing slash). Hash routes are not
URLs for a crawler, so the app and a static page do not compete: the static page is the indexable version of the
content, the app route is where the user works with it. Search and filter states are never pages.

## Metadata

- Title rules: `LIVON | 생애주기 생활 정보` · `20대 라이프 스테이지: 독립과 도전 | LIVON` · `첫 취업 준비 · 20대 | LIVON` ·
  `첫 취업 · Life Event | LIVON` · `LIVON 도움말` · `{질문} | LIVON 도움말`. All unique, ≤ 60 characters.
- Descriptions: unique, 40–160 characters, taken from the source (stage intro, topic description + first note, Life
  Event description, Help short answer).
- Open Graph: `og:type` (website / article), title, description, url, site_name, locale, image.
  Image: `/assets/livon-mark.jpg` (exists, 1024×1024). Social card: `summary`.
- Brand: titles use `LIVON`, as the product copy does; the logo wordmark reads `LivOn`.

## Structured data

One JSON-LD block per page (`application/ld+json`, data only):

| Type | Where |
| --- | --- |
| `WebSite` (publisher: Newon) | `/livon/` only |
| `WebPage` | every page |
| `BreadcrumbList` | every static page; equal to the visible breadcrumb |
| `FAQPage` | `/livon/help/` only — the 39 questions and short answers shown on that page |

No `Article`, `Organization` page, `Product`, `Review`, `HowTo` or rating markup: there is no author, date or review
to describe, and schema is not used to chase rich results.

## Sitemap

`sitemap.xml` in the repository is unchanged. At build time the generator adds one marked block with the 126 indexable
LIVON URLs to `_publish/sitemap.xml` (idempotent). `lastmod` is written only for Life Stage pages, from
`life-topics.json` `updatedAt`; Life Event and Help pages have no source date and get none. No hash, query, Today,
community, My Life, Admin or search URL is included.

## Robots

`robots.txt` is unchanged: sitemap declared, `/admin/` disallowed. The Admin and the Data Manager are protected by not
being published, not by robots.

## Internal links

- `/ko/` → `/livon/` (existing).
- `/livon/` → static pages: one line of real links at the end of Home, and a `<noscript>` navigation.
- Static pages → each other: header and footer navigation, breadcrumbs, stage ↔ topic ↔ Life Event ↔ Help.
- Static pages → app: every page has a button into the matching app route.
- No orphan: every indexable page is linked from another indexable static page. No hidden or `nofollow` link.
  Official links are labelled "(공식 사이트, 새 창)".

## Multilingual readiness

LIVON content is Korean only (`lang="ko"`). No translated LIVON page exists under any locale, so no `hreflang` and no
`x-default` is declared. When a translation exists, add its pages to the manifest with a `lang` field and emit
reciprocal `hreflang` for those pairs only.

## GitHub Pages

Production is `_publish` served from `gh-pages`. Pages are plain files; unknown URLs get the root `404.html` with a
404 status, so a wrong static URL is not a soft 404. No server rule is needed. `vercel.json`, `_redirects` and
`netlify.toml` are untouched.

## CSP

`vercel.json` is unchanged. Static pages carry no executable inline script and load no script file. JSON-LD blocks are
data blocks, not scripts to execute. In `/livon/index.html` only `<head>` metadata, a `<noscript>` block and one
paragraph were added; its four inline scripts are byte-identical, so their CSP hashes still match (tested).

## Quality checks

`node scripts/livon-seo-quality.mjs --root _publish` (part of the build; exit 1 on any error):
missing / duplicate title · missing / duplicate / out-of-range description · missing or multiple H1 · skipped heading
level · canonical mismatch · robots vs. policy · `lang` · unexpected `hreflang` · Open Graph and social card vs. the
manifest · missing OG image · inline or application script · JSON-LD parse, WebPage, BreadcrumbList vs. visible trail,
FAQ text visible · broken internal link · non-https external link (format only — nothing is fetched) · thin content ·
orphan page · duplicate or unsafe slug · manifest ⇄ files ⇄ sitemap · sitemap `lastmod` without a source date ·
excluded areas present · intent targets.

Thin content is judged on four things together: own text (≥ 280 characters in `<main>`), ≥ 3 internal links, at
least one list, and a link into the app.

Search intents: 44 intents are mapped to one landing page each (`INTENTS`). It is a mapping of who answers what, not a
prediction of position.

## Deployment notes

Not done in this phase. When a deployment is approved:

1. Decide the launch: deploying with indexing ON opens LIVON to search. To deploy while staying closed, build with
   `LIVON_SEO_INDEX=off`.
2. Confirm what the production build injects: `LIVON_API_ORIGIN` (LIVON AI) and the Newon+ Firebase variables change
   what the Help articles should say about AI and accounts.
3. After deploy, fetch a few URLs and check the status code, `robots` meta and canonical
   (`/livon/`, `/livon/life/20s/`, `/livon/help/no-signup/`, an unknown URL → 404).
4. Google Search Console / Naver Search Advisor (the property already exists for the Newon site): submit
   `https://www.newon.app/sitemap.xml` again, then URL-inspect the pages above.
5. Validate structured data with the Rich Results Test and the Schema Markup Validator (`/livon/help/` for FAQPage,
   one topic page for BreadcrumbList).
6. Watch coverage for "Duplicate without user-selected canonical" and "Crawled – currently not indexed" on topic
   pages; if they appear, tighten `POLICY.topic`.
7. External official links were checked for format only in this environment. Run a live link check before launch.
8. If the inline router is ever changed (see the Help notes), update the CSP hashes in `vercel.json`.
